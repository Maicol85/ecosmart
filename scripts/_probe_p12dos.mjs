#!/usr/bin/env node
/**
 * _probe_p12dos.mjs — P12 en Chrome y en WebKit, a 1440x900 y 1280x800, en los DOS temas REALES.
 *
 * Mide las cuatro cosas que la tanda toca y que se pueden ver: los tres primitivos del cartel
 * propio con su geometria y su piso tactil, la escala de velocidad sobreviviendo al viaje por el
 * registro, la receta de la calibracion manual, y el boton del cartel de llegada con su (0).
 *
 * ** LLEVA SU DETECTOR DE QUE SON DOS ARBOLES (`tieneLoNuevo`). La ruta por omision de una sonda
 * es la del arbol real, asi que correrla DESDE un worktree no alcanza: los numeros salen
 * identicos -- que es justo lo que la prueba queria afirmar -- y nadie lo nota. Es el defecto
 * que PANT-37 pago con _probe_ec2dos.mjs.
 *
 * ** EL TEMA SE PONE COMO LO PONE LA APP: la clase `light-mode` que escribe `loadTheme()` leyendo
 * `localStorage.ett_theme`. NO es `prefers-color-scheme` (hallazgo de metodo de PANT-34). La
 * sonda DEVUELVE que tema quedo puesto, para que el control no se pueda falsear solo.
 *
 * ** EL OVERLAY DE LOGIN SE ESCONDE: esta en `CLNK_AV_BLOQUEANTES`, asi que con el puesto NINGUN
 * aviso de CeiboLink se abre y la medicion diria «no sale el cartel» sobre una app que se porta
 * bien. Es el denominador vacio que esta casa documenta.
 *
 *     node scripts/_probe_p12dos.mjs <ruta/index.html>
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
    /* El archivo se LEE ANTES de mandar la cabecera: al reves, un archivo que falta revienta con
       ERR_HTTP_HEADERS_SENT y mata la sonda entera. Lo pago P11 midiendo contra un arbol de
       comparacion que solo tiene el index.html. */
    try {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'') || nom;
      const p = join(raiz, rel);
      if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      const b = await readFile(p);
      rq.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}).end(b);
    } catch { try { rq.writeHead(404).end('no'); } catch {} }
  });
  s.listen(0,'127.0.0.1',()=>res({srv:s,port:s.address().port}));
});

const ANCHOS = [{ w:1440, h:900 }, { w:1280, h:800 }];
const TEMAS  = ['noche', 'dia'];
const MOTORES = [{ n:'chrome', lanzar: () => _pw.chromium.launch({ channel:'chrome' }) },
                 { n:'webkit', lanzar: () => _pw.webkit.launch() }];
const salida = [];
const CUERPO = await readFile(new URL('./_probe_p12dos_cuerpo.js', import.meta.url).pathname, 'utf8');

for (const M of MOTORES) {
  let nav = null;
  try { nav = await M.lanzar(); }
  catch (e) { salida.push({ motor:M.n, errMotor:String(e && e.message || e).slice(0,120) }); continue; }
  for (const V of ANCHOS) {
    for (const tema of TEMAS) {
      const ctx = await nav.newContext({ viewport:{ width:V.w, height:V.h } });
      const pg = await ctx.newPage();
      const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,140)));
      const cons = []; pg.on('console', m => { if (m.type()==='error') cons.push(m.text().slice(0,140)); });
      await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
      await pg.waitForTimeout(2600);
      await pg.evaluate(`(() => {
        try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
        try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
        const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
        const mo = document.getElementById('modalAvisoEco'); if (mo) mo.style.display='none';
        try { localStorage.setItem('ett_theme', ${JSON.stringify(tema === 'dia' ? 'light' : 'dark')}); } catch (e) {}
        try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
      })()`);
      await pg.waitForTimeout(260);
      let o;
      try { o = await pg.evaluate(CUERPO); }
      catch (e) { o = { ERROR: String(e && e.message || e).slice(0,300) }; }
      salida.push(Object.assign({ motor:M.n, ancho:V.w, temaPedido:tema,
                                  errPagina:errs.length, errConsola:cons.length,
                                  errDet: errs.concat(cons).slice(0,3) }, o));
      await ctx.close();
    }
  }
  await nav.close();
}
console.log(JSON.stringify(salida, null, 1));
srv.close();
process.exit(0);
