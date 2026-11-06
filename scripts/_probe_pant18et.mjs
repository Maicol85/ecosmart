#!/usr/bin/env node
/** _probe_pant18et.mjs — PANT-18 commit 2: el ET y el AT/ET.
 *  Mide los tres tramos con sus bordes, los vacios, AT >= ET, el espejo en los dos
 *  sentidos, el recorrido del campo y que el papel no se movio. */
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
 const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE '+id;e.value=v;
   e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'};
 const T=id=>{const e=document.getElementById(id);return e?String((e.value||e.textContent||'')).replace(/\\s+/g,' ').trim():'NO EXISTE'};
 const esperar=ms=>new Promise(r=>setTimeout(r,ms));
 const base=async()=>{ try{limpiarCampos(true)}catch(e){}
   S('nombre','P18');S('ci','2');S('peso','70');S('talla','170');
   S('va_morf','Prótesis mecánica'); await esperar(120); };

 /* 1 · LOS TRES TRAMOS Y SUS BORDES. ET fijo en 300 ms. */
 const tramos={};
 for (const [at,et,etq] of [['90','300','0.30 normal'],['96','300','0.32 borde bajo'],
      ['105','300','0.35 medio'],['111','300','0.37 borde alto'],['114','300','0.38 signif'],
      ['150','300','0.50 signif']]){
   await base(); S('va_at',at); S('va-esp-et',et); await esperar(120);
   tramos[etq+' (AT '+at+' / ET '+et+')']=T('ea-det-atet');
 }
 R.A_tramos=tramos;

 /* 2 · LOS CASOS QUE NO SE CALCULAN */
 const nada={};
 await base(); S('va_at','101'); await esperar(100); nada['ET vacio']=T('ea-det-atet');
 await base(); S('va-esp-et','300'); await esperar(100); nada['AT vacio']=T('ea-det-atet');
 await base(); S('va_at','300'); S('va-esp-et','300'); await esperar(100); nada['AT = ET']=T('ea-det-atet');
 await base(); S('va_at','320'); S('va-esp-et','300'); await esperar(100); nada['AT > ET']=T('ea-det-atet');
 await base(); S('va_at','101'); S('va-esp-et','-5'); await esperar(100); nada['ET negativo']=T('ea-det-atet');
 R.B_sinCalculo=nada;

 /* 3 · CONTROL NEGATIVO: valvula NATIVA — la fila se esconde */
 await base(); S('va_morf','Trivalva normal'); S('va_at','101'); S('va-esp-et','300'); await esperar(150);
 const f=document.getElementById('ea-det-atet-row');
 R.C_nativa={fila:f?getComputedStyle(f).display:'NO EXISTE', valor:T('ea-det-atet'),
             filaAT:(document.getElementById('ea-det-at-row')||{}).style.display};

 /* 4 · EL ESPEJO EN LOS DOS SENTIDOS, con el gesto real */
 await base(); S('va-esp-et','250'); await esperar(120);
 const esp1={tras_escribir_en_Valvulas:{espejo:T('va-esp-et'),dueno:T('tango_te')}};
 S('tango_te','280'); await esperar(120);
 esp1.tras_escribir_en_Doppler={espejo:T('va-esp-et'),dueno:T('tango_te')};
 S('va-esp-et',''); await esperar(120);
 esp1.tras_borrar_en_Valvulas={espejo:T('va-esp-et'),dueno:T('tango_te')};
 R.D_espejo=esp1;

 /* 5 · EL RECORRIDO DEL CAMPO: censo, Excel, Nuevo estudio, restauracion */
 await base(); S('va_at','101'); S('va-esp-et','300'); await esperar(150);
 const censo=()=>{const o={};document.querySelectorAll('input[id],select[id],textarea[id]').forEach(e=>{
    if(typeof _noEsDelEstudio==='function'&&_noEsDelEstudio(e.id))return;
    if(e.type==='checkbox'){o[e.id+'__chk']=e.checked?'1':'0'}else{o[e.id]=e.value}});return o};
 const C=censo();
 R.E_recorrido={
   censoN:Object.keys(C).length,
   tango_te_guardado: ('tango_te' in C)?('SI, '+C.tango_te):'NO',
   espejo_guardado: ('va-esp-et' in C)?'SI — MAL':'NO (correcto)',
   fueraDelEstudio: (typeof _CAMPOS_FUERA_DEL_ESTUDIO!=='undefined')?_CAMPOS_FUERA_DEL_ESTUDIO.test('va-esp-et'):'no hay'
 };
 try{ const row=_labExcelRow({campos:C,fecha:'2026-11-06',nombre:'P18'});
   R.E_recorrido.excelN=Object.keys(row).length; }catch(e){R.E_recorrido.excelErr=String(e).slice(0,150)}
 /* restauracion: sembrar el DUENO mudo y correr el embudo, como al reabrir un estudio */
 try{limpiarCampos(true)}catch(e){}
 R.E_recorrido.tras_nuevoEstudio={espejo:T('va-esp-et'),dueno:T('tango_te'),fila:T('ea-det-atet')};
 S('va_morf','Prótesis mecánica');
 const d=document.getElementById('tango_te'); if(d) d.value='300';
 const a2=document.getElementById('va_at'); if(a2) a2.value='101';
 try{ if(typeof RECALC_MODULOS==='function') RECALC_MODULOS().forEach(f2=>{try{f2()}catch(e){}}) }catch(e){}
 try{ if(typeof valvProtSync==='function') valvProtSync() }catch(e){}
 await esperar(200);
 R.E_recorrido.tras_siembra_muda={espejo:T('va-esp-et'),dueno:T('tango_te'),fila:T('ea-det-atet')};
 return R;})()`;
const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1500);
let R; try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,600)} }
console.log('ARCHIVO '+FILE);
console.log(JSON.stringify(R,null,1));
console.log('ERRORES DE PAGINA = '+errs.length+(errs.length?(' :: '+errs.slice(0,3).join(' | ')):''));
await b.close();
