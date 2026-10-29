#!/usr/bin/env node
/**
 * _probe_graiz.mjs - la RAIZ AORTICA de la tanda G (2026-10-29), A/B de SOLO LECTURA.
 *
 * Mide, en los dos arboles, lo que el COMMIT 4 decide:
 *   (i)   LA RAIZ ES UN SOLO DATO: se escribe en `ao_sin` y se lee en `marfan_ao_seno`, y al reves.
 *   (iii) SIN SEXO: con 36 o mas y menos de 40, y sin indice por encima de 22, NO se clasifica.
 *   (iv)  EL PAPEL NOMBRA EL INDICE SOLO CUANDO EL INDICE DIO EL VOTO.
 *   (v)   UN SOLO BLOQUE en el informe y en el EN SUMA.
 * Los bordes del punto 4d: varon y mujer con 35, 36, 39 y 40 mm; sin sexo con las mismas; y el
 * indice en 22 y en 23.
 *
 *   node scripts/_probe_graiz.mjs --file /tmp/head.html --out /tmp/raiz.HEAD.json
 *   node scripts/_probe_graiz.mjs --out /tmp/raiz.NUEVO.json
 *
 * ⚠️ SIN acentos graves (ver scripts/check_backticks.py).
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
const OUT = arg('--out') || '/tmp/raiz.json';

/* Las escenas: cada una es sexo + peso/talla + donde se escribe la raiz y con que valor. */
const ESC = {};
[['M', 'varon'], ['F', 'mujer'], ['', 'sinsexo']].forEach(function (s) {
  [35, 36, 39, 40, 45].forEach(function (mm) {
    ESC['ao_' + s[1] + '_' + mm] = { sexo: s[0], peso: '70', talla: '170', campo: 'ao_sin', val: String(mm) };
  });
});
/* El indice: una persona de talla baja con la raiz por debajo del corte del diametro.
   ASC con peso 45 y talla 150 ~ 1,37 m2 -> 31/1,37 = 22,6 -> el indice vota.
   Y el control: la misma raiz con una ASC grande, donde el indice NO vota. */
ESC.ida_vota     = { sexo: 'M', peso: '45', talla: '150', campo: 'ao_sin', val: '32' };
ESC.ida_no_vota  = { sexo: 'M', peso: '90', talla: '185', campo: 'ao_sin', val: '32' };
ESC.ida_borde22  = { sexo: 'M', peso: '45', talla: '150', campo: 'ao_sin', val: '31' };
/* La sincronizacion: se escribe en UNO y se mira el OTRO. */
ESC.sync_desde_aivi   = { sexo: 'M', peso: '70', talla: '170', campo: 'ao_sin',         val: '42' };
ESC.sync_desde_marfan = { sexo: 'M', peso: '70', talla: '170', campo: 'marfan_ao_seno', val: '43' };
/* CONTROL POSITIVO del sentido CONDICIONAL estudio -> modulo: con el modulo EN USO -un
   sindrome declarado- la raiz tecleada en AI/VI SI tiene que llegar al campo del modulo.
   Sin esta escena, «marfan_ao_seno no se escribe nunca» no se distingue de «el sentido no
   existe». */
ESC.sync_modulo_en_uso = { sexo: 'M', peso: '70', talla: '170', campo: 'ao_sin', val: '44',
                           sindrome: 'marfan' };
/* CONTROL NEGATIVO: un estudio SIN aorta. Ninguna superficie puede cambiar. */
ESC.ajeno = { sexo: 'M', peso: '70', talla: '170', campo: null, val: null, ajeno: true };

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
  set('nombre', 'Prueba Raiz'); set('documento', '999');
  set('peso', e.peso); set('talla', e.talla);
  if (e.sexo) set('sexo', e.sexo);
  if (e.ajeno) { set('siv', '11'); set('ppvi', '10'); set('ddvi', '48'); }
  else if (e.campo) {
    /* El marfan necesita su sindrome para que el modulo concluya. */
    if (e.campo === 'marfan_ao_seno' || e.sindrome) set('marfan_sindrome', e.sindrome || 'marfan');
    set(e.campo, e.val);
  }
  /* El embudo de recalculo, una vez. */
  try { if (typeof _recalcModulos === 'function') _recalcModulos('ab') } catch (x) {}
  Object.keys(window).forEach(function (k) {
    if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') { try { window[k]() } catch (x) {} }
  });
  try { if (typeof _espejosBarrerTodos === 'function') _espejosBarrerTodos() } catch (x) {}
  return true;
}

function MEDIR() {
  const R = {};
  const val = function (id) { const e = document.getElementById(id); return e ? e.value : 'NO EXISTE' };
  /* ⚠️ `informe_texto` y `en_suma` son TEXTAREA: su contenido vive en `.value`, no en
     `textContent`. Leyendo solo el textContent las dos superficies firmadas salian VACIAS y el
     A/B habria dicho «cero diferencias» sobre un denominador de cero. */
  const txt = function (id) { const e = document.getElementById(id); if (!e) return 'NO EXISTE';
    return String(e.value || e.textContent || '').replace(/\s+/g, ' ').trim() };
  /* 1 · los DOS campos de la raiz */
  R.ao_sin = val('ao_sin');
  R.marfan_ao_seno = val('marfan_ao_seno');
  R.marfan_ita = val('marfan_ita');
  /* 2 · la capsula de la raiz */
  R.cap_raiz = txt('ao-interp');
  /* el id real sale del registro, por si cambia */
  try { if (window.AO_INTERP_EL && AO_INTERP_EL.ao_sin) R.cap_raiz = txt(AO_INTERP_EL.ao_sin) } catch (e) {}
  /* 3 · el aviso de falta de sexo */
  R.aviso_sexo = txt('aivi-sexo-aviso');
  const avisos = Array.prototype.slice.call(document.querySelectorAll('[id*="sexo"]'))
    .map(function (n) { return n.id + '=' + (n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90) })
    .filter(function (s) { return s.indexOf('=') < s.length - 1 });
  R.avisos_sexo = avisos.slice(0, 6);
  /* 4 · el informe en los tres estilos y el EN SUMA */
  try {
    if (typeof generarInforme === 'function') generarInforme();
  } catch (e) { R.errInforme = String(e).slice(0, 100) }
  const t = txt('informe_texto');
  R.informe = t;
  R.informe_aorta = (t.match(/[^.]*[Aa]orta tor[^.]*\./g) || []).join(' || ');
  R.informe_aortopatia = (t.match(/[^.]*[Aa]ortopat[^.]*\./g) || []).join(' || ');
  R.informe_sinusal = (t.match(/[^.]*sinusal[^.]*\./g) || []).join(' || ');
  R.suma = txt('en_suma');
  if (R.suma === 'NO EXISTE') R.suma = '';
  R.suma_aorta = (R.suma.match(/[^.]*([Aa]orta|[Aa]ortopat|[Rr]a[ií]z)[^.]*\./g) || []).join(' || ');
  /* 5 · el panel de Evidencia: cuantas secciones de aorta */
  try { if (typeof _indLista === 'function') { } } catch (e) {}
  R.nSecAo = document.querySelectorAll('[data-ind-sec]').length;
  /* 6 · el modulo de aortopatia */
  try { if (typeof marfanEstado === 'function') { const m = marfanEstado();
    R.marfan = { hayDatos: !!m.hayDatos, clave: m.clave || null, txt: (m.txt || '').slice(0, 200) }; } }
  catch (e) { R.marfan = 'ERR ' + String(e).slice(0, 60) }
  /* 7 · el voto del predicado, preguntado al dueno */
  try {
    const sg = (window.AO_SEGS || []).filter(function (s) { return s.k === 'ao_sin' })[0];
    const x = parseFloat(val('ao_sin'));
    if (sg && isFinite(x)) {
      R.dueno = { ref: aoSegRef(sg), ida: aoSegIda(sg, x), dil: aoSegDil(sg, x), grado: aoSegGrado(sg, x) };
    }
  } catch (e) { R.dueno = 'ERR ' + String(e).slice(0, 60) }
  return R;
}

async function main() {
  const nav = await chromium.launch({ channel: 'chrome' });
  const OUTJ = { archivo: FILE };
  try {
    for (const nom of Object.keys(ESC)) {
      const ctx = await nav.newContext({ viewport: { width: 1440, height: 1000 } });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
      try {
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
        await pg.evaluate(MONTAR, ESC[nom], { timeout: 60000 });
        await pg.waitForTimeout(350);
        const r = await pg.evaluate(MEDIR, { timeout: 60000 });
        r._errores = errs.length; r._erroresTxt = errs.slice(0, 2);
        OUTJ[nom] = r;
        console.error('-- ' + nom + ' medida (ao_sin=' + r.ao_sin + ' marfan=' + r.marfan_ao_seno + ') --');
      } catch (e) { OUTJ[nom] = { ERROR: String(e).slice(0, 200) } }
      await ctx.close();
    }
  } finally { await nav.close() }
  fs.writeFileSync(OUT, JSON.stringify(OUTJ, null, 1));
  console.log('ESCRITO ' + OUT + ' con ' + (Object.keys(OUTJ).length - 1) + ' escenas');
  console.log('CIERRE_OK');
}
main().catch(e => { console.log('ERROR ' + String(e).slice(0, 200)); console.log('CIERRE_OK'); process.exit(1) });
