#!/usr/bin/env node
/**
 * _probe_r.mjs - sonda A/B de SOLO LECTURA para la tanda «R» (referencias y fuentes, 2026-10-20).
 *
 * Grupos: vab · teer · vd · ai · peri · tapo · tep · refs · ctrl
 *
 * TODA la infraestructura de scripts/_probe_y3e.mjs se reusa tal cual -teclas y clics reales,
 * cierre del arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su
 * denominador, md5 al principio y al final-. NO muta index.html.
 *
 *   node scripts/_probe_r.mjs --file /tmp/index.Y3fHEAD.html --solo fevi > /tmp/r.HEAD.json
 *   node scripts/_probe_r.mjs                                --solo fevi > /tmp/r.NEW.json
 *
 * Grupos:
 *   fevi    - FEVI y DSFVI en los DOS sentidos, por todos los caminos.
 *   dop     - Doppler mitral: columnas, orden del marcado y del foco, celular.
 *   vabviv  - VAB: EA, IAo y diametros en vivo, y la funcion derivada.
 *   vabcon  - VAB: la conclusion descriptiva y la tarjeta de Evidencia.
 *   inf     - informe (tres estilos), EN SUMA, derrame y masas.
 *   tipos   - los siete tipos en espanol, el Excel y la reimportacion.
 *   dib     - los dibujos nuevos, el arco del angulo y el aria-label.
 *   anim    - la animacion 2D: reposo, pausa, control manual, ciclo.
 *   maqueta - cuatro anchos por dos temas, color real y scroll horizontal.
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


  /* ══ ABRIR LA PESTAÑA VALVULAS CON SUS CUATRO SECCIONES Y SUS OCHO CAJONES ════════════════
     ⚠️ `__P.puertaDe` TOMA UNA CLAVE DE GLOBO ⓘ Y NO UNA PESTAÑA: llamarlo con 'valvulas'
     devuelve «NO EXISTE globo» y no abre nada — la primera corrida informo «SIN GEOMETRIA» en
     las cinco escenas con la pastilla perfecta. Y la puerta se abre DESPUES de `showTab`,
     porque `showTab('valvulas')` corre `valvCerrarTarjetas` y se lleva lo que uno acaba de abrir.
     Se usan los toggles REALES y no un `display` a mano: a 768 px y por debajo el CSS del celular
     cierra el cajon con `!important` y le gana a cualquier estilo en linea. */
  const abrirValvulas = () => ev(`(function(){
    var o = {};
    try { if (typeof showTab === 'function') showTab('valvulas'); } catch(e) { o.tab = 'EXC'; }
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(sx){
      var c = document.getElementById('ete-seccion-' + sx);
      if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function')
        toggleEteSeccion(sx); });
    ['caja-insuf-mitral','caja-esten-mitral','caja-insuf-aortica','caja-esten-aortica',
     'caja-insuf-tricuspide','caja-esten-tricuspide','caja-insuf-pulmonar','caja-esten-pulmonar']
      .forEach(function(cj){ var c = document.getElementById(cj);
        if (c && getComputedStyle(c).display === 'none' && typeof valvDatosTog === 'function')
          valvDatosTog(cj); });
    var p = document.getElementById('pill-esten-aortica');
    var r = p ? p.getBoundingClientRect() : null;
    o.pill = r ? { w: Math.round(r.width), h: Math.round(r.height) } : 'NO EXISTE';
    return o })()`);

  /* ══ CLIC REAL sobre un nodo por su id ════════════════════════════════════════════════════
     Lleva el nodo al viewport, comprueba con `elementFromPoint` que el blanco es el esperado y
     despacha el par mousePressed/mouseReleased. ABORTA si el nodo no existe, si no tiene
     geometria o si el punto cae sobre OTRO nodo: un clic que aterriza en el aviso legal no es un
     gesto, y «no cambia» se leeria como un defecto del mecanismo. */
  async function clicId(id) {
    await ev(`window.__P.despejar()`);
    let g = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return {err:'NO EXISTE'};
      e.scrollIntoView({block:'center'});
      var r=e.getBoundingClientRect();
      if(!r.width||!r.height) return {err:'SIN GEOMETRIA'};
      var x=Math.round(r.left+r.width/2), y=Math.round(r.top+r.height/2);
      var t=document.elementFromPoint(x,y);
      return {x:x,y:y,blanco:t?(t.id||t.tagName+'.'+t.className):null, dentro:!!(t&&(t===e||e.contains(t)||t.contains(e)))};
    })()`);
    if (!g || g.err || !g.dentro) throw new Error('CLIC IMPOSIBLE en ' + id + ' ' + JSON.stringify(g));
    for (const type of ['mousePressed', 'mouseReleased'])
      await cdp.send('Input.dispatchMouseEvent', { type, x: g.x, y: g.y, button: 'left',
        clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0 }, sessionId);
    await pausa(90);
    return g;
  }

  /* ══ GRUPO «vab» — LA LESION PRESENTE SIN GRADO, «FUSION INDETERMINADA» Y «NO CORONARIANA» ══
     ⚠️ LA PASTILLA SE PRENDE CON UN CLIC REAL Y NO CON `toggleValvPill()`: el gesto del medico
     pasa por el boton, y llamar la funcion a mano saltea la cola que registra el dueño
     (`VALV_INSUF_AUTO`), que es justo la que decide si la app puede volver a apagarla.
     ⚠️ LA MORFOLOGIA VA PRIMERO: la seccion VAB solo aplica con `va_morf` en «Bicúspide», y
     ponerla despues de prender la pastilla deja el resumen midiendo otra valvula. */
  if (corre('vab')) {
    const r = { escenas: {}, tipos: {}, coron: {} };
    const medirVab = async () => ({
      func:    await ev(`window.__P.val('vab_funcion')`),
      resumen: await ev(`window.__P.txt('vab-concl')`),
      eaRo:    await ev(`window.__P.val('vab_ea_ro')`),
      iaRo:    await ev(`window.__P.val('vab_ia_ro')`),
      pillEst: await ev(`window.__P.pill('aortica','esten')`),
      pillIns: await ev(`window.__P.pill('aortica','insuf')`),
      eaG:     await ev(`window.__P.val('ea_grado')`),
      iaG:     await ev(`window.__P.val('ia_grado')`),
      sinGrEA: await ev(`(typeof aoLesionSinGrado==='function') ? !!aoLesionSinGrado('ea') : 'SIN FN'`),
      sinGrIA: await ev(`(typeof aoLesionSinGrado==='function') ? !!aoLesionSinGrado('ia') : 'SIN FN'`),
      inf:     await ev(`window.__P.informe('estandar')`),
      infNarr: await ev(`window.__P.informe('narrativo')`),
      infConc: await ev(`window.__P.informe('conciso')`),
      suma:    await ev(`window.__P.txt('en_suma') || (document.getElementById('en_suma')||{}).value || ''`),
    });
    const escena = async (nombre, pasos) => {
      try {
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.sel('va_morf','Bicúspide')`);
        r.puerta = await abrirValvulas();
        await pasos();
        await ev(`window.__P.calentar()`);
        r.escenas[nombre] = await medirVab();
      } catch (e) { r.escenas[nombre] = { err: e.message }; }
      process.stderr.write('[vab] ' + nombre + '\n');
    };

    await escena('A-nada', async () => {});
    await escena('B-esten-sin-grado', async () => { await clicId('pill-esten-aortica'); });
    await escena('C-insuf-sin-grado', async () => { await clicId('pill-insuf-aortica'); });
    await escena('D-ambas-sin-grado', async () => {
      await clicId('pill-esten-aortica'); await clicId('pill-insuf-aortica'); });
    await escena('E-esten-con-grado', async () => {
      await clicId('pill-esten-aortica');
      await ev(`window.__P.sel('ea_grado','leve')`); });
    await escena('F-mixto', async () => {
      await clicId('pill-esten-aortica'); await clicId('pill-insuf-aortica');
      await ev(`window.__P.sel('ea_grado','leve')`); });

    /* Los SIETE tipos: el rotulo del selector, el del informe y el del EN SUMA. */
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.sel('va_morf','Bicúspide')`);
      r.tipos.opciones = await ev(`(function(){ var e=document.getElementById('vab_tipo');
        return e ? Array.prototype.map.call(e.options, function(o){return o.value+'='+o.textContent}) : null })()`);
      for (const t of ['no_clasif', 'fused_rn', 'fused_ln']) {
        await ev(`window.__P.sel('vab_tipo',${JSON.stringify(t)})`);
        await ev(`window.__P.calentar()`);
        r.tipos[t] = {
          inf:     await ev(`window.__P.informe('estandar')`),
          narr:    await ev(`window.__P.informe('narrativo')`),
          suma:    await ev(`(document.getElementById('en_suma')||{}).value || ''`),
          resumen: await ev(`window.__P.txt('vab-concl')`),
          aria:    await ev(`(function(){ var e=document.getElementById('vab-svg'); return e ? e.getAttribute('aria-label') : null })()`),
        };
      }
      r.tipos.dibHit = await ev(`(typeof VAB_DIB_HIT!=='undefined') ? VAB_DIB_HIT.map(function(h){return h.k+'='+h.lbl}) : 'SIN'`);
      r.tipos.tiposLbl = await ev(`(typeof VAB_TIPOS_LBL!=='undefined') ? JSON.stringify(VAB_TIPOS_LBL) : 'SIN'`);
      r.tipos.tipoLblExcel = await ev(`(typeof VAB_TIPO_LBL!=='undefined') ? JSON.stringify(VAB_TIPO_LBL) : 'SIN'`);
      r.tipos.vocab = await ev(`(function(){ try { return JSON.stringify(LAB_XLS_VOCAB.vab_tipo) } catch(e){ return 'SIN' } })()`);
      r.tipos.censo = await ev(`window.__P.censoIds ? 1 : 0`);
    } catch (e) { r.tipos.err = e.message; }
    process.stderr.write('[vab] tipos\n');

    /* El Excel: 440 columnas y la celda de la funcion valvular. */
    try {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.sel('va_morf','Bicúspide')`);
      await abrirValvulas();
      await clicId('pill-esten-aortica');
      await ev(`window.__P.calentar()`);
      r.excel = await ev(`window.__P.excelDOM()`);
      r.campos = await ev(`window.__P.camposEstudio ? window.__P.camposEstudio().n : window.__P.camposGuardados().n`);
      r.almacen = await ev(`window.__P.almacen()`);
    } catch (e) { r.excelErr = e.message; }
    out.grupos.vab = r;
    process.stderr.write('[vab] listo\n');
  }


  /* ══ GRUPO «teer» — EL BORDE DE LA PROFUNDIDAD, Y LO QUE NO SE MUEVE ══════════════════════
     ⚠️ LA SECCION TEER NACE CERRADA (`ete-seccion-teer`) y sus campos miden 0x0 adentro; ademas
     el TIPO DE IM se fija ANTES de tipear, porque c4 solo se evalua con IM secundaria o sin
     definir y con «primaria» la fila se oculta y el valor no vota.
     ⚠️ TRES VALORES Y NO DOS en el borde: con 10 y 11 los operadores `<=10` y `<11` dan lo MISMO
     -el primero deja 10 dentro y 11 fuera, el segundo tambien-, asi que la tabla informaria «no
     cambia nada». El tramo que los separa es 10,1 a 10,9 y por eso se mide 10,5. */
  if (corre('teer')) {
    const r = { prof: {}, otros: {}, rotulos: {} };
    const abrirTeer = () => ev(`(function(){
      try { if (typeof showTab === 'function') showTab('ete'); } catch(e){}
      var c = document.getElementById('ete-seccion-teer');
      if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function')
        toggleEteSeccion('teer');
      var e = document.getElementById('teer_prof_flail');
      var rr = e ? e.getBoundingClientRect() : null;
      return rr ? { w: Math.round(rr.width), h: Math.round(rr.height) } : 'NO EXISTE' })()`);
    const leerTeer = async () => ({
      c4:   await ev(`window.__P.txt('teer-c4')`),
      c6:   await ev(`window.__P.txt('teer-c6')`),
      c8:   await ev(`window.__P.txt('teer-c8')`),
      c1:   await ev(`window.__P.txt('teer-c1')`),
      c1b:  await ev(`window.__P.txt('teer-c1b')`),
      res:  await ev(`window.__P.txt('teer-resultado')`),
      nota: await ev(`window.__P.txt('teer-notas')`),
      lblC4: await ev(`(function(){ var e=document.getElementById('teer-c4');
        var f=e&&e.closest?e.closest('.calc-row'):null; var l=f?f.querySelector('.calc-lbl'):null;
        return l?l.textContent.trim():null })()`),
      lblC8: await ev(`(function(){ var e=document.getElementById('teer-c8');
        var f=e&&e.closest?e.closest('.calc-row'):null; var l=f?f.querySelector('.calc-lbl'):null;
        return l?l.textContent.trim():null })()`),
      labProf: await ev(`(function(){ var e=document.getElementById('teer_prof_flail');
        var p=e?e.parentNode:null; var sp=p?p.querySelector('span'):null;
        return sp?sp.textContent.trim():null })()`),
      labDsf: await ev(`(function(){ var e=document.getElementById('teer_dtsvi');
        var p=e?e.parentNode:null; var sp=p?p.querySelectorAll('span'):null;
        return sp&&sp.length?sp[sp.length-1].textContent.trim():null })()`),
      labCrit: await ev(`(function(){ var e=document.getElementById('teer-c4');
        var box=e&&e.closest?e.closest('.calc-box'):null;
        if(!box) return null; var t=(box.textContent||'');
        return { ecosmart: t.indexOf('CRITERIO DE ECOSMART')>=0, tamburino: t.indexOf('Tamburino')>=0,
                 escValv: t.indexOf('ESC/EACTS 2025')>=0, esc2021: t.indexOf('ESC 2021')>=0,
                 expand: t.indexOf('EXPAND')>=0 } })()`),
      labCrud: await ev(`(function(){ try { return _LAB_TEER_CRIT.map(function(c){return c.k+'='+c.lbl}) } catch(e){ return 'SIN' } })()`),
    });
    try {
      r.puerta = await abrirTeer();
      for (const vmm of ['10', '10.5', '11']) {
        await ev(`window.__P.nuevo()`);
        await abrirTeer();
        await ev(`window.__P.sel('teer_tipo_im','secundaria')`);
        await tipear('teer_prof_flail', vmm);
        await ev(`window.__P.calentar()`);
        r.prof[vmm] = await leerTeer();
      }
      /* Los que NO se mueven: PSAP, DSFVI y los dos velos, por sus dos lados. */
      for (const [campo, vals] of [['teer_pasp', ['70', '71']], ['teer_dtsvi', ['70', '71']],
                                   ['teer_lva', ['19', '20']], ['teer_lvp', ['6', '7']]]) {
        for (const vv of vals) {
          await ev(`window.__P.nuevo()`);
          await abrirTeer();
          await ev(`window.__P.sel('teer_tipo_im','secundaria')`);
          await tipear(campo, vv);
          await ev(`window.__P.calentar()`);
          r.otros[campo + '=' + vv] = await leerTeer();
        }
      }
      /* El BORRADO: la regla ARR -un campo vacio es SIN DATO-. */
      await ev(`window.__P.nuevo()`);
      await abrirTeer();
      await ev(`window.__P.sel('teer_tipo_im','secundaria')`);
      await tipear('teer_prof_flail', '10.5');
      await borrar('teer_prof_flail', 'bs');
      await ev(`window.__P.calentar()`);
      r.borrado = await leerTeer();
      await ev(`window.__P.nuevo()`);
      await abrirTeer();
      await ev(`window.__P.sel('teer_tipo_im','secundaria')`);
      await tipear('teer_prof_flail', '10.5');
      await borrar('teer_prof_flail', 'del');
      await ev(`window.__P.calentar()`);
      r.borradoDel = await leerTeer();
      r.excel = await ev(`window.__P.excelDOM()`);
      r.campos = await ev(`window.__P.camposEstudio ? window.__P.camposEstudio().n : null`);
    } catch (e) { r.err = e.message; }
    out.grupos.teer = r;
    process.stderr.write('[teer] listo\n');
  }


  /* ══ GRUPO «vd» — LA SEVERIDAD EN EL INFORME ══════════════════════════════════════════════
     Los dos campos viven en la pestaña VD, detras del acordeon de su seccion. Las escenas cubren
     cada parametro SOLO, los dos iguales, los dos distintos, los DOS bordes solapados de la Tabla
     1 (13 mm y 7,2 cm/s), uno normal y otro alterado, la FAC sola -que vota el OR y NO aporta
     grado- y sin datos. */
  if (corre('vd')) {
    const r = { escenas: {}, bandas: {} };
    const leerVd = async () => ({
      disfG:   await ev(`(typeof vdDisfGrado==='function') ? (vdDisfGrado(window.__P.val('tapse'), window.__P.val('s_prime')) || null) : 'SIN FN'`),
      tapseCat: await ev(`(typeof vdTapseCat==='function') ? vdTapseCat(window.__P.val('tapse')) : 'SIN'`),
      spCat:   await ev(`(typeof vdSprimeCat==='function') ? vdSprimeCat(window.__P.val('s_prime')) : 'SIN'`),
      refTapse: await ev(`window.__P.txt('tapse-interp')`),
      refSp:   await ev(`window.__P.txt('sprime-interp')`),
      estandar: await ev(`(function(){ var o = window.__P.informe('estandar');
        var t = (o && o.inf) ? o.inf : String(o||'');
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('entrículo derecho')>=0 || l.indexOf('VD ')===0 })||[]).join(' | ') })()`),
      narrativo: await ev(`(function(){ var o = window.__P.informe('narrativo');
        var t = (o && o.inf) ? o.inf : String(o||'');
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('entrículo derecho')>=0 })||[]).join(' | ') })()`),
      conciso: await ev(`(function(){ var o = window.__P.informe('conciso');
        var t = (o && o.inf) ? o.inf : String(o||'');
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('VD')>=0 })||[]).join(' | ') })()`),
      suma:    await ev(`(function(){ var t=(document.getElementById('en_suma')||{}).value||'';
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('VD')>=0 || l.indexOf('HVD')>=0 })||[]).join(' | ') })()`),
    });
    const escVd = async (nombre, campos) => {
      try {
        await ev(`window.__P.nuevo()`);
        for (const [k, vv] of campos) await tipear(k, vv);
        await ev(`window.__P.calentar()`);
        r.escenas[nombre] = await leerVd();
      } catch (e) { r.escenas[nombre] = { err: e.message }; }
      process.stderr.write('[vd] ' + nombre + '\n');
    };
    /* TAPSE: normal >17 · leve >=13 · moderada >10 · severa resto.
       S':    normal >9.5 · leve >=7.2 · moderada >5 · severa resto. */
    await escVd('A-tapse-solo-leve',      [['tapse', '15']]);
    await escVd('B-tapse-solo-moderada',  [['tapse', '12']]);
    await escVd('C-tapse-solo-severa',    [['tapse', '8']]);
    await escVd('D-sp-solo-moderada',     [['s_prime', '6']]);
    await escVd('E-ambos-leve',           [['tapse', '15'], ['s_prime', '8']]);
    await escVd('F-ambos-distintos',      [['tapse', '15'], ['s_prime', '6']]);
    await escVd('G-borde-tapse-13',       [['tapse', '13']]);
    await escVd('H-borde-sp-72',          [['s_prime', '7.2']]);
    await escVd('I-uno-normal-otro-alt',  [['tapse', '22'], ['s_prime', '6']]);
    await escVd('J-fac-sola',             [['vd_area_d', '30'], ['vd_area_s', '22']]);
    await escVd('K-sin-datos',            []);
    await escVd('L-ambos-severa',         [['tapse', '8'], ['s_prime', '4']]);
    /* El BORRADO: la regla ARR. */
    try {
      await ev(`window.__P.nuevo()`);
      await tipear('tapse', '12'); await tipear('s_prime', '6');
      await borrar('tapse', 'bs'); await borrar('s_prime', 'del');
      await ev(`window.__P.calentar()`);
      r.escenas['M-borrado'] = await leerVd();
    } catch (e) { r.escenas['M-borrado'] = { err: e.message }; }
    /* La tabla duena: que el solape este declarado y que el grado publicado NO cambie. */
    try {
      r.bandas.tapse = await ev(`JSON.stringify(ASE25_T1.tapse.bandas)`);
      r.bandas.sprime = await ev(`JSON.stringify(ASE25_T1.s_prime.bandas)`);
      r.bandas.grados = await ev(`(function(){ var o={};
        [['tapse',[18,17,13,12.9,10,9]],['s_prime',[10,9.5,7.2,7.1,5,4]]].forEach(function(p){
          p[1].forEach(function(x){ o[p[0]+'='+x]=ase25Grado(p[0],x) }) }); return JSON.stringify(o) })()`);
      r.bandas.err = await ev(`(window.__Yerr||[]).join(' | ')`);
    } catch (e) { r.bandas.errMed = e.message; }
    out.grupos.vd = r;
    process.stderr.write('[vd] listo\n');
  }


  /* ══ GRUPO «ai» — LOS CUATRO GRADOS DEL AREA Y LA JERARQUIA DEL VOLUMEN ═══════════════════
     Los tres campos viven en AI/VI, detras del acordeon `sacc-ai`. El peso y la talla van en
     Datos y hacen falta para la superficie corporal: sin ellos el volumen no se indexa y la
     jerarquia no se puede medir -la escena caeria en la rama del area y la tabla informaria
     «el volumen no manda» sobre un volumen que nunca se indexo-. */
  if (corre('ai')) {
    const r = { bordes: {}, escenas: {}, refs: {} };
    const leerAi = async () => ({
      capArea: await ev(`window.__P.txt('ai-area-interp')`),
      capDiam: await ev(`window.__P.txt('ai-diam-interp')`),
      capVol:  await ev(`window.__P.txt('ai-interp')`),
      idx:     await ev(`window.__P.txt('ai-idx')`),
      banda:   await ev(`(typeof aiAreaClasificar==='function') ? ((aiAreaClasificar(window.__P.val('ai_area'))||{}).clave||null) : 'SIN FN'`),
      dil:     await ev(`(typeof aiAreaDilatada==='function') ? aiAreaDilatada(window.__P.val('ai_area')) : 'SIN FN'`),
      estandar: await ev(`(function(){ var o = window.__P.informe('estandar');
        var t = (o && o.inf) ? o.inf : String(o||'');
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('urícula izquierda')>=0 || l.indexOf('AI ')===0 || l.indexOf('volumen indexado')>=0 })||[]).join(' | ') })()`),
      narrativo: await ev(`(function(){ var o = window.__P.informe('narrativo');
        var t = (o && o.inf) ? o.inf : String(o||'');
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('urícula izquierda')>=0 })||[]).join(' | ') })()`),
      suma:    await ev(`(function(){ var t=(document.getElementById('en_suma')||{}).value||'';
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('AI ')>=0 })||[]).join(' | ') })()`),
    });
    /* ⚠️ LOS ACORDEONES `sacc-` NO SE ABREN FORZANDO EL `display`: se abren con `secToggle`, que
       es el gesto real. `abrirPara` sube por los ancestros poniendo `display:''` y el acordeon de
       AI/VI no se cierra asi, de modo que el campo seguia midiendo 0x0 y la sonda ABORTO -que es
       lo correcto- en las trece escenas. Los campos de Datos (peso y talla) viven en su propia
       pestaña, asi que se abren las dos. */
    const abrirAi = () => ev(`(function(){
      var o = {};
      try { if (typeof showTab === 'function') showTab('ai-vi'); } catch(e){ o.tabExc = e.message; }
      var tb = document.getElementById('tab-ai-vi');
      o.tabDisp = tb ? getComputedStyle(tb).display : 'NO EXISTE';
      /* ⚠️ EL ACORDEON NO SE COLAPSA CON display:none: secToggle alterna la clase open y el
         cuerpo se cierra con max-height. Preguntarle al card por su display da siempre
         «visible» y el toggle no se llama nunca — la primera corrida midio la puerta en 0x0 y
         abortó en las trece escenas. Lo que hay que mirar es la clase. */
      ['ai','vi','datos'].forEach(function(k){
        var c = document.getElementById('sacc-' + k);
        if (c && !c.classList.contains('open') && typeof secToggle === 'function') secToggle(k); });
      /* ⚠️ Y LA TRANSICION NO HA TERMINADO: el cuerpo abre con max-height = scrollHeight y la
         clase open, pero la altura final la pone un transitionend o un setTimeout de 350 ms. Un
         rect leido en el mismo cuadro puede dar 0. Se fuerza el estado FINAL -que es lo que ese
         mismo callback hace- en vez de esperar, asi la sonda no depende de un reloj. */
      var b = document.querySelectorAll('.sacc.open > .sacc-body');
      Array.prototype.forEach.call(b, function(x){ x.style.maxHeight = 'none'; x.style.overflow = 'visible'; });
      var e = document.getElementById('ai_area'); var rr = e ? e.getBoundingClientRect() : null;
      o.w = rr ? Math.round(rr.width) : null; o.h = rr ? Math.round(rr.height) : null;
      o.abiertos = document.querySelectorAll('.sacc.open').length;
      o.saccAi = (function(){ var c = document.getElementById('sacc-ai');
        if (!c) return 'NO EXISTE'; var bb = c.querySelector('.sacc-body');
        return { open: c.classList.contains('open'), disp: getComputedStyle(c).display,
                 bodyMax: bb ? getComputedStyle(bb).maxHeight : null,
                 bodyH: bb ? Math.round(bb.getBoundingClientRect().height) : null } })();
      o.campoDisp = e ? getComputedStyle(e).display : 'NO EXISTE';
      return o })()`);
    const escAi = async (nombre, campos) => {
      try {
        await ev(`window.__P.nuevo()`);
        await abrirAi();
        for (const [k, vv] of campos) await tipear(k, vv);
        await ev(`window.__P.calentar()`);
        r.escenas[nombre] = await leerAi();
      } catch (e) { r.escenas[nombre] = { err: e.message }; }
      process.stderr.write('[ai] ' + nombre + '\n');
    };
    r.puerta = await abrirAi();
    /* LOS BORDES: 20 / 20,1 / 30 / 30,1 / 40 / 40,1 — los tres compartidos del original. */
    for (const a of ['20', '20.1', '30', '30.1', '40', '40.1']) {
      try {
        await ev(`window.__P.nuevo()`);
        await abrirAi();
        await tipear('ai_area', a);
        await ev(`window.__P.calentar()`);
        r.bordes[a] = await leerAi();
      } catch (e) { r.bordes[a] = { err: e.message }; }
    }
    process.stderr.write('[ai] bordes\n');
    /* LAS CUATRO ESCENAS DE LA JERARQUIA. */
    await escAi('A-solo-area',   [['ai_area', '35']]);
    await escAi('B-solo-volumen',[['peso', '80'], ['talla', '180'], ['ai_vol', '98']]);
    await escAi('C-ambos',       [['peso', '80'], ['talla', '180'], ['ai_vol', '60'], ['ai_area', '35']]);
    await escAi('D-ninguno',     []);
    await escAi('E-solo-diam',   [['ai_diam', '44']]);
    await escAi('F-area-y-diam', [['ai_area', '35'], ['ai_diam', '44']]);
    /* CONTROL: el volumen NORMAL con el area moderada -la discordancia- y el borrado. */
    await escAi('G-vol-normal-area-mod', [['peso', '80'], ['talla', '180'], ['ai_vol', '60'], ['ai_area', '35']]);
    try {
      await ev(`window.__P.nuevo()`);
      await abrirAi();
      await tipear('ai_area', '35');
      await borrar('ai_area', 'bs');
      await ev(`window.__P.calentar()`);
      r.escenas['H-borrado'] = await leerAi();
    } catch (e) { r.escenas['H-borrado'] = { err: e.message }; }
    /* Referencias y la ficha. */
    try {
      r.refs.filas = await ev(`(function(){
        try { if (typeof showTab==='function') showTab('referencias'); } catch(e){}
        try { if (typeof toggleRef==='function') { var c=document.getElementById('ref-ai');
          if (c && getComputedStyle(c).display==='none') toggleRef('ai', document.querySelector('[onclick*="toggleRef(&apos;ai&apos;"]')); } } catch(e){}
        try { if (typeof evRefPintar==='function') evRefPintar('ai'); } catch(e){}
        var h=document.getElementById('ref-ai-cuerpo');
        if(!h) return 'NO EXISTE';
        return Array.prototype.map.call(h.querySelectorAll('tr'), function(tr){
          return Array.prototype.map.call(tr.cells, function(c){return (c.textContent||'').trim()}).join(' | ') })
          .filter(function(x){ return x.indexOf('rea')>=0 }) })()`);
      r.refs.ficha = await ev(`(function(){ try {
        var f=(EV_REG||[]).filter(function(x){return x.id==='DIM-AI-002'})[0];
        return f ? { valor:f.valor, duenio:f.duenio, folio:f.folio, guia:f.guia, fuente:f.fuente_una_linea } : 'SIN' } catch(e){ return 'EXC '+e.message } })()`);
      r.refs.bandas = await ev(`(typeof AI_AREA_BANDAS!=='undefined') ? JSON.stringify(AI_AREA_BANDAS) : 'SIN'`);
      r.refs.rot = await ev(`(typeof aiAreaRotulo==='function') ? AI_AREA_BANDAS.map(function(b){return aiAreaRotulo(b)}) : 'SIN'`);
      r.refs.excel = await ev(`window.__P.excelDOM()`);
    } catch (e) { r.refs.err = e.message; }
    out.grupos.ai = r;
    process.stderr.write('[ai] listo\n');
  }


  /* ══ GRUPO «peri» — LOS TRES GRADOS DEL DERRAME ═══════════════════════════════════════════
     El selector vive en la pestaña ETE, dentro de la seccion «pericardio-masas», que nace
     cerrada. Las escenas cubren los seis bordes, los dos tokens de LEGADO y el borrado. */
  if (corre('peri')) {
    const r = { bordes: {}, legado: {}, ficha: {} };
    const abrirPeri = () => ev(`(function(){
      try { if (typeof showTab === 'function') showTab('ete'); } catch(e){}
      var c = document.getElementById('ete-seccion-pericardio-masas');
      if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function')
        toggleEteSeccion('pericardio-masas');
      var e = document.getElementById('pericardio');
      var rr = e ? e.getBoundingClientRect() : null;
      return rr ? { w: Math.round(rr.width), opciones: Array.prototype.map.call(e.options, function(o){
        return (o.hidden ? '[oculta] ' : '') + o.value }) } : 'NO EXISTE' })()`);
    const leerPeri = async () => ({
      tam:   await ev(`(typeof dptTamano==='function') ? JSON.stringify(dptTamano()) : 'SIN FN'`),
      tamEco: await ev(`window.__P.txt('dpt-tam-eco')`),
      concl: await ev(`window.__P.txt('dpt-concl')`),
      badge: await ev(`window.__P.txt('dpt-concl-badge')`),
      estandar: await ev(`(function(){ var o = window.__P.informe('estandar');
        var t = (o && o.inf) ? o.inf : String(o||'');
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('erram')>=0 || l.indexOf('ericard')>=0 })||[]).join(' | ') })()`),
      narrativo: await ev(`(function(){ var o = window.__P.informe('narrativo');
        var t = (o && o.inf) ? o.inf : String(o||'');
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('erram')>=0 || l.indexOf('ericard')>=0 })||[]).join(' | ') })()`),
      suma:  await ev(`(function(){ var t=(document.getElementById('en_suma')||{}).value||'';
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('erram')>=0 })||[]).join(' | ') })()`),
      excelPeri: await ev(`(function(){ try { var f = window.__P.excelDOM().fila;
        var o = {}; Object.keys(f).forEach(function(k){ if (k.indexOf('ericard')>=0) o[k]=f[k] }); return JSON.stringify(o) } catch(e){ return 'EXC' } })()`),
    });
    try {
      r.puerta = await abrirPeri();
      /* LOS BORDES: con el grado consignado y los milimetros tipeados, para que el aviso de
         discrepancia se mida contra los limites NUEVOS. */
      for (const [tok, mm] of [['Derrame leve (<10mm)','9.9'], ['Derrame leve (<10mm)','10'],
                               ['Derrame moderado (10-20mm)','10'], ['Derrame moderado (10-20mm)','10.1'],
                               ['Derrame moderado (10-20mm)','19.9'], ['Derrame moderado (10-20mm)','20'],
                               ['Derrame severo (>20mm)','20'], ['Derrame severo (>20mm)','20.1'],
                               ['Derrame leve (<10mm)','3']]) {
        await ev(`window.__P.nuevo()`);
        await abrirPeri();
        await ev(`window.__P.sel('pericardio',${JSON.stringify(tok)})`);
        await ev(`(function(){ try { if (typeof showTab==='function') showTab('amiloidosis'); } catch(e){}
          var c=document.getElementById('dpt_mm_post'); return c ? 1 : 0 })()`);
        try { await tipear('dpt_mm_post', mm); } catch (e) { r.bordes['_tecleo_' + tok + '_' + mm] = e.message; }
        await ev(`window.__P.calentar()`);
        r.bordes[tok.replace('Derrame ','') + ' @ ' + mm + 'mm'] = await leerPeri();
      }
      /* LOS DOS TOKENS DE LEGADO: abren como se guardaron y se MUESTRAN como leve. */
      for (const tok of ['Derrame mínimo', 'Derrame leve (5-10mm)']) {
        await ev(`window.__P.nuevo()`);
        await abrirPeri();
        const puesto = await ev(`window.__P.sel('pericardio',${JSON.stringify(tok)})`);
        await ev(`window.__P.calentar()`);
        const m = await leerPeri();
        m.puesto = puesto;
        m.valorCrudo = await ev(`window.__P.val('pericardio')`);
        r.legado[tok] = m;
      }
      /* La ficha de Referencias. */
      r.ficha.texto = await ev(`(function(){
        try { if (typeof showTab==='function') showTab('referencias'); } catch(e){}
        var c = document.getElementById('ref-pericardio');
        if (c && getComputedStyle(c).display === 'none' && typeof toggleRef === 'function') {
          var h = c.previousElementSibling; toggleRef('pericardio', h); }
        if (!c) return 'NO EXISTE';
        return (c.textContent || '').split(/[ \\t\\r\\n]+/).join(' ').trim() })()`);
      r.ficha.titulo = await ev(`(function(){ var c=document.getElementById('ref-pericardio');
        var h=c?c.previousElementSibling:null;
        return h?(h.textContent||'').split(/[ \\t\\r\\n]+/).join(' ').trim():null })()`);
    } catch (e) { r.err = e.message; }
    out.grupos.peri = r;
    process.stderr.write('[peri] listo\n');
  }


  /* ══ GRUPO «tapo» — EL MODULO LISTA Y NO CONCLUYE ═════════════════════════════════════════
     Los campos del modulo viven en la pestaña de amiloidosis/ETT avanzado, y el selector del
     derrame en ETE. Las escenas cubren los tres criterios por separado, los tres juntos -que es
     la escena que en HEAD publicaba «TAPONAMIENTO CARDIACO»-, ninguno evaluado, y el campo del
     medico en sus tres estados. */
  if (corre('tapo')) {
    const r = { escenas: {}, frases: {} };
    const abrirDpt = () => ev(`(function(){
      try { if (typeof showTab === 'function') showTab('ete'); } catch(e){}
      var c = document.getElementById('ete-seccion-pericardio-masas');
      if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function')
        toggleEteSeccion('pericardio-masas');
      try { if (typeof showTab === 'function') showTab('amiloidosis'); } catch(e){}
      var e = document.getElementById('dpt_mm_post');
      var rr = e ? e.getBoundingClientRect() : null;
      return rr ? { w: Math.round(rr.width) } : 'NO EXISTE' })()`);
    const leerDpt = async () => ({
      clave:  await ev(`(typeof dptEstado==='function') ? (dptEstado()||{}).clave : 'SIN FN'`),
      signos: await ev(`(typeof dptEstado==='function') ? ((dptEstado()||{}).signos||null) : 'SIN FN'`),
      badge:  await ev(`window.__P.txt('dpt-concl-badge')`),
      concl:  await ev(`window.__P.txt('dpt-concl')`),
      frases: await ev(`(typeof dptFrases==='function') ? dptFrases() : 'SIN FN'`),
      suma:   await ev(`(typeof dptSuma==='function') ? dptSuma() : 'SIN FN'`),
      manda:  await ev(`(typeof dptMandaSuma==='function') ? dptMandaSuma() : 'SIN FN'`),
      estandar: await ev(`(function(){ var o = window.__P.informe('estandar');
        var t = (o && o.inf) ? o.inf : String(o||'');
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('erram')>=0 || l.indexOf('olapso')>=0 || l.indexOf('aponamiento')>=0 || l.indexOf('ompromiso')>=0 })||[]).join(' | ') })()`),
      sumaInf: await ev(`(function(){ var t=(document.getElementById('en_suma')||{}).value||'';
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('erram')>=0 || l.indexOf('aponamiento')>=0 })||[]).join(' | ') })()`),
    });
    const escDpt = async (nombre, pasos) => {
      try {
        await ev(`window.__P.nuevo()`);
        await abrirDpt();
        await pasos();
        /* El modulo tiene que estar INTEGRADO para que su linea llegue al informe. */
        await ev(`(function(){ try { if (typeof amiloIntegrar==='function') amiloIntegrar('dpt') } catch(e){} return 1 })()`);
        await ev(`window.__P.calentar()`);
        r.escenas[nombre] = await leerDpt();
      } catch (e) { r.escenas[nombre] = { err: e.message }; }
      process.stderr.write('[tapo] ' + nombre + '\n');
    };
    const ponerDerrame = (tok) => ev('window.__P.sel(' + JSON.stringify('pericardio') + ',' + JSON.stringify(tok) + ')');

    await escDpt('A-sin-derrame', async () => {});
    await escDpt('B-derrame-solo', async () => { await ponerDerrame('Derrame moderado (10-20mm)'); });
    await escDpt('C-colapso-ad', async () => {
      await ponerDerrame('Derrame moderado (10-20mm)');
      await ev(`window.__P.sel('dpt_col_ad','si')`); });
    await escDpt('D-tres-criterios', async () => {
      await ponerDerrame('Derrame severo (>20mm)');
      await ev(`window.__P.sel('dpt_col_vd','si')`);
      await ev(`window.__P.sel('vci_diam','')`);
      await tipear('vci_diam', '25');
      await ev(`window.__P.sel('vci_col','<50')`);
      await tipear('resp_var_mitral', '35'); });
    await escDpt('E-severo-sin-signos', async () => {
      await ponerDerrame('Derrame severo (>20mm)');
      await ev(`window.__P.sel('dpt_col_vd','no')`); });
    await escDpt('F-hemo-si', async () => {
      await ponerDerrame('Derrame moderado (10-20mm)');
      await ev(`window.__P.sel('dpt_col_ad','si')`);
      await ev(`window.__P.sel('pericardio_hemo','si')`); });
    await escDpt('G-hemo-no', async () => {
      await ponerDerrame('Derrame moderado (10-20mm)');
      await ev(`window.__P.sel('pericardio_hemo','no')`); });
    /* El ejemplo TEXTUAL de la orden. */
    await escDpt('H-ejemplo-orden', async () => {
      await ponerDerrame('Derrame moderado (10-20mm)');
      await ev(`window.__P.sel('dpt_col_ad','si')`);
      await tipear('resp_var_mitral', '30'); });
    /* El estado del modulo y los textos retirados. */
    try {
      r.censo = await ev(`(function(){
        var t = document.documentElement.innerHTML;
        return { badgeConst: (typeof DPT_BADGE !== 'undefined'),
                 claveTapo: t.indexOf('clave = ' + String.fromCharCode(39) + 'taponamiento') >= 0,
                 subcostal: t.indexOf('subcostal') >= 0,
                 claseIIa: t.indexOf('Clase IIa derrame severo') >= 0,
                 opcCohorte: (function(){ var e=document.getElementById('coh-dpt-con');
                   return e ? Array.prototype.map.call(e.options, function(o){return o.value}) : null })(),
                 ecosmart: (function(){ var e=document.getElementById('dpt-concl');
                   var b=e&&e.closest?e.closest('.calc-box'):null;
                   return b ? (b.textContent||'').indexOf('CRITERIO DE ECOSMART')>=0 : null })(),
                 hemoOpc: (function(){ var e=document.getElementById('pericardio_hemo');
                   return e ? Array.prototype.map.call(e.options, function(o){return o.value}) : null })() } })()`);
      r.excel = await ev(`window.__P.excelDOM()`);
    } catch (e) { r.censoErr = e.message; }
    out.grupos.tapo = r;
    process.stderr.write('[tapo] listo\n');
  }


  /* ══ GRUPO «tep» — EL CORTE DE VD/VI Y LAS FORMULAS DE REFERENCIAS ════════════════════════
     ⚠️ CUATRO VALORES Y NO DOS: con 0,89 y 1,0 los dos operadores -`>=0.9` y `>=1.0`- dan
     resultados distintos, pero el tramo que los separa es 0,9 a 0,99 y ahi esta el cambio. */
  if (corre('tep')) {
    const r = { bordes: {}, refs: {} };
    const abrirTep = () => ev(`(function(){
      try { if (typeof showTab === 'function') showTab('hemodinamica'); } catch(e){}
      var e = document.getElementById('tep_vdvi');
      var rr = e ? e.getBoundingClientRect() : null;
      return rr ? { w: Math.round(rr.width) } : 'NO EXISTE' })()`);
    const leerTep = async () => ({
      cap:   await ev(`window.__P.txt('tep-vdvi-interp')`),
      interp: await ev(`window.__P.txt('tep-interp')`),
      riesgo: await ev(`window.__P.txt('tep-riesgo')`),
      corte: await ev(`(typeof TEP_VDVI_DILAT_MIN !== 'undefined') ? TEP_VDVI_DILAT_MIN : 'SIN CONST'`),
      pocus: await ev(`window.__P.txt('pop-pocus-vd')`),
      estandar: await ev(`(function(){ var o = window.__P.informe('estandar');
        var t = (o && o.inf) ? o.inf : String(o||'');
        return (t.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('VD/VI')>=0 || l.indexOf('romboembol')>=0 || l.indexOf('isfunci')>=0 })||[]).join(' | ') })()`),
    });
    try {
      r.puerta = await abrirTep();
      for (const vv of ['0.89', '0.9', '0.99', '1', '1.01']) {
        await ev(`window.__P.nuevo()`);
        await abrirTep();
        await tipear('tep_vdvi', vv);
        await ev(`window.__P.calentar()`);
        r.bordes[vv] = await leerTep();
      }
      /* El BORRADO: la regla ARR. */
      await ev(`window.__P.nuevo()`);
      await abrirTep();
      await tipear('tep_vdvi', '1.2');
      await borrar('tep_vdvi', 'bs');
      await ev(`window.__P.calentar()`);
      r.bordes['borrado'] = await leerTep();
      /* La ficha de TEP y la tabla de formulas. */
      r.refs.tep = await ev(`(function(){
        try { if (typeof showTab==='function') showTab('referencias'); } catch(e){}
        var c = document.getElementById('ref-tep');
        if (c && getComputedStyle(c).display === 'none' && typeof toggleRef === 'function')
          toggleRef('tep', c.previousElementSibling);
        if (!c) return 'NO EXISTE';
        var t = (c.textContent || '').split(/\\s+/).join(' ');
        return { vdvi09: t.indexOf('VD/VI ≥0.9') >= 0, vdvi10: t.indexOf('VD/VI ≥1.0') >= 0,
                 tp032: t.indexOf('0.32') >= 0 } })()`);
      r.refs.formulas = await ev(`(function(){
        try { if (typeof showTab==='function') showTab('referencias'); } catch(e){}
        var filas = Array.prototype.filter.call(document.querySelectorAll('tr'), function(tr){
          var t = tr.textContent || '';
          return t.indexOf('TAPSE/PSAP') >= 0 || t.indexOf('Relación VD/VI') >= 0; });
        return filas.map(function(tr){ return Array.prototype.map.call(tr.cells, function(c){
          return (c.textContent||'').split(/\\s+/).join(' ').trim() }).join(' | ') }) })()`);
      /* `VD_VI_HTP_MIN` es un const de MODULO y no una propiedad de window -la trampa de
         ECO_AYUDA-, asi que se mide por COMPORTAMIENTO: el corte de la probabilidad de HTP es
         OTRO campo (`vd_vi`) y otra pregunta, y sigue en 1,0 con operador ESTRICTO. */
      r.refs.htpVd = await ev(`(function(){ var o = {};
        [['1','1.0 exacto'],['1.01','por encima']].forEach(function(p){
          var e = document.getElementById('vd_vi'); if (!e) { o.err='NO EXISTE vd_vi'; return; }
          e.value = p[0]; e.dispatchEvent(new Event('input', { bubbles: true }));
          try { if (typeof calcVD === 'function') calcVD(); } catch(x){}
          var f = document.getElementById('row-tapse-psap');
          o[p[0]] = (function(){ var el = document.getElementById('vdvi-interp');
            return el ? (el.textContent||'').trim() : 'SIN NODO' })(); });
        return o })()`);
      r.excel = await ev(`window.__P.excelDOM()`);
    } catch (e) { r.err = e.message; }
    out.grupos.tep = r;
    process.stderr.write('[tep] listo\n');
  }


  if (corre('xlsassert')) {
    const r = {};
    try {
      r.bloques = await ev(`(typeof _labXlsAssertBloques==='function') ? _labXlsAssertBloques() : 'SIN FN'`);
      r.listas  = await ev(`(typeof _labXlsAssertListas==='function') ? _labXlsAssertListas() : 'SIN FN'`);
    } catch (e) { r.err = e.message; }
    out.grupos.xlsassert = r;
    process.stderr.write('[xlsassert] listo\n');
  }

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  process.stdout.write(JSON.stringify(OUT, null, 1));
  cdp.close(); srv.close(); process.exit(0);
}

main().catch(async (e) => {
  process.stdout.write(JSON.stringify({ err: e.message, stack: String(e.stack || '').slice(0, 1200) }, null, 1));
  process.exit(1);
});
