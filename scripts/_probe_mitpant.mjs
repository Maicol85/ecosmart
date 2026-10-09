#!/usr/bin/env node
/**
 * _probe_mitpant.mjs — sonda A/B de SOLO LECTURA para la tanda de la PANTALLA de la mitral
 * (2026-10-09). No muta index.html: comprueba su md5 al principio y al final.
 *
 *   LEC — lectura previa: por cada campo de los bloques de estenosis y de insuficiencia, id,
 *         rotulo literal, tipo, readonly, oninput y visibilidad. Mas las filas del cuadro de
 *         referencias de la insuficiencia EN ORDEN DE DOM.
 *   MOV — 1200, 390 y 360 px: desborde y barra horizontal, global y por bloque.
 *   TAB — el orden de tabulacion REAL, con la tecla Tab de verdad, desde el primer campo del
 *         bloque: es la unica forma de probar «baja por cada columna».
 *   THP — gestos con teclas reales en los DOS lugares del THP (Valvulas y Doppler mitral),
 *         dentro y fuera de banda, mas el borrado y el estudio guardado.
 *   PISA — la EROA por PISA, el Vol-R y la FR con el MISMO dato fisico, para el cambio de unidad
 *         de la Vmax IM.
 *   CORT — barrido de los bordes de los cortes de IM (VC, jet/AI, EROA, Vol-R, FR).
 *   SUP — las cuatro superficies: informe (3 estilos), EN SUMA, Excel y campos guardados.
 *
 *   node scripts/_probe_mitpant.mjs --file /tmp/index.HEAD.html > /tmp/mp.HEAD.json
 *   node scripts/_probe_mitpant.mjs                            > /tmp/mp.NEW.json
 *   node scripts/_probe_mitpant.mjs --solo MOV --ver
 *
 * Infraestructura (servidor + Chrome + CDP + cierre del arbol de procesos + teclas reales)
 * calcada de scripts/_probe_mitcoord.mjs.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/* ⚠️ EL ARBOL DE CHROME NO SE CIERRA CON `proc.kill()`, Y ASI SE JUNTARON 70 PROCESOS (2026-10-08).
   `proc.kill()` manda SIGTERM al proceso que lanzamos; Chrome arranca media docena de hijos
   (zygote, gpu, renderers) que NO son hijos nuestros, asi que sobreviven al padre y quedan
   HUERFANOS (ppid = 1) reteniendo su perfil. El camino de FALLO era peor: el
   `main().catch(... process.exit(1))` de las sondas no mataba nada, y el timeout de 20 s de
   `abrirChrome` tampoco. Medido antes de este arreglo: 10 Chrome huerfanos con 60 hijos y 1075
   perfiles temporales sin borrar, 2,9 GB en $TMPDIR.
   Tres piezas, ninguna decorativa:
     1. `detached: true` en el spawn, que hace a Chrome LIDER DE SU PROPIO GRUPO de procesos. Sin
        eso, matar un grupo se llevaria al script mismo;
     2. un barrido que mata el GRUPO (`process.kill(-pid)`) y no solo al padre, asi que alcanza a
        los hijos que Chrome creo por su cuenta;
     3. el barrido colgado de `exit` ADEMAS de las senales, porque el `process.exit(1)` del camino
        de fallo y el `process.exit(0)` del camino feliz NO disparan SIGINT ni SIGTERM — pero si
        disparan `exit`. De ahi que el borrado del perfil use `rmSync`: en `exit` ya no corre nada
        asincrono, y un `await rm(...)` ahi se descarta en silencio.
   ⚠️ SOLO PIDs PROPIOS, NUNCA POR NOMBRE. El registro guarda unicamente lo que lanzo ESTE
   proceso. Un `pkill`/`killall` por patron se lleva el Chrome del usuario y la corrida del de al
   lado — en este repo ya hay una leccion escrita sobre un `pkill` que mato la corrida en curso. */
const _ARNES_VIVOS = new Set();
let _arnesLimpiezaArmada = false;
function _arnesCerrarAlSalir(proc, perfil) {
  if (!proc || !proc.pid) return;
  _ARNES_VIVOS.add({ pid: proc.pid, perfil: perfil });
  if (_arnesLimpiezaArmada) return;
  _arnesLimpiezaArmada = true;
  const barrer = () => {
    for (const v of _ARNES_VIVOS) {
      /* El grupo primero. Si ya no existe, `kill` tira ESRCH y se ignora — el barrido es
         idempotente a proposito, porque los cierres del camino feliz ya llamaron a `proc.kill()`
         antes de llegar aca. El fallback al pid pelado cubre que `detached` no haya podido crear
         el grupo. */
      try { process.kill(-v.pid, 'SIGKILL'); }
      catch (e) { try { process.kill(v.pid, 'SIGKILL'); } catch (e2) {} }
      if (v.perfil) { try { rmSync(v.perfil, { recursive: true, force: true }); } catch (e) {} }
    }
    _ARNES_VIVOS.clear();
  };
  process.on('exit', barrer);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(sig, () => { barrer(); process.exit(130); });
  }
}


const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const arg  = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const FARG = arg('--file') || 'index.html';
const EXTERNO = isAbsolute(FARG);
const FILE = EXTERNO ? '__ab__' + basename(FARG) : FARG;
const SOLO = arg('--solo');

const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml' };

function servir() {
  return new Promise((res) => {
    const srv = createServer(async (req, rq) => {
      try {
        const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || FILE;
        const p = (EXTERNO && rel === FILE) ? FARG : join(RAIZ, rel);
        if (!EXTERNO && !p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}
async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-ap-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                '--window-size=1400,1000', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'], detached: true });
  _arnesCerrarAlSalir(proc, perfil);
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome no respondio en 20 s')), 20000);
    let acc = '';
    proc.stderr.on('data', (d) => {
      acc += d.toString();
      const m = acc.match(/ws:\/\/[^\s]+/);
      if (m) { clearTimeout(t); res(m[0]); }
    });
  });
  return { proc, perfil, wsUrl };
}
function conectar(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0; const pend = new Map(); let api = null;
    ws.addEventListener('open', () => { api = {
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }; res(api); });
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Page.javascriptDialogOpening' && api && api.alDialogo) {
        try { api.alDialogo({ tipo: m.params?.type, mensaje: m.params?.message }); } catch (x) {}
      }
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}
async function md5(p) { return createHash('md5').update(await readFile(p)).digest('hex'); }


/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim().replace(/\\s+/g,' ') : null },
  ro(id)  { var e = document.getElementById(id); return e ? !!e.readOnly : null },
  oninput(id){ var e = document.getElementById(id); return e ? (e.getAttribute('oninput')||'') : null },
  existe(id) { return !!document.getElementById(id) },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  /* El rotulo literal del campo: el <label> hermano dentro del .fg. Se devuelve TAL CUAL se lee,
     con los espacios colapsados, porque la tanda cambia rotulos y la tabla del reporte sale de
     aca y no de una redaccion mia. */
  lbl(id) { var e = document.getElementById(id); if (!e) return null;
    var p = e.closest ? e.closest('.fg') : null;
    var l = p ? p.querySelector('label') : (e.parentNode ? e.parentNode.querySelector('label') : null);
    return l ? l.textContent.trim().replace(/\\s+/g,' ') : null },

  /* ══ CENSO DE UN BLOQUE, EN ORDEN DE DOM. Es lo que hace comparable un A/B de maquetacion: si
     un campo cambia de id, de tipo, de readonly o de oninput, sale aca. El orden de la lista ES
     el orden del DOM, que es el que gobierna la tabulacion. */
  censo(cont) {
    var c = document.getElementById(cont); if (!c) return { err: 'NO EXISTE ' + cont };
    var out = [];
    Array.from(c.querySelectorAll('input,select,textarea')).forEach(function(e){
      if (!e.id) return;
      out.push({ id: e.id, tag: e.tagName.toLowerCase(), tipo: (e.getAttribute('type')||''),
                 ro: !!e.readOnly, oninput: (e.getAttribute('oninput')||''),
                 onchange: (e.getAttribute('onchange')||''),
                 step: (e.getAttribute('step')||''), ph: (e.getAttribute('placeholder')||''),
                 tabindex: (e.getAttribute('tabindex')||''),
                 lbl: window.__P.lbl(e.id), vis: window.__P.vis(e.id) });
    });
    return out },

  /* Las filas del cuadro de referencias, en orden de DOM: rotulo literal y el id del span del
     valor. El ORDEN es el objeto del commit D, asi que se mide y no se describe. */
  filasRef(cont) {
    var c = document.getElementById(cont); if (!c) return { err: 'NO EXISTE ' + cont };
    var box = c.querySelector('.calc-box'); if (!box) return { err: 'SIN calc-box en ' + cont };
    return Array.from(box.querySelectorAll('.calc-row')).map(function(r){
      var l = r.querySelector('.calc-lbl');
      var v = Array.from(r.querySelectorAll('span[id]')).filter(function(s){
        return !s.classList.contains('calc-lbl') });
      return { lbl: l ? l.textContent.trim().replace(/\\s+/g,' ') : '',
               ids: v.map(function(s){ return s.id }).join(','),
               val: v.map(function(s){ return (s.textContent||'').trim().replace(/\\s+/g,' ') }).join(' | ') };
    }) },

  /* Los sub-encabezados del bloque, en orden: son los rotulos de seccion que la maquetacion
     puede dejar huerfanos. */
  heads(cont) {
    var c = document.getElementById(cont); if (!c) return null;
    return Array.from(c.children).concat(Array.from(c.querySelectorAll('div')))
      .filter(function(d){ return d.children.length === 0 && /^[^<]*[A-Za-z]/.test(d.textContent||'') &&
        (d.textContent||'').trim().length > 2 && (d.textContent||'').trim().length < 90 &&
        /font-weight:700/.test(d.getAttribute('style')||'') })
      .map(function(d){ return (d.textContent||'').trim().replace(/\\s+/g,' ') })
      .filter(function(t,i,a){ return a.indexOf(t) === i }) },

  desborde() {
    var d = document.documentElement;
    return { scrollW: d.scrollWidth, clientW: d.clientWidth, hayBarra: d.scrollWidth > d.clientWidth + 1 } },
  desbordeDe(id) {
    var e = document.getElementById(id); if (!e) return null;
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             scrollW: e.scrollWidth, clientW: e.clientWidth,
             desborda: e.scrollWidth > e.clientWidth + 1,
             fuera: Math.round(r.right) > document.documentElement.clientWidth + 1,
             izq: Math.round(r.left) } },

  /* Cuantas COLUMNAS pinta la grilla ahora mismo. Es la unica forma de distinguir «apilado» de
     «tres columnas apretadas»: el numero de pistas lo dice el estilo computado, no el ancho. */
  cols(sel) {
    var e = document.querySelector(sel); if (!e) return null;
    var t = getComputedStyle(e).gridTemplateColumns || '';
    return { pistas: t === 'none' ? 0 : t.split(/\\s+/).filter(Boolean).length, tpl: t } },

  /* Abre lo que haga falta para que el campo tenga geometria. Calcado de auditoria_botones.mjs. */
  revelar(id) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var abrio = [];
    for (var pase = 0; pase < 6; pase++) {
      var oculto = null, n = e;
      while (n && n.nodeType === 1) {
        if (getComputedStyle(n).display === 'none') { oculto = n; }
        n = n.parentNode;
      }
      if (!oculto) break;
      var oid = oculto.id || '';
      if (oid.indexOf('tab-') === 0) {
        try { showTab(oid.slice(4)); abrio.push(oid) } catch(x) { return { err: 'showTab ' + oid, abrio: abrio } }
      } else if (oid.indexOf('ete-seccion-') === 0) {
        try { toggleEteSeccion(oid.replace('ete-seccion-','')); abrio.push(oid) } catch(x) { return { err: 'toggleEteSeccion ' + oid, abrio: abrio } }
      } else {
        var ctrl = null;
        if (oid) {
          var cand = Array.from(document.querySelectorAll('[onclick]')).find(function(b){
            return (b.getAttribute('onclick')||'').indexOf("'" + oid + "'") >= 0 });
          if (cand) { if (!cand.id) cand.id = '__prv_' + oid; ctrl = cand.id }
        }
        if (!ctrl) return { err: 'oculto por ' + (oid ? ('#' + oid) : ('.' + String(oculto.className||'?'))), abrio: abrio };
        return { necesitaClic: ctrl, abrio: abrio };
      }
    }
    return { ok: true, abrio: abrio } },

  centro(id) { var e = document.getElementById(id); if (!e) return null;
    e.scrollIntoView({ block:'center', inline:'center' });
    var r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'nodo sin geometria' };
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) } },

  quienEsta(id, x, y) {
    var t = document.getElementById(id);
    var e = document.elementFromPoint(x, y);
    if (!e) return { enPunto: null, esElBlanco: false };
    return { enPunto: (e.id || ('<' + e.tagName.toLowerCase() + ' ' + String(e.className || '') + '>')),
             esElBlanco: !!(t && (e === t || t.contains(e) || e.contains(t))) } },

  /* ══ DENOMINADOR. Abre Valvulas, la tarjeta mitral y LAS DOS pastillas de la mitral, y CONFIRMA
     que los campos que esta tanda toca tienen geometria. Una sonda sobre un arbol cerrado tipea
     en la nada, el campo queda vacio y todo sale «sin cambios». */
  abrirTodo() {
    try { showTab('valvulas') } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    ['mitral'].forEach(function(v){ ['esten','insuf'].forEach(function(t){
      var p = document.getElementById('pill-' + t + '-' + v);
      if (p && !p.classList.contains('btn-primary')) { try { toggleValvPill(v,t) } catch(e){} }
    })});
    var det = document.getElementById('bloque-em-detalle');
    if (det) det.style.display = 'block';
    var CAMPOS = ['em_vmax','em_gmax','em_gmedio','em_thp_display','em_avm_thp_display','avm_plan',
                  'avm_idx','em_dtsvi','em_vtitsvi','em_vtimit','avm_cont',
                  'im_vc','im_jet_area','im_ai_area','im_onda_s','pisa_r','pisa_val','im_vmax',
                  'im_itv','diam_mit','vtim','im_dtsvi','im_itv_tsvi',
                  'im_eroa_cont','vr_cont','im_fr_cont','vm_lat'];
    var sinGeo = CAMPOS.filter(function(id){ return window.__P.vis(id) !== true });
    return { tab: window.__P.vis('tab-valvulas'), sinGeo: sinGeo, ok: sinGeo.length === 0,
             pillEM: window.__P.pill('mitral','esten'), pillIM: window.__P.pill('mitral','insuf') } },

  limpiar() {
    try { limpiarCampos(true) } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v) } catch(e){}
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t) } catch(e){}
      });
    });
    try { if (window.VALV_ESTEN_AUTO) window.VALV_ESTEN_AUTO.clear() } catch(e) {}
    try { if (window.VALV_INSUF_AUTO) window.VALV_INSUF_AUTO.clear() } catch(e) {}
    return 1 },

  /* SOLO para armar un escenario base o un control negativo: NO es un gesto medido. Los gestos
     medidos van con teclas reales desde el lado node. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* SIN EVENTOS: es exactamente lo que hace el barrido de restauracion de un estudio guardado. */
  setRaw(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    return { id: id, leido: e.value } },

  sembrar(obj) {
    var r = {};
    Object.keys(obj).forEach(function(k){ r[k] = window.__P.set(k, obj[k]) });
    try { if (typeof calcEM === 'function') calcEM() } catch(e){}
    try { if (typeof calcTHP === 'function') calcTHP() } catch(e){}
    try { if (typeof calcContIM === 'function') calcContIM() } catch(e){}
    try { if (typeof calcIM_ESC === 'function') calcIM_ESC() } catch(e){}
    return r },

  /* ══ LO QUE MIRA CADA ESCENA DEL THP: los dos campos, los dos avisos, el area derivada y la
     fila. el barrido de avisos barre CUALQUIER nodo cercano que diga «revisar», para no preguntar por un id
     que todavia no existe y leer null como «no hay marca». */
  thpFoto() {
    var cercaDe = function(id){
      var e = document.getElementById(id); if (!e) return null;
      var p = e.closest ? e.closest('.fg') : null; if (!p) p = e.parentNode;
      var t = p ? (p.textContent||'') : '';
      var sig = p && p.nextElementSibling ? (p.nextElementSibling.textContent||'') : '';
      return { enFg: /revisar/i.test(t), enSiguiente: /revisar/i.test(sig),
               txtFg: t.trim().replace(/\\s+/g,' ').slice(0,120) } };
    return { thp: window.__P.val('thp'), disp: window.__P.val('em_thp_display'),
             avmThp: window.__P.val('avm_thp'), avmDisp: window.__P.val('em_avm_thp_display'),
             fila: window.__P.txt('em-thp-row'), avmIdx: window.__P.val('avm_idx'),
             cat: window.__P.txt('em-sev-integrada'), badge: window.__P.txt('em-thp-badge'),
             marcaValv: cercaDe('em_thp_display'), marcaDop: cercaDe('thp') } },

  /* Los tres resultados de PISA y el grado: es lo que no puede moverse con el cambio de unidad. */
  pisaFoto() {
    return { eroa: window.__P.txt('eroa-val'), volr: window.__P.txt('volr-val'),
             vsv: window.__P.txt('vsvtsvi-val'), fr: window.__P.txt('freg-val'),
             jet: window.__P.txt('im-jet-ratio'), sev: window.__P.txt('im-sev'),
             grado: window.__P.val('im_grado'), disc: window.__P.txt('im-discordancia'),
             eroaCont: window.__P.val('im_eroa_cont'), vrCont: window.__P.val('vr_cont'),
             frCont: window.__P.val('im_fr_cont'), vmLat: window.__P.val('vm_lat'),
             vtiRatio: window.__P.txt('im-vti-ratio'), ondaE: window.__P.txt('im-ondae-interp'),
             ondaS: window.__P.txt('im-onda-s-interp') } },

  /* ══ LAS CUATRO SUPERFICIES, UNA POR UNA. Nunca en bloque: cada una tiene su emisor. */
  informe(estilo) {
    try { if (estilo && typeof setEstiloInforme === 'function') setEstiloInforme(estilo) } catch(e){}
    try { generarInforme() } catch(e) { return 'EXC ' + e.message }
    var t = document.getElementById('informe_texto');
    return t ? String(t.value || t.textContent || '') : 'SIN NODO' },
  /* ⚠️ EL EN SUMA ES SU PROPIO NODO (#en_suma) Y NO UN TROZO DE #informe_texto. La primera
     version de esta sonda lo buscaba con una expresion regular dentro del informe y devolvia
     siempre «(sin EN SUMA)»: una superficie que parecia comparada y no se estaba mirando. */
  enSuma() {
    try { generarInforme() } catch(e) { return 'EXC ' + e.message }
    var t = document.getElementById('en_suma');
    return t ? String(t.value || t.textContent || '') : 'SIN NODO' },
  excel() {
    try {
      var r = _labExcelRow ? _labExcelRow(window.__P.camposActuales()) : null;
      if (!r) return { err: 'sin fila' };
      return { n: Object.keys(r).length, fila: r };
    } catch(e) { return { err: 'EXC ' + e.message } } },

  /* Los campos del formulario como los ve el guardado: el mismo barrido, sin tocar el disco. */
  camposActuales() {
    var c = {};
    Array.from(document.querySelectorAll('input[id],select[id],textarea[id]')).forEach(function(e){
      if (e.type === 'checkbox' || e.type === 'radio') { c[e.id] = e.checked ? '1' : ''; return }
      c[e.id] = e.value;
    });
    return c },

  /* GUARDAR de verdad: guardarInforme toma un callback, el guardado es ASINCRONO (IndexedDB con
     respaldo en localStorage) y puede aparecer la card de severidades, que hay que CONFIRMAR con
     su propio boton. Calcado del arnes de la suite, incluido el _ettEditandoId = null que evita
     el modal de «sobreescribir / guardar como nuevo». La clave del estudio es estudioId. */
  guardar() {
    window._ettEditandoId = null;
    var antes = new Set(getInformes().map(function(i){ return i.estudioId }));
    return new Promise(function(resolve){
      var alTerminar = function(ok){
        var nuevo = getInformes().find(function(i){ return !antes.has(i.estudioId) });
        resolve({ ok: ok === true, estudioId: nuevo ? nuevo.estudioId : null });
      };
      try { guardarInforme(alTerminar) } catch(e) { resolve({ ok:false, error:String(e) }); return }
      /* ⚠️ LA CARD DE SEVERIDADES SE PINTA Y EL BOTON NO EXISTE TODAVIA EN ESE TICK. guardarInforme
         sale con return false y el guardado REAL ocurre al confirmar la card, asi que un
         un getElementById de rev-confirm con .click() sincrono no encuentra nada y el callback no se
         llama NUNCA: medido, la escena informo ok=null y estudioId=null dos veces. Se espera el
         boton con reintentos y, si no aparece, se resuelve con el motivo en vez de colgarse. */
      var intentos = 0;
      var buscar = function(){
        var cf = document.getElementById('rev-confirm');
        if (cf) { cf.click(); return }
        if (++intentos > 40) { resolve({ ok:false, error:'nunca aparecio #rev-confirm' }); return }
        setTimeout(buscar, 50);
      };
      setTimeout(buscar, 50);
    }) },
  reabrir(estudioId) { try { cargarEstudioPorId(estudioId); return 'ok' }
    catch(e) { return 'EXC: ' + e.message } },
  editar(estudioId) { try { editarInforme(estudioId); return 'ok' }
    catch(e) { return 'EXC: ' + e.message } },
  borrarEstudio(estudioId) {
    if (!estudioId) return Promise.resolve(false);
    return CeiboStore.setLocal(getInformes().filter(function(i){ return i.estudioId !== estudioId })) },
  /* Lo que el estudio tiene EN DISCO para esas dos claves. Es la unica forma de probar que no se
     reescribio nada: el migrador corre en memoria. */
  enDisco(estudioId) {
    var i = getInformes().find(function(x){ return x.estudioId === estudioId });
    if (!i) return { err: 'SIN ESTUDIO' };
    var c = i.campos || {};
    return { thp: c['thp'], em_thp_display: c['em_thp_display'] } },
  /* El migrador, llamado DIRECTO sobre un objeto con la forma de un guardado viejo. */
  migrar(obj) {
    if (typeof _migrarCamposLegacy !== 'function') return 'SIN _migrarCamposLegacy';
    var c = JSON.parse(JSON.stringify(obj));
    try { _migrarCamposLegacy(c) } catch(e) { return 'EXC ' + e.message }
    return c },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleValvPill','showTab','limpiarCampos','calcEM',
                  'emCategoria','setEstiloInforme','calcContIM','calcIM_ESC','calcTHP',
                  'guardarInforme','editarInforme','getInformes','_labExcelRow','vPlaus']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('em_thp_display')) return { listo:false, por:'sin em_thp_display' };
    return { listo:true } }
};
1;
`;
async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  /* ⚠️ UN `alert`/`confirm` NATIVO BLOQUEA `Runtime.evaluate` Y LA SONDA PARECE COLGADA. Con el
     dominio Page habilitado, CDP avisa del dialogo y hay que CONTESTARLO; sin habilitarlo, Chrome
     lo muestra y el renderer se detiene. Se descartan y se CUENTAN, porque un dialogo inesperado
     en medio de una escena es un hallazgo, no ruido. */
  await cdp.send('Page.enable', {}, sessionId);
  const dialogos = [];
  cdp.alDialogo = (d) => { dialogos.push(d);
    cdp.send('Page.handleJavaScriptDialog', { accept: true }, sessionId).catch(() => {}); };
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  await pausa(2200);

  /* ⚠️ `ev()` SIN RELOJ CUELGA PARA SIEMPRE, Y ESTA SONDA LO HIZO DOS VECES (2026-10-08). Si la
     pagina navega, el target muere o Chrome se va, la promesa de `cdp.send` no se resuelve NUNCA:
     ni error ni salida, el proceso vivo y el archivo de salida vacio a los diez minutos. Es la
     trampa de los `cdp.mjs` que no salen que CLAUDE.md documenta, con otra cara. Con reloj, un
     cuelgue se convierte en un fallo que DICE en que paso ocurrio. */
  const RELOJ = 75000;
  let _paso = '(arranque)';
  const paso = (n) => { _paso = n; if (VER || process.env.EMAUTO_TRAZA) console.error('  · ' + n); };
  async function ev(expr) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate',
        { expression: expr, returnByValue: true, awaitPromise: true }, sessionId),
      new Promise((_, no) => setTimeout(() => no(new Error(
        'CDP sin respuesta en ' + (RELOJ / 1000) + ' s — paso «' + _paso + '»')), RELOJ)),
    ]);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " :: " + (r.exceptionDetails.exception || {}).description + " :: EXPR=" + String(expr).slice(0,400));
    return r.result.value;
  }
  /* ⚠️ UN CLIC DISPACHADO NO ES UN CLIC RECIBIDO, Y LA PRIMERA CORRIDA LO INFORMO COMO OK. Las
     coordenadas del centro de la pastilla caian sobre OTRO nodo —el `.valv-lesion` que la envuelve
     y la tapa— asi que los eventos llegaban, el boton no se movia, y las escenas 4, 5 y 8 median
     «no se apaga» sobre un gesto que nunca ocurrio: el defecto correcto por la razon equivocada,
     indistinguible de un hallazgo falso. Por eso se pregunta `elementFromPoint` ANTES y, si el
     punto esta tapado, se activa con TECLA REAL (foco + Enter), que en un <button> es una
     activacion nativa y no un `.click()` sintetico. */
  /* ⚠️ SIN `revelar` RECURSIVO ACA, Y ES POR MEDICION: la version con el bucle de `revelar` se
     llamaba a si misma sobre el control que hay que abrir, y ese control podia volver a pedir otro
     —o volver a cerrar el mismo, porque es un TOGGLE— asi que la recursion no tenia tope real y la
     corrida se colgo (dos procesos a los 10 minutos, sin una sola escena escrita). Los nodos que
     esta sonda clickea ya estan a la vista: `abrirTodo` lo confirma y ABORTA si no. Si uno no tiene
     geometria, se informa y no se inventa un camino. */
  async function clicEn(id) {
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    const q = await ev(`JSON.stringify(window.__P.quienEsta(${JSON.stringify(id)}, ${c.x}, ${c.y}))`);
    const quien = JSON.parse(q);
    if (quien.esElBlanco) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await pausa(140);
      return { via: 'mouse', punto: c, quien };
    }
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)}); if (e) e.focus(); return 1 })()`);
    const foco = await ev(`(document.activeElement && document.activeElement.id) || '<' + (document.activeElement ? document.activeElement.tagName.toLowerCase() : '?') + '>'`);
    await tecla('Enter', null);
    await pausa(140);
    return { via: 'tecla Enter', punto: c, quien, foco };
  }
  /* ══ TECLAS REALES ══ una por caracter, con el `text` SOLO en el `char`. */
  /* ⚠️ DOS CAMPOS DE ESTA TANDA NO TIENEN GEOMETRIA Y NUNCA LA VAN A TENER, y el bucle de
     `revelar` + `clicEn` COLGO la primera corrida en ellos (CDP sin respuesta a los 75 s, en
     «cargar diam_tsvi_ao borrar diam_tsvi»): `diam_tsvi` vive en un `.fg` con `display:none` que
     ningun control abre, y el campo del area por ETE queda igual despues del commit A. `revelar`
     devolvia `necesitaClic` sobre un nodo que no lo resuelve y la vuelta siguiente volvia a pedir
     lo mismo — un toggle que se cierra solo.
     Con un campo SIN geometria el foco va por DOM y SE INFORMA ('foco-dom'), porque las teclas que
     vienen detras son reales igual: lo que no es real es el CLIC, y el informe tiene que decir en
     cual de las dos formas se enfoco. Tope DURO de dos vueltas, y el `clicEn` solo si el nodo
     pedido es distinto del anterior. */
  const SIN_GEOMETRIA = ['diam_tsvi', 'avm_ete'];
  async function enfocar(id) {
    if (SIN_GEOMETRIA.indexOf(id) === -1) {
      let rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
      let previo = null;
      for (let i = 0; i < 2 && rev && rev.necesitaClic && rev.necesitaClic !== previo; i++) {
        previo = rev.necesitaClic;
        await clicEn(rev.necesitaClic);
        rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
      }
      const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
      if (c && !c.err) {
        await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
        await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
        return 'clic';
      }
      await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
      return 'foco-dom (' + (c ? c.err : 'no existe') + ')';
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    return 'foco-dom (campo sin geometria por diseno)';
  }
  /* ⚠️ UNA TECLA DE EDICION NO ES UN CARACTER, Y SIN `windowsVirtualKeyCode` NO BORRA NADA.
     La primera corrida mando `{type:'keyDown', key:'Backspace'}` pelado: los eventos llegaban, el
     campo NO cambiaba, y la sonda informo «borrar la Vmax deja el G. max en 64» sobre un campo que
     seguia diciendo 4 — o sea el defecto correcto por la razon equivocada, que es indistinguible de
     un hallazgo falso. Blink ejecuta el comando de edicion por el keycode, no por `key`, y hace
     falta `rawKeyDown` (un `keyDown` sin `char` detras no dispara el comando). */
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, End: 35, Home: 36 };
  async function tecla(k, text) {
    if (text) {
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'char', text, unmodifiedText: text, key: k }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k }, sessionId);
      return;
    }
    const vk = VK[k] || 0;
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k,
      windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k,
      windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }, sessionId);
  }
  /* Tipea DESDE VACIO (select() para que la primera tecla pise lo que hubiera). */
  /* ⚠️ EL FOCO SE COMPRUEBA ANTES DE MANDAR UNA SOLA TECLA, Y SIN ESO LA SONDA MIDIO OTRO CAMPO.
     `.focus()` sobre un nodo con `display:none` NO MUEVE EL FOCO —un elemento no renderizado no es
     focusable— asi que el foco se quedaba donde estaba: en el campo de la escena ANTERIOR. Medido
     en la primera corrida de C: la escena «tipear em_dtsvi con el bloque plegado» informo
     ['22','22','22','',''], que parecia coordinacion existente, y lo que habia pasado es que las
     dos teclas entraron a `ea_dtsvi`, que seguia enfocado de la escena de antes. El defecto
     correcto por la razon equivocada, indistinguible de un hallazgo.
     Dos piezas: se BORRA el foco previo antes de enfocar, y si el foco no quedo en el campo pedido
     NO se manda ninguna tecla y se devuelve `sinFoco`. Un campo que no se puede enfocar no se puede
     tipear, y eso es un HECHO sobre la app —`diam_tsvi` esta oculto por diseno— no un fallo de la
     sonda: se informa y no se inventa un tecleo. */
  async function tipear(id, valor) {
    await ev(`(function(){ try { if (document.activeElement && document.activeElement.blur)
      document.activeElement.blur() } catch(e){} return 1 })()`);
    const via = await enfocar(id);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    const foco = await ev(`(document.activeElement && document.activeElement.id) || '<' +
      (document.activeElement ? document.activeElement.tagName.toLowerCase() : '?') + '>'`);
    if (foco !== id) {
      return { via, pedido: String(valor), quedo: await ev(`window.__P.val(${JSON.stringify(id)})`),
               ok: false, sinFoco: true, focoEn: foco };
    }
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(90);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    return { via, pedido: String(valor), quedo: String(quedo),
             ok: String(quedo) === String(valor) };
  }
  /* BORRA CON BACKSPACE, digito por digito, leyendo despues de cada tecla. */
  async function borrarConBackspace(id, foto) {
    await ev(`(function(){ try { if (document.activeElement && document.activeElement.blur)
      document.activeElement.blur() } catch(e){} return 1 })()`);
    const via = await enfocar(id);
    /* MISMA GUARDA QUE `tipear`: sin foco no hay Backspace que muerda, y un borrado que no ocurrio
       se leeria como «el valor no se repone». */
    const _foco = await ev(`(document.activeElement && document.activeElement.id) || '<sin id>'`);
    if (_foco !== id) return { via, sinFoco: true, focoEn: _foco, pasos: [] };
    /* ⚠️ NUNCA UN BACKSPACE SOBRE UN CAMPO `readonly`: NAVEGA, Y CUELGA LA SONDA 75 s. Un campo de
       solo lectura no es editable, asi que Blink NO consume la tecla y cae en la accion por
       omision de la ventana, que es el ATRAS del historial. La pagina navega, el contexto de
       ejecucion muere y la promesa de `Runtime.evaluate` no se resuelve NUNCA — es la trampa de
       los `cdp.mjs` que no salen, con la cara de un reloj de 75 s.
       Medido: la escena «borrar en Valvulas con el valor cargado desde el Doppler» colgo las dos
       veces que corrio contra HEAD, donde `em_thp_display` todavia es `readonly`. Y la PRIMERA
       corrida fue una sola escena de catorce sub-escenas sin traza: 19 minutos sin escribir una
       linea y sin poder decir en cual se habia clavado.
       Un campo readonly no se puede borrar, y eso es un HECHO sobre la app —es justo el agujero
       que esta tanda cierra— no un fallo de la sonda: se informa y no se inventa un borrado. */
    const _ro = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      return e ? !!e.readOnly : null })()`);
    if (_ro) return { via, readonly: true, pasos: [],
                      valor: await ev(`window.__P.val(${JSON.stringify(id)})`) };
    /* ⚠️ `setSelectionRange` LANZA en un `input[type=number]` —no soporta seleccion— y el `try`
       la tragaba, asi que el caret quedaba donde estuviera. Al enfocar por clic el caret cae donde
       se clickeo; para que el Backspace muerda desde el final se enfoca y se manda `End`. */
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    await tecla('End', null);
    const pasos = [];
    for (let i = 0; i < 8; i++) {
      const v0 = await ev(`window.__P.val(${JSON.stringify(id)})`);
      if (v0 === '' || v0 === null) break;
      await tecla('Backspace', null);
      await pausa(70);
      const v1 = await ev(`window.__P.val(${JSON.stringify(id)})`);
      pasos.push({ tras: i + 1, campo: v1,
                   ...(foto ? JSON.parse(await ev(`JSON.stringify(window.__P.${foto}())`)) : {}) });
      /* Una tecla que no mueve el campo no va a mover la siguiente: se corta y se DICE, en vez de
         gastar siete round-trips mas y devolver una lista de pasos identicos. */
      if (v1 === v0) { pasos[pasos.length - 1].sinEfecto = true; break; }
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})); e.blur() } return 1 })()`);
    await pausa(120);
    return { via, pasos };
  }

  await ev(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await ev(SONDA);
  const chequeo = JSON.parse(await ev(`JSON.stringify(window.__P.listo())`));
  if (!chequeo.listo) throw new Error('LA APP NO ESTA LISTA: ' + JSON.stringify(chequeo));

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y SE COME TODOS LOS CLICS. Se cierra con su propio
     boton, como lo cierra el medico, y se COMPRUEBA que se fue antes de medir nada. */
  const avisoBtn = await ev(`(function(){
    var m = document.getElementById('modalAvisoEco');
    if (!m) return 'NO EXISTE';
    if (getComputedStyle(m).display === 'none') return 'ya cerrado';
    var b = Array.from(m.querySelectorAll('button')).find(function(x){
      return /cerrarAvisoEco/.test(x.getAttribute('onclick') || '') });
    if (!b) return 'SIN BOTON';
    if (!b.id) b.id = '__avisoOk';
    return b.id })()`);
  const avisoClic = (avisoBtn && avisoBtn.indexOf('__aviso') === 0) ? await clicEn(avisoBtn) : avisoBtn;
  await pausa(300);
  const avisoCerrado = await ev(`(function(){ var m = document.getElementById('modalAvisoEco');
    return m ? getComputedStyle(m).display : 'NO EXISTE' })()`);
  if (avisoCerrado !== 'none' && avisoCerrado !== 'NO EXISTE') {
    throw new Error('EL AVISO LEGAL SIGUE PUESTO (' + avisoCerrado + ')');
  }

  const out = { archivo: FARG, listoApp: chequeo,
    aviso: { boton: avisoBtn, clic: avisoClic, display: avisoCerrado } };
  const hacer = (k) => !SOLO || SOLO === k;
  const J = async (expr) => JSON.parse(await ev(`JSON.stringify(${expr})`));
  /* ⚠️ PARA LO QUE DEVUELVE UNA PROMESA HAY QUE ESPERARLA DENTRO DE LA PAGINA. `J()` hace
     `JSON.stringify` del valor que la expresion devuelve, y si eso es una Promise el resultado es
     literalmente «{}»: `awaitPromise` espera la promesa de la EXPRESION, y aca la expresion ya
     resolvio a una cadena. Medido: la escena del guardado informo `g = {}` y se leyo como «el
     guardado fallo» cuando lo que fallaba era la sonda — el defecto correcto por la razon
     equivocada. `JP` encadena el `then` ANTES de serializar. */
  const JP = async (expr) => JSON.parse(await ev(`(${expr}).then(function(r){ return JSON.stringify(r) })`));

  /* DENOMINADOR DURO: el estado de partida ABORTA si los campos de la tanda no tienen geometria.
     Sin esto, una sonda sobre un arbol cerrado tipea en la nada y todo sale «sin cambios». */
  const base = async () => {
    await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
    const d = await J(`window.__P.abrirTodo()`);
    if (!d.ok) throw new Error('DENOMINADOR: campos sin geometria: ' + JSON.stringify(d));
    return d;
  };

  /* Escenario mitral completo, para las superficies y para los cortes. Es el MISMO dato fisico en
     las dos mitades del A/B: la Vmax IM va en la unidad que el archivo medido declara. */
  const ESCENA = (vmaxIm) => ({
    nombre: 'Prueba Mitral', ci: '1234567', edad: '64', sexo: 'M', peso: '80', talla: '175',
    vm_morf: 'Reumática',
    em_vmax: '1.8', em_gmedio: '7', thp: '150', avm_plan: '1.3',
    em_dtsvi: '21', em_vtitsvi: '22', em_vtimit: '55',
    im_vc: '5', im_jet_area: '9', ai_area: '28', pisa_r: '7', pisa_val: '40',
    im_vmax: String(vmaxIm), im_itv: '130', im_onda_s: 'embotada',
    diam_mit: '30', itv_mitral: '18', onda_e: '130',
  });

  /* ══ LEC — lectura previa: el censo de los dos bloques y las filas del cuadro ══════════════ */
  if (hacer('LEC')) {
    await base();
    out.LEC = {
      esten: await J(`window.__P.censo('bloque-em-detalle')`),
      insuf: await J(`window.__P.censo('bloque-insuf-mitral')`),
      filasInsuf: await J(`window.__P.filasRef('bloque-insuf-mitral')`),
      filasEsten: await J(`window.__P.filasRef('bloque-em-detalle')`),
      headsEsten: await J(`window.__P.heads('bloque-em-detalle')`),
      headsInsuf: await J(`window.__P.heads('bloque-insuf-mitral')`),
      avmEte: await J(`({ existe: window.__P.existe('avm_ete'), vis: window.__P.vis('avm_ete'),
        tabindex: (document.getElementById('avm_ete')||{}).getAttribute
          ? document.getElementById('avm_ete').getAttribute('tabindex') : null })`),
    };
  }

  /* ══ TAB — el orden de tabulacion REAL, con la tecla Tab de verdad ═════════════════════════
     ⚠️ NO SE DEDUCE DEL DOM: lo que gobierna es el orden de tabulacion que el navegador calcula,
     y los campos readonly SI tabulan (no son disabled). Se entra por el primer campo del bloque
     y se leen N saltos. Un orden deducido de la lectura habria sido una afirmacion sin medir. */
  if (hacer('TAB')) {
    const recorrer = async (primero, n) => {
      await ev(`(function(){ try { if (document.activeElement && document.activeElement.blur)
        document.activeElement.blur() } catch(e){} return 1 })()`);
      const via = await enfocar(primero);
      const foco0 = await ev(`(document.activeElement && document.activeElement.id) || '<sin id>'`);
      if (foco0 !== primero) return { via, sinFoco: true, focoEn: foco0, orden: [] };
      const orden = [primero];
      for (let i = 0; i < n; i++) {
        await tecla('Tab', null);
        await pausa(45);
        orden.push(await ev(`(document.activeElement && document.activeElement.id) ||
          ('<' + (document.activeElement ? document.activeElement.tagName.toLowerCase() : '?') + '>')`));
      }
      return { via, orden };
    };
    await base();
    out.TAB = {
      esten: await recorrer('em_vmax', 13),
      insuf: await recorrer('im_vc', 17),
    };
  }

  /* ══ MOV — 1200, 390 y 360 px: desborde, barra horizontal y PISTAS de la grilla ═══════════ */
  if (hacer('MOV')) {
    const mov = {};
    for (const w of [1200, 390, 360]) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 }, sessionId);
      await pausa(260);
      await base();
      await pausa(200);
      mov[w] = {
        global: await J(`window.__P.desborde()`),
        tarjeta: await J(`window.__P.desbordeDe('ete-seccion-valv-mitral')`),
        detalle: await J(`window.__P.desbordeDe('bloque-em-detalle')`),
        insuf: await J(`window.__P.desbordeDe('bloque-insuf-mitral')`),
        colsEsten: await J(`window.__P.cols('#bloque-em-detalle .grid-4') ||
          window.__P.cols('#bloque-em-detalle .valv-cols-3') ||
          window.__P.cols('#bloque-em-detalle .valv-cols-4')`),
        colsInsuf: await J(`window.__P.cols('#bloque-insuf-mitral .grid-4') ||
          window.__P.cols('#bloque-insuf-mitral .valv-cols-4') ||
          window.__P.cols('#bloque-insuf-mitral .valv-cols-3')`),
        campos: await J(`['em_vmax','em_thp_display','avm_idx','im_vc','im_vmax','vm_lat']
          .reduce(function(a,id){ a[id] = window.__P.desbordeDe(id); return a }, {})`),
      };
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.MOV = mov;
  }

  /* ══ THP — gestos con teclas reales en los DOS lugares, dentro y fuera de banda ════════════
     La banda es EM_BANDA_PLAUS.thp = [20,600] ms: 150 esta dentro, 12 esta fuera.
     ⚠️ PARTIDA EN TRES (THP1 tipear · THP2 borrar · THP3 nuevo estudio y legados) Y CON TRAZA POR
     PASO. La primera version era UNA escena de 14 sub-escenas: corrio 19 minutos sin escribir una
     linea —la sonda imprime una sola vez, al final— y hubo que matarla sin saber en cual se habia
     clavado. Con `paso()` cada sub-escena se anuncia por stderr, asi que un cuelgue DICE donde
     ocurrio; y partida en tres, ninguna corrida pasa de unos minutos. Es la trampa de los
     `cdp.mjs` que no salen con otra cara: el reloj de 75 s de `ev()` acota cada llamada, no la
     corrida entera. */
  if (hacer('THP') || hacer('THP1')) {
    const thp = out.THP || {};
    for (const [etq, lugar, valor] of [
      ['valv_dentro', 'em_thp_display', '150'], ['valv_fuera', 'em_thp_display', '12'],
      ['dop_dentro',  'thp',            '150'], ['dop_fuera',  'thp',            '12'],
    ]) {
      paso('THP1 ' + etq);
      await base();
      const t = await tipear(lugar, valor);
      await pausa(140);
      thp[etq] = { tipeo: t, foto: await J(`window.__P.thpFoto()`) };
    }
    out.THP = thp;
  }
  if (hacer('THP') || hacer('THP2')) {
    const thp = out.THP || {};
    /* Borrar en cada lugar, con el valor cargado desde el OTRO. */
    for (const [etq, cargar, borrar] of [
      ['borrar_valv_tras_dop',  'thp',            'em_thp_display'],
      ['borrar_dop_tras_valv',  'em_thp_display', 'thp'],
      ['borrar_valv_tras_valv', 'em_thp_display', 'em_thp_display'],
      ['borrar_dop_tras_dop',   'thp',            'thp'],
    ]) {
      paso('THP2 ' + etq);
      await base();
      const t = await tipear(cargar, '150');
      const b = await borrarConBackspace(borrar, 'thpFoto');
      await pausa(140);
      thp[etq] = { tipeo: t, borrado: b, foto: await J(`window.__P.thpFoto()`) };
    }
    out.THP = thp;
  }
  if (hacer('THP') || hacer('THP3')) {
    const thp = out.THP || {};
    /* Nuevo estudio: los dos vacios, y no se reponen. */
    paso('THP3 nuevoEstudio');
    await base();
    await tipear('thp', '150');
    await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
    await J(`window.__P.abrirTodo()`);
    thp.nuevoEstudio = await J(`window.__P.thpFoto()`);
    /* Un estudio GUARDADO como lo trae el disco: el barrido escribe .value y no despacha nada.
       Dos legados: el que trae el display con el TEXTO viejo y el que lo trae con el numero. */
    for (const [etq, dispVal] of [['legado_texto', '150 ms'], ['legado_numero', '150']]) {
      paso('THP3 ' + etq);
      await base();
      await ev(`(function(){ window.__P.setRaw('thp','150');
        window.__P.setRaw('em_thp_display', ${JSON.stringify(dispVal)}); return 1 })()`);
      thp[etq] = { crudo: await J(`window.__P.thpFoto()`) };
      await ev(`(function(){ try { calcTHP() } catch(e){} return 1 })()`);
      await pausa(120);
      thp[etq].trasCalcTHP = await J(`window.__P.thpFoto()`);
    }
    out.THP = thp;
  }
  /* ══ THP4 — el normalizador de legado y un estudio guardado de VERDAD ═════════════════════
     ⚠️ LAS ESCENAS DE THP3 NO PRUEBAN EL MIGRADOR: usan `setRaw`, que escribe `.value` sin pasar
     por `_migrarCamposLegacy`. Lo que un estudio guardado hace de verdad es pasar su objeto
     `campos` por el migrador ANTES de poblar el formulario, asi que aca se llama al migrador
     DIRECTO con la forma exacta que tenian los guardados viejos, y despues se hace un
     guardar -> reabrir real. */
  if (hacer('THP') || hacer('THP4')) {
    const t4 = {};
    paso('THP4 migrador');
    await base();
    t4.migrador = await J(`window.__P.migrar({ thp: '150', em_thp_display: '150 ms' })`);
    t4.migradorFuera = await J(`window.__P.migrar({ thp: '12', em_thp_display: '12 ms (revisar)' })`);
    t4.migradorVacio = await J(`window.__P.migrar({ thp: '', em_thp_display: '' })`);
    t4.migradorSinClave = await J(`window.__P.migrar({ thp: '150' })`);
    t4.migradorYaNumero = await J(`window.__P.migrar({ thp: '150', em_thp_display: '150' })`);
    /* CONTROL NEGATIVO: el migrador no toca lo que no es suyo. */
    t4.migradorOtro = await J(`window.__P.migrar({ thp: '150', em_gmedio: '7 mmHg' })`);

    paso('THP4 guardar y reabrir');
    await base();
    /* ⚠️ EL GUARDADO NECESITA PACIENTE, y sin esto guardarInforme no llamo nunca al callback:
       la primera corrida informo ok=null y estudioId=null y la escena habria medido el
       formulario VIVO creyendo medir un estudio reabierto — el defecto correcto por la razon
       equivocada. El THP se tipea con TECLAS REALES despues de sembrar lo demas. */
    await ev(`(function(){ window.__P.sembrar({ nombre:'Legado THP', ci:'7-7', edad:'64',
      sexo:'M', peso:'80', talla:'175', vm_morf:'Reumática' }); return 1 })()`);
    /* ⚠️ SE TIPEA EN `thp` Y NO EN VALVULAS, PARA QUE LA ESCENA SEA COMPARABLE CONTRA HEAD: en
       HEAD el campo de Valvulas es readonly y el estudio se guardaria SIN THP, o sea otro
       paciente. El tecleo en Valvulas lo cubre THP1. */
    const tecleo = await tipear('thp', '150');
    await pausa(160);
    const g = await JP(`window.__P.guardar()`);
    t4.guardado = { tecleo, g };
    if (!g || !g.estudioId) t4.ABORTADA = 'sin estudio guardado: la escena no mide nada';
    if (g && g.estudioId) {
      t4.enDisco = await J(`window.__P.enDisco(${JSON.stringify(g.estudioId)})`);
      await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
      await pausa(200);
      t4.reabrir = await J(`({ r: window.__P.reabrir(${JSON.stringify(g.estudioId)}) })`);
      await pausa(400);
      await J(`window.__P.abrirTodo()`);
      t4.trasReabrir = await J(`window.__P.thpFoto()`);
      await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
      await pausa(200);
      t4.editar = await J(`({ r: window.__P.editar(${JSON.stringify(g.estudioId)}) })`);
      await pausa(700);
      await J(`window.__P.abrirTodo()`);
      t4.trasEditar = await J(`window.__P.thpFoto()`);
      /* ⚠️ EL LEGADO DE VERDAD: se reescribe EN DISCO la clave del display con el TEXTO que
         escribian `calcTHP` y `calcEM` hasta hoy («150 ms»), que es lo que trae CUALQUIER estudio
         guardado antes de este commit, y se reabre por las dos rutas. Es la unica forma de probar
         el normalizador en la ruta real: las escenas de THP3 usan setRaw y no pasan por el. */
      t4.legadoEscrito = await JP(`(function(){
        var ins = getInformes();
        var i = ins.find(function(x){ return x.estudioId === ${JSON.stringify(g.estudioId)} });
        if (!i) return Promise.resolve({ err: 'SIN ESTUDIO' });
        i.campos['em_thp_display'] = '150 ms';
        return CeiboStore.setLocal(ins).then(function(){ return window.__P.enDisco(${JSON.stringify(g.estudioId)}) });
      })()`);
      await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
      await pausa(200);
      t4.legadoReabrir = await J(`({ r: window.__P.reabrir(${JSON.stringify(g.estudioId)}) })`);
      await pausa(400);
      await J(`window.__P.abrirTodo()`);
      t4.legadoTrasReabrir = await J(`window.__P.thpFoto()`);
      await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
      await pausa(200);
      t4.legadoEditar = await J(`({ r: window.__P.editar(${JSON.stringify(g.estudioId)}) })`);
      await pausa(700);
      await J(`window.__P.abrirTodo()`);
      t4.legadoTrasEditar = await J(`window.__P.thpFoto()`);
      t4.legadoEnDiscoFinal = await J(`window.__P.enDisco(${JSON.stringify(g.estudioId)})`);
      await ev(`window.__P.borrarEstudio(${JSON.stringify(g.estudioId)}).then(function(){ return 1 })`);
    }
    out.THP4 = t4;
  }

  /* ══ PISA — el MISMO dato fisico con la unidad que el archivo medido declara ═══════════════
     ⚠️ LA UNIDAD DE `im_vmax` SE LEE DEL PROPIO ARCHIVO y no se asume: el placeholder la dice.
     Sin esto, una escena describiria un TECLEO y no un paciente, y el A/B compararia 5 cm/s
     contra 5 m/s — dos pacientes distintos. Misma leccion que `cwIT()` de _probe_tricusp.mjs. */
  if (hacer('PISA')) {
    const uni = await ev(`(function(){ var e = document.getElementById('im_vmax');
      return e ? (e.getAttribute('placeholder') || '') : '?' })()`);
    const vmax = /m\/s/.test(uni) && !/cm\/s/.test(uni) ? 5 : 500;
    await base();
    await ev(`(function(){ return JSON.stringify(window.__P.sembrar(${JSON.stringify(ESCENA(vmax))})) })()`);
    await pausa(200);
    out.PISA = { unidadLeida: uni, vmaxUsada: vmax,
      foto: await J(`window.__P.pisaFoto()`),
      plaus: await J(`(function(){ var p = vPlaus('im_vmax');
        return { crudo: p.crudo, fuera: p.fuera, b: p.b } })()`) };
  }

  /* ══ CORT — los bordes de los cortes de IM, uno por uno ════════════════════════════════════
     VC y jet/AI se aislan (son los dos unicos votantes que no derivan de otro), asi que el grado
     integrado ES su voto. EROA, Vol-R y FR van encadenados por la formula —el Vol-R sale de la
     EROA— asi que de esos se leen los NUMEROS publicados y la discordancia, que es la superficie
     donde cada voto aparece por separado. */
  if (hacer('CORT')) {
    const uni = await ev(`(function(){ var e = document.getElementById('im_vmax');
      return e ? (e.getAttribute('placeholder') || '') : '?' })()`);
    const VM = /m\/s/.test(uni) && !/cm\/s/.test(uni) ? 5 : 500;
    const K = /m\/s/.test(uni) && !/cm\/s/.test(uni) ? 1 : 100;   /* cm/s por unidad del campo */
    const cort = { unidadLeida: uni, vc: {}, jet: {}, eroa: {}, volr: {}, fr: {} };
    for (const v of ['2.9', '3.0', '6.9', '7.0']) {
      await base();
      await ev(`(function(){ window.__P.sembrar({ vm_morf:'Reumática', im_vc:${JSON.stringify(v)} }); return 1 })()`);
      cort.vc[v] = await J(`window.__P.pisaFoto()`);
    }
    /* Area AI 100 cm2, asi que el area del jet ES el porcentaje. */
    for (const v of ['19.9', '20', '40', '40.1']) {
      await base();
      await ev(`(function(){ window.__P.sembrar({ vm_morf:'Reumática', ai_area:'100', im_jet_area:${JSON.stringify(v)} }); return 1 })()`);
      cort.jet[v] = await J(`window.__P.pisaFoto()`);
    }
    /* EROA = 2*pi*(r/10)^2 * Valiasing / VmaxIM(cm/s) * 100. Con r = 10 mm el factor es
       628.3185 / Vmax(cm/s), asi que el Valiasing que aterriza en una EROA exacta es
       EROA * Vmax(cm/s) / 628.3185. */
    for (const e of [19, 20, 39, 40]) {
      const val = (e * (VM * K) / 628.3185).toFixed(4);
      await base();
      await ev(`(function(){ window.__P.sembrar({ vm_morf:'Reumática', pisa_r:'10',
        pisa_val:${JSON.stringify(val)}, im_vmax:${JSON.stringify(String(VM))} }); return 1 })()`);
      cort.eroa[e] = { valiasing: val, foto: await J(`window.__P.pisaFoto()`) };
    }
    /* Vol-R = EROA/100 * VTI del chorro. Con la EROA clavada en 40 mm2, el VTI que aterriza en un
       Vol-R exacto es VolR / 0.40. */
    for (const vr of [29, 30, 59, 60]) {
      const val = (40 * (VM * K) / 628.3185).toFixed(4);
      const itv = (vr / 0.40).toFixed(2);
      await base();
      await ev(`(function(){ window.__P.sembrar({ vm_morf:'Reumática', pisa_r:'10',
        pisa_val:${JSON.stringify(val)}, im_vmax:${JSON.stringify(String(VM))},
        im_itv:${JSON.stringify(itv)} }); return 1 })()`);
      cort.volr[vr] = { itv: itv, foto: await J(`window.__P.pisaFoto()`) };
    }
    /* FR = Vol-R / Vol sistolico del TSVI. Se barre el O TSVI para mover el denominador y se
       leen los numeros publicados: la FR no se puede aislar de la EROA por la formula. */
    for (const d of [20, 22, 24, 26]) {
      const val = (40 * (VM * K) / 628.3185).toFixed(4);
      await base();
      await ev(`(function(){ window.__P.sembrar({ vm_morf:'Reumática', pisa_r:'10',
        pisa_val:${JSON.stringify(val)}, im_vmax:${JSON.stringify(String(VM))},
        im_itv:'150', im_dtsvi:${JSON.stringify(String(d))}, im_itv_tsvi:'22' }); return 1 })()`);
      cort.fr[d] = await J(`window.__P.pisaFoto()`);
    }
    out.CORT = cort;
  }

  /* ══ SUP — las CUATRO superficies, UNA POR UNA ═════════════════════════════════════════════
     informe narrativo (3 estilos), EN SUMA, Excel y los campos del formulario. El PPT y el PDF
     no se emiten desde aca: el commit que los toque los mide aparte. */
  if (hacer('SUP')) {
    const uni = await ev(`(function(){ var e = document.getElementById('im_vmax');
      return e ? (e.getAttribute('placeholder') || '') : '?' })()`);
    const vmax = /m\/s/.test(uni) && !/cm\/s/.test(uni) ? 5 : 500;
    await base();
    await ev(`(function(){ window.__P.sembrar(${JSON.stringify(ESCENA(vmax))}); return 1 })()`);
    await pausa(250);
    const sup = { unidadLeida: uni, vmaxUsada: vmax, pantalla: await J(`window.__P.pisaFoto()`),
                  thp: await J(`window.__P.thpFoto()`), informe: {} };
    for (const est of ['conciso', 'estandar', 'narrativo']) {
      sup.informe[est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
    }
    sup.enSuma = await ev(`window.__P.enSuma()`);
    const xl = await J(`window.__P.excel()`);
    sup.excelN = xl.n || null;
    sup.excelMitral = xl.fila ? Object.keys(xl.fila).filter((k) =>
      /IM |EM |mitral|Mitral|AVm|EROA|Vol R|THP|PHT|AI /.test(k)).reduce((a, k) => {
        a[k] = xl.fila[k]; return a; }, {}) : null;
    /* CONTROL NEGATIVO: las otras tres valvulas, que esta tanda NO toca. Si se mueven, el cambio
       se fue de la mitral. */
    sup.otrasValvulas = xl.fila ? Object.keys(xl.fila).filter((k) =>
      /EA |IA |ET |IT |EP |IP |AVA|ao\)|Ao |Tric|Pulm/.test(k)).reduce((a, k) => {
        a[k] = xl.fila[k]; return a; }, {}) : null;
    out.SUP = sup;
  }

  out.dialogos = dialogos;

  const despues = await md5(join(RAIZ, 'index.html'));
  out.md5_antes = antes; out.md5_despues = despues; out.index_intacto = antes === despues;
  console.log(JSON.stringify(out, null, 2));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
