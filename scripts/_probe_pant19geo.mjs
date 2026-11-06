#!/usr/bin/env node
/** _probe_pant19geo.mjs - PANT-19: la fila del modelo y la card a 1440, 1000, 768 y 390 px,
 *  en los DOS temas, en Chrome y en WebKit. Nombre propio: verificado con ls. */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const SOLO=arg('--motor');

const MEDIR = `(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
  const C=id=>{const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();
    return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)}};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  try{ if(typeof showTab==='function') showTab('valvulas') }catch(e){}
  const d=document.getElementById('ete-seccion-valv-aortica');
  for(let i=0;i<3 && d && getComputedStyle(d).display==='none';i++){try{toggleEteSeccion('valv-aortica')}catch(e){}}
  /* las transiciones apagadas ANTES de medir: a mitad de una, el rect es el de un estado que no existe */
  const st=document.createElement('style'); st.textContent='*{transition:none !important;animation:none !important}';
  document.head.appendChild(st);
  S('nombre','G'); S('ci','19'); S('peso','75'); S('talla','175');
  S('va_morf','Pr\\u00f3tesis mec\\u00e1nica');
  S('va_prot_modelo','St. Jude Medical Standard'); S('va_prot_tam','23');
  S('gmedio_ao','24.5'); S('ea_dtsvi','21'); S('ea_vtitsvi','18'); S('ea_vtiao','60');
  try{ calcAo() }catch(e){} try{ vModSync('va') }catch(e){}
  await esperar(420);
  const fila=document.getElementById('va_morf') ? document.getElementById('va_morf').closest('.valv-morf-row') : null;
  const rf=fila?fila.getBoundingClientRect():null;
  const R={ select:C('va_morf'), boton:C('vmod-va-btn'),
            fila: rf?{w:Math.round(rf.width),h:Math.round(rf.height)}:null,
            chips:C('vmod-va-chips'), sub:C('vmod-va-sub'), med:C('vmod-va-med'),
            nChips:(document.getElementById('vmod-va-chips')||{querySelectorAll:()=>[]}).querySelectorAll('.vmod-chip').length,
            scrollCuerpo: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth) };
  /* la card abierta */
  document.getElementById('vmod-va-btn').click();
  await esperar(260);
  const c=document.getElementById('vmod-card');
  const rc=c?c.getBoundingClientRect():null;
  R.card = rc?{w:Math.round(rc.width),h:Math.round(rc.height),x:Math.round(rc.x),y:Math.round(rc.y),
               dentro: rc.left>=-1 && rc.right<=window.innerWidth+1 && rc.top>=-1 && rc.bottom<=window.innerHeight+1,
               hoja: Math.abs(rc.bottom-(window.innerHeight-8))<3 }:null;
  R.cardScroll = c ? (c.scrollHeight>c.clientHeight+1) : null;
  R.btn44 = (()=>{const b=document.getElementById('vmod-va-btn');if(!b)return null;
    const r=b.getBoundingClientRect(); const p=[[r.left+3,r.top+3],[r.right-3,r.top+3],[r.left+3,r.bottom-3],
      [r.right-3,r.bottom-3],[r.left+r.width/2,r.top+r.height/2]];
    return p.filter(([x,y])=>{const e=document.elementFromPoint(x,y);return e && (e===b||b.contains(e))}).length;})();
  /* texto recortado dentro de la fila y la card */
  R.recortes = Array.from(document.querySelectorAll('#vmod-va-chips .vmod-chip, #vmod-va-sub, #vmod-card .vmod-exp-g b'))
    .filter(e=>e.scrollWidth>e.clientWidth+2).length;
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  return R;
})()`;

const motores=[];
try{ const {chromium}=_pw; motores.push(['chrome', await chromium.launch({channel:'chrome',headless:true})]); }catch(e){ console.log('sin chrome: '+e.message) }
if (SOLO!=='chrome'){ try{ const {webkit}=_pw; motores.push(['webkit', await webkit.launch({headless:true})]); }catch(e){ console.log('sin webkit: '+e.message) } }
const OUT={};
for (const [nm,b] of motores){
  for (const tema of ['light','dark']){
    for (const w of [1440,1000,768,390]){
      const ctx=await b.newContext({viewport:{width:w,height:900}, colorScheme:tema});
      const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
      await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
      await pg.waitForTimeout(1200);
      let R; try{ R=await pg.evaluate(MEDIR) }catch(e){ R={ERR:String(e).slice(0,250)} }
      R._err=errs.length; OUT[nm+'/'+tema+'/'+w]=R;
      await ctx.close();
    }
  }
  await b.close();
}
console.log('ARCHIVO '+FILE);
console.log(JSON.stringify(OUT,null,1));
