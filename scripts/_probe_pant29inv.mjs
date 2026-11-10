#!/usr/bin/env node
/**
 * _probe_pant29inv.mjs - sonda de INVENTARIO de la tanda PANT-29 (2026-11-10). SOLO LECTURA:
 * no escribe un solo campo del estudio ni toca index.html. Mide, con el GESTO REAL:
 *  (a) Referencias: textContent de cada resumen de `ref-miocard`, de las dos fichas grandes de
 *      PANT-28, de `ref-coronarias`, de `ref-racong` y de `ref-congenitas`; el reparto de
 *      `REF_SUBTAB` y el tamanio del indice del buscador.
 *  (b) el globo `otr-rac` ABIERTO con su boton real, en caracteres.
 *  (c) Contractilidad: las dos tarjetas grises a 1440, 1000, 768 y 390 px, con el 3D cerrado y
 *      abierto, mas el recuadro del 3D y la fila de orientacion.
 * Nombre propio: verificado con ls, no existia.
 * ⚠️ DENOMINADOR: cada ficha se ABRE por su encabezado y se verifica que su cuerpo tenga caja
 *    (offsetParent) antes de contar; el globo se abre por su boton y se mide #vinfo-card.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              process.env.HOME + '/.pwtmp/node_modules/playwright-core/index.js',
              'playwright'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.error('sin playwright'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const errs = [];
const navegador = await chromium.launch({ channel: 'chrome' });
const ctx = await navegador.newContext({ viewport: { width: 1440, height: 980 } });
const pg = await ctx.newPage();
pg.on('console', m => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 140)) });
pg.on('pageerror', e => errs.push('pagina: ' + String(e).slice(0, 140)));
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2600);
await pg.addStyleTag({ content: '*{transition:none !important;animation:none !important}' });

/* ── (a) Referencias ──────────────────────────────────────────────────── */
const REFS = await pg.evaluate(() => {
  const o = { fichas: {}, notas: [] };
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  const clic = el => { if (!el) return false; el.click(); return true };
  const botRefs = Array.prototype.slice.call(document.querySelectorAll('button,[onclick]'))
    .filter(b => ((b.getAttribute('onclick') || '').indexOf("'refs'") > -1))[0];
  o.botRefs = !!botRefs;
  if (botRefs) clic(botRefs); else if (window.showTab) showTab('refs');
  o.subtab = (typeof REF_SUBTAB !== 'undefined')
    ? Object.keys(REF_SUBTAB).map(k => k + ':' + REF_SUBTAB[k].join('|')) : null;
  o.reparto = (typeof REF_SUBTAB !== 'undefined')
    ? Object.keys(REF_SUBTAB).reduce((a, k) => a + REF_SUBTAB[k].length, 0) : null;
  /* El reparto que PANT-28 publica como «43 entradas» son los ENCABEZADOS con `toggleRef`
     dentro de los nueve paneles, no las claves de REF_SUBTAB: se cuentan los dos. */
  o.cabezas = (function () {
    let n = 0;
    (typeof REF_SUB_ORDEN !== 'undefined' ? REF_SUB_ORDEN : []).forEach(function (sub) {
      const pan = document.getElementById('ref-sub-' + sub);
      if (pan) n += pan.querySelectorAll("h2.card-head[onclick*=\"toggleRef('\"]").length;
    });
    return n;
  })();
  o.idx = (typeof _refIndiceArmar === 'function') ? _refIndiceArmar(true).length : null;
  o.idxIds = (typeof _refIndice !== 'undefined' && _refIndice) ? _refIndice.map(e => e.id) : null;
  const SUB = { miocard: 'otros', atleta: 'otros', chagas: 'otros',
                coronarias: 'congenitas', racong: 'congenitas', congenitas: 'congenitas' };
  Object.keys(SUB).forEach(id => {
    const sb = document.getElementById('ref-subtab-' + SUB[id]);
    if (sb) clic(sb);
    const pan = document.getElementById('ref-sub-' + SUB[id]);
    const cuerpo = document.getElementById('ref-' + id);
    if (!cuerpo) { o.fichas[id] = { existe: false }; return }
    const card = cuerpo.closest('.card');
    const cab = card ? card.querySelector('h2.card-head') : null;
    const cerrada = getComputedStyle(cuerpo).display === 'none';
    if (cab) clic(cab);
    const abierta = getComputedStyle(cuerpo).display !== 'none';
    const hijos = Array.prototype.slice.call(cuerpo.children).map(ch => ({
      tag: ch.tagName, chars: norm(ch.textContent).length,
      ini: norm(ch.textContent).slice(0, 72)
    }));
    o.fichas[id] = {
      existe: true, enPanel: !!(pan && pan.contains(cuerpo)), naceCerrada: cerrada,
      abierta: abierta, chars: norm(cuerpo.textContent).length,
      hijos: hijos.length, det: hijos,
      titulo: cab ? norm(cab.textContent).replace(/[\u25b6\u25bc]/g, '').trim() : null
    };
    if (cab) clic(cab);
  });
  return o;
});

/* ── (b) el globo otr-rac, abierto con su boton real ──────────────────── */
const GLOBO = await pg.evaluate(() => {
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  const o = {};
  const tabs = Array.prototype.slice.call(document.querySelectorAll('button,[onclick]'));
  const t = tabs.filter(b => ((b.getAttribute('onclick') || '').indexOf("'otros'") > -1))[0];
  if (t) t.click(); else if (window.showTab) showTab('otros');
  o.tabOtros = !!t;
  /* ⚠️ DENOMINADOR: el boton vive DENTRO de la seccion plegable «variantes» de Otros, que nace
     cerrada. Con el acordeon cerrado el boton mide 0x0 y `_vInfoColocar` devuelve null, asi que
     la tarjeta no abre y la medicion da CERO caracteres sobre un globo que si existe. */
  const cab = Array.prototype.slice.call(document.querySelectorAll('h2.card-head'))
    .filter(h => (h.getAttribute('onclick') || '').indexOf("'variantes'") > -1)[0];
  o.cabVariantes = !!cab;
  if (cab) cab.click();
  const b = document.querySelector('[data-vinfo="otr-rac"]');
  if (!b) return { existe: false };
  o.existe = true;
  const rb = b.getBoundingClientRect();
  o.botonCaja = Math.round(rb.width) + 'x' + Math.round(rb.height);
  b.scrollIntoView({ block: 'center' });
  b.click();
  const c = document.getElementById('vinfo-card');
  o.visible = !!(c && c.offsetParent !== null);
  o.chars = c ? norm(c.textContent).length : null;
  o.crudo = c ? norm(c.textContent) : null;
  /* El mismo contenido por la via del clon, que es como lo midio PANT-28. */
  o.clonChars = window._otrRefClon ? norm(window._otrRefClon('ref-coronarias').textContent).length : null;
  if (b) b.click();
  return o;
});

/* ── (c) Contractilidad: las dos tarjetas a cuatro anchos ─────────────── */
const ANCHOS = [1440, 1000, 768, 390];
const CONTR = {};
for (const w of ANCHOS) {
  await pg.setViewportSize({ width: w, height: 980 });
  await pg.waitForTimeout(260);
  CONTR[w] = await pg.evaluate(() => {
    const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
    const o = {};
    const bot = Array.prototype.slice.call(document.querySelectorAll('button,[onclick]'));
    const t = bot.filter(b => ((b.getAttribute('onclick') || '').indexOf("'contractilidad'") > -1))[0];
    if (t) t.click(); else if (window.showTab) showTab('contractilidad');
    o.tabContr = !!t;
    /* El acordeon de la seccion puede estar cerrado: se abre por su encabezado real. */
    const caja = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } };
    const abrirSec = () => {
      const h = document.getElementById('lv3d-btn');
      if (h && h.offsetParent === null) {
        const heads = Array.prototype.slice.call(document.querySelectorAll('h2,h3,.sec-head,[onclick]'));
        const s = heads.filter(x => norm(x.textContent).indexOf('Contractilidad') >= 0)[0];
        if (s) s.click();
      }
    };
    abrirSec();
    const medir = () => ({
      hall: caja(document.getElementById('lv3d-bloque-hallazgos')),
      bot: caja(document.getElementById('lv3d-bloque-botones')),
      fila: caja(document.getElementById('lv3d-fila')),
      panel: caja(document.getElementById('lv3d-panel')),
      lienzo: caja(document.getElementById('lv3d-lienzo')),
      datos: caja(document.getElementById('lv3d-datos')),
      cols: (function () { const f = document.getElementById('lv3d-fila'); return f ? getComputedStyle(f).gridTemplateColumns : null })(),
      padHall: (function () { const e = document.getElementById('lv3d-bloque-hallazgos'); return e ? getComputedStyle(e).padding : null })(),
      texto: norm((document.getElementById('contr-texto-informe') || {}).textContent)
    });
    const b3d = document.getElementById('lv3d-btn');
    o.cerrado = medir();
    o.btn3d = caja(b3d);
    if (b3d) b3d.click();
    o.abierto = medir();
    o.vistas = Array.prototype.slice.call(document.querySelectorAll('#lv3d-panel .lv3d-vista'))
      .map(b => ({ t: norm(b.textContent), ...caja(b) }));
    o.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    if (b3d) b3d.click();
    return o;
  });
}

const terr = await pg.evaluate(() => {
  const o = {};
  if (typeof CONTR_TERRITORIO === 'undefined') return null;
  for (let s = 1; s <= 17; s++) {
    const id = LV3D_SEG_ID[s], col = CONTR_TERRITORIO[id];
    const n = CONTR_TERRITORIO_NOMBRE[col] || '?';
    (o[n] = o[n] || []).push(s);
  }
  return o;
});

console.log(JSON.stringify({ REFS, GLOBO, CONTR, terr, errs }, null, 1));
await navegador.close();
process.exit(0);
