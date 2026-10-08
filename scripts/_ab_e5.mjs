#!/usr/bin/env node
/**
 * _ab_e5.mjs — sonda TEMPORAL de la etapa E5 (botones/pastillas de la pulmonar).
 *
 * A/B de las 434 columnas de exportación (`_labExcelRow`) + los tres estilos del informe + EN SUMA,
 * para un conjunto de escenas, sobre el ARCHIVO que se le pase con `--file`. Así se corre contra el
 * index actual y contra el snapshot de HEAD (E4) sin swapear `index.html` — se sirve el archivo
 * pedido para `/` y `/index.html`, el resto (CDN) sale a la red como en test_clinico.
 *
 * Uso:  node scripts/_ab_e5.mjs --file index.html            > /tmp/e5_cur.json
 *       node scripts/_ab_e5.mjs --file /ruta/index.orig.html > /tmp/e5_orig.json
 *
 * NO muta ningún archivo. Infra copiada de scripts/_probe_singrado.mjs (misma razón que ahí).
 * OJO: el cuerpo de SONDA es template literal — sin acentos graves adentro.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, resolve } from 'node:path';
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


const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const arg  = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const FILE = resolve(arg('--file') || join(RAIZ, 'index.html'));
const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };
function servir() {
  return new Promise((res) => {
    const srv = createServer(async (req, rq) => {
      try {
        const url = decodeURIComponent(req.url.split('?')[0]);
        // Todo lo que pida la página como documento se sirve del FILE pedido.
        if (url === '/' || url === '/index.html') {
          const buf = await readFile(FILE);
          rq.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(buf);
          return;
        }
        const p = join(RAIZ, url.replace(/^\/+/, ''));
        if (!p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}
async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-abe5-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'], detached: true });
  _arnesCerrarAlSalir(proc, perfil);
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome no respondio en 20 s')), 20000);
    let acc = '';
    proc.stderr.on('data', (d) => {
      acc += d.toString();
      const m = acc.match(/ws:\/\/[^\s]+/);
      if (m) { clearTimeout(t); res(m[0]); }
    });
  });
  return { proc, perfil, wsUrl };
}
function conectar(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0; const pend = new Map();
    ws.addEventListener('open', () => res({
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}

const SONDA = `
window.__p = {
  set(id, val) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val; e.dispatchEvent(new Event('input', {bubbles:true}));
    e.dispatchEvent(new Event('change', {bubbles:true})); return 1; },
  grado(id, val) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val; return String(e.value); },
  pill(valv, tipo, on) { const b = document.getElementById('pill-' + tipo + '-' + valv);
    if (!b) return 'NO EXISTE pill-' + tipo + '-' + valv;
    b.classList.toggle('btn-primary', !!on); b.classList.toggle('btn-ghost', !on);
    const bl = document.getElementById('bloque-' + tipo + '-' + valv);
    if (bl) bl.style.display = on ? 'block' : 'none';
    return window.pillOn(valv, tipo) === !!on ? 1 : 'NO QUEDO'; },
  manual(obj) { window.esqSevManual = obj || {};
    const h = document.getElementById('sev_manual');
    if (h) h.value = JSON.stringify(window.esqSevManual);
    return JSON.stringify(window.esqSevManual); },
  limpiar() { try { limpiarCampos(true); } catch(e) {} window.esqSevManual = {};
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){ try { window.__p.pill(v,t,false); } catch(e){} }); });
    try { localStorage.removeItem('valv-pill-insuf-pulmonar'); localStorage.removeItem('valv-pill-esten-pulmonar'); } catch(e){}
    return 1; },
  tresEstilos() {
    const out = {};
    ['conciso','estandar','narrativo'].forEach(function(st){
      try { setEstiloInforme(st); } catch(e) {}
      generarInforme();
      out[st] = (document.getElementById('informe_texto')||{}).value || '';
    });
    out.suma = (document.getElementById('en_suma')||{}).value || '';
    try { setEstiloInforme('estandar'); } catch(e) {}
    return out;
  },
  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    const campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return; } catch(e){}
      campos[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0'; });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-03', campos: campos }); }
    catch(e) { return 'EXC: ' + e.message; }
  },
  escena(cfg) {
    window.__p.limpiar();
    (cfg.campos || []).forEach(function(p){ window.__p.set(p[0], p[1]); });
    (cfg.grados || []).forEach(function(p){ window.__p.grado(p[0], p[1]); });
    (cfg.pills  || []).forEach(function(p){ window.__p.pill(p[0], p[1], p[2]); });
    if (cfg.manual !== null) window.__p.manual(cfg.manual || {});
    (cfg.aplicar || []).forEach(function(t){ try { window.valvSev.aplicar(t[0],t[1],t[2]); } catch(e){} });
    const r = window.__p.tresEstilos();
    r.id = cfg.id; r.desc = cfg.desc;
    r.excel = window.__p.excel();
    r.pills_pulmonar = ['esten-pulmonar','insuf-pulmonar'].map(function(k){
      const b=document.getElementById('pill-'+k); return k+'='+(b && b.classList.contains('btn-primary')?1:0); }).join(',');
    return r;
  },
  val(id) { const e = document.getElementById(id); return e ? e.value : null }
};
`;

// ── Escenas ───────────────────────────────────────────────────────────────────────────────────
// Regresión (R-*): deben salir IDÉNTICAS orig vs current. New-behavior (N-*): documentan E5.
const ESCENAS = [
  // Estudio vacío — control de denominador.
  { id:'R-vacio', desc:'estudio vacio' },
  // EP por grado (sin eventos, sin pill): epHay lee el grado → identico.
  { id:'R-ep-grado-sev', desc:'ep_grado Severa por .value', grados:[['ep_grado','Severa']] },
  { id:'R-ep-grado-leve', desc:'ep_grado Leve por .value', grados:[['ep_grado','Leve']] },
  // IP por grado: ipHayInsuf lee el grado → identico.
  { id:'R-ip-grado-mod', desc:'ip_grado Moderada por .value', grados:[['ip_grado','Moderada']] },
  // EP por velocidad (eventos → calcVP autograda ep_grado): identico (calcVP escribe el grado en ambos).
  { id:'R-ep-vel', desc:'vp_vmax 4.5 → calcVP autograda', campos:[['vp_vmax','4.5']] },
  // IP por velocidad (eventos → calcIP; en current el trigger prende el pill, pero hayIP ya es true por velocidad).
  { id:'R-ip-vel', desc:'ip_vmax 3.0 + pmad 5 → calcIP', campos:[['pmad','5'],['ip_vmax','3.0']] },
  { id:'R-ip-vel-sinpmad', desc:'ip_vmax 3.0 sin pmad', campos:[['ip_vmax','3.0']] },
  // Control no-pulmonar: mitral estenosis por grado+pill (E5 no toca la mitral).
  { id:'R-em-grado', desc:'em_grado moderada + pill mitral esten', grados:[['em_grado','moderada']], manual:{em:true}, pills:[['mitral','esten',true]] },
  // Control no-pulmonar: aortica insuf por grado.
  { id:'R-ia-grado', desc:'ia_grado 2', grados:[['ia_grado','2']] },

  // NEW (N-*): sólo tienen efecto en current (en orig el pill no existe).
  // IP pill prendido SIN grado ni velocidad → regla 9: current dice "IP presente", orig no (pill inexistente).
  { id:'N-ip-pill-solo', desc:'pill IP prendido sin grado ni velocidad', pills:[['pulmonar','insuf',true]] },
  // EP pill prendido SIN grado → epHay lee el grado (NO el pill): current == orig (gap reportado).
  { id:'N-ep-pill-solo', desc:'pill EP prendido sin grado', pills:[['pulmonar','esten',true]] },
  // IP pill prendido + apagar deja velocidad: velocidad sostiene la mención en ambos (igual que IT).
  { id:'N-ip-apagar-con-vel', desc:'ip_vmax 3.0 y pill IP apagado a mano', campos:[['ip_vmax','3.0']], pills:[['pulmonar','insuf',false]] },
  // Elegir grado por EVENTO (set dispara change → epGradoManual/ipGradoManual): prende el botón (regla 3).
  // En current esten/insuf=1; en orig el onchange no prende. Base del scorer de _mut_e5.py (ME3/ME4).
  { id:'E-ep-grado-evento', desc:'ep_grado Severa por EVENTO (change)', campos:[['ep_grado','Severa']] },
  { id:'E-ip-grado-evento', desc:'ip_grado Moderada por EVENTO (change)', campos:[['ip_grado','Moderada']] },
];

// ── Main ────────────────────────────────────────────────────────────────────────────────────
let servidor, chrome;
try {
  const s = await servir(); servidor = s.srv;
  chrome = await abrirChrome(`http://127.0.0.1:${s.port}/index.html`);
  const cdp = await conectar(chrome.wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find(t => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: `(function(){ ${expr} })()`, returnByValue: true, awaitPromise: true,
    }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'error en la pagina');
    return r.result.value;
  };
  await ev(`try{sessionStorage.setItem('ett_auth','1');}catch(e){} location.reload(); return 1;`);
  for (let i = 0; i < 80; i++) {
    await new Promise(r => setTimeout(r, 250));
    const listo = await ev(`return (typeof generarInforme === 'function') && !!document.getElementById('informe_texto');`).catch(() => false);
    if (listo) break;
  }
  if (!await ev(`return typeof generarInforme === 'function';`)) throw new Error('la app no cargo');
  for (let i = 0; i < 40; i++) {
    if (await ev(`return !!(window.XLSX);`).catch(() => false)) break;
    await new Promise(r => setTimeout(r, 250));
  }
  await ev(SONDA + ' return 1;');
  await ev(`try{ if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); }catch(e){} return 1;`);

  const salida = { file: FILE, XLSX: await ev(`return !!window.XLSX;`), escenas: [] };
  for (const e of ESCENAS) {
    const cfg = JSON.stringify(e);
    let r;
    try { r = await ev(`const c = ${cfg}; return window.__p.escena(c);`); }
    catch (err) { r = { id: e.id, desc: e.desc, error: err.message }; }
    salida.escenas.push(r);
    process.stderr.write('  ' + e.id.padEnd(22) + ' ok\n');
  }
  console.log(JSON.stringify(salida, null, 1));
  cdp.close();
} catch (e) {
  console.error('HARNESS: ' + e.message);
  process.exitCode = 2;
} finally {
  if (servidor) servidor.close();
  if (chrome) { try { chrome.proc.kill(); } catch {} try { await rm(chrome.perfil, { recursive:true, force:true }); } catch {} }
  process.exit(process.exitCode || 0);
}
