#!/usr/bin/env node
/** _probe_pant18ppm.mjs — PANT-18 commit 7: el desajuste no se escribe con una estenosis
 *  significativa. Mide la PANTALLA —que la AVA indexada y su categoria NO se mueven— en las
 *  mismas combinaciones en que el papel si cambia. */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw;
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');

const CUERPO=`(async()=>{
 const R={};
 ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
 const S=(id,v)=>{const e=document.getElementById(id);if(!e)return;e.value=v;
   e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
 const T=id=>{const e=document.getElementById(id);return e?String((e.value||e.textContent||'')).replace(/\\s+/g,' ').trim():'NO EXISTE'};
 const esp=ms=>new Promise(r=>setTimeout(r,ms));
 const esc=async(morf,c)=>{ try{limpiarCampos(true)}catch(e){}
   S('nombre','P18');S('ci','7');S('peso','70');S('talla','170');S('va_morf',morf);
   Object.keys(c).forEach(k=>S(k,c[k]));
   try{calcAo()}catch(e){} try{calcEADetalle()}catch(e){} try{valvProtSync()}catch(e){}
   await esp(250);
   const P=(typeof eaProtVeredicto==='function')?eaProtVeredicto():null;
   return { nivel:P?P.nivel:'NULL', ppm:P?P.ppm:'NULL', avai:P?P.avai:null,
            filaPPM:T('ea-prot-ppm'), filaAVAi:T('ea-det-avai'), tarjeta:T('ea-det-sev') }; };
 const SEV={vmax_ao:'5',ea_dtsvi:'21',ea_vtitsvi:'10',ea_vtiao:'45',va_at:'101',tango_te:'300'};
 const POS={vmax_ao:'3.5',gmedio_ao:'25',ea_dtsvi:'21',ea_vtitsvi:'12',ea_vtiao:'40',va_at:'95',tango_te:'300'};
 const SOL={vmax_ao:'2.5',gmedio_ao:'10',ea_dtsvi:'16',ea_vtitsvi:'20',ea_vtiao:'40',va_at:'70',tango_te:'300'};
 R.mec_signif    = await esc('Prótesis mecánica',SEV);
 R.tavi_signif   = await esc('TAVI',SEV);
 R.mec_posible   = await esc('Prótesis mecánica',POS);
 R.mec_ppmSolo   = await esc('Prótesis mecánica',SOL);
 return R;})()`;
const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1500);
let R; try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,400)} }
console.log('ARCHIVO '+FILE);
console.log(JSON.stringify(R,null,1));
console.log('ERRORES DE PAGINA = '+errs.length);
await b.close();
