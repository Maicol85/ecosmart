#!/usr/bin/env node
/**
 * _probe_tga1.mjs — el COMMIT 1 de la tanda TGA-1: el valor de anatomia nuevo, el campo de
 * cirugia, el Excel con su columna al final y el round-trip de ida y vuelta.
 *
 *   node scripts/_probe_tga1.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates, y sin barras invertidas simples.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw;
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');

const CUERPO = `(async () => {
  const R={};
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE';e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'};
  const sv=id=>{const e=document.getElementById(id);return e?String(e.value):'NO EXISTE'};

  /* ── (A) DENOMINADOR: el campo y el valor nuevos EXISTEN ── */
  const selT=document.getElementById('tga_tipo');
  R.A1_opcionesTipo = selT ? Array.prototype.map.call(selT.options,o=>o.value).join('|') : 'NO EXISTE';
  const selC=document.getElementById('tga_cirugia');
  R.A2_opcionesCir = selC ? Array.prototype.map.call(selC.options,o=>o.value).join('|') : 'NO EXISTE';
  R.A3_rotuloCir = selC ? (selC.closest('.fg')||{}).innerText : 'NO EXISTE';

  /* ── (B) LA FILA SE MUESTRA SOLO CON d-TGA ── */
  /* ATENCION: LA SECCION DE LA TGA VIVE EN LA SUB-PESTANA «CC complejas»
     (tab-congenitas2), NO EN «congenitas». Abrir solo la primera deja todo el arbol de la TGA
     bajo un display:none, asi que offsetParent da null y TODO getBoundingClientRect da 0x0 —
     y el diagrama, que no se dibuja si la seccion no se ve, parece no existir. Costo una
     corrida entera. Hay que tocar el boton de la pestana Y el de la sub-pestana, los dos
     reales.
     Y OJO con dos trampas de este arnes: sin acentos graves aca adentro, porque esto vive
     en un template literal; y el selector NO se escribe con comillas escapadas —un \' que
     cruza el template llega como comilla pelada y rompe el parseo del lado del navegador—,
     asi que el boton se busca leyendo su atributo onclick. */
  const _btnPorOnclick = (t) => Array.prototype.filter.call(
        document.querySelectorAll('button[onclick]'),
        b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0] || null;
  try{ const bt=_btnPorOnclick('showTab(' + String.fromCharCode(39) + 'congenitas' + String.fromCharCode(39));
       if(bt) bt.click(); else if(typeof showTab==='function') showTab('congenitas');
       const sb=_btnPorOnclick('ccSubTab(' + String.fromCharCode(39) + 'congenitas2');
       if(sb) sb.click(); else if(typeof ccSubTab==='function') ccSubTab('congenitas2'); }catch(e){}
  try{ if(typeof secToggle==='function') secToggle('cc-tga'); }catch(e){}
  await new Promise(r=>setTimeout(r,250));
  const fila=document.getElementById('tga-cirugia-row');
  const disp=()=>fila?getComputedStyle(fila).display:'NO EXISTE';
  S('tga_tipo',''); R.B0_sinTipo=disp();
  S('tga_tipo','dtga'); R.B1_dtga=disp();
  S('tga_tipo','cctga'); R.B2_cctga=disp();
  S('tga_tipo','mustard'); R.B3_mustard=disp();
  S('tga_tipo','senning'); R.B4_senning=disp();

  /* ── (C) EL DUENO UNICO DE LOS DOS EJES ── */
  const EJ=(t,c)=>{S('tga_tipo',t);S('tga_cirugia',c);const e=tgaEjes();
    return e.anat+'/'+e.cir+'/'+(e.cirDeTipo?'T':'-')+'/'+(e.cirIgnorada?'I':'-')};
  R.C1_vacio      = EJ('','');
  R.C2_dtgaSinDato= EJ('dtga','');
  R.C3_dtgaNinguna= EJ('dtga','ninguna');
  R.C4_dtgaAuric  = EJ('dtga','auricular');
  R.C5_cctga      = EJ('cctga','');
  R.C6_cctgaConCir= EJ('cctga','auricular');
  R.C7_mustard    = EJ('mustard','');
  R.C8_senning    = EJ('senning','ninguna');
  /* control negativo: un valor que NO esta en el vocabulario no se cuela */
  S('tga_tipo','dtga'); const sc=document.getElementById('tga_cirugia');
  if(sc){const o=document.createElement('option');o.value='jatene';o.textContent='x';sc.appendChild(o);sc.value='jatene';
    sc.dispatchEvent(new Event('change',{bubbles:true}));}
  R.C9_jateneNoVale = tgaEjes().cir==='' ? 'ignorado' : ('SE COLO: '+tgaEjes().cir);
  if(sc){const l=sc.querySelector('option[value="jatene"]'); if(l) l.remove(); sc.value='';}

  /* ── (D) EL INFORME NO PUBLICA EL TOKEN CRUDO ── */
  S('tga_tipo','dtga'); S('tga_func_vd','normal'); S('tga_sintomas','no');
  const cc=tgaConclusion();
  R.D1_txt = cc ? cc.txt.slice(0,110) : 'NULL';
  R.D2_tokenCrudo = cc ? (/arterias dtga/.test(cc.txt)?'TOKEN CRUDO':'no') : 'NULL';
  R.D3_resumen = cc ? cc.resumen.slice(0,80) : 'NULL';

  /* ── (E) EXCEL: cuantas columnas, y donde cae la nueva ── */
  const fv={id:0,campos:{}};
  const cols=_labOrdenarCols(Object.keys(_labExcelRow(fv)));
  R.E1_nCols = cols.length;
  R.E2_idxNueva = cols.indexOf('TGA cirugía realizada');
  R.E3_vecinas = cols.slice(Math.max(0,cols.indexOf('TGA cirugía realizada')-2),
                            cols.indexOf('TGA cirugía realizada')+2).join(' | ');
  R.E4_bloque = (typeof _labXlsBloqueDe==='function') ? _labXlsBloqueDe('TGA cirugía realizada') : '?';
  /* ── (F) el VALOR exportado, y la celda vacia de un estudio viejo ── */
  R.F1_vacia  = JSON.stringify(_labExcelRow(fv)['TGA cirugía realizada']);
  R.F2_ninguna= JSON.stringify(_labExcelRow({id:1,campos:{tga_tipo:'dtga',tga_cirugia:'ninguna'}})['TGA cirugía realizada']);
  R.F3_auric  = JSON.stringify(_labExcelRow({id:1,campos:{tga_tipo:'dtga',tga_cirugia:'auricular'}})['TGA cirugía realizada']);
  R.F4_tipoNuevo = JSON.stringify(_labExcelRow({id:1,campos:{tga_tipo:'dtga'}})['TGA tipo']);
  /* ── (G) ROUND-TRIP: la etiqueta exportada vuelve a entrar ── */
  const V=(campo,val)=>{const r=_labXlsVocab(campo,val);return r===null?'RECHAZADA':JSON.stringify(r)};
  R.G1_ida_cir_ninguna = V('tga_cirugia','Sin cirugía');
  R.G2_ida_cir_auric   = V('tga_cirugia','Switch auricular (Mustard o Senning)');
  R.G3_ida_tipo_nuevo  = V('tga_tipo','TGA completa (d-TGA)');
  R.G4_ida_tipo_viejo  = V('tga_tipo','ccTGA');
  R.G5_vacio           = V('tga_cirugia','');
  R.G6_basura          = V('tga_cirugia','Jatene');
  /* ── (H) los valores validos que el importador anuncia ── */
  R.H1_msgTipo = (typeof LAB_XLS_OPCIONES==='object'&&LAB_XLS_OPCIONES)?String(LAB_XLS_OPCIONES.tga_tipo||'NO HAY'):'NO HAY MAPA';
  R.H2_msgCir  = (typeof LAB_XLS_OPCIONES==='object'&&LAB_XLS_OPCIONES)?String(LAB_XLS_OPCIONES.tga_cirugia||'NO HAY'):'NO HAY MAPA';
  /* ── (I) CENSO: el campo nuevo es campo del ESTUDIO y se persiste ── */
  S('tga_tipo','dtga'); S('tga_cirugia','auricular');
  R.I1_persistido = (function(){ const ids=[];
    document.querySelectorAll('select[id]').forEach(e=>{ if(e.id==='tga_cirugia') ids.push(e.id+'='+e.value) });
    return ids.join(',')||'NO LO BARRE'; })();
  /* el valor NO se borra al esconder la fila */
  S('tga_tipo','cctga');
  R.I2_noSeBorra = sv('tga_cirugia')==='auricular' ? 'conserva' : ('SE BORRO: '+sv('tga_cirugia'));
  return R;
})()`;

const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage();
const errs=[]; pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1200);
let R;
try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,400)} }
console.log('ARCHIVO '+FILE);
Object.keys(R).forEach(k=>console.log('  '+k+' = '+String(R[k]).replace(/\n/g,' / ').slice(0,180)));
console.log('  ERRORES_CONSOLA = '+errs.length+(errs.length?(' :: '+errs.slice(0,3).join(' | ').slice(0,300)):''));
await b.close();
