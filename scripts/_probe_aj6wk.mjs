/* Sonda de MAQUETA en DOS MOTORES para la tanda AJ6 (2026-10-24).
 *
 *   node scripts/_probe_aj6wk.mjs [--file /ruta/index.html] [--dest /dir/capturas]
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

  /* ══ AJ6-3 · LA PANTALLA PULMONAR EN CUATRO COLUMNAS, CARGADA ════════════════════════ */
  escPulm() {
    try { showTab('pericardio') } catch (e) {}
    var cab = document.querySelector('h2.card-head[onclick*="pua-seccion"]');
    var sec = document.getElementById('pua-seccion');
    if (sec && getComputedStyle(sec).display === 'none' && cab) { try { cab.click() } catch (e) {} }
    ['pua_desliz','reducido','pua_desliz_lado','derecho','pua_lineasa','ausentes','pua_punto','no',
     'pua_lineasb','presentes','pua_lineasb_cant','multiples','pua_derrame','si',
     'pul_derrame_tam','moderado','pua_derrame_tipo','libre','pua_balik','25',
     'pua_derrame_lado','bilateral','pua_consol','si','pua_consol_bronco','con',
     'pul_consol_nota','Base derecha']
      .forEach(function(x, i, a){ if (i % 2 === 0) window.__M.set(a[i], a[i+1]) });
    try { if (typeof pulAvUI === 'function') pulAvUI() } catch (e) {}
    var w = document.querySelector('#pua-seccion .pul-cols');
    if (!w) return { err: 'NO EXISTE .pul-cols' };
    w.getBoundingClientRect();
    var cs = getComputedStyle(w);
    var cols = [];
    Array.prototype.forEach.call(w.children, function(c){
      var r = c.getBoundingClientRect();
      cols.push({ k: c.getAttribute('data-pul-col'), x: Math.round(r.left), y: Math.round(r.top),
                  w: Math.round(r.width), h: Math.round(r.height) }); });
    var xs = {}; cols.forEach(function(c){ xs[c.x] = 1 });
    var pat = document.getElementById('pua-patron');
    var caja = pat ? pat.closest('.calc-box') : null;
    var btn = document.querySelector('#pua-seccion [data-am-k="pulm"]');
    var rc = caja ? caja.getBoundingClientRect() : { width:0, top:0 };
    var rb = btn ? btn.getBoundingClientRect() : { width:0, top:0, height:0 };
    return { tracks: cs.gridTemplateColumns, nTracks: String(cs.gridTemplateColumns||'').trim().split(/\\s+/).filter(Boolean).length,
             cols: cols, xDistintas: Object.keys(xs).length,
             caja: { w: Math.round(rc.width), y: Math.round(rc.top) },
             btn: { w: Math.round(rb.width), h: Math.round(rb.height), y: Math.round(rb.top) },
             patron: pat ? (pat.textContent||'').trim() : 'SIN NODO',
             recorte: window.__M.recorte('#pua-seccion select, #pua-seccion input, #pua-seccion label, #pua-seccion .pul-col-h') } },

  /* ══ AJ6-2 · LA SECCION DE FALLOT DEL PANEL, CARGADA Y VISIBLE ══════════════════════ */
  escEvid() {
    try { showTab('congenitas2') } catch (e) {}
    ['ip_grado','Severa','tsvd_diametro','35','ep_vmax','3','tdf_func_vd','leve',
     'tdf_vtdvdi','70','tdf_vtsvdi','24','tdf_vol_fuente','rmc']
      .forEach(function(x, i, a){ if (i % 2 === 0) window.__M.set(a[i], a[i+1]) });
    try { if (typeof tdfSync === 'function') tdfSync() } catch (e) {}
    try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) {}
    var c = document.getElementById('indic-cuerpo');
    if (!c) return { err: 'SIN PANEL' };
    var mia = Array.prototype.filter.call(c.querySelectorAll('details'), function(d){
      var s = d.querySelector('summary'); return s && /Fallot/.test(s.textContent || '') })[0];
    if (!mia) { try { indicCerrar() } catch (e) {} return { err: 'SIN SECCION DE FALLOT' } }
    mia.open = true;
    mia.getBoundingClientRect();
    var r = mia.getBoundingClientRect();
    var grid = mia.querySelector('[data-ind-grid]');
    var rg = grid ? grid.getBoundingClientRect() : { width:0, height:0 };
    var o = { alto: Math.round(r.height), ancho: Math.round(r.width),
              filas: mia.querySelectorAll('tr').length,
              infos: mia.querySelectorAll('[data-ind-info]').length,
              gridDisplay: grid ? getComputedStyle(grid).display : 'NO HAY',
              gridCols: grid ? getComputedStyle(grid).gridTemplateColumns : null,
              gridAlto: Math.round(rg.height),
              desbordaSeccion: mia.scrollWidth > mia.clientWidth + 1,
              recorte: window.__M.recorte('#indic-cuerpo td, #indic-cuerpo th, #indic-cuerpo summary'),
              nBloques: mia.querySelectorAll('[data-ind-bloque]').length };
    try { if (typeof indicCerrar === 'function') indicCerrar() } catch (e) {}
    return o },

  /* ══ AJ6-4 · EL BOTON DE REFERENCIAS Y EL BUSCADOR ═════════════════════════════════ */
  escRefs() {
    var o = {};
    [['basico'], ['avanzado']].forEach(function(p){
      try { if (typeof cfgSetMode === 'function') cfgSetMode(p[0]) } catch (e) {}
      try { showTab('refs'); if (typeof refSubInit === 'function') refSubInit() } catch (e) {}
      var b = document.querySelector('.tabs-tools .tab-btn');
      var cb = document.getElementById('ref-subtab-calc');
      var rb = b ? b.getBoundingClientRect() : { width:0, height:0 };
      var rc = cb ? cb.getBoundingClientRect() : { width:0, height:0 };
      o[p[0]] = { ref: b ? getComputedStyle(b).display : 'NO EXISTE',
                  refW: Math.round(rb.width), refH: Math.round(rb.height),
                  calc: cb ? getComputedStyle(cb).display : 'NO EXISTE',
                  calcW: Math.round(rc.width), calcH: Math.round(rc.height) };
    });
    try { if (typeof cfgSetMode === 'function') cfgSetMode('avanzado') } catch (e) {}
    /* El buscador: con texto, sin fichas y sin boton marcado; saliendo del campo, repuestas.
       El blur se prueba de verdad -- es donde Chrome y WebKit difieren con el foco de un boton. */
    try { showTab('refs'); if (typeof refSubInit === 'function') refSubInit() } catch (e) {}
    var inp = document.getElementById('ref-busca');
    if (!inp) return Object.assign(o, { busc: 'NO EXISTE ref-busca' });
    var fichas = function(){ return Array.prototype.filter.call(
      document.querySelectorAll('#tab-refs .ref-subpanel'), function(p){
        return getComputedStyle(p).display !== 'none' }).length };
    var marcados = function(){ return document.querySelectorAll('#tab-refs .ref-subtab.active').length };
    inp.value = 'tapse'; inp.dispatchEvent(new Event('input', { bubbles: true }));
    o.conTexto = { fichas: fichas(), marcados: marcados(),
                   hits: document.querySelectorAll('#ref-busca-res .ref-busc-hit').length,
                   recorte: window.__M.recorte('#ref-busca-res .ref-busc-hit, #tab-refs .ref-subbar') };
    inp.focus(); inp.blur();
    return o },
  /* Se lee DESPUES del retardo del blur: la sonda no puede dormir, lo hace el motor. */
  escRefsSalida() {
    var inp = document.getElementById('ref-busca');
    return { texto: inp ? inp.value : 'NO EXISTE',
             fichas: Array.prototype.filter.call(document.querySelectorAll('#tab-refs .ref-subpanel'),
               function(p){ return getComputedStyle(p).display !== 'none' }).length,
             marcados: document.querySelectorAll('#tab-refs .ref-subtab.active').length,
             hits: document.querySelectorAll('#ref-busca-res .ref-busc-hit').length } }
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
      c.scrollPest = await pag.evaluate(() => window.__M.scrollH());
      c.pulm = await pag.evaluate(() => window.__M.escPulm());
      c.scrollPulm = await pag.evaluate(() => window.__M.scrollH());
      c.evid = await pag.evaluate(() => window.__M.escEvid());
      c.scrollEvid = await pag.evaluate(() => window.__M.scrollH());
      c.refs = await pag.evaluate(() => window.__M.escRefs());
      await pag.waitForTimeout(400);
      c.refsSalida = await pag.evaluate(() => window.__M.escRefsSalida());
      c.scrollFin = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) {
        try { await pag.screenshot({ path: join(DEST, `aj6_${nombre}_${k}.png`) }) } catch (e) { c.capturaErr = String(e.message).slice(0,160) }
      }
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
