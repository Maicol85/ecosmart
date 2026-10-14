#!/usr/bin/env node
/**
 * _probe_labem.mjs — sonda A/B de SOLO LECTURA para la tanda de la ESTENOSIS MITRAL NATIVA en el
 * LABORATORIO (2026-10-14):
 *   (1) `_labEmLectura`, la lectura unica desde los DATOS del estudio guardado: la CATEGORIA (A),
 *       mutuamente excluyente, y las dos CASILLAS (B), superponibles;
 *   (2) el rotulo «Significativa» donde el Laboratorio decia «Severa», SOLO en la mitral;
 *   (3) las seis categorias en el grafico de distribucion de la EM y en la mini-tabla del PDF;
 *   (4) las dos casillas en el filtro de cohorte, con su conteo.
 *
 * ⚠️ EL LABORATORIO NO LEE EL FORMULARIO: lee `inf.campos` de un estudio archivado. Por eso las
 * escenas son REGISTROS de estudio y no tecleos — que es lo que la propia orden autoriza— y el
 * grupo `teclas` existe para comprobar, por una vez y de punta a punta, que un estudio cargado
 * con teclas REALES y guardado se clasifica igual que su registro sintetico.
 *
 * Infraestructura calcada de scripts/_probe_valvcuatro.mjs (teclas y clics reales, cierre del
 * arbol de Chrome por GRUPO y por PID PROPIO, aviso legal despejado con su denominador, md5 al
 * principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_labem.mjs --file /tmp/index.HEAD.html > /tmp/le.HEAD.json
 *   node scripts/_probe_labem.mjs                             > /tmp/le.NEW.json
 *
 * Grupos (--solo lectura|excluy|sindato|legado|barras|filtro|pdf|teclas|controles):
 *   lectura   — la tabla por categoria: area 1,0 / 1,01 / 1,5 / 1,51 y gradiente 4,9 / 5 / 9,9 / 10.
 *   excluy    — las categorias son mutuamente excluyentes y suman el total de estudios CON datos.
 *   sindato   — los estudios sin ningun dato de EM quedan fuera de todas.
 *   legado    — un estudio con los valores internos antiguos (leve / moderada / severa).
 *   barras    — el grafico de distribucion de la EM en pantalla, con su denominador.
 *   filtro    — las dos casillas superponibles y su conteo, con la interseccion.
 *   pdf       — el PDF de auditoria GENERADO de verdad, interceptando jsPDF.
 *   teclas    — un estudio cargado con teclas reales, guardado y leido por el Laboratorio.
 *   controles — las otras siete lesiones, el Excel en 435 columnas y el resto del Laboratorio.
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en los comentarios de adentro.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/* ⚠️ EL ARBOL DE CHROME NO SE CIERRA CON `proc.kill()`, Y ASI SE JUNTARON 70 PROCESOS (2026-10-08).
   `proc.kill()` manda SIGTERM al proceso que lanzamos; Chrome arranca media docena de hijos
   (zygote, gpu, renderers) que NO son hijos nuestros, asi que sobreviven al padre y quedan
   HUERFANOS (ppid = 1) reteniendo su perfil. El camino de FALLO era peor: el
   `main().catch(... process.exit(1))` de las sondas no mataba nada, y el timeout de 20 s de
   `abrirChrome` tampoco. Medido antes de este arreglo: 10 Chrome huerfanos con 60 hijos y 1075
   perfiles temporales sin borrar, 2,9 GB en $TMPDIR.
   Tres piezas, ninguna decorativa:
     1. `detached: true` en el spawn, que hace a Chrome LIDER DE SU PROPIO GRUPO de procesos. Sin
        eso, matar un grupo se llevaria al script mismo;
     2. un barrido que mata el GRUPO (`process.kill(-pid)`) y no solo al padre, asi que alcanza a
        los hijos que Chrome creo por su cuenta;
     3. el barrido colgado de `exit` ADEMAS de las senales, porque el `process.exit(1)` del camino
        de fallo y el `process.exit(0)` del camino feliz NO disparan SIGINT ni SIGTERM — pero si
        disparan `exit`. De ahi que el borrado del perfil use `rmSync`: en `exit` ya no corre nada
        asincrono, y un `await rm(...)` ahi se descarta en silencio.
   ⚠️ SOLO PIDs PROPIOS, NUNCA POR NOMBRE. El registro guarda unicamente lo que lanzo ESTE
   proceso. Un `pkill`/`killall` por patron se lleva el Chrome del usuario y la corrida del de al
   lado — en este repo ya hay una leccion escrita sobre un `pkill` que mato la corrida en curso. */
const _ARNES_VIVOS = new Set();
let _arnesLimpiezaArmada = false;
function _arnesCerrarAlSalir(proc, perfil) {
  if (!proc || !proc.pid) return;
  _ARNES_VIVOS.add({ pid: proc.pid, perfil: perfil });
  if (_arnesLimpiezaArmada) return;
  _arnesLimpiezaArmada = true;
  const barrer = () => {
    for (const v of _ARNES_VIVOS) {
      /* El grupo primero. Si ya no existe, `kill` tira ESRCH y se ignora — el barrido es
         idempotente a proposito, porque los cierres del camino feliz ya llamaron a `proc.kill()`
         antes de llegar aca. El fallback al pid pelado cubre que `detached` no haya podido crear
         el grupo. */
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-vb-'));
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
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  existe(id) { return !!document.getElementById(id) },
  geo(id) { var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             foco: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null,
             ok: r.width > 0 && r.height > 0 } },
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  chk(id) { var e = document.getElementById(id); return e ? !!e.checked : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },

  /* ⚠️ EL LABORATORIO LEE REGISTROS, NO EL FORMULARIO. Un «estudio» de estas escenas es el mismo
     objeto que la app archiva: { nombre, ci, fecha_estudio, campos }. Se fabrica aca para poder
     fijar los numeros exactos de un borde —1,0 contra 1,01— que con teclas en el formulario
     dependerian ademas de los derivados y de las compuertas de pantalla. */
  reg(campos, nombre) {
    return { id: 'P' + (nombre || 'x'), nombre: 'P ' + (nombre || 'x'), ci: '1',
             fecha_estudio: '2026-10-14', campos: campos || {} } },

  /* La lectura nueva. Contra HEAD la funcion NO EXISTE, y eso tiene que decirlo el A/B en vez de
     reventar: un caso que muere por excepcion prueba que el arbol es distinto, no que sabe medir. */
  lee(campos) {
    if (typeof _labEmLectura !== 'function') return 'SIN FN';
    try { var r = _labEmLectura(window.__P.reg(campos));
      return r === null ? null : { cat: r.cat, lbl: r.lbl, avm: r.avm, gm: r.gm,
                                   porArea: r.porArea, porGrad: r.porGrad, imSig: r.imSig };
    } catch (e) { return 'EXC: ' + e.message } },

  /* La lectura VIEJA, que es la que el A/B compara: el token guardado por regex. */
  leeViejo(campos) {
    if (typeof _labEstenSev !== 'function') return 'SIN FN';
    try { return _labEstenSev(window.__P.reg(campos), 'em_grado') } catch (e) { return 'EXC' } },

  /* Las ocho filas de la tabla resumen y del grafico apilado, por si alguna se mueve. */
  valvCounts(regs) {
    if (typeof _labValvCounts !== 'function') return 'SIN FN';
    try { var vc = _labValvCounts(regs.map(function(c){ return window.__P.reg(c) }));
      return { bases: vc.bases, L: vc.counts.Leve, M: vc.counts.Moderada, S: vc.counts.Severa, N: vc.N };
    } catch (e) { return 'EXC: ' + e.message } },

  /* La fila del Excel: numero de columnas y las celdas de la mitral. */
  excel(campos) {
    if (typeof _labExcelRow !== 'function') return 'SIN FN';
    try { var r = _labExcelRow(window.__P.reg(campos));
      return { cols: Object.keys(r).length, emGrado: r['EM grado'],
               avm: r['AVm (cm2)'] === undefined ? r['AVm (cm\\u00b2)'] : r['AVm (cm2)'],
               plan: r['AVm planimetr\\u00eda (cm\\u00b2)'], cont: r['AVm continuidad (cm\\u00b2)'],
               hash: (function(){ var k = Object.keys(r).sort(), s = '';
                 for (var i=0;i<k.length;i++) s += k[i] + '=' + String(r[k[i]]) + '|';
                 var h = 0; for (var j=0;j<s.length;j++) { h = ((h<<5)-h) + s.charCodeAt(j); h |= 0 }
                 return String(h) })() };
    } catch (e) { return 'EXC: ' + e.message } },

  /* El filtro de cohorte, preguntandole a la funcion dueña con el criterio armado a mano. */
  pasa(campos, C) {
    if (typeof labCohortePasa !== 'function' && typeof _labCohorteOk !== 'function') return 'SIN FN';
    var f = (typeof labCohortePasa === 'function') ? labCohortePasa : _labCohorteOk;
    try { return !!f(window.__P.reg(campos), C) } catch (e) { return 'EXC: ' + e.message } },

  /* El grafico de barras de la EM en pantalla: sus rotulos y sus numeros, leidos del DOM. */
  barras(id) {
    var c = document.getElementById(id);
    if (!c) return { err: 'NO EXISTE ' + id };
    var filas = Array.from(c.querySelectorAll('.lab-bar-row, .lab-bar, [data-lab-bar]'));
    var txt = (c.textContent || '').replace(/\\s+/g, ' ').trim();
    return { n: filas.length, txt: txt, html: c.innerHTML.length } },

  /* ⚠️ EL GRAFICO DE LA EM SE PINTA LLAMANDO AL RENDERIZADOR DEL LABORATORIO CON LA POBLACION EN
     LA MANO, no navegando la pestania: asi la escena fija su propia poblacion y el denominador no
     depende de que haya estudios archivados en este perfil de Chrome. */
  pintarLab(regs) {
    if (typeof labRenderExtras !== 'function') return { err: 'SIN labRenderExtras' };
    var infs = regs.map(function(c){ return window.__P.reg(c) });
    var err = null;
    try { labRenderExtras(infs, infs.length) } catch (e) { err = 'EXC: ' + e.message }
    return { err: err, n: infs.length,
             em: window.__P.barras('lab-esten-em'),
             ea: window.__P.barras('lab-esten-ea'),
             im: window.__P.barras('lab-valv-im'),
             tabla: window.__P.barras('lab-valv-tabla') } },

  /* El filtro de cohorte con un criterio armado a mano. _labCohorteOk lee el global
     _LAB_COHORTE, asi que la escena lo fija y lo repone — nunca lo deja puesto. */
  filtra(regs, C) {
    if (typeof _labCohorteOk !== 'function') return 'SIN FN';
    var prev = window._LAB_COHORTE;
    try {
      window._LAB_COHORTE = C;
      var n = 0;
      regs.forEach(function(c){ if (_labCohorteOk(window.__P.reg(c))) n++ });
      return n;
    } catch (e) { return 'EXC: ' + e.message }
    finally { window._LAB_COHORTE = prev }
  },
  /* La foto de los controles del panel: devuelve el objeto que _labCohorteLeer arma, para
     comprobar que una casilla SIN tildar no deja la cohorte activa. */
  cohLeer() {
    if (typeof _labCohorteLeer !== 'function') return 'SIN FN';
    try { return _labCohorteLeer() } catch (e) { return 'EXC: ' + e.message } },
  /* ⚠️ UN CRITERIO INCOMPLETO RECHAZA TODO, Y LA PRIMERA CORRIDA DE ESTA SONDA DIO CERO EN LAS
     CUATRO CUENTAS. _labCohorteOk evalua TODOS los criterios del objeto, y una clave ausente deja
     comparaciones contra undefined que fallan cerradas: edadMax undefined entra en su rama y
     compara contra NaN. La base NO se escribe a mano —una lista cableada se desactualiza el dia
     que el panel gane un filtro— : se le pide al dueño, _labCohorteLeer, con una casilla tildada
     para que la cohorte cuente como activa, y despues se repone el control.
     Tildar aca no es un gesto medido: es construir el denominador. */
  cohBase() {
    if (typeof _labCohorteLeer !== 'function') return null;
    var cb = document.getElementById('coh-em-area');
    if (!cb) return null;
    var antes = cb.checked;
    cb.checked = true;
    var C = null;
    try { C = _labCohorteLeer() } catch (e) { C = null }
    cb.checked = antes;
    if (!C) return null;
    C.emArea = false; C.emGrad = false; C.em = '';
    return C },
  /* Las opciones del desplegable de la EM y los ids de las dos casillas. */
  cohEM() {
    var sel = document.getElementById('coh-em');
    return { opciones: sel ? Array.from(sel.options).map(function(o){ return o.value + '|' + o.textContent }) : 'NO EXISTE',
             area: window.__P.existe('coh-em-area'), grad: window.__P.existe('coh-em-grad'),
             conteo: window.__P.existe('coh-em-conteo') } },
  /* La descripcion legible de la cohorte, que viaja al encabezado del PDF de auditoria. */
  cohDesc(C) {
    if (typeof _labCohorteDesc !== 'function') return 'SIN FN';
    var prev = window._LAB_COHORTE;
    try { window._LAB_COHORTE = C; return _labCohorteDesc() }
    catch (e) { return 'EXC: ' + e.message } finally { window._LAB_COHORTE = prev } },

  /* ⚠️ EL PDF SE GENERA DE VERDAD, interceptando el constructor de jsPDF: lo que se mide es lo que
     el papel IMPRIME y no lo que una funcion devuelve. Cada doc.text queda registrado. */
  /* ⚠️ jsPDF LLEGA POR CDN Y A VECES NO LLEGA — es el mismo defecto de entorno que TC-148 y TC-318
     ya tienen documentado—. Se espera hasta 8 s antes de rendirse, y si no llega se informa «sin
     jsPDF» en vez de medir un PDF vacio: un A/B contra una corrida sin libreria compara una tabla
     que no se dibujo contra una que si, y eso se lee como una diferencia del commit. */
  esperarJspdf(ms) {
    var t0 = Date.now();
    return new Promise(function(res){
      (function tic(){
        if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) return res(true);
        if (Date.now() - t0 > (ms || 8000)) return res(false);
        setTimeout(tic, 250);
      })();
    }) },
  armarPdf(fn) {
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return Promise.resolve({ err: 'sin jsPDF' });
    var reg = [];
    var Orig = window.jspdf.jsPDF;
    function Espia() {
      var d = new Orig(arguments[0], arguments[1], arguments[2]);
      var t = d.text.bind(d);
      d.text = function(txt) { try { reg.push(String(txt)) } catch (e) {} return t.apply(d, arguments) };
      /* save se neutraliza para que la sonda no deje archivos, pero el documento se GUARDA en
         memoria: la verificacion pide una captura del papel, y leer el PDF renderizado es la unica
         forma de ver lo que el lector ve. output queda intacto. */
      d.save = function(){ try { window.__P._pdfUri = d.output('datauristring') } catch (e) {} return d };
      return d;
    }
    Espia.prototype = Orig.prototype;
    window.jspdf.jsPDF = Espia;
    return Promise.resolve().then(function(){ return fn() })
      .then(function(){ return { ok: true, lineas: reg } })
      .catch(function(e){ return { err: 'EXC: ' + e.message, lineas: reg } })
      .then(function(r){ window.jspdf.jsPDF = Orig;
        r.uri = window.__P._pdfUri || null; window.__P._pdfUri = null; return r });
  },

  despejar() {
    var o = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (!m) { o[id] = 'NO EXISTE'; return; }
      o[id] = getComputedStyle(m).display;
      if (o[id] !== 'none') { m.style.display = 'none'; o[id] += ' -> none'; }
    });
    return o }
};
1`;

/* ══ LAS ESCENAS ══════════════════════════════════════════════════════════════════════════════
   Cada una es un REGISTRO de estudio. Los valores de area y de gradiente estan elegidos para caer
   a los DOS lados de cada corte y EN el corte: 1,0 / 1,01 / 1,5 / 1,51 para el area —el 1,0 parte
   el rotulo y el 1,5 decide la estenosis— y 4,9 / 5 / 9,9 / 10 para el gradiente. Un borde se
   prueba con el valor que cae ENTRE los dos lados, no con uno que esta fuera de los dos. */
const AREAS = [null, '0.9', '1.0', '1.01', '1.5', '1.51', '2.0'];
const GRADS = [null, '4.9', '5', '9.9', '10', '12'];

function campos(extra) { return Object.assign({}, extra || {}); }
function escArea(a, g, extra) {
  const c = campos(extra);
  if (a !== null) c.avm_plan = a;
  if (g !== null) c.em_gmedio = g;
  return c;
}
async function main() {
  const md5Ini = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  const { srv, port } = await servir();
  const { wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  /* ⚠️ RELOJ SOBRE ev(): un despacho que NO RESUELVE deja el fallo apareciendo en la llamada
     SIGUIENTE, o sea en la linea equivocada. Con el reloj el error nombra su propia expresion. */
  async function ev(expr, ms) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate', { expression: `(function(){ ${expr.indexOf('return') === 0 ? expr : 'return (' + expr + ')'} })()`,
                                     returnByValue: true, awaitPromise: true }, sessionId),
      pausa(ms || 15000).then(() => ({ __reloj: true }))
    ]);
    if (r.__reloj) throw new Error('ev() no resolvio en ' + (ms || 15000) + ' ms: ' + expr.slice(0, 90));
    if (r.exceptionDetails) throw new Error('EXC en ev(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' | ' + expr.slice(0, 90));
    return r.result.value;
  }
  async function evCrudo(expr) {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error('EXC en evCrudo(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  }
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, End: 35, Home: 36, Space: 32 };
  /* ⚠️ LAS TECLAS DE EDICION (Backspace, Tab, Escape) VAN POR KEYCODE Y CON rawKeyDown; Enter y
     Espacio al reves, con type keyDown y su `text`, porque Blink activa un <button> desde el
     KEYPRESS y un rawKeyDown pelado no lo genera. Las dos cosas son ciertas a la vez. */
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
  async function clicEn(id) {
    let rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    for (let i = 0; i < 4 && rev && rev.necesitaClic; i++) {
      await clicEn(rev.necesitaClic);
      rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    }
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    const quien = await ev(`window.__P.quienEsta(${JSON.stringify(id)}, ${c.x}, ${c.y})`);
    if (quien.esElBlanco) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await pausa(130);
      return { via: 'mouse', quien };
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    await tecla('Enter', null);
    await pausa(130);
    return { via: 'tecla Enter', quien };
  }
  /* ⚠️ TIPEAR EN UN CAMPO QUE NO EXISTE NO ES UNA MEDICION, Y UNA SONDA DE ESTE REPO YA LO HIZO:
     el foco quedaba en el campo anterior y los caracteres se le concatenaban (un E/e-prima de
     1848,5 informado como diferencia del commit). Aca se ABORTA. */
  async function tipear(id, valor) {
    const hay = await ev(`window.__P.existe(${JSON.stringify(id)})`);
    if (!hay) throw new Error('ABORTA: el campo ' + id + ' no existe en este arbol');
    let via = await clicEn(id);
    /* Si el nodo no tiene caja, se reabre la pestania y sus acordeones UNA vez y se reintenta. */
    let geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) { await ev(`window.__P.abrirTodo()`); via = await clicEn(id);
                   geo = await ev(`window.__P.geo(${JSON.stringify(id)})`); }
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(quedo) !== String(valor))
      throw new Error('ABORTA: el tecleo de ' + id + ' no quedo: pedido ' + valor + ', quedo ' + quedo +
                      ' (' + JSON.stringify(geo) + ', clic ' + via.via + ')');
    return { via: via.via, pedido: String(valor), quedo: String(quedo), ok: true };
  }
  /* ⚠️ UN CLIC SOBRE UN NODO SIN GEOMETRIA NO ES UN GESTO, Y LA PRIMERA CORRIDA DE ESTA SONDA
     INFORMO «ambos metodos marcados» CON LA CASILLA EN false. `showTab('valvulas')` corre
     `valvCerrarTarjetas`, asi que al volver de otra pestania la casilla de continuidad —y las ocho
     pastillas— quedan sin caja y el clic cae en el vacio. Se reabre, se clickea y se EXIGE el
     estado pedido; si no queda, se aborta nombrando el control. */
  async function tildar(id, deseado) {
    await ev(`window.__P.abrirTodo()`);
    let geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria para clickear (' + JSON.stringify(geo) + ')');
    const antes = await ev(`window.__P.chk(${JSON.stringify(id)})`);
    if (antes === deseado) return { id, yaEstaba: true, chk: antes };
    const via = await clicEn(id);
    const chk = await ev(`window.__P.chk(${JSON.stringify(id)})`);
    if (chk !== deseado)
      throw new Error('ABORTA: el clic en ' + id + ' no dejo chk=' + deseado + ' (quedo ' + chk +
                      ', via ' + via.via + ', ' + JSON.stringify(geo) + ')');
    return { id, via: via.via, chk };
  }
  /* El mismo cuidado para una PASTILLA: se exige el estado que la escena pide. */
  async function prender(valv, tipo, deseado) {
    await ev(`window.__P.abrirTodo()`);
    const id = 'pill-' + tipo + '-' + valv;
    let geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    const antes = await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`);
    if (antes === deseado) return { id, yaEstaba: true, pill: antes };
    const via = await clicEn(id);
    const pill = await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`);
    if (pill !== deseado)
      throw new Error('ABORTA: el clic en ' + id + ' no dejo la pastilla en ' + deseado +
                      ' (quedo ' + pill + ', via ' + via.via + ')');
    return { id, via: via.via, pill };
  }
  /* NUNCA Backspace sobre un campo de SOLO LECTURA: se comprueba antes y se declara. */
  async function borrar(id) {
    const soloLectura = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      return e ? (!!e.readOnly || !!e.disabled) : 'NO EXISTE' })()`);
    if (soloLectura !== false) return { id, via: 'NO SE BORRA', por: String(soloLectura) };
    let via = await clicEn(id);
    let geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) { await ev(`window.__P.abrirTodo()`); via = await clicEn(id);
                   geo = await ev(`window.__P.geo(${JSON.stringify(id)})`); }
    if (!geo.ok) throw new Error('ABORTA: no se puede borrar ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    const foco = await ev(`(function(){ return document.activeElement ? (document.activeElement.id || '') : '' })()`);
    if (String(foco) !== String(id))
      throw new Error('ABORTA: el foco no llego a ' + id + ' (esta en ' + JSON.stringify(foco) + ')');
    for (let i = 0; i < 12; i++) await tecla('Backspace', null);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(quedo) !== '')
      throw new Error('ABORTA: el borrado de ' + id + ' no quedo: sigue en ' + JSON.stringify(quedo) +
                      ' (' + JSON.stringify(geo) + ', clic ' + via.via + ')');
    return { id, via: 'Backspace x12', quedo: String(quedo), geo, clic: via.via };
  }



  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await evCrudo(SONDA);

  const avisoIni = await ev(`window.__P.despejar()`);
  const out = { file: FARG, md5Ini, avisoIni, grupos: {} };
  const SOLOG = (arg('--solo') || '').split(',').map(s => s.trim()).filter(Boolean);
  const corre = (g) => !SOLOG.length || SOLOG.indexOf(g) >= 0;
  const lee = async (c) => ev(`window.__P.lee(${JSON.stringify(c)})`);

  /* ── lectura ── La matriz completa area x gradiente, mas los casos que no son matriz. */
  if (corre('lectura')) {
    const g = { denominador: { areas: AREAS.length, grads: GRADS.length,
                               escenas: AREAS.length * GRADS.length }, matriz: [], sueltas: {} };
    for (const a of AREAS) for (const gr of GRADS) {
      const c = escArea(a, gr, null);
      const r = await lee(c);
      g.matriz.push({ avm: a, gm: gr, cat: r && r.cat ? r.cat : r,
                      area: r && r.porArea, grad: r && r.porGrad, viejo: await ev(`window.__P.leeViejo(${JSON.stringify(c)})`) });
    }
    /* Las que no son matriz, cada una con su motivo. */
    const prot = await ev(`(window.VALV_PROT_OPCIONES || [])[0] || null`);
    const S = {
      vacio:            {},
      tokenSig:         { em_grado:'severa' },
      tokenNoSig:       { em_grado:'leve' },
      tokenLegadoMod:   { em_grado:'moderada' },
      tokenSigConDato:  { em_grado:'severa', avm_plan:'2.0' },
      legadoConArea:    { em_grado:'moderada', avm_plan:'1.2' },
      imSigGrad12:      { em_gmedio:'12', im_grado:'4' },
      imSigGrad7:       { em_gmedio:'7',  im_grado:'4' },
      imSigArea12:      { avm_plan:'1.2', em_gmedio:'12', im_grado:'4' },
      imLeveGrad12:     { em_gmedio:'12', im_grado:'1' },
      porCont:          { avm_cont:'1.2' },
      porThp:           { avm_thp:'1.2' },
      discrepa:         { avm_plan:'1.2', avm_cont:'2.0' },
      discrepaInv:      { avm_plan:'2.0', avm_cont:'1.2' },
      planDestildada:   { avm_plan:'1.2', em_pdf_plan__chk:'0' },
      planTildada:      { avm_plan:'1.2', em_pdf_plan__chk:'1' },
      planSinClave:     { avm_plan:'1.2' },
      areaFueraBanda:   { avm_plan:'150' },
      gradFueraBanda:   { em_gmedio:'600' },
      areaCero:         { avm_plan:'0' },
      protesis:         { avm_plan:'1.0', em_gmedio:'12', vm_morf: prot },
      areaYgradSig:     { avm_plan:'0.8', em_gmedio:'12' },
      areaSigGradMedio: { avm_plan:'1.2', em_gmedio:'7' }
    };
    for (const k of Object.keys(S)) g.sueltas[k] = { campos: S[k], r: await lee(S[k]) };
    g.protOpcion = prot;
    out.grupos.lectura = g;
  }

  /* ── excluy ── Las categorias son mutuamente excluyentes y suman el total de estudios CON datos. */
  if (corre('excluy')) {
    const pob = [];
    for (const a of AREAS) for (const gr of GRADS) pob.push(escArea(a, gr, null));
    pob.push({ em_grado:'severa' });            // significativa sin dato numerico
    pob.push({});                                // sin ningun dato de EM: fuera de todo
    pob.push({ fevi:'60' });                     // tampoco: un estudio sin mitral interrogada
    const r = await ev(`(function(){
      var pob = ${JSON.stringify(pob)};
      if (typeof _labEmLectura !== 'function') return 'SIN FN';
      var cuenta = {}, fuera = 0, total = pob.length;
      pob.forEach(function(c){
        var x = _labEmLectura(window.__P.reg(c));
        if (!x) { fuera++; return }
        cuenta[x.cat] = (cuenta[x.cat] || 0) + 1;
      });
      var suma = Object.keys(cuenta).reduce(function(a,k){ return a + cuenta[k] }, 0);
      return { total: total, fuera: fuera, conDatos: total - fuera, cuenta: cuenta, suma: suma,
               excluyente: suma === (total - fuera) };
    })()`);
    out.grupos.excluy = r;
  }

  /* ── sindato ── Cada forma de «no hay dato de EM» por separado. */
  if (corre('sindato')) {
    const casos = {
      vacio: {}, otroCampo: { fevi:'55', im_grado:'2' },
      emGradoSin: { em_grado:'sin' }, emGradoVacio: { em_grado:'' },
      chkSinValor: { em_pdf_plan__chk:'1' }
    };
    const g = {};
    for (const k of Object.keys(casos)) g[k] = await lee(casos[k]);
    out.grupos.sindato = g;
  }

  /* ── legado ── Un estudio guardado con los valores internos antiguos tiene que LEERSE sin error. */
  if (corre('legado')) {
    const g = {};
    for (const tok of ['leve','moderada','severa','sin','Sin estenosis','Severa']) {
      g[tok] = { solo: await lee({ em_grado: tok }),
                 conArea: await lee({ em_grado: tok, avm_plan:'1.2' }),
                 viejo: await ev(`window.__P.leeViejo(${JSON.stringify({ em_grado: tok })})`) };
    }
    out.grupos.legado = g;
  }

  /* ── controles ── Las otras siete lesiones, el Excel y las ocho filas de la tabla resumen. */
  if (corre('controles')) {
    const base = { im_grado:'2', ia_grado:'1', it_grado:'4', ea_grado:'severa',
                   et_grado:'Significativa', ep_grado:'Moderada', ip_grado:'Leve',
                   em_grado:'severa', avm_plan:'1.2', em_gmedio:'12' };
    const g = {
      excel: await ev(`window.__P.excel(${JSON.stringify(base)})`),
      excelVacio: await ev(`window.__P.excel({})`),
      valvCounts: await ev(`window.__P.valvCounts(${JSON.stringify([base, {}, { em_grado:'leve', ea_grado:'leve' }])})`),
      sevOtras: await ev(`(function(){
        if (typeof _labEstenSev !== 'function') return 'SIN FN';
        var c = ${JSON.stringify(base)};
        return { ea: _labEstenSev(window.__P.reg(c),'ea_grado'),
                 et: _labEstenSev(window.__P.reg(c),'et_grado'),
                 ep: _labEstenSev(window.__P.reg(c),'ep_grado'),
                 em: _labEstenSev(window.__P.reg(c),'em_grado'),
                 im: (typeof _labRegurgSev==='function') ? _labRegurgSev(window.__P.reg(c),'im_grado') : 'SIN FN',
                 it: (typeof _labRegurgSev==='function') ? _labRegurgSev(window.__P.reg(c),'it_grado') : 'SIN FN' };
      })()`),
      /* El traductor de rotulo: SOLO la mitral. Las otras siete pasan por el sin tocarse. */
      vis: await ev(`(function(){
        if (typeof _labEmSevVis !== 'function') return 'SIN FN';
        return ['Sin','Leve','Moderada','Severa','otro'].map(function(k){ return k + '->' + _labEmSevVis(k) });
      })()`)
    };
    out.grupos.controles = g;
  }

  /* ── barras ── El grafico de distribucion de la EM en pantalla, con su denominador: una
     poblacion donde CADA categoria tiene al menos un estudio, para que ninguna barra falte por
     tener cero y se lea como «la categoria no existe». */
  if (corre('barras')) {
    const pob = [
      { avm_plan:'0.8' },                 // significativa, AVm <=1,0
      { avm_plan:'1.2' },                 // significativa, AVm >1,0 a <=1,5
      { avm_plan:'2.0', em_gmedio:'12' }, // significativa solo por gradiente
      { avm_plan:'2.0', em_gmedio:'7' },  // no significativa con gradiente elevado
      { avm_plan:'2.0' },                 // sin estenosis
      { em_grado:'severa' },              // significativa sin dato numerico
      { fevi:'60' }                       // sin dato de EM: fuera de todas
    ];
    /* El token del boton acompania a los datos en las cinco primeras, que es como la app los
       guarda: sin el, la lectura VIEJA pone las cinco en «Sin» y el A/B no distingue. */
    pob[0].em_grado = 'severa'; pob[1].em_grado = 'severa';
    pob[2].em_grado = 'severa'; pob[3].em_grado = 'leve'; pob[4].em_grado = 'leve';
    const r = await ev(`window.__P.pintarLab(${JSON.stringify(pob)})`, 30000);
    out.grupos.barras = { poblacion: pob.length, r };
  }

  /* ── filtro ── Las dos casillas superponibles y el desplegable de categoria. La poblacion tiene
     un estudio de CADA combinacion posible de las dos casillas, para que la interseccion se pueda
     contar y no salga por casualidad. */
  if (corre('filtro')) {
    const POB = [
      { avm_plan:'0.8' },                  // area si, gradiente no
      { avm_plan:'1.2', em_gmedio:'12' },  // area si, gradiente si  -> interseccion
      { avm_plan:'2.0', em_gmedio:'12' },  // area no, gradiente si
      { avm_plan:'2.0', em_gmedio:'7' },   // ninguna
      { avm_plan:'2.0' },                  // ninguna
      { fevi:'60' }                        // sin dato de EM: ninguna, y fuera de toda categoria
    ];
    const g = { poblacion: POB.length, controles: await ev(`window.__P.cohEM()`), conteos: {}, cats: {} };
    const BASE = await ev(`window.__P.cohBase()`);
    /* ⚠️ CONTRA HEAD LAS DOS CASILLAS NO EXISTEN Y LA BASE NO SE PUEDE CONSTRUIR. Se informa y se
       sigue, en vez de tirar: una sonda que muere por excepcion prueba que el arbol es distinto y
       no que sabe medir, y ademas se lleva por delante los otros grupos de la misma corrida. */
    if (!BASE) { g.base = 'SIN CASILLAS (arbol sin coh-em-area)'; out.grupos.filtro = g; }
    else { g.base = BASE;
    const con = (x) => JSON.stringify(Object.assign({}, BASE, x));
    g.conteos.soloArea  = await ev(`window.__P.filtra(${JSON.stringify(POB)}, ${con({ emArea:true })})`);
    g.conteos.soloGrad  = await ev(`window.__P.filtra(${JSON.stringify(POB)}, ${con({ emGrad:true })})`);
    g.conteos.ambas     = await ev(`window.__P.filtra(${JSON.stringify(POB)}, ${con({ emArea:true, emGrad:true })})`);
    g.conteos.ninguna   = await ev(`window.__P.filtra(${JSON.stringify(POB)}, ${con({})})`);
    for (const k of ['sig_area_1','sig_area_15','sig_grad','grad_elev','sin','sig_sin_num'])
      g.cats[k] = await ev(`window.__P.filtra(${JSON.stringify(POB)}, ${con({ em: k })})`);
    /* El contador de la pantalla, sobre la misma poblacion. */
    g.casillas = await ev(`(function(){
      if (typeof _labEmCasillas !== 'function') return 'SIN FN';
      return _labEmCasillas(${JSON.stringify(POB)}.map(function(c){ return window.__P.reg(c) })) })()`);
    /* ⚠️ UNA CASILLA SIN TILDAR NO PUEDE DEJAR LA COHORTE ACTIVA: `_labCohorteLeer` decide si hay
       filtros mirando si algun criterio es distinto de vacio, y un `false` pasa esa guarda. */
    g.leerLimpio = await ev(`window.__P.cohLeer()`);
    g.desc = {
      cat:  await ev(`window.__P.cohDesc(${con({ em:'sig_area_1' })})`),
      area: await ev(`window.__P.cohDesc(${con({ emArea:true })})`),
      dos:  await ev(`window.__P.cohDesc(${con({ emArea:true, emGrad:true })})`),
      otra: await ev(`window.__P.cohDesc(${con({ im:'Severa' })})`)
    };
    out.grupos.filtro = g; }
  }

  /* ── pdf ── El PDF de auditoria GENERADO de verdad, interceptando jsPDF. */
  if (corre('pdf')) {
    const POB = [
      { avm_plan:'0.8', em_grado:'severa' },
      { avm_plan:'1.2', em_grado:'severa' },
      { avm_plan:'2.0', em_gmedio:'12', em_grado:'severa' },
      { avm_plan:'2.0', em_gmedio:'7', em_grado:'leve' },
      { avm_plan:'2.0', em_grado:'leve' },
      { em_grado:'severa' },
      { fevi:'60', ia_grado:'4' }
    ];
    const g = { poblacion: POB.length };
    /* ⚠️ `labGenerarPDF` NO RECIBE LA POBLACION: la saca de `labGetInformes()`, que a su vez lee
       `getInformes()`. Se sustituye ESA funcion y se repone — asi la escena fija su poblacion sin
       escribir nada en el almacenamiento, que es lo que mantiene a la sonda de solo lectura. */
    g.jspdf = await ev(`window.__P.esperarJspdf(12000)`, 20000);
    g.r = await ev(`(function(){
      var pob = ${JSON.stringify(POB)}.map(function(c){ return window.__P.reg(c) });
      var orig = window.getInformes;
      window.getInformes = function(){ return pob };
      return window.__P.armarPdf(function(){
        if (typeof labGenerarPDF !== 'function') return { err: 'sin labGenerarPDF' };
        return labGenerarPDF();
      }).then(function(r){ window.getInformes = orig; return r });
    })()`, 90000);
    /* El PPT estadistico («analisis»), por el mismo camino: su tabla de leyenda es la de las OCHO
       lesiones y la de la EM es propia. */
    g.ppt = await ev(`(function(){
      var pob = ${JSON.stringify(POB)}.map(function(c){ return window.__P.reg(c) });
      var orig = window.getInformes;
      window.getInformes = function(){ return pob };
      return window.__P.armarPdf(function(){
        if (typeof labAnalisisPDF !== 'function') return { err: 'sin labAnalisisPDF' };
        return labAnalisisPDF();
      }).then(function(r){ window.getInformes = orig; return r });
    })()`, 120000);
    if (arg('--pdfdump')) {
      for (const [k, dest] of [['r', 'auditoria'], ['ppt', 'analisis']]) {
        const u = g[k] && g[k].uri;
        if (!u) { g[dest + 'Dump'] = 'sin uri'; continue; }
        const b64 = String(u).split(',')[1] || '';
        const ruta = join(arg('--pdfdump'), 'labem_' + dest + '.pdf');
        await writeFile(ruta, Buffer.from(b64, 'base64'));
        g[dest + 'Dump'] = ruta;
      }
    }
    /* El uri no viaja al JSON: son megabytes de base64 que lo vuelven ilegible. */
    if (g.r) delete g.r.uri;
    if (g.ppt) delete g.ppt.uri;
    out.grupos.pdf = g;
  }

  out.avisoFin = await ev(`window.__P.despejar()`);
  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close(); } catch (e) {}
  try { srv.close(); } catch (e) {}
  process.exit(0);
}

main().catch((e) => { console.error('[_probe_labem] ' + (e && e.stack || e)); process.exit(1); });
