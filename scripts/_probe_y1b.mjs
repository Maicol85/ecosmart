#!/usr/bin/env node
/**
 * _probe_y1b.mjs - sonda A/B de SOLO LECTURA para las tandas «Y1b» y «Y2» (2026-10-16).
 *   Y1b: el boton con el estilo de una pestana en reposo, el panel como tarjeta flotante
 *        centrada y el interior compacto, medidos a seis anchos y en los dos temas.
 *   Y2 : el «porque» de cada tarjeta — los criterios que la PANTALLA publica, su valor, su
 *        grado y cual decide.
 *
 * Infraestructura calcada de scripts/_probe_y1.mjs (teclas y clics reales, cierre del arbol de
 * Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su denominador, md5 al
 * principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_y1b.mjs --file /tmp/index.HEAD.html > /tmp/y1b.HEAD.json
 *   node scripts/_probe_y1b.mjs                             > /tmp/y1b.NEW.json
 *
 * Grupos (--solo estilo|maqueta|censo|dvi|controles|porque|captura):
 *   estilo    - el boton y una pestana de valvula en reposo, con su color REAL en los dos temas.
 *   maqueta   - el panel abierto a 1200x700, 1440x800, 1920x1080, 768, 390 y 360 px.
 *   censo     - lo que la pantalla de Valvulas publica por lesion: filas, grados e integradas.
 *   dvi       - el control de solo lectura del DVI aortico protesico.
 *   controles - informe (tres estilos), EN SUMA, Excel, grados y capsula protesica.
 *   porque    - la linea «Decide», el boton «Ver criterios» y la lista, tarjeta por tarjeta.
 *   captura   - PNG de la vista en las escenas representativas.
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
               ppm: R.ppm, eoaI: R.eoaI, valido: R.valido, motivo: R.motivo,
               obstrPos: R.obstrPos || null, obstrMed: R.obstrMed || null };
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

  /* ⚠️ SE LLEVA EL BOTON AL VIEWPORT ANTES DE CLICKEAR. El cuadro del Doppler tricuspideo esta
     abajo de una pagina larga: sin esto el boton tiene tamaño pero su centro cae fuera de la
     pantalla, y la medicion de «el globo sigue alcanzable» informa FUERA sobre un globo que el
     medico ve perfectamente. Es un denominador del medidor, no del arbol. */
  clicVinfo(clave) {
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { err: 'NO EXISTE globo ' + clave };
    var r = b.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return { err: 'SIN GEOMETRIA ' + clave };
    if (r.top < 0 || r.bottom > window.innerHeight) {
      b.scrollIntoView({ block: 'center' });
      r = b.getBoundingClientRect();
    }
    b.click();
    return { ok: true, y: Math.round(r.top) } },

  /* El color REAL del badge de la fila, resuelto, no la variable: lo que se ve es el span de
     adentro y no el contenedor, que hereda el color del texto normal. */
  colorBadge() {
    var e = document.querySelector('#tapse-psap-interp .badge');
    if (!e) return 'SIN BADGE';
    return { color: getComputedStyle(e).color, bg: getComputedStyle(e).backgroundColor,
             cls: String(e.className || '') } },

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

  /* ══ Z5 — LA CAPSULA DE LA PROTESIS MITRAL ══════════════════════════════════════════════
     Las seis filas con su texto, para poder leer el veredicto Y el estado de cada criterio en
     la misma lectura: sin el estado de la fila al lado del veredicto, una linea que no cambia
     se lee como un criterio que no vota. */
  caps() {
    var t = function(id){ var e = document.getElementById(id);
      return e ? (e.textContent || '').trim() : 'NO EXISTE' };
    var caja = document.getElementById('bloque-prot-vm-res');
    return { vis: caja ? (getComputedStyle(caja).display !== 'none') : null,
             vmax: t('vm-prot-vmax'), gmed: t('vm-prot-gmed'), eoa: t('vm-prot-eoa'),
             dvi: t('vm-prot-dvi'), thp: t('vm-prot-thp'), ppm: t('vm-prot-ppm'),
             veredicto: t('vm-prot-obstr'),
             veredictoVis: (function(){ var r = document.getElementById('vm-prot-obstr');
               var row = r ? r.closest('.calc-row') : null;
               return row ? (getComputedStyle(row).display !== 'none') : null })() } },

  /* ⚠️ im_grado ES UN input type=hidden Y NO UN select: sel() busca e.options y devuelve un
     error, asi que las cuatro escenas de regurgitacion midieron el MISMO grado. El gesto real
     del medico es el menu de la pastilla, cuyo onchange llama a valvSev.aplicar: se invoca al
     MISMO dueño, que es el que pone la marca de manual y la foto del calculado. Escribir el
     value a mano las dejaria sin poner y la escena mediria otra cosa. */
  setSev(tipo, valv, valor) {
    try { if (typeof valvSev !== 'object' || !valvSev) return 'SIN valvSev';
      valvSev.aplicar(tipo, valv, valor);
      if (typeof calcIM_ESC === 'function') { try { calcIM_ESC() } catch (e) {} }
      if (typeof vmProtEOAPintar === 'function') { try { vmProtEOAPintar() } catch (e) {} }
      return { ok: true, im_grado: window.__P.val('im_grado') };
    } catch (e) { return 'EXC: ' + e.message } },

  /* Las DOS filas del PPM, mitral y aortica, con su visibilidad. */
  ppmFilas() {
    var f = function(id, rowId){ var e = document.getElementById(id);
      var row = rowId ? document.getElementById(rowId) : (e ? e.closest('.calc-row') : null);
      return { txt: e ? (e.textContent || '').trim() : 'NO EXISTE',
               vis: row ? (getComputedStyle(row).display !== 'none') : null } };
    return { mitral: f('vm-prot-ppm', null), aortica: f('ea-prot-ppm', 'ea-prot-ppm-row') } },

  nuevo() {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true); return 'ok' }
    catch (e) { return 'EXC: ' + e.message } },

  /* ══ LA VISTA 2D ══════════════════════════════════════════════════════════════════════ */
  v2dBoton() {
    var b = document.getElementById('v2d-abrir');
    if (!b) return { hay: false };
    var r = b.getBoundingClientRect(), cs = getComputedStyle(b);
    var n = b, oculto = false;
    while (n && n.nodeType === 1) { if (getComputedStyle(n).display === 'none') { oculto = true; break } n = n.parentNode }
    return { hay: true, w: Math.round(r.width), h: Math.round(r.height), oculto: oculto,
             txt: (b.textContent || '').trim(), mod: b.getAttribute('data-mod'),
             clase: String(b.className || ''), minh: cs.minHeight } },

  v2dAbrierto() {
    var o = document.getElementById('v2d-ov');
    return !!(o && getComputedStyle(o).display !== 'none') },

  v2dAbrir() {
    try { showTab('valvulas') } catch (e) {}
    var b = document.getElementById('v2d-abrir');
    if (!b) return { err: 'NO EXISTE el boton' };
    var r = b.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return { err: 'SIN GEOMETRIA el boton' };
    b.click();
    return { ok: window.__P.v2dAbrierto(), foco: document.activeElement ? document.activeElement.id : null } },

  v2dCerrarBoton() {
    var b = document.getElementById('v2d-cerrar');
    if (!b) return { err: 'NO EXISTE el boton de cerrar' };
    b.click();
    return { abierto: window.__P.v2dAbrierto(),
             foco: document.activeElement ? document.activeElement.id : null } },

  v2dCerrarAfuera() {
    var o = document.getElementById('v2d-ov');
    if (!o) return { err: 'NO EXISTE el overlay' };
    o.click();
    return { abierto: window.__P.v2dAbrierto() } },

  /* ⚠️ EL CUADRO DE ANIMACION SE MIDE ESPIANDO, no preguntandole a una bandera: lo que la
     orden pide es que NO corra nada con la vista cerrada, y una bandera puede mentir. Se
     cuentan los requestAnimationFrame que la pagina pide en una ventana de tiempo. */
  v2dEspiaRaf() {
    if (window.__rafEspia) return 'YA';
    window.__rafN = 0;
    var o = window.requestAnimationFrame;
    window.requestAnimationFrame = function(cb){ window.__rafN++; return o.call(window, cb) };
    window.__rafEspia = true;
    return 'ok' },
  v2dRafReset() { window.__rafN = 0; return 0 },
  v2dRafN() { return window.__rafN },
  v2dCorriendo() { try { return typeof v2dCorriendo === 'function' ? v2dCorriendo() : 'SIN FN' }
    catch (e) { return 'EXC' } },

  v2dEstado() {
    try { return typeof v2dEstado === 'function' ? v2dEstado() : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },

  /* Las tarjetas y la tabla, como el medico las ve. */
  v2dTarjetas() {
    var lee = function(id){
      var ul = document.getElementById(id);
      if (!ul) return 'NO EXISTE';
      return Array.prototype.slice.call(ul.children).map(function(li){
        var chip = li.querySelector('.v2d-chip');
        return { txt: (li.textContent || '').replace(/\\s+/g, ' ').trim(),
                 vacio: li.className.indexOf('v2d-vacio') > -1,
                 chip: chip ? (chip.textContent || '').trim() : null,
                 chipCls: chip ? String(chip.className || '') : null,
                 chipColor: chip ? getComputedStyle(chip).backgroundColor : null } }) };
    return { insuf: lee('v2d-insuf'), esten: lee('v2d-esten') } },

  v2dCav() {
    var h = document.getElementById('v2d-cav-tabla');
    if (!h) return 'NO EXISTE';
    var t = h.querySelector('table');
    if (!t) return { tabla: false, txt: (h.textContent || '').trim() };
    return { tabla: true, filas: Array.prototype.slice.call(t.querySelectorAll('tbody tr'))
      .map(function(tr){ return Array.prototype.slice.call(tr.children)
        .map(function(td){ return (td.textContent || '').trim() }) }) } },

  /* La maqueta: sin scroll horizontal y con el dibujo dentro de su caja. */
  v2dMaqueta() {
    var ov = document.getElementById('v2d-ov'), card = document.getElementById('v2d-card');
    var cu = document.getElementById('v2d-cuerpo'), svg = document.getElementById('v2d-svg');
    var g = document.getElementById('v2d-grid');
    if (!ov || !card || !svg || !g) return { err: 'FALTAN NODOS' };
    var rs = svg.getBoundingClientRect(), rc = card.getBoundingClientRect();
    var cols = getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length;
    return { vw: window.innerWidth,
             scrollH: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
             cuerpoScrollH: cu ? (cu.scrollWidth > cu.clientWidth + 1) : null,
             cols: cols,
             svgW: Math.round(rs.width), svgH: Math.round(rs.height),
             cardW: Math.round(rc.width),
             svgDentro: rs.left >= rc.left - 1 && rs.right <= rc.right + 1,
             fase: (document.getElementById('v2d-fase1') || {}).textContent } },

  /* El color REAL de las variables del dibujo, resuelto en el tema que este puesto. */
  v2dColores() {
    var cs = getComputedStyle(document.documentElement), o = {};
    ['--v2d-myo1','--v2d-myo2','--v2d-myoline','--v2d-bl1','--v2d-bl2','--v2d-br1','--v2d-br2',
     '--v2d-stroke','--v2d-leaf','--v2d-leafstroke','--v2d-jetder','--v2d-jetao','--v2d-names',
     '--v2d-sys','--v2d-dia','--v2d-pcuff','--v2d-pmetal','--v2d-pmetalhi','--v2d-bcuff',
     '--v2d-brod','--v2d-brodhi'].forEach(function(v){ o[v] = cs.getPropertyValue(v).trim() });
    var out = document.getElementById('v2d-out');
    var cl = document.getElementById('v2d-cl');
    o._outFill = out ? getComputedStyle(out).fill : null;
    o._clStroke = cl ? getComputedStyle(cl).stroke : null;
    o._nombre = (function(){ var n = document.getElementById('v2d-n-vi');
      return n ? getComputedStyle(n).fill : null })();
    return o },

  /* Lo que el dibujo dibujo de verdad: las valvas, las protesis y los chorros con su opacidad. */
  v2dDibujo() {
    var g = document.getElementById('v2d-valves'), j = document.getElementById('v2d-jets');
    var out = document.getElementById('v2d-out');
    return { valvas: g ? g.querySelectorAll('.v2d-leaf').length : 0,
             valvasVis: g ? Array.prototype.slice.call(g.querySelectorAll('.v2d-leaf'))
               .filter(function(e){ return e.getAttribute('display') !== 'none' }).length : 0,
             protVis: g ? Array.prototype.slice.call(g.parentNode.querySelectorAll('.v2d-cuff'))
               .filter(function(e){ var p = e.parentNode;
                 return p && p.getAttribute('display') !== 'none' }).length : 0,
             bio: g ? Array.prototype.slice.call(g.parentNode.querySelectorAll('.v2d-cuff.v2d-bio'))
               .filter(function(e){ var p = e.parentNode;
                 return p && p.getAttribute('display') !== 'none' }).length : 0,
             patrones: g ? Array.prototype.slice.call(g.querySelectorAll('.v2d-leafpat'))
               .map(function(e){ return e.getAttribute('fill') }).filter(function(f){ return f && f !== 'none' }) : [],
             chorros: j ? Array.prototype.slice.call(j.children)
               .map(function(e){ return { op: e.getAttribute('opacity'),
                                          tr: e.getAttribute('transform') } }) : [],
             outD: out ? String(out.getAttribute('d') || '').length : 0,
             viewBox: (document.getElementById('v2d-svg') || {}).getAttribute
               ? document.getElementById('v2d-svg').getAttribute('viewBox') : null } },

  /* El origen de cada chorro, para la correccion del Y1-4. */
  v2dFase(p) { try { return typeof v2dFase === 'function' ? v2dFase(p) : 'SIN FN' }
    catch (e) { return 'EXC' } },

  v2dJorg() {
    try { return { jorg: window.V2D_JORG || 'SIN CONST', joff: window.V2D_JOFF || 'SIN CONST' } }
    catch (e) { return 'EXC' } },

  /* ══ Y1b/Y2 — MEDICION DE ESTILO Y TAMANO ════════════════════════════════════════════════
     Cada nodo con su caja, su tipografia y sus colores REALES resueltos. Lo que se compara entre
     el boton y una pestana en reposo son estos valores, no el nombre de una clase. */
  caja(sel) {
    /* ⚠️ SIEMPRE querySelector: con getElementById, un selector compuesto como
       «#v2d-cav table» devuelve null y la medicion informa «NO EXISTE» sobre una tabla que si
       esta dibujada. Pasó en la primera corrida, con la tabla y la celda a la vez. */
    var e = null;
    try { e = document.querySelector(sel) } catch (x) { e = null }
    if (!e) return { err: 'NO EXISTE ' + sel };
    var cs = getComputedStyle(e), r = e.getBoundingClientRect();
    return { w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
             x: Math.round(r.left), y: Math.round(r.top),
             bottom: Math.round(r.bottom), right: Math.round(r.right),
             fs: cs.fontSize, fw: cs.fontWeight, pad: cs.padding,
             bg: cs.backgroundColor, color: cs.color,
             bc: cs.borderTopColor, bw: cs.borderTopWidth, br: cs.borderTopLeftRadius,
             minh: cs.minHeight, cls: String(e.className || '') } },

  estilos() {
    var C = window.__P.caja;
    return { abrir: C('#v2d-abrir'),
             pillInsuf: C('#pill-insuf-mitral'),
             pillEsten: C('#pill-esten-mitral'),
             tabBtn: C('.tabs-row .tab-btn:not(.active)'),
             tabBtnAny: C('.tab-btn:not(.active)'),
             railBtn: C('.rail .tab-btn:not(.active)'),
             cardHead: C('#tab-valvulas .card-head'),
             sevBtn: C('#sevbtn-insuf-mitral') } },

  /* La geometria del panel abierto: donde termina la nota y la tabla, y si hay scroll. */
  panelGeo() {
    var card = document.getElementById('v2d-card'), cu = document.getElementById('v2d-cuerpo');
    if (!card || !cu) return { err: 'FALTAN NODOS' };
    var rc = card.getBoundingClientRect();
    var C = window.__P.caja;
    return { vw: window.innerWidth, vh: window.innerHeight,
             card: C('#v2d-card'), cuerpo: C('#v2d-cuerpo'), svg: C('#v2d-svg'),
             head: C('#v2d-head'), grid: C('#v2d-grid'),
             colInsuf: C('#v2d-col-insuf'), colEsten: C('#v2d-col-esten'),
             dibujo: C('#v2d-dibujo'), cav: C('#v2d-cav'),
             li: C('.v2d-lista li'), chip: C('.v2d-chip'), grp: C('.v2d-grp'),
             tabla: C('#v2d-cav table'), td: C('#v2d-cav td'), nota: C('.v2d-nota'),
             cols: getComputedStyle(document.getElementById('v2d-grid') || card).gridTemplateColumns,
             nCols: (function(){ var g = document.getElementById('v2d-grid');
               return g ? getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length : null })(),
             scrollInterno: cu.scrollHeight > cu.clientHeight + 1,
             scrollH: cu.scrollHeight, clientH: cu.clientHeight,
             scrollHorizPagina: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
             scrollHorizCuerpo: cu.scrollWidth > cu.clientWidth + 1,
             pagScrollY: document.documentElement.scrollTop,
             centrado: Math.abs((rc.left + rc.right) / 2 - window.innerWidth / 2) <= 2,
             pantallaCompleta: rc.width >= window.innerWidth - 24 && rc.height >= window.innerHeight - 24,
             notaDentro: (function(){ var n = document.querySelector('.v2d-nota');
               if (!n) return 'NO EXISTE'; var rn = n.getBoundingClientRect();
               return rn.height > 0 && rn.bottom <= rc.bottom + 1 })(),
             tablaDentro: (function(){ var t = document.querySelector('#v2d-cav table');
               if (!t) return 'NO EXISTE'; var rt = t.getBoundingClientRect();
               return rt.height > 0 && rt.bottom <= rc.bottom + 1 })() } },

  /* ══ Y2 — EL CENSO DE LOS CUADROS DE CRITERIOS ════════════════════════════════════════════
     Sube desde la linea integrada hasta su caja de calculo y lista TODAS sus filas con el rotulo,
     el valor y el grado hermano. Asi se descubre lo que la PANTALLA publica, sin cablear una
     lista de ids que se desactualiza con la primera fila que entre. */
  cuadroDe(idSev) {
    var e = document.getElementById(idSev);
    if (!e) return { err: 'NO EXISTE ' + idSev };
    var box = e.closest('.calc-box');
    if (!box) { var n = e; while (n && n.nodeType === 1 && !n.classList.contains('calc-box')) n = n.parentNode;
      box = (n && n.nodeType === 1) ? n : null; }
    if (!box) return { err: 'SIN CAJA para ' + idSev };
    return { boxId: box.id || '', boxCls: String(box.className || ''),
      filas: Array.prototype.slice.call(box.querySelectorAll('.calc-row')).map(function(r){
        var l = r.querySelector('.calc-lbl');
        var g = r.querySelector('.calc-grado');
        var otros = Array.prototype.slice.call(r.querySelectorAll('span')).filter(function(s){
          return s !== l && s !== g && !s.classList.contains('calc-lbl')
              && !s.classList.contains('calc-grado') && !(l && l.contains(s)) });
        return { lbl: l ? (l.textContent || '').replace(/\\s+/g, ' ').trim() : '',
                 ids: otros.map(function(s){ return s.id || '' }).filter(Boolean),
                 val: otros.map(function(s){ return (s.textContent || '').replace(/\\s+/g, ' ').trim() }).join(' | '),
                 grado: g ? (g.textContent || '').trim() : null,
                 vis: getComputedStyle(r).display !== 'none' } }) } },

  censo() {
    var o = {};
    ['im-sev','ia-sev','it-sev','em-sev-integrada','ea-det-sev','et-sev','vm-prot-obstr']
      .forEach(function(id){ o[id] = window.__P.cuadroDe(id) });
    o._integradas = {};
    ['im-sev','ia-sev','it-sev','em-sev-integrada','ea-det-sev','et-sev','vm-prot-obstr',
     'im-discordancia','ia-discordancia','it-discordancia','em-discordancia','ea-ava-badge',
     'et-ref-fuente','ea-det-sev-nota','vm-prot-nota']
      .forEach(function(id){ var e = document.getElementById(id);
        o._integradas[id] = e ? (e.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE' });
    return o },

  /* ══ Y2 — EL GRADO FIJADO A MANO Y SU FUNDAMENTO ══════════════════════════════════════════ */
  manual() {
    var o = {};
    ['im','ia','it','ea','em','et'].forEach(function(k){
      var C = (window.SEV_SINC || {})[k] || null;
      var sel = C ? document.getElementById(C.select) : null;
      var nota = (C && C.nota) ? document.getElementById(C.nota) : null;
      var caj = (C && C.fundamento) ? document.getElementById(C.fundamento) : null;
      o[k] = { hayEntrada: !!C,
               manual: !!(window.esqSevManual && window.esqSevManual[k]),
               valor: sel ? sel.value : 'SIN SELECT',
               discrepa: (typeof sevDiscrepa === 'function') ? (function(){ try { return sevDiscrepa(k) } catch(e){ return 'EXC' } })() : 'SIN FN',
               calc: (typeof sevCalcPublicable === 'function') ? (function(){ try { return sevCalcPublicable(k) } catch(e){ return 'EXC' } })() : 'SIN FN',
               notaId: C ? (C.nota || null) : null,
               nota: nota ? String(nota.value || '') : 'SIN CAMPO',
               cajonVis: caj ? (getComputedStyle(caj).display !== 'none') : 'SIN CAJON' } });
    return o },

  /* Abre las ocho secciones de valvula y sus cajones, para que los cuadros tengan geometria. */
  abrirTodasValv() {
    var o = {};
    try { showTab('valvulas') } catch (e) { o.tab = 'EXC' }
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(s){
      try { var c = document.getElementById('ete-seccion-' + s);
        if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function') {
          var h = document.querySelector('[onclick*="' + s + '"]');
          toggleEteSeccion(s, h || null); }
        o[s] = c ? getComputedStyle(c).display : 'NO EXISTE';
      } catch (e) { o[s] = 'EXC: ' + e.message } });
    ['caja-insuf-mitral','caja-esten-mitral','caja-insuf-aortica','caja-esten-aortica',
     'caja-insuf-tricuspide','caja-esten-tricuspide'].forEach(function(id){
      try { var c = document.getElementById(id);
        if (c && getComputedStyle(c).display === 'none' && typeof valvDatosTog === 'function')
          valvDatosTog(id);
        o[id] = c ? getComputedStyle(c).display : 'NO EXISTE';
      } catch (e) { o[id] = 'EXC: ' + e.message } });
    return o },
};
1;
`;
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
  async function foco(id) {
    let g = await ev(`window.__P.geo(${JSON.stringify(id)})`);
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

  /* Carga una escena con teclas y clics reales. Las insuficiencias van por el menu de la
     pastilla (valvSev.aplicar), que es el gesto del medico; los campos, tipeados. */
  async function escena(sp) {
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirValv()`);
    await ev(`window.__P.despejar()`);
    for (const k of Object.keys(sp.campos || {})) await tipear(k, sp.campos[k]);
    for (const s of (sp.selects || [])) {
      const r = await ev(`window.__P.sel(${JSON.stringify(s[0])}, ${JSON.stringify(s[1])})`);
      if (r && r.err) throw new Error('DENOMINADOR ' + s[0] + ': ' + JSON.stringify(r));
    }
    for (const g of (sp.sev || [])) await ev(`window.__P.setSev(${JSON.stringify(g[0])}, ${JSON.stringify(g[1])}, ${JSON.stringify(g[2])})`);
    for (const f of (sp.fn || [])) await ev(`(function(){ try { ${f}; return 1 } catch(e){ return 'EXC: '+e.message } })()`);
    return ev(`window.__P.informe('estandar')`);
  }

  /* ══ ESCENAS DEL Y1b / Y2 ═══════════════════════════════════════════════════════════════════
     Cada una carga con TECLAS REALES y deja la app en un estado que el informe tambien publica.
     Los campos de otras pestanas (thp en Doppler, tsvd_* en VD) los abre `foco` con su abridor
     generico; si uno no tiene geometria la sonda ABORTA nombrandolo, que es lo correcto. */
  const BSA = { peso: '80', talla: '170' };
  const ESCY = {
    vacio: {},
    /* IM: vena contracta MODERADA y PISA SEVERA — la discordancia que la orden pide. */
    imDisc: { campos: Object.assign({}, BSA, { im_vc: '5', pisa_r: '0.9', pisa_val: '40',
      im_vmax: '5', im_itv: '150', ea_dtsvi: '20', itv_tsvi: '20',
      im_jet_area: '12', im_ai_area: '30' }) },
    imSevera: { campos: Object.assign({}, BSA, { im_vc: '8', im_jet_area: '20', im_ai_area: '30' }) },
    imLeve: { campos: Object.assign({}, BSA, { im_vc: '2' }) },
    iao: { campos: Object.assign({}, BSA, { ia_vc: '7', ia_pisa_r: '0.9', ia_pisa_val: '40',
      ia_vmax_cw: '4', ia_vti: '200', ia_pht: '180', ia_vmax_td: '0.3' }) },
    it: { campos: Object.assign({}, BSA, { it_vc: '8', it_pisa_r: '0.9', it_pisa_val: '40',
      it_vmax_cw: '3', it_vti: '90' }) },
    /* EAo: gradiente medio SEVERO y AVA por continuidad MODERADA — discordancia declarada. */
    eaoDisc: { campos: Object.assign({}, BSA, { vmax_ao: '4.5', gmedio_ao: '45',
      ea_dtsvi: '20', itv_tsvi: '20', itv_ao: '56', ava_plan: '0.9' }) },
    eaoModerada: { campos: Object.assign({}, BSA, { vmax_ao: '3.4', gmedio_ao: '30' }) },
    em: { campos: Object.assign({}, BSA, { em_gmedio: '12', thp: '250', avm_plan: '1.2',
      em_dtsvi: '20', em_vtitsvi: '20', em_vtimit: '52' }) },
    et: { campos: Object.assign({}, BSA, { et_gmedio: '6', et_thp: '200', et_vti_diast: '70',
      tsvd_diametro: '25', vti_tsvd: '14' }) },
    protMitralMec: { selects: [['vm_morf', 'Prótesis mecánica']],
      campos: Object.assign({}, BSA, { em_dtsvi: '20', em_vtitsvi: '20', em_vtimit: '52',
        em_gmedio: '12', thp: '250' }) },
    protAoBio: { selects: [['va_morf', 'Prótesis biológica']],
      campos: Object.assign({}, BSA, { ea_dtsvi: '20', itv_tsvi: '20', itv_ao: '90',
        vmax_ao: '4.2', gmedio_ao: '45' }) },
    manual: { campos: Object.assign({}, BSA, { im_vc: '8' }), fn: ['calcIM_ESC()'],
      sev: [['insuf', 'mitral', '2']] },
    /* ⚠️ LA ESCENA MAS ALTA DE TODAS, y hace falta para el denominador del alto: carga los ONCE
       campos que pueden producir fila en la tabla de cavidades. Con una escena de nueve filas el
       panel entra sin desplazamiento y eso NO prueba que entre con la tabla completa. */
    camarasFull: { campos: Object.assign({}, BSA, { ddfvi: '66', vdfvi: '180', fevi: '30',
      ai_vol: '105', vd_bas: '47', tapse: '14', s_prime: '8', vd_tei: '0.62',
      ad_area: '24', lars: '12', siv: '14', ppvi: '14',
      im_vc: '5', ia_vc: '7', it_vc: '8', vmax_ao: '4.5', gmedio_ao: '45',
      em_gmedio: '12', thp: '250', et_gmedio: '6' }) },
    rico: { campos: Object.assign({}, BSA, { im_vc: '5', pisa_r: '0.9', pisa_val: '40',
      im_vmax: '5', im_itv: '150', ea_dtsvi: '20', itv_tsvi: '20',
      ia_vc: '7', it_vc: '8', vmax_ao: '4.5', gmedio_ao: '45',
      em_gmedio: '12', thp: '250', et_gmedio: '6',
      ddfvi: '66', fevi: '30', ai_vol: '105', vd_bas: '47', tapse: '14', s_prime: '8',
      ad_area: '24', siv: '14', ppvi: '14' }) }
  };

  /* ── 1 · estilo ── El boton y una pestana en reposo, en los DOS temas. ── */
  if (corre('estilo')) {
    const g = {};
    await viewport(1200, 700);
    await ev(`window.__P.nuevo()`);
    await ev(`(function(){ try { showTab('valvulas') } catch(e){} return 1 })()`);
    for (const claro of [false, true]) {
      await ev(`window.__P.tema(${claro})`);
      await pausa(60);
      g[claro ? 'claro' : 'oscuro'] = await ev(`window.__P.estilos()`);
    }
    await ev(`window.__P.tema(false)`);
    out.grupos.estilo = g;
  }

  /* ── 2 · maqueta ── El panel abierto a los seis anchos y en los dos temas. ── */
  if (corre('maqueta')) {
    const g = { celdas: [] };
    await ev(`window.__P.tema(false)`);
    await viewport(1200, 900);
    await escena(ESCY.camarasFull);
    for (const [w, h] of [[1200, 700], [1440, 800], [1920, 1080], [768, 1024], [390, 844], [360, 740]]) {
      for (const claro of [false, true]) {
        await ev(`window.__P.tema(${claro})`);
        await viewport(w, h);
        await pausa(90);
        await ev(`window.__P.despejar()`);
        const ab = await ev(`window.__P.v2dAbrir()`);
        await pausa(140);
        const geo = await ev(`window.__P.panelGeo()`);
        const fil = await ev(`window.__P.v2dCav()`);
        g.celdas.push({ w, h, tema: claro ? 'claro' : 'oscuro', abre: ab, geo,
                        nFilas: (fil && fil.filas) ? fil.filas.length : fil });
        await ev(`window.__P.v2dCerrarBoton()`);
      }
    }
    await ev(`window.__P.tema(false)`); await viewport(1200, 900);
    out.grupos.maqueta = g;
  }

  /* ── 3 · censo ── Lo que la PANTALLA publica por lesion: filas, grados e integradas. ── */
  if (corre('censo')) {
    const g = { escenas: {} };
    await viewport(1200, 900);
    for (const nom of ['vacio', 'imDisc', 'imSevera', 'imLeve', 'iao', 'it', 'eaoDisc',
                       'eaoModerada', 'em', 'et', 'protMitralMec', 'protAoBio', 'manual']) {
      await escena(ESCY[nom]);
      await ev(`window.__P.abrirTodasValv()`);
      g.escenas[nom] = { censo: await ev(`window.__P.censo()`),
                         manual: await ev(`window.__P.manual()`),
                         grados: await ev(`window.__P.grados()`),
                         caps: await ev(`window.__P.caps()`),
                         tarj: await ev(`(function(){ window.__P.v2dAbrir(); var t = window.__P.v2dTarjetas();
                           window.__P.v2dCerrarBoton(); return t })()`) };
    }
    out.grupos.censo = g;
  }

  /* ── 4 · dvi ── El control de SOLO LECTURA del DVI aortico (punto 1f de la orden). ── */
  if (corre('dvi')) {
    const g = { filas: [] };
    await viewport(1200, 900);
    for (const vtiAo of ['56.4', '57', '56', '90']) {
      await escena({ selects: [['va_morf', 'Prótesis biológica']],
        campos: Object.assign({}, BSA, { ea_dtsvi: '20', itv_tsvi: '20', itv_ao: vtiAo,
          vmax_ao: '3.0', gmedio_ao: '20' }) });
      await ev(`window.__P.abrirTodasValv()`);
      g.filas.push({ vtiAo, cuadro: await ev(`window.__P.eaCuadro()`),
                     protAo: await ev(`window.__P.protAo()`),
                     dviCrudo: await ev(`(function(){ var a = parseFloat((window.__P.val('itv_tsvi')||'0'));
                       var b = parseFloat((window.__P.val('itv_ao')||'0'));
                       return b ? (a / b) : null })()`),
                     tarj: await ev(`(function(){ window.__P.v2dAbrir(); var t = window.__P.v2dTarjetas();
                       window.__P.v2dCerrarBoton(); return t })()`) });
    }
    out.grupos.dvi = g;
  }

  /* ── 5 · controles ── Informe, EN SUMA y Excel, con la vista abierta y cerrada. ── */
  if (corre('controles')) {
    const g = { escenas: {} };
    await viewport(1200, 900);
    for (const nom of ['vacio', 'rico', 'protMitralMec', 'manual']) {
      await escena(ESCY[nom]);
      const c = {};
      for (const est of ['estandar', 'narrativo', 'conciso']) c[est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
      await ev(`window.__P.informe('estandar')`);
      c.excel = await ev(`window.__P.excelDOM()`);
      c.grados = await ev(`window.__P.grados()`);
      c.caps = await ev(`window.__P.caps()`);
      c.censo = await ev(`window.__P.censo()`);
      g.escenas[nom] = c;
    }
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
