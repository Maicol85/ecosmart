#!/usr/bin/env node
/**
 * _probe_valppt_bucle.mjs - EL BUCLE CON VARIOS VIDEOS POR DIAPOSITIVA (VAL-PPT-9).
 *
 * Genera el .pptx DE VERDAD -se deja que la app lo descargue y Playwright captura el archivo-
 * con DOS videos en la MISMA diapositiva, y despues valida su XML: que el paquete sea un zip
 * coherente, que todas sus partes parseen, y que la diapositiva traiga UN `p:video` por cada
 * uno de los dos, con `repeatCount="indefinite"` y spids DISTINTOS.
 *
 * ⚠️ EL MP4 ES REAL, no un clip sintetico: `bucle.mp4` de la tanda TGA, H.264, 8.689 bytes,
 * con el atomo `moov` ANTES de `mdat` -verificado-. La orden lo exige porque ya hubo un caso en
 * que el fallo era del clip y no del codigo.
 *
 * ⚠️ LA REPRODUCCION REAL NO SE PUEDE AUTOMATIZAR: eso se prueba abriendo el archivo en
 * PowerPoint y en Keynote. Lo que esta sonda prueba es que el XML queda escrito y bien formado.
 *
 *   node scripts/_probe_valppt_bucle.mjs [--file <html>] [--out <dir>]
 */
import fs from 'fs';
import path from 'path';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || process.cwd() + '/index.html';
const OUT = arg('--out') || '/tmp/valppt_bucle';
const MP4 = arg('--mp4') || (process.env.HOME + '/Desktop/ceibo-experimento-ppt-bucle/bucle.mp4');

if (!fs.existsSync(MP4)) { console.log('ABORTA: no esta el MP4 de prueba en ' + MP4); process.exit(1) }
const mp4b64 = fs.readFileSync(MP4).toString('base64');
fs.mkdirSync(OUT, { recursive: true });

const CUERPO = `(async (cfg) => {
  const R = { errs: [], denom: {} };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const W = ms => new Promise(r => setTimeout(r, ms));
  const png = (w, h, col) => { const c = document.createElement('canvas');
    c.width = w; c.height = h; const x = c.getContext('2d');
    x.fillStyle = col; x.fillRect(0, 0, w, h); return c.toDataURL('image/png') };
  /* Los BYTES del mp4, que llegan en base64 desde el arnes. */
  const bin = atob(cfg.mp4);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const blob = new Blob([u8], { type: 'video/mp4' });
  const uuid = '99999999-8888-4777-8666-555555555555';
  if (typeof CeiboImg === 'undefined' || typeof CeiboVideo === 'undefined') { R.sinStore = true; return R }
  /* DOS videos y su poster, mas una imagen: asi la primera diapositiva de contenido lleva los
     dos clips -que es lo que el commit 9a pide medir- cuando el reparto es 2 por diapositiva. */
  const v1 = 'vid-aaa', v2 = 'vid-bbb';
  try {
    await CeiboVideo.guardar(uuid, [
      { id: v1, blob: blob, tipo: 'video/mp4', bytes: blob.size },
      { id: v2, blob: blob, tipo: 'video/mp4', bytes: blob.size }
    ]);
    await CeiboImg.guardar(uuid, [
      { dataURL: png(640, 360, '#223344'), videoId: v1 },
      { dataURL: png(640, 360, '#443322'), videoId: v2 }
    ]);
    R.denom.videosSembrados = 2;
  } catch (e) { R.errs.push('sembrar: ' + String(e).slice(0, 120)); return R }
  try {
    const K = 'ecosmart_informes';
    const prev = JSON.parse(localStorage.getItem(K) || '[]');
    if (!prev.some(x => x && x.uuid === uuid)) {
      prev.push({ uuid: uuid, fecha: '2026-11-02', nombre: 'PACIENTE QUE NO DEBE APARECER',
                  documento: '8888888', informe: 'x', campos: {} });
      localStorage.setItem(K, JSON.stringify(prev));
    }
  } catch (e) {}
  try { if (typeof showTab === 'function') showTab('guardados') } catch (e) {}
  try { if (typeof renderInformesGuardados === 'function') renderInformesGuardados() } catch (e) {}
  await W(500);
  try { if (typeof igImgSidePintar === 'function') igImgSidePintar(0, 0) } catch (e) {}
  const c0 = EL('ig-ppt-on');
  if (c0 && !c0.checked) { c0.checked = true; c0.dispatchEvent(new Event('change', { bubbles: true })) }
  try { if (typeof igImgSidePintar === 'function') igImgSidePintar(0, 0) } catch (e) {}
  await W(300);
  /* DOS por diapositiva, para que los dos videos caigan en la MISMA. */
  const bs = Array.prototype.filter.call(document.querySelectorAll('.ig-vista-btn'),
             b => b.textContent === '2');
  if (bs[0]) bs[0].click();
  await W(200);
  try {
    if (typeof _igImgSel !== 'undefined') { _igImgSel.length = 0;
      _igImgSel.push({ uuid: uuid, idx: 0, n: 1 });
      _igImgSel.push({ uuid: uuid, idx: 1, n: 2 });
      R.denom.elegidos = _igImgSel.length;
    }
  } catch (e) { R.errs.push('elegir: ' + e) }
  /* El modal del tema y los confirm de peso, resueltos solos. */
  /* ⚠️ MODO CAIDA (9b): se rompe DOMParser, que es de lo que _pptxBucleVideos depende para
     validar cada diapositiva antes de escribirla. El archivo tiene que salir IGUAL, sano y sin
     bucle, con su aviso en la linea de resultado. Es la unica forma de probar la caida sin
     inventar un .pptx roto. */
  if (cfg.caida) {
    try { window.DOMParser = undefined } catch (e) { R.errs.push('no se pudo romper DOMParser') }
    R.denom.caidaForzada = true;
  }
  const oc = window.confirm; window.confirm = () => true;
  const resolverTema = setInterval(() => {
    const ov = Array.prototype.filter.call(document.querySelectorAll('div'),
      d => /Eleg\\u00ed la paleta/.test(d.textContent || '') && d.querySelector('button'))[0];
    if (ov) { const b = ov.querySelector('button'); if (b) b.click() }
  }, 120);
  try { if (typeof igImgPptExportar === 'function') igImgPptExportar() }
  catch (e) { R.errs.push('exportar: ' + String(e).slice(0, 120)) }
  await W(14000);
  clearInterval(resolverTema);
  window.confirm = oc;
  R.resultado = String((EL('ig-img-res') || {}).textContent || '').slice(0, 520);
  return R;
})`;

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  let archivo = null;
  pg.on('download', async d => {
    try { const p2 = path.join(OUT, d.suggestedFilename() || 'mazo.pptx');
      await d.saveAs(p2); archivo = p2; } catch (e) { errs.push('download: ' + e.message) }
  });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  const CAIDA = process.argv.indexOf('--caida') > 0;
  const R = await pg.evaluate(new Function('return ' + CUERPO)(), { mp4: mp4b64, caida: CAIDA });
  await pg.waitForTimeout(2500);
  console.log('===== EL BUCLE CON VARIOS VIDEOS (VAL-PPT-9) =====');
  console.log('archivo de la app:', FILE);
  console.log('mp4 de prueba:', MP4, '(' + fs.statSync(MP4).size + ' bytes, H.264, moov al principio)');
  console.log('DENOMINADOR:', JSON.stringify(R.denom));
  console.log('linea de resultado:', R.resultado || '(vacia)');
  if (R.errs && R.errs.length) console.log('errs: ' + R.errs.slice(0, 4).join(' ; '));
  await ctx.close(); await b.close();
  if (!archivo) { console.log('\nNO SE DESCARGO NINGUN ARCHIVO'); console.log('errores: ' + errs.slice(0,3).join(' | ')); process.exit(0) }
  console.log('\n.pptx generado: ' + archivo + ' (' + fs.statSync(archivo).size + ' bytes)');
  console.log('errores de pagina: ' + (errs.length ? errs.slice(0, 3).join(' | ') : 'ninguno'));
  console.log('\n-- la validacion la hace scripts/_val_pptx.py sobre ese archivo --');
})();
