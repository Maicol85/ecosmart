#!/usr/bin/env node
/**
 * _probe_popb_clic.mjs - el boton «Integrar al informe» del posoperatorio, con CLICK REAL.
 *
 * El click programatico no hace hit-testing: un elemento que tape el boton pasa inadvertido.
 * Aca se mide con elementFromPoint en los cinco puntos y con el click real de Playwright, en
 * cuatro anchos y con el panel de farmacos cerrado y abierto.
 *
 *   node scripts/_probe_popb_clic.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const SEMBRAR = `(async (abrirPanel) => {
  const R = { errs: [] };
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
  try { popSync() } catch (e) { R.errs.push('popSync:' + e.message) }
  await W(600);
  if (abrirPanel) { const d = EL('pop_farmacos_det'); if (d) { d.open = true; await W(300) } }
  const btn = EL('pop_integrar');
  if (!btn) { R.sinBtn = true; return R }
  btn.scrollIntoView({ block: 'center' });
  await W(300);
  const b2 = btn.getBoundingClientRect();
  R.rect = { x: Math.round(b2.left), y: Math.round(b2.top), w: Math.round(b2.width), h: Math.round(b2.height) };
  R.dis = btn.disabled;
  const pts = [[b2.left + 2, b2.top + 2], [b2.right - 2, b2.top + 2], [b2.left + 2, b2.bottom - 2],
               [b2.right - 2, b2.bottom - 2], [b2.left + b2.width / 2, b2.top + b2.height / 2]];
  R.puntos = pts.map(function (p) {
    const el = document.elementFromPoint(p[0], p[1]);
    if (!el) return 'null';
    if (el === btn) return 'PROPIO';
    return (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + (el.className || '').toString().split(' ')[0]);
  });
  R.propios = R.puntos.filter(function (x) { return x === 'PROPIO' }).length;
  R.integradoAntes = !!amiloIntegrado('pop');
  return R;
})`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  for (const abrir of [false, true]) {
    for (const W of [1440, 1000, 768, 390]) {
      const pg = await b.newPage({ viewport: { width: W, height: 900 } });
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGE ' + e.message));
      await pg.goto('file://' + FILE);
      await pg.waitForTimeout(1500);
      let r;
      try { r = await pg.evaluate(SEMBRAR + '(' + JSON.stringify(abrir) + ')') } catch (e) { r = { fatal: e.message } }
      let clic = 'no probado', integrado = '-';
      try {
        await pg.click('#pop_integrar', { timeout: 4000 });
        clic = 'OK';
      } catch (e) { clic = 'FALLA: ' + String(e.message).split('\n')[0].slice(0, 110) }
      await pg.waitForTimeout(500);
      try { integrado = await pg.evaluate('(() => !!amiloIntegrado("pop"))()') } catch (e) { integrado = 'ERR' }
      console.log('panel ' + (abrir ? 'ABIERTO' : 'cerrado') + ' | ' + String(W).padStart(4) + ' px'
        + ' | rect ' + JSON.stringify(r.rect) + ' dis=' + r.dis
        + ' | puntos ' + r.propios + '/5 ' + JSON.stringify(r.puntos)
        + '\n      click real: ' + clic + ' -> integrado=' + integrado
        + (errs.length ? ' | PAGEERR ' + errs.length : ''));
      await pg.close();
    }
  }
  await b.close(); process.exit(0);
};
run().catch(e => { console.error('FATAL', e); process.exit(1) });
