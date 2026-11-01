#!/usr/bin/env node
/**
 * _probe_ajustes3wk.mjs — los DOS MOTORES de la tanda AJUSTES-3 (2026-10-31).
 *
 * ⚠️ EL NOMBRE NO ES `_probe_aj3wk.mjs`, Y ES A PROPOSITO: ese archivo YA EXISTE y es la sonda de
 * la tanda AJ3 del 23/10/2026, otra tanda con la misma sigla. Escribir la de esta tanda con ese
 * nombre la SOBRESCRIBE — es el resbalon que la tanda AJUSTES-1 ya pago con `_probe_aj1wk.mjs`.
 *
 * Mide lo que los commits 2, 3 y 4 tocan, en dos motores x cuatro anchos x dos temas:
 *   - los botones de respuesta del panel de Evidencia a 44 px y sin caer en otro control;
 *   - la marca de FORMA del boton marcado, y que sea UNA sola;
 *   - el globo de la TGA con la clausula de la IT sistemica, su rotulo y sin folio ni clase;
 *   - la linea de la miocardiopatia que va al PPT, sin recomendacion ni guia;
 *   - los invariantes P1: cero desplazamiento horizontal, cero textos recortados, cero errores.
 *
 *   node scripts/_probe_ajustes3wk.mjs [--file <html>]
 *
 * ATENCION: WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. El binario de chromium de
 * Playwright no esta instalado en esta maquina, asi que Chrome va por el del sistema con
 * channel chrome: sin eso la sonda devuelve los cruces VACIOS, que en un volcado se lee como
 * «no hubo diferencias».
 * ATENCION 2: el panel de Evidencia es un MODAL position:fixed, asi que offsetParent da null
 * aunque este abierto; se mira la caja. Y se abre por su BOTON REAL.
 * ATENCION 3: los nodos del panel se DESPRENDEN en cada repintado, asi que despues de cada
 * gesto se vuelve a consultar el DOM.
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
  const R={};
  const esperar=ms=>new Promise(r=>setTimeout(r,ms));
  ['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id);if(m)m.style.display='none'});
  try{ if(tema==='oscuro' && typeof toggleTema==='function') toggleTema(); }catch(e){}
  try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}
  const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 0;e.value=String(v);
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 1};
  const K=(id,on)=>{const e=document.getElementById(id);if(!e)return 0;e.checked=!!on;
    e.dispatchEvent(new Event('change',{bubbles:true}));return 1};
  const veces=(t,h)=>String(h||'').split(t).length-1;

  S('nombre','AJ3');S('ci','31313131');S('fecha_estudio','2026-10-31');
  S('peso','70');S('talla','170');S('sexo','M');S('edad','50');
  S('vab_presente','si');S('vab_tipo','rl');S('ao_asc','52');S('ao_sin','47');
  S('tga_tipo','cctga');S('vd_bas','45');
  S('cia_presente','si');S('civ_presente','si');
  S('mch_presente','si');S('mch_espesor','32');S('mch_grad_valsalva','60');
  S('mch_grad_reposo','60');S('mch_cf','iii_iv');S('mch_sam','si');S('mch_sincope','si');
  S('mch_aneurisma_apical','no');S('mch_fibrosis_rmn','no');
  S('siv','32');S('ppvi','12');S('ai_diam','45');S('fevi','60');
  K('mch_incluir_chk',true); K('tga_incluir_chk',true);
  try{ if(typeof _recalcModulos==='function') _recalcModulos() }catch(e){}
  await esperar(600);

  /* ── el PAPEL ── */
  try{ if(typeof generarInforme==='function') generarInforme() }catch(e){}
  await esperar(600);
  const inf=String((document.getElementById('informe_texto')||{}).value||'');
  R.infChars=inf.length;
  R.infClausula=veces('pesa como pesar',inf);
  const cm=(typeof mchConclusion==='function')?mchConclusion():null;
  R.pplRec = cm ? veces('desfibrilador', cm.papel||'') : 'SIN CM';
  R.pplGuia = cm ? (veces('AHA/ACC', cm.papel||'')+veces('ESC', cm.papel||'')) : 'SIN CM';
  R.pplRotulo = cm && String(cm.papel||'').indexOf('Factores mayores de riesgo')>-1 ? 'si' : 'NO';
  R.resRec = cm ? (veces('desfibrilador', cm.resumen||'')>0?'si':'NO') : 'SIN CM';

  /* ── el GLOBO de la TGA, por su boton REAL ── */
  const tb=[...document.querySelectorAll('[onclick*="congenitas2"]')];
  for(const t of tb){try{t.click()}catch(e){}}
  await esperar(350);
  const sec=document.getElementById('sacc-cc-tga');
  const hdr=sec&&sec.querySelector('.sacc-hdr');
  if(hdr && !sec.classList.contains('open')){try{hdr.click()}catch(e){}}
  await esperar(500);
  const g=sec&&sec.querySelector('[data-vinfo="tga-3d"]');
  R.globoBtn = g ? (Math.round(g.getBoundingClientRect().width)+'x'+Math.round(g.getBoundingClientRect().height)) : 'NO HAY';
  if(g){ g.scrollIntoView({block:'center'}); await esperar(180);
         try{ g.click() }catch(e){} await esperar(450); }
  const card=document.getElementById('vinfo-card');
  if(card){ const cr=card.getBoundingClientRect();
    R.globo=Math.round(cr.width)+'x'+Math.round(cr.height);
    R.globoDentro = (cr.top>=0 && cr.bottom<=innerHeight+1) ? 'si' : 'NO';
    const t=String(card.textContent||'');
    R.gClausula = veces('La v\\u00e1lvula tric\\u00faspide de estos pacientes es la auriculoventricular sist\\u00e9mica: su insuficiencia pesa como pesar\\u00eda una mitral.', t);
    R.gRotulo = t.indexOf('Criterio de EcoSmart')>-1 ? 'si' : 'NO';
    R.gSinCita = (veces('folio',t)+veces('Clase',t)+veces('ESC 2020',t));
  } else { R.globo='NO ABRE'; R.globoDentro='-'; R.gClausula='-'; R.gRotulo='-'; R.gSinCita='-'; }
  try{ if(card) card.style.display='none'; }catch(e){}

  /* ── los BOTONES del panel de Evidencia ── */
  const bt=document.querySelector('[onclick*="indicAbrir"]');
  if(bt){try{bt.click()}catch(e){}}
  await esperar(900);
  document.querySelectorAll('#indic-cuerpo details:not([open])').forEach(d=>{try{d.open=true}catch(e){}});
  await esperar(350);
  const cu=document.getElementById('indic-cuerpo');
  const bs=()=>cu?[...cu.querySelectorAll('[data-ind-clin]')]:[];
  R.nBtn=bs().length;
  R.panel = cu ? (Math.round(cu.getBoundingClientRect().width)+'x'+Math.round(cu.getBoundingClientRect().height)) : 'NO';
  R.btn44 = bs().filter(b=>{const r=b.getBoundingClientRect();return r.height>=44 && r.width>=44}).length + '/' + bs().length;
  const enOtro=(b)=>{const r=b.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2, d=21;
    const pts=[[cx-d,cy-d],[cx+d,cy-d],[cx-d,cy+d],[cx+d,cy+d],[cx,cy-d],[cx,cy+d],[cx-d,cy],[cx+d,cy],[cx,cy]];
    let n=0;
    pts.forEach(function(p){ if(p[0]<0||p[1]<0||p[0]>innerWidth||p[1]>innerHeight) return;
      const el=document.elementFromPoint(p[0],p[1]); if(!el||el===b||b.contains(el)) return;
      const o=el.closest?el.closest('[data-ind-clin],[data-ind-term],button,select,input,textarea,a'):null;
      if(o&&o!==b) n++; });
    return n; };
  R.enOtro = bs().filter(b=>enOtro(b)>0).length;
  const uno=bs()[0];
  if(uno){ try{ uno.click() }catch(e){} await esperar(500); }
  const on=bs().filter(b=>b.getAttribute('aria-pressed')==='true');
  R.marcados=on.length;
  R.marca = on.length ? (/^\\u2713/.test(String(on[0].textContent||'').trim())?'si':'NO') : '-';
  R.sinMarca = bs().filter(b=>/^\\u2713/.test(String(b.textContent||'').trim())).length;
  R.panelRec = cu ? (String(cu.textContent||'').indexOf('AHA/ACC 2024')>-1?'si':'NO') : '-';
  try{ const ov=document.getElementById('indic-overlay'); if(ov) ov.classList.remove('open') }catch(e){}
  await esperar(250);

  /* ── los invariantes P1 ── */
  R.scrollH = Math.max(0, document.documentElement.scrollWidth - innerWidth);
  R.pestanasConCaja = [...document.querySelectorAll('.tab-btn')].filter(t=>t.getBoundingClientRect().width>0).length;
  R.recortados = [...document.querySelectorAll('body *')].filter(e=>{
    if(e.children.length) return false;
    const t=String(e.textContent||'').trim(); if(!t) return false;
    const cs=getComputedStyle(e);
    if(cs.overflow!=='visible'||cs.display==='none') return false;
    return e.scrollWidth > e.clientWidth + 2; }).length;
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
    await pg.waitForTimeout(1800);
    try { OUT[k] = await pg.evaluate(MEDIR.replace('TEMA', JSON.stringify(tm))); }
    catch (e) { OUT[k] = {err: String(e).slice(0,140)}; }
    await pg.close(); await ctx.close();
  }
  await b.close();
}
const P=(s,n)=>String(s==null?'':s).padEnd(n).slice(0,n);
console.log(P('cruce',22)+P('btn',5)+P('btn44',8)+P('otro',5)+P('marca',6)+P('1sola',6)
  +P('globo',10)+P('dentro',7)+P('clau',5)+P('rot',4)+P('cita',5)
  +P('pplRec',7)+P('pplGui',7)+P('rotul',6)+P('resRec',7)+P('infCla',7)+P('scrH',5)+P('rec',4)+P('tabs',5));
for (const k of Object.keys(OUT)) { const r=OUT[k];
  if (r.err) { console.log(P(k,22)+'ERR '+r.err); continue }
  console.log(P(k,22)+P(r.nBtn,5)+P(r.btn44,8)+P(r.enOtro,5)+P(r.marca,6)+P(r.sinMarca,6)
    +P(r.globo,10)+P(r.globoDentro,7)+P(r.gClausula,5)+P(r.gRotulo,4)+P(r.gSinCita,5)
    +P(r.pplRec,7)+P(r.pplGuia,7)+P(r.pplRotulo,6)+P(r.resRec,7)+P(r.infClausula,7)
    +P(r.scrollH,5)+P(r.recortados,4)+P(r.pestanasConCaja,5)); }
console.log('');
const c0=OUT['chrome 1440px claro']||{}, w0=OUT['webkit 1440px claro']||{};
console.log('panel (chrome): '+c0.panel+'   (webkit): '+w0.panel);
console.log('globo (chrome): '+c0.globo+'   (webkit): '+w0.globo);
console.log('ERRORES de consola y de pagina: ' + (errs.length ? errs.length + '\n  ' + errs.slice(0,8).join('\n  ') : 'CERO'));
