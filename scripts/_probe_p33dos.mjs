#!/usr/bin/env node
/**
 * _probe_p33dos.mjs - el cruce de DOS MOTORES de la tanda PANT-33 (2026-11-10). Copia del de
 * PANT-32 con las mediciones de esta tanda.
 * Chrome (el del sistema, por channel) y WebKit, en 1440 / 1280 / 1000 / 768 / 390 px y en los
 * dos temas: 10 cruces por motor. Mide el ENCABEZADO de la hoja -- el nombre desde el centro de
 * trabajo, la linea gris y el logo a la DERECHA-, la seccion de Documentos con sus SEIS filas y
 * sin cupo ni «Borrar», el menu pintado, el EDITOR SOBRE LA HOJA con su zoom y sus partes fijas,
 * y la hoja de un documento EN BLANCO, mas el desplazamiento horizontal, el texto recortado, los
 * controles por debajo de 44 px y los errores de consola y de pagina.
 * Nombre propio: verificado con ls, no existia.
 *
 * (cabecera original de PANT-30)
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
  '/private/tmp/claude-501/-Users-maicoldossantos--claude-spares-spare-EvVwSm/b5675b51-bc5f-49cd-bb08-f130065a05ce/scratchpad/p31/pw/node_modules/playwright/index.js',
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
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = { w: innerWidth };
  const caja = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top), l: Math.round(r.left) }; };
  try { localStorage.removeItem('ecosmart_doc_modelos'); localStorage.removeItem('ecosmart_doc_boton'); } catch (e) {}
  /* ⚠️ EL CENTRO DE TRABAJO SE SIEMBRA, y es un denominador: desde D1 la institucion del
     encabezado sale de ett_centro_principal y no hay respaldo escrito a mano, asi que sin ese
     dato el encabezado no dibuja ni el circulo ni el nombre y la sonda mediria la linea gris
     creyendo que mide el nombre. El medico se siembra por la MISMA razon que PANT-32 documenta:
     la clave es ett_medicos y no eco_medicos. */
  try {
    localStorage.setItem('ett_centros', JSON.stringify(['GREMEDA']));
    localStorage.setItem('ett_centro_principal', 'GREMEDA');
    localStorage.setItem('ett_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
    localStorage.setItem('ett_medico_principal', '0');
  } catch (e) {}
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay');
  if (lo) lo.style.display = 'none';
  if (window.docmodArranque) docmodArranque();
  /* ── el boton del Informe y su menu ── */
  try { showTab('informe'); } catch (e) {}
  await esp(320);
  const wrap = document.querySelector('.doc-menu-wrap');
  const btn = document.getElementById('doc-btn');
  o.btn = { wrap: caja(wrap), btn: caja(btn),
    display: wrap ? getComputedStyle(wrap).display : null };
  if (window.docmodMenuRender) docmodMenuRender();
  const menu = document.getElementById('doc-menu');
  o.menu = { n: menu ? menu.querySelectorAll('[data-doc-k]').length : null,
             claves: menu ? Array.prototype.map.call(menu.querySelectorAll('[data-doc-k]'),
               b => b.getAttribute('data-doc-k')).join(',') : null,
             inline: menu ? Array.prototype.filter.call(menu.querySelectorAll('[data-doc-k]'),
               b => !!b.getAttribute('onclick')).length : null };
  /* ── el interruptor ── */
  if (window.cfgDocsToggleBoton) cfgDocsToggleBoton(false);
  await esp(120);
  o.apagado = { clase: wrap ? wrap.className : null,
                display: wrap ? getComputedStyle(wrap).display : null, caja: caja(wrap) };
  if (window.cfgDocsToggleBoton) cfgDocsToggleBoton(true);
  await esp(120);
  o.prendido = { display: wrap ? getComputedStyle(wrap).display : null, caja: caja(wrap) };
  /* ── la seccion de Configuracion ── */
  try { showTab('config'); if (window.cfgOnShow) cfgOnShow(); } catch (e) {}
  await esp(360);
  const sec = document.getElementById('cfg-card-docs');
  const cards = Array.prototype.slice.call(document.querySelectorAll('#tab-config section.cfg-card'));
  let ix = -1; cards.forEach((c, k) => { if (c.id === 'cfg-card-docs') ix = k; });
  const tit = (c) => c ? ((c.querySelector('.cfg-sec-title') || {}).textContent || '').trim() : '';
  o.sec = { caja: caja(sec), idx: ix, n: cards.length, tit: tit(sec),
            antes: tit(cards[ix - 1]), despues: tit(cards[ix + 1]),
            filas: sec ? sec.querySelectorAll('.cfgdoc-fila').length : null,
            etiquetas: sec ? Array.prototype.map.call(sec.querySelectorAll('.cfgdoc-fila'),
              f => Array.prototype.map.call(f.querySelectorAll('.cfgdoc-tag'), t => t.textContent).join('+')).join(' | ') : null,
            sinCupo: !document.getElementById('cfg-docs-cupo'),
            sinAgregar: !document.getElementById('cfg-docs-add') && !document.getElementById('cfg-docs-imp'),
            sinBorrar: sec ? sec.querySelectorAll('[data-cd-del]').length : null,
            pie: ((document.getElementById('cfg-docs-pie') || {}).textContent || '').length };
  const chicos = sec ? Array.prototype.slice.call(sec.querySelectorAll('button, .cfgdoc-vis'))
    .filter(b => { const r = b.getBoundingClientRect(); return r.height > 0 && r.height < 44; })
    .map(b => (b.textContent || '').trim().slice(0, 16) + '=' + Math.round(b.getBoundingClientRect().height)) : [];
  o.sec.chicos = chicos;
  o.sec.desborde = sec ? Array.prototype.slice.call(sec.querySelectorAll('.cfgdoc-fila'))
    .filter(f => f.getBoundingClientRect().right > sec.getBoundingClientRect().right + 1).length : null;
  /* ── el EDITOR SOBRE LA HOJA, con un consentimiento ── */
  if (window.cfgDocsEditar) cfgDocsEditar('cve');
  await esp(620);
  const ov = document.getElementById('doc-ov');
  const hoja = document.getElementById('doc-hoja');
  const cu = hoja ? hoja.querySelector('[data-doc-cuerpo]') : null;
  o.ed = { abierto: !!ov && !ov.hidden, modo: (typeof _docModo !== 'undefined') ? _docModo : null,
    tit: ((document.getElementById('doc-ov-tit') || {}).textContent || '').slice(0, 30),
    accModelo: !!document.getElementById('doc-acc-modelo') &&
      !document.getElementById('doc-acc-modelo').classList.contains('doc-oculto'),
    accInforme: !!document.getElementById('doc-acc-informe') &&
      !document.getElementById('doc-acc-informe').classList.contains('doc-oculto'),
    zoom: hoja ? hoja.style.zoom : null, hoja: caja(hoja),
    cuerpo: caja(cu), editables: hoja ? hoja.querySelectorAll('[contenteditable="true"]').length : null,
    fijosEditables: hoja ? Array.prototype.filter.call(
      hoja.querySelectorAll('.doc-enc,.doc-cf,.doc-pacid,.doc-tf,.doc-firma,.doc-p,.doc-sec,.doc-chk,.doc-ul'),
      e => e.isContentEditable).length : null,
    tf: hoja ? hoja.querySelectorAll('.doc-tf').length : null,
    ficticio: hoja ? ((hoja.textContent || '').indexOf('Fernanda P') > -1) : null,
    guardarApagado: (document.getElementById('doc-mod-guardar') || {}).disabled,
    tintaFuera: (function () {
      if (!hoja) return null;
      const rh = hoja.getBoundingClientRect();
      let max = 0;
      Array.prototype.forEach.call(hoja.querySelectorAll('*'), e => {
        if (e.children.length) return;
        const r = e.getBoundingClientRect();
        if (r.height > 0) max = Math.max(max, Math.round(r.bottom - rh.bottom));
      });
      return max;
    })() };
  const chicos2 = Array.prototype.slice.call(document.querySelectorAll('#doc-acc-modelo button, #doc-acc-modelo label'))
    .filter(b => { const r = b.getBoundingClientRect(); return r.height > 0 && r.height < 44; })
    .map(b => (b.textContent || '').trim().slice(0, 16) + '=' + Math.round(b.getBoundingClientRect().height));
  o.ed.chicos = chicos2;
  /* ── el ENCABEZADO: el nombre desde el centro de trabajo y el logo a la DERECHA ── */
  const enc = hoja ? hoja.querySelector('.doc-enc') : null;
  const re = enc ? enc.getBoundingClientRect() : null;
  o.enc = { cols: enc ? getComputedStyle(enc).gridTemplateColumns : null,
    orden: enc ? Array.prototype.map.call(enc.children, e => e.className.replace('doc-enc-', '')).join(',') : null,
    nombre: enc ? ((enc.querySelector('.doc-enc-nom') || {}).textContent || '') : null,
    gris: enc ? !!enc.querySelector('.doc-enc-ph') : null,
    ph: enc && enc.querySelector('.doc-enc-ph')
      ? (getComputedStyle(enc.querySelector('.doc-enc-ph'), '::before').content || '').slice(0, 40) : null,
    logoDer: (function () {
      if (!enc || !re) return null;
      const u = enc.children[enc.children.length - 1];
      if (!u) return null;
      const r = u.getBoundingClientRect();
      return Math.round(r.right) >= Math.round(re.right) - 2;
    })(),
    nomCentrado: (function () {
      if (!enc || !re) return null;
      const n = enc.querySelector('.doc-enc-nom');
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return Math.round(Math.abs((r.left + r.right) / 2 - (re.left + re.right) / 2));
    })() };
  /* ── la hoja de un documento EN BLANCO ── */
  if (window.docmodEdSalir) docmodEdSalir();
  await esp(200);
  try { showTab('informe'); } catch (e) {}
  await esp(260);
  if (window.docAbrir) docAbrir('b1');
  await esp(560);
  const h2 = document.getElementById('doc-hoja');
  const cu2 = h2 ? h2.querySelector('[data-doc-cuerpo]') : null;
  o.blanco = { abierto: !document.getElementById('doc-ov').hidden,
    zoom: h2 ? h2.style.zoom : null,
    cuerpo: caja(cu2), vacio: cu2 ? cu2.classList.contains('doc-ed-ph') : null,
    ph: cu2 ? (getComputedStyle(cu2, '::before').content || '').slice(0, 40) : null,
    firma: h2 ? h2.querySelectorAll('.doc-firma').length : null,
    titulos: h2 ? h2.querySelectorAll('.doc-tit,.doc-sub').length : null,
    pacid: h2 ? h2.querySelectorAll('.doc-pacid').length : null,
    tf: h2 ? h2.querySelectorAll('.doc-tf').length : null,
    casillaFirma: !!document.getElementById('cfg-doc-firma-wrap') &&
      !document.getElementById('cfg-doc-firma-wrap').classList.contains('doc-oculto') };
  if (window.docCerrar) docCerrar();
  await esp(160);
  /* Texto recortado: lo que el medico no puede leer. */
  const recortados = [];
  Array.prototype.forEach.call(document.querySelectorAll('#cfg-card-docs *'), e => {
    if (e.children.length) return;
    const t = (e.textContent || '').trim();
    if (!t) return;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible')
      recortados.push(t.slice(0, 24));
  });
  o.recortados = recortados;
  o.scrollH = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
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
