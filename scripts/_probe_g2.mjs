#!/usr/bin/env node
/**
 * _probe_g2.mjs — sonda A/B de SOLO LECTURA para la tanda «G2» (2026-10-15):
 *   (1) EXCEL: dos columnas nuevas —«TAPSE/PSAP (mm/mmHg)» y «Diametro arteria pulmonar (mm)»—,
 *       de 436 a 438; el IMPORTADOR compatible con un Excel viejo de 436; el alias de ENTRADA
 *       «PHT IAo (ms)» -> «THP IAo (ms)» y «TAVI RPV PHT (ms)» -> «TAVI RPV THP (ms)».
 *   (2) LABORATORIO, ASOCIACIONES: el TAPSE/PSAP contra FEVI, E/e, LAVI y grado de IT, con su n
 *       real, el aviso de sesgo de seleccion y el aviso de PAR ACOPLADO en la asociacion libre.
 *   (3) LABORATORIO, VALVULAS: la estenosis MITRAL y la TRICUSPIDEA con categorias BINARIAS en la
 *       tabla de las ocho filas y en el grafico apilado.
 *
 * ⚠️ EL LABORATORIO NO LEE EL FORMULARIO: lee `inf.campos` de un estudio archivado. Por eso casi
 * todas las escenas son REGISTROS de estudio; el grupo `teclas` comprueba de punta a punta que un
 * estudio cargado con TECLAS REALES produce las dos columnas nuevas.
 *
 * Infraestructura calcada de scripts/_probe_labem.mjs (teclas y clics reales, cierre del arbol de
 * Chrome por GRUPO y por PID PROPIO, reloj sobre ev(), aviso legal despejado con su denominador,
 * md5 al principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_g2.mjs --file /tmp/index.HEAD.html > /tmp/g2.HEAD.json
 *   node scripts/_probe_g2.mjs                             > /tmp/g2.NEW.json
 *
 * Grupos (--solo excel|import|alias|asoc|libre|valv|teclas|controles):
 *   excel     — las 438 columnas, el nombre y la POSICION de las dos nuevas, su valor con y sin
 *               dato, y el hash de las 436 anteriores.
 *   import    — un Excel VIEJO de 436 y uno NUEVO de 438, los dos por el importador de verdad.
 *   alias     — los dos encabezados «PHT» renombrados y aceptados por alias de entrada.
 *   asoc      — las cuatro asociaciones armadas del TAPSE/PSAP: n, prueba, estadistico y nota.
 *   libre     — el selector de la asociacion libre y el aviso de par acoplado.
 *   valv      — la tabla de las ocho filas y el apilado, con la EM y la ET binarias.
 *   teclas    — un estudio tipeado con teclas reales -> las dos columnas nuevas.
 *   controles — informe (tres estilos), EN SUMA, PDF, PPT, grados y pastillas de las ocho
 *               lesiones, protesis, VD, diastolica, HFA-PEFF y las otras seis lesiones del
 *               Laboratorio.
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en los comentarios de adentro.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-g2-'));
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
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  existe(id) { return !!document.getElementById(id) },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  geo(id) { var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), ok: r.width > 0 && r.height > 0 } },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  despejar() {
    var o = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (!m) { o[id] = 'NO EXISTE'; return; }
      o[id] = getComputedStyle(m).display;
      if (o[id] !== 'none') { m.style.display = 'none'; o[id] += ' -> none'; }
    });
    return o },

  /* ⚠️ EL LABORATORIO LEE REGISTROS, NO EL FORMULARIO. Un «estudio» de estas escenas es el mismo
     objeto que la app archiva. Se fabrica aca para poder fijar un borde exacto sin depender de
     las compuertas de pantalla. */
  reg(campos, nombre) {
    return { id: 'P' + (nombre || 'x'), nombre: 'P ' + (nombre || 'x'), ci: '1',
             fecha_estudio: '2026-10-15', campos: campos || {} } },

  /* ══ EXCEL ════════════════════════════════════════════════════════════════════════════════
     Se devuelve el numero de columnas, el valor de las dos nuevas y DOS hashes: el de la fila
     entera y el de la fila SIN las dos nuevas. Sin el segundo, el A/B dice «distinto» en TODAS
     las escenas por el solo hecho de que las columnas existen, y deja de poder distinguir «se
     agrego algo» de «cambio otra cosa» — la leccion de la tanda del strain de la AI. */
  excel(campos) {
    if (typeof _labExcelRow !== 'function') return 'SIN FN';
    var NUEVAS = ['TAPSE/PSAP (mm/mmHg)', 'Di\\u00e1metro arteria pulmonar (mm)'];
    try {
      var r = _labExcelRow(window.__P.reg(campos));
      var ks = Object.keys(r);
      var h = function(claves){ var k = claves.slice().sort(), s = '';
        for (var i=0;i<k.length;i++) s += k[i] + '=' + String(r[k[i]]) + '|';
        var x = 0; for (var j=0;j<s.length;j++) { x = ((x<<5)-x) + s.charCodeAt(j); x |= 0 }
        return String(x) };
      return { cols: ks.length,
               tpsp: r[NUEVAS[0]] === undefined ? 'AUSENTE' : r[NUEVAS[0]],
               apd:  r[NUEVAS[1]] === undefined ? 'AUSENTE' : r[NUEVAS[1]],
               psap: r['PSAP (mmHg)'], tapse: r['TAPSE (mm)'],
               hash: h(ks),
               hashSinNuevas: h(ks.filter(function(k){ return NUEVAS.indexOf(k) < 0 })) };
    } catch (e) { return 'EXC: ' + e.message } },

  /* La fila COMPLETA, clave por clave. El hash solo no alcanza para este commit: el renombre
     «PHT» -> «THP» cambia DOS claves, asi que el hash de «las 436 anteriores» difiere de forma
     legitima y deja de poder distinguir «se renombro algo» de «cambio un valor». La comparacion
     se hace afuera, mapeando los dos nombres viejos a los nuevos. */
  excelFila(campos) {
    if (typeof _labExcelRow !== 'function') return 'SIN FN';
    try { var r = _labExcelRow(window.__P.reg(campos)); var o = {};
      Object.keys(r).forEach(function(k){ o[k] = (r[k] === null || r[k] === undefined) ? null : String(r[k]) });
      return o } catch (e) { return 'EXC: ' + e.message } },

  /* El ORDEN REAL del export, que lo decide _labOrdenarCols y no el objeto literal. Se
     devuelve el indice de cada columna nueva y sus dos vecinas, mas el bloque que le asigna
     _labXlsBloqueDe — porque una columna que el mapa no conoce cae al bloque RESTO del final y
     eso se ve igual que «esta en su lugar» si solo se mira que exista. */
  ordenExcel(campos) {
    if (typeof _labExcelRow !== 'function' || typeof _labOrdenarCols !== 'function') return 'SIN FN';
    try {
      var r = _labExcelRow(window.__P.reg(campos));
      var ord = _labOrdenarCols(Object.keys(r));
      var dondeEsta = function(nom){
        var i = ord.indexOf(nom);
        return { i: i, antes: i > 0 ? ord[i-1] : null, despues: (i >= 0 && i < ord.length-1) ? ord[i+1] : null,
                 bloque: (typeof _labXlsBloqueDe === 'function') ? _labXlsBloqueDe(nom) : 'SIN FN' } };
      return { n: ord.length,
               tpsp: dondeEsta('TAPSE/PSAP (mm/mmHg)'),
               apd:  dondeEsta('Di\\u00e1metro arteria pulmonar (mm)'),
               phtIao: dondeEsta('PHT IAo (ms)'), thpIao: dondeEsta('THP IAo (ms)'),
               phtTavi: dondeEsta('TAVI RPV PHT (ms)'), thpTavi: dondeEsta('TAVI RPV THP (ms)'),
               resto: ord.filter(function(c){
                 return (typeof _labXlsBloqueDe === 'function') && _labXlsBloqueDe(c) === _LAB_XLS_BLOQUE_RESTO }) };
    } catch (e) { return 'EXC: ' + e.message } },

  /* El dueño del cociente, por sus DOS puertas: el DOM (sin src) y un registro (con src). Si la
     rama con src no existe todavia, lo dice en vez de reventar. */
  tpspDe(campos) {
    if (typeof vdTapsePsap !== 'function') return 'SIN FN';
    try { var x = vdTapsePsap(window.__P.reg(campos).campos);
      return x === null ? null : Math.round(x * 100000) / 100000 } catch (e) { return 'EXC: ' + e.message } },

  /* El predicado real del importador: ¿esta columna se reimporta? */
  mapaDe(nombre) {
    if (typeof LAB_XLS_MAP === 'undefined') return 'SIN MAP';
    var m = LAB_XLS_MAP.filter(function(x){ return x[0] === nombre })[0];
    if (!m) return { enMapa: false };
    return { enMapa: true, dest: m[1], tipo: m[2], alias: m[3] || null,
             calculada: (typeof _labXlsEsCalculado === 'function') ? _labXlsEsCalculado(m[1]) : 'SIN FN' } },

  /* Los asserts de arranque del Excel, que gritan en consola cuando una columna declarada cae en
     otro bloque o cuando una lista divergio. Se corren a proposito: un prefijo mal escrito no da
     error, da una columna fuera de lugar. */
  asserts() {
    var o = {};
    ['_labXlsAssertBloques','_labXlsAssertVocab','_labXlsAssertListas'].forEach(function(f){
      if (typeof window[f] !== 'function') { o[f] = 'SIN FN'; return }
      var errs = [];
      var ce = console.error; console.error = function(){ errs.push(Array.prototype.slice.call(arguments).join(' ')) };
      try { window[f]() } catch (e) { errs.push('EXC: ' + e.message) }
      console.error = ce;
      o[f] = errs.length ? errs : 'limpio';
    });
    return o },

  /* ══ IMPORTADOR ══════════════════════════════════════════════════════════════════════════
     Se arma un libro en memoria con los encabezados pedidos, se le mete una fila y se lo pasa a
     labImportarXLSX como un File de verdad. El resultado lo deja en _labImpDatos, que es lo
     que se lee. NO se ejecuta la importacion: solo la lectura y el conteo. */
  importar(headers, fila) {
    if (typeof XLSX === 'undefined') return Promise.resolve('SIN XLSX');
    if (typeof labImportarXLSX !== 'function') return Promise.resolve('SIN FN');
    var ws = XLSX.utils.aoa_to_sheet([headers, headers.map(function(h){
      return Object.prototype.hasOwnProperty.call(fila, h) ? fila[h] : '' })]);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estudios');
    var buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    var f = new File([buf], 'viejo.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    /* ⚠️ _labImpDatos ES UNA let DE MODULO Y NO UNA PROPIEDAD DE window, asi que
       window._labImpDatos da undefined SIEMPRE: la primera corrida informo «hay: false» en las
       cuatro escenas sobre un importador que funcionaba. Es la misma trampa que ECO_AYUDA. Lo
       que SI se puede leer es el MODAL que labImpRender pinta. */
    var modal = document.getElementById('lab-imp-modal');
    if (modal) modal.innerHTML = '';
    var errs = [];
    var ce = console.error; console.error = function(){ errs.push(Array.prototype.slice.call(arguments).join(' ')) };
    var toasts = []; var tOrig = window.toast;
    window.toast = function(m){ toasts.push(String(m)) };
    try { labImportarXLSX(f) } catch (e) { errs.push('EXC: ' + e.message) }
    return new Promise(function(res){
      var t0 = Date.now();
      var tic = setInterval(function(){
        var m = document.getElementById('lab-imp-modal');
        var lleno = !!(m && (m.textContent || '').trim().length > 20);
        if (lleno || Date.now() - t0 > 9000) {
          clearInterval(tic);
          console.error = ce; window.toast = tOrig;
          var txt = m ? (m.textContent || '').replace(/\\s+/g, ' ').trim() : null;
          res({ hay: lleno, txt: txt ? txt.slice(0, 900) : null,
                errs: errs.slice(0, 4), toasts: toasts.slice(0, 4),
                hayXLSX: (typeof XLSX !== 'undefined') });
        }
      }, 150);
    }) },

  /* ══ ASOCIACIONES ════════════════════════════════════════════════════════════════════════
     labAsocARender lee informes(), que es una CLAUSURA sobre labGetInformes: se sustituye
     esa funcion global, se pinta y se repone. Asi la escena fija su poblacion y el denominador
     no depende de que haya estudios archivados en este perfil de Chrome. */
  asocA(regs) {
    if (typeof labAsocARender !== 'function') return { err: 'SIN labAsocARender' };
    var pob = regs.map(function(c, i){ return window.__P.reg(c, String(i)) });
    var oG = window.labGetInformes, oI = window.getInformes;
    window.labGetInformes = function(){ return pob };
    window.getInformes = function(){ return pob };
    var err = null;
    try { labAsocARender() } catch (e) { err = 'EXC: ' + e.message }
    window.labGetInformes = oG; window.getInformes = oI;
    var host = document.getElementById('lab-asocA-tabla');
    var filas = host ? Array.from(host.querySelectorAll('tr.asocA-fila')).map(function(tr){
      return Array.from(tr.children).map(function(td){ return (td.textContent||'').replace(/\\s+/g,' ').trim() }) }) : [];
    return { err: err, nPob: pob.length, n: filas.length, filas: filas,
             nota: window.__P.txt('lab-asocA-nota') } },

  /* El DETALLE de una fila, que es donde viven la nota y el aviso de par acoplado. Se abre con un
     clic real sobre el tr y se lee la fila hermana que se inserta. */
  asocDetalle(regs, etiqueta) {
    var r = window.__P.asocA(regs);
    if (r.err) return r;
    var host = document.getElementById('lab-asocA-tabla');
    var trs = host ? Array.from(host.querySelectorAll('tr.asocA-fila')) : [];
    var tr = trs.filter(function(t){ return (t.textContent||'').indexOf(etiqueta) >= 0 })[0];
    if (!tr) return { err: 'NO HAY FILA ' + etiqueta, etiquetas: trs.map(function(t){
      return (t.children[0].textContent||'').replace(/\\s+/g,' ').trim() }) };
    tr.click();
    var det = tr.nextElementSibling;
    return { fila: Array.from(tr.children).map(function(td){ return (td.textContent||'').replace(/\\s+/g,' ').trim() }),
             abierto: tr.getAttribute('aria-expanded'),
             detalle: det && det.classList.contains('asocA-det')
               ? (det.textContent||'').replace(/\\s+/g,' ').trim() : 'NO ABRIO',
             acoplado: !!(det && (det.textContent||'').indexOf('construcci') >= 0) } },

  /* El selector de la asociacion LIBRE y su aviso de par acoplado. Se fija el par, se aprieta
     «Calcular» de verdad y se lee el resultado. */
  libre(regs, kx, ky) {
    if (typeof labAsocLibreCalcular !== 'function') return { err: 'SIN FN' };
    var pob = regs.map(function(c, i){ return window.__P.reg(c, String(i)) });
    var oG = window.labGetInformes, oI = window.getInformes;
    window.labGetInformes = function(){ return pob };
    window.getInformes = function(){ return pob };
    var err = null, opciones = null;
    try {
      if (typeof labAsocLibreReset === 'function') labAsocLibreReset(true);
      if (typeof labAsocLibreInit === 'function') labAsocLibreInit();
      var sx = document.getElementById('asocL-x'), sy = document.getElementById('asocL-y');
      if (!sx || !sy) { err = 'NO EXISTEN los selectores' }
      else {
        opciones = Array.from(sx.options).map(function(o){ return o.value });
        if (opciones.indexOf(kx) < 0 || opciones.indexOf(ky) < 0) err = 'FALTA la opcion ' + kx + ' o ' + ky;
        else {
          sx.value = kx; sy.value = ky;
          sx.dispatchEvent(new Event('change', { bubbles: true }));
          sy.dispatchEvent(new Event('change', { bubbles: true }));
          labAsocLibreCalcular();
        }
      }
    } catch (e) { err = 'EXC: ' + e.message }
    window.labGetInformes = oG; window.getInformes = oI;
    var res = document.getElementById('lab-asocL-resultado');
    var t = res ? (res.textContent||'').replace(/\\s+/g,' ').trim() : null;
    return { err: err, nOpciones: opciones ? opciones.length : null, opciones: opciones,
             txt: t, acoplado: !!(t && t.indexOf('construcci') >= 0),
             tautologica: !!(t && t.indexOf('tautol') >= 0) } },

  /* ══ VALVULAS DEL LABORATORIO ════════════════════════════════════════════════════════════ */
  valvCounts(regs) {
    if (typeof _labValvCounts !== 'function') return 'SIN FN';
    try { var vc = _labValvCounts(regs.map(function(c, i){ return window.__P.reg(c, String(i)) }));
      return { bases: vc.bases, L: vc.counts.Leve, M: vc.counts.Moderada, S: vc.counts.Severa,
               N: vc.N, naTab: vc.na || 'SIN na' };
    } catch (e) { return 'EXC: ' + e.message } },

  estenSev(campos, key) {
    if (typeof _labEstenSev !== 'function') return 'SIN FN';
    try { return _labEstenSev(window.__P.reg(campos), key) } catch (e) { return 'EXC' } },

  /* La TABLA de las ocho filas, pintada llamando al renderizador con la poblacion en la mano. */
  tabla(regs) {
    if (typeof labRenderExtras !== 'function') return { err: 'SIN labRenderExtras' };
    var infs = regs.map(function(c, i){ return window.__P.reg(c, String(i)) });
    var err = null;
    var oG = window.labGetInformes, oI = window.getInformes;
    window.labGetInformes = function(){ return infs };
    window.getInformes = function(){ return infs };
    try { labRenderExtras(infs, infs.length) } catch (e) { err = 'EXC: ' + e.message }
    window.labGetInformes = oG; window.getInformes = oI;
    var t = document.getElementById('lab-valv-tabla');
    var filas = t ? Array.from(t.querySelectorAll('tbody tr')).map(function(tr){
      return Array.from(tr.children).map(function(td){ return (td.textContent||'').trim() }) }) : [];
    var ths = t ? Array.from(t.querySelectorAll('thead th')).map(function(th){ return (th.textContent||'').trim() }) : [];
    /* ⚠️ EL PIE ES EL ULTIMO HIJO DEL CONTENEDOR, NO EL HERMANO DE LA TABLA. La primera version
       pedia t.nextElementSibling sobre el contenedor #lab-valv-tabla y leia las BARRAS de la
       tarjeta de al lado: el A/B informaba un pie de 200 caracteres que no era el pie. */
    var tabEl = t ? t.querySelector('table') : null;
    var pieEl = (tabEl && tabEl.nextElementSibling) ? tabEl.nextElementSibling : null;
    return { err: err, n: infs.length, ths: ths, filas: filas,
             pie: pieEl ? (pieEl.textContent||'').replace(/\\s+/g,' ').trim() : null,
             sub: window.__P.txt('lab-valv-chart-sub'),
             leyenda: (function(){ var l = document.getElementById('lab-valv-chart-leyenda');
               return l ? (l.textContent||'').replace(/\\s+/g,' ').trim() : null })(),
             barrasEm: (function(){ var c = document.getElementById('lab-esten-em');
               return c ? (c.textContent||'').replace(/\\s+/g,' ').trim() : null })(),
             barrasEa: (function(){ var c = document.getElementById('lab-esten-ea');
               return c ? (c.textContent||'').replace(/\\s+/g,' ').trim() : null })(),
             barrasIm: (function(){ var c = document.getElementById('lab-valv-im');
               return c ? (c.textContent||'').replace(/\\s+/g,' ').trim() : null })() } },

  /* La config del grafico apilado: los datos por dataset, que es lo que dibuja. */
  apilado(regs) {
    if (typeof _labValvChartCfg !== 'function') return 'SIN FN';
    try { var cfg = _labValvChartCfg(regs.map(function(c, i){ return window.__P.reg(c, String(i)) }), {});
      return { labels: cfg.data.labels,
               ds: cfg.data.datasets.map(function(d){ return { lbl: d.label, data: d.data, n: d._rawN } }) };
    } catch (e) { return 'EXC: ' + e.message } },

  /* ══ CONTROLES ═══════════════════════════════════════════════════════════════════════════ */
  limpiar() {
    try { limpiarCampos(true) } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v) } catch(e){}
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t) } catch(e){}
      });
    });
    try { if (window.VALV_ESTEN_AUTO) window.VALV_ESTEN_AUTO.clear() } catch(e) {}
    try { if (window.VALV_INSUF_AUTO) window.VALV_INSUF_AUTO.clear() } catch(e) {}
    return 1 },

  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  recolectar() {
    if (typeof recolectarCampos === 'function') { try { return recolectarCampos() } catch(e) {} }
    var o = {};
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      if (e.type === 'checkbox') { o[e.id + '__chk'] = e.checked ? '1' : '0'; return }
      if (String(e.value || '') !== '') o[e.id] = e.value;
    });
    return o },

  informe(estilo) {
    try { if (estilo && typeof setEstiloInforme === 'function') setEstiloInforme(estilo) } catch(e) {}
    try { generarInforme({ silencioso: true }) } catch(e) { return { err: 'EXC: ' + e.message } }
    return { inf: (window.__P.val('informe_texto') || '').replace(/\\s+/g,' ').trim(),
             suma: (window.__P.val('en_suma') || '').replace(/\\s+/g,' ').trim() } },

  grados() {
    var o = {};
    ['im_grado','ia_grado','it_grado','ea_grado','em_grado','et_grado','ip_grado','ep_grado']
      .forEach(function(id){ o[id] = window.__P.val(id) });
    ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
      o['pill_esten_' + v] = window.__P.pill(v, 'esten');
      o['pill_insuf_' + v] = window.__P.pill(v, 'insuf');
    });
    o.diast = window.__P.txt('dd-interp');
    o.hfapeff = window.__P.txt('hfapeff-eco');
    o.vdTam = window.__P.txt('vd-tam');
    o.tpsp = window.__P.txt('tapse-psap-interp');
    o.apdMarca = window.__P.txt('ip_ap_diam-marca');
    return o },

  /* El PPT no se genera: se lee la franja de hallazgos que su emisor arma. */
  ppt() {
    if (typeof _pptEnSuma !== 'function') return 'SIN FN';
    try { return String(_pptEnSuma()).replace(/\\s+/g,' ').trim().slice(0, 400) } catch (e) { return 'EXC: ' + e.message } },

  /* ⚠️ J() STRINGIFICA ANTES DE AWAITEAR, asi que sobre una promesa devuelve {} — la trampa que
     la tanda F documenta. El PDF se genera interceptando jsPDF y resolviendo DENTRO de la pagina. */
  pdf() {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') return Promise.resolve('SIN jsPDF');
    var NS = window.jspdf;
    if (!NS || !NS.jsPDF) return Promise.resolve('SIN jsPDF.jsPDF');
    var textos = [];
    var Orig = NS.jsPDF;
    NS.jsPDF = function(){
      var d = new Orig(arguments[0], arguments[1], arguments[2]);
      var ot = d.text.bind(d);
      d.text = function(t){ try { textos.push(String(t)) } catch(e) {} return ot.apply(d, arguments) };
      d.save = function(){ return d };
      return d };
    NS.jsPDF.API = Orig.API;
    var err = null;
    /* ⚠️ generarPDF ABRE LA TARJETA DE SEVERIDAD VALVULAR y recien DESPUES llama al generador:
       la primera corrida informo n=0 textos sobre un jsPDF que si habia cargado. Y
       valvSevConfirmada NO SE PUEDE FIJAR DESDE AFUERA: es una let DE MODULO, asi que
       window.valvSevConfirmada = true crea otra propiedad y la guarda sigue en false — la
       misma trampa que ECO_AYUDA y _labImpDatos. Se entra por _pdfAjustarA4, que el
       comentario de generarPDF declara como el UNICO camino de todos sus llamadores. */
    try { if (typeof _pdfAjustarA4 === 'function') _pdfAjustarA4();
          else if (typeof generarPDF === 'function') generarPDF() } catch (e) { err = 'EXC: ' + e.message }
    return new Promise(function(res){
      setTimeout(function(){
        NS.jsPDF = Orig;
        res({ err: err, n: textos.length,
              txt: textos.join(' | ').replace(/\\s+/g,' ').slice(0, 1400) });
      }, 1400);
    }) }
};
1`;

/* ══ LAS ESCENAS ══════════════════════════════════════════════════════════════════════════════
   Casi todas son REGISTROS de estudio. Los valores del TAPSE y de la PSAP estan elegidos para
   que el cociente caiga a los DOS lados de cada corte y EN el corte: 0,359 / 0,360 / 0,410 /
   0,546 / 0,550 / 0,564, que son los seis que la tanda G1 midio en pantalla. Un borde se prueba
   con el valor que cae ENTRE los dos lados, no con uno que esta fuera de los dos. */
const COC = [
  { k:'bajo',      tapse:'18', psap:'50', esp:'0.360' },   /* 0,36 EXACTO */
  { k:'muyBajo',   tapse:'18', psap:'51', esp:'0.353' },   /* < 0,36 */
  { k:'medio',     tapse:'20', psap:'40', esp:'0.500' },
  { k:'corteAlto', tapse:'22', psap:'40', esp:'0.550' },   /* 0,55 EXACTO */
  { k:'alto',      tapse:'24', psap:'40', esp:'0.600' },
  { k:'sinTapse',  tapse:null, psap:'40', esp:null },
  { k:'sinPsap',   tapse:'20', psap:null, esp:null },
  { k:'ninguno',   tapse:null, psap:null, esp:null }
];
function regCoc(c, extra) {
  const o = Object.assign({}, extra || {});
  if (c.tapse !== null) o.tapse = c.tapse;
  if (c.psap  !== null) o.psap_calc = c.psap;
  return o;
}
/* Poblacion para las asociaciones: el TAPSE/PSAP solo existe donde la IT es medible, asi que la
   mitad de los estudios NO lo tiene — y eso es exactamente el sesgo de seleccion que la nota
   tiene que declarar. Doce con cociente (el minimo del bloque es 10) y seis sin. */
function poblacionAsoc() {
  /* ⚠️ EL TAPSE Y LA PSAP NO VAN MONOTONOS, Y LA PRIMERA VERSION SI. Con t creciente y p
     decreciente la correlacion PSAP-TAPSE salia en rho = -1,00 EXACTO: una relacion degenerada,
     donde cualquier corte da el mismo resultado y ninguna prueba distingue nada. Los dos van con
     un zigzag determinista, asi que los cocientes no quedan ordenados y Spearman tiene algo que
     medir. Catorce con cociente —el minimo del bloque es 10— y seis sin. */
  const Z = [0, 2, -1, 3, -2, 1, 4, -3, 2, 0, -1, 3, 1, -2];
  const con = [];
  for (let i = 0; i < 14; i++) {
    const t = 15 + (i % 7) * 2 + Z[i];
    const p = 30 + ((i * 5) % 29) + Z[(i + 3) % 14];
    con.push({ tapse: String(t), psap_calc: String(p),
               fevi: String(38 + ((i * 7) % 25)),
               onda_e: String(80 + (i % 5) * 6),
               e_sep: String(5 + (i % 6) * 0.5), e_lat: String(7 + (i % 5) * 0.6),
               ai_vol: String(55 + ((i * 11) % 45)), peso: '70', talla: '170',
               it_grado: (i % 3 === 0 ? '4' : (i % 3 === 1 ? '2' : '1')),
               vmax_it: '3.0' });
  }
  const sin = [];
  for (let i = 0; i < 6; i++) sin.push({ fevi: String(52 + i * 2), peso: '70', talla: '170',
                                         onda_e: '80', e_sep: '8', e_lat: '10',
                                         ai_vol: String(58 + i * 3), it_grado: '1' });
  return { con, sin, todos: con.concat(sin) };
}
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
      pausa(ms || 20000).then(() => ({ __reloj: true }))
    ]);
    if (r.__reloj) throw new Error('ev() no resolvio en ' + (ms || 20000) + ' ms: ' + expr.slice(0, 90));
    if (r.exceptionDetails) throw new Error('EXC en ev(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' | ' + expr.slice(0, 90));
    return r.result.value;
  }
  async function evCrudo(expr) {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error('EXC en evCrudo(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  }
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, Space: 32 };
  /* ⚠️ Enter y Espacio van con type keyDown MAS text —Blink activa desde el KEYPRESS—; las de
     EDICION van con rawKeyDown y por keycode. Las dos cosas son ciertas a la vez. */
  async function tecla(k) {
    const code = VK[k];
    if (k === 'Enter' || k === 'Space') {
      const t = k === 'Enter' ? '\r' : ' ';
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k === 'Space' ? ' ' : 'Enter',
        code: k === 'Space' ? 'Space' : 'Enter', windowsVirtualKeyCode: code, text: t }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k === 'Space' ? ' ' : 'Enter',
        code: k === 'Space' ? 'Space' : 'Enter', windowsVirtualKeyCode: code }, sessionId);
      return;
    }
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k,
      windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k,
      windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }, sessionId);
  }
  /* ⚠️ UN TECLEO QUE NO QUEDA NO ES UNA MEDICION. Si el campo no existe, no tiene geometria, no
     recibe el foco o el valor no quedo, se ABORTA nombrandolo: sin esto la sonda informa un
     veredicto sobre un gesto que nunca ocurrio. */
  async function tipear(id, texto) {
    const g = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!g || g.err || !g.ok) throw new Error('SIN GEOMETRIA ' + id + ' ' + JSON.stringify(g));
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)}); e.focus();
      e.setSelectionRange ? e.setSelectionRange(0, (e.value||'').length) : 0; return 1 })()`);
    const foco = await ev(`document.activeElement ? document.activeElement.id : null`);
    if (foco !== id) throw new Error('EL FOCO NO LLEGO a ' + id + ', esta en ' + foco);
    for (let i = 0; i < 24; i++) await tecla('Backspace');
    await cdp.send('Input.insertText', { text: String(texto) }, sessionId);
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      e.dispatchEvent(new Event('input', { bubbles: true })); return 1 })()`);
    const leido = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(leido) !== String(texto)) throw new Error('EL TECLEO NO QUEDO en ' + id + ': ' + leido);
    return leido;
  }

  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2800);
  await evCrudo(SONDA);

  const avisoIni = await ev(`window.__P.despejar()`);
  const out = { file: FARG, md5Ini, avisoIni, grupos: {} };
  const SOLOG = (arg('--solo') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const corre = (g) => !SOLOG.length || SOLOG.indexOf(g) >= 0;
  const POB = poblacionAsoc();

  /* ── excel ── Las 438 columnas, las dos nuevas por sus ocho escenas de cociente, su POSICION y
     el hash de las 436 anteriores (que es lo unico que distingue «se agrego algo» de «cambio
     otra cosa»). */
  if (corre('excel')) {
    const g = { denominador: { escenas: COC.length }, escenas: [], orden: null, mapa: {}, asserts: null };
    for (const c of COC) {
      const r = regCoc(c, { ip_ap_diam: '24' });
      g.escenas.push({ k: c.k, tapse: c.tapse, psap: c.psap, esperado: c.esp,
                       xls: await ev(`window.__P.excel(${JSON.stringify(r)})`),
                       dueno: await ev(`window.__P.tpspDe(${JSON.stringify(r)})`) });
    }
    /* Sin el diametro cargado la columna tiene que salir VACIA y no 0. */
    g.sinApd = await ev(`window.__P.excel(${JSON.stringify({ tapse: '20', psap_calc: '40' })})`);
    g.apdFueraBanda = await ev(`window.__P.excel(${JSON.stringify({ ip_ap_diam: '120' })})`);
    g.vacio = await ev(`window.__P.excel({})`);
    g.orden = await ev(`window.__P.ordenExcel(${JSON.stringify({ tapse: '20', psap_calc: '40', ip_ap_diam: '24' })})`);
    for (const n of ['TAPSE/PSAP (mm/mmHg)', 'Diámetro arteria pulmonar (mm)', 'PSAP (mmHg)',
                     'PHT IAo (ms)', 'THP IAo (ms)', 'TAVI RPV PHT (ms)', 'TAVI RPV THP (ms)'])
      g.mapa[n] = await ev(`window.__P.mapaDe(${JSON.stringify(n)})`);
    g.asserts = await ev(`window.__P.asserts()`);
    out.grupos.excel = g;
  }

  /* ── import ── Un Excel VIEJO de 436 (sin las dos nuevas) y uno NUEVO de 438, los dos por el
     importador de verdad. El viejo tiene que entrar sin error y sin tocar nada. */
  if (corre('import')) {
    const g = {};
    const viejoH = ['Nombre', 'CI', 'Fecha estudio', 'TAPSE (mm)', 'PSAP (mmHg)', 'FEVI Simpson (%)'];
    const nuevoH = viejoH.concat(['TAPSE/PSAP (mm/mmHg)', 'Diámetro arteria pulmonar (mm)']);
    const fila = { 'Nombre': 'Import Viejo', 'CI': '12345', 'Fecha estudio': '2026-10-15',
                   'TAPSE (mm)': '20', 'PSAP (mmHg)': '40', 'FEVI Simpson (%)': '60' };
    g.viejo = await ev(`window.__P.importar(${JSON.stringify(viejoH)}, ${JSON.stringify(fila)})`, 20000);
    const filaN = Object.assign({}, fila, { 'Nombre': 'Import Nuevo',
      'TAPSE/PSAP (mm/mmHg)': '0.500', 'Diámetro arteria pulmonar (mm)': '26' });
    g.nuevo = await ev(`window.__P.importar(${JSON.stringify(nuevoH)}, ${JSON.stringify(filaN)})`, 20000);
    out.grupos.import = g;
  }

  /* ── alias ── Un Excel viejo con los dos encabezados que decian «PHT»: tienen que entrar por la
     tabla de alias de ENTRADA, y el nombre nuevo tambien. */
  if (corre('alias')) {
    const g = {};
    const H = ['Nombre', 'CI', 'Fecha estudio', 'PHT IAo (ms)', 'TAVI RPV PHT (ms)'];
    const F = { 'Nombre': 'Alias PHT', 'CI': '777', 'Fecha estudio': '2026-10-15',
                'PHT IAo (ms)': '420', 'TAVI RPV PHT (ms)': '180' };
    g.conPHT = await ev(`window.__P.importar(${JSON.stringify(H)}, ${JSON.stringify(F)})`, 20000);
    const H2 = ['Nombre', 'CI', 'Fecha estudio', 'THP IAo (ms)', 'TAVI RPV THP (ms)'];
    const F2 = { 'Nombre': 'Alias THP', 'CI': '778', 'Fecha estudio': '2026-10-15',
                 'THP IAo (ms)': '420', 'TAVI RPV THP (ms)': '180' };
    g.conTHP = await ev(`window.__P.importar(${JSON.stringify(H2)}, ${JSON.stringify(F2)})`, 20000);
    /* Censo del texto visible: cuantos «PHT» quedan en encabezados de Excel y en el bloque 8. */
    g.censo = await ev(`(function(){
      var src = document.documentElement.innerHTML;
      var n = 0, i = -1;
      while ((i = src.indexOf('PHT IAo', i + 1)) >= 0) n++;
      var m = 0, j = -1;
      while ((j = src.indexOf('RPV PHT', j + 1)) >= 0) m++;
      return { phtIao: n, rpvPht: m } })()`);
    out.grupos.alias = g;
  }

  /* ── asoc ── Las cuatro asociaciones armadas del TAPSE/PSAP, con su n real y su nota. El
     DENOMINADOR es que la poblacion tenga 12 con cociente y 6 sin: con todos teniendolo, el
     sesgo de seleccion no se puede medir. */
  if (corre('asoc')) {
    const g = { denominador: { conCociente: POB.con.length, sinCociente: POB.sin.length,
                               total: POB.todos.length } };
    g.tabla = await ev(`window.__P.asocA(${JSON.stringify(POB.todos)})`, 30000);
    for (const et of ['TAPSE/PSAP', 'PSAP – TAPSE'])
      g['det_' + et.replace(/[^a-z]/gi, '')] = await ev(`window.__P.asocDetalle(${JSON.stringify(POB.todos)}, ${JSON.stringify(et)})`, 30000);
    /* Los cuatro detalles, uno por uno, por su etiqueta completa. */
    g.detalles = {};
    for (const et of ['TAPSE/PSAP – FEVI', "TAPSE/PSAP – E/e'", 'TAPSE/PSAP – Vol AI',
                      'TAPSE/PSAP – Insuficiencia tricusp'])
      g.detalles[et] = await ev(`window.__P.asocDetalle(${JSON.stringify(POB.todos)}, ${JSON.stringify(et)})`, 30000);
    /* CONTROL NEGATIVO: con SOLO los seis que no tienen cociente, las cuatro tienen que quedar
       en «N insuficiente» y NO publicar un resultado. */
    g.soloSin = await ev(`window.__P.asocA(${JSON.stringify(POB.sin)})`, 30000);
    out.grupos.asoc = g;
  }

  /* ── libre ── El selector y el aviso de PAR ACOPLADO. Tres pares: los dos acoplados (cociente
     con TAPSE y con PSAP) y uno que NO lo es, que es el control negativo. */
  if (corre('libre')) {
    const g = {};
    /* ⚠️ LOS DOS PARES QUE YA EXISTIAN VAN EN LA MISMA TABLA, Y SON EL CONTROL DE QUE EL AVISO NO
       CAMBIO DE TEXTO. `_libreCircular` paso a devolver DOS formas en vez del sujeto, asi que el
       wording de `hfpeff` y de `amil` tiene que salir letra por letra igual que en HEAD. */
    for (const [kx, ky, k] of [['tpsp', 'tapse', 'acopladoTapse'], ['tpsp', 'psap', 'acopladoPsap'],
                               ['tpsp', 'fevi', 'noAcoplado'], ['fevi', 'psap', 'control'],
                               ['hfpeff', 'ee', 'viejoHfpeff'], ['amil', 'tapse', 'viejoAmil'],
                               ['hfpeff', 'qpqs', 'viejoSinDatos']])
      g[k] = await ev(`window.__P.libre(${JSON.stringify(POB.todos)}, ${JSON.stringify(kx)}, ${JSON.stringify(ky)})`, 30000);
    out.grupos.libre = g;
  }

  /* ── valv ── La tabla de las ocho filas y el apilado. La escena del medico: la EM con un «leve»
     y un «severa», y la ET con lo que hoy figura como «leve». */
  if (corre('valv')) {
    const g = {};
    const base = { im_grado: '0', ia_grado: '0', it_grado: '0', ip_grado: 'Sin insuficiencia',
                   ea_grado: 'sin', ep_grado: 'sin' };
    const mk = (o) => Object.assign({}, base, o);
    /* La escena que el medico midio: EM con Leve 1 y Sev 1, ET con Leve 1. */
    g.escenaMedico = mk({ em_grado: 'leve', et_grado: 'Leve' });
    const pobMedico = [mk({ em_grado: 'leve', et_grado: 'Leve' }),
                       mk({ em_grado: 'severa', et_grado: 'sin' }),
                       mk({ em_grado: 'sin', et_grado: 'sin' })];
    g.medico = { counts: await ev(`window.__P.valvCounts(${JSON.stringify(pobMedico)})`),
                 tabla: await ev(`window.__P.tabla(${JSON.stringify(pobMedico)})`, 30000),
                 apilado: await ev(`window.__P.apilado(${JSON.stringify(pobMedico)})`) };
    /* La escena con los tokens VIGENTES de la tricuspide: 'Significativa' / 'No significativa'. */
    const pobHoy = [mk({ em_grado: 'severa', et_grado: 'Significativa' }),
                    mk({ em_grado: 'leve',   et_grado: 'No significativa' }),
                    mk({ em_grado: 'sin',    et_grado: 'sin' }),
                    mk({ em_grado: 'severa', et_grado: 'Significativa' })];
    g.hoy = { counts: await ev(`window.__P.valvCounts(${JSON.stringify(pobHoy)})`),
              tabla: await ev(`window.__P.tabla(${JSON.stringify(pobHoy)})`, 30000),
              apilado: await ev(`window.__P.apilado(${JSON.stringify(pobHoy)})`) };
    /* La lectura cruda del token, que es lo que delata si la tricuspide binaria entra o no. */
    g.lecturas = {};
    for (const t of ['Significativa', 'No significativa', 'sin', 'Leve', 'Moderada', 'Severa', 'Sin estenosis'])
      g.lecturas[t] = { et: await ev(`window.__P.estenSev(${JSON.stringify({ et_grado: t })}, 'et_grado')`),
                        em: await ev(`window.__P.estenSev(${JSON.stringify({ em_grado: t })}, 'em_grado')`) };
    /* CONTROL NEGATIVO: las otras seis lesiones con un grado de cada uno, que no se tocan. */
    const pobOtras = [mk({ im_grado: '2', ia_grado: '1', it_grado: '4', ea_grado: 'Moderada',
                           ip_grado: 'Severa', ep_grado: 'Leve' }),
                      mk({ im_grado: '4', ia_grado: '2', it_grado: '1', ea_grado: 'Severa',
                           ip_grado: 'Leve', ep_grado: 'Moderada' })];
    g.otras = { counts: await ev(`window.__P.valvCounts(${JSON.stringify(pobOtras)})`),
                tabla: await ev(`window.__P.tabla(${JSON.stringify(pobOtras)})`, 30000) };
    out.grupos.valv = g;
  }

  /* ── teclas ── De punta a punta: un estudio TIPEADO con teclas reales produce las dos columnas
     nuevas con el mismo valor que su registro sintetico. */
  if (corre('teclas')) {
    const g = {};
    await ev(`window.__P.limpiar()`);
    await ev(`window.__P.despejar()`);
    /* El TAPSE vive en el acordeon del VD; el diametro de la AP detras de DOS puertas de
       Valvulas. Se abren antes de tipear: un campo sin geometria no se puede tipear. */
    g.puertaVd = await ev(`(function(){
      try { showTab('vd') } catch(e) {}
      var acc = document.getElementById('sacc-vd');
      if (acc && !acc.classList.contains('open')) { try { secToggle('vd') } catch(e) {} }
      return { tapse: window.__P.geo('tapse') } })()`);
    g.tapse = await tipear('tapse', '20');
    /* La PSAP es readonly y deriva de la Vmax de IT: NUNCA se le manda una tecla. Se carga su
       insumo, que es el camino real del medico. */
    g.puertaDop = await ev(`(function(){
      try { showTab('doppler') } catch(e) {}
      var c = document.getElementById('dop-tricusp');
      if (c && getComputedStyle(c).display === 'none') { try { toggleCard('dop-tricusp', null) } catch(e) {} }
      return { vmax: window.__P.geo('vmax_it'), psapRO: (function(){
        var e = document.getElementById('psap_calc'); return e ? !!e.readOnly : null })() } })()`);
    g.vmax = await tipear('vmax_it', '3.0');
    /* ⚠️ LA PSAP NO SALE SOLO DE LA VMAX: es 4*VRT^2 + PmAD, y la PmAD la calcula `calcPmAD`
       desde el diametro y el colapso de la VCI. Sin esos dos la PSAP queda VACIA y la fila del
       cociente dice «—» — la primera corrida midio eso y se leia como «el cociente no funciona». */
    g.vci = await ev(`(function(){ window.__P.set('vci_diam', '18'); window.__P.set('vci_col', '>50');
      try { calcPmAD(); calcPSAP() } catch(e) {}
      return { pmad: window.__P.val('pmad'), psap: window.__P.val('psap_calc') } })()`);
    g.psapTrasVmax = await ev(`window.__P.val('psap_calc')`);
    g.filaTpsp = await ev(`window.__P.txt('tapse-psap-interp')`);
    g.puertaPulmo = await ev(`(function(){
      try { showTab('valvulas') } catch(e) {}
      var s = document.getElementById('ete-seccion-valv-pulmonar');
      if (s && getComputedStyle(s).display === 'none') { try { toggleEteSeccion('valv-pulmonar') } catch(e) {} }
      var b = document.getElementById('bloque-insuf-pulmonar');
      if (b && getComputedStyle(b).display === 'none') b.style.display = 'block';
      try { var c = document.getElementById('caja-insuf-pulmonar');
        if (c && !c.classList.contains('valv-datos-abierto')) valvDatosTog('caja-insuf-pulmonar') } catch(e) {}
      return { ap: window.__P.geo('ip_ap_diam') } })()`);
    g.apd = await tipear('ip_ap_diam', '26');
    g.campos = await ev(`(function(){ var c = window.__P.recolectar();
      return { n: Object.keys(c).length, tapse: c.tapse, psap: c.psap_calc, apd: c.ip_ap_diam,
               hayTpsp: Object.keys(c).filter(function(k){ return k.indexOf('tapse_psap') >= 0 }) } })()`);
    g.xlsDelFormulario = await ev(`(function(){
      var c = window.__P.recolectar();
      return window.__P.excel(c) })()`);
    out.grupos.teclas = g;
  }

  /* ── controles ── Informe (tres estilos), EN SUMA, PDF, PPT, grados y pastillas de las ocho
     lesiones, protesis, VD, diastolica y HFA-PEFF, con un escenario CARGADO y con el formulario
     vacio. Las 436 columnas anteriores con su hash. */
  if (corre('controles')) {
    const g = {};
    await ev(`window.__P.limpiar()`);
    await ev(`window.__P.despejar()`);
    g.vacio = { grados: await ev(`window.__P.grados()`),
                inf: await ev(`window.__P.informe('estandar')`),
                xls: await ev(`(function(){ return window.__P.excel(window.__P.recolectar()) })()`),
                fila: await ev(`(function(){ return window.__P.excelFila(window.__P.recolectar()) })()`) };
    /* Escenario CARGADO: sin denominador, «0 diferencias» no prueba nada. */
    const ESC = { fevi: '45', ddfvi: '58', dsfvi: '42', siv: '13', ppvi: '12', peso: '80', talla: '172',
                  edad: '68', sexo: 'M', tapse: '18', s_prime: '10', vd_bas: '38',
                  onda_e: '95', onda_a: '45', e_sep: '5', e_lat: '7', ai_vol: '90', tde: '150',
                  vmax_it: '3.2', vci_diam: '22', vci_col: '<50',
                  im_vmax: '5.5', im_itv: '140', pisa_r: '6', pisa_val: '40',
                  ia_vc: '7', ia_pht: '220', it_vc: '8', vmax_ao: '4.2', gmedio_ao: '45',
                  avm_plan: '1.2', em_gmedio: '12', ip_ancho: '12', ip_ap_diam: '26',
                  diam_tsvi_ao: '20', itv_tsvi: '20' };
    await ev(`(function(){ var o = ${JSON.stringify(ESC)};
      Object.keys(o).forEach(function(k){ window.__P.set(k, o[k]) }); return 1 })()`);
    await ev(`(function(){ try { calcVD(); calcPSAP(); calcDiastol(); calcIM_ESC(); calcIA_ESC();
      calcIT_ESC(); calcEM(); calcAo(); calcIP(); } catch(e) {} return 1 })()`);
    g.cargado = { grados: await ev(`window.__P.grados()`),
                  estandar: await ev(`window.__P.informe('estandar')`),
                  narrativo: await ev(`window.__P.informe('narrativo')`),
                  conciso: await ev(`window.__P.informe('conciso')`),
                  ppt: await ev(`window.__P.ppt()`),
                  xls: await ev(`(function(){ return window.__P.excel(window.__P.recolectar()) })()`),
                  fila: await ev(`(function(){ return window.__P.excelFila(window.__P.recolectar()) })()`) };
    g.pdf = await ev(`window.__P.pdf()`, 30000);
    out.grupos.controles = g;
  }

  out.avisoFin = await ev(`window.__P.despejar()`);
  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close(); } catch (e) {}
  try { srv.close(); } catch (e) {}
  process.exit(0);
}

main().catch((e) => { console.error('[_probe_g2] ' + ((e && e.stack) || e)); process.exit(1); });
