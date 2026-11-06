#!/usr/bin/env node
/** _probe_pant18btn.mjs — PANT-18 commit 8: el boton «Severidad» de la estenosis aortica.
 *  Mide su color con cada resultado de la tarjeta, en los DOS temas, con el gesto real, y
 *  comprueba que el valor guardado y el informe NO cambian. Mide el contraste del boton. */
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
 /* contraste WCAG entre el texto y el fondo del propio boton */
 const lum=c=>{const m=String(c).match(/\\d+/g)||[0,0,0];
   const f=m.slice(0,3).map(x=>{const v=x/255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});
   return 0.2126*f[0]+0.7152*f[1]+0.0722*f[2]};
 const contraste=(a,b)=>{const L1=lum(a),L2=lum(b);
   return Math.round(((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05))*100)/100};
 const esc=async(morf,c,manual)=>{ try{limpiarCampos(true)}catch(e){}
   S('nombre','P18');S('ci','8');S('peso','70');S('talla','170');S('va_morf',morf);
   Object.keys(c).forEach(k=>S(k,c[k]));
   try{calcAo()}catch(e){} try{calcEADetalle()}catch(e){} try{valvProtSync()}catch(e){}
   if(manual){ try{ valvSev.aplicar('esten','aortica',manual) }catch(e){} }
   await esp(300);
   const btn=document.getElementById('sevbtn-esten-aortica');
   const cs=btn?getComputedStyle(btn):null;
   /* el informe, para probar que no cambio */
   /* ⚠️ EL INFORME SE LEE EN CRUDO: el helper T colapsa los saltos de linea, asi que partir por
      salto despues de pasarlo por T devuelve UNA sola linea y el filtro trae la primera del
      informe en vez de la de la aortica. */
   let inf='';
   try{ if(typeof generarInforme==='function') generarInforme();
        const e=document.getElementById('informe_texto'); inf=e?String(e.value||''):'' }catch(e){}
   const la=inf.split(String.fromCharCode(10)).filter(l=>/aórtica|VAo/.test(l))[0]||'(sin linea aortica)';
   const P=(typeof eaProtVeredicto==='function')?eaProtVeredicto():null;
   return { tarjeta:T('ea-det-sev'), nivel:P?(P.nivel||'-'):'NULL',
            btnTxt:btn?String(btn.textContent||'').trim():'-',
            btnClases:btn?btn.className:'-',
            bg:cs?cs.backgroundColor:'-', fg:cs?cs.color:'-',
            contraste: cs?contraste(cs.color,cs.backgroundColor):'-',
            ea_grado:(document.getElementById('ea_grado')||{}).value,
            lineaInforme: la.slice(0,110) }; };
 const SEV={vmax_ao:'5',ea_dtsvi:'21',ea_vtitsvi:'10',ea_vtiao:'45',va_at:'101',tango_te:'300'};
 const POS={vmax_ao:'3.5',gmedio_ao:'25',ea_dtsvi:'21',ea_vtitsvi:'12',ea_vtiao:'40'};
 const NOR={vmax_ao:'2.5',gmedio_ao:'10',ea_dtsvi:'21',ea_vtitsvi:'20',ea_vtiao:'40'};
 const FAL={vmax_ao:'5'};
 R.signif   = await esc('Prótesis mecánica',SEV);
 R.posible  = await esc('Prótesis mecánica',POS);
 R.normal   = await esc('Prótesis mecánica',NOR);
 R.faltan   = await esc('Prótesis mecánica',FAL);
 R.tavi     = await esc('TAVI',SEV);
 R.nativaSev= await esc('Trivalva normal',SEV);
 /* CONTROL: con un grado fijado A MANO gana el del medico */
 R.manual   = await esc('Prótesis mecánica',SEV,'moderada');
 return R;})()`;
const b=await chromium.launch({channel:'chrome',headless:true});
console.log('ARCHIVO '+FILE);
for (const tema of ['dark','light']) {
  const pg=await b.newPage({viewport:{width:1440,height:900},colorScheme:tema});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
  await pg.waitForTimeout(1500);
  let R; try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,400)} }
  console.log('--- tema '+tema+' --- errores='+errs.length);
  Object.keys(R).forEach(k=>{ const v=R[k];
    console.log('  %s'.replace('%s',k.padEnd(10))+' nivel='+String(v.nivel).padEnd(8)+
      ' btn=«'+String(v.btnTxt).padEnd(14)+'» clases='+String(v.btnClases).padEnd(24)+
      ' bg='+String(v.bg).padEnd(20)+' contraste='+v.contraste+
      ' ea_grado='+JSON.stringify(v.ea_grado));
    console.log('             tarjeta=«'+v.tarjeta+'»  informe: '+v.lineaInforme);
  });
  await pg.close();
}
await b.close();
