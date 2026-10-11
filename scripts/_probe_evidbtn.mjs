#!/usr/bin/env node
/**
 * _probe_evidbtn.mjs — sonda A/B de SOLO LECTURA para EL ESTADO DEL BOTON «Evidencia».
 *
 * Mide que el boton este SIEMPRE visible y que su color siga a `indicHayCriterios()`, que es la
 * MISMA funcion que corre el panel. Infraestructura calcada de scripts/_probe_evidmarco.mjs
 * (teclas y clics reales, cierre del arbol de Chrome por GRUPO, reloj sobre ev(), cierre del
 * aviso legal con su denominador, md5 al principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_evidbtn.mjs --file /tmp/index.HEAD.html > /tmp/btn.HEAD.json
 *   node scripts/_probe_evidbtn.mjs                             > /tmp/btn.NEW.json
 *
 * Grupos (--solo estados|temas|maqueta|rutas|abrir):
 *   estados  — vacio / estenosis mitral / estenosis aortica / vacio otra vez. Para CADA escena:
 *              visible, clases, fondo computado, aria-label, title, `indicHayCriterios()` y el
 *              numero REAL de secciones que pinta el panel. El veredicto es la COINCIDENCIA.
 *   temas    — el mismo par de estados en tema oscuro y claro: el fondo del azul tiene que ser
 *              `--accent` de cada tema y no un hex propio.
 *   maqueta  — 1200 / 390 / 360 px: el boton tiene geometria y llega al piso tactil de 44 px.
 *   rutas    — los enganches: «Nuevo estudio» (limpiarCampos) y la restauracion de un estudio
 *              guardado por el MISMO barrido que usa guardarInforme + `_recalcModulos`. Con su
 *              CONTROL NEGATIVO: reponer los campos SIN pasar por el embudo deja el boton como
 *              estaba, que es lo que prueba que el enganche es lo que lo mueve.
 *   abrir     — un clic REAL en el boton GRIS: el panel abre y muestra el mensaje que ya existe.
 *
 * ⚠️ DENOMINADOR. Un conteo de secciones sobre un panel que no abrio da cero y «coincide» con un
 * boton gris por casualidad. Todas las escenas informan cuantas secciones vieron y si el overlay
 * estaba visible; un cero ahi invalida la escena, no la aprueba.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/* ⚠️ EL ARBOL DE CHROME NO SE CIERRA CON `proc.kill()` — ver el comentario largo de
   _probe_emevid.mjs. Tres piezas: `detached:true`, matar el GRUPO (`-pid`), y colgar el barrido de
   `exit` ademas de las senales (el `process.exit` del camino de fallo no dispara SIGTERM).
   ⚠️ SOLO PIDs PROPIOS, NUNCA POR NOMBRE: un `pkill` se lleva el Chrome del usuario. */
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
const EXTERNO = isAbsolute(FARG);
const FILE = EXTERNO ? '__ab__' + basename(FARG) : FARG;
const SOLO = arg('--solo');
const hacer = (g) => !SOLO || SOLO.split(',').indexOf(g) > -1;

const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml',
               '.woff2':'font/woff2' };

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-btn-'));
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
    let id = 0; const pend = new Map(); let api = null;
    ws.addEventListener('open', () => { api = {
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }; res(api); });
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Page.javascriptDialogOpening' && api && api.alDialogo) {
        try { api.alDialogo({ tipo: m.params?.type, mensaje: m.params?.message }); } catch (x) {}
      }
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}
async function md5(p) { return createHash('md5').update(await readFile(p)).digest('hex'); }

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios.
   (scripts/check_backticks.py da la linea exacta cuando se cuela uno.) */

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios.
   (scripts/check_backticks.py da la linea exacta cuando se cuela uno.) */
const SONDA = `
window.__B = {
  norm(s) { return String(s || '').replace(/\\s+/g, ' ').trim() },
  btn()   { return document.getElementById('indic-btn') },
  cuerpo(){ return document.getElementById('indic-cuerpo') },

  /* ⚠️ EL ESTADO SE LEE DE LAS TRES SUPERFICIES A LA VEZ, y hace falta. La CLASE dice lo que el
     codigo quiso; el FONDO COMPUTADO dice lo que el navegador pinta —una clase que pierde contra
     otra regla se lee como un arreglo aplicado, que es el falso que esta app ya pago con el
     radio del boton del panel—; y la ETIQUETA dice lo que oye un lector de pantalla. Un veredicto
     sobre una sola de las tres no distingue «azul» de «dice que es azul». */
  estado() {
    var b = window.__B.btn();
    if (!b) return { existe: false };
    var cs = getComputedStyle(b);
    var r = b.getBoundingClientRect();
    return { existe: true,
      visible: b.offsetWidth > 0 && b.offsetHeight > 0,
      hidden: b.hasAttribute('hidden'),
      clases: b.className,
      primary: b.classList.contains('btn-primary'),
      ghost: b.classList.contains('btn-ghost'),
      /* Las dos a la vez es el estado en que el fondo lo decide el orden de la hoja. */
      ambas: b.classList.contains('btn-primary') && b.classList.contains('btn-ghost'),
      bg: cs.backgroundColor, fg: cs.color, borde: cs.borderTopColor,
      w: Math.round(r.width), h: Math.round(r.height),
      label: b.getAttribute('aria-label'), title: b.getAttribute('title'),
      txt: window.__B.norm(b.textContent) } },

  /* El valor que la hoja le da a --accent en el tema vigente. Es con lo que hay que comparar el
     fondo del azul: si coincide, el boton no tiene un hex propio. */
  accent() { return window.__B.norm(getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')) },
  bg3()    { return window.__B.norm(getComputedStyle(document.documentElement)
    .getPropertyValue('--bg3')) },

  hay() { try { return !!indicHayCriterios() } catch (e) { return 'EXC: ' + e.message } },

  /* ⚠️ EL DENOMINADOR DEL VEREDICTO. El panel se pinta de verdad y se cuentan sus secciones:
     comparar el color contra indicHayCriterios() solo compara la compuerta consigo misma.
     Se deja el panel COMO ESTABA (cerrado) para no cambiar la escena siguiente. */
  nSecs() {
    var estaba = window.__B.overlay();
    try { indicRender() } catch (e) { return 'EXC: ' + e.message }
    var c = window.__B.cuerpo();
    var n = c ? c.querySelectorAll(':scope > details').length : -1;
    var vacio = c ? /Sin criterios de intervenci/.test(c.textContent) : null;
    return { n: n, mensajeVacio: vacio, overlayAntes: estaba } },

  overlay() { var ov = document.getElementById('indic-overlay');
    return ov ? getComputedStyle(ov).display : 'NO EXISTE' },

  mensajePanel() { var c = window.__B.cuerpo();
    return c ? window.__B.norm(c.textContent).slice(0, 170) : null },

  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.className },

  /* ⚠️ HAY QUE IR A LA PESTANA DEL BOTON ANTES DE MEDIR, Y SIN ESTO LA SONDA MINTIO. El boton
     vive en #tab-informe, que nace en display:none: la primera corrida informo visible=false y
     h=0 en LAS CUATRO escenas —o sea «el boton no se ve» con el color ya correcto al lado— y el
     veredicto de coincidencia pasaba igual porque compara el COLOR, no la geometria. Es la misma
     trampa que este repo ya documenta para la pasada de celular: lo que esta en display:none no
     tiene geometria, asi que un barrido sobre la app cerrada da cero y parece impecable.
     Se verifica que la pestana quedo abierta y se devuelve el display computado del contenedor:
     si no es block, la escena no vale. */
  irAlInforme() {
    try { if (typeof showTab === 'function') showTab('informe') } catch (e) { return 'EXC: ' + e.message }
    var t = document.getElementById('tab-informe');
    return t ? getComputedStyle(t).display : 'NO EXISTE #tab-informe' },

  limpiar() { try { limpiarCampos(true) } catch (e) { return 'EXC: ' + e.message } return 1 },
  set(id, valor) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return 1 },

  /* El blob de un estudio guardado, por el MISMO barrido que usa guardarInforme. */
  capturar() {
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch (e) {}
      campos[el.id] = el.value });
    return campos },

  /* Reponer COMO LO HACE UNA RUTA DE RESTAURACION: asignando .value, que NO dispara ningun
     evento —asi que el debounce de «input» no se entera— y DESPUES el embudo. El parametro
     «embudo» existe para el control negativo: sin el, el boton tiene que quedar como estaba. */
  reponer(campos, embudo) {
    try { limpiarCampos(true) } catch (e) {}
    try { if (typeof _migrarCamposLegacy === 'function') _migrarCamposLegacy(campos) } catch (e) {}
    Object.keys(campos).forEach(function(k){
      var el = document.getElementById(k); if (el) el.value = campos[k] });
    if (embudo) { try { _recalcModulos('editarInforme') } catch (e) { return 'EXC: ' + e.message } }
    return 1 },

  /* ⚠️ LA GEOMETRIA SE MIDE **ANTES** DE SCROLLEAR. Un nodo sin geometria devuelve ceros, pero
     tras un scrollIntoView Chrome devuelve una posicion PLAUSIBLE de algo que nadie puede tocar:
     el clic cae fuera del viewport, el respaldo por tecla manda Enter al documento y la corrida
     se cuelga. Es la trampa que _probe_evidmarco.mjs ya documenta. */
  centroSel(sel) {
    var e = document.querySelector(sel); if (!e) return { err: 'no existe ' + sel };
    var r0 = e.getBoundingClientRect();
    if (r0.width === 0 || r0.height === 0) return { err: 'nodo sin geometria' };
    e.scrollIntoView({ block: 'center', inline: 'nearest' });
    var r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'nodo sin geometria tras scrollear' };
    if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth)
      return { err: 'nodo fuera del viewport tras scrollear',
               rect: [Math.round(r.top), Math.round(r.left)], win: [innerWidth, innerHeight] };
    var x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
    var q = document.elementFromPoint(x, y);
    return { x: x, y: y, esElBlanco: q === e || (e.contains && e.contains(q)),
      quien: q ? (q.tagName.toLowerCase() + (q.id ? '#' + q.id : '')) : null } },

  focoAhora() { var a = document.activeElement;
    return a ? { tag: a.tagName.toLowerCase(), id: a.id || null,
      label: a.getAttribute ? a.getAttribute('aria-label') : null } : null }
};
1;
`;

/* Los dos pacientes de una sola lesion: lo mas chico que cruza UNA compuerta, para que
   «enciende» no se confunda con «enciende por otra cosa». Medidos uno por uno. */
const PAC_EM = { avm_plan: '1.2', em_grado: 'severa' };
const PAC_EA = { ava_cont: '0.9', gmedio_ao: '46', vmax_ao: '4.3', fevi: '58', ea_grado: 'severa' };
/* Los ids que hay que vaciar entre escenas. Es la union de los dos pacientes. */
const LIMPIAR = Object.keys(PAC_EM).concat(Object.keys(PAC_EA));

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  const dialogos = [];
  cdp.alDialogo = (d) => { dialogos.push(d);
    cdp.send('Page.handleJavaScriptDialog', { accept: true }, sessionId).catch(() => {}); };
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  await pausa(2200);

  const RELOJ = 75000;
  let _paso = '(arranque)';
  const paso = (n) => { _paso = n; if (VER || process.env.BTN_TRAZA) console.error('  · ' + n); };
  async function ev(expr) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate',
        { expression: expr, returnByValue: true, awaitPromise: true }, sessionId),
      new Promise((_, no) => setTimeout(() => no(new Error(
        'CDP sin respuesta en ' + (RELOJ / 1000) + ' s — paso ' + JSON.stringify(_paso))), RELOJ)),
    ]);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + (r.exceptionDetails.exception || {}).description);
    return r.result.value;
  }
  const J = async (expr) => JSON.parse(await ev('JSON.stringify(' + expr + ')'));
  /* `cdp.send` SIN RELOJ CUELGA IGUAL QUE `ev` — ver el comentario de _probe_evidmarco.mjs. */
  async function cdpEnv(metodo, params) {
    return Promise.race([
      cdp.send(metodo, params, sessionId),
      new Promise((_, no) => setTimeout(() => no(new Error(
        metodo + ' sin respuesta en 20 s — paso ' + JSON.stringify(_paso))), 20000)),
    ]);
  }
  const VK = { Tab: 9, Enter: 13, Escape: 27, Space: 32 };
  async function tecla(k) {
    const vk = VK[k] || 0;
    const p = { key: k, code: k, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
    /* ENTER y ESPACIO van con `text`: sin el caracter detras Blink no genera el KEYPRESS y un
       <button> NO se activa. Las de EDICION (Tab, Escape) al reves, por keycode y rawKeyDown. */
    const act = { Enter: '\r', Space: ' ' };
    if (act[k] !== undefined) {
      await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'keyDown',
        text: act[k], unmodifiedText: act[k] }, p));
      await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, p));
      return;
    }
    await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'rawKeyDown' }, p));
    await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, p));
  }
  async function clicSel(sel) {
    const c = await J(`window.__B.centroSel(${JSON.stringify(sel)})`);
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    if (c.esElBlanco) {
      await cdpEnv('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 });
      await cdpEnv('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 });
      await pausa(200);
      return { via: 'mouse', punto: { x: c.x, y: c.y } };
    }
    return { via: 'NO SE PUDO', por: 'el blanco esta tapado', tapadoPor: c.quien };
  }

  await ev(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await ev(SONDA);

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y SE COME TODOS LOS CLICS. Se cierra con su propio
     boton y se COMPRUEBA que se fue antes de medir: con el overlay puesto ninguna escena de clic
     significa nada. */
  paso('cerrar el aviso legal');
  const avisoSel = await ev(`(function(){
    var m = document.getElementById('modalAvisoEco');
    if (!m) return 'NO EXISTE';
    if (getComputedStyle(m).display === 'none') return 'ya cerrado';
    var b = Array.from(m.querySelectorAll('button')).find(function(x){
      return /cerrarAvisoEco/.test(x.getAttribute('onclick') || '') });
    if (!b) return 'SIN BOTON';
    if (!b.id) b.id = '__avisoOk';
    return '#' + b.id })()`);
  const avisoClic = (avisoSel && avisoSel[0] === '#') ? await clicSel(avisoSel) : avisoSel;
  await pausa(300);
  const avisoCerrado = await ev(`(function(){ var m = document.getElementById('modalAvisoEco');
    return m ? getComputedStyle(m).display : 'NO EXISTE' })()`);

  async function vaciar() {
    await ev('window.__B.limpiar()');
    for (const id of LIMPIAR) await ev(`window.__B.set(${JSON.stringify(id)}, '')`);
    await pausa(500);  /* el debounce de indicSyncBoton es de 400 ms */
  }
  async function sembrar(pac) {
    await vaciar();
    for (const [k, v] of Object.entries(pac)) await ev(`window.__B.set(${JSON.stringify(k)}, ${JSON.stringify(v)})`);
    await pausa(500);
  }
  /* Una escena = el estado del boton + el denominador (cuantas secciones pinta el panel). */
  async function escena(nombre) {
    /* El DENOMINADOR DE GEOMETRIA: se vuelve a la pestana del boton en cada escena porque
       `limpiarCampos` y las rutas de restauracion pueden cambiar de pestana. */
    const tab = await ev('window.__B.irAlInforme()');
    await pausa(120);
    const e = await J('window.__B.estado()');
    const d = await J('window.__B.nSecs()');
    const hay = await ev('window.__B.hay()');
    return { escena: nombre, tabInforme: tab, boton: e, hay: hay, panel: d,
      /* EL VEREDICTO: el color del boton tiene que coincidir con que el panel pinte o no. */
      coincide: (e.primary === true) === (d.n > 0),
      accent: await ev('window.__B.accent()'), bg3: await ev('window.__B.bg3()') };
  }

  const out = { archivo: FARG, grupos: SOLO || 'todos',
    aviso: { selector: avisoSel, clic: avisoClic, display: avisoCerrado } };

  /* ══ estados ══════════════════════════════════════════════════════════════════════════════ */
  if (hacer('estados')) {
    paso('estados');
    out.estados = [];
    await vaciar();                out.estados.push(await escena('vacio'));
    await sembrar(PAC_EM);         out.estados.push(await escena('estenosis mitral'));
    await sembrar(PAC_EA);         out.estados.push(await escena('estenosis aortica'));
    await vaciar();                out.estados.push(await escena('vacio otra vez'));
  }

  /* ══ temas ════════════════════════════════════════════════════════════════════════════════ */
  if (hacer('temas')) {
    paso('temas');
    out.temas = [];
    for (const claro of [false, true]) {
      await ev(`window.__B.tema(${claro})`);
      await vaciar();        out.temas.push(Object.assign({ tema: claro ? 'claro' : 'oscuro' }, await escena('gris')));
      await sembrar(PAC_EM); out.temas.push(Object.assign({ tema: claro ? 'claro' : 'oscuro' }, await escena('azul')));
    }
    await ev('window.__B.tema(false)');
  }

  /* ══ maqueta ══════════════════════════════════════════════════════════════════════════════ */
  if (hacer('maqueta')) {
    paso('maqueta');
    out.maqueta = [];
    for (const w of [1200, 390, 360]) {
      await cdpEnv('Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
      await pausa(260);
      for (const [nom, pac] of [['gris', null], ['azul', PAC_EM]]) {
        if (pac) await sembrar(pac); else await vaciar();
        const tab = await ev('window.__B.irAlInforme()');
        await pausa(140);
        const e = await J('window.__B.estado()');
        out.maqueta.push({ ancho: w, estado: nom, tabInforme: tab, visible: e.visible, w: e.w, h: e.h,
          primary: e.primary, pisoTactil: e.h >= 44, label: e.label });
      }
    }
    await cdpEnv('Emulation.clearDeviceMetricsOverride', {});
    await pausa(200);
  }

  /* ══ rutas ════════════════════════════════════════════════════════════════════════════════ */
  if (hacer('rutas')) {
    paso('rutas');
    out.rutas = {};
    /* Un estudio «guardado» con estenosis mitral: se captura el blob por el mismo barrido que
       usa guardarInforme y se repone por el embudo de las rutas de restauracion. */
    await sembrar(PAC_EM);
    out.rutas.alSembrar = await escena('antes de guardar');
    const campos = await J('window.__B.capturar()');
    out.rutas.camposGuardados = Object.keys(campos).length;

    /* «Nuevo estudio»: limpiarCampos llama a indicSyncBoton a mano —NO pasa por el embudo—. */
    await ev('window.__B.limpiar()');
    await pausa(120);
    out.rutas.nuevoEstudio = await escena('tras limpiarCampos, SIN esperar el debounce');

    /* ── CONTROL NEGATIVO ── se reponen los campos SIN el embudo. El boton tiene que quedar
       GRIS: si se encendiera igual, la escena de abajo no probaria que el enganche sirve. */
    await ev(`window.__B.reponer(${JSON.stringify(campos)}, false)`);
    await pausa(120);
    out.rutas.controlNegativo = await escena('repuesto SIN _recalcModulos');

    /* La ruta real: reponer y pasar por el embudo, que es lo que hacen editarInforme,
       cargarEstudioPorId, el autosave y las dos fases de la reimpresion. */
    await ev(`window.__B.reponer(${JSON.stringify(campos)}, true)`);
    await pausa(120);
    out.rutas.conEmbudo = await escena('repuesto CON _recalcModulos');
    out.rutas.enRecalcModulos = await ev(
      `(function(){ try { return RECALC_MODULOS().indexOf('indicSyncBoton') } catch(e){ return 'EXC' } })()`);
    await vaciar();
  }

  /* ══ abrir ════════════════════════════════════════════════════════════════════════════════ */
  if (hacer('abrir')) {
    paso('abrir en gris');
    await vaciar();
    const tabAbrir = await ev('window.__B.irAlInforme()');
    await pausa(140);
    const antesDeClic = await J('window.__B.estado()');
    const clic = await clicSel('#indic-btn');
    await pausa(350);
    out.abrirEnGris = { tabInforme: tabAbrir, boton: antesDeClic, clic: clic,
      overlay: await ev('window.__B.overlay()'),
      mensaje: await ev('window.__B.mensajePanel()'),
      foco: await J('window.__B.focoAhora()'),
      /* El mensaje YA EXISTIA: no se duplica. Se mide que esta y que es uno solo. */
      vecesElMensaje: await ev(`(function(){ var c = document.getElementById('indic-cuerpo');
        return c ? (c.textContent.match(/Sin criterios de intervenci/g) || []).length : -1 })()`) };
    await ev(`(function(){ try{ indicCerrar() }catch(e){} return 1 })()`);
  }

  out.dialogos = dialogos;
  out.md5 = { antes: antes, despues: await md5(join(RAIZ, 'index.html')) };
  if (out.md5.antes !== out.md5.despues)
    out.ABORTA = 'index.html CAMBIO durante la corrida — la medicion no vale';

  console.log(JSON.stringify(out, null, 1));
  try { cdp.close() } catch (e) {}
  srv.close();
  try { process.kill(-proc.pid, 'SIGKILL') } catch (e) { try { proc.kill('SIGKILL') } catch (e2) {} }
  try { await rm(perfil, { recursive: true, force: true }) } catch (e) {}
  /* ⚠️ `process.exit(0)` Y EL `srv.close()` DE ARRIBA: sin los dos, el servidor HTTP sigue
     escuchando, el event loop queda vivo y se juntan zombies reteniendo su Chrome — un A/B
     encadenado nunca llega al segundo lado y parece lentitud. */
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
