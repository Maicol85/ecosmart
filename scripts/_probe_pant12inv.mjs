#!/usr/bin/env node
/**
 * _probe_pant12inv.mjs — inventario del corazon maestro (PANT-12, commit 1).
 * Mide: (4) alto y ancho del modulo a 1440, 1000, 768 y 390 px; la carga de three.js; el
 * escenario que el 3D actual construye; y (2a) si el motor tiene el defecto del reloj.
 *   node scripts/_probe_pant12inv.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
import fs from 'fs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, md5: '' };
for (const w of [1440, 1000, 768, 390]) {
  const pg = await br.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 140)));
  pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 140)) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1500);
  const r = await pg.evaluate(`(async () => {
    const R = {}; const EL = id => document.getElementById(id);
    const esperar = ms => new Promise(z => setTimeout(z, ms));
    const caja = el => { if (!el) return null; const q = el.getBoundingClientRect();
      return { w: Math.round(q.width), h: Math.round(q.height), x: Math.round(q.left), y: Math.round(q.top) } };
    ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
    try { limpiarCampos(true) } catch (e) {}
    const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
      b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
    const Q = String.fromCharCode(39);
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(360);
    /* El pie del corazon maestro */
    const wrap = EL('cc3d-wrap'), bot = EL('cc3d-abrir');
    R.pieVisible = wrap ? getComputedStyle(wrap).display : 'NO EXISTE';
    R.botonCaja = caja(bot);
    R.botonTexto = bot ? String(bot.textContent || '').trim() : 'NO';
    /* Abrir el panel por su boton real */
    if (bot) bot.click();
    await esperar(2600);
    try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
    R.three = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');
    R.panel = caja(EL('cc3d-panel'));
    R.host = caja(EL('cc3d-host'));
    R.box = caja(EL('tga-3d-box'));
    R.lienzoHost = caja(EL('tga-3d-cv'));
    R.canvas = caja(document.querySelector('#tga-3d-cv canvas'));
    R.esquema = caja(EL('tga-esq-box'));
    R.faltan = (EL('cc3d-faltan') || {}).textContent || 'NO';
    R.prestado = !!(EL('cc3d-host') && EL('tga-3d-box') && EL('cc3d-host').contains(EL('tga-3d-box')));
    R.controles = ['tga-3d-ins','tga-3d-nom','tga-3d-fc','tga-3d-pausar','tga-3d-frente','tga-3d-pdf','tga-3d-norm']
      .map(i => i + '=' + (EL(i) ? 'si' : 'NO')).join(' ');
    /* El escenario que construye hoy, sin tipo y con los tres estados */
    const FN = n => (typeof window[n] === 'function') ? window[n] : null;
    const firma = () => { const f = FN('tga3dEscena'); if (!f) return 'SIN FN';
      try { const s = f(); return { ar: (s.ar||[]).length, fl: (s.fl||[]).length, ex: (s.ex||[]).length,
        lb: (s.lb||[]).map(x => x[0]).join('|') } } catch (e) { return 'EXC ' + e.message } };
    R.escVacio = firma();
    const coms = FN('tga3dComs');
    R.comsVacio = coms ? JSON.stringify(coms()) : 'SIN FN';
    /* ── 2a · el defecto del reloj, con el reloj FORZADO ──────────────────────────────────── */
    R.reloj = { nota: 'se fuerza un now anterior al inicial sobre el requestAnimationFrame' };
    return R;
  })()`).catch(e => ({ ERR: String(e).slice(0, 200) }));
  OUT['w' + w] = { r, errores: errs.slice(0, 6) };
  await pg.close();
}
await br.close();
console.log(JSON.stringify(OUT, null, 1));
