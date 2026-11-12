#!/usr/bin/env node
/**
 * _probe_ec5base.mjs - ECO-CONECTOR-5, TAREA 0: las siete mediciones de linea base.
 *
 * Solo LEE. No escribe en index.html y no toca ningun archivo del proyecto.
 *
 *  (1) navigator.deviceMemory en el Chrome de la bateria: existe y que devuelve.
 *  (2) La relacion entre el peso SIN COMPRIMIR de un multicuadro sintetico y lo que ocupa
 *      guardado (los JPEG de sus cuadros), mas lo mismo para una fija.
 *  (3) El costo en memoria de armar 6 y 30 miniaturas con el metodo de la decision 6c:
 *      bajar de a una, sacar el primer cuadro reducido, soltar el resto.
 *  (4) Que metodos tiene CeiboImg, para saber si hay forma de borrar UN slot.
 *  (5) El formato y el tamano de exportar un subconjunto con el mecanismo del backup.
 *  (6) Si la galeria ya tiene un modo elegir (el del PPT) sin duplicar el marcado.
 *  (7) Si un estudio guardado depende de sus imagenes para algo mas que mostrarlas.
 *
 *     node scripts/_probe_ec5base.mjs [ruta/index.html]
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
const ctx = await nav.newContext({ viewport:{width:1280,height:900} });
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e && e.message || e).slice(0,160)));
await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
await pg.waitForTimeout(2600);
const out = await pg.evaluate(`(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const MB = n => Math.round(n / 1048576 * 100) / 100;
  const heap = () => (performance.memory ? performance.memory.usedJSHeapSize : -1);
  const gc = async () => { try { if (window.gc) window.gc(); } catch (e) {} await esp(600); };
  const o = {};
  try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
  window.__clnkBaseTest = 'http://127.0.0.1:${F.port}';
  window.toast = function(){}; window.alert = function(){}; window.confirm = function(){ return true; };
  const CTRL = async b => { const r = await fetch('http://127.0.0.1:${F.port}/_control',
      { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(b) });
    return r.json(); };
  /* La vinculacion va por el flujo REAL, con el codigo en su campo: el token es de EcoSmart y
     no del escenario, asi que vinculado:true del falso no alcanza -- lo pago la primera
     corrida de esta sonda, cuyas dos mediciones de peso midieron sobre un «hay que vincular». */
  try { localStorage.setItem('ett_view_mode','avanzado'); if (typeof applyViewMode==='function') applyViewMode(); } catch (e) {}
  try { localStorage.removeItem('ett_ceibolink_token'); clnkToggle(true); } catch (e) {}
  await CTRL({ reset:true, equipos:1, escena:'unEnvio' });
  showTab('config'); if (window.cfgOnShow) cfgOnShow();
  await esp(900);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = '${F.codigo}'; cod.dispatchEvent(new Event('input',{bubbles:true})); await clnkVincular(); }
  await esp(1400);
  o.vinculado = clnkVinculado();
  if (!o.vinculado) { o.err = 'no se pudo vincular con el conector falso'; return o; }

  /* ── (1) LA MEMORIA DEL EQUIPO ─────────────────────────────────────────────── */
  o.m1 = { deviceMemory: ('deviceMemory' in navigator) ? navigator.deviceMemory : 'NO EXISTE',
           tipo: typeof navigator.deviceMemory,
           hardwareConcurrency: navigator.hardwareConcurrency,
           jsHeapLimitMB: performance.memory ? MB(performance.memory.jsHeapSizeLimit) : -1,
           precisa: !!(performance.memory && performance.memory.usedJSHeapSize) };

  /* ── (2) CRUDO vs GUARDADO ─────────────────────────────────────────────────── */
  /* El multicuadro sin comprimir de 512x512x60 = 15,7 MB de pixeles. Se baja por loopback, se
     lee por el camino de la app y se mide la suma de los JPEG que quedan. */
  o.m2 = { pasos: [] };
  try {
    window.__dcmCrudoMaxTest = 1024 * 1024 * 1024;   /* el tope no corta esta medicion */
    await CTRL({ escena:'nativoGrande' });
    const r = await clnkPedir('/v1/imagenes/img_ng/archivo', { conToken:true, bytes:true, espera:300000 });
    if (!r.ok || !r.datos) { o.m2.err = 'no bajo: ' + (r.msg||''); }
    else {
      const f = _clnkArchivo(r.datos, 'img_ng.dcm');
      const lec = await dstLeer(f, { origen:'ceibolink' });
      o.m2.clase = lec.clase; o.m2.rechazo = lec.rechazo || '';
      if (lec.clase === 'loop') {
        const crudo = 512*512*1*1*60;
        const jpeg = lec.loop.d.frags.reduce((a,x)=>a+x.length,0);
        o.m2.pasos.push({ que:'multicuadro 512x512x60 mono', crudoMB:MB(crudo), guardadoMB:MB(jpeg),
                          razon: Math.round(crudo/jpeg*100)/100, cuadros: lec.loop.cuadros,
                          transferidoMB: MB(r.datos.byteLength || r.datos.length || 0) });
      }
    }
  } catch (e) { o.m2.err = String(e && e.message || e).slice(0,160); }
  /* Y una fija: el crudo contra el dataURL comprimido que termina en el slot. */
  try {
    await CTRL({ escena:'nativoFija' });
    const r = await clnkPedir('/v1/imagenes/img_n1/archivo', { conToken:true, bytes:true, espera:300000 });
    const f = _clnkArchivo(r.datos, 'img_n1.dcm');
    const lec = await dstLeer(f, { origen:'ceibolink' });
    if (lec.clase === 'dicomfija') {
      const bruto = await dstDataURL(lec.jpeg, 'image/jpeg');
      const chica = await _imgComprimir(bruto, 'media');
      o.m2.pasos.push({ que:'fija 32x32 mono', crudoMB: MB(32*32), jpegCrudoB: lec.jpeg.length,
                        dataURLb: bruto.length, comprimidaB: chica.length });
    } else o.m2.fijaClase = lec.clase;
  } catch (e) { o.m2.err2 = String(e && e.message || e).slice(0,160); }

  /* ── (3) EL COSTO DE 6 Y DE 30 MINIATURAS ──────────────────────────────────── */
  /* El metodo de la decision 6c: de a UNA, primer cuadro, miniatura chica, soltar el resto.
     Se mide con el loop de tres cuadros, que es el que la lista ofrece como video. */
  o.m3 = {};
  try {
    await CTRL({ escena:'unEnvio' });
    const unaMin = async (id) => {
      const r = await clnkPedir('/v1/imagenes/'+id+'/archivo', { conToken:true, bytes:true, espera:300000 });
      if (!r.ok || !r.datos) return '';
      const f = _clnkArchivo(r.datos, id+'.dcm');
      const lec = await dstLeer(f, { origen:'ceibolink' });
      let du = '';
      if (lec.clase === 'loop') du = await dstDataURL(lec.loop.d.frags[0], 'image/jpeg');
      else if (lec.clase === 'dicomfija') du = await dstDataURL(lec.jpeg, 'image/jpeg');
      const th = du ? await dstThumb(du) : '';
      return th;   /* lo demas queda sin referencias */
    };
    /* DOS recolecciones antes de la base: la medicion anterior dejo el multicuadro de 15 MB
       en el monton y con una sola el «antes» salia MAS GRANDE que el «despues», o sea un delta
       negativo que no dice nada. */
    await gc(); await gc(); const h0 = heap();
    const seis = [];
    for (let i = 0; i < 6; i++) seis.push(await unaMin(i % 2 ? 'img_a2' : 'img_a1'));
    await gc(); const h6 = heap();
    const treinta = seis.slice();
    for (let i = 6; i < 30; i++) treinta.push(await unaMin(i % 3 === 0 ? 'img_a3' : (i % 2 ? 'img_a2' : 'img_a1')));
    await gc(); const h30 = heap();
    o.m3 = { base: MB(h0), con6: MB(h6), con30: MB(h30),
             delta6: MB(h6-h0), delta30: MB(h30-h0),
             bytesMin6: seis.reduce((a,x)=>a+x.length,0),
             bytesMin30: treinta.reduce((a,x)=>a+x.length,0),
             vacias: treinta.filter(x=>!x).length };
  } catch (e) { o.m3.err = String(e && e.message || e).slice(0,160); }

  /* ── (4) QUE SABE HACER CeiboImg Y CeiboCine ───────────────────────────────── */
  o.m4 = { ceiboImg: Object.keys(CeiboImg).sort(),
           ceiboCine: Object.keys(CeiboCine).sort(),
           hayQuitarSlot: typeof CeiboImg.quitar === 'function' };

  /* ── (5) EL EXPORTADOR DE BACKUP ───────────────────────────────────────────── */
  o.m5 = { bkExportar: typeof window._bkExportar, bkMedir: typeof window._bkMedir,
           topeBytes: (typeof BK_TOPE_BYTES !== 'undefined') ? BK_TOPE_BYTES : 'NO EXISTE',
           topeMB: (typeof BK_TOPE_BYTES !== 'undefined') ? MB(BK_TOPE_BYTES) : -1,
           formato: (typeof BK_FORMATO !== 'undefined') ? BK_FORMATO : 'NO EXISTE' };

  /* ── (6) LA GALERIA: modo elegir ───────────────────────────────────────────── */
  const reglas = [];
  try { for (const h of document.styleSheets) { let rs=null; try{rs=h.cssRules;}catch(e){continue;}
    for (const r of rs) if (r.selectorText && /ig-img-(th|ord|sel)|\\.sel/.test(r.selectorText)) reglas.push(r.selectorText); } } catch(e){}
  o.m6 = { pptFlag: typeof _igImgPpt, selToggle: typeof igImgSelToggle,
           thClic: typeof igImgThClic, adornar: typeof igImgAdornar,
           reglasSel: reglas.slice(0,14),
           botonElegir: !!document.querySelector('[data-ig-elegir]') };

  /* ── (7) DE QUE DEPENDE UN ESTUDIO GUARDADO ────────────────────────────────── */
  o.m7 = { imgRestaurar: typeof window.imgRestaurar, imgPersistir: typeof window.imgPersistir,
           excelColsImg: 0 };
  try {
    const m = (typeof LAB_XLS_MAP !== 'undefined') ? LAB_XLS_MAP : null;
    if (m) o.m7.excelColsImg = Object.keys(m).filter(k => /imag|foto|cine|video/i.test(k)).length;
    o.m7.excelN = m ? Object.keys(m).length : -1;
  } catch (e) {}
  o.m7.camposN = document.querySelectorAll('input[id],select[id],textarea[id]').length;
  return o;
})()`);
await nav.close(); srv.close(); F.srv.close();
console.log(JSON.stringify(out, null, 1));
console.log('errores de pagina: ' + (errs.length ? errs.join(' | ') : 'CERO'));
