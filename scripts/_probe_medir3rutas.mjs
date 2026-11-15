#!/usr/bin/env node
/**
 * _probe_medir3rutas.mjs - MEDIR-3: las CUATRO rutas al informe, ejercitadas DE VERDAD.
 *
 * La orden pide comprobar que `diam_tsvi`, `itv_tsvi`, `vti_tsvd` y `fevi` «entran igual que
 * antes». Verificarlo sobre el diff no alcanza: el diff dice que esas lineas no se movieron, no
 * que el camino siga llegando. Asi que cada ruta se SIEMBRA por donde la app la toma y se mira el
 * CAMPO del formulario, con su DENOMINADOR -- los cuatro arrancan vacios.
 *
 * ** EL DIAM TSVI SE SIEMBRA DESDE LA TABLA DE AORTA, que es donde MEDIR-3 lo mudo: es la unica
 * forma de que esta sonda pruebe lo que la tanda cambio y no otra cosa.
 *
 * ** LOS MODOS SE ASEGURAN, NO SE ALTERNAN: `d2Modo` y `dopModo` son toggles.
 *
 *     node scripts/_probe_medir3rutas.mjs <ruta/index.html>
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILE = process.argv[2];
if (!FILE) { console.error('falta la ruta del index.html'); process.exit(2); }
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' };
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try { const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'') || nom;
      const p = join(raiz, rel); if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      rq.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}).end(await readFile(p));
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0,'127.0.0.1',()=>res({srv:s,port:s.address().port}));
});

const salida = [];
for (const M of [{ n:'chrome', lanzar: () => _pw.chromium.launch({ channel:'chrome' }) },
                 { n:'webkit', lanzar: () => _pw.webkit.launch() }]) {
  let nav = null;
  try { nav = await M.lanzar(); } catch (e) { salida.push({ motor:M.n, errMotor:String(e&&e.message||e) }); continue; }
  const ctx = await nav.newContext({ viewport:{ width:1440, height:900 } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,140)));
  await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
  await pg.waitForTimeout(2600);
  await pg.evaluate(`(() => {
    try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
    try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
    const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
  })()`);
  await pg.waitForTimeout(260);
  const o = await pg.evaluate(`(async () => {
    const o = { errFn: [] };
    const $ = id => document.getElementById(id);
    const esp = ms => new Promise(r => setTimeout(r, ms));
    const V = id => { const e = $(id); return e ? String(e.value || '') : '(sin campo)'; };
    const verD2 = m => { try { if (!_d2Estado() || _d2Estado().modo !== m) d2Modo(m); } catch (e) { o.errFn.push('verD2: '+e.message); } };
    const verDop = m => { try { if (!_dopEstado() || _dopEstado().modo !== m) dopModo(m); } catch (e) { o.errFn.push('verDop: '+e.message); } };

    /* DENOMINADOR: los cuatro arrancan vacios. */
    o.antes = ['diam_tsvi','itv_tsvi','vti_tsvd','fevi'].map(V).join('|');
    o.denom = o.antes === '|||';

    const jpg = new Uint8Array([255,216,255,217]);
    const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:240, tipo:1 };
    const RDOP = { ux:4, uy:7, dx:0.004, dy:-0.5, ry0:420, rvy:0, x0:0, y0:250, x1:600, y1:500, tipo:2 };
    try { _cineAbrir([{ nombre:'A', cuadros:1, d:{ frags:[jpg], cols:600, filas:500, msCuadro:0,
      regiones:[R2D, RDOP] } }]); } catch (e) { o.errFn.push('abrir: '+e.message); return o; }
    await esp(500);
    try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) {}
    await esp(420);

    /* ── 1. LA FILA DEL DIAM TSVI VIVE EN AORTA (lo que MEDIR-3 mudo) ── */
    try { medHerramienta('dist'); } catch (e) {}
    verD2('ao');
    try { _d2Render(); } catch (e) {}
    await esp(260);
    o.filaEnAorta = $('d2-cajon')
      ? [...$('d2-cajon').querySelectorAll('table.med-tabla tbody tr')]
          .filter(tr => tr.children.length >= 4)
          .map(tr => (tr.children[0].textContent||'').trim()).join('/')
      : '';
    o.tsviEstaEnAorta = o.filaEnAorta.indexOf('Diam TSVI') >= 0;
    /* Y el valor cargado desde ESA tabla cruza el alias al cajon Doppler. */
    try { _d2Poner('vi.tsvi', 21.5); } catch (e) { o.errFn.push('poner tsvi: '+e.message); }
    await esp(200);
    try { o.enDop = _dopEstado().ao.diam; } catch (e) { o.enDop = '(err)'; }
    o.aliasCruza = o.enDop === 21.5;

    /* ── 2. LAS CUATRO RUTAS AL CAMPO, por las puertas que la app usa ──
       medVtiDiametro toma la ULTIMA distancia medida y la manda al campo del diametro;
       medVtiCargar reparte los VTI por su rol; _simpEscribirFEVI escribe la FEVI del
       biplano. Son las MISMAS tres puertas que la sonda de MEDIR-2 ejercito, y ninguna linea de
       las tres se movio en esta tanda -- pero eso es una prueba sobre el texto del archivo y no
       sobre la conducta, asi que se ejercitan. */
    const confReal = window.confirm; window.confirm = () => true;
    try {
      _medLineas.push({ a:{x:1,y:1}, b:{x:9,y:9}, mm:21.5 });
      medVtiDiametro('tsvi');
      _medVtis.push({ cm:22.4, rol:'tsvi' });
      _medVtis.push({ cm:18.6, rol:'tsvd' });
      medVtiCargar();
      _simpEscribirFEVI(58);
    } catch (e) { o.errFn.push('rutas: ' + e.message); }
    await esp(320);
    window.confirm = confReal;

    o.despues = ['diam_tsvi','itv_tsvi','vti_tsvd','fevi'].map(V).join('|');
    o.diam = V('diam_tsvi'); o.itv = V('itv_tsvi'); o.vtiVd = V('vti_tsvd'); o.fevi = V('fevi');
    const n = s => { const x = parseFloat(String(s).replace(',', '.')); return isFinite(x) ? x : null; };
    o.rutaDiam = n(o.diam) === 21.5;
    o.rutaItv  = n(o.itv) === 22.4;
    o.rutaVtiVd = n(o.vtiVd) === 18.6;
    o.rutaFevi = n(o.fevi) === 58;
    o.lasCuatro = o.rutaDiam && o.rutaItv && o.rutaVtiVd && o.rutaFevi;
    return o;
  })()`).catch(e => ({ errEval: String(e&&e.message||e).slice(0,300) }));
  salida.push(Object.assign({ motor:M.n }, o, { errsPagina: errs.slice(0,4) }));
  await ctx.close(); await nav.close();
}
srv.close();
console.log(JSON.stringify(salida, null, 1));
