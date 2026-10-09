#!/usr/bin/env node
/**
 * _probe_mitvis.mjs — sonda A/B de SOLO LECTURA para la tanda «los bloques de la mitral se ven
 * siempre» (commit A) y «la fila de vena contracta muestra el valor» (commit B), 2026-10-09.
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   DEN  — denominador: Valvulas abierta, tarjeta mitral abierta, LAS DOS pastillas APAGADAS y
 *          las claves de localStorage borradas. Aborta si la tarjeta no tiene geometria.
 *   VIS  — las cuatro escenas de pastilla x pastilla a 1200 px: se ven los campos? se ve el
 *          GRADO? que dice el style.display INLINE? Con la AORTICA como control positivo (ya se
 *          veia) y los dos bloques de GRADO como control negativo (no se tienen que ver).
 *   MOV  — 1200, 390 y 360 px: desborde, barra horizontal, el boton «Datos» y su alto tactil,
 *          y el plegado/desplegado del celular.
 *   PXD  — pastilla x dato (sin dato, con dato, apagada a mano con dato, prendida a mano sin
 *          dato), por lesion: pastilla, grado, clave de localStorage, informe y EN SUMA.
 *   TCL  — teclas REALES con la pastilla apagada: thp (alcanzable en los dos lados), avm_plan e
 *          im_vc (alcanzables solo con los bloques visibles), y el borrado con Backspace.
 *   AUTO — el auto-prendido: mitral vs aortica, estenosis vs insuficiencia, y la durabilidad del
 *          apagado a mano.
 *   VC   — commit B: la fila de vena contracta en 2,9 / 3,0 / 6,9 / 7,0 y borrada.
 *   SUP  — superficies: informe (3 estilos), EN SUMA, Excel (n y fila), campos del formulario,
 *          valores que arma el PDF, panel de Evidencia, Laboratorio y el PPT por sus insumos.
 *
 *   node scripts/_probe_mitvis.mjs --file /tmp/index.HEAD.html > /tmp/mv.HEAD.json
 *   node scripts/_probe_mitvis.mjs                             > /tmp/mv.NEW.json
 *   node scripts/_probe_mitvis.mjs --solo VIS --ver
 *
 * Infraestructura (servidor + Chrome + CDP + cierre del arbol de procesos + teclas reales)
 * calcada de scripts/_probe_mitpant.mjs, que a su vez la calco de _probe_mitcoord.mjs.
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

  /* Abre la pestania Calculadoras y la tarjeta plegable del PISA de cirugia, y CONFIRMA que los
     cuatro campos tienen geometria: sin eso un tecleo con teclas reales entra en la nada. */
  abrirCx() {
    try { showTab('calculadoras') } catch(e) {}
    var caja = document.getElementById('cx-pisa');
    if (caja && getComputedStyle(caja).display === 'none') {
      var h = Array.from(document.querySelectorAll('[onclick]')).find(function(b){
        return (b.getAttribute('onclick')||'').indexOf("'cx-pisa'") >= 0 });
      if (h) { try { toggleCard('cx-pisa', h) } catch(e) {} }
    }
    var CAMPOS = ['cx_pisa_r','cx_pisa_va','cx_pisa_vmax','cx_pisa_vti'];
    var sinGeo = CAMPOS.filter(function(id){ return window.__P.vis(id) !== true });
    return { tab: window.__P.vis('tab-calculadoras'), sinGeo: sinGeo, ok: sinGeo.length === 0 } },

  cxFoto() {
    return { ero: window.__P.txt('cx-pisa-ero'), vr: window.__P.txt('cx-pisa-vr'),
             r: window.__P.val('cx_pisa_r'), va: window.__P.val('cx_pisa_va'),
             vmax: window.__P.val('cx_pisa_vmax'), vti: window.__P.val('cx_pisa_vti'),
             uni: (function(){ var e=document.getElementById('cx_pisa_vmax');
               return e ? (e.getAttribute('placeholder')||'') : '?' })() } },

  /* ⚠️ EL DISCO DE VERDAD, NO LA CACHE. CeiboStore.getLocal() devuelve un slice() del array
     interno, asi que los OBJETOS son la misma referencia: _migrarCamposLegacy muta la copia en
     memoria del estudio y getInformes() ya informa el valor normalizado. Para saber si el
     ALMACENAMIENTO cambio hay que leerlo crudo, sin pasar por el store. */
  /* EL ALMACENAMIENTO PRIMARIO ES INDEXEDDB (db «ceibomed», store «informes», indice «app» =
     «eco»); localStorage es solo el respaldo. Se lee la base DIRECTO, sin pasar por CeiboStore,
     que es la unica forma de distinguir «el migrador muto la cache» de «el migrador reescribio
     el disco». */
  discoIdb(estudioId, clave) {
    return new Promise(function(resolve){
      var req;
      try { req = indexedDB.open('ceibomed', 1) } catch (e) { resolve({ err: 'open ' + e.message }); return }
      req.onerror = function(){ resolve({ err: 'onerror' }) };
      req.onsuccess = function(){
        var db = req.result;
        try {
          var tx = db.transaction('informes', 'readonly');
          var g = tx.objectStore('informes').getAll();
          g.onsuccess = function(){
            var filas = g.result || [];
            var hit = null, total = 0;
            filas.forEach(function(f){
              /* La fila del store tiene la forma _pk+app+bucket+data: los estudios viven en
                 data, y el bucket dice si es el lote local o el importado. */
              var d = (f && f.data !== undefined) ? f.data : f;
              if (typeof d === 'string') { try { d = JSON.parse(d) } catch (e) { d = null } }
              var lista = Array.isArray(d) ? d
                        : (d && Array.isArray(d.local)) ? d.local
                        : (d && Array.isArray(d.chunk)) ? d.chunk : null;
              if (!lista) return;
              total += lista.length;
              var j = lista.find(function(x){ return x && x.estudioId === estudioId });
              if (j && j.campos) hit = j.campos[clave];
            });
            resolve({ valor: hit, filasEnStore: filas.length, estudiosVistos: total,
                      formas: filas.map(function(f){ return Object.keys(f || {}).join('+') }) });
          };
          g.onerror = function(){ resolve({ err: 'getAll' }) };
        } catch (e) { resolve({ err: 'tx ' + e.message }) }
      };
    }) },

  discoRaw(estudioId, clave) {
    var out = { ls: '(sin clave)', idb: '(no leido)' };
    try {
      var ks = Object.keys(localStorage).filter(function(k){ return /inform|ceibo|ett/i.test(k) });
      out.claves = ks;
      for (var i = 0; i < ks.length; i++) {
        var raw = localStorage.getItem(ks[i]);
        if (!raw || raw.indexOf(estudioId) === -1) continue;
        try {
          var arr = JSON.parse(raw);
          var lista = Array.isArray(arr) ? arr : (arr && Array.isArray(arr.local) ? arr.local : null);
          if (!lista) continue;
          var j = lista.find(function(x){ return x && x.estudioId === estudioId });
          if (j && j.campos) { out.ls = j.campos[clave]; out.en = ks[i]; }
        } catch (e) { out.ls = 'EXC ' + e.message }
      }
    } catch (e) { out.ls = 'EXC ' + e.message }
    return out },

  /* ══ FOTO DE TODOS LOS CAMPOS CALCULADOS DE LA MITRAL ═════════════════════════════════════
     Los nueve de la estenosis y los nueve de la insuficiencia, en una sola lectura. Un campo
     calculado que se queda con el valor del paciente anterior es un numero que el medico lee como
     si fuera de este estudio. */
  autosFoto() {
    var val = function(id){ var e = document.getElementById(id); return e ? e.value : '(NO EXISTE)' };
    var txt = function(id){ var e = document.getElementById(id); return e ? (e.textContent||'').trim().replace(/\s+/g,' ') : '(NO EXISTE)' };
    return {
      em_gmax: val('em_gmax'), em_avm_thp_display: val('em_avm_thp_display'),
      avm_cont: val('avm_cont'), avm_idx: val('avm_idx'), avm_thp: val('avm_thp'),
      f_gmax: txt('em-gmax-row'), f_gmedio: txt('em-gmedio-row'), f_thp: txt('em-thp-row'),
      f_cont: txt('em-cont-row'), f_plan: txt('em-plan-row'), f_sev: txt('em-sev-integrada'),
      im_eroa_cont: val('im_eroa_cont'), vr_cont: val('vr_cont'),
      im_fr_cont: val('im_fr_cont'), vm_lat: val('vm_lat'),
      f_jet: txt('im-jet-ratio'), f_eroa: txt('eroa-val'), f_volr: txt('volr-val'),
      f_vsv: txt('vsvtsvi-val'), f_fr: txt('freg-val'), f_vc: txt('im-vc-ref'),
      f_ondas: txt('im-onda-s-interp'), f_ondae: txt('im-ondae-interp'),
      f_vtiratio: txt('im-vti-ratio'), f_imsev: txt('im-sev')
    } },


  /* ══ ESTADO DE PARTIDA SIN TOCAR NINGUN DISPLAY ════════════════════════════════════════════
     ⚠️ NO SE REUSA abrirTodo() DE LA SONDA ANTERIOR, Y LA DIFERENCIA ES TODA LA TANDA: esa
     funcion PRENDE las dos pastillas y ademas escribe bloque-em-detalle.style.display =
     block a mano. Las dos cosas destruirian lo que esta sonda mide — el display inline es
     justamente el dato que prueba que el toggle sigue haciendo lo mismo. Aca solo se abre la
     pestania y las tarjetas, y se CONFIRMA que las pastillas quedaron apagadas. */
  abrirCard() {
    try { showTab('valvulas') } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    var alto = function(id){ var e = document.getElementById(id);
      return e ? Math.round(e.getBoundingClientRect().height) : -1 };
    return { tab: window.__P.vis('tab-valvulas'),
             tarjeta: window.__P.vis('ete-seccion-valv-mitral'),
             altoTarjeta: alto('ete-seccion-valv-mitral'),
             pillEM: window.__P.pill('mitral','esten'),
             pillIM: window.__P.pill('mitral','insuf'),
             pillEA: window.__P.pill('aortica','esten'),
             pillIA: window.__P.pill('aortica','insuf'),
             /* El denominador de esta sonda es la TARJETA, no los campos: con las pastillas
                apagadas los campos pueden no tener geometria —en HEAD no la tienen— y eso es
                precisamente el hallazgo, no un fallo del arnes. */
             ok: window.__P.vis('tab-valvulas') === true &&
                 window.__P.vis('ete-seccion-valv-mitral') === true &&
                 alto('ete-seccion-valv-mitral') > 0 &&
                 window.__P.pill('mitral','esten') === false &&
                 window.__P.pill('mitral','insuf') === false } },

  /* El style.display INLINE, crudo. Es lo que leen las compuertas de sincronia, y lo que el
     !important del CSS NO cambia: si esto se mueve, el cambio dejo de ser de maquetacion. */
  inline(id) { var e = document.getElementById(id);
    return e ? (e.style.display === '' ? '(vacio)' : e.style.display) : 'NO EXISTE' },
  alto(id) { var e = document.getElementById(id);
    return e ? Math.round(e.getBoundingClientRect().height) : -1 },
  lsPill(valv, tipo) {
    try { var v = localStorage.getItem('valv-pill-' + tipo + '-' + valv);
      return v === null ? '(null)' : v } catch(e) { return 'EXC' } },

  /* ══ LA FOTO DE VISIBILIDAD. Cuatro nodos por valvula: los dos de CAMPOS y los dos de GRADO.
     Los de grado son el CONTROL NEGATIVO de la tanda: tienen que seguir invisibles con la
     pastilla apagada, porque mostrar el grado es afirmar la valvulopatia. */
  visFoto() {
    var n = function(id){ return { vis: window.__P.vis(id), alto: window.__P.alto(id),
                                   inline: window.__P.inline(id) } };
    return {
      pills: { em: window.__P.pill('mitral','esten'), im: window.__P.pill('mitral','insuf'),
               ea: window.__P.pill('aortica','esten'), ia: window.__P.pill('aortica','insuf') },
      ls: { em: window.__P.lsPill('mitral','esten'), im: window.__P.lsPill('mitral','insuf') },
      campos_em: n('bloque-em-detalle'),   campos_im: n('bloque-insuf-mitral'),
      grado_em:  n('bloque-esten-mitral'), grado_im:  n('gf-insuf-mitral'),
      caja_em:   n('caja-esten-mitral'),   caja_im:   n('caja-insuf-mitral'),
      /* CONTROL POSITIVO: la aortica, que ya se veia con la pastilla apagada desde el
         2026-10-06. Si aca sale false en los dos lados del A/B, la sonda esta mirando un
         arbol cerrado y su «si» de la mitral no vale nada. */
      ao_campos_ia: n('bloque-insuf-aortica'), ao_campos_ea: n('bloque-ea-detalle'),
      ao_grado_ia:  n('gf-insuf-aortica'),     ao_grado_ea:  n('bloque-esten-aortica'),
      /* Un campo concreto de cada bloque: un contenedor con alto puede tener los hijos
         ocultos, asi que se pregunta por el input que el medico va a tipear. */
      campo_avm_plan: n('avm_plan'), campo_im_vc: n('im_vc'),
      campo_em_dtsvi: n('em_dtsvi'), campo_vtim: n('vtim'),
      avm_ete: n('avm_ete'),
      tsvi_boxes: { em: n('em-tsvi-box'), im: n('im-tsvi-estimado-box') } } },

  /* El boton «Datos» de cada lesion: existe? se ve? cuanto mide de alto? */
  datosFoto() {
    var b = function(id){ var e = document.getElementById(id); if (!e) return 'NO EXISTE';
      var r = e.getBoundingClientRect();
      return { vis: window.__P.vis(id), h: Math.round(r.height), w: Math.round(r.width),
               aria: e.getAttribute('aria-expanded'),
               controla: e.getAttribute('aria-controls') } };
    var c = function(id){ var e = document.getElementById(id);
      return e ? e.classList.contains('valv-datos-abierto') : 'NO EXISTE' };
    return { tog_em: b('datos-tog-esten-mitral'), tog_im: b('datos-tog-insuf-mitral'),
             abierto_em: c('caja-esten-mitral'), abierto_im: c('caja-insuf-mitral'),
             tog_ea: b('datos-tog-esten-aortica'), abierto_ea: c('caja-esten-aortica') } },

  tog(cajaId) { try { return valvDatosTog(cajaId) } catch(e) { return 'EXC ' + e.message } },

  /* ══ GRADOS Y MARCAS de las dos lesiones mitrales, que es lo que baja al informe firmado. */
  gradoFoto() {
    return { em: window.__P.val('em_grado'), im: window.__P.val('im_grado'),
             manEm: !!(window.esqSevManual && window.esqSevManual.em),
             manIm: !!(window.esqSevManual && window.esqSevManual.im),
             avisoEm: window.__P.txt('em-manual-aviso'), avisoIm: window.__P.txt('im-manual-aviso'),
             sevEm: window.__P.txt('em-sev-integrada'), sevIm: window.__P.txt('im-sev'),
             espejos: { im_dtsvi: window.__P.val('im_dtsvi'), im_itv_tsvi: window.__P.val('im_itv_tsvi'),
                        im_ai_area: window.__P.val('im_ai_area'), vtim: window.__P.val('vtim'),
                        em_dtsvi: window.__P.val('em_dtsvi'), em_vtitsvi: window.__P.val('em_vtitsvi') } } },

  /* ══ COMMIT B: la fila de la vena contracta, su valor y su marca. */
  vcFoto() {
    return { campo: window.__P.val('im_vc'), fila: window.__P.txt('im-vc-ref'),
             eroa: window.__P.txt('eroa-val'), volr: window.__P.txt('volr-val'),
             fr: window.__P.txt('freg-val'), sev: window.__P.txt('im-sev'),
             grado: window.__P.val('im_grado'), disc: window.__P.txt('im-discordancia') } },

  /* ══ PANEL DE EVIDENCIA. Secciones, filas y titulos. No se deduce de un grep. */
  panelFoto() {
    if (typeof IND_SECS === 'undefined') return 'SIN IND_SECS';
    var secs = 0, filas = 0, titulos = [];
    IND_SECS.forEach(function(sec){
      var r = null;
      try { r = sec.fn() } catch(e) { r = { err: e.message } }
      if (!r) return;
      if (r.err) { titulos.push(sec.titulo + ':ERR'); return }
      var fs = r.filas || r.rows || [];
      if (fs.length || r.txt || r.nota) { secs++; filas += fs.length; titulos.push(sec.titulo) }
    });
    return { secciones: secs, filas: filas, titulos: titulos } },

  /* ══ LABORATORIO. _labValvCounts es el que arma las ocho filas de valvulopatia; se lo llama
     con el estudio EN PANTALLA como si fuera uno guardado, que es la misma forma del dato. */
  labFoto() {
    if (typeof _labValvCounts !== 'function') return 'SIN _labValvCounts';
    try { return _labValvCounts([{ campos: window.__P.camposActuales() }]) }
    catch(e) { return 'EXC ' + e.message } },

  /* ══ LO QUE EL PDF ARMA PARA LA MITRAL, sin emitir el documento: los tres constructores de
     valor y los span del panel «Incluir en el informe». No necesita la libreria del CDN. */
  pdfInsumos() {
    var f = function(n){ try { return (typeof window[n] === 'function') ? String(window[n]()) : 'SIN ' + n }
      catch(e) { return 'EXC ' + e.message } };
    var spans = {};
    Array.from(document.querySelectorAll('[id^="im-pdf-"],[id^="em-pdf-"]')).forEach(function(e){
      spans[e.id] = (e.textContent || '').trim().replace(/\\s+/g,' ') });
    return { emAvm: f('emAvmPdfVal'), imEroa: f('imEroaPdfVal'), imVolr: f('imVolrPdfVal'),
             spans: spans } },

  /* ══ EL PDF DE VERDAD, SI LA LIBRERIA ESTA. Se intercepta doc.text y se neutraliza el
     guardado: la sonda es de solo lectura y no baja un archivo. Si el CDN no cargo —el arnes
     corre contra un servidor local y puede no haber red— se DICE «SIN jsPDF» en vez de
     devolver un vacio que se leeria como «el PDF no cambio». */
  pdfTexto() {
    if (!window.jspdf || !window.jspdf.jsPDF) return { err: 'SIN jsPDF (CDN no cargado)' };
    /* ⚠️ NO ES EL prototype, ES jsPDF.API, Y LA PRIMERA VERSION DE ESTA SONDA SE EQUIVOCO.
       Parcheando el prototipo la captura dio n=0 con el toast diciendo «PDF generado»: jsPDF 2.x
       mezcla los metodos de API en CADA INSTANCIA dentro del constructor, asi que el prototipo
       no esta en la cadena que doc.text resuelve. Se parchean los DOS objetos, y el contador de
       setFontSize queda como testigo de vida: un n=0 con setFontSize=0 significa «no mediste
       nada», no «el PDF no cambio».
       ⚠️ Y MEDIDO EL 2026-10-09 CON jsPDF 2.5.1 LA CAPTURA SIGUE SIN ENGANCHAR: n=0,
       setFontSize=0 y el toast diciendo «PDF generado», o sea el documento SE EMITE y los dos
       parches no lo ven. Asi que esta funcion HOY NO MIDE EL PDF. Lo que cubre al PDF en esta
       sonda es pdfInsumos() —los tres constructores de valor y los span del panel «Incluir en el
       informe»— mas la identidad de camposActuales(), que es de donde reimprime
       pdfDeInformeGuardado. Quien retome esto: el enganche no esta en API ni en prototype. */
    var OBJS = [window.jspdf.jsPDF.API, window.jspdf.jsPDF.prototype].filter(Boolean);
    var cap = [], fs = 0, orig = [];
    OBJS.forEach(function(P){
      orig.push({ P: P, t: P.text, s: P.save, o: P.output, f: P.setFontSize });
      var oT = P.text, oS = P.save, oO = P.output, oF = P.setFontSize;
      if (oT) P.text = function(t){ cap.push(Array.isArray(t) ? t.join(' | ') : String(t)); return oT.apply(this, arguments) };
      if (oF) P.setFontSize = function(){ fs++; return oF.apply(this, arguments) };
      if (oS) P.save = function(){ return this };
      if (oO) P.output = function(){ return '' };
    });
    var err = null, toasts = [], oTo = window.toast;
    /* ⚠️ EL toast SE INTERCEPTA PORQUE ES DONDE EL PDF DICE POR QUE NO SALIO. La primera
       corrida de esta sonda devolvio n=0 sin excepcion: el documento no se emitio y el motivo
       estaba en un aviso que nadie leia. Un 0 sin motivo se lee como «el PDF no cambio», que es
       exactamente la conclusion que no hay que sacar. */
    window.toast = function(m){ toasts.push(String(m)); };
    try { window.valvSevConfirmada = true; generarPDFReal() } catch(e) { err = String(e && e.message || e) }
    window.toast = oTo;
    orig.forEach(function(o){ if (o.t) o.P.text = o.t; if (o.s) o.P.save = o.s;
      if (o.o) o.P.output = o.o; if (o.f) o.P.setFontSize = o.f; });
    return { n: cap.length, setFontSize: fs, err: err, toasts: toasts,
             tipoJspdf: typeof window.jspdf, txt: cap } },

  /* ══ EL PPT, POR SUS INSUMOS. generarPPT arranca TRES modales encadenados (tema,
     presentador, imagenes) y lee el estudio GUARDADO, no el formulario: emitirlo desde una
     sonda seria conducir tres dialogos para medir algo que se deriva de inf.campos. Se miden
     los insumos de la mitral —_pptSel sobre los dos grados y _pptTxt sobre el informe—, y
     la identidad de campos la cubre camposActuales() en la misma escena. */
  pptInsumos() {
    var s = function(id){ try { return (typeof _pptSel === 'function') ? String(_pptSel(id)) : 'SIN _pptSel' }
      catch(e) { return 'EXC ' + e.message } };
    var t = document.getElementById('informe_texto');
    var txt = t ? String(t.value || t.textContent || '') : '';
    return { em: s('em_grado'), im: s('im_grado'), vm: s('vm_morf'),
             infLargo: txt.length,
             infSan: (typeof _pptTxt === 'function') ? String(_pptTxt(txt)).length : 'SIN _pptTxt' } },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleValvPill','showTab','limpiarCampos','calcEM',
                  'emCategoria','setEstiloInforme','calcContIM','calcIM_ESC','calcTHP',
                  'guardarInforme','editarInforme','getInformes','_labExcelRow','vPlaus',
                  'valvDatosTog','valvGradoVisSync','calcIA_ESC','_labValvCounts','generarPDFReal']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('bloque-em-detalle')) return { listo:false, por:'sin bloque-em-detalle' };
    if (!document.getElementById('bloque-insuf-mitral')) return { listo:false, por:'sin bloque-insuf-mitral' };
    if (!document.getElementById('im-vc-ref')) return { listo:false, por:'sin im-vc-ref' };
    /* ⚠️ LOS ENVOLTORIOS NO SON PRECONDICION, SON DATO. Esta sonda corre contra HEAD y contra el
       arbol nuevo, y en HEAD los caja-* no existen todavia: exigirlos aqui habria hecho imposible
       el A/B — el lado HEAD habria abortado con un error en vez de dar la medicion contra la cual
       comparar. Se informan y el reporte dice de que lado estan. */
    return { listo:true,
             cajaEsten: !!document.getElementById('caja-esten-mitral'),
             cajaInsuf: !!document.getElementById('caja-insuf-mitral'),
             togEsten: !!document.getElementById('datos-tog-esten-mitral'),
             togInsuf: !!document.getElementById('datos-tog-insuf-mitral') };
  }
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
  /* ⚠️ ESTADO DE PARTIDA DE ESTA SONDA: `limpiar()` + `abrirCard()`. `limpiar()` borra las ocho
     claves `valv-pill-*` y apaga las pastillas que estuvieran prendidas, asi que cada escena
     arranca con «el medico no toco ningun boton todavia» — que es la condicion que el
     auto-prendido mira. `abrirCard()` NO prende ni escribe ningun display. */
  const cero = async () => {
    await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
    const d = await J(`window.__P.abrirCard()`);
    if (!d.ok) throw new Error('DENOMINADOR: la tarjeta mitral no quedo abierta con las dos pastillas apagadas: ' + JSON.stringify(d));
    return d;
  };
  /* Prende o apaga una pastilla con un CLIC REAL sobre el boton, no con `toggleValvPill()`: el
     gesto que se mide es el del medico. Devuelve como se activo, para que el reporte lo diga. */
  const pastilla = async (valv, tipo, quiero) => {
    const antes = await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`);
    if (antes === quiero) return { yaEstaba: antes };
    const via = await clicEn('pill-' + tipo + '-' + valv);
    await pausa(160);
    const despues = await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`);
    return { via, antes, despues, ok: despues === quiero };
  };

  if (hacer('DEN')) { out.DEN = await cero(); }

  /* ══ VIS — las cuatro escenas de pastilla x pastilla a 1200 px ════════════════════════════
     Lo que la tanda afirma: los CAMPOS se ven en las cuatro; el GRADO sigue colgando del boton.
     Dos controles en la misma foto: la AORTICA (positivo — ya se veia, asi que un `false` ahi
     delata una sonda sobre un arbol cerrado) y los dos bloques de GRADO de la mitral
     (negativo — si se vieran con la pastilla apagada, la pantalla estaria afirmando). */
  if (hacer('VIS')) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
    const vis = {};
    for (const [etq, em, im] of [['off_off', false, false], ['on_off', true, false],
                                 ['off_on', false, true], ['on_on', true, true]]) {
      paso('VIS ' + etq);
      await cero();
      const g = {};
      if (em) g.clicEM = await pastilla('mitral', 'esten', true);
      if (im) g.clicIM = await pastilla('mitral', 'insuf', true);
      await pausa(220);
      vis[etq] = { gestos: g, foto: await J(`window.__P.visFoto()`),
                   datos: await J(`window.__P.datosFoto()`),
                   desborde: await J(`window.__P.desborde()`) };
    }
    /* Y la escena del APAGADO DESPUES DE PRENDER, que es otro camino al mismo estado: el
       `style.display` inline lo escribe el toggle al cerrar, y es lo que leen las compuertas. */
    paso('VIS tras_apagar');
    await cero();
    await pastilla('mitral', 'esten', true);
    await pastilla('mitral', 'insuf', true);
    const traPrender = await J(`window.__P.visFoto()`);
    await pastilla('mitral', 'esten', false);
    await pastilla('mitral', 'insuf', false);
    await pausa(200);
    vis.tras_apagar = { traPrender, foto: await J(`window.__P.visFoto()`) };
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.VIS = vis;
  }

  /* ══ MOV — 1200, 390 y 360 px ══════════════════════════════════════════════════════════════
     A 1200 px los campos se ven con la pastilla apagada. A 390 y 360 arrancan PLEGADOS y los
     abre el boton «Datos», que tiene que medir 44 px de alto y la fila entera de ancho. Se mide
     con la pastilla APAGADA y con la pastilla PRENDIDA: en el celular el boton azul ya no abre
     los campos, y eso es parte de «se comporta como las otras valvulas». */
  if (hacer('MOV')) {
    const mov = {};
    for (const w of [1200, 390, 360]) {
      for (const pren of [false, true]) {
        paso('MOV ' + w + (pren ? ' pastillas prendidas' : ' pastillas apagadas'));
        await cdp.send('Emulation.setDeviceMetricsOverride',
          { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 }, sessionId);
        await pausa(220);
        await cero();
        if (pren) { await pastilla('mitral', 'esten', true); await pastilla('mitral', 'insuf', true); }
        await pausa(220);
        const k = w + (pren ? '_prendidas' : '_apagadas');
        mov[k] = {
          global: await J(`window.__P.desborde()`),
          tarjeta: await J(`window.__P.desbordeDe('ete-seccion-valv-mitral')`),
          campos_em: await J(`window.__P.desbordeDe('bloque-em-detalle')`),
          campos_im: await J(`window.__P.desbordeDe('bloque-insuf-mitral')`),
          caja_em: await J(`window.__P.desbordeDe('caja-esten-mitral')`),
          caja_im: await J(`window.__P.desbordeDe('caja-insuf-mitral')`),
          datos: await J(`window.__P.datosFoto()`),
          vis: await J(`window.__P.visFoto()`),
          colsEsten: await J(`window.__P.cols('#bloque-em-detalle .valv-cols-3')`),
          colsInsuf: await J(`window.__P.cols('#bloque-insuf-mitral .valv-cols-4')`),
        };
        /* En el celular, abrir el cajon con el boton «Datos» y volver a medir. A 1200 px el
           boton esta oculto por el CSS, asi que el toggle se informa y no se mide de nuevo. */
        if (w < 768 && !pren) {
          const t1 = await clicEn('datos-tog-esten-mitral');
          const t2 = await clicEn('datos-tog-insuf-mitral');
          await pausa(220);
          mov[k].trasDatos = { clicEM: t1, clicIM: t2,
            datos: await J(`window.__P.datosFoto()`),
            vis: await J(`window.__P.visFoto()`),
            global: await J(`window.__P.desborde()`),
            campos_em: await J(`window.__P.desbordeDe('bloque-em-detalle')`),
            campos_im: await J(`window.__P.desbordeDe('bloque-insuf-mitral')`),
            colsEsten: await J(`window.__P.cols('#bloque-em-detalle .valv-cols-3')`),
            colsInsuf: await J(`window.__P.cols('#bloque-insuf-mitral .valv-cols-4')`) };
        }
      }
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.MOV = mov;
  }

  /* ══ PXD — pastilla x dato, por lesion ════════════════════════════════════════════════════
     El dato se SIEMBRA con `set()` y no con teclas, a proposito: tiene que ser el MISMO insumo
     en los dos lados del A/B, y en HEAD los campos de la mitral NO TIENEN GEOMETRIA con la
     pastilla apagada —no se pueden tipear—. Lo que esta escena compara es el informe y el EN
     SUMA, no el gesto; el gesto con teclas reales va en TCL. */
  if (hacer('PXD')) {
    const DATO = { esten: { avm_plan: '1.3', em_gmedio: '7', thp: '150' },
                   insuf: { im_vc: '5', im_jet_area: '9', ai_area: '28',
                            pisa_r: '7', pisa_val: '40', im_itv: '130' } };
    const pxd = {};
    for (const tipo of ['esten', 'insuf']) {
      for (const esc of ['sinDato', 'conDato', 'apagadaAManoConDato', 'prendidaAManoSinDato']) {
        paso('PXD ' + tipo + ' ' + esc);
        await cero();
        const g = {};
        if (esc === 'conDato' || esc === 'apagadaAManoConDato') {
          /* La Vmax IM va en la unidad que el archivo medido declara: es el MISMO dato fisico. */
          const uni = await ev(`(function(){ var e = document.getElementById('im_vmax');
            return e ? (e.getAttribute('placeholder') || '') : '?' })()`);
          const d = Object.assign({}, DATO[tipo]);
          if (tipo === 'insuf') d.im_vmax = (/m\/s/.test(uni) && !/cm\/s/.test(uni)) ? '5' : '500';
          g.sembrado = await J(`window.__P.sembrar(${JSON.stringify(d)})`);
          await pausa(180);
        }
        if (esc === 'apagadaAManoConDato') g.apagar = await pastilla('mitral', tipo, false);
        if (esc === 'prendidaAManoSinDato') g.prender = await pastilla('mitral', tipo, true);
        await pausa(180);
        pxd[tipo + '_' + esc] = { gestos: g,
          pill: await ev(`window.__P.pill('mitral', ${JSON.stringify(tipo)})`),
          ls: await ev(`window.__P.lsPill('mitral', ${JSON.stringify(tipo)})`),
          grados: await J(`window.__P.gradoFoto()`),
          vis: await J(`window.__P.visFoto()`),
          informe: await ev(`window.__P.informe('estandar')`),
          enSuma: await ev(`window.__P.enSuma()`) };
      }
    }
    out.PXD = pxd;
  }

  /* ══ TCL — TECLAS REALES con la pastilla apagada ═══════════════════════════════════════════
     `thp` vive en el Doppler mitral y es alcanzable en los DOS lados: es el control que prueba
     que el arnes tipea de verdad. `avm_plan` e `im_vc` viven dentro de los bloques de la mitral:
     en HEAD el arnes va a informar `sinFoco` —un campo sin geometria no se puede enfocar, y eso
     es un HECHO sobre la app, no un fallo de la sonda— y con el commit A tienen que entrar. */
  if (hacer('TCL')) {
    const tcl = {};
    for (const [etq, id, valor, tipo] of [
      ['thp_control', 'thp', '150', 'esten'],
      ['avm_plan', 'avm_plan', '1.3', 'esten'],
      ['im_vc', 'im_vc', '5', 'insuf'],
      ['em_dtsvi', 'em_dtsvi', '21', 'esten'],
    ]) {
      paso('TCL ' + etq);
      await cero();
      const t = await tipear(id, valor);
      await pausa(180);
      tcl[etq] = { tipeo: t, pill: await ev(`window.__P.pill('mitral', ${JSON.stringify(tipo)})`),
                   grados: await J(`window.__P.gradoFoto()`),
                   vc: await J(`window.__P.vcFoto()`),
                   informe: await ev(`window.__P.informe('estandar')`),
                   enSuma: await ev(`window.__P.enSuma()`) };
      /* Y el BORRADO con Backspace, digito por digito, en el mismo campo. */
      paso('TCL ' + etq + ' borrar');
      tcl[etq].borrado = await borrarConBackspace(id, 'vcFoto');
      tcl[etq].trasBorrar = { grados: await J(`window.__P.gradoFoto()`),
                              vc: await J(`window.__P.vcFoto()`),
                              informe: await ev(`window.__P.informe('estandar')`) };
    }
    out.TCL = tcl;
  }

  /* ══ AUTO — el auto-prendido y la durabilidad del apagado a mano ═══════════════════════════
     Las cuatro celdas de (1d): mitral/aortica x estenosis/insuficiencia, cargando el dato con la
     pastilla apagada y la clave de localStorage en null. Mas la durabilidad: apagar a mano y
     volver a cargar NO tiene que reprender. */
  if (hacer('AUTO')) {
    const a = {};
    const casos = [
      ['mitral_esten', 'esten', 'mitral', { avm_plan: '1.3' }],
      ['mitral_insuf', 'insuf', 'mitral', { im_vc: '5', im_jet_area: '9', ai_area: '28' }],
      ['aortica_esten', 'esten', 'aortica', { vmax_ao: '4.2' }],
      ['aortica_insuf', 'insuf', 'aortica', { ia_vc: '7', ia_pht: '180' }],
    ];
    for (const [etq, tipo, valv, dato] of casos) {
      paso('AUTO ' + etq);
      await cero();
      const antes = await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`);
      await J(`window.__P.sembrar(${JSON.stringify(dato)})`);
      await ev(`(function(){ try { if (typeof calcAo === 'function') calcAo() } catch(e){}
        try { if (typeof calcIA_ESC === 'function') calcIA_ESC() } catch(e){} return 1 })()`);
      await pausa(200);
      a[etq] = { antes, despues: await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`),
                 ls: await ev(`window.__P.lsPill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`),
                 grados: await J(`window.__P.gradoFoto()`) };
    }
    /* DURABILIDAD del apagado a mano, en la mitral y en la aortica. */
    for (const [etq, tipo, valv, d1, d2] of [
      ['durable_mitral_esten', 'esten', 'mitral', { avm_plan: '1.3' }, { avm_plan: '1.1' }],
      ['durable_aortica_esten', 'esten', 'aortica', { vmax_ao: '4.2' }, { vmax_ao: '4.6' }],
    ]) {
      paso('AUTO ' + etq);
      await cero();
      await J(`window.__P.sembrar(${JSON.stringify(d1)})`);
      await pausa(180);
      const trasCarga = await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`);
      const apagado = await pastilla(valv, tipo, false);
      await J(`window.__P.sembrar(${JSON.stringify(d2)})`);
      await pausa(180);
      a[etq] = { trasCarga, apagado,
                 trasSegundaCarga: await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`),
                 ls: await ev(`window.__P.lsPill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`),
                 grados: await J(`window.__P.gradoFoto()`) };
    }
    out.AUTO = a;
  }

  /* ══ VC — commit B: la fila de la vena contracta ═══════════════════════════════════════════
     Los dos bordes de los cortes de IM (`IM_CORTES.vc`: leve < 3, severa >= 7) por los dos
     lados, con TECLAS REALES, y el borrado. La fila tiene que mostrar el valor con «mm» y volver
     a «—». El GRADO se mira en la misma foto: no se tiene que mover por esto. */
  if (hacer('VC')) {
    const vc = {};
    for (const v of ['2.9', '3.0', '6.9', '7.0']) {
      paso('VC ' + v);
      await cero();
      await pastilla('mitral', 'insuf', true);
      const t = await tipear('im_vc', v);
      await pausa(180);
      vc[v] = { tipeo: t, foto: await J(`window.__P.vcFoto()`),
                grados: await J(`window.__P.gradoFoto()`),
                informe: await ev(`window.__P.informe('estandar')`),
                enSuma: await ev(`window.__P.enSuma()`) };
    }
    /* Borrado con Backspace desde 7,0, leyendo la fila tras CADA tecla. */
    paso('VC borrado');
    await cero();
    await pastilla('mitral', 'insuf', true);
    await tipear('im_vc', '7.0');
    vc.borrado = await borrarConBackspace('im_vc', 'vcFoto');
    vc.trasBorrado = { foto: await J(`window.__P.vcFoto()`),
                       grados: await J(`window.__P.gradoFoto()`),
                       informe: await ev(`window.__P.informe('estandar')`),
                       enSuma: await ev(`window.__P.enSuma()`) };
    /* FUERA DE BANDA: `vPlaus('im_vc')` marca, y la fila nueva tiene que decir lo mismo que el
       aviso de votantes fuera de banda — no publicar un numero imposible sin marca. */
    paso('VC fuera de banda');
    await cero();
    await pastilla('mitral', 'insuf', true);
    const tf = await tipear('im_vc', '300');
    vc.fueraDeBanda = { tipeo: tf, foto: await J(`window.__P.vcFoto()`),
                        grados: await J(`window.__P.gradoFoto()`),
                        banda: await J(`(function(){ try { return vPlaus('im_vc') }
                          catch(e) { return { err: e.message } } })()`) };
    /* CONTROL NEGATIVO: sin vena contracta la fila dice «—» y los otros tres parametros SI
       publican. Una fila que dijera un numero sin dato seria el defecto de la familia del PISA. */
    paso('VC control negativo');
    await cero();
    await pastilla('mitral', 'insuf', true);
    await J(`window.__P.sembrar({ pisa_r:'7', pisa_val:'40', im_itv:'130',
      im_vmax: (function(){ var e=document.getElementById('im_vmax');
        return /cm\\/s/.test(e ? e.getAttribute('placeholder') : '') ? '500' : '5' })() })`);
    await pausa(200);
    vc.sinVC = { foto: await J(`window.__P.vcFoto()`), grados: await J(`window.__P.gradoFoto()`) };
    out.VC = vc;
  }

  /* ══ SUP — las superficies, UNA POR UNA ════════════════════════════════════════════════════
     informe narrativo (3 estilos), EN SUMA, Excel (n y fila completa), campos del formulario,
     insumos del PDF, panel de Evidencia, Laboratorio y los insumos del PPT. Con las dos
     pastillas PRENDIDAS, que es el estado en que todas las superficies tienen algo que decir. */
  if (hacer('SUP')) {
    const uni = await ev(`(function(){ var e = document.getElementById('im_vmax');
      return e ? (e.getAttribute('placeholder') || '') : '?' })()`);
    const vmax = /m\/s/.test(uni) && !/cm\/s/.test(uni) ? 5 : 500;
    for (const [etq, prender] of [['prendidas', true], ['apagadas', false]]) {
      paso('SUP ' + etq);
      await cero();
      if (prender) { await pastilla('mitral', 'esten', true); await pastilla('mitral', 'insuf', true); }
      await ev(`(function(){ window.__P.sembrar(${JSON.stringify(ESCENA(vmax))}); return 1 })()`);
      await pausa(300);
      const sup = { unidadLeida: uni, vmaxUsada: vmax, informe: {} };
      for (const est of ['conciso', 'estandar', 'narrativo']) {
        sup.informe[est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
      }
      sup.enSuma = await ev(`window.__P.enSuma()`);
      const xl = await J(`window.__P.excel()`);
      sup.excelN = xl.n || null;
      sup.excelFila = xl.fila || null;
      sup.campos = await J(`window.__P.camposActuales()`);
      sup.pantalla = await J(`window.__P.pisaFoto()`);
      sup.autos = await J(`window.__P.autosFoto()`);
      sup.vc = await J(`window.__P.vcFoto()`);
      sup.grados = await J(`window.__P.gradoFoto()`);
      sup.pdfInsumos = await J(`window.__P.pdfInsumos()`);
      sup.pdfTexto = await J(`window.__P.pdfTexto()`);
      sup.panel = await J(`window.__P.panelFoto()`);
      sup.lab = await J(`window.__P.labFoto()`);
      sup.ppt = await J(`window.__P.pptInsumos()`);
      sup.filasRefInsuf = await J(`window.__P.filasRef('bloque-insuf-mitral')`);
      sup.censoEsten = await J(`window.__P.censo('bloque-em-detalle')`);
      sup.censoInsuf = await J(`window.__P.censo('bloque-insuf-mitral')`);
      out['SUP_' + etq] = sup;
    }
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
