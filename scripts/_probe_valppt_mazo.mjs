#!/usr/bin/env node
/**
 * _probe_valppt_mazo.mjs - EL MAZO GENERADO DE VERDAD del banco de imagenes (VAL-PPT 8 a 10).
 *
 * Siembra imagenes y videos en el banco, abre la pantalla, los elige en orden, y genera el PPT
 * espiando PptxGenJS. Mide: cuantas diapositivas, si lleva la INICIAL y la FINAL, que textos
 * lleva -ninguno puede ser un nombre de paciente-, en que disposicion quedo cada bloque, y si
 * el bucle se marco.
 *
 * ⚠️ DOS DENOMINADORES DECLARADOS: cuantos elementos se sembraron y cuantos se eligieron. Un
 * mazo de cero diapositivas sobre cero elementos no prueba nada.
 * ⚠️ EL MODAL DEL TEMA se resuelve haciendo clic en su primer boton: desde VAL-PPT-8c este
 * camino lo abre, y sin resolverlo la generacion queda esperando para siempre.
 *
 *   node scripts/_probe_valppt_mazo.mjs [--file <html>] [--por 1|2|4] [--num 0|1]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || process.cwd() + '/index.html';
const POR = Number(arg('--por') || 2);
const NUM = arg('--num') === '0' ? false : true;

const CUERPO = `(async (cfg) => {
  const R = { errs: [], denom: {} };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const W = ms => new Promise(r => setTimeout(r, ms));
  /* ── SEMBRAR: dos estudios con imagenes de aspectos distintos ───────────────────────────── */
  const png = (w, h, col) => { const c = document.createElement('canvas');
    c.width = w; c.height = h; const x = c.getContext('2d');
    x.fillStyle = col; x.fillRect(0, 0, w, h); return c.toDataURL('image/png') };
  const uuid = '11111111-2222-4333-8444-555555555555';
  const SL = [
    { dataURL: png(640, 360, '#113355'), nota: '' },      /* apaisada 16:9 */
    { dataURL: png(360, 640, '#551133'), nota: '' },      /* vertical  9:16 */
    { dataURL: png(400, 400, '#115533'), nota: '' },      /* cuadrada */
    { dataURL: png(640, 480, '#553311'), nota: '' }       /* eco 4:3 */
  ];
  try {
    if (typeof CeiboImg === 'undefined') { R.sinStore = true; return R }
    await CeiboImg.guardar(uuid, SL);
    R.denom.sembradas = SL.length;
  } catch (e) { R.errs.push('sembrar: ' + String(e).slice(0, 90)); return R }
  /* El estudio tiene que existir en la lista de guardados para que el banco lo muestre. */
  try {
    const K = 'ecosmart_informes';
    const prev = JSON.parse(localStorage.getItem(K) || '[]');
    if (!prev.some(x => x && x.uuid === uuid)) {
      prev.push({ uuid: uuid, fecha: '2026-11-02', nombre: 'NOMBRE QUE NO DEBE APARECER',
                  documento: '9999999', informe: 'x', campos: {} });
      localStorage.setItem(K, JSON.stringify(prev));
    }
  } catch (e) { R.errs.push('lista: ' + String(e).slice(0, 80)) }
  /* ── ABRIR la pantalla del banco ─────────────────────────────────────────────────────────── */
  try { if (typeof showTab === 'function') showTab('guardados') } catch (e) {}
  try { if (typeof renderInformesGuardados === 'function') renderInformesGuardados() } catch (e) {}
  await W(400);
  try { if (typeof igImgAbrir === 'function') igImgAbrir();
        else if (typeof igImgPintar === 'function') igImgPintar() } catch (e) { R.errs.push('abrir: ' + e) }
  await W(700);
  /* Encender «Armar PPT» y el reparto pedido. */
  try { if (typeof igImgSidePintar === 'function') igImgSidePintar(0, 0) } catch (e) {}
  const c0 = EL('ig-ppt-on');
  if (c0 && !c0.checked) { c0.checked = true; c0.dispatchEvent(new Event('change', { bubbles: true })) }
  try { if (typeof igImgSidePintar === 'function') igImgSidePintar(0, 0) } catch (e) {}
  await W(300);
  /* El reparto y la casilla del numero, por sus controles reales. */
  const bs = Array.prototype.filter.call(document.querySelectorAll('.ig-vista-btn'),
             b => b.textContent === String(cfg.por));
  if (bs[0]) bs[0].click();
  await W(200);
  const cN = EL('ig-ppt-num');
  if (cN && cN.checked !== cfg.num) { cN.checked = cfg.num; cN.dispatchEvent(new Event('change', { bubbles: true })) }
  /* La SELECCION, en el orden de los slots. Se arma a mano porque el gesto sobre la miniatura
     depende de que la grilla haya pintado, y lo que esta sonda mide es el MAZO. */
  try {
    window._igImgSel = null;
    if (typeof igImgTocar === 'function') { /* si existe el gesto, se usa */ }
  } catch (e) {}
  R.denom.selAntes = (typeof _igImgSel !== 'undefined') ? _igImgSel.length : 'no expuesta';
  /* ── ESPIAR PptxGenJS y GENERAR ──────────────────────────────────────────────────────────── */
  const Orig = window.PptxGenJS;
  const reg = { slides: [], medias: 0 };
  window.PptxGenJS = function (...a) {
    const pz = new Orig(...a);
    const oa = pz.addSlide.bind(pz);
    pz.addSlide = function (...z) {
      const s2 = oa(...z);
      const cur = { textos: [], imgs: 0, medias: 0, formas: 0 };
      reg.slides.push(cur);
      const ot = s2.addText.bind(s2);
      s2.addText = function (t, o) { cur.textos.push(typeof t === 'string' ? t : JSON.stringify(t)); return ot(t, o) };
      if (s2.addImage) { const oi = s2.addImage.bind(s2);
        s2.addImage = function (o) { cur.imgs++; cur.ultImg = { x:o.x, y:o.y, w:o.w, h:o.h }; return oi(o) } }
      if (s2.addMedia) { const om = s2.addMedia.bind(s2);
        s2.addMedia = function (o) { cur.medias++; reg.medias++; return om(o) } }
      if (s2.addShape) { const os = s2.addShape.bind(s2);
        s2.addShape = function (...y) { cur.formas++; return os(...y) } }
      return s2;
    };
    pz.writeFile = function () { return Promise.resolve(true) };
    pz.write = function () { return Promise.resolve(new Blob([new Uint8Array([80,75,3,4])])) };
    return pz;
  };
  Object.keys(Orig).forEach(k => { try { window.PptxGenJS[k] = Orig[k] } catch (e) {} });
  /* Elegir los slots directamente en la estructura que el exportador lee. */
  try {
    const sel = [];
    for (let i = 0; i < SL.length; i++) sel.push({ uuid: uuid, idx: i, n: i + 1 });
    if (typeof _igImgSel !== 'undefined') { _igImgSel.length = 0; sel.forEach(x => _igImgSel.push(x)) }
    R.denom.elegidas = sel.length;
  } catch (e) { R.errs.push('elegir: ' + String(e).slice(0, 90)) }
  /* El modal del TEMA: se resuelve con su primer boton en cuanto aparece. */
  const resolverTema = setInterval(() => {
    const ov = Array.prototype.filter.call(document.querySelectorAll('div'),
      d => /Eleg\\u00ed la paleta/.test(d.textContent || '') && d.querySelector('button'))[0];
    if (ov) { const b = ov.querySelector('button'); if (b) b.click() }
  }, 120);
  try { if (typeof igImgPptExportar === 'function') igImgPptExportar() }
  catch (e) { R.errs.push('exportar: ' + String(e).slice(0, 120)) }
  await W(6000);
  clearInterval(resolverTema);
  window.PptxGenJS = Orig;
  R.slides = reg.slides.map(s2 => ({ textos: s2.textos, imgs: s2.imgs, medias: s2.medias,
                                     formas: s2.formas, ultImg: s2.ultImg }));
  R.medias = reg.medias;
  R.resultado = String((EL('ig-img-res') || {}).textContent || '').slice(0, 420);
  return R;
})`;

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  const R = await pg.evaluate(new Function('return ' + CUERPO)(), { por: POR, num: NUM });
  console.log('===== EL MAZO DEL BANCO (VAL-PPT 8 a 10) =====');
  console.log('archivo:', FILE, '| por diapositiva:', POR, '| numerar:', NUM);
  console.log('DENOMINADOR:', JSON.stringify(R.denom));
  if (R.sinStore) console.log('SIN CeiboImg en este arbol');
  const sl = R.slides || [];
  console.log('diapositivas: ' + sl.length + '  (medios incrustados: ' + R.medias + ')');
  sl.forEach((s2, i) => {
    console.log('  ' + String(i + 1).padStart(2) + ') imgs=' + s2.imgs + ' medias=' + s2.medias
      + ' formas=' + s2.formas + '  textos: '
      + s2.textos.map(t => t.length > 46 ? t.slice(0, 46) + '…' : t).join(' | ').slice(0, 170));
  });
  const todo = sl.map(s2 => s2.textos.join(' ')).join(' ');
  console.log('\nCENSO: nombre del paciente en el mazo -> '
    + (/NOMBRE QUE NO DEBE APARECER/.test(todo) ? 'APARECE (defecto)' : 'no aparece'));
  console.log('  inicial «Selección de imágenes» -> ' + (/Selecci.n de im.genes/.test(todo) ? 'si' : 'NO'));
  console.log('  final «Gracias»                 -> ' + (/Gracias/.test(todo) ? 'si' : 'NO'));
  console.log('\nlinea de resultado: ' + R.resultado);
  if (R.errs && R.errs.length) console.log('errs: ' + R.errs.slice(0, 4).join(' ; '));
  console.log('errores de pagina: ' + (errs.length ? errs.slice(0, 3).join(' | ') : 'ninguno'));
  await b.close();
  process.exit(0);
})();
