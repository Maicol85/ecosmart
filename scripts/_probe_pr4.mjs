#!/usr/bin/env node
/**
 * _probe_pr4.mjs — el cruce de DOS MOTORES del prompt 4 (2026-11-18).
 * Chrome (el del sistema, por channel) y WebKit, en 1369 / 1920 / 2560 y 390 px, en los dos
 * temas: 8 cruces por motor. El cuerpo vive en `_probe_pr4_cuerpo.js` (ver por que alla).
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema.
 * ⚠️ SE SIRVE POR HTTP: en file:// el origen es opaco y no hay localStorage ni IndexedDB.
 *
 *   PW=/ruta/a/playwright node scripts/_probe_p38b1.mjs [--file=/ruta/index.html]
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';

const CAND = [process.env.PW,
  process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'].filter(Boolean);
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default || (await import(c)); break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }

const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const CUERPO = await readFile(new URL('./_probe_pr4_cuerpo.js', import.meta.url), 'utf8');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
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
const URL0 = 'http://127.0.0.1:' + port + '/' + nom;

const OUT = { archivo: FILE };
for (const motor of ['chrome', 'webkit']) {
  const lanzador = motor === 'chrome' ? _pw.chromium : _pw.webkit;
  let nav = null;
  try { nav = await lanzador.launch(motor === 'chrome' ? { channel: 'chrome' } : {}); }
  catch (e) { OUT[motor] = { error: String(e).slice(0, 180) }; continue; }
  for (const tema of ['dia', 'noche']) {
    for (const w of [1440, 390]) {
      const ctx = await nav.newContext({ viewport: { width: w, height: 940 } });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('console', x => { if (x.type() === 'error') errs.push('consola: ' + x.text().slice(0, 120)) });
      pg.on('pageerror', e => errs.push('pagina: ' + String(e.message).slice(0, 120)));
      try {
        await pg.goto(URL0, { waitUntil: 'load', timeout: 120000 });
        await pg.waitForTimeout(2600);
        /* ⚠️ EL TEMA SE INVOCA DENTRO DE LA CADENA Y NO COMO SEGUNDO ARGUMENTO DE evaluate.
           `page.evaluate` con una CADENA **descarta** el argumento —la trampa que esta casa ya
           documenta: la sonda lee `undefined` en los dos lados y dos «ERR» comparan iguales—.
           El cuerpo es una expresion de funcion y se la llama acá, con el tema serializado. */
        const r = await pg.evaluate('(' + CUERPO + ')(' + JSON.stringify(tema) + ')');
        r.errores = errs;
        OUT[motor + '/' + tema + '/' + w] = r;
      } catch (e) {
        OUT[motor + '/' + tema + '/' + w] = { error: String(e).slice(0, 200), errores: errs };
      }
      await ctx.close();
    }
  }
  await nav.close();
}
console.log(JSON.stringify(OUT, null, 1));
srv.close();
