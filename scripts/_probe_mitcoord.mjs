#!/usr/bin/env node
/**
 * _probe_mitcoord.mjs — sonda A/B de SOLO LECTURA para las DOS partes de la tanda de la mitral
 * del 2026-10-08. No muta index.html: comprueba su md5 al principio y al final.
 *
 *   ETE — el area de Wilkins por ETE: quien la lee (categoria, informe nativo y protesico, EN
 *         SUMA, PDF, Evidencia, espejo del TEER), con el caso avm_ete = 150 y el escenario SIN
 *         avm_ete como control negativo.
 *   C/D/E/F/G — los cinco datos coordinados. Por cada uno, la matriz de GESTOS con TECLAS REALES
 *         del navegador (Input.dispatchKeyEvent): tipear en cada lugar y borrar en cada lugar, con
 *         el bloque de la mitral ABIERTO y CERRADO, leyendo los cinco lugares y los calculos.
 *   MOV — 1200, 390 y 360 px: desborde y barra horizontal.
 *
 *   node scripts/_probe_mitcoord.mjs --file /tmp/index.HEAD.html > /tmp/mc.HEAD.json
 *   node scripts/_probe_mitcoord.mjs                             > /tmp/mc.NEW.json
 *   node scripts/_probe_mitcoord.mjs --solo E --ver
 *
 * Infraestructura (servidor + Chrome + CDP + cierre del arbol de procesos + teclas reales)
 * calcada de scripts/_probe_emauto.mjs.
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
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  ro(id)  { var e = document.getElementById(id); return e ? !!e.readOnly : null },
  oninput(id){ var e = document.getElementById(id); return e ? (e.getAttribute('oninput')||'') : null },
  lbl(id) { var e = document.getElementById(id);
    var p = e && e.parentNode ? e.parentNode.querySelector('label') : null;
    return p ? p.textContent.trim().replace(/\\s+/g,' ') : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },
  existe(id) { return !!document.getElementById(id) },

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

  /* ══ DENOMINADOR. Abre Valvulas, las cuatro tarjetas, las pastillas de la mitral y de la
     aortica, y los cajones «Datos» de la aortica —en celular arrancan plegados—. CONFIRMA que los
     DIEZ campos que esta tanda tipea tienen geometria: una sonda sobre un arbol cerrado tipea en
     la nada, el campo queda vacio y todo sale «sin cambios». */
  abrirTodo() {
    try { showTab('valvulas') } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    ['mitral','aortica'].forEach(function(v){ ['esten','insuf'].forEach(function(t){
      var p = document.getElementById('pill-' + t + '-' + v);
      if (p && !p.classList.contains('btn-primary')) { try { toggleValvPill(v,t) } catch(e){} }
    })});
    ['caja-esten-aortica','caja-insuf-aortica'].forEach(function(c){
      var b = document.getElementById(c);
      if (b && !b.classList.contains('valv-datos-abierto')) { try { valvDatosTog(c) } catch(e){} }
    });
    var det = document.getElementById('bloque-em-detalle');
    if (det) det.style.display = 'block';
    var CAMPOS = ['em_dtsvi','im_dtsvi','ea_dtsvi','em_vtitsvi','im_itv_tsvi','ea_vtitsvi',
                  'im_ai_area','em_thp_display','vtim','avm_plan'];
    var sinGeo = CAMPOS.filter(function(id){ return window.__P.vis(id) !== true });
    return { tab: window.__P.vis('tab-valvulas'), sinGeo: sinGeo, ok: sinGeo.length === 0,
             pillEM: window.__P.pill('mitral','esten'), pillIM: window.__P.pill('mitral','insuf') } },

  /* Cierra LAS DOS pastillas de la mitral: es el escenario «bloque plegado» de la verificacion. */
  plegarMitral() {
    ['esten','insuf'].forEach(function(t){
      try { if (window.__P.pill('mitral',t) === true) toggleValvPill('mitral',t) } catch(e){}
    });
    var det = document.getElementById('bloque-em-detalle');
    return { pillEM: window.__P.pill('mitral','esten'), pillIM: window.__P.pill('mitral','insuf'),
             detalle: det ? getComputedStyle(det).display : 'NO EXISTE',
             visEmDtsvi: window.__P.vis('em_dtsvi'), visImDtsvi: window.__P.vis('im_dtsvi') } },

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

  /* ⚠️ SIN EVENTOS, Y HACE FALTA PARA ARMAR UN GUARDADO CON VALORES DIVERGENTES. Con set() cada
     asignacion despacha input, y desde esta tanda eso dispara la coordinacion: sembrar 19, 21,
     23, 25 y 27 en los cinco campos del O TSVI deja los CINCO en 27, porque cada uno pisa al
     anterior. Medido — la primera corrida informo «27 en los cinco» y eso no es el estudio que la
     escena dice armar. Un estudio guardado ANTES de esta tanda trae sus valores por el barrido de
     restauracion, que escribe .value y no despacha nada: esto es exactamente eso. */
  setRaw(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    return { id: id, leido: e.value } },

  /* GUARDAR de verdad: guardarInforme toma un callback, el guardado es ASINCRONO (IndexedDB con
     respaldo en localStorage) y puede aparecer la card de severidades, que hay que CONFIRMAR con
     su propio boton. Calcado del arnes de la suite, incluido el _ettEditandoId = null que evita
     el modal de «sobreescribir / guardar como nuevo». La clave del estudio es estudioId y no
     id: mi primera version leyo .id y el reabrir tiraba «Cannot read properties of undefined». */
  guardar() {
    window._ettEditandoId = null;
    var antes = new Set(getInformes().map(function(i){ return i.estudioId }));
    return new Promise(function(resolve){
      var alTerminar = function(ok){
        var nuevo = getInformes().find(function(i){ return !antes.has(i.estudioId) });
        resolve({ ok: ok === true, estudioId: nuevo ? nuevo.estudioId : null });
      };
      try { guardarInforme(alTerminar) } catch(e) { resolve({ ok:false, error:String(e) }); return }
      var cf = document.getElementById('rev-confirm');
      if (cf) cf.click();
    }) },
  reabrir(estudioId) { try { cargarEstudioPorId(estudioId); return 'ok' }
    catch(e) { return 'EXC: ' + e.message } },
  borrarEstudio(estudioId) {
    if (!estudioId) return Promise.resolve(false);
    return CeiboStore.setLocal(getInformes().filter(function(i){ return i.estudioId !== estudioId })) },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      c[el.id] = el.value });
    return c },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-08', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },

  excelCols() {
    try { var k = Object.keys(_labExcelRow({ id:0, campos:{} }));
      return (typeof _labOrdenarCols === 'function' ? _labOrdenarCols(k) : k).length }
    catch(e) { return 'EXC: ' + e.message } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* POR LINEA Y NO POR ORACION: el informe se arma con inf.push(...) y se une por salto de linea. */
  frasesVM(texto) {
    var re = /mitral|\\bVM\\b|\\bEM\\b|\\bIM\\b|AVm/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },
  /* CONTROL NEGATIVO: las lineas de las OTRAS TRES valvulas y del Doppler mitral. */
  frasesOtras(texto) {
    var re = /a[\\u00f3o]rtic|tric[\\u00fau]sp|pulmonar|llenado|diast[\\u00f3o]lic|\\bE\\/A\\b/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },

  /* ══ LOS CINCO LUGARES DE CADA DATO, mas los calculos que dependen de el ══ */
  fotoTsvi() { return {
    aivi: this.val('diam_tsvi_ao'), dop: this.val('diam_tsvi'), ea: this.val('ea_dtsvi'),
    em: this.val('em_dtsvi'), im: this.val('im_dtsvi'),
    vs: this.txt('vs-val'), ava: this.val('ava_cont'), dvi: this.txt('dvi-val'),
    eaAva: this.val('ea_ava_display'), gc: this.txt('hemo-gc'), ic: this.txt('hemo-ic'),
    avmCont: this.val('avm_cont'), emContRow: this.txt('em-cont-row'),
    imFr: this.txt('freg-val'), imJet: this.txt('im-jet-ratio'), imGrado: this.val('im_grado') } },
  fotoVti() { return {
    dop: this.val('itv_tsvi'), ea: this.val('ea_vtitsvi'),
    em: this.val('em_vtitsvi'), im: this.val('im_itv_tsvi'),
    vs: this.txt('vs-val'), ava: this.val('ava_cont'), dvi: this.txt('dvi-val'),
    eaAva: this.val('ea_ava_display'),
    avmCont: this.val('avm_cont'), emContRow: this.txt('em-cont-row'),
    imFr: this.txt('freg-val'), imJet: this.txt('im-jet-ratio'), imGrado: this.val('im_grado'),
    imRatio: this.txt('im-vti-ratio') } },
  fotoAi() { return {
    aivi: this.val('ai_area'), im: this.val('im_ai_area'),
    aiInterp: this.txt('ai-area-interp'), imRatioAi: this.txt('im-jet-ratio'),
    imGrado: this.val('im_grado') } },
  fotoThp() { return {
    dop: this.val('thp'), valv: this.val('em_thp_display'),
    avmThp: this.val('avm_thp'), avmThpDisp: this.val('em_avm_thp_display'),
    thpRow: this.txt('em-thp-row'), avmIdx: this.val('avm_idx'),
    emGrado: this.val('em_grado'),
    catClave: (function(){ try { return emCategoria().clave } catch(e) { return 'EXC' } })() } },
  fotoVtim() { return {
    dop: this.val('itv_mitral'), valv: this.val('vtim'),
    volR: this.txt('volr-val'), fr: this.txt('freg-val'), eroa: this.txt('eroa-val'),
    imRatio: this.txt('im-vti-ratio'), imGrado: this.val('im_grado'),
    emVtimit: this.val('em_vtimit') } },

  /* ══ LA FOTO DEL AREA POR ETE: quien la lee hoy ══ */
  fotoEte() { return {
    avm_ete: this.val('avm_ete'), avm_plan: this.val('avm_plan'),
    visible: this.vis('avm_ete'),
    aria: (function(){ var e = document.getElementById('avm_ete');
      return e ? e.getAttribute('aria-hidden') : null })(),
    tabindex: (function(){ var e = document.getElementById('avm_ete');
      return e ? e.getAttribute('tabindex') : null })(),
    planRow: this.txt('em-plan-row'),
    pdfPlanVal: this.txt('em-pdf-plan-val'),
    pdfPlanChk: (function(){ var e = document.getElementById('em_pdf_plan');
      return e ? { marcado: e.checked, deshab: e.disabled } : null })(),
    pdfVal: (function(){ try { return emAvmPdfVal() } catch(e) { return 'EXC: ' + e.message } })(),
    teerArea: this.val('teer_area_mitral'),
    emGrado: this.val('em_grado'),
    cat: (function(){ try { var c = emCategoria();
      return { clave: c.clave, fuentes: c.fuentes.map(function(f){ return f.fuente + '=' + f.avm }),
               sev: c.sev.map(function(f){ return f.fuente }),
               noSev: c.noSev.map(function(f){ return f.fuente }),
               revisar: c.revisar.map(function(r){ return r.fuente + '=' + r.avm }) } }
      catch(e) { return 'EXC: ' + e.message } })(),
    mide: (function(){ try { return typeof _PDF_METODOS === 'object'
      ? (_PDF_METODOS.em_pdf_plan || []).join(',') : 'SIN _PDF_METODOS' }
      catch(e) { return 'EXC' } })() } },

  /* El espejo del TEER: se abre el acordeon por la MISMA puerta que el medico. */
  abrirTeer() {
    try { showTab('ete') } catch(e) {}
    try { if (typeof sincronizarTEERDesdeGlobal === 'function') sincronizarTEERDesdeGlobal() } catch(e) {}
    return { teerArea: this.val('teer_area_mitral') } },

  /* ══ Evidencia: la seccion de EM del panel. indicRender pinta dentro de #indic-cuerpo. ══ */
  evidencia() {
    try { if (typeof indicRender === 'function') indicRender() } catch(e) { return { err: 'indicRender: ' + e.message } }
    var cont = document.getElementById('indic-cuerpo');
    if (!cont) return { err: 'SIN #indic-cuerpo' };
    var secs = Array.from(cont.querySelectorAll('summary, h3, h4')).map(function(h){
      return (h.textContent||'').trim().replace(/\\s+/g,' ') });
    var filas = Array.from(cont.querySelectorAll('tr')).map(function(r){
      return (r.textContent||'').trim().replace(/\\s+/g,' ') }).filter(Boolean);
    return { secciones: secs.length, titulos: secs, filas: filas.length,
             conEte: filas.filter(function(f){ return /ETE/i.test(f) }),
             todas: filas } },

  /* ══ Laboratorio: la fila de estenosis mitral ══ */
  labEM() {
    try {
      if (typeof _labEstenSev !== 'function') return 'SIN _labEstenSev';
      return { em: _labEstenSev('em_grado', { em_grado: window.__P.val('em_grado') }) };
    } catch(e) { return 'EXC: ' + e.message } },

  /* ══ PPT: la franja de la mitral ══ */
  ppt() {
    try { if (typeof _pptSel !== 'function') return 'SIN _pptSel';
      return { em: _pptSel('em_grado'), im: _pptSel('im_grado') } }
    catch(e) { return 'EXC: ' + e.message } },

  desborde() {
    var d = document.documentElement;
    return { scrollW: d.scrollWidth, clientW: d.clientWidth, hayBarra: d.scrollWidth > d.clientWidth + 1 } },
  desbordeDe(id) {
    var e = document.getElementById(id); if (!e) return null;
    var r = e.getBoundingClientRect(), d = document.documentElement;
    return { der: Math.round(r.right), clientW: d.clientWidth, desborda: r.right > d.clientWidth + 1,
             w: Math.round(r.width) } },

  /* ══ CABLEADO: los oninput de los diez campos y las listas de coordinacion ══ */
  cableado() {
    var ids = ['diam_tsvi_ao','diam_tsvi','ea_dtsvi','em_dtsvi','im_dtsvi',
               'itv_tsvi','ea_vtitsvi','em_vtitsvi','im_itv_tsvi',
               'ai_area','im_ai_area','thp','em_thp_display','itv_mitral','vtim','em_vtimit',
               'avm_ete','avm_plan','teer_area_mitral'];
    var o = {};
    ids.forEach(function(id){ o[id] = { oninput: window.__P.oninput(id), ro: window.__P.ro(id),
      lbl: window.__P.lbl(id) } });
    return { campos: o,
      eaPares: (function(){ try { return Object.keys(window._EA_PARES || {}).length } catch(e){ return 'EXC' } })(),
      espejos: (function(){ try { return (window._ESPEJOS_TODOS || []).map(function(p){ return p.join('>') }) } catch(e){ return 'EXC' } })(),
      tsviDiam: (function(){ try { return typeof window.tsviDiamSync === 'function'
        ? String(window.tsviDiamSync).replace(/\\s+/g,' ').slice(0, 400) : 'NO' } catch(e){ return 'EXC' } })(),
      tsviEditado: (function(){ try { return typeof window.tsviDiamEditado === 'function'
        ? (String(window.tsviDiamEditado).match(/[a-zA-Z_$][\\w$]*\\(\\)/g) || []).join(',') : 'NO' } catch(e){ return 'EXC' } })() } },

  /* im_espejos: el registro y su centinela. */
  espejosHidden() { var e = document.getElementById('im_espejos'); return e ? e.value : null },
  marcas() {
    var o = {};
    (window._ESPEJOS_TODOS || []).forEach(function(p){
      var el = document.getElementById(p[1]);
      if (el) o[p[1]] = { v: el.value, de: el.dataset.espejoDe === undefined ? null : el.dataset.espejoDe,
        vivo: el.dataset.espejoVivo || null, inf: el.dataset.espejoInferido || null } });
    return o },

  guardados() { try { return getInformes().map(function(i){
      return { id: i.id, nombre: i.nombre } }) } catch(e) { return 'EXC: ' + e.message } },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleValvPill','showTab','limpiarCampos','calcEM',
                  'emCategoria','setEstiloInforme','calcContIM','calcIM_ESC','calcAI','calcTHP',
                  'calcAo','tsviDiamEditado','eaParEditado','imSyncSiExiste','emSyncSiExiste',
                  'guardarInforme','editarInforme','getInformes','_labExcelRow']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('em_dtsvi')) return { listo:false, por:'sin em_dtsvi' };
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
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + (r.exceptionDetails.exception || {}).description);
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
    /* ⚠️ `setSelectionRange` LANZA en un `input[type=number]` —no soporta seleccion— y el `try`
       la tragaba, asi que el caret quedaba donde estuviera. Al enfocar por clic el caret cae donde
       se clickeo; para que el Backspace muerda desde el final se enfoca y se manda `End`. */
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    await tecla('End', null);
    const pasos = [];
    for (let i = 0; i < 12; i++) {
      const v0 = await ev(`window.__P.val(${JSON.stringify(id)})`);
      if (v0 === '' || v0 === null) break;
      await tecla('Backspace', null);
      await pausa(70);
      pasos.push({ tras: i + 1, campo: await ev(`window.__P.val(${JSON.stringify(id)})`),
                   ...(foto ? JSON.parse(await ev(`JSON.stringify(window.__P.${foto}())`)) : {}) });
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})); e.blur() } return 1 })()`);
    await pausa(120);
    return { via, pasos };
  }

  await ev(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);

  await ev(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await ev(SONDA);
  const chequeo = JSON.parse(await ev(`JSON.stringify(window.__P.listo())`));
  if (!chequeo.listo) throw new Error('LA APP NO ESTA LISTA: ' + JSON.stringify(chequeo));

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y SE COME TODOS LOS CLICS. Se cierra con su propio
     boton, como lo cierra el medico, y se COMPRUEBA que se fue antes de medir nada: con el overlay
     puesto, ninguna escena de clic ni de foco por clic significa nada. */
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
    throw new Error('EL AVISO LEGAL SIGUE PUESTO (' + avisoCerrado + ') — ningun clic llegaria al arbol');
  }

  const out = { archivo: FARG, listoApp: chequeo,
    aviso: { boton: avisoBtn, clic: avisoClic, display: avisoCerrado } };
  const hacer = (k) => !SOLO || SOLO === k;

  /* ══ HELPERS DE ESCENA ════════════════════════════════════════════════════════════════════ */
  /* DENOMINADOR DURO: el estado de partida ABORTA si los diez campos no tienen geometria. */
  const base = async () => {
    await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
    const d = JSON.parse(await ev(`JSON.stringify(window.__P.abrirTodo())`));
    if (!d.ok) throw new Error('DENOMINADOR: campos sin geometria: ' + JSON.stringify(d));
    return d;
  };
  const fotoDe = async (f) => JSON.parse(await ev(`JSON.stringify(window.__P.${f}())`));
  const textos = async (est) => {
    const r = JSON.parse(await ev(`JSON.stringify(window.__P.informe(${JSON.stringify(est || 'estandar')}))`));
    if (r.err) return { err: r.err };
    const vm = JSON.parse(await ev(`JSON.stringify(window.__P.frasesVM(
      (document.getElementById('informe_texto')||{}).value || ''))`));
    const otras = JSON.parse(await ev(`JSON.stringify(window.__P.frasesOtras(
      (document.getElementById('informe_texto')||{}).value || ''))`));
    return { vm, otras, suma: r.suma };
  };

  /* ══ ETE — el area de Wilkins por ETE ═════════════════════════════════════════════════════ */
  if (hacer('ETE')) {
    const E = { cableado: {} };
    E.cableado = JSON.parse(await ev(`JSON.stringify(window.__P.cableado())`));

    /* (1) CONTROL NEGATIVO: un estudio SIN avm_ete. Todo lo que siga tiene que salir identico a
       HEAD, y es lo que prueba que el cambio no se fue de su campo. */
    await base();
    E.sinEte_tipeo = await tipear('avm_plan', '1.2');
    E.sinEte_gmedio = await tipear('em_gmedio', '9');
    E.sinEte = await fotoDe('fotoEte');
    E.sinEte_txt = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) E.sinEte_txt[est] = await textos(est);
    E.sinEte_excelCols = await ev(`window.__P.excelCols()`);
    E.sinEte_evid = await fotoDe('evidencia');
    E.sinEte_lab = await fotoDe('labEM');
    E.sinEte_ppt = await fotoDe('ppt');

    /* (2) EL ETE COMO UNICA FUENTE: 1,2 cm² por ETE y nada mas. En HEAD VOTA severa. */
    await base();
    /* ⚠️ EL TECLEO SE INTENTA Y SE REGISTRA, Y DESPUES SE CARGA POR `set`. Despues del commit A
       el campo esta oculto, asi que NO HAY TECLA REAL QUE ENTRE: `tipear` devuelve `sinFoco` y el
       campo queda vacio. Medir solo eso daria un formulario SIN area por ETE, que no es la escena
       —seria un denominador roto que informa «el 150 no vota» sobre un campo vacio—. La escena que
       importa es «el nodo TIENE el valor y no vota», y la via por la que un estudio guardado lo
       trae es exactamente una asignacion con sus eventos, que es lo que hace `set`.
       El resultado del tecleo se conserva en el JSON porque en HEAD decia `ok:true` y ahora dice
       `sinFoco`: ESA es la mitad del cambio que se ve desde la pantalla. */
    E.soloEte_tipeo = await tipear('avm_ete', '1.2');
    E.soloEte_set = await ev(`JSON.stringify(window.__P.set('avm_ete','1.2'))`);
    E.soloEte = await fotoDe('fotoEte');
    E.soloEte_txt = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) E.soloEte_txt[est] = await textos(est);
    E.soloEte_evid = await fotoDe('evidencia');

    /* (3) EL CASO DE LA ORDEN: avm_ete = 150 (mm² donde van cm²). */
    await base();
    E.ete150_tipeo = await tipear('avm_ete', '150');
    E.ete150_set = await ev(`JSON.stringify(window.__P.set('avm_ete','150'))`);
    E.ete150 = await fotoDe('fotoEte');
    E.ete150_txt = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) E.ete150_txt[est] = await textos(est);

    /* (4) ETE + PLANIMETRIA: en HEAD la planimetria gana y el ETE no entra. */
    await base();
    await tipear('avm_plan', '1.1');
    E.ambos_tipeo = await tipear('avm_ete', '1.4');
    E.ambos_set = await ev(`JSON.stringify(window.__P.set('avm_ete','1.4'))`);
    E.ambos = await fotoDe('fotoEte');
    E.ambos_txt = await textos('estandar');

    /* (5) PROTESIS: la rama del informe protesico que imprime «AVm X cm² por ETE». */
    await base();
    await ev(`window.__P.set('vm_morf', 'Prótesis biológica')`);
    E.prot_morf = await ev(`window.__P.val('vm_morf')`);
    E.prot_tipeo = await tipear('avm_ete', '1.8');
    E.prot_set = await ev(`JSON.stringify(window.__P.set('avm_ete','1.8'))`);
    E.prot = await fotoDe('fotoEte');
    E.prot_txt = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) E.prot_txt[est] = await textos(est);

    /* (6) EL ESPEJO DEL TEER: avm_ete -> teer_area_mitral, con avm_plan VACIO (si hay
       planimetria, el primer _syncSiVacio ya lo llena y el espejo del ETE no se distingue). */
    await base();
    E.teer_tipeo = await tipear('avm_ete', '1.6');
    E.teer_set = await ev(`JSON.stringify(window.__P.set('avm_ete','1.6'))`);
    E.teer_antes = await fotoDe('abrirTeer');
    await ev(`try { showTab('valvulas') } catch(e) {}`);
    /* CONTROL: con planimetria cargada el TEER la recibe por el OTRO par, que no se toca. */
    await base();
    await tipear('avm_plan', '1.3');
    E.teer_porPlan = await fotoDe('abrirTeer');

    out.ETE = E;
  }

  /* ══ LOS CINCO DATOS — matriz de gestos con TECLAS REALES ═════════════════════════════════ */
  /* Cada dato se mide con el bloque de la mitral ABIERTO y PLEGADO, y en cada escena se tipea en
     UN lugar y se leen TODOS. El borrado va con Backspace digito por digito desde el final. */
  const DATOS = {
    C: { nom: 'Diam. TSVI', foto: 'fotoTsvi',
         lugares: ['diam_tsvi_ao', 'diam_tsvi', 'ea_dtsvi', 'em_dtsvi', 'im_dtsvi'], valor: '22' },
    D: { nom: 'VTI TSVI', foto: 'fotoVti',
         lugares: ['itv_tsvi', 'ea_vtitsvi', 'em_vtitsvi', 'im_itv_tsvi'], valor: '20' },
    E: { nom: 'Area AI', foto: 'fotoAi',
         lugares: ['ai_area', 'im_ai_area'], valor: '26' },
    F: { nom: 'THP', foto: 'fotoThp',
         lugares: ['thp', 'em_thp_display'], valor: '150' },
    G: { nom: 'VTI mitral de entrada', foto: 'fotoVtim',
         lugares: ['itv_mitral', 'vtim'], valor: '12' }
  };

  for (const clave of Object.keys(DATOS)) {
    if (!hacer(clave)) continue;
    const D = DATOS[clave];
    const R = { nombre: D.nom, lugares: D.lugares, valor: D.valor, abierto: {}, plegado: {} };

    for (const modo of ['abierto', 'plegado']) {
      const M = R[modo];
      /* DENOMINADOR del modo: con el bloque plegado hay que CONFIRMAR que esta plegado, o la
         distincion abierto/plegado no mide nada. */
      await base();
      if (modo === 'plegado') M.__estado = JSON.parse(await ev(`JSON.stringify(window.__P.plegarMitral())`));
      else M.__estado = { pillEM: await ev(`window.__P.pill('mitral','esten')`),
                          pillIM: await ev(`window.__P.pill('mitral','insuf')`) };
      M.__vacio = await fotoDe(D.foto);

      for (const origen of D.lugares) {
        paso(clave + '/' + modo + '/tipear ' + origen);
        await base();
        if (modo === 'plegado') await ev(`window.__P.plegarMitral()`);
        const t = await tipear(origen, D.valor);
        M['tipear ' + origen] = { tecleo: t, foto: await fotoDe(D.foto) };
      }

      /* BORRADO: se carga por un lugar y se borra por OTRO, que es donde HEAD repone. */
      for (const origen of D.lugares) {
        for (const donde of D.lugares) {
          if (origen === donde && D.lugares.length > 2) continue;
          paso(clave + '/' + modo + '/cargar ' + origen + ' borrar ' + donde);
          await base();
          if (modo === 'plegado') await ev(`window.__P.plegarMitral()`);
          const car = await tipear(origen, D.valor);
          const antes = await fotoDe(D.foto);
          const bor = await borrarConBackspace(donde, D.foto);
          M['cargar ' + origen + ' / borrar ' + donde] = {
            cargo: car, antes, borro: bor, despues: await fotoDe(D.foto) };
        }
      }
    }

    /* «Nuevo estudio» limpia TODOS los lugares del dato. */
    await base();
    await tipear(D.lugares[0], D.valor);
    R.antesDeNuevo = await fotoDe(D.foto);
    await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
    await ev(`window.__P.abrirTodo()`);
    R.trasNuevo = await fotoDe(D.foto);

    /* CONTROL NEGATIVO del dato: tocar OTRO campo del mismo bloque no mueve este dato. */
    await base();
    await tipear(D.lugares[0], D.valor);
    const ctrlId = (clave === 'F' || clave === 'G') ? 'em_gmedio' : 'em_gmedio';
    await tipear(ctrlId, '45');
    R.controlNegativo = { campo: ctrlId, foto: await fotoDe(D.foto) };

    out[clave] = R;
  }

  /* ══ RECALCULOS — el mismo escenario cargado desde CADA lugar da los MISMOS numeros ═══════ */
  if (hacer('RECALC')) {
    const R = {};
    /* Escenario completo: O TSVI 22, VTI TSVI 20, VTI Ao 24, Area AI 26, THP 150, VTI mitral 12,
       mas los insumos de IM que hacen hablar a la FR y al ratio. */
    /* ⚠️ EL DENOMINADOR DEL ESCENARIO, Y LA PRIMERA VERSION NO LO TENIA. Con solo el O TSVI, el
       VTI TSVI y el area de la AI, media de los calculos que este bloque dice comparar salian
       «—»: Hemodinamica sin FC, el Vol-R y el EROA por continuidad sin el anillo mitral ni el VTI
       del chorro, la FR sin volumenes. Comparar «—» contra «—» desde cinco puertas da IGUAL y no
       prueba nada — es exactamente el denominador vacio que este repo documenta. Se agregan los
       insumos que hacen HABLAR a cada cuenta, y el bloque ABORTA si alguna sigue muda. */
    const ESC = [['talla','170'], ['peso','70'], ['hemo_fc','70'], ['pmad','5'], ['hemo_pam','90'],
                 ['diam_tsvi_ao','22'], ['itv_tsvi','20'], ['itv_ao','24'], ['ai_area','26'],
                 ['thp','150'], ['itv_mitral','12'], ['em_vtimit','60'],
                 ['diam_mit','30'], ['im_itv','130'], ['im_jet_area','8'],
                 /* PISA de la IM: el radio, el Valiasing y la Vmax son los TRES que hacen hablar
                    al EROA, al Vol-R y a la FR (`eroa-val`, `volr-val`, `freg-val`). Con uno solo
                    de los tres las tres celdas quedan en «—». */
                 ['pisa_r','7'], ['pisa_val','40'], ['im_vmax','500'],
                 ['vdfvi','120'], ['vsfvi','50'], ['vmax_ao','3']];
    /* Por cada uno de los cinco datos, se carga el escenario entero cambiando SOLO por donde
       entra ese dato, y se compara la foto completa de calculos. */
    const PUERTAS = {
      'Diam. TSVI': ['diam_tsvi_ao', 'diam_tsvi', 'ea_dtsvi', 'em_dtsvi', 'im_dtsvi'],
      'VTI TSVI':   ['itv_tsvi', 'ea_vtitsvi', 'em_vtitsvi', 'im_itv_tsvi'],
      'Area AI':    ['ai_area', 'im_ai_area'],
      'THP':        ['thp', 'em_thp_display'],
      'VTI mitral': ['itv_mitral', 'vtim']
    };
    const CANON = { 'Diam. TSVI': 'diam_tsvi_ao', 'VTI TSVI': 'itv_tsvi', 'Area AI': 'ai_area',
                    'THP': 'thp', 'VTI mitral': 'itv_mitral' };
    const todos = async () => ({
      tsvi: await fotoDe('fotoTsvi'), vti: await fotoDe('fotoVti'), ai: await fotoDe('fotoAi'),
      thp: await fotoDe('fotoThp'), vtim: await fotoDe('fotoVtim'),
      excelCols: await ev(`window.__P.excelCols()`) });

    /* DENOMINADOR DURO: se carga el escenario COMPLETO una vez y se exige que las cuentas que el
       bloque compara esten POBLADAS. Si una sigue en «—» o vacia, se aborta: una tabla de
       «iguales» sobre celdas mudas es el resultado mas enganoso que esta sonda puede dar. */
    await base();
    for (const [id, val] of ESC) await ev(`window.__P.set(${JSON.stringify(id)}, ${JSON.stringify(val)})`);
    const _den = await todos();
    const _mudas = [];
    const _ex = (v) => v === null || v === undefined || v === '' || v === '—';
    if (_ex(_den.tsvi.avmCont)) _mudas.push('AVm continuidad');
    if (_ex(_den.tsvi.ava))     _mudas.push('AVA aortica');
    if (_ex(_den.tsvi.dvi))     _mudas.push('DVI');
    if (_ex(_den.tsvi.vs))      _mudas.push('Vol. sistolico');
    if (_ex(_den.tsvi.gc))      _mudas.push('Hemodinamica (GC)');
    if (_ex(_den.tsvi.eaAva))   _mudas.push('AVA del bloque de Valvulas');
    if (_ex(_den.vtim.volR))    _mudas.push('Vol-R');
    if (_ex(_den.vtim.eroa))    _mudas.push('EROA');
    if (_ex(_den.vti.imFr))     _mudas.push('FR de IM');
    if (_ex(_den.vti.imRatio))  _mudas.push('ratio VTI mitral/TSVI');
    if (_ex(_den.ai.imRatioAi)) _mudas.push('ratio jet/AI');
    R.__denominador = { escenario: ESC, mudas: _mudas, foto: _den };
    if (_mudas.length) throw new Error('DENOMINADOR VACIO — estas cuentas no hablan con el ' +
      'escenario, asi que comparar las puertas no probaria nada: ' + _mudas.join(', '));

    for (const dato of Object.keys(PUERTAS)) {
      R[dato] = {};
      for (const puerta of PUERTAS[dato]) {
        paso('RECALC/' + dato + ' por ' + puerta);
        await base();
        /* El escenario SIN el campo canonico de este dato: ese entra por la puerta medida. */
        for (const [id, val] of ESC) {
          if (id === CANON[dato]) continue;
          await ev(`window.__P.set(${JSON.stringify(id)}, ${JSON.stringify(val)})`);
        }
        const valDato = (ESC.find(([i]) => i === CANON[dato]) || [null, ''])[1];
        const t = await tipear(puerta, valDato);
        R[dato][puerta] = { tecleo: t, calc: await todos() };
      }
    }
    out.RECALC = R;
  }

  /* ══ GUARDADOS — la escena de control de la verificacion 4 ════════════════════════════════
     ⚠️ DOS COSAS QUE LA PRIMERA CORRIDA HIZO MAL Y LAS DOS DABAN UN RESULTADO PLAUSIBLE:
       1. guardaba con `guardarInforme()` pelado y leia `getInformes()[0].id`. El guardado es
          ASINCRONO y puede pedir confirmar la card de severidades, asi que nunca persistio
          —`reabrir` informo «SIN ESTUDIOS»— y la escena midio el FORMULARIO VIVO creyendo medir un
          estudio reabierto. Ahora usa `__P.guardar()`, calcado del arnes de la suite, y la clave
          correcta, que es `estudioId`.
       2. sembraba los valores divergentes con `set`, que despacha `input` y por lo tanto dispara
          la coordinacion: 19, 21, 23, 25 y 27 dejaban los CINCO campos en 27. Un guardado con
          valores distintos entre lugares SOLO existe como legado —de antes de esta tanda— y se
          arma con `setRaw`, que escribe sin eventos, que es lo que hace el barrido de
          restauracion. */
  if (hacer('GUARD')) {
    const G = {};
    /* (a) Guardar con el area de la AI en 26, reabrir, RE-MEDIR a 18 y leer im_grado. Es la escena
       que CLAUDE.md documenta como fallada: el ratio se quedaba en 34,6 % y im_grado en 2. */
    await base();
    for (const [id, val] of [['nombre','Ctrl AI'], ['ci','1110001'], ['edad','70'],
                             ['ai_area','26'], ['im_jet_area','8'], ['itv_mitral','12'],
                             ['em_vtimit','60'], ['diam_tsvi_ao','22'], ['itv_tsvi','20']]) {
      await ev(`window.__P.set(${JSON.stringify(id)}, ${JSON.stringify(val)})`);
    }
    G.antesDeGuardar = await fotoDe('fotoAi');
    G.espejosAlGuardar = await ev(`window.__P.espejosHidden()`);
    G.guardo = JSON.parse(await ev(`(async () => JSON.stringify(await window.__P.guardar()))()`));
    /* DENOMINADOR DURO: sin estudio guardado, «reabrir» mide el formulario vivo y la escena
       informa un exito que no ocurrio. */
    if (!G.guardo.estudioId) throw new Error('NO SE GUARDO EL ESTUDIO (a): ' + JSON.stringify(G.guardo));
    await ev(`window.__P.limpiar()`);
    G.trasLimpiar = await fotoDe('fotoAi');
    G.reabrir = await ev(`window.__P.reabrir(${JSON.stringify(G.guardo.estudioId)})`);
    await pausa(1200);
    await ev(`window.__P.abrirTodo()`);
    G.alReabrir = await fotoDe('fotoAi');
    G.marcasAlReabrir = JSON.parse(await ev(`JSON.stringify(window.__P.marcas())`));
    G.espejosAlReabrir = await ev(`window.__P.espejosHidden()`);
    /* RE-MEDIR de 26 a 18 EN AI/VI, con teclas reales. */
    G.reMedir = await tipear('ai_area', '18');
    G.trasReMedir = await fotoDe('fotoAi');
    await ev(`window.__P.borrarEstudio(${JSON.stringify(G.guardo.estudioId)})`);

    /* (b) Un guardado con valores DISTINTOS entre lugares (19, 21, 23, 25, 27) abre como se
       guardo. Se siembra con `setRaw` —sin eventos— porque es un LEGADO: hoy ningun gesto puede
       producir cinco valores distintos del mismo dato. */
    await base();
    for (const [id, val] of [['nombre','Ctrl 192123'], ['ci','2220002'], ['edad','70']]) {
      await ev(`window.__P.set(${JSON.stringify(id)}, ${JSON.stringify(val)})`);
    }
    for (const [id, val] of [['diam_tsvi_ao','19'], ['diam_tsvi','21'], ['ea_dtsvi','23'],
                             ['em_dtsvi','25'], ['im_dtsvi','27']]) {
      await ev(`window.__P.setRaw(${JSON.stringify(id)}, ${JSON.stringify(val)})`);
    }
    G.distintos_antes = await fotoDe('fotoTsvi');
    G.distintos_guardo = JSON.parse(await ev(`(async () => JSON.stringify(await window.__P.guardar()))()`));
    if (!G.distintos_guardo.estudioId) throw new Error('NO SE GUARDO EL ESTUDIO (b): ' + JSON.stringify(G.distintos_guardo));
    await ev(`window.__P.limpiar()`);
    G.distintos_reabrir = await ev(`window.__P.reabrir(${JSON.stringify(G.distintos_guardo.estudioId)})`);
    await pausa(1200);
    await ev(`window.__P.abrirTodo()`);
    G.distintos_alReabrir = await fotoDe('fotoTsvi');
    G.distintos_marcas = JSON.parse(await ev(`JSON.stringify(window.__P.marcas())`));
    /* Y la coordinacion actua al EDITAR, no al abrir: la primera tecla iguala los cinco. */
    G.distintos_trasEditar = { tecleo: await tipear('diam_tsvi_ao', '20'),
                               foto: await fotoDe('fotoTsvi') };
    await ev(`window.__P.borrarEstudio(${JSON.stringify(G.distintos_guardo.estudioId)})`);

    /* (c) Un guardado con avm_ete = 150 abre como se guardo y el nodo no vota. */
    await base();
    for (const [id, val] of [['nombre','Ctrl ete150'], ['ci','3330003'], ['edad','70'],
                             ['em_gmedio','9']]) {
      await ev(`window.__P.set(${JSON.stringify(id)}, ${JSON.stringify(val)})`);
    }
    await ev(`window.__P.setRaw('avm_ete','150')`);
    G.ete150_antes = await fotoDe('fotoEte');
    G.ete150_guardo = JSON.parse(await ev(`(async () => JSON.stringify(await window.__P.guardar()))()`));
    if (!G.ete150_guardo.estudioId) throw new Error('NO SE GUARDO EL ESTUDIO (c): ' + JSON.stringify(G.ete150_guardo));
    await ev(`window.__P.limpiar()`);
    G.ete150_reabrir = await ev(`window.__P.reabrir(${JSON.stringify(G.ete150_guardo.estudioId)})`);
    await pausa(1200);
    await ev(`window.__P.abrirTodo()`);
    G.ete150_alReabrir = await fotoDe('fotoEte');
    G.ete150_txt = await textos('estandar');
    await ev(`window.__P.borrarEstudio(${JSON.stringify(G.ete150_guardo.estudioId)})`);

    out.GUARD = G;
  }

  /* ══ MOV — 1200, 390 y 360 px: sin desborde ni barra horizontal ═══════════════════════════ */
  if (hacer('MOV')) {
    const mov = {};
    for (const w of [1200, 390, 360]) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
      await pausa(320);
      await ev(`(function(){ window.__P.limpiar(); window.__P.abrirTodo();
        window.__P.set('avm_plan','1.2'); window.__P.set('em_gmedio','9');
        window.__P.set('diam_tsvi_ao','22'); window.__P.set('itv_tsvi','20');
        window.__P.set('ai_area','26'); window.__P.set('thp','150');
        window.__P.set('itv_mitral','12'); return 1 })()`);
      await pausa(200);
      mov[w] = JSON.parse(await ev(`JSON.stringify({
        global: window.__P.desborde(),
        tarjeta: window.__P.desbordeDe('ete-seccion-valv-mitral'),
        detalle: window.__P.desbordeDe('bloque-em-detalle'),
        insuf: window.__P.desbordeDe('bloque-insuf-mitral'),
        filaThp: window.__P.desbordeDe('em_thp_display'),
        filaEte: window.__P.desbordeDe('avm_ete'),
        visEte: window.__P.vis('avm_ete') })`));
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.MOV = mov;
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
