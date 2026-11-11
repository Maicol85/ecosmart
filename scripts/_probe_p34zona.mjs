#!/usr/bin/env node
/**
 * _probe_p34zona.mjs - PANT-34. Mide SIN REDONDEO la zona tactil de las casillas del esquema de
 * anomalias coronarias en los dos motores: el cruce de dos motores informa 24 px en Chrome y 23
 * en WebKit, y un entero redondeado no deja decidir si la diferencia es de medio pixel o de uno.
 * Devuelve ademas la caja de la etiqueta entera, que es el area que de verdad responde al toque.
 * Nombre propio: verificado con ls, no existia.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
const CAND = [process.env.PW, process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'].filter(Boolean);
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default || (await import(c)); break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const FILE = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || nom;
      const p = join(raiz, rel);
      if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(await readFile(p));
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0, '127.0.0.1', () => res({ srv: s, port: s.address().port }));
});
const MEDIR = `(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display = 'none';
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  try { showTab('refs'); } catch (e) {}
  await esp(320);
  const sb = document.getElementById('ref-subtab-congenitas'); if (sb) sb.click();
  await esp(220);
  const cuerpo = document.getElementById('ref-coronarias');
  const h2 = cuerpo.closest('.card').querySelector('h2.card-head');
  if (getComputedStyle(cuerpo).display === 'none') h2.click();
  await esp(260);
  const a = document.querySelector('[data-rac-ap="aaorca"]');
  const out = [];
  Array.prototype.forEach.call(a.querySelectorAll('.rac-chk'), l => {
    const t = l.querySelector('.rac-chk-t').getBoundingClientRect();
    const e = l.getBoundingClientRect();
    const i = l.querySelector('input').getBoundingClientRect();
    out.push({ k: l.querySelector('input').getAttribute('data-rac'),
               texto: +t.height.toFixed(3), etiqueta: +e.height.toFixed(3),
               etiquetaAncho: +e.width.toFixed(3), casilla: +i.height.toFixed(3),
               fuente: getComputedStyle(l.querySelector('.rac-chk-t')).fontSize,
               alturaLinea: getComputedStyle(document.querySelector('.rac-txt')).lineHeight });
  });
  return out;
})()`;
const OUT = {};
for (const motor of ['chrome', 'webkit']) {
  const lanzador = motor === 'chrome' ? _pw.chromium : _pw.webkit;
  let nav = null;
  try { nav = await lanzador.launch(motor === 'chrome' ? { channel: 'chrome' } : {}); }
  catch (e) { OUT[motor] = { error: String(e).slice(0, 160) }; continue; }
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto('http://127.0.0.1:' + port + '/' + nom, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(2600);
  OUT[motor] = await pg.evaluate(MEDIR);
  await ctx.close(); await nav.close();
}
console.log(JSON.stringify(OUT, null, 1));
srv.close();
