#!/usr/bin/env node
/**
 * _probe_tango.mjs — sonda A/B de SOLO LECTURA para la tanda del Tango / estimado de TSVI / RVP de Abbas.
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 * Se corre DOS veces y se diffean los JSON:
 *   node scripts/_probe_tango.mjs --file /tmp/index.head.html > /tmp/ao.HEAD.json
 *   node scripts/_probe_tango.mjs                             > /tmp/ao.NEW.json
 *
 * Las claves que empiezan con "solo_" NO existen en HEAD (campos y filas nuevos), asi que el
 * diff se lee ignorandolas: estan separadas a proposito para que el A/B del resto sea limpio.
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_itvmax.mjs.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const arg  = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const FARG = arg('--file') || 'index.html';
const EXTERNO = isAbsolute(FARG);
const FILE = EXTERNO ? '__ab__' + basename(FARG) : FARG;

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-tg-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                '--window-size=1400,1000', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
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
    let id = 0; const pend = new Map();
    ws.addEventListener('open', () => res({
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}
const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios. Cierra
   la cadena y el archivo deja de parsear con un error que apunta decenas de lineas antes. */
const SONDA = `
window.__A = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  html(id) { var e = document.getElementById(id); return e ? e.innerHTML : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  existe(id) { return !!document.getElementById(id) },
  ds(id, k) { var e = document.getElementById(id);
    return e ? (e.dataset[k] === undefined ? null : e.dataset[k]) : null },

  limpiar() { try { limpiarCampos(true) } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {}; window._iaGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v) } catch(e){}
      });
    });
    return 1 },

  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* Escribe SIN eventos, para poder llamar a una funcion pura con los campos sembrados. */
  seed(id, valor) { var e = document.getElementById(id);
    if (!e) return 'NO EXISTE ' + id; e.value = String(valor); return e.value },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      c[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-06', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* Lo que el PPT publica para los campos aorticos, si el seam es alcanzable. */
  ppt(ids) { if (typeof _pptSel !== 'function') return 'SIN _pptSel';
    var o = {}; ids.forEach(function(id){ try { o[id] = _pptSel(id) } catch(e) { o[id] = 'EXC' } });
    return o },

  /* Lo que la tabla del PDF lee para la seccion aortica. El PDF arma sus filas con lecturas de
     estos mismos ids mas vliCalc(); si los insumos coinciden, las filas coinciden. */
  pdfInsumos() {
    var ids = ['vmax_ao','gmax_calc','gmedio_ao','itv_tsvi','itv_ao','diam_tsvi','ava_cont',
               'vs_calc','vli_calc','ea_grado','ea_ava_display','ea_dvi_display','ea_gmax_display'];
    var o = {}; ids.forEach(function(id){ o[id] = window.__A.val(id) }, this);
    o['__vliCalc'] = (typeof vliCalc === 'function')
      ? (function(){ var x = vliCalc(); return x === null ? null : x.toFixed(2) })() : 'SIN vliCalc';
    o['__dvi_span'] = window.__A.txt('dvi-val');
    o['__ava_idx']  = window.__A.txt('ava-idx');
    o['__vs_span']  = window.__A.txt('vs-val');
    o['__tango']    = window.__A.txt('tango-ava');
    return o },

  /* Los seis numeros de Hemodinamica, leidos de SUS PROPIOS nodos (los de la pestania
     Hemodinamica, que esta tanda no toca). Es el A/B de que las formulas no se movieron. */
  hemo() {
    return { gc: window.__A.txt('hemo-gc'), ic: window.__A.txt('hemo-ic'),
             rvs: window.__A.txt('hemo-rvs'), pcp: window.__A.txt('hemo-pcp'),
             gtp: window.__A.txt('hemo-gtp'), rvp: window.__A.txt('hemo-rvp'),
             pvc: window.__A.val('hemo_pvc'), vs: window.__A.val('hemo_vs'),
             forrester: window.__A.txt('hemo-forrester'), perfil: window.__A.txt('hemo-perfil'),
             htp: window.__A.txt('hemo-htp-tipo') } },

  /* Foto completa de una escena: lo que tiene que ser identico en el A/B. */
  foto(estilo) {
    var inf = window.__A.informe(estilo);
    return { inf: inf.inf, suma: inf.suma,
             ea_grado: window.__A.val('ea_grado'),
             ea_sev: window.__A.txt('ea-sev'),
             ea_badge: window.__A.txt('ea-ava-badge'),
             pdf: window.__A.pdfInsumos(), hemo: window.__A.hemo() } },

  /* Carga una escena aortica completa. Usa SOLO ids que existen en los dos builds. */
  escena(d) {
    window.__A.limpiar();
    try { showTab('doppler') } catch(e) {}
    var orden = ['peso','talla','fevi','onda_e','e_sep','e_lat','vmax_it','vti_tsvd',
                 'vci_diam','vmax_ao','gmedio_ao','diam_tsvi','itv_tsvi','itv_ao',
                 'tango_te','tango_tac','ava_plan','hemo_fc','hemo_pam'];
    orden.forEach(function(id){ if (d[id] !== undefined) window.__A.set(id, d[id]) });
    try { calcAo() } catch(e) {}
    try { calcHemo() } catch(e) {}
    return 1 },

  /* Orden de Tab de la seccion aortica: los focusables en orden de documento, que con un
     contenedor por COLUMNA es el orden de columna. Se excluyen los tabindex -1. */
  tabOrden() {
    var cont = document.querySelector('#dop-aortico .ao-cols-5');
    if (!cont) return 'SIN .ao-cols-5';
    var todos = Array.prototype.slice.call(
      cont.querySelectorAll('input, select, textarea, button, a[href]'));
    return todos.map(function(e){
      var oculto = (function(n){ while (n && n.nodeType === 1) {
        if (getComputedStyle(n).display === 'none') return true; n = n.parentNode; } return false })(e);
      return { id: e.id || '(sin id)', ti: e.getAttribute('tabindex'),
               ro: e.readOnly === true, oculto: oculto,
               tabea: !oculto && e.getAttribute('tabindex') !== '-1' } }) },

  titulos() {
    var o = {};
    ['dop-mitral','dop-aortico','dop-tricusp','dop-pulmonar'].forEach(function(id){
      var h = document.querySelector('[onclick*="' + id + '"]');
      if (!h) { o[id] = 'SIN CABECERA'; return }
      var t = (h.textContent || '').replace(/[\\u25b6\\u25bc]/g, '').replace(/\\uD83E\\uDDED.*/, '')
              .replace(/Algoritmo/, '').replace(/\\s+/g, ' ').trim();
      o[id] = t });
    return o },

  /* Alto de la cabecera y si el titulo se corta: dos lineas es aceptable, recortado no. */
  titulosGeom() {
    var o = {};
    ['dop-mitral','dop-aortico','dop-tricusp','dop-pulmonar'].forEach(function(id){
      var h = document.querySelector('[onclick*="' + id + '"]');
      if (!h) { o[id] = null; return }
      var r = h.getBoundingClientRect();
      o[id] = { w: Math.round(r.width), h: Math.round(r.height),
                scrollW: h.scrollWidth, clientW: h.clientWidth,
                cortado: h.scrollWidth > h.clientWidth + 1 } });
    return o }
};
1`;


async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await new Promise((r) => setTimeout(r, 1400));

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'EXC');
    return r.result.value;
  };
  await ev(`(function(){ try { if (typeof entrarDemo === 'function') return entrarDemo();
    var b = document.querySelector('[onclick*="entrar"],[onclick*="login"]');
    if (b) b.click(); } catch(e) { return 'EXC ' + e.message } return 'sin login' })()`);
  await new Promise((r) => setTimeout(r, 600));
  await ev(SONDA);

  const listo = await ev(`JSON.stringify({ faltan: ['generarInforme','calcAo','calcHemo','calcTango',
    'limpiarCampos','showTab','eaGradoCalculado','_labExcelRow','vliCalc','mostrarTSVIEstimado',
    'usarTSVIEstimado','syncTSVI','eaProtVeredicto']
    .filter(function(f){ return typeof window[f] !== 'function' }) })`);

  /* ══ 1 · EL TANGO: estado tras cada gesto ════════════════════════════════════════════════
     `foto()` devuelve los cinco nodos del resultado MAS los dos insumos. Lo que se compara en el
     A/B es que HEAD no borre nada y el build nuevo borre solo en las dos puertas del medico. */
  const tango = await ev(`(function(){
    var F = function(){ return {
      te: window.__A.val('tango_te'), tac: window.__A.val('tango_tac'),
      avaval: window.__A.val('tango_ava_val'),
      spanAva: window.__A.txt('tango-ava'), spanRatio: window.__A.txt('tango-ratio'),
      refTango: window.__A.txt('ao-ref-tango'), refTacte: window.__A.txt('ao-ref-tacte') } };
    var sembrar = function(){
      window.__A.limpiar(); try { showTab('doppler') } catch(e) {}
      window.__A.set('vmax_ao', 4.2);
      window.__A.set('tango_te', 500); window.__A.set('tango_tac', 190);
      return F() };
    var o = {};
    o.cargado = sembrar();
    /* PUERTA 1 — el medico tipea la Vmax en el Doppler */
    o.editaDoppler = (function(){ sembrar(); window.__A.set('vmax_ao', 4.5); return F() })();
    /* PUERTA 2 — el medico tipea la Vmax en Valvulas */
    o.editaValvulas = (function(){ sembrar();
      try { showTab('valvulas') } catch(e) {}
      window.__A.set('ea_vmax', 4.5);
      return F() })();
    /* CONTROL NEGATIVO A — el medico edita OTRO campo de Valvulas (mismo handler compartido) */
    o.editaGmedioValv = (function(){ sembrar();
      try { showTab('valvulas') } catch(e) {}
      window.__A.set('ea_gmedio', 48);
      return F() })();
    /* CONTROL NEGATIVO B — el medico edita otro campo del Doppler */
    o.editaGmedioDop = (function(){ sembrar(); window.__A.set('gmedio_ao', 48); return F() })();
    /* CONTROL NEGATIVO C — ESPEJO por codigo: entrar a Valvulas copia la Vmax sin que nadie tipee */
    o.espejoAlEntrar = (function(){ sembrar();
      try { showTab('valvulas') } catch(e) {}
      try { if (typeof sincronizarEADesdeGlobal === 'function') sincronizarEADesdeGlobal() } catch(e) {}
      try { showTab('doppler') } catch(e) {}
      return F() })();
    /* CONTROL NEGATIVO D — RECALCULAR: la cascada completa no borra nada */
    o.recalcular = (function(){ sembrar();
      try { calcAo() } catch(e) {} try { calcTango() } catch(e) {} try { calcEADetalle() } catch(e) {}
      return F() })();
    /* CONTROL NEGATIVO E — RESTAURACION: sembrar por codigo y pasar por RECALC_MODULOS */
    o.restaurar = (function(){ window.__A.limpiar();
      window.__A.seed('vmax_ao', 4.2); window.__A.seed('tango_te', 500);
      window.__A.seed('tango_tac', 190); window.__A.seed('tango_ava_val', '0.63');
      try { if (typeof _recalcModulos === 'function') _recalcModulos('probe') } catch(e) {}
      return F() })();
    /* CONTROL NEGATIVO F — el importador escribe la Vmax por codigo */
    o.importador = (function(){ sembrar();
      try { setv('vmax_ao', 4.9) } catch(e) {}
      return F() })();
    /* NUEVO ESTUDIO */
    o.nuevoEstudio = (function(){ sembrar(); try { limpiarCampos(true) } catch(e) {} return F() })();
    return JSON.stringify(o);
  })()`);

  /* ══ 2 · EL VEREDICTO PROTESICO, que lee tango_te como denominador del AT/ET ══════════════ */
  const protesis = await ev(`(function(){
    var esc = function(){
      window.__A.limpiar(); try { showTab('valvulas') } catch(e) {}
      window.__A.set('va_morf', 'Prótesis mecánica');
      try { if (typeof valvProtSync === 'function') valvProtSync() } catch(e) {}
      window.__A.set('va_at', 95);
      try { showTab('doppler') } catch(e) {}
      window.__A.set('vmax_ao', 3.4); window.__A.set('gmedio_ao', 22);
      window.__A.set('diam_tsvi', 21); window.__A.set('itv_tsvi', 18); window.__A.set('itv_ao', 60);
      window.__A.set('tango_te', 300); window.__A.set('tango_tac', 95);
      return 1 };
    var leer = function(){
      var P = null; try { P = eaProtVeredicto() } catch(e) { P = { ERR: e.message } }
      var inf = window.__A.informe('completo');
      return { te: window.__A.val('tango_te'), at: window.__A.val('va_at'),
               atet: P ? (P.atet === undefined ? 'sin campo atet' : P.atet) : null,
               nivelAtet: P && P.nv ? P.nv.atet : (P ? (P.atetNivel === undefined ? JSON.stringify(Object.keys(P)) : P.atetNivel) : null),
               P: JSON.stringify(P).slice(0, 700),
               inf: inf.inf, suma: inf.suma } };
    esc(); var con = leer();
    /* Ahora se borra el TE a mano —que es lo que el cambio de la tanda hace— y se vuelve a leer. */
    window.__A.set('tango_te', '');
    var sin = leer();
    return JSON.stringify({ con: con, sin: sin,
      difInforme: con.inf === sin.inf ? 'IDENTICO' : 'CAMBIA',
      difSuma: con.suma === sin.suma ? 'IDENTICO' : 'CAMBIA' });
  })()`);

  /* ══ 2b · ESCENA DONDE EL AT/ET ES EL EJE QUE DECIDE ════════════════════════════════════ */
  const prot2 = await ev(`(function(){
    var esc = function(){
      window.__A.limpiar(); try { showTab('valvulas') } catch(e) {}
      window.__A.set('va_morf', 'Prótesis mecánica');
      try { if (typeof valvProtSync === 'function') valvProtSync() } catch(e) {}
      window.__A.set('va_at', 70);
      try { showTab('doppler') } catch(e) {}
      window.__A.set('vmax_ao', 2.8); window.__A.set('gmedio_ao', 15);
      window.__A.set('diam_tsvi', 22); window.__A.set('itv_tsvi', 24); window.__A.set('itv_ao', 48);
      window.__A.set('tango_te', 160); window.__A.set('tango_tac', 70);
      return 1 };
    var leer = function(){
      var P = null; try { P = eaProtVeredicto() } catch(e) { P = { ERR: e.message } }
      var inf = window.__A.informe('completo');
      var fr = String(inf.inf).split(/(?<=\\.)\\s+/).filter(function(s){ return /a.rtica/i.test(s) });
      return { te: window.__A.val('tango_te'), atet: P ? P.atet : null,
               nivel: P ? P.nivel : null, niveles: P ? JSON.stringify(P.niveles) : null,
               frase: fr.join(' '), suma: inf.suma };
    };
    esc(); var con = leer();
    window.__A.set('tango_te', '');
    var sin = leer();
    return JSON.stringify({ con: con, sin: sin,
      cambiaNivel: con.nivel !== sin.nivel, cambiaFrase: con.frase !== sin.frase });
  })()`);

  /* ══ 2c · LA ESCENA PROTESICA CON EL GESTO REAL (retipear la Vmax) ══════════════════════════
     La 2 y la 2b borran el TE a mano para medir el efecto en HEAD, donde el apagado no existe.
     Esta hace lo que hace el medico: cambia la Vmax. Da el texto literal del narrativo y del
     EN SUMA antes y despues, que es la condicion 1 del pedido. */
  const protReal = await ev(`(function(){
    window.__A.limpiar(); try { showTab('valvulas') } catch(e) {}
    window.__A.set('va_morf', 'Prótesis mecánica');
    try { if (typeof valvProtSync === 'function') valvProtSync() } catch(e) {}
    window.__A.set('va_at', 95);
    try { showTab('doppler') } catch(e) {}
    window.__A.set('vmax_ao', 3.4); window.__A.set('gmedio_ao', 22);
    window.__A.set('diam_tsvi', 21); window.__A.set('itv_tsvi', 18); window.__A.set('itv_ao', 60);
    window.__A.set('tango_te', 300); window.__A.set('tango_tac', 95);
    var leer = function(){
      var P = null; try { P = eaProtVeredicto() } catch(e) { P = null }
      var r = window.__A.informe('completo');
      var fr = String(r.inf).split(/\\n+/).filter(function(s){ return /V.lvula a.rtica/i.test(s) });
      return { te: window.__A.val('tango_te'), tac: window.__A.val('tango_tac'),
               tangoVal: window.__A.val('tango_ava_val'),
               nivel: P ? P.nivel : null, atet: P ? P.atet : null, at: P ? P.at : null,
               frase: fr.join(' '), suma: r.suma } };
    var antes = leer();
    window.__A.set('vmax_ao', 3.5);   /* el MEDICO retipea la Vmax */
    var despues = leer();
    /* SOLO REPORTAR: que hace el veredicto con va_at cargado y SIN TE. */
    var soloAt = (function(){
      var P = null; try { P = eaProtVeredicto() } catch(e) { P = null }
      return { at: P ? P.at : null, atet: P ? P.atet : null,
               niveles: P ? JSON.stringify(P.niveles) : null, falta: P ? JSON.stringify(P.falta) : null } })();
    return JSON.stringify({ antes: antes, despues: despues, soloAt: soloAt });
  })()`);

  /* ══ 3 · EL CAJON DE ESTIMACION DEL DIAM. TSVI ═══════════════════════════════════════════ */
  const estim = await ev(`(function(){
    window.__A.limpiar();
    window.__A.set('peso', 70); window.__A.set('talla', 170);
    try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
    try { if (typeof mostrarTSVIEstimado === 'function') mostrarTSVIEstimado() } catch(e) {}
    var caja = document.getElementById('tsvi-estimado-box');
    var dondeVive = function(){ var n = caja, ruta = [];
      while (n && n.nodeType === 1 && ruta.length < 9) {
        ruta.push((n.id ? '#' + n.id : n.tagName.toLowerCase() + (n.className ? '.' + String(n.className).split(' ')[0] : '')));
        n = n.parentNode } return ruta.join(' < ') };
    var o = { existe: !!caja, visible: window.__A.vis('tsvi-estimado-box'),
              ruta: caja ? dondeVive() : null,
              html: caja ? caja.innerHTML : null,
              bsa: (typeof getBSA === 'function') ? String(getBSA()) : null };
    /* Usar el estimado y ver DONDE llega el valor. */
    try { usarTSVIEstimado(24.5) } catch(e) { o.errUsar = e.message }
    o.tras = { doppler: window.__A.val('diam_tsvi'), aivi: window.__A.val('diam_tsvi_ao'),
               ea: window.__A.val('ea_dtsvi'), em: window.__A.val('em_dtsvi'),
               im: window.__A.val('im_dtsvi'), ava: window.__A.val('ava_cont') };
    return JSON.stringify(o);
  })()`);

  /* ══ 4 · LA RVP DE ABBAS: barrida numerica sobre el umbral de 2 UW ═══════════════════════ */
  const rvp = await ev(`(function(){
    var out = [];
    var VM = [2.0, 2.4, 2.8, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0];
    var VT = [10, 12, 14, 15, 16, 18, 20, 22];
    VM.forEach(function(vm){ VT.forEach(function(vt){
      window.__A.limpiar();
      window.__A.set('vmax_it', vm); window.__A.set('vti_tsvd', vt);
      /* Insumos para que la clasificacion de HTP tenga PAPm y PCP y pueda pronunciarse. */
      window.__A.set('onda_e', 90); window.__A.set('e_sep', 6); window.__A.set('e_lat', 8);
      window.__A.set('peso', 70); window.__A.set('talla', 170);
      window.__A.set('diam_tsvi', 21); window.__A.set('itv_tsvi', 18);
      window.__A.set('hemo_fc', 70); window.__A.set('hemo_pam', 90);
      try { calcPSAP() } catch(e) {}
      try { calcHemo() } catch(e) {}
      out.push({ vm: vm, vt: vt, cociente: (vm / vt).toFixed(4),
                 rvp: window.__A.txt('hemo-rvp'), ref: window.__A.txt('ao-ref-rvp'),
                 htp: window.__A.txt('hemo-htp-tipo') });
    })});
    /* El override por cateterismo tiene que seguir mandando. */
    window.__A.limpiar();
    window.__A.set('vmax_it', 3.0); window.__A.set('vti_tsvd', 15);
    window.__A.set('htp-rvp', 1.4);
    var manda = { rvp: window.__A.txt('hemo-rvp'), ref: window.__A.txt('ao-ref-rvp') };
    /* El rotulo de la formula en pantalla. */
    var rot = (function(){
      var e = document.getElementById('hemo-rvp');
      var row = e ? e.parentNode : null;
      var l = row ? row.querySelector('.calc-lbl') : null;
      return l ? l.textContent.replace(/\\s+/g,' ').trim() : null })();
    return JSON.stringify({ barrida: out, override: manda, rotulo: rot });
  })()`);

  /* ══ 5 · A/B general: grado, cuadro, informe, EN SUMA, Excel, PDF, PPT ═══════════════════ */
  const sweep = await ev(`(function(){
    var VM = ['', 1.9, 2.0, 2.9, 3.0, 3.9, 4.0, 4.1];
    var GM = ['', 19, 20, 39, 40];
    var AV = ['', 0.99, 1.0, 1.01, 1.49, 1.5, 1.51];
    var out = {};
    VM.forEach(function(vm){ GM.forEach(function(gm){ AV.forEach(function(av){
      window.__A.seed('vmax_ao', vm); window.__A.seed('gmedio_ao', gm); window.__A.seed('ava_cont', av);
      var R; try { R = eaGradoCalculado() } catch(e) { R = { ERR: e.message } }
      out['v' + vm + '|g' + gm + '|a' + av] = JSON.stringify(R);
    })})});
    return JSON.stringify({ n: Object.keys(out).length, casos: out });
  })()`);

  const ESCENAS = {
    severa:   { peso:70, talla:170, fevi:55, onda_e:90, e_sep:6, e_lat:8, vmax_it:3.0, vti_tsvd:15,
                vmax_ao:4.5, gmedio_ao:45, diam_tsvi:20, itv_tsvi:16, itv_ao:50,
                tango_te:300, tango_tac:90, ava_plan:0.8, hemo_fc:70, hemo_pam:90 },
    moderada: { peso:70, talla:170, fevi:55, onda_e:90, e_sep:6, e_lat:8, vmax_it:2.4, vti_tsvd:18,
                vmax_ao:3.2, gmedio_ao:25, diam_tsvi:21, itv_tsvi:18, itv_ao:45,
                tango_te:320, tango_tac:100, hemo_fc:65, hemo_pam:85 },
    vacio:    {},
    negativo: { peso:70, talla:170, fevi:60, onda_e:80, e_sep:9, e_lat:12,
                vmax_it:2.8, vti_tsvd:16, thp:120, ava_plan:1.4 },
  };
  const escenas = {};
  for (const [k, d] of Object.entries(ESCENAS)) {
    for (const estilo of ['completo', 'breve']) {
      escenas[k + '|' + estilo] = JSON.parse(await ev(`(function(){
        window.__A.escena(${JSON.stringify(d)});
        return JSON.stringify(window.__A.foto(${JSON.stringify(estilo)})); })()`));
    }
    escenas[k + '|datos'] = JSON.parse(await ev(`(function(){
      window.__A.escena(${JSON.stringify(d)});
      var xl = window.__A.excel();
      return JSON.stringify({ n: (xl && typeof xl === 'object') ? Object.keys(xl).length : xl,
        fila: xl, campos: window.__A.campos(),
        hemo: window.__A.hemo(),
        ppt: window.__A.ppt(['vmax_ao','gmedio_ao','ava_cont','vs_calc','ea_grado','tango_ava_val']) }); })()`));
  }

  /* ══ 6 · Maquetacion de la zona de AI/VI con los enlaces ═════════════════════════════════ */
  const movil = {};
  for (const w of [1200, 390, 360]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
    await new Promise((r) => setTimeout(r, 300));
    movil[w] = JSON.parse(await ev(`(function(){
      window.__A.limpiar();
      try { showTab('ai-vi') } catch(e) {}
      window.__A.set('peso', 70); window.__A.set('talla', 170);
      try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
      try { if (typeof mostrarTSVIEstimado === 'function') mostrarTSVIEstimado() } catch(e) {}
      var d = document.documentElement;
      var caja = function(sel){ var e = (sel[0] === '#') ? document.getElementById(sel.slice(1))
                                                         : document.querySelector(sel);
        if (!e) return null; var r = e.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), der: Math.round(r.right),
                 desborda: r.right > d.clientWidth + 1 } };
      var peor = { id: null, der: -1 };
      var cont = document.getElementById('diam_tsvi_ao');
      var fg = cont ? cont.parentNode : null;
      if (fg) fg.querySelectorAll('input,label,a,div').forEach(function(e){
        var r = e.getBoundingClientRect(); if (r.width === 0 && r.height === 0) return;
        if (r.right > peor.der) peor = { id: e.id || e.tagName.toLowerCase(), der: Math.round(r.right) } });
      return JSON.stringify({ scrollW: d.scrollWidth, clientW: d.clientWidth,
        hayBarra: d.scrollWidth > d.clientWidth + 1,
        campo: caja('#diam_tsvi_ao'), cajon: caja('#tsvi-estimado-box'),
        visible: window.__A.vis('tsvi-estimado-box'), peorDer: peor,
        tab: (function(){ var t = document.getElementById('tab-ai-vi');
          return !!t && getComputedStyle(t).display !== 'none' })() });
    })()`));
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  const despues = await md5(join(RAIZ, 'index.html'));
  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues, listo: JSON.parse(listo),
    tango: JSON.parse(tango), protesis: JSON.parse(protesis), prot2: JSON.parse(prot2), protReal: JSON.parse(protReal), estim: JSON.parse(estim),
    rvp: JSON.parse(rvp), sweep: JSON.parse(sweep), escenas, movil,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
