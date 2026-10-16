#!/usr/bin/env node
/**
 * _probe_m.mjs — sonda A/B de SOLO LECTURA de la tanda «M» (2026-10-16): las tarjetas i de
 * AD/VCI, del VENTRICULO DERECHO y de la AORTA, sus fichas del registro y sus entradas de
 * Referencias.
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
             texto: String(c.textContent||'').replace(/\\s+/g, ' ').trim(),
             puntos: puntos, barras: barras, cortes: cortes, cuad: cuad, cat: cat,
             fuentes: fu, avisos: av,
             nSvg: c.querySelectorAll('svg').length,
             alturas: Array.prototype.slice.call(c.querySelectorAll('.ev-bl')).map(function(e){
               var r = e.getBoundingClientRect();
               var hijos = Array.prototype.slice.call(e.children).map(function(x){
                 return x.tagName + ':' + Math.round(x.getBoundingClientRect().height) });
               return Math.round(r.height) + ' [' + hijos.join(' ') + ']' }),
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

  /* ══ TANDA M ══ Lo que las tres zonas publican HOY en la pantalla. Se lee por id y no por
     posicion: un cuadro que gana una fila no puede correr la lectura. */
  vd() {
    var g = function(id){ var e = document.getElementById(id);
      return e ? String(e.textContent||'').replace(/\\s+/g,' ').trim() : 'NO EXISTE' };
    var vis = function(id){ var e = document.getElementById(id);
      return e ? getComputedStyle(e).display : 'NO EXISTE' };
    return { tam: g('vd-tam'), tapse: g('tapse-interp'), sp: g('sprime-interp'),
             tei: g('vd-tei-interp'), teiAviso: g('vd-tei-aviso'), fevd: g('fevd-interp'),
             vdvi: g('vd-vi-interp'), pared: g('vd-pared-interp'), qp: g('vd-qp-interp'),
             fac: g('fac-interp'), facVal: window.__P.val('vd_fac'), tap: g('tap-interp'),
             visFevd: vis('row-fevd-interp'), visFac: vis('row-fac-interp'),
             visVdvi: vis('row-vd-vi-interp'),
             marcaPared: g('vd_pared-marca'), marcaTei: g('vd_tei-marca'),
             marcaAp: g('ip_ap_diam-marca') } },
  ad() {
    var g = function(id){ var e = document.getElementById(id);
      return e ? String(e.textContent||'').replace(/\\s+/g,' ').trim() : 'NO EXISTE' };
    return { area: g('ad-interp'), pmad: g('pmad-interp'), pmadVal: window.__P.val('pmad') } },
  ao() {
    var g = function(id){ var e = document.getElementById(id);
      return e ? String(e.textContent||'').replace(/\\s+/g,' ').trim() : 'NO EXISTE' };
    return { sin: g('ao-interp'), st: g('ao-st-interp'), tub: g('ao-tub-interp'),
             cay: g('ao-cay-interp'), desc: g('ao-desc-interp') } },

  /* Las lineas de cada zona en el informe, aisladas: comparar el informe ENTERO entre escenas
     mezcla la diastolica y el HFA-PEFF, que SI tienen que moverse con estos campos. */
  lineaVD(est) {
    var r = window.__P.informe(est);
    var ls = String(r.inf || '').split(String.fromCharCode(10))
      .filter(function(l){ return /[Vv]entr[ií]culo derecho|VD|TAPSE|FAC|aur[ií]cula derecha|cava/.test(l) });
    var ss = String(r.suma || '').split(String.fromCharCode(10))
      .filter(function(l){ return /VD|HVD|AD |cava/.test(l) });
    return { inf: ls, suma: ss } },
  lineaAo(est) {
    var r = window.__P.informe(est);
    var ls = String(r.inf || '').split(String.fromCharCode(10))
      .filter(function(l){ return /[Aa]orta|a[oó]rtic|[Rr]a[ií]z/.test(l) });
    var ss = String(r.suma || '').split(String.fromCharCode(10))
      .filter(function(l){ return /[Aa]ort/.test(l) });
    return { inf: ls, suma: ss } },

  /* El nomograma, por su dueno. CENTINELA: contra HEAD no existe. */
  nomo(edad, bsa, diamMm) {
    if (typeof window.aorNomoLectura !== 'function') return { err:'SIN aorNomoLectura' };
    try { var r = window.aorNomoLectura(edad, bsa, diamMm);
      return { g: r.g ? r.g.id : null, rot: r.g ? r.g.rot : null,
               banda: r.banda ? { esp:+r.banda.esp.toFixed(3), lo:+r.banda.lo.toFixed(3), hi:+r.banda.hi.toFixed(3) } : null,
               cm: r.cm, estado: r.estado, fueraRango: r.fueraRango, sinEdad: r.sinEdad } }
    catch (e) { return { err:'EXC ' + String(e && e.message) } } },
  nomoTabla() {
    if (typeof window.AOR_NOMO === 'undefined') return { err:'SIN AOR_NOMO' };
    return { z: window.AOR_NOMO_Z, g: window.AOR_NOMO.map(function(x){
      return { id:x.id, rot:x.rot, a:x.a, b:x.b, see:x.see, bsaMin:x.bsaMin, bsaMax:x.bsaMax,
               edadMax: (x.edadMax === Infinity ? 'inf' : x.edadMax) } }) } },

  /* La franja del PPT. El clinico exige un estudio guardado y dos modales encadenados: lo que
     se mide es _pptEnSuma, que es la funcion que arma su texto. */
  ppt() {
    if (typeof _pptEnSuma !== 'function') return 'SIN FN';
    try { return String(_pptEnSuma()).replace(/\\s+/g,' ').trim().slice(0, 600) } catch (e) { return 'EXC: ' + e.message } },

  /* Una entrada de Referencias: se abre con su control real y se lee lo que quedo pintado. */
  abrirRef(id) {
    var h = document.querySelector('[onclick*="toggleRef(' + String.fromCharCode(39) + id + String.fromCharCode(39) + '"]');
    if (!h) return { err:'NO EXISTE ENCABEZADO ref-' + id };
    try { showTab('refs') } catch (e) {}
    var c = document.getElementById('ref-' + id);
    if (!c) return { err:'NO EXISTE ref-' + id };
    if (getComputedStyle(c).display === 'none') h.click();
    return { ok: getComputedStyle(c).display !== 'none' } },
  leerRef(id) {
    var c = document.getElementById('ref-' + id);
    if (!c) return { err:'NO EXISTE ref-' + id };
    var cuerpo = document.getElementById('ref-' + id + '-cuerpo');
    var filas = Array.prototype.slice.call(c.querySelectorAll('.ev-tabla tr'))
      .map(function(tr){ return Array.prototype.slice.call(tr.children)
        .map(function(td){ return String(td.textContent||'').trim() }).join(' | ') });
    var bib = Array.prototype.slice.call(c.querySelectorAll('[data-ev-bib]'))
      .map(function(e){ return String(e.textContent||'').trim() });
    var barras = Array.prototype.slice.call(c.querySelectorAll('[data-ev-barra]'))
      .map(function(e){ return e.getAttribute('data-ev-barra') });
    var puntos = Array.prototype.slice.call(c.querySelectorAll('[data-ev-punto]')).length;
    return { display: getComputedStyle(c).display, hayCuerpo: !!cuerpo,
             nFilas: filas.length, filas: filas, bib: bib, barras: barras, puntos: puntos,
             nSvg: c.querySelectorAll('svg').length,
             texto: String(c.textContent||'').replace(/\\s+/g,' ').trim().slice(0, 2600) } },

  /* Oyentes y nodos, para el ciclo de veinte aperturas. */
  espiarOyentes() {
    if (window.__oy) return window.__oy.n;
    var o = EventTarget.prototype.addEventListener; window.__oy = { n: 0 };
    EventTarget.prototype.addEventListener = function(){ window.__oy.n++; return o.apply(this, arguments) };
    return 0 },
  oyentes() { return window.__oy ? window.__oy.n : -1 },
  almacen() {
    var k = [];
    try { for (var i = 0; i < localStorage.length; i++) k.push(localStorage.key(i)) } catch (e) {}
    var s = [];
    try { for (var j = 0; j < sessionStorage.length; j++) s.push(sessionStorage.key(j)) } catch (e) {}
    return { local: k.filter(function(x){ return /ev|vinfo|aor|nomo|vd-|ad-/i.test(x) }),
             session: s.filter(function(x){ return /ev|vinfo|aor|nomo/i.test(x) }),
             nLocal: k.length, nSession: s.length } },

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
    await ev(`(function(){ ['ai','vi','aorta','vd','ad'].forEach(function(k){
      var n = document.getElementById('sacc-' + k);
      if (n && getComputedStyle(n.querySelector('.sacc-body')).display === 'none') {
        try { secToggle(k) } catch (e) {} } }); return 1 })()`);
    for (const [id, val] of Object.entries(campos || {})) await tipear(id, val);
    if (opts.extra) for (const [id, val] of Object.entries(opts.extra)) await tipear(id, val);
    await ev('(function(){ try { calcAI(); calcVD(); calcAD(); calcPmAD(); calcAorta() } catch(e) {} return 1 })()');
  }

  const out = { arbol: FARG, md5_antes: antes, listo, grupos: {}, abortos };

  /* Salida parcial por grupo: un grupo que corre a ciegas no se puede diagnosticar, que es la
     leccion del `ident` de la tanda J (65 minutos sin escribir una linea). */
  const parcial = (g, t0) => process.stderr.write(
    '  [' + g + '] listo en ' + Math.round((Date.now() - t0) / 1000) + ' s\n');


  /* ══ ESCENAS COMPARTIDAS ══════════════════════════════════════════════════ */
  const ANCLA = { 'ad-card': 'ad_area', 'vd-tam-card': 'vd_bas', 'vd-fun-card': 'tapse',
                  'ao-card': 'ao_sin', 'ai-card': 'ai_vol', 'vi-card': 'ddfvi' };
  async function tarjeta(clave, campos, opts) {
    await montar(campos, opts || {});
    /* El boton vive en el cuerpo de un acordeon, dentro de una pestana: sin abrir las dos, el
       boton existe y mide 0 x 0 y la tarjeta se niega a anclarse —que es lo correcto—. Se abre
       por un CAMPO de la misma seccion, que es lo que `abrirPara` sabe hacer. */
    const an = ANCLA[clave];
    if (an) {
      const ap = await J(`JSON.stringify(window.__P.abrirPara(${JSON.stringify(an)}))`);
      if (!ap.ok) return { abrir: { err: 'NO SE PUDO ABRIR LA SECCION de ' + an + ' ' + JSON.stringify(ap) } };
    }
    const abre = await J(`JSON.stringify(window.__P.abrirTarjeta(${JSON.stringify(clave)}))`);
    if (abre.err) return { abrir: abre };
    const leido = await J('JSON.stringify(window.__P.leerTarjeta())');
    await ev(`(function(){ var b = document.querySelector('[data-vinfo="' + ${JSON.stringify(clave)} + '"]'); if (b) b.click(); return 1 })()`);
    return { abrir: abre, card: leido };
  }

  /* ── registro: las fichas, el sondeo de los duenos y la tabla de nomogramas ──────────── */
  if (corre('registro')) {
    const t0 = Date.now(); const g = {};
    try {
      await montar({}, { sexo: 'M' });
      g.reg     = await J('JSON.stringify(window.__P.registro())');
      g.cortesM = await J("JSON.stringify(window.__P.cortesDeDuenio('M'))");
      g.nomo    = await J('JSON.stringify(window.__P.nomoTabla())');
    } catch (e) { g.ABORTO = e.message; abortos.push('registro: ' + e.message); }
    out.grupos.registro = g; parcial('registro', t0);
  }

  /* ── advci: la tarjeta de la auricula derecha y la vena cava ───────────────────── */
  if (corre('advci')) {
    const t0 = Date.now(); const g = {};
    const ESC = [
      { n: 'AD normal 15 cm2 + VCI 18 con colapso', c: { ad_area: '15' }, vci: '>50', vciDiam: '18' },
      { n: 'AD en el borde 18 cm2',                 c: { ad_area: '18' }, vci: '>50', vciDiam: '18' },
      { n: 'AD 19 cm2 — dilatada',                  c: { ad_area: '19' }, vci: '>50', vciDiam: '18' },
      { n: 'AD 26 cm2 + VCI 24 sin colapso',        c: { ad_area: '26' }, vci: '<50', vciDiam: '24' },
      { n: 'VCI 20 sin colapso (indeterminada)',    c: { ad_area: '15' }, vci: '<50', vciDiam: '20' },
      { n: 'VCI 22 con colapso (indeterminada)',    c: { ad_area: '15' }, vci: '>50', vciDiam: '22' },
      { n: 'VCI en el borde 21 con colapso',        c: { ad_area: '15' }, vci: '>50', vciDiam: '21' },
      { n: 'sin ningun dato',                       c: {} },
    ];
    for (const E of ESC) {
      try {
        const r = await tarjeta('ad-card', E.c, { sexo: 'M', vci: E.vci, vciDiam: E.vciDiam });
        g[E.n] = Object.assign(r, { pantalla: await J('JSON.stringify(window.__P.ad())') });
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push('advci ' + E.n + ': ' + e.message); }
    }
    out.grupos.advci = g; parcial('advci', t0);
  }

  /* ── vd: las dos tarjetas del ventriculo derecho ────────────────────────────── */
  if (corre('vd')) {
    const t0 = Date.now(); const g = {};
    const NORM = { vd_bas: '35', vd_mid: '28', vd_long: '70', vd_pared: '3',
                   tapse: '22', s_prime: '12', vd_area_d: '20', vd_area_s: '11',
                   fevd: '55', vd_tei: '0.40', tvia: '130' };
    const MAL  = { vd_bas: '48', vd_mid: '40', vd_long: '95', vd_pared: '8',
                   tapse: '14', s_prime: '8', vd_area_d: '20', vd_area_s: '16',
                   fevd: '38', vd_tei: '0.70', tvia: '80' };
    const BORDE= { vd_bas: '41', vd_mid: '35', vd_long: '86', vd_pared: '5',
                   tapse: '17', s_prime: '9.5', vd_area_d: '20', vd_area_s: '13',
                   fevd: '45', vd_tei: '0.55', tvia: '105' };
    const ESC = [
      { k: 'vd-tam-card', n: 'TAMANO normal',  c: NORM },
      { k: 'vd-tam-card', n: 'TAMANO alterado', c: MAL },
      { k: 'vd-tam-card', n: 'TAMANO en los bordes', c: BORDE },
      { k: 'vd-tam-card', n: 'TAMANO sin datos', c: {} },
      { k: 'vd-fun-card', n: 'FUNCION normal',  c: NORM },
      { k: 'vd-fun-card', n: 'FUNCION alterada', c: MAL },
      { k: 'vd-fun-card', n: 'FUNCION en los bordes', c: BORDE },
      { k: 'vd-fun-card', n: 'FUNCION FAC severa', c: Object.assign({}, MAL, { vd_area_d: '20', vd_area_s: '16.5' }) },
      { k: 'vd-fun-card', n: 'FUNCION sin datos', c: {} },
    ];
    for (const E of ESC) {
      try {
        const r = await tarjeta(E.k, E.c, { sexo: 'M' });
        g[E.k + ' · ' + E.n] = Object.assign(r, { pantalla: await J('JSON.stringify(window.__P.vd())') });
      } catch (e) { g[E.k + ' · ' + E.n] = { ABORTO: e.message }; abortos.push('vd ' + E.n + ': ' + e.message); }
    }
    out.grupos.vd = g; parcial('vd', t0);
  }

  /* ── aorta: el grafico por edad y superficie corporal ──────────────────────── */
  if (corre('aorta')) {
    const t0 = Date.now(); const g = {};
    /* Los cinco bordes de edad que pide la orden, con la misma superficie corporal y el mismo
       diametro: lo unico que cambia es el grafico que le toca. */
    const ESC = [
      { n: 'edad 19 — grafico A', c: { edad: '19', ao_sin: '34' } },
      { n: 'edad 20 — grafico B', c: { edad: '20', ao_sin: '34' } },
      { n: 'edad 39 — grafico B', c: { edad: '39', ao_sin: '34' } },
      { n: 'edad 40 EXACTOS — grafico B', c: { edad: '40', ao_sin: '34' } },
      { n: 'edad 41 — grafico C', c: { edad: '41', ao_sin: '34' } },
      { n: 'DENTRO del rango esperado (50 a, 34 mm)', c: { edad: '50', ao_sin: '34' } },
      { n: 'POR ENCIMA del rango (50 a, 44 mm)',      c: { edad: '50', ao_sin: '44' } },
      { n: 'POR DEBAJO del rango (50 a, 24 mm)',      c: { edad: '50', ao_sin: '24' } },
      { n: 'DILATADA por el corte de EcoSmart (50 a, 42 mm)', c: { edad: '50', ao_sin: '42' } },
      { n: 'el borde EXACTO de 40 mm (50 a)',         c: { edad: '50', ao_sin: '40' } },
      { n: 'sin EDAD (40 mm)',                        c: { ao_sin: '40' } },
      { n: 'sin dato de aorta (50 a)',                c: { edad: '50' } },
    ];
    for (const E of ESC) {
      try {
        const r = await tarjeta('ao-card', E.c, { sexo: 'M' });
        g[E.n] = Object.assign(r, { pantalla: await J('JSON.stringify(window.__P.ao())') });
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push('aorta ' + E.n + ': ' + e.message); }
    }
    /* Sin superficie corporal, y fuera del rango que la figura dibuja. */
    for (const E of [{ n: 'sin SUPERFICIE CORPORAL', sinBsa: true, c: { edad: '50', ao_sin: '34' } }]) {
      try {
        const r = await tarjeta('ao-card', E.c, { sexo: 'M', sinBsa: true });
        g[E.n] = r;
      } catch (e) { g[E.n] = { ABORTO: e.message }; abortos.push('aorta ' + E.n + ': ' + e.message); }
    }
    /* El dueno del nomograma, sondeado directo: los cinco bordes de edad y los dos de rango. */
    const NN = {};
    for (const [et, e2] of [['19','19'],['20','20'],['39','39'],['40','40'],['41','41'],['50','50']]) {
      NN['edad ' + et] = await J(`JSON.stringify(window.__P.nomo(${JSON.stringify(e2)}, 2.0, 34))`);
    }
    NN['bsa 1.29 en C'] = await J("JSON.stringify(window.__P.nomo('50', 1.29, 34))");
    NN['bsa 1.30 en C'] = await J("JSON.stringify(window.__P.nomo('50', 1.30, 34))");
    NN['bsa 2.41 en C'] = await J("JSON.stringify(window.__P.nomo('50', 2.41, 34))");
    NN['sin edad']      = await J("JSON.stringify(window.__P.nomo('', 2.0, 34))");
    g._nomo = NN;
    out.grupos.aorta = g; parcial('aorta', t0);
  }

  /* ── refs: las tres entradas nuevas de la pestana Referencias ─────────────────── */
  if (corre('refs')) {
    const t0 = Date.now(); const g = {};
    try {
      await montar({ edad: '50', ao_sin: '34' }, { sexo: 'M' });
      for (const id of ['ad', 'vd2', 'ao2']) {
        g['abrir ' + id] = await J(`JSON.stringify(window.__P.abrirRef(${JSON.stringify(id)}))`);
        g[id] = await J(`JSON.stringify(window.__P.leerRef(${JSON.stringify(id)}))`);
      }
      /* Control negativo: las dos entradas del L no se tocan. */
      for (const id of ['ai', 'vi2']) {
        await J(`JSON.stringify(window.__P.abrirRef(${JSON.stringify(id)}))`);
        g['CTRL ' + id] = await J(`JSON.stringify(window.__P.leerRef(${JSON.stringify(id)}))`);
      }
    } catch (e) { g.ABORTO = e.message; abortos.push('refs: ' + e.message); }
    out.grupos.refs = g; parcial('refs', t0);
  }

  /* ── ciclo: veinte aperturas y cierres, nodos, oyentes y almacenamiento ──────────── */
  if (corre('ciclo')) {
    const t0 = Date.now(); const g = {};
    try {
      await montar({ ad_area: '15', vd_bas: '35', tapse: '22', edad: '50', ao_sin: '34' },
                   { sexo: 'M', vci: '>50', vciDiam: '18' });
      await ev('window.__P.espiarOyentes()');
      g.almacenAntes = await J('JSON.stringify(window.__P.almacen())');
      /* ⚠️ EL CONTEO VA JUSTO ANTES DEL BUCLE: entre medio se monto la escena, y eso repinta
         la diastolica y el HFA-PEFF, que SI agregan nodos. */
      const n0 = await ev('window.__P.nodos()'), o0 = await ev('window.__P.oyentes()');
      for (const k of ['ad-card', 'vd-tam-card', 'vd-fun-card', 'ao-card']) {
        await J(`JSON.stringify(window.__P.abrirPara(${JSON.stringify(ANCLA[k])}))`);
        for (let i = 0; i < 20; i++) {
          await ev(`(function(){ var b = document.querySelector('[data-vinfo="' + ${JSON.stringify(k)} + '"]'); if (b) { b.click(); b.click() } return 1 })()`);
        }
      }
      g.nodos = { antes: n0, despues: await ev('window.__P.nodos()') };
      g.oyentes = { antes: o0, despues: await ev('window.__P.oyentes()') };
      g.cerrada = await ev('window.__P.cerrarTarjeta()');
      g.almacenDespues = await J('JSON.stringify(window.__P.almacen())');
      g.campos = await J('JSON.stringify(Object.keys(window.__P.camposCrudos()).length)');
      g.clavesNuevas = await J(`JSON.stringify(Object.keys(window.__P.camposCrudos())
        .filter(function(k){ return /^(ev|nomo|aor)-/.test(k) }))`);
    } catch (e) { g.ABORTO = e.message; abortos.push('ciclo: ' + e.message); }
    out.grupos.ciclo = g; parcial('ciclo', t0);
  }

  /* ── maqueta: anchos y temas ───────────────────────────────────────── */
  if (corre('maqueta')) {
    const t0 = Date.now(); const g = {};
    const VP = [[1200,700],[1440,800],[1920,1080],[768,1024],[390,844],[360,740]];
    for (const [w, h] of VP) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 }, sessionId);
      for (const claro of [false, true]) {
        const tc = await ev(`window.__P.temaClaro(${claro ? 'true' : 'false'})`);
        if (tc !== claro) { g[w + 'x' + h + (claro ? ' claro' : ' oscuro')] = { ABORTO: 'el tema no quedo' }; continue; }
        try {
          await montar({ ad_area: '26', vd_bas: '48', vd_mid: '40', vd_long: '95', vd_pared: '8',
                         tapse: '14', s_prime: '8', vd_area_d: '20', vd_area_s: '16', fevd: '38',
                         vd_tei: '0.70', tvia: '80', edad: '50', ao_sin: '44' },
                       { sexo: 'M', vci: '<50', vciDiam: '24' });
          const cel = {};
          for (const k of ['ad-card', 'vd-tam-card', 'vd-fun-card', 'ao-card']) {
            /* El boton se abre por su ANCLA, igual que en el resto de los grupos: sin eso
               existe y mide 0 x 0 y la tarjeta se niega a anclarse. */
            const an = ANCLA[k];
            const ap = await J(`JSON.stringify(window.__P.abrirPara(${JSON.stringify(an)}))`);
            if (!ap.ok) { cel[k] = { abrir: { err: 'SIN SECCION ' + an } }; continue; }
            const a = await J(`JSON.stringify(window.__P.abrirTarjeta(${JSON.stringify(k)}))`);
            const l = a.err ? null : await J('JSON.stringify(window.__P.leerTarjeta())');
            const gb = a.err ? null : await J(`JSON.stringify((function(){
              var b = document.querySelector('[data-vinfo="' + ${JSON.stringify(k)} + '"]');
              var r = b.getBoundingClientRect(); var c = document.getElementById('vinfo-card');
              return { btnTop: Math.round(r.top), btnBot: Math.round(r.bottom),
                       huecoArriba: Math.round(r.top - 6 - 8), huecoAbajo: Math.round(innerHeight - 8 - (r.bottom + 6)),
                       maxH: c ? getComputedStyle(c).maxHeight : null } })())`);
            cel[k] = { abrir: a, scroll: l ? l.scroll : null, geo: gb,
                       dentro: a.err ? null : (a.top >= 0 && (a.top + a.h) <= h + 1) };
            await ev(`(function(){ var b = document.querySelector('[data-vinfo="' + ${JSON.stringify(k)} + '"]'); if (b) b.click(); return 1 })()`);
          }
          cel.pagina = await J('JSON.stringify(window.__P.scrollH())');
          g[w + 'x' + h + (claro ? ' claro' : ' oscuro')] = cel;
        } catch (e) { g[w + 'x' + h + (claro ? ' claro' : ' oscuro')] = { ABORTO: e.message }; }
      }
    }
    await ev('window.__P.temaClaro(false)');
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.grupos.maqueta = g; parcial('maqueta', t0);
  }

  /* ── captura: PNG de cada tarjeta en los dos temas ───────────────────────── */
  if (corre('captura') && DEST) {
    const t0 = Date.now(); const g = {};
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: 1200, height: 700, deviceScaleFactor: 1, mobile: false }, sessionId);
    const CAP = [
      { k: 'ad-card', n: 'advci', c: { ad_area: '26' }, vci: '<50', vciDiam: '24' },
      { k: 'vd-tam-card', n: 'vdtam', c: { vd_bas: '48', vd_mid: '40', vd_long: '95', vd_pared: '8' } },
      { k: 'vd-fun-card', n: 'vdfun', c: { tapse: '14', s_prime: '8', vd_area_d: '20', vd_area_s: '16', fevd: '38', vd_tei: '0.70', tvia: '80' } },
      { k: 'ao-card', n: 'ao19', c: { edad: '19', ao_sin: '34' } },
      { k: 'ao-card', n: 'ao30', c: { edad: '30', ao_sin: '34' } },
      { k: 'ao-card', n: 'ao50', c: { edad: '50', ao_sin: '44' } },
    ];
    for (const claro of [false, true]) {
      await ev(`window.__P.temaClaro(${claro ? 'true' : 'false'})`);
      for (const C of CAP) {
        try {
          await montar(C.c, { sexo: 'M', vci: C.vci, vciDiam: C.vciDiam });
          await J(`JSON.stringify(window.__P.abrirPara(${JSON.stringify(ANCLA[C.k])}))`);
          const a = await J(`JSON.stringify(window.__P.abrirTarjeta(${JSON.stringify(C.k)}))`);
          if (a.err) { g[C.n + (claro ? '-claro' : '-oscuro')] = a; continue; }
          /* ⚠️ EL CLIP VA EN COORDENADAS DE PAGINA aunque el nodo sea position:fixed, y con
             deviceScaleFactor en 1 para que no se interprete en pixeles de dispositivo. */
          const off = await J('JSON.stringify({ x: window.scrollX, y: window.scrollY })');
          const sh = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false,
            clip: { x: a.left + off.x - 2, y: a.top + off.y - 2, width: a.w + 4, height: a.h + 4, scale: 2 } }, sessionId);
          const f = join(DEST, 'm_' + C.n + (claro ? '_claro' : '_oscuro') + '.png');
          await writeFile(f, Buffer.from(sh.data, 'base64'));
          g[C.n + (claro ? '-claro' : '-oscuro')] = { archivo: f, w: a.w, h: a.h,
            md5: createHash('md5').update(sh.data).digest('hex').slice(0, 10) };
          await ev(`(function(){ var b = document.querySelector('[data-vinfo="' + ${JSON.stringify(C.k)} + '"]'); if (b) b.click(); return 1 })()`);
        } catch (e) { g[C.n + (claro ? '-claro' : '-oscuro')] = { ABORTO: e.message }; }
      }
    }
    await ev('window.__P.temaClaro(false)');
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.grupos.captura = g; parcial('captura', t0);
  }

  /* ── tactil: el tamano REAL de los cuatro globos con el dedo ───────────────────────
     `check_mobile.js` mide el rect del NODO sin emular puntero grueso, y `.vinfo-btn` lleva un
     @media (pointer: coarse) que lo lleva a 44 x 44. Es el precedente del L y del boton del
     «porque» de la vista 2D.
     ⚠️ `maxTouchPoints` TIENE QUE ESTAR ENTRE 1 Y 16 INCLUSO AL DESACTIVAR: con 0 el protocolo
     rechaza la llamada y la corrida muere antes de medir nada. */
  if (corre('tactil')) {
    const t0 = Date.now(); const g = {};
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }, sessionId);
    for (const dedo of [false, true]) {
      await cdp.send('Emulation.setTouchEmulationEnabled',
        { enabled: dedo, maxTouchPoints: dedo ? 5 : 1 }, sessionId);
      try {
        await montar({ ad_area: '15', vd_bas: '35', tapse: '22', edad: '50', ao_sin: '34' },
                     { sexo: 'M', vci: '>50', vciDiam: '18' });
        const m = {};
        for (const k of ['ad-card', 'vd-tam-card', 'vd-fun-card', 'ao-card', 'ai-card']) {
          await J(`JSON.stringify(window.__P.abrirPara(${JSON.stringify(ANCLA[k])}))`);
          m[k] = await J(`JSON.stringify(window.__P.hayBtn(${JSON.stringify(k)}))`);
        }
        g[dedo ? 'con dedo' : 'con mouse'] = m;
      } catch (e) { g[dedo ? 'con dedo' : 'con mouse'] = { ABORTO: e.message }; }
    }
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 }, sessionId);
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.grupos.tactil = g; parcial('tactil', t0);
  }

  /* ── controles: nada de lo que esta tanda toca puede mover una superficie firmada ───── */
  if (corre('controles')) {
    const t0 = Date.now(); const g = {};
    const CTRL = [
      { n: 'vacio', c: {}, sexo: '' },
      { n: 'escenario cargado', sexo: 'M', vci: '<50', vciDiam: '24',
        c: { ai_vol: '98', ai_diam: '44', ai_area: '25', onda_e: '90', onda_a: '60',
             e_sep: '6', e_lat: '8', vmax_it: '3.0', fevi: '55', ddfvi: '50', siv: '12',
             ppvi: '11', dsfvi: '34', vdfvi: '150', vsfvi: '70', im_vc: '7',
             vmax_ao: '4.2', gmedio_ao: '45', edad: '62',
             ad_area: '26', vd_bas: '48', vd_mid: '40', vd_long: '95', vd_pared: '8',
             tapse: '14', s_prime: '8', vd_area_d: '20', vd_area_s: '16', fevd: '38',
             vd_tei: '0.70', tvia: '80', tsvd_diametro: '25', vti_tsvd: '18',
             ao_sin: '44', ao_st: '36', ao_tub: '38', diam_cayado: '32', diam_ao_toracica: '28' } },
      { n: 'VD y aorta normales', sexo: 'F', vci: '>50', vciDiam: '16',
        c: { ad_area: '14', vd_bas: '34', vd_mid: '27', vd_long: '70', vd_pared: '3',
             tapse: '22', s_prime: '12', vd_area_d: '20', vd_area_s: '11', fevd: '58',
             vd_tei: '0.35', tvia: '130', edad: '30', ao_sin: '32', fevi: '62' } },
    ];
    for (const E of CTRL) {
      try {
        await montar(E.c, { sexo: E.sexo, vci: E.vci, vciDiam: E.vciDiam });
        g[E.n] = {
          conciso:   await J("JSON.stringify(window.__P.informe('conciso'))"),
          estandar:  await J("JSON.stringify(window.__P.informe('estandar'))"),
          narrativo: await J("JSON.stringify(window.__P.informe('narrativo'))"),
          grados:  await J('JSON.stringify(window.__P.grados())'),
          vi:      await J('JSON.stringify(window.__P.vi())'),
          ai:      await J('JSON.stringify(window.__P.ai())'),
          vd:      await J('JSON.stringify(window.__P.vd())'),
          ad:      await J('JSON.stringify(window.__P.ad())'),
          ao:      await J('JSON.stringify(window.__P.ao())'),
          excel:   await J('JSON.stringify(window.__P.excel())'),
          ppt:     await ev('window.__P.ppt()'),
          campos:  await J('JSON.stringify(window.__P.camposCrudos())'),
          pdf:     await J("JSON.stringify((function(){ var r = window.__P.pdf(); return { err:r.err, nTextos:r.nTextos, nFigs:r.nFigs, textos:r.textos } })())"),
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
