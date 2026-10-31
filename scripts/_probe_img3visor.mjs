#!/usr/bin/env node
/**
 * _probe_img3visor.mjs - el INVENTARIO 1a y la prueba del commit 1 de la tanda IMAGENES-3.
 *
 * Siembra un estudio con UNA captura y UN video, lo guarda por el camino real
 * (guardarInforme -> imgPersistir -> videoPersistir), abre «Imagenes guardadas» y mide el
 * visor con el gesto real: clic en la miniatura.
 *
 * El video se FABRICA con MediaRecorder sobre un canvas, no se trae de ningun archivo: hace
 * falta un blob que el navegador pueda decodificar de verdad, y un MP4 embebido en base64
 * seria un dato opaco que nadie puede verificar.
 *
 *   node scripts/_probe_img3visor.mjs [--file <html>] [--out <json>] [--ancho 1440]
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda, ni en sus comentarios.
 * `node --check` no caza los que viven en un comentario DENTRO del template.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js','/tmp/pw/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log(JSON.stringify({error:'SIN PLAYWRIGHT'}));process.exit(2)}
const {chromium}=_pw; const fs=await import('fs');
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const OUTF=arg('--out')||'/tmp/img3_visor.json';
const ANCHO=parseInt(arg('--ancho')||'1440',10);

const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';

/* ── Monta el estudio y lo guarda ─────────────────────────────────────────────────────────── */
const MONTAR = `(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  S('nombre','Prueba Visor'); S('ci','77777777');
  S('fecha_estudio','2026-10-31');
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','60');
  const out = {};
  /* ── EL VIDEO: canvas -> captureStream -> MediaRecorder ── */
  const c=document.createElement('canvas'); c.width=160; c.height=120;
  const cx=c.getContext('2d');
  let f=0;
  const pintar=()=>{ cx.fillStyle = (f%2) ? '#204080' : '#802040'; cx.fillRect(0,0,160,120);
    cx.fillStyle='#fff'; cx.font='28px sans-serif'; cx.fillText(String(f),10,70); f++; };
  pintar();
  let blob=null, tipo='';
  try{
    const st=c.captureStream(20);
    const mimes=['video/webm;codecs=vp8','video/webm','video/mp4'];
    let mime=''; for(const m of mimes){ if(window.MediaRecorder && MediaRecorder.isTypeSupported(m)){mime=m;break} }
    out.mimeGrabado=mime||'NINGUNO';
    if(mime){
      const mr=new MediaRecorder(st,{mimeType:mime});
      const trozos=[];
      mr.ondataavailable=e=>{ if(e.data && e.data.size) trozos.push(e.data) };
      const fin=new Promise(res=>{ mr.onstop=res });
      mr.start();
      const iv=setInterval(pintar,50);
      await new Promise(r=>setTimeout(r,900));
      clearInterval(iv); mr.stop(); await fin;
      blob=new Blob(trozos,{type:mime}); tipo=mime;
    }
  }catch(e){ out.errGrabar=String(e).slice(0,140) }
  out.videoBytes = blob ? blob.size : 0;
  out.videoTipo = tipo;
  /* ── Los dos slots: [0] captura, [1] video ── */
  if (typeof imgSlots !== 'undefined') {
    imgSlots.length=0;
    imgSlots.push({dataURL:PNGQ,ampliada:false,calidad:'media',origen:'estudio'});
    const vid='vid-sonda-1';
    imgSlots.push({dataURL:PNGQ,ampliada:false,calidad:'media',origen:'estudio',
                   videoId:vid,videoNombre:'clip-de-prueba.webm',videoDur:0.9});
    if(blob) _videoBlobs[vid]={id:vid,blob:blob,nombre:'clip-de-prueba.webm',tipo:tipo,bytes:blob.size};
    out.enBlobs = !!_videoBlobs[vid];
    if (typeof imgSlotCount!=='undefined') imgSlotCount=imgSlots.length;
    if (typeof imgEnsureLen==='function') imgEnsureLen();
    if (typeof imgMarcarEditado==='function') imgMarcarEditado();
  }
  /* ── Guardar por el camino real ── */
  /* ADVERTENCIA, Y COSTO UNA CORRIDA: guardarInforme tiene una salida temprana que no llama al
     callback -el gate de severidades valvulares abre una card modal y espera al medico-, asi
     que la promesa queda dormida y el reloj la mata. Es la trampa del D-11 y la sonda de
     AJUSTES-2 ya la documenta. valvSevConfirmada es un let del script y no se puede asignar
     desde afuera; la funcion que abre la card si vive en window. */
  try { window.mostrarCardSeveridadValvular = function (cb) { if (typeof cb === 'function') cb(); }; } catch(e){}
  out.guardado = await new Promise(res=>{
    let listo=false; const t=setTimeout(()=>{ if(!listo){listo=true;res('TIMEOUT 25s')} },25000);
    try{ guardarInforme(()=>{ if(!listo){listo=true;clearTimeout(t);res('ok')} }) }
    catch(e){ if(!listo){listo=true;clearTimeout(t);res('EXC '+String(e).slice(0,90))} }
  });
  const infs = (typeof getInformes==='function') ? getInformes() : [];
  const mio = infs.filter(i=>i && i.nombre==='Prueba Visor')[0] || null;
  out.uuid = mio ? mio.uuid : 'SIN ESTUDIO';
  out.id = mio ? mio.id : null;
  if (mio) {
    const vs = (typeof CeiboVideo!=='undefined') ? await CeiboVideo.leer(mio.uuid) : null;
    out.enStoreVideo = vs ? vs.length : 'null';
    out.enStoreVideoBytes = (vs && vs[0]) ? vs[0].bytes : 0;
    const im = (typeof CeiboImg!=='undefined') ? await CeiboImg.leer(mio.uuid) : null;
    out.enStoreImg = im ? im.length : 'null';
    out.slotsVideoId = (im||[]).map(s=>s && s.videoId || '-').join('|');
  }
  return out;
})()`.replace(/PNGQ/g, JSON.stringify(PNG));

/* ── Abre «Imagenes guardadas» y mide el visor ────────────────────────────────────────────── */
const MEDIR = `(async (quiere) => {
  const R={};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  try{ if(typeof showTab==='function') showTab('guardados') }catch(e){ R.errTab=String(e).slice(0,90) }
  await esperar(250);
  try{ if(typeof igImgInvalidar==='function') igImgInvalidar() }catch(e){}
  try{ if(typeof igVistaCambiar==='function') igVistaCambiar('img') }catch(e){ R.errVista=String(e).slice(0,90) }
  await esperar(900);
  /* abrir TODOS los meses por su boton real */
  document.querySelectorAll('.ig-mes-grupo.cerrado > .ig-mes').forEach(b=>{try{b.click()}catch(e){}});
  await esperar(500);
  const ths=[...document.querySelectorAll('.ig-img-th')];
  R.miniaturas=ths.length;
  R.conBadgeVideo=ths.filter(b=>b.querySelector('.ig-img-vb')).length;
  /* DENOMINADOR: sin miniaturas, todo lo de abajo da cero y parece seguro */
  const esVid = quiere==='video';
  const th = ths.filter(b=>!!b.querySelector('.ig-img-vb')===esVid)[0] || null;
  R.hayMiniatura = !!th;
  if(!th) return R;
  R.titMini = th.getAttribute('aria-label')||'';
  th.click();                                  /* GESTO REAL */
  await esperar(700);
  const g=id=>document.getElementById(id);
  const vis=e=>{ if(!e) return 'NO EXISTE'; const r=e.getBoundingClientRect();
    return getComputedStyle(e).display==='none' ? 'display:none'
         : (r.width<1||r.height<1 ? 'sin caja' : Math.round(r.width)+'x'+Math.round(r.height)) };
  const ov=g('ig-imgv-ov');
  R.abierto = !!(ov && ov.classList.contains('open'));
  R.titulo = (g('ig-imgv-tit')||{}).textContent||'';
  R.pie = (g('ig-imgv-pie')||{}).textContent||'';
  R.img = vis(g('ig-imgv-img'));
  R.video = vis(g('ig-imgv-vid'));
  R.vctl = vis(g('ig-imgv-vctl'));
  R.medir = vis(g('ig-imgv-medir'));
  R.grande = vis(g('ig-imgv-grande'));
  R.star = vis(g('ig-imgv-star'));
  R.ir = vis(g('ig-imgv-ir'));
  const vd=g('ig-imgv-vid');
  if(vd){
    R.vLoop = vd.loop===true;
    R.vMuted = vd.muted===true;
    R.vAutoplay = vd.autoplay===true;
    R.vTieneSrc = !!vd.getAttribute('src');
    R.vSrcBlob = /^blob:/.test(vd.getAttribute('src')||'');
    R.vPoster = !!vd.getAttribute('poster');
    R.vDur = isFinite(vd.duration)? Math.round(vd.duration*100)/100 : 'NaN';
    R.vRate0 = vd.playbackRate;
  }
  R.urlViva = (typeof _igVisorVidURL!=='undefined') ? !!_igVisorVidURL : 'SIN VAR';
  R.playTxt0 = (g('ig-imgv-play')||{}).textContent||'';
  R.playAria0 = g('ig-imgv-play') ? g('ig-imgv-play').getAttribute('aria-pressed') : '-';
  /* ── area tactil de los controles nuevos ── */
  const puntos=e=>{ if(!e) return 'NO'; e.scrollIntoView({block:'center'});
    const r=e.getBoundingClientRect();
    const P=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],[r.right-2,r.bottom-2],
             [(r.left+r.right)/2,(r.top+r.bottom)/2]];
    let n=0; P.forEach(p=>{ const el=document.elementFromPoint(p[0],p[1]);
      if(el && (el===e || e.contains(el))) n++ });
    return n+'/5 '+Math.round(r.width)+'x'+Math.round(r.height) };
  R.tactilGrande = puntos(g('ig-imgv-grande'));
  /* CONTROL: «Cerrar» es un boton preexistente y sin tocar. Si da los mismos puntos que los
     nuevos, 4 de 5 es la linea base de un .btn con esquinas redondeadas en una fila flex y no
     una regresion de esta tanda. */
  R.tactilCerrar = puntos(g('ig-imgv-cerrar'));
  if(esVid){
    R.tactilPlay = puntos(g('ig-imgv-play'));
    R.tactilPrev = puntos(g('ig-imgv-prev'));
    R.tactilNext = puntos(g('ig-imgv-next'));
    /* ── PLAY real ── */
    try{ g('ig-imgv-play').click(); }catch(e){ R.errPlay=String(e).slice(0,90) }
    await esperar(600);
    R.corriendo = !!(vd && !vd.paused);
    R.tAvanzo = !!(vd && vd.currentTime>0);
    R.playTxt1 = (g('ig-imgv-play')||{}).textContent||'';
    R.playAria1 = g('ig-imgv-play') ? g('ig-imgv-play').getAttribute('aria-pressed') : '-';
    /* ── EL BUCLE, medido de verdad: se salta al final y se espera ── */
    try{ vd.currentTime = Math.max(0,(vd.duration||1)-0.08) }catch(e){}
    await esperar(900);
    R.trasElFinal = !!(vd && !vd.paused);
    R.tTrasElFinal = vd ? Math.round(vd.currentTime*100)/100 : '-';
    R.sigueCorriendo = R.trasElFinal;
    /* ── pausa ── */
    try{ g('ig-imgv-play').click(); }catch(e){}
    await esperar(250);
    R.pausado = !!(vd && vd.paused);
    R.playTxt2 = (g('ig-imgv-play')||{}).textContent||'';
    /* ── velocidad ── */
    const sel=g('ig-imgv-vel');
    if(sel){ sel.value='2'; sel.dispatchEvent(new Event('change',{bubbles:true})); }
    await esperar(150);
    R.rate2 = vd ? vd.playbackRate : '-';
    if(sel){ sel.value='0.5'; sel.dispatchEvent(new Event('change',{bubbles:true})); }
    await esperar(150);
    R.rateMedio = vd ? vd.playbackRate : '-';
    /* ── cuadro a cuadro ── */
    try{ vd.currentTime=0.4 }catch(e){}
    await esperar(200);
    const t0 = vd? vd.currentTime : 0;
    g('ig-imgv-next').click(); await esperar(200);
    const t1 = vd? vd.currentTime : 0;
    g('ig-imgv-prev').click(); await esperar(200);
    const t2 = vd? vd.currentTime : 0;
    R.pasoAdelante = Math.round((t1-t0)*10000)/10000;
    R.pasoAtras = Math.round((t2-t1)*10000)/10000;
    R.pasoPausa = !!(vd && vd.paused);
  }
  /* ── AGRANDAR ── */
  const md = ov ? ov.querySelector('.ig-img-md') : null;
  const anchoMd = ()=> md ? Math.round(md.getBoundingClientRect().width) : 0;
  const altoVw = ()=> { const e=g('ig-imgv-vw'); return e?Math.round(e.getBoundingClientRect().height):0 };
  R.mdNormal = anchoMd(); R.vwNormal = altoVw();
  R.grandeDisplay = g('ig-imgv-grande') ? getComputedStyle(g('ig-imgv-grande')).display : 'NO';
  if (R.grandeDisplay !== 'none') {
    g('ig-imgv-grande').click(); await esperar(350);
    R.mdGrande = anchoMd(); R.vwGrande = altoVw();
    R.rotuloGrande = g('ig-imgv-grande').textContent;
    R.ariaGrande = g('ig-imgv-grande').getAttribute('aria-pressed');
    R.claseGrande = md ? md.classList.contains('grande') : false;
    /* el encabezado NO se tapa: el titulo y Cerrar siguen con caja y dentro de la ventana */
    const tr=g('ig-imgv-tit').getBoundingClientRect(), cr=g('ig-imgv-cerrar').getBoundingClientRect();
    R.hdrGrande = (tr.height>0 && cr.height>0 && tr.top>=0 && cr.top>=0 &&
                   cr.bottom<=innerHeight+1) ? 'a la vista' : 'TAPADO';
    R.infoGrande = vis(g('ig-imgv-info'));
    g('ig-imgv-grande').click(); await esperar(350);
    R.mdVuelta = anchoMd();
    R.rotuloVuelta = g('ig-imgv-grande').textContent;
  }
  /* ── ESC cierra y SUELTA ── */
  const srcAntes = vd ? vd.getAttribute('src') : null;
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  await esperar(400);
  R.cerroConEsc = !!(ov && !ov.classList.contains('open'));
  R.urlTrasCerrar = (typeof _igVisorVidURL!=='undefined') ? (_igVisorVidURL||'(vacia)') : 'SIN VAR';
  R.srcTrasCerrar = vd ? (vd.getAttribute('src')||'(sin src)') : '-';
  R.posterTrasCerrar = vd ? (vd.getAttribute('poster')||'(sin poster)') : '-';
  R.pausaTrasCerrar = vd ? vd.paused : '-';
  R.claseTrasCerrar = md ? md.classList.contains('grande') : '-';
  R.srcHabia = !!srcAntes;
  return R;
})(QUIERE)`;

const b=await chromium.launch({channel:'chrome',args:['--autoplay-policy=no-user-gesture-required']});
const OUT={archivo:FILE, ancho:ANCHO, _consola:[], _pageErr:[]};
try{
  const ctx=await b.newContext({viewport:{width:ANCHO,height:900}});
  await ctx.addInitScript("try{localStorage.setItem('cfg-guardar-imagenes','1')}catch(e){}");
  const pg=await ctx.newPage();
  pg.on('pageerror',e=>{OUT._pageErr.push(e.message.slice(0,160))});
  pg.on('console',m=>{ if(m.type()==='error') OUT._consola.push(m.text().slice(0,160)) });
  await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
  await pg.waitForTimeout(1500);
  OUT.montaje = await pg.evaluate(MONTAR);
  await pg.waitForTimeout(600);
  OUT.video  = await pg.evaluate(MEDIR.replace('QUIERE',JSON.stringify('video')));
  OUT.imagen = await pg.evaluate(MEDIR.replace('QUIERE',JSON.stringify('imagen')));
  await pg.close(); await ctx.close();
}catch(e){OUT._err=String(e).slice(0,300)}
try{await b.close()}catch(e){}
fs.writeFileSync(OUTF,JSON.stringify(OUT,null,1));
console.log(JSON.stringify(OUT,null,1));
