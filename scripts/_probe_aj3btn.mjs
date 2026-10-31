#!/usr/bin/env node
/**
 * _probe_aj3btn.mjs - los botones de respuesta del panel de Evidencia, MEDIDOS.
 *
 * El comentario de _indCtrlHTML dice que el alto lo fija la regla tactil global de 44 px, y
 * TGA2-h midio 22. La causa no es que la regla no gane: hay una media query deliberada
 * (pointer:fine) que la desactiva con mouse. Esta sonda mide el ancho, el alto Y EL AREA DE
 * TOQUE con los DOS punteros, en los cuatro anchos y los dos temas, y mira si un toque en cada
 * esquina del area cae en el propio boton o en otro control.
 *
 *   node scripts/_probe_aj3btn.mjs [--file <html>] [--out <json>]
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
const OUTF=arg('--out')||'/tmp/aj3_btn.json';

/* Monta un escenario que despierte VARIAS secciones con preguntas: la bicuspide, la TGA, la CIA,
   la CIV y la muerte subita de la miocardiopatia hipertrofica. Son las cinco que la orden nombra. */
const MONTAR = `(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  const K=(id,on)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.checked=!!on;e.dispatchEvent(new Event('change',{bubbles:true}));return e.checked};
  const out={};
  S('nombre','Prueba Botones'); S('ci','77777777'); S('fecha_estudio','2026-10-31');
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','50');
  /* bicuspide */
  out.vab = S('vab_presente','si'); S('vab_tipo','rl'); S('ao_asc','52'); S('ao_sin','47');
  /* transposicion: d-TGA con switch arterial, que es lo que la TGA-2 abrio */
  out.tga = S('tga_tipo','dtga'); out.tgaCir = S('tga_cirugia','jatene');
  /* comunicaciones */
  out.cia = S('cia_presente','si'); out.civ = S('civ_presente','si');
  /* miocardiopatia hipertrofica */
  out.mch = S('mch_presente','si'); S('siv','18'); S('mch_grad_reposo','40');
  try{ if(typeof _recalcModulos==='function') _recalcModulos() }catch(e){}
  await new Promise(r=>setTimeout(r,500));
  return out;
})()`;

/* Abre el panel y mide. El panel es un MODAL: offsetParent da null aunque este abierto (es
   position:fixed), asi que se mira la caja y no el offsetParent. */
const MEDIR = `(async () => {
  const R={};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  /* POR SU BOTON REAL: indicAbrir es la funcion, y el boton que la llama es el que el medico
     aprieta. Llamarla a mano alcanza para que el panel exista; se usa el boton cuando esta. */
  try{ const bt=document.querySelector('[onclick*="indicAbrir"]');
       if(bt) bt.click(); else if(typeof indicAbrir==='function') indicAbrir(); }
  catch(e){ R.errAbrir=String(e).slice(0,140) }
  await esperar(900);
  /* las secciones compactas y los detalles cerrados: se abren por su propio control */
  document.querySelectorAll('#indic-cuerpo details:not([open])').forEach(d=>{try{d.open=true}catch(e){}});
  await esperar(400);
  const cu=document.getElementById('indic-cuerpo');
  R.panelAbierto = !!cu;
  if(!cu) return R;
  const cr=cu.getBoundingClientRect();
  R.panel={w:Math.round(cr.width),h:Math.round(cr.height)};
  const bs=[...cu.querySelectorAll('[data-ind-clin]')];
  R.nBotones=bs.length;
  R.claves=[...new Set(bs.map(b=>b.getAttribute('data-ind-clin')))].length;
  R.terminos=cu.querySelectorAll('[data-ind-term]').length;
  /* el AREA DE TOQUE: la caja del boton mas lo que su ::after extienda. Se mide con
     elementFromPoint sobre nueve puntos de un cuadrado de 44 centrado en el boton. */
  const medir = (b) => {
    const r=b.getBoundingClientRect();
    const cs=getComputedStyle(b);
    const af=getComputedStyle(b,'::after');
    const o={ clave:b.getAttribute('data-ind-clin'), val:b.getAttribute('data-ind-val'),
              txt:(b.textContent||'').trim().slice(0,12),
              w:Math.round(r.width*10)/10, h:Math.round(r.height*10)/10,
              minH:cs.minHeight, minW:cs.minWidth,
              afterContent:af.content, afterPos:af.position,
              afterTop:af.top, afterInset:af.inset||'' };
    /* nueve puntos de un 44x44 centrado: cuatro esquinas, cuatro medios y el centro */
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    const d=21;   /* 2 px adentro de un 44x44 */
    const pts=[[cx-d,cy-d],[cx+d,cy-d],[cx-d,cy+d],[cx+d,cy+d],
               [cx,cy-d],[cx,cy+d],[cx-d,cy],[cx+d,cy],[cx,cy]];
    let propio=0, ajeno=0, nada=0, ajenos=[];
    pts.forEach(([x,y])=>{
      if(x<0||y<0||x>innerWidth||y>innerHeight){ nada++; return }
      const el=document.elementFromPoint(x,y);
      if(!el){ nada++; return }
      if(el===b || b.contains(el)){ propio++; return }
      /* cae en OTRO control? eso es lo que la orden prohibe */
      const otro=el.closest && el.closest('[data-ind-clin],[data-ind-term],button,select,input,textarea,a');
      if(otro && otro!==b){ ajeno++; ajenos.push((otro.getAttribute&&otro.getAttribute('data-ind-val'))||otro.tagName) }
      else nada++;
    });
    o.toque44={propio:propio, otroControl:ajeno, neutro:nada, ejemplos:[...new Set(ajenos)].slice(0,3)};
    return o;
  };
  /* los primeros doce, mas el resumen de todos */
  R.muestra = bs.slice(0,12).map(medir);
  const todos = bs.map(b=>{const r=b.getBoundingClientRect();return {w:r.width,h:r.height}});
  R.altos=[...new Set(todos.map(x=>Math.round(x.h*10)/10))].sort((a,b)=>a-b);
  R.anchos={min:Math.round(Math.min(...todos.map(x=>x.w))*10)/10,
            max:Math.round(Math.max(...todos.map(x=>x.w))*10)/10};
  R.conAlto44 = todos.filter(x=>x.h>=44).length;
  R.conAncho44 = todos.filter(x=>x.w>=44).length;
  /* solape entre controles del panel: cuantos botones tienen algun punto del 44 en OTRO control */
  const med=bs.map(medir);
  R.conOtroControl = med.filter(o=>o.toque44.otroControl>0).length;
  R.con5de5 = med.filter(o=>o.toque44.propio>=5).length;
  R.con9de9 = med.filter(o=>o.toque44.propio===9).length;
  /* el estado NO depende solo del color: aria-pressed */
  R.conAriaPressed = bs.filter(b=>b.hasAttribute('aria-pressed')).length;
  R.ariaValores=[...new Set(bs.map(b=>b.getAttribute('aria-pressed')))];
  /* barra horizontal */
  R.scrollX = Math.max(0, document.documentElement.scrollWidth - innerWidth);
  const cj=cu.closest('[style*=overflow],div');
  R.panelScrollX = cu ? Math.max(0, cu.scrollWidth - cu.clientWidth) : 0;
  /* texto recortado dentro del panel */
  R.recortados = [...cu.querySelectorAll('*')].filter(e=>{
    if(e.children.length) return false;
    const t=(e.textContent||'').trim(); if(!t) return false;
    return e.scrollWidth > e.clientWidth + 2;
  }).length;
  return R;
})()`;

const ANCHOS=[1440,1000,768,390];
const TEMAS=['dark','light'];
const b=await chromium.launch({channel:'chrome'});
const OUT={archivo:FILE, cruces:{}, _consola:[], _pageErr:[]};
try{
  for (const punt of ['fine','coarse']) {
    for (const w of ANCHOS) {
      for (const tema of TEMAS) {
        const k=punt+'/'+w+'/'+tema;
        const ctx=await b.newContext({viewport:{width:w,height:900},
          hasTouch: punt==='coarse', isMobile: false,
          colorScheme: tema==='dark'?'dark':'light'});
        await ctx.addInitScript("try{localStorage.setItem('eco-tema','"+tema+"')}catch(e){}");
        const pg=await ctx.newPage();
        pg.on('pageerror',e=>{OUT._pageErr.push(k+': '+e.message.slice(0,140))});
        pg.on('console',m=>{ if(m.type()==='error') OUT._consola.push(k+': '+m.text().slice(0,140)) });
        await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
        await pg.waitForTimeout(2200);
        try{
          await pg.evaluate(MONTAR);
          OUT.cruces[k]=await pg.evaluate(MEDIR);
        }catch(e){ OUT.cruces[k]={err:String(e).slice(0,200)} }
        await pg.close(); await ctx.close();
      }
    }
  }
}catch(e){OUT._err=String(e).slice(0,300)}
try{await b.close()}catch(e){}
fs.writeFileSync(OUTF,JSON.stringify(OUT,null,1));
const res={};
Object.keys(OUT.cruces).forEach(k=>{const c=OUT.cruces[k];
  res[k]=c.err?('ERR '+c.err):{n:c.nBotones,altos:c.altos,anchos:c.anchos,
    alto44:c.conAlto44,ancho44:c.conAncho44,otroCtrl:c.conOtroControl,
    de5:c.con5de5,de9:c.con9de9,aria:c.conAriaPressed,scrollX:c.scrollX,recort:c.recortados}});
console.log(JSON.stringify({libreria:OUT.cruces[Object.keys(OUT.cruces)[0]]&&OUT.cruces[Object.keys(OUT.cruces)[0]].panelAbierto,
  resumen:res, pageErr:OUT._pageErr.slice(0,4), consola:OUT._consola.slice(0,4)},null,1));
