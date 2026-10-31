#!/usr/bin/env node
/**
 * _probe_ajustes2oai.mjs — la MATRIZ 3a de la tanda AJUSTES-2: cuando sale el dibujo de la
 * orejuela en el PDF y cuando no, generando el PDF DE VERDAD y contando sus imagenes.
 *
 * Las condiciones que la orden manda inventariar: el interruptor «Incluir en el PDF» (incluido
 * el caso de tocarlo DOS veces), «Integrar al informe» de la orejuela, el estudio guardado o
 * sin guardar, Config, el orden de generacion y el cambio de pestana.
 *
 *   node scripts/_probe_ajustes2oai.mjs [--file <html>] [--out <json>]
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js','/tmp/pw/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log(JSON.stringify({error:'SIN PLAYWRIGHT'}));process.exit(2)}
const {chromium}=_pw; const fs=await import('fs');
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const OUTF=arg('--out')||'/tmp/aj2_oai.json';

/* Cada fila: que se hace, en orden. */
const CASOS = [
  { id:'A · nada',                   incluir:0, integrar:false, guardar:false },
  { id:'B · incluir x1',             incluir:1, integrar:false, guardar:false },
  { id:'C · incluir x2 (toca dos)',  incluir:2, integrar:false, guardar:false },
  { id:'D · incluir x3',             incluir:3, integrar:false, guardar:false },
  { id:'E · incluir + integrar',     incluir:1, integrar:true,  guardar:false },
  { id:'F · integrar solo',          incluir:0, integrar:true,  guardar:false },
  { id:'G · incluir + guardar',      incluir:1, integrar:false, guardar:true  },
  { id:'H · incl+guardar+REABRIR',   incluir:1, integrar:false, guardar:true, reabrir:true },
  { id:'I · incl+integ+guard+REAB',  incluir:1, integrar:true,  guardar:true, reabrir:true },
  { id:'J · incluir + cambiar tab',  incluir:1, integrar:false, guardar:false, tab:true },
  { id:'K · incluir + 2 PDF',        incluir:1, integrar:false, guardar:false, dosPdf:true },
  /* LO QUE EL MEDICO HACE DE VERDAD: reabre un estudio guardado, ve el boton y lo toca. */
  { id:'L · REABRIR y tocar x1',     incluir:1, integrar:false, guardar:true, reabrir:true, tocarTras:1 },
  { id:'M · REABRIR y tocar x2',     incluir:1, integrar:false, guardar:true, reabrir:true, tocarTras:2 }
];

const CUERPO = `(async (c) => {
  const R = { id: c.id };
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  try{ window.mostrarCardSeveridadValvular = function(cb){ if(typeof cb==='function') cb(); } }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  S('nombre','Prueba Orejuela'); S('ci','77777777');
  S('oai_morfologia','veleta'); S('oai_ostium_diam','21'); S('oai_profundidad','26');
  S('oai_vel_vac','48');
  Object.keys(window).forEach(k=>{if(/^calc[A-Z]/.test(k)&&typeof window[k]==='function'){try{window[k]()}catch(e){}}});
  await new Promise(r=>setTimeout(r,350));
  R.hayDatos = (typeof oaiEsqHayDatos==='function') ? oaiEsqHayDatos() : 'SIN FN';

  /* el gesto de INCLUIR, n veces, por el boton real */
  for (let i=0;i<c.incluir;i++){
    const b=document.getElementById('oai-esq-pdf');
    if (b) { b.click(); await new Promise(r=>setTimeout(r,450)); }
  }
  R.botonTxt = (document.getElementById('oai-esq-pdf')||{}).textContent || 'NO EXISTE';
  R.botonPressed = (document.getElementById('oai-esq-pdf')||{}).getAttribute
    ? document.getElementById('oai-esq-pdf').getAttribute('aria-pressed') : '?';
  R.estado = (document.getElementById('oai-esq-estado')||{}).textContent || '';

  if (c.integrar) { try { if(typeof amiloIntegrar==='function') amiloIntegrar('oai') }catch(e){} }
  R.integrada = !!(document.getElementById('oai_incluir_chk')||{}).checked;

  if (c.guardar) {
    await new Promise((res)=>{ const t=setTimeout(()=>res('RELOJ'),20000);
      try{ guardarInforme(function(){clearTimeout(t);res('ok')}) }catch(e){clearTimeout(t);res('EXC')} });
    R.uuid = (typeof _imgUuidActual!=='undefined') ? String(_imgUuidActual).slice(0,8) : 'SIN';
  }
  if (c.reabrir) {
    /* reabrir = vaciar los slots y restaurar desde disco, que es lo que hace editarInforme */
    const u = (typeof _imgUuidActual!=='undefined') ? _imgUuidActual : null;
    if (typeof imgSlots!=='undefined') imgSlots.length=0;
    if (typeof imgRestaurar==='function') await imgRestaurar(u);
    if (typeof oaiEsqPdfBtnSync==='function') oaiEsqPdfBtnSync();
    R.botonTrasReabrir = (document.getElementById('oai-esq-pdf')||{}).textContent||'';
    R.inclTrasReabrir = (typeof esqEstaIncluido==='function') ? esqEstaIncluido('orejuela') : 'SIN FN';
  }
  for (let i=0;i<(c.tocarTras||0);i++){
    const b=document.getElementById('oai-esq-pdf');
    if (b) { b.click(); await new Promise(r=>setTimeout(r,450)); }
  }
  if (c.tocarTras) R.botonTrasTocar = (document.getElementById('oai-esq-pdf')||{}).textContent||'';
  if (c.tab) { try{ if(typeof showTab==='function'){ showTab('valvulas'); showTab('ete'); } }catch(e){} }

  R.slots = (typeof imgSlots!=='undefined') ? imgSlots.filter(Boolean).length : 'SIN VAR';
  R.esqSlots = (typeof imgSlots!=='undefined')
    ? imgSlots.filter(Boolean).filter(s=>s.esquema).length : 'SIN VAR';
  R.esqClaves = (typeof imgSlots!=='undefined')
    ? imgSlots.filter(Boolean).filter(s=>s.esquema).map(s=>String(s.esqClave||'SIN CLAVE')).join(',') : '';
  R.esqIncluido = (typeof esqEstaIncluido==='function') ? esqEstaIncluido('orejuela') : 'SIN FN';

  /* ══ EL PDF, GENERADO DE VERDAD ══ */
  const reg = { imgs: 0, textos: [] };
  if (typeof window.jspdf==='undefined' || !window.jspdf.jsPDF) { R.pdf='SIN JSPDF'; return R; }
  const Orig = window.jspdf.jsPDF;
  window.jspdf.jsPDF = function(...a){ const d=new Orig(...a);
    const oi=d.addImage.bind(d); d.addImage=function(...z){ reg.imgs++; return oi(...z) };
    const ot=d.text.bind(d); d.text=function(t,x,y,...r){ reg.textos.push(String(t)); return ot(t,x,y,...r) };
    d.save=function(){return true}; d.output=function(){return ''}; return d; };
  Object.keys(Orig).forEach(k=>{try{window.jspdf.jsPDF[k]=Orig[k]}catch(e){}});
  const veces = c.dosPdf ? 2 : 1;
  for (let i=0;i<veces;i++){
    reg.imgs=0; reg.textos=[];
    try{ if(typeof _pdfAjustarA4==='function') await _pdfAjustarA4();
         else if(typeof generarPDF==='function') await generarPDF() }catch(e){ R.pdfErr=String(e).slice(0,90) }
  }
  window.jspdf.jsPDF = Orig;
  R.pdfImgs = reg.imgs;
  const txt = reg.textos.join(' | ');
  R.pdfTablaOrejuela = (txt.indexOf('Mediciones de la orejuela izquierda')>-1) ? 'SI' : 'no';
  R.pdfSeccionImgs  = (txt.indexOf('Imágenes del estudio')>-1 || txt.indexOf('Imagenes del estudio')>-1) ? 'SI' : 'no';
  return R;
})(CASO)`;

const b=await chromium.launch({channel:'chrome'});
const OUT={archivo:FILE, filas:[]};
try{
  for (const c of CASOS){
    const ctx=await b.newContext({viewport:{width:1440,height:900}});
    await ctx.addInitScript("try{localStorage.setItem('cfg-guardar-imagenes','1')}catch(e){}");
    const pg=await ctx.newPage();
    pg.on('pageerror',e=>{OUT._pageErr=(OUT._pageErr||[]).concat([c.id+': '+e.message.slice(0,110)])});
    await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
    await pg.waitForTimeout(1500);
    const r = await pg.evaluate(CUERPO.replace('CASO', JSON.stringify(c)));
    OUT.filas.push(r);
    await pg.close(); await ctx.close();
  }
}catch(e){OUT._err=String(e).slice(0,250)}
try{await b.close()}catch(e){}
fs.writeFileSync(OUTF,JSON.stringify(OUT,null,1));
const P=(s,n)=>String(s==null?'':s).padEnd(n).slice(0,n);
console.log(P('caso',26)+P('boton que se VE',24)+P('slots',6)+P('esq',4)+P('claves',12)+P('incl',6)+P('PDFimg',7)+P('tabla',6));
for(const f of OUT.filas){
  const bt = f.botonTrasTocar || f.botonTrasReabrir || f.botonTxt;
  console.log(P(f.id,26)+P(bt,24)+P(f.slots,6)+P(f.esqSlots,4)
    +P(f.esqClaves||'—',12)+P(f.esqIncluido,6)+P(f.pdfImgs,7)+P(f.pdfTablaOrejuela,6));
}
if(OUT._pageErr) console.log('PAGE ERR:',OUT._pageErr.slice(0,3).join(' // '));
