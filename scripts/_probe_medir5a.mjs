#!/usr/bin/env node
/**
 * _probe_medir5a.mjs — MEDIR-5, PARTE A. Diagnostico de los diez hallazgos del medico, medido en
 * Chrome y en WebKit, en los anchos que importan y en los DOS temas REALES (puestos por
 * ett_theme + loadTheme() y DEVUELTOS por la sonda: el tema de esta app es la clase light-mode y
 * no prefers-color-scheme — leccion de PANT-34).
 *
 * ** EL CAMINO ES EL REAL: el visor se abre con _cineAbrir, la vista B con vistaBAbrir() y un
 * clic en la miniatura. Lo unico sembrado son los INSUMOS del Simpson (_simpAceptar), porque el
 * raton sobre un canvas angosto da coordenadas degeneradas — el hallazgo de TC-897.
 *
 * ** QUE MIDE (uno por hallazgo):
 *   A1  en que ranura cae cada cajon con dos vistas y herramientas distintas en cada una
 *   A2  que queda vivo tras Limpiar, y si aparece la tabla GUARDADA de la biblioteca
 *   A3  si la fila de botones queda tapada o fuera de vista al aparecer el resultado
 *   A4  la barra del video: visible, dentro del modal, y sus botones habilitados
 *   A5  si la tabla chica sale al terminar la diastole o solo al terminar la sistole
 *   A6  cuantos globos ⓘ de metodo hay y donde
 *   A7  el ancho y la posicion del cartel de Ventana, y si tapa la tabla
 *   A8  si el FAC del VD pierde la diastole al mover el cuadro
 *   A9  si los carteles de Diastole/Sistole y la barra del Simpson se ven en Doppler
 *   A10 los cortes de ancho que existen hoy (se lee del CSS, no se adivina)
 *
 *     node scripts/_probe_medir5a.mjs <ruta/ABSOLUTA/index.html>
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
      rq.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}).end(await readFile(p));
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0,'127.0.0.1',()=>res({srv:s,port:s.address().port}));
});

/* Se pueden acotar por entorno para validar el cuerpo antes de gastar la corrida completa; la
   que se informa es la COMPLETA. */
const ANCHOS = (process.env.P5_ANCHOS || '1500,1440,1369,1280,1000,390')
  .split(',').map(x => parseInt(x, 10));
const TEMAS = (process.env.P5_TEMAS || 'noche,dia').split(',');
const _MOT = { chrome: () => _pw.chromium.launch({ channel:'chrome' }), webkit: () => _pw.webkit.launch() };
const MOTORES = (process.env.P5_MOTORES || 'chrome,webkit').split(',')
  .map(n => ({ n, lanzar: _MOT[n] }));

const CUERPO = await readFile(new URL('./_probe_medir5a_cuerpo.js', import.meta.url), 'utf8');
const salida = [];

for (const M of MOTORES) {
  let nav = null;
  try { nav = await M.lanzar(); }
  catch (e) { salida.push({ motor:M.n, errMotor:String(e && e.message || e).slice(0,140) }); continue; }
  for (const W of ANCHOS) {
    for (const T of TEMAS) {
      const ctx = await nav.newContext({ viewport:{ width:W, height:900 } });
      const pg = await ctx.newPage();
      const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,160)));
      const cons = []; pg.on('console', m => { if (m.type()==='error') cons.push(m.text().slice(0,160)); });
      const dlg = []; pg.on('dialog', d => { dlg.push(d.message().slice(0,160)); d.accept(); });
      await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
      await pg.waitForTimeout(2500);
      await pg.evaluate(`(() => {
        try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
        try { localStorage.setItem('ett_theme', ${JSON.stringify(T === 'dia' ? 'light' : 'dark')}); } catch (e) {}
        try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
        try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
        const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
      })()`);
      await pg.waitForTimeout(250);
      let o = null;
      try { o = await pg.evaluate(CUERPO); }
      catch (e) { o = { errEval: String(e && e.message || e).slice(0, 300) }; }
      salida.push({ motor:M.n, ancho:W, tema:T, o, pageErrors:errs, consoleErrors:cons, dialogos:dlg });
      await ctx.close();
    }
  }
  await nav.close();
}
srv.close();
console.log(JSON.stringify(salida, null, 1));
