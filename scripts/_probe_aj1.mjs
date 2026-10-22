#!/usr/bin/env node
/**
 * _probe_aj1.mjs - sonda A/B de SOLO LECTURA para la tanda AJ1, 2026-10-22.
 *
 * Reusa TODA la infraestructura de scripts/_probe_d3.mjs -teclas y clics reales, cierre del
 * arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su denominador,
 * md5 al principio y al final-. NO muta index.html.
 *
 *   node scripts/_probe_aj1.mjs --file /tmp/index.AJ1HEAD.html --solo vd > /tmp/aj1.HEAD.json
 *   node scripts/_probe_aj1.mjs                                --solo vd > /tmp/aj1.NEW.json
 *
 * Grupos:
 *   vd      - los seis cortes del VD en sus bordes exactos, contra la version de MAYO.
 *   strain  - el strain de pared libre sin diferencia por sexo.
 *   coa     - la coartacion reparada sin «Seguimiento anual obligatorio».
 *   ida     - el indice de dimension aortica y la compuerta de la Evidencia de aorta.
 *   eds     - el Ehlers-Danlos vascular en el EN SUMA.
 *   ims     - la IM secundaria y la frase del corte alternativo.
 *   iao     - el flujo reverso de la aorta descendente.
 *   refs    - las fichas de Referencias de lo nuevo.
 *   maq     - cuatro anchos por dos temas, color real y scroll horizontal.
 *   captura - PNG de las zonas tocadas.
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
,

  /* ══ HELPERS PROPIOS DE LA TANDA Y3e ════════════════════════════════════════════════════ */

  /* El estado COMPLETO de los dos espejos del TEER: origen, destino, la marca de espejo, la
     fila del criterio y si su bloque esta a la vista. Es lo que la tabla de caminos compara. */
  teerEsp() {
    var o = {};
    [['fevi', 'teer_fevi', 'teer-c7'], ['dsfvi', 'teer_dtsvi', 'teer-c8']].forEach(function (p) {
      var s = document.getElementById(p[0]), d = document.getElementById(p[1]);
      var f = document.getElementById(p[2]);
      var fr = (f && f.closest) ? f.closest('.calc-row') : null;
      o[p[0]] = { origen: s ? s.value : 'NO EXISTE', destino: d ? d.value : 'NO EXISTE',
                  marca: (d && d.dataset.espejoDe !== undefined) ? d.dataset.espejoDe : null,
                  vivo: d ? (d.dataset.espejoVivo || null) : null,
                  fila: f ? (f.textContent || '').trim() : 'NO EXISTE',
                  filaVis: fr ? (getComputedStyle(fr).display !== 'none') : null };
    });
    o.tipoIM = (document.getElementById('teer_tipo_im') || {}).value;
    var se = document.getElementById('ete-seccion-teer');
    o.secVis = se ? getComputedStyle(se).display : 'NO EXISTE';
    var bs = document.getElementById('teer-bloque-secundaria');
    o.bloqSec = bs ? getComputedStyle(bs).display : 'NO EXISTE';
    try { var t = (typeof teerEstado === 'function') ? teerEstado() : null;
      o.clave = t ? t.clave : null; o.noIng = t ? t.noIngresados : null }
    catch (e) { o.clave = 'EXC: ' + e.message }
    return o },

  /* Abre o cierra la seccion TEER por el CLIC real de su encabezado, que es el gesto. */
  teerSec(abrir) {
    var se = document.getElementById('ete-seccion-teer');
    if (!se) return { err: 'NO EXISTE ete-seccion-teer' };
    var esta = getComputedStyle(se).display !== 'none';
    if (esta === !!abrir) return { ya: esta };
    var h = document.querySelector('[onclick*="toggleEteSeccion(\\'teer\\'"]');
    if (!h) { if (typeof toggleEteSeccion === 'function') toggleEteSeccion('teer');
              return { porFn: true, vis: getComputedStyle(se).display !== 'none' } }
    h.scrollIntoView({ block: 'center' }); h.click();
    return { porClic: true, vis: getComputedStyle(se).display !== 'none' } },

  /* El escenario de AI/VI que esta tanda usa. NO tipea: lo escribe por .value, que es
     exactamente lo que hacen las cinco rutas de restauracion y lo que NO dispara el oninput.
     Usarlo a proposito es lo que permite medir el camino de la restauracion. */
  ponerPorValue(mapa) {
    var o = {};
    Object.keys(mapa).forEach(function (id) {
      var e = document.getElementById(id);
      if (!e) { o[id] = 'NO EXISTE'; return }
      e.value = mapa[id]; o[id] = e.value });
    return o },

  /* ══ VAB: la geometria del dibujo, medida del propio SVG ════════════════════════════════ */
  /* El angulo de la V de cierre: los dos brazos salen de las comisuras y se juntan en el
     centro del orificio, asi que el angulo del vertice ES el angulo comisural de la cuspide
     no fusionada. Se mide del atributo d renderizado, no de la tabla que lo genero. */
  vabAng() {
    var e = document.getElementById('vab-cierre');
    if (!e) return { err: 'NO EXISTE vab-cierre' };
    var d = e.getAttribute('d') || '';
    var n = (d.match(/-?[0-9]+(?:\\.[0-9]+)?/g) || []).map(Number);
    if (n.length < 6) return { err: 'POCOS NUMEROS', d: d };
    var cx = n[2], cy = n[3];
    var a0 = Math.atan2(n[1] - cy, n[0] - cx) * 180 / Math.PI;
    var a1 = Math.atan2(n[5] - cy, n[4] - cx) * 180 / Math.PI;
    var t = Math.abs(a0 - a1) % 360; if (t > 180) t = 360 - t;
    var r1 = function (x) { return Math.round(x * 10) / 10 };
    return { d: d, centro: [cx, cy], ang: r1(t), deg0: r1(a0), deg1: r1(a1),
             c0: [n[0], n[1]], c1: [n[4], n[5]] } },

  /* Geometria derivada: el angulo, la separacion angular del rafe a cada comisura -que es lo
     que dice si la V puede tapar el rafe o sus puntos- y si algo quedo fuera del lienzo. */
  vabGeo() {
    var a = window.__Y.vabAng();
    var o = { ang: a.ang, deg0: a.deg0, deg1: a.deg1, err: a.err || null };
    var rf = document.getElementById('vab-rafe');
    o.rafeOp = rf ? rf.getAttribute('opacity') : 'NO EXISTE';
    var d = rf ? (rf.getAttribute('d') || '') : '';
    var n = (d.match(/-?[0-9]+(?:\\.[0-9]+)?/g) || []).map(Number);
    if (n.length >= 2 && o.rafeOp !== '0' && a.deg0 !== undefined) {
      var ar = Math.atan2(n[1] - 120, n[0] - 120) * 180 / Math.PI;
      var dd = function (x, y) { var t = Math.abs(x - y) % 360;
        return Math.round((t > 180 ? 360 - t : t) * 10) / 10 };
      o.rafeDeg = Math.round(ar * 10) / 10;
      o.rafeAComis = [dd(ar, a.deg0), dd(ar, a.deg1)];
      o.rafeMin = Math.min(o.rafeAComis[0], o.rafeAComis[1]);
    }
    /* Nada visible puede salirse del viewBox de 240. Se mide el atributo, que es el que el
       motor usa: el rect del nodo dependeria del ancho renderizado. */
    o.fuera = [];
    ['vab-lR', 'vab-lL', 'vab-lN', 'vab-d1', 'vab-d2', 'vab-d3', 'vab-d4'].forEach(function (id) {
      var e = document.getElementById(id);
      if (!e || e.getAttribute('opacity') === '0') return;
      var x = parseFloat(e.getAttribute('x') !== null ? e.getAttribute('x') : e.getAttribute('cx'));
      var y = parseFloat(e.getAttribute('y') !== null ? e.getAttribute('y') : e.getAttribute('cy'));
      if (!(x >= 2 && x <= 238 && y >= 2 && y <= 238)) o.fuera.push(id + '@' + x + ',' + y) });
    /* Y ningun punto de calcificacion ni ninguna letra puede caer ENCIMA de un brazo de la V:
       se mide la distancia del punto al segmento comisura-centro. */
    o.cerca = [];
    if (a.c0) {
      var segD = function (px, py, ax, ay, bx, by) {
        var vx = bx - ax, vy = by - ay, wx = px - ax, wy = py - ay;
        var L = vx * vx + vy * vy, t2 = L ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / L)) : 0;
        var dx = px - (ax + t2 * vx), dy = py - (ay + t2 * vy);
        return Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10 };
      ['vab-d1', 'vab-d2', 'vab-d3', 'vab-d4', 'vab-lR', 'vab-lL', 'vab-lN'].forEach(function (id) {
        var e = document.getElementById(id);
        if (!e || e.getAttribute('opacity') === '0') return;
        var x = parseFloat(e.getAttribute('x') !== null ? e.getAttribute('x') : e.getAttribute('cx'));
        var y = parseFloat(e.getAttribute('y') !== null ? e.getAttribute('y') : e.getAttribute('cy'));
        var m = Math.min(segD(x, y, a.c0[0], a.c0[1], 120, 120),
                         segD(x, y, a.c1[0], a.c1[1], 120, 120));
        o.cerca.push({ id: id, dist: m }) });
      o.distMin = Math.min.apply(null, o.cerca.map(function (c) { return c.dist }));
    }
    return o },

  /* El selector de simetria: su rotulo y sus opciones, con el texto que el medico ve. */
  vabSimSel() {
    var e = document.getElementById('vab_simetria');
    if (!e) return 'NO EXISTE';
    var fg = e.closest ? e.closest('.fg') : null;
    var lb = fg ? fg.querySelector('label') : null;
    return { label: lb ? (lb.textContent || '').replace(/\\s+/g, ' ').trim() : null,
             opts: Array.prototype.slice.call(e.options).map(function (o) {
               return o.value + '|' + (o.text || '').trim() }) } },

  /* Donde la palabra «cuspides» tiene que aparecer y donde «senos» NO puede seguir estando
     para la SIMETRIA. El tipo de fusion «de dos senos» es otra cosa y se conserva. */
  vabPalabras() {
    var o = {};
    try { o.frase = (typeof vabFraseValv === 'function') ? vabFraseValv() : 'SIN FN' }
    catch (e) { o.frase = 'EXC: ' + e.message }
    try { var f = (typeof vabPdfFilas === 'function') ? vabPdfFilas() : null;
      o.pdfFilas = f ? f.map(function (x) { return x[0] + '|' + x[1] }) : null }
    catch (e) { o.pdfFilas = 'EXC: ' + e.message }
    o.sel = window.__Y.vabSimSel();
    try { o.tarj = window.__Y.vabTarj('vab-valv') } catch (e) { o.tarj = 'EXC: ' + e.message }
    var hv = (typeof VAB_INF_SENOS !== 'undefined') ? VAB_INF_SENOS : null;
    o.infSenos = hv ? JSON.parse(JSON.stringify(hv)) : 'NO EXISTE';
    var hs = (typeof VAB_SIMETRIA_TXT !== 'undefined') ? VAB_SIMETRIA_TXT : null;
    o.simTxt = hs ? JSON.parse(JSON.stringify(hs)) : 'NO EXISTE';
    return o },

  /* La hoja del PDF de cardiopatias congenitas (ccHoja), que es OTRA superficie. */
  vabHoja() {
    try { if (typeof ccHojaDatos === 'function') return ccHojaDatos('vab') } catch (e) {}
    try { if (typeof _CC_HOJAS !== 'undefined' && _CC_HOJAS) return JSON.parse(JSON.stringify(_CC_HOJAS.vab || null)) } catch (e) {}
    return 'SIN ACCESO' },

  /* El vocabulario del Excel y el del importador, para la tercera categoria. */
  vabExcelVocab() {
    var o = {};
    try { o.etiq = JSON.parse(JSON.stringify(LAB_XLS_ETIQ.vab_simetria)) } catch (e) { o.etiq = 'EXC' }
    try { o.vocab = Object.keys(LAB_XLS_VOCAB.vab_simetria) } catch (e) { o.vocab = 'EXC' }
    return o },

  /* El data URL del dibujo que viaja al PDF: es el que dice si el PAPEL se movio. */
  vabPng() {
    try { var d = (typeof vabDataURL === 'function') ? vabDataURL() : null;
      if (!d) return 'SIN vabDataURL';
      var h = 0, i; for (i = 0; i < d.length; i++) h = ((h << 5) - h + d.charCodeAt(i)) | 0;
      return { largo: d.length, hash: h } }
    catch (e) { return 'EXC: ' + e.message } },

  /* La celda del Excel de la simetria para un estudio dado, y el conteo de columnas. */
  vabExcelCelda(campos) {
    try { if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
      var inf = window.__P.reg(campos || {}, 'x');
      var f = _labExcelRow(inf);
      return { n: Object.keys(f).length, celda: f['VAB simetría de senos'] } }
    catch (e) { return 'EXC: ' + e.message } }
};
1`);

  /* ══ HELPERS PROPIOS DE LA TANDA Y3f ══════════════════════════════════════════════════════
     Van en un TERCER template (`__Z`) para no tocar los dos reusados: asi un cambio de esta
     tanda no puede romper la infraestructura que comparten diez sondas. */
  await evCrudo(`
window.__Z = {
  /* Los CUATRO campos del par FEVI/DSFVI, en los dos sentidos, con su marca de espejo. */
  par() {
    var o = {};
    [['fevi','teer_fevi','teer-c7'], ['dsfvi','teer_dtsvi','teer-c8']].forEach(function(p){
      var a = document.getElementById(p[0]), b = document.getElementById(p[1]);
      var f = document.getElementById(p[2]);
      o[p[0]] = { aivi: a ? a.value : 'NO EXISTE', teer: b ? b.value : 'NO EXISTE',
                  marca: (b && b.dataset.espejoDe !== undefined) ? b.dataset.espejoDe : null,
                  fila: f ? (f.textContent || '').trim() : 'NO EXISTE' };
    });
    /* El VSFVI automatico, que cuelga de la FEVI escrita a mano y del VDFVI. */
    var va = document.getElementById('vauto-vsfvi'), vl = document.getElementById('vauto-vol-lat');
    o.vsfviAuto = va ? va.value : 'NO EXISTE';
    o.volLatido = vl ? vl.value : 'NO EXISTE';
    try { var t = (typeof teerEstado === 'function') ? teerEstado() : null;
      o.clave = t ? t.clave : null } catch (e) { o.clave = 'EXC' }
    return o },

  /* Los cortes COAPT, leidos del rotulo que la pantalla publica. */
  coaptRot() {
    var o = {};
    ['teer_fevi','teer_dtsvi'].forEach(function(id){
      var e = document.getElementById(id);
      var fg = (e && e.closest) ? e.closest('.fg') : null;
      o[id] = fg ? (fg.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE';
    });
    return o },

  /* ══ DOPPLER MITRAL: las 16 celdas con su columna, su fila y su orden en el MARCADO ══════ */
  dopGrid() {
    var g = document.querySelector('.dm-grid');
    if (!g) return { err: 'NO EXISTE .dm-grid' };
    var out = [], i = 0;
    Array.prototype.slice.call(g.children).forEach(function(fg){
      var c = (fg.className.match(/dm-c(\\d)/) || [])[1] || null;
      var f = (fg.className.match(/dm-r(\\d)/) || [])[1] || null;
      var ctl = fg.querySelector('input, select, textarea');
      var lb = fg.querySelector('label');
      out.push({ orden: ++i, col: c ? +c : null, fil: f ? +f : null,
                 id: ctl ? ctl.id : null,
                 rot: lb ? (lb.textContent || '').replace(/\\s+/g,' ').trim() : null,
                 val: ctl ? ctl.value : null,
                 ro: ctl ? !!ctl.readOnly : null });
    });
    return out },

  /* El orden del FOCO real, campo por campo: es lo que el Tab recorre sin tabindex positivos. */
  dopFoco() {
    var g = document.querySelector('.dm-grid');
    if (!g) return { err: 'NO EXISTE .dm-grid' };
    var ctls = Array.prototype.slice.call(g.querySelectorAll('input, select, textarea'));
    var out = [];
    ctls.forEach(function(e){
      e.focus();
      out.push({ id: e.id, llego: document.activeElement === e,
                 tabindex: e.getAttribute('tabindex') });
    });
    return { n: ctls.length, orden: out,
             tabPositivos: ctls.filter(function(e){ return +(e.getAttribute('tabindex')||0) > 0 }).length } },

  /* La POSICION renderizada de cada celda, para comprobar la grilla a cada ancho. */
  dopPos() {
    var g = document.querySelector('.dm-grid');
    if (!g) return { err: 'NO EXISTE .dm-grid' };
    var out = {};
    Array.prototype.slice.call(g.children).forEach(function(fg){
      var ctl = fg.querySelector('input, select, textarea');
      if (!ctl) return;
      var r = fg.getBoundingClientRect();
      out[ctl.id] = { x: Math.round(r.left), y: Math.round(r.top),
                      w: Math.round(r.width), h: Math.round(r.height) };
    });
    var rg = g.getBoundingClientRect();
    out.__grid = { x: Math.round(rg.left), w: Math.round(rg.width) };
    out.__scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    return out },

  /* ══ VAB ════════════════════════════════════════════════════════════════════════════════ */
  irVAB() {
    try { showTab('congenitas');
      var b = document.querySelector('[onclick*="sacc-cc-vab"]');
      var s = document.getElementById('sacc-cc-vab');
      var cuerpo = s ? s.querySelector('.sacc-body') : null;
      if (cuerpo && getComputedStyle(cuerpo).display === 'none' && b) b.click();
      return cuerpo ? getComputedStyle(cuerpo).display : 'NO EXISTE' }
    catch (e) { return 'EXC: ' + e.message } },

  /* Los cuatro campos de SOLO LECTURA de la seccion, el conteo de factores y la conclusion. */
  vabRo() {
    var o = {};
    ['vab_ea_ro','vab_ia_ro','vab_raiz_ro','vab_asc_ro','vab_morf_ro'].forEach(function(id){
      var e = document.getElementById(id); o[id] = e ? e.value : 'NO EXISTE' });
    ['vab-fr','vab-concl'].forEach(function(id){
      var e = document.getElementById(id); o[id] = e ? (e.textContent||'').trim() : 'NO EXISTE' });
    o.funcSel = (function(){ var e = document.getElementById('vab_funcion');
      return e ? e.value : 'NO EXISTE' })();
    /* Los dos ORIGENES, crudos: sin esto, un readonly que no cambia se lee igual que un gesto
       que nunca ocurrio. */
    o.src = { ea_grado: (document.getElementById('ea_grado')||{}).value,
              ia_grado: (document.getElementById('ia_grado')||{}).value,
              ao_sin:   (document.getElementById('ao_sin')||{}).value,
              ao_tub:   (document.getElementById('ao_tub')||{}).value };
    o.funcDer = (function(){ try { return (typeof vabFuncionDerivada === 'function')
      ? vabFuncionDerivada() : 'SIN FN' } catch (e) { return 'EXC' } })();
    try { var c = (typeof vabConclusion === 'function') ? vabConclusion() : null;
      o.conclTxt = c ? c.txt : null; o.conclClave = c ? c.clave : null }
    catch (e) { o.conclTxt = 'EXC: ' + e.message }
    return o },

  /* El dibujo: los atributos renderizados de cada nodo del SVG. */
  vabDib() {
    var svg = document.getElementById('vab-svg');
    if (!svg) return { err: 'NO EXISTE vab-svg' };
    var o = { aria: svg.getAttribute('aria-label') || null, nodos: {} };
    var tit = svg.querySelector('title');
    o.titulo = tit ? (tit.textContent||'').trim() : null;
    Array.prototype.slice.call(svg.querySelectorAll('[id]')).forEach(function(e){
      o.nodos[e.id] = { tag: e.tagName, d: e.getAttribute('d'),
        op: e.getAttribute('opacity'), st: e.getAttribute('stroke'),
        x: e.getAttribute('x'), y: e.getAttribute('y'),
        cx: e.getAttribute('cx'), cy: e.getAttribute('cy'),
        txt: (e.tagName === 'text') ? (e.textContent||'') : null };
    });
    var pie = document.getElementById('vab-ang-nota');
    o.notaAng = pie ? (pie.textContent||'').trim() : 'NO EXISTE';
    var r = svg.getBoundingClientRect();
    o.rect = { w: Math.round(r.width), h: Math.round(r.height) };
    /* Cero elementos fuera del lienzo (viewBox 0 0 240 240). */
    var fuera = [];
    Array.prototype.slice.call(svg.querySelectorAll('circle, text')).forEach(function(e){
      var cx = +(e.getAttribute('cx') || e.getAttribute('x') || 0);
      var cy = +(e.getAttribute('cy') || e.getAttribute('y') || 0);
      if (cx < 0 || cx > 240 || cy < 0 || cy > 240) fuera.push(e.id || e.tagName);
    });
    o.fueraDelLienzo = fuera;
    return o },

  /* La animacion: cuadros pedidos, estado del boton y del control manual. */
  animEstado() {
    var b = document.getElementById('vab-anim-btn');
    var s = document.getElementById('vab-anim-scrub');
    var g = document.getElementById('vab-anim-g');
    var pz = document.getElementById('vab-anim-pausa');
    return { btn: b ? (b.textContent||'').trim() : 'NO EXISTE',
             pausa: pz ? (pz.textContent||'').trim() : 'NO EXISTE',
             pausaPressed: pz ? pz.getAttribute('aria-pressed') : null,
             ctrlVis: (function(){ var w=document.getElementById('vab-anim-ctrl');
               return w ? getComputedStyle(w).display : 'NO EXISTE' })(),
             pressed: b ? b.getAttribute('aria-pressed') : null,
             btnGeo: b ? (function(){ var r = b.getBoundingClientRect();
               return { w: Math.round(r.width), h: Math.round(r.height) } })() : null,
             scrub: s ? s.value : 'NO EXISTE',
             scrubGeo: s ? (function(){ var r = s.getBoundingClientRect();
               return { w: Math.round(r.width), h: Math.round(r.height) } })() : null,
             nodosAnim: g ? g.childNodes.length : 'NO EXISTE' } },

  /* Cuenta los cuadros que la pagina pide en una ventana de tiempo. */
  async rafCuenta(ms) {
    var n = 0, o = window.requestAnimationFrame;
    window.requestAnimationFrame = function(cb){ n++; return o.call(window, cb) };
    await new Promise(function(r){ setTimeout(r, ms || 700) });
    window.requestAnimationFrame = o;
    return n },

  /* N aperturas y cierres de la seccion VAB, contando nodos y oyentes nuevos sobre el SVG. */
  cicloVAB(n) {
    var svg = document.getElementById('vab-svg');
    var cuenta = 0, o = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(t){
      if (this === svg) cuenta++; return o.apply(this, arguments) };
    var b = document.querySelector('[onclick*="sacc-cc-vab"]'), i;
    var antes = document.querySelectorAll('*').length;
    for (i = 0; i < n; i++) { if (b) { b.click(); b.click(); } }
    EventTarget.prototype.addEventListener = o;
    return { ciclos: n, nodosAntes: antes, nodosDespues: document.querySelectorAll('*').length,
             oyentesNuevos: cuenta } },

  /* ══ EVIDENCIA ══════════════════════════════════════════════════════════════════════════ */
  evid() {
    try {
      if (typeof indicRender === 'function') indicRender();
      var c = document.getElementById('indic-cuerpo');
      if (!c) return { err: 'NO EXISTE indic-cuerpo' };
      /* El titulo de cada seccion es el <summary> de su <details>. */
      var tits = Array.prototype.slice.call(c.querySelectorAll('details > summary'))
        .map(function(e){ return (e.textContent||'').trim() })
        .filter(function(t){ return t && t.length > 2 });
      var txt = (c.textContent||'').replace(new RegExp(String.fromCharCode(92)+'s+','g'),' ').trim();
      return { n: tits.length, tits: tits, txt: txt, largo: txt.length };
    } catch (e) { return { err: 'EXC: ' + e.message } } },

  /* ══ INFORME ════════════════════════════════════════════════════════════════════════════ */
  informe(estilo) {
    try {
      if (estilo && typeof setEstiloInforme === 'function') setEstiloInforme(estilo);
      if (typeof generarInforme === 'function') generarInforme();
      var i = document.getElementById('informe_texto');
      var s = document.getElementById('en_suma');
      return { inf: i ? i.value : 'NO EXISTE', suma: s ? s.value : 'NO EXISTE' };
    } catch (e) { return { err: 'EXC: ' + e.message } } },

  /* Las lineas del informe que nombran el derrame o las masas. */
  periMasas(estilo) {
    var r = window.__Z.informe(estilo);
    if (r.err) return r;
    var ls = String(r.inf || '').split(String.fromCharCode(10));
    return { lineas: ls.filter(function(l){
      return /derrame|masa|intracard/i.test(l) }) } },

  /* La hoja de CC que el PDF consume. */
  ccHojas() {
    try { var h = (typeof ccEnInforme === 'function') ? ccEnInforme() : null;
      return h ? h.map(function(x){ return { k: x.k, tit: x.tit, n: (x.txt||'').length } }) : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },

  /* Las etiquetas visibles de los siete tipos, en el selector y en las tablas. */
  tipos() {
    var sel = document.getElementById('vab_tipo');
    var o = { opciones: sel ? Array.prototype.slice.call(sel.options).map(function(op){
      return { v: op.value, t: (op.textContent||'').trim() } }) : 'NO EXISTE' };
    ['VAB_TIPO_TXT','VAB_TIPO_LBL'].forEach(function(n){
      try { o[n] = eval(n) } catch (e) { o[n] = 'SIN ' + n } });
    try { o.xlsEtiq = (typeof LAB_XLS_ETIQ !== 'undefined') ? LAB_XLS_ETIQ.vab_tipo : 'SIN LAB_XLS_ETIQ' }
    catch (e) { o.xlsEtiq = 'EXC' }
    try { o.xlsVocab = (typeof LAB_XLS_VOCAB !== 'undefined') ? LAB_XLS_VOCAB.vab_tipo : 'SIN LAB_XLS_VOCAB' }
    catch (e) { o.xlsVocab = 'EXC' }
    return o },

  /* La celda del Excel para un tipo, por el camino REAL del exportador. */
  xlsVab(campos) {
    try {
      if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
      var f = _labExcelRow({ campos: campos || {}, fecha: '2026-10-20' });
      var o = {};
      Object.keys(f).forEach(function(k){ if (/VAB/i.test(k)) o[k] = f[k] });
      return { n: Object.keys(f).length, vab: o };
    } catch (e) { return 'EXC: ' + e.message } }
};
1`);

  /* ══ HELPERS DE ESTA TANDA, EN UN TERCER TEMPLATE ═════════════════════════════════════════
     No se toca `__P` ni `__Y`: un cambio de esta tanda no puede romper la infraestructura que
     comparten diez sondas. */
  await evCrudo(`
window.__D = {
  /* Los campos del FOP, con la COLUMNA que los contiene. La columna no se deduce de un indice
     escrito a mano: se busca el ancestro .fop-col y se mira su posicion entre sus hermanos,
     asi que lo que se mide es lo RENDERIZADO y no el marcado que yo escribi. */
  cols() {
    var sec = document.getElementById('sacc-cc-fop');
    if (!sec) return { err: 'NO EXISTE sacc-cc-fop' };
    var cols = Array.prototype.slice.call(sec.querySelectorAll('.fop-col'));
    var IDS = ['fop_tunel','fop_mov','fop_asa','fop_asa_mm','fop-asa-lado','fop-asa-interp',
               'fop_contraste','fop_shunt_reposo','fop_shunt_valsalva','fop_burbujas',
               'fop-burb-lat','fop-shunt-grado','fop_acv','fop_trombofilia'];
    var o = { nCols: cols.length, tits: cols.map(function(c){
                var t = c.querySelector('.fop-col-tit'); return t ? (t.textContent||'').trim() : null }),
              colRects: cols.map(function(c){ var r = c.getBoundingClientRect();
                return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) } }),
              campos: {} };
    IDS.forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { o.campos[id] = 'NO EXISTE'; return }
      var p = e, idx = -1;
      while (p && p !== sec) { if (p.classList && p.classList.contains('fop-col')) { idx = cols.indexOf(p); break } p = p.parentNode }
      var r = e.getBoundingClientRect();
      o.campos[id] = { col: idx, w: Math.round(r.width), h: Math.round(r.height),
                       x: Math.round(r.left), y: Math.round(r.top),
                       tag: e.tagName, ro: !!(e.readOnly || e.disabled) };
    });
    return o },

  /* Los tres span de SOLO LECTURA del FOP, mas la conclusion. */
  spans() {
    var g = function(id){ var e = document.getElementById(id); return e ? (e.textContent||'').trim() : 'NO EXISTE' };
    return { lado: g('fop-asa-lado'), interp: g('fop-asa-interp'),
             lat: g('fop-burb-lat'), grado: g('fop-shunt-grado'), concl: g('fop-concl') } },

  /* El dueno del corte, sondeado por su COMPORTAMIENTO y no por la constante. */
  corte() {
    try { return { lado: window.asiaLado(), mm: window.asiaCorteMm(),
                   unLado: window.ASIA_EXC_UN_LADO_MIN, total: window.ASIA_EXC_TOTAL_MIN } }
    catch (e) { return 'EXC: ' + e.message } },

  /* Lo que el clasificador concluye, por su clave y por su texto. */
  concl() {
    try { var c = window.fopConclusion();
          return c ? { clave: c.clave, txt: c.txt, esq: c.esq || null } : null }
    catch (e) { return 'EXC: ' + e.message } },

  /* La linea del EN SUMA que arma ccSumaLinea para el FOP. */
  suma() {
    try { return window.ccSumaLinea('fop') } catch (e) { return 'EXC: ' + e.message } },

  /* Las opciones REALES de los dos selectores nuevos, leidas del DOM. */
  opts(id) {
    var e = document.getElementById(id);
    if (!e) return 'NO EXISTE ' + id;
    return { val: e.value, idx: e.selectedIndex,
             ops: Array.prototype.slice.call(e.options).map(function(o){
               return { v: o.value, t: (o.textContent||'').trim(), hid: o.hidden } }) } },

  /* La hoja de CC del PDF: lo que ccEnInforme deja para el papel. */
  ccHoja() {
    try { var l = window.ccEnInforme() || [];
          return { n: l.length, claves: l.map(function(x){ return x.k }),
                   fop: (function(){ var f = l.filter(function(x){ return x.k === 'fop' })[0];
                     return f ? f.txt : null })() } }
    catch (e) { return 'EXC: ' + e.message } },

  /* La seccion del FOP del panel de Evidencia: filas, bloques VISIBLES y notas. */
  evid() {
    try {
      if (typeof IND_SECS === 'undefined') return 'SIN IND_SECS';
      var s = IND_SECS.filter(function(x){ return x.tit.indexOf('Foramen oval') === 0 })[0];
      if (!s) return 'SIN SECCION';
      var r = s.fn();
      if (!r) return null;
      return { nFilas: (r.filas||[]).length,
               filas: (r.filas||[]).map(function(f){ return { lbl: f.lbl || f[0] || null,
                 val: f.val != null ? f.val : (f[1] != null ? f[1] : null),
                 marca: f.marca || f[2] || null } }),
               nBloques: (r.bloques||[]).length,
               bloques: (r.bloques||[]).map(function(b){ return { tit: b.tit,
                 plegado: !!b.plegado, n: (b.lineas||[]).length,
                 lineas: (b.lineas||[]).map(function(l){ return String(l.txt||'') }) } }),
               guia: r.guia ? r.guia.txt : null,
               nNotas: (r.notas||[]).length };
    } catch (e) { return 'EXC: ' + e.message } },

  /* El HTML PINTADO del panel: un bloque que el objeto trae y el marco no pinta es el defecto
     que el H cazo mirando una captura. */
  evidHTML() {
    try {
      if (typeof indicAbrir === 'function') indicAbrir();
      var c = document.getElementById('indic-cuerpo');
      if (!c) return 'SIN CUERPO';
      var h = c.innerHTML || '';
      var i = h.indexOf('Foramen oval');
      var frag = i < 0 ? '' : h.slice(i, i + 9000);
      return { abierto: true, largo: h.length, hayFOP: i >= 0,
               detalles: (frag.match(/<details/g) || []).length,
               visibleFOP: (function(){
                 var dv = Array.prototype.slice.call(c.querySelectorAll('[data-ind-bloque]'));
                 return dv.length })() };
    } catch (e) { return 'EXC: ' + e.message } },

  /* La ficha de Referencias: se abre y se lee su texto renderizado. */
  ref(id) {
    try {
      if (typeof showTab === 'function') showTab('refs');
      if (typeof refSubTab === 'function') { var b = document.querySelector('[data-refsub]');
        try { refSubTab('otros', b) } catch (e) {} }
      var d = document.getElementById('ref-' + id);
      if (!d) return 'NO EXISTE ref-' + id;
      d.style.display = '';
      if (typeof evRefPintar === 'function') { try { evRefPintar(id) } catch (e) {} }
      /* El escape de espacio en blanco se COCINA dentro del template literal y deja /s+/g,
         que se come todas las eses del texto leido: «Silvestry» salia «Silve try». Se arma el
         regex desde una cadena para que la barra llegue entera al motor. */
      var _WS = new RegExp(String.fromCharCode(92) + 's+', 'g');
      var t = (d.textContent || '').replace(_WS, ' ').trim();
      return { largo: t.length, txt: t.slice(0, 6000) };
    } catch (e) { return 'EXC: ' + e.message } },

  /* El informe y el EN SUMA, enteros, por estilo. */
  papel(estilo) {
    try {
      if (typeof setEstiloInforme === 'function') setEstiloInforme(estilo);
      if (typeof generarInforme === 'function') generarInforme();
      return { inf: window.__P.val('informe_texto'), suma: window.__P.val('en_suma') };
    } catch (e) { return 'EXC: ' + e.message } },

  /* Prende el boton «Integrar al informe» del FOP por su GESTO. */
  integrar() {
    try { var b = document.querySelector('[data-ete-chk="fop_incluir_chk"]');
          if (!b) return 'SIN BOTON';
          b.click();
          var c = document.getElementById('fop_incluir_chk');
          return { chk: !!(c && c.checked) } }
    catch (e) { return 'EXC: ' + e.message } },

  /* El color REAL de los rotulos de columna, en el tema puesto. */
  color() {
    var o = {};
    ['fop-asa-lado','fop-burb-lat','fop-concl'].forEach(function(id){
      var e = document.getElementById(id); o[id] = e ? getComputedStyle(e).color : 'NO EXISTE' });
    var t = document.querySelector('#sacc-cc-fop .fop-col-tit');
    o.tit = t ? getComputedStyle(t).color : 'NO EXISTE';
    return o },

  /* Abre la seccion del FOP por su GESTO. Una seccion cerrada mide 0x0. */
  abrirFOP() {
    try {
      if (typeof showTab === 'function') showTab('congenitas');
      var card = document.getElementById('sacc-cc-fop');
      if (!card) return 'NO EXISTE';
      if (!card.classList.contains('open')) {
        var h = card.querySelector('.sacc-hdr'); if (h) h.click();
      }
      var r = document.getElementById('fop_tunel');
      var g = r ? r.getBoundingClientRect() : null;
      return { abierta: card.classList.contains('open'),
               tunelW: g ? Math.round(g.width) : 0 };
    } catch (e) { return 'EXC: ' + e.message } },

  /* Abre el test de burbuja y las variantes anatomicas de «Otros». */
  abrirOtros() {
    try {
      if (typeof showTab === 'function') showTab('otros');
      ['burbuja','variantes'].forEach(function(k){
        var s = document.getElementById('ete-seccion-' + k);
        if (s && getComputedStyle(s).display === 'none') {
          var h = document.querySelector('[onclick*="toggleEteSeccion(' + String.fromCharCode(39) + k + String.fromCharCode(39) + '"]');
          if (h) h.click();
        } });
      var chk = document.getElementById('otr_burb');
      if (chk && !chk.checked) chk.click();
      /* El bloque de los tres detalles -y con el el selector de latidos- SOLO aparece con
         pasaje: sin esto el control existe y mide 0x0, y la medicion saldria en cero. */
      var pas = document.getElementById('otr_burb_pasaje');
      if (pas && pas.value !== 'si') { pas.value = 'si'; pas.dispatchEvent(new Event('change',{bubbles:true})) }
      if (typeof otrBurbUI === 'function') otrBurbUI();
      var g1 = document.getElementById('otr_asia_lado');
      var g2 = document.getElementById('otr_burb_lat');
      return { lado: g1 ? Math.round(g1.getBoundingClientRect().width) : 0,
               lat:  g2 ? Math.round(g2.getBoundingClientRect().width) : 0,
               burbChk: !!(chk && chk.checked) };
    } catch (e) { return 'EXC: ' + e.message } }
};
1`);

  /* ══ HELPERS PROPIOS DEL D2 ═══════════════════════════════════════════════════════════════
     Se inyectan en un TERCER template para no tocar `__P` ni `__D`, que comparten diez sondas.
     ADVERTENCIA: ni un acento grave adentro, tampoco en los comentarios. */
  await evCrudo(`
window.__E = {
  /* La frase del ASIA tal como la publica su dueno, si existe. Se sondea por COMPORTAMIENTO. */
  frase() {
    try { return (typeof asiaExcFrase === 'function') ? asiaExcFrase() : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },

  /* El predicado del aneurisma, por el dueno. Con el ASIA en «no» tiene que dar false. */
  hay(mm) {
    try { return (typeof asiaPorExcursion === 'function') ? asiaPorExcursion(mm) : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },

  /* La oracion que «Otros» publica para el ASIA, leida del dueno de su texto. */
  otr() {
    try { var l = (typeof otrHallazgos === 'function') ? otrHallazgos() : [];
      var a = l.filter(function(x){ return x.id === 'otr_asia' })[0];
      return { n: l.length, inf: a ? a.inf : null, suma: a ? a.suma : null } }
    catch (e) { return 'EXC: ' + e.message } },

  /* La fila de la excursion de la tabla del PDF del FOP. */
  pdfFila() {
    try { var f = (typeof fopPdfFilas === 'function') ? fopPdfFilas() : null;
      if (!Array.isArray(f)) return { n: 0, exc: null, lat: null };
      var g = function(pref){ var x = f.filter(function(r){ return String(r[0]).indexOf(pref) === 0 })[0];
        return x ? x[1] : null };
      return { n: f.length, exc: g('Excursion'), lat: g('Latidos'), filas: f.map(function(r){ return r[0] + '=' + r[1] }) } }
    catch (e) { return 'EXC: ' + e.message } },

  /* La seccion de Evidencia de la VAB-aorta: se busca por su titulo completo, que es el unico
     que no es prefijo de otro. */
  evidVAB() {
    try {
      if (typeof IND_SECS === 'undefined') return 'SIN IND_SECS';
      var o = {};
      ['Válvula aórtica bicúspide — aorta', 'Válvula aórtica bicúspide — conclusión',
       'Aorta torácica'].forEach(function(t){
        var s = IND_SECS.filter(function(x){ return x.tit.indexOf(t) === 0 })[0];
        if (!s) { o[t] = 'SIN SECCION'; return }
        var r = null; try { r = s.fn() } catch (e) { r = 'EXC: ' + e.message }
        o[t] = (r && typeof r === 'object') ? { nFilas: (r.filas||[]).length } : (r === null ? null : r);
      });
      return o }
    catch (e) { return 'EXC: ' + e.message } },

  /* El HTML PINTADO del panel: cuantas secciones de la VAB llegan a la pantalla. */
  evidPintado() {
    try {
      if (typeof indicAbrir === 'function') indicAbrir();
      var c = document.getElementById('indic-cuerpo');
      if (!c) return 'SIN CUERPO';
      var h = c.textContent || '';
      var o = { largo: h.length,
                vabAorta: h.indexOf('bicúspide — aorta ascendente') >= 0,
                vabConcl: h.indexOf('bicúspide — conclusión') >= 0,
                aorta: h.indexOf('Aorta torácica') >= 0 };
      if (typeof indicCerrar === 'function') indicCerrar();
      return o }
    catch (e) { return 'EXC: ' + e.message } },

  /* == LAS BARRAS DE LAS DOS PESTANAS DE CONGENITAS ==========================================
     Se entra por el GESTO del boton del rail y se mira cual quedo ABIERTA, y para cada una
     abierta se nombra el control que la abrio: el predicado de secAutoOpen es el mismo, asi que
     el culpable se DESCUBRE en vez de suponerse. */
  barras(tabId) {
    var t = document.getElementById(tabId);
    if (!t) return 'NO EXISTE ' + tabId;
    var sel = '.sacc-body input:not([readonly]):not([data-espejo]):not([data-ui]), ' +
              '.sacc-body select:not([data-espejo]):not([data-ui]), .sacc-body textarea:not([data-ui])';
    var o = { n: 0, abiertas: [], culpables: {} };
    Array.prototype.slice.call(t.querySelectorAll('.sacc')).forEach(function(acc){
      o.n++;
      if (!acc.classList.contains('open')) return;
      o.abiertas.push(acc.id);
      var cul = [];
      Array.prototype.slice.call(acc.querySelectorAll(sel)).forEach(function(el){
        var v = false;
        if (el.type === 'checkbox' || el.type === 'radio') v = el.checked;
        else if (el.tagName === 'SELECT') v = el.selectedIndex > 0;
        else v = String(el.value || '').trim() !== '';
        if (v) cul.push((el.id || el.className || el.tagName) + '=' + JSON.stringify(
          el.type === 'checkbox' ? el.checked : el.value));
      });
      o.culpables[acc.id] = cul;
    });
    return o },

  /* Entra a una pestana por el CLIC del boton del rail, que es el gesto del medico: showTab
     LANZA desde el cuerpo de un caso y, sobre todo, el clic es el que corre secAutoOpen. */
  entrar(tabId) {
    var b = document.querySelector('[onclick*="showTab(' + String.fromCharCode(39) +
      String(tabId).replace(/^tab-/, '') + String.fromCharCode(39) + ')"]');
    if (b) { b.click(); return { via: 'clic' } }
    try { showTab(String(tabId).replace(/^tab-/, '')); return { via: 'showTab' } }
    catch (e) { return { via: 'EXC: ' + e.message } } },

  /* == LA CAJA DE CONCLUSION DEL FOP =========================================================
     Se mide la SUPERPOSICION de verdad: la caja de la etiqueta contra la caja de cada linea
     del valor, con getClientRects, que es lo que devuelve una por renglon. Un solapamiento de
     mas de 1 px en los dos ejes es el defecto. */
  concl() {
    var v = document.getElementById('fop-concl');
    if (!v) return 'NO EXISTE fop-concl';
    var row = v.closest ? v.closest('.calc-row') : null;
    var lbl = row ? row.querySelector('.calc-lbl') : null;
    if (!lbl) return 'NO EXISTE la etiqueta';
    var rl = lbl.getBoundingClientRect();
    var rects = Array.prototype.slice.call(v.getClientRects()).map(function(r){
      return { x: Math.round(r.left), y: Math.round(r.top),
               w: Math.round(r.width), h: Math.round(r.height) } });
    var choca = rects.some(function(r){
      return !(r.x >= rl.right - 1 || r.x + r.w <= rl.left + 1 ||
               r.y >= rl.bottom - 1 || r.y + r.h <= rl.top + 1) });
    var rv = v.getBoundingClientRect();
    return { lbl: { x: Math.round(rl.left), y: Math.round(rl.top),
                    w: Math.round(rl.width), h: Math.round(rl.height) },
             val: { x: Math.round(rv.left), y: Math.round(rv.top),
                    w: Math.round(rv.width), h: Math.round(rv.height) },
             lineas: rects.length, rects: rects, choca: choca,
             dir: (function(){ var s = getComputedStyle(row); return s.flexDirection })(),
             txt: (v.textContent || '').trim().slice(0, 80) } },

  /* El ASIA en «no» por los DOS gestos. Devuelve el estado que quedo. */
  asiaNo(desde) {
    var o = { desde: desde };
    try {
      if (desde === 'otros') {
        var c = document.getElementById('otr_asia');
        if (c && c.checked) c.click();
        o.chk = !!(c && c.checked);
      } else {
        var s = document.getElementById('fop_asa');
        if (s) { s.value = 'no'; s.dispatchEvent(new Event('change', { bubbles: true })) }
        o.fopAsa = s ? s.value : null;
      }
      o.lado = window.__P.val('otr_asia_lado');
      o.chk = (function(){ var c = document.getElementById('otr_asia'); return !!(c && c.checked) })();
      o.fopAsa = window.__P.val('fop_asa');
      o.spanLado = window.__P.txt('fop-asa-lado');
      o.spanInterp = window.__P.txt('fop-asa-interp');
      o.mm = window.__P.val('fop_asa_mm');
      o.hay = window.__E.hay(parseFloat(o.mm));
      o.frase = window.__E.frase();
      try { var c = window.fopConclusion(); o.concl = c ? c.txt : null } catch (e) { o.concl = 'EXC' }
      try { o.suma = window.ccSumaLinea('fop') } catch (e) { o.suma = 'EXC' }
      o.otr = window.__E.otr();
      o.pdf = window.__E.pdfFila();
    } catch (e) { o.err = 'EXC: ' + e.message }
    return o }
};
1`);

  /* ══ HELPERS PROPIOS DEL D3 ═══════════════════════════════════════════════════════════════
     ADVERTENCIA: ni un acento grave adentro, tampoco en los comentarios. */
  await evCrudo(`
window.__F = {
  /* == LA ESCENA DEL MEDICO, EXACTA =========================================================
     Tilda la casilla del ASIA en «Otros», elige el lado y escribe el numero en la CAJA DE
     DETALLE -que es lo que el medico hizo, porque es el unico lugar de esa pestana donde se
     puede escribir un numero-. NO toca fop_asa_mm. */
  escenaMedico(lado, nota) {
    var o = {};
    try {
      var c = document.getElementById('otr_asia');
      if (c && !c.checked) c.click();
      o.chk = !!(c && c.checked);
      if (lado) { var s = document.getElementById('otr_asia_lado');
        if (s) { s.value = lado; s.dispatchEvent(new Event('change', { bubbles: true })) }
        o.lado = s ? s.value : null; }
      else o.lado = window.__P.val('otr_asia_lado');
      o.mmFop = window.__P.val('fop_asa_mm');
      o.nota = window.__P.val('otr_asia_nota');
    } catch (e) { o.err = 'EXC: ' + e.message }
    return o },

  /* Dice si la pestana «Otros» tiene ALGUN campo donde escribir la excursion en mm. Se busca
     por el DOM renderizado y no por una lista escrita a mano: un campo nuevo aparece aca. */
  camposOtros() {
    var sec = document.getElementById('tab-otros');
    if (!sec) return 'NO EXISTE tab-otros';
    var o = { numericos: [], textos: [], selects: [] };
    Array.prototype.slice.call(sec.querySelectorAll('input,select,textarea')).forEach(function(e){
      var id = e.id || '(sin id)';
      if (!/asia|asa/i.test(id)) return;
      var lbl = null, p = e.parentNode;
      while (p && p.nodeType === 1 && !lbl) { var l = p.querySelector ? p.querySelector('label') : null;
        if (l) lbl = (l.textContent || '').trim(); p = p.parentNode; }
      var reg = { id: id, tag: e.tagName, tipo: e.type || null, lbl: lbl,
                  ph: e.placeholder || null };
      if (e.tagName === 'SELECT') o.selects.push(reg);
      else if (e.type === 'number') o.numericos.push(reg);
      else o.textos.push(reg);
    });
    o.hayFopAsaMmEnOtros = !!(sec.querySelector('#fop_asa_mm'));
    return o },

  /* Los SEIS consumidores de la frase del ASIA, leidos a la vez sobre el mismo estado. */
  seis() {
    var o = {};
    try { o.frase = (typeof asiaExcFrase === 'function') ? asiaExcFrase() : 'SIN FN' } catch (e) { o.frase = 'EXC' }
    try { var c = window.fopConclusion(); o.concl = c ? c.txt : null } catch (e) { o.concl = 'EXC' }
    try { o.suma = window.ccSumaLinea('fop') } catch (e) { o.suma = 'EXC' }
    try { o.otr = window.__E.otr() } catch (e) { o.otr = 'EXC' }
    try { o.pdf = window.__E.pdfFila() } catch (e) { o.pdf = 'EXC' }
    o.spanInterp = window.__P.txt('fop-asa-interp');
    o.spanLado = window.__P.txt('fop-asa-lado');
    return o },

  /* El renglon del ASIA del informe RENDERIZADO, buscado en el texto del textarea. */
  renglon(txt) {
    if (txt == null) return null;
    var ls = String(txt).split(String.fromCharCode(10));
    var hit = ls.filter(function(l){ return l.indexOf('neurisma del septum') >= 0 });
    return hit.length ? hit : null },

  /* El boton «Regenerar Informe», por su gesto. */
  regenerar() {
    try {
      var b = Array.prototype.slice.call(document.querySelectorAll('button'))
        .filter(function(x){ return /regenerar/i.test((x.textContent||'')) })[0];
      if (!b) return 'SIN BOTON';
      b.click();
      return { ok: true, txt: (b.textContent||'').trim().slice(0, 40) };
    } catch (e) { return 'EXC: ' + e.message } },

  /* == EL ESPEJO DE LA EXCURSION, en los dos sentidos ======================================
     Devuelve los DOS campos para que el A/B vea si quedaron de acuerdo. */
  mm() { return { otr: window.__P.val('otr-asia-mm'), fop: window.__P.val('fop_asa_mm') } },

  /* Dice si el campo nuevo viaja con el estudio. Se le pregunta al predicado REAL. */
  esDelEstudio(id) {
    try { return (typeof _noEsDelEstudio === 'function') ? !_noEsDelEstudio(id) : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },

  /* El boton «Generar Informe», por su gesto. */
  generar() {
    try {
      var b = Array.prototype.slice.call(document.querySelectorAll('button'))
        .filter(function(x){ return /^.{0,3}generar informe/i.test((x.textContent||'').trim()) })[0];
      if (!b) return 'SIN BOTON';
      b.click();
      return { ok: true, txt: (b.textContent||'').trim().slice(0, 40) };
    } catch (e) { return 'EXC: ' + e.message } }
};
1`);

  /* ══ HELPERS PROPIOS DE LA TANDA AJ1 ══════════════════════════════════════════════════════
     Todo lo que esta sonda mide de la app vive aca. Cada lectura devuelve un centinela de
     TEXTO cuando la pieza no existe -«SIN FN», «NO EXISTE»- en vez de reventar: contra el arbol
     de HEAD varias de estas piezas no estan, y un TypeError se lleva la corrida entera y deja
     de distinguir «el arbol es distinto» de «la sonda sabe medir».
     ──────────────────────────────────────────────────────────────────────────────────────── */
  await evCrudo(`
window.__A = {
  grado(clave, x) {
    try { return (typeof ase25Grado === 'function') ? ase25Grado(clave, x) : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },
  rango(clave) {
    try { return (typeof ase25Rango === 'function') ? ase25Rango(clave) : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },
  disf(t, s) {
    try { return (typeof vdDisfGrado === 'function') ? (vdDisfGrado(t, s) || 'NULO') : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },
  cortesFijos() {
    var o = {};
    ['UMBRAL_TAPSE_NORMAL','UMBRAL_SPRIME_NORMAL','UMBRAL_TAP_HTP','IA_VMAX_TD_SEVERA']
      .forEach(function(k){ o[k] = (typeof window[k] !== 'undefined') ? window[k] : 'NO EXISTE' });
    try { o.ap_banda = (typeof IP_AP_BANDA !== 'undefined') ? IP_AP_BANDA.join('-') : 'NO EXISTE' }
    catch (e) { o.ap_banda = 'NO EXISTE' }
    return o },
  vdPantalla() {
    var g = function(id){ var e = document.getElementById(id); return e ? (e.textContent||'').trim() : 'NO EXISTE' };
    return { tapseFila: g('tapse-interp'), sprimeFila: g('sprime-interp'),
             facFila: g('fac-interp'), fevdFila: g('fevd-interp'),
             paredFila: g('vd-pared-interp'), teiFila: g('vd-tei-interp'),
             inf: window.__P.val('informe_texto'), suma: window.__P.val('en_suma') } },

  strainConst() {
    if (typeof VD_STRAIN_NORMAL === 'undefined') return 'NO EXISTE';
    var x = VD_STRAIN_NORMAL;
    return (x && typeof x === 'object') ? { porSexo: true, M: x.M, F: x.F } : { porSexo: false, v: x } },
  strainClas(sexo, pct) {
    var e = document.getElementById('sexo');
    if (e) { e.value = sexo; e.dispatchEvent(new Event('change', { bubbles: true })) }
    var u, normal;
    try {
      if (typeof VD_STRAIN_NORMAL === 'undefined') return 'NO EXISTE';
      var V = VD_STRAIN_NORMAL;
      if (V && typeof V === 'object') {
        var sx = (sexo === 'M' || sexo === 'F') ? sexo : null;
        u = sx ? V[sx] : null;
        normal = (u === null) ? null : (pct < u);
      } else { u = V; normal = (pct < u) }
    } catch (x2) { return 'EXC: ' + x2.message }
    return { umbral: (u === null ? 'NULO' : u), normal: (normal === null ? 'NULO' : normal) } },
  strainTexto() {
    var h = document.documentElement.innerHTML;
    return { mencionaHombres: h.indexOf('m' + 'as negativo que \\u221220 %</b> en hombres') > -1,
             menciona21: h.indexOf('\\u221221') > -1,
             mencionaMayo: h.indexOf('ASE 2025 de mayo, pared libre') > -1 } },

  coaEscena(sit) {
    var S = function(id, v2){ var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
      e.value = v2; e.dispatchEvent(new Event('change', { bubbles: true }));
      e.dispatchEvent(new Event('input', { bubbles: true })); return e.value };
    S('nombre', 'AJ1COA');
    var r = { set: S('coa_situacion', sit) };
    S('coa_gmax_vmax', '3.2'); S('coa_gmedio', '25');
    var chk = document.getElementById('coart_incluir_chk');
    if (chk && !chk.checked) chk.click();
    try { if (typeof coaSync === 'function') coaSync() } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    r.seg = (typeof coaSeguimiento === 'function') ? (coaSeguimiento() || 'NULO') : 'SIN FN';
    var pant = document.getElementById('coa-seguimiento');
    r.pantalla = pant ? (pant.textContent || '').trim() : 'NO EXISTE';
    r.inf = window.__P.val('informe_texto');
    r.suma = window.__P.val('en_suma');
    r.infTieneSeg = (r.inf || '').indexOf('Seguimiento anual obligatorio') > -1;
    r.sumaTieneSeg = (r.suma || '').indexOf('Seguimiento anual obligatorio') > -1;
    r.pdf = window.__P.pdf('clasico');
    r.pdfTieneSeg = !!(r.pdf && r.pdf.textos &&
      r.pdf.textos.filter(function(t){ return String(t).indexOf('Seguimiento anual obligatorio') > -1 }).length);
    return r },
  coaEvid() {
    var S = function(id, v2){ var e = document.getElementById(id); if (!e) return; e.value = v2;
      e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })) };
    S('coa_situacion', 'post_stent'); S('coa_gmax_vmax', '3.2'); S('coa_gmedio', '25');
    if (typeof _indCoa !== 'function') return 'SIN FN';
    var r;
    try { r = _indCoa() } catch (e) { return 'EXC: ' + e.message }
    if (!r) return 'NULO';
    var bl = (r.bloques || []).map(function(b){ return { tit: b.tit,
      lineas: (b.lineas || []).map(function(l){ return String(l.txt || l) }) } });
    return { nBloques: bl.length, bloques: bl, nNotas: (r.notas || []).length,
             notas: r.notas || [] } },

  idaEscena(ao, peso, talla) {
    var S = function(id, v2){ var e = document.getElementById(id); if (!e) return; e.value = v2;
      e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) };
    S('nombre', 'AJ1IDA'); S('peso', peso); S('talla', talla); S('ao_tub', ao);
    try { window.__P.calentar() } catch (e) {}
    var bsa = (typeof getBSA === 'function') ? getBSA() : 'SIN FN';
    var o = { bsa: bsa, ao: ao,
      ida: (typeof aoIdaVal === 'function') ? (aoIdaVal() === null ? 'NULO' : aoIdaVal()) : 'SIN FN',
      idaDil: (typeof aoIdaDilatado === 'function') ? aoIdaDilatado() : 'SIN FN',
      dilAbs: (typeof aoDilatada === 'function') ? aoDilatada() : 'SIN FN' };
    try { o.secAo = (typeof _indAo === 'function') ? (_indAo() ? 'ABRE' : 'NULO') : 'SIN FN' }
    catch (e) { o.secAo = 'EXC: ' + e.message }
    try { o.secVAB = (typeof _indVAB === 'function') ? (_indVAB() ? 'ABRE' : 'NULO') : 'SIN FN' }
    catch (e) { o.secVAB = 'EXC: ' + e.message }
    o.inf = window.__P.val('informe_texto');
    o.suma = window.__P.val('en_suma');
    return o },
  aoTarjeta() {
    if (typeof evTarjetaAo !== 'function') return 'SIN FN';
    var n;
    try { n = evTarjetaAo() } catch (e) { return 'EXC: ' + e.message }
    var t = n ? (n.textContent || '') : '';
    return { largo: t.length, nota40: t.indexOf('40 a 44') > -1 || t.indexOf('Figura 24') > -1,
             ida: t.indexOf('22 mm/m') > -1, txt: t.slice(0, 1400) } },

  edsEscena(sind, ao) {
    var S = function(id, v2){ var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
      e.value = v2; e.dispatchEvent(new Event('change', { bubbles: true }));
      e.dispatchEvent(new Event('input', { bubbles: true })); return e.value };
    S('nombre', 'AJ1EDS');
    var r = { sind: S('marfan_sindrome', sind) };
    S('marfan_ao_ascendente', ao);
    var chk = document.getElementById('marfan_incluir_chk');
    if (chk && !chk.checked) chk.click();
    try { if (typeof marfanSync === 'function') marfanSync() } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    r.estado = (typeof marfanEstado === 'function') ? (function(){ try { var x = marfanEstado();
      return { clave: x.clave, txt: x.txt } } catch (e) { return 'EXC' } })() : 'SIN FN';
    r.inf = window.__P.val('informe_texto');
    r.suma = window.__P.val('en_suma');
    return r },

  imsEscena(mec, eroa, volr) {
    var S = function(id, v2){ var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
      e.value = v2; e.dispatchEvent(new Event('change', { bubbles: true }));
      e.dispatchEvent(new Event('input', { bubbles: true })); return e.value };
    S('nombre', 'AJ1IMS');
    /* El mecanismo lo contesta el panel; la app lo lee con imEsSecundariaIM. */
    try { if (mec && typeof _indClinSet === 'function') _indClinSet('im.mecanismo', mec) } catch (e) {}
    if (eroa) S('eroa_man', eroa);
    if (volr) S('volr_man', volr);
    try { if (typeof calcIM_ESC === 'function') calcIM_ESC() } catch (e) {}
    try { if (typeof imSecAvisoSiExiste === 'function') imSecAvisoSiExiste() } catch (e) {}
    var el = document.getElementById('im-sec-aviso');
    var el2 = document.getElementById('im-sec-alt');
    return { mec: (typeof imEsSecundariaIM === 'function') ? (function(){ try { return !!imEsSecundariaIM() }
               catch (e) { return 'EXC' } })() : 'SIN FN',
             aviso: el ? (el.textContent || '').trim() : 'NO EXISTE',
             alt: el2 ? (el2.textContent || '').trim() : 'NO EXISTE',
             grado: window.__P.val('im_grado'),
             eroa: window.__P.txt('eroa-val'), volr: window.__P.txt('volr-val') } },

  iaoCampos() {
    var o = {};
    ['ia_vmax_td','ia_vti_desc','ia_rev_dur'].forEach(function(id){
      var e = document.getElementById(id);
      o[id] = e ? { tag: e.tagName, ops: e.tagName === 'SELECT'
        ? Array.prototype.slice.call(e.options).map(function(x){ return x.value }) : null } : 'NO EXISTE' });
    return o },
  iaoEscena(dur, vti, vtd) {
    var S = function(id, v2){ var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
      e.value = v2; e.dispatchEvent(new Event('change', { bubbles: true }));
      e.dispatchEvent(new Event('input', { bubbles: true })); return e.value };
    S('nombre', 'AJ1IAO');
    var r = {};
    if (dur) r.durSet = S('ia_rev_dur', dur);
    if (vti) S('ia_vti_desc', vti);
    if (vtd) S('ia_vmax_td', vtd);
    try { if (typeof calcIA_ESC === 'function') calcIA_ESC() } catch (e) {}
    r.filaVti = window.__P.txt('ia-vti-desc-interp');
    r.filaVtd = window.__P.txt('ia-vtd-interp');
    r.grado = window.__P.val('ia_grado');
    r.sev = window.__P.txt('ia-severidad');
    return r },

  refsTexto() {
    var o = {};
    try { showTab('refs') } catch (x) {}
    ['ref-vd2','ref-ao2','ref-aocx','ref-ia','ref-im'].forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { o[id] = 'NO EXISTE'; return }
      e.style.display = '';
      try { if (typeof evRefPintar === 'function') evRefPintar(id.replace('ref-','')) } catch (x) {}
      try { if (typeof aoCxPintar === 'function' && id === 'ref-aocx') aoCxPintar() } catch (x) {}
      var t = (e.textContent || '').replace(/[ ]+/g, ' ').trim();
      o[id] = { largo: t.length,
                mayo: t.indexOf('mayo') > -1,
                folio145: t.indexOf('145') > -1,
                folio159: t.indexOf('159') > -1,
                folio621: t.indexOf('621') > -1,
                libro: t.indexOf('Moya Mur') > -1,
                ida: t.indexOf('22 mm/m') > -1,
                t: t.slice(0, 2600) } });
    return o },

  maqueta() {
    var de = document.documentElement;
    var o = { scrollH: de.scrollWidth > de.clientWidth,
              sw: de.scrollWidth, cw: de.clientWidth };
    o.colorAviso = window.__P.color('#im-sec-aviso');
    o.colorAlt = window.__P.color('#im-sec-alt');
    o.geoAlt = window.__P.geo('im-sec-alt');
    o.geoDur = window.__P.geo('ia_rev_dur');
    return o },

  paraCaptura(zona) {
    try {
      if (zona === 'vd') { showTab('vd'); return 'vd' }
      if (zona === 'iao' || zona === 'ims') {
        showTab('valvulas');
        var s = (zona === 'iao') ? 'valv-aortica' : 'valv-mitral';
        try { toggleEteSeccion(s) } catch (e) {}
        try { valvDatosTog(zona === 'iao' ? 'caja-insuf-aortica' : 'caja-insuf-mitral') } catch (e) {}
        return zona;
      }
    } catch (e) { return 'EXC: ' + e.message }
    return 'sin zona' }
};
1`);

  /* ══ GRUPO «vd» — LOS SEIS CORTES DE LA VERSION DE MAYO, EN SUS BORDES EXACTOS ════════════
     Se mide por el DUENO (`ase25Grado`) y por lo RENDERIZADO (la fila del cuadro y el informe),
     porque el dueno solo no dice si alguna superficie se quedo con el valor viejo.
     ──────────────────────────────────────────────────────────────────────────────────────── */
  if (corre('vd')) {
    const r = { dueno: {}, disf: {}, filas: {}, rotulos: {}, nocambia: {} };
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.calentar()`);
      /* El dueno, por sus bordes. Tres valores por corte: uno abajo, el exacto y uno arriba. */
      const T = { tapse: [14, 13, 12], s_prime: [7.3, 7.2, 7.1], fevd: [40, 39, 38],
                  vd_fac: [30, 29, 28], vd_pared: [5, 7, 9], ad_area: [18, 19, 22] };
      for (const k of Object.keys(T)) {
        r.dueno[k] = {};
        for (const x of T[k]) r.dueno[k][String(x)] = await ev(`window.__A.grado(${JSON.stringify(k)}, ${x})`);
      }
      /* El rotulo que publica cada banda: es lo que la ficha y el cuadro imprimen. */
      for (const k of ['tapse', 's_prime', 'fevd', 'vd_fac'])
        r.rotulos[k] = await ev(`window.__A.rango(${JSON.stringify(k)})`);
      /* `vdDisfGrado` por los dos bordes: en mayo no puede salir «leve-moderada» por el solape. */
      const D = [['13', null], [null, '7.2'], ['14', null], [null, '7.3'], ['15', '6'], ['13', '7.2']];
      for (const p of D) r.disf[String(p[0]) + '/' + String(p[1])] = await ev(`window.__A.disf(${JSON.stringify(p[0])}, ${JSON.stringify(p[1])})`);
      /* Lo RENDERIZADO: la fila del cuadro y el informe, con teclas reales. */
      for (const par of [['tapse', '13'], ['tapse', '14'], ['s_prime', '7.2'], ['s_prime', '7.3']]) {
        await ev(`window.__P.nuevo()`);
        await tipear('nombre', 'AJ1VD');
        await tipear(par[0], par[1]);
        await ev(`window.__P.calentar()`);
        r.filas[par[0] + '=' + par[1]] = await ev(`window.__A.vdPantalla()`);
      }
      /* CONTROL: lo que esta tanda NO toca. */
      await ev(`window.__P.nuevo()`);
      await tipear('tapse', '16');
      await ev(`window.__P.calentar()`);
      r.nocambia.tapse16 = await ev(`window.__A.vdPantalla()`);
      await ev(`window.__P.nuevo()`);
      await tipear('vd_area_d', '20'); await tipear('vd_area_s', '14');
      await ev(`window.__P.calentar()`);
      r.nocambia.fac30 = await ev(`window.__A.vdPantalla()`);
      r.nocambia.cortes = await ev(`window.__A.cortesFijos()`);
    } catch (e) { r.err = e.message; }
    out.grupos.vd = r;
    process.stderr.write('[vd] listo\n');
  }

  /* ══ GRUPO «strain» — EL STRAIN DE PARED LIBRE SIN DIFERENCIA POR SEXO ════════════════════ */
  if (corre('strain')) {
    const r = { const: null, escenas: {}, texto: null };
    try {
      await ev(`window.__P.nuevo()`);
      r.const = await ev(`window.__A.strainConst()`);
      for (const sx of ['', 'M', 'F'])
        for (const pct of [-21, -20.5, -20, -19])
          r.escenas[sx + '|' + pct] = await ev(`window.__A.strainClas(${JSON.stringify(sx)}, ${pct})`);
      r.texto = await ev(`window.__A.strainTexto()`);
    } catch (e) { r.err = e.message; }
    out.grupos.strain = r;
    process.stderr.write('[strain] listo\n');
  }

  /* ══ GRUPO «coa» — LA COARTACION REPARADA ═════════════════════════════════════════════════ */
  if (corre('coa')) {
    const r = { seguimiento: {}, superficies: {}, evid: {} };
    try {
      for (const sit of ['post_stent', 'post_cirugia', 'recoartacion', 'nativa']) {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.despejar()`);
        r.seguimiento[sit] = await ev(`window.__A.coaEscena(${JSON.stringify(sit)})`, 60000);
      }
      r.evid = await ev(`window.__A.coaEvid()`, 60000);
    } catch (e) { r.err = e.message; }
    out.grupos.coa = r;
    process.stderr.write('[coa] listo\n');
  }

  /* ══ GRUPO «ida» — EL INDICE DE DIMENSION AORTICA ═════════════════════════════════════════ */
  if (corre('ida')) {
    const r = { escenas: {}, tarjeta: null };
    try {
      /* 21 / 22 / 23 mm/m2 con superficie corporal, y la misma aorta sin peso ni talla.
         Con peso 50 y talla 150 la ASC de Mosteller es 1,4434 m2. */
      const E = [['30', '50', '150'], ['32', '50', '150'], ['34', '50', '150'],
                 ['30', '', ''], ['41', '', ''], ['36', '70', '170']];
      for (const e of E) {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.despejar()`);
        r.escenas[e.join('/')] = await ev(`window.__A.idaEscena(${JSON.stringify(e[0])}, ${JSON.stringify(e[1])}, ${JSON.stringify(e[2])})`, 60000);
      }
      r.tarjeta = await ev(`window.__A.aoTarjeta()`);
    } catch (e) { r.err = e.message; }
    out.grupos.ida = r;
    process.stderr.write('[ida] listo\n');
  }

  /* ══ GRUPO «eds» — EL EHLERS-DANLOS VASCULAR EN EL EN SUMA ════════════════════════════════ */
  if (corre('eds')) {
    const r = {};
    try {
      for (const e of [['eds', '48'], ['eds', ''], ['marfan', '48'], ['', '48']]) {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.despejar()`);
        r[e[0] + '/' + e[1]] = await ev(`window.__A.edsEscena(${JSON.stringify(e[0])}, ${JSON.stringify(e[1])})`, 60000);
      }
    } catch (e) { r.err = e.message; }
    out.grupos.eds = r;
    process.stderr.write('[eds] listo\n');
  }

  /* ══ GRUPO «ims» — LA IM SECUNDARIA Y EL CORTE ALTERNATIVO ════════════════════════════════ */
  if (corre('ims')) {
    const r = {};
    try {
      const E = [['secundaria', '29', ''], ['secundaria', '30', ''], ['secundaria', '', '44'],
                 ['secundaria', '', '45'], ['primaria', '30', '45'], ['', '30', '45'],
                 ['secundaria', '', '']];
      for (const e of E) {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.despejar()`);
        r[e.join('/')] = await ev(`window.__A.imsEscena(${JSON.stringify(e[0])}, ${JSON.stringify(e[1])}, ${JSON.stringify(e[2])})`, 60000);
      }
    } catch (e) { r.err = e.message; }
    out.grupos.ims = r;
    process.stderr.write('[ims] listo\n');
  }

  /* ══ GRUPO «iao» — EL FLUJO REVERSO DE LA AORTA DESCENDENTE ═══════════════════════════════ */
  if (corre('iao')) {
    const r = { campos: null, escenas: {} };
    try {
      await ev(`window.__P.nuevo()`);
      r.campos = await ev(`window.__A.iaoCampos()`);
      const E = [['', '14', ''], ['', '16', ''], ['holo', '14', ''], ['holo', '15', ''],
                 ['holo', '16', ''], ['breve', '16', ''], ['holo', '', '19'],
                 ['holo', '', '20'], ['holo', '', '21'], ['', '', '21'], ['', '30', '']];
      for (const e of E) {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.despejar()`);
        r.escenas[e.join('/')] = await ev(`window.__A.iaoEscena(${JSON.stringify(e[0])}, ${JSON.stringify(e[1])}, ${JSON.stringify(e[2])})`, 60000);
      }
    } catch (e) { r.err = e.message; }
    out.grupos.iao = r;
    process.stderr.write('[iao] listo\n');
  }

  /* ══ GRUPO «refs» — LAS FICHAS DE REFERENCIAS ═════════════════════════════════════════════ */
  if (corre('refs')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      r.fichas = await ev(`window.__A.refsTexto()`, 60000);
      r.censo = await ev(`window.__P.refsN()`);
    } catch (e) { r.err = e.message; }
    out.grupos.refs = r;
    process.stderr.write('[refs] listo\n');
  }

  /* ══ GRUPO «maq» — CUATRO ANCHOS POR DOS TEMAS ════════════════════════════════════════════ */
  if (corre('maq')) {
    const r = {};
    try {
      for (const [w, h] of [[1200, 700], [768, 1024], [390, 844], [360, 740]]) {
        for (const claro of [false, true]) {
          await viewport(w, h);
          const t = await ev(`window.__P.tema(${claro})`);
          if (!!t.claro !== claro) throw new Error('EL TEMA NO QUEDO en ' + w + '/' + claro);
          await ev(`window.__P.despejar()`);
          r[w + 'x' + h + (claro ? '|claro' : '|noche')] = await ev(`window.__A.maqueta()`, 60000);
        }
      }
      await ev(`window.__P.tema(false)`);
      await viewport(1200, 900);
    } catch (e) { r.err = e.message; }
    out.grupos.maq = r;
    process.stderr.write('[maq] listo\n');
  }

  /* ══ GRUPO «captura» — PNG DE LAS ZONAS TOCADAS ═══════════════════════════════════════════ */
  if (corre('captura')) {
    const r = {};
    const DEST = arg('--dest') || '/tmp';
    try {
      await viewport(1200, 900);
      for (const claro of [false, true]) {
        await ev(`window.__P.tema(${claro})`);
        await ev(`window.__P.despejar()`);
        for (const z of ['vd', 'iao', 'ims']) {
          const abierto = await ev(`window.__A.paraCaptura(${JSON.stringify(z)})`, 60000);
          await ev(`window.__P.despejar()`);
          const png = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
          const f = DEST + '/aj1_' + z + '_' + (claro ? 'claro' : 'noche') + '.png';
          await writeFile(f, Buffer.from(png.data, 'base64'));
          r[z + (claro ? '|claro' : '|noche')] = { archivo: f, abierto: abierto,
            md5: createHash('md5').update(Buffer.from(png.data, 'base64')).digest('hex').slice(0, 10) };
        }
      }
      await ev(`window.__P.tema(false)`);
    } catch (e) { r.err = e.message; }
    out.grupos.captura = r;
    process.stderr.write('[captura] listo\n');
  }


  if (corre('ctrl')) {
    const r = {};
    /* Un escenario AJENO a la VAB y al TEER: la escena donde esta tanda NO debe actuar. */
    const AJENO = { nombre: 'CTRL', edad: '58', peso: '78', talla: '172',
                    onda_e: '70', onda_a: '60', tde: '190', e_sep: '7', e_lat: '9',
                    ai_vol: '52', ddfvi: '50', siv: '10', ppvi: '10',
                    vmax_ao: '2.4', im_vc: '4', vmax_it: '2.6', vci_diam: '18' };
    const medir = async () => ({
      salida: await ev(`window.__Y.salida()`, 90000),
      campos: await ev(`window.__Y.campos()`),
      excelN: await ev(`window.__Y.excelN()`),
      excel: await ev(`window.__P.excelDOM()`, 60000),
      refs: await ev(`window.__P.refsN()`),
      lab: await ev(`window.__P.lab({})`),
      almacen: await ev(`window.__P.almacen()`),
      pills: await ev(`window.__P.pills()`)
    });
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      r.vacio = await medir();
      r.pdfVacio = {};
      for (const pl of ['clasico', 'academico', 'moderno', 'minimalista', 'compacto', 'elegante'])
        r.pdfVacio[pl] = await ev(`window.__P.pdf(${JSON.stringify(pl)})`, 90000);

      await ev(`window.__P.nuevo()`);
      for (const [k, v2] of Object.entries(AJENO)) {
        try { await tipear(k, v2); }
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
