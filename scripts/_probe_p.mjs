#!/usr/bin/env node
/**
 * _probe_p.mjs - sonda A/B de SOLO LECTURA para la tanda P (Referencias con subpestanas,
 * buscador, «Ver referencia», la pestana Aorta y la tabla de cirugia, 2026-10-18).
 *
 * TODA la infraestructura de scripts/_probe_arr.mjs se reusa tal cual -teclas y clics reales,
 * cierre del arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su
 * denominador, md5 al principio y al final-. NO muta index.html.
 *
 *   node scripts/_probe_p.mjs --file /tmp/index.PHEAD.html --solo censo > /tmp/p.HEAD.json
 *   node scripts/_probe_p.mjs                              --solo censo > /tmp/p.NEW.json
 *
 * Grupos:
 *   censo   - el censo de entradas de Referencias por titulo, con su conteo y su subpestana.
 *   subtabs - las cinco subpestanas: clics reales, teclado, roles, y el ciclo de 20 aperturas.
 *   buscar  - el buscador: «RWT», «0,42», «0.42», sin resultados, limpiar.
 *   verref  - el boton «Ver referencia» desde cuatro tarjetas y el «Volver».
 *   aorta   - la subpestana Aorta: los dos bloques y la tabla de cirugia.
 *   vdref   - la entrada del VD contra su dueno.
 *   maqueta - cuatro anchos por dos temas, color real y scroll horizontal de la pagina.
 *   ctrl    - los controles: informe, EN SUMA, Excel en 440, PDF, PPT, auditoria, Laboratorio.
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

  /* ══ HELPERS PROPIOS DE ESTA TANDA ════════════════════════════════════════════════════════
     Van en una segunda sonda (`SONDA2`) en vez de dentro del template de la primera, para no
     tocar una infraestructura que cinco tandas ya usan. check_backticks.py NO alcanza este
     bloque —su cobertura es el cuerpo de un caso y el de la sonda inyectada—, asi que aca manda
     `node --check`. */
  /* ⚠️ `String.raw` Y NO UN TEMPLATE NORMAL: dentro de un template literal la barra invertida
     se COCINA —`\s` llega al motor como la letra `s` y borra todas las eses, y `\(` llega como
     un parentesis que deja el grupo sin cerrar—. Las dos trampas estan escritas en CLAUDE.md y
     las dos las pague en esta misma sonda. Con `String.raw` el texto llega literal. */
  await evCrudo(String.raw`Object.assign(window.__P, {

  /* El censo de entradas de Referencias, por TITULO. Lo que cuenta es el <h2.card-head> con un
     onclick de toggleRef dentro de #tab-refs: eso es «una entrada», y es la misma definicion
     antes y despues de la tanda. Devuelve ademas en que panel vive cada una, que en HEAD es
     null porque los paneles no existen. */
  refCenso: function () {
    var out = [], tab = document.getElementById('tab-refs');
    if (!tab) return { err: 'NO EXISTE tab-refs' };
    var hs = tab.querySelectorAll('h2.card-head');
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i], oc = h.getAttribute('onclick') || '';
      var m = oc.match(/toggleRef\('([a-z0-9]+)'/);
      if (!m) continue;
      var tit = (h.textContent || '').replace(/[▶▼]/g, '').replace(/\s+/g, ' ').trim();
      var pan = h.closest('.ref-subpanel');
      out.push({ id: m[1], tit: tit, sub: pan ? String(pan.id || '').replace(/^ref-sub-/, '') : null });
    }
    return { n: out.length, filas: out };
  },

  /* Clic REAL en una subpestana. Devuelve que panel quedo activo y como quedaron los roles. */
  refSub: function (sub) {
    var b = document.getElementById('ref-subtab-' + sub);
    if (!b) return { err: 'NO EXISTE ref-subtab-' + sub };
    var r = b.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return { err: 'SIN GEOMETRIA ref-subtab-' + sub };
    b.click();
    return window.__P.refSubEstado();
  },

  refSubEstado: function () {
    var O = (typeof REF_SUB_ORDEN !== 'undefined') ? REF_SUB_ORDEN : ['dim','fun','valv','ao','otros'];
    var o = { activa: (typeof window._refSubActivaLeer === 'function') ? window._refSubActivaLeer() : null,
              paneles: {}, botones: {} };
    for (var i = 0; i < O.length; i++) {
      var k = O[i], p = document.getElementById('ref-sub-' + k), b = document.getElementById('ref-subtab-' + k);
      o.paneles[k] = p ? { activo: p.classList.contains('active'),
                           display: getComputedStyle(p).display,
                           entradas: p.querySelectorAll('h2.card-head').length,
                           rol: p.getAttribute('role') } : null;
      o.botones[k] = b ? { activo: b.classList.contains('active'), sel: b.getAttribute('aria-selected'),
                           rol: b.getAttribute('role'), ti: b.tabIndex,
                           controla: b.getAttribute('aria-controls'),
                           color: getComputedStyle(b).color,
                           borde: getComputedStyle(b).borderBottomColor } : null;
    }
    var bar = document.querySelector('#tab-refs .ref-subbar');
    o.barra = bar ? { rol: bar.getAttribute('role'), wrap: getComputedStyle(bar).flexWrap,
                      ovx: getComputedStyle(bar).overflowX,
                      w: Math.round(bar.getBoundingClientRect().width),
                      sw: bar.scrollWidth } : null;
    return o;
  },

  /* Ancho del DOCUMENTO contra el del viewport: lo que mide «sin scroll horizontal de la pagina». */
  anchoPagina: function () {
    var de = document.documentElement;
    return { sw: de.scrollWidth, cw: de.clientWidth, desborda: de.scrollWidth > de.clientWidth };
  },

  /* El texto de integracion del VAL: donde vive y que dice. */
  integ: function () {
    var e = document.getElementById('ref-integracion');
    if (!e) return { err: 'NO EXISTE ref-integracion' };
    var pan = e.closest('.ref-subpanel');
    var st = getComputedStyle(e);
    return { sub: pan ? String(pan.id || '').replace(/^ref-sub-/, '') : null,
             ultimo: e.parentNode ? (e.parentNode.lastElementChild === e) : null,
             fs: st.fontSize, color: st.color, vis: window.__P.vis('ref-integracion'),
             txt: (e.textContent || '').replace(/\s+/g, ' ').trim() };
  },

  /* ⚠️ EL HELPER camposGuardados DE LA INFRA BARRE input[id] SIN PASAR POR
     _noEsDelEstudio, asi que mide «campos del DOM» y no «campos del ESTUDIO»: con el buscador
     puesto informa 1023 donde el recolector real guarda 1022, y eso se lee igual que «el campo
     nuevo viaja con el estudio». Este helper usa el MISMO predicado que guardarInforme.
     Y SIN UN SOLO ACENTO GRAVE: estos comentarios viven DENTRO del template de la sonda y un
     acento grave aca lo cierra. check_backticks.py no alcanza este bloque; lo dio node --check. */
  camposEstudio: function () {
    if (typeof _noEsDelEstudio !== 'function') return { err: 'SIN _noEsDelEstudio' };
    var c = {};
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function (e) {
      if (_noEsDelEstudio(e.id)) return;
      c[e.id] = e.value;
    });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function (e) {
      if (_noEsDelEstudio(e.id)) return;
      c[e.id + '__chk'] = e.checked ? '1' : '0';
    });
    var ks = Object.keys(c).sort(), h = 0;
    var s2 = ks.map(function (k) { return k + '=' + c[k] }).join('|');
    for (var i = 0; i < s2.length; i++) { h = ((h << 5) - h + s2.charCodeAt(i)) | 0 }
    return { n: ks.length, hash: h, refs: ks.filter(function (k) { return k.indexOf('ref-') === 0 }) };
  },

  /* Nodos de la pestana, para el ciclo de aperturas. */
  nodosRefs: function () {
    var t = document.getElementById('tab-refs');
    return t ? t.querySelectorAll('*').length : -1;
  }

})`);
  process.stderr.write('[sonda2] cargada\n');

  /* ══ GRUPO censo ══════════════════════════════════════════════════════════════════════════ */
  if (corre('censo')) {
    const r = {};
    try {
      await ev(`(function(){ showTab('refs'); return 1 })()`);
      r.censo = await ev(`window.__P.refCenso()`);
      /* El texto de integracion se mide con la subpestana de Valvulas ACTIVA: en cualquier otra
         su panel esta en display:none y `vis` informa false sobre un texto perfecto. */
      await ev(`window.__P.refSub('valv')`);
      r.integ = await ev(`window.__P.integ()`);
      await ev(`window.__P.refSub('dim')`);
    } catch (e) { r.err = e.message; }
    out.grupos.censo = r;
    process.stderr.write('[censo] listo\n');
  }

  /* ══ GRUPO subtabs ════════════════════════════════════════════════════════════════════════ */
  if (corre('subtabs')) {
    const r = { porSub: {} };
    try {
      await ev(`(function(){ showTab('refs'); return 1 })()`);
      r.inicial = await ev(`window.__P.refSubEstado()`);
      for (const k of ['dim', 'fun', 'valv', 'ao', 'otros']) {
        r.porSub[k] = await ev(`window.__P.refSub(${JSON.stringify(k)})`);
      }
      /* TECLADO: con el foco en el boton activo, las flechas mueven. */
      r.teclado = [];
      await ev(`(function(){ var b=document.getElementById('ref-subtab-dim');
        if(b){ refSubTab('dim', b); b.focus(); } return document.activeElement.id })()`);
      for (const k of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'End', 'Home']) {
        await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k }, sessionId);
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k }, sessionId);
        r.teclado.push({ tecla: k,
          activa: await ev(`window._refSubActivaLeer()`),
          foco: await ev(`document.activeElement ? document.activeElement.id : null`) });
      }
      /* CICLO: 20 vueltas por las cinco subpestanas y 20 aperturas de una entrada. */
      r.nodos0 = await ev(`window.__P.nodosRefs()`);
      for (let i = 0; i < 20; i++) {
        for (const k of ['dim', 'fun', 'valv', 'ao', 'otros']) {
          await ev(`(function(){ var b=document.getElementById('ref-subtab-${k}'); if(b) b.click(); return 1 })()`);
        }
      }
      r.nodos1 = await ev(`window.__P.nodosRefs()`);
      await ev(`window.__P.refSub('dim')`);
      /* ⚠️ UNA VUELTA DE CALENTAMIENTO ANTES DE CONTAR. Las cinco entradas nuevas arman su
         cuerpo la PRIMERA vez que se abren (`evRefPintar`), asi que sin esto la sonda informa
         +82 nodos sobre una entrada que no acumula ninguno. Es la leccion del L y del PRO-C,
         pagada otra vez: medido sin calentar, 1126 -> 1208. */
      await ev(`(function(){ var h=document.querySelector('#ref-sub-dim h2.card-head');
        if(h){ h.click(); h.click(); } return 1 })()`);
      r.nodos1b = await ev(`window.__P.nodosRefs()`);
      for (let i = 0; i < 20; i++) {
        await ev(`(function(){ var h=document.querySelector('#ref-sub-dim h2.card-head');
          if(h) h.click(); return 1 })()`);
      }
      r.nodos2 = await ev(`window.__P.nodosRefs()`);
      r.tras20 = await ev(`window.__P.vis('ref-ai')`);
    } catch (e) { r.err = e.message; }
    out.grupos.subtabs = r;
    process.stderr.write('[subtabs] listo\n');
  }

  /* ══ GRUPO buscar ════════════════════════════════════════════════════════════════════════
     El campo se escribe con TECLAS REALES: `Input.insertText` mas el `input` nativo que el
     navegador despacha, para que el oyente del buscador corra como con el medico. */
  if (corre('buscar')) {
    const r = { consultas: {} };
    const CONS = ['RWT', '0,42', '0.42', 'rwt', 'TAPSE', 'xyzqnoexiste', 'wilkins'];
    try {
      await ev(`(function(){ showTab('refs'); return 1 })()`);
      r.existe = await ev(`window.__P.existe('ref-busca')`);
      r.indice = await ev(`(function(){ var i = window._refIndiceArmar(true);
        return { n: i.length, ids: i.map(function(e){return e.id}),
                 largos: i.map(function(e){return e.txt.length}) } })()`);
      for (const q of CONS) {
        await ev(`(function(){ var e=document.getElementById('ref-busca'); e.focus();
          e.setSelectionRange(0,(e.value||'').length); return 1 })()`);
        await tecla('Delete');
        await cdp.send('Input.insertText', { text: q }, sessionId);
        /* `insertText` NO despacha `input` por si mismo en todos los casos: se despacha a mano,
           igual que hace `tipear`, y se comprueba que el valor quedo. */
        await ev(`(function(){ var e=document.getElementById('ref-busca');
          e.dispatchEvent(new Event('input',{bubbles:true})); return e.value })()`);
        const val = await ev(`document.getElementById('ref-busca').value`);
        if (val !== q) { r.consultas[q] = { err: 'EL TECLEO NO QUEDO: ' + val }; continue; }
        r.consultas[q] = await ev(`(function(){
          var res = document.getElementById('ref-busca-res');
          var hits = res ? res.querySelectorAll('.ref-busc-hit') : [];
          var ids = []; for (var i=0;i<hits.length;i++) ids.push(hits[i].dataset.refId);
          var subs = []; for (var i=0;i<hits.length;i++) subs.push(hits[i].querySelector('.ref-busc-sub').textContent);
          var vac = res ? res.querySelector('.ref-busc-vacio') : null;
          return { display: res ? getComputedStyle(res).display : null, n: hits.length, ids: ids,
                   subs: subs, vacio: vac ? vac.textContent : null,
                   cab: res && res.querySelector('.ref-busc-cab') ? res.querySelector('.ref-busc-cab').textContent : null } })()`);
      }
      /* TOCAR UNA COINCIDENCIA: abre la entrada, activa su subpestana y la resalta. */
      await ev(`(function(){ var e=document.getElementById('ref-busca'); e.focus();
        e.setSelectionRange(0,(e.value||'').length); return 1 })()`);
      await tecla('Delete');
      await cdp.send('Input.insertText', { text: 'RWT' }, sessionId);
      await ev(`(function(){ var e=document.getElementById('ref-busca');
        e.dispatchEvent(new Event('input',{bubbles:true})); return 1 })()`);
      r.toque = await ev(`(function(){
        var h = document.querySelector('#ref-busca-res .ref-busc-hit');
        if (!h) return { err: 'SIN COINCIDENCIA' };
        var id = h.dataset.refId;
        h.click();
        var cuerpo = document.getElementById('ref-' + id);
        var card = cuerpo ? cuerpo.closest('.card') : null;
        return { id: id, activa: window._refSubActivaLeer(),
                 abierta: cuerpo ? (cuerpo.style.display !== 'none') : null,
                 destacada: card ? card.classList.contains('ref-destacada') : null,
                 vis: window.__P.vis('ref-' + id) } })()`);
      /* EL BOTON DE LIMPIAR, con clic real. */
      r.limpiar = await ev(`(function(){
        var b = document.getElementById('ref-busca-limpiar');
        if (!b) return { err: 'NO EXISTE el boton' };
        var g = b.getBoundingClientRect();
        if (!(g.width > 0 && g.height > 0)) return { err: 'SIN GEOMETRIA' };
        b.click();
        var res = document.getElementById('ref-busca-res');
        return { valor: document.getElementById('ref-busca').value,
                 display: getComputedStyle(res).display,
                 hits: res.querySelectorAll('.ref-busc-hit').length,
                 foco: document.activeElement ? document.activeElement.id : null } })()`);
      /* NO PERSISTE: ninguna clave del navegador nombra la busqueda. */
      r.almacen = await ev(`(function(){ var o = window.__P.almacen();
        var n = (o.ls || []).concat(o.ss || []).filter(function(k){
          return String(k).indexOf('ref_busc') >= 0 || String(k).indexOf('ref-busca') >= 0
              || String(k).indexOf('refsub') >= 0 || String(k).indexOf('ref_sub') >= 0 });
        return { nombran: n } })()`);
    } catch (e) { r.err = e.message; }
    out.grupos.buscar = r;
    process.stderr.write('[buscar] listo\n');
  }

  /* ══ GRUPO verref ════════════════════════════════════════════════════════════════════════
     Las cuatro tarjetas que la orden nombra —una de AORTA, una de AI o VI, una de VALVULA y una
     del CORTOS— mas el assert del mapeo y el censo de las que NO llevan boton. Los globos viven
     en CINCO pestanas y las secciones de valvula nacen cerradas: se abre la puerta del PROPIO
     boton con `puertaDe`, que es el abridor de TC-500. */
  if (corre('verref')) {
    const r = { tarjetas: {} };
    const CUATRO = ['ao-card', 'vi-card', 'tarj-insuf-mitral', 'otr-burbujas'];
    try {
      r.assert = await ev(`window._vinfoRefAssert()`);
      /* ⚠️ VINFO ES UN const DE MODULO Y NO UNA PROPIEDAD DE window —la trampa que CLAUDE.md
         ya tiene escrita— asi que el censo de claves sale del DOM: los [data-vinfo] que el
         marcado declara. VINFO_REF si esta exportada. */
      r.mapa = await ev(`(function(){
        var ks = {}; var bs = document.querySelectorAll('[data-vinfo]');
        for (var i=0;i<bs.length;i++) ks[bs[i].getAttribute('data-vinfo')] = 1;
        var dom = Object.keys(ks).sort();
        var sin = dom.filter(function(c){ return !window.VINFO_REF[c] });
        return { conBoton: Object.keys(window.VINFO_REF).length, enDOM: dom.length,
                 sinBoton: sin } })()`);
      /* ⚠️ EL GLOBO DEL TEST DE BURBUJA VIVE DENTRO DE UNA SECCION QUE NACE CERRADA
         (`#ete-seccion-burbuja`, con su propio `toggleEteSeccion`), que `puertaDe` no abre: sin
         esto mide 0 x 0 y la sonda informa «SIN GEOMETRIA» sobre un globo que el medico ve.
         Se abre con su toggle REAL, el gesto del medico. */
      await ev(`(function(){ var h = document.querySelector('[onclick*="toggleEteSeccion(\\'burbuja\\'"]');
        if (h) h.click(); var s = document.getElementById('ete-seccion-burbuja');
        return s ? getComputedStyle(s).display : 'NO EXISTE' })()`);
      /* Y se desplaza la pagina ANTES de medir, para que el «Volver» tenga denominador: con
         scrollY en 0 en las dos puntas, «volvio a la posicion» pasa sin medir nada. */
      for (const clave of CUATRO) {
        const o = {};
        o.puerta = await ev(`window.__P.puertaDe(${JSON.stringify(clave)})`);
        o.scrollPrevio = await ev(`(function(){ window.scrollTo(0, 400); return window.scrollY })()`);
        /* Clic REAL en el globo. */
        o.abrir = await ev(`(function(){
          var b = document.querySelector('[data-vinfo=' + JSON.stringify(${JSON.stringify(clave)}) + ']');
          if (!b) return { err: 'NO EXISTE el globo' };
          var g = b.getBoundingClientRect();
          if (!(g.width > 0 && g.height > 0)) return { err: 'SIN GEOMETRIA ' + g.width + 'x' + g.height };
          b.click();
          var c = document.getElementById('vinfo-card');
          var vr = c ? c.querySelector('.vinfo-verref') : null;
          return { abierta: c ? getComputedStyle(c).display : null,
                   tieneBoton: !!vr, destino: vr ? vr.dataset.refDestino : null,
                   txt: vr ? vr.textContent : null,
                   color: vr ? getComputedStyle(vr).color : null,
                   dentroDelViewport: c ? (c.getBoundingClientRect().bottom <= innerHeight + 1) : null } })()`);
        if (!o.abrir.err && o.abrir.tieneBoton) {
          o.ir = await ev(`(function(){
            var antesTab = document.querySelector('.tab-section.active');
            var antesY = window.scrollY;
            var c = document.getElementById('vinfo-card');
            var vr = c.querySelector('.vinfo-verref');
            vr.click();
            var dest = vr.dataset.refDestino;
            var cuerpo = document.getElementById('ref-' + dest);
            var card = cuerpo ? cuerpo.closest('.card') : null;
            var sec = document.querySelector('.tab-section.active');
            var w = document.getElementById('ref-volver-wrap');
            return { desdeTab: antesTab ? antesTab.id : null, desdeY: antesY,
                     tarjetaCerrada: getComputedStyle(c).display === 'none',
                     tabAhora: sec ? sec.id : null,
                     activa: window._refSubActivaLeer(),
                     abierta: cuerpo ? (cuerpo.style.display !== 'none') : null,
                     destacada: card ? card.classList.contains('ref-destacada') : null,
                     vis: window.__P.vis('ref-' + dest),
                     volverVis: w ? { hidden: w.hidden, display: getComputedStyle(w).display } : null,
                     volverDe: (document.getElementById('ref-volver-de')||{}).textContent } })()`);
          o.volver = await ev(`(function(){
            var b = document.getElementById('ref-volver');
            if (!b) return { err: 'NO EXISTE ref-volver' };
            var g = b.getBoundingClientRect();
            if (!(g.width > 0 && g.height > 0)) return { err: 'SIN GEOMETRIA ref-volver' };
            var v = window._refVueltaLeer();
            b.click();
            var sec = document.querySelector('.tab-section.active');
            var w = document.getElementById('ref-volver-wrap');
            return { esperada: v, tabAhora: sec ? sec.id : null, y: window.scrollY,
                     volverEscondido: w ? w.hidden : null,
                     vuelta: window._refVueltaLeer() } })()`);
        }
        r.tarjetas[clave] = o;
      }
    } catch (e) { r.err = e.message; }
    out.grupos.verref = r;
    process.stderr.write('[verref] listo\n');
  }

  /* ══ GRUPO aorta ═════════════════════════════════════════════════════════════════════════
     La subpestana AORTA: los dos bloques, las tres graficas con su fuente, el criterio de los
     40 mm del seno DERIVADO del dueno, y la tabla de cirugia (commit 5). */
  if (corre('aorta')) {
    const r = {};
    try {
      await ev(`(function(){ showTab('refs'); return 1 })()`);
      r.panel = await ev(`window.__P.refSub('ao')`);
      r.bloques = await ev(`(function(){
        var p = document.getElementById('ref-sub-ao');
        var rs = p.querySelectorAll('.ref-bloque-rot');
        var o = []; for (var i=0;i<rs.length;i++) o.push({ antes: rs[i].dataset.refBloque,
          rot: rs[i].textContent, color: getComputedStyle(rs[i]).color });
        /* El ORDEN real de los hijos del panel. */
        var ord = []; var ch = p.children;
        for (var j=0;j<ch.length;j++) {
          if (ch[j].classList.contains('ref-bloque-rot')) ord.push('ROT:' + ch[j].textContent);
          else { var c = ch[j].querySelector ? ch[j].querySelector('h2.card-head') : null;
                 if (c) { var oc = c.getAttribute('onclick')||''; var a = oc.indexOf("toggleRef('");
                          var b = oc.indexOf("'", a+11); ord.push('ENTRADA:' + oc.slice(a+11,b)); } }
        }
        return { rotulos: o, orden: ord } })()`);
      /* Se abren las DOS entradas con sus encabezados REALES. */
      r.abrir = await ev(`(function(){
        var o = {};
        ['ao2','ao','aocx'].forEach(function(id){
          var cu = document.getElementById('ref-' + id);
          var h = cu ? cu.previousElementSibling : null;
          if (h && h.classList.contains('card-head')) h.click();
          o[id] = { vis: window.__P.vis('ref-' + id),
                    display: cu ? cu.style.display : null };
        });
        return o })()`);
      r.ao2 = await ev(`(function(){
        var h = document.getElementById('ref-ao2-cuerpo');
        if (!h) return { err: 'NO EXISTE ref-ao2-cuerpo' };
        var svgs = h.querySelectorAll('svg');
        var cats = h.querySelectorAll('[data-ev-cat]');
        var ecs = []; for (var i=0;i<cats.length;i++) ecs.push(cats[i].textContent.replace(/\\s+/g,' ').trim());
        var fila = null, filas = h.querySelectorAll('tr');
        for (var j=0;j<filas.length;j++) {
          var t = filas[j].textContent.replace(/\\s+/g,' ').trim();
          if (t.indexOf('Raiz') >= 0 || t.indexOf('Raíz') >= 0) { fila = t; break; }
        }
        var fte = h.querySelector('[data-ev-fuente="ao-nota"]');
        return { nSvg: svgs.length, ecuaciones: ecs, filaRaiz: fila,
                 nota: fte ? fte.textContent.replace(/\\s+/g,' ').trim().slice(0,200) : null,
                 nFilas: filas.length,
                 biblio: (function(){ var b = h.querySelectorAll('[data-ev-biblio] li, .ev-biblio li');
                   var o=[]; for (var k=0;k<b.length;k++) o.push(b[k].textContent.replace(/\\s+/g,' ').trim().slice(0,160));
                   return o })() } })()`);
      /* EL CRITERIO DE LOS 40 mm, contra el DUENO: se le pregunta a `aoSegGrado` por sus dos
         lados en vez de leer el numero de la fila. */
      r.corte40 = await ev(`(function(){
        if (typeof aoSegGrado !== 'function') return { err: 'SIN aoSegGrado' };
        var sg = (typeof AO_SEGS !== 'undefined') ? AO_SEGS.filter(function(x){return x.k==='ao_sin'})[0] : null;
        if (!sg) return { err: 'SIN AO_SEGS' };
        return { ref: sg.ref, g39: aoSegGrado(sg, 39), g40: aoSegGrado(sg, 40), g41: aoSegGrado(sg, 41),
                 sim: (typeof aoSegSim === 'function') ? aoSegSim(sg, 'dil') : null } })()`);
      r.ateroma = await ev(`(function(){
        var cu = document.getElementById('ref-ao');
        if (!cu) return { err: 'NO EXISTE ref-ao' };
        var t = cu.textContent.replace(/\\s+/g,' ').trim();
        var filas = cu.querySelectorAll('tr');
        return { nFilas: filas.length, dice55: t.indexOf('55mm') >= 0 || t.indexOf('55 mm') >= 0,
                 diceCrecimiento: t.indexOf('3mm/') >= 0 || t.indexOf('3 mm/') >= 0,
                 txt: t.slice(0, 700) } })()`);
      /* La TABLA DE CIRUGIA (commit 5): existe o no. */
      r.tablaCx = await ev(`(function(){
        var t = document.getElementById('ref-ao-cx');
        if (!t) return { existe: false };
        var fs = t.querySelectorAll('tbody tr');
        var o = []; for (var i=0;i<fs.length;i++) {
          var tds = fs[i].querySelectorAll('td'); var f = [];
          for (var j=0;j<tds.length;j++) f.push(tds[j].textContent.replace(/\\s+/g,' ').trim());
          o.push(f);
        }
        var ths = t.querySelectorAll('thead th'); var cab = [];
        for (var k=0;k<ths.length;k++) cab.push(ths[k].textContent.replace(/\\s+/g,' ').trim());
        /* La marca de acuerdo con el dueno, fila por fila: es lo que prueba que la tabla y la
           pestana VAB leen el MISMO borde. */
        var sondas = []; var ds = t.querySelectorAll('[data-ao-cx-sonda]');
        for (var m=0;m<ds.length;m++) sondas.push({ estado: ds[m].dataset.aoCxSonda,
          txt: ds[m].textContent, color: getComputedStyle(ds[m]).color });
        var pie = document.getElementById('ref-ao-cx-fuente');
        return { existe: true, cab: cab, n: o.length, filas: o, sondas: sondas,
                 pie: pie ? pie.textContent.slice(0, 220) : null,
                 vis: window.__P.vis('ref-ao-cx') } })()`);
      /* Los umbrales que la pestana VAB APLICA, SONDEADOS a su dueno. */
      r.vab = await ev(`(function(){
        if (typeof vabConclusion !== 'function') return { err: 'SIN vabConclusion' };
        function c(o){ var r = vabConclusion(Object.assign({ va_morf:'Bicúspide' }, o));
          return r ? { clave: r.clave, txt: r.txt.slice(0, 190) } : null }
        return {
          max54:  c({ ao_sin:'54', ao_tub:'50' }),
          max55:  c({ ao_sin:'55', ao_tub:'50' }),
          raiz49: c({ ao_sin:'49', ao_tub:'40', vab_fenotipo:'raiz' }),
          raiz50: c({ ao_sin:'50', ao_tub:'40', vab_fenotipo:'raiz' }),
          asc52:  c({ ao_sin:'40', ao_tub:'52', vab_fenotipo:'tubular', vab_riesgo_qx:'si' }),
          asc53:  c({ ao_sin:'40', ao_tub:'53', vab_fenotipo:'tubular', vab_riesgo_qx:'si' }),
          asc50fr:c({ ao_sin:'40', ao_tub:'50', vab_fenotipo:'tubular', vab_riesgo_qx:'si', vab_fr_hta:'si' }),
          asc50sf:c({ ao_sin:'40', ao_tub:'50', vab_fenotipo:'tubular', vab_riesgo_qx:'si' }),
          cx44:   c({ ao_sin:'44', ao_tub:'40', vab_cx_valvular:'si' }),
          cx45:   c({ ao_sin:'45', ao_tub:'40', vab_cx_valvular:'si' }) } })()`);
    } catch (e) { r.err = e.message; }
    out.grupos.aorta = r;
    process.stderr.write('[aorta] listo\n');
  }

  /* ══ GRUPO maqueta ════════════════════════════════════════════════════════════════════════ */
  if (corre('maqueta')) {
    const r = { celdas: [] };
    try {
      for (const [w, h] of [[1200, 700], [768, 1024], [390, 844], [360, 740]]) {
        await viewport(w, h);
        /* ⚠️ `tema()` TOMA UN BOOLEANO. Pasarle la cadena 'oscuro' es truthy, asi que las ocho
           celdas median el tema CLARO y la tabla decia «el color no cambia» sobre dos temas que
           si cambian. Y el color computado se lee del tema ANTERIOR sin una vuelta de espera. */
        for (const [tema, claro] of [['oscuro', false], ['claro', true]]) {
          const cl = await ev(`window.__P.tema(${claro})`);
          await ev(`(function(){ showTab('refs'); refSubTab('dim', document.getElementById('ref-subtab-dim')); return 1 })()`);
          await pausa(160);
          r.celdas.push({ w, h, tema, clase: cl,
            est: await ev(`window.__P.refSubEstado()`),
            pag: await ev(`window.__P.anchoPagina()`) });
        }
      }
      await ev(`window.__P.tema(false)`);
      await viewport(1200, 900);
    } catch (e) { r.err = e.message; }
    out.grupos.maqueta = r;
    process.stderr.write('[maqueta] listo\n');
  }

  /* ══ GRUPO ctrl: los controles. CERO diferencias es el veredicto. ═════════════════════════ */
  if (corre('ctrl')) {
    const r = {};
    const ESC = { nombre: 'Control P', ci: '1234567', edad: '62', sexo: 'M', peso: '80', talla: '180',
                  ao_sin: '46', ao_tub: '47', ddfvi: '58', fevi: '45', ai_vol: '98',
                  im_vc: '8', ea_gmedio: '45', tapse: '14', s_prime: '8', vd_bas: '45' };
    const medir = async () => {
      const o = {};
      for (const est of ['estandar', 'narrativo', 'conciso']) {
        o['inf_' + est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
      }
      o.excel = await ev(`window.__P.excelDOM()`);
      o.lab = await ev(`window.__P.lab()`);
      o.campos = await ev(`window.__P.camposGuardados()`);
      o.camposEst = await ev(`window.__P.camposEstudio()`);
      o.almacen = await ev(`window.__P.almacen()`);
      return o;
    };
    try {
      await ev(`window.__P.nuevo()`);
      r.vacio = await medir();
      await ev(`window.__P.nuevo()`);
      for (const [k, v2] of Object.entries(ESC)) {
        try { await tipear(k, v2); } catch (e) { try { await ev(`window.__P.sel(${JSON.stringify(k)},${JSON.stringify(v2)})`); } catch (e2) {} }
      }
      await ev(`window.__P.calentar()`);
      r.cargado = await medir();
      r.pdf = {};
      for (const pl of ['clasico', 'moderno', 'minimalista', 'academico', 'compacto', 'elegante']) {
        r.pdf[pl] = await ev(`window.__P.pdf(${JSON.stringify(pl)})`, 60000);
      }
      r.ppt = await ev(`window.__P.labPPT([])`, 60000);
      r.audit = await ev(`window.__P.labAudit([])`, 60000);
    } catch (e) { r.err = e.message; }
    out.grupos.ctrl = r;
    process.stderr.write('[ctrl] listo\n');
  }

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  process.stdout.write(JSON.stringify(OUT, null, 1));
  cdp.close(); srv.close(); process.exit(0);
}

main().catch(async (e) => {
  process.stdout.write(JSON.stringify({ err: e.message, stack: String(e.stack || '').slice(0, 1200) }, null, 1));
  process.exit(1);
});
