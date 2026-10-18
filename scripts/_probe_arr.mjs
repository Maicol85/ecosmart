#!/usr/bin/env node
/**
 * _probe_arr.mjs - sonda A/B de SOLO LECTURA para la tanda ARR (los arreglos tras el CORTOS,
 * 2026-10-18).
 *
 * TODA la infraestructura de scripts/_probe_qtarj.mjs se reusa tal cual -teclas y clics reales,
 * cierre del arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su
 * denominador, md5 al principio y al final-. NO muta index.html.
 *
 *   node scripts/_probe_arr.mjs --file /tmp/index.ARRHEAD.html --solo censo > /tmp/arr.HEAD.json
 *   node scripts/_probe_arr.mjs                               --solo censo > /tmp/arr.NEW.json
 *
 * Grupos:
 *   censo   - ESCRIBIR Y BORRAR, campo por campo: snapshot de TODAS las referencias antes de
 *             tipear, despues de tipear y despues de borrar. Lo que no vuelve al estado inicial
 *             es el defecto. Es un CENSO y no una lista: no hay que saber que span depende de
 *             que campo, se descubre midiendo.
 *   censo2  - las otras dos formas de borrar: seleccionar todo y Delete, y cambiar el valor por
 *             otro y recien despues borrar.
 *   escenas - los campos que necesitan companeros para que su referencia se pinte (valvulas y
 *             protesis: densidad del jet, DVI, THP, gradiente medio, fuga paravalvular).
 *   salida  - informe en tres estilos, EN SUMA, Excel y Laboratorio con el estado SIN DATO.
 *   ara     - los dos operadores del Ar-A y sus bordes (29, 30, 31).
 *   dvit    - el DVI de la protesis tricuspide: hoy tipeado, manana automatico.
 *   lineasb - la separacion de las lineas B y los dos controles que se conservan.
 *   fop     - el inventario del FOP, el aneurisma del septum y el test de burbuja.
 *   ctrl    - los controles: Excel en 440, campos del estudio, almacenamiento.
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda, tampoco en los comentarios
 * de adentro. scripts/check_backticks.py da la linea exacta.
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
/* --dest <dir>: el grupo `captura` guarda PNG de la tabla en los dos temas. */
const DEST = arg('--dest');
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-z-'));
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
/* == Sonda inyectada =========================================================================
   ADVERTENCIA: CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los
   comentarios. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  html(id){ var e = document.getElementById(id); return e ? (e.innerHTML || '').trim() : null },
  existe(id) { return !!document.getElementById(id) },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  geo(id) { var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             x: Math.round(r.left), y: Math.round(r.top),
             ok: r.width > 0 && r.height > 0 } },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },
  sel(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    var hay = Array.prototype.slice.call(e.options || []).map(function(o){ return o.value });
    if (hay.indexOf(valor) < 0) return { err: 'NO HAY OPCION ' + valor, hay: hay };
    e.value = valor;
    e.dispatchEvent(new Event('change', { bubbles: true }));
    if (e.value !== valor) return { err: 'NO QUEDO', valor: e.value };
    return { ok: true } },

  despejar() {
    var o = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (!m) { o[id] = 'NO EXISTE'; return; }
      o[id] = getComputedStyle(m).display;
      if (o[id] !== 'none') { m.style.display = 'none'; o[id] += ' -> none'; }
    });
    return o },

  tema(claro) {
    var r = document.documentElement;
    if (claro) r.classList.add('light-mode'); else r.classList.remove('light-mode');
    return { claro: r.classList.contains('light-mode') } },

  color(sel) {
    var e = (typeof sel === 'string' && sel.charAt(0) === '#')
      ? document.getElementById(sel.slice(1)) : document.querySelector(sel);
    if (!e) return 'NO EXISTE ' + sel;
    return getComputedStyle(e).color },

  nuevo() {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true); return 'ok' }
    catch (e) { return 'EXC: ' + e.message } },

  /* == EL DENOMINADOR DEL MEDIDOR =============================================================
     El estado de PARTIDA no es «el formulario recien cargado»: es «el formulario vacio con los
     calculos YA CORRIDOS». La diferencia no es teorica y costo una corrida entera: sin esto, la
     base tiene los span en «-» porque NADIE los pinto nunca, y despues de tipear y borrar quedan
     con su propio texto de «sin datos» -«Requiere IC + PCP estimada», «No evaluado», «Incompleto
     - ASE 2025»-, que NO es el defecto sino la diferencia entre «nunca pintado» y «pintado
     diciendo que falta el dato». La primera corrida informo 39 de 41 campos fallando por esto.
     Es la misma leccion que este repo ya tiene escrita para el estado inicial de ea-sev. */
  calentar() {
    var n = 0, err = [];
    Object.keys(window).forEach(function(k){
      if (!/^calc[A-Z]/.test(k)) return;
      if (typeof window[k] !== 'function') return;
      try { window[k](); n++ } catch (e) { err.push(k) }
    });
    try { if (typeof _recalcModulos === 'function') _recalcModulos('probe') } catch (e) { err.push('_recalcModulos') }
    return { n: n, err: err } },

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
    var r = window.__P.geo(id);
    return { ok: !!(r && r.ok), tab: tab, abiertos: abiertos, rect: r } },


  pdf(plantilla) {
    if (typeof window.jspdf === 'undefined') return { err:'SIN jsPDF' };
    if (plantilla) { try { localStorage.setItem('ett_pdf_plantilla', plantilla) } catch (e) {} }
    var orig = window.jspdf.jsPDF;
    var textos = [], nfig = 0, guardo = false, err = null;
    function Envuelto(){
      var d = new orig(arguments[0]);
      var oText = d.text, oCirc = d.circle, oLine = d.line;
      d.text = function(t){
        var s = (typeof t === 'string') ? t : (Array.isArray(t) ? t.join(String.fromCharCode(1)) : String(t));
        textos.push(s); return oText.apply(d, arguments) };
      d.circle = function(){ nfig++; return oCirc.apply(d, arguments) };
      d.line   = function(){ nfig++; return oLine.apply(d, arguments) };
      d.save   = function(){ guardo = true; return d };
      return d }
    Envuelto.API = orig.API; Envuelto.version = orig.version;
    window.jspdf.jsPDF = Envuelto;
    try { generarPDFReal() } catch (e) { err = String(e && e.message || e) }
    finally { window.jspdf.jsPDF = orig }
    return { err:err, guardo:guardo, nTextos:textos.length, nFigs:nfig, textos:textos } },

  /* El PPT estadistico y el PDF de auditoria del Laboratorio, por sus generadores REALES —los
     publicos exigen tarjetas tildadas y abren modales—. Se mide el numero de textos. */
  labPPT(infs) {
    if (typeof _labPPTGenerar !== 'function') return 'SIN _labPPTGenerar';
    if (typeof PptxGenJS === 'undefined') return 'SIN PptxGenJS';
    var n = 0;
    try {
      var P = PptxGenJS; var orig = P.prototype.addSlide;
      P.prototype.addSlide = function(){ var sl = orig.apply(this, arguments);
        var oT = sl.addText; sl.addText = function(t){ n++; return oT.apply(sl, arguments) };
        var oTb = sl.addTable; if (oTb) sl.addTable = function(){ n++; return oTb.apply(sl, arguments) };
        return sl };
      try { _labPPTGenerar(infs || [], { guardar:false }); } catch (e) {}
      P.prototype.addSlide = orig;
    } catch (e) { return 'EXC: ' + e.message }
    return n },

  labAudit(infs) {
    if (typeof _labAnalisisPDFReal !== 'function') return 'SIN _labAnalisisPDFReal';
    if (typeof window.jspdf === 'undefined') return 'SIN jsPDF';
    var orig = window.jspdf.jsPDF; var textos = [];
    function Envuelto(){ var d = new orig(arguments[0]); var oText = d.text;
      d.text = function(t){ var s = (typeof t === 'string') ? t
        : (Array.isArray(t) ? t.join(String.fromCharCode(1)) : String(t));
        textos.push(s); return oText.apply(d, arguments) };
      d.save = function(){ return d }; return d }
    Envuelto.API = orig.API; Envuelto.version = orig.version;
    window.jspdf.jsPDF = Envuelto;
    try { _labAnalisisPDFReal(infs || []); } catch (e) {}
    finally { window.jspdf.jsPDF = orig }
    return { n: textos.length, textos: textos } },


  abrirComoEstudio(campos) {
    var inf = window.__P.reg(campos, 'iv');
    var oG = window.getInformes, oL = window.labGetInformes;
    window.getInformes = function(){ return [inf] };
    window.labGetInformes = function(){ return [inf] };
    var err = null;
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true); } catch (e) {}
    try { editarInforme(inf.id) } catch (e) { err = 'EXC: ' + e.message }
    var ok = document.getElementById('edit-ok');
    if (!ok) { window.getInformes = oG; window.labGetInformes = oL;
               return { err: err || 'NO APARECIO EL BOTON edit-ok' } }
    ok.click();
    window.getInformes = oG; window.labGetInformes = oL;
    return { ok: true, err: err } },

  /* == LAS TARJETAS i DEL Q, LA VISTA 2D Y EL LABORATORIO =====================================
     Los tres LEEN EL DOM de las capsulas, asi que un span que conserva el valor viejo les llega
     tal cual. Es la superficie que el censo no cubre. */
  /* ⚠️ SE ABRE LA PUERTA DEL PROPIO BOTON, Y NO SIEMPRE ES VALVULAS. Los globos viven en CINCO
     pestañas y las cuatro secciones de valvula nacen cerradas con sus ocho cajones «Datos»: sin
     esto los once botones miden 0 x 0 y la lectura informa «SIN GEOMETRIA» sobre globos que el
     medico ve perfectamente. Es el abridor de TC-500, con los toggles REALES y no con un
     display vacio a mano, que la regla del celular le gana con !important. */
  puertaDe(clave) {
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { err: 'NO EXISTE globo ' + clave };
    var o = {};
    try {
      var sec = b.closest ? b.closest('.tab-section') : null;
      var id = sec ? String(sec.id || '') : '';
      if (id.indexOf('tab-') === 0 && getComputedStyle(sec).display === 'none'
          && typeof showTab === 'function') showTab(id.slice(4));
      o.tab = id;
      if (id === 'tab-valvulas') {
        ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(sx){
          var c = document.getElementById('ete-seccion-' + sx);
          if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function')
            toggleEteSeccion(sx); });
        ['caja-insuf-mitral','caja-esten-mitral','caja-insuf-aortica','caja-esten-aortica',
         'caja-insuf-tricuspide','caja-esten-tricuspide','caja-insuf-pulmonar','caja-esten-pulmonar']
          .forEach(function(cj){ var c = document.getElementById(cj);
            if (c && getComputedStyle(c).display === 'none' && typeof valvDatosTog === 'function')
              valvDatosTog(cj); });
      }
      if (id === 'tab-doppler') {
        ['dop-mitral','dop-aortico','dop-tricusp','dop-pulmonar'].forEach(function(cd){
          var c = document.getElementById(cd);
          if (c && getComputedStyle(c).display === 'none' && typeof toggleCard === 'function')
            toggleCard(cd); });
      }
      /* Los acordeones sacc- de AI/VI y VD. */
      var n = b.parentNode;
      while (n && n.nodeType === 1 && n !== document.body) {
        if (String(n.id || '').indexOf('sacc-') === 0 && getComputedStyle(n).display === 'none'
            && typeof secToggle === 'function') secToggle(String(n.id).slice(5));
        n = n.parentNode;
      }
    } catch (e) { o.err = 'EXC: ' + e.message }
    o.geo = window.__P.geo(b.id || '') ;
    var rr = b.getBoundingClientRect();
    o.w = Math.round(rr.width); o.h = Math.round(rr.height);
    return o },

  qtarj(clave) {
    window.__P.puertaDe(clave);
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { hayBoton: false };
    var r = b.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return { hayBoton: true, sinGeometria: true };
    if (r.top < 0 || r.bottom > window.innerHeight) { b.scrollIntoView({ block: 'center' }); }
    b.click();
    var c = document.getElementById('vinfo-card');
    var abierta = !!(c && getComputedStyle(c).display !== 'none');
    var t = abierta ? (c.textContent || '').replace(/\\s+/g, ' ').trim() : null;
    if (abierta) b.click();
    return { hayBoton: true, abierta: abierta, texto: t } },

  v2d(valv) {
    var o = {};
    try { o.pastilla = (typeof _v2dPastilla === 'function') ? _v2dPastilla(valv, 'insuf') : 'SIN FN' }
    catch (e) { o.pastilla = 'EXC: ' + e.message }
    try { var R = (typeof _v2dPorQue === 'function') ? _v2dPorQue(valv, 'insuf') : null;
      o.porque = R ? { filas: (R.filas || []).map(function(f){ return f.rotulo + '=' + f.val + '/' + (f.grado||'') }),
                       integrada: R.integrada || null, aviso: R.aviso || null } : null;
    } catch (e) { o.porque = 'EXC: ' + e.message }
    return o },

  lab(campos) {
    var o = {};
    var inf = window.__P.reg(campos || {}, 'lab');
    ['_labDiastGrado','_labGeomCat','_labFevi','_labLavi','_labDisfSistVent','_labEstenSev',
     '_labValvCounts','_labWilkinsResumen'].forEach(function(fn){
      try { o[fn] = (typeof window[fn] === 'function') ? JSON.stringify(window[fn](inf)) : 'SIN FN' }
      catch (e) { o[fn] = 'EXC' } });
    return o },

  /* == EL CENSO DE REFERENCIAS ================================================================
     Un snapshot de TODO lo que la pantalla PUBLICA como resultado: los span de las filas de los
     cuadros de referencia, los grados hermanos de la mitral y de la aortica, y las capsulas.
     Se mide TODO y no una lista por campo: asi el defecto se DESCUBRE, sin tener que saber de
     antemano que span depende de que campo. Lo que no vuelve al valor inicial tras borrar es el
     defecto.
     Solo se guarda lo que NO esta vacio: un objeto con 400 claves en cada escena es ilegible, y
     lo que importa es lo que DICE algo. */
  refs() {
    var o = {};
    var pon = function(k, t) {
      t = (t || '').replace(/\\s+/g, ' ').trim();
      if (t === '' || t === '-') return;
      o[k] = t;
    };
    document.querySelectorAll('.calc-box .calc-row span[id]:not(.calc-lbl)').forEach(function(e){
      pon(e.id, e.textContent);
    });
    document.querySelectorAll('[data-grado-de]').forEach(function(e){
      pon('g:' + e.getAttribute('data-grado-de'), e.textContent);
    });
    /* Los span de interpretacion que NO viven en un .calc-row (capsulas sueltas). */
    document.querySelectorAll('span[id$="-interp"],span[id$="-val"],span[id$="-badge"],div[id$="-badge"],div[id$="-interp"]').forEach(function(e){
      if (o[e.id] !== undefined) return;
      pon(e.id, e.textContent);
    });
    return o },

  /* Cuantas filas de referencia hay en total, para que el lector pueda ver que el censo midio
     algo: un selector que no matchea nada devuelve {} y se lee igual que «todo esta limpio». */
  refsN() {
    return { calcRow: document.querySelectorAll('.calc-box .calc-row span[id]:not(.calc-lbl)').length,
             grados: document.querySelectorAll('[data-grado-de]').length,
             sueltos: document.querySelectorAll('span[id$="-interp"],span[id$="-val"],span[id$="-badge"],div[id$="-badge"],div[id$="-interp"]').length } },

  /* Las ocho pastillas de severidad, que son la otra superficie de pantalla. */
  pills() {
    var o = {};
    [['mitral','insuf'],['mitral','esten'],['aortica','insuf'],['aortica','esten'],
     ['tricuspide','insuf'],['tricuspide','esten'],['pulmonar','insuf'],['pulmonar','esten']]
      .forEach(function(p){ o[p[0] + ':' + p[1]] = window.__P.pill(p[0], p[1]) });
    ['im_grado','ia_grado','it_grado','ip_grado','em_grado','ea_grado','et_grado','ep_grado']
      .forEach(function(id){ o[id] = window.__P.val(id) });
    return o },

  /* == SUPERFICIES ============================================================================
     El estilo del informe es ESTADO DE SESION: se fija en cada escena. */
  informe(estilo) {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(estilo || 'estandar') } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) { return 'EXC: ' + e.message }
    return { inf: window.__P.val('informe_texto'), suma: window.__P.val('en_suma') } },

  reg(campos, nombre) {
    return { id: 'P' + (nombre || 'x'), nombre: 'P ' + (nombre || 'x'), ci: '1',
             fecha_estudio: '2026-10-15', campos: campos || {} } },

  excelDOM() {
    if (typeof _labExcelRow !== 'function') return 'SIN FN';
    try {
      var c = {};
      document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
        if (e.type === 'checkbox' || e.type === 'radio') c[e.id + '__chk'] = e.checked ? '1' : '0';
        else c[e.id] = e.value;
      });
      var r = _labExcelRow(window.__P.reg(c)); var o = {};
      Object.keys(r).forEach(function(k){ o[k] = (r[k] === null || r[k] === undefined) ? null : String(r[k]) });
      return { cols: Object.keys(r).length, fila: o };
    } catch (e) { return 'EXC: ' + e.message } },

  camposGuardados() {
    var c = {};
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
      if (e.type === 'checkbox' || e.type === 'radio') c[e.id + '__chk'] = e.checked ? '1' : '0';
      else c[e.id] = e.value;
    });
    var ks = Object.keys(c).sort();
    var h = 0, s = ks.map(function(k){ return k + '=' + c[k] }).join('|');
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0 }
    return { n: ks.length, hash: h } },

  almacen() {
    var o = { ls: [], ss: [] };
    try { for (var i = 0; i < localStorage.length; i++) o.ls.push(localStorage.key(i)) } catch (e) { o.ls = 'EXC' }
    try { for (var j = 0; j < sessionStorage.length; j++) o.ss.push(sessionStorage.key(j)) } catch (e) { o.ss = 'EXC' }
    return o },

  /* == ARR5 - Ar-A ============================================================================
     Las DOS constantes con sus DOS operadores, medidas por COMPORTAMIENTO (son const de modulo
     y no propiedades de window: la trampa de ECO_AYUDA). Se leen las dos filas que lo publican:
     la de la vena pulmonar de la ASE/EACVI 2016 y el suplementario de la ASE 2025. */
  ara() {
    var o = { venpAra: window.__P.txt('venp-ara'), venpVel: window.__P.txt('venp-vel'),
              dd: window.__P.txt('dd-interp') };
    o.cte = {};
    ['VENP_AR_A_MS','ASE_ARA_SUPL','ASE_ARVEL_SUPL'].forEach(function(k){
      o.cte[k] = (typeof window[k] !== 'undefined') ? window[k] : 'NO EN WINDOW' });
    try { o.venpArA = (typeof venpArA === 'function') ? venpArA() : 'SIN FN' } catch (e) { o.venpArA = 'EXC' }
    /* EL PREDICADO de la fila de la vena pulmonar (ASE/EACVI 2016): es lo que decide el color, y
       es el que el ARR5 unifica. Y el COLOR resuelto, que es lo que el medico ve. */
    try { o.alta = (typeof venpArAAlta === 'function') ? venpArAAlta() : 'SIN FN' } catch (e) { o.alta = 'EXC' }
    o.colorAra = (function(){ var e = document.getElementById('venp-ara');
      return e ? getComputedStyle(e).color : 'NO EXISTE' })();
    /* El cumple de la tabla de suplementarios toma el VALOR como argumento: llamarlo pelado da
       undefined > 30 = false SIEMPRE, y eso se lee igual que «el corte no funciona». Se le pasa
       el Ar-A y se nombra la clave. */
    try {
      if (typeof ASE_SUPLEMENTARIOS === 'undefined') { o.suplV = 'SIN TABLA'; }
      else {
        var ara = (typeof venpArA === 'function') ? venpArA() : null;
        o.suplV = ASE_SUPLEMENTARIOS.map(function(sp){
          var c = null; try { c = sp.cumple(sp.clave === 'arA' ? ara : null) } catch (e) { c = 'EXC' }
          return { clave: sp.clave || null, rot: String(sp.rot || '').slice(0, 60), cumple: c } });
      }
    } catch (e) { o.suplV = 'EXC: ' + e.message }
    /* El suplementario del Ar-A, leido del dueno: su cumple es lo que vota. */
    try {
      if (typeof ASE_SUPLEMENTARIOS === 'undefined') { o.supl = 'SIN TABLA'; }
      else {
        o.supl = ASE_SUPLEMENTARIOS.map(function(s){
          var c = null; try { c = s.cumple() } catch (e) { c = 'EXC' }
          return { k: s.k || null, cumple: c } });
      }
    } catch (e) { o.supl = 'EXC: ' + e.message }
    /* La ventana del compas, que es la otra superficie del algoritmo. */
    try { if (typeof diastAlgoRender === 'function') { diastAlgoRender(); } } catch (e) {}
    var w = document.getElementById('diast-algo-card');
    o.ventana = w ? (w.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 1400) : 'NO EXISTE';
    return o },

  /* == ARR6 - el DVI de la protesis tricuspide ================================================ */
  dviT() {
    var e = document.getElementById('vt_dvi');
    var o = { val: e ? e.value : 'NO EXISTE',
              ro: e ? !!(e.readOnly || e.disabled) : null,
              ph: e ? (e.getAttribute('placeholder') || '') : null,
              vtiEnt: window.__P.val('et_vti_diast'), vtiTsvi: window.__P.val('vt_vti_tsvi'),
              vtiTsviAlt: window.__P.val('itv_tsvi') };
    try { o.veredicto = (typeof vtProtObstr === 'function') ? (function(){ var R = vtProtObstr();
      return R ? { obstr: R.obstr, dvi: R.dvi, porDvi: R.porDvi, obstrPos: R.obstrPos,
                   obstrMed: R.obstrMed, gmed: R.gmed, thp: R.thp } : null })() : 'SIN FN';
    } catch (x) { o.veredicto = 'EXC: ' + x.message }
    o.capsula = window.__P.txt('vt-prot-obstr');
    return o },

  /* == ARR7 - las lineas B ==================================================================== */
  lineasb() {
    return { sel: window.__P.existe('pul_lineas_b_sep'),
             valor: window.__P.val('pul_lineas_b_sep'),
             opciones: (function(){ var e = document.getElementById('pul_lineas_b_sep');
               return e ? Array.prototype.slice.call(e.options).map(function(o){ return o.value }) : null })(),
             lineasB: window.__P.val('pul_lineas_b'),
             pericardio: window.__P.val('pul_derrame_tam'),
             balik: window.__P.val('pul_derrame_mm') } },

  /* == ARR8 - FOP, aneurisma del septum y test de burbuja ===================================== */
  fop() {
    var o = { campos: {}, dup: {} };
    ['otr_burbuja','otr_burbuja_grado','otr_burbuja_maniobra','otr_burbuja_momento',
     'otr_aneurisma_sia','otr_aneurisma_sia_nota','otr_asia','otr_asia_nota',
     'fop_tunel','fop_burbujas','fop_aneurisma','fop_sia_movil','fop_acv',
     'fop_shunt_reposo','fop_shunt_valsalva','fop_excursion'].forEach(function(id){
      var e = document.getElementById(id);
      o.campos[id] = e ? { tag: e.tagName, val: e.value,
        chk: (e.type === 'checkbox') ? e.checked : null,
        opciones: e.options ? Array.prototype.slice.call(e.options).map(function(x){ return x.value + '|' + x.text }) : null } : null;
    });
    return o },

  /* Censo generico: todo campo cuyo id contenga una de estas palabras. Sirve para encontrar los
     ids reales de la zona sin leer el marcado entero. */
  censoIds(frag) {
    var re = new RegExp(frag, 'i'), o = [];
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
      if (re.test(e.id)) o.push({ id: e.id, tag: e.tagName, type: e.type || null,
        opciones: e.options ? Array.prototype.slice.call(e.options).map(function(x){ return x.value + '|' + x.text }) : null });
    });
    return o },

  censoSpans(frag) {
    var re = new RegExp(frag, 'i'), o = [];
    document.querySelectorAll('[id]').forEach(function(e){
      if (re.test(e.id) && e.tagName !== 'INPUT' && e.tagName !== 'SELECT' && e.tagName !== 'TEXTAREA')
        o.push({ id: e.id, tag: e.tagName, txt: (e.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 120) });
    });
    return o }
};
1;
`;


/* == LOS CAMPOS DEL CENSO ======================================================================
   Una lista declarada por ZONA, con el valor a escribir y el valor de cambio. El censo descubre
   que REFERENCIA depende de cada campo midiendo, pero los CAMPOS si hay que nombrarlos: barrer
   los ~330 input de la app por tres variantes seria una corrida de horas.
   Los valores son plausibles y DENTRO de la banda: un valor fuera de banda hace que la
   referencia publique su aviso de rango en vez de su grado, y entonces lo que se mide es otra
   cosa. El segundo valor cambia de GRADO cuando se puede, para que la variante «cambiar y
   borrar» tenga denominador. */
const CENSO = {
  ai: [['ai_diam','44','36'], ['ai_area','26','18'], ['ai_vol','98','40'],
       ['lars','14','32'], ['ai_strain_ct','16','8']],
  vi: [['siv','13','9'], ['ddfvi','58','48'], ['dsfvi','40','30'], ['ppvi','13','9'],
       ['fevi','40','60'], ['vdfvi','160','90'], ['vsfvi','90','40'], ['sgl','12','20']],
  aorta: [['ao_sin','46','34'], ['ao_st','45','30'], ['ao_tub','47','32'],
          ['diam_cayado','46','30'], ['diam_ao_toracica','42','25']],
  vd: [['tapse','14','22'], ['s_prime','8','13'], ['vd_tei','0.62','0.40'],
       ['fevd','40','55'], ['vd_bas','45','35'], ['vd_mid','38','30'],
       ['vd_long','85','70'], ['vd_pared','7','3'], ['vd_vi','1.2','0.8'],
       ['tvia','2.0','1.0']],
  advci: [['ad_area','22','14'], ['vci_diam','25','15']],
  dop: [['onda_e','95','60'], ['onda_a','50','70'], ['e_sep','5','10'], ['e_lat','6','12'],
        ['thp','90','160'], ['tde','140','220'], ['triv','60','100'],
        ['venp_dur_ar','40','20'], ['venp_dur_a','100','120'], ['venp_vel_ar','40','20'],
        ['onda_l','55','10']],
};

/* Las valvulas y las protesis van en `escenas`: sus referencias solo se pintan con companeros
   cargados, asi que un campo solo no mueve nada y el censo informaria «no falla» sobre un
   defecto que si esta. */
const PUERTAS = {
  ai: 'ai-vi', vi: 'ai-vi', aorta: 'ai-vi', vd: 'vd', advci: 'vd', dop: 'doppler',
};

async function main() {
  let OUT = null;

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
  async function ev(expr, ms) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate', { expression: `(function(){ ${expr.indexOf('return') === 0 ? expr : 'return (' + expr + ')'} })()`,
                                     returnByValue: true, awaitPromise: true }, sessionId),
      pausa(ms || 20000).then(() => ({ __reloj: true }))
    ]);
    if (r.__reloj) throw new Error('ev() no resolvio en ' + (ms || 20000) + ' ms: ' + expr.slice(0, 90));
    if (r.exceptionDetails) throw new Error('EXC en ev(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' | ' + expr.slice(0, 90));
    return r.result.value;
  }
  async function evCrudo(expr) {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error('EXC en evCrudo(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  }
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, Space: 32, Escape: 27 };
  async function tecla(k) {
    const code = VK[k];
    if (k === 'Enter' || k === 'Space') {
      const t = k === 'Enter' ? '\r' : ' ';
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k === 'Space' ? ' ' : 'Enter',
        code: k === 'Space' ? 'Space' : 'Enter', windowsVirtualKeyCode: code, text: t }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k === 'Space' ? ' ' : 'Enter',
        code: k === 'Space' ? 'Space' : 'Enter', windowsVirtualKeyCode: code }, sessionId);
      return;
    }
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k,
      windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k,
      windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }, sessionId);
  }
  /* ADVERTENCIA: un campo de SOLO LECTURA no recibe teclas, y mandarselas es un gesto que no
     existe. La sonda ABORTA nombrandolo en vez de informar «no cambia». */
  async function foco(id) {
    let g = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!g || g.err || !g.ok) {
      const a = await ev(`window.__P.abrirPara(${JSON.stringify(id)})`);
      g = a && a.rect;
      if (!a || !a.ok) throw new Error('SIN GEOMETRIA ' + id + ' ' + JSON.stringify(a));
    }
    const ro = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      return !!(e.readOnly || e.disabled) })()`);
    if (ro) throw new Error('CAMPO DE SOLO LECTURA, no se le manda una tecla: ' + id);
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)}); e.focus();
      e.setSelectionRange ? e.setSelectionRange(0, (e.value||'').length) : 0; return 1 })()`);
    const f = await ev(`document.activeElement ? document.activeElement.id : null`);
    if (f !== id) throw new Error('EL FOCO NO LLEGO a ' + id + ', esta en ' + f);
  }
  async function tipear(id, texto) {
    await foco(id);
    for (let i = 0; i < 24; i++) await tecla('Backspace');
    if (String(texto).length) await cdp.send('Input.insertText', { text: String(texto) }, sessionId);
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      e.dispatchEvent(new Event('input', { bubbles: true })); return 1 })()`);
    const leido = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(leido) !== String(texto)) throw new Error('EL TECLEO NO QUEDO en ' + id + ': ' + leido);
    return leido;
  }
  /* BORRAR CON TECLAS REALES, por los dos gestos del medico.
     `bs` = Backspace digito por digito, que es el gesto mas frecuente y el que ademas pasa por
     valores intermedios (el «2» de «20»): ese paso intermedio es el que en la tanda W2-A dejaba
     un area mitral imposible en el Excel.
     `del` = seleccionar todo y Delete, que borra de una sola vez. */
  async function borrar(id, modo) {
    await foco(id);
    if (modo === 'del') {
      await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
        e.focus(); e.setSelectionRange(0, (e.value||'').length); return 1 })()`);
      await tecla('Delete');
    } else {
      await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
        e.focus(); e.setSelectionRange((e.value||'').length, (e.value||'').length); return 1 })()`);
      for (let i = 0; i < 12; i++) await tecla('Backspace');
    }
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true })); return 1 })()`);
    const leido = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(leido) !== '') throw new Error('EL BORRADO NO QUEDO en ' + id + ': ' + JSON.stringify(leido));
    return leido;
  }
  async function viewport(w, h) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: h || 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  }

  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2800);
  await evCrudo(SONDA);

  const avisoIni = await ev(`window.__P.despejar()`);
  const out = { file: FARG, md5Ini, avisoIni, grupos: {} };
  OUT = out;
  const SOLOG = (arg('--solo') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const corre = (g) => !SOLOG.length || SOLOG.indexOf(g) >= 0;

  out.refsN = await ev(`window.__P.refsN()`);
  out.calentar = await ev(`window.__P.calentar()`);

  /* Compara dos snapshots de referencias y devuelve SOLO lo que difiere. */
  function dif(a, b) {
    const o = {};
    for (const k of Object.keys(b)) if (a[k] !== b[k]) o[k] = { antes: a[k] === undefined ? null : a[k], ahora: b[k] };
    for (const k of Object.keys(a)) if (b[k] === undefined) o[k] = { antes: a[k], ahora: null };
    return o;
  }

  /* == GRUPO censo: escribir y borrar, campo por campo ========================================
     El veredicto por campo es: `queda` = lo que sigue distinto del estado inicial DESPUES de
     borrar. Si `queda` esta vacio, el campo no tiene el defecto. */
  async function unCampo(id, valor, modo, base) {
    await ev(`window.__P.nuevo()`);
    if (base) for (const [k, v2] of Object.entries(base)) await tipear(k, v2);
    await ev(`window.__P.calentar()`);
    const ref0 = await ev(`window.__P.refs()`);
    const pil0 = await ev(`window.__P.pills()`);
    await tipear(id, valor);
    const ref1 = await ev(`window.__P.refs()`);
    await borrar(id, modo);
    const ref2 = await ev(`window.__P.refs()`);
    const pil2 = await ev(`window.__P.pills()`);
    return { id, valor, modo,
             pinto: Object.keys(dif(ref0, ref1)).length,
             queda: dif(ref0, ref2),
             pills: dif(pil0, pil2) };
  }

  for (const [zona, campos] of Object.entries(CENSO)) {
    if (!corre('censo')) break;
    const r = [];
    for (const [id, va] of campos) {
      try { r.push(await unCampo(id, va, 'bs', null)); }
      catch (e) { r.push({ id, err: e.message }); }
    }
    out.grupos['censo:' + zona] = r;
    process.stderr.write('[censo:' + zona + '] ' + r.length + ' campos, fallan '
      + r.filter(x => x.queda && Object.keys(x.queda).length).length + '\n');
  }

  if (corre('censo2')) {
    /* Las otras dos formas: seleccionar todo y Delete, y cambiar el valor por otro y borrar. */
    const r = [];
    for (const [zona, campos] of Object.entries(CENSO)) {
      for (const [id, va, vb] of campos) {
        try { r.push(Object.assign({ zona }, await unCampo(id, va, 'del', null))); }
        catch (e) { r.push({ zona, id, modo: 'del', err: e.message }); }
        /* cambiar y borrar: se escribe va, despues vb, y recien despues se borra. */
        try {
          await ev(`window.__P.nuevo()`);
          await ev(`window.__P.calentar()`);
          const ref0 = await ev(`window.__P.refs()`);
          await tipear(id, va);
          await tipear(id, vb);
          const ref1 = await ev(`window.__P.refs()`);
          await borrar(id, 'bs');
          const ref2 = await ev(`window.__P.refs()`);
          r.push({ zona, id, modo: 'cambio', valores: [va, vb],
                   pinto: Object.keys(dif(ref0, ref1)).length, queda: dif(ref0, ref2) });
        } catch (e) { r.push({ zona, id, modo: 'cambio', err: e.message }); }
      }
      process.stderr.write('[censo2:' + zona + '] ' + r.length + ' acumulados\n');
    }
    out.grupos.censo2 = r;
  }


  /* == GRUPO escenas: valvulas y protesis ======================================================
     Sus referencias solo se pintan con companeros cargados, asi que un campo solo no mueve nada
     y el censo informaria «no falla» sobre un defecto que si esta. Cada escena carga una BASE,
     calienta, y recien entonces escribe y borra el campo bajo prueba.
     Las puertas: la pestaña Valvulas y las cuatro secciones de lesion, que nacen cerradas. */
  const ESCENAS = [
    { n: 'it-densidad', puerta: 'it_densidad', base: { it_vc: '5' },
      sel: ['it_densidad', 'denso'], borrarSel: true },
    { n: 'it-cuant', puerta: 'it_vc', base: { it_densidad: 'moderado' },
      campo: ['it_vc', '8', '3'] },
    /* El THP mitral NO tiene campo propio en Valvulas: `em_thp_display` es de SOLO LECTURA y su
       dueño es `thp`, en el Doppler. Se escribe el dueño. */
    { n: 'em-thp', puerta: 'thp', base: {}, campo: ['thp', '220', '90'] },
    { n: 'em-gmedio', puerta: 'em_gmedio', base: {}, campo: ['em_gmedio', '12', '3'] },
    { n: 'et-gmedio', puerta: 'et_gmedio', base: {}, campo: ['et_gmedio', '9', '2'] },
    { n: 'et-thp', puerta: 'et_thp', base: {}, campo: ['et_thp', '250', '120'] },
    /* DENOMINADOR: la onda E tricuspidea solo existe con morfologia PROTESICA, y su veredicto
       pide DOS o mas criterios (CORTOS4), asi que sin un segundo criterio cargado la capsula no
       publica nada y `pinto` sale 0 — un «no falla» sobre una escena que no midio nada. */
    { n: 'et-onda-e', puerta: 'et_e_vmax', morf: ['vt_morf', 'Pr\u00f3tesis biol\u00f3gica'],
      base: { et_gmedio: '12' }, campo: ['et_e_vmax', '220', '150'] },
    { n: 'ia-pht', puerta: 'ia_pht', base: {}, campo: ['ia_pht', '180', '600'] },
    { n: 'ia-vc', puerta: 'ia_vc', base: {}, campo: ['ia_vc', '7', '2'] },
    { n: 'ea-gmedio', puerta: 'ea_gmedio', base: {}, campo: ['ea_gmedio', '45', '25'] },
    { n: 'ea-vmax', puerta: 'ea_vmax', base: {}, campo: ['ea_vmax', '4.5', '3.0'] },
    { n: 'ip-pht', puerta: 'ip_pht', base: {}, campo: ['ip_pht', '80', '200'] },
    { n: 'ep-vmax', puerta: 'ep_vmax', base: {}, campo: ['ep_vmax', '4.5', '2.0'] },
    { n: 'im-vc', puerta: 'im_vc', base: {}, campo: ['im_vc', '8', '2'] },
    /* PROTESIS: la morfologia abre los bloques protesicos. */
    { n: 'vt-prot-dvi', puerta: 'vt_dvi', morf: ['vt_morf', 'Pr\u00f3tesis biol\u00f3gica'],
      base: { et_gmedio: '5' }, campo: ['vt_dvi', '4.0', '2.0'] },
    { n: 'vt-prot-gmed', puerta: 'et_gmedio', morf: ['vt_morf', 'Pr\u00f3tesis biol\u00f3gica'],
      base: { vt_dvi: '2.0' }, campo: ['et_gmedio', '12', '4'] },
    /* DENOMINADOR: sin `vp_tipo_prot` la Tabla 15 no tiene columna y la capsula publica su
       motivo sin graduar: `pinto` sale 0. */
    { n: 'vp-prot-gmed', puerta: 'ep_gmedio', morf: ['vp_morf', 'Pr\u00f3tesis biol\u00f3gica'],
      base: { vp_tipo_prot: 'bio' }, campo: ['ep_gmedio', '25', '10'] },
    { n: 'vm-prot-dvi', puerta: 'vm_dvi', morf: ['vm_morf', 'Pr\u00f3tesis mec\u00e1nica'],
      base: {}, campo: ['vm_dvi', '3.0', '1.5'] },
    /* DENOMINADOR: la fuga paravalvular tiene DOS compuertas (PRO-B3) — morfologia protesica
       QUIRURGICA y el origen consignado como paravalvular o mixto. Sin el origen no gradua. */
    { n: 'ea-pvl-ext', puerta: 'ea_pvl_ext', morf: ['va_morf', 'Pr\u00f3tesis biol\u00f3gica'],
      base: { ea_pvl_origen: 'paraval' }, campo: ['ea_pvl_ext', '35', '5'] },
  ];

  if (corre('escenas')) {
    const r = [];
    for (const E of ESCENAS) {
      try {
        await ev(`window.__P.nuevo()`);
        /* La morfologia va ANTES de todo: es la que crea los bloques protesicos. */
        if (E.morf) {
          const a = await ev(`window.__P.abrirPara(${JSON.stringify(E.morf[0])})`);
          const op = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(E.morf[0])});
            return e ? Array.prototype.slice.call(e.options).map(function(o){ return o.value }) : null })()`);
          const elegido = (op || []).indexOf(E.morf[1]) >= 0 ? E.morf[1] : null;
          if (!elegido) { r.push({ n: E.n, err: 'SIN OPCION de morfologia', buscada: E.morf[1], opciones: op }); continue; }
          const s2 = await ev(`window.__P.sel(${JSON.stringify(E.morf[0])}, ${JSON.stringify(elegido)})`);
          if (s2 && s2.err) { r.push({ n: E.n, err: 'DENOMINADOR morf: ' + JSON.stringify(s2) }); continue; }
        }
        await ev(`window.__P.abrirPara(${JSON.stringify(E.puerta)})`);
        for (const [k, v2] of Object.entries(E.base || {})) {
          const es = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(k)});
            return e ? e.tagName : 'NO EXISTE' })()`);
          if (es === 'SELECT') { await ev(`window.__P.abrirPara(${JSON.stringify(k)})`);
                                 await ev(`window.__P.sel(${JSON.stringify(k)}, ${JSON.stringify(v2)})`); }
          else { await ev(`window.__P.abrirPara(${JSON.stringify(k)})`); await tipear(k, v2); }
        }
        await ev(`window.__P.calentar()`);
        const ref0 = await ev(`window.__P.refs()`);
        const pil0 = await ev(`window.__P.pills()`);
        let pinto = 0;
        if (E.sel) {
          /* Un <select> se "borra" volviendo a su opcion vacia, que es el gesto del medico. */
          const s3 = await ev(`window.__P.sel(${JSON.stringify(E.sel[0])}, ${JSON.stringify(E.sel[1])})`);
          if (s3 && s3.err) { r.push({ n: E.n, err: 'DENOMINADOR sel: ' + JSON.stringify(s3) }); continue; }
          const ref1 = await ev(`window.__P.refs()`);
          pinto = Object.keys(dif(ref0, ref1)).length;
          const s4 = await ev(`window.__P.sel(${JSON.stringify(E.sel[0])}, "")`);
          if (s4 && s4.err) { r.push({ n: E.n, err: 'NO SE PUEDE VACIAR el select: ' + JSON.stringify(s4) }); continue; }
        } else {
          const [id, va] = E.campo;
          await tipear(id, va);
          const ref1 = await ev(`window.__P.refs()`);
          pinto = Object.keys(dif(ref0, ref1)).length;
          await borrar(id, 'bs');
        }
        const ref2 = await ev(`window.__P.refs()`);
        const pil2 = await ev(`window.__P.pills()`);
        r.push({ n: E.n, pinto, queda: dif(ref0, ref2), pills: dif(pil0, pil2) });
      } catch (e) { r.push({ n: E.n, err: e.message }); }
      process.stderr.write('[escenas] ' + E.n + ' -> ' + (r[r.length - 1].err ? 'ERR' :
        (Object.keys(r[r.length - 1].queda || {}).length + ' quedan')) + '\n');
    }
    out.grupos.escenas = r;
  }


  /* == GRUPO salida: las superficies de SALIDA con el estado SIN DATO ==========================
     Por cada campo que el censo marco, se escribe, se borra, y se miden las SEIS superficies una
     por una. Lo que mencione el valor borrado lo esta ARRASTRANDO. */
  const FALLAN = [
    ['ao_sin','46','ao'], ['diam_ao_toracica','42','ao'],
    ['tapse','14','vd'], ['s_prime','8','vd'], ['ad_area','22','advci'],
    ['e_sep','5','dop'], ['e_lat','6','dop'],
  ];
  if (corre('salida')) {
    const r = [];
    for (const [id, va] of FALLAN) {
      try {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.calentar()`);
        const base = {};
        for (const est of ['estandar', 'narrativo', 'conciso']) base[est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
        const xl0 = await ev(`window.__P.excelDOM()`);
        await tipear(id, va);
        await borrar(id, 'bs');
        const post = {};
        for (const est of ['estandar', 'narrativo', 'conciso']) post[est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
        const xl1 = await ev(`window.__P.excelDOM()`);
        const difXl = {};
        if (xl0 && xl1 && xl0.fila && xl1.fila) {
          for (const k of Object.keys(xl1.fila)) if (xl0.fila[k] !== xl1.fila[k]) difXl[k] = [xl0.fila[k], xl1.fila[k]];
        }
        const difInf = {};
        for (const est of Object.keys(post)) {
          if (base[est].inf !== post[est].inf) difInf[est + ':inf'] = [base[est].inf, post[est].inf];
          if (base[est].suma !== post[est].suma) difInf[est + ':suma'] = [base[est].suma, post[est].suma];
        }
        r.push({ id, va, difInf, difXl, cols: [xl0 && xl0.cols, xl1 && xl1.cols] });
      } catch (e) { r.push({ id, err: e.message }); }
      process.stderr.write('[salida] ' + id + '\n');
    }
    out.grupos.salida = r;
  }

  /* == GRUPOS DE INVENTARIO (lectura previa) ================================================== */
  if (corre('inv')) {
    const inv = {};
    inv.ara = await ev(`window.__P.ara()`);
    inv.lineasb = await ev(`window.__P.lineasb()`);
    inv.fop = await ev(`window.__P.fop()`);
    inv.idsBurb = await ev(`window.__P.censoIds('burb|aneuris|sia|fop|shunt|tunel')`);
    inv.idsLinB = await ev(`window.__P.censoIds('linea|pul_')`);
    inv.spansFop = await ev(`window.__P.censoSpans('fop|burb|aneuris')`);
    /* El DVI tricuspideo hoy: con morfologia protesica y los dos VTI cargados. */
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirPara('vt_morf')`);
      await ev(`window.__P.sel('vt_morf', ${JSON.stringify('Prótesis biológica')})`);
      await ev(`window.__P.abrirPara('vt_dvi')`);
      inv.dviT0 = await ev(`window.__P.dviT()`);
      await tipear('et_vti_diast', '70');
      await ev(`window.__P.abrirPara('itv_tsvi')`);
      await tipear('itv_tsvi', '20');
      inv.dviT1 = await ev(`window.__P.dviT()`);
      await ev(`window.__P.abrirPara('vt_dvi')`);
      await tipear('vt_dvi', '3.5');
      inv.dviT2 = await ev(`window.__P.dviT()`);
    } catch (e) { inv.dviTerr = e.message; }
    inv.idsVti = await ev(`window.__P.censoIds('vti|itv')`);
    out.grupos.inv = inv;
    process.stderr.write('[inv] listo\n');
  }


  /* == GRUPO tarj: las tarjetas i, la vista 2D y el Laboratorio con el estado SIN DATO ======== */
  if (corre('tarj')) {
    const r = [];
    /* La insuficiencia tricuspidea es la que el censo marco (it_densidad), y es la que la vista
       2D y la tarjeta i leen del DOM. */
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirPara('it_densidad')`);
      await tipear('it_vc', '5');
      await ev(`window.__P.calentar()`);
      const v0 = await ev(`window.__P.v2d('tricuspide')`);
      const t0 = await ev(`window.__P.qtarj('it')`);
      await ev(`window.__P.sel('it_densidad', 'denso')`);
      const v1 = await ev(`window.__P.v2d('tricuspide')`);
      await ev(`window.__P.sel('it_densidad', "")`);
      const v2 = await ev(`window.__P.v2d('tricuspide')`);
      const t2 = await ev(`window.__P.qtarj('it')`);
      r.push({ n: 'it-densidad', v0, v1, v2, t0, t2 });
    } catch (e) { r.push({ n: 'it-densidad', err: e.message }); }
    /* El Laboratorio sobre un estudio ARCHIVADO: no lee el DOM, asi que es el CONTROL. */
    try { r.push({ n: 'lab-vacio', lab: await ev(`window.__P.lab({})`) }); }
    catch (e) { r.push({ n: 'lab-vacio', err: e.message }); }
    out.grupos.tarj = r;
    process.stderr.write('[tarj] listo\n');
  }


  /* == GRUPO pares: las referencias que necesitan DOS O MAS campos ============================
     El censo campo por campo no las ve: con un solo insumo la referencia nunca se pinta, asi que
     al borrarlo no hay nada que conservar y el campo sale «no falla». Aca se carga la base
     COMPLETA y se borra UNO. Es el hueco que el censo tiene por construccion. */
  const PARES = [
    { n: 'masa-vi',  base: { siv: '13', ddfvi: '58', ppvi: '13', peso: '80', talla: '180' }, saca: 'siv' },
    /* DENOMINADOR: la fila del espesor parietal relativo no se pinta sin la masa, que pide
       tambien el SIV: sin el, `pinto` sale 0 y el «no falla» no prueba nada. */
    { n: 'rwt',      base: { ppvi: '13', ddfvi: '58', siv: '13', peso: '80', talla: '180' }, saca: 'ppvi' },
    { n: 'geom',     base: { siv: '13', ddfvi: '58', ppvi: '13', peso: '80', talla: '180' }, saca: 'ddfvi' },
    { n: 'fa-vi',    base: { ddfvi: '58', dsfvi: '40' }, saca: 'dsfvi' },
    { n: 'ai-idx',   base: { ai_vol: '98', peso: '80', talla: '180' }, saca: 'peso' },
    { n: 'vdfvi-idx',base: { vdfvi: '160', peso: '80', talla: '180' }, saca: 'vdfvi' },
    { n: 'vsfvi-idx',base: { vsfvi: '90', peso: '80', talla: '180' }, saca: 'vsfvi' },
    { n: 'ea-val',   base: { onda_e: '95', onda_a: '50' }, saca: 'onda_a' },
    { n: 'ee-val',   base: { onda_e: '95', e_sep: '5', e_lat: '6' }, saca: 'onda_e' },
    { n: 'eprom-par',base: { e_sep: '5', e_lat: '6' }, saca: 'e_lat' },
    { n: 'fac-vd',   base: { vd_area_d: '30', vd_area_s: '18' }, saca: 'vd_area_s' },
    { n: 'pmad',     base: { vci_diam: '25' }, saca: 'vci_diam' },
    { n: 'psap',     base: { vmax_it: '3.0', vci_diam: '18' }, saca: 'vmax_it' },
    { n: 'tpsp',     base: { tapse: '18', vmax_it: '2.8', vci_diam: '18' }, saca: 'tapse' },
    { n: 'avm-thp',  base: { thp: '150' }, saca: 'thp' },
    { n: 'ava-cont', base: { ea_dtsvi: '20', ea_vtitsvi: '20', ea_vtiao: '56' }, saca: 'ea_vtiao' },
    { n: 'dvi-ao',   base: { ea_vtitsvi: '20', ea_vtiao: '56' }, saca: 'ea_vtitsvi' },
    { n: 'qp-vd',    base: { tsvd_diametro: '20', vti_tsvd: '20' }, saca: 'vti_tsvd' },
  ];
  if (corre('pares')) {
    const r = [];
    for (const P of PARES) {
      try {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.calentar()`);
        const ref0 = await ev(`window.__P.refs()`);
        for (const [k, v2] of Object.entries(P.base)) { await ev(`window.__P.abrirPara(${JSON.stringify(k)})`); await tipear(k, v2); }
        const ref1 = await ev(`window.__P.refs()`);
        await borrar(P.saca, 'bs');
        const ref2 = await ev(`window.__P.refs()`);
        /* ⚠️ EL DENOMINADOR CORRECTO NO ES EL FORMULARIO VACIO: es «la misma base MENOS el campo
           sacado, cargada desde limpio». Comparar contra el vacio informa como defecto todo span
           que refleje un campo que SIGUE cargado -el peso, la talla, la VCI, el e prima-: la
           primera corrida de este grupo dio 9 de 18 «fallando» y siete eran eso. */
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.calentar()`);
        for (const [k, v3] of Object.entries(P.base)) {
          if (k === P.saca) continue;
          await ev(`window.__P.abrirPara(${JSON.stringify(k)})`);
          await tipear(k, v3);
        }
        await ev(`window.__P.calentar()`);
        const ref3 = await ev(`window.__P.refs()`);
        r.push({ n: P.n, saca: P.saca, pinto: Object.keys(dif(ref0, ref1)).length,
                 arrastre: dif(ref3, ref2), quedaVsVacio: Object.keys(dif(ref0, ref2)).length });
      } catch (e) { r.push({ n: P.n, err: e.message }); }
      process.stderr.write('[pares] ' + P.n + ' -> ' + (r[r.length-1].err ? 'ERR'
        : (Object.keys(r[r.length-1].arrastre||{}).length + ' arrastran')) + '\n');
    }
    out.grupos.pares = r;
  }


  /* == GRUPO ab: el A/B de CONTROL contra el inicio de la tanda ================================
     Con el formulario VACIO y con un escenario CARGADO en las zonas que esta tanda toca. Mide las
     seis superficies una por una -informe en tres estilos, EN SUMA, las 440 columnas del Excel y
     el juego de campos del estudio- mas las referencias de pantalla. Todo lo que cambie fuera de
     lo autorizado es un defecto. */
  const ESC_AB = {
    vacio: {},
    cargado: { peso: '80', talla: '180', edad: '62',
               ai_diam: '44', ai_area: '26', ai_vol: '98',
               siv: '13', ddfvi: '58', dsfvi: '40', ppvi: '13', fevi: '45',
               ao_sin: '46', ao_st: '45', ao_tub: '47', diam_cayado: '46', diam_ao_toracica: '42',
               tapse: '14', s_prime: '8', vd_bas: '45', vd_pared: '7', ad_area: '22',
               vci_diam: '25', vmax_it: '3.0',
               onda_e: '95', onda_a: '50', e_sep: '5', e_lat: '6', thp: '150', tde: '180' },
    ajeno: { im_vc: '8', ea_vmax: '4.5', ea_gmedio: '45', it_vc: '8', ip_pht: '80',
             em_gmedio: '12', ep_vmax: '4.5' },
  };
  if (corre('ab')) {
    const r = {};
    for (const [nom, campos] of Object.entries(ESC_AB)) {
      try {
        await ev(`window.__P.nuevo()`);
        for (const [k, v2] of Object.entries(campos)) {
          await ev(`window.__P.abrirPara(${JSON.stringify(k)})`);
          await tipear(k, v2);
        }
        await ev(`window.__P.calentar()`);
        const o = { refs: await ev(`window.__P.refs()`), pills: await ev(`window.__P.pills()`),
                    campos: await ev(`window.__P.camposGuardados()`) };
        for (const est of ['estandar', 'narrativo', 'conciso']) o['inf:' + est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
        const xl = await ev(`window.__P.excelDOM()`);
        o.cols = xl && xl.cols; o.xl = xl && xl.fila;
        r[nom] = o;
      } catch (e) { r[nom] = { err: e.message }; }
      process.stderr.write('[ab] ' + nom + '\n');
    }
    out.grupos.ab = r;
  }


  /* == GRUPO sal2: las SEIS SUPERFICIES DE SALIDA con el estado SIN DATO =======================
     El informe, el EN SUMA y el Excel ya salieron limpios en el grupo `salida`. Lo que falta son
     las que LEEN EL DOM de las capsulas: el PDF en sus SEIS plantillas, el PPT estadistico, el
     PDF de auditoria del Laboratorio, las tarjetas i del Q y la vista 2D.
     El metodo es el mismo: formulario vacio calentado (base) -> escribir los once campos que
     fallaban -> borrarlos todos -> volver a medir. Lo que mencione un valor borrado lo arrastra. */
  const PLANTILLAS = ['clasico', 'moderno', 'minimalista', 'academico', 'compacto', 'elegante'];
  const ONCE = [['ao_sin','46'], ['ao_st','45'], ['ao_tub','47'], ['diam_cayado','46'],
                ['diam_ao_toracica','42'], ['tapse','14'], ['s_prime','8'], ['ad_area','22'],
                ['e_sep','5'], ['e_lat','6']];
  if (corre('sal2')) {
    const r = {};
    async function medir() {
      const o = {};
      o.refs = await ev(`window.__P.refs()`);
      for (const pl of PLANTILLAS) {
        const d = await ev(`window.__P.pdf(${JSON.stringify(pl)})`, 60000);
        o['pdf:' + pl] = (d && d.textos) ? { n: d.nTextos, f: d.nFigs, t: d.textos.join('|') } : d;
      }
      o.ppt = await ev(`window.__P.labPPT([])`, 60000);
      o.audit = await ev(`window.__P.labAudit([])`, 60000);
      o.v2dTri = await ev(`window.__P.v2d('tricuspide')`);
      o.v2dAo = await ev(`window.__P.v2d('aortica')`);
      o.lab = await ev(`window.__P.lab({})`);
      return o;
    }
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      r.base = await medir();
      for (const [k, v2] of ONCE) { await ev(`window.__P.abrirPara(${JSON.stringify(k)})`); await tipear(k, v2); }
      await ev(`window.__P.abrirPara('it_densidad')`);
      await tipear('it_vc', '5');
      await ev(`window.__P.sel('it_densidad', 'denso')`);
      await ev(`window.__P.calentar()`);
      r.conDato = { refs: await ev(`window.__P.refs()`) };
      for (const [k] of ONCE) await borrar(k, 'bs');
      await borrar('it_vc', 'bs');
      await ev(`window.__P.sel('it_densidad', "")`);
      await ev(`window.__P.calentar()`);
      r.post = await medir();
    } catch (e) { r.err = e.message; }
    out.grupos.sal2 = r;
    process.stderr.write('[sal2] listo\n');
  }


  /* == GRUPO qtar: las tarjetas i del Q y las de L y M con el estado SIN DATO =================
     Las ocho de valvula LEEN `_v2dPorQue` y `_v2dPastilla`, que leen el textContent de las
     capsulas: un span que conserva el valor viejo les llega tal cual. Las de L y M (AI, VI, VD,
     AD, aorta) SONDEAN al dueno y publican el valor del paciente, asi que tambien lo verian.
     El metodo es el de siempre: base calentada -> cargar -> borrar -> comparar. */
  const QTARJ = ['tarj-insuf-tricuspide', 'tarj-esten-aortica', 'tarj-insuf-mitral',
                 'ad-card', 'ai-card', 'vd-fun-card', 'vd-tam-card', 'ao-card', 'vi-card',
                 'tapse-psap', 'tarj-diast'];
  if (corre('qtar')) {
    const r = {};
    const leer = async () => {
      const o = {};
      for (const k of QTARJ) o[k] = await ev(`window.__P.qtarj(${JSON.stringify(k)})`, 30000);
      return o;
    };
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      /* Las puertas: la pestaña y las secciones de valvula nacen cerradas y sus globos miden
         0 x 0 sin abrirlas. Se usa el mismo abridor del censo. */
      for (const k of ['it_vc', 'ea_vmax', 'im_vc', 'ad_area', 'ai_vol', 'tapse', 'ao_sin', 'ddfvi', 'onda_e'])
        await ev(`window.__P.abrirPara(${JSON.stringify(k)})`);
      r.base = await leer();
      const CARGA = { it_vc: '8', ea_vmax: '4.5', im_vc: '8', ad_area: '22', ai_vol: '98',
                      tapse: '14', s_prime: '8', ao_sin: '46', ddfvi: '58', siv: '13', ppvi: '13',
                      peso: '80', talla: '180', onda_e: '95', e_sep: '5', e_lat: '6',
                      vmax_it: '3.0', vci_diam: '18' };
      for (const [k, v2] of Object.entries(CARGA)) { await ev(`window.__P.abrirPara(${JSON.stringify(k)})`); await tipear(k, v2); }
      await ev(`window.__P.sel('it_densidad', 'denso')`);
      await ev(`window.__P.calentar()`);
      r.conDato = await leer();
      for (const k of Object.keys(CARGA)) await borrar(k, 'bs');
      await ev(`window.__P.sel('it_densidad', "")`);
      await ev(`window.__P.calentar()`);
      r.post = await leer();
    } catch (e) { r.err = e.message; }
    out.grupos.qtar = r;
    process.stderr.write('[qtar] listo\n');
  }


  /* == GRUPO arab: los bordes del Ar-A (29, 30 y 31 ms) en TODAS las superficies ==============
     El Ar-A no es un campo: es `venp_dur_ar - venp_dur_a`, asi que el borde se alcanza fijando
     la duracion de la A y moviendo la de la Ar. Con A = 100 ms, una Ar de 129/130/131 da 29/30/31.
     Se miden: la fila de la vena pulmonar (ASE/EACVI 2016), el paso suplementario de la ASE 2025
     y los dos de la BSE 2024, mas el informe en los tres estilos y la celda del PDF. */
  if (corre('arab')) {
    const r = [];
    for (const guia of ['ase2025', 'bse2024', 'ase2016']) {
      for (const ar of ['129', '130', '131']) {
        try {
          await ev(`window.__P.nuevo()`);
          await ev(`window.__P.abrirPara('venp_dur_a')`);
          const g = await ev(`window.__P.sel('diast_algoritmo', ${JSON.stringify(guia)})`);
          if (g && g.err) throw new Error('DENOMINADOR diast_algoritmo: ' + JSON.stringify(g));
          /* La base deja la zona con un criterio ya positivo, para que el suplementario se
             CONSULTE: sin eso el algoritmo cierra antes y el borde no se puede medir. */
          for (const [k, v2] of Object.entries({ venp_dur_a: '100', venp_dur_ar: ar,
                                                 onda_e: '95', onda_a: '50', e_sep: '5', e_lat: '6' })) {
            await ev(`window.__P.abrirPara(${JSON.stringify(k)})`);
            await tipear(k, v2);
          }
          await ev(`window.__P.calentar()`);
          const o = { guia, ar, ara: await ev(`window.__P.ara()`) };
          for (const est of ['estandar', 'narrativo', 'conciso']) o['inf:' + est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
          const d = await ev(`window.__P.pdf('clasico')`, 60000);
          o.pdfAra = (d && d.textos) ? d.textos.filter((t) => String(t).indexOf('Ar-A') >= 0 || String(t).indexOf('ms') >= 0).slice(0, 6) : d;
          r.push(o);
        } catch (e) { r.push({ guia, ar, err: e.message }); }
      }
      process.stderr.write('[arab] ' + guia + '\n');
    }
    out.grupos.arab = r;
  }


  /* == GRUPO dvit: el DVI tricuspideo automatico (ARR6) ======================================= */
  if (corre('dvit')) {
    const r = [];
    const BIO = 'Prótesis biológica';
    async function escDvi(nom, pasos) {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirPara('vt_morf')`);
      const g = await ev(`window.__P.sel('vt_morf', ${JSON.stringify(BIO)})`);
      if (g && g.err) throw new Error('DENOMINADOR vt_morf: ' + JSON.stringify(g));
      await ev(`window.__P.abrirPara('vt_dvi')`);
      await ev(`window.__P.abrirPara('itv_tsvi')`);
      for (const [k, v2] of pasos) {
        if (v2 === '') { await borrar(k, 'bs'); continue; }
        await ev(`window.__P.abrirPara(${JSON.stringify(k)})`);
        /* El DVI pasa a SOLO LECTURA cuando los dos VTI estan: mandarle una tecla ahi es un gesto
           que no existe, y `tipear` aborta nombrandolo. Se escribe solo cuando se puede. */
        const ro = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(k)});
          return !!(e && (e.readOnly || e.disabled)) })()`);
        if (ro) { r.push({ n: nom, aviso: 'CAMPO DE SOLO LECTURA al intentar escribir ' + k }); continue; }
        await tipear(k, v2);
      }
      await ev(`window.__P.calentar()`);
      return Object.assign({ n: nom }, await ev(`window.__P.dviT()`));
    }
    const ESC = [
      ['sin nada',            []],
      ['solo VTI entrada',    [['et_vti_diast','70']]],
      ['solo VTI TSVI',       [['itv_tsvi','20']]],
      ['los dos: 70/20=3.50', [['et_vti_diast','70'], ['itv_tsvi','20']]],
      ['borde 3.29 (65.8/20)',[['et_vti_diast','65.8'], ['itv_tsvi','20']]],
      ['borde 3.30 (66/20)',  [['et_vti_diast','66'], ['itv_tsvi','20']]],
      ['borde 3.31 (66.2/20)',[['et_vti_diast','66.2'], ['itv_tsvi','20']]],
      ['y se borra un VTI',   [['et_vti_diast','70'], ['itv_tsvi','20'], ['itv_tsvi','']]],
    ];
    for (const [nom, pasos] of ESC) {
      try { r.push(await escDvi(nom, pasos)); } catch (e) { r.push({ n: nom, err: e.message }); }
      process.stderr.write('[dvit] ' + nom + '\n');
    }
    /* MECANICA: el corte es 2.1, asi que el borde se mide con otro par. */
    for (const [nom, pasos] of [['mec 2.09 (41.8/20)', [['et_vti_diast','41.8'], ['itv_tsvi','20']]],
                                ['mec 2.10 (42/20)',   [['et_vti_diast','42'], ['itv_tsvi','20']]]]) {
      try {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.abrirPara('vt_morf')`);
        await ev(`window.__P.sel('vt_morf', ${JSON.stringify('Prótesis mecánica')})`);
        await ev(`window.__P.abrirPara('vt_dvi')`); await ev(`window.__P.abrirPara('itv_tsvi')`);
        for (const [k, v2] of pasos) { await ev(`window.__P.abrirPara(${JSON.stringify(k)})`); await tipear(k, v2); }
        await ev(`window.__P.calentar()`);
        r.push(Object.assign({ n: nom }, await ev(`window.__P.dviT()`)));
      } catch (e) { r.push({ n: nom, err: e.message }); }
    }
    /* UN ESTUDIO GUARDADO CON UN DVI TIPEADO REABRE COMO SE GUARDO: se arma el registro con los
       tres campos y se abre por la ruta real de restauracion. */
    try {
      const campos = { vt_morf: BIO, et_vti_diast: '70', itv_tsvi: '20', vt_dvi: '9.99' };
      const ab = await ev(`window.__P.abrirComoEstudio(${JSON.stringify(campos)})`, 40000);
      r.push({ n: 'estudio guardado con DVI tipeado', abrir: ab,
               estado: await ev(`window.__P.dviT()`) });
    } catch (e) { r.push({ n: 'estudio guardado', err: e.message }); }
    out.grupos.dvit = r;
  }

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  process.stdout.write(JSON.stringify(OUT, null, 1));
  cdp.close(); srv.close(); process.exit(0);
}

main().catch(async (e) => {
  process.stdout.write(JSON.stringify({ err: e.message, stack: String(e.stack || '').slice(0, 1200) }, null, 1));
  process.exit(1);
});
