/**
 * _p30cdp.mjs - arnes CDP minimo para las sondas de PANT-30 (2026-11-10).
 *
 * ⚠️ NO USA PLAYWRIGHT, Y SE MIDIO POR QUE: el paquete NO esta instalado en esta maquina
 * (`npm ls -g` da tres paquetes y ninguno es playwright; en ~/Library/Caches/ms-playwright
 * quedan los binarios de una instalacion que ya no existe). Las sondas de las tandas
 * anteriores lo importan y hoy fallan con ERR_MODULE_NOT_FOUND. Este arnes habla CDP directo
 * contra el Chrome del sistema, que es el camino que `test_clinico.mjs` ya documenta: cero
 * dependencias y el motor real.
 *
 * ⚠️ SIRVE LA APP POR HTTP Y NO POR file://. En file:// el origen es opaco: no hay localStorage
 * ni IndexedDB, asi que la institucion, el logo, el medico Principal y el guardado de imagenes
 * -o sea casi todo lo que esta tanda mide- quedarian vacios y la sonda mediria sobre un
 * denominador vacio que se lee igual que «esta todo bien».
 *
 * ⚠️ CIERRA EL SERVIDOR Y SALE CON process.exit(0). Sin eso el event loop queda vivo, se juntan
 * procesos reteniendo su Chrome y un A/B encadenado nunca llega al segundo lado: parece lentitud
 * y es un cuelgue. Es la trampa que CLAUDE.md ya documenta.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, dirname } from 'node:path';

const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };

function servir(raiz, archivo) {
  return new Promise(res => {
    const srv = createServer(async (req, rq) => {
      try {
        let rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
        if (!rel) rel = archivo;
        const p = join(raiz, rel);
        if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}

function conectar(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0; const pend = new Map(); const oyentes = [];
    ws.addEventListener('open', () => res({
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      on: fn => oyentes.push(fn),
      close: () => ws.close()
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', e => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      } else if (m.method) oyentes.forEach(f => f(m));
    });
  });
}

/* Abre la app y devuelve `{ev, viewport, cerrar, errs}`.
   `ev(expr)` evalua una expresion en la pagina y devuelve su valor por JSON. */
export async function abrir(archivo, opt) {
  opt = opt || {};
  const raiz = dirname(archivo), nom = archivo.slice(raiz.length + 1);
  const { srv, port } = await servir(raiz, nom);
  const perfil = await mkdtemp(join(tmpdir(), 'p30-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome.');
  const args = ['--remote-debugging-port=0', '--user-data-dir=' + perfil, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                'http://127.0.0.1:' + port + '/' + nom];
  if (!opt.ver) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'], detached: true });
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome no respondio en 25 s')), 25000);
    let acc = '';
    proc.stderr.on('data', d => {
      acc += d.toString();
      const m = acc.match(/ws:\/\/[^\s]+/);
      if (m) { clearTimeout(t); res(m[0]); }
    });
  });
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find(x => x.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Log.enable', {}, sessionId);
  const errs = [];
  cdp.on(m => {
    if (m.method === 'Runtime.exceptionThrown')
      errs.push('pagina: ' + String((m.params.exceptionDetails || {}).text || '').slice(0, 150) +
        ' ' + String(((m.params.exceptionDetails || {}).exception || {}).description || '').slice(0, 150));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error')
      errs.push('consola: ' + String(m.params.entry.text || '').slice(0, 150));
  });
  /* ⚠️ RECIBE UNA FUNCION Y SUS ARGUMENTOS, NO UNA CADENA. Con una cadena el argumento se
     descarta en silencio y la sonda mide lo mismo en los dos lados de un A/B -- dos resultados
     identicos que parecen un control negativo y son una llamada sin parametro. */
  const ev = async (fn, ...args) => {
    const expr = '(' + fn.toString() + ').apply(null,' + JSON.stringify(args) + ')';
    const r = await cdp.send('Runtime.evaluate', {
      expression: expr, returnByValue: true, awaitPromise: true
    }, sessionId);
    if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails).slice(0, 400));
    return r.result.value;
  };
  const viewport = (w, h) => cdp.send('Emulation.setDeviceMetricsOverride',
    { width: w, height: h, deviceScaleFactor: 1, mobile: false }, sessionId);
  const tema = modo => cdp.send('Emulation.setEmulatedMedia',
    { features: [{ name: 'prefers-color-scheme', value: modo }] }, sessionId);
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const cerrar = () => {
    try { cdp.close(); } catch {}
    try { proc.kill('SIGKILL'); } catch {}
    try { srv.close(); } catch {}
    try { rmSync(perfil, { recursive: true, force: true }); } catch {}
  };
  await esperar(opt.espera || 3000);
  return { ev, viewport, tema, esperar, cerrar, errs };
}
