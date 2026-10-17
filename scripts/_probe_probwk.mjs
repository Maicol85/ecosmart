#!/usr/bin/env node
/**
 * _probe_probwk.mjs - sonda de SOLO LECTURA de la tanda PRO-B, en los DOS MOTORES.
 * Cierra las dos mediciones que la sonda de CDP no puede hacer:
 *   maqueta - el bloque de la fuga paravalvular quirurgica y el selector de origen mitral, en
 *             Chrome y en WebKit, a SEIS viewports x DOS temas, con el color REAL resuelto.
 *   ciclo   - 20 aperturas y cierres de la vista 2D, sin acumular nodos ni oyentes.
 *
 *   node scripts/_probe_probwk.mjs --file /tmp/index.PROBHEAD.html > /tmp/wk.HEAD.json
 *   node scripts/_probe_probwk.mjs                                 > /tmp/wk.NEW.json
 *
 * ADVERTENCIA: WebKit de Playwright NO es Safari, y se declara.
 * Sin acentos graves dentro del template de la sonda, tampoco en sus comentarios.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

/* ⚠️ PLAYWRIGHT SE RESUELVE POR RUTA Y NO POR `import 'playwright'`: no esta instalado en el
   proyecto —y no se quiere agregar una dependencia a un repo sin build—, asi que se busca donde
   la tanda anterior lo dejo. Si no esta, la sonda lo DICE en vez de reventar con un stack. */
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
const ARCH  = arg('--file');
const DEST  = arg('--dest');
const SOLO  = (arg('--solo') || '').split(',').map(s => s.trim()).filter(Boolean);
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
  rect(sel) { var e = document.querySelector(sel); if (!e) return null;
    var r = e.getBoundingClientRect();
    return { w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.left), y:Math.round(r.top) } },
  /* El escenario se arma con asignacion directa + el evento, porque aca no hay CDP para teclas
     reales. Lo que se mide en esta sonda es MAQUETA y CICLO, no una cuenta: la cuenta la mide la
     sonda de CDP con teclas de verdad. Se declara. */
  set(id, v) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value },
  escena() {
    var o = {};
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    try { if (typeof showTab === 'function') showTab('valvulas') } catch (e) {}
    ['caja-insuf-aortica','caja-insuf-mitral'].forEach(function(c){
      try { var b = document.getElementById(c === 'caja-insuf-aortica' ? 'bloque-insuf-aortica' : 'bloque-insuf-mitral');
        if (b && getComputedStyle(b).display === 'none' && typeof valvDatosTog === 'function') valvDatosTog(c);
      } catch (e) {} });
    o.va = window.__P.set('va_morf', 'Prótesis biológica');
    o.vm = window.__P.set('vm_morf', 'Prótesis mecánica');
    o.org = window.__P.set('ea_pvl_origen', 'paraval');
    o.vmorg = window.__P.set('vm_pvl_origen', 'paraval');
    o.ext = window.__P.set('ea_pvl_ext', '15');
    o.vc = window.__P.set('ia_vc', '8');
    /* ABRIR LAS PUERTAS POR ANCESTRO. La primera corrida midio el bloque en 0x0 en las VEINTICUATRO
       celdas, con el veredicto y el badge perfectamente leidos: el bloque vive dentro de la caja
       de la insuficiencia aortica, que nace cerrada, y "valvDatosTog" solo no alcanza porque el
       contenedor de la lesion tambien puede estar plegado. Se sube por el DOM desde el campo y se
       enciende todo lo que este en display:none, que es lo que hace "abrirPara" en la sonda de CDP.
       Se devuelve el conteo para que el lector vea que la escena llego de verdad al bloque. */
    o.abiertos = 0;
    ['ea_pvl_origen', 'vm_pvl_origen'].forEach(function(id){
      var n = document.getElementById(id);
      while (n && n.nodeType === 1) {
        if (getComputedStyle(n).display === 'none') { n.style.display = ''; o.abiertos++; }
        n = n.parentNode;
      }
    });
    ['calcIA_ESC','calcIM_ESC','valvProtSync','eaPvlPintar','imPvlPintar'].forEach(function(f){
      try { if (typeof window[f] === 'function') window[f]() } catch (e) {} });
    return o },
  medir() {
    var b = window.__P.rect('#bloque-prot-va-pvl');
    var m = window.__P.rect('#bloque-prot-vm-pvl');
    var bd = document.querySelector('#ea-pvl-interp .badge');
    return { bloqueAo: b, bloqueVm: m,
      campos: ['ea_pvl_origen','ea_pvl_ext','ea_pvl_vc_area','vm_pvl_origen'].map(function(id){
        var r = window.__P.rect('#' + id); return r ? r.w : -1 }),
      badge: bd ? (getComputedStyle(bd).color + ' / ' + getComputedStyle(bd).backgroundColor) : 'NO EXISTE',
      sev: (function(){ var e = document.getElementById('ea-pvl-interp');
        return e ? String(e.textContent || '').trim() : 'NO EXISTE' })(),
      origenVm: (function(){ var e = document.getElementById('im-pvl-interp');
        return e ? String(e.textContent || '').trim() : 'NO EXISTE' })(),
      scrollH: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth } },
  /* 20 aperturas y cierres de la vista 2D: nodos antes y despues, y el panel apagado al final.
     El conteo se toma JUSTO ANTES del bucle, que es la leccion del L: entre medio se repintan
     otras zonas que SI agregan nodos. */
  ciclo() {
    if (typeof v2dAbrir !== 'function' || typeof v2dCerrar !== 'function') return 'SIN FN';
    /* UNA VUELTA DE CALENTAMIENTO ANTES DE CONTAR. La primera corrida informo +15 nodos sobre un
       panel que no acumula ninguno: el conteo se tomaba con el panel NUNCA abierto, asi que los
       quince eran el contenido que el primer pintado crea y que despues se reusa. El conteo va
       JUSTO ANTES del bucle y con el panel ya pintado una vez, que es la leccion del L. */
    try { v2dAbrir(); v2dCerrar() } catch (e) { return 'EXC calentamiento: ' + e.message }
    var antes = document.getElementsByTagName('*').length;
    for (var i = 0; i < 20; i++) { try { v2dAbrir(); v2dCerrar() } catch (e) { return 'EXC: ' + e.message } }
    var despues = document.getElementsByTagName('*').length;
    var vis = (typeof v2dVisible === 'function') ? v2dVisible() : null;
    return { antes: antes, despues: despues, delta: despues - antes, prendidoAlFinal: vis } }
};
1;`;

const VPORTS = [[1200,700],[1440,800],[1920,1080],[768,1024],[390,844],[360,740]];

async function correrMotor(nombre, lanzar) {
  const nav = await lanzar();
  const g = { version: nav.version(), celdas: {}, ciclo: null };
  const ctx = await nav.newContext({ viewport: { width: 1200, height: 700 } });
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
  await pag.evaluate(() => { try { sessionStorage.setItem('ett_auth', '1') } catch (e) {} });
  await pag.reload({ waitUntil: 'load' });
  await pag.waitForTimeout(2500);
  await pag.evaluate(SONDA);
  if (corre('maqueta')) {
    for (const claro of [false, true]) {
      const okTema = await pag.evaluate((c) => window.__P.tema(c), claro);
      if (!okTema) throw new Error('DENOMINADOR: light-mode no quedo en ' + nombre);
      for (const [w, h] of VPORTS) {
        await pag.setViewportSize({ width: w, height: h });
        await pag.waitForTimeout(80);
        await pag.evaluate(() => window.__P.despejar());
        const esc = await pag.evaluate(() => window.__P.escena());
        if (esc.org !== 'paraval') throw new Error('DENOMINADOR: el origen no quedo ' + JSON.stringify(esc));
        g.celdas[(claro ? 'dia' : 'noche') + '|' + w] = await pag.evaluate(() => window.__P.medir());
      }
    }
    await pag.evaluate(() => window.__P.tema(false));
    await pag.setViewportSize({ width: 1200, height: 700 });
  }
  if (corre('ciclo')) {
    await pag.evaluate(() => window.__P.despejar());
    await pag.evaluate(() => window.__P.escena());
    g.ciclo = await pag.evaluate(() => window.__P.ciclo());
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
