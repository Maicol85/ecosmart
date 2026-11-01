#!/usr/bin/env node
/**
 * _probe_popc_z.mjs - el Z de la raiz aortica calculado (POP-C, commit 2b).
 *
 * Compara, caso por caso, el Z que la app calcula contra la cuenta hecha A MANO desde la
 * ecuacion leida en imagen en Devereux 2012 (Tabla 1, hoja 13 del manuscrito):
 *     raiz (cm) = 2.423 + 0.090 x (edad/10) + 0.461 x BSA_DuBois - 0.267 x sexo  [1=M, 2=F]
 *     Z = (observado_cm - predicho_cm) / 0.261
 *     BSA (m2) = 0.007184 x talla^0.725 x peso^0.425
 * y mide la pantalla: el valor, el boton, la nota del metodo, el limite de edad, los
 * faltantes, que el manual gana y que el calculado NO se guarda ni llega al papel.
 *
 *   node scripts/_probe_popc_z.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

/* ── LAS CUENTAS A MANO, hechas aca y no dentro de la pagina: si las hiciera la app, el caso
   compararia la implementacion contra si misma. ── */
const bsaDuBois = (peso, talla) => 0.007184 * Math.pow(talla, 0.725) * Math.pow(peso, 0.425);
const zMano = (edad, sexo, peso, talla, mm) => {
  const bsa = bsaDuBois(peso, talla);
  const pred = 2.423 + 0.090 * (edad / 10) + 0.461 * bsa - 0.267 * (sexo === 'M' ? 1 : 2);
  return { bsa, pred, z: (mm / 10 - pred) / 0.261 };
};

/* Los tres casos que la orden pide: un hombre, una mujer y el borde de la edad minima. */
const CASOS = [
  { n: 'hombre 40 anos',     edad: 40, sexo: 'M', peso: 70, talla: 170, mm: 38 },
  { n: 'mujer 55 anos',      edad: 55, sexo: 'F', peso: 62, talla: 160, mm: 36 },
  { n: 'borde 15 anos (M)',  edad: 15, sexo: 'M', peso: 55, talla: 165, mm: 30 },
  { n: 'por debajo: 14 (M)', edad: 14, sexo: 'M', peso: 55, talla: 165, mm: 30, sinZ: true }
];

const CUERPO = `(async (CASOS) => {
  const R = { errs: [], casos: [], pant: {}, papel: {} };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const W = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return }
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})) };
  const txt = id => { const e = EL(id); return e ? String(e.textContent || '') : 'NO EXISTE' };

  /* La seccion de aortopatia, abierta por su boton real: sin eso la tarjeta no tiene caja. */
  const bt = bq('showTab(' + Q + 'congenitas'); if (bt) bt.click(); await W(300);
  const bt2 = bq('showTab(' + Q + 'congenitas2'); if (bt2) bt2.click(); await W(300);
  const ba = bq('toggleCard(' + Q + 'marfan'); if (ba) ba.click(); await W(400);
  R.pant.hayCampoManual = !!EL('mfs_z_raiz');
  R.pant.hayFilaCalc    = !!EL('mfs-zcalc-val');
  R.pant.hayBoton       = !!EL('mfs-zcalc-btn');

  for (const c of CASOS) {
    S('edad', String(c.edad)); S('sexo', c.sexo);
    S('peso', String(c.peso)); S('talla', String(c.talla));
    S('ao_sin', String(c.mm));
    const m = EL('mfs_z_raiz'); if (m) { m.value = ''; m.dispatchEvent(new Event('input',{bubbles:true})) }
    S('marfan_sindrome', 'marfan');
    await W(500);
    const calc = (typeof mfsZCalc === 'function') ? mfsZCalc(null) : null;
    R.casos.push({ n: c.n,
      zApp: calc && calc.z != null ? calc.z : null,
      bsaApp: calc && calc.bsa != null ? calc.bsa : null,
      predApp: calc && calc.pred != null ? calc.pred : null,
      menor: !!(calc && calc.menor), falta: (calc && calc.falta) || [],
      zEfectivo: (typeof mfsZ === 'function') ? mfsZ(null) : 'NO EXISTE',
      pantVal: txt('mfs-zcalc-val'), pantNota: txt('mfs-zcalc-nota'),
      botonVisible: (() => { const b = EL('mfs-zcalc-btn');
        return b ? (b.style.display !== 'none' && !b.disabled) : 'NO EXISTE' })() });
  }

  /* ── EL BOTON: la unica puerta. Se vuelve al primer caso y se toca de verdad. ── */
  const c0 = CASOS[0];
  S('edad', String(c0.edad)); S('sexo', c0.sexo); S('peso', String(c0.peso));
  S('talla', String(c0.talla)); S('ao_sin', String(c0.mm));
  { const m = EL('mfs_z_raiz'); if (m) { m.value = ''; m.dispatchEvent(new Event('input',{bubbles:true})) } }
  await W(500);
  R.pant.manualAntes = (EL('mfs_z_raiz') || {}).value;
  const bz = EL('mfs-zcalc-btn'); if (bz) bz.click(); await W(400);
  R.pant.manualDespues = (EL('mfs_z_raiz') || {}).value;
  R.pant.notaConManual = txt('mfs-zcalc-nota');

  /* ── EL MANUAL GANA: se escribe otro valor y se mira el efectivo. ── */
  S('mfs_z_raiz', '3.5'); await W(500);
  R.pant.zEfectivoConManual = (typeof mfsZ === 'function') ? mfsZ(null) : 'NO EXISTE';
  R.pant.zCalcSigueSiendo = (typeof mfsZCalc === 'function') ? (mfsZCalc(null) || {}).z : null;

  /* ── NO SE GUARDA: el calculado no deja rastro en ningun campo del estudio. ── */
  { const m = EL('mfs_z_raiz'); if (m) { m.value = ''; m.dispatchEvent(new Event('input',{bubbles:true})) } }
  await W(600);
  /* Y un barrido completo de espejos, que es donde un pintor indebido escribiria. */
  try { if (typeof _espejosBarrerTodos === 'function') _espejosBarrerTodos() } catch (e) {}
  await W(400);
  R.pant.manualTrasBarrido = (EL('mfs_z_raiz') || {}).value;
  const campos = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
    if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
    campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
  });
  R.pant.nCampos = Object.keys(campos).length;
  R.pant.camposConZ = Object.keys(campos).filter(k => /zcalc/i.test(k)).join(',') || '(ninguno)';

  /* ── NO LLEGA AL PAPEL: informe y EN SUMA con el modulo integrado y sin manual. ── */
  { const ch = EL('marfan_incluir_chk');
    if (ch && !ch.checked && typeof eteInclToggle === 'function') eteInclToggle('marfan_incluir_chk') }
  await W(400);
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) { R.errs.push('informe ' + e.message) }
  await W(700);
  const inf = String((EL('informe_texto') || {}).value || '');
  const sum = String((EL('en_suma') || {}).value || '');
  const zc = (typeof mfsZCalc === 'function') ? (mfsZCalc(null) || {}).z : null;
  const zs = zc == null ? 'XXX' : zc.toFixed(2);
  R.papel = { largoInforme: inf.length, largoSuma: sum.length,
    informeTraeZ: (inf.match(/\\bZ\\b/g) || []).length,
    informeTraeElValor: zc == null ? 'n/a' : (inf.indexOf(zs) >= 0),
    sumaTraeElValor: zc == null ? 'n/a' : (sum.indexOf(zs) >= 0),
    informeTraeDevereux: /devereux/i.test(inf), informeTraeDuBois: /dubois/i.test(inf) };
  return R;
})`;

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  let R;
  try {
    R = await Promise.race([
      pg.evaluate(new Function('return ' + CUERPO)(), CASOS),
      new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT 150s')), 150000))
    ]);
  } catch (e) { console.log('FALLO:', e.message); await b.close(); process.exit(1) }

  console.log('===== EL Z DE LA RAIZ CALCULADO (POP-C 2b) =====');
  console.log('archivo:', FILE);
  console.log('denominador:', JSON.stringify(R.pant.hayCampoManual) + ' campo manual, '
    + JSON.stringify(R.pant.hayFilaCalc) + ' fila del calculado, '
    + JSON.stringify(R.pant.hayBoton) + ' boton');
  console.log('');
  console.log('caso                 | BSA mano | BSA app  | pred mano | pred app | Z mano  | Z app   | coincide');
  console.log('---------------------|----------|----------|-----------|----------|---------|---------|---------');
  let malos = 0;
  for (let i = 0; i < CASOS.length; i++) {
    const c = CASOS[i], a = R.casos[i];
    if (c.sinZ) {
      const ok = a.zApp === null && a.menor === true;
      if (!ok) malos++;
      console.log(c.n.padEnd(20) + ' | ' + '(no se calcula por debajo de 15)'.padEnd(55)
        + ' | ' + (ok ? 'SI' : '** NO **') + '  app=' + JSON.stringify(a.zApp) + ' menor=' + a.menor);
      continue;
    }
    const m = zMano(c.edad, c.sexo, c.peso, c.talla, c.mm);
    const dz = a.zApp == null ? 99 : Math.abs(a.zApp - m.z);
    const ok = dz < 1e-9;
    if (!ok) malos++;
    console.log([c.n.padEnd(20), m.bsa.toFixed(4).padStart(8), (a.bsaApp == null ? '-' : a.bsaApp.toFixed(4)).padStart(8),
      m.pred.toFixed(4).padStart(9), (a.predApp == null ? '-' : a.predApp.toFixed(4)).padStart(8),
      m.z.toFixed(4).padStart(7), (a.zApp == null ? '-' : a.zApp.toFixed(4)).padStart(7),
      ok ? 'SI' : '** NO ** d=' + dz].join(' | '));
  }
  console.log('');
  console.log('===== LA PANTALLA, CASO POR CASO =====');
  R.casos.forEach((a, i) => {
    console.log('- ' + CASOS[i].n + ':');
    console.log('    valor   : ' + a.pantVal);
    console.log('    boton   : ' + a.botonVisible);
    console.log('    nota    : ' + String(a.pantNota).slice(0, 170));
    console.log('    efectivo: ' + a.zEfectivo + '   falta=' + JSON.stringify(a.falta));
  });
  console.log('');
  console.log('===== EL BOTON, EL MANUAL Y LO QUE NO SE GUARDA =====');
  console.log(JSON.stringify(R.pant, null, 1));
  console.log('');
  console.log('===== EL PAPEL =====');
  console.log(JSON.stringify(R.papel, null, 1));
  if (R.errs.length) console.log('\nERRS SONDA:', R.errs.join(' ; '));
  console.log('\nerrores de pagina: ' + errs.length + (errs.length ? ' -> ' + errs.slice(0, 5).join(' ; ') : ''));
  console.log('\nRESULTADO cuentas: ' + (CASOS.length - malos) + '/' + CASOS.length + (malos ? '  ** HAY DIFERENCIAS **' : '  todas coinciden'));
  await b.close();
  process.exit(0);
})();
