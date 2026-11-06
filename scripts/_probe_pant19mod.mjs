#!/usr/bin/env node
/** _probe_pant19mod.mjs - PANT-19 commit 4: el componente «Modelo y tamano» en la valvula
 *  AORTICA, medido con el GESTO REAL (la pestana Valvulas y el acordeon abiertos por su boton).
 *  Nombre propio: verificado con ls, no existia. */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw;
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');

const PRE = `
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE '+id;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'};
  const T=id=>{const e=document.getElementById(id);return e?String((e.value||e.textContent||'')).replace(/\\s+/g,' ').trim():'NO EXISTE'};
  const V=id=>{const e=document.getElementById(id);return e?String(e.value||''):'NO EXISTE'};
  const C=id=>{const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();
    return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)}};
  const VIS=id=>{const e=document.getElementById(id);return !!e && getComputedStyle(e).display!=='none'};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  const abrirSec=k=>{const d=document.getElementById('ete-seccion-'+k);if(!d)return 'NO EXISTE';
    for(let i=0;i<3 && getComputedStyle(d).display==='none';i++){try{toggleEteSeccion(k)}catch(e){return 'ERR'}}
    return getComputedStyle(d).display;};
  const base=async(morf)=>{
    try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
    try{ if(typeof showTab==='function') showTab('valvulas') }catch(e){}
    abrirSec('valv-aortica');
    S('nombre','P19'); S('ci','19'); S('peso','75'); S('talla','175');
    if(morf) S('va_morf',morf);
    await esperar(320); return true;
  };
  const clic=id=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE '+id;e.click();return 'ok'};
  const escribir=(id,txt)=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE '+id;
    e.value=txt;e.dispatchEvent(new Event('input',{bubbles:true}));return 'ok'};
  const sugTxt=()=>{const u=document.getElementById('vmod-sug');
    if(!u||u.hidden) return [];return Array.from(u.querySelectorAll('button')).map(b=>b.textContent.trim())};
  const chips=pos=>{const c=document.getElementById('vmod-'+pos+'-chips');
    return c?Array.from(c.querySelectorAll('.vmod-chip')).map(x=>x.textContent.replace(/\\s+/g,' ').trim()):[]};
`;

const CUERPO = `(async () => {
  const R={};
  ${PRE}
  /* A - el boton solo con protesis, y su alto */
  const A={};
  for (const m of ['Trivalva normal','Prótesis mecánica','Prótesis biológica','TAVI','Calcificada']){
    await base(m);
    A[m]={visible:VIS('vmod-va-wrap'), caja:C('vmod-va-btn'), txt:T('vmod-va-btn')};
  }
  R.A_boton=A;
  /* B - sugerencias por palabra */
  await base('Prótesis biológica');
  clic('vmod-va-btn'); await esperar(150);
  const B={cardAbierta:VIS('vmod-card'), sugAlAbrir:sugTxt().length};
  escribir('vmod-inp','han'); await esperar(60); B.han=sugTxt();
  escribir('vmod-inp','mosa'); await esperar(60); B.mosa=sugTxt();
  escribir('vmod-inp','shiley'); await esperar(60); B.shiley=sugTxt();
  escribir('vmod-inp','zzz'); await esperar(60); B.zzz=sugTxt();
  /* la lista NO puede tapar «ver todos» */
  escribir('vmod-inp','a'); await esperar(60);
  const ul=document.getElementById('vmod-sug'), bt=document.getElementById('vmod-btodos');
  if(ul&&bt&&!ul.hidden){const ru=ul.getBoundingClientRect(), rb=bt.getBoundingClientRect();
    B.tapaVerTodos = !(ru.bottom<=rb.top+1 || ru.top>=rb.bottom-1);
    B.sugN=sugTxt().length;}
  else B.tapaVerTodos='SIN LISTA';
  R.B_sug=B;
  /* C - elegir por sugerencia y ver los esperados */
  escribir('vmod-inp','trifecta'); await esperar(60);
  const b1=document.querySelector('#vmod-sug button'); if(b1) b1.click();
  await esperar(80);
  const C1={modelo:V('vmod-inp'), tamOps:Array.from((document.getElementById('vmod-tam')||{options:[]}).options).map(o=>o.value)};
  S('vmod-tam','23'); const st=document.getElementById('vmod-tam');
  if(st){st.value='23';st.dispatchEvent(new Event('change',{bubbles:true}));}
  await esperar(80);
  C1.exp=T('vmod-exp'); C1.elegirHab=!(document.getElementById('vmod-elegir')||{}).disabled;
  clic('vmod-elegir'); await esperar(250);
  C1.btn=T('vmod-va-btn'); C1.chips=chips('va'); C1.sub=T('vmod-va-sub');
  C1.campos={m:V('va_prot_modelo'),t:V('va_prot_tam'),g:V('va_prot_gmref'),e:V('va_prot_eoaref')};
  C1.cardCerrada=!VIS('vmod-card');
  R.C_elegir=C1;
  /* D - los valores esperados de cinco modelos, contra la tabla de datos */
  const D=[];
  for (const [mo,nom,tam] of [['Prótesis biológica','Abbott Trifecta','23'],
                              ['Prótesis mecánica','St. Jude Medical Standard','23'],
                              ['Prótesis mecánica','Medtronic-Hall','20'],
                              ['Prótesis mecánica','Edwards Mira','25'],
                              ['TAVI','SAPIEN 3','All']]){
    await base(mo);
    S('va_prot_modelo',nom); S('va_prot_tam',tam);
    try{ vModSync('va') }catch(e){}
    await esperar(120);
    const E=(typeof vModEsperados==='function')?vModEsperados('va'):null;
    D.push({mo:mo,nom:nom,tam:tam,chips:chips('va'),vals:E?E.vals:null,folio:E?E.folio:null});
  }
  R.D_esperados=D;
  /* E - la indexada predicha con los dos cortes de IMC, y sin peso ni talla */
  const E={};
  await base('Prótesis biológica'); S('va_prot_modelo','Abbott Trifecta'); S('va_prot_tam','23');
  S('peso','75'); S('talla','175'); try{vModSync('va')}catch(e){} await esperar(120);
  E.imcBajo={idx:(typeof vModIndexada==='function')?vModIndexada('va',1.6):null, chips:chips('va')};
  S('peso','105'); S('talla','170'); try{vModSync('va')}catch(e){} await esperar(120);
  E.imcAlto={idx:(typeof vModIndexada==='function')?vModIndexada('va',1.6):null, chips:chips('va')};
  S('peso',''); S('talla',''); try{vModSync('va')}catch(e){} await esperar(120);
  E.sinPeso={idx:(typeof vModIndexada==='function')?vModIndexada('va',1.6):null, chips:chips('va')};
  R.E_indexada=E;
  /* F - lo medido con su diferencia en DE */
  await base('Prótesis mecánica');
  S('va_prot_modelo','St. Jude Medical Standard'); S('va_prot_tam','23');
  S('gmedio_ao','24.5'); S('ea_dtsvi','21'); S('ea_vtitsvi','18'); S('ea_vtiao','60');
  try{ calcAo() }catch(e){} try{ vModSync('va') }catch(e){}
  await esperar(300);
  R.F_medido={med:T('vmod-va-med'), ava:V('ava_cont'), gm:V('gmedio_ao')};
  S('gmedio_ao','6'); try{ vModSync('va') }catch(e){} await esperar(200);
  R.F_medido.bajo=T('vmod-va-med');
  /* G - ocultar y mostrar */
  const bo=document.querySelector('#vmod-va-sub .vmod-mini'); if(bo) bo.click();
  await esperar(120);
  R.G_ver={traSOcultar:T('vmod-va-chips'), subVis:VIS('vmod-va-sub')};
  const bm=document.querySelector('#vmod-va-chips button'); if(bm) bm.click();
  await esperar(120);
  R.G_ver.traMostrar=chips('va').length;
  /* H - modo manual */
  await base('Prótesis mecánica');
  clic('vmod-va-btn'); await esperar(150);
  clic('vmod-bmanual'); await esperar(80);
  escribir('vmod-mnom','Marca equis'); escribir('vmod-mtam','21');
  escribir('vmod-mgm','14'); escribir('vmod-meoa','1.3');
  await esperar(100);
  const H={hab:!(document.getElementById('vmod-elegir')||{}).disabled, exp:T('vmod-exp')};
  clic('vmod-elegir'); await esperar(250);
  H.btn=T('vmod-va-btn'); H.chips=chips('va'); H.sub=T('vmod-va-sub');
  H.campos={m:V('va_prot_modelo'),t:V('va_prot_tam'),g:V('va_prot_gmref'),e:V('va_prot_eoaref')};
  R.H_manual=H;
  /* I - TAVI: «All» y un valve-in-valve */
  await base('TAVI');
  clic('vmod-va-btn'); await esperar(150);
  escribir('vmod-inp','sapien 3'); await esperar(80);
  const bi=document.querySelector('#vmod-sug button'); if(bi) bi.click(); await esperar(80);
  const I={ops:Array.from((document.getElementById('vmod-tam')||{options:[]}).options).map(o=>o.value)};
  const si=document.getElementById('vmod-tam'); if(si){si.value='All';si.dispatchEvent(new Event('change',{bubbles:true}));}
  await esperar(100); clic('vmod-elegir'); await esperar(250);
  I.all={btn:T('vmod-va-btn'), chips:chips('va')};
  clic('vmod-va-btn'); await esperar(150);
  escribir('vmod-inp','valve-in-valve'); await esperar(80);
  I.sugViv=sugTxt();
  const bv=document.querySelector('#vmod-sug button'); if(bv) bv.click(); await esperar(100);
  I.vivTamAuto=V('vmod-tam'); I.vivHab=!(document.getElementById('vmod-elegir')||{}).disabled;
  clic('vmod-elegir'); await esperar(250);
  I.viv={btn:T('vmod-va-btn'), chips:chips('va')};
  R.I_tavi=I;
  /* J - cambiar la morfologia a un tipo incompatible limpia el modelo */
  const J={};
  await base('Prótesis mecánica'); S('va_prot_modelo','St. Jude Medical Standard'); S('va_prot_tam','23');
  try{vModSync('va')}catch(e){} await esperar(100);
  J.antes=V('va_prot_modelo');
  S('va_morf','Prótesis biológica'); await esperar(200);
  J.traBiologica=V('va_prot_modelo');
  /* un modelo SIN TIPO sobrevive a las dos */
  await base('Prótesis mecánica'); S('va_prot_modelo','Abbott Epic'); S('va_prot_tam','23');
  try{vModSync('va')}catch(e){} await esperar(100);
  S('va_morf','Prótesis biológica'); await esperar(200);
  J.sinTipoTraBio=V('va_prot_modelo');
  S('va_morf','Trivalva normal'); await esperar(200);
  J.traNativa=V('va_prot_modelo'); J.wrapNativa=VIS('vmod-va-wrap');
  R.J_morf=J;
  /* K - guardar, restaurar, Nuevo estudio y Excel */
  const K={};
  /* Medtronic Mosaic es «Stented porcine»: BIOLOGICA. Con una mecanica el catalogo no lo
     ofrece y la fila queda vacia, que es lo correcto y lo que verifica el bloque J. */
  await base('Prótesis biológica'); S('va_prot_modelo','Medtronic Mosaic'); S('va_prot_tam','25');
  try{vModSync('va')}catch(e){} await esperar(150);
  const campos={}; document.querySelectorAll('input[id],select[id],textarea[id]').forEach(e=>{
    if(typeof _noEsDelEstudio==='function' && _noEsDelEstudio(e.id)) return;
    if(e.type==='checkbox'||e.type==='radio') return;
    campos[e.id]=e.value;});
  K.guardados={m:campos['va_prot_modelo'],t:campos['va_prot_tam'],g:campos['va_prot_gmref']};
  K.censo=Object.keys(campos).length;
  /* _labExcelRow recibe el INFORME y lee inf.campos: pasarle los campos pelados devuelve
     la fila entera vacia, que se lee igual que «la columna no trae el dato». */
  try{ const row=_labExcelRow({campos:campos}); K.excel=Object.keys(row).length;
       K.excelVals={mo:row['Modelo de prótesis aórtica'], ta:row['Tamaño de prótesis aórtica'],
                    nat:_labExcelRow({campos:Object.assign({},campos,{va_morf:'Trivalva normal'})})['Modelo de prótesis aórtica']}; }catch(e){K.excelErr=String(e).slice(0,160)}
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  await esperar(250);
  K.traNuevo={m:V('va_prot_modelo'),t:V('va_prot_tam'),g:V('va_prot_gmref'),e:V('va_prot_eoaref'),
              btn:T('vmod-va-btn'), card:VIS('vmod-card')};
  /* restaurar por la via MUDA: asignar .value y correr el embudo */
  S('va_morf','Prótesis biológica');
  ['va_prot_modelo','va_prot_tam'].forEach((id,i)=>{const e=document.getElementById(id);
    if(e) e.value=(i===0?'Medtronic Mosaic':'25');});
  try{ if(typeof _recalcModulos==='function') _recalcModulos(); }catch(e){}
  await esperar(300);
  K.traRestaurar={btn:T('vmod-va-btn'), chips:chips('va').length};
  R.K_campos=K;
  /* L - teclado: Escape cierra y devuelve el foco */
  await base('Prótesis mecánica');
  clic('vmod-va-btn'); await esperar(150);
  const L={abierta:VIS('vmod-card')};
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  await esperar(120);
  L.cerrada=!VIS('vmod-card'); L.foco=(document.activeElement||{}).id;
  R.L_teclado=L;
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
console.log('ERRORES DE PAGINA = '+errs.length+(errs.length?(' :: '+errs.slice(0,3).join(' | ')):''));
await b.close();
