#!/usr/bin/env node
/**
 * _probe_d2.mjs - la calculadora de cardio-oncologia de la tanda D2 (2026-10-30).
 * A/B de SOLO LECTURA: no escribe nada en el arbol ni en disco mas que su JSON.
 *
 * Mide, en los dos arboles:
 *   (1) la calculadora SIN FARMACO elegido, con y sin casillas marcadas (commit 1);
 *   (2) cada farmaco de la Tabla 4, sin factores / un factor de cada nivel / la combinacion
 *       mas alta (commit 2);
 *   (3) que un estudio SIN cardio-oncologia no se mueve (control negativo).
 *
 * Denominador declarado por escena: la capsula de la calculadora, la capsula publicada en
 * `co-riesgo-resultado` -que es la que leen la hoja del PDF, el PPT y el modulo integrado-,
 * el estado del dueno (`hfaicosEstado`), el texto del modulo (`hfaicosTexto`), el informe en
 * los TRES estilos y el EN SUMA.
 *
 *   node scripts/_probe_d2.mjs --file /tmp/head.html --out /tmp/d2.HEAD.json
 *   node scripts/_probe_d2.mjs --out /tmp/d2.NUEVO.json
 *
 * Sin acentos graves (ver scripts/check_backticks.py); verificado ademas con node --check.
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
const OUT = arg('--out') || '/tmp/d2.json';

/* ── LAS ESCENAS ────────────────────────────────────────────────────────────────────────────
   `chk` son las casillas a tildar; `farm` el valor del selector `co_farmaco`; `edad` el campo
   `co_edad`, que es el que elige la fila de edad de la Tabla 4; `integrar` prende la casilla
   que hace que el modulo baje al informe narrativo. */
const ESC = {};
/* (1) SIN FARMACO. Las cuatro situaciones del punto 1a: vacio, un factor moderado, varios, y
   un factor que en la tabla seria muy alto. La ultima con el modulo INTEGRADO, que es la que
   llega al papel firmado. */
ESC.sf_vacio    = { farm: '', chk: [] };
ESC.sf_hta      = { farm: '', chk: ['hfaicos_hta'] };
ESC.sf_varios   = { farm: '', chk: ['hfaicos_hta', 'hfaicos_dm', 'hfaicos_obesidad'] };
ESC.sf_cvic     = { farm: '', chk: ['hfaicos_cv_ic'] };
ESC.sf_integ    = { farm: '', chk: ['hfaicos_hta', 'hfaicos_dm'], integrar: true };
ESC.sf_legado   = { farm: '', chk: ['hfaicos_cv_previa'] };

/* (2) LOS SEIS FARMACOS. Por cada uno: sin factores, un M1, un M2 (o su equivalente), un H y
   la combinacion mas alta. Los valores de la Tabla 4 cambian por columna, asi que la MISMA
   escena da bandas distintas por farmaco - que es justo lo que el A/B tiene que mostrar. */
/* ⚠️ LOS DOS FARMACOS NUEVOS VAN DETRAS DE UNA BANDERA, Y NO ES UN DETALLE. `mieloma` y
   `raf_mek` no existen como <option> en HEAD: ponerle a un <select> un valor que no tiene lo
   deja en '' y la escena se mide como «sin farmaco», o sea que el A/B mostraria diferencias
   donde el cambio no puede actuar. Con --nuevos se miden SOLO en el arbol nuevo. */
const NUEVOS = process.argv.indexOf('--nuevos') > -1;
const FARM = ['antracicline', 'trastuzumab', 'vegf', 'bcr_abl', 'inmunoterapia', 'radioterapia', 'otro']
  .concat(NUEVOS ? ['mieloma', 'raf_mek'] : []);
const COMB = {
  nada:   [],
  dm:     ['hfaicos_dm'],
  hta:    ['hfaicos_hta'],
  tabaco: ['hfaicos_tabaco'],
  arrit:  ['hfaicos_cv_arrit'],
  fevilim:['hfaicos_fevi_lim'],
  fevired:['hfaicos_fevi_red'],
  tropo:  ['hfaicos_troponina'],
  bnp:    ['hfaicos_bnp'],
  coron:  ['hfaicos_cv_coron'],
  ic:     ['hfaicos_cv_ic'],
  htadm:  ['hfaicos_hta', 'hfaicos_dm'],
  cinco:  ['hfaicos_hta', 'hfaicos_dm', 'hfaicos_obesidad', 'hfaicos_tabaco', 'hfaicos_fevi_lim'],
  fuera:  ['hfaicos_sexo_fem', 'hfaicos_gls_alt']
};
FARM.forEach(function (f) {
  Object.keys(COMB).forEach(function (c) { ESC['f_' + f + '_' + c] = { farm: f, chk: COMB[c] } });
  /* Las DOS filas de edad, con el numero cargado a cada lado de los cortes que la tabla usa
     (80, 75, 65). Sin esto, la casilla de edad no distingue columnas. */
  [62, 66, 70, 76, 82].forEach(function (ed) {
    ESC['e_' + f + '_' + ed] = { farm: f, chk: ['hfaicos_edad'], edad: String(ed) };
  });
});
/* La nota al pie g: antraciclina cargada junto al anti-HER2. CONTROL de que el unico piso de
   la tabla no se movio. */
ESC.notag = { farm: 'trastuzumab', chk: ['hfaicos_hta'], dosis: '300' };
ESC.notag_vegf = { farm: 'vegf', chk: ['hfaicos_hta'], dosis: '300' };
/* CONTROL NEGATIVO: un estudio sin un solo dato de cardio-oncologia. Ninguna superficie puede
   cambiar en ninguno de los cuatro commits. */
ESC.ajeno = { farm: '', chk: [], ajeno: true };

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
  set('nombre', 'Prueba D2'); set('documento', '999');
  set('peso', '70'); set('talla', '170'); set('sexo', 'M');
  if (e.ajeno) { set('ddvi', '50'); set('siv', '10'); }
  /* Las casillas se tildan y se despacha el gesto REAL: `hfaicosToggle` es quien aplica la
     exclusion en el borde y quien marca que la movio una persona. Tildar el `checked` y llamar
     a `calcHFAICOS()` a mano fabricaria un disparador que la app no tiene - el error de TC-519. */
  (e.chk || []).forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.checked = true;
    if (typeof window.hfaicosToggle === 'function') { try { window.hfaicosToggle(id) } catch (x) {} }
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  if (e.edad) set('co_edad', e.edad);
  if (e.dosis) set('co_dosis_antrac', e.dosis);
  set('co_farmaco', e.farm || '');
  if (e.integrar) {
    const c = document.getElementById('hfaicos_incluir_chk');
    if (c && !c.checked) { try { window.eteInclToggle('hfaicos_incluir_chk') } catch (x) { c.checked = true } }
  }
  try {
    const L = (typeof window.RECALC_MODULOS === 'function') ? window.RECALC_MODULOS()
            : (Array.isArray(window.RECALC_MODULOS) ? window.RECALC_MODULOS : []);
    L.forEach(function (f) { try { (typeof f === 'function' ? f : window[f])() } catch (x) {} });
  } catch (x) {}
}

function LEER() {
  const T = id => { const el = document.getElementById(id); return el ? (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() : 'NO EXISTE' };
  const r = {};
  /* DENOMINADOR 1: las dos capsulas existen en el documento. */
  r.capCalc = T('hfaicos-resultado');
  r.capBasal = T('co-riesgo-resultado');
  /* DENOMINADOR 2: el dueno contesta. Si no esta en window se dice y no se inventa. */
  try {
    const s = window.hfaicosEstado ? window.hfaicosEstado() : null;
    r.est = s ? { clave: s.clave, banda: s.banda, pts: s.pts, max: s.max, col: s.col,
                  farmaco: s.farmaco, hayDatos: s.hayDatos, mandaFarmaco: s.mandaFarmaco,
                  fueraDeTabla: (s.fueraDeTabla || []).join(' / '),
                  derivacion: s.derivacion, seguimiento: s.seguimiento,
                  clasifica: ('clasifica' in s) ? s.clasifica : 'NO EXISTE' } : 'SIN hfaicosEstado';
  } catch (x) { r.est = 'ERR ' + (x && x.message) }
  try { r.txtMod = window.hfaicosTexto ? window.hfaicosTexto() : 'SIN hfaicosTexto' }
  catch (x) { r.txtMod = 'ERR ' + (x && x.message) }
  /* DENOMINADOR 3: la columna de puntos de la pantalla sigue al farmaco. */
  r.pts = {};
  try {
    document.querySelectorAll('[data-hfa-pts-de]').forEach(function (sp) {
      r.pts[sp.getAttribute('data-hfa-pts-de')] = (sp.textContent || '').trim();
    });
  } catch (x) { r.pts.ERROR = String(x && x.message) }
  /* LAS SUPERFICIES FIRMADAS: informe en los TRES estilos y EN SUMA. Se filtran las lineas de
     cardio-oncologia; el resto del informe no es de esta tanda. */
  r.inf = {};
  ['conciso', 'estandar', 'narrativo'].forEach(function (st) {
    try {
      if (typeof window.setEstiloInforme === 'function') window.setEstiloInforme(st);
      if (typeof window.generarInforme === 'function') window.generarInforme();
      const t = document.getElementById('informe_texto');
      const todo = t ? (t.value || t.innerText || '') : '';
      r.inf[st] = todo.split('\n').filter(function (l) {
        return /riesgo|cardio-onc|oncol|farmac|f.rmac|antracicl|HER2|VEGF|quimio|Deriva|Seguimiento ecoc/i.test(l);
      }).join(' | ');
      if (st === 'estandar') r.infLargo = todo.length;
    } catch (x) { r.inf[st] = 'ERR ' + (x && x.message) }
  });
  try {
    const s = document.getElementById('en_suma');
    r.suma = s ? (s.value || s.innerText || '').trim() : 'NO EXISTE';
  } catch (x) { r.suma = 'ERR ' + (x && x.message) }
  return r;
}

const b = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await b.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e && e.message).slice(0, 200)));
pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2500);
const out = { file: FILE, escenas: {}, errores: errs };
for (const k of Object.keys(ESC)) {
  try {
    await pg.evaluate(function () { try { if (window.limpiarCampos) limpiarCampos() } catch (x) {} });
    await pg.waitForTimeout(120);
    await pg.evaluate(MONTAR, ESC[k]);
    await pg.waitForTimeout(350);
    out.escenas[k] = await pg.evaluate(LEER);
  } catch (x) { out.escenas[k] = { ERROR: String(x && x.message).slice(0, 300) } }
}
await b.close();
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('escenas=' + Object.keys(out.escenas).length + ' errores=' + errs.length + ' -> ' + OUT);
