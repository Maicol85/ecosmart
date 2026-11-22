import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILE = process.argv[2]; const raiz = dirname(FILE), nom = FILE.slice(raiz.length+1);
const {srv,port}=await new Promise(res=>{const s=createServer(async(rq,rs)=>{try{const rel=decodeURIComponent(rq.url.split('?')[0]).replace(/^\/+/,'')||nom;const b=await readFile(join(raiz,rel));rs.writeHead(200,{'Content-Type':extname(rel)==='.html'?'text/html; charset=utf-8':'application/octet-stream'}).end(b);}catch{rs.writeHead(404).end('no');}});s.listen(0,'127.0.0.1',()=>res({srv:s,port:s.address().port}));});
const nav=await _pw.chromium.launch({channel:'chrome'});
const ctx=await nav.newContext({viewport:{width:1440,height:900}});
const pg=await ctx.newPage();
pg.on('pageerror',e=>console.log('PAGEERR',String(e.message).slice(0,160)));
await pg.goto('http://127.0.0.1:'+port+'/'+nom,{waitUntil:'load'});
await pg.waitForTimeout(1400);
await pg.evaluate(()=>{const o=document.getElementById('login-overlay');if(o)o.style.display='none';});
const r = await pg.evaluate(async () => {
  const esp=ms=>new Promise(r=>setTimeout(r,ms));
  const jpg=new Uint8Array([255,216,255,217]);
  const R2D={ux:3,uy:3,dx:0.05,dy:0.05,x0:0,y0:0,x1:600,y1:500,tipo:1};
  try{ if(typeof __t==='object'&&__t&&__t.limpiar) __t.limpiar(); }catch(e){}
  try{ imgVaciar(); }catch(e){}
  _cineAbrir([{nombre:'A',cuadros:4,d:{frags:[jpg,jpg,jpg,jpg],cols:600,filas:500,msCuadro:40,regiones:[R2D]}}]);
  await esp(520);
  if(!_vistaA.medOn) document.getElementById('cine-medir').click();
  await esp(340);
  _vCon(_vistaA, ()=>medHerramienta('simpson'));
  await esp(260);
  const o={};
  const cv=document.getElementById('cine-med');
  const pint=()=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=3;i<d.length;i+=4) if(d[i]>8)n++;return n;};
  o.sesion=!!_simp;
  if(!_simp) return o;
  const pts=[];for(let i=0;i<14;i++) pts.push({x:150+i*20,y:120+(i%4)*30});
  const tr={pts:pts,eje:{M:{x:150,y:120},apex:{x:300,y:420},ux:0.4,uy:0.9,L:300},
            diam:new Array(20).fill(40),vol:60,imagen:'fix',diamCm:new Array(20).fill(2),Lcm:6};
  // fase sistole con la diastole YA confirmada: el caso del medico
  _simp.pares[_simp.vista].d = tr; _simp.fase='s'; _simp.pendiente=null; _simp.ocultar=false;
  _medPintar(); await esp(140);
  o.conDiastoleConfirmada_fase_s = pint();
  // control POSITIVO: un pendiente SI se dibuja
  _simp.pendiente = tr; _medPintar(); await esp(140);
  o.conPendiente = pint();
  _simp.pendiente = null; _medPintar(); await esp(140);
  o.sinPendiente = pint();
  // y lo confirmado SIGUE guardado y contando
  o.paresGuardados = _simp.pares.reduce((n,p)=>n+(p.d?1:0)+(p.s?1:0),0);
  o.res = _simp.res ? (_simp.res.fevi||null) : null;
  return o;
});
console.log(JSON.stringify(r,null,1));
await nav.close(); srv.close(); process.exit(0);
