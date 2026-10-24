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

  escTapo() {
    var _den = window.__M.abrirSec('ete-seccion-derrame-tap', 'derrame-tap');
    ['pericardio','Derrame severo (>20mm)','dpt_col_ad','si','dpt_col_ad_dur','0.35',
     'dpt_col_vd','si','vci_diam','21','vci_col','<50','resp_var_mitral','30','resp_var_tric','45',
     'dpt_col_ai','si','dpt_col_vi','si']
      .forEach(function(x, i, a){ if (i % 2 === 0) window.__M.set(a[i], a[i+1]) });
    try { if (typeof dptSync === 'function') dptSync() } catch (e) {}
    var s = document.getElementById('dpt_col_ad');
    var fg = s && s.closest ? s.closest('.fg') : null;
    var l = fg ? fg.querySelector('label') : null;
    var caja = (document.getElementById('dpt-concl') || {}).parentNode;
    var t = caja ? (caja.textContent || '').replace(/\\s+/g, ' ') : 'SIN CAJA';
    var st = null;
    try { st = dptEstado() } catch (e) {}
    return { denominador: _den, rotulo: l ? (l.textContent || '').replace(/\\s+/g, ' ').trim() : 'SIN ROTULO',
             hayDur: !!document.getElementById('dpt_col_ad_dur'),
             lblDur: (document.getElementById('dpt-lbl-addur') || {}).textContent,
             concl: (document.getElementById('dpt-concl') || {}).textContent,
             pletora: st ? st.plet.presente : null,
             dur: st ? st.colAdDur : null,
             chipTiene21: t.indexOf('21 mm') > -1,
             chipAiVi: t.indexOf('aurícula izquierda y del ventrículo izquierdo') > -1,
             recorte: window.__M.recorte('#ete-seccion-derrame-tap .calc-row, #ete-seccion-derrame-tap label') } },

  escConstr() {
    var _den = window.__M.abrirSec('ete-seccion-constr-restr', 'constr-restr');
    ['e_sep','9','e_lat','7','resp_var_mitral','30','cvr_rebote','si','cvr_hepatico','esp',
     'cvr_pericardio_tc','engrosado','cvr_hep_coc','0.79']
      .forEach(function(x, i, a){ if (i % 2 === 0) window.__M.set(a[i], a[i+1]) });
    try { if (typeof cvrSync === 'function') cvrSync() } catch (e) {}
    var sec = document.getElementById('ete-seccion-constr-restr');
    var t = sec ? (sec.textContent || '').replace(/\\s+/g, ' ') : 'SIN SECCION';
    return { denominador: _den, avisoInvasivo: /correlación clínica e invasiva/i.test(t),
             hayCoc: !!document.getElementById('cvr_hep_coc'),
             lectura: (document.getElementById('cvr-coc-eval') || {}).textContent,
             lblCoc: (document.getElementById('cvr-lbl-coc') || {}).textContent,
             chip: t.indexOf('CRITERIO DE ECOSMART') > -1 && t.indexOf('Pieske 2019, folio 3303') > -1,
             concl: (document.getElementById('cvr-concl') || {}).textContent,
             recorte: window.__M.recorte('#ete-seccion-constr-restr .calc-row, #ete-seccion-constr-restr label') } },

  escVexus() {
    var _den = window.__M.abrirSec('vexus-seccion', 'vexus-seccion');
    var r = {};
    [[19,'0'],[20,'1'],[21,'2'],[19,'2'],[20,'2'],[21,'2']].forEach(function(p, i){
      window.__M.set('vexus_sh', i >= 3 ? '2' : '0');
      window.__M.set('vexus_pv', i >= 3 ? '2' : '0');
      window.__M.set('vexus_ir', '0');
      window.__M.set('vci_diam', String(p[0]));
      try { if (typeof calcVEXUS === 'function') calcVEXUS() } catch (e) {}
      var st = null; try { st = vexusEstado() } catch (e) {}
      r[(i >= 3 ? 'dosSeveros_' : 'sinSeveros_') + p[0]] = st ? st.score : null;
    });
    window.__M.set('vci_diam', '21'); window.__M.set('vexus_sh', '2'); window.__M.set('vexus_pv', '2');
    try { if (typeof calcVEXUS === 'function') calcVEXUS() } catch (e) {}
    var sec = document.getElementById('vexus-seccion');
    var t = sec ? (sec.textContent || '').replace(/\\s+/g, ' ') : 'SIN SECCION';
    var cond = ['Monitorizar','Considerar balance','Evaluar necesidad de descongesti',
                'Considerar descongesti','ultrafiltraci','Reevaluar con tratamiento']
      .filter(function(p){ return t.indexOf(p) > -1 });
    return { denominador: _den, grados: r, conductas: cond,
             interp: (document.getElementById('vexus-interp') || {}).textContent,
             aviso: (document.getElementById('vexus-vci-aviso') || {}).textContent,
             recorte: window.__M.recorte('#vexus-seccion .calc-row, #vexus-seccion label') } },

  escEvidJ() {
    try { indicAbrir() } catch (e) { return { err: 'EXC ' + e.message } }
    var cu = document.getElementById('indic-cuerpo');
    if (!cu) return { err: 'NO CUERPO' };
    var tits = [];
    Array.prototype.forEach.call(cu.children, function(d){
      if (d.tagName !== 'DETAILS') return;
      var su = d.querySelector('summary');
      if (su) tits.push((su.textContent || '').replace(/\\s+/g, ' ').trim());
    });
    var o = { titulos: tits,
      derrame: tits.some(function(x){ return x.indexOf('Derrame pericárdico y taponamiento') === 0 }),
      constr:  tits.some(function(x){ return x.indexOf('Constricción pericárdica') === 0 }),
      vexus:   tits.some(function(x){ return x.indexOf('Congestión venosa sistémica') === 0 }),
      recorte: window.__M.recorte('#indic-cuerpo .ind-fila, #indic-cuerpo summary') };
    try { indicCerrar() } catch (e) {}
    return o },

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
      c.tapo = await pag.evaluate(() => window.__M.escTapo());
      c.scrollTapo = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `j_${nombre}_${k}_tapo.png`) }) } catch (e) {} }
      c.constr = await pag.evaluate(() => window.__M.escConstr());
      c.scrollConstr = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `j_${nombre}_${k}_constr.png`) }) } catch (e) {} }
      c.vexus = await pag.evaluate(() => window.__M.escVexus());
      c.scrollVexus = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `j_${nombre}_${k}_vexus.png`) }) } catch (e) {} }
      c.evid = await pag.evaluate(() => window.__M.escEvidJ());
      c.scrollFin = await pag.evaluate(() => window.__M.scrollH());
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
