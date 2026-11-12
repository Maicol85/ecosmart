#!/usr/bin/env node
/**
 * _probe_ec2hueco.mjs - ECO-CONECTOR-2, decision 12f.
 *
 * Mide el alto de CADA tarjeta de Configuracion y el hueco de CADA fila de la grilla, para
 * contestar por que la columna de al lado de CeiboLink quedaba vacia y si hace falta mover algo.
 *
 * LA CAUSA, MEDIDA: `.cfg-grid` es una grilla de DOS columnas con `align-items:start`, asi que
 * la fila se alinea a la tarjeta MAS ALTA y debajo de la mas baja queda el blanco. No es un
 * estiramiento ni un defecto: es lo que hace una grilla con dos tarjetas de altos distintos.
 *
 *     node scripts/_probe_ec2hueco.mjs <ruta/index.html>
 */
/* Mide el alto de CADA tarjeta de Config y el hueco de CADA fila de la grilla, en los dos
   arboles. Un motor y un ancho: el hueco solo existe a dos columnas, y lo que se compara es
   geometria de grilla, que no depende del motor. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { servirConectorFalso } from '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/scripts/_conector_falso.mjs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILE = process.argv[2];
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
const F = await servirConectorFalso({ origenes: 'http://127.0.0.1:' + port });
const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport:{width:1440,height:900} });
const pg = await ctx.newPage();
await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
await pg.waitForTimeout(2600);
const out = await pg.evaluate(`(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
  const lo=document.getElementById('login-overlay'); if (lo) lo.style.display='none';
  window.__clnkBaseTest='http://127.0.0.1:${F.port}';
  window.toast=function(){};
  try { await fetch('http://127.0.0.1:${F.port}/_control',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reset:true,equipos:1})}); } catch(e){}
  try { localStorage.setItem('ett_view_mode','avanzado'); if (typeof applyViewMode==='function') applyViewMode(); } catch (e) {}
  try { localStorage.removeItem('ett_ceibolink_token'); clnkToggle(true); } catch (e) {}
  showTab('config'); if (window.cfgOnShow) cfgOnShow();
  await esp(800);
  const cod=document.getElementById('cfg-clnk-codigo');
  if (cod){ cod.value='${F.codigo}'; cod.dispatchEvent(new Event('input',{bubbles:true})); try{ await clnkVincular(); }catch(e){} }
  await esp(1400);
  const N=s=>String(s==null?'':s).replace(/[\\s\\u00a0]+/g,' ').trim();
  const cs=Array.prototype.slice.call(document.querySelectorAll('#tab-config .cfg-card'))
    .filter(e=>e.getBoundingClientRect().height>0);
  const tar=cs.map(c=>({ tit:N((c.querySelector('.cfg-sec-title')||{}).textContent).slice(0,30),
                         alto:Math.round(c.getBoundingClientRect().height),
                         top:Math.round(c.getBoundingClientRect().top),
                         clnk:c.id==='cfg-card-clnk' }));
  /* Las filas: tarjetas que arrancan a la misma altura. El hueco de la fila es la diferencia
     entre la mas alta y la mas baja. */
  const filas=[];
  tar.forEach(t=>{ const f=filas.find(x=>Math.abs(x.top-t.top)<4);
    if (f) f.items.push(t); else filas.push({top:t.top,items:[t]}); });
  return { n:cs.length, tarjetas:tar, filas: filas.map(f=>({
    titulos:f.items.map(x=>x.tit).join(' + '),
    altos:f.items.map(x=>x.alto).join('/'),
    hueco: f.items.length<2?0:Math.max.apply(null,f.items.map(x=>x.alto))-Math.min.apply(null,f.items.map(x=>x.alto)),
    tieneClnk:f.items.some(x=>x.clnk) })) };
})()`);
console.log(JSON.stringify(out,null,1));
await nav.close(); srv.close(); F.srv.close();
