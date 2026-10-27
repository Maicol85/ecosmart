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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-b-'));
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

/* == SONDA PROPIA DE LA TANDA B ==============================================================
   Mide TRES cosas, y ninguna de las tres se puede deducir leyendo el archivo:
     1. QUIEN PINTA y QUIEN ESCRIBE. Para cada funcion de RECALC_MODULOS, la sonda toma una foto
        de los ~1000 campos del formulario y de la marca `dataset` de cada uno, la llama, y
        vuelve a mirar. La que cambia un `value` NO es un pintor puro y no puede entrar a un
        barrido en vivo: correrla con cada tecla seria migrar el estudio del medico en silencio.
     2. QUIEN SE QUEDA VIEJO. Con el formulario poblado, cambia un dato FUENTE despachando
        `input` -que es lo que hace el medico-, espera a que el debounce de la app corra, toma la
        foto del texto de la pantalla, y recien ahi llama al pintor. Si el texto cambia, ese
        pintor estaba mostrando el dato anterior.
     3. CUANTO CUESTA ESCRIBIR. Doce teclas reales sobre un campo poblado, midiendo el tiempo de
        cada una con performance.now() del lado de la pagina.
   ADVERTENCIA: cuerpo de template literal. Ni un acento grave adentro. */
const SONDA_B = `
window.__B = {
  /* Foto de TODO lo que el medico podria perder: el value de cada campo con id, mas las tres
     marcas de dataset que gobiernan los espejos. */
  fotoCampos() {
    var o = {};
    var els = document.querySelectorAll('input[id], select[id], textarea[id]');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      var d = e.dataset || {};
      o[e.id] = (e.type === 'checkbox' || e.type === 'radio')
        ? (e.checked ? '1' : '0')
        : String(e.value == null ? '' : e.value);
      var m = [d.derivadoDe, d.sugerido, d.espejoDe, d.espejoVivo].join('|');
      if (m !== '|||') o['@' + e.id] = m;
    }
    return o },

  /* Foto del TEXTO de la pantalla: solo nodos que NO son campos. Es donde viven los espejos de
     solo lectura y los textos calculados. Se toma del documento entero porque los espejos estan
     repartidos en las 17 pestanas y nombrarlos uno por uno es justo la lista que esta tanda
     quiere no tener que mantener. */
  fotoTexto() {
    var o = {};
    var els = document.querySelectorAll('span[id], div[id], td[id], b[id], p[id], small[id], button[id], svg[id]');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.querySelector && e.querySelector('input, select, textarea')) continue;
      var t = (e.textContent || '').replace(/\\s+/g, ' ').trim();
      if (t.length > 4000) t = t.slice(0, 4000);
      o[e.id] = t;
    }
    return o },

  /* Visibilidad de los nodos que un pintor puede prender o apagar (el boton «Integrar», los
     wrap de cada bloque). Un espejo que aparece y desaparece no se ve en fotoTexto. */
  fotoVis() {
    var o = {};
    var els = document.querySelectorAll('[id]');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      o[e.id] = (e.style && e.style.display === 'none') ? 0 : 1;
    }
    return o },

  dif(a, b) {
    var out = [], k;
    for (k in b) if (String(a[k] == null ? '' : a[k]) !== String(b[k] == null ? '' : b[k]))
      out.push({ id: k, de: a[k] == null ? null : String(a[k]).slice(0, 110),
                 a: b[k] == null ? null : String(b[k]).slice(0, 110) });
    for (k in a) if (!(k in b)) out.push({ id: k, de: String(a[k]).slice(0, 110), a: null });
    return out },

  lista() { try { return RECALC_MODULOS() } catch (e) { return [] } },

  /* Llama UNA funcion y dice que movio. */
  correUna(fn) {
    var f = window[fn];
    if (typeof f !== 'function') return { fn: fn, noExiste: true };
    var c0 = this.fotoCampos(), t0 = this.fotoTexto(), v0 = this.fotoVis();
    var exc = null;
    try { f() } catch (e) { exc = String(e && e.message || e) }
    var dc = this.dif(c0, this.fotoCampos());
    var dt = this.dif(t0, this.fotoTexto());
    var dv = this.dif(v0, this.fotoVis());
    return { fn: fn, exc: exc, escribe: dc, pinta: dt.length, prende: dv.length,
             pintaIds: dt.slice(0, 12).map(function(x){ return x.id }),
             prendeIds: dv.slice(0, 12).map(function(x){ return x.id }) } },

  /* El medico cambia un dato: value + input + change, que es lo que despacha el navegador. */
  fuente(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    var antes = e.value;
    if (e.type === 'checkbox') { e.checked = !!valor; }
    else { e.value = String(valor); }
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: true, de: antes, a: String(e.value) } },

  /* Doce teclas de verdad las manda el arnes por CDP; esto solo marca el reloj. */
  reloj0() { window.__Bt = []; window.__BmarcaT = performance.now(); return 1 },
  marca()  { var t = performance.now(); window.__Bt.push(t - window.__BmarcaT);
             window.__BmarcaT = t; return window.__Bt.length },
  relojLeer() { var a = (window.__Bt || []).slice();
    return { n: a.length, med: a.length ? a.reduce(function(s,x){return s+x},0)/a.length : null,
             max: a.length ? Math.max.apply(null, a) : null,
             min: a.length ? Math.min.apply(null, a) : null,
             todos: a.map(function(x){ return Math.round(x*100)/100 }) } },

  /* Cronometro del barrido: cuanto tarda una pasada completa. */
  cronoBarrido(fn) {
    var f = window[fn];
    if (typeof f !== 'function') return { noExiste: true };
    var t0 = performance.now();
    try { f() } catch (e) { return { exc: String(e && e.message || e) } }
    return { ms: Math.round((performance.now() - t0) * 1000) / 1000 } },

  /* La PAM: lo que cada lugar publica hoy. */
  pam() {
    var g = function(id){ var e = document.getElementById(id); return e ? e.value : null };
    var t = function(id){ var e = document.getElementById(id); return e ? (e.textContent||'').trim() : null };
    var o = { hemo_pam: g('hemo_pam'), pop_sw_pam: g('pop_sw_pam'),
              ao_pas: g('ao_pas'), ao_pad: g('ao_pad'), monitor: g('pop_monitor'),
              derivadoDe: (document.getElementById('hemo_pam')||{dataset:{}}).dataset.derivadoDe,
              aoRefPam: t('ao-ref-pam'), popSwRvs: t('pop-sw-rvs'),
              popEsqTxt: t('pop-esq-txt'), popConcl: t('pop-concl-box'),
              avisoPam: t('hemo-pam-auto'), avisoPamPop: t('pop-pam-aviso') };
    try { o.calc = (typeof aoPamCalc === 'function') ? aoPamCalc() : 'SIN aoPamCalc' } catch(e){ o.calc = 'EXC' }
    try { o.duena = (typeof pamEfectiva === 'function') ? pamEfectiva() : 'SIN pamEfectiva' } catch(e){ o.duena = 'EXC' }
    try { o.patron = (typeof popPatron === 'function') ? JSON.stringify(popPatron()).slice(0,900) : null } catch(e){ o.patron = 'EXC' }
    try { o.hemo = (typeof calcHemo === 'function') ? (calcHemo(), t('hemo-rvs')) : null } catch(e){ o.hemo = 'EXC' }
    return o },

  /* Registro de espejos, si existe. Es el denominador del inventario despues del commit 1. */
  espejos() {
    try { return (typeof ESPEJOS_VIVOS === 'function') ? ESPEJOS_VIVOS() : null } catch (e) { return 'EXC' } },

  errores() { return (window.__Yerr || []).slice(0, 40) },

  /* Foto de los campos que el MEDICO puede tipear: ni readonly, ni disabled, ni declarados
     espejo. Es la propiedad de seguridad del barrido: puede repintar lo que quiera, pero no
     puede tocar un solo valor que el medico escribio. */
  fotoEditables() {
    var o = {};
    var els = document.querySelectorAll('input[id], select[id], textarea[id]');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.readOnly || e.disabled || e.hasAttribute('data-espejo')) continue;
      if (/_ro$/.test(e.id)) continue;
      o[e.id] = (e.type === 'checkbox' || e.type === 'radio') ? (e.checked ? '1' : '0')
                                                              : String(e.value == null ? '' : e.value);
    }
    return o },

  /* Corre el barrido de espejos N veces y dice si movio UN SOLO campo editable. */
  barridoSeguro(n) {
    if (typeof _espejosBarrerTodos !== 'function') return { noExiste: true };
    var a = this.fotoEditables();
    for (var i = 0; i < (n || 3); i++) { try { _espejosBarrerTodos() } catch (e) { return { exc: String(e) } } }
    var d = this.dif(a, this.fotoEditables());
    return { n: n || 3, movidos: d.length, detalle: d.slice(0, 20) } },

  /* Corre TODA la lista de una, del lado de la pagina: 94 funciones por round-trip de CDP son
     94 idas y vueltas por escenario, y el barrido entero del censo no termina nunca. Devuelve,
     por funcion, que campo escribio y que nodo de texto movio. */
  correTodas(fns) {
    var out = [];
    for (var i = 0; i < fns.length; i++) {
      var fn = fns[i], f = window[fn];
      if (typeof f !== 'function') { out.push({ fn: fn, noExiste: true }); continue; }
      var c0 = this.fotoCampos(), t0 = this.fotoTexto(), v0 = this.fotoVis();
      var exc = null;
      try { f() } catch (e) { exc = String(e && e.message || e) }
      var dc = this.dif(c0, this.fotoCampos());
      var dt = this.dif(t0, this.fotoTexto());
      var dv = this.dif(v0, this.fotoVis());
      if (!dc.length && !dt.length && !dv.length && !exc) continue;
      out.push({ fn: fn, exc: exc,
                 escribe: dc.slice(0, 10),
                 pinta: dt.length, pintaIds: dt.slice(0, 14).map(function(x){ return x.id }),
                 pintaDet: dt.slice(0, 6),
                 prende: dv.length, prendeIds: dv.slice(0, 10).map(function(x){ return x.id }) });
    }
    return out },

  /* Pone muchos campos de una, despachando input+change en cada uno igual que el navegador.
     No toca pestanas: lo que importa es el evento, no la geometria -los pintores leen valores-.
     Devuelve los que no existen, que es el denominador del censo. */
  ponerVarios(pares) {
    var no = [], ok = 0;
    for (var i = 0; i < pares.length; i++) {
      var id = pares[i][0], val = pares[i][1];
      var e = document.getElementById(id);
      if (!e) { no.push(id); continue; }
      if (e.type === 'checkbox') { e.checked = (val === '1' || val === true); }
      else {
        if (e.tagName === 'SELECT') {
          var hay = false;
          for (var j = 0; j < e.options.length; j++) if (e.options[j].value === String(val)) hay = true;
          if (!hay) { no.push(id + ' (sin opcion ' + val + ')'); continue; }
        }
        e.value = String(val);
      }
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true }));
      ok++;
    }
    return { ok: ok, no: no } },
};
1`;


/* == ESCENA POBLADA ===========================================================================
   Un estudio con datos en las pestanas que esta tanda toca: paciente (peso y talla, que es el
   insumo de la dilucion), Hemodinamica, Doppler aortico (PAS y PAD, la PAM calculada), VD/AD
   (la VCI y el VD/VI del POCUS) y el POP con Swan-Ganz. Los valores son plausibles y dentro de
   banda. */
const ESCENA = [
  ['tab', 'datos'],
  ['nombre', 'Prueba Tanda B'], ['ci', '12345678'], ['edad', '64'], ['sexo', 'M'],
  ['peso', '80'], ['talla', '175'],
  ['tab', 'ai-vi'],
  ['ddfvi', '54'], ['dsfvi', '36'], ['fevi', '55'], ['siv', '11'], ['ppvi', '10'],
  ['ai_diam', '40'],
  ['tab', 'vd'],
  ['tapse', '16'], ['s_prime', '9'], ['vd_bas', '42'], ['vci_diam', '22'],
  ['tab', 'doppler'],
  ['onda_e', '80'], ['onda_a', '60'], ['e_sep', '6'], ['e_lat', '8'],
  ['vmax_it', '2.8'],
];

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
  /* ⚠️ EL `beforeunload` DE LA APP CUELGA LA SONDA, Y TARDE DIEZ MINUTOS EN VERLO. Con datos sin
     guardar, `location.reload()` abre el dialogo «Leave site?» del navegador; CDP no lo cierra
     solo y TODO `Runtime.evaluate` posterior queda esperando para siempre -ni siquiera el
     timeout de `ev` ayuda, porque `evCrudo` no lo tiene-. Se acepta el dialogo apenas se abre,
     que es lo que hace el medico cuando recarga a proposito. */
  cdp.alDialogo = () => { try { cdp.send('Page.handleJavaScriptDialog', { accept: true }, sessionId); } catch (e) {} };
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

  out.calentar = await ev(`window.__P.calentar()`);
  await evCrudo(SONDA_B);

  /* Pone la escena. `abrirPara` lleva a la pestana y abre lo plegado: un campo sin geometria no
     recibe el foco y el tecleo se pierde en silencio -leccion ya escrita en este repo-. */
  async function ponerEscena() {
    const fallos = {};
    for (const [id, val] of ESCENA) {
      if (id === 'tab') { try { await ev(`(function(){ showTab(${JSON.stringify(val)}); return 1 })()`); } catch (e) {} continue; }
      try { await ev(`window.__P.abrirPara(${JSON.stringify(id)})`); await poner(id, val); }
      catch (e) { fallos[id] = e.message.slice(0, 120); }
    }
    return fallos;
  }
  /* El POP con Swan-Ganz. Va aparte porque el acordeon solo existe con el dispositivo elegido:
     poner los campos antes que el `<select>` es escribir sobre nodos sin geometria. */
  async function ponerPOP(swan) {
    const fallos = {};
    try { await ev(`(function(){ showTab('posop'); return 1 })()`); } catch (e) {}
    try { await ev(`window.__P.abrirPara('pop_monitor')`); await poner('pop_monitor', swan ? 'swan' : 'ninguno'); }
    catch (e) { fallos.pop_monitor = e.message.slice(0, 120); }
    if (!swan) return fallos;
    const SW = [['pop_sw_gc','4.2'], ['pop_sw_fc','90'], ['pop_sw_paps','38'],
                ['pop_sw_papd','18'], ['pop_sw_pcp','14'], ['pop_sw_pad','9']];
    for (const [id, val] of SW) {
      try { await ev(`window.__P.abrirPara(${JSON.stringify(id)})`); await poner(id, val); }
      catch (e) { fallos[id] = e.message.slice(0, 120); }
    }
    return fallos;
  }

  /* ── GRUPO `pureza` ─────────────────────────────────────────────────────────────────────
     Quien de las funciones del embudo escribe un campo y quien solo pinta. Con el formulario
     POBLADO, que es el unico estado donde la pregunta tiene denominador: sobre el formulario
     vacio casi ninguna escribe nada y la respuesta seria «todas puras». */
  async function escenaPureza() {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      r.fallosEscena = await ponerEscena();
      r.fallosPop = await ponerPOP(true);
      await ev(`window.__P.calentar()`);
      await pausa(600);
      r.lista = await ev(`window.__B.lista()`);
      r.una = [];
      for (const fn of r.lista) {
        const u = await ev(`window.__B.correUna(${JSON.stringify(fn)})`, 40000);
        r.una.push(u);
      }
      r.escriben = r.una.filter((x) => x.escribe && x.escribe.length)
        .map((x) => ({ fn: x.fn, campos: x.escribe.slice(0, 8) }));
      r.pintanN = r.una.filter((x) => x.pinta > 0 || x.prende > 0).length;
      r.errores = await ev(`window.__B.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.pureza = r;
    process.stderr.write('[pureza] listo\n');
  }

  /* ── GRUPO `viejo` ──────────────────────────────────────────────────────────────────────
     El defecto, medido. Cambia un dato FUENTE como lo cambia el medico, espera a que todo lo
     que la app tiene cableado corra (el debounce mas largo de la app es el autoguardado, 1500
     ms), y RECIEN AHI llama al pintor. Lo que el pintor mueve es exactamente lo que la pantalla
     estaba mostrando viejo. */
  const FUENTES = [
    { k: 'S1-gc',   id: 'pop_sw_gc',   val: '2.4', tab: 'posop', que: 'S1: GC del Swan-Ganz' },
    { k: 'S1-pam',  id: 'pop_sw_pam',  val: '58',  tab: 'posop', que: 'S1: PAM del Swan-Ganz' },
    { k: 'S1-pcp',  id: 'pop_sw_pcp',  val: '26',  tab: 'posop', que: 'S1: PCP del Swan-Ganz' },
    { k: 'S2-peso', id: 'peso',        val: '95',  tab: 'datos', que: 'S2: peso del paciente' },
    { k: 'S3-esep', id: 'e_sep',       val: '4',   tab: 'doppler', que: 'S3: e-prima medial' },
    { k: 'S3-vci',  id: 'vci_diam',    val: '24',  tab: 'vd',    que: 'S3: diametro de la VCI' },
    { k: 'S3-fc',   id: 'hemo_fc',     val: '110', tab: 'hemo',  que: 'S3: FC de Hemodinamica' },
  ];
  async function escenaViejo() {
    const r = { casos: [] };
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      r.fallosEscena = await ponerEscena();
      r.fallosPop = await ponerPOP(true);
      try { await ev(`window.__P.abrirPara('hemo_fc')`); await poner('hemo_fc', '75'); } catch (e) { r.noFc = e.message.slice(0,110); }
      try { await ev(`window.__P.abrirPara('diam_tsvi')`); await poner('diam_tsvi', '21'); } catch (e) {}
      try { await ev(`window.__P.abrirPara('itv_tsvi')`); await poner('itv_tsvi', '19'); } catch (e) {}
      try { await ev(`window.__P.abrirPara('pop_nor_activa')`); await ev(`window.__B.fuente('pop_nor_activa', true)`); } catch (e) {}
      for (const id of ['pop_nor_diluc_mg', 'pop_nor_diluc_ml', 'pop_nor_veloc']) {
        try { await ev(`window.__P.abrirPara(${JSON.stringify(id)})`); } catch (e) {}
      }
      try { await poner('pop_nor_diluc_mg', '4'); await poner('pop_nor_diluc_ml', '100'); await poner('pop_nor_veloc', '12'); } catch (e) { r.noDiluc = e.message.slice(0,110); }
      await ev(`window.__P.calentar()`);
      await pausa(1800);
      r.lista = await ev(`window.__B.lista()`);

      for (const F of FUENTES) {
        const c = { k: F.k, que: F.que, id: F.id };
        try {
          try { await ev(`(function(){ showTab(${JSON.stringify(F.tab)}); return 1 })()`); } catch (e) {}
          await ev(`window.__P.abrirPara(${JSON.stringify(F.id)})`);
          c.cambio = await ev(`window.__B.fuente(${JSON.stringify(F.id)}, ${JSON.stringify(F.val)})`);
          await pausa(1800);                 // mas que cualquier debounce de la app
          c.viejos = [];
          for (const fn of r.lista) {
            const u = await ev(`window.__B.correUna(${JSON.stringify(fn)})`, 40000);
            if (u.noExiste) continue;
            if (u.escribe && u.escribe.length) c.escriben = (c.escriben || []).concat([{ fn: u.fn, campos: u.escribe.slice(0, 6) }]);
            if (u.pinta > 0 || u.prende > 0)
              c.viejos.push({ fn: u.fn, pinta: u.pinta, prende: u.prende,
                              ids: u.pintaIds.concat(u.prendeIds).slice(0, 10) });
          }
          c.nViejos = c.viejos.length;
        } catch (e) { c.err = e.message.slice(0, 200); }
        r.casos.push(c);
        process.stderr.write('[viejo] ' + F.k + ': ' + (c.nViejos == null ? 'ERR' : c.nViejos) + '\n');
      }
      r.errores = await ev(`window.__B.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.viejo = r;
    process.stderr.write('[viejo] listo\n');
  }

  /* ── GRUPO `pam` ────────────────────────────────────────────────────────────────────────
     Las SIETE combinaciones de fuentes cargadas. Las tres fuentes:
       I = invasiva   -> pop_sw_pam, con pop_monitor en «swan»
       T = tipeada    -> hemo_pam escrito a mano (y por eso SIN la marca derivadoDe)
       C = calculada  -> ao_pas y ao_pad del Doppler aortico
     ⚠️ T y C COMPARTEN HOY EL MISMO CAMPO. `aoPresionSync` escribe la calculada dentro de
     `hemo_pam` y la marca con `dataset.derivadoDe`; lo tipeado es el mismo campo sin la marca.
     Por eso el orden de carga importa y la sonda lo declara: para «T sin C» se tipea con
     PAS/PAD vacios, y para «T y C» se carga primero PAS/PAD -que escribe la calculada- y
     despues se TIPEA encima, que es el gesto real del medico. */
  const PAMCOMBOS = [
    { k: 'none', I: null, T: null,  C: null },
    { k: 'I',    I: '58', T: null,  C: null },
    { k: 'T',    I: null, T: '95',  C: null },
    { k: 'C',    I: null, T: null,  C: ['120', '70'] },
    { k: 'IT',   I: '58', T: '95',  C: null },
    { k: 'IC',   I: '58', T: null,  C: ['120', '70'] },
    { k: 'TC',   I: null, T: '95',  C: ['120', '70'] },
    { k: 'ITC',  I: '58', T: '95',  C: ['120', '70'] },
    /* ⚠️ LA NOVENA, Y ES LA UNICA QUE PUEDE ROMPER EL CONTRATO DE «UNA SOLA FUENTE». La
       calculada vive DENTRO de `hemo_pam`; el unico estado donde existe como fuente SOLA y el
       campo esta vacio es el que deja el medico borrando la PAM a mano con PAS y PAD cargadas.
       En HEAD ahi no hay PAM para nadie; con el dueno unico, la calculada manda. */
    { k: 'Cv',   I: null, T: null,  C: ['120', '70'], borrarHemo: true },
  ];
  async function escenaPam() {
    const r = { combos: [] };
    try {
      for (const C of PAMCOMBOS) {
        const o = { k: C.k };
        try {
          await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
          o.fallos = await ponerEscena();
          await ponerPOP(!!C.I);
          if (C.I) { try { await ev(`window.__P.abrirPara('pop_sw_pam')`); await poner('pop_sw_pam', C.I); } catch (e) { o.noI = e.message.slice(0,110); } }
          if (C.C) {
            try { await ev(`(function(){ showTab('valvulas'); return 1 })()`); } catch (e) {}
            try { await ev(`window.__P.abrirPara('ao_pas')`); await poner('ao_pas', C.C[0]);
                  await ev(`window.__P.abrirPara('ao_pad')`); await poner('ao_pad', C.C[1]); }
            catch (e) { o.noC = e.message.slice(0, 110); }
          }
          if (C.T) {
            try { await ev(`(function(){ showTab('hemo'); return 1 })()`); } catch (e) {}
            try { await ev(`window.__P.abrirPara('hemo_pam')`); await poner('hemo_pam', C.T); }
            catch (e) { o.noT = e.message.slice(0, 110); }
          }
          if (C.borrarHemo) {
            try { await ev(`(function(){ showTab('hemo'); return 1 })()`); } catch (e) {}
            try { await ev(`window.__P.abrirPara('hemo_pam')`); await borrar('hemo_pam', 'del'); }
            catch (e) { o.noBorra = e.message.slice(0, 110); }
          }
          await pausa(1200);
          o.estado = await ev(`window.__B.pam()`);
          o.popPatron = await ev(`(function(){ try { var r = popPatron();
            return { pam: r.pam, pamFuente: r.pamFuente, vasoSinPam: r.vasoSinPam,
                     pat: r.pat && r.pat.lbl } } catch (e) { return 'EXC ' + e.message } })()`);
          o.hojaPop = await ev(`(function(){ try { return (amiloTextoPOP() || '')
            .split(String.fromCharCode(10)).filter(function(l){ return /PAM/.test(l) }).join(' | ') }
            catch (e) { return 'EXC ' + e.message } })()`, 40000);
          o.informe = await ev(`window.__P.informe('estandar')`, 60000);
          o.suma = await ev(`window.__P.val('en_suma')`);
        } catch (e) { o.err = e.message.slice(0, 200); }
        r.combos.push(o);
        process.stderr.write('[pam] ' + C.k + '\n');
      }
      r.errores = await ev(`window.__B.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.pam = r;
    process.stderr.write('[pam] listo\n');
  }

  /* ── GRUPO `persis` ─────────────────────────────────────────────────────────────────────
     S4, segunda mitad: la PAM tipeada al recargar la pagina (autoguardado) y al guardar y
     reabrir un estudio. */
  async function escenaPersis() {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      r.fallos = await ponerEscena();
      try { await ev(`(function(){ showTab('valvulas'); return 1 })()`); } catch (e) {}
      try { await ev(`window.__P.abrirPara('ao_pas')`); await poner('ao_pas', '120');
            await ev(`window.__P.abrirPara('ao_pad')`); await poner('ao_pad', '70'); } catch (e) { r.noC = e.message.slice(0,110); }
      r.trasCalc = await ev(`window.__B.pam()`);
      try { await ev(`(function(){ showTab('hemo'); return 1 })()`); } catch (e) {}
      try { await ev(`window.__P.abrirPara('hemo_pam')`); await poner('hemo_pam', '95'); } catch (e) { r.noT = e.message.slice(0,110); }
      r.trasTipeo = await ev(`window.__B.pam()`);
      await pausa(2200);                                        // el autoguardado va a 1500 ms
      r.autosaveClave = await ev(`(function(){ try { var k = Object.keys(localStorage).filter(function(x){ return /autosave|borrador/i.test(x) }); return k } catch(e){ return 'EXC' } })()`);
      await evCrudo('location.reload(); 1');
      await pausa(3200);
      await evCrudo(SONDA);
      await evCrudo(SONDA_B);
      await ev(`window.__P.despejar()`);
      await pausa(900);
      r.trasRecarga = await ev(`window.__B.pam()`);
      r.errores = await ev(`window.__B.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.persis = r;
    process.stderr.write('[persis] listo\n');
  }

  /* ── GRUPO `tecla` ──────────────────────────────────────────────────────────────────────
     Doce teclas REALES sobre un campo poblado, y el costo de una pasada del barrido. El reloj
     lo lleva la pagina: medirlo del lado del arnes mide el round-trip de CDP, que es dos
     ordenes de magnitud mas grande y tapa lo que se quiere ver. */
  async function escenaTecla() {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      r.fallos = await ponerEscena();
      await ponerPOP(true);
      /* Con bloques integrados, que es el escenario caro: el barrido de los 17 regenera texto. */
      r.integrados = await ev(`(function(){ var n = 0;
        try { amiloSecs().forEach(function(s){ try { amiloIntegrar(s.k); n++ } catch(e){} }) } catch(e){}
        return n })()`, 60000);
      await pausa(1500);
      try { await ev(`(function(){ showTab('ai-vi'); return 1 })()`); } catch (e) {}
      await ev(`window.__P.abrirPara('ddfvi')`);
      await ev(`(function(){ var e = document.getElementById('ddfvi'); e.focus();
        e.setSelectionRange((e.value||'').length, (e.value||'').length); return 1 })()`);
      await ev(`window.__B.reloj0()`);
      for (let i = 0; i < 12; i++) {
        await tecla('Backspace');
        await ev(`window.__B.marca()`);
      }
      r.teclas = await ev(`window.__B.relojLeer()`);
      await pausa(900);
      r.cronoAmilo = await ev(`window.__B.cronoBarrido('amiloRefrescarTodos')`, 60000);
      r.seguro = await ev(`window.__B.barridoSeguro(3)`, 60000);
      r.cronoEspejos = await ev(`window.__B.cronoBarrido('_espejosBarrerTodos')`, 60000);
      r.espejos = await ev(`window.__B.espejos()`);
      r.errores = await ev(`window.__B.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.tecla = r;
    process.stderr.write('[tecla] listo\n');
  }

  /* ── GRUPO `censo` ─────────────────────────────────────────────────────────────────────
     EL INVENTARIO, medido y no leido. Puebla de una sola vez TODAS las fuentes de otra pestana
     que alimentan los 28 espejos `*_ro` y los textos calculados —con `input` y `change` en cada
     una, que es lo que despacha el navegador cuando el medico tipea—, espera a que corra todo lo
     que la app tiene cableado, y RECIEN AHI llama a cada funcion del embudo. La que mueve algo
     estaba mostrando el dato anterior.
     ⚠️ EL DENOMINADOR ES LA SEGUNDA PASADA. Con todo ya repintado por la primera, la segunda
     tiene que mover CERO: si moviera, el pintor no seria idempotente y el censo estaria contando
     ruido en vez de desfase. */
  const CENSOB = [
    ['peso','82'], ['talla','174'], ['edad','66'], ['sexo','M'],
    ['ddfvi','56'], ['dsfvi','38'], ['fevi','52'], ['siv','14'], ['ppvi','12'],
    ['ai_diam','43'], ['ai_area','23'], ['ad_area','19'],
    ['ao_sin','40'], ['ao_tub','38'],
    ['tapse','15'], ['s_prime','9'], ['vd_bas','44'], ['vci_diam','23'],
    ['tsvd_diametro','26'], ['vti_tsvd','16'],
    ['diam_tsvi','21'], ['itv_tsvi','18'], ['hemo_fc','88'],
    ['onda_e','88'], ['onda_a','55'], ['e_sep','5'], ['e_lat','7'], ['vmax_it','3.0'],
    ['ea_grado','moderada'], ['ia_grado','leve'], ['it_grado','moderada'], ['ip_grado','leve'],
    ['va_morf','bicuspide'],
    ['pericardio','moderado'],
    ['ete_cia_tipo','os'],
    ['mca_tsvd_plax','27'],
    ['ebs_desplazamiento','12'],
    ['coa_istmo','12'],
    ['pop_sw_gc','3.8'], ['pop_sw_fc','92'], ['pop_sw_pam','62'],
    ['pop_sw_paps','40'], ['pop_sw_papd','20'], ['pop_sw_pcp','18'], ['pop_sw_pad','10'],
    ['pop_nor_diluc_mg','4'], ['pop_nor_diluc_ml','100'], ['pop_nor_veloc','10'],
    ['pop_pleura_der','moderado'], ['pop_pulmon_lineasb','bilateral'],
  ];
  async function escenaCenso() {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      /* El Swan y la droga hay que PRENDERLOS antes: sus campos no existen con el selector en
         blanco y la casilla apagada. */
      r.prender = await ev(`window.__B.ponerVarios([['pop_monitor','swan'],['pop_nor_activa','1']])`);
      await pausa(400);
      r.lista = await ev(`window.__B.lista()`);
      r.puesto = await ev(`window.__B.ponerVarios(${JSON.stringify(CENSOB)})`, 60000);
      await pausa(2200);
      r.pasada1 = await ev(`window.__B.correTodas(window.__B.lista())`, 180000);
      await pausa(400);
      r.pasada2 = await ev(`window.__B.correTodas(window.__B.lista())`, 180000);
      /* FASE 2 — ATRIBUCION POR FUENTE. Con todo ya fresco, se cambia UNA fuente por vez y se
         vuelve a preguntar quien quedo viejo. Es lo que dice de QUE depende cada espejo, y
         ademas caza a los pintores que la carga en bloque tapo (un campo cuyo propio `oninput`
         repinta a su vecino). */
      r.porFuente = [];
      for (const [id, val] of CENSOB) {
        const o = { id: id, val: val };
        try {
          const nuevo = /^[0-9.]+$/.test(String(val)) ? String(Number(val) + 3) : val;
          o.cambio = await ev(`window.__B.ponerVarios([[${JSON.stringify(id)}, ${JSON.stringify(nuevo)}]])`);
          if (o.cambio.no && o.cambio.no.length) { o.saltado = true; r.porFuente.push(o); continue; }
          await pausa(1400);
          const m = await ev(`window.__B.correTodas(window.__B.lista())`, 180000);
          o.viejos = m.filter((x) => (x.pinta > 0 || x.prende > 0 ||
                      (x.escribe || []).some((c) => c.id.charAt(0) !== '@')))
                      .map((x) => ({ fn: x.fn, nodos: (x.pintaIds || []).concat(x.prendeIds || [])
                        .concat((x.escribe || []).filter((c) => c.id.charAt(0) !== '@').map((c) => c.id)).slice(0, 10) }));
        } catch (e) { o.err = e.message.slice(0, 150); }
        r.porFuente.push(o);
      }
      r.errores = await ev(`window.__B.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.censo = r;
    process.stderr.write('[censo] listo\n');
  }

  /* ── GRUPO `s56` ───────────────────────────────────────────────────────────────────────
     Los dos puntos que el pedido manda REPORTAR y no arreglar sin permiso.
     S5: lo cargado en VD/VI (pestaña VD/AD) ¿llega al PDF y al bloque POCUS del POP?
     S6: la dosis de una droga marcada ¿llega al informe, a la hoja del PDF y al EN SUMA?
     ⚠️ EL DENOMINADOR DE S5 ES NO CARGAR LOS OTROS DOS CAMINOS. `tep_vdvi` y el par
        `vd_bas`/`ddfvi` dan el mismo cociente por otra puerta: con ellos cargados la sonda
        mediría «sí llega» sin que `vd_vi` hubiera entrado nunca. */
  async function escenaS56() {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`); await ev(`window.__P.calentar()`);
      r.fallos = await ponerEscena();
      /* `ddfvi` y `vd_bas` vienen de la escena: hay que VACIARLOS para aislar `vd_vi`. */
      r.vaciar = await ev(`window.__B.ponerVarios([['vd_bas',''],['ddfvi',''],['tep_vdvi','']])`);
      r.ponerVdVi = await ev(`window.__B.ponerVarios([['vd_vi','1.30']])`);
      await ponerPOP(true);
      r.droga = await ev(`window.__B.ponerVarios([['pop_nor_activa','1']])`);
      await pausa(500);
      r.dosis = await ev(`window.__B.ponerVarios([['pop_nor_dosis','0.25'],['pop_cx_tipo','crm'],['pop_cx_horas','6']])`);
      await pausa(1200);
      r.estado = await ev(`(function(){ var t=function(id){var e=document.getElementById(id); return e?(e.textContent||'').trim():null};
        return { vd_vi: (document.getElementById('vd_vi')||{}).value,
                 tep_vdvi: (document.getElementById('tep_vdvi')||{}).value,
                 pocusVd: t('pop-pocus-vd'), tepInterp: t('tep-vdvi-interp'),
                 vdViTexto: (typeof vdViTexto === 'function' ? vdViTexto(true) : 'SIN') } })()`);
      /* S6 · se INTEGRA el bloque del posoperatorio, que es lo que lo manda a la hoja. */
      r.integrar = await ev(`(function(){ try { amiloIntegrar('pop'); return 'ok' } catch(e){ return 'EXC '+e.message } })()`, 60000);
      await pausa(900);
      r.informe = await ev(`window.__P.informe('estandar')`, 60000);
      r.suma = await ev(`window.__P.val('en_suma')`);
      const pdf = await ev(`window.__P.pdf('estandar')`, 180000);
      r.pdfN = pdf && pdf.nTextos;
      const T = (pdf && pdf.textos) || [];
      const buscar = (re) => T.map(function (x, i) { return [i, x]; })
                              .filter(function (p) { return re.test(p[1]); })
                              .slice(0, 6).map(function (p) { return p[1].slice(0, 140); });
      r.pdfVdVi   = buscar(/VD\s*\/\s*VI|VD\/VI/i);
      r.pdfNor    = buscar(/noradrenalina/i);
      r.pdfVasoac = buscar(/vasoactiv/i);
      /* El VALOR, no el rotulo: la tabla del VD manda la etiqueta y el numero en DOS llamadas
         distintas a `text()`, asi que buscar «VD/VI» solo encuentra la celda del rotulo. */
      r.pdf130 = buscar(/1[.,]30?(?![0-9])/);
      r.pdfIdx = T.map(function (x, i) { return [i, x]; })
                  .filter(function (p) { return /VD\s*\/\s*VI/i.test(p[1]); })
                  .map(function (p) { return { i: p[0], ctx: T.slice(Math.max(0, p[0] - 1), p[0] + 4)
                                      .map(function (z) { return String(z).slice(0, 60) }) } });
      r.infVdVi   = /VD\s*\/\s*VI|1[.,]3/.test(r.informe || '');
      r.infNor    = /noradrenalina/i.test(r.informe || '');
      r.sumaNor   = /noradrenalina/i.test(r.suma || '');
      r.sumaVdVi  = /VD\/VI/i.test(r.suma || '');
      r.errores = await ev(`window.__B.errores()`);
    } catch (e) { r.err = e.message; }
    out.grupos.s56 = r;
    process.stderr.write('[s56] listo\n');
  }

  if (corre('s56'))    await escenaS56();
  if (corre('censo'))  await escenaCenso();
  if (corre('pureza')) await escenaPureza();
  if (corre('viejo'))  await escenaViejo();
  if (corre('pam'))    await escenaPam();
  if (corre('persis')) await escenaPersis();
  if (corre('tecla'))  await escenaTecla();

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  process.stdout.write(JSON.stringify(OUT, null, 1));
  cdp.close(); srv.close(); process.exit(0);
}

main().catch(async (e) => {
  process.stdout.write(JSON.stringify({ err: e.message, stack: String(e.stack || '').slice(0, 1200) }, null, 1));
  process.exit(1);
});
