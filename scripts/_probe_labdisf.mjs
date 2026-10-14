#!/usr/bin/env node
/**
 * _probe_labdisf.mjs — sonda A/B de SOLO LECTURA para el LABORATORIO (2026-10-14):
 *   R1 · la disfuncion sistolica del VENTRICULO DERECHO deja de contarse como del IZQUIERDO, y
 *        pasa a ser una categoria propia con su columna de Excel (435 -> 436).
 *   R2 · el LARS en VALOR ABSOLUTO en el importador: -32 y 32 tienen que dar lo mismo.
 *
 * Infraestructura calcada de scripts/_probe_exclusiones.mjs (teclas y clics reales, cierre del
 * arbol de Chrome por GRUPO, despeje del aviso legal, md5 al principio y al final).
 * NO muta index.html.
 *
 *   node scripts/_probe_labdisf.mjs --file /tmp/index.HEAD.html > /tmp/ld.HEAD.json
 *   node scripts/_probe_labdisf.mjs                             > /tmp/ld.NEW.json
 *
 * Grupos (--solo censo|excel|lars|controles):
 *   censo      — las escenas de VD y de VI se cargan con TECLAS REALES, se GENERA el informe en
 *                los tres estilos y se lee la frase que sale. La categoria NO se afirma: se le
 *                pregunta a `_labHallazgosCuenta`, que es el consumidor real (dashboard, PDF de
 *                auditoria y PPT). Corriendo la misma sonda contra HEAD se obtiene el «antes».
 *   excel      — la fila del Excel: cuantas columnas, donde cae la nueva y si alguna columna
 *                EXISTENTE cambio de valor (se comparan clave por clave contra HEAD).
 *   lars       — el importador con el MISMO valor y los dos signos, por su propia guarda de
 *                rango, mas la marca de pantalla y el valor que queda guardado.
 *   controles  — CONTROL NEGATIVO: el resto del Laboratorio (geometria, diastolica, HTP,
 *                valvulopatias) y el informe, el EN SUMA y el PPT, IDENTICOS a HEAD.
 *
 * ⚠️ LA CATEGORIA SE LE PREGUNTA AL CONSUMIDOR Y NO SE REIMPLEMENTA. Una sonda que aplicara la
 * expresion regular por su cuenta mediria su propia copia del criterio, no el de la app.
 *
 * ⚠️ DENOMINADOR. Cada escena informa la frase EXACTA que salio y los campos que quedaron. Una
 * escena cuyo tecleo no llego produce un informe sin la frase y la tabla diria «no clasifica»
 * sobre una frase que nunca se emitio: `tipear` ABORTA si el valor no queda.
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
    /* ⚠️ ESTA TANDA TIPEA EN CUATRO PESTANAS, NO EN UNA: 'ip_vtd' y los campos de VCI viven en el
       Doppler PULMONAR, 'peso'/'talla'/'edad'/'sexo' en Paciente, y el S/D y la onda L en el
       Doppler mitral. 'revelar()' abre la que haga falta campo por campo, pero el DENOMINADOR se
       confirma aca y de una vez: si uno de estos no tiene geometria, todas sus escenas saldrian
       «sin cambios» y eso es indistinguible de «no hay cambios». */
    var d = { onda_e: window.__P.vis('onda_e'), e_sep: window.__P.vis('e_sep'),
              e_lat: window.__P.vis('e_lat'),
              venp_sd: window.__P.existe('venp_sd'), onda_l: window.__P.existe('onda_l'),
              lars: window.__P.existe('lars'), ip_vtd: window.__P.existe('ip_vtd'),
              ip_papd: window.__P.existe('ip_papd'), vci_col: window.__P.existe('vci_col'),
              venp_vel_ar: window.__P.existe('venp_vel_ar'),
              algoritmo: window.__P.val('diast_algoritmo'),
              ritmo: window.__P.val('diast_ritmo'),
              duenoSd: (typeof window.venpSdEstado === 'function'),
              duenoAbs: (typeof window.diastStrainAbs === 'function'),
              supl: (typeof window.ASE_SUPLEMENTARIOS !== 'undefined')
                      ? window.ASE_SUPLEMENTARIOS.map(function(q){ return q.clave }) : 'SIN LISTA',
              sdOpciones: (function(){ var e = document.getElementById('venp_sd');
                return e ? Array.from(e.options).map(function(x){ return x.value }) : null })() };
    d.ok = d.onda_e === true && d.e_sep === true && d.venp_sd === true && d.ip_vtd === true;
    return d },

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

  /* Columnas del Excel: el NUMERO es lo que fija la verificacion (435 al escribir esta sonda) y
     las claves el detalle. */
  excelCols() {
    var r = window.__P.excel();
    if (typeof r === 'string') return r;
    return { n: Object.keys(r).length,
             diast: { grado: r['Grado disfunción diastólica'],
                      I: r['DD_I (Grado I)'], II: r['DD_II (Grado II)'],
                      III: r['DD_III (Grado III)'], sin: r['DD_Sin (Sin disfunción)'] },
             hash: window.__P.hash(JSON.stringify(r)) } },

  camposSinTextos() {
    var c = window.__P.campos();
    delete c.informe_texto; delete c.en_suma;
    return c },

  /* ══ LO QUE ESTA TANDA AGREGA A LA SONDA ════════════════════════════════════════════════════ */

  /* LA CATEGORIA LA DA EL CONSUMIDOR REAL. _labHallazgosCuenta es la UNICA cuenta: la leen el
     dashboard, el PDF de auditoria y el PPT. Se le pasa UN estudio y se devuelven las etiquetas
     con n > 0, que es lo que ese estudio aporta a la estadistica. */
  categorias(inf, suma) {
    if (typeof _labHallazgosCuenta !== 'function') return 'SIN _labHallazgosCuenta';
    try {
      var est = { id: 'x', nombre: 'P', ci: '1', fecha_estudio: '2026-10-14',
                  campos: { en_suma: suma, informe_texto: inf } };
      return _labHallazgosCuenta([est]).map(function(h){ return h.lbl }).sort();
    } catch(e) { return 'EXC: ' + e.message } },

  /* El duenio nuevo, directo, para ver las dos banderas al lado de la categoria. En HEAD no
     existe y se informa asi, en vez de reventar la corrida. */
  ventriculo(inf, suma) {
    if (typeof _labDisfSistVent !== 'function') return 'SIN _labDisfSistVent';
    try { return _labDisfSistVent({ campos: { en_suma: suma, informe_texto: inf } }) }
    catch(e) { return 'EXC: ' + e.message } },

  /* La fila COMPLETA del Excel para un texto dado, con su cuenta de columnas y el ORDEN. */
  filaExcel(inf, suma) {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    if (inf !== null && inf !== undefined) campos.informe_texto = inf;
    if (suma !== null && suma !== undefined) campos.en_suma = suma;
    try {
      var r = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-14', campos: campos });
      var orden = (typeof _labOrdenarCols === 'function') ? _labOrdenarCols(Object.keys(r)) : Object.keys(r);
      return { n: Object.keys(r).length, fila: r, orden: orden,
               idxDisf: orden.indexOf('DisfSist_VD'),
               vecinos: orden.slice(Math.max(0, orden.indexOf('DisfSist_VD') - 2),
                                    orden.indexOf('DisfSist_VD') + 2),
               bloqueDisf: (typeof _labXlsBloqueDe === 'function') ? _labXlsBloqueDe('DisfSist_VD') : 'SIN FUNCION' };
    } catch(e) { return 'EXC: ' + e.message } },

  /* ══ R2 · EL LARS EN EL IMPORTADOR ══════════════════════════════════════════════════════════
     La guarda del importador es su propia rama de rango. Se la interroga con el mismo par de
     funciones que usa: la banda de _labRango y, desde esta tanda, el valor con que se compara.
     Se informan los DOS para que un cambio en uno sin el otro se vea. */
  larsImport(valor) {
    var b = (typeof _labRango === 'function') ? _labRango('lars') : null;
    var cmp = (typeof _labRangoValor === 'function') ? _labRangoValor('lars', valor) : 'SIN _labRangoValor';
    var dentro = (b && typeof cmp === 'number') ? !(cmp < b[0] || cmp > b[1]) : 'NO SE PUDO';
    return { valor: valor, banda: b, comparado: cmp, aceptado: dentro } },

  /* Lo mismo para el strain de CONTRACCION de la AI, que la orden manda revisar: su banda ya es
     simetrica, asi que no sufre lo mismo. Se mide en vez de afirmarlo. */
  ctrImport(valor) {
    var b = (typeof _labRango === 'function') ? _labRango('ai_strain_ct') : null;
    var cmp = (typeof _labRangoValor === 'function') ? _labRangoValor('ai_strain_ct', valor) : 'SIN _labRangoValor';
    var dentro = (b && typeof cmp === 'number') ? !(cmp < b[0] || cmp > b[1]) : 'NO SE PUDO';
    return { valor: valor, banda: b, comparado: cmp, aceptado: dentro } },

  /* La marca de pantalla del LARS, que ya trabaja por magnitud desde el 2026-10-12. Es el
     CONTROL de que las dos puertas dicen lo mismo. */
  larsMarca() {
    var m = document.getElementById('lars-marca');
    return { valor: window.__P.val('lars'),
             marca: m ? window.__P.norm(m.textContent) : 'NO EXISTE' } },

  /* El resto del Laboratorio sobre un texto dado: geometria y grado diastolico, que son las
     otras dos lecturas por texto. CONTROL NEGATIVO de esta tanda. */
  labOtros(inf, suma) {
    var est = { campos: { en_suma: suma, informe_texto: inf } };
    var o = {};
    try { o.geom = (typeof _labGeomCat === 'function') ? _labGeomCat(est) : 'SIN FUNCION' }
    catch(e) { o.geom = 'EXC' }
    try { o.diast = (typeof _labDiastGrado === 'function') ? _labDiastGrado(est) : 'SIN FUNCION' }
    catch(e) { o.diast = 'EXC' }
    return o }
};
1

`;


/* ══ EL PACIENTE BASE ════════════════════════════════════════════════════════════════════════ */
const BASE = { edad: '66', peso: '76', talla: '172' };

/* ══ EL CENSO: UNA ESCENA POR FAMILIA DE FRASE ═══════════════════════════════════════════════
   `espera` es lo que esta tanda AFIRMA que tiene que quedar en la categoria. Se compara contra
   lo que devuelve `_labHallazgosCuenta`, no se asume. */
const CENSO = [
  /* ── VENTRICULO DERECHO ─────────────────────────────────────────────────────────────────── */
  { id: 'vd-dil-disf',   nota: 'VD dilatado con disfuncion sistolica',
    campos: { vd_bas: '48', tapse: '14' }, espera: ['VD'] },
  { id: 'vd-norm-disf',  nota: 'VD de dimensiones normales con disfuncion sistolica',
    campos: { vd_bas: '35', tapse: '14' }, espera: ['VD'] },
  { id: 'vd-solo-disf',  nota: 'VD con disfuncion sistolica, sin tamanio medido',
    campos: { tapse: '14' }, espera: ['VD'] },
  { id: 'vd-hvd-disf',   nota: 'HVD con disfuncion sistolica',
    campos: { vd_bas: '35', vd_pared: '7', tapse: '14' }, espera: ['VD'] },
  { id: 'vd-dil-hip',    nota: 'VD dilatado e hipertrofico, con disfuncion sistolica',
    campos: { vd_bas: '48', vd_pared: '7', tapse: '14' }, espera: ['VD'] },
  { id: 'vd-fac-sev',    nota: 'Disfuncion sistolica severa del VD (FAC N%)',
    campos: { vd_bas: '48', vd_area_d: '26', vd_area_s: '20' }, espera: ['VD'] },
  /* ── VENTRICULO IZQUIERDO ───────────────────────────────────────────────────────────────── */
  { id: 'vi-leve',       nota: 'FEVI levemente reducida: disfuncion sistolica leve',
    campos: { fevi: '45' }, espera: ['VI'] },
  { id: 'vi-mod',        nota: 'FEVI moderadamente reducida',
    campos: { fevi: '35' }, espera: ['VI'] },
  { id: 'vi-sev',        nota: 'FEVI severamente reducida: miocardiopatia con disfuncion sistolica severa',
    campos: { fevi: '25' }, espera: ['VI'] },
  /* ── LOS DOS A LA VEZ, que es la escena que prueba que no se pisan ──────────────────────── */
  { id: 'vi-y-vd',       nota: 'los DOS ventriculos con disfuncion sistolica',
    campos: { fevi: '35', vd_bas: '48', tapse: '14' }, espera: ['VI', 'VD'] },
  /* ── CONTROLES NEGATIVOS ────────────────────────────────────────────────────────────────── */
  { id: 'ctrl-normal',   nota: 'CONTROL: todo normal, ninguna de las dos',
    campos: { fevi: '60', vd_bas: '35', tapse: '22' }, espera: [] },
  { id: 'ctrl-vd-cons',  nota: 'CONTROL: VD dilatado con funcion sistolica CONSERVADA',
    campos: { vd_bas: '48', tapse: '22' }, espera: [] }
];

const LARS_VALORES = [32, -32, 0, 60, -60, 61, -61, 80, -80];

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
    /* ⚠️ ABORTA SI EL CAMPO NO EXISTE. Contra el arbol de HEAD los campos de una tanda nueva no
       estan; sin este corte el foco queda en el campo ANTERIOR y los caracteres se le CONCATENAN,
       y la sonda informa un paciente INVENTADO como una diferencia del commit. Medido en la tanda
       del strain: tipear «15» en un campo ausente dejo el E/e-prima en 1848,5 en vez de 18,5. */
    const hay = await ev(`window.__P.existe(${JSON.stringify(id)})`);
    if (!hay) throw new Error('tipear() ABORTA: el campo #' + id + ' no existe en este arbol');
    const via = await clicEn(id);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    /* ⚠️ ABORTA SI EL VALOR NO QUEDO. Un campo que existe pero no tiene geometria se come el
       tecleo en silencio —`clicEn` devuelve «NO SE PUDO», el foco no llega y las teclas se las
       traga el documento— y la escena informa «no avisa» sobre un dato que nunca se cargo. Medido
       en esta misma tanda con `im_vc`, que vive detras de DOS puertas en Valvulas. */
    if (String(quedo) !== String(valor)) {
      throw new Error('tipear() ABORTA: #' + id + ' pedido «' + valor + '» quedo «' + quedo
                      + '» (via ' + via.via + ')');
    }
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



  /* ⚠️ EL AVISO LEGAL VUELVE A MITAD DE CORRIDA Y SE COME LOS CLICS. Con `#modalAvisoEco`
     puesto, `elementFromPoint` devuelve ESE nodo y el tecleo cae en el overlay: la escena
     informaria «no clasifica» sobre una frase que nunca se emitio. Se despeja ANTES de cada
     escena. */
  async function despejar() {
    return ev(`(function(){
      var o = {};
      ['modalAvisoEco','login-overlay'].forEach(function(id){
        var m = document.getElementById(id);
        if (!m) { o[id] = 'NO EXISTE'; return }
        if (getComputedStyle(m).display !== 'none') { m.style.display = 'none'; o[id] = 'cerrado' }
        else o[id] = 'ya estaba'; });
      return o })()`);
  }

  async function escena(campos) {
    await despejar();
    const carga = await cargar({}, {}, Object.assign({}, BASE, campos || {}));
    return { carga: carga.todosOk ? 'OK' : carga.tecleos };
  }

  /* Genera el informe en los TRES estilos y devuelve el texto de cada uno mas el EN SUMA. */
  async function textos() {
    const r = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) {
      const x = await ev(`window.__P.informe(${JSON.stringify(est)})`);
      r[est] = { inf: x.inf, suma: x.suma };
    }
    return r;
  }

  /* Las frases que contienen «disfuncion sistolica», una por una, para que el censo muestre el
     TEXTO EXACTO y no una parafrasis. */
  const frasesDisf = (t) => String(t || '').split(/[.;\n]/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => /disfunci[oó]n\s+sist[oó]lica/i.test(s));

  const out = { md5Ini, archivo: FARG, avisoLegal: avisoEstado, denominador: denom };

  if (hacer('censo')) {
    /* EL CENSO. Las escenas se cargan con TECLAS REALES, se genera el informe en los tres
       estilos y la categoria se le pregunta al consumidor real. */
    out.censo = [];
    for (const e of CENSO) {
      const carga = await escena(e.campos);
      const T = await textos();
      const fila = { id: e.id, nota: e.nota, espera: e.espera, carga: carga.carga };
      for (const est of ['conciso', 'estandar', 'narrativo']) {
        const cats = await ev(`window.__P.categorias(${JSON.stringify(T[est].inf)}, ${JSON.stringify(T[est].suma)})`);
        const vent = await ev(`window.__P.ventriculo(${JSON.stringify(T[est].inf)}, ${JSON.stringify(T[est].suma)})`);
        fila[est] = { suma: T[est].suma.replace(/\s+/g, ' ').trim(),
                      frasesSuma: frasesDisf(T[est].suma),
                      frasesInf: frasesDisf(T[est].inf),
                      cats, ventriculo: vent };
      }
      out.censo.push(fila);
    }
  }

  if (hacer('excel')) {
    /* LA FILA DEL EXCEL: cuantas columnas, donde cae la nueva, en que bloque, y la fila entera
       para compararla clave por clave contra HEAD. */
    out.excel = [];
    for (const e of CENSO) {
      await escena(e.campos);
      const T = await textos();
      const f = await ev(`window.__P.filaExcel(${JSON.stringify(T.narrativo.inf)}, ${JSON.stringify(T.narrativo.suma)})`);
      out.excel.push({ id: e.id, n: f.n, idxDisf: f.idxDisf, vecinos: f.vecinos,
                       bloque: f.bloqueDisf, fila: f.fila });
    }
  }

  if (hacer('lars')) {
    /* R2 · EL LARS EN VALOR ABSOLUTO. Se interroga la guarda del importador con el mismo valor y
       los dos signos, y se mide ADEMAS la marca de pantalla, que ya trabaja por magnitud: las dos
       puertas tienen que decir lo mismo o una rechaza lo que la otra acepta. */
    out.lars = [];
    for (const v of LARS_VALORES) {
      const imp = await ev(`window.__P.larsImport(${v})`);
      const ctr = await ev(`window.__P.ctrImport(${v})`);
      out.lars.push({ valor: v, importador: imp, contraccionAI: ctr });
    }
    /* Y la marca de pantalla con teclas reales, con los dos signos del mismo valor. */
    out.larsMarca = [];
    for (const v of ['32', '-32', '80', '-80']) {
      await escena({ lars: v });
      out.larsMarca.push(Object.assign({ pedido: v }, await ev(`window.__P.larsMarca()`)));
    }
  }

  if (hacer('controles')) {
    /* CONTROL NEGATIVO: las otras dos lecturas por texto del Laboratorio (geometria y grado
       diastolico), el PPT y el hash de los campos guardados. */
    out.controles = [];
    for (const e of CENSO) {
      await escena(e.campos);
      const T = await textos();
      const otros = await ev(`window.__P.labOtros(${JSON.stringify(T.narrativo.inf)}, ${JSON.stringify(T.narrativo.suma)})`);
      out.controles.push({ id: e.id, otros,
        ppt: await ev(`window.__P.pptDiast()`),
        infHash: await ev(`window.__P.hash(${JSON.stringify(T.narrativo.inf)})`),
        sumaHash: await ev(`window.__P.hash(${JSON.stringify(T.narrativo.suma)})`),
        conciso: await ev(`window.__P.hash(${JSON.stringify(T.conciso.inf)})`),
        estandar: await ev(`window.__P.hash(${JSON.stringify(T.estandar.inf)})`),
        camposHash: await ev(`window.__P.hash(JSON.stringify(window.__P.camposSinTextos()))`) });
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
