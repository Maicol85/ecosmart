#!/usr/bin/env node
/**
 * _probe_dopmitral.mjs — sonda A/B de SOLO LECTURA para las DOS partes de la tanda del
 * 2026-10-13 sobre el bloque «Doppler mitral — funcion diastolica VI»:
 *   PARTE 1 — el selector del S/D pulmonar (`venp_sd`) sin las dos opciones de legado.
 *   PARTE 2 — los 16 campos reordenados en cuatro columnas, con el Tab por columnas.
 *
 * Infraestructura calcada de scripts/_probe_bsediag.mjs (teclas y clics reales, cierre del arbol
 * de Chrome por GRUPO, cierre del aviso legal con su denominador, md5 al principio y al final).
 * NO muta index.html.
 *
 *   node scripts/_probe_dopmitral.mjs --file /tmp/index.HEAD.html > /tmp/dm.HEAD.json
 *   node scripts/_probe_dopmitral.mjs                             > /tmp/dm.NEW.json
 *
 * Grupos (--solo opciones|veredictos|tab|pos|hueco|sinc|superficies):
 *   opciones    — las <option> del S/D con el campo vacio, y un token DESCONOCIDO tratado como
 *                 campo sin cargar (selectedIndex, value, estado por corte y fila de la ventana).
 *   veredictos  — cuadro gris + ventana para las CUATRO lecturas (ASE 2025 sinusal y FA, BSE 2024
 *                 y ASE/EACVI 2016) con el vacio y con las TRES opciones que existen en los DOS
 *                 arboles. ⚠️ NO se usa ninguna opcion que HEAD no tenga: un A/B con una opcion
 *                 que el otro arbol no ofrece compara dos escenas distintas (leccion de CLAUDE.md).
 *   tab         — TECLAS Tab REALES: foco real campo por campo, con cada algoritmo y los dos
 *                 ritmos, informando los campos SIN geometria de cada combinacion.
 *   pos         — getBoundingClientRect de los 16 campos a 1200, 900, 390 y 360 px en los DOS
 *                 temas: columna, fila, desborde y superposicion.
 *   hueco       — un campo escondido con [hidden] deja su casilla VACIA y no corre a los demas.
 *   sinc        — LARS, strain de contraccion, VTI mitral, THP y AVm con teclas reales: escribir
 *                 y BORRAR en el Doppler y en AI/VI, en los dos sentidos.
 *   superficies — informe en 3 estilos, EN SUMA en 3, columnas del Excel y su fila clave por
 *                 clave, texto del PPT, grado del Laboratorio y hash de los campos guardados.
 *
 * ⚠️ DENOMINADOR. Una tabla de posiciones sobre una tarjeta colapsada da cero y parece impecable.
 * Cada grupo informa cuantos de los 16 campos tenian geometria antes de medir.
 *
 * ⚠️ LOS GRUPOS SE CORREN DE A UNO. Varios en una sola sesion de pagina se cuelgan.
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
const SOLO = arg('--solo');
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-ap-'));
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


/* Los DIECISEIS campos de la grilla del Doppler mitral, en el orden de columnas que pidio el
   medico el 13/10/2026 (columna 1 de arriba abajo, despues la 2, la 3 y la 4). Es el orden que
   tiene que tener el Tab y es el orden del marcado. */
const CAMPOS16 = [
  'onda_e', 'onda_a', 'e_sep', 'e_lat',
  'venp_dur_a', 'venp_dur_ar', 'venp_vel_ar', 'venp_sd',
  'thp', 'tde', 'triv', 'onda_l',
  'lars_dop', 'ai_strain_ct_dop', 'itv_mitral', 'avm_thp'
];

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios, y la
   barra-ese de un regex va DOBLE —dentro de un template literal se cocina a la letra ese y el
   regex termina borrando todas las eses del texto, que es un falso con pinta de medicion buena
   (scripts/check_backticks.py da la linea exacta cuando se cuela un acento grave). */
const SONDA = `
window.__P = {
  C16: ${JSON.stringify(CAMPOS16)},
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  norm(s) { return String(s == null ? '' : s).replace(/\\s+/g, ' ').trim() },
  hash(s) { var h = 5381, t = window.__P.norm(s);
    for (var i = 0; i < t.length; i++) { h = ((h * 33) ^ t.charCodeAt(i)) >>> 0 }
    return h.toString(16) },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  existe(id) { return !!document.getElementById(id) },

  revelar(id) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var abrio = [];
    for (var pase = 0; pase < 6; pase++) {
      var oculto = null, n = e;
      while (n && n.nodeType === 1) {
        if (getComputedStyle(n).display === 'none') { oculto = n; }
        n = n.parentNode;
      }
      if (!oculto) break;
      var oid = oculto.id || '';
      if (oid.indexOf('tab-') === 0) {
        try { showTab(oid.slice(4)); abrio.push(oid) } catch(x) { return { err: 'showTab ' + oid, abrio: abrio } }
      } else {
        var ctrl = null;
        if (oid) {
          var cand = Array.from(document.querySelectorAll('[onclick]')).find(function(b){
            return (b.getAttribute('onclick')||'').indexOf("'" + oid + "'") >= 0 });
          if (cand) { if (!cand.id) cand.id = '__prv_' + oid; ctrl = cand.id }
        }
        if (!ctrl) return { err: 'oculto por ' + (oid ? ('#' + oid) : ('.' + String(oculto.className||'?'))), abrio: abrio };
        return { necesitaClic: ctrl, abrio: abrio };
      }
    }
    return { abrio: abrio, ok: window.__P.vis(id) === true } },

  centro(id) { var e = document.getElementById(id); if (!e) return null;
    e.scrollIntoView({ block:'center', inline:'center' });
    var r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'nodo sin geometria' };
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) } },

  quienEsta(id, x, y) {
    var t = document.getElementById(id);
    var e = document.elementFromPoint(x, y);
    if (!e) return { enPunto: null, esElBlanco: false };
    return { enPunto: (e.id || ('<' + e.tagName.toLowerCase() + ' ' + String(e.className || '') + '>')),
             esElBlanco: !!(t && (e === t || t.contains(e) || e.contains(t))) } },

  /* ⚠️ DENOMINADOR DE ENTRADA. La tarjeta del Doppler mitral nace abierta, pero si alguna vez se
     colapsara los 16 campos quedarian SIN GEOMETRIA: la tabla de posiciones saldria vacia y el
     Tab no visitaria ninguno, que es indistinguible de «el orden esta bien». Se confirma ANTES de
     medir y se informa al lado del veredicto. */
  abrirTodo() {
    try { showTab('doppler') } catch(e) {}
    var c = document.getElementById('dop-mitral');
    if (c && getComputedStyle(c).display === 'none') c.style.display = 'block';
    var falta = window.__P.C16.filter(function(id){ return !window.__P.existe(id) });
    var sinGeo = window.__P.C16.filter(function(id){
      var e = document.getElementById(id); if (!e) return true;
      var r = e.getBoundingClientRect(); return r.width === 0 || r.height === 0 });
    return { n: window.__P.C16.length, faltan: falta, sinGeometria: sinGeo,
             algoritmo: window.__P.val('diast_algoritmo'), ritmo: window.__P.val('diast_ritmo'),
             dueno: (typeof window.diastASE2025Evaluar === 'function'),
             ok: falta.length === 0 && sinGeo.length === 0 } },

  limpiar() { try { limpiarCampos(true) } catch(e) {} return 1 },

  /* NO ES UN GESTO MEDIDO: solo para los <select> de escenario (ritmo, algoritmo, S/D). Los
     campos numericos se tipean SIEMPRE con teclas reales. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, pedido: String(valor), leido: e.value, idx: e.selectedIndex } },

  /* ══ PARTE 1 — EL SELECTOR DEL S/D ══ cada <option> con su value, su texto, su atributo hidden
     y su disabled, mas el display COMPUTADO: este archivo ya pago cuatro veces que una regla de
     autor le gana al [hidden] de la hoja del NAVEGADOR, asi que la propiedad no alcanza. */
  sdOpciones() {
    var e = document.getElementById('venp_sd');
    if (!e) return { err: 'NO EXISTE venp_sd' };
    return { n: e.options.length, value: e.value, idx: e.selectedIndex,
             ops: Array.from(e.options).map(function(o){
               return { v: o.value, t: window.__P.norm(o.textContent), hidden: !!o.hidden,
                        disabled: !!o.disabled, disp: getComputedStyle(o).display } }) } },

  /* Un token que el selector ya no ofrece. Tiene que leerse como campo SIN CARGAR: sin error,
     sin veredicto inventado, y el <select> mostrando el vacio. */
  sdToken(tok) {
    var e = document.getElementById('venp_sd');
    if (!e) return { err: 'NO EXISTE venp_sd' };
    e.value = String(tok);
    var leido = e.value, idx = e.selectedIndex;
    var est = {};
    try { est.le067 = (typeof venpSdEstado === 'function') ? venpSdEstado('le067') : 'SIN FUNCION' } catch(x) { est.le067 = 'EXC ' + x.message }
    try { est.lt1 = (typeof venpSdEstado === 'function') ? venpSdEstado('lt1') : 'SIN FUNCION' } catch(x) { est.lt1 = 'EXC ' + x.message }
    var txt;
    try { txt = (typeof venpSDTxt === 'function') ? venpSDTxt() : 'SIN FUNCION' } catch(x) { txt = 'EXC ' + x.message }
    var fila;
    try { fila = (typeof venpSdFilaVal === 'function') ? venpSdFilaVal('le067') : 'SIN FUNCION' } catch(x) { fila = 'EXC ' + x.message }
    var sufExiste = (typeof venpSdCritSuf === 'function');
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { pedido: String(tok), leido: leido, idx: idx, estado: est, etiqueta: txt,
             filaLe067: fila, sufijoExiste: sufExiste } },

  /* ══ PARTE 2 — LA POSICION DE LOS 16 CAMPOS ══ Se mide el .fg (la celda de la grilla), no el
     input: la celda es lo que la grilla coloca. Las columnas y las filas se DERIVAN agrupando por
     left y por top redondeados, asi la tabla no depende de un ancho calculado a mano. */
  posiciones() {
    var g = document.querySelector('#dop-mitral .grid-4');
    if (!g) return { err: 'NO EXISTE la grilla' };
    var gr = g.getBoundingClientRect();
    var cols = getComputedStyle(g).gridTemplateColumns;
    var datos = window.__P.C16.map(function(id){
      var e = document.getElementById(id);
      if (!e) return { id: id, err: 'NO EXISTE' };
      var fg = e.closest('.fg');
      if (!fg) return { id: id, err: 'SIN .fg' };
      var r = fg.getBoundingClientRect();
      var cs = getComputedStyle(fg);
      return { id: id, left: Math.round(r.left), top: Math.round(r.top),
               w: Math.round(r.width), h: Math.round(r.height),
               right: Math.round(r.right), bottom: Math.round(r.bottom),
               disp: cs.display,
               /* El desborde de la celda: el input o el rotulo mas anchos que su .fg. */
               desborda: Array.from(fg.children).some(function(c){
                 return c.getBoundingClientRect().right > r.right + 1 }),
               /* El texto se lee: tamanio RENDERIZADO del rotulo, no el declarado. */
               px: parseFloat(getComputedStyle(fg.querySelector('label') || fg).fontSize) } });
    var vis = datos.filter(function(d){ return !d.err && d.disp !== 'none' });
    var ejeX = [], ejeY = [];
    vis.forEach(function(d){
      if (ejeX.indexOf(d.left) < 0) ejeX.push(d.left);
      if (ejeY.indexOf(d.top) < 0) ejeY.push(d.top) });
    ejeX.sort(function(a,b){ return a-b }); ejeY.sort(function(a,b){ return a-b });
    datos.forEach(function(d){
      d.col = d.err ? null : (ejeX.indexOf(d.left) + 1) || null;
      d.fila = d.err ? null : (ejeY.indexOf(d.top) + 1) || null });
    /* SUPERPOSICION: dos celdas visibles que se cruzan en los dos ejes. Un par superpuesto es lo
       unico que caza una posicion explicita escrita dos veces. */
    var solapan = [];
    for (var i = 0; i < vis.length; i++) for (var j = i+1; j < vis.length; j++) {
      var a = vis[i], b = vis[j];
      if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1)
        solapan.push(a.id + ' x ' + b.id);
    }
    return { innerWidth: window.innerWidth, gridCols: cols,
             gridLeft: Math.round(gr.left), gridW: Math.round(gr.width),
             nColumnas: ejeX.length, nFilas: ejeY.length,
             campos: datos, visibles: vis.length, solapan: solapan,
             /* El orden VISUAL por columnas: ordenado por columna y despues por fila, tiene que
                dar la misma lista que el orden del Tab. */
             ordenVisual: vis.slice().sort(function(a,b){
               return (a.col - b.col) || (a.fila - b.fila) }).map(function(d){ return d.id }),
             /* Y el orden del MARCADO, que es el que sigue el Tab sin tabindex positivos. */
             ordenMarcado: Array.from(g.querySelectorAll('.fg')).map(function(fg){
               var c = fg.querySelector('input[id], select[id], textarea[id]');
               return c ? c.id : '(sin control)' }),
             /* Ningun tabindex POSITIVO en la grilla: con uno, el orden deja de ser el del DOM. */
             tabindexPositivos: Array.from(g.querySelectorAll('[tabindex]')).filter(function(e){
               return parseInt(e.getAttribute('tabindex'), 10) > 0 }).map(function(e){ return e.id || '?' }) } },

  /* Esconde una celda por ATRIBUTO, que es el mecanismo que la app ya usa (.fg[hidden] existe en
     la hoja). Devuelve el display computado para probar que la regla GANA. */
  ocultar(id, on) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var fg = e.closest('.fg'); if (!fg) return { err: 'SIN .fg' };
    if (on) fg.setAttribute('hidden', ''); else fg.removeAttribute('hidden');
    return { id: id, hidden: fg.hasAttribute('hidden'), disp: getComputedStyle(fg).display } },

  /* ══ EL CUADRO GRIS ══ */
  cuadro() {
    var r = window._diastResult || {};
    return { badge: window.__P.txt('dd-interp'),
             algoritmo: r.algoritmo === undefined ? null : r.algoritmo,
             texto: r.texto === undefined ? null : r.texto,
             suma: r.textoSuma === undefined ? null : r.textoSuma,
             ea: window.__P.txt('ea-val'), eprom: window.__P.txt('eprom-val'),
             ee: window.__P.txt('ee-val'), psap: window.__P.val('psap_calc') } },

  btnAlgo() {
    var b = Array.from(document.querySelectorAll('button[onclick]')).find(function(x){
      return (x.getAttribute('onclick') || '').indexOf('diastAlgoAbrir') > -1 });
    if (!b) return { err: 'NO ENCONTRE el boton del algoritmo' };
    if (!b.id) b.id = '__btnAlgo';
    return { sel: b.id, texto: window.__P.norm(b.textContent) } },
  btnCerrarAlgo() {
    var b = Array.from(document.querySelectorAll('button[onclick]')).find(function(x){
      return (x.getAttribute('onclick') || '').indexOf('diastAlgoCerrar') > -1 });
    if (!b) return { err: 'NO ENCONTRE el cierre' };
    if (!b.id) b.id = '__btnCerrarAlgo';
    return { sel: b.id } },

  /* ══ LA VENTANA ══ el estado sale de la CLASE que pinta _daFila: da-bad = criterio positivo,
     da-ok = negativo, da-na = sin dato. La fila del S/D se informa aparte. */
  ventana() {
    var ov = document.getElementById('diast-algo-overlay');
    var cu = document.getElementById('diast-algo-cuerpo');
    if (!ov || !cu) return { err: 'NO EXISTE la ventana' };
    var abierta = getComputedStyle(ov).display !== 'none';
    var filas = Array.from(cu.querySelectorAll('.da-row')).map(function(f){
      var cl = f.className || '';
      return { crit: window.__P.norm((f.querySelector('.da-crit') || {}).textContent),
               val: window.__P.norm((f.querySelector('.da-val') || {}).textContent),
               estado: cl.indexOf('da-bad') > -1 ? 'POSITIVO'
                     : cl.indexOf('da-ok') > -1 ? 'negativo' : 'sin dato' } });
    var sd = filas.filter(function(f){ return f.crit.indexOf('S/D') > -1 });
    return { abierta: abierta,
             titulo: window.__P.txt('diast-algo-titulo'),
             filas: filas, nFilas: filas.length, sd: sd,
             res: window.__P.norm((cu.querySelector('.da-res') || {}).textContent) } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      c[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },

  /* ⚠️ EL HASH DE LOS CAMPOS SIN LOS DOS <textarea>. Los dos textos tienen id, asi que el hash
     crudo cambia en toda escena cuya frase cambia y no dice NADA sobre los campos del estudio. */
  camposHash() {
    var c = window.__P.campos();
    delete c.informe_texto; delete c.en_suma;
    var ks = Object.keys(c).sort();
    return { n: ks.length, hash: window.__P.hash(ks.map(function(k){ return k + '=' + c[k] }).join('|')) } },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-13', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },
  excelResumen() {
    var r = window.__P.excel();
    if (typeof r === 'string') return r;
    var ks = Object.keys(r);
    return { nCols: ks.length, hash: window.__P.hash(ks.map(function(k){ return k + '=' + r[k] }).join('|')) } },

  labGrado(inf, suma) {
    if (typeof _labDiastGrado !== 'function') return 'SIN _labDiastGrado';
    try { return _labDiastGrado({ campos: { en_suma: suma, informe_texto: inf } }) }
    catch(e) { return 'EXC: ' + e.message } },
  pptDiast() {
    try { return (typeof _pptSpan === 'function') ? _pptSpan('dd-interp') : window.__P.txt('dd-interp') }
    catch(e) { return 'EXC: ' + e.message } },

  /* El foco REAL, para la tabla del Tab. */
  foco() {
    var a = document.activeElement;
    if (!a) return { id: null, tag: null };
    return { id: a.id || null, tag: a.tagName.toLowerCase(),
             enLaGrilla: !!(a.closest && a.closest('#dop-mitral .grid-4')) } },

  /* ⚠️ EL CAMPO ESPEJO DEL VTI MITRAL VIVE EN VALVULAS, DENTRO DE UN CAJON, Y LA PRIMERA CORRIDA
     DE ESTA SONDA NO LO ALCANZO: informo «NO SE PUDO» y midio la escena con los dos lados vacios,
     o sea un «identico» sobre un tecleo que nunca ocurrio. Se abre como lo abre el medico —el
     boton «Datos» de la tarjeta— y se COMPRUEBA que el campo tiene geometria antes de tipear.
     Es la trampa del denominador aplicada a una pestania ajena. */
  abrirValvMitral() {
    try { showTab('valvulas') } catch(e) {}
    /* ⚠️ Y LA SECCION DE LA VALVULA TAMBIEN ESTA PLEGADA. La primera version abria solo el cajon
       «Datos» y seguia dando geometria CERO: la cadena de ancestros escondidos decia
       #ete-seccion-valv-mitral, que es el plegable de la tarjeta de la mitral y se abre con
       toggleEteSeccion. Son DOS puertas, no una. */
    var sec = document.getElementById('ete-seccion-valv-mitral');
    if (sec && getComputedStyle(sec).display === 'none') {
      try { toggleEteSeccion('valv-mitral') } catch(e) {}
    }
    var b = document.getElementById('bloque-insuf-mitral');
    if (b && getComputedStyle(b).display === 'none') {
      try { valvDatosTog('caja-insuf-mitral') } catch(e) {}
    }
    var e = document.getElementById('vtim');
    var r = e ? e.getBoundingClientRect() : null;
    /* La CADENA de ancestros escondidos, para que «no tiene geometria» diga POR QUE. */
    var cadena = [], n = e;
    while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none')
        cadena.push((n.id ? '#' + n.id : '.' + String(n.className || '?')));
      n = n.parentNode;
    }
    return { bloque: b ? getComputedStyle(b).display : 'NO EXISTE',
             vtimGeo: !!(r && r.width > 0 && r.height > 0),
             w: r ? Math.round(r.width) : 0, escondidoPor: cadena,
             revelar: window.__P.revelar('vtim') } },

  /* Las cinco sincronias de la orden, leidas de los DOS lados. */
  sinc() {
    return { lars_dop: window.__P.val('lars_dop'), lars: window.__P.val('lars'),
             ct_dop: window.__P.val('ai_strain_ct_dop'), ct: window.__P.val('ai_strain_ct'),
             itv_mitral: window.__P.val('itv_mitral'), vtim: window.__P.val('vtim'),
             thp: window.__P.val('thp'), thp_em: window.__P.val('em_thp_display'),
             avm_thp: window.__P.val('avm_thp'),
             marcas: { onda_l: window.__P.txt('onda_l-marca'), lars: window.__P.txt('lars_dop-marca'),
                       ct: window.__P.txt('ai_strain_ct_dop-marca'), thp: window.__P.txt('thp-marca') } } }
};
1`;

/* ══ ESCENAS DE VEREDICTO — LAS CUATRO LECTURAS DEL S/D QUE LLEGAN A SU COMPUERTA ═════════════
   Las cuatro bases salen de TC-459, que las dejo verificadas: cada una llega al paso donde el
   S/D vota y deja un criterio YA POSITIVO, para que cruzar el corte MUEVA el veredicto.
   ⚠️ UNA ESCENA QUE NO LLEGA A LA COMPUERTA informa «el corte no funciona» sobre un corte que
   funciona: con el paso 1 en tres positivos la figura cierra sin consultar el S/D. */
/* ⚠️ PESO Y TALLA EN LAS CUATRO, Y NO SON DECORACION: el Vol AI vota INDEXADO (LAVi), asi que sin
   ASC el criterio queda sin evaluar. Medido en HEAD con la primera version de esta sonda: la
   escena de la BSE publicaba «Datos insuficientes» y la de la ASE 2016 «0 de 1 criterios» —o sea
   que ninguna de las dos llegaba a la compuerta del S/D y la tabla decia «el corte no funciona»
   sobre un corte que funciona—. Peso 70 / talla 170 dan ASC 1,81: un Vol AI de 70 ml da LAVi 38,7
   (POSITIVO) y uno de 50 da 27,6 (negativo), que es el par que usa TC-459. */
const LECTURAS = [
  { id: 'ase25-sin', que: 'ASE 2025 ritmo sinusal, corte <= 0,67 (folio 554)',
    algo: 'ase2025', ritmo: 'sinusal',
    c: { peso: '70', talla: '170', fevi: '60', onda_e: '100', onda_a: '80', e_sep: '5', e_lat: '7', vmax_it: '2.0' } },
  { id: 'ase25-fa', que: 'ASE 2025 en FA, Figura 8 folio 563, corte < 1',
    algo: 'ase2025', ritmo: 'fa',
    c: { peso: '70', talla: '170', fevi: '60', onda_e: '110', e_sep: '8', vmax_it: '2.0', tde: '200', lars: '15' } },
  { id: 'bse-f18', que: 'BSE 2024 FEVI reducida, Figura 18 pag. 37, corte < 1',
    algo: 'bse2024', ritmo: 'sinusal', sel: { sexo: 'M' },
    c: { peso: '70', talla: '170', edad: '50', fevi: '35', onda_e: '120', onda_a: '80', e_sep: '5', e_lat: '7', ai_vol: '50', lars: '20' } },
  { id: 'ase16-fd', que: 'ASE/EACVI 2016 FEVI deprimida, folios 286-290, corte < 1',
    algo: 'ase2016', ritmo: 'sinusal',
    c: { peso: '70', talla: '170', fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', ai_vol: '70' } }
];
/* ⚠️ LAS CUATRO EXISTEN EN LOS DOS ARBOLES. Un A/B que use una <option> que el otro lado no tiene
   compara dos escenas distintas: el selector queda vacio en uno y cargado en el otro. */
const SD_VALS = ['', 'le067', 'mid', 'ge1'];

/* Los tres tokens que el selector ya NO ofrece: los dos de legado y uno inventado. Los tres
   tienen que leerse igual — campo SIN CARGAR. */
const SD_DESCONOCIDOS = ['menor1', 'mayor1', '__inventado__'];

const ANCHOS = [1200, 900, 390, 360];
const TEMAS = ['oscuro', 'claro'];
const ALGOS = ['ase2025', 'bse2024', 'ase2016'];
const RITMOS = ['sinusal', 'fa'];

async function main() {
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
  /* ⚠️ RELOJ SOBRE ev(): un despacho que NO RESUELVE deja el fallo apareciendo en la llamada
     SIGUIENTE, o sea en la linea equivocada. Con el reloj el error nombra su propia expresion. */
  async function ev(expr, ms) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate', { expression: `(function(){ ${expr.indexOf('return') === 0 ? expr : 'return (' + expr + ')'} })()`,
                                     returnByValue: true, awaitPromise: true }, sessionId),
      pausa(ms || 15000).then(() => ({ __reloj: true }))
    ]);
    if (r.__reloj) throw new Error('ev() no resolvio en ' + (ms || 15000) + ' ms: ' + expr.slice(0, 90));
    if (r.exceptionDetails) throw new Error('EXC en ev(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' | ' + expr.slice(0, 90));
    return r.result.value;
  }
  async function evCrudo(expr) {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error('EXC en evCrudo(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  }
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, End: 35, Home: 36, Space: 32 };
  /* ⚠️ LAS TECLAS DE EDICION (Backspace, Tab, Escape) VAN POR KEYCODE Y CON rawKeyDown; Enter y
     Espacio al reves, con type keyDown y su `text`, porque Blink activa un <button> desde el
     KEYPRESS y un rawKeyDown pelado no lo genera. Las dos cosas son ciertas a la vez. */
  async function tecla(k, text) {
    if (text) {
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'char', text, unmodifiedText: text, key: k }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k }, sessionId);
      return;
    }
    const vk = VK[k] || 0;
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k,
      windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k,
      windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }, sessionId);
  }
  async function clicEn(id) {
    let rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    for (let i = 0; i < 4 && rev && rev.necesitaClic; i++) {
      await clicEn(rev.necesitaClic);
      rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    }
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    const quien = await ev(`window.__P.quienEsta(${JSON.stringify(id)}, ${c.x}, ${c.y})`);
    if (quien.esElBlanco) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await pausa(130);
      return { via: 'mouse', quien };
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    await tecla('Enter', null);
    await pausa(130);
    return { via: 'tecla Enter', quien };
  }
  /* ⚠️ TIPEAR EN UN CAMPO QUE NO EXISTE NO ES UNA MEDICION, Y UNA SONDA DE ESTE REPO YA LO HIZO:
     el foco quedaba en el campo anterior y los caracteres se le concatenaban (un E/e-prima de
     1848,5 informado como diferencia del commit). Aca se ABORTA. */
  async function tipear(id, valor) {
    const hay = await ev(`window.__P.existe(${JSON.stringify(id)})`);
    if (!hay) throw new Error('ABORTA: el campo ' + id + ' no existe en este arbol');
    const via = await clicEn(id);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    return { via: via.via, pedido: String(valor), quedo: String(quedo), ok: String(quedo) === String(valor) };
  }
  /* NUNCA Backspace sobre un campo de SOLO LECTURA: se comprueba antes y se declara. */
  async function borrar(id) {
    const soloLectura = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      return e ? (!!e.readOnly || !!e.disabled) : 'NO EXISTE' })()`);
    if (soloLectura !== false) return { id, via: 'NO SE BORRA', por: String(soloLectura) };
    await clicEn(id);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (let i = 0; i < 12; i++) await tecla('Backspace', null);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    return { id, via: 'Backspace x12', quedo: await ev(`window.__P.val(${JSON.stringify(id)})`) };
  }

  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await evCrudo(SONDA);

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y VUELVE A MITAD DE CORRIDA. Con el puesto,
     elementFromPoint devuelve ESE nodo y todos los clics caen en el overlay. Se cierra por su
     propio boton y se COMPRUEBA antes de medir. */
  const avisoBtn = await ev(`(function(){
    var m = document.getElementById('modalAvisoEco');
    if (!m) return 'NO EXISTE';
    var b = m.querySelector('button'); if (b) { if (!b.id) b.id='__avisoBtn'; return b.id }
    return 'SIN BOTON' })()`);
  if (avisoBtn && avisoBtn.indexOf('NO ') !== 0 && avisoBtn !== 'SIN BOTON') await clicEn(avisoBtn);
  const avisoEstado = await ev(`(function(){
    var o = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      o[id] = m ? getComputedStyle(m).display : 'NO EXISTE' });
    return o })()`);

  const denom = await ev(`window.__P.abrirTodo()`);
  const btn = await ev(`window.__P.btnAlgo()`);
  const btnX = await ev(`window.__P.btnCerrarAlgo()`);

  /* Lo NO cableado a calcDiastol primero y los campos mitrales al final: asi el ultimo gesto de
     cada escena deja el cuadro gris al dia sin forzar ninguna llamada. */
  const ORDEN = ['edad', 'peso', 'talla', 'fevi', 'ai_vol', 'vmax_it', 'tde', 'triv',
                 'lars', 'e_sep', 'e_lat', 'onda_e', 'onda_a'];
  function enOrden(mapa) {
    const ks = Object.keys(mapa);
    return ORDEN.filter((k) => ks.indexOf(k) > -1).concat(ks.filter((k) => ORDEN.indexOf(k) < 0));
  }
  async function cargar(L, sdVal) {
    await ev(`window.__P.limpiar()`);
    await pausa(120);
    /* LOS <select> PRIMERO: vci_col dispara calcPmAD -> calcPSAP, que NO llama a calcDiastol. */
    const sels = {};
    sels.diast_algoritmo = await ev(`window.__P.set('diast_algoritmo', ${JSON.stringify(L.algo)})`);
    sels.diast_ritmo = await ev(`window.__P.set('diast_ritmo', ${JSON.stringify(L.ritmo)})`);
    sels.venp_sd = await ev(`window.__P.set('venp_sd', ${JSON.stringify(sdVal)})`);
    for (const id of Object.keys(L.sel || {})) sels[id] = await ev(`window.__P.set(${JSON.stringify(id)}, ${JSON.stringify(L.sel[id])})`);
    const tecleos = {};
    for (const id of enOrden(L.c)) tecleos[id] = await tipear(id, L.c[id]);
    await pausa(120);
    return { tecleos, sels, todosOk: Object.keys(tecleos).every((k) => tecleos[k].ok) };
  }
  /* Abre la ventana con un CLIC REAL en el boton 🧭, lee, y la cierra con un clic real en la ✕.
     Se abre y se cierra por escena: el overlay es inset:0, asi que dejandolo abierto los clics
     del tecleo siguiente caerian en el. */
  async function verVentana() {
    if (btn.err) return { err: btn.err };
    await clicEn(btn.sel);
    await pausa(200);
    const v = await ev(`window.__P.ventana()`);
    if (!btnX.err) await clicEn(btnX.sel);
    await pausa(120);
    return v;
  }
  /* ⚠️ EL ANCHO SE EMULA POR CDP Y NO REDIMENSIONANDO LA VENTANA, y se LIBERA al final de cada
     grupo: un override que queda puesto contamina el grupo siguiente. */
  async function ancho(px) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: px, height: 1000, deviceScaleFactor: 1, mobile: false }, sessionId);
    await pausa(160);
    return await ev(`({ innerWidth: window.innerWidth, pc: window.matchMedia('(min-width: 769px)').matches })`);
  }
  async function anchoLibre() { await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId); await pausa(120); }
  async function tema(t) {
    await ev(`(function(){ var h=document.documentElement;
      if (${JSON.stringify(t)} === 'claro') h.classList.add('light-mode'); else h.classList.remove('light-mode');
      return h.className })()`);
    await pausa(80);
    return await ev(`getComputedStyle(document.body).backgroundColor`);
  }

  const out = { archivo: FILE, md5Ini, avisoEstado, denominador: denom, boton: btn, cerrar: btnX };

  /* ══ GRUPO opciones ══════════════════════════════════════════════════════════════════════ */
  if (hacer('opciones')) {
    await ev(`window.__P.limpiar()`);
    await pausa(150);
    out.opciones = await ev(`window.__P.sdOpciones()`);
    out.desconocidos = [];
    for (const tok of SD_DESCONOCIDOS) {
      const r = await ev(`window.__P.sdToken(${JSON.stringify(tok)})`);
      /* Y despues de un token desconocido, el selector tiene que poder volver a su vacio. */
      const vuelta = await ev(`window.__P.set('venp_sd', '')`);
      out.desconocidos.push(Object.assign({ tok }, r, { vuelveAlVacio: vuelta }));
    }
    /* El sufijo del rotulo de la fila gris: si la funcion ya no existe, se declara. */
    out.sufijoLegado = await ev(`(typeof venpSdCritSuf)`);
    out.etiquetasTabla = await ev(`(typeof VENP_SD_TXT === 'undefined') ? 'SIN TABLA' : Object.keys(VENP_SD_TXT)`);
    out.lecturaTabla = await ev(`(typeof VENP_SD_LECTURA === 'undefined') ? 'SIN TABLA'
      : { le067: Object.keys(VENP_SD_LECTURA.le067), lt1: Object.keys(VENP_SD_LECTURA.lt1) }`);
  }

  /* ══ GRUPO veredictos ════════════════════════════════════════════════════════════════════ */
  if (hacer('veredictos')) {
    out.veredictos = [];
    for (const L of LECTURAS) {
      for (const v of SD_VALS) {
        const carga = await cargar(L, v);
        const cuadro = await ev(`window.__P.cuadro()`);
        const ven = await verVentana();
        out.veredictos.push({
          id: L.id + ' | sd=' + (v || '(vacio)'), que: L.que,
          sdLeido: carga.sels.venp_sd, carga: carga.todosOk ? 'TODOS OK' : carga.tecleos,
          badge: cuadro.badge, texto: cuadro.texto, suma: cuadro.suma,
          res: ven.res, nFilas: ven.nFilas,
          /* La FILA del S/D al lado del veredicto: sin el estado de la fila, un badge que no
             cambia se lee como un corte que no esta cableado. */
          filaSd: ven.sd
        });
      }
    }
  }

  /* ══ GRUPO tab ═══════════════════════════════════════════════════════════════════════════ */
  if (hacer('tab')) {
    out.tab = [];
    for (const a of ALGOS) for (const r of RITMOS) {
      await ev(`window.__P.limpiar()`);
      await ev(`window.__P.set('diast_algoritmo', ${JSON.stringify(a)})`);
      await ev(`window.__P.set('diast_ritmo', ${JSON.stringify(r)})`);
      await pausa(200);
      const geo = await ev(`window.__P.abrirTodo()`);
      const primero = await clicEn(CAMPOS16[0]);
      const sec = [await ev(`window.__P.foco()`)];
      for (let i = 1; i < CAMPOS16.length; i++) {
        await tecla('Tab', null);
        await pausa(45);
        sec.push(await ev(`window.__P.foco()`));
      }
      const ids = sec.map((f) => f.id);
      out.tab.push({ algoritmo: a, ritmo: r, clicInicial: primero.via,
                     sinGeometria: geo.sinGeometria, faltan: geo.faltan,
                     secuencia: ids, esperado: CAMPOS16,
                     igual: ids.join(',') === CAMPOS16.join(','),
                     fueraDeLaGrilla: sec.filter((f) => !f.enLaGrilla).map((f) => f.id) });
    }
  }

  /* ══ GRUPO pos ═══════════════════════════════════════════════════════════════════════════ */
  if (hacer('pos')) {
    out.pos = [];
    for (const px of ANCHOS) {
      const w = await ancho(px);
      for (const t of TEMAS) {
        const bg = await tema(t);
        await ev(`window.__P.abrirTodo()`);
        const p = await ev(`window.__P.posiciones()`);
        out.pos.push(Object.assign({ px, tema: t, bg, innerWidth: w.innerWidth, reglaPC: w.pc }, p));
      }
      await tema('oscuro');
    }
    await anchoLibre();
  }

  /* ══ GRUPO hueco ═════════════════════════════════════════════════════════════════════════ */
  if (hacer('hueco')) {
    await ancho(1200);
    await ev(`window.__P.abrirTodo()`);
    const antes = await ev(`window.__P.posiciones()`);
    const esc = await ev(`window.__P.ocultar('venp_sd', true)`);
    await pausa(150);
    const durante = await ev(`window.__P.posiciones()`);
    const rest = await ev(`window.__P.ocultar('venp_sd', false)`);
    await pausa(150);
    const despues = await ev(`window.__P.posiciones()`);
    const mapa = (p) => { const o = {}; (p.campos || []).forEach((c) => { o[c.id] = c.col + '/' + c.fila + '@' + c.left + ',' + c.top }); return o; };
    const mA = mapa(antes), mD = mapa(durante), mF = mapa(despues);
    const movidos = Object.keys(mA).filter((k) => k !== 'venp_sd' && mA[k] !== mD[k]);
    out.hueco = { escondido: esc, restaurado: rest,
                  /* DENOMINADOR: cuantos se midieron, para que «ninguno se movio» no sea cero. */
                  nMedidos: Object.keys(mA).length,
                  sdDisp: (durante.campos || []).filter((c) => c.id === 'venp_sd')[0],
                  movidos, nColumnasAntes: antes.nColumnas, nFilasAntes: antes.nFilas,
                  nColumnasDurante: durante.nColumnas, nFilasDurante: durante.nFilas,
                  vuelveIgual: JSON.stringify(mA) === JSON.stringify(mF) };
    await anchoLibre();
  }

  /* ══ GRUPO sinc ══════════════════════════════════════════════════════════════════════════ */
  if (hacer('sinc')) {
    out.sinc = [];
    const pares = [
      { que: 'LARS: Doppler -> AI/VI', esc: 'lars_dop', otro: 'lars' },
      { que: 'LARS: AI/VI -> Doppler', esc: 'lars', otro: 'lars_dop' },
      { que: 'Contraccion AI: Doppler -> AI/VI', esc: 'ai_strain_ct_dop', otro: 'ai_strain_ct' },
      { que: 'Contraccion AI: AI/VI -> Doppler', esc: 'ai_strain_ct', otro: 'ai_strain_ct_dop' },
      { que: 'VTI mitral: Doppler -> Valvulas', esc: 'itv_mitral', otro: 'vtim' },
      { que: 'VTI mitral: Valvulas -> Doppler', esc: 'vtim', otro: 'itv_mitral' },
      { que: 'THP: Doppler -> Valvulas (y el AVm derivado)', esc: 'thp', otro: 'em_thp_display' }
    ];
    for (const p of pares) {
      await ev(`window.__P.limpiar()`);
      await pausa(120);
      /* El espejo del VTI mitral vive en Valvulas, dentro del cajon «Datos»: se abre con el gesto
         del medico y se informa su estado AL LADO del resultado. */
      const prep = (p.esc === 'vtim') ? await ev(`window.__P.abrirValvMitral()`) : null;
      const t = await tipear(p.esc, '16');
      const tras = await ev(`window.__P.sinc()`);
      const b = await borrar(p.esc);
      const trasBorrar = await ev(`window.__P.sinc()`);
      out.sinc.push({ que: p.que, prepara: prep, tecleo: t, borrado: b,
                      conValor: tras, trasBorrar: trasBorrar,
                      copio: tras[({ lars: 'lars', lars_dop: 'lars_dop', ai_strain_ct: 'ct',
                                     ai_strain_ct_dop: 'ct_dop', itv_mitral: 'itv_mitral',
                                     vtim: 'vtim', thp: 'thp', em_thp_display: 'thp_em' })[p.otro]] });
    }
    /* El AVm por THP es READONLY: se mide su valor DERIVADO y nunca se le manda una tecla. */
    await ev(`window.__P.limpiar()`);
    await tipear('thp', '200');
    out.avm = { trasTHP: await ev(`window.__P.sinc()`), noSeBorra: await borrar('avm_thp') };
  }

  /* ══ GRUPO superficies ═══════════════════════════════════════════════════════════════════ */
  if (hacer('superficies')) {
    out.superficies = [];
    for (const L of LECTURAS) {
      for (const v of ['', 'mid']) {
        const carga = await cargar(L, v);
        const est = {};
        for (const e of ['estandar', 'conciso', 'narrativo']) {
          est[e] = await ev(`window.__P.informe(${JSON.stringify(e)})`);
        }
        const inf = est.estandar || {};
        out.superficies.push({ id: L.id + ' | sd=' + (v || '(vacio)'),
          carga: carga.todosOk ? 'TODOS OK' : carga.tecleos,
          estilos: est, excel: await ev(`window.__P.excelResumen()`),
          campos: await ev(`window.__P.camposHash()`),
          ppt: await ev(`window.__P.pptDiast()`),
          lab: await ev(`window.__P.labGrado(${JSON.stringify(inf.inf || '')}, ${JSON.stringify(inf.suma || '')})`) });
      }
    }
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  out.md5Igual = out.md5Ini === out.md5Fin;
  cdp.close();
  await new Promise((r) => srv.close(r));
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
