#!/usr/bin/env node
/**
 * _probe_aorta2.mjs - los SEGMENTOS de la Figura 5 de la tanda AORTA-2 (2026-10-30).
 * A/B de SOLO LECTURA: no escribe nada en el arbol ni en disco mas que su JSON.
 *
 * Mide, en los dos arboles, lo que el COMMIT 1 decide:
 *   (a) UNION SINOTUBULAR y AORTA ASCENDENTE pasan a tener corte POR SEXO (Figura 5, folio 3563).
 *   (b) El texto de esos dos dice «por encima del limite superior de lo normal», NO «dilatada».
 *   (c) SIN SEXO, en la franja ambigua, NO se clasifica: el papel dice solo el diametro.
 *   (d) CAYADO y DESCENDENTE conservan su corte y llevan el chip «Criterio de EcoSmart».
 *   (e) La RAIZ no se movio (apartado 9.2.1.1): sus bordes 35/36/39/40 salen identicos.
 *
 * Denominador declarado por escena: las tres capsulas de los segmentos tocados, el informe en
 * los TRES estilos, el EN SUMA, el veredicto del dueno (`aoSegGrado`) y el aviso de falta de sexo.
 *
 *   node scripts/_probe_aorta2.mjs --file /tmp/head.html --out /tmp/a2.HEAD.json
 *   node scripts/_probe_aorta2.mjs --out /tmp/a2.NUEVO.json
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
const OUT = arg('--out') || '/tmp/a2.json';

/* ── LAS ESCENAS ────────────────────────────────────────────────────────────────────────────
   Los bordes por segmento y por sexo salen de la Figura 5: union sinotubular 38/33 y aorta
   ascendente 40/36. Se prueban el valor del corte EXACTO y uno a cada lado, en los dos sexos y
   SIN sexo, que es donde la franja ambigua vive. La raiz va con sus mismos bordes de la tanda G
   como CONTROL NEGATIVO de que el apartado 9.2.1.1 no se movio. */
const ESC = {};
const BORDES = {
  ao_st:  [32, 33, 34, 37, 38, 39],
  ao_tub: [35, 36, 37, 39, 40, 41],
  ao_sin: [35, 36, 39, 40, 41]
};
[['M', 'varon'], ['F', 'mujer'], ['', 'sinsexo']].forEach(function (s) {
  Object.keys(BORDES).forEach(function (k) {
    BORDES[k].forEach(function (mm) {
      ESC[k + '_' + s[1] + '_' + mm] = { sexo: s[0], campo: k, val: String(mm) };
    });
  });
});
/* CAYADO y DESCENDENTE: conservan su corte UNICO para los dos sexos. Las dos escenas por sexo
   son el CONTROL NEGATIVO de que no se les agrego corte por sexo. */
[['M', 'varon'], ['F', 'mujer'], ['', 'sinsexo']].forEach(function (s) {
  [39, 40, 41].forEach(function (mm) {
    ESC['cay_' + s[1] + '_' + mm] = { sexo: s[0], campo: 'diam_cayado', val: String(mm) };
  });
  [34, 35, 36].forEach(function (mm) {
    ESC['desc_' + s[1] + '_' + mm] = { sexo: s[0], campo: 'diam_ao_toracica', val: String(mm) };
  });
});
/* CONTROL NEGATIVO: un estudio SIN un solo segmento aortico. Ninguna superficie puede cambiar. */
ESC.ajeno = { sexo: 'M', campo: null, val: null };
/* CONTROL: varios segmentos a la vez, para que el informe arme su cadena con mas de uno. */
ESC.multi_mujer = { sexo: 'F', campo: null, val: null,
                    extra: { ao_sin: '35', ao_st: '35', ao_tub: '38', diam_cayado: '39' } };
ESC.multi_varon = { sexo: 'M', campo: null, val: null,
                    extra: { ao_sin: '35', ao_st: '35', ao_tub: '38', diam_cayado: '39' } };

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
  set('nombre', 'Prueba Aorta2'); set('documento', '999');
  set('peso', '70'); set('talla', '170');
  if (e.sexo) set('sexo', e.sexo);
  if (e.campo) set(e.campo, e.val);
  if (e.extra) Object.keys(e.extra).forEach(function (k) { set(k, e.extra[k]) });
  /* El embudo de recalculo, igual que el resto de los arneses de la casa.
     RECALC_MODULOS es una FUNCION, no un array: llamarla con forEach tira TypeError y el catch
     se lo traga, que es el defecto que la tanda B documenta en _probe_r2ab. */
  try {
    const L = (typeof window.RECALC_MODULOS === 'function') ? window.RECALC_MODULOS()
            : (Array.isArray(window.RECALC_MODULOS) ? window.RECALC_MODULOS : []);
    L.forEach(function (f) { try { (typeof f === 'function' ? f : window[f])() } catch (x) {} });
  } catch (x) {}
  ['calcBSA', 'calcAI', 'calcVI', 'calcAorta', 'calcAo'].forEach(function (f) {
    try { if (typeof window[f] === 'function') window[f]() } catch (x) {}
  });
}

function LEER(e) {
  const T = id => { const el = document.getElementById(id); return el ? (el.innerText || el.textContent || '').trim() : 'NO EXISTE' };
  const r = { cap: {}, grado: {}, dil: {}, chip: {} };
  /* DENOMINADOR 1: las CINCO capsulas existen en el documento. */
  r.cap.sin  = T('ao-interp');
  r.cap.st   = T('ao-st-interp');
  r.cap.tub  = T('ao-tub-interp');
  r.cap.cay  = T('ao-cay-interp');
  r.cap.desc = T('ao-desc-interp');
  /* DENOMINADOR 2: el dueno contesta. Si AO_SEGS no esta en window, se dice y no se inventa. */
  try {
    const S = window.AO_SEGS;
    if (!S) { r.grado.ERROR = 'SIN AO_SEGS' }
    else S.forEach(function (sg) {
      const x = (typeof window.v === 'function') ? window.v(sg.k) : null;
      r.grado[sg.k] = (x ? String(window.aoSegGrado(sg, x)) : 'sin dato');
      r.dil[sg.k] = (x ? String(window.aoSegDil(sg, x)) : 'sin dato');
      r.chip[sg.k] = String(!!sg.ecosmart);
    });
  } catch (x) { r.grado.ERROR = String(x && x.message) }
  /* DENOMINADOR 3: el aviso de falta de sexo. */
  const av = document.getElementById('aivi-sexo-aviso');
  r.avisoSexo = av ? (av.innerText || '').trim().slice(0, 300) : 'NO EXISTE';
  /* LAS SUPERFICIES FIRMADAS: informe en los TRES estilos y EN SUMA. */
  r.inf = {};
  ['conciso', 'estandar', 'narrativo'].forEach(function (st) {
    try {
      /* El estilo es estado de SESION y se fija con `setEstiloInforme`, no con un select:
         ponerselo a un elemento que no existe dejaba las tres columnas con el MISMO texto y el
         denominador del narrativo valia cero. Es la trampa que la tanda AJ9 documenta con
         TC-547. */
      if (typeof window.setEstiloInforme === 'function') window.setEstiloInforme(st);
      if (typeof window.generarInforme === 'function') window.generarInforme();
      const t = document.getElementById('informe_texto');
      const todo = t ? (t.value || t.innerText || '') : '';
      /* Solo las lineas de aorta: el resto del informe no es de esta tanda. */
      r.inf[st] = todo.split('\n').filter(function (l) {
        return /[Aa]orta|aortic|cayado|sinotubular|raiz|raíz/.test(l);
      }).join(' | ');
    } catch (x) { r.inf[st] = 'ERR ' + (x && x.message) }
  });
  /* El EN SUMA lo escribe el MISMO generarInforme (`_infEscribir('en_suma', ...)`), asi que
     para cuando se lee ya esta puesto por la ultima pasada del bucle de estilos. */
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
    await pg.waitForTimeout(400);
    out.escenas[k] = await pg.evaluate(LEER, ESC[k]);
  } catch (x) { out.escenas[k] = { ERROR: String(x && x.message).slice(0, 300) } }
}
await b.close();
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('escenas=' + Object.keys(out.escenas).length + ' errores=' + errs.length + ' -> ' + OUT);
