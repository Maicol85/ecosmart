#!/usr/bin/env node
/**
 * _probe_correvid_wk.mjs - Chrome y WebKit sobre lo que esta tanda toca.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema con
 * channel 'chrome': sin eso la sonda devuelve los cruces VACIOS, que en un volcado se lee
 * igual que «no hubo diferencias».
 *
 * ⚠️ LA PESTAÑA Y EL ACORDEON SE ABREN POR SU BOTON REAL: con showTab programatico la tarjeta
 * de adentro queda sin caja y todo lo que hay dentro informa 0x0.
 *
 *   node scripts/_probe_correvid_wk.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || process.cwd() + '/index.html';

const CUERPO = `(async () => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const W = ms => new Promise(r => setTimeout(r, ms));
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const S = (id, v) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.value = v; el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true})) };
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  await W(250);
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','55');
  S('vm_morf','TEER mitral'); await W(450); S('im_grado','2');
  S('tga_tipo','mustard');
  await W(650);
  try { if (typeof generarInforme === 'function') generarInforme() } catch (x) {}
  await W(200);
  R.suma = String((EL('en_suma')||{}).value || '');
  R.sumaTeer = R.suma.indexOf('VM con TEER, con insuficiencia moderada.') >= 0;
  R.sumaNoRepite = R.suma.indexOf('IM moderada.') < 0;
  /* El panel: se arma por su funcion, que es lo que el modal pinta. */
  let P = null; try { P = (typeof _indTGA === 'function') ? _indTGA() : null } catch (x) { R.errs.push('panel: ' + x) }
  R.hayPanel = !!P;
  R.nPreg = P && P.clinica ? P.clinica.length : 0;
  R.nBloques = P && P.bloques ? P.bloques.length : 0;
  R.titACC = P && P.bloques && P.bloques[0] ? String(P.bloques[0].tit).slice(0, 60) : '';
  R.titESC = P && P.bloques && P.bloques[1] ? String(P.bloques[1].tit).slice(0, 60) : '';
  /* La fila del conteo de la miocardiopatia, por su BOTON REAL. */
  const b1 = bq('showTab(' + Q + 'congenitas'); if (b1) b1.click(); await W(400);
  const b2 = Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
             x => /mch/i.test(String(x.getAttribute('onclick'))) && /sec|toggle|card/i.test(String(x.getAttribute('onclick'))))[0];
  if (b2) b2.click(); await W(500);
  const fa = EL('mch-aha'); const row = fa ? fa.closest('.calc-row') : null;
  const lbl = row ? row.querySelector('.calc-lbl') : null;
  R.rotuloMCH = lbl ? String(lbl.textContent).trim() : 'SIN ROTULO';
  R.rotuloMCHCaja = lbl ? (function(){ const r = lbl.getBoundingClientRect();
    return Math.round(r.width) + 'x' + Math.round(r.height) })() : '0x0';
  /* Pantalla chica: desplazamiento horizontal y texto recortado. */
  R.scrollH = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  R.recortados = Array.prototype.filter.call(document.querySelectorAll('.calc-lbl, .ind-lbl, label'),
    n => n.offsetParent && n.scrollWidth > n.clientWidth + 2).length;
  R.pestanas = Array.prototype.filter.call(document.querySelectorAll('.tab-btn'),
    n => n.getBoundingClientRect().width > 0).length;
  return R;
})`;

const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['light', 'dark'];

(async () => {
  const out = [];
  for (const motor of ['chromium', 'webkit']) {
    let b;
    try { b = motor === 'chromium'
      ? await _pw.chromium.launch({ channel: 'chrome', headless: true })
      : await _pw.webkit.launch({ headless: true }); }
    catch (e) { console.log('== ' + motor + ' == NO ARRANCA: ' + e.message); continue }
    for (const w of ANCHOS) for (const tema of TEMAS) {
      const pg = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: tema });
      const errs = [];
      pg.on('pageerror', e => errs.push(e.message.slice(0, 110)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLA ' + m.text().slice(0, 90)) });
      await pg.goto('file://' + FILE); await pg.waitForTimeout(2200);
      let R;
      try { R = await Promise.race([ pg.evaluate(new Function('return ' + CUERPO)()),
        new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT')), 60000)) ]) }
      catch (e) { R = { errs: ['FALLO ' + e.message] } }
      out.push({ motor, w, tema, R, errs });
      await pg.close();
    }
    await b.close();
  }
  console.log('===== CHROME Y WEBKIT — TANDA CORR-EVID =====');
  console.log('archivo:', FILE);
  console.log('⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema.\n');
  const cl = ['sumaTeer','sumaNoRepite','hayPanel','nPreg','nBloques','titACC','titESC',
              'rotuloMCH','rotuloMCHCaja','scrollH','recortados','pestanas'];
  out.forEach(o => {
    console.log('-- ' + o.motor + ' ' + o.w + 'px ' + o.tema + ' --  errores: '
      + (o.errs.length ? o.errs.slice(0,2).join(' | ') : 'ninguno'));
    cl.forEach(k => console.log('     ' + k + ': ' + JSON.stringify((o.R || {})[k])));
  });
  /* Diferencias ENTRE motores, cruce por cruce. */
  console.log('\n--- diferencias entre motores, por cruce ---');
  let dif = 0;
  ANCHOS.forEach(w => TEMAS.forEach(t => {
    const a = out.find(o => o.motor === 'chromium' && o.w === w && o.tema === t);
    const b2 = out.find(o => o.motor === 'webkit' && o.w === w && o.tema === t);
    if (!a || !b2) return;
    cl.forEach(k => { if (JSON.stringify((a.R||{})[k]) !== JSON.stringify((b2.R||{})[k])) {
      dif++; console.log('  ' + w + 'px/' + t + ' ' + k + ': chrome=' + JSON.stringify((a.R||{})[k])
        + ' webkit=' + JSON.stringify((b2.R||{})[k])) } });
  }));
  console.log('  TOTAL de diferencias entre motores: ' + dif);
  const totErr = out.reduce((a, o) => a + o.errs.length, 0);
  console.log('  errores de consola y de pagina, sumando los ' + out.length + ' cruces: ' + totErr);
  process.exit(0);
})();
