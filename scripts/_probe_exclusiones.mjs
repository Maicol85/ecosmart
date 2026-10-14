#!/usr/bin/env node
/**
 * _probe_exclusiones.mjs — sonda A/B de SOLO LECTURA para el AVISO DE EXCLUSIONES MITRALES de la
 * funcion diastolica (2026-10-14): hasta hoy hablaba SOLO con la ASE 2025 en ritmo sinusal y
 * ahora vale para las TRES guias y los DOS ritmos, en el cuadro gris y en la ventana 🧭.
 *
 * Folios: ASE 2025 = pagina del PDF + 536 · ASE/EACVI 2016 = pagina + 276 · BSE 2024 = pagina.
 *
 * Infraestructura calcada de scripts/_probe_diastcompl.mjs (teclas y clics reales, cierre del
 * arbol de Chrome por GRUPO, cierre del aviso legal con su denominador, md5 al principio y al
 * final). NO muta index.html.
 *
 *   node scripts/_probe_exclusiones.mjs --file /tmp/index.HEAD.html > /tmp/ex.HEAD.json
 *   node scripts/_probe_exclusiones.mjs                             > /tmp/ex.NEW.json
 *
 * Grupos (--solo morf|guias|im|ventana|superficies|controles|captura):
 *   morf        — las NUEVE opciones EXACTAS de «Morfologia VM», una por una, contra aviso si/no.
 *   guias       — los cuatro disparadores por las TRES guias y los DOS ritmos (24 escenas) mas
 *                 su control negativo (morfologia Normal) en las seis combinaciones.
 *   im          — el grado final de la IM por TECLAS REALES sobre la vena contracta: severa
 *                 dispara, moderada no. El grado se LEE, no se afirma.
 *   ventana     — que la ventana 🧭 dice EXACTAMENTE el mismo texto que el cuadro gris, en las
 *                 seis combinaciones de guia y ritmo, y que sin motivos no dibuja la caja.
 *   superficies — CONTROL: informe en 3 estilos, EN SUMA, Excel con su cuenta de columnas,
 *                 franja del PPT, grado del Laboratorio y hash de los campos guardados.
 *   controles   — CONTROL NEGATIVO: con la mitral NORMAL, las seis combinaciones no avisan y el
 *                 veredicto es el de siempre.
 *   captura     — PNG del cuadro y de la ventana en tema claro y oscuro (--captura --dest DIR).
 *
 * ⚠️ DENOMINADOR. Cada escena informa que quedo en `vm_morf`, que quedo en `im_grado` y cuantas
 * filas vio la ventana. Una ventana que no abrio da cero filas y parece acuerdo perfecto.
 *
 * ⚠️ EL GRADO DE LA IM NO SE ESCRIBE A MANO: se tipea la vena contracta con teclas reales y se
 * LEE `im_grado`, que es el campo que el aviso consulta. Escribirlo directo mediria la lectura
 * del aviso y no la cadena que lo produce.
 *
 * ⚠️ `vm_morf` ES UN <select> y va por `__P.set`, que despacha `change` y por lo tanto corre su
 * cadena real (`showProlapsoPanel`, `valvProtSync`, `calcIM_ESC`, `calcEM`). Es el mismo trato
 * que las demas sondas de este repo le dan a un <select> de escenario.
 *
 * ⚠️ EL TEMA CLARO ES LA CLASE `light-mode` SOBRE documentElement, no un atributo `data-theme`:
 * la sonda ABORTA si la clase no quedo puesta (una tanda anterior saco dos capturas identicas
 * byte por byte y eso es la firma de que el cambio nunca ocurrio).
 *
 * ⚠️ LOS GRUPOS SE CORREN DE A UNO. Varios en una sola sesion de pagina se cuelgan sobre el
 * arbol de HEAD (medido en dos tandas anteriores).
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
    return c },

  /* ══ LO QUE ESTA TANDA AGREGA A LA SONDA ════════════════════════════════════════════════════ */

  /* Las opciones EXACTAS de «Morfologia VM», con su value y su texto. Es el DENOMINADOR del
     grupo morf: una opcion que se agregue maniana y nadie mire queda a la vista en el JSON. */
  /* El COLOR COMPUTADO de los cuatro avisos ambar del cuadro, mas el de la caja de la ventana.
     Se lee el computado y no el inline: --amber esta definido SOLO dentro de .amilo-root, asi
     que fuera de ahi la declaracion es invalida en tiempo de valor computado y el color cae al
     heredado. Es un defecto PREEXISTENTE de los otros tres avisos y se mide para declararlo. */
  colores() {
    var o = {};
    ['diast-excl-aviso','diast-fc-aviso','diast-bse-eprima-aviso','diast-bse-gris-aviso'].forEach(function(id){
      var e = document.getElementById(id);
      o[id] = e ? getComputedStyle(e).color : 'NO EXISTE' });
    var raiz = getComputedStyle(document.documentElement);
    o.varAmberEnRaiz  = raiz.getPropertyValue('--amber').trim() || '(sin definir)';
    o.varOrangeEnRaiz = raiz.getPropertyValue('--orange').trim() || '(sin definir)';
    o.textoNormal = getComputedStyle(document.body).color;
    return o },

  morfOpciones() {
    var e = document.getElementById('vm_morf');
    if (!e) return 'NO EXISTE vm_morf';
    return Array.from(e.options).map(function(o){
      return { value: o.value, texto: window.__P.norm(o.textContent) } }) },

  /* El estado completo del disparador: lo que el aviso MIRA, para que una escena no pueda
     informar «no avisa» sobre un campo que nunca se cargo. */
  disparador() {
    return { morf: window.__P.val('vm_morf'),
             emGrado: window.__P.val('em_grado'),
             imGrado: window.__P.val('im_grado'),
             esProtesis: (typeof valvEsProtesis === 'function')
                           ? valvEsProtesis(window.__P.val('vm_morf')) : 'SIN valvEsProtesis',
             motivos: (typeof diastExclMotivos === 'function') ? diastExclMotivos() : 'SIN FUNCION',
             texto: (typeof diastExclTexto === 'function') ? diastExclTexto() : 'SIN diastExclTexto' } },

  /* La caja del aviso DENTRO de la ventana 🧭. Se lee del cuerpo del overlay y no del documento
     entero: el nodo del cuadro gris tiene el mismo texto y contarlo dos veces seria un falso. */
  avisoVentana() {
    var cu = document.getElementById('diast-algo-cuerpo');
    if (!cu) return { err: 'NO EXISTE el cuerpo de la ventana' };
    var cajas = Array.from(cu.querySelectorAll('.da-excl'));
    return { n: cajas.length,
             txt: cajas.length ? window.__P.norm(cajas[0].textContent) : '',
             disp: cajas.length ? getComputedStyle(cajas[0]).display : null,
             color: cajas.length ? getComputedStyle(cajas[0]).color : null,
             primeroDelCuerpo: cajas.length ? (cu.firstElementChild === cajas[0]) : null } },

  /* El tema: la clase light-mode sobre documentElement. Se DEVUELVE el estado para que la
     sonda pueda abortar si el cambio no ocurrio. */
  tema(claro) {
    var r = document.documentElement;
    if (claro === true)  r.classList.add('light-mode');
    if (claro === false) r.classList.remove('light-mode');
    return { claro: r.classList.contains('light-mode'),
             fondo: getComputedStyle(document.body).backgroundColor } },

  /* El bloque de parametros de la IM esta detras de DOS puertas: la pestania Valvulas y el
     cajon «caja-insuf-mitral». El buscador generico de revelar() NO lo alcanza, porque el
     contenedor oculto se llama «bloque-insuf-mitral» y el onclick del boton nombra «caja-»:
     dos nombres para la misma puerta. Se devuelve el id del boton REAL para clickearlo. */
  puertaIM() {
    /* ⚠️ showTab('valvulas') SOLO SI NO ESTAMOS YA AHI. showTab corre valvCerrarTarjetas, asi
       que llamarlo en cada lectura CIERRA la seccion que el clic anterior acababa de abrir: la
       sonda clickeaba cuatro veces, el clic llegaba al blanco las cuatro —medido, esElBlanco
       true— y la seccion salia cerrada igual. Es la leccion que este repo ya tiene escrita para
       generarInforme() pelado, por la otra punta. */
    var t = document.getElementById('tab-valvulas');
    if (!t || getComputedStyle(t).display === 'none') { try { showTab('valvulas') } catch(e) {} }
    /* La PRIMERA puerta es la seccion plegable de la mitral («ete-seccion-valv-mitral»), que
       abre toggleEteSeccion('valv-mitral'); la SEGUNDA es el cajon de datos. Son dos y hay que
       nombrar las dos: con solo la segunda, el cajon figura «abierto» y el campo sigue sin
       geometria, que es exactamente lo que midio la primera corrida de esta sonda. */
    var s1 = Array.from(document.querySelectorAll('[onclick]')).find(function(x){
      return (x.getAttribute('onclick')||'').indexOf("toggleEteSeccion('valv-mitral'") >= 0 });
    if (s1 && !s1.id) s1.id = '__btnSecMitral';
    var sec = document.getElementById('ete-seccion-valv-mitral');
    var b = Array.from(document.querySelectorAll('[onclick]')).find(function(x){
      return (x.getAttribute('onclick')||'').indexOf("valvDatosTog('caja-insuf-mitral')") >= 0 });
    if (b && !b.id) b.id = '__btnCajaIM';
    var bl = document.getElementById('bloque-insuf-mitral');
    var cadena = [], n = document.getElementById('im_vc');
    while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none')
        cadena.push(n.id || ('.' + String(n.className || '?')).slice(0, 60));
      n = n.parentNode;
    }
    return { seccion: s1 ? s1.id : 'NO ENCONTRADO',
             seccionAbierta: sec ? getComputedStyle(sec).display !== 'none' : 'NO EXISTE',
             boton: b ? b.id : 'NO ENCONTRADO',
             abierto: bl ? getComputedStyle(bl).display !== 'none' : 'NO EXISTE',
             ocultoPor: cadena,
             vcVisible: window.__P.vis('im_vc') } },

  /* Rect de un nodo en coordenadas de PAGINA, que es lo que pide el clip de
     Page.captureScreenshot. getBoundingClientRect da las del VIEWPORT y con la pagina
     scrolleada la captura sale en negro — leccion ya escrita en este repo. */
  rectPagina(sel) {
    var e = document.querySelector(sel);
    if (!e) return null;
    var r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'sin geometria' };
    return { x: Math.round(r.left + window.scrollX), y: Math.round(r.top + window.scrollY),
             width: Math.round(r.width), height: Math.round(r.height), scale: 1 } }
};
1
`;

/* ══ EL PACIENTE BASE ════════════════════════════════════════════════════════════════════════
   Una escena CARGADA, para que el cuadro y la ventana tengan veredicto: sin denominador, un
   aviso que aparece sobre un cuadro vacio no prueba que el aviso convive con el calculo. */
const BASE = { edad: '68', peso: '78', talla: '170', fevi: '60',
               ai_vol: '78', vmax_it: '3.0',
               e_sep: '5.5', e_lat: '7.0', onda_e: '95', onda_a: '60' };

/* ══ LOS DISPARADORES, UNO POR UNO ═══════════════════════════════════════════════════════════
   `espera` es lo que esta tanda AFIRMA: true = tiene que avisar. Se compara contra lo medido,
   no se asume. `via` dice COMO se arma la escena, que es lo que distingue un <select> de un
   tecleo real. */
const DISPAROS = [
  { id: 'normal',  via: 'morf',  morf: 'Normal',                                   espera: false },
  { id: 'mixo',    via: 'morf',  morf: 'Mixomatosa / Barlow',                      espera: false },
  { id: 'calc',    via: 'morf',  morf: 'Calcificada',                              espera: true  },
  { id: 'reum',    via: 'morf',  morf: 'Reumática',                                espera: false },
  { id: 'prol',    via: 'morf',  morf: 'Prolapso / EVMS',                          espera: false },
  { id: 'protbio', via: 'morf',  morf: 'Prótesis biológica',                       espera: true  },
  { id: 'protmec', via: 'morf',  morf: 'Prótesis mecánica',                        espera: true  },
  { id: 'endoc',   via: 'morf',  morf: 'Endocarditis',                             espera: false },
  { id: 'isq',     via: 'morf',  morf: 'Isquémica (disfunción/rotura músculo papilar)', espera: false },
  /* La estenosis NO es una opcion de la morfologia: su duenio es el selector de grado, y el
     centinela es 'sin'. Cualquier otro valor es una estenosis consignada por el medico. */
  { id: 'emsig',   via: 'em',    morf: 'Normal', em: 'severa',                     espera: true  },
  { id: 'emnosig', via: 'em',    morf: 'Normal', em: 'leve',                       espera: true  },
  { id: 'emsin',   via: 'em',    morf: 'Normal', em: 'sin',                        espera: false }
];

/* Las seis combinaciones de guia y ritmo. El aviso vale para las TRES y para los DOS. */
const COMBOS = [
  { algo: 'ase2025', ritmo: 'sinusal' }, { algo: 'ase2025', ritmo: 'fa' },
  { algo: 'bse2024', ritmo: 'sinusal' }, { algo: 'bse2024', ritmo: 'fa' },
  { algo: 'ase2016', ritmo: 'sinusal' }, { algo: 'ase2016', ritmo: 'fa' }
];

/* La vena contracta mitral, con TECLAS REALES. El grado NO se afirma: se lee de `im_grado`,
   que es el campo que el aviso consulta, y va en el JSON al lado del veredicto. */
const IM_VC = [
  { id: 'im-sin',  vc: null, espera: false },
  { id: 'im-leve', vc: '2',  espera: false },
  { id: 'im-mod',  vc: '5',  espera: false },
  { id: 'im-sev',  vc: '8',  espera: true  }
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


  /* Los <select> de escenario van SIEMPRE primero, antes de cualquier tecla: la guia, el ritmo
     y la morfologia de la mitral. */
  const esc = (algo, ritmo, extra) =>
    Object.assign({ diast_algoritmo: algo || 'ase2025', diast_ritmo: ritmo || 'sinusal' }, extra || {});

  /* Arma una escena: limpia, fija los <select>, tipea la BASE con teclas reales y devuelve el
     DENOMINADOR (que quedo en cada campo). */
  async function escena(algo, ritmo, sels, teclas) {
    await despejar();
    const carga = await cargar({}, esc(algo, ritmo, sels), Object.assign({}, BASE, teclas || {}));
    const disp = await ev(`window.__P.disparador()`);
    return { carga: carga.todosOk ? 'OK' : carga.tecleos, sels: carga.sels, disparador: disp };
  }

  const leerAviso = () => ev(`window.__P.aviso()`);

  /* ⚠️ EL AVISO LEGAL VUELVE A MITAD DE CORRIDA Y SE COME TODOS LOS CLICS. Con `#modalAvisoEco`
     puesto, `elementFromPoint` devuelve ESE nodo, `clicEn` cae a su respaldo por tecla y un
     <h2> no se activa con Enter: la escena informa «la puerta no abrio» sobre un gesto que
     nunca ocurrio. Se despeja ANTES de cada escena y se devuelve el estado, que va al JSON. */
  async function despejar() {
    const r = await ev(`(function(){
      var o = {};
      ['modalAvisoEco','login-overlay'].forEach(function(id){
        var m = document.getElementById(id);
        if (!m) { o[id] = 'NO EXISTE'; return }
        if (getComputedStyle(m).display !== 'none') { m.style.display = 'none'; o[id] = 'cerrado' }
        else o[id] = 'ya estaba'; });
      return o })()`);
    return r;
  }

  const out = { md5Ini, archivo: FARG, avisoLegal: avisoEstado, denominador: denom,
                botonAlgo: btn, morfOpciones: await ev(`window.__P.morfOpciones()`) };

  if (hacer('morf')) {
    /* LAS NUEVE OPCIONES DE LA MORFOLOGIA, una por una, con la guia y el ritmo por omision.
       El DENOMINADOR es `morfOpciones` de arriba: si alguna vez hay una decima, este grupo la
       deja a la vista sin medirla y se nota. */
    out.morf = [];
    out.colores = await ev(`window.__P.colores()`);
    for (const d of DISPAROS) {
      const e = await escena('ase2025', 'sinusal',
        Object.assign({ vm_morf: d.morf }, d.em ? { em_grado: d.em } : {}));
      const av = await leerAviso();
      out.morf.push({ id: d.id, via: d.via, espera: d.espera,
        morfQuedo: e.disparador.morf, emQuedo: e.disparador.emGrado,
        motivos: e.disparador.motivos, aviso: av,
        hay: av.disp !== 'none' && !!av.txt,
        coincide: (av.disp !== 'none' && !!av.txt) === d.espera, carga: e.carga });
    }
  }

  if (hacer('guias')) {
    /* LOS CUATRO DISPARADORES POR LAS TRES GUIAS Y LOS DOS RITMOS. Se usan los cuatro que SI
       disparan mas el control negativo de la morfologia Normal: 5 x 6 = 30 escenas. */
    const SET = DISPAROS.filter(d => ['normal', 'calc', 'protbio', 'protmec', 'emsig'].indexOf(d.id) > -1);
    out.guias = [];
    for (const c of COMBOS) for (const d of SET) {
      const e = await escena(c.algo, c.ritmo,
        Object.assign({ vm_morf: d.morf }, d.em ? { em_grado: d.em } : {}));
      const av = await leerAviso();
      const cu = await ev(`window.__P.cuadro()`);
      out.guias.push({ guia: c.algo, ritmo: c.ritmo, id: d.id, espera: d.espera,
        morfQuedo: e.disparador.morf, emQuedo: e.disparador.emGrado,
        hay: av.disp !== 'none' && !!av.txt, txt: av.txt,
        coincide: (av.disp !== 'none' && !!av.txt) === d.espera,
        badge: cu.badge, carga: e.carga });
    }
  }

  if (hacer('im')) {
    /* EL GRADO FINAL DE LA IM, POR TECLAS REALES SOBRE LA VENA CONTRACTA. El grado se LEE, no se
       afirma: va en el JSON al lado del veredicto.
       ⚠️ LA VENA CONTRACTA SE TIPEA DESPUES DE `cargar`, Y CON SU PUERTA ABIERTA A MANO. Vive
       detras de la pestania Valvulas Y del cajon «caja-insuf-mitral», y el revelar() generico no
       da con el boton porque el contenedor y el cajon tienen nombres distintos. Si se metiera en
       la tanda de BASE, `limpiar()` volveria a cerrar el cajon antes de llegar. */
    out.im = [];
    for (const c of COMBOS) for (const s of IM_VC) {
      await escena(c.algo, c.ritmo, { vm_morf: 'Normal' });
      await despejar();
      let puerta = await ev(`window.__P.puertaIM()`);
      const clics = [];
      for (let i = 0; i < 4 && puerta.vcVisible !== true; i++) {
        if (puerta.seccionAbierta !== true && puerta.seccion !== 'NO ENCONTRADO') clics.push(await clicEn(puerta.seccion));
        else if (puerta.abierto !== true && puerta.boton !== 'NO ENCONTRADO') clics.push(await clicEn(puerta.boton));
        else break;
        puerta = await ev(`window.__P.puertaIM()`);
      }
      puerta.clics = clics;
      if (s.vc && puerta.vcVisible !== true) {
        throw new Error('la puerta de la IM no abrio: ' + JSON.stringify(puerta));
      }
      const tec = s.vc ? await tipear('im_vc', s.vc) : { via: 'sin dato', quedo: '' };
      const disp = await ev(`window.__P.disparador()`);
      const av = await leerAviso();
      out.im.push({ guia: c.algo, ritmo: c.ritmo, id: s.id, vcPedida: s.vc,
        puerta, vcQuedo: await ev(`window.__P.val('im_vc')`), tecleo: tec,
        imGrado: disp.imGrado, espera: s.espera,
        hay: av.disp !== 'none' && !!av.txt, txt: av.txt,
        coincide: (av.disp !== 'none' && !!av.txt) === s.espera,
        motivos: disp.motivos });
    }
  }

  if (hacer('ventana')) {
    /* LA VENTANA 🧭 DICE EXACTAMENTE LO MISMO QUE EL CUADRO, en las seis combinaciones, y sin
       motivos NO dibuja la caja. Las dos superficies llaman al mismo duenio: si alguna vez se
       separan, `igual` se pone en false. */
    out.ventana = [];
    for (const c of COMBOS) for (const d of [DISPAROS.find(x => x.id === 'protbio'),
                                             DISPAROS.find(x => x.id === 'normal')]) {
      await escena(c.algo, c.ritmo, { vm_morf: d.morf });
      const av = await leerAviso();
      const abrir = await clicEn(btn.sel);
      const caja = await ev(`window.__P.avisoVentana()`);
      const ven  = await ev(`window.__P.ventana()`);
      const cerrar = btnX.err ? { via: 'SIN BOTON' } : await clicEn(btnX.sel);
      out.ventana.push({ guia: c.algo, ritmo: c.ritmo, id: d.id, espera: d.espera,
        cuadroTxt: av.txt, ventanaTxt: caja.txt, nCajas: caja.n,
        primeroDelCuerpo: caja.primeroDelCuerpo, color: caja.color,
        igual: av.txt === caja.txt,
        /* DENOMINADOR: una ventana que no abrio da cero filas y parece acuerdo perfecto. */
        nFilas: ven.nFilas, abierta: ven.abierta, titulo: ven.titulo,
        viaAbrir: abrir.via, viaCerrar: cerrar.via });
    }
  }

  if (hacer('superficies') || hacer('controles')) {
    /* CONTROL: las SEIS superficies, enumeradas una por una. Con el aviso PRENDIDO (protesis) y
       con el aviso APAGADO (mitral normal), por las tres guias. Nada de esto puede moverse. */
    out.superficies = [];
    const QUIEN = [DISPAROS.find(x => x.id === 'protbio'), DISPAROS.find(x => x.id === 'normal')];
    for (const c of COMBOS) for (const d of QUIEN) {
      await escena(c.algo, c.ritmo, { vm_morf: d.morf });
      const s = { guia: c.algo, ritmo: c.ritmo, id: d.id };
      for (const est of ['conciso', 'estandar', 'narrativo']) {
        const r = await ev(`window.__P.informe(${JSON.stringify(est)})`);
        s['inf_' + est]  = await ev(`window.__P.hash(${JSON.stringify(r.inf)})`);
        s['suma_' + est] = await ev(`window.__P.hash(${JSON.stringify(r.suma)})`);
        if (est === 'narrativo') { s.sumaTxt = r.suma; s.infLineas = await ev(`window.__P.lineaDiast(${JSON.stringify(r.inf)})`); }
      }
      s.excel   = await ev(`window.__P.excelCols()`);
      s.ppt     = await ev(`window.__P.pptDiast()`);
      s.labGrado = await ev(`window.__P.labGrado(${JSON.stringify('')}, ${JSON.stringify('')})`);
      s.camposHash = await ev(`window.__P.hash(JSON.stringify(window.__P.camposSinTextos()))`);
      s.badge = (await ev(`window.__P.cuadro()`)).badge;
      out.superficies.push(s);
    }
  }

  if (hacer('captura')) {
    /* PNG del cuadro y de la ventana en los DOS temas. El tema es la clase `light-mode`: si no
       quedo puesta se ABORTA, porque dos capturas identicas byte por byte es la firma de que el
       cambio nunca ocurrio. */
    const dest = arg('--dest') || tmpdir();
    out.captura = [];
    for (const claro of [false, true]) {
      const t = await ev(`window.__P.tema(${claro})`);
      if (t.claro !== claro) throw new Error('el tema NO cambio: pedido claro=' + claro + ' quedo ' + JSON.stringify(t));
      await escena('bse2024', 'sinusal', { vm_morf: 'Prótesis biológica' });
      const av = await leerAviso();
      const rc = await ev(`window.__P.rectPagina('#diast-excl-aviso')`);
      if (rc && !rc.err) {
        const png = await cdp.send('Page.captureScreenshot', { format: 'png', clip: rc }, sessionId);
        const f = join(dest, 'excl_cuadro_' + (claro ? 'claro' : 'oscuro') + '.png');
        await writeFile(f, Buffer.from(png.data, 'base64'));
        out.captura.push({ tema: claro ? 'claro' : 'oscuro', donde: 'cuadro', archivo: f, rect: rc, txt: av.txt });
      } else out.captura.push({ tema: claro ? 'claro' : 'oscuro', donde: 'cuadro', err: rc });
      await clicEn(btn.sel);
      const rv = await ev(`window.__P.rectPagina('#diast-algo-cuerpo .da-excl')`);
      if (rv && !rv.err) {
        const png = await cdp.send('Page.captureScreenshot', { format: 'png', clip: rv }, sessionId);
        const f = join(dest, 'excl_ventana_' + (claro ? 'claro' : 'oscuro') + '.png');
        await writeFile(f, Buffer.from(png.data, 'base64'));
        out.captura.push({ tema: claro ? 'claro' : 'oscuro', donde: 'ventana', archivo: f, rect: rv });
      } else out.captura.push({ tema: claro ? 'claro' : 'oscuro', donde: 'ventana', err: rv });
      if (!btnX.err) await clicEn(btnX.sel);
    }
    await ev(`window.__P.tema(false)`);
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  out.md5Igual = out.md5Ini === out.md5Fin;
  cdp.close();
  await new Promise((r) => srv.close(r));
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
