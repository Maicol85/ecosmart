/*
 * _probe_pant3tv.mjs - el modulo de arritmia ventricular (tanda PANT-3, commit 9).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide con GESTOS REALES lo que el commit decide: el rotulo nuevo, el valor nuevo del tipo, el
 * espejo CONDICIONAL de MCH con su marca de runtime, el boton Limpiar, las tres lineas de
 * resumen y la frase del papel. Tolera el arbol viejo: ahi el valor no existe y lo dice.
 *
 *   node scripts/_probe_pant3tv.mjs --file <index.html>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');

const MEDIR = `(async () => {
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const V = (id) => { const e = document.getElementById(id); return e ? String(e.value) : 'NO EXISTE' };
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.textContent || '').trim() : 'NO EXISTE' };
  const dis = (id) => { const e = document.getElementById(id); return e ? (e.disabled ? 'si' : 'no') : 'NO EXISTE' };
  const der = (id) => { const e = document.getElementById(id); return e ? String(e.dataset.tvderiv || '') : 'NO EXISTE' };
  const out = {};
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  await esperar(300);
  const lbl = (id) => { const e = document.getElementById(id); const fg = e && e.closest('.fg');
    const l = fg && fg.querySelector('label'); return l ? String(l.textContent || '').trim() : 'NO EXISTE' };
  out.rotulo = lbl('tv_documentada');
  const sel = document.getElementById('tv_tipo');
  out.opciones = sel ? Array.prototype.map.call(sel.options, o => o.value).join(',') : 'NO EXISTE';
  out.esPrimera = (function () { const ss = document.querySelectorAll('#tab-congenitas [id^="sacc-cc-"]');
    return ss.length ? ss[0].id : 'SIN SECCIONES' })();
  /* (A) la parada recuperada */
  S('tv_documentada', 'si'); S('tv_tipo', 'parada_rec'); S('tv_morfologia', 'bcri_sup');
  await esperar(350);
  out.A_tipo = V('tv_tipo');
  out.A_mchParada = V('mch_ex_parada'); out.A_mchDis = dis('mch_ex_parada'); out.A_mchDeriv = der('mch_ex_parada');
  out.A_mcaMayor = V('mca_v_may');
  out.A_resMch = T('mch-tv-res'); out.A_resMca = T('mca-tv-res'); out.A_resTdf = T('tdf-tv-res');
  out.A_tarjMch = T('tv-ap-mch'); out.A_tarjMca = T('tv-ap-mca'); out.A_tarjTdf = T('tv-ap-tdf');
  out.A_frase = (typeof tvFrase === 'function') ? String(tvFrase() || '') : 'SIN FN';
  /* (B) CONTROL NEGATIVO: TV sostenida con la misma morfologia SI suma criterio mayor */
  S('tv_tipo', 'sostenida'); await esperar(350);
  out.B_mcaMayor = V('mca_v_may'); out.B_mchParada = V('mch_ex_parada'); out.B_mchDis = dis('mch_ex_parada');
  out.B_frase = (typeof tvFrase === 'function') ? String(tvFrase() || '') : 'SIN FN';
  /* (C) al bajar a no sostenida, el Si derivado se va y el campo vuelve al medico */
  S('tv_tipo', 'no_sostenida'); await esperar(350);
  out.C_mchParada = V('mch_ex_parada'); out.C_mchDis = dis('mch_ex_parada'); out.C_mchDeriv = der('mch_ex_parada');
  /* (D) el Si del MEDICO no se pisa */
  S('mch_ex_parada', 'si'); await esperar(300);
  S('tv_tipo', 'ambas'); await esperar(350);
  S('tv_tipo', 'no_sostenida'); await esperar(350);
  out.D_mchParada = V('mch_ex_parada'); out.D_mchDeriv = der('mch_ex_parada');
  /* (E) Limpiar */
  try { if (typeof tvLimpiar === 'function') tvLimpiar(); else out.E_noFn = 1 } catch (e) { out.E_err = String(e).slice(0,80) }
  await esperar(350);
  out.E_doc = V('tv_documentada'); out.E_tipo = V('tv_tipo'); out.E_ev = V('tv_ev24h');
  out.E_resMch = T('mch-tv-res');
  return out;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push(e.message.slice(0, 120)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
await pg.waitForTimeout(1400);
await pg.evaluate(`(() => { ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'), x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click();
  const bs = bq('ccSubTab(' + Q + 'congenitas' + Q); if (bs) bs.click();
  document.querySelectorAll('#tab-congenitas [id^="sacc-cc-"]').forEach(sec => {
    if (!sec.classList.contains('open')) { const h = sec.querySelector('.sacc-hdr'); if (h) h.click() } });
  return 1 })()`);
await pg.waitForTimeout(900);
const r = await pg.evaluate(MEDIR);
console.log(JSON.stringify(r, null, 1));
console.log('errores de pagina: ' + errs.length + (errs.length ? ' :: ' + errs.join(' | ') : ''));
await pg.close(); await b.close(); process.exit(0);
