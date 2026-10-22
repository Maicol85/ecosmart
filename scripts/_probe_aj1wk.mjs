#!/usr/bin/env node
/**
 * _probe_aj1wk.mjs - la tanda D3 en los DOS motores: el texto del ASIA y la maqueta del bloque.
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
  geo(id) { var e = document.getElementById(id); if (!e) return { ok:false, falta:id };
    var r = e.getBoundingClientRect();
    return { ok: r.width > 0 && r.height > 0, w: Math.round(r.width), h: Math.round(r.height) } },
  color(sel) { var e = document.querySelector(sel); if (!e) return 'NO EXISTE ' + sel;
    return getComputedStyle(e).color },

  /* Abre las DOS secciones de valvula y sus dos cajones, y despues arma la escena. Sin esto
     las tres piezas nuevas miden 0x0 y «cero scroll horizontal» sale sobre una pantalla que
     no esta dibujada. */
  abrir() {
    try { showTab('valvulas') } catch (e) {}
    ['valv-aortica','valv-mitral'].forEach(function(sec){
      var c = document.getElementById('ete-seccion-' + sec);
      if (c && getComputedStyle(c).display === 'none') { try { toggleEteSeccion(sec) } catch (e) {} } });
    [['caja-insuf-aortica','ia_rev_dur'], ['caja-insuf-mitral','im-sec-alt']].forEach(function(p){
      if (!window.__P.geo(p[1]).ok) { try { valvDatosTog(p[0]) } catch (e) {} }
      if (!window.__P.geo(p[1]).ok) { try { valvDatosTog(p[0]) } catch (e) {} } });
    return true },

  escena() {
    window.__P.abrir();
    var o = {};
    o.mec = window.__P.set('teer_tipo_im', 'secundaria');
    window.__P.set('im_vmax', '5'); window.__P.set('pisa_val', '50');
    o.r = window.__P.set('pisa_r', '6.91');
    try { if (typeof calcIM_ESC === 'function') calcIM_ESC() } catch (e) {}
    o.dur = window.__P.set('ia_rev_dur', 'holo');
    o.vti = window.__P.set('ia_vti_desc', '16');
    try { if (typeof calcIA_ESC === 'function') calcIA_ESC() } catch (e) {}
    return o },

  /* Los textos de la zona, en el motor que toque. */
  textos() {
    var o = {};
    window.__P.escena();
    o.alt = (document.getElementById('im-sec-alt') || {}).textContent || '';
    o.rev = (document.getElementById('ia-rev-dur-interp') || {}).textContent || '';
    o.iaGrado = (document.getElementById('ia_grado') || {}).value;
    o.imGrado = (document.getElementById('im_grado') || {}).value;
    /* Los cortes del VD de la version de MAYO, por sus dos lados. */
    try { o.tapse = [14,13].map(function(x){ return ase25Grado('tapse', x) }).join('/') }
    catch (e) { o.tapse = 'EXC' }
    try { o.sprime = [7.3,7.2].map(function(x){ return ase25Grado('s_prime', x) }).join('/') }
    catch (e) { o.sprime = 'EXC' }
    /* La nota del operador en el globo de la aorta y la recomendacion de la coartacion. */
    try { var n = (typeof evTarjetaAo === 'function') ? evTarjetaAo() : null;
          var t = n ? String(n.textContent || '') : '';
          o.notaOperador = t.indexOf('9.2.1.1') > -1 && t.indexOf('Figura 24') > -1; }
    catch (e) { o.notaOperador = 'EXC' }
    try { window.__P.set('coa_situacion', 'post_stent');
          var r = (typeof _indCoAo === 'function') ? _indCoAo() : null;
          o.coaBloque = (r && r.bloques && r.bloques[0])
            ? String(r.bloques[0].lineas[0].txt).slice(0, 150) : 'SIN BLOQUES'; }
    catch (e) { o.coaBloque = 'EXC' }
    return o },

  /* La maqueta del bloque, con las tres piezas nuevas. */
  maqueta() {
    window.__P.escena();
    var de = document.documentElement;
    var o = { scrollH: de.scrollWidth > de.clientWidth, sw: de.scrollWidth, cw: de.clientWidth };
    o.geoAlt = window.__P.geo('im-sec-alt');
    o.geoDur = window.__P.geo('ia_rev_dur');
    o.geoFila = window.__P.geo('ia-rev-dur-interp');
    o.colorAviso = window.__P.color('#im-sec-aviso');
    o.colorAlt = window.__P.color('#im-sec-alt');
    o.txtAlt = ((document.getElementById('im-sec-alt') || {}).textContent || '').slice(0, 60);
    o.denom = !!(o.geoAlt.ok && o.geoDur.ok && o.geoFila.ok && o.txtAlt.length > 10);
    return o }
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
    g.texto = await pag.evaluate(() => window.__P.textos());
  }

  if (corre('maqueta')) {
    for (const claro of [false, true]) {
      for (const w of [1200, 768, 360]) {
        await pag.setViewportSize({ width: w, height: w === 1200 ? 700 : (w === 768 ? 1024 : 740) });
        const ok = await pag.evaluate((c) => window.__P.tema(c), claro);
        if (!ok) throw new Error('EL TEMA NO QUEDO en ' + nombre + ' ' + w);
        await pag.waitForTimeout(90);
        await pag.evaluate(() => window.__P.despejar());
        const c = await pag.evaluate(() => window.__P.maqueta());
        if (!c.denom) throw new Error('DENOMINADOR maqueta ' + nombre + ' ' + w + ': ' + JSON.stringify(c));
        g.celdas[(claro ? 'dia' : 'noche') + '|' + w] = c;
        if (DEST) {
          try { const el = await pag.$('#im-sec-alt');
            if (el) { await el.scrollIntoViewIfNeeded();
              await pag.screenshot({ path: join(DEST,
                'aj1wk_' + nombre + '_' + w + '_' + (claro ? 'dia' : 'noche') + '.png') }); } }
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
