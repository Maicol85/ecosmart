#!/usr/bin/env node
/**
 * _probe_y1.mjs - sonda A/B de SOLO LECTURA para la tanda «Y1» (2026-10-15): la VISTA 2D.
 *   (1) PROTESIS MITRAL: los CUATRO criterios de la Tabla 11 y la regla de conteo del medico.
 *   (2) DVI AORTICO: visible con los dos VTI y sin diametro, con referencia nativa o protesica.
 *   (3) PPM: la fila de pantalla de las dos protesis y la frase igualada de las dos valvulas.
 *   (4) LINEA INTEGRADA de la estenosis aortica: el criterio nombrado es el que decide.
 *
 * Infraestructura calcada de scripts/_probe_z.mjs (teclas y clics reales, cierre del arbol de
 * Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su denominador, md5 al
 * principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_z5.mjs --file /tmp/index.HEAD.html > /tmp/z5.HEAD.json
 *   node scripts/_probe_z5.mjs                             > /tmp/z5.NEW.json
 *
 * Grupos (--solo votoMitral|tarjeta|dviAo|ppm|integrada|controles):
 *   votoMitral - los cuatro criterios por sus bordes y la tabla de conteo 0..4 positivos.
 *   tarjeta    - la tarjeta del veredicto: abre, cierra por los cuatro caminos, y su maqueta.
 *   dviAo      - el DVI aortico con y sin diametro, en nativa y en protesis.
 *   ppm        - las dos filas de PPM y las dos frases del informe y del EN SUMA.
 *   integrada  - el renglon integrado y el borrado en los seis ordenes por los dos gestos.
 *   controles  - informe (tres estilos), EN SUMA, Excel, grados, diastolica y HFA-PEFF.
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
        return { txt: (li.textContent || '').replace(/\s+/g, ' ').trim(),
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
    try { return (typeof window.V2D_JORG === 'object') ? window.V2D_JORG : 'SIN CONST' }
    catch (e) { return 'EXC' } }
};
1;
`;

/* == Escenas ==================================================================================
   La del medico, textual (escena Z3): O TSVI 20, VTI TSVI 20, VTI Ao 56. Da AVA 1,12 cm2
   (moderada) y DVI 0,357 (moderado). */
const EA_BASE = { diam_tsvi: '20', itv_tsvi: '20', itv_ao: '56' };
const EA_TRES = ['diam_tsvi', 'itv_tsvi', 'itv_ao'];
/* ⚠️ LA OPCION NATIVA SE DERIVA DE LA LISTA Y NO SE CABLEA. La de `vm_morf` se llama «Normal»
   y la de `va_morf` «Trivalva normal»: con el literal cableado, `sel` devolvia
   «NO HAY OPCION Normal» y la escena media la PROTESIS anterior creyendo que medía una nativa
   —el control negativo informo una diferencia que era suya—. Se toma la primera opcion que no
   sea protesis, que es la que la app ofrece como valor de fabrica. */
function nativaDe(ops) {
  const n = (ops || []).filter((o) => o && !/tesis|TAVI/i.test(o))[0];
  if (!n) throw new Error('DENOMINADOR: no hay opcion NATIVA en la lista: ' + JSON.stringify(ops));
  return n;
}

/* == Escenas del Y1 ==========================================================================
   Cada escena carga con TECLAS REALES y deja la app en un estado que el informe tambien
   publica: lo que se compara despues es que el grado de la tarjeta sea el mismo. */
const ESC = {
  sana: {},
  im:   { im_grado: '4' },
  iao:  { ia_grado: '2' },
  it:   { it_grado: '1' },
  varias: { im_grado: '2', ia_grado: '4', it_grado: '2' }
};

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

  /* ── 1 · boton ── Existe, abre, cierra por los tres caminos y el foco va y vuelve. ── */
  if (corre('boton')) {
    const g = {};
    await viewport(1200, 900);
    await ev(`window.__P.v2dEspiaRaf()`);
    await ev(`window.__P.nuevo()`);
    /* La pestana tiene que estar ACTIVA antes de medir el boton: en otra pestana mide 0x0 y
       «oculto» no dice nada sobre el boton sino sobre la pestana. */
    await ev(`(function(){ try { showTab('valvulas') } catch(e){} return 1 })()`);
    g.boton = await ev(`window.__P.v2dBoton()`);
    g.cerradaAlArranque = await ev(`window.__P.v2dAbrierto()`);
    /* NADA CORRE CON LA VISTA CERRADA: se cuentan los cuadros pedidos en una ventana real. */
    await ev(`window.__P.v2dRafReset()`);
    await pausa(900);
    g.rafCerrada = await ev(`window.__P.v2dRafN()`);
    g.corriendoCerrada = await ev(`window.__P.v2dCorriendo()`);
    g.abre = await ev(`window.__P.v2dAbrir()`);
    await ev(`window.__P.v2dRafReset()`);
    await pausa(900);
    g.rafAbierta = await ev(`window.__P.v2dRafN()`);
    g.corriendoAbierta = await ev(`window.__P.v2dCorriendo()`);
    g.cierraBoton = await ev(`window.__P.v2dCerrarBoton()`);
    await ev(`window.__P.v2dRafReset()`);
    await pausa(900);
    g.rafTrasCerrar = await ev(`window.__P.v2dRafN()`);
    /* Escape, con tecla real. */
    await ev(`window.__P.v2dAbrir()`);
    g.abiertoAntesEsc = await ev(`window.__P.v2dAbrierto()`);
    await tecla('Escape');
    await pausa(120);
    g.trasEscape = { abierto: await ev(`window.__P.v2dAbrierto()`),
                     foco: await ev(`document.activeElement ? document.activeElement.id : null`) };
    /* Clic afuera. */
    await ev(`window.__P.v2dAbrir()`);
    g.cierraAfuera = await ev(`window.__P.v2dCerrarAfuera()`);
    out.grupos.boton = g;
  }

  /* ── 2 · estado ── El lector unico, escena por escena. ── */
  if (corre('estado')) {
    const g = { escenas: {} };
    const ESCENAS = [
      ['vacio', {}],
      ['imSevera', { sev: [['insuf','mitral','4']] }],
      ['eaoSevera', { campos: { vmax_ao: '4.5' } }],
      ['emSignif', { campos: { avm_plan: '0.9' }, selects: [['em_grado','severa']] }],
      ['protMitralMec', { selects: [['vm_morf','Prótesis mecánica']],
                          campos: { em_dtsvi:'20', em_vtitsvi:'20', em_vtimit:'52', em_gmedio:'12', thp:'250' } }],
      ['protAoBio', { selects: [['va_morf','Prótesis biológica']],
                      campos: { ea_dtsvi:'20', itv_tsvi:'20', itv_ao:'90', vmax_ao:'4.2', gmedio_ao:'45' } }],
      ['protTricBio', { selects: [['vt_morf','Prótesis biológica']] }],
      ['camaras', { campos: { peso:'80', talla:'170', ddfvi:'68', fevi:'28', ai_vol:'110',
                              vd_bas:'48', tapse:'14', s_prime:'8', ad_area:'25', lars:'12',
                              siv:'14', ppvi:'14' } }],
      ['varias', { sev: [['insuf','mitral','2'],['insuf','aortica','4'],['insuf','tricuspide','2']] }]
    ];
    for (const [nom, sp] of ESCENAS) {
      const inf = await escena(sp);
      await ev(`window.__P.v2dAbrir()`);
      g.escenas[nom] = { estado: await ev(`window.__P.v2dEstado()`),
                         tarjetas: await ev(`window.__P.v2dTarjetas()`),
                         cav: await ev(`window.__P.v2dCav()`),
                         dibujo: await ev(`window.__P.v2dDibujo()`),
                         inf: inf, grados: await ev(`window.__P.grados()`) };
      await ev(`window.__P.v2dCerrarBoton()`);
    }
    out.grupos.estado = g;
  }

  /* ── 3 · maqueta ── Cuatro anchos por dos temas, con el color real. ── */
  if (corre('maqueta')) {
    const g = { celdas: {} };
    await escena({ sev: [['insuf','mitral','4'],['insuf','tricuspide','2']],
                   campos: { peso:'80', talla:'170', ddfvi:'62', fevi:'35', ai_vol:'95', vd_bas:'46', tapse:'15' } });
    for (const claro of [false, true]) {
      const t = await ev(`window.__P.tema(${claro})`);
      if (!!t.claro !== claro) throw new Error('EL TEMA NO QUEDO: ' + JSON.stringify(t));
      for (const w of [1200, 768, 390, 360]) {
        await viewport(w, 900);
        await pausa(120);
        await ev(`window.__P.v2dAbrir()`);
        await pausa(160);
        g.celdas[(claro ? 'claro' : 'oscuro') + '|' + w] = {
          maq: await ev(`window.__P.v2dMaqueta()`),
          col: await ev(`window.__P.v2dColores()`),
          tarj: await ev(`window.__P.v2dTarjetas()`) };
        await ev(`window.__P.v2dCerrarBoton()`);
      }
    }
    await ev(`window.__P.tema(false)`);
    await viewport(1200, 900);
    out.grupos.maqueta = g;
  }

  /* ── 4 · controles ── Nada de la app se mueve, abra o no la vista. ── */
  if (corre('controles')) {
    const g = {};
    await ev(`window.__P.nuevo()`);
    g.vacio = { inf: await ev(`window.__P.informe('estandar')`),
                excel: await ev(`window.__P.excelDOM()`), grados: await ev(`window.__P.grados()`) };
    await ev(`window.__P.abrirValv()`);
    await tipear('peso', '70'); await tipear('talla', '170');
    for (const id of EA_TRES) await tipear(id, EA_BASE[id]);
    await tipear('vmax_ao', '4.2'); await tipear('gmedio_ao', '45');
    await tipear('vmax_it', '3.0');
    await ev(`window.__P.sel('vci_col','>50')`);
    await tipear('vci_diam', '22');
    await tipear('tapse', '15');
    await tipear('onda_e', '95'); await tipear('onda_a', '45');
    await tipear('e_sep', '7'); await tipear('e_lat', '9');
    await tipear('ai_vol', '45');
    g.cargado = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) g.cargado['inf_' + est] = await ev(`window.__P.informe('${est}')`);
    g.cargado.grados = await ev(`window.__P.grados()`);
    g.cargado.excel = await ev(`window.__P.excelDOM()`);
    g.cargado.diast = await ev(`window.__P.txt('dd-interp')`);
    g.cargado.hfapeff = await ev(`window.__P.txt('hfapeff-eco')`);
    g.cargado.campos = await ev(`(function(){ var c = {};
      document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
        if (e.type === 'checkbox' || e.type === 'radio') return;
        if (String(e.id).indexOf('v2d') === 0) return;
        c[e.id] = e.value });
      return { n: Object.keys(c).length, hash: JSON.stringify(c).length } })()`);
    /* Y TAMBIEN CON LA VISTA ABIERTA: si abrir escribiera algo, se veria aca. */
    await ev(`window.__P.v2dAbrir()`);
    g.abierta = { inf: await ev(`window.__P.informe('estandar')`),
                  excel: await ev(`window.__P.excelDOM()`),
                  campos: await ev(`(function(){ var c = {};
                    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
                      if (e.type === 'checkbox' || e.type === 'radio') return;
                      if (String(e.id).indexOf('v2d') === 0) return;
                      c[e.id] = e.value });
                    return { n: Object.keys(c).length, hash: JSON.stringify(c).length } })()`) };
    g.storage = await ev(`(function(){ var o = { ls: [], ss: [] };
      try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i);
        if (String(k).indexOf('v2d') > -1) o.ls.push(k) } } catch (e) { o.ls = 'EXC' }
      try { for (var j = 0; j < sessionStorage.length; j++) { var k2 = sessionStorage.key(j);
        if (String(k2).indexOf('v2d') > -1) o.ss.push(k2) } } catch (e) { o.ss = 'EXC' }
      return o })()`);
    await ev(`window.__P.v2dCerrarBoton()`);
    out.grupos.controles = g;
  }

  /* ── 5 · captura ── Mirar el PNG, que es como esta casa cazo los acentos que faltaban y el
        violeta que se veia gris. `getComputedStyle` lee el estilo; el PNG lee el pixel. ── */
  if (corre('captura') && DEST) {
    const g = { archivos: [] };
    await escena({ sev: [['insuf','mitral','4'],['insuf','tricuspide','2']],
                   selects: [['va_morf','Prótesis biológica']],
                   campos: { peso:'80', talla:'170', ddfvi:'62', fevi:'35', ai_vol:'95',
                             vd_bas:'46', tapse:'14', s_prime:'8', ad_area:'22',
                             ea_dtsvi:'20', itv_tsvi:'20', itv_ao:'90', vmax_ao:'4.2', gmedio_ao:'45' } });
    for (const claro of [false, true]) {
      await ev(`window.__P.tema(${claro})`);
      for (const w of [1200, 390]) {
        await viewport(w, 900);
        await ev(`window.__P.v2dAbrir()`);
        await ev(`window.__P.v2dFase(0.30)`);
        await pausa(200);
        const r = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
        const f = join(DEST, 'y1_' + (claro ? 'claro' : 'oscuro') + '_' + w + '.png');
        await writeFile(f, Buffer.from(r.data, 'base64'));
        g.archivos.push(f);
        await ev(`window.__P.v2dCerrarBoton()`);
      }
    }
    await ev(`window.__P.tema(false)`); await viewport(1200, 900);
    out.grupos.captura = g;
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  if (out.md5Fin !== out.md5Ini) out.AVISO = 'EL ARCHIVO SE MOVIO DURANTE LA CORRIDA';
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close() } catch (e) {}
  try { srv.close() } catch (e) {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO: ' + e.message); process.exit(1); });
