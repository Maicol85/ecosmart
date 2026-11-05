#!/usr/bin/env node
/**
 * _probe_pant13wk.mjs - Chrome y WebKit, los cuatro anchos y los dos temas (PANT-13).
 * Nombre propio: verificado con ls, no existia.
 *   node scripts/_probe_pant13wk.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 * WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 * channel chrome: sin eso la sonda devuelve los cruces vacios.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];

const CUERPO = `(async () => {
  const R = {};
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  /* El cartel de login es position fixed con z-index altisimo: sin esconderlo,
     elementFromPoint devuelve EL y todo area tactil da 0 de 5 sobre botones que se tocan
     perfectamente. Es la trampa que POP-V2 documenta. */
  try { sessionStorage.setItem('ett_auth', '1') } catch (e) {}
  try { const ov = document.getElementById('login-overlay');
    if (ov) ov.style.display = 'none' } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco() } catch (e) {}
  const EL = (id) => document.getElementById(id);
  const FN = (n) => (typeof window[n] === 'function') ? window[n] : null;
  const CS = (e) => e ? getComputedStyle(e) : null;
  const AREA = (e) => { if (!e) return 'NO';
    e.scrollIntoView({ block: 'center' });
    const r = e.getBoundingClientRect();
    const pts = [[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],
                 [r.right-2,r.bottom-2],[(r.left+r.right)/2,(r.top+r.bottom)/2]];
    let n = 0;
    for (const p of pts) { const t = document.elementFromPoint(p[0], p[1]);
      if (t && (t === e || e.contains(t))) n++ }
    return Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + n + '/5' };

  /* ---- COMMIT 2: las tres zonas y la barra ---- */
  try { const b = Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    (x) => String(x.getAttribute('onclick')).indexOf('congenitas') >= 0)[0]; if (b) b.click() } catch (e) {}
  await esperar(360);
  const ab = EL('cc3d-abrir'); if (ab) ab.click();
  await esperar(3000);
  const bExp = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'),
    (b) => b.getAttribute('data-m') === 'explorar')[0];
  if (bExp) bExp.click();
  await esperar(700);
  const sh = EL('cm3d-shell');
  R.cols = sh ? (CS(sh).gridTemplateColumns || '').split(' ').length : 'NO';
  R.plVis = EL('cm3d-pl') ? (EL('cm3d-pl').hidden ? 'oculta' : 'visible') : 'NO';
  R.prVis = EL('cm3d-pr') ? (EL('cm3d-pr').hidden ? 'oculta' : 'visible') : 'NO';
  const tb = document.querySelector('#cm3d-mid .cm3d-tb');
  R.barra = tb ? CS(tb).display : 'NO';
  R.cbwDentro = (function () { const c = EL('cm3d-cbw'), m = EL('cm3d-mid');
    return (c && m && m.contains(c)) ? 'dentro' : 'fuera' })();
  R.tablaLateral = document.querySelectorAll('.cm3d-tbrow, #cm3d-sideb').length;
  const chip = document.querySelector('.cm3d-chip');
  R.chip = AREA(chip);
  const fc = EL('cm3d-fc');
  R.fcAncho = fc ? Math.round(fc.getBoundingClientRect().width) : 'NO';

  /* ---- COMMIT 1: el lienzo sigue al ancho de su recuadro ---- */
  const cv = EL('cm3d-cv');
  const lienzo = cv ? cv.querySelector('canvas') : null;
  R.lienzo = (cv && lienzo)
    ? (Math.abs(Math.round(lienzo.getBoundingClientRect().width) -
                Math.round(cv.getBoundingClientRect().width)) <= 2 ? 'sigue' : 'desfasado')
    : 'NO';
  /* El censo de tildes va sobre el texto VISIBLE del panel entero -incluidos los title y los
     aria-label-, no sobre un solo contenedor: las siglas de los botones de la lista son cortas
     y no llevan ninguna de las palabras que la orden nombra. */
  R.tildes = (function () { const p = EL('cc3d-panel'); if (!p) return 'NO';
    let t = String(p.textContent || '');
    for (const e of p.querySelectorAll('[title], [aria-label]'))
      t += ' ' + (e.getAttribute('title') || '') + ' ' + (e.getAttribute('aria-label') || '');
    const PAL = ['Coraz' + String.fromCharCode(243) + 'n',
                 'Transposici' + String.fromCharCode(243) + 'n',
                 'Anomal' + String.fromCharCode(237) + 'a',
                 'Circulaci' + String.fromCharCode(243) + 'n'];
    const hay = PAL.filter((w) => t.indexOf(w) >= 0).length;
    const MAL = ['Corazon', 'Transposicion', 'Anomalia', 'Circulacion', 'cardiaca', 'pulmon '];
    const mal = MAL.filter((w) => t.indexOf(w) >= 0);
    return hay + '/4 con tilde, ' + mal.length + ' sin' })();

  /* ---- COMMIT 2: el esquema de circulacion ---- */
  const esb = EL('cm3d-esb'); if (esb) esb.click();
  await esperar(500);
  R.esqAbre = EL('cm3d-sch') ? (EL('cm3d-sch').hidden ? 'cerrado' : 'abierto') : 'NO';
  R.esqNodos = (function () { const s = EL('cm3d-schsvg');
    return s ? s.querySelectorAll('*').length : 0 })();
  R.esqAlLado = (function () { const v = EL('cm3d-vw'), s = EL('cm3d-sch');
    if (!v || !s || s.hidden) return 'NO';
    const a = EL('cm3d-cv').getBoundingClientRect(), b = s.getBoundingClientRect();
    return (b.left >= a.right - 4) ? 'al lado' : 'debajo' })();
  if (esb) esb.click();
  await esperar(300);

  /* ---- COMMIT 4: la transposicion como sexta base ---- */
  R.bases = (window.CM_BASES || []).length;
  R.tgaVars = ((window.CM_BVARS || {}).tga || []).length;
  R.dibujadas = (window.CC3D_DIBUJA || []).length;
  R.propio = (window.CC3D_PROPIO || []).length;
  R.tgaRecuadro = (!!EL('tga-3d-cv')) + '/' + (!!EL('tga-esq-box')) + '/' + (!!EL('tga-3d-pdf'));

  /* ---- COMMIT 3: el boton del PDF, apagado en Explorar ---- */
  R.pdfExplorar = (function () { const b = EL('cm3d-pdfb');
    return b ? (b.disabled ? 'apagado' : 'habilitado') : 'NO' })();
  R.pdfAviso = (function () { const n = EL('cm3d-pdfn');
    return (n && String(n.textContent || '').trim().length > 10) ? 'lo dice' : 'MUDO' })();

  /* ---- COMMIT 5: la tabla de masas ---- */
  try { if (FN('showTab')) window.showTab('otros') } catch (e) {}
  await esperar(320);
  try { if (FN('toggleEteSeccion')) window.toggleEteSeccion('masas', null) } catch (e) {}
  await esperar(420);
  R.masaCerrada = EL('masa-ref-cuerpo') ? CS(EL('masa-ref-cuerpo')).display : 'NO';
  R.masaAria = EL('masa-ref-tog') ? EL('masa-ref-tog').getAttribute('aria-expanded') : 'NO';
  R.masaBoton = AREA(EL('masa-ref-tog'));
  R.masaGloboFuera = (function () { const s = EL('otr-sub-masas');
    const g = s ? s.querySelector('[data-vinfo="masa-ref"]') : null, t = EL('masa-ref-tog');
    return (g && t) ? (t.contains(g) ? 'DENTRO' : 'fuera') : 'NO' })();
  R.masaNeutro = (function () { const s = EL('otr-sub-masas');
    const t = String((s || {}).textContent || '');
    return ['no coinciden', 'sin resolver', 'Ninguna fuente de la biblioteca publica']
      .filter((f) => t.indexOf(f) >= 0).length })();

  /* ---- COMMIT 7: las variantes ---- */
  try { if (FN('toggleEteSeccion')) window.toggleEteSeccion('variantes', null) } catch (e) {}
  await esperar(420);
  const gr = document.querySelector('#otr-sub-variantes .otr-var-grid');
  R.varCeldas = gr ? gr.querySelectorAll('.otr-var-celda').length : 'NO';
  R.varColumnas = gr ? (CS(gr).gridTemplateColumns || '').split(' ').length : 'NO';
  R.varNotasVis = (function () { if (!gr) return 'NO';
    return Array.prototype.filter.call(gr.querySelectorAll('.otr-var-nota'),
      (n) => CS(n).display !== 'none').length })();
  R.varAjenas = (function () {
    const a = EL('otr_asia_nota'), b = EL('otr_rac_nota');
    return ((a && CS(a).display !== 'none') ? 1 : 0) + '/' + ((b && CS(b).display !== 'none') ? 1 : 0) })();

  /* ---- COMMIT 6: el pulmon ---- */
  try { if (FN('showTab')) window.showTab('pulmon') } catch (e) {}
  await esperar(320);
  const sv = (id, v) => { const e = EL(id); if (!e) return;
    e.value = v; try { e.dispatchEvent(new Event('change', { bubbles: true })) } catch (x) {} };
  sv('pua_consol', 'si'); sv('pua_consol_lado', 'der'); sv('pua_consol_bronco', 'con');
  if (FN('pulAvUI')) window.pulAvUI();
  if (FN('pulDibSync')) window.pulDibSync();
  await esperar(500);
  R.pulPuntos = (function () { const s = EL('pul-dib-svg'); if (!s) return 'NO';
    const g = Array.prototype.filter.call(s.querySelectorAll('g[clip-path]'),
      (x) => String(x.getAttribute('fill') || '').indexOf('bg2') >= 0)[0];
    if (!g) return 'NO GRUPO';
    return g.querySelectorAll('circle').length + ' pts / ' + g.querySelectorAll('path').length + ' paths' })();
  R.pulBoton = (!!EL('pul-dib-pdf-toggle')) + '/' + (!!EL('pul_dib_pdf'));

  /* ---- LOS CONTROLES DE SIEMPRE ---- */
  R.scrollH = Math.max(0, (document.documentElement.scrollWidth || 0) -
                          (document.documentElement.clientWidth || 0));
  R.recortados = (function () { let n = 0;
    const els = document.querySelectorAll('label, span, h2, h3, button, td, th');
    for (const e of els) { const r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (e.scrollWidth > e.clientWidth + 2 && CS(e).overflow === 'hidden') n++ }
    return n })();
  return R;
})()`;

const SALIDA = {};
for (const motor of ['chrome', 'webkit']) {
  let br = null;
  try {
    br = (motor === 'chrome')
      ? await _pw.chromium.launch({ channel: 'chrome' })
      : await _pw.webkit.launch();
  } catch (e) { SALIDA[motor] = { error: String(e).slice(0, 120) }; continue }
  for (const w of ANCHOS) for (const tema of TEMAS) {
    const ctx = await br.newContext({ viewport: { width: w, height: 900 }, colorScheme: tema });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push('PAGE ' + String(e.message).slice(0, 90)));
    pg.on('console', (c) => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 90)) });
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
      await pg.waitForTimeout(1200);
      const r = await pg.evaluate(CUERPO);
      r.errores = errs.length; r.errDet = errs.slice(0, 3);
      SALIDA[motor + '|' + w + '|' + tema] = r;
    } catch (e) {
      SALIDA[motor + '|' + w + '|' + tema] = { EXC: String(e).slice(0, 150), errores: errs.length };
    }
    await ctx.close();
  }
  await br.close();
}
console.log(JSON.stringify(SALIDA, null, 1));
