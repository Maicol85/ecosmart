#!/usr/bin/env node
/**
 * _probe_d3wk.mjs - la tanda D3 en los DOS motores: el texto del ASIA y la maqueta del bloque.
 * Cierra las tres mediciones que la sonda de CDP no puede hacer:
 *   maqueta - los seis hallazgos nuevos de Otros y los dos campos mudados de la protesis
 *             tricuspide, en Chrome y en WebKit, a CUATRO viewports x DOS temas, con el color
 *             REAL resuelto y el scroll horizontal de la pagina.
 *   ciclo   - 20 aperturas y cierres de la vista 2D, sin acumular nodos.
 *
 *   node scripts/_probe_cortoswk.mjs --file /tmp/index.CORTOSHEAD.html > /tmp/wk.HEAD.json
 *   node scripts/_probe_cortoswk.mjs --dest /tmp/cap_cortos            > /tmp/wk.NEW.json
 *
 * ADVERTENCIA: WebKit de Playwright NO es Safari, y se declara.
 * Sin acentos graves dentro del template de la sonda, tampoco en sus comentarios.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

/* Playwright se resuelve POR RUTA. Si no esta, la sonda lo DICE y sale con codigo 2. */
const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS,
    comoInstalar: 'mkdir -p /tmp/pw && cd /tmp/pw && npm i playwright && npx playwright install webkit' }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file');
const DEST = arg('--dest');
const SOLO = (arg('--solo') || '').split(',').map(s => s.trim()).filter(Boolean);
const corre = (g) => !SOLO.length || SOLO.indexOf(g) > -1;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer(async (req, rq) => {
  try {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const p = (rel === 'index.html' && ARCH) ? ARCH : join(RAIZ, rel);
    rq.writeHead(200, { 'Content-Type': MIME[extname(rel)] || 'application/octet-stream' }).end(await readFile(p));
  } catch { rq.writeHead(404).end('no'); }
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const PORT = srv.address().port;
if (DEST) { try { await mkdir(DEST, { recursive: true }) } catch (e) {} }

const out = { arbol: ARCH || 'VIVO', md5: null, grupos: {}, abortos: [] };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

const SONDA = `window.__P = {
  despejar() {
    var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++; }
    });
    return n },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },
  /* El escenario se arma con asignacion directa mas el evento, porque aca no hay CDP para
     teclas reales. Lo que esta sonda mide es MAQUETA y TEXTO en el OTRO motor; la cuenta con
     teclas de verdad la mide la sonda de CDP. Se declara. */
  set(id, v) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value },
  chk(id, on) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    if (e.checked !== !!on) e.click(); return e.checked },

  escena(lado, mm) {
    var o = {};
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    try { if (typeof showTab === 'function') showTab('otros') } catch (e) {}
    o.abiertos = 0;
    ['otr_asia_nota','otr-asia-mm','otr_asia_lado'].forEach(function(id){
      var n = document.getElementById(id);
      while (n && n.nodeType === 1) {
        if (getComputedStyle(n).display === 'none') { n.style.display = ''; o.abiertos++; }
        n = n.parentNode;
      }
    });
    o.asia = window.__P.chk('otr_asia', true);
    o.lado = window.__P.set('otr_asia_lado', lado);
    o.mm = window.__P.set('otr-asia-mm', mm);
    o.mmFop = (document.getElementById('fop_asa_mm') || {}).value;
    try { if (typeof otrHallSync === 'function') otrHallSync() } catch (e) {}
    return o },

  /* El texto de las superficies, en el motor que toque. */
  texto() {
    var o = {};
    try { o.frase = (typeof asiaExcFrase === 'function') ? asiaExcFrase() : 'SIN FN' } catch (e) { o.frase = 'EXC' }
    try { var l = otrHallazgos(); var a = l.filter(function(x){ return x.id === 'otr_asia' })[0];
          o.otr = a ? a.inf : null } catch (e) { o.otr = 'EXC' }
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar');
          if (typeof generarInforme === 'function') generarInforme();
          var t = (document.getElementById('informe_texto') || {}).value || '';
          o.renglon = t.split(String.fromCharCode(10)).filter(function(x){
            return x.indexOf('neurisma del septum') >= 0 });
          o.suma = (document.getElementById('en_suma') || {}).value || null;
    } catch (e) { o.renglon = 'EXC: ' + e.message }
    return o },

  /* La maqueta del bloque, con las tres celdas. */
  maqueta() {
    var mm = document.getElementById('otr-asia-mm');
    var grid = mm && mm.closest ? mm.closest('.grid-3') : null;
    var g = function(id){ var e = document.getElementById(id); if (!e) return null;
      var r = e.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top) } };
    var hijos = grid ? Array.prototype.slice.call(grid.children).map(function(c){
      var b = c.getBoundingClientRect();
      return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width) } }) : null;
    var ys = {}; if (hijos) hijos.forEach(function(x){ ys[x.y] = 1 });
    return { mm: g('otr-asia-mm'), lado: g('otr_asia_lado'), nota: g('otr_asia_nota'),
             hijos: hijos ? hijos.length : null,
             cols: hijos ? hijos.length / Object.keys(ys).length : null,
             scrollH: document.documentElement.scrollWidth,
             viewport: document.documentElement.clientWidth,
             colorLbl: (function(){ var l = mm && mm.previousElementSibling;
               return l ? getComputedStyle(l).color : null })() } }
};
1`;

async function correrMotor(nombre, lanzar) {
  const nav = await lanzar();
  const ctx = await nav.newContext({ viewport: { width: 1200, height: 700 } });
  const pag = await ctx.newPage();
  const errs = [];
  pag.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  pag.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)) });
  await pag.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
  await pag.evaluate(() => { try { sessionStorage.setItem('ett_auth', '1') } catch (e) {} });
  await pag.reload({ waitUntil: 'load' });
  await pag.waitForTimeout(2500);
  await pag.evaluate(SONDA);
  const g = { celdas: {}, texto: {}, errs };

  if (corre('texto')) {
    await pag.evaluate(() => window.__P.despejar());
    for (const e of [['ad','11'], ['ai','11'], ['ambos','16'], ['','16']]) {
      const st = await pag.evaluate(([l, m]) => window.__P.escena(l, m), e);
      if (st.asia !== true || String(st.mm) !== e[1])
        throw new Error('DENOMINADOR: la escena no quedo ' + JSON.stringify(st));
      g.texto[(e[0] || 'sin') + e[1]] = { st, ...(await pag.evaluate(() => window.__P.texto())) };
    }
  }

  if (corre('maqueta')) {
    for (const claro of [false, true]) {
      for (const w of [1200, 768, 360]) {
        await pag.setViewportSize({ width: w, height: w === 1200 ? 700 : (w === 768 ? 1024 : 740) });
        const ok = await pag.evaluate((c) => window.__P.tema(c), claro);
        if (!ok) throw new Error('EL TEMA NO QUEDO en ' + nombre + ' ' + w);
        await pag.waitForTimeout(90);
        await pag.evaluate(() => window.__P.despejar());
        const st = await pag.evaluate(() => window.__P.escena('ambos', '16'));
        if (st.asia !== true) throw new Error('DENOMINADOR maqueta: ' + JSON.stringify(st));
        g.celdas[(claro ? 'dia' : 'noche') + '|' + w] = await pag.evaluate(() => window.__P.maqueta());
        if (DEST) {
          try { const el = await pag.$('#otr-asia-mm');
            if (el) { await el.scrollIntoViewIfNeeded();
              await pag.screenshot({ path: join(DEST,
                'd3wk_' + nombre + '_' + w + '_' + (claro ? 'dia' : 'noche') + '.png') }); } }
          catch (e) { out.abortos.push('captura ' + nombre + ' ' + w + ': ' + e.message); }
        }
      }
    }
    await pag.evaluate(() => window.__P.tema(false));
    await pag.setViewportSize({ width: 1200, height: 700 });
  }
  await ctx.close(); await nav.close();
  return g;
}

try {
  out.grupos.chrome = await correrMotor('chrome', () => chromium.launch({ channel: 'chrome' }));
} catch (e) { out.abortos.push('chrome: ' + e.message); }
try {
  out.grupos.webkit = await correrMotor('webkit', () => webkit.launch());
} catch (e) { out.abortos.push('webkit: ' + e.message); }

console.log(JSON.stringify(out, null, 1));
try { srv.close() } catch (e) {}
process.exit(0);
