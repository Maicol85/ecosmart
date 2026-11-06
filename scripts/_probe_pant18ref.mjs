#!/usr/bin/env node
/** _probe_pant18ref.mjs — PANT-18 commit 4: la ficha de Referencias de la protesis aortica.
 *  Mide que la ficha nace cerrada, que abre por su gesto, el texto del bloque nuevo, que las
 *  filas viejas de la tabla siguen, el conteo de globos, el teclado y el desborde a cuatro anchos. */
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
 const esp=ms=>new Promise(r=>setTimeout(r,ms));
 /* la ficha NACE CERRADA: se mide antes de tocar nada */
 const f=document.getElementById('ref-pao');
 R.naceCerrada = f? (getComputedStyle(f).display==='none' ? 'SI' : 'NO — '+getComputedStyle(f).display) : 'NO EXISTE';
 /* conteo de globos ANTES, en todo el documento */
 R.globosAntes = document.querySelectorAll('[data-vinfo]').length;
 /* se abre la pestania Referencias y la ficha, por sus gestos reales */
 (function(){const b=Array.from(document.querySelectorAll('button.tab-btn'))
   .find(x=>/Referencias/.test(x.textContent||'')); if(b) b.click()})();
 await esp(300);
 /* ⚠️ SON TRES NIVELES Y NO UNO: la ficha vive dentro de la subpestania «Valvulas» de
    Referencias, dentro de la tarjeta «Valvulas Protesicas». Con uno solo sin abrir la ficha
    informa una caja de 0x0 y «sin desborde» se lee igual que «todo bien» sobre la nada. Se
    abren los tres por sus gestos reales y se comprueba el denominador mas abajo. */
 (function(){const b=document.getElementById('ref-subtab-valv'); if(b) b.click()})();
 await esp(250);
 (function(){const h=Array.from(document.querySelectorAll('h2.card-head'))
   .find(x=>/Protésicas/i.test(x.textContent||'')); if(h) h.click()})();
 await esp(250);
 (function(){const h=Array.from(document.querySelectorAll('h2.card-head'))
   .find(x=>/Prótesis Aórtica/i.test(x.textContent||'')); if(h) h.click()})();
 await esp(400);
 const st=document.createElement('style');
 st.textContent='*{transition:none !important;animation:none !important}';
 document.head.appendChild(st);
 await esp(200);
 R.abreConGesto = f? (getComputedStyle(f).display!=='none' ? 'SI' : 'NO') : '-';
 const r=f?f.getBoundingClientRect():null;
 R.caja = r? {w:Math.round(r.width),h:Math.round(r.height)} : null;
 R.DENOM = (r && r.height>0) ? 'ok — la ficha tiene caja' : 'VACIO';
 const t=f?String(f.textContent||'').replace(/\\s+/g,' ').trim():'';
 R.largoFicha = t.length;
 /* el bloque nuevo, palabra por palabra */
 R.tieneBloque = t.indexOf('AT y AT/ET (ASE 2024, Tabla 5, hoja 18 · folio 19)')>-1 ? 'SI':'NO';
 R.tramosAT   = t.indexOf('<80 ms normal · 80–100 ms posible estenosis · >100 ms sugiere estenosis significativa')>-1?'SI':'NO';
 R.tramosATET = t.indexOf('<0,32 normal · 0,32–0,37 posible estenosis · >0,37 sugiere estenosis significativa')>-1?'SI':'NO';
 R.funcionVI  = t.indexOf('afectables por la función del ventrículo izquierdo y por la frecuencia cardíaca')>-1?'SI':'NO';
 /* CONTROL: las filas viejas de la tabla siguen */
 R.filasTablaVieja = f? f.querySelectorAll('table tr').length : 0;
 R.sigueGmedio = t.indexOf('G. medio (mmHg)')>-1?'SI':'NO';
 R.siguePPM    = t.indexOf('PPM (ASE 2024, Tabla 7, p. 20)')>-1?'SI':'NO';
 R.sigueParaval= t.indexOf('Regurgitación paravalvular')>-1?'SI':'NO';
 /* CONTROL NEGATIVO: no se comparo ni se juzgo ninguna guia */
 ['no coincide','difieren','discrepan','se contradicen','no se encontró','ninguna fuente']
   .forEach(fr=>{ R['prohibida_'+fr.slice(0,10)] = t.split(fr).length-1 });
 /* globos: no se agrego ninguno */
 R.globosDespues = document.querySelectorAll('[data-vinfo]').length;
 R.globosEnLaFicha = f? f.querySelectorAll('[data-vinfo]').length : 0;
 /* teclado: la cabecera se alcanza y responde */
 const hdr=Array.from(document.querySelectorAll('h2.card-head'))
   .find(x=>/Prótesis Aórtica/i.test(x.textContent||''));
 R.cabeceraTag = hdr? hdr.tagName : '-';
 R.cabeceraAlcanzable = hdr? (hdr.getBoundingClientRect().height>0 ? 'SI, alto '+Math.round(hdr.getBoundingClientRect().height)+'px' : 'NO') : '-';
 /* desborde */
 R.scrollXpagina = document.documentElement.scrollWidth > document.documentElement.clientWidth+1
   ? (document.documentElement.scrollWidth-document.documentElement.clientWidth) : 0;
 const tb=f?f.querySelector('table'):null;
 R.scrollTabla = tb? (tb.scrollWidth>tb.clientWidth+2 ? 'la tabla desborda su caja' : 'no') : '-';
 R.recortados=0;
 if(f){ f.querySelectorAll('b,td,th').forEach(e=>{ if(e.scrollWidth>e.clientWidth+2 && e.clientWidth>0) R.recortados++ }) }
 return R;})()`;
const b=await chromium.launch({channel:'chrome',headless:true});
console.log('ARCHIVO '+FILE);
for (const w of [1440,1000,768,390]) {
  const pg=await b.newPage({viewport:{width:w,height:900}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
  await pg.waitForTimeout(1400);
  let R; try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,300)} }
  console.log(' @'+w+'px  '+JSON.stringify(R)+'  errores='+errs.length);
  await pg.close();
}
await b.close();
