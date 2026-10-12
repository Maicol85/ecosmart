#!/usr/bin/env node
/**
 * _probe_bse2024.mjs — sonda A/B de SOLO LECTURA para el algoritmo BSE 2024 (Robinson et al.,
 * Echo Res Pract 2024;11:16) de la FUNCION DIASTOLICA en RITMO SINUSAL: el cuadro gris
 * (#dd-interp), la ventana del boton 🧭 y las superficies firmadas.
 *
 * Infraestructura calcada de scripts/_probe_diastfa.mjs (teclas y clics reales, cierre del
 * arbol de Chrome por GRUPO, cierre del aviso legal con su denominador, md5 al principio y al
 * final). NO muta index.html.
 *
 *   node scripts/_probe_bse2024.mjs --file /tmp/index.HEAD.html > /tmp/bse.HEAD.json
 *   node scripts/_probe_bse2024.mjs                             > /tmp/bse.NEW.json
 *
 * Grupos (--solo cuadro|ventana|bordes|edad|strain|fevi|superficies|otras):
 *   cuadro      — por escena: el badge, la frase del informe y la del EN SUMA.
 *   ventana     — la MISMA escena leida desde la ventana 🧭, y si coincide con el cuadro.
 *   bordes      — tripletes por corte: apenas abajo, justo en el corte, apenas arriba.
 *   edad        — el e' de la Tabla 2 (pag. 13) por franja de edad y por sexo, y el dato faltante.
 *   strain      — la sustitucion por strain de la AI de la Figura 17 (pag. 36).
 *   fevi        — la via de FEVI reducida (Figura 18, pag. 38) y la zona gris.
 *   superficies — informe en 3 estilos, EN SUMA en 3 estilos, columnas del Excel, el texto que
 *                 lee el PPT (#dd-interp), el grado que deriva el Laboratorio y el hash de los
 *                 campos guardados.
 *   otras       — CONTROL NEGATIVO: las mismas escenas con ASE 2025, ASE 2016 y en FA.
 *
 * ⚠️ DENOMINADOR. Un conteo de filas sobre una ventana que no abrio da cero y parece acuerdo
 * perfecto. Cada escena informa que tipeo, que quedo en el campo y cuantas filas vio.
 *
 * ⚠️ LOS GRUPOS SE CORREN DE A UNO. Varios en una sola sesion de pagina se cuelgan sobre el
 * arbol de HEAD (medido en la tanda anterior).
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

/* ══ ESCENAS DE RITMO SINUSAL — BSE 2024 ══════════════════════════════════════════════════════
   Cada escena es un PACIENTE, no un tecleo. Los numericos se tipean con TECLAS REALES; los
   <select> de escenario (ritmo, algoritmo, S/D) van por `set`, que NO es un gesto medido y se
   declara como tal.

   `peso 70` y `talla 170` van en TODA escena: sin ellos no hay ASC y el LAVi no se puede
   calcular — un denominador roto que se leeria como «el criterio no se cumple». Con esa ASC
   (1,81 m2) un Vol AI de 70 ml da LAVi 38,7 (POSITIVO, > 34) y uno de 50 da 27,6 (negativo).

   `edad 50` y `sexo M` van en casi toda escena porque la Tabla 2 (pag. 13) los necesita para
   decidir el e'. En la franja 41-65 el corte NO depende del sexo: septal < 5,0 y lateral < 6,0. */
const BASE = { peso: '70', talla: '170' };
const EDAD50 = { edad: '50' };

const ESCENAS = [
  { id: 'S00-vacio', que: 'formulario vacio', c: {} },

  /* ── Las tres variables principales de la Figura 17: E/e' promedio > 14, IT > 2,8, LAVi > 34 ── */
  { id: 'S01-3neg', que: '3 de 3 NEGATIVAS, e-prima normal para 50 anios (sep 10 / lat 12)',
    c: Object.assign({}, EDAD50, { onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' }), sel: { sexo: 'M' } },
  { id: 'S02-3neg-eprimaBaja', que: '3 de 3 NEGATIVAS pero e-prima BAJA para 50 anios (sep 4,5 / lat 5,5)',
    c: Object.assign({}, EDAD50, { onda_e: '30', onda_a: '60', e_sep: '4.5', e_lat: '5.5', vmax_it: '2.0', ai_vol: '50' }), sel: { sexo: 'M' } },
  { id: 'S03-3pos', que: '3 de 3 POSITIVAS: E/e-prima 18,5, IT 3,2, LAVi 38,7',
    c: Object.assign({}, EDAD50, { onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', vmax_it: '3.2', ai_vol: '70' }), sel: { sexo: 'M' } },
  { id: 'S04-2pos1neg', que: '2 POSITIVAS (E/e-prima 18,5 y LAVi 38,7) y 1 negativa (IT 2,0)',
    c: Object.assign({}, EDAD50, { onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', vmax_it: '2.0', ai_vol: '70' }), sel: { sexo: 'M' } },
  { id: 'S05-1pos2neg', que: '1 POSITIVA (LAVi 38,7) y 2 negativas (E/e-prima 6,4 e IT 2,0)',
    c: Object.assign({}, EDAD50, { onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '70' }), sel: { sexo: 'M' } },

  /* ── SOLO DOS CRITERIOS DISPONIBLES, 1 positiva y 1 negativa: es la rama del strain de la AI.
     Sin IT cargada (que la BSE declara ausente en el 40-60 % de los pacientes, pag. 36). ── */
  { id: 'S06-dos-1y1-sinStrain', que: 'SOLO 2 criterios (sin IT): E/e-prima 18,5 POSITIVA y LAVi 27,6 negativa, SIN LARS',
    c: Object.assign({}, EDAD50, { onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', ai_vol: '50' }), sel: { sexo: 'M' } },
  { id: 'S07-dos-1y1-LARSnormal', que: 'la misma, con LARS 32 % (>= 30: presion normal)',
    c: Object.assign({}, EDAD50, { onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', ai_vol: '50', lars: '32' }), sel: { sexo: 'M' } },
  { id: 'S08-dos-1y1-LARSbajo', que: 'la misma, con LARS 15 % (< 18: presion elevada)',
    c: Object.assign({}, EDAD50, { onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', ai_vol: '50', lars: '15' }), sel: { sexo: 'M' } },
  { id: 'S09-dos-1y1-LARSgris-ArAneg', que: 'la misma, LARS 25 % (gris) con Ar-A 10 ms (negativo)',
    c: Object.assign({}, EDAD50, { onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', ai_vol: '50', lars: '25', venp_dur_ar: '130', venp_dur_a: '120' }), sel: { sexo: 'M' } },
  { id: 'S10-dos-1y1-LARSgris-ArApos', que: 'la misma, LARS 25 % (gris) con Ar-A 40 ms (POSITIVO)',
    c: Object.assign({}, EDAD50, { onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', ai_vol: '50', lars: '25', venp_dur_ar: '160', venp_dur_a: '120' }), sel: { sexo: 'M' } },

  /* ── UNA SOLA VARIABLE EVALUADA: la Figura 17 no tiene rama para esto. No se afirma nada. ── */
  { id: 'S11-una-sola-pos', que: 'UNA SOLA variable evaluada y POSITIVA (LAVi 38,7), sin E ni IT',
    c: Object.assign({}, EDAD50, { e_sep: '6', e_lat: '7', ai_vol: '70' }), sel: { sexo: 'M' } },
  { id: 'S12-una-sola-neg', que: 'UNA SOLA variable evaluada y negativa (LAVi 27,6), sin E ni IT',
    c: Object.assign({}, EDAD50, { e_sep: '10', e_lat: '12', ai_vol: '50' }), sel: { sexo: 'M' } },
  { id: 'S13-sin-ninguna', que: 'NINGUNA variable evaluada: solo e-prima cargado',
    c: Object.assign({}, EDAD50, { e_sep: '10', e_lat: '12' }), sel: { sexo: 'M' } },

  /* ── e' CON UN SOLO ANILLO: el E/e' pasa a su corte propio (lateral > 13 o septal > 15, pag. 14) ── */
  { id: 'S14-solo-septal', que: 'solo e-prima SEPTAL 7,0 con E 105 -> E/e-prima septal 15,0',
    c: Object.assign({}, EDAD50, { onda_e: '105', onda_a: '60', e_sep: '7', vmax_it: '2.0', ai_vol: '50' }), sel: { sexo: 'M' } },
  { id: 'S15-solo-lateral', que: 'solo e-prima LATERAL 8,0 con E 105 -> E/e-prima lateral 13,1',
    c: Object.assign({}, EDAD50, { onda_e: '105', onda_a: '60', e_lat: '8', vmax_it: '2.0', ai_vol: '50' }), sel: { sexo: 'M' } },

  /* ── EL DATO QUE FALTA: sin edad el paso del e' no se puede resolver y la guia no lo inventa ── */
  { id: 'S16-sin-edad', que: 'SIN EDAD, 3 de 3 negativas (la presion igual se muestra)',
    c: { onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' }, sel: { sexo: 'M' } },
  { id: 'S17-sin-sexo-18a40', que: 'edad 30 SIN SEXO: en 18-40 el corte depende del sexo',
    c: { edad: '30', onda_e: '70', onda_a: '60', e_sep: '7.5', e_lat: '10', vmax_it: '2.0', ai_vol: '50' }, sel: { sexo: '' } },
  { id: 'S18-menor-de-18', que: 'edad 12: fuera del rango de la Tabla 2 (arranca en 18 anios)',
    c: { edad: '12', onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' }, sel: { sexo: 'M' } },

  /* ── VIA DE FEVI REDUCIDA (Figura 18) Y ZONA GRIS ── */
  { id: 'S19-fevi40', que: 'FEVI 40 % -> via reducida, 3 de 3 positivas',
    c: Object.assign({}, EDAD50, { fevi: '40', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', vmax_it: '3.2', ai_vol: '70' }), sel: { sexo: 'M' } },
  { id: 'S20-fevi40-neg', que: 'FEVI 40 % -> via reducida, 3 de 3 negativas',
    c: Object.assign({}, EDAD50, { fevi: '40', onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' }), sel: { sexo: 'M' } },
  { id: 'S21-gris-fevi52', que: 'ZONA GRIS por FEVI 52 % (50-54): la via sigue siendo la normal',
    c: Object.assign({}, EDAD50, { fevi: '52', onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' }), sel: { sexo: 'M' } },
  { id: 'S22-gris-gls17', que: 'ZONA GRIS por GLS -17 % (16,0-17,9) con FEVI 60',
    c: Object.assign({}, EDAD50, { fevi: '60', sgl: '-17', onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' }), sel: { sexo: 'M' } },
  { id: 'S23-sin-gris', que: 'CONTROL NEGATIVO de la zona gris: FEVI 60 y GLS -20',
    c: Object.assign({}, EDAD50, { fevi: '60', sgl: '-20', onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' }), sel: { sexo: 'M' } },
  { id: 'S24-fevi-red-2crit', que: 'FEVI 40 %, SOLO 2 criterios 1 y 1, con LARS 26 (>= 24: normal)',
    c: Object.assign({}, EDAD50, { fevi: '40', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', ai_vol: '50', lars: '26' }), sel: { sexo: 'M' } },
  { id: 'S25-fevi-red-2crit-sd', que: 'FEVI 40 %, 2 criterios 1 y 1, LARS 20 (gris) con S/D < 1 POSITIVO',
    c: Object.assign({}, EDAD50, { fevi: '40', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', ai_vol: '50', lars: '20' }), sel: { sexo: 'M', venp_sd: 'menor1' } },

  /* ── LA E/A SALE DEL CONTEO: estas dos escenas la mueven y NO tiene que cambiar nada ── */
  { id: 'S26-ea-baja', que: 'E/A 0,70 con las tres principales negativas (la E/A NO vota)',
    c: Object.assign({}, EDAD50, { onda_e: '70', onda_a: '100', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' }), sel: { sexo: 'M' } },
  { id: 'S27-ea-alta', que: 'E/A 2,33 con las tres principales negativas (la E/A NO vota)',
    c: Object.assign({}, EDAD50, { onda_e: '70', onda_a: '30', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' }), sel: { sexo: 'M' } },

  /* La via REDUCIDA tenia el mismo defecto que la normal: `marcadores > totalEvaluables / 2`
     afirmaba con UNA sola variable. Esta escena lo fija por el lado positivo y la siguiente por
     el negativo, que es su control. */
  { id: 'S28-fevi-red-una-pos', que: 'FEVI 40 % con UNA SOLA variable evaluada y POSITIVA (LAVi 38,7)',
    c: Object.assign({}, EDAD50, { fevi: '40', e_sep: '6', e_lat: '7', ai_vol: '70' }), sel: { sexo: 'M' } },
  { id: 'S29-fevi-red-una-neg', que: 'FEVI 40 % con UNA SOLA variable evaluada y negativa (LAVi 27,6)',
    c: Object.assign({}, EDAD50, { fevi: '40', e_sep: '6', e_lat: '7', ai_vol: '50' }), sel: { sexo: 'M' } }
];

/* ══ FRANJAS DE EDAD DE LA TABLA 2 (pag. 13) ═════════════════════════════════════════════════
   El MISMO e' (septal 6,5 / lateral 8,5) cambia de estado segun la franja y el sexo:
     18-40 M: sep < 7,0 · lat < 9,0   -> septal 6,5 BAJO, lateral 8,5 BAJO
     18-40 F: sep < 8,0 · lat < 11,0  -> los dos BAJOS
     41-65  : sep < 5,0 · lat < 6,0   -> los dos NORMALES
     > 65   : sep < 4,0 · lat < 5,0   -> los dos NORMALES
   Las tres principales se dejan NEGATIVAS en las cuatro, para que lo unico que se mueva sea el
   paso del e'. */
const FRANJAS = [
  { id: 'E1-30M', edad: '30', sexo: 'M', que: '18-40 masculino (sep < 7,0 / lat < 9,0)' },
  { id: 'E2-30F', edad: '30', sexo: 'F', que: '18-40 femenino (sep < 8,0 / lat < 11,0)' },
  { id: 'E3-50M', edad: '50', sexo: 'M', que: '41-65 (el corte NO depende del sexo)' },
  { id: 'E4-50F', edad: '50', sexo: 'F', que: '41-65 femenino: mismo corte que el masculino' },
  { id: 'E5-70M', edad: '70', sexo: 'M', que: '> 65 (el corte NO depende del sexo)' },
  { id: 'E6-18M', edad: '18', sexo: 'M', que: 'borde inferior de la tabla: 18 anios SI entra' },
  { id: 'E7-41M', edad: '41', sexo: 'M', que: 'borde 40/41: pasa a la franja del medio' },
  { id: 'E8-40M', edad: '40', sexo: 'M', que: 'borde 40/41: 40 anios sigue en la primera franja' },
  { id: 'E9-65M', edad: '65', sexo: 'M', que: 'borde 65/66: 65 sigue en la franja del medio' },
  { id: 'E10-66M', edad: '66', sexo: 'M', que: 'borde 65/66: 66 pasa a > 65' }
];
const FRANJA_C = { onda_e: '70', onda_a: '60', e_sep: '6.5', e_lat: '8.5', vmax_it: '2.0', ai_vol: '50' };

/* ⚠️ LAS DIEZ DE ARRIBA NO SEPARAN NI EL SEXO NI EL BORDE 65/66, Y LA PRIMERA CORRIDA LO MOSTRO:
   con septal 6,5 / lateral 8,5 los dos sexos de 18-40 dan ALTERADA (6,5 < 7,0 y 6,5 < 8,0) y las
   dos franjas de arriba dan NORMAL (6,5 > 5,0 y 6,5 > 4,0). Sirven como control negativo de que
   el sexo NO mueve el corte en 41-65, pero no prueban que SI lo mueva en 18-40.
   Estas cuatro usan valores que caen ENTRE los dos cortes de cada par:
     septal 7,5 -> 18-40 M normal (> 7,0) y 18-40 F alterada (< 8,0), con lateral 10 que tambien
       cae entre 9,0 y 11,0, asi que el OR no tapa el resultado;
     septal 4,5 -> 41-65 alterada (< 5,0) y > 65 normal (> 4,0). */
const FRANJAS_SEPARAN = [
  { id: 'E11-30M-sexo', edad: '30', sexo: 'M', c: { onda_e: '70', onda_a: '60', e_sep: '7.5', e_lat: '10', vmax_it: '2.0', ai_vol: '50' },
    que: '18-40 MASCULINO con sep 7,5 / lat 10: los dos POR ENCIMA de sus cortes -> normal' },
  { id: 'E12-30F-sexo', edad: '30', sexo: 'F', c: { onda_e: '70', onda_a: '60', e_sep: '7.5', e_lat: '10', vmax_it: '2.0', ai_vol: '50' },
    que: '18-40 FEMENINO con el MISMO e-prima: los dos POR DEBAJO -> alterada' },
  { id: 'E13-65M-sep45', edad: '65', sexo: 'M', c: { onda_e: '30', onda_a: '60', e_sep: '4.5', e_lat: '12', vmax_it: '2.0', ai_vol: '50' },
    que: '41-65 con septal 4,5 (< 5,0) -> alterada' },
  { id: 'E14-66M-sep45', edad: '66', sexo: 'M', c: { onda_e: '30', onda_a: '60', e_sep: '4.5', e_lat: '12', vmax_it: '2.0', ai_vol: '50' },
    que: '> 65 con el MISMO septal 4,5 (> 4,0) -> normal' }
];

/* ══ BORDES POR CORTE ════════════════════════════════════════════════════════════════════════
   Tripletes: apenas abajo, JUSTO en el corte, apenas arriba. El valor de abajo es el control
   negativo implicito de cada triplete. Los operadores salen de la Figura 17 (pag. 36) y de la
   Tabla 2 (pag. 13): E/e' y la IT con «>», el LAVi con «>», el e' de la Tabla 2 con «<», el
   LARS normal con «>=» y el LARS bajo con «<». */
const FIJO_2CRIT = { edad: '50', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', ai_vol: '50' };
const BORDES = [
  { id: 'B1-ee', que: "E/e' promedio > 14 (con los dos anillos)", campo: 'onda_e',
    fijo: { edad: '50', onda_a: '60', e_sep: '6', e_lat: '8', vmax_it: '2.0', ai_vol: '50' },
    sel: { sexo: 'M' }, vals: ['97', '98', '99'],
    nota: "e' promedio 7,0 -> E/e' 13,86 / 14,00 / 14,14; el 14,00 exacto es NEGATIVO (>)" },
  { id: 'B2-it', que: 'velocidad de la IT > 2,8 m/s', campo: 'vmax_it',
    fijo: { edad: '50', onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', ai_vol: '50' },
    sel: { sexo: 'M' }, vals: ['2.79', '2.8', '2.81'],
    nota: 'el 2,80 exacto es NEGATIVO (>)' },
  { id: 'B3-lavi', que: 'LAVi > 34 ml/m2', campo: 'ai_vol',
    fijo: { edad: '50', onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0' },
    sel: { sexo: 'M' }, vals: ['61', '61.5', '62'],
    nota: 'con ASC 1,81: LAVi 33,7 / 34,0 / 34,3; el 34,0 es NEGATIVO (>)' },
  { id: 'B4-eeSeptal', que: "E/e' SEPTAL > 15 con un solo anillo (pag. 14)", campo: 'onda_e',
    fijo: { edad: '50', onda_a: '60', e_sep: '7', vmax_it: '2.0', ai_vol: '50' },
    sel: { sexo: 'M' }, vals: ['104', '105', '106'],
    nota: "E/e' septal 14,86 / 15,00 / 15,14; el 15,00 exacto es NEGATIVO (>)" },
  { id: 'B5-eeLateral', que: "E/e' LATERAL > 13 con un solo anillo (pag. 14)", campo: 'onda_e',
    fijo: { edad: '50', onda_a: '60', e_lat: '8', vmax_it: '2.0', ai_vol: '50' },
    sel: { sexo: 'M' }, vals: ['103', '104', '105'],
    nota: "E/e' lateral 12,88 / 13,00 / 13,13; el 13,00 exacto es NEGATIVO (>)" },
  { id: 'B6-larsNormal', que: 'LARS >= 30 % -> presion normal (Figura 17)', campo: 'lars',
    fijo: FIJO_2CRIT, sel: { sexo: 'M' }, vals: ['29.9', '30', '30.1'],
    nota: 'el 30,0 exacto SI cumple (>=)' },
  { id: 'B7-larsBajo', que: 'LARS < 18 % -> presion elevada (Figura 17)', campo: 'lars',
    fijo: FIJO_2CRIT, sel: { sexo: 'M' }, vals: ['17.9', '18', '18.1'],
    nota: 'el 18,0 exacto NO cumple (<): cae en la zona gris' },
  { id: 'B8-eprimaSep41a65', que: "e' septal < 5,0 en 41-65 (Tabla 2)", campo: 'e_sep',
    fijo: { edad: '50', onda_e: '30', onda_a: '60', e_lat: '12', vmax_it: '2.0', ai_vol: '50' },
    sel: { sexo: 'M' }, vals: ['4.9', '5', '5.1'],
    nota: 'el 5,0 exacto es NORMAL (<)' },
  { id: 'B9-eprimaSep18a40M', que: "e' septal < 7,0 en 18-40 masculino (Tabla 2)", campo: 'e_sep',
    fijo: { edad: '30', onda_e: '30', onda_a: '60', e_lat: '12', vmax_it: '2.0', ai_vol: '50' },
    sel: { sexo: 'M' }, vals: ['6.9', '7', '7.1'],
    nota: 'el 7,0 exacto es NORMAL (<)' },
  { id: 'B10-eprimaSep18a40F', que: "e' septal < 8,0 en 18-40 femenino (Tabla 2)", campo: 'e_sep',
    fijo: { edad: '30', onda_e: '30', onda_a: '60', e_lat: '12', vmax_it: '2.0', ai_vol: '50' },
    sel: { sexo: 'F' }, vals: ['7.9', '8', '8.1'],
    nota: 'el 8,0 exacto es NORMAL (<)' },
  { id: 'B11-eprimaLat65', que: "e' lateral < 5,0 en > 65 (Tabla 2)", campo: 'e_lat',
    fijo: { edad: '70', onda_e: '30', onda_a: '60', e_sep: '10', vmax_it: '2.0', ai_vol: '50' },
    sel: { sexo: 'M' }, vals: ['4.9', '5', '5.1'],
    nota: 'el 5,0 exacto es NORMAL (<)' },
  { id: 'B12-arA', que: 'Ar-A > 30 ms, parametro suplementario (Figura 17)', campo: 'venp_dur_ar',
    fijo: Object.assign({}, FIJO_2CRIT, { lars: '25', venp_dur_a: '120' }),
    sel: { sexo: 'M' }, vals: ['149', '150', '151'],
    nota: 'Ar-A 29 / 30 / 31 ms; el 30 exacto es NEGATIVO (>)' },
  { id: 'B13-fevi', que: 'FEVI < 50 % abre la via reducida', campo: 'fevi',
    fijo: { edad: '50', onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' },
    sel: { sexo: 'M' }, vals: ['49', '50', '51'],
    nota: 'el 50 exacto es via NORMAL (<)' },
  { id: 'B14-gls', que: 'GLS absoluto < 16 % abre la via reducida', campo: 'sgl',
    fijo: { edad: '50', fevi: '60', onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' },
    sel: { sexo: 'M' }, vals: ['-15.9', '-16', '-16.1'],
    nota: 'el -16,0 exacto es via NORMAL (<)' }
];

const GUIAS_OTRAS = ['ase2025', 'ase2016'];
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
  const esc = (algo, extra) => Object.assign({ diast_algoritmo: algo || 'bse2024', diast_ritmo: 'sinusal' }, extra || {});

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
      const b = String(cuadro.badge || '').replace(/\s*—\s*BSE 2024\s*$/, '').trim();
      r.badgeSinGuia = b;
      r.acuerdo = b !== '' && String(ven.res || '').indexOf(b) === 0;
    }
    return r;
  }

  const out = { archivo: FILE, md5Ini, avisoEstado, denominador: denom,
                boton: btn, cerrar: btnX };

  if (hacer('cuadro') || hacer('ventana')) {
    out.escenas = [];
    for (const e of ESCENAS) {
      const carga = await cargar(e.c, esc('bse2024', e.sel), e.teclas);
      const m = await medir(hacer('ventana'));
      out.escenas.push(Object.assign({ id: e.id, que: e.que,
        carga: carga.todosOk ? 'TODOS OK' : carga.tecleos, sels: carga.sels }, m));
    }
  }

  if (hacer('edad')) {
    /* El MISMO e' (septal 6,5 / lateral 8,5) por las diez franjas y bordes de la Tabla 2. Las
       tres principales quedan NEGATIVAS en las diez, asi que lo unico que se mueve es el e'. */
    out.franjas = [];
    for (const f of FRANJAS.concat(FRANJAS_SEPARAN)) {
      const c = Object.assign({}, f.c || FRANJA_C, { edad: f.edad });
      const carga = await cargar(c, esc('bse2024', { sexo: f.sexo }));
      const m = await medir(true);
      out.franjas.push(Object.assign({ id: f.id, que: f.que, edad: f.edad, sexo: f.sexo,
        carga: carga.todosOk ? 'OK' : carga.tecleos }, m));
    }
  }

  if (hacer('bordes')) {
    out.bordes = [];
    for (const b of BORDES) {
      const tri = [];
      for (const val of b.vals) {
        const c = Object.assign({}, b.fijo); c[b.campo] = val;
        const carga = await cargar(c, esc('bse2024', b.sel), b.teclas);
        const m = await medir(true);
        tri.push({ valor: val, carga: carga.todosOk ? 'OK' : carga.tecleos,
                   badge: m.cuadro.badge, texto: m.cuadro.texto, suma: m.cuadro.suma,
                   res: m.ventana.res, nFilas: m.ventana.nFilas, filas: m.ventana.filas,
                   acuerdo: m.acuerdo, avisos: m.avisos });
      }
      out.bordes.push({ id: b.id, que: b.que, campo: b.campo, nota: b.nota, triplete: tri });
    }
  }

  if (hacer('superficies')) {
    /* LAS SEIS SUPERFICIES, UNA POR UNA. Nunca «el informe y el Excel» en bloque: cada una tiene
       su propio emisor y se rompen por separado. */
    out.superficies = [];
    for (const e of ESCENAS) {
      const carga = await cargar(e.c, esc('bse2024', e.sel), e.teclas);
      const s = { id: e.id, que: e.que, carga: carga.todosOk ? 'OK' : carga.tecleos, estilos: {} };
      for (const est of ['narrativo', 'telegrafico', 'estructurado']) {
        const r = await ev(`window.__P.informe(${JSON.stringify(est)})`);
        s.estilos[est] = { lineas: await ev(`window.__P.lineaDiast(${JSON.stringify(r.inf)})`),
                           suma: await ev(`window.__P.norm(${JSON.stringify(r.suma)})`),
                           lab: await ev(`window.__P.labGrado(${JSON.stringify(r.inf)}, ${JSON.stringify(r.suma)})`) };
      }
      s.excel = await ev(`window.__P.excelCols()`);
      s.ppt = await ev(`window.__P.pptDiast()`);
      s.camposHash = await ev(`window.__P.hash(JSON.stringify(window.__P.campos()))`);
      out.superficies.push(s);
    }
  }

  if (hacer('otras')) {
    /* CONTROL NEGATIVO. Las mismas escenas con las otras dos guias en ritmo sinusal y con las
       tres en FA: esta tanda no toca ninguna de esas vias y tienen que salir identicas a HEAD. */
    out.otras = [];
    const SUB = ESCENAS.filter((e) => ['S00-vacio','S01-3neg','S03-3pos','S05-1pos2neg','S19-fevi40','S26-ea-baja'].indexOf(e.id) > -1);
    for (const algo of GUIAS_OTRAS) {
      for (const e of SUB) {
        const carga = await cargar(e.c, esc(algo, e.sel), e.teclas);
        const m = await medir(true);
        out.otras.push(Object.assign({ guia: algo, ritmo: 'sinusal', id: e.id,
          carga: carga.todosOk ? 'OK' : carga.tecleos }, m));
      }
    }
    for (const algo of ['ase2025', 'bse2024', 'ase2016']) {
      for (const e of SUB) {
        const carga = await cargar(e.c, Object.assign(esc(algo, e.sel), { diast_ritmo: 'fa' }), e.teclas);
        const m = await medir(true);
        out.otras.push(Object.assign({ guia: algo, ritmo: 'fa', id: e.id,
          carga: carga.todosOk ? 'OK' : carga.tecleos }, m));
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
