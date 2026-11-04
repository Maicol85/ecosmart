#!/usr/bin/env node
/**
 * _probe_pant11pant.mjs - sonda de PANTALLA de la tanda PANT-11 (2026-11-04).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide GEOMETRIA de las zonas que esta tanda toca, a los cuatro anchos y en los dos temas, con
 * la pestania y el acordeon abiertos por su BOTON REAL y las transiciones apagadas antes de
 * medir -la leccion de AJ9 y de NOC-B: una caja a mitad de transicion informa un rect que no
 * existe-. Se corre contra el arbol vivo y contra una copia de HEAD y se comparan los JSON.
 *
 *   node scripts/_probe_pant11pant.mjs --file /tmp/head.html --out /tmp/p.json --zona doppler
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant11_pant.json';
const ZONA = arg('--zona') || 'doppler';
const ANCHOS = [1440, 1000, 768, 390];

/* Apaga TODA transicion y animacion: sin esto una caja a mitad de una transicion de 0,3 s
   informa un rect que no existe, y eso ya costo dos mediciones en tandas anteriores. */
const SIN_ANIM = `(() => { const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(st); })()`;

const MEDIR = `((zona) => {
  const out = {};
  const R = (id) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE';
    const r = e.getBoundingClientRect();
    return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(','); };
  const N = (s) => String(s == null ? '' : s).replace(/\\s+/g, ' ').trim();
  /* Un campo se ubica por la caja de su envoltorio .fg, que es lo que la grilla coloca. */
  const FG = (id) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE';
    const f = e.closest('.fg') || e.parentElement; const r = f.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
             cls: f.className, lbl: N((f.querySelector('label') || {}).textContent) }; };
  out._ancho = window.innerWidth;
  out._tema = document.documentElement.getAttribute('data-theme') || 'auto';
  if (zona === 'doppler') {
    ['tde','triv','thp','onda_l','e_sep','e_lat'].forEach((id) => { out['fg_' + id] = FG(id); });
    /* Orden de TABULACION = orden del marcado. Se lee del DOM, no se supone. */
    const cont = document.getElementById('tde');
    const caja = cont ? cont.closest('.grid-dm') || cont.closest('.card') || document.body : document.body;
    out.ordenMarcado = Array.prototype.slice.call(caja.querySelectorAll('input[id], select[id], textarea[id]'))
      .map((e) => e.id).join(' > ');
    out.anchoCuerpo = Math.round(document.body.scrollWidth);
    out.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth ? 'SI' : 'NO';
  }
  return out;
})`;

const browser = await chromium.launch({ channel: 'chrome' });
const res = {};
for (const w of ANCHOS) {
  for (const tema of ['dark', 'light']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
    await page.goto('file://' + FILE);
    await page.waitForTimeout(900);
    await page.evaluate(`document.documentElement.setAttribute('data-theme','${tema}')`);
    await page.evaluate(SIN_ANIM);
    /* La pestania se abre por su BOTON REAL. showTab programatico deja la .card de adentro sin
       caja y todo lo que hay dentro informa 0x0 -la trampa que la tanda E documenta-. */
    try {
      await page.evaluate(`(() => { const b = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'))
        .filter((x) => /Doppler/i.test(x.textContent || ''))[0]; if (b) b.click(); })()`);
    } catch (e) {}
    await page.waitForTimeout(500);
    const r = await page.evaluate(`(${MEDIR})('${ZONA}')`);
    r._errores = errs;
    res[w + 'px_' + tema] = r;
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito: ' + OUTF);
