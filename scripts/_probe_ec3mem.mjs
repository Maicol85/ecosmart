#!/usr/bin/env node
/**
 * _probe_ec3mem.mjs - ECO-CONECTOR-3, la prueba de MEMORIA.
 *
 * Mide el pico del monton de JavaScript con el caso NUEVO de esta tanda: un MULTICUADRO SIN
 * COMPRIMIR de 512x512 por 60 cuadros -15 MB de pixeles crudos, que ademas hay que DIBUJAR cuadro
 * por cuadro y codificar a JPEG-, adjuntado (1) al estudio abierto y (2) a la bandeja con el
 * cineloop ENTERO. Los dos caminos que esta tanda abrio y que mueven decenas de MB.
 *
 * ** SE MIDE CON `performance.memory` DE CHROME y con el recolector forzado por el protocolo:
 * sin forzarlo, «despues» incluye basura que todavia no se recogio y el numero no dice nada.
 * WebKit no expone esa medida, asi que esta prueba corre SOLO en Chrome y se declara.
 *
 *     node scripts/_probe_ec3mem.mjs [ruta/index.html]
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
   numeros de esta prueba saldrian todos iguales. */
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
  window.toast = function(){}; window.alert = function(){}; window.confirm = function(){ return true; };
  if (typeof window.dstAlActual !== 'function' || typeof window.dstABandeja !== 'function') {
    o.err = 'este arbol no tiene los sumideros de ECO-CONECTOR-3'; return o;
  }
  const ctrl = b => fetch('http://127.0.0.1:${F.port}/_control', { method:'POST',
    headers:{'Content-Type':'application/json'}, body: JSON.stringify(b) }).then(r => r.json());
  await ctrl({ reset:true, equipos:1, escena:'nativoGrande' });
  try { localStorage.setItem('ett_view_mode','avanzado'); if (typeof applyViewMode==='function') applyViewMode(); } catch (e) {}
  try { localStorage.removeItem('ett_ceibolink_token'); clnkToggle(true); } catch (e) {}
  showTab('config'); if (window.cfgOnShow) cfgOnShow();
  await esp(800);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = '${F.codigo}'; cod.dispatchEvent(new Event('input',{bubbles:true})); await clnkVincular(); }
  await esp(1300);
  o.vinculado = clnkVinculado();
  const lst = await clnkPedir('/v1/imagenes', { conToken:true });
  o.bytesDeclarados = (lst.datos && lst.datos.imagenes && lst.datos.imagenes[0]) ? lst.datos.imagenes[0].bytes : -1;
  /* La BANDEJA vacia y los slots vacios: el denominador de los dos caminos. */
  try { for (const x of (await clnkbListar())) await clnkbBorrar(x.id); } catch (e) {}
  try { clnkOlvidarPendientes(); imgVaciar(); while (_cineHayPendientes()) _cineSacarPendiente(0); } catch (e) {}
  await gc();
  o.pasos.push(['0 antes de nada', MB(heap())]);

  /* ══ (A) AL ESTUDIO ABIERTO: el multicuadro sin comprimir, por la puerta unica ══════════ */
  await dstAlActual({ origen:'ceibolink', items: clnkItems(['img_ng']) });
  await esp(3500);
  o.pasos.push(['1 adjuntado al estudio', MB(heap())]);
  o.colaA = (typeof _cineHayPendientes === 'function') ? _cineHayPendientes() : null;
  o.slotsA = imgSlots.filter(s => s && s.dataURL).length;
  try { cineCerrar(); } catch (e) {}
  await gc();
  o.pasos.push(['2 cerrado el visor y recolectado', MB(heap())]);
  /* Lo que queda RETENIDO por la cola: los cuadros JPEG del cineloop encolado. */
  o.colaMB = (function () {
    try {
      let n = 0;
      /* ** POR SU NOMBRE PELADO Y NO POR window: _cinePendientes es un let de nivel de script,
         asi que vive en el ambito lexico global y window NO lo tiene. La primera version de esta
         sonda leia window._cinePendientes, recibia undefined y publicaba 0 MB retenidos sobre una
         cola que SI tenia el cineloop -- la misma trampa que _cm3d ya documenta. */
      (_cinePendientes || []).forEach(p => (p.loop.d.frags || []).forEach(f => { n += f.length; }));
      return MB(n);
    } catch (e) { return -1; }
  })();
  try { imgVaciar(); clnkOlvidarPendientes(); while (_cineHayPendientes()) _cineSacarPendiente(0); } catch (e) {}
  await gc();
  o.pasos.push(['3 tras Nuevo estudio', MB(heap())]);

  /* ══ (B) A LA BANDEJA: el cineloop ENTERO, que es lo que esta tanda cambio ══════════════ */
  await ctrl({ reset:true, equipos:1, escena:'nativoGrande' });
  await gc();
  o.pasos.push(['4 antes de la bandeja', MB(heap())]);
  await dstABandeja({ origen:'ceibolink', equipo:'eq_3f8a1c', items: clnkItems(['img_ng']) });
  await esp(3000);
  o.pasos.push(['5 guardado en la bandeja', MB(heap())]);
  const l = await clnkbListar();
  o.bandejaEnvios = l.length;
  o.bandejaLoops = l.length ? l[0].nLoops : -1;
  o.bandejaMB = l.length ? MB(l[0].bytesLoops) : -1;
  o.bandejaCuadros = l.length ? (l[0].cuadros || []).join(',') : '';
  await gc();
  o.pasos.push(['6 tras recolectar', MB(heap())]);
  /* Y los bytes NO quedan en memoria: viven en IndexedDB. Se mide leyendo el registro, que es
     el unico momento en que vuelven al monton. */
  const reg = l.length ? await clnkbLeer(l[0].id) : null;
  o.regLeidoMB = reg && reg.loops && reg.loops[0] ? MB(reg.loops[0].datos.length) : -1;
  o.pasos.push(['7 con el registro LEIDO en la mano', MB(heap())]);
  try { for (const x of l) await clnkbBorrar(x.id); } catch (e) {}
  await gc();
  o.pasos.push(['8 borrada la bandeja', MB(heap())]);
  return o;
})()`);
console.log(JSON.stringify(out, null, 1));
await nav.close(); srv.close(); F.srv.close();
