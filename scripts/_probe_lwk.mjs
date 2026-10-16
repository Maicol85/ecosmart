#!/usr/bin/env node
/**
 * _probe_lwk.mjs — sonda de la tanda «L» en LOS DOS MOTORES (2026-10-16).
 *
 * Mide las tres tarjetas i de la pestana AI/VI —auricula, ventriculo y geometria— en Chrome
 * (por el canal del sistema) y en WebKit: tamano, scroll INTERNO, scroll horizontal de la
 * pagina, punto del paciente y categoria, en seis viewports por dos temas; y saca capturas.
 *
 *   node scripts/_probe_lwk.mjs --dest /tmp/capLwk
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara: es el mismo motor, no el mismo navegador.
 * ⚠️ EL CHROMIUM QUE TRAE PLAYWRIGHT NO ARRANCA EN ESTA MAQUINA —espera un build que el cache
 *    no tiene—, asi que Chrome va por el CANAL DEL SISTEMA, que es ademas el navegador con el
 *    que mide el resto de este repo.
 * ⚠️ `newPage({viewportSize})` NO EXISTE: la clave es `viewport`. Con la equivocada todas las
 *    ventanas miden 1280x720 y la tabla sale con el mismo numero repetido.
 * ⚠️ NI UN ACENTO GRAVE adentro de la sonda ni en estos comentarios.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file');
const DEST = arg('--dest');

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

const VIEWPORTS = [[1200, 700], [1440, 800], [1920, 1080], [768, 1024], [390, 844], [360, 740]];
const ESCENAS = [
  { n: 'normal-H', sexo: 'M', c: { peso: '80', talla: '180', ai_vol: '68', ai_diam: '38',
      ai_area: '15', ddfvi: '50', dsfvi: '32', siv: '9', ppvi: '9', fevi: '60', vdfvi: '120', vsfvi: '48' } },
  { n: 'dilatada-HVI-M', sexo: 'F', c: { peso: '60', talla: '160', ai_vol: '98', ai_diam: '50',
      ai_area: '25', ddfvi: '44', dsfvi: '30', siv: '14', ppvi: '14', fevi: '38', vdfvi: '130', vsfvi: '70' } },
  { n: 'sin-sexo', sexo: '', c: { peso: '80', talla: '180', ai_vol: '90', ddfvi: '50', dsfvi: '34',
      siv: '12', ppvi: '12', fevi: '55', vdfvi: '150', vsfvi: '70' } },
  { n: 'sin-ASC', sexo: 'M', c: { ai_vol: '98', ddfvi: '50', dsfvi: '34', siv: '12', ppvi: '12', fevi: '55' } },
  { n: 'sin-datos', sexo: 'M', c: { peso: '80', talla: '180' } },
];

/* El montaje va DENTRO de la pagina: Playwright no habla CDP con WebKit, asi que no hay teclas
   de confianza en los dos motores. Se declara: este arnes mide MAQUETA y CONTENIDO, y el
   comportamiento con teclas reales lo mide `_probe_l.mjs` en Chrome. */
const MONTAR = `(function (esc) {
  try { limpiarCampos(true) } catch (e) {}
  ['modalAvisoEco','login-overlay'].forEach(function(id){
    var m = document.getElementById(id); if (m) m.style.display = 'none' });
  try { showTab('ai-vi') } catch (e) {}
  ['ai','vi'].forEach(function(k){
    var n = document.getElementById('sacc-' + k);
    if (n && !n.classList.contains('open')) { try { secToggle(k) } catch (e) {} } });
  /* ⚠️ LOS VALORES DEL SELECTOR SON «M» Y «F», NO «Masculino» Y «Femenino»: con el texto de la
     opcion el select queda en selectedIndex -1, sv('sexo') devuelve cadena vacia y TODA la
     tanda se mide como «sin sexo» —medido: la captura de la mujer salio con los cortes del
     varon y el aviso de sexo puesto, sobre un arbol perfecto—. Se aborta si no quedo. */
  var s = document.getElementById('sexo');
  if (s) { s.value = esc.sexo; s.dispatchEvent(new Event('change', { bubbles: true }));
    if (s.value !== esc.sexo) return { err: 'EL SEXO NO QUEDO: ' + s.value } }
  Object.keys(esc.c).forEach(function (id) {
    var e = document.getElementById(id); if (!e) return;
    e.value = esc.c[id]; e.dispatchEvent(new Event('input', { bubbles: true }));
  });
  try { calcAI(); calcVI(); calcBSA() } catch (e) {}
  return { sexo: s ? s.value : 'NO EXISTE' };
})`;
const LEER = `(function (clave) {
  var b = document.querySelector('[data-vinfo="' + clave + '"]');
  if (!b) return { err: 'NO EXISTE BOTON ' + clave };
  var r0 = b.getBoundingClientRect();
  if (r0.width === 0 || r0.height === 0) return { err: 'BOTON SIN GEOMETRIA' };
  b.click();
  var c = document.getElementById('vinfo-card');
  if (!c || getComputedStyle(c).display === 'none') return { err: 'NO ABRIO' };
  var r = c.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height),
           top: Math.round(r.top), left: Math.round(r.left),
           dentro: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1,
           scrollInterno: c.scrollHeight > c.clientHeight + 1,
           nSvg: c.querySelectorAll('svg').length,
           puntos: c.querySelectorAll('[data-ev-punto]').length,
           cortes: Array.prototype.slice.call(c.querySelectorAll('[data-ev-corte]'))
             .map(function(e){ return String(e.textContent||'').trim() }),
           cat: Array.prototype.slice.call(c.querySelectorAll('[data-ev-cat]'))
             .map(function(e){ return String(e.textContent||'').trim() }),
           pagina: { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth } };
})`;

async function correr(nombre, lanzar) {
  const g = {};
  let br = null;
  try { br = await lanzar(); }
  catch (e) { out.abortos.push(nombre + ': no arranco — ' + e.message); return g; }
  for (const [w, h] of VIEWPORTS) {
    for (const tema of ['oscuro', 'claro']) {
      const pg = await br.newPage({ viewport: { width: w, height: h } });
      try {
        await pg.goto('http://127.0.0.1:' + PORT + '/index.html', { waitUntil: 'load', timeout: 60000 });
        await pg.waitForFunction('typeof calcVI === "function"', null, { timeout: 60000 });
        const puesto = await pg.evaluate((cl) => {
          const r = document.documentElement;
          if (cl) r.classList.add('light-mode'); else r.classList.remove('light-mode');
          return r.classList.contains('light-mode');
        }, tema === 'claro');
        for (const E of ESCENAS) {
          /* Sin la escena entera por viewport la tabla no diria nada: a 1200 x 700 el hueco util
             depende de donde quedo el globo, y eso depende de los datos. */
          await pg.evaluate(MONTAR + '(' + JSON.stringify(E) + ')');
          for (const k of ['ai-card', 'vi-card', 'vi-geo']) {
            const r = await pg.evaluate(LEER + '(' + JSON.stringify(k) + ')');
            g[w + 'x' + h + ' ' + tema + ' | ' + E.n + ' | ' + k] = r;
            if (DEST && w === 1200 && E.n !== 'sin-datos' && !r.err) {
              const el = await pg.$('#vinfo-card');
              try { await el.screenshot({ path: join(DEST, nombre + '_' + E.n + '_' + tema + '_' + k + '.png') }) } catch (e) {}
            }
            await pg.keyboard.press('Escape');
          }
        }
        g[w + 'x' + h + ' ' + tema + ' | temaClaro'] = puesto;
      } catch (e) { out.abortos.push(nombre + ' ' + w + 'x' + h + ' ' + tema + ': ' + e.message); }
      await pg.close();
    }
  }
  await br.close();
  return g;
}

out.grupos.chrome = await correr('chrome', () => chromium.launch({ channel: 'chrome' }));
process.stderr.write('  [chrome] listo\n');
out.grupos.webkit = await correr('webkit', () => webkit.launch());
process.stderr.write('  [webkit] listo\n');

console.log(JSON.stringify(out, null, 1));
srv.close();
process.exit(0);
