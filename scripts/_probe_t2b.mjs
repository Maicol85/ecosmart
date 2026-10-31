#!/usr/bin/env node
/**
 * _probe_t2b.mjs - la sonda del panel de Evidencia de la TGA (TGA-2, commit 2).
 *
 * Mide, con DENOMINADOR declarado en cada escenario: que la seccion aparezca y solo cuando debe,
 * cuantas filas de datos trae, cuantas preguntas, cuantas lineas de recomendacion y cual es la
 * linea de balance. Y el CONTROL que la orden pide: que ninguna frase de las recomendaciones
 * llegue al informe, al EN SUMA, a la hoja del PDF, al PPT ni a la capsula de pantalla.
 *
 *   node scripts/_probe_t2b.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw;
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>0?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');

const ESC={
  sinTipo:  { sel:{} },
  sinCx:    { sel:{ tga_tipo:'dtga', tga_sintomas:'no' } },
  dtgaNin:  { sel:{ tga_tipo:'dtga', tga_cirugia:'ninguna', tga_sintomas:'no' } },
  aur:      { sel:{ tga_tipo:'mustard', tga_func_vd:'moderada', it_grado:'4', tga_sintomas:'si', tga_bav:'no' } },
  jat:      { sel:{ tga_tipo:'dtga', tga_cirugia:'jatene', tga_sintomas:'si' } },
  ras:      { sel:{ tga_tipo:'dtga', tga_cirugia:'rastelli', tga_civ_residual:'si', tga_sintomas:'si' }, campos:{ tga_civ_grad:'30' } },
  cc:       { sel:{ tga_tipo:'cctga', tga_func_vd:'leve', it_grado:'4', tga_sintomas:'si', tga_bav:'si' } },
  ajeno:    { campos:{ im_vc:'8', onda_e:'110' }, sel:{} }
};

const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage();
const errs=[]; pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1500);

const MONTAR=(esc)=>`((e)=>{
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id); if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(x){}
  try{ if(typeof _indClinLimpiar==='function') _indClinLimpiar() }catch(x){}
  const S=(id,v)=>{const el=document.getElementById(id); if(!el) return 'NO EXISTE '+id;
    el.value=v; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return el.value};
  Object.keys(e.campos||{}).forEach(k=>S(k,e.campos[k]));
  Object.keys(e.sel||{}).forEach(k=>S(k,e.sel[k]));
  try{ if(typeof _recalcModulos==='function') _recalcModulos('t2b') }catch(x){}
  return true;
})(${JSON.stringify(esc)})`;

const MEDIR=`(()=>{
  const r={};
  const secs=(typeof IND_SECS!=='undefined')?IND_SECS:[];
  r.nSecs=secs.length;
  let s=null; for(const x of secs){ if(x.tit.indexOf('Transposicion')===0||x.tit.indexOf('Transposición')===0){ s=x; break } }
  r.registrada=!!s;
  let R=null; try{ R=s?s.fn():null }catch(e){ R={ERROR:String(e&&e.message)} }
  r.aplica=!!R && !R.ERROR;
  if(R&&R.ERROR){ r.err=R.ERROR; return r }
  if(!R) return r;
  r.filas=(R.filas||[]).length;
  r.preg=(R.clinica||[]).length;
  r.pregLbl=(R.clinica||[]).map(f=>f.lbl);
  r.pregMarca=(R.clinica||[]).map(f=>f.marca);
  r.pregConCtrl=(R.clinica||[]).filter(f=>f.ctrl).length;
  r.bloques=(R.bloques||[]).map(bq=>({tit:bq.tit,n:bq.lineas.length}));
  const todas=[]; (R.bloques||[]).forEach(bq=>bq.lineas.forEach(l=>todas.push(l.txt)));
  r.lineas=todas;
  r.balance=todas.filter(t=>t.indexOf('sin contestar')>=0||t.indexOf('Condiciones presentes')>=0||t.indexOf('estan contestadas')>=0||t.indexOf('están contestadas')>=0);
  r.clases={I:0,IIa:0,IIb:0,III:0};
  todas.forEach(t=>{ if(/Clase I · /.test(t))r.clases.I++; if(/Clase IIa/.test(t))r.clases.IIa++; if(/Clase IIb/.test(t))r.clases.IIb++; if(/Clase III/.test(t))r.clases.III++; });
  r.guiaRef=R.guia?R.guia.ref:null;
  r.notas=(R.notas||[]).filter(Boolean).length;
  return r;
})()`;

/* Las frases que NO pueden estar en el papel. Trozos cortos y distintivos de las tablas. */
const MARCAS=['stent cubierto','baffle','tunel auricular','túnel auricular','neoaortica','neoaórtica',
  'Clase I · Nivel C','Clase IIa','Clase IIb','Clase III','folio 619','folio 620','folio 621','folio 622',
  'ESC 2020','ergoespirometria','ergoespirometría','centro especializado'];
const PAPEL=`(async()=>{
  const out={};
  const g=(id)=>{const e=document.getElementById(id); return e?(e.value||e.textContent||''):''};
  try{ if(typeof generarInforme==='function') generarInforme() }catch(e){}
  await new Promise(r=>setTimeout(r,350));
  out.informe=g('informe_texto'); out.suma=g('en_suma'); out.capsula=g('tga-concl');
  out.hoja=g('cc-txt-tga');
  /* ⚠️ EL PDF SE GENERA DE VERDAD, por \`_pdfAjustarA4\` y no por \`generarPDF\`: es el camino
     que usa el A/B heredado. La primera version de esta sonda llamaba a \`generarPDF\` y
     devolvia CERO textos sin error, que es indistinguible de «el PDF no lleva la frase». */
  const pdf=[]; out.pdfN=0;
  if(window.jspdf&&window.jspdf.jsPDF){
    const Orig=window.jspdf.jsPDF;
    window.jspdf.jsPDF=function(...a){ const d=new Orig(...a); const ot=d.text.bind(d);
      d.text=function(t,x,y,...r){ pdf.push(String(t)); return ot(t,x,y,...r) };
      d.save=function(){return true}; d.output=function(){return ''}; return d };
    Object.keys(Orig).forEach(k=>{ try{ window.jspdf.jsPDF[k]=Orig[k] }catch(e){} });
    try{ if(typeof _pdfAjustarA4==='function') await _pdfAjustarA4();
         else if(typeof generarPDF==='function') await generarPDF() }catch(e){ out.pdfErr=String(e&&e.message).slice(0,120) }
    window.jspdf.jsPDF=Orig;
  } else { out.pdfErr='NO HAY jsPDF'; }
  out.pdf=pdf.join(' | '); out.pdfN=pdf.length;
  /* ⚠️ EL PPT EXIGE UN ESTUDIO GUARDADO Y DOS MODALES, y las casillas se persisten como
     <id>__chk. Sin eso \`generarPPT\` devuelve 0 diapositivas sin error. */
  const ppt=[]; out.pptSlides=0;
  if(window.PptxGenJS){
    const Orig=window.PptxGenJS;
    window.PptxGenJS=function(){ const p=new Orig();
      const as=p.addSlide.bind(p);
      p.addSlide=function(...z){ out.pptSlides++; const sl=as(...z);
        const ot=sl.addText?sl.addText.bind(sl):null, oa=sl.addTable?sl.addTable.bind(sl):null;
        if(ot) sl.addText=function(t,...r){ ppt.push(JSON.stringify(t)); return ot(t,...r) };
        if(oa) sl.addTable=function(t,...r){ ppt.push(JSON.stringify(t)); return oa(t,...r) };
        return sl };
      p.writeFile=function(){ return Promise.resolve('') };
      return p };
    Object.keys(Orig).forEach(k=>{ try{ window.PptxGenJS[k]=Orig[k] }catch(e){} });
    const campos={};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e=>{
      campos[e.id]=(e.type==='checkbox')?(e.checked?'1':''):String(e.value||'');
      if(e.type==='checkbox') campos[e.id+'__chk']=e.checked?'1':'0'; });
    campos.informe_texto=out.informe; campos.en_suma=out.suma; campos['med-nombre']='Medico de prueba';
    const ESTU={ id:'__t2b__', fecha:'2026-10-31', nombre:'T2B TGA', campos:campos };
    const oGI=window.getInformes,oT=window._pptElegirTema,oQ=window._pptElegirPresentador;
    window.getInformes=function(){ return [ESTU] };
    window._pptElegirTema=function(cb){ return cb('dark') };
    window._pptElegirPresentador=function(i,cb){ return cb('Medico de prueba') };
    try{ if(typeof generarPPT==='function') await generarPPT('__t2b__') }catch(e){ out.pptErr=String(e&&e.message).slice(0,120) }
    await new Promise(r=>setTimeout(r,900));
    window.getInformes=oGI; window._pptElegirTema=oT; window._pptElegirPresentador=oQ;
    window.PptxGenJS=Orig;
  } else { out.pptErr='NO HAY PptxGenJS'; }
  out.ppt=ppt.join(' | ');
  out.denom={informe:out.informe.length,suma:out.suma.length,capsula:out.capsula.length,hoja:out.hoja.length,
             pdfTextos:out.pdfN,pptSlides:out.pptSlides,pptTextos:ppt.length};
  return out;
})()`;

console.log('ARCHIVO: '+FILE);
for(const k of Object.keys(ESC)){
  await pg.evaluate(MONTAR(ESC[k]));
  const r=await pg.evaluate(MEDIR);
  console.log('');
  console.log('== '+k+' ==');
  console.log('  registrada='+r.registrada+'  aplica='+r.aplica+(r.err?('  ERROR='+r.err):''));
  if(r.aplica){
    console.log('  filas='+r.filas+'  preguntas='+r.preg+' (con control: '+r.pregConCtrl+')  guia='+r.guiaRef+'  notas='+r.notas);
    console.log('  bloques='+JSON.stringify(r.bloques));
    console.log('  clases='+JSON.stringify(r.clases));
    console.log('  balance='+JSON.stringify(r.balance).slice(0,300));
  }
}
/* ── El control del PAPEL, sobre el escenario mas cargado ── */
await pg.evaluate(MONTAR({...ESC.aur, chk:[]}));
await pg.evaluate(`(()=>{const c=document.getElementById('tga_incluir_chk'); if(c&&!c.checked){ if(typeof eteInclToggle==='function') eteInclToggle('tga_incluir_chk'); else {c.checked=true;} } return !!(c&&c.checked)})()`);
/* y ademas se contestan DOS preguntas del panel, para que el control no mida un panel vacio */
const resp=await pg.evaluate(`(()=>{ if(typeof _indClin==='undefined') return 'SIN _indClin';
  _indClin['tga.ev.baffuga']='si'; _indClin['tga.ev.cianosis']='si'; return Object.keys(_indClin).length })()`);
const pap=await pg.evaluate(PAPEL);
console.log('');
console.log('== CONTROL DEL PAPEL (escenario aur, integrado, con 2 preguntas contestadas: '+resp+') ==');
console.log('  denominadores: '+JSON.stringify(pap.denom)+(pap.pdfErr?('  pdfErr='+pap.pdfErr):'')+(pap.pptErr?('  pptErr='+pap.pptErr):''));
const sup={informe:pap.informe,'EN SUMA':pap.suma,'capsula':pap.capsula,'hoja PDF':pap.hoja,'PDF':pap.pdf,'PPT':pap.ppt};
let fugas=0;
for(const m of MARCAS){ const d=[]; for(const k of Object.keys(sup)) if(String(sup[k]).indexOf(m)>=0) d.push(k);
  if(d.length){ fugas++; console.log('  FUGA  "'+m+'" en: '+d.join(', ')); } }
console.log('  marcas censadas: '+MARCAS.length+'  fugas: '+fugas);
/* control positivo: una marca que SI tiene que estar en el panel */
const pres=await pg.evaluate(`(()=>{const s=IND_SECS.find(x=>x.tit.indexOf('Transposici')===0); const R=s?s.fn():null;
  if(!R) return 'SIN SECCION'; const t=R.bloques.map(b=>b.lineas.map(l=>l.txt).join(' ')).join(' ');
  return {clase:(t.indexOf('Clase I · Nivel C')>=0), folio:(t.indexOf('folio 619')>=0)} })()`);
console.log('  control positivo (la marca SI esta en el panel): '+JSON.stringify(pres));
console.log('');
console.log('ERRORES DE CONSOLA/PAGINA: '+errs.length+(errs.length?(' -> '+errs.slice(0,3).join(' // ')):''));
await pg.close(); await b.close(); process.exit(0);
