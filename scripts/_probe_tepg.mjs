#!/usr/bin/env node
/**
 * _probe_tepg.mjs - la sonda de la tanda TEP (cortes AHA/ACC 2026), 2026-10-28.
 *
 * A/B de SOLO LECTURA: con --file se corre contra una copia de HEAD y se comparan las salidas.
 * Mide lo RENDERIZADO, nunca el valor de retorno de un predicado.
 *
 *   node scripts/_probe_tepg.mjs --solo bordes
 *   node scripts/_probe_tepg.mjs --solo bordes --file /tmp/head.html
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates, y sin \s ni \n (se cocinan).
 */
const CANDIDATAS = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
                    '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2); }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const SOLO = (arg('--solo') || 'bordes,ctrl').split(',').map(s => s.trim());
const OUT = {};
const hay = (g) => SOLO.indexOf(g) > -1;

const PRELUDIO = '(() => {' +
  " ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);" +
  '   if (m) m.style.display = String.fromCharCode(110,111,110,101) });' +
  " if (typeof showTab === 'function') { try { showTab('hemodinamica') } catch (e) {} }" +
  " const s = document.getElementById('tep-seccion'); if (s) s.style.display = '';" +
  ' return true })()';

const AYUD = 'window.__p = (function(){' +
  " const T = id => { const e = document.getElementById(id); return e ? (e.textContent || '').trim() : 'NO EXISTE' };" +
  " const set = (id, val) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;" +
  '   e.value = val;' +
  "   e.dispatchEvent(new Event('input', {bubbles:true}));" +
  "   e.dispatchEvent(new Event('change', {bubbles:true}));" +
  '   return e.value };' +
  ' const limpiar = () => { try { limpiarCampos() } catch(e){} };' +
  ' return { T:T, set:set, limpiar:limpiar } })(); true';

/* ══ BORDES: lo que el 1c pide medir antes y despues ════════════════════════════════════
   DENOMINADOR: cada escena confirma que la capsula escribio algo (no '-') antes de que su
   veredicto cuente. Una escena que no llega a calcTEP devuelve el guion y se leeria como
   "no es dilatacion", que es indistinguible de "no se midio". */
const BORDES = '(() => {' +
  ' const C = CASO;' +
  ' __p.limpiar();' +
  " ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);" +
  '   if (m) m.style.display = String.fromCharCode(110,111,110,101) });' +
  ' Object.keys(C.campos || {}).forEach(k => __p.set(k, C.campos[k]));' +
  " try { if (typeof calcPmAD === 'function') calcPmAD() } catch(e){}" +
  " try { if (typeof calcPSAP === 'function') calcPSAP() } catch(e){}" +
  ' try { calcTEP() } catch(e){}' +
  " try { if (typeof amiloIntegrar === 'function' && typeof amiloIntegrado === 'function' &&" +
  "           !amiloIntegrado('tep')) amiloIntegrar('tep') } catch(e){}" +
  ' try { generarInforme() } catch(e){}' +
  " const inf = (document.getElementById('informe_texto') || {}).value || '';" +
  " const sum = (document.getElementById('en_suma') || {}).value || '';" +
  /* ⚠️ EL FILTRO BUSCABA SOLO 'sobrecarga VD aguda', QUE ES LA RAMA DE «criterios incompletos».
     Las escenas cargadas pasan esa compuerta y emiten la OTRA frase, asi que la linea salia
     vacia en todas ellas y el unico que la tenia era el control negativo: el A/B daba «sin
     diferencias» sobre un denominador de cero. Hoy se buscan las DOS ramas. */
  " const _F = l => l.indexOf('sobrecarga del ventr') > -1 || l.indexOf('sobrecarga VD aguda') > -1;" +
  " const lin = inf.split(String.fromCharCode(10)).filter(_F);" +
  " const sumL = sum.split(String.fromCharCode(10)).filter(l => l.indexOf('TEP') > -1 || l.indexOf('ventr') > -1);" +
  " let hoja = ''; try { hoja = (typeof amiloTextoTEP === 'function') ? amiloTextoTEP() : 'SIN FN' } catch(e){ hoja = 'EXC' }" +
  ' return {' +
  "   vdvi: __p.T('tep-vdvi-interp')," +
  "   tapse: __p.T('tep-tapse-interp')," +
  "   score: __p.T('tep-score')," +
  "   interp: __p.T('tep-interpretacion')," +
  "   mcc: __p.T('tep-mcconnell-interp')," +
  '   DENOM_vdvi: __p.T(String.fromCharCode(116,101,112,45,118,100,118,105,45,105,110,116,101,114,112)).length > 1,' +
  "   DENOM_tapse: __p.T('tep-tapse-interp').length > 1," +
  "   infLinea: lin.join(' // ')," +
  "   DENOM_inf: lin.length," +
  "   sumLinea: sumL.join(' // ')," +
  "   hojaSalvedad: hoja.indexOf('Salvedad') > -1," +
  "   hojaVdvi: (hoja.split(String.fromCharCode(10)).filter(l => l.indexOf('Relacion VD/VI') === 0 || l.indexOf(String.fromCharCode(82,101,108,97,99,105,243,110)) === 0)[0] || '')," +
  '   hojaLen: hoja.length' +
  ' } })()';

/* ══ CONTROLES: lo que esta tanda NO toca ══════════════════════════════════════════════ */
const CTRL = '(() => {' +
  ' __p.limpiar();' +
  ' const C = CASO;' +
  ' Object.keys(C.campos || {}).forEach(k => __p.set(k, C.campos[k]));' +
  " ['calcPmAD','calcPSAP','calcVD','calcHTP2022','calcDiastol','popPocusSync','popEsquema']" +
  "   .forEach(f => { try { if (typeof window[f] === 'function') window[f]() } catch(e){} });" +
  ' const R = {};' +
  " ['tapse-interp','sprime-interp','vd-vi-interp','htp2022-prob','htp2022-catA','htp2022-catB'," +
  "  'htp2022-catC','pop-pocus-vd','vd-tam','ad-interp'].forEach(id => {" +
  "    const e = document.getElementById(id); R[id] = e ? (e.textContent || '').trim().slice(0,300) : 'NO EXISTE' });" +
  " try { R.popPatron = (typeof popPatron === 'function') ? JSON.stringify(popPatron()).slice(0,1400) : 'SIN FN' } catch(e){ R.popPatron = 'EXC' }" +
  ' try {' +
  '   const campos = {};' +
  "   Array.prototype.forEach.call(document.querySelectorAll('input[id],select[id],textarea[id]')," +
  "     e => { if (e.type !== 'button' && e.id) campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : e.value });" +
  "   const fila = (typeof _labExcelRow === 'function') ? _labExcelRow({ campos: campos, fecha: '2026-10-28' }) : null;" +
  "   R.excelN = fila ? Object.keys(fila).length : 'SIN FN';" +
  "   R.excelFila = fila ? JSON.stringify(fila) : 'SIN FN';" +
  " } catch(e){ R.excelN = 'EXC'; R.excelFila = 'EXC' }" +
  " ['_labDiastGrado','_labGeomCat','_labDisfSistVent'].forEach(fn => {" +
  "   try { R[fn] = (typeof window[fn] === 'function') ? JSON.stringify(window[fn]('')) : 'SIN FN' } catch(e){ R[fn] = 'EXC' } });" +
  ' return R })()';

async function corre(nombre, abrir) {
  const b = await abrir();
  const R = {};
  try {
    const pg = await b.newPage({ viewport: { width: 1200, height: 700 } });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
    await pg.evaluate(PRELUDIO);
    await pg.evaluate(AYUD);
    if (hay('bordes')) {
      R.bordes = {};
      for (const c of BORDE_ESC) {
        try { R.bordes[c.k] = await pg.evaluate(BORDES.replace('CASO', JSON.stringify(c)), { timeout: 60000 }); }
        catch (e) { R.bordes[c.k] = { ERROR: String(e).slice(0, 200) }; }
      }
    }
    if (hay('ctrl')) {
      R.ctrl = {};
      for (const c of CTRL_ESC) {
        try { R.ctrl[c.k] = await pg.evaluate(CTRL.replace('CASO', JSON.stringify(c)), { timeout: 60000 }); }
        catch (e) { R.ctrl[c.k] = { ERROR: String(e).slice(0, 200) }; }
      }
    }
  } finally { await b.close(); }
  OUT[nombre] = R;
}

/* Base clinica comun: McConnell y 60/60 contestados para que la seccion no salga por su
   compuerta de "criterios incompletos", y PSAP derivada de la VRT. */
const BASE = { vmax_it: '3.8', vci_diam: '18', vci_col: '>50',
               tep_mcconnell: 'si', tep_signo6060: 'no', tep_tabique_d: 'no',
               nombre: 'Borde', ci: '9999', peso: '80', talla: '172' };
const mk = (k, campos) => ({ k: k, campos: Object.assign({}, BASE, campos) });
const BORDE_ESC = [
  /* TAPSE: el 16 y el 17 cambian de lado con el corte nuevo; el 18 es control negativo. */
  mk('tapse_16',   { tapse: '16',   tep_vdvi: '0.7' }),
  mk('tapse_169',  { tapse: '16.9', tep_vdvi: '0.7' }),
  mk('tapse_17',   { tapse: '17',   tep_vdvi: '0.7' }),
  mk('tapse_18',   { tapse: '18',   tep_vdvi: '0.7' }),
  /* VD/VI: el 0,9 exacto NO es dilatacion; el 0,91 y el 1,0 SI. El 0,7 es control negativo. */
  mk('vdvi_070',   { tapse: '22', tep_vdvi: '0.7' }),
  mk('vdvi_090',   { tapse: '22', tep_vdvi: '0.90' }),
  mk('vdvi_091',   { tapse: '22', tep_vdvi: '0.91' }),
  mk('vdvi_100',   { tapse: '22', tep_vdvi: '1.00' }),
  mk('vdvi_120',   { tapse: '22', tep_vdvi: '1.20' }),
  /* Control negativo de escena: sin un solo dato del modulo. */
  { k: 'ajeno', campos: { nombre: 'Borde', ci: '9999', peso: '80', talla: '172',
                          fevi: '45', ddfvi: '58', ai_vol: '98', im_grado: '2' } }
];
const CTRL_ESC = [
  { k: 'vacio', campos: {} },
  /* El VD/VI de la PROBABILIDAD DE HTP (campo vd_vi, corte 1,0 con >) en sus tres bordes. */
  { k: 'htp_vdvi_090', campos: { vd_vi: '0.90', tapse: '16.5', s_prime: '9', vd_bas: '45',
      ad_area: '20', vci_diam: '23', vci_col: '<50', vmax_it: '3.2', ddfvi: '48' } },
  { k: 'htp_vdvi_100', campos: { vd_vi: '1.00', tapse: '16.5', s_prime: '9', vd_bas: '45',
      ad_area: '20', vci_diam: '23', vci_col: '<50', vmax_it: '3.2', ddfvi: '48' } },
  { k: 'htp_vdvi_101', campos: { vd_vi: '1.01', tapse: '16.5', s_prime: '9', vd_bas: '45',
      ad_area: '20', vci_diam: '23', vci_col: '<50', vmax_it: '3.2', ddfvi: '48' } },
  /* El POCUS y el patron del posoperatorio en la banda que el medico autorizo a mover. */
  { k: 'pop_vdvi_090', campos: { tep_vdvi: '0.90', tapse: '14', hemo_ic: '1.9', hemo_pcp: '22' } },
  { k: 'pop_vdvi_095', campos: { tep_vdvi: '0.95', tapse: '14', hemo_ic: '1.9', hemo_pcp: '22' } },
  { k: 'pop_vdvi_105', campos: { tep_vdvi: '1.05', tapse: '14', hemo_ic: '1.9', hemo_pcp: '22' } }
];

await corre('chrome', () => chromium.launch({ channel: 'chrome' }));
console.log('===== TOTAL =====');
console.log(JSON.stringify(OUT, null, 1));
