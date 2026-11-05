#!/usr/bin/env node
/**
 * _probe_pant14color.mjs - la matriz de COLORES del esquema de circulacion (PANT-14, commit 1).
 * Mide el relleno CALCULADO de cada caja y de cada circulo de valvula, y su contraste con el
 * texto, en los DOS motores, en los dos temas, en los cuatro anchos, abriendo y cerrando el
 * esquema, cambiando de modo, de base y de lesiones.
 * La leccion de PANT-13: la prueba de la tanda anterior comparo GEOMETRIA y no vio el negro.
 *   node scripts/_probe_pant14color.mjs [--file <html>] [--motor chrome|webkit]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MOT = arg('--motor');
const MOTORES = MOT ? [MOT] : ['chrome', 'webkit'];
const ANCHOS = [1440, 1000, 768, 390];

const CUERPO = `(async () => {
  const R = { estados: [], err: [] };
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  /* --- helpers de color --------------------------------------------------- */
  const aRgb = s => {
    const m = String(s || '').match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map(x => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: (p.length > 3 ? p[3] : 1) };
  };
  const lum = c => {
    const f = v => { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const contraste = (a, b) => {
    if (!a || !b) return null;
    const l1 = lum(a), l2 = lum(b);
    return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05))).toFixed(2);
  };
  const esNegro = c => !!c && c.a > 0.1 && c.r < 24 && c.g < 24 && c.b < 24;
  /* --- abrir la pestania, el modulo y el esquema, por su boton real -------- */
  const abrirTodo = async () => {
    if (typeof showTab === 'function') { try { showTab('congenitas') } catch (e) {} }
    await esperar(220);
    if (typeof cc3dPieSync === 'function') { try { cc3dPieSync() } catch (e) {} }
    const ab = EL('cc3d-abrir');
    if (ab && ab.getAttribute('aria-pressed') !== 'true') { ab.click(); await esperar(650) }
    const esb = EL('cm3d-esb');
    if (esb && esb.getAttribute('aria-expanded') !== 'true') { esb.click(); await esperar(320) }
    await esperar(260);
  };
  /* --- la medicion de UN estado ------------------------------------------- */
  const medir = (etq) => {
    const svg = EL('cm3d-schsvg'), caja = EL('cm3d-sch');
    const o = { etq: etq, hayCaja: !!caja, oculto: caja ? !!caja.hidden : null,
                nodos: svg ? svg.childNodes.length : 0, rects: [], circ: [], negros: 0, peorContraste: null };
    if (!svg) { o.err = 'SIN SVG'; return o }
    const rects = Array.prototype.slice.call(svg.querySelectorAll('rect'));
    const circ = Array.prototype.slice.call(svg.querySelectorAll('circle'));
    const txts = Array.prototype.slice.call(svg.querySelectorAll('text'));
    /* el relleno de cada rect que es una CAJA -las que llevan rx=8- y de cada valvula */
    rects.forEach(function (r) {
      const rx = r.getAttribute('rx');
      if (rx !== '8') return;  /* las barras de obstruccion llevan rx=2 y son grises a proposito */
      const cs = getComputedStyle(r);
      const f = aRgb(cs.fill), s = aRgb(cs.stroke);
      const bb = r.getBBox ? r.getBBox() : null;
      const e = { x: bb ? Math.round(bb.x) : null, y: bb ? Math.round(bb.y) : null,
                  fill: cs.fill, stroke: cs.stroke, negro: esNegro(f) };
      if (e.negro) o.negros++;
      /* el texto que cae dentro de esta caja */
      let peor = null;
      txts.forEach(function (t) {
        const tb = t.getBBox ? t.getBBox() : null;
        if (!bb || !tb) return;
        const cx = tb.x + tb.width / 2, cy = tb.y + tb.height / 2;
        if (cx < bb.x || cx > bb.x + bb.width || cy < bb.y || cy > bb.y + bb.height) return;
        const c = contraste(f, aRgb(getComputedStyle(t).fill));
        if (c !== null && (peor === null || c < peor)) peor = c;
      });
      e.contraste = peor;
      if (peor !== null && (o.peorContraste === null || peor < o.peorContraste)) o.peorContraste = peor;
      o.rects.push(e);
    });
    circ.forEach(function (c) {
      const r = parseFloat(c.getAttribute('r') || '0');
      if (r < 5) return;  /* los puntitos de 3 y 4 px son marcas, no valvulas */
      const cs = getComputedStyle(c);
      const f = aRgb(cs.fill);
      const e = { cx: c.getAttribute('cx'), cy: c.getAttribute('cy'), fill: cs.fill,
                  stroke: cs.stroke, negro: esNegro(f) };
      if (e.negro) o.negros++;
      /* la letra T o M que va encima */
      let peor = null;
      txts.forEach(function (t) {
        const tb = t.getBBox ? t.getBBox() : null;
        if (!tb) return;
        const cx = tb.x + tb.width / 2, cy = tb.y + tb.height / 2;
        const dx = cx - parseFloat(e.cx), dy = cy - parseFloat(e.cy);
        if (dx * dx + dy * dy > 49) return;
        const q = contraste(f, aRgb(getComputedStyle(t).fill));
        if (q !== null && (peor === null || q < peor)) peor = q;
      });
      e.contraste = peor;
      if (peor !== null && (o.peorContraste === null || peor < o.peorContraste)) o.peorContraste = peor;
      o.circ.push(e);
    });
    o.nRect = o.rects.length; o.nCirc = o.circ.length;
    return o;
  };
  /* --- recorrido de estados ----------------------------------------------- */
  await abrirTodo();
  const escenas = [
    ['normal-estudio', async () => { if (typeof cmSetModo === 'function') cmSetModo('estudio') }],
    ['explorar', async () => { if (typeof cmSetModo === 'function') cmSetModo('explorar') }],
    ['explorar-fallot', async () => {
        if (typeof cmSetBase === 'function') { try { cmSetBase('fal') } catch (e) {} }
        if (typeof cm3dBuild === 'function') cm3dBuild();
        if (typeof cmSchRender === 'function') cmSchRender(true); }],
    ['explorar-fallot-cia', async () => {
        if (window._cm3d && _cm3d.S && _cm3d.S.mods) { _cm3d.S.mods.cia = 'os' }
        if (typeof cm3dBuild === 'function') cm3dBuild();
        if (typeof cmSchRender === 'function') cmSchRender(true); }],
    ['explorar-ebstein', async () => {
        if (window._cm3d && _cm3d.S && _cm3d.S.mods) { _cm3d.S.mods.cia = '' }
        if (typeof cmSetBase === 'function') { try { cmSetBase('ebs') } catch (e) {} }
        if (typeof cm3dBuild === 'function') cm3dBuild();
        if (typeof cmSchRender === 'function') cmSchRender(true); }],
    ['explorar-fontan', async () => {
        if (typeof cmSetBase === 'function') { try { cmSetBase('fon') } catch (e) {} }
        if (typeof cm3dBuild === 'function') cm3dBuild();
        if (typeof cmSchRender === 'function') cmSchRender(true); }],
  ];
  for (const [nm, fn] of escenas) {
    try { await fn() } catch (e) { R.err.push(nm + ': ' + String(e).slice(0, 90)) }
    await esperar(280);
    R.estados.push(medir(nm));
  }
  /* cerrar y reabrir el esquema con su boton */
  const esb = EL('cm3d-esb');
  if (esb) { esb.click(); await esperar(260); esb.click(); await esperar(320) }
  R.estados.push(medir('reabierto'));
  /* el esquema que se rasteriza para el PDF */
  try {
    if (typeof cmSchRender === 'function') cmSchRender(true);
    const svg = EL('cm3d-schsvg');
    R.pdfNodos = svg ? svg.childNodes.length : 0;
  } catch (e) { R.err.push('pdf: ' + String(e).slice(0, 80)) }
  R.totalNegros = R.estados.reduce((a, e) => a + (e.negros || 0), 0);
  R.peor = R.estados.reduce((a, e) => (e.peorContraste !== null && (a === null || e.peorContraste < a)) ? e.peorContraste : a, null);
  return R;
})()`;

const salida = {};
for (const motor of MOTORES) {
  const br = motor === 'chrome'
    ? await _pw.chromium.launch({ channel: 'chrome' })
    : await _pw.webkit.launch();
  for (const tema of ['noche', 'dia']) {
    for (const w of ANCHOS) {
      const clave = motor + '|' + tema + '|' + w;
      const pg = await br.newPage({ viewport: { width: w, height: 900 } });
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 120)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text().slice(0, 120)) });
      try {
        await pg.addInitScript(`try { localStorage.setItem('ett_theme', '${tema === 'dia' ? 'light' : 'dark'}') } catch (e) {}`);
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
        await pg.waitForTimeout(1600);
        const r = await pg.evaluate(CUERPO);
        r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
        salida[clave] = r;
      } catch (e) { salida[clave] = { fatal: String(e).slice(0, 180), errs } }
      await pg.close();
    }
  }
  await br.close();
}
console.log(JSON.stringify(salida, null, 1));
