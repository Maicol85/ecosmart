#!/usr/bin/env node
/**
 * _probe_pa_c5.mjs - la tarjeta «Eco y POCUS» (POP-A-5).
 *
 * Mide: el titulo, que el recuadro gris del eco este DENTRO de esta tarjeta y no en la de datos
 * hemodinamicos, la distancia entre el rotulo de la conclusion del VD y su valor -que es lo que
 * el pedido llama «no lejos a la derecha»-, las dos columnas de la grilla, y el campo de derrame
 * pericardico con su ida y vuelta al dueno.
 * CONTROL NEGATIVO: los seis selectores de pleura y pulmon conservan sus ids y sus opciones.
 *
 *   node scripts/_probe_pa_c5.mjs [--file <html>] [--ancho 1440]
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
  const sec = k => document.querySelector('[data-pop="' + k + '"]');
  const dentro = (id, k) => { const e = EL(id), s = sec(k); return !!(e && s && s.contains(e)) };

  /* ── D0 · DENOMINADOR ── */
  R.d0_titulo = String((sec('pop-pocus') || {}).textContent || '').trim().slice(0, 16);
  const SEL = ['pop_pleura_der','pop_pleura_izq','pop_pleura_caract',
               'pop_pulmon_lineasb','pop_pulmon_consol','pop_pulmon_neumo'];
  R.d0_selIds = SEL.map(i => EL(i) ? 1 : 0).join('');
  R.d0_selOpts = SEL.map(i => EL(i).options.length).join(',');
  R.d0_fuera = (typeof _noEsDelEstudio === 'function') ? (_noEsDelEstudio('pop-esp-peri') ? 'si' : 'NO (mal)') : 'NO FN';

  /* ── A · EL ECO ESTA EN ESTA TARJETA Y NO EN LA OTRA ── */
  R.a_eco = { enPocus: ['pop-eco-src','pop-eco-gc','pop-eco-ic'].map(i => dentro(i, 'pop-pocus') ? 1 : 0).join(''),
              enHemo: ['pop-eco-src','pop-eco-gc','pop-eco-ic'].map(i => dentro(i, 'pop-hemo') ? 1 : 0).join(''),
              concordEnHemo: dentro('pop-comp-wrap', 'pop-hemo') ? 'si' : 'no' };

  /* ── B · EL VD Y SU CONCLUSION: CUAN LEJOS QUEDA EL VALOR DEL ROTULO ── */
  S('tapse', '14'); S('vd_vi', '1.1'); S('pop_monitor', 'swan');
  S('pop_sw_gc', '3.2'); S('pop_sw_pam', '70');
  try { popSync() } catch (e) {}
  await new Promise(r => setTimeout(r, 200));
  R.b_vd = String((EL('pop-pocus-vd') || {}).textContent || '').replace(/\\s+/g, ' ').slice(0, 120);
  (function () {
    const box = EL('pop-pocus-vd'); if (!box) { R.b_hueco = 'NO BOX'; return }
    const fs = Array.prototype.filter.call(box.querySelectorAll('.calc-row'),
      f => /onclusi|Lectura|Disfunci/.test(String(f.textContent || '')));
    const f = fs[0] || box.querySelectorAll('.calc-row')[0];
    if (!f) { R.b_hueco = 'SIN FILAS (denominador vacio)'; return }
    const l = f.querySelector('.calc-lbl'), v = f.children[f.children.length - 1];
    if (!l || !v || l === v) { R.b_hueco = 'sin par rotulo/valor'; return }
    const rl = l.getBoundingClientRect(), rv = v.getBoundingClientRect();
    R.b_hueco = { rotulo: String(l.textContent || '').trim().slice(0, 28),
                  anchoCaja: Math.round(box.getBoundingClientRect().width),
                  huecoPx: Math.round(rv.left - rl.right) };
  })();

  /* ── C · LA GRILLA COMPACTA DE DOS COLUMNAS ── */
  const colsDe = ids => { const xs = {}; ids.forEach(i => { const e = EL(i); if (!e) return;
    xs[String(Math.round(e.getBoundingClientRect().left))] = 1 }); return Object.keys(xs).length };
  R.c_cols = { pleura: colsDe(['pop_pleura_der','pop_pleura_izq','pop_pleura_caract']),
               pulmon: colsDe(['pop_pulmon_lineasb','pop_pulmon_consol','pop_pulmon_neumo']),
               peri: colsDe(['pop-esp-peri']) };

  /* ── D · EL DERRAME PERICARDICO: IDA Y VUELTA AL DUENO ── */
  const due = EL('pericardio'), esp = EL('pop-esp-peri');
  R.d_opts = { espejo: esp ? Array.prototype.map.call(esp.options, o => o.text).join(' | ') : 'NO',
               dueno: due ? Array.prototype.map.call(due.options, o => o.text).join(' | ') : 'NO' };
  R.d_coincide = (esp && due && esp.options.length === due.options.length) ? 'SI' : 'NO';
  S('pop-esp-peri', 'Derrame moderado (10-20mm)');
  await new Promise(r => setTimeout(r, 160));
  R.d_ida = { dueno: due.value, caja: String((EL('pop-pocus-peri') || {}).textContent || '').replace(/\\s+/g, ' ').slice(0, 90) };
  S('pericardio', 'Derrame severo (>20mm)');
  try { popSync() } catch (e) {}
  await new Promise(r => setTimeout(r, 160));
  R.d_vuelta = { espejo: esp.value, caja: String((EL('pop-pocus-peri') || {}).textContent || '').replace(/\\s+/g, ' ').slice(0, 90) };
  S('pericardio', 'Normal, sin derrame');

  /* ── E · PANTALLA ── */
  const recs = [];
  const sp = sec('pop-pocus');
  if (sp) Array.prototype.forEach.call(sp.querySelectorAll('label,span,div'), e => {
    if (e.children.length) return;
    if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0)
      recs.push(String(e.textContent || '').trim().slice(0, 24)); });
  R.e_recortados = recs.length ? recs.join(' | ') : 'NINGUNO';
  R.e_scrollX = document.documentElement.scrollWidth > document.documentElement.clientWidth ? 'SI (mal)' : 'no';
  R.e_alto = sp ? Math.round(sp.getBoundingClientRect().height) : null;
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
    Object.keys(r).forEach(k => console.log('  ' + k.padEnd(14) + ' ' + JSON.stringify(r[k])));
    console.log('  errores        ' + errs.length + (errs.length ? ' => ' + errs.slice(0, 3).join(' ;; ') : ''));
    await pg.close();
  }
  await b.close();
};
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) });
