#!/usr/bin/env node
/**
 * _probe_ec3censo.mjs - ECO-CONECTOR-3, el CENSO del Excel y de los campos.
 *
 * Cuenta, EN EL NAVEGADOR, las claves del mapa del Excel del Laboratorio y los campos que viajan
 * dentro de cada estudio -los que `guardarInforme` recorre, con las DOS listas de exclusion
 * aplicadas-, mas los ids nuevos y los controles de la tanda. Se corre en los DOS arboles y se
 * comparan los numeros: es la unica forma de afirmar «Excel y campos identicos».
 *
 * ** SE CUENTA EN EL NAVEGADOR Y NO POR GREP, por el mismo motivo que esta casa ya escribio tres
 * veces: un grep sobre el archivo cuenta tambien lo que esta en un comentario o en una cadena.
 *
 *     node scripts/_probe_ec3censo.mjs [ruta/index.html]
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { servirConectorFalso } from './_conector_falso.mjs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILE = process.argv[2] || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
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
const pg = await ctx.newPage();
await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
await pg.waitForTimeout(2600);
const out = await pg.evaluate(`(async () => {
  const o = {};
  try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
  try { localStorage.setItem('ett_view_mode','avanzado'); if (typeof applyViewMode==='function') applyViewMode(); } catch (e) {}
  /* TODAS las pestanias y TODAS las secciones abiertas: lo que esta en display:none existe en el
     DOM igual -el censo recorre el documento, no la geometria- pero abrir no cuesta nada y cierra
     la unica duda. */
  try { ['datos','imagenes','valvulas','config','guardados','refs'].forEach(t => { try { showTab(t); } catch (e) {} }); } catch (e) {}
  o.excel = (typeof LAB_XLS_MAP !== 'undefined') ? Object.keys(LAB_XLS_MAP).length : -1;
  /* Los campos que VIAJAN dentro de un estudio: la misma lista que recorre guardarInforme, con
     las dos exclusiones aplicadas. */
  const todos = Array.prototype.slice.call(document.querySelectorAll('input[id],select[id],textarea[id]'));
  o.conId = todos.length;
  o.delEstudio = todos.filter(e => {
    if (e.type === 'file' || e.type === 'button' || e.type === 'submit' || e.type === 'search') return false;
    try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return false; } catch (x) {}
    try { if (typeof _CAMPOS_FUERA_DEL_ESTUDIO !== 'undefined' && _CAMPOS_FUERA_DEL_ESTUDIO.test(e.id)) return false; } catch (x) {}
    return true;
  }).length;
  /* Y los cuatro ids de esta tanda, uno por uno: ninguno es un campo. */
  o.idsTanda = ['clnkav-b4','ig-bandeja','ig-bandeja-cnt','ig-bandeja-lista']
    .map(id => { const e = document.getElementById(id); return id + ':' + (e ? e.tagName : 'NO'); }).join(' ');
  /* El selector de estudio guardado: su campo NO lleva id, que es lo que lo deja fuera del censo.
     Se abre y se vuelve a contar. */
  o.antesSelector = o.conId;
  try { if (typeof dstElegirEstudio === 'function') { dstElegirEstudio(function(){}); } } catch (e) {}
  await new Promise(r => setTimeout(r, 200));
  o.conIdTrasSelector = document.querySelectorAll('input[id],select[id],textarea[id]').length;
  o.camposDelSelector = (function(){ const ov = document.getElementById('dst-elegir-ov');
    return ov ? ov.querySelectorAll('input,select,textarea').length + '/' +
                ov.querySelectorAll('input[id],select[id],textarea[id]').length : 'NO'; })();
  try { if (typeof dstElegirCerrar === 'function') dstElegirCerrar(); } catch (e) {}
  return o;
})()`);
console.log(JSON.stringify(out, null, 1));
await nav.close(); srv.close(); F.srv.close();
