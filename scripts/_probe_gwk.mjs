/* Sonda de MAQUETA en DOS MOTORES para la tanda G, el posoperatorio (2026-10-24).
 *
 *   node scripts/_probe_gwk.mjs [--file /ruta/index.html] [--dest /dir/capturas]
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

  /* ══ G · LA PANTALLA DEL POSOPERATORIO con el esquema al centro ═══════════════════════ */
  abrirPOP() {
    try { showTab('hemodinamica') } catch (e) {}
    var s2 = document.getElementById('pop-seccion');
    if (!s2) return false;
    if (getComputedStyle(s2).display === 'none') {
      var h = s2.previousElementSibling ? s2.previousElementSibling.querySelector('.card-head') : null;
      if (h) h.click(); else s2.style.display = 'block';
    }
    try { if (typeof popAbrirEnEscritorio === 'function') popAbrirEnEscritorio() } catch (e) {}
    ['pop-ctx','pop-hemo','pop-soporte','pop-pocus','pop-concl'].forEach(function(id){
      var p = document.getElementById(id); if (p && p.style.display === 'none') p.style.display = 'block'; });
    return getComputedStyle(s2).display !== 'none' },

  escPOP() {
    var ok = window.__M.abrirPOP();
    if (!ok) return { err: 'NO ABRIO pop-seccion' };
    ['pop_cx_tipo','pop_cx_horas','pop_monitor','pop_sw_gc','pop_sw_fc','pop_sw_pam','pop_sw_paps',
     'pop_sw_papd','pop_sw_pcp','pop_sw_pad','pop_lactato','pop_pleura_der','pop_pulmon_lineasb',
     'pop_asist_tipo','pop_bcia_ratio','peso','talla','tapse','tep_vdvi'].forEach(function(id){});
    window.__M.set('peso','80'); window.__M.set('talla','175');
    window.__M.set('pop_cx_tipo','cabg'); window.__M.set('pop_cx_horas','6');
    window.__M.set('pop_monitor','swan');
    window.__M.set('pop_sw_gc','3.1'); window.__M.set('pop_sw_pam','58');
    window.__M.set('pop_sw_paps','52'); window.__M.set('pop_sw_papd','26');
    window.__M.set('pop_sw_pcp','10'); window.__M.set('pop_sw_pad','18');
    window.__M.set('pop_lactato','3.4');
    window.__M.set('pop_pleura_der','moderado'); window.__M.set('pop_pulmon_lineasb','difusas');
    window.__M.set('pop_asist_tipo','bcia'); window.__M.set('pop_bcia_ratio','1:1');
    window.__M.set('tapse','11'); window.__M.set('tep_vdvi','1.2');
    try { popSync() } catch (e) {}
    /* ⚠️ SE LLEVA LA SECCION A LA VISTA ANTES DE MEDIR Y DE CAPTURAR. escRefPOP fuerza a
       display:block a todos los ancestros de la ficha -incluida la pestana Referencias- y eso
       NO se deshace, asi que la celda siguiente capturaba la ficha en vez del posoperatorio.
       Visto en la captura, no deducido. */
    var _s = document.getElementById('pop-seccion');
    if (_s && _s.scrollIntoView) _s.scrollIntoView({ block: 'start' });
    var svg = document.getElementById('pop-esq-svg');
    var r = svg ? svg.getBoundingClientRect() : { width:0, height:0 };
    var txt = document.getElementById('pop-esq-txt');
    var acc = document.getElementById('pop_mon_acc');
    var drog = document.querySelector('.pop-drogas');
    var d = null; try { d = popEsquema() } catch (e) {}
    /* El GLIFO del chip y los textos del dibujo: lo que un motor puede rasterizar distinto. */
    var textosSVG = [];
    if (svg) svg.querySelectorAll('text').forEach(function(e){
      if (e.getAttribute('display') !== 'none' && (e.textContent||'').trim())
        textosSVG.push(e.textContent.trim()); });
    return { svgW: Math.round(r.width), svgH: Math.round(r.height),
             nodos: svg ? svg.querySelectorAll('*').length : -1,
             textosSVG: textosSVG.sort(),
             txtFilas: txt ? txt.children.length : -1,
             txtLen: txt ? (txt.textContent||'').replace(/\\s+/g,' ').trim().length : -1,
             chips: txt ? txt.querySelectorAll('.pop-esq-chip').length : -1,
             accVis: acc ? getComputedStyle(acc).display !== 'none' : null,
             accClientH: document.getElementById('pop_mon_body')
                         ? document.getElementById('pop_mon_body').clientHeight : -1,
             drogCols: drog ? getComputedStyle(drog).gridTemplateColumns : null,
             drogAlto: drog ? Math.round(drog.getBoundingClientRect().height) : -1,
             ic: d && d.ic != null ? Number(d.ic.toFixed(2)) : null,
             rama: d ? d.vdRama : null, cVI: d ? d.cVI : null,
             concl: (function(){ var e = document.getElementById('pop-concl-box');
               return e ? (e.textContent||'').replace(/\\s+/g,' ').trim().length : -1 })(),
             recorte: window.__M.recorte('#pop-seccion .calc-lbl, #pop-seccion label, #pop-esq-txt b') } },

  /* ══ G · LA FICHA DE REFERENCIAS DEL POSOPERATORIO ════════════════════════════════════ */
  escRefPOP() {
    try { showTab('referencias') } catch (e) {}
    var d = document.getElementById('ref-pop');
    if (!d) return { err: 'NO EXISTE ref-pop' };
    var n = d.parentNode;
    while (n && n.nodeType === 1 && n !== document.body) {
      if (getComputedStyle(n).display === 'none') n.style.display = 'block';
      n = n.parentNode; }
    if (getComputedStyle(d).display === 'none') { try { toggleRef('pop', d.previousElementSibling) } catch (e) {} }
    var r = d.getBoundingClientRect();
    if (r.height > 0 && d.scrollIntoView) d.scrollIntoView({ block: 'start' });
    var t = (d.textContent || '').replace(/\\s+/g, ' ');
    return { w: Math.round(r.width), h: Math.round(r.height), filas: d.querySelectorAll('tr').length,
             ivaf: t.indexOf('ivaf075') > -1, f701: t.indexOf('folio 701') > -1,
             f716: t.indexOf('folio 716') > -1, f59: t.indexOf('folio 59') > -1,
             chips: (t.match(/CRITERIO DE ECOSMART/g) || []).length,
             recorte: window.__M.recorte('#ref-pop td, #ref-pop th') } },

  /* ══ G · LA EVIDENCIA DEL POSOPERATORIO ═══════════════════════════════════════════════ */
  escEvidPOP() {
    window.__M.set('pop_cx_tipo','cabg');
    try { indicAbrir() } catch (e) { return { err: 'EXC ' + e.message } }
    var cu = document.getElementById('indic-cuerpo');
    if (!cu) return { err: 'NO CUERPO' };
    var tits = [], hit = null;
    Array.prototype.forEach.call(cu.children, function(d){
      if (d.tagName !== 'DETAILS') return;
      var su = d.querySelector('summary');
      if (su) { var tt = (su.textContent || '').replace(/\\s+/g, ' ').trim(); tits.push(tt);
        if (tt.indexOf('Posoperatorio') === 0) hit = d; }
      d.open = true;
      Array.prototype.forEach.call(d.querySelectorAll('details'), function(x){ x.open = true });
    });
    if (hit && hit.scrollIntoView) hit.scrollIntoView({ block: 'start' });
    var t = hit ? (hit.textContent || '').replace(/\\s+/g, ' ') : '';
    return { n: tits.length, hay: !!hit, len: t.length,
             botones: hit ? hit.querySelectorAll('[data-ind-clin]').length : -1,
             cirugia: t.indexOf('Según la cirugía') > -1,
             colch: t.indexOf('Clase IIa · Nivel A') > -1,
             recorte: window.__M.recorte('#indic-cuerpo .ind-fila, #indic-cuerpo summary') } }
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
      c.pop = await pag.evaluate(() => window.__M.escPOP());
      c.scrollPOP = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `g_${nombre}_${k}_pop.png`) }) } catch (e) {} }
      c.refPop = await pag.evaluate(() => window.__M.escRefPOP());
      c.scrollRef = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `g_${nombre}_${k}_ref.png`) }) } catch (e) {} }
      c.evid = await pag.evaluate(() => window.__M.escEvidPOP());
      c.scrollFin = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `g_${nombre}_${k}_evid.png`) }) } catch (e) {} }
      /* ⚠️ EL PANEL SE CIERRA AL TERMINAR LA CELDA. Sin esto, la celda del tema CLARO se captura
         con el overlay del panel que abrio la celda del tema oscuro encima de la pantalla, y las
         capturas del posoperatorio y de la ficha salen tapadas. Visto en la captura. */
      await pag.evaluate(() => { try { indicCerrar() } catch (e) {} });
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
