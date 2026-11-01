#!/usr/bin/env node
/**
 * _probe_popb_var.mjs - barrido de variantes del estudio del medico (solo lectura).
 *
 * Para cada variante: siembra, llama amiloTextoPOP() en try/catch, hace click REAL en
 * «Integrar al informe» y reporta si quedo integrado. Busca la combinacion que falla.
 *
 *   node scripts/_probe_popb_var.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const VARS = ['base', 'azul_sin_dosis', 'azul_con_dosis', 'solo_otra', 'cuatro_valvulas',
              'picco', 'ecmo_vv', 'tri_mixomatosa', 'tres_drenajes', 'guardar_restaurar'];

const MEDIR = `(async (variante) => {
  const R = { variante: variante, errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const S = (id, val) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return } e.value = val;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) };
  const C = (id, on) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return } e.checked = !!on;
    e.dispatchEvent(new Event('change', { bubbles: true })) };
  const W = ms => new Promise(r => setTimeout(r, ms));

  try { const b = bq('showTab(' + Q + 'hemodinamica'); if (b) b.click(); else showTab('hemodinamica') } catch (e) { R.errs.push('tab:' + e.message) }
  await W(250);
  try { const b = bq('toggleCard(' + Q + 'pop-seccion'); if (b) b.click() } catch (e) {}
  await W(250);
  S('peso', '70'); S('talla', '170'); S('sexo', 'Masculino');
  S('pac_nombre', 'Prueba POPB');
  if (variante === 'tri_mixomatosa') { S('vt_morf', 'Mixomatosa') }
  if (variante === 'solo_otra') { C('pop_cx_otra', true) }
  else { C('pop_cx_cabg', true); C('pop_cx_valv', true); C('pop_cx_aorta', true) }
  await W(200);
  if (variante === 'cuatro_valvulas') { C('pop_cx_v_ao', true); C('pop_cx_v_mi', true); C('pop_cx_v_tr', true); C('pop_cx_v_pu', true) }
  else if (variante !== 'solo_otra') { C('pop_cx_v_ao', true); C('pop_cx_v_mi', true); C('pop_cx_v_tr', true) }
  await W(200);
  if (variante === 'picco') { S('pop_monitor', 'picco'); await W(200); S('pop_picco_ic', '1.8'); S('pop_picco_svri', '1500') }
  else {
    S('pop_monitor', 'swan'); await W(200);
    S('pop_sw_fc', '80'); S('pop_sw_gc', '4'); S('pop_sw_pam', '78'); S('pop_sw_pad', '50');
    S('pop_sw_pcp', '16'); S('pop_sw_paps', '100'); S('pop_sw_papd', '50');
  }
  C('pop_nor_activa', true); C('pop_dop_activa', true);
  if (variante === 'azul_sin_dosis') { C('pop_azul_activa', true) }
  if (variante === 'azul_con_dosis') { C('pop_azul_activa', true); await W(150); S('pop_azul_dosis', '1.5') }
  if (variante === 'ecmo_vv') { S('pop_asist_tipo', 'ecmo_vv'); await W(150); S('pop_ecmo_flujo', '3.5') }
  else { S('pop_asist_tipo', 'bcia'); await W(150); S('pop_bcia_ratio', '1:2') }
  if (variante === 'tres_drenajes') { C('pop_dren_pd', true); C('pop_dren_pi', true); C('pop_dren_med', true) }
  else { C('pop_dren_pi', true); C('pop_dren_med', true) }
  S('pericardio', 'Derrame leve (<10mm)');
  S('pop_pleura_der', 'moderado'); S('pop_pleura_izq', 'severo');
  S('pop_pulmon_lineasb', 'difusas'); S('pop_pulmon_consol', 'derecha'); S('pop_pulmon_neumo', 'ausente');
  try { popSync() } catch (e) { R.errs.push('popSync:' + e.message) }
  await W(700);

  if (variante === 'guardar_restaurar') {
    try {
      const campos = {};
      document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function (e) {
        if (e.type === 'checkbox') campos[e.id + '__chk'] = e.checked ? '1' : '';
        else campos[e.id] = e.value;
      });
      limpiarCampos();
      await W(400);
      Object.keys(campos).forEach(function (k) {
        if (k.slice(-5) === '__chk') { const e = EL(k.slice(0, -5)); if (e) e.checked = campos[k] === '1' }
        else { const e = EL(k); if (e) e.value = campos[k] }
      });
      if (typeof _recalcModulos === 'function') _recalcModulos();
      try { popSync() } catch (e) {}
      await W(800);
    } catch (e) { R.errs.push('guardar_restaurar:' + e.message) }
  }

  try { R.genLen = String(amiloTextoPOP() || '').length } catch (e) { R.genErr = e.message }
  try { const p = popPatron(); R.suf = p.suficiente; R.patK = p.pat.k; R.motivo = p.motivo } catch (e) { R.sufErr = e.message }
  const btn = EL('pop_integrar');
  R.btn = btn ? { dis: btn.disabled, tit: btn.title, txt: btn.textContent } : 'NO BTN';
  try { if (btn) btn.click() } catch (e) { R.errs.push('click:' + e.message) }
  await W(500);
  R.integrado = (typeof amiloIntegrado === 'function') ? !!amiloIntegrado('pop') : 'NO FN';
  R.txtLen = EL('am-txt-pop') ? String(EL('am-txt-pop').value || '').length : 'NO TA';
  R.btnTxt2 = EL('pop_integrar') ? EL('pop_integrar').textContent : '';
  return R;
})`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  const malos = [];
  for (const v of VARS) {
    const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE ' + e.message));
    pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text()) });
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(1500);
    let r;
    try { r = await pg.evaluate(MEDIR + '(' + JSON.stringify(v) + ')') } catch (e) { r = { variante: v, fatal: e.message } }
    const ok = r.integrado === true;
    if (!ok) malos.push(v);
    console.log((ok ? 'OK   ' : 'FALLA') + ' ' + v.padEnd(20)
      + ' integrado=' + r.integrado + ' suf=' + r.suf + ' pat=' + r.patK
      + ' genLen=' + (r.genErr ? 'ERROR ' + r.genErr : r.genLen)
      + ' txtLen=' + r.txtLen + ' btnDis=' + (r.btn && r.btn.dis));
    if (r.motivo) console.log('        motivo: ' + r.motivo);
    if (r.errs && r.errs.length) console.log('        errs: ' + r.errs.join(' ; ').slice(0, 300));
    const ce = errs.filter(e => e.indexOf('ERR_FILE_NOT_FOUND') < 0);
    if (ce.length) console.log('        consola: ' + ce.slice(0, 4).join(' ; ').slice(0, 400));
    await pg.close();
  }
  console.log('\nVARIANTES QUE FALLAN: ' + (malos.length ? malos.join(', ') : 'ninguna'));
  await b.close(); process.exit(0);
};
run().catch(e => { console.error('FATAL', e); process.exit(1) });
