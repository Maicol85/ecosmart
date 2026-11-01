#!/usr/bin/env node
/**
 * _probe_popb_c2.mjs - el tipo de las valvulas operadas (POP-B-2).
 *
 * Mide: las opciones que ofrece cada selector, lo que pasa con una morfologia NATIVA en
 * Valvulas, lo que pasa al elegir una protesis, y lo que el PAPEL dice en los dos casos.
 *
 *   node scripts/_probe_popb_c2.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `(async () => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'), x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const S = (id, v2) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return } e.value = v2;
    e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})) };
  const C = (id, o) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return } e.checked = o;
    e.dispatchEvent(new Event('change',{bubbles:true})) };
  const W = ms => new Promise(r => setTimeout(r, ms));
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(250);
  const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click(); await W(250);
  S('peso','70'); S('talla','170');
  C('pop_cx_valv', true); await W(250);
  C('pop_cx_v_ao', true); C('pop_cx_v_mi', true); C('pop_cx_v_tr', true); C('pop_cx_v_pu', true);
  S('pop_monitor','swan'); await W(150); S('pop_sw_gc','4');
  await W(500);

  // (A) OPCIONES que ofrece cada selector
  R.opciones = {};
  ['pop-esp-vao','pop-esp-vmi','pop-esp-vtr','pop-esp-vpu'].forEach(id => {
    const e = EL(id);
    R.opciones[id] = e ? Array.prototype.map.call(e.options, o => o.text) : 'NO EXISTE';
  });
  // (B) las opciones del DUEÑO, para el reporte
  R.duenos = {};
  ['va_morf','vm_morf','vt_morf','vp_morf'].forEach(id => {
    const e = EL(id);
    R.duenos[id] = e ? Array.prototype.map.call(e.options, o => (o.value || '(sin value)') + ' / ' + o.text) : 'NO EXISTE';
  });

  // (C) MORFOLOGIA NATIVA en Valvulas
  S('vt_morf', 'Mixomatosa'); S('vm_morf', 'Reumática');
  try { popCxVSync() } catch (e) { R.errs.push('popCxVSync:' + e.message) }
  await W(400);
  R.nativa = {
    vtrSel: (EL('pop-esp-vtr') || {}).value, vtrTag: (EL('pop-esp-vtr-tag') || {}).textContent,
    vtrNota: (EL('pop-esp-vtr-nota') || {}).textContent,
    vmiSel: (EL('pop-esp-vmi') || {}).value, vmiNota: (EL('pop-esp-vmi-nota') || {}).textContent,
    vtMorfDueno: (EL('vt_morf') || {}).value,
    papel: (typeof popCxValvTxt === 'function') ? popCxValvTxt() : 'NO FN'
  };
  // (D) elegir una PROTESIS por la segunda puerta
  S('pop-esp-vtr', 'Prótesis mecánica');
  await W(400);
  R.protesis = {
    vtMorfDueno: (EL('vt_morf') || {}).value,
    vtrTag: (EL('pop-esp-vtr-tag') || {}).textContent,
    vtrNota: (EL('pop-esp-vtr-nota') || {}).textContent,
    papel: popCxValvTxt()
  };
  // (E) el barrido no repuebla ni borra
  try { popSync() } catch (e) {}
  await W(700);
  R.trasBarrido = { vtrSel: (EL('pop-esp-vtr') || {}).value, vtMorf: (EL('vt_morf') || {}).value,
                    vmiSel: (EL('pop-esp-vmi') || {}).value, vmMorf: (EL('vm_morf') || {}).value };
  // (F) ningun tipo por defecto: una valvula marcada sin tocar el selector
  R.vaoDueno = (EL('va_morf') || {}).value;
  R.vpuDueno = (EL('vp_morf') || {}).value;
  return R;
})()`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text()) });
  await pg.goto('file://' + FILE); await pg.waitForTimeout(1500);
  let r;
  try { r = await pg.evaluate(CUERPO) } catch (e) { r = { fatal: e.message } }
  console.log('===== ' + FILE.split('/').pop() + ' =====');
  console.log(JSON.stringify(r, null, 1));
  console.log('--- consola (' + errs.filter(e => e.indexOf('ERR_FILE_NOT_FOUND') < 0).length + ') ---');
  await pg.close(); await b.close(); process.exit(0);
};
run().catch(e => { console.error('FATAL', e); process.exit(1) });
