#!/usr/bin/env node
/**
 * _probe_p14b_retiro.mjs - el retiro del recuadro de la transposicion (PANT-14b, commit 5).
 * Mide: que el recuadro no se ve, que el boton «Ver en 3D» esta y mide 44 px, que la libreria 3D
 * NO se carga desde esa pestania, que el boton del PDF del modulo funciona con transposicion, el
 * alto y el ancho de la pestania a los cuatro anchos, y el conteo de globos.
 *   node scripts/_probe_p14b_retiro.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = [[1440,900],[1000,900],[768,900],[390,844]];
const TIPOS = ['dtga','mustard','senning','cctga'];

const CUERPO = (tipo) => `(async () => {
  const R = { tipo: ${JSON.stringify(tipo)} }; const EL = i => document.getElementById(i);
  const esp = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const caja = e => { if (!e) return 'NO EXISTE'; const r = e.getBoundingClientRect();
    return (r.width > 0 && r.height > 0) ? Math.round(r.width) + 'x' + Math.round(r.height) : '0x0' };
  try { const b = bq('showTab(' + Q + 'congenitas2' + Q); if (b) b.click() } catch (e) {}
  await esp(450);
  /* ⚠️ LA SUB-PESTANIA Y EL ACORDEON, O TODO MIDE 0x0: la seccion de la transposicion vive en
     la sub-pestania «CC complejas» y dentro de un acordeon que nace CERRADO. Sin estos dos
     clics la geometria entera da cero, que es un denominador vacio y no una medicion. */
  try { const sb = bq('ccSubTab(' + Q + 'congenitas2' + Q); if (sb) sb.click() } catch (e) {}
  await esp(350);
  try { const hd = document.querySelector('#sacc-cc-tga .sacc-hdr');
        if (hd && hd.getAttribute('aria-expanded') !== 'true') hd.click() } catch (e) {}
  await esp(500);
  R.accAbierto = (function () { const h = document.querySelector('#sacc-cc-tga .sacc-hdr');
    return h ? h.getAttribute('aria-expanded') : 'NO HAY' })();
  R.secCaja = (function () { const c = document.querySelector('#sacc-cc-tga .sacc-body');
    if (!c) return 'NO HAY'; const r = c.getBoundingClientRect();
    return Math.round(r.width) + 'x' + Math.round(r.height) })();
  const tp = EL('tga_tipo');
  R.puesto = tp ? (Array.prototype.some.call(tp.options, o => o.value === ${JSON.stringify(tipo)}) ? 'ok' : 'SIN OPCION') : 'NO HAY';
  if (tp && R.puesto === 'ok') { tp.value = ${JSON.stringify(tipo)};
    tp.dispatchEvent(new Event('input', { bubbles: true })); tp.dispatchEvent(new Event('change', { bubbles: true })) }
  await esp(2600);
  /* el recuadro viejo y el boton nuevo */
  R.recuadro = caja(EL('tga-3d-box'));
  R.recuadroDisp = EL('tga-3d-box') ? getComputedStyle(EL('tga-3d-box')).display : 'NO EXISTE';
  R.lienzoViejo = caja(EL('tga-3d-cv'));
  R.esqViejo = caja(EL('tga-esq-svg'));
  R.leyendaVieja = caja(EL('tga-3d-leg'));
  R.pdfViejo = caja(EL('tga-3d-pdf'));
  R.normViejo = caja(EL('tga-3d-norm'));
  R.btnVer3D = caja(EL('tga-ver3d'));
  R.avisoTga = (EL('tga-3d-aviso') || {}).textContent || '';
  /* la libreria: NO se carga desde esta pestania */
  R.three = (typeof window.THREE === 'undefined') ? 'NO cargada' : 'CARGADA';
  R.scriptsThree = Array.prototype.filter.call(document.querySelectorAll('script[src]'), s => /three/i.test(s.src)).length;
  /* alto y ancho de la seccion y de la pestania */
  const sec = EL('tga-fila') ? EL('tga-fila').closest('.sacc, .card, section') : null;
  R.altoFila = caja(EL('tga-fila'));
  R.altoPestania = caja(EL('tab-congenitas2'));
  R.globos = document.querySelectorAll('#tab-congenitas2 [data-vinfo]').length;
  R.globosTotal = document.querySelectorAll('[data-vinfo]').length;
  /* el boton «Ver en 3D» abre el modulo */
  const bv = EL('tga-ver3d');
  if (bv) { bv.click(); await esp(3600) }
  R.panelDisp = EL('cc3d-panel') ? getComputedStyle(EL('cc3d-panel')).display : 'NO EXISTE';
  R.modo = (function () { const e = document.querySelector('.cm3d-md[aria-pressed="true"]');
    return e ? e.getAttribute('data-m') : 'NINGUNO' })();
  try { R.base = _cm3d.S.base; R.bv = _cm3d.S.bv[_cm3d.S.base] } catch (e) {}
  R.threeTrasAbrir = (typeof window.THREE === 'undefined') ? 'NO cargada' : 'CARGADA';
  /* el boton del PDF del modulo, CON transposicion cargada */
  const pb = EL('cm3d-pdfb');
  R.pdfModulo = pb ? (pb.disabled ? 'apagado' : 'activo') : 'NO EXISTE';
  R.pdfModuloAviso = (EL('cm3d-pdfn') || {}).textContent || '';
  R.pdfModuloCaja = caja(pb);
  if (pb && !pb.disabled) { pb.click(); await esp(2400) }
  R.incluido = (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('cm3d') : 'SIN FN';
  R.incluidoTga = (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('tga3d') : 'SIN FN';
  /* ni barra horizontal ni texto recortado en la pestania */
  const cu = document.querySelector('.app-content') || document.body;
  R.scrollH = Math.max(0, cu.scrollWidth - cu.clientWidth);
  let rec = 0;
  document.querySelectorAll('#tab-congenitas2 *').forEach(function (e) {
    if (e.children.length) return; const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'visible') rec++ });
  R.recortados = rec;
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const salida = {};
for (const [w, h] of ANCHOS) {
  for (const t of TIPOS) {
    if (w !== 1440 && t !== 'mustard') continue;
    const pg = await br.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 120)));
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
      await pg.waitForTimeout(1900);
      const r = await pg.evaluate(CUERPO(t));
      r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
      salida[w + 'px/' + t] = r;
    } catch (e) { salida[w + 'px/' + t] = { fatal: String(e).slice(0, 200), errs } }
    await pg.close();
  }
}
await br.close();
console.log(JSON.stringify(salida, null, 1));
