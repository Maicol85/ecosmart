#!/usr/bin/env node
/**
 * _probe_img3cc.mjs - el INVENTARIO 9a y la prueba del commit 9 de IMAGENES-3: las ONCE
 * secciones del PPT de congenitas que publican «Conclusion segun guias» con su clase, su
 * nivel, su tabla, su folio y sus conductas.
 *
 * Para CADA seccion: enciende su casilla, llena sus campos a lo bruto -cada select en su
 * segunda opcion y cada numero en un valor plausible-, llama a su *Conclusion() y vuelca lo
 * que entraria al PPT, mas el censo de marcadores de guia y de verbos de conducta.
 *
 *   node scripts/_probe_img3cc.mjs [--file <html>] [--out <json>]
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda, ni en sus comentarios.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js','/tmp/pw/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log(JSON.stringify({error:'SIN PLAYWRIGHT'}));process.exit(2)}
const {chromium}=_pw; const fs=await import('fs');
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const OUTF=arg('--out')||'/tmp/img3_cc.json';

const INV=`(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return null;
    e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  S('nombre','Prueba CC'); S('ci','33333333'); S('fecha_estudio','2026-10-31');
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','40');
  const SECS=[
    {sec:'cia', chk:'ete_shunt_incluir_chk', fn:null,              pre:['ete_cia']},
    {sec:'civ', chk:'ete_shunt_incluir_chk', fn:null,              pre:['ete_civ']},
    {sec:'dap', chk:'ductus_incluir_chk',    fn:'dapConclusion',   pre:['dap_','ductus_']},
    {sec:'vap', chk:'vap_incluir_chk',       fn:'vapConclusion',   pre:['vap_']},
    {sec:'fop', chk:'fop_incluir_chk',       fn:'fopConclusion',   pre:['fop_']},
    {sec:'vab', chk:'vab_incluir_chk',       fn:'vabConclusion',   pre:['vab_','va_']},
    {sec:'mch', chk:'mch_incluir_chk',       fn:'mchConclusion',   pre:['mch_']},
    {sec:'ebs', chk:'ebs_incluir_chk',       fn:'ebsConclusion',   pre:['ebs_']},
    {sec:'tdf', chk:'tdf_incluir_chk',       fn:'tdfConclusion',   pre:['tdf_']},
    {sec:'tga', chk:'tga_incluir_chk',       fn:'tgaConclusion',   pre:['tga_']},
    {sec:'mca', chk:'mca_incluir_chk',       fn:'mcaConclusion',   pre:['mca_']}
  ];
  /* Marcadores de GUIA y verbos de CONDUCTA que la orden nombra. */
  const GUIA=['ESC ','AHA','ACC','ASE ','EACVI','SEC ','Clase I','Clase II','Nivel A','Nivel B',
              'Nivel C','Tabla ','Figura ','folio','guía','guia','recomendaciones'];
  const COND=['considerar','se recomienda','debe ','deben ','indicado','indicada','preferir',
              'conviene','corresponde '];
  const out=[];
  /* DOS pasadas por seccion: la primera con cada select en su SEGUNDA opcion y la segunda con
     la ULTIMA, que en estos modulos suele ser el grado severo. Sin la segunda, el relleno a lo
     bruto cae siempre en las ramas de «falta el dato» y el censo no ve ni una guia. */
  for (const pasada of ['leve','severo'])
  for (const d of SECS) {
    const c=document.getElementById(d.chk);
    if(c && !c.checked){ c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})) }
    /* relleno a lo bruto de los campos de esa seccion */
    let n=0;
    document.querySelectorAll('select[id], input[id]').forEach(e=>{
      if(!d.pre.some(p=>e.id.indexOf(p)===0)) return;
      if(e.type==='checkbox'){ if(!e.checked){e.checked=true; e.dispatchEvent(new Event('change',{bubbles:true})); n++} return }
      if(e.tagName==='SELECT'){ const q=(pasada==='severo')?e.options.length-1:1;
        if(e.options.length>1){ e.value=e.options[q].value;
        e.dispatchEvent(new Event('change',{bubbles:true})); n++ } return }
      if(e.type==='number'){ e.value=(pasada==='severo')?'60':'20';
        e.dispatchEvent(new Event('input',{bubbles:true}));
        e.dispatchEvent(new Event('change',{bubbles:true})); n++ }
    });
    Object.keys(window).forEach(k=>{if(/^calc[A-Z]/.test(k)&&typeof window[k]==='function'){try{window[k]()}catch(e){}}});
    try{ if(typeof _recalcModulos==='function') _recalcModulos('cc'); }catch(e){}
    await new Promise(r=>setTimeout(r,260));
    let txt='', resumen='', err=null, hall='';
    if(d.fn && typeof window[d.fn]==='function'){
      try{ const cc=window[d.fn](); txt=cc?String(cc.txt||''):'(null)'; resumen=cc?String(cc.resumen||''):'' }
      catch(e){ err=String(e).slice(0,100) }
    } else {
      try{ const q=ccQpQsDe(d.sec); txt=(q!=null)?String(eteQpQsInterp(q)):'(sin Qp/Qs)' }catch(e){ err=String(e).slice(0,100) }
    }
    try{ hall=String((typeof ccSumaLinea==='function')?(ccSumaLinea(d.sec)||''):'') }catch(e){}
    const proy = resumen || txt;
    /* lo que el PPT publicaria HOY, pasado por el podador */
    let pod={t:proy,parado:'SIN FN',cambio:false};
    try{ if(typeof _ccPptPodar==='function') pod=_ccPptPodar(proy) }catch(e){ pod={t:'EXC',parado:'EXC',cambio:false} }
    out.push({ sec:d.sec+'/'+pasada, fn:d.fn||'(Qp/Qs)', campos:n,
               podado:String(pod.t).slice(0,420), parado:pod.parado, cambio:pod.cambio,
               hall:hall.slice(0,180),
               proyecta:proy.slice(0,600),
               guia:GUIA.filter(w=>proy.indexOf(w)>-1),
               conducta:COND.filter(w=>proy.toLowerCase().indexOf(w)>-1),
               err:err });
  }
  return out;
})()`;

const b=await chromium.launch({channel:'chrome'});
const OUT={archivo:FILE,_pageErr:[]};
try{
  const pg=await b.newPage({viewport:{width:1280,height:900}});
  pg.on('pageerror',e=>OUT._pageErr.push(e.message.slice(0,150)));
  await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
  await pg.waitForTimeout(1800);
  OUT.secciones=await pg.evaluate(INV);
  await pg.close();
}catch(e){OUT._err=String(e).slice(0,250)}
try{await b.close()}catch(e){}
fs.writeFileSync(OUTF,JSON.stringify(OUT,null,1));
(OUT.secciones||[]).forEach(s=>{
  console.log('== '+s.sec+' ('+s.fn+')  campos='+s.campos+(s.err?'  ERR '+s.err:''));
  console.log('   guia: '+(s.guia.join(', ')||'ninguna')+'   conducta: '+(s.conducta.join(', ')||'ninguna'));
  console.log('   proyecta: '+s.proyecta.slice(0,260));
});
console.log('escrito: '+OUTF);
