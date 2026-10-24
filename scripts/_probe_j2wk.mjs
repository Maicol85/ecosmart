/* Sonda de MAQUETA en DOS MOTORES para la tanda J2 (2026-10-24).
 *
 *   node scripts/_probe_j2wk.mjs [--file /ruta/index.html] [--dest /dir/capturas]
 *
 * Mide, a 1440 px y 390 px y en los DOS temas, lo que esta tanda movio:
 *   - CERO barra horizontal de la PAGINA.
 *   - CERO texto recortado en el aviso ambar del ETT avanzado y en la fila nueva del panel.
 *   - La geometria de TODA la app: cuantas pestanas tienen caja. Un <div> sin cerrar no lanza
 *     -el parser re-anida lo que viene despues- y ningun A/B de texto lo ve; lo unico que lo
 *     delata es que pestanas AJENAS informen 0x0, que es lo que la tanda I pago.
 *
 * ⚠️ Playwright se resuelve POR RUTA. Si no esta, la sonda lo DICE y sale con codigo 2.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1)); process.exit(2); }
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file'), DEST = arg('--dest');

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

const SONDA = `window.__M = {
  despejar() { var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++ } });
    return n },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },
  set(id, v) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value },

  /* La barra horizontal de la PAGINA. */
  scrollH() { var d = document.documentElement;
    return { hay: d.scrollWidth > d.clientWidth, sw: d.scrollWidth, cw: d.clientWidth } },

  /* GEOMETRIA DE TODA LA APP — el centinela del <div> sin cerrar. Un re-anidado del parser deja
     pestanas AJENAS en 0x0, y eso es lo unico que lo delata: no lanza y ningun A/B de texto lo ve.
     Esta tanda agrego cinco div de envoltura en la pantalla pulmonar, asi que el centinela importa. */
  pestanas() {
    var bs = Array.prototype.slice.call(document.querySelectorAll('.tab-btn[onclick]'));
    var o = { n: 0, conCaja: 0, cero: [] };
    bs.forEach(function(b){
      var m = /showTab\\('([^']+)'/.exec(b.getAttribute('onclick') || ''); if (!m) return;
      o.n++;
      try { showTab(m[1]) } catch (e) {}
      var p = document.getElementById('tab-' + m[1]);
      var r = p ? p.getBoundingClientRect() : { width:0, height:0 };
      if (r.width > 0 && r.height > 0) o.conCaja++; else o.cero.push(m[1]);
    });
    return o },

  /* TEXTO RECORTADO: scrollWidth por encima de clientWidth esconde texto a la derecha sin que la
     PAGINA desborde — el defecto del nowrap que esta casa ya pago dos veces. */
  recorte(sel) {
    var es = Array.prototype.slice.call(document.querySelectorAll(sel)), o = [];
    es.forEach(function(e){
      var r = e.getBoundingClientRect(); if (r.width <= 0) return;
      if (e.scrollWidth > e.clientWidth + 1) o.push({
        sel: (e.id ? '#' + e.id : e.className.toString().slice(0,40)),
        sw: e.scrollWidth, cw: e.clientWidth,
        txt: (e.textContent || '').replace(/\\s+/g,' ').trim().slice(0, 70) });
    });
    return o },

  /* ══ TANDA J · las tres pantallas, cargadas ═══════════════════════════════════════════ */
  /* ⚠️ LA PESTANA SE DEDUCE DEL PROPIO ELEMENTO, no se escribe a mano. La primera version de
     esta sonda abria 'pericardio' a mano y las tres secciones viven en OTRA pestana: los valores
     salian bien -se leen del DOM, que existe igual- pero la CAPTURA mostraba una pantalla vacia y
     el chequeo de recorte corria sobre nodos de ancho 0, que descarta, o sea sin denominador.
     Un verde sobre cero elementos. */
  abrirSec(secId, marcaBoton) {
    var sec = document.getElementById(secId);
    if (!sec) return 'NO EXISTE ' + secId;
    var ts = sec.closest ? sec.closest('.tab-section') : null;
    if (ts) { try { showTab(String(ts.id || '').replace(/^tab-/, '')) } catch (e) {} }
    if (getComputedStyle(sec).display === 'none') {
      var cab = document.querySelector('h2.card-head[onclick*="' + marcaBoton + '"]');
      if (cab) { try { cab.click() } catch (e) {} }
    }
    /* Y si algun ancestro sigue oculto, se abre: lo que no tiene geometria no se puede mirar. */
    var n = sec.parentNode;
    while (n && n.nodeType === 1 && n !== document.body) {
      if (getComputedStyle(n).display === 'none') n.style.display = '';
      n = n.parentNode; }
    var r = sec.getBoundingClientRect();
    if (r.height > 0 && sec.scrollIntoView) sec.scrollIntoView({ block: 'start' });
    return { visible: getComputedStyle(sec).display !== 'none', w: Math.round(r.width), h: Math.round(r.height) } },

  /* Abre un acordeon toggleCard por su id. La capsula de hemodinamica es uno: sin esto mide
     0 x 0 y la captura muestra una pantalla vacia. */
  abrirCard(id) {
    var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    var ts = e.closest ? e.closest('.tab-section') : null;
    if (ts) { try { showTab(String(ts.id || '').replace(/^tab-/, '')) } catch (x) {} }
    var n = e, tocados = [];
    while (n && n.nodeType === 1 && n !== document.body) {
      var nid = String(n.id || '');
      if (nid && getComputedStyle(n).display === 'none') {
        if (typeof toggleCard === 'function' && document.getElementById(nid + '-arrow')) {
          toggleCard(nid); tocados.push(nid);
        } else { n.style.display = 'block'; tocados.push('forzado:' + nid); }
      }
      n = n.parentNode; }
    var r = e.getBoundingClientRect();
    if (r.height > 0 && e.scrollIntoView) e.scrollIntoView({ block: 'start' });
    return { tocados: tocados, w: Math.round(r.width), h: Math.round(r.height) } },

  /* ══ J2 · HEMODINAMICA ════════════════════════════════════════════════════════════════ */
  escHemo() {
    var _den = window.__M.abrirCard('hemo-vi');
    ['peso','80','talla','180','diam_tsvi','22','itv_tsvi','18','hemo_fc','100',
     'hemo_pam','65','vci_diam','15','onda_e','95','e_sep','6','e_lat','8']
      .forEach(function(v, i, a){ if (i % 2 === 0) window.__M.set(a[i], a[i + 1]) });
    var s = document.getElementById('vci_col');
    if (s) { s.value = '>50'; s.dispatchEvent(new Event('change', { bubbles: true })) }
    try { if (typeof calcHemo === 'function') calcHemo() } catch (e) {}
    var t = function(id){ var e = document.getElementById(id);
      return e ? (e.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE' };
    var pe = document.getElementById('hemo-perfil');
    return { denominador: _den, ic: t('hemo-ic'), rvs: t('hemo-rvs'),
             perfil: t('hemo-perfil'), forrester: t('hemo-forrester'),
             badges: pe ? pe.querySelectorAll('.badge').length : -1,
             globos: Array.prototype.map.call(
               document.querySelectorAll('#hemo-vi [data-vinfo]'), function(b){
                 var r = b.getBoundingClientRect();
                 return b.getAttribute('data-vinfo') + '=' + Math.round(r.width) + 'x' + Math.round(r.height) }),
             recorte: window.__M.recorte('#hemo-vi .calc-row, #hemo-vi label') } },

  /* ══ J2 · AMILOIDOSIS ═════════════════════════════════════════════════════════════════ */
  escAmilo() {
    var _den = window.__M.abrirCard('amilo-ett-seccion');
    var P = { 'ett-rwt':'3', 'ett-ee':'0', 'ett-tapse':'0', 'ett-sgl':'0', 'ett-apice':'3' };
    Object.keys(P).forEach(function(id){ var e = document.getElementById(id); if (e) e.value = P[id] });
    ['ett-cual-1','ett-cual-2','ett-cual-3'].forEach(function(id){
      var e = document.getElementById(id); if (e) e.value = '0' });
    window.__M.set('ett-septo', '14'); window.__M.set('ett-pp', '14');
    try { if (typeof calcETT === 'function') calcETT() } catch (e) {}
    var t = function(id){ var e = document.getElementById(id);
      return e ? (e.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE' };
    return { denominador: _den, num: t('ett-score-num'), cat: t('ett-score-cat'),
             interp: t('ett-score-interp').slice(0, 160),
             globo: (function(){ var b = document.querySelector('[data-vinfo="amilo-score"]');
               if (!b) return 'NO EXISTE'; var r = b.getBoundingClientRect();
               return Math.round(r.width) + 'x' + Math.round(r.height) })(),
             recorte: window.__M.recorte('#amilo-ett-seccion .calc-row, #amilo-ett-seccion label') } },

  /* ══ J2 · CARDIO-ONCOLOGIA, la seccion de referencia con sus CUATRO subtabs abiertas ══ */
  escConco() {
    /* ADVERTENCIA: la escena CARGA el farmaco. Sin eso la seccion de Evidencia de
       cardio-oncologia no despierta -su compuerta son los datos de entrada del modulo- y el
       censo del panel informaba conco=false sobre una seccion sana: un hueco de la sonda que se
       lee como un defecto de la app. */
    window.__M.set('co_farmaco', 'radioterapia');
    window.__M.set('co_fevi_basal', '62');
    window.__M.set('co_fevi_actual', '58');
    var _den = window.__M.abrirCard('co-referencia-seccion');
    var sec = document.getElementById('co-referencia-seccion');
    var ocultos = 0;
    if (sec) Array.prototype.forEach.call(sec.querySelectorAll('*'), function(x){
      if (getComputedStyle(x).display === 'none') { x.style.display = 'block'; ocultos++ } });
    var t = sec ? (sec.textContent || '').replace(/\\s+/g, ' ') : 'SIN SECCION';
    return { denominador: _den, subpaneles: ocultos, filas: sec ? sec.querySelectorAll('tr').length : -1,
             plazo24: t.indexOf('2-4 sem') > -1, rtDesde5: (t.match(/desde los 5 anos/g) || []).length,
             rtClase: t.indexOf('Clase IIa, Nivel C') > -1,
             recorte: window.__M.recorte('#co-referencia-seccion td, #co-referencia-seccion th') } },

  /* ══ J2 · LA FICHA DE ECO PULMONAR ════════════════════════════════════════════════════ */
  escPulmon() {
    try { showTab('referencias') } catch (e) {}
    var d = document.getElementById('ref-pulmon');
    if (!d) return { err: 'NO EXISTE ref-pulmon' };
    var n = d.parentNode;
    while (n && n.nodeType === 1 && n !== document.body) {
      if (getComputedStyle(n).display === 'none') n.style.display = 'block';
      n = n.parentNode; }
    if (getComputedStyle(d).display === 'none') { try { toggleRef('pulmon', d.previousElementSibling) } catch (e) {} }
    var r = d.getBoundingClientRect();
    if (r.height > 0 && d.scrollIntoView) d.scrollIntoView({ block: 'start' });
    var t = (d.textContent || '').replace(/\\s+/g, ' ');
    return { w: Math.round(r.width), h: Math.round(r.height), len: t.length,
             fig3: t.indexOf('Figura 3, panel C') > -1, fig4: t.indexOf('Figura 4') > -1,
             d221: t.indexOf('D2_2.1') > -1, d611: t.indexOf('D6_11') > -1,
             chip: t.indexOf('CRITERIO DE ECOSMART') > -1,
             recorte: window.__M.recorte('#ref-pulmon td, #ref-pulmon th') } },

  /* ══ J2 · LAS TRES EVIDENCIAS NUEVAS ══════════════════════════════════════════════════ */
  escEvidJ2() {
    try { indicAbrir() } catch (e) { return { err: 'EXC ' + e.message } }
    var cu = document.getElementById('indic-cuerpo');
    if (!cu) return { err: 'NO CUERPO' };
    var tits = [];
    Array.prototype.forEach.call(cu.children, function(d){
      if (d.tagName !== 'DETAILS') return;
      var su = d.querySelector('summary');
      if (su) tits.push((su.textContent || '').replace(/\\s+/g, ' ').trim());
      d.open = true;
      Array.prototype.forEach.call(d.querySelectorAll('details'), function(x){ x.open = true });
    });
    var o = { n: tits.length, titulos: tits,
      hemo:  tits.some(function(x){ return x.indexOf('Perfil hemodinámico') === 0 }),
      conco: tits.some(function(x){ return x.indexOf('Cardiotoxicidad por tratamiento') === 0 }),
      amil:  tits.some(function(x){ return x.indexOf('Amiloidosis cardíaca') === 0 }),
      recorte: window.__M.recorte('#indic-cuerpo .ind-fila, #indic-cuerpo summary') };
    return o }
};
1`;

async function correrMotor(nombre, lanzar) {
  const nav = await lanzar();
  const g = { celdas: {}, errs: [] };
  for (const W of [1440, 390]) {
    const ctx = await nav.newContext({ viewport: { width: W, height: 900 } });
    const pag = await ctx.newPage();
    pag.on('pageerror', (e) => g.errs.push(nombre + '@' + W + ': ' + String(e.message).slice(0, 160)));
    pag.on('console', (m) => { if (m.type() === 'error') g.errs.push(nombre + '@' + W + ' console: ' + m.text().slice(0, 160)) });
    await pag.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
    await pag.evaluate(() => { try { sessionStorage.setItem('ett_auth', '1') } catch (e) {} });
    await pag.reload({ waitUntil: 'load' });
    await pag.waitForTimeout(2500);
    await pag.evaluate(SONDA);
    for (const claro of [false, true]) {
      const k = W + (claro ? '_claro' : '_oscuro');
      const c = {};
      c.despejo = await pag.evaluate(() => window.__M.despejar());
      c.tema = await pag.evaluate(cl => window.__M.tema(cl), claro);
      c.pestanas = await pag.evaluate(() => window.__M.pestanas());
      c.hemo = await pag.evaluate(() => window.__M.escHemo());
      c.scrollHemo = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `j2_${nombre}_${k}_hemo.png`) }) } catch (e) {} }
      c.amilo = await pag.evaluate(() => window.__M.escAmilo());
      c.scrollAmilo = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `j2_${nombre}_${k}_amilo.png`) }) } catch (e) {} }
      c.conco = await pag.evaluate(() => window.__M.escConco());
      c.scrollConco = await pag.evaluate(() => window.__M.scrollH());
      c.pulmon = await pag.evaluate(() => window.__M.escPulmon());
      c.scrollPulmon = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `j2_${nombre}_${k}_pulmon.png`) }) } catch (e) {} }
      c.evid = await pag.evaluate(() => window.__M.escEvidJ2());
      c.scrollFin = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `j2_${nombre}_${k}_evid.png`) }) } catch (e) {} }
      g.celdas[k] = c;
    }
    await ctx.close();
  }
  await nav.close();
  return g;
}

try { out.grupos.chrome = await correrMotor('chrome', () => chromium.launch({ channel: 'chrome' })); }
catch (e) { out.abortos.push('chrome: ' + e.message); }
try { out.grupos.webkit = await correrMotor('webkit', () => webkit.launch()); }
catch (e) { out.abortos.push('webkit: ' + e.message); }

console.log(JSON.stringify(out, null, 1));
try { srv.close() } catch (e) {}
process.exit(0);
