#!/usr/bin/env node
/**
 * _probe_hfcrit.mjs — sonda A/B de SOLO LECTURA para los CRITERIOS del puntaje HFA-PEFF.
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 * Mide, con TECLAS REALES del navegador (Input.dispatchKeyEvent), los criterios que esta tanda
 * alinea con el ORIGINAL (Pieske et al., Eur Heart J 2019;40:3297-3317, folios 3303-3305):
 *
 *   I — IMVI: el operador del criterio MAYOR por su valor EXACTO, en hombre y en mujer.
 *       El IMVI NO es un campo: es masa de Devereux sobre BSA de Mosteller, o sea un derivado
 *       float de CINCO campos. El valor exacto del corte se alcanza con un ppvi de 15 decimales
 *       calculado por biseccion sobre doubles; sin el, "> 149" y ">= 149" son indistinguibles y
 *       el operador queda sin probar.
 *   B — PEPTIDOS: el piso del criterio MENOR de NT-proBNP en FA, con 364 / 365 / 370 / 374 / 375
 *       y el control negativo en ritmo sinusal, donde ese piso no se mueve.
 *   T — IT y PSAP: velocidad de IT 2,7 / 2,8 / 2,9; la PSAP sola; las dos a la vez (cuenta UNA);
 *       ninguna (no vota). Con la PmAD como palanca para separar la PSAP de la velocidad.
 *   L — LAVI por RITMO: sinusal y FA, los cuatro cortes por sus dos lados, con el dato cargado
 *       y cambiando el ritmo detras.
 *   E — e-prima por EDAD: 74, 75 y 76 anios, los dos anillos.
 *   C — CARTEL de peptidos: declara el corte NUEVO sin tocar su logica.
 *   N — CONTROL NEGATIVO: funcion diastolica, valvulas, Excel con sus columnas y su hash,
 *       informe y EN SUMA, con escenario CARGADO para que el control tenga DENOMINADOR.
 *
 *   node scripts/_probe_hfcrit.mjs --file /tmp/index.HEAD.html > /tmp/hc.HEAD.json
 *   node scripts/_probe_hfcrit.mjs                             > /tmp/hc.NEW.json
 *   node scripts/_probe_hfcrit.mjs --solo I
 *
 * Infraestructura (servidor + Chrome + CDP + cierre del arbol de procesos + teclas reales)
 * calcada de scripts/_probe_eacortes.mjs y scripts/_probe_itvmax.mjs.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/* ⚠️ EL ARBOL DE CHROME NO SE CIERRA CON `proc.kill()`. Las tres piezas —spawn detached, matar el
   GRUPO y colgar el barrido de `exit` ademas de las senales— estan explicadas en
   scripts/_probe_itvmax.mjs. SOLO PIDs PROPIOS, NUNCA POR NOMBRE: un pkill por patron se lleva el
   Chrome del usuario y la corrida del de al lado. */
const _ARNES_VIVOS = new Set();
let _arnesLimpiezaArmada = false;
function _arnesCerrarAlSalir(proc, perfil) {
  if (!proc || !proc.pid) return;
  _ARNES_VIVOS.add({ pid: proc.pid, perfil: perfil });
  if (_arnesLimpiezaArmada) return;
  _arnesLimpiezaArmada = true;
  const barrer = () => {
    for (const v of _ARNES_VIVOS) {
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
const SOLO = arg('--solo');
const CAPTURA = process.argv.includes('--captura');
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-hp-'));
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
   la cadena y el archivo deja de parsear con un error que apunta a la APERTURA del template,
   decenas de lineas antes del culpable. scripts/check_backticks.py da la linea exacta. */
const SONDA = `
window.__H = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  html(id) { var e = document.getElementById(id); return e ? e.innerHTML : null },
  existe(id) { return !!document.getElementById(id) },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  disp(id) { var e = document.getElementById(id); return e ? getComputedStyle(e).display : 'NO EXISTE' },
  rect(id) { var e = document.getElementById(id); if (!e) return null;
    var r = e.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top),
             w: Math.round(r.width), h: Math.round(r.height) } },
  foco() { var a = document.activeElement;
    return a ? (a.id || ('<' + a.tagName.toLowerCase() + '>')) : null },

  /* ══ EL PLAN ══ Es localStorage, no una licencia de servidor: 'ett_view_mode' vale
     'basico' o 'avanzado' y por defecto (clave ausente) la app asume 'avanzado'. */
  planPoner(modo) {
    try { localStorage.setItem('ett_view_mode', modo) } catch(e) {}
    try { if (typeof applyViewMode === 'function') applyViewMode() } catch(e) {}
    try { if (typeof cfgRenderModulos === 'function') cfgRenderModulos() } catch(e) {}
    return window.__H.planFoto() },
  planFoto() {
    var modo = null;
    try { modo = (typeof eeGetMode === 'function') ? eeGetMode() : localStorage.getItem('ett_view_mode') } catch(e) {}
    var btn = document.querySelector('button[data-mod=\\'hemodinamica\\']');
    return { modo: modo,
             botonHemoDisplay: btn ? getComputedStyle(btn).display : 'SIN BOTON',
             botonHemoVisible: btn ? (getComputedStyle(btn).display !== 'none') : null,
             filaEspecialDisplay: (function(){ var f = document.querySelector('.tabs-special');
               return f ? getComputedStyle(f).display : 'SIN FILA' })() } },
  /* La pestana ACTIVA, que es lo que el defecto mueve. */
  tabActiva() {
    var s = document.querySelector('.tab-section.active');
    return s ? s.id : null },

  /* ══ ESCENARIO ══ Un paciente con FEVI preservada y los dos dominios de eco cargados, que es
     la condicion para que el renglon del HFA-PEFF aparezca en el cuadro de referencias. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  limpiar() { try { limpiarCampos(true) } catch(e) {} return 1 },

  /* ⚠️ LOS DOS CAMPOS DUENOS NO TIENEN GEOMETRIA HASTA QUE SE ABRE SU PUERTA, Y SON DOS: la
     pestana Hemodinamica —que el plan basico esconde del rail— y la tarjeta plegable
     #hfapeff-seccion, que nace en display:none. Sin esto, el tipeo ABORTA con
     «SIN GEOMETRIA hf_ntprobnp», que es lo correcto: tipear en un campo sin geometria no es
     una medicion. Es el gesto del medico CON plan completo. */
  abrirAvanzado() {
    try { localStorage.setItem('ett_view_mode','avanzado') } catch(e) {}
    try { if (typeof applyViewMode === 'function') applyViewMode() } catch(e) {}
    try { showTab('hemodinamica') } catch(e) {}
    var sec = document.getElementById('hfapeff-seccion');
    if (sec && getComputedStyle(sec).display === 'none') {
      try { toggleCard('hfapeff-seccion', null) } catch(e) { sec.style.display = '' }
    }
    if (sec && getComputedStyle(sec).display === 'none') sec.style.display = '';
    try { if (typeof hfapeffRender === 'function') hfapeffRender() } catch(e) {}
    return { tab: window.__H.tabActiva(), seccion: window.__H.disp('hfapeff-seccion'),
             nt: window.__H.rect('hf_ntprobnp'), bnp: window.__H.rect('hf_bnp'),
             ok: (function(){ var r = window.__H.rect('hf_ntprobnp');
               return !!(r && r.w > 0 && r.h > 0) })() } },
  volverADoppler() { try { showTab('doppler') } catch(e) {}
    try { if (typeof hfapeffLineaEco === 'function') hfapeffLineaEco() } catch(e) {}
    return window.__H.tabActiva() },

  /* Paciente con los dos dominios de eco POSITIVOS: e-prima bajo, E/e alto, Vol AI dilatado y
     FEVI 60. Sin esto el renglon de las referencias se esconde por su propia guarda y la
     escena mide un cuadro vacio — la trampa del denominador que CLAUDE.md documenta. */
  paciente() {
    var r = {};
    [['edad','70'],['sexo','M'],['peso','70'],['talla','170'],['fevi','60'],
     ['e_sep','5'],['e_lat','7'],['onda_e','110'],['ai_vol','80'],['vmax_it','3.2'],
     ['ddfvi','50'],['siv','13'],['ppvi','13']].forEach(function(p){
      r[p[0]] = window.__H.set(p[0], p[1]) });
    try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
    try { if (typeof calcDiastol === 'function') calcDiastol() } catch(e) {}
    try { if (typeof hfapeffLineaEco === 'function') hfapeffLineaEco() } catch(e) {}
    return r },

  /* ══ LAS DOS SUPERFICIES DEL SCORE ══ el renglon del cuadro de referencias y el score de
     Avanzado, leidos del MISMO objeto, para poder exigir que no se contradigan. */
  refs() {
    try { if (typeof hfapeffLineaEco === 'function') hfapeffLineaEco() } catch(e) {}
    var row = document.getElementById('hfapeff-eco-row');
    var val = document.getElementById('hfapeff-eco');
    var lbl = row ? row.querySelector('.calc-lbl') : null;
    var btn = val ? val.querySelector('button') : null;
    return { filaDisplay: row ? row.style.display : 'NO EXISTE',
             filaVisible: window.__H.vis('hfapeff-eco-row'),
             rotulo: lbl ? (lbl.textContent || '').trim() : null,
             texto: val ? (val.textContent || '').trim() : null,
             boton: btn ? (btn.textContent || '').trim() : null,
             botonOnclick: btn ? (btn.getAttribute('onclick') || '') : null } },
  score(soloEco) {
    if (typeof hfapeffScore !== 'function') return 'SIN hfapeffScore';
    try {
      var r = hfapeffScore(!!soloEco);
      return { total: r.total, max: r.max,
               func: r.func.pts, morf: r.morf.pts, hum: r.hum.pts,
               humHayDatos: !!r.hum.hayDatos, completo: !!r.completo, fa: !!r.fa,
               interp: r.interp ? r.interp.txt : null,
               gateAplica: r.gate ? !!r.gate.aplica : null,
               gateMotivo: r.gate ? r.gate.motivo : null,
               concl: (typeof hfapeffConclusion === 'function') ? hfapeffConclusion(r) : null }
    } catch(e) { return 'EXC: ' + e.message } },
  /* Los criterios humorales que el score declara cumplidos, con su texto: es lo que dice QUE
     CORTE aplico, leido del dueno y no reimplementado. */
  humCrit() {
    if (typeof hfapeffScore !== 'function') return 'SIN hfapeffScore';
    try { var h = hfapeffScore(false).hum;
      return { pts: h.pts,
               mayor: (h.mayor || []).map(function(c){ return c.txt }),
               menor: (h.menor || []).map(function(c){ return c.txt }) } }
    catch(e) { return 'EXC: ' + e.message } },
  umbrales(fa) {
    if (typeof hfUmbrales !== 'function') return 'SIN hfUmbrales';
    var u = hfUmbrales(!!fa);
    return { ntMay: u.ntMay.txt, bnMay: u.bnMay.txt, ntMen: u.ntMen.txt, bnMen: u.bnMen.txt } },
  ritmoEfectivo() { try { return (typeof hfRitmoEfectivo === 'function') ? hfRitmoEfectivo() : 'SIN FN' }
    catch(e) { return 'EXC' } },

  /* ══ EL CARTEL ══ Devuelve 'NO EXISTE' contra HEAD, que es la rama prevista del A/B. */
  cartel() {
    var ov = document.getElementById('modal-hfpep');
    if (!ov) return { existe: false };
    return { existe: true, display: getComputedStyle(ov).display,
             abierto: getComputedStyle(ov).display !== 'none',
             rol: ov.getAttribute('role'), modal: ov.getAttribute('aria-modal'),
             rotulado: ov.getAttribute('aria-labelledby') || ov.getAttribute('aria-label'),
             tipo: window.__H.val('hfpep-tipo'),
             valor: window.__H.val('hfpep-val'),
             ritmoTxt: window.__H.txt('hfpep-ritmo'),
             corteTxt: window.__H.txt('hfpep-corte'),
             foco: window.__H.foco(),
             rectCaja: window.__H.rect('hfpep-caja'),
             rectVal: window.__H.rect('hfpep-val') } },

  /* Los dos campos DUENOS que viven en Avanzado. */
  avanzado() {
    return { nt: window.__H.val('hf_ntprobnp'), bnp: window.__H.val('hf_bnp'),
             ritmoSel: window.__H.val('hf_ritmo'),
             chk: { ntMay: !!(document.getElementById('hf_nt_may')||{}).checked,
                    ntMen: !!(document.getElementById('hf_nt_men')||{}).checked,
                    bnMay: !!(document.getElementById('hf_bnp_may')||{}).checked,
                    bnMen: !!(document.getElementById('hf_bnp_men')||{}).checked } } },

  /* ══ CONTROLES AJENOS ══ */
  diastolica() { return { interp: window.__H.txt('dd-interp'),
                          badge: window.__H.txt('diast-badge') } },
  valvulas() { var r = {};
    ['im_grado','ia_grado','it_grado','ea_grado','em_grado','et_grado','ep_grado','ip_grado']
      .forEach(function(id){ r[id] = window.__H.val(id) });
    r.eaSev = window.__H.txt('ea-sev');
    return r },
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
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-13', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },
  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* ══ GUARDADO ══ Usa el mismo recolector que guardarInforme y repone por el mismo camino. */
  guardarFoto() {
    var c = window.__H.campos();
    return { nt: c['hf_ntprobnp'], bnp: c['hf_bnp'],
             cartelTipo: c['hfpep-tipo'] === undefined ? 'NO ESTA' : c['hfpep-tipo'],
             cartelVal: c['hfpep-val'] === undefined ? 'NO ESTA' : c['hfpep-val'],
             enEstudio: (function(){
               if (typeof _noEsDelEstudio !== 'function') return 'SIN _noEsDelEstudio';
               return { cartelTipo: !_noEsDelEstudio('hfpep-tipo'),
                        cartelVal: !_noEsDelEstudio('hfpep-val'),
                        nt: !_noEsDelEstudio('hf_ntprobnp') } })() } },

  /* DENOMINADOR. Despeja los overlays, abre Doppler y CONFIRMA que el renglon del HFA-PEFF
     y los campos del cartel tienen geometria. Una sonda sobre un arbol cerrado tipea en la
     nada y todo sale «sin cambios». */
  abrirTodo() {
    try { showTab('doppler') } catch(e) {}
    var cards = ['dop-mitral','diast-card'];
    cards.forEach(function(id){ var c = document.getElementById(id);
      if (c && getComputedStyle(c).display === 'none') c.style.display = '' });
    return { tabDoppler: window.__H.vis('tab-doppler'),
             filaRefs: window.__H.existe('hfapeff-eco-row'),
             seccionAvanzado: window.__H.existe('hfapeff-seccion'),
             nt: window.__H.existe('hf_ntprobnp'), bnp: window.__H.existe('hf_bnp'),
             cartel: window.__H.existe('modal-hfpep'),
             ok: window.__H.existe('hfapeff-eco-row') && window.__H.existe('hf_ntprobnp') } },

  /* ══ ABRIDOR DE PUERTAS GENERICO ══
     ⚠️ UN CAMPO SIN GEOMETRIA NO SE PUEDE TIPEAR, Y LOS INSUMOS DE ESTE SCORE VIVEN EN CUATRO
     PESTANAS: ppvi, siv, ddfvi y edad en Datos; e_sep, e_lat, onda_e, ai_vol y vmax_it en
     Doppler; los dos peptidos en Hemodinamica detras de una tarjeta plegable. Cablear cada
     pestana a mano es una lista que se desactualiza; esto sube por el DOM hasta la .tab-section
     que contiene al campo, la activa por su propio id, y de paso abre cualquier ancestro que
     haya quedado en display:none. Devuelve el rect para que el llamador pueda ABORTAR si la
     puerta no se abrio, en vez de informar «sin cambios» sobre un tecleo que no ocurrio. */
  abrirPara(id) {
    var e = document.getElementById(id);
    if (!e) return { ok: false, por: 'NO EXISTE ' + id };
    var sec = e.closest ? e.closest('.tab-section') : null;
    var tab = sec ? String(sec.id || '').replace(/^tab-/, '') : null;
    if (tab) { try { showTab(tab) } catch(x) {} }
    var n = e.parentNode, abiertos = [];
    while (n && n.nodeType === 1 && n !== document.body) {
      if (getComputedStyle(n).display === 'none') {
        n.style.display = ''; abiertos.push(n.id || n.className);
      }
      n = n.parentNode;
    }
    var r = window.__H.rect(id);
    return { ok: !!(r && r.w > 0 && r.h > 0), tab: tab, abiertos: abiertos, rect: r } },

  /* ══ LOS CRITERIOS DE LOS DOS DOMINIOS DE ECO, leidos del DUENO y no reimplementados ══
     Cada entrada trae el texto que el medico ve, si el criterio se pudo evaluar (dato) y si lo
     cumple (ok). Sin el texto no se puede distinguir «el corte no funciona» de «la escena no
     llego a ese criterio»: es el denominador por fila que CLAUDE.md pide. */
  critDom(dom) {
    if (typeof hfapeffScore !== 'function') return 'SIN hfapeffScore';
    try { var r = hfapeffScore(false)[dom];
      return { pts: r.pts, hayDatos: !!r.hayDatos,
               todos: (r.todos || []).map(function(c){
                 return { txt: c.txt, tipo: c.tipo, dato: !!c.dato, ok: !!c.ok } }) } }
    catch(e) { return 'EXC: ' + e.message } },
  /* Los valores DERIVADOS que el score usa, para poder decir que el borde se alcanzo. */
  derivados() {
    if (typeof hfapeffScore !== 'function') return 'SIN hfapeffScore';
    try { var d = hfapeffScore(false).d;
      return { imvi: d.imvi, rwt: d.rwt, lavi: d.lavi, ee: d.ee, esep: d.esep, elat: d.elat,
               it: d.it, pared: d.pared, gls: d.gls, edad: d.edad, sexo: d.sexo,
               ritmo: d.ritmo, fevi: d.fevi,
               psapCampo: window.__H.val('psap_calc'),
               bsa: (typeof getBSA === 'function') ? getBSA() : null } }
    catch(e) { return 'EXC: ' + e.message } },
  /* El criterio FUNCIONAL que nombra la IT o la PSAP, sea cual sea su texto: contarlos es lo
     que prueba que cuenta UNA vez y no dos. */
  critIT() {
    var f = window.__H.critDom('func');
    if (typeof f === 'string') return f;
    var m = f.todos.filter(function(c){ return /IT|PSAP|tricusp/i.test(c.txt) });
    return { cuantos: m.length, items: m, pts: f.pts } },

  /* Paciente de MORFOLOGIA para el borde del IMVI: sin LAVI ni pared que voten, para que el
     dominio morfologico dependa SOLO del IMVI. La pared se deja por debajo de 12 mm cuando el
     escenario lo permite; cuando no (el IMVI alto necesita paredes gruesas), se informa que la
     pared tambien vota y se mide el criterio por su FILA y no por los puntos del dominio. */
  pacienteIMVI(sexo, peso, talla, dd, siv) {
    var r = {};
    [['edad','70'],['sexo',sexo],['peso',String(peso)],['talla',String(talla)],['fevi','60'],
     ['ddfvi',String(dd)],['siv',String(siv)]].forEach(function(p){
      r[p[0]] = window.__H.set(p[0], p[1]) });
    try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
    return r },
  /* Escenario FUNCIONAL puro: sin e-prima ni E/e que voten, para que la IT y la PSAP sean lo
     unico que puede mover el dominio. */
  pacienteFunc() {
    var r = {};
    [['edad','70'],['sexo','M'],['peso','70'],['talla','170'],['fevi','60'],
     ['e_sep','9'],['e_lat','12'],['onda_e','60'],['hf_gls','22'],
     ['ai_vol','40'],['ddfvi','50'],['siv','13'],['ppvi','13']].forEach(function(p){
      r[p[0]] = window.__H.set(p[0], p[1]) });
    try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
    try { if (typeof calcPSAP === 'function') calcPSAP() } catch(e) {}
    try { if (typeof calcDiastol === 'function') calcDiastol() } catch(e) {}
    return r },
  recalc() {
    try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
    try { if (typeof calcPSAP === 'function') calcPSAP() } catch(e) {}
    try { if (typeof calcDiastol === 'function') calcDiastol() } catch(e) {}
    try { if (typeof hfapeffRender === 'function') hfapeffRender() } catch(e) {}
    try { if (typeof hfapeffLineaEco === 'function') hfapeffLineaEco() } catch(e) {}
    return 1 },
  /* El ritmo del selector del DOPPLER, que es el que hfRitmoEfectivo lee con hf_ritmo en auto. */
  ponerRitmo(tok) {
    window.__H.set('hf_ritmo', 'auto');
    var r = window.__H.set('diast_ritmo', tok);
    window.__H.recalc();
    return { pedido: tok, quedo: window.__H.val('diast_ritmo'),
             efectivo: window.__H.ritmoEfectivo(), set: r } },

  listo() {
    var faltan = ['generarInforme','showTab','limpiarCampos','hfapeffScore','hfapeffLineaEco',
                  'hfapeffRender','hfUmbrales','hfRitmoEfectivo','applyViewMode','eeGetMode',
                  'setEstiloInforme','_labExcelRow','_noEsDelEstudio']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('hf_ntprobnp')) return { listo:false, por:'sin hf_ntprobnp' };
    if (!document.getElementById('hfapeff-eco-row')) return { listo:false, por:'sin hfapeff-eco-row' };
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
  await cdp.send('Page.enable', {}, sessionId);

  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'exc');
    return r.result.value;
  };
  const J = async (expr) => JSON.parse(await ev(`JSON.stringify(${expr})`));

  /* ══ TECLAS REALES ══ una por caracter, con el `text` SOLO en el `char`.
     ⚠️ UNA TECLA DE EDICION NO ES UN CARACTER, Y SIN `windowsVirtualKeyCode` NO BORRA NADA:
     Blink ejecuta el comando de edicion por el keycode, no por `key`, y hace falta `rawKeyDown`.
     ⚠️ Y AL REVES PARA ENTER/ESPACIO SOBRE UN BOTON: un `rawKeyDown` pelado NO genera keypress,
     asi que no activa un `<button>`. Esas dos van con `type:'keyDown'` + `text`. */
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, Escape: 27, End: 35, Home: 36 };
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
  /* ⚠️ LOS DOS OVERLAYS SE DESPEJAN DENTRO DEL MEDIDOR Y NO UNA VEZ AL ARRANQUE. CLAUDE.md lo
     documenta medido tres veces: `#modalAvisoEco` (z-index 9999) y `#login-overlay`
     (2147483000) VUELVEN a mitad de corrida, y con cualquiera de los dos puesto
     `elementFromPoint` devuelve ESE nodo, asi que un clic se informa dado sin haber ocurrido. */
  const despejar = async () => J(`(function(){
    var r = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (!m) { r[id] = 'NO EXISTE'; return }
      var d = getComputedStyle(m).display;
      if (d !== 'none') { m.style.display = 'none'; r[id] = 'estaba ' + d + ' → despejado' }
      else { r[id] = 'none' }
    });
    return r })()`);

  async function clicEn(id) {
    await despejar();
    const c = await J(`(window.__H.rect(${JSON.stringify(id)}) || { err: 'no existe' })`);
    if (!c || c.err || c.w === 0 || c.h === 0) {
      return { via: 'NO SE PUDO', por: c && c.err ? c.err : 'nodo sin geometria', rect: c };
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if (e) e.scrollIntoView({ block:'center', inline:'center' }); return 1 })()`);
    const r2 = await J(`window.__H.rect(${JSON.stringify(id)})`);
    const x = Math.round(r2.x + r2.w / 2), y = Math.round(r2.y + r2.h / 2);
    const quien = await J(`(function(){
      var t = document.getElementById(${JSON.stringify(id)});
      var e = document.elementFromPoint(${x}, ${y});
      if (!e) return { enPunto: null, esElBlanco: false };
      return { enPunto: (e.id || ('<' + e.tagName.toLowerCase() + '>')),
               esElBlanco: !!(t && (e === t || t.contains(e) || e.contains(t))) } })()`);
    if (quien.esElBlanco) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }, sessionId);
      await pausa(160);
      return { via: 'mouse', punto: { x, y }, quien };
    }
    /* Respaldo por tecla: el foco se verifica, y si no llega al blanco se informa en vez de
       mandar un Enter al documento. Un gesto que no ocurrio no es una medicion. */
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if (e) e.focus(); return 1 })()`);
    const foco = await ev(`window.__H.foco()`);
    if (foco !== id) return { via: 'NO SE PUDO', por: 'el foco no llego al blanco', foco, quien };
    await tecla('Enter', '\r');
    await pausa(160);
    return { via: 'tecla Enter', punto: { x, y }, quien, foco };
  }

  /* Tipea DESDE VACIO con teclas reales. ABORTA si el nodo no existe o no tiene geometria:
     tipear en un campo que no existe no es una medicion (CLAUDE.md, leccion de _probe_strainai). */
  async function tipear(id, valor) {
    const ex = await ev(`window.__H.existe(${JSON.stringify(id)})`);
    if (!ex) return { ABORTA: 'NO EXISTE ' + id };
    const r = await J(`window.__H.rect(${JSON.stringify(id)})`);
    if (!r || r.w === 0 || r.h === 0) return { ABORTA: 'SIN GEOMETRIA ' + id, rect: r };
    await despejar();
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if (e) e.scrollIntoView({ block:'center', inline:'center' }); return 1 })()`);
    const r2 = await J(`window.__H.rect(${JSON.stringify(id)})`);
    const x = Math.round(r2.x + r2.w / 2), y = Math.round(r2.y + r2.h / 2);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }, sessionId);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    const foco0 = await ev(`window.__H.foco()`);
    if (foco0 !== id) return { ABORTA: 'EL FOCO NO LLEGO A ' + id, foco: foco0 };
    /* `End` antes de cada caracter MENOS EL PRIMERO: hace falta porque un `oninput` que
       reasigna `.value` al campo enfocado manda el caret al principio; y no va en el primero
       porque `End` deselecciona lo que `select()` acaba de seleccionar y el tecleo apendaria. */
    let prim = true;
    for (const ch of String(valor)) {
      if (!prim) await tecla('End', null);
      await tecla(ch, ch);
      prim = false;
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(110);
    const quedo = await ev(`window.__H.val(${JSON.stringify(id)})`);
    if (String(quedo) !== String(valor)) {
      return { ABORTA: 'EL TECLEO NO QUEDO en ' + id, pedido: String(valor), quedo: String(quedo) };
    }
    return { pedido: String(valor), quedo: String(quedo), ok: true };
  }

  /* BORRA CON BACKSPACE, digito por digito, reenfocando si hace falta y leyendo el foco al
     lado del valor: un campo que no cambia con el foco perdido es indistinguible de uno que
     alguien repone. NUNCA sobre un campo de solo lectura. */
  async function borrar(id) {
    const ex = await ev(`window.__H.existe(${JSON.stringify(id)})`);
    if (!ex) return { ABORTA: 'NO EXISTE ' + id };
    const ro = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      return !!(e && (e.readOnly || e.disabled)) })()`);
    if (ro) return { ABORTA: 'SOLO LECTURA ' + id };
    await despejar();
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if (e) { e.scrollIntoView({ block:'center' }); e.focus() } return 1 })()`);
    await tecla('End', null);
    const pasos = [];
    for (let i = 0; i < 12; i++) {
      const v0 = await ev(`window.__H.val(${JSON.stringify(id)})`);
      if (v0 === '' || v0 === null) break;
      let foc = await ev(`window.__H.foco()`);
      let reenfoco = null;
      if (foc !== id) {
        await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
        await tecla('End', null);
        foc = await ev(`window.__H.foco()`);
        reenfoco = foc;
      }
      await tecla('Backspace', null);
      await pausa(80);
      pasos.push({ tras: i + 1, foco: foc, reenfoco,
                   campo: await ev(`window.__H.val(${JSON.stringify(id)})`) });
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})); e.blur() } return 1 })()`);
    await pausa(120);
    const quedo = await ev(`window.__H.val(${JSON.stringify(id)})`);
    if (quedo !== '' && quedo !== null) return { ABORTA: 'EL BORRADO NO QUEDO en ' + id, quedo, pasos };
    return { pasos, quedo };
  }

  /* ── Arranque ───────────────────────────────────────────────────────────────────────────── */
  await ev(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2800);
  for (let i = 0; i < 40; i++) {
    try { await ev(SONDA); const l = await J('window.__H.listo()'); if (l.listo) break; } catch {}
    await pausa(500);
  }
  await ev(SONDA);
  const listo = await J('window.__H.listo()');
  await despejar();
  const denom = await J('window.__H.abrirTodo()');
  if (!denom.ok) throw new Error('SIN DENOMINADOR: ' + JSON.stringify(denom));

  const out = { archivo: FARG, listo, denominador: denom };
  const hacer = (k) => !SOLO || SOLO === k;

  /* Estado de partida: formulario vacio, plan por defecto, paciente de eco cargado. */
  const base = async (plan) => {
    await despejar();
    await ev(`window.__H.limpiar()`);
    if (plan) await J(`window.__H.planPoner(${JSON.stringify(plan)})`);
    await ev(`try{ showTab('doppler') }catch(e){}; 1`);
    const p = await J('window.__H.paciente()');
    await pausa(250);
    return p;
  };

  /* Escenario de morfologia aislada: limpia, pone el paciente y devuelve el estado. */
  const baseMorf = async (sexo, peso, talla, dd, siv) => {
    await despejar();
    await ev(`window.__H.limpiar()`);
    await ev(`try{ showTab('doppler') }catch(e){}; 1`);
    await J(`window.__H.pacienteIMVI(${JSON.stringify(sexo)}, ${peso}, ${talla}, ${dd}, ${siv})`);
    await ev('window.__H.recalc()');
    const puerta = await J(`window.__H.abrirPara('ppvi')`);
    await pausa(200);
    return puerta;
  };

  /* ══ I — EL OPERADOR DEL IMVI MAYOR, POR SU VALOR EXACTO ═════════════════════════════════
     ⚠️ EL IMVI NO ES UN CAMPO. Es masa de Devereux —una cubica sobre ddfvi, siv y ppvi— dividida
     por la BSA de Mosteller, o sea un derivado float de CINCO campos. Con valores clinicos
     normales JAMAS cae exactamente en 149,000..., asi que «> 149» y «>= 149» dan lo mismo en
     toda escena alcanzable y el operador queda SIN PROBAR: un A/B contra HEAD daria 0
     diferencias y se leeria como «el cambio no hizo nada».
     El valor del ppvi de cada triplete sale de una BISECCION SOBRE DOUBLES hecha afuera, que
     busca el double para el cual `masa/bsa === 149` exactamente. Es un numero artificial —15
     decimales en un espesor parietal— y esta puesto a proposito: es el UNICO valor que separa
     los dos operadores, igual que el 370 separa el 365 del 375 en los peptidos. */
  if (hacer('I')) {
    const I = { escenas: [], nota: 'ppvi de 15 decimales: es el unico valor que da IMVI exacto' };
    try {
      const casos = [
        { sexo:'M', peso:70, talla:170, dd:50, siv:13, corte:149,
          abajo:'13.62', justo:'13.624098525525902', arriba:'13.63' },
        { sexo:'F', peso:60, talla:160, dd:48, siv:11, corte:122,
          abajo:'11.42', justo:'11.427598347830793', arriba:'11.44' },
      ];
      for (const c of casos) {
        const tri = [];
        for (const [etq, pp] of [['abajo', c.abajo], ['justo', c.justo], ['arriba', c.arriba]]) {
          const puerta = await baseMorf(c.sexo, c.peso, c.talla, c.dd, c.siv);
          const t = await tipear('ppvi', pp);
          await ev('window.__H.recalc()');
          await pausa(150);
          const der = await J('window.__H.derivados()');
          const morf = await J("window.__H.critDom('morf')");
          const filaMay = (typeof morf === 'string') ? morf
            : (morf.todos.filter(x => /IMVI/.test(x.txt) && x.tipo === 'mayor')[0] || null);
          const filaMen = (typeof morf === 'string') ? morf
            : (morf.todos.filter(x => /IMVI/.test(x.txt) && x.tipo === 'menor')[0] || null);
          tri.push({ etq, ppvi: pp, tecleo: t, puerta,
            imvi: der.imvi, rwt: der.rwt, bsa: der.bsa, sexoLeido: der.sexo,
            IMVI_EXACTO_EN_EL_CORTE: der.imvi === c.corte,
            filaMayor: filaMay, filaMenor: filaMen,
            morfPts: (typeof morf === 'string') ? morf : morf.pts });
        }
        I.escenas.push({ caso: c, triplete: tri });
      }
    } catch (x) { I.FALLO = String(x.message || x); }
    out.I = I;
  }

  /* ══ B — EL PISO DEL CRITERIO MENOR DE NT-proBNP EN FA ════════════════════════════════════
     364 / 365 / 370 / 374 / 375. El 370 es el valor que SEPARA los dos candidatos: con el piso
     en 375 vale 0 puntos y con el piso en 365 vale 1. Una bateria con 300 y 400 pasa igual con
     los dos y no probaria nada. El control negativo es el ritmo SINUSAL, donde ese piso no se
     mueve (125) y los cinco valores dan lo mismo en los dos arboles. */
  if (hacer('B')) {
    const B = { fa: [], sinusal: [], umbrales: {} };
    try {
      for (const [etq, tok] of [['fa', 'fa'], ['sinusal', 'rs']]) {
        await despejar();
        await ev(`window.__H.limpiar()`);
        await ev(`try{ showTab('doppler') }catch(e){}; 1`);
        await J('window.__H.paciente()');
        const rit = await J(`window.__H.ponerRitmo(${JSON.stringify(tok)})`);
        B.umbrales[etq] = await J(`window.__H.umbrales(${JSON.stringify(etq === 'fa')})`);
        const puerta = await J('window.__H.abrirAvanzado()');
        for (const val of ['364', '365', '370', '374', '375', '400']) {
          const t = await tipear('hf_ntprobnp', val);
          await ev('window.__H.recalc()');
          await pausa(130);
          const hum = await J('window.__H.humCrit()');
          const sc = await J('window.__H.score(false)');
          B[etq].push({ valor: val, tecleo: t, ritmoEfectivo: rit.efectivo,
            humPts: (typeof hum === 'string') ? hum : hum.pts,
            humMenor: (typeof hum === 'string') ? hum : hum.menor,
            total: sc.total });
          await borrar('hf_ntprobnp');
        }
        B[etq + '_puerta'] = puerta;
        await ev(`try{ showTab('doppler') }catch(e){}; 1`);
      }
    } catch (x) { B.FALLO = String(x.message || x); }
    out.B = B;
  }

  /* ══ T — LA VELOCIDAD DE LA IT Y LA PSAP ══════════════════════════════════════════════════
     ⚠️ LA PSAP DE ESTA APP NO ES UNA MEDICION INDEPENDIENTE: `psap_calc` es readonly y lo
     escribe `calcPSAP` como (4*VRT^2 + PmAD).toFixed(0), o sea que DERIVA de la misma velocidad
     de IT y ademas se REDONDEA a entero. Y se VACIA cuando no hay velocidad de IT.
     Por eso la palanca que separa las dos es la PmAD: con VRT 2,7 (que no cumple >2,8) y una
     PmAD alta, la PSAP cruza 35 mmHg y el criterio vota igual. Sin esa palanca, «la PSAP sola»
     no es una escena alcanzable y decirlo medido es mejor que inventar una.
     Las cuatro escenas que pide la orden: 2,7 / 2,8 / 2,9 · PSAP sola · las dos · ninguna. */
  if (hacer('T')) {
    const T = { escenas: [] };
    try {
      const esc = [
        { etq: 'sin nada',                 vit: null,   vci: null },
        { etq: 'VRT 2,7 (no cumple)',      vit: '2.7',  vci: null },
        { etq: 'VRT 2,8 (el corte, > estricto)', vit: '2.8', vci: null },
        { etq: 'VRT 2,9 (cumple)',         vit: '2.9',  vci: null },
        { etq: 'VRT 2,7 + PmAD alta -> PSAP > 35', vit: '2.7', vci: 'alta' },
        { etq: 'VRT 2,9 + PmAD alta -> las DOS',   vit: '2.9', vci: 'alta' },
      ];
      for (const e of esc) {
        await despejar();
        await ev(`window.__H.limpiar()`);
        await ev(`try{ showTab('doppler') }catch(e){}; 1`);
        await J('window.__H.pacienteFunc()');
        let vciFoto = null;
        if (e.vci === 'alta') {
          /* PmAD alta por la VCI: dilatada y sin colapso. Son los dos <select> de la VCI, que
             es el camino real; la PmAD no es un campo que se tipee. */
          vciFoto = await J(`(function(){
            var r = {};
            r.diam = window.__H.set('vci_diam', '25');
            r.col  = window.__H.set('vci_col', 'no');
            try { if (typeof calcPmAD === 'function') calcPmAD() } catch(e) {}
            try { if (typeof calcPSAP === 'function') calcPSAP() } catch(e) {}
            r.pmad = window.__H.val('pmad');
            return r })()`);
        }
        let t = null;
        if (e.vit) { await J(`window.__H.abrirPara('vmax_it')`); t = await tipear('vmax_it', e.vit); }
        await ev('window.__H.recalc()');
        await pausa(160);
        const der = await J('window.__H.derivados()');
        const func = await J("window.__H.critDom('func')");
        const cIT = await J('window.__H.critIT()');
        const sc = await J('window.__H.score(false)');
        T.escenas.push({ etq: e.etq, tecleo: t, vciFoto,
          vmax_it: der.it, psapCampo: der.psapCampo, pmad: await ev(`window.__H.val('pmad')`),
          criteriosIToPSAP: cIT, funcPts: (typeof func === 'string') ? func : func.pts,
          funcTodos: (typeof func === 'string') ? func : func.todos,
          total: sc.total });
      }
    } catch (x) { T.FALLO = String(x.message || x); }
    out.T = T;
  }

  /* ══ L — EL LAVI SEGUN EL RITMO ═══════════════════════════════════════════════════════════
     Cuatro cortes y ocho bordes: sinusal mayor >34 y menor 29-34; FA mayor >40 y menor 34-40.
     El Vol AI se tipea y el LAVI sale de dividirlo por la BSA, asi que los valores se eligen
     con BSA = 2,0 exacta (peso 72, talla 200 en Mosteller) y el LAVI es el Vol AI sobre dos. */
  if (hacer('L')) {
    const L = { escenas: [] };
    try {
      for (const [etq, tok] of [['sinusal', 'rs'], ['fa', 'fa']]) {
        for (const vol of ['56', '58', '60', '68', '70', '80', '82']) {
          await despejar();
          await ev(`window.__H.limpiar()`);
          await ev(`try{ showTab('doppler') }catch(e){}; 1`);
          await J(`(function(){
            [['edad','70'],['sexo','M'],['peso','72'],['talla','200'],['fevi','60'],
             ['e_sep','9'],['e_lat','12'],['onda_e','60'],['hf_gls','22'],
             ['ddfvi','50'],['siv','9'],['ppvi','9']].forEach(function(p){
              window.__H.set(p[0], p[1]) });
            try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
            return 1 })()`);
          const rit = await J(`window.__H.ponerRitmo(${JSON.stringify(tok)})`);
          await J(`window.__H.abrirPara('ai_vol')`);
          const t = await tipear('ai_vol', vol);
          await ev('window.__H.recalc()');
          await pausa(130);
          const der = await J('window.__H.derivados()');
          const morf = await J("window.__H.critDom('morf')");
          const filas = (typeof morf === 'string') ? morf
            : morf.todos.filter(x => /LAVI/.test(x.txt));
          L.escenas.push({ ritmo: etq, ritmoEfectivo: rit.efectivo, aiVol: vol, tecleo: t,
            bsa: der.bsa, lavi: der.lavi, filasLAVI: filas,
            morfPts: (typeof morf === 'string') ? morf : morf.pts });
        }
      }
      /* Y el cambio de ritmo CON el dato cargado: el mismo LAVI cambia de peso. */
      await despejar(); await ev(`window.__H.limpiar()`);
      await ev(`try{ showTab('doppler') }catch(e){}; 1`);
      await J(`(function(){
        [['edad','70'],['sexo','M'],['peso','72'],['talla','200'],['fevi','60'],
         ['e_sep','9'],['e_lat','12'],['onda_e','60'],['hf_gls','22'],
         ['ddfvi','50'],['siv','9'],['ppvi','9']].forEach(function(p){ window.__H.set(p[0], p[1]) });
        try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
        return 1 })()`);
      await J(`window.__H.ponerRitmo('rs')`);
      await J(`window.__H.abrirPara('ai_vol')`);
      const tv = await tipear('ai_vol', '76');
      await ev('window.__H.recalc()');
      const rs = await J("window.__H.critDom('morf')");
      const rsDer = await J('window.__H.derivados()');
      await J(`window.__H.ponerRitmo('fa')`);
      await pausa(160);
      const fa = await J("window.__H.critDom('morf')");
      L.cambioDeRitmoConDatoCargado = { tecleo: tv, lavi: rsDer.lavi,
        sinusal: { pts: rs.pts, filas: rs.todos.filter(x => /LAVI/.test(x.txt)) },
        fa: { pts: fa.pts, filas: fa.todos.filter(x => /LAVI/.test(x.txt)) } };
    } catch (x) { L.FALLO = String(x.message || x); }
    out.L = L;
  }

  /* ══ E — EL e-PRIMA POR EDAD ══════════════════════════════════════════════════════════════
     74 / 75 / 76 anios con el MISMO par de anillos, elegido para caer ENTRE los dos juegos de
     cortes: septal 6 (cumple <7 pero no <5) y lateral 8 (cumple <10 pero no <7). Con un e-prima
     que cayera del mismo lado de los dos juegos, el triplete no probaria nada. */
  if (hacer('E')) {
    const E = { escenas: [] };
    try {
      for (const edad of ['74', '75', '76']) {
        await despejar();
        await ev(`window.__H.limpiar()`);
        await ev(`try{ showTab('doppler') }catch(e){}; 1`);
        await J(`(function(){
          [['sexo','M'],['peso','70'],['talla','170'],['fevi','60'],
           ['onda_e','60'],['ai_vol','20'],['hf_gls','22'],
           ['ddfvi','50'],['siv','9'],['ppvi','9']].forEach(function(p){ window.__H.set(p[0], p[1]) });
          try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
          return 1 })()`);
        const pE = await J(`window.__H.abrirPara('edad')`);
        const te = await tipear('edad', edad);
        const pS = await J(`window.__H.abrirPara('e_sep')`);
        const ts = await tipear('e_sep', '6');
        const tl = await tipear('e_lat', '8');
        await ev('window.__H.recalc()');
        await pausa(140);
        const der = await J('window.__H.derivados()');
        const func = await J("window.__H.critDom('func')");
        E.escenas.push({ edad, puertaEdad: pE, puertaDoppler: pS,
          tecleoEdad: te, tecleoSep: ts, tecleoLat: tl,
          edadLeida: der.edad, esep: der.esep, elat: der.elat,
          filasEprima: (typeof func === 'string') ? func
            : func.todos.filter(x => /e' (septal|lateral)/.test(x.txt)),
          funcPts: (typeof func === 'string') ? func : func.pts });
      }
    } catch (x) { E.FALLO = String(x.message || x); }
    out.E = E;
  }

  /* ══ C — EL CARTEL DECLARA EL CORTE NUEVO ═════════════════════════════════════════════════
     El cartel no se toco: lee hfUmbrales. Esto comprueba que el corte nuevo LLEGA solo, que es
     el punto (7) de la orden. Contra HEAD la rama es «dice 375», que es la diferencia esperada. */
  if (hacer('C')) {
    const C = {};
    try {
      await despejar(); await ev(`window.__H.limpiar()`);
      await ev(`try{ showTab('doppler') }catch(e){}; 1`);
      await J('window.__H.paciente()');
      await J(`window.__H.ponerRitmo('fa')`);
      await J('window.__H.abrirAvanzado()');
      const t = await tipear('hf_ntprobnp', '370');
      await ev(`try{ showTab('doppler') }catch(e){}; 1`);
      await ev('window.__H.recalc()');
      await ev(`(function(){ try { if (typeof hfPepAbrir === 'function') hfPepAbrir() } catch(e) {} return 1 })()`);
      await pausa(220);
      C.fa = { tecleo: t, cartel: await J('window.__H.cartel()'),
               umbrales: await J('window.__H.umbrales(true)'),
               hum: await J('window.__H.humCrit()') };
      await J(`window.__H.ponerRitmo('rs')`);
      await pausa(180);
      C.sinusal = { cartel: await J('window.__H.cartel()'),
                    umbrales: await J('window.__H.umbrales(false)'),
                    hum: await J('window.__H.humCrit()') };
      await ev(`(function(){ try { if (typeof hfPepCerrar === 'function') hfPepCerrar() } catch(e) {} return 1 })()`);
      /* Las DOS superficies con los mismos datos: el renglon de referencias y Avanzado. */
      await J(`window.__H.ponerRitmo('fa')`);
      await ev('window.__H.recalc()');
      C.dosSuperficies = { refs: await J('window.__H.refs()'),
                           score: await J('window.__H.score(false)') };
    } catch (x) { C.FALLO = String(x.message || x); }
    out.C = C;
  }

  /* ══ N — CONTROL NEGATIVO MAYOR ═══════════════════════════════════════════════════════════
     Con un escenario CARGADO, para que el control tenga DENOMINADOR: un control sobre un
     formulario vacio compara 'NO EXISTE' contra 'NO EXISTE' y pasa por una medicion buena. */
  if (hacer('N')) {
    const N = {};
    try {
      await despejar();
      await ev(`window.__H.limpiar()`);
      await ev(`try{ showTab('doppler') }catch(e){}; 1`);
      N.puerta = await J('window.__H.paciente()') ? 'paciente cargado' : 'SIN PACIENTE';
      await J(`(function(){
        [['tde','160'],['triv','80'],['vmax_it','3.2'],['im_vc','4'],['ia_vc','3'],
         ['ea_vmax','3.0'],['peso','70'],['talla','170']].forEach(function(p){
          window.__H.set(p[0], p[1]) });
        try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
        try { if (typeof calcDiastol === 'function') calcDiastol() } catch(e) {}
        return 1 })()`);
      await ev('window.__H.recalc()');
      await pausa(300);
      N.diastolica = await J('window.__H.diastolica()');
      N.valvulas = await J('window.__H.valvulas()');
      const xl = await J('window.__H.excel()');
      N.excel = (typeof xl === 'string') ? { err: xl }
        : { columnas: Object.keys(xl).length, hash: null, fila: xl };
      N.informe = {};
      for (const est of ['narrativo', 'telegrafico', 'estructurado']) {
        const r = await J(`window.__H.informe(${JSON.stringify(est)})`);
        N.informe[est] = r;
      }
      N.campos = await J('window.__H.campos()');
    } catch (x) { N.FALLO = String(x.message || x); }
    out.N = N;
  }

  out.md5_antes = antes;
  out.md5_despues = await md5(join(RAIZ, 'index.html'));
  out.index_intacto = out.md5_antes === out.md5_despues;
  console.log(JSON.stringify(out, null, 2));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
