#!/usr/bin/env node
/**
 * _probe_ec5mem.mjs - ECO-CONECTOR-5, la prueba de MEMORIA. Mide las TRES cosas que la orden pide,
 * mas la razon crudo->guardado con el archivo del medico AL TAMANIO DE VERDAD.
 *
 *  (A) EL PICO DE LA VISTA PREVIA CON TREINTA MINIATURAS. La condicion de la decision 6c es que
 *      dibujar la tira NO materialice los archivos: de a una, primer cuadro, soltar el resto.
 *  (B) ADJUNTAR UN CINELOOP GRANDE DESDE LA GALERIA a otro estudio.
 *  (C) EXPORTAR UNA SELECCION.
 *  (D) LA RAZON CRUDO -> GUARDADO con el multicuadro del medico: 1016x708 en COLOR por 171
 *      cuadros = 351,9 MB de pixeles. De aca sale el numero que el dialogo estima.
 *
 * ** SE MIDE CON performance.memory DE CHROME y con el recolector forzado por el protocolo: sin
 * forzarlo, «despues» incluye basura que todavia no se recogio y el numero no dice nada. WebKit no
 * expone esa medida, asi que esta prueba corre SOLO en Chrome y se declara.
 * ** Y LOS DELTAS EN EL RANGO DE UNOS MB QUEDAN DENTRO DEL RUIDO, asi que lo que esta sonda
 * informa como propiedad son BYTES CONTADOS -- lo que la tira retiene-- y no un delta de monton.
 *
 *     node scripts/_probe_ec5mem.mjs
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
const nav = await _pw.chromium.launch({ channel: 'chrome',
  args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'] });
const pg = await (await nav.newContext({ viewport:{width:1440,height:900} })).newPage();
const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,140)));
await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:180000 });
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
  const ctrl = b => fetch('http://127.0.0.1:${F.port}/_control', { method:'POST',
    headers:{'Content-Type':'application/json'}, body: JSON.stringify(b) }).then(r => r.json());
  if (typeof window.clnkVistaPreviaDe !== 'function') { o.err = 'este arbol no tiene la vista previa'; return o; }
  try { localStorage.setItem('ett_view_mode','avanzado'); if (typeof applyViewMode==='function') applyViewMode(); } catch (e) {}
  try { localStorage.removeItem('ett_ceibolink_token'); clnkToggle(true); } catch (e) {}
  await ctrl({ reset:true, equipos:1, escena:'previaOcho' });
  showTab('config'); if (window.cfgOnShow) cfgOnShow();
  await esp(900);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = '${F.codigo}'; cod.dispatchEvent(new Event('input',{bubbles:true})); await clnkVincular(); }
  await esp(1200);
  o.vinculado = clnkVinculado();
  if (!o.vinculado) { o.err = 'no se pudo vincular'; return o; }
  await gc();
  o.pasos.push(['0 base', MB(heap())]);

  /* ══ (A) LA VISTA PREVIA CON TREINTA MINIATURAS ═════════════════════════════════════════
     La escena da ocho; se repite la lista hasta llegar a treinta filas, que es lo que la orden
     pide medir. Son los MISMOS ocho archivos pedidos varias veces: lo que se mide es el costo de
     la TIRA, no el del conector. */
  const r = await clnkPedir('/v1/imagenes', { conToken:true, espera:8000 });
  const L8 = (r.ok && r.datos && Array.isArray(r.datos.imagenes)) ? r.datos.imagenes : [];
  o.a_lista = L8.length;
  const L30 = [];
  while (L30.length < 30) L30.push(L8[L30.length % L8.length]);
  o.a_filas = L30.length;
  await gc();
  const hA0 = heap();
  clnkVistaPreviaDe(L30, 'Eco de prueba', null);
  for (let i = 0; i < 200; i++) {
    await esp(100);
    const n = document.querySelectorAll('[data-clnk-prev-caja] img').length;
    if (n >= 28) break;
  }
  o.a_miniaturas = document.querySelectorAll('[data-clnk-prev-caja] img').length;
  const hA1 = heap();
  /* LO QUE LA TIRA RETIENE, CONTADO EN BYTES: es la propiedad determinista. */
  let bytes = 0;
  document.querySelectorAll('[data-clnk-prev-caja] img').forEach(im => { bytes += String(im.src || '').length; });
  o.a_bytesRetenidos = bytes;
  o.a_porMiniatura = o.a_miniaturas ? Math.round(bytes / o.a_miniaturas) : 0;
  o.pasos.push(['A con 30 miniaturas', MB(hA1), 'delta ' + MB(hA1 - hA0)]);
  clnkAvisoCerrar();
  await gc();
  o.pasos.push(['A cerrada', MB(heap()), 'delta ' + MB(heap() - hA0)]);
  o.a_vuelve = MB(heap() - hA0);

  /* ══ (B) ADJUNTAR UN CINELOOP GRANDE DESDE LA GALERIA ═══════════════════════════════════ */
  const UA = 'ec5m0000-0000-4000-8000-00000000m001';
  const UB = 'ec5n0000-0000-4000-8000-00000000n002';
  /* ** EL CUADRO VA CON RUIDO Y NO CON UN COLOR PLANO, y no es un detalle: un JPEG de 320x240 de
     un solo color pesa ~1 KB, asi que 120 cuadros daban 0,1 MB -- o sea que «un cineloop grande»
     no era grande y la medicion no decia nada. Con ruido pixel a pixel el JPEG no comprime y cada
     cuadro pesa decenas de KB, que es lo que pesa un cuadro de ecografia de verdad. */
  const cv = document.createElement('canvas'); cv.width = 640; cv.height = 480;
  const cx = cv.getContext('2d');
  const im0 = cx.createImageData(640, 480);
  for (let i = 0; i < im0.data.length; i += 4) {
    const v = (Math.random() * 256) | 0;
    im0.data[i] = v; im0.data[i+1] = v; im0.data[i+2] = v; im0.data[i+3] = 255;
  }
  cx.putImageData(im0, 0, 0);
  const PX = cv.toDataURL('image/jpeg', 0.8);
  const J = Uint8Array.from(atob(PX.split(',')[1]), c => c.charCodeAt(0));
  const NC = 120;                              /* 120 cuadros con ruido: decenas de MB */
  const total = J.length * NC;
  const datos = new Uint8Array(total);
  const offs = new Int32Array(NC);
  for (let i = 0; i < NC; i++) { offs[i] = i * J.length; datos.set(J, i * J.length); }
  const ID = 'cine_ec5_' + Date.now().toString(36);
  await CeiboCine.guardar({ id: ID, uuid: UA, nombre:'loop.dcm', cuadros: NC, tipo:'loop',
    ms:40, cols:640, filas:480, regiones:[], poster: PX, datos: datos, offs: offs,
    bytes: total, ts: new Date().toISOString() });
  await CeiboImg.guardar(UB, [{ dataURL: PX, calidad:'media', origen:'estudio' }], []);
  o.b_cineloopMB = MB(total);
  const infOrig = window.getInformes;
  window.getInformes = () => [{ id:'m1', uuid: UA, nombre:'Paciente M', ci:'1', fecha_estudio:'2026-11-13' },
                              { id:'n1', uuid: UB, nombre:'Paciente N', ci:'2', fecha_estudio:'2026-11-13' }];
  window.imgGuardadoActivo = () => true;
  await gc();
  const hB0 = heap();
  igElegirModo(true);
  igSelToggle({ uuid: UA, idx: -1, n: 0, cineId: ID, video:true, esquema:false, nombre:'loop' });
  const elOrig = window.dstElegirEstudio;
  window.dstElegirEstudio = cb => { cb(getInformes()[1]); return true; };
  await igSelAGuardado();
  await esp(1500);
  window.dstElegirEstudio = elOrig;
  const hB1 = heap();
  o.pasos.push(['B cineloop copiado', MB(hB1), 'delta ' + MB(hB1 - hB0)]);
  const idxB = await CeiboCine.indice();
  o.b_copiado = (idxB || []).filter(x => x.uuid === UB).length === 1;
  o.b_originalQueda = (idxB || []).filter(x => x.uuid === UA).length === 1;
  igElegirModo(false);
  clnkAvisoCerrar();
  await gc();
  o.pasos.push(['B despues', MB(heap()), 'delta ' + MB(heap() - hB0)]);
  o.b_vuelve = MB(heap() - hB0);

  /* ══ (C) EXPORTAR UNA SELECCION ════════════════════════════════════════════════════════ */
  const clickOrig = HTMLAnchorElement.prototype.click;
  let tam = 0;
  HTMLAnchorElement.prototype.click = function () { if (this.download) { o.c_nombre = this.download; return; } return clickOrig.apply(this, arguments); };
  await gc();
  const hC0 = heap();
  igElegirModo(true);
  igSelToggle({ uuid: UB, idx: 0, n: 1, cineId:'', video:false, esquema:false, nombre:'' });
  igSelToggle({ uuid: UB, idx: -1, n: 0, cineId: (idxB || []).filter(x => x.uuid === UB)[0].id,
                video:true, esquema:false, nombre:'loop' });
  const pe = igSelExportar();
  for (let i = 0; i < 60; i++) { await esp(100); const m = document.getElementById('clnkav-b1');
    if (m && m.style.display !== 'none' && (m.textContent||'').indexOf('Exportar') > -1) { m.click(); break; } }
  o.c_ok = await pe;
  await esp(600);
  const hC1 = heap();
  o.pasos.push(['C exportada', MB(hC1), 'delta ' + MB(hC1 - hC0)]);
  HTMLAnchorElement.prototype.click = clickOrig;
  igElegirModo(false); clnkAvisoCerrar();
  await gc();
  o.c_antesDeRevocar = MB(heap() - hC0);
  /* ** SE ESPERAN MAS DE CUATRO SEGUNDOS A PROPOSITO: el exportador revoca la URL del objeto en un
     setTimeout de 4 s -- el mismo que usa el backup de siempre--, asi que medir antes de eso
     informa el Blob todavia vivo como si fuera una fuga. Es lo que paso en la primera corrida:
     21,8 MB retenidos que son el archivo esperando su revocacion. */
  await esp(4600);
  await gc();
  o.pasos.push(['C despues de revocar', MB(heap()), 'delta ' + MB(heap() - hC0)]);
  o.c_vuelve = MB(heap() - hC0);
  window.getInformes = infOrig;
  try { await CeiboCine.borrar(ID); } catch (e) {}
  try { for (const x of (await CeiboCine.indice())) if (x.uuid === UB) await CeiboCine.borrar(x.id); } catch (e) {}
  try { await CeiboImg.borrar(UA); await CeiboImg.borrar(UB); } catch (e) {}

  /* ══ (D) LA RAZON CRUDO -> GUARDADO, CON EL ARCHIVO DEL MEDICO AL TAMANIO DE VERDAD ════ */
  window.__dcmCrudoMaxTest = 2048 * 1024 * 1024;
  window.__dcmCrudoDuroTest = 4096 * 1024 * 1024;
  await ctrl({ reset:true, equipos:1, escena:'nativoEnorme' });
  await gc();
  const hD0 = heap();
  const t0 = Date.now();
  const rE = await clnkPedir('/v1/imagenes/img_pe/archivo', { conToken:true, bytes:true, espera:300000 });
  o.d_bajadoMB = (rE.ok && rE.datos) ? MB(rE.datos.byteLength) : -1;
  const hD1 = heap();
  const dE = _dcmImgLeer(rE.datos);
  o.d_crudoMB = MB(_dcmCrudoBytes(dE));
  o.d_cuadros = Math.max(1, dE.nFrames | 0);
  const cr = await _dcmCrudoAFrags(dE, { nombre:'enorme.dcm', origen:'ceibolink' });
  const hD2 = heap();
  o.d_ok = !!(cr && cr.ok);
  o.d_jpegMB = (dE.frags || []).length ? MB(dE.frags.reduce((a,x)=>a+x.length,0)) : -1;
  o.d_razonReal = (o.d_jpegMB > 0) ? Math.round(o.d_crudoMB / o.d_jpegMB * 100) / 100 : -1;
  o.d_estimadoMB = MB(_dcmGuardadoEstimado(_dcmCrudoBytes(dE)));
  o.d_segundos = Math.round((Date.now() - t0) / 100) / 10;
  o.pasos.push(['D bajado', MB(hD1)]);
  o.pasos.push(['D convertido', MB(hD2), 'pico sobre la base ' + MB(hD2 - hD0)]);
  o.d_picoMB = MB(hD2 - hD0);
  o.d_factorPicoReal = (o.d_crudoMB > 0) ? Math.round((hD2 - hD0) / 1048576 / o.d_crudoMB * 100) / 100 : -1;
  return o;
})()`);
await nav.close(); srv.close(); F.srv.close();
console.log(JSON.stringify(out, null, 1));
console.log('errores de pagina: ' + (errs.length ? errs.join(' | ') : 'CERO'));
