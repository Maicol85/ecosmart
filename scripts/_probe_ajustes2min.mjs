#!/usr/bin/env node
/**
 * _probe_ajustes2min.mjs — la FILA DE MINIATURAS del commit 4: el globo ⓘ nuevo, el ARRASTRE y
 * las FLECHAS, con gestos reales y midiendo el orden que el PDF imprime de verdad.
 *
 * Verifica ademas el punto 4b de la orden, que da por hecho que el arrastre NO existe.
 *
 *   node scripts/_probe_ajustes2min.mjs [--file <html>] [--ancho 1440]
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw; const fs=await import('fs');
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const ANCHO=Number(arg('--ancho')||1440);

const PNGS=['iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
            'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mNk+M9Qz0AEYBxVSF+FABLADveN1x6PAAAAAElFTkSuQmCC',
            'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mNkYPhfz0AEYBxVSF+FABKFDvcYIBK1AAAAAElFTkSuQmCC'];

const CUERPO = `(async (pngs) => {
  const R = {};
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
  S('nombre','Prueba Fila'); S('ci','55555555');
  /* ⚠️ LA PESTANA SE ABRE POR SU BOTON REAL. Sin eso, la fila existe pero no tiene caja y
     TODOS los getBoundingClientRect dan 0x0 — se lee como «el pintor no pinto», y no es eso.
     Es la trampa que este repo ya documenta para showTab y las tarjetas. */
  try{ const bt=document.getElementById('floatBtnInforme'); if(bt) bt.click();
       else if(typeof showTab==='function') showTab('informe'); }catch(e){}
  await new Promise(r=>setTimeout(r,350));
  /* ⚠️ TRES CAPTURAS DE VERDAD DISTINTAS. Tres PNG escritos a mano se parecen tanto que
     CUALQUIER rebanada fija cae en su parte comun y las tres salen con la misma firma: el
     orden de impresion deja de poder distinguirse. Es la trampa 3 del mapa de AJUSTES-1, que
     ahi se resolvio moviendo la rebanada y aca no alcanza. Se dibujan con un canvas, cada una
     de un color, asi que sus dataURL difieren desde los primeros bytes. */
  const _mkPng = function(col){ const c=document.createElement('canvas'); c.width=8; c.height=8;
    const x=c.getContext('2d'); x.fillStyle=col; x.fillRect(0,0,8,8); return c.toDataURL('image/png') };
  const _urls = ['#e03030','#30b030','#3050e0'].map(_mkPng);
  if (typeof imgSlots!=='undefined'){
    imgSlots.length=0;
    _urls.forEach(u=>imgSlots.push({dataURL:u,ampliada:false,calidad:'media',origen:'estudio'}));
    if(typeof imgSlotCount!=='undefined') imgSlotCount=imgSlots.length;
    if(typeof imgEnsureLen==='function') imgEnsureLen();
    if(typeof imgMarcarEditado==='function') imgMarcarEditado();
  }
  if (typeof infMinPintar==='function') infMinPintar();
  await new Promise(r=>setTimeout(r,250));
  /* La firma es un hash del dataURL ENTERO, no una rebanada: una rebanada fija puede caer en
     la parte comun de dos imagenes y hacerlas indistinguibles. */
  const _h = u => { let h=0; const t=String(u); for(let i=0;i<t.length;i++){ h=(h*31+t.charCodeAt(i))|0 }
                    return ('00000000'+(h>>>0).toString(16)).slice(-8) };
  const firma = s => s && s.dataURL ? _h(s.dataURL) : '—';
  R.orden0 = (typeof imgSlots!=='undefined') ? imgSlots.filter(Boolean).map(firma).join(' ') : '';
  const fila = document.getElementById('inf-min-fila');
  R.filaVisible = fila ? getComputedStyle(fila).display : 'NO EXISTE';
  R.nTarjetas = document.querySelectorAll('#inf-min-lista .inf-min').length;

  /* ── EL TEXTO DE AYUDA Y EL GLOBO ── */
  R.textoAyuda = document.querySelectorAll('#inf-min-fila .inf-min-ayuda').length;
  const g = document.querySelector('#inf-min-fila [data-vinfo="inf-min"]');
  R.globo = g ? 'existe' : 'NO EXISTE';
  if (g) {
    const r = g.getBoundingClientRect();
    R.globoCaja = Math.round(r.width)+'x'+Math.round(r.height);
    g.scrollIntoView({block:'center'});
    await new Promise(x=>setTimeout(x,120));
    const r2 = g.getBoundingClientRect();
    const pts=[[r2.left+2,r2.top+2],[r2.right-2,r2.top+2],[r2.left+2,r2.bottom-2],
               [r2.right-2,r2.bottom-2],[r2.left+r2.width/2,r2.top+r2.height/2]];
    R.globoPuntos = pts.map(p=>{const el=document.elementFromPoint(p[0],p[1]);
      return (el===g||g.contains(el))?'1':'0'}).join('');
    R.globoQuienTapa = pts.map(p=>{const el=document.elementFromPoint(p[0],p[1]);
      if(el===g||g.contains(el)) return 'propio';
      return el ? (el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ')[0]:'')) : 'null';
    }).join(' | ');
    g.click();
    await new Promise(x=>setTimeout(x,320));
    /* El id real es #vinfo-card; mi primer selector agarraba otra cosa y daba 0x0 sobre una
       tarjeta de 300 px bien dibujada, con el texto de OTRO globo. */
    const card = document.getElementById('vinfo-card');
    if (card){ const c=card.getBoundingClientRect();
      R.tarjeta = Math.round(c.width)+'x'+Math.round(c.height);
      R.tarjetaDentro = (c.left>=0 && c.right<=innerWidth && c.top>=0 && c.bottom<=innerHeight) ? 'SI' : 'NO';
      R.tarjetaTxt = String(card.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim().slice(0,260);
    } else R.tarjeta='NO SE ABRIO';
    g.click(); await new Promise(x=>setTimeout(x,150));
  }

  /* ── LAS FLECHAS ── */
  const flechas = document.querySelectorAll('#inf-min-lista .inf-min-ord button');
  R.nFlechas = flechas.length;
  if (flechas.length){
    const f = flechas[1]; /* la ▶ de la primera captura */
    const r = f.getBoundingClientRect();
    R.flechaCaja = Math.round(r.width)+'x'+Math.round(r.height);
    f.scrollIntoView({block:'center'}); await new Promise(x=>setTimeout(x,120));
    const r2=f.getBoundingClientRect();
    const pts=[[r2.left+2,r2.top+2],[r2.right-2,r2.top+2],[r2.left+2,r2.bottom-2],
               [r2.right-2,r2.bottom-2],[r2.left+r2.width/2,r2.top+r2.height/2]];
    R.flechaPuntos = pts.map(p=>{const el=document.elementFromPoint(p[0],p[1]);
      return (el===f||f.contains(el))?'1':'0'}).join('');
    /* ⚠️ EL AREA TACTIL NO ES EL RECT: la extiende un ::after absoluto, que
       getBoundingClientRect NO ve. Se mide barriendo con elementFromPoint. */
    let x0=r2.left, x1=r2.right, y0=r2.top, y1=r2.bottom;
    const esF = (px,py)=>{const el=document.elementFromPoint(px,py); return el===f||f.contains(el)};
    for(let k=0;k<30 && esF(x0-1, r2.top+r2.height/2);k++) x0--;
    for(let k=0;k<30 && esF(x1+1, r2.top+r2.height/2);k++) x1++;
    for(let k=0;k<30 && esF(r2.left+r2.width/2, y0-1);k++) y0--;
    for(let k=0;k<30 && esF(r2.left+r2.width/2, y1+1);k++) y1++;
    R.flechaAreaTactil = Math.round(x1-x0)+'x'+Math.round(y1-y0);
    f.click(); await new Promise(x=>setTimeout(x,250));
    R.ordenTrasFlecha = imgSlots.filter(Boolean).map(firma).join(' ');
  }

  /* ── EL ARRASTRE, con eventos reales de DnD ── */
  const tarj = document.querySelectorAll('#inf-min-lista .inf-min[data-min-tipo=captura]');
  R.arrastrables = [].slice.call(tarj).filter(t=>t.getAttribute('draggable')==='true').length;
  R.touchAction = tarj.length ? getComputedStyle(tarj[0]).touchAction : '—';
  if (tarj.length>=2){
    const dt = new DataTransfer();
    const a = tarj[0], b = tarj[1];
    a.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:dt}));
    b.dispatchEvent(new DragEvent('dragover',{bubbles:true,dataTransfer:dt,cancelable:true}));
    b.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:dt,cancelable:true}));
    a.dispatchEvent(new DragEvent('dragend',{bubbles:true,dataTransfer:dt}));
    await new Promise(x=>setTimeout(x,250));
    R.ordenTrasArrastre = imgSlots.filter(Boolean).map(firma).join(' ');
  }

  /* ── EL ORDEN QUE EL PDF IMPRIME DE VERDAD ── */
  /* El PDF necesita un informe emitido: sin el, generarPDF sale temprano y ordenPDF queda
     vacio — un denominador cero que se lee como «el PDF no imprime las capturas». */
  try{ if(typeof generarInforme==='function') generarInforme() }catch(e){}
  await new Promise(x=>setTimeout(x,300));
  if (window.jspdf && window.jspdf.jsPDF){
    const Orig=window.jspdf.jsPDF; const vistos=[];
    window.jspdf.jsPDF=function(...a){const d=new Orig(...a);
      const oi=d.addImage.bind(d); d.addImage=function(u,...z){ vistos.push(_h(u)); return oi(u,...z) };
      d.save=function(){return true}; d.output=function(){return ''}; return d; };
    Object.keys(Orig).forEach(k=>{try{window.jspdf.jsPDF[k]=Orig[k]}catch(e){}});
    try{ if(typeof _pdfAjustarA4==='function') await _pdfAjustarA4() }catch(e){}
    window.jspdf.jsPDF=Orig;
    R.ordenPDF = vistos.join(' ');
  }
  /* ── prefers-reduced-motion: la fila no anima nada propio ── */
  R.transicionTarjeta = tarj.length ? getComputedStyle(tarj[0]).transitionDuration : '—';
  return R;
})(PNGS)`;

const b=await chromium.launch({channel:'chrome'});
const ctx=await b.newContext({viewport:{width:ANCHO,height:900}});
await ctx.addInitScript("try{localStorage.setItem('cfg-guardar-imagenes','1')}catch(e){}");
const pg=await ctx.newPage();
const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,120)));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
await pg.waitForTimeout(1500);
const R=await pg.evaluate(CUERPO.replace('PNGS',JSON.stringify(PNGS)));
R._errores=errs.length?errs:'cero';
console.log(JSON.stringify(R,null,1));
await pg.close(); await ctx.close(); await b.close();
