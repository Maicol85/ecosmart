#!/usr/bin/env node
/**
 * _probe_popb_c3.mjs - el conteo de farmacos contra las filas visibles (POP-B-3).
 *
 *   node scripts/_probe_popb_c3.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const ESCENAS = [
  ['nada',            [],                      ''],
  ['solo_balon',      [],                      'bcia'],
  ['nor_dop_balon',   ['nor','dop'],           'bcia'],
  ['nor_dop',         ['nor','dop'],           ''],
  ['azul_solo',       ['azul'],                ''],
  ['azul_mas_nor',    ['azul','nor'],          'ecmo_va'],
  ['cinco',           ['nor','adr','dob','mil','vaso'], 'impella'],
  ['once',            ['nor','adr','dob','mil','vaso','levo','dop','ter','ntg','ntp','azul'], 'bcia'],
  ['asist_ninguna',   ['nor'],                 'ninguna']
];

const CUERPO = `(async (drogas, asist) => {
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
  drogas.forEach(k => C('pop_' + k + '_activa', true));
  if (asist) S('pop_asist_tipo', asist);
  try { popSync() } catch (e) { R.errs.push('popSync:' + e.message) }
  await W(600);
  R.cnt = (EL('pop_farmacos_cnt') || {}).textContent || '(sin span)';
  // filas REALMENTE visibles, medidas por geometria y no por la clase
  let vis = 0, nombres = [];
  Array.prototype.forEach.call(document.querySelectorAll('#pop_farm_rows .pop-droga'), function (d) {
    if (getComputedStyle(d).display !== 'none') { vis++; nombres.push(d.id || '(sin id)') }
  });
  R.filasVisibles = vis; R.filas = nombres;
  R.asist = (EL('pop_asist_tipo') || {}).value;
  return R;
})`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  let malos = 0;
  for (const [nom, drogas, asist] of ESCENAS) {
    const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.goto('file://' + FILE); await pg.waitForTimeout(1400);
    let r;
    try { r = await pg.evaluate(CUERPO + '(' + JSON.stringify(drogas) + ',' + JSON.stringify(asist) + ')') }
    catch (e) { r = { fatal: e.message } }
    const esp = drogas.length;
    const dice = /(\d+) marcado/.exec(r.cnt || '');
    const n = dice ? Number(dice[1]) : 0;
    const ok = (n === r.filasVisibles) && (r.filasVisibles === esp);
    if (!ok) malos++;
    console.log((ok ? 'OK   ' : 'FALLA') + ' ' + nom.padEnd(16)
      + ' drogas=' + esp + ' asist=' + (r.asist || '-').padEnd(8)
      + ' cnt="' + r.cnt + '" filasVisibles=' + r.filasVisibles);
    if (!ok) console.log('        filas: ' + JSON.stringify(r.filas));
    await pg.close();
  }
  console.log('\nescenas que fallan: ' + malos + ' de ' + ESCENAS.length);
  await b.close(); process.exit(0);
};
run().catch(e => { console.error('FATAL', e); process.exit(1) });
