#!/usr/bin/env node
/**
 * _probe_cortoswk.mjs - sonda de SOLO LECTURA de la tanda CORTOS, en los DOS MOTORES.
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
  /* El escenario se arma con asignacion directa mas el evento, porque aca no hay CDP para teclas
     reales. Lo que esta sonda mide es MAQUETA y CICLO, no una cuenta: la cuenta la mide la sonda
     de CDP con teclas de verdad. Se declara. */
  set(id, v) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value },
  chk(id, on) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.checked = !!on; e.dispatchEvent(new Event('change', { bubbles:true })); return e.checked },
  escena() {
    var o = {};
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    /* OTROS: la pestaña y sus tarjetas plegables. Lo que esta en display:none no tiene
       geometria, asi que sin abrirlas la medicion da 0x0 y parece impecable. */
    try { if (typeof showTab === 'function') showTab('otros') } catch (e) {}
    o.abiertos = 0;
    ['otr_asia_nota','otr_var_eustaquio_nota','otr_rac_nota','otr_burb_cant','pul_lineasb_sep',
     'et_e_vmax','vt_dvi','vm_pvl_origen'].forEach(function(id){
      var n = document.getElementById(id);
      while (n && n.nodeType === 1) {
        if (getComputedStyle(n).display === 'none') { n.style.display = ''; o.abiertos++; }
        n = n.parentNode;
      }
    });
    o.asia = window.__P.chk('otr_asia', true);
    o.vari = window.__P.chk('otr_var_eustaquio', true);
    o.rac  = window.__P.chk('otr_rac', true);
    o.burb = window.__P.chk('otr_burb', true);
    o.pas  = window.__P.set('otr_burb_pasaje', 'si');
    o.lb   = window.__P.set('pul_lineasb', 'si');
    o.sep  = window.__P.set('pul_lineasb_sep', 's7');
    try { if (typeof otrHallSync === 'function') otrHallSync() } catch (e) {}
    try { if (typeof otrBurbUI === 'function') otrBurbUI() } catch (e) {}
    return o },
  medir() {
    var col = function(sel){ var e = document.querySelector(sel);
      return e ? getComputedStyle(e).color : 'NO EXISTE' };
    var caja = function(sel){ var e = document.querySelector(sel); if (!e) return null;
      var r = e.getBoundingClientRect();
      return { w:Math.round(r.width), h:Math.round(r.height),
               dentro: r.right <= window.innerWidth + 1,
               vis: getComputedStyle(e).display !== 'none' } };
    return {
      asia: caja('#otr_asia_nota'), vari: caja('#otr_var_eustaquio_nota'), rac: caja('#otr_rac_nota'),
      burbCant: caja('#otr_burb_cant'), burbMom: caja('#otr_burb_mom'),
      sepLb: caja('#pul_lineasb_sep'),
      colorAsia: col('#otr_asia_nota'),
      scrollH: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth } },

  /* La POSICION de los tres controles mudados, con el padre al que pertenecen hoy. */
  posicion() {
    var pad = function(id, sel){ var e = document.getElementById(id);
      if (!e) return 'NO EXISTE'; var p = e.closest(sel); return p ? (p.id || 'SIN ID') : 'FUERA' };
    return { origenMitral: pad('vm_pvl_origen', '#bloque-insuf-mitral'),
             eVmax: pad('et_e_vmax', '#campos-esten-tricuspide'),
             dvi: pad('vt_dvi', '#campos-esten-tricuspide'),
             resEnCaja: (function(){ var e = document.getElementById('bloque-prot-vt-res');
               if (!e) return 'NO EXISTE'; var c = e.closest('.calc-box');
               return c ? (c.id || 'SIN ID') : 'FUERA' })() } },

  /* 20 aperturas y cierres de la vista 2D. UNA VUELTA DE CALENTAMIENTO ANTES DE CONTAR: sin
     ella la sonda informa de mas, porque el primer pintado CREA el contenido y despues lo
     reusa. Es la leccion del L, del PRO-B y del PRO-C. */
  ciclo() {
    if (typeof v2dAbrir !== 'function' || typeof v2dCerrar !== 'function') return 'SIN FN';
    try { if (typeof showTab === 'function') showTab('valvulas') } catch (e) {}
    try { v2dAbrir(); v2dCerrar() } catch (e) { return 'EXC calentamiento: ' + e.message }
    var antes = document.getElementsByTagName('*').length;
    for (var i = 0; i < 20; i++) { try { v2dAbrir(); v2dCerrar() } catch (e) { return 'EXC: ' + e.message } }
    var despues = document.getElementsByTagName('*').length;
    var vis = (typeof v2dVisible === 'function') ? v2dVisible() : null;
    return { antes: antes, despues: despues, delta: despues - antes, prendidoAlFinal: vis } }
};
1;`;

const VPORTS = [[1200, 700], [768, 1024], [390, 844], [360, 740]];

async function correrMotor(nombre, lanzar) {
  const nav = await lanzar();
  const g = { version: nav.version(), celdas: {}, posicion: null, ciclo: null };
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
        if (esc.asia !== true || esc.burb !== true || esc.pas !== 'si')
          throw new Error('DENOMINADOR: la escena no quedo ' + JSON.stringify(esc));
        const m = await pag.evaluate(() => window.__P.medir());
        g.celdas[(claro ? 'dia' : 'noche') + '|' + w] = m;
        if (DEST) {
          try { const el = await pag.$('#ete-seccion-burbuja');
            if (el) { const r = await el.boundingBox();
              if (r && r.width > 0 && r.height > 0) {
                await el.scrollIntoViewIfNeeded();
                await el.screenshot({ path: join(DEST, nombre + '_burb_' + w + '_' + (claro ? 'dia' : 'noche') + '.png') });
              } } } catch (e) { out.abortos.push('captura ' + nombre + ' ' + w + ': ' + e.message); }
        }
      }
    }
    await pag.evaluate(() => window.__P.tema(false));
    await pag.setViewportSize({ width: 1200, height: 700 });
    await pag.evaluate(() => window.__P.escena());
    g.posicion = await pag.evaluate(() => window.__P.posicion());
  }
  if (corre('ciclo')) {
    await pag.evaluate(() => window.__P.despejar());
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
