#!/usr/bin/env node
/**
 * _probe_j.mjs — sonda A/B de SOLO LECTURA de la tanda «J» (2026-10-16).
 *
 * Mide, con TECLAS Y CLICS REALES y el PDF GENERADO DE VERDAD:
 *   ai        — la AI con volumen que NO se puede indexar: la frase en los tres estilos, el
 *               EN SUMA, la capsula y la fila del PDF, mas las escenas que NO cambian.
 *   ppt       — las cuatro ramas de la UNA linea de AI del PPT, por su dueno y por el fuente.
 *   ident     — los dos marcadores de identificacion: el pintado, el clic real, el area
 *               tactil, el color en los dos temas, la memoria de sesion, «Nuevo estudio»,
 *               guardar y reabrir, el PDF en las seis plantillas y el reimpreso, y el PPT.
 *   frases    — el panel de frases: los tamanios del informe, del EN SUMA y de la columna a
 *               tres anchos, el desplazamiento propio, el cursor y los oyentes.
 *   controles — informe, EN SUMA, las 440 columnas del Excel clave por clave, los ocho grados,
 *               las ocho pastillas, la diastolica, el HFA-PEFF, el Wilkins y el Laboratorio.
 *
 *   node scripts/_probe_j.mjs --file /tmp/index.HEAD.html --solo ai > /tmp/j.HEAD.json
 *   node scripts/_probe_j.mjs                                      > /tmp/j.NEW.json
 *
 * Infraestructura calcada de _probe_h.mjs (servidor, Chrome, teclas reales, jsPDF espiado).
 *
 * ⚠️ NI UN ACENTO GRAVE adentro de la SONDA, tampoco en los comentarios de este archivo.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-pdfvc-'));
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
    let id = 0; const pend = new Map();
    ws.addEventListener('open', () => res({
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}

const SOLO = (() => { const i = process.argv.indexOf('--solo');
  return i > 0 ? process.argv[i + 1].split(',').map(s => s.trim()).filter(Boolean) : [] })();
const corre = (g) => !SOLO.length || SOLO.indexOf(g) > -1;
const DEST = arg('--dest');

/* ══ LA SONDA QUE VIVE EN LA PAGINA ══════════════════════════════════════════════════════════
   CENTINELA en cada lectura: contra HEAD varias piezas no existen, y un `.length` sobre
   undefined mata la corrida entera — eso prueba que el arbol es distinto, no que la sonda sabe
   medir. Es la leccion que TC-455, TC-473, TC-477, TC-480 y TC-485 ya tienen escrita. */
const SONDA = `window.__P = {
  despejar() { var o = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (!m) { o[id] = 'NO EXISTE'; return }
      o[id] = getComputedStyle(m).display;
      if (o[id] !== 'none') { m.style.display = 'none'; o[id] += ' -> none' } });
    return o },

  val(id) { var e = document.getElementById(id); return e ? e.value : 'NO EXISTE' },
  txt(sel) { var e = document.querySelector(sel); return e ? String(e.textContent||'').trim() : 'NO EXISTE' },
  geo(id) { var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), ok: r.width > 0 && r.height > 0 } },

  /* Abre la pestana y la tarjeta plegable que contienen a un campo. Sin esto, el campo existe
     y no tiene geometria, y un tecleo que no ocurre se lee igual que una medicion. */
  abrirPara(id) {
    var e = document.getElementById(id);
    if (!e) return { ok:false, err:'NO EXISTE ' + id };
    var n = e, pasos = [];
    while (n && n !== document.body) {
      /* ⚠️ showTab('valvulas') CORRE valvCerrarTarjetas Y CIERRA LO QUE EL CLIC ACABA DE
         ABRIR: llamarlo con la pestana ya activa deshace las dos puertas de la mitral y el
         campo vuelve a medir 0x0. Se llama SOLO si la pestana no esta activa, que es la
         leccion ya escrita en CLAUDE.md. */
      if (n.classList && n.classList.contains('tab-section') && n.id) {
        if (getComputedStyle(n).display === 'none') {
          try { showTab(String(n.id).replace(/^tab-/, '')); pasos.push('tab:' + n.id) } catch (x) {}
        }
        if (n.id === 'tab-valvulas') { pasos.push('valv:' + window.__P.abrirValvulas()) }
      }
      if (n.id && /^sacc-/.test(n.id) && getComputedStyle(n).display === 'none') {
        try { secToggle(String(n.id).replace(/^sacc-/, '')); pasos.push('sacc:' + n.id) } catch (x) {}
      }
      /* ⚠️ EL DOPPLER TRICUSPIDEO NO ES UN sacc- Y NO SE ABRE CON secToggle: es un div con id
         propio, escondido con display:none, cuyo encabezado llama a toggleCard(id, this) — y
         ESA funcion EXIGE el segundo argumento. Sin esto, vmax_it existe y mide 0x0, el tecleo
         ABORTA —que es lo correcto— y la escena se queda sin medir. Se abre CLICKEANDO el
         encabezado, que es el gesto del medico, y no llamando a la funcion con un argumento
         inventado. */
      if (n.id && getComputedStyle(n).display === 'none') {
        var hd = document.querySelector('[onclick*="toggleCard(' + String.fromCharCode(39) + n.id + String.fromCharCode(39) + '"]');
        if (hd) { try { hd.click(); pasos.push('card:' + n.id) } catch (x) {} }
      }
      n = n.parentElement;
    }
    var r = e.getBoundingClientRect();
    return { ok: r.width > 0 && r.height > 0, pasos: pasos,
             rect: { w: Math.round(r.width), h: Math.round(r.height) } } },

  sel(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err:'NO EXISTE ' + id };
    var hay = Array.prototype.slice.call(e.options || []).map(function(o){ return o.value });
    if (hay.indexOf(valor) < 0) return { err:'NO HAY OPCION ' + valor, hay:hay };
    e.value = valor; e.dispatchEvent(new Event('change', { bubbles:true }));
    return (e.value === valor) ? { ok:true } : { err:'NO QUEDO', valor:e.value } },

  limpiar() { try { limpiarCampos(true) } catch (e) {} return 1 },

  /* ⚠️ LOS CAMPOS DE VALVULAS VIVEN DETRAS DE DOS PUERTAS Y SUS NOMBRES NO COINCIDEN: el
     contenedor es #bloque-insuf-mitral y el onclick dice valvDatosTog('caja-insuf-mitral'),
     asi que ningun buscador generico por id da con el. Se abren las cuatro secciones y los
     ocho cajones de una, que es lo que ya hace la sonda del PDF de la vena contracta. */
  abrirValvulas() {
    try { showTab('valvulas') } catch (e) {}
    var n = 0;
    /* Se clickean los CONTROLES REALES y no se llama a la funcion con un id inventado: el
       contenedor es #bloque-insuf-mitral y el onclick dice valvDatosTog('caja-insuf-mitral'),
       asi que ningun buscador por id da con el par. Dos pasadas, porque la seccion tiene que
       estar abierta para que su cajon tenga geometria. */
    /* ⚠️ LOS DOS CONTROLES NO SE MARCAN IGUAL: el cajon de datos lleva aria-expanded y el
       encabezado de la SECCION (un h2 con toggleEteSeccion) no lleva NINGUNO. Filtrar por
       aria-expanded dejaba la seccion de la mitral cerrada y el campo medido en 0x0. El estado
       de la seccion se lee de su CONTENEDOR, que es el que la funcion esconde. */
    [0,1].forEach(function(){
      Array.prototype.slice.call(document.querySelectorAll('[onclick*="toggleEteSeccion("]'))
        .forEach(function(b){
          /* ⚠️ SIN REGEX: una barra invertida dentro de un template literal se COCINA, asi
             que el patron que llega al motor no es el que se escribio. Es la trampa que este
             repo ya pago con el barra-ene y con el barra-ese. Se parte por comilla simple. */
          var oc = String(b.getAttribute('onclick')||'');
          var tr = oc.split(String.fromCharCode(39));
          if (tr.length < 2) return;
          var cont = document.getElementById('ete-seccion-' + tr[1]);
          if (cont && getComputedStyle(cont).display === 'none') { try { b.click(); n++ } catch (x) {} } });
      Array.prototype.slice.call(document.querySelectorAll('[onclick*="valvDatosTog("]'))
        .forEach(function(b){
          if (b.getAttribute('aria-expanded') === 'false') { try { b.click(); n++ } catch (x) {} } }) });
    return n },

  /* ── LA AURICULA IZQUIERDA, en la pantalla ── */
  ai() {
    var g = function(id){ var e = document.getElementById(id);
      return e ? String(e.textContent||'').trim() : 'NO EXISTE' };
    return { idx: g('ai-idx'), vol: g('ai-interp'), diam: g('ai-diam-interp'), area: g('ai-area-interp'),
             banda: (function(){ try {
               if (typeof aiVolClasificar !== 'function') return 'SIN FN';
               var b = aiVolClasificar(window.__P.idxNum());
               return b ? b.clave : null } catch (e) { return 'EXC' } })() } },
  idxNum() { var v = parseFloat(document.getElementById('ai_vol') ? document.getElementById('ai_vol').value : '');
    var b = (typeof getBSA === 'function') ? getBSA() : null;
    return (v && b) ? +(v / b).toFixed(1) : null },

  /* ── El informe y el EN SUMA. El estilo es ESTADO DE SESION: se fija en cada escena. ── */
  informe(est) {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(est) } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    return { inf: window.__P.val('informe_texto'), suma: window.__P.val('en_suma') } },
  /* La linea de la AI del informe, aislada: comparar el informe entero entre escenas mezcla
     la diastolica, que SI tiene que moverse con el volumen de la AI. */
  lineaAI(est) {
    var r = window.__P.informe(est);
    var ls = String(r.inf || '').split(String.fromCharCode(10))
      .filter(function(l){ return /[Aa]ur[ií]cula izquierda|^AI[ :,]/.test(l) });
    var ss = String(r.suma || '').split(String.fromCharCode(10))
      .filter(function(l){ return /AI |[Aa]ur[ií]cula/.test(l) });
    return { inf: ls, suma: ss } },

  camposCrudos() { var c = {};
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
      if (e.type === 'checkbox' || e.type === 'radio') c[e.id + '__chk'] = e.checked ? '1' : '0';
      else c[e.id] = e.value });
    return c },
  excel() {
    try {
      if (typeof _labExcelRow !== 'function') return { err:'SIN _labExcelRow' };
      var f = _labExcelRow({ id:'p1', fecha:'2026-10-16', nombre:'X',
                             campos: window.__P.camposCrudos(), informe_texto:'', en_suma:'' });
      return { n: Object.keys(f).length, fila: f };
    } catch (e) { return { err: String(e && e.message) } } },

  grados() { var o = {};
    ['im_grado','ia_grado','it_grado','ip_grado','ea_grado','em_grado','et_grado','ep_grado']
      .forEach(function(id){ o[id] = window.__P.val(id) });
    ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
      ['insuf','esten'].forEach(function(t){
        var b = document.getElementById('pill-' + t + '-' + v);
        o['pill-' + t + '-' + v] = b ? String(b.className||'') : 'NO EXISTE' }) });
    o.diast = window.__P.txt('#dd-interp');
    o.hfapeff = window.__P.txt('#hfapeff-eco');
    o.lab = (function(){ try { return (typeof _labDiastGrado === 'function')
      ? _labDiastGrado({ campos:{ en_suma: window.__P.val('en_suma'),
                                  informe_texto: window.__P.val('informe_texto') } }) : 'SIN FN' }
      catch (e) { return 'EXC' } })();
    return o },

  /* ── EL PDF, GENERADO DE VERDAD ──
     Se envuelve el CONSTRUCTOR y no el prototipo: en jsPDF 2.x los metodos del nucleo son
     propiedades PROPIAS de cada documento. Se registran los text con su posicion Y TAMBIEN
     los circle, line y triangle, que es como se dibuja el simbolo del sexo: un espia que
     solo mire el texto informaria «no hay simbolo» sobre una figura perfecta. */
  pdf(plantilla, reimpresion) {
    if (typeof window.jspdf === 'undefined') return { err:'SIN jsPDF' };
    if (plantilla) { try { localStorage.setItem('ett_pdf_plantilla', plantilla) } catch (e) {} }
    var orig = window.jspdf.jsPDF;
    var textos = [], figs = [], bytes = null, err = null;
    function Envuelto(){
      var d = new orig(arguments[0]);
      var oText = d.text, oCirc = d.circle, oLine = d.line, oTri = d.triangle;
      d.text = function(t, x, y){
        var s = (typeof t === 'string') ? t : (Array.isArray(t) ? t.join(String.fromCharCode(1)) : String(t));
        var pg = 0; try { pg = d.internal.getCurrentPageInfo().pageNumber } catch (e) {}
        textos.push(pg + '|' + (+x).toFixed(2) + '|' + (+y).toFixed(2) + '|' + s);
        return oText.apply(d, arguments) };
      d.circle = function(x, y, r){ figs.push('C|' + (+x).toFixed(2) + '|' + (+y).toFixed(2) + '|' + (+r).toFixed(3));
        return oCirc.apply(d, arguments) };
      d.line = function(x1, y1, x2, y2){ figs.push('L|' + (+x1).toFixed(2) + '|' + (+y1).toFixed(2) + '|' + (+x2).toFixed(2) + '|' + (+y2).toFixed(2));
        return oLine.apply(d, arguments) };
      if (oTri) d.triangle = function(){ figs.push('T'); return oTri.apply(d, arguments) };
      d.save = function(){ try { bytes = d.output('datauristring') } catch (e) {} return d };
      return d }
    Envuelto.API = orig.API; Envuelto.version = orig.version;
    window.jspdf.jsPDF = Envuelto;
    try { if (reimpresion) window._pdfReimpresion = true; generarPDFReal() }
    catch (e) { err = String(e && e.message || e) }
    finally { window.jspdf.jsPDF = orig; if (reimpresion) window._pdfReimpresion = false }
    var i = bytes ? bytes.indexOf(',') : -1;
    /* Las figuras que caen a la ALTURA de la celda «Edad / Sexo»: es la unica forma de afirmar
       que el simbolo se dibujo DONDE va y no en cualquier parte del documento. */
    return { err:err, guardo:!!bytes, nTextos:textos.length, nFigs:figs.length,
             largoB64: (i >= 0) ? bytes.length - i - 1 : -1,
             b64: (i >= 0) ? bytes.slice(i + 1) : null,
             textos:textos, figs:figs } },

  /* Las celdas del PDF que esta tanda toca, buscadas por su rotulo en la lista de doc.text. */
  celdas(textos) {
    var pick = function(re){ return (textos || []).filter(function(t){ return re.test(t) }) };
    return { vci: pick(/Colapso VCI|>50|<50/), sexo: pick(/Masculino|Femenino|a[nñ]os/),
             doc: pick(/\\|(CI|DNI|CPF|C[eé]dula):/) } },

  /* El PDF REIMPRESO de un estudio guardado, por su camino REAL: se guarda, se limpia el
     formulario y se llama a pdfDeInformeGuardado, que repone los campos del estudio y pone
     window._pdfReimpresion. Simularlo con el flag a mano NO es el reimpreso: ahi los campos
     siguen siendo los de la pantalla. La promesa se resuelve cuando jsPDF guarda. */
  async reimprimir(id) {
    if (typeof window.jspdf === 'undefined') return { err:'SIN jsPDF' };
    if (typeof pdfDeInformeGuardado !== 'function') return { err:'SIN pdfDeInformeGuardado' };
    var orig = window.jspdf.jsPDF;
    var textos = [], figs = [], listo = null;
    var espera = new Promise(function(res){ listo = res });
    function Envuelto(){
      var d = new orig(arguments[0]);
      var oText = d.text, oCirc = d.circle, oLine = d.line;
      d.text = function(t, x, y){
        var ss = (typeof t === 'string') ? t : (Array.isArray(t) ? t.join(String.fromCharCode(1)) : String(t));
        var pg = 0; try { pg = d.internal.getCurrentPageInfo().pageNumber } catch (e) {}
        textos.push(pg + '|' + (+x).toFixed(2) + '|' + (+y).toFixed(2) + '|' + ss);
        return oText.apply(d, arguments) };
      d.circle = function(x, y, r){ figs.push('C'); return oCirc.apply(d, arguments) };
      d.line = function(){ figs.push('L'); return oLine.apply(d, arguments) };
      d.save = function(){ try { listo(1) } catch (e) {} return d };
      return d }
    Envuelto.API = orig.API; Envuelto.version = orig.version;
    window.jspdf.jsPDF = Envuelto;
    try { pdfDeInformeGuardado(id, 'abrir', 'PDF') } catch (e) { return { err:String(e && e.message) } }
    await Promise.race([espera, new Promise(function(r){ setTimeout(function(){ r(0) }, 25000) })]);
    window.jspdf.jsPDF = orig;
    return { nTextos: textos.length, nFigs: figs.length, textos: textos, figs: figs } },

  /* ⚠️ EL ID SE BUSCA POR DOCUMENTO Y NO ES «EL ULTIMO DE LA LISTA»: con el ultimo, las tres
     escenas devolvieron el MISMO id y las dos de abajo reimprimieron el estudio de la primera
     —un denominador roto con pinta de medicion buena—. Cada escena usa su propio documento. */
  idPorDoc(ci) { try {
    var l = (typeof getInformes === 'function') ? getInformes() : [];
    for (var i = l.length - 1; i >= 0; i--) {
      var c = l[i].campos || {};
      if (String(c.ci || '') === String(ci)) return l[i].id || null }
    return null } catch (e) { return 'EXC' } },

  /* ⚠️ guardarInforme DEVUELVE false Y NO GUARDA si las severidades valvulares no estan
     confirmadas: abre la tarjeta de revision y espera un clic. Y valvSevConfirmada es un let
     de MODULO, no una propiedad de window, asi que no se puede poner a mano —la trampa que este
     repo ya tiene escrita para _labImpDatos y ECO_AYUDA—. Se confirma clickeando el boton
     real de la tarjeta, que es el gesto del medico. */
  guardarEstudio() {
    try {
      if (typeof guardarInforme !== 'function') return { err:'SIN guardarInforme' };
      var r1 = guardarInforme();
      var b = document.getElementById('rev-confirm');
      if (b) { b.click(); return { ok:true, viaTarjeta:true } }
      return { ok: r1 !== false, viaTarjeta:false, r1: r1 };
    } catch (e) { return { err:String(e && e.message) } } },

  /* ── J1: la fila del PDF de la AI, buscada por su rotulo ── */
  filaAI(textos) {
    var pick = function(re){ return (textos || []).filter(function(t){ return re.test(t) }) };
    return { volIdx: pick(/Vol\. indexado|Sin indexar/), volAI: pick(/Volumen AI/) } },

  /* ── J2: la UNA linea de la AI del PPT, por su DUENO ── */
  aiUno() { try {
    if (typeof aiResumenUno !== 'function') return { err:'SIN aiResumenUno' };
    var r = aiResumenUno();
    return r ? { lbl:r.lbl, val:String(r.val), suf:r.suf } : null } catch (e) { return { err:'EXC ' + e.message } } },
  /* Y por el FUENTE, que es lo que prueba que la diapositiva dejo de armar DOS filas. Se busca
     la DECLARACION completa y no una mencion: un comentario que nombre lo retirado se lee
     igual que el codigo retirado, que es la trampa que TC-476 y TC-486 ya pagaron. */
  pptFuente() { var h = document.documentElement.innerHTML;
    return { llamaDueno: h.indexOf('aiResumenUno(); if (_ai) fila(DER') > -1,
             filaVolMl:  h.indexOf("fila(DER,'Volumen AI', _pptNum('ai_vol'), ' ml')") > -1,
             filaIdxSpan: h.indexOf("fila(DER,'Vol. AI indexado', _pptSpan('ai-idx'))") > -1 } },

  /* ── J3: el estado de los dos marcadores y lo que se imprime ── */
  ident() {
    var mk = function(k){ var b = document.getElementById('pac-id-mk-' + k);
      if (!b) return 'NO EXISTE';
      var cs = getComputedStyle(b), r = b.getBoundingClientRect();
      return { pressed: b.getAttribute('aria-pressed'), color: cs.color,
               glifo: getComputedStyle(b, '::before').content,
               minH: cs.minHeight, w: Math.round(r.width), h: Math.round(r.height),
               aria: b.getAttribute('aria-label') || '', onclick: b.getAttribute('onclick') } };
    var imp = null;
    try { imp = (typeof pacIdImpreso === 'function') ? pacIdImpreso(null, 'Cedula') : 'SIN FN' }
    catch (e) { imp = 'EXC' }
    return { oculto: window.__P.val('pac_id_print'),
             elegido: (typeof pacIdElegido === 'function') ? pacIdElegido() : 'SIN FN',
             ci: mk('ci'), matricula: mk('matricula'), impreso: imp,
             /* El ALTO de la fila del campo: la orden pide que el marcador NO desplace ni
                achique el campo, y eso se mide en el .fg, no en el boton. */
             fgCi: (function(){ var e = document.getElementById('ci');
               var f = e ? e.closest('.fg') : null; if (!f) return 'NO EXISTE';
               var r = f.getBoundingClientRect(), i = e.getBoundingClientRect();
               return { fgH: Math.round(r.height), inpH: Math.round(i.height),
                        inpW: Math.round(i.width) } })() } },

  /* Que hay en un punto: para afirmar que el area tactil del marcador llega donde se dice.
     ⚠️ elementFromPoint devuelve null FUERA del viewport y el aviso legal lo envenena: las dos
     trampas ya estan escritas en CLAUDE.md, asi que se despeja antes y se informa el rect. */
  toque(k, dx, dy) {
    var b = document.getElementById('pac-id-mk-' + k);
    if (!b) return 'NO EXISTE';
    /* EL ORDEN DE ESTAS TRES LINEAS ES EL ARREGLO, y lo pago esta tanda dos veces:
       1. DESPEJAR PRIMERO. El aviso legal y el overlay de login vuelven a mitad de corrida y
          envenenan elementFromPoint; y al esconderlos la pagina puede recuperar el scroll, asi
          que un rect leido ANTES queda viejo y el punto cae en un hueco: a 390 px la sonda
          informo tab-datos y dos encabezados de acordeon sobre un boton perfectamente
          alcanzable. Es la trampa que TC-451 y el marco del panel de Evidencia ya pagaron.
       2. CENTRAR DESPUES. A 390 px la barra flotante de acciones del pie cubre la franja baja,
          asi que el boton tiene geometria y su punto cae DEBAJO de ella. block:center lo lleva
          al medio, que es donde el medico lo tiene cuando lo va a tocar.
       3. Y RECIEN AHI LEER EL RECT. */
    var r = b.getBoundingClientRect();
    var x = Math.round(r.left + r.width / 2 + (dx || 0)), y = Math.round(r.top + r.height / 2 + (dy || 0));
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return { fuera:true, x:x, y:y };
    var e = document.elementFromPoint(x, y);
    var cad = [];
    for (var n = e; n && n !== document.body && cad.length < 5; n = n.parentElement)
      cad.push(n.tagName + (n.id ? '#' + n.id : '') + (n.className ? '.' + String(n.className).split(' ')[0] : ''));
    var cs = getComputedStyle(b);
    return { x:x, y:y, id: e ? (e.id || e.tagName) : 'NADA', esBlanco: e === b,
             esDelBoton: !!(e && (e === b || (b.contains && b.contains(e)))), cadena: cad.join(' < '),
             rect: { l:Math.round(r.left), t:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height) },
             css: { pe:cs.pointerEvents, vis:cs.visibility, disp:cs.display, ov:getComputedStyle(b.parentElement).overflow } } },

  /* Despeja y centra, y NADA MAS. Va separado de toque() porque el hit-test no se asienta en
     el mismo turno que el scroll: medido a 390 px, el rect del boton decia (115,224) y
     elementFromPoint en su centro devolvia el contenedor de la pestania. Con una pausa entre
     los dos pasos, los tres puntos dan el boton. */
  toquePreparar(k) {
    window.__P.despejar();
    var b = document.getElementById('pac-id-mk-' + k);
    if (!b) return 'NO EXISTE';
    /* ⚠️ Y LA TARJETA DEL PACIENTE SE ABRE PRIMERO. A 390 px es un ACORDEON (#sacc-pac) y nace
       COLAPSADO, y el colapso recorta en vez de esconder: los hijos CONSERVAN su rect y NO son
       alcanzables por el hit-test. Medido: con el acordeon cerrado, el rect del marcador decia
       (88,224) y elementFromPoint en ese punto devolvia los encabezados de acordeon que si
       estan ahi; y el INPUT del campo tampoco era alcanzable, que es la prueba de que no era
       el marcador. La sonda informo cuatro veces un defecto que no existe.
       abrirPara() abre la pestania y la tarjeta, que es el gesto del medico. */
    var ab = window.__P.abrirPara(k === 'ci' ? 'ci' : 'matricula');
    /* ⚠️ abrirPara() busca acordeones con display:none, y este COLAPSA CON overflow:hidden
       —medido: #sacc-pac queda en display:block, max-height:none y 46 px de alto, o sea solo su
       encabezado—. Asi que se clickea su encabezado, que es el gesto del medico. La condicion
       decisiva fue el INPUT del campo: con la tarjeta colapsada tampoco era alcanzable, y ese
       campo existia antes de esta tanda. */
    var tj = document.getElementById('sacc-pac');
    if (tj && tj.getBoundingClientRect().height < 120) {
      var hd = tj.querySelector('.sacc-hdr');
      if (hd) { try { hd.click() } catch (x) {} }
    }
    if (b.scrollIntoView) b.scrollIntoView({ block:'center', inline:'nearest' });
    return { abrio: ab } },

  /* Barrido alrededor del boton: donde esta de verdad para el hit-test, y cuanto scroll tienen
     sus ancestros. Es lo que separa un rect viejo de un elemento tapado. */
  toqueBarrido(k) {
    var b = document.getElementById('pac-id-mk-' + k);
    if (!b) return 'NO EXISTE';
    var r = b.getBoundingClientRect();
    var pts = [], cx = r.left + r.width/2, cy = r.top + r.height/2;
    [[0,0],[-3,0],[3,0],[0,-4],[0,4],[-10,0],[10,0],[0,-20],[0,20]].forEach(function(d){
      var x = Math.round(cx + d[0]), y = Math.round(cy + d[1]);
      var e = document.elementFromPoint(x, y);
      pts.push(d[0] + ',' + d[1] + ' -> ' + (e ? (e.id || e.tagName + '.' + String(e.className||'').split(' ')[0]) : 'NADA')) });
    var sc = [];
    for (var n = b; n && n !== document.documentElement; n = n.parentElement)
      if (n.scrollTop || n.scrollLeft) sc.push((n.id || n.tagName) + ' st=' + n.scrollTop);
    return { rect:{ l:Math.round(r.left), t:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height) },
             winScroll: window.scrollY, docScroll: document.documentElement.scrollTop,
             ancestrosConScroll: sc, pts: pts,
             /* Y donde cree el navegador que esta el LABEL y el INPUT de al lado. */
             lbl: (function(){ var l = b.parentElement, q = l.getBoundingClientRect();
               return { t:Math.round(q.top), l:Math.round(q.left), w:Math.round(q.width), h:Math.round(q.height) } })(),
             /* ⚠️ Y EL HIT-TEST DEL PROPIO CAMPO DE TEXTO, que es la condicion decisiva: si el
                INPUT tampoco es alcanzable en este estado, lo que no se puede tocar es la
                TARJETA y no el marcador. */
             inp: (function(){ var i = document.getElementById(k === 'ci' ? 'ci' : 'matricula');
               if (!i) return 'NO'; var q = i.getBoundingClientRect();
               var e = document.elementFromPoint(Math.round(q.left + q.width/2), Math.round(q.top + q.height/2));
               return { t:Math.round(q.top), l:Math.round(q.left), w:Math.round(q.width),
                        enElPunto: e ? (e.id || e.tagName) : 'NADA', alcanzable: e === i } })(),
             /* Y el estado de la tarjeta del paciente. */
             tarjeta: (function(){ var c = document.getElementById('sacc-pac');
               if (!c) return 'NO EXISTE sacc-pac';
               var cs = getComputedStyle(c), q = c.getBoundingClientRect();
               return { disp:cs.display, mh:cs.maxHeight, ov:cs.overflow,
                        h:Math.round(q.height) } })() } },

  tema(claro) {
    var r = document.documentElement;
    if (claro) r.classList.add('light-mode'); else r.classList.remove('light-mode');
    return r.classList.contains('light-mode') },

  /* localStorage e IndexedDB: la orden exige que la eleccion NO se persista. */
  storage() {
    var ks = [];
    try { for (var i = 0; i < localStorage.length; i++) ks.push(localStorage.key(i)) } catch (e) { ks = ['EXC'] }
    var ss = [];
    try { for (var j = 0; j < sessionStorage.length; j++) ss.push(sessionStorage.key(j)) } catch (e) { ss = ['EXC'] }
    return { local: ks.filter(function(k){ return /pac|ident|matric/i.test(k) }),
             nLocal: ks.length,
             session: ss.filter(function(k){ return /pac|ident|matric/i.test(k) }),
             nSession: ss.length } },

  /* Lo que el recolector de guardarInforme pondria en campos para estas tres claves. */
  camposIdent() { var c = window.__P.camposCrudos();
    return { pac_id_print: c['pac_id_print'], ci: c['ci'], matricula: c['matricula'],
             doc_tipo: c['doc_tipo'] } },

  /* La identificacion del PPT, por su dueno y con los datos de un estudio ARCHIVADO. */
  pptIdent(inf) { try {
    if (typeof pacIdImpreso !== 'function') return 'SIN FN';
    var c = (inf && inf.campos) || {};
    var r = pacIdImpreso({ ci: inf.ci, doc_tipo: inf.doc_tipo,
                           matricula: c['matricula'], pac_id_print: c['pac_id_print'] }, 'CI');
    return r ? { lbl:r.lbl, val:r.val, clave:r.clave } : null } catch (e) { return 'EXC' } },
  infoPorDoc(ci) { try {
    var l = (typeof getInformes === 'function') ? getInformes() : [];
    for (var i = l.length - 1; i >= 0; i--) {
      var c = l[i].campos || {};
      if (String(c.ci || '') === String(ci)) return { id:l[i].id, estudioId:l[i].estudioId, ci:l[i].ci, doc_tipo:l[i].doc_tipo,
        campos:{ matricula: c['matricula'], pac_id_print: c['pac_id_print'] } } }
    return null } catch (e) { return 'EXC' } },

  /* Convierte un estudio guardado en uno ANTERIOR a esta tanda: le quita la clave. Es la
     unica forma de medir el default con la clave ausente por el camino real de reapertura. */
  viejaSinMarca(ci) { try {
    if (typeof getInformes !== 'function' || typeof guardarInformesSeguro !== 'function')
      return { err:'SIN API de informes' };
    var l = getInformes(), tocados = 0;
    l.forEach(function(i){ var c = i.campos || {};
      if (String(c.ci || '') === String(ci) && c.pac_id_print !== undefined) {
        delete c.pac_id_print; tocados++ } });
    guardarInformesSeguro(l);
    return { tocados: tocados } } catch (e) { return { err:String(e && e.message) } } },

  /* ── J4: la geometria del informe, del EN SUMA y de la columna de frases ── */
  frasesGeo() {
    var R = function(sel){ var e = sel.charAt(0) === '#' ? document.getElementById(sel.slice(1))
                                                         : document.querySelector(sel);
      if (!e) return 'NO EXISTE ' + sel;
      var r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      return { x:Math.round(r.left), y:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height),
               top:Math.round(r.top), bottom:Math.round(r.bottom),
               pos:cs.position, disp:cs.display, ov:cs.overflowY,
               sh:e.scrollHeight, ch:e.clientHeight } };
    var cardInf = null, cardSuma = null;
    var ta = document.getElementById('informe_texto');
    if (ta && ta.closest) cardInf = ta.closest('.card');
    var su = document.getElementById('en_suma');
    if (su && su.closest) cardSuma = su.closest('.card');
    var rc = function(e){ if (!e) return 'NO EXISTE';
      var r = e.getBoundingClientRect();
      return { x:Math.round(r.left), w:Math.round(r.width),
               top:Math.round(r.top), bottom:Math.round(r.bottom) } };
    return { informe: R('#informe_texto'), suma: R('#en_suma'),
             panel: R('#frases-panel'), slot: R('#frases-slot'), cols: R('#inf-cols'),
             izq: R('#inf-cols-izq'), wrap: R('#inf-wrap'),
             cardInf: rc(cardInf), cardSuma: rc(cardSuma),
             btn: (function(){ var b = document.getElementById('frases-btn');
               return b ? { exp:b.getAttribute('aria-expanded'), ctrl:b.getAttribute('aria-controls') } : 'NO EXISTE' })(),
             aside: (function(){ var a = document.getElementById('frases-panel');
               return a ? { rol:a.tagName, nombre:a.getAttribute('aria-label') } : 'NO EXISTE' })(),
             pagina: { sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight },
             nodos: document.getElementsByTagName('*').length } },

  /* Siembra N frases en el almacen que el panel ya usa, para medir que la ALTURA de la columna
     no dependa del contenido. Se repinta por la funcion del propio panel. */
  frasesSembrar(n) { try {
    var a = [];
    for (var i = 0; i < n; i++) a.push('Frase de prueba numero ' + (i + 1) + ' con texto suficiente para ocupar dos renglones del panel.');
    localStorage.setItem('ecosmart_frases', JSON.stringify(a));
    if (typeof frasesRender === 'function') frasesRender();
    return { n: a.length, enLista: (document.getElementById('frases-lista') || {}).childElementCount } }
    catch (e) { return { err:String(e && e.message) } } },
  frasesBorrarTodas() { try { localStorage.removeItem('ecosmart_frases');
    if (typeof frasesRender === 'function') frasesRender(); return 1 } catch (e) { return 'EXC' } },

  /* Inserta la PRIMERA frase de la lista en el textarea pedido, con el cursor en pos, y
     devuelve lo que quedo. Mide las dos cosas que la orden congela: que el texto no se pierda
     y que el cursor siga donde estaba. */
  frasesInsertar(taId, pos, previo) {
    var ta = document.getElementById(taId);
    if (!ta) return { err:'NO EXISTE ' + taId };
    ta.value = previo;
    ta.focus();
    ta.setSelectionRange(pos, pos);
    ta.dispatchEvent(new Event('select', { bubbles:true }));
    var b = document.querySelector('.frases-lista .frase-txt');
    if (!b) return { err:'NO HAY FRASE EN LA LISTA' };
    b.click();
    return { valor: ta.value, sel: ta.selectionStart, foco: document.activeElement ? document.activeElement.id : null,
             conservaPrevio: ta.value.indexOf(previo.slice(0, 12)) > -1 } },

  listo() {
    var faltan = ['generarPDFReal','limpiarCampos','showTab','getBSA','generarInforme','calcAI']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (typeof window.jspdf === 'undefined') faltan.push('jspdf');
    return faltan.length ? { listo:false, faltan:faltan } : { listo:true } }
};
'OK';
`;

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

/* ⚠️ LA SUPERFICIE CORPORAL SE FIJA EN 2,00 EXACTA y no en un par de valores «clinicos»: con
   Mosteller, sqrt(80 * 180 / 3600) = 2 exacto, asi que el volumen indexado es el volumen
   dividido por dos y los seis bordes se alcanzan con enteros. Con una BSA de 1,81 ningun borde
   cae redondo y un corte que no se puede alcanzar no se puede probar. */
const BSA2 = { peso: '80', talla: '180' };

/* Las escenas de la auricula izquierda, una por cada combinacion que la orden enumera. */
const ESC_AI = [
  { n: '01 sin ningun dato de AI',            c: {} },
  { n: '02 volumen normal solo',              c: { ai_vol: '68' } },
  { n: '03 volumen normal + DAP dilatado',    c: { ai_vol: '68', ai_diam: '50' } },
  { n: '04 volumen normal + area dilatada',   c: { ai_vol: '68', ai_area: '25' } },
  { n: '05 volumen normal + los dos dilatados', c: { ai_vol: '68', ai_diam: '50', ai_area: '25' } },
  { n: '06 volumen leve',                     c: { ai_vol: '70' } },
  { n: '07 volumen moderado',                 c: { ai_vol: '84' } },
  { n: '08 volumen severo',                   c: { ai_vol: '98' } },
  { n: '09 volumen severo + area NORMAL',     c: { ai_vol: '98', ai_area: '15' } },
  { n: '10 sin volumen, DAP dilatado',        c: { ai_diam: '50' } },
  { n: '11 sin volumen, area dilatada',       c: { ai_area: '25' } },
  { n: '12 sin volumen, DAP normal',          c: { ai_diam: '38' } },
  { n: '13 sin volumen, los dos (DAP dil, area normal)', c: { ai_diam: '50', ai_area: '15' } },
  /* SIN superficie corporal: el volumen esta medido y NO se puede indexar. La orden manda
     tratarlo como «sin volumen», que es la opcion conservadora. */
  { n: '14 volumen SIN superficie corporal',  c: { ai_vol: '68' }, sinBsa: true },
  { n: '15 volumen SIN BSA + DAP dilatado',   c: { ai_vol: '68', ai_diam: '50' }, sinBsa: true },
  { n: '16 volumen SIN BSA y nada mas',       c: { ai_vol: '98' }, sinBsa: true },
];

/* Los seis bordes del volumen indexado, con BSA 2,00: 34,0 / 34,1 / 41,0 / 41,1 / 48,0 / 48,1. */
const BORDES = ['68', '68.2', '82', '82.2', '96', '96.2'];

/* Las SEIS plantillas del PDF. La orden habla de tres; son seis, y las tres formas de maquetar
   el bloque del paciente estan repartidas entre ellas: _hdrCajaPaciente (clasico, moderno,
   elegante y dos mas), la tira corrida (minimalista y compacto) y la tabla (academico). */
const PLANTILLAS = ['clasico', 'moderno', 'minimalista', 'academico', 'compacto', 'elegante'];

async function main() {
  const antes = await md5(EXTERNO ? FARG : join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page' && x.url.includes('127.0.0.1'));
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

  async function ev(expr, ms) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId),
      pausa(ms || 30000).then(() => ({ __reloj: true })),
    ]);
    if (r.__reloj) throw new Error('ev() no resolvio: ' + expr.slice(0, 90));
    if (r.exceptionDetails) throw new Error('EXC: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' | ' + expr.slice(0, 90));
    return r.result.value;
  }
  const J = async (e) => JSON.parse(await ev(e));

  const VK = { Backspace: 8, Tab: 9, Enter: 13, Escape: 27 };
  async function tecla(k) {
    const code = VK[k];
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k,
      windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k,
      windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }, sessionId);
  }
  /* ⚠️ UN TECLEO QUE NO QUEDA NO ES UNA MEDICION: se ABORTA nombrando el campo. */
  async function foco(id) {
    let g = await J(`JSON.stringify(window.__P.geo(${JSON.stringify(id)}))`);
    if (!g || g.err || !g.ok) {
      const a = await J(`JSON.stringify(window.__P.abrirPara(${JSON.stringify(id)}))`);
      if (!a || !a.ok) throw new Error('SIN GEOMETRIA ' + id + ' ' + JSON.stringify(a));
    }
    const ro = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      return !!(e.readOnly || e.disabled) })()`);
    if (ro) throw new Error('CAMPO DE SOLO LECTURA, no se le manda una tecla: ' + id);
    /* ⚠️ UN input[type=date] NO SOPORTA setSelectionRange y tira InvalidStateError, que mata
       la escena entera: se protege con try y se deja el foco puesto igual. */
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)}); e.focus();
      try { if (e.setSelectionRange) e.setSelectionRange(0, (e.value||'').length) } catch (x) {}
      return 1 })()`);
    const f = await ev('document.activeElement ? document.activeElement.id : null');
    if (f !== id) throw new Error('EL FOCO NO LLEGO a ' + id + ', esta en ' + f);
  }
  async function tipear(id, texto) {
    /* ⚠️ LA FECHA NO SE PUEDE TECLEAR: es un input[type=date], el navegador no acepta
       insercion de texto plano y el campo queda vacio. Se fija por valor Y SE DECLARA, que es
       el unico campo de estas escenas donde el gesto no es una tecla real. */
    const esFecha = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      return e ? e.type : 'NO EXISTE' })()`);
    if (esFecha === 'date') {
      await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
        e.value = ${JSON.stringify(String(texto))};
        e.dispatchEvent(new Event('input', { bubbles: true }));
        e.dispatchEvent(new Event('change', { bubbles: true })); return 1 })()`);
      const q = await ev(`window.__P.val(${JSON.stringify(id)})`);
      if (String(q) !== String(texto)) throw new Error('LA FECHA NO QUEDO en ' + id + ': ' + q);
      return;
    }
    await foco(id);
    for (let i = 0; i < 24; i++) await tecla('Backspace');
    if (String(texto).length) await cdp.send('Input.insertText', { text: String(texto) }, sessionId);
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      e.dispatchEvent(new Event('input', { bubbles: true })); return 1 })()`);
    const leido = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(leido) !== String(texto)) throw new Error('EL TECLEO NO QUEDO en ' + id + ': ' + leido);
  }

  for (let i = 0; i < 120; i++) {
    try { await ev(SONDA); const l = await J('JSON.stringify(window.__P.listo())');
      if (l.listo) break } catch (e) {}
    await pausa(500);
  }
  const listo = await J('JSON.stringify(window.__P.listo())');
  if (!listo.listo) { console.log(JSON.stringify({ error: 'NO CARGO', listo }, null, 1)); process.exit(1); }

  const abortos = [];
  /* Deja el formulario en la escena pedida, con TECLAS REALES. Los `<select>` van ANTES. */
  async function montar(campos, opts) {
    opts = opts || {};
    await ev('window.__P.limpiar()');
    await ev('JSON.stringify(window.__P.despejar())');
    if (!opts.sinBsa) { await tipear('peso', BSA2.peso); await tipear('talla', BSA2.talla); }
    if (opts.sexo !== undefined) {
      const r = await J(`JSON.stringify(window.__P.sel('sexo', ${JSON.stringify(opts.sexo)}))`);
      if (r.err) throw new Error('sexo: ' + r.err);
    }
    if (opts.vci) {
      const r = await J(`JSON.stringify(window.__P.sel('vci_col', ${JSON.stringify(opts.vci)}))`);
      if (r.err) throw new Error('vci_col: ' + r.err);
      await tipear('vci_diam', opts.vciDiam || '18');
    }
    await ev('window.__P.abrirValvulas()');
    for (const [id, val] of Object.entries(campos || {})) await tipear(id, val);
    if (opts.extra) for (const [id, val] of Object.entries(opts.extra)) await tipear(id, val);
    await ev('(function(){ try { calcAI() } catch(e) {} return 1 })()');
  }

  const out = { arbol: FARG, md5_antes: antes, listo, grupos: {}, abortos };

  /* ⚠️ CLIC REAL Y NO .click(): el gesto del medico es un clic del raton. Se centra el nodo
     —`block:center`, porque scrollIntoViewIfNeeded lo deja pegado al borde y su centro cae
     FUERA del viewport, que es la trampa que el Y3b ya pago—, se comprueba con
     elementFromPoint que el blanco ES el boton, y se despacha por CDP. */
  async function clicReal(id) {
    /* ⚠️ SIEMPRE SE PREPARA PRIMERO: despejar, abrir la pestania y la TARJETA del paciente, y
       centrar. Sin esto, cualquier clic que venga despues de limpiar() o de un cambio de
       pestania mide un rect de 0x0 y la escena ABORTA —pasa en el grupo del guardado, donde
       limpiar() deja la tarjeta colapsada—. El acordeon colapsa con overflow:hidden, asi que
       el nodo tiene rect y NO es alcanzable: ver toquePreparar. */
    const k = String(id).replace('pac-id-mk-', '');
    await ev(`JSON.stringify(window.__P.toquePreparar(${JSON.stringify(k)}))`);
    await pausa(260);
    const r = await J(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      if (!e) return JSON.stringify({ err:'NO EXISTE ' + ${JSON.stringify(id)} });
      var b = e.getBoundingClientRect();
      var x = Math.round(b.left + b.width/2), y = Math.round(b.top + b.height/2);
      var t = document.elementFromPoint(x, y);
      return JSON.stringify({ x:x, y:y, w:Math.round(b.width), h:Math.round(b.height),
        blanco: t ? (t.id || t.tagName) : 'NADA', esBlanco: t === e }) })()`);
    if (r.err) throw new Error(r.err);
    if (!r.esBlanco) throw new Error('EL CLIC NO LLEGA A ' + id + ': ' + JSON.stringify(r));
    for (const type of ['mousePressed', 'mouseReleased']) {
      await cdp.send('Input.dispatchMouseEvent', { type, x: r.x, y: r.y, button: 'left',
        clickCount: 1 }, sessionId);
    }
    return r;
  }
  async function viewport(w, h) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: h, deviceScaleFactor: 1, mobile: false }, sessionId);
    await pausa(160);
  }

  /* ── ai: las 16 escenas, con las tres del volumen sin superficie corporal ── */
  if (corre('ai')) {
    const g = {};
    for (const E of ESC_AI) {
      try {
        await montar(E.c, { sinBsa: E.sinBsa, sexo: 'M' });
        g[E.n] = {
          pantalla: await J('JSON.stringify(window.__P.ai())'),
          conciso:  await J("JSON.stringify(window.__P.lineaAI('conciso'))"),
          estandar: await J("JSON.stringify(window.__P.lineaAI('estandar'))"),
          narrativo: await J("JSON.stringify(window.__P.lineaAI('narrativo'))"),
          /* El grado que el Laboratorio deriva del TEXTO, para afirmar que la frase nueva no
             entra en ninguna categoria: la fila «Dilatacion AI» es un regex sobre el informe. */
          labAI: await ev(`(function(){ var t = window.__P.val('informe_texto') + ' ' + window.__P.val('en_suma');
            return JSON.stringify({ dilat: /dilataci[oó]n.{0,10}auricular|AI\\s+(?:dilata|agrand)/i.test(t),
                                    normal: t.indexOf('de dimensiones normales') > -1 }) })()`),
        };
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push(E.n + ': ' + e.message); }
    }
    /* La fila del PDF en la escena que esta tanda cambia, y en la de control. */
    for (const E of [{ n: 'PDF volumen SIN bsa', c: { ai_vol: '98' }, sinBsa: true },
                     { n: 'PDF volumen indexable', c: { ai_vol: '98' }, sinBsa: false }]) {
      try {
        await montar(E.c, { sinBsa: E.sinBsa, sexo: 'M',
          extra: { nombre: 'AI J', ci: '9100001', edad: '60' } });
        const r = await J('JSON.stringify(window.__P.pdf("clasico", false))');
        g[E.n] = { err: r.err, nTextos: r.nTextos,
                   fila: await J(`JSON.stringify(window.__P.filaAI(${JSON.stringify(r.textos)}))`) };
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push(E.n + ': ' + e.message); }
    }
    out.grupos.ai = g;
  }

  /* ── ppt: las cuatro ramas de la UNA linea, y el fuente ── */
  if (corre('ppt')) {
    const g = { fuente: await J('JSON.stringify(window.__P.pptFuente())') };
    const ESC = [
      { n: 'a indexado',            c: { ai_vol: '98' } },
      { n: 'b area (sin volumen)',  c: { ai_area: '25' } },
      { n: 'c diametro (sin volumen ni area)', c: { ai_diam: '44' } },
      { n: 'd volumen sin indexar', c: { ai_vol: '98' }, sinBsa: true },
      { n: 'e sin ningun dato',     c: {} },
      { n: 'f area y diametro — manda el area', c: { ai_area: '25', ai_diam: '44' } },
      { n: 'g volumen indexable + area — manda el indexado', c: { ai_vol: '98', ai_area: '25' } },
      { n: 'h area FUERA de banda — cae al diametro', c: { ai_area: '250', ai_diam: '44' } },
    ];
    for (const E of ESC) {
      try {
        await montar(E.c, { sinBsa: E.sinBsa, sexo: 'M' });
        g[E.n] = await J('JSON.stringify(window.__P.aiUno())');
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push('ppt ' + E.n + ': ' + e.message); }
    }
    out.grupos.ppt = g;
  }

  /* ── ident: los marcadores, la memoria, el guardado, el PDF y el PPT ── */
  /* ⚠️ CINCO SUBGRUPOS Y NO UNO, y es por una leccion de esta misma tanda: con todo junto la
     corrida paso de los 65 minutos SIN UNA SOLA SALIDA PARCIAL, asi que no habia forma de
     saber si avanzaba o estaba colgada. `--solo ident` sigue corriendo los cinco. */
  const identG = corre('ident') || corre('identg');
  const identM = corre('ident') || corre('identm');
  const identU = corre('ident') || corre('identu');
  const identP = corre('ident') || corre('identp');
  const identR = corre('ident') || corre('identr');
  if (identG || identM || identU || identP || identR) {
    const g = {};
    const ID0 = { nombre: 'IDENT J', ci: '4455667', matricula: 'M-909090', edad: '60' };
    if (identG) try {
      await montar({}, { sexo: 'M', extra: ID0 });
      g['01 por defecto'] = await J('JSON.stringify(window.__P.ident())');
      g['01b storage'] = await J('JSON.stringify(window.__P.storage())');
      const c1 = await clicReal('pac-id-mk-matricula');
      g['02 clic en matricula'] = { clic: c1, estado: await J('JSON.stringify(window.__P.ident())') };
      const c2 = await clicReal('pac-id-mk-ci');
      g['03 clic en documento vuelve'] = { clic: c2, estado: await J('JSON.stringify(window.__P.ident())') };
      /* CONTROL NEGATIVO: un segundo clic en el que YA esta elegido no lo apaga. */
      await clicReal('pac-id-mk-ci');
      g['04 segundo clic en el elegido no apaga'] = await J('JSON.stringify(window.__P.ident())');
      /* La memoria de sesion: se elige matricula y se hace «Nuevo estudio». */
      await clicReal('pac-id-mk-matricula');
      await ev('window.__P.limpiar()');
      g['05 Nuevo estudio CONSERVA la eleccion'] = await J('JSON.stringify(window.__P.ident())');
      g['05b storage tras elegir'] = await J('JSON.stringify(window.__P.storage())');
      /* El dato elegido vacio imprime el otro, y los dos vacios no imprimen nada. */
      await montar({}, { sexo: 'M', extra: { nombre: 'X', ci: '', matricula: 'M-1' } });
      await clicReal('pac-id-mk-ci');
      g['06 documento elegido y VACIO imprime la matricula'] = await J('JSON.stringify(window.__P.ident())');
      await montar({}, { sexo: 'M', extra: { nombre: 'X', ci: '1234', matricula: '' } });
      await clicReal('pac-id-mk-matricula');
      g['07 matricula elegida y VACIA imprime el documento'] = await J('JSON.stringify(window.__P.ident())');
      await montar({}, { sexo: 'M', extra: { nombre: 'X', ci: '', matricula: '' } });
      g['08 los dos vacios no imprime nada'] = await J('JSON.stringify(window.__P.ident())');
    } catch (e) { g['ABORTO gestos'] = e.message; abortos.push('ident gestos: ' + e.message); }

    /* El area tactil y el color en los dos temas, a tres anchos. */
    if (identM) try {
      for (const [w, h] of [[1200, 700], [768, 1024], [390, 844]]) {
        await viewport(w, h);
        for (const claro of [false, true]) {
          await ev(`window.__P.tema(${claro})`);
          const k = `09 maqueta ${w}x${h} ${claro ? 'claro' : 'oscuro'}`;
          await ev("window.__P.toquePreparar('ci')");
          await pausa(260);
          g[k] = { estado: await J('JSON.stringify(window.__P.ident())'),
                   toqueCentro: await J("JSON.stringify(window.__P.toque('ci',0,0))"),
                   toqueArriba: await J("JSON.stringify(window.__P.toque('ci',0,-14))"),
                   toqueAbajo:  await J("JSON.stringify(window.__P.toque('ci',0,14))") };
        }
      }
      /* ⚠️ Y LA PRUEBA QUE IMPORTA A 390 px: un CLIC REAL por coordenadas, sin exigirle nada al
         hit-test. A ese ancho elementFromPoint devuelve el contenedor de la pestania sobre un
         boton cuyo rect dice estar ahi —medido cuatro veces, con el despeje, con el centrado y
         con una pausa de 260 ms entre el scroll y la lectura—. Si el clic real cambia el
         estado, lo que falla es la sonda y no el boton. */
      await viewport(390, 844);
      await ev("window.__P.toquePreparar('matricula')");
      await pausa(300);
      const r390 = await J(`(function(){ var b = document.getElementById('pac-id-mk-matricula');
        var q = b.getBoundingClientRect();
        return JSON.stringify({ x:Math.round(q.left + q.width/2), y:Math.round(q.top + q.height/2) }) })()`);
      const antes390 = await J('JSON.stringify(window.__P.ident())');
      for (const type of ['mousePressed', 'mouseReleased']) {
        await cdp.send('Input.dispatchMouseEvent', { type, x: r390.x, y: r390.y, button: 'left', clickCount: 1 }, sessionId);
      }
      await pausa(160);
      const desp390 = await J('JSON.stringify(window.__P.ident())');
      g['09z CLIC REAL a 390 px'] = { punto: r390, antes: antes390.elegido, despues: desp390.elegido,
        cambio: antes390.elegido !== desp390.elegido };
      g['09y BARRIDO a 390 px'] = await J("JSON.stringify(window.__P.toqueBarrido('matricula'))");
      await ev('window.__P.tema(false)');
      await viewport(1400, 1000);
    } catch (e) { g['ABORTO maqueta'] = e.message; abortos.push('ident maqueta: ' + e.message); }

    /* Guardar con la matricula elegida, reabrir, y el PDF reimpreso. */
    if (identU) try {
      await montar({ ai_vol: '98' }, { sexo: 'M',
        extra: { nombre: 'GUARD J', ci: '4455668', matricula: 'M-777', edad: '58', fecha: '2026-10-16' } });
      await clicReal('pac-id-mk-matricula');
      g['10 antes de guardar'] = await J('JSON.stringify(window.__P.camposIdent())');
      await ev("(function(){ try { setEstiloInforme('estandar'); generarInforme() } catch(e) {} return 1 })()");
      const gu = await J('JSON.stringify(window.__P.guardarEstudio())');
      await pausa(900);
      const inf = await J(`JSON.stringify(window.__P.infoPorDoc('4455668'))`);
      g['11 guardado'] = { gu, inf };
      /* La sesion queda en matricula; se la pone en DOCUMENTO para probar que reabrir usa la
         del ESTUDIO y no la de la sesion. */
      await ev('window.__P.limpiar()');
      await clicReal('pac-id-mk-ci');
      g['12 sesion en documento antes de reabrir'] = await J('JSON.stringify(window.__P.ident())');
      /* ⚠️ DOS RUTAS DE REAPERTURA Y SE MIDEN LAS DOS, con su DENOMINADOR: sin preguntar si el
         estudio se cargo de verdad, un marcador que no cambia se lee igual que una restauracion
         que no ocurrio. */
      /* ⚠️ editarInforme ABRE UN MODAL DE CONFIRMACION («✓ Cargar datos») y no carga nada hasta
         que se lo clickea. Sin esto el estudio NO se cargaba y la sonda informo «al reabrir, la
         eleccion no se repone» con los campos del paciente VACIOS: el denominador lo delato.
         Y el overlay quedaba puesto, asi que el clic siguiente daba DIV y abortaba la escena. */
      const rEd = await ev(`(function(){ try { editarInforme(${inf ? inf.id : 0}) } catch(e) { return 'EXC ' + e.message } return 1 })()`);
      await pausa(300);
      const okEd = await ev(`(function(){ var b = document.getElementById('edit-ok');
        if (!b) return 'SIN MODAL'; b.click(); return 'confirmado' })()`);
      await pausa(900);
      g['13 reabierto por editarInforme usa la del ESTUDIO'] = {
        r: rEd, modal: okEd, estado: await J('JSON.stringify(window.__P.ident())'),
        campos: await J('JSON.stringify(window.__P.camposIdent())') };
      /* Y por cargarEstudioPorId, que es la ruta que usa el caso de la suite. */
      await ev('window.__P.limpiar()');
      await clicReal('pac-id-mk-ci');
      const inf3 = await J(`JSON.stringify(window.__P.infoPorDoc('4455668'))`);
      const rCg = await ev(`(function(){ try { cargarEstudioPorId(${JSON.stringify((inf3 && inf3.estudioId) || '')}) } catch(e) { return 'EXC ' + e.message } return 1 })()`);
      await pausa(900);
      g['13b reabierto por cargarEstudioPorId'] = { r: rCg,
        estado: await J('JSON.stringify(window.__P.ident())'),
        campos: await J('JSON.stringify(window.__P.camposIdent())') };
      /* Y la de la SESION no cambio: «Nuevo estudio» vuelve a la del documento. */
      await ev('window.__P.limpiar()');
      g['14 Nuevo estudio tras reabrir usa la de la SESION'] = await J('JSON.stringify(window.__P.ident())');
      /* El PDF reimpreso de ese estudio. */
      const r = await J(`(async function(){ return JSON.stringify(await window.__P.reimprimir(${inf ? inf.id : 0})) })()`);
      g['15 PDF reimpreso con matricula'] = { nTextos: r.nTextos,
        celdas: await J(`JSON.stringify(window.__P.celdas(${JSON.stringify(r.textos || [])}))`),
        matr: (r.textos || []).filter(t => /M-777|Matr/.test(t)) };
      /* ⚠️ SE ESPERA ANTES DE MEDIR: la promesa de reimprimir() se resuelve en doc.save(), que
         ocurre DURANTE la generacion; la restauracion del formulario vive en el `finally` y
         corre DESPUES. Sin la pausa, la sonda informo «quedo la eleccion del OTRO estudio
         pegada» sobre una restauracion que todavia no habia corrido. */
      await pausa(1200);
      g['15b marcadores tras la reimpresion'] = { estado: await J('JSON.stringify(window.__P.ident())'),
        campos: await J('JSON.stringify(window.__P.camposIdent())') };
      /* El PPT, por su dueno y con los datos del estudio archivado. */
      g['16 PPT del estudio guardado'] = await J(`JSON.stringify(window.__P.pptIdent(${JSON.stringify(inf)}))`);
      /* Un estudio VIEJO: se le quita la clave y se lo reabre. */
      const vm = await J(`JSON.stringify(window.__P.viejaSinMarca('4455668'))`);
      const inf2 = await J(`JSON.stringify(window.__P.infoPorDoc('4455668'))`);
      await clicReal('pac-id-mk-matricula');
      /* Por cargarEstudioPorId, que no abre modal: con editarInforme y sin confirmar su
         «✓ Cargar datos» el estudio no se carga y queda la eleccion de la PANTALLA, que es el
         mismo falso que la escena 13 ya pago. */
      const rV = await ev(`(function(){ try { cargarEstudioPorId(${JSON.stringify((inf2 && inf2.estudioId) || '')}) } catch(e) { return 'EXC ' + e.message } return 1 })()`);
      await pausa(900);
      g['17 estudio VIEJO sin marca usa el documento'] = { vm, inf2, r: rV,
        estado: await J('JSON.stringify(window.__P.ident())'),
        campos: await J('JSON.stringify(window.__P.camposIdent())') };
      g['17b PPT de un estudio viejo'] = await J(`JSON.stringify(window.__P.pptIdent(${JSON.stringify(inf2)}))`);
    } catch (e) { g['ABORTO guardado'] = e.message; abortos.push('ident guardado: ' + e.message); }

    /* El PDF en las SEIS plantillas, con el documento y con la matricula. */
    if (identP) try {
      /* ⚠️ EL MONTAJE VA FUERA DEL BUCLE DE PLANTILLAS: la plantilla es un valor de
         localStorage que `pdf()` fija, y el formulario no cambia entre las seis. Montar doce
         veces costaba unos siete minutos de tecleo real sin medir nada distinto. */
      for (const cual of ['ci', 'matricula']) {
        await montar({}, { sexo: 'M',
          extra: { nombre: 'PDF J', ci: '4455669', matricula: 'M-555', edad: '60', fecha: '2026-10-16' } });
        await clicReal('pac-id-mk-' + cual);
        for (const pl of PLANTILLAS) {
          const k = `18 PDF ${cual} / ${pl}`;
          const r = await J(`JSON.stringify(window.__P.pdf(${JSON.stringify(pl)}, false))`);
          g[k] = { err: r.err, nTextos: r.nTextos,
                   ident: (r.textos || []).filter(t => /4455669|M-555|CI|Matr|C[eé]dula/.test(t)) };
          if (DEST && pl === 'clasico') await writeFile(join(DEST, 'pdf_ident_' + cual + '.b64'), r.b64 || '', 'utf8');
        }
      }
    } catch (e) { g['ABORTO pdf'] = e.message; abortos.push('ident pdf: ' + e.message); }

    /* Recargar la pagina vuelve al documento: la eleccion NO se persiste. */
    if (identR) try {
      await montar({}, { sexo: 'M', extra: { nombre: 'R', ci: '1', matricula: 'M-2' } });
      await clicReal('pac-id-mk-matricula');
      const antesRec = await J('JSON.stringify(window.__P.ident())');
      await cdp.send('Page.enable', {}, sessionId);
      await cdp.send('Page.reload', { ignoreCache: false }, sessionId);
      await pausa(2500);
      for (let i = 0; i < 60; i++) {
        try { await ev(SONDA); const l = await J('JSON.stringify(window.__P.listo())'); if (l.listo) break } catch (e) {}
        await pausa(400);
      }
      await ev('JSON.stringify(window.__P.despejar())');
      g['19 recargar vuelve al documento'] = { antes: antesRec,
        despues: await J('JSON.stringify(window.__P.ident())'),
        storage: await J('JSON.stringify(window.__P.storage())') };
    } catch (e) { g['ABORTO recarga'] = e.message; abortos.push('ident recarga: ' + e.message); }
    out.grupos.ident = g;
  }

  /* ── frases: la columna alta, a tres anchos, en los dos motores de tema ── */
  if (corre('frases')) {
    const g = {};
    const abrir  = async () => { await ev("(function(){ try { frasesToggle() } catch(e){} return 1 })()"); await pausa(140); };
    const cerrar = async () => { await ev("(function(){ try { frasesCerrar() } catch(e){} return 1 })()"); await pausa(140); };
    try {
      await ev('window.__P.limpiar()');
      await ev('JSON.stringify(window.__P.despejar())');
      await ev("(function(){ try { showTab('informe') } catch(e){} return 1 })()");
      await pausa(200);
      for (const [w, h] of [[1200, 700], [1440, 800], [1920, 1080], [768, 1024], [390, 844], [360, 800]]) {
        await viewport(w, h);
        await ev('window.__P.frasesBorrarTodas()');
        await cerrar();
        const cerrado = await J('JSON.stringify(window.__P.frasesGeo())');
        await ev('JSON.stringify(window.__P.frasesSembrar(3))');
        await abrir();
        const pocas = await J('JSON.stringify(window.__P.frasesGeo())');
        await ev('JSON.stringify(window.__P.frasesSembrar(40))');
        await pausa(160);
        const muchas = await J('JSON.stringify(window.__P.frasesGeo())');
        g[`${w}x${h}`] = { cerrado, pocas, muchas };
        await cerrar();
      }
      await viewport(1400, 1000);
      /* Los dos temas, con el color REAL del panel y del boton. */
      for (const claro of [false, true]) {
        await ev(`window.__P.tema(${claro})`);
        await ev('JSON.stringify(window.__P.frasesSembrar(6))');
        await abrir();
        g['tema ' + (claro ? 'claro' : 'oscuro')] = await J(`JSON.stringify((function(){
          var p = document.getElementById('frases-panel'), b = document.getElementById('frases-btn');
          var cp = p ? getComputedStyle(p) : null;
          return { bg: cp ? cp.backgroundColor : 'NO EXISTE', borde: cp ? cp.borderTopColor : '',
                   claro: document.documentElement.classList.contains('light-mode'),
                   btnBg: b ? getComputedStyle(b).backgroundColor : 'NO EXISTE' } })())`);
        await cerrar();
      }
      await ev('window.__P.tema(false)');
      /* El cursor y el texto escrito, en los DOS textarea. */
      await ev('JSON.stringify(window.__P.frasesSembrar(3))');
      await abrir();
      g['cursor informe'] = await J(`JSON.stringify(window.__P.frasesInsertar('informe_texto', 5, 'ABCDEFGHIJ texto del medico'))`);
      g['cursor en_suma'] = await J(`JSON.stringify(window.__P.frasesInsertar('en_suma', 3, 'ZYXWVU conclusion del medico'))`);
      /* 20 aperturas y cierres: nodos antes y despues, y el panel cerrado al final. */
      const n0 = await ev('document.getElementsByTagName("*").length');
      for (let i = 0; i < 20; i++) { await abrir(); await cerrar(); }
      const n1 = await ev('document.getElementsByTagName("*").length');
      g['20 ciclos'] = { nodos0: n0, nodos1: n1, iguales: n0 === n1,
        estado: await J('JSON.stringify(window.__P.frasesGeo())') };
      await ev('window.__P.frasesBorrarTodas()');
    } catch (e) { g['ABORTO'] = e.message; abortos.push('frases: ' + e.message); }
    out.grupos.frases = g;
  }

  /* ── controles ── */
  if (corre('controles')) {
    const g = {};
    const CTRL = [
      { n: 'vacio', c: {}, sexo: '' },
      { n: 'AI normal por volumen', c: { ai_vol: '68', ai_diam: '50' }, sexo: 'M' },
      { n: 'AI dilatada por volumen', c: { ai_vol: '98' }, sexo: 'F' },
      { n: 'escenario cargado', sexo: 'M',
        c: { ai_vol: '98', ai_diam: '44', ai_area: '25', onda_e: '90', onda_a: '60',
             e_sep: '6', e_lat: '8', vmax_it: '3.0', fevi: '55', ddfvi: '50', siv: '12',
             ppvi: '11', tapse: '18', im_vc: '7', vmax_ao: '4.2', gmedio_ao: '45' } },
    ];
    for (const E of CTRL) {
      try {
        await montar(E.c, { sexo: E.sexo, vci: '>50' });
        g[E.n] = {
          informe: await J("JSON.stringify(window.__P.informe('estandar'))"),
          conciso: await J("JSON.stringify(window.__P.informe('conciso'))"),
          narrativo: await J("JSON.stringify(window.__P.informe('narrativo'))"),
          grados:  await J('JSON.stringify(window.__P.grados())'),
          excel:   await J('JSON.stringify(window.__P.excel())'),
        };
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push('ctrl ' + E.n + ': ' + e.message); }
    }
    out.grupos.controles = g;
  }

  out.md5_despues = await md5(EXTERNO ? FARG : join(RAIZ, 'index.html'));
  out.index_intacto = out.md5_antes === out.md5_despues;
  console.log(JSON.stringify(out, null, 1));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }) } catch {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
