#!/usr/bin/env node
/**
 * _probe_ajustes2wk.mjs — los DOS MOTORES de la tanda AJUSTES-2 (2026-10-31).
 *
 * Chrome del sistema y WebKit de Playwright, en 1440, 1000, 768 y 390 px y en los dos temas:
 * dieciséis cruces por motor. Mide las zonas que la tanda toca y los invariantes de P1.
 *
 *   node scripts/_probe_ajustes2wk.mjs [--file <html>]
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. El binario de chromium de Playwright no
 * esta instalado en esta maquina, asi que Chrome va por el del sistema con channel:'chrome':
 * sin eso la sonda devuelve los cruces VACIOS, que en un volcado se lee como «no hubo
 * diferencias».
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
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return;e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  S('nombre','Prueba WK'); S('ci','557'); S('peso','70'); S('talla','170'); S('sexo','M');
  S('coa_istmo','8'); S('coa_gmedio','25'); S('coa_situacion','nativa');
  S('oai_morfologia','veleta'); S('oai_ostium_diam','21'); S('oai_profundidad','26'); S('oai_vel_vac','48');
  S('vd-triv','78'); S('tapse','16'); S('s_prime','8');
  try{ Object.keys(window).forEach(k=>{if(/^calc[A-Z]/.test(k)&&typeof window[k]==='function'){try{window[k]()}catch(e){}}}) }catch(e){}
  await new Promise(r=>setTimeout(r,420));

  /* 1 · las pestanas con caja */
  const secs=[].slice.call(document.querySelectorAll('.tab-section'));
  R.pestanas = secs.length;
  R.conCaja = secs.filter(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0}).length;

  /* 2 · desplazamiento horizontal del cuerpo */
  R.scrollH = (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    ? (document.documentElement.scrollWidth - document.documentElement.clientWidth) : 0;

  /* 3 · textos recortados: un elemento cuyo contenido no entra en su caja */
  R.recortados = (function(){
    let n=0;
    [].slice.call(document.querySelectorAll('label,option,span.calc-lbl,button')).forEach(function(e){
      const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) return;
      if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'auto') n++;
    });
    return n; })();

  /* 4 · el papel de la coartacion */
  try{ if(typeof eteInclToggle==='function') eteInclToggle('coart_incluir_chk') }catch(e){}
  try{ if(typeof generarInforme==='function') generarInforme() }catch(e){}
  await new Promise(r=>setTimeout(r,320));
  const inf=String((document.getElementById('informe_texto')||{}).value||'');
  R.coaInforme = (inf.match(/Coartaci[^.]*\\./) || ['(no la nombra)'])[0];
  const PROH=['Segun la guia','Seg\\u00fan la gu\\u00eda','ESC 2024','ESC 2020','Figura 44','folio','Clase I','Nivel C','Tabla 69','medir el'];
  R.coaProhibidas = PROH.filter(w=>inf.indexOf(w)>-1).join(',') || 'cero';
  R.coaClausula = inf.indexOf('con criterios de significaci\\u00f3n por Doppler (mayor de 20 mmHg)')>-1;

  /* 5 · la capsula de pantalla SI conserva la cita */
  const cap=(document.getElementById('coa-concl')||{}).textContent||'';
  R.capsulaConCita = cap.indexOf('ESC 2024')>-1 && cap.indexOf('Figura 44')>-1;

  /* 6 · «Manga de viento» sin riesgo */
  const mv=[].slice.call(document.querySelectorAll('#oai_morfologia option')).filter(o=>o.value==='veleta')[0];
  R.mangaViento = mv ? mv.textContent.trim() : 'NO EXISTE';

  /* 7 · la fila de miniaturas y su ⓘ: 44x44 y los cinco puntos */
  try{
    const mk=(c)=>{const cv=document.createElement('canvas');cv.width=8;cv.height=8;
      const x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,8,8);return cv.toDataURL('image/png')};
    if (typeof imgSlots!=='undefined'){ imgSlots.length=0;
      ['#e03030','#30b030'].forEach(c=>imgSlots.push({dataURL:mk(c),calidad:'media',origen:'estudio'}));
      if(typeof imgSlotCount!=='undefined') imgSlotCount=imgSlots.length;
      if(typeof imgEnsureLen==='function') imgEnsureLen();
      if(typeof infMinPintar==='function') infMinPintar(); }
    const bt=document.getElementById('floatBtnInforme'); if(bt) bt.click();
    await new Promise(r=>setTimeout(r,380));
    const g=document.querySelector('#inf-min-fila [data-vinfo="inf-min"]');
    if(g){ g.scrollIntoView({block:'center'}); await new Promise(r=>setTimeout(r,160));
      const r=g.getBoundingClientRect();
      R.globoFila = Math.round(r.width)+'x'+Math.round(r.height);
      const pts=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],[r.right-2,r.bottom-2],
                 [r.left+r.width/2,r.top+r.height/2]];
      R.globoFilaPuntos = pts.map(p=>{const el=document.elementFromPoint(p[0],p[1]);
        return (el===g||g.contains(el))?'1':'0'}).join('');
    } else R.globoFila='NO EXISTE';
    R.textoAyuda = document.querySelectorAll('#inf-min-fila .inf-min-ayuda').length;
  }catch(e){ R.globoFila='EXC '+e.message.slice(0,40) }

  /* 8 · los ⓘ del TRIV */
  R.botonesTriv = document.querySelectorAll('[data-vinfo="vd-triv"]').length;
  R.funConTriv = (function(){ try{ const fr=window.evTarjetaVDFun?evTarjetaVDFun():null;
    if(!fr) return 'SIN FN'; const d=document.createElement('div'); d.appendChild(fr);
    const t=d.textContent||''; return (t.indexOf('Howard')>-1 && t.indexOf('Cabrita')>-1) ? 'SI':'no';
  }catch(e){return 'EXC'} })();
  return R;
})(TEMA)`;

const errs=[];
const OUT={};
for (const [nom, motor] of [['chrome', chromium], ['webkit', webkit]]) {
  const b = await motor.launch(nom==='chrome' ? {channel:'chrome'} : {});
  for (const w of ANCHOS) for (const tm of TEMAS) {
    const k = nom+' '+w+'px '+tm;
    const ctx = await b.newContext({viewport:{width:w,height:900}});
    await ctx.addInitScript("try{localStorage.setItem('cfg-guardar-imagenes','1')}catch(e){}");
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
console.log(P('cruce',24)+P('pest',6)+P('scrH',6)+P('recor',7)+P('prohib',8)+P('claus',7)
  +P('capCita',9)+P('manga',18)+P('globo',8)+P('pts',7)+P('ayuda',7)+P('triv',6)+P('funTriv',8));
for (const k of Object.keys(OUT)) { const r=OUT[k];
  console.log(P(k,24)+P(r.conCaja+'/'+r.pestanas,6)+P(r.scrollH,6)+P(r.recortados,7)
    +P(r.coaProhibidas,8)+P(r.coaClausula,7)+P(r.capsulaConCita,9)+P(r.mangaViento,18)
    +P(r.globoFila,8)+P(r.globoFilaPuntos,7)+P(r.textoAyuda,7)+P(r.botonesTriv,6)+P(r.funConTriv,8)); }
console.log('');
console.log('informe de la coartacion (un cruce): ' + (OUT['chrome 1440px claro']||{}).coaInforme);
console.log('ERRORES de consola y de pagina: ' + (errs.length ? errs.length + '\n  ' + errs.slice(0,6).join('\n  ') : 'CERO'));
