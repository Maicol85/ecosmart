#!/usr/bin/env node
/**
 * _probe_l.mjs — sonda A/B de SOLO LECTURA de la tanda «L» (2026-10-16).
 *
 * Grupos (cada uno con salida parcial propia por stderr):
 *   j1        — el defecto J-1: volumen de AI medido SIN superficie corporal, en los TRES
 *               estilos de informe y en cuatro escenas (nada mas, diametro normal, area
 *               normal, diametro dilatado, area dilatada). SOLO LECTURA: no se corrige.
 *   registro  — el registro de evidencia: ids unicos, datos puros, estados, y el valor de
 *               cada ficha contra el DUENO que usa el informe.
 *   tarjeta   — las dos tarjetas i: abren, cierran, punto del paciente, categoria en
 *               palabras, cortes con unidad, en vivo, sexo, sin ASC, sin datos.
 *   geom      — el grafico de geometria del VI: cuadrantes, simetria, bandas.
 *   maqueta   — anchos y temas.
 *   controles — informe (3 estilos), EN SUMA, Excel clave por clave, grados, pastillas.
 *
 *   node scripts/_probe_l.mjs --file /tmp/index.HEAD.html --solo j1 > /tmp/l.HEAD.json
 *   node scripts/_probe_l.mjs --solo tarjeta                        > /tmp/l.NEW.json
 *
 * Infraestructura (servidor, Chrome, teclas reales, abortos) calcada de _probe_h.mjs.
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

  /* ── EL VENTRICULO IZQUIERDO, en la pantalla ── */
  vi() {
    var g = function(id){ var e = document.getElementById(id);
      return e ? String(e.textContent||'').trim() : 'NO EXISTE' };
    return { dev: g('devereux-val'), rwt: g('rwt-val'), geom: g('geom-val'),
             fevi: g('fevi-interp'), vdf: g('vdfvi-idx-interp'), vsf: g('vsfvi-idx-interp'),
             fa: g('fa-val') } },

  /* Las lineas del VI del informe. Se filtra por sintagmas con TILDE incluida: la trampa de
     indexOf('uricula') que TC-487 pago esta escrita en CLAUDE.md. */
  lineaVI(est) {
    var r = window.__P.informe(est);
    var ls = String(r.inf || '').split(String.fromCharCode(10))
      .filter(function(l){ return /[Vv]entr[ií]culo izquierdo|FEVI|hipertrofia|[Gg]eometr/.test(l) });
    var ss = String(r.suma || '').split(String.fromCharCode(10))
      .filter(function(l){ return /FEVI|HVI|VI /.test(l) });
    return { inf: ls, suma: ss } },

  /* ── LAS TARJETAS. CENTINELA en todo: contra HEAD no existe ni el boton ni el registro. ── */
  hayBtn(clave) { var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { hay:false };
    var r = b.getBoundingClientRect();
    return { hay:true, w: Math.round(r.width), h: Math.round(r.height),
             tag: b.tagName, exp: b.getAttribute('aria-expanded') } },
  abrirTarjeta(clave) {
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { err:'NO EXISTE BOTON ' + clave };
    var r0 = b.getBoundingClientRect();
    if (r0.width === 0 || r0.height === 0) return { err:'BOTON SIN GEOMETRIA ' + clave };
    b.click();
    var c = document.getElementById('vinfo-card');
    if (!c) return { err:'NO EXISTE vinfo-card' };
    var cs = getComputedStyle(c);
    var rc = c.getBoundingClientRect();
    return { ok: cs.display !== 'none', exp: b.getAttribute('aria-expanded'),
             w: Math.round(rc.width), h: Math.round(rc.height),
             top: Math.round(rc.top), left: Math.round(rc.left),
             foco: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null } },
  cerrarTarjeta() {
    var c = document.getElementById('vinfo-card');
    return c ? getComputedStyle(c).display : 'NO EXISTE' },
  /* Lo que la tarjeta DICE y lo que DIBUJA, por separado: un grafico perfecto con el texto
     equivocado pasa una lectura que solo mire el SVG, y al reves. */
  leerTarjeta() {
    var c = document.getElementById('vinfo-card');
    if (!c) return { err:'NO EXISTE vinfo-card' };
    if (getComputedStyle(c).display === 'none') return { err:'CERRADA' };
    var puntos = Array.prototype.slice.call(c.querySelectorAll('[data-ev-punto]'))
      .map(function(e){ return { k: e.getAttribute('data-ev-punto'),
                                 x: e.getAttribute('cx') || e.getAttribute('x'),
                                 y: e.getAttribute('cy') || e.getAttribute('y') } });
    var barras = Array.prototype.slice.call(c.querySelectorAll('[data-ev-barra]'))
      .map(function(e){ return e.getAttribute('data-ev-barra') });
    var cortes = Array.prototype.slice.call(c.querySelectorAll('[data-ev-corte]'))
      .map(function(e){ return e.getAttribute('data-ev-corte') + '=' + String(e.textContent||'').trim() });
    var cuad = Array.prototype.slice.call(c.querySelectorAll('[data-ev-cuad]'))
      .map(function(e){ return e.getAttribute('data-ev-cuad') + '|' + (e.getAttribute('x')||'') + '|' +
                               (e.getAttribute('y')||'') + '|' + (e.getAttribute('width')||'') + '|' +
                               (e.getAttribute('height')||'') });
    var cat = Array.prototype.slice.call(c.querySelectorAll('[data-ev-cat]'))
      .map(function(e){ return e.getAttribute('data-ev-cat') + ': ' + String(e.textContent||'').trim() });
    var fu = Array.prototype.slice.call(c.querySelectorAll('[data-ev-fuente]'))
      .map(function(e){ return String(e.textContent||'').trim() });
    var av = Array.prototype.slice.call(c.querySelectorAll('[data-ev-aviso]'))
      .map(function(e){ return String(e.textContent||'').trim() });
    return { tit: (c.querySelector('h4') ? String(c.querySelector('h4').textContent||'').trim() : null),
             texto: String(c.textContent||'').replace(/\s+/g, ' ').trim(),
             puntos: puntos, barras: barras, cortes: cortes, cuad: cuad, cat: cat,
             fuentes: fu, avisos: av,
             nSvg: c.querySelectorAll('svg').length,
             scroll: { sh: c.scrollHeight, ch: c.clientHeight } } },

  /* ── EL REGISTRO DE EVIDENCIA ── */
  registro() {
    if (typeof window.EV_REG === 'undefined') return { err:'SIN EV_REG' };
    var R = window.EV_REG;
    var ids = R.map(function(f){ return f.id });
    var dup = ids.filter(function(x, i){ return ids.indexOf(x) !== i });
    var puro = null;
    try { puro = (JSON.stringify(JSON.parse(JSON.stringify(R))) === JSON.stringify(R)) } catch (e) { puro = 'EXC' }
    var estados = {};
    R.forEach(function(f){ estados[f.estado] = (estados[f.estado] || 0) + 1 });
    return { n: R.length, dup: dup, puro: puro, estados: estados,
             campos: Object.keys(R[0] || {}),
             fichas: R.map(function(f){ return { id:f.id, dato:f.dato, valor:f.valor,
               ubicacion:f.ubicacion, folio:f.folio, hoja_pdf:f.hoja_pdf, estado:f.estado,
               tipo:f.tipo, duenio:f.duenio, guia:f.guia, doi:f.doi,
               fuente_original:f.fuente_original, fecha_verificacion:f.fecha_verificacion,
               fuente_una_linea:f.fuente_una_linea } }) } },
  /* Los cortes que la tarjeta DIBUJA salen de sondear al dueno. Aca se lee ese sondeo para
     compararlo contra lo que la ficha declara: si divergen, la tarjeta y el informe no dicen
     lo mismo del mismo paciente. */
  cortesDeDuenio(sexo) {
    if (typeof window.evCortes !== 'function') return { err:'SIN evCortes' };
    try { return window.evCortes(sexo) } catch (e) { return { err:'EXC ' + String(e && e.message) } } },

  temaClaro(on) {
    var r = document.documentElement;
    if (on) r.classList.add('light-mode'); else r.classList.remove('light-mode');
    return r.classList.contains('light-mode') },
  colorDe(sel, prop) {
    var e = document.querySelector(sel); if (!e) return 'NO EXISTE';
    return getComputedStyle(e).getPropertyValue(prop || 'color').trim() },
  scrollH() { return { sw: document.documentElement.scrollWidth,
                       cw: document.documentElement.clientWidth } },
  nodos() { return document.getElementsByTagName('*').length },

  listo() {
    var faltan = ['generarPDFReal','limpiarCampos','showTab','getBSA','generarInforme','calcAI']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (typeof window.jspdf === 'undefined') faltan.push('jspdf');
    return faltan.length ? { listo:false, faltan:faltan } : { listo:true } }
};
'OK';
`;

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

/* ⚠️ LA SUPERFICIE CORPORAL SE FIJA EN 2,00 EXACTA (80 kg / 180 cm con Mosteller): asi el
   volumen indexado es el volumen sobre dos y los cortes se alcanzan con enteros. */
const BSA2 = { peso: '80', talla: '180' };
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

  /* Salida parcial por grupo: un grupo que corre a ciegas no se puede diagnosticar, que es la
     leccion del `ident` de la tanda J (65 minutos sin escribir una linea). */
  const parcial = (g, t0) => process.stderr.write(
    '  [' + g + '] listo en ' + Math.round((Date.now() - t0) / 1000) + ' s\n');

  /* ── j1: el volumen de AI medido que NO se puede indexar (SOLO LECTURA) ──
     El defecto esta declarado en PENDIENTES como H-1 y cerrado por J1 en la capsula, el
     informe y la fila del PDF. Esta tanda lo vuelve a medir en los TRES estilos y con las
     cuatro combinaciones que la orden enumera, y NO lo cambia. */
  if (corre('j1')) {
    const t0 = Date.now(); const g = {};
    const ESC = [
      { n: 'J1-a volumen 98 y nada mas, SIN ASC',        c: { ai_vol: '98' }, sinBsa: true },
      { n: 'J1-b volumen 98 + diametro NORMAL 38',       c: { ai_vol: '98', ai_diam: '38' }, sinBsa: true },
      { n: 'J1-c volumen 98 + area NORMAL 15',           c: { ai_vol: '98', ai_area: '15' }, sinBsa: true },
      { n: 'J1-d volumen 98 + diametro DILATADO 50',     c: { ai_vol: '98', ai_diam: '50' }, sinBsa: true },
      { n: 'J1-e volumen 98 + area DILATADA 25',         c: { ai_vol: '98', ai_area: '25' }, sinBsa: true },
      { n: 'J1-f CONTROL: el mismo 98 CON ASC 2,00',     c: { ai_vol: '98' }, sinBsa: false },
    ];
    for (const E of ESC) {
      try {
        await montar(E.c, { sinBsa: E.sinBsa, sexo: 'M' });
        g[E.n] = {
          pantalla:  await J('JSON.stringify(window.__P.ai())'),
          conciso:   await J("JSON.stringify(window.__P.lineaAI('conciso'))"),
          estandar:  await J("JSON.stringify(window.__P.lineaAI('estandar'))"),
          narrativo: await J("JSON.stringify(window.__P.lineaAI('narrativo'))"),
        };
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push(E.n + ': ' + e.message); }
    }
    out.grupos.j1 = g; parcial('j1', t0);
  }

  /* ── registro ── */
  if (corre('registro')) {
    const t0 = Date.now(); const g = {};
    try {
      await montar({}, { sexo: 'M' });
      g.reg = await J('JSON.stringify(window.__P.registro())');
      g.cortesM = await J("JSON.stringify(window.__P.cortesDeDuenio('M'))");
      g.cortesF = await J("JSON.stringify(window.__P.cortesDeDuenio('F'))");
    } catch (e) { g.ABORTO = e.message; abortos.push('registro: ' + e.message); }
    out.grupos.registro = g; parcial('registro', t0);
  }

  /* ── tarjeta: las dos i, escena por escena ──
     Cada escena deja la pantalla en un estado y lee LO QUE LA TARJETA DICE y LO QUE DIBUJA. */
  const ESC_TAR = [
    { k: 'ai-card', n: 'AI normal (vol 68, H)',      sexo: 'M', c: { ai_vol: '68', ai_diam: '38', ai_area: '15' } },
    { k: 'ai-card', n: 'AI leve (vol 76, H)',        sexo: 'M', c: { ai_vol: '76' } },
    { k: 'ai-card', n: 'AI moderada (vol 90, H)',    sexo: 'M', c: { ai_vol: '90' } },
    { k: 'ai-card', n: 'AI severa (vol 98, M)',      sexo: 'F', c: { ai_vol: '98', ai_diam: '50', ai_area: '25' } },
    { k: 'ai-card', n: 'AI sin ASC (vol 98)',        sexo: 'M', c: { ai_vol: '98' }, sinBsa: true },
    { k: 'ai-card', n: 'AI sin datos',               sexo: 'M', c: {} },
    { k: 'ai-card', n: 'AI sin sexo (vol 90)',       sexo: '',  c: { ai_vol: '90' } },
    { k: 'vi-card', n: 'VI normal H',   sexo: 'M', c: { ddfvi: '50', dsfvi: '32', siv: '9', ppvi: '9', fevi: '60', vdfvi: '120', vsfvi: '48' } },
    { k: 'vi-card', n: 'VI HVI conc. severa H', sexo: 'M', c: { ddfvi: '46', dsfvi: '30', siv: '16', ppvi: '16', fevi: '55', vdfvi: '120', vsfvi: '54' } },
    { k: 'vi-card', n: 'VI HVI exc. leve M',    sexo: 'F', c: { ddfvi: '56', dsfvi: '38', siv: '11', ppvi: '10', fevi: '45', vdfvi: '150', vsfvi: '82' } },
    { k: 'vi-card', n: 'VI remodelado conc. H', sexo: 'M', c: { ddfvi: '42', dsfvi: '28', siv: '11', ppvi: '11', fevi: '35', vdfvi: '90', vsfvi: '58' } },
    { k: 'vi-card', n: 'VI sin sexo',    sexo: '',  c: { ddfvi: '50', dsfvi: '32', siv: '12', ppvi: '12', fevi: '60' } },
    { k: 'vi-card', n: 'VI sin ASC',     sexo: 'M', c: { ddfvi: '50', dsfvi: '32', siv: '12', ppvi: '12', fevi: '60', vdfvi: '120' }, sinBsa: true },
    { k: 'vi-card', n: 'VI sin datos',   sexo: 'M', c: {} },
  ];
  if (corre('tarjeta')) {
    const t0 = Date.now(); const g = {};
    for (const E of ESC_TAR) {
      const kk = E.k + ' | ' + E.n;
      try {
        await montar(E.c, { sinBsa: E.sinBsa, sexo: E.sexo });
        await ev('(function(){ try { calcVI() } catch(e) {} return 1 })()');
        const btn = await J(`JSON.stringify(window.__P.hayBtn(${JSON.stringify(E.k)}))`);
        const ab  = await J(`JSON.stringify(window.__P.abrirTarjeta(${JSON.stringify(E.k)}))`);
        const le  = ab && ab.err ? { err: ab.err } : await J('JSON.stringify(window.__P.leerTarjeta())');
        const pantalla = E.k === 'ai-card'
          ? await J('JSON.stringify(window.__P.ai())')
          : await J('JSON.stringify(window.__P.vi())');
        /* Segundo toque: cierra. */
        const ab2 = await J(`JSON.stringify(window.__P.abrirTarjeta(${JSON.stringify(E.k)}))`);
        g[kk] = { btn, ab, le, pantalla, cierraSegundoToque: ab2 && ab2.ok === false,
                  tras: await ev('window.__P.cerrarTarjeta()') };
      } catch (e) { g[kk] = { ABORTO: e.message }; abortos.push(kk + ': ' + e.message); }
    }
    out.grupos.tarjeta = g; parcial('tarjeta', t0);
  }

  /* ── vivo: Escape, clic afuera, foco, en vivo y 20 aperturas ── */
  if (corre('vivo')) {
    const t0 = Date.now(); const g = {};
    try {
      await montar({ ai_vol: '68' }, { sexo: 'M' });
      const n0 = await ev('window.__P.nodos()');
      g.abre = await J("JSON.stringify(window.__P.abrirTarjeta('ai-card'))");
      await tecla('Escape');
      g.trasEscape = await ev('window.__P.cerrarTarjeta()');
      g.focoTrasEscape = await ev('document.activeElement ? (document.activeElement.getAttribute("data-vinfo") || document.activeElement.id || document.activeElement.tagName) : null');
      /* En vivo: con la tarjeta abierta se cambia el volumen y la categoria tiene que seguirlo. */
      await J("JSON.stringify(window.__P.abrirTarjeta('ai-card'))");
      g.antesVivo = await J('JSON.stringify(window.__P.leerTarjeta())');
      await tipear('ai_vol', '98');
      g.despuesVivo = await J('JSON.stringify(window.__P.leerTarjeta())');
      await tecla('Escape');
      /* 20 aperturas y cierres: ni nodos ni oyentes acumulados. */
      for (let i = 0; i < 20; i++) {
        await J("JSON.stringify(window.__P.abrirTarjeta('ai-card'))");
        await J("JSON.stringify(window.__P.abrirTarjeta('ai-card'))");
      }
      g.nodos = { antes: n0, despues: await ev('window.__P.nodos()') };
      g.finalCerrada = await ev('window.__P.cerrarTarjeta()');
      /* Nada se guarda: ni en el estudio ni en el navegador. */
      g.claves = await J(`JSON.stringify((function(){
        var ls = []; for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i); if (/ev[-_]|tarjeta|vinfo/i.test(k)) ls.push(k) }
        var cs = Object.keys(window.__P.camposCrudos()).filter(function(k){ return /^ev-|^evg-/.test(k) });
        return { ls: ls, campos: cs } })())`);
    } catch (e) { g.ABORTO = e.message; abortos.push('vivo: ' + e.message); }
    out.grupos.vivo = g; parcial('vivo', t0);
  }

  /* ── maqueta: anchos y los dos temas ── */
  if (corre('maqueta')) {
    const t0 = Date.now(); const g = {};
    const ANCHOS = [[1200, 700], [1440, 800], [1920, 1080], [768, 1024], [390, 844], [360, 740]];
    for (const [w, h] of ANCHOS) {
      for (const tema of ['oscuro', 'claro']) {
        const kk = w + 'x' + h + ' ' + tema;
        try {
          await cdp.send('Emulation.setDeviceMetricsOverride',
            { width: w, height: h, deviceScaleFactor: 1, mobile: false }, sessionId);
          const puesto = await ev(`window.__P.temaClaro(${tema === 'claro'})`);
          await montar({ ai_vol: '98', ddfvi: '46', dsfvi: '30', siv: '16', ppvi: '16',
                         fevi: '55', vdfvi: '120', vsfvi: '54' }, { sexo: 'M' });
          await ev('(function(){ try { calcVI() } catch(e) {} return 1 })()');
          const o = {};
          for (const k of ['ai-card', 'vi-card']) {
            const ab = await J(`JSON.stringify(window.__P.abrirTarjeta(${JSON.stringify(k)}))`);
            const le = ab && ab.err ? { err: ab.err } : await J('JSON.stringify(window.__P.leerTarjeta())');
            o[k] = { ab, scroll: le && le.scroll, nSvg: le && le.nSvg };
            await tecla('Escape');
          }
          g[kk] = { temaClaroPuesto: puesto, tarjetas: o,
                    pagina: await J('JSON.stringify(window.__P.scrollH())') };
        } catch (e) { g[kk] = { ABORTO: e.message }; abortos.push(kk + ': ' + e.message); }
      }
    }
    await ev('window.__P.temaClaro(false)');
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.grupos.maqueta = g; parcial('maqueta', t0);
  }

  /* ── controles: nada de lo que esta tanda toca puede mover una superficie firmada ── */
  if (corre('controles')) {
    const t0 = Date.now(); const g = {};
    const CTRL = [
      { n: 'vacio', c: {}, sexo: '' },
      { n: 'escenario cargado', sexo: 'M',
        c: { ai_vol: '98', ai_diam: '44', ai_area: '25', onda_e: '90', onda_a: '60',
             e_sep: '6', e_lat: '8', vmax_it: '3.0', fevi: '55', ddfvi: '50', siv: '12',
             ppvi: '11', dsfvi: '34', vdfvi: '150', vsfvi: '70', tapse: '18', im_vc: '7',
             vmax_ao: '4.2', gmedio_ao: '45' } },
      { n: 'mujer con HVI', sexo: 'F',
        c: { ddfvi: '46', dsfvi: '30', siv: '14', ppvi: '14', fevi: '45', ai_vol: '84' } },
    ];
    for (const E of CTRL) {
      try {
        await montar(E.c, { sexo: E.sexo, vci: '>50' });
        await ev('(function(){ try { calcVI() } catch(e) {} return 1 })()');
        g[E.n] = {
          conciso:   await J("JSON.stringify(window.__P.informe('conciso'))"),
          estandar:  await J("JSON.stringify(window.__P.informe('estandar'))"),
          narrativo: await J("JSON.stringify(window.__P.informe('narrativo'))"),
          grados:  await J('JSON.stringify(window.__P.grados())'),
          vi:      await J('JSON.stringify(window.__P.vi())'),
          ai:      await J('JSON.stringify(window.__P.ai())'),
          excel:   await J('JSON.stringify(window.__P.excel())'),
          campos:  await J('JSON.stringify(Object.keys(window.__P.camposCrudos()).length)'),
        };
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push('ctrl ' + E.n + ': ' + e.message); }
    }
    out.grupos.controles = g; parcial('controles', t0);
  }

  out.md5_despues = await md5(EXTERNO ? FARG : join(RAIZ, 'index.html'));
  out.index_intacto = out.md5_antes === out.md5_despues;
  console.log(JSON.stringify(out, null, 1));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }) } catch {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
