#!/usr/bin/env node
/**
 * _probe_pant11vci.mjs - la casilla «(no se visualiza VCI)» del commit 3 de PANT-11.
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide, con GESTOS REALES y con siembra muda, en los dos temas y a los cuatro anchos:
 *   - la geometria del boton y sus CINCO puntos con elementFromPoint -ninguno puede caer en
 *     otro control-, que es la leccion de AJUSTES-1;
 *   - el ciclo marcar / destildar: los dos campos quedan DESHABILITADOS y su valor vuelve;
 *   - los CONSUMIDORES de la VCI con la casilla marcada: ninguno puede afirmar normalidad;
 *   - guardar, reabrir y «Nuevo estudio».
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant11_vci.json';

const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach((id) => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(st);
  /* La pestania y el acordeon por su BOTON REAL: showTab programatico deja la .card sin caja. */
  const tb = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'))
    .filter((x) => /VD\\s*\\/\\s*AD/i.test(x.textContent || ''))[0];
  if (tb) tb.click();
  const h = document.querySelector('#sacc-ad .sacc-hdr');
  if (h && h.getAttribute('aria-expanded') !== 'true') h.click();
  return !!(tb && h);
})()`;

const SEMBRAR = `((c) => {
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  Object.keys(c).forEach((k) => S(k, c[k]));
  return true;
})`;

const FOTO = `(() => {
  const out = {};
  const T = (id) => { const e = document.getElementById(id);
    return e ? String(e.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE' };
  const V = (id) => { const e = document.getElementById(id); return e ? String(e.value) : 'NO EXISTE' };
  const D = (id) => { const e = document.getElementById(id); return e ? (e.disabled ? 'SI' : 'no') : 'NO EXISTE' };
  out.vci_diam = V('vci_diam'); out.vci_col = V('vci_col'); out.vci_no_vis = V('vci_no_vis');
  out.dis_diam = D('vci_diam'); out.dis_col = D('vci_col');
  const b = document.getElementById('vci-no-vis-mk');
  out.pressed = b ? b.getAttribute('aria-pressed') : 'NO EXISTE';
  /* CONSUMIDORES. Ninguno puede afirmar normalidad con la casilla marcada. */
  out.pmad = V('pmad'); out.pmad_interp = T('pmad-interp');
  try { out.dpt_pletora = JSON.stringify((typeof dptPletora === 'function') ? dptPletora() : 'NO'); } catch (e) { out.dpt_pletora = 'EXC' }
  try { const vx = (typeof vexusEstado === 'function') ? vexusEstado() : null;
        out.vexus = vx ? (vx.score + '|' + vx.evaluados) : 'null'; } catch (e) { out.vexus = 'EXC' }
  try { const S2 = { num: (k) => { const e = document.getElementById(k); const n = e ? parseFloat(String(e.value).replace(',', '.')) : NaN; return isFinite(n) ? n : null },
                     txt: (k) => { const e = document.getElementById(k); return e ? String(e.value) : '' } };
        const sg = (typeof _htp2022Signos === 'function') ? _htp2022Signos(S2) : null;
        out.htp_vci = sg ? JSON.stringify((sg.filter ? sg : []).filter ? sg.filter((x) => /cava|vci/i.test(x.lbl || '')) : sg) : 'null';
  } catch (e) { out.htp_vci = 'EXC ' + String(e).slice(0, 50) }
  try { out.cvr = T('cvr-concl'); } catch (e) { out.cvr = 'EXC' }
  /* El papel. generarInforme cambia de pestania: se mide al final. */
  return out;
})()`;

const GEOM = `(() => {
  const b = document.getElementById('vci-no-vis-mk');
  if (!b) return { caja: 'NO EXISTE' };
  b.scrollIntoView({ block: 'center' });
  const r = b.getBoundingClientRect();
  const af = getComputedStyle(b, '::after');
  const ext = (v) => Math.abs(parseFloat(v) || 0);
  const w = r.width + ext(af.left) + ext(af.right), h = r.height + ext(af.top) + ext(af.bottom);
  const x0 = r.left - ext(af.left), y0 = r.top - ext(af.top);
  const pts = [[x0 + 2, y0 + 2], [x0 + w - 2, y0 + 2], [x0 + 2, y0 + h - 2],
               [x0 + w - 2, y0 + h - 2], [x0 + w / 2, y0 + h / 2]];
  let propios = 0; const ajenos = [];
  pts.forEach((p) => { const e = document.elementFromPoint(p[0], p[1]);
    if (e === b || (e && b.contains(e))) propios++;
    else if (e && e.closest && e.closest('input, select, textarea, button')) ajenos.push((e.id || e.tagName));
  });
  const lbl = b.parentElement ? String(b.parentElement.textContent || '').replace(/\\s+/g, ' ').trim() : '';
  return { caja: Math.round(r.width) + 'x' + Math.round(r.height),
           tactil: Math.round(w) + 'x' + Math.round(h), propios: propios + '/5',
           enOtroControl: ajenos, rotulo: lbl,
           scrollH: document.documentElement.scrollWidth > document.documentElement.clientWidth ? 'SI' : 'NO' };
})()`;

const ESCENA = { ad_area: '20', vci_diam: '24', vci_col: '<50', tapse: '18', it_vel: '3.1',
                 vexus_sh: 'normal', vexus_pv: 'leve', vexus_ir: 'normal', peso: '70', talla: '170' };

const browser = await chromium.launch({ channel: 'chrome' });
const res = {};
for (const w of [1440, 1000, 768, 390]) {
  for (const tema of ['dark', 'light']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
    await page.goto('file://' + FILE);
    await page.waitForTimeout(900);
    await page.evaluate(`document.documentElement.setAttribute('data-theme','${tema}')`);
    const abrio = await page.evaluate(PREP);
    await page.waitForTimeout(400);
    await page.evaluate(`(${SEMBRAR})(${JSON.stringify(ESCENA)})`);
    await page.waitForTimeout(400);
    const r = { _abrio: abrio, _errores: errs };
    r.geom = await page.evaluate(GEOM);
    r.antes = await page.evaluate(FOTO);
    /* GESTO REAL: el clic sobre el boton, no la funcion. */
    try { await page.click('#vci-no-vis-mk', { timeout: 5000 }); } catch (e) { r._clic = 'FALLO ' + String(e).slice(0, 60) }
    await page.waitForTimeout(400);
    r.marcada = await page.evaluate(FOTO);
    try { await page.click('#vci-no-vis-mk', { timeout: 5000 }); } catch (e) {}
    await page.waitForTimeout(400);
    r.destildada = await page.evaluate(FOTO);
    /* SIEMBRA MUDA: el camino de restaurar un estudio guardado -asignar .value sin evento- y
       despues el embudo. Sin esto no se prueba la reconciliacion. */
    await page.evaluate(`(() => { const h = document.getElementById('vci_no_vis'); if (h) h.value = '1';
      const d = document.getElementById('vci_diam'); if (d) d.value = '24';
      const c = document.getElementById('vci_col'); if (c) c.value = '<50';
      try { if (typeof _recalcModulos === 'function') _recalcModulos('vci'); } catch (e) {} })()`);
    await page.waitForTimeout(400);
    r.muda = await page.evaluate(FOTO);
    /* «Nuevo estudio»: la casilla no puede sobrevivir al paciente siguiente. */
    await page.evaluate(`(() => { try { limpiarCampos(true) } catch (e) {} })()`);
    await page.waitForTimeout(400);
    r.nuevoEstudio = await page.evaluate(FOTO);
    r._errores = errs;
    res[w + 'px_' + tema] = r;
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito: ' + OUTF);
