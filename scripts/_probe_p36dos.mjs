#!/usr/bin/env node
/**
 * _probe_p36dos.mjs - el cruce de DOS MOTORES de la tanda PANT-36 (2026-11-11). Copia del de
 * PANT-34 con las mediciones de esta tanda.
 * Chrome (el del sistema, por channel) y WebKit, en 1440 / 1280 / 1000 / 768 / 390 px y en los
 * dos temas: 10 cruces por motor. Mide la entrada «Asociaciones y sindromes» -- su lugar en el
 * panel, sus dos tablas con sus filas y columnas, su envoltorio que se desplaza dentro de si
 * mismo, su primera columna en negrita y sus celdas sin negros -- y los quince resumenes de
 * `ref-congenitas` -- sus 31 hijos, su molde, su techo y sus vinietas --, mas el desplazamiento
 * horizontal de la pagina, el texto recortado y los errores de consola y de pagina.
 *
 * ⚠️ EL TEMA SE PONE POR `ett_theme` + `loadTheme()` Y NO POR `colorScheme`: el tema de esta app
 * es la clase `light-mode` del <html>, que NO depende de `prefers-color-scheme`. Es el hallazgo
 * de metodo de PANT-34, y la sonda DEVUELVE que tema quedo puesto para que un cero no pueda ser
 * un cero sobre el mismo tema medido dos veces.
 * ⚠️ HAY QUE ACTIVAR LA SUBPESTANIA, no solo la pestana: Referencias muestra UN panel a la vez,
 * asi que con `calc` delante la entrada no tiene geometria y el desplazamiento del envoltorio da
 * cero sobre un denominador vacio.
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema.
 * ⚠️ SE SIRVE POR HTTP: en file:// el origen es opaco y no hay localStorage ni IndexedDB.
 * Nombre propio: verificado con ls, no existia.
 *
 *   PW=/ruta/a/node_modules/playwright node scripts/_probe_p36dos.mjs
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';

const CAND = [process.env.PW,
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

const MEDIR = (tema) => `(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = { w: innerWidth, temaPedido: '${tema}' };
  const N = (s) => String(s == null ? '' : s).replace(/[\\s\\u00a0]+/g, ' ').trim();
  /* El TEMA, por la clave que la app lee de verdad. */
  try { localStorage.setItem('ett_theme', '${tema}' === 'dia' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  o.temaPuesto = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay');
  if (lo) lo.style.display = 'none';

  try { showTab('refs'); } catch (e) {}
  try { if (typeof refSubTab === 'function') refSubTab('congenitas'); } catch (e) {}
  await esp(500);
  const pan = document.getElementById('ref-sub-congenitas');
  o.panel = { existe: !!pan, visible: !!pan && getComputedStyle(pan).display !== 'none',
              ancho: pan ? Math.round(pan.getBoundingClientRect().width) : null };
  const cards = pan ? Array.prototype.slice.call(pan.querySelectorAll('.card')) : [];
  o.orden = cards.map(c => { const b = c.querySelector('.card-body'); return b ? b.id : '?' }).join(',');

  /* ── la entrada nueva ───────────────────────────────────────────────────────────────── */
  const d = document.getElementById('ref-asoc');
  if (d && getComputedStyle(d).display === 'none') { try { toggleRef('asoc', d.previousElementSibling); } catch (e) {} }
  await esp(260);
  const rgb = (s) => (String(s).match(/\\d+/g) || []).map(Number);
  if (!d) { o.asoc = 'NO EXISTE'; } else {
    const tbs = Array.prototype.slice.call(d.querySelectorAll('table'));
    const wraps = Array.prototype.slice.call(d.querySelectorAll('div[style*="overflow-x"]'));
    const celdas = Array.prototype.slice.call(d.querySelectorAll('th,td'));
    o.asoc = {
      abierta: getComputedStyle(d).display !== 'none' && d.getBoundingClientRect().width > 0,
      ancho: Math.round(d.getBoundingClientRect().width),
      tablas: tbs.length,
      filas: tbs.map(t => t.querySelectorAll('tr').length).join('/'),
      columnas: tbs.map(t => { const f = t.querySelector('tr'); return f ? f.querySelectorAll('th').length : 0 }).join('/'),
      envoltorios: wraps.length,
      desplaza: wraps.map(w => Math.max(0, w.scrollWidth - w.clientWidth)).join('/'),
      negritaCol1: (function () { let ok = 0, mal = 0;
        tbs.forEach(t => Array.prototype.slice.call(t.querySelectorAll('tr')).slice(1).forEach(tr => {
          const tds = tr.querySelectorAll('td');
          if (tds.length && getComputedStyle(tds[0]).fontWeight === '700') ok++; else mal++; }));
        return ok + '/' + (ok + mal); })(),
      negros: celdas.filter(e => { const c = rgb(getComputedStyle(e).color);
        return c.length >= 3 && c[0] === 0 && c[1] === 0 && c[2] === 0 }).length,
      controles: d.querySelectorAll('input,select,textarea,button').length,
      cursivas: d.querySelectorAll('i,em').length
    };
  }

  /* ── los quince resumenes ───────────────────────────────────────────────────────────── */
  const dc = document.getElementById('ref-congenitas');
  if (dc && getComputedStyle(dc).display === 'none') { try { toggleRef('congenitas', dc.previousElementSibling); } catch (e) {} }
  await esp(240);
  if (!dc) { o.res = 'NO EXISTE'; } else {
    const H = Array.prototype.slice.call(dc.children).map(h => { const cs = getComputedStyle(h);
      const t = N(h.textContent); let v = 0;
      for (let i = 0; i < t.length; i++) if (t.charCodeAt(i) === 8226) v++;
      return { chars: t.length, vin: v, peso: cs.fontWeight, size: cs.fontSize, lh: cs.lineHeight,
               vis: cs.display !== 'none' && h.getBoundingClientRect().width > 0 }; });
    let maxC = 0, maxV = 0, fueraMolde = 0, invisibles = 0;
    for (let i = 1; i + 1 < H.length; i += 2) {
      const t = H[i], c = H[i + 1];
      maxC = Math.max(maxC, t.chars + c.chars); maxV = Math.max(maxV, c.vin);
      /* ⚠️ EL INTERLINEADO SE COMPARA COMO NUMERO Y NO COMO CADENA: el mismo 1,8 sobre 12 px
         se serializa «21.6px» en Chrome y «21.599998px» en WebKit. Con la comparacion de cadena
         los quince resumenes salian «fuera del molde» en WebKit y ninguno en Chrome -- una
         diferencia de SERIALIZACION leida como una diferencia de la app. */
      const lh = parseFloat(c.lh);
      if (t.peso !== '700' || c.peso === '700' || t.size !== '12px' || c.size !== '12px'
          || !(lh > 21.5 && lh < 21.7)) fueraMolde++;
      if (!t.vis || !c.vis) invisibles++;
    }
    o.res = { hijos: H.length, resumenes: (H.length - 1) / 2, maxChars: maxC, maxVinietas: maxV,
              fueraMolde: fueraMolde, invisibles: invisibles, cursivas: dc.querySelectorAll('i,em').length };
  }

  /* ── lo general ─────────────────────────────────────────────────────────────────────── */
  const recortados = [];
  document.querySelectorAll('#ref-sub-congenitas th, #ref-sub-congenitas td, #ref-sub-congenitas div').forEach(e => {
    const t = (e.textContent || '').trim();
    if (!t) return;
    if (getComputedStyle(e).overflowX === 'auto') return;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible')
      recortados.push(t.slice(0, 24));
  });
  o.recortados = recortados;
  o.scrollPagina = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
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
    for (const w of [1440, 1280, 1000, 768, 390]) {
      const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('console', x => { if (x.type() === 'error') errs.push('consola: ' + x.text().slice(0, 120)) });
      pg.on('pageerror', e => errs.push('pagina: ' + String(e.message).slice(0, 120)));
      try {
        await pg.goto(URL0, { waitUntil: 'load', timeout: 120000 });
        await pg.waitForTimeout(2600);
        const r = await pg.evaluate(MEDIR(tema));
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
