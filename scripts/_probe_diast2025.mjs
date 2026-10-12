#!/usr/bin/env node
/**
 * _probe_diast2025.mjs — sonda A/B de SOLO LECTURA para la FUNCION DIASTOLICA ASE 2025 en RITMO
 * SINUSAL: el cuadro gris (#dd-interp), la ventana del boton 🧭 y las superficies firmadas.
 *
 * Infraestructura calcada de scripts/_probe_emsignif.mjs (teclas y clics reales, cierre del arbol
 * de Chrome por GRUPO, cierre del aviso legal con su denominador, md5 al principio y al final).
 * NO muta index.html.
 *
 *   node scripts/_probe_diast2025.mjs --file /tmp/index.HEAD.html > /tmp/d.HEAD.json
 *   node scripts/_probe_diast2025.mjs                             > /tmp/d.NEW.json
 *
 * Grupos (--solo cuadro|ventana|bordes|superficies|fa|otros):
 *   cuadro      — para cada escena: el badge, la frase del informe y la del EN SUMA.
 *   ventana     — la MISMA escena leida desde la ventana 🧭: filas, estado de cada criterio y
 *                 renglon de resultado. Y la pregunta que motivo la tanda: cuadro y ventana
 *                 dicen LO MISMO? Se informa el denominador (cuantas filas vio).
 *   desfase     — el cuadro gris NO se repinta al cargar Vol AI, IT ni TRIV (pre-existente).
 *   bordes      — tripletes por parametro: apenas abajo, justo en el corte, apenas arriba.
 *   superficies — informe en 3 estilos, EN SUMA en 3 estilos, columnas del Excel, el texto que
 *                 lee el PPT (#dd-interp), el grado que deriva el Laboratorio y el hash de los
 *                 campos guardados.
 *   fa          — CONTROL NEGATIVO: con ritmo = FA nada de esta tanda puede cambiar.
 *   otros       — CONTROL NEGATIVO: BSE 2024 y ASE/EACVI 2016 no se tocan.
 *
 * ⚠️ DENOMINADOR. Un conteo de filas sobre una ventana que no abrio da cero y parece acuerdo
 * perfecto; una escena tipeada sobre un campo sin geometria deja el campo vacio y todo sale
 * «sin cambios». Cada escena informa que tipeo, que quedo en el campo y cuantas filas vio.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
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

  /* Columnas del Excel: el NUMERO es lo que fija la verificacion (434) y las claves el detalle. */
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
   Cada escena es un PACIENTE, no un tecleo: el mapa dice que campos tiene cargados. Los seis
   numericos de la diastolica se tipean con TECLAS REALES; los <select> de escenario (ritmo,
   algoritmo, colapso de VCI) van por `set`, que NO es un gesto medido y se declara como tal.
   peso/talla van en toda escena con Vol AI: sin ASC no hay volumen indexado y el criterio queda
   «sin dato» — un denominador roto que se lee como «el criterio no se cumple». */
const BASE = { peso: '70', talla: '170' };
const ESCENAS = [
  { id: 'S00-vacio', que: 'formulario vacio', c: {} },
  { id: 'S01-solo-esep', que: "solo e' septal 10 (sin ningun otro parametro)", c: { e_sep: '10' } },
  { id: 'S02-escena31', que: "ESCENA 3.1 DEL REPORTE: e' septal 6,5 y lateral 12", c: { e_sep: '6.5', e_lat: '12', onda_e: '90', onda_a: '60', ai_vol: '40', vmax_it: '2.0' } },
  { id: 'S03-normal', que: "e' conservada, todo negativo (el paciente de TC-28)", c: { e_sep: '10', e_lat: '13', onda_e: '70', onda_a: '70', ai_vol: '40', vmax_it: '2.0' } },
  { id: 'S04-g2', que: "grado 2 por segundo paso (el paciente de TC-29)", c: { e_sep: '5', e_lat: '7', onda_e: '90', onda_a: '60', ai_vol: '80', vmax_it: '2.5' } },
  { id: 'S05-g3', que: 'grado 3: las tres principales positivas y E/A 2,4', c: { e_sep: '5', e_lat: '6', onda_e: '120', onda_a: '50', ai_vol: '80', vmax_it: '3.0' } },
  { id: 'S06-g1', que: "grado 1: e' reducida sola con E/A 0,71", c: { e_sep: '5', e_lat: '6', onda_e: '50', onda_a: '70', ai_vol: '40', vmax_it: '2.0' } },
  { id: 'S07-estadoA', que: "ESTADO (a): e' reducida sola, E/A 1,20 y segundo paso NEGATIVO", c: { e_sep: '5', e_lat: '6', onda_e: '60', onda_a: '50', ai_vol: '40', vmax_it: '2.0', lars: '30' } },
  { id: 'S08-eeSola', que: "E/e' positivo solo, segundo paso negativo", c: { e_sep: '10', e_lat: '13', onda_e: '180', onda_a: '90', ai_vol: '40', vmax_it: '2.0', lars: '30' } },
  { id: 'S09-trSola', que: 'IT positiva sola, segundo paso con Vol AI positivo', c: { e_sep: '10', e_lat: '13', onda_e: '70', onda_a: '60', ai_vol: '80', vmax_it: '3.2' } },
  { id: 'S10-psap35', que: 'P6: IT 2,6 NEGATIVA pero PSAP 35 positiva (VCI 15 mm, colapso <50)', c: { e_sep: '5', e_lat: '6', onda_e: '90', onda_a: '60', ai_vol: '40', vmax_it: '2.6' }, sel: { vci_col: '<50' }, teclas: { vci_diam: '15' } },
  { id: 'S11-psap34', que: 'CONTROL NEGATIVO de P6: IT 2,55 y PSAP 34, las dos negativas', c: { e_sep: '5', e_lat: '6', onda_e: '90', onda_a: '60', ai_vol: '40', vmax_it: '2.55' }, sel: { vci_col: '<50' }, teclas: { vci_diam: '15' } },
  { id: 'S12-p2flip', que: "P2: e' septal 6,3 SOLO (6,3 no es ≤6 y con un anillo no hay promedio)", c: { e_sep: '6.3', onda_e: '85', onda_a: '100', ai_vol: '65', vmax_it: '2.0' } },
  { id: 'S13-p1flip', que: "P1: e' septal 7,0 SOLO, E/e' septal 14,29 (el corte septal es ≥15)", c: { e_sep: '7', onda_e: '100', onda_a: '70', ai_vol: '72', vmax_it: '2.5' } },
  { id: 'S14-p3flip', que: "P3: E/e' 14,00 y IT 2,80 EXACTOS", c: { e_sep: '7', e_lat: '7', onda_e: '98', onda_a: '70', ai_vol: '40', vmax_it: '2.8', lars: '25' } },
  { id: 'S15-p4flip', que: 'P4: presion elevada con E/A 0,75 (el grado 2 no lleva piso)', c: { e_sep: '5', onda_e: '60', onda_a: '80', ai_vol: '72', vmax_it: '3.0' } },
  { id: 'S16-estadoB', que: "ESTADO (b): e' 10 y onda E 70, sin NINGUN parametro del segundo paso", c: { e_sep: '10', onda_e: '70' } },
  { id: 'S17-insuf', que: "datos insuficientes: SOLO e' septal 10 (se conserva la frase de HEAD)", c: { e_sep: '10' } },
  { id: 'S18-ivrt', que: 'alternativa del segundo paso: TRIV 60 ms con el resto sin medir', c: { e_sep: '10', onda_e: '70', triv: '60' } },
  { id: 'S19-larsBorde', que: 'LARS 18,0 exacto en el segundo paso', c: { e_sep: '10', e_lat: '13', onda_e: '180', onda_a: '90', ai_vol: '40', lars: '18', vmax_it: '2.0' } }
];

/* Tripletes de borde: apenas abajo / justo en el corte / apenas arriba. El campo que se mueve es
   el ultimo del mapa; los demas fijan la escena. Cada triplete trae su CONTROL NEGATIVO implicito
   (el valor de abajo), que es lo que distingue un corte de una sonda que dice si a todo. */
const BORDES = [
  { id: 'B1-eeProm', que: "E/e' promedio (corte ≥14 por la Figura 3)", fijo: { e_sep: '7', e_lat: '7', onda_a: '70', ai_vol: '40', vmax_it: '2.0' }, campo: 'onda_e', vals: ['97', '98', '99'], nota: '13,857 / 14,000 / 14,143' },
  { id: 'B2-eeSeptal', que: "E/e' SEPTAL con un solo anillo (corte ≥15)", fijo: { e_sep: '6', onda_a: '70', ai_vol: '40', vmax_it: '2.0' }, campo: 'onda_e', vals: ['89', '90', '91'], nota: '14,83 / 15,00 / 15,17' },
  { id: 'B3-eeLateral', que: "E/e' LATERAL con un solo anillo (corte ≥13)", fijo: { e_lat: '10', onda_a: '70', ai_vol: '40', vmax_it: '2.0' }, campo: 'onda_e', vals: ['129', '130', '131'], nota: '12,90 / 13,00 / 13,10' },
  { id: 'B4-esepSolo', que: "e' SEPTAL con un solo anillo (corte ≤6)", fijo: { onda_e: '60', onda_a: '70', ai_vol: '40', vmax_it: '2.0' }, campo: 'e_sep', vals: ['5.9', '6', '6.1'], nota: 'el promedio ≤6,5 NO aplica con un anillo' },
  { id: 'B5-elatSolo', que: "e' LATERAL con un solo anillo (corte ≤7)", fijo: { onda_e: '60', onda_a: '70', ai_vol: '40', vmax_it: '2.0' }, campo: 'e_lat', vals: ['6.9', '7', '7.1'], nota: '' },
  { id: 'B6-epromDos', que: "e' PROMEDIO con los dos anillos (corte ≤6,5)", fijo: { e_sep: '6.4', onda_e: '60', onda_a: '70', ai_vol: '40', vmax_it: '2.0' }, campo: 'e_lat', vals: ['6.5', '6.6', '7.1'], nota: 'promedio 6,45 / 6,50 / 6,75 — con 7,1 el lateral deja de votar' },
  { id: 'B7-it', que: 'velocidad de la IT (corte ≥2,8 por la Figura 3)', fijo: { e_sep: '10', e_lat: '13', onda_e: '70', onda_a: '70', ai_vol: '40' }, campo: 'vmax_it', vals: ['2.79', '2.8', '2.81'], nota: '' },
  { id: 'B8-lavi', que: 'Vol AI indexado del segundo paso (corte >34)', fijo: { e_sep: '10', e_lat: '13', onda_e: '180', onda_a: '90', vmax_it: '2.0' }, campo: 'ai_vol', vals: ['61', '62', '63'], nota: 'con ASC 1,81: 33,7 / 34,2 / 34,8' },
  { id: 'B9-lars', que: 'LARS del segundo paso (corte ≤18)', fijo: { e_sep: '10', e_lat: '13', onda_e: '180', onda_a: '90', ai_vol: '40', vmax_it: '2.0' }, campo: 'lars', vals: ['17.9', '18', '18.1'], nota: '' },
  { id: 'B10-triv', que: 'TRIV, alternativa del segundo paso (corte ≤70)', fijo: { e_sep: '10', onda_e: '70' }, campo: 'triv', vals: ['69', '70', '71'], nota: 'sin ninguno de los tres del segundo paso' },
  { id: 'B11-eaG1', que: 'E/A del grado 1 (corte ≤0,80)', fijo: { e_sep: '5', e_lat: '6', onda_e: '80', ai_vol: '40', vmax_it: '2.0' }, campo: 'onda_a', vals: ['99', '100', '101'], nota: '0,808 / 0,800 / 0,792 — el corte se cruza AL BAJAR la onda A' },
  { id: 'B12-eaG3', que: 'E/A del grado 3 (corte ≥2,00)', fijo: { e_sep: '5', e_lat: '6', onda_e: '200', ai_vol: '80', vmax_it: '3.0' }, campo: 'onda_a', vals: ['99', '100', '101'], nota: '2,020 / 2,000 / 1,980' }
];

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
  const ORDEN = ['peso', 'talla', 'vci_diam', 'triv', 'ai_vol', 'vmax_it', 'lars',
                 'e_sep', 'e_lat', 'onda_e', 'onda_a'];
  function enOrden(mapa) {
    const ks = Object.keys(mapa);
    const dentro = ORDEN.filter((k) => ks.indexOf(k) > -1);
    const fuera = ks.filter((k) => ORDEN.indexOf(k) < 0);
    return dentro.concat(fuera);
  }
  /* Carga una escena con TECLAS REALES y devuelve lo que quedo en cada campo. */
  async function cargar(c, sel, teclas) {
    await ev(`window.__P.limpiar()`);
    await pausa(120);
    const tecleos = {};
    const todo = Object.assign({}, (Object.keys(c).length ? BASE : {}), c, teclas || {});
    for (const id of enOrden(todo)) tecleos[id] = await tipear(id, todo[id]);
    const sels = {};
    for (const id of Object.keys(sel || {})) sels[id] = await ev(`window.__P.set(${JSON.stringify(id)}, ${JSON.stringify(sel[id])})`);
    await pausa(120);
    return { tecleos, sels, todosOk: Object.keys(tecleos).every((k) => tecleos[k].ok) };
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

  const out = { archivo: FILE, md5Ini, pendrive: null, avisoEstado, denominador: denom,
                boton: btn, cerrar: btnX };

  if (hacer('cuadro') || hacer('ventana')) {
    out.escenas = [];
    for (const e of ESCENAS) {
      const carga = await cargar(e.c, e.sel, e.teclas);
      const cuadro = await ev(`window.__P.cuadro()`);
      const r = { id: e.id, que: e.que, carga: carga.todosOk ? 'TODOS OK' : carga.tecleos,
                  sels: Object.keys(carga.sels).length ? carga.sels : undefined, cuadro };
      if (hacer('ventana')) r.ventana = await verVentana();
      out.escenas.push(r);
    }
  }

  if (hacer('desfase')) {
    /* EL DESFASE DEL CUADRO, MEDIDO Y NO SUPUESTO. Se tipea en el orden INGENUO —los cuatro
       campos mitrales primero y el Vol AI y la IT despues— y se lee el cuadro, la ventana y el
       informe. La ventana se repinta con el oyente de documento de `diastAlgoRender`, asi que es
       la unica de las tres que no se queda atras. Pre-existente: NO lo toca esta tanda. */
    const e = ESCENAS.find((x) => x.id === 'S04-g2');
    await ev(`window.__P.limpiar()`);
    await pausa(120);
    const pasos = [];
    for (const id of ['peso', 'talla', 'e_sep', 'e_lat', 'onda_e', 'onda_a', 'ai_vol', 'vmax_it']) {
      const t = await tipear(id, Object.assign({}, BASE, e.c)[id]);
      const cu = await ev(`window.__P.cuadro()`);
      pasos.push({ campo: id, quedo: t.quedo, badge: cu.badge, texto: (cu.texto || '').slice(0, 80) });
    }
    const venAntes = await verVentana();
    const inf = await ev(`window.__P.informe('narrativo')`);
    const cuDespues = await ev(`window.__P.cuadro()`);
    out.desfase = { pasos, ventanaAlFinal: { res: venAntes.res, nFilas: venAntes.nFilas },
                    cuadroTrasGenerarInforme: cuDespues.badge,
                    lineaInforme: await ev(`window.__P.lineaDiast(${JSON.stringify(inf.inf)})`) };
  }

  if (hacer('bordes')) {
    out.bordes = [];
    for (const b of BORDES) {
      const tri = [];
      for (const val of b.vals) {
        const c = Object.assign({}, b.fijo); c[b.campo] = val;
        const carga = await cargar(c);
        const cuadro = await ev(`window.__P.cuadro()`);
        const ven = await verVentana();
        tri.push({ [b.campo]: val, carga: carga.todosOk ? 'OK' : carga.tecleos,
                   badge: cuadro.badge, texto: cuadro.texto, suma: cuadro.suma,
                   filas: ven.filas, res: ven.res, nFilas: ven.nFilas });
      }
      out.bordes.push({ id: b.id, que: b.que, campo: b.campo, nota: b.nota, triplete: tri });
    }
  }

  if (hacer('superficies')) {
    /* LAS SEIS SUPERFICIES, UNA POR UNA. El informe y el EN SUMA en los TRES estilos, el Excel
       con su CUENTA de columnas, lo que lee la franja del PPT, el grado que deriva el
       Laboratorio del TEXTO y el hash de los campos que viajan con el estudio. */
    out.superficies = [];
    for (const e of ESCENAS) {
      const carga = await cargar(e.c, e.sel, e.teclas);
      const uno = { id: e.id, carga: carga.todosOk ? 'OK' : carga.tecleos, estilos: {} };
      for (const est of ['conciso', 'estandar', 'narrativo']) {
        const r = await ev(`window.__P.informe(${JSON.stringify(est)})`);
        uno.estilos[est] = { lineas: await ev(`window.__P.lineaDiast(${JSON.stringify(r.inf)})`),
                            suma: await ev(`window.__P.lineaDiast(${JSON.stringify(r.suma)})`),
                            hashInf: await ev(`window.__P.hash(${JSON.stringify(r.inf)})`),
                            hashSuma: await ev(`window.__P.hash(${JSON.stringify(r.suma)})`) };
        if (est === 'narrativo') uno.lab = await ev(`window.__P.labGrado(${JSON.stringify(r.inf)}, ${JSON.stringify(r.suma)})`);
      }
      uno.excel = await ev(`window.__P.excelCols()`);
      uno.ppt = await ev(`window.__P.pptDiast()`);
      uno.campos = await ev(`window.__P.hash(JSON.stringify(window.__P.campos()))`);
      out.superficies.push(uno);
    }
  }

  if (hacer('fa')) {
    /* CONTROL NEGATIVO DE LA FA. Es OTRO TRABAJO: ni una letra puede cambiar. Se mide con los dos
       protocolos que pueden llegar a FA (el recomendado y la BSE) sobre el mismo paciente. */
    out.fa = [];
    for (const algo of ['ase2025', 'bse2024', 'ase2016']) {
      for (const esc of ['S04-g2', 'S13-p1flip']) {
        const e = ESCENAS.find((x) => x.id === esc);
        await cargar(e.c, e.sel, e.teclas);
        await ev(`window.__P.set('diast_algoritmo', ${JSON.stringify(algo)})`);
        await ev(`window.__P.set('diast_ritmo', 'fa')`);
        await pausa(140);
        const cuadro = await ev(`window.__P.cuadro()`);
        const r = await ev(`window.__P.informe('narrativo')`);
        out.fa.push({ algo, escena: esc, cuadro,
                      lineas: await ev(`window.__P.lineaDiast(${JSON.stringify(r.inf)})`),
                      suma: await ev(`window.__P.lineaDiast(${JSON.stringify(r.suma)})`) });
        await ev(`window.__P.set('diast_ritmo', 'sinusal')`);
        await ev(`window.__P.set('diast_algoritmo', 'ase2025')`);
      }
    }
  }

  if (hacer('otros')) {
    /* CONTROL NEGATIVO DE LOS OTROS DOS PROTOCOLOS en ritmo SINUSAL. B1 a B7 del reporte van a
       otro trabajo: aca solo se prueba que esta tanda no los movio. */
    out.otros = [];
    for (const algo of ['bse2024', 'ase2016']) {
      for (const esc of ['S03-normal', 'S04-g2', 'S05-g3', 'S12-p2flip', 'S13-p1flip', 'S14-p3flip']) {
        const e = ESCENAS.find((x) => x.id === esc);
        await cargar(e.c, e.sel, e.teclas);
        await ev(`window.__P.set('diast_algoritmo', ${JSON.stringify(algo)})`);
        await pausa(140);
        const cuadro = await ev(`window.__P.cuadro()`);
        const ven = await verVentana();
        const r = await ev(`window.__P.informe('narrativo')`);
        out.otros.push({ algo, escena: esc, cuadro,
                         ventana: { titulo: ven.titulo, res: ven.res, nFilas: ven.nFilas, filas: ven.filas },
                         lineas: await ev(`window.__P.lineaDiast(${JSON.stringify(r.inf)})`),
                         suma: await ev(`window.__P.lineaDiast(${JSON.stringify(r.suma)})`) });
        await ev(`window.__P.set('diast_algoritmo', 'ase2025')`);
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
