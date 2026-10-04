#!/usr/bin/env node
/**
 * _probe_pulmo.mjs — sonda de SOLO LECTURA para la válvula PULMONAR (P1, P3, P5, P6).
 *
 * Mide el comportamiento VIGENTE antes de tocar nada: el prompt de esta tanda afirma tres cosas
 * («la velocidad no prende Estenosis», «la velocidad de IP no prende Insuficiencia», «hay que
 * sacar la frase de la PmAD») que E5/E5b-0/E5b-4 podrían haber implementado ya. No muta
 * index.html — comprueba su md5 al principio y al final.
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/auditoria_botones.mjs.
 *
 * Uso:  node scripts/_probe_pulmo.mjs [--ver] [--file <html>] > /tmp/pulmo.json
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const arg  = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const FILE = arg('--file') || 'index.html';

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
        const p = join(RAIZ, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || FILE);
        if (!p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
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
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(valv, tipo) { try { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  /* Denominador: pestania Valvulas + los cuatro acordeones + el bloque Doppler Pulmonar.
     Sin esto los campos no tienen geometria y todo mide cero (la leccion de la sonda anterior). */
  denominador() {
    try { showTab('valvulas'); } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    var pm = document.getElementById('vp-pane-morf');
    if (pm) pm.style.display = '';
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    var acord = {};
    toks.forEach(function(tok){ acord[tok.replace('valv-','')] = vis('ete-seccion-' + tok); });
    var ab = Object.keys(acord).filter(function(k){ return acord[k] }).length;
    var tab = vis('tab-valvulas');
    return { tab: tab, secciones: ab, acordeones: acord,
             morf: vis('vp-pane-morf'), ok: tab && ab === 4 && vis('vp-pane-morf') } },

  /* Nuevo estudio de verdad + reseteo de la memoria de proceso y de las claves de localStorage
     de las pastillas, que no viajan con el estudio y contaminan la escena siguiente. */
  limpiar() {
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {}; window._iaGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v); } catch(e){}
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t); } catch(e){}
      });
    });
    return 1 },

  /* Escribir un campo: se asigna el valor y se emiten los MISMOS eventos que produce el
     navegador tras una pulsacion (input y change, los dos con bubbles). Lectura de vuelta
     obligatoria: si el campo no quedo con el valor pedido, la escena lo dice en vez de
     reportar «el calculo no gradua» (la trampa numero 1 de la sonda anterior). */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.focus();
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { leido: e.value, ok: String(e.value) === String(valor) } },

  /* La fila del Excel del Laboratorio, por el MISMO emisor que usa la exportacion real
     (_labExcelRow). No genera el .xlsx —eso abre una descarga y «Excel y reimportacion solo con
     orden expresa»—: lo que se compara son las 434 columnas que el emisor produce. Copiado de
     scripts/_ab_e5.mjs para que el A/B de esta tanda mida la misma superficie que el de E5. */
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

  /* Solo las frases de la PULMONAR, que es lo unico de esta tanda. Se parte por oracion y se
     filtra por la familia de palabras de la valvula pulmonar: nombre largo, sigla del conciso
     (VP) y las siglas del EN SUMA (EP, IP). */
  frasesVP(texto) {
    var t = String(texto || '');
    var ors = t.split(/(?<=\\.)\\s+/);
    var re = /pulmonar|\\bVP\\b|\\bEP\\b|\\bIP\\b|PmAP|PdAP|PSAP/i;
    return ors.map(function(s){ return s.trim() }).filter(function(s){ return s && re.test(s) }) },

  /* Foto de la pulmonar: las dos pastillas, los dos grados, el badge, el aviso rojo y el cajon. */
  foto() {
    return {
      pillEsten: window.__P.pill('pulmonar','esten'),
      pillInsuf: window.__P.pill('pulmonar','insuf'),
      ep_grado:  window.__P.val('ep_grado'),
      ip_grado:  window.__P.val('ip_grado'),
      sevbtnEsten: window.__P.txt('sevbtn-esten-pulmonar'),
      sevbtnInsuf: window.__P.txt('sevbtn-insuf-pulmonar'),
      badge:     window.__P.txt('vp-sev-badge'),
      aviso:     window.__P.txt('ep-manual-aviso'),
      avisoVis:  window.__P.vis('ep-manual-aviso'),
      fundVis:   window.__P.vis('ep-fund'),
      nota:      window.__P.val('ep_fund_nota'),
      bloqEsten: window.__P.vis('bloque-esten-pulmonar'),
      bloqInsuf: window.__P.vis('bloque-insuf-pulmonar'),
      epDetalle: window.__P.vis('bloque-ep-detalle'),
      ipDetalle: window.__P.vis('bloque-ip-detalle'),
      papm:      window.__P.txt('ip-papm-row'),
      papd:      window.__P.txt('ip-papd-row'),
      vmaxEP:    window.__P.val('vp_vmax'),
      gmaxEP:    window.__P.val('vp_gmax'),
      ipVmax:    window.__P.val('ip_vmax'),
      ipVtd:     window.__P.val('ip_vtd'),
      pmad:      window.__P.val('pmad')
    } },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleEteSeccion','showTab','limpiarCampos',
                  'calcVP','calcIP','vpSync','epGradoManual','ipGradoManual',
                  'valvAutoPrenderEsten','valvAutoApagarEsten','setEstiloInforme']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('ep_grado')) return { listo:false, por:'sin ep_grado' };
    return { listo:true } }
};
'OK';
`;

/* ══ Escenas ══════════════════════════════════════════════════════════════════════════════════ */
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

  // Calentamiento explícito: la app define funciones tarde y una sonda apurada mide una app a medio armar.
  for (let i = 0; i < 60; i++) {
    try { await ev(SONDA); const l = await ev('JSON.stringify(window.__P.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = JSON.parse(await ev('JSON.stringify(window.__P.listo())'));

  const escenas = [];
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
        estandar: { vp: window.__P.frasesVP(est.inf), suma: est.suma, inf: est.inf },
        conciso:  { vp: window.__P.frasesVP(con.inf), suma: con.suma, inf: con.inf },
        narrativo:{ vp: window.__P.frasesVP(nar.inf), suma: nar.suma, inf: nar.inf },
        xls: xls });
    })()`));
    escenas.push({ nombre, ...r });
    return r;
  };

  // ── P1 — la velocidad de EP y el botón Estenosis ─────────────────────────────────────────
  await escena('P1-vmax4', `sets.push(window.__P.set('vp_vmax', 4));`);
  await escena('P1-vmax4-luego-14', `sets.push(window.__P.set('vp_vmax', 4));
    sets.push({ foto4: window.__P.foto() });
    sets.push(window.__P.set('vp_vmax', 1.4));`);
  await escena('P1-vmax45', `sets.push(window.__P.set('vp_vmax', 4.5));`);
  await escena('P1-gmax64-directo', `sets.push(window.__P.set('vp_gmax', 64));`);
  // control negativo: velocidad normal de entrada, no debe prender nada
  await escena('P1-NEG-vmax14', `sets.push(window.__P.set('vp_vmax', 1.4));`);
  // el botón tocado a mano antes del dato: la compuerta de localStorage
  await escena('P1-apagado-a-mano-antes', `
    toggleValvPill('pulmonar','esten'); toggleValvPill('pulmonar','esten');
    sets.push({ lsEsten: localStorage.getItem('valv-pill-esten-pulmonar') });
    sets.push(window.__P.set('vp_vmax', 4));`);

  /* ── LA FUGA DE `localStorage` ENTRE PACIENTES ───────────────────────────────────────────
     `limpiarCampos` borra las claves `valv-pill-*` de mitral/aortica/tricuspide y NO las de la
     pulmonar (index.html:33530), pero `cargarValvPills` SÍ restaura la pulmonar (51390). Estas
     escenas NO usan `window.__P.limpiar()` (que borra las claves a mano): usan el «Nuevo
     estudio» REAL, que es el gesto del médico. */
  const escenaFuga = async (nombre, pasos) => {
    const r = JSON.parse(await ev(`(function(){
      var sets = [];
      ${pasos}
      var f = window.__P.foto();
      var est = window.__P.informe('estandar');
      var xls = window.__P.excel();
      return JSON.stringify({ den: window.__P.denominador(), sets: sets, foto: f,
        estandar: { vp: window.__P.frasesVP(est.inf), suma: est.suma, inf: est.inf },
        conciso: { vp: [] }, narrativo: { vp: [] }, xls: xls });
    })()`));
    escenas.push({ nombre, ...r });
    return r;
  };
  // (a) la clave en '0' sobrevive a «Nuevo estudio» → el auto-prendido queda muerto para siempre
  await escenaFuga('FUGA-a-cero-sobrevive', `
    window.__P.limpiar();
    toggleValvPill('pulmonar','esten'); toggleValvPill('pulmonar','esten');
    limpiarCampos(true);
    sets.push({ trasNuevoEstudio: {
      pulmonar_esten: localStorage.getItem('valv-pill-esten-pulmonar'),
      pulmonar_insuf: localStorage.getItem('valv-pill-insuf-pulmonar'),
      mitral_esten:   localStorage.getItem('valv-pill-esten-mitral'),
      aortica_esten:  localStorage.getItem('valv-pill-esten-aortica'),
      tricusp_esten:  localStorage.getItem('valv-pill-esten-tricuspide') } });
    window.__P.denominador();
    sets.push(window.__P.set('vp_vmax', 4));`);
  // control: la MITRAL en el mismo camino sí vuelve a auto-prenderse (la clave se borró)
  await escenaFuga('FUGA-a-NEG-mitral', `
    window.__P.limpiar();
    toggleValvPill('mitral','esten'); toggleValvPill('mitral','esten');
    limpiarCampos(true);
    sets.push({ mitral_esten: localStorage.getItem('valv-pill-esten-mitral') });
    window.__P.denominador();
    sets.push(window.__P.set('avm_plan', 1.2));
    sets.push({ pillMitralEsten: window.__P.pill('mitral','esten'),
                em_grado: window.__P.val('em_grado') });`);
  // (b) la clave en '1' sobrevive y `cargarValvPills` la repone sobre un estudio VACÍO
  await escenaFuga('FUGA-b-uno-sobrevive', `
    window.__P.limpiar();
    window.__P.denominador();
    sets.push(window.__P.set('vp_vmax', 4.5));
    sets.push({ lsTrasDato: localStorage.getItem('valv-pill-esten-pulmonar') });
    toggleValvPill('pulmonar','insuf');
    limpiarCampos(true);
    sets.push({ trasNuevoEstudio: {
      pulmonar_esten: localStorage.getItem('valv-pill-esten-pulmonar'),
      pulmonar_insuf: localStorage.getItem('valv-pill-insuf-pulmonar') } });
    cargarValvPills();
    window.__P.denominador();`);

  // ── P3 — la velocidad de IP y el botón Insuficiencia ─────────────────────────────────────
  await escena('P3-ipvmax3', `sets.push(window.__P.set('ip_vmax', 3));`);
  await escena('P3-NEG-sin-ipvmax', `sets.push({ nada: 1 });`);

  // ── P5 — los siete formatos de la oración ────────────────────────────────────────────────
  await escena('P5-a-solo-IP-sin-grado', `toggleValvPill('pulmonar','insuf');`);
  await escena('P5-b-solo-IP-con-grado', `toggleValvPill('pulmonar','insuf');
    sets.push(window.__P.set('ip_grado', 'Leve'));`);
  await escena('P5-c-IP-con-presiones', `
    sets.push(window.__P.set('pmad', 5));
    sets.push(window.__P.set('ip_vmax', 3));
    sets.push(window.__P.set('ip_vtd', 2));
    sets.push(window.__P.set('ip_grado', 'Leve'));`);
  await escena('P5-c2-IP-presiones-sin-grado', `
    sets.push(window.__P.set('pmad', 5));
    sets.push(window.__P.set('ip_vmax', 3));
    sets.push(window.__P.set('ip_vtd', 2));`);
  await escena('P5-c3-IP-solo-PmAP', `
    sets.push(window.__P.set('pmad', 5));
    sets.push(window.__P.set('ip_vmax', 3));
    sets.push(window.__P.set('ip_grado', 'Leve'));`);
  await escena('P5-d-solo-estenosis', `sets.push(window.__P.set('vp_vmax', 4));`);
  await escena('P5-e-IP-mas-estenosis', `
    sets.push(window.__P.set('pmad', 5));
    sets.push(window.__P.set('ip_vmax', 3));
    sets.push(window.__P.set('ip_grado', 'Leve'));
    sets.push(window.__P.set('vp_vmax', 4));`);
  await escena('P5-f-ajuste-manual-con-nota', `
    sets.push(window.__P.set('vp_vmax', 4));
    sets.push(window.__P.set('ep_grado', 'Severa'));
    sets.push(window.__P.set('ep_fund_nota', 'ventana suboptima'));`);
  await escena('P5-g-ajuste-manual-sin-nota', `
    sets.push(window.__P.set('vp_vmax', 4));
    sets.push(window.__P.set('ep_grado', 'Severa'));`);
  // ── P5bis — la MORFOLOGÍA abre la oración (respuesta de Maicol al hueco de P5) ───────────
  await escena('P5h-morf-anormal-esten', `
    sets.push(window.__P.set('vp_morf', 'Carcinoide'));
    sets.push(window.__P.set('vp_vmax', 4.5));`);
  await escena('P5i-morf-anormal-IP-esten', `
    sets.push(window.__P.set('vp_morf', 'Carcinoide'));
    sets.push(window.__P.set('pmad', 5));
    sets.push(window.__P.set('ip_vmax', 3));
    sets.push(window.__P.set('ip_grado', 'Leve'));
    sets.push(window.__P.set('vp_vmax', 4.5));`);
  /* ⚠️ SIN `toggleValvPill` DESPUÉS DE PONER EL GRADO: `ipGradoManual` ya prende la pastilla, así
     que el clic extra la APAGABA y la escena medía «la IP no sale en el informe» sobre una IP que
     el propio arnés había cerrado. Daba un falso defecto con la forma exacta del bug que P6 teme
     (informe sin la IP y EN SUMA «sin alteraciones»). El gesto de poner el grado alcanza. */
  await escena('P5j-morf-noespec-IP', `
    sets.push(window.__P.set('vp_morf', 'No especificada'));
    sets.push(window.__P.set('ip_grado', 'Leve'));`);
  await escena('P5k-morf-noespec-esten', `
    sets.push(window.__P.set('vp_morf', 'No especificada'));
    sets.push(window.__P.set('vp_vmax', 4));`);
  // prótesis: ORDEN EXPRESA de no tocarla — tiene que salir idéntica a HEAD
  await escena('P5l-protesis-esten', `
    sets.push(window.__P.set('vp_morf', 'Prótesis mecánica'));
    sets.push(window.__P.set('vp_vmax', 4.5));`);
  await escena('P5m-protesis-IP', `
    sets.push(window.__P.set('vp_morf', 'Prótesis mecánica'));
    sets.push(window.__P.set('pmad', 5));
    sets.push(window.__P.set('ip_vmax', 3));
    sets.push(window.__P.set('ip_grado', 'Leve'));`);
  // controles negativos de la rama nueva: sin lesión no debe entrar
  await escena('P5n-NEG-morf-anormal-sin-lesion', `
    sets.push(window.__P.set('vp_morf', 'Carcinoide'));`);
  await escena('P5o-NEG-todo-normal', `sets.push({ nada: 1 });`);
  await escena('P5p-NEG-vmax-normal-sin-grado', `sets.push(window.__P.set('vp_vmax', 1.4));`);
  await escena('P5q-nivel-y-etiologia', `
    sets.push(window.__P.set('vp_vmax', 4));
    sets.push(window.__P.set('ep_nivel', 'Subvalvular (infundibular)'));
    sets.push(window.__P.set('ep_etiologia', 'Carcinoide'));
    sets.push(window.__P.set('ip_grado', 'Leve'));
    sets.push(window.__P.set('ip_etiologia', 'HTP (dilatación anular)'));`);

  // ── P6 — EN SUMA de los tres estados que el prompt nombra ────────────────────────────────
  await escena('P6-EP-severa', `sets.push(window.__P.set('vp_vmax', 4.5));`);
  await escena('P6-EP-moderada', `sets.push(window.__P.set('vp_vmax', 4));`);
  await escena('P6-IP-presente', `sets.push(window.__P.set('ip_vmax', 3));`);

  /* ══ ESTUDIOS GUARDADOS — NO SE MIGRAN NI SE REESCRIBEN ═══════════════════════════════════
     Dos escenas, las dos por las funciones REALES que invocan los botones:
       · GUARDADO-nuevo: se carga pulmonar, se guarda, «Nuevo estudio», se reabre. Tiene que
         volver con el mismo botón, el mismo grado y el mismo informe que en HEAD.
       · GUARDADO-legado: un blob con el `vp_morf` VIEJO («Estenosis moderada»), de cuando el
         campo mezclaba morfología con severidad. Lo traduce `_migrarCamposLegacy` al abrir, y
         el A/B contra HEAD prueba que esta tanda no cambió lo que ese estudio muestra. */
  const escenaGuardado = async (nombre, pasos) => {
    const r = JSON.parse(await ev(`(async function(){
      var sets = [];
      ${pasos}
      var f = window.__P.foto();
      var est = window.__P.informe('estandar');
      var xls = window.__P.excel();
      return JSON.stringify({ den: window.__P.denominador(), sets: sets, foto: f,
        estandar: { vp: window.__P.frasesVP(est.inf), suma: est.suma, inf: est.inf },
        conciso: { vp: [] }, narrativo: { vp: [] }, xls: xls });
    })()`));
    escenas.push({ nombre, ...r });
    return r;
  };
  await escenaGuardado('GUARDADO-nuevo', `
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('nombre', 'Prueba Pulmo');
    window.__P.set('vp_vmax', 4.5);
    window.__P.set('pmad', 5);
    window.__P.set('ip_vmax', 3);
    window.__P.set('ip_grado', 'Leve');
    /* ⚠️ DOS TRAMPAS SEGUIDAS, LAS DOS MEDIDAS Y NO DEDUCIDAS.
       1) guardarInforme tiene un "if (!valvSevConfirmada)" que abre la TARJETA de severidades,
          devuelve false y deja el guardado real para el callback de la tarjeta. Una promesa que
          espera ese callback no resuelve nunca y, con awaitPromise, la llamada de CDP tampoco:
          30 minutos colgada y siete Chrome zombies (la trampa del CLAUDE.md).
       2) "window.valvSevConfirmada = true" NO sirve: la variable es un "let" de nivel superior
          (index.html:36116), o sea un binding LEXICO, y asignarle a window crea otra propiedad
          que el gate no lee. Primer intento: el guardado devolvio false y la escena comparo un
          estudio VACIO contra otro vacio, informando "igual a HEAD" sobre un denominador cero.
       Lo que se hace es el GESTO real: dejar que la tarjeta se abra y clickear su "✓ Confirmar"
       (#rev-confirm), que es quien pone la marca y vuelve a llamar a guardarInforme. Con timeout,
       porque una sonda que puede colgarse para siempre no es una sonda. */
    var id = await new Promise(function(res){
      var listo = false;
      var fin = function(v){ if (!listo) { listo = true; res(v) } };
      setTimeout(function(){ fin('TIMEOUT sin callback') }, 6000);
      try { guardarInforme(function(){ fin('ok') }); } catch(e) { fin('EXC ' + e.message) }
      /* La tarjeta se dibuja sincronicamente dentro de guardarInforme, asi que ya esta en el DOM. */
      var btn = document.getElementById('rev-confirm');
      if (btn) { sets.push({ tarjeta: 'abierta, se confirma' }); btn.click(); }
      else { sets.push({ tarjeta: 'NO aparecio' }); }
    });
    sets.push({ guardado: id });
    /* ⚠️ SE LEE POR getInformes(), NO POR localStorage. CeiboStore guarda por CHUNKS
       ("ett_informes_chunk_N") y mantiene una cache en memoria, asi que el array crudo de
       "ett_informes" puede estar vacio con el estudio ya guardado: el primer intento leyo cero
       y la escena se declaro vacua. getInformes() es el lector que usa la app. */
    var lista = [];
    try { lista = getInformes(); } catch(e) { sets.push({ leerErr: e.message }) }
    var ult = lista.length ? lista[lista.length - 1] : null;
    /* ⚠️ SE ABRE POR estudioId, NO POR id. cargarEstudioPorId hace
       "getInformes().find(i => i.estudioId === id)": pasandole el "id" no encuentra nada, llama a
       _eeEstudioNoDisponible() y vuelve en silencio. El intento anterior hizo exactamente eso y la
       escena comparo la pantalla VACIA de los dos lados informando "igual a HEAD". */
    sets.push({ n: lista.length, idUlt: ult && ult.id, estudioId: ult && ult.estudioId });
    limpiarCampos(true);
    if (ult) { try { cargarEstudioPorId(ult.estudioId); } catch(e) { sets.push({ cargaErr: e.message }) } }
    window.__P.denominador();`);
  await escenaGuardado('GUARDADO-legado', `
    window.__P.limpiar(); window.__P.denominador();
    /* Blob con el contrato VIEJO: vp_morf graduaba. Se inyecta en el store y se abre por la
       funcion real, para que pase por _migrarCamposLegacy igual que un estudio de 2026-08. */
    var legado = { id: 'legado-pulmo-1', estudioId: 'legado-pulmo-1', nombre: 'Legado Pulmo', ci: '9', fecha_estudio: '2026-08-01',
      campos: { vp_morf: 'Estenosis moderada', vp_vmax: '3.5', ip_grado: '', nombre: 'Legado Pulmo' } };
    /* Se escribe por la API del store (guardarInformesSeguro -> CeiboStore.setLocal) y no
       pisando localStorage: la cache en memoria se arma al arrancar, asi que un blob inyectado
       por detras no lo ve nadie y cargarEstudioPorId no lo encuentra. */
    try {
      var l = getInformes().concat([legado]);
      await guardarInformesSeguro(l);   // setLocal puede devolver promesa: sin await el store no lo tiene aun
      sets.push({ enStore: getInformes().filter(function(x){ return x.id === 'legado-pulmo-1' }).length });
    } catch(e) { sets.push({ storeErr: e.message }) }
    limpiarCampos(true);
    try { cargarEstudioPorId('legado-pulmo-1'); } catch(e) { sets.push({ cargaErr: e.message }) }
    window.__P.denominador();`);

  /* ══ P4 — MAQUETACIÓN MEDIDA, NO MIRADA ═══════════════════════════════════════════════════
     Tres anchos: 1200 (dos columnas), 390 y 360 (apiladas). En cada uno se abre la escena con las
     DOS pastillas prendidas —si no, un bloque en display:none no tiene geometría y las dos columnas
     se miden sobre una sola caja, que es el denominador cero de siempre—. Se mide también la escena
     con UNA sola pastilla, que es el caso que el auto-placement rompía. */
  const layout = [];
  for (const w of [1200, 390, 360]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 1000, deviceScaleFactor: 1, mobile: w < 768 }, sessionId);
    for (const escena of ['dos-pastillas', 'solo-estenosis', 'solo-insuficiencia']) {
      const r = JSON.parse(await ev(`(function(){
        window.__P.limpiar(); window.__P.denominador();
        if ('${escena}' !== 'solo-estenosis')   toggleValvPill('pulmonar','insuf');
        if ('${escena}' !== 'solo-insuficiencia') toggleValvPill('pulmonar','esten');
        var caja = function(id){ var e = document.getElementById(id); if (!e) return null;
          var r = e.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return { oculto: true };
          return { x: Math.round(r.left), y: Math.round(r.top),
                   w: Math.round(r.width), h: Math.round(r.height) } };
        /* Touch targets: los dos botones y los dos sub-botones ▼, que es lo que exige check_mobile. */
        var toca = {};
        ['pill-insuf-pulmonar','pill-esten-pulmonar','sevbtn-insuf-pulmonar','sevbtn-esten-pulmonar',
         'ep_grado','ip_grado','ep_nivel','ep_etiologia','ip_etiologia'].forEach(function(id){
          var c = caja(id); if (c && !c.oculto) toca[id] = c.w + 'x' + c.h; });
        return JSON.stringify({ insuf: caja('bloque-insuf-pulmonar'), esten: caja('bloque-esten-pulmonar'),
          wrap: caja('vp-lesiones'), toca: toca,
          scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth });
      })()`));
      layout.push({ ancho: w, escena, ...r });
    }
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  const despues = await md5(join(RAIZ, 'index.html'));
  console.log(JSON.stringify({ file: FILE, listo, md5Igual: antes === despues, antes, despues, escenas, layout }, null, 1));

  cdp.close(); proc.kill();
  await new Promise((r) => srv.close(r));
  await rm(perfil, { recursive: true, force: true });
  process.exit(0);   // el server y el event loop vivos dejan zombies que cuelgan el próximo A/B
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
