#!/usr/bin/env node
/**
 * _probe_qtarj.mjs - sonda A/B de SOLO LECTURA para la tanda Q (las tarjetas i de Valvulas,
 * 2026-10-17).
 *
 * TODA la infraestructura y TODOS los helpers de scripts/_probe_cortos.mjs se reusan tal cual
 * -teclas y clics reales, cierre del arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso
 * legal despejado con su denominador, md5 al principio y al final- y lo que esta tanda agrega
 * son sus propios grupos. NO muta index.html.
 *
 *   node scripts/_probe_qtarj.mjs --file /tmp/index.QHEAD.html --solo pos0 > /tmp/q.HEAD.json
 *   node scripts/_probe_qtarj.mjs                              --solo pos0 > /tmp/q.NEW.json
 *
 * Grupos propios:
 *   pos0   - LECTURA PREVIA: donde esta cada pastilla y cuanto hueco queda, a tres anchos.
 *   mec    - los ocho botones i: existen, abren, cierran por los tres caminos, una sola abierta.
 *   tarj   - el contenido de cada tarjeta contra el DUENO (_v2dPorQue / _v2dPastilla).
 *   trip   - la tricuspide protesica: cero, uno y dos criterios y la frase de integracion.
 *   pulm   - la pulmonar: bio, homoinjerto y los tres estados que no graduan.
 *   diast  - la funcion diastolica con las tres guias.
 *   pvl    - los dos textos fijos de la fuga aortica, ahora en i.
 *   ciclo  - 20 aperturas y cierres: nodos y oyentes.
 *   maqueta- los dos temas y los cuatro anchos, con el color REAL resuelto.
 *   unid   - que ningun corte aparezca en dos unidades.
 *   ctrl   - los controles: informe, EN SUMA, Excel, campos y almacenamiento.
 *
 * Los grupos de la sonda del CORTOS y del PRO-C siguen disponibles.
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda, tampoco en los comentarios
 * de adentro. `scripts/check_backticks.py` da la linea exacta.
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

  /* ══ PRO1 — LA FILA DEL COCIENTE VTI MITRAL / TSVI ════════════════════════════════════════
     Se lee el TEXTO de la fila, que es la unica superficie del cociente: no vota, asi que un
     lector del objeto no diria nada. Se devuelven los dos insumos para que el lector pueda ver
     que la escena de verdad produjo un cociente, y no un «—» por falta de datos. */
  ratio() {
    var e = document.getElementById('im-vti-ratio');
    var mec = null, thpN = null;
    try { var R = vmProtEOA(); mec = R.mecanica; thpN = R.porThp } catch (x) {}
    return { txt: e ? (e.textContent || '').trim() : 'NO EXISTE',
             vtim: window.__P.val('vtim'),
             vtitsvi: window.__P.val('im_itv_tsvi') || window.__P.val('itv_tsvi'),
             mecanica: mec, porThp: thpN,
             imGrado: window.__P.val('im_grado'),
             rotulo: (function(){ var b = document.querySelector('[data-vinfo="im-vti-ratio"]');
               var l = b ? b.closest('.calc-lbl') : null;
               return l ? (l.textContent || '').replace(/\\s+/g, ' ').trim() : 'SIN ROTULO' })() } },

  /* ══ PRO2 — EL CUADRO DE LA INSUFICIENCIA AORTICA ═════════════════════════════════════════
     Las cinco filas con su valor, el badge integrado y el grado del select, en una sola lectura.
     Sin el estado de la FILA al lado del veredicto, un badge que no cambia se lee como un corte
     que no funciona. */
  iaCuadro() {
    var t = function(id){ var e = document.getElementById(id);
      return e ? (e.textContent || '').trim() : 'NO EXISTE' };
    return { jet: t('ia-jet-ratio'), eroa: t('ia-eroa'), volr: t('ia-volr'), fr: t('ia-freg'),
             pht: t('ia-pht-interp'), vtd: t('ia-vtd-interp'),
             sev: t('ia-sev'), disc: t('ia-discordancia'),
             grado: window.__P.val('ia_grado'),
             sugerido: (function(){ var s = document.getElementById('ia_grado');
               return s ? (s.dataset.sugerido || '') : 'NO EXISTE' })(),
             pastilla: window.__P.pill('aortica','insuf'),
             morfAo: window.__P.val('va_morf'),
             esProtAo: (typeof _eaEsProtesisAo === 'function') ? _eaEsProtesisAo() : 'SIN FN' } },

  /* ══ PRO3 — LA REGURGITACION PARAVALVULAR DE LA TAVI ══════════════════════════════════════
     Se lee el OBJETO del motor Y la capsula de pantalla Y la narrativa que viaja al informe: el
     motor decide, la capsula se ve y la narrativa es la que se firma. */
  rpv() {
    var r = null, nar = null;
    try { r = (typeof eteTaviRPV === 'function') ? eteTaviRPV() : 'SIN FN' } catch (x) { r = 'EXC: ' + x.message }
    try { nar = (typeof taviRpvNarrativa === 'function') ? taviRpvNarrativa() : 'SIN FN' } catch (x) { nar = 'EXC' }
    return { motor: r, narrativa: nar,
             capSev: window.__P.txt('ete-tavi-rpv-sev'),
             capMotivo: window.__P.txt('ete-tavi-rpv-motivo'),
             flujo: window.__P.val('ete_tavi_flujo_rev'),
             velTele: window.__P.val('ete_tavi_vel_tele'),
             ext: window.__P.val('ete_tavi_ext_circ') } },

  /* ⚠️ LOS CAMPOS DEL TAVI VIVEN EN LA PESTANA ETE DETRAS DE DOS PUERTAS: la seccion de la
     valvula aortica y el panel pre/post. Sin abrirlas los campos existen y miden 0x0, y la
     sonda tipearia en la nada. */
  abrirTavi() {
    var o = {};
    try { showTab('ete'); o.tab = 'ok' } catch (e) { o.tab = 'EXC: ' + e.message }
    ['valv-aortica','tavi'].forEach(function(s){
      try { if (typeof toggleEteSeccion === 'function') {
        var c = document.getElementById('ete-seccion-' + s);
        if (c && getComputedStyle(c).display === 'none') toggleEteSeccion(s);
        o[s] = c ? getComputedStyle(c).display : 'NO EXISTE';
      } } catch (e) { o[s] = 'EXC: ' + e.message } });
    try { if (typeof eteTaviTab === 'function') eteTaviTab('post'); o.pane = 'post' } catch (e) { o.pane = 'EXC' }
    o.geoVel = window.__P.geo('ete_tavi_vel_tele');
    o.geoExt = window.__P.geo('ete_tavi_ext_circ');
    return o },

  /* ── EL PDF DEL INFORME, GENERADO DE VERDAD ──
     Se envuelve el CONSTRUCTOR y no el prototipo: en jsPDF 2.x los metodos del nucleo son
     propiedades PROPIAS de cada documento. Calcado de scripts/_probe_h.mjs. */
  pdf(plantilla) {
    if (typeof window.jspdf === 'undefined') return { err:'SIN jsPDF' };
    if (plantilla) { try { localStorage.setItem('ett_pdf_plantilla', plantilla) } catch (e) {} }
    var orig = window.jspdf.jsPDF;
    var textos = [], nfig = 0, guardo = false, err = null;
    function Envuelto(){
      var d = new orig(arguments[0]);
      var oText = d.text, oCirc = d.circle, oLine = d.line;
      d.text = function(t){
        var s = (typeof t === 'string') ? t : (Array.isArray(t) ? t.join(String.fromCharCode(1)) : String(t));
        textos.push(s); return oText.apply(d, arguments) };
      d.circle = function(){ nfig++; return oCirc.apply(d, arguments) };
      d.line   = function(){ nfig++; return oLine.apply(d, arguments) };
      d.save   = function(){ guardo = true; return d };
      return d }
    Envuelto.API = orig.API; Envuelto.version = orig.version;
    window.jspdf.jsPDF = Envuelto;
    try { generarPDFReal() } catch (e) { err = String(e && e.message || e) }
    finally { window.jspdf.jsPDF = orig }
    return { err:err, guardo:guardo, nTextos:textos.length, nFigs:nfig, textos:textos } },

  /* El PPT estadistico y el PDF de auditoria del Laboratorio, por sus generadores REALES —los
     publicos exigen tarjetas tildadas y abren modales—. Se mide el numero de textos. */
  labPPT(infs) {
    if (typeof _labPPTGenerar !== 'function') return 'SIN _labPPTGenerar';
    if (typeof PptxGenJS === 'undefined') return 'SIN PptxGenJS';
    var n = 0;
    try {
      var P = PptxGenJS; var orig = P.prototype.addSlide;
      P.prototype.addSlide = function(){ var sl = orig.apply(this, arguments);
        var oT = sl.addText; sl.addText = function(t){ n++; return oT.apply(sl, arguments) };
        var oTb = sl.addTable; if (oTb) sl.addTable = function(){ n++; return oTb.apply(sl, arguments) };
        return sl };
      try { _labPPTGenerar(infs || [], { guardar:false }); } catch (e) {}
      P.prototype.addSlide = orig;
    } catch (e) { return 'EXC: ' + e.message }
    return n },

  labAudit(infs) {
    if (typeof _labAnalisisPDFReal !== 'function') return 'SIN _labAnalisisPDFReal';
    if (typeof window.jspdf === 'undefined') return 'SIN jsPDF';
    var orig = window.jspdf.jsPDF; var textos = [];
    function Envuelto(){ var d = new orig(arguments[0]); var oText = d.text;
      d.text = function(t){ var s = (typeof t === 'string') ? t
        : (Array.isArray(t) ? t.join(String.fromCharCode(1)) : String(t));
        textos.push(s); return oText.apply(d, arguments) };
      d.save = function(){ return d }; return d }
    Envuelto.API = orig.API; Envuelto.version = orig.version;
    window.jspdf.jsPDF = Envuelto;
    try { _labAnalisisPDFReal(infs || []); } catch (e) {}
    finally { window.jspdf.jsPDF = orig }
    return { n: textos.length, textos: textos } },

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


  /* ══ PRO-B2 — EL ROTULO DEL REVERSO DE LA TAVI ════════════════════════════════════════════
     Se lee el "<label>" RENDERIZADO y no el fuente: el comentario que explica el cambio NOMBRA
     el texto viejo, asi que un "indexOf" sobre el fuente da un falso. Es la trampa que TC-476 y
     TC-479 ya pagaron. */
  rotuloDe(id) {
    var e = document.getElementById(id);
    if (!e) return 'NO EXISTE ' + id;
    var fg = e.closest('.fg');
    var l = fg ? fg.querySelector('label') : null;
    return l ? (l.textContent || '').replace(/\\s+/g, ' ').trim() : 'SIN LABEL' },

  /* ⚠️ "document.body.innerText" NO SIRVE PARA CENSAR UN ROTULO, y la primera version de esta
     sonda lo uso: "innerText" omite lo que esta en display:none, asi que parado en la pestaña
     Valvulas devolvio 674 caracteres y CERO ocurrencias de «abdominal» con el rotulo viejo
     intacto en la pestaña ETE — un denominador vacio con pinta de medicion buena.
     Lo que se censa son los ROTULOS AUTORADOS del documento entero —cada <label> y cada
     <option>—, que son texto del marcado y existen con la pestaña cerrada. Y NO el fuente: el
     comentario que explica el cambio NOMBRA el texto viejo, asi que un indexOf sobre
     documentElement.innerHTML da un falso. Es la trampa que TC-476 y TC-479 ya pagaron. */
  rotulos() {
    var t = [];
    document.querySelectorAll('label, option').forEach(function(e){
      t.push((e.textContent || '').replace(/\\s+/g, ' ').trim()) });
    return t },

  /* ══ PRO-B3 — LA FUGA PARAVALVULAR DE LA PROTESIS AORTICA QUIRURGICA ══════════════════════
     Se lee el OBJETO del dueño Y la capsula pintada. Solo el objeto deja pasar un veredicto que
     la pantalla no publica; solo el texto no distingue «no aplica» de «no se evaluo». */
  pvlAo() {
    var o = { fn: (typeof eaProtRPV === 'function') };
    if (o.fn) { try { var R = eaProtRPV();
        o.r = R ? { sev: R.sev, cls: R.cls, motivo: R.motivo, nula: !!R.nula } : null;
      } catch (e) { o.r = 'EXC: ' + e.message } }
    o.txt   = (typeof eaProtPvlTxt === 'function')
      ? (function(){ try { var t = eaProtPvlTxt(); return t ? { clave: t.clave, txt: t.txt } : null }
          catch (e) { return 'EXC' } })() : 'SIN FN';
    o.bloqueVis = window.__P.vis('bloque-prot-va-pvl');
    /* El bloque VECINO, que "valvProtSync" gobierna y "limpiarCampos" NO llama: es el control de
       que el dueno propio del bloque nuevo hacia falta. */
    o.bloqueAtVis = window.__P.vis('bloque-prot-va');
    o.morf = window.__P.val('va_morf');
    o.motivoTxt = window.__P.txt('ea-pvl-motivo');
    o.interp    = window.__P.txt('ea-pvl-interp');
    o.origen    = window.__P.val('ea_pvl_origen');
    o.ext       = window.__P.val('ea_pvl_ext');
    o.vcArea    = window.__P.val('ea_pvl_vc_area');
    o.geoOrigen = window.__P.geo('ea_pvl_origen');
    o.geoExt    = window.__P.geo('ea_pvl_ext');
    o.geoVcA    = window.__P.geo('ea_pvl_vc_area');
    return o },

  /* ══ PRO-B4 — LA MARCA DE ORIGEN DE LA PROTESIS MITRAL ════════════════════════════════════ */
  pvlVm() {
    return { bloqueVis: window.__P.vis('bloque-prot-vm-pvl'),
             origen: window.__P.val('vm_pvl_origen'),
             geo: window.__P.geo('vm_pvl_origen'),
             interp: window.__P.txt('im-pvl-interp'),
             txt: (typeof imPvlTxt === 'function')
               ? (function(){ try { var t = imPvlTxt(); return t || null } catch (e) { return 'EXC' } })()
               : 'SIN FN',
             extCirc: window.__P.existe('vm_pvl_ext') } },

  /* La TAVI completa: el motor, la capsula, la narrativa y el rotulo. Si algo de esto cambia
     contra HEAD es un defecto. */
  tavi() {
    return { rpv: (typeof eteTaviRPV === 'function')
               ? (function(){ try { var R = eteTaviRPV();
                   return R ? { sev: R.sev, cls: R.cls, motivo: R.motivo, nula: !!R.nula } : null }
                   catch (e) { return 'EXC' } })() : 'SIN FN',
             nar: (typeof taviRpvNarrativa === 'function')
               ? (function(){ try { var t = taviRpvNarrativa(); return t ? { clave: t.clave, txt: t.txt } : null }
                   catch (e) { return 'EXC' } })() : 'SIN FN',
             sev: window.__P.txt('ete-tavi-rpv-sev'),
             motivo: window.__P.txt('ete-tavi-rpv-motivo'),
             hall: window.__P.txt('ete-tavi-nar-hall'),
             rotulo: window.__P.rotuloDe('ete_tavi_vel_tele') } },

  /* La lectura del Laboratorio sobre un estudio ARCHIVADO: es la que tenia la segunda copia de
     los cuatro cortes. Se le pasa "campos" para que no lea el formulario abierto. */
  labTavi(campos) {
    if (typeof _labTaviResumen !== 'function') return 'SIN FN';
    try { var R = _labTaviResumen([window.__P.reg(campos)]);
      return { rpv: R.rpv, nR: R.nR } } catch (e) { return 'EXC: ' + e.message } },

  /* El cuadro de la insuficiencia aortica, fila por fila: el grado CENTRAL que la fuga no
     reemplaza. */
  iaFilas() {
    var t = function(id){ return window.__P.txt(id) };
    return { jet: t('ia-jet-ratio'), eroa: t('ia-eroa'), volr: t('ia-volr'), freg: t('ia-freg'),
             pht: t('ia-pht-interp'), vtd: t('ia-vtd-interp'), vtiD: t('ia-vti-desc-interp'),
             grado: window.__P.val('ia_grado'),
             pastilla: window.__P.pill('aortica','insuf') } },

  /* La tarjeta de la vista 2D, por su lista «Ver criterios»: lee del dueño. */
  v2d(clave) {
    var o = {};
    try { if (typeof v2dEstado === 'function') { var E = v2dEstado();
      o.est = E ? JSON.stringify(E).length : null } } catch (e) { o.est = 'EXC' }
    try { if (typeof V2D_PORQUE !== 'undefined' && V2D_PORQUE[clave])
      o.crit = V2D_PORQUE[clave].crit.map(function(c){ return c.id }) } catch (e) { o.crit = 'EXC' }
    return o },

  /* ══ PRO-C — ABRIR LAS CAJAS DE LA TRICUSPIDE Y DE LA PULMONAR ═══════════════════════════
     Las dos lesiones de cada valvula viven en un cajon «Datos» que nace cerrado, y lo que esta
     en display:none no tiene geometria: sin abrirlo se tipea en la nada y todas las escenas
     salen «sin cambios», indistinguible de «el cableado no funciona». */
  /* ══ Q: LAS CUATRO SECCIONES DE VALVULA Y LOS OCHO CAJONES ════════════════════════════════
     abrirValv abre los cajones de la mitral y de la aortica pero NO sus secciones plegables
     (ete-seccion-valv-mitral / -aortica), que nacen en display:none: sin ellas las cuatro
     pastillas de esas dos valvulas miden 0x0 y la medicion informa «no hay lugar» sobre una
     pantalla perfecta. Medido. */
  abrirTodasValv() {
    var o = {};
    try { showTab('valvulas'); o.tab = 'ok' } catch (e) { o.tab = 'EXC: ' + e.message }
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(sx){
      try { var c = document.getElementById('ete-seccion-' + sx);
        if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function')
          toggleEteSeccion(sx);
        o['sec:' + sx] = c ? getComputedStyle(c).display : 'NO EXISTE';
      } catch (e) { o['sec:' + sx] = 'EXC: ' + e.message } });
    ['caja-insuf-mitral','caja-esten-mitral','caja-insuf-aortica','caja-esten-aortica',
     'caja-insuf-tricuspide','caja-esten-tricuspide',
     'caja-insuf-pulmonar','caja-esten-pulmonar'].forEach(function(id){
      try { var c = document.getElementById(id);
        if (c && getComputedStyle(c).display === 'none' && typeof valvDatosTog === 'function')
          valvDatosTog(id);
        o[id] = c ? getComputedStyle(c).display : 'NO EXISTE';
      } catch (e) { o[id] = 'EXC: ' + e.message } });
    return o },

  abrirVtVp() {
    var o = {};
    try { showTab('valvulas'); o.tab = 'ok' } catch (e) { o.tab = 'EXC: ' + e.message }
    /* ADVERTENCIA: PRIMERO LA SECCION PLEGABLE DE LA VALVULA, Y ES LA PUERTA QUE COSTO UNA
       CORRIDA. Los dos bloques de protesis viven dentro de ete-seccion-valv-tricuspide y de
       ete-seccion-valv-pulmonar, que nacen en display:none: sin abrirlas, valvProtSync muestra
       el bloque y aun asi un ancestro lo esconde, asi que la sonda informo «el bloque no
       aparece con protesis» con el cableado perfecto. El prefijo ete-seccion- es historico;
       estas dos son de la pestaña Valvulas. */
    ['valv-tricuspide','valv-pulmonar'].forEach(function(sx){
      try { var c = document.getElementById('ete-seccion-' + sx);
        if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function')
          toggleEteSeccion(sx);
        o['sec:' + sx] = c ? getComputedStyle(c).display : 'NO EXISTE';
      } catch (e) { o['sec:' + sx] = 'EXC: ' + e.message } });
    ['caja-esten-tricuspide','caja-insuf-tricuspide',
     'caja-esten-pulmonar','caja-insuf-pulmonar'].forEach(function(id){
      try { var c = document.getElementById(id);
        if (c && getComputedStyle(c).display === 'none' && typeof valvDatosTog === 'function')
          valvDatosTog(id);
        o[id] = c ? getComputedStyle(c).display : 'NO EXISTE';
      } catch (e) { o[id] = 'EXC: ' + e.message } });
    return o },

  /* ══ PRO-C2 — LA OBSTRUCCION DE LA PROTESIS TRICUSPIDE ═══════════════════════════════════
     Se lee el OBJETO del dueño Y la capsula de pantalla: el objeto decide y la capsula se ve.
     Medir solo el texto deja pasar un veredicto que cambia sin que el texto lo diga; medir solo
     el objeto deja pasar una capsula que no se repinta. */
  protVt() {
    var R = null;
    try { R = (typeof vtProtObstr === 'function') ? vtProtObstr() : 'SIN FN' }
    catch (e) { R = 'EXC: ' + e.message }
    var crit = null;
    try { crit = (typeof vtProtObstrCrit === 'function' && R && R.pos) ? vtProtObstrCrit(R) : null }
    catch (e) { crit = 'EXC' }
    return { motor: R, crit: crit,
             cajaVis: window.__P.vis('bloque-prot-vt-res'),
             filas: { evmax: window.__P.txt('vt-prot-evmax'),
                      gmed:  window.__P.txt('vt-prot-gmed'),
                      thp:   window.__P.txt('vt-prot-thp'),
                      aeo:   window.__P.txt('vt-prot-aeo'),
                      dvi:   window.__P.txt('vt-prot-dvi') },
             obstr: window.__P.txt('vt-prot-obstr'),
             etSev: window.__P.txt('et-sev'),
             etGrado: window.__P.val('et_grado'),
             morf: window.__P.val('vt_morf'),
             campos: { et_e_vmax: window.__P.val('et_e_vmax'),
                       et_gmedio: window.__P.val('et_gmedio'),
                       et_thp: window.__P.val('et_thp'),
                       et_avt: window.__P.val('et_avt'),
                       vt_dvi: window.__P.val('vt_dvi') } } },

  /* ══ PRO-C3 — LA OBSTRUCCION DE LA PROTESIS PULMONAR ═════════════════════════════════════ */
  protVp() {
    var R = null;
    try { R = (typeof vpProtObstr === 'function') ? vpProtObstr() : 'SIN FN' }
    catch (e) { R = 'EXC: ' + e.message }
    var crit = null;
    try { crit = (typeof vpProtObstrCrit === 'function' && R && R.pos) ? vpProtObstrCrit(R) : null }
    catch (e) { crit = 'EXC' }
    return { motor: R, crit: crit,
             cajaVis: window.__P.vis('bloque-prot-vp-res'),
             filas: { vmax: window.__P.txt('vp-prot-vmax'),
                      gmed: window.__P.txt('vp-prot-gmed') },
             obstr: window.__P.txt('vp-prot-obstr'),
             epSev: window.__P.txt('ep-sev'),
             epGrado: window.__P.val('ep_grado'),
             morf: window.__P.val('vp_morf'),
             tipo: window.__P.val('vp_tipo_prot'),
             campos: { ep_vmax: window.__P.val('ep_vmax'),
                       ep_gmax: window.__P.val('ep_gmax'),
                       ep_gmedio: window.__P.val('ep_gmedio'),
                       vp_dvi: window.__P.val('vp_dvi') } } },

  /* La REGURGITACION de las dos valvulas, para el control negativo: la ASE 2024 la gradua con
     los criterios de la valvula nativa, asi que el grado tiene que ser IDENTICO con morfologia
     nativa y con protesis sobre los mismos datos. */
  regurg() {
    var ipS = null;
    try { ipS = (typeof ipSignos === 'function') ? ipSignos().map(function(x){
      return x.clave + ':' + x.valor + ':' + (x.grado || '-') }) : 'SIN FN' } catch (e) { ipS = 'EXC' }
    return { it: { grado: window.__P.val('it_grado'),
                   vc: window.__P.txt('it-ref-vc'), eroa: window.__P.txt('it-eroa'),
                   volr: window.__P.txt('it-volr'), sev: window.__P.txt('it-sev'),
                   disc: window.__P.txt('it-discordancia'),
                   calc: (function(){ try { return (typeof sevCalcPublicable === 'function')
                     ? sevCalcPublicable('it') : 'SIN FN' } catch (e) { return 'EXC' } })() },
             ip: { grado: window.__P.val('ip_grado'), signos: ipS,
                   sev: window.__P.txt('ip-sev'),
                   calcG: (function(){ try { return (typeof ipGradoCalculado === 'function')
                     ? ipGradoCalculado() : 'SIN FN' } catch (e) { return 'EXC' } })(),
                   pht: window.__P.txt('ip-ref-pht'), ancho: window.__P.txt('ip-ref-ancho'),
                   senal: window.__P.txt('ip-ref-senal'), rev: window.__P.txt('ip-ref-rev') } } },

  /* ══ LA VISTA 2D ═════════════════════════════════════════════════════════════════════════
     Se lee el ESTADO que alimenta las tarjetas, no el HTML pintado: el dibujo es cualitativo y
     lo que esta tanda puede mover es la frase de la columna de estenosis. */
  v2d() {
    var E = null;
    try { E = (typeof v2dEstado === 'function') ? v2dEstado() : 'SIN FN' } catch (e) { E = 'EXC: ' + e.message }
    if (!E || typeof E === 'string') return { estado: E };
    var simple = function(a){ return (a || []).map(function(x){
      return { valv: x.valv, morf: x.morf, frase: x.frase, chip: x.chip,
               /* ADVERTENCIA: _v2dPorQue devuelve filas, no crit. La primera version leia
                  crit —el nombre del campo de la TABLA V2D_PORQUE— y daba nCrit 0 en las dos
                  protesis, que se lee igual que «la tarjeta no tiene criterios». */
               pq: x.pq ? { decide: x.pq.decide, manual: !!x.pq.manual,
                            nFilas: (x.pq.filas || []).length,
                            filas: (x.pq.filas || []).map(function(f){
                              return (f && (f.lbl || f.rotulo || '')) + '=' + (f && (f.val || f.valor || '')) }) } : null } }) };
    return { esten: simple(E.esten), insuf: simple(E.insuf),
             pt: E.pt, et: E.et, it: E.it,
             nodos: document.querySelectorAll('*').length,
             abierto: (function(){ try { return (typeof v2dVisible === 'function') ? v2dVisible() : null }
               catch (e) { return 'EXC' } })() } },

  v2dCiclo(n) {
    /* ADVERTENCIA: UNA VUELTA DE CALENTAMIENTO ANTES DE CONTAR, Y ES LA LECCION DEL PRO-B. El
       primer pintado del panel CREA los nodos de su contenido y despues los reusa, asi que un
       conteo tomado con el panel nunca abierto informa esos nodos como una acumulacion. Medido
       en esta misma tanda: la primera corrida dio +17 sobre un panel que no acumula ninguno. */
    var o = {};
    try { if (typeof v2dAbrir === 'function') { v2dAbrir(); v2dCerrar() } } catch (e) { o.calentar = 'EXC' }
    o.antes = document.querySelectorAll('*').length;
    try {
      if (typeof v2dVisible === 'function' && v2dVisible() && typeof v2dCerrar === 'function') v2dCerrar();
      for (var i = 0; i < (n || 20); i++) { v2dAbrir(); v2dCerrar() }
      o.despues = document.querySelectorAll('*').length;
      o.delta = o.despues - o.antes;
      o.abierto = (typeof v2dVisible === 'function') ? v2dVisible() : null;
    } catch (e) { o.err = 'EXC: ' + e.message }
    return o },

  /* El juego de campos que viaja con el estudio, para probar que los tres nuevos entran y que
     ninguna columna del Excel los nombra. El hash va ORDENADO: el objeto se arma en orden del
     DOM, asi que mover un campo de lugar cambiaria el string sin cambiar un solo valor. */
  camposGuardados() {
    var c = {};
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
      if (e.type === 'checkbox' || e.type === 'radio') c[e.id + '__chk'] = e.checked ? '1' : '0';
      else c[e.id] = e.value;
    });
    var ks = Object.keys(c).sort();
    var h = 0, s = ks.map(function(k){ return k + '=' + c[k] }).join('|');
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0 }
    var NUEVOS = ['et_e_vmax','vp_tipo_prot','ep_gmedio'];
    return { n: ks.length, hash: h,
             nuevos: NUEVOS.filter(function(k){ return ks.indexOf(k) >= 0 }),
             valores: (function(){ var o = {}; NUEVOS.forEach(function(k){ o[k] = c[k] }); return o })(),
             hashSinNuevos: (function(){
               var s2 = ks.filter(function(k){ return NUEVOS.indexOf(k) < 0 })
                          .map(function(k){ return k + '=' + c[k] }).join('|');
               var h2 = 0; for (var i = 0; i < s2.length; i++) { h2 = ((h2 << 5) - h2 + s2.charCodeAt(i)) | 0 }
               return h2 })() } },

  /* Que NINGUNA columna del Excel nombre a los tres campos nuevos: el conteo y el censo por
     nombre de encabezado, que es como el importador lee. */
  censoCols() {
    if (typeof _labExcelRow !== 'function') return 'SIN FN';
    try { var ks = Object.keys(_labExcelRow({ id: 0, campos: {} }));
      var bajo = ks.map(function(k){ return k.toLowerCase() });
      var con = function(s){ return bajo.filter(function(x){ return x.indexOf(s) >= 0 }) };
      return { n: ks.length,
               gmedioPulm: con('gradiente medio pulmon').concat(con('gmedio pulm')),
               tipoProt: con('tipo pr'),
               eVmax: con('velocidad pico de e') } } catch (e) { return 'EXC: ' + e.message } },

  /* Nada de esto se guarda en el navegador: las claves que nombren la zona. */
  almacen() {
    var o = { ls: [], ss: [] };
    try { for (var i = 0; i < localStorage.length; i++) o.ls.push(localStorage.key(i)) } catch (e) { o.ls = 'EXC' }
    try { for (var j = 0; j < sessionStorage.length; j++) o.ss.push(sessionStorage.key(j)) } catch (e) { o.ss = 'EXC' }
    var mio = function(a){ return (a === 'EXC') ? a : a.filter(function(k){
      return /prot_?tri|prot_?pulm|vp_tipo|ep_gmedio|et_e_vmax|vt-prot|vp-prot/i.test(k) }) };
    return { nLs: (o.ls === 'EXC') ? 'EXC' : o.ls.length, mios: mio(o.ls), miosSS: mio(o.ss) } },

  /* El scroll horizontal de la pagina y el de la caja nueva, a un ancho dado. */
  anchos(ids) {
    var d = document.documentElement;
    var o = { pagina: { sw: d.scrollWidth, cw: d.clientWidth, ok: d.scrollWidth <= d.clientWidth + 1 },
              vw: window.innerWidth, cajas: {} };
    (ids || []).forEach(function(id){ var e = document.getElementById(id);
      if (!e) { o.cajas[id] = 'NO EXISTE'; return }
      var r = e.getBoundingClientRect();
      o.cajas[id] = { w: Math.round(r.width), h: Math.round(r.height),
                      sw: e.scrollWidth, cw: e.clientWidth,
                      dentro: r.right <= window.innerWidth + 1,
                      vis: getComputedStyle(e).display !== 'none' } });
    return o },
  nuevo() {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true); return 'ok' }
    catch (e) { return 'EXC: ' + e.message } }
};
1;
`;


/* == Escenas del PRO-C ========================================================================
   LA PROTESIS TRICUSPIDE. Los insumos del area por continuidad viven en la pestaña VD/AD y
   tienen espejo en esta tarjeta (`et_tsvd_diam` / `et_vti_tsvd`, dueños `tsvd_diametro` /
   `vti_tsvd`). Con diametro 20 mm y VTI del TSVD 20 cm el numerador es pi*(20/20)^2*20 = 62,83,
   asi que el VTI de entrada elige el area:
     VTI entrada 45 cm -> area 1,40 cm2   (POSITIVO para bio, <1,5; NEGATIVO para mecanica, <2,0)
     VTI entrada 32 cm -> area 1,96 cm2   (NEGATIVO para bio; POSITIVO para mecanica)
     VTI entrada 20 cm -> area 3,14 cm2   (NEGATIVO para los dos)
   ⚠️ EL VTI DE ENTRADA ES ADEMAS CRITERIO DE LA ET NATIVA (>=60 cm) y su banda es 5-100 cm: los
   tres valores de arriba estan dentro y ninguno llega al 60, asi que no mueven el veredicto
   nativo. Es el denominador que hace comparable la escena protesica con la nativa. */
/* La escena base de la protesis MITRAL (grupo de controles), calcada del PRO-B: con VTI del
   TSVI 20 y VTI mitral 52 el DVI da 2,60 (significativa) y el AEO 1,21 (posible). */
const VM_BASE = { em_dtsvi: '20', em_vtitsvi: '20', em_vtimit: '40' };
const VT_BASE = { et_tsvd_diam: '20', et_vti_tsvd: '20', et_vti_diast: '20' };

/* ══ LOS HELPERS QUE AGREGA ESTA TANDA ════════════════════════════════════════════════════════
   Se inyectan DESPUES de la sonda del PRO-C y se cuelgan del mismo `window.__P`. */
const SONDA2 = `
(function(){
  var P = window.__P;

  /* La POSICION de un nodo respecto de otro, por contencion y por orden en el documento: es lo
     que distingue «esta dentro del cuadro» de «esta despues del cuadro». */
  P.pos = function(id, refId) {
    var a = document.getElementById(id), b = document.getElementById(refId);
    if (!a) return { err: 'NO EXISTE ' + id };
    if (!b) return { err: 'NO EXISTE ' + refId };
    var rel = a.compareDocumentPosition(b);
    return { dentroDe: b.contains(a), contiene: a.contains(b),
             /* 2 = b precede a a; 4 = b sigue a a */
             refPrecede: !!(rel & 2), refSigue: !!(rel & 4),
             padre: a.parentElement ? (a.parentElement.id || a.parentElement.className || a.parentElement.tagName) : null,
             y: Math.round(a.getBoundingClientRect().top),
             yRef: Math.round(b.getBoundingClientRect().top) };
  };

  /* Las dos superficies firmadas de un tiron, con el estilo FIJADO en la escena. */
  P.papel = function() {
    var o = {};
    ['conciso','estandar','narrativo'].forEach(function(e){ o[e] = P.informe(e) });
    return o;
  };

  /* El suplementario del Ar-A de la ASE 2025, por su dueño y por la fila que publica. */
  P.ara = function() {
    var o = { dur: null, cumple: null, rot: null, veredicto: P.txt('dd-interp') };
    try { o.dur = (typeof venpArA === 'function') ? venpArA() : 'SIN FN' } catch (e) { o.dur = 'EXC' }
    try {
      var E = (typeof ASE_SUPLEMENTARIOS !== 'undefined')
        ? ASE_SUPLEMENTARIOS.filter(function(q){ return q.clave === 'arA' })[0] : null;
      if (!E) { o.cumple = 'SIN ENTRADA'; }
      else { o.rot = E.rot; o.cumple = !!E.cumple(E.leer()); }
    } catch (e) { o.cumple = 'EXC: ' + e.message }
    o.ventana = P.txt('diast-algo-res');
    return o;
  };

  /* El Laboratorio: el orden de lectura de las cuatro clases de FEVI, el filtro de cohorte por
     sus cuatro opciones y los dos subgrupos del PPT. Se le pregunta al DUEÑO y a los controles
     reales; nada se reimplementa. */
  P.labFevi = function(pobl) {
    var o = { ordOpc: null, cohOpc: null, cohLbl: {}, cohCuenta: {}, cats: null, cohDueno: {} };
    try { o.cats = FEVI_CATS.map(function(c){ return { clave: c.clave, rango: c.rango, rot: c.rot } }) }
    catch (e) { o.cats = 'EXC' }
    var sel = document.getElementById('coh-fevi');
    o.cohOpc = sel ? Array.prototype.slice.call(sel.options).map(function(x){ return x.value + '|' + x.textContent.trim() }) : 'NO EXISTE';
    try {
      ['preservada','leve','moderada','severa','baja','media','alta'].forEach(function(k){
        o.cohLbl[k] = (typeof _lblDe === 'function') ? _lblDe(_COH_LBL.fevi, k) : _COH_LBL.fevi[k];
        /* ⚠️ \`_labCohorteOk(inf)\` TOMA UN SOLO ARGUMENTO y lee la variable de modulo
           \`_LAB_COHORTE\`: pasarle un criterio por parametro lo IGNORA, y con la cohorte vacia
           devuelve \`true\` para todo —medido: las siete claves daban el total de la poblacion, un
           denominador roto con pinta de medicion buena—. Se escribe el CONTROL REAL y se llama al
           dueño que lo lee. */
        var n = 0, dueno = null;
        try {
          var selc = document.getElementById('coh-fevi');
          if (selc) {
            var tiene = Array.prototype.slice.call(selc.options).some(function(x){ return x.value === k });
            /* ⚠️ UN CRITERIO DE COHORTE INCOMPLETO RECHAZA TODO, y es la trampa que este repo ya
               tiene escrita: \`_labCohorteOk\` evalua TODOS sus criterios y una clave ausente deja
               comparaciones contra \`undefined\` —\`undefined !== null\` es verdadero, asi que entra
               en la rama de la edad y descarta todo estudio sin edad—. Medido: con un objeto
               armado a mano las tres claves de LEGADO daban 0 sobre una poblacion que si matchea.
               Se parte SIEMPRE de un objeto COMPLETO, leido del panel con una opcion que existe,
               y recien ahi se sobreescribe la clave de FEVI. */
            var prim = (Array.prototype.slice.call(selc.options).filter(function(x){ return x.value })[0] || {}).value || '';
            selc.value = tiene ? k : prim;
            if (typeof _labCohorteLeer === 'function') _LAB_COHORTE = _labCohorteLeer();
            if (!tiene && _LAB_COHORTE) _LAB_COHORTE.fevi = k;
            dueno = _LAB_COHORTE ? _LAB_COHORTE.fevi : null;
            (pobl || []).forEach(function(r){ try { if (_labCohorteOk(r)) n++ } catch (e) {} });
          }
        } catch (e) { n = 'EXC: ' + e.message }
        o.cohCuenta[k] = n; o.cohDueno[k] = dueno;
      });
    } catch (e) { o.cohLbl = 'EXC: ' + e.message }
    try { var selz = document.getElementById('coh-fevi'); if (selz) selz.value = '';
          if (typeof _labCohorteLeer === 'function') _LAB_COHORTE = _labCohorteLeer(); } catch (e) {}
    return o;
  };

  /* Los dos toggles de PDF: su estado, el campo que lo guarda y si el PDF los mira. */
  P.toggles = function() {
    return { sglCampo: P.val('sgl_be_pdf'), qxCampo: P.val('ete_qx_pdf'),
             sglOn: (typeof sglPdfOn === 'function') ? sglPdfOn() : 'SIN FN',
             qxOn: (typeof eteQxPdfOn === 'function') ? eteQxPdfOn() : 'SIN FN',
             sglLS: (function(){ try { return localStorage.getItem('sgl_incluir_pdf') } catch(e){ return 'EXC' } })(),
             qxLS: (function(){ try { return localStorage.getItem('mitral_qx_incluir_pdf') } catch(e){ return 'EXC' } })(),
             sglBtn: (function(){ var b = document.getElementById('sgl-pdf-toggle');
               return b ? b.className : 'NO EXISTE' })(),
             qxBtn: (function(){ var b = document.getElementById('ete-qx-pdf');
               return b ? b.className : 'NO EXISTE' })() };
  };
  P.clicId = function(id) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return { err: 'SIN GEOMETRIA ' + id };
    e.click();
    return { ok: true };
  };

  /* Las claves del estudio que empiezan con un prefijo, con su valor: es lo que prueba que los
     campos nuevos VIAJAN. El helper camposGuardados devuelve el conteo y el hash, no las claves. */
  P.camposPref = function(pref) {
    var o = {};
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
      var k = (e.type === 'checkbox' || e.type === 'radio') ? e.id + '__chk' : e.id;
      if (k.indexOf(pref) === 0) o[k] = (e.type === 'checkbox' || e.type === 'radio') ? (e.checked ? '1' : '0') : e.value;
    });
    return o;
  };

  /* El encabezado del PDF de amiloidosis, con el dueño de la identificacion impresa. */
  P.amiloId = function() {
    var o = { elegido: null, impreso: null };
    try { o.elegido = (typeof pacIdElegido === 'function') ? pacIdElegido() : 'SIN FN' } catch (e) { o.elegido = 'EXC' }
    try { var r = (typeof pacIdImpreso === 'function') ? pacIdImpreso(undefined, 'CI') : null;
          o.impreso = r ? (r.lbl + ': ' + r.val) : null } catch (e) { o.impreso = 'EXC' }
    return o;
  };

  /* Los hallazgos nuevos de la pestaña Otros, por su dueño y por el papel. */
  P.otros = function() {
    var o = {};
    try { o.hall = (typeof otrHallazgos === 'function') ? otrHallazgos() : 'SIN FN' } catch (e) { o.hall = 'EXC: ' + e.message }
    try { o.burb = (typeof otrBurbuja === 'function') ? otrBurbuja() : 'SIN FN' } catch (e) { o.burb = 'EXC: ' + e.message }
    o.detVis = P.vis('otr-burb-detalle');
    o.posVis = P.vis('otr-burb-pos');
    o.sepVis = P.vis('pul-lineasb-sep-wrap');
    return o;
  };
  P.chk = function(id, on) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    if (e.checked !== !!on) { e.checked = !!on; e.dispatchEvent(new Event('change', { bubbles: true })); }
    return { ok: true, quedo: e.checked };
  };
  P.setTxt = function(id, v) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    return { ok: true, quedo: e.value };
  };
  P.abrirOtros = function() {
    var o = {};
    try { showTab('otros'); o.tab = 'ok' } catch (e) { o.tab = 'EXC: ' + e.message }
    ['pericardio-masas','pulmonar','burbuja'].forEach(function(k){
      try { var sec = document.getElementById('ete-seccion-' + k);
        if (sec && getComputedStyle(sec).display === 'none' && typeof toggleEteSeccion === 'function')
          toggleEteSeccion(k, null);
        o[k] = sec ? getComputedStyle(sec).display : 'NO EXISTE';
      } catch (e) { o[k] = 'EXC: ' + e.message } });
    return o;
  };
  /* La tarjeta de un globo que CLONA una ficha de Referencias: cuantos nodos trajo y un recorte
     del texto, para ver que trajo la ficha y no un cartel de error. */
  P.globoRef = function(clave) {
    var o = { entrada: null, nodos: null, texto: null };
    try { o.entrada = !!(typeof VINFO !== 'undefined' && VINFO[clave] && typeof VINFO[clave].dyn === 'function') }
    catch (e) { o.entrada = 'EXC' }
    if (o.entrada !== true) return o;
    try { var n = VINFO[clave].dyn();
          o.nodos = n ? n.childNodes.length : null;
          o.texto = n ? String(n.textContent || '').replace(/[ ]+/g, ' ').trim().slice(0, 220) : null; }
    catch (e) { o.texto = 'EXC: ' + e.message }
    return o;
  };
  return 1;
})()
`;

const SONDA3 = `
window.__Q = {
  /* ══ Los ocho botones: existen, tienen geometria y su clave ════════════════════════════════ */
  botones() {
    var o = {};
    ['insuf','esten'].forEach(function(t){
      ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
        var k = 'tarj-' + t + '-' + v;
        var b = document.querySelector('[data-vinfo="' + k + '"]');
        if (!b) { o[k] = 'NO EXISTE'; return }
        var r = b.getBoundingClientRect();
        var sev = document.getElementById('sevbtn-' + t + '-' + v);
        var rs = sev ? sev.getBoundingClientRect() : null;
        o[k] = { w: Math.round(r.width), h: Math.round(r.height),
                 x: Math.round(r.left), y: Math.round(r.top),
                 tag: b.tagName, tieneTitle: b.hasAttribute('title'),
                 aria: b.getAttribute('aria-expanded'),
                 /* ARRIBA de la selectora: su borde inferior tiene que quedar por encima del
                    borde superior del boton de severidad. */
                 encima: rs ? (Math.round(r.bottom) <= Math.round(rs.top) + 1) : null,
                 padre: b.parentNode ? (b.parentNode.className || '') : null };
      });
    });
    return o },

  /* La ALTURA de la fila de botones de una valvula: es lo que la columna hace crecer. */
  filaAlto(valv) {
    var p = document.getElementById('pill-insuf-' + valv);
    if (!p) return 'NO EXISTE';
    var fila = p.parentNode ? p.parentNode.parentNode : null;
    if (!fila) return 'SIN FILA';
    var r = fila.getBoundingClientRect();
    var pr = p.getBoundingClientRect();
    return { fila: Math.round(r.height), pill: Math.round(pr.width) } },

  /* Abrir una tarjeta por su clave, con un clic real lo hace el arnes; esto informa el estado. */
  card() {
    var c = document.getElementById('vinfo-card');
    if (!c) return 'NO EXISTE vinfo-card';
    var r = c.getBoundingClientRect();
    return { display: c.style.display, dyn: c.getAttribute('data-ev-dyn'),
             w: Math.round(r.width), h: Math.round(r.height),
             x: Math.round(r.left), y: Math.round(r.top),
             abiertas: document.querySelectorAll('[data-vinfo][aria-expanded="true"]').length,
             texto: (c.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 900) } },

  /* El CONTENIDO estructurado de la tarjeta abierta, para compararlo contra el dueno. */
  cardDatos() {
    var c = document.getElementById('vinfo-card');
    if (!c || c.style.display === 'none') return 'CERRADA';
    var q = function(sel){ return Array.prototype.slice.call(c.querySelectorAll(sel)) };
    var tx = function(e){ return (e.textContent || '').replace(/\\s+/g, ' ').trim() };
    return {
      tit:    (c.querySelector('h4') ? tx(c.querySelector('h4')) : null),
      grado:  (c.querySelector('[data-qv-grado]') ? tx(c.querySelector('[data-qv-grado]')) : null),
      gradoCls: (c.querySelector('[data-qv-grado]') ? c.querySelector('[data-qv-grado]').className : null),
      morf:   (c.querySelector('[data-qv-morf]') ? tx(c.querySelector('[data-qv-morf]')) : null),
      filas:  q('[data-qv-row]').map(function(r){
                var n = r.querySelector('.qv-nom'), v = r.querySelector('.qv-val'),
                    g = r.querySelector('.qv-g'), m = r.querySelector('.qv-marca');
                return { nom: n ? tx(n) : null, val: v ? tx(v) : null,
                         grado: g ? tx(g) : null, decide: !!m } }),
      barras: q('[data-ev-barra]').map(function(b){ return b.getAttribute('data-ev-barra') }),
      puntos: q('[data-ev-punto]').map(function(b){ return b.getAttribute('data-ev-punto') }),
      cortes: q('[data-ev-corte]').map(function(b){ return tx(b) }),
      apoyo:  (c.querySelector('[data-qv-apoyo]') ? tx(c.querySelector('[data-qv-apoyo]')) : null),
      decide: (c.querySelector('[data-qv-decide]') ? tx(c.querySelector('[data-qv-decide]')) : null),
      aviso:  (c.querySelector('[data-qv-aviso]') ? tx(c.querySelector('[data-qv-aviso]')) : null),
      manual: (c.querySelector('[data-qv-manual]') ? tx(c.querySelector('[data-qv-manual]')) : null),
      vacio:  (c.querySelector('[data-qv-vacio]') ? tx(c.querySelector('[data-qv-vacio]')) : null),
      fuentes: q('[data-ev-fuente]').map(function(b){ return tx(b) }),
      scrollInterno: Math.max(0, c.scrollHeight - c.clientHeight)
    } },

  /* El DUENO, leido aparte: es contra esto que se compara la tarjeta. */
  dueno(tipo, valv) {
    var o = { tipo: tipo, valv: valv };
    try { o.clave = (typeof _qvClave === 'function') ? _qvClave(tipo, valv) : 'SIN FN' }
    catch (e) { o.clave = 'EXC' }
    try { o.pastilla = (typeof _v2dPastilla === 'function') ? _v2dPastilla(tipo, valv) : 'SIN FN' }
    catch (e) { o.pastilla = 'EXC' }
    try {
      var k = (o.clave && o.clave.k) ? o.clave.k : (tipo + ':' + valv);
      var R = (typeof _v2dPorQue === 'function') ? _v2dPorQue(k) : null;
      o.pq = R ? { decide: R.decide || '', manual: !!R.manual, aviso: R.aviso || '',
                   filas: (R.filas || []).map(function(f){
                     return { nom: f.nom, val: f.val, grado: f.grado,
                              decide: !!f.decide, retiro: !!f.retiro, noVota: !!f.noVota } }) }
            : null;
    } catch (e) { o.pq = 'EXC: ' + e.message }
    return o },

  nodos() { return document.getElementsByTagName('*').length },
  almacen() {
    var o = { local: [], session: [] };
    try { for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i); if (/tarj|qv|vinfo/i.test(k)) o.local.push(k) } } catch(e){}
    try { for (var j = 0; j < sessionStorage.length; j++) {
      var k2 = sessionStorage.key(j); if (/tarj|qv|vinfo/i.test(k2)) o.session.push(k2) } } catch(e){}
    return o }
};
1`;

async function main() {
  let OUT = null;

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
  /* ⚠️ TOLERANTE A PROPOSITO, Y SOLO PARA EL GRUPO `campos`. Contra el arbol de HEAD los tres
     campos del PRO-C1 NO EXISTEN, asi que `tipear` aborta —que es lo correcto— y el grupo entero
     se muere sin informar nada. Esto informa la ausencia y sigue, de modo que el A/B pueda
     comparar «no existia» contra «existe y se ve»: sin eso el lado de HEAD queda VACIO y la
     comparacion deja de distinguir «se agrego» de «se rompio». NO se usa en ningun grupo que
     mida un veredicto: ahi un tecleo que no ocurre tiene que abortar. */
  async function tipearSiHay(id, texto) {
    const hay = await ev(`window.__P.existe(${JSON.stringify(id)})`);
    if (!hay) return { noExiste: true };
    return { ok: await tipear(id, texto) };
  }
  async function viewport(w, h) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: h || 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  }

  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2800);
  await evCrudo(SONDA);
  await evCrudo(SONDA2);
  await evCrudo(SONDA3);

  const avisoIni = await ev(`window.__P.despejar()`);
  const out = { file: FARG, md5Ini, avisoIni, grupos: {} };
  OUT = out;
  const SOLOG = (arg('--solo') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const corre = (g) => !SOLOG.length || SOLOG.indexOf(g) >= 0;

  async function escenaVM(morf, vtimit, extra) {
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirValv()`);
    await tipear('peso', '80'); await tipear('talla', '180');
    const s = await ev(`window.__P.sel('vm_morf', ${JSON.stringify(morf)})`);
    if (s && s.err) throw new Error('DENOMINADOR vm_morf: ' + JSON.stringify(s));
    for (const k of Object.keys(VM_BASE)) await tipear(k, k === 'em_vtimit' ? String(vtimit) : VM_BASE[k]);
    for (const k of Object.keys(extra || {})) {
      if (extra[k] === '') continue;
      await tipear(k, String(extra[k]));
    }
    return ev(`window.__P.prot()`);
  }

  /* La escena base de la protesis tricuspide, con teclas reales.
     ⚠️ DENOMINADOR: se devuelve la morfologia y el area para que el lector pueda ver que la
     escena de verdad llego a la capsula. Sin eso, un `vt_morf` que no quedo informa el mismo
     objeto en todas las escenas, que se lee igual que «la regla no funciona». */
  async function escenaVT(morf, extra) {
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirVtVp()`);
    if (morf !== null) {
      const s = await ev(`window.__P.sel('vt_morf', ${JSON.stringify(morf)})`);
      if (s && s.err) throw new Error('DENOMINADOR vt_morf: ' + JSON.stringify(s));
    }
    for (const k of Object.keys(VT_BASE)) {
      if (Object.prototype.hasOwnProperty.call(extra || {}, k)) continue;
      await tipear(k, VT_BASE[k]);
    }
    for (const k of Object.keys(extra || {})) {
      if (extra[k] === '') continue;
      await tipear(k, String(extra[k]));
    }
    return ev(`window.__P.protVt()`);
  }

  /* La escena base de la protesis pulmonar. `tipo` es el campo nuevo del PRO-C1 y es el que
     elige la columna de cortes de la Tabla 15. */
  async function escenaVP(morf, tipo, extra) {
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirVtVp()`);
    if (morf !== null) {
      const s = await ev(`window.__P.sel('vp_morf', ${JSON.stringify(morf)})`);
      if (s && s.err) throw new Error('DENOMINADOR vp_morf: ' + JSON.stringify(s));
    }
    if (tipo !== null) {
      const t = await ev(`window.__P.sel('vp_tipo_prot', ${JSON.stringify(tipo)})`);
      if (t && t.err) return { denominadorTipo: t };
    }
    for (const k of Object.keys(extra || {})) {
      if (extra[k] === '') continue;
      await tipear(k, String(extra[k]));
    }
    return ev(`window.__P.protVp()`);
  }

  /* ── 1 · campos ── PRO-C1: los tres campos nuevos y su visibilidad. ─────────────────────
     ⚠️ SE MIDE LA VISIBILIDAD CON LAS CUATRO MORFOLOGIAS y no solo con una: lo que hay que
     probar es que el campo APARECE con protesis y DESAPARECE con nativa, y una sola lectura no
     distingue «se muestra siempre» de «se muestra cuando corresponde». */
  if (corre('campos')) {
    const g = { vt: {}, vp: {} };
    const MORF_VT = ['Normal', 'Prótesis biológica', 'Prótesis mecánica'];
    const MORF_VP = ['Normal', 'Prótesis biológica', 'Prótesis mecánica'];
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirVtVp()`);
    g.existe = await ev(`(function(){ return {
      et_e_vmax: window.__P.existe('et_e_vmax'),
      vp_tipo_prot: window.__P.existe('vp_tipo_prot'),
      ep_gmedio: window.__P.existe('ep_gmedio') } })()`);
    g.opcionesTipo = await ev(`(function(){ var e = document.getElementById('vp_tipo_prot');
      return e ? Array.prototype.slice.call(e.options).map(function(o){
        return o.value + '|' + (o.textContent || '').trim() }) : 'NO EXISTE' })()`);
    for (const m of MORF_VT) {
      await ev(`window.__P.sel('vt_morf', ${JSON.stringify(m)})`);
      g.vt[m] = { bloque: await ev(`window.__P.vis('bloque-prot-vt')`),
                  campo: await ev(`window.__P.geo('et_e_vmax')`),
                  dvi: await ev(`window.__P.geo('vt_dvi')`) };
    }
    for (const m of MORF_VP) {
      await ev(`window.__P.sel('vp_morf', ${JSON.stringify(m)})`);
      g.vp[m] = { bloque: await ev(`window.__P.vis('bloque-prot-vp')`),
                  tipo: await ev(`window.__P.geo('vp_tipo_prot')`),
                  gmedio: await ev(`window.__P.geo('ep_gmedio')`),
                  dvi: await ev(`window.__P.geo('vp_dvi')`) };
    }
    /* Que los tres VIAJAN con el estudio y que NINGUNA columna del Excel los nombra. */
    await ev(`window.__P.sel('vt_morf', 'Prótesis biológica')`);
    await ev(`window.__P.sel('vp_morf', 'Prótesis biológica')`);
    await ev(`window.__P.sel('vp_tipo_prot', 'bio')`);
    g.tecleo = { et_e_vmax: await tipearSiHay('et_e_vmax', '2.4'),
                 ep_gmedio: await tipearSiHay('ep_gmedio', '18') };
    g.campos = await ev(`window.__P.camposGuardados()`);
    g.censoCols = await ev(`window.__P.censoCols()`);
    g.excelDOM = await ev(`window.__P.excelDOM()`);
    g.almacen = await ev(`window.__P.almacen()`);
    /* «Nuevo estudio» los vacia, y el bloque vuelve a esconderse. */
    await ev(`window.__P.nuevo()`);
    g.trasNuevo = { et_e_vmax: await ev(`window.__P.val('et_e_vmax')`),
                    ep_gmedio: await ev(`window.__P.val('ep_gmedio')`),
                    tipo: await ev(`window.__P.val('vp_tipo_prot')`),
                    vtVis: await ev(`window.__P.vis('bloque-prot-vt')`),
                    vpVis: await ev(`window.__P.vis('bloque-prot-vp')`) };
    out.grupos.campos = g;
  }

  /* ── 2 · tri ── PRO-C2: la obstruccion de la protesis tricuspide. ───────────────────────
     Las cinco filas de la Tabla 19 por los DOS tipos, mas los controles: nativa (no publica
     veredicto protesico) y protesis sin un solo dato. */
  if (corre('tri')) {
    const g = { escenas: {} };
    const ESC = {
      /* Positivo por el gradiente medio en BIO (>=9) y negativo en MECANICA (>=6): el 7 cae
         entre los dos cortes, asi que la MISMA medicion da distinto por tipo. Es lo que prueba
         que la columna la elige la morfologia. */
      'bio|gmed7':   { morf: 'Prótesis biológica', ex: { et_gmedio: '7' } },
      'mec|gmed7':   { morf: 'Prótesis mecánica',  ex: { et_gmedio: '7' } },
      'bio|gmed9':   { morf: 'Prótesis biológica', ex: { et_gmedio: '9' } },
      'bio|evmax':   { morf: 'Prótesis biológica', ex: { et_e_vmax: '2.1' } },
      'mec|evmax':   { morf: 'Prótesis mecánica',  ex: { et_e_vmax: '2.0' } },
      'bio|thp':     { morf: 'Prótesis biológica', ex: { et_thp: '200' } },
      'mec|thp':     { morf: 'Prótesis mecánica',  ex: { et_thp: '130' } },
      /* El AEO sale por continuidad: VTI de entrada 45 da 1,40 cm2 (positivo bio, negativo mec)
         y 32 da 1,96 (negativo bio, positivo mec). */
      'bio|aeo140':  { morf: 'Prótesis biológica', ex: { et_vti_diast: '45' } },
      'mec|aeo140':  { morf: 'Prótesis mecánica',  ex: { et_vti_diast: '45' } },
      'bio|aeo196':  { morf: 'Prótesis biológica', ex: { et_vti_diast: '32' } },
      'mec|aeo196':  { morf: 'Prótesis mecánica',  ex: { et_vti_diast: '32' } },
      'bio|dvi':     { morf: 'Prótesis biológica', ex: { vt_dvi: '3.3' } },
      'mec|dvi':     { morf: 'Prótesis mecánica',  ex: { vt_dvi: '2.1' } },
      /* CONTROLES NEGATIVOS: nativa con los MISMOS datos, y protesis sin ningun dato. */
      'nativa|gmed9': { morf: 'Normal',             ex: { et_gmedio: '9' } },
      'bio|vacio':    { morf: 'Prótesis biológica', ex: { et_vti_diast: '' } }
    };
    for (const nom of Object.keys(ESC)) {
      const E = ESC[nom];
      g.escenas[nom] = await escenaVT(E.morf, E.ex);
      g.escenas[nom].inf = await ev(`window.__P.informe('estandar')`);
    }
    /* Los TRES estilos sobre la escena que SI publica veredicto. */
    await escenaVT('Prótesis biológica', { et_gmedio: '12', et_thp: '250' });
    g.estilos = {};
    for (const est of ['conciso', 'estandar', 'narrativo'])
      g.estilos[est] = await ev(`window.__P.informe('${est}')`);
    g.estilosObjeto = await ev(`window.__P.protVt()`);
    /* La compuerta del DVI: la nota * de la Tabla 19 lo evalua EN AUSENCIA de IAo o IT. */
    g.dviConIT = await escenaVT('Prótesis biológica', { vt_dvi: '3.5', it_vc: '8' });
    g.dviConIAo = await escenaVT('Prótesis biológica', { vt_dvi: '3.5', ia_vc: '7' });
    out.grupos.tri = g;
  }

  /* ── 3 · tribordes ── cada criterio de la T19 por su borde exacto. ─────────────────────── */
  if (corre('tribordes')) {
    const g = {};
    const B = [
      ['evmax|bio', 'Prótesis biológica', 'et_e_vmax', ['2.0', '2.1', '2.2']],
      ['evmax|mec', 'Prótesis mecánica',  'et_e_vmax', ['1.8', '1.9', '2.0']],
      ['gmed|bio',  'Prótesis biológica', 'et_gmedio', ['8', '9', '10']],
      ['gmed|mec',  'Prótesis mecánica',  'et_gmedio', ['5', '6', '7']],
      ['thp|bio',   'Prótesis biológica', 'et_thp',    ['199', '200', '201']],
      ['thp|mec',   'Prótesis mecánica',  'et_thp',    ['129', '130', '131']],
      ['dvi|bio',   'Prótesis biológica', 'vt_dvi',    ['3.2', '3.3', '3.4']],
      ['dvi|mec',   'Prótesis mecánica',  'vt_dvi',    ['2.0', '2.1', '2.2']]
    ];
    for (const [nom, morf, campo, vals] of B) {
      g[nom] = {};
      for (const vv of vals) {
        const ex = {}; ex[campo] = vv;
        const r = await escenaVT(morf, ex);
        g[nom][vv] = { motor: r.motor, obstr: r.obstr, fila: r.filas, etSev: r.etSev };
      }
    }
    /* El AEO por sus dos bordes, que se alcanzan por el VTI de entrada:
         1,50 cm2 exacto -> VTI = 62,83/1,50 = 41,89 cm   (NEGATIVO en bio: el corte es <1,5)
         1,49            -> VTI = 42,17                    (POSITIVO en bio)
         2,00 exacto     -> VTI = 31,42                    (NEGATIVO en mecanica: <2,0)
         1,99            -> VTI = 31,57                    (POSITIVO en mecanica) */
    g['aeo|bio'] = {};
    for (const vv of ['41.5', '41.89', '42.2']) {
      const r = await escenaVT('Prótesis biológica', { et_vti_diast: vv });
      g['aeo|bio'][vv] = { motor: r.motor, obstr: r.obstr, avt: r.campos.et_avt };
    }
    g['aeo|mec'] = {};
    for (const vv of ['31.1', '31.42', '31.6']) {
      const r = await escenaVT('Prótesis mecánica', { et_vti_diast: vv });
      g['aeo|mec'][vv] = { motor: r.motor, obstr: r.obstr, avt: r.campos.et_avt };
    }
    out.grupos.tribordes = g;
  }

  /* ── 4 · pulm ── PRO-C3: la obstruccion de la protesis pulmonar. ───────────────────────── */
  if (corre('pulm')) {
    const g = { escenas: {} };
    const ESC = {
      /* 2,8 m/s cae ENTRE los dos cortes (bio >=3,2, homo >=2,5): la misma medicion da distinto
         por TIPO, que es lo que prueba que el campo nuevo elige la columna. */
      'bio|v28':   { morf: 'Prótesis biológica', tipo: 'bio',  ex: { ep_vmax: '2.8' } },
      'homo|v28':  { morf: 'Prótesis biológica', tipo: 'homo', ex: { ep_vmax: '2.8' } },
      'bio|v33':   { morf: 'Prótesis biológica', tipo: 'bio',  ex: { ep_vmax: '3.3' } },
      /* El gradiente MEDIO, independiente de la velocidad: 17 cae entre 15 (homo) y 20 (bio). */
      'bio|gm17':  { morf: 'Prótesis biológica', tipo: 'bio',  ex: { ep_gmedio: '17' } },
      'homo|gm17': { morf: 'Prótesis biológica', tipo: 'homo', ex: { ep_gmedio: '17' } },
      'bio|gm21':  { morf: 'Prótesis biológica', tipo: 'bio',  ex: { ep_gmedio: '21' } },
      /* LOS TRES ESTADOS QUE NO GRADUAN: percutanea, tipo sin elegir y protesis MECANICA. */
      'perc|v33':  { morf: 'Prótesis biológica', tipo: 'perc', ex: { ep_vmax: '3.3' } },
      'sinTipo':   { morf: 'Prótesis biológica', tipo: '',     ex: { ep_vmax: '3.3' } },
      'mec|v33':   { morf: 'Prótesis mecánica',  tipo: null,   ex: { ep_vmax: '3.3' } },
      /* CONTROLES NEGATIVOS: nativa con el mismo dato, y protesis sin ningun dato. */
      'nativa|v33':{ morf: 'Normal',             tipo: null,   ex: { ep_vmax: '3.3' } },
      'bio|vacio': { morf: 'Prótesis biológica', tipo: 'bio',  ex: {} }
    };
    for (const nom of Object.keys(ESC)) {
      const E = ESC[nom];
      g.escenas[nom] = await escenaVP(E.morf, E.tipo, E.ex);
      g.escenas[nom].inf = await ev(`window.__P.informe('estandar')`);
    }
    await escenaVP('Prótesis biológica', 'bio', { ep_vmax: '3.5', ep_gmedio: '24' });
    g.estilos = {};
    for (const est of ['conciso', 'estandar', 'narrativo'])
      g.estilos[est] = await ev(`window.__P.informe('${est}')`);
    g.estilosObjeto = await ev(`window.__P.protVp()`);
    /* ⚠️ QUE LA PALABRA «SEVERA» NO APAREZCA POR NINGUN CAMINO, con la escena mas extrema que
       la app admite: la Tabla 15 no tiene columna de severa. Se barre el texto VISIBLE de la
       pestaña Valvulas y las dos superficies firmadas. */
    /* ADVERTENCIA: NO SE BARRE LA CAJA ENTERA, Y LA PRIMERA VERSION DIO UN FALSO. La linea de
       fuente de la capsula dice «no gradua la SEVERidad», asi que buscar la subcadena «sever»
       en el textContent del contenedor informa «dice severa» sobre un texto que afirma
       exactamente lo contrario. Se barren los nodos que PUBLICAN un veredicto —el del
       veredicto y las dos filas— y la palabra se busca como palabra, no como subcadena. */
    g.nuncaSevera = await ev(`(function(){
      var caja = document.getElementById('bloque-prot-vp-res');
      var t = caja ? (caja.textContent || '').toLowerCase() : 'NO EXISTE';
      var veredicto = ['vp-prot-obstr','vp-prot-vmax','vp-prot-gmed','ep-sev','vp-sev-badge']
        .map(function(id){ return (window.__P.txt(id) || '').toLowerCase() }).join(' | ');
      var re = /\\bsever[ao]s?\\b/;
      var i = window.__P.val('informe_texto') || '', s = window.__P.val('en_suma') || '';
      return { caja: t,
               veredicto: veredicto,
               veredictoSevera: re.test(veredicto),
               cajaSeveraCruda: (typeof t === 'string') ? t.indexOf('sever') >= 0 : null,
               infProtPulm: i.split('.').filter(function(f){ return /pulmonar/i.test(f) }),
               sumaProtPulm: s.split('.').filter(function(f){ return /VP |pulmonar/i.test(f) }),
               epSev: window.__P.txt('ep-sev'),
               badge: window.__P.txt('vp-sev-badge') } })()`);
    out.grupos.pulm = g;
  }

  /* ── 5 · pulmbordes ── cada criterio de la T15 por su borde exacto. ───────────────────── */
  if (corre('pulmbordes')) {
    const g = {};
    const B = [
      ['vmax|bio',  'bio',  'ep_vmax',   ['3.1', '3.2', '3.3']],
      ['vmax|homo', 'homo', 'ep_vmax',   ['2.4', '2.5', '2.6']],
      ['gmed|bio',  'bio',  'ep_gmedio', ['19', '20', '21']],
      ['gmed|homo', 'homo', 'ep_gmedio', ['14', '15', '16']]
    ];
    for (const [nom, tipo, campo, vals] of B) {
      g[nom] = {};
      for (const vv of vals) {
        const ex = {}; ex[campo] = vv;
        const r = await escenaVP('Prótesis biológica', tipo, ex);
        g[nom][vv] = { motor: r.motor, obstr: r.obstr, fila: r.filas, epSev: r.epSev };
      }
    }
    out.grupos.pulmbordes = g;
  }

  /* ── 6 · regurg ── LA REGURGITACION NO CAMBIA CON LA PROTESIS. ─────────────────────────
     La ASE 2024 remite la regurgitacion protesica a los criterios de la valvula nativa, y sus
     Tablas 21 (tricuspide) y 16 (pulmonar) coinciden con lo que la app ya aplica. El grado tiene
     que salir IDENTICO con morfologia nativa y con las dos protesis sobre los MISMOS datos. */
  if (corre('regurg')) {
    const g = { it: {}, ip: {} };
    const IT_DATOS = { it_vc: '5', it_pisa_r: '7', it_pisa_val: '40', it_vmax_cw: '3.0', it_vti: '60' };
    for (const m of ['Normal', 'Prótesis biológica', 'Prótesis mecánica']) {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirVtVp()`);
      const s = await ev(`window.__P.sel('vt_morf', ${JSON.stringify(m)})`);
      if (s && s.err) throw new Error('DENOMINADOR vt_morf: ' + JSON.stringify(s));
      for (const k of Object.keys(IT_DATOS)) await tipear(k, IT_DATOS[k]);
      g.it[m] = await ev(`window.__P.regurg()`);
      g.it[m].inf = await ev(`window.__P.informe('estandar')`);
    }
    /* Los TRES bordes de la Tabla 21 que la app ya aplica, en el regimen PROTESICO: la vena
       contracta por sus dos lados del 7, que es donde la ASE 2017 y la ASE 2024 coinciden. */
    g.vcBordes = {};
    for (const vv of ['6.9', '7', '7.1']) {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirVtVp()`);
      await ev(`window.__P.sel('vt_morf', 'Prótesis biológica')`);
      await tipear('it_vc', vv);
      g.vcBordes[vv] = await ev(`window.__P.regurg()`);
    }
    const IP_DATOS = { ip_pht: '80' };
    for (const m of ['Normal', 'Prótesis biológica', 'Prótesis mecánica']) {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirVtVp()`);
      const s = await ev(`window.__P.sel('vp_morf', ${JSON.stringify(m)})`);
      if (s && s.err) throw new Error('DENOMINADOR vp_morf: ' + JSON.stringify(s));
      await ev(`window.__P.abrirPara('ip_pht')`);
      for (const k of Object.keys(IP_DATOS)) await tipear(k, IP_DATOS[k]);
      await ev(`window.__P.sel('ip_ancho','intermedio')`);
      await ev(`window.__P.sel('ip_senal','densa_var')`);
      g.ip[m] = await ev(`window.__P.regurg()`);
      g.ip[m].inf = await ev(`window.__P.informe('estandar')`);
    }
    /* El borde del THP de la IP: <100 ms severa (ASE 2019, folio 463). No se movio. */
    g.phtBordes = {};
    for (const vv of ['99', '100', '101']) {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirVtVp()`);
      await ev(`window.__P.sel('vp_morf', 'Prótesis biológica')`);
      await ev(`window.__P.abrirPara('ip_pht')`);
      await tipear('ip_pht', vv);
      g.phtBordes[vv] = await ev(`window.__P.regurg()`);
    }
    out.grupos.regurg = g;
  }

  /* ── 7 · v2d ── LA VISTA 2D. ────────────────────────────────────────────────────────────
     La pulmonar NO esta en la vista 2D (`V2D_VALVS` tiene mitral, aortica y tricuspide), asi
     que lo unico que esta tanda puede mover ahi es la columna de estenosis de la tricuspide. */
  if (corre('v2d')) {
    const g = {};
    g.sinDatos = await (async () => { await ev(`window.__P.nuevo()`); return ev(`window.__P.v2d()`) })();
    await escenaVT('Prótesis biológica', { et_gmedio: '12' });
    g.protBio = await ev(`window.__P.v2d()`);
    await escenaVT('Prótesis mecánica', { et_gmedio: '3' });
    g.protMecNeg = await ev(`window.__P.v2d()`);
    await escenaVT('Normal', { et_gmedio: '12' });
    g.nativa = await ev(`window.__P.v2d()`);
    /* 20 aperturas y cierres: ni un nodo ni un oyente de mas. */
    await escenaVT('Prótesis biológica', { et_gmedio: '12' });
    g.ciclo = await ev(`window.__P.v2dCiclo(20)`);
    out.grupos.v2d = g;
  }

  /* ── 8 · maqueta ── los dos temas y los cuatro anchos. ────────────────────────────────── */
  if (corre('maqueta')) {
    const g = { celdas: {} };
    const IDS = ['bloque-prot-vt', 'bloque-prot-vt-res', 'bloque-prot-vp', 'bloque-prot-vp-res'];
    /* ADVERTENCIA: LA ESCENA SE CARGA UNA SOLA VEZ, A 1200 px, Y DESPUES SOLO SE CAMBIA EL
       VIEWPORT. A 768 px y por debajo el cajon de la lesion se CIERRA y el respaldo en linea no
       gana —el CSS del celular usa la clase con `!important`—, asi que los campos miden 0x0 y
       `tipear` aborta: la primera corrida murio con «SIN GEOMETRIA et_gmedio». Es la trampa que
       el PRO-B ya documenta. Cargada antes, lo que se mide en las seis celdas es el MISMO
       paciente, que es lo que corresponde. */
    await viewport(1200, 700);
    await ev(`window.__P.despejar()`);
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirVtVp()`);
    await ev(`window.__P.sel('vt_morf', 'Prótesis biológica')`);
    await ev(`window.__P.sel('vp_morf', 'Prótesis biológica')`);
    await ev(`window.__P.sel('vp_tipo_prot', 'bio')`);
    await tipear('et_gmedio', '12');
    await tipear('ep_gmedio', '24');
    g.escenaCargada = { vt: await ev(`window.__P.protVt()`), vp: await ev(`window.__P.protVp()`) };
    for (const [w, h] of [[1200, 700], [1440, 800], [1920, 1080], [768, 1024], [390, 844], [360, 740]]) {
      for (const claro of [false, true]) {
        await viewport(w, h);
        await ev(`window.__P.tema(${claro})`);
        const t = await ev(`window.__P.tema(${claro})`);
        if (t.claro !== claro) throw new Error('EL TEMA NO QUEDO: ' + JSON.stringify(t));
        await ev(`window.__P.despejar()`);
        const k = w + 'x' + h + (claro ? '|claro' : '|oscuro');
        g.celdas[k] = await ev(`window.__P.anchos(${JSON.stringify(IDS)})`);
        /* El COLOR REAL del veredicto, resuelto: una variable que no existe en esta zona se ve
           GRIS, que es la trampa que este repo ya pago cinco veces con --amber. */
        g.celdas[k].colorVt = await ev(`window.__P.color('#vt-prot-obstr')`);
        g.celdas[k].colorVp = await ev(`window.__P.color('#vp-prot-obstr')`);
      }
    }
    await viewport(1200, 900);
    await ev(`window.__P.tema(false)`);
    out.grupos.maqueta = g;
  }

  /* ── 9 · controles ── LO QUE NO SE TOCA. ───────────────────────────────────────────────── */
  if (corre('controles')) {
    const g = {};
    await ev(`window.__P.nuevo()`);
    g.vacio = { inf: await ev(`window.__P.informe('estandar')`),
                grados: await ev(`window.__P.grados()`),
                excel: await ev(`window.__P.excelDOM()`),
                campos: await ev(`window.__P.camposGuardados()`),
                assert: await ev(`window.__P.assertXls()`) };
    /* Escenario AJENO cargado: ni una de estas superficies puede moverse. */
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirValv()`);
    await tipear('peso', '70'); await tipear('talla', '170');
    await tipear('ia_vc', '4'); await tipear('ia_pht', '300');
    await tipear('im_vc', '5');
    await tipear('vmax_ao', '3.2'); await tipear('gmedio_ao', '25');
    await tipear('vmax_it', '3.0');
    await tipear('onda_e', '95'); await tipear('onda_a', '45');
    await tipear('e_sep', '7'); await tipear('e_lat', '9');
    await tipear('ai_vol', '45');
    g.cargado = { grados: await ev(`window.__P.grados()`),
                  excel: await ev(`window.__P.excelDOM()`),
                  campos: await ev(`window.__P.camposGuardados()`) };
    for (const est of ['conciso', 'estandar', 'narrativo'])
      g.cargado['inf_' + est] = await ev(`window.__P.informe('${est}')`);
    /* La protesis MITRAL y la AORTICA, que esta tanda congela. */
    g.protMitral = await escenaVM('Prótesis mecánica', '52', { em_gmedio: '12', thp: '100' });
    g.protAo = await (async () => { await ev(`window.__P.nuevo()`); await ev(`window.__P.abrirValv()`);
      await ev(`window.__P.sel('va_morf','Prótesis biológica')`);
      await tipear('diam_tsvi','20'); await tipear('itv_tsvi','20'); await tipear('itv_ao','56');
      return ev(`window.__P.protAo()`) })();
    out.grupos.controles = g;
  }

  if (corre('ab')) {
    const g = {};
    const POBL = [
      { id: 1, nombre: 'P1', ci: '1', fecha_estudio: '2026-10-01',
        campos: { ia_vc: '4', ia_pht: '300', em_gmedio: '8', it_grado: '2', fevi: '55' } },
      { id: 2, nombre: 'P2', ci: '2', fecha_estudio: '2026-10-02',
        campos: { va_morf: 'TAVI', ete_tavi_ext_circ: '15', ete_tavi_pro_tam: '25' } },
      { id: 3, nombre: 'P3', ci: '3', fecha_estudio: '2026-10-03',
        campos: { ete_tavi_flujo_rev: 'holo', ete_tavi_vel_tele: '25', ete_tavi_pro_tam: '23' } }
    ];
    const PLANT = ['clasico', 'moderno', 'minimalista', 'academico', 'compacto', 'elegante'];
    /* VACIO */
    await ev(`window.__P.nuevo()`);
    g.vacio = { pdf: {}, excel: await ev(`window.__P.excelDOM()`),
                inf: await ev(`window.__P.informe('estandar')`) };
    for (const pl of PLANT) g.vacio.pdf[pl] = await ev(`window.__P.pdf('${pl}')`);
    /* CARGADO, escena AJENA a esta tanda */
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirValv()`);
    await tipear('peso', '70'); await tipear('talla', '170');
    await tipear('ia_vc', '4'); await tipear('ia_pht', '300');
    await tipear('im_vc', '5');
    await tipear('vmax_ao', '3.2'); await tipear('gmedio_ao', '25');
    await tipear('vmax_it', '3.0');
    await tipear('onda_e', '95'); await tipear('onda_a', '45');
    await tipear('e_sep', '7'); await tipear('e_lat', '9');
    await tipear('ai_vol', '45');
    g.cargado = { pdf: {}, excel: await ev(`window.__P.excelDOM()`) };
    for (const est of ['conciso', 'estandar', 'narrativo']) g.cargado['inf_' + est] = await ev(`window.__P.informe('${est}')`);
    for (const pl of PLANT) g.cargado.pdf[pl] = await ev(`window.__P.pdf('${pl}')`);
    g.cargado.grados = await ev(`window.__P.grados()`);
    /* LA ESCENA DE ESTA TANDA: las dos protesis cargadas, con el PDF generado de verdad en las
       SEIS plantillas. ADVERTENCIA: el tipo de protesis pulmonar NO EXISTE en el arbol de HEAD,
       asi que se pone con el helper tolerante — contra HEAD la pulmonar no publica veredicto
       porque alla no hay campo que elija la columna, y esa es una de las diferencias esperadas. */
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirVtVp()`);
    await ev(`window.__P.sel('vt_morf', 'Prótesis biológica')`);
    await ev(`window.__P.sel('vp_morf', 'Prótesis biológica')`);
    const _tt = await ev(`window.__P.sel('vp_tipo_prot', 'bio')`);
    await tipear('et_gmedio', '12');
    await tipear('et_thp', '250');
    await tipear('ep_vmax', '3.3');
    await tipearSiHay('ep_gmedio', '24');
    g.prot = { tipoPuesto: _tt, pdf: {}, excel: await ev(`window.__P.excelDOM()`),
               campos: await ev(`window.__P.camposGuardados()`),
               grados: await ev(`window.__P.grados()`) };
    for (const est of ['conciso', 'estandar', 'narrativo']) g.prot['inf_' + est] = await ev(`window.__P.informe('${est}')`);
    for (const pl of PLANT) g.prot.pdf[pl] = await ev(`window.__P.pdf('${pl}')`);
    /* PPT estadistico y PDF de auditoria del Laboratorio, por sus generadores REALES. */
    g.labPPT   = await ev(`window.__P.labPPT(${JSON.stringify(POBL)})`);
    g.labAudit = await ev(`window.__P.labAudit(${JSON.stringify(POBL)})`);
    /* El Excel de los TRES estudios de la poblacion, clave por clave. */
    g.excelPobl = {};
    for (const r of POBL) g.excelPobl['P' + r.id] = await ev(`window.__P.excelFila(${JSON.stringify(r.campos)})`);
    out.grupos.ab = g;
  }


  /* ══ UN CLIC REAL ═════════════════════════════════════════════════════════════════════════
     Se desplaza el nodo a la vista ANTES de leer el rect —`elementFromPoint` y el clic van en
     coordenadas del VIEWPORT, y un nodo fuera de pantalla da un centro que no existe— y se
     comprueba que el blanco del punto sea el propio nodo: un clic en un punto cualquiera no es un
     clic en el control. */
  async function clicReal(id) {
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      if (!e) return 0; e.scrollIntoView({ block:'center', inline:'nearest' }); return 1 })()`);
    const g = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!g || g.err || !g.ok) throw new Error('SIN GEOMETRIA para clickear ' + id + ' ' + JSON.stringify(g));
    const x = g.x + Math.floor(g.w / 2), y = g.y + Math.floor(g.h / 2);
    const blanco = await ev(`(function(){ var n = document.elementFromPoint(${x}, ${y});
      return n ? (n.id || n.tagName) : 'NADA' })()`);
    if (blanco !== id) throw new Error('EL PUNTO NO CAE EN ' + id + ': ' + blanco);
    await cdp.send('Input.dispatchMouseEvent', { type:'mousePressed', x, y, button:'left', clickCount:1 }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type:'mouseReleased', x, y, button:'left', clickCount:1 }, sessionId);
    return { x, y, blanco };
  }

  /* ══ Q: CLIC REAL SOBRE UN NODO SIN `id`, por su selector ══════════════════════════════════
     Los ocho globos de la tanda Q no llevan `id` —ninguno de los veintidos anteriores lo lleva
     tampoco—, asi que se clickean por `[data-vinfo=...]`. Mismo blindaje que `clicReal`: se lleva
     al viewport, se exige geometria y se comprueba con `elementFromPoint` que el punto cae en el
     blanco —y se DESPEJA el aviso legal antes de mirar, porque reaparece a mitad de corrida y
     envenena esa lectura, que es la trampa que este repo ya tiene escrita tres veces. */
  async function clicQ(clave) {
    const sel = '[data-vinfo="' + clave + '"]';
    await ev(`window.__P.despejar()`);
    /* ⚠️ LAS CUATRO SECCIONES SE CIERRAN SOLAS A MITAD DE CORRIDA, Y ESTA MEDIDO: entre dos
       lecturas CONSECUTIVAS de `ete-seccion-valv-mitral` —sin una sola llamada mia en medio—
       paso de `block` a `none`, asi que lo cierra un temporizador de la propia app (es la
       familia del aviso legal que este repo ya documenta). Sin reabrir, el globo EXISTE y mide
       0x0 y el clic aborta sobre un boton perfecto. Se reabre y se informa, que es lo que hace
       `foco()` con `abrirPara`. */
    const _reab = await ev(`window.__P.abrirTodasValv()`);
    await ev(`(function(){ var e = document.querySelector(${JSON.stringify(sel)});
      if (!e) return 0; e.scrollIntoView({ block:'center', inline:'nearest' }); return 1 })()`);
    const g = await ev(`(function(){ var e = document.querySelector(${JSON.stringify(sel)});
      if (!e) return { err: 'NO EXISTE ' + ${JSON.stringify(sel)} };
      var r = e.getBoundingClientRect();
      var cad = [], n = e;
      while (n && n.nodeType === 1 && cad.length < 12) {
        var cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden')
          cad.push((n.id || n.className || n.tagName) + ':' + cs.display + '/' + cs.visibility);
        n = n.parentNode }
      return { w: Math.round(r.width), h: Math.round(r.height),
               x: Math.round(r.left), y: Math.round(r.top), cad: cad,
               cls: e.className, enDoc: document.contains(e),
               ok: r.width > 0 && r.height > 0 } })()`);
    if (!g || g.err || !g.ok) throw new Error('SIN GEOMETRIA para clickear ' + clave + ' ' + JSON.stringify(g)
      + ' | reabrir=' + JSON.stringify(_reab));
    const x = g.x + Math.floor(g.w / 2), y = g.y + Math.floor(g.h / 2);
    const blanco = await ev(`(function(){ var n = document.elementFromPoint(${x}, ${y});
      if (!n) return 'NADA';
      return (n.getAttribute && n.getAttribute('data-vinfo')) || n.id || n.tagName })()`);
    if (blanco !== clave) throw new Error('EL PUNTO NO CAE EN ' + clave + ': ' + blanco);
    await cdp.send('Input.dispatchMouseEvent', { type:'mousePressed', x, y, button:'left', clickCount:1 }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type:'mouseReleased', x, y, button:'left', clickCount:1 }, sessionId);
    return { x, y, blanco };
  }
  /* Un clic AFUERA: sobre el `<h1>` del encabezado, que no es un globo ni la tarjeta. */
  async function clicAfuera() {
    await ev(`window.__P.despejar()`);
    return ev(`(function(){
      var n = document.querySelector('#tab-valvulas h2') || document.body;
      n.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return n.tagName })()`);
  }

  /* ══ GRUPO `pos` — LA POSICION DE LO QUE SE MUDO (CORTOS1 y CORTOS2) ══════════════════════ */
  if (corre('pos')) {
    const g = {};
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirValv()`);
    await ev(`window.__P.abrirVtVp()`);
    g.mitral = await ev(`window.__P.pos('bloque-prot-vm-pvl','im-pvl-interp')`);
    g.vtCampos = await ev(`window.__P.pos('bloque-prot-vt','campos-esten-tricuspide')`);
    g.vtCaja = await ev(`window.__P.pos('bloque-prot-vt-res','campos-esten-tricuspide')`);
    g.vtCajaVsSev = await ev(`window.__P.pos('bloque-prot-vt-res','et-sev')`);
    g.claseCampos = await ev(`(function(){ var e = document.getElementById('bloque-prot-vt');
      return e ? e.className : 'NO EXISTE' })()`);
    g.claseCaja = await ev(`(function(){ var e = document.getElementById('bloque-prot-vt-res');
      return e ? e.className : 'NO EXISTE' })()`);
    /* Con protesis los dos bloques tienen que VERSE; con nativa, ninguno. */
    for (const m of ['Normal', 'Prótesis biológica']) {
      const s = await ev(`window.__P.sel('vt_morf', ${JSON.stringify(m)})`);
      g['vis_' + m] = { sel: s, campos: await ev(`window.__P.vis('bloque-prot-vt')`),
                        caja: await ev(`window.__P.vis('bloque-prot-vt-res')`) };
    }
    for (const m of ['Normal', 'Prótesis mecánica']) {
      const s = await ev(`window.__P.sel('vm_morf', ${JSON.stringify(m)})`);
      g['vism_' + m] = { sel: s, sel2: await ev(`window.__P.vis('bloque-prot-vm-pvl')`) };
    }
    out.grupos.pos = g;
  }

  /* ══ GRUPO `trip` — LA REGLA DE DOS O MAS Y LA ONDA E EN cm/s (CORTOS3 y CORTOS4) ═════════ */
  if (corre('trip')) {
    const g = { escenas: {}, bordes: {}, sinc: {} };
    const base = async (morf) => {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirValv()`);
      await ev(`window.__P.abrirVtVp()`);
      const s = await ev(`window.__P.sel('vt_morf', ${JSON.stringify(morf)})`);
      if (s && s.err) throw new Error('DENOMINADOR vt_morf: ' + JSON.stringify(s));
    };
    /* CERO, UNO y DOS positivos en bioprotesica. Los cortes de la Tabla 19: gradiente medio >= 9,
       THP >= 200, velocidad pico de E >= 210 cm/s. */
    const ESC = {
      'bio|cero':    { gmedio: '4',  thp: '120' },
      'bio|uno':     { gmedio: '12', thp: '120' },
      'bio|dos':     { gmedio: '12', thp: '250' },
      'bio|tres':    { gmedio: '12', thp: '250', evmax: '240' },
      'bio|unoEvmax':{ evmax: '240' },
      'bio|dosEvmax':{ evmax: '240', gmedio: '12' }
    };
    for (const k of Object.keys(ESC)) {
      await base('Prótesis biológica');
      const e = ESC[k];
      if (e.gmedio) await tipear('et_gmedio', e.gmedio);
      if (e.thp) await tipear('et_thp', e.thp);
      if (e.evmax) await tipear('et_e_vmax', e.evmax);
      const r = await ev(`window.__P.protVt()`);
      g.escenas[k] = { motor: { obstr: r.motor.obstr, pos: r.motor.pos, med: r.motor.med,
                                niv: r.motor.niv, fuera: r.motor.fuera },
                       obstr: r.obstr, filas: r.filas, campos: r.campos,
                       inf: await ev(`window.__P.informe('estandar')`) };
    }
    /* Los bordes de la onda E en cm/s, por tipo, leyendo el NIVEL de su propia fila. */
    for (const [m, vals] of [['Prótesis biológica', ['209', '210', '211']],
                             ['Prótesis mecánica', ['189', '190', '191']]]) {
      for (const v of vals) {
        await base(m);
        await tipear('et_e_vmax', v);
        const r = await ev(`window.__P.protVt()`);
        g.bordes[m + '|' + v] = { niv: r.motor.niv.evmax, val: r.motor.vals.evmax,
                                  fila: r.filas.evmax, obstr: r.obstr };
      }
    }
    /* Un valor DEBAJO del piso de la banda: el dedazo de tipear 2,1 por 210. */
    await base('Prótesis biológica');
    await tipear('et_e_vmax', '2.1');
    { const r = await ev(`window.__P.protVt()`);
      g.bordes['fueraDeBanda'] = { niv: r.motor.niv.evmax, fila: r.filas.evmax, fuera: r.motor.fuera }; }
    /* El espejo, en los DOS sentidos y con el borrado. */
    await base('Prótesis biológica');
    await tipear('et_e_vmax', '96');
    g.sinc.desdeValvulas = { dop: await ev(`window.__P.val('dt_onda_e')`), valv: await ev(`window.__P.val('et_e_vmax')`) };
    await ev(`window.__P.abrirDoppler()`);
    await tipear('dt_onda_e', '77');
    g.sinc.desdeDoppler = { dop: await ev(`window.__P.val('dt_onda_e')`), valv: await ev(`window.__P.val('et_e_vmax')`) };
    await tipear('dt_onda_e', '');
    g.sinc.borrado = { dop: await ev(`window.__P.val('dt_onda_e')`), valv: await ev(`window.__P.val('et_e_vmax')`) };
    out.grupos.trip = g;
  }

  /* ══ GRUPO `ara` — EL SUPLEMENTARIO DEL Ar-A (CORTOS6) ════════════════════════════════════ */
  if (corre('ara')) {
    const g = { bordes: {} };
    /* El Ar-A es la RESTA de las dos duraciones. Se mide en su borde (29/30/31 ms) y por los dos
       estados de la amplitud de la Ar: sin cargar y por debajo de 35 cm/s, que es lo que hasta
       hoy lo dejaba sin votar. */
    for (const [dur, vel] of [['129', ''], ['130', ''], ['131', ''], ['131', '20'], ['131', '40'], ['129', '40']]) {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirDoppler()`);
      await tipear('venp_dur_ar', dur);
      await tipear('venp_dur_a', '100');
      if (vel) await tipear('venp_vel_ar', vel);
      g.bordes[dur + '|' + (vel || 'sinVel')] = await ev(`window.__P.ara()`);
    }
    out.grupos.ara = g;
  }

  /* ══ GRUPO `lab` — LA FEVI EN EL LABORATORIO (CORTOS7) ════════════════════════════════════ */
  if (corre('lab')) {
    const POB = [
      { id: 1, fecha: '2026-10-01', campos: { fevi: '60' } },
      { id: 2, fecha: '2026-10-02', campos: { fevi: '45' } },
      { id: 3, fecha: '2026-10-03', campos: { fevi: '40' } },
      { id: 4, fecha: '2026-10-04', campos: { fevi: '41' } },
      { id: 5, fecha: '2026-10-05', campos: { fevi: '25' } }
    ];
    out.grupos.lab = await ev(`window.__P.labFevi(${JSON.stringify(POB)})`);
  }

  /* ══ GRUPO `pdf` — LOS DOS TOGGLES Y EL ENCABEZADO DE AMILOIDOSIS (CORTOS9) ═══════════════ */
  if (corre('pdf')) {
    const g = {};
    await ev(`window.__P.nuevo()`);
    g.inicial = await ev(`window.__P.toggles()`);
    await ev(`(function(){ try { localStorage.setItem('sgl_incluir_pdf','1');
      localStorage.setItem('mitral_qx_incluir_pdf','1') } catch(e){} return 1 })()`);
    g.conClaveVieja = await ev(`window.__P.toggles()`);
    /* El gesto real sobre los dos botones. */
    g.abrirSgl = await ev(`window.__P.abrirPara('sgl-pdf-toggle')`);
    g.clicSgl = await clicReal('sgl-pdf-toggle');
    g.abrirQx = await ev(`window.__P.abrirPara('ete-qx-pdf')`);
    g.clicQx  = await clicReal('ete-qx-pdf');
    g.prendidos = await ev(`window.__P.toggles()`);
    g.campos = await ev(`window.__P.camposGuardados()`);
    await ev(`window.__P.nuevo()`);
    g.trasNuevo = await ev(`window.__P.toggles()`);
    /* El encabezado del PDF de amiloidosis, por el dueño de la identificacion impresa. */
    await ev(`window.__P.abrirDatos()`);
    await tipear('ci', '1234567');
    await tipear('matricula', 'M-777');
    g.idDocumento = await ev(`window.__P.amiloId()`);
    await ev(`(function(){ if (typeof pacIdElegir === 'function') pacIdElegir('matricula'); return 1 })()`);
    g.idMatricula = await ev(`window.__P.amiloId()`);
    out.grupos.pdf = g;
  }

  /* ══ GRUPO `otros` — ASIA, VARIANTES, RAC, BURBUJA, PERICARDIO Y LINEAS B ═════════════════ */
  if (corre('otros')) {
    const g = { escenas: {}, globos: {} };
    const esc = async (nom, fn) => {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirOtros()`);
      await fn();
      g.escenas[nom] = { otros: await ev(`window.__P.otros()`),
                         inf: await ev(`window.__P.informe('estandar')`),
                         papel: await ev(`window.__P.papel()`) };
    };
    await esc('vacio', async () => {});
    await esc('asiaSola', async () => { await clicReal('otr_asia'); });
    await esc('asiaConNota', async () => { await clicReal('otr_asia');
      await tipear('otr_asia_nota', '(de 15 mm por 12 mm en eje L y T)'); });
    await esc('notaSinCasilla', async () => { await tipear('otr_asia_nota', '(de 15 mm por 12 mm)'); });
    await esc('variante', async () => { await clicReal('otr_var_chiari'); });
    await esc('rac', async () => { await clicReal('otr_rac'); });
    await esc('burbNeg', async () => { await clicReal('otr_burb');
      await ev(`window.__P.sel('otr_burb_pasaje','no')`); });
    await esc('burbPos', async () => { await clicReal('otr_burb');
      await ev(`window.__P.sel('otr_burb_pasaje','si')`);
      await ev(`window.__P.sel('otr_burb_cant','e1030')`);
      await ev(`window.__P.sel('otr_burb_man','val')`);
      await ev(`window.__P.sel('otr_burb_mom','pre3')`); });
    await esc('burbSinConsignar', async () => { await clicReal('otr_burb'); });
    await esc('pericardio', async () => { await ev(`window.__P.sel('pericardio','Derrame severo (>20mm)')`); });
    await esc('pericardioHemo', async () => { await ev(`window.__P.sel('pericardio','Derrame moderado (10-20mm)')`);
      await ev(`window.__P.sel('pericardio_hemo','no')`); });
    await esc('lineasB', async () => { await ev(`window.__P.sel('pul_lineasb','si')`);
      await ev(`window.__P.sel('pul_lineasb_pat','difuso')`);
      await ev(`window.__P.sel('pul_lineasb_sep','s7')`); });
    await esc('lineasBsinSep', async () => { await ev(`window.__P.sel('pul_lineasb','si')`);
      await ev(`window.__P.sel('pul_lineasb_pat','difuso')`); });
    await esc('balik', async () => { await ev(`window.__P.sel('pul_derrame','si')`);
      await ev(`window.__P.sel('pul_derrame_tam','moderado')`);
      await tipear('pul_balik', '30'); });
    /* Los campos nuevos viajan con el estudio y NO agregan columnas. */
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirOtros()`);
    await clicReal('otr_asia');
    await tipear('otr_asia_nota', 'detalle');
    await clicReal('otr_burb');
    await ev(`window.__P.sel('otr_burb_pasaje','si')`);
    g.campos = await ev(`window.__P.camposGuardados()`);
    g.camposOtr = await ev(`window.__P.camposPref('otr_')`);
    g.camposPdf = await ev(`window.__P.camposPref('sgl_be')`);
    g.excel = await ev(`window.__P.excelDOM()`);
    g.censoCols = await ev(`(function(){ if (typeof _labExcelRow !== 'function') return 'SIN FN';
      var ks = Object.keys(_labExcelRow({ id: 0, campos: {} }));
      return { n: ks.length, otros: ks.filter(function(k){ return /ASIA|RAC|burbuj|variante|separaci/i.test(k) }) } })()`);
    for (const k of ['otr-burbujas', 'otr-rac', 'oai-ref']) g.globos[k] = await ev(`window.__P.globoRef(${JSON.stringify(k)})`);
    g.globos['pul-balik'] = await ev(`(function(){ try { return (typeof VINFO !== 'undefined' && VINFO['pul-balik'])
      ? { tit: VINFO['pul-balik'].tit, fuente: VINFO['pul-balik'].fuente } : 'NO EXISTE' } catch(e){ return 'EXC' } })()`);
    out.grupos.otros = g;
  }

  /* ══ GRUPO `maqueta` — LOS DOS TEMAS Y LOS CUATRO ANCHOS ══════════════════════════════════ */
  if (corre('maqueta')) {
    const g = {};
    for (const [w, h] of [[1200, 700], [768, 1024], [390, 844], [360, 740]]) {
      for (const claro of [false, true]) {
        await viewport(w, h);
        const t = await ev(`window.__P.tema(${claro})`);
        if (!!t.claro !== claro) throw new Error('EL TEMA NO QUEDO: ' + JSON.stringify(t));
        await ev(`window.__P.despejar()`);
        await ev(`window.__P.nuevo()`);
        await ev(`window.__P.abrirOtros()`);
        await ev(`window.__P.chk('otr_asia', true)`);
        await ev(`window.__P.chk('otr_burb', true)`);
        await ev(`window.__P.sel('otr_burb_pasaje','si')`);
        const k = w + 'x' + h + (claro ? '|claro' : '|noche');
        g[k] = { asia: await ev(`window.__P.geo('otr_asia_nota')`),
                 burbCant: await ev(`window.__P.geo('otr_burb_cant')`),
                 scrollH: await ev(`(function(){ return { sw: document.documentElement.scrollWidth,
                   cw: document.documentElement.clientWidth } })()`),
                 colorRot: await ev(`window.__P.color('#otr_asia_nota')`) };
      }
    }
    await viewport(1200, 900);
    await ev(`window.__P.tema(false)`);
    out.grupos.maqueta = g;
  }

  /* ══ GRUPO `pos0` — LECTURA PREVIA: DONDE CABE EL BOTON i ═══════════════════════════════════
     Mide, a tres anchos y en los dos temas, la caja de la pastilla de lesion, la de la pastilla
     SELECTORA de severidad, la de su envoltorio y la del campo de arriba y del de abajo. Con eso
     se decide si un boton de 44 px entra ARRIBA de la selectora sin desplazar un campo.
     ⚠️ DENOMINADOR: se informa si la pestana y los cajones quedaron abiertos. Lo que esta en
     display:none no tiene geometria, asi que sin abrir todo sale 0x0 y parece que no hay lugar. */
  if (corre('pos0')) {
    const g = {};
    const VALVS = [['mitral','insuf'],['mitral','esten'],['aortica','insuf'],['aortica','esten'],
                   ['tricuspide','insuf'],['tricuspide','esten'],['pulmonar','insuf'],['pulmonar','esten']];
    for (const [w, h] of [[1200, 700], [768, 1024], [390, 844]]) {
      await viewport(w, h);
      await ev(`window.__P.despejar()`);
      await ev(`window.__P.nuevo()`);
      const ab = await ev(`window.__P.abrirTodasValv()`);
      const abVtVp = 'n/a';
      const k = w + 'x' + h;
      const celda = { abrir: ab, abrirVtVp: abVtVp, valvs: {} };
      for (const [v, t] of VALVS) {
        celda.valvs[v + ':' + t] = await ev(`(function(){
          var pill = document.getElementById('pill-' + ${JSON.stringify(t)} + '-' + ${JSON.stringify(v)});
          var sev  = document.getElementById('sevbtn-' + ${JSON.stringify(t)} + '-' + ${JSON.stringify(v)});
          if (!pill || !sev) return { err: 'NO EXISTE' };
          var wrap = pill.parentNode, fila = wrap ? wrap.parentNode : null;
          var caja = function(e){ if (!e) return null; var r = e.getBoundingClientRect();
            return { w: Math.round(r.width), h: Math.round(r.height),
                     x: Math.round(r.left), y: Math.round(r.top) } };
          /* El hermano de ARRIBA de la fila de botones y el de ABAJO: lo que un boton apilado
             desplazaria. */
          var arr = fila ? fila.previousElementSibling : null;
          var aba = fila ? fila.nextElementSibling : null;
          var cs = getComputedStyle(sev);
          return { pill: caja(pill), sev: caja(sev), wrap: caja(wrap), fila: caja(fila),
                   filaCls: fila ? (fila.className || '(sin clase)') : null,
                   arriba: { tag: arr ? arr.tagName : null, cls: arr ? (arr.className||'') : null, caja: caja(arr) },
                   abajo:  { tag: aba ? aba.tagName : null, cls: aba ? (aba.className||'') : null, caja: caja(aba) },
                   sevMinH: cs.minHeight, sevAlign: cs.alignSelf };
        })()`);
      }
      /* La geometria de un `.vinfo-btn` que YA existe, con mouse y con dedo: es el tamano que
         ocuparia uno nuevo. */
        celda.vinfoMouse = await ev(`(function(){ var b = document.querySelector('#tab-valvulas .vinfo-btn');
        if (!b) return 'NO HAY NINGUNO'; var r = b.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height),
                 minW: getComputedStyle(b).minWidth, minH: getComputedStyle(b).minHeight } })()`);
      g[k] = celda;
    }
    /* El mismo `.vinfo-btn` con emulacion TACTIL: la media query `pointer: coarse` lo lleva a
       44 x 44, y es lo que de verdad ocuparia en el dedo. */
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, sessionId);
    await cdp.send('Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' }, sessionId);
    await viewport(390, 844);
    g.vinfoDedo = await ev(`(function(){ var b = document.querySelector('.vinfo-btn');
      if (!b) return 'NO HAY NINGUNO'; var r = b.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height),
               minW: getComputedStyle(b).minWidth, minH: getComputedStyle(b).minHeight,
               coarse: matchMedia('(pointer: coarse)').matches } })()`);
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 }, sessionId);
    await viewport(1200, 900);
    out.grupos.pos0 = g;
  }

  /* ══ GRUPO `mec` — EL MECANISMO DE LOS OCHO BOTONES ════════════════════════════════════════
     Existen, estan ARRIBA de la selectora, abren con un clic real, el segundo clic cierra, el
     clic afuera cierra, Escape cierra y nunca hay dos abiertas. Y el alto de la fila ANTES y
     DESPUES, que es lo que la columna hace crecer. */
  if (corre('mec')) {
    const g = { botones: {}, filaAlto: {}, ciclo: {}, cierres: {} };
    out.grupos.mec = g;
    try {
    await viewport(1200, 900);
    await ev(`window.__P.despejar()`);
    await ev(`window.__P.nuevo()`);
    g.abrir = await ev(`window.__P.abrirTodasValv()`);
    g.botones = await ev(`window.__Q.botones()`);
    for (const v of ['mitral', 'aortica', 'tricuspide', 'pulmonar'])
      g.filaAlto[v] = await ev(`window.__Q.filaAlto(${JSON.stringify(v)})`);

    const CLAVES = [];
    for (const t of ['insuf', 'esten'])
      for (const v of ['mitral', 'aortica', 'tricuspide', 'pulmonar']) CLAVES.push('tarj-' + t + '-' + v);

    /* Abre y cierra las ocho con el MISMO boton. */
    for (const k of CLAVES) {
      const o = {};
      try {
        o.clic1 = await clicQ(k);
        o.abierta = await ev(`window.__Q.card()`);
        o.clic2 = await clicQ(k);
        o.cerrada = await ev(`window.__Q.card()`);
      } catch (e) { o.err = e.message; }
      g.ciclo[k] = o;
    }

    /* Las tres puertas de cierre, sobre la tarjeta de la mitral. */
    g.botonesTrasCiclo = await ev(`window.__Q.botones()`);
    g.secTrasCiclo = await ev(`(function(){ var o = {};
      ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(sx){
        var c = document.getElementById('ete-seccion-' + sx);
        o[sx] = c ? getComputedStyle(c).display : 'NO EXISTE' });
      var p = document.getElementById('pill-insuf-mitral');
      var n = p, cad = [];
      while (n && n.nodeType === 1 && cad.length < 10) {
        if (getComputedStyle(n).display === 'none') cad.push((n.id || n.tagName) + ':none');
        n = n.parentNode }
      o.cadena = cad; o.tab = (function(){ var t = document.getElementById('tab-valvulas');
        return t ? getComputedStyle(t).display : 'NO EXISTE' })();
      return o })()`);
    await clicQ('tarj-insuf-mitral');
    g.cierres.trasAbrir = await ev(`window.__Q.card()`);
    g.cierres.blancoAfuera = await clicAfuera();
    g.cierres.trasAfuera = await ev(`window.__Q.card()`);
    await clicQ('tarj-insuf-mitral');
    g.cierres.trasReabrir = await ev(`window.__Q.card()`);
    await tecla('Escape');
    g.cierres.trasEscape = await ev(`window.__Q.card()`);

    /* UNA SOLA ABIERTA: se abre la segunda sin cerrar la primera. */
    await clicQ('tarj-insuf-mitral');
    g.cierres.unaA = await ev(`window.__Q.card()`);
    await clicQ('tarj-esten-aortica');
    g.cierres.unaB = await ev(`window.__Q.card()`);
    await tecla('Escape');

    /* El foco: entra a la tarjeta al abrir y vuelve al globo al cerrar. */
    await clicQ('tarj-esten-mitral');
    g.focoAbierta = await ev(`(function(){ var a = document.activeElement;
      return a ? (a.id || a.getAttribute('data-vinfo') || a.tagName) : null })()`);
    await tecla('Escape');
    g.focoCerrada = await ev(`(function(){ var a = document.activeElement;
      return a ? (a.id || a.getAttribute('data-vinfo') || a.tagName) : null })()`);
    } catch (e) { g.ABORTO = e.message; }
  }

  /* ══ GRUPO `tarj` — EL CONTENIDO DE CADA TARJETA CONTRA EL DUENO ═══════════════════════════
     Una escena con las ocho lesiones cargadas. De cada tarjeta se leen el grado, las filas, las
     barras, los puntos, el grupo de apoyo, la linea «Decide» y las fuentes; y aparte se lee el
     DUENO (`_v2dPastilla` + `_v2dPorQue`). El lector compara los dos.
     ⚠️ DENOMINADOR: se informa el grado de las ocho pastillas, para que se vea que la escena de
     verdad produjo lesiones. Sin eso, una tarjeta vacia en las ocho se lee igual que «la tarjeta
     no sabe leer el dueno». */
  if (corre('tarj')) {
    const g = { tarjetas: {}, duenos: {} };
    await viewport(1200, 900);
    await ev(`window.__P.despejar()`);
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirTodasValv()`);
    await ev(`window.__P.abrirDoppler()`);
    await ev(`window.__P.abrirTodasValv()`);
    await tipear('peso', '80'); await tipear('talla', '180');
    /* MITRAL: insuficiencia por PISA y estenosis por area. */
    await tipear('im_vc', '8');
    await tipear('em_vtimit', '60');
    await tipear('em_gmedio', '12');
    await tipear('thp', '160');
    /* AORTICA: la IA vota por THP y por el reverso telediastolico; `ia_vc` alimenta el grado
       pero NO tiene fila en el cuadro, asi que una escena que solo lo cargue deja la tarjeta sin
       filas y se lee igual que «el dueno no devuelve nada». Medido. */
    await tipear('ia_vc', '7');
    await tipear('ia_pht', '180');
    await tipear('vmax_ao', '4.5'); await tipear('gmedio_ao', '45');
    /* TRICUSPIDE: insuficiencia por vena contracta y estenosis por gradiente. */
    await tipear('it_vc', '8');
    await tipear('et_gmedio', '8');
    await tipear('et_thp', '210');
    /* PULMONAR. */
    await tipear('ip_pht', '80');
    await ev(`window.__P.sel('ip_ancho', 'ancho')`);
    await tipear('vp_vmax', '3.5');
    g.grados = await ev(`window.__P.grados()`);
    /* DENOMINADOR de las fuentes: que contiene cada caja declarada y donde vive cada nodo de
       fuente. Sin esto, una lista de fuentes vacia se lee igual que «el cosechador no funciona». */
    g.cajas = await ev(`(function(){ var o = {};
      ['bloque-insuf-mitral','bloque-esten-mitral','bloque-insuf-aortica','bloque-ea-detalle',
       'bloque-insuf-tricuspide','bloque-esten-tricuspide','bloque-insuf-pulmonar',
       'bloque-esten-pulmonar','bloque-prot-vt-res','bloque-prot-vp-res','bloque-prot-vm-res']
      .forEach(function(id){ var c = document.getElementById(id);
        o[id] = c ? { vinfo: Array.prototype.slice.call(c.querySelectorAll('[data-vinfo]'))
                        .map(function(b){ return b.getAttribute('data-vinfo') }),
                      fte: Array.prototype.slice.call(c.querySelectorAll('[id$="-ref-fuente"]'))
                        .map(function(n){ return n.id + '=' + (n.textContent||'').slice(0,40) }) }
                  : 'NO EXISTE' });
      ['it-ref-fuente','et-ref-fuente'].forEach(function(id){
        var n = document.getElementById(id);
        o['padres:' + id] = 'NO EXISTE';
        if (n) { var cad = [], q = n.parentNode;
          while (q && q.nodeType === 1 && cad.length < 14) { if (q.id) cad.push(q.id); q = q.parentNode }
          o['padres:' + id] = cad.join(' < ') + ' | txt=' + (n.textContent||'').slice(0,30) } });
      return o })()`);
    for (const t of ['insuf', 'esten']) {
      for (const v of ['mitral', 'aortica', 'tricuspide', 'pulmonar']) {
        const k = 'tarj-' + t + '-' + v;
        g.duenos[k] = await ev(`window.__Q.dueno(${JSON.stringify(t)}, ${JSON.stringify(v)})`);
        try {
          await clicQ(k);
          g.tarjetas[k] = await ev(`window.__Q.cardDatos()`);
          await tecla('Escape');
        } catch (e) { g.tarjetas[k] = { ABORTO: e.message }; }
      }
    }
    out.grupos.tarj = g;
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  if (out.md5Fin !== out.md5Ini) out.AVISO = 'EL ARCHIVO SE MOVIO DURANTE LA CORRIDA';
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close() } catch (e) {}
  try { srv.close() } catch (e) {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO: ' + e.message); process.exit(1); });
