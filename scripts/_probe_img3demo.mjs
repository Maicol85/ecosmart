#!/usr/bin/env node
/**
 * _probe_img3demo.mjs - compara el EMPAQUETADOR de la app contra el de la demo aprobada.
 *
 * La demo (docs/3d/demo_pdf_diagramas_tercios.html) trae su propia funcion `pack()`. Esta sonda
 * la corre en una pestania y corre `pdfDiagPack()` de la app en otra, con las MISMAS entradas,
 * y compara la estructura de franjas hoja por hoja. Es la comparacion obligatoria del punto 6:
 * si las dos logicas difieren, el papel no sigue la maqueta aprobada.
 *
 * MAPEO de claves: la demo usa contr/c3d/mitral/tavi/bicus/oai/fop/cia y la app
 * contr/lv3d/eteqx/tavi/vab/oai/cia. `fop` NO EXISTE en la app -no hay dibujo de FOP- y se
 * declara: los casos que lo incluyen se comparan sin el.
 *
 *   node scripts/_probe_img3demo.mjs [--out <json>]
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda, ni en sus comentarios.
 */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js','/tmp/pw/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
if(!_pw){console.log(JSON.stringify({error:'SIN PLAYWRIGHT'}));process.exit(2)}
const {chromium}=_pw; const fs=await import('fs');
const RAIZ='/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const APP=arg('--file')||(RAIZ+'/index.html');
const DEMO=RAIZ+'/docs/3d/demo_pdf_diagramas_tercios.html';
const OUTF=arg('--out')||'/tmp/img3_demo.json';

/* demo -> app */
const MAP={contr:'contr', c3d:'lv3d', mitral:'eteqx', tavi:'tavi', bicus:'vab', oai:'oai', cia:'cia'};

/* Los casos del punto 6, mas los bordes del emparejado. `fop` queda afuera por no existir. */
const CASOS=[
  {n:'(a) estudio del medico',       demo:['contr','mitral','tavi','oai'], img:0},
  {n:'(b) mitral+oai+bicus',         demo:['mitral','oai','bicus'],        img:0},
  {n:'(c) tavi+bicus (excluidos)',   demo:['tavi','bicus'],                img:0},
  {n:'(d) todos + 8 capturas',       demo:['contr','c3d','mitral','tavi','bicus','oai'], img:8},
  {n:'(e) solo 5 capturas',          demo:[],                              img:5},
  {n:'(f) nada',                     demo:[],                              img:0},
  {n:'g1 tavi+bicus+oai',            demo:['tavi','bicus','oai'],          img:0},
  {n:'g2 solo contr',                demo:['contr'],                       img:0},
  {n:'g3 contr + 1 captura',         demo:['contr'],                       img:1},
  {n:'g4 cinco medias',              demo:['c3d','mitral','tavi','bicus','oai'], img:0},
  {n:'g5 seis capturas sin diagrama',demo:[],                              img:6},
  {n:'g6 bicus+tavi invertido',      demo:['bicus','tavi'],                img:0}
];

/* La demo devuelve items {t:'row'|'img'|'sec', h, ids, full}. Se normaliza a la misma forma. */
const NORM_DEMO = `((C) => {
  const r = pack(C.demo, false, C.img);
  return { hojas: r.pages.map(p => p.map(it => ({
             t: it.t === 'img' ? 'cap' : 'diag', h: it.h, full: !!it.full,
             ids: (it.t === 'img') ? it.ids.map(()=> 'cap') : it.ids.slice()
           }))), notas: r.notes.length };
})(__C__)`;
const NORM_APP = `((C) => {
  const caps = []; for (let i = 0; i < C.img; i++) caps.push({ i: i, ampliada: false });
  const r = pdfDiagPack(C.claves, caps);
  return { hojas: r.hojas.map(p => p.map(it => ({
             t: it.t, h: it.h, full: !!it.full,
             ids: (it.t === 'cap') ? it.ids.map(()=> 'cap') : it.ids.slice()
           }))), notas: r.notas.length };
})(__C__)`;

const b=await chromium.launch({channel:'chrome'});
const OUT={demo:DEMO, app:APP, casos:[], iguales:0, distintos:0, _pageErr:[]};
try{
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const pD=await ctx.newPage(), pA=await ctx.newPage();
  pD.on('pageerror',e=>OUT._pageErr.push('demo: '+e.message.slice(0,120)));
  pA.on('pageerror',e=>OUT._pageErr.push('app: '+e.message.slice(0,120)));
  await pD.goto('file://'+DEMO,{waitUntil:'load',timeout:60000});
  await pA.goto('file://'+APP,{waitUntil:'load',timeout:180000});
  await pA.waitForTimeout(1500);
  OUT.hayPack = await pA.evaluate("typeof pdfDiagPack");
  OUT.hayPackDemo = await pD.evaluate("typeof pack");
  for(const C of CASOS){
    const claves=C.demo.map(k=>MAP[k]).filter(Boolean);
    let rd=null, ra=null, err=null;
    try{ rd=await pD.evaluate(NORM_DEMO.replace('__C__',JSON.stringify(C))) }
    catch(e){ err='demo: '+String(e).slice(0,140) }
    try{ ra=await pA.evaluate(NORM_APP.replace('__C__',JSON.stringify({claves:claves,img:C.img}))) }
    catch(e){ err=(err||'')+' app: '+String(e).slice(0,140) }
    if(!rd) err=(err||'')+' demo devolvio undefined';
    if(!ra) err=(err||'')+' app devolvio undefined';
    /* La demo ordena las medias por SU orden; para comparar se traducen sus ids. */
    const trad = h => h.map(f => f.map(it => ({...it, ids: it.ids.map(x => MAP[x] || x)})));
    const a = rd ? JSON.stringify(trad(rd.hojas)) : 'ERR';
    const c = ra ? JSON.stringify(ra.hojas) : 'ERR';
    /* DENOMINADOR: dos 'ERR' comparan iguales. Un caso sin las dos estructuras NO cuenta. */
    const ok = (a !== 'ERR') && (c !== 'ERR') && a === c;
    if(ok) OUT.iguales++; else OUT.distintos++;
    OUT.casos.push({ caso:C.n, hojasDemo: rd?rd.hojas.length:'-', hojasApp: ra?ra.hojas.length:'-',
                     igual: ok, notasDemo: rd?rd.notas:'-', notasApp: ra?ra.notas:'-',
                     demo: a.slice(0,700), app: c.slice(0,700), err: err||null });
    console.log((ok?'  = ':'  ≠ ')+C.n+'  demo '+(rd?rd.hojas.length:'-')+' hoja(s) / app '
      +(ra?ra.hojas.length:'-')+' hoja(s)'+(ok?'':'   <<< DISTINTO'));
  }
  await pD.close(); await pA.close(); await ctx.close();
}catch(e){OUT._err=String(e).slice(0,250)}
try{await b.close()}catch(e){}
fs.writeFileSync(OUTF,JSON.stringify(OUT,null,1));
console.log('iguales='+OUT.iguales+' distintos='+OUT.distintos+'  ('+OUTF+')');
if(OUT._pageErr.length) console.log('pageErr: '+JSON.stringify(OUT._pageErr));
