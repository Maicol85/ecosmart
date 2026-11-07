#!/usr/bin/env node
/** _probe_pant20mod.mjs - PANT-20: el componente «Modelo y tamano» en la MITRAL, la TRICUSPIDE
 *  y la PULMONAR, con el GESTO REAL (pestana y acordeon abiertos por su boton).
 *  Nombre propio: verificado con ls, no existia. */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium}=_pw;
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const POS=arg('--pos')||'vm';
const SEC={vm:'valv-mitral',vt:'valv-tricuspide',vp:'valv-pulmonar'}[POS];
const MORF={vm:'vm_morf',vt:'vt_morf',vp:'vp_morf'}[POS];

const CUERPO=`(async () => {
  const R={}; const POS=${JSON.stringify(POS)}, SEC=${JSON.stringify(SEC)}, MORF=${JSON.stringify(MORF)};
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE '+id;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'};
  const T=id=>{const e=document.getElementById(id);return e?String((e.value||e.textContent||'')).replace(/\\s+/g,' ').trim():'NO EXISTE'};
  const V=id=>{const e=document.getElementById(id);return e?String(e.value||''):'NO EXISTE'};
  const C=id=>{const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();
    return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)}};
  const VIS=id=>{const e=document.getElementById(id);return !!e && getComputedStyle(e).display!=='none'};
  const clic=id=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE '+id;e.click();return 'ok'};
  const escribir=(id,txt)=>{const e=document.getElementById(id);if(!e)return 'NO EXISTE '+id;
    e.value=txt;e.dispatchEvent(new Event('input',{bubbles:true}));return 'ok'};
  const abrirSec=k=>{const d=document.getElementById('ete-seccion-'+k);if(!d)return 'NO EXISTE';
    for(let i=0;i<3 && getComputedStyle(d).display==='none';i++){try{toggleEteSeccion(k)}catch(e){return 'ERR'}}
    return getComputedStyle(d).display;};
  const base=async(morf,peso,talla)=>{
    try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
    try{ if(typeof showTab==='function') showTab('valvulas') }catch(e){}
    abrirSec(SEC);
    S('nombre','P20'); S('ci','20');
    if(peso!==null) S('peso',peso===undefined?'75':peso);
    if(talla!==null) S('talla',talla===undefined?'175':talla);
    if(morf) S(MORF,morf);
    await esperar(340); return true;
  };
  const sugTxt=()=>{const u=document.getElementById('vmod-sug');
    if(!u||u.hidden) return [];return Array.from(u.querySelectorAll('button')).map(b=>b.textContent.trim())};
  const chips=()=>{const c=document.getElementById('vmod-'+POS+'-chips');
    return c?Array.from(c.querySelectorAll('.vmod-chip')).map(x=>x.textContent.replace(/\\s+/g,' ').trim()):[]};
  const meds=()=>{const c=document.getElementById('vmod-'+POS+'-med');
    return c?Array.from(c.querySelectorAll('.vmod-chip')).map(x=>x.textContent.replace(/\\s+/g,' ').trim()):[]};
  const sub=()=>T('vmod-'+POS+'-sub');

  /* A - el boton solo con protesis */
  const A={};
  for (const m of ['Normal','Prótesis mecánica','Prótesis biológica','Reumática']){
    const r=await base(m);
    A[m]={visible:VIS('vmod-'+POS+'-wrap'), caja:C('vmod-'+POS+'-btn'), txt:T('vmod-'+POS+'-btn')};
  }
  R.A_boton=A;
  /* B - sugerencias por palabra */
  await base('Prótesis mecánica');
  clic('vmod-'+POS+'-btn'); await esperar(170);
  const B={cardAbierta:VIS('vmod-card'), sugAlAbrir:sugTxt().length};
  for (const q of ['han','st','mosa','ifecta','zzz']){ escribir('vmod-inp',q); await esperar(60); B[q]=sugTxt(); }
  R.B_sug=B;
  /* C - elegir por sugerencia y ver todos */
  escribir('vmod-inp','carbo'); await esperar(60);
  const li=document.querySelector('#vmod-sug li button'); if(li) li.click();
  await esperar(60);
  const sel=document.getElementById('vmod-tam');
  R.C_tras_sug={inp:V('vmod-inp'), tams:sel?Array.from(sel.options).map(o=>o.value):'NO', elegirDisabled:(document.getElementById('vmod-elegir')||{}).disabled};
  if(sel){ sel.value=sel.options[1]?sel.options[1].value:''; sel.dispatchEvent(new Event('change',{bubbles:true})); }
  await esperar(60);
  R.C_draft={exp:T('vmod-exp'), elegirDisabled:(document.getElementById('vmod-elegir')||{}).disabled};
  clic('vmod-elegir'); await esperar(200);
  R.C_tras_elegir={btn:T('vmod-'+POS+'-btn'), cardCerrada:!VIS('vmod-card'),
    campos:{modelo:V(POS+'_prot_modelo'),tam:V(POS+'_prot_tam'),gm:V(POS+'_prot_gmref'),eoa:V(POS+'_prot_eoaref')},
    chips:chips(), sub:sub()};
  /* D - «ver todos» */
  clic('vmod-'+POS+'-btn'); await esperar(150);
  clic('vmod-btodos'); await esperar(120);
  const box=document.getElementById('vmod-todos');
  R.D_todos={abierto:box&&!box.hidden, familias:box?Array.from(box.querySelectorAll('h4')).map(h=>h.textContent):[],
             modelos:box?box.querySelectorAll('.vmod-mod').length:0,
             tapaVerTodos:(()=>{const u=document.getElementById('vmod-sug'),b=document.getElementById('vmod-btodos');
                if(!u||u.hidden||!b)return false;const a=u.getBoundingClientRect(),c=b.getBoundingClientRect();
                return !(a.bottom<=c.top||a.top>=c.bottom)})()};
  const bt=box?box.querySelector('.vmod-sz'):null; if(bt) bt.click(); await esperar(80);
  R.D_tras={inp:V('vmod-inp'), tam:V('vmod-tam')};
  clic('vmod-elegir'); await esperar(200);
  R.D_elegido={btn:T('vmod-'+POS+'-btn'), modelo:V(POS+'_prot_modelo'), tam:V(POS+'_prot_tam')};
  /* E - valores esperados contra la tabla */
  const TAB=window[(window.VMOD_TABLA||{})[POS]]||[];
  const cols=window[(window.VMOD_TABLA||{})[POS]+'_COLS']||[];
  const E=[];
  const muestras=TAB.slice(0,5).map(m=>[m.n, m.s[0][0]]);
  for (const [nom,tam] of muestras){
    await base('Prótesis mecánica');
    const mod=TAB.filter(x=>x.n===nom)[0];
    const t2 = (mod && mod.t==='bio') ? 'Prótesis biológica' : 'Prótesis mecánica';
    await base(t2);
    S(POS+'_prot_modelo',nom); S(POS+'_prot_tam',tam);
    try{ vModSync(POS) }catch(e){}
    await esperar(80);
    const esp = (typeof vModEsperados==='function')? vModEsperados(POS):null;
    E.push({nom:nom, tam:tam, chips:chips(),
      esp: esp? {nombre:esp.nombre, tam:esp.tam, vals:esp.vals, folio:esp.folio}:null,
      tabla: mod? mod.s.filter(f=>f[0]===tam)[0]:null, cols:cols});
  }
  R.E_esperados=E;
  /* F - EOA indexada predicha con los dos IMC, y sin peso/talla */
  const F={};
  const conEoa = TAB.filter(m=>m.s.some(f=>{const i=cols.indexOf('eoa'); return i>-1 && f[i+1] && f[i+1][0]!=null}))[0];
  if (conEoa){
    const fila = conEoa.s.filter(f=>{const i=cols.indexOf('eoa'); return f[i+1] && f[i+1][0]!=null})[0];
    const t2=(conEoa.t==='bio')?'Prótesis biológica':'Prótesis mecánica';
    /* IMC bajo: 75 kg / 175 cm = 24,5 ; IMC alto: 100 kg / 170 = 34,6 */
    for (const [k,peso,talla] of [['imcBajo','75','175'],['imcAlto','100','170'],['sinPesoTalla',null,null]]){
      await base(t2, peso, talla);
      if(k==='sinPesoTalla'){ S('peso',''); S('talla',''); }
      S(POS+'_prot_modelo',conEoa.n); S(POS+'_prot_tam',fila[0]);
      try{ vModSync(POS) }catch(e){}
      await esperar(80);
      const idx=(typeof vModIndexada==='function')?vModIndexada(POS, fila[cols.indexOf('eoa')+1][0]):null;
      F[k]={modelo:conEoa.n,tam:fila[0],eoaTabla:fila[cols.indexOf('eoa')+1],idx:idx,chips:chips(),sub:sub()};
    }
  }
  R.F_indexada=F;
  /* G - modo manual */
  await base('Prótesis mecánica');
  clic('vmod-'+POS+'-btn'); await esperar(150);
  clic('vmod-bmanual'); await esperar(100);
  escribir('vmod-mnom','Marca X'); escribir('vmod-mtam','27');
  escribir('vmod-mgm','5.5'); escribir('vmod-meoa','1.8'); await esperar(100);
  R.G_manual_draft={exp:T('vmod-exp'), elegirDisabled:(document.getElementById('vmod-elegir')||{}).disabled};
  clic('vmod-elegir'); await esperar(200);
  R.G_manual={btn:T('vmod-'+POS+'-btn'), campos:{modelo:V(POS+'_prot_modelo'),tam:V(POS+'_prot_tam'),
    gm:V(POS+'_prot_gmref'),eoa:V(POS+'_prot_eoaref')}, chips:chips(), sub:sub(),
    esp:(typeof vModEsperados==='function')?vModEsperados(POS):null};
  /* H - Ocultar y Mostrar */
  const bo=document.querySelector('#vmod-'+POS+'-sub .vmod-mini');
  if(bo) bo.click(); await esperar(100);
  R.H_ocultar={chips:chips(), hayBotonMostrar:!!document.querySelector('#vmod-'+POS+'-chips button')};
  const bm=document.querySelector('#vmod-'+POS+'-chips button'); if(bm) bm.click(); await esperar(100);
  R.H_mostrar={chips:chips().length};
  /* I - lo MEDIDO con el signo de la diferencia */
  const I={};
  const P=(window.VMOD_POS||{})[POS];
  if (P && conEoa){
    const fila = conEoa.s.filter(f=>{const i=cols.indexOf('eoa'); return f[i+1]&&f[i+1][0]!=null})[0];
    const t2=(conEoa.t==='bio')?'Prótesis biológica':'Prótesis mecánica';
    /* buscar una columna con desvio > 0 para probar el signo */
    let kDes=null;
    cols.forEach((c,i)=>{ if(kDes) return; const v=fila[i+1]; if(v&&v[1]!=null&&v[1]>0 && P.medidos.some(m=>m.k===c)) kDes=c; });
    for (const lado of ['arriba','abajo']){
      await base(t2);
      S(POS+'_prot_modelo',conEoa.n); S(POS+'_prot_tam',fila[0]);
      if(kDes){
        const v=fila[cols.indexOf(kDes)+1];
        const md=P.medidos.filter(m=>m.k===kDes)[0];
        const val = lado==='arriba' ? (v[0]+2*v[1]) : (v[0]-2*v[1]);
        S(md.id, String(Math.round(val*100)/100));
      }
      try{ vModSync(POS) }catch(e){}
      await esperar(120);
      I[lado]={col:kDes, med:meds()};
    }
  }
  R.I_medido=I;
  /* J - Mosaic y Hancock II impresos identicos (solo mitral) */
  if (POS==='vm'){
    const mo=TAB.filter(x=>/Mosaic/.test(x.n))[0], ha=TAB.filter(x=>/Hancock II/.test(x.n))[0];
    R.J_gemelos = (mo&&ha)? {mosaic:JSON.stringify(mo.s), hancock:JSON.stringify(ha.s),
      iguales:JSON.stringify(mo.s)===JSON.stringify(ha.s), folios:[mo.f,ha.f], ambos:true}:{ambos:false};
  }
  /* K - Nuevo estudio */
  await base('Prótesis mecánica');
  S(POS+'_prot_modelo','Carbomedics'); S(POS+'_prot_tam', (TAB.filter(x=>x.n==='Carbomedics')[0]||TAB[0]).s[0][0]);
  try{ vModSync(POS) }catch(e){}
  await esperar(80);
  const antes={btn:T('vmod-'+POS+'-btn'), modelo:V(POS+'_prot_modelo')};
  try{ limpiarCampos(true) }catch(e){}
  await esperar(300);
  R.K_nuevo={antes:antes, despues:{btn:T('vmod-'+POS+'-btn'), modelo:V(POS+'_prot_modelo'),
    tam:V(POS+'_prot_tam'), gm:V(POS+'_prot_gmref'), eoa:V(POS+'_prot_eoaref'),
    wrapVisible:VIS('vmod-'+POS+'-wrap')}};
  /* L - cambiar de morfologia a un tipo incompatible limpia */
  await base('Prótesis mecánica');
  const mec=TAB.filter(x=>x.t==='mec')[0];
  if(mec){ S(POS+'_prot_modelo',mec.n); S(POS+'_prot_tam',mec.s[0][0]); try{vModSync(POS)}catch(e){} await esperar(80);
    const pre=V(POS+'_prot_modelo');
    S(MORF,'Prótesis biológica'); await esperar(250);
    R.L_morf={pre:pre, post:V(POS+'_prot_modelo'), btn:T('vmod-'+POS+'-btn')};
    S(MORF,'Normal'); await esperar(250);
    R.L_nativa={modelo:V(POS+'_prot_modelo'), wrapVisible:VIS('vmod-'+POS+'-wrap')};
  }
  /* M - censo y Excel */
  await base('Prótesis mecánica');
  S(POS+'_prot_modelo','Carbomedics'); S(POS+'_prot_tam',(TAB.filter(x=>x.n==='Carbomedics')[0]||TAB[0]).s[0][0]);
  S(POS+'_prot_gmref',''); S(POS+'_prot_eoaref','');
  await esperar(150);
  try{
    const est=(typeof _recolectarCampos==='function')?_recolectarCampos():null;
    R.M_censo = est? Object.keys(est).length : 'sin _recolectarCampos';
  }catch(e){ R.M_censo='EXC '+e.message }
  try{
    const campos={}; document.querySelectorAll('input,select,textarea').forEach(e=>{
      if(!e.id) return; if(typeof _noEsDelEstudio==='function' && _noEsDelEstudio(e.id)) return;
      campos[e.id]= (e.type==='checkbox')? (e.checked?'1':'') : String(e.value||''); });
    R.M_nCampos=Object.keys(campos).length;
    const row=(typeof _labExcelRow==='function')?_labExcelRow({campos:campos}):null;
    R.M_excel = row? {n:Object.keys(row).length,
      nuevas:Object.keys(row).filter(k=>/de prótesis mitral|referencia mitral|de prótesis tricúsp|referencia tricúsp|de prótesis pulmonar|referencia pulmonar/.test(k)),
      vals:Object.keys(row).filter(k=>/referencia mitral|de prótesis mitral/.test(k)).map(k=>k+'='+row[k]),
      conEOA:Object.keys(row).filter(k=>/EOA|AEO/.test(k))} : 'sin _labExcelRow';
  }catch(e){ R.M_excel='EXC '+e.message }
  /* N - geometria de la fila y TC-522 */
  const fila=document.querySelector('#tab-valvulas .valv-morf-row.vmod-row');
  const tres=document.querySelector('#tab-valvulas .valv-morf-row--tres');
  const bIns=document.getElementById('pill-insuf-mitral');
  const rr=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),y:Math.round(r.y)}};
  R.N_geo={filaPropia:rr(fila), tres:rr(tres), botonInsuf:rr(bIns),
    hijosTres: tres? Array.prototype.filter.call(tres.children,c=>c.classList&&c.classList.contains('fg')).map(c=>(c.querySelector('select')||{}).id||'?') : null,
    scrollH: document.documentElement.scrollWidth>document.documentElement.clientWidth};
  return R;
})()`;

const b=await chromium.launch({channel:'chrome'});
const out={};
for (const [W,H] of [[1440,900],[1000,900],[768,900],[390,844]]){
  const ctx=await b.newContext({viewport:{width:W,height:H}});
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
  await p.goto('file://'+FILE); await p.waitForTimeout(1500);
  let r; try{ r=await p.evaluate(CUERPO) }catch(e){ r={ERR:String(e).slice(0,400)} }
  r._errs=errs; out[W]=r;
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(out,null,1));
