#!/usr/bin/env node
/**
 * _probe_p6dos.mjs — PROMPT 6: los dos motores, los dos temas, cuatro anchos y la emulacion de
 * «reducir animaciones», que es lo unico de los bloques A y B que el arnes de la suite NO puede
 * medir (no puede cambiar la preferencia del sistema).
 *
 * ⚠️ WebKit de Playwright NO ES Safari, y se declara. Chrome va por el del sistema.
 *
 *     node scripts/_probe_p6dos.mjs [ruta/index.html]
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
const cuerpo = await readFile(new URL('./_probe_p6dos_cuerpo.js', import.meta.url), 'utf8');
const ANCHOS = [1440, 1280, 1000, 390];
const out = {};
for (const motor of ['chromium', 'webkit']) {
  const nav = (motor === 'chromium')
    ? await _pw.chromium.launch({ channel: 'chrome' })
    : await _pw.webkit.launch();
  for (const w of ANCHOS) {
    for (const tema of ['noche', 'dia']) {
      for (const mov of ['normal', 'reducido']) {
        const F = await servirConectorFalso({ origenes: 'http://127.0.0.1:' + port });
        const ctx = await nav.newContext({ viewport: { width: w, height: 900 },
          reducedMotion: (mov === 'reducido' ? 'reduce' : 'no-preference') });
        const pg = await ctx.newPage();
        const errs = [], cons = [];
        pg.on('pageerror', e => errs.push(String(e && e.message || e).slice(0, 140)));
        pg.on('console', m => { if (m.type() === 'error') cons.push(m.text().slice(0, 140)); });
        await pg.goto('http://127.0.0.1:' + port + '/' + nom, { waitUntil: 'load', timeout: 120000 });
        await pg.waitForTimeout(2400);
        await pg.evaluate(([b, c, t]) => { window.__P6_BASE = b; window.__P6_COD = c; window.__P6_TEMA = t; },
          ['http://127.0.0.1:' + F.port, F.codigo, tema === 'dia' ? 'light' : 'dark']);
        let r;
        try { r = await pg.evaluate(cuerpo); }
        catch (e) { r = { fatal: String(e && e.message || e).slice(0, 300) }; }
        out[motor + '/' + w + '/' + tema + '/' + mov] = { r, errs, cons };
        await ctx.close();
        F.srv.close(); if (F.puertoCerrado) { try { F.puertoCerrado.close(); } catch (e) {} }
      }
    }
  }
  await nav.close();
}
console.log(JSON.stringify(out, null, 1));
srv.close();
process.exit(0);
