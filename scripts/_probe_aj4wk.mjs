/* Sonda de MAQUETA en DOS MOTORES para la tanda AJ4 (2026-10-23).
 *
 *   node scripts/_probe_aj4wk.mjs [--file /ruta/index.html] [--dest /dir/capturas]
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

  /* GEOMETRIA DE TODA LA APP — el centinela del <div> sin cerrar. Abre cada pestana por su
     gesto y cuenta cuantas tienen caja. Un re-anidado del parser deja pestanas AJENAS en 0x0. */
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

  /* TEXTO RECORTADO: un nodo cuyo scrollWidth supera su clientWidth esconde texto a la derecha
     sin que la PAGINA desborde — el defecto del nowrap que esta casa ya pago dos veces. */
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

  /* ══ LA ESCENA DE AJ4: una MUJER con la raiz en 38 mm, que es el paciente que el AJ4-1
     cambia, mas la coartacion y la bicuspide cargadas para que los DOS carteles del cruce
     esten dibujados a la vez. Se trae al frente la pestana donde vive cada cosa: sin eso los
     nodos miden 0x0 y «cero recorte» sale sobre nodos que no estan dibujados. */
  escAo() {
    try { showTab('ai-vi') } catch (e) {}
    ['sexo','F','peso','54','talla','150','edad','60','ao_sin','38','ao_tub','36']
      .forEach(function(x, i, a){ if (i % 2 === 0) window.__M.set(a[i], a[i+1]) });
    try { if (typeof calcAorta === 'function') calcAorta() } catch (e) {}
    try { if (typeof aiviSexoSync === 'function') aiviSexoSync() } catch (e) {}
    var cap = document.getElementById('ao-interp');
    /* Se descarta la PRIMERA medicion: el primer getBoundingClientRect() despues de un
       repintado devuelve 0x0 en los dos motores y se lee igual que «no se dibuja». */
    if (cap) cap.getBoundingClientRect();
    var rc = cap ? cap.getBoundingClientRect() : { width:0, height:0 };
    var av = document.getElementById('aivi-sexo-aviso');
    var ra = av ? av.getBoundingClientRect() : { width:0, height:0 };
    return { capsula: { w: Math.round(rc.width), h: Math.round(rc.height),
                        txt: cap ? (cap.textContent||'').replace(/\s+/g,' ').trim() : 'SIN NODO' },
             avisoSexo: { w: Math.round(ra.width), h: Math.round(ra.height),
                          txt: av ? (av.textContent||'').replace(/\s+/g,' ').trim() : 'SIN NODO' },
             recorte: window.__M.recorte('#ao-interp, #ao-st-interp, #ao-tub-interp, #aivi-sexo-aviso') } },

  /* ══ LOS DOS CARTELES DEL CRUCE, dibujados a la vez ═══════════════════════════════════ */
  escCruce() {
    try { showTab('congenitas') } catch (e) {}
    window.__M.set('va_morf', 'Bicúspide');
    ['coa_loc','preductal','coa_istmo','8','coa_situacion','post_cirugia']
      .forEach(function(x, i, a){ if (i % 2 === 0) window.__M.set(a[i], a[i+1]) });
    try { if (typeof vabCoaCruceSync === 'function') vabCoaCruceSync() } catch (e) {}
    function caja(id) { var e = document.getElementById(id);
      if (!e) return { err: 'NO EXISTE ' + id };
      e.getBoundingClientRect();
      var r = e.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height),
               vis: getComputedStyle(e).display !== 'none',
               txt: (e.textContent||'').replace(/\s+/g,' ').trim() } }
    return { vab: caja('vab-coa-nota'), coa: caja('coa-vab-nota'),
             recorte: window.__M.recorte('#vab-coa-nota, #coa-vab-nota') } },

  /* ══ EL GLOBO DE LA AORTA, dibujado de verdad ════════════════════════════════════════ */
  escGlobo() {
    try { showTab('ai-vi') } catch (e) {}
    /* ⚠️ EL BOTON ES UN TOGGLE Y EL CONTEXTO SE REUSA ENTRE LOS DOS TEMAS: con un click()
       incondicional, la segunda celda CIERRA el globo que la primera abrio y la sonda informa
       0x0 — una medicion falsa que se lee como «el globo no se dibuja». Se mira el estado
       antes de tocar. */
    var b = document.querySelector('[data-vinfo="ao-card"], .vinfo-btn[aria-label*="Valsalva"]');
    var h0 = document.getElementById('vinfo-cuerpo') || document.getElementById('vinfo-card');
    var abierto = !!(h0 && getComputedStyle(h0).display !== 'none' && h0.getBoundingClientRect().height > 0);
    if (b && !abierto) { try { b.click() } catch (e) {} }
    var host = document.getElementById('vinfo-cuerpo') || document.getElementById('vinfo-card');
    if (!host) {
      /* Si no se pudo abrir por el gesto, se arma el fragmento: lo que se mide es el TEXTO y
         el recorte, no el camino de apertura. Se DECLARA cual de los dos se uso. */
      var fr = (typeof evTarjetaAo === 'function') ? evTarjetaAo() : null;
      if (!fr) return { err: 'SIN TARJETA' };
      var d = document.createElement('div'); d.style.cssText = 'position:absolute;left:-9999px;width:340px';
      d.appendChild(fr); document.body.appendChild(d);
      var t = (d.textContent||'').replace(/\s+/g,' ').trim();
      d.remove();
      return { via: 'fragmento', txt: t, nLineas: t.length };
    }
    host.getBoundingClientRect();
    var r = host.getBoundingClientRect();
    return { via: 'gesto', w: Math.round(r.width), h: Math.round(r.height),
             txt: (host.textContent||'').replace(/\s+/g,' ').trim().slice(0, 500),
             recorte: window.__M.recorte('#vinfo-cuerpo .ev-cat, #vinfo-cuerpo .ev-rot, #vinfo-cuerpo .ev-fte') } },

  /* ══ LA SECCION DE LA VAB DEL PANEL, con su bloque VISIBLE ═══════════════════════════ */
  evid() {
    window.__M.set('va_morf', 'Bicúspide');
    ['vab_tipo','fused_rl','vab_fenotipo','raiz','ao_sin','47','ao_tub','42']
      .forEach(function(x, i, a){ if (i % 2 === 0) window.__M.set(a[i], a[i+1]) });
    try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) {}
    var c = document.getElementById('indic-cuerpo');
    if (!c) return { err: 'SIN PANEL' };
    c.getBoundingClientRect();
    var r = c.getBoundingClientRect();
    var rec = window.__M.recorte('#indic-cuerpo td, #indic-cuerpo th');
    var recDiv = window.__M.recorte('#indic-cuerpo div');
    var o = { w: Math.round(r.width), nCeldas: c.querySelectorAll('td, th').length,
              recorte: rec, recorteDiv: recDiv, desbordaPanel: c.scrollWidth > c.clientWidth + 1,
              nBloques: c.querySelectorAll('[data-ind-bloque]').length };
    try { if (typeof indicCerrar === 'function') indicCerrar() } catch (e) {}
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
      c.scrollPest = await pag.evaluate(() => window.__M.scrollH());
      c.ao = await pag.evaluate(() => window.__M.escAo());
      c.scrollAo = await pag.evaluate(() => window.__M.scrollH());
      c.cruce = await pag.evaluate(() => window.__M.escCruce());
      c.scrollCruce = await pag.evaluate(() => window.__M.scrollH());
      c.globo = await pag.evaluate(() => window.__M.escGlobo());
      c.evid = await pag.evaluate(() => window.__M.evid());
      c.scrollFin = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) {
        try { await pag.screenshot({ path: join(DEST, `aj4_${nombre}_${k}.png`) }) } catch (e) { c.capturaErr = String(e.message).slice(0,160) }
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
