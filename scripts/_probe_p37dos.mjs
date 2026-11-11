#!/usr/bin/env node
/**
 * _probe_p37dos.mjs - el cruce de DOS MOTORES de la tanda PANT-37 (2026-11-11). Copia del de
 * PANT-36 con las mediciones de esta tanda.
 * Chrome (el del sistema, por channel) y WebKit, en 1440 / 1280 / 1000 / 768 / 390 px y en los
 * dos temas: 10 cruces por motor. Mide el boton con su azul y su piso tactil, el panel con su
 * lugar y su ancho, que NO tape el dibujo, los controles con su alto, las tres graficas, el
 * chip, el rotulo de la Vmax, el desplazamiento horizontal, el texto recortado y los errores de
 * consola y de pagina.
 *
 * ⚠️ EL TEMA SE PONE POR `ett_theme` + `loadTheme()` Y NO POR `colorScheme`: el tema de esta app
 * es la clase `light-mode` del <html>. La sonda DEVUELVE que tema quedo puesto para que un cero
 * no pueda ser un cero sobre el mismo tema medido dos veces.
 * ⚠️ HAY QUE ABRIR LA PESTANIA DE VALVULAS Y LA VISTA 2D: sin eso nada tiene geometria.
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema.
 * ⚠️ Sin acentos graves dentro del template, tampoco en sus comentarios.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';

const CAND = [process.env.PW, process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'].filter(Boolean);
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default || (await import(c)); break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }

const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
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
  const N = s => String(s == null ? '' : s).replace(/[\\s\\u00a0]+/g, ' ').trim();
  const EL = id => document.getElementById(id);
  try { localStorage.setItem('ett_theme', '${tema}' === 'dia' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  o.temaPuesto = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = EL('login-overlay'); if (lo) lo.style.display = 'none';
  const poner = (id, v) => { const e = EL(id); if (!e) return false; e.value = String(v);
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };

  try { showTab('paciente'); } catch (e) {}
  poner('peso', 70); poner('talla', 170);
  { const e = EL('sexo'); if (e) { e.value = 'M'; e.dispatchEvent(new Event('change', { bubbles: true })); } }
  try { showTab('valvulas'); } catch (e) {}
  await esp(300);
  const D = { diam_tsvi: 20, itv_tsvi: 20, itv_ao: 78.5, vmax_ao: 3.2, gmedio_ao: 25,
              vdfvi: 120, fevi: 45, ao_fc: 65, tango_te: 300 };
  for (const k in D) poner(k, D[k]);
  try { if (typeof pillOn === 'function' && pillOn('aortica', 'esten') !== true) toggleValvPill('aortica', 'esten'); } catch (e) {}
  await esp(500);
  try { if (typeof v2dVisible === 'function' && !v2dVisible()) v2dAbrir(); } catch (e) {}
  await esp(400);

  const b = EL('wi-btn');
  o.boton = b ? { alto: Math.round(b.getBoundingClientRect().height),
                  ancho: Math.round(b.getBoundingClientRect().width),
                  azul: b.classList.contains('btn-primary'),
                  fondo: getComputedStyle(b).backgroundColor,
                  rotulo: N(b.textContent) } : 'NO EXISTE';
  o.situacion = (function(){ try { return wiSituacion().sit } catch (e) { return 'ERR' } })();
  const gl = document.querySelector('[data-vinfo="wi-aplica"]');
  o.globoBtn = gl ? Math.round(gl.getBoundingClientRect().height) : -1;
  if (b) b.click();
  await esp(450);
  try { if (EL('wi-area-abre')) EL('wi-area-abre').click(); } catch (e) {}
  await esp(350);

  const pan = EL('wi-panel'), dib = EL('v2d-dibujo');
  if (!pan) { o.panel = 'NO EXISTE'; } else {
    const rp = pan.getBoundingClientRect(), rd = dib ? dib.getBoundingClientRect() : null;
    const inter = rd ? Math.max(0, Math.min(rp.right, rd.right) - Math.max(rp.left, rd.left))
                     * Math.max(0, Math.min(rp.bottom, rd.bottom) - Math.max(rp.top, rd.top)) : -1;
    o.panel = {
      rects: [Math.round(rp.left), Math.round(rp.top), Math.round(rp.right), Math.round(rp.bottom)].join(',')
        + ' | dibujo ' + (rd ? [Math.round(rd.left), Math.round(rd.top), Math.round(rd.right), Math.round(rd.bottom)].join(',') : '-')
        + ' | tx ' + (pan.style.transform || '(sin)') + ' | ventana ' + innerWidth + 'x' + innerHeight,
      abierto: !pan.classList.contains('wi-oculto'),
      posicion: getComputedStyle(pan).position,
      ancho: Math.round(rp.width), alto: Math.round(rp.height),
      tapaElDibujo: Math.round(inter),
      dentro: rp.left >= -1 && rp.right <= innerWidth + 1,
      sit: N(EL('wi-sit') ? EL('wi-sit').textContent : ''),
      filas: EL('wi-tb') ? EL('wi-tb').children.length : -1,
      graficas: ['wi-ch1', 'wi-ch2', 'wi-ch3']
        .map(id => { const s = EL(id); return s && s.getBoundingClientRect().width > 0 ? 1 : 0 }).join(''),
      nodosGraf: ['wi-ch1', 'wi-ch2', 'wi-ch3'].map(id => { const s = EL(id); return s ? s.querySelectorAll('*').length : -1 }).join('/'),
      negrosGraf: ['wi-ch1', 'wi-ch2', 'wi-ch3'].reduce((n, id) => { const s = EL(id); if (!s) return n;
        return n + Array.prototype.slice.call(s.querySelectorAll('*')).filter(e => {
          const a = String(e.getAttribute('fill') || '') + String(e.getAttribute('stroke') || '');
          return a.indexOf('#000') > -1 || a.indexOf('black') > -1 || a.indexOf('var(') > -1 }).length; }, 0),
      chip: EL('wi-chip') ? !EL('wi-chip').classList.contains('wi-oculto') : 'NO EXISTE',
      rotuloVmax: EL('wi-dib-vmax') ? N(EL('wi-dib-vmax').textContent) : 'NO EXISTE',
      /* los controles: alto visible y area tactil real */
      controles: ['wi-mv-vs', 'wi-mv-fe', 'wi-area-fija', 'wi-area-abre', 'wi-reset', 'wi-cerrar']
        .map(id => { const e = EL(id); if (!e) return id + ':NO';
          const r = e.getBoundingClientRect();
          const ps = getComputedStyle(e, '::after');
          return id + ':' + Math.round(r.height) + '/' + (ps ? ps.height : '?'); }).join(' '),
      bajo30: ['wi-mv-vs', 'wi-mv-fe', 'wi-area-fija', 'wi-area-abre', 'wi-reset']
        .filter(id => { const e = EL(id); return e && e.getBoundingClientRect().height < 30 }).length,
      deslizadores: ['wi-r1', 'wi-r2', 'wi-r3'].map(id => { const e = EL(id);
        return e && e.getBoundingClientRect().width > 0 ? Math.round(e.getBoundingClientRect().height) : 0 }).join('/')
    };
  }
  /* texto recortado dentro del panel */
  const rec = [];
  if (pan) pan.querySelectorAll('p,td,span,label,button').forEach(e => {
    const t = (e.textContent || '').trim(); if (!t) return;
    if (getComputedStyle(e).overflowX === 'auto') return;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible') rec.push(t.slice(0, 22));
  });
  o.recortados = rec;
  o.scrollPagina = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  return o;
})()`;

const OUT = {};
for (const motor of ['chrome', 'webkit']) {
  const lanzador = motor === 'chrome' ? _pw.chromium : _pw.webkit;
  let nav = null;
  try { nav = await lanzador.launch(motor === 'chrome' ? { channel: 'chrome' } : {}); }
  catch (e) { OUT[motor] = { error: String(e).slice(0, 180) }; continue; }
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
      } catch (e) { OUT[motor + '/' + tema + '/' + w] = { error: String(e).slice(0, 180), errores: errs }; }
      await ctx.close();
    }
  }
  await nav.close();
}
console.log(JSON.stringify(OUT, null, 1));
srv.close();
