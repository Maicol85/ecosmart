#!/usr/bin/env node
/**
 * _ab_popdiff.mjs - compara dos volcados de `_probe_popab.mjs` y lista las diferencias
 * separando SUPERFICIE FIRMADA de PANTALLA. Calcado de `_ab_bdiff.mjs`.
 *
 * El denominador se imprime SIEMPRE: cuantas escenas, cuantas claves y cuantas columnas de
 * Excel se compararon. Sin el, un «cero diferencias» no se distingue de «la sonda no mira nada».
 *
 *   node scripts/_ab_popdiff.mjs /tmp/ab_pop_head.json /tmp/ab_pop_nuevo.json
 */
import fs from 'fs';
const [A, B] = process.argv.slice(2);
const a = JSON.parse(fs.readFileSync(A, 'utf8')), b = JSON.parse(fs.readFileSync(B, 'utf8'));
const corta = (s, n) => { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) + '…' : s };

const FIRMADA = (k) => /^informe_|^suma_|^_excel|^_campos|^lab_|^_pdf$|^_ppt$/.test(k);
const escenas = Object.keys(a).filter(k => k !== 'archivo' && k !== '_err' && k !== '_pageErr'
                                        && a[k] && typeof a[k] === 'object');
let nF = 0, nP = 0, nCl = 0, nEx = 0;
const difF = [], difP = [];
for (const e of escenas) {
  if (!b[e]) { difF.push([e, '(escena ausente del lado B)', '', '']); continue }
  const claves = new Set([...Object.keys(a[e]), ...Object.keys(b[e])]);
  for (const k of claves) {
    if (k === '_campos') {
      const ca = a[e][k] || {}, cb = b[e][k] || {};
      const todas = new Set([...Object.keys(ca), ...Object.keys(cb)]);
      nCl += todas.size;
      for (const c of todas) if (String(ca[c]) !== String(cb[c]))
        difF.push([e, 'campo:' + c, corta(ca[c], 60), corta(cb[c], 60)]);
      continue;
    }
    if (k === '_excel') {
      const xa = a[e][k] || {}, xb = b[e][k] || {};
      const todas = new Set([...Object.keys(xa), ...Object.keys(xb)]);
      nEx += todas.size;
      for (const c of todas) if (String(xa[c]) !== String(xb[c]))
        difF.push([e, 'excel:' + c, corta(xa[c], 60), corta(xb[c], 60)]);
      continue;
    }
    const va = JSON.stringify(a[e][k]), vb = JSON.stringify(b[e][k]);
    nCl++;
    if (va === vb) continue;
    (FIRMADA(k) ? difF : difP).push([e, k, corta(a[e][k] && a[e][k].txt ? a[e][k].txt : a[e][k], 220),
                                            corta(b[e][k] && b[e][k].txt ? b[e][k].txt : b[e][k], 220)]);
  }
}
const vuelca = (t, L) => {
  console.log('\n═══ ' + t + ' — ' + L.length + ' diferencia(s) ═══');
  for (const [e, k, x, y] of L) { console.log('  · [' + e + '] ' + k); console.log('      HEAD : ' + x); console.log('      NUEVO: ' + y) }
};
console.log('DENOMINADOR: ' + escenas.length + ' escenas · ' + nCl + ' claves comparadas · '
          + nEx + ' celdas de Excel · ' + nCl + ' campos');
vuelca('SUPERFICIE FIRMADA (informe, EN SUMA, Excel, campos, Laboratorio, PDF, PPT)', difF);
vuelca('PANTALLA', difP);
console.log('\nRESULTADO firmadas=' + difF.length + ' pantalla=' + difP.length);
