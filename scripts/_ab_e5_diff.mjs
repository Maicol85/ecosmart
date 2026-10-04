#!/usr/bin/env node
/* Diff de dos corridas de _ab_e5.mjs. Uso: node _ab_e5_diff.mjs orig.json cur.json */
import { readFile } from 'node:fs/promises';
const [a, b] = process.argv.slice(2);
const A = JSON.parse(await readFile(a, 'utf8'));
const B = JSON.parse(await readFile(b, 'utf8'));
const byId = s => Object.fromEntries(s.escenas.map(e => [e.id, e]));
const OA = byId(A), OB = byId(B);
const ids = [...new Set([...Object.keys(OA), ...Object.keys(OB)])];

function excelKeys(x) {
  if (Array.isArray(x)) return x.map((_, i) => i);
  if (x && typeof x === 'object') return Object.keys(x);
  return [];
}
let totalDiffs = 0;
for (const id of ids) {
  const ea = OA[id], eb = OB[id];
  if (!ea || !eb) { console.log(`\n### ${id}: FALTA EN UN LADO`); totalDiffs++; continue; }
  const diffs = [];
  // Informe + EN SUMA
  for (const k of ['conciso','estandar','narrativo','suma','pills_pulmonar']) {
    if (String(ea[k]) !== String(eb[k])) diffs.push({ campo:k, orig:ea[k], cur:eb[k] });
  }
  // Excel (434 columnas)
  const xa = ea.excel, xb = eb.excel;
  const ka = excelKeys(xa), kb = excelKeys(xb);
  if (ka.length !== kb.length) diffs.push({ campo:'__excel_len__', orig:ka.length, cur:kb.length });
  const allk = [...new Set([...ka, ...kb])];
  for (const k of allk) {
    const va = Array.isArray(xa) ? xa[k] : (xa && xa[k]);
    const vb = Array.isArray(xb) ? xb[k] : (xb && xb[k]);
    if (JSON.stringify(va) !== JSON.stringify(vb)) diffs.push({ campo:`excel[${k}]`, orig:va, cur:vb });
  }
  if (diffs.length) {
    totalDiffs += diffs.length;
    console.log(`\n### ${id} — ${ea.desc || ''}  (${diffs.length} dif)`);
    for (const d of diffs) {
      console.log(`  · ${d.campo}`);
      console.log(`      orig: ${JSON.stringify(d.orig)}`);
      console.log(`      cur : ${JSON.stringify(d.cur)}`);
    }
  } else {
    console.log(`### ${id} — IDÉNTICO`);
  }
}
console.log(`\n=== TOTAL campos con diferencia: ${totalDiffs} ===`);
console.log(`Columnas excel (orig/cur) en R-vacio: ${excelKeys(OA['R-vacio']?.excel).length} / ${excelKeys(OB['R-vacio']?.excel).length}`);
