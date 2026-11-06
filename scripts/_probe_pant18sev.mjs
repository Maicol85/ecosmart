#!/usr/bin/env node
/** _probe_pant18sev.mjs — PANT-18 commit 5: la tarjeta de severidad resumida.
 *  Recorre TODOS los resultados posibles, mide lo visible y lo plegado, y comprueba que cada
 *  afirmacion visible existe en el detalle y que el veredicto y su color no cambiaron. */
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
 const esp=ms=>new Promise(r=>setTimeout(r,ms));
 const esc=async(morf,c)=>{ try{limpiarCampos(true)}catch(e){}
   S('nombre','P18');S('ci','5');S('peso','70');S('talla','170');
   S('va_morf',morf);
   Object.keys(c).forEach(k=>S(k,c[k]));
   try{calcAo()}catch(e){} try{calcEADetalle()}catch(e){} try{valvProtSync()}catch(e){}
   await esp(250);
   const n=document.getElementById('ea-det-sev-nota');
   const det=n?n.querySelector('details'):null;
   const sum=det?det.querySelector('summary'):null;
   /* lo VISIBLE es el nodo sin el contenido del details */
   let vis='';
   if(n){ Array.from(n.childNodes).forEach(x=>{ if(x.nodeName.toLowerCase()!=='details')
     vis += (x.textContent||'')+' | ' }) }
   const sevEl=document.getElementById('ea-det-sev');
   const sp=sevEl?sevEl.querySelector('span'):null;
   return {
     resultado: sevEl?String(sevEl.textContent||'').trim():'-',
     color: sp?getComputedStyle(sp).color:'-',
     visible: vis.replace(/\\s+/g,' ').trim(),
     visibleLargo: vis.replace(/\\s+/g,' ').trim().length,
     lineasVisibles: n? Array.from(n.childNodes).filter(x=>x.nodeName.toLowerCase()!=='details'
        && String(x.textContent||'').trim()).length : 0,
     hayPlegable: !!det,
     plegadoAlNacer: det? (det.open===false?'SI':'NO') : '-',
     rotulo: sum?String(sum.textContent||'').trim():'-',
     detalle: det? String(det.textContent||'').replace(/\\s+/g,' ').replace(/^ⓘ Ver detalle/,'').trim() : '',
     detalleLargo: det? String(det.textContent||'').replace(/\\s+/g,' ').trim().length : 0
   }; };

 const SEV={vmax_ao:'5',ea_dtsvi:'21',ea_vtitsvi:'10',ea_vtiao:'45',va_at:'101',tango_te:'300'};
 const NOR={vmax_ao:'2.5',gmedio_ao:'10',ea_dtsvi:'21',ea_vtitsvi:'20',ea_vtiao:'40',va_at:'70',tango_te:'300'};
 const POS={vmax_ao:'3.5',gmedio_ao:'25',ea_dtsvi:'21',ea_vtitsvi:'12',ea_vtiao:'40',va_at:'95',tango_te:'300'};
 const FAL={vmax_ao:'5',va_at:'101',tango_te:'300'};
 R.signif  = await esc('Prótesis mecánica',SEV);
 R.normal  = await esc('Prótesis mecánica',NOR);
 R.posible = await esc('Prótesis mecánica',POS);
 R.faltan  = await esc('Prótesis mecánica',FAL);
 R.tavi    = await esc('TAVI',SEV);
 R.bio     = await esc('Prótesis biológica',SEV);
 /* control negativo: valvula NATIVA — la nota se esconde y se vacia */
 const nat = await esc('Trivalva normal',SEV);
 const nn=document.getElementById('ea-det-sev-nota');
 R.nativa={resultado:nat.resultado, notaDisplay:nn?getComputedStyle(nn).display:'-',
           notaTexto:nn?String(nn.textContent||'').trim():'-'};
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
