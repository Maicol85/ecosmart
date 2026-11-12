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
  /* ** EL CUADRO DE RELLENO TIENE QUE PESAR, o la medicion no distingue nada: la primera
     version usaba el JPEG de 22 bytes y los tres envios juntos pesaban 0,2 MB, asi que «la
     lista no materializa los cuadros» se cumplia trivialmente. Se arma un JPEG de ~56 KB
     dibujando ruido en un canvas de 256x256, que es lo que hace incompresible al JPEG. */
  const _cv = document.createElement('canvas'); _cv.width = 256; _cv.height = 256;
  const _cx = _cv.getContext('2d');
  const _id = _cx.createImageData(256, 256);
  for (let i = 0; i < _id.data.length; i += 4) {
    _id.data[i] = (i * 7919) & 255; _id.data[i+1] = (i * 104729) & 255;
    _id.data[i+2] = (i * 1299709) & 255; _id.data[i+3] = 255;
  }
  _cx.putImageData(_id, 0, 0);
  const PX = _cv.toDataURL('image/jpeg', 0.95);
  const J = Uint8Array.from(atob(PX.split(',')[1]), c => c.charCodeAt(0));
  o.cuadroKB = Math.round(J.length / 1024);
  const NC = 260;                        /* 260 cuadros de ~56 KB: 3 envios de ~14 MB cada uno */
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
  await gc(); await gc();
  const baseB = heap();
  o.pasos.push(['5 base antes de listar la bandeja', MB(baseB)]);
  const l = await clnkbListar();
  o.bandejaEnvios = l.length;
  o.bandejaBytesDeclarados = MB(l.reduce((a,x) => a + (x.bytesLoops||0), 0));
  o.pasos.push(['6 LISTADA la bandeja (metadata + thumbs)', MB(heap())]);
  /* El GC ANTES de medir el costo: sin el, el numero incluye las allocaciones transitorias del
     cursor y de IndexedDB, que no son lo que la lista RETIENE. */
  const _lRet = l;
  await gc();
  o.costoListarMB = MB(heap() - baseB);
  o.listaRetieneN = _lRet.length;
  /* Y la pantalla DIBUJADA, que es el gesto del medico. */
  /* ** UN TURNO DEL BUCLE ANTES DE showTab: esa funcion lee el window.event GLOBAL y justo
     despues de una escritura en IndexedDB ese global es el success de la transaccion, cuyo
     target no tiene classList. Es el defecto PREEXISTENTE que PENDIENTES declara en P30-d. */
  await esp(40);
  try { showTab('guardados'); } catch (e) { o.errShowTab = String(e && e.message || e); }
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
  /* ** EL DENOMINADOR: los TRES registros completos a la vez, que es lo que getAll() haria.
     Sin este numero, un costo de listar bajo no prueba nada -- podria ser que los cineloops no
     estuvieran. Se sueltan en el acto. */
  await gc();
  const _baseG = heap();
  let _todos = [];
  for (const id of ids) _todos.push(await clnkbLeer(id));
  o.tresRegistrosMB = MB(heap() - _baseG);
  o.tresRegistrosBytes = MB(_todos.reduce((a2, r2) =>
    a2 + ((r2 && r2.loops && r2.loops[0] && r2.loops[0].datos) ? r2.loops[0].datos.length : 0), 0));
  /* ** LA MEDICION DETERMINISTA, que es la que de verdad prueba la propiedad: el peso de lo
     que la lista DEVUELVE contra el de los registros completos. Los deltas de heap en el rango
     de diez MB quedan dentro del ruido de performance.memory incluso con el recolector forzado
     -- se informan igual, pero lo que no depende del GC es esto. */
  o.pesoListaBytes = JSON.stringify(_lRet).length;
  o.pesoRegistrosBytes = _todos.reduce((a2, r2) =>
    a2 + ((r2 && r2.loops && r2.loops[0] && r2.loops[0].datos) ? r2.loops[0].datos.length : 0), 0);
  o.vecesMasChica = Math.round(o.pesoRegistrosBytes / Math.max(1, o.pesoListaBytes));
  _todos = null;
  await gc();
  o.pasos.push(['8b soltados los tres', MB(heap())]);
  /* Y lo mismo para el indice de la galeria, mas abajo: se guarda el peso del indice. */
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
  await gc();
  o.costoIndiceMB = MB(heap() - baseC);
  o.indiceN = (typeof _igLoopIndice !== 'undefined' && _igLoopIndice) ? _igLoopIndice.length : -1;
  o.pesoIndiceBytes = (typeof _igLoopIndice !== 'undefined' && _igLoopIndice) ? JSON.stringify(_igLoopIndice).length : -1;
  o.cineloopsEnDiscoBytes = NC * J.length * 4;
  o.indiceVecesMasChico = Math.round(o.cineloopsEnDiscoBytes / Math.max(1, o.pesoIndiceBytes));
  try { if (typeof igVistaCambiar === 'function') igVistaCambiar('img'); } catch (e) {}
  /* El filtro se pone por su boton: _igImgFiltro es un let de nivel de script y window no lo
     tiene -- la trampa del ambito lexico. Sin esto la grilla pintaba cero cineloops. */
  try { if (typeof igImgCablear === 'function') igImgCablear(); } catch (e) {}
  const _bt = document.querySelector('[data-ig-imgf="all"]'); if (_bt) _bt.click();
  await esp(200);
  igImgPintar(getInformes());
  const cont = document.getElementById('ig-img-lista');
  if (cont) cont.querySelectorAll('.ig-mes-grupo').forEach(g => { g.classList.remove('cerrado'); igImgLlenarMes(g); });
  await esp(700);
  o.celdasLoop = cont ? [].slice.call(cont.querySelectorAll('.ig-img-th')).filter(b => b.dataset.igCine).length : -1;
  o.pasos.push(['12 GALERIA pintada con sus cineloops', MB(heap())]);
  await gc();
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
