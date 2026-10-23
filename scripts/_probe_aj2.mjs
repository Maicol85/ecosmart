#!/usr/bin/env node
/**
 * _probe_aj2.mjs - sonda A/B de SOLO LECTURA para la tanda AJ2 (correcciones de la
 * verificacion), 2026-10-23.
 *
 * Reusa la infraestructura y los helpers `window.__P` / `window.__Y` de scripts/_probe_e.mjs
 * -teclas y clics reales, cierre del arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso
 * legal despejado con su denominador, md5 al principio y al final-. NO muta index.html.
 *
 *   node scripts/_probe_aj2.mjs --file /tmp/index.AJ2HEAD.html --solo htp > /tmp/aj2.HEAD.json
 *   node scripts/_probe_aj2.mjs                               --solo htp > /tmp/aj2.NEW.json
 *
 * Grupos (uno por item del prompt, mas los controles):
 *   htp     - AJ2-1 «sin datos» en vez de «no medible», y AJ2-2 los signos de la Evidencia.
 *   repar   - AJ2-3 reparabilidad mitral con «Tipo de IM» vacio.
 *   et      - AJ2-4 estenosis tricuspidea sin datos.
 *   coao    - AJ2-5 coartacion sin gradiente.
 *   aorta   - AJ2-6 inventario de grados de dilatacion aortica.
 *   atm     - AJ2-7a/b ateroma: juicios y el grosor que completa el grado.
 *   hfpeff  - AJ2-8 conclusion, parentesis, PDF y ficha.
 *   pulmo   - AJ2-9 el informe del eco pulmonar.
 *   tep     - AJ2-10 inventario recuento -> adjetivo, titulo y maqueta.
 *   tildes  - AJ2-11 censo de palabras sin tilde en los textos visibles.
 *   suma    - AJ2-12 el EN SUMA con y sin hallazgos.
 *   busca   - AJ2-13 los buscadores sin mayusculas, tildes ni guiones.
 *   oai     - AJ2-14 orejuela: titulo y «favorable».
 *   diast   - AJ2-15 «Completar e-prima septal y/o lateral para clasificar».
 *   maq     - dos anchos por dos temas, scroll horizontal y recortes.
 *   ctrl    - los controles: informe, EN SUMA, Excel en 440, PDF, PPT, auditoria, Laboratorio.
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
  /* ── El INVENTARIO de signos de HTP, leido del DOM RENDERIZADO ──────────────────────────
     Devuelve una fila por signo con su criterio, su estado y lo que la casilla dice. El estado
     se deriva de lo que el medico VE: una casilla deshabilitada es automatica, una habilitada
     es manual. Los signos derivados -VD/VI, TAPSE/PAPs, TAP, VCI, AD- no tienen casilla: su
     estado sale de si su insumo esta cargado. */
  htpInv() {
    var ids = ['htp2022_a3','htp2022_b1muesca','htp2022_b2','htp2022_b3','htp2022_b3ao','htp2022_c_col20'];
    var o = { casillas: {}, tabla: null, cat: {} };
    ids.forEach(function(id){
      var e = document.getElementById(id);
      o.casillas[id] = e ? { chk: !!e.checked, dis: !!e.disabled,
                             auto: e.dataset ? (e.dataset.auto || null) : null } : 'NO EXISTE';
    });
    ['htp2022-catA','htp2022-catB','htp2022-catC','htp2022-prob','htp2022-vrt-interp'].forEach(function(id){
      var e = document.getElementById(id); o.cat[id] = e ? (e.textContent || '').trim() : 'NO EXISTE';
    });
    var t = document.getElementById('htp2022-tabla');
    if (t) {
      var fs = [];
      var trs = t.querySelectorAll('tr[data-htp-signo]');
      for (var i = 0; i < trs.length; i++) {
        var tr = trs[i], tds = tr.querySelectorAll('td');
        fs.push({ clave: tr.getAttribute('data-htp-signo'),
                  cat: tr.getAttribute('data-htp-cat'),
                  estado: tr.getAttribute('data-htp-estado'),
                  signo: tds[0] ? (tds[0].textContent || '').trim() : null,
                  criterio: tds[1] ? (tds[1].textContent || '').trim() : null,
                  txtEstado: tds[2] ? (tds[2].textContent || '').trim() : null,
                  cols: tds.length });
      }
      var ths = t.querySelectorAll('thead th, tr.htp-tab-hd th');
      var enc = []; for (var j = 0; j < ths.length; j++) enc.push((ths[j].textContent || '').trim());
      o.tabla = { filas: fs, n: fs.length, encabezados: enc,
                  grupos: Array.prototype.map.call(t.querySelectorAll('tr[data-htp-grupo]'),
                    function(x){ return (x.textContent || '').trim() }) };
    }
    return o },

  /* El nucleo, tal como lo publica la pantalla. */
  htpCore() { try { if (typeof calcHTP2022 === 'function') calcHTP2022();
    var h = window._htp2022; if (!h) return 'SIN _htp2022';
    return { vrtSel: h.vrtSel === undefined ? 'SIN vrtSel' : h.vrtSel, vrtCat: h.vrtCat,
             vrtTxt: h.vrtTxt, catA: h.catA, catB: h.catB, catC: h.catC, nCat: h.nCat,
             prob: h.prob, vrtDiscrepa: h.vrtDiscrepa, vit: h.vit } }
    catch (e) { return 'EXC: ' + e.message } },

  /* La hoja del PDF de HTP, cruda. */
  htpPdf() { try { return typeof amiloTextoHTP === 'function' ? amiloTextoHTP() : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },
  hfPdf()  { try { return typeof amiloTextoHFAPEFF === 'function' ? amiloTextoHFAPEFF() : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },

  /* Integra un modulo al informe por su BOTON, que es el gesto del medico. */
  integrar(k) { try { var b = document.querySelector('[data-am-k="' + k + '"]');
    if (!b) return 'NO EXISTE boton ' + k;
    if (typeof amiloIntegrado === 'function' && amiloIntegrado(k)) return 'ya';
    b.click(); return (typeof amiloIntegrado === 'function' && amiloIntegrado(k)) ? 'ok' : 'no quedo' }
    catch (e) { return 'EXC: ' + e.message } },

  /* El informe generado, filtrado por las lineas que nombran HTP. Devuelve el informe ENTERO
     tambien, para que el lector vea el denominador: una lista vacia sobre un informe vacio no
     dice lo mismo que una lista vacia sobre un informe de veinte oraciones. */
  infHTP() { try { if (typeof generarInforme === 'function') generarInforme();
    var t = (document.getElementById('informe_texto') || {}).value || '';
    var s = (document.getElementById('en_suma') || {}).value || '';
    var li = t.split(String.fromCharCode(10)).filter(function(x){ return x.trim() });
    return { nLineas: li.length, largo: t.length,
             htp: li.filter(function(x){ return x.indexOf('hipertensi') >= 0 || x.indexOf('HTP') >= 0 }),
             suma: s.split(String.fromCharCode(10)).filter(function(x){ return x.indexOf('HTP') >= 0 }),
             sumaLargo: s.length } }
    catch (e) { return 'EXC: ' + e.message } },

  /* La conclusion de HF-PEFF y el puntaje, por el MISMO dueno que publican las tres superficies. */
  hfConcl() { try {
    if (typeof hfapeffScore !== 'function') return 'SIN FN';
    var r = hfapeffScore(false);
    return { total: r.total, max: r.max, completo: r.completo,
             pts: { func: r.func.pts, morf: r.morf.pts, hum: r.hum.pts },
             hay: { func: r.func.hayDatos, morf: r.morf.hayDatos, hum: r.hum.hayDatos },
             concl: (typeof hfapeffConclusion === 'function') ? hfapeffConclusion(r) : 'SIN FN',
             gate: r.gate ? r.gate.motivo : null } }
    catch (e) { return 'EXC: ' + e.message } },

  /* El EN SUMA del informe, filtrado por HFA-PEFF. */
  infHF() { try { if (typeof generarInforme === 'function') generarInforme();
    var s = (document.getElementById('en_suma') || {}).value || '';
    return { suma: s.split(String.fromCharCode(10)).filter(function(x){ return x.indexOf('HFA-PEFF') >= 0 }),
             sumaLargo: s.length } }
    catch (e) { return 'EXC: ' + e.message } },

  /* La PANTALLA de HF-PEFF: lo que esta tanda NO puede mover. Se mide su estructura -numero de
     columnas, de criterios y de medidas- y el hash del HTML entero. */
  hfPant() { try { if (typeof hfapeffRender === 'function') hfapeffRender();
    var h = document.getElementById('hfapeff-detalle');
    if (!h) return 'NO EXISTE hfapeff-detalle';
    var s = h.innerHTML || '', n = 0;
    for (var i = 0; i < s.length; i++) { n = ((n << 5) - n + s.charCodeAt(i)) | 0 }
    return { hash: n, largo: s.length,
             cols: h.querySelectorAll('.hfp-col').length,
             crit: h.querySelectorAll('.hfp-cr').length,
             med: h.querySelectorAll('.hfp-med').length,
             pie: (function(){ var p = h.querySelectorAll('.hfp-sub');
               return p.length ? (p[p.length - 1].textContent || '').trim() : null })(),
             texto: (h.textContent || '').trim().slice(0, 400) } }
    catch (e) { return 'EXC: ' + e.message } },

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

  /* El texto de una ficha de Referencias, abierta por su gesto. */
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

  /* ══ HELPERS PROPIOS DE LA TANDA AJ2 ══════════════════════════════════════════════════════
     Tercer template, para no tocar los dos bloques reusados: un cambio de esta tanda no puede
     romper la infraestructura que comparten once sondas. */
  await evCrudo(`
window.__Z = {
  /* Normaliza como lo hace el lector del panel: minusculas y sin diacriticos. Asi un titulo
     se puede buscar por prefijo SIN tilde, que es la trampa que el SEED de TC-322 pago. */
  _n(s) { return String(s == null ? '' : s).toLowerCase()
            .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '') },

  /* ── EL PANEL DE EVIDENCIA, LEIDO DEL OBJETO Y DEL DOM PINTADO ──────────────────────────
     Las dos lecturas, porque sola la del objeto deja pasar un bloque que la seccion arma y el
     renderizador no pinta, y sola la del DOM no distingue «no aplica» de «no se evaluo». */
  evidSec(prefijo) {
    try {
      if (typeof IND_SECS === 'undefined') return 'SIN IND_SECS';
      var p = this._n(prefijo), yo = this;
      var hall = [];
      /* ⚠️ IND_SECS ES UNA LISTA DE {tit, fn} Y NO DE FUNCIONES, y el TITULO vive en la
         entrada y no en el objeto que la seccion devuelve: llamar a f() tira y leer r.seccion
         da undefined, asi que el filtro no matchea NUNCA y el grupo informa «sin seccion»
         sobre un panel que la pinta.
         ⚠️ Y SIN ACENTOS GRAVES: este comentario vive dentro de un evCrudo suelto, que
         scripts/check_backticks.py NO alcanza -su cobertura es el cuerpo de un caso y el de la
         sonda inyectada-. El que lo caza es node --check, apuntando a la APERTURA del
         template, decenas de lineas antes. */
      IND_SECS.forEach(function (f) {
        if (!f || typeof f.fn !== 'function') return;
        if (yo._n(f.tit).indexOf(p) !== 0) return;
        var r = null;
        try { r = f.fn(); } catch (e) { r = { __exc: e.message } }
        if (!r) { hall.push({ seccion: f.tit, nula: true }); return; }
        hall.push({
          seccion: f.tit,
          filas: (r.filas || []).map(function (x) {
            return { lbl: x && x.lbl, val: x && x.val, est: x && x.est, nota: x && x.nota } }),
          bloques: (r.bloques || []).map(function (b) { return b && b.txt ? b.txt : String(b) }),
          notas: (r.notas || []).map(function (b) { return b && b.txt ? b.txt : String(b) }),
          guia: r.guia || null, exc: r.__exc || null });
      });
      return hall;
    } catch (e) { return 'EXC: ' + e.message }
  },

  /* ── LA TABLA DE SIGNOS DE HTP, LEIDA DEL DOM RENDERIZADO ────────────────────────────────
     Una fila por signo, con el rotulo que el medico VE, su casilla y el estado publicado. Es
     la lista contra la que se compara lo que la Evidencia dice: si difieren, el panel esta
     nombrando un signo que la pantalla no marco. */
  htpTabla() {
    try {
      var t = document.getElementById('htp2022-tabla');
      if (!t) return 'SIN TABLA';
      var o = [];
      Array.prototype.forEach.call(t.querySelectorAll('tr[data-htp-signo]'), function (tr) {
        var k = tr.getAttribute('data-htp-signo');
        var cb = tr.querySelector('input[type=checkbox]');
        var sp = tr.querySelector('td:first-child span');
        o.push({ k: k, cat: tr.getAttribute('data-htp-cat'),
                 lbl: sp ? (sp.textContent || '').trim() : null,
                 id: cb ? (cb.id || null) : null,
                 auto: cb ? (cb.getAttribute('data-htp-auto') || null) : null,
                 chk: cb ? !!cb.checked : null, dis: cb ? !!cb.disabled : null,
                 crit: (tr.children[1] ? (tr.children[1].textContent || '').trim() : null),
                 est: (tr.children[2] ? (tr.children[2].textContent || '').trim() : null),
                 estAttr: tr.getAttribute('data-htp-estado') });
      });
      return o;
    } catch (e) { return 'EXC: ' + e.message }
  },

  /* Los signos PRESENTES segun el dueno puro, para cruzarlos con lo que la Evidencia lista. */
  htpPresentes() {
    try {
      if (typeof _htp2022Signos !== 'function') return 'SIN FN';
      var L = _htp2022Signos({ num: _hfN, txt: sv, chk: _hfChk });
      return L.filter(function (g) { return g.presente })
              .map(function (g) { return g.k + '|' + g.cat + '|' + g.lbl });
    } catch (e) { return 'EXC: ' + e.message }
  },

  /* El objeto que el informe consume, mas el texto de la pantalla y el del PDF. */
  htpTodo() {
    var o = {};
    try { if (typeof calcHTP2022 === 'function') calcHTP2022() } catch (e) { o.exc = e.message }
    var h = window._htp2022 || null;
    o.core = h ? { vrtSel: h.vrtSel, vrtCat: h.vrtCat, vrtTxt: h.vrtTxt, nCat: h.nCat,
                   prob: h.prob, catA: h.catA, catB: h.catB, catC: h.catC,
                   vit: h.vit, vrtDiscrepa: h.vrtDiscrepa } : null;
    o.pantalla = window.__P.txt('htp2022-vrt-interp');
    try { o.pdf = (typeof amiloTextoHTP === 'function') ? amiloTextoHTP() : 'SIN FN' }
    catch (e) { o.pdf = 'EXC: ' + e.message }
    o.tabla = this.htpTabla();
    o.presentes = this.htpPresentes();
    o.evid = this.evidSec('hipertension pulmonar');
    return o;
  },

  /* ── EL INFORME Y EL EN SUMA, SOLO LAS LINEAS QUE NOMBRAN UNA ZONA ───────────────────────
     El filtro va por una lista de fragmentos y se informa el denominador: una sonda que
     filtre de mas informa «la oracion desaparecio» sobre un informe perfecto, que es la
     trampa que TC-488 ya pago. */
  lineas(frags) {
    try {
      if (typeof generarInforme === 'function') generarInforme();
      var inf = window.__P.val('informe_texto') || '';
      var suma = window.__P.val('en_suma') || '';
      var yo = this;
      var part = function (t) { return String(t).split(/\\n+/).filter(function (x) { return x.trim() }) };
      var casa = function (arr) {
        return arr.filter(function (l) {
          var n = yo._n(l);
          return (frags || []).some(function (f) { return n.indexOf(yo._n(f)) >= 0 }) }) };
      var li = part(inf), ls = part(suma);
      return { nInf: li.length, nSuma: ls.length,
               inf: casa(li), suma: casa(ls),
               infTodo: inf, sumaTodo: suma };
    } catch (e) { return { err: 'EXC: ' + e.message } }
  }
};
`);

  /* ⚠️ UN CHECKBOX NO SE ACTIVA CON ENTER: LA TECLA ES ESPACIO, y el estado de partida se
     EXIGE. Sin eso, un segundo toque sobre una casilla ya tildada la DESTILDA y la escena mide
     lo contrario de lo que dice medir — la leccion que este repo ya tiene escrita dos veces.
     `foco()` aborta si la casilla esta `disabled`, que es lo correcto: una casilla que el
     calculo gobierna no es un gesto del medico. */
  async function chk(id, valor) {
    const est = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      return e ? { chk: !!e.checked, dis: !!e.disabled } : null })()`);
    if (!est) throw new Error('NO EXISTE la casilla ' + id);
    if (est.chk === !!valor) return est.chk;
    if (est.dis) throw new Error('CASILLA BLOQUEADA, el calculo la gobierna: ' + id);
    /* ⚠️ `foco()` DE LA INFRAESTRUCTURA NO SIRVE PARA UN CHECKBOX: su guarda es
       `e.setSelectionRange ? ... : 0`, y ese metodo EXISTE en el prototipo de HTMLInputElement
       -lanza InvalidStateError solo para `type=checkbox`-, asi que el ternario no protege y la
       escena muere antes de medir nada. El foco va sin seleccion. */
    let g = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!g || g.err || !g.ok) {
      const a = await ev(`window.__P.abrirPara(${JSON.stringify(id)})`);
      if (!a || !a.ok) throw new Error('SIN GEOMETRIA la casilla ' + id + ' ' + JSON.stringify(a));
    }
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      e.scrollIntoView({ block: 'center' }); e.focus(); return 1 })()`);
    const f = await ev(`document.activeElement ? document.activeElement.id : null`);
    if (f !== id) throw new Error('EL FOCO NO LLEGO a la casilla ' + id + ', esta en ' + f);
    await tecla('Space');
    const fin = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      return !!e.checked })()`);
    if (fin !== !!valor) throw new Error('EL CLIC NO QUEDO en ' + id + ': ' + fin);
    return fin;
  }

  /* ══ GRUPO «htp» — AJ2-1 Y AJ2-2 ══════════════════════════════════════════════════════════
     AJ2-1: con el selector en «Automatico» y sin la IT cargada, el texto tiene que decir «sin
     datos» y no «no medible», en las cinco superficies; y el informe NO debe nombrar la VRT.
     ⚠️ LA PANTALLA Y EL PDF LEEN EL MISMO NODO (`_amTxt('htp2022-vrt-interp')` en
     `amiloTextoHTP`), asi que son un solo dueno y no pueden discrepar — se miden los dos igual,
     que es lo que lo demuestra.
     AJ2-2: se marcan la muesca y la velocidad de la IP y se compara, signo por signo, lo que la
     TABLA de la pantalla tiene tildado contra lo que la Evidencia LISTA en su nota. */
  if (corre('htp')) {
    const r = { escenas: {} };
    const montar = async (o) => {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__Y.integrar('htp')`);
      await ev(`window.__P.abrirPara('htp2022_vrt')`);
      if (o.vit) await poner('vmax_it', o.vit);
      if (o.sel) await poner('htp2022_vrt', o.sel);
      for (const c of (o.chks || [])) await chk(c, true);
      await ev(`(function(){ if (typeof calcHTP2022 === 'function') calcHTP2022(); return 1 })()`);
      return await ev(`window.__Z.htpTodo()`, 40000);
    };
    try {
      /* E1 — el defecto de AJ2-1: automatico SIN IT y con dos categorias de signos. */
      r.escenas.autoSinIT_2signos = await montar({ sel: 'auto', chks: ['htp2022_a3', 'htp2022_b1muesca'] });
      r.escenas.autoSinIT_2signos.lineas = await ev(`window.__Z.lineas(['hipertension pulmonar','HTP'])`, 40000);
      /* E2 — el control: «No medible» ELEGIDA a proposito, con los mismos dos signos. */
      r.escenas.elegidaNoMedible_2signos = await montar({ sel: 'nomedible', chks: ['htp2022_a3', 'htp2022_b1muesca'] });
      r.escenas.elegidaNoMedible_2signos.lineas = await ev(`window.__Z.lineas(['hipertension pulmonar','HTP'])`, 40000);
      /* E3 — control: VRT numerica, que no se toca. */
      r.escenas.vrtNumerica = await montar({ sel: 'auto', vit: '3.0', chks: ['htp2022_a3', 'htp2022_b1muesca'] });
      r.escenas.vrtNumerica.lineas = await ev(`window.__Z.lineas(['hipertension pulmonar','HTP'])`, 40000);
      /* E4 — control: automatico sin IT y SIN ningun signo (el informe calla, y sigue callando). */
      r.escenas.autoSinIT_0signos = await montar({ sel: 'auto', chks: [] });
      r.escenas.autoSinIT_0signos.lineas = await ev(`window.__Z.lineas(['hipertension pulmonar','HTP'])`, 40000);
      /* E5 — AJ2-2: la muesca y la velocidad de la IP diastolica temprana, sin diametro de AP. */
      r.escenas.muescaMasVelIP = await montar({ sel: 'auto', chks: ['htp2022_b1muesca', 'htp2022_b2'] });
      /* E6 — el control del cruce: la muesca y el DIAMETRO, para que un reporte que confunda
         b3 con b4 se vea por los dos lados. */
      r.escenas.muescaMasDiamAP = await montar({ sel: 'auto', chks: ['htp2022_b1muesca', 'htp2022_b3'] });
      /* E7 — LA ESCENA QUE SI PRODUCE EL TEXTO DEL REPORTE: con el diametro de la AP CARGADO,
         `htpApSync` tilda y BLOQUEA su casilla, asi que el medico no la marco y la Evidencia la
         lista igual —correctamente, porque esta presente—. Es la unica forma de que el panel
         nombre «Diametro de la arteria pulmonar» sin que nadie la haya tocado. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__Y.integrar('htp')`);
      await ev(`window.__P.abrirPara('htp2022_vrt')`);
      await poner('ip_ap_diam', '28');
      await chk('htp2022_b1muesca', true);
      await chk('htp2022_b2', true);
      await ev(`(function(){ if (typeof calcHTP2022 === 'function') calcHTP2022(); return 1 })()`);
      r.escenas.conDiamAPcargado = await ev(`window.__Z.htpTodo()`, 40000);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; r.stack = String(e.stack || '').slice(0, 400); }
    out.grupos.htp = r;
    process.stderr.write('[htp] listo\n');
  }

  /* ══ GRUPO «repar» — AJ2-3: EL TIPO DE IM VACIO ES UN TERCER ESTADO ══════════════════════
     `imMecanismoIM()` devuelve 'secundaria', 'primaria' o VACIO, y el vacio -que es como nace el
     selector, o sea el estado MAS frecuente- caia en el texto de «no es secundaria», que afirma
     que hay un mecanismo consignado. Se miden los TRES, con el MISMO juego de mediciones. */
  if (corre('repar')) {
    const r = { escenas: {} };
    const montar = async (tipo) => {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.abrirPara('ete_prof_coapt')`);
      await poner('ete_prof_coapt', '12');
      await poner('ete_area_tenting', '2.8');
      await poner('ete_angulo_vp', '50');
      if (tipo !== null) await poner('teer_tipo_im', tipo);
      await ev(`(function(){ if (typeof calcETE === 'function') calcETE(); return 1 })()`);
      return { repar: await ev(`window.__P.txt('ete-reparabilidad')`),
               fuente: (await ev(`window.__P.txt('ete-repar-fuente')`) || '').slice(0, 60),
               mec: await ev(`(function(){ return (typeof imMecanismoIM === 'function') ? (imMecanismoIM() || '') : 'SIN FN' })()`),
               coapt: await ev(`window.__P.txt('ete-coapt-interp')`),
               areat: await ev(`window.__P.txt('ete-areatent-interp')`) };
    };
    try {
      r.escenas.vacio      = await montar('');
      r.escenas.secundaria = await montar('secundaria');
      r.escenas.primaria   = await montar('primaria');
      /* Control: sin ninguna medicion cargada la frase es la raya, en los tres tipos. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirPara('teer_tipo_im')`);
      await poner('teer_tipo_im', '');
      await ev(`(function(){ if (typeof calcETE === 'function') calcETE(); return 1 })()`);
      r.escenas.sinMediciones = { repar: await ev(`window.__P.txt('ete-reparabilidad')`) };
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.repar = r;
    process.stderr.write('[repar] listo\n');
  }

  /* ══ GRUPO «diast» — AJ2-15: LA FRASE QUE PEDIA COMPLETAR UN CAMPO ════════════════════════
     Con la onda E cargada y los dos anillos vacios, la ASE 2025 cae en su rama `incompleto` y
     esa frase baja al informe FIRMADO por `window._diastResult.texto`. Se mide el informe
     ENTERO, no el objeto: es la unica forma de ver que la frase llega al papel. */
  if (corre('diast')) {
    const r = { escenas: {} };
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.abrirPara('onda_e')`);
      await poner('diast_algoritmo', 'ase2025');
      await poner('onda_e', '90');
      await ev(`(function(){ if (typeof calcDiastol === 'function') calcDiastol(); return 1 })()`);
      r.escenas.sinAnillos = {
        badge: await ev(`window.__P.txt('dd-interp')`),
        objeto: await ev(`(function(){ var d = window._diastResult || {};
          return { texto: d.texto || null, suma: d.textoSuma || null, alg: d.algoritmo || null } })()`),
        lineas: await ev(`window.__Z.lineas(['diastolica','clasificar','clasificable','presion de llenado','completar'])`, 40000) };
      /* CONTROL: con los dos anillos cargados el algoritmo clasifica y la frase no aparece. */
      await poner('e_sep', '5'); await poner('e_lat', '6');
      await ev(`(function(){ if (typeof calcDiastol === 'function') calcDiastol(); return 1 })()`);
      r.escenas.conAnillos = {
        badge: await ev(`window.__P.txt('dd-interp')`),
        objeto: await ev(`(function(){ var d = window._diastResult || {};
          return { texto: d.texto || null, suma: d.textoSuma || null } })()`),
        lineas: await ev(`window.__Z.lineas(['diastolica','clasificar','clasificable','presion de llenado','completar'])`, 40000) };
      /* CONTROL NEGATIVO: la frase hermana de la ASE 2016, que esta tanda NO toca. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirPara('onda_e')`);
      await poner('diast_algoritmo', 'ase2016');
      await ev(`(function(){ if (typeof calcDiastol === 'function') calcDiastol(); return 1 })()`);
      r.escenas.ase2016SinDatos = {
        badge: await ev(`window.__P.txt('dd-interp')`),
        objeto: await ev(`(function(){ var d = window._diastResult || {};
          return { texto: d.texto || null } })()`) };
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.diast = r;
    process.stderr.write('[diast] listo\n');
  }

  /* ══ GRUPO «coao» — AJ2-5: LA COARTACION SIN GRADIENTE ═══════════════════════════════════
     El parrafo del informe abre con «Coartación de aorta de localización X» y despues pega
     `c.txt`, que para la clave sin gradiente VOLVIA A EMPEZAR con «Coartación post-cirugía»: el
     sustantivo dos veces y una indicacion («completar con Doppler… e imagen»). Se miden las
     CUATRO superficies -pantalla, informe, EN SUMA y la hoja del PDF- y el control con gradiente.
     ⚠️ LA CASILLA DE INTEGRACION ESTA EN `display:none` y el control real es el BOTON
     `[data-ete-chk]`: tildar la casilla por codigo no pasa por `eteInclToggle` y el parrafo no
     se emite. */
  if (corre('coao')) {
    const r = { escenas: {} };
    const integrarCoa = async () => await ev(`(function(){
      var b = document.querySelector('[data-ete-chk="coart_incluir_chk"]');
      if (!b) return 'SIN BOTON';
      var c = document.getElementById('coart_incluir_chk');
      if (c && !c.checked) b.click();
      return c ? !!c.checked : null })()`);
    const montar = async (o) => {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.abrirPara('coa_situacion')`);
      if (o.loc) await poner('coa_loc', o.loc);
      if (o.sit) await poner('coa_situacion', o.sit);
      if (o.gmedio) await poner('coa_gmedio', o.gmedio);
      if (o.istmo) await poner('coa_istmo', o.istmo);
      r.integrada = await integrarCoa();
      await ev(`(function(){ if (typeof coaSync === 'function') coaSync(); return 1 })()`);
      return {
        pantalla: await ev(`window.__P.txt('coa-concl')`),
        clave: await ev(`(function(){ var c = (typeof coaConclusion === 'function') ? coaConclusion() : null;
          return c ? { clave: c.clave, txt: c.txt, apos: (c.apos === undefined ? null : c.apos) } : null })()`),
        hoja: await ev(`(function(){ try { return (typeof amiloTextoCC === 'function') ? 'hay' : (typeof ccHojaBuild === 'function' ? ccHojaBuild() : 'SIN FN') } catch (e) { return 'EXC: ' + e.message } })()`),
        lineas: await ev(`window.__Z.lineas(['coartacion','coarta','CoAo'])`, 40000) };
    };
    try {
      r.escenas.sinGradiente       = await montar({ loc: 'preductal', sit: 'post_cirugia' });
      r.escenas.sinGradSinSit      = await montar({ loc: 'preductal' });
      r.escenas.sinGradSinLoc      = await montar({ sit: 'post_cirugia' });
      /* CONTROL: con gradiente medio la logica queda LITERAL. */
      r.escenas.conGradiente       = await montar({ loc: 'preductal', sit: 'post_cirugia', gmedio: '25' });
      r.escenas.conGradLimitrofe   = await montar({ loc: 'preductal', sit: 'nativa', gmedio: '20' });
      r.escenas.conIstmoSinGrad    = await montar({ loc: 'preductal', sit: 'post_cirugia', istmo: '8' });
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.coao = r;
    process.stderr.write('[coao] listo\n');
  }

  /* ══ GRUPO «busca» — AJ2-13: MAYUSCULAS, TILDES Y GUIONES ════════════════════════════════
     Se mide el buscador de Referencias con las seis formas de dos consultas, y el censo de los
     DEMAS buscadores de la app para saber cuales comparten la normalizacion y cuales no. */
  if (corre('busca')) {
    const r = { ref: {}, censo: null };
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      /* La pestana de Referencias y el buscador se arman al entrar. */
      await ev(`(function(){ try { if (typeof showTab === 'function') showTab('refs') } catch (e) {}
        try { if (typeof refBuscadorInit === 'function') refBuscadorInit() } catch (e) {}
        return !!document.getElementById('ref-busca') })()`);
      for (const q of ['HFA-PEFF', 'hfa-peff', 'HFA PEFF', 'hfa peff', 'hfapeff', 'HFAPEFF',
                       'TAPSE', 'tapse', 'wilkins', 'Wilkins', 'presion', 'presión']) {
        r.ref[q] = await ev(`(function(){
          var e = document.getElementById('ref-busca'); if (!e) return 'SIN CAMPO';
          e.value = ${JSON.stringify(q)};
          var R = (typeof refBuscar === 'function') ? refBuscar() : 'SIN FN';
          return R && typeof R === 'object' ? { n: R.n, q: R.q, ids: (R.ids || []).slice(0, 6) } : R })()`, 60000);
      }
      /* El censo: que normalizador usa cada buscador de la app. Se lee del FUENTE, que es lo
         unico que distingue «comparte el dueno» de «tiene su propia copia». */
      r.censo = await ev(`(function(){
        var H = document.documentElement.innerHTML;
        var o = {};
        ['refBuscar','igBuscar','_dupBuscar','orthancBuscar','frasesBuscar'].forEach(function(f){
          var fn = window[f];
          o[f] = (typeof fn === 'function')
            ? { existe: true, usaRefNorm: String(fn).indexOf('_refNorm') >= 0,
                usaLower: String(fn).indexOf('toLowerCase') >= 0,
                usaNFD: String(fn).indexOf('normalize') >= 0,
                fuente: String(fn).slice(0, 260) }
            : { existe: false };
        });
        return o })()`, 40000);
      /* ── EL BUSCADOR DE GUARDADOS, con dos estudios de nombre acentuado y un documento
         con puntos y guion. Se guardan de verdad por `abrirComoEstudio` + el guardado real. */
      r.guard = {};
      try {
        /* ⚠️ `getInformes()` NO LEE UNA CLAVE DE `localStorage`: une `CeiboStore.getChunk()`
           con `CeiboStore.getLocal()`. Inyectar en una clave inventada deja las once consultas
           en CERO y se lee igual que «el buscador no encuentra nada» — un denominador roto con
           pinta de medicion. Se parchea `getLocal`, que es el dueno. */
        r.guardDenom = await ev(`(function(){
          if (typeof CeiboStore === 'undefined' || !CeiboStore.getLocal) return 'SIN CeiboStore';
          var prev = CeiboStore.getLocal.bind(CeiboStore);
          window.__ZgPrev = prev;
          var FAKE = [
            { id: 'aj2a', nombre: 'Pérez Gómez, Juan', ci: '1.234.567-8',
              fecha_estudio: '2026-10-23', campos: {}, informe_texto: '', en_suma: '' },
            { id: 'aj2b', nombre: 'MUÑOZ', ci: '4567890',
              fecha_estudio: '2026-10-23', campos: {}, informe_texto: '', en_suma: '' }];
          CeiboStore.getLocal = function(){ return prev().concat(FAKE) };
          return (typeof getInformes === 'function') ? getInformes().length : 'SIN getInformes' })()`);
        for (const q of ['Pérez', 'perez', 'PEREZ', 'Muñoz', 'munoz', 'MUNOZ',
                         '1.234.567-8', '12345678', '1234567 8', 'Perez Gomez', 'perezgomez']) {
          r.guard[q] = await ev(`(function(){
            var e = document.getElementById('ig-buscar');
            if (!e) return 'SIN CAMPO';
            e.value = ${JSON.stringify(q)};
            if (typeof igFiltrar !== 'function') return 'SIN FN';
            var L = igFiltrar();
            return { n: L.length, ids: L.map(function(x){ return x.id }).slice(0, 5) } })()`, 40000);
        }
        /* Se deja el almacen como estaba: la sonda es de SOLO LECTURA. */
        /* Se repone el dueno: la sonda es de SOLO LECTURA y no deja nada escrito. */
        await ev(`(function(){
          try { if (window.__ZgPrev) CeiboStore.getLocal = window.__ZgPrev } catch (e) {}
          var e = document.getElementById('ig-buscar'); if (e) e.value = '';
          return 1 })()`);
      } catch (e) { r.guardErr = e.message; }
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.busca = r;
    process.stderr.write('[busca] listo\n');
  }

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  process.stdout.write(JSON.stringify(OUT, null, 1));
  cdp.close(); srv.close(); process.exit(0);
}

main().catch(async (e) => {
  process.stdout.write(JSON.stringify({ err: e.message, stack: String(e.stack || '').slice(0, 1200) }, null, 1));
  process.exit(1);
});
