/* Sonda de MAQUETA en DOS MOTORES para la tanda AJ3 (2026-10-23).
 *
 *   node scripts/_probe_aj3wk.mjs [--file /ruta/index.html] [--dest /dir/capturas]
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

  /* ══ LA ESCENA DE AJ3: un bloque integrado, editado a mano y DESFASADO ══════════════════
     Es la unica que pinta el aviso ambar. Se arma por los gestos reales -boton de integrar,
     tecleo en el textarea y cambio de un dato- y despues se trae al frente la pestana
     «Informe», que es donde vive la tarjeta: sin eso los diecisiete bloques miden 0x0 y «cero
     recorte» sale sobre nodos que no estan dibujados. */
  escEtt() {
    try { showTab('hemodinamica') } catch (e) {}
    ['edad','70','peso','70','talla','170','fevi','60','onda_e','90','e_sep','6','e_lat','8',
     'ai_vol','60','ddfvi','45','siv','10','ppvi','10','vmax_it','2.5','hf_ntprobnp','150']
      .forEach(function(x, i, a){ if (i % 2 === 0) window.__M.set(a[i], a[i+1]) });
    var b1 = document.querySelector('[data-am-k="htp"]'); if (b1) b1.click();
    var b2 = document.querySelector('[data-am-k="hfpeff"]'); if (b2) b2.click();
    var ta = document.getElementById('am-txt-htp');
    if (ta) { ta.value = 'EDITADO A MANO POR EL MEDICO';
              ta.dispatchEvent(new Event('input', { bubbles: true })) }
    window.__M.set('vmax_it', '3.6');
    try { if (typeof amiloRefrescarTodos === 'function') amiloRefrescarTodos() } catch (e) {}
    try { showTab('informe') } catch (e) {}
    var card = document.getElementById('amilo-card');
    var rc = card ? card.getBoundingClientRect() : { width:0, height:0 };
    var w = document.getElementById('am-wrap-htp');
    var rw = w ? w.getBoundingClientRect() : { width:0, height:0 };
    var av = document.getElementById('am-stale-htp');
    var ra = av ? av.getBoundingClientRect() : { width:0, height:0 };
    return { card: { w: Math.round(rc.width), h: Math.round(rc.height) },
             wrap: { w: Math.round(rw.width), h: Math.round(rw.height) },
             aviso: { w: Math.round(ra.width), h: Math.round(ra.height),
                      visible: !!(w && w.classList.contains('desfasado')),
                      txt: av ? (av.textContent || '').trim() : 'SIN NODO' },
             recorte: window.__M.recorte('#amilo-card .am-stale, #amilo-card .am-head, #amilo-card .am-tit, #amilo-card .am-kv .k, #amilo-card .am-kv .v') } },

  /* ══ EL PANEL DE EVIDENCIA CON LA FILA NUEVA ════════════════════════════════════════════
     Las respuestas se contestan DENTRO de la misma apertura: indicAbrir() llama a
     _indClinLimpiar() siempre, asi que contestar por dos puertas distintas vacia la primera. */
  evid() {
    try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) {}
    var c = document.getElementById('indic-cuerpo');
    [['hfpeff.paso3','hecha'], ['hfpeff.p3res','noconcl']].forEach(function(par){
      var q = document.getElementById('indic-cuerpo');
      if (!q) return;
      var b = q.querySelector('[data-ind-clin="' + par[0] + '"][data-ind-val="' + par[1] + '"]');
      if (b) b.click();
    });
    c = document.getElementById('indic-cuerpo');
    var r = c ? c.getBoundingClientRect() : { width:0 };
    /* El denominador son las celdas <td>: este panel se pinta con <table> y sus filas no
       llevan clase. Un selector por data-ind-sec devuelve 0 y «cero recorte» no mide nada. */
    var rec = c ? window.__M.recorte('#indic-cuerpo td, #indic-cuerpo th') : [];
    var bs = c ? c.querySelectorAll('[data-ind-clin="hfpeff.p3res"]') : [];
    /* ⚠️ SE DESCARTA LA PRIMERA MEDICION Y SE VUELVE A MEDIR: el primer getBoundingClientRect()
       despues de un repintado del panel devuelve 0x0 en los dos motores -el nodo todavia no
       paso por el reflow- y eso se lee igual que «el boton no se dibuja». */
    Array.prototype.forEach.call(bs, function(b){ b.getBoundingClientRect() });
    var bot = Array.prototype.map.call(bs, function(b){ var q = b.getBoundingClientRect();
      return (b.textContent||'').trim() + ' ' + Math.round(q.width) + 'x' + Math.round(q.height) });
    var fila = bs.length ? bs[0].closest('tr') : null;
    var rf = fila ? fila.getBoundingClientRect() : { width:0, height:0 };
    var det = fila ? fila.querySelectorAll('details[data-ind-info]') : [];
    var o = { w: Math.round(r.width), nSec: c ? c.querySelectorAll('td, th').length : 0,
              recorte: rec, nBotones: bs.length, botones: bot,
              fila: { w: Math.round(rf.width), h: Math.round(rf.height),
                      lbl: fila && fila.children[0] ? (fila.children[0].textContent||'').trim() : null },
              nDetalles: det.length,
              desbordaPanel: c ? (c.scrollWidth > c.clientWidth + 1) : null };
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
      c.ett = await pag.evaluate(() => window.__M.escEtt());
      c.scrollEtt = await pag.evaluate(() => window.__M.scrollH());
      c.evid = await pag.evaluate(() => window.__M.evid());
      c.scrollFin = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) {
        try { await pag.screenshot({ path: join(DEST, `aj3_${nombre}_${k}.png`) }) } catch (e) {}
        /* ⚠️ LA CAPTURA DE VIEWPORT NO ALCANZA: la tarjeta del ETT avanzado vive muy abajo de
           la pestana «Informe», asi que el PNG de pantalla muestra el encabezado y no lo que
           esta tanda dibuja. Se captura EL NODO. Es la leccion de AJ2: una captura ve lo que
           ninguna cifra ve, pero solo si apunta a donde esta la cosa. */
        try { const el = await pag.$('#amilo-card');
              if (el) await el.screenshot({ path: join(DEST, `aj3_card_${nombre}_${k}.png`) }) } catch (e) {}
        try { await pag.evaluate(() => { window.__M.evid2 = 1;
                if (typeof indicAbrir === 'function') indicAbrir();
                [['hfpeff.paso3','hecha'], ['hfpeff.p3res','noconcl']].forEach(function(par){
                  var q = document.getElementById('indic-cuerpo'); if (!q) return;
                  var b = q.querySelector('[data-ind-clin="' + par[0] + '"][data-ind-val="' + par[1] + '"]');
                  if (b) b.click() }); });
              const ep = await pag.$('#indic-cuerpo');
              if (ep) await ep.screenshot({ path: join(DEST, `aj3_evid_${nombre}_${k}.png`) });
              /* Y LA FILA NUEVA, traida a la vista: la captura del panel entero solo muestra
                 su primera pantalla, y la seccion del HFA-PEFF esta mas abajo. */
              await pag.evaluate(() => { var b = document.querySelector('#indic-cuerpo [data-ind-clin="hfpeff.p3res"]');
                if (b) { var tr = b.closest('tr'); if (tr) tr.scrollIntoView({ block: 'center' });
                         var d = tr ? tr.querySelector('details[data-ind-info]') : null;
                         if (d) d.open = true } });
              await pag.waitForTimeout(150);
              /* Se recorta por COORDENADAS y no por ElementHandle: un <tr> no siempre da un
                 handle capturable y el fallo era MUDO -el try se lo comia y no habia PNG-. */
              const caja = await pag.evaluate(() => {
                var b = document.querySelector('#indic-cuerpo [data-ind-clin="hfpeff.p3res"]');
                if (!b) return null;
                var tr = b.closest('tr'); if (!tr) return null;
                var prev = tr.previousElementSibling, next = tr.nextElementSibling;
                var a = (prev || tr).getBoundingClientRect(), z = (next || tr).getBoundingClientRect();
                return { x: Math.max(0, Math.floor(a.left) - 6), y: Math.max(0, Math.floor(a.top) - 6),
                         width: Math.ceil(a.width) + 12, height: Math.ceil(z.bottom - a.top) + 12 } });
              /* ⚠️ `clip` ES EN COORDENADAS DE PAGINA Y EL PANEL TIENE SU PROPIO SCROLL: el
                 rect del <tr> salia en y=1237 sobre una ventana de 900 y Playwright respondia
                 «Clipped area is either empty or outside the resulting image». Se desplaza el
                 CONTENEDOR y se captura la ventana entera, que es lo que el medico ve. */
              c.cajaFila = await pag.evaluate(() => {
                var b = document.querySelector('#indic-cuerpo [data-ind-clin="hfpeff.p3res"]');
                if (!b) return null;
                var tr = b.closest('tr'), c2 = document.getElementById('indic-cuerpo');
                if (!tr || !c2) return null;
                /* El contenedor que scrollea NO es `#indic-cuerpo` -poner su scrollTop no movia
                   nada y el rect seguia en y=1310-. Se busca el ANCESTRO que scrollea. */
                var sc = tr.parentElement;
                while (sc && !(sc.scrollHeight > sc.clientHeight + 4 &&
                       ['auto','scroll','overlay'].indexOf(getComputedStyle(sc).overflowY) >= 0)) sc = sc.parentElement;
                if (!sc) sc = c2;
                var antes = sc.scrollTop;
                sc.scrollTop = antes + (tr.getBoundingClientRect().top - sc.getBoundingClientRect().top) - 90;
                var r = tr.getBoundingClientRect();
                return { y: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) } });
              await pag.waitForTimeout(120);
              /* ⚠️ SOLO SE CAPTURA SI LA FILA QUEDO DENTRO DE LA VENTANA. El panel es mas alto
                 que la ventana a los dos anchos y la fila se queda abajo aun desplazando su
                 ancestro, asi que una captura «de la fila» seria una foto del encabezado con
                 nombre de fila: una medicion falsa y plausible. Se declara y no se toma; la
                 fila esta medida por geometria en `evid`. */
              const alto = pag.viewportSize() ? pag.viewportSize().height : 900;
              if (c.cajaFila && c.cajaFila.y >= 0 && c.cajaFila.y + c.cajaFila.h <= alto)
                await pag.screenshot({ path: join(DEST, `aj3_fila_${nombre}_${k}.png`) });
              else c.filaFueraDeVentana = true;
              await pag.evaluate(() => { if (typeof indicCerrar === 'function') indicCerrar() });
        } catch (e) { c.capturaErr = String(e.message).slice(0, 200); }
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
