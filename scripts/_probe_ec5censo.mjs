#!/usr/bin/env node
/**
 * _probe_ec5censo.mjs - ECO-CONECTOR-5: el censo del Excel y de los campos del estudio, medido EN
 * EL NAVEGADOR en los DOS arboles.
 *
 * ** LLEVA SU DETECTOR DE QUE SON DOS ARBOLES, y no es por las dudas: la ruta por omision de una
 * sonda es la del arbol real, asi que correrla DESDE un worktree no alcanza -- los numeros salen
 * identicos, que es justo lo que la prueba queria afirmar, y nadie lo nota. Es el defecto que
 * PANT-37 pago con _probe_ec2dos.mjs. El campo `tieneLoNuevo` dice si el arbol medido trae las
 * funciones de esta tanda; en el arbol base tiene que decir NO.
 *
 *     node scripts/_probe_ec5censo.mjs <ruta/index.html>
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
const nav = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await (await nav.newContext({ viewport:{width:1440,height:900} })).newPage();
const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,120)));
await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
await pg.waitForTimeout(2600);
const out = await pg.evaluate(`(() => {
  const o = {};
  try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
  /* EL DETECTOR DE QUE SON DOS ARBOLES */
  o.tieneLoNuevo = (typeof window.clnkVistaPrevia === 'function') &&
                   (typeof window.igSelEliminar === 'function') &&
                   (typeof CeiboImg.quitar === 'function');
  o.sello = (document.getElementById('eco-build-sello') || {}).textContent || '';
  /* EL EXCEL DEL LABORATORIO */
  try { o.labXlsMap = Object.keys(LAB_XLS_MAP).length; } catch (e) { o.labXlsMap = -1; }
  /* LOS CAMPOS QUE VIAJAN DENTRO DE UN ESTUDIO Y LAS COLUMNAS DEL EXCEL, por sus DUEÑOS: el
     mismo barrido que usan los A/B de esta casa -- los input con id que no estan fuera del
     estudio-- y _labExcelRow, que es quien emite la fila. */
  const campos = {};
  try {
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(e => {
      if (!e.id) return;
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      if (e.type === 'button' || e.type === 'submit' || e.type === 'file') return;
      campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    });
  } catch (e) {}
  o.camposGuardados = Object.keys(campos).length;
  try {
    const fila = (typeof _labExcelRow === 'function') ? _labExcelRow({ campos: campos, fecha: '2026-11-13' }) : null;
    o.excelCols = fila ? Object.keys(fila).length : -1;
  } catch (e) { o.excelCols = -1; }
  /* LOS CONTROLES CON id Y LOS QUE ENTRAN AL CENSO DEL ESTUDIO */
  const ctl = Array.prototype.slice.call(document.querySelectorAll('input[id],select[id],textarea[id]'));
  o.conId = ctl.length;
  let n = 0;
  ctl.forEach(e => {
    try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return; } catch (x) {}
    if (e.type === 'button' || e.type === 'submit' || e.type === 'file') return;
    n++;
  });
  o.delEstudio = n;
  return o;
})()`);
await nav.close(); srv.close();
console.log(JSON.stringify(out));
console.log('errores de pagina: ' + (errs.length ? errs.join(' | ') : 'CERO'));
