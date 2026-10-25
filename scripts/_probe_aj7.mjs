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
  /* ══ HELPERS PROPIOS DE LA AJ7 ═══════════════════════════════════════════════════════════
     ADVERTENCIA: sin acentos graves adentro, tampoco en los comentarios. */
  await evCrudo(`
window.__Y = {
  errores() { return (window.__Yerr || []).slice(0, 20) },

  /* Pone un lote de campos por id. Devuelve lo que quedo y los errores, para que una escena
     que no pudo cargar sus datos NO informe un verde sobre cero elementos. */
  poner(campos) {
    var puestos = {}, err = [];
    Object.keys(campos || {}).forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { err.push('NO EXISTE ' + id); return; }
      if (e.type === 'checkbox') { e.checked = !!campos[id]; }
      else if (e.tagName === 'SELECT') {
        var r = window.__P.sel(id, campos[id]);
        if (r && r.err) { err.push(id + ': ' + r.err + ' hay=' + JSON.stringify(r.hay || [])); return; }
      } else { e.value = campos[id]; }
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true }));
      puestos[id] = (e.type === 'checkbox') ? (e.checked ? '1' : '0') : e.value;
    });
    try { if (typeof _recalcModulos === 'function') _recalcModulos('probe') } catch (e) {}
    return { puestos: puestos, err: err } },

  /* ── COMMIT 1 · Fallot ─────────────────────────────────────────────────────────────── */
  tdf() {
    var o = {};
    try { var c = (typeof tdfConclusion === 'function') ? tdfConclusion() : null;
      o.crudo = c ? { clave: c.clave, txt: c.txt, resumen: c.resumen, lineasInf: c.lineasInf } : null;
    } catch (e) { o.crudoErr = e.message }
    try { o.suma = (typeof ccSumaLinea === 'function') ? ccSumaLinea('tdf') : 'SIN FN' }
    catch (e) { o.sumaErr = e.message }
    o.concl = window.__P.txt('tdf-concl');
    return o },

  /* ── COMMIT 2 · HF-PEFF y ateroma ──────────────────────────────────────────────────── */
  ater() {
    return { desc: window.__P.txt('ao-atero-desc'),
             riesgo: window.__P.txt('ao-riesgo-embol'),
             rec: window.__P.txt('ao-recomendacion'),
             grosor: window.__P.txt('ao-atero-grosor'),
             visDesc: window.__P.vis('ao-atero-desc'),
             visRiesgo: window.__P.vis('ao-riesgo-embol'),
             filas: Array.prototype.map.call(
               document.querySelectorAll('#ete-seccion-aorta .calc-box .calc-row'),
               function(r){ var l = r.querySelector('.calc-lbl');
                 return { lbl: l ? l.textContent.trim() : '',
                          vis: getComputedStyle(r).display !== 'none' } }),
             hoja: (typeof _amTxtAoEte === 'function') ? _amTxtAoEte() : null } },

  /* El texto del bloque integrable del ETE de aorta, que es el que va al informe y al PDF. */
  hojaAoEte() {
    try {
      var secs = (typeof amiloSecs === 'function') ? amiloSecs() : [];
      for (var i = 0; i < secs.length; i++) {
        if (secs[i].k === 'aoete') return { k: 'aoete', txt: secs[i].gen ? secs[i].gen() : null };
      }
      return { err: 'NO HAY aoete en amiloSecs', claves: secs.map(function(s){ return s.k }) };
    } catch (e) { return { err: 'EXC: ' + e.message } } },

  /* El registro entero de modulos integrables, con su clave y si HOY tiene datos. */
  secs() {
    try {
      var secs = (typeof amiloSecs === 'function') ? amiloSecs() : [];
      return secs.map(function(s){
        var t = null; try { t = s.gen ? s.gen() : null } catch (e) { t = 'EXC: ' + e.message }
        return { k: s.k, rot: s.rot || s.nom || '', hayTxt: !!(t && String(t).trim()),
                 largo: t ? String(t).length : 0 };
      });
    } catch (e) { return { err: 'EXC: ' + e.message } } },

  /* Las claves integradas HOY y las marcadas como editadas a mano. */
  integrados() {
    var o = {};
    try { o.editados = window.__P.val('am-editados') } catch (e) { o.editados = 'EXC' }
    o.marcas = Array.prototype.map.call(document.querySelectorAll('[data-am-k]'), function(b){
      return { k: b.getAttribute('data-am-k'), clase: b.className } });
    o.enInforme = [];
    try {
      var secs = (typeof amiloSecs === 'function') ? amiloSecs() : [];
      secs.forEach(function(s){
        var ta = document.getElementById('am-txt-' + s.k);
        if (ta) o.enInforme.push({ k: s.k, largo: (ta.value || '').length });
      });
    } catch (e) { o.enInformeErr = e.message }
    return o },

  /* ── COMMIT 3 · VD y mitral ────────────────────────────────────────────────────────── */
  vd() {
    var o = {};
    o.strainGrado = window.__P.txt('vd_strain_pl-grado');
    try { o.cat = (typeof vdStrainPlCat === 'function') ? vdStrainPlCat(window.__P.val('vd_strain_pl')) : 'SIN FN' }
    catch (e) { o.catErr = e.message }
    try { o.disfGrado = (typeof vdDisfGrado === 'function')
      ? vdDisfGrado(window.__P.val('tapse'), window.__P.val('s_prime')) : 'SIN FN' }
    catch (e) { o.disfErr = e.message }
    return o },

  /* Las filas del cuadro de referencias del VD, rotulo y dos columnas. */
  vdRefs() {
    try { if (typeof evRefPintar === 'function') evRefPintar('vd2') } catch (e) {}
    var h = document.getElementById('ref-vd2-cuerpo');
    if (!h) {
      return { err: 'NO HAY ref-vd2-cuerpo' };
    }
    return { filas: Array.prototype.map.call(h.querySelectorAll('tr'), function(tr){
      return Array.prototype.map.call(tr.querySelectorAll('th,td'), function(c){
        return (c.textContent || '').trim() }).join(' | ') }) } },

  mitral() {
    var ids = ['vm_morf', 'vm_tipo_im', 'vm_carp', 'vm_carpentier'];
    var o = {};
    ids.forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { o[id] = 'NO EXISTE'; return; }
      var r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      o[id] = { val: e.value, disabled: !!e.disabled, op: cs.opacity,
                w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize,
                vis: window.__P.vis(id) };
    });
    /* El ancho util del control CERRADO y el ancho del rotulo mas largo, medidos con la
       tipografia real: es lo que decide si se recorta. */
    var sel = document.getElementById('vm_morf');
    if (sel) {
      var cs = getComputedStyle(sel);
      var cv = document.createElement('canvas').getContext('2d');
      cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      o.textos = Array.prototype.map.call(sel.options, function(op){
        return { t: op.text, w: Math.round(cv.measureText(op.text).width) } });
      o.utilMorf = Math.round(sel.getBoundingClientRect().width)
        - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 18;
    }
    return o },

  /* ── COMMIT 4 · pericardio, constriccion y VExUS ───────────────────────────────────── */
  cvr() {
    var o = {};
    try { var st = (typeof cvrEstado === 'function') ? cvrEstado() : null;
      o.clave = st ? st.clave : null; o.espEval = st ? st.espEval : null;
      o.nC = st ? st.nC : null; o.nR = st ? st.nR : null;
    } catch (e) { o.err = e.message }
    try { o.ind = (typeof _indConstr === 'function') ? !!_indConstr() : 'SIN FN' }
    catch (e) { o.indErr = e.message }
    o.pantalla = window.__P.txt('cvr-concl') || window.__P.txt('cvr-resultado');
    return o },

  vexus() {
    var o = {};
    try { var st = (typeof calcVEXUS === 'function') ? calcVEXUS() : null; o.st = st }
    catch (e) { o.err = e.message }
    var a = document.getElementById('vexus-vci-aviso');
    if (!a) { var c = Array.prototype.filter.call(document.querySelectorAll('[id*=vexus]'),
      function(e){ return /aviso/i.test(e.id) });
      o.avisoErr = 'NO HAY vexus-vci-aviso'; o.cands = c.map(function(e){ return e.id }); }
    else { o.aviso = (a.textContent || '').trim(); o.avisoHTML = a.innerHTML; }
    return o },

  /* ── COMMIT 8 · G-a, el corte de HP ────────────────────────────────────────────────── */
  hemo() {
    var o = {};
    try { o.hemo = (typeof calcHemodinamica === 'function') ? (calcHemodinamica(), 'corrio') : 'SIN FN' }
    catch (e) { o.err = e.message }
    ['hemo-perfil', 'hemo-ic', 'hemo-rvs', 'pop-vd-rama', 'pop-patron'].forEach(function(id){
      o[id] = window.__P.txt(id) });
    return o },

  /* ── Texto buscado en cualquier superficie ─────────────────────────────────────────── */
  busca(t, frases) {
    var s = String(t || ''), o = {};
    (frases || []).forEach(function(f){ o[f] = s.indexOf(f) >= 0 });
    return o },

  /* Censo de globos i, con su geometria: el denominador del celular. */
  globos() {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll('button.vinfo-btn'), function(b){
      var r = b.getBoundingClientRect();
      out.push({ k: b.getAttribute('data-vinfo'), w: Math.round(r.width), h: Math.round(r.height),
                 vis: r.width > 0 && r.height > 0, fs: getComputedStyle(b).fontSize });
    });
    return out }
};
1`);

  /* ══ ESCENAS ═════════════════════════════════════════════════════════════════════════ */
  const FRASES_TDF = ['reemplazo valvular pulmonar indicado', 'Clase I', 'Clase IIa',
    'seguimiento', 'sin criterios de reintervención', 'insuficiencia pulmonar severa'];
  const FRASES_CVR = ['Considerar RMC con gadolinio', 'requiere correlación clínica e imagenológica'];

  async function escenaTDF() {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      await ev(`window.__P.abrirPara('tdf_func_vd')`);
      r.puesto = await ev(`window.__Y.poner(${JSON.stringify({
        nombre: 'Fallot AJ7', ci: '1', tdf_func_vd: 'normal', tdf_grad_tsvd: '36',
        tdf_sintomas: 'no', ip_grado: 'Severa', it_grado: '2', tdf_incluir_chk: true })})`);
      r.tdf = await ev(`window.__Y.tdf()`);
      r.informe = {};
      for (const est of ['conciso', 'estandar', 'narrativo'])
        r.informe[est] = await ev(`window.__P.informe('${est}')`, 60000);
      r.pdf = await ev(`window.__P.pdf('estandar')`, 120000);
      r.ppt = await ev(`(function(){ try { if (typeof _pptTxt !== 'function') return 'SIN _pptTxt';
        var c = tdfConclusion(); return c ? _pptTxt(c.resumen || c.txt) : null } catch (e) { return 'EXC: ' + e.message } })()`);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.tdf = r;
    process.stderr.write('[tdf] listo\n');
  }

  async function escenaAter() {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      await ev(`window.__P.abrirPara('ao_grado_atero')`);
      r.puesto = await ev(`window.__Y.poner(${JSON.stringify({
        nombre: 'Ateroma AJ7', ci: '2', ao_segmento: 'arco', ao_grado_atero: '4',
        ao_grosor_placa: '6', ao_movilidad_placa: 'fija' })})`);
      r.ater = await ev(`window.__Y.ater()`);
      r.hoja = await ev(`window.__Y.hojaAoEte()`);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.ater = r;
    process.stderr.write('[ater] listo\n');
  }

  async function escenaVD() {
    const r = { casos: {} };
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      await ev(`window.__P.abrirPara('vd_strain_pl')`);
      /* Tres escenas de strain con TAPSE y onda S' NORMALES: es el control que distingue
         «vota» de «no vota». Y una cuarta con el TAPSE bajo, que es el control negativo:
         ahi la disfuncion ya existe sin el strain. */
      const ESC = {
        leve:    { tapse: '22', s_prime: '13', vd_strain_pl: '-18' },
        bajoLeve:{ tapse: '22', s_prime: '13', vd_strain_pl: '-12' },
        normal:  { tapse: '22', s_prime: '13', vd_strain_pl: '-25' },
        borde15: { tapse: '22', s_prime: '13', vd_strain_pl: '-15' },
        borde20: { tapse: '22', s_prime: '13', vd_strain_pl: '-20' },
        ctrlNeg: { tapse: '12', s_prime: '6',  vd_strain_pl: '-25' }
      };
      for (const k of Object.keys(ESC)) {
        const c = Object.assign({ nombre: 'VD AJ7', ci: '3' }, ESC[k]);
        const p = await ev(`window.__Y.poner(${JSON.stringify(c)})`);
        const vd = await ev(`window.__Y.vd()`);
        const I = await ev(`window.__P.informe('estandar')`, 60000);
        r.casos[k] = { puesto: p, vd, inf: _vdFrase(I && I.inf), suma: _vdFrase(I && I.suma) };
      }
      await ev(`window.__P.abrirPara('vd_strain_pl')`);
      r.refs = await ev(`(function(){ try { if (typeof showTab === 'function') showTab('referencias');
        if (typeof refSubShow === 'function') refSubShow('vd'); } catch(e){}
        return 1 })()`);
      r.vdRefs = await ev(`window.__Y.vdRefs()`);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.vd = r;
    process.stderr.write('[vd] listo\n');
  }
  /* Deja SOLO los renglones que nombran el ventriculo derecho: un informe entero por escena
     hace ilegible el diff y esconde la diferencia que importa. */
  function _vdFrase(t) {
    const L = String(t || '').split(/\n/).filter((l) => /strain|ventr[ií]culo derecho|\bVD\b/i.test(l));
    return L.length ? L.join(' ⏎ ') : ('(SIN RENGLON DE VD · ' + String(t || '').length + ' car)');
  }

  async function escenaMitral() {
    const r = { casos: {} };
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      await ev(`window.__P.abrirPara('vm_morf')`);
      for (const [k, morf] of [['nativa', 'Mixomatosa / Barlow'], ['protBio', 'Prótesis biológica'],
                               ['protMec', 'Prótesis mecánica']]) {
        const p = await ev(`window.__Y.poner(${JSON.stringify({
          nombre: 'Mitral AJ7', ci: '4', vm_morf: morf, vm_tipo_im: 'primaria', vm_carp: 'II' })})`);
        r.casos[k] = { puesto: p, est: await ev(`window.__Y.mitral()`) };
      }
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.mitral = r;
    process.stderr.write('[mitral] listo\n');
  }

  async function escenaCVR() {
    const r = { casos: {} };
    try {
      /* ESCENA A — SOLO taponamiento: la variacion respiratoria mitral cargada y nada del
         pericardio propio. Es la de J-b. */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      try { await ev(`window.__P.abrirPara('resp_var_mitral')`) } catch (e) { r.noAbre = e.message }
      r.casos.soloTapo = {
        puesto: await ev(`window.__Y.poner(${JSON.stringify({ nombre: 'Tapo AJ7', ci: '5',
          resp_var_mitral: '32', dpt_mm_post: '18' })})`),
        cvr: await ev(`window.__Y.cvr()`)
      };
      /* ESCENA B — datos PROPIOS de constriccion: rebote septal y patron venoso hepatico. */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      await ev(`window.__P.abrirPara('cvr_rebote')`);
      r.casos.propios = {
        puesto: await ev(`window.__Y.poner(${JSON.stringify({ nombre: 'Constr AJ7', ci: '5',
          cvr_rebote: 'si', cvr_hepatico: 'esp', e_sep: '11', e_lat: '8' })})`),
        cvr: await ev(`window.__Y.cvr()`),
        inf: await ev(`window.__P.informe('estandar')`, 60000),
        pdf: await ev(`window.__P.pdf('estandar')`, 120000)
      };
      /* ESCENA C — control negativo: SOLO el perfil diastolico de rutina, nada del pericardio. */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      await ev(`window.__P.abrirPara('e_sep')`);
      r.casos.rutina = {
        puesto: await ev(`window.__Y.poner(${JSON.stringify({ nombre: 'Rutina AJ7', ci: '5',
          e_sep: '8', e_lat: '10', onda_e: '70' })})`),
        cvr: await ev(`window.__Y.cvr()`)
      };
      /* ESCENA D — restrictiva, que es la rama donde vive «Considerar RMC con gadolinio». */
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      await ev(`window.__P.abrirPara('cvr_rebote')`);
      r.casos.restr = {
        puesto: await ev(`window.__Y.poner(${JSON.stringify({ nombre: 'Restr AJ7', ci: '5',
          e_sep: '5', e_lat: '8', onda_e: '110', e_sep_prom: '', resp_var_mitral: '8',
          cvr_rebote: 'no', cvr_hepatico: 'insp' })})`),
        cvr: await ev(`window.__Y.cvr()`),
        inf: await ev(`window.__P.informe('estandar')`, 60000),
        pdf: await ev(`window.__P.pdf('estandar')`, 120000)
      };
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.cvr = r;
    process.stderr.write('[cvr] listo\n');
  }

  async function escenaVexus() {
    const r = { casos: {} };
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      await ev(`window.__P.abrirPara('vexus_ir')`);
      for (const d of ['19', '20', '21']) {
        const p = await ev(`window.__Y.poner(${JSON.stringify({
          nombre: 'VExUS AJ7', ci: '6', vci_diam: d, vexus_sh: 'severo' })})`);
        r.casos[d] = { puesto: p, vex: await ev(`window.__Y.vexus()`) };
      }
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.vexus = r;
    process.stderr.write('[vexus] listo\n');
  }

  async function escenaGlobos() {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      r.cerrado = await ev(`window.__Y.globos()`);
      /* Con TODO abierto: lo que esta en display:none no tiene geometria, y sin eso el censo
         mide cero y parece impecable. Es la misma leccion de check_mobile.js. */
      r.abierto = await ev(`(function(){
        Array.prototype.forEach.call(document.querySelectorAll('.tab-section'), function(s){ s.style.display = 'block' });
        Array.prototype.forEach.call(document.querySelectorAll('[id^=ete-seccion-],[id^=am-cuerpo-]'), function(s){ s.style.display = 'block' });
        return window.__Y.globos() })()`);
    } catch (e) { r.err = e.message }
    out.grupos.globos = r;
    process.stderr.write('[globos] listo\n');
  }

  async function escenaCtrl() {
    const r = {};
    const AJENO = { nombre: 'Control', ci: '9', ddvi: '52', dsvi: '34', fevi: '58',
                    ai_ap: '38', tapse: '21', s_prime: '12', e_sep: '8', e_lat: '10',
                    onda_e: '70', onda_a: '60', it_vmax: '2.4' };
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      for (const id of Object.keys(AJENO)) {
        try { await ev(`window.__P.abrirPara('${id}')`); await poner(id, AJENO[id]); }
        catch (e) { r['no_' + id] = e.message }
      }
      r.tres = {};
      for (const est of ['conciso', 'estandar', 'narrativo'])
        r.tres[est] = await ev(`window.__P.informe('${est}')`, 60000);
      r.suma = await ev(`window.__P.val('en_suma')`);
      r.pdf = await ev(`window.__P.pdf('estandar')`, 120000);
      r.excel = await ev(`window.__P.excelDOM()`, 90000);
      r.campos = await ev(`window.__P.camposGuardados()`);
      r.cvr = await ev(`window.__Y.cvr()`);
      r.errores = await ev(`window.__Y.errores()`);
    } catch (e) { r.err = e.message }
    out.grupos.ctrl = r;
    process.stderr.write('[ctrl] listo\n');
  }

  if (corre('tdf'))    await escenaTDF();
  if (corre('ater'))   await escenaAter();
  if (corre('vd'))     await escenaVD();
  if (corre('mitral')) await escenaMitral();
  if (corre('cvr'))    await escenaCVR();
  if (corre('vexus'))  await escenaVexus();
  if (corre('globos')) await escenaGlobos();
  if (corre('ctrl'))   await escenaCtrl();

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  process.stdout.write(JSON.stringify(OUT, null, 1));
  cdp.close(); srv.close(); process.exit(0);
}

main().catch(async (e) => {
  process.stdout.write(JSON.stringify({ err: e.message, stack: String(e.stack || '').slice(0, 1200) }, null, 1));
  process.exit(1);
});
