#!/usr/bin/env node
/**
 * _probe_pa_c4.mjs - contexto quirurgico: cirugias combinables, valvulas y drenajes (POP-A-4).
 *
 * DENOMINADORES: las once casillas nuevas con su id exacto, y el selector viejo todavia en el
 * marcado con su valor intacto.
 * CONTROLES NEGATIVOS: un estudio viejo con UNA cirugia publica el MISMO texto que antes; marcar
 * una valvula sin tipo no escribe ninguna morfologia; y las opciones de cada selector de tipo
 * son EXACTAMENTE las del selector dueno, ni una mas.
 *
 *   node scripts/_probe_pa_c4.mjs [--file <html>] [--ancho 1440]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = arg('--ancho') ? [Number(arg('--ancho'))] : [1440, 1000, 768, 390];

const ABRIR = `(async () => {
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { limpiarCampos(true) } catch (e) {}
  ['nombre','ci','peso','talla','sexo'].forEach((id, i) => { const e = EL(id);
    if (e) { e.value = ['Prueba POPA','777','70','170','M'][i];
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true })) } });
  const b = bq('showTab(' + Q + 'hemodinamica'); if (b) b.click();
  await new Promise(r => setTimeout(r, 250));
  const c = bq('toggleCard(' + Q + 'pop-seccion'); if (c) c.click();
  await new Promise(r => setTimeout(r, 300));
  return getComputedStyle(EL('pop-seccion')).display;
})()`;

const MEDIR = `(async () => {
  const R = {};
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const M = (id, on) => { const c = EL(id); if (!c) return 'NO ' + id; c.checked = !!on;
    c.dispatchEvent(new Event('change', { bubbles: true })); return c.checked };
  const vis = id => { const e = EL(id); return !!e && e.offsetParent !== null };
  const cx = id => { const e = EL(id); if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  const linea = pre => (typeof amiloTextoPOP === 'function'
    ? (String(amiloTextoPOP()).split(String.fromCharCode(10)).filter(l => l.indexOf(pre) === 0)[0] || '(sin linea)') : 'NO FN');
  /* DENOMINADOR DEL EN SUMA: sin indice cardiaco calculable popSumaLinea devuelve cadena
     vacia -su guarda r.suficiente-, y un vacio se lee igual que la linea no cambio. */
  S('pop_monitor', 'swan'); S('pop_sw_gc', '3.2'); S('pop_sw_pam', '70');
  await new Promise(r => setTimeout(r, 150));
  R.d0_sumaViva = (typeof popSumaLinea === 'function') ? (popSumaLinea() ? 'SI' : 'NO (denominador vacio)') : 'NO FN';
  const CXK = ['pop_cx_cabg','pop_cx_valv','pop_cx_aorta','pop_cx_otra'];
  const VK  = ['pop_cx_v_ao','pop_cx_v_mi','pop_cx_v_tr','pop_cx_v_pu'];
  const DK  = ['pop_dren_pd','pop_dren_pi','pop_dren_med'];
  const EK  = ['pop-esp-vao','pop-esp-vmi','pop-esp-vtr','pop-esp-vpu'];
  const DUE = ['va_morf','vm_morf','vt_morf','vp_morf'];

  /* ── D0 · DENOMINADOR ── */
  R.d0_cx = CXK.map(k => EL(k) ? 1 : 0).join('');
  R.d0_v  = VK.map(k => EL(k) ? 1 : 0).join('');
  R.d0_dren = DK.map(k => EL(k) ? 1 : 0).join('');
  R.d0_esp = EK.map(k => EL(k) ? 1 : 0).join('');
  R.d0_selViejo = EL('pop_cx_tipo') ? (EL('pop_cx_tipo').offsetParent === null ? 'existe y oculto' : 'existe y VISIBLE') : 'NO EXISTE';
  R.d0_otra = EL('pop_cx_tipo') ? Array.prototype.map.call(EL('pop_cx_tipo').options, o => o.value).join(',') : 'NO';
  R.d0_fueraEstudio = (typeof _noEsDelEstudio === 'function')
    ? EK.map(k => _noEsDelEstudio(k) ? 1 : 0).join('') + ' / casillas: ' + CXK.concat(VK, DK).map(k => _noEsDelEstudio(k) ? 1 : 0).join('') : 'NO FN';

  /* ── A · OPCIONES CLONADAS DEL DUENO, NI UNA MAS ── */
  R.a_opts = {};
  EK.forEach((k, i) => { const e = EL(k), d = EL(DUE[i]);
    if (!e || !d) { R.a_opts[k] = 'NO'; return; }
    const mias = Array.prototype.map.call(e.options, o => o.text);
    const suyas = Array.prototype.map.call(d.options, o => o.text);
    R.a_opts[k] = { n: mias.length, nDueno: suyas.length,
      primera: mias[0], coincide: JSON.stringify(mias.slice(1)) === JSON.stringify(suyas) ? 'SI' : 'NO: ' + JSON.stringify(mias.slice(1)) };
  });

  /* ── B · UN ESTUDIO VIEJO: SE LEE Y NO SE REESCRIBE ── */
  S('pop_cx_tipo', 'valvular');
  try { popSync() } catch (e) {}
  await new Promise(r => setTimeout(r, 140));
  R.b_her = CXK.filter(k => { const l = EL(k + '_lbl'); return l && l.classList.contains('pop-cx-her') }).join(',') || 'NINGUNA';
  R.b_checked = CXK.map(k => EL(k).checked ? 1 : 0).join('');
  R.b_leg = String((EL('pop_cx_legado') || {}).textContent || '');
  R.b_valvWrap = vis('pop_cx_valv_wrap');
  R.b_tipoCampo = EL('pop_cx_tipo').value;
  R.b_papel = linea('Tipo de cirugía');
  R.b_suma = (typeof popSumaLinea === 'function') ? popSumaLinea() : 'NO FN';
  /* combinada: no marca ninguna y lo dice */
  S('pop_cx_tipo', 'combinada'); try { popSync() } catch (e) {}
  await new Promise(r => setTimeout(r, 120));
  R.b_comb = { her: CXK.filter(k => EL(k + '_lbl').classList.contains('pop-cx-her')).join(',') || 'NINGUNA',
               leg: String((EL('pop_cx_legado') || {}).textContent || '').slice(0, 110),
               papel: linea('Tipo de cirugía') };

  /* ── C · LAS CASILLAS ESCRIBEN EL CAMPO VIEJO, GANA LA ULTIMA EDICION ── */
  S('pop_cx_tipo', '');
  M('pop_cx_cabg', 1);
  await new Promise(r => setTimeout(r, 120));
  R.c_una = { campo: EL('pop_cx_tipo').value, papel: linea('Tipo de cirugía'), her: CXK.filter(k => EL(k + '_lbl').classList.contains('pop-cx-her')).join(',') || 'NINGUNA' };
  M('pop_cx_valv', 1);
  await new Promise(r => setTimeout(r, 120));
  R.c_dos = { campo: EL('pop_cx_tipo').value, papel: linea('Tipo de cirugía'),
              suma: (typeof popSumaLinea === 'function') ? popSumaLinea() : 'NO FN',
              valvWrap: vis('pop_cx_valv_wrap') };
  M('pop_cx_aorta', 1);
  await new Promise(r => setTimeout(r, 120));
  R.c_tres = { campo: EL('pop_cx_tipo').value, papel: linea('Tipo de cirugía') };
  M('pop_cx_cabg', 0); M('pop_cx_valv', 0); M('pop_cx_aorta', 0);
  await new Promise(r => setTimeout(r, 120));
  R.c_cero = { campo: EL('pop_cx_tipo').value || '(vacio)', papel: linea('Tipo de cirugía') };

  /* ── D · VALVULAS: MARCAR SIN TIPO NO ESCRIBE NADA ── */
  M('pop_cx_valv', 1);
  await new Promise(r => setTimeout(r, 120));
  const antes = DUE.map(d => EL(d).value);
  M('pop_cx_v_ao', 1); M('pop_cx_v_mi', 1);
  await new Promise(r => setTimeout(r, 140));
  R.d_sinTipo = { duenosAntes: antes.join('|'), duenosDespues: DUE.map(d => EL(d).value).join('|'),
                  selAo: EL('pop-esp-vao').value || '(elegir tipo)',
                  tagAo: String((EL('pop-esp-vao-tag') || {}).textContent || '') || '(sin tag)',
                  papel: linea('Válvulas operadas') };
  /* elegir el tipo escribe el dueno */
  S('pop-esp-vao', 'Prótesis mecánica');
  await new Promise(r => setTimeout(r, 140));
  R.d_conTipo = { dueno: EL('va_morf').value, tag: String((EL('pop-esp-vao-tag') || {}).textContent || ''),
                  papel: linea('Válvulas operadas') };
  /* y al revés: el dueno mueve el espejo y pone la etiqueta */
  S('vm_morf', 'Prótesis biológica');
  try { popSync() } catch (e) {}
  await new Promise(r => setTimeout(r, 140));
  R.d_vuelta = { espejo: EL('pop-esp-vmi').value, tag: String((EL('pop-esp-vmi-tag') || {}).textContent || ''),
                 papel: linea('Válvulas operadas') };

  /* ── E · DRENAJES EN UNA FILA ── */
  const ys = DK.map(k => { const c = cx(k + '_lbl'); return c ? c.y : null });
  R.e_fila = { ys: ys.join(','), misma: ys.every(y => y !== null && Math.abs(y - ys[0]) <= 2) ? 'SI' : 'no' };
  M('pop_dren_pd', 1); M('pop_dren_med', 1);
  await new Promise(r => setTimeout(r, 140));
  R.e_papel = linea('Drenajes');
  R.e_suma = (typeof popSumaLinea === 'function') ? popSumaLinea() : 'NO FN';
  M('pop_dren_pd', 0); M('pop_dren_med', 0);
  await new Promise(r => setTimeout(r, 120));
  R.e_papelVacio = linea('Drenajes');

  /* ── F · CONTROLES DE PANTALLA ── */
  const recs = [];
  const sec = document.querySelector('[data-pop="pop-ctx"]');
  if (sec) Array.prototype.forEach.call(sec.querySelectorAll('label,span,div'), e => {
    if (e.children.length) return;
    if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0)
      recs.push(String(e.textContent || '').trim().slice(0, 26)); });
  R.f_recortados = recs.length ? recs.join(' | ') : 'NINGUNO';
  R.f_scrollX = document.documentElement.scrollWidth > document.documentElement.clientWidth ? 'SI (mal)' : 'no';
  R.f_ctxCaja = cx('pop_cx_legado') ? JSON.stringify(cx('pop_cx_legado')) : 'NO';
  return R;
})()`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  for (const W of ANCHOS) {
    const pg = await b.newPage({ viewport: { width: W, height: 900 } });
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE ' + e.message));
    pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text()) });
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(1500);
    await pg.evaluate(ABRIR);
    let r;
    try { r = await pg.evaluate(MEDIR) } catch (e) { r = { FATAL: e.message } }
    console.log('\n===== ' + W + ' px =====');
    Object.keys(r).forEach(k => console.log('  ' + k.padEnd(16) + ' ' + JSON.stringify(r[k])));
    console.log('  errores          ' + errs.length + (errs.length ? ' => ' + errs.slice(0, 3).join(' ;; ') : ''));
    await pg.close();
  }
  await b.close();
};
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) });
