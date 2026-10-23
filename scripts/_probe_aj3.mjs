#!/usr/bin/env node
/**
 * _probe_aj3.mjs - sonda A/B de SOLO LECTURA para la tanda AJ3, 2026-10-23.
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

  /* == HELPERS PROPIOS DE LA TANDA AJ3 =========================================================
     Cuarto template, para no tocar los dos bloques reusados. SIN ACENTOS GRAVES adentro. */
  await evCrudo(`
window.__W = {
  /* El registro de modulos integrables, tal como amiloSecs() lo publica. Es el inventario de
     AJ3-1 leido del codigo vivo y no de una lista escrita a mano. */
  registro() { try {
    return amiloSecs().map(function(s){
      return { k: s.k, lbl: s.lbl, tit: s.tit,
               gen: s.gen ? s.gen.name : null,
               hayDatos: !!s.hayDatos, omitir: !!s.omitir,
               soloHoja: !!s.soloHoja, enCuerpo: !!s.enCuerpo, alIntegrar: !!s.alIntegrar,
               boton: document.querySelectorAll('[data-am-k="' + s.k + '"]').length,
               textarea: !!document.getElementById('am-txt-' + s.k) } }) }
    catch (e) { return 'EXC: ' + e.message } },

  /* Estado COMPLETO de un bloque: lo que el bloque dice, lo que la app diria hoy, y si estan
     de acuerdo. El campo 'igual' es la condicion de AJ3-2a. */
  bloque(k) { try {
    var ta = document.getElementById('am-txt-' + k);
    var w  = document.getElementById('am-wrap-' + k);
    var av = document.getElementById('am-stale-' + k);
    var S  = amiloSecs().filter(function(x){ return x.k === k })[0];
    var gen = 'SIN SEC';
    if (S) { try { gen = String(S.gen() || '') } catch (e) { gen = 'EXC: ' + e.message } }
    var txt = ta ? String(ta.value || '') : 'SIN TEXTAREA';
    var btn = document.querySelector('[data-am-k="' + k + '"]');
    return { integrado: typeof amiloIntegrado === 'function' ? amiloIntegrado(k) : null,
             txt: txt, gen: gen,
             igual: txt.trim() === String(gen).trim(),
             largoTxt: txt.length, largoGen: String(gen).length,
             editado: typeof window._amiloEstaEditado === 'function' ? window._amiloEstaEditado(k) : 'SIN FN',
             desfasado: typeof window._amiloDesfasado === 'function' ? window._amiloDesfasado(k) : 'SIN FN',
             avisoVisible: !!(w && w.classList.contains('desfasado')),
             avisoTxt: av ? (av.textContent || '').trim() : 'SIN NODO',
             botonRevisar: !!(btn && btn.classList.contains('revisar')),
             botonTitle: btn ? (btn.getAttribute('title') || null) : 'SIN BOTON',
             botonTxt: btn ? (btn.textContent || '').trim() : 'SIN BOTON',
             listaIntegrados: (document.getElementById('am-integrados') || {}).value,
             listaEditados: (document.getElementById('am-editados') || {}).value } }
    catch (e) { return 'EXC: ' + e.message } },

  /* Siembra una escena por .value + eventos reales de input y change. Los campos que no
     existen se informan, no se ocultan: un id que no existe es un denominador vacio. */
  sembrar(obj) { try {
    var faltan = [], puestos = [];
    Object.keys(obj).forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { faltan.push(id); return }
      if (e.tagName === 'SELECT') { e.value = obj[id]; if (e.value !== String(obj[id])) { faltan.push(id + ':VALOR'); return } }
      else if (e.type === 'checkbox') { e.checked = !!obj[id] }
      else { e.value = obj[id] }
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true }));
      puestos.push(id);
    });
    return { puestos: puestos.length, faltan: faltan } }
    catch (e) { return 'EXC: ' + e.message } },

  /* Edita el bloque a mano: tipea en el textarea con el evento que la app escucha. */
  editarAMano(k, texto) { try {
    var ta = document.getElementById('am-txt-' + k);
    if (!ta) return 'SIN TEXTAREA';
    ta.value = String(texto);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    return 'ok' }
    catch (e) { return 'EXC: ' + e.message } },

  /* Vuelve a tocar el boton del modulo, con confirm() instrumentado: devuelve si se pidio
     confirmacion y con que texto. El parametro 'resp' decide que contesta el medico. */
  reintegrar(k, resp) { try {
    var pedido = null, orig = window.confirm;
    window.confirm = function(m){ pedido = String(m); return !!resp };
    try { var b = document.querySelector('[data-am-k="' + k + '"]'); if (!b) return 'SIN BOTON'; b.click() }
    finally { window.confirm = orig }
    return { pidioConfirmacion: pedido !== null, texto: pedido,
             integrado: amiloIntegrado(k) } }
    catch (e) { return 'EXC: ' + e.message } },

  /* El barrido, forzado sin esperar al temporizador. */
  barrer() { try { amiloRefrescarTodos(); return 'ok' } catch (e) { return 'EXC: ' + e.message } },

  /* La hoja del ETT avanzado que el PDF arma de verdad, por modulo. */
  hojaPDF(k) { try {
    if (typeof amiloEnInforme !== 'function') return 'SIN FN';
    var r = amiloEnInforme();
    if (!r) return { hay: false };
    var secs = (r.secs || r || []);
    var m = null;
    (Array.isArray(secs) ? secs : []).forEach(function(x){ if (x && x.k === k) m = x });
    return { hay: true, n: Array.isArray(secs) ? secs.length : -1,
             claves: (Array.isArray(secs) ? secs : []).map(function(x){ return x && x.k }),
             mia: m ? { tit: m.tit, txt: String(m.txt || m.texto || '') } : null } }
    catch (e) { return 'EXC: ' + e.message } },

  /* El informe y el EN SUMA, con su denominador. */
  inf(frags) { try {
    if (typeof generarInforme === 'function') generarInforme();
    var t = (document.getElementById('informe_texto') || {}).value || '';
    var s = (document.getElementById('en_suma') || {}).value || '';
    var li = t.split(String.fromCharCode(10)).filter(function(x){ return x.trim() });
    var ls = s.split(String.fromCharCode(10)).filter(function(x){ return x.trim() });
    var casa = function(a){ return a.filter(function(x){
      return (frags || []).some(function(f){ return x.toLowerCase().indexOf(String(f).toLowerCase()) >= 0 }) }) };
    return { nInf: li.length, nSuma: ls.length, inf: casa(li), suma: casa(ls),
             largoInf: t.length, largoSuma: s.length } }
    catch (e) { return 'EXC: ' + e.message } },

  /* Guarda, limpia y reabre el estudio, que es el gesto de AJ3-2d. */
  guardarYReabrir() { try {
    var campos = {}, es = document.querySelectorAll('input[id], select[id], textarea[id]');
    for (var i = 0; i < es.length; i++) { var e = es[i];
      campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '') }
    if (typeof limpiarCampos === 'function') limpiarCampos();
    var trasLimpiar = { listaEd: (document.getElementById('am-editados') || {}).value,
                        listaInt: (document.getElementById('am-integrados') || {}).value };
    Object.keys(campos).forEach(function(id){ var e = document.getElementById(id);
      if (!e) return;
      if (e.type === 'checkbox') e.checked = campos[id] === '1'; else e.value = campos[id] });
    if (typeof amiloRestaurarDesdeCampos === 'function') amiloRestaurarDesdeCampos(campos, false);
    return { nCampos: Object.keys(campos).length, trasLimpiar: trasLimpiar } }
    catch (e) { return 'EXC: ' + e.message } },

  /* El panel de Evidencia del HFA-PEFF, con sus filas, sus controles y sus bloques. */
  hf() { try {
    var L = window.IND_SECS || IND_SECS, s = null;
    for (var i = 0; i < L.length; i++)
      if (String(L[i].tit).indexOf('HFA-PEFF') > -1) s = L[i];
    if (!s) return { existe: false, titulos: L.map(function(x){ return x.tit }) };
    var r = null; try { r = s.fn() } catch (e) { return { existe: true, exc: e.message } }
    if (!r) return { existe: true, nula: true };
    return { existe: true,
      filas: (r.filas || []).map(function(f){ return { lbl: f.lbl, val: f.val, marca: f.marca } }),
      clinica: (r.clinica || []).map(function(f){ return { lbl: f.lbl, marca: f.marca,
        clave: f.ctrl ? f.ctrl.clave : null,
        ops: f.ctrl ? f.ctrl.ops.map(function(o){ return o.v + '|' + o.t }) : null,
        nota: String(f.nota || '') } }),
      bloques: (r.bloques || []).map(function(b){ return { tit: b.tit,
        lineas: (b.lineas || []).map(function(l){ return typeof l === 'string' ? l : l.txt }) } }) } }
    catch (e) { return 'EXC: ' + e.message } },

  /* La fila nueva, PINTADA: su celda, sus tres botones y su detalle plegable (el circulo-i). */
  hfPintado(pares) { try {
    /* Las respuestas se contestan DENTRO de esta misma apertura: abrir el panel las borra, asi
       que leerlo despues de contestarlo por otra puerta da cero botones sobre una fila que si
       se pinta. */
    if (pares && pares.length) window.__W.respMulti(pares);
    else if (typeof indicAbrir === 'function') indicAbrir();
    var c = document.getElementById('indic-cuerpo');
    if (!c) return 'NO EXISTE indic-cuerpo';
    var bs = c.querySelectorAll('[data-ind-clin="hfpeff.p3res"]');
    var fila = bs.length ? bs[0].closest('tr') : null;
    var det = fila ? fila.querySelectorAll('details[data-ind-info]') : [];
    var o = { nBotones: bs.length,
              rotulos: Array.prototype.map.call(bs, function(b){ return (b.textContent || '').trim() }),
              presionados: Array.prototype.map.call(bs, function(b){ return b.getAttribute('aria-pressed') }),
              hayFila: !!fila,
              lbl: fila ? (fila.children[0] ? (fila.children[0].textContent || '').trim() : null) : null,
              nDetalles: det.length,
              detalleAbierto: det.length ? !!det[0].open : null,
              detalleTxt: det.length ? (det[0].textContent || '').replace(/\\s+/g, ' ').trim() : null,
              altoFila: fila ? Math.round(fila.getBoundingClientRect().height) : null,
              nInfoPanel: c.querySelectorAll('details[data-ind-info]').length };
    /* Texto completo del panel, para buscar las lineas visibles con su folio. */
    o.textoPanel = (c.textContent || '').replace(/\\s+/g, ' ').trim();
    if (typeof indicCerrar === 'function') indicCerrar();
    return o }
    catch (e) { try { if (typeof indicCerrar === 'function') indicCerrar() } catch (e2) {}
      return 'EXC: ' + e.message } },

  /* Recorte y desborde sobre los nodos del ETT avanzado y del panel. */
  recortes(sel) { try {
    var o = [];
    Array.prototype.forEach.call(document.querySelectorAll(sel), function(e){
      var r = e.getBoundingClientRect();
      if (!r.width && !r.height) { o.push({ sel: e.id || e.className, cero: true }); return }
      if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)
        o.push({ sel: e.id || e.className, sw: e.scrollWidth, cw: e.clientWidth,
                 sh: e.scrollHeight, ch: e.clientHeight });
    });
    return { n: document.querySelectorAll(sel).length, recortados: o } }
    catch (e) { return 'EXC: ' + e.message } }
};
`);

  /* Quinto template: el motor de escenas. Va aparte para no reabrir el bloque de arriba. */
  await evCrudo(`
/* ⚠️ CONTESTA VARIAS PREGUNTAS EN UNA SOLA APERTURA DEL PANEL, y es obligatorio: indicAbrir()
   llama a _indClinLimpiar() SIEMPRE -no solo al abrir desde cerrado-, asi que dos llamadas
   seguidas a evidResp borran la primera respuesta. La sonda medía «no hay boton con clave
   hfpeff.p3res» sobre un panel que ella misma acababa de vaciar: un denominador roto con pinta
   de hallazgo. El repintado que dispara cada clic NO borra, asi que basta con abrir una vez y
   volver a buscar el boton despues de cada clic, porque el nodo anterior ya no existe. */
window.__W.respMulti = function(pares){
  try {
    if (typeof indicAbrir === 'function') indicAbrir();
    var hechos = [];
    (pares || []).forEach(function(par){
      var c = document.getElementById('indic-cuerpo');
      if (!c) { hechos.push(par[0] + ':SIN CUERPO'); return }
      var b = c.querySelector('[data-ind-clin="' + par[0] + '"][data-ind-val="' + par[1] + '"]');
      if (!b) { hechos.push(par[0] + '=' + par[1] + ':NO HAY BOTON'); return }
      b.click(); hechos.push(par[0] + '=' + par[1] + ':ok');
    });
    return hechos }
  catch (e) { return 'EXC: ' + e.message } };

window.__W.opciones = function(id){ var e = document.getElementById(id);
  if (!e) return 'NO EXISTE';
  if (e.tagName !== 'SELECT') return e.tagName + ':' + e.type;
  return Array.prototype.map.call(e.options, function(o){ return o.value }) };

/* MUEVE una lista de campos SIN saber sus valores de antemano: un select pasa a la primera
   opcion distinta de la que tiene, un numero al que se le pasa, una casilla se invierte.
   Devuelve que se movio y que no, porque un campo que no se movio es un denominador vacio y
   tiene que verse en el reporte, no esconderse detras de un total. */
window.__W.mover = function(ids){
  var movidos = [], quietos = [];
  (ids || []).forEach(function(id){
    var e = document.getElementById(id);
    if (!e) { quietos.push(id + ':NO EXISTE'); return }
    var antes = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    if (e.tagName === 'SELECT') {
      var cand = null;
      for (var i = 0; i < e.options.length; i++)
        if (e.options[i].value !== e.value && e.options[i].value !== '') { cand = e.options[i].value; break }
      if (cand === null) { quietos.push(id + ':SIN OTRA OPCION'); return }
      e.value = cand;
    } else if (e.type === 'checkbox') { e.checked = !e.checked }
    else {
      var n = parseFloat(e.value);
      e.value = isNaN(n) ? '12' : String(Math.round((n + 7) * 10) / 10);
    }
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    var dsp = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    if (dsp === antes) { quietos.push(id + ':NO QUEDO'); return }
    movidos.push(id + ': ' + antes + ' -> ' + dsp);
  });
  return { movidos: movidos, quietos: quietos } };

/* La escena base: lo minimo para que varios modulos tengan algo que decir. */
/* Vacia una lista de campos con los eventos que la app escucha. */
window.__W.vaciar = function(ids){
  var hechos = [];
  (ids || []).forEach(function(id){ var e = document.getElementById(id); if (!e) return;
    if (e.type === 'checkbox') e.checked = false; else e.value = '';
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    hechos.push(id) });
  return hechos };

window.__W.base = function(){
  return window.__W.sembrar({ edad:'70', peso:'70', talla:'170', fevi:'60',
    onda_e:'90', e_sep:'6', e_lat:'8', ai_vol:'60', ddfvi:'45', siv:'10', ppvi:'10',
    vmax_it:'2.5', hf_ntprobnp:'150', tapse:'22', vd_bas:'38',
    'ett-septo':'10', 'ett-pp':'10', 'hemo-gc':'5', 'co_fevi_actual':'60',
    'wilkins_movilidad':'1', 'wilkins_engrosamiento':'1', 'oai_lobulos':'2' }) };
`);

  /* Los campos de los que depende cada modulo, para moverlos uno por uno. Una lista vacia se
     informa como tal: no se la hace pasar por una medicion. */
  const DEP = {
    ett:   ['ett-septo','ett-pp','ett-ee','ett-tapse','ett-sgl','ett-apice'],
    alg:   ['alg-motivo','alg-ett-score'],
    hemo:  ['diam_tsvi','itv_tsvi','hemo_fc','hemo_pam','pmad'],
    hfpeff:['e_sep','e_lat','onda_e','ai_vol','hf_ntprobnp'],
    htp:   ['vmax_it'],
    tep:   ['tep_mcconnell','tep_signo6060','tep_tabique_d','tep_vdvi'],
    vexus: ['vexus_ir','vexus_pv','vexus_sh'],
    etem:  ['ete_lva','ete_lvp','ete_diam_anular','ete_area_mitral'],
    teer:  ['teer_area_mitral','teer_gap','teer_ancho_flail'],
    wilk:  ['wilkins_movilidad','wilkins_engrosamiento','wilkins_calcificacion','wilkins_subvalvular'],
    oai:   ['oai_lobulos','oai_morfologia','oai_trombo'],
    aoete: ['ao_grado_atero','ao_movilidad_placa','ao_calcificacion','ao_ulceracion'],
    dpt:   ['pericardio','dpt_swinging','dpt_col_ad','dpt_col_vd'],
    cvr:   ['cvr_rebote','cvr_hepatico','cvr_pericardio_tc'],
    pop:   ['pop_picco_ic','pop_asist_tipo'],
    conco: ['co_fevi_actual','co_gls_actual'],
    pulm:  ['pua_desliz','pua_lineasb','pua_derrame']
  };
  /* PRECONDICIONES: lo que hay que cargar ANTES de integrar para que la compuerta `hayDatos`
     de ese modulo deje pasar. Sin esto, tres modulos -teer, pop y pulm- se median SIN HABER
     SIDO INTEGRADOS y el resultado salia «no coincide» sobre un textarea vacio: un denominador
     roto con pinta de hallazgo. */
  const PRE = {
    teer: { mover: ['teer_tipo_im','teer_area_mitral','teer_fevi','teer_gap','teer_ancho_flail'] },
    /* El boton de POP NACE `disabled` y lo habilita `popSync()`: sin esta llamada el clic no
       hace nada y el modulo se media SIN INTEGRAR. */
    pop:  { sembrar: { pop_monitor:'picco', pop_picco_ic:'2.2', pop_picco_svri:'1600' }, js: 'popSync()' },
    pulm: { mover: ['pua_desliz','pua_lineasa','pua_derrame'] },
    /* Los seis parametros del perfil hemodinamico son DERIVADOS: sin el diametro y el VTI del
       TSVI, la frecuencia, la PAM y la presion auricular derecha no hay ningun numero que
       publicar, y el bloque dice lo mismo antes y despues -o sea, sin denominador. */
    hemo: { sembrar: { diam_tsvi:'20', itv_tsvi:'18', hemo_fc:'70', hemo_pam:'80', pmad:'5' } }
  };
  const CLAVES = Object.keys(DEP);

  /* == GRUPO inv — AJ3-1, EL INVENTARIO ====================================================== */
  if (corre('inv')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      r.registro = await ev(`window.__W.registro()`);
      r.opciones = {};
      for (const k of CLAVES) r.opciones[k] = await ev(`(${JSON.stringify(DEP[k])}).map(function(i){ return i + ' => ' + JSON.stringify(window.__W.opciones(i)) })`);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.inv = r;
    process.stderr.write('[inv] listo\n');
  }

  /* == GRUPO diag — por que un modulo no deja integrarse ==================================== */
  if (corre('diag')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      r.base = await ev(`window.__W.base()`);
      r.pre  = await ev(`window.__W.sembrar({ pop_monitor:'picco', pop_picco_ic:'2.2', pop_picco_svri:'1600' })`, 40000);
      r.lectura = await ev(`(function(){ return { mon: (document.getElementById('pop_monitor')||{}).value,
        ic: (document.getElementById('pop_picco_ic')||{}).value,
        svri: (document.getElementById('pop_picco_svri')||{}).value,
        bsa: (typeof getBSA === 'function') ? getBSA() : 'SIN FN' } })()`);
      r.patron = await ev(`(function(){ try { var x = popPatron();
        return { suficiente: x.suficiente, ic: x.ic, icBanda: x.icBanda, icFuente: x.icFuente,
                 icFuera: x.icFuera, motivo: x.motivo, pat: x.pat && x.pat.lbl } }
        catch (e) { return 'EXC: ' + e.message } })()`, 40000);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.diag = r;
    process.stderr.write('[diag] listo\n');
  }

  /* == GRUPO auto — AJ3-2a: EL BLOQUE SIGUE AL DATO ==========================================
     Modulo por modulo: escena base, integrar, FOTO; mover los campos de los que depende,
     barrer, FOTO. Las dos condiciones son `genCambio` -el DENOMINADOR, sin el cual todo pasa-
     y `igualDespues` -el bloque dice lo mismo que la app-. */
  if (corre('auto')) {
    const r = { modulos: {} };
    try {
      for (const k of CLAVES) {
        const m = {};
        try {
          await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
          m.base = await ev(`window.__W.base()`);
          if (PRE[k] && PRE[k].sembrar) m.pre = await ev(`window.__W.sembrar(${JSON.stringify(PRE[k].sembrar)})`, 40000);
          if (PRE[k] && PRE[k].mover)   m.pre = await ev(`window.__W.mover(${JSON.stringify(PRE[k].mover)})`, 40000);
          if (PRE[k] && PRE[k].js)      m.preJs = await ev(`(function(){ try { ${PRE[k].js}; return 'ok' } catch (e) { return 'EXC: ' + e.message } })()`, 40000);
          m.botonHabilitado = await ev(`(function(){ var b = document.querySelector('[data-am-k="${k}"]'); return b ? !b.disabled : 'SIN BOTON' })()`);
          m.integrar = await ev(`window.__Y.integrar(${JSON.stringify(k)})`, 40000);
          m.antes = await ev(`window.__W.bloque(${JSON.stringify(k)})`, 40000);
          m.mover = await ev(`window.__W.mover(${JSON.stringify(DEP[k])})`, 40000);
          m.barrer = await ev(`window.__W.barrer()`, 40000);
          m.despues = await ev(`window.__W.bloque(${JSON.stringify(k)})`, 40000);
          m.genCambio = (m.antes && m.despues) ? (String(m.antes.gen) !== String(m.despues.gen)) : null;
          m.igualDespues = m.despues ? m.despues.igual : null;
        } catch (e) { m.err = e.message; }
        r.modulos[k] = m;
        process.stderr.write('  [auto] ' + k + ' gen=' + m.genCambio + ' igual=' + m.igualDespues + '\n');
      }
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.auto = r;
    process.stderr.write('[auto] listo\n');
  }

  /* == GRUPO edit — AJ3-2b / 2c / 2d ==========================================================
     Sobre HTP, que es el modulo de la prueba que destapo el defecto. Siete momentos:
       1. integrado y sin tocar  -> sigue al dato (ya medido en `auto`, se repite el ancla);
       2. editado a mano          -> la marca aparece y el aviso NO, porque nada cambio todavia;
       3. cambia un dato          -> el texto NO se pisa y el aviso SI aparece, en los dos lugares;
       4. reintegrar diciendo NO  -> no pasa nada;
       5. reintegrar diciendo SI  -> se regenera y el aviso se va;
       6. editar y guardar        -> la marca viaja en `am-editados`;
       7. limpiar y reabrir       -> la marca vuelve y el texto sigue sin pisarse. */
  if (corre('edit')) {
    const r = {};
    const K = 'htp';
    const MANO = 'EDITADO A MANO POR EL MEDICO - no me pises';
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      r.base = await ev(`window.__W.base()`);
      r.integrar = await ev(`window.__Y.integrar(${JSON.stringify(K)})`);
      r.m1_integrado = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);

      r.m2_editar = await ev(`window.__W.editarAMano(${JSON.stringify(K)}, ${JSON.stringify(MANO)})`);
      r.m2_estado = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);

      r.m3_mover = await ev(`window.__W.mover(["vmax_it"])`, 40000);
      await ev(`window.__W.barrer()`, 40000);
      r.m3_estado = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);
      r.m3_textoIntacto = r.m3_estado && r.m3_estado.txt === MANO;

      r.m4_reintegrarNO = await ev(`window.__W.reintegrar(${JSON.stringify(K)}, false)`, 40000);
      r.m4_estado = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);

      r.m5_reintegrarSI = await ev(`window.__W.reintegrar(${JSON.stringify(K)}, true)`, 40000);
      r.m5_estado = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);

      /* CONTROL NEGATIVO: sobre un bloque SIN editar, el mismo boton tiene que RETIRAR, que es
         el atajo de siempre, y NO puede pedir confirmacion. Sin esto, «pide confirmacion» lo
         cumpliria tambien una app que la pide siempre. */
      r.ctrlNeg_reintegrar = await ev(`window.__W.reintegrar(${JSON.stringify(K)}, false)`, 40000);
      r.ctrlNeg_estado = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);
      r.ctrlNeg_volver = await ev(`window.__Y.integrar(${JSON.stringify(K)})`, 40000);

      r.m6_editar = await ev(`window.__W.editarAMano(${JSON.stringify(K)}, ${JSON.stringify(MANO)})`);
      r.m6_estado = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);

      r.m7_reabrir = await ev(`window.__W.guardarYReabrir()`, 60000);
      r.m7_estado = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);
      r.m7_mover = await ev(`window.__W.mover(["vmax_it"])`, 40000);
      await ev(`window.__W.barrer()`, 40000);
      r.m7_trasMover = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);
      r.m7_textoIntacto = r.m7_trasMover && r.m7_trasMover.txt === MANO;

      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.edit = r;
    process.stderr.write('[edit] listo\n');
  }

  /* == GRUPO vacio — AJ3-2e: LOS DOS CASOS NO DECIDIDOS =======================================
     (1) el medico borra TODOS los datos del modulo: se mide sobre uno de los ocho que ya
         retiraban solos (hfpeff) y sobre uno de los nueve que lo estrenan (htp).
     (2) el PDF al exportar con un bloque editado y desfasado: se mide si avisa algo. */
  if (corre('vacio')) {
    const r = {};
    try {
      for (const K of CLAVES) {
        const m = {};
        await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
        m.base = await ev(`window.__W.base()`);
        if (PRE[K] && PRE[K].sembrar) await ev(`window.__W.sembrar(${JSON.stringify(PRE[K].sembrar)})`, 40000);
        if (PRE[K] && PRE[K].mover)   await ev(`window.__W.mover(${JSON.stringify(PRE[K].mover)})`, 40000);
        if (PRE[K] && PRE[K].js)      await ev(`(function(){ try { ${PRE[K].js}; return 'ok' } catch (e) { return 'EXC: ' + e.message } })()`, 40000);
        m.integrar = await ev(`window.__Y.integrar(${JSON.stringify(K)})`, 40000);
        m.antes = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);
        /* BORRAR SOLO LOS CAMPOS DE ESE MODULO, no el estudio entero: «Nuevo estudio» retira
           los diecisiete por diseno y no mide nada de este caso. */
        m.borrar = await ev(`window.__W.vaciar(${JSON.stringify(DEP[K])})`, 40000);
        await ev(`window.__W.barrer()`, 40000);
        m.despues = await ev(`window.__W.bloque(${JSON.stringify(K)})`, 40000);
        m.genVacio = m.despues ? String(m.despues.gen || '').trim() === '' : null;
        m.sigueIntegrado = m.despues ? m.despues.integrado : null;
        r['vaciar_' + K] = m;
        process.stderr.write('  [vacio] ' + K + ' genVacio=' + m.genVacio + ' integrado=' + m.sigueIntegrado + '\n');
      }
      /* (2) PDF con un bloque editado y desfasado. */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      r.pdf_base = await ev(`window.__W.base()`);
      r.pdf_integrar = await ev(`window.__Y.integrar("htp")`, 40000);
      r.pdf_editar = await ev(`window.__W.editarAMano("htp", "TEXTO VIEJO EDITADO A MANO")`);
      await ev(`window.__W.mover(["vmax_it"])`, 40000);
      await ev(`window.__W.barrer()`, 40000);
      r.pdf_estado = await ev(`window.__W.bloque("htp")`, 40000);
      r.pdf = await ev(`(function(){ var p = window.__P.pdf();
        return { err: p.err, nTextos: p.nTextos,
                 avisa: p.textos.filter(function(t){ var n = String(t).toLowerCase();
                   if (n.indexOf('texto viejo') >= 0) return false;   /* el bloque mismo no es un aviso */
                   return n.indexOf('desactualiz') >= 0 || n.indexOf('sin actualizar') >= 0 ||
                          n.indexOf('edicion') >= 0 || n.indexOf('edición') >= 0 ||
                          n.indexOf('cambiaron') >= 0 || n.indexOf('revisa este bloque') >= 0 }),
                 trae: p.textos.filter(function(t){ return String(t).indexOf('TEXTO VIEJO') >= 0 }) } })()`, 90000);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.vacio = r;
    process.stderr.write('[vacio] listo\n');
  }

  /* == GRUPO hf — AJ3-3: EL RESULTADO DEL PASO 3 =============================================
     Escena de puntaje INTERMEDIO (4/6), que es la unica en que la guia manda al paso 3 — la
     misma siembra de TC-58. Siete momentos: sin contestar el paso 3, «Pendiente», «Realizada»
     sin resultado, y los tres resultados; mas la presion de llenado en sus tres estados. */
  if (corre('hf')) {
    const r = {};
    const MEDIO = { edad:'70', peso:'70', talla:'170', fevi:'60', onda_e:'90',
      e_sep:'6', e_lat:'8', ai_vol:'60', ddfvi:'45', siv:'10', ppvi:'10',
      vmax_it:'2.5', hf_ntprobnp:'150' };
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      r.siembra = await ev(`window.__W.sembrar(${JSON.stringify(MEDIO)})`, 40000);
      r.score = await ev(`(function(){ try { var x = hfapeffScore(false);
        return { total: x.total, completo: x.completo, fa: x.fa } } catch (e) { return 'EXC: ' + e.message } })()`);

      r.sinContestar = await ev(`window.__W.hf()`, 40000);
      r.pendiente_resp = await ev(`window.__Y.evidResp('hfpeff.paso3','pendiente')`, 40000);
      r.pendiente = await ev(`window.__W.hf()`, 40000);
      r.realizada_resp = await ev(`window.__Y.evidResp('hfpeff.paso3','hecha')`, 40000);
      r.realizadaSinResultado = await ev(`window.__W.hf()`, 40000);
      r.realizadaPintado = await ev(`window.__W.hfPintado([['hfpeff.paso3','hecha']])`, 40000);

      /* ⚠️ ABRIR O CERRAR EL PANEL BORRA TODAS LAS RESPUESTAS CLINICAS -es su diseno, esta
         escrito en `_indClin`-, asi que el paso 3 se vuelve a contestar ANTES de cada
         resultado y la lectura PINTADA va al final de cada vuelta. Sin esto la sonda medía
         «no hay boton» sobre un panel que acababa de vaciarse ella misma. */
      for (const v of ['positivo', 'negativo', 'noconcl']) {
        r['resp_' + v] = await ev(`window.__W.respMulti([['hfpeff.paso3','hecha'],['hfpeff.p3res',${JSON.stringify(v)}]])`, 40000);
        r['res_' + v] = await ev(`window.__W.hf()`, 40000);
        r['pint_' + v] = await ev(`window.__W.hfPintado([['hfpeff.paso3','hecha'],['hfpeff.p3res',${JSON.stringify(v)}]])`, 40000);
      }

      /* La presion de llenado en sus tres estados, con el resultado ya contestado. */
      for (const v of ['elevada', 'normal', 'no_medida']) {
        r['pll_resp_' + v] = await ev(`window.__W.respMulti([['hfpeff.paso3','hecha'],['hfpeff.p3res','positivo'],['hfpeff.pll',${JSON.stringify(v)}]])`, 40000);
        r['pll_' + v] = await ev(`window.__W.hf()`, 40000);
      }

      /* CONTROL NEGATIVO 1: con el paso 3 en «Pendiente» la fila del resultado NO EXISTE. */
      r.ctrlNeg_resp = await ev(`window.__W.respMulti([['hfpeff.paso3','pendiente']])`, 40000);
      r.ctrlNeg_pendiente = await ev(`window.__W.hf()`, 40000);
      r.ctrlNeg_pintado = await ev(`window.__W.hfPintado([['hfpeff.paso3','pendiente']])`, 40000);

      /* CONTROL NEGATIVO 2: el resultado NO toca el informe, el EN SUMA ni el puntaje. */
      await ev(`window.__W.respMulti([['hfpeff.paso3','hecha']])`, 40000);
      r.ctrl_infSinResultado = await ev(`window.__Y.salida()`, 60000);
      r.ctrl_scoreSinResultado = await ev(`(function(){ var x = hfapeffScore(false); return x.total })()`);
      r.ctrl_pdfSinResultado = await ev(`window.__Y.hfPdf()`, 40000);
      await ev(`window.__W.respMulti([['hfpeff.paso3','hecha'],['hfpeff.p3res','positivo']])`, 40000);
      r.ctrl_infConResultado = await ev(`window.__Y.salida()`, 60000);
      r.ctrl_scoreConResultado = await ev(`(function(){ var x = hfapeffScore(false); return x.total })()`);
      r.ctrl_pdfConResultado = await ev(`window.__Y.hfPdf()`, 40000);

      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.hf = r;
    process.stderr.write('[hf] listo\n');
  }

  /* == GRUPO ctrl — EL A/B DE CONTROL ========================================================= */
  if (corre('ctrl')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      r.vacio = {
        salida: await ev(`window.__Y.salida()`, 60000),
        campos: await ev(`window.__Y.campos()`),
        excelN: await ev(`window.__Y.excelN()`),
        pdf:    await ev(`(function(){ var p = window.__P.pdf(); return { err:p.err, nTextos:p.nTextos, nFigs:p.nFigs, hash:(function(){ var t=p.textos.join(String.fromCharCode(1)), n=0; for (var i=0;i<t.length;i++) n=((n<<5)-n+t.charCodeAt(i))|0; return n })() } })()`, 90000)
      };
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      const AJENO = { peso:'70', talla:'170', edad:'62', fevi:'45', ddfvi:'58', dsfvi:'40',
        siv:'12', ppvi:'11', ai_vol:'80', onda_e:'90', onda_a:'60', e_sep:'5', e_lat:'7',
        im_vc:'8', ia_vc:'3', tapse:'22', vd_bas:'38' };
      r.ajenoSiembra = await ev(`window.__W.sembrar(${JSON.stringify(AJENO)})`, 60000);
      r.ajeno = {
        salida: await ev(`window.__Y.salida()`, 60000),
        campos: await ev(`window.__Y.campos()`),
        excelN: await ev(`window.__Y.excelN()`),
        pdf:    await ev(`(function(){ var p = window.__P.pdf(); return { err:p.err, nTextos:p.nTextos, nFigs:p.nFigs, hash:(function(){ var t=p.textos.join(String.fromCharCode(1)), n=0; for (var i=0;i<t.length;i++) n=((n<<5)-n+t.charCodeAt(i))|0; return n })() } })()`, 90000)
      };
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.ctrl = r;
    process.stderr.write('[ctrl] listo\n');
  }

  /* == GRUPO maq — DOS ANCHOS POR DOS TEMAS ==================================================
     El centinela es el nodo en 0x0, que es como se ve un <div> sin cerrar, y el scroll
     horizontal de la pagina. Se mide con el ETT avanzado VISIBLE y con el panel ABIERTO: sin
     eso, «cero recortes» sale sobre nodos que no estan dibujados. */
  if (corre('maq')) {
    const r = { escenas: {} };
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.despejar()`);
      await ev(`window.__W.base()`, 40000);
      /* La escena de puntaje INTERMEDIO, que es la unica en que la seccion del HFA-PEFF pinta
         la fila nueva. Sin ella el panel se mide sin la fila que esta tanda agrega. */
      await ev(`window.__W.sembrar({ edad:'70', fevi:'60', onda_e:'90', e_sep:'6', e_lat:'8',
        ai_vol:'60', ddfvi:'45', siv:'10', ppvi:'10', vmax_it:'2.5', hf_ntprobnp:'150' })`, 40000);
      await ev(`window.__Y.integrar("htp")`, 40000);
      await ev(`window.__Y.integrar("hfpeff")`, 40000);
      await ev(`window.__W.editarAMano("htp", "EDITADO")`);
      await ev(`window.__W.mover(["vmax_it"])`, 40000);
      await ev(`window.__W.barrer()`, 40000);
      /* ⚠️ LA TARJETA DEL ETT AVANZADO VIVE EN LA PESTANA «INFORME», Y SIN TRAERLA AL FRENTE
         LOS DIECISIETE BLOQUES MIDEN 0x0: «cero recortes» sale sobre nodos que no estan
         dibujados, que es el denominador vacio que este repo ya pago dos veces. */
      r.tab = await ev(`(function(){ try { if (typeof showTab === 'function') showTab('informe');
        var c = document.getElementById('amilo-card');
        return c ? { display: c.style.display, alto: Math.round(c.getBoundingClientRect().height) } : 'SIN CARD' }
        catch (e) { return 'EXC: ' + e.message } })()`, 40000);
      for (const w of [1440, 390]) {
        for (const claro of [false, true]) {
          await viewport(w, 900);
          await ev(`window.__P.tema(${claro})`);
          await pausa(320);
          const key = w + (claro ? '-claro' : '-oscuro');
          r.escenas[key] = {
            scrollH: await ev(`window.__Y.scrollH()`),
            wraps:   await ev(`window.__W.recortes('.am-wrap')`, 40000),
            stale:   await ev(`window.__W.recortes('.am-stale')`, 40000),
            aviso:   await ev(`window.__W.bloque("htp")`, 40000),
            panelPre: await ev(`window.__W.respMulti([['hfpeff.paso3','hecha'],['hfpeff.p3res','noconcl']])`, 40000),
            panel:   await ev(`(function(){
                       var c = document.getElementById('indic-cuerpo');
                       var o = { hay: !!c };
                       if (c) { var r2 = c.getBoundingClientRect();
                         o.w = Math.round(r2.width); o.h = Math.round(r2.height);
                         o.desborda = c.scrollWidth > c.clientWidth + 1;
                         /* Se miden las TRES botoneras del HFA-PEFF, no solo la nueva: sin la
                            comparacion, un ancho raro en la fila nueva parece de esta tanda
                            cuando puede ser de todas. */
                         o.filas = {};
                         ['hfpeff.paso3','hfpeff.p3res','hfpeff.pll','im.mecanismo'].forEach(function(cl){
                           var bs = c.querySelectorAll('[data-ind-clin="' + cl + '"]');
                           o.filas[cl] = Array.prototype.map.call(bs, function(b){ var q = b.getBoundingClientRect();
                             return (b.textContent||'').trim() + ' ' + Math.round(q.width) + 'x' + Math.round(q.height) }) });
                         var bs = c.querySelectorAll('[data-ind-clin="hfpeff.p3res"]');
                         o.nBotones = bs.length;
                         o.botones = Array.prototype.map.call(bs, function(b){ var q = b.getBoundingClientRect();
                           return { t: (b.textContent||'').trim(), w: Math.round(q.width), h: Math.round(q.height) } }); }
                       if (typeof indicCerrar === 'function') indicCerrar();
                       return o })()`, 60000)
          };
        }
      }
      await viewport(1440, 900); await ev(`window.__P.tema(false)`);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.maq = r;
    process.stderr.write('[maq] listo\n');
  }

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  process.stdout.write(JSON.stringify(OUT, null, 1));
  cdp.close(); srv.close(); process.exit(0);
}

main().catch(async (e) => {
  process.stdout.write(JSON.stringify({ err: e.message, stack: String(e.stack || '').slice(0, 1200) }, null, 1));
  process.exit(1);
});
