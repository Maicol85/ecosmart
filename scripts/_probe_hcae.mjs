#!/usr/bin/env node
/**
 * _probe_hcae.mjs - sonda A/B de SOLO LECTURA para la tanda J2 (Hemodinamica, Cardio-oncologia,
 * Amiloidosis y Eco pulmonar), 2026-10-24.
 *
 * Reusa la infraestructura y los helpers `window.__P` / `window.__Y` de scripts/_probe_aj2.mjs.
 * NO muta index.html.
 *
 *   node scripts/_probe_aj3.mjs --file /tmp/index.AJ3HEAD.html --solo auto > /tmp/aj3.HEAD.json
 *   node scripts/_probe_aj3.mjs                                --solo auto > /tmp/aj3.NEW.json
 *
 * Grupos:
 *   inv   - AJ3-1 el registro de los diecisiete modulos integrables, leido de amiloSecs().
 *   auto  - AJ3-2a el bloque sigue al dato, modulo por modulo, con su denominador.
 *   edit  - AJ3-2b/c/d editado a mano: no se pisa, avisa, confirma al reintegrar y sobrevive
 *           al guardar-cerrar-reabrir.
 *   vacio - AJ3-2e los dos casos NO decididos, medidos tal como estan.
 *   hf    - AJ3-3 la pregunta nueva de la Evidencia del HFA-PEFF.
 *   ctrl  - el A/B de control: informe, EN SUMA, PDF, Excel y campos, sin modulos integrados.
 *   maq   - dos anchos por dos temas: scroll horizontal, recortes y geometria.
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda, tampoco en los comentarios
 * de adentro. scripts/check_backticks.py da la linea exacta, y node --check lo confirma.
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

  /* CAPTURA. Sin esto no hay forma de MIRAR lo renderizado, que es lo que esta tanda pide: una
     sonda que lee `textContent` no ve un recorte, un color ilegible ni un campo tapado. Va a
     disco en el directorio que da `--png`; sin esa bandera no captura nada y no cuesta tiempo. */
  const PNGDIR = arg('--png');
  async function shot(nombre) {
    if (!PNGDIR) return null;
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
    const dest = join(PNGDIR, nombre + '.png');
    await writeFile(dest, Buffer.from(r.data, 'base64'));
    return dest;
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
  /* ══ HELPERS PROPIOS DE LA TANDA J ════════════════════════════════════════════════════════
     ADVERTENCIA: sin acentos graves adentro, tampoco en los comentarios. */
  await evCrudo(`
window.__Y = {
  /* Pone un juego de campos SIN teclas: lo usa el A/B masivo, donde lo que se compara es el
     TEXTO de salida y no el gesto. Los bordes se tipean con teclas reales desde el nodo. */
  poner(campos) {
    var puestos = {}, err = [];
    Object.keys(campos || {}).forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { err.push('NO EXISTE ' + id); return; }
      if (e.type === 'checkbox') { e.checked = !!campos[id]; }
      else if (e.tagName === 'SELECT') {
        var r = window.__P.sel(id, campos[id]);
        if (r && r.err) { err.push(id + ': ' + r.err); return; }
      } else { e.value = campos[id]; }
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true }));
      puestos[id] = e.type === 'checkbox' ? (e.checked ? '1' : '0') : e.value;
    });
    try { if (typeof dptSync === 'function') dptSync() } catch (x) { err.push('dptSync: ' + x.message) }
    try { if (typeof cvrSync === 'function') cvrSync() } catch (x) { err.push('cvrSync: ' + x.message) }
    try { if (typeof calcVEXUS === 'function') calcVEXUS() } catch (x) { err.push('calcVEXUS: ' + x.message) }
    return { puestos: puestos, err: err } },

  /* ── Derrame / taponamiento: lo RENDERIZADO y el dueno, lado a lado ───────────────────── */
  dpt() {
    var o = {};
    o.lblAd  = window.__P.txt('dpt-lbl-addur');
    o.rotAd  = (function(){ var s = document.getElementById('dpt_col_ad');
      var fg = s && s.closest ? s.closest('.fg') : null;
      var l = fg ? fg.querySelector('label') : null;
      return l ? (l.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO HAY ROTULO' })();
    o.hayDur = !!document.getElementById('dpt_col_ad_dur');
    o.badge  = window.__P.txt('dpt-concl-badge');
    o.concl  = window.__P.txt('dpt-concl');
    try { var st = dptEstado();
      o.est = { clave: st.clave, tam: st.tam.clave, signos: st.signos.slice(),
                plet: st.plet.presente, pletEval: st.plet.evaluada, colAdDur: st.colAdDur };
      o.frases = dptFrases(st);
      o.suma = dptSuma(st);
    } catch (e) { o.err = 'EXC ' + e.message }
    /* El bloque del chip, tal como se lee en pantalla. */
    o.chip = (function(){
      var c = document.getElementById('dpt-concl');
      var caja = c ? c.parentNode : null;
      if (!caja) return 'NO HAY CAJA';
      var t = (caja.textContent || '').replace(/\\s+/g, ' ');
      var i = t.indexOf('CRITERIO DE ECOSMART');
      return i < 0 ? 'SIN CHIP' : t.slice(i, i + 620) })();
    return o },

  /* ── Constriccion vs restriccion ──────────────────────────────────────────────────────── */
  cvr() {
    var o = {};
    o.badge = window.__P.txt('cvr-concl-badge');
    o.concl = window.__P.txt('cvr-concl');
    o.conteo = window.__P.txt('cvr-conteo');
    o.tabla = (function(){ var t = document.getElementById('cvr-tabla');
      return t ? (t.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE' })();
    o.hayCoc = !!document.getElementById('cvr_hep_coc');
    o.coc = window.__P.txt('cvr-coc-eval');
    /* El aviso invasivo: se lo busca por su TEXTO en toda la seccion, no por un id, para que
       siga encontrandolo si alguien lo mueve de caja. */
    o.avisoInv = (function(){
      var s = document.getElementById('ete-seccion-constr-restr');
      if (!s) return 'NO EXISTE SECCION';
      var t = (s.textContent || '').replace(/\\s+/g, ' ');
      return /correlaci[oó]n cl[ií]nica e invasiva/i.test(t) ? 'PRESENTE' : 'AUSENTE' })();
    try { var st = cvrEstado();
      o.est = { clave: st.clave, nC: st.nC, nR: st.nR, espEval: st.espEval, reversus: st.reversus };
      o.frases = cvrFrases(st);
      o.motivo = cvrMotivo(st);
      o.suma = cvrSuma(st);
    } catch (e) { o.err = 'EXC ' + e.message }
    return o },

  /* ── VEXUS ────────────────────────────────────────────────────────────────────────────── */
  vexus() {
    var o = {};
    o.score = window.__P.txt('vexus-score');
    o.severos = window.__P.txt('vexus-severos');
    o.interp = window.__P.txt('vexus-interp');
    o.aviso = window.__P.txt('vexus-vci-aviso');
    o.vci = window.__P.txt('vexus-vci');
    try { var st = vexusEstado();
      o.est = st ? { score: st.score, severos: st.severos.slice(), evaluados: st.evaluados, vciDiam: st.vciDiam } : null;
      o.detalle = st ? vexusDetalle(st) : null;
    } catch (e) { o.err = 'EXC ' + e.message }
    /* Las frases de conducta, buscadas por su texto en la seccion entera. */
    o.conductas = (function(){
      var s = document.getElementById('vexus-seccion');
      if (!s) return 'NO EXISTE SECCION';
      var t = (s.textContent || '').replace(/\\s+/g, ' ');
      var hits = [];
      ['Monitorizar', 'Considerar balance', 'Evaluar necesidad de descongesti',
       'Considerar descongesti', 'diur', 'ultrafiltraci', 'Reevaluar con tratamiento'].forEach(function(p){
        if (t.indexOf(p) >= 0) hits.push(p);
      });
      return hits })();
    return o },

  /* La hoja del PDF de un modulo, por su clave de amiloSecs. Es el texto que el armador
     aplana: se lo lee del mismo generador, sin pasar por jsPDF. */
  hoja(k) {
    try {
      var S = (typeof amiloSecs === 'function') ? amiloSecs().filter(function(x){ return x.k === k })[0] : null;
      if (!S) return 'NO HAY SECCION ' + k;
      return typeof S.gen === 'function' ? S.gen() : 'SIN gen';
    } catch (e) { return 'EXC: ' + e.message } },

  /* El cuerpo de una ficha de Referencias, abierta por su clave de toggleRef. */
  ficha(k) {
    var d = document.getElementById('ref-' + k);
    if (!d) return 'NO EXISTE ref-' + k;
    var abierta = getComputedStyle(d).display !== 'none';
    if (!abierta) { try { toggleRef(k, d.previousElementSibling) } catch (e) {} }
    return (d.textContent || '').replace(/\\s+/g, ' ').trim() },

  /* Una seccion del panel de Evidencia, por el PREFIJO de su titulo. Devuelve el texto, los
     corchetes de cita y su bibliografia, que es lo que _indRefMarca numera. */
  evid(pref) {
    try { if (typeof indicRender === 'function') indicRender() } catch (e) { return 'EXC render: ' + e.message }
    var cu = document.getElementById('indic-cuerpo');
    if (!cu) return 'NO EXISTE indic-cuerpo';
    var hit = null;
    Array.prototype.forEach.call(cu.children, function(d){
      if (hit || d.tagName !== 'DETAILS') return;
      var su = d.querySelector('summary');
      var tit = su ? (su.textContent || '').replace(/\\s+/g, ' ').trim() : '';
      if (tit.indexOf(pref) === 0) hit = d;
    });
    if (!hit) return { hay: false };
    return { hay: true,
      tit: (hit.querySelector('summary').textContent || '').replace(/\\s+/g, ' ').trim(),
      txt: (hit.textContent || '').replace(/\\s+/g, ' ').trim(),
      marcas: Array.prototype.map.call(hit.querySelectorAll('[data-ind-ref]'), function(x){
        return x.getAttribute('data-ind-ref') + '=' + (x.textContent || '').trim() }),
      biblio: Array.prototype.map.call(hit.querySelectorAll('[data-ind-refitem]'), function(x){
        return x.getAttribute('data-ind-refitem') + '|' + (x.textContent || '').replace(/\\s+/g,' ').trim().slice(0, 70) }) } },

  /* Scroll horizontal del documento, que es lo que la maqueta mide. */
  scrollH() { var d = document.documentElement;
    return { sw: d.scrollWidth, cw: d.clientWidth, desborda: d.scrollWidth > d.clientWidth + 1 } },

  errores() { return (window.__Yerr || []).slice() }
};
`);

  /* ══ HELPERS PROPIOS DE LA TANDA J2 ════════════════════════════════════════════════════════
     ADVERTENCIA: NI UN ACENTO GRAVE adentro, tampoco en los comentarios de adentro. */
  await evCrudo(`
window.__Z = {
  /* Lo RENDERIZADO de la capsula de hemodinamica. Se lee el textContent, que es lo que el
     medico ve y lo que el informe, la hoja del PDF y el PPT copian. */
  hemo() {
    var o = {};
    ['hemo-gc','hemo-ic','hemo-rvs','hemo-pcp','hemo-gtp','hemo-rvp',
     'hemo-forrester','hemo-perfil','hemo-htp-tipo'].forEach(function(id){
      o[id] = window.__P.txt(id);
    });
    /* El HTML del perfil dice si hay UNO o DOS badges, que es lo que distingue el chip. */
    o.perfilHTML = window.__P.html('hemo-perfil');
    o.nBadges = (function(){ var e = document.getElementById('hemo-perfil');
      return e ? e.querySelectorAll('.badge').length : -1 })();
    return o },

  /* Los dos duenos de banda, preguntados DIRECTO en sus bordes. Es la unica forma honesta de
     medir el 2,2 exacto: hacerlo llegar por la cadena de multiplicaciones del eco lo convierte
     en 2.1999999999999997 y el caso probaria otra cosa. */
  bandas() {
    var o = {};
    [2.19, 2.2, 2.21, 2.5, 4.0, 4.01].forEach(function(x){
      try { var b = _icBanda(x); o['ic_' + x] = b ? b.cls + '/' + b.txt : String(b) }
      catch (e) { o['ic_' + x] = 'EXC' } });
    [799, 800, 1200, 1201].forEach(function(x){
      try { var b = _rvsBanda(x); o['rvs_' + x] = b ? b.cls + '/' + b.txt : String(b) }
      catch (e) { o['rvs_' + x] = 'EXC' } });
    return o },

  /* Un globo por su clave: si existe, si tiene boton y QUE dice al abrirlo de verdad.
     ADVERTENCIA: puertaDe NO SABE ABRIR LOS ACORDEONES de toggleCard, y la capsula de hemodinamica es
     uno: nace con display:none, asi que el boton mide 0 x 0 y qtarj informa «sinGeometria»
     sobre un globo que el medico ve. Medido: los tres daban «abierta: null» con el arbol nuevo
     ya puesto. Se abren los ancestros por su id ANTES de preguntar. */
  abrirAcordeones(clave) {
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { err: 'NO EXISTE globo ' + clave };
    var abiertos = [], n = b.parentNode;
    while (n && n.nodeType === 1 && n !== document.body) {
      var id = String(n.id || '');
      if (id && getComputedStyle(n).display === 'none' && typeof toggleCard === 'function'
          && document.getElementById(id + '-arrow')) {
        toggleCard(id); abiertos.push(id);
      }
      n = n.parentNode;
    }
    return { abiertos: abiertos } },

  globo(clave) {
    var pre = window.__Z.abrirAcordeones(clave);
    var r = window.__P.qtarj(clave);
    r.acordeones = pre.abiertos || pre.err;
    return r },

  /* Textos RECORTADOS dentro de una zona: un nodo cuyo contenido desborda su caja. Se ignora
     lo que mide 0 -no tiene geometria- porque contarlo da un falso positivo masivo. */
  recortes(zonas) {
    /* ADVERTENCIA DEL DENOMINADOR: la primera version contaba recortes sobre una zona con
       display:none y devolvia [] -cero recortes sobre cero elementos-, que se lee igual que una
       maqueta sana. Hoy devuelve CUANTOS nodos con geometria miro: si vistos es 0, el verde
       no vale. */
    var fuera = [], vistos = 0;
    (zonas || []).forEach(function(z){
      var raiz = document.getElementById(z);
      if (!raiz) { fuera.push('NO EXISTE ' + z); return; }
      raiz.querySelectorAll('*').forEach(function(e){
        var r = e.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0)) return;
        vistos++;
        if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'hidden')
          fuera.push((e.id || e.className || e.tagName) + ' sw=' + e.scrollWidth + ' cw=' + e.clientWidth);
      });
    });
    return { vistos: vistos, fuera: fuera } },

  /* Abre una zona DE VERDAD: su pestaña, sus acordeones toggleCard -incluido el de la propia
     zona, que es lo que abrirPara no hace porque arranca en el padre- y sus secciones sacc-. */
  abrirZona(id) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    var sec = e.closest ? e.closest('.tab-section') : null;
    if (sec && String(sec.id || '').indexOf('tab-') === 0) {
      try { showTab(String(sec.id).slice(4)) } catch (x) {}
    }
    var tocados = [], n = e;
    while (n && n.nodeType === 1 && n !== document.body) {
      var nid = String(n.id || '');
      if (nid && getComputedStyle(n).display === 'none') {
        if (typeof toggleCard === 'function' && document.getElementById(nid + '-arrow')) {
          toggleCard(nid); tocados.push('card:' + nid);
        } else if (nid.indexOf('sacc-') === 0 && typeof secToggle === 'function') {
          secToggle(nid.slice(5)); tocados.push('sacc:' + nid);
        } else { n.style.display = ''; tocados.push('forzado:' + nid); }
      }
      n = n.parentNode;
    }
    /* ADVERTENCIA DEL DENOMINADOR, segunda vez en esta sonda: una zona con SUB-PANELES
       ocultos -las cuatro subtabs de Referencia rapida de cardio-oncologia- mide solo el panel
       visible, asi que el barrido de recortes corre sobre un tercio de las filas y devuelve
       cero. Se abren TODOS los descendientes con display:none antes de medir. Lo que estaba en
       display:none no tiene geometria: medirlo cerrado es medir nada. */
    var ocultos = 0;
    e.querySelectorAll('*').forEach(function(x){
      if (getComputedStyle(x).display === 'none') { x.style.display = ''; ocultos++; }
    });
    return { tocados: tocados, subpaneles: ocultos, geo: window.__P.geo(id) } },

  /* El censo COMPLETO del panel de Evidencia: cada seccion que se pinta, con sus corchetes y su
     bibliografia. Es lo que detecta el defecto del AJ6 -una seccion nueva que corre la
     numeracion de las catorce ajenas-.
     ADVERTENCIA DEL DENOMINADOR: hay que ABRIR el panel, no solo renderizarlo. Quien engancha
     los oyentes es _indClinCablear(), y a esa la llama indicAbrir(), no indicRender(). */
  panel() {
    try { if (typeof indicAbrir === 'function') indicAbrir();
          else if (typeof indicRender === 'function') indicRender(); }
    catch (e) { return 'EXC abrir: ' + e.message }
    var cu = document.getElementById('indic-cuerpo');
    if (!cu) return 'NO EXISTE indic-cuerpo';
    var o = { n: 0, secs: {} };
    Array.prototype.forEach.call(cu.children, function(d){
      if (d.tagName !== 'DETAILS') return;
      var su = d.querySelector('summary');
      var tit = su ? (su.textContent || '').replace(/\\s+/g, ' ').trim() : '(sin summary)';
      o.n++;
      o.secs[tit] = {
        marcas: Array.prototype.map.call(d.querySelectorAll('[data-ind-ref]'), function(x){
          return x.getAttribute('data-ind-ref') + '=' + (x.textContent || '').trim() }),
        biblio: Array.prototype.map.call(d.querySelectorAll('[data-ind-refitem]'), function(x){
          return x.getAttribute('data-ind-refitem') + '|' + (x.textContent || '').replace(/\\s+/g,' ').trim().slice(0,60) })
      };
    });
    return o },

  /* Las tres tablas de referencia de cardio-oncologia, por su texto plano. Son HTML estatico:
     lo que se mide es lo que el medico lee. Se buscan FRASES, no se compara el bloque entero,
     para que el veredicto diga QUE falta y no solo que algo cambio. */
  conco() {
    var sec = document.getElementById('co-referencia-seccion');
    if (!sec) return 'NO EXISTE co-referencia-seccion';
    var t = (sec.textContent || '').replace(/\\s+/g, ' ');
    var o = { len: t.length };
    [['plazo24', '2-4 sem'], ['plazo4', 'control en 4 sem'],
     ['biopsia', 'considerar biopsia'], ['rt5y10', '5 anos post-RT. Eco a los 10 anos'],
     ['rtDesde5', 'desde los 5 anos'], ['rtCada5', 'cada 5 anos'],
     ['rtClase', 'Clase IIa, Nivel C'], ['plazo36', '3-6 sem'],
     ['cada2ciclos', 'cada 2 ciclos'], ['dosis250', '250 mg/m2'],
     ['gls15', 'GLS >15%'], ['noHfaIcos', 'HFA-ICOS']].forEach(function(p){
      o[p[0]] = t.indexOf(p[1]) >= 0;
    });
    o.ocurrRT = (t.match(/desde los 5 anos/g) || []).length;
    /* El denominador: cuantas filas tiene cada una de las tres tablas de la seccion. */
    o.filas = sec.querySelectorAll('tr').length;
    return o },

  /* Lleva A LA VISTA la primera fila que contiene un fragmento de texto, para que la captura
     muestre LO QUE SE CAMBIO y no el principio de la seccion. Devuelve su rect y su texto: si
     no esta, lo dice, y una captura sin denominador no se confunde con una sana. */
  verTexto(zona, frag) {
    window.__Z.abrirZona(zona);
    var raiz = document.getElementById(zona);
    if (!raiz) return { err: 'NO EXISTE ' + zona };
    var hit = null;
    raiz.querySelectorAll('tr').forEach(function(x){
      if (!hit && (x.textContent || '').indexOf(frag) >= 0) hit = x;
    });
    if (!hit) return { hay: false, frag: frag };
    hit.scrollIntoView({ block: 'center' });
    var r = hit.getBoundingClientRect();
    return { hay: true, y: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width),
             txt: (hit.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 260) } },

  /* El bloque de cardio-oncologia tal como lo escribe su generador: informe y hoja del PDF. */
  hojaConco() { return window.__Y.hoja('conco') },

  /* Lo RENDERIZADO de las dos capsulas de resultado de la pestaña. */
  concoPant() {
    return { riesgo: window.__P.txt('co-riesgo-resultado'),
             toxic: window.__P.txt('co-toxicidad-resultado') } },

  /* Abre el panel, despliega la seccion cuyo titulo empieza con el prefijo dado, la deja a la
     vista y devuelve su alto. Sin esto la captura muestra una lista de titulos cerrados. */
  abrirSeccion(pref) {
    try { if (typeof showTab === 'function') showTab('referencias') } catch (e) {}
    try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) { return 'EXC: ' + e.message }
    var cu = document.getElementById('indic-cuerpo');
    if (!cu) return 'NO EXISTE indic-cuerpo';
    var hit = null;
    Array.prototype.forEach.call(cu.children, function(d){
      if (hit || d.tagName !== 'DETAILS') return;
      var su = d.querySelector('summary');
      var tit = su ? (su.textContent || '').replace(/\\s+/g, ' ').trim() : '';
      if (tit.indexOf(pref) === 0) hit = d;
    });
    if (!hit) return { hay: false, titulos: Array.prototype.map.call(cu.children, function(d){
      var su = d.querySelector ? d.querySelector('summary') : null;
      return su ? su.textContent.trim().slice(0,40) : d.tagName }) };
    hit.open = true;
    Array.prototype.forEach.call(hit.querySelectorAll('details'), function(x){ x.open = true });
    hit.scrollIntoView({ block: 'start' });
    var r = hit.getBoundingClientRect();
    return { hay: true, h: Math.round(r.height), w: Math.round(r.width),
             txt: (hit.textContent || '').replace(/\\s+/g, ' ').trim().length } },

  /* El bloque de hemodinamica tal como lo escribe su generador: es el texto que entra al
     informe cuando se integra y el que sale en la hoja del PDF. */
  hojaHemo() { return window.__Y.hoja('hemo') },

  /* El PPT lee los mismos span. Se mide por su dueno, sin abrir el modal. */
  pptHemo() {
    var o = {};
    ['hemo-forrester','hemo-perfil','hemo-ic','hemo-rvs'].forEach(function(id){
      o[id] = (typeof _pptSpan === 'function') ? _pptSpan(id) : 'SIN _pptSpan' });
    return o }
};
`);

  /* ══ LAS ESCENAS ═══════════════════════════════════════════════════════════════════════════
     ASC = 2,00 m2 EXACTOS con peso 80 y talla 180 (Mosteller: raiz de 180*80/3600 = 2). Eso
     deja el indice cardiaco en la mitad del gasto, que es lo que vuelve legibles los bordes.
     VS = pi * (22/20)^2 * VTI = 3,8013 * VTI. */
  const ESC = {
    vacio: {},
    /* IC bajo + RVS baja: la rama que esta tanda cambia. GC 3,99 -> IC 1,99; PAM 40 y PVC 3
       -> RVS 742. */
    hemoBajoBaja: { peso: '80', talla: '180', diam_tsvi: '22', itv_tsvi: '10.5',
                    hemo_fc: '100', hemo_pam: '40', vci_diam: '15', vci_col: '>50',
                    onda_e: '95', e_sep: '6', e_lat: '8' },
    /* RVS baja con IC conservado: la rama que QUEDA, con el chip. GC 6,84 -> IC 3,42;
       PAM 65 -> RVS 725. */
    hemoDistrib: { peso: '80', talla: '180', diam_tsvi: '22', itv_tsvi: '18',
                   hemo_fc: '100', hemo_pam: '65', vci_diam: '15', vci_col: '>50',
                   onda_e: '95', e_sep: '6', e_lat: '8' },
    /* CONTROL NEGATIVO 1: shock cardiogenico -IC bajo con RVS alta-, que esta tanda NO toca. */
    hemoShock: { peso: '80', talla: '180', diam_tsvi: '22', itv_tsvi: '10.5',
                 hemo_fc: '100', hemo_pam: '90', vci_diam: '15', vci_col: '>50',
                 onda_e: '95', e_sep: '6', e_lat: '8' },
    /* CONTROL NEGATIVO 2: perfil normal, que tampoco se toca. */
    hemoNormal: { peso: '80', talla: '180', diam_tsvi: '22', itv_tsvi: '18',
                  hemo_fc: '100', hemo_pam: '90', vci_diam: '15', vci_col: '>50',
                  onda_e: '95', e_sep: '6', e_lat: '8' },
    /* Cardio-oncologia con RADIOTERAPIA, que es la fila que esta tanda alinea. */
    concoRT:    { co_farmaco: 'radioterapia', co_fevi_basal: '62', co_fevi_actual: '58',
                  co_edad: '58', co_riesgo_cv: '1' },
    /* Antraciclinas con caida de FEVI: la fila de la que salio el plazo de 2-4 semanas. */
    concoAntrac:{ co_farmaco: 'antracicline', co_dosis_antrac: '300', co_fevi_basal: '62',
                  co_fevi_actual: '48', co_gls_basal: '-20', co_gls_actual: '-15',
                  co_edad: '66', co_riesgo_cv: '2', co_troponi: 'si' }
  };

  /* ══ GRUPO hemo ════════════════════════════════════════════════════════════════════════════ */
  if (corre('hemo')) {
    const r = { escenas: {}, globos: {} };
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      r.bandas = await ev(`window.__Z.bandas()`);
      for (const k of ['vacio','hemoBajoBaja','hemoDistrib','hemoShock','hemoNormal']) {
        await ev(`window.__P.nuevo()`);
        const put = await ev(`window.__Y.poner(${JSON.stringify(ESC[k] || {})})`);
        await ev(`window.__P.calentar()`);
        r.escenas[k] = { err: put.err, hemo: await ev(`window.__Z.hemo()`),
                         hoja: await ev(`window.__Z.hojaHemo()`),
                         ppt: await ev(`window.__Z.pptHemo()`) };
      }
      /* Los tres globos, con el boton APRETADO de verdad y midiendo lo que queda en pantalla. */
      await ev(`window.__P.nuevo()`);
      const put = await ev(`window.__Y.poner(${JSON.stringify(ESC.hemoDistrib)})`);
      r.globoPut = put.err;
      await ev(`window.__P.calentar()`);
      for (const g of ['hemo-ic','hemo-rvs','hemo-forr']) {
        r.globos[g] = await ev(`window.__Z.globo(${JSON.stringify(g)})`, 20000);
      }
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.hemo = r;
    process.stderr.write('[hemo] listo\n');
  }

  /* ══ GRUPO maq — LA MAQUETA, Y LAS CAPTURAS QUE HAY QUE MIRAR ══════════════════════════════
     Cinco anchos por dos temas. Mide el scroll horizontal del documento y los recortes de la
     zona pedida, y guarda el PNG cuando se pasa --png. Sin MIRAR el PNG, una sonda que lee
     textContent no ve un recorte ni un color ilegible: eso es lo que esta tanda exige. */
  if (corre('maq')) {
    const r = {};
    const ANCHOS = [[1200,700],[1440,800],[768,1024],[390,844],[360,740]];
    const ZONAS = (arg('--zona') || 'hemo-vi').split(',').map(s => s.trim()).filter(Boolean);
    try {
      for (const [w,h] of ANCHOS) {
        for (const claro of [false,true]) {
          await viewport(w,h);
          await ev(`window.__P.tema(${claro ? 'true' : 'false'})`);
          await ev(`window.__P.nuevo()`);
          await ev(`window.__Y.poner(${JSON.stringify(ESC.hemoDistrib)})`);
          await ev(`window.__P.calentar()`);
          for (const z of ZONAS) await ev(`window.__Z.abrirZona(${JSON.stringify(z)})`);
          const FRAG = arg('--frag');
          const k = `${w}x${h}_${claro ? 'claro' : 'oscuro'}`;
          const o = { scrollH: await ev(`window.__Y.scrollH()`), geo: {} };
          if (FRAG) o.ver = await ev(`window.__Z.verTexto(${JSON.stringify(ZONAS[0])},${JSON.stringify(FRAG)})`);
          for (const z of ZONAS) o.geo[z] = await ev(`window.__P.geo(${JSON.stringify(z)})`);
          o.recortes = await ev(`window.__Z.recortes(${JSON.stringify(ZONAS)})`);
          o.png = await shot('hcae_' + k + '_' + ZONAS[0]);
          r[k] = o;
        }
      }
      await viewport(1440,900); await ev(`window.__P.tema(false)`);
    } catch (e) { r.err = e.message }
    out.grupos.maq = r;
    process.stderr.write('[maq] listo\n');
  }

  /* ══ GRUPO ctrl — EL A/B DE CONTROL ════════════════════════════════════════════════════════
     Un estudio SIN ningun modulo de esta tanda cargado: informe en los tres estilos, EN SUMA,
     PDF generado de verdad, Excel columna por columna y el censo de campos guardados. Acá la
     diferencia esperada es CERO; cualquier cosa que se mueva es un defecto. */
  if (corre('ctrl')) {
    const r = {};
    try {
      await viewport(1440,900);
      await ev(`window.__P.nuevo()`);
      const AJENO = { nombre_paciente: 'P ctrl', edad: '64', sexo: 'M', peso: '72', talla: '172',
                      ddfvi: '52', dsfvi: '34', siv: '11', ppvi: '10', ai_diam: '38',
                      onda_e: '72', onda_a: '66', e_sep: '8', e_lat: '11',
                      tapse: '21', vmax_it: '2.4', vci_diam: '17', vci_col: '>50' };
      for (const id of Object.keys(AJENO)) {
        try { await ev(`window.__Z.abrirZona(${JSON.stringify(id)})`); await poner(id, AJENO[id]); }
        catch (e) { r['no_' + id] = e.message }
      }
      await ev(`window.__P.calentar()`);
      const tres = {};
      for (const est of ['conciso','estandar','narrativo']) tres[est] = await ev(`window.__P.informe('${est}')`, 60000);
      r.tres = tres;
      r.pdf = await ev(`window.__P.pdf('estandar')`, 120000);
      r.excel = await ev(`window.__P.excelDOM()`, 60000);
      r.campos = await ev(`window.__P.camposGuardados()`);
      r.refs = await ev(`window.__P.refs()`);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.ctrl = r;
    process.stderr.write('[ctrl] listo\n');
  }

  /* ══ GRUPO evid — EL PANEL DE EVIDENCIA ════════════════════════════════════════════════════
     Censa TODO el panel en cada escena: la seccion nueva y las ajenas, con sus corchetes y su
     bibliografia. Lo que se busca es la seccion nueva donde debe estar Y cero movimiento en la
     numeracion de las demas. */
  if (corre('evid')) {
    const r = { escenas: {} };
    try {
      await viewport(1440,900);
      for (const k of Object.keys(ESC)) {
        await ev(`window.__P.nuevo()`);
        const put = await ev(`window.__Y.poner(${JSON.stringify(ESC[k] || {})})`);
        await ev(`window.__P.calentar()`);
        r.escenas[k] = { err: put.err, panel: await ev(`window.__Z.panel()`, 60000) };
      }
      /* La captura: el panel ABIERTO, en los dos temas y a dos anchos, con la seccion nueva
         desplegada. Sin MIRARLA no se sabe si el texto entra, si se corta o si el color es
         ilegible en claro. */
      if (PNGDIR) {
        for (const [w,h] of [[1440,900],[390,844]]) {
          for (const claro of [false,true]) {
            await viewport(w,h);
            await ev(`window.__P.tema(${claro ? 'true' : 'false'})`);
            await ev(`window.__P.nuevo()`);
            await ev(`window.__Y.poner(${JSON.stringify(ESC[arg('--escena') || 'hemoDistrib'])})`);
            await ev(`window.__P.calentar()`);
            const abierto = await ev(`window.__Z.abrirSeccion(${JSON.stringify(arg('--sec') || 'Perfil hemodin')})`, 60000);
            r['shot_' + w + '_' + (claro ? 'claro' : 'oscuro')] =
              { abierto: abierto, png: await shot(`hcae_evid_${w}_${claro ? 'claro' : 'oscuro'}`) };
          }
        }
        await viewport(1440,900); await ev(`window.__P.tema(false)`);
      }
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.evid = r;
    process.stderr.write('[evid] listo\n');
  }

  /* ══ GRUPO conco — CARDIO-ONCOLOGIA ════════════════════════════════════════════════════════ */
  if (corre('conco')) {
    const r = { escenas: {} };
    try {
      await viewport(1440,900);
      await ev(`window.__P.nuevo()`);
      await ev(`window.__Z.abrirZona('co-referencia-seccion')`);
      r.tablas = await ev(`window.__Z.conco()`);
      for (const k of ['concoRT','concoAntrac']) {
        await ev(`window.__P.nuevo()`);
        const put = await ev(`window.__Y.poner(${JSON.stringify(ESC[k])})`);
        await ev(`window.__P.calentar()`);
        r.escenas[k] = { err: put.err, pant: await ev(`window.__Z.concoPant()`),
                         hoja: await ev(`window.__Z.hojaConco()`),
                         panel: await ev(`window.__Z.panel()`, 60000) };
      }
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.conco = r;
    process.stderr.write('[conco] listo\n');
  }

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  process.stdout.write(JSON.stringify(OUT, null, 1));
  cdp.close(); srv.close(); process.exit(0);
}

main().catch(async (e) => {
  process.stdout.write(JSON.stringify({ err: e.message, stack: String(e.stack || '').slice(0, 1200) }, null, 1));
  process.exit(1);
});
