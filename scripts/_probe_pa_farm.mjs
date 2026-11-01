#!/usr/bin/env node
/**
 * _probe_pa_farm.mjs - el selector unico de farmacos y el azul de metileno (POP-A-2).
 *
 * DENOMINADORES declarados: las once casillas con su id exacto, el menu cerrado al arrancar, y
 * la posicion de las tres tarjetas vecinas ANTES de abrirlo -sin esa foto previa, «no se movio
 * nada» no se distingue de «la sonda no mira nada»-.
 * CONTROLES NEGATIVOS: los diez farmacos de siempre siguen publicando mcg/kg/min, y un estudio
 * sin azul no cambia una letra del papel.
 *
 *   node scripts/_probe_pa_farm.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

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
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  const kaja = k => caja(document.querySelector('[data-pop="' + k + '"]'));
  const KEYS = ['nor','adr','dob','dop','mil','levo','vaso','ter','azul','ntg','ntp'];

  /* ── D0 · DENOMINADOR: las once casillas existen con su id exacto ── */
  R.d0_chks = KEYS.map(k => (EL('pop_' + k + '_activa') ? 1 : 0)).join('');
  R.d0_wraps = KEYS.map(k => (EL('pop_' + k + '_wrap') ? 1 : 0)).join('');
  R.d0_dosis = KEYS.map(k => (EL('pop_' + k + '_dosis') ? 1 : 0)).join('');
  /* ── D1 · el menu nace CERRADO ── */
  R.d1_menu = getComputedStyle(EL('pop_farm_menu')).display;
  R.d1_aria = EL('pop_farm_btn').getAttribute('aria-expanded');
  R.d1_btnCaja = caja(EL('pop_farm_btn'));
  /* ── D2 · el ORDEN del menu y sus tres separadores ── */
  R.d2_orden = Array.prototype.map.call(EL('pop_farm_menu').children, n =>
    n.className.indexOf('pop-farm-sep') >= 0 ? '|' :
    ((n.querySelector('input[type=checkbox]') || {}).id || '?').replace('pop_','').replace('_activa','')
  ).join(',');
  R.d2_seps = EL('pop_farm_menu').querySelectorAll('.pop-farm-sep').length;
  R.d2_nombres = Array.prototype.map.call(EL('pop_farm_menu').querySelectorAll('.pop-droga-chk'),
    l => String(l.textContent || '').trim()).join(' / ');

  /* ── A · ABRIR EL MENU NO MUEVE NADA ── foto antes y despues ── */
  const antes = { hemo: kaja('pop-hemo'), asist: kaja('pop-asist'), pocus: kaja('pop-pocus'),
                  filas: caja(EL('pop_farm_rows')), cuerpoH: document.body.scrollHeight };
  EL('pop_farm_btn').click();
  await new Promise(r => setTimeout(r, 160));
  const desp = { hemo: kaja('pop-hemo'), asist: kaja('pop-asist'), pocus: kaja('pop-pocus'),
                 filas: caja(EL('pop_farm_rows')), cuerpoH: document.body.scrollHeight };
  R.a_abierto = getComputedStyle(EL('pop_farm_menu')).display;
  R.a_aria = EL('pop_farm_btn').getAttribute('aria-expanded');
  R.a_pos = getComputedStyle(EL('pop_farm_menu')).position;
  R.a_z = getComputedStyle(EL('pop_farm_menu')).zIndex;
  R.a_scroll = EL('pop_farm_menu').scrollHeight > EL('pop_farm_menu').clientHeight ? 'con barra' : 'sin barra';
  R.a_menuCaja = caja(EL('pop_farm_menu'));
  R.a_movio = ['hemo','asist','pocus','filas'].filter(k =>
    !antes[k] || !desp[k] || antes[k].x !== desp[k].x || antes[k].y !== desp[k].y).join(',') || 'NINGUNA';
  R.a_cuerpo = antes.cuerpoH + ' -> ' + desp.cuerpoH;
  /* el menu TAPA lo de abajo: su caja se superpone con la tarjeta de datos hemodinamicos */
  R.a_tapa = (desp.hemo && R.a_menuCaja && R.a_menuCaja.y + R.a_menuCaja.h > desp.hemo.y) ? 'si' : 'no';

  /* ── B · Esc cierra ── */
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await new Promise(r => setTimeout(r, 80));
  R.b_esc = getComputedStyle(EL('pop_farm_menu')).display;
  /* ── C · tocar afuera cierra ── */
  EL('pop_farm_btn').click();
  await new Promise(r => setTimeout(r, 80));
  R.c_antes = getComputedStyle(EL('pop_farm_menu')).display;
  document.querySelector('[data-pop="pop-pocus"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 80));
  R.c_afuera = getComputedStyle(EL('pop_farm_menu')).display;

  /* ── D · UNA FILA POR FARMACO MARCADO ── */
  R.d_filasVisibles0 = KEYS.filter(k => EL('pop_' + k + '_fila') &&
    getComputedStyle(EL('pop_' + k + '_fila')).display !== 'none').join(',') || 'NINGUNA';
  const marcar = (k, on) => { const c = EL('pop_' + k + '_activa'); c.checked = !!on;
    c.dispatchEvent(new Event('change', { bubbles: true })) };
  marcar('nor', 1); marcar('azul', 1);
  await new Promise(r => setTimeout(r, 120));
  R.d_filasVisibles = KEYS.filter(k => EL('pop_' + k + '_fila') &&
    getComputedStyle(EL('pop_' + k + '_fila')).display !== 'none').join(',');
  R.d_xCaja = caja(EL('pop_azul_fila').querySelector('.pop-droga-x'));
  /* los cinco puntos del area tactil de la ✕ */
  (function () {
    const b2 = EL('pop_azul_fila').querySelector('.pop-droga-x');
    b2.scrollIntoView({ block: 'center' });
    const r = b2.getBoundingClientRect(), d = 2;
    const pts = [[r.left + d, r.top + d], [r.right - d, r.top + d], [r.left + d, r.bottom - d],
                 [r.right - d, r.bottom - d], [r.left + r.width / 2, r.top + r.height / 2]];
    R.d_xPuntos = pts.map(p => { const e = document.elementFromPoint(p[0], p[1]);
      return e === b2 ? 1 : (e && b2.contains(e) ? 1 : 0) }).join('');
  })();

  /* ── E · EL AZUL DE METILENO: dosis sin unidad, y la linea de la dilucion no la inventa ── */
  const S = (id, val) => { const e = EL(id); e.value = val;
    e.dispatchEvent(new Event('input', { bubbles: true })) };
  S('pop_azul_dosis', '1.5'); S('pop_nor_dosis', '0.25');
  await new Promise(r => setTimeout(r, 120));
  R.e_azulCalc = String((EL('pop_azul_calc') || {}).textContent || '');
  R.e_azulPh = EL('pop_azul_dosis').getAttribute('placeholder');
  R.e_azulAria = EL('pop_azul_dosis').getAttribute('aria-label');
  R.e_unidAzul = (typeof popDosisUnid === 'function') ? JSON.stringify(popDosisUnid('azul')) : 'NO FN';
  R.e_unidNor = (typeof popDosisUnid === 'function') ? JSON.stringify(popDosisUnid('nor')) : 'NO FN';
  R.e_enPeso = (window.POP_DROGAS_PESO || []).indexOf('azul') >= 0 ? 'SI (mal)' : 'no';
  R.e_enPatron = (window.POP_DROGAS_PATRON || []).indexOf('azul') >= 0 ? 'SI (mal)' : 'no';
  /* con la dilucion cargada, la linea NO publica mcg/kg/min */
  S('pop_azul_diluc_mg', '50'); S('pop_azul_diluc_ml', '50'); S('pop_azul_veloc', '10');
  await new Promise(r => setTimeout(r, 120));
  R.e_azulCalc2 = String((EL('pop_azul_calc') || {}).textContent || '');
  R.e_azulDosisTrasDiluc = EL('pop_azul_dosis').value;
  R.e_norCalc = String((EL('pop_nor_calc') || {}).textContent || '');

  /* ── F · EL PAPEL ── */
  try { const i = EL('pop_integrar'); if (i) { i.disabled = false; i.click() } } catch (e) {}
  R.f_texto = (typeof amiloTextoPOP === 'function') ? String(amiloTextoPOP()).split(String.fromCharCode(10)).filter(l => l.indexOf('Vasoactivos') === 0).join(' ') : 'NO FN';
  R.f_patronDrogas = (typeof popEsquema === 'function') ? JSON.stringify(popEsquema().drogas) : 'NO FN';
  R.f_haySoporte = (typeof popPatron === 'function') ? String(popPatron().haySoporte) : 'NO FN';

  /* ── G · LA ✕ BORRA TODO ── */
  EL('pop_azul_fila').querySelector('.pop-droga-x').click();
  await new Promise(r => setTimeout(r, 140));
  R.g_chk = EL('pop_azul_activa').checked ? 'SIGUE MARCADA (mal)' : 'desmarcada';
  R.g_fila = getComputedStyle(EL('pop_azul_fila')).display;
  R.g_valores = ['_dosis','_diluc_mg','_diluc_ml','_veloc'].map(sfx =>
    EL('pop_azul' + sfx).value).join('|') || '(vacio)';
  R.g_calc = String((EL('pop_azul_calc') || {}).textContent || '');
  R.g_texto = (typeof amiloTextoPOP === 'function') ? String(amiloTextoPOP()).split(String.fromCharCode(10)).filter(l => l.indexOf('Vasoactivos') === 0).join(' ') : 'NO FN';
  /* ── H · DESMARCAR LA CASILLA HACE LO MISMO ── */
  marcar('azul', 1); await new Promise(r => setTimeout(r, 100));
  S('pop_azul_dosis', '2'); await new Promise(r => setTimeout(r, 100));
  R.h_antes = EL('pop_azul_dosis').value;
  marcar('azul', 0); await new Promise(r => setTimeout(r, 140));
  R.h_despues = EL('pop_azul_dosis').value || '(vacio)';
  return R;
})()`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text()) });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1500);
  console.log('seccion: ' + await pg.evaluate(ABRIR));
  let r;
  try { r = await pg.evaluate(MEDIR) } catch (e) { r = { FATAL: e.message } }
  Object.keys(r).forEach(k => console.log('  ' + k.padEnd(22) + ' ' + JSON.stringify(r[k])));
  console.log('errores de consola/pagina: ' + errs.length + (errs.length ? ' => ' + errs.slice(0, 5).join(' ;; ') : ''));
  await pg.close(); await b.close();
};
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) });
