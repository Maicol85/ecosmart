#!/usr/bin/env node
/**
 * _probe_cuad.mjs — la sonda de la tanda CUADROS (18/11/2026).
 * Mide los doce cuadros, el reparto de la grilla, el estado de la tarjeta y GENERA EL PDF DE
 * VERDAD, devolviendo sus bytes en base64 para rasterizarlos y MIRARLOS.
 *
 * ⚠️ EL CUERPO VIVE EN `_probe_cuad_cuerpo.js` y se lee con readFile: así los acentos graves son
 *    codigo normal y no cierran el template de este archivo — la leccion de MEDIR-4b.
 * ⚠️ SE SIRVE POR HTTP: en file:// el origen es opaco y no hay localStorage ni IndexedDB.
 *
 *   node scripts/_probe_cuad.mjs [--file=...] [--motor=chrome|webkit|dos] [--escena=full|min]
 *                                [--pdf=/ruta/base] [--plantilla=clasico,...]
 */
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';

const CAND = [process.env.PW, process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'].filter(Boolean);
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default || (await import(c)); break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }

const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').split('=')[1] || '';
const FILE = arg('file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MOTORES = arg('motor') === 'dos' ? ['chrome', 'webkit'] : [arg('motor') || 'chrome'];
const ESCENAS = (arg('escena') || 'full').split(',');
const PLANT = (arg('plantilla') || '').split(',').filter(Boolean);
const PDFBASE = arg('pdf');
const ANCHOS = (arg('ancho') || '1369').split(',').map(Number);
const CUERPO = await readFile(new URL('./_probe_cuad_cuerpo.js', import.meta.url), 'utf8');
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
    } catch { try { if (!rq.headersSent) rq.writeHead(404); rq.end('no') } catch (e) {} }
  });
  s.listen(0, '127.0.0.1', () => res({ srv: s, port: s.address().port }));
});
const URL0 = 'http://127.0.0.1:' + port + '/' + nom;
const OUT = { archivo: FILE };
for (const motor of MOTORES) {
  const lanzador = motor === 'chrome' ? _pw.chromium : _pw.webkit;
  let nav = null;
  try { nav = await lanzador.launch(motor === 'chrome' ? { channel: 'chrome' } : {}); }
  catch (e) { OUT[motor] = { error: String(e).slice(0, 180) }; continue; }
  for (const escena of ESCENAS) {
   for (const w of ANCHOS) {
    const ctx = await nav.newContext({ viewport: { width: w, height: 940 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('console', x => { if (x.type() === 'error') errs.push('consola: ' + x.text().slice(0, 160)) });
    pg.on('pageerror', e => errs.push('pagina: ' + String(e.message).slice(0, 160)));
    try {
      await pg.goto(URL0, { waitUntil: 'load', timeout: 120000 });
      await pg.waitForTimeout(2800);
      const plantillas = PLANT.length ? PLANT : [''];
      for (const pl of plantillas) {
        if (pl) await pg.evaluate('(function(p){ try{ setPdfPlantilla(p) }catch(e){} })(' + JSON.stringify(pl) + ')');
        await pg.waitForTimeout(150);
        const r = await pg.evaluate('(' + CUERPO + ')(' + JSON.stringify({ escena, cfg: arg('cfg'), tarjeta: arg('tarjeta') === '1', pdfcfg: arg('pdfcfg') === '1', pdf: arg('nopdf') !== '1' }) + ')');
        const clave = motor + '/' + escena + '/' + w + (pl ? '/' + pl : '');
        if (r.pdf && r.pdf.b64 && PDFBASE) {
          const ruta = PDFBASE + '-' + escena + (pl ? '-' + pl : '') + '.pdf';
          await writeFile(ruta, Buffer.from(r.pdf.b64, 'base64'));
          r.pdf = { archivo: ruta, bytes: Buffer.from(r.pdf.b64, 'base64').length };
        } else if (r.pdf && r.pdf.b64) { r.pdf = { bytes: r.pdf.b64.length }; }
        r.errores = errs.slice();
        OUT[clave] = r;
      }
    } catch (e) { OUT[motor + '/' + escena + '/' + w] = { error: String(e).slice(0, 240), errores: errs }; }
    await ctx.close();
   }
  }
  await nav.close();
}
console.log(JSON.stringify(OUT, null, 1));
srv.close();
