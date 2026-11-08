#!/usr/bin/env node
/**
 * _probe_pant25maq.mjs - la MAQUETA de Referencias en la tanda PANT-25 (2026-11-08).
 * Nombre propio: verificado con ls, no existia.
 * Mide, en los CUATRO anchos y en los DOS temas: el desplazamiento horizontal de la PAGINA,
 * el alto visible de los botones de la barra, si la barra se desplaza por dentro, y los textos
 * recortados de la pestania activa. Acepta `--file` para correr contra HEAD y contra el nuevo.
 * ⚠️ DENOMINADOR: cuenta botones y entradas; si la pestania no abrio, lo DICE.
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
const OUTF = arg('--out') || '/tmp/p25_maq.json';
const MOTORES = (arg('--motor') === 'webkit') ? [['webkit', webkit]]
              : (arg('--motor') === 'ambos') ? [['chrome', chromium], ['webkit', webkit]]
              : [['chrome', chromium]];
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];
const res = [];
for (const [mot, motor] of MOTORES) {
  const br = await motor.launch(mot === 'chrome' ? { channel: 'chrome', headless: true } : { headless: true });
  for (const w of ANCHOS) for (const tema of TEMAS) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 }, colorScheme: tema });
    const errs = [];
    pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 140)));
    pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 140)) });
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(900);
    await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    const r = await pg.evaluate(() => {
      const O = { subs: [] };
      const btnRefs = Array.from(document.querySelectorAll('.tabs-tools .tab-btn'))
        .find(b => /Referencias/.test(b.textContent || ''));
      if (!btnRefs) return { error: 'sin boton Referencias' };
      btnRefs.click();
      const bar = document.querySelector('#tab-refs .ref-subbar');
      const bots = Array.from(document.querySelectorAll('#tab-refs .ref-subbar .ref-subtab'));
      O.nBotones = bots.length;
      O.altoMin = Math.min.apply(null, bots.map(b => Math.round(b.getBoundingClientRect().height)));
      O.barraScrollPropio = !!bar && bar.scrollWidth > bar.clientWidth + 1;
      O.barraClient = bar ? Math.round(bar.clientWidth) : -1;
      O.barraScroll = bar ? Math.round(bar.scrollWidth) : -1;
      bots.forEach(function (b) {
        b.click();
        const sub = String(b.id || '').replace(/^ref-subtab-/, '');
        const pan = document.getElementById('ref-sub-' + sub);
        const act = !!pan && pan.classList.contains('active');
        /* textos recortados dentro del panel activo */
        let rec = 0;
        if (pan) {
          const ns = pan.querySelectorAll('h2, th, td, div, span, button');
          for (let i = 0; i < ns.length; i++) {
            const n = ns[i];
            if (!n.offsetParent) continue;
            if (n.children.length) continue;
            if (n.scrollWidth > n.clientWidth + 2 &&
                getComputedStyle(n).overflowX !== 'auto' &&
                getComputedStyle(n).overflowX !== 'scroll') rec++;
          }
        }
        O.subs.push({ sub: sub, activo: act, entradas: pan ? pan.querySelectorAll('h2.card-head').length : -1,
                      recortados: rec,
                      scrollDoc: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth) });
      });
      O.scrollDocFinal = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
      return O;
    });
    r.motor = mot; r.ancho = w; r.tema = tema; r.errores = errs;
    res.push(r);
    await pg.close();
  }
  await br.close();
}
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
res.forEach(r => console.log(
  `${r.motor} ${r.ancho}px ${r.tema}  botones=${r.nBotones} altoMin=${r.altoMin} ` +
  `barra ${r.barraClient}/${r.barraScroll} propio=${r.barraScrollPropio} ` +
  `scrollDoc=${r.scrollDocFinal} recortados=${(r.subs||[]).reduce((a,s)=>a+s.recortados,0)} ` +
  `cerrados=${(r.subs||[]).filter(s=>!s.activo).length} err=${r.errores.length}`));
process.exit(0);
