#!/usr/bin/env node
/**
 * _probe_asediag.mjs — sonda A/B de SOLO LECTURA para los DIAGRAMAS DE FLUJO de la ASE 2025
 * (ritmo sinusal y fibrilacion auricular) y de la ASE/EACVI 2016 (Figuras 8A y 8B) en la
 * ventana del boton 🧭: el camino de nodos que devuelven las funciones duenias, el dibujo SVG,
 * la tabla compacta plegada y el umbral de ancho.
 *
 * Infraestructura calcada de scripts/_probe_bsediag.mjs (teclas y clics reales, cierre del
 * arbol de Chrome por GRUPO, cierre del aviso legal con su denominador, md5 al principio y al
 * final). NO muta index.html.
 *
 *   node scripts/_probe_asediag.mjs --file /tmp/index.HEAD.html > /tmp/a.HEAD.json
 *   node scripts/_probe_asediag.mjs                             > /tmp/a.NEW.json
 *
 * Grupos (--solo camino|diagrama|ancho|angosto|tabla|superficies|excelab|otras|captura):
 *   camino      — por escena: `R.camino`, `R.nodoFinal` y el badge del CUADRO GRIS, para
 *                 comprobar que el ULTIMO nodo del camino es el veredicto que el cuadro firma.
 *   diagrama    — el SVG: nodos, cuales estan en el camino, el rotulo de resultado y el pie.
 *   ancho       — 1200 / 900 / 790 / 770 / 390 / 360 px en los DOS temas. 790 y 770 son los dos
 *                 lados del umbral de 780 px, que es el unico numero que decide si se dibuja.
 *   angosto     — A/B a 360 px contra HEAD: la ventana IDENTICA, letra por letra.
 *   tabla       — la tabla compacta plegada, con teclas reales y un repintado despues.
 *   superficies — informe en 3 estilos, EN SUMA en 3, columnas del Excel, el texto del PPT, el
 *                 grado del Laboratorio y el hash de los campos SIN los dos <textarea>.
 *   excelab     — la fila del Excel clave por clave.
 *   otras       — CONTROL NEGATIVO: la BSE 2024 (sinusal y FA) y la ASE/EACVI 2016 en FA.
 *   captura     — PNG del dibujo en los dos temas (--out DIR, --escenas a,b --abrir-tabla).
 *
 * ⚠️ DENOMINADOR. Un conteo de nodos sobre una ventana que no abrio da cero y parece acuerdo
 * perfecto. Cada escena informa que tipeo, que quedo en el campo y cuantos nodos vio.
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


/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios, y
   la barra-ese del regex va DOBLE —dentro de un template literal se cocina a la letra ese y el
   regex termina borrando todas las eses del texto, que es un falso con pinta de medicion buena
   (scripts/check_backticks.py da la linea exacta cuando se cuela un acento grave). */
const SONDA = `
window.__P = {
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

  /* Abre lo que haga falta para que el campo tenga geometria. Calcado de _probe_emsignif.mjs. */
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
     colapsara los seis campos de esta tanda quedarian SIN GEOMETRIA y la sonda tipearia en la
     nada: todas las escenas saldrian «sin cambios» y eso es indistinguible de «no hay cambios».
     Se confirma ANTES de medir y se informa al lado del veredicto. */
  abrirTodo() {
    try { showTab('doppler') } catch(e) {}
    var c = document.getElementById('dop-mitral');
    if (c && getComputedStyle(c).display === 'none') c.style.display = 'block';
    return { onda_e: window.__P.vis('onda_e'), e_sep: window.__P.vis('e_sep'),
             e_lat: window.__P.vis('e_lat'), algoritmo: window.__P.val('diast_algoritmo'),
             ritmo: window.__P.val('diast_ritmo'),
             dueno: (typeof window.diastASE2025Evaluar === 'function'),
             ok: window.__P.vis('onda_e') === true && window.__P.vis('e_sep') === true } },

  limpiar() { try { limpiarCampos(true) } catch(e) {} return 1 },

  /* ⚠️ DESPEJE DEFENSIVO DEL AVISO LEGAL, Y SU DENOMINADOR. El modal #modalAvisoEco
     (z-index 9999) y #login-overlay (2147483000) REAPARECEN a mitad de corrida, y con
     cualquiera de los dos puesto todos los clics caen en el overlay: clicEn cae a su respaldo
     por tecla, un input numerico no recibe nada y la escena informa un paciente que nunca se
     cargo — una medicion falsa con pinta de buena. Se despeja antes de CADA escena y se
     informa que habia. (Sin acentos graves: esto vive dentro del template literal SONDA.) */
  despejar() {
    var o = {};
    ['modalAvisoEco', 'login-overlay'].forEach(function (id) {
      var m = document.getElementById(id);
      if (!m) { o[id] = 'NO EXISTE'; return }
      o[id] = getComputedStyle(m).display;
      if (o[id] !== 'none') { m.style.display = 'none'; o[id] = o[id] + ' -> despejado' }
    });
    return o },

  /* NO ES UN GESTO MEDIDO: solo para los <select> de escenario (ritmo, algoritmo, colapso de VCI).
     Los seis campos numericos de la diastolica se tipean SIEMPRE con teclas reales. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* ══ EL CUADRO GRIS ══ lo que publica #dd-interp y lo que viaja al informe. */
  cuadro() {
    var r = window._diastResult || {};
    return { badge: window.__P.txt('dd-interp'),
             algoritmo: r.algoritmo === undefined ? null : r.algoritmo,
             texto: r.texto === undefined ? null : r.texto,
             suma: r.textoSuma === undefined ? null : r.textoSuma,
             ea: window.__P.txt('ea-val'), eprom: window.__P.txt('eprom-val'),
             ee: window.__P.txt('ee-val'), psap: window.__P.val('psap_calc') } },

  /* El boton 🧭 no tiene id en el marcado: se lo pone la sonda para poder clickearlo de verdad. */
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

  /* ══ LA VENTANA ══ titulo, filas con su estado, resultado y nota. El estado sale de la CLASE
     que pinta _daFila: da-bad = criterio positivo, da-ok = negativo, da-na = sin dato. */
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
    return { abierta: abierta,
             titulo: window.__P.txt('diast-algo-titulo'),
             pasos: Array.from(cu.querySelectorAll('.da-paso')).map(function(p){ return window.__P.norm(p.textContent) }),
             filas: filas, nFilas: filas.length,
             res: window.__P.norm((cu.querySelector('.da-res') || {}).textContent),
             notas: Array.from(cu.querySelectorAll('.da-nota')).map(function(p){ return window.__P.norm(p.textContent) }) } },

  /* El aviso de exclusiones: texto, display COMPUTADO y los motivos que devuelve su fuente. */
  aviso() {
    var e = document.getElementById('diast-excl-aviso');
    if (!e) return { existe: false };
    return { existe: true, txt: window.__P.norm(e.textContent),
             disp: getComputedStyle(e).display,
             motivos: (typeof diastExclMotivos === 'function') ? diastExclMotivos() : 'SIN FUNCION',
             /* El aviso de PROTOCOLO, al lado, para probar que no se pisan. */
             protocolo: window.__P.norm((document.getElementById('diast-algo-aviso') || {}).textContent) } },

  /* El aviso ambar de frecuencia cardiaca: texto, display COMPUTADO y el aviso de exclusiones
     de al lado, para probar que no se pisan. Se lee el display COMPUTADO y no la propiedad
     hidden: este archivo ya pago cuatro veces que una regla de autor le gana al [hidden] de la
     hoja del navegador. */
  fcAviso() {
    var e = document.getElementById('diast-fc-aviso');
    if (!e) return { existe: false };
    return { existe: true, txt: window.__P.norm(e.textContent),
             disp: getComputedStyle(e).display,
             excl: window.__P.norm((document.getElementById('diast-excl-aviso') || {}).textContent),
             protocolo: window.__P.norm((document.getElementById('diast-algo-aviso') || {}).textContent) } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* La LINEA del informe que habla de la diastolica. Por linea y no por oracion: el informe se
     une por salto de linea y la diastolica comparte oracion con la geometria del VI. */
  lineaDiast(texto) {
    return String(texto || '').split('\\n').filter(function(l){
      return /diast[oó]lic|presi[oó]n de llenado|relajaci[oó]n/i.test(l) }).map(window.__P.norm) },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      c[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-12', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },

  /* El grado que el Laboratorio DERIVA DEL TEXTO del resumen — y de ahi salen cinco columnas del
     Excel, la distribucion del panel y el PPT estadistico. Se le pasa el informe REAL. */
  labGrado(inf, suma) {
    if (typeof _labDiastGrado !== 'function') return 'SIN _labDiastGrado';
    try { return _labDiastGrado({ campos: { en_suma: suma, informe_texto: inf } }) }
    catch(e) { return 'EXC: ' + e.message } },

  /* Lo que lee la franja del PPT para la fila «Funcion diastolica»: el span del cuadro. */
  pptDiast() {
    try { return (typeof _pptSpan === 'function') ? _pptSpan('dd-interp') : window.__P.txt('dd-interp') }
    catch(e) { return 'EXC: ' + e.message } },

  /* ══ EL CAMINO ══ lo que devuelven las tres funciones duenias, sin pasar por la pantalla.
     Se lee del DUENIO y no del dibujo a proposito: asi una escena puede decir «el camino termina
     en X» aunque el diagrama no se este mostrando, que es el caso de la pantalla angosta. */
  camino() {
    var algo = window.__P.val('diast_algoritmo');
    var ritmo = window.__P.val('diast_ritmo');
    var R = null;
    try {
      if (ritmo === 'fa') R = (typeof diastFAEvaluar === 'function') ? diastFAEvaluar(algo) : null;
      else if (algo === 'bse2024') R = (typeof diastBSE2024Evaluar === 'function') ? diastBSE2024Evaluar() : null;
      else if (algo === 'ase2025') R = (typeof diastASE2025Evaluar === 'function') ? diastASE2025Evaluar() : null;
      else R = (typeof diastASE2016Evaluar === 'function') ? diastASE2016Evaluar() : null;
    } catch (e) { return { err: 'EXC: ' + e.message } }
    if (!R) return { err: 'SIN DUENIO' };
    return { camino: R.camino || null, n: (R.camino || []).length,
             nodoFinal: R.nodoFinal === undefined ? 'SIN PROPIEDAD' : R.nodoFinal,
             clave: R.clave === undefined ? null : R.clave,
             via: R.via === undefined ? null : R.via,
             ventanaTit: R.ventanaTit === undefined ? null : R.ventanaTit,
             pos: R.pos === undefined ? null : R.pos,
             total: R.total === undefined ? null : R.total,
             nFilas: (R.filas || []).length,
             nodosDeFila: (R.filas || []).map(function (f) { return f.nodo === undefined ? null : f.nodo }) } },

  /* ══ EL DIAGRAMA ══ lo que de verdad quedo dibujado. Se lee del SVG y NO del objeto: solo el
     objeto deja pasar un camino que el dibujo no pinta, y solo el dibujo no distingue «la caja
     no esta en el camino» de «la caja no existe». */
  diagrama() {
    var ov = document.getElementById('diast-algo-overlay');
    var abierta = !!ov && getComputedStyle(ov).display !== 'none';
    var svg = document.querySelector('#diast-algo-cuerpo svg[data-bse-diag]');
    if (!svg) return { existe: false, ventanaAbierta: abierta };
    var disp = getComputedStyle(svg).display;
    var cont = svg.closest('[data-bse-diag-caja]');
    var dispCaja = cont ? getComputedStyle(cont).display : 'SIN CAJA';
    var nodos = Array.from(svg.querySelectorAll('g[data-nodo]')).map(function (g) {
      var t = Array.from(g.querySelectorAll('text')).map(function (x) { return window.__P.norm(x.textContent) });
      var caja = g.querySelector('rect');
      return { id: g.getAttribute('data-nodo'),
               enCamino: g.getAttribute('data-en-camino') === '1',
               esFinal: g.getAttribute('data-final') === '1',
               trazo: caja ? getComputedStyle(caja).stroke : null,
               ancho: caja ? getComputedStyle(caja).strokeWidth : null,
               txt: t.join(' | ') } });
    var aristas = Array.from(svg.querySelectorAll('[data-arista]')).map(function (a) {
      return { id: a.getAttribute('data-arista'), enCamino: a.getAttribute('data-en-camino') === '1',
               trazo: getComputedStyle(a).stroke, ancho: getComputedStyle(a).strokeWidth } });
    /* ⚠️ EL TAMANIO RENDERIZADO NO ES el fontSize computado. Dentro de un SVG con
       viewBox, la hoja declara 11,5 px en unidades de USUARIO y el navegador sigue informando
       11,5 px aunque el dibujo este escalado a la mitad: el computado NO conoce la escala. El
       numero que importa es 11,5 x (ancho dibujado / ancho del viewBox), y asi se midio el
       umbral. Se informan los tres para que un falso se vea. */
    var fs = null;
    var tt = svg.querySelector('g[data-nodo] text');
    var vb = (svg.getAttribute('viewBox') || '0 0 700 100').split(/\s+/);
    var anchoDib = svg.getBoundingClientRect().width;
    var escala = anchoDib / (parseFloat(vb[2]) || 700);
    if (tt) { var r = tt.getBoundingClientRect();
      fs = { font: getComputedStyle(tt).fontSize, alto: Math.round(r.height * 10) / 10,
             anchoDib: Math.round(anchoDib), escala: Math.round(escala * 1000) / 1000,
             px: Math.round(parseFloat(getComputedStyle(tt).fontSize) * escala * 100) / 100 } };
    return { existe: true, ventanaAbierta: abierta, disp: disp, dispCaja: dispCaja, fig: svg.getAttribute('data-bse-diag'),
             nodos: nodos, nNodos: nodos.length,
             enCamino: nodos.filter(function (n) { return n.enCamino }).map(function (n) { return n.id }),
             final: (nodos.find(function (n) { return n.esFinal }) || {}).id || null,
             aristas: aristas, aristasEnCamino: aristas.filter(function (a) { return a.enCamino }).map(function (a) { return a.id }),
             texto: fs,
             pie: window.__P.norm((document.querySelector('#diast-algo-cuerpo [data-bse-pie]') || {}).textContent),
             accesible: window.__P.norm((document.querySelector('#diast-algo-cuerpo [data-bse-alt]') || {}).textContent) } },

  /* ══ GEOMETRIA CRUDA DEL SVG ══ la caja de cada nodo y la posicion de cada rotulo de arista,
     en unidades del viewBox. Es la unica forma de ver una superposicion sin mirar el PNG a ojo:
     dos rotulos a la misma y y a x cercanos se imprimen uno encima del otro y el dibujo parece
     tener flechas sin nombre. */
  geo() {
    var svg = document.querySelector('#diast-algo-cuerpo svg[data-bse-diag]');
    if (!svg) return { existe: false };
    var nodos = Array.from(svg.querySelectorAll('g[data-nodo]')).map(function (g) {
      var r = g.querySelector('rect');
      return { id: g.getAttribute('data-nodo'),
               x: +r.getAttribute('x'), y: +r.getAttribute('y'),
               w: +r.getAttribute('width'), h: +r.getAttribute('height') } });
    var rots = Array.from(svg.querySelectorAll('text.ar-et')).map(function (t) {
      return { txt: window.__P.norm(t.textContent), x: +t.getAttribute('x'), y: +t.getAttribute('y'),
               anchor: t.getAttribute('text-anchor') } });
    var fin = Array.from(svg.querySelectorAll('text.rot-fin')).map(function (t) {
      return { txt: window.__P.norm(t.textContent), x: +t.getAttribute('x'), y: +t.getAttribute('y') } });
    return { existe: true, viewBox: svg.getAttribute('viewBox'), nodos: nodos, rots: rots, fin: fin } },

  /* ══ LA TABLA COMPACTA ══ el <details> plegado, su estado y sus columnas. */
  tabla() {
    var d = document.querySelector('#diast-algo-cuerpo details[data-bse-tabla]');
    if (!d) return { existe: false };
    var sum = d.querySelector('summary');
    return { existe: true, abierta: !!d.open, disp: getComputedStyle(d).display,
             rotulo: window.__P.norm(sum ? sum.textContent : ''),
             expandido: sum ? sum.getAttribute('aria-expanded') : 'SIN ATRIBUTO',
             cols: Array.from(d.querySelectorAll('[data-bse-col]')).map(function (c) {
               return { paso: c.getAttribute('data-bse-col'),
                        tit: window.__P.norm((c.querySelector('[data-bse-col-tit]') || {}).textContent),
                        filas: Array.from(c.querySelectorAll('[data-bse-celda]')).map(function (f) {
                          return window.__P.norm(f.textContent) }) } }) } },

  /* La LISTA LARGA de HEAD: cuantas filas tienen geometria de verdad. Se mide por display
     COMPUTADO y no por la propiedad hidden — este repo ya pago cuatro veces esa leccion. */
  lista() {
    var cu = document.getElementById('diast-algo-cuerpo');
    if (!cu) return { err: 'SIN CUERPO' };
    var filas = Array.from(cu.querySelectorAll('.da-row'));
    var vis = filas.filter(function (f) { return f.getClientRects().length > 0 });
    var caja = cu.querySelector('[data-bse-lista]');
    return { nFilas: filas.length, nVisibles: vis.length,
             dispCaja: caja ? getComputedStyle(caja).display : 'SIN CAJA',
             /* El texto VISIBLE del cuerpo: es lo que compara «identica a HEAD» en angosto. Un
                innerHTML comparado a secas diria «distinto» por el solo hecho de que el SVG
                existe en el arbol aunque no se vea. */
             txtVisible: window.__P.norm(cu.innerText || ''),
             hashVisible: window.__P.hash(cu.innerText || '') } },

  /* Columnas del Excel: el NUMERO es lo que fija la verificacion (435 desde el 2026-10-12) y las claves el detalle. */
  excelCols() {
    var r = window.__P.excel();
    if (typeof r === 'string') return r;
    return { n: Object.keys(r).length,
             diast: { grado: r['Grado disfunción diastólica'],
                      I: r['DD_I (Grado I)'], II: r['DD_II (Grado II)'],
                      III: r['DD_III (Grado III)'], sin: r['DD_Sin (Sin disfunción)'] },
             hash: window.__P.hash(JSON.stringify(r)) } }
};
1
`;

/* ══ ESCENAS ══════════════════════════════════════════════════════════════════════════════════
   Cada escena es un PACIENTE, no un tecleo. Los numericos se tipean con TECLAS REALES; los
   <select> de escenario (guia, ritmo, S/D, colapso de VCI) van por `set`, que NO es un gesto
   medido y se declara como tal.

   SON LAS ESCENAS DE LOS TRABAJOS ANTERIORES DE CADA VIA, reusadas a proposito: las de
   _probe_diast2025.mjs para el ritmo sinusal de la ASE 2025, las de _probe_diastfa.mjs para su
   fibrilacion auricular y las de _probe_ase2016.mjs para la ASE/EACVI 2016. Asi un A/B contra
   HEAD compara los MISMOS pacientes que fijaron el comportamiento que esta tanda no debe mover.

   `peso 70` y `talla 170` van en toda escena con datos: sin ASC el LAVi no se puede calcular, y
   ese denominador roto se leeria como «el criterio no se cumple». Con esa ASC (1,81 m2) un
   Vol AI de 70 ml da LAVi 38,7 (POSITIVO, > 34) y uno de 50 da 27,6 (negativo). */
const BASE = { peso: '70', talla: '170' };

/* ── ASE 2025 · RITMO SINUSAL (Figura 3, folio 554) — de scripts/_probe_diast2025.mjs ──────── */
const ESC_A25 = [
  { id: 'S00-vacio', que: 'formulario vacio', c: {} },
  { id: 'S01-solo-esep', que: "solo e' septal 10 (sin ningun otro parametro)", c: { e_sep: '10' } },
  { id: 'S02-escena31', que: "e' septal 6,5 y lateral 12", c: { e_sep: '6.5', e_lat: '12', onda_e: '90', onda_a: '60', ai_vol: '40', vmax_it: '2.0' } },
  { id: 'S03-normal', que: "e' conservada, todo negativo", c: { e_sep: '10', e_lat: '13', onda_e: '70', onda_a: '70', ai_vol: '40', vmax_it: '2.0' } },
  { id: 'S04-g2', que: 'grado 2 por segundo paso', c: { e_sep: '5', e_lat: '7', onda_e: '90', onda_a: '60', ai_vol: '80', vmax_it: '2.5' } },
  { id: 'S05-g3', que: 'grado 3: las tres principales positivas y E/A 2,4', c: { e_sep: '5', e_lat: '6', onda_e: '120', onda_a: '50', ai_vol: '80', vmax_it: '3.0' } },
  { id: 'S06-g1', que: "grado 1: e' reducida sola con E/A 0,71", c: { e_sep: '5', e_lat: '6', onda_e: '50', onda_a: '70', ai_vol: '40', vmax_it: '2.0' } },
  { id: 'S07-estadoA', que: "ESTADO (a): e' reducida sola, E/A 1,20 y segundo paso NEGATIVO", c: { e_sep: '5', e_lat: '6', onda_e: '60', onda_a: '50', ai_vol: '40', vmax_it: '2.0', lars: '30' } },
  { id: 'S08-eeSola', que: "E/e' positivo solo, segundo paso negativo", c: { e_sep: '10', e_lat: '13', onda_e: '180', onda_a: '90', ai_vol: '40', vmax_it: '2.0', lars: '30' } },
  { id: 'S09-trSola', que: 'IT positiva sola, segundo paso con Vol AI positivo', c: { e_sep: '10', e_lat: '13', onda_e: '70', onda_a: '60', ai_vol: '80', vmax_it: '3.2' } },
  { id: 'S10-psap35', que: 'IT 2,6 NEGATIVA pero PSAP 35 positiva', c: { e_sep: '5', e_lat: '6', onda_e: '90', onda_a: '60', ai_vol: '40', vmax_it: '2.6' }, sel: { vci_col: '<50' }, teclas: { vci_diam: '15' } },
  { id: 'S11-psap34', que: 'CONTROL NEGATIVO: IT 2,55 y PSAP 34, las dos negativas', c: { e_sep: '5', e_lat: '6', onda_e: '90', onda_a: '60', ai_vol: '40', vmax_it: '2.55' }, sel: { vci_col: '<50' }, teclas: { vci_diam: '15' } },
  { id: 'S12-p2flip', que: "e' septal 6,3 SOLO", c: { e_sep: '6.3', onda_e: '85', onda_a: '100', ai_vol: '65', vmax_it: '2.0' } },
  { id: 'S13-p1flip', que: "e' septal 7,0 SOLO, E/e' septal 14,29", c: { e_sep: '7', onda_e: '100', onda_a: '70', ai_vol: '72', vmax_it: '2.5' } },
  { id: 'S14-p3flip', que: "E/e' 14,00 y IT 2,80 EXACTOS", c: { e_sep: '7', e_lat: '7', onda_e: '98', onda_a: '70', ai_vol: '40', vmax_it: '2.8', lars: '25' } },
  { id: 'S15-p4flip', que: 'presion elevada con E/A 0,75', c: { e_sep: '5', onda_e: '60', onda_a: '80', ai_vol: '72', vmax_it: '3.0' } },
  { id: 'S16-estadoB', que: "ESTADO (b): e' 10 y onda E 70, sin NINGUN parametro del segundo paso", c: { e_sep: '10', onda_e: '70' } },
  { id: 'S17-insuf', que: "datos insuficientes: SOLO e' septal 10", c: { e_sep: '10' } },
  { id: 'S18-ivrt', que: 'alternativa del segundo paso: TRIV 60 ms', c: { e_sep: '10', onda_e: '70', triv: '60' } },
  { id: 'S19-larsBorde', que: 'LARS 18,0 exacto en el segundo paso', c: { e_sep: '10', e_lat: '13', onda_e: '180', onda_a: '90', ai_vol: '40', lars: '18', vmax_it: '2.0' } },
  /* ── Las que faltaban para recorrer las ramas que las de arriba no tocan ───────────────── */
  { id: 'S20-incompleto', que: "SIN e' septal ni lateral: el algoritmo no arranca", c: { onda_e: '90', onda_a: '60', ai_vol: '40' } },
  { id: 'S21-supl-pos', que: 'segundo paso VACIO y suplementario POSITIVO (onda L 55 cm/s)', c: { e_sep: '10', onda_e: '70', onda_l: '55' } },
  { id: 'S22-altaSinEa', que: 'tres principales positivas SIN onda A: presion elevada sin E/A', c: { e_sep: '5', e_lat: '6', onda_e: '120', ai_vol: '80', vmax_it: '3.0' } },
  { id: 'S23-indetComb', que: "tres positivas con E/A 2,4 y e' CONSERVADA no se alcanza; via del segundo paso con E/A 2,4", c: { e_sep: '10', e_lat: '13', onda_e: '120', onda_a: '50', ai_vol: '80', vmax_it: '2.0' } }
];

/* ── ASE 2025 · FIBRILACION AURICULAR (Figura 8, folio 563) — de scripts/_probe_diastfa.mjs ── */
const ESC_FA = [
  { id: 'F00-vacio', que: 'formulario vacio', c: {} },
  { id: 'F01-cero', que: '0 de 4 positivos', c: { onda_e: '70', e_sep: '10', vmax_it: '2.0', tde: '200' } },
  { id: 'F02-uno', que: '1 de 4: onda E 120', c: { onda_e: '120', e_sep: '12', vmax_it: '2.0', tde: '200' } },
  { id: 'F03-dos', que: '2 de 4 y paso 2 sin nada medido', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200' } },
  { id: 'F04-tres', que: '3 de 4', c: { onda_e: '120', e_sep: '10', vmax_it: '3.2', tde: '200' } },
  { id: 'F05-cuatro', que: '4 de 4', c: { onda_e: '120', e_sep: '10', vmax_it: '3.2', tde: '140' } },
  { id: 'F06-dos-p2pos', que: '2 de 4 y paso 2 con LARS 15 y S/D <1 positivos', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200', lars: '15' }, sel: { venp_sd: 'le067' } },
  { id: 'F07-dos-p2neg', que: '2 de 4 y paso 2 con los TRES negativos', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200', lars: '25' }, sel: { venp_sd: 'ge1' } },
  { id: 'F08-lars17', que: '2 de 4 con LARS 17 (positivo para la ASE 2025)', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200', lars: '17' }, sel: { venp_sd: 'ge1' } },
  { id: 'F09-p2-uno', que: '2 de 4 y paso 2 con un solo parametro evaluado', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200', lars: '15' } },
  { id: 'F10-dos-sin-medir', que: '2 del paso 1 SIN MEDIR y los dos medidos negativos', c: { onda_e: '70', e_sep: '10' } },
  { id: 'F11-psap', que: 'IT 2,65 NEGATIVA con PSAP 36', c: { onda_e: '120', e_sep: '10', vmax_it: '2.65', tde: '200' }, sel: { vci_col: '<50' }, teclas: { vci_diam: '15' } },
  { id: 'F12-imc', que: '2 de 4 y paso 2 con IMC 34,6 como unico positivo', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200', peso: '100', lars: '25' }, sel: { venp_sd: 'ge1' } },
  { id: 'F13-solo-e', que: 'un solo parametro del paso 1 medido', c: { onda_e: '120' } },
  { id: 'F14-triv', que: 'TRIV 60 y FEVI 35 cargados', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '140', triv: '60', fevi: '35' } },
  { id: 'F15-fc', que: 'FC 130 lpm con los cuatro del paso 1 cargados', c: { onda_e: '120', e_sep: '10', vmax_it: '3.2', tde: '140', ao_fc: '130' } }
];

/* ── ASE/EACVI 2016 · RITMO SINUSAL (Figura 8, folio 290) — de scripts/_probe_ase2016.mjs ──── */
const ESC_A16 = [
  { id: 'T00-vacio', que: 'formulario vacio', c: {} },
  { id: 'T01-atajo-g1', que: 'FEVI 35: E/A 0,67 con E 40 -> grado I por atajo', c: { fevi: '35', onda_e: '40', onda_a: '60', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'T02-atajo-g3', que: 'FEVI 35: E/A 2,33 -> grado III por atajo', c: { fevi: '35', onda_e: '140', onda_a: '60', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'T03-ea-baja-E-alta', que: 'FEVI 35: E/A 0,75 pero E 60 -> va a los tres criterios', c: { fevi: '35', onda_e: '60', onda_a: '80', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'T04-fr-3neg', que: 'FEVI 35: 3 de 3 NEGATIVOS', c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'T05-fr-1pos', que: 'FEVI 35: 1 de 3 POSITIVO (LAVi 38,7)', c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '70' } },
  { id: 'T06-fr-2pos', que: 'FEVI 35: 2 de 3 POSITIVOS -> grado II', c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '3.2', ai_vol: '70' } },
  { id: 'T07-fr-3pos', que: 'FEVI 35: 3 de 3 POSITIVOS -> grado II', c: { fevi: '35', onda_e: '120', onda_a: '70', e_sep: '5', e_lat: '7', vmax_it: '3.2', ai_vol: '70' } },
  { id: 'T08-fr-dos-1y1', que: 'FEVI 35: SOLO 2 criterios, 1 positivo y 1 negativo', c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', ai_vol: '70' } },
  { id: 'T09-fr-dos-2pos', que: 'FEVI 35: SOLO 2 criterios, los DOS positivos', c: { fevi: '35', onda_e: '180', onda_a: '90', e_sep: '10', e_lat: '13', ai_vol: '70' } },
  { id: 'T10-fr-dos-2neg', que: 'FEVI 35: SOLO 2 criterios, los DOS negativos', c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', ai_vol: '50' } },
  { id: 'T11-fr-uno-pos', que: 'FEVI 35: UN SOLO criterio disponible y POSITIVO', c: { fevi: '35', onda_e: '70', onda_a: '70', ai_vol: '70' } },
  { id: 'T12-fr-uno-neg', que: 'FEVI 35: UN SOLO criterio disponible y negativo', c: { fevi: '35', onda_e: '70', onda_a: '70', ai_vol: '50' } },
  { id: 'T13-sin-ea', que: 'FEVI 35 SIN onda A', c: { fevi: '35', onda_e: '70', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'T14-fr-eprima-baja', que: 'FEVI 35: 0 de 3 positivos con e-prima BAJO', c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '5', e_lat: '7', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'T16-fn-3neg', que: 'FEVI 60: 0 de 4 en la 8A', c: { fevi: '60', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'T17-fn-1pos', que: 'FEVI 60: 1 de 4 en la 8A', c: { fevi: '60', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '70' } },
  { id: 'T18-fn-2pos', que: 'FEVI 60: 2 de 4, la mitad', c: { fevi: '60', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '3.2', ai_vol: '70' } },
  { id: 'T19-fn-3pos', que: 'FEVI 60: 4 de 4 en la 8A', c: { fevi: '60', onda_e: '120', onda_a: '70', e_sep: '5', e_lat: '7', vmax_it: '3.2', ai_vol: '70' } },
  { id: 'T20-fn-atajo-g3', que: 'FEVI 60: E/A 2,33 — la 8A no tiene atajos', c: { fevi: '60', onda_e: '140', onda_a: '60', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'T21-fn-atajo-g1', que: 'FEVI 60: E/A 0,67 con E 40 — la 8A no tiene atajos', c: { fevi: '60', onda_e: '40', onda_a: '60', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'T22-fn-dos-1y1', que: 'FEVI 60: 2 de las 4 disponibles, 1 POSITIVA y 1 negativa', c: { fevi: '60', onda_e: '70', onda_a: '70', vmax_it: '3.2', ai_vol: '50' } },
  { id: 'T23-fn-una', que: 'FEVI 60: UNA SOLA de las cuatro medida', c: { fevi: '60', onda_e: '70', onda_a: '70', ai_vol: '70' } },
  { id: 'T24-fn-ninguna', que: 'FEVI 60: NINGUNA de las cuatro medida', c: { fevi: '60', onda_e: '70', onda_a: '70' } },
  { id: 'T25-sinfevi-1pos', que: 'SIN FEVI: se aplica la 8B', c: { onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '70' } },
  { id: 'T26-sinfevi-3neg', que: 'SIN FEVI: 0 de 3 -> normal (la 8B sin FEVI no gradua)', c: { onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'T27-sd-fr-falta-uno', que: 'FEVI 35, SIN IT y S/D < 1: el sustituto vota', c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', ai_vol: '50' }, sel: { venp_sd: 'le067' } },
  { id: 'T28-sd-fr-mayor1', que: 'CONTROL NEGATIVO del S/D: la misma, con S/D >= 1', c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', ai_vol: '50' }, sel: { venp_sd: 'ge1' } },
  { id: 'T29-sd-fevi-normal', que: 'CONTROL NEGATIVO del S/D: FEVI 60, falta la IT y S/D < 1', c: { fevi: '60', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', ai_vol: '50' }, sel: { venp_sd: 'le067' } }
];

/* Las tres vias en una sola lista: cada entrada dice con que <select> de escenario se carga. */
const VIAS = [
  { via: 'a25',   algo: 'ase2025', ritmo: 'sinusal', escenas: ESC_A25 },
  { via: 'a25fa', algo: 'ase2025', ritmo: 'fa',      escenas: ESC_FA  },
  { via: 'a16',   algo: 'ase2016', ritmo: 'sinusal', escenas: ESC_A16 }
];
const TODAS = VIAS.reduce(function (a, v) {
  return a.concat(v.escenas.map(function (e) { return Object.assign({ _via: v.via, _algo: v.algo, _ritmo: v.ritmo }, e); })); }, []);

/* Subconjunto para los grupos caros (dibujo, anchos, capturas): una escena por rama relevante. */
const SUB_DIB = ['S03-normal','S04-g2','S05-g3','S06-g1','S16-estadoB','S20-incompleto','S21-supl-pos',
                 'F01-cero','F04-tres','F06-dos-p2pos','F07-dos-p2neg','F09-p2-uno','F13-solo-e',
                 'T01-atajo-g1','T02-atajo-g3','T06-fr-2pos','T16-fn-3neg','T19-fn-3pos','T24-fn-ninguna'];

/* ══ ANCHOS Y TEMAS ══════════════════════════════════════════════════════════════════════════
   790 y 770 estan a proposito: son los dos lados del umbral de 780 px, que es el unico numero
   que gobierna si el diagrama se dibuja. */
const ANCHOS = [1200, 900, 790, 770, 390, 360];
const TEMAS = ['oscuro', 'claro'];

/* CONTROL NEGATIVO: las vias que esta tanda NO toca. */
const SUB_OTRAS = ['S03-normal', 'S05-g3', 'S06-g1'];

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
  /* ⚠️ `ev()` ENVUELVE EN `return (...)`, ASI QUE NO SIRVE PARA UN CUERPO DE VARIAS SENTENCIAS:
     la inyeccion de la sonda y el recargado con la sesion puesta son bloques, no expresiones, y
     con el envoltorio dan «Unexpected token 'try'». Van por aca, sin envolver. */
  async function evCrudo(expr) {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error('EXC en evCrudo(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  }
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, End: 35, Home: 36, Space: 32 };
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
  /* CLIC REAL, con la comprobacion de QUIEN esta en el punto. Si el blanco esta tapado no se
     clickea a ciegas: se declara quien lo tapa y se cae al foco por DOM + Enter. */
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
  /* TECLAS REALES, una por caracter, con el `text` SOLO en el `char`. Tipea DESDE VACIO. */
  async function tipear(id, valor) {
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

  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await evCrudo(SONDA);

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y VUELVE A MITAD DE CORRIDA. Con `#modalAvisoEco`
     puesto, elementFromPoint devuelve ESE nodo y todos los clics de esta sonda caen en el
     overlay: cada escena informaria «sin cambios» sobre un tecleo que nunca ocurrio. Se cierra
     por su propio boton —como lo cierra el medico— y se COMPRUEBA antes de medir. */
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

  /* ⚠️ EL ORDEN DE TIPEO NO ES COSMETICO, Y ESTO SE MIDIO: `calcDiastol()` esta cableado SOLO a
     los cuatro campos del Doppler mitral, al LARS y a los dos <select> (lineas 3196, 3569 y
     3584-3596 de index.html). NO esta en el `oninput` del Vol AI, de la velocidad de la IT ni del
     TRIV, asi que cargar uno de esos tres DEJA EL CUADRO GRIS CON EL VEREDICTO ANTERIOR hasta que
     se toque un campo mitral o se genere el informe (`generarInforme` lo llama). Con el orden
     ingenuo —mitral primero y Vol AI despues— las primeras corridas de esta sonda informaron
     «sólo hay 1 parámetro evaluado» en catorce escenas que tenian cuatro cargados: una medicion
     falsa con pinta de buena. Se tipea lo NO cableado primero y lo cableado al final, que es un
     gesto real y deja el cuadro al dia sin forzar ninguna llamada. El desfase en si se mide
     aparte, en el grupo `desfase`. */
  const ORDEN = ['edad', 'peso', 'talla', 'fevi', 'sgl', 'vci_diam', 'triv', 'tde',
                 'venp_dur_ar', 'venp_dur_a', 'ai_vol', 'vmax_it',
                 'lars', 'ao_fc', 'e_sep', 'e_lat', 'onda_e', 'onda_a'];
  function enOrden(mapa) {
    const ks = Object.keys(mapa);
    const dentro = ORDEN.filter((k) => ks.indexOf(k) > -1);
    const fuera = ks.filter((k) => ORDEN.indexOf(k) < 0);
    return dentro.concat(fuera);
  }
  /* Carga una escena con TECLAS REALES y devuelve lo que quedo en cada campo. */
  async function cargar(c, sel, teclas) {
    const despeje = await ev(`window.__P.despejar()`);
    await ev(`window.__P.limpiar()`);
    await pausa(120);
    /* ⚠️ LOS <select> VAN PRIMERO, Y ESTO TAMBIEN SE MIDIO. `vci_col` dispara `calcPmAD` ->
       `calcPSAP`, que escribe `psap_calc` y NO llama a `calcDiastol`: poniendolo despues del
       tecleo, el cuadro gris quedaba con el veredicto anterior y la sonda informo «Presión de
       llenado normal» en el cuadro con la ventana diciendo «DD Grado II · 3 de 3» sobre el MISMO
       paciente — una medicion falsa con pinta de hallazgo. Con los selects primero, el ultimo
       gesto de la escena es siempre un campo cableado a `calcDiastol`. El desfase en si es
       pre-existente y se mide aparte, en el grupo `desfase`. */
    const sels = {};
    for (const id of Object.keys(sel || {})) sels[id] = await ev(`window.__P.set(${JSON.stringify(id)}, ${JSON.stringify(sel[id])})`);
    const tecleos = {};
    const todo = Object.assign({}, (Object.keys(c).length ? BASE : {}), c, teclas || {});
    for (const id of enOrden(todo)) tecleos[id] = await tipear(id, todo[id]);
    await pausa(120);
    return { tecleos, sels, despeje, todosOk: Object.keys(tecleos).every((k) => tecleos[k].ok) };
  }
  /* Abre la ventana con un CLIC REAL en el boton 🧭, lee, y la cierra con un clic real en la ✕.
     Se abre y se cierra por escena: el overlay es inset:0 con z-index 300, asi que dejandolo
     abierto los clics del tecleo siguiente caerian en el, no en los campos. */
  async function verVentana() {
    if (btn.err) return { err: btn.err };
    const abrir = await clicEn(btn.sel);
    const v = await ev(`window.__P.ventana()`);
    const cerrar = btnX.err ? { via: 'SIN BOTON' } : await clicEn(btnX.sel);
    const tras = await ev(`(function(){ var o=document.getElementById('diast-algo-overlay');
      return o ? getComputedStyle(o).display : 'NO EXISTE' })()`);
    return Object.assign({ viaAbrir: abrir.via, viaCerrar: cerrar.via, trasCerrar: tras }, v);
  }


  /* Los <select> de escenario van SIEMPRE primero, antes de cualquier tecla. El de la guia va
     antes que el del ritmo, y el `sexo` del paciente entra por la misma puerta. */
  const esc = (algo, extra) => Object.assign({ diast_algoritmo: algo || 'ase2025', diast_ritmo: 'sinusal' }, extra || {});

  /* ⚠️ LOS AVISOS AMBAR SE LEEN POR DISPLAY COMPUTADO, NO POR LA PROPIEDAD `hidden`. Este repo
     ya pago cuatro veces que una regla de autor le gana al [hidden] de la hoja del NAVEGADOR:
     un nodo con hidden=true puede seguir midiendo 104 x 44 px reales. */
  const leerAvisos = () => ev(`(function(){
    var o = {};
    ['diast-bse-eprima-aviso','diast-bse-gris-aviso','diast-excl-aviso','diast-fc-aviso'].forEach(function(id){
      var e = document.getElementById(id);
      o[id] = e ? { txt: window.__P.norm(e.textContent), disp: getComputedStyle(e).display } : 'NO EXISTE';
    });
    return o })()`);

  /* Lee TODO lo que una escena puede mover: el cuadro, los avisos y (si se pide) la ventana. */
  /* Abre la ventana, lee el diagrama / la tabla / la lista con GEOMETRIA de verdad, y cierra.
     ⚠️ NO SIRVE LEERLOS DESPUES DE `medir(true)`: esa funcion abre y CIERRA la ventana, asi que
     `getClientRects()` devuelve cero filas visibles y el grupo informaria «no hay diagrama»
     sobre un dibujo perfecto — un denominador roto con pinta de hallazgo. */
  async function verDibujo() {
    if (btn.err) return { err: btn.err };
    const despeje = await ev(`window.__P.despejar()`);
    const abrir = await clicEn(btn.sel);
    const dia = await ev(`window.__P.diagrama()`);
    const tabla = await ev(`window.__P.tabla()`);
    const lista = await ev(`window.__P.lista()`);
    const cerrar = btnX.err ? { via: 'SIN BOTON' } : await clicEn(btnX.sel);
    return { viaAbrir: abrir.via, viaCerrar: cerrar.via, despeje, dia, tabla, lista };
  }

  async function medir(conVentana) {
    const cuadro = await ev(`window.__P.cuadro()`);
    const avisos = await leerAvisos();
    const r = { cuadro, avisos };
    if (conVentana) {
      const ven = await verVentana();
      r.ventana = ven;
      /* ACUERDO: el renglon de resultado de la ventana tiene que ARRANCAR con el mismo veredicto
         que publica el badge del cuadro, sin el sufijo de la guia. Si no, volvieron a calcular
         por separado — que es exactamente el defecto que esta tanda cierra. */
      /* El sufijo de guia se saca para las CUATRO formas que la app escribe: la ventana ya lo
         lleva en su titulo, asi que su renglon de resultado no lo repite. */
      const b = String(cuadro.badge || '')
        .replace(/\s*—\s*(BSE 2024|ASE 2025|ASE 2016)\s*$/, '')
        .replace(/\s*\((BSE 2024|ASE 2025|ASE\/EACVI 2016)\)\s*$/, '').trim();
      r.badgeSinGuia = b;
      r.acuerdo = b !== '' && String(ven.res || '').indexOf(b) === 0;
    }
    return r;
  }

  /* ⚠️ EL ANCHO SE EMULA POR CDP Y NO REDIMENSIONANDO LA VENTANA: `Emulation.setDeviceMetricsOverride`
     es lo que mueve de verdad el media feature `width` en headless. Y se vuelve a 1400 al final
     de cada grupo: un override que queda puesto contamina el grupo siguiente, que es la clase de
     falso que este repo ya documenta para la emulacion del puntero. */
  async function ancho(px) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: px, height: 1000, deviceScaleFactor: 1, mobile: false }, sessionId);
    await pausa(160);
    return await ev(`({ innerWidth: window.innerWidth, matchMedia600: window.matchMedia('(min-width: 600px)').matches })`);
  }
  async function anchoLibre() { await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId); await pausa(120); }
  /* El tema es una CLASE en <html>; el toggle de la app la pone y la saca. Se pone por clase
     para no depender de un boton que puede vivir en otra pestania. */
  async function tema(t) {
    await ev(`(function(){ var h=document.documentElement;
      if (${JSON.stringify(t)} === 'claro') h.classList.add('light-mode'); else h.classList.remove('light-mode');
      return h.className })()`);
    await pausa(80);
    return await ev(`getComputedStyle(document.body).backgroundColor`);
  }

  const out = { archivo: FILE, md5Ini, avisoEstado, denominador: denom,
                boton: btn, cerrar: btnX };

  /* Carga una escena de CUALQUIERA de las tres vias: los <select> de escenario primero. */
  async function cargarEsc(e) {
    const sel = Object.assign({ diast_algoritmo: e._algo, diast_ritmo: e._ritmo }, e.sel || {});
    return await cargar(e.c, sel, e.teclas);
  }
  const porId = (ids) => TODAS.filter((e) => ids.indexOf(e.id) > -1);
  /* ⚠️ UN TECLEO QUE NO OCURRIO NO ES UNA MEDICION. Sin esto, un campo que no se pudo enfocar
     deja la escena describiendo OTRO paciente y el grupo informa su veredicto como si fuera el
     pedido — la clase de falso que este repo documenta tres veces. Se aborta y se nombra el
     campo, en vez de seguir midiendo. */
  function exigirCarga(e, carga) {
    if (carga.todosOk) return;
    const malos = Object.keys(carga.tecleos).filter((k) => !carga.tecleos[k].ok)
      .map((k) => k + ' (pedido ' + carga.tecleos[k].pedido + ', quedo "' + carga.tecleos[k].quedo + '", via ' + carga.tecleos[k].via + ')');
    throw new Error('TECLEO FALLIDO en ' + e.id + ': ' + malos.join(' · ')
      + ' | despeje: ' + JSON.stringify(carga.despeje));
  }

  /* ══ CAMINO ══ lo que devuelve el DUENIO, contra el veredicto que publica el CUADRO GRIS.
     Comparar el camino contra el objeto del que sale no probaria nada: el cuadro es la OTRA
     superficie, y es la que firma el informe. */
  if (hacer('camino')) {
    out.camino = [];
    for (const e of TODAS) {
      const carga = await cargarEsc(e);
      exigirCarga(e, carga);
      const cam = await ev(`window.__P.camino()`);
      const cuadro = await ev(`window.__P.cuadro()`);
      out.camino.push({ via: e._via, id: e.id, que: e.que,
        carga: carga.todosOk ? 'OK' : carga.tecleos,
        badge: cuadro.badge, clave: cam.clave, camino: cam.camino, n: cam.n,
        nodoFinal: cam.nodoFinal,
        /* ⚠️ EL ULTIMO NODO DEL CAMINO TIENE QUE SER EL NODO FINAL. Con mirar solo `nodoFinal`
           no se veria un camino al que le falta el remate, que es justo lo que pintaria el
           rojo terminando antes de la casilla del veredicto. */
        ultimoEsFinal: !!cam.camino && cam.camino.length > 0 && cam.camino[cam.camino.length - 1] === cam.nodoFinal,
        nodosDeFila: cam.nodosDeFila, nFilas: cam.nFilas });
    }
  }

  /* ══ DIAGRAMA ══ lo que de verdad quedo dibujado, a ancho ANCHO. */
  if (hacer('diagrama')) {
    out.diagrama = [];
    await ancho(1200);
    for (const e of porId(SUB_DIB)) {
      const carga = await cargarEsc(e);
      exigirCarga(e, carga);
      const cam = await ev(`window.__P.camino()`);
      const cuadro = await ev(`window.__P.cuadro()`);
      const dib = await verDibujo();
      out.diagrama.push({ via: e._via, id: e.id, que: e.que,
        carga: carga.todosOk ? 'OK' : carga.tecleos,
        badge: cuadro.badge, clave: cam.clave, camino: cam.camino, nodoFinal: cam.nodoFinal,
        viaAbrir: dib.viaAbrir, viaCerrar: dib.viaCerrar,
        dia: dib.dia, tabla: dib.tabla, lista: dib.lista,
        /* El dibujo tiene que pintar EXACTAMENTE los nodos del camino, ni uno mas ni uno menos. */
        pintaElCamino: !!dib.dia && dib.dia.existe
          && JSON.stringify((dib.dia.enCamino || []).slice().sort()) === JSON.stringify((cam.camino || []).slice().sort()),
        finalEsElDelCuadro: !!dib.dia && dib.dia.existe && dib.dia.final === cam.nodoFinal });
    }
    await anchoLibre();
  }

  /* ══ ANCHO ══ los dos lados del umbral de 780 px, en los dos temas. */
  if (hacer('ancho')) {
    out.ancho = [];
    for (const e of porId(['S04-g2', 'F04-tres', 'T06-fr-2pos', 'T19-fn-3pos'])) {
      await anchoLibre();
      await cargarEsc(e);
      for (const t of TEMAS) {
        await tema(t);
        for (const px of ANCHOS) {
          const w = await ancho(px);
          const dib = await verDibujo();
          out.ancho.push({ via: e._via, id: e.id, tema: t, px, innerWidth: w.innerWidth,
            hayDiagrama: !!dib.dia && dib.dia.existe && dib.dia.dispCaja !== 'none',
            dispCaja: dib.dia ? dib.dia.dispCaja : 'SIN SVG',
            texto: dib.dia ? dib.dia.texto : null,
            tablaDisp: dib.tabla && dib.tabla.existe ? dib.tabla.disp : 'NO EXISTE',
            listaDisp: dib.lista ? dib.lista.dispCaja : null,
            listaVisibles: dib.lista ? dib.lista.nVisibles : null });
        }
      }
      await tema('oscuro');
    }
    await anchoLibre();
  }

  /* ══ ANGOSTO ══ A/B contra HEAD a 360 px: la ventana tiene que ser la de HEAD, letra por
     letra. Se compara el texto VISIBLE y no el innerHTML: a secas, el innerHTML diria
     «distinto» por el solo hecho de que el SVG existe en el arbol aunque no se vea. */
  if (hacer('angosto')) {
    out.angosto = [];
    await ancho(360);
    for (const e of TODAS) {
      const carga = await cargarEsc(e);
      const dib = await verDibujo();
      out.angosto.push({ via: e._via, id: e.id, carga: carga.todosOk ? 'OK' : carga.tecleos,
        hayDiagrama: !!dib.dia && dib.dia.existe && dib.dia.dispCaja !== 'none',
        nFilas: dib.lista ? dib.lista.nFilas : null,
        nVisibles: dib.lista ? dib.lista.nVisibles : null,
        hashVisible: dib.lista ? dib.lista.hashVisible : null,
        txtVisible: dib.lista ? dib.lista.txtVisible : null });
    }
    await anchoLibre();
  }

  /* ══ TABLA ══ el plegable con teclas REALES: estado inicial, Enter, y que sobreviva a un
     repintado (que es lo que `ontoggle` no podia conservar). */
  if (hacer('tabla')) {
    out.tabla = [];
    await ancho(1200);
    for (const e of porId(['S04-g2', 'F04-tres', 'T06-fr-2pos', 'T19-fn-3pos'])) {
      await cargarEsc(e);
      const abrir = await clicEn(btn.sel);
      const ini = await ev(`window.__P.tabla()`);
      const sumId = await ev(`(function(){ var d=document.querySelector('#diast-algo-cuerpo details[data-bse-tabla]');
        if(!d) return 'NO EXISTE'; var s=d.querySelector('summary'); if(!s) return 'SIN SUMMARY';
        if(!s.id) s.id='__bseSum'; return s.id })()`);
      let trasEnter = null, trasRepintar = null;
      if (sumId && sumId.indexOf('NO ') !== 0 && sumId !== 'SIN SUMMARY') {
        await ev(`(function(){ var s=document.getElementById(${JSON.stringify(sumId)}); if(s) s.focus(); return 1 })()`);
        await tecla('Enter', '\r');
        await pausa(160);
        trasEnter = await ev(`window.__P.tabla()`);
        /* El repintado que el medico provoca con cada tecla: la tabla NO se puede cerrar sola. */
        await ev(`(function(){ try{ diastAlgoRender() }catch(x){} return 1 })()`);
        await pausa(120);
        trasRepintar = await ev(`window.__P.tabla()`);
      }
      const cerrar = btnX.err ? { via: 'SIN BOTON' } : await clicEn(btnX.sel);
      out.tabla.push({ via: e._via, id: e.id, viaAbrir: abrir.via, viaCerrar: cerrar.via,
        sumId, ini, trasEnter, trasRepintar });
    }
    await anchoLibre();
  }

  /* ══ SUPERFICIES ══ LAS SEIS, UNA POR UNA. Nunca «el informe y el Excel» en bloque: cada una
     tiene su propio emisor y se rompen por separado. Se mide a ancho ANCHO, que es donde el
     diagrama SI esta dibujado: es donde una fuga a una superficie firmada se veria. */
  if (hacer('superficies')) {
    out.superficies = [];
    await ancho(1200);
    for (const e of TODAS) {
      const carga = await cargarEsc(e);
      exigirCarga(e, carga);
      const s = { via: e._via, id: e.id, que: e.que, carga: 'OK', estilos: {} };
      for (const est of ['narrativo', 'telegrafico', 'estructurado']) {
        const r = await ev(`window.__P.informe(${JSON.stringify(est)})`);
        s.estilos[est] = { lineas: await ev(`window.__P.lineaDiast(${JSON.stringify(r.inf)})`),
                           suma: await ev(`window.__P.norm(${JSON.stringify(r.suma)})`),
                           lab: await ev(`window.__P.labGrado(${JSON.stringify(r.inf)}, ${JSON.stringify(r.suma)})`) };
      }
      s.excel = await ev(`window.__P.excelCols()`);
      s.ppt = await ev(`window.__P.pptDiast()`);
      s.cuadro = await ev(`window.__P.cuadro()`);
      /* ⚠️ EL HASH DE CAMPOS SE TOMA SIN LOS DOS <textarea>: `informe_texto` y `en_suma` son
         campos con id y cambian en toda escena cuya frase cambia, asi que un hash que los
         incluya deja de decir nada sobre los campos DEL ESTUDIO. */
      s.camposHash = await ev(`window.__P.hash(JSON.stringify((function(){ var c = window.__P.campos();
        delete c.informe_texto; delete c.en_suma; return c })()))`);
      out.superficies.push(s);
    }
    await anchoLibre();
  }

  /* ══ EXCELAB ══ la fila del Excel clave por clave: es lo unico que caza una columna agregada
     o movida, que el numero 435 por si solo no distingue de dos cambios que se compensan. */
  if (hacer('excelab')) {
    out.excelab = [];
    await ancho(1200);
    for (const e of porId(['S04-g2', 'S05-g3', 'F04-tres', 'T06-fr-2pos', 'T19-fn-3pos'])) {
      const carga = await cargarEsc(e);
      await ev(`window.__P.informe('narrativo')`);
      out.excelab.push({ via: e._via, id: e.id, carga: carga.todosOk ? 'OK' : carga.tecleos,
        fila: await ev(`window.__P.excel()`),
        camposSinInforme: await ev(`(function(){ var c = window.__P.campos();
          delete c.informe_texto; delete c.en_suma; return c })()`) });
    }
    await anchoLibre();
  }

  /* ══ OTRAS ══ CONTROL NEGATIVO MAYOR: las vias que esta tanda NO toca. La BSE 2024 en ritmo
     sinusal y en FA —que YA tienen diagrama y tienen que quedar identicas— y la ASE/EACVI 2016
     en FA, que NO tiene algoritmo en la app y se queda sin diagrama. Se mide a ancho ANCHO, que
     es donde el diagrama aparece: es el unico ancho donde una fuga se veria. */
  if (hacer('otras')) {
    out.otras = [];
    await ancho(1200);
    for (const cfg of [{ algo: 'bse2024', ritmo: 'sinusal' }, { algo: 'bse2024', ritmo: 'fa' },
                       { algo: 'ase2016', ritmo: 'fa' }]) {
      for (const e of porId(SUB_OTRAS)) {
        const esc2 = Object.assign({}, e, { _algo: cfg.algo, _ritmo: cfg.ritmo });
        const carga = await cargarEsc(esc2);
        const m = await medir(true);
        const dib = await verDibujo();
        out.otras.push(Object.assign({ guia: cfg.algo, ritmo: cfg.ritmo, id: e.id,
          carga: carga.todosOk ? 'OK' : carga.tecleos,
          hayDiagrama: !!dib.dia && dib.dia.existe,
          fig: dib.dia && dib.dia.existe ? dib.dia.fig : null,
          camino: (await ev(`window.__P.camino()`)).camino,
          dia: dib.dia, tabla: dib.tabla, lista: dib.lista }, m));
      }
    }
    await anchoLibre();
  }

  /* ══ GEO ══ la geometria cruda del SVG: cajas y rotulos en unidades del viewBox. */
  if (hacer('geo')) {
    out.geo = [];
    await ancho(1200);
    /* Por defecto TODAS las escenas de la via que tiene diagrama: una superposicion depende del
       nodo FINAL de cada paciente, asi que medir una sola escena no dice nada de las otras. */
    const QUE = arg('--escenas') ? porId(arg('--escenas').split(',')) : TODAS;
    for (const e of QUE) {
      const carga = await cargarEsc(e);
      exigirCarga(e, carga);
      await clicEn(btn.sel);
      const G = await ev(`window.__P.geo()`);
      if (!G.existe) { out.geo.push({ via: e._via, id: e.id, geo: G, sinDiagrama: true });
        if (!btnX.err) await clicEn(btnX.sel); continue; }
      /* ⚠️ LA SUPERPOSICION DE ROTULOS SE MIDE, NO SE MIRA EN EL PNG. Dos rotulos a la misma
         altura y con sus cajas de texto solapadas se imprimen uno encima del otro, y un rotulo
         que cae dentro de una caja queda TAPADO —las cajas se dibujan despues de las lineas—:
         ninguna de las dos cosas desaparece de una forma que se note. El ancho del texto se
         estima en 5,2 px por caracter a 10 px, que es la fuente de `.ar-et`. */
      const caja = (r) => { const w = r.txt.length * 5.2;
        return { x0: r.anchor === 'start' ? r.x : r.x - w / 2, x1: r.anchor === 'start' ? r.x + w : r.x + w / 2,
                 y0: r.y - 8, y1: r.y + 2, txt: r.txt }; };
      const todos = (G.rots || []).map(caja).concat((G.fin || []).map((f) => caja({ txt: f.txt, x: f.x, y: f.y, anchor: 'middle' })));
      const choques = [];
      for (let i = 0; i < todos.length; i++) for (let j = i + 1; j < todos.length; j++) {
        const a = todos[i], b = todos[j];
        if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) choques.push(a.txt + ' ✖ ' + b.txt);
      }
      const tapados = [];
      todos.forEach((r) => (G.nodos || []).forEach((n) => {
        if (r.x0 < n.x + n.w && n.x < r.x1 && r.y0 < n.y + n.h && n.y < r.y1) tapados.push(r.txt + ' tapado por ' + n.id);
      }));
      out.geo.push({ via: e._via, id: e.id, geo: G, choques, tapados,
                     nRotulos: todos.length, limpio: choques.length === 0 && tapados.length === 0 });
      if (!btnX.err) await clicEn(btnX.sel);
    }
    await anchoLibre();
  }

  /* ══ CAPTURA ══ PNG del dibujo en los dos temas, para mirarlo con los ojos. */
  if (hacer('captura')) {
    out.captura = [];
    const OUT = arg('--out') || '/tmp';
    await ancho(1200);
    for (const e of porId((arg('--escenas') || 'S04-g2,F04-tres,T06-fr-2pos,T19-fn-3pos').split(','))) {
      await cargarEsc(e);
      for (const t of TEMAS) {
        await tema(t);
        await clicEn(btn.sel);
        if (process.argv.indexOf('--abrir-tabla') > -1) {
          await ev(`(function(){ var d=document.querySelector('#diast-algo-cuerpo details[data-bse-tabla]');
            if(d) d.open = true; return 1 })()`);
          await pausa(150);
        }
        /* ⚠️ UN RECORTE MAS ALTO QUE LA VENTANA SALE EN NEGRO: la tarjeta scrollea y
           captureScreenshot no dibuja lo que no esta renderizado. Se lleva el blanco a la vista
           con un scroll REAL y se vuelve a medir el rect antes de recortar. */
        const r = await ev(`(function(){
          var n = document.querySelector('#diast-algo-cuerpo [data-bse-diag-caja]');
          if (!n) return null;
          /* ⚠️ scrollIntoView DEJA LA PRIMERA CAJA DEBAJO DEL ENCABEZADO FIJO de la tarjeta, y
             el recorte sale sin ella: parece que el diagrama empieza en el paso 1. Se lleva el
             cuerpo a su tope, que es lo que de verdad deja el dibujo entero a la vista. */
          var cu = document.getElementById('diast-algo-cuerpo');
          if (cu) cu.scrollTop = 0;
          var b = n.getBoundingClientRect();
          return { x: Math.max(0, Math.round(b.left)), y: Math.max(0, Math.round(b.top)),
                   w: Math.round(b.width), h: Math.round(b.height),
                   vh: window.innerHeight, cabe: (b.top >= 0 && b.bottom <= window.innerHeight) } })()`);
        let arch = null;
        if (r && r.w > 0 && r.h > 0) {
          const alto = Math.min(r.h, r.vh - r.y);
          const shot = await cdp.send('Page.captureScreenshot',
            { format: 'png', clip: { x: r.x, y: r.y, width: r.w, height: alto, scale: 2 } }, sessionId);
          arch = join(OUT, 'diag_' + e.id + '_' + t + '.png');
          await writeFile(arch, Buffer.from(shot.data, 'base64'));
        }
        out.captura.push({ via: e._via, id: e.id, tema: t, rect: r, archivo: arch });
        const cerrar = btnX.err ? null : await clicEn(btnX.sel);
        if (cerrar) out.captura[out.captura.length - 1].viaCerrar = cerrar.via;
      }
      await tema('oscuro');
    }
    await anchoLibre();
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  out.md5Igual = out.md5Ini === out.md5Fin;
  cdp.close();
  await new Promise((r) => srv.close(r));
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
