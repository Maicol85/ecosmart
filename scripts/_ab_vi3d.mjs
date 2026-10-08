#!/usr/bin/env node
/**
 * _ab_vi3d.mjs — A/B TEMPORAL de la tarjeta «Hallazgos de motilidad» con el 3D CERRADO.
 *
 * P3 exige que con el 3D cerrado esa tarjeta quede EXACTAMENTE como antes. Esto lo mide en vez
 * de afirmarlo: sirve el index.html de una raiz cualquiera y devuelve la geometria de lo que
 * existe en LOS DOS lados (HEAD y el arbol de trabajo), asi que los numeros son comparables.
 *
 * Uso:
 *   mkdir -p /tmp/ab_head && git show HEAD:index.html > /tmp/ab_head/index.html
 *   node scripts/_ab_vi3d.mjs /tmp/ab_head  > /tmp/ab_head.json
 *   node scripts/_ab_vi3d.mjs .             > /tmp/ab_work.json
 *
 * ⚠️ DENOMINADOR: imprime segsBullseye. Si no da 17, la pestaña no abrio y los ceros que siguen
 * no significan «identico», significan «no medi nada».
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';

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


const RAIZ = resolve(process.argv[2] || '.');
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
        const p = join(RAIZ, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
        if (!p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}
async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-ab3d-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const proc = spawn(bin, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', url],
    { stdio: ['ignore', 'ignore', 'pipe'], detached: true });
  _arnesCerrarAlSalir(proc, perfil);
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome no respondio en 20 s')), 20000);
    let acc = '';
    proc.stderr.on('data', (d) => { acc += d.toString();
      const m = acc.match(/ws:\/\/[^\s]+/); if (m) { clearTimeout(t); res(m[0]); } });
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
        pend.set(msg.id, { ok, no }); ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) { const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result); }
    });
  });
}

/* OJO: template literal. Sin acentos graves adentro. */
const MEDIR = `
  if (typeof showTab === 'function') showTab('contractilidad');
  const acc = document.getElementById('sacc-contr');
  if (acc && !acc.classList.contains('open') && typeof secToggle === 'function') secToggle('contr');
  if (typeof limpiarCampos === 'function') limpiarCampos(true);
  if (typeof contrReset === 'function') contrReset();
  if (typeof showTab === 'function') showTab('contractilidad');
  if (acc && !acc.classList.contains('open') && typeof secToggle === 'function') secToggle('contr');
  const be = document.getElementById('contr-svg-bullseye');
  const caja = function(el){ if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) }; };
  const txt = document.getElementById('contr-texto-informe');
  /* La TARJETA de hallazgos: el .card que contiene al texto. Es lo que P3 exige intacto. */
  const tarjeta = txt ? txt.closest('.card') : null;
  const cs = txt ? getComputedStyle(txt) : null;
  return {
    segsBullseye: be ? be.querySelectorAll('.contr-seg').length : 0,
    textoCaja: caja(txt),
    textoContenido: txt ? (txt.textContent||'').replace(/\\s+/g,' ').trim() : null,
    textoEstilo: cs ? { fontSize: cs.fontSize, color: cs.color, lineHeight: cs.lineHeight } : null,
    tarjetaCaja: caja(tarjeta),
    tarjetaTexto: tarjeta ? (tarjeta.textContent||'').replace(/\\s+/g,' ').trim() : null,
    bullseyeCaja: caja(be)
  };`;

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
      expression: `(function(){ ${expr} })()`, returnByValue: true, awaitPromise: true }, sessionId);
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
  await ev(`try{ if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); }catch(e){} return 1;`);

  /* ── Un ESTUDIO GUARDADO ANTIGUO, por el camino real: CeiboStore.setLocal + cargarEstudioPorId.
     Se compara el informe firmado, el EN SUMA, los fill del bull's eye y contrEstado. Si algo de
     eso cambia entre HEAD y el arbol, un estudio viejo NO abre igual.
     ⚠️ Estos estudios traen la contractilidad con claves NUMERICAS ({"1":2,...}), no
     basal_anterior: sirven justo para probar que el formato viejo se comporta igual que antes. ── */
  const out = { raiz: RAIZ, anchos: {}, estudioViejo: null };
  out.estudioViejo = await ev(`return (async () => {
    const r = await fetch('tests/ecosmart_demo_isquemica_bullseye.json');
    const arr = await r.json();
    const est = arr[0];
    if (typeof CeiboStore === 'undefined' || !CeiboStore.setLocal) return { error: 'sin CeiboStore' };
    CeiboStore.setLocal([est]);
    if (typeof cargarEstudioPorId !== 'function') return { error: 'sin cargarEstudioPorId' };
    cargarEstudioPorId(est.estudioId);
    await new Promise(function(r2){ setTimeout(r2, 500); });
    if (typeof generarInforme === 'function') generarInforme();
    const fills = {};
    document.querySelectorAll('#contr-svg-bullseye [data-contrseg]').forEach(function(el){
      fills[el.getAttribute('data-contrseg')] = el.getAttribute('fill'); });
    const txt = document.getElementById('contr-texto-informe');
    return {
      estudioId: est.estudioId,
      nombre: (document.getElementById('nombre')||{}).value,
      fevi: (document.getElementById('fevi')||{}).value,
      vdfvi: (document.getElementById('vdfvi')||{}).value,
      ddfvi: (document.getElementById('ddfvi')||{}).value,
      contrEstado: JSON.parse(JSON.stringify(contrEstado)),
      fills: fills,
      hallazgos: txt ? (txt.textContent||'').replace(/\\s+/g,' ').trim() : null,
      informe: ((document.getElementById('informe_texto')||{}).value || '').replace(/\\s+/g,' ').trim(),
      enSuma: ((document.getElementById('en_suma')||{}).value || '').replace(/\\s+/g,' ').trim()
    };
  })();`);
  process.stderr.write('  estudio viejo — fevi=' + out.estudioViejo.fevi
    + ' hallazgos=«' + String(out.estudioViejo.hallazgos).slice(0,60) + '»\n');

  for (const w of [1200, 390]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 }, sessionId);
    out.anchos[w] = await ev(MEDIR);
    process.stderr.write('  ' + w + 'px segs=' + out.anchos[w].segsBullseye
      + ' tarjeta=' + JSON.stringify(out.anchos[w].tarjetaCaja)
      + ' texto=' + JSON.stringify(out.anchos[w].textoCaja) + '\n');
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
  console.log(JSON.stringify(out, null, 1));
  cdp.close();
} catch (e) {
  console.error('HARNESS: ' + e.message);
  process.exitCode = 2;
} finally {
  if (servidor) servidor.close();
  if (chrome) { try { chrome.proc.kill(); } catch {} try { await rm(chrome.perfil, { recursive:true, force:true }); } catch {} }
  process.exit(process.exitCode || 0);
}
