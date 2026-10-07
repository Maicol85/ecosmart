#!/usr/bin/env node
/**
 * _probe_tapfc.mjs — sonda A/B de SOLO LECTURA para la tanda del 2026-10-06:
 *   · el tiempo de aceleracion PULMONAR del importador va al TAP (`tvia`), no a `tango_tac`;
 *   · los dos huecos del indice Tango (resultado rancio al borrar el TAC; filas en guion al reabrir);
 *   · `PCP_FORMULA_TXT` derivado de sus coeficientes;
 *   · la pantalla usa la MISMA banda de FC que el PDF para el gasto cardiaco.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 * Se corre DOS veces y se diffean los JSON:
 *   node scripts/_probe_tapfc.mjs --file /tmp/index.head.html > /tmp/tapfc.HEAD.json
 *   node scripts/_probe_tapfc.mjs                             > /tmp/tapfc.NEW.json
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_tango.mjs.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-tf-'));
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
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  html(id) { var e = document.getElementById(id); return e ? e.innerHTML : null },
  existe(id) { return !!document.getElementById(id) },

  limpiar() { try { limpiarCampos(true) } catch(e) {} return 1 },

  /* Tecleo del MEDICO: dispara input y change, que es lo que distingue su gesto del codigo. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* Escritura por CODIGO: sin eventos. Es como repuebla toda ruta de restauracion. */
  seed(id, valor) { var e = document.getElementById(id);
    if (!e) return 'NO EXISTE ' + id; e.value = String(valor); return e.value },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      c[el.id] = el.value });
    return c },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-06',
                               campos: window.__P.campos() }) }
    catch(e) { return 'EXC: ' + e.message } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* ══ El PDF REAL. jsPDF 2.x cuelga text de la INSTANCIA, no del prototipo, asi que se envuelve
     el constructor, que generarPDFReal relee de window.jspdf en cada llamada. Es el MISMO emisor
     que el boton, en modo medir. Calcado de TC-345. */
  pdfTxt() {
    var ns = window.jspdf;
    if (!ns || typeof ns.jsPDF !== 'function') return 'NO HAY jsPDF';
    var Orig = ns.jsPDF; var cap = [];
    function Env() { var dd = new Orig(...arguments); var t = dd.text;
      dd.text = function (x) { try { cap.push(Array.isArray(x) ? x.join(' ') : String(x)) } catch(e){}
        return t.apply(dd, arguments) }; return dd }
    Env.API = Orig.API;
    try { ns.jsPDF = Env;
      var paso = (window._PDF_A4_PASOS && window._PDF_A4_PASOS[0]) || { sp: 3, fs: 9 };
      generarPDFReal({ sp: paso.sp, fs: paso.fs, __a4: true, medir: true });
    } catch(e) {} finally { ns.jsPDF = Orig }
    if (!cap.length) return 'SONDA VACIA';
    return cap.join(' | ') },

  /* El valor que el PDF publica para un rotulo, buscando la celda que sigue al rotulo exacto. */
  pdfCampo(rotulo) {
    var t = window.__P.pdfTxt();
    if (typeof t !== 'string') return t;
    var p = t.split(' | ').map(function(s){ return s.trim() });
    for (var i = 0; i < p.length; i++) if (p[i] === rotulo) return (i + 1 < p.length) ? p[i+1] : '(fin)';
    return '(sin fila)' },

  /* Los numeros de Hemodinamica, de SUS nodos, mas las dos filas del cuadro del Doppler aortico. */
  hemo() {
    return { gc: window.__P.txt('hemo-gc'), ic: window.__P.txt('hemo-ic'),
             rvs: window.__P.txt('hemo-rvs'), pcp: window.__P.txt('hemo-pcp'),
             gtp: window.__P.txt('hemo-gtp'), rvp: window.__P.txt('hemo-rvp'),
             vs: window.__P.val('hemo_vs'), pvc: window.__P.val('hemo_pvc'),
             forrester: window.__P.txt('hemo-forrester'),
             perfil: window.__P.txt('hemo-perfil'),
             htp: window.__P.txt('hemo-htp-tipo'),
             refGc: window.__P.txt('ao-ref-gc'), refIc: window.__P.txt('ao-ref-ic'),
             refRvs: window.__P.txt('ao-ref-rvs'), refRvp: window.__P.txt('ao-ref-rvp'),
             refPcp: window.__P.txt('ao-ref-pcp'), refPam: window.__P.txt('ao-ref-pam') } },

  /* Las dos filas del Tango en el cuadro de referencias, mas sus tres campos y el resultado. */
  tango() {
    return { te: window.__P.val('tango_te'), tac: window.__P.val('tango_tac'),
             vmax: window.__P.val('vmax_ao'), ava: window.__P.val('tango_ava_val'),
             filaIdx: window.__P.txt('ao-ref-tango'), filaRatio: window.__P.txt('ao-ref-tacte'),
             htmlRatio: window.__P.html('ao-ref-tacte'),
             nodoAva: window.__P.txt('tango-ava'), nodoRatio: window.__P.txt('tango-ratio') } },

  /* ══ MAPEO DEL IMPORTADOR. Se interroga el resolvedor REAL, no la tabla: lo que importa es a
     que campo llega la etiqueta despues de normalizar, de-duplicar y resolver ambiguedades. */
  mapeo() {
    var out = { etiq: {}, cod: {}, ge: {}, export: {}, tabla: {} };
    var ETIQS = ['RVOT AT','Pulm AT','PA AT','PV AT','AT','Acc Time','LVOT VTI'];
    ETIQS.forEach(function(et){
      try {
        var k = _dcmNormEtiq(et);
        var hit = _dcmPorEtiqueta.get(k);
        out.etiq[et] = (hit === undefined) ? '(sin match)' : (hit === null ? '(ambigua)' : hit.def.campo);
      } catch(e) { out.etiq[et] = 'EXC: ' + e.message }
    });
    ['CM-TACPULM','99CEIBOMED|CM-TACPULM'].forEach(function(c){
      try { var h = _dcmPorCodigo.get(c);
        out.cod[c] = h ? h.def.campo : '(sin match)' } catch(e) { out.cod[c] = 'EXC: ' + e.message }
    });
    ['PV Acc Time','PV Vmax P','LVOT Diam'].forEach(function(c){
      try { out.ge[c] = (typeof CHM_MAPA === 'object' && CHM_MAPA[c]) ? CHM_MAPA[c].campo : '(sin match)' }
      catch(e) { out.ge[c] = 'EXC: ' + e.message }
    });
    try {
      var ex = DCM_EXPORT.filter(function(d){ return d.cod === 'CM-TACPULM' });
      out.export['CM-TACPULM'] = ex.map(function(d){ return d.campo + '/' + d.u });
      out.export.n = DCM_EXPORT.length;
    } catch(e) { out.export = 'EXC: ' + e.message }
    /* Las bandas: lo que se conserva y lo que queda declarado como sin red. */
    try {
      out.tabla.rangoTangoTac = JSON.stringify(DCM_RANGO['tango_tac'] || null);
      out.tabla.rangoTvia     = JSON.stringify(DCM_RANGO['tvia'] || null);
      out.tabla.clinTangoTac  = JSON.stringify(DCM_RANGO_CLIN['tango_tac'] || null);
      out.tabla.clinTvia      = JSON.stringify(DCM_RANGO_CLIN['tvia'] || null);
      out.tabla.labRangoTvia  = JSON.stringify((typeof _labRango === 'function') ? (_labRango('tvia') || null) : 'SIN');
      out.tabla.mapaTvia      = JSON.stringify((DCM_MAPA.find(function(d){ return d.campo === 'tvia' }) || {}).etiq || null);
      out.tabla.mapaTangoTac  = JSON.stringify((DCM_MAPA.find(function(d){ return d.campo === 'tango_tac' }) || {}).etiq || null);
      out.tabla.nMapa         = DCM_MAPA.length;
      out.tabla.nEtiq         = Object.keys(DCM_ETIQ).length;
    } catch(e) { out.tabla = 'EXC: ' + e.message }
    return out },

  /* ══ El texto de la formula del PCP, con sus puntos de codigo: byte por byte. */
  pcp() {
    var t = (typeof PCP_FORMULA_TXT === 'string') ? PCP_FORMULA_TXT : 'SIN PCP_FORMULA_TXT';
    var cps = []; for (var i = 0; i < t.length; i++) cps.push(t.codePointAt(i));
    return { txt: t, len: t.length, cps: cps.join(','),
             a: (typeof PCP_COEF_A !== 'undefined') ? PCP_COEF_A : null,
             b: (typeof PCP_COEF_B !== 'undefined') ? PCP_COEF_B : null,
             formulas: (typeof aoRefFormulas === 'function') ? aoRefFormulas(false) : 'SIN',
             rotuloChica: window.__P.txt('ao-ref-pcp') ,
             spanPcpF: (function(){ var e = document.querySelector('.ao-ref-f[data-f="pcp"]');
               return e ? e.textContent : null })() } },

  /* ══ Escena hemodinamica completa. Solo ids que existen en los dos builds. */
  escena(d) {
    window.__P.limpiar();
    try { showTab('doppler') } catch(e) {}
    var orden = ['peso','talla','fevi','onda_e','e_sep','e_lat','vmax_it','vti_tsvd','vci_diam',
                 'vmax_ao','gmedio_ao','diam_tsvi','itv_tsvi','itv_ao','tvia',
                 'tango_te','tango_tac','hemo_fc','hemo_pam','hemo_pvc'];
    orden.forEach(function(id){ if (d[id] !== undefined) window.__P.set(id, d[id]) });
    try { calcBSA() } catch(e) {}
    try { calcVD() } catch(e) {}
    try { calcAo() } catch(e) {}
    try { calcHemo() } catch(e) {}
    try { calcTango() } catch(e) {}
    return 1 },

  /* Foto de A/B de una escena: todo lo que tiene que ser identico salvo lo declarado. */
  foto(estilo) {
    var inf = window.__P.informe(estilo);
    return { inf: inf.inf, suma: inf.suma, hemo: window.__P.hemo(),
             tango: window.__P.tango(), tap: window.__P.val('tvia'),
             tapInterp: window.__P.txt('tap-interp') } },

  /* ══ RESTAURACION por el embudo REAL: .value sin eventos + la cadena de editarInforme +
     _recalcModulos. Es la ruta documentada de las cinco formas de reabrir. */
  reabrir(campos) {
    window.__P.limpiar();
    try { if (typeof _migrarCamposLegacy === 'function') _migrarCamposLegacy(campos) } catch(e) {}
    Object.keys(campos).forEach(function(k){
      var el = document.getElementById(k); if (el) el.value = campos[k] });
    try { calcBSA(); calcVI(); calcAI(); calcAorta(); calcVD(); calcPSAP() } catch(e) {}
    try { if (typeof valvProtSync === 'function') valvProtSync() } catch(e) {}
    try { if (typeof calcVP === 'function') calcVP() } catch(e) {}
    try { if (typeof calcDiastol === 'function') calcDiastol() } catch(e) {}
    try { if (typeof _recalcModulos === 'function') _recalcModulos('probe') } catch(e) {}
    return 1 }
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
  await new Promise((r) => setTimeout(r, 1500));

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'EXC');
    return r.result.value;
  };
  await ev(SONDA);

  /* DENOMINADOR: sin esto una sonda sobre nodos ausentes devuelve null en todo y parece limpia. */
  const listo = JSON.parse(await ev(`(function(){
    var ids = ['tvia','tango_te','tango_tac','tango_ava_val','vmax_ao','hemo_fc','hemo_pam',
               'hemo-gc','hemo-ic','hemo-rvs','ao-ref-gc','ao-ref-ic','ao-ref-tango','ao-ref-tacte',
               'tap-interp','hemo-forrester','hemo-perfil'];
    var o = {}; ids.forEach(function(id){ o[id] = window.__P.existe(id) });
    o.__fns = ['calcTango','calcHemo','calcVD','generarPDFReal','_labExcelRow','_recalcModulos',
               'aoRefFormulas','_aoRefTangoPintar']
      .map(function(f){ return f + '=' + (typeof window[f]) }).join(' ');
    o.__tablas = ['DCM_MAPA','DCM_ETIQ','CHM_MAPA','DCM_EXPORT','DCM_RANGO']
      .map(function(n){ var ok; try { ok = typeof eval(n) } catch(e) { ok = 'ND' } return n + '=' + ok }).join(' ');
    o.__enRecalc = (typeof RECALC_MODULOS === 'function')
      ? RECALC_MODULOS().filter(function(f){ return /Tango|Hemo/i.test(f) }).join(',') || '(ninguno)' : 'SIN';
    return JSON.stringify(o); })()`));

  /* ══ 1 · MAPEO DEL IMPORTADOR ═══════════════════════════════════════════════════════════════ */
  const mapeo = JSON.parse(await ev(`JSON.stringify(window.__P.mapeo())`));

  /* Importacion REAL por etiqueta: se escribe el valor en el campo que el resolvedor devuelve y se
     mira que cambio. Es el denominador del mapeo: que la tabla diga tvia no prueba que el numero
     llegue ahi. */
  const importa = JSON.parse(await ev(`(function(){
    var out = {};
    ['Pulm AT','RVOT AT','PA AT','PV AT'].forEach(function(et){
      window.__P.limpiar();
      var hit, campo;
      try { hit = _dcmPorEtiqueta.get(_dcmNormEtiq(et)); campo = hit ? hit.def.campo : null } catch(e) { campo = 'EXC' }
      if (!campo || campo === 'EXC') { out[et] = { campo: campo }; return }
      /* 95 ms: un TAP patologico (<105) y un AT aortico plausible a la vez, asi que la escena
         distingue de verdad a que campo fue. */
      window.__P.seed(campo, 95);
      try { calcVD() } catch(e) {}
      try { calcAo(); calcTango() } catch(e) {}
      out[et] = { campo: campo, tvia: window.__P.val('tvia'), tango_tac: window.__P.val('tango_tac'),
                  tapInterp: window.__P.txt('tap-interp'),
                  filaTango: window.__P.txt('ao-ref-tango') };
    });
    window.__P.limpiar();
    return JSON.stringify(out); })()`));

  /* ESCENA DEL PEDIDO: se importa el tiempo pulmonar Y se cargan TE/TAC aorticos a mano. El Tango
     no puede moverse por lo que entro del pulmonar. */
  const mezcla = JSON.parse(await ev(`(function(){
    var out = {};
    window.__P.limpiar(); try { showTab('doppler') } catch(e) {}
    /* TE y TAC aorticos a mano, mas la Vmax: el Tango queda calculado. */
    window.__P.set('vmax_ao', 4.5); window.__P.set('tango_te', 300); window.__P.set('tango_tac', 90);
    out.antes = window.__P.tango();
    out.antes.tap = window.__P.val('tvia'); out.antes.tapInterp = window.__P.txt('tap-interp');
    /* Ahora "importa" el pulmonar por el camino del resolvedor. */
    var hit = _dcmPorEtiqueta.get(_dcmNormEtiq('Pulm AT'));
    var campo = hit ? hit.def.campo : null;
    out.destino = campo;
    if (campo) { window.__P.seed(campo, 95); try { calcVD(); calcAo(); calcTango() } catch(e) {} }
    out.despues = window.__P.tango();
    out.despues.tap = window.__P.val('tvia'); out.despues.tapInterp = window.__P.txt('tap-interp');
    out.tangoIntacto = JSON.stringify(out.antes.ava) === JSON.stringify(out.despues.ava)
                       && out.antes.filaIdx === out.despues.filaIdx;
    window.__P.limpiar();
    return JSON.stringify(out); })()`));

  /* ══ 2 · HUECOS DEL TANGO ═══════════════════════════════════════════════════════════════════ */
  const huecos = JSON.parse(await ev(`(function(){
    var out = {};
    var cargar = function(){ window.__P.limpiar(); try { showTab('doppler') } catch(e) {}
      window.__P.set('vmax_ao', 4.5); window.__P.set('tango_te', 300); window.__P.set('tango_tac', 90);
      return window.__P.tango() };

    out.base = cargar();

    /* (a) BORRAR EL TAC A MANO: el indice no puede quedar rancio en su campo. */
    cargar(); window.__P.set('tango_tac', '');
    out.sinTac = window.__P.tango();

    /* Lo mismo borrando el TE, que es el otro insumo propio del Tango. */
    cargar(); window.__P.set('tango_te', '');
    out.sinTe = window.__P.tango();

    /* CONTROL NEGATIVO 1: con los tres insumos puestos el valor NO se borra. */
    cargar(); window.__P.set('tango_tac', 95);
    out.negativoSigue = window.__P.tango();

    /* CONTROL NEGATIVO 2: borrar un campo AJENO al Tango no lo apaga. */
    cargar(); window.__P.set('gmedio_ao', 45); window.__P.set('gmedio_ao', '');
    out.negativoAjeno = window.__P.tango();

    /* (tanda anterior) EDITAR LA Vmax A MANO borra TE, TAC y el resultado. Tiene que seguir igual. */
    cargar(); window.__P.set('vmax_ao', 3.8);
    out.vmaxEditada = window.__P.tango();

    /* ...y por la OTRA puerta del medico, ea_vmax de Valvulas. */
    cargar(); try { showTab('valvulas') } catch(e) {}
    var r = window.__P.set('ea_vmax', 3.8);
    out.eaVmaxEditada = window.__P.tango(); out.eaVmaxSet = r;

    window.__P.limpiar();
    return JSON.stringify(out); })()`));

  /* (b) REABRIR UN GUARDADO CON TANGO: las dos filas tienen que mostrar el valor guardado, y el
     recalculo no puede tocar los tres insumos ni el valor guardado del indice. */
  const reabrir = JSON.parse(await ev(`(function(){
    var out = {};
    window.__P.limpiar(); try { showTab('doppler') } catch(e) {}
    window.__P.set('peso', 70); window.__P.set('talla', 170);
    window.__P.set('vmax_ao', 4.5); window.__P.set('tango_te', 300); window.__P.set('tango_tac', 90);
    out.alGuardar = window.__P.tango();
    var campos = window.__P.campos();
    out.guardadoAva = campos['tango_ava_val'];
    out.guardadoTe = campos['tango_te']; out.guardadoTac = campos['tango_tac'];
    out.guardadoVmax = campos['vmax_ao'];

    window.__P.reabrir(campos);
    out.alReabrir = window.__P.tango();
    out.insumosIntactos = (out.alReabrir.te === out.guardadoTe)
      && (out.alReabrir.tac === out.guardadoTac) && (out.alReabrir.vmax === out.guardadoVmax);
    out.avaIgual = (out.alReabrir.ava === out.guardadoAva);
    out.filasPintadas = (out.alReabrir.filaIdx !== '—') && (out.alReabrir.filaRatio !== '—');

    /* CONTROL NEGATIVO: un guardado SIN Tango reabre con las dos filas en guion. */
    window.__P.limpiar(); try { showTab('doppler') } catch(e) {}
    window.__P.set('peso', 70); window.__P.set('talla', 170); window.__P.set('vmax_ao', 4.5);
    var sinT = window.__P.campos();
    window.__P.reabrir(sinT);
    out.negativoSinTango = window.__P.tango();

    window.__P.limpiar();
    return JSON.stringify(out); })()`));

  /* ══ 3 · BANDA DE FC ════════════════════════════════════════════════════════════════════════ */
  const fc = {};
  for (const valor of ['', 15, 19, 20, 21, 249, 250, 251, 70]) {
    fc[valor === '' ? 'vacia' : String(valor)] = JSON.parse(await ev(`(function(){
      window.__P.escena({ peso:70, talla:170, fevi:55, onda_e:90, e_sep:6, e_lat:8,
        vmax_it:3.0, vti_tsvd:15, vci_diam:18, vmax_ao:4.5, gmedio_ao:45,
        diam_tsvi:20, itv_tsvi:16, itv_ao:50, tvia:95, tango_te:300, tango_tac:90,
        hemo_pam:90, hemo_fc:${JSON.stringify(valor)} });
      var h = window.__P.hemo();
      return JSON.stringify({ fcLeido: window.__P.val('hemo_fc'), fcAo: window.__P.val('ao_fc'),
        gc: h.gc, ic: h.ic, rvs: h.rvs, refGc: h.refGc, refIc: h.refIc, refRvs: h.refRvs,
        forrester: h.forrester, perfil: h.perfil,
        pdfGc: window.__P.pdfCampo('GC'), pdfIc: window.__P.pdfCampo('IC'),
        pdfFc: window.__P.pdfCampo('FC') }); })()`));
  }

  /* ══ 4 · PCP ════════════════════════════════════════════════════════════════════════════════ */
  const pcp = JSON.parse(await ev(`(function(){
    window.__P.escena({ peso:70, talla:170, onda_e:90, e_sep:6, e_lat:8, vmax_it:3.0,
      vti_tsvd:15, diam_tsvi:20, itv_tsvi:16, hemo_fc:70, hemo_pam:90 });
    var p = window.__P.pcp();
    p.pdfPcpFila = window.__P.pdfCampo('PCP (Nagueh ' + PCP_FORMULA_TXT + ')');
    var t = window.__P.pdfTxt();
    p.pdfTienePcpRotulo = (typeof t === 'string') && t.indexOf('PCP (Nagueh 1.24 \\u00d7 (E/e\\') + 1.9)') >= 0;
    return JSON.stringify(p); })()`));

  /* ══ 5 · A/B general: informe, EN SUMA, Excel, campos, PDF entero ═══════════════════════════ */
  const ESCENAS = {
    severa:   { peso:70, talla:170, fevi:55, onda_e:90, e_sep:6, e_lat:8, vmax_it:3.0, vti_tsvd:15,
                vci_diam:18, vmax_ao:4.5, gmedio_ao:45, diam_tsvi:20, itv_tsvi:16, itv_ao:50,
                tvia:95, tango_te:300, tango_tac:90, hemo_fc:70, hemo_pam:90 },
    moderada: { peso:70, talla:170, fevi:55, onda_e:90, e_sep:6, e_lat:8, vmax_it:2.4, vti_tsvd:18,
                vci_diam:16, vmax_ao:3.2, gmedio_ao:25, diam_tsvi:21, itv_tsvi:18, itv_ao:45,
                tvia:130, tango_te:320, tango_tac:100, hemo_fc:65, hemo_pam:85 },
    vacio:    {},
    /* CONTROL NEGATIVO: sin FC, sin Tango y sin TAP. Nada de esta tanda debe actuar. */
    negativo: { peso:70, talla:170, fevi:60, onda_e:80, e_sep:9, e_lat:12, vmax_it:2.2,
                vti_tsvd:16, diam_tsvi:20, itv_tsvi:18 },
  };
  const escenas = {};
  for (const [k, d] of Object.entries(ESCENAS)) {
    for (const estilo of ['completo', 'breve']) {
      escenas[k + '|' + estilo] = JSON.parse(await ev(`(function(){
        window.__P.escena(${JSON.stringify(d)});
        return JSON.stringify(window.__P.foto(${JSON.stringify(estilo)})); })()`));
    }
    escenas[k + '|datos'] = JSON.parse(await ev(`(function(){
      window.__P.escena(${JSON.stringify(d)});
      var xl = window.__P.excel();
      return JSON.stringify({ n: (xl && typeof xl === 'object') ? Object.keys(xl).length : xl,
        fila: xl, campos: window.__P.campos(), pdf: window.__P.pdfTxt() }); })()`));
  }

  /* ══ 6 · BARRIDA DE BORDES DEL GRADO DE ESTENOSIS AORTICA ═══════════════════════════════════
     Nada de esta tanda toca eaGradoCalculado, y esto lo prueba en vez de afirmarlo. */
  const sweep = await ev(`(function(){
    var VM = ['', 1.9, 2.0, 2.9, 3.0, 3.9, 4.0, 4.1];
    var GM = ['', 19, 20, 39, 40];
    var AV = ['', 0.99, 1.0, 1.01, 1.49, 1.5, 1.51];
    var out = {};
    VM.forEach(function(vm){ GM.forEach(function(gm){ AV.forEach(function(av){
      window.__P.seed('vmax_ao', vm); window.__P.seed('gmedio_ao', gm); window.__P.seed('ava_cont', av);
      var R; try { R = eaGradoCalculado() } catch(e) { R = { ERR: e.message } }
      out['v' + vm + '|g' + gm + '|a' + av] = JSON.stringify(R);
    })})});
    return JSON.stringify({ n: Object.keys(out).length, casos: out });
  })()`);

  const despues = await md5(join(RAIZ, 'index.html'));
  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues,
    listo, mapeo, importa, mezcla, huecos, reabrir, fc, pcp, escenas,
    sweep: JSON.parse(sweep),
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
