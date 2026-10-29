/* Sonda de MAQUETA en DOS MOTORES para la tanda AJ9 (2026-10-29).
 *
 *   node scripts/_probe_aj9wk.mjs [--file /ruta/index.html]
 *
 * Mide, a 1440 px y 390 px y en los DOS temas, lo que esta tanda movio:
 *   - CERO barra horizontal de la PAGINA y CERO errores de consola y de pagina.
 *   - La geometria de TODA la app: cuantas pestanas tienen caja. Un div sin cerrar no lanza
 *     y ningun A/B de texto lo ve; lo unico que lo delata es que pestanas AJENAS den 0x0.
 *   - El rotulo del SGL en sus dos nodos, con su color.
 *   - El panel de territorios con su aviso, y los TRES globos nuevos con sus cinco puntos.
 *   - La ficha ref-strain con sus filas y sus folios.
 *   - CERO texto recortado en las zonas de la tanda.
 *
 * ADVERTENCIA: sin acentos graves fuera de los delimitadores del template.
 * ADVERTENCIA: WebKit de Playwright NO es Safari, y se declara.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

const CANDIDATAS = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
                    '/tmp/pw/node_modules/playwright/index.js',
                    '/tmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1)); process.exit(2); }
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file');

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

const out = { arbol: ARCH || 'VIVO', md5: null, cruces: {} };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

const MEDIR = `(() => {
  const O = {};
  const N = (s) => String(s || '').replace(/\\s+/g, ' ').trim();
  ['modalAvisoEco','login-overlay'].forEach((id) => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  /* 1 · la barra horizontal de la PAGINA */
  const d = document.documentElement;
  O.scrollH = { hay: d.scrollWidth > d.clientWidth, sw: d.scrollWidth, cw: d.clientWidth };
  /* 2 · GEOMETRIA DE TODA LA APP: el centinela del div sin cerrar */
  (() => {
    const bs = [].slice.call(document.querySelectorAll('.tab-btn[onclick]'));
    const o = { n: 0, conCaja: 0, cero: [] };
    bs.forEach((b) => {
      const m = /showTab\\('([^']+)'/.exec(b.getAttribute('onclick') || ''); if (!m) return;
      o.n++;
      try { showTab(m[1]) } catch (e) {}
      const p = document.getElementById('tab-' + m[1]);
      const r = p ? p.getBoundingClientRect() : { width: 0, height: 0 };
      if (r.width > 0 && r.height > 0) o.conCaja++; else o.cero.push(m[1]);
    });
    O.pestanas = o;
  })();
  /* 3 · EL ROTULO DEL SGL en sus dos nodos, en un borde de cada banda */
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  O.rotulo = {};
  [['-20','normal'], ['-18','limitrofe'], ['-15.9','anormal'], ['18','positivo']].forEach((p) => {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    S('fevi', '55'); S('sgl', p[0]);
    try { if (typeof calcSGL === 'function') calcSGL() } catch (e) {}
    const a = document.getElementById('sgl-interp'), b = document.getElementById('sgl-interp-tab');
    O.rotulo[p[1]] = { fila: N(a ? a.textContent : 'NO'), pest: N(b ? b.textContent : 'NO'),
                       color: a ? String(a.style.color || '') : '',
                       campo: (document.getElementById('sgl') || {}).value };
  });
  /* 4 · EL PANEL DE TERRITORIOS, abierto por el camino del medico */
  (() => {
    try { showTab('contractilidad') } catch (e) {}
    const h = document.querySelector('#sacc-contr .sacc-hdr');
    if (h && h.getAttribute('aria-expanded') !== 'true') { try { h.click() } catch (e) {} }
    const b = document.querySelector('[data-vinfo="contr-territorio"]');
    const pan = b ? b.closest('div').parentNode : null;
    O.territorio = { hayBoton: !!b, panel: pan ? N(pan.textContent) : 'NO' };
  })();
  /* 5 · LOS TRES GLOBOS NUEVOS: geometria y cinco puntos, con la seccion abierta y SIN
     animacion -la clase sacc-body abre con max-height y una transicion de 0,3 s-. */
  O.globos = {};
  ['contr-territorio', 'patrones-sgl', 'amil-apice'].forEach((k) => {
    const b = document.querySelector('[data-vinfo="' + k + '"]');
    if (!b) { O.globos[k] = 'NO EXISTE'; return; }
    let n0 = b.parentNode;
    while (n0 && n0.nodeType === 1 && n0 !== document.body) {
      if (n0.classList && n0.classList.contains('sacc')) {
        const h0 = n0.querySelector('.sacc-hdr');
        if (h0 && h0.getAttribute('aria-expanded') !== 'true') { try { h0.click() } catch (e) {} }
        const b0 = n0.querySelector('.sacc-body');
        if (b0) { b0.style.transition = 'none'; b0.style.maxHeight = 'none'; b0.style.overflow = 'visible'; }
        n0.classList.add('open');
      }
      if (getComputedStyle(n0).display === 'none') n0.style.display = 'block';
      n0 = n0.parentNode;
    }
    try { b.scrollIntoView({ block: 'center' }) } catch (e) {}
    const r = b.getBoundingClientRect();
    const pts = [[r.left + 1, r.top + 1], [r.right - 1, r.top + 1], [r.left + 1, r.bottom - 1],
                 [r.right - 1, r.bottom - 1], [(r.left + r.right) / 2, (r.top + r.bottom) / 2]];
    const hits = pts.map((p) => { const e2 = document.elementFromPoint(p[0], p[1]);
      return e2 === b ? 'propio' : (e2 ? e2.tagName : 'nada') });
    O.globos[k] = { w: Math.round(r.width), h: Math.round(r.height),
                    propios: hits.filter((x) => x === 'propio').length };
  });
  /* 6 · LA FICHA DE REFERENCIAS */
  (() => {
    try { showTab('referencias') } catch (e) {}
    try { if (typeof refSubInit === 'function') refSubInit() } catch (e) {}
    const f = document.getElementById('ref-strain');
    if (f) f.style.display = 'block';
    const t = N(f ? f.textContent : 'NO');
    O.ficha = { filas: document.querySelectorAll('#ref-strain table tr').length,
                folios: ['995', '996', '1442', '1558', '244'].filter((n) => t.indexOf(n) > -1).length,
                chips: (t.match(/CRITERIO DE ECOSMART/g) || []).length,
                len: t.length };
  })();
  /* 7 · TEXTO RECORTADO en las zonas de la tanda */
  (() => {
    const sels = ['#sgl-interp', '#sgl-interp-tab', '#ref-strain td', '#ref-strain th',
                  '#crit-apice .criterio-nombre', '.detalle-sgl'];
    const o = [];
    sels.forEach((s2) => { [].slice.call(document.querySelectorAll(s2)).forEach((e) => {
      const r = e.getBoundingClientRect(); if (r.width <= 0) return;
      if (e.scrollWidth > e.clientWidth + 1) o.push({ sel: s2, sw: e.scrollWidth, cw: e.clientWidth,
        txt: N(e.textContent).slice(0, 60) });
    }); });
    O.recortes = o;
  })();
  return O;
})()`;

for (const [nomMotor, motor] of [['chromium', chromium], ['webkit', webkit]]) {
  let nav = null;
  try { nav = await motor.launch(nomMotor === 'chromium' ? { channel: 'chrome' } : {}); }
  catch (e) { out.cruces[nomMotor] = { error: String(e).slice(0, 120) }; continue; }
  for (const W of [1440, 390]) {
    for (const tema of ['oscuro', 'claro']) {
      const clave = nomMotor + '/' + W + '/' + tema;
      const ctx = await nav.newContext({ viewport: { width: W, height: W === 390 ? 844 : 950 } });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', (e) => errs.push('PAGE ' + String(e.message).slice(0, 110)));
      pg.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 110)) });
      try {
        await pg.goto('http://127.0.0.1:' + PORT + '/index.html', { waitUntil: 'load', timeout: 180000 });
        await pg.waitForTimeout(900);
        if (tema === 'claro') await pg.evaluate(() => document.documentElement.classList.add('light-mode'));
        const r = await pg.evaluate(MEDIR, { timeout: 90000 });
        r._errores = errs.length; r._erroresTxt = errs.slice(0, 3);
        out.cruces[clave] = r;
        console.error('-- ' + clave + ' medido (pestanas ' + r.pestanas.conCaja + '/' + r.pestanas.n
          + ', errores ' + errs.length + ') --');
      } catch (e) { out.cruces[clave] = { ERROR: String(e).slice(0, 180) }; }
      await ctx.close();
    }
  }
  await nav.close();
}
srv.close();
console.log(JSON.stringify(out, null, 1));
process.exit(0);
