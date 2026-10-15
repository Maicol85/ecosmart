#!/usr/bin/env node
/**
 * _probe_z.mjs - sonda A/B de SOLO LECTURA para la tanda «Z» (2026-10-15):
 *   (Z1) PROTESIS MITRAL: los tres parametros de la Tabla 11 y el veredicto de obstruccion.
 *   (Z2) PPM AORTICO al informe y al EN SUMA; las columnas «PPM aortico» y «Vmax IT (m/s)».
 *   (Z3) ESTENOSIS AORTICA: el borrado en todos los ordenes y gestos, y las filas con su grado.
 *   (Z4) TAPSE/PSAP: la linea de dos estados, la tarjeta y como usa TEP el cociente.
 *
 * Infraestructura calcada de scripts/_probe_g3.mjs (teclas y clics reales, cierre del arbol de
 * Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su denominador, md5 al
 * principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_z.mjs --file /tmp/index.HEAD.html > /tmp/z.HEAD.json
 *   node scripts/_probe_z.mjs                             > /tmp/z.NEW.json
 *
 * Grupos (--solo prot|ppm|excel|eaborra|eafilas|tpsp|tarjeta|tep|controles|captura):
 *   prot      - los tres parametros de la Tabla 11 en sus tramos y el veredicto R.obstr.
 *   ppm       - el PPM aortico en pantalla, en el informe y en el EN SUMA, con los dos IMC.
 *   excel     - el conteo de columnas, las dos nuevas y la IDA Y VUELTA del TAPSE/PSAP.
 *   eaborra   - las escenas de borrado del medico, en todos los ordenes y los dos gestos.
 *   eafilas   - las filas del cuadro de la aortica con su grado y la de planimetria.
 *   tpsp      - la fila del Doppler tricuspideo en sus bordes.
 *   tarjeta   - la tarjeta del globo, su texto, sus cuatro cierres y su maqueta.
 *   tep       - como usa TEP el cociente: score, criterios, interpretacion y riesgo.
 *   controles - informe (tres estilos), EN SUMA, grados y pastillas, diastolica, HFA-PEFF.
 *   captura   - PNG de la tarjeta y del cuadro de la aortica en los dos temas (con --dest).
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-z-'));
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
  html(id){ var e = document.getElementById(id); return e ? (e.innerHTML || '').trim() : null },
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
  sel(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    var hay = Array.prototype.slice.call(e.options || []).map(function(o){ return o.value });
    if (hay.indexOf(valor) < 0) return { err: 'NO HAY OPCION ' + valor, hay: hay };
    e.value = valor;
    e.dispatchEvent(new Event('change', { bubbles: true }));
    if (e.value !== valor) return { err: 'NO QUEDO', valor: e.value };
    return { ok: true } },

  despejar() {
    var o = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (!m) { o[id] = 'NO EXISTE'; return; }
      o[id] = getComputedStyle(m).display;
      if (o[id] !== 'none') { m.style.display = 'none'; o[id] += ' -> none'; }
    });
    return o },

  tema(claro) {
    var r = document.documentElement;
    if (claro) r.classList.add('light-mode'); else r.classList.remove('light-mode');
    return { claro: r.classList.contains('light-mode') } },

  color(sel) {
    var e = (typeof sel === 'string' && sel.charAt(0) === '#')
      ? document.getElementById(sel.slice(1)) : document.querySelector(sel);
    if (!e) return 'NO EXISTE ' + sel;
    return getComputedStyle(e).color },

  /* ══ ABRIR LAS PUERTAS ════════════════════════════════════════════════════════════════════
     Lo que esta en display:none no tiene geometria: sin abrir, se tipea en la nada y todas las
     escenas salen «sin cambios», indistinguible de «el cableado no funciona». */
  abrirValv() {
    var o = {};
    try { showTab('valvulas'); o.tab = 'ok' } catch (e) { o.tab = 'EXC: ' + e.message }
    [['valv-esten-aortica','caja-esten-aortica'],
     ['valv-insuf-mitral','caja-insuf-mitral'],
     ['valv-esten-mitral','caja-esten-mitral']].forEach(function(p){
      try { var c = document.getElementById(p[1]);
        if (c && getComputedStyle(c).display === 'none' && typeof valvDatosTog === 'function')
          valvDatosTog(p[1]);
        o[p[1]] = c ? getComputedStyle(c).display : 'NO EXISTE';
      } catch (e) { o[p[1]] = 'EXC: ' + e.message } });
    return o },

  abrirDoppler() {
    var o = {};
    try { showTab('doppler'); o.tab = 'ok' } catch (e) { o.tab = 'EXC: ' + e.message }
    /* ⚠️ EL DOPPLER TRICUSPIDEO NO ES UN sacc- Y NO SE ABRE CON secToggle: es una .card con
       toggleCard('dop-tricusp') y su cuerpo nace en display:none. Sin abrirlo, la fila del
       cociente y su globo EXISTEN y miden 0x0. */
    try { var b = document.getElementById('dop-tricusp');
      if (b && getComputedStyle(b).display === 'none' && typeof toggleCard === 'function')
        toggleCard('dop-tricusp');
      o.tricusp = b ? getComputedStyle(b).display : 'NO EXISTE';
    } catch (e) { o.tricusp = 'EXC: ' + e.message }
    return o },

  abrirDatos() {
    var o = {};
    try { showTab('datos'); o.tab = 'ok' } catch (e) { o.tab = 'EXC: ' + e.message }
    return o },

  /* ══ Z1 — PROTESIS MITRAL ════════════════════════════════════════════════════════════════
     Se lee el OBJETO del dueño, no el HTML: la capsula pinta y el informe lee este objeto, asi
     que medir solo el texto dejaria pasar un veredicto que cambia sin que el texto lo diga. */
  prot() {
    if (typeof vmProtEOA !== 'function') return 'SIN FN';
    try { var R = vmProtEOA();
      return { esProt: R.esProt, eoa: R.eoa, dvi: R.dvi, obstr: R.obstr,
               porEoa: R.porEoa, porDvi: R.porDvi,
               vmax: R.vmax, gmed: R.gmed, thp: R.thp,
               porVmax: R.porVmax, porGmed: R.porGmed, porThp: R.porThp,
               ppm: R.ppm, eoaI: R.eoaI, valido: R.valido, motivo: R.motivo };
    } catch (e) { return 'EXC: ' + e.message } },

  /* ══ Z2 — PPM AORTICO ════════════════════════════════════════════════════════════════════ */
  protAo() {
    if (typeof eaProtVeredicto !== 'function') return 'SIN FN';
    try { var P = eaProtVeredicto();
      if (!P) return { nulo: true };
      return { via: P.via, nivel: P.nivel, ppm: P.ppm, avai: P.avai, imc: P.imc };
    } catch (e) { return 'EXC: ' + e.message } },

  /* ══ Z3 — EL CUADRO DE LA ESTENOSIS AORTICA ══════════════════════════════════════════════
     Las filas con su valor Y su grado hermano, el renglon integrado y el grado del select, en
     una sola lectura: sin el estado de la FILA al lado del veredicto, una linea que no cambia
     se lee como un corte que no funciona. */
  eaCuadro() {
    var fila = function(id) {
      var v = document.getElementById(id);
      var g = document.querySelector('[data-grado-de="' + id + '"]');
      var row = v ? v.closest('.calc-row') : null;
      return { val: v ? (v.textContent || '').trim() : 'NO EXISTE',
               grado: g ? (g.textContent || '').trim() : 'SIN SPAN',
               vis: row ? (getComputedStyle(row).display !== 'none') : null } };
    return {
      gmax:   fila('ea-det-gmax'),
      gmedio: fila('ea-det-gmedio'),
      ava:    fila('ea-det-ava'),
      avai:   fila('ea-det-avai'),
      plan:   fila('ea-det-plan'),
      dvi:    fila('ea-det-dvi'),
      sev:    window.__P.txt('ea-det-sev'),
      badge:  window.__P.txt('ea-ava-badge'),
      grado:  window.__P.val('ea_grado'),
      sugerido: (function(){ var s = document.getElementById('ea_grado');
        return s ? (s.dataset.sugerido || '') : 'NO EXISTE' })(),
      pastilla: window.__P.pill('aortica','esten'),
      avaCont: window.__P.val('ava_cont'),
      avaDisp: window.__P.val('ea_ava_display'),
      dviDisp: window.__P.val('ea_dvi_display'),
      calc: (function(){ if (typeof eaGradoCalculado !== 'function') return 'SIN FN';
        try { var R = eaGradoCalculado();
          return { grado: R.grado, criterio: R.criterio, gVel: R.gVel, gGrad: R.gGrad,
                   gAva: R.gAva, gDvi: R.gDvi, gPlan: R.gPlan, gAvai: R.gAvai,
                   dvi: R.dvi, plan: R.plan, avai: R.avai };
        } catch (e) { return 'EXC: ' + e.message } })() } },

  /* ══ Z4 — LA FILA DEL TAPSE/PSAP Y LA PANTALLA DE TEP ════════════════════════════════════ */
  tpsp() {
    return { filaVis: window.__P.vis('row-tapse-psap'),
             fila: window.__P.txt('tapse-psap-interp'),
             tapse: window.__P.val('tapse'), psap: window.__P.val('psap_calc'),
             crudo: (typeof vdTapsePsap === 'function') ? vdTapsePsap() : 'SIN FN',
             red: (typeof vdTapsePsapRed === 'function') ? vdTapsePsapRed() : 'SIN FN' } },

  tep() {
    return { tpsp: window.__P.txt('tep-tapse-psap'),
             acopl: window.__P.txt('tep-acoplamiento'),
             score: window.__P.txt('tep-score'),
             interp: window.__P.txt('tep-interpretacion'),
             estrat: window.__P.txt('tep-estratificacion'),
             vdvi: window.__P.txt('tep-vdvi-interp'),
             tapseI: window.__P.txt('tep-tapse-interp'),
             psapI: window.__P.txt('tep-psap-interp') } },

  /* ══ LA TARJETA DEL GLOBO ⓘ ══════════════════════════════════════════════════════════════ */
  tarjeta(clave) {
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    var c = document.getElementById('vinfo-card');
    var abierta = !!(c && getComputedStyle(c).display !== 'none');
    var t = abierta ? (c.textContent || '').replace(/\\s+/g, ' ').trim() : null;
    var r = c ? c.getBoundingClientRect() : null;
    var rb = b ? b.getBoundingClientRect() : null;
    return { hayBoton: !!b,
             tag: b ? b.tagName : null,
             title: b ? (b.getAttribute('title') || '') : null,
             onclick: b ? String(b.getAttribute('onclick') || '') : null,
             expanded: b ? b.getAttribute('aria-expanded') : null,
             abierta: abierta, texto: t,
             nLineas: abierta ? c.querySelectorAll('[data-vinfo-b]').length : 0,
             bloques: abierta ? Array.prototype.slice.call(c.querySelectorAll('[data-vinfo-b]'))
                 .map(function(e){ return e.getAttribute('data-vinfo-b') }) : [],
             acentos: t ? (t.match(/[a-zA-Z\\u00e0-\\u00ff]*[\\u00e1\\u00e9\\u00ed\\u00f3\\u00fa\\u00f1\\u00c1\\u00c9\\u00cd\\u00d3\\u00da\\u00d1][a-zA-Z\\u00e0-\\u00ff]*/g) || []).length : 0,
             caja: r ? { x: Math.round(r.left), y: Math.round(r.top),
                         w: Math.round(r.width), h: Math.round(r.height),
                         dentro: r.left >= -1 && r.top >= -1 &&
                                 r.right <= window.innerWidth + 1 &&
                                 r.bottom <= window.innerHeight + 1 } : null,
             botonAlcanzable: (function(){
               if (!rb || rb.width === 0) return 'SIN GEOMETRIA';
               var x = Math.round(rb.left + rb.width/2), y = Math.round(rb.top + rb.height/2);
               if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return 'FUERA';
               var el = document.elementFromPoint(x, y);
               return !!(el && (el === b || b.contains(el))) })() } },

  clicVinfo(clave) {
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { err: 'NO EXISTE globo ' + clave };
    var r = b.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return { err: 'SIN GEOMETRIA ' + clave };
    b.click();
    return { ok: true } },

  cerrarAfuera() {
    document.body.click();
    return { abierta: (function(){ var c = document.getElementById('vinfo-card');
      return !!(c && getComputedStyle(c).display !== 'none') })() } },

  /* ══ SUPERFICIES ═════════════════════════════════════════════════════════════════════════
     ⚠️ EL ESTILO DEL INFORME ES ESTADO DE SESION: se fija en cada escena. */
  informe(estilo) {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(estilo || 'estandar') } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) { return 'EXC: ' + e.message }
    return { inf: window.__P.val('informe_texto'), suma: window.__P.val('en_suma') } },

  grados() {
    var o = {};
    ['im_grado','ia_grado','it_grado','ip_grado','em_grado','ea_grado','et_grado','ep_grado']
      .forEach(function(id){ o[id] = window.__P.val(id) });
    [['mitral','insuf'],['mitral','esten'],['aortica','insuf'],['aortica','esten'],
     ['tricuspide','insuf'],['tricuspide','esten'],['pulmonar','insuf'],['pulmonar','esten']]
      .forEach(function(p){ o['pill:' + p[0] + ':' + p[1]] = window.__P.pill(p[0], p[1]) });
    o.diast = window.__P.txt('dd-interp');
    o.hfapeff = window.__P.txt('hfapeff-eco');
    return o },

  reg(campos, nombre) {
    return { id: 'P' + (nombre || 'x'), nombre: 'P ' + (nombre || 'x'), ci: '1',
             fecha_estudio: '2026-10-15', campos: campos || {} } },

  /* La fila del Excel de un estudio ARCHIVADO, clave por clave. */
  excelFila(campos) {
    if (typeof _labExcelRow !== 'function') return 'SIN FN';
    try { var r = _labExcelRow(window.__P.reg(campos)); var o = {};
      Object.keys(r).forEach(function(k){ o[k] = (r[k] === null || r[k] === undefined) ? null : String(r[k]) });
      return o } catch (e) { return 'EXC: ' + e.message } },

  /* La fila del Excel del FORMULARIO abierto: es el camino del backup de un estudio recien
     cargado, y el unico que prueba la ida y vuelta de verdad. */
  excelDOM() {
    if (typeof _labExcelRow !== 'function' || typeof guardarInforme !== 'function') return 'SIN FN';
    try {
      var c = {};
      document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
        if (e.type === 'checkbox' || e.type === 'radio') c[e.id + '__chk'] = e.checked ? '1' : '0';
        else c[e.id] = e.value;
      });
      var r = _labExcelRow(window.__P.reg(c)); var o = {};
      Object.keys(r).forEach(function(k){ o[k] = (r[k] === null || r[k] === undefined) ? null : String(r[k]) });
      return { cols: Object.keys(r).length, fila: o };
    } catch (e) { return 'EXC: ' + e.message } },

  colsOrden() {
    if (typeof _labExcelRow !== 'function' || typeof _labOrdenarCols !== 'function') return 'SIN FN';
    try { var c = _labOrdenarCols(Object.keys(_labExcelRow({ id:0, campos:{} })));
      return { n: c.length, cols: c } } catch (e) { return 'EXC: ' + e.message } },

  bloqueDe(nombre) {
    try { return (typeof _labXlsBloqueDe === 'function') ? _labXlsBloqueDe(nombre) : 'SIN FN' }
    catch (e) { return 'EXC' } },

  mapaDe(nombre) {
    if (typeof LAB_XLS_MAP === 'undefined') return 'SIN MAP';
    var m = LAB_XLS_MAP.filter(function(x){ return x[0] === nombre })[0];
    if (!m) return { enMapa: false };
    return { enMapa: true, dest: m[1], tipo: m[2],
             calculada: (typeof _labXlsEsCalculado === 'function') ? _labXlsEsCalculado(m[1]) : 'SIN FN' } },

  assertXls() {
    var o = {};
    try { o.bloques = (typeof _labXlsAssertBloques === 'function') ? _labXlsAssertBloques() : 'SIN FN' } catch (e) { o.bloques = 'EXC' }
    try { o.listas = (typeof _labXlsAssertListas === 'function') ? _labXlsAssertListas() : 'SIN FN' } catch (e) { o.listas = 'EXC' }
    try { o.mapa = (typeof _labXlsAssertMapa === 'function') ? _labXlsAssertMapa() : 'SIN FN' } catch (e) { o.mapa = 'EXC' }
    return o },

  /* ══ EL IMPORTADOR, EJECUTADO DE VERDAD ══════════════════════════════════════════════════
     Se lee el MODAL que labImpRender pinta: _labImpDatos es una let DE MODULO y
     window._labImpDatos da undefined SIEMPRE. */
  importar(headers, fila) {
    if (typeof XLSX === 'undefined') return Promise.resolve('SIN XLSX');
    if (typeof labImportarXLSX !== 'function') return Promise.resolve('SIN FN');
    var ws = XLSX.utils.aoa_to_sheet([headers, headers.map(function(h){
      return Object.prototype.hasOwnProperty.call(fila, h) ? fila[h] : '' })]);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estudios');
    var buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    var f = new File([buf], 'z.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
          res({ hay: lleno, txt: txt ? txt.slice(0, 14000) : null,
                errs: errs.slice(0, 4), toasts: toasts.slice(0, 4) });
        }
      }, 150);
    }) },

  /* ══ ABRIDOR DE PUERTAS GENERICO ══
     ⚠️ CABLEAR LA PESTANA DE CADA CAMPO ES UNA LISTA QUE SE DESACTUALIZA. Esto sube por el DOM
     hasta la .tab-section que contiene al campo, la activa por su propio id, y de paso abre
     cualquier ancestro que haya quedado en display:none. Devuelve el rect para que el llamador
     pueda ABORTAR si la puerta no se abrio, en vez de informar «sin cambios» sobre un tecleo
     que nunca ocurrio. */
  abrirPara(id) {
    var e = document.getElementById(id);
    if (!e) return { ok: false, por: 'NO EXISTE ' + id };
    var sec = e.closest ? e.closest('.tab-section') : null;
    var tab = sec ? String(sec.id || '').replace(/^tab-/, '') : null;
    if (tab) { try { showTab(tab) } catch(x) {} }
    var n = e.parentNode, abiertos = [];
    while (n && n.nodeType === 1 && n !== document.body) {
      if (getComputedStyle(n).display === 'none') {
        n.style.display = ''; abiertos.push(n.id || n.className);
      }
      n = n.parentNode;
    }
    var r = window.__P.geo(id);
    return { ok: !!(r && r.ok), tab: tab, abiertos: abiertos, rect: r } },

  /* ══ LA IDA Y VUELTA DE VERDAD ═══════════════════════════════════════════════════════════
     ⚠️ EL MODAL DEL IMPORTADOR NO ES LA IDA Y VUELTA. Ese panel es una PREVISUALIZACION sobre la
     fila cruda, antes de que el estudio se abra: ahi la PmAD no existe todavia porque la app la
     deriva de la VCI AL ABRIR. Lo que hay que medir es si, con el estudio ya abierto, la PSAP y
     el cociente dan el MISMO valor que antes de exportar.
     Se construye el objeto campos con lo que el importador CONSERVA —su propio mapa, menos lo
     que _labXlsEsCalculado aparta— y se abre por la ruta real de restauracion. */
  camposImportados(fila) {
    if (typeof LAB_XLS_MAP === 'undefined') return 'SIN MAP';
    var c = {}, descartadas = [];
    LAB_XLS_MAP.forEach(function(m){
      var v = fila[m[0]];
      if (v === undefined || v === null || v === '') return;
      if (typeof _labXlsEsCalculado === 'function' && _labXlsEsCalculado(m[1])) {
        descartadas.push(m[0]); return; }
      c[m[1]] = String(v);
    });
    return { campos: c, descartadas: descartadas } },

  abrirComoEstudio(campos) {
    var inf = window.__P.reg(campos, 'iv');
    var oG = window.getInformes, oL = window.labGetInformes;
    window.getInformes = function(){ return [inf] };
    window.labGetInformes = function(){ return [inf] };
    var err = null;
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true); } catch (e) {}
    try { editarInforme(inf.id) } catch (e) { err = 'EXC: ' + e.message }
    var ok = document.getElementById('edit-ok');
    if (!ok) { window.getInformes = oG; window.labGetInformes = oL;
               return { err: err || 'NO APARECIO EL BOTON edit-ok' } }
    ok.click();
    window.getInformes = oG; window.labGetInformes = oL;
    return { ok: true, err: err } },

  nuevo() {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true); return 'ok' }
    catch (e) { return 'EXC: ' + e.message } }
};
1;
`;

/* ══ Escenas ═════════════════════════════════════════════════════════════════════════════════
   La del medico, textual: Ø TSVI 20, VTI TSVI 20, VTI Ao 56. Da AVA 1,12 cm2 (moderada) y
   DVI 0,357 (moderado), asi que el renglon integrado dice «Moderada — por ...». */
const EA_BASE = { diam_tsvi: '20', itv_tsvi: '20', itv_ao: '56' };
const EA_TRES = ['diam_tsvi', 'itv_tsvi', 'itv_ao'];
/* Los seis ordenes de borrado de los tres campos. */
function permutaciones(a) {
  if (a.length <= 1) return [a];
  const out = [];
  a.forEach((x, i) => permutaciones(a.slice(0, i).concat(a.slice(i + 1)))
    .forEach((r) => out.push([x].concat(r))));
  return out;
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
     SIGUIENTE, o sea en la linea equivocada. */
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
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, Space: 32, Escape: 27 };
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
  /* ⚠️ UN TECLEO QUE NO QUEDA NO ES UNA MEDICION: se ABORTA nombrando el campo. */
  async function foco(id) {
    let g = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    /* Una puerta cerrada no es un campo que no existe: se abre y se vuelve a medir. */
    if (!g || g.err || !g.ok) {
      const a = await ev(`window.__P.abrirPara(${JSON.stringify(id)})`);
      g = a && a.rect;
      if (!a || !a.ok) throw new Error('SIN GEOMETRIA ' + id + ' ' + JSON.stringify(a));
    }
    const ro = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      return !!(e.readOnly || e.disabled) })()`);
    if (ro) throw new Error('CAMPO DE SOLO LECTURA, no se le manda una tecla: ' + id);
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)}); e.focus();
      e.setSelectionRange ? e.setSelectionRange(0, (e.value||'').length) : 0; return 1 })()`);
    const f = await ev(`document.activeElement ? document.activeElement.id : null`);
    if (f !== id) throw new Error('EL FOCO NO LLEGO a ' + id + ', esta en ' + f);
  }
  async function tipear(id, texto) {
    await foco(id);
    for (let i = 0; i < 24; i++) await tecla('Backspace');
    if (String(texto).length) await cdp.send('Input.insertText', { text: String(texto) }, sessionId);
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      e.dispatchEvent(new Event('input', { bubbles: true })); return 1 })()`);
    const leido = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(leido) !== String(texto)) throw new Error('EL TECLEO NO QUEDO en ' + id + ': ' + leido);
    return leido;
  }
  /* ⚠️ LOS DOS GESTOS DE BORRADO DAN RESULTADOS DISTINTOS Y HAY QUE MEDIR LOS DOS: digito por
     digito, el paso intermedio recalcula con un valor truncado; seleccionando todo y borrando
     de una, el campo pasa de su valor a vacio en un solo evento. */
  async function borrarDigitos(id) {
    await foco(id);
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      e.setSelectionRange ? e.setSelectionRange((e.value||'').length, (e.value||'').length) : 0; return 1 })()`);
    const n = String(await ev(`window.__P.val(${JSON.stringify(id)})`) || '').length;
    for (let i = 0; i < n; i++) {
      await tecla('Backspace');
      await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
        e.dispatchEvent(new Event('input', { bubbles: true })); return 1 })()`);
    }
    const q = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(q) !== '') throw new Error('EL BORRADO DIGITO A DIGITO NO QUEDO en ' + id + ': ' + q);
  }
  async function borrarSeleccion(id) {
    await foco(id);
    await tecla('Backspace');
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      e.dispatchEvent(new Event('input', { bubbles: true })); return 1 })()`);
    const q = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(q) !== '') throw new Error('EL BORRADO POR SELECCION NO QUEDO en ' + id + ': ' + q);
  }
  async function viewport(w, h) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: h || 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  }

  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2800);
  await evCrudo(SONDA);

  const avisoIni = await ev(`window.__P.despejar()`);
  const out = { file: FARG, md5Ini, avisoIni, grupos: {} };
  const SOLOG = (arg('--solo') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const corre = (g) => !SOLOG.length || SOLOG.indexOf(g) >= 0;

  /* ── Z3 · eaborra ── El borrado de la estenosis aortica, en los SEIS ordenes y los DOS gestos.
     Denominador: la escena base TIENE que producir un renglon integrado con criterio. */
  if (corre('eaborra')) {
    const g = { abrir: await ev(`window.__P.abrirValv()`) };
    const cargar = async () => {
      for (const id of EA_TRES) await tipear(id, EA_BASE[id]);
      return ev(`window.__P.eaCuadro()`);
    };
    await ev(`window.__P.nuevo()`);
    g.base = await cargar();
    /* DENOMINADOR: la escena base tiene que producir un veredicto. Se exige que el renglon
       diga algo —no «—» y no vacio— y NO que nombre un criterio: el sufijo «— por X» nace en la
       tanda F, asi que exigirlo aqui aborta contra un arbol anterior y eso no prueba nada. */
    if (!g.base || !g.base.sev || g.base.sev === '\u2014' || g.base.sev.length < 4)
      throw new Error('DENOMINADOR: la escena base no produce veredicto: ' + JSON.stringify(g.base && g.base.sev));
    g.baseNombraCriterio = g.base.sev.indexOf('por') >= 0;
    g.ordenes = {};
    for (const gesto of ['digitos', 'seleccion']) {
      for (const orden of permutaciones(EA_TRES)) {
        const k = gesto + ':' + orden.join('>');
        await ev(`window.__P.nuevo()`);
        for (const id of EA_TRES) await tipear(id, EA_BASE[id]);
        const pasos = [];
        for (const id of orden) {
          if (gesto === 'digitos') await borrarDigitos(id); else await borrarSeleccion(id);
          const c = await ev(`window.__P.eaCuadro()`);
          pasos.push({ borrado: id, sev: c.sev, grado: c.grado, badge: (c.badge || '').slice(0, 70),
                       ava: c.ava.val, dvi: c.dvi.val, gmedio: c.gmedio.val,
                       avaCont: c.avaCont, pastilla: c.pastilla, calc: c.calc });
        }
        const inf = await ev(`window.__P.informe('estandar')`);
        g.ordenes[k] = { pasos: pasos, inf: (inf.inf || '').indexOf('EAo') >= 0 ||
                           (inf.inf || '').indexOf('estenosis') >= 0 ? 'nombra estenosis' : 'callada',
                         suma: inf.suma };
      }
    }
    /* Los otros tres insumos que la orden pide: Vmax, gradiente medio y AVA por planimetria. */
    g.otros = {};
    for (const id of ['vmax_ao', 'gmedio_ao', 'ava_plan']) {
      await ev(`window.__P.nuevo()`);
      const val = id === 'vmax_ao' ? '4.5' : (id === 'gmedio_ao' ? '45' : '0.8');
      await tipear(id, val);
      const antes = await ev(`window.__P.eaCuadro()`);
      await borrarSeleccion(id);
      const desp = await ev(`window.__P.eaCuadro()`);
      const inf = await ev(`window.__P.informe('estandar')`);
      g.otros[id] = { antes: { sev: antes.sev, grado: antes.grado },
                      desp: { sev: desp.sev, grado: desp.grado, badge: (desp.badge || '').slice(0, 70),
                              pastilla: desp.pastilla },
                      suma: inf.suma };
    }
    /* CONTROL NEGATIVO: un grado fijado A MANO se respeta al borrar. */
    await ev(`window.__P.nuevo()`);
    await tipear('vmax_ao', '4.5');
    const fij = await ev(`window.__P.sel('ea_grado','severa')`);
    await borrarSeleccion('vmax_ao');
    g.manual = { fijar: fij, cuadro: await ev(`window.__P.eaCuadro()`) };
    out.grupos.eaborra = g;
  }

  /* ── Z3(d) · eafilas ── Las filas con su grado y la de planimetria. */
  if (corre('eafilas')) {
    const g = { abrir: await ev(`window.__P.abrirValv()`) };
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirDatos()`);
    await tipear('peso', '70'); await tipear('talla', '170');
    await ev(`window.__P.abrirValv()`);
    for (const id of EA_TRES) await tipear(id, EA_BASE[id]);
    await tipear('gmedio_ao', '30');
    await tipear('ava_plan', '0.9');
    g.cargado = await ev(`window.__P.eaCuadro()`);
    /* Los bordes de cada criterio, para que el grado impreso se pueda comparar con el corte. */
    g.bordes = {};
    for (const [id, vals] of [['gmedio_ao', ['19', '20', '39', '40']],
                              ['ava_plan', ['0.9', '1.0', '1.4', '1.5']]]) {
      for (const v of vals) {
        await tipear(id, v);
        const c = await ev(`window.__P.eaCuadro()`);
        g.bordes[id + '=' + v] = { gmedio: c.gmedio, plan: c.plan, calc: c.calc };
      }
      await tipear(id, id === 'gmedio_ao' ? '30' : '0.9');
    }
    out.grupos.eafilas = g;
  }

  /* ── Z1 · prot ── Los tres parametros de la Tabla 11 en sus tramos y el veredicto R.obstr.
     ⚠️ DENOMINADOR: la morfologia tiene que quedar PROTESICA. Sin eso `vmProtEOA` devuelve
     esProt:false y las doce escenas informan el mismo objeto vacio, que se lee igual que «los
     tres parametros no votan». */
  if (corre('prot')) {
    const g = {};
    await ev(`window.__P.nuevo()`);
    await tipear('peso', '70'); await tipear('talla', '170');
    g.opciones = await ev(`(function(){ var e = document.getElementById('vm_morf');
      return e ? Array.prototype.slice.call(e.options).map(function(o){ return o.value }) : null })()`);
    const prot = (g.opciones || []).filter((o) => /tesis/i.test(o))[0];
    if (!prot) throw new Error('DENOMINADOR: no hay opcion protesica en vm_morf: ' + JSON.stringify(g.opciones));
    g.morf = await ev(`window.__P.sel('vm_morf', ${JSON.stringify(prot)})`);
    /* Los tres insumos de la continuidad, para que el AEO y el DVI existan y el veredicto tenga
       de donde salir: sin ellos R.obstr es null por falta de datos y no por la regla. */
    await tipear('em_dtsvi', '20'); await tipear('em_vtitsvi', '20'); await tipear('em_vtimit', '18');
    g.base = await ev(`window.__P.prot()`);
    if (!g.base || g.base.esProt !== true)
      throw new Error('DENOMINADOR: la morfologia no quedo protesica: ' + JSON.stringify(g.base));
    /* Los tres parametros de la Tabla 11, cada uno por sus tramos: abajo, en el corte y arriba. */
    g.t11 = {};
    for (const [id, vals] of [['em_vmax', ['1.8', '1.9', '2.4', '2.5', '3.0']],
                              ['em_gmedio', ['4', '5', '6', '10', '11']],
                              ['thp', ['120', '129', '130', '200', '201']]]) {
      for (const v of vals) {
        await tipear(id, v);
        g.t11[id + '=' + v] = await ev(`window.__P.prot()`);
      }
      await tipear(id, '');
    }
    /* LOS TRES EN «significativa» A LA VEZ: es la escena que fija si votan o no. */
    await tipear('em_vmax', '3.0'); await tipear('em_gmedio', '11'); await tipear('thp', '201');
    g.tresSignif = await ev(`window.__P.prot()`);
    g.tresSignifInf = await ev(`window.__P.informe('estandar')`);
    /* CONTROL NEGATIVO: la valvula NATIVA no tiene veredicto protesico. */
    await ev(`window.__P.sel('vm_morf','Normal')`);
    g.nativa = { prot: await ev(`window.__P.prot()`), inf: await ev(`window.__P.informe('estandar')`) };
    out.grupos.prot = g;
  }

  /* ── Z2 · ppm ── El PPM aortico en pantalla, en el informe y en el EN SUMA, con los dos IMC.
     ⚠️ EL AVA INDEXADA SALE DE `ava-idx`, QUE SE PINTA DESDE `calcAo`: hay que cargar los tres
     insumos de la continuidad Y el peso y la talla, o la fila queda muda y las seis escenas
     informan «sin PPM» sobre una cascada que funciona. */
  if (corre('ppm')) {
    const g = {};
    await ev(`window.__P.nuevo()`);
    g.opciones = await ev(`(function(){ var e = document.getElementById('va_morf');
      return e ? Array.prototype.slice.call(e.options).map(function(o){ return o.value }) : null })()`);
    const protAo = (g.opciones || []).filter((o) => /tesis/i.test(o) && !/TAVI/i.test(o))[0];
    if (!protAo) throw new Error('DENOMINADOR: no hay opcion protesica en va_morf: ' + JSON.stringify(g.opciones));
    g.escenas = {};
    /* BSA de Mosteller = raiz(peso*talla/3600). Con 70/170 da 1,819; con 95/170 da 2,119 y el
       IMC pasa de 24,2 a 32,9, o sea las DOS ramas de la Tabla 7 sobre pacientes plausibles. */
    for (const [eti, peso, talla, vtiMit] of [
        ['imc24/severo', '70', '170', '63'], ['imc24/moderado', '70', '170', '52'],
        ['imc24/sin',    '70', '170', '38'],
        ['imc33/severo', '95', '170', '72'], ['imc33/moderado', '95', '170', '58'],
        ['imc33/sin',    '95', '170', '40']]) {
      await ev(`window.__P.nuevo()`);
      await tipear('peso', peso); await tipear('talla', talla);
      await ev(`window.__P.sel('va_morf', ${JSON.stringify(protAo)})`);
      await tipear('diam_tsvi', '20'); await tipear('itv_tsvi', '20'); await tipear('itv_ao', vtiMit);
      const r = { pantalla: await ev(`window.__P.txt('ea-prot-ppm')`),
                  filaVis: await ev(`window.__P.vis('ea-prot-ppm-row')`),
                  prot: await ev(`window.__P.protAo()`),
                  avaIdx: await ev(`window.__P.txt('ava-idx')`),
                  imc: await ev(`(typeof getIMC === 'function') ? getIMC() : null`) };
      for (const est of ['estandar', 'narrativo', 'conciso'])
        r['inf:' + est] = await ev(`window.__P.informe('${est}')`);
      r.excel = await ev(`window.__P.excelDOM()`);
      g.escenas[eti] = r;
    }
    /* CONTROL NEGATIVO: valvula NATIVA con el mismo AVA indexada severa — no hay PPM que escribir. */
    await ev(`window.__P.nuevo()`);
    await tipear('peso', '70'); await tipear('talla', '170');
    await ev(`window.__P.sel('va_morf','Trivalva normal')`);
    await tipear('diam_tsvi', '20'); await tipear('itv_tsvi', '20'); await tipear('itv_ao', '63');
    g.nativa = { pantalla: await ev(`window.__P.txt('ea-prot-ppm')`),
                 filaVis: await ev(`window.__P.vis('ea-prot-ppm-row')`),
                 avaIdx: await ev(`window.__P.txt('ava-idx')`),
                 inf: await ev(`window.__P.informe('estandar')`),
                 excel: await ev(`window.__P.excelDOM()`) };
    out.grupos.ppm = g;
  }

  /* ── Z4 · tpsp ── La fila del Doppler tricuspideo en sus bordes. */
  if (corre('tpsp')) {
    const g = { abrir: await ev(`window.__P.abrirDoppler()`) };
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirDoppler()`);
    g.sinDatos = await ev(`window.__P.tpsp()`);
    /* La PSAP no sale solo de la Vmax: es 4*VRT^2 + PmAD, y sin el diametro y el colapso de la
       VCI queda VACIA — la fila diria «—» y se leeria como «el cociente no funciona». */
    await tipear('vmax_it', '2.8');
    await ev(`window.__P.sel('vci_col','>50')`);
    await tipear('vci_diam', '18');
    g.psap = await ev(`window.__P.tpsp()`);
    g.bordes = {};
    /* Con la PSAP fija, el TAPSE elige el cociente. PSAP = 4*2.8^2 + 3 = 34. */
    for (const t of ['18', '18.5', '18.7', '18.8', '19']) {
      await tipear('tapse', t);
      g.bordes['tapse=' + t] = await ev(`window.__P.tpsp()`);
    }
    await tipear('tapse', '');
    g.sinTapse = await ev(`window.__P.tpsp()`);
    out.grupos.tpsp = g;
  }

  /* ── Z4 · tarjeta ── El globo, su texto, sus cuatro cierres y su maqueta. */
  if (corre('tarjeta')) {
    const g = { abrir: await ev(`window.__P.abrirDoppler()`) };
    g.cerrada = await ev(`window.__P.tarjeta('tapse-psap')`);
    g.abrir1 = await ev(`window.__P.clicVinfo('tapse-psap')`);
    g.abierta = await ev(`window.__P.tarjeta('tapse-psap')`);
    await ev(`window.__P.clicVinfo('tapse-psap')`);
    g.segundoToque = await ev(`window.__P.tarjeta('tapse-psap')`);
    await ev(`window.__P.clicVinfo('tapse-psap')`);
    await tecla('Escape');
    g.escape = await ev(`window.__P.tarjeta('tapse-psap')`);
    await ev(`window.__P.clicVinfo('tapse-psap')`);
    g.afuera = await ev(`window.__P.cerrarAfuera()`);
    g.maqueta = {};
    for (const [w, h] of [[1200, 900], [390, 800], [360, 780]]) {
      for (const claro of [false, true]) {
        await viewport(w, h);
        const tema = await ev(`window.__P.tema(${claro})`);
        if (!!tema.claro !== claro) throw new Error('EL TEMA NO QUEDO: ' + JSON.stringify(tema));
        await ev(`window.__P.abrirDoppler()`);
        await ev(`window.__P.despejar()`);
        await ev(`window.__P.clicVinfo('tapse-psap')`);
        g.maqueta[w + 'px/' + (claro ? 'claro' : 'oscuro')] = await ev(`window.__P.tarjeta('tapse-psap')`);
        await tecla('Escape');
      }
    }
    await viewport(1400, 1000);
    await ev(`window.__P.tema(false)`);
    out.grupos.tarjeta = g;
  }

  /* ── Z4(3) · tep ── Como usa TEP el cociente: score, criterios, interpretacion y RIESGO.
     ⚠️ EL DENOMINADOR ES EL SCORE: con los tres signos SIN EVALUAR, `calcTEP` sale por su rama
     de «completa los criterios» y el riesgo queda en «—», asi que cruzar el 0,32 no mueve nada
     y la tabla diria que el corte no participa de ningun veredicto — que es justo lo contrario
     de lo que hay que medir. Se fijan los tres signos y se dejan DOS criterios positivos. */
  if (corre('tep')) {
    const g = {};
    /* El censo del fuente: cuantas veces suma al score y si el 0,32 entra en el riesgo. */
    g.fuente = await ev(`(function(){ var s = String(calcTEP);
      var i = s.indexOf('1. TAPSE/PSAP'), j = s.indexOf('2. VD/VI');
      var bloque = (i >= 0 && j > i) ? s.slice(i, j) : '';
      return { scoreTotal: (s.match(/score\\+\\+/g)||[]).length,
               criteriosTotal: (s.match(/criterios\\.push/g)||[]).length,
               scoreEnBloqueTPSP: (bloque.match(/score\\+\\+/g)||[]).length,
               criteriosEnBloqueTPSP: (bloque.match(/criterios\\.push/g)||[]).length,
               enInterpretacion: s.indexOf('interpEl') >= 0 && /interpEl[\\s\\S]{0,900}desacoplado/.test(s),
               enRiesgo: s.indexOf('score >= 2 && desacoplado') >= 0,
               corte: (s.match(/tapsePsapVal <= ([0-9.]+)/) || [])[1] || null } })()`);
    await ev(`window.__P.nuevo()`);
    /* PSAP = 4 x 3,4^2 + PmAD(15) = 61 mmHg. Dos criterios positivos: PSAP > 35 y VD/VI >= 0,9.
       El TAPSE queda POR ENCIMA de 17, asi que NO suma: lo unico que mueve es el cociente. */
    await tipear('vmax_it', '3.4');
    await ev(`window.__P.sel('vci_col','<50')`);
    await tipear('vci_diam', '23');
    await tipear('tep_vdvi', '1.0');
    for (const [id, v] of [['tep_mcconnell','no'],['tep_signo6060','no'],['tep_tabique_d','no']])
      g['sel:' + id] = await ev(`window.__P.sel('${id}','${v}')`);
    g.escenas = {};
    for (const t of ['19', '19.5', '19.52', '20', '21']) {
      await tipear('tapse', t);
      await ev(`window.__P.abrirPara('tep-score')`);
      const r = await ev(`window.__P.tep()`);
      r.psap = await ev(`window.__P.val('psap_calc')`);
      r.cociente = await ev(`(typeof vdTapsePsapRed === 'function') ? vdTapsePsapRed() : null`);
      g.escenas['tapse=' + t] = r;
    }
    /* ⚠️ EL ROTULO CON EL CORTE VIAJA AL PDF DE TEP: `tep-acoplamiento` esta en la lista que el
       armador recorre, asi que no es solo pantalla. */
    g.enPdf = await ev(`(function(){ var s = document.documentElement.innerHTML;
      return { acoplamiento: s.indexOf("'tep-acoplamiento'") >= 0,
               tapsePsap: s.indexOf("'tep-tapse-psap'") >= 0 } })()`);
    out.grupos.tep = g;
  }

  /* ── Z2 · excel ── El conteo de columnas, las dos nuevas y la IDA Y VUELTA del cociente. */
  if (corre('excel')) {
    const g = { assert: await ev(`window.__P.assertXls()`) };
    g.orden = await ev(`window.__P.colsOrden()`);
    g.n = g.orden && g.orden.n;
    g.vmaxIt = { mapa: await ev(`window.__P.mapaDe('Vmax IT (m/s)')`),
                 bloque: await ev(`window.__P.bloqueDe('Vmax IT (m/s)')`),
                 idx: g.orden && g.orden.cols ? g.orden.cols.indexOf('Vmax IT (m/s)') : null };
    g.ppmAo  = { mapa: await ev(`window.__P.mapaDe('PPM aórtico')`),
                 bloque: await ev(`window.__P.bloqueDe('PPM aórtico')`),
                 idx: g.orden && g.orden.cols ? g.orden.cols.indexOf('PPM aórtico') : null };
    /* Los vecinos y no un indice cableado: el indice se mueve con cada columna que entre. */
    g.vecinos = {};
    if (g.orden && g.orden.cols) {
      ['VC IT (mm)', 'Vmax IT (m/s)', 'ET grado', 'PPM aórtico', 'AVA (cm²)',
       'PSAP (mmHg)', 'TAPSE/PSAP (mm/mmHg)'].forEach((c) => {
        const i = g.orden.cols.indexOf(c);
        g.vecinos[c] = i < 0 ? null : { i, antes: g.orden.cols[i - 1] || null, desp: g.orden.cols[i + 1] || null };
      });
      g.cols = g.orden.cols;
      delete g.orden.cols;
    }

    /* ══ LA IDA Y VUELTA, CON UN ESTUDIO CARGADO CON TECLAS REALES ═══════════════════════════
       Se carga TAPSE + velocidad de la IT + VCI, se exporta la fila COMPLETA, y se reimporta
       ESA MISMA fila. Lo que se compara es si la PSAP y el cociente RECALCULADOS dan el mismo
       valor, que es lo que el G3 midio que NO se reproducia. */
    await ev(`window.__P.nuevo()`);
    await tipear('tapse', '18');
    await tipear('vmax_it', '2.8');
    await ev(`window.__P.sel('vci_col','>50')`);
    await tipear('vci_diam', '18');
    g.ida = { tapse: await ev(`window.__P.val('tapse')`),
              vmaxIt: await ev(`window.__P.val('vmax_it')`),
              psap: await ev(`window.__P.val('psap_calc')`),
              pmad: await ev(`window.__P.val('pmad')`),
              tpsp: await ev(`window.__P.tpsp()`) };
    if (g.ida.psap === null || g.ida.psap === '')
      throw new Error('DENOMINADOR: la PSAP quedo vacia, la ida y vuelta no mide nada: ' + JSON.stringify(g.ida));
    const fila = await ev(`window.__P.excelDOM()`);
    g.ida.cols = fila.cols;
    g.ida.celdas = { 'Vmax IT (m/s)': fila.fila['Vmax IT (m/s)'],
                     'TAPSE (mm)': fila.fila['TAPSE (mm)'],
                     'VCI diám (mm)': fila.fila['VCI diám (mm)'],
                     'Colapso VCI': fila.fila['Colapso VCI'],
                     'PmAD (mmHg)': fila.fila['PmAD (mmHg)'],
                     'PSAP (mmHg)': fila.fila['PSAP (mmHg)'],
                     'TAPSE/PSAP (mm/mmHg)': fila.fila['TAPSE/PSAP (mm/mmHg)'] };
    /* La fila COMPLETA de vuelta por el importador de verdad. */
    const heads = g.cols;
    const valores = {};
    heads.forEach((h) => { const v = fila.fila[h]; if (v !== null && v !== '') valores[h] = v; });
    g.vuelta = await ev(`window.__P.importar(${JSON.stringify(heads)}, ${JSON.stringify(valores)})`, 30000);
    /* ⚠️ Y EL RECALCULO DE VERDAD: se le pregunta a los MISMOS dueños sobre los campos que el
       importador dejaria, no al texto del modal. */
    g.recalc = await ev(`(function(){
      var c = {};
      ${JSON.stringify(heads)}.forEach(function(){});
      return 1 })()`);
    /* Un Excel VIEJO (438, sin las dos nuevas) tiene que entrar sin error. */
    const viejas = heads.filter((h) => h !== 'Vmax IT (m/s)' && h !== 'PPM aórtico');
    const valViejos = {}; viejas.forEach((h) => { const v = fila.fila[h]; if (v !== null && v !== '') valViejos[h] = v; });
    g.excelViejo = await ev(`window.__P.importar(${JSON.stringify(viejas)}, ${JSON.stringify(valViejos)})`, 30000);
    g.excelViejoN = viejas.length;
    /* ══ LA IDA Y VUELTA, CON EL ESTUDIO YA ABIERTO ═══════════════════════════════════════════ */
    g.ci = await ev(`window.__P.camposImportados(${JSON.stringify(fila.fila)})`);
    g.abrir = await ev(`window.__P.abrirComoEstudio(${JSON.stringify(g.ci.campos || {})})`, 25000);
    await pausa(600);
    g.vueltaReal = { tapse: await ev(`window.__P.val('tapse')`),
                     vmaxIt: await ev(`window.__P.val('vmax_it')`),
                     vciDiam: await ev(`window.__P.val('vci_diam')`),
                     vciCol: await ev(`window.__P.val('vci_col')`),
                     pmad: await ev(`window.__P.val('pmad')`),
                     psap: await ev(`window.__P.val('psap_calc')`),
                     tpsp: await ev(`window.__P.tpsp()`) };
    g.reproduce = { psap: g.ida.psap === g.vueltaReal.psap,
                    cociente: g.ida.tpsp.red === g.vueltaReal.tpsp.red,
                    fila: g.ida.tpsp.fila === g.vueltaReal.tpsp.fila };
    out.grupos.excel = g;
  }

  /* ── controles ── Informe, EN SUMA, grados y pastillas con un escenario CARGADO. */
  if (corre('controles')) {
    const g = {};
    await ev(`window.__P.nuevo()`);
    g.vacio = { grados: await ev(`window.__P.grados()`) };
    for (const est of ['estandar', 'narrativo', 'conciso'])
      g.vacio['inf:' + est] = await ev(`window.__P.informe('${est}')`);
    /* Escenario CARGADO: sin denominador, «0 diferencias» no prueba nada. */
    await ev(`window.__P.abrirDatos()`);
    await tipear('peso', '70'); await tipear('talla', '170');
    await ev(`window.__P.abrirValv()`);
    for (const id of EA_TRES) await tipear(id, EA_BASE[id]);
    await tipear('vmax_ao', '4.2');
    await tipear('gmedio_ao', '45');
    await ev(`window.__P.abrirDoppler()`);
    await tipear('vmax_it', '3.0');
    await ev(`window.__P.sel('vci_col','<50')`);
    await tipear('vci_diam', '22');
    await tipear('tapse', '15');
    g.cargado = { grados: await ev(`window.__P.grados()`),
                  tpsp: await ev(`window.__P.tpsp()`),
                  cuadro: await ev(`window.__P.eaCuadro()`) };
    for (const est of ['estandar', 'narrativo', 'conciso'])
      g.cargado['inf:' + est] = await ev(`window.__P.informe('${est}')`);
    g.cargado.excel = await ev(`window.__P.excelDOM()`);
    out.grupos.controles = g;
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  if (out.md5Fin !== out.md5Ini) out.AVISO = 'EL ARCHIVO SE MOVIO DURANTE LA CORRIDA';
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close() } catch (e) {}
  try { srv.close() } catch (e) {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO: ' + e.message); process.exit(1); });
