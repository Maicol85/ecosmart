#!/usr/bin/env node
/** _probe_pant18inv.mjs — PANT-18 commit 1d: reproducir las premisas del medico
 *  con el GESTO REAL. Mide: el color del boton de severidad, el informe en los
 *  tres estilos y el EN SUMA, la nota del AT, el cuadro de resultados, los tres
 *  tramos del AT, la existencia de la fila AT/ET, y TAVI. */
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
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE '+id;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'};
  /* el informe y el EN SUMA son <textarea>: con textContent el denominador sale VACIO y un cero
     se lee como «la app no emite». Vale para los dos tipos de nodo. */
  const T=id=>{const e=document.getElementById(id);return e?String((e.value||e.textContent||'')).replace(/\\s+/g,' ').trim():'NO EXISTE'};
  const V=id=>{const e=document.getElementById(id);return e?String(e.value||''):'NO EXISTE'};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));

  const escena=async (morf)=>{
    try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
    S('nombre','Prueba P18'); S('ci','18181818');
    S('peso','70'); S('talla','170');
    S('va_morf',morf);
    S('vmax_ao','5'); S('ea_dtsvi','21'); S('ea_vtitsvi','10'); S('ea_vtiao','45');
    S('va_at','101');
    try{ if(typeof calcAo==='function') calcAo() }catch(e){}
    try{ if(typeof calcEADetalle==='function') calcEADetalle() }catch(e){}
    try{ if(typeof valvProtSync==='function') valvProtSync() }catch(e){}
    /* LA PASTILLA DE LA LESION TIENE QUE ESTAR ABIERTA o el informe no describe la aortica:
       es la trampa del denominador que este repositorio documenta. */
    try{ if(window.esqPills&&esqPills.setLevel) esqPills.setLevel('aortica','esten',4) }catch(e){}
    await esperar(350);
    const btn=document.getElementById('sevbtn-esten-aortica');
    const cs=btn?getComputedStyle(btn):null;
    const P=(typeof eaProtVeredicto==='function')?eaProtVeredicto():null;
    const N=(P&&typeof eaProtNarrativa==='function')?eaProtNarrativa(P):null;
    const inf={};
    ['estandar','narrativo','conciso'].forEach(st=>{
      try{ if(typeof setEstiloInforme==='function') setEstiloInforme(st) }catch(e){}
      try{ if(typeof generarInforme==='function') generarInforme() }catch(e){}
      const it=T('informe_texto'), su=T('en_suma');
      inf['inf_'+st]= (it.match(/[^.]*esajuste[^.]*\\./)||['(sin desajuste)'])[0].trim();
      inf['sum_'+st]= (su.match(/[^.]*PPM[^.]*\\.?/)||['(sin PPM)'])[0].trim();
      inf['n_desaj_'+st]= it.split('esajuste').length-1;
      inf['n_ppm_'+st]= su.split('PPM').length-1;
      inf['prot_'+st]= (it.match(/[^.]*estenosis prot[^.]*\\./)||['(sin frase prot)'])[0].trim().slice(0,150);
      inf['LARGO_'+st]= it.length;   /* DENOMINADOR: un cero sobre 0 caracteres no prueba nada */
    });
    try{ if(typeof setEstiloInforme==='function') setEstiloInforme('estandar') }catch(e){}
    try{ if(typeof generarInforme==='function') generarInforme() }catch(e){}
    return {
      morf: V('va_morf'),
      sevCard: T('ea-det-sev'),
      sevLbl: T('ea-det-sev-lbl'),
      sevNota: T('ea-det-sev-nota'),
      sevNotaLargo: T('ea-det-sev-nota').length,
      sevNotaParrafos: (function(){const e=document.getElementById('ea-det-sev-nota');
        return e? (e.innerHTML.split('<br>').length) : 0})(),
      btnTxt: btn?String(btn.textContent||'').replace(/\\s+/g,' ').trim():'NO EXISTE',
      btnBg: cs?cs.backgroundColor:'-', btnColor: cs?cs.color:'-', btnBorde: cs?cs.borderColor:'-',
      btnClases: btn?btn.className:'-',
      eaGrado: V('ea_grado'),
      filaAT: T('ea-det-at'),
      notaAT: T('ea-det-at-nota'),
      filaATET: (document.getElementById('ea-det-atet')?T('ea-det-atet'):'NO EXISTE LA FILA'),
      dvi: T('ea-det-dvi'), avai: T('ea-det-avai'), ppm: T('ea-prot-ppm'),
      campoET: (document.getElementById('tango_te')?('existe tango_te, valor='+V('tango_te')):'NO EXISTE'),
      veredicto: P?JSON.stringify({via:P.via,nivel:P.nivel,atet:P.atet,at:P.at,ppm:P.ppm,niveles:P.niveles}):'NULL',
      narrFrase: N?String(N.frase).slice(0,160):'NULL',
      narrResumen: N?String(N.resumen):'NULL',
      narrSalv: N?N.salvedades.length:0,
      inf: inf
    };
  };

  R.A_mecanica = await escena('Prótesis mecánica');
  R.B_biologica= await escena('Prótesis biológica');
  R.C_tavi     = await escena('TAVI');
  /* control negativo: valvula NATIVA, la tanda no puede tocarla */
  R.D_nativa   = await escena('Trivalva normal');
  /* los tres tramos del AT, con el gesto real sobre una mecanica */
  const tramos={};
  for (const at of ['60','80','90','100','101','130']){
    try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
    S('nombre','T'); S('ci','1'); S('va_morf','Prótesis mecánica'); S('va_at',at);
    try{ if(typeof valvProtSync==='function') valvProtSync() }catch(e){}
    await esperar(80);
    tramos['AT_'+at]=T('ea-det-at');
  }
  R.E_tramosAT=tramos;
  /* opciones de va_morf, para saber el vocabulario exacto */
  R.F_morfOpciones = (function(){const s=document.getElementById('va_morf');
    return s?Array.from(s.options).map(o=>o.value).join(' | '):'NO EXISTE'})();
  return R;
})()`;

const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+FILE,{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1500);
let R; try{ R=await pg.evaluate(CUERPO) }catch(e){ R={FATAL:String(e).slice(0,600)} }
console.log('ARCHIVO '+FILE);
console.log(JSON.stringify(R,null,1));
console.log('ERRORES DE PAGINA = '+errs.length+(errs.length?(' :: '+errs.slice(0,3).join(' | ')):''));
await b.close();
