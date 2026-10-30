#!/usr/bin/env node
/**
 * _probe_coavab.mjs - la COARTACION y la BICUSPIDE de la tanda AORTA-2 (2026-10-30), commit 2.
 * A/B de SOLO LECTURA.
 *
 * Mide, en los dos arboles, lo que el COMMIT 2 decide:
 *   2b(ii) la coartacion LLEGA al EN SUMA, y ni el informe ni el EN SUMA dicen «sin
 *          alteraciones» con una bicuspide o una coartacion presentes.
 *   2b(i)  los tres textos de pantalla de la coartacion pasan a una linea corta y un ⓘ, SIN
 *          perder un dato.
 *   2b(iii) la Evidencia de la bicuspide trae cada umbral UNA sola vez y sin mayusculas en
 *          medio de la frase.
 *
 * DENOMINADORES declarados por escena: que la escena cargo lo que dice cargar (la conclusion de
 * la coartacion existe; la morfologia es «Bicuspide»), el informe en los TRES estilos, el EN
 * SUMA entero, los tres hints de pantalla y el texto de la seccion de Evidencia de la VAB.
 *
 *   node scripts/_probe_coavab.mjs --file /tmp/head.html --out /tmp/cv.HEAD.json
 *
 * Sin acentos graves (ver scripts/check_backticks.py).
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUT = arg('--out') || '/tmp/cv.json';

const COA = { coa_loc: 'istmo', coa_situacion: 'nativa', coa_istmo: '8', coa_ao_desc: '20', coa_gmedio: '25' };
const COA_PP = Object.assign({}, COA, { coa_gradiente_picopico: '25', coa_hta: 'si' });
const COA_EST = Object.assign({}, COA, { coa_estenosis_relativa: '60', coa_hta: 'no' });
const ESC = {
  /* La coartacion SIN integrar al informe: es el escenario del punto 2b(ii). */
  coa_sin_integrar: { campos: COA, integrarCoa: false },
  coa_integrada:    { campos: COA, integrarCoa: true },
  /* Las dos ramas que publican clase y nivel, para ver que dice cada superficie. */
  coa_pp_hta:       { campos: COA_PP, integrarCoa: true },
  coa_est_normot:   { campos: COA_EST, integrarCoa: true },
  /* CONTROL NEGATIVO: la seccion TOCADA pero sin conclusion posible. */
  coa_incompleta:   { campos: { coa_loc: 'istmo' }, integrarCoa: false },
  /* La bicuspide sola, que el AJ1-3 ya resolvio: se VERIFICA, no se rehace. */
  vab_sola:         { campos: { va_morf: 'Bicúspide' } },
  vab_y_coa:        { campos: Object.assign({ va_morf: 'Bicúspide' }, COA), integrarCoa: false },
  /* La Evidencia de la bicuspide SOLO se pinta con la aorta por encima del corte de dilatacion:
     sin esta escena, contar umbrales en `_indVAB()` da null y se lee igual que «no los repite». */
  vab_evid:         { campos: { va_morf: 'Bicúspide', ao_tub: '52', ao_sin: '47' } },
  vab_evid_55:      { campos: { va_morf: 'Bicúspide', ao_tub: '56', ao_sin: '41' } },
  /* CONTROL NEGATIVO: ni bicuspide ni coartacion. */
  ajeno:            { campos: { ao_tub: '30' } },
  vacio:            { campos: {} }
};

function MONTAR(e) {
  ['modalAvisoEco', 'login-overlay'].forEach(function (id) {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  try { if (window.setViewMode) setViewMode('avanzado') } catch (x) {}
  try { if (window.applyViewMode) applyViewMode() } catch (x) {}
  const set = function (id, v) {
    const el = document.getElementById(id); if (!el) return false;
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };
  set('nombre', 'Prueba Coa'); set('documento', '999');
  set('peso', '70'); set('talla', '170'); set('sexo', 'M');
  Object.keys(e.campos || {}).forEach(function (k) { set(k, e.campos[k]) });
  if (e.integrarCoa) {
    const c = document.getElementById('coart_incluir_chk');
    if (c && !c.checked) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })) }
  }
  try {
    const L = (typeof window.RECALC_MODULOS === 'function') ? window.RECALC_MODULOS()
            : (Array.isArray(window.RECALC_MODULOS) ? window.RECALC_MODULOS : []);
    L.forEach(function (f) { try { (typeof f === 'function' ? f : window[f])() } catch (x) {} });
  } catch (x) {}
  ['coaSync', 'vabSync', 'vabCoaCruceSync', 'calcAorta'].forEach(function (f) {
    try { if (typeof window[f] === 'function') window[f]() } catch (x) {}
  });
}

function LEER() {
  const T = id => { const el = document.getElementById(id); return el ? (el.innerText || el.textContent || '').trim() : 'NO EXISTE' };
  const r = {};
  /* DENOMINADOR: la escena cargo lo que dice cargar. */
  try { const c = window.coaConclusion ? window.coaConclusion() : null;
        r.den_coaConcluye = c ? String(c.clave) : 'null'; } catch (x) { r.den_coaConcluye = 'ERR' }
  r.den_morf = (document.getElementById('va_morf') || {}).value || 'NO EXISTE';
  r.den_chk = String(!!(document.getElementById('coart_incluir_chk') || {}).checked);
  r.capConcl = T('coa-concl');
  r.inf = {};
  ['conciso', 'estandar', 'narrativo'].forEach(function (st) {
    try {
      if (typeof window.setEstiloInforme === 'function') window.setEstiloInforme(st);
      if (typeof window.generarInforme === 'function') window.generarInforme();
      const t = document.getElementById('informe_texto');
      r.inf[st] = t ? (t.value || t.innerText || '').trim() : 'NO EXISTE';
    } catch (x) { r.inf[st] = 'ERR ' + (x && x.message) }
  });
  const s = document.getElementById('en_suma');
  r.suma = s ? (s.value || s.innerText || '').trim() : 'NO EXISTE';
  /* ¿El EN SUMA niega? Es la condicion del punto 2b(ii). */
  r.niega = String(/sin alteraciones estructurales/i.test(r.suma));
  /* Los TRES textos de pantalla de la coartacion, leidos por el texto de su propia fila. */
  const hint = function (id) {
    const el = document.getElementById(id);
    if (!el) return 'NO EXISTE';
    const fg = el.closest('.fg') || el.parentElement;
    const sp = fg ? fg.querySelector('span') : null;
    return sp ? (sp.innerText || sp.textContent || '').trim() : 'SIN SPAN';
  };
  r.hint_pp  = hint('coa_gradiente_picopico');
  r.hint_est = hint('coa_estenosis_relativa');
  r.hint_hta = hint('coa_hta');
  /* El ⓘ de la coartacion: existe o no, y que dice. */
  const g = document.querySelector('[data-vinfo="coa-card"]');
  r.globoCoa = g ? 'EXISTE' : 'NO EXISTE';
  /* ⚠️ SE CLICKEA EL BOTON DE VERDAD. `VINFO` es un `const` de nivel superior y NO esta en
     `window`, asi que preguntarle al registro devolvia la cadena vacia en los dos arboles — y
     una cadena vacia en los dos lados se lee igual que «el globo no cambio». */
  /* ⚠️ EL CONTENIDO SE LE PIDE AL CONSTRUCTOR EXPORTADO, NO A UN CLIC SINTETICO. Medido: un
     `btn.click()` dentro de `evaluate` deja `#vinfo-card` con length 0 — y lo deja igual en
     `ao-card`, que es una tarjeta que funciona en la app desde hace tandas. O sea que el cero
     es del arnes y no de la aplicacion, y un cero en los DOS arboles se lee como «no cambio».
     Que la tarjeta se PINTE de verdad lo mide la sonda de dos motores, con un clic real. */
  try {
    const n = (typeof window.evTarjetaCoa === 'function') ? window.evTarjetaCoa() : null;
    const w = document.createElement('div'); if (n) w.appendChild(n);
    r.globoCoaTxt = n ? (w.textContent || '').replace(/\s+/g, ' ').trim() : 'SIN CONSTRUCTOR';
  } catch (x) { r.globoCoaTxt = 'ERR ' + (x && x.message) }
  /* La Evidencia de la bicuspide: el texto COMPLETO de la seccion, para contar umbrales. */
  try {
    const f = window._indVAB ? window._indVAB() : null;
    if (!f) r.evVAB = 'null';
    else {
      const trozos = [];
      (f.filas || []).forEach(function (x) { trozos.push(JSON.stringify(x)) });
      (f.bloques || []).forEach(function (b) {
        trozos.push(b.tit || '');
        (b.lineas || []).forEach(function (l) { trozos.push(typeof l === 'string' ? l : (l && l.txt) || '') });
      });
      if (f.guia) trozos.push(f.guia.txt || '');
      (f.notas || []).forEach(function (l) { trozos.push(typeof l === 'string' ? l : (l && l.txt) || '') });
      r.evVAB = trozos.join(' · ');
      /* Cuantas veces aparece cada umbral en el texto de la seccion. */
      const cuenta = function (re) { return (r.evVAB.match(re) || []).length };
      r.ev_55 = cuenta(/55\s*mm/g);
      r.ev_52 = cuenta(/52\s*mm/g);
      r.ev_50 = cuenta(/50\s*mm/g);
      r.ev_45 = cuenta(/45\s*mm/g);
      /* Mayusculas en medio de la frase: una palabra de 2 letras o mas, toda en mayusculas,
         que no sea una sigla conocida ni un numero romano de clase. */
      r.ev_mayus = (r.evVAB.match(/(?<![A-ZÁÉÍÓÚÑ])\b(?!I{1,3}a?b?\b|IIa\b|IIb\b|ESC\b|EACTS\b|TTE\b|CCT\b|CMR\b|BAV\b|PDF\b)[A-ZÁÉÍÓÚÑ]{2,}\b/g) || []).join(',');
    }
  } catch (x) { r.evVAB = 'ERR ' + (x && x.message) }
  return r;
}

const b = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await b.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e && e.message).slice(0, 200)));
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2500);
const out = { file: FILE, escenas: {}, errores: errs };
for (const k of Object.keys(ESC)) {
  try {
    await pg.evaluate(function () { try { if (window.limpiarCampos) limpiarCampos() } catch (x) {} });
    await pg.waitForTimeout(150);
    await pg.evaluate(MONTAR, ESC[k]);
    await pg.waitForTimeout(450);
    out.escenas[k] = await pg.evaluate(LEER);
  } catch (x) { out.escenas[k] = { ERROR: String(x && x.message).slice(0, 300) } }
}
await b.close();
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('escenas=' + Object.keys(out.escenas).length + ' errores=' + errs.length + ' -> ' + OUT);
