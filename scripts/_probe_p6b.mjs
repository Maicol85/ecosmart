#!/usr/bin/env node
/**
 * _probe_p6base.mjs — PROMPT 6, bloque 0: la linea base, medida y no leida.
 *
 * SOLO LEE. No escribe en index.html y no toca ningun archivo del proyecto.
 *
 *  (1) LA CAUSA DEL PUNTO D, reproducida con el gesto del medico: llega un envio, se avisa, se
 *      descarta, el ecografo manda las MISMAS y se sondea. Con control de la hipotesis (vaciar
 *      la lista en memoria) y control positivo (ids nuevos).
 *  (2) Si el sondeo pone al dia la tarjeta de CeiboLink o no.
 *  (3) Que hace `dstLeer` —la puerta de los tres sumideros— con un JPG, un PNG, un MP4 y un TXT,
 *      y que hace `_dcmImgLeer`, que es la que la vista previa y el visor llaman SIN preguntar.
 *  (4) Que campos manda hoy el conector falso: contra que version del contrato esta escrito.
 *  (5) Censo de lo que la app tiene hoy.
 *
 *     node scripts/_probe_p6base.mjs [ruta/index.html]
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { servirConectorFalso } from './_conector_falso.mjs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILE = process.argv[2] || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || nom;
      const p = join(raiz, rel); if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(await readFile(p));
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0, '127.0.0.1', () => res({ srv: s, port: s.address().port }));
});
const F = await servirConectorFalso({ origenes: 'http://127.0.0.1:' + port });
const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const pg = await ctx.newPage();
const errs = [], cons = [];
pg.on('pageerror', e => errs.push(String(e && e.message || e).slice(0, 180)));
pg.on('console', m => { if (m.type() === 'error') cons.push(m.text().slice(0, 180)); });
await pg.goto('http://127.0.0.1:' + port + '/' + nom, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(2600);
await pg.evaluate(([b, c]) => { window.__P6_BASE = b; window.__P6_COD = c; },
  ['http://127.0.0.1:' + F.port, F.codigo]);
/* El cambio de ancho lo hace Playwright y no la pagina: `window.resizeTo` no funciona en una
   pestania que no se abrio con `window.open`. Se expone como funcion para que el cuerpo la
   llame en su bucle de anchos. */
await pg.exposeFunction('__P6_RESIZE', async (w) => {
  await pg.setViewportSize({ width: Number(w), height: 900 });
  return true;
});
const cuerpo = await readFile(new URL('./_probe_p6b_cuerpo.js', import.meta.url), 'utf8');
let out;
try { out = await pg.evaluate(cuerpo); }
catch (e) { out = { fatal: String(e && e.message || e).slice(0, 400) }; }
console.log(JSON.stringify({ out, errs, cons }, null, 2));
await nav.close(); srv.close(); F.srv.close(); if (F.puertoCerrado) { try { F.puertoCerrado.close(); } catch (e) {} }
process.exit(0);
