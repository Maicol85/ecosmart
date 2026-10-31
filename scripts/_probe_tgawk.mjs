#!/usr/bin/env node
/**
 * _probe_tgawk.mjs — los DOS MOTORES de la tanda TGA (2026-10-31).
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
  const S=(id,v)=>{const e=EL(id);if(!e)return;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
  const caja=id=>{const e=EL(id);if(!e)return 'NO';const r=e.getBoundingClientRect();
    return Math.round(r.width)+'x'+Math.round(r.height)};
  const T=id=>{const e=EL(id);if(!e)return 'NO';return String(e.textContent||'').split(' ').filter(Boolean).join(' ').trim()};
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  S('nombre','Prueba TGA'); S('ci','563'); S('peso','70'); S('talla','170'); S('sexo','M');

  /* las DOS pestanas, por sus botones reales */
  const bq=t=>Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b=>String(b.getAttribute('onclick')).indexOf(t)>=0)[0];
  const Q=String.fromCharCode(39);
  try{ const b1=bq('showTab('+Q+'congenitas'+Q); if(b1) b1.click(); else showTab('congenitas');
       const b2=bq('ccSubTab('+Q+'congenitas2'); if(b2) b2.click(); else ccSubTab('congenitas2'); }catch(e){}
  await new Promise(r=>setTimeout(r,320));
  const acc=EL('sacc-cc-tga');
  /* ATENCION: la seccion de la TGA NACE CERRADA —secAutoOpen solo la abre si tiene datos, y por
     eso los controles del dibujo llevan data-ui—, asi que aca se abre y se registra DESPUES. */
  if(acc && !acc.classList.contains('open')){ const h=document.querySelector('#sacc-cc-tga .sacc-hdr'); if(h) h.click(); }
  await new Promise(r=>setTimeout(r,420));
  R.accAbierto = acc ? (acc.classList.contains('open')?'si':'NO') : 'NO EXISTE';

  /* 1 · sin tipo: ni libreria ni controles */
  R.threeSinTipo = (typeof window.THREE==='undefined')?'no':'BAJO';
  R.avisoSinTipo = T('tga-3d-aviso').indexOf('Eleg')===0 ? 'avisa' : T('tga-3d-aviso').slice(0,22);
  R.ctrlSinTipo = EL('tga-3d-ctrl') ? getComputedStyle(EL('tga-3d-ctrl')).display : 'NO';

  /* 2 · con d-TGA: carga, dibuja y muestra los controles */
  S('tga_tipo','dtga'); S('tga_cirugia','auricular'); S('tga_func_vd','normal'); S('tga_sintomas','no');
  S('ete_cia_tipo','secundum'); S('vd_bas','45');
  /* ATENCION: SIN LA CASILLA «Integrar al informe» EL PAPEL NO PUBLICA NADA DE LA TGA —su
     compuerta es tga_incluir_chk—, y «SIN LINEA» se lee como que el commit 3 no funciona.
     Costo una corrida. */
  try{ const ch=EL('tga_incluir_chk'); if(ch){ ch.checked=true;
    ch.dispatchEvent(new Event('change',{bubbles:true})); } }catch(e){}
  const t0=Date.now();
  while(Date.now()-t0<60000 && !document.querySelector('#tga-3d-cv canvas'))
    await new Promise(r=>setTimeout(r,140));
  await new Promise(r=>setTimeout(r,700));
  R.lienzo = (function(){const c=document.querySelector('#tga-3d-cv canvas');
    if(!c) return 'SIN CANVAS'; const r=c.getBoundingClientRect();
    return Math.round(r.width)+'x'+Math.round(r.height)})();
  R.three = (typeof window.THREE!=='undefined') ? ('r'+(window.THREE.REVISION||'?')) : 'NO';
  R.ctrl = getComputedStyle(EL('tga-3d-ctrl')).display;
  R.rotulos = document.querySelectorAll('#tga-3d-cv .tga3d-lbl').length;
  R.estado = T('tga-3d-estado').slice(0,52);
  R.filaCir = EL('tga-cirugia-row') ? getComputedStyle(EL('tga-cirugia-row')).display : 'NO';

  /* 3 · los controles de 44 px: alto, y que ningun punto caiga en OTRO CONTROL.
     ⚠️ NO SE EXIGEN LOS CINCO PUNTOS «propios», Y HAY UN MOTIVO MEDIDO. Estos botones son
     .btn, con border-radius: 7px: el punto a 2 px de la esquina cae FUERA de la forma
     redondeada y elementFromPoint devuelve el contenedor flex —div#tga-3d-ctrl, que no es un
     control y no hace nada—. Medido: la esquina inferior derecha de «Corazon normal» y de «Vista
     de frente» da el contenedor en los dieciseis cruces, y los otros cuatro puntos dan el propio
     boton. Exigir 5/5 sobre un rectangulo redondeado es exigir algo que la geometria no da; lo
     que importa es que un toque no caiga en OTRO control, y eso es lo que se cuenta.
     Los globos cuadrados de 44x44 con vinfo-btn-44 SI dan 5/5, y los mide TC-535. */
  R.btn44 = (function(){
    const ids=['tga-3d-norm','tga-3d-pausar','tga-3d-frente','tga-3d-pdf'];
    let ok=0, det=[];
    ids.forEach(function(id){ const e=EL(id); if(!e) { det.push(id+':NO EXISTE'); return }
      e.scrollIntoView({block:'center'});
      const r=e.getBoundingClientRect();
      if(r.height<43.5){ det.push(id+':alto '+Math.round(r.height)); return }
      const pts=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],
                 [r.right-2,r.bottom-2],[r.left+r.width/2,r.top+r.height/2]];
      let propios=0, ajenos=[];
      pts.forEach(function(p){ const x=document.elementFromPoint(p[0],p[1]);
        if(x && (x===e || e.contains(x))) { propios++; return }
        const c = x && x.closest ? x.closest('button,a,input,select,textarea') : null;
        if(c && c!==e) ajenos.push((c.id||c.tagName.toLowerCase()));
      });
      if(ajenos.length) { det.push(id+':CAE EN '+ajenos.join('/')); return }
      ok++; det.push(id+':'+Math.round(r.width)+'x'+Math.round(r.height)+' '+propios+'/5');
    });
    R.btn44det = det.join(' ');
    return ok+'/4' })();

  /* 4 · el globo del diagrama: abre, entra en la pantalla y no cita */
  R.globo = (function(){ try{
    const b=document.querySelector('[data-vinfo="tga-3d"]'); if(!b) return 'NO HAY BOTON';
    b.scrollIntoView({block:'center'});
    if(typeof vInfoClic==='function') vInfoClic(b,{stopPropagation:function(){},preventDefault:function(){}});
    const c=document.getElementById('vinfo-card'); if(!c) return 'NO ABRE';
    const r=c.getBoundingClientRect();
    const dentro = (r.top>=-1 && r.bottom<=window.innerHeight+1 && r.left>=-1 && r.right<=window.innerWidth+1);
    const txt=String(c.textContent||'');
    const cita = /Clase |folio |Tabla [0-9]|ESC 20|AHA|ASE 20/.test(txt) ? 'CITA' : 'sin cita';
    return Math.round(r.width)+'x'+Math.round(r.height)+' '+(dentro?'dentro':'FUERA')+' '+cita;
  }catch(e){ return 'EXC' } })();
  try{ if(typeof vInfoCerrar==='function') vInfoCerrar() }catch(e){}

  /* 5 · el papel */
  R.papel = (function(){ try{ if(typeof generarInforme==='function') generarInforme();
    const t=EL('informe_texto'); const s=String(t?t.value:'');
    const i=s.indexOf('Transposici');
    return i<0 ? 'SIN LINEA' : s.slice(i,i+86) }catch(e){ return 'EXC' } })();

  /* 6 · invariantes P1 */
  const secs=[].slice.call(document.querySelectorAll('.tab-section'));
  R.pest = secs.filter(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0}).length+'/'+secs.length;
  R.scrollH = (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    ? (document.documentElement.scrollWidth - document.documentElement.clientWidth) : 0;
  R.recortados = (function(){ let n=0;
    [].slice.call(document.querySelectorAll('label,option,span.calc-lbl,button')).forEach(function(e){
      const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) return;
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
console.log(P('cruce',22)+P('acc',5)+P('3sinT',7)+P('lienzo',10)+P('three',7)+P('ctrl',6)
  +P('rot',5)+P('fila',6)+P('btn44',7)+P('globo',24)+P('scrH',6)+P('recor',6)+P('detalle btn44',44));
for (const k of Object.keys(OUT)) { const r=OUT[k];
  if (r.err) { console.log(P(k,22)+'ERR '+r.err); continue }
  console.log(P(k,22)+P(r.accAbierto,5)+P(r.threeSinTipo,7)+P(r.lienzo,10)+P(r.three,7)+P(r.ctrl,6)
    +P(r.rotulos,5)+P(r.filaCir,6)+P(r.btn44,7)+P(r.globo,24)+P(r.scrollH,6)+P(r.recortados,6)
    +P(r.btn44det,44)); }
console.log('');
const c0=OUT['chrome 1440px claro']||{}, w0=OUT['webkit 1440px claro']||{};
console.log('estado (chrome 1440 claro): ' + c0.estado);
console.log('papel  (chrome 1440 claro): ' + c0.papel);
console.log('papel  (webkit 1440 claro): ' + w0.papel);
console.log('aviso sin tipo            : ' + c0.avisoSinTipo);
console.log('ERRORES de consola y de pagina: ' + (errs.length ? errs.length + '\n  ' + errs.slice(0,8).join('\n  ') : 'CERO'));
