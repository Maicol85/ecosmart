#!/usr/bin/env node
/**
 * _probe_img3c.mjs - los inventarios 7a, 8a y 9a y la prueba de la PARTE C de IMAGENES-3.
 *
 * Mide, sobre escenas cargadas: (7) la capsula de la coartacion y todo nodo VISIBLE de la app
 * que publique guia, clase, figura o folio de la coartacion, mas el contenido de su globo;
 * (8) las dos citas que quedaron en el papel -la de Beaubien-Souligny del VExUS y la
 * «- ASE 2025» de la diastolica- en las cuatro superficies; (9) las secciones del PPT de
 * congenitas que publican «Conclusion segun guias».
 *
 *   node scripts/_probe_img3c.mjs [--file <html>] [--out <json>]
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda, ni en sus comentarios.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js','/tmp/pw/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log(JSON.stringify({error:'SIN PLAYWRIGHT'}));process.exit(2)}
const {chromium}=_pw; const fs=await import('fs');
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const OUTF=arg('--out')||'/tmp/img3_c.json';

const ESCENAS={
  /* el caso que reporto el medico: istmo 8 mm, gradiente medio 25 mmHg */
  coaSig:   { coa:1, gmedio:'25', istmo:'8' },
  /* la rama de INDICACION: HTA confirmada y pico-pico 30 mmHg */
  coaInd:   { coa:1, gmedio:'25', istmo:'8', pp:'30', hta:'si' },
  /* normotensa con estrechamiento: la Clase IIb */
  coaIIb:   { coa:1, istmo:'8', est:'60', hta:'no' },
  /* sin nada cargado: control negativo */
  coaVacia: { coa:1 },
  /* VExUS y la diastolica, para el commit 8 */
  vexus:    { vexus:1 },
  diast:    { diast:1 },
  diastOk:  { diastOk:1 },
  ajeno:    { ajeno:1 }
};
const SOLO=(arg('--solo')||Object.keys(ESCENAS).join(',')).split(',').map(s=>s.trim());

const MONTAR=`(async (E) => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  const C=(id,on)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.checked=!!on;e.dispatchEvent(new Event('change',{bubbles:true}));return e.checked};
  const d={};
  S('nombre','Prueba Parte C'); S('ci','44444444'); S('fecha_estudio','2026-10-31');
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','60');
  if(E.ajeno){ S('fevi','58'); S('ddvi','48'); }
  if(E.coa){
    C('coart_incluir_chk',true);
    S('coa_situacion','nativa'); S('coa_loc','istmica');
    if(E.istmo) S('coa_istmo',E.istmo);
    if(E.gmedio) S('coa_gmedio',E.gmedio);
    if(E.pp) S('coa_gradiente_picopico',E.pp);
    if(E.est) S('coa_estenosis_relativa',E.est);
    if(E.hta) S('coa_hta',E.hta);
    S('coa_ao_desc','20');
  }
  /* VExUS: los tres patrones son SELECTS con valor 0/1/2, y la VCI sale de AD/VCI. Con la VCI
     sin dilatar el score no se calcula y la linea no entra al informe: es el denominador. */
  if(E.vexus){ S('vci_diam','25'); S('vci_colapso','menor50');
               S('vexus_sh','2'); S('vexus_pv','2'); S('vexus_ir','2'); }
  /* INCOMPLETO: onda E y A cargadas y NINGUN e', que es la rama del badge «Incompleto». */
  if(E.diast){ S('onda_e','60'); S('onda_a','80'); S('e_sep',''); S('e_lat',''); }
  /* una diastolica CLASIFICABLE, para el control de las otras ocho etiquetas */
  if(E.diastOk){ S('onda_e','60'); S('onda_a','80'); S('e_sep','5'); S('e_lat','7');
                 S('ai_vol','60'); }
  Object.keys(window).forEach(k=>{if(/^calc[A-Z]/.test(k)&&typeof window[k]==='function'){try{window[k]()}catch(e){}}});
  try{ if(typeof _recalcModulos==='function') _recalcModulos('c'); }catch(e){}
  await new Promise(r=>setTimeout(r,500));
  return d;
})(ESC)`;

const MEDIR=`(async () => {
  const R={};
  const T=id=>{const e=document.getElementById(id);return e?(e.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim():'NO EXISTE'};
  const V=id=>{const e=document.getElementById(id);return e?String(e.value||''):'NO EXISTE'};
  /* ── 7a · LA CAPSULA y el resto de la fila ── */
  R.capsula=T('coa-concl');
  R.conclusionTxt=(function(){try{const c=coaConclusion();return c?c.txt:'(null)'}catch(e){return 'EXC'}})();
  R.papel=(function(){try{const c=coaConclusion();return c?String(c.papel):'(null)'}catch(e){return 'EXC'}})();
  R.clave=(function(){try{const c=coaConclusion();return c?c.clave+(c.via?'/'+c.via:''):'(null)'}catch(e){return 'EXC'}})();
  /* BARRIDO de la PANTALLA: todo nodo visible que publique guia sobre la coartacion. Se excluye
     el panel de Evidencia, Referencias y las tarjetas ⓘ, que son justamente donde SI va. */
  const PAL=['ESC 2024','ESC 2020','Figura 44','folio','Tabla 69','Clase I','Clase IIa','Clase IIb',
             'Nivel C','medir el gradiente pico-pico','criterio de indicación'];
  const EXCL=['#ind-panel','#tab-referencias','.vinfo-card','#vinfo-pop','#ev-panel','[data-ind-compacta]'];
  const esExcl=(n)=>{ for(let p=n; p; p=p.parentElement){ if(!p.matches)continue;
    for(const s of EXCL){ try{ if(p.matches(s)) return true }catch(e){} } } return false };
  R.pantalla=[];
  document.querySelectorAll('.calc-val, .calc-row, .ev-cat, .chip, .pill, span[id], div[id]').forEach(n=>{
    if(esExcl(n)) return;
    const t=(n.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim();
    if(!t || t.length>600) return;
    if(!/coartac/i.test(t)) return;
    const hit=PAL.filter(w=>t.indexOf(w)>-1);
    if(hit.length) R.pantalla.push({id:n.id||n.className, pal:hit.join(','), txt:t.slice(0,170)});
  });
  /* se deduplica por texto: los nodos anidados repiten */
  const vis={}; R.pantalla=R.pantalla.filter(x=>{ if(vis[x.txt])return false; vis[x.txt]=1; return true });
  /* ── el globo ⓘ de la fila ── */
  R.globo=(function(){ try{ const f=evTarjetaCoa(); const d=document.createElement('div');
    d.appendChild(f); return (d.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim() }catch(e){ return 'EXC '+String(e).slice(0,80) } })();
  R.globoTieneF44 = R.globo.indexOf('Figura 44')>-1;
  R.globoTieneDoppler = R.globo.indexOf('20 mmHg')>-1 && R.globo.indexOf('Doppler')>-1;
  R.globoFolios = (R.globo.match(/folio[^.;]*/g)||[]).join(' | ');
  /* ── 8a · las dos citas en el PAPEL ── */
  const inf=(function(){try{ if(typeof generarInforme==='function') generarInforme(); return V('informe_texto') }catch(e){return 'EXC'}})();
  const suma=V('en_suma');
  R.infChars=inf.length;
  const CITAS={ beaubien:'Beaubien-Souligny', ultrasoundJ:'Ultrasound J 2020', ase2025:'ASE 2025',
                incompleto:'Incompleto' };
  R.enPapel={};
  Object.keys(CITAS).forEach(k=>{ R.enPapel[k]=(inf.split(CITAS[k]).length-1)+'/'+(suma.split(CITAS[k]).length-1) });
  R.lineaVexus=(inf.match(/[^.]*VEXUS[^.]*\\./gi)||[]).join(' ~ ').slice(0,420);
  R.lineaDiast=(inf.match(/[^.]*Incompleto[^.]*\\./gi)||[]).join(' ~ ').slice(0,300);
  R.patronesVexus=(function(){ const n=document.getElementById('vexus-res'); return n?(n.textContent||'').trim().slice(0,220):'NO EXISTE' })();
  /* ── 8a · LAS CUATRO SUPERFICIES: tambien el PDF y el PPT, generados de verdad ── */
  const PAL2=['Beaubien','Ultrasound J 2020','ASE 2025','BSE 2024','Incompleto'];
  const cuenta=(t)=>{const o={};PAL2.forEach(w=>{o[w]=String(t).split(w).length-1});return o};
  R.sup={ informe:cuenta(inf), suma:cuenta(suma) };
  /* PDF: se espia doc.text */
  if (window.jspdf && window.jspdf.jsPDF) {
    const O=window.jspdf.jsPDF; const reg=[];
    window.jspdf.jsPDF=function(...a){ const d=new O(...a); const ot=d.text.bind(d);
      d.text=function(t,x,y,...r){ reg.push(String(t)); return ot(t,x,y,...r) };
      d.save=function(){return true}; d.output=function(){return ''}; return d };
    Object.keys(O).forEach(k=>{try{window.jspdf.jsPDF[k]=O[k]}catch(e){}});
    try{ if(typeof _pdfAjustarA4==='function') await _pdfAjustarA4();
         else if(typeof generarPDF==='function') await generarPDF() }catch(e){ R.pdfErr=String(e).slice(0,110) }
    window.jspdf.jsPDF=O;
    R.sup.pdf=cuenta(reg.join(' | ')); R.pdfTextos=reg.length;
  }
  /* PPT: se espia addText y addTable, con el estudio sintetico y los tres modales contestados */
  if (typeof PptxGenJS!=='undefined') {
    const O=window.PptxGenJS; const reg=[];
    window.PptxGenJS=function(...a){ const p=new O(...a); const oa=p.addSlide.bind(p);
      p.addSlide=function(...z){ const sl=oa(...z); const ot=sl.addText.bind(sl);
        sl.addText=function(t,...r){ reg.push(JSON.stringify(t)); return ot(t,...r) };
        if(typeof sl.addTable==='function'){ const oTb=sl.addTable.bind(sl);
          sl.addTable=function(f,...r){ reg.push(JSON.stringify(f)); return oTb(f,...r) } }
        return sl };
      p.writeFile=function(){return Promise.resolve(true)}; p.write=function(){return Promise.resolve('')};
      return p };
    Object.keys(O).forEach(k=>{try{window.PptxGenJS[k]=O[k]}catch(e){}});
    const campos={};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e=>{
      campos[e.id]=(e.type==='checkbox')?(e.checked?'1':''):String(e.value||'');
      if(e.type==='checkbox') campos[e.id+'__chk']=e.checked?'1':'0'; });
    campos.informe_texto=inf; campos.en_suma=suma; campos['med-nombre']='Medico de prueba';
    const ESTU={id:'__c__',fecha:'2026-10-31',nombre:'Prueba Parte C',campos:campos};
    const oGI=window.getInformes, oT=window._pptElegirTema, oQ=window._pptElegirPresentador,
          oIm=window._pptElegirImagenes;
    window.getInformes=function(){return [ESTU]};
    window._pptElegirTema=function(cb){return cb('dark')};
    window._pptElegirPresentador=function(i,cb){return cb('Medico de prueba')};
    window._pptElegirImagenes=function(im,vi,cb){return cb({sel:[],layout:_PPT_IMG_LAYOUT_DEF,vids:[]})};
    try{ if(typeof generarPPT==='function') await generarPPT('__c__') }catch(e){ R.pptErr=String(e).slice(0,110) }
    await new Promise(r=>setTimeout(r,700));
    window.getInformes=oGI; window._pptElegirTema=oT; window._pptElegirPresentador=oQ;
    window._pptElegirImagenes=oIm; window.PptxGenJS=O;
    R.sup.ppt=cuenta(reg.join(' | ')); R.pptTextos=reg.length;
    R.pptASE=(reg.join(' | ').match(/[^\"|]*ASE 2025[^\"|]*/g)||[]).slice(0,3).join(' ~ ').slice(0,300);
  }
  return R;
})()`;

const b=await chromium.launch({channel:'chrome'});
const OUT={archivo:FILE,_pageErr:[],_consola:[]};
try{
  const pg=await b.newPage({viewport:{width:1280,height:900}});
  pg.on('pageerror',e=>OUT._pageErr.push(e.message.slice(0,150)));
  pg.on('console',m=>{if(m.type()==='error')OUT._consola.push(m.text().slice(0,150))});
  await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
  await pg.waitForTimeout(1800);
  for(const k of SOLO){
    if(!ESCENAS[k])continue;
    await pg.evaluate(MONTAR.replace('ESC',JSON.stringify(ESCENAS[k])));
    await pg.waitForTimeout(450);
    OUT[k]=await pg.evaluate(MEDIR);
    console.log('-- '+k+': clave='+OUT[k].clave+' | capsula: '+String(OUT[k].capsula).slice(0,120));
    if(OUT[k].pantalla.length) OUT[k].pantalla.forEach(x=>console.log('     PANTALLA ['+x.id+'] '+x.pal+' :: '+x.txt.slice(0,110)));
  }
  await pg.close();
}catch(e){OUT._err=String(e).slice(0,250)}
try{await b.close()}catch(e){}
fs.writeFileSync(OUTF,JSON.stringify(OUT,null,1));
console.log('escrito: '+OUTF);
