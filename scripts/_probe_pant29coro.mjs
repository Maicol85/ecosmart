#!/usr/bin/env node
/**
 * _probe_pant29coro.mjs - verificacion del commit 5 de PANT-29 (2026-11-10): el boton
 * «Coronarias», las arterias en el pintor 2D y su panel. Corre sobre UN arbol (`--file`) y se
 * usa en SERIE sobre los dos.
 * ⚠️ DENOMINADOR, Y SIN EL NADA DE ESTO PRUEBA ALGO: hay que (1) abrir la pestania por su
 *    `onclick`, (2) CARGAR EL DDVI de verdad —sin DDVI ni VDFVI el pintor escribe el mensaje y
 *    `lv3dPintar` devuelve CERO poligonos: el canvas queda en blanco y todo da «igual»—,
 *    (3) abrir el 3D por `#lv3d-btn` y confirmar `lv3dDiag().abierto`, y (4) PAUSAR la animacion
 *    y fijar la fase antes de comparar pixeles, o dos capturas del mismo arbol ya difieren.
 * Nombre propio: verificado con ls, no existia.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              process.env.HOME + '/.pwtmp/node_modules/playwright-core/index.js', 'playwright'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.error('sin playwright'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const errs = [];
const navegador = await chromium.launch({ channel: 'chrome' });
const ctx = await navegador.newContext({ viewport: { width: 1440, height: 1000 } });
const pg = await ctx.newPage();
pg.on('console', m => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 140)) });
pg.on('pageerror', e => errs.push('pagina: ' + String(e).slice(0, 140)));
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2600);
await pg.addStyleTag({ content: '*{transition:none !important}' });

/* ── montaje: pestania, DDVI/FEVI de verdad, 3D abierto, animacion PAUSADA ── */
const prep = await pg.evaluate(() => {
  const o = {};
  const bot = Array.prototype.slice.call(document.querySelectorAll('button,[onclick]'));
  const t = bot.filter(b => ((b.getAttribute('onclick') || '').indexOf("'contractilidad'") > -1))[0];
  if (t) t.click(); else if (window.showTab) showTab('contractilidad');
  /* El DDVI de verdad vive en AI/VI y se llama `ddfvi`; `ete_shunt_ddvi_ro` es un espejo de
     solo lectura y sembrarlo NO da tamanio al 3D. */
  const sem = (id, val) => { const e = document.getElementById(id); if (!e) return false;
    e.value = val; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true };
  o.ddfvi = sem('ddfvi', '58'); o.vdfvi = sem('vdfvi', '140');
  o.vsfvi = sem('vsfvi', '56'); o.fevi = sem('fevi', '60');
  try { if (typeof calcVI === 'function') calcVI() } catch (e) {}
  return o;
});
await pg.waitForTimeout(700);
const abrir = await pg.evaluate(() => {
  const b = document.getElementById('lv3d-btn');
  const dg0 = window.lv3dDiag ? window.lv3dDiag() : {};
  if (b && !dg0.abierto) b.click();
  return { btn: !!b };
});
await pg.waitForTimeout(900);
/* Pausa y fase fija: sin esto dos capturas del MISMO arbol ya difieren. */
const fijar = async (fase) => await pg.evaluate((fase) => {
  const p = document.getElementById('lv3d-play');
  const dg = window.lv3dDiag ? window.lv3dDiag() : {};
  /* el boton dice «Pausa» cuando esta corriendo */
  if (p && /Pausa/.test(p.textContent || '')) p.click();
  const sl = document.querySelector('#lv3d-panel .lv3d-fase');
  if (sl) { sl.value = String(Math.round(fase * 100)); sl.dispatchEvent(new Event('input', { bubbles: true })) }
  return { play: p ? p.textContent.trim() : null };
}, fase);
await fijar(0);
await pg.waitForTimeout(350);

const estado = async () => await pg.evaluate(() => {
  const cv = document.getElementById('lv3d-canvas');
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } };
  return {
    diag: window.lv3dDiag ? window.lv3dDiag() : null,
    coro: window.lv3dCoroDiag ? window.lv3dCoroDiag() : null,
    polis: window.lv3dDiag ? undefined : undefined,
    png: cv ? cv.toDataURL('image/png').length : null,
    hash: cv ? (function () { const d = cv.toDataURL('image/png'); let h = 5381;
      for (let i = 0; i < d.length; i++) h = ((h * 33) ^ d.charCodeAt(i)) >>> 0; return h })() : null,
    lienzo: caja(document.getElementById('lv3d-lienzo')),
    colDer: caja(document.getElementById('lv3d-col-der')),
    panel: caja(document.getElementById('lv3d-coro-panel')),
    pie: (function () { const e = document.getElementById('lv3d-coro-pie'); return e ? (e.offsetParent !== null) : null })(),
    vistaTxt: (function () { const e = document.querySelector('.lv3d-coro-vista-txt'); return e ? (getComputedStyle(e).display !== 'none') : null })(),
    vistaBtn: (function () { const e = document.querySelector('.lv3d-coro-vista-btn'); return e ? (e.textContent || '').trim() : null })(),
    nVista: document.querySelectorAll('#lv3d-panel .lv3d-vista').length,
    botones44: Array.prototype.slice.call(document.querySelectorAll('#lv3d-coro-panel .btn, #lv3d-panel .lv3d-coro-btn'))
      .map(b => { const r = b.getBoundingClientRect(); return Math.round(r.height) }),
    scrollH: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    leyenda: (function () { const e = document.getElementById('lv3d-coro-pie'); return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : null })()
  };
});

const R = { prep, abrir, fijar: await fijar(0) };
R.off = await estado();
/* ── prender ─────────────────────────────────────────────────────────────── */
const sembrar = async (segs) => await pg.evaluate((segs) => {
  for (let s = 1; s <= 17; s++) contrSetSegmento(LV3D_SEG_ID[s], 0);
  segs.forEach(s => contrSetSegmento(LV3D_SEG_ID[s], 1));
  return true;
}, segs);
const coroClic = async () => { await pg.evaluate(() => { const b = document.querySelector('#lv3d-panel .lv3d-coro-btn'); if (b) b.click() }); await pg.waitForTimeout(260) };
R.existeBoton = await pg.evaluate(() => !!document.querySelector('#lv3d-panel .lv3d-coro-btn'));
/* ⚠️ CONTROL: contra la copia de HEAD el boton NO EXISTE, y todo lo de abajo mide sobre la nada.
   Se corta aca y se publica solo `R.off`, que es lo que hace comparable el canvas con el boton
   apagado: ese hash es la prueba de que el 3D quedo identico. */
if (!R.existeBoton) {
  console.log(JSON.stringify({ file: FILE, R, errs, soloOff: true }, null, 1));
  await navegador.close();
  process.exit(0);
}
await coroClic();
R.on = await estado();
/* ── el tramo gris sigue el nivel: TRES combinaciones ───────────────────── */
R.tramos = {};
for (const [n, segs] of [['solo-DA', [1, 7, 13]], ['medios-CD', [9, 10]], ['solo-17', [17]]]) {
  await sembrar(segs); await pg.waitForTimeout(260);
  R.tramos[n] = await pg.evaluate(() => {
    const so = window.lv3dCoroSonda ? window.lv3dCoroSonda(_lv3d_fase_dummy_undefined => 0) : null;
    const s0 = window.lv3dCoroSonda ? window.lv3dCoroSonda(0) : null;
    return { eff: s0 ? s0.eff : null, letras: s0 ? s0.letras : null, segs: s0 ? s0.segs : null,
             linea: (function () { const e = document.getElementById('contr-arterias-li');
               return e ? Array.prototype.slice.call(e.children).map(d => (d.textContent || '').trim()) : null })() };
  });
}
/* ── pegadas a la pared en CUATRO fases ─────────────────────────────────── */
await sembrar([7, 9]); await pg.waitForTimeout(220);
R.fases = await pg.evaluate(() => {
  const o = {};
  [0, 0.33, 0.66, 1].forEach(v => {
    const s = window.lv3dCoroSonda(v);
    let peor = 0, rmin = 1e9, rmax = -1e9, n = 0;
    s.arterias.forEach(a => a.m.forEach(m => {
      if (m.coc === null) return;
      peor = Math.max(peor, Math.abs(m.coc - m.k)); rmin = Math.min(rmin, m.rp); rmax = Math.max(rmax, m.rp); n++;
    }));
    o['f' + v] = { peorDesvio: +peor.toFixed(9), muestras: n, rMin: +rmin.toFixed(4), rMax: +rmax.toFixed(4) };
  });
  return o;
});
/* ── los puntos caen en el territorio de su arteria ─────────────────────── */
R.territorio = await pg.evaluate(() => {
  const s = window.lv3dCoroSonda(0), o = {};
  s.arterias.forEach(a => {
    if (!a.n) return;
    const tot = a.m.length, prox = Math.ceil(tot * 0.1);
    const dist = a.m.slice(prox);
    o[a.n] = { grupo: a.g, total: tot, kMax: Math.max.apply(null, a.m.map(m => m.k)),
               enSuTerritorio: dist.filter(m => m.ter === a.g).length, mirados: dist.length,
               ter: dist.map(m => m.ter).filter((x, i, arr) => arr.indexOf(x) === i) };
  });
  return o;
});
/* ── dominancia: cambia el duenio de DP y PL ────────────────────────────── */
R.dom = {};
for (const d of [0, 1, 2]) {
  await pg.evaluate((d) => { const b = document.querySelector('#lv3d-coro-panel .lv3d-coro-dom[data-d="' + d + '"]'); if (b) b.click() }, d);
  await pg.waitForTimeout(220);
  R.dom['d' + d] = await pg.evaluate(() => {
    const s = window.lv3dCoroSonda(0);
    const g = {}; s.arterias.forEach(a => { if (a.n) g[a.n] = a.g });
    return { dom: s.dom, duenio: g, nArt: s.arterias.length, segs: s.segs,
             pressed: Array.prototype.slice.call(document.querySelectorAll('#lv3d-coro-panel .lv3d-coro-dom'))
               .map(b => b.getAttribute('aria-pressed')).join(',') };
  });
}
await pg.evaluate(() => { const b = document.querySelector('#lv3d-coro-panel .lv3d-coro-dom[data-d="0"]'); if (b) b.click() });
/* ── las seis vistas giran el dibujo y el boton lo dice ─────────────────── */
R.vistas = {};
for (let v = 0; v < 6; v++) {
  await pg.evaluate((v) => {
    const b = document.querySelector('.lv3d-coro-vista-btn'); if (b) b.click();
    const o = document.querySelector('#lv3d-coro-lista .lv3d-coro-v[data-v="' + v + '"]'); if (o) o.click();
  }, v);
  await pg.waitForTimeout(240);
  R.vistas['v' + v] = await pg.evaluate(() => {
    const cv = document.getElementById('lv3d-canvas');
    const d = cv ? cv.toDataURL('image/png') : '';
    let h = 5381; for (let i = 0; i < d.length; i++) h = ((h * 33) ^ d.charCodeAt(i)) >>> 0;
    return { btn: (document.querySelector('.lv3d-coro-vista-btn') || {}).textContent.trim(),
             txt: (function () { const e = document.querySelector('.lv3d-coro-vista-txt'); return e ? getComputedStyle(e).display !== 'none' : null })(),
             R: JSON.stringify(window.lv3dCoroSonda ? null : null),
             hash: h >>> 0, vista: window.lv3dCoroDiag().vista };
  });
}
/* ── soltar la vista: girar con el dedo ─────────────────────────────────── */
R.soltar = await pg.evaluate(() => {
  const cv = document.getElementById('lv3d-canvas');
  const r = cv.getBoundingClientRect();
  const ev = (t, x, y) => cv.dispatchEvent(new PointerEvent(t, { bubbles: true, clientX: x, clientY: y, buttons: 1, pointerId: 1 }));
  ev('pointerdown', r.left + 100, r.top + 100);
  ev('pointermove', r.left + 160, r.top + 130);
  cv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: r.left + 160, clientY: r.top + 130, buttons: 0, pointerId: 1 }));
  return { vista: window.lv3dCoroDiag().vista,
           btn: (document.querySelector('.lv3d-coro-vista-btn') || {}).textContent.trim(),
           txt: (function () { const e = document.querySelector('.lv3d-coro-vista-txt'); return e ? getComputedStyle(e).display !== 'none' : null })() };
});
/* ── soltar con un boton de punta ───────────────────────────────────────── */
R.soltarPunta = await pg.evaluate(() => {
  const b = document.querySelector('.lv3d-coro-vista-btn'); if (b) b.click();
  const o = document.querySelector('#lv3d-coro-lista .lv3d-coro-v[data-v="1"]'); if (o) o.click();
  const antes = window.lv3dCoroDiag().vista;
  const p = document.querySelector('#lv3d-panel .lv3d-vista[data-lv3d-vista="der"]'); if (p) p.click();
  return { antes: antes, despues: window.lv3dCoroDiag().vista };
});
/* ── transparente, letras y modo angiografia ────────────────────────────── */
R.toggles = await pg.evaluate(() => {
  const o = {}, h = () => { const cv = document.getElementById('lv3d-canvas'); const d = cv.toDataURL('image/png');
    let x = 5381; for (let i = 0; i < d.length; i++) x = ((x * 33) ^ d.charCodeAt(i)) >>> 0; return x >>> 0 };
  if (typeof lv3dDibujar === 'function') lv3dDibujar();
  o.base = h();
  const clic = sel => { const b = document.querySelector(sel); if (b) b.click(); if (typeof lv3dDibujar === 'function') lv3dDibujar() };
  clic('.lv3d-coro-transp'); o.transp = { hash: h(), est: lv3dCoroDiag().transp, letras: lv3dCoroSonda(0).letras.length };
  clic('.lv3d-coro-transp');
  clic('.lv3d-coro-letras'); o.sinLetras = { hash: h(), est: lv3dCoroDiag().letras };
  clic('.lv3d-coro-letras');
  const vb = document.querySelector('.lv3d-coro-vista-btn'); if (vb) vb.click();
  clic('.lv3d-coro-angio'); o.angio = { hash: h(), est: lv3dCoroDiag().angio };
  clic('.lv3d-coro-angio');
  o.vuelta = h();
  return o;
});
/* ── apagar reinicia todo menos la dominancia ───────────────────────────── */
R.apagar = await pg.evaluate(() => {
  const b2 = document.querySelector('#lv3d-coro-panel .lv3d-coro-dom[data-d="2"]'); if (b2) b2.click();
  const vb = document.querySelector('.lv3d-coro-vista-btn'); if (vb) vb.click();
  const o1 = document.querySelector('#lv3d-coro-lista .lv3d-coro-v[data-v="3"]'); if (o1) o1.click();
  const tr = document.querySelector('.lv3d-coro-transp'); if (tr) tr.click();
  const le = document.querySelector('.lv3d-coro-letras'); if (le) le.click();
  const vb2 = document.querySelector('.lv3d-coro-vista-btn'); if (vb2) vb2.click();
  const an = document.querySelector('.lv3d-coro-angio'); if (an) an.click();
  const antes = window.lv3dCoroDiag();
  const cb = document.querySelector('#lv3d-panel .lv3d-coro-btn'); if (cb) cb.click();
  const despues = window.lv3dCoroDiag();
  const pan = document.getElementById('lv3d-coro-panel');
  const pie = document.getElementById('lv3d-coro-pie');
  return { antes: antes, despues: despues,
           panelOculto: pan ? getComputedStyle(pan).display === 'none' : null,
           pieOculto: pie ? getComputedStyle(pie).display === 'none' : null };
});
/* ── «Nuevo estudio» tambien lo apaga y reinicia la dominancia ──────────── */
R.nuevo = await pg.evaluate(() => {
  const cb = document.querySelector('#lv3d-panel .lv3d-coro-btn'); if (cb) cb.click();
  const b2 = document.querySelector('#lv3d-coro-panel .lv3d-coro-dom[data-d="2"]'); if (b2) b2.click();
  const antes = window.lv3dCoroDiag();
  if (typeof lv3dNuevoPaciente === 'function') lv3dNuevoPaciente();
  return { antes: antes, despues: window.lv3dCoroDiag() };
});
/* ── la captura con Coronarias prendido: se MIDE, no se cambia ──────────── */
R.captura = await pg.evaluate(() => {
  const cb = document.querySelector('#lv3d-panel .lv3d-coro-btn'); if (cb) cb.click();
  const t = document.querySelector('#lv3d-panel .lv3d-cap-tomar'); if (t) t.click();
  const c = window.lv3dCaptura ? window.lv3dCaptura() : null;
  const o = { hay: !!c, coro: window.lv3dCoroDiag().coro };
  const q = document.querySelector('#lv3d-panel .lv3d-cap-quitar'); if (q) q.click();
  const cb2 = document.querySelector('#lv3d-panel .lv3d-coro-btn'); if (cb2) cb2.click();
  return o;
});

console.log(JSON.stringify({ file: FILE, R, errs }, null, 1));
await navegador.close();
process.exit(0);
