#!/usr/bin/env node
/**
 * _probe_aj4.mjs - sonda A/B de SOLO LECTURA para la tanda AJ4, 2026-10-23.
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
  /* ══ HELPERS PROPIOS DE LA AJ5 ════════════════════════════════════════════════════════════
     ADVERTENCIA: sin acentos graves adentro, tampoco en los comentarios. */
  await evCrudo(`
window.__Y = {
  /* La fila de tres campos: su geometria, la del boton y la de la pastilla entera. */
  filaGeo() {
    var o = {};
    var fila = document.querySelector('#tab-valvulas .valv-morf-row--tres');
    if (!fila) return { err: 'NO EXISTE la fila --tres' };
    var fr = fila.getBoundingClientRect();
    o.fila = { w: Math.round(fr.w || fr.width), h: Math.round(fr.height) };
    o.campos = [];
    Array.prototype.forEach.call(fila.children, function(c){
      if (!c.classList || !c.classList.contains('fg')) return;
      var r = c.getBoundingClientRect();
      var lab = c.querySelector('label'), s = c.querySelector('select');
      o.campos.push({ id: s ? s.id : null, rot: lab ? (lab.textContent||'').trim() : null,
                      w: Math.round(r.width), h: Math.round(r.height),
                      x: Math.round(r.left), y: Math.round(r.top),
                      selW: s ? Math.round(s.getBoundingClientRect().width) : null,
                      ovf: s ? (s.scrollWidth > s.clientWidth + 1) : null });
    });
    var b = document.getElementById('pill-insuf-mitral');
    o.boton = b ? { w: Math.round(b.getBoundingClientRect().width) } : 'NO EXISTE';
    var wrap = b ? b.closest('.valv-btn-wrap') : null;
    o.pastilla = wrap ? { w: Math.round(wrap.getBoundingClientRect().width) } : 'NO EXISTE';
    /* Cuantas FILAS visuales hay: se cuentan los distintos top. */
    /* LEGIBILIDAD MEDIDA Y NO ESTIMADA: el ancho del TEXTO de cada opcion con la tipografia
       real del select, contra el ancho interior del select menos la flecha. scrollWidth de un
       select NO sirve -Chrome devuelve el del control, no el de la opcion- y por eso daba
       ovf:false sobre un rotulo recortado. */
    o.legible = (function(){
      var sel = fila.querySelector('#vm_morf'); if (!sel) return 'NO EXISTE vm_morf';
      var cs = getComputedStyle(sel);
      var cv = document.createElement('canvas').getContext('2d');
      cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var util = sel.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0) - 18;
      var r = { utilPx: Math.round(util), ops: {} };
      Array.prototype.forEach.call(sel.options, function(op){
        var w = cv.measureText(op.text).width;
        r.ops[op.text] = { px: Math.round(w), cabe: w <= util };
      });
      return r })();
    var tops = {}; o.campos.forEach(function(c){ tops[c.y] = 1 });
    o.filasVisuales = Object.keys(tops).length;
    o.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    return o },

  /* Los tres pares, leidos de los dos lados a la vez. */
  pares() {
    return { vm_morf: window.__P.val('vm_morf'), ete_etiologia: window.__P.val('ete_etiologia'),
             vm_tipo_im: window.__P.val('vm_tipo_im'), teer_tipo_im: window.__P.val('teer_tipo_im'),
             vm_carp: window.__P.val('vm_carp'), ete_carpentier: window.__P.val('ete_carpentier'),
             vm_carpentier: window.__P.val('vm_carpentier'),
             efMec: (typeof vmTipoIMEfectivo === 'function') ? vmTipoIMEfectivo() : 'SIN FN',
             efCarp: (typeof vmCarpEfectivo === 'function') ? vmCarpEfectivo() : 'SIN FN' } },

  /* Las dos listas que la orden manda comparar. */
  listas() {
    var ops = function(id){ var e = document.getElementById(id);
      return e ? Array.prototype.slice.call(e.options).map(function(o){ return o.value || o.text }) : null };
    return { vm_morf: ops('vm_morf'), ete_etiologia: ops('ete_etiologia'),
             vm_tipo_im: ops('vm_tipo_im'), teer_tipo_im: ops('teer_tipo_im'),
             vm_carp: ops('vm_carp'), ete_carpentier: ops('ete_carpentier'),
             vm_carpentier: ops('vm_carpentier'),
             pares: (typeof _ETE_VM_PARES !== 'undefined') ? _ETE_VM_PARES : 'SIN CONST' } },

  /* La frase del corte alternativo y el recuadro de reparabilidad. */
  efectos() {
    return { secAlt: window.__P.txt('im-sec-alt'), repar: window.__P.txt('ete-reparabilidad'),
             reparFte: window.__P.txt('ete-repar-fuente'),
             imGrado: window.__P.val('im_grado'),
             esSec: (typeof imEsSecundariaIM === 'function') ? !!imEsSecundariaIM() : 'SIN FN',
             mec: (typeof imMecanismoIM === 'function') ? (imMecanismoIM() || '') : 'SIN FN' } },

  /* El strain del VD: su categoria pintada y la del dueno. */
  strain() {
    return { val: window.__P.val('vd_strain_pl'),
             grado: window.__P.txt('vd_strain_pl-grado'),
             cat: (typeof vdStrainPlCat === 'function') ? vdStrainPlCat(window.__P.val('vd_strain_pl')) : 'SIN FN',
             tapse: window.__P.val('tapse'), sprime: window.__P.val('s_prime'), fevd: window.__P.val('fevd'),
             disfG: (typeof vdDisfGrado === 'function') ? vdDisfGrado(window.__P.val('tapse'), window.__P.val('s_prime')) : 'SIN FN' } },

  /* Los tres estilos de una vez, para no repetir el gesto tres veces por escena. */
  tresEstilos() {
    var o = {};
    ['conciso','estandar','narrativo'].forEach(function(e){ o[e] = window.__P.informe(e) });
    return o },

  poner(campos) {
    var puestos = {}, err = [];
    Object.keys(campos || {}).forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { err.push('NO EXISTE ' + id); return; }
      if (e.tagName === 'SELECT') {
        var r = window.__P.sel(id, campos[id]);
        if (r && r.err) { err.push(id + ': ' + r.err); return; }
      } else {
        e.value = campos[id];
        e.dispatchEvent(new Event('input', { bubbles: true }));
        e.dispatchEvent(new Event('change', { bubbles: true }));
      }
      puestos[id] = e.value;
    });
    try { if (typeof _recalcModulos === 'function') _recalcModulos('aj5') } catch (e) {}
    return { puestos: puestos, err: err } },

  errores() { return (window.__Yerr || []).slice() }
};
`);

  /* == GRUPO fila — AJ5-1: LA FILA DE TRES CAMPOS ============================================ */
  if (corre('fila')) {
    const r = {};
    try {
      await ev(`window.__P.abrirPara('vm_morf')`);
      r.g1440 = await ev(`window.__Y.filaGeo()`);
      /* Con las opciones LARGAS puestas, que es donde se recorta. */
      await ev(`window.__P.sel('vm_morf','Mixomatosa / Barlow')`);
      r.largo1 = await ev(`window.__Y.filaGeo()`);
      await ev(`window.__P.sel('vm_morf','Prolapso / EVMS')`);
      r.largo2 = await ev(`window.__Y.filaGeo()`);
      await ev(`window.__P.sel('vm_morf','Isqu\u00e9mica (disfunci\u00f3n/rotura m\u00fasculo papilar)')`);
      r.largo3 = await ev(`window.__Y.filaGeo()`);
      await ev(`window.__P.sel('vm_morf','Normal')`);
      /* El globo: tarjeta FLOTANTE y no caja fija. */
      r.globo = await ev(`window.__P.qtarj('vm-carp')`);
      r.globoFlota = await ev(`(function(){ var c = document.getElementById('vinfo-card');
        return c ? { pos: getComputedStyle(c).position, dentroDeLaFila:
          !!(c.closest && c.closest('.valv-morf-row--tres')) } : 'NO EXISTE' })()`);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.fila = r;
    process.stderr.write('[fila] listo\n');
  }

  /* == GRUPO sinc — AJ5-2: LOS DOS SENTIDOS, Y EL VIAJE CON EL ESTUDIO ======================= */
  if (corre('sinc')) {
    const r = { listas: null, pasos: [] };
    try {
      r.listas = await ev(`window.__Y.listas()`);
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirPara('vm_morf')`);
      await ev(`window.__P.abrirPara('teer_tipo_im')`);
      await ev(`window.__P.abrirPara('ete_carpentier')`);
      r.pasos.push({ paso: 'inicio', v: await ev(`window.__Y.pares()`) });
      /* Válvulas -> ETE, los tres, con el estudio marcado como ETE para que el Carpentier pase. */
      await ev(`(function(){ var c = document.getElementById('ete-es-ete');
        if (c && !c.checked) { c.checked = true; c.dispatchEvent(new Event('change',{bubbles:true})); }
        return c ? c.checked : 'NO EXISTE' })()`);
      await ev(`window.__P.sel('vm_tipo_im','secundaria')`);
      r.pasos.push({ paso: 'vm_tipo_im=secundaria', v: await ev(`window.__Y.pares()`) });
      await ev(`window.__P.sel('vm_carp','IIIb')`);
      r.pasos.push({ paso: 'vm_carp=IIIb', v: await ev(`window.__Y.pares()`) });
      await ev(`window.__P.sel('vm_morf','Reum\u00e1tica')`);
      r.pasos.push({ paso: 'vm_morf=Reumatica', v: await ev(`window.__Y.pares()`) });
      /* ETE -> Válvulas, los tres. */
      await ev(`window.__P.sel('teer_tipo_im','primaria')`);
      r.pasos.push({ paso: 'teer_tipo_im=primaria', v: await ev(`window.__Y.pares()`) });
      await ev(`window.__P.sel('ete_carpentier','II')`);
      r.pasos.push({ paso: 'ete_carpentier=II', v: await ev(`window.__Y.pares()`) });
      await ev(`window.__P.sel('ete_etiologia','endocarditis')`);
      r.pasos.push({ paso: 'ete_etiologia=endocarditis', v: await ev(`window.__Y.pares()`) });
      /* Guardar, cerrar y reabrir: los campos del estudio y su reposición. */
      r.camposGuardados = await ev(`(function(){ var c = {};
        document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
          if (/^(vm_tipo_im|teer_tipo_im|vm_carp|ete_carpentier|vm_carpentier|vm_morf|ete_etiologia|ete-es-ete)$/.test(e.id))
            c[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '0') : e.value });
        return c })()`);
      const g = r.camposGuardados;
      const campos = { vm_tipo_im: g.vm_tipo_im, teer_tipo_im: g.teer_tipo_im, vm_carp: g.vm_carp,
                       ete_carpentier: g.ete_carpentier, vm_carpentier: g.vm_carpentier,
                       vm_morf: g.vm_morf, ete_etiologia: g.ete_etiologia, 'ete-es-ete__chk': '1' };
      await ev(`window.__P.abrirComoEstudio(${JSON.stringify(campos)})`, 40000);
      await ev(`window.__P.abrirPara('vm_carp')`);
      r.pasos.push({ paso: 'reabierto', v: await ev(`window.__Y.pares()`) });
      /* Y un estudio LEGADO: sólo los nodos del ETE y el Carpentier viejo del cajón. */
      await ev(`window.__P.abrirComoEstudio(${JSON.stringify({ teer_tipo_im: 'secundaria', ete_carpentier: 'IIIa', vm_carpentier: 'Tipo III (restricción)', vm_morf: 'Prolapso / EVMS', 'ete-es-ete__chk': '1' })})`, 40000);
      await ev(`window.__P.abrirPara('vm_carp')`);
      r.pasos.push({ paso: 'legado', v: await ev(`window.__Y.pares()`) });
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.sinc = r;
    process.stderr.write('[sinc] listo\n');
  }

  /* == GRUPO inf — AJ5-3: EL PARÉNTESIS EN LOS TRES ESTILOS ================================== */
  if (corre('inf')) {
    const r = { escenas: {} };
    const BASE = { nombre: 'P', ci: '1' };
    const ESC = {
      /* IM moderada por dos votos (VC 0,45 cm y ORE 25 mm2 via PISA no; se usa el grado manual). */
      dos:      { vm_morf: 'Normal', im_grado: '2', vm_tipo_im: 'secundaria', vm_carp: 'II' },
      soloMec:  { vm_morf: 'Normal', im_grado: '2', vm_tipo_im: 'primaria',  vm_carp: '' },
      soloCarp: { vm_morf: 'Normal', im_grado: '2', vm_tipo_im: '',          vm_carp: 'II' },
      ninguno:  { vm_morf: 'Normal', im_grado: '2', vm_tipo_im: '',          vm_carp: '' },
      protBio:  { vm_morf: 'Prótesis biológica', im_grado: '2', vm_tipo_im: 'secundaria', vm_carp: 'II' },
      protMec:  { vm_morf: 'Prótesis mecánica',  im_grado: '2', vm_tipo_im: 'secundaria', vm_carp: 'II' },
      sinIns:   { vm_morf: 'Normal', im_grado: '',  vm_tipo_im: 'secundaria', vm_carp: 'II' }
    };
    try {
      for (const k of Object.keys(ESC)) {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.calentar()`);
        await ev(`window.__P.abrirPara('vm_carp')`);
        const p = await ev(`window.__Y.poner(${JSON.stringify(Object.assign({}, BASE, ESC[k]))})`);
        const e3 = await ev(`window.__Y.tresEstilos()`, 40000);
        r.escenas[k] = { puesto: p, pares: await ev(`window.__Y.pares()`),
          conciso: (e3.conciso.inf || '').split('\n').filter((l) => /mitral|VM /i.test(l)),
          estandar: (e3.estandar.inf || '').split('\n').filter((l) => /mitral|VM /i.test(l)),
          narrativo: (e3.narrativo.inf || '').split('\n').filter((l) => /mitral|VM /i.test(l)),
          suma: e3.estandar.suma };
      }
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.inf = r;
    process.stderr.write('[inf] listo\n');
  }

  /* == GRUPO efe — AJ5-4: LOS EFECTOS DESDE VÁLVULAS ======================================== */
  if (corre('efe')) {
    const r = { escenas: {} };
    const ESC = {
      /* ORE por PISA: radio y Vmax dan el area; se usa el campo de EROA si existe. */
      /* ORE por PISA, que es de donde sale `_imSecAltEroa`: radio 5 mm, Vmax 5 m/s y el
         Valiasing elegido para que la EROA caiga EXACTAMENTE en 30,0 y en 29,0 mm2.
         EROA = 2*pi*(r/10)^2 * Valias / (Vmax*100) * 100 = 0,31416 * Valias con esos dos. */
      ore30sec: { vm_tipo_im: 'secundaria', pisa_r: '5', pisa_val: '95.5', im_vmax: '5' },
      ore29sec: { vm_tipo_im: 'secundaria', pisa_r: '5', pisa_val: '92.3', im_vmax: '5' },
      ore30pri: { vm_tipo_im: 'primaria',   pisa_r: '5', pisa_val: '95.5', im_vmax: '5' },
      ore30vac: { vm_tipo_im: '',           pisa_r: '5', pisa_val: '95.5', im_vmax: '5' },
      repSec:   { vm_tipo_im: 'secundaria', ete_prof_coapt: '12', ete_altura_tenting: '3.0', ete_angulo_vp: '50' },
      repPri:   { vm_tipo_im: 'primaria',   ete_prof_coapt: '12', ete_altura_tenting: '3.0', ete_angulo_vp: '50' },
      repVac:   { vm_tipo_im: '',           ete_prof_coapt: '12', ete_altura_tenting: '3.0', ete_angulo_vp: '50' }
    };
    try {
      r.campoOre = await ev(`['pisa_r','pisa_val','im_vmax','eroa-val','im_eroa_cont'].map(function(id){
        var e = document.getElementById(id); return id + '=' + (e ? e.tagName : 'NO') }).join(' ')`);
      for (const k of Object.keys(ESC)) {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.calentar()`);
        await ev(`window.__P.abrirPara('vm_tipo_im')`);
        const p = await ev(`window.__Y.poner(${JSON.stringify(ESC[k])})`);
        r.escenas[k] = { puesto: p, eroa: await ev(`window.__P.txt('eroa-val')`),
                         efectos: await ev(`window.__Y.efectos()`) };
      }
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.efe = r;
    process.stderr.write('[efe] listo\n');
  }

  /* == GRUPO str — AJ5-5: EL STRAIN DEL VD ================================================== */
  if (corre('str')) {
    const r = { escenas: {} };
    const VALS = ['21', '20', '15', '14', '-21', '-20', '-15', '-14'];
    try {
      for (const v of VALS) {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.calentar()`);
        await ev(`window.__P.abrirPara('vd_strain_pl')`);
        await tipear('vd_strain_pl', v);
        const e3 = await ev(`window.__Y.tresEstilos()`, 40000);
        r.escenas['solo ' + v] = { strain: await ev(`window.__Y.strain()`),
          conciso: (e3.conciso.inf || '').split('\n').filter((l) => /VD|ventr/i.test(l)),
          estandar: (e3.estandar.inf || '').split('\n').filter((l) => /VD|ventr/i.test(l)),
          narrativo: (e3.narrativo.inf || '').split('\n').filter((l) => /VD|ventr/i.test(l)),
          suma: e3.estandar.suma };
      }
      /* Con TAPSE y S' NORMALES: el campo no vota y la oracion no puede decir disfuncion. */
      for (const v of ['18', '25']) {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.calentar()`);
        await ev(`window.__P.abrirPara('vd_strain_pl')`);
        await tipear('tapse', '22');
        await tipear('s_prime', '13');
        await tipear('vd_strain_pl', v);
        const e3 = await ev(`window.__Y.tresEstilos()`, 40000);
        r.escenas['tapse22 sp13 strain ' + v] = { strain: await ev(`window.__Y.strain()`),
          conciso: (e3.conciso.inf || '').split('\n').filter((l) => /VD|ventr/i.test(l)),
          estandar: (e3.estandar.inf || '').split('\n').filter((l) => /VD|ventr/i.test(l)),
          narrativo: (e3.narrativo.inf || '').split('\n').filter((l) => /VD|ventr/i.test(l)) };
      }
      /* Y con TAPSE y S' BAJOS, para que la disfuncion siga saliendo con su grado. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      await ev(`window.__P.abrirPara('vd_strain_pl')`);
      await tipear('tapse', '12');
      await tipear('s_prime', '6');
      await tipear('vd_strain_pl', '-12');
      const eb = await ev(`window.__Y.tresEstilos()`, 40000);
      r.escenas['tapse12 sp6 strain -12'] = { strain: await ev(`window.__Y.strain()`),
        estandar: (eb.estandar.inf || '').split('\n').filter((l) => /VD|ventr/i.test(l)) };
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.str = r;
    process.stderr.write('[str] listo\n');
  }

  /* == GRUPO ctrl — EL A/B DE CONTROL: SIN MITRAL NI VD CARGADOS ============================= */
  if (corre('ctrl')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      const vacio = await ev(`window.__Y.tresEstilos()`, 40000);
      r.vacio = vacio;
      r.vacioPDF = await ev(`(function(){ var p = window.__P.pdf(); return { err: p.err, guardo: p.guardo, nTextos: p.nTextos, nFigs: p.nFigs } })()`, 60000);
      r.vacioExcel = await ev(`(function(){ var x = window.__P.excelDOM(); return (typeof x === 'string') ? x : { cols: x.cols, hash: JSON.stringify(x.fila).length } })()`, 40000);
      r.vacioCampos = await ev(`(function(){ var c = {};
        document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
          c[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '0') : e.value });
        return JSON.stringify(c) })()`, 40000);
      /* UN PACIENTE AJENO: aorta y diastolica cargadas, mitral y VD intactos. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      await ev(`window.__Y.poner(${JSON.stringify({ nombre: 'Ajeno', ci: '9', sexo: 'M', peso: '80', talla: '180', ao_sin: '42', ddfvi: '58', fevi: '55', onda_e: '80', onda_a: '60' })})`);
      r.ajeno = await ev(`window.__Y.tresEstilos()`, 40000);
      r.ajenoPDF = await ev(`(function(){ var p = window.__P.pdf(); return { err: p.err, guardo: p.guardo, nTextos: p.nTextos, nFigs: p.nFigs } })()`, 60000);
      r.ajenoExcel = await ev(`(function(){ var x = window.__P.excelDOM(); return (typeof x === 'string') ? x : { cols: x.cols, hash: JSON.stringify(x.fila).length } })()`, 40000);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.ctrl = r;
    process.stderr.write('[ctrl] listo\n');
  }

  /* == GRUPO maq — DOS ANCHOS POR DOS TEMAS ================================================== */
  if (corre('maq')) {
    const r = {};
    try {
      for (const [w, h] of [[1440, 900], [390, 844]]) {
        await cdp.send('Emulation.setDeviceMetricsOverride',
          { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 }, sessionId);
        await pausa(400);
        for (const claro of [false, true]) {
          await ev(`window.__P.tema(${claro})`);
          await pausa(250);
          await ev(`window.__P.abrirPara('vm_carp')`);
          /* ⚠️ EL PRIMER getBoundingClientRect DESPUES DE UN REPINTADO DA 0x0 y se descarta. */
          await ev(`window.__Y.filaGeo()`);
          await pausa(200);
          r[w + 'x' + h + (claro ? ' claro' : ' oscuro')] = {
            fila: await ev(`window.__Y.filaGeo()`),
            vd: await ev(`(function(){ window.__P.abrirPara('vd_strain_pl');
              var e = document.getElementById('vd_strain_pl'); var g = document.getElementById('vd_strain_pl-grado');
              var f = document.getElementById('fevd');
              var r1 = e.getBoundingClientRect(), r2 = g.getBoundingClientRect(), r3 = f.getBoundingClientRect();
              return { campo: { w: Math.round(r1.width), h: Math.round(r1.height), y: Math.round(r1.top) },
                       grado: { w: Math.round(r2.width), h: Math.round(r2.height), y: Math.round(r2.top), txt: (g.textContent||'').trim() },
                       fevdY: Math.round(r3.top),
                       strainAntesDeFevd: r1.top < r3.top,
                       scrollH: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 } })()`)
          };
        }
      }
      await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
      await ev(`window.__P.tema(false)`);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
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
