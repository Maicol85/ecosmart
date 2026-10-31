#!/usr/bin/env node
/**
 * _probe_img3raster.mjs - genera el PDF DE VERDAD, lo rasteriza hoja por hoja y verifica que
 * nada quede fuera de la hoja. Es el punto 6 de la orden de la tanda IMAGENES-3.
 *
 * El PDF se captura por `doc.output('arraybuffer')` dentro de la pagina —no por la descarga—,
 * se escribe a disco, y se rasteriza con pdf.js traido del MISMO CDN que la app ya usa. De cada
 * hoja se guarda un PNG y se mide la caja de lo que NO es blanco: si toca el borde del papel,
 * algo se dibujo fuera del area imprimible.
 *
 *   node scripts/_probe_img3raster.mjs [--file <html>] [--dir <salida>] [--escena medico]
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
const DIR=arg('--dir')||'/tmp/img3_raster';
const ESC=arg('--escena')||'medico';
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJSW='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
fs.mkdirSync(DIR,{recursive:true});

const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAN0lEQVR4nGOQszmBFTEYuZ3AihjcAk5gRQxRUSewIoa8lBNYEUNT3gmsiGFaxQmsiGFV0wmsCACkZmLBw/OU+gAAAABJRU5ErkJggg==';

const MONTAR = `(async (E) => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  const C=(id,on)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.checked=!!on;e.dispatchEvent(new Event('change',{bubbles:true}));return e.checked};
  S('nombre','Prueba Diagramas'); S('ci','55555555'); S('fecha_estudio','2026-10-31');
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','60');
  try{ if(typeof contrEstado==='object'){contrEstado['s1']=1;contrEstado['s2']=2} }catch(e){}
  S('contr_be_pdf','1');
  try{ if(typeof strainEstado==='object'){strainEstado['s1']=1;strainEstado['s2']=2} }catch(e){}
  S('sgl_gls','-15'); S('sgl_be_pdf','1');
  S('ete_cia_tipo','secundum'); S('ete_cia_d1','8'); S('ete_cia_d2','6');
  S('ete_cia_borde_vcs','4'); S('ete_cia_borde_ao','7'); S('ete_cia_dir','id'); S('ete_cia_vel','1.2');
  C('ete_shunt_incluir_chk',true);
  S('ete_tavi_pro_tam','26'); S('ete_tavi_jet_horas','2,3,4'); C('ete_tavi_incluir_chk',true);
  S('im_grado','4'); S('vm_tipo_im','primaria');
  S('ete_seg_A2','2'); S('ete_seg_P2','1');
  try{ if(typeof eteSegSync==='function') eteSegSync() }catch(e){}
  S('ete_qx_pdf','1');
  S('oai_morfologia','ala_pollo'); S('oai_ostium_diam','25'); S('oai_profundidad','33'); S('oai_vel_vac','32');
  try{ if(typeof calcOAI==='function') calcOAI() }catch(e){}
  try{ if(typeof oaiEsqGesto==='function') oaiEsqGesto() }catch(e){}
  await new Promise(r=>setTimeout(r,400));
  try{ if(typeof oaiEsqIncluirPDF==='function') oaiEsqIncluirPDF() }catch(e){}
  await new Promise(r=>setTimeout(r,400));
  if (E==='todos8' && typeof imgSlots!=='undefined') {
    for(let i=0;i<8;i++) imgSlots.push({dataURL:PNGQ,ampliada:false,calidad:'media',origen:'estudio'});
    if(typeof imgSlotCount!=='undefined') imgSlotCount=imgSlots.length;
    if(typeof imgEnsureLen==='function') imgEnsureLen();
    if(typeof imgMarcarEditado==='function') imgMarcarEditado();
  }
  Object.keys(window).forEach(k=>{if(/^calc[A-Z]/.test(k)&&typeof window[k]==='function'){try{window[k]()}catch(e){}}});
  try{ if(typeof _recalcModulos==='function') _recalcModulos('ras'); }catch(e){}
  await new Promise(r=>setTimeout(r,400));
  try{ if(typeof generarInforme==='function') generarInforme() }catch(e){}
  await new Promise(r=>setTimeout(r,400));
  return true;
})(__E__)`.replace(/PNGQ/g,JSON.stringify(PNG));

/* El PDF real, en base64, capturado por output('arraybuffer'). */
const GENERAR = `(async () => {
  if (typeof window.jspdf==='undefined' || !window.jspdf.jsPDF) return {err:'SIN JSPDF'};
  const Orig=window.jspdf.jsPDF;
  let ult=null;
  window.jspdf.jsPDF=function(...a){
    const dd=new Orig(...a);
    ult=dd;
    const oSave=dd.save.bind(dd);
    dd.save=function(){ return true };          /* no se descarga: se lee el buffer */
    return dd;
  };
  Object.keys(Orig).forEach(k=>{try{window.jspdf.jsPDF[k]=Orig[k]}catch(e){}});
  let err=null;
  try{ const pl=document.getElementById('pdf_plantilla');
       if(pl){pl.value='clasico'; pl.dispatchEvent(new Event('change',{bubbles:true}))} }catch(e){}
  try{ if(typeof _pdfAjustarA4==='function') await _pdfAjustarA4();
       else if(typeof generarPDF==='function') await generarPDF() }catch(e){ err=String(e).slice(0,160) }
  window.jspdf.jsPDF=Orig;
  if(!ult) return {err:'no se construyo ningun documento. '+(err||'')};
  let b64='';
  try{
    const ab = ult.output('arraybuffer');
    const u8 = new Uint8Array(ab);
    let s=''; const CH=0x8000;
    for(let i=0;i<u8.length;i+=CH) s+=String.fromCharCode.apply(null,u8.subarray(i,i+CH));
    b64=btoa(s);
  }catch(e){ return {err:'output: '+String(e).slice(0,140)} }
  return { b64:b64, bytes:b64.length, pags: ult.internal.getNumberOfPages(), errGen:err };
})()`;

const b=await chromium.launch({channel:'chrome'});
const OUT={archivo:FILE, escena:ESC, dir:DIR, _pageErr:[]};
try{
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const pg=await ctx.newPage();
  pg.on('pageerror',e=>OUT._pageErr.push(e.message.slice(0,150)));
  await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
  await pg.waitForTimeout(2000);
  await pg.evaluate(MONTAR.replace('__E__',JSON.stringify(ESC)));
  const r=await pg.evaluate(GENERAR);
  if(r.err){ OUT.err=r.err; }
  else{
    OUT.pags=r.pags;
    const ruta=DIR+'/'+ESC+'.pdf';
    fs.writeFileSync(ruta, Buffer.from(r.b64,'base64'));
    OUT.pdf=ruta; OUT.pdfBytes=fs.statSync(ruta).size;
    /* ── RASTERIZADO con pdf.js ── */
    const pr=await ctx.newPage();
    pr.on('pageerror',e=>OUT._pageErr.push('raster: '+e.message.slice(0,150)));
    await pr.goto('about:blank');
    await pr.addScriptTag({url:PDFJS});
    OUT.pdfjs = await pr.evaluate("typeof pdfjsLib");
    if (OUT.pdfjs !== 'object') { OUT.rasterErr='pdf.js no cargo (CDN?)'; }
    else {
      await pr.evaluate("pdfjsLib.GlobalWorkerOptions.workerSrc = " + JSON.stringify(PDFJSW));
      const medidas = await pr.evaluate(`(async (b64) => {
        const u8 = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const doc = await pdfjsLib.getDocument({data:u8}).promise;
        const out = [];
        for (let p = 1; p <= doc.numPages; p++) {
          const pag = await doc.getPage(p);
          const vp = pag.getViewport({scale:1.5});
          const cv = document.createElement('canvas');
          cv.width = Math.ceil(vp.width); cv.height = Math.ceil(vp.height);
          cv.id = 'hoja' + p;
          cv.style.cssText = 'display:block;margin:0;';
          document.body.appendChild(cv);
          await pag.render({canvasContext:cv.getContext('2d'), viewport:vp}).promise;
          /* La caja de lo que NO es blanco. Si toca el borde, algo se dibujo fuera del area. */
          const d = cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
          let x0=cv.width, y0=cv.height, x1=-1, y1=-1;
          for (let yy=0; yy<cv.height; yy++) for (let xx=0; xx<cv.width; xx++) {
            const i=(yy*cv.width+xx)*4;
            if (d[i]>248 && d[i+1]>248 && d[i+2]>248) continue;
            if (xx<x0) x0=xx; if (xx>x1) x1=xx; if (yy<y0) y0=yy; if (yy>y1) y1=yy;
          }
          out.push({ p:p, w:cv.width, h:cv.height, x0:x0, y0:y0, x1:x1, y1:y1,
                     tocaBorde: (x0<=1 || y0<=1 || x1>=cv.width-2 || y1>=cv.height-2) });
        }
        return { numPages: doc.numPages, hojas: out };
      })(__B64__)`.replace('__B64__', JSON.stringify(r.b64)));
      OUT.raster = medidas;
      for (let p=1; p<=medidas.numPages; p++) {
        const el = await pr.$('#hoja'+p);
        if (el) await el.screenshot({ path: DIR+'/'+ESC+'_hoja'+p+'.png' });
      }
      OUT.pngs = fs.readdirSync(DIR).filter(f=>f.indexOf(ESC+'_hoja')===0).sort();
    }
    await pr.close();
  }
  await pg.close(); await ctx.close();
}catch(e){OUT._err=String(e).slice(0,300)}
try{await b.close()}catch(e){}
console.log(JSON.stringify(OUT,null,1));
