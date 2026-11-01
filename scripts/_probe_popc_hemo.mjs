#!/usr/bin/env node
/**
 * _probe_popc_hemo.mjs - la hemodinamica del posoperatorio (POP-C, commit 3).
 *
 * Mide, con gestos reales en Chrome:
 *   3a - el corte del indice cardiaco en los CUATRO lugares del posoperatorio que lo rotulan
 *        (eco, Swan, PiCCO y la conclusion), en los bordes 2,19 / 2,20 / 2,21. El unico que
 *        puede caer en el 2,20 EXACTO es el PiCCO, porque el medico lo tipea; los otros tres
 *        dividen un gasto por la superficie corporal.
 *        Y EL CONTROL NEGATIVO: la capsula «Perfil hemodinamico» de HEMODINAMICA, que esta
 *        orden NO autoriza a tocar, tiene que seguir diciendo «bajo» con 2,2 exactos.
 *   3b - la precarga sin banda: el valor, su origen, la salvedad y CERO veredicto.
 *   3c - el pericardio listando los signos del modulo.
 *   3d - los dos rotulos.
 *
 *   node scripts/_probe_popc_hemo.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `(async () => {
  const R = { errs: [], ic: [], pre: [], peri: [], rot: {}, ctrl: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const W = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return }
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})) };
  const C = (id, o) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return }
    e.checked = o; e.dispatchEvent(new Event('change',{bubbles:true})) };
  const txt = id => { const e = EL(id); return e ? String(e.textContent || '').replace(/\\s+/g,' ').trim() : 'NO EXISTE' };

  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(300);
  const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click(); await W(400);
  S('peso','70'); S('talla','170');

  /* ── 3a · EL PiCCO EN LOS TRES BORDES. Es el unico que llega al 2,20 EXACTO. ── */
  S('pop_monitor','picco'); await W(300);
  for (const v of ['2.19','2.20','2.21']) {
    S('pop_picco_ic', v); S('pop_picco_gc','4');
    await W(450);
    const p = (typeof popPatron === 'function') ? popPatron() : null;
    R.ic.push({ via:'PiCCO', ic:v, celda: txt('pop-picco-box').slice(0,60),
                patron: p ? (p.pat || {}).lbl : 'n/a',
                gasto: p ? ((p.preguntas||[]).filter(q=>q.q.indexOf('Gasto')>=0)[0]||{}).r : 'n/a' });
  }
  /* ── y el SWAN, donde el 2,20 exacto es practicamente inalcanzable: se declara. ── */
  S('pop_monitor','swan'); await W(300);
  const bsa = (typeof getBSA === 'function') ? getBSA() : null;
  R.rot.bsa = bsa;
  for (const ic of [2.19, 2.20, 2.21]) {
    S('pop_sw_gc', String(ic * bsa)); S('pop_sw_pam','78'); S('pop_sw_pad','10');
    await W(450);
    const p = (typeof popPatron === 'function') ? popPatron() : null;
    R.ic.push({ via:'Swan', ic: ic.toFixed(2), celda: txt('pop-sw-ic'),
                patron: p ? (p.pat || {}).lbl : 'n/a',
                gasto: p ? ((p.preguntas||[]).filter(q=>q.q.indexOf('Gasto')>=0)[0]||{}).r : 'n/a' });
  }

  /* ── CONTROL NEGATIVO: la capsula de HEMODINAMICA no se toca. 2,2 exactos siguen «bajo». ── */
  S('pop_monitor',''); await W(200);
  const bh = bq('showTab(' + Q + 'hemodinamica'); if (bh) bh.click(); await W(250);
  R.ctrl.push({ q: '_icBanda(2.2) sigue diciendo bajo (NO se toco)',
                v: (typeof _icBanda === 'function') ? JSON.stringify(_icBanda(2.2)) : 'NO EXISTE' });
  R.ctrl.push({ q: '_popIcBanda(2.2) dice normal (corte estricto del POP)',
                v: (typeof _popIcBanda === 'function') ? JSON.stringify(_popIcBanda(2.2)) : 'NO EXISTE' });
  R.ctrl.push({ q: '_popIcBanda(2.19) dice bajo',
                v: (typeof _popIcBanda === 'function') ? JSON.stringify(_popIcBanda(2.19)) : 'NO EXISTE' });
  R.ctrl.push({ q: '_icBanda(2.19) dice bajo (identico)',
                v: (typeof _icBanda === 'function') ? JSON.stringify(_icBanda(2.19)) : 'NO EXISTE' });
  R.ctrl.push({ q: 'FORR_IC_CORTE no se movio',
                v: (typeof FORR_IC_CORTE !== 'undefined') ? String(FORR_IC_CORTE) : 'NO EXISTE' });

  /* ── 3b · LA PRECARGA: el valor sin banda. ── */
  const bp = bq('toggleCard(' + Q + 'pop-seccion'); if (bp) bp.click(); await W(300);
  S('pop_monitor','swan'); await W(250);
  S('pop_sw_gc','4.5'); S('pop_sw_pam','78'); S('pop_sw_pad','10');
  for (const pcp of ['8','14','22','']) {
    S('pop_sw_pcp', pcp); await W(450);
    const p = (typeof popPatron === 'function') ? popPatron() : null;
    const f = p ? (p.preguntas||[]).filter(q => /capilar|recarga/i.test(q.q))[0] : null;
    R.pre.push({ pcp: pcp || '(vacia)', preg: f ? f.q : 'NO HAY FILA', r: f ? f.r : '',
                 cls: f ? f.cls : '', hallazgo: f ? f.hallazgo : '' });
  }

  /* ── 3c · EL PERICARDIO: los signos. ── */
  S('pop_sw_pcp','14');
  for (const esc of [
      { n:'sin nada',              peri:'', hemo:'', colvd:'', vci:'', col:'' },
      { n:'signos sin veredicto',  peri:'Derrame severo (>20mm)', hemo:'', colvd:'si', vci:'24', col:'<50' },
      { n:'veredicto del medico',  peri:'Derrame severo (>20mm)', hemo:'si', colvd:'si', vci:'24', col:'<50' }]) {
    S('pericardio', esc.peri); S('pericardio_hemo', esc.hemo);
    S('dpt_col_vd', esc.colvd); S('vci_diam', esc.vci); S('vci_col', esc.col);
    await W(500);
    const p = (typeof popPatron === 'function') ? popPatron() : null;
    const f = p ? (p.preguntas||[]).filter(q => /peric/i.test(q.q))[0] : null;
    R.peri.push({ esc: esc.n, preg: f ? f.q : 'NO HAY FILA', r: f ? f.r : '', cls: f ? f.cls : '',
                  patron: p ? (p.pat || {}).lbl : 'n/a' });
  }

  /* ── 3d · LOS DOS ROTULOS, en el HTML de la conclusion. ── */
  S('pericardio',''); S('pericardio_hemo',''); S('dpt_col_vd',''); S('vci_diam',''); S('vci_col','');
  S('tapse','12'); S('vd_vi','1.2');
  await W(600);
  try { if (typeof popConclSync === 'function') popConclSync() } catch (e) { R.errs.push('conclSync ' + e.message) }
  await W(400);
  const cj = EL('pop-concl-box');
  const h = cj ? String(cj.innerHTML || '') : '';
  const t = cj ? String(cj.textContent || '').replace(/\\s+/g,' ') : '';
  R.rot.hayCaja = !!cj;
  R.rot.largo = t.length;
  R.rot.patronCriterioEcoSmart = /Criterio de EcoSmart/i.test(t);
  R.rot.vdRotuloTep = /cortes de la c.psula de TEP/i.test(t);
  R.rot.fraseVD = (() => { const i = t.indexOf('Falla del VD'); return i < 0 ? '(no esta)' : t.slice(i, i+150) })();
  R.rot.frasePatron = (() => { const i = t.indexOf('Patr'); return i < 0 ? '(no esta)' : t.slice(i, i+120) })();
  R.rot.sinAdecuada = !/Precarga adecuada/i.test(t);
  R.rot.sinEnRango = !/en rango/i.test(t);
  return R;
})`;

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  let R;
  try {
    R = await Promise.race([
      pg.evaluate(new Function('return ' + CUERPO)()),
      new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT 150s')), 150000))
    ]);
  } catch (e) { console.log('FALLO:', e.message); await b.close(); process.exit(1) }

  console.log('===== LA HEMODINAMICA DEL POSOPERATORIO (POP-C 3) =====');
  console.log('archivo:', FILE, '  BSA de la escena:', R.rot.bsa);
  console.log('\n--- 3a · EL CORTE DEL INDICE CARDIACO, en los bordes ---');
  console.log('via   | IC    | celda de la pantalla                | patron                | la fila del gasto');
  for (const x of R.ic) console.log([String(x.via).padEnd(5), String(x.ic).padEnd(5),
    String(x.celda).slice(0,35).padEnd(35), String(x.patron).slice(0,21).padEnd(21),
    String(x.gasto).slice(0,60)].join(' | '));
  console.log('\n--- CONTROL NEGATIVO: lo que esta orden NO autoriza a tocar ---');
  for (const x of R.ctrl) console.log('  ' + x.q.padEnd(58) + ' -> ' + x.v);
  console.log('\n--- 3b · LA PRECARGA ---');
  for (const x of R.pre) console.log('  PCP ' + String(x.pcp).padEnd(8) + ' | pregunta: ' + x.preg
    + '\n      respuesta: ' + x.r + '\n      color: ' + x.cls + '   hallazgo: "' + x.hallazgo + '"');
  console.log('\n--- 3c · EL PERICARDIO ---');
  for (const x of R.peri) console.log('  ' + x.esc.padEnd(22) + ' | ' + x.preg
    + '\n      ' + x.r + '   [' + x.cls + ']  patron=' + x.patron);
  console.log('\n--- 3d · LOS ROTULOS ---');
  console.log(JSON.stringify(R.rot, null, 1));
  if (R.errs.length) console.log('\nERRS SONDA:', R.errs.join(' ; '));
  console.log('\nerrores de pagina: ' + errs.length + (errs.length ? ' -> ' + errs.slice(0,4).join(' ; ') : ''));
  await b.close();
  process.exit(0);
})();
