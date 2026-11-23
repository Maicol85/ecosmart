#!/usr/bin/env node
/**
 * _probe_p13dos.mjs — LOS DOS MOTORES, tanda P13. Chrome del sistema y WebKit, en los anchos
 * que el pedido nombra y en los DOS temas REALES —puestos con `ett_theme` mas `loadTheme()` y
 * DEVUELTOS por la sonda, que es lo que impide medir dos veces el mismo lado (la leccion de
 * PANT-34)—.
 *
 * ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema.
 *
 *     node scripts/_probe_p13dos.mjs <ruta-absoluta/index.html>
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
const CRUCES = [];
for (const [w,h] of [[1920,1080],[1440,900],[1280,800],[390,844]])
  for (const tema of ['noche','dia']) CRUCES.push({ w, h, tema });
const CUERPO = await readFile(new URL('./_probe_p13dos_cuerpo.js', import.meta.url), 'utf8');
const salida = [];
for (const motor of ['chromium','webkit']) {
  const nav = (motor === 'chromium')
    ? await _pw.chromium.launch({ channel:'chrome' })
    : await _pw.webkit.launch();
  for (const C of CRUCES) {
    const ctx = await nav.newContext({ viewport:{ width:C.w, height:C.h } });
    const pg = await ctx.newPage();
    const errs = [], cons = [];
    pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,140)));
    pg.on('console', m => { if (m.type() === 'error') cons.push(String(m.text()).slice(0,140)); });
    await pg.goto('http://127.0.0.1:' + port + '/' + nom, { waitUntil:'load' });
    await pg.waitForTimeout(1500);
    /* El tema REAL: la clase `light-mode` que pone `loadTheme()` leyendo `ett_theme`. NO el
       `colorScheme` del contexto, que es el defecto que PANT-34 encontro en cuatro tandas. */
    await pg.evaluate(t => { try { localStorage.setItem('ett_theme', t === 'dia' ? 'light' : 'dark');
      if (typeof loadTheme === 'function') loadTheme(); } catch (e) {} }, C.tema);
    await pg.evaluate(() => { try { const o = document.getElementById('login-overlay'); if (o) o.style.display = 'none'; } catch (e) {} });
    await pg.waitForTimeout(260);
    let r;
    try { r = await pg.evaluate(CUERPO); }
    catch (e) { r = { err:['evaluate: ' + String(e && e.message || e).slice(0,240)] }; }
    salida.push({ motor, ancho:C.w, alto:C.h, temaPedido:C.tema, errsPagina:errs, errsConsola:cons, ...r });
    await ctx.close();
  }
  await nav.close();
}
srv.close();
console.log(JSON.stringify(salida, null, 1));
process.exit(0);
