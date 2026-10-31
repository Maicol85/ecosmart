#!/usr/bin/env node
/**
 * _probe_ajustes2img.mjs — el INVENTARIO 2a de la tanda AJUSTES-2 y la prueba del commit 2.
 *
 * Reproduce el caso que reporto el medico: Config PRENDIDO, un diagrama de Contractilidad
 * incluido en el PDF, se guarda el estudio, se cierra y se reabre; y mide donde se pierde.
 *
 * Para CADA entrada de INF_MIN_DIAG: si su toggle se puede prender, si `on()` da verdadero,
 * si al guardar el estudio queda algo en IndexedDB, y si aparece en «Imagenes guardadas».
 *
 *   node scripts/_probe_ajustes2img.mjs [--file <html>] [--out <json>]
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda. `node --check` no caza
 * los que viven en un comentario DENTRO del template, asi que van sin ellos a mano.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js','/tmp/pw/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log(JSON.stringify({error:'SIN PLAYWRIGHT'}));process.exit(2)}
const {chromium}=_pw; const fs=await import('fs');
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const OUTF=arg('--out')||'/tmp/aj2_img.json';
const CFG=arg('--cfg');           // '1' prendido, '0' apagado, ausente = clave SIN poner

const MONTAR = `(async (cfg) => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  /* la clave ya la puso addInitScript, ANTES de que la pagina se cargue */
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;
    e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  S('nombre','Prueba Diagramas'); S('ci','99999999');
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','60');
  /* CONTRACTILIDAD: el bulls eye necesita segmentos pintados para que su data() salga. */
  try { if (typeof contrEstado === 'object') { contrEstado['s1']=1; contrEstado['s2']=2; } } catch(e){}
  try { if (typeof strainEstado === 'object') { strainEstado['s1']=1; strainEstado['s2']=2; } } catch(e){}
  /* VAB: hace falta morfologia para que vabPdfFilas() devuelva algo. */
  S('va_morf','Bicúspide'); S('vab_fenotipo','rl'); S('vab_tipo','fused_rl');
  /* ETE quirurgica y TAVI */
  S('ete_tavi_pro_tam','26');
  /* UNA CAPTURA REAL en imgSlots, para poder probar la ✕ del punto 2d. Un PNG de 2x2 con la
     rebanada distinguible AL MEDIO y no al final: todo PNG termina igual, asi que con slice(-12)
     dos capturas distintas salen con la misma firma. Es la trampa 3 del mapa de AJUSTES-1. */
  try {
    if (typeof imgSlots !== 'undefined') {
      const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';
      imgSlots.length=0;
      imgSlots.push({dataURL:PNG,ampliada:false,calidad:'media',origen:'estudio'});
      if (typeof imgSlotCount!=='undefined') imgSlotCount=imgSlots.length;
      if (typeof imgEnsureLen==='function') imgEnsureLen();
      if (typeof imgMarcarEditado==='function') imgMarcarEditado();
    }
  } catch(e){}
  Object.keys(window).forEach(k=>{if(/^calc[A-Z]/.test(k)&&typeof window[k]==='function'){try{window[k]()}catch(e){}}});
  try{ if(typeof _recalcModulos==='function') _recalcModulos('aj2'); }catch(e){}
  return true;
})(CFG)`;

const INVENTARIO = `(async () => {
  const out = { cfgActivo: (typeof imgGuardadoActivo==='function') ? imgGuardadoActivo() : 'SIN FN',
                cfgClave: (function(){try{return String(localStorage.getItem('cfg-guardar-imagenes'))}catch(e){return 'EXC'}})(),
                cfgCasilla: (function(){const e=document.getElementById('cfg-guardar-imagenes');return e?(e.checked?'marcada':'sin marcar'):'NO EXISTE'})(),
                diag: [] };
  const REG = (typeof INF_MIN_DIAG !== 'undefined') ? INF_MIN_DIAG : [];
  out.nReg = REG.length;
  const SIN = (typeof window.__AJ2_SIN_DIAG !== 'undefined') && window.__AJ2_SIN_DIAG;
  for (const d of REG) {
    const fila = { k:d.k, lbl:d.lbl, campo:d.campo||'', chk:d.chk||'' };
    if (SIN) { fila.prendido='CONTROL NEGATIVO: ninguno se prende';
      try { fila.on = !!d.on(); } catch(e){ fila.on=false; }
      fila.data='(no se pide)'; fila.enSlots='no'; out.diag.push(fila); continue; }
    /* prender su toggle por el gesto real */
    if (d.campo) { const e=document.getElementById(d.campo); if(e){ e.value='1'; } fila.prendido='campo=1'; }
    else if (d.chk) { const e=document.getElementById(d.chk); if(e){ e.checked=true;
      e.dispatchEvent(new Event('change',{bubbles:true})); } fila.prendido='chk'; }
    else fila.prendido='sin control propio';
    try { fila.on = !!d.on(); } catch(e){ fila.on='EXC '+String(e).slice(0,50); }
    try { const u = d.data ? d.data() : null; fila.data = u ? ('dataURL '+String(u).length+' chars') : 'NULL'; }
    catch(e){ fila.data='EXC '+String(e).slice(0,50); }
    /* el slot: esta en imgSlots? */
    fila.enSlots = (typeof esqSlotIdx==='function') ? (esqSlotIdx(d.k)>=0 ? 'SI' : 'no') : 'SIN FN';
    out.diag.push(fila);
  }
  out.slotsVivos = (typeof imgSlots!=='undefined') ? imgSlots.filter(Boolean).length : 'SIN VAR';
  out.slotsEsquema = (typeof imgSlots!=='undefined')
    ? imgSlots.filter(Boolean).filter(s=>s.esquema).map(s=>s.esqClave||'?').join(',') : 'SIN VAR';
  return out;
})()`;

/* Guarda el estudio de verdad y lee IndexedDB. */
const GUARDAR = `(async () => {
  const r = { };
  try { if (typeof imgMarcarEditado==='function') imgMarcarEditado(); } catch(e){}
  /* ADVERTENCIA, Y COSTO UNA CORRIDA: guardarInforme tiene DOS salidas tempranas que no
     llaman al callback. Una es el paciente sin nombre ni documento -el campo es 'ci', no
     'documento'- y la otra es el gate de severidades valvulares, que abre una card modal y
     espera la confirmacion del medico: la promesa queda dormida y el reloj de 20 s la mata.
     Es la trampa que el D-11 documenta, con una causa mas. */
  /* valvSevConfirmada es un let del script: NO es propiedad de window y asignarla desde
     afuera no la mueve. Lo que si se puede reemplazar es la funcion que abre la card, que al
     ser una declaracion de funcion en scope global SI vive en window. */
  try { window.mostrarCardSeveridadValvular = function (cb) { if (typeof cb === 'function') cb(); }; } catch(e){}
  const guardado = await new Promise((res) => {
    const t = setTimeout(()=>res('RELOJ 20s'), 20000);
    try { guardarInforme(function(){ clearTimeout(t); res('ok') }); }
    catch(e){ clearTimeout(t); res('EXC '+String(e).slice(0,80)) }
  });
  r.guardado = guardado;
  r.uuid = (typeof _imgUuidActual!=='undefined') ? String(_imgUuidActual) : 'SIN VAR';
  /* lo que quedo en IndexedDB para ese uuid */
  try {
    if (typeof CeiboImg!=='undefined' && CeiboImg.leer && r.uuid && r.uuid!=='null') {
      const im = await CeiboImg.leer(r.uuid);
      r.imgsEnDisco = im ? (im.length!==undefined ? im.length : 'raro') : 0;
    } else r.imgsEnDisco = 'sin uuid';
    if (typeof CeiboImg!=='undefined' && CeiboImg.esquemas && r.uuid && r.uuid!=='null') {
      const es = await CeiboImg.esquemas(r.uuid);
      r.esqsEnDisco = es ? es.length : 0;
      r.esqsClaves = es ? es.map(x=>x.clave||x.esqClave||'?').join(',') : '';
    } else r.esqsEnDisco = 'sin uuid';
  } catch(e){ r.discoErr = String(e).slice(0,120) }
  /* ══ 2c y 2d: reabrir el estudio y mirar que quedo ════════════════════════════════════ */
  r.tras = {};
  try {
    /* la ✕ sobre una captura: marca noPdf y NO borra */
    if (typeof imgSlots !== 'undefined' && imgSlots.filter(Boolean).length) {
      const i = imgSlots.findIndex(x => x && !x.esquema);
      if (i >= 0) { imgSlots[i].noPdf = true;
        if (typeof imgMarcarEditado === 'function') imgMarcarEditado();
        if (typeof imgPersistir === 'function') await imgPersistir(r.uuid);
        r.tras.marcoNoPdf = 'slot ' + i; }
      else r.tras.marcoNoPdf = 'sin captura que marcar';
    } else r.tras.marcoNoPdf = 'sin slots';
    /* reabrir: vaciar imgSlots y restaurar desde disco, que es lo que hace editarInforme */
    if (typeof imgSlots !== 'undefined') { imgSlots.length = 0; }
    if (typeof imgRestaurar === 'function') await imgRestaurar(r.uuid);
    r.tras.slotsVivos = (typeof imgSlots !== 'undefined') ? imgSlots.filter(Boolean).length : 'SIN VAR';
    r.tras.noPdfVivos = (typeof imgSlots !== 'undefined')
      ? imgSlots.filter(Boolean).filter(x => x.noPdf).length : 'SIN VAR';
    const es2 = (typeof CeiboImg !== 'undefined' && CeiboImg.esquemas) ? await CeiboImg.esquemas(r.uuid) : [];
    r.tras.esqs = es2.length;
    r.tras.esqsDetalle = es2.map(x => x.clave + '/' + (x.nombre || '') + '/' + (x.esquema ? 'esquema' : 'SIN MARCA')
                                      + '/' + String(x.dataURL || '').length + 'ch').join(' | ');
  } catch (e) { r.tras.err = String(e).slice(0, 140) }
  /* ══ 2c · «IMAGENES GUARDADAS»: marca, estrella y PPT ════════════════════════════════════
     El indice es lo que alimenta la grilla; igImgBlobs concatena imgs + esqs con el MISMO
     orden, asi que el idx de un esquema arranca en imgs.length. */
  r.ig = {};
  try {
    const idx = (typeof CeiboImg !== 'undefined' && CeiboImg.indice) ? await CeiboImg.indice() : null;
    const mio = idx ? (idx.filter ? idx.filter(x => x.uuid === r.uuid) : []) : [];
    /* ⚠️ indice() devuelve UN REGISTRO POR ESTUDIO con su array slots, no un elemento por
       imagen. Contar mio.length daba 1 y se leia como «la grilla no ve los esquemas», que es
       falso. El denominador es slots. Costo una medicion. */
    const sl = mio.length ? (mio[0].slots || []) : [];
    r.ig.enIndice = sl.length;
    r.ig.conMarca = sl.filter(x => x.esquema).length;
    r.ig.detalle = sl.map(x => (x.esquema ? 'esquema' : 'captura') + '/' + x.calidad + '/' + x.chars + 'ch').join(' | ');
    const nImgs = sl.filter(x => !x.esquema).length;
    const mio2 = sl;
    if (typeof CeiboImg !== 'undefined' && CeiboImg.marcar && mio2.length > nImgs) {
      await CeiboImg.marcar(r.uuid, nImgs, { star: true });
      const es3 = await CeiboImg.esquemas(r.uuid);
      r.ig.estrellaEnEsquema = es3.filter(x => x.star).length;
    } else r.ig.estrellaEnEsquema = 'no se pudo probar';
    /* el PPT de «Imagenes guardadas» ve los esquemas? */
    const blobs = (typeof igImgBlobs === 'function') ? await igImgBlobs(r.uuid) : null;
    r.ig.blobs = blobs ? blobs.length : 'SIN FN';
  } catch (e) { r.ig.err = String(e).slice(0, 160) }
  return r;
})()`;

const b=await chromium.launch({channel:'chrome'});
const OUT={archivo:FILE, cfgPedido: CFG===null?'(clave AUSENTE)':CFG};
try{
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  /* ⚠️ LA CLAVE VA ANTES DE CARGAR: la casilla de Config se pinta al arrancar, asi que
     escribirla despues deja la pantalla diciendo «sin marcar» con la clave puesta — un falso
     negativo de la sonda, no de la app. Medido. */
  if (CFG === '1' || CFG === '0') await ctx.addInitScript(
    "try{localStorage.setItem('cfg-guardar-imagenes'," + JSON.stringify(CFG) + ")}catch(e){}");
  else await ctx.addInitScript("try{localStorage.removeItem('cfg-guardar-imagenes')}catch(e){}");
  const pg=await ctx.newPage();
  pg.on('pageerror',e=>{OUT._pageErr=(OUT._pageErr||[]).concat([e.message.slice(0,140)])});
  await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
  await pg.waitForTimeout(1500);
  if (process.argv.indexOf('--sin-diagramas') > -1)
    await pg.evaluate("window.__AJ2_SIN_DIAG = true");
  await pg.evaluate(MONTAR.replace('CFG', JSON.stringify(CFG)));
  await pg.waitForTimeout(600);
  OUT.inventario = await pg.evaluate(INVENTARIO);
  OUT.guardado = await pg.evaluate(GUARDAR);
  await pg.close(); await ctx.close();
}catch(e){OUT._err=String(e).slice(0,250)}
try{await b.close()}catch(e){}
fs.writeFileSync(OUTF,JSON.stringify(OUT,null,1));
console.log(JSON.stringify(OUT,null,1));
