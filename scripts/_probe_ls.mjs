#!/usr/bin/env node
/**
 * _probe_ls.mjs — sonda A/B de SOLO LECTURA de la tanda «LS» (2026-10-16).
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

  /* ⚠️ NI UN REGEX EN LOS METODOS DE ESTA TANDA, y no es estilo: una barra invertida dentro de
     un template literal SE COCINA, asi que el patron que llega al motor no es el que se
     escribio —la barra-ese se vuelve la letra s y borra todas las eses del texto—. Este
     repositorio ya pago esa trampa cinco veces. Se parten cadenas por codigo de caracter. */
  tokens(s) {
    var out = [], cur = '';
    s = String(s == null ? '' : s).toLowerCase();
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      var letra = (c >= 97 && c <= 122) || c >= 192;
      if (letra) cur += s.charAt(i); else { if (cur) out.push(cur); cur = '' } }
    if (cur) out.push(cur);
    return out },
  plano(s) {
    var t = String(s == null ? '' : s);
    var sal = '', ultBlanco = false;
    for (var i = 0; i < t.length; i++) {
      var c = t.charCodeAt(i);
      var blanco = (c === 32 || c === 9 || c === 10 || c === 13 || c === 160);
      if (blanco) { if (!ultBlanco) sal += ' '; ultBlanco = true }
      else { sal += t.charAt(i); ultBlanco = false } }
    return sal.trim() },

  /* ── EL DUENO DEL SEXO EFECTIVO ── */
  duenioFns() { return ['sexoLeido','sexoCargado','sexoEfectivo','sexoFalta']
    .reduce(function(o, f){ o[f] = (typeof window[f] === 'function'); return o }, {}) },
  /* Los dos valores del select, el vacio, tres grafias legadas, dos valores que no son
     masculino ni femenino, el nulo y un texto con espacios. undefined NO entra en esta lista
     a proposito: ahi sexoEfectivo lee el FORMULARIO, y eso se mide en duenioForm. */
  duenioSexo() {
    var vals = ['M', 'F', '', 'm', 'f', 'Masculino', 'Femenino', 'X', 'otro', null, '  F  ', 'Male'];
    return vals.map(function(v){
      var r = { ent: (v === null) ? '(null)' : JSON.stringify(v) };
      try { r.leido = String(window.sexoLeido(v)) } catch (e) { r.leido = 'EXC' }
      try { r.efectivo = String(window.sexoEfectivo(v)) } catch (e) { r.efectivo = 'EXC' }
      try { r.falta = String(window.sexoFalta(v)) } catch (e) { r.falta = 'EXC' }
      return r }) },
  duenioForm() {
    var o = { valor: window.__P.val('sexo') };
    try { o.cargado = String(window.sexoCargado()) } catch (e) { o.cargado = 'EXC' }
    try { o.efectivo = String(window.sexoEfectivo()) } catch (e) { o.efectivo = 'EXC' }
    try { o.falta = String(window.sexoFalta()) } catch (e) { o.falta = 'EXC' }
    try { o.objeto = String(window.sexoCargado({ sexo: 'F' })) } catch (e) { o.objeto = 'EXC' }
    try { o.corteAlto = String(window.SEXO_CORTE_ALTO) } catch (e) { o.corteAlto = 'EXC' }
    return o },

  /* ── ACENTOS DE LAS FICHAS. Lo que el medico LEE no puede salir sin tildes, y la forma de
     medirlo no es contar caracteres: es buscar las palabras que en espanol LLEVAN tilde y
     aparecen sin ella. Se compara por TOKEN completo y no por subcadena, que es la trampa que
     la tanda M ya pago —«todo» matchea dentro de «metodo»—. ── */
  registroAcentos() {
    if (typeof window.EV_REG === 'undefined') return { err:'SIN EV_REG' };
    var SIN = ['diametro','diametros','area','areas','auricula','ventriculo',
               'telediastolico','telesistolico','sistolico','diastolico','fraccion','eyeccion',
               'limite','metodo','concentrico','concentrica','excentrico','excentrica',
               'geometria','maxima','maximo','cuantificacion','camaras',
               'ecocardiografia','asociacion','espanola','cardiologia','diagnostico',
               'cronica','traduccion','guia','indice'];
    /* NO entran: «auricular», «insuficiencia», «cardiaca» y «cardiacas» no llevan tilde —la
       Academia admite «cardiaco» sin ella—, y «metros», «parietal», «solo» y «ecuaciones»
       tampoco. Una lista que las incluya pone en rojo una ficha perfecta, que es la trampa de
       las palabras de reserva cortas que la tanda M ya pago. */
    var LEE = ['zona','dato','valor','tipo','ubicacion','fuente_una_linea','guia'];
    var sal = [];
    window.EV_REG.forEach(function(f){
      LEE.forEach(function(k){
        var mal = window.__P.tokens(f[k]).filter(function(t){ return SIN.indexOf(t) > -1 });
        if (mal.length) sal.push({ id:f.id, campo:k, palabras:mal }) }) });
    return { n: sal.length, casos: sal } },
  /* Vocabulario de proceso que no puede vivir en un repositorio publico. */
  registroReserva() {
    if (typeof window.EV_REG === 'undefined') return { err:'SIN EV_REG' };
    var RES = ['pendiente','pendientes','duda','dudas','reserva','reservas','fixme',
               'provisorio','tentativo','chequear','confirmar','ojo'];
    var sal = [];
    window.EV_REG.forEach(function(f){
      Object.keys(f).forEach(function(k){
        var mal = window.__P.tokens(f[k]).filter(function(t){ return RES.indexOf(t) > -1 });
        if (mal.length) sal.push({ id:f.id, campo:k, palabras:mal }) }) });
    return { n: sal.length, casos: sal } },

  /* ── EL AVISO DE SEXO EN PANTALLA ── */
  avisoSexo() {
    var e = document.getElementById('aivi-sexo-aviso');
    if (!e) return { hay:false };
    var cs = getComputedStyle(e), r = e.getBoundingClientRect();
    return { hay:true, display: cs.display, color: cs.color.trim(),
             texto: window.__P.plano(e.textContent),
             role: e.getAttribute('role'), live: e.getAttribute('aria-live'),
             w: Math.round(r.width), h: Math.round(r.height),
             visible: cs.display !== 'none' && r.height > 0 } },

  /* ── LOS ESPESORES Y EL DIAMETRO SISTOLICO: que publica la pantalla, si algo ── */
  espesores() {
    var g = function(id){ var e = document.getElementById(id);
      return e ? String(e.textContent||'').trim() : 'NO EXISTE' };
    return { sivInterp: g('siv-interp'), ppInterp: g('pp-interp'), dsInterp: g('dsvi-interp'),
             bandas: (function(){ try {
               if (typeof window.espesorBandas !== 'function') return 'SIN FN';
               return { M: window.espesorBandas('M'), F: window.espesorBandas('F'),
                        sin: window.espesorBandas('') } } catch (e) { return 'EXC' } })() } },

  /* ── REFERENCIAS: lo que publica una entrada, por sexo ── */
  refs(id) {
    try { if (typeof showTab === 'function') showTab('refs') } catch (e) {}
    try { if (typeof evRefPintar === 'function') evRefPintar(id) } catch (e) {}
    /* El host es ref-<id>-cuerpo y las filas son los tr de su tabla: la tabla no lleva un
       atributo propio, asi que buscarlo devolveria cero y se leeria como «Referencias vacia». */
    var h = document.getElementById('ref-' + id + '-cuerpo');
    if (!h) return { err:'NO EXISTE ref-' + id + '-cuerpo' };
    var filas = Array.prototype.slice.call(h.querySelectorAll('table.ev-tabla tr'))
      .map(function(e){ return Array.prototype.slice.call(e.children)
        .map(function(c){ return window.__P.plano(c.textContent) }).join(' | ') });
    var bib = Array.prototype.slice.call(h.querySelectorAll('[data-ev-bib]'))
      .map(function(e){ return window.__P.plano(e.textContent) });
    var bar = Array.prototype.slice.call(h.querySelectorAll('[data-ev-barra]'))
      .map(function(e){ return e.getAttribute('data-ev-barra') });
    return { nFilas: filas.length, filas: filas, nBib: bib.length, bib: bib, barras: bar,
             texto: window.__P.plano(h.textContent).slice(0, 5000),
             nSvg: h.querySelectorAll('svg').length } },

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
    /* ⚠️ LAS DOS TARJETAS SON ACORDEONES Y NACEN CERRADOS: sin abrirlos, el globo existe y mide
       0 x 0, la tarjeta se niega a anclarse —que es lo correcto— y la escena «sin datos» se
       queda sin medir. Se abren SIEMPRE, no solo cuando hay campos que tipear. */
    await ev(`(function(){ ['ai','vi'].forEach(function(k){
      var n = document.getElementById('sacc-' + k);
      if (n && getComputedStyle(n.querySelector('.sacc-body')).display === 'none') {
        try { secToggle(k) } catch (e) {} } }); return 1 })()`);
    for (const [id, val] of Object.entries(campos || {})) await tipear(id, val);
    if (opts.extra) for (const [id, val] of Object.entries(opts.extra)) await tipear(id, val);
    await ev('(function(){ try { calcAI() } catch(e) {} return 1 })()');
  }

  const out = { arbol: FARG, md5_antes: antes, listo, grupos: {}, abortos };

  /* Salida parcial por grupo: un grupo que corre a ciegas no se puede diagnosticar, que es la
     leccion del `ident` de la tanda J (65 minutos sin escribir una linea). */
  const parcial = (g, t0) => process.stderr.write(
    '  [' + g + '] listo en ' + Math.round((Date.now() - t0) / 1000) + ' s\n');
  /* ── sexo: el DUENO del sexo efectivo y la regla del corte mas alto ──
     Se prueba con los dos valores del `<select>`, con el vacio, con tres grafias legadas y con
     dos valores que no son masculino ni femenino: esos ultimos tienen que contar como SIN
     SEXO, que es la decision conservadora. */
  if (corre('sexo')) {
    const t0 = Date.now(); const g = {};
    g.fn = await J('JSON.stringify(window.__P.duenioFns())');
    g.valores = await J('JSON.stringify(window.__P.duenioSexo())');
    try {
      await montar({}, { sexo: 'F' });
      g.form_F = await J('JSON.stringify(window.__P.duenioForm())');
      await montar({}, { sexo: 'M' });
      g.form_M = await J('JSON.stringify(window.__P.duenioForm())');
      await montar({}, { sexo: '' });
      g.form_sin = await J('JSON.stringify(window.__P.duenioForm())');
    } catch (e) { g.ABORTO = e.message; abortos.push('sexo: ' + e.message); }
    out.grupos.sexo = g; parcial('sexo', t0);
  }

  /* ── registro: ids, pureza, estados, acentos y ficha contra DUENO ── */
  if (corre('registro')) {
    const t0 = Date.now(); const g = {};
    g.reg = await J('JSON.stringify(window.__P.registro())');
    g.acentos = await J('JSON.stringify(window.__P.registroAcentos())');
    g.reserva = await J('JSON.stringify(window.__P.registroReserva())');
    try {
      await montar({}, { sexo: 'M' });
      g.cortes_M = await J("JSON.stringify(window.__P.cortesDeDuenio('M'))");
      g.cortes_F = await J("JSON.stringify(window.__P.cortesDeDuenio('F'))");
      g.cortes_sin = await J("JSON.stringify(window.__P.cortesDeDuenio(''))");
    } catch (e) { g.ABORTO = e.message; abortos.push('registro: ' + e.message); }
    out.grupos.registro = g; parcial('registro', t0);
  }

  /* ── aidiam: el diametro AP de la auricula izquierda, por sexo y por su borde exacto ──
     Tres sexos por cinco valores: el borde de la mujer, el del varon, y uno por debajo y uno
     por encima de cada uno. La capsula, la tarjeta, el informe en los TRES estilos, el EN SUMA
     y la fila del Excel, todo en la misma escena. */
  if (corre('aidiam')) {
    const t0 = Date.now(); const g = {};
    const VAL = ['37', '38', '39', '40', '41'];
    for (const sx of ['M', 'F', '']) {
      for (const d of VAL) {
        const k = 'sexo=' + (sx || 'SIN') + ' diam=' + d;
        try {
          await montar({ ai_diam: d }, { sexo: sx });
          g[k] = {
            capsula: await J('JSON.stringify(window.__P.ai())'),
            dil: await ev('(function(){ try { return String(aiDiamDilatado(' + d + ')) } catch(e){ return "EXC" } })()'),
            inf: await J("JSON.stringify(window.__P.lineaAI('estandar'))"),
            narr: await J("JSON.stringify(window.__P.lineaAI('narrativo'))"),
            conc: await J("JSON.stringify(window.__P.lineaAI('conciso'))"),
          };
        } catch (e) { g[k] = { ABORTO: e.message }; abortos.push('aidiam ' + k + ': ' + e.message); }
      }
    }
    out.grupos.aidiam = g; parcial('aidiam', t0);
  }

  /* ── ddvi: el diametro diastolico del VI, por sexo y por sus tres bordes ── */
  if (corre('ddvi')) {
    const t0 = Date.now(); const g = {};
    const VAL = ['51', '52', '53', '56', '57', '58', '59', '61', '62', '63', '64', '65', '68', '69'];
    for (const sx of ['M', 'F', '']) {
      for (const d of VAL) {
        const k = 'sexo=' + (sx || 'SIN') + ' dd=' + d;
        try {
          await montar({ ddfvi: d }, { sexo: sx });
          g[k] = {
            cat: await ev('(function(){ try { return String(viDimCat(' + d + ')) } catch(e){ return "EXC" } })()'),
            inf: await J("JSON.stringify(window.__P.lineaVI('estandar'))"),
          };
        } catch (e) { g[k] = { ABORTO: e.message }; abortos.push('ddvi ' + k + ': ' + e.message); }
      }
    }
    out.grupos.ddvi = g; parcial('ddvi', t0);
  }

  /* ── vol: el respaldo por volumen telediastolico indexado del DDVI, por sexo ── */
  if (corre('vol')) {
    const t0 = Date.now(); const g = {};
    for (const sx of ['M', 'F', '']) {
      for (const par of [['122', '61.0'], ['123', '61.5'], ['148', '74.0'], ['150', '75.0']]) {
        const k = 'sexo=' + (sx || 'SIN') + ' vdfvi=' + par[0] + ' idx=' + par[1];
        try {
          await montar({ ddfvi: '50', vdfvi: par[0] }, { sexo: sx });
          g[k] = { cat: await ev('(function(){ try { return String(viDimCat(50)) } catch(e){ return "EXC" } })()'),
                   vi: await J('JSON.stringify(window.__P.vi())') };
        } catch (e) { g[k] = { ABORTO: e.message }; abortos.push('vol ' + k + ': ' + e.message); }
      }
    }
    out.grupos.vol = g; parcial('vol', t0);
  }


  /* ── aviso: la linea de pantalla cuando falta el sexo ── */
  if (corre('aviso')) {
    const t0 = Date.now(); const g = {};
    const ESC = [
      { n: 'SIN sexo, diametro AP 39 (entre 38 y 40)', sexo: '', c: { ai_diam: '39' } },
      { n: 'SIN sexo, diametro AP 37 (normal en los dos)', sexo: '', c: { ai_diam: '37' } },
      { n: 'SIN sexo, diametro AP 45 (dilatada en los dos)', sexo: '', c: { ai_diam: '45' } },
      { n: 'CON sexo M, diametro AP 39', sexo: 'M', c: { ai_diam: '39' } },
      { n: 'CON sexo F, diametro AP 39', sexo: 'F', c: { ai_diam: '39' } },
      { n: 'SIN sexo, DDVI 55 (entre 52 y 58)', sexo: '', c: { ddfvi: '55' } },
      { n: 'SIN sexo, DDVI 50 (normal en los dos)', sexo: '', c: { ddfvi: '50' } },
      { n: 'SIN sexo, DSVI 37 (entre 35 y 40)', sexo: '', c: { dsfvi: '37' } },
      { n: 'SIN sexo, septum 10 (entre 9 y 10)', sexo: '', c: { siv: '10' } },
      { n: 'SIN sexo, pared 10', sexo: '', c: { ppvi: '10' } },
      { n: 'SIN sexo, FEVI 40 (el criterio no distingue sexo)', sexo: '', c: { fevi: '40' } },
      { n: 'SIN sexo, masa entre 95 y 115', sexo: '', c: { ddfvi: '50', siv: '11', ppvi: '11' } },
      { n: 'SIN sexo, VDFVI 130 idx 65 (entre 61 y 74)', sexo: '', c: { vdfvi: '130' } },
      { n: 'SIN sexo, VSFVI 56 idx 28 (entre 24 y 31)', sexo: '', c: { vsfvi: '56' } },
      { n: 'SIN sexo, cuatro a la vez', sexo: '', c: { ai_diam: '39', ddfvi: '55', dsfvi: '37', vdfvi: '130' } },
      { n: 'SIN sexo y SIN NINGUN dato', sexo: '', c: {} },
      { n: 'valor NO binario en el sexo, diametro AP 39', sexo: 'X', c: { ai_diam: '39' }, noBin: true },
    ];
    for (const E of ESC) {
      try {
        if (E.noBin) {
          await montar(E.c, { sexo: '' });
          /* El `<select>` no ofrece un valor no binario: se fuerza por valor Y SE DECLARA, que es
             el unico gesto de estas escenas que no es una tecla ni un clic. Es el camino por el
             que llega un estudio importado con otro vocabulario. */
          await ev("(function(){ var e=document.getElementById('sexo'); var o=document.createElement('option'); o.value='X'; o.textContent='X'; e.appendChild(o); e.value='X'; e.dispatchEvent(new Event('change',{bubbles:true})); return e.value })()");
          await ev('(function(){ try { calcVI(); calcAI() } catch(e) {} return 1 })()');
        } else {
          await montar(E.c, { sexo: E.sexo });
          await ev('(function(){ try { calcVI(); calcAI() } catch(e) {} return 1 })()');
        }
        g[E.n] = { aviso: await J('JSON.stringify(window.__P.avisoSexo())'),
                   cambian: await J('JSON.stringify((typeof aiviSexoCambian === "function") ? aiviSexoCambian() : "SIN FN")'),
                   /* el aviso NO va al papel: se mide en los tres estilos y en el PPT */
                   inf: await J("JSON.stringify(window.__P.informe('estandar'))") };
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push('aviso ' + E.n + ': ' + e.message); }
    }
    /* El aviso no sobrevive a «Nuevo estudio», y el texto no entra al informe ni al EN SUMA. */
    try {
      await montar({ ai_diam: '39' }, { sexo: '' });
      const antes = await J('JSON.stringify(window.__P.avisoSexo())');
      await ev('window.__P.limpiar()');
      g.nuevoEstudio = { antes: antes, despues: await J('JSON.stringify(window.__P.avisoSexo())') };
      await montar({ ai_diam: '39' }, { sexo: '' });
      const r = await J("JSON.stringify(window.__P.informe('narrativo'))");
      g.enPapel = { inf: String(r.inf || '').indexOf('Falta el sexo') > -1,
                    suma: String(r.suma || '').indexOf('Falta el sexo') > -1 };
    } catch (e) { g.ABORTO2 = e.message; abortos.push('aviso cierre: ' + e.message); }
    out.grupos.aviso = g; parcial('aviso', t0);
  }

  /* ── fevi: los cuatro tramos y sus bordes exactos, con UN solo dueno ── */
  if (corre('fevi')) {
    const t0 = Date.now(); const g = {};
    const VAL = ['29', '30', '39', '40', '41', '49', '50', '51'];
    for (const f of VAL) {
      const k = 'fevi=' + f;
      try {
        await montar({ fevi: f, ddfvi: '50' }, { sexo: 'M' });
        await ev('(function(){ try { calcVI() } catch(e) {} return 1 })()');
        g[k] = {
          capsula: await ev("window.__P.txt('#fevi-interp')"),
          duenio: await ev('(function(){ try { var c = feviClasificar(' + f + '); return c ? (c.clave + "|" + c.adj + "|" + c.rango) : "null" } catch(e){ return "EXC" } })()'),
          simp: await ev('(function(){ try { var c = _simpClasificar(' + f + '); return c.txt + "|" + c.col } catch(e){ return "EXC" } })()'),
          labCat: await ev('(function(){ try { var c = feviClasificar(' + f + '); return c ? c.rango : "null" } catch(e){ return "EXC" } })()'),
          inf: await J("JSON.stringify(window.__P.lineaVI('estandar'))"),
          narr: await J("JSON.stringify(window.__P.lineaVI('narrativo'))"),
          conc: await J("JSON.stringify(window.__P.lineaVI('conciso'))"),
        };
      } catch (e) { g[k] = { ABORTO: e.message }; abortos.push('fevi ' + k + ': ' + e.message); }
    }
    /* El sexo no cambia la categoria de la FEVI en ninguna escena: es el control negativo del
       criterio, que no distingue sexo. */
    try {
      const porSexo = {};
      for (const sx of ['M', 'F', '']) {
        await montar({ fevi: '45', ddfvi: '50' }, { sexo: sx });
        await ev('(function(){ try { calcVI() } catch(e) {} return 1 })()');
        porSexo[sx || 'SIN'] = await ev("window.__P.txt('#fevi-interp')");
      }
      g.porSexo = porSexo;
      /* Las bandas de dibujo tienen que coincidir con el dueno en TODO el dominio: una barra que
         pinte una banda distinta de la que el informe publica es la copia que se desincroniza. */
      g.bandasVsDuenio = await J(`JSON.stringify((function(){
        var mal = [];
        for (var f = 10; f <= 80; f += 0.5) {
          var c = feviClasificar(f); if (!c) continue;
          var esp = (c.clave === 'preservada') ? 'normal' : c.clave;
          var b = null;
          for (var i = 0; i < EV_BANDAS_REF.fevi.length; i++) {
            var x = EV_BANDAS_REF.fevi[i];
            if (f >= x.desde && f <= x.hasta) { b = x.k; break } }
          if (b !== esp) mal.push({ f: f, duenio: esp, banda: b });
        }
        return { n: mal.length, casos: mal.slice(0, 12),
                 bandas: EV_BANDAS_REF.fevi.map(function(x){ return x.k + ' ' + x.desde + '-' + x.hasta }) } })())`);
      /* Censo: ningun lugar del archivo vuelve a comparar la FEVI contra un 40 o un 30 pelados. */
      g.copias = await J(`JSON.stringify((function(){
        var t = document.documentElement.innerHTML, out = [];
        ['fevi >= 40', 'fevi >= 30', 'f>=40', 'f >= 40'].forEach(function(p){
          var n = 0, i = 0;
          while ((i = t.indexOf(p, i)) >= 0) { n++; i += p.length }
          if (n) out.push({ patron: p, n: n }) });
        return out })())`);
    } catch (e) { g.ABORTO2 = e.message; abortos.push('fevi sexo: ' + e.message); }
    out.grupos.fevi = g; parcial('fevi', t0);
  }

  /* ── masa: el 115 y el 95 EXACTOS, y las bandas sin huecos ni solapes ── */
  if (corre('masa')) {
    const t0 = Date.now(); const g = {};
    /* La masa de Devereux con DDVI 50, SIV y PP iguales, sobre una superficie corporal de 2,00:
       se busca por biseccion el par que deja la masa indexada en el valor exacto pedido. */
    const PAR = { 95: null, 96: null, 115: null, 116: null };
    try {
      await montar({ ddfvi: '50' }, { sexo: 'M' });
      for (const obj of Object.keys(PAR)) {
        let lo = 5, hi = 20, best = null;
        for (let i = 0; i < 60; i++) {
          const mid = (lo + hi) / 2;
          const idx = await ev('(function(){ var dd=50, t=' + mid + ';'
            + ' var mm = 0.8*(1.04*((dd/10+t/10+t/10)**3-(dd/10)**3))+0.6;'
            + ' return Math.round(mm/2.0) })()');
          if (idx === +obj) { best = mid; break }
          if (idx < +obj) lo = mid; else hi = mid;
        }
        PAR[obj] = best;
      }
      g.pares = PAR;
      for (const sx of ['M', 'F', '']) {
        for (const obj of Object.keys(PAR)) {
          const k = 'sexo=' + (sx || 'SIN') + ' masaIdx=' + obj;
          if (PAR[obj] == null) { g[k] = { ABORTO: 'no se encontro el par' }; continue }
          await montar({ ddfvi: '50', siv: String(PAR[obj]), ppvi: String(PAR[obj]) }, { sexo: sx });
          await ev('(function(){ try { calcVI() } catch(e) {} return 1 })()');
          g[k] = { vi: await J('JSON.stringify(window.__P.vi())'),
                   geom: await ev('(function(){ try { return String(calcGeometriaVI(' + obj + ', 0.30, '
                     + JSON.stringify(sx) + ')) } catch(e){ return "EXC" } })()'),
                   sev: await ev('(function(){ try { return String(hviSeveridad(' + obj + ', '
                     + JSON.stringify(sx) + ')) } catch(e){ return "EXC" } })()'),
                   inf: await J("JSON.stringify(window.__P.lineaVI('estandar'))") };
        }
      }
      /* Las bandas, sondeadas de punta a punta: ninguna masa entre 40 y 200 puede quedar sin
         categoria ni con dos. El hueco se mide comparando el dueño de la normalidad contra el
         dueño de la gravedad, que son dos funciones distintas. */
      g.huecos = await J(`JSON.stringify((function(){
        var out = { M: [], F: [] };
        ['M','F'].forEach(function(sx){
          for (var m = 40; m <= 200; m++) {
            var geo = calcGeometriaVI(m, 0.30, sx);
            var sev = hviSeveridad(m, sx);
            var hip = String(geo).indexOf('Hipertrofia') === 0;
            if (hip && !sev) out[sx].push({ m: m, caso: 'hipertrofia SIN gravedad' });
            if (!hip && sev)  out[sx].push({ m: m, caso: 'gravedad SIN hipertrofia' });
          } });
        return out })())`);
    } catch (e) { g.ABORTO = e.message; abortos.push('masa: ' + e.message); }
    out.grupos.masa = g; parcial('masa', t0);
  }

  /* ── tarjeta: las tres tarjetas i (AI, VI y geometria) con sexo y SIN sexo. Lo que DICEN y lo
     que DIBUJAN, por separado: un grafico perfecto con el texto equivocado pasa una lectura que
     solo mire el SVG, y al reves. ── */
  if (corre('tarjeta')) {
    const t0 = Date.now(); const g = {};
    const ESC = { ai_diam: '39', ai_area: '19', ai_vol: '80', ddfvi: '53', dsfvi: '36',
                  vdfvi: '124', vsfvi: '50', fevi: '40', siv: '10', ppvi: '10' };
    for (const sx of ['M', 'F', '']) {
      for (const cl of ['ai-card', 'vi-card', 'vi-geo']) {
        const k = 'sexo=' + (sx || 'SIN') + ' ' + cl;
        try {
          await montar(ESC, { sexo: sx });
          await ev('(function(){ try { calcVI() } catch(e) {} return 1 })()');
          const b = await J('JSON.stringify(window.__P.hayBtn(' + JSON.stringify(cl) + '))');
          const ab = await J('JSON.stringify(window.__P.abrirTarjeta(' + JSON.stringify(cl) + '))');
          const le = await J('JSON.stringify(window.__P.leerTarjeta())');
          await ev('(function(){ var b=document.querySelector(' + JSON.stringify('[data-vinfo="' + cl + '"]') + '); if(b) b.click(); return 1 })()');
          g[k] = { btn: b, abrir: ab, cerrada: await ev('window.__P.cerrarTarjeta()'),
                   barras: le.barras, puntos: le.puntos, cortes: le.cortes, cat: le.cat,
                   avisos: le.avisos, fuentes: le.fuentes, nSvg: le.nSvg, scroll: le.scroll,
                   tit: le.tit };
        } catch (e) { g[k] = { ABORTO: e.message }; abortos.push('tarjeta ' + k + ': ' + e.message); }
      }
    }
    out.grupos.tarjeta = g; parcial('tarjeta', t0);
  }

  /* ── refs: las dos entradas de Referencias, con los dos sexos siempre ── */
  if (corre('refs')) {
    const t0 = Date.now(); const g = {};
    try {
      await montar({}, { sexo: '' });
      for (const id of ['ai', 'vi2']) g[id] = await J('JSON.stringify(window.__P.refs(' + JSON.stringify(id) + '))');
    } catch (e) { g.ABORTO = e.message; abortos.push('refs: ' + e.message); }
    out.grupos.refs = g; parcial('refs', t0);
  }

  /* ── pdf: el PDF del informe GENERADO DE VERDAD en las SEIS plantillas, el PPT y el
     Laboratorio por sus funciones duenas ── */
  if (corre('pdf')) {
    const t0 = Date.now(); const g = {};
    const ESC = [
      { n: 'vacio', c: {}, sexo: '' },
      { n: 'varon cargado', sexo: 'M',
        c: { ai_vol: '98', ai_diam: '44', ai_area: '25', fevi: '55', ddfvi: '50', siv: '12',
             ppvi: '11', dsfvi: '34', vdfvi: '150', vsfvi: '70', onda_e: '90', onda_a: '60',
             e_sep: '6', e_lat: '8', vmax_it: '3.0', tapse: '18' } },
      { n: 'mujer cargada', sexo: 'F',
        c: { ai_vol: '84', ai_diam: '39', fevi: '40', ddfvi: '53', siv: '10', ppvi: '10',
             dsfvi: '36', vdfvi: '124', vsfvi: '50' } },
    ];
    const PL = ['clasico', 'moderno', 'minimalista', 'academico', 'compacto', 'elegante'];
    for (const E of ESC) {
      try {
        await montar(E.c, { sexo: E.sexo, vci: '>50' });
        await ev('(function(){ try { calcVI(); calcAI() } catch(e) {} return 1 })()');
        const o = { informe: await J("JSON.stringify(window.__P.informe('estandar'))") };
        for (const pl of PL) {
          const r = await J('JSON.stringify(window.__P.pdf(' + JSON.stringify(pl) + '))');
          /* Se guarda el conteo y las lineas de texto, no el PDF: lo que hay que comparar es
             que ninguna plantilla cambie de envoltorio y que las celdas digan lo mismo. */
          o['pdf_' + pl] = { err: r.err, nTextos: r.nTextos, nFigs: r.nFigs,
            /* ⚠️ EL ROTULO Y LA REFERENCIA DE UNA FILA SON DOS doc.text DISTINTOS —la leccion
               que la tanda F ya tiene escrita— asi que un filtro por rotulo NO ve el cambio de la
               referencia impresa. Se guardan TODOS los textos SIN su posicion: un cambio de
               maquetacion mueve la y de todos y esconde el de contenido. */
            textos: (r.textos || []).map(function (t) { var q = t.lastIndexOf("|");
              return q < 0 ? t : t.slice(q + 1) }) };
        }
        o.lab = await J(`JSON.stringify((function(){
          var c = window.__P.camposCrudos();
          var inf2 = { id:'p1', fecha:'2026-10-16', nombre:'X', campos:c,
                       informe_texto: c.informe_texto || '', en_suma: c.en_suma || '' };
          var f = function(n, a){ try { return String(window[n].apply(null, a)) } catch(e){ return 'EXC' } };
          return { geom: f('_labGeomCat', [inf2]), diast: f('_labDiastGrado', [inf2]),
                   lavi: f('_labLavi', [inf2]), fevi: f('_labFevi', [inf2]) } })())`);
        g[E.n] = o;
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push('pdf ' + E.n + ': ' + e.message); }
    }
    out.grupos.pdf = g; parcial('pdf', t0);
  }

  /* ── maqueta: el aviso y las tres tarjetas a seis anchos por dos temas, con el COLOR REAL
     resuelto y sin scroll horizontal de la pagina ── */
  if (corre('maqueta')) {
    const t0 = Date.now(); const g = {};
    const VP = [[1200,700],[1440,800],[1920,1080],[768,1024],[390,844],[360,740]];
    for (const [w, h] of VP) {
      for (const claro of [false, true]) {
        const k = w + 'x' + h + (claro ? ' claro' : ' oscuro');
        try {
          await cdp.send('Emulation.setDeviceMetricsOverride',
            { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 }, sessionId);
          const puesto = await ev('window.__P.temaClaro(' + (claro ? 'true' : 'false') + ')');
          if (puesto !== claro) throw new Error('el tema no quedo: light-mode=' + puesto);
          await montar({ ai_diam: '39', ddfvi: '55' }, { sexo: '' });
          await ev('(function(){ try { calcVI(); calcAI() } catch(e) {} return 1 })()');
          await ev('JSON.stringify(window.__P.despejar())');
          const av = await J('JSON.stringify(window.__P.avisoSexo())');
          /* El aviso NO puede desplazar un campo ni taparlo: se mide el rect del primer input de
             la pestana con el aviso puesto y sin el. */
          const campo = await J("JSON.stringify(window.__P.geo('ai_diam'))");
          const sc = await J('JSON.stringify(window.__P.scrollH())');
          /* Que la linea sea ALCANZABLE y no la tape otro nodo: el centro del enlace. */
          const alc = await J(`JSON.stringify((function(){
            var a = document.querySelector('#aivi-sexo-aviso a');
            if (!a) return { hay:false };
            var r = a.getBoundingClientRect();
            if (r.width === 0) return { hay:true, geo:false };
            var cx = r.left + r.width/2, cy = r.top + r.height/2;
            if (cy < 0 || cy > innerHeight) return { hay:true, fuera:true };
            var e = document.elementFromPoint(cx, cy);
            return { hay:true, blanco: e ? (e.tagName + (e.id ? '#' + e.id : '')) : 'NADA',
                     ok: !!e && (e === a || a.contains(e)) } })())`);
          g[k] = { aviso: av, campo: campo, scroll: sc, enlace: alc,
                   hScroll: sc.sw > sc.cw };
        } catch (e) { g[k] = { ABORTO: e.message }; abortos.push('maqueta ' + k + ': ' + e.message); }
      }
    }
    try { await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
          await ev('window.__P.temaClaro(false)') } catch (e) {}
    out.grupos.maqueta = g; parcial('maqueta', t0);
  }

  /* ── controles: lo que esta tanda NO toca. Informe en los tres estilos, EN SUMA, los ocho
     grados con sus pastillas, la diastolica, el HFA-PEFF, el token del Laboratorio, la fila del
     Excel CLAVE POR CLAVE y el conteo de campos del estudio. ── */
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

