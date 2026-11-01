#!/usr/bin/env node
/**
 * _probe_popbwk.mjs - la sonda de DOS MOTORES de la tanda POP-B (2026-11-01).
 * Calcada de _probe_pawk.mjs, que ya trae la escena del posoperatorio y los tres invariantes.
 *
 * Chrome del sistema (channel: chrome) y WebKit de Playwright, por cuatro anchos y dos temas:
 * dieciseis cruces por motor. Mide lo que la tanda toca y los tres invariantes de la casa
 * -cero desplazamiento horizontal, cero texto recortado, cero errores de consola y de pagina-.
 *
 * Con --head <html> corre tambien el otro arbol y lo imprime al lado, que es el CONTROL: un
 * «cero errores» sin el no se distingue de «la sonda no mira nada».
 *
 *   node scripts/_probe_pawk.mjs [--file <html>] [--head <html>] [--motor chrome|webkit|dos]
 *
 * ADVERTENCIA 1: WebKit de Playwright NO es Safari, y se declara.
 * ADVERTENCIA 2: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const HEAD = arg('--head') || null;
const MOTOR = arg('--motor') || 'dos';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];

const ABRIR = `(async () => {
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = EL(id); if (!e) return; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })) };
  const M = (id) => { const c = EL(id); if (!c) return; c.checked = true;
    c.dispatchEvent(new Event('change', { bubbles: true })) };
  S('nombre', 'Prueba POPA'); S('ci', '900'); S('peso', '70'); S('talla', '170'); S('sexo', 'M');
  try { const b = bq('showTab(' + Q + 'hemodinamica'); if (b) b.click() } catch (e) {}
  await new Promise(r => setTimeout(r, 300));
  const s = EL('pop-seccion');
  if (s && getComputedStyle(s).display === 'none') {
    const c = bq('toggleCard(' + Q + 'pop-seccion'); if (c) c.click();
  }
  await new Promise(r => setTimeout(r, 320));
  /* LA ESCENA: lo que la tanda toca, cargado. Sin esto el POCUS, el dibujo y la conclusion
     salen vacios y medir una maqueta sobre cajas de cero no prueba nada. */
  S('pop_monitor', 'swan'); S('pop_sw_gc', '3.2'); S('pop_sw_fc', '96'); S('pop_sw_pam', '68');
  S('pop_sw_pad', '14'); S('pop_sw_pcp', '22'); S('pop_sw_paps', '48'); S('pop_sw_papd', '22');
  S('pop_lactato', '3.4'); S('pop_cx_horas', '6'); S('tapse', '14'); S('vd_vi', '1.1');
  S('pop_pleura_der', 'moderado'); S('pop_pulmon_lineasb', 'difusas');
  S('pop_asist_tipo', 'bcia'); S('pop_bcia_ratio', '1:1');
  S('pop_relleno_cap', '4'); S('pop_diuresis', '20');
  M('pop_nor_activa'); S('pop_nor_dosis', '0.25');
  M('pop_azul_activa'); S('pop_azul_dosis', '1.5');
  M('pop_cx_cabg'); M('pop_cx_valv'); M('pop_cx_v_ao');
  M('pop_dren_pd'); M('pop_dren_med');
  S('va_morf', 'Prótesis mecánica');
  /* POP-B: la aorta con injerto, el drenaje izquierdo, los dos derrames pleurales y dos
     valvulas mas -una biologica y una SIN tipo-, que es la escena mas cargada del dibujo. */
  M('pop_cx_aorta'); M('pop_dren_pi'); M('pop_cx_v_mi'); M('pop_cx_v_tr');
  S('vm_morf', 'Prótesis biológica');
  S('pop_pleura_izq', 'severo'); S('pop_pleura_caract', 'libre');
  try { popSync() } catch (e) {}
  try { if (typeof popEsqParar === 'function') popEsqParar() } catch (e) {}
  await new Promise(r => setTimeout(r, 420));
  return s ? getComputedStyle(s).display : 'NO SEC';
})()`;

const MEDIR = `(() => {
  const R = {};
  const EL = id => document.getElementById(id);
  const sec = k => document.querySelector('[data-pop="' + k + '"]');
  const cj = e => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  /* ── los tres invariantes de la casa ── */
  R.scrollX = document.documentElement.scrollWidth > document.documentElement.clientWidth ? 'SI' : 'no';
  const rec = [];
  Array.prototype.forEach.call(document.querySelectorAll('#pop-seccion label, #pop-seccion span, #pop-seccion div'), e => {
    if (e.children.length) return;
    if (e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1)
      rec.push(String(e.textContent || '').trim().slice(0, 22));
  });
  R.recortados = rec.length ? rec.join(' | ') : 'NINGUNO';
  R.pestanas = Array.prototype.filter.call(document.querySelectorAll('.tab-btn'),
    b => b.getBoundingClientRect().width > 0).length + '/' + document.querySelectorAll('.tab-btn').length;
  /* ══ LO QUE POP-B TOCA ═══════════════════════════════════════════════════════════════════
     La tarjeta nueva, el par eco/VD, las cuatro capas del dibujo, las cuatro valvulas y el
     cruce de TODOS los textos del SVG. */
  const pp = sec('pop-pleupul');
  R.pleupul = pp ? (pp.classList.contains('pop-card-wide') ? 'wide' : 'estrecha') : 'NO EXISTE';
  R.pleupulFuera = pp ? (pp.closest('.pop-cols') ? 'DENTRO' : 'afuera') : '-';
  R.pleupulCols = pp && pp.querySelector('.pop-pleupul-grid')
    ? getComputedStyle(pp.querySelector('.pop-pleupul-grid')).gridTemplateColumns.split(' ').length : '-';
  const par = document.querySelector('.pop-eco-par');
  R.ecoParCols = par ? getComputedStyle(par).gridTemplateColumns.split(' ').length : 'NO EXISTE';
  R.ecoParMismo = (function () {
    const a = EL('pop-eco-ic'), b = EL('pop-pocus-vd');
    if (!a || !b || !a.closest) return '-';
    const x = a.closest('.pop-eco-par'), y = b.closest('.pop-eco-par');
    return (x && y && x === y) ? 'si' : 'NO';
  })();
  const svg = EL('pop-esq-svg');
  const dib = k => { if (!svg) return '-'; const n = svg.querySelector('[data-pop-esq="' + k + '"]');
    return !n ? 'NO' : (getComputedStyle(n).display === 'none' ? 'off' : 'on') };
  R.capas = ['puente','malla','drenD','drenI','drenM'].map(dib).join(',');
  R.valvs = ['valv-ao','valv-mi','valv-tr','valv-pu'].map(dib).join(',');
  R.plD = (function () { if (!svg) return '-'; const n = svg.querySelector('[data-pop-esq="pleuraD"]');
    return n ? n.getAttribute('height') : 'NO' })();
  R.plI = (function () { if (!svg) return '-'; const n = svg.querySelector('[data-pop-esq="pleuraI"]');
    return n ? n.getAttribute('height') : 'NO' })();
  R.svgTxtSup = (function () {
    if (!svg) return '-';
    const c = [];
    Array.prototype.forEach.call(svg.querySelectorAll('text'), t => {
      if (getComputedStyle(t).display === 'none') return;
      const q = String(t.textContent || '').trim(); if (!q) return;
      let b = null; try { b = t.getBBox() } catch (e) { return }
      if (!b || b.width <= 0) return;
      c.push({ t: q, x: b.x, y: b.y, w: b.width, h: b.height });
    });
    const s2 = [];
    for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) {
      const a = c[i], b = c[j];
      if (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 0 &&
          Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 0) s2.push(a.t + ' x ' + b.t);
    }
    R.svgTxtN = c.length;
    R.svgFuera = c.filter(t => t.x < 0 || (t.x + t.w) > 600 || t.y < 0 || (t.y + t.h) > 496)
                  .map(t => t.t).join(' | ') || 'NINGUNO';
    return s2.length ? s2.join(' ; ') : 'NINGUNA';
  })();
  R.papel = (function () { try { const ls = String(amiloTextoPOP()).split(String.fromCharCode(10));
    for (let i = 0; i < ls.length; i++) if (ls[i].indexOf('V') === 0 && ls[i].indexOf('lvulas operadas') > 0) return ls[i];
    return '-' } catch (e) { return 'ERR' } })();
  /* ── la maqueta de esta tanda ── */
  R.orden = Array.prototype.map.call(document.querySelectorAll('#pop-seccion [data-pop]'),
    e => e.getAttribute('data-pop')).join(',');
  const c1 = cj(sec('pop-ctx')), c2 = cj(sec('pop-farm')), c3 = cj(sec('pop-asist'));
  R.tresCols = (c1 && c2 && c3 && Math.abs(c1.y - c2.y) <= 2 && Math.abs(c2.y - c3.y) <= 2
                && c2.x > c1.x && c3.x > c2.x) ? 'lado a lado' : 'apilado';
  const e1 = cj(sec('pop-esq')), e2 = cj(sec('pop-carac')), e3 = cj(sec('pop-concl'));
  R.abajo = (e1 && e2 && Math.abs(e1.y - e2.y) <= 2 && e2.x > e1.x) ? 'lado a lado' : 'apilado';
  R.conclDebajo = (e2 && e3 && e3.y > e2.y) ? 'si' : 'no';
  R.dibujo = (function () { const w = document.querySelector('.pop-esq-wrap'); const c = cj(w);
    return c ? c.w + 'x' + c.h : 'NO' })();
  R.svgNodos = EL('pop-esq-svg') ? EL('pop-esq-svg').querySelectorAll('*').length : 0;
  /* ── el selector de farmacos ── */
  R.menuCerrado = EL('pop_farm_menu') ? getComputedStyle(EL('pop_farm_menu')).display : 'NO';
  R.btnFarm = (function () { const c = cj(EL('pop_farm_btn')); return c ? c.w + 'x' + c.h : 'NO' })();
  R.filasFarm = ['nor','azul'].filter(k => EL('pop_' + k + '_fila')
    && EL('pop_' + k + '_fila').offsetParent !== null).join(',') || 'NINGUNA';
  R.equis = (function () { const b = EL('pop_azul_fila') ? EL('pop_azul_fila').querySelector('.pop-droga-x') : null;
    const c = cj(b); return c ? c.w + 'x' + c.h : 'NO' })();
  R.equisPuntos = (function () {
    const b = EL('pop_azul_fila') ? EL('pop_azul_fila').querySelector('.pop-droga-x') : null;
    if (!b) return 'NO';
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect(), d = 2;
    const pts = [[r.left + d, r.top + d], [r.right - d, r.top + d], [r.left + d, r.bottom - d],
                 [r.right - d, r.bottom - d], [r.left + r.width / 2, r.top + r.height / 2]];
    return pts.map(p => { const e = document.elementFromPoint(p[0], p[1]);
      return (e === b || (e && b.contains(e))) ? 1 : 0 }).join('');
  })();
  /* ── el monitoreo y los datos hemodinamicos ── */
  R.swanCols = document.querySelectorAll('#pop_sw_wrap .pop-mon-3 > .pop-mon-c').length;
  R.papm = EL('pop-sw-papm') ? String(EL('pop-sw-papm').textContent || '') : 'NO';
  R.dhVis = ['pop-esp-fc','pop-esp-pas','pop-esp-pam','pop-esp-pad','pop_relleno_cap','pop_lactato','pop_diuresis']
    .filter(i => EL(i) && EL(i).offsetParent !== null).length;
  /* ── el contexto quirurgico ── */
  R.cxTipo = EL('pop_cx_tipo') ? String(EL('pop_cx_tipo').value || '') : 'NO';
  R.valvWrap = EL('pop_cx_valv_wrap') && EL('pop_cx_valv_wrap').offsetParent !== null ? 'abierto' : 'cerrado';
  R.tagAo = EL('pop-esp-vao-tag') ? String(EL('pop-esp-vao-tag').textContent || '') : 'NO';
  R.drenFila = (function () { const f = document.querySelector('.pop-dren-fila');
    if (!f) return 'NO';
    const ys = Array.prototype.map.call(f.querySelectorAll('.pop-cx-chk'),
      e => Math.round(e.getBoundingClientRect().top));
    return (ys.length === 3 && ys.every(y => Math.abs(y - ys[0]) <= 2)) ? 'una fila' : 'y=' + ys.join(','); })();
  /* ── eco y POCUS ── */
  R.ecoEnPocus = ['pop-eco-src','pop-eco-gc','pop-eco-ic']
    .map(i => (EL(i) && sec('pop-pocus') && sec('pop-pocus').contains(EL(i))) ? 1 : 0).join('');
  R.periOpts = EL('pop-esp-peri') ? EL('pop-esp-peri').options.length : 0;
  /* ── el papel ── */
  R.papel = (function () { try {
    const ls = String(amiloTextoPOP()).split(String.fromCharCode(10));
    const g = p => { for (let i = 0; i < ls.length; i++) if (ls[i].indexOf(p) === 0) return ls[i]; return '-' };
    return [g('Tipo de cirugía'), g('Válvulas operadas'), g('Drenajes'), g('Vasoactivos')].join(' ;; ');
  } catch (e) { return 'ERR ' + e.message } })();
  R.suma = (function () { try { return popSumaLinea() || '(vacio)' } catch (e) { return 'ERR' } })();
  return R;
})()`;

const CLAVES = ['scrollX','recortados','pestanas','orden','tresCols','abajo','conclDebajo','dibujo',
  'svgNodos','menuCerrado','btnFarm','filasFarm','equis','equisPuntos','swanCols','papm','dhVis',
  'cxTipo','valvWrap','tagAo','drenFila','ecoEnPocus','periOpts','papel','suma',
  /* POP-B */
  'pleupul','pleupulFuera','pleupulCols','ecoParCols','ecoParMismo',
  'capas','valvs','plD','plI','svgTxtN','svgTxtSup','svgFuera'];

const medir = async (br, file, W, tema) => {
  const ctx = await br.newContext({ viewport: { width: W, height: 900 }, colorScheme: tema });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text()) });
  await pg.goto('file://' + file);
  await pg.waitForTimeout(1600);
  let r = {};
  try { await pg.evaluate(ABRIR); r = await pg.evaluate(MEDIR); }
  catch (e) { r = { FATAL: e.message } }
  await ctx.close();
  return { r, errs: errs.filter(x => x.indexOf('ERR_FILE_NOT_FOUND') < 0) };
};

const run = async () => {
  const motores = MOTOR === 'dos' ? ['chrome', 'webkit'] : [MOTOR];
  const todo = {};
  for (const m of motores) {
    const br = m === 'chrome' ? await _pw.chromium.launch({ channel: 'chrome' })
                              : await _pw.webkit.launch();
    for (const W of ANCHOS) for (const t of TEMAS) {
      const k = m + ' ' + W + ' ' + t;
      const a = await medir(br, FILE, W, t);
      todo[k] = a;
      console.log('\n===== ' + k + ' =====');
      CLAVES.forEach(c => console.log('  ' + c.padEnd(13) + ' ' + JSON.stringify(a.r[c])));
      console.log('  errores       ' + a.errs.length + (a.errs.length ? ' => ' + a.errs.slice(0, 3).join(' ;; ') : ''));
      if (HEAD) {
        const h = await medir(br, HEAD, W, t);
        console.log('  -- HEAD: errores ' + h.errs.length + ' | scrollX ' + h.r.scrollX
          + ' | recortados ' + JSON.stringify(h.r.recortados).slice(0, 70)
          + ' | pestanas ' + h.r.pestanas + ' | svgNodos ' + h.r.svgNodos);
      }
    }
    await br.close();
  }
  /* coincidencia entre motores, clave por clave */
  if (motores.length === 2) {
    console.log('\n===== CHROME CONTRA WEBKIT =====');
    for (const W of ANCHOS) for (const t of TEMAS) {
      const a = todo['chrome ' + W + ' ' + t].r, b = todo['webkit ' + W + ' ' + t].r;
      const dif = CLAVES.filter(c => JSON.stringify(a[c]) !== JSON.stringify(b[c]));
      console.log('  ' + W + ' ' + t.padEnd(6) + ' ' + (dif.length ? 'DIFIEREN: ' + dif.map(c =>
        c + ' (' + JSON.stringify(a[c]) + ' / ' + JSON.stringify(b[c]) + ')').join(' · ').slice(0, 220) : 'coinciden en las ' + CLAVES.length));
    }
  }
};
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) });
