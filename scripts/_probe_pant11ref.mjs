#!/usr/bin/env node
/**
 * _probe_pant11ref.mjs - las fichas NUEVAS de Referencias de PANT-11 (commits 10 y 11).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide: que la ficha exista, que este dentro de su subpestania -la leccion de `constriccion`
 * en la tanda J-, que el BUSCADOR la indexe, el conteo de fichas antes y despues, y que no
 * haya recortes ni scroll de pagina a los cuatro anchos.
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
const OUTF = arg('--out') || '/tmp/pant11_ref.json';
const CLAVES = (arg('--claves') || 'tumores,embolig').split(',');

const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach((id) => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(st);
  const b = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'))
    .filter((x) => /Referencias/i.test(x.textContent || ''))[0];
  if (b) b.click();
  return !!b;
})()`;

const browser = await chromium.launch({ channel: 'chrome' });
const res = {};
for (const w of [1440, 1000, 768, 390]) {
  for (const tema of ['dark', 'light']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
    await page.goto('file://' + FILE);
    await page.waitForTimeout(900);
    if (tema === 'light') await page.evaluate(`document.documentElement.classList.add('light-mode')`);
    const abrio = await page.evaluate(PREP);
    await page.waitForTimeout(400);
    const r = { _abrio: abrio };
    r.fichasTotal = await page.evaluate(`document.querySelectorAll('h2.card-head[onclick*="toggleRef("]').length`);
    r.fichas = {};
    for (const k of CLAVES) {
      r.fichas[k] = await page.evaluate(`((k) => {
        const h = Array.prototype.slice.call(document.querySelectorAll('h2.card-head'))
          .filter((x) => (x.getAttribute('onclick') || '').indexOf("toggleRef('" + k + "'") >= 0)[0];
        if (!h) return { existe: 'NO' };
        /* ¿Dentro de una subpestania? La leccion de constriccion en la tanda J. */
        const sub = h.closest('.ref-subpanel');
        /* Se abre por su encabezado REAL. */
        h.click();
        const d = document.getElementById('ref-' + k);
        const vis = d ? getComputedStyle(d).display !== 'none' : false;
        const filas = d ? d.querySelectorAll('tbody tr, table tr').length : 0;
        const txt = d ? String(d.textContent || '').replace(/\\\\s+/g, ' ').trim() : '';
        const folios = (txt.match(/folio/g) || []).length;
        const rec = d ? Array.prototype.slice.call(d.querySelectorAll('td, th'))
          .filter((e) => e.scrollWidth > e.clientWidth + 2 && e.getBoundingClientRect().width > 0).length : 0;
        /* ¿La indexa el buscador? */
        let idx = 'no';
        try { const ii = (typeof _refIndiceArmar === 'function') ? _refIndiceArmar(true) : null;
          if (ii) idx = ii.some((x) => String(x.k || x.clave || x.id || '') === k) ? 'SI' : 'no'; } catch (e) { idx = 'EXC' }
        return { existe: 'SI', sub: sub ? sub.id : 'FUERA DE SUBPESTANIA', visible: vis,
                 filas: filas, chars: txt.length, folios: folios, recortes: rec, indexada: idx,
                 scrollPagina: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ? 'SI' : 'NO' };
      })('${k}')`);
    }
    r._errores = errs;
    res[w + 'px_' + tema] = r;
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito: ' + OUTF);
