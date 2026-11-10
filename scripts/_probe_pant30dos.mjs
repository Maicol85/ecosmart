#!/usr/bin/env node
/**
 * _probe_pant30dos.mjs - el cruce de DOS MOTORES de la tanda PANT-30 (2026-11-10).
 * Chrome (el del sistema, por channel) y WebKit, en 1440 / 1000 / 768 / 390 px y en los dos
 * temas: 16 cruces por motor. Mide la Parte A (el boton, el menu, la hoja y el ancho de la hoja
 * del ETE con sus dos columnas) y la Parte B (la seccion del Laboratorio, su grafico y su
 * resumen), mas el desplazamiento horizontal, el texto recortado y los errores de consola y de
 * pagina.
 *
 * ⚠️ PLAYWRIGHT NO ESTA INSTALADO EN EL REPO NI GLOBALMENTE, y se midio: `npm ls -g` da tres
 * paquetes y ninguno es playwright. En ~/Library/Caches/ms-playwright quedan los binarios de una
 * instalacion que ya no existe -- webkit-2370, que es el de playwright 1.64-, asi que se instala
 * el paquete FUERA del repo, en el directorio de trabajo temporal de la sesion, y se importa de
 * ahi. Es el mismo patron que `_probe_pant24ab.mjs` usaba con ~/.pwtmp.
 *   PW=/ruta/a/node_modules/playwright node scripts/_probe_pant30dos.mjs
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema.
 * ⚠️ SE SIRVE POR HTTP: en file:// el origen es opaco y no hay localStorage ni IndexedDB.
 * Nombre propio: verificado con ls, no existia.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';

const CAND = [process.env.PW,
  '/private/tmp/claude-501/-Users-maicoldossantos--claude-spares-spare-UptycX/de3e0e91-d286-4c0f-b235-11d155d451a4/scratchpad/p30/pw/node_modules/playwright/index.js',
  process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'].filter(Boolean);
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default || (await import(c)); break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }

const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || nom;
      const p = join(raiz, rel);
      if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(await readFile(p));
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0, '127.0.0.1', () => res({ srv: s, port: s.address().port }));
});
const URL0 = 'http://127.0.0.1:' + port + '/' + nom;

const MEDIR = `(async () => {
  const esp = (ms) => new Promise(r => setTimeout(r, ms));
  const caja = (el) => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), vis: !!el.offsetParent } };
  const o = {};
  /* ── Parte A ── */
  if (window.showTab) showTab('informe');
  await esp(260);
  const b = document.getElementById('doc-btn');
  o.btn = caja(b);
  if (b) { b.click(); await esp(140); }
  const m = document.getElementById('doc-menu');
  o.menu = caja(m);
  o.opciones = m ? m.querySelectorAll('button').length : 0;
  o.opcionesAltas = m ? Array.prototype.slice.call(m.querySelectorAll('button'))
    .filter(x => Math.round(x.getBoundingClientRect().height) >= 44).length : 0;
  if (m && !m.hidden) { document.body.click(); await esp(80); }
  window.docAbrir('ete'); await esp(420);
  const h = document.getElementById('doc-hoja');
  o.hoja = caja(h);
  o.hojaChars = h ? (h.innerText || '').length : 0;
  const c2 = h ? h.querySelector('.doc-chk2') : null;
  o.chk2cols = c2 ? getComputedStyle(c2).gridTemplateColumns.split(' ').length : 0;
  o.editables = h ? h.querySelectorAll('[contenteditable="true"]').length : 0;
  o.recortadosHoja = h ? Array.prototype.slice.call(h.querySelectorAll('*'))
    .filter(e => !e.children.length && e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1).length : 0;
  o.scrollHojaOv = (function () { const w = document.querySelector('.doc-hoja-wrap');
    return w ? (w.scrollWidth - w.clientWidth) : null })();
  /* El PDF y la imagen, en los dos motores: que el maquetador de las mismas hojas. */
  const D = window.docDatos();
  const bl = window.DOC_DEFS.ete.bloques().map((x, i) => { const c = { t: x.t, i: i };
    if (x.x !== undefined) c.x = x.x; if (x.items) c.items = x.items.slice();
    if (x.fuerte) c.fuerte = x.fuerte; if (x.nonum) c.nonum = x.nonum; if (x.grupo) c.grupo = x.grupo;
    return c });
  const maq = window.docMaquetar(window.DOC_DEFS.ete, D, bl);
  o.hojasEte = maq ? maq.n : null;
  o.opsEte = maq ? maq.hojas.reduce((a, x) => a + x.length, 0) : null;
  window.docCerrar(); await esp(120);
  /* ── Parte B ── */
  if (window.showTab) showTab('lab');
  await esp(320);
  const sub = Array.prototype.slice.call(document.querySelectorAll('.lab-subtab'))
    .filter(x => (x.getAttribute('onclick') || '').indexOf("'mediciones'") > -1)[0];
  if (sub) sub.click();
  await esp(320);
  const body = document.getElementById('lab-acc-protesis');
  const hdr = document.querySelector('[aria-controls="lab-acc-protesis"]');
  if (hdr && body && getComputedStyle(body).display === 'none') hdr.click();
  await esp(420);
  o.secAbierta = !!(body && body.offsetParent);
  const mk = (c) => ({ id: Math.random(), campos: c });
  const PP = 'Pr' + String.fromCharCode(243) + 'tesis mec' + String.fromCharCode(225) + 'nica';
  window.labProtRender([mk({ va_morf: PP, va_prot_modelo: 'ATS', informe_texto: '' }),
                        mk({ vm_morf: 'Plastia mitral', informe_texto: '' })]);
  await esp(420);
  o.resumen = (function () { const r = document.getElementById('lab-prot-resumen');
    return r ? { n: r.children.length, cols: getComputedStyle(r).gridTemplateColumns.split(' ').length } : null })();
  o.canvas = caja(document.getElementById('lab-prot-chart'));
  o.filasMod = document.querySelectorAll('#lab-prot-mod-tabla tbody tr').length;
  o.trastBarras = document.querySelectorAll('#lab-prot-trast .lab-bar-row').length;
  o.recortadosSec = body ? Array.prototype.slice.call(body.querySelectorAll('*'))
    .filter(e => !e.children.length && e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1).length : 0;
  o.scrollH = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  return o;
})()`;

const OUT = {};
for (const motor of ['chrome', 'webkit']) {
  const lanzador = motor === 'chrome' ? _pw.chromium : _pw.webkit;
  let nav = null;
  try {
    nav = await lanzador.launch(motor === 'chrome' ? { channel: 'chrome' } : {});
  } catch (e) { OUT[motor] = { error: String(e).slice(0, 180) }; continue; }
  for (const tema of ['dia', 'noche']) {
    for (const w of [1440, 1000, 768, 390]) {
      const ctx = await nav.newContext({ viewport: { width: w, height: 900 },
        colorScheme: tema === 'noche' ? 'dark' : 'light' });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('console', x => { if (x.type() === 'error') errs.push('consola: ' + x.text().slice(0, 120)) });
      pg.on('pageerror', e => errs.push('pagina: ' + String(e.message).slice(0, 120)));
      try {
        await pg.goto(URL0, { waitUntil: 'load', timeout: 120000 });
        await pg.waitForTimeout(2600);
        const r = await pg.evaluate(MEDIR);
        r.errores = errs;
        OUT[motor + '/' + tema + '/' + w] = r;
      } catch (e) {
        OUT[motor + '/' + tema + '/' + w] = { error: String(e).slice(0, 180), errores: errs };
      }
      await ctx.close();
    }
  }
  await nav.close();
}
console.log(JSON.stringify(OUT, null, 1));
srv.close();
process.exit(0);
