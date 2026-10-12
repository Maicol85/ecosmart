#!/usr/bin/env node
/**
 * _probe_diastfa.mjs — sonda A/B de SOLO LECTURA para la FUNCION DIASTOLICA en FIBRILACION
 * AURICULAR, en las TRES guias: el cuadro gris (#dd-interp), la ventana del boton 🧭 y las
 * superficies firmadas.
 *
 * Infraestructura calcada de scripts/_probe_diast2025.mjs (teclas y clics reales, cierre del
 * arbol de Chrome por GRUPO, cierre del aviso legal con su denominador, md5 al principio y al
 * final). NO muta index.html.
 *
 *   node scripts/_probe_diastfa.mjs --file /tmp/index.HEAD.html > /tmp/fa.HEAD.json
 *   node scripts/_probe_diastfa.mjs                             > /tmp/fa.NEW.json
 *
 * Grupos (--solo cuadro|ventana|bordes|superficies|sinusal|desfase|fc):
 *   cuadro      — por escena y por guia: el badge, la frase del informe y la del EN SUMA.
 *   ventana     — la MISMA escena leida desde la ventana 🧭: filas, estado de cada criterio,
 *                 renglon de resultado, y si coincide con el cuadro.
 *   bordes      — tripletes por parametro y por guia: apenas abajo, justo en el corte, apenas
 *                 arriba. Cada triplete trae su control negativo implicito (el valor de abajo).
 *   superficies — informe en 3 estilos, EN SUMA en 3 estilos, columnas del Excel, el texto que
 *                 lee el PPT (#dd-interp), el grado que deriva el Laboratorio y el hash de los
 *                 campos guardados.
 *   sinusal     — CONTROL NEGATIVO: las mismas escenas en ritmo sinusal.
 *   desfase     — el cuadro gris siguiendo al Vol AI, la IT, el TRIV, el TDE y la VCI.
 *   fc          — el aviso ambar de frecuencia cardiaca de la BSE.
 *
 * ⚠️ DENOMINADOR. Un conteo de filas sobre una ventana que no abrio da cero y parece acuerdo
 * perfecto. Cada escena informa que tipeo, que quedo en el campo y cuantas filas vio.
 *
 * ⚠️ LOS GRUPOS SE CORREN DE A UNO. Varios en una sola sesion de pagina se cuelgan sobre el
 * arbol de HEAD (medido en la tanda anterior: 16 minutos con Chrome al 90 % de CPU y node en
 * 0,16 s, o sea la pagina girando y la sonda esperando un despacho que no vuelve).
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

  /* Columnas del Excel: el NUMERO es lo que fija la verificacion (434 al escribir esta sonda; 435 desde el 2026-10-12) y las claves el detalle. */
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

/* ══ ESCENAS DE FIBRILACION AURICULAR ═════════════════════════════════════════════════════════
   Cada escena es un PACIENTE, no un tecleo. Los numericos se tipean con TECLAS REALES; los
   <select> de escenario (ritmo, algoritmo, S/D, colapso de VCI) van por `set`, que NO es un gesto
   medido y se declara como tal. `peso` y `talla` van en TODA escena: sin ellos no hay ASC ni IMC,
   y el IMC es el tercer parametro del segundo paso en las dos guias que lo tienen — un
   denominador roto que se leeria como «el criterio no se cumple».

   El paso 1 de la ASE 2025 (Figura 8, folio 563) y el de la BSE (Figura 19, pag. 39) tienen LOS
   MISMOS cuatro cortes, asi que las escenas sirven para las dos y lo que se mide es si la REGLA
   de conteo difiere. Las que separan a las dos guias estan marcadas. */
const BASE = { peso: '70', talla: '170' };
const ESCENAS = [
  { id: 'F00-vacio', que: 'formulario vacio', c: {} },
  { id: 'F01-cero', que: '0 de 4 positivos: E 70, E/e septal 7,0, IT 2,0, TDE 200', c: { onda_e: '70', e_sep: '10', vmax_it: '2.0', tde: '200' } },
  { id: 'F02-uno', que: '1 de 4: onda E 120 y los otros tres negativos', c: { onda_e: '120', e_sep: '12', vmax_it: '2.0', tde: '200' } },
  { id: 'F03-dos', que: '2 de 4: onda E 120 y E/e septal 12,0 (IT y TDE negativos), sin paso 2', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200' } },
  { id: 'F04-tres', que: '3 de 4: onda E 120, E/e septal 12,0 e IT 3,2', c: { onda_e: '120', e_sep: '10', vmax_it: '3.2', tde: '200' } },
  { id: 'F05-cuatro', que: '4 de 4: los cuatro positivos', c: { onda_e: '120', e_sep: '10', vmax_it: '3.2', tde: '140' } },
  { id: 'F06-dos-p2pos', que: '2 de 4 y paso 2 con LARS 15 y S/D <1 positivos', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200', lars: '15' }, sel: { venp_sd: 'menor1' } },
  { id: 'F07-dos-p2neg', que: '2 de 4 y paso 2 con los TRES negativos (LARS 25, S/D >1, IMC 24,2)', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200', lars: '25' }, sel: { venp_sd: 'mayor1' } },
  /* ⚠️ ESTA ESCENA SEPARA A LAS DOS GUIAS Y ES EL MOTIVO DE SU CORTE DISTINTO: LARS 17 es
     POSITIVO para la ASE 2025 (< 18 %) y NEGATIVO para la BSE (< 16 %), que lo baja porque en FA
     no hay contraccion auricular y el strain de reservorio es sistematicamente menor (pag. 40). */
  { id: 'F08-lars17', que: '2 de 4 y paso 2 con LARS 17: POSITIVO para la ASE 2025 y negativo para la BSE', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200', lars: '17' }, sel: { venp_sd: 'mayor1' } },
  { id: 'F09-p2-uno', que: '2 de 4 y paso 2 con UN SOLO parametro evaluado (LARS 15, sin S/D; IMC si hay peso)', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200', lars: '15' } },
  { id: 'F10-dos-sin-medir', que: '2 del paso 1 SIN MEDIR (sin IT ni TDE) y los dos medidos negativos', c: { onda_e: '70', e_sep: '10' } },
  /* ⚠️ SEPARA A LAS DOS GUIAS POR LA PSAP: la Figura 8 admite «IT > 2,8 O PSAP > 35» y la Figura
     19 de la BSE solo nombra la velocidad de la IT. Con IT 2,6 y PSAP 36 el tercer criterio es
     POSITIVO para la ASE 2025 y NEGATIVO para la BSE. */
  { id: 'F11-psap', que: 'IT 2,65 NEGATIVA con PSAP 36 (VCI 15 mm, colapso <50): la PSAP solo vota en la ASE 2025', c: { onda_e: '120', e_sep: '10', vmax_it: '2.65', tde: '200' }, sel: { vci_col: '<50' }, teclas: { vci_diam: '15' } },
  { id: 'F12-imc', que: '2 de 4 y paso 2 con IMC 34,6 (peso 100 / talla 170) como unico positivo', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200', peso: '100', lars: '25' }, sel: { venp_sd: 'mayor1' } },
  { id: 'F13-solo-e', que: 'un solo parametro del paso 1 medido (onda E 120) y nada mas', c: { onda_e: '120' } },
  { id: 'F14-triv', que: 'TRIV 60 y FEVI 35 cargados: solo los mira la ASE/EACVI 2016', c: { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '140', triv: '60', fevi: '35' } },
  { id: 'F15-fc', que: 'FC 130 lpm con los cuatro del paso 1 cargados', c: { onda_e: '120', e_sep: '10', vmax_it: '3.2', tde: '140', ao_fc: '130' } }
];

/* Tripletes de borde: apenas abajo / justo en el corte / apenas arriba. El campo que se mueve es
   el ultimo; los demas fijan la escena. `guias` dice en cual de las tres aplica el corte. */
const FIJO2 = { onda_e: '120', e_sep: '10', vmax_it: '2.0', tde: '200' };   // 2 de 4 positivos
const BORDES = [
  /* ⚠️ LA ONDA E ALIMENTA DOS CRITERIOS A LA VEZ (ella misma y el cociente E/e), asi que la
     fixture usa e septal 8: el cociente queda en 12,4 / 12,5 / 12,6 y es POSITIVO en los tres, de
     modo que lo unico que cambia entre los tres valores es el criterio de la onda E. Con un e
     septal alto el cociente quedaba negativo en los tres y el veredicto no se movia: el triplete
     habria medido el estado de la fila y nada mas. */
  { id: 'BF1-ondaE', que: 'onda E (corte >= 100 cm/s en las dos figuras)', guias: ['ase2025', 'bse2024'],
    fijo: { e_sep: '8', vmax_it: '3.2', tde: '200' }, campo: 'onda_e', vals: ['99', '100', '101'], nota: 'con E/e 12,4 e IT 3,2 ya positivos, la onda E mueve el conteo de 2 a 3' },
  { id: 'BF2-eeSeptal', que: 'E/e SEPTAL (corte > 11; el 11,00 exacto es NEGATIVO)', guias: ['ase2025', 'bse2024'],
    fijo: { e_sep: '10', vmax_it: '2.0', tde: '200' }, campo: 'onda_e', vals: ['109', '110', '111'], nota: '10,9 / 11,0 / 11,1 — con onda E >= 100 ese criterio queda positivo en los tres y no interfiere' },
  { id: 'BF3-it', que: 'velocidad de la IT (corte > 2,8 en la Figura 8 y en la Figura 19; la Figura 3 del ritmo sinusal usa >= 2,8)', guias: ['ase2025', 'bse2024'],
    fijo: { onda_e: '120', e_sep: '10', tde: '200' }, campo: 'vmax_it', vals: ['2.79', '2.8', '2.81'], nota: 'con onda E y E/e ya positivos, la IT mueve el conteo de 2 a 3; el 2,80 exacto es NEGATIVO' },
  { id: 'BF4-tde', que: 'TDE (corte <= 160 ms)', guias: ['ase2025', 'bse2024'],
    fijo: { onda_e: '120', e_sep: '10', vmax_it: '2.0' }, campo: 'tde', vals: ['159', '160', '161'], nota: 'el 160 exacto es POSITIVO (<=)' },
  /* ⚠️ EL BORDE DE LA PSAP SE MIDE MOVIENDO LA IT CON LA PmAD FIJA, y la IT queda NEGATIVA en
     los tres (2,65 < 2,8): asi el flip lo produce SOLO la PSAP. Con VCI 15 mm y colapso <50 la
     PmAD es 8 mmHg, y el gradiente 4v2 da 26 / 27 / 28 -> PSAP 34 / 35 / 36. El corte es > 35,
     asi que el 35 exacto es NEGATIVO. La BSE no tiene PSAP en su Figura 19: ahi los tres tienen
     que dar lo mismo, y ese es el control negativo. */
  { id: 'BF5-psap', que: 'PSAP > 35 mmHg, alternativa de la IT SOLO en la ASE 2025', guias: ['ase2025', 'bse2024'],
    fijo: { onda_e: '120', e_sep: '10', tde: '200' }, sel: { vci_col: '<50' }, teclas: { vci_diam: '15' },
    campo: 'vmax_it', vals: ['2.55', '2.6', '2.65'], nota: 'PSAP 34 / 35 / 36 mmHg con la IT negativa en los tres' },
  { id: 'BF6-larsASE', que: 'LARS del paso 2 de la ASE 2025 (corte < 18 %)', guias: ['ase2025'],
    fijo: Object.assign({}, FIJO2), sel: { venp_sd: 'menor1' }, campo: 'lars', vals: ['17.9', '18', '18.1'], nota: 'con el S/D positivo, el LARS mueve el paso 2 de 2 positivos a 1; el 18,0 exacto es NEGATIVO' },
  { id: 'BF7-larsBSE', que: 'LARS del paso 2 de la BSE (corte < 16 %)', guias: ['bse2024'],
    fijo: Object.assign({}, FIJO2), sel: { venp_sd: 'menor1' }, campo: 'lars', vals: ['15.9', '16', '16.1'], nota: 'con el S/D positivo, el LARS mueve el paso 2 de 2 positivos a 1; el 16,0 exacto es NEGATIVO' },
  { id: 'BF8-imc', que: 'IMC del paso 2 (corte > 30 kg/m2) con talla 170', guias: ['ase2025', 'bse2024'],
    fijo: Object.assign({}, FIJO2, { lars: '25' }), sel: { venp_sd: 'menor1' }, campo: 'peso', vals: ['86.4', '86.7', '87'], nota: '29,90 / 30,00 / 30,10 — el 30,00 exacto es NEGATIVO; con el S/D positivo el IMC mueve el paso 2 de 1 a 2' },
];

/* El S/D no es numerico: sus tres estados se miden aparte. */
const SD_ESTADOS = [
  { id: 'SD-sin', val: '', que: 'sin elegir — no evaluable' },
  { id: 'SD-menor1', val: 'menor1', que: '<1 — POSITIVO en las dos guias que lo usan' },
  { id: 'SD-mayor1', val: 'mayor1', que: '>1 — negativo' }
];

const GUIAS = ['ase2025', 'bse2024', 'ase2016'];

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
  const ORDEN = ['peso', 'talla', 'fevi', 'vci_diam', 'triv', 'tde', 'ai_vol', 'vmax_it',
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

  const out = { archivo: FILE, md5Ini, avisoEstado, denominador: denom,
                boton: btn, cerrar: btnX };

  /* Los dos <select> de escenario van SIEMPRE primero, antes de cualquier tecla: `cargar` los
     aplica despues de `limpiar` y antes del tecleo. El de la guia va antes que el del ritmo. */
  const esc = (algo, extra) => Object.assign({ diast_algoritmo: algo, diast_ritmo: 'fa' }, extra || {});
  /* El titulo que la ventana deberia mostrar sale del badge del cuadro sin el sufijo de la guia:
     si los dos no coinciden, es que volvieron a calcular por separado. */
  const sinGuia = (b) => String(b || '').replace(/ \([^()]*\)\s*$/, '').trim();

  if (hacer('cuadro') || hacer('ventana')) {
    out.escenas = [];
    for (const algo of GUIAS) {
      for (const e of ESCENAS) {
        const carga = await cargar(e.c, esc(algo, e.sel), e.teclas);
        const cuadro = await ev(`window.__P.cuadro()`);
        const r = { guia: algo, id: e.id, que: e.que,
                    carga: carga.todosOk ? 'TODOS OK' : carga.tecleos, sels: carga.sels, cuadro };
        if (hacer('ventana')) {
          const ven = await verVentana();
          r.ventana = ven;
          r.acuerdo = String(ven.res || '').indexOf(sinGuia(cuadro.badge)) === 0;
          r.tituloNombraGuia = ven.titulo;
        }
        out.escenas.push(r);
      }
    }
  }

  if (hacer('bordes')) {
    out.bordes = [];
    for (const b of BORDES) {
      for (const algo of b.guias) {
        const tri = [];
        for (const val of b.vals) {
          const c = Object.assign({}, b.fijo); c[b.campo] = val;
          const carga = await cargar(c, esc(algo, b.sel), b.teclas);
          const cuadro = await ev(`window.__P.cuadro()`);
          const ven = await verVentana();
          tri.push({ valor: val, carga: carga.todosOk ? 'OK' : carga.tecleos,
                     badge: cuadro.badge, texto: cuadro.texto, suma: cuadro.suma,
                     psap: cuadro.psap, res: ven.res, nFilas: ven.nFilas, filas: ven.filas });
        }
        out.bordes.push({ id: b.id, guia: algo, que: b.que, campo: b.campo, nota: b.nota, triplete: tri });
      }
    }
    /* El S/D no es numerico: tres ESTADOS, y el «sin elegir» es el control negativo que prueba
       que su ausencia no se cuenta como negativo. */
    out.sd = [];
    for (const algo of ['ase2025', 'bse2024']) {
      for (const s of SD_ESTADOS) {
        await cargar(Object.assign({}, FIJO2, { lars: '25' }), esc(algo, { venp_sd: s.val }));
        const cuadro = await ev(`window.__P.cuadro()`);
        const ven = await verVentana();
        out.sd.push({ guia: algo, id: s.id, que: s.que, badge: cuadro.badge, res: ven.res,
                      fila: (ven.filas || []).filter(function (f) { return /S\/D/.test(f.crit) }) });
      }
    }
  }

  if (hacer('superficies')) {
    /* LAS SEIS SUPERFICIES, UNA POR UNA, sobre las escenas que cambian de veredicto. */
    const SUP = ['F00-vacio', 'F01-cero', 'F03-dos', 'F05-cuatro', 'F06-dos-p2pos',
                 'F07-dos-p2neg', 'F08-lars17', 'F10-dos-sin-medir', 'F11-psap'];
    out.superficies = [];
    for (const algo of GUIAS) {
      for (const id of SUP) {
        const e = ESCENAS.find(function (x) { return x.id === id });
        const carga = await cargar(e.c, esc(algo, e.sel), e.teclas);
        const uno = { guia: algo, id: e.id, carga: carga.todosOk ? 'OK' : carga.tecleos, estilos: {} };
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
  }

  if (hacer('sinusal')) {
    /* CONTROL NEGATIVO: las MISMAS escenas en RITMO SINUSAL. Nada de esta tanda puede tocarlas.
       El control negativo grande son las escenas del trabajo anterior, que se corren con
       scripts/_probe_diast2025.mjs; este grupo prueba que el codigo de FA no se filtra. */
    out.sinusal = [];
    for (const algo of GUIAS) {
      for (const id of ['F01-cero', 'F05-cuatro', 'F07-dos-p2neg']) {
        const e = ESCENAS.find(function (x) { return x.id === id });
        await cargar(e.c, Object.assign({ diast_algoritmo: algo, diast_ritmo: 'sinusal' }, e.sel || {}), e.teclas);
        const cuadro = await ev(`window.__P.cuadro()`);
        const ven = await verVentana();
        const r = await ev(`window.__P.informe('narrativo')`);
        out.sinusal.push({ guia: algo, id: id, cuadro: cuadro,
                           ventana: { titulo: ven.titulo, res: ven.res, nFilas: ven.nFilas },
                           lineas: await ev(`window.__P.lineaDiast(${JSON.stringify(r.inf)})`),
                           suma: await ev(`window.__P.lineaDiast(${JSON.stringify(r.suma)})`) });
      }
    }
  }

  if (hacer('desfase')) {
    /* EL CUADRO GRIS SIGUIENDO A CADA CAMPO, medido y no supuesto. Se tipea en el orden INGENUO
       —primero los mitrales y despues el Vol AI, la IT, el TRIV, el TDE y la VCI— y se lee el
       cuadro DESPUES DE CADA CAMPO. En HEAD esos cinco no llaman a `calcDiastol` y el cuadro se
       queda con el veredicto anterior; el A/B es justamente contra eso. Se mide en FA y en ritmo
       sinusal, porque el ritmo sinusal NO puede cambiar de veredicto. */
    out.desfase = [];
    for (const ritmo of ['fa', 'sinusal']) {
      for (const algo of ['ase2025', 'bse2024']) {
        await ev(`window.__P.limpiar()`);
        await pausa(120);
        await ev(`window.__P.set('diast_algoritmo', ${JSON.stringify(algo)})`);
        await ev(`window.__P.set('diast_ritmo', ${JSON.stringify(ritmo)})`);
        await ev(`window.__P.set('vci_col', '<50')`);
        const pasos = [];
        const PLAN = [['peso', '70'], ['talla', '170'], ['e_sep', '10'], ['onda_e', '120'],
                      ['tde', '140'], ['ai_vol', '80'], ['vmax_it', '3.2'], ['triv', '60'],
                      ['vci_diam', '15'], ['lars', '15']];
        for (const par of PLAN) {
          const t = await tipear(par[0], par[1]);
          const cu = await ev(`window.__P.cuadro()`);
          pasos.push({ campo: par[0], quedo: t.quedo, badge: cu.badge, psap: cu.psap });
        }
        const ven = await verVentana();
        const cuFinal = await ev(`window.__P.cuadro()`);
        out.desfase.push({ ritmo, guia: algo, pasos,
                           ventanaAlFinal: { res: ven.res, nFilas: ven.nFilas },
                           cuadroAlFinal: cuFinal.badge,
                           acuerdoFinal: String(ven.res || '').indexOf(sinGuia(cuFinal.badge)) === 0 });
      }
    }
  }

  if (hacer('fc')) {
    /* EL AVISO DE FRECUENCIA CARDIACA DE LA BSE. Dos preguntas: aparece cuando debe y NO cambia
       ni un veredicto. Lo segundo se prueba con el MISMO paciente en todas las escenas: el badge
       y la frase del informe tienen que ser identicos a los del escenario sin FC. */
    out.fc = [];
    const CASOS = [
      { id: 'C0-sin-fc',        guia: 'bse2024', ritmo: 'fa', fc: null },
      { id: 'C1-fc-99',         guia: 'bse2024', ritmo: 'fa', fc: '99' },
      { id: 'C2-fc-100',        guia: 'bse2024', ritmo: 'fa', fc: '100' },
      { id: 'C3-fc-120',        guia: 'bse2024', ritmo: 'fa', fc: '120' },
      { id: 'C4-fc-121',        guia: 'bse2024', ritmo: 'fa', fc: '121' },
      { id: 'C5-ase2025-fc130', guia: 'ase2025', ritmo: 'fa', fc: '130' },
      { id: 'C6-ase2016-fc130', guia: 'ase2016', ritmo: 'fa', fc: '130' },
      { id: 'C7-sinusal-fc130', guia: 'bse2024', ritmo: 'sinusal', fc: '130' }
    ];
    for (const c of CASOS) {
      const campos = Object.assign({}, FIJO2);
      if (c.fc) campos.ao_fc = c.fc;
      await cargar(campos, Object.assign({ diast_algoritmo: c.guia, diast_ritmo: c.ritmo }));
      const r = await ev(`window.__P.informe('narrativo')`);
      out.fc.push({ id: c.id, guia: c.guia, ritmo: c.ritmo, fc: c.fc,
                    aviso: await ev(`window.__P.fcAviso()`),
                    cuadro: await ev(`window.__P.cuadro()`),
                    lineas: await ev(`window.__P.lineaDiast(${JSON.stringify(r.inf)})`) });
    }
    /* LA TERCERA COLUMNA: «Nuevo estudio» tiene que apagar el cartel. Sin la linea de
       `limpiarCampos`, el aviso del paciente anterior sobrevive sobre un formulario vacio. */
    await cargar(Object.assign({ ao_fc: '130' }, FIJO2), { diast_algoritmo: 'bse2024', diast_ritmo: 'fa' });
    const antes = await ev(`window.__P.fcAviso()`);
    await ev(`window.__P.limpiar()`);
    await pausa(200);
    out.fcTrasLimpiar = { antes: antes, despues: await ev(`window.__P.fcAviso()`) };
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  out.md5Igual = out.md5Ini === out.md5Fin;
  cdp.close();
  await new Promise((r) => srv.close(r));
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
