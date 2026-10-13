#!/usr/bin/env node
/**
 * _probe_diastcompl.mjs — sonda A/B de SOLO LECTURA para los PARAMETROS COMPLEMENTARIOS de la
 * funcion diastolica (2026-10-12): el selector del S/D venoso pulmonar con sus TRES opciones, el
 * LARS en valor absoluto, los suplementarios de la ASE 2025 (folio 555), el E/e-prima por sitio
 * de la ASE/EACVI 2016 (folio 281), los rotulos y el borde del IMC.
 *
 * Folios: ASE 2025 = pagina del PDF + 536 · ASE/EACVI 2016 = pagina + 276 · BSE 2024 = pagina.
 *
 * Infraestructura calcada de scripts/_probe_ase2016.mjs (teclas y clics reales, cierre del arbol
 * de Chrome por GRUPO, cierre del aviso legal con su denominador, md5 al principio y al final).
 * NO muta index.html.
 *
 *   node scripts/_probe_diastcompl.mjs --file /tmp/index.HEAD.html > /tmp/dc.HEAD.json
 *   node scripts/_probe_diastcompl.mjs                             > /tmp/dc.NEW.json
 *
 * Grupos (--solo sd|sdlegado|lars|supl|ee2016|rotulos|imc|lab|vacio|superficies|otras):
 *   sd          — las TRES opciones nuevas en cada uno de los cinco usos, cuadro y ventana.
 *   sdlegado    — los dos valores de un estudio GUARDADO con el selector viejo, por cada uso.
 *   lars        — el mismo valor con los dos signos, en los cinco lugares que lo leen.
 *   supl        — cada suplementario nuevo: abajo del corte, en el corte y arriba, con control
 *                 negativo (el segundo paso con un parametro, donde NO se consultan).
 *   ee2016      — el E/e-prima por sitio de la ASE 2016 con un anillo y con los dos.
 *   rotulos     — los dos rotulos que decian «promedio», el rojo de la celda y el «TDE» del PDF.
 *   imc         — el borde 30,000000000000004 de 86,7 kg con 170 cm.
 *   lab         — que clasifica el Laboratorio para cada frase de las tres guias.
 *   vacio       — CONTROL NEGATIVO MAYOR: con los datos nuevos VACIOS, las seis superficies.
 *   superficies — informe en 3 estilos, EN SUMA, Excel con su cuenta de columnas, franja del
 *                 PPT, grado del Laboratorio y hash de los campos guardados.
 *   otras       — CONTROL NEGATIVO: la BSE en sinusal y las tres guias en FA.
 *
 * ⚠️ DENOMINADOR. Un conteo de filas sobre una ventana que no abrio da cero y parece acuerdo
 * perfecto. Cada escena informa que tipeo, que quedo en el campo y cuantas filas vio.
 *
 * ⚠️ `tipear` ABORTA SI EL CAMPO NO EXISTE. Contra el arbol de HEAD los campos de una tanda
 * nueva no estan: sin este corte el foco queda en el campo ANTERIOR y los caracteres se le
 * CONCATENAN. Medido en la tanda del strain: tipear «15» en un campo ausente dejo el E/e-prima
 * en 1848,5 en vez de 18,5 y la sonda informo ese paciente inventado como una diferencia real.
 *
 * ⚠️ LOS GRUPOS SE CORREN DE A UNO. Varios en una sola sesion de pagina se cuelgan sobre el
 * arbol de HEAD (medido en dos tandas anteriores).
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

  /* ══ LO QUE ESTA TANDA AGREGA A LA SONDA ════════════════════════════════════════════════════ */

  /* El S/D: el token que quedo en el <select>, su etiqueta y el ESTADO por cada uno de los dos
     cortes. Los tres juntos, porque un token sin su estado no dice si voto. */
  sd() {
    var e = document.getElementById('venp_sd');
    var o = { token: e ? e.value : 'NO EXISTE', idx: e ? e.selectedIndex : null,
              opciones: e ? Array.from(e.options).map(function(x){
                return { v: x.value, t: window.__P.norm(x.textContent),
                         oculta: !!x.hidden, disp: getComputedStyle(x).display } }) : null };
    o.etiqueta = (typeof venpSDTxt === 'function') ? venpSDTxt() : 'SIN venpSDTxt';
    o.le067 = (typeof venpSdEstado === 'function') ? venpSdEstado('le067') : 'SIN venpSdEstado';
    o.lt1   = (typeof venpSdEstado === 'function') ? venpSdEstado('lt1')   : 'SIN venpSdEstado';
    return o },

  /* La marca «(revisar)» de un campo de strain, por su div hermano. Se lee el TEXTO: la marca es
     un renglon propio y no un atributo. */
  marca(id) {
    var e = document.getElementById(id + '-marca');
    if (!e) return 'NO EXISTE';
    return { txt: window.__P.norm(e.textContent), disp: getComputedStyle(e).display } },

  /* La PAP diastolica: el campo readonly que escribe calcIP y la PmAD que la alimenta. Sin PmAD
     el campo dice «N mmHg (sin PmAD)», que es una PAPd INCOMPLETA y no debe votar. */
  papd() {
    return { campo: window.__P.val('ip_papd'), fila: window.__P.txt('ip-papd-row'),
             vtd: window.__P.val('ip_vtd'), pmad: window.__P.val('ip_pmad_display'),
             vciCol: window.__P.val('vci_col'), vciDiam: window.__P.val('vci_diam') } },

  /* El ROTULO de una celda del cuadro gris: el <span class="calc-lbl"> hermano del valor. Es lo
     que esta tanda cambia cuando hay un solo anillo medido. */
  rotulo(idVal) {
    var e = document.getElementById(idVal);
    if (!e) return 'NO EXISTE';
    var row = e.closest ? e.closest('.calc-row') : null;
    var l = row ? row.querySelector('.calc-lbl') : null;
    return l ? window.__P.norm(l.textContent) : 'SIN ROTULO' },

  /* El color de la celda del E/e-prima: el estilo COMPUTADO, no el inline. Un 'style' que no
     gana se lee como un arreglo aplicado. */
  colorEe() {
    var e = document.getElementById('ee-val');
    if (!e) return 'NO EXISTE';
    var cs = getComputedStyle(e);
    return { color: cs.color, peso: cs.fontWeight, inline: e.style.color || '',
             rojo: cs.color === 'rgb(239, 68, 68)' } },

  /* El IMC CRUDO que devuelve getIMC, con todos sus decimales, al lado del que compara la
     diastolica. Es la unica forma de ver el 30.000000000000004. */
  imcCrudo() {
    var g = (typeof getIMC === 'function') ? getIMC() : null;
    return { getIMC: g, repr: g === null ? null : String(g),
             mayorQue30: g === null ? null : (g > 30),
             red1: g === null ? null : Math.round(g * 10) / 10,
             red1MayorQue30: g === null ? null : (Math.round(g * 10) / 10 > 30),
             celda: window.__P.txt('imc-val') } },

  /* El ROTULO con el que una fila sale en el PDF. Se busca en PDF_SECCIONES si existe; si no, se
     informa que no se pudo leer en vez de inventar un resultado. */
  pdfRotulo(campo) {
    try {
      var html = document.documentElement.innerHTML;
      var m = html.match(/\\{lbl:'TD[AE]'/g);
      return { encontrados: m || [], nota: 'lbl del flujo transmitral en el armador del PDF' };
    } catch(e) { return 'EXC: ' + e.message } },

  /* El ROTULO que el Excel publica en la columna de texto para una frase, al lado del grado. Es
     lo que esta tanda agrega para la frase sin grado de la ASE 2016. */
  /* ⚠️ 'conEe' NO ES UN DETALLE: la columna DD_Sin vale
     '(gd === 'sin' || (gd === null && eeDoc)) ? 1 : 0', asi que una frase que clasifica 'null'
     suma en «Sin disfuncion» SOLO si el estudio trae el E/e' documentado. Sin ese campo, la
     tabla del Laboratorio sale con DD_Sin en 0 para todas las frases sin grado y el defecto
     queda invisible. Se miden las dos variantes. */
  labRotulo(inf, suma, conEe) {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    try {
      var c = { en_suma: suma, informe_texto: inf };
      if (conEe) { c.onda_e = '100'; c.e_sep = '6'; c.e_lat = '8'; }
      var r = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-12', campos: c });
      return { grado: r['Grado disfunción diastólica'],
               I: r['DD_I (Grado I)'], II: r['DD_II (Grado II)'],
               III: r['DD_III (Grado III)'], sin: r['DD_Sin (Sin disfunción)'],
               nCols: Object.keys(r).length };
    } catch(e) { return 'EXC: ' + e.message } },

  /* Los campos del estudio SIN los dos <textarea> del informe. Ver la nota del grupo. */
  camposSinTextos() {
    var c = window.__P.campos();
    delete c.informe_texto; delete c.en_suma;
    return c }
};
1
`;


/* ══ LOS CINCO USOS DEL S/D, CADA UNO CON SU PACIENTE ════════════════════════════════════════
   Cada uso necesita un paciente que LLEGUE a la compuerta donde el S/D vota; si no llega, las
   tres opciones dan lo mismo y la tabla diria «el corte no funciona» sobre un corte que funciona.
   Es la leccion que la tanda de la ASE 2016 pago con sus tripletes de borde.

   `peso 70` y `talla 170` van en TODA escena: sin ellos no hay ASC y el LAVi no se puede
   calcular — un denominador roto que se leeria como «el criterio no se cumple». Con esa ASC
   (1,81 m2) un Vol AI de 70 ml da LAVi 38,7 (POSITIVO, > 34) y uno de 50 da 27,6 (negativo). */
const BASE = { peso: '70', talla: '170' };

const SD_OPC = ['le067', 'mid', 'ge1'];
const SD_LEGADO = ['menor1', 'mayor1'];

const SD_USOS = [
  /* ── 1. ASE 2025 RITMO SINUSAL, segundo paso. Corte ≤ 0,67 (folio 554). ──
     Hay que llegar al segundo paso: «cualquier 2 de las 3 principales» o «solo el E/e-prima».
     Con e-prima reducido (sep 5 / lat 7) y E/e-prima alto y la IT negativa son 2 de 3 -> segundo
     paso. Y el segundo paso tiene que quedar SIN Vol AI, SIN LARS y SIN TRIV para que el S/D sea
     el UNICO parametro que lo decide: ahi se ve si vota. */
  { id: 'U1-ase2025-sin', algo: 'ase2025', ritmo: 'sinusal', corte: '≤ 0,67 (folio 554)',
    que: 'ASE 2025 sinusal: 2 de 3 principales positivas, segundo paso con el S/D como UNICO parametro',
    c: { fevi: '60', onda_e: '100', onda_a: '80', e_sep: '5', e_lat: '7', vmax_it: '2.0' } },
  /* ── 2. ASE 2025 FIBRILACION AURICULAR, Figura 8. Corte < 1 (folio 563). ──
     Paso 1 con 2 de 4 -> «Indeterminate» y pasa al paso 2, que vota LARS < 18, S/D < 1 e IMC > 30.
     Con el LARS y el IMC negativos, el S/D decide entre 1/3 y 0/3. */
  { id: 'U2-ase2025-fa', algo: 'ase2025', ritmo: 'fa', corte: '< 1 (folio 563)',
    que: 'ASE 2025 FA: paso 1 con 2 de 4 -> el paso 2, con LARS 30 e IMC 24 negativos',
    c: { fevi: '60', onda_e: '110', e_sep: '8', vmax_it: '2.0', tde: '200', lars: '30' } },
  /* ── 3. BSE 2024 FIBRILACION AURICULAR, Figura 19. Corte < 1 (pag. 40). ── */
  /* ⚠️ EL PASO 1 TIENE QUE QUEDAR EN 2 Y 2, Y LA PRIMERA VERSION LO DEJABA EN 3 POSITIVOS: con
     tres, la Figura 19 cierra en «elevada» sin llegar al paso 2 y el S/D no podia mover nada —las
     tres opciones salian con el MISMO badge y la tabla parecia decir que el corte no esta
     cableado—. Con 2 positivos y 2 negativos cae en el paso 2, y ahi el LARS 15 (< 16, positivo)
     con el IMC 24 (negativo) deja al S/D decidiendo entre 2 de 3 (elevada) y 2 negativos
     (normal). */
  { id: 'U3-bse-fa', algo: 'bse2024', ritmo: 'fa', corte: '< 1 (pag. 40)',
    que: 'BSE FA: paso 1 en 2 y 2 -> paso 2, con LARS 15 positivo e IMC 24 negativo',
    c: { fevi: '60', onda_e: '110', e_sep: '8', vmax_it: '2.0', tde: '200', lars: '15' } },
  /* ── 4. BSE 2024 FEVI REDUCIDA, Figura 18 (suplementarios). Corte < 1 (pag. 37). ──
     Hay que caer en la zona intermedia del LARS (18 a 23) con 1 positivo y 1 negativo de los
     dos criterios disponibles, que es la puerta de los suplementarios. */
  { id: 'U4-bse-fr', algo: 'bse2024', ritmo: 'sinusal', corte: '< 1 (pag. 37)',
    que: 'BSE FEVI 35: 1 positivo y 1 negativo con LARS 20 (zona intermedia) -> suplementarios',
    c: { fevi: '35', onda_e: '120', onda_a: '80', e_sep: '5', e_lat: '7', ai_vol: '50', lars: '20' } },
  /* ── 5. ASE/EACVI 2016 FEVI DEPRIMIDA. Corte < 1 (folios 286, 287 y 290). ──
     Tres compuertas: FEVI deprimida, FALTA UNO de los tres principales (sin IT) y el valor. */
  /* ⚠️ ESTA ESCENA NECESITA UN CRITERIO YA POSITIVO Y LA PRIMERA VERSION NO LO TENIA. Con los
     dos criterios disponibles NEGATIVOS, 0 de 2 y 1 de 3 dan los DOS grado I, asi que las tres
     opciones salian identicas y la tabla decia «el corte no funciona» sobre un corte que
     funciona. Con el Vol AI positivo (70 ml -> LAVi 38,7) el S/D mueve 1 de 2 -> 2 de 3, que es
     grado I -> grado II. Es la misma leccion que los tripletes de borde de la tanda anterior. */
  { id: 'U5-ase2016-fr', algo: 'ase2016', ritmo: 'sinusal', corte: '< 1 (folios 286 y 290)',
    que: 'ASE 2016 FEVI 35, SIN IT (falta uno de los tres) y Vol AI ya positivo -> el S/D sustituye y mueve el grado',
    c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', ai_vol: '70' } },
  { id: 'U5b-ase2016-fr-0pos', algo: 'ase2016', ritmo: 'sinusal', corte: '< 1 (folios 286 y 290)',
    que: 'ASE 2016 FEVI 35, SIN IT y los dos criterios NEGATIVOS: 0 de 2 y 1 de 3 dan los dos grado I (el S/D suma y no mueve)',
    c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', ai_vol: '50' } },
  /* ── CONTROL NEGATIVO: la ASE 2016 con FEVI NORMAL. El S/D no entra en la 8A por ninguna
     puerta (folio 287: «of little value in patients with normal LVEF»). ── */
  { id: 'U6-cn-ase2016-fn', algo: 'ase2016', ritmo: 'sinusal', corte: 'NO VOTA (control negativo)',
    que: 'CONTROL NEGATIVO: ASE 2016 con FEVI 60 — la 8A no mira el S/D',
    c: { fevi: '60', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', ai_vol: '50' } },
  /* ── CONTROL NEGATIVO: la ASE 2016 con los TRES principales. La guia dice «one». ── */
  { id: 'U7-cn-ase2016-tres', algo: 'ase2016', ritmo: 'sinusal', corte: 'NO VOTA (control negativo)',
    que: 'CONTROL NEGATIVO: ASE 2016 FEVI 35 con los TRES criterios disponibles',
    c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  /* ── CONTROL NEGATIVO: la ASE 2025 en sinusal con el segundo paso YA decidido por el Vol AI.
     El S/D suma al conteo del segundo paso, asi que con un Vol AI positivo el veredicto ya esta
     y las tres opciones no pueden darlo vuelta. ── */
  { id: 'U8-cn-ase2025-volai', algo: 'ase2025', ritmo: 'sinusal', corte: 'suma pero no decide',
    que: 'CONTROL NEGATIVO: ASE 2025 sinusal con Vol AI 70 (positivo) ya en el segundo paso',
    c: { fevi: '60', onda_e: '100', onda_a: '80', e_sep: '5', e_lat: '7', vmax_it: '2.0', ai_vol: '70' } }
];

/* ══ EL LARS CON LOS DOS SIGNOS ══════════════════════════════════════════════════════════════
   El MISMO valor absoluto con los dos signos tiene que dar el MISMO veredicto en los cinco
   lugares que leen el LARS. Los pares se eligen a los dos lados de cada corte: 18 (ASE 2025
   sinusal y FA), 16 (BSE FA), 30 y 18 (BSE Figura 17) y 24 y 18 (BSE Figura 18).
   ⚠️ EN HEAD UN LARS NEGATIVO DABA VUELTA EL VEREDICTO: −32 cumple `< 18` crudo y publicaba
   presion elevada. Con el valor absoluto, 32 es normal. Esas son las escenas que cambian. */
const LARS_PARES = [
  { id: 'P1-32', mag: '32', nota: 'por encima de todos los cortes: normal con |x|, elevada en HEAD con el negativo' },
  { id: 'P2-20', mag: '20', nota: 'zona intermedia de la Figura 18 (18 a 23)' },
  { id: 'P3-12', mag: '12', nota: 'por debajo de todos los cortes: elevada con los dos signos' },
  { id: 'P4-17', mag: '17', nota: 'entre el 16 de la BSE en FA y el 18 de la ASE' }
];
const LARS_ESC = [
  { id: 'L-ase2025-sin', algo: 'ase2025', ritmo: 'sinusal',
    que: 'ASE 2025 sinusal, segundo paso: LARS como UNICO parametro (corte ≤ 18 %)',
    c: { fevi: '60', onda_e: '100', onda_a: '80', e_sep: '5', e_lat: '7', vmax_it: '2.0' } },
  /* Con el S/D ya positivo en el paso 2, el LARS decide entre 2 de 3 (elevada) y 1 de 3
     (indeterminada). Sin eso los cuatro pares salian «indeterminada» y la escena no separaba.
     ⚠️ EL VALOR DEL S/D ES `menor1` Y NO `le067` A PROPOSITO: `le067` es una opcion del commit 1
     y en el arbol de HEAD NO EXISTE, asi que el A/B compararia dos escenas distintas y mostraria
     como «cambio del LARS» lo que es el S/D entrando a votar. Medido: con `le067` la tabla
     informaba cuatro diferencias con el LARS POSITIVO, donde el valor absoluto no puede cambiar
     nada. `menor1` existe en los dos arboles y cumple el corte `< 1` en los dos. */
  { id: 'L-ase2025-fa', algo: 'ase2025', ritmo: 'fa',
    que: 'ASE 2025 FA, paso 2 (corte < 18 %) con el S/D ya positivo',
    c: { fevi: '60', onda_e: '110', e_sep: '8', vmax_it: '2.0', tde: '200' }, sel: { venp_sd: 'menor1' } },
  /* ⚠️ EL PASO 1 TIENE QUE QUEDAR EN 2 Y 2 Y EL PASO 2 CON OTRO PARAMETRO YA POSITIVO. La
     primera version dejaba el paso 1 en 3 positivos, asi que la Figura 19 cerraba en «elevada»
     sin consultar el LARS y los cuatro pares salian con el MISMO badge: la tabla medía bien la
     igualdad de signos y NO medía el corte. Con 2 y 2 cae en el paso 2, y con el S/D en «<=0,67»
     (positivo) el LARS decide entre 2 de 3 (elevada) y 1 y 1 (indeterminada). */
  { id: 'L-bse-fa', algo: 'bse2024', ritmo: 'fa',
    que: 'BSE FA (corte < 16 %), paso 1 en 2 y 2 y el S/D ya positivo en el paso 2',
    c: { fevi: '60', onda_e: '110', e_sep: '8', vmax_it: '2.0', tde: '200' }, sel: { venp_sd: 'menor1' } },
  /* ⚠️ Y ESTA NECESITA EXACTAMENTE DOS VARIABLES EVALUADAS, 1 Y 1. La version con la IT cargada
     tenia TRES evaluadas (1 positiva y 2 negativas), o sea `neg >= 2` -> presion normal, y la
     rama del strain no se consultaba: los cuatro pares salian «presion normal». Sin la IT quedan
     el E/e-prima positivo y el Vol AI negativo, que es la casilla de discordancia de la Figura 17. */
  { id: 'L-bse-f17', algo: 'bse2024', ritmo: 'sinusal',
    que: 'BSE Figura 17, discordancia (E/e-prima positivo y Vol AI negativo, SIN IT) -> strain de la AI (cortes >= 30 y < 18 %)',
    c: { fevi: '60', edad: '50', sexo: 'M', onda_e: '120', onda_a: '80', e_sep: '4', e_lat: '5', ai_vol: '50' } },
  { id: 'L-bse-f18', algo: 'bse2024', ritmo: 'sinusal',
    que: 'BSE Figura 18 (FEVI 35), 1 y 1 -> strain de la AI (cortes >= 24 y < 18 %)',
    c: { fevi: '35', onda_e: '120', onda_a: '80', e_sep: '5', e_lat: '7', ai_vol: '50' } }
];

/* ══ LOS SUPLEMENTARIOS DE LA ASE 2025 (folio 555 y nota ‡ de la Figura 3) ════════════════════
   Se consultan en UN SOLO caso: con el segundo paso SIN NINGUN parametro disponible
   («If none available or reliable use Supplemental methods‡»). El paciente base de este grupo
   llega al segundo paso por «2 de 3 principales» y lo deja vacio: sin Vol AI, sin LARS, sin TRIV
   y sin S/D. Cada triplete mueve UN suplementario: apenas abajo, JUSTO en el corte, apenas
   arriba. Los cuatro operadores son los de la guia y los cuatro son `>=` o `>`, no los mismos:
     · onda L            ≥ 50 cm/s   (folio 555b y nota ‡)
     · IP telediastolica ≥ 2 m/s     (folio 555a)
     · PAP diastolica    ≥ 16 mmHg   (folio 555a, alternativa de la anterior con «or»)
     · Ar−A              > 30 ms  Y  velocidad de Ar > 35 cm/s   (folio 555d, «along with») */
const SUPL_BASE = { fevi: '60', onda_e: '100', onda_a: '80', e_sep: '5', e_lat: '7', vmax_it: '2.0' };
const SUPL = [
  { id: 'X1-ondaL', que: 'onda L ≥ 50 cm/s (folio 555b)', campo: 'onda_l',
    vals: ['49', '50', '51'], fijo: {},
    nota: 'el 50 exacto SI es positivo (>=). Ya existia antes de esta tanda' },
  { id: 'X2-ipvtd', que: 'IP telediastolica ≥ 2 m/s (folio 555a)', campo: 'ip_vtd',
    vals: ['1.9', '2', '2.1'], fijo: {},
    nota: 'el 2,00 exacto SI es positivo (>=). SIN PmAD la PAP diastolica no se calcula, asi que la alternativa queda sin evaluar y el positivo es solo por la velocidad' },
  { id: 'X3-papd-borde', que: 'PAP diastolica >= 16 mmHg en su borde (folio 555a)', campo: 'ip_vtd',
    vals: ['0.3', '0.4', '0.5'], fijo: {}, sel: { vci_diam: '25', vci_col: '<50' },
    nota: 'PmAD 15 (VCI >= 21 mm y colapso < 50 %): PAPd = 4 x V^2 + 15 -> 15,36 / 15,64 / 16,00, y el CAMPO los redondea a 15 / 16 / 16. Las tres velocidades estan MUY por debajo de 2, asi que lo que vota es la PAPd y no la velocidad. ⚠️ EL BORDE ES EL DEL CAMPO REDONDEADO, no el del numero exacto: un 15,64 real se lee 16 y cruza. Es la consecuencia de leer la PAPd que publica calcIP en vez de recalcularla, y es lo correcto —el numero que el medico tiene delante es el que se clasifico—' },
  { id: 'X4-papd-or', que: 'el «or» del inciso (a): la PAPd positiva ALCANZA con la velocidad por debajo de 2', campo: 'ip_vtd',
    vals: ['1.5', '1.6', '1.7'], fijo: {}, sel: { vci_diam: '18', vci_col: '>50' },
    nota: 'PmAD 3 (VCI < 21 mm y colapso > 50 %): PAPd = 12 / 13,2 / 14,6 -> campo 12 / 13 / 15, los TRES por debajo de 16, y la velocidad por debajo de 2. CONTROL NEGATIVO del inciso entero: ninguno de los dos caminos vota' },
  { id: 'X5-papd-sin-pmad', que: 'CONTROL NEGATIVO: SIN PmAD la PAPd no vota aunque el campo muestre un numero alto', campo: 'ip_vtd',
    vals: ['1.5', '1.9', '1.95'], fijo: {},
    nota: 'sin VCI cargada el campo escribe «N mmHg (sin PmAD)» —9 / 14 / 15— y le FALTA el sumando de la auricula derecha: el lector devuelve null y el criterio queda SIN EVALUAR. Las tres velocidades siguen por debajo de 2, asi que nada mas puede votar' },
  { id: 'X6-ara', que: 'Ar−A > 30 ms CON velocidad de Ar > 35 cm/s (folio 555d)', campo: 'venp_dur_ar',
    vals: ['129', '130', '131'], fijo: { venp_dur_a: '100', venp_vel_ar: '40' },
    nota: 'Ar−A = 29 / 30 / 31 ms; el 30 exacto es NEGATIVO (>). La velocidad de Ar 40 ya cumple su propio > 35' },
  { id: 'X7-velar', que: 'velocidad de Ar > 35 cm/s, el segundo operando del AND', campo: 'venp_vel_ar',
    vals: ['34', '35', '36'], fijo: { venp_dur_ar: '140', venp_dur_a: '100' },
    nota: 'Ar−A 40 ms fijo (ya positivo); el 35 exacto es NEGATIVO (>). CONTROL DEL AND: con la velocidad por debajo, el Ar−A positivo NO alcanza' }
];
/* CONTROLES NEGATIVOS de la etapa: los suplementarios NO se consultan si el segundo paso tiene
   aunque sea UN parametro, ni en las otras dos guias en ritmo sinusal. */
const SUPL_CN = [
  { id: 'XN1-volai', que: 'CONTROL NEGATIVO: el MISMO suplementario positivo con Vol AI 50 cargado (segundo paso con un parametro)',
    algo: 'ase2025', c: Object.assign({}, SUPL_BASE, { ai_vol: '50', ip_vtd: '2.5' }) },
  { id: 'XN2-triv', que: 'CONTROL NEGATIVO: el MISMO suplementario positivo con TRIV 90 cargado',
    algo: 'ase2025', c: Object.assign({}, SUPL_BASE, { triv: '90', ip_vtd: '2.5' }) },
  { id: 'XN3-bse', que: 'CONTROL NEGATIVO: los cuatro suplementarios cargados y positivos, con la BSE 2024',
    algo: 'bse2024', c: Object.assign({}, SUPL_BASE, { ip_vtd: '2.5', onda_l: '60', venp_dur_ar: '140', venp_dur_a: '100', venp_vel_ar: '40' }) },
  { id: 'XN4-2016', que: 'CONTROL NEGATIVO: los cuatro cargados y positivos, con la ASE 2016',
    algo: 'ase2016', c: Object.assign({}, SUPL_BASE, { ip_vtd: '2.5', onda_l: '60', venp_dur_ar: '140', venp_dur_a: '100', venp_vel_ar: '40' }) },
  { id: 'XN5-todos-neg', que: 'CONTROL NEGATIVO: los cuatro cargados y los cuatro NEGATIVOS -> sigue «no estimable», no se afirma normal',
    algo: 'ase2025', c: Object.assign({}, SUPL_BASE, { ip_vtd: '1.5', onda_l: '30', venp_dur_ar: '110', venp_dur_a: '100', venp_vel_ar: '20' }) }
];

/* ══ EL E/e-PRIMA POR SITIO DE LA ASE/EACVI 2016 (folio 281) ══════════════════════════════════
   «a lateral E/e' ratio > 13 or a septal E/e' > 15 is considered abnormal», y el folio aclara
   para qué: «at times only the lateral e' or septal e' velocity is available ... The latter
   sentence applies to laboratories that acquire only septal or lateral velocities». O sea es un
   REEMPLAZO de cuando falta un anillo, no un OR de tres alternativas.
   Los tres operadores son `>` ESTRICTO, no el `>=` de la ASE 2025. */
const EE2016 = [
  { id: 'E1-sep-solo', que: 'SOLO el e-prima SEPTAL: su corte propio es > 15', campo: 'onda_e',
    fijo: { fevi: '35', onda_a: '70', e_sep: '7', vmax_it: '2.0', ai_vol: '70' },
    vals: ['104', '105', '106'],
    nota: 'e-prima septal 7,0 -> E/e-prima 14,86 / 15,00 / 15,14; el 15,00 exacto es NEGATIVO (>). En HEAD el corte aplicado era el 14 del PROMEDIO, asi que el 104 (14,86) ya daba positivo' },
  { id: 'E2-lat-solo', que: 'SOLO el e-prima LATERAL: su corte propio es > 13', campo: 'onda_e',
    fijo: { fevi: '35', onda_a: '70', e_lat: '8', vmax_it: '2.0', ai_vol: '70' },
    vals: ['103', '104', '105'],
    nota: 'e-prima lateral 8,0 -> E/e-prima 12,88 / 13,00 / 13,13; el 13,00 exacto es NEGATIVO (>). En HEAD el corte era el 14, asi que el 105 (13,13) daba negativo' },
  { id: 'E3-dos-prom', que: 'LOS DOS anillos: manda el PROMEDIO con su > 14', campo: 'onda_e',
    fijo: { fevi: '35', onda_a: '70', e_sep: '6', e_lat: '8', vmax_it: '2.0', ai_vol: '70' },
    vals: ['97', '98', '99'],
    nota: 'promedio 7,0 -> E/e-prima 13,86 / 14,00 / 14,14; el 14,00 exacto es NEGATIVO (>). Es la conducta de HEAD y NO se mueve' },
  { id: 'E4-cn-dos-sitios', que: 'CONTROL NEGATIVO: los dos anillos con el SEPTAL cruzando su > 15 y el promedio por debajo del 14', campo: 'onda_e',
    fijo: { fevi: '35', onda_a: '70', e_sep: '6', e_lat: '10', vmax_it: '2.0', ai_vol: '70' },
    vals: ['112', '113', '114'],
    nota: 'promedio 8,0 -> E/e-prima 14,0 / 14,125 / 14,25 y SEPTAL 18,7 / 18,8 / 19,0. Con los DOS anillos la guia manda el promedio y nada mas: el septal cruzado NO suma por separado' }
];

/* ══ EL BORDE DEL IMC (86,7 kg con 170 cm) ═══════════════════════════════════════════════════
   `(170/100)**2` vale 2.8899999999999997, asi que 86,7/2.89 da 30.000000000000004 y cruza un
   corte que es `> 30` (Figura 8 de la ASE 2025 folio 563, y la FA de la BSE). Con talla 100 el
   IMC es exacto. El redondeo a un decimal se aplica SOLO en la comparacion de la diastolica. */
const IMC_ESC = [
  { id: 'I1-867-170', que: '86,7 kg con 170 cm -> 30.000000000000004 por punto flotante', peso: '86.7', talla: '170', esperado: 'NEGATIVO (30,0 no es > 30)' },
  { id: 'I2-868-170', que: '86,8 kg con 170 cm -> 30,03', peso: '86.8', talla: '170', esperado: 'NEGATIVO (30,0 redondeado)' },
  { id: 'I3-90-170',  que: '90 kg con 170 cm -> 31,1', peso: '90', talla: '170', esperado: 'POSITIVO' },
  { id: 'I4-30-100',  que: '30 kg con 100 cm -> 30,0 exacto', peso: '30', talla: '100', esperado: 'NEGATIVO (el 30 exacto no es > 30)' },
  { id: 'I5-3005-100', que: '30,05 kg con 100 cm -> 30,05, que redondea a 30,1', peso: '30.05', talla: '100', esperado: 'POSITIVO (30,1 > 30)' }
];
const IMC_GUIAS = [ { algo: 'ase2025', ritmo: 'fa' }, { algo: 'bse2024', ritmo: 'fa' } ];

/* ══ FRASES QUE EL LABORATORIO TIENE QUE CLASIFICAR ══════════════════════════════════════════
   `_labDiastGrado` lee el TEXTO del resumen, y de ahi salen cinco columnas del Excel, la
   distribucion del panel, el PPT estadistico y el filtro de cohorte. La tabla se arma con las
   frases literales de las TRES guias —las que viajan en los estudios ya guardados y NO se
   migran— mas la que esta tanda tiene que reconocer. */
const FRASES_LAB = [
  { id: 'L01-g1', g: 'ASE 2016 / ASE 2025', suma: 'Disfuncion diastolica Grado I (relajacion alterada).',
    inf: 'Patron de relajacion alterada con presiones de llenado normales (Disfuncion diastolica Grado I).' },
  { id: 'L02-g2', g: 'ASE 2016 / ASE 2025', suma: 'Disfuncion diastolica Grado II (pseudonormal, presiones elevadas).',
    inf: 'Llenado diastolico pseudonormal con presiones de llenado elevadas (Disfuncion diastolica Grado II).' },
  { id: 'L03-g3', g: 'ASE 2016 / ASE 2025', suma: 'Disfuncion diastolica Grado III (restrictivo).',
    inf: 'Llenado diastolico restrictivo (Disfuncion diastolica Grado III).' },
  { id: 'L04-normal', g: 'las tres', suma: 'Funcion diastolica normal.', inf: 'Funcion diastolica normal.' },
  { id: 'L05-indet', g: 'ASE 2016', suma: 'Funcion diastolica indeterminada.', inf: 'Funcion diastolica indeterminada.' },
  { id: 'L06-8A', g: 'ASE 2016 NUEVA (8A, sin grado)', suma: 'Disfuncion diastolica.',
    inf: 'Disfuncion diastolica (3 de 4 criterios positivos, ASE/EACVI 2016); el algoritmo para FEVI normal no gradua.' },
  { id: 'L07-bse-det-normal', g: 'BSE 2024', suma: 'Funcion diastolica deteriorada con presion de llenado del VI normal.',
    inf: 'Funcion diastolica deteriorada con presion de llenado del VI normal.' },
  { id: 'L08-bse-det-elevada', g: 'BSE 2024', suma: 'Funcion diastolica deteriorada con presion de llenado del VI elevada.',
    inf: 'Funcion diastolica deteriorada con presion de llenado del VI elevada.' },
  { id: 'L09-fa', g: 'FA (las tres)', suma: 'Disfuncion diastolica con presion de llenado elevada (con FA).',
    inf: 'Disfuncion diastolica con presion de llenado elevada (con FA).' },
  { id: 'L10-pres-normal', g: 'ASE 2025 (sin grado)', suma: 'Presion de llenado del VI normal.',
    inf: 'Presion de llenado del VI normal (0/2 parametros positivos). No se puede graduar la disfuncion diastolica con los datos disponibles.' },
  { id: 'L11-cn-negacion', g: 'CONTROL NEGATIVO', suma: '',
    inf: 'Se descarta patron restrictivo y se descarta disfuncion diastolica grado III.' },
  { id: 'L12-cn-vacio', g: 'CONTROL NEGATIVO', suma: '', inf: '' }
];

/* ══ CONTROL NEGATIVO MAYOR: LOS DATOS NUEVOS VACIOS ═════════════════════════════════════════
   Con el S/D sin elegir, el LARS sin signo negativo y los suplementarios nuevos vacios, las seis
   superficies tienen que salir IDENTICAS a HEAD. Son las escenas de las tandas anteriores. */
const VACIO = [
  { id: 'V00-vacio', que: 'formulario vacio', algo: 'ase2025', ritmo: 'sinusal', c: {} },
  { id: 'V01-2025-3neg', que: 'ASE 2025 sinusal: las tres principales negativas', algo: 'ase2025', ritmo: 'sinusal',
    c: { fevi: '60', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '50' } },
  { id: 'V02-2025-3pos', que: 'ASE 2025 sinusal: las tres positivas', algo: 'ase2025', ritmo: 'sinusal',
    c: { fevi: '60', onda_e: '120', onda_a: '70', e_sep: '5', e_lat: '7', vmax_it: '3.2', ai_vol: '70' } },
  { id: 'V03-2025-seg2', que: 'ASE 2025 sinusal: segundo paso con Vol AI positivo', algo: 'ase2025', ritmo: 'sinusal',
    c: { fevi: '60', onda_e: '100', onda_a: '80', e_sep: '5', e_lat: '7', vmax_it: '2.0', ai_vol: '70' } },
  { id: 'V04-bse-f17', que: 'BSE 2024 sinusal, Figura 17', algo: 'bse2024', ritmo: 'sinusal',
    c: { fevi: '60', edad: '50', sexo: 'M', onda_e: '120', onda_a: '80', e_sep: '4', e_lat: '5', ai_vol: '70', vmax_it: '3.2' } },
  { id: 'V05-bse-f18', que: 'BSE 2024 FEVI 35, Figura 18', algo: 'bse2024', ritmo: 'sinusal',
    c: { fevi: '35', onda_e: '120', onda_a: '80', e_sep: '5', e_lat: '7', ai_vol: '70', vmax_it: '3.2' } },
  { id: 'V06-2016-8a', que: 'ASE 2016 FEVI 60, Figura 8A', algo: 'ase2016', ritmo: 'sinusal',
    c: { fevi: '60', onda_e: '120', onda_a: '70', e_sep: '5', e_lat: '7', vmax_it: '3.2', ai_vol: '70' } },
  { id: 'V07-2016-8b', que: 'ASE 2016 FEVI 35, Figura 8B', algo: 'ase2016', ritmo: 'sinusal',
    c: { fevi: '35', onda_e: '70', onda_a: '70', e_sep: '10', e_lat: '13', vmax_it: '2.0', ai_vol: '70' } },
  { id: 'V08-2025-fa', que: 'ASE 2025 en FA', algo: 'ase2025', ritmo: 'fa',
    c: { fevi: '60', onda_e: '110', onda_a: '70', e_sep: '8', e_lat: '10', vmax_it: '3.0', ai_vol: '70', tde: '150' } },
  { id: 'V09-bse-fa', que: 'BSE 2024 en FA', algo: 'bse2024', ritmo: 'fa',
    c: { fevi: '60', onda_e: '110', onda_a: '70', e_sep: '8', e_lat: '10', vmax_it: '3.0', ai_vol: '70', tde: '150' } },
  { id: 'V10-2016-fa', que: 'ASE 2016 en FA', algo: 'ase2016', ritmo: 'fa',
    c: { fevi: '60', onda_e: '110', onda_a: '70', e_sep: '8', e_lat: '10', vmax_it: '3.0', ai_vol: '70', tde: '150' } },
  { id: 'V11-lars-pos', que: 'LARS POSITIVO 32 (sin signo negativo): lo que ya hacia HEAD', algo: 'ase2025', ritmo: 'sinusal',
    c: { fevi: '60', onda_e: '100', onda_a: '80', e_sep: '5', e_lat: '7', vmax_it: '2.0', lars: '32' } }
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


  /* Los <select> de escenario van SIEMPRE primero, antes de cualquier tecla. El de la guia va
     antes que el del ritmo, y el `sexo` del paciente entra por la misma puerta. */
  const esc = (algo, extra) => Object.assign({ diast_algoritmo: algo || 'ase2016', diast_ritmo: 'sinusal' }, extra || {});

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
      /* ⚠️ EL SUFIJO DE LA GUIA SE QUITA DE LAS TRES FORMAS EN QUE EL BADGE LO ESCRIBE, y la
         primera version de esta sonda sacaba SOLO «— ASE 2016»: las otras dos guias y las tres
         ramas de FA salian «acuerdo=False» en TODAS las escenas, o sea un falso de la sonda con
         pinta de hallazgo. En ritmo sinusal el sufijo va con guion largo («DD Grado II — ASE
         2025») y en FA va entre parentesis al final («FA — Presion de llenado elevada (BSE
         2024)»), que es otro formato. */
      const b = String(cuadro.badge || '')
        .replace(/\s*—\s*(ASE 2016|ASE 2025|BSE 2024)\s*$/, '')
        .replace(/\s*\((ASE 2016|ASE 2025|BSE 2024)\)\s*$/, '')
        .trim();
      r.badgeSinGuia = b;
      r.acuerdo = b !== '' && String(ven.res || '').indexOf(b) === 0;
    }
    return r;
  }


  const out = { archivo: FILE, md5Ini, avisoEstado, denominador: denom,
                boton: btn, cerrar: btnX };

  if (hacer('sd')) {
    /* LAS TRES OPCIONES NUEVAS EN CADA UNO DE LOS USOS. Para cada uso, el MISMO paciente con las
       tres opciones: si las tres dan lo mismo, o el paciente no llega a la compuerta o el corte
       no esta cableado. Se informa el estado de la FILA del S/D al lado del veredicto, porque un
       badge que no se mueve se lee como un corte que no funciona. */
    out.sd = [];
    for (const u of SD_USOS) {
      const fila = [];
      for (const op of SD_OPC.concat(['']))  {
        const carga = await cargar(u.c, esc(u.algo, { diast_ritmo: u.ritmo, venp_sd: op }));
        const m = await medir(true);
        fila.push({ opcion: op || '(sin elegir)', carga: carga.todosOk ? 'OK' : carga.tecleos,
                    sdLeido: await ev(`window.__P.sd()`),
                    badge: m.cuadro.badge, texto: m.cuadro.texto, suma: m.cuadro.suma,
                    res: m.ventana.res, nFilas: m.ventana.nFilas,
                    filaSd: m.ventana.filas.filter((f) => /S\/D/.test(f.crit)),
                    acuerdo: m.acuerdo });
      }
      out.sd.push({ id: u.id, que: u.que, guia: u.algo, ritmo: u.ritmo, corte: u.corte, opciones: fila });
    }
  }

  if (hacer('sdlegado')) {
    /* LOS DOS VALORES DE UN ESTUDIO GUARDADO con el selector viejo. No se migran: se abren como
       se guardaron. Para el corte `< 1` el «<1» DECIDE (es ese corte); para el ≤ 0,67 NO
       distingue y el criterio queda SIN EVALUAR — que no es lo mismo que negativo. */
    out.sdlegado = [];
    for (const u of SD_USOS) {
      const fila = [];
      for (const op of SD_LEGADO) {
        const carga = await cargar(u.c, esc(u.algo, { diast_ritmo: u.ritmo, venp_sd: op }));
        const m = await medir(true);
        fila.push({ opcion: op, carga: carga.todosOk ? 'OK' : carga.tecleos,
                    sdLeido: await ev(`window.__P.sd()`),
                    badge: m.cuadro.badge, texto: m.cuadro.texto, suma: m.cuadro.suma,
                    res: m.ventana.res,
                    filaSd: m.ventana.filas.filter((f) => /S\/D/.test(f.crit)),
                    acuerdo: m.acuerdo });
      }
      out.sdlegado.push({ id: u.id, que: u.que, guia: u.algo, ritmo: u.ritmo, corte: u.corte, legado: fila });
    }
  }

  if (hacer('lars')) {
    /* EL MISMO VALOR CON LOS DOS SIGNOS. Lo que tiene que ser identico es el badge, la frase del
       informe, la del EN SUMA y el resultado de la ventana; lo que tiene que CONSERVAR el signo
       es el campo. Y la marca «(revisar)» se lee al lado, porque esta tanda la cambia: sale por
       MAGNITUD fuera de banda y ya no por el signo. */
    out.lars = [];
    for (const e of LARS_ESC) {
      for (const par of LARS_PARES) {
        const dos = [];
        for (const sg of ['+', '-']) {
          const c = Object.assign({}, e.c, { lars: (sg === '-' ? '-' : '') + par.mag });
          const carga = await cargar(c, esc(e.algo, Object.assign({ diast_ritmo: e.ritmo }, e.sel || {})));
          const m = await medir(true);
          dos.push({ signo: sg, tipeado: (sg === '-' ? '-' : '') + par.mag,
                     carga: carga.todosOk ? 'OK' : carga.tecleos,
                     enCampo: await ev(`window.__P.val('lars')`),
                     marca: await ev(`window.__P.marca('lars')`),
                     badge: m.cuadro.badge, texto: m.cuadro.texto, suma: m.cuadro.suma,
                     res: m.ventana.res,
                     filaLars: m.ventana.filas.filter((f) => /LARS/.test(f.crit)),
                     acuerdo: m.acuerdo });
        }
        out.lars.push({ escena: e.id, que: e.que, par: par.id, magnitud: par.mag, nota: par.nota,
          mismoBadge: dos[0].badge === dos[1].badge,
          mismoTexto: dos[0].texto === dos[1].texto,
          mismaSuma: dos[0].suma === dos[1].suma,
          mismaVentana: dos[0].res === dos[1].res,
          signoConservado: dos[1].enCampo === ('-' + par.mag),
          dos });
      }
    }
  }

  if (hacer('supl')) {
    /* TRIPLETES POR SUPLEMENTARIO: apenas abajo, JUSTO en el corte, apenas arriba. El paciente
       base llega al segundo paso y lo deja VACIO, que es la unica condicion en que la figura los
       consulta. Se informa la fila de CADA suplementario con su estado, no solo el badge. */
    out.supl = [];
    for (const x of SUPL) {
      const tri = [];
      for (const val of x.vals) {
        const c = Object.assign({}, SUPL_BASE, x.fijo); c[x.campo] = val;
        const carga = await cargar(c, esc('ase2025', Object.assign({ diast_ritmo: 'sinusal' }, x.sel || {})));
        const m = await medir(true);
        tri.push({ valor: val, carga: carga.todosOk ? 'OK' : carga.tecleos,
                   papd: await ev(`window.__P.papd()`),
                   badge: m.cuadro.badge, texto: m.cuadro.texto, suma: m.cuadro.suma,
                   res: m.ventana.res,
                   filasSupl: m.ventana.filas.filter((f) => /onda L|telediast|PAP diast|Ar−A|Ar-A|amplitud de la Ar/i.test(f.crit)),
                   acuerdo: m.acuerdo });
      }
      out.supl.push({ id: x.id, que: x.que, campo: x.campo, nota: x.nota, triplete: tri });
    }
    out.suplCn = [];
    for (const n of SUPL_CN) {
      const carga = await cargar(n.c, esc(n.algo, { diast_ritmo: 'sinusal' }));
      const m = await medir(true);
      out.suplCn.push(Object.assign({ id: n.id, que: n.que, guia: n.algo,
        carga: carga.todosOk ? 'OK' : carga.tecleos,
        papd: await ev(`window.__P.papd()`),
        filasSupl: m.ventana.filas.filter((f) => /onda L|telediast|PAP diast|Ar−A|Ar-A|amplitud de la Ar/i.test(f.crit)) }, m));
    }
  }

  if (hacer('ee2016')) {
    out.ee2016 = [];
    for (const b of EE2016) {
      const tri = [];
      for (const val of b.vals) {
        const c = Object.assign({}, b.fijo); c[b.campo] = val;
        const carga = await cargar(c, esc('ase2016', { diast_ritmo: 'sinusal' }));
        const m = await medir(true);
        tri.push({ valor: val, carga: carga.todosOk ? 'OK' : carga.tecleos,
                   badge: m.cuadro.badge, texto: m.cuadro.texto, suma: m.cuadro.suma,
                   ee: m.cuadro.ee, eprom: m.cuadro.eprom,
                   rotEprom: await ev(`window.__P.rotulo('eprom-val')`),
                   rotEe: await ev(`window.__P.rotulo('ee-val')`),
                   res: m.ventana.res,
                   filaEe: m.ventana.filas.filter((f) => /E\/e/.test(f.crit)),
                   acuerdo: m.acuerdo });
      }
      out.ee2016.push({ id: b.id, que: b.que, campo: b.campo, nota: b.nota, triplete: tri });
    }
  }

  if (hacer('rotulos')) {
    /* LOS DOS ROTULOS QUE DECIAN «promedio» CON UN SOLO ANILLO, el rojo de la celda del E/e-prima
       y el «TDE» del PDF. Cada uno con su control: el rotulo con los DOS anillos tiene que seguir
       diciendo «promedio», y el rojo tiene que seguir el criterio del ALGORITMO elegido. */
    out.rotulos = [];
    const ANILLOS = [
      { id: 'R1-dos', que: 'los DOS anillos', c: { e_sep: '6', e_lat: '8' } },
      { id: 'R2-sep', que: 'SOLO el septal', c: { e_sep: '6' } },
      { id: 'R3-lat', que: 'SOLO el lateral', c: { e_lat: '8' } },
      { id: 'R4-ninguno', que: 'NINGUNO', c: {} }
    ];
    for (const a of ANILLOS) {
      for (const g of ['ase2025', 'bse2024', 'ase2016']) {
        const c = Object.assign({ fevi: '60', onda_e: '100', onda_a: '80' }, a.c);
        const carga = await cargar(c, esc(g, { diast_ritmo: 'sinusal' }));
        out.rotulos.push({ id: a.id + '-' + g, que: a.que, guia: g,
          carga: carga.todosOk ? 'OK' : carga.tecleos,
          rotEprom: await ev(`window.__P.rotulo('eprom-val')`),
          rotEe: await ev(`window.__P.rotulo('ee-val')`),
          valEprom: await ev(`window.__P.txt('eprom-val')`),
          valEe: await ev(`window.__P.txt('ee-val')`),
          colorEe: await ev(`window.__P.colorEe()`) });
      }
    }
    /* EL ROJO DE LA CELDA, por su propio triplete y por guia: el criterio tiene que ser el del
       algoritmo EN VIGOR, no un 14 fijo. La ASE 2025 corta el E/e-prima promedio en >= 14 y la
       ASE 2016 en > 14: el 14,00 EXACTO los separa. */
    out.rojo = [];
    for (const g of ['ase2025', 'bse2024', 'ase2016']) {
      for (const ritmo of ['sinusal', 'fa']) {
        for (const val of ['97', '98', '99']) {
          const c = { fevi: '60', onda_e: val, onda_a: '80', e_sep: '6', e_lat: '8', vmax_it: '2.0', ai_vol: '50' };
          const carga = await cargar(c, esc(g, { diast_ritmo: ritmo }));
          out.rojo.push({ guia: g, ritmo, onda_e: val,
            carga: carga.todosOk ? 'OK' : carga.tecleos,
            ee: await ev(`window.__P.txt('ee-val')`),
            color: await ev(`window.__P.colorEe()`),
            badge: await ev(`window.__P.txt('dd-interp')`) });
        }
      }
    }
    out.pdfTda = await ev(`window.__P.pdfRotulo('tde')`);
  }

  if (hacer('imc')) {
    out.imc = [];
    for (const g of IMC_GUIAS) {
      for (const i of IMC_ESC) {
        const c = { peso: i.peso, talla: i.talla, fevi: '60', onda_e: '110', e_sep: '8', vmax_it: '2.0', tde: '200' };
        const carga = await cargar(c, esc(g.algo, { diast_ritmo: g.ritmo }));
        const m = await medir(true);
        out.imc.push({ id: i.id + '-' + g.algo, que: i.que, guia: g.algo, esperado: i.esperado,
          carga: carga.todosOk ? 'OK' : carga.tecleos,
          imcCrudo: await ev(`window.__P.imcCrudo()`),
          badge: m.cuadro.badge, res: m.ventana.res,
          filaImc: m.ventana.filas.filter((f) => /IMC/.test(f.crit)) });
      }
    }
  }

  if (hacer('lab')) {
    out.lab = [];
    for (const f of FRASES_LAB) {
      out.lab.push({ id: f.id, grupo: f.g, suma: f.suma, inf: f.inf,
        grado: await ev(`window.__P.labGrado(${JSON.stringify(f.inf)}, ${JSON.stringify(f.suma)})`),
        rotulo: await ev(`window.__P.labRotulo(${JSON.stringify(f.inf)}, ${JSON.stringify(f.suma)}, false)`),
        rotuloConEe: await ev(`window.__P.labRotulo(${JSON.stringify(f.inf)}, ${JSON.stringify(f.suma)}, true)`) });
    }
  }

  if (hacer('vacio') || hacer('superficies')) {
    /* LAS SEIS SUPERFICIES, UNA POR UNA. Nunca «el informe y el Excel» en bloque: cada una tiene
       su propio emisor y se rompen por separado. Con los datos nuevos VACIOS esto es el CONTROL
       NEGATIVO MAYOR de la tanda. */
    out.superficies = [];
    for (const e of VACIO) {
      const carga = await cargar(e.c, esc(e.algo, { diast_ritmo: e.ritmo }));
      const s = { id: e.id, que: e.que, guia: e.algo, ritmo: e.ritmo,
                  carga: carga.todosOk ? 'OK' : carga.tecleos, estilos: {} };
      for (const est of ['narrativo', 'telegrafico', 'estructurado']) {
        const r = await ev(`window.__P.informe(${JSON.stringify(est)})`);
        s.estilos[est] = { lineas: await ev(`window.__P.lineaDiast(${JSON.stringify(r.inf)})`),
                           suma: await ev(`window.__P.norm(${JSON.stringify(r.suma)})`),
                           lab: await ev(`window.__P.labGrado(${JSON.stringify(r.inf)}, ${JSON.stringify(r.suma)})`) };
      }
      s.excel = await ev(`window.__P.excelCols()`);
      s.ppt = await ev(`window.__P.pptDiast()`);
      /* ⚠️ EL HASH DESCUENTA LOS DOS <textarea>: `informe_texto` y `en_suma` cambian en toda
         escena cuya frase cambia y NO dicen nada sobre los campos del estudio. */
      s.camposHash = await ev(`window.__P.hash(JSON.stringify(window.__P.camposSinTextos()))`);
      out.superficies.push(s);
    }
  }

  if (hacer('otras')) {
    /* CONTROL NEGATIVO. Las mismas escenas con las otras guias: lo unico que esta tanda mueve en
       la BSE y en la FA es el LARS y el S/D, asi que con los dos sin tocar tienen que salir
       identicas a HEAD. */
    out.otras = [];
    for (const e of VACIO) {
      const carga = await cargar(e.c, esc(e.algo, { diast_ritmo: e.ritmo }));
      const m = await medir(true);
      out.otras.push(Object.assign({ id: e.id, guia: e.algo, ritmo: e.ritmo,
        carga: carga.todosOk ? 'OK' : carga.tecleos }, m));
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
