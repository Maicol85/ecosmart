#!/usr/bin/env node
/**
 * _probe_pa_inv.mjs - INVENTARIO 1a de la tanda POP-A (solo lectura).
 *
 * Abre la pestana de posoperatorio y su acordeon POR SU BOTON REAL, despliega el desplegable
 * de farmacos, y mide: el alto de cada tarjeta .pop-card a 1440 y 1000 px, el censo de campos
 * de la seccion con su tipo, y las opciones de cada selector.
 *
 *   node scripts/_probe_pa_inv.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
import fs from 'fs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const MEDIR = `(async () => {
  const R = { errs: [], cards: [], campos: [], selects: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { const b = bq('showTab(' + Q + 'hemodinamica'); if (b) b.click(); else showTab('hemodinamica'); } catch (e) { R.errs.push('tab:' + e.message) }
  await new Promise(r => setTimeout(r, 250));
  const tb = document.getElementById('tab-hemodinamica');
  R.tabDisplay = tb ? getComputedStyle(tb).display : 'NO TAB';
  if (tb && getComputedStyle(tb).display === 'none') { try { showTab('hemodinamica') } catch (e) {} await new Promise(r => setTimeout(r, 250)); R.tabDisplay2 = getComputedStyle(tb).display }
  // el acordeon POP vive en un card-head con toggleCard('pop-seccion')
  try { const b = bq('toggleCard(' + Q + 'pop-seccion'); if (b) b.click(); } catch (e) { R.errs.push('acc:' + e.message) }
  await new Promise(r => setTimeout(r, 300));
  const sec = EL('pop-seccion');
  R.secVisible = sec ? getComputedStyle(sec).display : 'NO SEC';
  // el details de farmacos, abierto
  try { const d = EL('pop_farmacos_det'); if (d) d.open = true } catch (e) {}
  await new Promise(r => setTimeout(r, 200));
  const rd = el => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } };
  Array.prototype.forEach.call(document.querySelectorAll('#pop-seccion .pop-card'), c => {
    R.cards.push(Object.assign({ k: c.getAttribute('data-pop') || '?' }, rd(c)));
  });
  R.gridCols = sec ? getComputedStyle(sec.querySelector('.pop-grid')).gridTemplateColumns : '';
  Array.prototype.forEach.call(document.querySelectorAll('#pop-seccion input[id],#pop-seccion select[id],#pop-seccion textarea[id]'), e => {
    R.campos.push(e.id + ' [' + (e.tagName.toLowerCase() === 'input' ? e.type : e.tagName.toLowerCase()) + ']');
  });
  Array.prototype.forEach.call(document.querySelectorAll('#pop-seccion select[id]'), e => {
    R.selects.push(e.id + ' => ' + Array.prototype.map.call(e.options, o => (o.value === '' ? '(vacio)' : o.value) + '/' + o.text).join(' | '));
  });
  return R;
})()`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  for (const W of [1440, 1000]) {
    const pg = await b.newPage({ viewport: { width: W, height: 900 } });
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE ' + e.message));
    pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text()) });
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(1500);
    let r;
    try { r = await pg.evaluate(MEDIR) } catch (e) { r = { fatal: e.message } }
    console.log('\n===== ANCHO ' + W + ' px =====');
    console.log('tab display: ' + r.tabDisplay + (r.tabDisplay2 ? ' -> ' + r.tabDisplay2 : '') + ' | seccion display: ' + r.secVisible + ' | grid-template-columns: ' + r.gridCols);
    (r.cards || []).forEach(c => console.log('  card ' + c.k.padEnd(14) + ' ' + String(c.w).padStart(5) + ' x ' + String(c.h).padStart(5) + ' px'));
    if (W === 1440) {
      console.log('\n--- CAMPOS de #pop-seccion (' + (r.campos || []).length + ') ---');
      (r.campos || []).forEach(c => console.log('  ' + c));
      console.log('\n--- SELECTS y sus opciones ---');
      (r.selects || []).forEach(s => console.log('  ' + s));
    }
    console.log('errores de pagina/consola: ' + errs.length + (errs.length ? ' => ' + errs.slice(0, 4).join(' ;; ') : ''));
    if (r.errs && r.errs.length) console.log('errs internos: ' + r.errs.join(' ;; '));
    if (r.fatal) console.log('FATAL: ' + r.fatal);
    await pg.close();
  }
  await b.close();
};
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) });
