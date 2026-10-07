#!/usr/bin/env node
/**
 * _probe_trivd.mjs — sonda A/B de SOLO LECTURA para el DOPPLER TRICUSPIDEO:
 * campos TAP/TDE, TRIV por Doppler tisular, PAP media unica, cuadro de referencias y boton
 * «Algoritmo».
 *
 *   node scripts/_probe_trivd.mjs --file /tmp/index.HEAD.html > /tmp/trivd.HEAD.json
 *   node scripts/_probe_trivd.mjs                             > /tmp/trivd.NEW.json
 *   node scripts/_probe_trivd.mjs --diff /tmp/trivd.HEAD.json /tmp/trivd.NEW.json
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 * Infraestructura (servidor + Chrome + CDP + SONDA) calcada de scripts/_probe_etbin.mjs.
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
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-trivd-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                '--window-size=1280,1000', url];
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

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  existe(id) { return !!document.getElementById(id) },
  cuantos(id) { return document.querySelectorAll('[id="' + id + '"]').length },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },

  /* Denominador del bloque tricuspideo: la pestania Doppler abierta y el acordeon desplegado.
     Lo que esta en display:none no tiene geometria, asi que medir sobre la app cerrada da cero
     y parece impecable. */
  denominador() {
    try { showTab('doppler'); } catch(e) {}
    var sec = document.getElementById('dop-tricusp');
    if (sec && sec.style.display === 'none') {
      var h = document.querySelector('h2[onclick*="dop-tricusp"]');
      try { toggleCard('dop-tricusp', h); } catch(e) {}
    }
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    var campos = ['vmax_it','dt_onda_e','dt_onda_a','dt_eprime_lat','dt_triv'];
    var geom = campos.filter(function(id){
      var e = document.getElementById(id); if (!e) return false;
      var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 });
    return { tab: vis('tab-doppler'), seccion: vis('dop-tricusp'),
             conGeometria: geom.length, deEsos: campos.length,
             ok: vis('tab-doppler') && vis('dop-tricusp') && geom.length === campos.length } },

  limpiar() { try { limpiarCampos(true); } catch(e) {} return 1 },

  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value, ok: String(e.value) === String(valor) } },

  /* Escribe SIN disparar eventos, como lo hacen las rutas de restauracion de un estudio. */
  setMudo(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor); return { id: id, leido: e.value } },

  recalc() { try { _recalcModulos('sonda'); } catch(e) { return 'EXC: ' + e.message } return 1 },

  /* Los campos que se PERSISTEN, por el mismo barrido que usa guardarInforme. */
  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      c[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },

  /* La fila del Excel del Laboratorio por el emisor REAL. No genera el .xlsx. */
  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-07', campos: window.__P.campos() }) }
    catch(e) { return 'EXC: ' + e.message } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* El cuadro de referencias de la seccion, fila por fila: rotulo visible y valor. */
  cuadro() {
    var box = document.querySelector('#dop-tricusp .calc-box');
    if (!box) return 'SIN calc-box';
    return Array.prototype.map.call(box.querySelectorAll('.calc-row'), function(r){
      var l = r.querySelector('.calc-lbl');
      var spans = Array.prototype.filter.call(r.querySelectorAll('span'), function(s){
        return !s.classList.contains('calc-lbl') && !l.contains(s) });
      return { lbl: l ? (l.textContent||'').trim() : '?',
               val: spans.length ? (spans[spans.length-1].textContent||'').trim() : '?' } }) },

  /* Hemodinamica y la clasificacion ESC/ERS 2022: los dos spans que el prompt exige intactos. */
  hemo() {
    try { if (typeof calcHemo === 'function') calcHemo() } catch(e) {}
    try { if (typeof cxTP === 'function') cxTP() } catch(e) {}
    var g = function(id){ var e = document.getElementById(id); return e ? (e.textContent||'').trim() : null };
    return { gtp: g('hemo-gtp'), htpTipo: g('hemo-htp-tipo'), rvp: g('hemo-rvp'),
             papmCx: g('cx-gtp-papm'), gtpCx: g('cx-gtp-gtp'), rvpCx: g('cx-gtp-rvp') } },

  /* La probabilidad ecocardiografica de HTP (ESC 2022). */
  htp2022() {
    try { if (typeof calcHTP2022 === 'function') calcHTP2022() } catch(e) {}
    var out = {};
    ['htp2022-prob','htp2022-cats','htp2022-vrt','htp2022-detalle'].forEach(function(id){
      var e = document.getElementById(id); if (e) out[id] = (e.innerHTML||'').trim() });
    return out },

  /* El veredicto de la logica diastolica del VD, tal como lo publica el informe. */
  diastVD() {
    if (typeof dtDiastEstado !== 'function') return 'SIN dtDiastEstado';
    var r = dtDiastEstado();
    if (!r) return null;
    return { patron: r.patron, grado: r.grado, completo: r.completo, ea: r.ea, eep: r.eep,
             anormal: r.anormal, indet: r.indet, itSignif: r.itSignif,
             lbl: (typeof dtDiastPatronLbl === 'function') ? dtDiastPatronLbl(r) : '?' } },

  /* La ventana del Algoritmo del VD: existe, abre, cierra, y su cuerpo. */
  algoVD(abrir) {
    var ov = document.getElementById('dtvd-algo-overlay');
    if (!ov) return { existe: false };
    if (abrir === true)  { try { dtvdAlgoAbrir() } catch(e) { return { exc: e.message } } }
    if (abrir === false) { try { dtvdAlgoCerrar() } catch(e) { return { exc: e.message } } }
    var t = document.getElementById('dtvd-algo-titulo');
    var c = document.getElementById('dtvd-algo-cuerpo');
    return { existe: true, abierto: ov.style.display !== 'none',
             titulo: t ? (t.textContent||'').trim() : null,
             filas: c ? Array.prototype.map.call(c.querySelectorAll('.da-row'), function(r){
               return (r.className||'') + ' :: ' + (r.textContent||'').replace(/\\s+/g,' ').trim() }) : null,
             res: c ? Array.prototype.map.call(c.querySelectorAll('.da-res'), function(r){
               return (r.textContent||'').replace(/\\s+/g,' ').trim() }) : null } },

  /* Encabezado de la seccion: orden de los hijos del h2 y geometria del titulo. El defecto que
     se quiere evitar es que al desplegar se vaya el titulo (le pasaba a la mitral). */
  encabezado() {
    var h = document.querySelector('h2[onclick*="dop-tricusp"]');
    if (!h) return 'SIN h2';
    var hijos = Array.prototype.map.call(h.children, function(c){
      return c.tagName + (c.id ? '#' + c.id : '') + (c.tagName === 'BUTTON' ? '[' + (c.textContent||'').trim() + ']' : '') });
    var tit = h.querySelector('span');
    var r = tit ? tit.getBoundingClientRect() : null;
    return { hijos: hijos,
             tituloTxt: tit ? (tit.textContent||'').trim() : null,
             tituloW: r ? Math.round(r.width) : null, tituloH: r ? Math.round(r.height) : null,
             tituloVisible: !!(r && r.width > 40 && r.height > 6 && r.height < 60) } },

  /* Desborde horizontal de la seccion y de la pagina, y la letra de la formula. */
  maqueta() {
    var sec = document.getElementById('dop-tricusp');
    var de = document.documentElement;
    var f = document.getElementById('papm_est_form');
    var fr = f ? f.getBoundingClientRect() : null;
    var desb = [];
    if (sec) Array.prototype.forEach.call(sec.querySelectorAll('*'), function(el){
      var r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > de.clientWidth + 1)
        desb.push((el.tagName||'?') + (el.id ? '#' + el.id : '') + ' right=' + Math.round(r.right)) });
    return { ancho: de.clientWidth, scrollW: de.scrollWidth,
             barraH: de.scrollWidth > de.clientWidth + 1,
             desbordes: desb.slice(0, 8), nDesbordes: desb.length,
             formulaTxt: f ? (f.textContent||'').trim() : null,
             formulaFontPx: f ? getComputedStyle(f).fontSize : null,
             formulaColor: f ? getComputedStyle(f).color : null,
             formulaW: fr ? Math.round(fr.width) : null,
             formulaH: fr ? Math.round(fr.height) : null,
             formulaScrollW: f ? f.scrollWidth : null,
             formulaCortada: !!(f && f.scrollWidth > f.clientWidth + 1) } },

  /* Foto completa del bloque: lo que el A/B compara en cada escena. */
  foto() {
    return {
      tap_vd: window.__P.val('tvia'), tap_dop: window.__P.val('dt_tap'),
      triv: window.__P.val('dt_triv'), tde: window.__P.val('dt_tde'),
      papMedOculto: window.__P.val('pap_med'),
      papMedVis: window.__P.val('papm_est'),
      papMedForm: window.__P.txt('papm_est_form'),
      psap: window.__P.val('psap_calc'), pmad: window.__P.val('pmad'),
      gradVdAd: window.__P.val('grad_vdad_display'),
      tapInterp: window.__P.txt('tap-interp'),
      cuadro: window.__P.cuadro(), diastVD: window.__P.diastVD() } }
};
1
`;

/* ══ Escenas ══════════════════════════════════════════════════════════════════════════════════
   Cada una describe un PACIENTE. `pre` corre antes de medir. */
const ESCENAS = [
  { k: 'E0-vacio', desc: 'Formulario vacio: sin IT y sin TAP',
    campos: {} },

  /* PAPm (a) — IT + VCI: hay PSAP, manda Chemla. VCI 15 mm con colapso >50% da PmAD. */
  { k: 'E1-chemla', desc: 'IT 2,4 m/s + VCI: PSAP presente, PAPm por Chemla',
    campos: { vci_diam: 15, vci_col: '>50', vmax_it: 2.4 } },

  /* ⚠️ EL TAP DE LAS ESCENAS SE CARGA EN `tvia` Y NO EN `dt_tap`, Y NO ES UN DETALLE DE ESTILO.
     `dt_tap` no existe en HEAD, asi que una escena que escribiera ahi describiria un paciente CON
     TAP en el arbol nuevo y uno SIN TAP en HEAD: el A/B comparaba dos pacientes distintos y
     delataba como «diferencia» el informe, el Excel y el badge de VD/AD, que no habian cambiado.
     `tvia` existe en los dos y es el dueño del dato, asi que la escena describe un PACIENTE.
     El tecleo en el campo nuevo —y el espejo en los dos sentidos— lo mide `out.espejo`. */

  /* PAPm (b) — sin IT, TAP 100 ms: Dabestani rama <=120. */
  { k: 'E2-dab-bajo', desc: 'Sin IT, TAP 100 ms (rama <=120)',
    campos: { tvia: 100 } },

  /* PAPm (c) — los dos lados del corte 120. */
  { k: 'E3-dab-120', desc: 'Sin IT, TAP 120 ms exacto (usa la rama <=120)',
    campos: { tvia: 120 } },
  { k: 'E4-dab-121', desc: 'Sin IT, TAP 121 ms (rama >120)',
    campos: { tvia: 121 } },

  /* PAPm (d) — IT sin VCI: no hay PSAP, asi que manda el TAP. */
  { k: 'E5-it-sin-vci', desc: 'IT 2,4 m/s SIN VCI + TAP 140 ms: sin PSAP, manda el TAP',
    campos: { vmax_it: 2.4, tvia: 140 } },

  /* Control negativo del punto 2 de la verificacion: TAP presente, PSAP ausente, IP ausente.
     Hemodinamica y la clasificacion tienen que seguir pidiendo la PAPm por PSAP o por IP. */
  { k: 'E6-hemo-solo-tap', desc: 'CONTROL NEGATIVO: TAP 100, sin PSAP y sin IP, con PCP cargable',
    campos: { tvia: 100, onda_e: 90, e_sep: 5, e_lat: 7, gc: 5 } },

  /* Cuadro de referencias: los dos lados de cada corte. */
  { k: 'E7-triv-75', desc: 'TRIV 75 ms (sin comentario) con E/A clasificable',
    campos: { dt_onda_e: 60, dt_onda_a: 50, dt_eprime_lat: 8, dt_triv: 75 } },
  { k: 'E8-triv-76', desc: 'TRIV 76 ms (con comentario a favor de HTP)',
    campos: { dt_onda_e: 60, dt_onda_a: 50, dt_eprime_lat: 8, dt_triv: 76 } },
  { k: 'E9-tde-119', desc: 'TDE 119 ms (acortado)',
    campos: { dt_onda_e: 60, dt_onda_a: 50, dt_tde: 119 } },
  { k: 'E10-tde-120', desc: 'TDE 120 ms (sin comentario)',
    campos: { dt_onda_e: 60, dt_onda_a: 50, dt_tde: 120 } },

  /* Los cinco patrones de la logica diastolica del VD, que el cuadro y la ventana muestran. */
  { k: 'E11-relajacion', desc: 'E/A 0,60 → relajacion anormal (completo)',
    campos: { dt_onda_e: 30, dt_onda_a: 50, dt_eprime_lat: 8 } },
  { k: 'E12-restrictivo', desc: 'E/A 2,40 → restrictivo, con IT severa (salvedad)',
    campos: { dt_onda_e: 120, dt_onda_a: 50, dt_eprime_lat: 8, it_grado: '4' } },
  { k: 'E13-pseudonormal', desc: "E/A 1,20 + E/e' 7,5 → pseudonormal",
    campos: { dt_onda_e: 60, dt_onda_a: 50, dt_eprime_lat: 8 } },
  { k: 'E14-normal', desc: "E/A 1,20 + E/e' 4,0 → normal",
    campos: { dt_onda_e: 60, dt_onda_a: 50, dt_eprime_lat: 15 } },
  { k: 'E15-indeterminado', desc: "E/A 1,20 sin e' → indeterminado",
    campos: { dt_onda_e: 60, dt_onda_a: 50 } },

  /* Control negativo de la seccion entera: un paciente con datos de OTRAS valvulas y nada
     tricuspideo. Si el cambio tocara algo compartido, aca se ve. */
  { k: 'E16-ctrl-otras', desc: 'CONTROL NEGATIVO: aortica y mitral cargadas, nada tricuspideo',
    campos: { vmax_ao: 4.2, gmedio_ao: 45, itv_tsvi: 20, itv_ao: 110,
              onda_e: 80, onda_a: 60, e_sep: 6, e_lat: 8, ddfvi: 50, fevi: 60 } },
];

async function medir(ev, sid) {
  const E = async (expr) => {
    const r = await ev('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sid);
    if (r.exceptionDetails) throw new Error(expr.slice(0, 90) + ' → ' + r.exceptionDetails.text);
    return r.result.value;
  };
  const out = { escenas: {}, estructura: {}, maqueta: {} };

  await E(SONDA);
  out.denominador = await E('window.__P.denominador()');

  /* Estructura: los ids nuevos, su unicidad, y el encabezado. */
  out.estructura.ids = await E(`(function(){
    var o = {};
    ['tvia','dt_tap','dt_triv','dt_tde','pap_med','papm_est','papm_est_form','htp-interp']
      .forEach(function(id){ o[id] = window.__P.cuantos(id) });
    return o })()`);
  out.estructura.rotulos = await E(`(function(){
    var lbl = function(id){ var e = document.getElementById(id); if (!e) return null;
      var f = e.closest('.fg'); var l = f ? f.querySelector('label') : null;
      return l ? (l.textContent||'').trim() : null };
    return { dt_tap: lbl('dt_tap'), dt_triv: lbl('dt_triv'), dt_tde: lbl('dt_tde'),
             pap_med: lbl('pap_med') } })()`);
  out.estructura.orden = await E(`(function(){
    var s = document.getElementById('dop-tricusp'); if (!s) return null;
    return Array.prototype.map.call(s.querySelectorAll('.grid-4'), function(g){
      return Array.prototype.map.call(g.querySelectorAll('input,select'), function(i){ return i.id }) }) })()`);
  out.estructura.notaTriv = await E(`(function(){
    var e = document.getElementById('dt_triv'); if (!e) return null;
    var s = e.parentNode.querySelector('span');
    return s ? (s.textContent||'').trim() : null })()`);
  out.estructura.encabezado = await E('window.__P.encabezado()');

  /* El acordeon y la ventana: el titulo se tiene que ver en los cuatro estados. */
  out.estructura.titulo4 = await E(`(function(){
    var h = document.querySelector('h2[onclick*="dop-tricusp"]');
    var med = function(){ return window.__P.encabezado() };
    var o = {};
    o.abierto_ventanaCerrada = med();
    try { if (typeof dtvdAlgoAbrir === 'function') dtvdAlgoAbrir() } catch(e) {}
    o.abierto_ventanaAbierta = med();
    try { if (typeof dtvdAlgoCerrar === 'function') dtvdAlgoCerrar() } catch(e) {}
    try { toggleCard('dop-tricusp', h) } catch(e) {}
    o.cerrado = med();
    try { toggleCard('dop-tricusp', h) } catch(e) {}
    o.reabierto = med();
    return o })()`);

  /* Espejo del TAP en los dos sentidos, borrado incluido, y por la ruta de restauracion. */
  out.espejo = await E(`(function(){
    var o = {};
    window.__P.limpiar();
    window.__P.set('tvia', 92);
    o.vdADop = { tvia: window.__P.val('tvia'), dt_tap: window.__P.val('dt_tap') };
    window.__P.set('dt_tap', 150);
    o.dopAVd = { tvia: window.__P.val('tvia'), dt_tap: window.__P.val('dt_tap') };
    window.__P.set('dt_tap', '');
    o.borrarDop = { tvia: window.__P.val('tvia'), dt_tap: window.__P.val('dt_tap') };
    window.__P.set('tvia', 88);
    window.__P.set('tvia', '');
    o.borrarVd = { tvia: window.__P.val('tvia'), dt_tap: window.__P.val('dt_tap') };
    /* Restauracion: como un estudio viejo o uno del SR DICOM, que traen tvia y NO dt_tap. */
    window.__P.limpiar();
    window.__P.setMudo('tvia', 101);
    o.antesDelRecalc = { tvia: window.__P.val('tvia'), dt_tap: window.__P.val('dt_tap') };
    window.__P.recalc();
    o.trasRecalc = { tvia: window.__P.val('tvia'), dt_tap: window.__P.val('dt_tap'),
                     tapInterp: window.__P.txt('tap-interp') };
    /* Nuevo estudio limpia los dos campos nuevos. */
    window.__P.set('dt_tap', 100); window.__P.set('dt_tde', 119);
    window.__P.limpiar();
    o.trasLimpiar = { tvia: window.__P.val('tvia'), dt_tap: window.__P.val('dt_tap'),
                      tde: window.__P.val('dt_tde'), papMedVis: window.__P.val('papm_est'),
                      papMedForm: window.__P.txt('papm_est_form'),
                      papMedOculto: window.__P.val('pap_med'),
                      cuadro: window.__P.cuadro() };
    return o })()`);

  /* Las escenas. */
  for (const e of ESCENAS) {
    const sets = JSON.stringify(e.campos);
    out.escenas[e.k] = await E(`(function(){
      window.__P.limpiar();
      var c = ${sets};
      var errs = [];
      Object.keys(c).forEach(function(id){
        var r = window.__P.set(id, c[id]);
        if (r && r.err) errs.push(r.err); else if (r && !r.ok) errs.push(id + ' leyo ' + r.leido) });
      var f = window.__P.foto();
      f.setErrs = errs;
      f.excel = window.__P.excel();
      f.excelN = (f.excel && typeof f.excel === 'object') ? Object.keys(f.excel).length : null;
      f.hemo = window.__P.hemo();
      f.htp2022 = window.__P.htp2022();
      f.algo = window.__P.algoVD(true);
      window.__P.algoVD(false);
      f.informe = {};
      ['tecnico','narrativo','mixto'].forEach(function(st){
        var r = window.__P.informe(st); f.informe[st] = r });
      f.campos = window.__P.campos();
      return f })()`);
  }

  /* Maquetacion en los tres anchos, con la seccion abierta y la ventana abierta. */
  for (const w of [360, 390, 1200]) {
    await ev('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 500 }, sid);
    out.maqueta[w] = await E(`(function(){
      window.__P.limpiar();
      window.__P.denominador();
      window.__P.set('dt_tap', 100);
      window.__P.set('dt_triv', 76); window.__P.set('dt_tde', 119);
      window.__P.set('dt_onda_e', 60); window.__P.set('dt_onda_a', 50); window.__P.set('dt_eprime_lat', 8);
      var o = { cerrada: window.__P.maqueta(), enc: window.__P.encabezado() };
      window.__P.algoVD(true);
      o.abierta = window.__P.maqueta(); o.encAbierta = window.__P.encabezado();
      window.__P.algoVD(false);
      /* Orden de apilado: posicion vertical de cada campo de las dos filas. */
      o.apilado = ['vmax_it','grad_vdad_display','psap_calc','pmad_display',
                   'dt_tap','pap_med','papm_est','dt_triv',
                   'dt_onda_e','dt_onda_a','dt_eprime_lat','dt_tde'].map(function(id){
        var e = document.getElementById(id); if (!e) return id + ':NO';
        var r = e.getBoundingClientRect();
        return id + ':' + Math.round(r.top + window.scrollY) + 'x' + Math.round(r.left) });
      return o })()`);
  }
  await ev('Emulation.clearDeviceMetricsOverride', {}, sid);
  return out;
}

/* ══ Diff ════════════════════════════════════════════════════════════════════════════════════ */
function aplanar(o, pre = '', out = {}) {
  if (o === null || typeof o !== 'object') { out[pre] = o; return out; }
  if (Array.isArray(o)) { o.forEach((v, i) => aplanar(v, pre + '[' + i + ']', out)); return out; }
  Object.keys(o).forEach(k => aplanar(o[k], pre ? pre + '.' + k : k, out));
  return out;
}
async function diff(a, b) {
  const A = aplanar(JSON.parse(await readFile(a, 'utf8')));
  const B = aplanar(JSON.parse(await readFile(b, 'utf8')));
  const ks = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
  const d = ks.filter(k => JSON.stringify(A[k]) !== JSON.stringify(B[k]));
  console.log('Claves: HEAD ' + Object.keys(A).length + ' · NEW ' + Object.keys(B).length
            + ' · difieren ' + d.length);
  d.forEach(k => console.log('  ' + k + '\n      HEAD: ' + JSON.stringify(A[k])
                                    + '\n      NEW : ' + JSON.stringify(B[k])));
  if (!d.length) console.log('  (sin diferencias)');
}

/* ══ Main ════════════════════════════════════════════════════════════════════════════════════ */
async function main() {
  if (process.argv.includes('--diff')) {
    const i = process.argv.indexOf('--diff');
    await diff(process.argv[i + 1], process.argv[i + 2]);
    return;
  }
  const md5 = async () => createHash('md5').update(await readFile(join(RAIZ, 'index.html'))).digest('hex');
  const m0 = await md5();
  const { srv, port } = await servir();
  let ch = null;
  try {
    ch = await abrirChrome('http://127.0.0.1:' + port + '/' + FILE);
    const cdp = await conectar(ch.wsUrl);
    const { targetInfos } = await cdp.send('Target.getTargets');
    const page = targetInfos.find(t => t.type === 'page');
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
    await cdp.send('Runtime.enable', {}, sessionId);
    await new Promise(r => setTimeout(r, 2500));
    const out = await medir(cdp.send, sessionId);
    out._archivo = FARG;
    out._md5 = m0;
    console.log(JSON.stringify(out, null, 1));
    cdp.close();
  } finally {
    if (ch) { try { ch.proc.kill('SIGKILL') } catch {} try { await rm(ch.perfil, { recursive: true, force: true }) } catch {} }
    /* Cerrar el servidor Y salir: `cdp.close()` + `kill()` no alcanzan —el event loop sigue
       vivo y se juntan zombies que cuelgan el segundo lado de un A/B encadenado. */
    srv.close();
  }
  const m1 = await md5();
  if (m0 !== m1) { console.error('\n⚠️ index.html CAMBIO durante la corrida: ' + m0 + ' → ' + m1); process.exit(2); }
  process.exit(0);
}
main().catch(e => { console.error('FALLO: ' + e.message); process.exit(1); });
