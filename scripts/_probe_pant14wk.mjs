#!/usr/bin/env node
/**
 * _probe_pant14wk.mjs - Chrome y WebKit, dos temas, cuatro anchos (PANT-14, cierre).
 * Mide todo lo que la tanda toca: los colores del esquema -que es lo que la prueba de la tanda
 * anterior NO vio, porque comparo geometria-, el boton del PDF, la linea de lo no dibujado, el
 * desplazamiento horizontal, el texto recortado y los errores de consola y de pagina.
 *   node scripts/_probe_pant14wk.mjs [--file <html>]
 * ADVERTENCIA: WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema.
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const CUERPO = `(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const S3 = () => { try { return (typeof _cm3d !== 'undefined') ? _cm3d : null } catch (e) { return null } };
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const gesto = (id, v) => { const e = EL(id); if (!e) return 'NO';
    if (e.type === 'checkbox') { e.checked = (v === 'si') } else { e.value = v }
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' };
  const aRgb = x => { const m = String(x || '').match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null; const q = m[1].split(',').map(Number); return { r:q[0], g:q[1], b:q[2] } };
  const lum = c => { const f = v => { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b) };
  const contr = (a, b) => { if (!a || !b) return null; const l1 = lum(a), l2 = lum(b);
    return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05))).toFixed(2) };
  const negro = c => !!c && c.r < 24 && c.g < 24 && c.b < 24;
  /* ── abrir la pestania y el modulo por su boton real ── */
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(460);
  try { if (typeof cc3dPieSync === 'function') cc3dPieSync() } catch (e) {}
  const ab = EL('cc3d-abrir');
  if (ab && ab.getAttribute('aria-pressed') !== 'true') { ab.click(); await esperar(3000) }
  const esb = EL('cm3d-esb');
  if (esb && esb.getAttribute('aria-expanded') !== 'true') { esb.click(); await esperar(420) }
  R.moduloAbierto = !!(EL('cm3d-box') && EL('cm3d-schsvg'));
  /* ── los colores del esquema, en las cinco variantes de la transposicion ── */
  const svg = EL('cm3d-schsvg');
  let negras = 0, peor = 99, variantesQueDibujan = 0, conVar = 0;
  ['d','jat','mus','ras','cc'].forEach(bv => {
    if (!svg || !S3()) return;
    _cm3d.S.base = 'tga'; _cm3d.S.bv.tga = bv; _cm3d.S.mods = {}; _cm3d.S.ck = {};
    svg.innerHTML = 'X';
    try { cmSchRender(true) } catch (e) { return }
    if (String(svg.innerHTML).indexOf('X') === 0) return;
    variantesQueDibujan++;
    if (String(svg.innerHTML).indexOf('var(--') >= 0) conVar++;
    const cajas = Array.prototype.filter.call(svg.querySelectorAll('rect'), r => r.getAttribute('rx') === '8');
    const valv = Array.prototype.filter.call(svg.querySelectorAll('circle'), c => parseFloat(c.getAttribute('r') || '0') >= 5);
    const txts = Array.prototype.slice.call(svg.querySelectorAll('text'));
    cajas.concat(valv).forEach(e => {
      const f = aRgb(getComputedStyle(e).fill);
      if (negro(f)) negras++;
      const bb = e.getBBox ? e.getBBox() : null;
      txts.forEach(t => { const tb = t.getBBox ? t.getBBox() : null; if (!bb || !tb) return;
        const cx = tb.x + tb.width / 2, cy = tb.y + tb.height / 2;
        const dentro = (e.tagName.toLowerCase() === 'rect')
          ? (cx >= bb.x && cx <= bb.x + bb.width && cy >= bb.y && cy <= bb.y + bb.height)
          : (Math.pow(cx - parseFloat(e.getAttribute('cx')), 2) + Math.pow(cy - parseFloat(e.getAttribute('cy')), 2) <= 49);
        if (!dentro) return;
        const c = contr(f, aRgb(getComputedStyle(t).fill));
        if (c !== null && c < peor) peor = c });
    });
  });
  R.esqVariantesQueDibujan = variantesQueDibujan;
  R.esqCajasNegras = negras;
  R.esqPeorContraste = (peor === 99) ? null : peor;
  R.esqConVar = conVar;
  /* ── el boton del PDF: alto tactil y los dos estados ── */
  gesto('ete_cia_tipo', 'secundum');
  await esperar(320);
  try { if (typeof cmSetModo === 'function') cmSetModo('estudio') } catch (e) {}
  await esperar(520);
  const b = EL('cm3d-pdfb'), n = EL('cm3d-pdfn');
  const cj = b ? b.getBoundingClientRect() : null;
  R.btnAlto = cj ? Math.round(cj.height) : null;
  R.btnVisible = cj ? (cj.width > 0 && cj.height > 0) : null;
  R.btnActivo = b ? !b.disabled : null;
  if (b && !b.disabled) { b.click(); await esperar(900) }
  R.btnTexto = b ? (b.textContent.indexOf('Incluido') >= 0 ? 'incluido' : 'sin incluir') : null;
  /* ── la linea de lo no dibujado, en un escenario con conflicto ── */
  gesto('tga_tipo', 'dtga'); gesto('tdf_func_vd', 'normal');
  await esperar(520);
  try { cmDesdeEstudio(); cc3dTextoSync() } catch (e) {}
  const p = EL('cc3d-faltan');
  const pj = p ? p.getBoundingClientRect() : null;
  R.lineaChars = p ? p.textContent.trim().length : 0;
  R.lineaCaja = pj ? (Math.round(pj.width) + 'x' + Math.round(pj.height)) : null;
  R.lineaRecortada = p ? ((p.scrollWidth > p.clientWidth + 1) || (p.scrollHeight > p.clientHeight + 1)) : null;
  R.lineaDiceConflicto = p ? (p.textContent.indexOf('No se dibujan juntas') >= 0) : null;
  R.lineaNoContradice = p ? (p.textContent.indexOf('Todas las lesiones cargadas') < 0) : null;
  /* ── el recuadro de la transposicion sigue en su seccion ── */
  R.tgaRecuadro = !!EL('tga-3d-cv');
  R.tgaEsquema = !!EL('tga-esq-box');
  /* ── scroll horizontal y texto recortado ── */
  R.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  let rec = 0;
  Array.prototype.forEach.call(document.querySelectorAll('button, label, .cm3d-ph, .cm3d-ph2, #cc3d-faltan, #cm3d-pdfn'), e => {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if (cs.overflow === 'auto' || cs.overflow === 'scroll' || cs.overflowX === 'auto') return;
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) rec++;
  });
  R.recortados = rec;
  return R;
})()`;
const salida = {};
for (const motor of ['chrome', 'webkit']) {
  const br = motor === 'chrome' ? await _pw.chromium.launch({ channel: 'chrome' }) : await _pw.webkit.launch();
  for (const tema of ['noche', 'dia']) {
    for (const w of [1440, 1000, 768, 390]) {
      const clave = motor + '|' + tema + '|' + w;
      const pg = await br.newPage({ viewport: { width: w, height: 900 } });
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 120)));
      pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 120)) });
      try {
        await pg.addInitScript(`try { localStorage.setItem('ett_theme', '${tema === 'dia' ? 'light' : 'dark'}') } catch (e) {}`);
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
        await pg.waitForTimeout(1700);
        const r = await pg.evaluate(CUERPO);
        r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
        salida[clave] = r;
      } catch (e) { salida[clave] = { fatal: String(e).slice(0, 200), errs } }
      await pg.close();
    }
  }
  await br.close();
}
console.log(JSON.stringify(salida, null, 1));
