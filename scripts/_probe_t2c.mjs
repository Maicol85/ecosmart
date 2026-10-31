#!/usr/bin/env node
/**
 * _probe_t2c.mjs — la sonda del panel de muerte subita de la miocardiopatia hipertrofica
 * (TGA-2, commit 5).
 *
 * EXISTE PORQUE EL A/B GENERAL DA UN CERO VACUO SOBRE ESTE COMMIT. Ninguna de las 163 escenas
 * de `_probe_t2ab.mjs` carga una miocardiopatia hipertrofica, asi que su «cero diferencias» no
 * distingue «la seccion no toca el papel» de «la sonda no mira una escena donde pueda actuar».
 * Esta mide la seccion con la cardiopatia CARGADA, y declara sus denominadores.
 *
 *   node scripts/_probe_t2c.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates.
 */
const _pw=(await import(process.env.HOME+'/.pwtmp/node_modules/playwright/index.js')).default;
const {chromium}=_pw;
const arg=n=>{const i=process.argv.indexOf(n);return i>0?process.argv[i+1]:null};
const FILE=arg('--file')||'/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const b=await chromium.launch({channel:'chrome',headless:true}); const pg=await b.newPage();
const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000}); await pg.waitForTimeout(1500);
const r=await pg.evaluate(`(()=>{
  ['modalAvisoEco','login-overlay'].forEach(i=>{const m=document.getElementById(i); if(m)m.style.display='none'});
  const S=(id,v)=>{const e=document.getElementById(id); if(!e)return 'NO '+id; e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return e.value};
  const lim=()=>{ try{limpiarCampos(true)}catch(e){} try{_indClinLimpiar()}catch(e){} };
  const sec=IND_SECS.find(x=>x.tit.indexOf('Miocardiopatía hipertrófica — prevención')===0);
  if(!sec) return {registrada:false, titulos:IND_SECS.map(x=>x.tit).slice(-5)};
  const leer=()=>{ let R=null; try{R=sec.fn()}catch(e){return{err:String(e.message)}}
    if(!R) return {aplica:false};
    const lin=[]; R.bloques.forEach(b=>b.lineas.forEach(l=>lin.push(l.txt)));
    const cl={I:0,IIa:0,IIb:0};
    lin.forEach(t=>{ if(t.indexOf('Clase I · ')===0)cl.I++; if(t.indexOf('Clase IIa')===0)cl.IIa++; if(t.indexOf('Clase IIb')===0)cl.IIb++; });
    return {aplica:true,filas:(R.filas||[]).map(f=>f.lbl+'='+f.val),preg:(R.clinica||[]).length,
      conCtrl:(R.clinica||[]).filter(f=>f.ctrl).length,bloques:R.bloques.map(b=>({t:b.tit.slice(0,50),n:b.lineas.length})),
      cl,guia:R.guia.ref,marcas:(R.clinica||[]).map(f=>f.marca).join(','),
      bal:lin.filter(t=>t.indexOf('sin contestar')>=0||t.indexOf('Condiciones presentes')>=0)[0]||'SIN'};
  };
  const out={registrada:true};
  lim(); S('mch_espesor','18'); S('mch_grad_valsalva','70'); S('mch_cf','iii_iv');
  S('mch_sam','si'); S('mch_fam_ms','si'); S('mch_sincope','si');
  S('mch_fibrosis_rmn','si'); S('mch_aneurisma_apical','si');
  out.cargada=leer();
  lim(); S('mch_espesor','18'); S('mch_grad_valsalva','10'); S('mch_sincope','si');
  out.sinObstr={scd:leer().aplica, septal: !!(typeof _indMCH==='function'? _indMCH():null)};
  _indClin['mch.scd.vida1a']='si'; _indClin['mch.scd.evaldet']='no';
  out.tresEstados=leer().marcas; out.bal2=leer().bal.slice(0,120);
  lim(); out.vacio=leer().aplica;
  return out;
})()`);
console.log(JSON.stringify(r,null,1).slice(0,3000));
console.log('errores:',errs.length,errs.slice(0,2));
await b.close(); process.exit(0);
