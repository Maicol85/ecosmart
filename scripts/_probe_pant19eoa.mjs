#!/usr/bin/env node
/** _probe_pant19eoa.mjs - PANT-19 commit 5: la tabla de combinaciones de la EOA frente a la del
 *  modelo, con el informe y el EN SUMA de verdad. Nombre propio: verificado con ls. */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw;
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');

const CUERPO = `(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
  const T=id=>{const e=document.getElementById(id);return e?String((e.value||e.textContent||'')).replace(/\\s+/g,' ').trim():''};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  const R={};
  /* ESCENA: morfologia, modelo, tamano, lo que fija el eje dependiente del flujo, y el VTI Ao
     que mueve la AVA por continuidad (y con ella la z y el DVI). */
  const escena=async(o)=>{
    try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
    try{ if(typeof showTab==='function') showTab('valvulas') }catch(e){}
    const d=document.getElementById('ete-seccion-valv-aortica');
    for(let i=0;i<3 && d && getComputedStyle(d).display==='none';i++){try{toggleEteSeccion('valv-aortica')}catch(e){}}
    S('nombre','EOA'); S('ci','19'); S('peso','75'); S('talla','175');
    S('va_morf', o.morf);
    if(o.mod!==undefined) S('va_prot_modelo', o.mod);
    if(o.tam!==undefined) S('va_prot_tam', o.tam);
    if(o.gmref!==undefined) S('va_prot_gmref', o.gmref);
    if(o.eoaref!==undefined) S('va_prot_eoaref', o.eoaref);
    S('ea_dtsvi', o.dtsvi||'21'); S('ea_vtitsvi', o.vtiTsvi||'18'); S('ea_vtiao', o.vtiAo);
    S('vmax_ao', o.vmax); S('gmedio_ao', o.gmed);
    try{ calcAo() }catch(e){} try{ calcEADetalle() }catch(e){} try{ vModSync('va') }catch(e){}
    /* la pastilla ABIERTA o el informe no describe la aortica */
    try{ if(window.esqPills&&esqPills.setLevel) esqPills.setLevel('aortica','esten',4) }catch(e){}
    await esperar(360);
    const V=(typeof eaProtVeredicto==='function')?eaProtVeredicto():null;
    const N=(V&&typeof eaProtNarrativa==='function')?eaProtNarrativa(V):null;
    try{ if(typeof setEstiloInforme==='function') setEstiloInforme('estandar') }catch(e){}
    try{ if(typeof generarInforme==='function') generarInforme() }catch(e){}
    const inf=T('informe_texto'), suma=T('en_suma');
    return { ava:T('ava_cont'), dvi:V?V.dvi:null,
             nvVmax:V?V.niveles.vmax:null, nvGmed:V?V.niveles.gmed:null,
             nvDvi:V?V.niveles.dvi:null, nvEoa:V?(V.niveles.eoa||null):null,
             z:(V&&V.eoaZ)?V.eoaZ.z:null, pDep:V?V.pDep:null, pIndep:V?V.pIndep:null,
             nivel:V?V.nivel:null, tarjeta:T('ea-det-sev'),
             frase:N?N.frase:null, resumen:N?N.resumen:null,
             infLargo:inf.length, sumaLargo:suma.length,
             infProt:(inf.match(/[^.]*estenosis prot[^.]*\\./)||[''])[0].trim(),
             sumaProt:(suma.match(/[^.]*estenosis prot[^.]*\\.?/)||[''])[0].trim() };
  };
  const MEC={morf:'Prótesis mecánica', mod:'St. Jude Medical Standard', tam:'23'};
  const SIN={morf:'Prótesis mecánica'};
  const TAVI={morf:'TAVI', mod:'SAPIEN 3', tam:'All'};
  const MAN={morf:'Prótesis mecánica', mod:'Marca equis', tam:'21', gmref:'14', eoaref:'1.3'};
  /* la z se mueve con el VTI Ao: a mas VTI, menos AVA por continuidad */
  const Z={normal:'45', posible:'60', signif:'95'};
  /* el eje dependiente del flujo: normal / posible / significativo */
  const DEP={normal:{vmax:'2.5', gmed:'15'}, posible:{vmax:'3.2', gmed:'22'}, signif:{vmax:'4.5', gmed:'38'}};
  const out={};
  for (const zk of ['normal','posible','signif'])
    for (const dk of ['normal','posible','signif']){
      out['MOD_z'+zk+'_dep'+dk] = await escena(Object.assign({}, MEC, DEP[dk], {vtiAo:Z[zk]}));
      out['SIN_z'+zk+'_dep'+dk] = await escena(Object.assign({}, SIN, DEP[dk], {vtiAo:Z[zk]}));
    }
  /* controles: TAVI y modo manual NO entran en la regla */
  out.TAVI_zsignif = await escena(Object.assign({}, TAVI, DEP.signif, {vtiAo:Z.signif}));
  out.TAVI_sinMod  = await escena(Object.assign({}, {morf:'TAVI'}, DEP.signif, {vtiAo:Z.signif}));
  out.MAN_zsignif  = await escena(Object.assign({}, MAN, DEP.signif, {vtiAo:Z.signif}));
  out.MAN_sinMod   = await escena(Object.assign({}, SIN, DEP.signif, {vtiAo:Z.signif}));
  /* ══ LAS ESCENAS DONDE LA EOA APORTA ALGO QUE EL DVI NO ═══════════════════════════
     Con el TSVI de 21 mm los dos ejes se mueven JUNTOS: el DVI es el cociente de los dos VTI y
     la AVA es ese mismo cociente por el area del TSVI, asi que bajar el VTI aortico los baja a
     los dos y la EOA nunca dice nada que el DVI no diga. Lo que los separa es el DIAMETRO del
     TSVI: con uno chico el cociente —y con el el DVI— se queda normal mientras el area cae muy
     por debajo de la del modelo. Es la unica familia de escenas donde el commit 5 cambia el
     resultado de la tarjeta, y por lo tanto el papel. */
  const CHICO={vtiTsvi:'18', vtiAo:'45'};   /* DVI 0,40: normal */
  out.TSVI16_MOD = await escena(Object.assign({}, MEC, DEP.signif, CHICO, {dtsvi:'16'}));
  out.TSVI16_SIN = await escena(Object.assign({}, SIN, DEP.signif, CHICO, {dtsvi:'16'}));
  out.TSVI16_MOD_depNormal = await escena(Object.assign({}, MEC, DEP.normal, CHICO, {dtsvi:'16'}));
  out.TSVI16_TAVI = await escena(Object.assign({}, TAVI, DEP.signif, CHICO, {dtsvi:'16'}));
  out.TSVI16_MAN  = await escena(Object.assign({}, MAN, DEP.signif, CHICO, {dtsvi:'16'}));
  /* un modelo cuya EOA esta impresa SIN desvio: tampoco entra */
  out.SINSD_zsignif= await escena({morf:'Prótesis mecánica', mod:'Edwards Mira', tam:'25',
                                   vmax:'4.5', gmed:'38', vtiAo:Z.signif});
  R.tabla=out;
  return R;
})()`;

const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1500);
let R; try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,900)} }
console.log('ARCHIVO '+FILE);
console.log(JSON.stringify(R,null,1));
console.log('ERRORES DE PAGINA = '+errs.length);
await b.close();
