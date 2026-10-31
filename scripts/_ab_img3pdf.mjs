#!/usr/bin/env node
/**
 * _ab_img3pdf.mjs - compara dos volcados de `_probe_img3pdf.mjs`: hojas por escena y, sobre
 * los TEXTOS del PDF, lo que se fue y lo que llego. El denominador se imprime siempre.
 *
 *   node scripts/_ab_img3pdf.mjs <HEAD.json> <NUEVO.json>
 */
import fs from 'fs';
const [A,B]=process.argv.slice(2);
const a=JSON.parse(fs.readFileSync(A,'utf8')), b=JSON.parse(fs.readFileSync(B,'utf8'));
const esc=Object.keys(a).filter(k=>a[k]&&typeof a[k]==='object'&&a[k].porHoja);
let nT=0;
console.log('DENOMINADOR: '+esc.length+' escenas');
console.log('');
console.log('escena        hojas(HEAD->NUEVO)  conDiag   dibujos   textos');
for(const k of esc){
  if(!b[k]){console.log('  '+k+': AUSENTE del lado B');continue}
  nT+=a[k].txt?a[k].txt.length:0;
  console.log('  '+k.padEnd(12)+'  '+String(a[k].hojas).padStart(2)+' -> '+String(b[k].hojas).padStart(2)
    +'           '+String(a[k].hojasConDiag).padStart(2)+' -> '+String(b[k].hojasConDiag).padStart(2)
    +'     '+String(a[k].nImgTotal).padStart(2)+' -> '+String(b[k].nImgTotal).padStart(2)
    +'     '+String(a[k].nTxtTotal).padStart(4)+' -> '+String(b[k].nTxtTotal).padStart(4));
}
console.log('\n═══ TEXTOS: lo que se FUE y lo que LLEGO, por escena ═══');
console.log('(denominador: '+nT+' textos del lado HEAD)');
for(const k of esc){
  if(!b[k]||!a[k].txt||!b[k].txt) continue;
  const ca={},cb={};
  a[k].txt.forEach(t=>{ca[t]=(ca[t]||0)+1});
  b[k].txt.forEach(t=>{cb[t]=(cb[t]||0)+1});
  const fue=[],llego=[];
  Object.keys(ca).forEach(t=>{ const d=(ca[t]||0)-(cb[t]||0); if(d>0) fue.push((d>1?('x'+d+' '):'')+t) });
  Object.keys(cb).forEach(t=>{ const d=(cb[t]||0)-(ca[t]||0); if(d>0) llego.push((d>1?('x'+d+' '):'')+t) });
  if(!fue.length && !llego.length){ console.log('  · '+k+': CERO cambios de texto'); continue }
  console.log('  · '+k+':  -'+fue.length+' / +'+llego.length);
  fue.forEach(t=>console.log('      FUE  : '+t.slice(0,150)));
  llego.forEach(t=>console.log('      LLEGO: '+t.slice(0,150)));
}
