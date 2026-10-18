#!/usr/bin/env node
/**
 * _probe_qtarjwk.mjs - sonda de SOLO LECTURA de la tanda Q (las tarjetas i de Valvulas), en los
 * DOS MOTORES. Cierra las dos mediciones que la sonda de CDP no puede hacer:
 *   maqueta - las nueve tarjetas en Chrome y en WebKit, a CUATRO viewports x DOS temas, con el
 *             color REAL resuelto, el scroll horizontal de la pagina y el scroll interno.
 *   ciclo   - 20 aperturas y cierres de las ocho tarjetas, sin acumular nodos.
 *   captura - un PNG por celda, para MIRARLO: los acentos y los rotulos encimados no los ve una
 *             medicion, los ve el ojo.
 *
 *   node scripts/_probe_qtarjwk.mjs --file /tmp/index.QHEAD.html > /tmp/qwk.HEAD.json
 *   node scripts/_probe_qtarjwk.mjs --dest /tmp/cap_q            > /tmp/qwk.NEW.json
 *
 * ADVERTENCIA: WebKit de Playwright NO es Safari, y se declara.
 * Sin acentos graves dentro del template de la sonda, tampoco en sus comentarios.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

/* Playwright se resuelve POR RUTA. Si no esta, la sonda lo DICE y sale con codigo 2. */
const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS,
    comoInstalar: 'mkdir -p /tmp/pw && cd /tmp/pw && npm i playwright && npx playwright install webkit' }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file');
const DEST = arg('--dest');
const SOLO = (arg('--solo') || '').split(',').map(s => s.trim()).filter(Boolean);
const corre = (g) => !SOLO.length || SOLO.indexOf(g) > -1;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer(async (req, rq) => {
  try {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const p = (rel === 'index.html' && ARCH) ? ARCH : join(RAIZ, rel);
    rq.writeHead(200, { 'Content-Type': MIME[extname(rel)] || 'application/octet-stream' }).end(await readFile(p));
  } catch { rq.writeHead(404).end('no'); }
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const PORT = srv.address().port;
if (DEST) { try { await mkdir(DEST, { recursive: true }) } catch (e) {} }

const out = { arbol: ARCH || 'VIVO', md5: null, grupos: {}, abortos: [] };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

const SONDA = `window.__P = {
  despejar() {
    var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++; }
    });
    return n },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },
  /* La escena se arma con asignacion directa mas el evento, porque aca no hay CDP para teclas
     reales. Lo que esta sonda mide es MAQUETA y CICLO, no una cuenta: la cuenta la mide la sonda
     de CDP con teclas de verdad. Se declara. */
  set(id, v) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value },
  /* ⚠️ LAS CUATRO SECCIONES Y LOS OCHO CAJONES: lo que esta en display:none no tiene geometria,
     asi que sin abrirlos la tarjeta no se ancla y la medicion da cero y parece impecable. */
  abrir() {
    var o = { sec: 0, caja: 0 };
    try { if (typeof showTab === 'function') showTab('valvulas') } catch (e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(sx){
      try { var c = document.getElementById('ete-seccion-' + sx);
        if (c && getComputedStyle(c).display === 'none' && typeof toggleEteSeccion === 'function') {
          toggleEteSeccion(sx); o.sec++; } } catch (e) {} });
    ['caja-insuf-mitral','caja-esten-mitral','caja-insuf-aortica','caja-esten-aortica',
     'caja-insuf-tricuspide','caja-esten-tricuspide','caja-insuf-pulmonar','caja-esten-pulmonar']
      .forEach(function(id){
        try { var c = document.getElementById(id);
          if (c && typeof valvDatosTog === 'function') {
            var b = c.querySelector('[id^="bloque-"]');
            if (b && getComputedStyle(b).display === 'none') { valvDatosTog(id); o.caja++; } }
        } catch (e) {} });
    return o },
  limpiar() {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    return window.__P.abrir() },
  escena() {
    var o = {};
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    o.abrir = window.__P.abrir();
    [['peso','80'],['talla','180'],['im_vc','8'],['em_gmedio','12'],['em_vtimit','60'],
     ['ia_vc','7'],['ia_pht','180'],['vmax_ao','4.5'],['gmedio_ao','45'],
     ['it_vc','8'],['et_gmedio','8'],['et_thp','210'],['ip_pht','80'],['vp_vmax','3.5']]
      .forEach(function(p){ window.__P.set(p[0], p[1]) });
    ['calcIM_ESC','calcEM','calcIA_ESC','calcAo','calcIT_ESC','calcET','calcIP','calcVP',
     'etRefPintar','epRefPintar','ipRefPintar','emCuadroRefRepintar','eaAvaiGradoPintar']
      .forEach(function(f){ try { if (typeof window[f] === 'function') window[f]() } catch (e) {} });
    o.abrir2 = window.__P.abrir();
    o.grados = {};
    ['im_grado','em_grado','ia_grado','ea_grado','it_grado','et_grado','ip_grado','ep_grado']
      .forEach(function(id){ var e = document.getElementById(id); o.grados[id] = e ? e.value : null });
    return o },
  abrirTarj(k) {
    var b = document.querySelector('[data-vinfo="' + k + '"]');
    if (!b) return { err: 'NO EXISTE ' + k };
    var sec = b.closest ? b.closest('.tab-section') : null;
    if (sec && getComputedStyle(sec).display === 'none' && typeof showTab === 'function')
      try { showTab(String(sec.id).slice(4)) } catch (e) {}
    var r0 = b.getBoundingClientRect();
    if (!(r0.width > 0 && r0.height > 0)) { window.__P.abrir(); r0 = b.getBoundingClientRect(); }
    if (!(r0.width > 0 && r0.height > 0)) {
      var caja = b.closest ? b.closest('[id^="caja-"]') : null;
      if (caja && typeof valvDatosTog === 'function') { try { valvDatosTog(caja.id) } catch (e) {} }
      r0 = b.getBoundingClientRect();
    }
    if (!(r0.width > 0 && r0.height > 0)) return { err: 'SIN GEOMETRIA ' + k };
    try { b.click() } catch (e) { return { err: 'NO CLICKEA ' + k } }
    var c = document.getElementById('vinfo-card');
    if (!c || c.style.display === 'none') return { err: 'NO ABRE ' + k };
    var r = c.getBoundingClientRect();
    /* El COLOR REAL del grado y de la linea «Decide», resueltos: una variable que no existe en
       esa zona se ve GRIS y getComputedStyle es lo unico que lo dice. */
    var g = c.querySelector('[data-qv-grado]'), dd = c.querySelector('[data-qv-decide]');
    var ft = c.querySelector('[data-ev-fuente]');
    return { w: Math.round(r.width), h: Math.round(r.height),
             x: Math.round(r.left), y: Math.round(r.top),
             dentro: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1,
             scrollInterno: Math.max(0, c.scrollHeight - c.clientHeight),
             colorGrado: g ? getComputedStyle(g).color : null,
             colorDecide: dd ? getComputedStyle(dd).color : null,
             colorFuente: ft ? getComputedStyle(ft).color : null,
             barras: c.querySelectorAll('[data-ev-barra]').length,
             textoLargo: (c.textContent || '').trim().length,
             acentos: ((c.textContent || '').match(/[\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00bf]/g) || []).length,
             scrollH: { sw: document.documentElement.scrollWidth,
                        cw: document.documentElement.clientWidth } } },
  cerrar() { try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch (e) {}
    var c = document.getElementById('vinfo-card');
    return !!(c && c.style.display === 'none') },
  nodos() { return document.getElementsByTagName('*').length },
  ciclo(n) {
    var CL = [];
    ['insuf','esten'].forEach(function(t){
      ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){ CL.push('tarj-' + t + '-' + v) }) });
    window.__P.cerrar();
    var n0 = window.__P.nodos(), fallos = 0;
    for (var i = 0; i < n; i++) {
      var r = window.__P.abrirTarj(CL[i % CL.length]);
      if (r && r.err) fallos++;
      window.__P.cerrar();
    }
    var c = document.getElementById('vinfo-card');
    return { n0: n0, n1: window.__P.nodos(), cerrada: !!(c && c.style.display === 'none'),
             fallos: fallos } }
};
1`;

const CLAVES = [];
['insuf','esten'].forEach(t => ['mitral','aortica','tricuspide','pulmonar']
  .forEach(v => CLAVES.push('tarj-' + t + '-' + v)));
CLAVES.push('tarj-diast');

const VIEWPORTS = [[1200, 700], [1440, 800], [1920, 1080], [768, 1024], [390, 844], [360, 740]];
/* Las celdas donde ademas se CAPTURA: las dos puntas, que es donde la maqueta puede romperse. */
const CAPTURAR_EN = ['1200x700', '360x740'];
/* Las cuatro escenas PROTESICAS que la orden pide ver: bio y mecanica en la tricuspide, bio y
   homoinjerto en la pulmonar. Cada una es una escena distinta, asi que se montan aparte. */
const PROTESIS = [
  { n: 'vt-bio',  k: 'tarj-esten-tricuspide', campos: { vt_morf: 'Pr\u00f3tesis biol\u00f3gica',
      et_gmedio: '12', et_thp: '250', et_e_vmax: '250' } },
  { n: 'vt-mec',  k: 'tarj-esten-tricuspide', campos: { vt_morf: 'Pr\u00f3tesis mec\u00e1nica',
      et_gmedio: '12', et_thp: '250', et_e_vmax: '250' } },
  { n: 'vp-bio',  k: 'tarj-esten-pulmonar',   campos: { vp_morf: 'Pr\u00f3tesis biol\u00f3gica',
      vp_tipo_prot: 'bio',  vp_vmax: '3.3', ep_gmedio: '22' } },
  { n: 'vp-homo', k: 'tarj-esten-pulmonar',   campos: { vp_morf: 'Pr\u00f3tesis biol\u00f3gica',
      vp_tipo_prot: 'homo', vp_vmax: '3.3', ep_gmedio: '22' } }
];

for (const [nombre, motor] of [['chrome', chromium], ['webkit', webkit]]) {
  const lanzar = (nombre === 'chrome') ? { channel: 'chrome' } : {};
  let nav = null;
  try { nav = await motor.launch(lanzar); }
  catch (e) { out.abortos.push(nombre + ': NO ARRANCA — ' + e.message); continue; }
  const ver = nav.version();
  out.grupos[nombre] = { version: ver, celdas: {}, ciclo: null };

  if (corre('maqueta') || corre('captura')) {
    for (const [w, h] of VIEWPORTS) {
      for (const claro of [false, true]) {
        const pag = await nav.newPage({ viewport: { width: w, height: h } });
        await pag.goto('http://127.0.0.1:' + PORT + '/index.html');
        await pag.waitForTimeout(2600);
        await pag.evaluate(SONDA);
        await pag.evaluate('window.__P.despejar()');
        const t = await pag.evaluate('window.__P.tema(' + claro + ')');
        if (t !== true) { out.abortos.push(nombre + ' ' + w + ' tema NO QUEDO'); await pag.close(); continue; }
        const esc = await pag.evaluate('window.__P.escena()');
        await pag.evaluate('window.__P.despejar()');
        const celda = { tema: claro ? 'claro' : 'noche', escena: esc, tarjetas: {} };
        for (const k of CLAVES) {
          celda.tarjetas[k] = await pag.evaluate('window.__P.abrirTarj(' + JSON.stringify(k) + ')');
          if (DEST && CAPTURAR_EN.indexOf(w + 'x' + h) > -1 && !celda.tarjetas[k].err) {
            try { await pag.locator('#vinfo-card').screenshot({
              path: DEST + '/' + nombre + '_' + w + 'x' + h + '_' + (claro ? 'claro' : 'noche') + '_' + k + '.png' }); }
            catch (e) { out.abortos.push('captura ' + nombre + ' ' + k + ': ' + e.message); }
          }
          await pag.evaluate('window.__P.cerrar()');
        }
        /* ══ LAS CUATRO ESCENAS PROTESICAS, cada una con su propia carga ══════════════════ */
        celda.protesis = {};
        for (const P of PROTESIS) {
          /* ⚠️ LA ESCENA PROTESICA ARRANCA LIMPIA Y NO SOBRE LA NATIVA, Y LO CAZO UNA CAPTURA: con
             `escena()` delante, la carga NATIVA deja `ep_grado` en «Moderada» y la cabecera de la
             tarjeta publicaba un grado nativo sobre una protesis. El arbol esta bien —medido con
             la sonda de CDP, con teclas reales y la cadena de pintores completa: `ep_grado` queda
             en `sin` y la pastilla en null—: lo que estaba mal era la escena de esta sonda. */
          await pag.evaluate('window.__P.limpiar()');
          for (const [cid, cv] of Object.entries(P.campos))
            await pag.evaluate('window.__P.set(' + JSON.stringify(cid) + ', ' + JSON.stringify(cv) + ')');
          await pag.evaluate(`['calcET','calcVP','calcIT_ESC','valvProtSync','etRefPintar','epRefPintar',
             'vtProtObstrPintar','vpProtObstrPintar']
            .forEach(function(f){ try { if (typeof window[f] === 'function') window[f]() } catch (e) {} }); 1`);
          await pag.evaluate('window.__P.abrir()');
          celda.protesis[P.n] = await pag.evaluate('window.__P.abrirTarj(' + JSON.stringify(P.k) + ')');
          if (DEST && CAPTURAR_EN.indexOf(w + 'x' + h) > -1 && !celda.protesis[P.n].err) {
            try { await pag.locator('#vinfo-card').screenshot({
              path: DEST + '/' + nombre + '_' + w + 'x' + h + '_' + (claro ? 'claro' : 'noche') + '_' + P.n + '.png' }); }
            catch (e) { out.abortos.push('captura prot ' + nombre + ' ' + P.n + ': ' + e.message); }
          }
          await pag.evaluate('window.__P.cerrar()');
        }
        out.grupos[nombre].celdas[w + 'x' + h + '|' + (claro ? 'claro' : 'noche')] = celda;
        await pag.close();
      }
    }
  }

  if (corre('ciclo')) {
    const pag = await nav.newPage({ viewport: { width: 1200, height: 900 } });
    await pag.goto('http://127.0.0.1:' + PORT + '/index.html');
    await pag.waitForTimeout(2600);
    await pag.evaluate(SONDA);
    await pag.evaluate('window.__P.despejar()');
    await pag.evaluate('window.__P.escena()');
    /* ⚠️ UNA VUELTA DE CALENTAMIENTO ANTES DE CONTAR: el primer pintado CREA el contenido de la
       tarjeta y despues lo reusa, asi que contar desde cero informa nodos de mas sobre un
       mecanismo que no acumula ninguno. Es la leccion del L y del PRO-C, pagada ya tres veces. */
    await pag.evaluate('window.__P.ciclo(1)');
    out.grupos[nombre].ciclo = await pag.evaluate('window.__P.ciclo(20)');
    await pag.close();
  }

  await nav.close();
}

console.log(JSON.stringify(out, null, 1));
try { srv.close() } catch (e) {}
process.exit(0);
