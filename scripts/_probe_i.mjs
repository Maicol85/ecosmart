#!/usr/bin/env node
/**
 * _probe_i.mjs - sonda A/B de SOLO LECTURA para la tanda I (ETE, ET e IP), 2026-10-22.
 *
 * Reusa TODA la infraestructura de scripts/_probe_e.mjs -teclas y clics reales, cierre del
 * arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su denominador,
 * md5 al principio y al final-. NO muta index.html.
 *
 *   node scripts/_probe_i.mjs --file /tmp/index.IHEAD.html --solo wilk > /tmp/i.HEAD.json
 *   node scripts/_probe_i.mjs                              --solo wilk > /tmp/i.NEW.json
 *
 * Grupos:
 *   wilk   - el score, su tramo, la segunda implementacion, la hoja del PDF y la ayuda.
 *   oai    - la orejuela: vaciamiento con su nota y su chip, trombo y rangos de dispositivo.
 *   repar  - los tres factores de la Tabla 7 por sus bordes, con sus dos mecanismos.
 *   atero  - el borde de 5 mm y el grado por espesor.
 *   refs   - las fichas de Referencias.
 *   evid   - las secciones del panel de Evidencia.
 *   maq    - cuatro anchos por dos temas, color real y scroll horizontal.
 *   captura- PNG de las zonas tocadas.
 *   ctrl   - los controles: informe, EN SUMA, Excel en 440, PDF, PPT, auditoria, Laboratorio.
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda, tampoco en los comentarios
 * de adentro. scripts/check_backticks.py da la linea exacta.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync, writeFileSync } from 'node:fs';
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
const DEST = arg('--dest') || tmpdir();
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
  /* ⚠️ UN `<select>` NO RECIBE TEXTO, Y MANDARSELO ENSUCIA EL CAMPO ANTERIOR. Lo cazo MIRAR la
     captura: con el patron «tipear y si falla, sel()» el `Input.insertText` aterrizaba en el
     ultimo input de TEXTO enfocado y el PNG mostraba «12sisimoderadosi» en la excursion del
     aneurisma. `tipear` lanzaba despues -el valor no quedaba en el select- y el `catch` ponia
     el select bien, asi que la medicion NUMERICA salia correcta: `v('fop_asa_mm')` lee 12 de
     «12sisimoderadosi». Un denominador roto con pinta de medicion buena.
     Se decide por el TAG antes de tocar nada. */
  async function poner(id, valor) {
    const tag = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      return e ? e.tagName : 'NO EXISTE' })()`);
    if (tag === 'SELECT') {
      const r = await ev(`window.__P.sel(${JSON.stringify(id)},${JSON.stringify(valor)})`);
      if (!r || r.err) throw new Error('EL SELECT NO QUEDO en ' + id + ': ' + JSON.stringify(r));
      return valor;
    }
    if (tag === 'NO EXISTE') throw new Error('NO EXISTE ' + id);
    return await tipear(id, valor);
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
     tanda no puede romper la infraestructura que comparten diez sondas. */
  await evCrudo(`
window.__Y = {
  /* ── WILKINS: el badge, la segunda implementacion y la hoja del PDF ───────────────────── */
  wilkLee() {
    var o = { total: null, interp: null, banda: null, cx: null, pdf: null, ayuda: null, labTit: null };
    var t = document.getElementById('wilkins-total'), i = document.getElementById('wilkins-interp');
    o.total = t ? (t.textContent || '').trim() : 'NO EXISTE';
    o.interp = i ? (i.textContent || '').trim() : 'NO EXISTE';
    o.banda = (i && i.dataset) ? (i.dataset.banda || '') : null;
    var c = document.getElementById('cx-wilkins-total');
    o.cx = c ? (c.textContent || '').trim() : 'NO EXISTE';
    try { o.pdf = (typeof amiloTextoWilkins === 'function') ? amiloTextoWilkins() : 'SIN FN' }
    catch (e) { o.pdf = 'EXC: ' + e.message }
    var sec = document.getElementById('ete-seccion-wilkins');
    var p = sec ? sec.querySelector('p') : null;
    o.ayuda = p ? (p.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE';
    o.globo = !!document.querySelector('[data-vinfo="wilk-score"]');
    o.tramo = (typeof WILK_TRAMO !== 'undefined') ? JSON.parse(JSON.stringify(WILK_TRAMO)) : 'NO EN AMBITO';
    try {
      var cards = document.querySelectorAll('#lab-acc-wilkins div');
      for (var k = 0; k < cards.length; k++) {
        var tx = (cards[k].textContent || '').trim();
        if (tx.indexOf('valvuloplastia') > -1 || tx.indexOf('score de Wilkins') > -1
            || tx.indexOf('Distribuci') > -1) { o.labTit = tx.slice(0, 80); break }
      }
    } catch (e) { o.labTit = 'EXC' }
    o.labFuente = (typeof labEteRender === 'function')
      ? { usaTramo: labEteRender.toString().indexOf('WILK_TRAMO') > -1,
          favorable: labEteRender.toString().indexOf('favorable') > -1 } : 'SIN FN';
    return o },

  /* ── OREJUELA: velocidad con su nota y su chip, trombo y rangos de dispositivo ────────── */
  oaiLee() {
    var g = function(id){ var e = document.getElementById(id); return e ? (e.textContent || '').replace(/\\s+/g,' ').trim() : 'NO EXISTE' };
    var chip = document.getElementById('oai-vel-chip');
    var o = { vel: g('oai-vel-interp'), nota: g('oai-vel-nota'),
              chip: chip ? (getComputedStyle(chip).display !== 'none') : 'NO EXISTE',
              trombo: g('oai-trombo-interp'), eleg: g('oai-elegibilidad'), notas: g('oai-notas') };
    try { o.pdf = (typeof amiloTextoOAI === 'function') ? amiloTextoOAI() : 'SIN FN' }
    catch (e) { o.pdf = 'EXC: ' + e.message }
    return o },

  /* ── REPARABILIDAD: las cuatro filas, la frase y su pie ───────────────────────────────── */
  reparLee() {
    var g = function(id){ var e = document.getElementById(id); return e ? (e.textContent || '').replace(/\\s+/g,' ').trim() : 'NO EXISTE' };
    var o = { angulo: g('ete-angulo-interp'), tenting: g('ete-tenting-interp'),
              areatent: g('ete-areatent-interp'), coapt: g('ete-coapt-interp'),
              frase: g('ete-reparabilidad'), fuente: g('ete-repar-fuente') };
    try { o.mec = (typeof imMecanismoIM === 'function') ? (imMecanismoIM() || '') : 'SIN FN' }
    catch (e) { o.mec = 'EXC' }
    try { o.pdf = (typeof amiloTextoEteMitral === 'function') ? amiloTextoEteMitral() : 'SIN FN' }
    catch (e) { o.pdf = 'EXC: ' + e.message }
    return o },

  /* ── ATEROMA: la descripcion, el riesgo, el texto y el grado por espesor ──────────────── */
  ateroLee() {
    var g = function(id){ var e = document.getElementById(id); return e ? (e.textContent || '').replace(/\\s+/g,' ').trim() : 'NO EXISTE' };
    var o = { desc: g('ao-atero-desc'), riesgo: g('ao-riesgo-embol'),
              rec: g('ao-recomendacion'), grosor: g('ao-atero-grosor') };
    var s = document.getElementById('ao_grado_atero');
    o.opciones = s ? Array.prototype.slice.call(s.options).map(function(x){ return x.value + '=' + x.text }) : 'NO EXISTE';
    try { o.pdf = (typeof amiloTextoAortaETE === 'function') ? amiloTextoAortaETE() : 'SIN FN' }
    catch (e) { o.pdf = 'EXC: ' + e.message }
    try { o.porGrosor = (typeof ateroGradoPorGrosor === 'function')
      ? [4.9, 5, 5.1, 1.9, 2, 3, 3.1].map(function(x){ return x + '->' + ateroGradoPorGrosor(x) }) : 'SIN FN' }
    catch (e) { o.porGrosor = 'EXC' }
    return o },

  /* El texto renderizado de una zona entera, para censar frases que no deben estar. */
  censo(sel) {
    var e = document.querySelector(sel);
    if (!e) return 'NO EXISTE ' + sel;
    return (e.textContent || '').replace(/\\s+/g, ' ').trim() },

  /* Censo de literales sobre el MARCADO autorado (no sobre el JS): lo que el medico lee. */
  literal(frag) {
    var n = 0, nodos = document.querySelectorAll('label, option, p, span, div, td, th, b');
    for (var i = 0; i < nodos.length; i++) {
      var e = nodos[i];
      if (e.children && e.children.length) continue;
      if ((e.textContent || '').indexOf(frag) > -1) n++;
    }
    return n },


  /* ⚠️ VARIAS RESPUESTAS EN UNA SOLA APERTURA, Y HACE FALTA: indicAbrir LIMPIA _indClin
     ANTES de pintar -esta escrito en su propio comentario: abrir es la unica puerta por la que el
     panel se ve, asi que ahi la garantia es por construccion-, de modo que llamar evidResp tres
     veces deja viva SOLO la ultima. La primera medicion de esta tanda informo el bloque de
     cardioversion VACIO con las tres respuestas contestadas: era la sonda, no la app.
     Devuelve ademas el texto PINTADO de la seccion y cuantos bloques quedaron PLEGADOS, que es lo
     que distingue «recomendacion visible» de «recomendacion detras de un clic». */
  evidRespN(pares, tit) { try {
    if (typeof indicAbrir === 'function') indicAbrir();
    var hechos = [];
    for (var n = 0; n < pares.length; n++) {
      var k = pares[n][0], v = pares[n][1], ok = 'NO HAY boton ' + k + '=' + v;
      var bs = document.querySelectorAll('[data-ind-clin]');
      for (var i = 0; i < bs.length; i++) {
        if (bs[i].getAttribute('data-ind-clin') === k && bs[i].getAttribute('data-ind-val') === v) {
          bs[i].click(); ok = 'ok'; break }
      }
      hechos.push(k + '=' + v + ':' + ok);
    }
    var o = { hechos: hechos };
    var c = document.getElementById('indic-cuerpo');
    if (c && tit) {
      var det = c.querySelectorAll('details'), h = null;
      for (var j = 0; j < det.length; j++) {
        var sm = det[j].querySelector('summary');
        if (sm && (sm.textContent || '').trim().indexOf(tit) === 0) h = det[j];
      }
      if (h) { var _t = (h.textContent || '');
               var _o = '', _sp = false;
               for (var q = 0; q < _t.length; q++) { var cc = _t.charCodeAt(q);
                 var es = (cc === 32 || cc === 9 || cc === 10 || cc === 13 || cc === 160);
                 if (es) { if (!_sp) { _o += ' '; _sp = true } } else { _o += _t.charAt(q); _sp = false } }
               o.texto = _o.trim();
               o.plegados = h.querySelectorAll('[data-ind-bloque]').length;
               o.abierta = !!h.open; }
      else o.texto = 'SECCION NO PINTADA';
    }
    if (typeof indicCerrar === 'function') indicCerrar();
    return o }
    catch (e) { try { if (typeof indicCerrar === 'function') indicCerrar() } catch (e2) {}
      return 'EXC: ' + e.message } },

  /* El texto de una ficha de Referencias, abierta por su gesto. */
  /* Una seccion del panel de Evidencia, por su titulo. Devuelve el OBJETO y el texto PINTADO:
     solo el objeto deja pasar un bloque que la seccion arma y el renderizador no pinta; solo el
     HTML no distingue «no aplica» de «no se evaluo». */
  evid(tit) { try {
    if (typeof IND_SECS === 'undefined' && !window.IND_SECS) return 'SIN IND_SECS';
    var L = window.IND_SECS || IND_SECS;
    var s = null; for (var i = 0; i < L.length; i++) if (L[i].tit === tit) s = L[i];
    if (!s) return { existe: false, titulos: L.map(function(x){ return x.tit }) };
    var r = null; try { r = s.fn() } catch (e) { return { existe: true, err: 'EXC en fn(): ' + e.message } }
    if (!r) return { existe: true, r: null };
    return { existe: true,
      filas: (r.filas || []).map(function(f){ return { lbl: f.lbl, val: f.val, marca: f.marca,
        nota: String(f.nota || '').slice(0, 220), ctrl: f.ctrl ? f.ctrl.clave : null,
        refs: (f.refs || []).join(',') } }),
      bloques: (r.bloques || []).map(function(b){ return { tit: b.tit, plegado: !!b.plegado,
        lineas: (b.lineas || []).map(function(l){ return typeof l === 'string' ? l : l.txt }),
        nota: b.nota || null } }),
      clinica: (r.clinica || []).map(function(f){ return f.lbl }),
      guia: r.guia ? { ref: r.guia.ref, txt: String(r.guia.txt || '').slice(0, 300) } : null,
      notas: (r.notas || []).length } }
    catch (e) { return 'EXC: ' + e.message } },

  /* El panel pintado: cuantas secciones y el texto de una. */
  evidPintado(tit) { try {
    if (typeof indicAbrir === 'function') indicAbrir();
    var c = document.getElementById('indic-cuerpo');
    if (!c) return 'NO EXISTE indic-cuerpo';
    var det = c.querySelectorAll('details'), halla = null, n = 0;
    for (var i = 0; i < det.length; i++) {
      var sm = det[i].querySelector('summary');
      if (!sm) continue;
      var t = (sm.textContent || '').trim();
      if (t.indexOf(tit) === 0) { halla = det[i]; }
      if (det[i].parentNode === c || (det[i].parentNode && det[i].parentNode.parentNode === c)) n++;
    }
    var o = { nDetalles: det.length, hallada: !!halla };
    if (halla) { o.texto = (halla.textContent || '').trim().slice(0, 1500);
                 o.abierta = !!halla.open;
                 o.bloquesVisibles = halla.querySelectorAll('[data-ind-bloque]').length; }
    if (typeof indicCerrar === 'function') indicCerrar();
    return o }
    catch (e) { try { if (typeof indicCerrar === 'function') indicCerrar() } catch (e2) {}
      return 'EXC: ' + e.message } },

  /* Contesta una pregunta del panel por su CLAVE, con un clic real sobre el boton. */
  evidResp(clave, valor) { try {
    if (typeof indicAbrir === 'function') indicAbrir();
    var bs = document.querySelectorAll('[data-ind-clin]');
    var hecho = 'NO HAY boton con clave ' + clave;
    for (var i = 0; i < bs.length; i++) {
      if (bs[i].getAttribute('data-ind-clin') === clave &&
          bs[i].getAttribute('data-ind-val') === valor) { bs[i].click(); hecho = 'ok'; break }
    }
    return hecho }
    catch (e) { return 'EXC: ' + e.message } },

  ficha(id) { try {
    if (typeof showTab === 'function') showTab('refs');
    var e = document.getElementById('ref-' + id);
    if (!e) return 'NO EXISTE ref-' + id;
    if (getComputedStyle(e).display === 'none' && typeof toggleRef === 'function') toggleRef(id);
    var t = (e.textContent || '').replace(/\\s+/g, ' ').trim();
    return { largo: t.length, nFilas: e.querySelectorAll('tr').length,
             nChips: e.querySelectorAll('[data-qv-ecosmart], .qv-ecosmart').length,
             texto: t.slice(0, 2200) } }
    catch (e) { return 'EXC: ' + e.message } },

  /* El censo de entradas de Referencias y su reparto por subpestana. */
  refsCenso() { try {
    var o = { n: 0, porSub: {} };
    var S = window.REF_SUBTAB;
    if (S) for (var k in S) { o.porSub[k] = S[k].slice(); o.n += S[k].length }
    return o }
    catch (e) { return 'EXC: ' + e.message } },

  errores() { return (window.__Yerr || []).slice() },

  /* Las seis superficies, para el A/B de control. */
  salida() { try {
    if (typeof generarInforme === 'function') generarInforme();
    var o = {};
    ['estandar','narrativo','conciso'].forEach(function(est){
      try { if (typeof setEstiloInforme === 'function') setEstiloInforme(est);
            if (typeof generarInforme === 'function') generarInforme();
            o['inf_' + est] = (document.getElementById('informe_texto') || {}).value || '';
            o['suma_' + est] = (document.getElementById('en_suma') || {}).value || '' }
      catch (e) { o['inf_' + est] = 'EXC' }
    });
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch (e) {}
    return o }
    catch (e) { return { err: e.message } } },

  campos() { try {
    var o = {}, es = document.querySelectorAll('input[id], select[id], textarea[id]');
    for (var i = 0; i < es.length; i++) {
      var e = es[i];
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) continue;
      if (e.id === 'informe_texto' || e.id === 'en_suma') continue;
      o[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    }
    var k = Object.keys(o).sort(), s = k.map(function(x){ return x + '=' + o[x] }).join('|'), n = 0;
    for (var j = 0; j < s.length; j++) n = ((n << 5) - n + s.charCodeAt(j)) | 0;
    return { n: k.length, hash: n } }
    catch (e) { return { err: e.message } } },

  excelN() { try {
    var f = (typeof _labExcelRow === 'function') ? _labExcelRow({ campos: {}, fecha: '2026-10-22' }) : null;
    return f ? Object.keys(f).length : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },

  scrollH() { var d = document.documentElement;
    return { scrollW: d.scrollWidth, clientW: d.clientWidth, desborda: d.scrollWidth > d.clientWidth } }
};
`);

  /* ══ GRUPO «wilk» — EL SCORE, SU TRAMO Y LAS TRES SUPERFICIES ════════════════════════════ */
  if (corre('wilk')) {
    const r = { escenas: {} };
    const SC = { '8': [2,2,2,2], '9': [3,2,2,2], '11': [3,3,3,2], '12': [3,3,3,3] };
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      await ev(`(function(){ try { if (getComputedStyle(document.getElementById('ete-seccion-wilkins')).display === 'none') toggleEteSeccion('wilkins'); } catch(e){} return 1 })()`);
      for (const [k, q] of Object.entries(SC)) {
        await poner('wilkins_movilidad', String(q[0]));
        await poner('wilkins_engrosamiento', String(q[1]));
        await poner('wilkins_calcificacion', String(q[2]));
        await poner('wilkins_subvalvular', String(q[3]));
        await poner('cx_wilk_mov', String(q[0])); await poner('cx_wilk_eng', String(q[1]));
        await poner('cx_wilk_cal', String(q[2])); await poner('cx_wilk_sub', String(q[3]));
        r.escenas[k] = await ev(`window.__Y.wilkLee()`);
      }
      /* Score 8 con trombo CONFIRMADO en la orejuela: la hoja del PDF ya no contraindica. */
      await poner('wilkins_movilidad','2'); await poner('wilkins_engrosamiento','2');
      await poner('wilkins_calcificacion','2'); await poner('wilkins_subvalvular','2');
      await ev(`window.__P.sel('oai_trombo','si')`);
      r.conTrombo = await ev(`window.__Y.wilkLee()`);
      await ev(`window.__P.sel('oai_trombo','sospecha')`);
      r.conSospecha = await ev(`window.__Y.wilkLee()`);
      r.literales = {
        favorable: await ev(`window.__Y.literal('Favorable para valvuloplastia')`),
        nofav: await ev(`window.__Y.literal('No favorable para valvuloplastia')`),
        nopredice: await ev(`window.__Y.literal('El score no predice el resultado')`),
        candidatos: await ev(`window.__Y.literal('Candidatos a valvuloplastia')`),
        contracardio: await ev(`window.__Y.literal('contraindicación cardioversión')`),
        clampaje: await ev(`window.__Y.literal('clampaje')`),
        considerarAnti: await ev(`window.__Y.literal('considerar antiagregación')`)
      };
      r.globo = await ev(`window.__P.qtarj('wilk-score')`);
      r.refEm = await ev(`window.__Y.ficha('em')`);
    } catch (e) { r.err = e.message; }
    out.grupos.wilk = r;
    process.stderr.write('[wilk] listo\n');
  }

  /* ══ GRUPO «oai» — LA OREJUELA: VACIAMIENTO, TROMBO Y DISPOSITIVOS ═══════════════════════ */
  if (corre('oai')) {
    const r = { vel: {}, ostium: {} };
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      await ev(`(function(){ try { if (getComputedStyle(document.getElementById('ete-seccion-oai')).display === 'none') toggleEteSeccion('oai'); } catch(e){} return 1 })()`);
      for (const v2 of ['19','20','39','40','41']) {
        await tipear('oai_vel_vac', v2);
        r.vel[v2] = await ev(`window.__Y.oaiLee()`);
      }
      await borrar('oai_vel_vac', 'del');
      r.velVacio = await ev(`window.__Y.oaiLee()`);
      for (const d of ['10','11','16','31','32','34']) {
        await tipear('oai_ostium_diam', d);
        r.ostium[d] = await ev(`window.__Y.oaiLee()`);
      }
      await ev(`window.__P.sel('oai_trombo','si')`);
      r.trombo = await ev(`window.__Y.oaiLee()`);
      await ev(`window.__P.sel('oai_trombo','no')`);
      r.sinTrombo = await ev(`window.__Y.oaiLee()`);
      r.refOai = await ev(`window.__Y.ficha('oai')`);
    } catch (e) { r.err = e.message; }
    out.grupos.oai = r;
    process.stderr.write('[oai] listo\n');
  }

  /* ══ GRUPO «repar» — LOS TRES FACTORES DE LA TABLA 7, POR SUS BORDES ═════════════════════ */
  if (corre('repar')) {
    const r = { sec: {}, prim: {}, sinTipo: {} };
    const abrir = async () => {
      await ev(`(function(){ try { if (typeof showTab === 'function') showTab('ete');
        ['mediciones-mitral','teer'].forEach(function(s){ var c = document.getElementById('ete-seccion-' + s);
          if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function') toggleEteSeccion(s); });
        } catch(e){} return 1 })()`);
    };
    const escena = async (coapt, ang, area) => {
      await tipear('ete_prof_coapt', coapt);
      await tipear('ete_angulo_vp', ang);
      await tipear('ete_area_tenting', area);
      return await ev(`window.__Y.reparLee()`);
    };
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`); await abrir();
      /* SIN tipo de IM consignado: no hay veredicto. */
      r.sinTipo.base = await escena('11', '46', '2.6');
      /* IM SECUNDARIA: los tres bordes, uno por uno. */
      await ev(`window.__P.sel('teer_tipo_im','secundaria')`);
      r.sec.coapt9  = await escena('9',  '44', '2.4');
      r.sec.coapt10 = await escena('10', '44', '2.4');
      r.sec.coapt11 = await escena('11', '44', '2.4');
      r.sec.ang44   = await escena('9',  '44', '2.4');
      r.sec.ang45   = await escena('9',  '45', '2.4');
      r.sec.ang46   = await escena('9',  '46', '2.4');
      r.sec.area24  = await escena('9',  '44', '2.4');
      r.sec.area25  = await escena('9',  '44', '2.5');
      r.sec.area26  = await escena('9',  '44', '2.6');
      r.sec.tres    = await escena('12', '50', '3.0');
      /* La ALTURA de tenting NO es factor de la Tabla 7: su fila se publica y no entra. */
      await tipear('ete_altura_tenting', '14');
      r.sec.alturaAlta = await ev(`window.__Y.reparLee()`);
      await borrar('ete_altura_tenting', 'del');
      /* IM PRIMARIA: sin veredicto. */
      await ev(`window.__P.sel('teer_tipo_im','primaria')`);
      r.prim.base = await escena('12', '50', '3.0');
      /* Borrado: las cuatro filas vuelven a la raya. */
      await ev(`window.__P.sel('teer_tipo_im','secundaria')`);
      await escena('12', '50', '3.0');
      for (const id of ['ete_prof_coapt','ete_angulo_vp','ete_area_tenting']) await borrar(id, 'bs');
      r.borrado = await ev(`window.__Y.reparLee()`);
      r.literales = {
        compatible: await ev(`window.__Y.literal('compatible con plastia')`),
        evaluarTeer: await ev(`window.__Y.literal('evaluar TEER o reemplazo')`)
      };
    } catch (e) { r.err = e.message; }
    out.grupos.repar = r;
    process.stderr.write('[repar] listo\n');
  }

  /* ══ GRUPO «atero» — EL BORDE DE 5 mm ════════════════════════════════════════════════════ */
  if (corre('atero')) {
    const r = { grosor: {} };
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      await ev(`(function(){ try { if (typeof showTab === 'function') showTab('ete');
        var c = document.getElementById('ete-seccion-aorta');
        if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function') toggleEteSeccion('aorta'); } catch(e){} return 1 })()`);
      for (const g of ['4.9','5','5.1']) {
        await tipear('ao_grosor_placa', g);
        r.grosor[g] = await ev(`window.__Y.ateroLee()`);
      }
      await ev(`window.__P.sel('ao_grado_atero','3')`);
      r.g3 = await ev(`window.__Y.ateroLee()`);
      await ev(`window.__P.sel('ao_grado_atero','4')`);
      r.g4 = await ev(`window.__Y.ateroLee()`);
      await ev(`window.__P.sel('ao_grado_atero','5')`);
      r.g5 = await ev(`window.__Y.ateroLee()`);
      /* El informe narrativo con el grado 3 y con el 4. */
      await ev(`window.__P.sel('ao_grado_atero','3')`);
      r.inf3 = await ev(`window.__P.informe('narrativo')`);
      await ev(`window.__P.sel('ao_grado_atero','4')`);
      r.inf4 = await ev(`window.__P.informe('narrativo')`);
      r.refAo = await ev(`window.__Y.ficha('ao')`);
    } catch (e) { r.err = e.message; }
    out.grupos.atero = r;
    process.stderr.write('[atero] listo\n');
  }


  /* ══ GRUPO «evid» — LAS TRES SECCIONES NUEVAS DEL PANEL DE EVIDENCIA ═════════════

     Se mide el OBJETO y el HTML PINTADO: solo el objeto deja pasar un bloque que la seccion arma
     y el renderizador no pinta; solo el HTML no distingue «no aplica» de «no se evaluo».
     ⚠️ LAS RECOMENDACIONES VAN EN EL BLOQUE VISIBLE y no en `notas`, que el marco pinta dentro
        del «Ver detalle», que nace PLEGADO. Se comprueba contando los bloques pintados. */
  if (corre('evid')) {
    const r = {};
    const T_TR = 'Ecocardiograma transesof\u00e1gico \u2014 trombo en la orejuela izquierda';
    const T_RP = 'Reparabilidad de la v\u00e1lvula mitral';
    const T_AT = 'Ateroma a\u00f3rtico \u2014 prevenci\u00f3n';
    const sec = async (t) => await ev(`window.__Y.evid(${JSON.stringify(t)})`, 60000);
    const resp = async (k, v2) => await ev(`window.__Y.evidResp(${JSON.stringify(k)},${JSON.stringify(v2)})`);
    try {
      /* CONTROL NEGATIVO: con el formulario vacio las TRES devuelven null. */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      r.vacio = { tr: await sec(T_TR), rp: await sec(T_RP), at: await sec(T_AT) };

      /* — TROMBO — */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      { const rs = await ev(`window.__P.sel('oai_trombo','no')`);
        if (!rs || !rs.ok) throw new Error('SEL FALLO oai_trombo/no ' + JSON.stringify(rs)); }
      r.trNo = await sec(T_TR);
      { const rs = await ev(`window.__P.sel('oai_trombo','si')`);
        if (!rs || !rs.ok) throw new Error('SEL FALLO oai_trombo/si ' + JSON.stringify(rs)); }
      await ev(`window.__P.abrirPara('oai_vel_vac')`); await tipear('oai_vel_vac', '15');
      r.trSi = await sec(T_TR);
      r.trPint = await ev(`window.__Y.evidPintado(${JSON.stringify(T_TR)})`, 60000);
      /* ⚠️ LAS TRES RESPUESTAS EN UNA SOLA APERTURA: indicAbrir LIMPIA las respuestas antes de
         pintar, asi que tres llamadas sueltas dejan viva solo la ultima. */
      r.trTodo = await ev(`window.__Y.evidRespN([['ete.cardioversion','si'],['ete.aco3sem','no'],['ete.pmc','si']], ${JSON.stringify(T_TR)})`, 60000);
      r.trNoCv = await ev(`window.__Y.evidRespN([['ete.cardioversion','no'],['ete.pmc','no']], ${JSON.stringify(T_TR)})`, 60000);

      /* — REPARABILIDAD — */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      for (const [k, v2] of [['ete_prof_coapt','12'],['ete_angulo_vp','50'],['ete_area_tenting','2.8']]) {
        await ev(`window.__P.abrirPara(${JSON.stringify(k)})`); await tipear(k, v2);
      }
      r.rpSinMec = await sec(T_RP);
      { const rs = await ev(`window.__P.sel('teer_tipo_im','secundaria')`);
        if (!rs || !rs.ok) throw new Error('SEL FALLO teer_tipo_im ' + JSON.stringify(rs)); }
      r.rpSec = await sec(T_RP);
      r.rpPint = await ev(`window.__Y.evidPintado(${JSON.stringify(T_RP)})`, 60000);
      { const rs = await ev(`window.__P.sel('teer_tipo_im','primaria')`);
        if (!rs || !rs.ok) throw new Error('SEL FALLO teer_tipo_im/prim ' + JSON.stringify(rs)); }
      r.rpPrim = await sec(T_RP);

      /* — ATEROMA — */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      { const rs = await ev(`window.__P.sel('ao_grado_atero','3')`);
        if (!rs || !rs.ok) throw new Error('SEL FALLO ao_grado_atero ' + JSON.stringify(rs)); }
      await ev(`window.__P.abrirPara('ao_grosor_placa')`); await tipear('ao_grosor_placa', '4.5');
      r.at3 = await sec(T_AT);
      { const rs = await ev(`window.__P.sel('ao_grado_atero','4')`);
        if (!rs || !rs.ok) throw new Error('SEL FALLO ao_grado_atero/4 ' + JSON.stringify(rs)); }
      r.at4 = await sec(T_AT);
      r.atPint = await ev(`window.__Y.evidPintado(${JSON.stringify(T_AT)})`, 60000);
      r.atTodo = await ev(`window.__Y.evidRespN([['atero.embolico','si']], ${JSON.stringify(T_AT)})`, 60000);
      r.atNoSev = await ev(`window.__Y.evidRespN([['atero.severa','no'],['atero.embolico','no']], ${JSON.stringify(T_AT)})`, 60000);

      /* QUE LAS RESPUESTAS NO VIAJAN CON EL ESTUDIO. */
      r.campos = await ev(`window.__Y.campos()`);
      r.clavesClin = await ev(`(function(){ try {
        var o = []; var es = document.querySelectorAll('input[id],select[id],textarea[id]');
        for (var i=0;i<es.length;i++) if (es[i].id.indexOf('ete.')===0 || es[i].id.indexOf('atero.')===0) o.push(es[i].id);
        return o } catch(e){ return ['EXC'] } })()`);
      r.titulos = await ev(`(function(){ try {
        var L = window.IND_SECS || IND_SECS;
        var t = L.map(function(x){ return x.tit }), mal = [];
        for (var i=0;i<t.length;i++) for (var j=0;j<t.length;j++)
          if (i!==j && t[j].indexOf(t[i])===0) mal.push(t[i] + ' ES PREFIJO DE ' + t[j]);
        return { n: t.length, prefijos: mal } } catch(e){ return 'EXC' } })()`);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.evid = r;
    process.stderr.write('[evid] listo\n');
  }



  /* ══ GRUPO «sup» — LAS SUPERFICIES FIRMADAS, UNA POR UNA ════════════════════

     Las tres escenas que este commit SI mueve. El grupo «ctrl» prueba que nada mas se movio;
     este prueba QUE se movio, en el informe en los tres estilos, el EN SUMA en los tres, el
     Excel clave por clave con su conteo de columnas, los campos del estudio y el PDF GENERADO
     DE VERDAD en sus seis plantillas.
     ⚠️ El PDF se genera envolviendo el CONSTRUCTOR de jsPDF: en jsPDF 2.x `text` es una
        propiedad PROPIA de cada instancia, asi que parchear el prototipo no captura nada y no
        da ningun error — un «0 textos» que se lee igual que «identico». */
  if (corre('sup')) {
    const r = {};
    const medir = async () => ({
      salida: await ev(`window.__Y.salida()`, 90000),
      campos: await ev(`window.__Y.campos()`),
      excelN: await ev(`window.__Y.excelN()`),
      excel:  await ev(`window.__P.excelDOM()`, 60000),
      lab:    await ev(`window.__P.lab({})`)
    });
    const pdfs = async () => {
      const o = {};
      for (const pl of ['clasico', 'academico', 'moderno', 'minimalista', 'compacto', 'elegante'])
        o[pl] = await ev(`window.__P.pdf(${JSON.stringify(pl)})`, 90000);
      return o;
    };
    try {
      /* ESCENA 1 — trombo en la orejuela confirmado: el informe PIERDE la frase de conducta. */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      { const rs = await ev(`window.__P.sel('oai_trombo','si')`);
        if (!rs || !rs.ok) throw new Error('SEL FALLO oai_trombo ' + JSON.stringify(rs)); }
      await ev(`window.__P.abrirPara('oai_ostium_diam')`);
      await tipear('oai_ostium_diam', '20');
      await ev(`window.__P.calentar()`);
      r.trombo = await medir();
      r.tromboPdf = await pdfs();

      /* ESCENA 2 — el score de Wilkins cargado: el informe publica el score y nada mas. */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      /* ⚠️ Los ids son `wilkins_*` y NO `wilk_*`: con el nombre equivocado `sel` devuelve
         {err:'NO EXISTE'} SIN lanzar, la escena mide un formulario VACIO y el A/B informa
         «cero diferencias» — un denominador vacio con pinta de medicion buena. Se aborta. */
      for (const [k, v2] of [['wilkins_movilidad','2'],['wilkins_engrosamiento','2'],
                             ['wilkins_calcificacion','2'],['wilkins_subvalvular','2']]) {
        const rs = await ev(`window.__P.sel(${JSON.stringify(k)},${JSON.stringify(v2)})`);
        if (!rs || !rs.ok) throw new Error('SEL FALLO ' + k + ' ' + JSON.stringify(rs));
      }
      await ev(`window.__P.calentar()`);
      r.wilk = await medir();
      r.wilkPdf = await pdfs();

      /* ESCENA 3 — ateroma grado 3: cambia el rotulo del rango en el informe. */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      { const rs = await ev(`window.__P.sel('ao_grado_atero','3')`);
        if (!rs || !rs.ok) throw new Error('SEL FALLO ao_grado_atero ' + JSON.stringify(rs)); }
      await ev(`window.__P.calentar()`);
      r.atero3 = await medir();
      r.atero3Pdf = await pdfs();

      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.sup = r;
    process.stderr.write('[sup] listo\n');
  }


  /* ══ GRUPO «ctrl» — LOS CONTROLES ════════════════════════════════════════════════════════ */
  if (corre('ctrl')) {
    const AJENO = { nombre: 'CTRL', edad: '58', peso: '78', talla: '172',
                    onda_e: '70', onda_a: '60', tde: '190', e_sep: '7', e_lat: '9',
                    ai_vol: '52', ddfvi: '50', siv: '10', ppvi: '10',
                    vmax_ao: '2.4', im_vc: '4', vci_diam: '18' };
    const r = {};
    const medir = async () => ({
      salida: await ev(`window.__Y.salida()`, 90000),
      campos: await ev(`window.__Y.campos()`),
      excelN: await ev(`window.__Y.excelN()`),
      excel: await ev(`window.__P.excelDOM()`, 60000),
      refsN: await ev(`window.__P.refsN()`),
      lab: await ev(`window.__P.lab({})`),
      almacen: await ev(`window.__P.almacen()`),
      pills: await ev(`window.__P.pills()`)
    });
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.calentar()`);
      r.vacio = await medir();
      r.pdfVacio = {};
      for (const pl of ['clasico', 'academico', 'moderno', 'minimalista', 'compacto', 'elegante'])
        r.pdfVacio[pl] = await ev(`window.__P.pdf(${JSON.stringify(pl)})`, 90000);
      await ev(`window.__P.nuevo()`);
      for (const [k, v2] of Object.entries(AJENO)) {
        try { await ev(`window.__P.abrirPara(${JSON.stringify(k)})`); await tipear(k, v2); }
        catch (e) { try { await ev(`window.__P.sel(${JSON.stringify(k)},${JSON.stringify(v2)})`); } catch (e2) {} }
      }
      await ev(`window.__P.calentar()`);
      r.ajeno = await medir();
      r.pdfAjeno = {};
      for (const pl of ['clasico', 'academico', 'moderno', 'minimalista', 'compacto', 'elegante'])
        r.pdfAjeno[pl] = await ev(`window.__P.pdf(${JSON.stringify(pl)})`, 90000);
      r.ppt = await ev(`window.__P.labPPT(null)`, 90000);
      r.audit = await ev(`window.__P.labAudit(null)`, 90000);
      r.errores = await ev(`window.__Y.errores()`);
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
