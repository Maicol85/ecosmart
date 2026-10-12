#!/usr/bin/env node
/**
 * _probe_vdhvd.mjs — sonda A/B de SOLO LECTURA para la PARED DEL VD y el INDICE DE TEI (DTI):
 * los dos campos nuevos, su marca «(revisar)», las dos filas nuevas de las referencias del VD,
 * el Tei en el conteo de disfuncion sistolica, la hipertrofia en el informe y el EN SUMA.
 *
 * Infraestructura calcada de scripts/_probe_strainai.mjs (teclas y clics reales, cierre del
 * arbol de Chrome por GRUPO y por PID PROPIO, cierre del aviso legal con su denominador, md5 al
 * principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_vdhvd.mjs --file /tmp/index.HEAD.html > /tmp/vd.HEAD.json
 *   node scripts/_probe_vdhvd.mjs                             > /tmp/vd.NEW.json
 *
 * Grupos (--solo vacio|marca|refs|bordes|conteo|suma|aviso|ancho|guardado):
 *   vacio    — CONTROL NEGATIVO MAYOR: con los dos campos nuevos VACIOS, las seis superficies
 *              (informe en 3 estilos, EN SUMA en 3, Excel con su cuenta de columnas, franja del
 *              PPT, el token del Laboratorio y el hash de los campos preexistentes).
 *   marca    — la marca «(revisar)» de los dos campos, dentro y fuera de banda, con el 55 del
 *              Tei tipeado como porcentaje, y que NO cambia ningun veredicto.
 *   refs     — las dos filas nuevas del cuadro de referencias: sus estados y el vaciado a «—».
 *   bordes   — tripletes por corte: apenas abajo, JUSTO en el corte, apenas arriba.
 *   conteo   — la tabla de TAPSE x S-prima x FAC x Tei con su veredicto.
 *   suma     — las combinaciones de dilatacion x hipertrofia x sistolica x diastolica.
 *   aviso    — el aviso ambar del Tei (IT severa y FA) y que no mueve ningun veredicto.
 *   ancho    — la maqueta de los dos campos a 1200, 390 y 360 px, en los dos temas.
 *   guardado — guardar, reabrir, «Nuevo estudio» y un registro SIN las claves nuevas.
 *
 * ⚠️ DENOMINADOR. Una fila contada sobre un bloque que no abrio da cero y parece acuerdo
 * perfecto. Cada escena informa que tipeo, que quedo en el campo y cuantas filas vio el cuadro.
 *
 * ⚠️ LOS GRUPOS SE CORREN DE A UNO. Varios en una sola sesion de pagina se cuelgan sobre el
 * arbol de HEAD (medido en las tres tandas anteriores).
 *
 * ⚠️ SI UN CAMPO NO EXISTE, `tipear` ABORTA. Contra HEAD los dos campos de esta tanda no estan;
 * sin esa guarda el foco queda en el campo anterior y los caracteres se le concatenan — que es
 * como la tanda del strain fabrico un paciente con el E/e-prima en 1848,5.
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
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios, y la
   barra-ese del regex va DOBLE —dentro de un template literal se cocina a la letra ese y el
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

  /* ⚠️ DENOMINADOR DE ENTRADA. Los dos campos nuevos y sus vecinos viven en la pestaña VD/AD,
     dentro de un acordeon que nace PLEGADO: lo que esta en display:none no tiene geometria, asi
     que sin esto la sonda tipea en la nada y TODAS las escenas salen «sin cambios» — que es
     indistinguible de «el cableado no funciona». Se confirma ANTES de medir. */
  abrirTodo() {
    var o = {};
    try { showTab('vd') } catch(e) { o.showTab = 'EXC ' + e.message }
    ['sacc-vd','sacc-ad'].forEach(function(sid){
      try { var s = document.getElementById(sid);
        if (s) { var b = s.querySelector('.sacc-hdr'), cu = s.querySelector('.sacc-body');
          if (cu && getComputedStyle(cu).display === 'none' && b) b.click() } } catch(e) {} });
    o.tapse = window.__P.vis('tapse');
    o.vd_bas = window.__P.vis('vd_bas');
    o.fevd = window.__P.vis('fevd');
    o.vd_pared = window.__P.vis('vd_pared');
    o.vd_tei = window.__P.vis('vd_tei');
    o.cuadro = window.__P.vis('vd-tam');
    o.cortes = (typeof window.VD_PARED_HVD_MIN !== 'undefined')
      ? { pared: window.VD_PARED_HVD_MIN, tei: window.VD_TEI_DTI_ALT_MIN, teiPw: window.VD_TEI_PW_ALT_MIN }
      : 'SIN CONSTANTES';
    o.banda = (typeof window.VD_NUEVOS_BANDA !== 'undefined') ? window.VD_NUEVOS_BANDA : 'SIN BANDA';
    o.marcaSync = (typeof window.vdMarcaSync === 'function');
    /* El denominador de verdad: los TRES vecinos existen y estan a la vista. Los dos nuevos se
       informan por separado, porque contra HEAD valen null a proposito. */
    o.ok = (o.tapse === true && o.vd_bas === true && o.fevd === true && o.cuadro === true);
    return o },

  limpiar() { try { limpiarCampos(true) } catch(e) {} return 1 },

  /* NO ES UN GESTO MEDIDO: solo para los <select> de escenario (grado de IT, ritmo). */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* Los dos campos nuevos con su marca al lado, y los cuatro vecinos que votan. */
  campitos() {
    var o = {};
    ['vd_pared','vd_tei'].forEach(function(id){
      o[id] = { v: window.__P.val(id), marca: window.__P.txt(id + '-marca'),
                existe: window.__P.existe(id) } });
    ['tapse','s_prime','vd_fac','vd_bas'].forEach(function(id){
      o[id] = { v: window.__P.val(id) } });
    return o },

  /* EL CUADRO DE REFERENCIAS DEL VD, fila por fila y con su CUENTA: una fila nueva que no se
     pinta y una que no existe se leen igual si no se informa el denominador. */
  refs() {
    var caja = document.getElementById('vd-tam');
    caja = caja ? caja.closest('.calc-box') : null;
    if (!caja) return { err: 'NO EXISTE el calc-box del VD' };
    var filas = Array.from(caja.querySelectorAll('.calc-row')).map(function(f){
      var lbl = f.querySelector('.calc-lbl');
      var val = Array.from(f.querySelectorAll('span[id]')).filter(function(s){
        return !s.classList.contains('calc-lbl') })[0];
      return { lbl: window.__P.norm(lbl ? lbl.textContent : ''),
               id: val ? val.id : null,
               txt: window.__P.norm(val ? val.textContent : '') } });
    return { n: filas.length, filas: filas,
             pared: window.__P.norm(window.__P.txt('vd-pared-interp')),
             tei: window.__P.norm(window.__P.txt('vd-tei-interp')),
             aviso: window.__P.norm(window.__P.txt('vd-tei-aviso')) } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* La LINEA del VD, aislada del resto del informe: comparar el informe entero mete el ruido de
     cualquier otra zona y deja de distinguir que cambio. */
  lineaVD(texto) {
    return String(texto || '').split('\\n').filter(function(l){
      return /[Vv]entr.culo derecho|^VD |\\bVD\\b|HVD/.test(l) }).map(window.__P.norm) },

  /* ⚠️ EL HASH DE CAMPOS EXCLUYE informe_texto, en_suma Y LOS DOS CAMPOS NUEVOS. Los dos
     primeros son <textarea> con id: cambian en toda escena cuya frase cambia y no dicen NADA
     sobre los campos del estudio (la tanda de la BSE informo 29 de 30 «diferencias» que eran
     eso). Los dos nuevos, porque si no el hash dice «distinto» en TODAS las escenas por el solo
     hecho de que existen: contra HEAD son dos claves que alla no estan. Lo que el control
     negativo pregunta es si los campos QUE YA ESTABAN cambiaron. El conteo va al lado. */
  campos() {
    var fuera = ['informe_texto','en_suma','vd_pared','vd_tei'];
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      if (fuera.indexOf(el.id) > -1) return;
      c[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },
  camposN() { return Object.keys(window.__P.campos()).length },

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

  /* El Excel de esta tanda NO gana columnas: la verificacion es que el numero NO se mueva y que
     ninguna clave nueva aparezca. De ahi que el hash sea uno solo y sin descuentos. */
  excelCols() {
    var r = window.__P.excel();
    if (typeof r === 'string') return r;
    var ks = Object.keys(r);
    return { n: ks.length,
             tienePared: ks.some(function(k){ return /[Pp]ared del VD/.test(k) }),
             tieneTei: ks.some(function(k){ return /Tei/.test(k) }),
             hash: window.__P.hash(JSON.stringify(r)) } },

  labGrado(inf, suma) {
    if (typeof _labDiastGrado !== 'function') return 'SIN _labDiastGrado';
    try { return _labDiastGrado({ campos: { en_suma: suma, informe_texto: inf } }) }
    catch(e) { return 'EXC: ' + e.message } },

  /* ⚠️ EL LABORATORIO CLASIFICA EL TEXTO LIBRE, y es lo que la orden pide reportar. Se le
     pregunta a sus PROPIAS funciones, no a una copia del regex. */
  labHallazgos(inf, suma) {
    if (typeof window._labMenciona !== 'function') return 'SIN _labMenciona';
    var t = String(suma || '') + ' ' + String(inf || '');
    var o = {};
    o.HVI = window._labMenciona(t, /hipertrofia\\s+ventricular\\s+izq|HVI/i);
    o.sistVI = window._labMenciona(t, /disfunci[oó]n\\s+sist[oó]lica|FEVI\\s+[<>]?\\s*[0-4]\\d/i);
    o.diast = window._labMenciona(t, /disfunci[oó]n\\s+diast[oó]lica/i);
    o.geom = (typeof window._labGeomCat === 'function')
      ? window._labGeomCat({ campos: { informe_texto: inf, en_suma: suma } }) : 'SIN _labGeomCat';
    return o },

  pptVD() {
    try { return (typeof _pptSpan === 'function') ? _pptSpan('vd-tam') : window.__P.txt('vd-tam') }
    catch(e) { return 'EXC: ' + e.message } },

  /* La maqueta de un campo: ancho, alto y si desborda su grilla. */
  caja(id) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    var p = e.parentElement ? e.parentElement.getBoundingClientRect() : null;
    return { w: Math.round(r.width), h: Math.round(r.height),
             x: Math.round(r.left), y: Math.round(r.top),
             desborda: !!(p && (r.right > p.right + 1 || r.left < p.left - 1)),
             docW: document.documentElement.scrollWidth,
             scrollH: document.documentElement.scrollWidth > window.innerWidth + 1 } },

  /* El tema de esta app es la clase light-mode en el <html>, no un atributo data-theme. */
  tema(t) { try { document.documentElement.classList.toggle('light-mode', t === 'claro') } catch(e) {}
    return document.documentElement.classList.contains('light-mode') ? 'claro' : 'oscuro' }
};
1
`;

/* ══ ESCENAS ═════════════════════════════════════════════════════════════════════════════════
   Cada escena es un PACIENTE, no un tecleo. Los numericos se tipean con TECLAS REALES; los
   <select> de escenario (grado de IT, ritmo, sexo) van por `set`, que NO es un gesto medido.

   ⚠️ EL ORDEN DE TIPEO NO ES COSMETICO EN ESTA ZONA TAMPOCO. `calcVD` esta cableado a TAPSE,
   S-prima, los tres diametros, las dos areas y el TAP, y los dos campos nuevos entran por
   puertas que lo llaman: igual se tipean al final, que es el gesto natural y deja el cuadro al
   dia sin forzar ninguna llamada. El Doppler tricuspideo va antes porque su cablea es otro. */
const ORDEN = ['peso','talla','edad','fevi','vd_bas','vd_mid','vd_long','vd_area_d','vd_area_s',
               'tvia','fevd','vd_vi','dt_onda_e','dt_onda_a','dt_eprime_lat','vmax_it',
               'tapse','s_prime','vd_pared','vd_tei'];
function enOrden(mapa) {
  const ks = Object.keys(mapa);
  return ORDEN.filter((k) => ks.indexOf(k) > -1).concat(ks.filter((k) => ORDEN.indexOf(k) < 0));
}

/* ── CONTROL NEGATIVO MAYOR: los dos campos nuevos VACIOS. Son pacientes del VD que cubren las
   ramas del informe y del EN SUMA que esta tanda toca, mas el formulario vacio. ── */
const VACIO = [
  { id: 'V00-vacio',      que: 'formulario vacio', c: {} },
  { id: 'V01-normal',     que: 'VD normal: basal 35, TAPSE 22', c: { vd_bas: '35', tapse: '22' } },
  { id: 'V02-dil-leve',   que: 'VD levemente dilatado (basal 45) con funcion conservada', c: { vd_bas: '45', tapse: '18' } },
  { id: 'V03-dil',        que: 'VD dilatado (basal 48) con disfuncion por TAPSE', c: { vd_bas: '48', tapse: '14' } },
  { id: 'V04-disf-sola',  que: 'disfuncion sistolica sin diametro (TAPSE 14)', c: { tapse: '14' } },
  { id: 'V05-disf-sp',    que: "disfuncion por S-prima 9.4 con basal normal", c: { vd_bas: '35', s_prime: '9.4' } },
  { id: 'V06-disf-fac',   que: 'disfuncion por FAC 24 (severa) con basal normal', c: { vd_bas: '35', vd_area_d: '20', vd_area_s: '15.2' } },
  { id: 'V07-solo-basal', que: 'solo el basal, sin funcion (compuerta de TC-03)', c: { vd_bas: '48' } },
  { id: 'V08-diast',      que: 'patron restrictivo del VD con VD normal',
    c: { vd_bas: '35', dt_onda_e: '90', dt_onda_a: '30', dt_eprime_lat: '10' } },
  { id: 'V09-dil-diast',  que: 'VD dilatado con disfuncion sistolica y patron restrictivo',
    c: { vd_bas: '48', tapse: '14', dt_onda_e: '90', dt_onda_a: '30', dt_eprime_lat: '10' } },
  { id: 'V10-fuera',      que: 'longitudinal fuera de rango plausible (9.5 mm)', c: { vd_long: '9.5' } }
];

/* ── Pacientes de la ZONA NUEVA. `P` es la pared y `T` el Tei. ── */
const BASE_VD = { vd_bas: '35' };            // basal NORMAL: aisla la hipertrofia de la dilatacion
const DIL_VD  = { vd_bas: '48' };            // basal DILATADO (>45, no la banda leve)
const DIAST   = { dt_onda_e: '90', dt_onda_a: '30', dt_eprime_lat: '10' };  // E/A 3.0 -> restrictivo

async function main() {
  const md5Ini = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  const OUT = { file: FARG, solo: SOLO || '(todos)', md5Ini };
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
  /* TECLAS REALES, una por caracter, con el `text` SOLO en el `char`. Tipea DESDE VACIO. */
  async function tipear(id, valor) {
    /* ⚠️ SI EL CAMPO NO EXISTE NO SE TIPEA, Y ESTO LO DESTAPO LA PRIMERA CORRIDA A/B. Contra el
       arbol de HEAD los campos de esta tanda no existen: `clicEn` devolvia 'NO SE PUDO', el foco
       quedaba en el campo ANTERIOR y los caracteres se le concatenaban. Medido: tipear '15' en
       `lars_dop` sobre HEAD dejo el E/e' en 1848,5 en vez de 18,5 —un paciente inventado que la
       sonda informaba como una diferencia del commit—. Una tecla sin blanco no es una medicion. */
    const hay = await ev(`window.__P.existe(${JSON.stringify(id)})`);
    if (!hay) return { via: 'NO EXISTE EL CAMPO', pedido: String(valor), quedo: null, ok: null, noExiste: true };
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
  /* BORRAR CON TECLAS REALES. Select-all por DOM y Backspace: es el gesto del medico y el unico
     que dispara el `oninput` del campo. ⚠️ NUNCA sobre un campo de solo lectura. */
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

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y VUELVE A MITAD DE CORRIDA. Con `#modalAvisoEco`
     puesto, elementFromPoint devuelve ESE nodo y todos los clics caen en el overlay: cada escena
     informaria «sin cambios» sobre un tecleo que nunca ocurrio. Se cierra por su propio boton y
     se COMPRUEBA antes de medir. */
  const cerrarAviso = async () => {
    const b = await ev(`(function(){
      var m = document.getElementById('modalAvisoEco');
      if (!m) return 'NO EXISTE';
      if (getComputedStyle(m).display === 'none') return 'CERRADO';
      var x = m.querySelector('button'); if (x) { if (!x.id) x.id='__avisoBtn'; return x.id }
      return 'SIN BOTON' })()`);
    if (b && b.indexOf('NO ') !== 0 && b !== 'SIN BOTON' && b !== 'CERRADO') await clicEn(b);
    return ev(`(function(){ var o={};
      ['modalAvisoEco','login-overlay'].forEach(function(id){
        var m=document.getElementById(id); o[id]= m ? getComputedStyle(m).display : 'NO EXISTE' });
      return o })()`);
  };
  const avisoEstado = await cerrarAviso();

  OUT.avisoLegal = avisoEstado;
  OUT.denominador = await ev(`window.__P.abrirTodo()`);

  async function cargar(c, sel) {
    await ev(`window.__P.limpiar()`);
    await pausa(120);
    /* ⚠️ LOS <select> VAN PRIMERO. Medido en las tandas anteriores: un select que dispara un
       recalculo DESPUES del tecleo deja el cuadro informando el paciente anterior. */
    const sels = {};
    for (const id of Object.keys(sel || {})) sels[id] = await ev(`window.__P.set(${JSON.stringify(id)}, ${JSON.stringify(sel[id])})`);
    const tecleos = {};
    for (const id of enOrden(c)) tecleos[id] = await tipear(id, c[id]);
    await pausa(120);
    return { tecleos, sels,
             todosOk: Object.keys(tecleos).every((k) => tecleos[k].ok),
             noExisten: Object.keys(tecleos).filter((k) => tecleos[k].noExiste) };
  }

  /* Las SEIS superficies de una escena, enumeradas UNA POR UNA. Nunca «el informe y el Excel»
     en bloque: cada una tiene su propio emisor y se rompen por separado. */
  async function superficies() {
    const o = { estilos: {} };
    for (const e of ['conciso', 'estandar', 'narrativo']) {
      const r = await ev(`window.__P.informe(${JSON.stringify(e)})`);
      o.estilos[e] = { vd: await ev(`window.__P.lineaVD(${JSON.stringify(r.inf)})`),
                       sumaVD: await ev(`window.__P.lineaVD(${JSON.stringify(r.suma)})`),
                       hashInf: await ev(`window.__P.hash(${JSON.stringify(r.inf)})`),
                       hashSuma: await ev(`window.__P.hash(${JSON.stringify(r.suma)})`) };
      if (e === 'estandar') {
        o.lab = await ev(`window.__P.labGrado(${JSON.stringify(r.inf)}, ${JSON.stringify(r.suma)})`);
        o.labH = await ev(`window.__P.labHallazgos(${JSON.stringify(r.inf)}, ${JSON.stringify(r.suma)})`);
      }
    }
    o.excel = await ev(`window.__P.excelCols()`);
    o.ppt = await ev(`window.__P.pptVD()`);
    o.camposHash = await ev(`window.__P.hash(JSON.stringify(window.__P.campos()))`);
    o.camposN = await ev(`window.__P.camposN()`);
    o.refs = await ev(`window.__P.refs()`);
    o.campitos = await ev(`window.__P.campitos()`);
    return o;
  }

  // ══ GRUPO vacio ══ CONTROL NEGATIVO MAYOR
  if (hacer('vacio')) {
    const r = {};
    for (const e of VACIO) {
      const carga = await cargar(e.c, e.sel);
      r[e.id] = { que: e.que, carga, sup: await superficies() };
    }
    OUT.vacio = r;
  }

  // ══ GRUPO marca ══
  if (hacer('marca')) {
    const r = { banda: await ev(`(typeof VD_NUEVOS_BANDA !== 'undefined') ? VD_NUEVOS_BANDA : 'SIN BANDA'`) };
    /* ⚠️ EL VALOR SE LEE ADENTRO DE CADA ESCENA, no al final: cada una arranca limpiando el
       formulario, asi que preguntar despues de la ultima lee un formulario vacio y la condicion
       de «no se corrige» saldria verde sobre un campo que nadie cargo. */
    const mk = async (id, val) => {
      const carga = await cargar(Object.assign({}, BASE_VD, { tapse: '22', [id]: val }));
      const c = await ev(`window.__P.campitos()`);
      const inf = await ev(`window.__P.informe('estandar')`);
      return { pedido: val, carga: carga.tecleos[id], quedo: c[id] ? c[id].v : null,
               marca: c[id] ? c[id].marca : null,
               refs: await ev(`window.__P.refs()`),
               vd: await ev(`window.__P.lineaVD(${JSON.stringify(inf.inf)})`) };
    };
    r.paredDentro = await mk('vd_pared', '7');
    r.paredEnCm   = await mk('vd_pared', '0.7');     // tipeada en CENTIMETROS: marcada
    r.paredAlta   = await mk('vd_pared', '45');
    r.teiDentro   = await mk('vd_tei', '0.6');
    r.teiPorciento = await mk('vd_tei', '55');       // tipeado como PORCENTAJE: marcado
    r.teiNeg      = await mk('vd_tei', '-0.6');
    OUT.marca = r;
  }

  // ══ GRUPO refs ══ las dos filas nuevas y su vaciado
  if (hacer('refs')) {
    const r = {};
    r.vacio = (await cargar({})) && await ev(`window.__P.refs()`);
    r.paredNormal = (await cargar(Object.assign({}, BASE_VD, { vd_pared: '4' }))) && await ev(`window.__P.refs()`);
    r.paredHvd    = (await cargar(Object.assign({}, BASE_VD, { vd_pared: '7' }))) && await ev(`window.__P.refs()`);
    r.teiNormal   = (await cargar(Object.assign({}, BASE_VD, { vd_tei: '0.45' }))) && await ev(`window.__P.refs()`);
    r.teiAlt      = (await cargar(Object.assign({}, BASE_VD, { vd_tei: '0.62' }))) && await ev(`window.__P.refs()`);
    /* El VACIADO con teclas reales: se carga, se comprueba que la fila pinto, se BORRA y se
       vuelve a leer. Sin el paso del medio, un «—» se lee igual que una fila que nunca pinto. */
    await cargar(Object.assign({}, BASE_VD, { vd_pared: '7', vd_tei: '0.62' }));
    r.antesDeBorrar = await ev(`window.__P.refs()`);
    await borrar('vd_pared'); await borrar('vd_tei');
    await pausa(150);
    r.trasBorrar = await ev(`window.__P.refs()`);
    OUT.refs = r;
  }

  // ══ GRUPO bordes ══ tripletes por corte
  if (hacer('bordes')) {
    const trip = async (id, vals, extra) => {
      const o = [];
      for (const vv of vals) {
        await cargar(Object.assign({}, BASE_VD, extra || {}, { [id]: String(vv) }));
        const inf = await ev(`window.__P.informe('estandar')`);
        o.push({ val: vv, quedo: (await ev(`window.__P.val(${JSON.stringify(id)})`)),
                 refs: await ev(`window.__P.refs()`),
                 vd: await ev(`window.__P.lineaVD(${JSON.stringify(inf.inf)})`),
                 suma: await ev(`window.__P.lineaVD(${JSON.stringify(inf.suma)})`) });
      }
      return o;
    };
    OUT.bordes = {
      /* PARED: 4,9 / 5,0 / 5,1. El corte es `>= 5`, asi que el 5,0 EXACTO ya es hipertrofia —
         que es justamente lo que el recuerdo de «> 5 mm» deja del lado normal. */
      pared: await trip('vd_pared', ['4.9', '5', '5.1'], { tapse: '22' }),
      /* TEI: 0,54 / 0,55 / 0,56, con TAPSE normal para que el Tei sea el UNICO que pueda votar. */
      tei:   await trip('vd_tei', ['0.54', '0.55', '0.56'], { tapse: '22' })
    };
  }

  // ══ GRUPO conteo ══ la tabla de TAPSE x S-prima x FAC x Tei
  if (hacer('conteo')) {
    const r = [];
    /* Las 8 combinaciones de los tres de siempre x con/sin Tei alterado, mas el Tei NORMAL que
       es el control negativo: cargarlo por debajo del corte no puede mover nada. */
    const comb = [
      { k: 'ninguno',          c: { tapse: '22', s_prime: '12', vd_area_d: '20', vd_area_s: '12' } },
      { k: 'tapse',            c: { tapse: '14', s_prime: '12', vd_area_d: '20', vd_area_s: '12' } },
      { k: 'sprima',           c: { tapse: '22', s_prime: '9',  vd_area_d: '20', vd_area_s: '12' } },
      { k: 'fac',              c: { tapse: '22', s_prime: '12', vd_area_d: '20', vd_area_s: '14' } },
      { k: 'tapse+sprima',     c: { tapse: '14', s_prime: '9',  vd_area_d: '20', vd_area_s: '12' } },
      { k: 'los-tres',         c: { tapse: '14', s_prime: '9',  vd_area_d: '20', vd_area_s: '14' } },
      { k: 'sin-ninguno-medido', c: {} }
    ];
    for (const cb of comb) {
      for (const tei of [null, '0.45', '0.62']) {
        const c = Object.assign({}, BASE_VD, cb.c);
        if (tei) c.vd_tei = tei;
        await cargar(c);
        const inf = await ev(`window.__P.informe('estandar')`);
        r.push({ comb: cb.k, tei: tei || '(sin Tei)',
                 campitos: await ev(`window.__P.campitos()`),
                 refs: (await ev(`window.__P.refs()`)).tei,
                 vd: await ev(`window.__P.lineaVD(${JSON.stringify(inf.inf)})`),
                 suma: await ev(`window.__P.lineaVD(${JSON.stringify(inf.suma)})`) });
      }
    }
    OUT.conteo = r;
  }

  // ══ GRUPO suma ══ dilatacion x hipertrofia x sistolica x diastolica
  if (hacer('suma')) {
    const r = [];
    const DILS = [{ k: 'sin-dil', c: BASE_VD }, { k: 'dilatado', c: DIL_VD }];
    const HIPS = [{ k: 'sin-hvd', c: {} }, { k: 'hvd', c: { vd_pared: '7' } }];
    const SIS  = [{ k: 'sin-func', c: {} },
                  { k: 'func-conservada', c: { tapse: '22' } },
                  { k: 'disf-sistolica', c: { tapse: '14' } }];
    const DIA  = [{ k: 'sin-diast', c: {} }, { k: 'restrictivo', c: DIAST }];
    for (const d of DILS) for (const h of HIPS) for (const s of SIS) for (const dd of DIA) {
      await cargar(Object.assign({}, d.c, h.c, s.c, dd.c));
      const o = { caso: [d.k, h.k, s.k, dd.k].join(' · ') };
      for (const e of ['conciso', 'estandar', 'narrativo']) {
        const inf = await ev(`window.__P.informe(${JSON.stringify(e)})`);
        o[e] = await ev(`window.__P.lineaVD(${JSON.stringify(inf.inf)})`);
        if (e === 'estandar') {
          o.suma = await ev(`window.__P.lineaVD(${JSON.stringify(inf.suma)})`);
          o.lab = await ev(`window.__P.labHallazgos(${JSON.stringify(inf.inf)}, ${JSON.stringify(inf.suma)})`);
          o.excelN = (await ev(`window.__P.excelCols()`)).n;
        }
      }
      r.push(o);
    }
    /* ⚠️ LA PARED COMO ÚNICO DATO DEL VD: es la rama `!hayPrevia` de la cláusula y la quinta
       condición del `if` que envuelve el bloque. Sin las dos, la hipertrofia desaparecía del
       informe firmado —la Recomendación 3 del folio 144 pide informarla si es anormal— o salía
       diciendo dos veces «ventrículo derecho» en cinco palabras. */
    const soloPared = [];
    for (const vv of [{ k: 'solo pared HIPERTROFICA', c: { vd_pared: '7' } },
                      { k: 'CONTROL NEGATIVO: solo pared NORMAL', c: { vd_pared: '4' } }]) {
      await cargar(vv.c);
      const o3 = { caso: vv.k };
      for (const e of ['conciso', 'estandar', 'narrativo']) {
        const inf = await ev(`window.__P.informe(${JSON.stringify(e)})`);
        o3[e] = await ev(`window.__P.lineaVD(${JSON.stringify(inf.inf)})`);
        if (e === 'estandar') o3.suma = await ev(`window.__P.lineaVD(${JSON.stringify(inf.suma)})`);
      }
      soloPared.push(o3);
    }
    OUT.soloPared = soloPared;
    /* ⚠️ LA DIASTOLICA SIN GRADO: con el E/A en la banda externa y SIN e-prima, la app dice
       «patron sugestivo de disfuncion diastolica» y no gradua. Es el caso donde el texto pedido
       («con disfuncion diastolica») afirmaria MAS de lo que la app estableció, asi que se usa el
       de la app. Se mide porque la tabla de arriba solo tiene el caso CON grado. */
    const sinGrado = [];
    const SG = { dt_onda_e: '40', dt_onda_a: '60' };   // E/A 0.67 < 0.8 y sin e-prima: sin grado
    for (const vv of [
      { k: 'hvd + diastolica SIN grado', c: Object.assign({}, BASE_VD, { vd_pared: '7' }, SG) },
      { k: 'hvd + sistolica + diastolica SIN grado', c: Object.assign({}, BASE_VD, { vd_pared: '7', tapse: '14' }, SG) },
      { k: 'dilatado + hvd + sistolica + diastolica SIN grado', c: Object.assign({}, DIL_VD, { vd_pared: '7', tapse: '14' }, SG) },
      { k: 'CONTROL NEGATIVO: lo mismo SIN hipertrofia', c: Object.assign({}, DIL_VD, { tapse: '14' }, SG) }]) {
      await cargar(vv.c);
      const inf = await ev(`window.__P.informe('estandar')`);
      sinGrado.push({ caso: vv.k,
                      vd: await ev(`window.__P.lineaVD(${JSON.stringify(inf.inf)})`),
                      suma: await ev(`window.__P.lineaVD(${JSON.stringify(inf.suma)})`),
                      lab: await ev(`window.__P.labHallazgos(${JSON.stringify(inf.inf)}, ${JSON.stringify(inf.suma)})`) });
    }
    OUT.sinGrado = sinGrado;
    OUT.suma = r;
  }

  // ══ GRUPO aviso ══ el aviso ambar del Tei
  if (hacer('aviso')) {
    const r = {};
    const esc = async (que, c, sel) => {
      await cargar(c, sel);
      const inf = await ev(`window.__P.informe('estandar')`);
      return { que, refs: await ev(`window.__P.refs()`),
               vd: await ev(`window.__P.lineaVD(${JSON.stringify(inf.inf)})`),
               suma: await ev(`window.__P.lineaVD(${JSON.stringify(inf.suma)})`) };
    };
    const TEI = Object.assign({}, BASE_VD, { tapse: '22', vd_tei: '0.62' });
    r.limpio   = await esc('Tei alterado, sin IT severa ni FA', TEI);
    r.itSevera = await esc('Tei alterado con IT severa', TEI, { it_grado: '4' });
    r.itModer  = await esc('CONTROL NEGATIVO: IT moderada (la guia dice SEVERA)', TEI, { it_grado: '2' });
    r.fa       = await esc('Tei alterado en FA', TEI, { diast_ritmo: 'fa' });
    r.lasDos   = await esc('Tei alterado con IT severa Y en FA', TEI, { it_grado: '4', diast_ritmo: 'fa' });
    r.sinTei   = await esc('CONTROL NEGATIVO: IT severa y FA SIN Tei cargado',
                           Object.assign({}, BASE_VD, { tapse: '22' }), { it_grado: '4', diast_ritmo: 'fa' });
    r.teiNormalConIt = await esc('CONTROL NEGATIVO: Tei NORMAL con IT severa',
                           Object.assign({}, BASE_VD, { tapse: '22', vd_tei: '0.45' }), { it_grado: '4' });
    OUT.aviso = r;
  }

  // ══ GRUPO ancho ══ maqueta
  if (hacer('ancho')) {
    const r = [];
    for (const w of [1200, 390, 360]) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 }, sessionId);
      await pausa(260);
      for (const t of ['oscuro', 'claro']) {
        await ev(`window.__P.tema(${JSON.stringify(t)})`);
        await ev(`window.__P.abrirTodo()`);
        await cargar(Object.assign({}, BASE_VD, { vd_pared: '7', vd_tei: '0.62' }));
        /* ⚠️ LA GEOMETRIA SE VERIFICA JUSTO ANTES DE MEDIR, no al abrir: el CSS del celular
           cierra cajones con `!important` y un ancho 0 se lee como «ninguno desborda». */
        r.push({ w, tema: await ev(`window.__P.tema(${JSON.stringify(t)})`),
                 vis: { pared: await ev(`window.__P.vis('vd_pared')`),
                        tei: await ev(`window.__P.vis('vd_tei')`),
                        fevd: await ev(`window.__P.vis('fevd')`) },
                 cajas: { pared: await ev(`window.__P.caja('vd_pared')`),
                          tei: await ev(`window.__P.caja('vd_tei')`),
                          fevd: await ev(`window.__P.caja('fevd')`),
                          vd_vi: await ev(`window.__P.caja('vd_vi')`),
                          tsvd: await ev(`window.__P.caja('tsvd_diametro')`) } });
      }
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    await ev(`window.__P.tema('oscuro')`);
    OUT.ancho = r;
  }

  // ══ GRUPO guardado ══
  if (hacer('guardado')) {
    await evCrudo(`window.__confirmReal = window.confirm; window.__alertReal = window.alert;
                   window.confirm = function(){ return true }; window.alert = function(){}; 1`);
    const r = {};
    await cargar(Object.assign({}, BASE_VD, { tapse: '22', vd_pared: '7', vd_tei: '0.62' }));
    await tipear('nombre', 'PACIENTE VD HVD');
    r.antes = await ev(`window.__P.campitos()`);
    /* ⚠️ EL GUARDADO ES ASINCRONO Y TIENE DOS COMPUERTAS, y la sonda del strain documenta que
       ignorarlas cuelga la corrida diez minutos: `guardarInforme` exige nombre o documento, y la
       PRIMERA vez saca la card de severidades valvulares y devuelve false —el guardado real
       cuelga del clic en `#rev-confirm`—. Se replica lo que hace el harness de la suite, con
       `confirm` neutralizado: un dialogo nativo abierto deja a CDP esperando para siempre. */
    const g = await ev(`(function(){
      window._ettEditandoId = null;
      var antes = new Set(getInformes().map(function(i){ return i.estudioId }));
      return new Promise(function(resolve){
        var fin = function(ok){
          var nuevo = getInformes().find(function(i){ return !antes.has(i.estudioId) });
          resolve({ ok: ok === true, estudioId: nuevo ? nuevo.estudioId : null }) };
        try { guardarInforme(fin) } catch(e) { resolve({ ok:false, error:String(e) }); return }
        var cf = document.getElementById('rev-confirm'); if (cf) cf.click();
      }) })()`, 25000);
    r.guardo = g;
    const gid = g && g.estudioId;
    /* ⚠️ DENOMINADOR: sin id guardado todo lo de abajo mide el formulario en pantalla y no un
       estudio reabierto —y saldria «todo bien»—. Se declara. */
    r.hayId = !!gid;
    r.estudioId = gid;
    /* Las dos claves leidas del REGISTRO EN DISCO, con el centinela `<<AUSENTE>>`: es la unica
       forma de distinguir «se guardo vacio» de «no se guardo». */
    r.enDisco = gid ? await ev(`(function(){ var i = getInformes().filter(function(x){
      return x.estudioId === ${JSON.stringify(gid)} })[0];
      if (!i) return 'NO ESTA';
      var c = i.campos || {}, o = {};
      ['vd_pared','vd_tei'].forEach(function(k){ o[k] = (k in c) ? c[k] : '<<AUSENTE>>' });
      return o })()`, 20000) : 'SIN ID';
    /* «Nuevo estudio»: los dos campos y sus DOS marcas tienen que irse. */
    await ev(`window.__P.limpiar()`); await pausa(250);
    r.trasNuevoEstudio = await ev(`window.__P.campitos()`);
    r.refsTrasNuevo = await ev(`window.__P.refs()`);
    r.reabrio = gid ? await ev(`(function(){ try { cargarEstudioPorId(${JSON.stringify(gid)}); return 'ok' }
      catch(e) { return 'EXC ' + e.message } })()`) : 'SIN ID';
    await pausa(700);
    r.trasReabrir = await ev(`window.__P.campitos()`);
    r.refsTrasReabrir = await ev(`window.__P.refs()`);
    /* ⚠️ UN REGISTRO SIN LAS CLAVES NUEVAS: es el estudio anterior a esta tanda. Tiene que
       reabrir con los dos campos VACIOS y SIN migrarse. */
    r.quitoClaves = gid ? await ev(`(function(){ var ls = getInformes();
      var i = ls.filter(function(x){ return x.estudioId === ${JSON.stringify(gid)} })[0];
      if (!i) return 'NO ESTA';
      delete i.campos.vd_pared; delete i.campos.vd_tei;
      return CeiboStore.setLocal(ls).then(function(){ return 'ok' }) })()`, 20000) : 'SIN ID';
    await ev(`window.__P.limpiar()`); await pausa(250);
    r.reabrioViejo = gid ? await ev(`(function(){ try { cargarEstudioPorId(${JSON.stringify(gid)}); return 'ok' }
      catch(e) { return 'EXC ' + e.message } })()`) : 'SIN ID';
    await pausa(700);
    r.trasReabrirViejo = await ev(`window.__P.campitos()`);
    /* ⚠️ «Nuevo estudio» CON LAS DOS MARCAS PUESTAS: es la escena que justifica la linea nueva
       de `limpiarCampos`. Los dos `div` de marca no son `.calc-box .calc-row span[id]` ni
       terminan en `-aviso`, asi que ningun barrido generico los alcanza. */
    await cargar(Object.assign({}, BASE_VD, { vd_pared: '0.7', vd_tei: '55' }));
    r.conMarca = await ev(`window.__P.campitos()`);
    r.marcaEstaba = !!(r.conMarca.vd_pared.marca && r.conMarca.vd_tei.marca);
    await ev(`window.__P.limpiar()`); await pausa(250);
    r.trasNuevoConMarca = await ev(`window.__P.campitos()`);
    r.marcaSeFue = !r.trasNuevoConMarca.vd_pared.marca && !r.trasNuevoConMarca.vd_tei.marca;
    if (gid) await ev(`(function(){ return CeiboStore.setLocal(getInformes().filter(function(i){
      return i.estudioId !== ${JSON.stringify(gid)} })).then(function(){ return 'borrado' }) })()`, 20000);
    await evCrudo(`if (window.__confirmReal) window.confirm = window.__confirmReal;
                   if (window.__alertReal) window.alert = window.__alertReal; 1`);
    OUT.guardado = r;
  }

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  OUT.md5Igual = OUT.md5Fin === md5Ini;
  console.log(JSON.stringify(OUT, null, 1));

  try { cdp.close() } catch (e) {}
  try { srv.close() } catch (e) {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO: ' + e.message + '\n' + (e.stack || '')); process.exit(1); });
