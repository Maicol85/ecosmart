#!/usr/bin/env node
/**
 * _probe_e.mjs - sonda A/B de SOLO LECTURA para la tanda E (HTP + HF-PEFF), 2026-10-22.
 *
 * Reusa TODA la infraestructura de scripts/_probe_aj1.mjs -teclas y clics reales, cierre del
 * arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su denominador,
 * md5 al principio y al final-. NO muta index.html.
 *
 *   node scripts/_probe_e.mjs --file /tmp/index.EHEAD.html --solo htpinv > /tmp/e.HEAD.json
 *   node scripts/_probe_e.mjs                              --solo htpinv > /tmp/e.NEW.json
 *
 * Grupos:
 *   htpinv  - el inventario de signos de HTP: criterio, estado y vaiven automatico/manual.
 *   htptab  - la tabla de signos en pantalla: tres columnas y el estado de cada fila.
 *   htpinf  - el informe de HTP con la VRT no medible ELEGIDA, automatica sin IT y vacia.
 *   htppdf  - la hoja del PDF de HTP: solo los signos PRESENTES.
 *   hfconcl - la conclusion de HF-PEFF por puntaje y dominios cargados.
 *   hfpdf   - la hoja del PDF de HF-PEFF: una sola tabla y el puntaje arriba.
 *   hfpant  - la PANTALLA de HF-PEFF, que NO cambia.
 *   refs    - las fichas de Referencias de HTP y de HF-PEFF.
 *   evid    - las dos secciones nuevas del panel de Evidencia.
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

  /* ══ GRUPO «htpinv» — EL INVENTARIO DE SIGNOS Y EL VAIVEN AUTOMATICO/MANUAL ═══════════════
     Se mide el estado de cada casilla con sus insumos cargados, borrados y vueltos a cargar, y
     que «Nuevo estudio» no deja ninguna BLOQUEADA — que es la trampa que el selector de VD/VI
     pago en el G3 y la que `htpApSync` ya documenta. */
  if (corre('htpinv')) {
    const r = { inicio: null, vaiven: {}, nuevo: null, core: {} };
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.calentar()`);
      r.inicio = await ev(`window.__Y.htpInv()`);
      /* El vaiven de la AP: con el diametro cargado las dos casillas se CALCULAN; al borrarlo
         vuelven a manual y se borra SOLO lo que el calculo habia puesto. */
      await ev(`window.__P.abrirPara('ip_ap_diam')`);
      await tipear('ip_ap_diam', '30');
      await ev(`window.__P.calentar()`);
      r.vaiven.ap30 = await ev(`window.__Y.htpInv()`);
      await ev(`window.__P.abrirPara('ao_sin')`);
      await tipear('ao_sin', '28');
      await ev(`window.__P.calentar()`);
      r.vaiven.ap30ao28 = await ev(`window.__Y.htpInv()`);
      await borrar('ip_ap_diam');
      await ev(`window.__P.calentar()`);
      r.vaiven.sinAp = await ev(`window.__Y.htpInv()`);
      await tipear('ip_ap_diam', '20');
      await ev(`window.__P.calentar()`);
      r.vaiven.ap20ao28 = await ev(`window.__Y.htpInv()`);
      /* «Nuevo estudio» no puede dejar una casilla bloqueada. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.calentar()`);
      r.nuevo = await ev(`window.__Y.htpInv()`);
      /* El nucleo por sus tres bandas de VRT y el borde del 2,8. */
      for (const par of [['auto', '2.8'], ['auto', '2.9'], ['auto', '3.5'], ['nomedible', null]]) {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.sel('htp2022_vrt', ${JSON.stringify(par[0])})`);
        if (par[1]) { await ev(`window.__P.abrirPara('vmax_it')`); await tipear('vmax_it', par[1]); }
        await ev(`window.__P.calentar()`);
        r.core[par[0] + '/' + String(par[1])] = await ev(`window.__Y.htpCore()`);
      }
    } catch (e) { r.err = e.message; }
    out.grupos.htpinv = r;
    process.stderr.write('[htpinv] listo\n');
  }

  /* ══ GRUPO «htptab» — LA TABLA DE SIGNOS CON SUS TRES COLUMNAS ═══════════════════════════ */
  if (corre('htptab')) {
    const r = { vacio: null, cargado: null, manual: null };
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.calentar()`);
      r.vacio = await ev(`window.__Y.htpInv()`);
      /* Un paciente con signos AUTOMATICOS en las tres categorias. */
      await ev(`window.__P.nuevo()`);
      for (const [id, val] of [['vd_vi', '1.3'], ['tvia', '95'], ['vci_diam', '25']]) {
        await ev(`window.__P.abrirPara(${JSON.stringify(id)})`);
        try { await tipear(id, val); } catch (e) { await ev(`window.__P.sel(${JSON.stringify(id)}, ${JSON.stringify(val)})`); }
      }
      await ev(`window.__P.sel('vci_col', '<50')`);
      await ev(`window.__P.calentar()`);
      r.cargado = await ev(`window.__Y.htpInv()`);
      /* Un paciente con signos MANUALES marcados con un clic real. */
      await ev(`window.__P.nuevo()`);
      for (const id of ['htp2022_a3', 'htp2022_b1muesca', 'htp2022_c_col20'])
        await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
          if (!e || e.disabled) return 'no'; e.click(); return e.checked })()`);
      await ev(`window.__P.calentar()`);
      r.manual = await ev(`window.__Y.htpInv()`);
    } catch (e) { r.err = e.message; }
    out.grupos.htptab = r;
    process.stderr.write('[htptab] listo\n');
  }

  /* ══ GRUPO «htpinf» — EL INFORME CON LA VRT NO MEDIBLE ═══════════════════════════════════
     Tres escenas: la VRT «no medible» ELEGIDA a proposito sin signos, la VRT en automatico sin
     IT cargada (que es el mismo `vrtCat` por otro camino), y el formulario vacio. */
  if (corre('htpinf')) {
    const r = {};
    try {
      const escena = async (nombre, pasos) => {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.despejar()`);
        for (const p of pasos) {
          if (p[0] === 'sel') await ev(`window.__P.sel(${JSON.stringify(p[1])}, ${JSON.stringify(p[2])})`);
          else { await ev(`window.__P.abrirPara(${JSON.stringify(p[1])})`); await tipear(p[1], p[2]); }
        }
        await ev(`window.__Y.integrar('htp')`);
        await ev(`window.__P.calentar()`);
        r[nombre] = { core: await ev(`window.__Y.htpCore()`), inf: await ev(`window.__Y.infHTP()`),
                      pdf: await ev(`window.__Y.htpPdf()`) };
      };
      await escena('elegidaSinSignos', [['sel', 'htp2022_vrt', 'nomedible'], ['t', 'nombre', 'EHTP']]);
      await escena('autoSinIT',        [['t', 'nombre', 'EHTP']]);
      await escena('vacio',            []);
      await escena('elegidaConSigno',  [['sel', 'htp2022_vrt', 'nomedible'], ['t', 'nombre', 'EHTP'],
                                        ['t', 'vd_vi', '1.3'], ['t', 'tvia', '95']]);
      await escena('baja',             [['sel', 'htp2022_vrt', 'baja'], ['t', 'nombre', 'EHTP']]);
      await escena('alta',             [['sel', 'htp2022_vrt', 'alta'], ['t', 'nombre', 'EHTP']]);
      /* CONTROL: la VRT elegida «no medible» con la IT medida contradiciendola -la discrepancia,
         que ya escribia linea en HEAD y no se puede perder-. */
      await escena('discrepa',         [['t', 'nombre', 'EHTP'], ['t', 'vmax_it', '3.8'],
                                        ['sel', 'htp2022_vrt', 'nomedible']]);
    } catch (e) { r.err = e.message; }
    out.grupos.htpinf = r;
    process.stderr.write('[htpinf] listo\n');
  }

  /* ══ GRUPO «htppdf» — LA HOJA DEL PDF DE HTP ═════════════════════════════════════════════ */
  if (corre('htppdf')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.calentar()`);
      r.vacio = await ev(`window.__Y.htpPdf()`);
      /* Signos presentes en las tres categorias, automaticos y manuales mezclados. */
      await ev(`window.__P.nuevo()`);
      for (const [id, val] of [['vd_vi', '1.3'], ['tvia', '95'], ['ad_area', '22'], ['vmax_it', '3.0']]) {
        await ev(`window.__P.abrirPara(${JSON.stringify(id)})`);
        await tipear(id, val);
      }
      await ev(`(function(){ var e = document.getElementById('htp2022_a3'); if (e && !e.disabled) e.click(); return 1 })()`);
      await ev(`window.__P.calentar()`);
      r.conSignos = await ev(`window.__Y.htpPdf()`);
      r.conSignosInv = await ev(`window.__Y.htpInv()`);
      /* Sin ningun signo presente. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirPara('vmax_it')`);
      await tipear('vmax_it', '2.0');
      await ev(`window.__P.calentar()`);
      r.sinSignos = await ev(`window.__Y.htpPdf()`);
    } catch (e) { r.err = e.message; }
    out.grupos.htppdf = r;
    process.stderr.write('[htppdf] listo\n');
  }

  /* ══ GRUPO «hfconcl» — LA CONCLUSION DE HF-PEFF POR PUNTAJE Y DOMINIOS ═══════════════════
     La tabla de escenas: puntaje x dominios cargados. Lo que importa es que «provisoria»
     aparezca SOLO cuando el dominio faltante puede cambiar la categoria. */
  if (corre('hfconcl')) {
    const r = {};
    try {
      /* BSA exacta: 80 kg y 180 cm dan Mosteller 2,00, que es lo que hace que los cortes
         indexados se alcancen con enteros. */
      const base = async () => {
        await ev(`window.__P.nuevo()`);
        for (const [id, val] of [['peso', '80'], ['talla', '180'], ['edad', '70'], ['fevi', '60']]) {
          await ev(`window.__P.abrirPara(${JSON.stringify(id)})`); await tipear(id, val);
        }
      };
      const escena = async (nombre, pares) => {
        await base();
        for (const [id, val] of pares) {
          await ev(`window.__P.abrirPara(${JSON.stringify(id)})`);
          try { await tipear(id, val); } catch (e) { await ev(`window.__P.sel(${JSON.stringify(id)}, ${JSON.stringify(val)})`); }
        }
        await ev(`window.__P.calentar()`);
        r[nombre] = await ev(`window.__Y.hfConcl()`);
        r[nombre + '_suma'] = await ev(`window.__Y.infHF()`);
      };
      /* COMPLETO: los tres dominios con datos. */
      await escena('completo_0', [['onda_e', '60'], ['e_sep', '10'], ['e_lat', '13'],
        ['ai_vol', '40'], ['ddfvi', '45'], ['siv', '9'], ['ppvi', '9'], ['hf_ntprobnp', '50']]);
      await escena('completo_4', [['onda_e', '90'], ['e_sep', '6'], ['e_lat', '8'],
        ['ai_vol', '60'], ['ddfvi', '45'], ['siv', '10'], ['ppvi', '10'], ['hf_ntprobnp', '150']]);
      await escena('completo_6', [['onda_e', '120'], ['e_sep', '5'], ['e_lat', '7'],
        ['ai_vol', '90'], ['ddfvi', '45'], ['siv', '14'], ['ppvi', '14'], ['hf_ntprobnp', '900']]);
      /* UN dominio faltante (el humoral, hasta +2). Parciales 0, 1, 2, 3 y 4. */
      await escena('falta1_0', [['onda_e', '60'], ['e_sep', '10'], ['e_lat', '13'],
        ['ai_vol', '40'], ['ddfvi', '45'], ['siv', '9'], ['ppvi', '9']]);
      await escena('falta1_2', [['onda_e', '90'], ['e_sep', '6'], ['e_lat', '8'],
        ['ai_vol', '40'], ['ddfvi', '45'], ['siv', '9'], ['ppvi', '9']]);
      /* Parcial 1: UN criterio MENOR del funcional -E/e' entre 9 y 14- y el morfologico en 0.
         Con e' septal 10 y lateral 13 el promedio es 11,5, asi que una onda E de 120 da 10,4. */
      await escena('falta1_1', [['onda_e', '120'], ['e_sep', '10'], ['e_lat', '13'],
        ['ai_vol', '40'], ['ddfvi', '45'], ['siv', '9'], ['ppvi', '9']]);
      /* Parcial 3: funcional MAYOR (e' septal 6 < 7) y morfologico MENOR (LAVI 29-34: con BSA
         2,00 exacta, un volumen de 60 ml da 30 ml/m2). */
      await escena('falta1_3', [['onda_e', '90'], ['e_sep', '6'], ['e_lat', '8'],
        ['ai_vol', '60'], ['ddfvi', '45'], ['siv', '9'], ['ppvi', '9']]);
      /* Parcial 4: los DOS dominios cargados en MAYOR. LAVI > 34 con 80 ml sobre BSA 2,00. */
      await escena('falta1_4', [['onda_e', '90'], ['e_sep', '6'], ['e_lat', '8'],
        ['ai_vol', '80'], ['ddfvi', '45'], ['siv', '10'], ['ppvi', '10']]);
      /* DOS dominios faltantes (hasta +4). */
      await escena('falta2_0', [['onda_e', '60'], ['e_sep', '10'], ['e_lat', '13']]);
      await escena('falta2_1', [['onda_e', '120'], ['e_sep', '10'], ['e_lat', '13']]);
      await escena('falta2_2', [['onda_e', '90'], ['e_sep', '6'], ['e_lat', '8']]);
    } catch (e) { r.err = e.message; }
    out.grupos.hfconcl = r;
    process.stderr.write('[hfconcl] listo\n');
  }

  /* ══ GRUPO «hfpdf» y «hfpant» — LA HOJA DEL PDF Y LA PANTALLA QUE NO CAMBIA ══════════════ */
  if (corre('hfpdf')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.calentar()`);
      r.vacio = { pdf: await ev(`window.__Y.hfPdf()`), pant: await ev(`window.__Y.hfPant()`) };
      for (const [id, val] of [['peso', '80'], ['talla', '180'], ['edad', '70'], ['fevi', '60'],
                               ['onda_e', '90'], ['e_sep', '6'], ['e_lat', '8'], ['ai_vol', '60'],
                               ['ddfvi', '45'], ['siv', '10'], ['ppvi', '10'], ['hf_ntprobnp', '150']]) {
        await ev(`window.__P.abrirPara(${JSON.stringify(id)})`); await tipear(id, val);
      }
      await ev(`window.__P.calentar()`);
      r.cargado = { pdf: await ev(`window.__Y.hfPdf()`), pant: await ev(`window.__Y.hfPant()`),
                    concl: await ev(`window.__Y.hfConcl()`) };
      /* Parcial: sin el dominio humoral. */
      await ev(`window.__P.abrirPara('hf_ntprobnp')`);
      await borrar('hf_ntprobnp');
      await ev(`window.__P.calentar()`);
      r.parcial = { pdf: await ev(`window.__Y.hfPdf()`), pant: await ev(`window.__Y.hfPant()`),
                    concl: await ev(`window.__Y.hfConcl()`) };
      /* FEVI reducida: la hoja se retira entera. */
      await ev(`window.__P.abrirPara('fevi')`);
      await tipear('fevi', '32');
      await ev(`window.__P.calentar()`);
      r.feviBaja = { pdf: await ev(`window.__Y.hfPdf()`), pant: await ev(`window.__Y.hfPant()`) };
    } catch (e) { r.err = e.message; }
    out.grupos.hfpdf = r;
    process.stderr.write('[hfpdf] listo\n');
  }

  /* ══ GRUPO «refs» — LAS FICHAS DE REFERENCIAS ════════════════════════════════════════════ */
  if (corre('refs')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      r.censo = await ev(`window.__Y.refsCenso()`);
      for (const id of ['htp', 'hfapeff', 'tep']) r[id] = await ev(`window.__Y.ficha(${JSON.stringify(id)})`);
    } catch (e) { r.err = e.message; }
    out.grupos.refs = r;
    process.stderr.write('[refs] listo\n');
  }

  /* ══ GRUPO «evid» — LAS DOS SECCIONES NUEVAS DEL PANEL ═══════════════════════════════════ */
  if (corre('evid')) {
    const T_HTP = 'Hipertensión pulmonar — probabilidad ecocardiográfica';
    const T_HF  = 'Insuficiencia cardíaca con fracción de eyección preservada — HFA-PEFF';
    const r = { vacio: {}, htpAlta: {}, htpBaja: {}, hf: {}, pintado: {} };
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.calentar()`);
      r.vacio.htp = await ev(`window.__Y.evid(${JSON.stringify(T_HTP)})`);
      r.vacio.hf  = await ev(`window.__Y.evid(${JSON.stringify(T_HF)})`);
      /* HTP ALTA: VRT > 3,4. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirPara('vmax_it')`); await tipear('vmax_it', '3.8');
      await ev(`window.__P.calentar()`);
      r.htpAlta.sinResponder = await ev(`window.__Y.evid(${JSON.stringify(T_HTP)})`);
      r.htpAlta.resp = await ev(`window.__Y.evidResp('htp.riesgo', 'si')`);
      r.htpAlta.conSi = await ev(`window.__Y.evid(${JSON.stringify(T_HTP)})`);
      r.pintado.htpAlta = await ev(`window.__Y.evidPintado(${JSON.stringify(T_HTP)})`, 60000);
      /* HTP BAJA sin signos. */
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirPara('vmax_it')`); await tipear('vmax_it', '2.0');
      await ev(`window.__P.calentar()`);
      r.htpBaja.sinResponder = await ev(`window.__Y.evid(${JSON.stringify(T_HTP)})`);
      r.htpBaja.resp = await ev(`window.__Y.evidResp('htp.riesgo', 'no')`);
      r.htpBaja.conNo = await ev(`window.__Y.evid(${JSON.stringify(T_HTP)})`);
      /* HF-PEFF intermedio. */
      await ev(`window.__P.nuevo()`);
      for (const [id, val] of [['peso', '80'], ['talla', '180'], ['edad', '70'], ['fevi', '60'],
                               ['onda_e', '90'], ['e_sep', '6'], ['e_lat', '8'], ['ai_vol', '60'],
                               ['ddfvi', '45'], ['siv', '10'], ['ppvi', '10'], ['hf_ntprobnp', '150']]) {
        await ev(`window.__P.abrirPara(${JSON.stringify(id)})`); await tipear(id, val);
      }
      await ev(`window.__P.calentar()`);
      r.hf.intermedio = await ev(`window.__Y.evid(${JSON.stringify(T_HF)})`);
      r.pintado.hf = await ev(`window.__Y.evidPintado(${JSON.stringify(T_HF)})`, 60000);
    } catch (e) { r.err = e.message; }
    out.grupos.evid = r;
    process.stderr.write('[evid] listo\n');
  }

  /* ══ GRUPO «maq» — CUATRO ANCHOS POR DOS TEMAS ═══════════════════════════════════════════ */
  if (corre('maq')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirPara('vmax_it')`); await tipear('vmax_it', '3.0');
      await ev(`window.__P.calentar()`);
      /* ⚠️ LA SECCION DE HTP NACE CERRADA Y VIVE EN LA PESTANA HEMODINAMICA: sin abrirla, la
         tabla mide 0x0 y «cero scroll horizontal» sale sobre una pantalla que no esta dibujada.
         La sonda ABRE por el gesto y ABORTA si la tabla no tiene geometria. */
      const _abrirHtp = async () => {
        await ev(`(function(){ try { if (typeof showTab === 'function') showTab('hemodinamica');
          var d = document.getElementById('htp2022-seccion');
          if (d && getComputedStyle(d).display === 'none' && typeof toggleCard === 'function')
            toggleCard('htp2022-seccion', document.getElementById('htp2022-arrow'));
          return 1 } catch (e) { return 'EXC: ' + e.message } })()`);
        const g = await ev(`window.__P.geo('htp2022-tabla')`);
        if (!g || !g.ok || !(g.w > 0)) throw new Error('SIN GEOMETRIA htp2022-tabla ' + JSON.stringify(g));
        return g;
      };
      await _abrirHtp();
      for (const [w, h] of [[1200, 700], [768, 1024], [390, 844], [360, 740]]) {
        await cdp.send('Emulation.setDeviceMetricsOverride',
          { width: w, height: h, deviceScaleFactor: 1, mobile: false }, sessionId);
        for (const claro of [false, true]) {
          const tema = await ev(`window.__P.tema(${claro})`);
          await ev(`window.__P.despejar()`);
          const k = w + 'x' + h + (claro ? '|claro' : '|noche');
          const gt = await _abrirHtp();
          r[k] = { tema: tema, scroll: await ev(`window.__Y.scrollH()`),
                   tabla: gt,
                   filas: await ev(`(function(){ var t = document.getElementById('htp2022-tabla');
                     if (!t) return 'NO EXISTE'; var tr = t.querySelectorAll('tr[data-htp-signo]'), o = [];
                     for (var i = 0; i < tr.length; i++) { var b = tr[i].getBoundingClientRect();
                       o.push(Math.round(b.width) + 'x' + Math.round(b.height)) } return o })()`),
                   colorProb: await ev(`(function(){ var e = document.getElementById('htp2022-prob');
                     if (!e) return 'NO EXISTE'; var b = e.querySelector('span,b,div') || e;
                     return getComputedStyle(b).color })()`),
                   colorEst: await ev(`(function(){ var e = document.getElementById('htp2022-est-a1');
                     return e ? getComputedStyle(e).color : 'NO EXISTE' })()`),
                   colorGrupo: await ev(`(function(){ var t = document.getElementById('htp2022-tabla');
                     var e = t && t.querySelector('tr[data-htp-grupo] td');
                     return e ? getComputedStyle(e).color : 'NO EXISTE' })()`) };
        }
        await ev(`window.__P.tema(false)`);
      }
      await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    } catch (e) { r.err = e.message; }
    out.grupos.maq = r;
    process.stderr.write('[maq] listo\n');
  }

  /* ══ GRUPO «captura» — LA MIRADA ═════════════════════════════════════════════════════════
     La medicion numerica da por buenos defectos que el ojo ve en un segundo: el B, el C, el H,
     el D y el AJ1 cazaron uno cada uno mirando el PNG. Se captura el VIEWPORT centrado en la
     zona, no un `clip` mas alto que la ventana -ese sale descolocado, que es la trampa del D3-. */
  if (corre('captura')) {
    const r = {};
    try {
      await ev(`window.__P.nuevo()`);
      for (const [id, val] of [['vmax_it', '3.0'], ['vd_vi', '1.3'], ['tvia', '95'], ['ad_area', '22']]) {
        await ev(`window.__P.abrirPara(${JSON.stringify(id)})`);
        try { await tipear(id, val); } catch (e) {}
      }
      await ev(`(function(){ var e = document.getElementById('htp2022_a3'); if (e && !e.disabled) e.click(); return 1 })()`);
      await ev(`window.__P.calentar()`);
      for (const [w, h] of [[1200, 700], [360, 740]]) {
        await cdp.send('Emulation.setDeviceMetricsOverride',
          { width: w, height: h, deviceScaleFactor: 1, mobile: false }, sessionId);
        for (const claro of [false, true]) {
          const tema = await ev(`window.__P.tema(${claro})`);
          if (!tema || tema.claro !== claro) throw new Error('EL TEMA NO QUEDO: ' + JSON.stringify(tema));
          await ev(`window.__P.despejar()`);
          await ev(`(function(){ try { if (typeof showTab === 'function') showTab('hemodinamica');
            var d = document.getElementById('htp2022-seccion');
            if (d && getComputedStyle(d).display === 'none' && typeof toggleCard === 'function')
              toggleCard('htp2022-seccion', document.getElementById('htp2022-arrow'));
            var t = document.getElementById('htp2022-tabla');
            if (t) t.scrollIntoView({ block: 'center' }); return 1 } catch (e) { return 'EXC' } })()`);
          await ev(`window.__P.despejar()`);
          const g = await ev(`window.__P.geo('htp2022-tabla')`);
          if (!g || !g.ok || !(g.w > 0)) throw new Error('SIN GEOMETRIA htp2022-tabla');
          const png = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
          const f = DEST + '/e_htptab_' + w + (claro ? '_claro' : '_noche') + '.png';
          await writeFile(f, Buffer.from(png.data, 'base64'));
          r[w + (claro ? '|claro' : '|noche')] = { archivo: f, geo: g,
            md5: createHash('md5').update(Buffer.from(png.data, 'base64')).digest('hex').slice(0, 10) };
        }
        await ev(`window.__P.tema(false)`);
      }
      await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    } catch (e) { r.err = e.message; }
    out.grupos.captura = r;
    process.stderr.write('[captura] listo\n');
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
