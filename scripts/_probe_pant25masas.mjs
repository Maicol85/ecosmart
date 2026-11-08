#!/usr/bin/env node
/**
 * _probe_pant25masas.mjs - las DOS fichas de la tanda PANT-25 (2026-11-08) abiertas de verdad.
 * Nombre propio: verificado con ls, no existia.
 * ⚠️ DENOMINADOR: la sonda de maqueta general mide las fichas CERRADAS, asi que sobre una tabla
 *    ancha no prueba nada. Esta las ABRE con el gesto real -tocando su encabezado- y recien
 *    entonces mide el desplazamiento horizontal de la PAGINA, el de cada contenedor con scroll
 *    propio, las celdas vacias y los textos recortados.
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
const OUTF = arg('--out') || '/tmp/p25_masas.json';
const MOTORES = (arg('--motor') === 'ambos') ? [['chrome', chromium], ['webkit', webkit]]
                                             : [['chrome', chromium]];
const FICHAS = ['tumores', 'embolig'];
const BUSCA = ['paraneoplasicos', '0,965', 'SUVmax', 'neoadyuvante', 'pseudotumores',
               'rabdomioma', 'glucolisis', 'absceso', 'perforacion', 'asintomatica',
               'orejuela', 'mural'];
const res = [];
for (const [mot, motor] of MOTORES) {
  const br = await motor.launch(mot === 'chrome' ? { channel: 'chrome', headless: true } : { headless: true });
  for (const w of [1440, 1000, 768, 390]) for (const tema of ['dark', 'light']) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 }, colorScheme: tema });
    const errs = [];
    pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 140)));
    pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 140)) });
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(900);
    await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    const r = await pg.evaluate(({ FICHAS, BUSCA }) => {
      const O = { fichas: [], busca: [] };
      const btnRefs = Array.from(document.querySelectorAll('.tabs-tools .tab-btn'))
        .find(b => /Referencias/.test(b.textContent || ''));
      if (!btnRefs) return { error: 'sin boton Referencias' };
      btnRefs.click();
      const bOtros = document.getElementById('ref-subtab-otros');
      if (!bOtros) return { error: 'sin boton Otros hallazgos' };
      bOtros.click();
      const pan = document.getElementById('ref-sub-otros');
      O.panelActivo = !!pan && pan.classList.contains('active');
      FICHAS.forEach(function (id) {
        const cu = document.getElementById('ref-' + id);
        if (!cu) { O.fichas.push({ id: id, error: 'NO EXISTE' }); return; }
        const h = cu.previousElementSibling;
        if (cu.style.display === 'none' && h) h.click();   /* GESTO REAL */
        const abierta = cu.style.display !== 'none';
        /* celdas y filas vacias */
        let celdasVacias = 0, filasVacias = 0;
        cu.querySelectorAll('tr').forEach(function (f) {
          const tds = f.querySelectorAll('td,th');
          let llenas = 0;
          tds.forEach(function (c) {
            const t = (c.textContent || '').replace(/\s+/g, '').replace(/—|-/g, '');
            if (!t) celdasVacias++; else llenas++;
          });
          if (tds.length && llenas === 0) filasVacias++;
        });
        /* contenedores con scroll propio y si de verdad lo usan */
        const wraps = Array.from(cu.querySelectorAll('div')).filter(function (d) {
          const cs = getComputedStyle(d); return cs.overflowX === 'auto' || cs.overflowX === 'scroll';
        }).map(function (d) { return { propio: d.scrollWidth > d.clientWidth + 1,
                                       client: Math.round(d.clientWidth), scroll: Math.round(d.scrollWidth) } });
        /* textos recortados */
        let rec = 0;
        cu.querySelectorAll('td,th,div,span').forEach(function (n) {
          if (!n.offsetParent || n.children.length) return;
          const cs = getComputedStyle(n);
          if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') return;
          if (n.scrollWidth > n.clientWidth + 2) rec++;
        });
        O.fichas.push({ id: id, abierta: abierta,
          filas: cu.querySelectorAll('tr').length,
          tablas: cu.querySelectorAll('table').length,
          celdasVacias: celdasVacias, filasVacias: filasVacias,
          wraps: wraps, recortados: rec,
          largo: (cu.textContent || '').replace(/\s+/g, ' ').trim().length,
          scrollDoc: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth) });
      });
      O.scrollDocFinal = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
      /* el buscador encuentra lo nuevo */
      const inp = document.getElementById('ref-busca');
      if (inp) BUSCA.forEach(function (t) {
        inp.value = t; inp.dispatchEvent(new Event('input', { bubbles: true }));
        const r2 = document.getElementById('ref-busca-res');
        const items = r2 ? Array.from(r2.querySelectorAll('button')) : [];
        O.busca.push({ t: t, n: items.length,
                       hay: items.map(b => (b.textContent || '').replace(/\s+/g, ' ').trim()) });
      });
      if (inp) { inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true })); }
      return O;
    }, { FICHAS, BUSCA });
    r.motor = mot; r.ancho = w; r.tema = tema; r.errores = errs;
    res.push(r);
    await pg.close();
  }
  await br.close();
}
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
res.forEach(r => {
  const f = (r.fichas || []).map(x => `${x.id}[ab=${x.abierta} fil=${x.filas} vac=${x.celdasVacias}/${x.filasVacias} rec=${x.recortados} wraps=${(x.wraps||[]).map(w=>w.propio?'propio':'no').join(',')}]`).join(' ');
  console.log(`${r.motor} ${r.ancho}px ${r.tema} panel=${r.panelActivo} scrollDoc=${r.scrollDocFinal} err=${r.errores.length} ${f}`);
});
const b = res[0].busca || [];
console.log('BUSCADOR: ' + b.map(x => `${x.t}=${x.n}`).join(' '));
process.exit(0);
