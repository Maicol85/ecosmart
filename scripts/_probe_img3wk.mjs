#!/usr/bin/env node
/**
 * _probe_img3wk.mjs - Chrome y WebKit, dos temas y cuatro anchos, sobre lo que la tanda
 * IMAGENES-3 toca: el visor de «Imagenes guardadas» con video, la capsula de la coartacion y
 * su ⓘ, y los invariantes de siempre —sin errores de consola ni de pagina, sin desplazamiento
 * horizontal del cuerpo y sin texto recortado—.
 *
 *   node scripts/_probe_img3wk.mjs [--file <html>] [--out <json>]
 *
 * ADVERTENCIA: WebKit de Playwright NO es Safari, y se declara. El binario de chromium de
 * Playwright no esta en esta maquina, asi que Chrome va por el del sistema con channel.
 * Sin acentos graves dentro de los templates de la sonda, ni en sus comentarios.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js','/tmp/pw/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c));break}catch(e){}}
if(!_pw){console.log(JSON.stringify({error:'SIN PLAYWRIGHT'}));process.exit(2)}
const {chromium,webkit}=_pw.default||_pw; const fs=await import('fs');
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const OUTF=arg('--out')||'/tmp/img3_wk.json';
const ANCHOS=[1440,1000,768,390], TEMAS=['light','dark'];

const MONTAR=`(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return null;
    e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  const C=(id,on)=>{const e=document.getElementById(id);if(!e)return null;
    e.checked=!!on;e.dispatchEvent(new Event('change',{bubbles:true}));return e.checked};
  S('nombre','Prueba WK'); S('ci','22222222'); S('fecha_estudio','2026-10-31');
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','60');
  C('coart_incluir_chk',true); S('coa_situacion','nativa'); S('coa_loc','istmica');
  S('coa_istmo','8'); S('coa_gmedio','25'); S('coa_ao_desc','20');
  Object.keys(window).forEach(k=>{if(/^calc[A-Z]/.test(k)&&typeof window[k]==='function'){try{window[k]()}catch(e){}}});
  try{ if(typeof _recalcModulos==='function') _recalcModulos('wk'); }catch(e){}
  await new Promise(r=>setTimeout(r,500));
  return true;
})()`;

const MEDIR=`(async () => {
  const R={};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  const T=id=>{const e=document.getElementById(id);return e?(e.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim():'NO EXISTE'};
  /* ── invariantes de siempre ── */
  R.scrollH = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  R.pestanasConCaja = [...document.querySelectorAll('.tab-btn')]
    .filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0}).length;
  R.pestanas = document.querySelectorAll('.tab-btn').length;
  /* texto recortado: un nodo cuyo contenido no entra en su caja */
  let rec=0; const muestra=[];
  document.querySelectorAll('.calc-lbl,.calc-val,label,button,.chip,h2,h3,h4').forEach(n=>{
    const r=n.getBoundingClientRect(); if(r.width<2||r.height<2) return;
    if(n.scrollWidth>Math.ceil(r.width)+2 && getComputedStyle(n).overflowX!=='auto'
       && getComputedStyle(n).overflowX!=='scroll'){ rec++; if(muestra.length<4) muestra.push((n.id||n.className||n.tagName)+':'+(n.textContent||'').trim().slice(0,28)) }
  });
  R.recortados=rec; R.recortadosMuestra=muestra.join(' | ');
  /* ── la capsula de la coartacion. Se lee ANTES de abrir pestanias: su texto no depende de
        que se vea, y asi queda el valor del montaje. ── */
  R.capsula=T('coa-concl');
  R.capsulaSinGuia = ['ESC','folio','Figura','Tabla','Clase'].filter(w=>R.capsula.indexOf(w)>-1).join(',')||'ninguna';
  /* ── el ⓘ de esa fila, abierto por su BOTON REAL ──
     ADVERTENCIA: la pestania y el acordeon se abren por SU BOTON. Con showTab la tarjeta de
     adentro no tiene caja y todo informa 0x0; y un boton dentro de un contenedor con
     display:none tampoco. Es la trampa que este repositorio documenta desde la tanda E. */
  R.globo='no se abrio';
  try{
    const bt=[...document.querySelectorAll('.tab-btn')].filter(x=>/Cong/i.test(x.textContent||''))[0];
    if(bt){ bt.click(); await esperar(420) }
    const ac=[...document.querySelectorAll('.sacc-hdr, .card-head, [onclick*="secToggle"], [onclick*="toggleCard"]')]
      .filter(x=>/coartaci/i.test(x.textContent||''))[0];
    if(ac){ ac.click(); await esperar(420) }
    R.tabCong = bt? 'abierta':'NO HAY PESTANA';
    R.accCoa = ac? 'abierto':'NO HAY ACORDEON';
    const b=document.querySelector('[data-vinfo="coa-card"]');
    if(b){ b.scrollIntoView({block:'center'}); b.click(); await esperar(320);
      const c=document.getElementById('vinfo-card');
      if(c){ const r=c.getBoundingClientRect();
        R.globo=Math.round(r.width)+'x'+Math.round(r.height);
        R.globoDentro = (r.top>=-1 && r.bottom<=innerHeight+1) ? 'dentro' : 'fuera';
        const t=(c.textContent||'');
        R.globoF44 = t.indexOf('Figura 44')>-1;
        R.globoFolios = (t.indexOf('folio 120')>-1 && t.indexOf('folio 3649')>-1);
        b.click(); await esperar(120);
      }
    }
  }catch(e){ R.globo='EXC '+String(e).slice(0,60) }
  /* ── el VISOR: vive dentro de la pestania GUARDADOS. Sin abrirla, su superposicion es
        descendiente de un contenedor con display:none y TODO informa 0x0 aunque sea
        position:fixed. Costo una corrida. ── */
  try{
    /* La pestania Guardados NO es un .tab-btn: es el boton flotante #floatBtnGuardados. */
    const bg=document.getElementById('floatBtnGuardados');
    if(bg){ bg.click(); await esperar(600) }
    R.tabGuardados = bg? 'abierta':'NO HAY BOTON';
    const ov=document.getElementById('ig-imgv-ov');
    if(ov){
      ov.classList.add('open');
      window._igVisor={uuid:'x',idx:0,n:1,id:null,tapa:false};
      if(typeof igImgVisorExtender==='function') igImgVisorExtender('x',0,{video:true,star:false,nota:''});
      const vd=document.getElementById('ig-imgv-vid'), ctl=document.getElementById('ig-imgv-vctl');
      if(vd) vd.style.display='';
      if(ctl) ctl.style.display='flex';
      await esperar(220);
      const vis=id=>{const e=document.getElementById(id); if(!e) return 'NO';
        return getComputedStyle(e).display==='none'?'oculto':
          (Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height))};
      R.vVideo=vis('ig-imgv-vid'); R.vCtl=vis('ig-imgv-vctl');
      R.vMedir=vis('ig-imgv-medir'); R.vGrande=vis('ig-imgv-grande');
      R.vLoop = vd? vd.hasAttribute('loop') : 'NO';
      /* area tactil de los tres controles nuevos, con los cinco puntos */
      const puntos=e=>{ if(!e) return 'NO'; const r=e.getBoundingClientRect();
        if(r.width<2) return 'sin caja';
        const P=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],[r.right-2,r.bottom-2],
                 [(r.left+r.right)/2,(r.top+r.bottom)/2]];
        let n=0; P.forEach(p=>{const el=document.elementFromPoint(p[0],p[1]); if(el&&(el===e||e.contains(el))) n++});
        return n+'/5 '+Math.round(r.width)+'x'+Math.round(r.height) };
      R.tPlay=puntos(document.getElementById('ig-imgv-play'));
      R.tCerrar=puntos(document.getElementById('ig-imgv-cerrar'));
      /* el modo grande */
      if(typeof igImgVisorGrande==='function'){
        const md=ov.querySelector('.ig-img-md');
        const w0=Math.round(md.getBoundingClientRect().width);
        igImgVisorGrande(true); await esperar(260);
        const w1=Math.round(md.getBoundingClientRect().width);
        igImgVisorGrande(false); await esperar(160);
        R.grande=w0+' -> '+w1;
      }
      ov.classList.remove('open'); window._igVisor=null;
    }
  }catch(e){ R.vErr=String(e).slice(0,90) }
  return R;
})()`;

const OUT={archivo:FILE,cruces:[]};
for(const [nom,lanz] of [['chrome',()=>chromium.launch({channel:'chrome'})],['webkit',()=>webkit.launch()]]){
  let b=null;
  try{ b=await lanz() }catch(e){ OUT.cruces.push({motor:nom,err:'no lanzo: '+String(e).slice(0,90)}); continue }
  for(const w of ANCHOS) for(const tema of TEMAS){
    const fila={motor:nom,ancho:w,tema:tema,consola:[],pageErr:[]};
    try{
      const ctx=await b.newContext({viewport:{width:w,height:900},colorScheme:tema});
      const pg=await ctx.newPage();
      pg.on('pageerror',e=>fila.pageErr.push(e.message.slice(0,120)));
      pg.on('console',m=>{if(m.type()==='error')fila.consola.push(m.text().slice(0,120))});
      await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
      await pg.waitForTimeout(1800);
      await pg.evaluate(MONTAR);
      await pg.waitForTimeout(400);
      Object.assign(fila, await pg.evaluate(MEDIR));
      await pg.close(); await ctx.close();
    }catch(e){ fila.err=String(e).slice(0,140) }
    OUT.cruces.push(fila);
    console.log(nom+' '+w+' '+tema+' · scrollH='+fila.scrollH+' recortados='+fila.recortados
      +' capsula='+String(fila.capsulaSinGuia)+' globo='+fila.globo+'/'+fila.globoDentro
      +' f44='+fila.globoF44+' folios='+fila.globoFolios
      +' video='+fila.vVideo+' ctl='+fila.vCtl+' medir='+fila.vMedir+' grande='+fila.vGrande
      +' tactil='+fila.tPlay+'|'+fila.tCerrar+' modal='+fila.grande
      +' err='+(fila.pageErr.length+fila.consola.length));
  }
  try{await b.close()}catch(e){}
}
fs.writeFileSync(OUTF,JSON.stringify(OUT,null,1));
const malos=OUT.cruces.filter(c=>c.err||(c.pageErr||[]).length||(c.consola||[]).length);
console.log('\ncruces: '+OUT.cruces.length+' · con error: '+malos.length);
malos.forEach(c=>console.log('  !! '+c.motor+' '+c.ancho+' '+c.tema+' '+(c.err||'')+' '+JSON.stringify((c.pageErr||[]).concat(c.consola||[])).slice(0,200)));
