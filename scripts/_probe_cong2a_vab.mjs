#!/usr/bin/env node
/**
 * _probe_cong2a_vab.mjs — la CAUSA del caso del medico (CONG-2A, punto 1a).
 * Reproduce el gesto exacto: elegir un tipo de fusion y volver a dejar «—», y mide QUE
 * mantiene viva la valvula bicuspide en cada superficie, campo por campo.
 *   node scripts/_probe_cong2a_vab.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium } = _pw;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await b.newPage(); const errs = [];
pg.on('pageerror', e => errs.push(e.message));
pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(1500);

const r = await pg.evaluate(`(async () => {
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = document.getElementById(i); if (m) m.style.display = 'none' });
  const esperar = ms => new Promise(res => setTimeout(res, ms));
  const lim = () => { try { limpiarCampos(true) } catch (e) {} };
  const T = id => { const e = document.getElementById(id); return e ? String(e.value || e.textContent || '') : 'NO ' + id };
  const poner = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const lineaVAB = s => String(s || '').split(String.fromCharCode(10))
      .filter(l => l.indexOf('bicúspide') >= 0 || l.indexOf('VAB') >= 0).join(' | ').slice(0, 220);
  const foto = () => {
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    const inf = T('informe_texto'), su = T('en_suma');
    let cc = null, sf = null, eb = null;
    try { cc = vabConclusion(); } catch (e) {}
    try { sf = vabSumaFrase(); } catch (e) {}
    try { eb = _indVABEsBicuspide(); } catch (e) {}
    return { va_morf: T('va_morf'), vab_tipo: T('vab_tipo'),
             capsula: T('vab-concl').slice(0, 100),
             infVAB: lineaVAB(inf), sumaVAB: lineaVAB(su),
             concl: cc ? String(cc.clave) + ' :: ' + String(cc.txt || '').slice(0, 70) : 'null',
             sumaFrase: sf || 'null', esBicuspide: eb,
             aviso: T('vab-morf-aviso').slice(0, 80) };
  };
  const out = {};
  /* 1 · El gesto del medico: elegir «Fusion R-L» y volver a «—». */
  lim(); await esperar(300); out.a_limpio = foto();
  poner('vab_tipo', 'fused_rl'); await esperar(450); out.b_elegido = foto();
  poner('vab_tipo', ''); await esperar(450); out.c_desmarcado = foto();
  /* 2 · Lo que lo mantiene: se devuelve va_morf a su valor de fabrica y se vuelve a medir. */
  poner('va_morf', 'Trivalva normal'); await esperar(450); out.d_morfRevertida = foto();
  /* 3 · CONTROL NEGATIVO: la morfologia puesta A MANO por el medico, sin tocar nunca el tipo.
     Si esto publica la bicuspide, el comportamiento del paso c es el MISMO que el del medico
     eligiendo «Bicuspide» en Valvulas, o sea la afirmacion que la app no puede borrar sola. */
  lim(); await esperar(300); poner('va_morf', 'Bicúspide'); await esperar(450);
  out.e_soloMorfManual = foto();
  /* 4 · CONTROL NEGATIVO 2: una morfologia que el medico SI eligio (protesis) no se pisa. */
  lim(); await esperar(300); poner('va_morf', 'TAVI'); await esperar(300);
  poner('vab_tipo', 'fused_rl'); await esperar(450); out.f_tavi = foto();
  lim(); await esperar(300);
  return out;
})()`, { timeout: 0 });
console.log(JSON.stringify(r, null, 1));
console.log('errores de consola:', errs.length, errs.slice(0, 3));
await b.close(); process.exit(0);
