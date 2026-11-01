#!/usr/bin/env node
/**
 * _probe_popb_c4.mjs - el alto de cada columna del posoperatorio en seis casos (POP-B-4).
 *
 *   node scripts/_probe_popb_c4.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CASOS = [
  ['sin_monitoreo', '',      []],
  ['swan',          'swan',  []],
  ['picco',         'picco', []],
  ['0_farmacos',    'swan',  []],
  ['2_farmacos',    'swan',  ['nor','dop']],
  ['5_farmacos',    'swan',  ['nor','adr','dob','mil','vaso']]
];

const CUERPO = `(async (mon, drogas) => {
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
  const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click(); await W(300);
  S('peso','70'); S('talla','170');
  if (mon) { S('pop_monitor', mon); await W(200);
    if (mon === 'swan') { S('pop_sw_fc','80'); S('pop_sw_gc','4'); S('pop_sw_pam','78'); S('pop_sw_pad','50'); S('pop_sw_pcp','16') }
    if (mon === 'picco') { S('pop_picco_ic','2.1'); S('pop_picco_svri','1500') } }
  drogas.forEach(k => C('pop_' + k + '_activa', true));
  try { popSync() } catch (e) { R.errs.push('popSync:' + e.message) }
  await W(700);
  const h = el => el ? Math.round(el.getBoundingClientRect().height) : -1;
  R.cols = Array.prototype.map.call(document.querySelectorAll('#pop-seccion .pop-cols > .pop-col'), h);
  R.cards = {};
  Array.prototype.forEach.call(document.querySelectorAll('#pop-seccion .pop-card'), function (c) {
    R.cards[c.getAttribute('data-pop') || '?'] = h(c);
  });
  R.cols3 = Array.prototype.map.call(document.querySelectorAll('#pop-seccion .pop-cols > .pop-col'), function (col) {
    let suma = 0, n = 0;
    Array.prototype.forEach.call(col.children, function (ch) { suma += h(ch); n++ });
    return { alto: h(col), contenido: suma + (n > 1 ? (n - 1) * 10 : 0), tarjetas: n };
  });
  return R;
})`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  for (const Wd of [1440, 1000]) {
    console.log('\n===== ' + Wd + ' px =====');
    console.log('caso             col1   col2   col3   | hueco1 hueco2 hueco3 | el mas alto');
    for (const [nom, mon, drogas] of CASOS) {
      const pg = await b.newPage({ viewport: { width: Wd, height: 1000 } });
      await pg.goto('file://' + FILE); await pg.waitForTimeout(1400);
      let r;
      try { r = await pg.evaluate(CUERPO + '(' + JSON.stringify(mon) + ',' + JSON.stringify(drogas) + ')') }
      catch (e) { r = { fatal: e.message, cols: [], cols3: [] } }
      const c = r.cols3 || [];
      const altos = c.map(x => x.alto);
      const max = Math.max.apply(null, altos.concat([0]));
      const huecos = altos.map(a => max - a);
      console.log(nom.padEnd(16)
        + altos.map(a => String(a).padStart(5)).join('  ')
        + '  |  ' + huecos.map(a => String(a).padStart(5)).join('  ')
        + '  | ' + max + ' px');
      if (Wd === 1440 && nom === '5_farmacos') console.log('   tarjetas: ' + JSON.stringify(r.cards));
      await pg.close();
    }
  }
  await b.close(); process.exit(0);
};
run().catch(e => { console.error('FATAL', e); process.exit(1) });
