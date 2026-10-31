#!/usr/bin/env node
/**
 * _probe_d2wk.mjs - Chrome y WebKit sobre lo que la tanda D2 toca (2026-10-30).
 * SOLO LECTURA. Dos motores x 1440, 1000, 768 y 390 px x dos temas = 16 cruces por arbol.
 *
 *   node scripts/_probe_d2wk.mjs --file /tmp/head.html --out /tmp/wk.HEAD.json
 *   node scripts/_probe_d2wk.mjs --out /tmp/wk.NUEVO.json
 *
 * ⚠️ CHROME VA POR EL DEL SISTEMA (channel:'chrome'): el binario de chromium de Playwright no
 * esta en esta maquina, y sin el channel la sonda devuelve los cruces VACIOS, que en un volcado
 * se lee igual que «no hubo diferencias».
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara.
 * ⚠️ ABRIR LA PESTANA NO LE DA CAJA A LA TARJETA: «Referencia rapida» es un acordeon cerrado y
 * adentro todo informa 0x0. Se abre por su boton REAL y se le saca la transicion.
 * ⚠️ LA TARJETA DE UN GLOBO ES position:fixed, asi que su offsetParent es null aunque este
 * abierta: se pregunta por display.
 *
 * Sin acentos graves (ver scripts/check_backticks.py); verificado con node --check.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUT = arg('--out') || '/tmp/d2wk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['claro', 'oscuro'];

function MONTAR(tema) {
  ['modalAvisoEco', 'login-overlay'].forEach(function (id) {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  try { document.documentElement.setAttribute('data-theme', tema === 'oscuro' ? 'dark' : 'light') } catch (x) {}
  try { if (window.setViewMode) setViewMode('avanzado') } catch (x) {}
  try { if (window.applyViewMode) applyViewMode() } catch (x) {}
  const set = function (id, v) { const e = document.getElementById(id); if (!e) return;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); };
  set('nombre', 'Prueba D2'); set('documento', '556');
  set('peso', '70'); set('talla', '170'); set('sexo', 'M');
  const c = document.getElementById('hfaicos_hta');
  if (c) { c.checked = true; try { window.hfaicosToggle('hfaicos_hta') } catch (x) {} }
  try { if (window.showTab) showTab('cardioOnco') } catch (x) {}
  const h = document.querySelector('[onclick*="co-referencia-seccion"]');
  if (h) { try { h.click() } catch (x) {} }
  const sec = document.getElementById('co-referencia-seccion');
  if (sec) { sec.style.display = ''; sec.style.transition = 'none'; }
  try { if (window.coRefTab) coRefTab('ctrcd') } catch (x) {}
}

function LEER() {
  const o = {};
  const T = id => { const e = document.getElementById(id);
    return e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : 'NO EXISTE' };
  /* DENOMINADOR 1: la pestana tiene caja y la seccion esta abierta. */
  const tab = document.getElementById('tab-cardioOnco');
  o.pestanaCaja = !!(tab && tab.getBoundingClientRect().height > 0);
  const sec = document.getElementById('co-referencia-seccion');
  o.seccionAbierta = !!(sec && sec.getBoundingClientRect().height > 0);
  /* La calculadora sin farmaco. */
  o.capsula = T('hfaicos-resultado').slice(0, 120);
  o.basal = T('co-riesgo-resultado').slice(0, 90);
  /* La matriz. */
  try { if (window.coRefTab) coRefTab('hfaicos') } catch (x) {}
  const t = document.querySelector('#co-t4-matriz table');
  o.matriz = t ? (t.rows.length + 'x' + t.rows[0].cells.length) : 'NO EXISTE';
  const cont = document.getElementById('co-t4-matriz');
  o.matrizScroll = cont ? (cont.scrollWidth > cont.clientWidth + 1) : 'NO EXISTE';
  o.regla = T('co-t4-regla').slice(0, 120);
  /* Las tres copias de cada fila de monitoreo. */
  let ici = 0, vegf = 0;
  document.querySelectorAll('[data-coref-pane] td').forEach(function (td) {
    const x = td.textContent || '';
    if (/ciclos 2, 3 y 4/.test(x)) ici++;
    if (/domiciliaria diaria el primer ciclo/.test(x)) vegf++;
  });
  o.filas = ici + '/' + vegf;
  /* El globo nuevo: 44x44 con sus cinco puntos propios, y su tarjeta dentro de la pantalla. */
  try { if (window.coRefTab) coRefTab('ctrcd') } catch (x) {}
  const b = document.querySelector('[data-vinfo="co-monitoreo"]');
  if (!b) { o.globo = 'NO EXISTE' } else {
    try { b.scrollIntoView({ block: 'center' }) } catch (x) {}
    const r = b.getBoundingClientRect();
    o.globo = Math.round(r.width) + 'x' + Math.round(r.height);
    const P = [[r.left + 2, r.top + 2], [r.right - 2, r.top + 2], [r.left + 2, r.bottom - 2],
               [r.right - 2, r.bottom - 2], [r.left + r.width / 2, r.top + r.height / 2]];
    o.puntos = P.map(function (p) { const e = document.elementFromPoint(p[0], p[1]);
      return (e === b || b.contains(e)) ? 1 : 0 }).reduce(function (a, c) { return a + c }, 0);
    try { window.vInfoClic(b) } catch (x) {}
  }
  return o;
}

function LEER2(W, H) {
  const o = {};
  const c = document.getElementById('vinfo-card');
  if (c && getComputedStyle(c).display !== 'none') {
    const r = c.getBoundingClientRect();
    o.tarjeta = Math.round(r.width) + 'x' + Math.round(r.height);
    o.dentro = r.top >= -1 && r.bottom <= H + 1 && r.left >= -1 && r.right <= W + 1;
    o.folios = /folio 4273/.test(c.innerText) && /folio 4264/.test(c.innerText);
  } else { o.tarjeta = 'NO VISIBLE' }
  /* Desplazamiento horizontal del cuerpo y textos recortados, sobre la pestana visible. */
  o.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  let cort = 0;
  document.querySelectorAll('#tab-cardioOnco td, #tab-cardioOnco th, #tab-cardioOnco label, #tab-cardioOnco option').forEach(function (e) {
    const cs = getComputedStyle(e);
    if (cs.overflow === 'visible' || cs.overflowX === 'visible') return;
    if (e.scrollWidth > e.clientWidth + 2) cort++;
  });
  o.recortados = cort;
  return o;
}

const out = { file: FILE, cruces: {} };
for (const [nom, motor, opts] of [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
  let b;
  try { b = await motor.launch({ headless: true, ...opts }) }
  catch (e) { out.cruces[nom] = { ERROR: String(e && e.message).slice(0, 160) }; continue }
  for (const W of ANCHOS) for (const tema of TEMAS) {
    const k = nom + '_' + W + '_' + tema;
    const errs = [];
    try {
      const pg = await b.newPage();
      await pg.setViewportSize({ width: W, height: 900 });
      pg.on('pageerror', e => errs.push(String(e && e.message).slice(0, 140)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 140)) });
      await pg.goto('file://' + FILE);
      await pg.waitForTimeout(2200);
      await pg.evaluate(MONTAR, tema);
      await pg.waitForTimeout(500);
      const a = await pg.evaluate(LEER);
      await pg.waitForTimeout(350);
      const c = await pg.evaluate(function (d) { return (0, eval)('(' + d.f + ')')(d.W, d.H) },
                                  { f: LEER2.toString(), W, H: 900 });
      out.cruces[k] = { ...a, ...c, errores: errs };
      await pg.close();
    } catch (x) { out.cruces[k] = { ERROR: String(x && x.message).slice(0, 200), errores: errs } }
  }
  await b.close();
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('cruces=' + Object.keys(out.cruces).length + ' -> ' + OUT);
