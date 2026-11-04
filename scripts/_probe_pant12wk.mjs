#!/usr/bin/env node
/**
 * _probe_pant12wk.mjs — Chrome y WebKit, dos temas, cuatro anchos (PANT-12, cierre).
 * ADVERTENCIA: WebKit de Playwright NO es Safari. Chrome va por el del sistema con channel.
 *   node scripts/_probe_pant12wk.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const OUT = { archivo: FILE, cruces: [] };
const CUERPO = `(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const FN = n => (typeof window[n] === 'function') ? window[n] : null;
  const caja = el => { if (!el) return null; const q = el.getBoundingClientRect();
    return { w: Math.round(q.width), h: Math.round(q.height), x: Math.round(q.left) } };
  const OCU = id => { const e = EL(id); return e ? (e.hidden ? 'oculto' : getComputedStyle(e).display) : 'NO' };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { limpiarCampos(true) } catch (e) {}
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(400);
  R.ipAntes = EL('cm3d-ip') ? EL('cm3d-ip').hidden : 'NO';
  const bot = EL('cc3d-abrir'); R.boton = caja(bot);
  if (bot) bot.click();
  await esperar(3000);
  try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
  R.three = (typeof window.THREE === 'undefined') ? 'no' : String(window.THREE.REVISION || 'si');
  R.panel = caja(EL('cc3d-panel'));
  R.canvas = caja(document.querySelector('#cm3d-cv canvas'));
  R.tgaEnSuSitio = (function(){ const b = EL('tga-3d-box'), h = EL('cc3d-host');
    return (b && h && h.contains(b)) ? 'PRESTADO' : 'en su sitio' })();
  R.modoIni = FN('_cm3dEstado') ? window._cm3dEstado().modo : 'NO';
  R.ctlIni = OCU('cm3d-ctl'); R.sideIni = OCU('cm3d-side');
  /* Explorar: la tabla al lado desde 900 px */
  const bE = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') === 'explorar')[0];
  if (bE) bE.click();
  await esperar(600);
  const col = caja(EL('cm3d-col')), sd = caja(EL('cm3d-side'));
  R.ladoALado = (col && sd && sd.w > 0) ? (sd.x >= col.x + col.w - 2 ? 'al lado' : 'apilada') : 'sin caja';
  R.filas = document.querySelectorAll('#cm3d-sidebody .cm3d-srow').length;
  R.botonesBase = document.querySelectorAll('#cm3d-baseb button').length;
  R.botonesMod = document.querySelectorAll('#cm3d-modb button').length;
  /* el globo */
  const ib = EL('cm3d-ib'), ip = EL('cm3d-ip');
  if (ib) { try { ib.scrollIntoView({ block: 'center' }) } catch (z) {} }
  await esperar(180);
  R.ib = caja(ib);
  R.ibPuntos = (function(){ if (!ib) return 'NO'; const q = ib.getBoundingClientRect();
    if (!q.width) return 'caja cero';
    const pts = [[q.left+3,q.top+3],[q.right-3,q.top+3],[q.left+3,q.bottom-3],[q.right-3,q.bottom-3],
                 [(q.left+q.right)/2,(q.top+q.bottom)/2]];
    return pts.map(p => { const e2 = document.elementFromPoint(p[0], p[1]);
      return (e2 === ib || ib.contains(e2)) ? 1 : 0 }).join('') })();
  if (ib) ib.click(); await esperar(220);
  R.ipAbre = ip ? !ip.hidden : 'NO';
  R.letra = (function(){ const e = EL('cm3d-inf'); return e ? getComputedStyle(e).fontSize : 'NO' })();
  if (ib) ib.click(); await esperar(180);
  /* la casilla del commit 3 */
  try { const b2 = bq('showTab(' + Q + 'otros' + Q); if (b2) b2.click() } catch (e) {}
  await esperar(420);
  const ch = EL('otr_var_vcsip');
  R.casilla = ch ? caja(ch.closest('label')) : 'NO EXISTE';
  R.casillaRot = ch ? String((ch.closest('label') || {}).textContent || '').trim() : 'NO';
  /* desplazamiento y recortes */
  const bx = EL('cm3d-box');
  R.scrollH = bx ? Math.max(0, bx.scrollWidth - bx.clientWidth) : 'NO';
  R.scrollBody = Math.max(0, document.body.scrollWidth - document.body.clientWidth);
  R.recortados = Array.prototype.filter.call(
    document.querySelectorAll('#cm3d-box .cm3d-srn, #cm3d-box .cm3d-tit, #cm3d-box .cm3d-sg, #cm3d-box .cm3d-lab'),
    e => e.scrollWidth > e.clientWidth + 2).length;
  return R;
})()`;
for (const motor of ['chromium', 'webkit']) {
  for (const w of [1440, 1000, 768, 390]) {
    for (const tema of ['light', 'dark']) {
      const br = await _pw[motor].launch(motor === 'chromium' ? { channel: 'chrome' } : {});
      const pg = await br.newPage({ viewport: { width: w, height: 900 }, colorScheme: tema });
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 110)));
      pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 110)) });
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 150000 });
      await pg.waitForTimeout(1500);
      const r = await pg.evaluate(CUERPO).catch(e => ({ ERR: String(e).slice(0, 180) }));
      OUT.cruces.push({ motor, w, tema, r, errores: errs.slice(0, 4) });
      await pg.close(); await br.close();
    }
  }
}
console.log(JSON.stringify(OUT, null, 1));
