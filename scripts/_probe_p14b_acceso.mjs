#!/usr/bin/env node
/**
 * _probe_p14b_acceso.mjs - el boton y el panel del corazon maestro fuera de las congenitas y
 * sin acceso a ellas (PANT-14b, commit 1c). Mide con la regla real de la app -el modo de vista
 * y la casilla de Config-, y verifica que la libreria 3D NO se baje.
 *   node scripts/_probe_p14b_acceso.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const ESC = [
  { n:'avanzado_con_modulo', pre:null },
  { n:'avanzado_sin_modulo', pre:'mod_off' },
  { n:'basico',              pre:'basico' },
];

const CUERPO = (esc) => `(async () => {
  const R = { esc: ${JSON.stringify(esc.n)} };
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const PRE = ${JSON.stringify(esc.pre)};
  try {
    if (PRE === 'mod_off') { const m = (typeof eeGetModules === 'function') ? eeGetModules() : {};
      m.congenitas = false; localStorage.setItem('ett_modules', JSON.stringify(m)); }
    if (PRE === 'basico') { localStorage.setItem('ett_view_mode', 'basico'); }
    if (typeof applyViewMode === 'function') applyViewMode();
  } catch (e) { R.preErr = String(e).slice(0, 110) }
  await esperar(250);
  R.acceso = (typeof cc3dAcceso === 'function') ? cc3dAcceso() : 'NO EXISTE';
  const vis = e => { if (!e) return 'NO EXISTE'; const r = e.getBoundingClientRect();
    return (r.width > 0 && r.height > 0) ? Math.round(r.width) + 'x' + Math.round(r.height) : '0x0' };
  /* el boton de la pestania de congenitas, que es la regla de referencia */
  const tb = Array.prototype.find.call(document.querySelectorAll('.tab-btn'),
    b => (b.getAttribute('data-mod') || '') === 'congenitas');
  R.pestaniaBtn = tb ? (getComputedStyle(tb).display === 'none' ? 'oculto' : vis(tb)) : 'NO EXISTE';
  /* se intenta ir a congenitas y abrir el modulo, que es el peor caso */
  try { if (typeof showTab === 'function') showTab('congenitas') } catch (e) {}
  await esperar(350);
  R.enCongenitas = (typeof cc3dEnCongenitas === 'function') ? cc3dEnCongenitas() : '?';
  const w = EL('cc3d-wrap');
  R.wrapDisp = w ? getComputedStyle(w).display : 'NO EXISTE';
  R.botonCaja = vis(EL('cc3d-abrir'));
  try { if (typeof cc3dAbrir === 'function') cc3dAbrir() } catch (e) {}
  await esperar(1400);
  const p = EL('cc3d-panel');
  R.panelDisp = p ? getComputedStyle(p).display : 'NO EXISTE';
  R.panelCaja = vis(p);
  R.three = (typeof window.THREE === 'undefined') ? 'NO cargada' : 'CARGADA';
  R.scriptsThree = Array.prototype.filter.call(document.querySelectorAll('script[src]'),
    s => /three/i.test(s.src)).length;
  try { R.cmListo = !!(_cm3d && _cm3d.listo); R.cmCargando = !!(_cm3d && _cm3d.cargando) } catch (e) {}
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const salida = {};
for (const esc of ESC) {
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
    await pg.waitForTimeout(1700);
    const r = await pg.evaluate(CUERPO(esc));
    r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
    salida[esc.n] = r;
  } catch (e) { salida[esc.n] = { fatal: String(e).slice(0, 220), errs } }
  await ctx.close();
}
await br.close();
console.log(JSON.stringify(salida, null, 1));
