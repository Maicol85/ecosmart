#!/usr/bin/env node
/* A/B byte por byte del resultado BINARIO de la ET en los bordes de los tres cortes y sus
   combinaciones. Compara HEAD contra el arbol vivo: si UNA combinacion difiere, la tanda se
   revierte. Solo lectura; no toca index.html. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = dirname(dirname(fileURLToPath(import.meta.url))) === '/' ? process.cwd() : process.cwd();
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i+1] : null; };
const FARG = arg('--file') || 'index.html';
const EXTERNO = isAbsolute(FARG);
const FILE = EXTERNO ? '__ab__' + basename(FARG) : FARG;
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' };
const srvP = await new Promise((res) => {
  const srv = createServer(async (req, rq) => {
    try { const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || FILE;
      const p = (EXTERNO && rel === FILE) ? FARG : join(RAIZ, rel);
      const buf = await readFile(p);
      rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
    } catch { rq.writeHead(404).end('no'); }
  });
  srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
});
const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-ab-'));
const BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const proc = spawn(BIN, ['--headless=new','--remote-debugging-port=0',`--user-data-dir=${perfil}`,
  '--no-first-run','--no-default-browser-check','--disable-extensions','--window-size=1280,1000',
  `http://127.0.0.1:${srvP.port}/${FILE}`], { stdio:['ignore','ignore','pipe'] });
const wsUrl = await new Promise((res,rej)=>{ const t=setTimeout(()=>rej(new Error('timeout')),20000);
  let acc=''; proc.stderr.on('data',d=>{acc+=d; const m=acc.match(/ws:\/\/[^\s]+/); if(m){clearTimeout(t);res(m[0]);}}); });
const cdp = await new Promise((res,rej)=>{ const ws=new WebSocket(wsUrl); let id=0; const pend=new Map();
  ws.addEventListener('open',()=>res({ send:(m,p={},s)=>new Promise((ok,no)=>{ const msg={id:++id,method:m,params:p};
    if(s)msg.sessionId=s; pend.set(msg.id,{ok,no}); ws.send(JSON.stringify(msg)); }), close:()=>ws.close() }));
  ws.addEventListener('error',rej);
  ws.addEventListener('message',e=>{ const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){ const{ok,no}=pend.get(m.id);
    pend.delete(m.id); m.error?no(new Error(m.error.message)):ok(m.result); } }); });
const { targetInfos } = await cdp.send('Target.getTargets');
const t = targetInfos.find(x=>x.type==='page'&&x.url.includes('127.0.0.1'));
const { sessionId } = await cdp.send('Target.attachToTarget',{targetId:t.targetId,flatten:true});
await cdp.send('Runtime.enable',{},sessionId);
const ev = async (e) => { const r = await cdp.send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true},sessionId);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description||'exc'); return r.result.value; };
for (let i=0;i<60;i++){ try { if (await ev('typeof etEstado==="function" && typeof calcET==="function"')) break; } catch {} await new Promise(r=>setTimeout(r,500)); }

/* GRID de bordes. Gradiente 4,9/5/5,1 · THP 189/190/191 · area 0,99/1,0/1,01 via sus insumos.
   El area se fabrica con Diam. TSVD y VTI TSVD fijos y el VTI diastolico resuelto para dar el
   area exacta: area = PI*(D/20)^2*VTItsvd / VTIdiast  =>  VTIdiast = PI*(D/20)^2*VTItsvd / area */
const out = await ev(`(function(){
  var GM  = ['', '4.9', '5', '5.1', '45'];        /* el 45 esta FUERA de banda (0-40) */
  var THP = ['', '189', '190', '191', '500'];     /* el 500 esta FUERA de banda (50-400) */
  var AVT = ['', '0.99', '1', '1.01'];
  var D = 26, VT = 14;                            /* insumos fijos del numerador */
  var vtiDiastPara = function(area){
    if (area === '') return '';
    return (Math.PI * Math.pow(D/20, 2) * VT / parseFloat(area)).toFixed(6); };
  var set = function(id, v){ var e = document.getElementById(id); if (!e) return;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); };
  var res = [];
  GM.forEach(function(gm){ THP.forEach(function(thp){ AVT.forEach(function(av){
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    try { ['esten'].forEach(function(tp){ if (pillOn('tricuspide',tp)) toggleValvPill('tricuspide',tp); });
      localStorage.removeItem('valv-pill-esten-tricuspide');
      if (window.VALV_ESTEN_AUTO) window.VALV_ESTEN_AUTO.delete('tricuspide'); } catch(e) {}
    if (gm !== '')  set('et_gmedio', gm);
    if (thp !== '') set('et_thp', thp);
    if (av !== '')  { set('et_vti_diast', vtiDiastPara(av)); set('tsvd_diametro', D); set('vti_tsvd', VT); }
    var r = etEstado();
    res.push([gm, thp, av,
      /* EL RESULTADO BINARIO y sus tres criterios: lo que la tanda no puede mover. */
      r.signif ? 1 : 0, r.cGm ? 1 : 0, r.cThp ? 1 : 0, r.cAvt ? 1 : 0,
      r.avt === null ? 'null' : r.avt.toFixed(2),
      r.hayDatos ? 1 : 0, r.fuera.join('+'),
      (typeof etGradoCalculado === 'function') ? String(etGradoCalculado()) : 'SIN',
      (document.getElementById('et_grado')||{}).value,
      (document.getElementById('et-sev')||{}).textContent.trim(),
      /* EL INFORME Y EL EN SUMA, que es la condicion 2: la leyenda nueva es de PANTALLA y las
         superficies firmadas tienen que seguir declarando el fuera de rango como en HEAD. Se
         guardan SOLO las frases de la tricuspide, para que el diff senale la valvula y no el
         parrafo entero de otro modulo. */
      (function(){
        try { generarInforme() } catch(e) { return 'EXC' }
        var inf = (document.getElementById('informe_texto')||{}).value || '';
        /* ⚠️ LOS REGEX SE CONSTRUYEN CON RegExp Y NO CON LITERALES. En un template literal el
           \\s de un /\\s+/ se colapsa al caracter "s", asi que el regex quedaba /s+/g y
           reemplazaba todas las ESES del informe por espacios: «Estudio sin alteraciones» salia
           «E tudio  in alteracione ». El md5 del A/B seguia siendo valido —los dos lados tenian
           el mismo defecto— pero el texto era ilegible y el filtro de frases no acertaba una. */
        var reBlanco = new RegExp('[ ' + String.fromCharCode(9, 10, 13) + ']+', 'g');
        var reCorte  = new RegExp('(?<=\\.)[ ' + String.fromCharCode(10) + ']+');
        var reVT     = new RegExp('tric[' + String.fromCharCode(250, 117) + ']sp|\\bET\\b|\\bVT\\b', 'i');
        var ors = inf.split(reCorte);
        return ors.filter(function(o){ return reVT.test(o) }).join(' ~~ ').replace(reBlanco, ' ').trim();
      })(),
      (function(){
        var reBlanco = new RegExp('[ ' + String.fromCharCode(9, 10, 13) + ']+', 'g');
        return ((document.getElementById('en_suma')||{}).value || '').replace(reBlanco, ' ').trim();
      })()
    ].join('|'));
  }); }); });
  return res.join('\\n');
})()`);
console.log(out);
cdp.close(); proc.kill(); srvP.srv.close();
try { await rm(perfil,{recursive:true,force:true}); } catch {}
process.exit(0);
