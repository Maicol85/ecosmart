#!/usr/bin/env node
/**
 * _probe_marfan1inv.mjs - INVENTARIO de la tanda MARFAN-1 (punto 1a) y linea base del A/B.
 *
 * Mide, SOLO LEYENDO: (1) los campos de la seccion de Marfan con su id y su caja; (2) la
 * tarjeta de criterios -como se abre, que controles tiene, si alguno lleva id y por tanto se
 * guarda, y su ESPACIO VACIO en los cuatro anchos-; (3) lo que la seccion emite hoy al papel
 * con un ejemplo; (4) el censo de campos guardados.
 *
 * ATENCION 1: la seccion vive en C. Congenitas -> #tab-congenitas (CC frecuentes) y su
 * acordeon nace CERRADO: hay que abrirlo por su boton real o todo da 0x0.
 * ATENCION 2: el acordeon abre con una transicion de 0,3 s; se le quita antes de medir.
 * ATENCION 3: la tarjeta es un overlay position:fixed; mientras su contenedor este en
 * display:none todo informa 0x0.
 *
 *   node scripts/_probe_marfan1inv.mjs [--file <html>] [--motor chrome|webkit]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
import fs from 'fs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MOTOR = arg('--motor') || 'chrome';
const ANCHOS = [1440, 1000, 768, 390];

const MEDIR = `(async () => {
  const ANCHO = window.innerWidth;
  const R = { errs: [], ancho: ANCHO };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  const T = el => el ? String(el.textContent || '').split(' ').filter(Boolean).join(' ').trim() : 'NO';
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) { R.errs.push('limpiar: ' + e.message) }

  /* ── denominador del censo: campos guardados ANTES de cargar nada ─────────────────── */
  R.camposN = (function(){ try {
    const ids = [];
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      ids.push(e.id);
    });
    return { n: ids.length, hash: ids.slice().sort().join('|').length };
  } catch (e) { return { err: e.message } } })();

  S('nombre', 'Prueba MARFAN1'); S('ci', '586'); S('peso', '70'); S('talla', '170'); S('sexo', 'M'); S('edad', '34');

  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click(); else showTab('congenitas') } catch (e) { R.errs.push('tab: ' + e.message) }
  await new Promise(r => setTimeout(r, 300));
  const acc = EL('sacc-cc-marfan');
  if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-marfan .sacc-hdr'); if (h) h.click() }
  await new Promise(r => setTimeout(r, 420));
  R.accAbierto = acc ? (acc.classList.contains('open') ? 'si' : 'NO') : 'NO EXISTE';
  try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
  await new Promise(r => setTimeout(r, 120));

  /* ── (1) INVENTARIO de la seccion: cada control con su id y su caja ───────────────── */
  R.seccion = { caja: caja(acc), campos: [] };
  if (acc) {
    acc.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      const lab = e.closest('.fg') ? e.closest('.fg').querySelector('label') : null;
      R.seccion.campos.push({ id: e.id, tag: e.tagName.toLowerCase(), tipo: e.type || '',
        rotulo: lab ? T(lab) : '', caja: caja(e),
        guardado: (typeof _noEsDelEstudio === 'function') ? (_noEsDelEstudio(e.id) ? 'NO' : 'si') : '?' });
    });
    R.seccion.spans = Array.prototype.map.call(acc.querySelectorAll('span[id], div[id]'), e => e.id);
    /* la maqueta: cuantas grid y de que tipo */
    R.seccion.grids = Array.prototype.map.call(acc.querySelectorAll('.grid-2, .grid-3'), g => ({
      cls: g.className, caja: caja(g),
      cols: getComputedStyle(g).gridTemplateColumns }));
  }
  R.resultadoCaja = caja(EL('marfan-resultado'));
  R.resultadoTxt = T(EL('marfan-resultado'));

  /* ── (2) LA TARJETA: se abre, se mide, se inventaria ──────────────────────────────── */
  try { critAbrir('marfan') } catch (e) { R.errs.push('critAbrir: ' + e.message) }
  await new Promise(r => setTimeout(r, 300));
  const cuerpo = EL('crit-cuerpo'), card = EL('crit-card');
  R.tarjeta = {
    abierta: (EL('crit-overlay') || {}).style ? EL('crit-overlay').style.display : '?',
    titulo: T(EL('crit-titulo')),
    cardCaja: caja(card), cuerpoCaja: caja(cuerpo),
    cardScrollH: card ? card.scrollHeight : null, cardClientH: card ? card.clientHeight : null
  };
  if (cuerpo) {
    /* GUARDA LA PREGUNTA QUE IMPORTA: algun control de la tarjeta lleva id y por tanto se guarda? */
    R.tarjeta.controlesConId = Array.prototype.map.call(cuerpo.querySelectorAll('input[id], select[id], textarea[id]'), e => e.id);
    R.tarjeta.nControles = cuerpo.querySelectorAll('input, select, textarea').length;
    R.tarjeta.nCheckbox = cuerpo.querySelectorAll('input[type=checkbox]').length;
    /* las tres columnas y su alto: el ESPACIO VACIO es lo que sobra debajo de las cortas */
    const fila = cuerpo.firstElementChild;
    const cols = fila ? Array.prototype.map.call(fila.children, c => ({ tit: T(c.firstElementChild), caja: caja(c) })) : [];
    R.tarjeta.columnas = cols;
    if (cols.length) {
      const alt = cols.map(c => c.caja.h), maxA = Math.max.apply(null, alt);
      R.tarjeta.altoMax = maxA;
      R.tarjeta.vacioPorColumna = cols.map(c => ({ tit: c.tit, w: c.caja.w, h: c.caja.h, vacio: maxA - c.caja.h }));
      R.tarjeta.vacioTotalPx2 = cols.reduce((a, c) => a + c.caja.w * (maxA - c.caja.h), 0);
      R.tarjeta.filaCaja = caja(fila);
      R.tarjeta.enUnaFila = cols.length > 1 ? (cols[0].caja.y === cols[1].caja.y ? 'si' : 'NO') : '?';
    }
    /* el texto de los rasgos del score, tal cual */
    R.tarjeta.rasgos = Array.prototype.map.call(cuerpo.querySelectorAll('[data-mf-p]'), e => ({
      pts: e.getAttribute('data-mf-p'), txt: T(e.parentElement) }));
    R.tarjeta.sumaRasgos = R.tarjeta.rasgos.reduce((a, r) => a + (parseFloat(r.pts) || 0), 0);
    R.tarjeta.pie = T(cuerpo.lastElementChild);
  }
  try { critCerrar() } catch (e) {}
  return R;
})()`;

const PAPEL = `(async () => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Prueba MARFAN1'); S('ci', '586'); S('peso', '70'); S('talla', '170'); S('sexo', 'M'); S('edad', '34');
  S('marfan_sindrome', 'marfan'); S('marfan_ao_seno', '48'); S('marfan_ao_ascendente', '40');
  const chk = EL('marfan_incluir_chk'); if (chk) { chk.checked = true;
    chk.dispatchEvent(new Event('change', { bubbles: true })); }
  try { if (typeof marfanSync === 'function') marfanSync() } catch (e) {}
  await new Promise(r => setTimeout(r, 400));
  R.integrado = chk ? chk.checked : '?';
  R.estado = (typeof marfanEstado === 'function') ? (function(){ const r = marfanEstado();
    return { clave: r.clave, txt: r.txt, sindTxt: r.sindTxt, seno: r.seno, asc: r.asc } })() : 'NO';
  /* los TRES estilos del informe y el EN SUMA */
  R.estilos = {};
  for (const est of ['narrativo', 'esquematico', 'telegrafico']) {
    try { const e = EL('estilo_informe'); if (e) { e.value = est;
      e.dispatchEvent(new Event('change', { bubbles: true })) } } catch (x) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (x) { R.errs.push(est + ': ' + x.message) }
    await new Promise(r => setTimeout(r, 260));
    const t = EL('informe_texto'), s = EL('en_suma');
    R.estilos[est] = { informe: t ? String(t.value || '') : 'NO', suma: s ? String(s.value || '') : 'NO' };
  }
  /* la linea de Marfan, aislada */
  R.lineasMarfan = {};
  Object.keys(R.estilos).forEach(k => {
    const txt = R.estilos[k].informe;
    R.lineasMarfan[k] = txt.split('\\n').filter(l => /[Mm]arfan|[Aa]ortopat/.test(l)).join(' // ');
  });
  R.sumaMarfan = R.estilos.narrativo.suma.split('\\n').filter(l => /[Mm]arfan|[Aa]ortopat/.test(l)).join(' // ');
  /* censo de marcadores prohibidos en el papel */
  const todo = Object.keys(R.estilos).map(k => R.estilos[k].informe + ' ' + R.estilos[k].suma).join(' ');
  R.marcadores = {};
  ['ESC 2024','Tabla 62','folio','Clase I','Clase IIa','Clase IIb','Nivel B','Nivel C','Ghent','diagn'].forEach(m => {
    R.marcadores[m] = (todo.split(m).length - 1);
  });
  return R;
})()`;

(async () => {
  const lanzar = async () => MOTOR === 'webkit'
    ? await _pw.webkit.launch()
    : await _pw.chromium.launch({ channel: 'chrome' });
  const br = await lanzar();
  const out = { file: FILE, motor: MOTOR, anchos: {}, papel: null };
  for (const w of ANCHOS) {
    const ctx = await br.newContext({ viewport: { width: w, height: 900 }, colorScheme: 'dark' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE ' + e.message));
    pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text().slice(0, 120)) });
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(1400);
    let r;
    try { r = await pg.evaluate(MEDIR) } catch (e) { r = { fatal: e.message } }
    r.errsPagina = errs;
    out.anchos[w] = r;
    await ctx.close();
  }
  /* el papel se mide UNA vez, a 1440 */
  {
    const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const pg = await ctx.newPage();
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(1400);
    try { out.papel = await pg.evaluate(PAPEL) } catch (e) { out.papel = { fatal: e.message } }
    await ctx.close();
  }
  await br.close();
  console.log(JSON.stringify(out, null, 1));
  process.exit(0);
})();
