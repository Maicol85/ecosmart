#!/usr/bin/env node
/**
 * _probe_h.mjs — sonda A/B de SOLO LECTURA de la tanda «H» (2026-10-16).
 *
 * Mide, con TECLAS REALES y el PDF GENERADO DE VERDAD:
 *   ai        — la clasificacion de la auricula izquierda en sus cuatro superficies de pantalla
 *               y papel: las tres capsulas de AI/VI, el indexado, el informe en los TRES estilos
 *               y el EN SUMA.
 *   bordes    — los seis bordes del volumen indexado (34/41/48 por sus dos lados), con la BSA
 *               fijada en 2,00 exacta para que el indexado sea aritmetica cerrada.
 *   pdf       — el PDF real, por plantilla: la celda del colapso de la VCI, la celda
 *               «Edad / Sexo», el numero de figuras vectoriales dibujadas y la firma.
 *   reimp     — el PDF REIMPRESO de un estudio guardado.
 *   controles — informe, EN SUMA, las 440 columnas del Excel clave por clave, los ocho grados,
 *               las ocho pastillas, la diastolica, el HFA-PEFF y el Laboratorio.
 *
 *   node scripts/_probe_h.mjs --file /tmp/index.HEAD.html --solo ai > /tmp/h.HEAD.json
 *   node scripts/_probe_h.mjs                                       > /tmp/h.NEW.json
 *
 * Infraestructura de servidor y Chrome calcada de _probe_pdfvcit.mjs; el tecleo real y los
 * abortos, de _probe_z.mjs; la interceptacion de jsPDF, de _probe_vi3dpdf.mjs.
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
      .filter(function(l){ return /[Aa]ur[ií]cula izquierda|^AI /.test(l) });
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

  /* ── ai ── */
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
        };
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push(E.n + ': ' + e.message); }
    }
    out.grupos.ai = g;
  }

  /* ── bordes ── */
  if (corre('bordes')) {
    const g = {};
    for (const v of BORDES) {
      try {
        await montar({ ai_vol: v }, { sexo: 'M' });
        g['vol ' + v] = { pantalla: await J('JSON.stringify(window.__P.ai())'),
                          estandar: await J("JSON.stringify(window.__P.lineaAI('estandar'))") };
      } catch (e) { g['vol ' + v] = { ABORTO: e.message }; abortos.push('borde ' + v + ': ' + e.message); }
    }
    out.grupos.bordes = g;
  }

  /* ── pdf ── */
  if (corre('pdf')) {
    const g = {};
    const ESC_PDF = [
      { n: 'A masculino con colapso >50', sexo: 'M', vci: '>50' },
      { n: 'B femenino con colapso <50',  sexo: 'F', vci: '<50' },
      { n: 'C sin sexo y sin colapso',    sexo: '',  vci: null },
    ];
    for (const E of ESC_PDF) {
      for (const pl of PLANTILLAS) {
        const k = E.n + ' / ' + pl;
        try {
          await montar({ ai_vol: '68' }, { sexo: E.sexo, vci: E.vci,
            extra: { nombre: 'PDF H', ci: '12345678', edad: '60', fecha: '2026-10-16' } });
          const r = await J(`JSON.stringify(window.__P.pdf(${JSON.stringify(pl)}, false))`);
          g[k] = { err: r.err, nTextos: r.nTextos, nFigs: r.nFigs, largoB64: r.largoB64,
                   celdas: await J(`JSON.stringify(window.__P.celdas(${JSON.stringify(r.textos)}))`),
                   textos: r.textos, figs: r.figs };
          if (DEST && pl === 'clasico') {
            await writeFile(join(DEST, 'pdf_' + E.n.split(' ')[0] + '.b64'), r.b64 || '', 'utf8');
          }
        } catch (e) { g[k] = { ABORTO: e.message }; abortos.push(k + ': ' + e.message); }
      }
    }
    out.grupos.pdf = g;
  }

  /* ── reimp: el PDF de un estudio GUARDADO, por su camino real ── */
  if (corre('reimp')) {
    const g = {};
    for (const E of [{ n: 'masculino >50', sexo: 'M', vci: '>50', ci: '7000001' },
                     { n: 'femenino <50',  sexo: 'F', vci: '<50', ci: '7000002' },
                     { n: 'sin sexo',      sexo: '',  vci: null,  ci: '7000003' }]) {
      try {
        await montar({ ai_vol: '98' }, { sexo: E.sexo, vci: E.vci,
          extra: { nombre: 'REIMP ' + E.ci, ci: E.ci, edad: '55', fecha: '2026-10-16' } });
        await ev("(function(){ try { setEstiloInforme('estandar'); generarInforme() } catch(e) {} return 1 })()");
        const gu = await J('JSON.stringify(window.__P.guardarEstudio())');
        await pausa(900);
        const id = await ev(`window.__P.idPorDoc(${JSON.stringify(E.ci)})`);
        await ev('window.__P.limpiar()');
        /* ⚠️ UN await DE NIVEL SUPERIOR EN Runtime.evaluate TIRA «missing ) after argument
           list»: la expresion se evalua en una funcion que NO es async. Va en su propia IIFE
           asincrona, que es lo que este repo ya tiene escrito para el cuerpo de un caso. */
        const r = await J(`(async function(){ return JSON.stringify(await window.__P.reimprimir(${JSON.stringify(id)})) })()`);
        g[E.n] = { guardo: gu, id: id, nTextos: r.nTextos, nFigs: r.nFigs, err: r.err,
                   celdas: await J(`JSON.stringify(window.__P.celdas(${JSON.stringify(r.textos || [])}))`) };
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push('reimp ' + E.n + ': ' + e.message); }
    }
    out.grupos.reimp = g;
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
