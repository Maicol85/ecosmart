#!/usr/bin/env node
/**
 * _probe_tga2.mjs — el DIAGRAMA 3D del commit 2: carga diferida, los escenarios alcanzables,
 * las comunicaciones leidas de sus pestanas, «Incluir en el PDF» y la linea del papel.
 *
 *   node scripts/_probe_tga2.mjs [--file <html>]
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
  const esperar=async(f,ms)=>{const t0=Date.now();while(Date.now()-t0<(ms||12000)){if(f())return true;
    await new Promise(r=>setTimeout(r,120))}return false};
  const cvs=()=>document.querySelector('#tga-3d-cv canvas');
  const dim=()=>{const c=cvs();if(!c)return 'SIN CANVAS';const r=c.getBoundingClientRect();
    return Math.round(r.width)+'x'+Math.round(r.height)};
  const lbls=()=>Array.prototype.map.call(document.querySelectorAll('#tga-3d-cv .tga3d-lbl'),e=>e.textContent).join(',');

  /* (A) DENOMINADOR + CARGA DIFERIDA: la libreria NO esta antes de abrir nada */
  R.A1_threeAlArrancar = (typeof window.THREE==='undefined') ? 'no cargada' : 'YA CARGADA';
  R.A2_cajaExiste = document.getElementById('tga-3d-box') ? 'si' : 'NO EXISTE';
  R.A3_scriptThree = document.querySelectorAll('script[src*="three"]').length;

  /* (B) seccion abierta por su BOTON REAL, sin tipo: no dibuja y NO carga la libreria */
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
  await new Promise(r=>setTimeout(r,200));
  /* ATENCION: la seccion de la TGA YA VIENE ABIERTA al entrar a la sub-pestana, asi que un
     click a ciegas la CIERRA — y entonces el diagrama no carga, porque la carga diferida pide la
     seccion abierta. Se abre SOLO si esta cerrada. Costo una corrida. */
  const _acc=document.getElementById('sacc-cc-tga');
  if(_acc && !_acc.classList.contains('open')){
    const hdr=document.querySelector('#sacc-cc-tga .sacc-hdr'); if(hdr) hdr.click(); }
  await new Promise(r=>setTimeout(r,500));
  R.B1_abierta = document.querySelector('#sacc-cc-tga').classList.contains('open')?'si':'NO';
  R.B2_sinTipo_three = (typeof window.THREE==='undefined')?'no cargada':'CARGADA DE MAS';
  R.B3_sinTipo_aviso = (document.getElementById('tga-3d-aviso')||{}).textContent||'';
  R.B4_sinTipo_ctrl = getComputedStyle(document.getElementById('tga-3d-ctrl')).display;

  /* (C) con d-TGA: carga la libreria y dibuja */
  S('tga_tipo','dtga');
  const ok = await esperar(()=>!!cvs(), 20000);
  R.C1_cargo = ok?'si':'NO CARGO';
  R.C2_three = (typeof window.THREE!=='undefined')?('r'+(window.THREE.REVISION||'?')):'NO';
  R.C3_canvas = dim();
  R.C4_ctrl = getComputedStyle(document.getElementById('tga-3d-ctrl')).display;
  R.C5_scriptSRI = (function(){const t=document.querySelector('script[src*="three.min.js"]');
    return t?('integrity='+(t.integrity?'si':'NO')+' crossorigin='+(t.crossOrigin||'NO')):'NO HAY SCRIPT'})();
  await new Promise(r=>setTimeout(r,400));

  /* (D) LOS ESCENARIOS: para cada uno, cuantos objetos dibuja la escena y sus rotulos */
  const ESC = (anat,cir,sh)=>{const e=tga3dEscena(anat,cir,sh||{asd:false,vsd:false,pda:false});
    return 'ar='+e.ar.length+' fl='+e.fl.length+' ex='+e.ex.length+' lb='+e.lb.map(x=>x[0]).join('/')};
  R.D1_norm      = ESC('norm','');
  R.D2_dtgaNone  = ESC('dtga','');
  R.D3_dtgaMus   = ESC('dtga','auricular');
  R.D4_ltga      = ESC('ltga','');
  R.D5_dtgaAsd   = ESC('dtga','',{asd:true,vsd:false,pda:false});
  R.D6_dtgaVsd   = ESC('dtga','',{asd:false,vsd:true,pda:false});
  R.D7_dtgaPda   = ESC('dtga','',{asd:false,vsd:false,pda:true});
  R.D8_dtgaTres  = ESC('dtga','',{asd:true,vsd:true,pda:true});
  /* control negativo: con L-TGA la cirugia NO cambia la escena (regla de la demo) */
  R.D9_ltgaConCir= (ESC('ltga','auricular')===ESC('ltga',''))?'identica (correcto)':'DIFIERE';

  /* (E) las COMUNICACIONES se leen de sus pestanas, no de campos nuevos */
  const CM=()=>{const c=tga3dComs();return (c.asd?'A':'-')+(c.vsd?'V':'-')+(c.pda?'P':'-')};
  R.E0_nada = CM();
  S('ete_cia_tipo','secundum'); R.E1_cia = CM();
  S('ete_cia_tipo',''); S('fop_tunel','si'); R.E2_fop = CM();
  S('fop_tunel',''); S('ete_civ_tam','8'); R.E3_civ = CM();
  S('ete_civ_tam',''); S('tga_civ_residual','si'); R.E4_civResid = CM();
  S('tga_civ_residual',''); S('dap_diam','4'); R.E5_dap = CM();
  S('ete_cia_tipo','secundum'); S('ete_civ_tam','8'); R.E6_tres = CM();

  /* (F) rotulos vivos y la linea de estado */
  S('tga_tipo','dtga'); S('tga_cirugia','');
  await new Promise(r=>setTimeout(r,500));
  R.F1_rotulos = lbls();
  R.F2_estado = (document.getElementById('tga-3d-estado')||{}).textContent||'';
  S('tga_cirugia','auricular'); await new Promise(r=>setTimeout(r,500));
  R.F3_estadoAur = (document.getElementById('tga-3d-estado')||{}).textContent||'';
  R.F4_rotulosAur = lbls();
  S('tga_tipo','mustard'); await new Promise(r=>setTimeout(r,500));
  R.F5_estadoMus = (document.getElementById('tga-3d-estado')||{}).textContent||'';
  S('tga_tipo','cctga'); await new Promise(r=>setTimeout(r,500));
  R.F6_estadoCc = (document.getElementById('tga-3d-estado')||{}).textContent||'';
  R.F7_rotulosCc = lbls();

  /* (G) la VISTA DE REFERENCIA: boton, no dato */
  S('tga_tipo',''); await new Promise(r=>setTimeout(r,350));
  R.G1_sinTipoCanvas = cvs()?'hay canvas':'sin canvas';
  tga3dNormToggle(); await new Promise(r=>setTimeout(r,600));
  R.G2_refOn = (document.getElementById('tga-3d-norm')||{}).getAttribute('aria-pressed');
  R.G3_refEstado = (document.getElementById('tga-3d-estado')||{}).textContent||'';
  R.G4_refRotulos = lbls();
  R.G5_refNoEscribe = String(document.getElementById('tga_tipo').value)===''?'no escribio':'ESCRIBIO';
  R.G6_pdfBloqueado = document.getElementById('tga-3d-pdf').disabled?'bloqueado':'NO BLOQUEADO';
  tga3dNormToggle(); await new Promise(r=>setTimeout(r,300));
  R.G7_refOff = (document.getElementById('tga-3d-norm')||{}).getAttribute('aria-pressed');

  /* (H) INCLUIR EN EL PDF: la funcion comun, UNA sola copia, y el interruptor */
  S('tga_tipo','dtga'); S('tga_cirugia','ninguna'); S('ete_cia_tipo','secundum');
  await new Promise(r=>setTimeout(r,600));
  if(typeof imgSlots!=='undefined'){ imgSlots.length=0; if(typeof imgEnsureLen==='function') imgEnsureLen(); }
  R.H0_slots = (typeof imgSlots!=='undefined')?imgSlots.filter(Boolean).length:'NO HAY';
  const r1 = await tga3dIncluirPDF();
  R.H1_ok = JSON.stringify(r1);
  R.H2_slots = imgSlots.filter(Boolean).length;
  const sl = imgSlots.filter(Boolean)[0]||{};
  R.H3_marca = (sl.esquema?'esquema ':'')+(sl.esqClave||'SIN CLAVE')+' len='+String(sl.dataURL||'').length;
  R.H4_noBlanco = String(sl.dataURL||'').length>3000?'tiene pixeles':'IMAGEN SOSPECHOSAMENTE CHICA';
  R.H5_btn = (document.getElementById('tga-3d-pdf')||{}).textContent;
  await tga3dIncluirPDF();   /* dos veces: tiene que QUITARLO */
  R.H6_trasSegundo = imgSlots.filter(Boolean).length;
  R.H7_btn2 = (document.getElementById('tga-3d-pdf')||{}).textContent;
  await tga3dIncluirPDF();
  R.H8_unaSolaCopia = imgSlots.filter(s=>s&&s.esqClave==='tga3d').length;

  /* (I) la LINEA del papel: solo lo cargado, y sin dato no hay linea */
  R.I1_linea = tga3dLineaPDF();
  S('tga_tipo',''); R.I2_sinTipo = JSON.stringify(tga3dLineaPDF());
  S('tga_tipo','mustard'); R.I3_mustard = tga3dLineaPDF();
  S('tga_tipo','cctga'); S('ete_cia_tipo',''); R.I4_cctga = tga3dLineaPDF();
  /* (J) el registro del motor de tercios */
  R.J1_reg = PDF_DIAG_REG.map(d=>d.k+':'+d.fam+':'+d.w).join(' ');
  R.J2_ccDobleHoja = (function(){ const pk=pdfDiagPack(['contr','tga3d','cia'],[]);
    return 'hojas='+pk.hojas.length+' '+pk.hojas.map(h=>h.map(i=>i.ids.join('+')).join(' | ')).join(' // ')})();
  /* (K) los controles NO son campos del estudio */
  R.K1_prefijo = ['tga-3d-ins','tga-3d-nom','tga-3d-fc'].map(i=>i+'='+(_noEsDelEstudio(i)?'fuera':'ADENTRO')).join(' ');
  return R;
})()`;

const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage();
const errs=[]; pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1200);
let R;
try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,500)} }
console.log('ARCHIVO '+FILE);
Object.keys(R).forEach(k=>console.log('  '+k+' = '+String(R[k]).replace(/\n/g,' / ').slice(0,210)));
console.log('  ERRORES_CONSOLA = '+errs.length+(errs.length?(' :: '+errs.slice(0,4).join(' | ').slice(0,400)):''));
await b.close();
