#!/usr/bin/env node
/**
 * _probe_y3c.mjs - sonda A/B de SOLO LECTURA para la tanda Y3c (el dibujo estatico de la mitral
 * con giro, tres vistas y plano de corte, la tabla unica de festones y los cuatro dibujos de
 * medidas TEER, 2026-10-18).
 *
 * TODA la infraestructura de scripts/_probe_p.mjs se reusa tal cual -teclas y clics reales,
 * cierre del arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su
 * denominador, md5 al principio y al final-. NO muta index.html.
 *
 *   node scripts/_probe_y3c.mjs --file /tmp/index.Y3cHEAD.html --solo tabla > /tmp/y3c.HEAD.json
 *   node scripts/_probe_y3c.mjs                                --solo tabla > /tmp/y3c.NEW.json
 *
 * Grupos:
 *   tabla   - la tabla unica ETE_CORTES, el mapa derivado y los festones de cada esquema.
 *   dibujo  - el dibujo estatico: geometria, marcas, festones tocables, ciclo de lesiones.
 *   plano   - la linea punteada en los cinco angulos desde los botones del 3D.
 *   giro    - arrastre, flechas, y que un arrastre NO cicla la lesion.
 *   vistas  - los tres botones, su marca y el desmarcado al girar; con protesis no aparecen.
 *   teer    - los cuatro dibujos de medidas con su valor al lado y el borrado del dato.
 *   ciclo   - 20 aperturas y cierres del 3D: nodos y oyentes.
 *   maqueta - cuatro anchos por dos temas, color real y scroll horizontal de la pagina.
 *   captura - PNG del dibujo en las tres vistas y de los cuatro dibujos TEER.
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

  /* ⚠️ EL ESPIA DE console.error VA ANTES DEL RELOAD, y no es un detalle: los dos asserts de
     arranque de la tabla duena corren en un setTimeout de 700 ms, o sea mucho antes de que la
     sonda se inyecte. Inyectado despues, el grupo informaria «cero errores» sobre un arbol que
     los grito. */
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source:
    'window.__Yerr=[];(function(){var o=console.error;console.error=function(){' +
    'try{window.__Yerr.push(Array.prototype.slice.call(arguments).join(" "))}catch(e){};' +
    'return o.apply(console,arguments)}})();' }, sessionId);
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
     Se inyectan en un SEGUNDO template para no tocar el bloque reusado: asi un cambio de esta
     tanda no puede romper la infraestructura que comparten nueve sondas. */
  await evCrudo(`
window.__Y = {
  /* N aperturas y cierres del panel 3D, contando oyentes nuevos sobre el dibujo. */
  ciclo3d(n) {
    var svg = document.getElementById('ete-svg-qx');
    var cuenta = 0, o = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(t){
      if (this === svg) cuenta++; return o.apply(this, arguments) };
    var b = document.getElementById('m3d-btn'), i;
    for (i = 0; i < n; i++) { if (b && !b.hasAttribute('hidden')) { b.click(); b.click(); } }
    EventTarget.prototype.addEventListener = o;
    return { ciclos: n, oyentesNuevos: cuenta } },

  teerColores() {
    var LES = ['#f59e0b','#3b82f6','#8b5cf6','#22c55e'];  /* prolapso, restriccion, perforacion, calcificacion */
    var o = {};
    ['prof','len','gap','anch'].forEach(function(k){
      var s = document.getElementById('teer-fig-' + k);
      if (!s) { o[k] = 'NO EXISTE'; return }
      var cols = {};
      s.querySelectorAll('*').forEach(function(e){
        ['stroke','fill'].forEach(function(a){
          var c = e.getAttribute(a);
          if (c && c !== 'none') cols[c] = (cols[c] || 0) + 1 }) });
      var usados = Object.keys(cols);
      o[k] = { colores: usados.sort(),
               celeste: usados.indexOf('#1BA3B8') >= 0,
               rojoFlail: usados.indexOf('#ef4444') >= 0,
               otrosDeLesion: usados.filter(function(c){ return LES.indexOf(c) >= 0 }),
               markerFijo: (function(){ var m = s.querySelector('marker path');
                 return m ? m.getAttribute('stroke') : 'NO EXISTE' })(),
               /* El color RENDERIZADO del texto del valor, en el tema puesto. */
               valColor: (function(){ var t = document.getElementById('teer-fig-' + k + '-val');
                 return t ? getComputedStyle(t).fill : 'NO EXISTE' })() };
    });
    return o },

  /* La maqueta: el ancho REAL del input al lado del dibujo, y si hay scroll horizontal. */
  teerMaqueta() {
    var o = { scrollH: window.__Y.scrollH() };
    var CP = { prof: 'teer_prof_flail', len: 'teer_gap', gap: 'teer_flail_gap', anch: 'teer_ancho_flail' };
    Object.keys(CP).forEach(function(k){
      var i = document.getElementById(CP[k]), f = document.getElementById('teer-fig-' + k);
      var ri = i ? i.getBoundingClientRect() : null, rf = f ? f.getBoundingClientRect() : null;
      o[k] = { inputW: ri ? Math.round(ri.width) : null, figW: rf ? Math.round(rf.width) : null,
               figH: rf ? Math.round(rf.height) : null,
               /* Si el dibujo esta a la DERECHA del input o DEBAJO. */
               alLado: (ri && rf) ? (rf.left >= ri.right - 2) : null,
               solapa: (ri && rf) ? (rf.left < ri.right - 2 && rf.top < ri.bottom - 2) : null };
    });
    return o },

  letrasDisp() {
    var o = {};
    ['A1','A2','A3','P1','P2','P3'].forEach(function(n){
      var e = document.getElementById('ete-qx-lbl-' + n);
      o[n] = e ? (e.getAttribute('display') || 'inline') : 'NO EXISTE' });
    return o },
  morfOpciones() {
    var e = document.getElementById('vm_morf');
    return e ? Array.prototype.slice.call(e.options).map(function(o){ return o.value }) : 'NO EXISTE' },

  estado() { try { return window.eteQxEstado() } catch (e) { return 'EXC: ' + e.message } },
  ponerRot(v) { try { window.qxGirarA(v); return window.eteQxEstado() } catch (e) { return 'EXC' } },
  esperar(ms) { return new Promise(function(r){ setTimeout(function(){ r(ms) }, ms) }) },

  /* El centro de un nodo del dibujo, en coordenadas del VIEWPORT y ya desplazado a la vista:
     un arrastre sobre un punto fuera de la ventana no es un gesto. */
  centroDe(id) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.scrollIntoView({ block: 'center' });
    var r = e.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return { err: 'SIN GEOMETRIA ' + id };
    var x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
    if (y < 0 || y > window.innerHeight) return { err: 'FUERA DEL VIEWPORT y=' + y };
    return { x: x, y: y, w: Math.round(r.width), h: Math.round(r.height) } },

  /* Cuadros de requestAnimationFrame pedidos en una ventana de tiempo. Con el dibujo quieto
     tienen que ser CERO: un bucle perpetuo repinta sesenta veces por segundo sin que nada se
     mueva, y eso es lo que el panel 3D apaga al cerrarse. */
  contarRaf(ms) {
    return new Promise(function(res){
      var n = 0, o = window.requestAnimationFrame;
      window.requestAnimationFrame = function(f){ n++; return o.call(window, f) };
      setTimeout(function(){ window.requestAnimationFrame = o; res(n) }, ms);
    }) },

  botonesGirar() {
    var o = {};
    var svg = document.getElementById('ete-svg-qx');
    o.enSvg = svg ? svg.querySelectorAll('button').length : 'NO EXISTE';
    var host = document.getElementById('m3d-qx');
    var bt = [];
    if (host) host.querySelectorAll('button').forEach(function(b){ bt.push((b.textContent||'').trim()) });
    o.enBloque = bt;
    o.conPalabraGirar = bt.filter(function(t){ return /girar|rotar|gira/i.test(t) }).length;
    o.cursor = svg ? getComputedStyle(svg).cursor : null;
    o.touchAction = svg ? getComputedStyle(svg).touchAction : null;
    o.tabindex = svg ? svg.getAttribute('tabindex') : null;
    return o },

  /* Sin zoom: se cuenta espiando addEventListener en una reconstruccion. Lo que se mide es que
     el dibujo no registre wheel ni gesture; el conteo total sirve de denominador. */
  sinZoom() {
    var svg = document.getElementById('ete-svg-qx');
    if (!svg) return 'NO EXISTE';
    var tipos = [], o = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(t){
      if (this === svg) tipos.push(t); return o.apply(this, arguments) };
    try { window.eteQxConstruir() } catch (e) {}
    EventTarget.prototype.addEventListener = o;
    return { tiposEnUnaReconstruccion: tipos,
             hayWheel: tipos.indexOf('wheel') >= 0,
             hayGesture: tipos.filter(function(t){ return t.indexOf('gesture') === 0 }).length } },

  /* N llamadas a eteQxConstruir no pueden apilar oyentes: la guarda de _qxCableado. */
  recablear(n) {
    var svg = document.getElementById('ete-svg-qx');
    if (!svg) return 'NO EXISTE';
    var cuenta = 0, o = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(t){
      if (this === svg) cuenta++; return o.apply(this, arguments) };
    for (var i = 0; i < n; i++) { try { window.eteQxConstruir() } catch (e) {} }
    EventTarget.prototype.addEventListener = o;
    return { llamadas: n, oyentesNuevos: cuenta, nodos: document.getElementsByTagName('*').length } },

  m3dEstado() {
    var o = {};
    try { o.camara = window.m3dEstadoCamara ? window.m3dEstadoCamara() : 'SIN FN' }
    catch (e) { o.camara = 'EXC' }
    try { o.vis = window.M3D_VIS ? JSON.parse(JSON.stringify(window.M3D_VIS)) : 'SIN M3D_VIS' }
    catch (e) { o.vis = 'EXC' }
    try { o.angs = window.M3D_ANGS ? window.M3D_ANGS.slice() : 'SIN M3D_ANGS' }
    catch (e) { o.angs = 'EXC' }
    var bt = [];
    document.querySelectorAll('#m3d-angs button, #m3d-vistas button, .m3d-btns button').forEach(function(b){
      bt.push(b.id + '=' + (b.textContent || '').trim()) });
    o.botones = bt.sort();
    return o },

  clicNodo(id) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return { err: 'SIN GEOMETRIA ' + id };
    e.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { ok: true, w: Math.round(r.width), h: Math.round(r.height) } },

  /* La geometria RENDERIZADA, no la declarada. El anillo: sus dos semiejes verticales y el
     horizontal. La coaptacion: la flecha de la sonrisa, o sea cuanto se aparta el punto del
     medio de la recta que une sus dos extremos. Con una recta la flecha es CERO, que es lo que
     distingue el dibujo nuevo del viejo. */
  geomDib() {
    var o = {};
    var a = document.getElementById('ete-qx-anillo');
    if (!a) return { err: 'NO EXISTE ete-qx-anillo' };
    var P = (a.getAttribute('points') || '').trim().split(/\\s+/).map(function(t){
      var q = t.split(','); return [parseFloat(q[0]), parseFloat(q[1])] });
    o.nAnillo = P.length;
    var xs = P.map(function(q){ return q[0] }), ys = P.map(function(q){ return q[1] });
    o.anilloRX = Math.round((Math.max.apply(null, xs) - Math.min.apply(null, xs)) / 2);
    o.anilloArriba = Math.round(215 - Math.min.apply(null, ys));
    o.anilloAbajo = Math.round(Math.max.apply(null, ys) - 215);
    var c = document.getElementById('ete-qx-coap');
    var Q = (c.getAttribute('points') || '').trim().split(/\\s+/).map(function(t){
      var q = t.split(','); return [parseFloat(q[0]), parseFloat(q[1])] });
    o.nCoap = Q.length;
    var p0 = Q[0], p1 = Q[Q.length - 1], pm = Q[Math.floor(Q.length / 2)];
    var mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
    o.flechaCoap = Math.round(Math.sqrt(Math.pow(pm[0] - mx, 2) + Math.pow(pm[1] - my, 2)) * 10) / 10;
    o.coapAncho = Math.round(Math.sqrt(Math.pow(p1[0] - p0[0], 2) + Math.pow(p1[1] - p0[1], 2)));
    /* Que todo el dibujo entre en el lienzo: ningun punto de ningun nodo fuera de 0..420. */
    var fuera = [];
    document.querySelectorAll('#ete-svg-qx polygon,#ete-svg-qx polyline').forEach(function(e){
      (e.getAttribute('points') || '').trim().split(/\\s+/).forEach(function(t){
        var q = t.split(','), x = parseFloat(q[0]), y = parseFloat(q[1]);
        if (!(x >= 0 && x <= 420 && y >= 0 && y <= 420)) fuera.push(e.id + '@' + t) }) });
    document.querySelectorAll('#ete-svg-qx text,#ete-svg-qx circle').forEach(function(e){
      var x = parseFloat(e.getAttribute('x') || e.getAttribute('cx') || 0);
      var y = parseFloat(e.getAttribute('y') || e.getAttribute('cy') || 0);
      if (!(x >= 0 && x <= 420 && y >= 0 && y <= 420)) fuera.push(e.id + '@' + x + ',' + y) });
    o.fueraDelLienzo = fuera;
    /* Un toque sobre el ANILLO no debe ciclar nada: lleva pointer-events none. */
    o.anilloPE = getComputedStyle(a).pointerEvents;
    o.coapPE = getComputedStyle(c).pointerEvents;
    return o },

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

  /* La tabla duena y el mapa que de ella se DERIVA. Se leen por window porque son const de
     modulo: la trampa de ECO_AYUDA, que este repo ya tiene escrita. */
  tabla() {
    var o = { cortes: null, esq: null, epig: null, gid: null };
    try { o.cortes = window.ETE_CORTES ? JSON.parse(JSON.stringify(window.ETE_CORTES)) : 'SIN ETE_CORTES' }
    catch (e) { o.cortes = 'EXC' }
    try { o.esq = window.ETE_ESQ_ANG ? JSON.parse(JSON.stringify(window.ETE_ESQ_ANG)) : 'SIN ETE_ESQ_ANG' }
    catch (e) { o.esq = 'EXC' }
    try { o.epig = window.ETE_EPIGRAFE ? JSON.parse(JSON.stringify(window.ETE_EPIGRAFE)) : 'SIN ETE_EPIGRAFE' }
    catch (e) { o.epig = 'EXC' }
    return o },

  /* Los festones que cada esquema tiene EN EL MARCADO, leidos del DOM y no de una lista: es la
     lectura independiente contra la que se compara la tabla. */
  esqMarcado() {
    var SVG = { '4ch':'ete-svg-4ch', 'bc':'ete-svg-bc', '2ch':'ete-svg-2ch', '3ch':'ete-svg-3ch' };
    var o = {};
    Object.keys(SVG).forEach(function(suf){
      var s = document.getElementById(SVG[suf]);
      if (!s) { o[suf] = 'NO EXISTE ' + SVG[suf]; return }
      var l = [];
      s.querySelectorAll('g.ete-valve-seg[id]').forEach(function(g){ l.push(g.id) });
      o[suf] = l.sort();
    });
    return o },

  /* El estado de un segmento tal como lo PUBLICA cada superficie: el esquema, el dibujo y el
     resumen. Es lo que prueba que el ciclo sigue sincronizado. */
  lesion(seg) {
    var o = { seg: seg };
    var q = document.getElementById('ete-qx-' + seg);
    o.qxFill = q ? (q.style.fill || '') : 'NO EXISTE';
    o.qxStroke = q ? (q.style.stroke || '') : 'NO EXISTE';
    var esp = document.getElementById('ete_seg_' + seg);
    o.espejo = esp ? esp.value : 'NO EXISTE';
    var r = document.getElementById('ete-seg-resumen');
    o.resumen = r ? (r.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE';
    var pin = {};
    (window.ETE_GID_MAP_DBG || []).forEach(function(){});
    ['4ch','bc','2ch','3ch'].forEach(function(suf){
      var g = document.getElementById('valve-' + seg + '-' + suf);
      if (!g) { pin[suf] = null; return }
      var p = g.querySelector('path:not(.ete-hit),line:not(.ete-hit)');
      pin[suf] = p ? (p.style.stroke || '') : 'SIN TRAZO';
    });
    o.esquemas = pin;
    return o },

  click(seg) { try { window.eteClick(seg); return 'ok' } catch (e) { return 'EXC: ' + e.message } },
  limpiarSeg() { try { window.eteLimpiarSegmentos(); return 'ok' } catch (e) { return 'EXC: ' + e.message } },

  /* Los errores que los asserts de arranque hayan escrito en consola. Se instala un espia ANTES
     de que corran los setTimeout de 700 ms. */
  errores() { return (window.__Yerr || []).slice() },

  /* == EL DIBUJO ESTATICO ================================================================== */
  dib() {
    var s = document.getElementById('ete-svg-qx');
    if (!s) return { err: 'NO EXISTE ete-svg-qx' };
    var o = { viewBox: s.getAttribute('viewBox') };
    var r = s.getBoundingClientRect();
    o.w = Math.round(r.width); o.h = Math.round(r.height);
    o.nPoly = s.querySelectorAll('polygon').length;
    o.nPolyline = s.querySelectorAll('polyline').length;
    o.nText = s.querySelectorAll('text').length;
    o.nCirc = s.querySelectorAll('circle').length;
    o.nLine = s.querySelectorAll('line').length;
    var fes = [];
    ['A1','A2','A3','P1','P2','P3'].forEach(function(n){
      var e = document.getElementById('ete-qx-' + n);
      if (!e) { fes.push(n + '=NO EXISTE'); return }
      var pts = e.getAttribute('points');
      fes.push(n + '=' + (pts ? pts.split(' ').length + 'pts' : 'SIN points'));
    });
    o.festones = fes;
    var marcas = {};
    ['ete-qx-mAo','ete-qx-mOr','ete-qx-mAL','ete-qx-mPM'].forEach(function(id){
      var e = document.getElementById(id);
      marcas[id] = e ? (e.textContent || '') + '@' + Math.round(parseFloat(e.getAttribute('x') || 0)) + ',' + Math.round(parseFloat(e.getAttribute('y') || 0)) : 'NO EXISTE';
    });
    o.marcas = marcas;
    var lb = {};
    ['A1','A2','A3','P1','P2','P3'].forEach(function(n){
      var e = document.getElementById('ete-qx-lbl-' + n);
      lb[n] = e ? { x: Math.round(parseFloat(e.getAttribute('x')||0)), y: Math.round(parseFloat(e.getAttribute('y')||0)),
                    peso: e.getAttribute('font-weight'), deco: e.getAttribute('text-decoration'),
                    fill: e.getAttribute('fill'), txt: e.textContent } : 'NO EXISTE';
    });
    o.rotulos = lb;
    var pl = document.getElementById('ete-qx-plano');
    o.plano = pl ? { disp: pl.getAttribute('display'), x1: pl.getAttribute('x1'), y1: pl.getAttribute('y1'),
                     x2: pl.getAttribute('x2'), y2: pl.getAttribute('y2'), stroke: pl.getAttribute('stroke') } : 'NO EXISTE';
    var pt = document.getElementById('ete-qx-plano-lbl');
    o.planoTxt = pt ? (pt.textContent || '') : 'NO EXISTE';
    o.centro = !!document.getElementById('ete-qx-centro');
    try { o.estado = window.eteQxEstado ? window.eteQxEstado() : 'SIN eteQxEstado' }
    catch (e) { o.estado = 'EXC: ' + e.message }
    return o },

  /* El angulo se elige desde los botones del 3D, que es la unica puerta: la orden prohibe
     agregarle botones de angulo al dibujo. */
  ang(a) {
    var b = document.getElementById('m3d-a-' + a);
    if (!b) return { err: 'NO EXISTE m3d-a-' + a };
    var r = b.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return { err: 'SIN GEOMETRIA m3d-a-' + a };
    b.click();
    return { ok: true, pressed: b.getAttribute('aria-pressed') } },

  tog3d() {
    var b = document.getElementById('m3d-btn');
    if (!b) return { err: 'NO EXISTE m3d-btn' };
    if (b.hasAttribute('hidden')) return { err: 'EL BOTON 3D ESTA HIDDEN (protesis?)' };
    b.click();
    var p = document.getElementById('m3d-panel');
    return { abierto: !!(p && !p.hasAttribute('hidden')) } },

  vista(k) {
    var b = document.getElementById('ete-qx-v-' + k);
    if (!b) return { err: 'NO EXISTE ete-qx-v-' + k };
    b.click();
    return { ok: true } },

  vistasBotones() {
    var o = {};
    ['cir','ett','tg'].forEach(function(k){
      var b = document.getElementById('ete-qx-v-' + k);
      var r = b ? b.getBoundingClientRect() : null;
      o[k] = b ? { txt: (b.textContent||'').trim(), pressed: b.getAttribute('aria-pressed'),
                   w: Math.round(r.width), h: Math.round(r.height), tag: b.tagName } : 'NO EXISTE';
    });
    var host = document.getElementById('ete-qx-vistas');
    o.hostVis = host ? (getComputedStyle(host).display !== 'none') : 'NO EXISTE';
    o.nBotonesGirar = document.querySelectorAll('#ete-qx-vistas button[data-girar]').length;
    return o },

  /* == LOS CUATRO DIBUJOS TEER ============================================================= */
  teer() {
    var MAP = { prof: 'teer_prof_flail', len: 'teer_gap', gap: 'teer_flail_gap', anch: 'teer_ancho_flail' };
    var o = {};
    Object.keys(MAP).forEach(function(k){
      var s = document.getElementById('teer-fig-' + k);
      if (!s) { o[k] = 'NO EXISTE teer-fig-' + k; return }
      var r = s.getBoundingClientRect();
      var val = document.getElementById('teer-fig-' + k + '-val');
      var cols = [];
      s.querySelectorAll('[stroke]').forEach(function(e){ var c = e.getAttribute('stroke'); if (cols.indexOf(c) < 0) cols.push(c) });
      o[k] = { w: Math.round(r.width), h: Math.round(r.height),
               campo: MAP[k], valCampo: (document.getElementById(MAP[k]) || {}).value,
               valDib: val ? (val.textContent || '') : 'NO EXISTE',
               nMarker: s.querySelectorAll('marker').length,
               strokes: cols.sort() };
    });
    return o },

  /* == CONTROLES ========================================================================== */
  qxPdf() {
    try { if (typeof eteQxPdfOn === 'function' && !eteQxPdfOn()) eteQxIncluirPDF(); return eteQxPdfOn() }
    catch (e) { return 'EXC: ' + e.message } },

  /* ⚠️ COMPARAR POR LARGO NO ALCANZA: dos PNG distintos pueden pesar lo mismo. Va con un hash
     del data URL completo, que es lo que distingue «el papel no cambio» de «el papel cambio». */
  qxData() {
    try { var d = window.eteQxDataURL(), h = 0, i;
      for (i = 0; i < d.length; i++) h = ((h << 5) - h + d.charCodeAt(i)) | 0;
      return { largo: d.length, hash: h, pre: d.slice(0, 22) } }
    catch (e) { return 'EXC: ' + e.message } },

  nodos() { return document.getElementsByTagName('*').length },

  scrollH() { var d = document.documentElement;
    return { sw: d.scrollWidth, cw: d.clientWidth, hay: d.scrollWidth > d.clientWidth + 1 } },

  /* ⚠️ EL DIBUJO VIVE DENTRO DE #ete-seccion-mitral, QUE NACE PLEGADA. Sin abrirla el SVG
     existe y mide 0 x 0, y la lectura informa «el dibujo no se dibuja» sobre un dibujo
     perfecto. Se abre con el toggle REAL, que es el gesto del medico. */
  irETE() { try { showTab('ete');
      var s = document.getElementById('ete-seccion-mitral');
      if (s && getComputedStyle(s).display === 'none' && typeof toggleEteSeccion === 'function')
        toggleEteSeccion('mitral');
      var q = document.getElementById('ete-svg-qx');
      var r = q ? q.getBoundingClientRect() : null;
      return { sec: s ? getComputedStyle(s).display : 'NO EXISTE',
               svgW: r ? Math.round(r.width) : null, svgH: r ? Math.round(r.height) : null } }
    catch (e) { return 'EXC: ' + e.message } },
  irTEER() { try { showTab('ete');
      var s = document.getElementById('ete-seccion-teer');
      if (s && getComputedStyle(s).display === 'none') toggleEteSeccion('teer');
      return getComputedStyle(document.getElementById('ete-seccion-teer')).display }
    catch (e) { return 'EXC: ' + e.message } },


  morf(v) { return window.__P.sel('vm_morf', v) },

  /* ══ HELPERS PROPIOS DE LA TANDA Y3d ════════════════════════════════════════════════════ */

  /* Los SEIS rotulos de feston del dibujo estatico, con su display COMPUTADO y su posicion.
      Se mide el computado y no el atributo: la leccion del atributo hidden que este repo paga. */
  letras() {
    var o = { n: 0, vis: 0, det: {} };
    ['A1','A2','A3','P1','P2','P3'].forEach(function(n){
      var e = document.querySelector('#ete-svg-qx text[data-qx-lbl="' + n + '"]');
      if (!e) {
        var ts = document.querySelectorAll('#ete-svg-qx text');
        for (var i = 0; i < ts.length; i++) {
          if ((ts[i].textContent || '').trim() === n) { e = ts[i]; break }
        }
      }
      if (!e) { o.det[n] = 'NO EXISTE'; return }
      o.n++;
      var cs = getComputedStyle(e);
      var r = e.getBoundingClientRect();
      var visible = cs.display !== 'none' && cs.visibility !== 'hidden'
                    && parseFloat(cs.opacity || '1') > 0.01 && r.width > 0 && r.height > 0;
      if (visible) o.vis++;
      o.det[n] = { disp: cs.display, attr: e.getAttribute('display'),
                   x: Math.round(parseFloat(e.getAttribute('x') || '0')),
                   y: Math.round(parseFloat(e.getAttribute('y') || '0')),
                   w: Math.round(r.width), vis: visible };
    });
    return o },

  /* El estado del dibujo mas las letras, en una sola lectura. */
  qx() {
    var e = {};
    try { e = (typeof eteQxEstado === 'function') ? eteQxEstado() : { err: 'SIN FN' } }
    catch (x) { e = { err: 'EXC: ' + x.message } }
    e.letras = window.__Y.letras();
    return e },

  girar(a) { try { qxGirarA(a); return (typeof eteQxEstado === 'function') ? eteQxEstado().tRot : null }
    catch (x) { return 'EXC: ' + x.message } },

  vista(k) { try { eteQxVista(k); return (typeof eteQxEstado === 'function') ? eteQxEstado() : null }
    catch (x) { return 'EXC: ' + x.message } },

  /* == TEER: el veredicto y las filas de criterio, leidas del DOM =========================== */
  teerVer() {
    var o = {};
    try {
      var r = (typeof teerEstado === 'function') ? teerEstado() : null;
      if (!r) return { err: 'SIN teerEstado' };
      o.clave = r.clave; o.titulo = r.titulo; o.nota = r.nota;
      o.fallos = r.fallos; o.noIngresados = r.noIngresados;
      o.crit = {};
      (r.orden || []).forEach(function(c){ o.crit[c.id] = { lbl: c.lbl, ok: c.ok, txt: c.txt } });
      o.veto = r.vetoIds ? Array.from(r.vetoIds) : [];
    } catch (x) { return { err: 'EXC: ' + x.message } }
    /* Lo RENDERIZADO, que es lo que el medico ve. */
    o.resHTML = (document.getElementById('teer-resultado') || {}).textContent || null;
    o.notasTxt = (document.getElementById('teer-notas') || {}).textContent || null;
    o.filas = {};
    document.querySelectorAll('[id^="teer-c"]').forEach(function(e){
      var f = e.closest ? e.closest('.calc-row') : null;
      o.filas[e.id] = { txt: (e.textContent || '').trim(),
                        vis: f ? getComputedStyle(f).display !== 'none' : null };
    });
    return o },

  /* Los rotulos chicos que acompanan a cada campo del TEER («Excl: >=10mm»). */
  teerRot() {
    var o = {};
    ['teer_flail_gap','teer_ancho_flail','teer_prof_flail','teer_gap','teer_fevi','teer_dtsvi'].forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { o[id] = 'NO EXISTE'; return }
      var col = e.parentNode;
      var sp = col ? col.querySelector('span') : null;
      var fg = e.closest ? e.closest('.fg') : null;
      var lb = fg ? fg.querySelector('label') : null;
      o[id] = { rot: sp ? (sp.textContent || '').trim() : null,
                label: lb ? (lb.textContent || '').replace(/\\s+/g, ' ').trim() : null };
    });
    return o },

  /* == VAB ================================================================================= */
  /* ⚠️ NO ALCANZA CON MIRAR EL el display DEL CUERPO: con el acordeon cerrado el SVG conserva su
     rect y queda RECORTADO, asi que elementFromPoint devuelve el acordeon y un clic real no
     llega a ningun punto sensible -se lee igual que «el mecanismo no funciona»-. Se comprueba la
     ALCANZABILIDAD del centro del SVG y, si falla, se toglea y se vuelve a comprobar. */
  irVAB() { try { showTab('congenitas');
      var alcanza = function(){ var sv = document.getElementById('vab-svg');
        if (!sv) return null;
        var r = sv.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0)) return false;
        sv.scrollIntoView({ block: 'center' });
        r = sv.getBoundingClientRect();
        var e = document.elementFromPoint(Math.round(r.left + r.width / 2),
                                         Math.round(r.top + r.height / 2));
        while (e) { if (e.id === 'vab-svg') return true; e = e.parentElement }
        return false };
      var c = document.getElementById('sacc-cc-vab');
      var b = c ? c.querySelector('.sacc-body') : null;
      var ok = alcanza();
      if (ok === false && typeof secToggle === 'function') { secToggle('cc-vab'); ok = alcanza() }
      if (ok === false && typeof secToggle === 'function') { secToggle('cc-vab'); ok = alcanza() }
      return { sec: b ? getComputedStyle(b).display : 'NO EXISTE', alcanza: ok } }
    catch (e) { return 'EXC: ' + e.message } },

  vab() {
    var o = {};
    try { if (typeof vabSync === 'function') vabSync() } catch (e) {}
    try { var c = (typeof vabConclusion === 'function') ? vabConclusion() : null;
      o.concl = c ? { clave: c.clave, txt: c.txt } : null } catch (e) { o.concl = 'EXC: ' + e.message }
    try { var f = (typeof vabFactores === 'function') ? vabFactores() : null;
      o.fr = f ? { n: f.n, presentes: f.presentes, sinEvaluar: f.sinEvaluar } : null }
    catch (e) { o.fr = 'EXC: ' + e.message }
    o.fila = (document.getElementById('vab-fr') || {}).textContent || null;
    o.filaConcl = (document.getElementById('vab-concl') || {}).textContent || null;
    o.campos = {};
    ['vab_tipo','vab_rafe','vab_simetria','vab_funcion','vab_fenotipo','vab_cx_valvular',
     'vab_riesgo_qx','vab_fr_familiar','vab_fr_hta','vab_fr_crecimiento','vab_fr_longitud',
     'vab_fr_cx','vab_fr_embarazo','va_morf'].forEach(function(id){
      var e = document.getElementById(id); o.campos[id] = e ? e.value : 'NO EXISTE' });
    return o },

  /* El dibujo de la VAB: caminos, rafe, puntos y letras. */
  vabMorf() {
    var a = document.getElementById('vab-morf-aviso');
    return { vaMorf: (document.getElementById('va_morf') || {}).value,
             tipo: (document.getElementById('vab_tipo') || {}).value,
             aviso: a ? { vis: getComputedStyle(a).display !== 'none',
                          txt: (a.textContent || '').trim(),
                          color: getComputedStyle(a).color } : 'NO EXISTE',
             protVis: (function(){ var b = document.getElementById('bloque-prot-va');
               return b ? getComputedStyle(b).display : 'NO EXISTE' })(),
             concl: (function(){ try { var c = vabConclusion();
               return c ? c.clave : null } catch (e) { return 'EXC' } })() } },

  vabColor() {
    var e = document.getElementById('vab-rafe'), d = document.getElementById('vab-d1');
    var l = document.getElementById('vab-lR'), s2 = document.getElementById('vab-s1');
    return { rafe: e ? getComputedStyle(e).stroke : 'NO EXISTE',
             punto: d ? getComputedStyle(d).fill : 'NO EXISTE',
             letra: l ? getComputedStyle(l).fill : 'NO EXISTE',
             seno: s2 ? getComputedStyle(s2).stroke : 'NO EXISTE' } },

  vabPdfEstado() {
    var b = document.getElementById('vab-pdf-btn');
    return { campo: (document.getElementById('vab_pdf') || {}).value,
             on: (typeof vabPdfOn === 'function') ? vabPdfOn() : 'SIN FN',
             btn: b ? (b.textContent || '').trim() : 'NO EXISTE',
             pressed: b ? b.getAttribute('aria-pressed') : null,
             clase: b ? b.className : null } },

  vabHit(k) {
    var c = document.querySelector('[data-vab-hit="' + k + '"]');
    if (!c) return { err: 'NO EXISTE hit ' + k };
    c.scrollIntoView({ block: 'center', inline: 'center' });
    var r2 = c.getBoundingClientRect();
    var x = Math.round(r2.left + r2.width / 2), y = Math.round(r2.top + r2.height / 2);
    var svg = document.getElementById('vab-svg');
    var rs = svg ? svg.getBoundingClientRect() : null;
    var en = document.elementFromPoint(x, y);
    var todos = document.elementsFromPoint
      ? document.elementsFromPoint(x, y).slice(0, 5).map(function(e3){
          return e3.tagName + (e3.id ? '#' + e3.id : '') }) : 'SIN FN';
    return { x: x, y: y, lado: Math.round(r2.width) + 'x' + Math.round(r2.height),
             vw: window.innerWidth, vh: window.innerHeight,
             dentro: x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight,
             svgX: rs ? Math.round(rs.left) : null, svgW: rs ? Math.round(rs.width) : null,
             pe: getComputedStyle(c).pointerEvents,
             peSvg: svg ? getComputedStyle(svg).pointerEvents : null,
             enPunto: en ? (en.tagName + (en.id ? '#' + en.id : '')) : 'NADA',
             todos: todos,
             cRect: { x: Math.round(r2.left), y: Math.round(r2.top),
                      w: Math.round(r2.width), h: Math.round(r2.height) },
             svgRect: rs ? { x: Math.round(rs.left), y: Math.round(rs.top),
                             w: Math.round(rs.width), h: Math.round(rs.height) } : null,
             centroSvg: (function(){ if (!rs) return null;
               var cx = Math.round(rs.left + rs.width / 2), cy = Math.round(rs.top + rs.height / 2);
               var e4 = document.elementFromPoint(cx, cy);
               return { cx: cx, cy: cy, el: e4 ? (e4.tagName + (e4.id ? '#' + e4.id : '')) : 'NADA' } })(),
             svgCss: (function(){ if (!svg) return null; var cs = getComputedStyle(svg);
               return { disp: cs.display, vis: cs.visibility, op: cs.opacity, pe: cs.pointerEvents,
                        ow: svg.parentNode ? getComputedStyle(svg.parentNode).overflow : null } })(),
             nHijos: svg ? svg.childNodes.length : null } },

  vabDib() {
    var s = document.getElementById('vab-svg');
    if (!s) return { err: 'NO EXISTE vab-svg' };
    var r = s.getBoundingClientRect();
    var g = function(id){ var e = document.getElementById(id); return e ? e.getAttribute('d') : null };
    var o = { w: Math.round(r.width), h: Math.round(r.height),
              s1: g('vab-s1'), s2: g('vab-s2'), s3: g('vab-s3'),
              cierre: g('vab-cierre'), rafe: g('vab-rafe') };
    var rf = document.getElementById('vab-rafe');
    if (rf) { o.rafeColor = rf.getAttribute('stroke'); o.rafeOp = rf.getAttribute('opacity') }
    o.puntos = [];
    for (var i = 1; i <= 4; i++) { var p = document.getElementById('vab-d' + i);
      o.puntos.push(p ? { cx: p.getAttribute('cx'), cy: p.getAttribute('cy'), op: p.getAttribute('opacity') } : null) }
    var nt = document.getElementById('vab-nota');
    o.nota = nt ? (nt.textContent || '').trim() : 'NO EXISTE';
    o.letras = {};
    ['R','L','N'].forEach(function(k){ var e = document.getElementById('vab-l' + k);
      o.letras[k] = e ? { x: e.getAttribute('x'), y: e.getAttribute('y'), op: e.getAttribute('opacity'),
                          txt: (e.textContent || '').trim() } : 'NO EXISTE' });
    o.hits = [];
    s.querySelectorAll('[data-vab-hit]').forEach(function(e){
      var rr = e.getBoundingClientRect();
      o.hits.push({ k: e.getAttribute('data-vab-hit'), cx: e.getAttribute('cx'), cy: e.getAttribute('cy'),
                    r: e.getAttribute('r'), w: Math.round(rr.width), h: Math.round(rr.height) }) });
    return o },

  /* Las SEIS tarjetas i de la VAB. */
  vabTarj(clave) {
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { hayBoton: false };
    var r = b.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return { hayBoton: true, sinGeometria: true };
    if (r.top < 0 || r.bottom > window.innerHeight) b.scrollIntoView({ block: 'center' });
    b.click();
    var c = document.getElementById('vinfo-card');
    var ab = !!(c && getComputedStyle(c).display !== 'none');
    var t = ab ? (c.textContent || '').replace(/\\s+/g, ' ').trim() : null;
    var dentro = ab ? (function(){ var rc = c.getBoundingClientRect();
      return rc.top >= -1 && rc.bottom <= window.innerHeight + 1 })() : null;
    if (ab) b.click();
    return { hayBoton: true, abierta: ab, dentro: dentro, texto: t } },

  /* Los textos de salida: informe en los tres estilos y EN SUMA. */
  salida() {
    var o = {};
    ['estandar','narrativo','conciso'].forEach(function(st){
      try { if (typeof setEstiloInforme === 'function') setEstiloInforme(st) } catch (e) {}
      try { generarInforme() } catch (e) { o[st] = 'EXC: ' + e.message; return }
      o[st] = (document.getElementById('informe_texto') || {}).value || '';
      o['suma_' + st] = (document.getElementById('en_suma') || {}).value || '';
    });
    return o },

  /* Solo las lineas que nombran la VAB o la aorta, para que el A/B no arrastre el resto. */
  lineasVAB(txt) {
    return String(txt || '').split(/[.\\n]/).filter(function(l){
      return /bic[uú]spide|VAB|ra[ií]z a[oó]rtica|aorta ascendente|coartaci/i.test(l) })
      .map(function(l){ return l.trim() }).filter(Boolean) },

  excelN() {
    try { if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
      var inf = window.__P.reg({}, 'x');
      var f = _labExcelRow(inf);
      return { n: Object.keys(f).length } }
    catch (e) { return 'EXC: ' + e.message } },

  campos() {
    try { var o = {}, n = 0;
      document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(e){
        var id = e.id;
        if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(id)) return;
        if (id === 'informe_texto' || id === 'en_suma') return;
        o[id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : e.value; n++ });
      /* ⚠️ SE ORDENA ANTES DE HASHEAR. El objeto se arma en ORDEN DEL DOM, asi que mover un
         campo de columna cambia el string sin cambiar un solo valor, y el A/B informa
         «distinto» sobre un commit que no toco ninguno. Es la trampa que este repo ya tiene
         escrita desde la tanda D1. */
      var orden = {}; Object.keys(o).sort().forEach(function(k){ orden[k] = o[k] });
      var s = JSON.stringify(orden), h = 0, i;
      for (i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      return { n: n, hash: h } }
    catch (e) { return 'EXC: ' + e.message } }
};
1`);

  /* ══ GRUPO «letras» — los rotulos de feston en las tres vistas y en ocho angulos ═════════ */
  if (corre('letras')) {
    const r = { escenas: {} };
    try {
      r.ir = await ev(`window.__Y.irETE()`);
      r.inicial = await ev(`window.__Y.qx()`);
      for (const vk of ['cir', 'ett', 'tg']) {
        await ev(`window.__Y.vista(${JSON.stringify(vk)})`);
        await pausa(900);
        r.escenas['vista_' + vk] = await ev(`window.__Y.qx()`);
      }
      await ev(`window.__Y.vista('cir')`); await pausa(900);
      for (const a of [0, 45, 90, 135, 180, 225, 270, 315]) {
        await ev(`window.__Y.girar(${a})`);
        await pausa(900);
        r.escenas['giro_' + a] = await ev(`window.__Y.qx()`);
      }
      /* DURANTE el arrastre: se mide sin esperar a converger. */
      await ev(`window.__Y.girar(0)`); await pausa(900);
      await ev(`window.__Y.girar(137)`);
      await pausa(120);
      r.escenas.enMovimiento = await ev(`window.__Y.qx()`);
      await pausa(1200);
      r.escenas.trasConverger = await ev(`window.__Y.qx()`);
    } catch (e) { r.err = e.message; }
    out.grupos.letras = r;
    process.stderr.write('[letras] listo\n');
  }

  /* ══ GRUPO «teer» — flail gap, ancho, longitud de coaptacion y el veredicto sin dato ════ */
  if (corre('teer')) {
    const r = { escenas: {} };
    const base = { teer_lva: '22', teer_lvp: '9', teer_area_mitral: '5', teer_pasp: '40',
                   teer_prof_flail: '8', teer_ancho_flail: '12', teer_flail_gap: '5' };
    const poner = async (ex) => {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__Y.irTEER()`);
      await ev(`window.__P.sel('teer_tipo_im','primaria')`);
      await ev(`window.__P.sel('teer_calcificacion','no')`);
      await ev(`window.__P.sel('teer_clefts','no')`);
      await ev(`window.__P.sel('teer_trombo','no')`);
      for (const [k, v2] of Object.entries(Object.assign({}, base, ex))) {
        if (v2 === null) continue;
        await tipear(k, v2);
      }
      await ev(`(function(){ calcTEER(); return 1 })()`);
      return await ev(`window.__Y.teerVer()`);
    };
    try {
      r.rotulos = await ev(`window.__Y.teerRot()`);
      r.escenas.base = await poner({});
      /* FLAIL GAP: los tres bordes. Hoy el campo no lo lee nadie. */
      for (const g of ['9.9', '10', '10.1', '12']) {
        r.escenas['gap_' + g] = await poner({ teer_flail_gap: g });
      }
      /* ANCHO DE FLAIL: los tres bordes. */
      for (const a of ['14.9', '15', '15.1']) {
        r.escenas['ancho_' + a] = await poner({ teer_ancho_flail: a });
      }
      /* SIN DATO: el flail gap vacio con todo lo demas cargado. */
      r.escenas.gapVacio = await poner({ teer_flail_gap: '' });
      /* LONGITUD DE COAPTACION (IM secundaria): los tres bordes. */
      const baseSec = { teer_lva: '22', teer_lvp: '9', teer_area_mitral: '5', teer_pasp: '40',
                        teer_prof_flail: '8', teer_fevi: '35', teer_dtsvi: '60' };
      const ponerSec = async (ex) => {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__Y.irTEER()`);
        await ev(`window.__P.sel('teer_tipo_im','secundaria')`);
        await ev(`window.__P.sel('teer_calcificacion','no')`);
        await ev(`window.__P.sel('teer_clefts','no')`);
        await ev(`window.__P.sel('teer_trombo','no')`);
        for (const [k, v2] of Object.entries(Object.assign({}, baseSec, ex))) {
          if (v2 === null) continue;
          await tipear(k, v2);
        }
        await ev(`(function(){ calcTEER(); return 1 })()`);
        return await ev(`window.__Y.teerVer()`);
      };
      for (const lg of ['1.9', '2', '2.1', '7']) {
        r.escenas['long_' + lg] = await ponerSec({ teer_gap: lg });
      }
    } catch (e) { r.err = e.message; }
    out.grupos.teer = r;
    process.stderr.write('[teer] listo\n');
  }

  /* ══ GRUPO «auto» — FEVI y DSFVI de TEER secundaria ═════════════════════════════════════ */
  if (corre('auto')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      /* Primero se carga el ORIGEN en AI/VI, como lo hace el medico. */
      await tipear('fevi', '35');
      await tipear('dsfvi', '58');
      r.origen = { fevi: await ev(`window.__P.val('fevi')`), dsfvi: await ev(`window.__P.val('dsfvi')`) };
      /* Y despues se mira el TEER, SIN abrir el acordeon: es el caso del medico que ya lo abrio. */
      r.antesDeAbrir = { teer_fevi: await ev(`window.__P.val('teer_fevi')`),
                         teer_dtsvi: await ev(`window.__P.val('teer_dtsvi')`) };
      r.ir = await ev(`window.__Y.irTEER()`);
      r.trasAbrir = { teer_fevi: await ev(`window.__P.val('teer_fevi')`),
                      teer_dtsvi: await ev(`window.__P.val('teer_dtsvi')`) };
      /* Con el acordeon YA abierto, se vuelve a cargar el origen: ese es el gesto que falla. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__Y.irTEER()`);
      await tipear('fevi', '42');
      await tipear('dsfvi', '63');
      r.conAcordeonAbierto = { teer_fevi: await ev(`window.__P.val('teer_fevi')`),
                               teer_dtsvi: await ev(`window.__P.val('teer_dtsvi')`) };
      await ev(`window.__P.sel('teer_tipo_im','secundaria')`);
      await ev(`(function(){ calcTEER(); return 1 })()`);
      r.veredicto = await ev(`window.__Y.teerVer()`);
      r.rot = await ev(`window.__Y.teerRot()`);
      /* Y el borrado del origen: regla ARR. */
      await borrar('fevi', 'del');
      await borrar('dsfvi', 'del');
      r.trasBorrar = { teer_fevi: await ev(`window.__P.val('teer_fevi')`),
                       teer_dtsvi: await ev(`window.__P.val('teer_dtsvi')`) };
    } catch (e) { r.err = e.message; }
    out.grupos.auto = r;
    process.stderr.write('[auto] listo\n');
  }

  /* ══ GRUPO «vab» — el estado actual de la seccion ═══════════════════════════════════════ */
  if (corre('vab')) {
    const r = { escenas: {} };
    try {
      await ev(`window.__P.nuevo()`);
      r.ir = await ev(`window.__Y.irVAB()`);
      r.vacia = await ev(`window.__Y.vab()`);
      r.dibujo = await ev(`window.__Y.vabDib()`);
      /* Escena completa: tipo, rafe, simetria, funcion, aorta y un factor de riesgo. */
      await ev(`window.__P.sel('vab_tipo','fused_rl')`);
      await ev(`window.__P.sel('vab_rafe','si')`);
      await ev(`window.__P.sel('vab_simetria','simetrica')`);
      await ev(`window.__P.sel('vab_funcion','normal')`);
      await ev(`window.__P.sel('va_morf','Bicúspide')`);
      await tipear('ao_sin', '38');
      await tipear('ao_tub', '42');
      await ev(`window.__Y.irVAB()`);
      r.escenas.cargada = await ev(`window.__Y.vab()`);
      /* El informe y el EN SUMA con el modulo integrado. */
      await ev(`(function(){ var c = document.getElementById('vab_incluir_chk');
        if (c && !c.checked) eteInclToggle('vab_incluir_chk'); return !!(c && c.checked) })()`);
      r.salida = await ev(`window.__Y.salida()`, 60000);
      r.lineas = {};
      for (const st of ['estandar', 'narrativo', 'conciso']) {
        r.lineas[st] = await ev(`window.__Y.lineasVAB(${JSON.stringify(r.salida[st] || '')})`);
        r.lineas['suma_' + st] = r.salida['suma_' + st];
      }
      r.excel = await ev(`window.__P.excel ? 'hay' : 'no'`);
    } catch (e) { r.err = e.message; }
    out.grupos.vab = r;
    process.stderr.write('[vab] listo\n');
  }

  /* == GRUPO «morf» - la morfologia de Valvulas sigue al tipo de fusion =================== */
  if (corre('morf')) {
    const r = {};
    const leer = async () => await ev(`window.__Y.vabMorf()`);
    try {
      /* (a) Elegir un tipo por la LISTA pone la morfologia en Bicuspide. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__Y.irVAB()`);
      r.inicio = await leer();
      await ev(`window.__P.sel('vab_tipo','fused_rl')`);
      r.porLista = await leer();
      /* (b) Y tocando el rafe, tambien. */
      await ev(`window.__P.nuevo()`);
      /* ⚠️ DESPEJAR ANTES DE ABRIR Y DE LEER EL RECT: al esconder el aviso legal la pagina
         recupera el scroll y un rect leido antes queda viejo. */
      await ev(`window.__P.despejar()`);
      await ev(`window.__Y.irVAB()`);
      const hit = await ev(`window.__Y.vabHit('fused_ln')`);
      if (!hit.err) {
        for (const type of ['mousePressed', 'mouseReleased']) {
          await cdp.send('Input.dispatchMouseEvent', { type, x: hit.x, y: hit.y,
            button: 'left', clickCount: 1 }, sessionId);
        }
        await pausa(140);
      }
      r.porToque = Object.assign({ enPunto: hit.enPunto }, await leer());
      /* (c) INVERSO 1: elegir «Bicuspide» a mano en Valvulas deja la seccion lista. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.sel('va_morf','Bicúspide')`);
      await ev(`window.__Y.irVAB()`);
      r.bicuspideAMano = await leer();
      /* (d) INVERSO 2: volver a «Trivalva normal» con un tipo cargado avisa y CONSERVA. */
      await ev(`window.__P.sel('vab_tipo','fused_rn')`);
      await ev(`window.__P.sel('va_morf','Trivalva normal')`);
      await ev(`window.__Y.irVAB()`);
      r.vueltaATrivalva = await leer();
      /* (e) CONTROL: una morfologia que el medico SI eligio no se pisa. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.sel('va_morf','TAVI')`);
      await ev(`window.__Y.irVAB()`);
      await ev(`window.__P.sel('vab_tipo','fused_rl')`);
      r.conTavi = await leer();
      /* (f) Y el aviso NO llega al informe ni al EN SUMA. */
      r.salida = await ev(`window.__Y.salida()`, 60000);
      r.avisoEnInforme = await ev(`(function(){
        var t = (document.getElementById('informe_texto') || {}).value || '';
        var s2 = (document.getElementById('en_suma') || {}).value || '';
        return { informe: t.indexOf('registrada en Válvulas') >= 0,
                 suma: s2.indexOf('registrada en Válvulas') >= 0 } })()`);
    } catch (e) { r.err = e.message; }
    out.grupos.morf = r;
    process.stderr.write('[morf] listo\n');
  }

  /* == GRUPO «inf» - el informe y el EN SUMA de la VAB ==================================== */
  if (corre('inf')) {
    const r = { escenas: {} };
    const ESC = [
      ['rl_calc_sim_normal', { vab_tipo:'fused_rl', vab_rafe:'si',  vab_simetria:'simetrica',  vab_funcion:'normal' }],
      ['rn_nocalc_asim',     { vab_tipo:'fused_rn', vab_rafe:'no',  vab_simetria:'asimetrica', vab_funcion:'normal' }],
      ['ln_noeval',          { vab_tipo:'fused_ln', vab_rafe:'no_eval', vab_simetria:'',       vab_funcion:'normal' }],
      ['dos_senos',          { vab_tipo:'dos_senos_ll', vab_rafe:'', vab_simetria:'simetrica', vab_funcion:'normal' }],
      ['partial',            { vab_tipo:'partial',  vab_rafe:'',    vab_simetria:'',           vab_funcion:'' }],
      ['sin_tipo',           { vab_tipo:'',         vab_rafe:'',    vab_simetria:'',           vab_funcion:'' }],
      ['con_fenotipo',       { vab_tipo:'fused_rl', vab_rafe:'si',  vab_simetria:'simetrica',  vab_funcion:'normal', vab_fenotipo:'raiz' }]
    ];
    const correr = async (campos, extra) => {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.sel('va_morf','Bicúspide')`);
      await tipear('ao_sin', '38');
      await tipear('ao_tub', '42');
      for (const [k, v2] of Object.entries(extra || {})) {
        try { await tipear(k, v2); } catch (e) { await ev(`window.__P.sel(${JSON.stringify(k)},${JSON.stringify(v2)})`); }
      }
      await ev(`window.__Y.irVAB()`);
      for (const [k, v2] of Object.entries(campos)) {
        if (v2 === '') continue;
        await ev(`window.__P.sel(${JSON.stringify(k)},${JSON.stringify(v2)})`);
      }
      await ev(`(function(){ var c = document.getElementById('vab_incluir_chk');
        if (c && !c.checked) eteInclToggle('vab_incluir_chk'); return !!(c && c.checked) })()`);
      const sal = await ev(`window.__Y.salida()`, 60000);
      const o = {};
      for (const st of ['estandar', 'narrativo', 'conciso']) {
        o[st] = await ev(`window.__Y.lineasVAB(${JSON.stringify(sal[st] || '')})`);
        o['suma_' + st] = sal['suma_' + st];
      }
      o.feno = await ev(`(function(){ var t = ${JSON.stringify(sal.estandar || '')};
        var i = t.indexOf('Fenotipo aortopático');
        return i < 0 ? null : t.slice(Math.max(0, i - 70), i + 44).split(String.fromCharCode(10)).join(' | ') })()`);
      o.conciso = await ev(`window.__Y.lineasVAB(${JSON.stringify(sal.conciso || '')})`);
      o.raizVeces = await ev(`(function(){ var t = ${JSON.stringify(sal.estandar || '')};
        return (t.match(/[Rr]a[ií]z a[oó]rtica/g) || []).length })()`);
      o.discrepancia = await ev(`(function(){ var t = ${JSON.stringify((sal.estandar || '') + (sal.suma_estandar || ''))};
        return t.indexOf('resolver la discrepancia') >= 0 })()`);
      o.recordatorio = await ev(`(function(){ var t = ${JSON.stringify((sal.estandar || '') + (sal.suma_estandar || ''))};
        return t.indexOf('85 %') >= 0 || t.indexOf('excluir coartación') >= 0 })()`);
      return o;
    };
    try {
      for (const [k, c] of ESC) r.escenas[k] = await correr(c, null);
      /* Con ESTENOSIS: la VAB no repite la lesion que el EN SUMA ya trae. */
      r.escenas.conEstenosis = await correr(
        { vab_tipo:'fused_rl', vab_rafe:'si', vab_simetria:'simetrica', vab_funcion:'estenosis' },
        { vmax_ao:'4.3', gmedio_ao:'45' });
      /* Y el CONTROL: con otra morfologia la frase de la aortica no cambia. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.sel('va_morf','Trivalva normal')`);
      await tipear('ao_sin', '38');
      await tipear('ao_tub', '42');
      const sal2 = await ev(`window.__Y.salida()`, 60000);
      r.controlTrivalva = {};
      for (const st of ['estandar', 'narrativo', 'conciso']) {
        r.controlTrivalva[st] = await ev(`window.__Y.lineasVAB(${JSON.stringify(sal2[st] || '')})`);
        r.controlTrivalva['suma_' + st] = sal2['suma_' + st];
      }
    } catch (e) { r.err = e.message; }
    out.grupos.inf = r;
    process.stderr.write('[inf] listo\n');
  }

  /* == GRUPO «coa» - el recordatorio de la coartacion, SOLO en pantalla =================== */
  if (corre('coa')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.sel('va_morf','Bicúspide')`);
      await tipear('ao_sin', '38');
      await tipear('ao_tub', '42');
      await ev(`window.__Y.irVAB()`);
      await ev(`window.__P.sel('vab_tipo','fused_rl')`);
      await ev(`window.__P.sel('vab_rafe','si')`);
      await ev(`(function(){ var c = document.getElementById('vab_incluir_chk');
        if (c && !c.checked) eteInclToggle('vab_incluir_chk'); return !!(c && c.checked) })()`);
      await ev(`(function(){ var b = document.getElementById('vab-pdf-btn');
        if (!vabPdfOn()) b.click(); return vabPdfOn() })()`);
      r.enPantalla = await ev(`(function(){ var e = document.getElementById('vab-coa-nota');
        if (!e) return 'NO EXISTE';
        return { vis: getComputedStyle(e).display !== 'none',
                 txt: (e.textContent || '').trim(),
                 color: getComputedStyle(e).color,
                 conNumero: /\d+\s*%/.test(e.textContent || '') } })()`);
      const sal = await ev(`window.__Y.salida()`, 60000);
      const BUSCA = ['coartaci', '85 %', '85%'];
      r.superficies = {};
      for (const st of ['estandar', 'narrativo', 'conciso']) {
        r.superficies['informe_' + st] = BUSCA.filter(b => (sal[st] || '').toLowerCase().indexOf(b.toLowerCase()) >= 0);
        r.superficies['suma_' + st] = BUSCA.filter(b => (sal['suma_' + st] || '').toLowerCase().indexOf(b.toLowerCase()) >= 0);
      }
      r.pdf = {};
      for (const pl of ['clasico', 'academico']) {
        const d = await ev(`window.__P.pdf(${JSON.stringify(pl)})`, 60000);
        r.pdf[pl] = (d.textos || []).filter(t => /coartaci|85\s?%/i.test(t));
      }
      r.ppt = await ev(`window.__P.labPPT([])`, 60000);
      /* El censo del fuente: cuantas veces queda el 85 % en el modulo de la VAB. */
      /* ⚠️ EL CENSO VA SOBRE EL TEXTO RENDERIZADO Y NO SOBRE EL FUENTE: los comentarios que
         explican el retiro NOMBRAN la frase retirada, asi que buscarla en el fuente la
         encuentra siempre. Es la trampa de `.ip-ap-col2` que este repo ya tiene escrita. */
      r.censo = await ev(`(function(){
        var t = document.body.innerText || '';
        return { en85: (t.match(/85 % de las v/g) || []).length,
                 conNumero: /coartaci[^.]{0,80}\d+\s?%/i.test(t) } })()`);
    } catch (e) { r.err = e.message; }
    out.grupos.coa = r;
    process.stderr.write('[coa] listo\n');
  }

  /* == GRUPO «pdf» - el dibujo y la tabla de la VAB en el papel =========================== */
  if (corre('pdf')) {
    const r = { plantillas: {} };
    const montar = async () => {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.sel('va_morf','Bicúspide')`);
      await tipear('ao_sin', '38');
      await tipear('ao_tub', '42');
      await ev(`window.__Y.irVAB()`);
      await ev(`window.__P.sel('vab_tipo','fused_rl')`);
      await ev(`window.__P.sel('vab_rafe','si')`);
      await ev(`window.__P.sel('vab_simetria','simetrica')`);
      await ev(`window.__P.sel('vab_funcion','normal')`);
    };
    try {
      await montar();
      r.filas = await ev(`(function(){ return (typeof vabPdfFilas === 'function') ? vabPdfFilas() : 'SIN FN' })()`);
      r.dataURL = await ev(`(function(){ try { var d = vabDataURL();
        return d ? { largo: d.length, pre: d.slice(0, 22) } : null } catch (e) { return 'EXC: ' + e.message } })()`);
      /* SIN el boton: el PDF no cambia. */
      for (const pl of ['clasico', 'academico', 'moderno', 'minimalista', 'compacto', 'elegante']) {
        r.plantillas[pl] = { sin: await ev(`window.__P.pdf(${JSON.stringify(pl)})`, 60000) };
      }
      /* CON el boton. */
      await ev(`(function(){ document.getElementById('vab-pdf-btn').click(); return vabPdfOn() })()`);
      for (const pl of ['clasico', 'academico', 'moderno', 'minimalista', 'compacto', 'elegante']) {
        r.plantillas[pl].con = await ev(`window.__P.pdf(${JSON.stringify(pl)})`, 60000);
      }
      /* Y el control: con el boton tildado pero la seccion VACIA, el papel no cambia. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.sel('va_morf','Bicúspide')`);
      await ev(`window.__Y.irVAB()`);
      await ev(`(function(){ var b = document.getElementById('vab-pdf-btn');
        if (!vabPdfOn()) b.click(); return vabPdfOn() })()`);
      r.vacia = { on: await ev(`vabPdfOn()`),
                  filas: await ev(`vabPdfFilas()`),
                  pdf: await ev(`window.__P.pdf('clasico')`, 60000) };
    } catch (e) { r.err = e.message; }
    out.grupos.pdf = r;
    process.stderr.write('[pdf] listo\n');
  }

  /* == GRUPO «dib» - el dibujo de la VAB ================================================== */
  if (corre('dib')) {
    const r = { tipos: {}, toque: {}, pdf: {} };
    const TIPOS = ['', 'fused_rl', 'fused_rn', 'fused_ln', 'dos_senos_ll', 'dos_senos_ap', 'partial', 'no_clasif'];
    try {
      await viewport(1400, 900);
      await ev(`window.__P.nuevo()`);
      await ev(`window.__Y.irVAB()`);
      await ev(`window.__P.despejar()`);
      for (const t of TIPOS) {
        await ev(`window.__P.sel('vab_tipo', ${JSON.stringify(t)})`);
        r.tipos[t || 'vacio'] = await ev(`window.__Y.vabDib()`);
      }
      await ev(`window.__P.sel('vab_tipo','fused_rl')`);
      await ev(`window.__P.sel('vab_rafe','no')`);
      r.rafeNo = await ev(`window.__Y.vabDib()`);
      await ev(`window.__P.sel('vab_rafe','si')`);
      r.rafeSi = await ev(`window.__Y.vabDib()`);
      await ev(`window.__P.sel('vab_simetria','simetrica')`);
      r.sim = await ev(`window.__Y.vabDib()`);
      await ev(`window.__P.sel('vab_simetria','asimetrica')`);
      r.asim = await ev(`window.__Y.vabDib()`);
      r.color = {};
      for (const claro of [false, true]) {
        const t = await ev(`window.__P.tema(${claro})`);
        if (!!t.claro !== claro) throw new Error('EL TEMA NO QUEDO');
        r.color[claro ? 'claro' : 'oscuro'] = await ev(`window.__Y.vabColor()`);
      }
      await ev(`window.__P.tema(false)`);
      /* TOCAR el rafe con el raton REAL. */
      for (const k of ['fused_rn', 'fused_ln', 'fused_rl']) {
        await ev(`window.__P.sel('vab_tipo','')`);
        await ev(`window.__P.despejar()`);
        /* ⚠️ LA SECCION HAY QUE ABRIRLA ANTES DE CADA TOQUE: con el acordeon cerrado el SVG
           conserva su rect pero queda RECORTADO, no es hit-testable, y `elementFromPoint`
           devuelve el acordeon. Medido: devolvia DIV#sacc-cc-vab en los tres puntos. */
        await ev(`window.__Y.irVAB()`);
        const hit = await ev(`window.__Y.vabHit(${JSON.stringify(k)})`);
        if (hit.err) { r.toque[k] = hit; continue; }
        for (const type of ['mousePressed', 'mouseReleased']) {
          await cdp.send('Input.dispatchMouseEvent', { type, x: hit.x, y: hit.y,
            button: 'left', clickCount: 1 }, sessionId);
        }
        await pausa(140);
        r.toque[k] = Object.assign({}, hit, { tipo: await ev(`window.__P.val('vab_tipo')`) });
      }
      /* El boton del PDF. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__Y.irVAB()`);
      r.pdf.inicio = await ev(`window.__Y.vabPdfEstado()`);
      await ev(`(function(){ document.getElementById('vab-pdf-btn').click(); return 1 })()`);
      r.pdf.tildado = await ev(`window.__Y.vabPdfEstado()`);
      await ev(`(function(){ document.getElementById('vab-pdf-btn').click(); return 1 })()`);
      r.pdf.destildado = await ev(`window.__Y.vabPdfEstado()`);
      await ev(`(function(){ document.getElementById('vab-pdf-btn').click(); return 1 })()`);
      r.pdf.delEstudio = await ev(`!(typeof _noEsDelEstudio === 'function' && _noEsDelEstudio('vab_pdf'))`);
      await ev(`window.__P.nuevo()`);
      r.pdf.trasNuevo = await ev(`window.__P.val('vab_pdf')`);
      /* Y el borrado de los campos: regla ARR. */
      await ev(`window.__P.sel('vab_tipo','fused_rl')`);
      await ev(`window.__P.sel('vab_rafe','si')`);
      r.borrado = { conDato: await ev(`window.__Y.vabDib()`) };
      await ev(`window.__P.sel('vab_rafe','')`);
      await ev(`window.__P.sel('vab_tipo','')`);
      r.borrado.sinDato = await ev(`window.__Y.vabDib()`);
    } catch (e) { r.err = e.message; }
    out.grupos.dib = r;
    process.stderr.write('[dib] listo\n');
  }

  /* ══ GRUPO «fr» — las SEIS casillas de los factores de riesgo ═══════════════════════════ */
  if (corre('fr')) {
    const r = { escenas: {}, migra: {} };
    const CHK = ['vabchk-familiar','vabchk-hta','vabchk-crecimiento','vabchk-longitud','vabchk-cx','vabchk-embarazo'];
    const leer = async () => ({
      vab: await ev(`window.__Y.vab()`),
      chk: await ev(`(function(){ var o = {};
        ['vabchk-familiar','vabchk-hta','vabchk-crecimiento','vabchk-longitud','vabchk-cx','vabchk-embarazo']
          .forEach(function(k){ var e = document.getElementById(k);
            o[k] = e ? { checked: e.checked, tipo: e.type } : 'NO EXISTE' });
        return o })()`),
      excel: await ev(`(function(){ if (typeof _labExcelRow !== 'function') return 'SIN FN';
        var inf = window.__P.reg({}, 'fr'); var f = _labExcelRow(inf); var o = {};
        Object.keys(f).forEach(function(k){ if (k.indexOf('VAB FR') === 0) o[k] = f[k] });
        return { n: Object.keys(f).length, fr: o } })()`)
    });
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__Y.irVAB()`);
      r.escenas.vacia = await leer();
      /* Marcar DOS con un clic real. */
      for (const k of ['vabchk-hta', 'vabchk-embarazo']) {
        await ev(`(function(){ var e = document.getElementById(${JSON.stringify(k)});
          e.scrollIntoView({ block:'center' }); e.click(); return e.checked })()`);
      }
      r.escenas.dosMarcadas = await leer();
      /* Destildar una. */
      await ev(`(function(){ document.getElementById('vabchk-hta').click(); return 1 })()`);
      r.escenas.unaMarcada = await leer();
      /* «Nuevo estudio» tiene que destildarlas. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__Y.irVAB()`);
      r.escenas.trasNuevo = await leer();
      /* MIGRACION: un estudio guardado con cada uno de los cuatro valores viejos. */
      for (const val of ['si', 'no', 'no_eval', '']) {
        await ev(`window.__P.abrirComoEstudio({ vab_fr_hta: ${JSON.stringify(val)}, vab_tipo: 'fused_rl', ao_sin: '38', ao_tub: '42' })`, 40000);
        await ev(`window.__Y.irVAB()`);
        r.migra[val || 'vacio'] = {
          chk: await ev(`(document.getElementById('vabchk-hta') || {}).checked`),
          campo: await ev(`window.__P.val('vab_fr_hta')`),
          fila: await ev(`window.__P.txt('vab-fr')`)
        };
      }
      /* La CONCLUSION en las escenas que dependen de los factores. */
      const conc = async (ex) => {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.sel('va_morf','Bicúspide')`);
        await tipear('ao_tub', '51');
        await tipear('ao_sin', '38');
        await ev(`window.__P.sel('vab_riesgo_qx','si')`);
        await ev(`window.__Y.irVAB()`);
        for (const k of ex) await ev(`(function(){ var e = document.getElementById(${JSON.stringify(k)});
          e.scrollIntoView({ block:'center' }); e.click(); return e.checked })()`);
        return await ev(`window.__Y.vab()`);
      };
      r.conclusion = { ninguno: await conc([]), uno: await conc(['vabchk-hta']),
                       dos: await conc(['vabchk-hta', 'vabchk-cx']) };
    } catch (e) { r.err = e.message; }
    out.grupos.fr = r;
    process.stderr.write('[fr] listo\n');
  }

  /* ══ GRUPO «tarj» — las SEIS tarjetas de la VAB y la maqueta ═══════════════════════════ */
  if (corre('tarj')) {
    const r = { tarjetas: {}, maqueta: {} };
    const CLAVES = ['vab-tit', 'vab-valv', 'vab-func', 'vab-aorta', 'vab-cx', 'vab-friesgo'];
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__Y.irVAB()`);
      for (const k of CLAVES) r.tarjetas[k] = await ev(`window.__Y.vabTarj(${JSON.stringify(k)})`);
      /* La maqueta en cuatro anchos por dos temas. */
      for (const [w, h] of [[1200, 800], [768, 1024], [390, 844], [360, 740]]) {
        await viewport(w, h);
        for (const claro of [false, true]) {
          const t = await ev(`window.__P.tema(${claro})`);
          if (!!t.claro !== claro) throw new Error('EL TEMA NO QUEDO: ' + JSON.stringify(t));
          await ev(`window.__Y.irVAB()`);
          await pausa(140);
          r.maqueta[w + '_' + (claro ? 'claro' : 'oscuro')] = {
            scroll: await ev(`window.__Y.scrollH()`),
            aviso: await ev(`(function(){ var e = document.getElementById('vab-coa-nota');
              if (!e) return 'NO EXISTE';
              var r2 = e.getBoundingClientRect();
              return { w: Math.round(r2.width), color: getComputedStyle(e).color } })()`),
            globos: await ev(`(function(){ var o = [];
              document.querySelectorAll('#sacc-cc-vab [data-vinfo]').forEach(function(b){
                var r2 = b.getBoundingClientRect();
                o.push({ k: b.getAttribute('data-vinfo'), w: Math.round(r2.width), h: Math.round(r2.height) }) });
              return o })()`),
            campos: await ev(`(function(){ var o = {};
              ['vab_tipo','vab_funcion','vab_fenotipo','vab_fr_hta'].forEach(function(id){
                var e = document.getElementById(id); if (!e) { o[id] = 'NO EXISTE'; return }
                var r2 = e.getBoundingClientRect(); o[id] = Math.round(r2.width) });
              return o })()`)
          };
        }
      }
      /* ⚠️ LOS SEIS GLOBOS MIDEN 16 x 12 px CON EL MOUSE Y 44 x 44 CON EL DEDO, por su
         `@media (pointer: coarse)`. `check_mobile.js` mide el rect del NODO SIN emular puntero
         grueso, asi que los informa como objetivo tactil chico: es el precedente de las tandas
         L, M y Q. Se mide con la emulacion puesta, que es el unico lever que mueve el media
         feature `pointer` -ni `mobile:true` ni `setEmulatedMedia` lo hacen-. */
      await cdp.send('Emulation.setTouchEmulationEnabled',
        { enabled: true, maxTouchPoints: 5 }, sessionId);
      await viewport(390, 844);
      await pausa(180);
      r.tactil = await ev(`(function(){ var o = [];
        document.querySelectorAll('#sacc-cc-vab [data-vinfo]').forEach(function(b){
          var r2 = b.getBoundingClientRect();
          o.push({ k: b.getAttribute('data-vinfo'), w: Math.round(r2.width), h: Math.round(r2.height) }) });
        return o })()`);
      /* Y las SEIS casillas: lo clicable es la ETIQUETA envolvente, no el cuadradito. */
      r.tactilChk = await ev(`(function(){ var o = [];
        Object.keys(window.VAB_FR_CHK || {}).forEach(function(k){
          var cb = document.getElementById(k); if (!cb) { o.push({ k: k, err: 'NO EXISTE' }); return }
          var lb = cb.closest('label'), r2 = cb.getBoundingClientRect(),
              r3 = lb ? lb.getBoundingClientRect() : null;
          o.push({ k: k, chk: Math.round(r2.width) + 'x' + Math.round(r2.height),
                   label: r3 ? Math.round(r3.width) + 'x' + Math.round(r3.height) : 'SIN LABEL' }) });
        return o })()`);
      /* ⚠️ `maxTouchPoints` TIENE QUE ESTAR ENTRE 1 Y 16 INCLUSO AL DESACTIVAR: con 0 el
         protocolo rechaza la llamada y la corrida muere antes de medir nada. */
      await cdp.send('Emulation.setTouchEmulationEnabled',
        { enabled: false, maxTouchPoints: 1 }, sessionId);
      await ev(`window.__P.tema(false)`);
      await viewport(1200, 800);
      /* 20 aperturas y cierres: nodos y oyentes. */
      await ev(`window.__Y.vabTarj('vab-tit')`);
      const n0 = await ev(`window.__Y.nodos()`);
      r.ciclo = await ev(`(function(){
        var b = document.querySelector('[data-vinfo="vab-tit"]'), i;
        var cuenta = 0, o = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(){ cuenta++; return o.apply(this, arguments) };
        for (i = 0; i < 20; i++) { b.click(); b.click(); }
        EventTarget.prototype.addEventListener = o;
        var c = document.getElementById('vinfo-card');
        return { oyentesNuevos: cuenta, cerrada: !!(c && getComputedStyle(c).display === 'none') } })()`);
      r.nodos = { antes: n0, despues: await ev(`window.__Y.nodos()`) };
    } catch (e) { r.err = e.message; }
    out.grupos.tarj = r;
    process.stderr.write('[tarj] listo\n');
  }

  /* == GRUPO «ctrl» - el A/B de control de toda la tanda ================================= */
  if (corre('ctrl')) {
    const r = {};
    const ESC = { peso:'78', talla:'172', edad:'58', ao_sin:'38', ao_tub:'42',
                  vmax_ao:'2.4', im_vc:'4', vmax_it:'2.6', onda_e:'70', onda_a:'60',
                  tde:'190', e_prima_sept:'7', e_prima_lat:'9', ai_vol:'52',
                  ddfvi:'50', dsfvi:'33', siv:'10', ppvi:'10', fevi:'60' };
    const medir = async () => ({
      salida: await ev(`window.__Y.salida()`, 60000),
      campos: await ev(`window.__Y.campos()`),
      excel:  await ev(`window.__Y.excelN()`),
      qxData: await ev(`window.__Y.qxData()`),
      refs:   await ev(`window.__P.refs()`)
    });
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      r.vacio = await medir();
      await ev(`window.__P.nuevo()`);
      for (const [k, v2] of Object.entries(ESC)) {
        try { await tipear(k, v2); } catch (e) { try { await ev(`window.__P.sel(${JSON.stringify(k)},${JSON.stringify(v2)})`); } catch (e2) {} }
      }
      await ev(`window.__P.calentar()`);
      r.cargado = await medir();
      r.pdf = {};
      for (const pl of ['clasico', 'academico']) r.pdf[pl] = await ev(`window.__P.pdf(${JSON.stringify(pl)})`, 60000);
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
