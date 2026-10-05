#!/usr/bin/env node
/**
 * _probe_tricred.mjs — sonda A/B de SOLO LECTURA para la REDACCION del informe y del EN SUMA
 * de la TRICUSPIDE (parte A del pedido del 2026-10-05).
 *
 * Mide tres cosas:
 *   1. LA TABLA DE TEXTOS — 15 escenas, una por rama del ensamblado nuevo (A2/A3/A4/A5).
 *   2. LA MATRIZ DE MORFOLOGIAS — las cinco etiologicas (Carcinoide, Endocarditis, Protesis
 *      biologica, Protesis mecanica, Funcional/dilatacion VD) x {IT severa, ET significativa},
 *      que es lo que A1.1 pide mostrar textualmente, mas Mixomatosa y Reumatica como control.
 *   3. LAS CINCO RUTAS DE RESTAURACION de A1.5 (guardado/reabierto, importado, apagado a mano).
 * Mas el control negativo de mitral y aortica (sus oraciones tienen que salir identicas) y el
 * recuento de columnas del Excel.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_tricred.mjs --file /tmp/index.HEAD.html > /tmp/tred.HEAD.json
 *   node scripts/_probe_tricred.mjs                            > /tmp/tred.NEW.json
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_etbin.mjs.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-tred-'));
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
    /* ⚠️ LOS ERRORES DE CONSOLA SE RECOGEN POR EVENTO DE CDP, NO LEYENDO UNA VARIABLE DE LA PAGINA.
       La primera version de esta sonda hacia (window.__errs || []) y reportaba «consola: []» en los
       dos lados del A/B — pero `__errs` NO EXISTE en index.html (cero ocurrencias), asi que ese
       cero era el valor por defecto de un arreglo inventado y no la ausencia de errores. Un
       denominador falso que ademas decia justo lo que uno quiere leer. Ahora se escuchan
       Runtime.exceptionThrown y Runtime.consoleAPICalled de verdad. */
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
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(valv, tipo) { try { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  /* UNIDAD DECLARADA POR EL PROPIO CAMPO de la Vmax del jet de IT: una escena describe un PACIENTE
     (3,0 m/s) y no un tecleo. El campo estuvo en cm/s hasta el 2026-10-05. */
  unidadCW() { var e = document.getElementById('it_vmax_cw');
    return e ? String(e.placeholder || '').trim() : null },
  cwIT(ms) { return window.__P.unidadCW() === 'cm/s' ? ms * 100 : ms },

  denominador() {
    try { showTab('valvulas'); } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    var acord = {};
    toks.forEach(function(tok){ acord[tok.replace('valv-','')] = vis('ete-seccion-' + tok); });
    var ab = Object.keys(acord).filter(function(k){ return acord[k] }).length;
    return { tab: vis('tab-valvulas'), secciones: ab, ok: vis('tab-valvulas') && ab === 4 } },

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

  /* La fila del Excel del Laboratorio por el emisor REAL. No genera el .xlsx. */
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

  /* ⚠️ POR LINEA Y NO POR ORACION, Y LA PRIMERA VERSION DE ESTA SONDA LO TENIA MAL. El informe se
     arma con inf.push(...) y se escribe con join por salto de linea, asi que UNA linea es el
     parrafo entero de una valvula. Partiendo por ORACION y filtrando por la familia de palabras
     de la tricuspide se perdian dos oraciones del ensamblado nuevo —«Se observa estenosis
     significativa (...)» y «Presenta elementos indirectos de HTP (...)»— porque ninguna de las dos
     nombra la valvula: la escena de las DOS lesiones aparecia sin su estenosis y parecia un defecto
     del codigo cuando era del denominador de la sonda.
     La tilde va en la clase: el informe escribe «tricuspide» CON acento. */
  frasesVT(texto) {
    var re = /tric[\\u00fau]sp/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },

  /* CONTROL NEGATIVO: las lineas de la MITRAL y la AORTICA. Si una de estas se mueve, el cambio
     se fue de la tricuspide. */
  frasesOtras(texto) {
    var re = /mitral|a[\\u00f3o]rtic/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },

  /* Las lineas del EN SUMA que nombran la tricuspide, en ORDEN: A5 exige que «VT <morf>.» vaya
     ANTES de las dos lesiones, asi que el orden es parte de la medicion y no un detalle. */
  sumaVT(suma) {
    return String(suma || '').split(/\\n+/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && /\\bVT\\b|\\bIT\\b|\\bET\\b|tric[\\u00fau]sp/i.test(s) }) },

  foto() {
    return {
      pillInsuf: window.__P.pill('tricuspide','insuf'),
      pillEsten: window.__P.pill('tricuspide','esten'),
      it_grado:  window.__P.val('it_grado'),
      et_grado:  window.__P.val('et_grado'),
      vt_morf:   window.__P.val('vt_morf'),
      vmax_it:   window.__P.val('vmax_it'),
      pmad:      window.__P.val('pmad'),
      psap_calc: window.__P.val('psap_calc'),
      et_avt:    window.__P.val('et_avt'),
      etNota:    window.__P.val('et_fund_nota'),
      itNota:    window.__P.val('it_fund_nota'),
      etDiscrepa: (function(){ try { return (typeof sevDiscrepa === 'function')
                    ? sevDiscrepa('et') : 'SIN sevDiscrepa' } catch(e) { return 'EXC' } })(),
      itDiscrepa: (function(){ try { return (typeof sevDiscrepa === 'function')
                    ? sevDiscrepa('it') : 'SIN sevDiscrepa' } catch(e) { return 'EXC' } })(),
      lsEsten:   (function(){ try { return localStorage.getItem('valv-pill-esten-tricuspide') }
                    catch(e) { return 'EXC' } })()
    } },

  /* ESCENARIO BASE COMPARTIDO: un paciente con mitral y aortica cargadas, para que el control
     negativo tenga DENOMINADOR. Sin esto las frases de las otras dos valvulas salen vacias en
     los dos lados del A/B y «identicas» no significa nada. */
  baseOtras() {
    window.__P.set('vm_morf', 'Mixomatosa');
    window.__P.set('im_grado', '2');
    window.__P.set('va_morf', 'Trivalva normal');
    window.__P.set('vmax_ao', '4.2');
    return { im: window.__P.val('im_grado'), vmax_ao: window.__P.val('vmax_ao') } },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleEteSeccion','showTab','limpiarCampos',
                  'calcIT_ESC','calcET','sevSincronizar','setEstiloInforme','valvMorfDe']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('vt_morf')) return { listo:false, por:'sin vt_morf' };
    return { listo:true } }
};
'OK';
`;

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

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
  /* Un error de consola a esta altura ya fue recogido por el listener; se congela una foto aqui
     para distinguir «errores al cargar» de «errores durante las escenas». */
  const consolaAlCargar = cdp.errores.slice();

  const escenas = [];
  /* `conOtras` decide si la escena carga el escenario base de mitral/aortica. Las escenas de la
     TABLA DE TEXTOS van SIN, para que la frase de la tricuspide se lea sola; el control negativo
     tiene su propio bloque mas abajo, con denominador. */
  const escena = async (nombre, pasos) => {
    const r = JSON.parse(await ev(`(function(){
      window.__P.limpiar();
      var den = window.__P.denominador();
      var sets = [];
      ${pasos}
      var f = window.__P.foto();
      var est = window.__P.informe('estandar');
      var con = window.__P.informe('conciso');
      var nar = window.__P.informe('narrativo');
      window.__P.informe('estandar');
      var xls = window.__P.excel();
      return JSON.stringify({ den: den, sets: sets, foto: f,
        estandar: { vt: window.__P.frasesVT(est.inf), suma: window.__P.sumaVT(est.suma),
                    sumaFull: est.suma },
        conciso:  { vt: window.__P.frasesVT(con.inf), suma: window.__P.sumaVT(con.suma) },
        narrativo:{ vt: window.__P.frasesVT(nar.inf), suma: window.__P.sumaVT(nar.suma) },
        xlsCols: (xls && typeof xls === 'object') ? Object.keys(xls).length : xls,
        xlsET: (xls && typeof xls === 'object') ? xls['ET grado'] : null,
        xlsVT: (xls && typeof xls === 'object') ? xls['VT morfología'] : null });
    })()`));
    escenas.push({ nombre, ...r });
    return r;
  };

  /* ══ 1) LA TABLA DE TEXTOS — 15 escenas ════════════════════════════════════════════════════
     Una por rama del ensamblado. Cada una tiene que producir una frase DISTINTA de las otras
     catorce: eso es el denominador de esta tabla y se verifica al final (textosDistintos). */

  // S01 — formulario en blanco: la frase de normalidad de A4.
  await escena('S01-nada', ``);

  // S02 — pastilla de insuficiencia sola, sin grado y sin Vmax.
  await escena('S02-it-pastilla', `
    if (window.__P.pill('tricuspide','insuf') !== true) toggleValvPill('tricuspide','insuf');`);

  // S03 — grado de IT leve, sin Vmax: la insuficiencia sin presiones.
  await escena('S03-it-leve', `
    sets.push(window.__P.set('it_grado','1'));`);

  /* S04 — IT severa + Vmax 3,0 m/s SIN VCI: publica el gradiente y se detiene. Es la escena que
     prueba que la frase negativa «PSAP no calculable sin medición de VCI» ya no se emite. */
  await escena('S04-it-sev-grad', `
    sets.push(window.__P.set('it_grado','4'));
    sets.push(window.__P.set('it_vmax_cw', window.__P.cwIT(3.0)));`);

  /* S05 — IT severa + Vmax 3,0 + VCI 25 mm con colapso <50 % (PmAD 15): gradiente 36 y PSAP 51. */
  await escena('S05-it-sev-psap', `
    sets.push(window.__P.set('it_grado','4'));
    sets.push(window.__P.set('it_vmax_cw', window.__P.cwIT(3.0)));
    sets.push(window.__P.set('vci_diam', 25));
    sets.push(window.__P.set('vci_col', '<50'));
    sets.push({ pmad: window.__P.val('pmad'), psap: window.__P.val('psap_calc') });`);

  /* S06 — Vmax sola, sin grado: `hayIT` por el dato, grado 0, sin la palabra de grado. */
  await escena('S06-it-sin-grado', `
    sets.push(window.__P.set('it_vmax_cw', window.__P.cwIT(2.5)));
    sets.push(window.__P.set('vci_diam', 18));
    sets.push(window.__P.set('vci_col', '>50'));`);

  // S07 — ET significativa por GRADIENTE (8 mmHg), sin insuficiencia.
  await escena('S07-et-gmedio', `
    sets.push(window.__P.set('et_gmedio', 8));`);

  // S08 — ET significativa por THP (200 ms).
  await escena('S08-et-thp', `
    sets.push(window.__P.set('et_thp', 200));`);

  /* S09 — ET significativa por AREA. Los dos insumos del numerador viven en la pestania VD.
     PI*(26/20)^2 * 14 / 90 = 0,83 cm2. Los tres insumos DENTRO de banda. */
  await escena('S09-et-area', `
    sets.push(window.__P.set('et_vti_diast', 90));
    sets.push(window.__P.set('tsvd_diametro', 26));
    sets.push(window.__P.set('vti_tsvd', 14));
    sets.push({ avt: window.__P.val('et_avt') });`);

  /* S10 — «No significativa» elegida a mano sobre un calculo que TAMBIEN da No significativa:
     no hay discrepancia, y el parentesis queda vacio porque ningun criterio se cumple. */
  await escena('S10-et-nosignif', `
    sets.push(window.__P.set('et_gmedio', 3));
    valvSev.aplicar('esten','tricuspide','No significativa');`);

  /* S11 — DISCREPANCIA: el calculo da No significativa y el medico elige Significativa, con su
     motivo. El parentesis tiene que ser la NOTA y no los parametros. */
  await escena('S11-et-discrepa', `
    sets.push(window.__P.set('et_gmedio', 3));
    valvSev.aplicar('esten','tricuspide','Significativa');
    sets.push(window.__P.set('et_fund_nota', 'valvula rigida por carcinoide'));`);

  /* S12 — LA ESCENA 12 DEL PEDIDO: gradiente 8 (el boton se prende solo) y el medico lo APAGA a
     mano. `valvApagarGrado` devuelve el grado al centinela, asi que la estenosis sale del informe
     por el GRADO y no por el boton. */
  await escena('S12-et-apagado', `
    sets.push(window.__P.set('et_gmedio', 8));
    sets.push({ tras_auto: window.__P.pill('tricuspide','esten'),
                grado_auto: window.__P.val('et_grado') });
    try { toggleValvPill('tricuspide','esten'); } catch(e) { sets.push({ err: e.message }); }
    sets.push({ tras_clic: window.__P.pill('tricuspide','esten'),
                grado_clic: window.__P.val('et_grado') });`);

  // S13 — LAS DOS LESIONES: IT severa con presiones y ET significativa.
  await escena('S13-it-y-et', `
    sets.push(window.__P.set('it_grado','4'));
    sets.push(window.__P.set('it_vmax_cw', window.__P.cwIT(3.0)));
    sets.push(window.__P.set('vci_diam', 25));
    sets.push(window.__P.set('vci_col', '<50'));
    sets.push(window.__P.set('et_gmedio', 8));`);

  /* S14 — VALOR FUERA DE BANDA: gradiente medio 60 mmHg (banda 0-40). El aviso de rango no
     depende de los cortes y es lo unico que sobrevive de la rama de negacion que A3 elimino. */
  await escena('S14-et-fuera', `
    sets.push(window.__P.set('et_gmedio', 60));`);

  /* S15 — ELEMENTOS INDIRECTOS DE HTP sin PSAP estimable: TAP 90 ms, sin Vmax. Es la frase que
     sube al EN SUMA solo cuando no hay PSAP. */
  await escena('S15-htp-indirecto', `
    sets.push(window.__P.set('tvia', 90));`);

  /* ══ 2) LA MATRIZ DE MORFOLOGIAS ═══════════════════════════════════════════════════════════
     Las cinco etiologicas que A1.1 nombra, mas Mixomatosa y Reumatica como CONTROL (esas dos
     quedan con la forma unificada: su `de` no empieza con «con», asi que no hay doble «con»).
     Dos columnas por morfologia: IT severa con presiones, y ET significativa sin insuficiencia. */
  const MORFS = ['Carcinoide', 'Endocarditis', 'Prótesis biológica', 'Prótesis mecánica',
                 'Funcional / dilatación VD', 'Mixomatosa', 'Reumática', 'Normal'];
  for (const m of MORFS) {
    await escena(`M-it-${m}`, `
      sets.push(window.__P.set('vt_morf', ${JSON.stringify(m)}));
      sets.push(window.__P.set('it_grado','4'));
      sets.push(window.__P.set('it_vmax_cw', window.__P.cwIT(3.0)));
      sets.push(window.__P.set('vci_diam', 25));
      sets.push(window.__P.set('vci_col', '<50'));`);
    await escena(`M-et-${m}`, `
      sets.push(window.__P.set('vt_morf', ${JSON.stringify(m)}));
      sets.push(window.__P.set('et_gmedio', 8));`);
  }

  /* ══ 3) LAS CINCO RUTAS DE RESTAURACION (A1.5) ══════════════════════════════════════════════
     (a) estudio guardado con et_grado Significativa y el boton apagado, reabierto e impreso
     (b) lo mismo con No significativa
     (c) planilla importada con Significativa
     (d) la escena 12 y el MISMO estudio guardado y reimpreso
     (e) grado vacio (centinela) y boton apagado
     La reposicion es IDENTICA a la de editarInforme: asignacion directa, SIN eventos, y el boton
     se deja APAGADO a proposito, que es como vuelve en las tres rutas. */
  const rutas = JSON.parse(await ev(`(function(){
    var out = {};
    var reabrir = function(campos) {
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
      return { migrado: c.et_grado, leido: window.__P.val('et_grado'),
               selIdx: (function(){ var e=document.getElementById('et_grado');
                 return e ? e.selectedIndex : null })(),
               pill: window.__P.pill('tricuspide','esten'),
               vt: window.__P.frasesVT(r.inf), suma: window.__P.sumaVT(r.suma) };
    };
    out.a_guardado_signif   = reabrir({ et_grado:'Significativa',    et_gmedio:'8', nombre:'G1' });
    out.b_guardado_nosignif = reabrir({ et_grado:'No significativa', et_gmedio:'3', nombre:'G2' });
    out.c_importado_signif  = reabrir({ et_grado:'Significativa',    et_gmedio:'8', nombre:'I1' });
    /* (d) LA ESCENA 12 EN VIVO y despues el mismo estudio guardado y reimpreso. El estudio se
       arma con el estado que la escena 12 DEJA, que es el centinela: eso es lo que se guardaria. */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_gmedio', 8);
    var gAuto = window.__P.val('et_grado');
    try { toggleValvPill('tricuspide','esten'); } catch(e) {}
    var rViva = window.__P.informe('estandar');
    out.d_escena12_viva = { grado_auto: gAuto, grado_tras_clic: window.__P.val('et_grado'),
      pill: window.__P.pill('tricuspide','esten'),
      vt: window.__P.frasesVT(rViva.inf), suma: window.__P.sumaVT(rViva.suma) };
    out.d_escena12_reimpresa = reabrir({ et_grado: window.__P.val('et_grado') || 'sin',
      et_gmedio:'8', nombre:'G3' });
    out.e_vacio_apagado = reabrir({ et_grado:'sin', nombre:'G4' });
    /* El LEGADO de fabrica: «Sin estenosis», que lo trae cada backup anterior. */
    out.f_legado_fabrica = reabrir({ et_grado:'Sin estenosis', nombre:'G5' });
    return JSON.stringify(out);
  })()`));

  /* ══ 3 bis) LAS ESCENAS QUE AFIRMAN LOS CASOS DE LA SUITE ════════════════════════════════════
     Mismas entradas que TC-49, TC-50, TC-137 y TC-141, para leer el texto EXACTO que esos casos
     tienen que afirmar sin tener que deducirlo de un truncado del reporte de la suite. */
  const casos = JSON.parse(await ev(`(function(){
    var out = {};
    var corre = function(pasos) {
      window.__P.limpiar(); window.__P.denominador();
      pasos();
      var r = window.__P.informe('estandar');
      return { vt: window.__P.frasesVT(r.inf), suma: r.suma };
    };
    out.tc49 = corre(function(){ window.__P.set('tvia','90'); });
    out.tc50 = corre(function(){ window.__P.set('it_vc','9');
      window.__P.set('vci_diam','23'); window.__P.set('vci_col','<50');
      window.__P.set('vmax_it','3.5'); });
    /* TC-137 i6: gradiente 6 y el grado FORZADO al centinela despues (estudio legado o protesis).
       La asignacion directa, sin eventos, es la del propio caso. */
    out.tc137_i6 = corre(function(){ window.__P.set('vd_bas','38');
      window.__P.set('et_gmedio','6');
      document.getElementById('et_grado').value = 'sin'; });
    out.tc137_i8 = corre(function(){ window.__P.set('vd_bas','38');
      window.__P.set('et_gmedio','8');
      valvSev.aplicar('esten','tricuspide','No significativa'); });
    out.tc141_tres = corre(function(){ window.__P.set('vd_bas','38');
      window.__P.set('et_gmedio','6'); window.__P.set('et_thp','200');
      window.__P.set('tsvd_diametro','25'); window.__P.set('vti_tsvd','12');
      window.__P.set('et_vti_diast','60'); });
    out.tc141_sincrit = corre(function(){ window.__P.set('vd_bas','38');
      window.__P.set('et_gmedio','3'); window.__P.set('et_thp','180'); });
    out.tc141_fuera = corre(function(){ window.__P.set('vd_bas','38');
      window.__P.set('et_thp','4000'); });
    out.tc138_vtnorm = corre(function(){ window.__P.set('vd_bas','38'); });
    out.tc138_vtcarc = corre(function(){ window.__P.set('vd_bas','38');
      window.__P.set('vt_morf','Carcinoide'); });
    out.tc138_vtfunc = corre(function(){ window.__P.set('vd_bas','38');
      window.__P.set('vt_morf','Funcional / dilatación VD'); });
    return JSON.stringify(out);
  })()`));

  /* ══ 4) CONTROL NEGATIVO: mitral y aortica, CON denominador ══════════════════════════════════ */
  const otras = JSON.parse(await ev(`(function(){
    var out = {};
    window.__P.limpiar(); window.__P.denominador();
    out.base = window.__P.baseOtras();
    window.__P.set('it_grado','4');
    window.__P.set('it_vmax_cw', window.__P.cwIT(3.0));
    window.__P.set('vt_morf','Carcinoide');
    window.__P.set('et_gmedio', 8);
    ['estandar','conciso','narrativo'].forEach(function(est){
      var r = window.__P.informe(est);
      out[est] = { otras: window.__P.frasesOtras(r.inf), vt: window.__P.frasesVT(r.inf),
                   suma: r.suma };
    });
    var xls = window.__P.excel();
    out.xlsCols = (xls && typeof xls === 'object') ? Object.keys(xls).length : xls;
    return JSON.stringify(out);
  })()`));

  const despues = await md5(join(RAIZ, 'index.html'));

  /* El DENOMINADOR de la tabla de textos. Sin esto, una tabla de quince filas iguales se leeria
     como cobertura.
     ⚠️ SON 14 TEXTOS DISTINTOS EN 15 ESCENAS, Y EL EMPATE ES EL RESULTADO QUE SE BUSCA: S12 (el
     medico apaga el boton con el gradiente en 8) tiene que dar EXACTAMENTE la frase de S01 (el
     formulario en blanco), porque apagar saca la estenosis del informe. Se afirma el empate por
     separado en vez de bajar el umbral a 14: un 14 pelado tambien lo cumpliria un empate entre dos
     escenas que deberian diferir. */
  const porNombre = {};
  escenas.filter((e) => /^S\d\d/.test(e.nombre))
    .forEach((e) => { porNombre[e.nombre.slice(0, 3)] = (e.estandar.vt || []).join(' ¶ '); });
  const sFrases = Object.values(porNombre);
  const textosDistintos = new Set(sFrases).size;
  const empateEsperado = porNombre.S01 === porNombre.S12;

  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues,
    listo, consolaAlCargar, consolaTotal: cdp.errores.slice(),
    sinErroresDeConsola: cdp.errores.length === 0,
    denominadorTabla: { escenasS: sFrases.length, textosDistintos, empateEsperado,
      ok: sFrases.length === 15 && textosDistintos === 14 && empateEsperado },
    escenas, rutas, casos, otras,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
