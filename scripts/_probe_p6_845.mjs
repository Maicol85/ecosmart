#!/usr/bin/env node
/* _probe_p6_845.mjs — diagnostico de TC-845 (D). SOLO LEE. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { servirConectorFalso } from './_conector_falso.mjs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILE = process.argv[2] || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const CUERPO = process.argv[3] || new URL('./_probe_p6_845_cuerpo.js', import.meta.url).pathname;
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
const pg = await (await nav.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e && e.message || e).slice(0, 160)));
await pg.goto('http://127.0.0.1:' + port + '/' + nom, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(2600);
await pg.evaluate(([b, c]) => { window.__P6_BASE = b; window.__P6_COD = c; },
  ['http://127.0.0.1:' + F.port, F.codigo]);
const cuerpo = await readFile(CUERPO, 'utf8');
let out;
try { out = await pg.evaluate(cuerpo); } catch (e) { out = { ERROR: String(e && e.message || e).slice(0, 400) }; }
console.log(JSON.stringify({ md5: null, errs, out }, null, 2));
await nav.close(); srv.close(); if (F.cerrar) await F.cerrar();
process.exit(0);
