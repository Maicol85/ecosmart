#!/usr/bin/env node
/**
 * _probe_img3ppt.mjs - el INVENTARIO 2a y la prueba del commit 2 de la tanda IMAGENES-3.
 *
 * Genera el PPT DE VERDAD -los dos caminos- con un estudio que tiene un video, intercepta el
 * paquete antes de la descarga y le lee el XML con el JSZip que el propio bundle de PptxGenJS
 * expone en window. Sin eso, «el PPT incrusta el video» no se puede verificar.
 *
 *   node scripts/_probe_img3ppt.mjs [--file <html>] [--out <json>]
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
const OUTF=arg('--out')||'/tmp/img3_ppt.json';
const SINVIDEO = process.argv.indexOf('--sin-video')>-1;   /* CONTROL NEGATIVO */

const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';

const MONTAR = `(async (sinVideo) => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  S('nombre','Prueba PPT Video'); S('ci','66666666'); S('fecha_estudio','2026-10-31');
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','60');
  const out={sinVideo:!!sinVideo};
  let blob=null, tipo='';
  if (!sinVideo) {
    const c=document.createElement('canvas'); c.width=160; c.height=120;
    const cx=c.getContext('2d'); let f=0;
    const pintar=()=>{ cx.fillStyle=(f%2)?'#204080':'#802040'; cx.fillRect(0,0,160,120);
      cx.fillStyle='#fff'; cx.font='28px sans-serif'; cx.fillText(String(f),10,70); f++ };
    pintar();
    try{
      const st=c.captureStream(20);
      const mimes=['video/webm;codecs=vp8','video/webm'];
      let mime=''; for(const m of mimes){ if(window.MediaRecorder && MediaRecorder.isTypeSupported(m)){mime=m;break} }
      if(mime){
        const mr=new MediaRecorder(st,{mimeType:mime}); const tr=[];
        mr.ondataavailable=e=>{if(e.data&&e.data.size)tr.push(e.data)};
        const fin=new Promise(r=>{mr.onstop=r});
        mr.start(); const iv=setInterval(pintar,50);
        await new Promise(r=>setTimeout(r,900)); clearInterval(iv); mr.stop(); await fin;
        blob=new Blob(tr,{type:mime}); tipo=mime;
      }
    }catch(e){ out.errGrabar=String(e).slice(0,120) }
  }
  out.videoBytes = blob?blob.size:0;
  if (typeof imgSlots!=='undefined') {
    imgSlots.length=0;
    imgSlots.push({dataURL:PNGQ,ampliada:false,calidad:'media',origen:'estudio'});
    if(blob){
      const vid='vid-ppt-1';
      imgSlots.push({dataURL:PNGQ,ampliada:false,calidad:'media',origen:'estudio',
                     videoId:vid,videoNombre:'clip-ppt.mp4',videoDur:0.9});
      _videoBlobs[vid]={id:vid,blob:blob,nombre:'clip-ppt.mp4',tipo:'video/mp4',bytes:blob.size};
    }
    if(typeof imgSlotCount!=='undefined') imgSlotCount=imgSlots.length;
    if(typeof imgEnsureLen==='function') imgEnsureLen();
    if(typeof imgMarcarEditado==='function') imgMarcarEditado();
  }
  try{ window.mostrarCardSeveridadValvular=function(cb){if(typeof cb==='function')cb()} }catch(e){}
  /* EL INFORME TIENE QUE EXISTIR: generarPPT sale temprano con «Este estudio no tiene informe
     generado» y no descarga nada. Costo una corrida. */
  try{ if(typeof generarInforme==='function') generarInforme() }catch(e){ out.errInforme=String(e).slice(0,100) }
  await new Promise(r=>setTimeout(r,600));
  out.informeChars = String((document.getElementById('informe_texto')||{}).value||'').length;
  out.guardado = await new Promise(res=>{
    let l=false; const t=setTimeout(()=>{if(!l){l=true;res('TIMEOUT 25s')}},25000);
    try{ guardarInforme(()=>{if(!l){l=true;clearTimeout(t);res('ok')}}) }
    catch(e){ if(!l){l=true;clearTimeout(t);res('EXC '+String(e).slice(0,80))} }
  });
  const infs=(typeof getInformes==='function')?getInformes():[];
  const mio=infs.filter(i=>i&&i.nombre==='Prueba PPT Video')[0]||null;
  out.uuid=mio?mio.uuid:'SIN ESTUDIO'; out.id=mio?mio.id:null;
  if(mio){ const vs=(typeof CeiboVideo!=='undefined')?await CeiboVideo.leer(mio.uuid):null;
           out.enStoreVideo=vs?vs.length:'null' }
  return out;
})(SINV)`.replace(/PNGQ/g,JSON.stringify(PNG));

/* Intercepta el paquete: el ancla de `_pptxDescargarSaneado` y tambien `writeFile`. */
const PPT_ESTUDIO = `(async (id) => {
  const R={};
  if (typeof PptxGenJS==='undefined') return {err:'SIN PPTXGENJS'};
  if (typeof JSZip==='undefined') return {err:'SIN JSZIP'};
  let capturado=null;
  const oClick=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){
    if(this.download && /\\.pptx$/i.test(this.download)){ capturado=this.href; return }
    return oClick.apply(this,arguments);
  };
  R.toasts=[]; const oToast=window.toast;
  window.toast=function(t){ R.toasts.push(String(t).slice(0,140)); try{return oToast.apply(this,arguments)}catch(e){} };
  const oAlert=window.alert, oConfirm=window.confirm;
  window.alert=function(t){ R.toasts.push('ALERT: '+String(t).slice(0,140)) };
  window.confirm=function(t){ R.toasts.push('CONFIRM: '+String(t).slice(0,100)); return true };
  const oTema=window._pptElegirTema, oQuien=window._pptElegirPresentador,
        oEleg=window._pptElegirImagenes;
  window._pptElegirTema=function(cb){return cb('dark')};
  window._pptElegirPresentador=function(inf,cb){return cb('Medico de prueba')};
  /* EL TERCER MODAL, y es el que faltaba: generarPPT encadena tema -> presentador -> QUE
     IMAGENES. Sin contestarlo la cadena queda dormida y la sonda decia «no capturado» sobre un
     PPT que nunca se pidio. Y los videos arrancan SIN TILDAR en ese panel, asi que ademas hay
     que tildarlos a mano: el default de la app es la decision barata. */
  window._pptElegirImagenes=function(imgs,vids,cb){
    R.ofrecidas=(imgs||[]).length; R.ofrecidosVids=(vids||[]).length;
    return cb({sel:(imgs||[]).map(o=>o.i), layout:_PPT_IMG_LAYOUT_DEF, vids:(vids||[])});
  };
  try{ await generarPPT(id) }catch(e){ R.err=String(e).slice(0,160) }
  /* ADVERTENCIA: generarPPT es LARGO -lee el video de IndexedDB, mira su tkhd, puede
     re-codificarlo y convierte el poster a PNG-, asi que 2,5 s daba «no capturado» sobre un
     PPT que se iba a generar bien. Se espera hasta 40 s mirando si el paquete ya llego. */
  for(let i=0;i<80 && !capturado;i++) await new Promise(r=>setTimeout(r,500));
  R.avisos = (typeof _pptAvisos!=='undefined') ? _pptAvisos.slice(0,6) : 'SIN VAR';
  window.toast=oToast; window.alert=oAlert; window.confirm=oConfirm;
  window._pptElegirTema=oTema; window._pptElegirPresentador=oQuien;
  window._pptElegirImagenes=oEleg;
  delete HTMLAnchorElement.prototype.click;
  R.capturado=!!capturado;
  if(!capturado) return R;
  const buf=await (await fetch(capturado)).arrayBuffer();
  R.bytes=buf.byteLength;
  const zip=await JSZip.loadAsync(buf);
  const partes=Object.keys(zip.files).filter(k=>!zip.files[k].dir);
  R.nPartes=partes.length;
  R.medios=partes.filter(p=>/^ppt\\/media\\//.test(p)).join(' | ');
  const slides=partes.filter(p=>/^ppt\\/slides\\/slide\\d+\\.xml$/.test(p)).sort();
  R.nSlides=slides.length;
  R.slideConVideo=[]; R.xmlVideo=''; R.timingVideo=''; R.relsVideo='';
  for(const sp of slides){
    const x=await zip.file(sp).async('string');
    if(x.indexOf('videoFile')<0) continue;
    R.slideConVideo.push(sp);
    if(!R.xmlVideo){
      R.xmlVideo=x;
      R.tieneTiming = x.indexOf('<p:timing')>-1;
      R.tieneRepeat = x.indexOf('repeatCount')>-1;
      R.tieneIndefinite = x.indexOf('repeatCount="indefinite"')>-1;
      R.tieneCMediaNode = x.indexOf('cMediaNode')>-1;
      R.tienePVideo = x.indexOf('<p:video>')>-1;
      const m=x.match(/<p:timing[\\s\\S]*?<\\/p:timing>/);
      R.timingVideo = m ? m[0] : '(SIN p:timing)';
      const mp=x.match(/<p:pic>[\\s\\S]*?videoFile[\\s\\S]*?<\\/p:pic>/);
      R.picVideo = mp ? mp[0] : '(SIN p:pic con videoFile)';
      const mid=x.match(/<p:cNvPr\\s+id="(\\d+)"\\s+name="[^"]*"[^>]*>\\s*<a:hlinkClick[^>]*\\/>/);
      R.spidCandidato = mid?mid[1]:'(no se pudo leer)';
      const rp='ppt/slides/_rels/'+sp.split('/').pop()+'.rels';
      if(zip.file(rp)) R.relsVideo=await zip.file(rp).async('string');
    }
  }
  R.ctMp4 = (await zip.file('[Content_Types].xml').async('string')).indexOf('mp4')>-1;
  return R;
})(__ID__)`;

/* El PPT de «Imagenes guardadas»: se elige TODO -imagen y video- y se mira que entra. */
const PPT_IMAGENES = `(async () => {
  const R={};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  try{ if(typeof showTab==='function') showTab('guardados') }catch(e){}
  await esperar(250);
  try{ if(typeof igImgInvalidar==='function') igImgInvalidar() }catch(e){}
  try{ if(typeof igVistaCambiar==='function') igVistaCambiar('img') }catch(e){}
  await esperar(900);
  document.querySelectorAll('.ig-mes-grupo.cerrado > .ig-mes').forEach(b=>{try{b.click()}catch(e){}});
  await esperar(400);
  /* el modo PPT y la eleccion de TODAS las miniaturas, por el gesto real */
  /* «Armar PPT» es una CASILLA (#ig-ppt-on), no un boton: buscarla entre los <button> daba
     «no hay boton» y cero elegidas, que se lee como que el PPT de imagenes no existe. */
  const chk=document.getElementById('ig-ppt-on');
  R.hayCasillaArmar=!!chk;
  if(chk && !chk.checked){ chk.checked=true; chk.dispatchEvent(new Event('change',{bubbles:true})) }
  await esperar(900);
  document.querySelectorAll('.ig-mes-grupo.cerrado > .ig-mes').forEach(b=>{try{b.click()}catch(e){}});
  await esperar(500);
  const ths=[...document.querySelectorAll('.ig-img-th')];
  R.miniaturas=ths.length;
  R.conVideo=ths.filter(b=>b.querySelector('.ig-img-vb')).length;
  /* ⚠️ LOS NODOS SE DESPRENDEN EN CADA REPINTADO: cada clic llama a igImgSidePintar, que
     reconstruye la grilla, asi que clickear la lista cacheada elige UNA sola. Es la trampa que
     la ficha de TC-550 documenta. Se vuelve a consultar el DOM entre clic y clic. */
  for(let i=0;i<ths.length;i++){
    const ahora=[...document.querySelectorAll('.ig-img-th')];
    if(ahora[i]) { try{ ahora[i].click() }catch(e){} }
    await esperar(260);
  }
  await esperar(500);
  R.elegidas = (typeof _igImgSel!=='undefined')?_igImgSel.length:'SIN VAR';
  let capturado=null;
  const oClick=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){
    if(this.download && /\\.pptx$/i.test(this.download)){ capturado=this.href; return }
    return oClick.apply(this,arguments); };
  try{ await igImgPptExportar() }catch(e){ R.err=String(e).slice(0,160) }
  await esperar(3000);
  delete HTMLAnchorElement.prototype.click;
  R.resultado=(document.getElementById('ig-img-res')||{}).textContent||'(sin nodo)';
  R.resAlt=[...document.querySelectorAll('.ig-img-res')].map(n=>n.textContent.slice(0,260)).join(' // ')||'(sin .ig-img-res)';
  R.capturado=!!capturado;
  if(capturado && typeof JSZip!=='undefined'){
    const buf=await (await fetch(capturado)).arrayBuffer();
    R.bytes=buf.byteLength;
    const zip=await JSZip.loadAsync(buf);
    const partes=Object.keys(zip.files).filter(k=>!zip.files[k].dir);
    R.medios=partes.filter(p=>/^ppt\\/media\\//.test(p)).join(' | ');
    R.nSlides=partes.filter(p=>/^ppt\\/slides\\/slide\\d+\\.xml$/.test(p)).length;
    let conVid=0, rep=0;
    for(const sp of partes.filter(p=>/^ppt\\/slides\\/slide\\d+\\.xml$/.test(p))){
      const x=await zip.file(sp).async('string');
      if(x.indexOf('videoFile')>-1) conVid++;
      if(x.indexOf('repeatCount="indefinite"')>-1) rep++;
    }
    R.slidesConVideo=conVid; R.slidesConRepeat=rep;
  }
  return R;
})()`;

/* Los DOS umbrales del aviso de tamanio, por el panel REAL: se le pasan videos sinteticos con
   el peso que hace falta y se aprieta «Generar PPT». Lo que se mide es el texto del confirm. */
const AVISOS = `(async () => {
  const R={};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  R.constantes = {
    video: (typeof PPT_VIDEO_AVISO_MB!=='undefined')?PPT_VIDEO_AVISO_MB:'SIN VAR',
    archivo: (typeof PPT_PPTX_AVISO_MB!=='undefined')?PPT_PPTX_AVISO_MB:'SIN VAR',
    piso: (typeof PPT_PPTX_PISO_BYTES!=='undefined')?PPT_PPTX_PISO_BYTES:'SIN VAR'
  };
  const probar = async (mb) => {
    const vids=[{k:'vX',clase:'mp4',nombre:'clip.mp4',bytes:Math.round(mb*1048576),
                 dur:10,w:640,h:480,poster:'',blob:new Blob([new Uint8Array(8)]),tipo:'video/mp4'}];
    let texto='(sin confirm)';
    const oC=window.confirm;
    window.confirm=function(t){ texto=String(t); return false };   /* se CANCELA: no genera nada */
    let devuelto='(no llamo al cb)';
    try{
      _pptElegirImagenes([], vids, function(){ devuelto='llamo al cb' });
      await esperar(300);
      const chs=[...document.querySelectorAll('[data-ppt-chk-vid="vX"]')];
      const ch=chs[chs.length-1];
      if(!ch){ window.confirm=oC; return {err:'no hay casilla del video'} }
      ch.checked=true; ch.dispatchEvent(new Event('change',{bubbles:true}));
      await esperar(200);
      /* El atributo es data-ppt-act, NO data-ppt-btn, y el respaldo por texto encontraba un
         boton de OTRO modal. Se toma el ULTIMO, que es el del panel recien abierto. */
      const gens=[...document.querySelectorAll('[data-ppt-act="generar"]')];
      const gen=gens[gens.length-1];
      if(!gen){ window.confirm=oC; return {err:'no hay boton Generar'} }
      gen.click();
      await esperar(300);
    }catch(e){ texto='EXC '+String(e).slice(0,110) }
    window.confirm=oC;
    /* cerrar el panel si quedo abierto */
    const cs=[...document.querySelectorAll('[data-ppt-act="cancelar"]')];
    for(const c of cs){ try{ c.click() }catch(e){} }
    await esperar(200);
    return {texto:texto.slice(0,300), cb:devuelto};
  };
  R.de10  = await probar(10);     /* por debajo de los dos umbrales */
  R.de60  = await probar(60);     /* pasa el de 50, no el de 100 */
  R.de150 = await probar(150);    /* pasa el de 100 */
  return R;
})()`;

/* El aviso de PRIVACIDAD de Guardados, con un video entre lo elegido. */
const PRIVACIDAD = `(async () => {
  const R={};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  R.sel=(typeof _igImgSel!=='undefined')?_igImgSel.length:'SIN VAR';
  R.selVideo=(typeof _igImgSel!=='undefined')
    ? _igImgSel.filter(it=>{const m=igImgMeta(it.uuid,it.idx);return !!(m&&m.video)}).length : 'SIN VAR';
  try{ igImgPptPedir() }catch(e){ R.err=String(e).slice(0,120) }
  await esperar(300);
  R.abierto = !!(document.getElementById('ig-ppt-aviso-ov')||{}).classList
              && document.getElementById('ig-ppt-aviso-ov').classList.contains('open');
  R.texto=(document.getElementById('ig-ppt-aviso-txt')||{}).textContent||'(sin nodo)';
  try{ igImgPptAviso(false) }catch(e){}
  return R;
})()`;

const b=await chromium.launch({channel:'chrome'});
const OUT={archivo:FILE, sinVideo:SINVIDEO, _consola:[], _pageErr:[]};
try{
  const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
  await ctx.addInitScript("try{localStorage.setItem('cfg-guardar-imagenes','1')}catch(e){}");
  const pg=await ctx.newPage();
  pg.on('pageerror',e=>{OUT._pageErr.push(e.message.slice(0,160))});
  pg.on('console',m=>{ if(m.type()==='error') OUT._consola.push(m.text().slice(0,160)) });
  await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
  await pg.waitForTimeout(2500);
  OUT.libreria = await pg.evaluate(`({
    pptx: typeof PptxGenJS, jszip: typeof JSZip,
    ver: (function(){try{return (new PptxGenJS()).version||'(sin version)'}catch(e){return 'EXC'}})(),
    addMedia: (function(){try{const p=new PptxGenJS();const s=p.addSlide();return typeof s.addMedia}catch(e){return 'EXC'}})()
  })`);
  OUT.montaje = await pg.evaluate(MONTAR.replace('SINV',JSON.stringify(SINVIDEO)));
  await pg.waitForTimeout(500);
  if (OUT.montaje && OUT.montaje.id)
    OUT.pptEstudio = await pg.evaluate(PPT_ESTUDIO.replace('__ID__',JSON.stringify(OUT.montaje.id)));
  OUT.pptImagenes = await pg.evaluate(PPT_IMAGENES);
  OUT.privacidad = await pg.evaluate(PRIVACIDAD);
  OUT.avisosTam = await pg.evaluate(AVISOS);
  await pg.close(); await ctx.close();
}catch(e){OUT._err=String(e).slice(0,300)}
try{await b.close()}catch(e){}
fs.writeFileSync(OUTF,JSON.stringify(OUT,null,1));
const chico=JSON.parse(JSON.stringify(OUT));
if(chico.pptEstudio) chico.pptEstudio.xmlVideo='('+String(OUT.pptEstudio.xmlVideo||'').length+' caracteres, en el json)';
console.log(JSON.stringify(chico,null,1));
