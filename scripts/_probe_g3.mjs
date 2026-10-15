#!/usr/bin/env node
/**
 * _probe_g3.mjs - sonda A/B de SOLO LECTURA para la tanda «G3» (2026-10-15):
 *   (1) VD, DISPOSICION: la casilla de la FAC VISIBLE con su mensaje «requiere …», y el
 *       diametro de la arteria pulmonar MUDADO a la columna 3 del VD, en tercer lugar.
 *   (2) VD/VI: el selector de tramo que convive con el numero, su funcion dueña y los CUATRO
 *       lectores (probabilidad de HTP, fila del cuadro, PDF y PPT).
 *   (3) LABORATORIO: el PPT estadistico y la mini-tabla del PDF de auditoria alineados con la
 *       tabla de pantalla, con las dos estenosis BINARIAS.
 *   (4) IMPORTADOR: el mensaje comun de las columnas calculadas, el detalle del TAPSE/PSAP y de
 *       la PSAP, y la ida y vuelta del cociente.
 *
 * Infraestructura calcada de scripts/_probe_g2.mjs (teclas y clics reales, cierre del arbol de
 * Chrome por GRUPO y por PID PROPIO, reloj sobre ev(), aviso legal despejado con su denominador,
 * md5 al principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_g3.mjs --file /tmp/index.HEAD.html > /tmp/g3.HEAD.json
 *   node scripts/_probe_g3.mjs                             > /tmp/g3.NEW.json
 *
 * Grupos (--solo campos|fac|apd|vdvi|valv|import|controles|captura):
 *   campos    - la columna 3 con sus SEIS campos, el orden del Tab con teclas reales y las
 *               posiciones a 1200, 390 y 360 px en los dos temas.
 *   fac       - la casilla visible, el mensaje «requiere …» en sus tres ramas y «Nuevo estudio».
 *   apd       - el diametro de la arteria pulmonar en su lugar nuevo: tecleo, banda, Excel, que
 *               no vota, y que la seccion de la insuficiencia pulmonar quedo ordenada.
 *   vdvi      - el selector en sus estados y los cuatro lectores.
 *   valv      - el PPT estadistico y la mini-tabla del PDF de auditoria con las dos binarias.
 *   import    - los mensajes de las columnas calculadas y la IDA Y VUELTA del TAPSE/PSAP.
 *   controles - informe (tres estilos), EN SUMA, PDF, PPT, grados y pastillas de las ocho
 *               lesiones, diastolica, HFA-PEFF y las 438 columnas del Excel.
 *   captura   - PNG de la columna 3 del VD en los dos temas (con --dest).
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
/* --dest <dir>: el grupo `captura` guarda PNG de la tabla en los dos temas. */
const DEST = arg('--dest');
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-g3-'));
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
  ph(id)  { var e = document.getElementById(id); return e ? String(e.placeholder || '') : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  existe(id) { return !!document.getElementById(id) },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  geo(id) { var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             x: Math.round(r.left), y: Math.round(r.top),
             ok: r.width > 0 && r.height > 0 } },
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

  /* ⚠️ LA PESTANA SE LLAMA «vd» Y NO «vd-ad», y el acordeon es sacc-vd. Lo que esta en
     display:none no tiene geometria: sin abrir los dos, se tipea en la nada y todas las escenas
     salen «sin cambios», que es indistinguible de «el cableado no funciona». */
  abrirVD() {
    var o = {};
    try { showTab('vd'); o.tab = 'ok' } catch (e) { o.tab = 'EXC: ' + e.message }
    try { var a = document.getElementById('sacc-vd');
      if (a && !a.classList.contains('open')) secToggle('vd');
      o.acc = a ? (a.classList.contains('open') ? 'abierto' : 'CERRADO') : 'NO EXISTE';
    } catch (e) { o.acc = 'EXC: ' + e.message }
    o.grid = window.__P.geo('vd_vi');
    return o },

  /* La columna 3 entera: cada .fg con su celda declarada y su campo. */
  grilla() {
    var g = document.querySelector('.vd-grid');
    if (!g) return { err: 'NO EXISTE .vd-grid' };
    var fgs = Array.prototype.slice.call(g.querySelectorAll('.fg'));
    return {
      nFg: fgs.length,
      tabindex: g.querySelectorAll('[tabindex]').length,
      campos: Array.prototype.slice.call(g.querySelectorAll('input[id]')).map(function(e){ return e.id }),
      celdas: fgs.map(function(fg){
        var cl = String(fg.className || '');
        var c = (cl.match(/vd-c(\\d)/) || [])[1] || '?';
        var r = (cl.match(/vd-r(\\d)/) || [])[1] || '?';
        var inp = fg.querySelector('input[id],select[id]');
        return { id: inp ? inp.id : (fg.id || '?'), c: c, r: r,
                 vis: getComputedStyle(fg).display !== 'none' };
      }) } },

  /* Geometria de los dieciseis, para medir columnas visuales, solapamientos y desborde. */
  maqueta() {
    var g = document.querySelector('.vd-grid');
    if (!g) return { err: 'NO EXISTE .vd-grid' };
    var fgs = Array.prototype.slice.call(g.querySelectorAll('.fg'))
      .filter(function(f){ return getComputedStyle(f).display !== 'none' });
    var cajas = fgs.map(function(f){
      var r = f.getBoundingClientRect();
      var inp = f.querySelector('input[id],select[id]');
      return { id: inp ? inp.id : '?', x: Math.round(r.left), y: Math.round(r.top),
               w: Math.round(r.width), h: Math.round(r.height) } });
    var xs = {}; cajas.forEach(function(c){ xs[c.x] = 1 });
    var sol = [];
    for (var i = 0; i < cajas.length; i++) for (var j = i + 1; j < cajas.length; j++) {
      var a = cajas[i], b = cajas[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h)
        sol.push(a.id + ' x ' + b.id); }
    var gr = g.getBoundingClientRect();
    return { n: cajas.length, columnas: Object.keys(xs).length, solapamientos: sol,
             desborde: cajas.filter(function(c){ return c.x + c.w > Math.round(gr.right) + 2 })
               .map(function(c){ return c.id }),
             scrollH: document.documentElement.scrollWidth > document.documentElement.clientWidth,
             anchos: cajas.map(function(c){ return c.w }), cajas: cajas } },

  /* ══ RELACION VD/VI ══════════════════════════════════════════════════════════════════════
     Las cuatro superficies en una lectura: el dueño, la fila, el PDF y el PPT salen al lado del
     estado del selector, para que un badge que no cambia no se lea como «el cableado no anda». */
  vdvi() {
    var sl = document.getElementById('vd_vi_sel');
    var est = (typeof vdViEstado === 'function') ? vdViEstado() : 'SIN FN';
    return { num: window.__P.val('vd_vi'),
             sel: sl ? sl.value : 'NO EXISTE',
             selDisabled: sl ? !!sl.disabled : null,
             selAuto: sl ? (sl.dataset.auto || '') : null,
             opciones: sl ? Array.prototype.slice.call(sl.options).map(function(o){ return o.value }) : null,
             estado: est,
             texto: (typeof vdViTexto === 'function') ? vdViTexto(false) : 'SIN FN',
             textoAscii: (typeof vdViTexto === 'function') ? vdViTexto(true) : 'SIN FN',
             filaVis: window.__P.vis('row-vd-vi-interp'),
             filaTxt: window.__P.txt('vd-vi-interp'),
             htp: window.__P.txt('htp2022-interp'),
             htpCat: (function(){
               if (typeof _htp2022Core !== 'function') return 'SIN FN';
               try { var R = _htp2022Core({ num: function(i){ return v(i) },
                                            txt: function(i){ return sv(i) },
                                            chk: function(i){ var e = document.getElementById(i);
                                              return !!(e && e.checked) } });
                 return { catA: R.catA, catB: R.catB, catC: R.catC, nCat: R.nCat, prob: R.prob };
               } catch (e) { return 'EXC: ' + e.message } })() } },

  /* El dueño sobre un REGISTRO archivado, que es el camino del panel de cohorte. */
  vdviDe(campos) {
    if (typeof vdViEstado !== 'function') return 'SIN FN';
    if (typeof _hfSrcCampos !== 'function') return 'SIN _hfSrcCampos';
    try { return vdViEstado(_hfSrcCampos(campos || {})) } catch (e) { return 'EXC: ' + e.message } },

  /* El clic REAL sobre el selector: se elige la opcion y se dispara change, que es lo que
     corre vdViSelClic. Aborta si la opcion no existe o si el valor no quedo. */
  elegirVdVi(valor) {
    var sl = document.getElementById('vd_vi_sel');
    if (!sl) return { err: 'NO EXISTE vd_vi_sel' };
    if (sl.disabled) return { err: 'DISABLED', valor: sl.value };
    var hay = Array.prototype.slice.call(sl.options).map(function(o){ return o.value });
    if (hay.indexOf(valor) < 0) return { err: 'NO HAY OPCION ' + valor, hay: hay };
    sl.value = valor;
    sl.dispatchEvent(new Event('change', { bubbles: true }));
    if (sl.value !== valor) return { err: 'EL VALOR NO QUEDO', valor: sl.value };
    return { ok: true, valor: sl.value, auto: sl.dataset.auto || '' } },

  reg(campos, nombre) {
    return { id: 'P' + (nombre || 'x'), nombre: 'P ' + (nombre || 'x'), ci: '1',
             fecha_estudio: '2026-10-15', campos: campos || {} } },

  excel(campos) {
    if (typeof _labExcelRow !== 'function') return 'SIN FN';
    try {
      var r = _labExcelRow(window.__P.reg(campos));
      var ks = Object.keys(r);
      var s = ''; var k = ks.slice().sort();
      for (var i=0;i<k.length;i++) s += k[i] + '=' + String(r[k[i]]) + '|';
      var x = 0; for (var j=0;j<s.length;j++) { x = ((x<<5)-x) + s.charCodeAt(j); x |= 0 }
      return { cols: ks.length, hash: String(x),
               apd: r['Diámetro arteria pulmonar (mm)'],
               tpsp: r['TAPSE/PSAP (mm/mmHg)'],
               fac: r['FAC VD (%)'], tapse: r['TAPSE (mm)'], psap: r['PSAP (mmHg)'] };
    } catch (e) { return 'EXC: ' + e.message } },

  excelFila(campos) {
    if (typeof _labExcelRow !== 'function') return 'SIN FN';
    try { var r = _labExcelRow(window.__P.reg(campos)); var o = {};
      Object.keys(r).forEach(function(k){ o[k] = (r[k] === null || r[k] === undefined) ? null : String(r[k]) });
      return o } catch (e) { return 'EXC: ' + e.message } },

  mapaDe(nombre) {
    if (typeof LAB_XLS_MAP === 'undefined') return 'SIN MAP';
    var m = LAB_XLS_MAP.filter(function(x){ return x[0] === nombre })[0];
    if (!m) return { enMapa: false };
    return { enMapa: true, dest: m[1], tipo: m[2],
             calculada: (typeof _labXlsEsCalculado === 'function') ? _labXlsEsCalculado(m[1]) : 'SIN FN' } },

  /* ══ IMPORTADOR ══════════════════════════════════════════════════════════════════════════
     Se arma un libro en memoria con los encabezados pedidos y se lo pasa a labImportarXLSX como
     un File de verdad. Lo que se lee es el MODAL que labImpRender pinta: _labImpDatos es una
     let DE MODULO y window._labImpDatos da undefined SIEMPRE. */
  importar(headers, fila) {
    if (typeof XLSX === 'undefined') return Promise.resolve('SIN XLSX');
    if (typeof labImportarXLSX !== 'function') return Promise.resolve('SIN FN');
    var ws = XLSX.utils.aoa_to_sheet([headers, headers.map(function(h){
      return Object.prototype.hasOwnProperty.call(fila, h) ? fila[h] : '' })]);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estudios');
    var buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    var f = new File([buf], 'g3.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
          res({ hay: lleno, txt: txt ? txt.slice(0, 12000) : null,
                errs: errs.slice(0, 4), toasts: toasts.slice(0, 4) });
        }
      }, 150);
    }) },

  /* ══ LABORATORIO — VALVULAS ══════════════════════════════════════════════════════════════ */
  valvCounts(regs) {
    if (typeof _labValvCounts !== 'function') return 'SIN FN';
    try { var vc = _labValvCounts(regs.map(function(c, i){ return window.__P.reg(c, String(i)) }));
      /* ⚠️ TODA LECTURA DE bin VA POR UN AYUDANTE CON CENTINELA: contra un arbol que no lo
         tiene, vc.bin[i] mata la corrida por excepcion y eso prueba que el arbol es distinto,
         no que la sonda sabe medir. Es la leccion de TC-477. */
      var bin = vc.bin || {};
      return { bases: vc.bases, L: vc.counts.Leve, M: vc.counts.Moderada, S: vc.counts.Severa,
               N: vc.N, binClaves: Object.keys(bin),
               bin1: bin[1] || null, bin5: bin[5] || null };
    } catch (e) { return 'EXC: ' + e.message } },

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
    var tabEl = t ? t.querySelector('table') : null;
    var pieEl = (tabEl && tabEl.nextElementSibling) ? tabEl.nextElementSibling : null;
    return { err: err, n: infs.length, filas: filas,
             pie: pieEl ? (pieEl.textContent||'').replace(/\\s+/g,' ').trim() : null } },

  /* ══ EL PPT ESTADISTICO, GENERADO DE VERDAD ══════════════════════════════════════════════
     Se intercepta PptxGenJS y se registran las TABLAS y los TEXTOS que cada slide recibe. Sin
     esto habria que leer el archivo, que es lo que ninguna sonda de esta casa hace. */
  pptLab(regs) {
    /* ⚠️ labPPTEstadistico ABRE UN MODAL y exige que haya tarjetas tildadas con «☐ PPT»: medir
       por ahi seria automatizar esa cadena. El generador es _labPPTGenerar(infs, opts), que
       toma la poblacion directo — y sus diapositivas las decide _labPptGruposActivos(), que se
       sustituye para que la de valvulopatias exista. */
    if (typeof _labPPTGenerar !== 'function') return Promise.resolve('SIN _labPPTGenerar');
    if (typeof PptxGenJS === 'undefined') return Promise.resolve('SIN PptxGenJS');
    var infs = regs.map(function(c, i){ return window.__P.reg(c, String(i)) });
    var tablas = [], textos = [];
    var Orig = window.PptxGenJS;
    function Espia() {
      var p = new Orig();
      var oAdd = p.addSlide.bind(p);
      p.addSlide = function(){
        var s = oAdd.apply(p, arguments);
        var oT = s.addTable.bind(s), oX = s.addText.bind(s);
        s.addTable = function(rows){
          try { tablas.push((rows||[]).map(function(r){ return (r||[]).map(function(c){
            return (c && typeof c === 'object') ? String(c.text) : String(c) }) })) } catch(e) {}
          return oT.apply(s, arguments) };
        s.addText = function(t){ try { textos.push(String(t)) } catch(e) {} return oX.apply(s, arguments) };
        return s };
      p.writeFile = function(){ return Promise.resolve('x') };
      p.write = function(){ return Promise.resolve('x') };
      return p }
    window.PptxGenJS = Espia;
    var oG = window.labGetInformes, oI = window.getInformes;
    window.labGetInformes = function(){ return infs };
    window.getInformes = function(){ return infs };
    var oGr = window._labPptGruposActivos;
    window._labPptGruposActivos = function(){ return { valv: true } };
    var err = null;
    try { _labPPTGenerar(infs, { tema: 'dark', presentador: 'sonda', institucion: 'x' }) }
    catch (e) { err = 'EXC: ' + e.message }
    return new Promise(function(res){
      setTimeout(function(){
        window.PptxGenJS = Orig;
        window._labPptGruposActivos = oGr;
        window.labGetInformes = oG; window.getInformes = oI;
        /* La tabla de valvulopatias es la que tiene «Valvula» en su encabezado. */
        var valv = tablas.filter(function(t){
          return t.length && t[0].length && String(t[0][0]).indexOf('lvula') >= 0 })[0] || null;
        res({ err: err, nTablas: tablas.length, valv: valv,
              pie: textos.filter(function(t){ return t.indexOf('No marcar') >= 0 })[0] || null,
              textos: textos.slice(0, 40) });
      }, 2500);
    }) },

  /* ══ EL PDF DE AUDITORIA, GENERADO DE VERDAD ═════════════════════════════════════════════
     ⚠️ EL ROTULO Y EL VALOR DE UNA FILA SON DOS doc.text DISTINTOS: un espia que registre solo
     el texto deja la fila como un rotulo pelado. Se registran tambien las coordenadas y la fila
     se recompone por su y. Es la trampa que la tanda F documenta. */
  pdfLab(regs) {
    /* labAnalisisPDF() lee labGetInformes y avisa por toast; el generador es
       _labAnalisisPDFReal(infs), que toma la poblacion directo. */
    if (typeof _labAnalisisPDFReal !== 'function') return Promise.resolve('SIN _labAnalisisPDFReal');
    var NS = window.jspdf;
    if (!NS || !NS.jsPDF) return Promise.resolve('SIN jsPDF');
    var infs = regs.map(function(c, i){ return window.__P.reg(c, String(i)) });
    var filas = [];
    var Orig = NS.jsPDF;
    NS.jsPDF = function(){
      var d = new Orig(arguments[0], arguments[1], arguments[2]);
      var ot = d.text.bind(d);
      d.text = function(t, x, y){ try { filas.push({ t: String(t), x: Math.round(x), y: Math.round(y) }) } catch(e) {}
        return ot.apply(d, arguments) };
      d.save = function(){ return d };
      d.output = function(){ return '' };
      return d };
    NS.jsPDF.API = Orig.API;
    var oG = window.labGetInformes, oI = window.getInformes;
    window.labGetInformes = function(){ return infs };
    window.getInformes = function(){ return infs };
    var err = null;
    try { _labAnalisisPDFReal(infs) } catch (e) { err = 'EXC: ' + e.message }
    return new Promise(function(res){
      setTimeout(function(){
        NS.jsPDF = Orig;
        window.labGetInformes = oG; window.getInformes = oI;
        var porY = {};
        filas.forEach(function(f){ var k = f.y; (porY[k] = porY[k] || []).push(f) });
        var lineas = Object.keys(porY).sort(function(a,b){ return a - b }).map(function(k){
          return porY[k].sort(function(a,b){ return a.x - b.x }).map(function(f){ return f.t }).join(' | ') });
        res({ err: err, n: filas.length,
              valv: lineas.filter(function(l){ return /Insuf\\.|Esten\\./.test(l) }),
              nota: lineas.filter(function(l){ return l.indexOf('No marcar') >= 0 })[0] || null,
              lineas: lineas.slice(0, 160) });
      }, 3500);
    }) },

  tema(claro) {
    var r = document.documentElement;
    if (claro) r.classList.add('light-mode'); else r.classList.remove('light-mode');
    return { claro: !!claro, tieneClase: r.classList.contains('light-mode') } },
  color(sel) {
    var e = document.querySelector(sel); if (!e) return 'NO EXISTE ' + sel;
    var cs = getComputedStyle(e);
    return { color: cs.color, display: cs.display, fontSize: cs.fontSize } },

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
    o.fac = window.__P.txt('fac-interp');
    o.ipRef = window.__P.txt('ip-ref-pht');
    o.apdMarca = window.__P.txt('ip_ap_diam-marca');
    return o },

  ppt() {
    if (typeof _pptEnSuma !== 'function') return 'SIN FN';
    try { return String(_pptEnSuma()).replace(/\\s+/g,' ').trim().slice(0, 400) } catch (e) { return 'EXC: ' + e.message } },

  /* El PDF del informe, generado de verdad. Ver la trampa de J() en la tanda F. */
  pdf() {
    var NS = window.jspdf;
    if (!NS || !NS.jsPDF) return Promise.resolve('SIN jsPDF');
    var filas = [];
    var Orig = NS.jsPDF;
    NS.jsPDF = function(){
      var d = new Orig(arguments[0], arguments[1], arguments[2]);
      var ot = d.text.bind(d);
      d.text = function(t, x, y){ try { filas.push({ t: String(t), x: Math.round(x), y: Math.round(y) }) } catch(e) {}
        return ot.apply(d, arguments) };
      d.save = function(){ return d };
      return d };
    NS.jsPDF.API = Orig.API;
    var err = null;
    try { if (typeof _pdfAjustarA4 === 'function') _pdfAjustarA4();
          else if (typeof generarPDF === 'function') generarPDF() } catch (e) { err = 'EXC: ' + e.message }
    return new Promise(function(res){
      setTimeout(function(){
        NS.jsPDF = Orig;
        var porY = {};
        filas.forEach(function(f){ var k = f.y; (porY[k] = porY[k] || []).push(f) });
        var lineas = Object.keys(porY).sort(function(a,b){ return a - b }).map(function(k){
          return porY[k].sort(function(a,b){ return a.x - b.x }).map(function(f){ return f.t }).join(' | ') });
        res({ err: err, n: filas.length,
              vdvi: lineas.filter(function(l){ return l.indexOf('VD/VI') >= 0 }),
              txt: lineas.join(' // ').slice(0, 1600) });
      }, 1600);
    }) }
};
1`;

/* ══ LAS ESCENAS ══════════════════════════════════════════════════════════════════════════════
   El borde del cociente VD/VI se prueba con el valor que cae ENTRE los dos lados: 0,99 / 1,00
   EXACTO / 1,01. El 1,00 cae del lado «no alterada», que es el que deja el operador `>`. */
const VDVI = [
  { k: 'bajo',     num: '0.80', alt: false, sel: 'le1' },
  { k: 'casi',     num: '0.99', alt: false, sel: 'le1' },
  { k: 'exacto',   num: '1',    alt: false, sel: 'le1' },
  { k: 'cruza',    num: '1.01', alt: true,  sel: 'gt1' },
  { k: 'alto',     num: '1.30', alt: true,  sel: 'gt1' }
];
/* Poblacion del Laboratorio para el PPT y la mini-tabla del PDF. Las dos binarias en sus dos
   estados y las SEIS lesiones ajenas cargadas, que son el control negativo: tienen que salir
   identicas a HEAD. */
function poblacionValv() {
  const base = { im_grado: '0', ia_grado: '0', it_grado: '0', ip_grado: 'Sin insuficiencia',
                 ea_grado: 'sin', ep_grado: 'sin' };
  const mk = (o) => Object.assign({}, base, o);
  return [mk({ em_grado: 'severa', et_grado: 'Significativa' }),
          mk({ em_grado: 'leve',   et_grado: 'No significativa' }),
          mk({ em_grado: 'sin',    et_grado: 'sin' }),
          mk({ em_grado: 'severa', et_grado: 'Significativa' }),
          mk({ em_grado: 'severa', et_grado: 'Leve' }),
          mk({ im_grado: '2', ia_grado: '1', it_grado: '4', ea_grado: 'Moderada',
               ip_grado: 'Severa', ep_grado: 'Leve', em_grado: 'leve', et_grado: 'sin' })];
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

  /* ── campos ── La columna 3 con sus SEIS campos, el orden del Tab con TECLAS REALES y la
     maqueta a tres anchos en los dos temas. */
  if (corre('campos')) {
    const g = { abrir: await ev(`window.__P.abrirVD()`) };
    if (!g.abrir || !g.abrir.grid || !g.abrir.grid.ok)
      throw new Error('ABORTA: la grilla del VD no tiene geometria ' + JSON.stringify(g.abrir));
    g.grilla = await ev(`window.__P.grilla()`);
    /* El Tab REAL, con teclas de CDP: se enfoca el primero y se cuentan los saltos. Las areas
       van CARGADAS, porque sin ellas el recorrido cambiaba en HEAD —la casilla de la FAC se
       escondia— y medir un solo recorrido no distinguiria los dos arboles. */
    for (const [k, areas] of [['conAreas', true], ['sinAreas', false]]) {
      await ev(`window.__P.limpiar()`);
      await ev(`window.__P.abrirVD()`);
      if (areas) { await tipear('vd_area_d', '20'); await tipear('vd_area_s', '12'); }
      await ev(`(function(){ var e = document.getElementById('tvia'); e.focus(); return 1 })()`);
      const rec = ['tvia'];
      for (let i = 0; i < 20; i++) {
        await tecla('Tab');
        const id = await ev(`document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null`);
        rec.push(id);
        if (!id || rec.length > 20) break;
      }
      g['tab_' + k] = rec;
    }
    /* Maqueta: tres anchos por dos temas. ABORTA si la clase light-mode no quedo puesta. */
    g.maqueta = {};
    for (const claro of [false, true]) {
      const tema = await ev(`window.__P.tema(${claro})`);
      if (tema.tieneClase !== !!claro) throw new Error('ABORTA: la clase light-mode no quedo puesta');
      for (const w of [1200, 390, 360]) {
        await cdp.send('Emulation.setDeviceMetricsOverride',
          { width: w, height: 1100, deviceScaleFactor: 1, mobile: false }, sessionId);
        await ev(`window.__P.abrirVD()`);
        await ev(`window.__P.despejar()`);
        await pausa(260);
        g.maqueta[(claro ? 'claro' : 'oscuro') + '-' + w] = await ev(`window.__P.maqueta()`);
      }
    }
    await ev(`window.__P.tema(false)`);
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.grupos.campos = g;
  }

  /* ── fac ── La casilla VISIBLE con sus tres ramas de mensaje, y «Nuevo estudio». */
  if (corre('fac')) {
    const g = {};
    await ev(`window.__P.limpiar()`);
    await ev(`window.__P.abrirVD()`);
    const leer = async () => ({ vis: await ev(`window.__P.vis('fg-vd-fac')`),
                                val: await ev(`window.__P.val('vd_fac')`),
                                ph:  await ev(`window.__P.ph('vd_fac')`),
                                fila: await ev(`window.__P.vis('row-fac-interp')`),
                                interp: await ev(`window.__P.txt('fac-interp')`) });
    g.vacio = await leer();
    await tipear('vd_area_d', '20');
    g.soloD = await leer();
    await tipear('vd_area_s', '12');
    g.lasDos = await leer();
    /* ⚠️ vd_fac ES READONLY: NUNCA se le manda una tecla. Se borra el AREA, que si es un
       campo editable, y la sonda lo exige. */
    g.facEsReadonly = await ev(`(function(){ var e = document.getElementById('vd_fac');
      return e ? { readonly: e.hasAttribute('readonly'), tag: e.tagName } : 'NO EXISTE' })()`);
    await tipear('vd_area_s', '');
    g.borradaS = await leer();
    /* Par INVERTIDO: las dos areas estan y el par no es utilizable. */
    await tipear('vd_area_s', '25');
    g.invertido = await leer();
    await tipear('vd_area_s', '12');
    g.repuesto = await leer();
    await ev(`window.__P.limpiar()`);
    await ev(`window.__P.abrirVD()`);
    g.trasLimpiar = await leer();
    out.grupos.fac = g;
  }

  /* ── apd ── El diametro de la arteria pulmonar en su lugar nuevo. */
  if (corre('apd')) {
    const g = {};
    await ev(`window.__P.limpiar()`);
    await ev(`window.__P.abrirVD()`);
    g.donde = await ev(`(function(){
      var e = document.getElementById('ip_ap_diam');
      if (!e) return 'NO EXISTE';
      var fg = e.closest('.fg');
      var gr = e.closest('.vd-grid');
      return { clase: fg ? String(fg.className) : null,
               enVdGrid: !!gr,
               oninput: String(e.getAttribute('oninput') || ''),
               numdec: e.classList.contains('numdec'),
               inputmode: e.getAttribute('inputmode'),
               hermanos: gr ? Array.prototype.slice.call(gr.querySelectorAll('input[id]')).map(function(x){ return x.id }) : null };
    })()`);
    /* La seccion de la insuficiencia pulmonar quedo ordenada: su .grid-2 con DOS hijos y sin
       hueco. Se mide el numero de .fg del grid que contiene el THP. */
    g.seccionIP = await ev(`(function(){
      var t = document.getElementById('ip_pht');
      if (!t) return 'NO EXISTE ip_pht';
      var gr = t.closest('.grid-2');
      if (!gr) return 'SIN .grid-2';
      var fgs = Array.prototype.slice.call(gr.children);
      return { nHijos: fgs.length,
               ids: fgs.map(function(f){ var i = f.querySelector('input[id],select[id]'); return i ? i.id : '?' }),
               reglaCol2: document.documentElement.innerHTML.indexOf('.ip-ap-col2 { grid-column: 2; }') > -1 };
    })()`);
    /* Teclas reales: el valor, la banda y sus dos bordes. */
    const ap = async (x) => { await tipear('ip_ap_diam', x);
      return { val: await ev(`window.__P.val('ip_ap_diam')`),
               marca: await ev(`window.__P.txt('ip_ap_diam-marca')`),
               dueno: await ev(`(typeof ipApDiamVal === 'function') ? ipApDiamVal() : 'SIN FN'`) } };
    g.v22 = await ap('22'); g.v2_5 = await ap('2.5'); g.v5 = await ap('5');
    g.v80 = await ap('80');  g.v120 = await ap('120');
    /* NO VOTA: con los cuatro signos de la IP cargados, el grado sale igual con y sin el. */
    await ev(`window.__P.limpiar()`);
    await ev(`(function(){ ['ip_pht','ip_ancho','ip_senal','ip_reversion'].forEach(function(i){});
      window.__P.set('ip_pht','99'); window.__P.set('ip_ancho','ancho');
      window.__P.set('ip_senal','densa_emp'); return 1 })()`);
    await ev(`(function(){ try { calcIP() } catch(e) {} return 1 })()`);
    g.ipSinApd = { grado: await ev(`window.__P.val('ip_grado')`),
                   ref: await ev(`window.__P.txt('ip-ref-pht')`),
                   inf: await ev(`window.__P.informe('estandar')`) };
    await ev(`window.__P.set('ip_ap_diam','30')`);
    await ev(`(function(){ try { calcIP() } catch(e) {} return 1 })()`);
    g.ipConApd = { grado: await ev(`window.__P.val('ip_grado')`),
                   ref: await ev(`window.__P.txt('ip-ref-pht')`),
                   inf: await ev(`window.__P.informe('estandar')`) };
    /* El Excel y el estudio guardado. */
    g.xls = await ev(`window.__P.excel(${JSON.stringify({ ip_ap_diam: '30' })})`);
    g.mapa = await ev(`window.__P.mapaDe('Di\\u00e1metro arteria pulmonar (mm)')`);
    g.delEstudio = await ev(`(typeof _noEsDelEstudio === 'function') ? _noEsDelEstudio('ip_ap_diam') : 'SIN FN'`);
    g.recolecta = await ev(`(function(){ var c = window.__P.recolectar(); return c.ip_ap_diam || 'AUSENTE' })()`);
    await ev(`window.__P.limpiar()`);
    g.trasLimpiar = { val: await ev(`window.__P.val('ip_ap_diam')`),
                      marca: await ev(`window.__P.txt('ip_ap_diam-marca')`) };
    out.grupos.apd = g;
  }

  /* ── vdvi ── El selector en sus cuatro reglas, y los CUATRO lectores. */
  if (corre('vdvi')) {
    const g = { num: [], sel: [], secuencia: [] };
    /* (a) con NUMERO: el selector muestra el derivado y queda disabled; los cuatro lectores
       tienen que salir IDENTICOS a HEAD. */
    for (const c of VDVI) {
      await ev(`window.__P.limpiar()`);
      await ev(`window.__P.abrirVD()`);
      await tipear('vd_vi', c.num);
      g.num.push({ k: c.k, esperado: c, leido: await ev(`window.__P.vdvi()`),
                   pdf: await ev(`window.__P.pdf()`, 30000),
                   ppt: await ev(`window.__P.ppt()`) });
    }
    /* (b) SIN numero: el medico elige. */
    for (const val of ['', 'le1', 'gt1']) {
      await ev(`window.__P.limpiar()`);
      await ev(`window.__P.abrirVD()`);
      const el = val ? await ev(`window.__P.elegirVdVi(${JSON.stringify(val)})`) : { ok: 'sin elegir' };
      /* ⚠️ UN CLIC QUE NO PROSPERA NO ES UNA MEDICION: sin este aborto, un selector bloqueado
         informa «sin dato» en las tres escenas y se lee como «el selector no hace nada». Asi
         se encontro que limpiarCampos lo dejaba disabled para siempre. */
      if (el && el.err) throw new Error('ABORTA: el selector no acepto «' + val + '»: ' + JSON.stringify(el));
      g.sel.push({ val: val, elegir: el, leido: await ev(`window.__P.vdvi()`),
                   pdf: await ev(`window.__P.pdf()`, 30000),
                   ppt: await ev(`window.__P.ppt()`) });
    }
    /* (c) y (d): escribir un numero pisa la eleccion manual, y borrarlo deja el selector en
       «—» SI lo habia escrito la app, pero respeta la eleccion del medico. */
    await ev(`window.__P.limpiar()`);
    await ev(`window.__P.abrirVD()`);
    g.secuencia.push({ paso: '0 vacio', st: await ev(`window.__P.vdvi()`) });
    g.secuencia.push({ paso: '1 elige gt1', el: await ev(`window.__P.elegirVdVi('gt1')`),
                       st: await ev(`window.__P.vdvi()`) });
    await tipear('vd_vi', '0.8');
    g.secuencia.push({ paso: '2 escribe 0,8 (pisa la eleccion)', st: await ev(`window.__P.vdvi()`) });
    await tipear('vd_vi', '');
    g.secuencia.push({ paso: '3 borra el numero', st: await ev(`window.__P.vdvi()`) });
    g.secuencia.push({ paso: '4 vuelve a elegir le1', el: await ev(`window.__P.elegirVdVi('le1')`),
                       st: await ev(`window.__P.vdvi()`) });
    await tipear('vd_vi', '1.3');
    g.secuencia.push({ paso: '5 escribe 1,3', st: await ev(`window.__P.vdvi()`) });
    await tipear('vd_vi', '');
    g.secuencia.push({ paso: '6 borra el numero otra vez', st: await ev(`window.__P.vdvi()`) });
    /* El selector guardado con el estudio, y «Nuevo estudio». */
    await ev(`window.__P.limpiar()`);
    await ev(`window.__P.abrirVD()`);
    await ev(`window.__P.elegirVdVi('gt1')`);
    g.recolecta = await ev(`(function(){ var c = window.__P.recolectar();
      return { sel: c.vd_vi_sel || 'AUSENTE', num: c.vd_vi || 'AUSENTE' } })()`);
    g.xlsSel = await ev(`window.__P.excel(${JSON.stringify({ vd_vi_sel: 'gt1' })})`);
    g.xlsNum = await ev(`window.__P.excel(${JSON.stringify({ vd_vi: '1.3' })})`);
    await ev(`window.__P.limpiar()`);
    g.trasLimpiar = await ev(`window.__P.vdvi()`);
    /* ⚠️ EL PPT CLINICO NO SE GENERA EN ESTA SONDA, Y HAY QUE DECIR POR QUE. `generarPPT(id)`
       exige un estudio GUARDADO, un informe narrativo ya escrito y DOS modales encadenados —el
       de tema y el de presentador—, asi que medirlo de verdad seria automatizar esa cadena
       entera. Lo que se mide es (a) que su fila LEE AL DUENO, sobre el fuente, y (b) el valor
       que el dueno devuelve, que se mide arriba con teclas reales. La fila del PDF si se genera
       de verdad. Queda declarado en el reporte. */
    g.pptFuente = await ev(`(function(){
      var f = document.documentElement.innerHTML;
      var i = f.indexOf('fila(HEMO, ' + String.fromCharCode(39) + 'VD/VI' + String.fromCharCode(39));
      return { hay: i > -1,
               leeDueno: i > -1 && f.slice(i, i + 320).indexOf('vdViTexto') > -1,
               trozo: i > -1 ? f.slice(i, i + 220).replace(/\\s+/g, ' ') : null };
    })()`);
    /* El dueño sobre un REGISTRO archivado, que es el camino del panel de cohorte. */
    g.deRegistro = {};
    for (const [k, c] of [['numAlto', { vd_vi: '1.3' }], ['numBajo', { vd_vi: '0.8' }],
                          ['selAlto', { vd_vi_sel: 'gt1' }], ['selBajo', { vd_vi_sel: 'le1' }],
                          ['nada', {}],
                          ['numManda', { vd_vi: '0.8', vd_vi_sel: 'gt1' }]])
      g.deRegistro[k] = await ev(`window.__P.vdviDe(${JSON.stringify(c)})`);
    out.grupos.vdvi = g;
  }

  /* ── valv ── El PPT estadistico y la mini-tabla del PDF de auditoria con las dos binarias. */
  if (corre('valv')) {
    const g = {};
    const pob = poblacionValv();
    await ev(`window.__P.despejar()`);
    g.counts = await ev(`window.__P.valvCounts(${JSON.stringify(pob)})`);
    g.tabla  = await ev(`window.__P.tabla(${JSON.stringify(pob)})`, 30000);
    g.ppt    = await ev(`window.__P.pptLab(${JSON.stringify(pob)})`, 45000);
    g.pdf    = await ev(`window.__P.pdfLab(${JSON.stringify(pob)})`, 45000);
    out.grupos.valv = g;
  }

  /* ── import ── Los mensajes de las columnas calculadas y la IDA Y VUELTA del TAPSE/PSAP. */
  if (corre('import')) {
    const g = {};
    /* Un Excel con las CINCO derivadas sin campo mas la PSAP, que SI tiene campo: los dos
       caminos del mensaje en una sola corrida. */
    const H = ['Nombre', 'CI', 'Fecha estudio', 'TAPSE (mm)', 'PSAP (mmHg)',
               'TAPSE/PSAP (mm/mmHg)', 'FAC VD (%)', 'DisfSist_VD', 'DD_I (Grado I)', 'Geom_Normal',
               'Grad VD-AD (mmHg)', 'PmAD (mmHg)', 'VCI diám (mm)', 'Colapso VCI'];
    const F = { 'Nombre': 'Ida y vuelta', 'CI': '77777', 'Fecha estudio': '2026-10-15',
                'TAPSE (mm)': '18', 'PSAP (mmHg)': '50', 'TAPSE/PSAP (mm/mmHg)': '0.36',
                'FAC VD (%)': '40', 'DisfSist_VD': '0', 'DD_I (Grado I)': '0', 'Geom_Normal': '1',
                'Grad VD-AD (mmHg)': '36', 'PmAD (mmHg)': '14',
                'VCI diám (mm)': '22', 'Colapso VCI': '<50' };
    /* El CENSO de las derivadas sin campo: todo lo que `_labExcelRow` emite y que no esta en
       `LAB_XLS_MAP`. Es el conjunto que hoy cae en «no corresponde a un campo editable». */
    g.censo = await ev(`(function(){
      if (typeof _labExcelRow !== 'function' || typeof LAB_XLS_MAP === 'undefined') return 'SIN FN';
      var enMapa = {}; LAB_XLS_MAP.forEach(function(m){ enMapa[m[0]] = 1 });
      var r = _labExcelRow(window.__P.reg({}));
      var der = Object.keys(r).filter(function(k){ return !enMapa[k] });
      var conCampo = LAB_XLS_MAP.filter(function(m){
        return (typeof _labXlsEsCalculado === 'function') && _labXlsEsCalculado(m[1]) }).map(function(m){ return m[0] });
      return { nTotal: Object.keys(r).length, nDerivadasSinCampo: der.length, derivadas: der,
               nConCampo: conCampo.length, conCampo: conCampo };
    })()`);
    g.mensajes = await ev(`window.__P.importar(${JSON.stringify(H)}, ${JSON.stringify(F)})`, 25000);
    /* ══ IDA Y VUELTA DE VERDAD ══════════════════════════════════════════════════════════
       Se exporta la fila COMPLETA de un estudio —las 438 columnas, las mismas que escribe el
       exportador— y se la reimporta tal cual. Lo que se compara es el cociente recalculado
       contra el que trae el archivo. Con una escena de catorce columnas no alcanzaria: podria
       faltar un dato por la escena y no por el Excel. */
    g.idaVuelta = await ev(`(function(){
      if (typeof _labExcelRow !== 'function') return Promise.resolve('SIN FN');
      var r = _labExcelRow(window.__P.reg(${JSON.stringify({ tapse: '18', vmax_it: '3.0',
        vci_diam: '22', vci_col: '<50', psap_calc: '50', pmad: '14' })}));
      var H = Object.keys(r);
      var F = {}; H.forEach(function(h){ F[h] = (r[h] === null || r[h] === undefined) ? '' : r[h] });
      F['Nombre'] = 'Ida y vuelta completa'; F['CI'] = '99999'; F['Fecha estudio'] = '2026-10-15';
      return window.__P.importar(H, F);
    })()`, 40000);
    /* El mismo A/B con TODOS los encabezados. */
    const EST = { tapse: '18', vmax_it: '3.0', vci_diam: '22', vci_col: '<50',
                  psap_calc: '50', pmad: '14', nombre: 'Vuelta' };
    g.filaIda = await ev(`window.__P.excel(${JSON.stringify(EST)})`);
    g.vuelta = await ev(`(function(){
      if (typeof _labExcelRow !== 'function') return 'SIN FN';
      var r = _labExcelRow(window.__P.reg(${JSON.stringify(EST)}));
      /* Lo que viaja al Excel de los INSUMOS del cociente: el TAPSE si, la velocidad de la IT
         hay que buscarla, la PmAD y la VCI tambien. Esto es lo que decide si la ida y vuelta
         puede reproducir el valor. */
      var cols = Object.keys(r);
      var buscar = function(re){ return cols.filter(function(c){ return re.test(c) }) };
      return { tapse: r['TAPSE (mm)'], psap: r['PSAP (mmHg)'], tpsp: r['TAPSE/PSAP (mm/mmHg)'],
               gradVdAd: r['Grad VD-AD (mmHg)'], pmad: r['PmAD (mmHg)'],
               vciD: r['VCI diám (mm)'], vciCol: r['Colapso VCI'],
               colsVrt: buscar(/VRT|Vmax IT|V\\. m[aá]x IT|velocidad.*IT/i),
               colsIT: buscar(/IT/),
               mapaVrt: window.__P.mapaDe('Vmax IT (m/s)'),
               mapaTapse: window.__P.mapaDe('TAPSE (mm)'),
               mapaPsap: window.__P.mapaDe('PSAP (mmHg)'),
               mapaPmad: window.__P.mapaDe('PmAD (mmHg)'),
               mapaVciD: window.__P.mapaDe('VCI diám (mm)') };
    })()`);
    out.grupos.import = g;
  }

  /* ── controles ── Nada de lo que esta tanda no toca puede moverse. */
  if (corre('controles')) {
    const g = {};
    await ev(`window.__P.limpiar()`);
    await ev(`window.__P.despejar()`);
    g.vacio = { grados: await ev(`window.__P.grados()`),
                inf: await ev(`window.__P.informe('estandar')`),
                xls: await ev(`(function(){ return window.__P.excel(window.__P.recolectar()) })()`),
                fila: await ev(`(function(){ return window.__P.excelFila(window.__P.recolectar()) })()`) };
    /* Escenario CARGADO: sin denominador, «0 diferencias» no prueba nada. SIN los campos que
       esta tanda toca —el selector y el diametro—, para que el control sea del resto. */
    const ESC = { fevi: '45', ddfvi: '58', dsfvi: '42', siv: '13', ppvi: '12', peso: '80', talla: '172',
                  edad: '68', sexo: 'M', tapse: '18', s_prime: '10', vd_bas: '38', vd_vi: '1.3',
                  vd_pared: '7', vd_tei: '0.62', vd_area_d: '20', vd_area_s: '12',
                  tsvd_diametro: '20', vti_tsvd: '20', fevd: '40',
                  onda_e: '95', onda_a: '45', e_sep: '5', e_lat: '7', ai_vol: '90', tde: '150',
                  vmax_it: '3.2', vci_diam: '22', vci_col: '<50',
                  im_vmax: '5.5', im_itv: '140', pisa_r: '6', pisa_val: '40',
                  ia_vc: '7', ia_pht: '220', it_vc: '8', vmax_ao: '4.2', gmedio_ao: '45',
                  avm_plan: '1.2', em_gmedio: '12', ip_ancho: 'ancho', ip_pht: '99',
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

  /* ── captura ── PNG de la columna 3 del VD en los dos temas. */
  if (corre('captura')) {
    const g = {};
    for (const claro of [false, true]) {
      const tema = await ev(`window.__P.tema(${claro})`);
      if (tema.tieneClase !== !!claro) throw new Error('ABORTA: la clase light-mode no quedo puesta');
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: 1200, height: 1200, deviceScaleFactor: 1, mobile: false }, sessionId);
      await ev(`window.__P.limpiar()`);
      await ev(`window.__P.abrirVD()`);
      await ev(`window.__P.set('vd_area_d','20')`);
      await ev(`window.__P.set('ip_ap_diam','26')`);
      await ev(`window.__P.set('vd_vi','1.3')`);
      await ev(`(function(){ try { calcVD() } catch(e) {} var n = document.querySelector('.vd-grid');
        if (n && n.scrollIntoView) n.scrollIntoView({ block: 'center' }); return 1 })()`);
      await ev(`window.__P.despejar()`);
      await pausa(500);
      const geo = await ev(`window.__P.geo('vd_fac')`);
      if (!geo || !geo.ok) throw new Error('ABORTA: la casilla de la FAC sin geometria ' + JSON.stringify(geo));
      const k = claro ? 'claro' : 'oscuro';
      g[k] = { geo: geo, ph: await ev(`window.__P.ph('vd_fac')`),
               colorMarca: await ev(`window.__P.color('#ip_ap_diam-marca')`), tema };
      if (DEST) {
        const png = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
        const nom = 'g3-vd-' + k + '.png';
        await writeFile(join(DEST, nom), Buffer.from(png.data, 'base64'));
        g[k].png = nom;
        g[k].pngMd5 = createHash('md5').update(Buffer.from(png.data, 'base64')).digest('hex');
      }
    }
    await ev(`window.__P.tema(false)`);
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.grupos.captura = g;
  }


  out.avisoFin = await ev(`window.__P.despejar()`);
  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close(); } catch (e) {}
  try { srv.close(); } catch (e) {}
  process.exit(0);
}

main().catch((e) => { console.error('[_probe_g3] ' + ((e && e.stack) || e)); process.exit(1); });
