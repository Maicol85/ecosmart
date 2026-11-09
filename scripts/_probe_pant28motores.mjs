#!/usr/bin/env node
/**
 * _probe_pant28motores.mjs - tanda PANT-28. SOLO LECTURA.
 * Nombre propio: verificado con ls, no existia. NO sobrescribe la sonda de PANT-27.
 * Mide las TRES fichas nuevas de Referencias en los DIECISEIS cruces: dos motores -Chrome del
 * sistema y WebKit de Playwright- por 1440, 1000, 768 y 390 px, por tema dia y noche.
 * Por cruce registra, con el GESTO REAL -tocar la pestania, tocar la solapa, tocar el
 * encabezado de cada ficha-:
 *   · que cada ficha existe, esta en SU panel y abre,
 *   · el largo de su texto y el orden de sus bloques,
 *   · cuantas tablas se salen del viewport y cuantas tienen su propio contenedor con scroll,
 *   · el desplazamiento horizontal de la PAGINA y los textos recortados,
 *   · errores de consola y de pagina.
 * DENOMINADOR: cada ficha se mide con SU panel activo; con el panel escondido el subarbol no
 * tiene geometria y todo daria cero, que se lee igual que «no desborda».
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
 * No escribe nada en el proyecto.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p28motores.json';

const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dia', 'noche'];
const FICHAS = [
  ['racong', 'congenitas', ['1 · Clasificaci', '2 · Clínica', '3 · Riesgo',
     '4 · El ecocardiograma', '5 · Otras exploraciones', '6 · Cirug', '7 · Seguimiento']],
  ['atleta', 'otros', ['1 · Definici', '2 · Clínica', '3 · El ecocardiograma',
     '4 · El ECG', '5 · Cómo se diferencia', '6 · Qué hace cada fuente']],
  ['chagas', 'otros', ['1 · Epidemiolog', '2 · Clínica y estadios', '3 · El ecocardiograma',
     '4 · El ECG', '5 · Arritmias y riesgo', '6 · Tratamiento', '7 · Seguimiento']],
];

const R = { cruces: [], nota: 'WebKit de Playwright NO es Safari' };
for (const motor of ['chrome', 'webkit']) {
  const nav = motor === 'chrome' ? await chromium.launch({ channel: 'chrome' }) : await webkit.launch();
  for (const ancho of ANCHOS) for (const tema of TEMAS) {
    const errs = [];
    const ctx = await nav.newContext({ viewport: { width: ancho, height: 900 } });
    const pg = await ctx.newPage();
    pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 100)) });
    pg.on('pageerror', e => errs.push('pag: ' + String(e).slice(0, 100)));
    try {
      await pg.goto('file://' + FILE);
      await pg.waitForTimeout(2200);
      await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
      if (tema === 'noche') { await pg.evaluate(() => { try { document.documentElement.setAttribute('data-theme', 'dark') } catch (e) {} }); await pg.waitForTimeout(250) }
      const d = await pg.evaluate((FICHAS) => {
        const o = { fichas: {} };
        const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
        try { showTab('refs') } catch (e) {}
        FICHAS.forEach(function (f) {
          const id = f[0], sub = f[1], ORD = f[2];
          const b = document.getElementById('ref-subtab-' + sub); if (b) b.click();
          const panel = document.getElementById('ref-sub-' + sub);
          const c = document.getElementById('ref-' + id);
          if (!c) { o.fichas[id] = { existe: false }; return }
          const card = c.closest('.card'), cab = card ? card.querySelector('h2.card-head') : null;
          const cerrada = getComputedStyle(c).display === 'none';
          if (cab && cerrada) cab.click();
          const t = norm(c.textContent);
          let p = -1, ok = true;
          ORD.forEach(function (r) { const k = t.indexOf(r); if (k < 0 || k < p) ok = false; p = k });
          o.fichas[id] = { existe: true, enPanel: !!(panel && panel.contains(c)),
            nacioCerrada: cerrada, abierta: getComputedStyle(c).display !== 'none',
            largo: t.length, ordenOk: ok,
            tablas: c.querySelectorAll('table').length,
            anchas: Array.prototype.slice.call(c.querySelectorAll('table'))
              .filter(x => x.getBoundingClientRect().right > innerWidth + 1).length,
            conScroll: Array.prototype.slice.call(c.querySelectorAll('div'))
              .filter(x => x.scrollWidth > x.clientWidth + 1).length,
            recortados: Array.prototype.slice.call(c.querySelectorAll('td, th, div'))
              .filter(x => x.children.length === 0 && x.scrollWidth > x.clientWidth + 2).length };
        });
        o.scrollH = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        o.bodyScrollH = document.body.scrollWidth - document.body.clientWidth;
        try { o.reparto = Object.keys(REF_SUBTAB).reduce((a, k) => a + REF_SUBTAB[k].length, 0) } catch (e) { o.reparto = -1 }
        try { o.indice = window._refIndiceArmar ? window._refIndiceArmar(true).length : -1 } catch (e) { o.indice = -1 }
        try { o.globo = window._otrRefClon ? norm(window._otrRefClon('ref-coronarias').textContent).length : -1 } catch (e) { o.globo = -1 }
        try { const v = document.getElementById('ref-coronarias'); o.vieja = v ? norm(v.textContent).length : -1 } catch (e) { o.vieja = -1 }
        try { const m = document.getElementById('ref-miocard'); o.miocard = m ? norm(m.textContent).length : -1 } catch (e) { o.miocard = -1 }
        return o;
      }, FICHAS);
      d.motor = motor; d.ancho = ancho; d.tema = tema; d.errores = errs;
      R.cruces.push(d);
    } catch (e) {
      R.cruces.push({ motor, ancho, tema, error: String(e).slice(0, 160), errores: errs });
    }
    await ctx.close();
  }
  await nav.close();
}
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log('escrito ' + OUTF + ' con ' + R.cruces.length + ' cruces');
