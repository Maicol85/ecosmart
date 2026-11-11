#!/usr/bin/env node
/**
 * _probe_p34dos.mjs - el cruce de DOS MOTORES de la tanda PANT-34 (2026-11-11). Copia del de
 * PANT-33 con las mediciones de esta tanda.
 * Chrome (el del sistema, por channel) y WebKit, en 1440 / 1280 / 1000 / 768 / 390 px y en los
 * dos temas: 10 cruces por motor. Mide el panel de Coronarias -las NUEVE vistas, el titulo FIJO
 * del boton, la tilde, el selector de arteria en la MISMA fila y los OCHO botones de 44 px-, el
 * ROTULO dentro del cuadro por pixeles, y el esquema de anomalias coronarias de Referencias -sus
 * cinco apartados, sus dieciocho casillas, su cuadro al costado o debajo segun el ancho, su zona
 * tactil y su color sin negros-, mas el desplazamiento horizontal, el texto recortado, los
 * controles por debajo de 44 px y los errores de consola y de pagina.
 *
 * ⚠️ EL TEMA SE PONE POR `ett_theme` Y NO POR `colorScheme`, Y ESTO CORRIGE UN DEFECTO DE LAS
 * SONDAS DE LAS TANDAS ANTERIORES. El tema de esta app es la clase `light-mode` en el <html>, y
 * la pone `loadTheme()` leyendo `localStorage.ett_theme`: NO depende de `prefers-color-scheme`.
 * O sea que el `colorScheme` del contexto de Playwright -que es lo que usaban los cruces de
 * «dos temas» de PANT-30 a PANT-33- no cambia nada, y esos cruces median el tema OSCURO las dos
 * veces. Acá se siembra la clave, se llama a `loadTheme()` y la sonda DEVUELVE qué tema quedó
 * puesto, para que el cero no pueda volver a ser un cero sobre el mismo tema.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema.
 * ⚠️ SE SIRVE POR HTTP: en file:// el origen es opaco y no hay localStorage ni IndexedDB.
 * Nombre propio: verificado con ls, no existia.
 *
 *   PW=/ruta/a/node_modules/playwright node scripts/_probe_p34dos.mjs
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
  const caja = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top), l: Math.round(r.left) }; };
  const lim = (s) => String(s == null ? '' : s).replace(/[\\s\\u00a0]+/g, ' ').trim();
  /* El TEMA, por la clave que la app lee de verdad. */
  try { localStorage.setItem('ett_theme', '${tema}' === 'dia' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  o.temaPuesto = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay');
  if (lo) lo.style.display = 'none';

  /* ══ PARTE A y C · el panel de Coronarias ══════════════════════════════════════════════ */
  try { showTab('contractilidad'); } catch (e) {}
  await esp(300);
  const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } };
  set('ddfvi', '58'); set('vdfvi', '140'); set('vsfvi', '56'); set('fevi', '60');
  try { if (typeof calcVI === 'function') calcVI(); } catch (e) {}
  await esp(400);
  const b3d = document.getElementById('lv3d-btn');
  if (b3d && b3d.getAttribute('aria-expanded') !== 'true') b3d.click();
  await esp(900);
  o.tresD = { abierto: !!(window.lv3dDiag && lv3dDiag().abierto),
              aviso: window.lv3dDiag ? lv3dDiag().aviso : 'SIN DIAG' };
  const cb = document.querySelector('#lv3d-panel .lv3d-coro-btn');
  if (cb && window.lv3dCoroDiag && !lv3dCoroDiag().coro) cb.click();
  await esp(400);
  const pan = document.getElementById('lv3d-coro-panel');
  o.panel = { filas: pan ? pan.children.length : null,
              display: pan ? getComputedStyle(pan).display : null,
              caja: caja(pan) };
  const vb = document.querySelector('.lv3d-coro-vista-btn');
  const ab = document.querySelector('.lv3d-coro-art-btn');
  o.fila = { vista: caja(vb), arteria: caja(ab),
             tituloVista: lim(vb && vb.textContent), tituloArteria: lim(ab && ab.textContent),
             mismaFila: !!(vb && ab) && Math.abs(vb.getBoundingClientRect().top - ab.getBoundingClientRect().top) < 4 };
  if (vb) vb.click();
  await esp(140);
  const ops = Array.prototype.slice.call(document.querySelectorAll('#lv3d-coro-lista .lv3d-coro-v'));
  o.vistas = { n: ops.length, nombres: ops.map(b => lim(b.textContent)).join(' | '),
               conAngio: !!document.querySelector('#lv3d-coro-lista .lv3d-coro-angio'),
               listaDentro: (function () { const l = document.getElementById('lv3d-coro-lista');
                 if (!l) return null; const r = l.getBoundingClientRect();
                 return r.left >= -1 && r.right <= innerWidth + 1; })() };
  /* Elegir la vista 7 («Lateral»): el titulo NO tiene que cambiar y la tilde marca la activa. */
  const op7 = document.querySelector('#lv3d-coro-lista .lv3d-coro-v[data-v="7"]');
  if (op7) op7.click();
  await esp(200);
  o.trasVista = { titulo: lim(vb && vb.textContent),
                  conTilde: Array.prototype.filter.call(document.querySelectorAll('#lv3d-coro-lista .lv3d-coro-v'),
                    b => lim(b.textContent).indexOf(String.fromCharCode(10003)) === 0)
                    .map(b => lim(b.textContent)).join('+'),
                  vista: window.lv3dCoroDiag ? lv3dCoroDiag().vista : null };
  /* El ROTULO en el lienzo, por pixeles. La animacion se pausa y la fase se fija. */
  try { _lv3d.corriendo = false; _lv3d.fase = 0; if (typeof lv3dDibujar === 'function') lv3dDibujar(); } catch (e) {}
  await esp(200);
  o.rotulo = (function () {
    const cv = document.getElementById('lv3d-canvas');
    if (!cv) return null;
    const ctx = cv.getContext('2d'), dpr = window.devicePixelRatio || 1;
    const tinta = (x0, y0, x1, y1) => { const d = ctx.getImageData(Math.round(x0*dpr), Math.round(y0*dpr),
      Math.round((x1-x0)*dpr), Math.round((y1-y0)*dpr)).data;
      let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++; return n };
    return { rincon: tinta(520, 310, 676, 350), brujula: tinta(10, 290, 110, 375) };
  })();
  /* El selector de arteria: sus tres opciones y lo que dibuja cada lado. */
  if (ab) ab.click();
  await esp(140);
  const opsA = Array.prototype.slice.call(document.querySelectorAll('.lv3d-coro-a'));
  o.arteria = { n: opsA.length, nombres: opsA.map(b => lim(b.textContent)).join(' | '),
                listaDentro: (function () { const l = document.getElementById('lv3d-coro-lista-art');
                  if (!l) return null; const r = l.getBoundingClientRect();
                  return r.left >= -1 && r.right <= innerWidth + 1; })() };
  const der = document.querySelector('.lv3d-coro-a[data-a="der"]');
  if (der) der.click();
  await esp(200);
  o.lados = { der: window.lv3dCoroSonda ? lv3dCoroSonda(0).letras.slice().sort().join(',') : null };
  if (ab) ab.click();
  const izq = document.querySelector('.lv3d-coro-a[data-a="izq"]');
  if (izq) izq.click();
  await esp(200);
  o.lados.izq = window.lv3dCoroSonda ? lv3dCoroSonda(0).letras.slice().sort().join(',') : null;
  if (ab) ab.click();
  const tod = document.querySelector('.lv3d-coro-a[data-a="todas"]');
  if (tod) tod.click();
  await esp(160);
  o.lados.todas = window.lv3dCoroSonda ? lv3dCoroSonda(0).letras.slice().sort().join(',') : null;
  /* Los OCHO botones del panel y su piso tactil. */
  const bts = Array.prototype.slice.call(document.querySelectorAll(
    '#lv3d-panel .lv3d-coro-btn, #lv3d-coro-panel .lv3d-coro-vista-btn, #lv3d-coro-panel .lv3d-coro-art-btn, #lv3d-coro-panel .lv3d-coro-dom, #lv3d-coro-panel .lv3d-coro-transp, #lv3d-coro-panel .lv3d-coro-letras'));
  o.botones = { n: bts.length, altos: bts.map(b => Math.round(b.getBoundingClientRect().height)).join(','),
                bajo44: bts.filter(b => b.getBoundingClientRect().height < 44).length };
  o.scrollContr = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);

  /* ══ PARTE B · el esquema de Referencias ══════════════════════════════════════════════ */
  try { showTab('refs'); } catch (e) {}
  await esp(300);
  const sb = document.getElementById('ref-subtab-congenitas');
  if (sb) sb.click();
  await esp(220);
  const cuerpo = document.getElementById('ref-coronarias');
  const h2 = cuerpo ? cuerpo.closest('.card').querySelector('h2.card-head') : null;
  if (cuerpo && getComputedStyle(cuerpo).display === 'none' && h2) h2.click();
  await esp(260);
  const aps = Array.prototype.slice.call(document.querySelectorAll('#rac-root [data-rac-ap]'));
  o.ficha = { abierta: cuerpo ? getComputedStyle(cuerpo).display : null,
              hijos: cuerpo ? cuerpo.children.length : null,
              apartados: aps.length,
              siglas: aps.map(a => lim((a.querySelector('.rac-sigla') || {}).textContent)).join(','),
              casillas: document.querySelectorAll('#rac-root input[data-rac]').length,
              conId: Array.prototype.filter.call(document.querySelectorAll('#rac-root input[data-rac]'), c => !!c.id).length,
              tildadas: Array.prototype.filter.call(document.querySelectorAll('#rac-root input[data-rac]'), c => c.checked).length,
              ocultos: Array.prototype.filter.call(document.querySelectorAll('#rac-root [data-rac-esq]'),
                e => getComputedStyle(e).display === 'none').length };
  /* Tildar las cinco del primer apartado y medir el cuadro. */
  const a1 = document.querySelector('[data-rac-ap="aaorca"]');
  if (a1) {
    a1.querySelectorAll('input[data-rac]').forEach(c => { c.checked = true; });
    try { if (typeof racDibujar === 'function') racDibujar('aaorca'); } catch (e) {}
    await esp(220);
    const cu = a1.querySelector('.rac-cuerpo'), tx = a1.querySelector('.rac-txt'), es = a1.querySelector('.rac-esq');
    const rt = tx.getBoundingClientRect(), re = es.getBoundingClientRect();
    o.esquema = { dir: getComputedStyle(cu).flexDirection,
                  txt: Math.round(rt.width), esq: Math.round(re.width),
                  abajo: re.top > rt.top + 10,
                  solapa: !(re.left >= rt.right - 1 || re.top >= rt.bottom - 1
                            || rt.left >= re.right - 1 || rt.top >= re.bottom - 1),
                  svg: !!a1.querySelector('svg'),
                  vb: a1.querySelector('svg') ? a1.querySelector('svg').getAttribute('viewBox') : null,
                  trazos: a1.querySelectorAll('svg path').length,
                  textos: a1.querySelectorAll('svg text').length,
                  leyenda: a1.querySelectorAll('.rac-ley-f').length,
                  pie: lim((a1.querySelector('.rac-pie') || {}).textContent).length,
                  negros: Array.prototype.filter.call(a1.querySelectorAll('svg path'),
                    p => getComputedStyle(p).stroke === 'rgb(0, 0, 0)').length,
                  colores: Array.from(new Set(Array.prototype.map.call(a1.querySelectorAll('svg path'),
                    p => getComputedStyle(p).stroke))).join(' '),
                  zonaMin: Math.min.apply(null, Array.prototype.map.call(a1.querySelectorAll('.rac-chk'),
                    l => Math.round(l.querySelector('.rac-chk-t').getBoundingClientRect().height))) };
    /* Y los rotulos del SVG, que no pueden salirse del lienzo. */
    const svg = a1.querySelector('svg');
    o.esquema.fuera = svg ? Array.prototype.filter.call(svg.querySelectorAll('text'), t => {
      const b = t.getBBox();
      return b.x < -0.5 || b.y < -0.5 || b.x + b.width > 400.5 || b.y + b.height > 360.5; }).length : null;
    a1.querySelectorAll('input[data-rac]').forEach(c => { c.checked = false; });
    try { if (typeof racDibujar === 'function') racDibujar('aaorca'); } catch (e) {}
  }
  await esp(160);
  /* Texto recortado dentro de la ficha: lo que el medico no puede leer. */
  const recortados = [];
  Array.prototype.forEach.call(document.querySelectorAll('#ref-coronarias *'), e => {
    if (e.children.length) return;
    const t = (e.textContent || '').trim();
    if (!t) return;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible')
      recortados.push(t.slice(0, 24));
  });
  o.recortados = recortados;
  o.scrollRefs = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
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
