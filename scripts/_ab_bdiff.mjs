#!/usr/bin/env node
/** _ab_bdiff.mjs - compara dos volcados de _probe_aab.mjs y PARTE las diferencias en dos:
 *
 *   A · SUPERFICIES FIRMADAS Y DE CALCULO  -> tienen que ser CERO.
 *       informe en los tres estilos, EN SUMA, las 440 columnas de Excel clave por clave, los
 *       campos del estudio, el Laboratorio por sus ocho funciones dueñas, las capsulas de
 *       pantalla, el PDF en sus seis plantillas y el PPT.
 *   B · PANTALLA -> la tanda B NO toca el panel de Evidencia, asi que lo unico que puede salir
 *       aca son los TRES nodos `_pant_` de la PAM. Si TAMBIEN salieran cero, la sonda no
 *       estaria mirando lo que se toco (control del propio instrumento).
 *
 *   node scripts/_ab_bdiff.mjs ab_head.json ab_nuevo.json
 */
const fs = await import('fs');
const A = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const B = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const CORTE = Number(process.argv[4] || 240);
const esPanel = k => /^_ev/.test(k) || /^_ficha_/.test(k) || k === '_manualSello' || /^_pant_/.test(k);
const esc = Object.keys(A).filter(k => k[0] !== '_' && k !== 'archivo' && B[k]);
const faltan = Object.keys(A).filter(k => k[0] !== '_' && k !== 'archivo' && !B[k])
  .concat(Object.keys(B).filter(k => k[0] !== '_' && k !== 'archivo' && !A[k]));
if (faltan.length) console.log('(escenas en un solo lado, NO comparadas: ' + faltan.join(',') + ')');
console.log('escenas comparadas: ' + esc.length + ' -> ' + esc.join(','));

let nF = 0, nP = 0;
const firm = [], pane = [];
for (const e of esc) {
  const a = A[e] || {}, b = B[e] || {};
  for (const k of Array.from(new Set(Object.keys(a).concat(Object.keys(b))))) {
    if (k === '_campos' || k === '_excel' || k === '_pdf' || k === '_ppt') continue;
    const va = JSON.stringify(a[k]), vb = JSON.stringify(b[k]);
    if (va === vb) continue;
    const dest = esPanel(k) ? pane : firm;
    if (esPanel(k)) nP++; else nF++;
    dest.push('[' + e + '] ' + k + '\n    HEAD: ' + String(va).slice(0, CORTE)
                                 + '\n    NUEVO: ' + String(vb).slice(0, CORTE));
  }
  /* El EXCEL, clave por clave: 440 columnas. */
  const xa = a._excel || {}, xb = b._excel || {};
  for (const k of Array.from(new Set(Object.keys(xa).concat(Object.keys(xb))))) {
    if (JSON.stringify(xa[k]) !== JSON.stringify(xb[k])) { nF++;
      firm.push('[' + e + '] EXCEL col ' + JSON.stringify(k)
        + '\n    HEAD: ' + String(JSON.stringify(xa[k])).slice(0, CORTE)
        + '\n    NUEVO: ' + String(JSON.stringify(xb[k])).slice(0, CORTE)); }
  }
  /* Los CAMPOS del estudio, clave por clave. */
  const ca = a._campos || {}, cb = b._campos || {};
  for (const k of Array.from(new Set(Object.keys(ca).concat(Object.keys(cb))))) {
    if (JSON.stringify(ca[k]) !== JSON.stringify(cb[k])) { nF++;
      firm.push('[' + e + '] CAMPO ' + k + '  HEAD=' + JSON.stringify(ca[k]) + '  NUEVO=' + JSON.stringify(cb[k])); }
  }
  /* El PDF, plantilla por plantilla: numero de textos, figuras y los textos distintos. */
  const pa = a._pdf || {}, pb = b._pdf || {};
  for (const p of Array.from(new Set(Object.keys(pa).concat(Object.keys(pb))))) {
    const ra = pa[p] || {}, rb = pb[p] || {};
    if (ra.n !== rb.n || ra.figs !== rb.figs) { nF++;
      firm.push('[' + e + '] PDF ' + p + '  nTextos HEAD=' + ra.n + ' NUEVO=' + rb.n
        + ' | figuras HEAD=' + ra.figs + ' NUEVO=' + rb.figs); }
    const ta = String(ra.txt || '').split(' | '), tb = String(rb.txt || '').split(' | ');
    const soloA = ta.filter(x => tb.indexOf(x) < 0), soloB = tb.filter(x => ta.indexOf(x) < 0);
    if (soloA.length || soloB.length) { nF++;
      firm.push('[' + e + '] PDF ' + p + ' textos distintos: soloHEAD=' + soloA.length
        + ' soloNUEVO=' + soloB.length + '\n    soloHEAD: ' + soloA.join(' / ').slice(0, CORTE)
        + '\n    soloNUEVO: ' + soloB.join(' / ').slice(0, CORTE)); }
  }
  /* El PPT. */
  const qa = a._ppt || {}, qb = b._ppt || {};
  if (qa.slides !== qb.slides || qa.n !== qb.n || qa.txt !== qb.txt) { nF++;
    const ta = String(qa.txt || '').split(' | '), tb = String(qb.txt || '').split(' | ');
    const soloA = ta.filter(x => tb.indexOf(x) < 0), soloB = tb.filter(x => ta.indexOf(x) < 0);
    firm.push('[' + e + '] PPT  diapositivas HEAD=' + qa.slides + ' NUEVO=' + qb.slides
      + ' | textos HEAD=' + qa.n + ' NUEVO=' + qb.n
      + '\n    soloHEAD: ' + soloA.join(' / ').slice(0, CORTE)
      + '\n    soloNUEVO: ' + soloB.join(' / ').slice(0, CORTE)); }
}
/* ── DENOMINADORES: sin esto, «cero diferencias» no distingue «nada cambio» de «no medi nada». */
const den = esc.map(e => e + ': excel=' + (A[e]._excelN) + ' campos=' + (A[e]._camposN)
  + ' pdf=' + Object.keys(A[e]._pdf || {}).length + ' pptTextos=' + ((A[e]._ppt || {}).n)
  + ' evSecciones=' + (A[e]._evN) + ' evCompactas=' + (A[e]._evCompactas)).join('\n  ');
console.log('\nDENOMINADORES (lado HEAD):\n  ' + den);
console.log('\n══ A · SUPERFICIES FIRMADAS Y DE CALCULO: ' + nF + ' diferencia(s) ══');
firm.forEach(x => console.log('  ' + x));
if (!nF) console.log('  (cero, que es lo que esta tanda exige)');
console.log('\n══ B · PANTALLA DE EVIDENCIA Y FICHAS: ' + nP + ' diferencia(s) ══');
console.log('  (si esto fuera cero, la sonda no estaria mirando lo que la tanda toco)');
pane.forEach(x => console.log('  ' + x));
process.exitCode = nF ? 1 : 0;
