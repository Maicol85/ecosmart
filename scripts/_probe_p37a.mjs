#!/usr/bin/env node
/**
 * _probe_p37a.mjs - sonda de SOLO LECTURA de la PARTE A de PANT-37 (2026-11-11).
 * Mide el boton «What if» de la tarjeta de estenosis aortica: que exista, donde este, su alto,
 * su azul, y las CUATRO situaciones con su lista exacta de lo que falta, mas el globo.
 * Control negativo: la tarjeta de la MITRAL y la de la TRICUSPIDE no llevan boton.
 * Denominador: se confirma que la tarjeta aortica EXISTE antes de contar botones.
 *
 * ⚠️ El tema se pone por `ett_theme` + `loadTheme()`, no por `colorScheme`.
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en sus comentarios.
 *
 *   PW=... node scripts/_probe_p37a.mjs --file /tmp/index.HEAD.html
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

const MEDIR = `(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = {};
  const N = s => String(s == null ? '' : s).replace(/[\\s\\u00a0]+/g, ' ').trim();
  try { localStorage.setItem('ett_theme', 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  o.tema = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display = 'none';

  const poner = (id, val) => { const e = document.getElementById(id); if (!e) return false;
    e.value = String(val);
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  const sel = (id, val) => { const e = document.getElementById(id); if (!e) return false;
    const op = Array.prototype.slice.call(e.options || []).filter(x => x.value === val)[0];
    if (!op) return false; e.value = val;
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };

  try { showTab('paciente'); } catch (e) {}
  o.sembroPac = [poner('peso', 70), poner('talla', 170), poner('edad', 72), sel('sexo', 'M')];
  try { showTab('valvulas'); } catch (e) {}
  await esp(300);
  /* La pastilla de estenosis aortica PRENDIDA: sin ella la tarjeta no existe y contar botones
     daria cero sobre un denominador vacio. Es un TOGGLE, asi que se consulta antes. */
  try { if (typeof pillOn === 'function' && pillOn('aortica', 'esten') !== true) toggleValvPill('aortica', 'esten'); } catch (e) {}
  await esp(200);
  o.pastilla = (typeof pillOn === 'function') ? pillOn('aortica', 'esten') : 'SIN pillOn';

  /* OJO: ava_cont ES READONLY, lo calcula la CONTINUIDAD. Hay que sembrar sus tres insumos
     -diametro y VTI del TSVI, y VTI aortico-, no el area. Con 20 mm, 20 cm y 78,5 cm el area
     da 0,80 cm2, que es rango severo. */
  const ESC = {
    disc:   { diam_tsvi: 20, itv_tsvi: 20, itv_ao: 78.5, vmax_ao: 3.2, gmedio_ao: 25, vdfvi: 120, fevi: 45, ao_fc: 65, tango_te: 300 },
    conc:   { diam_tsvi: 20, itv_tsvi: 20, itv_ao: 78.5, vmax_ao: 4.5, gmedio_ao: 55, vdfvi: 120, fevi: 60, ao_fc: 65, tango_te: 300 },
    faltan: { diam_tsvi: 20, itv_tsvi: 20, itv_ao: 78.5, vmax_ao: 3.2, gmedio_ao: '',  vdfvi: '',  fevi: 45, ao_fc: 65, tango_te: 300 },
    prot:   { diam_tsvi: 20, itv_tsvi: 20, itv_ao: 78.5, vmax_ao: 3.2, gmedio_ao: 25, vdfvi: 120, fevi: 45, ao_fc: 65, tango_te: 300 }
  };
  const rgb = s => (String(s).match(/\\d+/g) || []).map(Number);
  o.esc = {};
  for (const k of ['disc', 'conc', 'faltan', 'prot']) {
    try { sel('va_morf', k === 'prot' ? 'TAVI' : '') || (document.getElementById('va_morf').value = (k === 'prot' ? 'TAVI' : ''),
          document.getElementById('va_morf').dispatchEvent(new Event('change', { bubbles: true }))); } catch (e) {}
    for (const id in ESC[k]) poner(id, ESC[k][id]);
    await esp(420);
    /* El panel 2D, abierto y repintado por el camino de la app. */
    try { if (typeof v2dVisible === 'function' && !v2dVisible()) v2dAbrir(); else if (typeof v2dRefrescar === 'function') v2dRefrescar(); } catch (e) {}
    await esp(320);
    const ul = document.getElementById('v2d-esten');
    const lis = ul ? Array.prototype.slice.call(ul.children) : [];
    const b = document.getElementById('wi-btn');
    const g = document.querySelector('[data-vinfo="wi-aplica"]');
    const fila = b ? b.closest('.wi-fila') : null;
    const liB = b ? b.closest('li') : null;
    let S = null; try { S = wiSituacion(); } catch (e) { S = { sit: 'ERROR ' + e.message }; }
    const cs = b ? getComputedStyle(b) : null;
    o.esc[k] = {
      tarjetas: lis.length,
      vacio: lis.length === 1 && String(lis[0].className || '').indexOf('v2d-vacio') > -1,
      titulos: lis.map(li => { const t = li.querySelector('.v2d-valv'); return t ? N(t.textContent) : '?' }).join(','),
      ava: document.getElementById('ava_cont') ? document.getElementById('ava_cont').value : null,
      vals: S && S.D ? [S.D.vmax, S.D.gmed, S.D.ava, S.D.vdf, S.D.vs, S.D.fevi, S.D.bsa, S.D.et, S.D.fc].join('/') : null,
      grados: S && S.D && S.D.R ? [S.D.R.gVel, S.D.R.gGrad, S.D.R.gAva, S.D.R.grado].join('/') : null,
      sit: S ? S.sit : null,
      falta: S ? (S.falta || []).join(' | ') : null,
      botones: ul ? ul.querySelectorAll('.wi-fila .btn').length : null,
      globos: ul ? ul.querySelectorAll('[data-vinfo="wi-aplica"]').length : null,
      enTarjetaAortica: !!liB && !!liB.querySelector('.v2d-valv') && N(liB.querySelector('.v2d-valv').textContent) === 'A\\u00f3rtica',
      clases: b ? String(b.className) : null,
      azul: !!b && b.classList.contains('btn-primary'),
      fondo: b ? cs.backgroundColor : null,
      alto: b ? Math.round(b.getBoundingClientRect().height) : null,
      ancho: b ? Math.round(b.getBoundingClientRect().width) : null,
      /* «abajo a la derecha»: la fila es el ultimo hijo del li y el boton termina pegado al borde
         derecho del li, menos su relleno. */
      ultimoHijo: !!liB && liB.lastElementChild === fila,
      aDerecha: (b && liB) ? Math.round(liB.getBoundingClientRect().right - b.getBoundingClientRect().right) : null,
      rotulo: b ? N(b.textContent) : null,
      titulo: b ? N(b.title) : null,
      aria: b ? N(b.getAttribute('aria-label')) : null,
      glifo: g ? N(g.textContent) : null,
      /* Control negativo: ninguna otra tarjeta, de ninguna de las dos columnas, lleva boton. */
      enInsuf: document.querySelectorAll('#v2d-insuf .wi-fila').length,
      otrasEsten: lis.filter(li => { const t = li.querySelector('.v2d-valv');
        return t && N(t.textContent) !== 'A\\u00f3rtica' && li.querySelector('.wi-fila') }).length
    };
  }

  /* ── El globo, en el escenario discordante ─────────────────────────────────────────── */
  for (const id in ESC.disc) poner(id, ESC.disc[id]);
  try { const m = document.getElementById('va_morf'); m.value = ''; m.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
  await esp(420);
  try { if (typeof v2dRefrescar === 'function') v2dRefrescar(); } catch (e) {}
  await esp(260);
  const gb = document.querySelector('[data-vinfo="wi-aplica"]');
  if (!gb) { o.globo = 'SIN BOTON'; } else {
    const r0 = gb.getBoundingClientRect();
    o.globoAnclaOk = r0.width > 0 && r0.height > 0;
    try { vInfoClic(gb); } catch (e) {}
    await esp (300);
    const c = document.getElementById('vinfo-card');
    const vis = c && getComputedStyle(c).display !== 'none';
    const ps = c ? Array.prototype.slice.call(c.querySelectorAll('p')) : [];
    const h4 = c ? c.querySelector('h4') : null;
    o.globo = {
      visible: !!vis,
      h4: h4 ? N(h4.textContent) : null,
      h4id: h4 ? h4.id : null,
      parrafos: ps.length,
      lineas: ps.map(p => N(p.textContent)),
      tamanos: ps.map(p => getComputedStyle(p).fontSize).join(','),
      tamTitulo: h4 ? getComputedStyle(h4).fontSize : null,
      elementos: c ? c.querySelectorAll('script,img,iframe,svg').length : null,
      ariaExp: gb.getAttribute('aria-expanded'),
      dentro: (function(){ if (!c) return null; const r = c.getBoundingClientRect();
        return r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; })()
    };
    try { vInfoCerrar(true); } catch (e) {}
  }
  o.scrollPagina = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('console', x => { if (x.type() === 'error') errs.push('consola: ' + x.text().slice(0, 140)) });
pg.on('pageerror', e => errs.push('pagina: ' + String(e.message).slice(0, 140)));
let out;
try {
  await pg.goto(URL0, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(2600);
  out = await pg.evaluate(MEDIR);
} catch (e) { out = { error: String(e).slice(0, 300) }; }
out.errores = errs;
console.log(JSON.stringify(out, null, 1));
await ctx.close(); await nav.close(); srv.close();
