#!/usr/bin/env node
/**
 * _probe_pa_c3.mjs - asistencia, monitoreo y datos hemodinamicos (POP-A-3).
 *
 * Mide, en los cuatro anchos: si el dispositivo de asistencia y su opcion comparten FILA
 * -misma `y`-, el reparto en columnas del Swan y del PiCCO -cuantas `x` distintas tiene cada
 * bloque y en que orden-, la linea de «sin monitoreo», y los campos de datos hemodinamicos con
 * su compuerta por dispositivo. Reporta tambien si algun rotulo queda RECORTADO.
 *
 *   node scripts/_probe_pa_c3.mjs [--file <html>] [--ancho 1440]
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
  const S = (id, val) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = val;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const cj = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  /* OJO: offsetParent distinto de null Y NADA MAS. Con el display del PROPIO nodo, un input
     dentro de un envoltorio oculto sale visible -su display es block- y la compuerta parece
     no funcionar. Costo una medicion. */
  const vis = id => { const e = EL(id); return !!e && e.offsetParent !== null };
  /* un rotulo recortado: el contenido mide mas que la caja */
  const rec = el => !!el && (el.scrollWidth > el.clientWidth + 1);
  const recId = id => { const e = EL(id); return e ? rec(e) : null };

  /* ── A · ASISTENCIA: dispositivo y su opcion en la MISMA fila ── */
  const fila = ks => { const ys = ks.map(k => { const c = cj(EL(k)); return c ? c.y : null })
    .filter(y => y !== null); return ys.length > 1 && ys.every(y => Math.abs(y - ys[0]) <= 2) };
  R.a = {};
  [['bcia', 'pop_bcia_wrap'], ['impella', 'pop_impella_wrap'], ['ecmo_va', 'pop_ecmo_wrap']].forEach(p => {
    S('pop_asist_tipo', p[0]);
    const t = cj(EL('pop_asist_tipo').parentNode), o = cj(EL(p[1]));
    R.a[p[0]] = { tipoY: t ? t.y : null, opcY: o ? o.y : null, opcW: o ? o.w : null,
                  mismaFila: (t && o && Math.abs(t.y - o.y) <= 2) ? 'SI' : 'no',
                  timingVis: p[0] === 'bcia' ? vis('pop-bcia-timing-wrap') : null };
  });
  S('pop_asist_tipo', '');

  /* ── B · MONITOREO: sin dispositivo ── */
  S('pop_monitor', '');
  R.b_vacio = { vis: vis('pop_mon_vacio'), txt: String((EL('pop_mon_vacio') || {}).textContent || '').slice(0, 90),
                sw: vis('pop_sw_wrap'), picco: vis('pop_picco_wrap'), pai: vis('pop_pai_wrap') };
  S('pop_monitor', 'ninguno');
  R.b_ninguno = { vis: vis('pop_mon_vacio'), sw: vis('pop_sw_wrap') };

  /* ── C · SWAN EN TRES COLUMNAS ── */
  S('pop_monitor', 'swan');
  await new Promise(r => setTimeout(r, 120));
  const SW = ['pop_sw_fc','pop_sw_gc','pop_sw_pam','pop_sw_pad','pop_sw_pcp','pop_sw_paps','pop_sw_papd'];
  const cols = {};
  SW.forEach(id => { const c = cj(EL(id)); if (!c) return; const k = String(c.x);
    (cols[k] = cols[k] || []).push(id.replace('pop_sw_','')) });
  const ordx = Object.keys(cols).map(Number).sort((a, b) => a - b);
  R.c_cols = ordx.length;
  R.c_reparto = ordx.map(x => cols[String(x)].join('+')).join(' | ');
  R.c_papm = { existe: !!EL('pop-sw-papm'), txt: String((EL('pop-sw-papm') || {}).textContent || ''),
               esInput: EL('pop-sw-papm') ? EL('pop-sw-papm').tagName : 'NO' };
  S('pop_sw_paps', '45'); S('pop_sw_papd', '21');
  await new Promise(r => setTimeout(r, 120));
  R.c_papmCalc = String((EL('pop-sw-papm') || {}).textContent || '');
  R.c_rotulos = {};
  SW.forEach(id => { const l = document.querySelector('label[for="' + id + '"]');
    R.c_rotulos[id.replace('pop_sw_','')] = l ? { txt: String(l.textContent || '').trim(), rec: rec(l), w: Math.round(l.getBoundingClientRect().width) } : null });

  /* ── D · PiCCO EN DOS COLUMNAS ── */
  S('pop_monitor', 'picco');
  await new Promise(r => setTimeout(r, 120));
  const PC = ['pop_picco_gc','pop_picco_ic','pop_picco_itbvi','pop_picco_evlwi','pop_picco_svri'];
  const colp = {};
  PC.forEach(id => { const c = cj(EL(id)); if (!c) return; const k = String(c.x);
    (colp[k] = colp[k] || []).push(id.replace('pop_picco_','')) });
  const ordp = Object.keys(colp).map(Number).sort((a, b) => a - b);
  R.d_cols = ordp.length;
  R.d_reparto = ordp.map(x => colp[String(x)].join('+')).join(' | ');

  /* ── E · DATOS HEMODINAMICOS ── */
  const DH = ['pop-esp-fc','pop-esp-pas','pop-esp-pam','pop-esp-pad','pop_relleno_cap','pop_lactato','pop_diuresis'];
  R.e_existen = DH.map(id => (EL(id) ? 1 : 0)).join('');
  S('pop_monitor', '');
  await new Promise(r => setTimeout(r, 120));
  R.e_sinMon = DH.filter(id => vis(id)).join(',') || 'NINGUNO';
  S('pop_monitor', 'swan');
  await new Promise(r => setTimeout(r, 120));
  R.e_swan = DH.filter(id => vis(id)).join(',') || 'NINGUNO';
  S('pop_monitor', 'picco');
  await new Promise(r => setTimeout(r, 120));
  R.e_picco = DH.filter(id => vis(id)).join(',') || 'NINGUNO';
  S('pop_monitor', 'pai');
  await new Promise(r => setTimeout(r, 120));
  R.e_pai = DH.filter(id => vis(id)).join(',') || 'NINGUNO';

  /* ── F · UN DATO, DOS PUERTAS ── */
  S('pop_monitor', '');
  await new Promise(r => setTimeout(r, 120));
  const par = [['pop-esp-fc','hemo_fc'], ['pop-esp-pas','ao_pas'], ['pop-esp-pam','hemo_pam'], ['pop-esp-pad','ao_pad']];
  R.f = {};
  for (const p of par) {
    if (!EL(p[0]) || !EL(p[1])) { R.f[p[0]] = 'NO EXISTE'; continue }
    S(p[0], '77');
    await new Promise(r => setTimeout(r, 60));
    const ida = EL(p[1]).value;
    S(p[1], '88');
    try { if (typeof _espejosBarrerTodos === 'function') _espejosBarrerTodos(); } catch (e) {}
    await new Promise(r => setTimeout(r, 60));
    const vuelta = EL(p[0]).value;
    S(p[0], '');
    await new Promise(r => setTimeout(r, 60));
    const borra = EL(p[1]).value;
    R.f[p[0]] = { dueno: p[1], idaDueno: ida, vueltaEspejo: vuelta, borradoDueno: borra || '(vacio)',
                  esDelEstudio: !!(window._noEsDelEstudio ? !_noEsDelEstudio(p[0]) : null) };
    S(p[1], '');
  }
  /* ── G · relleno capilar y diuresis en el PAPEL, y NO en el patron ── */
  S('pop_relleno_cap', '4'); S('pop_diuresis', '20'); S('pop_lactato', '3');
  S('pop_sw_gc', '3.2'); S('pop_sw_pam', '70'); S('pop_monitor', 'swan');
  await new Promise(r => setTimeout(r, 160));
  R.g_texto = (typeof amiloTextoPOP === 'function')
    ? String(amiloTextoPOP()).split(String.fromCharCode(10)).filter(l => /Relleno|Diuresis|Lactato/.test(l)).join(' ;; ') : 'NO FN';
  R.g_patron = (typeof popPatron === 'function')
    ? JSON.stringify(popPatron().preguntas.map(q => q.cls + ':' + String(q.txt || '').slice(0, 34))) : 'NO FN';
  /* ── H · ni un rotulo recortado en la tarjeta de monitoreo ni en la de datos ── */
  const recs = [];
  ['pop-mon','pop-hemo','pop-asist'].forEach(k => {
    const sec = document.querySelector('[data-pop="' + k + '"]'); if (!sec) return;
    Array.prototype.forEach.call(sec.querySelectorAll('label,span,div'), e => {
      if (e.children.length) return;
      if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0)
        recs.push(k + ':' + String(e.textContent || '').trim().slice(0, 26));
    });
  });
  R.h_recortados = recs.length ? recs.join(' | ') : 'NINGUNO';
  R.h_scrollX = document.documentElement.scrollWidth > document.documentElement.clientWidth ? 'SI (mal)' : 'no';
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
