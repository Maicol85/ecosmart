#!/usr/bin/env node
/** _probe_pant20inv.mjs - PANT-20 commit 1: INVENTARIO de solo lectura de las filas de
 *  morfologia de las tres valvulas (mitral, tricuspide, pulmonar), sus campos medidos y el
 *  ancho disponible, a los cuatro anchos y en los dos temas.
 *  Nombre propio: verificado con ls, no existia. */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw;
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');

const CUERPO=`(async () => {
  const R={};
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE '+id;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'};
  const geo=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();
    return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)}};
  const abrirSec=k=>{const d=document.getElementById('ete-seccion-'+k);if(!d)return 'NO EXISTE';
    for(let i=0;i<3 && getComputedStyle(d).display==='none';i++){try{toggleEteSeccion(k)}catch(e){return 'ERR'}}
    return getComputedStyle(d).display;};
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  try{ if(typeof showTab==='function') showTab('valvulas') }catch(e){}
  ['valv-mitral','valv-tricuspide','valv-pulmonar','valv-aortica'].forEach(abrirSec);
  S('nombre','P20'); S('ci','20'); S('peso','75'); S('talla','175');
  S('vm_morf','Prótesis mecánica'); S('vt_morf','Prótesis mecánica'); S('vp_morf','Prótesis mecánica');
  await esperar(400);

  /* las filas de morfologia de las cuatro valvulas */
  const FILAS={
    va:'#tab-valvulas #va_morf', vm:'#tab-valvulas #vm_morf',
    vt:'#tab-valvulas #vt_morf', vp:'#tab-valvulas #vp_morf'};
  const F={};
  Object.keys(FILAS).forEach(k=>{
    const sel=document.querySelector(FILAS[k]);
    if(!sel){F[k]={err:'sin select'};return}
    const fg=sel.closest('.fg'); const fila=fg?fg.parentElement:null;
    const cs=fila?getComputedStyle(fila):null;
    const hijos=fila?Array.from(fila.children).map(c=>({cls:c.className,id:(c.querySelector('select,button,input')||{}).id||'',
      w:Math.round(c.getBoundingClientRect().width)})):[];
    const rf=fila?fila.getBoundingClientRect():null;
    const rs=sel.getBoundingClientRect();
    F[k]={filaCls:fila?fila.className:'-', display:cs?cs.display:'-', cols:cs?cs.gridTemplateColumns:'-',
      fila:rf?{w:Math.round(rf.width),h:Math.round(rf.height)}:null,
      select:{w:Math.round(rs.width),h:Math.round(rs.height)},
      libreDerecha: rf? Math.round(rf.right - rs.right):null,
      hijos:hijos, nHijos:hijos.length};
  });
  R.filas=F;
  R.botonInsuf=geo('#pill-insuf-mitral');
  R.vmodVaBtn=geo('#vmod-va-btn');

  /* campos medidos de cada valvula: existencia, rotulo, unidad, tipo */
  const med=(ids)=>ids.map(id=>{const e=document.getElementById(id);
    if(!e) return {id:id,existe:false};
    const fg=e.closest('.fg'); const lb=fg?fg.querySelector('label'):null;
    return {id:id,existe:true,tipo:e.type,ro:!!e.readOnly,
      lbl:lb?lb.textContent.replace(/\\s+/g,' ').trim().slice(0,60):'-',valor:String(e.value||'')};});
  R.medMitral=med(['em_gmedio','em_vmax','em_gmax','em_thp_display','avm_cont','avm_plan','vm_dvi','em_vtimit']);
  R.medTric=med(['et_gmedio','et_thp','et_avt','et_e_vmax','vt_dvi','et_vti_diast']);
  R.medPulm=med(['ep_gmedio','ep_vmax','ep_gmax','vp_dvi','vp_tipo_prot']);

  /* los registros de datos ya cargados */
  R.cat={A4:(window.PROT_CAT_A4||[]).length, A5:(window.PROT_CAT_A5||[]).length,
         TAVI:(window.PROT_CAT_TAVI||[]).length,
         A7:!!window.PROT_CAT_A7, A8:!!window.PROT_CAT_A8, A9:!!window.PROT_CAT_A9};
  R.vmodPos=Object.keys(window.VMOD_POS||{});
  /* los cortes que la app YA aplica a protesis tricuspide y pulmonar */
  R.T19=window.VT_PROT_T19?JSON.parse(JSON.stringify(window.VT_PROT_T19)):null;
  R.T15=window.VP_PROT_T15?JSON.parse(JSON.stringify(window.VP_PROT_T15)):null;
  R.T11=window.VM_PROT_T11?JSON.parse(JSON.stringify(window.VM_PROT_T11)):null;
  R.ppmMitral=window.VM_PROT_PPM_CORTES?JSON.parse(JSON.stringify(window.VM_PROT_PPM_CORTES)):null;
  /* censo de campos y Excel */
  try{ R.campos=(typeof _camposDelEstudio==='function')?Object.keys(_camposDelEstudio()).length:null }catch(e){ R.campos='EXC' }
  try{ const f=(typeof _labExcelRow==='function')?_labExcelRow({campos:{}}):null; R.excel=f?Object.keys(f).length:null }catch(e){ R.excel='EXC' }
  /* ficha de Referencias de protesicas */
  const rp=document.getElementById('ref-protesicas');
  R.refProt= rp? Array.from(rp.querySelectorAll('h2.card-head')).map(h=>h.textContent.replace(/\\s+/g,' ').trim()) : 'NO EXISTE';
  return R;
})()`;

const b=await chromium.launch({channel:'chrome'});
const out={};
for (const [W,H] of [[1440,900],[1000,900],[768,900],[390,844]]){
  for (const tema of ['dark','light']){
    const ctx=await b.newContext({viewport:{width:W,height:H}});
    const p=await ctx.newPage();
    const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
    await p.goto('file://'+FILE); await p.waitForTimeout(1400);
    if(tema==='light'){ try{ await p.evaluate(()=>{document.documentElement.setAttribute('data-theme','light')}) }catch(e){} await p.waitForTimeout(200); }
    let r; try{ r=await p.evaluate(CUERPO) }catch(e){ r={ERR:String(e).slice(0,300)} }
    r._errs=errs;
    out[W+'x'+tema]=r;
    await ctx.close();
  }
}
await b.close();
console.log(JSON.stringify(out,null,1));
