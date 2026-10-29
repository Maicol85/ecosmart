#!/usr/bin/env node
/**
 * _probe_gpantwk.mjs - los cruces de dos motores de la tanda G de PANTALLAS Y AORTA (2026-10-29).
 *
 * ⚠️ EL NOMBRE LLEVA `pant` PORQUE `_probe_gwk.mjs` YA EXISTE Y ES DE OTRA TANDA: la «G» del
 *    POSOPERATORIO (2026-10-24). Hay DOS tandas llamadas «G» en este repositorio, y al escribir
 *    esta sonda le pise el archivo a la otra -292 lineas- sin querer. Se restauro desde git.
 *    Antes de crear un `_probe_*.mjs`, mirar si el nombre ya esta tomado.
 * Dos motores x cuatro anchos (1440, 1000, 768 y 390) x dos temas, UNA vez, al final.
 *
 *   node scripts/_probe_gpantwk.mjs
 *   node scripts/_probe_gpantwk.mjs --file /tmp/head.html
 *
 * ⚠️ WebKit de Playwright NO es Safari, y se declara en el reporte.
 * ⚠️ El binario de chromium de Playwright NO esta en esta maquina (esta el 1234 y el paquete
 *    pide el 1248): Chrome va por el del sistema con channel:'chrome'. Sin eso la sonda
 *    devuelve los cruces VACIOS, que en un volcado se lee igual que «no hubo diferencias».
 * ⚠️ SIN acentos graves (ver scripts/check_backticks.py).
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium, webkit } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');

function MEDIR() {
  ['modalAvisoEco', 'login-overlay'].forEach(function (id) {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  try { if (window.setViewMode) setViewMode('avanzado') } catch (e) {}
  try { if (window.applyViewMode) applyViewMode() } catch (e) {}
  const R = {};
  const set = function (id, v) { const e = document.getElementById(id); if (!e) return;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })) };
  const txt = function (id) { const e = document.getElementById(id);
    return e ? String(e.value || e.textContent || '').replace(/\s+/g, ' ').trim() : 'NO EXISTE' };

  /* 1 · las pestanas con caja */
  const btns = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'));
  let conCaja = 0;
  btns.forEach(function (b) { const r = b.getBoundingClientRect(); if (r.width > 0 && r.height > 0) conCaja++ });
  R.pestanas = conCaja + '/' + btns.length;
  /* 2 · scroll horizontal del cuerpo */
  R.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;

  /* 3 · LAS OCHO PASTILLAS DE VALVULAS: ninguna recortada */
  try { showTab('valvulas') } catch (e) {}
  (function () {
    const sec = document.querySelector('.tab-section.active');
    if (!sec) return;
    const RE = /^(toggleEteSeccion|secToggle|toggleCard|accToggle)\(/;
    for (let p = 0; p < 2; p++) { let ch = false;
      Array.prototype.slice.call(sec.querySelectorAll('[onclick]'))
        .filter(function (e) { return RE.test((e.getAttribute('onclick') || '').trim()) })
        .forEach(function (h) { const a = sec.scrollHeight; try { h.click() } catch (e) { return }
          const d = sec.scrollHeight;
          if (d < a) { try { h.click() } catch (e) {} } else if (d > a) { ch = true } });
      if (!ch) break; }
  })();
  const PILLS = ['insuf-mitral', 'esten-mitral', 'insuf-aortica', 'esten-aortica',
                 'insuf-tricuspide', 'esten-tricuspide', 'insuf-pulmonar', 'esten-pulmonar'];
  let rec = 0, conCajaP = 0, ancho0 = null;
  PILLS.forEach(function (k) { const el = document.getElementById('pill-' + k); if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0) conCajaP++;
    if (ancho0 === null) ancho0 = Math.round(r.width);
    if (el.scrollWidth > el.clientWidth + 2) rec++ });
  R.pastillas = conCajaP + '/8 con caja, ' + rec + ' recortadas, ancho ' + ancho0;

  /* 4 · LA RAIZ SIN SEXO: la capsula no clasifica */
  try { showTab('ai-vi') } catch (e) {}
  set('peso', '70'); set('talla', '170'); set('ao_sin', '39');
  try { calcAorta() } catch (e) {}
  R.raizSinSexo = txt('ao-interp');
  set('sexo', 'F'); try { calcAorta() } catch (e) {}
  R.raizMujer = txt('ao-interp');

  /* 5 · EL GLOBO DE LA RAIZ: sin «En este paciente», con las dos lineas nuevas */
  const b = document.querySelector('[data-vinfo="ao-card"]');
  if (b) {
    set('edad', '55'); try { calcAorta() } catch (e) {}
    b.click();
    const c = document.getElementById('vinfo-card');
    const t = c ? (c.textContent || '').replace(/\s+/g, ' ').trim() : '';
    const r = c ? c.getBoundingClientRect() : null;
    R.globoRaiz = {
      enEstePaciente: t.indexOf('En este paciente') > -1,
      sospecha: t.indexOf('se puede sospechar') > -1,
      fig5: t.indexOf('Figura 5 (folio 28)') > -1,
      folio71: (t.match(/folio 71/g) || []).length,
      caja: r ? (Math.round(r.width) + 'x' + Math.round(r.height)) : 'NO',
      entra: c ? (c.scrollHeight <= c.clientHeight + 2 && c.scrollWidth <= c.clientWidth + 2) : null
    };
    b.click();
  } else { R.globoRaiz = 'SIN BOTON' }

  /* 6 · EL NOMOGRAMA DE REFERENCIAS y LA FILA DEL VD */
  try { showTab('refs') } catch (e) {}
  try { refSubTab('ao') } catch (e) {}
  const h1 = document.querySelector('[onclick*="toggleRef(\'ao2\'"]'); if (h1) h1.click();
  const cu = document.getElementById('ref-ao2-cuerpo');
  if (cu) { const sv = cu.querySelector('svg');
    if (sv) { const q = sv.getBoundingClientRect(); const sig = sv.nextElementSibling;
      R.nomo = Math.round(q.width) + 'x' + Math.round(q.height) +
               ' cita a ' + (sig ? Math.round(sig.getBoundingClientRect().top - q.bottom) : '?') + ' px' } }
  try { refSubTab('fun') } catch (e) {}
  const h2 = document.querySelector('[onclick*="toggleRef(\'vd2\'"]'); if (h2) h2.click();
  const tv = document.querySelector('#ref-vd2 table.ev-tabla');
  if (tv) { const fila = Array.prototype.slice.call(tv.rows).filter(function (r) {
      return /disfunción leve/.test((r.cells[0] || {}).textContent || '') })[0];
    R.filaVD = fila ? (fila.cells.length + ' celdas, colspan ' + (fila.cells[1] ? fila.cells[1].colSpan : '?')
      + ', «' + (fila.cells[1] ? fila.cells[1].textContent.trim().slice(0, 50) : '') + '»') : 'NO ESTA' }

  /* 7 · texto recortado en toda la pestana activa */
  let rec2 = 0;
  Array.prototype.slice.call(document.querySelectorAll('.tab-section.active *')).forEach(function (e) {
    if (e.children.length) return;
    if ((e.textContent || '').trim() === '') return;
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || /auto|scroll|hidden/.test(cs.overflowX + cs.overflow)) return;
    if (cs.textOverflow === 'ellipsis') return;
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) rec2++ });
  R.recortados = rec2;
  return R;
}

async function corre(nombre, abrir) {
  const b = await abrir(); const R = {};
  try {
    for (const w of [1440, 1000, 768, 390]) {
      for (const esquema of ['light', 'dark']) {
        const ctx = await b.newContext({ viewport: { width: w, height: 1000 }, colorScheme: esquema });
        const pg = await ctx.newPage();
        const errs = [];
        pg.on('pageerror', e => errs.push('PAGEERROR ' + String(e.message).slice(0, 140)));
        pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 140)) });
        try {
          await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
          const r = await pg.evaluate(MEDIR, { timeout: 60000 });
          r.errores = errs.length; r.erroresTxt = errs.slice(0, 3);
          R[w + 'px/' + esquema] = r;
        } catch (e) { R[w + 'px/' + esquema] = { ERROR: String(e).slice(0, 200), errores: errs.length } }
        await ctx.close();
      }
    }
  } finally { await b.close() }
  return R;
}

const OUT = {};
OUT.chrome = await corre('chrome', () => chromium.launch({ channel: 'chrome' }));
OUT.webkit = await corre('webkit', () => webkit.launch());
console.log(JSON.stringify(OUT, null, 1));
console.log('CIERRE_OK');
