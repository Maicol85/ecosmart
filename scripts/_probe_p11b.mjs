#!/usr/bin/env node
/**
 * _probe_p11b.mjs - TAREA 2 de la tanda P11: las flechas del teclado y las medidas por cuadro.
 *
 * Las flechas se miden con pg.keyboard, que es la UNICA forma: un KeyboardEvent sintetico sobre
 * un input range NO mueve su valor, asi que una sonda que lo dispare desde la pagina mide otra
 * cosa — y lo que esta tarea arregla es justamente el FOCO.
 *
 *     node scripts/_probe_p11b.mjs <ruta-absoluta/index.html>
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
const TAM = (process.env.P11_TAM || '1440x900').split(',')
  .map(t => { const [w,h] = t.split('x').map(x => parseInt(x,10)); return { w, h }; });
const _MOT = { chrome: () => _pw.chromium.launch({ channel:'chrome' }), webkit: () => _pw.webkit.launch() };
const MOTORES = (process.env.P11_MOTORES || 'chrome,webkit').split(',').map(n => ({ n, lanzar:_MOT[n] }));
const salida = [];

const ABRIR = `(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const jpg = new Uint8Array([255,216,255,217]);
  const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 };
  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}
  _cineAbrir([{ nombre:'P11b', cuadros:8, d:{ frags:[jpg,jpg,jpg,jpg,jpg,jpg,jpg,jpg],
    cols:600, filas:500, msCuadro:40, regiones:[R2D] } }]);
  await esp(520);
  if (!_vistaA.medOn) document.getElementById('cine-medir').click();
  await esp(340);
  return { cuadro: _vistaA.datos.cuadro, cuadros: _vistaA.datos.loops[0].cuadros,
           herr: _vistaA.medHerr, medOn: !!_vistaA.medOn };
})()`;

for (const M of MOTORES) {
  let nav = null;
  try { nav = await M.lanzar(); } catch (e) { salida.push({ motor:M.n, errMotor:String(e&&e.message||e).slice(0,140) }); continue; }
  for (const T of TAM) {
    const ctx = await nav.newContext({ viewport:{ width:T.w, height:T.h } });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,160)));
    const cons = []; pg.on('console', m => { if (m.type()==='error') cons.push(m.text().slice(0,160)); });
    await pg.goto('http://127.0.0.1:' + port + '/' + nom, { waitUntil:'load' });
    await pg.waitForTimeout(1400);
    await pg.evaluate(() => { try { const o = document.getElementById('login-overlay'); if (o) o.style.display = 'none'; } catch (e) {} });
    await pg.waitForTimeout(200);
    const o = { motor:M.n, tam:T.w+'x'+T.h };
    try { o.abrir = await pg.evaluate(ABRIR); } catch (e) { o.abrir = 'ERR ' + String(e&&e.message||e).slice(0,160); }

    const est = () => pg.evaluate(() => ({
      cuadro: _vistaA.datos ? _vistaA.datos.cuadro : null,
      foco: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : 'null',
      lineas: _vistaA.medLineas.filter(l => !l.calibracion).length,
      mm: _vistaA.medLineas.filter(l => !l.calibracion).map(l => Math.round(l.mm * 100) / 100),
      claves: _vistaA.medPorCuadro ? Object.keys(_vistaA.medPorCuadro).sort() : null
    }));
    /* Un clic sobre el canvas de medicion, en pixeles de IMAGEN (la imagen puede estar escalada) */
    const clicImg = (x, y) => pg.evaluate(([px, py]) => {
      const cv = document.getElementById('cine-med');
      const r = cv.getBoundingClientRect();
      const k = (cv.width && r.width) ? (r.width / cv.width) : 1;
      cv.dispatchEvent(new MouseEvent('click', { bubbles:true, clientX:r.left + px*k, clientY:r.top + py*k }));
    }, [x, y]);
    const flecha = async (k) => { await pg.keyboard.press(k); await pg.waitForTimeout(300); };

    /* ── 2.1 — CUATRO ESCENARIOS, EL MISMO QUE EL MEDICO DESCRIBE ── */
    try {
      const t = {};
      t.a_antes = await est(); await flecha('ArrowRight'); t.a_despues = await est();
      /* despues de MEDIR */
      await pg.evaluate(() => { try { medHerramienta('dist'); } catch (e) {} });
      await clicImg(100, 100); await pg.waitForTimeout(140); await clicImg(300, 100);
      await pg.waitForTimeout(260);
      t.b_antes = await est(); await flecha('ArrowRight'); t.b_despues = await est();
      /* despues de REPRODUCIR */
      await pg.evaluate(() => { document.getElementById('cine-play').click(); });
      await pg.waitForTimeout(260);
      await pg.evaluate(() => { document.getElementById('cine-play').click(); });
      await pg.waitForTimeout(200);
      t.c_antes = await est(); await flecha('ArrowRight'); t.c_despues = await est();
      /* con el DESLIZADOR enfocado: tiene que avanzar UNO, no dos */
      await pg.evaluate(() => { document.getElementById('cine-slider').focus(); });
      await pg.waitForTimeout(160);
      t.d_antes = await est(); await flecha('ArrowRight'); t.d_despues = await est();
      /* con el campo de la ETIQUETA enfocado: la flecha NO tiene que mover el cuadro */
      await pg.evaluate(() => { const e = document.getElementById('cine-cap-etiq'); if (e) e.focus(); });
      await pg.waitForTimeout(160);
      t.e_antes = await est(); await flecha('ArrowRight'); t.e_despues = await est();
      /* y para atras */
      await pg.evaluate(() => { try { document.getElementById('cine-cap-etiq').blur(); } catch (e) {} });
      await pg.waitForTimeout(120);
      t.f_antes = await est(); await flecha('ArrowLeft'); t.f_despues = await est();
      o.tecl = t;
    } catch (e) { o.tecl = { err:String(e&&e.message||e).slice(0,200) }; }

    /* ── 2.2 — LAS MEDIDAS POR CUADRO ── */
    try {
      const m = {};
      await pg.evaluate(() => { try { medBorrar(); _vistaA.medPorCuadro = null;
        _vCon(_vistaA, () => cineIr(0)); } catch (e) {} });
      await pg.waitForTimeout(320);
      await pg.evaluate(() => { try { medHerramienta('dist'); } catch (e) {} });
      await pg.waitForTimeout(160);
      /* una medida en el cuadro 0 */
      await clicImg(100, 100); await pg.waitForTimeout(120); await clicImg(300, 100);
      await pg.waitForTimeout(240);
      m.c0 = await est();
      /* al cuadro 3 con la flecha: tiene que quedar vacio */
      await flecha('ArrowRight'); await flecha('ArrowRight'); await flecha('ArrowRight');
      m.c3vacio = await est();
      /* otra medida distinta en el cuadro 3 */
      await clicImg(100, 200); await pg.waitForTimeout(120); await clicImg(500, 200);
      await pg.waitForTimeout(240);
      m.c3 = await est();
      /* volver al 0: tiene que REAPARECER la de aquel cuadro, y SOLO esa */
      await flecha('ArrowLeft'); await flecha('ArrowLeft'); await flecha('ArrowLeft');
      m.vuelta0 = await est();
      /* y volver al 3 otra vez */
      await flecha('ArrowRight'); await flecha('ArrowRight'); await flecha('ArrowRight');
      m.vuelta3 = await est();
      /* cambiar de IMAGEN suelta el almacen */
      m.trasImagen = await pg.evaluate(async () => {
        const esp = ms => new Promise(r => setTimeout(r, ms));
        try { _vCon(_vistaA, medCambioDeImagen); } catch (e) {}
        await esp(220);
        return { claves: _vistaA.medPorCuadro ? Object.keys(_vistaA.medPorCuadro) : null,
                 lineas: _vistaA.medLineas.filter(l => !l.calibracion).length };
      });
      o.med = m;
    } catch (e) { o.med = { err:String(e&&e.message||e).slice(0,200) }; }

    o.errsPagina = errs; o.errsConsola = cons;
    salida.push(o);
    await ctx.close();
  }
  await nav.close();
}
srv.close();
console.log(JSON.stringify(salida, null, 1));
process.exit(0);
