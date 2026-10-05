#!/usr/bin/env node
/**
 * _probe_pulmoauto.mjs — sonda A/B de SOLO LECTURA para la PULMONAR (parte C del 2026-10-05):
 * C1 el auto-prendido de la estenosis que se gasta en un solo uso, C2 el vocabulario de morfologia
 * y lo que hoy dice el EN SUMA, y C3 que pasa al apagar el boton de insuficiencia con Vmax de IP.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-pulmo-'));
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

  
  /* ══ C1 · EL AUTO-PRENDIDO DE LA ESTENOSIS PULMONAR, SE GASTA O NO ═════════════════════════ */
  const c1 = JSON.parse(await ev(`(function(){
    var out = {};
    var foto = function(){
      return { pill: window.__P.pill('pulmonar','esten'),
               grado: window.__P.val('ep_grado'),
               ls: (function(){ try { return localStorage.getItem('valv-pill-esten-pulmonar') }
                      catch(e){ return 'EXC' } })(),
               auto: (function(){ try { return !!(window.VALV_ESTEN_AUTO &&
                      window.VALV_ESTEN_AUTO.has('pulmonar')) } catch(e){ return 'EXC' } })(),
               manual: (function(){ try { return !!(window.esqSevManual && window.esqSevManual.ep) }
                      catch(e){ return 'EXC' } })(),
               linea: (function(){ var r = window.__P.informe('estandar');
                 return { vp: (r.inf||'').split(/\\n/).filter(function(l){
                   return /pulmonar|\\bVP\\b/i.test(l) }).join(' | '), suma: r.suma } })() };
    };
    /* EL VAIVEN: 4 prende -> 1,4 apaga -> 4 otra vez. Es la secuencia del pedido. */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('vp_vmax','4');   out.p1_v4   = foto();
    window.__P.set('vp_vmax','1.4'); out.p2_v14  = foto();
    window.__P.set('vp_vmax','4');   out.p3_v4   = foto();
    window.__P.set('vp_vmax','1.4'); out.p4_v14  = foto();
    window.__P.set('vp_vmax','4');   out.p5_v4   = foto();
    /* APAGADO MANUAL con la velocidad ALTA: tiene que ser DURABLE (el clic del medico no pasa por
       la ruta automatica). Control negativo del arreglo. */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('vp_vmax','4');
    out.m1_tras_auto = foto();
    try { toggleValvPill('pulmonar','esten'); } catch(e) { out.m_err = e.message; }
    out.m2_tras_clic = foto();
    window.__P.set('vp_vmax','4.5');
    out.m3_tras_subir = foto();
    window.__P.set('vp_vmax','4');
    out.m4_vuelve = foto();
    /* CONTROL NEGATIVO de alcance: la MITRAL y la AORTICA no se tocan. Mismo vaiven en la aortica. */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('vmax_ao','4.5'); out.ao1 = { pill: window.__P.pill('aortica','esten'),
      grado: window.__P.val('ea_grado') };
    window.__P.set('vmax_ao','1.5'); out.ao2 = { pill: window.__P.pill('aortica','esten'),
      grado: window.__P.val('ea_grado') };
    window.__P.set('vmax_ao','4.5'); out.ao3 = { pill: window.__P.pill('aortica','esten'),
      grado: window.__P.val('ea_grado') };
    return JSON.stringify(out);
  })()`));

  /* ══ C2 · LA MORFOLOGIA PULMONAR: que dice hoy el informe y el EN SUMA en las 7 opciones ════ */
  const c2 = JSON.parse(await ev(`(function(){
    var OPS = ['Normal','Displásica (congénita)','Reumática','Carcinoide',
               'Prótesis biológica','Prótesis mecánica','No especificada'];
    var out = { vocab: {}, conEP: {}, sinNada: {} };
    OPS.forEach(function(m){
      out.vocab[m] = { de: (typeof valvMorfDe === 'function') ? valvMorfDe(m) : null,
                       adj: (typeof valvMorfAdj === 'function') ? valvMorfAdj(m) : null };
      window.__P.limpiar(); window.__P.denominador();
      window.__P.set('vp_morf', m); window.__P.set('vp_vmax','4');
      var r = window.__P.informe('estandar');
      out.conEP[m] = { vp: (r.inf||'').split(/\\n/).filter(function(l){
        return /pulmonar|\\bVP\\b/i.test(l) }).join(' | '), suma: r.suma };
      window.__P.limpiar(); window.__P.denominador();
      window.__P.set('vp_morf', m);
      var r2 = window.__P.informe('estandar');
      out.sinNada[m] = { vp: (r2.inf||'').split(/\\n/).filter(function(l){
        return /pulmonar|\\bVP\\b/i.test(l) }).join(' | '), suma: r2.suma };
    });
    return JSON.stringify(out);
  })()`));

  /* ══ C3 · SOLO REPORTAR: apagar el boton de INSUFICIENCIA con la Vmax de IP cargada ═════════ */
  const c3 = JSON.parse(await ev(`(function(){
    var out = {};
    var foto = function(){
      var r = window.__P.informe('estandar');
      return { pillInsuf: window.__P.pill('pulmonar','insuf'),
               ip_grado: window.__P.val('ip_grado'),
               ip_vmax: window.__P.val('ip_vmax'),
               papm: window.__P.txt('ip-papm-row'),
               papd: window.__P.txt('ip-papd-row'),
               sevbtnInsuf: window.__P.txt('sevbtn-insuf-pulmonar'),
               bloqInsufVis: window.__P.vis('bloque-insuf-pulmonar'),
               avisoIp: window.__P.txt('ip-manual-aviso'),
               manual: (function(){ try { return JSON.stringify(window.esqSevManual || {}) }
                        catch(e){ return 'EXC' } })(),
               vp: (r.inf||'').split(/\\n/).filter(function(l){
                 return /pulmonar|\\bVP\\b|\\bIP\\b/i.test(l) }).join(' | '),
               suma: r.suma };
    };
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('ip_vmax','3.0');
    window.__P.set('vci_diam','25'); window.__P.set('vci_col','<50');
    out.antes = foto();
    try { if (window.__P.pill('pulmonar','insuf') === true) toggleValvPill('pulmonar','insuf');
          else { toggleValvPill('pulmonar','insuf'); out.nota = 'estaba apagado; se prendio' } }
    catch(e) { out.err = e.message }
    out.despues = foto();
    /* Y con un GRADO cargado ademas de la Vmax. */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('ip_vmax','3.0'); window.__P.set('ip_grado','Leve');
    out.conGrado_antes = foto();
    try { if (window.__P.pill('pulmonar','insuf') === true) toggleValvPill('pulmonar','insuf'); }
    catch(e) {}
    out.conGrado_despues = foto();
    return JSON.stringify(out);
  })()`));

  const despues = await md5(join(RAIZ, 'index.html'));
  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues, listo,
    consolaTotal: cdp.errores.slice(), sinErroresDeConsola: cdp.errores.length === 0,
    c1, c2, c3,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
