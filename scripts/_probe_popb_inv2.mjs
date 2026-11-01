#!/usr/bin/env node
/**
 * _probe_popb_inv2.mjs - INVENTARIO 1a de POP-B, segunda vuelta (solo lectura).
 *
 * El estudio del medico CON peso y talla, con el tipo de cada valvula elegido, y mirando el
 * estado DESPUES del barrido de 220 ms: si algo retira el bloque, se ve aca.
 *
 *   node scripts/_probe_popb_inv2.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const MEDIR = `(async () => {
  const R = { errs: [], traza: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const S = (id, val) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return } e.value = val;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) };
  const C = (id, on) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return } e.checked = !!on;
    e.dispatchEvent(new Event('change', { bubbles: true })) };
  const estado = () => ({ integrado: (typeof amiloIntegrado === 'function') ? !!amiloIntegrado('pop') : 'NO FN',
    txtLen: (EL('am-txt-pop') ? String(EL('am-txt-pop').value || '').length : 'NO TA'),
    btnDis: (EL('pop_integrar') || {}).disabled, btnTit: (EL('pop_integrar') || {}).title,
    btnTxt: (EL('pop_integrar') || {}).textContent, suf: (function(){ try { return popPatron().suficiente } catch(e){ return 'ERR ' + e.message } })() });

  try { const b = bq('showTab(' + Q + 'hemodinamica'); if (b) b.click(); else showTab('hemodinamica') } catch (e) { R.errs.push('tab:' + e.message) }
  await new Promise(r => setTimeout(r, 250));
  try { const b = bq('toggleCard(' + Q + 'pop-seccion'); if (b) b.click() } catch (e) { R.errs.push('acc:' + e.message) }
  await new Promise(r => setTimeout(r, 300));

  S('peso', '70'); S('talla', '170'); S('sexo', 'Masculino');
  C('pop_cx_cabg', true); C('pop_cx_valv', true); C('pop_cx_aorta', true);
  await new Promise(r => setTimeout(r, 200));
  C('pop_cx_v_ao', true); C('pop_cx_v_mi', true); C('pop_cx_v_tr', true);
  await new Promise(r => setTimeout(r, 300));
  // las opciones que el selector de tipo ofrece HOY, para el commit 2
  ['pop-esp-vao','pop-esp-vmi','pop-esp-vtr','pop-esp-vpu'].forEach(id => {
    const e = EL(id);
    R.traza.push(id + ' => ' + (e ? Array.prototype.map.call(e.options, o => (o.value === '' ? '(vacio)' : o.value)).join(' | ') : 'NO EXISTE'));
  });
  // elegimos el tipo como lo hizo el medico
  const opTiene = (id, t) => { const e = EL(id); if (!e) return null;
    const o = Array.prototype.filter.call(e.options, x => x.value.toLowerCase().indexOf(t) >= 0)[0]; return o ? o.value : null };
  const vao = opTiene('pop-esp-vao', 'mec'); if (vao) S('pop-esp-vao', vao); R.traza.push('vao elegido: ' + vao);
  const vmi = opTiene('pop-esp-vmi', 'biol'); if (vmi) S('pop-esp-vmi', vmi); R.traza.push('vmi elegido: ' + vmi);
  await new Promise(r => setTimeout(r, 300));
  R.vtrValor = (EL('pop-esp-vtr') || {}).value;
  R.vtrTag = (EL('pop-esp-vtr-tag') || {}).textContent;

  S('pop_monitor', 'swan');
  await new Promise(r => setTimeout(r, 200));
  S('pop_sw_fc', '80'); S('pop_sw_gc', '4'); S('pop_sw_pam', '78'); S('pop_sw_pad', '50');
  S('pop_sw_pcp', '16'); S('pop_sw_paps', '100'); S('pop_sw_papd', '50');
  C('pop_nor_activa', true); C('pop_dop_activa', true);
  S('pop_asist_tipo', 'bcia');
  await new Promise(r => setTimeout(r, 200));
  S('pop_bcia_ratio', '1:2');
  C('pop_dren_pi', true); C('pop_dren_med', true);
  S('pericardio', 'Derrame leve (<10mm)');
  S('pop_pleura_der', 'moderado'); S('pop_pleura_izq', 'severo');
  S('pop_pulmon_lineasb', 'difusas'); S('pop_pulmon_consol', 'derecha'); S('pop_pulmon_neumo', 'ausente');
  try { popSync() } catch (e) { R.errs.push('popSync:' + e.message) }
  await new Promise(r => setTimeout(r, 900));

  R.cntFarmacos = (EL('pop_farmacos_cnt') || {}).textContent;
  R.filasVisibles = (function(){ let n = 0; (window.POP_DROGAS || []).forEach(k => {
    const w = EL('pop_' + k + '_wrap'); if (w && getComputedStyle(w).display !== 'none') n++ }); return n })();
  try { R.genLen = String(amiloTextoPOP() || '').length } catch (e) { R.genErr = e.message }

  R.antes = estado();
  try { EL('pop_integrar').click() } catch (e) { R.errs.push('click:' + e.message) }
  await new Promise(r => setTimeout(r, 300));
  R.alClic = estado();
  await new Promise(r => setTimeout(r, 1200));
  R.tras1200 = estado();
  // y ahora una tecla mas, que dispara el barrido de 220 ms
  S('pop_lactato', '3.1');
  await new Promise(r => setTimeout(r, 1200));
  R.trasTecla = estado();
  // el informe
  try { generarInforme() } catch (e) { R.errs.push('generarInforme:' + e.message) }
  await new Promise(r => setTimeout(r, 700));
  const inf = EL('informe_texto');
  const t = inf ? String(inf.value || '') : '';
  R.infLen = t.length;
  R.infTienePOP = t.indexOf('PostCEC') >= 0 || t.toLowerCase().indexOf('post-cec') >= 0 || t.toLowerCase().indexOf('postcec') >= 0;
  return R;
})()`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type().toUpperCase() + ' ' + m.text()) });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1500);
  let r;
  try { r = await pg.evaluate(MEDIR) } catch (e) { r = { fatal: e.message } }
  console.log('===== ' + FILE.split('/').pop() + ' =====');
  console.log(JSON.stringify(r, null, 1));
  console.log('--- consola/pagina (' + errs.length + ') ---');
  errs.slice(0, 20).forEach(e => console.log('  ' + e));
  await pg.close(); await b.close(); process.exit(0);
};
run().catch(e => { console.error('FATAL', e); process.exit(1) });
