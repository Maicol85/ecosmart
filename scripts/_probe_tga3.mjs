#!/usr/bin/env node
/** _probe_tga3.mjs — el commit 3: la cirugia en el informe y en el EN SUMA, UNA sola vez. */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw;
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const CUERPO = `(async () => {
  const R={};
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
  const esc=(tipo,cir)=>{ try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
    S('nombre','Prueba TGA'); S('ci','44444444'); S('vd_bas','45');
    S('tga_tipo',tipo); S('tga_cirugia',cir); S('tga_func_vd','normal'); S('tga_sintomas','no');
    const ch=document.getElementById('tga_incluir_chk'); if(ch){ch.checked=true;}
    const c=(typeof tgaConclusion==='function')?tgaConclusion():null;
    const sm=(typeof ccSumaLinea==='function')?ccSumaLinea('tga'):null;
    const cnt=(t,h)=>String(h||'').split(t).length-1;
    return { txt:c?c.txt.slice(0,135):'NULL', res:c?c.resumen.slice(0,120):'NULL',
             suma:sm?String(sm).slice(0,120):'NULL',
             vecesCuerpo:c?cnt('switch auricular',c.txt)+cnt('no operada',c.txt):0,
             vecesSuma:sm?cnt('switch auricular',String(sm))+cnt('no operada',String(sm)):0,
             frase:(typeof tgaCirFrase==='function')?JSON.stringify(tgaCirFrase()):'NO HAY' } };
  R.A_dtga_sinDato = JSON.stringify(esc('dtga',''));
  R.B_dtga_ninguna = JSON.stringify(esc('dtga','ninguna'));
  R.C_dtga_auric   = JSON.stringify(esc('dtga','auricular'));
  R.D_mustard      = JSON.stringify(esc('mustard',''));
  R.E_mustard_cir  = JSON.stringify(esc('mustard','auricular'));
  R.F_senning      = JSON.stringify(esc('senning','ninguna'));
  R.G_cctga        = JSON.stringify(esc('cctga','auricular'));
  R.H_sinTipo      = JSON.stringify(esc('',''));
  return R;
})()`;
const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage();
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1200);
let R; try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,400)} }
console.log('ARCHIVO '+FILE);
Object.keys(R).forEach(k=>{
  try{ const o=JSON.parse(R[k]);
    console.log('  '+k);
    console.log('      frase  = '+o.frase+'   veces en cuerpo='+o.vecesCuerpo+' en EN SUMA='+o.vecesSuma);
    console.log('      cuerpo = '+o.txt);
    console.log('      ensuma = '+o.suma);
  }catch(e){ console.log('  '+k+' = '+R[k]) }
});
console.log('  ERRORES = '+errs.length+(errs.length?(' :: '+errs.slice(0,2).join(' | ')):''));
await b.close();
