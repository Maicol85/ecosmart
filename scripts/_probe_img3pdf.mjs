#!/usr/bin/env node
/**
 * _probe_img3pdf.mjs - el INVENTARIO 3a y la medicion de las HOJAS DE DIAGRAMAS del PDF
 * (Parte B de la tanda IMAGENES-3).
 *
 * Genera el PDF de verdad espiando jsPDF y devuelve, por escena: cuantas hojas, que hay en
 * cada hoja (barras de seccion, dibujos con sus coordenadas y los textos), y si algo se sale
 * de la caja de la hoja. Sin coordenadas, «la composicion no cambio» no se puede medir: el
 * espia heredado de los A/B guarda solo el texto y cuenta figuras.
 *
 *   node scripts/_probe_img3pdf.mjs [--file <html>] [--out <json>] [--solo a,b,c]
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
const OUTF=arg('--out')||'/tmp/img3_pdf.json';

/* PNG 8x8 RGB generado con zlib: el 2x2 heredado de otras sondas hacia que jsPDF tirara
   «Incomplete or corrupt PNG file» al meter varios en la misma hoja, y el PDF salia de UNA
   pagina sin que eso dijera nada de la app. Costo una corrida. */
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAN0lEQVR4nGOQszmBFTEYuZ3AihjcAk5gRQxRUSewIoa8lBNYEUNT3gmsiGFaxQmsiGFV0wmsCACkZmLBw/OU+gAAAABJRU5ErkJggg==';

/* ── Las escenas del punto 6 de la orden ──────────────────────────────────────────────────── */
const ESCENAS = {
  /* (a) el estudio de prueba del medico: Contractilidad+SGL, CIA con su texto de congenitas,
         jet post-TAVI, mitral quirurgica y orejuela. Hoy 4 hojas; con las reglas, 2. */
  medico:   { contr:1, sgl:1, cia:1, tavi:1, eteqx:1, oai:1, caps:0 },
  /* (b) mitral + orejuela + bicuspide + FOP -> 1 hoja */
  ete4:     { eteqx:1, oai:1, vab:1, fop:1, caps:0 },
  /* (c) jet post-TAVI + bicuspide: la pareja EXCLUIDA, en franjas distintas */
  taviVab:  { tavi:1, vab:1, caps:0 },
  /* (d) todos los diagramas + 8 capturas */
  todos8:   { contr:1, sgl:1, lv3d:1, eteqx:1, tavi:1, vab:1, oai:1, fop:1, cia:1, caps:8 },
  /* (e) solo 5 capturas */
  cap5:     { caps:5 },
  /* (f) sin diagramas ni capturas: tiene que quedar identico a HEAD */
  vacio:    { caps:0 },
  /* CONTROL: un estudio ajeno, con datos de otras secciones y ningun diagrama */
  ajeno:    { ajeno:1, caps:0 }
};
const SOLO=(arg('--solo')||Object.keys(ESCENAS).join(',')).split(',').map(s=>s.trim());

const MONTAR = `(async (E) => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  const C=(id,on)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.checked=!!on;e.dispatchEvent(new Event('change',{bubbles:true}));return e.checked};
  const d={};
  S('nombre','Prueba Diagramas'); S('ci','55555555'); S('fecha_estudio','2026-10-31');
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','60');
  if (E.ajeno) { S('fevi','58'); S('ddvi','48'); S('siv','9'); S('ai_diam','36'); }
  /* ── CONTRACTILIDAD y SGL: el toggle MAS segmentos pintados ── */
  if (E.contr) { try{ if(typeof contrEstado==='object'){contrEstado['s1']=1;contrEstado['s2']=2} }catch(e){}
                 S('contr_be_pdf','1'); }
  if (E.sgl)   { try{ if(typeof strainEstado==='object'){strainEstado['s1']=1;strainEstado['s2']=2} }catch(e){}
                 S('sgl_gls','-15'); S('sgl_be_pdf','1'); }
  /* ── 3D del VI: su unica puerta es lv3dCapturaParaPDF(). NO hay forma de fabricar una
        captura de WebGL desde la sonda, asi que se STUBEA y SE DECLARA. ── */
  if (E.lv3d) { window.lv3dCapturaParaPDF = function(){ return {url:PNGQ, ancho:680, alto:500} };
                d.lv3dStub=true; }
  /* ── CIA: la casilla de shunt mas un borde medido ── */
  if (E.cia) { S('ete_cia_tipo','secundum'); S('ete_cia_d1','8'); S('ete_cia_d2','6');
               S('ete_cia_borde_vcs','4'); S('ete_cia_borde_ao','7'); S('ete_cia_dir','id');
               S('ete_cia_vel','1.2'); C('ete_shunt_incluir_chk',true); }
  /* ── jet post-TAVI: la casilla mas horas ── */
  if (E.tavi) { S('ete_tavi_pro_tam','26'); S('ete_tavi_jet_horas','2,3,4');
                C('ete_tavi_incluir_chk',true); }
  /* ── bicuspide: morfologia, fenotipo y el toggle ── */
  if (E.vab) { S('va_morf','Bicúspide'); S('vab_fenotipo','rl'); S('vab_tipo','fused_rl');
               S('vab_rafe','calcificado'); S('vab_pdf','1'); }
  /* ── mitral vista quirurgica ── */
  if (E.eteqx) { S('im_grado','Severa'); S('im_mecanismo','flail'); S('ete_qx_pdf','1'); }
  /* ── FOP: la casilla mas datos ── */
  /* Los campos del FOP son estos, verificados en fopPdfFilas: fop_presente y
     fop_burbujas='grado2' no existen y dejaban la tabla vacia. */
  if (E.fop) { S('fop_tunel','6'); S('fop_mov','si'); S('fop_asa','no');
               S('fop_contraste','si'); S('fop_shunt_reposo','si');
               C('fop_incluir_chk',true); }
  /* ── OREJUELA: los campos y el boton real de «Incluir en el PDF» ── */
  if (E.oai) { S('oai_morfologia','ala_pollo'); S('oai_ostium_diam','25'); S('oai_profundidad','33');
               S('oai_vel_vac','32');
               try{ if(typeof calcOAI==='function') calcOAI() }catch(e){}
               try{ if(typeof oaiEsqGesto==='function') oaiEsqGesto() }catch(e){}
               await new Promise(r=>setTimeout(r,400));
               try{ if(typeof oaiEsqIncluirPDF==='function') oaiEsqIncluirPDF() }catch(e){ d.errOai=String(e).slice(0,90) }
               await new Promise(r=>setTimeout(r,400)); }
  /* ── CAPTURAS del ecografo ── */
  if (E.caps && typeof imgSlots!=='undefined') {
    for(let i=0;i<E.caps;i++)
      imgSlots.push({dataURL:PNGQ,ampliada:false,calidad:'media',origen:'estudio'});
    if(typeof imgSlotCount!=='undefined') imgSlotCount=imgSlots.length;
    if(typeof imgEnsureLen==='function') imgEnsureLen();
    if(typeof imgMarcarEditado==='function') imgMarcarEditado();
  }
  Object.keys(window).forEach(k=>{if(/^calc[A-Z]/.test(k)&&typeof window[k]==='function'){try{window[k]()}catch(e){}}});
  try{ if(typeof _recalcModulos==='function') _recalcModulos('img3'); }catch(e){}
  await new Promise(r=>setTimeout(r,500));
  try{ if(typeof generarInforme==='function') generarInforme() }catch(e){ d.errInf=String(e).slice(0,90) }
  await new Promise(r=>setTimeout(r,500));
  /* ── DENOMINADOR: que diagrama esta realmente encendido ── */
  d.on={};
  try{ (INF_MIN_DIAG||[]).forEach(x=>{ try{ d.on[x.k]=!!x.on() }catch(e){ d.on[x.k]='EXC' } }) }catch(e){}
  try{ d.on.cia = !!(document.getElementById('ete_shunt_incluir_chk')||{}).checked
                  && _CIA_BORDES.some(b=>v(b[0])!=null) }catch(e){ d.on.cia='EXC' }
  try{ d.on.fop = !!((document.getElementById('fop_incluir_chk')||{}).checked
                  && typeof fopPdfFilas==='function' && (fopPdfFilas()||[]).length) }catch(e){ d.on.fop='EXC' }
  try{ d.on.oaiEsq = (typeof esqEstaIncluido==='function') ? esqEstaIncluido('orejuela') : 'sin fn' }catch(e){}
  try{ d.capturas = (typeof infMinCapturas==='function') ? infMinCapturas().length : 'sin fn' }catch(e){}
  try{ d.esquemas = (typeof infMinEsquemas==='function') ? infMinEsquemas().length : 'sin fn' }catch(e){}
  d.informeChars = String((document.getElementById('informe_texto')||{}).value||'').length;
  return d;
})(ESC)`.replace(/PNGQ/g,JSON.stringify(PNG));

/* El PDF con COORDENADAS y por HOJA. */
const PDF = `(async () => {
  if (typeof window.jspdf==='undefined' || !window.jspdf.jsPDF) return {err:'SIN JSPDF'};
  const Orig=window.jspdf.jsPDF;
  const reg={pags:1, txt:[], imgs:[], err:null, w:0, h:0, construcciones:0};
  window.jspdf.jsPDF=function(...a){
    const dd=new Orig(...a);
    /* ADVERTENCIA: _pdfAjustarA4 GENERA EL PDF VARIAS VECES —mide y reintenta—, y un registro acumulado
       sumaba las pasadas: la escena del medico daba 13 hojas con la misma secuencia de barras
       repetida cuatro veces. Se reinicia en CADA construccion, asi que lo que queda es el
       documento FINAL, que es el que se guarda. Costo una medicion. */
    reg.construcciones++; reg.pags=1; reg.txt.length=0; reg.imgs.length=0;
    try{ reg.w=dd.internal.pageSize.getWidth(); reg.h=dd.internal.pageSize.getHeight() }catch(e){}
    const oAdd=dd.addPage?dd.addPage.bind(dd):null;
    if(oAdd) dd.addPage=function(...z){ reg.pags++; return oAdd(...z) };
    const ot=dd.text.bind(dd);
    dd.text=function(t,x,y,...r){ reg.txt.push({p:reg.pags,t:String(t).slice(0,110),
      x:Math.round(Number(x)*10)/10, y:Math.round(Number(y)*10)/10}); return ot(t,x,y,...r) };
    const oi=dd.addImage.bind(dd);
    dd.addImage=function(data,fmt,x,y,w,h,...r){ reg.imgs.push({p:reg.pags,
      x:Math.round(Number(x)*10)/10, y:Math.round(Number(y)*10)/10,
      w:Math.round(Number(w)*10)/10, h:Math.round(Number(h)*10)/10,
      ch:String(data||'').length}); return oi(data,fmt,x,y,w,h,...r) };
    dd.save=function(){return true}; dd.output=function(){return ''};
    return dd;
  };
  Object.keys(Orig).forEach(k=>{try{window.jspdf.jsPDF[k]=Orig[k]}catch(e){}});
  try{ const pl=document.getElementById('pdf_plantilla');
       if(pl){pl.value='clasico'; pl.dispatchEvent(new Event('change',{bubbles:true}))} }catch(e){}
  try{ if(typeof _pdfAjustarA4==='function') await _pdfAjustarA4();
       else if(typeof generarPDF==='function') await generarPDF() }catch(e){ reg.err=String(e).slice(0,180) }
  window.jspdf.jsPDF=Orig;
  return reg;
})()`;

const BARRAS=['CONTRACTILIDAD','STRAIN','DIAGRAMA 3D','COMUNICACION INTERAURICULAR',
  'JET PARAVALVULAR','VÁLVULA AÓRTICA BICÚSPIDE','FORAMEN OVAL PERMEABLE',
  'VÁLVULA MITRAL','OREJUELA','IMÁGENES DEL ESTUDIO','CARDIOPATÍAS CONGÉNITAS',
  'DIAGRAMAS','CARDIOPATIAS CONGENITAS'];

const b=await chromium.launch({channel:'chrome'});
const OUT={archivo:FILE,_pageErr:[],_consola:[]};
try{
  const pg=await b.newPage({viewport:{width:1280,height:800}});
  pg.on('pageerror',e=>{OUT._pageErr.push(e.message.slice(0,160))});
  pg.on('console',m=>{ if(m.type()==='error') OUT._consola.push(m.text().slice(0,160)) });
  await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
  await pg.waitForTimeout(2000);
  for(const k of SOLO){
    if(!ESCENAS[k]) continue;
    /* ADVERTENCIA: UNA CARGA LIMPIA POR ESCENA. limpiarCampos(true) NO vacia imgSlots, ni deshace el
       stub del 3D, ni saca el esquema de la orejuela: midiendo en serie, la escena «vacio»
       llegaba con trece capturas y el 3D prendido, o sea que su «identico a HEAD» no probaba
       nada. Costo una corrida. */
    await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
    await pg.waitForTimeout(1800);
    const den=await pg.evaluate(MONTAR.replace('ESC',JSON.stringify(ESCENAS[k])));
    const pdf=await pg.evaluate(PDF);
    /* mapa por hoja: barras de seccion, dibujos y si algo sale de la caja */
    const porHoja={};
    for(let p=1;p<=pdf.pags;p++){
      const tx=pdf.txt.filter(t=>t.p===p), im=pdf.imgs.filter(i=>i.p===p);
      const barras=tx.filter(t=>BARRAS.some(bb=>t.t.indexOf(bb)>-1)).map(t=>t.t+'@'+t.y);
      porHoja['h'+p]={ barras:barras, nImg:im.length,
        img:im.map(i=>i.x+','+i.y+' '+i.w+'x'+i.h).join(' | '),
        nTxt:tx.length,
        fueraDeCaja: im.filter(i=>i.y+i.h>pdf.h-5 || i.x+i.w>pdf.w-5 || i.y<0 || i.x<0)
                       .map(i=>i.x+','+i.y+' '+i.w+'x'+i.h).join(' | ') || 'no',
        txtFuera: tx.filter(t=>t.y>pdf.h-4 || t.y<0).map(t=>t.t.slice(0,40)+'@'+t.y).join(' | ') || 'no' };
    }
    /* LAS HOJAS DE DIAGRAMAS: las que tienen una barra de diagrama o un dibujo. Es el numero
       del que habla el medico («hoy 4 hojas»), no el total del PDF. */
    const hojasDiag=Object.keys(porHoja).filter(h=>porHoja[h].nImg>0 || porHoja[h].barras.length);
    OUT[k]={ denom:den, hojas:pdf.pags, hojasConDiag:hojasDiag.length, cuales:hojasDiag.join(','),
             /* TODOS los textos, para poder diferenciar «se movio» de «se perdio»: la
                composicion puede cambiar sin que una palabra se vaya, y eso hay que medirlo. */
             txt:pdf.txt.map(t=>t.t),
             construcciones:pdf.construcciones,
             err:pdf.err, caja:pdf.w+'x'+pdf.h, porHoja:porHoja,
             nImgTotal:pdf.imgs.length, nTxtTotal:pdf.txt.length };
    console.log('-- '+k+': '+pdf.pags+' hoja(s) PDF, '+hojasDiag.length+' con diagramas ('
      +hojasDiag.join(',')+'), '+pdf.imgs.length+' dibujo(s), '+pdf.construcciones+' construccion(es) · on='
      +JSON.stringify(den.on)+' caps='+den.capturas+' esq='+den.esquemas+(pdf.err?' ERR '+pdf.err:''));
  }
  await pg.close();
}catch(e){OUT._err=String(e).slice(0,300)}
try{await b.close()}catch(e){}
fs.writeFileSync(OUTF,JSON.stringify(OUT,null,1));
console.log('escrito: '+OUTF);
