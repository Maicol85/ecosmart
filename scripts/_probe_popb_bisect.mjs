#!/usr/bin/env node
/**
 * _probe_popb_bisect.mjs - bisect de los siete commits de POP-A sobre «Integrar al informe».
 *
 * Para cada arbol: el estudio del medico, con peso/talla y sin, click REAL en el boton, y
 * reporta suficiente / disabled / title / integrado.
 *
 *   node scripts/_probe_popb_bisect.mjs <archivo.html> [...]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILES = process.argv.slice(2).filter(a => a.indexOf('.html') > 0);

const CUERPO = `(async (conPeso) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'), x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const S = (id, v2) => { const e = EL(id); if (!e) return; e.value = v2;
    e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})) };
  const C = (id, o) => { const e = EL(id); if (!e) return; e.checked = o; e.dispatchEvent(new Event('change',{bubbles:true})) };
  const W = ms => new Promise(r => setTimeout(r, ms));
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(250);
  const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click(); await W(250);
  if (conPeso) { S('peso','70'); S('talla','170'); S('sexo','Masculino') }
  C('pop_cx_cabg', true); C('pop_cx_valv', true); C('pop_cx_aorta', true); await W(150);
  C('pop_cx_v_ao', true); C('pop_cx_v_mi', true); C('pop_cx_v_tr', true);
  S('pop_monitor', 'swan'); await W(150);
  S('pop_sw_fc','80'); S('pop_sw_gc','4'); S('pop_sw_pam','78'); S('pop_sw_pad','50');
  S('pop_sw_pcp','16'); S('pop_sw_paps','100'); S('pop_sw_papd','50');
  C('pop_nor_activa', true); C('pop_dop_activa', true);
  S('pop_asist_tipo','bcia'); await W(150); S('pop_bcia_ratio','1:2');
  C('pop_dren_pi', true); C('pop_dren_med', true);
  S('pericardio','Derrame leve (<10mm)');
  S('pop_pleura_der','moderado'); S('pop_pleura_izq','severo');
  S('pop_pulmon_lineasb','difusas'); S('pop_pulmon_consol','derecha'); S('pop_pulmon_neumo','ausente');
  try { popSync() } catch (e) { R.errs.push('popSync:' + e.message) }
  await W(800);
  try { const p = popPatron(); R.suf = p.suficiente; R.motivo = p.motivo } catch (e) { R.suf = 'ERR ' + e.message }
  const b2 = EL('pop_integrar');
  R.dis = b2 ? b2.disabled : 'NO BTN';
  R.tit = b2 ? (b2.getAttribute('title') || '(vacio)') : '-';
  R.cnt = (EL('pop_farmacos_cnt') || {}).textContent || '-';
  return R;
})`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  for (const conPeso of [true, false]) {
    console.log('\n===== ' + (conPeso ? 'CON peso y talla' : 'SIN peso ni talla') + ' =====');
    for (const f of FILES) {
      const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
      await pg.goto('file://' + f);
      await pg.waitForTimeout(1400);
      let r;
      try { r = await pg.evaluate(CUERPO + '(' + JSON.stringify(conPeso) + ')') } catch (e) { r = { fatal: e.message } }
      let clic = '-', integrado = '-';
      try { await pg.click('#pop_integrar', { timeout: 3000 }); clic = 'ok' } catch (e) { clic = 'NO CLICKEABLE' }
      await pg.waitForTimeout(400);
      try { integrado = await pg.evaluate('(() => !!amiloIntegrado("pop"))()') } catch (e) { integrado = 'ERR' }
      console.log(f.split('/').pop().padEnd(20) + ' suf=' + String(r.suf).padEnd(6)
        + ' dis=' + String(r.dis).padEnd(6) + ' clic=' + String(clic).padEnd(14)
        + ' integrado=' + String(integrado).padEnd(6) + ' cnt=' + r.cnt
        + '\n    title=' + String(r.tit).slice(0, 95));
      await pg.close();
    }
  }
  await b.close(); process.exit(0);
};
run().catch(e => { console.error('FATAL', e); process.exit(1) });
