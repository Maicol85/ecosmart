#!/usr/bin/env node
/**
 * _probe_vs.mjs — sonda A/B de SOLO LECTURA de la tanda «VS» (2026-10-17): el VENTRICULO
 * DERECHO, la AURICULA DERECHA, la VENA CAVA INFERIOR y la RAIZ AORTICA alineados a la Tabla 1
 * de la ASE 2025 de corazon derecho.
 *
 * Grupos (cada uno con salida parcial propia por stderr):
 *   fun       — funcion sistolica del VD: TAPSE, onda S', FAC, FEVD y Tei por sus bordes
 *               EXACTOS (el valor del corte, uno por debajo y uno por encima), con la capsula,
 *               el informe en TRES estilos, el EN SUMA y la columna DisfSist_VD del Excel.
 *   tam       — tamano del VD: basal, medio, longitudinal y pared, por sus bordes.
 *   ad        — area de la auricula derecha por sus bordes.
 *   vci       — vena cava inferior: 20, 21 y 22 mm contra la PmAD y la PSAP.
 *   aorta     — seno de Valsalva en 39,9 / 40,0 / 40,1 mm y los otros cuatro segmentos.
 *   registro  — cada ficha contra el DUENO que usa el informe.
 *   tarjetas  — las cuatro tarjetas i y la pestana Referencias.
 *   controles — informe (3 estilos), EN SUMA, Excel clave por clave, grados, pastillas,
 *               diastolica, HFA-PEFF y las zonas que esta tanda NO toca.
 *
 *   node scripts/_probe_vs.mjs --file /tmp/index.HEAD.html --solo fun > /tmp/vs.HEAD.json
 *   node scripts/_probe_vs.mjs --solo fun                            > /tmp/vs.NEW.json
 *
 * Infraestructura (servidor, Chrome, teclas reales, abortos) calcada de _probe_m.mjs.
 *
 * ⚠️ NI UN ACENTO GRAVE adentro de la SONDA, tampoco en los comentarios de este archivo.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-pdfvc-'));
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
    let id = 0; const pend = new Map();
    ws.addEventListener('open', () => res({
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}

const SOLO = (() => { const i = process.argv.indexOf('--solo');
  return i > 0 ? process.argv[i + 1].split(',').map(s => s.trim()).filter(Boolean) : [] })();
const corre = (g) => !SOLO.length || SOLO.indexOf(g) > -1;
const DEST = arg('--dest');


/* ══ LA SONDA QUE VIVE EN LA PAGINA ══════════════════════════════════════════════════════════
   CENTINELA en cada lectura: contra HEAD varias piezas no existen, y un `.length` sobre
   undefined mata la corrida entera — eso prueba que el arbol es distinto, no que la sonda sabe
   medir. Es la leccion que TC-455, TC-473, TC-477, TC-480, TC-485 y TC-492 ya tienen escrita. */
const SONDA = `window.__P = {
  despejar() { var o = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (!m) { o[id] = 'NO EXISTE'; return }
      o[id] = getComputedStyle(m).display;
      if (o[id] !== 'none') { m.style.display = 'none'; o[id] += ' -> none' } });
    return o },

  val(id) { var e = document.getElementById(id); return e ? e.value : 'NO EXISTE' },
  cap(id) { var e = document.getElementById(id); return e ? String(e.textContent||'').trim() : 'NO EXISTE' },
  geo(id) { var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), ok: r.width > 0 && r.height > 0 } },

  abrirPara(id) {
    var e = document.getElementById(id);
    if (!e) return { ok:false, err:'NO EXISTE ' + id };
    var n = e, pasos = [];
    while (n && n !== document.body) {
      if (n.classList && n.classList.contains('tab-section') && n.id) {
        if (getComputedStyle(n).display === 'none') {
          try { showTab(String(n.id).replace(/^tab-/, '')); pasos.push('tab:' + n.id) } catch (x) {}
        }
      }
      if (n.id && /^sacc-/.test(n.id) && getComputedStyle(n).display === 'none') {
        try { secToggle(String(n.id).replace(/^sacc-/, '')); pasos.push('sacc:' + n.id) } catch (x) {}
      }
      if (n.id && getComputedStyle(n).display === 'none') {
        var hd = document.querySelector('[onclick*="toggleCard(' + String.fromCharCode(39) + n.id + String.fromCharCode(39) + '"]');
        if (hd) { try { hd.click(); pasos.push('card:' + n.id) } catch (x) {} }
      }
      n = n.parentElement;
    }
    var r = e.getBoundingClientRect();
    return { ok: r.width > 0 && r.height > 0, pasos: pasos,
             rect: { w: Math.round(r.width), h: Math.round(r.height) } } },

  sel(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err:'NO EXISTE ' + id };
    var hay = Array.prototype.slice.call(e.options || []).map(function(o){ return o.value });
    if (hay.indexOf(valor) < 0) return { err:'NO HAY OPCION ' + valor, hay:hay };
    e.value = valor; e.dispatchEvent(new Event('change', { bubbles:true }));
    return (e.value === valor) ? { ok:true } : { err:'NO QUEDO', valor:e.value } },

  limpiar() { try { limpiarCampos(true) } catch (e) {} return 1 },

  /* ── Las capsulas del cuadro de referencias del VD, de la AD y de la aorta ── */
  capsulas() {
    var ids = ['tapse-interp','sprime-interp','fac-interp','fevd-interp','vd-tei-interp',
               'vd-tam','vd-pared-interp','vd-vi-interp','vd-qp-interp','tap-interp',
               'ad-interp','pmad-interp','ao-interp','ao-st-interp','ao-tub-interp',
               'ao-cay-interp','ao-desc-interp'];
    var o = {}; ids.forEach(function(k){ o[k] = window.__P.cap(k) }); return o },

  /* ── El DUENO, preguntado directo: es lo que separa «el corte no esta cableado» de «el
        corte no existe». Devuelve 'SIN FN' como CADENA, no null, y el lector compara por
        TIPO antes de llamarle un metodo. ── */
  duenio(fn, x) {
    try { if (typeof window[fn] !== 'function') return 'SIN FN';
      var r = window[fn](x);
      return (r && typeof r === 'object') ? (r.cat || r.clave || JSON.stringify(r)) : r;
    } catch (e) { return 'EXC ' + String(e && e.message) } },
  grado(clave, x) {
    try { if (typeof window.ase25Grado !== 'function') return 'SIN FN';
      return window.ase25Grado(clave, x) } catch (e) { return 'EXC' } },
  rango(clave, g) {
    try { if (typeof window.ase25Rango !== 'function') return 'SIN FN';
      return window.ase25Rango(clave, g, true) } catch (e) { return 'EXC' } },

  /* ── El informe y el EN SUMA. El estilo es ESTADO DE SESION: se fija en cada escena. ── */
  informe(est) {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(est) } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    return { inf: window.__P.val('informe_texto'), suma: window.__P.val('en_suma') } },
  /* Las lineas del VD y de la AD, aisladas: comparar el informe entero entre escenas mezcla la
     diastolica y la aorta, que no son de este parametro. */
  lineas(est, re) {
    var r = window.__P.informe(est);
    var rx = new RegExp(re, 'i');
    var ls = String(r.inf || '').split(String.fromCharCode(10)).filter(function(l){ return rx.test(l) });
    var ss = String(r.suma || '').split(String.fromCharCode(10)).filter(function(l){ return rx.test(l) });
    return { inf: ls, suma: ss } },
  tresEstilos(re) {
    return { conciso: window.__P.lineas('conciso', re),
             estandar: window.__P.lineas('estandar', re),
             narrativo: window.__P.lineas('narrativo', re) } },

  camposCrudos() { var c = {};
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
      if (e.type === 'checkbox' || e.type === 'radio') c[e.id + '__chk'] = e.checked ? '1' : '0';
      else c[e.id] = e.value });
    return c },
  excel() {
    try {
      if (typeof _labExcelRow !== 'function') return { err:'SIN _labExcelRow' };
      var cp = window.__P.camposCrudos();
      var f = _labExcelRow({ id:'p1', fecha:'2026-10-17', nombre:'X', campos: cp,
                             informe_texto: cp.informe_texto || '', en_suma: cp.en_suma || '' });
      return { n: Object.keys(f).length, fila: f };
    } catch (e) { return { err: String(e && e.message) } } },
  /* La columna que guarda una categoria DERIVADA del texto: tiene que cambiar solo en las
     escenas esperadas. Se le pregunta al dueno con el informe ya generado. */
  disfVD() {
    try { if (typeof _labDisfSistVent !== 'function') return 'SIN FN';
      var cp = window.__P.camposCrudos();
      var r = _labDisfSistVent({ campos: cp });
      return r.vi + '/' + r.vd;
    } catch (e) { return 'EXC' } },

  grados() { var o = {};
    ['im_grado','ia_grado','it_grado','ip_grado','ea_grado','em_grado','et_grado','ep_grado']
      .forEach(function(id){ o[id] = window.__P.val(id) });
    return o },
  pastillas() { var o = {};
    Array.prototype.slice.call(document.querySelectorAll('[id^="pill-"]')).forEach(function(b){
      o[b.id] = b.getAttribute('aria-pressed') });
    return o },
  otros() {
    return { diast: window.__P.cap('dd-interp'), hfapeff: window.__P.cap('hfapeff-eco'),
             psap: window.__P.val('psap_calc'), pmad: window.__P.val('pmad'),
             ai: window.__P.cap('ai-interp'), vi: window.__P.cap('vi-geom-interp'),
             fevi: window.__P.cap('fevi-interp'), htp: window.__P.cap('htp2022-prob') } },

  almacen() { var k = [];
    try { for (var i = 0; i < localStorage.length; i++) k.push(localStorage.key(i)) } catch (e) {}
    return { nLocal: k.length } },

  listo() {
    var faltan = ['limpiarCampos','showTab','generarInforme','calcVD','calcAD','calcPmAD','calcAorta']
      .filter(function(f){ return typeof window[f] !== 'function' });
    return faltan.length ? { listo:false, faltan:faltan } : { listo:true } }
};
'OK';
`;

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

/* ⚠️ LA FAC ES UN CAMPO DE SOLO LECTURA: se llega a un valor EXACTO por el par de areas, que es
   el gesto del medico. Con el area telediastolica en 20 cm2, la FAC es (20 - as) * 5, asi que
   cada punto de FAC sale de dos decimales del area telesistolica. */
const FAC_AS = (fac) => (20 - fac / 5).toFixed(2);

async function main() {
  const antes = await md5(EXTERNO ? FARG : join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page' && x.url.includes('127.0.0.1'));
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

  async function ev(expr, ms) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId),
      pausa(ms || 30000).then(() => ({ __reloj: true })),
    ]);
    if (r.__reloj) throw new Error('ev() no resolvio: ' + expr.slice(0, 90));
    if (r.exceptionDetails) throw new Error('EXC: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' | ' + expr.slice(0, 90));
    return r.result.value;
  }
  const J = async (e) => JSON.parse(await ev(e));

  const VK = { Backspace: 8, Tab: 9, Enter: 13, Escape: 27 };
  async function tecla(k) {
    const code = VK[k];
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k,
      windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k,
      windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }, sessionId);
  }
  /* ⚠️ UN TECLEO QUE NO QUEDA NO ES UNA MEDICION: se ABORTA nombrando el campo. */
  async function foco(id) {
    let g = await J(`JSON.stringify(window.__P.geo(${JSON.stringify(id)}))`);
    if (!g || g.err || !g.ok) {
      const a = await J(`JSON.stringify(window.__P.abrirPara(${JSON.stringify(id)}))`);
      if (!a || !a.ok) throw new Error('SIN GEOMETRIA ' + id + ' ' + JSON.stringify(a));
    }
    const ro = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
      return !!(e.readOnly || e.disabled) })()`);
    if (ro) throw new Error('CAMPO DE SOLO LECTURA, no se le manda una tecla: ' + id);
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)}); e.focus();
      try { if (e.setSelectionRange) e.setSelectionRange(0, (e.value||'').length) } catch (x) {}
      return 1 })()`);
    const f = await ev('document.activeElement ? document.activeElement.id : null');
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
  }

  for (let i = 0; i < 120; i++) {
    try { await ev(SONDA); const l = await J('JSON.stringify(window.__P.listo())');
      if (l.listo) break } catch (e) {}
    await pausa(500);
  }
  const listo = await J('JSON.stringify(window.__P.listo())');
  if (!listo.listo) { console.log(JSON.stringify({ error: 'NO CARGO', listo }, null, 1)); process.exit(1); }

  const abortos = [];
  const out = { arbol: FARG, md5_antes: antes, listo, grupos: {}, abortos };
  const t00 = Date.now();
  const parcial = (g, t0) => process.stderr.write('  [' + g + '] ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s\n');

  /* Carga una escena: limpia, fija los campos uno por uno con TECLAS REALES y devuelve el
     paquete de lectura. Un tecleo que no queda ABORTA la escena y se anota. */
  async function escena(set) {
    await ev('window.__P.despejar()');
    await ev('window.__P.limpiar()');
    await ev('window.__P.despejar()');
    for (const [id, val] of Object.entries(set)) {
      if (val === null) continue;
      const tipo = await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)});
        return e ? e.tagName : 'NO EXISTE' })()`);
      if (tipo === 'NO EXISTE') throw new Error('NO EXISTE el campo ' + id);
      if (tipo === 'SELECT') {
        const r = await J(`JSON.stringify(window.__P.sel(${JSON.stringify(id)}, ${JSON.stringify(String(val))}))`);
        if (r.err) throw new Error('SELECT ' + id + ': ' + r.err);
      } else {
        await tipear(id, String(val));
      }
    }
  }
  const leer = async (re) => ({
    caps: await J('JSON.stringify(window.__P.capsulas())'),
    txt:  await J(`JSON.stringify(window.__P.tresEstilos(${JSON.stringify(re)}))`),
    disf: await ev('window.__P.disfVD()'),
    otros: await J('JSON.stringify(window.__P.otros())'),
  });

  /* ── grupo fun: funcion sistolica del VD, por los bordes EXACTOS ── */
  if (corre('fun')) {
    const t0 = Date.now(); const g = {};
    /* ⚠️ EL FILTRO TIENE QUE ALCANZAR «... del VD (FAC 23%).», que es la linea de la FAC
       SEVERA del EN SUMA: con el patron anclado en «^VD » esa linea quedaba fuera y el A/B
       informo «el informe no cambia» sobre la escena que SI cambia. Es la trampa del
       denominador, esta vez en el lector. */
    const RE_VD = 'VD|ventr[ií]culo derecho';
    const FILAS = [
      ['tapse',   'tapse',   [18, 17.1, 17, 16, 13.1, 13, 12.9, 10.1, 10, 9]],
      ['s_prime', 's_prime', [9.6, 9.5, 9.4, 7.3, 7.2, 7.1, 5.1, 5, 4.9]],
      ['fevd',    'fevd',    [46, 45.1, 45, 40, 39.1, 39, 32, 31.9]],
      ['vd_tei',  'vd_tei',  [0.54, 0.55, 0.61, 0.62, 0.69, 0.7]],
    ];
    for (const [clave, campo, vals] of FILAS) {
      g[clave] = {};
      for (const v of vals) {
        try {
          await escena({ [campo]: String(v) });
          const r = await leer(RE_VD);
          g[clave][String(v)] = { cap: r.caps[clave === 'tapse' ? 'tapse-interp'
            : clave === 's_prime' ? 'sprime-interp' : clave === 'fevd' ? 'fevd-interp' : 'vd-tei-interp'],
            duenio: await ev(`window.__P.duenio(${JSON.stringify(clave === 'tapse' ? 'vdTapseCat' : clave === 's_prime' ? 'vdSprimeCat' : clave === 'fevd' ? 'vdFevdCat' : 'vdTeiCat')}, ${v})`),
            inf: r.txt.estandar.inf, suma: r.txt.estandar.suma,
            conc: r.txt.conciso.inf, narr: r.txt.narrativo.inf, disf: r.disf };
        } catch (e) { g[clave][String(v)] = { ABORTO: e.message }; abortos.push('fun ' + clave + ' ' + v + ': ' + e.message); }
      }
      parcial('fun/' + clave, t0);
    }
    /* La FAC por el par de areas, que es el gesto real. */
    g.vd_fac = {};
    for (const fac of [36, 35, 34, 30, 29, 28, 23, 22, 21]) {
      try {
        await escena({ vd_area_d: '20', vd_area_s: FAC_AS(fac) });
        const r = await leer(RE_VD);
        g.vd_fac[String(fac)] = { fac: await ev("window.__P.val('vd_fac')"), cap: r.caps['fac-interp'],
          duenio: await ev(`window.__P.duenio('vdFacCat', ${fac})`),
          inf: r.txt.estandar.inf, suma: r.txt.estandar.suma, disf: r.disf };
      } catch (e) { g.vd_fac[String(fac)] = { ABORTO: e.message }; abortos.push('fun fac ' + fac + ': ' + e.message); }
    }
    /* El OR no cambia: con DOS parametros alterados el informe dice lo mismo que con uno. */
    try {
      await escena({ tapse: '15', s_prime: '8' });
      g.or_dos = await leer(RE_VD);
      await escena({ tapse: '22', s_prime: '12', fevd: '30' });
      g.or_fevd_no_vota = await leer(RE_VD);
    } catch (e) { g.or = { ABORTO: e.message }; abortos.push('fun or: ' + e.message); }
    /* Los rangos que publica el dueno, para que el caso compare la ficha contra ellos. */
    g.rangos = {};
    for (const k of ['tapse','s_prime','vd_fac','fevd','vd_tei','vd_bas','vd_mid','vd_long','vd_pared','ad_area','vd_area_s','vd_area_d']) {
      g.rangos[k] = {};
      for (const gr of ['normal','leve','moderada','severa']) g.rangos[k][gr] = await ev(`window.__P.rango(${JSON.stringify(k)}, ${JSON.stringify(gr)})`);
    }
    out.grupos.fun = g; parcial('fun', t0);
  }

  /* ── grupo tam: tamano del VD, por los bordes EXACTOS ── */
  if (corre('tam')) {
    const t0 = Date.now(); const g = {};
    const RE_VD = 'VD|ventr[ií]culo derecho';
    const FILAS = [
      ['vd_bas',   [40, 40.9, 41, 44, 44.1, 45, 49, 49.1, 52]],
      ['vd_mid',   [34, 34.9, 35, 38, 38.1, 42, 42.1]],
      ['vd_long',  [81, 82, 86, 89, 89.1, 96, 96.1]],
      ['vd_pared', [4.9, 5, 7, 7.1, 9, 9.1]],
    ];
    const DUE = { vd_bas:'vdBasCat', vd_mid:'vdMidCat', vd_long:'vdLongCat', vd_pared:'vdParedCat' };
    for (const [campo, vals] of FILAS) {
      g[campo] = {};
      for (const v of vals) {
        try {
          await escena({ [campo]: String(v) });
          const r = await leer(RE_VD);
          g[campo][String(v)] = {
            cap: r.caps[campo === 'vd_pared' ? 'vd-pared-interp' : 'vd-tam'],
            duenio: await ev(`window.__P.duenio(${JSON.stringify(DUE[campo])}, ${v})`),
            inf: r.txt.estandar.inf, suma: r.txt.estandar.suma,
            conc: r.txt.conciso.inf, narr: r.txt.narrativo.inf, disf: r.disf };
        } catch (e) { g[campo][String(v)] = { ABORTO: e.message }; abortos.push('tam ' + campo + ' ' + v + ': ' + e.message); }
      }
      parcial('tam/' + campo, t0);
    }
    /* El PEOR de los tres manda, y con dos hallazgos se nombra cada uno con su grado. */
    try {
      await escena({ vd_bas: '43', vd_mid: '40' });
      g.peor_de_dos = await leer(RE_VD);
      await escena({ vd_bas: '43' });
      g.solo_basal_leve = await leer(RE_VD);
      await escena({ vd_bas: '38', vd_mid: '36' });
      g.solo_medio_leve = await leer(RE_VD);
      /* Las dos areas NO clasifican en el informe: se cargan y la oracion no las nombra. */
      await escena({ vd_area_d: '34', vd_area_s: '21' });
      g.areas_no_informan = await leer(RE_VD);
      g.areas_duenio = { s: await ev("window.__P.duenio('vdAreaSCat', 21)"),
                         d: await ev("window.__P.duenio('vdAreaDCat', 34)") };
    } catch (e) { g.combinadas = { ABORTO: e.message }; abortos.push('tam combinadas: ' + e.message); }
    out.grupos.tam = g; parcial('tam', t0);
  }

  /* ── grupo ad: area de la auricula derecha, por los bordes EXACTOS ── */
  if (corre('ad')) {
    const t0 = Date.now(); const g = {};
    const RE_AD = 'AD|aur[ií]cula derecha';
    for (const v of [17, 18, 18.9, 19, 22, 22.1, 24, 24.1, 27]) {
      try {
        await escena({ ad_area: String(v) });
        const r = await leer(RE_AD);
        g[String(v)] = { cap: r.caps['ad-interp'], duenio: await ev(`window.__P.duenio('adAreaCat', ${v})`),
          inf: r.txt.estandar.inf, suma: r.txt.estandar.suma,
          conc: r.txt.conciso.inf, narr: r.txt.narrativo.inf, htp: r.otros.htp };
      } catch (e) { g[String(v)] = { ABORTO: e.message }; abortos.push('ad ' + v + ': ' + e.message); }
    }
    out.grupos.ad = g; parcial('ad', t0);
  }

  /* ── grupo vci: vena cava inferior por su borde, contra la PmAD y la PSAP ── */
  if (corre('vci')) {
    const t0 = Date.now(); const g = {};
    for (const d of [20, 21, 21.1, 22]) {
      for (const c of ['>50', '<50']) {
        const k = d + ' ' + c;
        try {
          await escena({ vci_diam: String(d), vci_col: c, vmax_it: '3.0' });
          g[k] = { pmad: await ev("window.__P.val('pmad')"),
                   cap: await ev("window.__P.cap('pmad-interp')"),
                   psap: await ev("window.__P.val('psap_calc')"),
                   inf: await J(`JSON.stringify(window.__P.lineas('estandar', 'VCI'))`) };
        } catch (e) { g[k] = { ABORTO: e.message }; abortos.push('vci ' + k + ': ' + e.message); }
      }
    }
    /* La tabla de la tarjeta lee del mismo dueno: sus cuatro filas y sus dos rotulos. */
    try {
      g.tabla = await J(`JSON.stringify((function(){
        var box = document.createElement('div');
        if (typeof _evVciTabla !== 'function') return { err:'SIN FN' };
        box.appendChild(_evVciTabla('nor-col'));
        return { txt: String(box.textContent||'').trim(),
                 filas: Array.prototype.slice.call(box.querySelectorAll('[data-ev-fila]')).map(function(tr){
                   return String(tr.textContent||'').trim() }) } })())`);
    } catch (e) { g.tabla = { ABORTO: e.message }; abortos.push('vci tabla: ' + e.message); }
    out.grupos.vci = g; parcial('vci', t0);
  }

  /* ── grupo aorta: el seno de Valsalva en su borde y los otros cuatro segmentos ── */
  if (corre('aorta')) {
    const t0 = Date.now(); const g = {};
    const RE_AO = 'aorta|a[óo]rtic|sinotubular|cayado';
    for (const v of [39.9, 40, 40.1, 45, 45.1, 50, 50.1]) {
      try {
        await escena({ ao_sin: String(v) });
        const r = await leer(RE_AO);
        g['sin ' + v] = { cap: r.caps['ao-interp'], inf: r.txt.estandar.inf, suma: r.txt.estandar.suma };
      } catch (e) { g['sin ' + v] = { ABORTO: e.message }; abortos.push('aorta sin ' + v + ': ' + e.message); }
    }
    /* CONTROL NEGATIVO: los otros cuatro segmentos conservan su operador estricto. */
    const OTROS = [['ao_st', 38, 'ao-st-interp'], ['ao_tub', 40, 'ao-tub-interp'],
                   ['diam_cayado', 40, 'ao-cay-interp'], ['diam_ao_toracica', 35, 'ao-desc-interp']];
    for (const [campo, ref, cap] of OTROS) {
      for (const d of [-0.1, 0, 0.1]) {
        const v = +(ref + d).toFixed(1);
        try {
          await escena({ [campo]: String(v) });
          const r = await leer(RE_AO);
          g[campo + ' ' + v] = { cap: r.caps[cap], inf: r.txt.estandar.inf, suma: r.txt.estandar.suma };
        } catch (e) { g[campo + ' ' + v] = { ABORTO: e.message }; abortos.push('aorta ' + campo + ' ' + v + ': ' + e.message); }
      }
    }
    /* El corte que PUBLICA la tarjeta, sondeado al dueno. */
    try {
      await escena({ ao_sin: '42', edad: '55', peso: '80', talla: '180' });
      g.tarjeta = await J(`JSON.stringify((function(){
        if (typeof evTarjetaAo !== 'function') return { err:'SIN FN' };
        var box = document.createElement('div'); box.appendChild(evTarjetaAo());
        var o = {}; Array.prototype.slice.call(box.querySelectorAll('[data-ev-cat]')).forEach(function(d){
          o[d.getAttribute('data-ev-cat')] = String(d.textContent||'').trim() });
        return o })())`);
    } catch (e) { g.tarjeta = { ABORTO: e.message }; abortos.push('aorta tarjeta: ' + e.message); }
    out.grupos.aorta = g; parcial('aorta', t0);
  }

  out.md5_despues = await md5(EXTERNO ? FARG : join(RAIZ, 'index.html'));
  out.index_intacto = out.md5_antes === out.md5_despues;
  out.segundos = +((Date.now() - t00) / 1000).toFixed(1);
  console.log(JSON.stringify(out, null, 1));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }) } catch {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
