/* Sonda de MAQUETA en DOS MOTORES para la tanda AJ2 (2026-10-23).
 *
 *   node scripts/_probe_aj2wk.mjs [--file /ruta/index.html] [--dest /dir/capturas]
 *
 * Mide, a 1440 px y 390 px y en los DOS temas, lo que esta tanda movio:
 *   - CERO barra horizontal de la PAGINA.
 *   - CERO texto recortado (scrollWidth > clientWidth del propio nodo) en las zonas tocadas.
 *   - La geometria de TODA la app: cuantas pestanas tienen caja. Un <div> sin cerrar no lanza
 *     —el parser re-anida lo que viene despues— y ningun A/B de texto lo ve; lo unico que lo
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

  /* Las zonas que esta tanda movio, abiertas por su gesto. */
  abrirTep() { try { showTab('hemodinamica') } catch (e) {}
    try { var d = document.getElementById('tep-seccion');
      if (d && getComputedStyle(d).display === 'none' && typeof toggleCard === 'function')
        toggleCard('tep-seccion', document.getElementById('tep-arrow')) } catch (e) {}
    var e = document.getElementById('tep-score');
    var p = e ? e.closest('.calc-box') : null;
    var r = p ? p.getBoundingClientRect() : { width:0, height:0 };
    return { w: Math.round(r.width), h: Math.round(r.height) } },

  escTep() { window.__M.abrirTep();
    window.__M.set('tapse','14'); window.__M.set('vd_bas','45'); window.__M.set('ddfvi','40');
    window.__M.set('vci_diam','23'); window.__M.set('vci_col','<50'); window.__M.set('vmax_it','3.5');
    window.__M.set('tep_mcconnell','si'); window.__M.set('tep_signo6060','si');
    window.__M.set('tep_tabique_d','no');
    var g = window.__M.abrirTep();
    /* Los tres titulos de grupo (AJ2-10c) son <div> con --accent2 y sin clase ni id: se buscan
       por su TEXTO dentro de la caja del score. Un selector por atributo devuelve [] y eso se
       lee igual que «los titulos no estan». */
    var caja = (document.getElementById('tep-score')||{}).closest
      ? document.getElementById('tep-score').closest('.calc-box') : null;
    var cont = caja ? caja.parentElement : document.getElementById('tep-seccion');
    var tt = cont ? Array.prototype.slice.call(cont.querySelectorAll('div'))
      .map(function(x){ return (x.childElementCount === 0 ? (x.textContent||'') : '').replace(/\\s+/g,' ').trim() })
      .filter(function(t){ return t === 'CRITERIOS DE SOBRECARGA DEL VD' || t === '\u00cdNDICES' || t === 'SCORE' }) : [];
    return { caja: g, titulos: tt,
      score: (document.getElementById('tep-score')||{}).textContent || '',
      interp: (document.getElementById('tep-interpretacion')||{}).textContent || '',
      recorteCaja: window.__M.recorte('#tep-seccion .calc-row, #tep-seccion .calc-lbl') } },

  /* ⚠️ LA SECCION SE LLAMA «aorta» Y NO «ao»: con el id equivocado el span mide 0x0 y «cero
     recorte» sale sobre un nodo que no esta dibujado. */
  abrirAtero() { try { showTab('ete') } catch (e) {}
    try { var s = document.getElementById('ete-seccion-aorta');
      if (s && getComputedStyle(s).display === 'none') {
        var h = document.querySelector('h2[onclick*="toggleEteSeccion("][onclick*="aorta"]');
        if (h) h.click();
      } } catch (e) {}
    window.__M.set('ao_grosor_placa','6');
    var e = document.getElementById('ao-grado-auto');
    var r = e ? e.getBoundingClientRect() : { width:0, height:0 };
    var sec = document.getElementById('ete-seccion-aorta');
    var rs = sec ? sec.getBoundingClientRect() : { width:0 };
    return { w: Math.round(r.width), h: Math.round(r.height),
      secW: Math.round(rs.width),
      txt: (e||{}).textContent || '',
      grado: (document.getElementById('ao_grado_atero')||{}).value || '',
      recorte: window.__M.recorte('#ete-seccion-aorta .calc-row, #ete-seccion-aorta label, #ete-seccion-aorta .calc-lbl') } },

  /* El panel de Evidencia: su celda de valor lleva nowrap, y es la que recorto en la tanda E. */
  evid() { try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) {}
    var c = document.getElementById('indic-cuerpo');
    var r = c ? c.getBoundingClientRect() : { width:0 };
    /* ⚠️ EL DENOMINADOR SON LAS CELDAS <td>, no una clase: este panel se pinta con <table> y
       sus filas no llevan clase. Un selector por data-ind-sec devuelve 0 y «cero recorte» no
       mide nada. */
    var rec = window.__M.recorte('#indic-cuerpo td, #indic-cuerpo th');
    var sec = c ? c.querySelectorAll('td, th').length : 0;
    try { if (typeof indicCerrar === 'function') indicCerrar() } catch (e) {}
    return { w: Math.round(r.width), nSec: sec, recorte: rec } }
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
      c.tep = await pag.evaluate(() => window.__M.escTep());
      c.scrollTep = await pag.evaluate(() => window.__M.scrollH());
      c.atero = await pag.evaluate(() => window.__M.abrirAtero());
      c.scrollAtero = await pag.evaluate(() => window.__M.scrollH());
      c.evid = await pag.evaluate(() => window.__M.evid());
      c.scrollFin = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `aj2_${nombre}_${k}.png`) }) } catch (e) {} }
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
