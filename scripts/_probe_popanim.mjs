#!/usr/bin/env node
/**
 * _probe_popanim.mjs - la ANIMACION del esquema del posoperatorio (POP-V2-4, 2026-10-29).
 *
 * Mide tres cosas y las tres necesitan tiempo real, asi que no entran en el A/B:
 *   1. el balon se infla en la DIASTOLE y no en la sistole — por `popEsqBalonRx`, que es el
 *      dueno unico de esa curva, y ademas sobre el atributo `rx` del nodo vivo;
 *   2. la helice del Impella GIRA — dos lecturas del transform separadas en el tiempo;
 *   3. con «reducir movimiento» se dibuja UN cuadro y ahi queda.
 *
 * SOLO LECTURA. No muta index.html. SIN acentos graves (scripts/check_backticks.py).
 *   node scripts/_probe_popanim.mjs [--file /tmp/arbol.html]
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const ABRIR = function (asist) {
  ['modalAvisoEco', 'login-overlay'].forEach(function (id) {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  try { if (typeof showTab === 'function') showTab('hemodinamica'); } catch (e) {}
  const s = document.getElementById('pop-seccion');
  if (s && s.style.display === 'none') {
    const h = document.querySelector('[onclick*="pop-seccion"]');
    if (h) h.click(); else s.style.display = 'block';
  }
  const S = function (id, v) { const e = document.getElementById(id); if (!e) return;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); };
  S('peso', '70'); S('talla', '170'); S('pop_monitor', 'swan');
  S('pop_sw_gc', '3.2'); S('pop_sw_pam', '70'); S('pop_asist_tipo', asist);
  /* El dibujo tiene que estar A LA VISTA: el observador apaga el bucle cuando no se ve, y medir
     «no se mueve» sobre un SVG fuera de la ventana es un verde sobre cero elementos. */
  const svg = document.getElementById('pop-esq-svg');
  if (svg) svg.scrollIntoView({ block: 'center' });
  try { if (typeof popEsqPintar === 'function') popEsqPintar(); } catch (e) {}
  return !!svg;
};

const b = await chromium.launch({ channel: 'chrome' });
const R = { archivo: FILE };
/* ── 1 y 2 · con movimiento ── */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(1000);
  R.visible = await pg.evaluate(ABRIR, 'bcia');
  await pg.waitForTimeout(400);
  /* La curva, por su dueno unico: la sistole de este dibujo es la fase 0 a 0,35. */
  R.balonRx = await pg.evaluate(function () {
    if (typeof popEsqBalonRx !== 'function') return 'NO EXISTE popEsqBalonRx';
    return [0, 0.1, 0.2, 0.34, 0.35, 0.40, 0.45, 0.6, 0.89, 0.9, 0.95, 1]
      .map(function (f) { return f + '=' + popEsqBalonRx(f).toFixed(2) }).join(' ');
  });
  /* Y sobre el nodo vivo: ochenta lecturas del atributo, y el minimo y el maximo. */
  R.balonNodo = await pg.evaluate(async function () {
    const e = document.querySelector('[data-pop-esq="balon"]');
    if (!e) return 'NO EXISTE el nodo';
    const vs = [];
    for (let i = 0; i < 80; i++) {
      vs.push(Number(e.getAttribute('rx')));
      await new Promise(function (r) { requestAnimationFrame(function () { r() }) });
    }
    const u = Array.from(new Set(vs.map(function (x) { return x.toFixed(1) })));
    return { min: Math.min.apply(null, vs), max: Math.max.apply(null, vs), distintos: u.length,
             display: e.getAttribute('display') || 'inline' };
  });
  /* La helice: dos lecturas separadas. */
  await pg.evaluate(ABRIR, 'impella');
  await pg.waitForTimeout(400);
  R.helice = await pg.evaluate(async function () {
    const g = document.querySelector('[data-pop-esq="helice"]');
    if (!g) return 'NO EXISTE';
    const t1 = g.getAttribute('transform');
    await new Promise(function (r) { setTimeout(r, 400) });
    const t2 = g.getAttribute('transform');
    return { t1: t1, t2: t2, gira: t1 !== t2,
             impella: (document.querySelector('[data-pop-esq="impella"]') || {}).getAttribute
               ? document.querySelector('[data-pop-esq="impella"]').getAttribute('display') : 'no' };
  });
  /* El ECMO venovenoso: su cano se mueve. */
  await pg.evaluate(ABRIR, 'ecmo_vv');
  await pg.waitForTimeout(400);
  R.ecmoVV = await pg.evaluate(async function () {
    const e = document.querySelector('[data-pop-esq="ecmovv"]');
    if (!e) return 'NO EXISTE';
    const a = e.getAttribute('stroke-dashoffset');
    await new Promise(function (r) { setTimeout(r, 400) });
    return { a: a, b: e.getAttribute('stroke-dashoffset'), display: e.getAttribute('display') || 'inline' };
  });
  await ctx.close();
}
/* ── 3 · con «reducir movimiento» ── */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const pg = await ctx.newPage();
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(1000);
  await pg.evaluate(ABRIR, 'impella');
  await pg.waitForTimeout(600);
  R.reducido = await pg.evaluate(async function () {
    const g = document.querySelector('[data-pop-esq="helice"]');
    const t1 = g ? g.getAttribute('transform') : 'NO EXISTE';
    await new Promise(function (r) { setTimeout(r, 500) });
    const t2 = g ? g.getAttribute('transform') : 'NO EXISTE';
    return { t1: t1, t2: t2, quieta: t1 === t2,
             reduce: (window._popEsq || {}).reduce, raf: (window._popEsq || {}).rafId };
  });
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(R, null, 1));
process.exit(0);
