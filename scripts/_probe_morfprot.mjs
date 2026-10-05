#!/usr/bin/env node
/**
 * _probe_morfprot.mjs — sonda A/B de SOLO LECTURA para el EN SUMA de la MORFOLOGIA y de las
 * PROTESIS en la PULMONAR y la TRICUSPIDE (parte D del pedido del 2026-10-05).
 *
 * Mide, en Chrome real y por el emisor de verdad (generarInforme):
 *   1. LA TABLA DE TEXTOS del EN SUMA — cada morfologia nativa sola y con una lesion, y las dos
 *      protesis en los ocho estados de lesion que el pedido enumera, para las DOS valvulas.
 *   2. EL CUERPO del informe en las mismas escenas, que NO debe cambiar: el A/B contra HEAD es
 *      lo que lo prueba. Las cuatro superficies se leen por separado.
 *   3. CONTROL NEGATIVO — mitral y aortica con datos cargados: sus lineas del cuerpo y del EN
 *      SUMA tienen que salir identicas a HEAD.
 *   4. DENOMINADOR — cuantas escenas producen un EN SUMA distinto. Una tabla de filas iguales
 *      se leeria como cobertura; sin este recuento, «no hay diferencias» no significa nada.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_morfprot.mjs --file /tmp/index.HEAD.html > /tmp/mp.HEAD.json
 *   node scripts/_probe_morfprot.mjs                            > /tmp/mp.NEW.json
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_tricred.mjs.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-mp-'));
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
    const errores = [];
    ws.addEventListener('open', () => res({
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      errores,
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params?.exceptionDetails;
        errores.push({ tipo: 'exception', texto: d?.exception?.description || d?.text || '?' });
      } else if (m.method === 'Runtime.consoleAPICalled' && m.params?.type === 'error') {
        errores.push({ tipo: 'console.error',
          texto: (m.params.args || []).map((a) => a.description ?? a.value ?? '?').join(' ') });
      }
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   CUIDADO: CUERPO DE TEMPLATE LITERAL. Ni un acento grave adentro, tampoco en los comentarios.
   scripts/check_backticks.py da la linea exacta si se cuela uno; node --check apunta decenas de
   lineas antes. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  pill(valv, tipo) { try { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  /* Pone la pastilla en el estado pedido con el MISMO gesto que el medico (toggleValvPill), no
     escribiendo la clave de localStorage: ese atajo salta las cadenas de sincronizacion que
     deciden el grado y la visibilidad, y la escena dejaria de describir un paciente. */
  pillSet(valv, tipo, on) {
    try {
      if (window.__P.pill(valv, tipo) !== on) toggleValvPill(valv, tipo);
      return window.__P.pill(valv, tipo);
    } catch(e) { return 'EXC' } },

  limpiar() {
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    window._itGradoCalc = null; window._imGradoCalc = null; window._iaGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v); } catch(e){}
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t); } catch(e){}
      });
    });
    return 1 },

  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value, ok: String(e.value) === String(valor) } },

  /* El tab de Valvulas abierto y las cuatro secciones desplegadas: lo que esta en display:none no
     tiene geometria y toggleValvPill sale por su return temprano si el bloque de grado no se ve.
     Sin esto, una escena entera puede no llegar a prender nada y la fila sale vacia pareciendo
     que el codigo no dijo nada. */
  denominador() {
    try { showTab('valvulas'); } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    var ab = toks.filter(function(tok){ return vis('ete-seccion-' + tok) }).length;
    return { tab: vis('tab-valvulas'), secciones: ab, ok: vis('tab-valvulas') && ab === 4 } },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return; } catch(e){}
      campos[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0'; });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-03', campos: campos }); }
    catch(e) { return 'EXC: ' + e.message; } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* POR LINEA Y NO POR ORACION. El informe se arma con inf.push y se escribe con join por salto
     de linea, asi que UNA linea es el parrafo entero de una valvula; partir por oracion pierde
     las que no nombran la valvula («Se observa estenosis significativa (...)»). */
  lineas(texto, re) {
    return String(texto || '').split(/\\n+/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },

  cuerpoVP(texto) { return window.__P.lineas(texto, /\\bVP\\b|pulmonar/i) },
  cuerpoVT(texto) { return window.__P.lineas(texto, /\\bVT\\b|tric[\\u00fau]sp/i) },
  sumaVP(suma)    { return window.__P.lineas(suma, /\\bVP\\b|\\bIP\\b|\\bEP\\b|pulmonar/i) },
  sumaVT(suma)    { return window.__P.lineas(suma, /\\bVT\\b|\\bIT\\b|\\bET\\b|tric[\\u00fau]sp/i) },

  /* CONTROL NEGATIVO: mitral y aortica. Si una de estas se mueve, el cambio se fue de las dos
     valvulas del pedido. */
  otras(texto) { return window.__P.lineas(texto, /mitral|a[\\u00f3o]rtic/i) },

  /* ESCENARIO BASE del control negativo. Sin datos cargados, las lineas de mitral y aortica
     salen vacias en los DOS lados del A/B y «identicas» no prueba nada. */
  baseOtras() {
    window.__P.set('vm_morf', 'Mixomatosa');
    window.__P.set('im_grado', '2');
    window.__P.set('em_gmedio', '6');
    window.__P.set('va_morf', 'Trivalva normal');
    window.__P.set('vmax_ao', '4.2');
    window.__P.set('ia_grado', '1');
    return { im: window.__P.val('im_grado'), vmax_ao: window.__P.val('vmax_ao') } },

  foto() {
    return {
      vp_morf: window.__P.val('vp_morf'), vt_morf: window.__P.val('vt_morf'),
      ip_grado: window.__P.val('ip_grado'), ep_grado: window.__P.val('ep_grado'),
      it_grado: window.__P.val('it_grado'), et_grado: window.__P.val('et_grado'),
      ip_vmax: window.__P.val('ip_vmax'), vmax_it: window.__P.val('vmax_it'),
      pillIP: window.__P.pill('pulmonar','insuf'), pillEP: window.__P.pill('pulmonar','esten'),
      pillIT: window.__P.pill('tricuspide','insuf'), pillET: window.__P.pill('tricuspide','esten')
    } },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleValvPill','toggleEteSeccion','showTab',
                  'limpiarCampos','calcIP','calcVP','calcIT_ESC','calcET','setEstiloInforme',
                  'valvMorfDe','valvMorfAdj','valvEsProtesis','protNoGradua']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('vp_morf')) return { listo:false, por:'sin vp_morf' };
    if (!document.getElementById('vt_morf')) return { listo:false, por:'sin vt_morf' };
    return { listo:true } }
};
'OK';
`;

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

/* ══ LAS ESCENAS ═══════════════════════════════════════════════════════════════════════════════
   Cada una es una lista de pasos que la sonda ejecuta DESPUES de limpiar. Se escriben como
   codigo porque prender una pastilla es un gesto, no un valor de campo. */

const MORF_VP = ['Normal', 'Displásica (congénita)', 'Reumática', 'Carcinoide', 'No especificada'];
const MORF_VT = ['Normal', 'Mixomatosa', 'Reumática', 'Carcinoide', 'Endocarditis',
                 'Funcional / dilatación VD'];
const PROT = ['Prótesis biológica', 'Prótesis mecánica'];

/* Los ocho estados de lesion que el pedido enumera, uno por valvula. La IP y la IT van con el
   grado del select; la Vmax es la escena 8 (velocidad cargada y boton apagado). */
const EST_VP = [
  ['sin lesion',                      `` ],
  ['solo insuf SIN grado',            `window.__P.pillSet('pulmonar','insuf',true);` ],
  ['solo insuf CON grado',            `window.__P.set('ip_grado','Leve');` ],
  ['solo esten SIN grado',            `window.__P.pillSet('pulmonar','esten',true);` ],
  ['solo esten CON grado',            `window.__P.set('ep_grado','Moderada');` ],
  ['ambas CON grado',                 `window.__P.set('ip_grado','Leve'); window.__P.set('ep_grado','Moderada');` ],
  ['ambas SIN grado',                 `window.__P.pillSet('pulmonar','insuf',true); window.__P.pillSet('pulmonar','esten',true);` ],
  ['insuf por Vmax, boton APAGADO',   `window.__P.set('ip_vmax','2.5'); window.__P.pillSet('pulmonar','insuf',false);` ],
];
const EST_VT = [
  ['sin lesion',                      `` ],
  ['solo insuf SIN grado',            `window.__P.pillSet('tricuspide','insuf',true);` ],
  ['solo insuf CON grado',            `window.__P.set('it_grado','1');` ],
  ['solo esten SIN grado',            `window.__P.pillSet('tricuspide','esten',true);` ],
  ['solo esten CON grado',            `window.__P.set('et_grado','Significativa');` ],
  ['ambas CON grado',                 `window.__P.set('it_grado','1'); window.__P.set('et_grado','Significativa');` ],
  ['ambas SIN grado',                 `window.__P.pillSet('tricuspide','insuf',true); window.__P.pillSet('tricuspide','esten',true);` ],
  ['insuf por Vmax, boton APAGADO',   `window.__P.set('vmax_it','2.5'); window.__P.pillSet('tricuspide','insuf',false);` ],
];

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page' && x.url.includes('127.0.0.1'));
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'exc');
    return r.result.value;
  };

  for (let i = 0; i < 60; i++) {
    try { await ev(SONDA); const l = await ev('JSON.stringify(window.__P.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = JSON.parse(await ev('JSON.stringify(window.__P.listo())'));
  const consolaAlCargar = cdp.errores.slice();

  const escenas = [];
  const escena = async (nombre, valv, pasos, conOtras) => {
    const r = JSON.parse(await ev(`(function(){
      window.__P.limpiar();
      var den = window.__P.denominador();
      ${conOtras ? 'var base = window.__P.baseOtras();' : 'var base = null;'}
      ${pasos}
      var f = window.__P.foto();
      var out = { den: den, base: base, foto: f };
      ['estandar','conciso','narrativo'].forEach(function(est){
        var r = window.__P.informe(est);
        out[est] = {
          cuerpo: ${valv === 'vp' ? 'window.__P.cuerpoVP(r.inf)' : 'window.__P.cuerpoVT(r.inf)'},
          suma:   ${valv === 'vp' ? 'window.__P.sumaVP(r.suma)'  : 'window.__P.sumaVT(r.suma)'},
          otras:  window.__P.otras(r.inf),
          sumaEntero: r.suma
        };
      });
      return JSON.stringify(out);
    })()`));
    escenas.push({ nombre, valv, ...r });
  };

  /* ── 1) MORFOLOGIAS NATIVAS, SOLAS Y CON UNA LESION ───────────────────────────────────────── */
  for (const m of MORF_VP) {
    await escena(`VP · ${m} · sola`, 'vp', `window.__P.set('vp_morf', ${JSON.stringify(m)});`);
    await escena(`VP · ${m} · con IP leve`, 'vp',
      `window.__P.set('vp_morf', ${JSON.stringify(m)}); window.__P.set('ip_grado','Leve');`);
  }
  for (const m of MORF_VT) {
    await escena(`VT · ${m} · sola`, 'vt', `window.__P.set('vt_morf', ${JSON.stringify(m)});`);
    await escena(`VT · ${m} · con IT leve`, 'vt',
      `window.__P.set('vt_morf', ${JSON.stringify(m)}); window.__P.set('it_grado','1');`);
  }

  /* ── 2) LAS DOS PROTESIS EN LOS OCHO ESTADOS ──────────────────────────────────────────────── */
  for (const p of PROT) {
    for (const [et, pasos] of EST_VP) {
      await escena(`VP · ${p} · ${et}`, 'vp',
        `window.__P.set('vp_morf', ${JSON.stringify(p)}); ${pasos}`);
    }
  }
  for (const p of PROT) {
    for (const [et, pasos] of EST_VT) {
      await escena(`VT · ${p} · ${et}`, 'vt',
        `window.__P.set('vt_morf', ${JSON.stringify(p)}); ${pasos}`);
    }
  }

  /* ── 2b) ⚠️ EL DENOMINADOR DEL DEFECTO PRINCIPAL — PROTESIS CON UN PARAMETRO MEDIDO ─────────
     Las 32 escenas de arriba NO ejercitan el bloque de «normofuncionante»: su compuerta (1) exige
     que haya al menos un parametro de V.mide cargado (vp_gmax / vp_vmax / vp_dvi en la pulmonar,
     et_gmedio / et_avt / vt_dvi / it_vc en la tricuspide), y ninguna de ellas carga uno. Sin estas
     escenas, el A/B diria que el arreglo funciona sobre un camino que nunca corrio: es el defecto
     del denominador que este repo ya pago varias veces. ACA es donde HEAD duplica la linea. */
  await escena('VP · Prótesis biológica · DVI medido (sin lesion)', 'vp',
    `window.__P.set('vp_morf','Prótesis biológica'); window.__P.set('vp_dvi','0.35');`);
  await escena('VP · Prótesis biológica · Vmax medida (sin lesion)', 'vp',
    `window.__P.set('vp_morf','Prótesis biológica'); window.__P.set('vp_vmax','3.0');`);
  await escena('VP · Prótesis mecánica · Vmax medida + IP leve', 'vp',
    `window.__P.set('vp_morf','Prótesis mecánica'); window.__P.set('vp_vmax','3.0');
     window.__P.set('ip_grado','Leve');`);
  await escena('VT · Prótesis biológica · grad medio medido (sin lesion)', 'vt',
    `window.__P.set('vt_morf','Prótesis biológica'); window.__P.set('et_gmedio','3');`);
  await escena('VT · Prótesis biológica · DVI medido (sin lesion)', 'vt',
    `window.__P.set('vt_morf','Prótesis biológica'); window.__P.set('vt_dvi','0.35');`);
  await escena('VT · Prótesis mecánica · grad medio medido + IT severa', 'vt',
    `window.__P.set('vt_morf','Prótesis mecánica'); window.__P.set('et_gmedio','3');
     window.__P.set('vmax_it','3.0'); window.__P.set('pmad','15'); window.__P.set('it_grado','4');`);

  /* El grado por la NEGATIVA, que es el unico de los dos tokens de la ET binaria que no aparece
     arriba. Se mide para poder DECLARAR como queda la frase, no porque se haya elegido. */
  await escena('VT · Prótesis biológica · esten NO significativa', 'vt',
    `window.__P.set('vt_morf','Prótesis biológica'); window.__P.set('et_grado','No significativa');`);
  await escena('VT · Reumática · esten NO significativa (nativa, control)', 'vt',
    `window.__P.set('vt_morf','Reumática'); window.__P.set('et_grado','No significativa');`);

  /* ── 3) CONTROL NEGATIVO con denominador: mitral y aortica cargadas ───────────────────────── */
  await escena('CONTROL · mitral+aortica con protesis pulmonar', 'vp',
    `window.__P.set('vp_morf','Prótesis biológica'); window.__P.set('ip_grado','Leve');`, true);
  await escena('CONTROL · mitral+aortica con protesis tricuspide', 'vt',
    `window.__P.set('vt_morf','Prótesis mecánica'); window.__P.set('it_grado','2');`, true);
  await escena('CONTROL · mitral+aortica con carcinoide pulmonar', 'vp',
    `window.__P.set('vp_morf','Carcinoide'); window.__P.set('ep_grado','Severa');`, true);

  /* ── 3b) ESTUDIOS GUARDADOS ANTIGUOS — que reabran sin errores ─────────────────────────────
     La reposicion es IDENTICA a la de editarInforme: _migrarCamposLegacy y despues asignacion
     DIRECTA, sin eventos, con los botones APAGADOS, que es como vuelve un estudio del disco.
     Los campos legados que importan a esta tanda: et_grado en su valor de FABRICA viejo
     («Sin estenosis»), ip_grado con el prefijo «IP» que el modelo viejo traia, vp_morf en «No
     especificada» (el valor al que MIGRAN los estudios viejos) e it_grado en '3', el grado que
     quedo inalcanzable. Se cuentan los errores de consola, que es el objeto de la verificacion. */
  const legado = JSON.parse(await ev(`(function(){
    var out = {};
    var reabrir = function(etq, campos) {
      window.__P.limpiar(); window.__P.denominador();
      var c = {};
      Object.keys(campos).forEach(function(k){ c[k] = String(campos[k]); });
      try { if (typeof _migrarCamposLegacy === 'function') c = _migrarCamposLegacy(c); } catch(e){}
      Object.keys(c).forEach(function(k){
        var el = document.getElementById(k); if (el) el.value = c[k]; });
      try { if (typeof _sevManualDesdeCampos === 'function') {
        window.esqSevManual = _sevManualDesdeCampos(c);
        if (typeof _sevManualSync === 'function') _sevManualSync(); } } catch(e){}
      var r = window.__P.informe('estandar');
      out[etq] = { migrado: { vp_morf:c.vp_morf, vt_morf:c.vt_morf,
                              et_grado:c.et_grado, ip_grado:c.ip_grado, it_grado:c.it_grado },
                   leido: { vp_morf: window.__P.val('vp_morf'), vt_morf: window.__P.val('vt_morf'),
                            et_grado: window.__P.val('et_grado') },
                   sumaVP: window.__P.sumaVP(r.suma), sumaVT: window.__P.sumaVT(r.suma),
                   cuerpoVP: window.__P.cuerpoVP(r.inf), cuerpoVT: window.__P.cuerpoVT(r.inf),
                   err: (r.err || null) };
    };
    reabrir('a_protesis_pulmonar_legado',
      { vp_morf:'Prótesis biológica', ip_grado:'IP moderada', vp_vmax:'3.0', nombre:'L1' });
    reabrir('b_protesis_tricuspide_legado',
      { vt_morf:'Prótesis mecánica', et_grado:'Sin estenosis', it_grado:'3',
        et_gmedio:'3', nombre:'L2' });
    reabrir('c_vp_no_especificada_legado',
      { vp_morf:'No especificada', ep_grado:'Moderada-severa', nombre:'L3' });
    reabrir('d_vt_nativa_legado',
      { vt_morf:'Carcinoide', et_grado:'Sin estenosis', it_grado:'1', nombre:'L4' });
    return JSON.stringify(out);
  })()`));

  /* ── 3c) LOS TRES HALLAZGOS DE /sharp-edges SOBRE ESTE DIFF, MEDIDOS ───────────────────────
     (F1) EL AUTO-GRADO NATIVO SOBREVIVE AL CAMBIO DE MORFOLOGIA. Cargar la Vmax con la valvula
          NATIVA deja ep_grado escrito por calcVP con cortes ESC/ASE; elegir despues la protesis
          NO lo retira (el onchange de vp_morf es vpSync+valvProtSync, y calcVP sale temprano por
          protNoGraduaPintar). Se mide en HEAD y en el cambio para separar «lo rompi yo» de «ya
          estaba roto»: en HEAD sale como sigla «EP moderada.».
     (F6) EL NIVEL DE LA EP en el caso protesico: HEAD publicaba «EP moderada a nivel X.» y el
          formato pedido para la linea unica no lleva nivel. Se mide la perdida.
     (F2) El grado por la NEGATIVA de la ET, que ya se midio arriba.
     NINGUNO SE CORRIGE ACA: los tres son redaccion o criterio del informe firmado. */
  const sharp = JSON.parse(await ev(`(function(){
    var out = {};
    /* F1 pulmonar: dos gestos, en el orden del dia a dia (Doppler primero, Valvulas despues). */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('vp_vmax','3.5');
    out.f1_vp_grado_tras_doppler = window.__P.val('ep_grado');
    window.__P.set('vp_morf','Prótesis biológica');
    out.f1_vp_grado_tras_protesis = window.__P.val('ep_grado');
    var r1 = window.__P.informe('estandar');
    out.f1_vp = { suma: window.__P.sumaVP(r1.suma), cuerpo: window.__P.cuerpoVP(r1.inf),
                  badge: (function(){ var e = document.getElementById('vp-sev-badge');
                    return e ? (e.textContent||'').trim() : null })() };
    /* F1 tricuspide: el gradiente medio escribe et_grado antes de que la morfologia sea protesis. */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_gmedio','6');
    out.f1_vt_grado_tras_gradiente = window.__P.val('et_grado');
    window.__P.set('vt_morf','Prótesis biológica');
    out.f1_vt_grado_tras_protesis = window.__P.val('et_grado');
    var r2 = window.__P.informe('estandar');
    out.f1_vt = { suma: window.__P.sumaVT(r2.suma), cuerpo: window.__P.cuerpoVT(r2.inf) };
    /* F6: el nivel de la EP con protesis. */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('vp_morf','Prótesis biológica');
    window.__P.set('ep_grado','Moderada');
    window.__P.set('ep_nivel','Supravalvular');
    var r3 = window.__P.informe('estandar');
    out.f6_nivel = { nivel: window.__P.val('ep_nivel'),
                     suma: window.__P.sumaVP(r3.suma), cuerpo: window.__P.cuerpoVP(r3.inf) };
    return JSON.stringify(out);
  })()`));

  /* ── 4) El Excel, por el emisor real ──────────────────────────────────────────────────────── */
  const excel = JSON.parse(await ev(`(function(){
    window.__P.limpiar();
    var xls = window.__P.excel();
    return JSON.stringify({ cols: (xls && typeof xls === 'object') ? Object.keys(xls).length : xls,
      epGrado: (xls && typeof xls === 'object') ? xls['EP grado'] : null,
      etGrado: (xls && typeof xls === 'object') ? xls['ET grado'] : null });
  })()`));

  const despues = await md5(join(RAIZ, 'index.html'));

  /* ══ DENOMINADOR ═════════════════════════════════════════════════════════════════════════════
     Cuantas de las escenas producen un EN SUMA distinto. Sin este recuento, un A/B «sin
     diferencias» tambien lo cumpliria una sonda que no toco nada: es el error que este repo ya
     pago varias veces midiendo sobre un contenedor vacio. */
  const sumas = escenas.map((e) => (e.estandar.suma || []).join(' ¶ '));
  const distintos = new Set(sumas).size;
  const vacias = sumas.filter((s) => !s).length;

  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues,
    listo, consolaAlCargar, consolaTotal: cdp.errores.slice(),
    sinErroresDeConsola: cdp.errores.length === 0,
    denominador: { escenas: escenas.length, sumasDistintas: distintos, sumasVacias: vacias },
    excel, legado, sharp, escenas,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
