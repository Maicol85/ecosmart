#!/usr/bin/env node
/**
 * _probe_p11_0.mjs - BLOQUE 0 de la tanda P11. Solo MIDE: no toca una linea del producto.
 *
 * Chrome del sistema, tres anchos (1440, 1920 y 2560) y el tema de siempre. El cuerpo vive
 * aparte (_probe_p11_0_cuerpo.js) por la leccion de los acentos graves.
 *
 * Las flechas del teclado se miden con pg.keyboard, que es la UNICA forma de medirlas: un
 * KeyboardEvent sintetico sobre un input range NO mueve su valor, asi que una sonda que lo
 * dispare desde la pagina mide otra cosa.
 *
 *     node scripts/_probe_p11_0.mjs <ruta-absoluta/index.html>
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
      /* ⚠️ SE LEE ANTES DE MANDAR LA CABECERA: al reves, un archivo que no esta tira DESPUES de
         `writeHead(200)` y el `catch` revienta con ERR_HTTP_HEADERS_SENT, que mata la sonda
         entera. Lo pago medir contra un arbol de comparacion que solo tiene el index.html. */
      const cuerpo = await readFile(p);
      rq.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}).end(cuerpo);
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0,'127.0.0.1',()=>res({srv:s,port:s.address().port}));
});

/* ⚠️ CADA ANCHO CON SU ALTO REAL, y esto cambia el diagnostico: con 900 px de alto en los tres,
   la imagen queda SIEMPRE acotada por la altura y el ancho de sobra parece imposible de usar.
   Un monitor de 2560 es de 1440 de alto, no de 900. */
const ANCHOS = (process.env.P11_ANCHOS || '1440x900,1920x1080,2560x1440').split(',')
  .map(s => { const [w,h] = s.split('x').map(x => parseInt(x,10)); return { w, h: h || 900 }; });
const CUERPO = await readFile(new URL('./_probe_p11_0_cuerpo.js', import.meta.url), 'utf8');
const salida = [];
const nav = await _pw.chromium.launch({ channel:'chrome' });

for (const W of ANCHOS) {
  const ctx = await nav.newContext({ viewport:{ width:W.w, height:W.h } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,160)));
  await pg.goto('http://127.0.0.1:' + port + '/' + nom, { waitUntil:'load' });
  await pg.waitForTimeout(1400);
  /* La sesion: el overlay de login tapa la pagina entera y `elementFromPoint` devuelve
     `login-overlay` en todos los puntos. Es la trampa que CUADROS ya documenta. */
  await pg.evaluate(() => { try { const o = document.getElementById('login-overlay'); if (o) o.style.display = 'none'; } catch (e) {} });
  await pg.waitForTimeout(200);
  let r;
  try { r = await pg.evaluate(CUERPO); }
  catch (e) { r = { err:['evaluate: ' + String(e && e.message || e).slice(0,200)] }; }

  /* ── 2.1 — LAS FLECHAS, CON TECLADO DE VERDAD ────────────────────────────────────────────
     Tres escenarios, el mismo que el medico describe:
       a) recien abierto, sin tocar nada;
       b) despues de medir (un clic en el canvas de medicion);
       c) despues de tocar Reproducir;
       d) despues de tocar la barra (el slider), que es cuando «vuelven». */
  const leerCuadro = () => pg.evaluate(() => {
    try { return { cuadro: _vistaA.datos ? _vistaA.datos.cuadro : null,
                   foco: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : 'null' }; }
    catch (e) { return 'ERR'; }
  });
  const flecha = async () => { await pg.keyboard.press('ArrowRight'); await pg.waitForTimeout(260); };
  const tecl = {};
  try {
    await pg.evaluate(() => { try { _vCon(_vistaA, () => cineIr(0)); } catch (e) {} });
    await pg.waitForTimeout(260);
    tecl.a_antes = await leerCuadro(); await flecha(); tecl.a_despues = await leerCuadro();

    await pg.evaluate(() => { try { const c = document.getElementById('cine-med');
      if (c) { const r = c.getBoundingClientRect(); c.dispatchEvent(new MouseEvent('click', { bubbles:true, clientX: r.x + 40, clientY: r.y + 40 })); } } catch (e) {} });
    await pg.waitForTimeout(200);
    tecl.b_antes = await leerCuadro(); await flecha(); tecl.b_despues = await leerCuadro();

    await pg.evaluate(() => { try { document.getElementById('cine-play').click(); } catch (e) {} });
    await pg.waitForTimeout(240);
    await pg.evaluate(() => { try { document.getElementById('cine-play').click(); } catch (e) {} });
    await pg.waitForTimeout(200);
    tecl.c_antes = await leerCuadro(); await flecha(); tecl.c_despues = await leerCuadro();

    await pg.evaluate(() => { try { document.getElementById('cine-slider').focus(); } catch (e) {} });
    await pg.waitForTimeout(160);
    tecl.d_antes = await leerCuadro(); await flecha(); tecl.d_despues = await leerCuadro();
  } catch (e) { tecl.err = String(e && e.message || e).slice(0,160); }

  /* ── 1.6 — Esc en maximizado: ¿sale del tamanio o cierra el visor? ── */
  let esc = null;
  try {
    await pg.evaluate(() => { try { cineMaxToggle(); } catch (e) {} });
    await pg.waitForTimeout(320);
    const antes = await pg.evaluate(() => ({ max: document.getElementById('cine-ov').classList.contains('cine-max'),
      vis: getComputedStyle(document.getElementById('cine-ov')).display,
      rol: document.getElementById('cine-ov').getAttribute('role'),
      am: document.getElementById('cine-ov').getAttribute('aria-modal') }));
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(320);
    const despues = await pg.evaluate(() => { const o = document.getElementById('cine-ov');
      return o ? { max: o.classList.contains('cine-max'), vis: getComputedStyle(o).display } : { ido:true }; });
    esc = { antes, despues };
  } catch (e) { esc = { err: String(e && e.message || e).slice(0,160) }; }

  salida.push({ ancho:W.w, alto:W.h, errsPagina:errs, ...r, tecl, esc });
  await ctx.close();
}
await nav.close(); srv.close();
console.log(JSON.stringify(salida, null, 1));
process.exit(0);
