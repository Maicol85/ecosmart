#!/usr/bin/env node
/** _probe_pant18nota.mjs — PANT-18 commit 3: la nota del AT.
 *  Censa EN EL NAVEGADOR —sobre lo que el medico lee, no sobre el archivo— y comprueba que la
 *  decision de la tarjeta de severidad no cambia con el AT ni con el AT/ET. */
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
 const base=async(at,et)=>{ try{limpiarCampos(true)}catch(e){}
   S('nombre','P18');S('ci','4');S('peso','70');S('talla','170');
   S('va_morf','Prótesis mecánica');
   S('vmax_ao','5');S('ea_dtsvi','21');S('ea_vtitsvi','10');S('ea_vtiao','45');
   if(at!==null) S('va_at',at); if(et!==null) S('tango_te',et);
   try{calcAo()}catch(e){} try{calcEADetalle()}catch(e){} try{valvProtSync()}catch(e){}
   await esp(200); };

 /* 1 · LA NOTA NUEVA, con el gesto real */
 await base('101','300');
 R.A_nota = T('ea-det-at-nota');
 R.A_notaLargo = R.A_nota.length;

 /* 2 · CENSO EN EL NAVEGADOR: lo que el medico PUEDE LEER, sin los <script>.
       Se abren todas las pestanias y se recorre el DOM visible, mas el registro de globos y las
       fichas de Referencias. Un grep sobre el archivo cuenta comentarios: este no. */
 const PROHIBIDAS=['único punto de corte','unico punto de corte','no es sospechosa',
                   'no es sospechosa por ese camino'];
 const doc=document.cloneNode(true);
 doc.querySelectorAll('script,style').forEach(e=>e.remove());
 const txtDOM=String(doc.body?doc.body.textContent:'').replace(/\\s+/g,' ');
 let reg='';
 try{ if(typeof VINFO!=='undefined') reg=JSON.stringify(VINFO) }catch(e){}
 const todo=txtDOM+' '+reg+' '+T('ea-det-at-nota')+' '+T('ea-det-sev-nota');
 R.B_censo={};
 PROHIBIDAS.forEach(f=>{ R.B_censo[f]= (todo.split(f).length-1) });
 R.B_denominador = todo.length;   /* un cero sobre cero no prueba nada */
 R.B_controlPositivo = (todo.split('estenosis').length-1);

 /* 3 · LA DECISION DE LA TARJETA NO CAMBIA CON EL AT NI CON EL AT/ET */
 const tarj={};
 for (const [at,et,etq] of [['60','300','AT normal, AT/ET normal'],
      ['101','300','AT signif, AT/ET posible'],['150','300','AT signif, AT/ET signif'],
      ['','', 'AT y ET vacios']]){
   await base(at===''?null:at, et===''?null:et);
   if(at==='') { const e=document.getElementById('va_at'); if(e){e.value='';e.dispatchEvent(new Event('input',{bubbles:true}))} }
   await esp(150);
   const P=(typeof eaProtVeredicto==='function')?eaProtVeredicto():null;
   tarj[etq]={ tarjeta:T('ea-det-sev'), nivel:P?P.nivel:'NULL',
               filaAT:T('ea-det-at'), filaATET:T('ea-det-atet') };
 }
 R.C_tarjeta=tarj;
 return R;})()`;
const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1500);
let R; try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,600)} }
console.log('ARCHIVO '+FILE);
console.log(JSON.stringify(R,null,1));
console.log('ERRORES DE PAGINA = '+errs.length);
await b.close();
