#!/usr/bin/env node
/**
 * _probe_ec2mem.mjs - ECO-CONECTOR-2, la prueba de MEMORIA.
 *
 * Adjunta al estudio la imagen GRANDE del conector falso -un DICOM de ~16 MB, el tamanio del
 * ejemplo que publica el contrato §3.8- y mide el pico del monton de JavaScript en cada paso:
 * antes de bajar, con los bytes en la mano, despues de que entre al slot y despues de soltar la
 * referencia.
 *
 * ** SE MIDE CON `performance.memory` DE CHROME y con el recolector forzado por el protocolo:
 * sin forzarlo, «despues» incluye basura que todavia no se recogio y el numero no dice nada.
 * WebKit no expone esa medida, asi que esta prueba corre SOLO en Chrome y se declara.
 *
 *     node scripts/_probe_ec2mem.mjs [ruta/index.html]
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
const F = await servirConectorFalso({ origenes: 'http://127.0.0.1:' + port });
/* `--enable-precise-memory-info` hace que performance.memory no venga redondeado a 100 MB, que
   es lo que Chrome hace por omision para no filtrar informacion entre sitios. Sin esto, los
   cuatro numeros de esta prueba saldrian iguales. */
const nav = await _pw.chromium.launch({ channel: 'chrome',
  args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'] });
const ctx = await nav.newContext({ viewport:{width:1280,height:900} });
const pg = await ctx.newPage();
await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
await pg.waitForTimeout(2600);
const out = await pg.evaluate(`(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const MB = n => Math.round(n / 1048576 * 10) / 10;
  const heap = () => (performance.memory ? performance.memory.usedJSHeapSize : -1);
  const gc = async () => { try { if (window.gc) window.gc(); } catch (e) {} await esp(500); };
  const o = { pasos: [], precisa: !!(performance.memory && performance.memory.usedJSHeapSize) };
  try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
  window.__clnkBaseTest = 'http://127.0.0.1:${F.port}';
  window.toast = function(){}; window.alert = function(){};
  if (typeof window.clnkAdjuntarAlEstudio !== 'function') { o.err = 'este arbol no tiene el adjuntador'; return o; }
  await fetch('http://127.0.0.1:${F.port}/_control', { method:'POST',
    headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reset:true, equipos:1, escena:'grande' }) });
  try { localStorage.setItem('ett_view_mode','avanzado'); if (typeof applyViewMode==='function') applyViewMode(); } catch (e) {}
  try { localStorage.removeItem('ett_ceibolink_token'); clnkToggle(true); } catch (e) {}
  showTab('config'); if (window.cfgOnShow) cfgOnShow();
  await esp(800);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = '${F.codigo}'; cod.dispatchEvent(new Event('input',{bubbles:true})); await clnkVincular(); }
  await esp(1300);
  o.vinculado = clnkVinculado();
  /* El tamanio que el conector declara, para que el pico se lea CONTRA algo. */
  const lst = await clnkPedir('/v1/imagenes', { conToken:true });
  o.bytesDeclarados = (lst.datos && lst.datos.imagenes && lst.datos.imagenes[0]) ? lst.datos.imagenes[0].bytes : -1;
  try { __t.limpiar(); clnkOlvidarPendientes(); imgVaciar(); } catch (e) {}
  await gc();
  o.pasos.push(['0 antes de bajar', MB(heap())]);
  /* 1 - los bytes en la mano, que es el pico que el canal introduce */
  const r = await clnkPedir('/v1/imagenes/img_g1/archivo', { conToken:true, bytes:true, espera:300000 });
  o.bajo = !!(r.ok && r.datos);
  o.bytesBajados = r.datos ? r.datos.byteLength : -1;
  o.pasos.push(['1 con el DICOM en memoria', MB(heap())]);
  /* 2 - el camino completo, por la puerta unica */
  await mediosImportar([_clnkArchivo(r.datos, 'img_g1.dcm')], undefined, 'ceibolink');
  await esp(2500);
  o.pasos.push(['2 ya importado al slot', MB(heap())]);
  o.slots = imgSlots.filter(s => s && s.dataURL).length;
  o.marcados = imgSlots.filter(s => s && s.origen === 'ceibolink').length;
  /* El dataURL del slot y su original en memoria: es lo que QUEDA retenido por diseno. */
  o.slotKB = imgSlots.filter(s => s && s.dataURL)
    .reduce((n, s) => n + (s.dataURL ? s.dataURL.length : 0) + (s._orig ? s._orig.length : 0), 0);
  o.slotMB = MB(o.slotKB);
  /* 3 - soltando la referencia a los bytes y recolectando */
  await gc();
  o.pasos.push(['3 tras recolectar', MB(heap())]);
  /* 4 - y despues de Nuevo estudio, que vacia los slots */
  try { imgVaciar(); clnkOlvidarPendientes(); } catch (e) {}
  await gc();
  o.pasos.push(['4 tras Nuevo estudio', MB(heap())]);
  o.slotsFinal = imgSlots.filter(s => s && s.dataURL).length;
  /* ** Y LA PREGUNTA QUE IMPORTA: con DOS de 16 MB en el mismo envio, el pico se ACUMULA o el
     camino de a una suelta el buffer de la anterior. Se adjunta por la funcion de verdad, que
     es la que recorre en serie. */
  await fetch('http://127.0.0.1:${F.port}/_control', { method:'POST',
    headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reset:true, equipos:1, escena:'dosGrandes' }) });
  try { __t.limpiar(); clnkOlvidarPendientes(); imgVaciar(); } catch (e) {}
  await gc();
  o.pasos.push(['5 antes de las DOS grandes', MB(heap())]);
  await clnkAdjuntarAlEstudio(['img_g1', 'img_g2']);
  await esp(3500);
  o.pasos.push(['6 con las DOS adjuntadas', MB(heap())]);
  o.slots2 = imgSlots.filter(s => s && s.dataURL).length;
  o.slot2MB = MB(imgSlots.filter(s => s && s.dataURL)
    .reduce((n, s) => n + (s.dataURL ? s.dataURL.length : 0) + (s._orig ? s._orig.length : 0), 0));
  await gc();
  o.pasos.push(['7 tras recolectar', MB(heap())]);
  try { imgVaciar(); clnkOlvidarPendientes(); } catch (e) {}
  await gc();
  o.pasos.push(['8 tras Nuevo estudio', MB(heap())]);
  return o;
})()`);
console.log(JSON.stringify(out, null, 1));
await nav.close(); srv.close(); F.srv.close();
