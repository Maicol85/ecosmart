#!/usr/bin/env node
/**
 * _probe_popb_round.mjs - guardar el estudio del medico con el camino REAL de la app y reabrirlo.
 *
 *   node scripts/_probe_popb_round.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `(async () => {
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
  const W = ms => new Promise(r => setTimeout(r, ms));
  try { const b = bq('showTab(' + Q + 'hemodinamica'); if (b) b.click(); else showTab('hemodinamica') } catch (e) {}
  await W(250);
  try { const b = bq('toggleCard(' + Q + 'pop-seccion'); if (b) b.click() } catch (e) {}
  await W(250);
  // datos del paciente: nombre y documento hacen falta para que guardarInforme no salga temprano
  ['nombre','paciente','pac_nombre','nombre_paciente'].forEach(function (id) { const e = EL(id); if (e) { e.value = 'Prueba POPB'; R.traza.push('nombre en ' + id) } });
  ['documento','ci','pac_ci','pac_doc'].forEach(function (id) { const e = EL(id); if (e) { e.value = '12345678'; R.traza.push('doc en ' + id) } });
  S('peso', '70'); S('talla', '170'); S('sexo', 'Masculino');
  C('pop_cx_cabg', true); C('pop_cx_valv', true); C('pop_cx_aorta', true);
  await W(150);
  C('pop_cx_v_ao', true); C('pop_cx_v_mi', true); C('pop_cx_v_tr', true);
  S('pop_monitor', 'swan'); await W(150);
  S('pop_sw_fc', '80'); S('pop_sw_gc', '4'); S('pop_sw_pam', '78'); S('pop_sw_pad', '50');
  S('pop_sw_pcp', '16'); S('pop_sw_paps', '100'); S('pop_sw_papd', '50');
  C('pop_nor_activa', true); C('pop_dop_activa', true);
  S('pop_asist_tipo', 'bcia'); await W(150); S('pop_bcia_ratio', '1:2');
  C('pop_dren_pi', true); C('pop_dren_med', true);
  S('pericardio', 'Derrame leve (<10mm)');
  S('pop_pleura_der', 'moderado'); S('pop_pleura_izq', 'severo');
  S('pop_pulmon_lineasb', 'difusas'); S('pop_pulmon_consol', 'derecha'); S('pop_pulmon_neumo', 'ausente');
  try { popSync() } catch (e) {}
  await W(600);
  R.antesGuardar = { suf: popPatron().suficiente, dis: EL('pop_integrar').disabled,
                     monitor: EL('pop_monitor').value, swGc: EL('pop_sw_gc').value, bsa: getBSA() };
  // guardar por el camino real, con reloj
  try { valvSevConfirmada = true } catch (e) { R.errs.push('valvSev:' + e.message) }
  const idPrev = (getInformes() || []).map(function (x) { return x.id });
  await new Promise(function (res) {
    let listo = false;
    const t = setTimeout(function () { if (!listo) { R.errs.push('guardarInforme no resolvio en 8 s'); res() } }, 8000);
    try { guardarInforme(function () { listo = true; clearTimeout(t); res() }) }
    catch (e) { R.errs.push('guardarInforme:' + e.message); clearTimeout(t); res() }
  });
  await W(800);
  const infs = getInformes() || [];
  R.nGuardados = infs.length;
  const nuevo = infs.filter(function (x) { return idPrev.indexOf(x.id) < 0 })[0] || infs[infs.length - 1];
  R.idNuevo = nuevo ? nuevo.id : 'NINGUNO';
  if (nuevo && nuevo.campos) {
    R.camposPop = Object.keys(nuevo.campos).filter(function (k) { return k.indexOf('pop') === 0 }).length;
    R.monitorGuardado = nuevo.campos['pop_monitor'];
    R.swGcGuardado = nuevo.campos['pop_sw_gc'];
    R.pesoGuardado = nuevo.campos['peso'];
    R.tallaGuardada = nuevo.campos['talla'];
  }
  // nuevo estudio y reabrir
  try { limpiarCampos() } catch (e) { R.errs.push('limpiar:' + e.message) }
  await W(600);
  try { editarInforme(R.idNuevo) } catch (e) { R.errs.push("editarInforme:" + e.message) }
  await W(500);
  try { const ok = document.getElementById('edit-ok'); if (ok) { ok.click(); R.traza.push('edit-ok clickeado') } else R.errs.push('NO HAY edit-ok') } catch (e) { R.errs.push('edit-ok:' + e.message) }
  await W(1800);
  try { const b = bq('showTab(' + Q + 'hemodinamica'); if (b) b.click() } catch (e) {}
  await W(300);
  try { const b = bq('toggleCard(' + Q + 'pop-seccion'); if (b) b.click() } catch (e) {}
  await W(400);
  R.trasReabrir = { monitor: (EL('pop_monitor') || {}).value, swGc: (EL('pop_sw_gc') || {}).value,
                    bsa: getBSA(), peso: (EL('peso') || {}).value, talla: (EL('talla') || {}).value,
                    swWrap: EL('pop_sw_wrap') ? getComputedStyle(EL('pop_sw_wrap')).display : 'NO',
                    suf: (function () { try { return popPatron().suficiente } catch (e) { return 'ERR ' + e.message } })(),
                    motivo: (function () { try { return popPatron().motivo } catch (e) { return '' } })(),
                    dis: (EL('pop_integrar') || {}).disabled, tit: (EL('pop_integrar') || {}).title };
  try { EL('pop_integrar').click() } catch (e) { R.errs.push('click:' + e.message) }
  await W(600);
  R.integradoTrasReabrir = !!amiloIntegrado('pop');
  // limpieza: borramos el estudio de prueba
  try { const todos = (getInformes() || []).filter(function (x) { return x.id !== R.idNuevo });
        guardarInformesSeguro(todos); R.traza.push('estudio de prueba borrado') } catch (e) { R.errs.push('borrar:' + e.message) }
  return R;
})()`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text()) });
  pg.on('dialog', d => d.accept());
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1500);
  let r;
  try { r = await pg.evaluate(CUERPO) } catch (e) { r = { fatal: e.message } }
  console.log('===== ' + FILE.split('/').pop() + ' =====');
  console.log(JSON.stringify(r, null, 1));
  console.log('--- consola (' + errs.length + ') ---');
  errs.filter(e => e.indexOf('ERR_FILE_NOT_FOUND') < 0).slice(0, 10).forEach(e => console.log('  ' + e));
  await pg.close(); await b.close(); process.exit(0);
};
run().catch(e => { console.error('FATAL', e); process.exit(1) });
