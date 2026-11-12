#!/usr/bin/env node
/**
 * _probe_ec4mem.mjs - ECO-CONECTOR-4, la prueba de MEMORIA.
 *
 * Mide TRES cosas que la orden pide, en este orden:
 *
 *  (A) EL PICO REAL DE ABRIR EL MULTICUADRO DEL MEDICO. El archivo que recibio declaraba
 *      1016x708 por 171 cuadros = 351,9 MB de pixeles crudos. Se baja de verdad por loopback y
 *      se convierte por el camino de la app, con el tope de prueba levantado para que la
 *      pregunta no corte la medicion. De aca sale el numero que justifica el tope duro.
 *  (B) EL COSTO DE ARMAR LAS MINIATURAS DE LA BANDEJA. La condicion que la orden pone es que
 *      dibujar la grilla NO materialice un cineloop entero: se mide el monton antes y despues
 *      de listar una bandeja con cineloops de verdad.
 *  (C) EL COSTO DE LA GALERIA DE «Imagenes guardadas» con varios cineloops guardados.
 *
 * ** SE MIDE CON `performance.memory` DE CHROME y con el recolector forzado por el protocolo:
 * sin forzarlo, «despues» incluye basura que todavia no se recogio y el numero no dice nada.
 * WebKit no expone esa medida, asi que esta prueba corre SOLO en Chrome y se declara.
 *
 *     node scripts/_probe_ec4mem.mjs [ruta/index.html]
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
  const gc = async () => { try { if (window.gc) window.gc(); } catch (e) {} await esp(600); };
  const o = { pasos: [], precisa: !!(performance.memory && performance.memory.usedJSHeapSize) };
  try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
  window.__clnkBaseTest = 'http://127.0.0.1:${F.port}';
  window.toast = function(){}; window.alert = function(){}; window.confirm = function(){ return true; };
  if (typeof window._dcmCrudoTope !== 'function') {
    o.err = 'este arbol no tiene los topes de ECO-CONECTOR-4'; return o;
  }
  const ctrl = b => fetch('http://127.0.0.1:${F.port}/_control', { method:'POST',
    headers:{'Content-Type':'application/json'}, body: JSON.stringify(b) }).then(r => r.json());
  try { localStorage.setItem('ett_view_mode','avanzado'); if (typeof applyViewMode==='function') applyViewMode(); } catch (e) {}
  try { localStorage.removeItem('ett_ceibolink_token'); clnkToggle(true); } catch (e) {}
  await ctrl({ reset:true, equipos:1, escena:'nativoEnorme' });
  showTab('config'); if (window.cfgOnShow) cfgOnShow();
  await esp(900);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = '${F.codigo}'; cod.dispatchEvent(new Event('input',{bubbles:true})); await clnkVincular(); }
  await esp(1400);
  o.vinculado = clnkVinculado();
  try { for (const x of (await clnkbListar())) await clnkbBorrar(x.id); } catch (e) {}
  try { clnkOlvidarPendientes(); imgVaciar(); while (_cineHayPendientes()) _cineSacarPendiente(0); } catch (e) {}
  await gc();
  o.pasos.push(['0 base, antes de nada', MB(heap())]);

  /* ══ (A) EL MULTICUADRO DEL MEDICO, AL TAMANO DE VERDAD ═══════════════════════════════
     Se levanta el tope de prueba por ENCIMA del archivo para que la pregunta no corte: lo que
     se quiere medir es cuanto cuesta ABRIRLO, no si se pregunta -- eso lo miden TC-865 y 866. */
  window.__dcmCrudoMaxTest = 2048 * 1024 * 1024;
  window.__dcmCrudoDuroTest = 4096 * 1024 * 1024;
  const t0 = Date.now();
  const r = await clnkPedir('/v1/imagenes/img_pe/archivo', { conToken:true, bytes:true, espera:300000 });
  o.bajoBytes = (r.ok && r.datos) ? r.datos.byteLength : -1;
  o.bajoMB = MB(o.bajoBytes);
  o.pasos.push(['1 el archivo BAJADO, en la mano', MB(heap())]);
  let d = null;
  try { d = _dcmImgLeer(r.datos); } catch (e) { o.errLeer = String(e && e.message || e); }
  o.declaraMB = d ? MB(_dcmCrudoBytes(d)) : -1;
  o.cuadrosDeclarados = d ? d.nFrames : -1;
  o.pasos.push(['2 leido el dataset (pixeles crudos apuntados)', MB(heap())]);
  let pico = heap();
  const vigilar = setInterval(() => { const h = heap(); if (h > pico) pico = h; }, 120);
  let cr = null;
  try { cr = await _dcmCrudoAFrags(d, { nombre:'enorme.dcm', origen:'ceibolink' }); }
  catch (e) { o.errConv = String(e && e.message || e).slice(0, 160); }
  clearInterval(vigilar);
  o.convirtio = !!(cr && cr.ok);
  o.errConversion = (cr && cr.err) || '';
  o.cuadrosProducidos = d && d.frags ? d.frags.length : -1;
  o.picoConversionMB = MB(pico);
  o.segundos = Math.round((Date.now() - t0) / 100) / 10;
  o.pasos.push(['3 CONVERTIDO (pico arriba)', MB(heap())]);
  /* Lo que queda vivo son los cuadros ya comprimidos; los pixeles crudos se soltaron. */
  o.soltoCrudo = d ? !d.crudo : null;
  o.fragsMB = (d && d.frags) ? MB(d.frags.reduce((a,f) => a + f.length, 0)) : -1;
  d = null; cr = null;
  await gc();
  o.pasos.push(['4 soltado todo y recolectado', MB(heap())]);

  /* ══ (B) LAS MINIATURAS DE LA BANDEJA ════════════════════════════════════════════════
     Una bandeja con TRES envios de un cineloop de verdad cada uno. La condicion es que
     listarlos -que es lo que dibuja la grilla- no traiga los cuadros. */
  const J = new Uint8Array([255,216,255,224,0,16,74,70,73,70,0,1,1,1,0,96,0,96,0,0,255,217]);
  const PX = 'data:image/jpeg;base64,' + btoa(String.fromCharCode.apply(null, J));
  const NC = 3000;                       /* ~66 KB por cuadro de relleno: 3 envios de ~2 MB */
  const ids = [];
  for (let k = 0; k < 3; k++) {
    const total = J.length * NC;
    const datos = new Uint8Array(total);
    const offs = new Int32Array(NC);
    for (let i = 0; i < NC; i++) { offs[i] = i * J.length; datos.set(J, i * J.length); }
    const id = 'clnkb_mem_' + k + '_' + Date.now().toString(36);
    ids.push(id);
    await clnkbGuardar({ id: id, origen:'ceibolink', equipo:'Eco de prueba',
      recibida: new Date().toISOString(), ts: new Date().toISOString(),
      imgs: [{ dataURL: PX, thumb: PX, clnkId:'' }],
      loops: [{ nombre:'loop.dcm', cuadros:NC, ms:40, cols:1, filas:1, poster: PX,
                datos: datos, offs: offs, bytes: total, clnkId:'' }] });
  }
  await gc();
  const baseB = heap();
  o.pasos.push(['5 base antes de listar la bandeja', MB(baseB)]);
  const l = await clnkbListar();
  o.bandejaEnvios = l.length;
  o.bandejaBytesDeclarados = MB(l.reduce((a,x) => a + (x.bytesLoops||0), 0));
  o.pasos.push(['6 LISTADA la bandeja (metadata + thumbs)', MB(heap())]);
  o.costoListarMB = MB(heap() - baseB);
  /* Y la pantalla DIBUJADA, que es el gesto del medico. */
  showTab('guardados');
  await igBandejaRender();
  await esp(500);
  o.pasos.push(['7 DIBUJADA la fila de miniaturas', MB(heap())]);
  o.costoDibujarMB = MB(heap() - baseB);
  const lis = document.getElementById('ig-bandeja-lista');
  o.miniaturas = lis ? lis.querySelectorAll('button[aria-label]').length : -1;
  /* El denominador: leer UN registro completo SI trae los megas. Sin esto, un costo bajo no
     prueba nada -- podria ser que los cineloops no estuvieran. */
  const uno = await clnkbLeer(ids[0]);
  o.registroCompletoMB = uno && uno.loops && uno.loops[0] ? MB(uno.loops[0].datos.length) : -1;
  o.pasos.push(['8 con UN registro completo en la mano', MB(heap())]);
  for (const id of ids) { try { await clnkbBorrar(id); } catch (e) {} }
  await gc();
  o.pasos.push(['9 borrada la bandeja', MB(heap())]);

  /* ══ (C) LA GALERIA DE «Imagenes guardadas» CON VARIOS CINELOOPS ═════════════════════ */
  const uuids = [];
  for (let k = 0; k < 4; k++) {
    const total = J.length * NC;
    const datos = new Uint8Array(total);
    const offs = new Int32Array(NC);
    for (let i = 0; i < NC; i++) { offs[i] = i * J.length; datos.set(J, i * J.length); }
    const u = 'ec4f0000-0000-4000-8000-00000000' + String(1000 + k);
    uuids.push(u);
    await CeiboCine.guardar({ id:'cine_mem_' + k, uuid:u, nombre:'loop.dcm', cuadros:NC,
      tipo:'loop', ms:40, cols:8, filas:8, regiones:[], poster:PX, datos:datos, offs:offs,
      bytes: total, ts: new Date().toISOString() });
  }
  window.getInformes = () => uuids.map((u,k) => ({ id:'m'+k, uuid:u, nombre:'Paciente '+k,
                                                   ci:'0', fecha_estudio:'2026-11-12' }));
  igImgInvalidar();
  await gc();
  const baseC = heap();
  o.pasos.push(['10 base antes de la galeria', MB(baseC)]);
  await igImgIndiceCargar();
  o.pasos.push(['11 INDICE de la galeria cargado', MB(heap())]);
  o.costoIndiceMB = MB(heap() - baseC);
  if (typeof igVistaCambiar === 'function') igVistaCambiar('img');
  igImgPintar(getInformes());
  const cont = document.getElementById('ig-img-lista');
  if (cont) cont.querySelectorAll('.ig-mes-grupo').forEach(g => { g.classList.remove('cerrado'); igImgLlenarMes(g); });
  await esp(700);
  o.celdasLoop = cont ? [].slice.call(cont.querySelectorAll('.ig-img-th')).filter(b => b.dataset.igCine).length : -1;
  o.pasos.push(['12 GALERIA pintada con sus cineloops', MB(heap())]);
  o.costoGaleriaMB = MB(heap() - baseC);
  /* El denominador otra vez: los cuatro cineloops juntos pesan esto en disco. */
  o.cineloopsEnDiscoMB = MB(NC * J.length * 4);
  for (let k = 0; k < 4; k++) { try { await CeiboCine.borrar('cine_mem_' + k); } catch (e) {} }
  igImgInvalidar();
  await gc();
  o.pasos.push(['13 limpio', MB(heap())]);
  return o;
})()`);
console.log(JSON.stringify(out, null, 1));
await nav.close(); srv.close(); F.srv.close();
