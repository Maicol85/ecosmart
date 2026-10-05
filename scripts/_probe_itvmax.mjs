#!/usr/bin/env node
/**
 * _probe_itvmax.mjs — sonda A/B de SOLO LECTURA para la Vmax IT (unidad, sincronizacion, cuentas
 * y aviso de incongruencia). No muta index.html: comprueba su md5 al principio y al final.
 *
 * Se corre DOS veces y se diffean los JSON:
 *   node scripts/_probe_itvmax.mjs --file /tmp/index.HEAD2.html > /tmp/iv.HEAD.json
 *   node scripts/_probe_itvmax.mjs                              > /tmp/iv.NEW.json
 *
 * ⚠️ LOS CASOS SE CARGAN CON LOS MISMOS DATOS FISICOS EN LOS DOS LADOS, NO CON EL MISMO NUMERO.
 * En HEAD la Vmax del jet va en cm/s (300) y con el cambio en m/s (3,0). La sonda lee la UNIDAD
 * declarada por el placeholder del campo y carga el valor que corresponde, asi que lo que se
 * compara es el resultado sobre el mismo paciente y no sobre el mismo tecleo.
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_tricusp.mjs.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-iv-'));
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

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios. Cierra
   la cadena y el archivo deja de parsear con un error que apunta a otra linea. Me paso dos veces
   en la tanda anterior. */
const SONDA = `
window.__V = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  place(id) { var e = document.getElementById(id); return e ? e.placeholder : null },
  step(id) { var e = document.getElementById(id); return e ? e.getAttribute('step') : null },
  lbl(id) { var e = document.getElementById(id);
    var l = e && e.parentNode ? e.parentNode.querySelector('label') : null;
    return l ? l.textContent.trim() : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  /* UNIDAD DECLARADA POR EL PROPIO CAMPO. Es lo que permite que el A/B cargue el mismo PACIENTE
     en los dos lados: en HEAD el placeholder dice cm/s y con el cambio dice m/s. */
  unidadCW() { var e = document.getElementById('it_vmax_cw');
    return e ? String(e.placeholder || '').trim() : null },
  /* Convierte una Vmax en m/s al numero que hay que teclear EN ESTE build. */
  cw(ms) { return this.unidadCW() === 'cm/s' ? ms * 100 : ms },

  denominador() {
    try { showTab('valvulas') } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    var ab = toks.filter(function(t){ return vis('ete-seccion-' + t) }).length;
    return { tab: vis('tab-valvulas'), secciones: ab, ok: vis('tab-valvulas') && ab === 4 } },

  limpiar() {
    try { limpiarCampos(true) } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {}; window._itGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v) } catch(e){}
        try { if (window.__V.pill(v,t) === true) toggleValvPill(v,t) } catch(e){}
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
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-03', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  frasesVT(texto) {
    var t = String(texto || '');
    var ors = t.split(/(?<=\\.)\\s+/);
    var re = /tric[\\u00fau]sp|\\bIT\\b|\\bET\\b|\\bVT\\b|VD-AD/i;
    return ors.map(function(s){ return s.trim() }).filter(function(s){ return s && re.test(s) }) },

  /* Las CUATRO cuentas que el pedido exige identicas, mas el estado del boton y del aviso. */
  foto() {
    return {
      eroa: window.__V.txt('it-eroa'), volr: window.__V.txt('it-volr'),
      sev:  window.__V.txt('it-sev'),  grado: window.__V.val('it_grado'),
      calc: window._itGradoCalc === undefined ? null : window._itGradoCalc,
      psap: window.__V.val('psap_calc'), papMed: window.__V.val('pap_med'),
      gradVDAD: window.__V.val('grad_vdad_display'),
      vmax_it: window.__V.val('vmax_it'), it_vmax_cw: window.__V.val('it_vmax_cw'),
      pillInsuf: window.__V.pill('tricuspide','insuf'),
      aviso: window.__V.txt('it-incongruencia'),
      avisoVis: !!(window.__V.txt('it-incongruencia'))
    } },

  /* El renglon del panel de Evidencia que imprime it_vmax_cw. */
  evidenciaVT() {
    try { var r = (typeof _indVT === 'function') ? _indVT() : null;
      if (!r) return null;
      var f = (r.filas || []).filter(function(x){ return /Vmax del jet/.test(x.lbl || '') });
      return f.length ? f[0] : 'SIN RENGLON';
    } catch(e) { return 'EXC: ' + e.message } },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleEteSeccion','showTab','limpiarCampos',
                  'calcIT_ESC','calcPSAP','setEstiloInforme','_migrarCamposLegacy','editarInforme']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('vmax_it')) return { listo:false, por:'sin vmax_it' };
    if (!document.getElementById('it_vmax_cw')) return { listo:false, por:'sin it_vmax_cw' };
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
    try { await ev(SONDA); const l = await ev('JSON.stringify(window.__V.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = JSON.parse(await ev('JSON.stringify(window.__V.listo())'));

  /* ── P2 · unidad declarada por el campo ─────────────────────────────────────────────────── */
  const unidades = JSON.parse(await ev(`JSON.stringify({
    vmax_it:   { lbl: window.__V.lbl('vmax_it'),   place: window.__V.place('vmax_it'),   step: window.__V.step('vmax_it') },
    it_vmax_cw:{ lbl: window.__V.lbl('it_vmax_cw'),place: window.__V.place('it_vmax_cw'),step: window.__V.step('it_vmax_cw') },
    it_pisa_val:{ lbl: window.__V.lbl('it_pisa_val'), place: window.__V.place('it_pisa_val') }
  })`));

  /* ── P4 · los tres casos, con los MISMOS DATOS FISICOS en los dos lados ──────────────────── */
  const CASOS = [
    { n: 'A  r9 val40 Vmax3.0 vti90 denso',    r: 9, val: 40, ms: 3.0, vti: 90, d: 'denso',    trv: 3.0, pmad: 5 },
    { n: 'B  r5 val35 Vmax2.5 vti60 moderado', r: 5, val: 35, ms: 2.5, vti: 60, d: 'moderado', trv: 2.5, pmad: 8 },
    { n: 'C  r3 val30 Vmax2.0 vti40 debil',    r: 3, val: 30, ms: 2.0, vti: 40, d: 'debil',    trv: 2.0, pmad: 3 },
  ];
  const casos = [];
  for (const c of CASOS) {
    const r = JSON.parse(await ev(`(function(){
      window.__V.limpiar(); var den = window.__V.denominador();
      if (window.__V.pill('tricuspide','insuf') !== true) toggleValvPill('tricuspide','insuf');
      var cw = window.__V.cw(${c.ms});
      var sets = [];
      sets.push(window.__V.set('it_pisa_r', ${c.r}));
      sets.push(window.__V.set('it_pisa_val', ${c.val}));
      sets.push(window.__V.set('it_vmax_cw', cw));
      sets.push(window.__V.set('it_vti', ${c.vti}));
      sets.push(window.__V.set('it_densidad', '${c.d}'));
      sets.push(window.__V.set('vmax_it', ${c.trv}));
      sets.push(window.__V.set('pmad', ${c.pmad}));
      try { calcIT_ESC() } catch(e) {}
      try { calcPSAP() } catch(e) {}
      var est = window.__V.informe('estandar');
      var con = window.__V.informe('conciso');
      var nar = window.__V.informe('narrativo');
      window.__V.informe('estandar');
      return JSON.stringify({ den: den, unidadCW: window.__V.unidadCW(), tecleado: cw,
        sets: sets, foto: window.__V.foto(), campos: window.__V.campos(), xls: window.__V.excel(),
        estandar:{ vt: window.__V.frasesVT(est.inf), suma: est.suma, inf: est.inf },
        conciso: { vt: window.__V.frasesVT(con.inf), suma: con.suma, inf: con.inf },
        narrativo:{ vt: window.__V.frasesVT(nar.inf), suma: nar.suma, inf: nar.inf },
        evidencia: window.__V.evidenciaVT() });
    })()`));
    casos.push({ nombre: c.n, ...r });
  }

  /* ── P3 · sincronizacion en los dos sentidos, borrado, y el boton ───────────────────────── */
  const sync = JSON.parse(await ev(`(function(){
    var out = {};
    var leer = function(){ return { vmax_it: window.__V.val('vmax_it'),
                                    it_vmax_cw: window.__V.val('it_vmax_cw'),
                                    pill: window.__V.pill('tricuspide','insuf') } };
    /* (1) DOPPLER -> VALVULAS, con la pastilla cerrada de entrada */
    window.__V.limpiar(); window.__V.denominador();
    out.inicio = leer();
    window.__V.set('vmax_it', 3.4);
    out.desdeDoppler = leer();
    /* (2) borrar en Doppler borra en Valvulas */
    window.__V.set('vmax_it', '');
    out.borradoDesdeDoppler = leer();
    /* (3) VALVULAS -> DOPPLER, pastilla cerrada de entrada */
    window.__V.limpiar(); window.__V.denominador();
    if (window.__V.pill('tricuspide','insuf') !== true) toggleValvPill('tricuspide','insuf');
    window.__V.set('it_vmax_cw', window.__V.cw(2.6));
    out.desdeValvulas = leer();
    out.desdeValvulas.gradVDAD = window.__V.val('grad_vdad_display');
    /* (4) borrar en Valvulas borra en Doppler */
    window.__V.set('it_vmax_cw', '');
    out.borradoDesdeValvulas = leer();
    /* (5) EL BOTON SE PRENDE DESDE VALVULAS con la pastilla CERRADA (no la abrimos a mano) */
    window.__V.limpiar(); window.__V.denominador();
    out.antesDeCargarValv = leer();
    window.__V.set('it_vmax_cw', window.__V.cw(3.1));
    out.prendeDesdeValvulas = leer();
    /* (6) EL BOTON SE PRENDE DESDE DOPPLER (el comportamiento que ya existia) */
    window.__V.limpiar(); window.__V.denominador();
    window.__V.set('vmax_it', 3.1);
    out.prendeDesdeDoppler = leer();
    /* (7) SIN BUCLE: se cuenta cuantas veces corre el espejo en UN tecleo. itVmaxSync devuelve
           {copio:...}; se envuelve para contar las llamadas. */
    if (typeof window.itVmaxSync === 'function') {
      var orig = window.itVmaxSync, n = 0;
      window.itVmaxSync = function(){ n++; return orig.apply(this, arguments) };
      window.__V.limpiar(); window.__V.denominador();
      window.__V.set('vmax_it', 2.9);
      out.llamadasPorTecleo = n;
      window.itVmaxSync = orig;
    } else { out.llamadasPorTecleo = 'SIN itVmaxSync'; }
    return JSON.stringify(out);
  })()`));

  /* ── P5 · el aviso rojo ─────────────────────────────────────────────────────────────────── */
  const aviso = JSON.parse(await ev(`(function(){
    var out = {};
    var leer = function(){ return { texto: window.__V.txt('it-incongruencia'),
                                    pill: window.__V.pill('tricuspide','insuf'),
                                    vmax: window.__V.val('vmax_it'),
                                    cw: window.__V.val('it_vmax_cw') } };
    /* (a) ESCENA DEL PEDIDO: Vmax cargada y boton APAGADO A MANO */
    window.__V.limpiar(); window.__V.denominador();
    window.__V.set('vmax_it', 3.2);
    out.trasCargar = leer();
    if (window.__V.pill('tricuspide','insuf') === true) toggleValvPill('tricuspide','insuf');
    out.apagadoAMano = leer();
    /* y el informe + EN SUMA en esa escena, los tres estilos (solo se REPORTA, no se cambia) */
    var e1 = window.__V.informe('estandar'), e2 = window.__V.informe('conciso'), e3 = window.__V.informe('narrativo');
    window.__V.informe('estandar');
    out.escenaInforme = { estandar:{vt:window.__V.frasesVT(e1.inf),suma:e1.suma},
                          conciso:{vt:window.__V.frasesVT(e2.inf),suma:e2.suma},
                          narrativo:{vt:window.__V.frasesVT(e3.inf),suma:e3.suma} };
    /* (b) CONTROL NEGATIVO 1: boton apagado y SIN Vmax -> no debe avisar */
    window.__V.limpiar(); window.__V.denominador();
    if (window.__V.pill('tricuspide','insuf') === true) toggleValvPill('tricuspide','insuf');
    out.negSinVmax = leer();
    /* (c) CONTROL NEGATIVO 2: boton PRENDIDO y con Vmax -> no debe avisar */
    window.__V.limpiar(); window.__V.denominador();
    window.__V.set('vmax_it', 3.2);
    if (window.__V.pill('tricuspide','insuf') !== true) toggleValvPill('tricuspide','insuf');
    out.negPrendido = leer();
    /* (d) se APAGA al volver a prender el boton */
    if (window.__V.pill('tricuspide','insuf') === true) toggleValvPill('tricuspide','insuf');
    out.apagadoOtraVez = leer();
    toggleValvPill('tricuspide','insuf');
    out.reprendido = leer();
    /* (e) se APAGA al borrar la Vmax con el boton apagado */
    if (window.__V.pill('tricuspide','insuf') === true) toggleValvPill('tricuspide','insuf');
    out.conVmaxApagado = leer();
    window.__V.set('vmax_it', '');
    out.trasBorrarVmax = leer();
    /* (f) LOS OTROS TRES PARAMETROS: prenden el boton hoy? (solo se mide, no se extiende) */
    var otros = {};
    [['it_vc',8],['it_pisa_r',9],['it_vti',90]].forEach(function(p){
      window.__V.limpiar(); window.__V.denominador();
      var antes = window.__V.pill('tricuspide','insuf');
      window.__V.set(p[0], p[1]);
      otros[p[0]] = { antes: antes, despues: window.__V.pill('tricuspide','insuf'),
                      aviso: window.__V.txt('it-incongruencia') };
    });
    out.otrosParametros = otros;
    return JSON.stringify(out);
  })()`));

  /* ── NORMALIZADOR DE LEGADO: estudio guardado en cm/s, reabierto PARA EDITAR ──────────────
     Se arma el blob como lo escribe `guardarInforme` —con `it_vmax_cw` en cm/s, que es lo que hay
     en disco hoy—, se mete en el store real y se reabre por `editarInforme`, que es el gesto del
     medico. No se compara contra numeros escritos a mano: se compara contra el MISMO caso cargado
     a mano en este build, que es la unica referencia que no puede estar desactualizada. */
  const legado = {};
  for (const c of CASOS) {
    legado[c.n] = JSON.parse(await ev(`(function(){
      window.__V.limpiar(); window.__V.denominador();
      /* El blob SIEMPRE lleva cm/s: es como quedo guardado antes del cambio. */
      var campos = { nombre:'Legado', it_pisa_r:'${c.r}', it_pisa_val:'${c.val}',
        it_vmax_cw:'${c.ms * 100}', it_vti:'${c.vti}', it_densidad:'${c.d}',
        vmax_it:'${c.trv}', pmad:'${c.pmad}', it_grado:'0' };
      var inf = { id: 'legado-test', nombre:'Legado', ci:'1', fecha_estudio:'2026-09-01',
                  campos: campos, informe_texto:'', en_suma:'' };
      /* ⚠️ EL STORE ES CeiboStore (IndexedDB con respaldo), NO localStorage: escribir
         'eco_informes' a mano no lo ve nadie —la primera version de esta sonda lo intento y
         editarInforme no abria el overlay—. Se STUBEA getInformes, que es lo que editarInforme
         consulta, y se restaura en el finally: asi la sonda no escribe ni un byte en los datos
         reales del medico, que es mas seguro que inyectar en el store.
         ⚠️ NI UN ACENTO GRAVE EN ESTE CUERPO — va dentro de un template literal. Tercera vez. */
      /* El valor TAL COMO ESTA EN EL BLOB, capturado ANTES de abrir: _migrarCamposLegacy muta
         inf.campos EN EL LUGAR —ya lo hacia con tsvd_diametro, ip_grado y vp_morf, no es nuevo de
         esta tanda—, asi que leerlo despues devuelve el valor ya normalizado y el reporte diria que
         el blob estaba en m/s. La primera version de esta sonda cayo justo ahi. */
      var enDiscoAntes = campos.it_vmax_cw;
      var _origGet = window.getInformes;
      window.getInformes = function(){ return [inf] };
      try {
        try { editarInforme('legado-test') } catch(e) { return JSON.stringify({err:'editarInforme '+e.message}) }
        var ok = document.getElementById('edit-ok');
        if (!ok) return JSON.stringify({ err:'no aparecio el overlay de editar' });
        ok.click();
      } finally { window.getInformes = _origGet; }
      /* La pastilla la abre calcPSAP al correr los recalculos; si no, se abre para tener geometria. */
      if (window.__V.pill('tricuspide','insuf') !== true) toggleValvPill('tricuspide','insuf');
      try { calcIT_ESC() } catch(e) {}
      try { calcPSAP() } catch(e) {}
      var est = window.__V.informe('estandar');
      return JSON.stringify({ foto: window.__V.foto(), vt: window.__V.frasesVT(est.inf),
                              suma: est.suma, normalizado: window.__V.val('it_vmax_cw'),
                              enDisco: enDiscoAntes, enCacheDespues: campos.it_vmax_cw });
    })()`));
  }

  /* Un estudio guardado SIN el campo: no tiene que cambiar nada. */
  legado['SIN it_vmax_cw'] = JSON.parse(await ev(`(function(){
    window.__V.limpiar(); window.__V.denominador();
    var campos = { nombre:'Legado2', it_vc:'8', it_densidad:'denso', vmax_it:'3', pmad:'5', it_grado:'0' };
    var inf = { id:'legado-test2', nombre:'Legado2', ci:'2', fecha_estudio:'2026-09-01',
                campos: campos, informe_texto:'', en_suma:'' };
    var _origGet = window.getInformes;
    window.getInformes = function(){ return [inf] };
    try {
      try { editarInforme('legado-test2') } catch(e) { return JSON.stringify({err:e.message}) }
      var ok = document.getElementById('edit-ok'); if (!ok) return JSON.stringify({err:'sin overlay'});
      ok.click();
    } finally { window.getInformes = _origGet; }
    if (window.__V.pill('tricuspide','insuf') !== true) toggleValvPill('tricuspide','insuf');
    try { calcIT_ESC() } catch(e) {}
    try { calcPSAP() } catch(e) {}
    var est = window.__V.informe('estandar');
    return JSON.stringify({ foto: window.__V.foto(), vt: window.__V.frasesVT(est.inf),
      suma: est.suma, existeClave: Object.prototype.hasOwnProperty.call(campos,'it_vmax_cw') });
  })()`));

  /* El normalizador como FUNCION PURA, en los bordes del corte (8 se deja, 8.01 se divide). */
  const corte = JSON.parse(await ev(`(function(){
    var pr = function(v){ var o = { it_vmax_cw: v };
      try { _migrarCamposLegacy(o) } catch(e) { return 'EXC ' + e.message }
      return o.it_vmax_cw };
    return JSON.stringify({
      '0.5': pr('0.5'), '3': pr('3'), '8': pr('8'), '8.01': pr('8.01'),
      '50': pr('50'), '250': pr('250'), '300': pr('300'), '800': pr('800'),
      vacio: pr(''), basura: pr('abc'), coma: pr('300,5'),
      sinClave: (function(){ var o = {}; try { _migrarCamposLegacy(o) } catch(e) {}
        return Object.prototype.hasOwnProperty.call(o, 'it_vmax_cw') ? 'SE CREO' : 'no se creo' })()
    });
  })()`));

  /* ── Maquetacion movil: solo desborde, que es lo que pide el punto 6 ─────────────────────── */
  const movil = {};
  for (const w of [1200, 390, 360]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
    await new Promise((r) => setTimeout(r, 250));
    movil[w] = JSON.parse(await ev(`(function(){
      window.__V.limpiar(); window.__V.denominador();
      if (window.__V.pill('tricuspide','insuf') !== true) toggleValvPill('tricuspide','insuf');
      if (window.__V.pill('tricuspide','esten') !== true) toggleValvPill('tricuspide','esten');
      window.__V.set('vmax_it', 3.2);
      if (window.__V.pill('tricuspide','insuf') === true) toggleValvPill('tricuspide','insuf');
      var d = document.documentElement;
      var a = document.getElementById('it-incongruencia');
      var ar = a ? a.getBoundingClientRect() : null;
      return JSON.stringify({ scrollW: d.scrollWidth, clientW: d.clientWidth,
        hayBarra: d.scrollWidth > d.clientWidth + 1,
        aviso: ar ? { w: Math.round(ar.width), h: Math.round(ar.height),
                      der: Math.round(ar.right), desborda: ar.right > d.clientWidth + 1 } : null });
    })()`));
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  const despues = await md5(join(RAIZ, 'index.html'));
  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues,
    listo, unidades, casos, sync, aviso, legado, corte, movil,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
