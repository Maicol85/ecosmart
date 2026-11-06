#!/usr/bin/env node
/** _probe_pant18pant.mjs — PANT-18: la geometria de la seccion de la valvula aortica de
 *  Valvulas a 1440, 1000, 768 y 390 px, en los dos temas. Mide alto y ancho, el area tactil
 *  de los campos nuevos, el desplazamiento horizontal y el texto recortado. */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw;
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const MOTOR=arg('--motor')||'chrome';

const CUERPO=`(async()=>{
 ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
 const S=(id,v)=>{const e=document.getElementById(id);if(!e)return;e.value=v;
   e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
 try{limpiarCampos(true)}catch(e){}
 S('nombre','P18');S('ci','3');S('peso','70');S('talla','170');
 S('va_morf','Prótesis mecánica');
 S('vmax_ao','5');S('ea_dtsvi','21');S('ea_vtitsvi','10');S('ea_vtiao','45');
 S('va_at','101'); S('tango_te','300');
 /* la pastilla de la lesion, por su gesto real */
 (function(){const b=document.getElementById('pill-esten-aortica');
   if(b && !b.classList.contains('btn-primary')) b.click()})();
 try{calcAo()}catch(e){} try{calcEADetalle()}catch(e){} try{valvProtSync()}catch(e){}
 /* ⚠️ LA PESTANIA SE ABRE DESPUES DE SEMBRAR, Y POR SU BOTON REAL. limpiarCampos vuelve a la
    pestania Paciente, asi que abrirla antes la cierra otra vez y TODO informa 0x0 — y entonces
    la condicion de misma fila compara dos ceros y da que si. */
 (function(){const b=Array.from(document.querySelectorAll('button.tab-btn'))
   .find(x=>/Válvulas/.test(x.textContent||'')); if(b) b.click()})();
 await new Promise(r=>setTimeout(r,350));
 /* Y LA SECCION DE LA VALVULA AORTICA ES UN ACORDEON QUE NACE CERRADO: sin abrirlo, su div
    informa alto 0 con la pestania abierta y todo lo de adentro mide 0x0. Se abre por su toggle
    y se comprueba que de verdad quedo abierto, que es el denominador. */
 try{ if(typeof toggleEteSeccion==='function') toggleEteSeccion('valv-aortica') }catch(e){}
 await new Promise(r=>setTimeout(r,350));
 /* apagar las transiciones ANTES de medir: una caja a mitad de animacion informa otra cosa */
 const st=document.createElement('style');
 st.textContent='*{transition:none !important;animation:none !important}';
 document.head.appendChild(st);
 await new Promise(r=>setTimeout(r,400));
 const R={};
 const cj=id=>{const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();
   return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)}};
 R.seccion = cj('va-lesiones') || cj('bloque-prot-va');
 R.DENOM = (R.seccion && R.seccion.h>0) ? 'ok — la seccion tiene caja' : 'VACIO — la seccion mide 0';
 R.bloqueProt = cj('bloque-prot-va');
 R.campoAT = cj('va_at');
 R.campoET = cj('va-esp-et');
 R.mismaFila = (function(){const a=document.getElementById('va_at'),b=document.getElementById('va-esp-et');
   if(!a||!b) return 'falta uno'; const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
   if(!(ra.height>0&&rb.height>0)) return 'SIN CAJA — no se puede afirmar';
   return Math.abs(ra.y-rb.y)<2 ? 'SI (misma y)' : ('NO — y '+Math.round(ra.y)+' vs '+Math.round(rb.y))})();
 R.filaATET = cj('ea-det-atet-row');
 R.textoATET = (document.getElementById('ea-det-atet')||{}).textContent;
 R.textoAT = (document.getElementById('ea-det-at')||{}).textContent;
 /* area tactil del campo ET: alto >= 44 no aplica a un input de formulario; se mide su alto real
    y el de su vecino, que es el contrato «mismo estilo» */
 R.altoAT = R.campoAT? R.campoAT.h : null;
 R.altoET = R.campoET? R.campoET.h : null;
 /* desplazamiento horizontal del cuerpo y textos recortados en la seccion */
 R.scrollX = document.documentElement.scrollWidth > document.documentElement.clientWidth+1
   ? (document.documentElement.scrollWidth-document.documentElement.clientWidth) : 0;
 const cont=document.getElementById('bloque-prot-va');
 R.recortados=0;
 if(cont){ cont.querySelectorAll('label,span,input').forEach(e=>{
   if(e.scrollWidth>e.clientWidth+2 && e.clientWidth>0) R.recortados++ }) }
 /* ── lo que la tanda cambio, en las mismas condiciones ── */
 const tx=id=>{const e=document.getElementById(id);return e?String(e.textContent||'').replace(/\s+/g,' ').trim():'NO EXISTE'};
 R.tarjeta = tx('ea-det-sev');
 const sp=(document.getElementById('ea-det-sev')||{}).querySelector
   ? document.getElementById('ea-det-sev').querySelector('span') : null;
 R.tarjetaColor = sp?getComputedStyle(sp).color:'-';
 const n=document.getElementById('ea-det-sev-nota');
 const det=n?n.querySelector('details'):null;
 R.plegable = det ? ('si, open='+det.open) : 'NO HAY';
 R.notaAT_ok = tx('ea-det-at-nota').indexOf('hoja 18, folio 19')>=0 &&
               tx('ea-det-at-nota').indexOf('único punto de corte')===-1;
 const btn=document.getElementById('sevbtn-esten-aortica');
 R.boton = btn ? (String(btn.textContent||'').trim()+' | '+btn.className+' | '+getComputedStyle(btn).backgroundColor) : '-';
 const fic=document.getElementById('ref-pao');
 R.refBloque = fic ? (String(fic.textContent||'').indexOf('AT y AT/ET (ASE 2024, Tabla 5, hoja 18 · folio 19)')>=0) : 'NO HAY';
 R.globos = document.querySelectorAll('[data-vinfo]').length;
 return R;})()`;

const anchos=[1440,1000,768,390];
/* ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
   channel chrome: el binario de chromium de Playwright no esta instalado en esta maquina. */
const _motor = (MOTOR === 'webkit') ? _pw.webkit : chromium;
const b = await _motor.launch(MOTOR === 'webkit' ? { headless:true }
                                                 : { channel:'chrome', headless:true });
console.log('ARCHIVO '+FILE+'   MOTOR '+MOTOR);
for (const tema of ['dark','light']) {
  for (const w of anchos) {
    const pg=await b.newPage({viewport:{width:w,height:900},colorScheme:tema==='dark'?'dark':'light'});
    const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
    await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
    await pg.waitForTimeout(1200);
    let R; try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,250)} }
    console.log('  '+tema+' @'+w+'px  '+JSON.stringify(R)+'  errores='+errs.length);
    await pg.close();
  }
}
await b.close();
