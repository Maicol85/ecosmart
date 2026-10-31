#!/usr/bin/env node
/**
 * _probe_t2wk.mjs — los DOS MOTORES de la tanda TGA-2 (2026-10-31).
 *
 * Mide la seccion de la TGA con el switch arterial cargado y el panel de Evidencia abierto, en
 * dos motores x cuatro anchos x dos temas. La pestana y el acordeon se abren por su BOTON REAL:
 * con showTab programatico la tarjeta de adentro queda sin caja y todo informa 0x0.
 *
 * Chrome del sistema y WebKit de Playwright, en 1440, 1000, 768 y 390 px y en los dos temas:
 * dieciseis cruces por motor. Mide el diagrama 3D, sus controles, el globo y los invariantes P1.
 *
 *   node scripts/_probe_tgawk.mjs [--file <html>]
 *
 * ATENCION: WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. El binario de chromium de
 * Playwright no esta instalado en esta maquina, asi que Chrome va por el del sistema con
 * channel chrome: sin eso la sonda devuelve los cruces VACIOS, que en un volcado se lee como
 * «no hubo diferencias».
 * ATENCION 2: la seccion de la TGA vive en la sub-pestana «CC complejas» (tab-congenitas2) y su
 * acordeon YA VIENE ABIERTO. Sin abrir las DOS pestanas todo da 0x0; cerrandolo por error, el
 * diagrama no carga.
 * ADVERTENCIA: sin acentos graves dentro del template, y sin barras invertidas simples.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log('SIN PLAYWRIGHT');process.exit(2)}
const {chromium, webkit}=_pw;
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const FILE=arg('--file')||(RAIZ+'/index.html');
const ANCHOS=[1440,1000,768,390], TEMAS=['claro','oscuro'];

const MEDIR = `(async (tema) => {
  const R = {};
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try { document.documentElement.setAttribute('data-tema', tema);
        if (typeof setTema === 'function') setTema(tema) } catch (e) {}
  const EL=id=>document.getElementById(id);
  const S=(id,v)=>{const e=EL(id);if(!e)return 'NO '+id;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return e.value};
  const caja=el=>{if(!el)return 'NO';const r=el.getBoundingClientRect();
    return Math.round(r.width)+'x'+Math.round(r.height)};
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  S('nombre','Prueba T2'); S('ci','564'); S('peso','70'); S('talla','170'); S('sexo','M');
  S('vd_bas','45'); S('it_grado','4');
  S('tga_tipo','dtga'); S('tga_cirugia','jatene'); S('tga_func_vd','moderada'); S('tga_sintomas','si');

  /* las DOS pestanas, por sus botones reales */
  const bq=t=>Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b=>String(b.getAttribute('onclick')).indexOf(t)>=0)[0];
  const Q=String.fromCharCode(39);
  try{ const b1=bq('showTab('+Q+'congenitas'+Q); if(b1) b1.click(); else showTab('congenitas');
       const b2=bq('ccSubTab('+Q+'congenitas2'); if(b2) b2.click(); else ccSubTab('congenitas2'); }catch(e){}
  await new Promise(r=>setTimeout(r,320));
  const acc=EL('sacc-cc-tga');
  if(acc && !acc.classList.contains('open')){ const h=document.querySelector('#sacc-cc-tga .sacc-hdr'); if(h) h.click(); }
  await new Promise(r=>setTimeout(r,420));
  R.accAbierto = acc ? (acc.classList.contains('open')?'si':'NO') : 'NO EXISTE';

  /* 1 · el titulo neutro y el parrafo sin afirmacion clinica */
  const hdr=document.querySelector('#sacc-cc-tga .sacc-hdr span[style]');
  R.titulo = hdr ? String(hdr.textContent).trim() : 'NO';
  R.tituloCorregida = (R.titulo.indexOf('corregida')>=0)?'DICE':'no';
  const parr=document.querySelector('#sacc-cc-tga .card-body p');
  R.parrSist = (parr && String(parr.textContent).indexOf('ventrículo sistémico')>=0)?'DICE':'no';

  /* 2 · el selector de cirugia con sus CUATRO valores, y la fila de funcion escondida */
  const selC=EL('tga_cirugia');
  R.opsCir = selC ? selC.options.length : -1;
  R.cirVal = selC ? selC.value : 'NO';
  const fvd=EL('tga-funcvd-fg');
  R.filaFvd = fvd ? (getComputedStyle(fvd).display) : 'NO';
  R.valFvd = (EL('tga_func_vd')||{}).value || 'VACIO';

  /* 3 · el papel: solo el tipo y la cirugia */
  let c=null; try{ c = (typeof tgaConclusion==='function') ? tgaConclusion() : null }catch(e){}
  R.papel = c ? String(c.txt).slice(0,90) : 'NULL';
  R.papelSist = (c && String(c.txt).indexOf('ventrículo sistémico')>=0)?'DICE':'no';

  /* 4 · el panel de Evidencia, abierto por su boton real */
  try{ const be=bq('indicAbrir'); if(be) be.click(); else if(typeof indicAbrir==='function') indicAbrir(); }catch(e){}
  await new Promise(r=>setTimeout(r,650));
  const cue=EL('indic-cuerpo');
  R.panel = cue ? caja(cue) : 'NO';
  const sums = cue ? Array.prototype.map.call(cue.querySelectorAll(':scope > details > summary'), s=>String(s.textContent).trim()) : [];
  R.secs = sums.length;
  R.hayTGA = sums.filter(t=>t.indexOf('Transposición')===0).length ? 'si':'NO';
  /* la seccion de la TGA se abre y se cuentan sus preguntas */
  const dTGA = cue ? Array.prototype.filter.call(cue.querySelectorAll(':scope > details'),
    d=>{const s=d.querySelector('summary'); return s && String(s.textContent).indexOf('Transposición')===0})[0] : null;
  if (dTGA) { dTGA.open = true; }
  await new Promise(r=>setTimeout(r,200));
  const btns = dTGA ? Array.prototype.slice.call(dTGA.querySelectorAll('[data-ind-clin]')) : [];
  R.preg = btns.length;
  /* ATENCION: un elementFromPoint FUERA del viewport da null, no «tapado». Se trae el primero a
     la vista antes de medirlo. */
  let alt44=0, propios=0;
  if (btns.length) { try{ btns[0].scrollIntoView({block:'center'}) }catch(e){}
    await new Promise(r=>setTimeout(r,220));
    btns.forEach(function(b){ const r=b.getBoundingClientRect(); if(Math.round(r.height)>=44) alt44++; });
    const b0=btns[0], r0=b0.getBoundingClientRect();
    if (r0.top>=0 && r0.bottom<=innerHeight) {
      const pts=[[r0.left+4,r0.top+4],[r0.right-4,r0.top+4],[r0.left+4,r0.bottom-4],
                 [r0.right-4,r0.bottom-4],[(r0.left+r0.right)/2,(r0.top+r0.bottom)/2]];
      pts.forEach(function(p){ const e=document.elementFromPoint(p[0],p[1]);
        if (e && (e===b0 || b0.contains(e))) propios++; });
    } else { propios = -1; }
  }
  R.btn44 = btns.length ? (alt44+'/'+btns.length) : '0/0';
  R.puntos = propios;
  R.folio = dTGA ? ((String(dTGA.textContent).indexOf('folio 620')>=0)?'si':'NO') : 'NO';
  R.recom = dTGA ? (String(dTGA.textContent).split('Clase ').length-1) : -1;

  /* 5 · scroll horizontal y texto recortado */
  R.scrollH = (document.documentElement.scrollWidth > document.documentElement.clientWidth + 2) ? 'SI' : 'no';
  R.recortados = (function(){ let n=0;
    document.querySelectorAll('#sacc-cc-tga label, #sacc-cc-tga option, #indic-cuerpo summary').forEach(function(e){
      if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'auto') n++; });
    return n })();
  return R;
})(TEMA)`;

const errs=[];
const OUT={};
for (const [nom, motor] of [['chrome', chromium], ['webkit', webkit]]) {
  const b = await motor.launch(nom==='chrome' ? {channel:'chrome'} : {});
  for (const w of ANCHOS) for (const tm of TEMAS) {
    const k = nom+' '+w+'px '+tm;
    const ctx = await b.newContext({viewport:{width:w,height:900}});
    const pg = await ctx.newPage();
    pg.on('pageerror', e=>errs.push(k+': '+e.message.slice(0,90)));
    pg.on('console', m=>{ if(m.type()==='error') errs.push(k+' [consola]: '+m.text().slice(0,90)) });
    await pg.goto('file://'+FILE,{waitUntil:'load',timeout:180000});
    await pg.waitForTimeout(1600);
    try { OUT[k] = await pg.evaluate(MEDIR.replace('TEMA', JSON.stringify(tm))); }
    catch (e) { OUT[k] = {err: String(e).slice(0,120)}; }
    await pg.close(); await ctx.close();
  }
  await b.close();
}
const P=(s,n)=>String(s==null?'':s).padEnd(n).slice(0,n);
console.log(P('cruce',22)+P('acc',5)+P('corr',6)+P('parr',6)+P('ops',5)+P('fvd',7)+P('valFvd',9)
  +P('sist',6)+P('secs',6)+P('TGA',5)+P('preg',6)+P('btn44',8)+P('pts',5)+P('folio',7)+P('recom',7)+P('scrH',6)+P('rec',5));
for (const k of Object.keys(OUT)) { const r=OUT[k];
  if (r.err) { console.log(P(k,22)+'ERR '+r.err); continue }
  console.log(P(k,22)+P(r.accAbierto,5)+P(r.tituloCorregida,6)+P(r.parrSist,6)+P(r.opsCir,5)
    +P(r.filaFvd,7)+P(r.valFvd,9)+P(r.papelSist,6)+P(r.secs,6)+P(r.hayTGA,5)+P(r.preg,6)
    +P(r.btn44,8)+P(r.puntos,5)+P(r.folio,7)+P(r.recom,7)+P(r.scrollH,6)+P(r.recortados,5)); }
console.log('');
const c0=OUT['chrome 1440px claro']||{}, w0=OUT['webkit 1440px claro']||{};
console.log('titulo (chrome): ' + c0.titulo);
console.log('papel  (chrome): ' + c0.papel);
console.log('papel  (webkit): ' + w0.papel);
console.log('panel  (chrome): ' + c0.panel + '  (webkit): ' + w0.panel);
console.log('ERRORES de consola y de pagina: ' + (errs.length ? errs.length + '\n  ' + errs.slice(0,8).join('\n  ') : 'CERO'));
