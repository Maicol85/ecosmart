#!/usr/bin/env node
/**
 * _probe_aorta.mjs — sonda A/B de SOLO LECTURA para la tanda del Doppler aortico
 * (cinco columnas, cuadro de referencias en dos columnas, FC/PAS/PAD, titulos).
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 * Se corre DOS veces y se diffean los JSON:
 *   node scripts/_probe_aorta.mjs --file /tmp/index.head.html > /tmp/ao.HEAD.json
 *   node scripts/_probe_aorta.mjs                             > /tmp/ao.NEW.json
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-ao-'));
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

  /* Entrar a la app: el login tapa el DOM hasta que se despacha. */
  await ev(`(function(){ try { if (typeof entrarDemo === 'function') return entrarDemo();
    var b = document.querySelector('[onclick*="entrar"],[onclick*="login"]');
    if (b) b.click(); } catch(e) { return 'EXC ' + e.message } return 'sin login' })()`);
  await new Promise((r) => setTimeout(r, 600));
  await ev(SONDA);

  const listo = await ev(`(function(){
    var faltan = ['generarInforme','calcAo','calcHemo','calcTango','limpiarCampos','showTab',
                  'eaGradoCalculado','_labExcelRow','vliCalc']
      .filter(function(f){ return typeof window[f] !== 'function' });
    return JSON.stringify({ faltan: faltan, tabDoppler: !!document.getElementById('tab-doppler') });
  })()`);

  /* ── 0 · Titulos de los cuatro acordeones ───────────────────────────────────────────────── */
  const titulos = await ev(`JSON.stringify(window.__A.titulos())`);

  /* ── 1 · Orden de Tab de la seccion aortica ─────────────────────────────────────────────── */
  const tabOrden = await ev(`(function(){ try { showTab('doppler') } catch(e){}
    var s = document.getElementById('dop-aortico');
    if (s && s.style.display === 'none') { try { toggleCard('dop-aortico', null) } catch(e){} }
    return JSON.stringify(window.__A.tabOrden()); })()`);

  /* ── 2 · A/B del GRADO: barrido de los cortes sobre la funcion PURA ──────────────────────
     `eaGradoCalculado` lee los tres campos y no toca nada. Se siembran con `seed` (sin eventos)
     para que ninguna cascada los reescriba, y se compara el objeto COMPLETO que devuelve. */
  const sweep = await ev(`(function(){
    var VM  = ['', 1.9, 2.0, 2.1, 2.9, 3.0, 3.1, 3.9, 4.0, 4.1, 5.0];
    var GM  = ['', 19, 20, 39, 40, 41];
    var AV  = ['', 0, 0.5, 0.99, 1.0, 1.01, 1.49, 1.5, 1.51, 2.0];
    var out = {};
    VM.forEach(function(vm){ GM.forEach(function(gm){ AV.forEach(function(av){
      window.__A.seed('vmax_ao', vm);
      window__seedGm(gm); window__seedAv(av);
      var R;
      try { R = eaGradoCalculado() } catch(e) { R = { ERR: e.message } }
      out['v' + vm + '|g' + gm + '|a' + av] = JSON.stringify(R);
    })})});
    return JSON.stringify({ n: Object.keys(out).length, casos: out });
    function window__seedGm(g){ window.__A.seed('gmedio_ao', g) }
    function window__seedAv(a){ window.__A.seed('ava_cont', a) }
  })()`);

  /* ── 3 · A/B de escenas completas: informe, EN SUMA, Excel, campos, PDF y Hemodinamica ─── */
  const ESCENAS = {
    severa:   { peso:70, talla:170, fevi:55, onda_e:90, e_sep:6, e_lat:8, vmax_it:3.0, vti_tsvd:15,
                vmax_ao:4.5, gmedio_ao:45, diam_tsvi:20, itv_tsvi:16, itv_ao:50,
                tango_te:300, tango_tac:90, ava_plan:0.8, hemo_fc:70, hemo_pam:90 },
    moderada: { peso:70, talla:170, fevi:55, onda_e:90, e_sep:6, e_lat:8, vmax_it:2.4, vti_tsvd:18,
                vmax_ao:3.2, gmedio_ao:25, diam_tsvi:21, itv_tsvi:18, itv_ao:45,
                tango_te:320, tango_tac:100, hemo_fc:65, hemo_pam:85 },
    bajoflujo:{ peso:95, talla:160, fevi:35, onda_e:110, e_sep:5, e_lat:6, vmax_it:3.4, vti_tsvd:12,
                vmax_ao:3.6, gmedio_ao:32, diam_tsvi:19, itv_tsvi:12, itv_ao:42,
                tango_te:340, tango_tac:130, hemo_fc:88, hemo_pam:72 },
    vacio:    {},
    /* CONTROL NEGATIVO: las otras tres valvulas cargadas y la aortica VACIA. Si la sonda
       dijera "identico" tambien aca sin que haya nada aortico, no estaria distinguiendo nada. */
    negativo: { peso:70, talla:170, fevi:60, onda_e:80, e_sep:9, e_lat:12,
                vmax_it:2.8, vti_tsvd:16, thp:120, ava_plan:1.4 },
  };
  const escenas = {};
  for (const [k, d] of Object.entries(ESCENAS)) {
    for (const estilo of ['completo', 'intermedio', 'breve']) {
      const r = await ev(`(function(){ window.__A.escena(${JSON.stringify(d)});
        return JSON.stringify(window.__A.foto(${JSON.stringify(estilo)})); })()`);
      escenas[k + '|' + estilo] = JSON.parse(r);
    }
    const x = await ev(`(function(){ window.__A.escena(${JSON.stringify(d)});
      var xl = window.__A.excel();
      return JSON.stringify({ n: (xl && typeof xl === 'object') ? Object.keys(xl).length : xl,
        fila: xl, campos: window.__A.campos(),
        ppt: window.__A.ppt(['vmax_ao','gmedio_ao','ava_cont','vs_calc','ea_grado','diam_tsvi']) }); })()`);
    escenas[k + '|datos'] = JSON.parse(x);
  }

  /* ══ A PARTIR DE ACA, SOLO EL BUILD NUEVO ══════════════════════════════════════════════════
     Estas claves tocan campos y filas que en HEAD no existen, asi que el A/B las ignora. */

  /* ── 4 · PAM = PAD + (PAS-PAD)/3 ────────────────────────────────────────────────────────── */
  const solo_pam = await ev(`(function(){
    var pr = function(pas, pad){
      window.__A.limpiar();
      if (pas !== null) window.__A.set('ao_pas', pas);
      if (pad !== null) window.__A.set('ao_pad', pad);
      return { pam_calc: (typeof aoPamCalc === 'function')
                 ? (function(){ var x = aoPamCalc(); return x === null ? null : x.toFixed(2) })() : 'SIN',
               hemo_pam: window.__A.val('hemo_pam'),
               fila: window.__A.txt('ao-ref-pam'),
               aviso: window.__A.txt('hemo-pam-auto'),
               marca: window.__A.ds('hemo_pam', 'derivadoDe') } };
    return JSON.stringify({
      '110/65': pr(110, 65),
      '120/80': pr(120, 80),
      'pas=pad': pr(90, 90),
      'pas<pad': pr(60, 90),
      'solo_pas': pr(110, null),
      'solo_pad': pr(null, 65),
      'ninguno': pr(null, null),
      /* El medico tipea la PAM a mano y DESPUES carga PAS/PAD: no se pisa. */
      manual_primero: (function(){
        window.__A.limpiar();
        window.__A.set('hemo_pam', 105);
        window.__A.set('ao_pas', 110); window.__A.set('ao_pad', 65);
        return { hemo_pam: window.__A.val('hemo_pam'), fila: window.__A.txt('ao-ref-pam'),
                 aviso: window.__A.txt('hemo-pam-auto') } })(),
      /* La app llena, el medico corrige, la app no vuelve a pisarlo. */
      auto_luego_manual: (function(){
        window.__A.limpiar();
        window.__A.set('ao_pas', 110); window.__A.set('ao_pad', 65);
        var auto = window.__A.val('hemo_pam');
        window.__A.set('hemo_pam', 95);
        window.__A.set('ao_pas', 140);
        return { auto: auto, tras_corregir: window.__A.val('hemo_pam'),
                 aviso: window.__A.txt('hemo-pam-auto') } })(),
      /* Borrar PAS deja la PAM auto en blanco (era nuestra), no la del medico. */
      borrar_pas: (function(){
        window.__A.limpiar();
        window.__A.set('ao_pas', 110); window.__A.set('ao_pad', 65);
        window.__A.set('ao_pas', '');
        return { hemo_pam: window.__A.val('hemo_pam'), fila: window.__A.txt('ao-ref-pam') } })()
    });
  })()`);

  /* ── 5 · Espejos de la FC y de la AVA por planimetria, en los dos sentidos ──────────────── */
  const solo_espejos = await ev(`(function(){
    var o = {};
    o.fc_desde_doppler = (function(){ window.__A.limpiar();
      window.__A.set('ao_fc', 72);
      return { ao_fc: window.__A.val('ao_fc'), hemo_fc: window.__A.val('hemo_fc') } })();
    o.fc_desde_hemo = (function(){ window.__A.limpiar();
      window.__A.set('hemo_fc', 58);
      return { ao_fc: window.__A.val('ao_fc'), hemo_fc: window.__A.val('hemo_fc') } })();
    o.fc_borrar_en_doppler = (function(){ window.__A.limpiar();
      window.__A.set('hemo_fc', 80); window.__A.set('ao_fc', '');
      return { ao_fc: window.__A.val('ao_fc'), hemo_fc: window.__A.val('hemo_fc') } })();
    o.fc_borrar_en_hemo = (function(){ window.__A.limpiar();
      window.__A.set('ao_fc', 80); window.__A.set('hemo_fc', '');
      return { ao_fc: window.__A.val('ao_fc'), hemo_fc: window.__A.val('hemo_fc') } })();
    o.ava_desde_doppler = (function(){ window.__A.limpiar();
      window.__A.set('ava_plan_dop', 0.75);
      return { dop: window.__A.val('ava_plan_dop'), valv: window.__A.val('ava_plan'),
               aviso: window.__A.txt('ava-plan-aviso') } })();
    o.ava_desde_valvulas = (function(){ window.__A.limpiar();
      window.__A.set('ava_plan', 1.2);
      return { dop: window.__A.val('ava_plan_dop'), valv: window.__A.val('ava_plan'),
               aviso: window.__A.txt('ava-plan-aviso') } })();
    o.ava_borrar = (function(){ window.__A.limpiar();
      window.__A.set('ava_plan', 1.2); window.__A.set('ava_plan_dop', '');
      return { dop: window.__A.val('ava_plan_dop'), valv: window.__A.val('ava_plan') } })();
    /* SIN BUCLE: si el espejo se re-disparara, el contador de llamadas creceria sin fin.
       Se mide despachando un input A MANO sobre el destino, que es lo que la guarda ataja. */
    o.sin_bucle = (function(){ window.__A.limpiar();
      var n = 0, orig = window.aoFcSync;
      window.aoFcSync = function(x){ n++; if (n > 50) throw new Error('BUCLE'); return orig(x) };
      try { window.__A.set('ao_fc', 61); window.__A.set('hemo_fc', 61);
            window.__A.set('ao_fc', 62) } catch(e) { window.aoFcSync = orig; return 'BUCLE' }
      window.aoFcSync = orig;
      return { llamadas: n, ao_fc: window.__A.val('ao_fc'), hemo_fc: window.__A.val('hemo_fc') } })();
    return JSON.stringify(o);
  })()`);

  /* ── 6 · Filas del cuadro: TAC/TE, VLI y FEVI en sus bordes ─────────────────────────────── */
  const solo_filas = await ev(`(function(){
    var o = {};
    /* TAC/TE: con TE 1000 el cociente es TAC/1000, asi que TAC 380 da 0,38 y 300 da 0,30.
       Los dos insumos quedan DENTRO de banda (TE [80,600]) usando TE 500 y TAC 190/150. */
    var tacte = function(te, tac){ window.__A.limpiar();
      window.__A.set('vmax_ao', 4.2);
      window.__A.set('tango_te', te); window.__A.set('tango_tac', tac);
      return { fila: window.__A.txt('ao-ref-tacte'), html: window.__A.html('ao-ref-tacte'),
               tango: window.__A.txt('ao-ref-tango'),
               viejo_oculto: window.__A.vis('tango-ratio') } };
    o['tacte_0.38'] = tacte(500, 190);
    o['tacte_0.30'] = tacte(500, 150);
    o['tacte_0.35'] = tacte(500, 175);
    o['tacte_0.36'] = tacte(500, 180);
    o['tacte_vacio'] = tacte(500, '');
    /* VLI = VS/ASC. Se busca el borde moviendo el VTI TSVI con peso/talla fijos. */
    var vli = function(peso, talla, d, vti){ window.__A.limpiar();
      window.__A.set('peso', peso); window.__A.set('talla', talla);
      window.__A.set('diam_tsvi', d); window.__A.set('itv_tsvi', vti);
      window.__A.set('itv_ao', 50);
      try { calcAo() } catch(e) {}
      var x = (typeof vliCalc === 'function') ? vliCalc() : null;
      return { vli: x === null ? null : x.toFixed(3), fila: window.__A.txt('ao-ref-vli'),
               html: window.__A.html('ao-ref-vli') } };
    o.vli_busqueda = (function(){
      var r = {};
      [20.0, 20.5, 21.0, 21.5, 22.0].forEach(function(vti){
        r['vti' + vti] = vli(70, 170, 20, vti) });
      return r })();
    /* ⚠️ EL BORDE EXACTO SE FIJA POR EL VS Y NO POR EL VTI, porque 35,000 ml/m2 no cae en ningun
       VTI redondo: se siembra vs_calc = k x ASC (sin eventos, para que calcAo no lo reescriba) y
       se llama al pintor. Es lo que da el DENOMINADOR de la rama verde — con el barrido por VTI de
       arriba las seis escenas daban BAJO FLUJO y la rama de flujo normal no se probaba. */
    o.vli_borde = (function(){
      window.__A.limpiar();
      window.__A.set('peso', 70); window.__A.set('talla', 170);
      var bsa = (typeof getBSA === 'function') ? getBSA() : null;
      if (!bsa) return 'SIN getBSA';
      var r = { bsa: bsa.toFixed(4) };
      [34, 35, 36, 40].forEach(function(k){
        window.__A.seed('vs_calc', (k * bsa).toFixed(6));
        try { aoRefPintar() } catch(e) {}
        var x = (typeof vliCalc === 'function') ? vliCalc() : null;
        r['vli_' + k] = { vli: x === null ? null : x.toFixed(4),
                          fila: window.__A.txt('ao-ref-vli'),
                          html: window.__A.html('ao-ref-vli') } });
      return r })();
    var fevi = function(f){ window.__A.limpiar();
      if (f !== null) window.__A.set('fevi', f);
      try { aoRefPintar() } catch(e) {}
      return { fila: window.__A.txt('ao-ref-fevi'), html: window.__A.html('ao-ref-fevi') } };
    o.fevi_49 = fevi(49); o.fevi_50 = fevi(50); o.fevi_51 = fevi(51);
    o.fevi_vacia = fevi(null);
    return JSON.stringify(o);
  })()`);

  /* ── 7 · «Nuevo estudio» y reapertura de un guardado antiguo (sin PAS/PAD) ──────────────── */
  const solo_limpiar = await ev(`(function(){
    window.__A.limpiar();
    window.__A.set('ao_pas', 130); window.__A.set('ao_pad', 70);
    window.__A.set('ao_fc', 75); window.__A.set('ava_plan_dop', 0.9);
    var antes = { pas: window.__A.val('ao_pas'), pad: window.__A.val('ao_pad'),
                  fc: window.__A.val('ao_fc'), hemo_fc: window.__A.val('hemo_fc'),
                  pam: window.__A.val('hemo_pam'), aviso: window.__A.txt('hemo-pam-auto'),
                  fila_pam: window.__A.txt('ao-ref-pam'), ava: window.__A.val('ava_plan_dop') };
    try { limpiarCampos(true) } catch(e) {}
    var despues = { pas: window.__A.val('ao_pas'), pad: window.__A.val('ao_pad'),
                    fc: window.__A.val('ao_fc'), hemo_fc: window.__A.val('hemo_fc'),
                    pam: window.__A.val('hemo_pam'), aviso: window.__A.txt('hemo-pam-auto'),
                    marca: window.__A.ds('hemo_pam','derivadoDe'),
                    fila_pam: window.__A.txt('ao-ref-pam'), ava: window.__A.val('ava_plan_dop'),
                    filas: ['ao-ref-vmax','ao-ref-gmed','ao-ref-ava','ao-ref-tacte','ao-ref-tango',
                            'ao-ref-vs','ao-ref-vli','ao-ref-fevi','ao-ref-gc','ao-ref-ic',
                            'ao-ref-pcp','ao-ref-rvs','ao-ref-rvp','dvi-val']
                           .map(function(id){ return id + '=' + window.__A.txt(id) }) };
    /* Un guardado ANTIGUO: trae hemo_fc y ava_plan y NO trae los campos nuevos. Es lo que
       aoEspejosRestaurar (en RECALC_MODULOS) tiene que rellenar al reabrir. */
    var legado = (function(){
      try { limpiarCampos(true) } catch(e) {}
      window.__A.seed('hemo_fc', 68); window.__A.seed('ava_plan', 1.1);
      var pre = { ao_fc: window.__A.val('ao_fc'), dop: window.__A.val('ava_plan_dop') };
      try { if (typeof _recalcModulos === 'function') _recalcModulos();
            else RECALC_MODULOS.forEach(function(f){ try { window[f]() } catch(e){} }) } catch(e) {}
      return { pre: pre, post: { ao_fc: window.__A.val('ao_fc'),
               dop: window.__A.val('ava_plan_dop'), hemo_fc: window.__A.val('hemo_fc'),
               valv: window.__A.val('ava_plan'), pas: window.__A.val('ao_pas'),
               pad: window.__A.val('ao_pad') } } })();
    return JSON.stringify({ antes: antes, despues: despues, legado: legado });
  })()`);

  /* ── 8 · Maquetacion: 1200 / 390 / 360 px, con la seccion ABIERTA y cargada ─────────────── */
  const movil = {};
  for (const w of [1200, 390, 360]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
    await new Promise((r) => setTimeout(r, 300));
    movil[w] = JSON.parse(await ev(`(function(){
      try { showTab('doppler') } catch(e){}
      ['dop-mitral','dop-aortico','dop-tricusp','dop-pulmonar'].forEach(function(id){
        var s = document.getElementById(id);
        if (s && s.style.display === 'none') { try { toggleCard(id, null) } catch(e){} } });
      window.__A.escena({ peso:70, talla:170, fevi:45, vmax_ao:4.5, gmedio_ao:45, diam_tsvi:20,
        itv_tsvi:16, itv_ao:50, tango_te:500, tango_tac:190, onda_e:90, e_sep:6, e_lat:8,
        vmax_it:3.0, vti_tsvd:15, hemo_fc:70 });
      try { showTab('doppler') } catch(e){}
      var d = document.documentElement;
      var caja = function(sel){ var e = document.querySelector(sel); if (!e) return null;
        var r = e.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), der: Math.round(r.right),
                 desborda: r.right > d.clientWidth + 1 } };
      /* Columnas efectivas: cuantas cajas hijas comparten la primera fila (mismo top). */
      var cols = function(sel){ var c = document.querySelector(sel); if (!c) return null;
        var hijos = Array.prototype.slice.call(c.children)
          .filter(function(e){ return getComputedStyle(e).display !== 'none' });
        if (!hijos.length) return 0;
        var top0 = Math.round(hijos[0].getBoundingClientRect().top);
        return hijos.filter(function(e){
          return Math.abs(Math.round(e.getBoundingClientRect().top) - top0) < 3 }).length };
      /* Ningun campo ni fila de la seccion aortica se sale del viewport. */
      var peor = { id: null, der: -1 };
      document.querySelectorAll('#dop-aortico input, #dop-aortico .calc-row, #dop-aortico label')
        .forEach(function(e){ var r = e.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return;
          if (r.right > peor.der) peor = { id: e.id || e.className || e.tagName, der: Math.round(r.right) } });
      return JSON.stringify({
        scrollW: d.scrollWidth, clientW: d.clientWidth,
        hayBarra: d.scrollWidth > d.clientWidth + 1,
        grid: caja('#dop-aortico .ao-cols-5'), ref: caja('#dop-aortico .ao-ref-2'),
        colsGrid: cols('#dop-aortico .ao-cols-5'), colsRef: cols('#dop-aortico .ao-ref-2'),
        peorDer: peor, titulos: window.__A.titulosGeom() });
    })()`));
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  const consola = await ev(`JSON.stringify(window.__erroresConsola || null)`);
  const despues = await md5(join(RAIZ, 'index.html'));
  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues,
    listo: JSON.parse(listo), titulos: JSON.parse(titulos),
    tabOrden: JSON.parse(tabOrden), sweep: JSON.parse(sweep), escenas,
    solo_pam: JSON.parse(solo_pam), solo_espejos: JSON.parse(solo_espejos),
    solo_filas: JSON.parse(solo_filas), solo_limpiar: JSON.parse(solo_limpiar),
    movil, consola: consola ? JSON.parse(consola) : null,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
