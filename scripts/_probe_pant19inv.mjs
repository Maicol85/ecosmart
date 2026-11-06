#!/usr/bin/env node
/** _probe_pant19inv.mjs - PANT-19 commit 1a: inventario de la PANTALLA de la valvula
 *  aortica y de la MITRAL, medido con el gesto real. Solo LEE. */
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
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE '+id;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'};
  const T=id=>{const e=document.getElementById(id);return e?String((e.value||e.textContent||'')).replace(/\\s+/g,' ').trim():'NO EXISTE'};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  const ops=id=>{const s=document.getElementById(id);return s?Array.from(s.options).map(o=>o.value):null};
  const caja=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)}};

  /* ---- 1a.1 los dos selects de morfologia ---- */
  R.selects={
    va_morf:{opciones:ops('va_morf'), valorSinTocar:(document.getElementById('va_morf')||{}).value},
    vm_morf:{opciones:ops('vm_morf'), valorSinTocar:(document.getElementById('vm_morf')||{}).value}
  };
  /* ---- 1a.2 hay ya algun campo de modelo / marca / tamano? ---- */
  const CENSO=[];
  document.querySelectorAll('input[id],select[id],textarea[id]').forEach(e=>{
    const id=e.id.toLowerCase();
    if(/modelo|marca|model|tamano|tama\\u00f1o|size|numero_mm|prot_n/.test(id)) CENSO.push(e.id+' ('+e.tagName+')');
  });
  R.camposModeloExistentes=CENSO;
  /* ---- 1a.3 ASC e IMC ---- */
  S('peso','75'); S('talla','175');
  R.ascImc={ getBSA:(typeof getBSA==='function')?getBSA():'NO EXISTE',
             getIMC:(typeof getIMC==='function')?getIMC():'NO EXISTE',
             idPeso:!!document.getElementById('peso'), idTalla:!!document.getElementById('talla') };
  /* ---- 1a.4 cortes de PPM de las dos valvulas ---- */
  R.ppm={ aortica:(window.EA_PROT_PPM_CORTES||'NO EXISTE'),
          mitral:(window.VM_PROT_PPM_CORTES||'NO EXISTE'),
          imcObesidad:(window.VM_PROT_IMC_OBESIDAD!==undefined?window.VM_PROT_IMC_OBESIDAD:'NO EXISTE'),
          clasifAo:(typeof _eaPpmAoClasificar==='function')?'existe':'NO EXISTE',
          frases:(typeof ppmFrases==='function')?ppmFrases('aortica','moderado',0.75):'NO EXISTE' };
  /* prueba de los cortes con la MISMA indexada y dos IMC */
  if(typeof _eaPpmAoClasificar==='function'){
    R.ppm.pruebaAo={ i075_imc25:_eaPpmAoClasificar(0.75,25).ppm, i075_imc31:_eaPpmAoClasificar(0.75,31).ppm,
                     i060_imc25:_eaPpmAoClasificar(0.60,25).ppm, i060_imc31:_eaPpmAoClasificar(0.60,31).ppm };
  }
  /* ---- 1a.5 escena protesica aortica: campos medidos y tarjeta ---- */
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  S('nombre','Inv P19'); S('ci','19191919'); S('peso','75'); S('talla','175');
  S('va_morf','Prótesis mecánica');
  S('vmax_ao','3.2'); S('ea_dtsvi','21'); S('ea_vtitsvi','18'); S('ea_vtiao','60'); S('gmedio_ao','22');
  try{ if(typeof calcAo==='function') calcAo() }catch(e){}
  try{ if(typeof calcEADetalle==='function') calcEADetalle() }catch(e){}
  try{ if(typeof valvProtSync==='function') valvProtSync() }catch(e){}
  await esperar(400);
  R.aortica={
    campos:{ vmax_ao:T('vmax_ao'), gmedio_ao:T('gmedio_ao'), ava_cont:T('ava_cont'),
             ea_det_ava:T('ea-det-ava'), ea_det_avai:T('ea-det-avai'), ea_det_dvi:T('ea-det-dvi'),
             ea_prot_ppm:T('ea-prot-ppm') },
    tarjeta:{ sev:T('ea-det-sev'), lbl:T('ea-det-sev-lbl'), nota:T('ea-det-sev-nota').slice(0,900) },
    veredicto:(typeof eaProtVeredicto==='function')?eaProtVeredicto():'NO EXISTE',
    salvEOA:(window.EA_PROT_SALV||{}).eoa||'NO EXISTE',
    bloqueProt:!!document.getElementById('bloque-prot-va')
  };
  /* ---- 1a.6 escena protesica mitral ---- */
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  S('nombre','Inv P19'); S('ci','19191919'); S('peso','75'); S('talla','175');
  S('vm_morf','Prótesis mecánica');
  S('em_vmax','1.8'); S('em_gmedio','5'); S('thp','95'); S('em_vtimit','60'); S('ea_vtitsvi','18'); S('vm_dvi','2.1');
  try{ if(typeof calcEM==='function') calcEM() }catch(e){}
  try{ if(typeof valvProtSync==='function') valvProtSync() }catch(e){}
  try{ if(typeof vmProtEOAPintar==='function') vmProtEOAPintar() }catch(e){}
  await esperar(400);
  R.mitral={
    campos:{ em_vmax:T('em_vmax'), em_gmedio:T('em_gmedio'), thp:T('thp'), em_vtimit:T('em_vtimit'), vm_dvi:T('vm_dvi') },
    cuadro:{ vmax:T('vm-prot-vmax'), gmed:T('vm-prot-gmed'), eoa:T('vm-prot-eoa'), dvi:T('vm-prot-dvi'),
             thp:T('vm-prot-thp'), obstr:T('vm-prot-obstr'), ppm:T('vm-prot-ppm') },
    vmProtEOA:(typeof vmProtEOA==='function')?vmProtEOA():'NO EXISTE',
    bloqueProt:!!document.getElementById('bloque-prot-vm'),
    T11:(window.VM_PROT_T11||'NO EXISTE')
  };
  /* ---- 1a.7 rotulos reales de los campos medidos ---- */
  const rot=id=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE';
    let p=e.closest('.fg')||e.parentElement; const l=p?p.querySelector('label'):null;
    return l?l.textContent.replace(/\\s+/g,' ').trim():'(sin label)'};
  R.rotulos={}; ['vmax_ao','gmedio_ao','em_vmax','em_gmedio','thp','vm_dvi','va_at','peso','talla']
    .forEach(id=>{R.rotulos[id]=rot(id)});
  return R;
})()`;

const ANCHOS=[1440,1000,768,390];
const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1500);
let R; try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,900)} }
/* geometria de las dos filas de morfologia a los cuatro anchos, con la pestana abierta de verdad */
const GEO={};
for(const w of ANCHOS){
  await pg.setViewportSize({width:w,height:900});
  await pg.waitForTimeout(260);
  GEO['px'+w]=await pg.evaluate(`(()=>{
    ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
    try{ if(typeof showTab==='function') showTab('valvulas') }catch(e){}
    /* toggleEteSeccion ALTERNA: hay que comprobar el estado o se CIERRA lo abierto (TC-690) */
    const abrirSec=k=>{const d=document.getElementById('ete-seccion-'+k);
      if(!d) return 'NO EXISTE';
      for(let i=0;i<3 && getComputedStyle(d).display==='none';i++){
        try{ toggleEteSeccion(k) }catch(e){ return 'ERR '+e.message }
      }
      return getComputedStyle(d).display;};
    const estado={aortica:abrirSec('valv-aortica'), mitral:abrirSec('valv-mitral')};
    const c=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x)}};
    const filaDe=id=>{const s=document.getElementById(id);return s?s.closest('.valv-morf-row'):null};
    const o={};
    [['va','va_morf'],['vm','vm_morf']].forEach(([k,id])=>{
      const s=document.getElementById(id), f=filaDe(id);
      const cs=s?c(s):null, cf=f?c(f):null;
      o[k]={select:cs, fila:cf, clases:f?f.className:'-',
            huecoDerecha:(cs&&cf)?Math.round((cf.x+cf.w)-(cs.x+cs.w)):null,
            hijos:f?f.children.length:null,
            gridCols:f?getComputedStyle(f).gridTemplateColumns:'-',
            display:f?getComputedStyle(f).display:'-'};
    });
    const btn=document.getElementById('pill-insuf-mitral')||document.getElementById('pill-insuf-aortica');
    o.pastillaInsufAo=c(document.getElementById('pill-insuf-aortica'));
    o.pastillaInsufVm=c(document.getElementById('pill-insuf-mitral'));
    o.secciones=estado;
    return o;
  })()`);
}
console.log('ARCHIVO '+FILE);
console.log(JSON.stringify({INV:R,GEO:GEO},null,1));
console.log('ERRORES DE PAGINA = '+errs.length+(errs.length?(' :: '+errs.slice(0,3).join(' | ')):''));
await b.close();
