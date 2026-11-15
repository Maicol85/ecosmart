#!/usr/bin/env node
/**
 * _probe_medir4b.mjs - MEDIR-4b, bloques A, B y C. Chrome y WebKit, los ocho anchos que la orden
 * pide (1500, 1440, 1369, 1368, 1280, 1000, 768 y 390) y los DOS temas REALES, puestos por
 * ett_theme + loadTheme() y DEVUELTOS por la sonda (leccion 8: el tema de esta app no es
 * prefers-color-scheme).
 *
 * ** EL CAMINO ES EL REAL, igual que en la sonda de la tarea 0: el visor se abre con _cineAbrir,
 * la vista B con vistaBAbrir() y un clic sobre la miniatura, y los trazados son
 * mousedown/mousemove/mouseup sobre el canvas de medicion. Lo unico sustituido es el ALMACEN.
 *
 * ** QUE MIDE:
 *   A1  la ventana queda resuelta al abrir la herramienta, y no se puede cambiar con un contorno
 *   A2  la barra de dos pasos, el unico boton Listo, y rehacer una fase sin perder la otra
 *   A3  44 px de alto, azul solo para lo prendido, contraste >= 4,5 en los dos temas, y la barra
 *       de siete botones de cada vista INTACTA
 *   B1  los trazados de las dos vistas conviven y alimentan el biplano; nada nuevo en disco
 *   B2  la calibracion NO se mezcla entre vistas
 *   B3  las decisiones (a) y (b): cerrar descarta y el biplano desaparece; dos ventanas iguales
 *       no dan biplano y cada una queda con su monoplanar
 *   C1  los dos pasos con su tilde en el panel de cada vista
 *   C2  VFD, VFS y FEVI grandes abajo y al medio, con la clasificacion de la app, y la tabla de
 *       tres filas con mL y mL/m2
 *   C3  las notas de metodo DENTRO del globo y YA NO en el panel
 *   C5  con una sola vista, el monoplanar en la franja de abajo
 *   X2  los numeros de la linea base, que esta tanda no puede mover
 *
 *     node scripts/_probe_medir4b.mjs <ruta/index.html>
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

/* Los ocho anchos y los dos temas que la orden pide. Se pueden acotar por entorno para una
   corrida de humo —P4B_ANCHOS, P4B_TEMAS, P4B_MOTORES— sin tocar el archivo: la corrida que se
   informa es la COMPLETA, y acotarla es sólo para validar el cuerpo antes de gastarla. */
const ANCHOS = (process.env.P4B_ANCHOS || '1500,1440,1369,1368,1280,1000,768,390')
  .split(',').map(x => parseInt(x, 10));
const TEMAS = (process.env.P4B_TEMAS || 'noche,dia').split(',');
const _MOT = { chrome: () => _pw.chromium.launch({ channel:'chrome' }), webkit: () => _pw.webkit.launch() };
const MOTORES = (process.env.P4B_MOTORES || 'chrome,webkit').split(',')
  .map(n => ({ n, lanzar: _MOT[n] }));

const CUERPO = await readFile(new URL('./_probe_medir4b_cuerpo.js', import.meta.url), 'utf8');
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
      /* ⚠️ EL TEMA VA POR `ett_theme` Y SE APLICA CON `loadTheme()`, y la sonda DEVUELVE cual
         quedo puesto: el tema de esta app es la clase `light-mode`, no `prefers-color-scheme`,
         asi que el `colorScheme` del contexto de Playwright mide DOS VECES EL MISMO TEMA. Es la
         leccion 8 de la orden y el hallazgo de metodo de PANT-34. */
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
