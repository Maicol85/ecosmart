#!/usr/bin/env node
/**
 * _probe_pr6.mjs - la tanda PR6. Solo MIDE: no toca una linea del producto.
 *
 * Chrome del sistema. El cuerpo vive aparte (_probe_pr6b_cuerpo.js) por la leccion de los
 * acentos graves: metido en un template literal, uno en un comentario lo cierra antes de
 * tiempo y cuando lo que queda es JS valido node --check NO lo ve.
 *
 *     node scripts/_probe_p13_0.mjs <ruta-absoluta/index.html>
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILE = process.argv[2];
if (!FILE) { console.error('falta la ruta ABSOLUTA del index.html'); process.exit(2); }
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css' };
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try { const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'') || nom;
      const p = join(raiz, rel); if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      const cuerpo = await readFile(p);
      rq.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}).end(cuerpo);
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0,'127.0.0.1',()=>res({srv:s,port:s.address().port}));
});
const ANCHOS = (process.env.PR6_ANCHOS || '1440x900').split(',')
  .map(s => { const [w,h] = s.split('x').map(x => parseInt(x,10)); return { w, h: h || 900 }; });
const CUERPO = await readFile(new URL('./_probe_pr6b_cuerpo.js', import.meta.url), 'utf8');
const salida = [];
const nav = await _pw.chromium.launch({ channel:'chrome' });
for (const W of ANCHOS) {
  const ctx = await nav.newContext({ viewport:{ width:W.w, height:W.h } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,160)));
  await pg.goto('http://127.0.0.1:' + port + '/' + nom, { waitUntil:'load' });
  await pg.waitForTimeout(1500);
  /* El overlay de login tapa la pagina entera y elementFromPoint devuelve login-overlay en
     todos los puntos. Es la trampa que CUADROS ya documenta. */
  await pg.evaluate(() => { try { const o = document.getElementById('login-overlay'); if (o) o.style.display = 'none'; } catch (e) {} });
  await pg.waitForTimeout(200);
  let r;
  try { r = await pg.evaluate(CUERPO); }
  catch (e) { r = { err:['evaluate: ' + String(e && e.message || e).slice(0,400)] }; }
  salida.push({ ancho:W.w, alto:W.h, errsPagina:errs, ...r });
  await ctx.close();
}
await nav.close(); srv.close();
console.log(JSON.stringify(salida, null, 1));
process.exit(0);
