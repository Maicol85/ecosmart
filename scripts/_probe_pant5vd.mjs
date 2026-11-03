/*
 * _probe_pant5vd.mjs - la seccion de sobrecarga del VD y el esquema valvular 2D (PANT-5).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant5vd.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p5vd.json';
const ANCHOS = [1440, 1000, 768, 390];

const MEDIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  const R = (sel) => { const e = document.querySelector(sel); if (!e) return null;
    const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  try { showTab('hemodinamica') } catch (e) { o.tabErr = String(e) }
  /* La seccion se abre por su encabezado real. */
  const sec = document.getElementById('tep-seccion');
  if (sec && getComputedStyle(sec).display === 'none') {
    const h = document.querySelector('[onclick*="tep-seccion"]'); if (h) h.click();
  }
  o.secAbierta = sec ? getComputedStyle(sec).display !== 'none' : null;
  o.sec = R('#tep-seccion');
  o.campos = R('#tep-seccion .grid-2');
  o.calcbox = R('#tep-seccion .calc-box');
  /* Los campos de la seccion, por id. */
  o.ids = Array.prototype.slice.call(document.querySelectorAll('#tep-seccion input[id], #tep-seccion select[id]')).map(e => e.id);
  /* El dibujo nuevo: existe? */
  const dib = document.getElementById('vdsc-svg');
  o.dibujo = dib ? R('#vdsc-svg') : null;
  o.dibHost = document.getElementById('vdsc-caja') ? R('#vdsc-caja') : null;
  o.fila = document.getElementById('vdsc-fila') ? R('#vdsc-fila') : null;
  if (o.fila) { const f = document.getElementById('vdsc-fila');
    o.filaFlex = getComputedStyle(f).display;
    const hijos = Array.prototype.slice.call(f.children).map(c => { const r = c.getBoundingClientRect(); return Math.round(r.y*10)/10 });
    o.ladoALado = hijos.length > 1 ? (Math.max.apply(null,hijos) - Math.min.apply(null,hijos) < 20) : null; }
  /* El esquema valvular 2D: se abre por su boton real y se mide el ancho del SVG tal como se ve. */
  try { showTab('valvulas') } catch (e) {}
  try { const b = document.getElementById('v2d-abrir'); if (b) b.click() } catch (e) { o.v2dErr = String(e) }
  o.v2dVis = (function(){ const ov = document.getElementById('v2d-ov'); return ov ? !ov.hasAttribute('hidden') : null })();
  o.v2dSvg = R('#v2d-svg');
  o.v2dDibujo = R('#v2d-dibujo');
  o.v2dCard = R('#v2d-card');
  try { if (typeof v2dCerrar === 'function') v2dCerrar() } catch (e) {}
  return o;
})()`;

const res = { file: FILE, anchos: {} };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('C:' + m.text().slice(0, 160)) });
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1200);
    const r = await Promise.race([pg.evaluate(MEDIR),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout ' + w)), 60000))]);
    r.errores = errs.length;
    r.err1 = errs[0] || '';
    res.anchos[w] = r;
  } catch (e) { res.anchos[w] = { error: String(e).slice(0, 200) } }
  await ctx.close();
}
await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
