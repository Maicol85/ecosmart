#!/usr/bin/env node
/**
 * _probe_prob.mjs - sonda A/B de SOLO LECTURA para la tanda PRO-B (2026-10-17):
 *   PRO-B2: el rotulo del reverso de la TAVI pasa de «aorta abdominal» a «aorta descendente».
 *   PRO-B3: la FUGA PARAVALVULAR de la protesis AORTICA quirurgica (SAVR), con el motor de la
 *           TAVI reusado por fuente inyectable.
 *   PRO-B4: la marca de ORIGEN de la regurgitacion de la protesis MITRAL.
 *
 * Infraestructura calcada de scripts/_probe_pro.mjs (teclas y clics reales, cierre del arbol de
 * Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con su denominador, md5 al
 * principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_prob.mjs --file /tmp/index.PROBHEAD.html > /tmp/prob.HEAD.json
 *   node scripts/_probe_prob.mjs                                 > /tmp/prob.NEW.json
 *
 * Grupos (--solo rotulo|pvlao|bordes|pvlvm|tavi|maqueta|controles):
 *   rotulo    - el rotulo del campo del reverso de la TAVI, y que «aorta abdominal» no quede.
 *   pvlao     - la fuga de la protesis aortica quirurgica: aparicion, origen e integracion.
 *   bordes    - cada criterio de la T8 por su valor exacto, uno por debajo y uno por encima.
 *   pvlvm     - la marca de origen de la protesis mitral y sus superficies.
 *   tavi      - la TAVI entera, que debe dar EXACTAMENTE lo mismo que en HEAD.
 *   maqueta   - los dos temas y los cuatro anchos, con el color REAL resuelto.
 *   controles - informe (tres estilos), EN SUMA, Excel en 440, grados, diastolica y HFA-PEFF.
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

  nuevo() {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true); return 'ok' }
    catch (e) { return 'EXC: ' + e.message } }
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

/* == Escenas del Z6 ===========================================================================
   LA PROTESIS MITRAL, con la continuidad cargada y controlable:
     area del TSVI = pi*(20/20)^2 = 3,1416 cm2
     DVI  = VTI mitral / VTI TSVI
     AEO  = area * VTI TSVI / VTI mitral
   Con VTI TSVI 20: VTI mitral 40 da DVI 2,00 (NORMAL) y AEO 1,57 (posible); VTI mitral 52 da
   DVI 2,60 (SIGNIFICATIVA) y AEO 1,21 (posible). Los dos dejan el AEO en la banda del medio a
   proposito: lo que se mide es el voto del gradiente, no el del area. */
const VM_BASE = { em_dtsvi: '20', em_vtitsvi: '20', em_vtimit: '40' };

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

  /* La escena base de la protesis mitral, con teclas reales. `morf` elige mecanica o biologica,
     `vtimit` fija el DVI y `extra` carga el gradiente y el THP de cada escena.
     ⚠️ DENOMINADOR: se devuelve `esProt` y el AEO para que el lector pueda ver que la escena de
     verdad llego a la capsula. Sin eso, un `vm_morf` que no quedo da `esProt:false` y las ocho
     escenas informan el mismo objeto, que se lee igual que «la regla no funciona». */
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
  /* ── 1 · rotulo ── PRO-B2: el rotulo del reverso de la TAVI. ─────────────────────────────
     DENOMINADOR: el campo vive dentro de `#ete-tavi-veltele-wrap`, que `eteTaviSync` enciende
     SOLO con el flujo en «holo». Sin fijar el <select> primero, el campo EXISTE y mide 0x0 y el
     rotulo se lee igual: por eso se informa su geometria al lado del texto.
     El rotulo se lee RENDERIZADO y el barrido de «aorta abdominal» va sobre el texto VISIBLE de
     la pagina y no sobre el fuente: el comentario que explica el cambio nombra el texto viejo. */
  if (corre('rotulo')) {
    const g = {};
    await ev(`window.__P.nuevo()`);
    g.abrir = await ev(`window.__P.abrirTavi()`);
    const s = await ev(`window.__P.sel('ete_tavi_flujo_rev','holo')`);
    if (s && s.err) throw new Error('DENOMINADOR ete_tavi_flujo_rev: ' + JSON.stringify(s));
    g.geoVelTele = await ev(`window.__P.geo('ete_tavi_vel_tele')`);
    g.rotulo     = await ev(`window.__P.rotuloDe('ete_tavi_vel_tele')`);
    g.rotuloFlujo = await ev(`window.__P.rotuloDe('ete_tavi_flujo_rev')`);
    /* Control negativo: el rotulo del campo NATIVO de la IAo, que ya decia «Ao desc.» y no se
       toca. Y el del segmento aortico abdominal del vocabulario del ecografo, que es OTRO
       territorio: se cuenta cuantas veces aparece «abdominal» en el texto visible. */
    await ev(`window.__P.abrirValv()`);
    g.rotuloIaVtd = await ev(`window.__P.rotuloDe('ia_vmax_td')`);
    g.censo = await ev(`(function(){
      var R = window.__P.rotulos(), bajo = R.map(function(s){ return s.toLowerCase() });
      var con = function(s){ return bajo.filter(function(x){ return x.indexOf(s) >= 0 }) };
      return { n: R.length,
               aortaAbdominal: con('aorta abdominal'),
               abdominal: con('abdominal'),
               aortaDescendente: con('aorta descendente') } })()`);
    out.grupos.rotulo = g;
  }

  /* ── 2 · tavi ── LA TAVI NO CAMBIA. ──────────────────────────────────────────────────────
     Cinco escenas que recorren las cinco salidas del motor: sin RPV (todo cero), trivial (los
     tres en banda trivial), leve (uno solo en banda trivial), moderada y severa. Si alguna
     difiere de HEAD es un defecto, con la UNICA excepcion de la lectura del Laboratorio, que
     hasta hoy tenia su propia copia de los cortes.
     DENOMINADOR: la escena carga tambien el dispositivo, porque el parrafo del informe esta
     gateado por `hayProtesis` y sin eso la narrativa no sale. */
  if (corre('tavi')) {
    const g = { escenas: {} };
    const ESC = {
      sinRpv:   { ete_tavi_ext_circ: '0',  ete_tavi_vc_ancho: '0',    ete_tavi_vc_area: '0' },
      trivial:  { ete_tavi_ext_circ: '5',  ete_tavi_vc_ancho: '0.2',  ete_tavi_vc_area: '0.05' },
      leve:     { ete_tavi_ext_circ: '5' },
      moderada: { ete_tavi_ext_circ: '15', ete_tavi_vc_ancho: '0.2' },
      severa:   { ete_tavi_ext_circ: '35' },
      phtMod:   { ete_tavi_pht: '300' },
      phtSev:   { ete_tavi_pht: '150' }
    };
    for (const nom of Object.keys(ESC)) {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirTavi()`);
      await tipear('ete_tavi_pro_tam', '25');
      for (const k of Object.keys(ESC[nom])) await tipear(k, ESC[nom][k]);
      g.escenas[nom] = await ev(`window.__P.tavi()`);
      g.escenas[nom].inf = await ev(`window.__P.informe('estandar')`);
    }
    /* El reverso por sus cuatro bordes (PRO3): 19 / 20 / 29 / 30, con el flujo en holo. */
    for (const velT of ['19', '20', '29', '30']) {
      await ev(`window.__P.nuevo()`);
      await ev(`window.__P.abrirTavi()`);
      await tipear('ete_tavi_pro_tam', '25');
      await ev(`window.__P.sel('ete_tavi_flujo_rev','holo')`);
      await tipear('ete_tavi_vel_tele', velT);
      g.escenas['reverso|' + velT] = await ev(`window.__P.tavi()`);
    }
    /* La lectura del LABORATORIO sobre estudios archivados, con los MISMOS valores: es la que
       tenia la segunda copia de los cortes y la que divergia en 20 a 29 cm/s. */
    g.lab = {};
    for (const [nom, c] of [
      ['ext35',      { ete_tavi_ext_circ: '35' }],
      ['ext15',      { ete_tavi_ext_circ: '15' }],
      ['triv3',      { ete_tavi_ext_circ: '5', ete_tavi_vc_ancho: '0.2', ete_tavi_vc_area: '0.05' }],
      ['triv1',      { ete_tavi_ext_circ: '5' }],
      ['holo19',     { ete_tavi_flujo_rev: 'holo', ete_tavi_vel_tele: '19' }],
      ['holo25',     { ete_tavi_flujo_rev: 'holo', ete_tavi_vel_tele: '25' }],
      ['holo35',     { ete_tavi_flujo_rev: 'holo', ete_tavi_vel_tele: '35' }],
      ['ceros',      { ete_tavi_ext_circ: '0' }],
      ['vacio',      {}]
    ]) g.lab[nom] = await ev(`window.__P.labTavi(${JSON.stringify(c)})`);
    out.grupos.tavi = g;
  }

  /* ── 3 · pvlao ── PRO-B3: la fuga de la protesis AORTICA quirurgica. ─────────────────────
     La escena base, con teclas y clics reales. `morf` elige la morfologia y `extra` carga los
     campos de cada escena.
     DENOMINADOR: se devuelve la geometria de los tres campos nuevos y la visibilidad del bloque,
     para que el lector pueda ver que la escena de verdad llego al bloque. Sin eso, un `va_morf`
     que no quedo da `bloqueVis:false` y todas las escenas informan lo mismo, que se lee igual que
     «la regla no funciona». */
  async function escenaPvl(morf, origen, extra) {
    await ev(`window.__P.nuevo()`);
    await ev(`window.__P.abrirValv()`);
    /* ⚠️ EL BLOQUE DE LA INSUFICIENCIA AORTICA ESTA DETRAS DE SU PROPIA PUERTA, y `abrirValv`
       abre las otras tres cajas pero NO esta. La primera corrida informo `bloqueVis:false` en las
       escenas que no tipean ningun campo —un `tipear` llama a `abrirPara`, que sube por el DOM y
       la abre de rebote— asi que la visibilidad salia true o false segun si la escena tecleaba
       algo, no segun la morfologia. Se abre explicitamente por un campo ancla del bloque. */
    const ap = await ev(`window.__P.abrirPara('ia_vc')`);
    if (!ap || !ap.ok) throw new Error('DENOMINADOR: no abrio el bloque de la IAo ' + JSON.stringify(ap));
    const sm = await ev(`window.__P.sel('va_morf', ${JSON.stringify(morf)})`);
    if (sm && sm.err) throw new Error('DENOMINADOR va_morf: ' + JSON.stringify(sm));
    if (origen !== null) {
      const so = await ev(`window.__P.sel('ea_pvl_origen', ${JSON.stringify(origen)})`);
      if (so && so.err) return { denominadorOrigen: so };
    }
    for (const k of Object.keys(extra || {})) {
      if (extra[k] === '') continue;
      await tipear(k, String(extra[k]));
    }
    const o = await ev(`window.__P.pvlAo()`);
    o.ia = await ev(`window.__P.iaFilas()`);
    return o;
  }

  if (corre('pvlao')) {
    const g = { escenas: {} };
    /* Las TRES morfologias: nativa, protesis quirurgica (las dos) y TAVI. El bloque aparece SOLO
       con las dos quirurgicas. */
    for (const morf of ['Trivalva normal', 'Prótesis biológica', 'Prótesis mecánica', 'TAVI']) {
      g.escenas['morf|' + morf] = await escenaPvl(morf, null, {});
    }
    /* Los CUATRO estados del origen sobre la misma protesis con los mismos numeros: sin
       consignar, central, paravalvular y mixta. El veredicto existe SOLO en los dos ultimos. */
    for (const org of ['', 'central', 'paraval', 'mixta']) {
      g.escenas['origen|' + (org || 'vacio')] =
        await escenaPvl('Prótesis biológica', org, { ea_pvl_ext: '15' });
    }
    /* La integracion: gana el peor. Extension TRIVIAL (5 %) con area de vena contracta SEVERA
       (0,35 cm2) tiene que dar SEVERA, y al reves tambien. */
    g.escenas['peor|extTrivVcaSev'] = await escenaPvl('Prótesis mecánica', 'paraval',
      { ea_pvl_ext: '5', ea_pvl_vc_area: '0.35' });
    g.escenas['peor|extSevVcaTriv'] = await escenaPvl('Prótesis mecánica', 'paraval',
      { ea_pvl_ext: '35', ea_pvl_vc_area: '0.05' });
    /* «Trivial» exige TRES de los cuatro en banda trivial: con dos sale «Leve — faltan
       parametros», con tres sale «Trivial». */
    g.escenas['triv|dos']  = await escenaPvl('Prótesis mecánica', 'paraval',
      { ea_pvl_ext: '5', ea_pvl_vc_area: '0.05' });
    g.escenas['triv|tres'] = await escenaPvl('Prótesis mecánica', 'paraval',
      { ea_pvl_ext: '5', ea_pvl_vc_area: '0.05', ia_vc: '2' });
    g.escenas['triv|cuatro'] = await escenaPvl('Prótesis mecánica', 'paraval',
      { ea_pvl_ext: '5', ea_pvl_vc_area: '0.05', ia_vc: '2', ia_pht: '600' });
    /* Los dos PRESTADOS: el ancho de vena contracta y el THP salen de los campos de la IAo, y su
       grado tiene que coincidir con el que esas mismas filas publican arriba. */
    g.escenas['prestado|vc8'] = await escenaPvl('Prótesis biológica', 'paraval', { ia_vc: '8' });
    g.escenas['prestado|pht150'] = await escenaPvl('Prótesis biológica', 'paraval', { ia_pht: '150' });
    /* El CERO medido: se busco el jet y no esta. */
    g.escenas['cero'] = await escenaPvl('Prótesis biológica', 'paraval', { ea_pvl_ext: '0' });
    /* Origen consignado y ni un parametro: se dice el origen y NO se gradua. */
    g.escenas['sinParams'] = await escenaPvl('Prótesis biológica', 'paraval', {});
    /* El reverso NO entra en este motor: con `ia_vmax_td` en 25 cm/s —que en la TAVI seria
       MODERADA— la fuga de la quirurgica no se mueve, y la fila nativa SI publica severa. */
    g.escenas['reversoNoEntra'] = await escenaPvl('Prótesis biológica', 'paraval',
      { ea_pvl_ext: '5', ea_pvl_vc_area: '0.05', ia_vc: '2', ia_vmax_td: '25' });
    /* El informe y el EN SUMA en los TRES estilos, sobre la escena moderada. */
    await escenaPvl('Prótesis biológica', 'paraval', { ea_pvl_ext: '15' });
    g.inf = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) g.inf[est] = await ev(`window.__P.informe('${est}')`);
    g.pdf = await ev(`window.__P.pdf('clasico')`);
    g.v2d = await ev(`window.__P.v2d('insuf:aortica')`);
    /* «Nuevo estudio» tiene que esconder el bloque y vaciar las dos filas. */
    await ev(`window.__P.nuevo()`);
    g.trasNuevo = await ev(`window.__P.pvlAo()`);
    /* Control negativo: una NATIVA con los mismos numeros de la IAo no publica nada de fuga. */
    g.escenas['nativaMismoNumero'] = await escenaPvl('Trivalva normal', null, { ia_vc: '8', ia_pht: '150' });
    out.grupos.pvlao = g;
  }

  /* ── 4 · bordes ── CADA CRITERIO DE LA TABLA 8, POR SU VALOR EXACTO Y SUS DOS VECINOS. ───
     Un parametro por escena, para que el veredicto sea el de ESE parametro y no el del peor de
     dos. Los dos prestados van en sus unidades reales: `ia_vc` en MILIMETROS (la tabla publica
     cm) y `ia_pht` en ms. */
  if (corre('bordes')) {
    const g = { ext: {}, vcArea: {}, vcAncho: {}, pht: {} };
    for (const x of ['9', '10', '29', '30'])
      g.ext[x] = await escenaPvl('Prótesis biológica', 'paraval', { ea_pvl_ext: x });
    for (const x of ['0.09', '0.10', '0.29', '0.30'])
      g.vcArea[x] = await escenaPvl('Prótesis biológica', 'paraval', { ea_pvl_vc_area: x });
    for (const x of ['2.9', '3', '6', '6.1'])
      g.vcAncho[x] = await escenaPvl('Prótesis biológica', 'paraval', { ia_vc: x });
    for (const x of ['199', '200', '500', '501'])
      g.pht[x] = await escenaPvl('Prótesis biológica', 'paraval', { ia_pht: x });
    out.grupos.bordes = g;
  }

  /* ── 7 · maqueta ── LOS DOS TEMAS Y LOS CUATRO ANCHOS, CON EL COLOR REAL. ────────────────
     Las variables que el bloque usa son `--accent2`, `--text2` y las cuatro clases `badge-*`,
     todas GLOBALES: se mide el color COMPUTADO y no el nombre de la variable, que es la trampa
     del ambar que fuera de `.amilo-root` se ve GRIS y que este archivo ya pago cinco veces.
     ⚠️ EL TEMA CLARO ES LA CLASE `light-mode` EN EL ELEMENTO RAIZ, y la sonda ABORTA si no
     quedo puesta: dos capturas identicas byte por byte son la firma de que el cambio no ocurrio. */
  if (corre('maqueta')) {
    const g = { celdas: {} };
    await escenaPvl('Prótesis biológica', 'paraval', { ea_pvl_ext: '15' });
    for (const claro of [false, true]) {
      const t = await ev(`window.__P.tema(${claro})`);
      if (!!t.claro !== claro) throw new Error('DENOMINADOR: la clase light-mode no quedo ' + JSON.stringify(t));
      for (const [w, h] of [[1200, 700], [768, 1024], [390, 844], [360, 740]]) {
        await viewport(w, h);
        await ev(`window.__P.despejar()`);
        /* ⚠️ A 768 px Y POR DEBAJO EL CAJON DE LA INSUFICIENCIA AORTICA SE CIERRA, y el respaldo
           que `abrirPara` escribe en linea NO GANA: el CSS del celular usa la clase con
           `!important`. La primera corrida informo el bloque en 0x0 en las SEIS celdas angostas
           con el bloque perfecto. Se abre con el GESTO REAL del medico, `valvDatosTog`, despues de
           cambiar el viewport, y se publica el display resultante al lado de la geometria. */
        const cj = await ev(`(function(){
          var c = document.getElementById('caja-insuf-aortica');
          var b = document.getElementById('bloque-insuf-aortica');
          if (b && getComputedStyle(b).display === 'none' && typeof valvDatosTog === 'function')
            valvDatosTog('caja-insuf-aortica');
          return { caja: c ? 'ok' : 'NO EXISTE',
                   detalle: b ? getComputedStyle(b).display : 'NO EXISTE' } })()`);
        g.celdas[(claro ? 'dia' : 'noche') + '|' + w] = {
          cajon: cj,
          bloque: await ev(`window.__P.geo('bloque-prot-va-pvl')`),
          origen: await ev(`window.__P.geo('ea_pvl_origen')`),
          ext:    await ev(`window.__P.geo('ea_pvl_ext')`),
          vcA:    await ev(`window.__P.geo('ea_pvl_vc_area')`),
          colorTitulo: await ev(`window.__P.color('#bloque-prot-va-pvl')`),
          colorBadge:  await ev(`(function(){ var e = document.querySelector('#ea-pvl-interp .badge');
            if (!e) return 'NO EXISTE'; var c = getComputedStyle(e);
            return c.color + ' / ' + c.backgroundColor })()`),
          scrollH: await ev(`(function(){ return { ancho: document.documentElement.scrollWidth,
            viewport: document.documentElement.clientWidth } })()`)
        };
      }
    }
    await viewport(1200, 900);
    await ev(`window.__P.tema(false)`);
    out.grupos.maqueta = g;
  }

  /* ── 8 · captura ── EL PNG DEL BLOQUE, EN LOS DOS TEMAS Y A DOS ANCHOS. ──────────────────
     Mirar el PNG es como este repositorio caza los acentos comidos y los rotulos encimados, que
     ninguna medicion de geometria ve. Tres trampas ya documentadas y las tres resueltas aca:
       · el `clip` de `Page.captureScreenshot` va en coordenadas de PAGINA y el `getBoundingClientRect`
         en las del VIEWPORT, asi que hay que sumarle el desplazamiento o el PNG sale con la
         botonera de la app y se ve perfectamente bien;
       · con `deviceScaleFactor: 2` ese clip se interpreta en pixeles de DISPOSITIVO y el recorte
         cae a la mitad de la coordenada pedida: el factor va en 1;
       · un recorte mas alto que la ventana sale en NEGRO, porque lo que no esta renderizado no se
         dibuja: se desplaza el nodo a la vista ANTES de leer su rect.
     Los md5 de los dos temas tienen que DIFERIR: dos capturas identicas byte por byte son la firma
     de que `light-mode` nunca se puso. */
  if (corre('captura')) {
    const g = { archivos: {} };
    if (!DEST) { g.err = 'falta --dest'; out.grupos.captura = g; }
    else {
      await escenaPvl('Prótesis biológica', 'paraval', { ea_pvl_ext: '15', ea_pvl_vc_area: '0.35' });
      for (const claro of [false, true]) {
        const t = await ev(`window.__P.tema(${claro})`);
        if (!!t.claro !== claro) throw new Error('DENOMINADOR: light-mode no quedo');
        for (const [w, h] of [[1200, 700], [390, 844]]) {
          await viewport(w, h);
          await ev(`window.__P.despejar()`);
          await ev(`(function(){
            var b = document.getElementById('bloque-insuf-aortica');
            if (b && getComputedStyle(b).display === 'none' && typeof valvDatosTog === 'function')
              valvDatosTog('caja-insuf-aortica');
            var n = document.getElementById('bloque-prot-va-pvl');
            if (n) n.scrollIntoView({ block: 'center' });
            return 1 })()`);
          const r = await ev(`(function(){
            var n = document.getElementById('bloque-prot-va-pvl');
            if (!n) return null; var q = n.getBoundingClientRect();
            return { x: Math.max(0, Math.round(q.left + window.scrollX) - 6),
                     y: Math.max(0, Math.round(q.top + window.scrollY) - 6),
                     w: Math.round(q.width) + 12, h: Math.round(q.height) + 12 } })()`);
          if (!r || r.w < 40 || r.h < 40) throw new Error('DENOMINADOR captura: rect inutil ' + JSON.stringify(r));
          const cap = await cdp.send('Page.captureScreenshot',
            { format: 'png', captureBeyondViewport: true,
              clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } }, sessionId);
          const nom = 'pvlao_' + (claro ? 'dia' : 'noche') + '_' + w + '.png';
          await writeFile(join(DEST, nom), Buffer.from(cap.data, 'base64'));
          g.archivos[nom] = { rect: r, bytes: Buffer.from(cap.data, 'base64').length,
            md5: createHash('md5').update(Buffer.from(cap.data, 'base64')).digest('hex') };
        }
      }
      await viewport(1200, 900);
      await ev(`window.__P.tema(false)`);
      out.grupos.captura = g;
    }
  }

  /* ── 9 · controles ── NADA AJENO SE MUEVE. ───────────────────────────────────────────────
     Con el formulario vacio y con escenario cargado: informe en los tres estilos, EN SUMA,
     Excel en 440 columnas CLAVE POR CLAVE, los ocho grados con sus ocho pastillas, la
     diastolica y el HFA-PEFF. */
  if (corre('controles')) {
    const g = {};
    await ev(`window.__P.nuevo()`);
    g.vacio = { inf: await ev(`window.__P.informe('estandar')`),
                excel: await ev(`window.__P.excelDOM()`), grados: await ev(`window.__P.grados()`),
                assert: await ev(`window.__P.assertXls()`) };
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
    g.cargado.grados  = await ev(`window.__P.grados()`);
    g.cargado.excel   = await ev(`window.__P.excelDOM()`);
    g.cargado.diast   = await ev(`window.__P.txt('dd-interp')`);
    g.cargado.hfapeff = await ev(`window.__P.txt('hfapeff-eco')`);
    g.cargado.iaFilas = await ev(`window.__P.iaFilas()`);
    g.cargado.ppm     = await ev(`window.__P.ppmFilas()`);
    g.cargado.prot    = await ev(`window.__P.prot()`);
    g.cargado.protAo  = await ev(`window.__P.protAo()`);
    g.cargado.eaCuadro = await ev(`window.__P.eaCuadro()`);
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
