#!/usr/bin/env node
/* A/B byte por byte del GRADO de la IT en los bordes de la vena contracta, la EROA y el volumen
   regurgitante, y sus combinaciones. Compara HEAD contra el arbol vivo. Solo lectura. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
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
const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-abit-'));
const BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const proc = spawn(BIN, ['--headless=new','--remote-debugging-port=0',`--user-data-dir=${perfil}`,
  '--no-first-run','--no-default-browser-check','--disable-extensions','--window-size=1280,1000',
  `http://127.0.0.1:${srvP.port}/${FILE}`], { stdio:['ignore','ignore','pipe'], detached: true });
_arnesCerrarAlSalir(proc, perfil);
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
for (let i=0;i<60;i++){ try { if (await ev('typeof calcIT_ESC==="function" && typeof generarInforme==="function" && typeof _labExcelRow==="function"')) break; } catch {} await new Promise(r=>setTimeout(r,500)); }

/* ══ GRID DE BORDES ═════════════════════════════════════════════════════════════════════════════
   VENA CONTRACTA en 2,9 / 3,0 / 6,9 / 6,99 / 7,0 / 7,1 —los seis que pidio Maicol— mas el vacio
   y un 9 de control, por los DOS lados de cada corte.
   EROA y VOLUMEN REGURGITANTE se fabrican con sus insumos REALES, que es como los carga el
   medico: eroa(mm2) = 2*PI*(pisaR/10)^2 * pisaVal / vmaxCW, con pisaR en mm, pisaVal en cm/s y
   vmaxCW en m/s. Con pisaR 10 y vmaxCW 3 queda eroa = 2,0944 * pisaVal, asi que el pisaVal sale
   despejado para caer EXACTO en cada borde tras el .toFixed(1) que aplica el codigo.
   volR = eroa/100 * vtiIT, tambien con .toFixed(1): el vtiIT se despeja igual.
   ⚠️ LOS DOS SE COMPARAN COMO CADENAS COERCIONADAS, que es lo que hace el codigo: el grid no
   normaliza nada, para que el A/B mida la aritmetica real y no una reescrita. */
const out = await ev(`(function(){
  var VC = ['', '2.9', '3', '6.9', '6.99', '7', '7.1', '9'];
  /* Presets de (pisaR, pisaVal, vmaxCW, vtiIT) -> (eroa, volR) en cada banda y en cada borde.
     El tercer campo es el nombre, para que el diff diga la escena y no una tupla. */
  var P = [
    ['sin-pisa',      null, null, null, null],
    ['eroa19.9-leve',  10, 9.50, 3, 150],   /* eroa 19.9 (leve)      · volR 29.9 (leve)   */
    ['eroa20.0-borde', 10, 9.55, 3, 150],   /* eroa 20.0 (moderada)  · volR 30.0 (borde)  */
    ['eroa39.8-mod',   10, 19.0, 3, 112],   /* eroa 39.8 (moderada)  · volR 44.6 (mod)    */
    ['eroa40.0-borde', 10, 19.1, 3, 113],   /* eroa 40.0 (severa)    · volR 45.2 (severa) */
    ['volR-borde45',   10, 9.55, 3, 225]    /* eroa 20.0 (moderada)  · volR 45.0 (borde)  */
  ];
  var DENS = ['', 'moderado'];
  var set = function(id, v){ var e = document.getElementById(id); if (!e) return;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); };
  var txt = function(id){ var e = document.getElementById(id);
    return e ? (e.textContent||'').replace(new RegExp('[ ' + String.fromCharCode(9,10,13) + ']+','g'),' ').trim() : 'NO'; };
  var res = [];
  VC.forEach(function(vc){ P.forEach(function(pr){ DENS.forEach(function(dn){
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {}; window._itGradoCalc = null;
    try { ['insuf'].forEach(function(t){ if (pillOn('tricuspide',t)) toggleValvPill('tricuspide',t); });
      localStorage.removeItem('valv-pill-insuf-tricuspide'); } catch(e) {}
    if (vc !== '') set('it_vc', vc);
    if (pr[1] !== null) { set('it_pisa_r', pr[1]); set('it_pisa_val', pr[2]);
                          set('it_vmax_cw', pr[3]); set('it_vti', pr[4]); }
    if (dn !== '') set('it_densidad', dn);
    try { calcIT_ESC(); } catch(e) {}
    /* EL GRADO Y LAS CUATRO SUPERFICIES. Lo que la tanda no puede mover. */
    var inf = '';
    try { generarInforme(); inf = (document.getElementById('informe_texto')||{}).value || ''; } catch(e) { inf = 'EXC'; }
    var reCorte = new RegExp('(?<=\\\\.)[ ' + String.fromCharCode(10) + ']+');
    var reVT = new RegExp('tric[' + String.fromCharCode(250,117) + ']sp|\\\\bIT\\\\b', 'i');
    var frases = inf.split(reCorte).filter(function(o){ return reVT.test(o) }).join(' ~~ ')
                    .replace(new RegExp('[ ' + String.fromCharCode(9,10,13) + ']+','g'),' ').trim();
    var xls = 'NO';
    try {
      var campos = {};
      document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){ campos[el.id] = el.value; });
      var row = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-07', campos: campos });
      xls = Object.keys(row).length + ';' + row['IT grado'] + ';' + row['VC IT (mm)'];
    } catch(e) { xls = 'EXC'; }
    res.push([vc, pr[0], dn,
      (document.getElementById('it_grado')||{}).value,
      String(window._itGradoCalc),
      txt('it-sev'), txt('it-eroa'), txt('it-volr'), txt('it-ref-vc'), txt('it-discordancia'),
      (typeof pillOn === 'function' && pillOn('tricuspide','insuf')) ? 1 : 0,
      frases,
      ((document.getElementById('en_suma')||{}).value || '').replace(new RegExp('[ ' + String.fromCharCode(9,10,13) + ']+','g'),' ').trim(),
      xls,
      (typeof _pptSel === 'function') ? String(_pptSel('it_grado')) : 'NO'
    ].join('|'));
  }); }); });
  return res.join('\\n');
})()`);
console.log(out);
cdp.close(); proc.kill(); srvP.srv.close();
try { await rm(perfil,{recursive:true,force:true}); } catch {}
process.exit(0);
