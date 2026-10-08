#!/usr/bin/env node
/* _e5b0_medir.mjs — SOLO LECTURA. Mide el comportamiento del aviso rojo/cajon al apagar el boton
 * (regla 8) y el estado del boton frente al Doppler, sobre el archivo que se pase con --file.
 * No muta nada. Uso: node scripts/_e5b0_medir.mjs --file index.html */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/* ⚠️ EL ARBOL DE CHROME NO SE CIERRA CON `proc.kill()`, Y ASI SE JUNTARON 70 PROCESOS (2026-10-08).
   `proc.kill()` manda SIGTERM al proceso que lanzamos; Chrome arranca media docena de hijos
   (zygote, gpu, renderers) que NO son hijos nuestros, asi que sobreviven al padre y quedan
   HUERFANOS (ppid = 1) reteniendo su perfil. El camino de FALLO era peor: el
   `main().catch(... process.exit(1))` de las sondas no mataba nada, y el timeout de 20 s de
   `abrirChrome` tampoco. Medido antes de este arreglo: 10 Chrome huerfanos con 60 hijos y 1075
   perfiles temporales sin borrar, 2,9 GB en $TMPDIR.
   Tres piezas, ninguna decorativa:
     1. `detached: true` en el spawn, que hace a Chrome LIDER DE SU PROPIO GRUPO de procesos. Sin
        eso, matar un grupo se llevaria al script mismo;
     2. un barrido que mata el GRUPO (`process.kill(-pid)`) y no solo al padre, asi que alcanza a
        los hijos que Chrome creo por su cuenta;
     3. el barrido colgado de `exit` ADEMAS de las senales, porque el `process.exit(1)` del camino
        de fallo y el `process.exit(0)` del camino feliz NO disparan SIGINT ni SIGTERM — pero si
        disparan `exit`. De ahi que el borrado del perfil use `rmSync`: en `exit` ya no corre nada
        asincrono, y un `await rm(...)` ahi se descarta en silencio.
   ⚠️ SOLO PIDs PROPIOS, NUNCA POR NOMBRE. El registro guarda unicamente lo que lanzo ESTE
   proceso. Un `pkill`/`killall` por patron se lleva el Chrome del usuario y la corrida del de al
   lado — en este repo ya hay una leccion escrita sobre un `pkill` que mato la corrida en curso. */
const _ARNES_VIVOS = new Set();
let _arnesLimpiezaArmada = false;
function _arnesCerrarAlSalir(proc, perfil) {
  if (!proc || !proc.pid) return;
  _ARNES_VIVOS.add({ pid: proc.pid, perfil: perfil });
  if (_arnesLimpiezaArmada) return;
  _arnesLimpiezaArmada = true;
  const barrer = () => {
    for (const v of _ARNES_VIVOS) {
      /* El grupo primero. Si ya no existe, `kill` tira ESRCH y se ignora — el barrido es
         idempotente a proposito, porque los cierres del camino feliz ya llamaron a `proc.kill()`
         antes de llegar aca. El fallback al pid pelado cubre que `detached` no haya podido crear
         el grupo. */
      try { process.kill(-v.pid, 'SIGKILL'); }
      catch (e) { try { process.kill(v.pid, 'SIGKILL'); } catch (e2) {} }
      if (v.perfil) { try { rmSync(v.perfil, { recursive: true, force: true }); } catch (e) {} }
    }
    _ARNES_VIVOS.clear();
  };
  process.on('exit', barrer);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(sig, () => { barrer(); process.exit(130); });
  }
}

const RAIZ = (p=>p.slice(0,p.lastIndexOf('/scripts')))(fileURLToPath(import.meta.url));
const arg = n => { const i = process.argv.indexOf(n); return i>0?process.argv[i+1]:null; };
const FILE = resolve(arg('--file') || join(RAIZ,'index.html'));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
function servir(){return new Promise(res=>{const srv=createServer(async(rq,rs)=>{try{const u=decodeURIComponent(rq.url.split('?')[0]);if(u==='/'||u==='/index.html'){const b=await readFile(FILE);rs.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}).end(b);return;}const p=join(RAIZ,u.replace(/^\/+/,''));const b=await readFile(p);rs.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}).end(b);}catch{rs.writeHead(404).end('no');}});srv.listen(0,'127.0.0.1',()=>res({srv,port:srv.address().port}));});}
async function chrome(url){const perfil=await mkdtemp(join(tmpdir(),'e5bm-'));const proc=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-port=0',`--user-data-dir=${perfil}`,'--no-first-run','--disable-extensions',url],{stdio:['ignore','ignore','pipe'],detached:true});const wsUrl=await new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('to')),20000);let a='';proc.stderr.on('data',d=>{a+=d;const m=a.match(/ws:\/\/[^\s]+/);if(m){clearTimeout(t);ok(m[0]);}});});_arnesCerrarAlSalir(proc,perfil);return{proc,perfil,wsUrl};}
function conectar(u){return new Promise((res,rej)=>{const ws=new WebSocket(u);let id=0;const p=new Map();ws.addEventListener('open',()=>res({send:(m,pr={},s)=>new Promise((ok,no)=>{const g={id:++id,method:m,params:pr};if(s)g.sessionId=s;p.set(g.id,{ok,no});ws.send(JSON.stringify(g));}),close:()=>ws.close()}));ws.addEventListener('error',rej);ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&p.has(m.id)){const{ok,no}=p.get(m.id);p.delete(m.id);m.error?no(new Error(m.error.message)):ok(m.result);}});});}
const INJ = `
  window.__g=function(id){var e=document.getElementById(id);return e?String(e.value):null;};
  window.__txt=function(id){var e=document.getElementById(id);return e?e.textContent.trim().replace(/\\s+/g,' '):null;};
  window.__set=function(id,v){var e=document.getElementById(id);if(!e)return 'NO '+id;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 1;};
  window.__on=function(valv,tipo){return (typeof pillOn==='function')?pillOn(valv,tipo)===true:null;};
  window.__vis=function(id){var n=document.getElementById(id);if(!n)return null;while(n&&n.nodeType===1){if(getComputedStyle(n).display==='none')return false;n=n.parentNode;}return true;};
  window.__den=function(valv){try{showTab('valvulas');}catch(e){}var k='valv-'+valv;var s=document.getElementById('ete-seccion-'+k);if(s&&s.style.display==='none'){try{toggleEteSeccion(k);}catch(e){}}return 1;};
  window.__reset=function(){try{limpiarCampos(true);}catch(e){}window.esqSevManual={};window._sevCalcAlFijar={};window._iaGradoCalc=null;window._imGradoCalc=null;try{if(typeof _sevManualSync==='function')_sevManualSync();}catch(e){}['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){['esten','insuf'].forEach(function(t){try{localStorage.removeItem('valv-pill-'+t+'-'+v);}catch(e){}var p=document.getElementById('pill-'+t+'-'+v);if(p&&p.classList.contains('btn-primary'))p.click();});});return 1;};
  window.__clickPill=function(valv,tipo){var p=document.getElementById('pill-'+tipo+'-'+valv);if(!p)return 'NO pill';p.click();return 1;};
  window.__menu=function(valv,tipo){var sb=document.getElementById('sevbtn-'+tipo+'-'+valv);if(!sb)return ['NO sevbtn'];sb.click();var m=document.getElementById('sevmenu-'+tipo+'-'+valv);if(!m)return ['NO menu'];var r=Array.from(m.querySelectorAll('button')).map(function(x){return x.textContent.trim();});return r;};
  window.__clickMenu=function(valv,tipo,etq){var sb=document.getElementById('sevbtn-'+tipo+'-'+valv);if(!sb)return 'NO sevbtn';sb.click();var m=document.getElementById('sevmenu-'+tipo+'-'+valv);if(!m)return 'NO menu';var b=Array.from(m.querySelectorAll('button')).find(function(x){return x.textContent.trim()===etq;});if(!b)return 'NO item '+etq;b.click();return 1;};
  window.__foto=function(valv,tipo){var C=(window.SEV_SINC&&Object.values(window.SEV_SINC).find(function(c){return c.valv===valv&&c.tipo===tipo;}))||null;var sel=C?C.select:((tipo==='esten')?({aortica:'ea_grado',mitral:'em_grado',tricuspide:'et_grado',pulmonar:'ep_grado'})[valv]:({aortica:'ia_sev_final',mitral:'im_sev_final',tricuspide:'it_grado',pulmonar:'ip_grado'})[valv]);var avisoId=C?C.aviso:null;var fundId=C?C.fundamento:null;var wrap=(tipo==='insuf')?('gf-insuf-'+valv):('bloque-esten-'+valv);return {reg:!!C,pill:window.__on(valv,tipo),grado:window.__g(sel),aviso:avisoId?window.__txt(avisoId):'(no node)',cajon:fundId?window.__vis(fundId):'(no node)',past:window.__txt('sevbtn-'+tipo+'-'+valv),disc:(typeof sevDiscrepa==='function'&&C)?(function(){try{return sevDiscrepa(Object.keys(window.SEV_SINC).find(function(k){return window.SEV_SINC[k].valv===valv&&window.SEV_SINC[k].tipo===tipo;}));}catch(e){return 'ERR';}})():null};};
`;
const LES = [
  { valv:'aortica', tipo:'esten', med:[['vmax_ao','4.2'],['gmedio_ao','45']], sin:'Sin estenosis' },
  { valv:'aortica', tipo:'insuf', med:[['ia_vc','7']], sin:'Sin insuficiencia' },
  { valv:'mitral', tipo:'esten', med:[['avm_plan','1.2']], sin:'Sin estenosis' },
  { valv:'mitral', tipo:'insuf', med:[['im_vc','8']], sin:'Sin insuficiencia' },
  { valv:'tricuspide', tipo:'esten', med:[['et_gmedio','7']], sin:'Sin estenosis' },
  { valv:'tricuspide', tipo:'insuf', med:[['vmax_it','4']], sin:'Sin insuficiencia' },
  { valv:'pulmonar', tipo:'esten', med:[['vp_vmax','4']], sin:'Sin estenosis' },
  { valv:'pulmonar', tipo:'insuf', med:[['ip_vmax','3']], sin:'Sin insuficiencia' },
];
let sv,chr;try{const s=await servir();sv=s.srv;chr=await chrome(`http://127.0.0.1:${s.port}/index.html`);const cdp=await conectar(chr.wsUrl);const{targetInfos}=await cdp.send('Target.getTargets');const pg=targetInfos.find(t=>t.type==='page');const{sessionId}=await cdp.send('Target.attachToTarget',{targetId:pg.targetId,flatten:true});await cdp.send('Runtime.enable',{},sessionId);const ev=async x=>{const r=await cdp.send('Runtime.evaluate',{expression:`(function(){${x}})()`,returnByValue:true,awaitPromise:true},sessionId);if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description);return r.result.value;};
await ev(`try{sessionStorage.setItem('ett_auth','1');}catch(e){}location.reload();return 1;`);for(let i=0;i<80;i++){await new Promise(r=>setTimeout(r,250));if(await ev(`return typeof showTab==='function'&&typeof pillOn==='function';`).catch(()=>false))break;}
await ev(`try{cerrarAvisoEco();}catch(e){}return 1;`);await ev(INJ+' return 1;');
const out={file:FILE, P1:[], P2:null, P4:[]};
for(const L of LES){
  const base=`__reset();__den(${JSON.stringify(L.valv)});${L.med.map(p=>`__set(${JSON.stringify(p[0])},${JSON.stringify(p[1])});`).join('')}`;
  // A) tras prender
  const stON = await ev(`${base}if(!__on(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)}))__clickPill(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});return __foto(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});`);
  // menu items disponibles
  const items = await ev(`${base}return __menu(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});`);
  // B) apagar con click
  const stApagar = await ev(`${base}if(!__on(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)}))__clickPill(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});__clickPill(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});return __foto(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});`);
  // C) elegir «Sin» por el menu (si existe)
  const sinDisp = Array.isArray(items) && items.indexOf(L.sin)>-1;
  let stSin=null;
  if(sinDisp){ stSin = await ev(`${base}if(!__on(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)}))__clickPill(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});__clickMenu(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)},${JSON.stringify(L.sin)});return __foto(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});`); }
  out.P1.push({ lesion:L.valv+'/'+L.tipo, menu:items, sinDisponible:sinDisp, stON, stApagar, stSin });
  // P4: apagar y despues cambiar el Doppler -> reprende?
  if(L.tipo==='esten' || L.valv==='tricuspide' || L.valv==='pulmonar'){
    const cambio = L.med[0][0]; const nuevo = String(parseFloat(L.med[0][1])+0.3);
    const p4 = await ev(`${base}if(!__on(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)}))__clickPill(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});__clickPill(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});var apag=__on(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)});__set(${JSON.stringify(cambio)},${JSON.stringify(nuevo)});__den(${JSON.stringify(L.valv)});return {trasApagar:apag, trasCambiarDato:__on(${JSON.stringify(L.valv)},${JSON.stringify(L.tipo)})};`);
    out.P4.push({ lesion:L.valv+'/'+L.tipo, ...p4 });
  }
}
// P2: mitral EM manual Severa con AVm 4.00 + THP 55 (calculo no-severo)
out.P2 = await ev(`__reset();__den('mitral');__set('avm_plan','4.0');var thp=document.getElementById('avm_thp')||document.getElementById('em_thp')||document.getElementById('thp_mitral');var thpId=thp?thp.id:'(no THP field)';if(thp){thp.value='55';thp.dispatchEvent(new Event('input',{bubbles:true}));thp.dispatchEvent(new Event('change',{bubbles:true}));}
  if(!__on('mitral','esten'))__clickPill('mitral','esten');
  var items=__menu('mitral','esten');
  var calc=(typeof sevCalcPublicable==='function')?String(sevCalcPublicable('em')):'(no fn)';
  var cat=(typeof emCategoria==='function')?(function(){try{return emCategoria().clave;}catch(e){return 'ERR';}})():'(no fn)';
  // elegir Severa a mano por el menu
  if(items.indexOf('Severa')>-1)__clickMenu('mitral','esten','Severa');
  return {thpId:thpId, calcPublicable:calc, categoria:cat, foto:__foto('mitral','esten'), badge:__txt('em-sev')};`);
console.log(JSON.stringify(out,null,1));
cdp.close();}catch(e){console.error('H '+e.message);process.exitCode=2;}finally{if(sv)sv.close();if(chr){try{chr.proc.kill();}catch{}try{await rm(chr.perfil,{recursive:true,force:true});}catch{}}process.exit(process.exitCode||0);}
