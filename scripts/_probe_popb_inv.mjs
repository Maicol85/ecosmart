#!/usr/bin/env node
/**
 * _probe_popb_inv.mjs - INVENTARIO 1a de la tanda POP-B (solo lectura).
 *
 * Reproduce el estudio de prueba del medico en la pestana de posoperatorio y mide por que
 * «Integrar al informe» no integra: el estado del boton, lo que devuelve popPatron() y lo que
 * pasa al hacer click de verdad. Corre con el estudio COMPLETO, con uno MINIMO y con uno VACIO.
 *
 *   node scripts/_probe_popb_inv.mjs [--file <html>] [--peso]
 *
 * --peso  siembra tambien peso y talla (el estudio del medico no los nombra).
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const CONPESO = process.argv.indexOf('--peso') > 0;

const MEDIR = `(async (conPeso, escena) => {
  const R = { escena: escena, errs: [], paso: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const S = (id, val) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return } e.value = val;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) };
  const C = (id, on) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return } e.checked = !!on;
    e.dispatchEvent(new Event('change', { bubbles: true })) };

  try { const b = bq('showTab(' + Q + 'hemodinamica'); if (b) b.click(); else showTab('hemodinamica') } catch (e) { R.errs.push('tab:' + e.message) }
  await new Promise(r => setTimeout(r, 250));
  try { const b = bq('toggleCard(' + Q + 'pop-seccion'); if (b) b.click() } catch (e) { R.errs.push('acc:' + e.message) }
  await new Promise(r => setTimeout(r, 300));
  const sec = EL('pop-seccion');
  R.secDisplay = sec ? getComputedStyle(sec).display : 'NO SEC';

  if (conPeso) { S('peso', '70'); S('talla', '170'); S('sexo', 'Masculino') }

  if (escena === 'completo') {
    C('pop_cx_cabg', true); C('pop_cx_valv', true); C('pop_cx_aorta', true);
    await new Promise(r => setTimeout(r, 150));
    C('pop_cx_v_ao', true); C('pop_cx_v_mi', true); C('pop_cx_v_tr', true);
    S('pop_monitor', 'swan');
    await new Promise(r => setTimeout(r, 150));
    S('pop_sw_fc', '80'); S('pop_sw_gc', '4'); S('pop_sw_pam', '78'); S('pop_sw_pad', '50');
    S('pop_sw_pcp', '16'); S('pop_sw_paps', '100'); S('pop_sw_papd', '50');
    C('pop_nor_activa', true); C('pop_dop_activa', true);
    S('pop_asist_tipo', 'bcia');
    await new Promise(r => setTimeout(r, 150));
    S('pop_bcia_ratio', '1:2');
    C('pop_dren_pi', true); C('pop_dren_med', true);
    S('pericardio', 'Derrame leve (<10mm)');
    S('pop_pleura_der', 'moderado'); S('pop_pleura_izq', 'severo');
    S('pop_pulmon_lineasb', 'difusas'); S('pop_pulmon_consol', 'derecha'); S('pop_pulmon_neumo', 'ausente');
  } else if (escena === 'minimo') {
    S('pop_monitor', 'swan');
    await new Promise(r => setTimeout(r, 150));
    S('pop_sw_gc', '4');
  }
  try { popSync() } catch (e) { R.errs.push('popSync:' + e.message) }
  await new Promise(r => setTimeout(r, 400));

  R.bsa = (typeof getBSA === 'function') ? getBSA() : 'NO getBSA';
  R.monitor = (EL('pop_monitor') || {}).value;
  R.swGc = (EL('pop_sw_gc') || {}).value;
  try {
    const p = popPatron();
    R.pat = { k: p.pat && p.pat.k, lbl: p.pat && p.pat.lbl, ic: p.ic, icBanda: p.icBanda,
              icFuente: p.icFuente, icFuera: p.icFuera, tapo: p.taponamiento,
              suficiente: p.suficiente, motivo: p.motivo };
  } catch (e) { R.pat = { ERROR: e.message } }
  const btn = EL('pop_integrar');
  R.btn = btn ? { existe: true, disabled: btn.disabled, opacity: btn.style.opacity,
                  title: btn.title, visible: !!btn.offsetParent } : { existe: false };
  // El click REAL
  R.integradoAntes = (typeof amiloIntegrado === 'function') ? !!amiloIntegrado('pop') : 'NO FN';
  try { if (btn) btn.click() } catch (e) { R.errs.push('click:' + e.message) }
  await new Promise(r => setTimeout(r, 500));
  R.integradoDespues = (typeof amiloIntegrado === 'function') ? !!amiloIntegrado('pop') : 'NO FN';
  const ta = EL('am-txt-pop');
  R.txtLen = ta ? String(ta.value || '').length : 'NO TA';
  // Si el boton no responde, probamos la funcion directo
  if (R.integradoDespues === false) {
    try { amiloIntegrar('pop') } catch (e) { R.errs.push('amiloIntegrar:' + e.message) }
    await new Promise(r => setTimeout(r, 400));
    R.integradoDirecto = (typeof amiloIntegrado === 'function') ? !!amiloIntegrado('pop') : 'NO FN';
    const ta2 = EL('am-txt-pop');
    R.txtLenDirecto = ta2 ? String(ta2.value || '').length : 'NO TA';
  }
  return R;
})`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  for (const esc of ['completo', 'minimo', 'vacio']) {
    const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE ' + e.message));
    pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text()) });
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(1500);
    let r;
    try { r = await pg.evaluate(MEDIR + '(' + JSON.stringify(CONPESO) + ',' + JSON.stringify(esc) + ')') }
    catch (e) { r = { fatal: e.message } }
    console.log('\n===== ESCENA ' + esc + (CONPESO ? ' (con peso/talla)' : ' (sin peso/talla)') + ' =====');
    console.log(JSON.stringify(r, null, 1));
    if (errs.length) { console.log('--- errores de consola/pagina (' + errs.length + ') ---'); errs.slice(0, 12).forEach(e => console.log('  ' + e)) }
    else console.log('errores de consola/pagina: 0');
    await pg.close();
  }
  await b.close();
  process.exit(0);
};
run().catch(e => { console.error('FATAL', e); process.exit(1) });
