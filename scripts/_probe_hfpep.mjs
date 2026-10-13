#!/usr/bin/env node
/**
 * _probe_hfpep.mjs — sonda A/B de SOLO LECTURA para el CARTEL DE PEPTIDOS del HFA-PEFF.
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 * Mide, con TECLAS REALES del navegador (Input.dispatchKeyEvent), el defecto del plan y el
 * comportamiento del cartel:
 *
 *   P — PLAN: el boton de peptidos con plan BASICO y con plan COMPLETO. A que pestana manda.
 *       Es la escena que reproduce el defecto reportado por el medico.
 *   A — CARTEL: abrir, foco al abrir, Escape, foco de vuelta al boton, clic en el fondo.
 *   S — SINCRONIA: escribir y BORRAR con teclas reales en los dos sentidos (cartel <-> Avanzado).
 *   B — BORDES: para cada tipo de peptido y cada ritmo, abajo / en el corte / arriba, con el
 *       control negativo del valor que no llega al corte menor.
 *   R — RITMO: cambiar el selector de la pestana Doppler con el peptido cargado.
 *   V — VACIO: sin peptido cargado, el renglon de las referencias y el score de Avanzado.
 *   G — GUARDADO: el valor viaja con el estudio, vuelve al reabrirlo y «Nuevo estudio» lo limpia.
 *   W — ANCHO: 1200, 390 y 360 px en los dos temas, con la geometria del cartel medida.
 *   N — CONTROL NEGATIVO: funcion diastolica, valvulas y el Excel con sus columnas y su hash,
 *       con escenario CARGADO para que el control tenga DENOMINADOR.
 *
 *   node scripts/_probe_hfpep.mjs --file /tmp/index.HEAD.html > /tmp/hp.HEAD.json
 *   node scripts/_probe_hfpep.mjs                             > /tmp/hp.NEW.json
 *   node scripts/_probe_hfpep.mjs --solo B --ver
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

  /* ══ P — EL PLAN ═══════════════════════════════════════════════════════════════════════════
     Reproduce el defecto reportado: con plan BASICO, tocar el boton de peptidos abre la
     pestana Hemodinamica de ECO AVANZADO. La pestana activa ANTES y DESPUES del clic es la
     medicion; el boton del rail de Hemodinamica se lee al lado para mostrar que el plan SI
     esta aplicado (el boton esta escondido) y que el defecto entra por otra puerta. */
  if (hacer('P')) {
    const P = { escenas: [] };
    try {
      for (const plan of ['basico', 'avanzado']) {
        await base(plan);
        const planFoto = await J('window.__H.planFoto()');
        const refs0 = await J('window.__H.refs()');
        /* El boton vive DENTRO del span del renglon y no tiene id: se le pone uno para
           poder clickearlo de verdad. Si el renglon esta escondido, no hay boton que tocar
           y la escena lo declara en vez de inventar un clic. */
        const btnId = await ev(`(function(){
          var v = document.getElementById('hfapeff-eco');
          if (!v) return 'SIN SPAN';
          var b = v.querySelector('button');
          if (!b) return 'SIN BOTON';
          if (!b.id) b.id = '__hfpepBtn';
          return b.id })()`);
        const tabAntes = await ev('window.__H.tabActiva()');
        const clic = (btnId === '__hfpepBtn') ? await clicEn(btnId) : { via: 'NO SE PUDO', por: btnId };
        await pausa(300);
        const tabDespues = await ev('window.__H.tabActiva()');
        const cartel = await J('window.__H.cartel()');
        P.escenas.push({ plan, planFoto, renglon: refs0, btnId, clic,
          tabAntes, tabDespues,
          ENTRO_A_AVANZADO: tabDespues === 'tab-hemodinamica',
          seccionAvanzadoVisible: await ev(`window.__H.vis('hfapeff-seccion')`),
          cartelAbierto: cartel.existe ? cartel.abierto : 'NO EXISTE',
          cartel });
        /* Cerrar lo que se haya abierto, para no contaminar la escena siguiente. */
        await ev(`(function(){ try{ if (typeof hfPepCerrar === 'function') hfPepCerrar() }catch(e){}
          try{ showTab('doppler') }catch(e){}; return 1 })()`);
      }
    } catch (x) { P.FALLO = String(x.message || x); }
    await J(`window.__H.planPoner('avanzado')`);
    out.P = P;
  }

  /* ══ A — EL CARTEL ═════════════════════════════════════════════════════════════════════════
     Foco al abrir, Escape para cerrar, foco de vuelta al boton, clic en el fondo. */
  if (hacer('A')) {
    const A = {};
    try {
      await base('basico');
      const btnId = await ev(`(function(){
        var v = document.getElementById('hfapeff-eco'); if (!v) return 'SIN SPAN';
        var b = v.querySelector('button'); if (!b) return 'SIN BOTON';
        if (!b.id) b.id = '__hfpepBtn'; return b.id })()`);
      A.boton = btnId;
      A.cartelAntes = await J('window.__H.cartel()');
      A.clicAbrir = (btnId === '__hfpepBtn') ? await clicEn(btnId) : { via: 'NO SE PUDO', por: btnId };
      await pausa(400);
      A.alAbrir = await J('window.__H.cartel()');
      A.tabTrasAbrir = await ev('window.__H.tabActiva()');
      /* ESCAPE. El oyente generico de accesibilidad busca el [role=dialog][aria-modal=true]
         visible mas alto y le clickea el boton cuyo texto u onclick matchea /cerrar|✕|close/,
         asi que un cartel con ese marcado cierra con Escape sin oyente propio. */
      await tecla('Escape', null);
      await pausa(400);
      A.trasEscape = await J('window.__H.cartel()');
      A.focoTrasEscape = await ev('window.__H.foco()');
      A.focoVolvioAlRenglon = await ev(`(function(){
        var c = document.getElementById('hfapeff-eco');
        var a = document.activeElement;
        return !!(c && a && c.contains(a) && a.tagName === 'BUTTON') })()`);
      A.focoVolvioAlBoton = A.focoVolvioAlRenglon;
      /* Reabrir y cerrar clickeando el FONDO del overlay. */
      /* ⚠️ EL ID SE VUELVE A RESOLVER EN CADA APERTURA, Y NO ES COSMETICO: `hfapeffLineaEco`
         reescribe el innerHTML del renglon al cerrar, asi que el <button> al que la sonda le
         habia puesto `__hfpepBtn` ya NO EXISTE. Con el id viejo, `clicEn` informaba
         «NO SE PUDO» y las tres escenas siguientes median con el cartel CERRADO: el Tab
         «se escapaba» de un dialogo que no estaba abierto. Un gesto que no ocurrio no es una
         medicion. */
      const rebtn = async () => ev(`(function(){
        var v = document.getElementById('hfapeff-eco'); if (!v) return 'SIN SPAN';
        var b = v.querySelector('button'); if (!b) return 'SIN BOTON';
        if (!b.id) b.id = '__hfpepBtn'; return b.id })()`);
      const b2 = await rebtn();
      A.botonTrasRepintar = b2;
      A.clicReabrir = (b2 === '__hfpepBtn') ? await clicEn(b2) : { via: 'NO SE PUDO', por: b2 };
      await pausa(350);
      A.reabierto = await J('window.__H.cartel()');
      const fondo = await J(`(window.__H.rect('modal-hfpep') || { err:'NO EXISTE' })`);
      if (fondo && !fondo.err && fondo.w > 0) {
        await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: fondo.x + 6, y: fondo.y + 6, button: 'left', clickCount: 1 }, sessionId);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: fondo.x + 6, y: fondo.y + 6, button: 'left', clickCount: 1 }, sessionId);
        await pausa(350);
      }
      A.clicFondo = fondo;
      A.trasClicFondo = await J('window.__H.cartel()');
      /* Y la trampa de Tab: con el cartel abierto, Tab no se escapa a la pagina de atras. */
      const b3 = await rebtn();
      A.clicReabrir2 = (b3 === '__hfpepBtn') ? await clicEn(b3) : { via: 'NO SE PUDO', por: b3 };
      await pausa(350);
      const focos = [];
      for (let i = 0; i < 6; i++) { await tecla('Tab', null); await pausa(80);
        focos.push(await ev('window.__H.foco()')); }
      A.tabRecorrido = focos;
      A.tabSeEscapo = focos.some(f => f && ['hf_ntprobnp','hf_bnp','hdr-med-btn'].indexOf(f) >= 0);
      await ev(`(function(){ try{ if (typeof hfPepCerrar === 'function') hfPepCerrar() }catch(e){}; return 1 })()`);
    } catch (x) { A.FALLO = String(x.message || x); }
    await J(`window.__H.planPoner('avanzado')`);
    out.A = A;
  }

  /* ══ S — SINCRONIA EN LOS DOS SENTIDOS, CON TECLAS REALES ═════════════════════════════════
     Escribir en el cartel aparece en Avanzado; escribir en Avanzado aparece en el cartel;
     borrar en uno borra en el otro. Y el control negativo: el campo del OTRO tipo no se toca. */
  if (hacer('S')) {
    const S = { escenas: [] };
    try {
      for (const tipo of ['nt', 'bnp']) {
        const campo = tipo === 'nt' ? 'hf_ntprobnp' : 'hf_bnp';
        const otro  = tipo === 'nt' ? 'hf_bnp' : 'hf_ntprobnp';
        const esc = { tipo, campo, otro };
        /* ── A) del CARTEL hacia AVANZADO ── */
        await base('basico');
        const btnId = await ev(`(function(){
          var v = document.getElementById('hfapeff-eco'); if (!v) return 'SIN SPAN';
          var b = v.querySelector('button'); if (!b) return 'SIN BOTON';
          if (!b.id) b.id = '__hfpepBtn'; return b.id })()`);
        esc.clicAbrir = (btnId === '__hfpepBtn') ? await clicEn(btnId) : { via: 'NO SE PUDO', por: btnId };
        await pausa(350);
        /* El TIPO se fija ANTES de tipear, que es la regla de esta casa para los <select>
           de escenario. Con teclas no se puede elegir una option: va por valor + change. */
        esc.ponerTipo = await ev(`(function(){
          var s = document.getElementById('hfpep-tipo');
          if (!s) return 'NO EXISTE hfpep-tipo';
          s.value = ${JSON.stringify(tipo)};
          s.dispatchEvent(new Event('change', { bubbles: true }));
          return s.value })()`);
        esc.tipeoEnCartel = await tipear('hfpep-val', '900');
        await pausa(250);
        esc.trasTipearEnCartel = {
          cartel: await J('window.__H.cartel()'),
          avanzado: await J('window.__H.avanzado()'),
          refs: await J('window.__H.refs()'),
          score: await J('window.__H.score(false)') };
        esc.OTRO_INTACTO = esc.trasTipearEnCartel.avanzado[tipo === 'nt' ? 'bnp' : 'nt'] === '';
        /* ── B) BORRAR en el cartel borra en Avanzado ── */
        esc.borradoEnCartel = await borrar('hfpep-val');
        await pausa(250);
        esc.trasBorrarEnCartel = {
          cartel: await J('window.__H.cartel()'),
          avanzado: await J('window.__H.avanzado()'),
          refs: await J('window.__H.refs()') };
        /* ── C) de AVANZADO hacia el CARTEL ──
           ⚠️ CON EL CARTEL CERRADO Y LA PUERTA DE AVANZADO ABIERTA. La primera version tipeaba
           con el cartel abierto encima y `tipear` ABORTO con «SIN GEOMETRIA hf_ntprobnp»: el
           campo dueno vive en la pestana Hemodinamica DENTRO de una tarjeta plegable, asi que
           sin abrir las dos puertas no tiene geometria y no se le puede mandar una tecla. */
        await ev(`(function(){ try{ if (typeof hfPepCerrar === 'function') hfPepCerrar() }catch(e){}; return 1 })()`);
        esc.puertaAvanzado = await J('window.__H.abrirAvanzado()');
        if (!esc.puertaAvanzado.ok) { esc.ABORTA_C = 'no se pudo abrir la puerta de Avanzado'; }
        esc.tipeoEnAvanzado = await tipear(campo, '450');
        await pausa(250);
        esc.trasTipearEnAvanzado_cartelCerrado = {
          avanzado: await J('window.__H.avanzado()'),
          cartelEspejo: await ev(`window.__H.val('hfpep-val')`) };
        /* Y al ABRIR el cartel tiene que MOSTRAR lo que ya estaba en Avanzado, que es
           textualmente lo que pide el punto (3) de la orden. */
        await ev(`window.__H.volverADoppler()`);
        await pausa(200);
        const bS = await ev(`(function(){
          var v = document.getElementById('hfapeff-eco'); if (!v) return 'SIN SPAN';
          var b = v.querySelector('button'); if (!b) return 'SIN BOTON';
          if (!b.id) b.id = '__hfpepBtn'; return b.id })()`);
        esc.clicAbrir2 = (bS === '__hfpepBtn') ? await clicEn(bS) : { via: 'NO SE PUDO', por: bS };
        await pausa(350);
        esc.cartelMuestraLoDeAvanzado = await J('window.__H.cartel()');
        /* ── C2) con el cartel ABIERTO, tipear en Avanzado espeja EN VIVO.
           ⚠️ HAY QUE PONER LA PESTANA DE AVANZADO DEBAJO DEL CARTEL, Y ESTA MEDIDO POR QUE. El
           cartel se abre desde el DOPPLER, asi que el campo dueno queda en una pestana en
           `display:none`: enfocar un nodo sin geometria FALLA EN SILENCIO y la primera version
           de esta escena abortaba con «el foco no llego a hf_ntprobnp». El cartel es un overlay
           `inset:0`, o sea que sigue a la vista con cualquier pestana debajo: se cambia de
           pestana SIN cerrarlo y el campo recupera geometria. El foco va por DOM —el overlay
           tapa el campo, asi que un clic de mouse se lo comeria el overlay— y las teclas son
           reales; se EXIGE que el foco haya llegado antes de mandarlas. */
        esc.vivo = await (async () => {
          const puerta = await J('window.__H.abrirAvanzado()');
          const cartelSigueAbierto = await ev(`window.__H.cartel().abierto`);
          if (!puerta.ok) return { ABORTA: 'sin geometria el campo dueno', puerta };
          const foco = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(campo)});
            if (!e) return 'NO EXISTE'; e.focus(); try{ e.select() }catch(x){}
            return (document.activeElement && document.activeElement.id) || '<?>' })()`);
          if (foco !== campo) return { ABORTA: 'el foco no llego a ' + campo, foco, puerta };
          for (const ch of '777') { await tecla(ch, ch); }
          await ev(`(function(){ var e=document.getElementById(${JSON.stringify(campo)});
            if(e) e.dispatchEvent(new Event('input',{bubbles:true})); return 1 })()`);
          await pausa(250);
          return { foco, puerta, cartelSigueAbierto,
                   avanzado: await J('window.__H.avanzado()'),
                   cartel: await J('window.__H.cartel()') };
        })();
        /* ── D) BORRAR en Avanzado borra en el cartel ── */
        await ev(`(function(){ try{ if (typeof hfPepCerrar === 'function') hfPepCerrar() }catch(e){}; return 1 })()`);
        esc.puertaAvanzado2 = await J('window.__H.abrirAvanzado()');
        esc.borradoEnAvanzado = await borrar(campo);
        await pausa(250);
        esc.trasBorrarEnAvanzado = { avanzado: await J('window.__H.avanzado()') };
        await ev(`window.__H.volverADoppler()`);
        await pausa(200);
        const bS2 = await ev(`(function(){
          var v = document.getElementById('hfapeff-eco'); if (!v) return 'SIN SPAN';
          var b = v.querySelector('button'); if (!b) return 'SIN BOTON';
          if (!b.id) b.id = '__hfpepBtn'; return b.id })()`);
        esc.clicAbrir3 = (bS2 === '__hfpepBtn') ? await clicEn(bS2) : { via: 'NO SE PUDO', por: bS2 };
        await pausa(350);
        esc.cartelTrasBorrarEnAvanzado = await J('window.__H.cartel()');
        await ev(`(function(){ try{ if (typeof hfPepCerrar === 'function') hfPepCerrar() }catch(e){}; return 1 })()`);
        S.escenas.push(esc);
      }
    } catch (x) { S.FALLO = String(x.message || x); }
    await J(`window.__H.planPoner('avanzado')`);
    out.S = S;
  }

  /* ══ B — LOS BORDES DE CADA CORTE, POR TIPO Y POR RITMO ════════════════════════════════════
     Cuatro cortes por ritmo (NT mayor, NT menor, BNP mayor, BNP menor) y tres valores por
     corte: ABAJO, EN EL CORTE y ARRIBA. Se mide `hum.pts` del dueno unico y ADEMAS el total
     del score y el texto del renglon de las referencias, que es lo que el medico ve.

     ⚠️ EL TIPEO VA SIEMPRE EN EL CAMPO DUENO DE AVANZADO, que existe en los DOS arboles. Contra
     HEAD el cartel no existe y tipear ahi no seria una medicion: el A/B tiene que comparar el
     MISMO gesto en los dos lados. La escena del cartel la cubre el grupo S. */
  if (hacer('B')) {
    const B = { filas: [] };
    const CASOS = [
      /* ritmo, tipo, campo, rotulo del corte, y los tres valores */
      ['rs', 'nt',  'hf_ntprobnp', 'NT mayor  (> 220)',   ['220', '221', '219']],
      ['rs', 'nt',  'hf_ntprobnp', 'NT menor  (125-220)', ['124', '125', '220']],
      ['rs', 'bnp', 'hf_bnp',      'BNP mayor (> 80)',    ['80',  '81',  '79']],
      ['rs', 'bnp', 'hf_bnp',      'BNP menor (35-80)',   ['34',  '35',  '80']],
      ['fa', 'nt',  'hf_ntprobnp', 'NT mayor  (> 660)',   ['660', '661', '659']],
      ['fa', 'nt',  'hf_ntprobnp', 'NT menor  (375-660)', ['374', '375', '660']],
      ['fa', 'bnp', 'hf_bnp',      'BNP mayor (> 240)',   ['240', '241', '239']],
      ['fa', 'bnp', 'hf_bnp',      'BNP menor (105-240)', ['104', '105', '240']],
    ];
    try {
      for (const [ritmo, tipo, campo, corte, vals] of CASOS) {
        for (const val of vals) {
          await base('avanzado');
          /* El RITMO se fija en el selector de la pestana Doppler —que es lo que la orden
             manda leer— y `hf_ritmo` se deja en 'auto', que es su valor de fabrica. */
          const pr = await ev(`(function(){
            var d = document.getElementById('diast_ritmo');
            var h = document.getElementById('hf_ritmo');
            if (h) { h.value = 'auto' }
            if (!d) return 'NO EXISTE diast_ritmo';
            d.value = ${JSON.stringify(ritmo === 'fa' ? 'fa' : 'sinusal')};
            d.dispatchEvent(new Event('change', { bubbles: true }));
            return d.value })()`);
          await pausa(200);
          /* ⚠️ HAY QUE ABRIR LA PUERTA DE AVANZADO ANTES DE TIPEAR, Y LA PRIMERA CORRIDA DE
             ESTA TABLA NO LA ABRIA: los 24 valores salieron con `humPts: 0` y el renglon
             identico en los dos arboles — una tabla de 24 filas que decia «ningun corte
             funciona» sobre cortes que funcionan. El tecleo habia ABORTADO con «SIN GEOMETRIA
             hf_ntprobnp» en las 24, que es lo correcto, y el lector no lo miraba. Es la trampa
             del denominador de este repo, otra vez. */
          const puerta = await J('window.__H.abrirAvanzado()');
          const tip = await tipear(campo, val);
          /* Y se vuelve al Doppler para leer el renglon de las referencias, que es donde vive. */
          await ev('window.__H.volverADoppler()');
          await pausa(250);
          B.filas.push({ ritmo, tipo, corte, valor: val, ponerRitmo: pr, puerta,
            ritmoEfectivo: await ev('window.__H.ritmoEfectivo()'),
            tecleo: tip,
            umbrales: await J(`window.__H.umbrales(${ritmo === 'fa'})`),
            hum: await J('window.__H.humCrit()'),
            score6: await J('window.__H.score(false)'),
            score4: await J('window.__H.score(true)'),
            refs: await J('window.__H.refs()') });
        }
      }
      /* CONTROL NEGATIVO: un valor por debajo del corte MENOR no suma nada, y el dominio
         humoral queda en cero con el dato CARGADO (que es distinto de no tener dato). */
      await base('avanzado');
      await ev(`(function(){ var d = document.getElementById('diast_ritmo');
        if (d) { d.value='sinusal'; d.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
      const puertaCN = await J('window.__H.abrirAvanzado()');
      const cn = await tipear('hf_ntprobnp', '50');
      await ev('window.__H.volverADoppler()');
      await pausa(250);
      B.controlNegativo = { puerta: puertaCN, tecleo: cn, hum: await J('window.__H.humCrit()'),
        score6: await J('window.__H.score(false)'), refs: await J('window.__H.refs()') };
    } catch (x) { B.FALLO = String(x.message || x); }
    out.B = B;
  }

  /* ══ R — CAMBIAR EL RITMO CON EL PEPTIDO CARGADO ═══════════════════════════════════════════
     El mismo valor tiene que cambiar de puntos al cambiar el selector de la pestana Doppler,
     porque los cortes de fibrilacion auricular son el triple. 450 pg/ml de NT-proBNP es
     criterio MAYOR en ritmo sinusal (> 220) y MENOR en fibrilacion (375-660). */
  if (hacer('R')) {
    const R = { pasos: [] };
    try {
      await base('basico');
      await ev(`(function(){ var h=document.getElementById('hf_ritmo'); if(h) h.value='auto';
        var d=document.getElementById('diast_ritmo');
        if (d) { d.value='sinusal'; d.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
      await pausa(200);
      /* ⚠️ EL VALOR SE CARGA POR EL CARTEL, que es el gesto que esta tanda agrega y el unico
         disponible con plan BASICO. Tipear en el campo dueno abortaria por falta de geometria
         —la tarjeta de Avanzado esta plegada—, que es lo que le paso a la primera corrida de
         este grupo: los tres pasos salieron con humPts 0 y el renglon identico, o sea una tabla
         que decia «el ritmo no mueve nada» sobre un peptido que nunca se cargo. */
      const btnR = await ev(`(function(){
        var v = document.getElementById('hfapeff-eco'); if (!v) return 'SIN SPAN';
        var b = v.querySelector('button'); if (!b) return 'SIN BOTON';
        if (!b.id) b.id = '__hfpepBtn'; return b.id })()`);
      R.clicAbrir = (btnR === '__hfpepBtn') ? await clicEn(btnR) : { via: 'NO SE PUDO', por: btnR };
      await pausa(350);
      /* 450 pg/ml de NT-proBNP es el valor que DISCRIMINA: criterio MAYOR en ritmo sinusal
         (> 220) y MENOR en fibrilacion auricular (375-660). Con un valor que cayera del mismo
         lado en los dos ritmos, el paso no probaria nada. */
      R.tecleo = await tipear('hfpep-val', '450');
      await pausa(300);
      R.cartelSinusal = await J('window.__H.cartel()');
      R.pasos.push({ paso: 'sinusal', ritmoEfectivo: await ev('window.__H.ritmoEfectivo()'),
        hum: await J('window.__H.humCrit()'), score6: await J('window.__H.score(false)'),
        refs: await J('window.__H.refs()'), avanzado: await J('window.__H.avanzado()'),
        cartelCorte: await ev(`window.__H.txt('hfpep-corte')`) });
      /* El cambio de ritmo va con un gesto real sobre el <select> de Doppler. */
      const pr = await ev(`(function(){ var d=document.getElementById('diast_ritmo');
        if (!d) return 'NO EXISTE'; d.value='fa';
        d.dispatchEvent(new Event('change',{bubbles:true})); return d.value })()`);
      await pausa(300);
      R.pasos.push({ paso: 'fa', ponerRitmo: pr, ritmoEfectivo: await ev('window.__H.ritmoEfectivo()'),
        hum: await J('window.__H.humCrit()'), score6: await J('window.__H.score(false)'),
        refs: await J('window.__H.refs()'), avanzado: await J('window.__H.avanzado()'),
        cartelCorte: await ev(`window.__H.txt('hfpep-corte')`) });
      /* Y de vuelta, para que el cambio se vea en los dos sentidos. */
      await ev(`(function(){ var d=document.getElementById('diast_ritmo');
        if (d) { d.value='sinusal'; d.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
      await pausa(300);
      R.pasos.push({ paso: 'sinusal-vuelta', ritmoEfectivo: await ev('window.__H.ritmoEfectivo()'),
        hum: await J('window.__H.humCrit()'), score6: await J('window.__H.score(false)'),
        refs: await J('window.__H.refs()'), avanzado: await J('window.__H.avanzado()'),
        cartelCorte: await ev(`window.__H.txt('hfpep-corte')`) });
    } catch (x) { R.FALLO = String(x.message || x); }
    out.R = R;
  }

  /* ══ V — SIN PEPTIDO CARGADO ═══════════════════════════════════════════════════════════════
     Lo que el punto (7) de la orden exige IDENTICO a HEAD. Se mide en los dos ritmos y en los
     dos estados del renglon: con los dos dominios de eco en 4/4 y con un solo criterio. */
  if (hacer('V')) {
    const V = { escenas: [] };
    try {
      for (const ritmo of ['sinusal', 'fa']) {
        /* (a) paciente completo de eco, sin peptido */
        await base('avanzado');
        await ev(`(function(){ var h=document.getElementById('hf_ritmo'); if(h) h.value='auto';
          var d=document.getElementById('diast_ritmo');
          if (d) { d.value=${JSON.stringify(ritmo)}; d.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
        await pausa(250);
        V.escenas.push({ escena: 'eco completo sin peptido', ritmo,
          refs: await J('window.__H.refs()'),
          score4: await J('window.__H.score(true)'), score6: await J('window.__H.score(false)'),
          hum: await J('window.__H.humCrit()'),
          informe: await J(`window.__H.informe('completo')`),
          diastolica: await J('window.__H.diastolica()') });
        /* (b) formulario VACIO: el renglon tiene que estar escondido */
        await despejar();
        await ev(`window.__H.limpiar()`);
        await ev(`try{ showTab('doppler') }catch(e){}; 1`);
        await pausa(250);
        V.escenas.push({ escena: 'formulario vacio', ritmo,
          refs: await J('window.__H.refs()'),
          score4: await J('window.__H.score(true)'), score6: await J('window.__H.score(false)'),
          cartel: await J('window.__H.cartel()') });
      }
    } catch (x) { V.FALLO = String(x.message || x); }
    out.V = V;
  }

  /* ══ G — GUARDADO, REAPERTURA Y «Nuevo estudio» ════════════════════════════════════════════
     El dato tiene que viajar con el estudio IGUAL QUE HOY: el dueno es `hf_ntprobnp`/`hf_bnp`,
     y los campos del cartel NO son del estudio (su prefijo los excluye del recolector), para
     que no quede una segunda copia del peptido que pueda contradecir al dueno. */
  if (hacer('G')) {
    const G = {};
    try {
      await base('basico');
      /* ⚠️ EL PEPTIDO SE CARGA DESDE EL CARTEL Y NO DESDE AVANZADO, y eso es a proposito: el
         campo dueno no tiene geometria con la tarjeta plegada (la primera version de esta
         escena abortaba con «SIN GEOMETRIA hf_ntprobnp», que es lo correcto) y, sobre todo,
         cargarlo desde el cartel es el gesto que esta tanda agrega y el unico disponible con
         plan BASICO. Que el dato quede en el DUENO es justamente lo que la escena mide. */
      const btnId = await ev(`(function(){
        var v = document.getElementById('hfapeff-eco'); if (!v) return 'SIN SPAN';
        var b = v.querySelector('button'); if (!b) return 'SIN BOTON';
        if (!b.id) b.id = '__hfpepBtn'; return b.id })()`);
      G.clicAbrir = (btnId === '__hfpepBtn') ? await clicEn(btnId) : { via: 'NO SE PUDO', por: btnId };
      await pausa(350);
      G.tecleo = await tipear('hfpep-val', '900');
      await pausa(300);
      G.cartelAbierto = await J('window.__H.cartel()');
      G.fotoGuardado = await J('window.__H.guardarFoto()');
      /* ⚠️ EL MODULO INTEGRADO ES PARTE DE ESTA ESCENA, y no es un extra: `amiloIntegrar`
         genera el texto de la hoja del PDF y `amiloRefrescarSiIntacto` lo regenera desde el
         oyente de documento. Si algo de esa cadena TIRA, el modulo se retira solo y el texto
         se pierde — que es el defecto que TC-GR-06 vigila. */
      G.integrar = await ev(`(function(){
        try { amiloIntegrar('hfpeff') } catch(e) { return 'EXC: ' + e.message }
        return { integrado: (typeof amiloIntegrado === 'function') ? amiloIntegrado('hfpeff') : null,
                 largo: ((document.getElementById('am-txt-hfpeff')||{}).value || '').length } })()`);
      await ev(`(function(){ var e=document.getElementById('edad');
        if (e) { e.value='74'; e.dispatchEvent(new Event('input',{bubbles:true})) } return 1 })()`);
      await pausa(300);
      G.trasEventoConIntegrado = await ev(`(function(){
        return { integrado: (typeof amiloIntegrado === 'function') ? amiloIntegrado('hfpeff') : null,
                 largo: ((document.getElementById('am-txt-hfpeff')||{}).value || '').length,
                 err: window.__hfpepErr || null } })()`);
      await ev(`(function(){ try{ if (typeof hfPepCerrar === 'function') hfPepCerrar() }catch(e){}; return 1 })()`);
      /* Reapertura: se repone por el MISMO camino que las rutas de restauracion —asignar
         `.value` y pasar por el embudo de RECALC_MODULOS—, que es lo que no dispara ningun
         evento y por lo que las sincronias tienen que estar en ese embudo. */
      const snap = await J(`(function(){ var c = window.__H.campos(); return c })()`);
      await ev(`window.__H.limpiar()`);
      await pausa(200);
      G.trasNuevoEstudio = { avanzado: await J('window.__H.avanzado()'),
        cartel: await J('window.__H.cartel()'), refs: await J('window.__H.refs()') };
      G.reponer = await J(`(function(){
        var c = ${JSON.stringify(snap)};
        Object.keys(c).forEach(function(k){
          if (/__chk$/.test(k)) return;
          var e = document.getElementById(k);
          if (e && e.tagName !== 'BUTTON') { try { e.value = c[k] } catch(x) {} }
        });
        try { if (typeof _recalcModulos === 'function') _recalcModulos('sonda') } catch(x) {}
        try { if (typeof hfapeffLineaEco === 'function') hfapeffLineaEco() } catch(x) {}
        try { if (typeof hfapeffRender === 'function') hfapeffRender() } catch(x) {}
        return { repuestos: Object.keys(c).length } })()`);
      await pausa(300);
      G.trasReabrir = { avanzado: await J('window.__H.avanzado()'),
        cartel: await J('window.__H.cartel()'), refs: await J('window.__H.refs()'),
        score6: await J('window.__H.score(false)') };
      /* Y con el cartel reabierto el valor del estudio tiene que estar a la vista. */
      const btn2 = await ev(`(function(){
        var v = document.getElementById('hfapeff-eco'); if (!v) return 'SIN SPAN';
        var b = v.querySelector('button'); if (!b) return 'SIN BOTON';
        if (!b.id) b.id = '__hfpepBtn'; return b.id })()`);
      G.clicReabrirCartel = (btn2 === '__hfpepBtn') ? await clicEn(btn2) : { via: 'NO SE PUDO', por: btn2 };
      await pausa(350);
      G.cartelConValorDelEstudio = await J('window.__H.cartel()');
      await ev(`(function(){ try{ if (typeof hfPepCerrar === 'function') hfPepCerrar() }catch(e){}; return 1 })()`);
    } catch (x) { G.FALLO = String(x.message || x); }
    out.G = G;
  }

  /* ══ W — ANCHO Y TEMA ══════════════════════════════════════════════════════════════════════
     1200, 390 y 360 px en los dos temas. Se mide la geometria del cartel: que no desborde el
     viewport, que el campo del valor tenga altura tactil y que el texto no se renderice por
     debajo del piso de 11 px que esta casa se fijo. */
  if (hacer('W')) {
    const W = { celdas: [] };
    try {
      for (const tema of ['dark', 'light']) {
        for (const ancho of [1200, 390, 360]) {
          await cdp.send('Emulation.setDeviceMetricsOverride',
            { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 768 }, sessionId);
          await pausa(250);
          /* ⚠️ EL TEMA DE ESTA APP ES LA CLASE `light-mode` SOBRE documentElement, NO un
             `data-theme`. La primera version de este grupo escribia `data-theme` y no hacia
             NADA: las capturas de tema claro y de tema oscuro salieron IDENTICAS byte por byte
             a 390 y 360 px, que es la firma de que el cambio nunca ocurrio, y las seis celdas
             midieron el MISMO tema. Un barrido de dos temas que mide uno solo no es un barrido
             de dos temas. Se verifica que la clase quedo puesta y se informa al lado. */
          const temaPuesto = await ev(`(function(){
            var r = document.documentElement;
            if (${JSON.stringify(tema)} === 'light') r.classList.add('light-mode');
            else r.classList.remove('light-mode');
            return r.classList.contains('light-mode') ? 'light' : 'dark' })()`);
          if (temaPuesto !== tema) throw new Error('el tema no quedo puesto: pedi ' + tema + ' y quedo ' + temaPuesto);
          await base('basico');
          const btnId = await ev(`(function(){
            var v = document.getElementById('hfapeff-eco'); if (!v) return 'SIN SPAN';
            var b = v.querySelector('button'); if (!b) return 'SIN BOTON';
            if (!b.id) b.id = '__hfpepBtn'; return b.id })()`);
          const clic = (btnId === '__hfpepBtn') ? await clicEn(btnId) : { via: 'NO SE PUDO', por: btnId };
          await pausa(400);
          const c = await J('window.__H.cartel()');
          const geo = await J(`(function(){
            var caja = document.getElementById('hfpep-caja');
            var val  = document.getElementById('hfpep-val');
            var tipo = document.getElementById('hfpep-tipo');
            var corte= document.getElementById('hfpep-corte');
            var g = function(e){ if (!e) return null; var r = e.getBoundingClientRect();
              var s = getComputedStyle(e);
              return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width),
                       h: Math.round(r.height), fs: parseFloat(s.fontSize) } };
            /* ⚠️ EL PISO TACTIL SE MIDE CONTRA LOS CAMPOS DE LA PROPIA APP, NO CONTRA UN
               NUMERO ELEGIDO POR MI. El chequeo de celular no ve este cartel —sus campos no
               tienen geometria hasta que se abre, y esa herramienta abre pestanas y
               secciones, no modales—, asi que lo que se exige es que el campo del cartel
               mida LO MISMO que un campo de formulario cualquiera de la app al mismo ancho.
               El campo onda_e vive en el Doppler y esta visible a los tres anchos. */
            var ref = document.getElementById('onda_e');
            var sel = document.getElementById('diast_ritmo');
            return { caja: g(caja), val: g(val), tipo: g(tipo), corte: g(corte),
                     refApp: g(ref), refAppSelect: g(sel),
                     vw: window.innerWidth, vh: window.innerHeight,
                     scrollW: document.documentElement.scrollWidth } })()`);
          /* CAPTURA del cartel en los dos temas, DEL VIEWPORT ENTERO y sin `clip`.
             ⚠️ EL `clip` SACADO DE getBoundingClientRect NO COINCIDE CON LO QUE SE DIBUJA, y esta
             medido: con el recorte puesto en la caja del cartel, la imagen de 1200 px salio
             corrida ~160 px —mostraba los campos del Doppler de arriba y cortaba el cartel por
             abajo— y las de 390 y 360 salieron PLANAS, con el mismo tamano de archivo byte por
             byte en tema claro y en oscuro, que es la firma de una imagen vacia. El rect es del
             viewport de LAYOUT y el recorte se interpreta sobre el visual, que con la emulacion
             de movil no son el mismo. Sin `clip` no hay nada que alinear: el cartel es un
             overlay centrado y entra entero. La geometria se mide aparte, con numeros. */
          let png = null;
          if (CAPTURA) {
            try {
              const r = await cdp.send('Page.captureScreenshot',
                { format: 'png', captureBeyondViewport: false }, sessionId);
              const buf = Buffer.from(r.data, 'base64');
              const f = join(tmpdir(), `hfpep-${tema}-${ancho}.png`);
              await writeFile(f, buf);
              png = { archivo: f, bytes: buf.length };
            } catch (x) { png = { err: String(x.message || x) }; }
          }
          W.celdas.push({ tema, temaPuesto, ancho, boton: btnId, clic, cartel: c, geo, png,
            DESBORDA: !!(geo && geo.caja && (geo.caja.x < 0 || geo.caja.x + geo.caja.w > geo.vw + 1)),
            MISMA_ALTURA_QUE_LA_APP: !!(geo && geo.val && geo.refApp && geo.val.h === geo.refApp.h),
            TEXTO_OK: !!(geo && geo.corte && geo.corte.fs >= 11) });
          await ev(`(function(){ try{ if (typeof hfPepCerrar === 'function') hfPepCerrar() }catch(e){}; return 1 })()`);
        }
      }
    } catch (x) { W.FALLO = String(x.message || x); }
    try { await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId); } catch {}
    await ev(`(function(){ document.documentElement.classList.remove('light-mode'); return 1 })()`);
    await J(`window.__H.planPoner('avanzado')`);
    out.W = W;
  }

  /* ══ N — CONTROL NEGATIVO MAYOR ════════════════════════════════════════════════════════════
     Con el escenario CARGADO —para que el control tenga DENOMINADOR— y con el peptido puesto:
     funcion diastolica, las ocho valvulas, el Excel con sus columnas y su hash, y el informe
     en los tres estilos tienen que ser IDENTICOS a HEAD.
     ⚠️ El hash del Excel se compara SIN descontar nada a proposito: si esta tanda no agrega
     ninguna columna, tiene que coincidir byte por byte. Y los campos guardados se cuentan
     DESCONTANDO los dos ids del cartel, que son nuevos y no son del estudio. */
  if (hacer('N')) {
    const N = {};
    try {
      await base('avanzado');
      /* Un escenario con valvulas y diastolica cargadas, mas el peptido. */
      N.escenario = await J(`(function(){
        var r = {};
        [['vmax_ao','4.5'],['gmedio_ao','45'],['im_vc','0.8'],['ia_vc','0.4'],
         ['it_vmax_cw','3.2'],['avm_plan','1.2'],['onda_a','60'],['tde','180'],['triv','90'],
         ['e_sep','5'],['e_lat','7'],['onda_e','110'],['ai_vol','80'],
         ['edad','70'],['sexo','M'],['peso','70'],['talla','170'],['fevi','60']].forEach(function(p){
          r[p[0]] = window.__H.set(p[0], p[1]) });
        try { if (typeof calcBSA === 'function') calcBSA() } catch(e) {}
        try { if (typeof calcDiastol === 'function') calcDiastol() } catch(e) {}
        return r })()`);
      await pausa(400);
      /* La puerta de Avanzado, por lo mismo que en los grupos B y R: sin ella el tecleo
         ABORTA y el control negativo mediria un escenario SIN peptido, o sea el control mas
         facil de pasar y el que no prueba nada. */
      N.puerta = await J('window.__H.abrirAvanzado()');
      N.tecleoPeptido = await tipear('hf_ntprobnp', '900');
      await ev('window.__H.volverADoppler()');
      await pausa(400);
      N.diastolica = await J('window.__H.diastolica()');
      N.valvulas = await J('window.__H.valvulas()');
      N.excelCols = await ev(`(function(){ var f = window.__H.excel();
        return (f && typeof f === 'object') ? Object.keys(f).length : f })()`);
      N.excelHash = await ev(`(function(){ var f = window.__H.excel();
        if (!f || typeof f !== 'object') return f;
        return Object.keys(f).sort().map(function(k){ return k + '=' + f[k] }).join('|') })()`);
      N.camposTotal = await ev(`(function(){ return Object.keys(window.__H.campos()).length })()`);
      N.camposSinCartel = await ev(`(function(){
        var c = window.__H.campos();
        return Object.keys(c).filter(function(k){ return k.indexOf('hfpep-') !== 0 }).length })()`);
      N.camposHashSinCartel = await ev(`(function(){
        var c = window.__H.campos();
        return Object.keys(c).filter(function(k){ return k.indexOf('hfpep-') !== 0 })
          .filter(function(k){ return k !== 'informe_texto' && k !== 'en_suma' })
          .sort().map(function(k){ return k + '=' + c[k] }).join('|') })()`);
      N.informes = {};
      for (const est of ['completo', 'intermedio', 'breve']) {
        try { N.informes[est] = await J(`window.__H.informe(${JSON.stringify(est)})`); }
        catch (x) { N.informes[est] = 'EXC: ' + String(x.message || x); }
      }
    } catch (x) { N.FALLO = String(x.message || x); }
    out.N = N;
  }

  /* ══ X — OTROS BOTONES QUE LLEVAN A AVANZADO SIN CHEQUEAR EL PLAN ══════════════════════════
     Censo, de SOLO LECTURA: todo lo que llame a showTab con una pestana gateada por data-mod,
     y si ese control esta o no gateado el mismo. Es el punto (6) de la orden: se REPORTA. */
  if (hacer('X')) {
    const X = {};
    try {
      X.censo = await J(`(function(){
        var MODS = {};
        document.querySelectorAll('button[data-mod]').forEach(function(b){
          MODS[b.getAttribute('data-mod')] = true });
        /* Las pestanas que el plan basico esconde: las que tienen un boton con data-mod. */
        var tabsGateadas = [];
        document.querySelectorAll('button[data-mod]').forEach(function(b){
          var m = (b.getAttribute('onclick') || '').match(/showTab\\('([^']+)'\\)/);
          if (m) tabsGateadas.push(m[1]) });
        var res = [];
        document.querySelectorAll('[onclick]').forEach(function(el){
          var oc = el.getAttribute('onclick') || '';
          var m = oc.match(/showTab\\('([^']+)'\\)/g) || [];
          m.forEach(function(s){
            var tab = s.match(/showTab\\('([^']+)'\\)/)[1];
            if (tabsGateadas.indexOf(tab) < 0) return;
            res.push({ tab: tab, tag: el.tagName.toLowerCase(), id: el.id || null,
                       texto: (el.textContent || '').trim().slice(0, 40),
                       tieneDataMod: el.hasAttribute('data-mod'),
                       esDelRail: el.classList.contains('tab-btn') });
          });
        });
        return { tabsGateadas: tabsGateadas, controles: res,
                 sinGate: res.filter(function(r){ return !r.tieneDataMod && !r.esDelRail }) } })()`);
      /* Y la razon de fondo: showTab no chequea el plan. Se mide, no se afirma. */
      X.showTabChequeaPlan = await ev(`(function(){
        if (typeof showTab !== 'function') return 'SIN showTab';
        var s = String(showTab);
        return { nombraEeGetMode: s.indexOf('eeGetMode') >= 0,
                 nombraViewMode: s.indexOf('ett_view_mode') >= 0,
                 nombraEeModOn: s.indexOf('eeModOn') >= 0,
                 nombraApplyViewMode: s.indexOf('applyViewMode') >= 0 } })()`);
      /* Y que el panel de una pestana avanzada sigue en el DOM con el plan basico: es lo que
         hace que activarlo por codigo baste para entrar. */
      await J(`window.__H.planPoner('basico')`);
      X.conPlanBasico = await J(`(function(){
        return { panelHemoExiste: window.__H.existe('tab-hemodinamica'),
                 panelHemoDisplay: window.__H.disp('tab-hemodinamica'),
                 botonRail: window.__H.planFoto() } })()`);
      await J(`window.__H.planPoner('avanzado')`);
    } catch (x) { X.FALLO = String(x.message || x); }
    out.X = X;
  }

  /* ⚠️ UNA EXCEPCION TRAGADA POR UN try/catch NO SE VE EN NINGUNA ESCENA, y en este repo una
     que corra dentro del oyente de documento se lleva por delante lo que viene DESPUES en ese
     oyente. La sonda la publica para que no quede muda. */
  /* ══ Q — LO QUE EL PUNTAJE HACE HOY CON FEVI < 50 % Y CON UN RITMO QUE NO ES NINGUNO DE LOS
     DOS ═══ Es el punto (8) de la orden: se MIDE y se reporta, no se cambia. */
  if (hacer('Q')) {
    const Q = {};
    try {
      /* (a) FEVI por debajo de 50, con el peptido cargado y los dos dominios de eco positivos. */
      Q.fevi = [];
      for (const fevi of ['60', '50', '49', '35']) {
        await base('avanzado');
        await ev(`window.__H.set('fevi', ${JSON.stringify(fevi)})`);
        const puerta = await J('window.__H.abrirAvanzado()');
        const tip = await tipear('hf_ntprobnp', '900');
        await ev('window.__H.volverADoppler()');
        await pausa(300);
        Q.fevi.push({ fevi, puertaOk: puerta.ok, tecleo: tip,
          score: await J('window.__H.score(false)'),
          refs: await J('window.__H.refs()'),
          humPts: (await J('window.__H.humCrit()')).pts });
      }
      /* (b) UN RITMO QUE NO ES SINUSAL NI FIBRILACION. El selector del Doppler SOLO ofrece esas
         dos opciones, asi que el estado no es alcanzable con un gesto: se llega inyectando un
         token ajeno, que es lo que haria un estudio guardado con otro vocabulario o una
         reimportacion. Se mide el selector, lo que devuelve el dueno del ritmo y los cortes. */
      Q.ritmoAjeno = {};
      await base('avanzado');
      Q.ritmoAjeno.opcionesDoppler = await J(`(function(){
        var d = document.getElementById('diast_ritmo');
        if (!d) return 'NO EXISTE';
        return Array.prototype.map.call(d.options, function(o){ return o.value }) })()`);
      Q.ritmoAjeno.opcionesScore = await J(`(function(){
        var h = document.getElementById('hf_ritmo');
        if (!h) return 'NO EXISTE';
        return Array.prototype.map.call(h.options, function(o){ return o.value }) })()`);
      Q.ritmoAjeno.tokens = [];
      for (const tok of ['sinusal', 'fa', 'flutter', '']) {
        await ev(`(function(){
          var d = document.getElementById('diast_ritmo');
          var h = document.getElementById('hf_ritmo');
          if (h) h.value = 'auto';
          if (d) { d.value = ${JSON.stringify(tok)};
                   d.dispatchEvent(new Event('change', { bubbles: true })) }
          return 1 })()`);
        await pausa(250);
        Q.ritmoAjeno.tokens.push({ token: tok,
          valorQueQuedo: await ev(`window.__H.val('diast_ritmo')`),
          selectedIndex: await ev(`(function(){ var d=document.getElementById('diast_ritmo');
            return d ? d.selectedIndex : null })()`),
          ritmoEfectivo: await ev('window.__H.ritmoEfectivo()'),
          umbrales: await J('window.__H.umbrales(window.__H.ritmoEfectivo() === "fa")'),
          cartelRitmo: await ev(`(function(){ return (typeof hfPepRitmoTxt === 'function')
            ? hfPepRitmoTxt() : 'NO EXISTE' })()`) });
      }
    } catch (x) { Q.FALLO = String(x.message || x); }
    out.Q = Q;
  }

  out.errorCartel = await ev('window.__hfpepErr || null');
  out.md5_antes = antes;
  out.md5_despues = await md5(join(RAIZ, 'index.html'));
  out.index_intacto = out.md5_antes === out.md5_despues;
  console.log(JSON.stringify(out, null, 2));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
