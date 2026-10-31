#!/usr/bin/env node
/**
 * _probe_t2a_demo.mjs — LA COMPARACION CONTRA LA DEMO APROBADA con los CUATRO escenarios (TGA-2, punto 1d).
 *
 * Hermano de _probe_tga2demo.mjs, que es el de la tanda TGA y queda intacto: ese corria con
 * Jatene y Rastelli PARADOS y esperaba 20 iguales y 10 distintos. Este corre con los cuatro
 * valores publicados y espera 30 de 30.
 *
 * No compara pixeles: compara LA GEOMETRIA, que es lo que la orden pide no reinterpretar. El
 * `scenario()` de la demo y el `tga3dEscena()` de la app devuelven la misma estructura
 * —{ch, ar, fl, ex, lb}— con los puntos, los colores, los radios y los rotulos; se corren los
 * dos con los MISMOS datos y se comparan campo por campo.
 *
 * Como se saca el scenario de la demo: su script es una IIFE y no exporta nada, asi que se
 * EXTRAE el texto de sus constantes y de su funcion y se evalua en una pagina en blanco. El
 * recorte se hace por marcas literales del archivo y se verifica que las tres aparezcan una sola
 * vez: si la demo cambiara, la extraccion falla ruidosamente en vez de comparar media funcion.
 *
 *   node scripts/_probe_tga2demo.mjs
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw; const fs=await import('fs');
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const DEMO=RAIZ+'/docs/3d/demo_tga_3d_esquema_aprobado.html';

const html=fs.readFileSync(DEMO,'utf8');
const M1="var C={blue:0x2f6fd0";
const M2="function cat(){";
const M3="function boot(){";
for(const [n,m] of [['C',M1],['cat',M2],['boot',M3]]){
  const k=html.split(m).length-1;
  if(k!==1){ console.log('EXTRACCION ABORTADA: la marca '+n+' aparece '+k+' veces, no 1'); process.exit(3) }
}
const i1=html.indexOf(M1), i3=html.indexOf(M3);
const TROZO=html.slice(i1,i3);
if(TROZO.indexOf('function scenario()')<0){ console.log('EXTRACCION ABORTADA: no hay scenario()'); process.exit(3) }

const b=await chromium.launch({channel:'chrome',headless:true});

/* ── lado DEMO ── */
const pd=await b.newPage();
await pd.setContent('<html><body></body></html>');
/* ATENCION: el trozo se inyecta con addScriptTag y NO como argumento de evaluate. Un
   `page.evaluate(cadena, arg)` DESCARTA el argumento —queda undefined de los dos lados y dos
   resultados vacios comparan iguales—, que es una trampa ya documentada de este arnes. */
await pd.addScriptTag({content: TROZO + '\nwindow.__scn=function(a,o,s){anat=a;op=o;sh=s;return scenario()};'});
const DEM=await pd.evaluate(`(()=>{
  const casos=[];
  const F=(a,o,s)=>window.__scn(a,o,s);
  const combos=[['norm','none'],['dtga','none'],['dtga','mus'],['dtga','jat'],['dtga','ras'],['ltga','none']];
  const shs=[{asd:false,vsd:false,pda:false},{asd:true,vsd:false,pda:false},
             {asd:false,vsd:true,pda:false},{asd:false,vsd:false,pda:true},
             {asd:true,vsd:true,pda:true}];
  combos.forEach(c=>shs.forEach((sh,k)=>{
    let r;
    try{ r=F(c[0],c[1],sh) }catch(e){ r={ERROR:String(e.message)} }
    casos.push({k:c[0]+'/'+c[1]+'/sh'+k, s:r});
  }));
  return casos;
})()`);
await pd.close();

/* ── lado APP ── */
const pa=await b.newPage();
await pa.goto('file://'+RAIZ+'/index.html',{waitUntil:'load',timeout:60000});
await pa.waitForTimeout(1200);
const APP=await pa.evaluate(`(()=>{
  const casos=[];
  const CIR={none:"",mus:"auricular",jat:"jatene",ras:"rastelli"};
  const combos=[['norm','none'],['dtga','none'],['dtga','mus'],['dtga','jat'],['dtga','ras'],['ltga','none']];
  const shs=[{asd:false,vsd:false,pda:false},{asd:true,vsd:false,pda:false},
             {asd:false,vsd:true,pda:false},{asd:false,vsd:false,pda:true},
             {asd:true,vsd:true,pda:true}];
  combos.forEach(c=>shs.forEach((sh,k)=>{
    let r;
    try{ r=tga3dEscena(c[0],CIR[c[1]],sh) }catch(e){ r={ERROR:String(e.message)} }
    casos.push({k:c[0]+'/'+c[1]+'/sh'+k, s:r});
  }));
  return casos;
})()`);
await pa.close(); await b.close();

/* ── la comparacion ── */
const norm=(s)=>{
  if(!s||s.ERROR) return 'ERROR:'+(s&&s.ERROR);
  const pt=a=>JSON.stringify(a.map(p=>p.map(x=>Math.round(x*1e6)/1e6)));
  const o={ ch:JSON.stringify(s.ch),
    ar:s.ar.map(a=>pt(a.p)+'|c='+a.c+'|r='+JSON.stringify(a.r||null)+'|br='+(a.br||0)+'|from='+(a.from||'')).join('\n'),
    fl:s.fl.map(f=>pt(f.p)+'|c='+f.c+'|n='+(f.n||0)+'|sp='+(f.sp||0)).join('\n'),
    ex:s.ex.map(e=>JSON.stringify(e)).join('\n'),
    lb:s.lb.map(l=>l[0]+'@'+JSON.stringify(l[1])).join('\n') };
  return o;
};
let ig=0, dif=0;
console.log('ESCENARIOS COMPARADOS: '+DEM.length+' (6 combinaciones x 5 juegos de comunicaciones)');
console.log('');
DEM.forEach((d,i)=>{
  const a=APP[i];
  if(d.k!==a.k){ console.log('DESALINEADO '+d.k+' vs '+a.k); dif++; return }
  const D=norm(d.s), A=norm(a.s);
  const esperadoParado = false;
  if(typeof D==='string'||typeof A==='string'){
    console.log(d.k+' : D='+D+' A='+A); dif++; return;
  }
  const campos=['ch','ar','fl','ex','lb'];
  const malos=campos.filter(c=>D[c]!==A[c]);
  if(!malos.length){ ig++; console.log('  IGUAL      '+d.k); }
  else{
    dif++;
    console.log('  DIFIERE    '+d.k+'  en: '+malos.join(',')+(esperadoParado?'   <-- ESPERADO: Jatene y Rastelli estan PARADOS':''));
    malos.forEach(c=>{
      const dl=String(D[c]).split('\n'), al=String(A[c]).split('\n');
      console.log('     '+c+': demo '+dl.length+' item(s), app '+al.length);
      for(let j=0;j<Math.max(dl.length,al.length);j++)
        if(dl[j]!==al[j]) console.log('       ['+j+'] demo: '+String(dl[j]).slice(0,110)+'\n            app : '+String(al[j]).slice(0,110));
    });
  }
});
console.log('');
console.log('RESUMEN: '+ig+' iguales, '+dif+' distintos, de '+DEM.length);
