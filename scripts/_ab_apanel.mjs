#!/usr/bin/env node
/** _ab_apanel.mjs - muestra QUE cambio en el texto del panel de Evidencia y de las fichas,
 *  frase por frase, y vigila lo que NO puede perderse: toda cadena «Clase …» y «Nivel …», todo
 *  «folio N» y toda «Tabla N» que estaba en HEAD tiene que seguir en alguna parte del lado nuevo.
 *
 *    node scripts/_ab_apanel.mjs ab_head.json ab_nuevo.json [escena]
 */
const fs = await import('fs');
const A = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const B = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const SOLO = process.argv[4] || null;
const CLAVES = ['_evTexto', '_ficha_ref-pop', '_ficha_ref-pulmon', '_ficha_ref-cardiotox',
                '_ficha_co-referencia-seccion'];
const frases = t => String(t || '').split(/(?<=[.;:!?])\s+|\s\|\|\s/)
  .map(x => x.trim()).filter(x => x.length > 3);
const esc = Object.keys(A).filter(k => k[0] !== '_' && k !== 'archivo' && B[k])
  .filter(k => !SOLO || k === SOLO);

/* ── EL GUARDIAN DE LO QUE NO SE PUEDE PERDER (regla R7) ───────────────────────────────────── */
/* ⚠️ SE RECORTA LA PUNTUACION FINAL DE CADA MARCA, Y SIN ESO EL GUARDIAN MIENTE. La clase
   `[0-9A-Za-z.-]` existe para atrapar «folio 497.e20», y de paso se tragaba el PUNTO QUE CIERRA
   LA ORACION: «folio e17» en un lado y «folio e17.» en el otro salian como marcas distintas, y
   el guardian reporto 58 folios perdidos que estaban los 58 presentes —verificado contando las
   cadenas en el volcado—. Un guardian que da falsos rojos se desactiva solo. */
const marcas = t => {
  const s = String(t || '');
  const m = (re) => (s.match(re) || []).map(x => x.replace(/\s+/g, ' ').replace(/[.,;:]+$/, '').trim());
  return { clase: m(/Clase\s+[0-9IVab]+[a-z]?(\s*·\s*Nivel\s+[A-Za-z-]+)?/g),
           folio: m(/folios?\s+[0-9e][0-9A-Za-z.–-]*/g),
           tabla: m(/(Tabla|Recommendation Table|Recomendaciones-tabla|Figura|apartado|§)\s*[0-9][0-9.]*/g) };
};
let perdidas = 0;
for (const e of esc) {
  for (const k of CLAVES) {
    const a = A[e][k], b = B[e][k];
    if (a === undefined && b === undefined) continue;
    const fa = frases(a), fb = frases(b);
    const soloA = fa.filter(x => fb.indexOf(x) < 0), soloB = fb.filter(x => fa.indexOf(x) < 0);
    if (!soloA.length && !soloB.length) continue;
    console.log('\n══ [' + e + '] ' + k + '  (HEAD ' + fa.length + ' frases → NUEVO ' + fb.length + ') ══');
    if (soloA.length) { console.log('  — SALIERON (' + soloA.length + '):');
      soloA.forEach(x => console.log('      · ' + x.slice(0, 300))); }
    if (soloB.length) { console.log('  + ENTRARON (' + soloB.length + '):');
      soloB.forEach(x => console.log('      · ' + x.slice(0, 300))); }
    /* El guardian, por clave y por escena. */
    const ma = marcas(a), mb = marcas(b);
    ['clase', 'folio', 'tabla'].forEach(t => {
      const falt = ma[t].filter(x => mb[t].indexOf(x) < 0);
      /* Lo que salio de ESTA clave puede haber ido a OTRA del mismo lado nuevo: se busca en
         todas antes de declararlo perdido. Sin esto, mover una cita del panel a la ficha se
         reporta como perdida y el guardian miente. */
      const todoB = CLAVES.map(c => String(B[e][c] || '')).join(' ');
      const mtodo = marcas(todoB);
      const real = falt.filter(x => mtodo[t].indexOf(x) < 0);
      if (real.length) { perdidas += real.length;
        console.log('  ⚠️ ' + t.toUpperCase() + ' QUE YA NO APARECE EN NINGUNA SUPERFICIE MEDIDA: '
          + real.join(' / ')); }
      else if (falt.length) console.log('  ✓ ' + t + ': ' + falt.length
        + ' marca(s) se movieron de lugar pero siguen en el lado nuevo');
    });
  }
}
console.log('\n══ GUARDIAN R7: ' + perdidas + ' clase/nivel/folio/tabla perdida(s) ══');
process.exitCode = perdidas ? 1 : 0;
