#!/usr/bin/env node
/** _ab_r2diff.mjs - compara dos volcados de `_probe_r2ab.mjs` y lista las diferencias UNA POR UNA. */
const fs = await import('fs');
const A = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const B = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const CORTE = Number(process.argv[4] || 220);
let n = 0;
/* Solo las escenas que estan en los DOS lados: con una medida en un solo archivo, el
   comparador listaba TODAS sus claves como diferencias —un denominador roto con pinta de
   medicion buena—. Las que falten se informan aparte. */
const esc = Object.keys(A).filter(k => k[0] !== '_' && k !== 'archivo' && B[k]);
const faltan = Object.keys(A).filter(k => k[0] !== '_' && k !== 'archivo' && !B[k])
  .concat(Object.keys(B).filter(k => k[0] !== '_' && k !== 'archivo' && !A[k]));
if (faltan.length) console.log('(escenas en un solo lado, NO comparadas: ' + faltan.join(',') + ')');
for (const e of esc) {
  const a = A[e] || {}, b = B[e] || {};
  const claves = Array.from(new Set(Object.keys(a).concat(Object.keys(b))));
  for (const k of claves) {
    if (k === '_campos' || k === '_excel' || k === '_pdf') continue;
    const va = JSON.stringify(a[k]), vb = JSON.stringify(b[k]);
    if (va !== vb) { n++; console.log('[' + e + '] ' + k);
      console.log('    A: ' + String(va).slice(0, CORTE));
      console.log('    B: ' + String(vb).slice(0, CORTE)); }
  }
  /* El EXCEL, clave por clave. */
  const xa = a._excel || {}, xb = b._excel || {};
  const kx = Array.from(new Set(Object.keys(xa).concat(Object.keys(xb))));
  for (const k of kx) {
    if (JSON.stringify(xa[k]) !== JSON.stringify(xb[k])) { n++;
      console.log('[' + e + '] EXCEL col ' + JSON.stringify(k));
      console.log('    A: ' + String(JSON.stringify(xa[k])).slice(0, CORTE));
      console.log('    B: ' + String(JSON.stringify(xb[k])).slice(0, CORTE)); }
  }
  /* Los CAMPOS del estudio, clave por clave. */
  const ca = a._campos || {}, cb = b._campos || {};
  const kc = Array.from(new Set(Object.keys(ca).concat(Object.keys(cb))));
  for (const k of kc) {
    if (JSON.stringify(ca[k]) !== JSON.stringify(cb[k])) { n++;
      console.log('[' + e + '] CAMPO ' + k + '   A=' + JSON.stringify(ca[k]) + '  B=' + JSON.stringify(cb[k])); }
  }
  /* El PDF, plantilla por plantilla. */
  const pa = a._pdf || {}, pb = b._pdf || {};
  for (const p of Array.from(new Set(Object.keys(pa).concat(Object.keys(pb))))) {
    const ra = pa[p] || {}, rb = pb[p] || {};
    if (ra.n !== rb.n || ra.figs !== rb.figs) { n++;
      console.log('[' + e + '] PDF ' + p + '  nTextos A=' + ra.n + ' B=' + rb.n + ' | figs A=' + ra.figs + ' B=' + rb.figs); }
    const ta = String(ra.txt || '').split(' | '), tb = String(rb.txt || '').split(' | ');
    const soloA = ta.filter(x => tb.indexOf(x) < 0), soloB = tb.filter(x => ta.indexOf(x) < 0);
    if (soloA.length || soloB.length) { n++;
      console.log('[' + e + '] PDF ' + p + ' textos distintos: soloA=' + soloA.length + ' soloB=' + soloB.length);
      soloA.slice(0, 6).forEach(x => console.log('      solo A: ' + x.slice(0, 150)));
      soloB.slice(0, 6).forEach(x => console.log('      solo B: ' + x.slice(0, 150))); }
  }
}
console.log('=== TOTAL DIFERENCIAS: ' + n + ' (A=' + A.archivo + ' B=' + B.archivo + ') ===');
