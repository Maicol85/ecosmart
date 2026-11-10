#!/usr/bin/env node
/**
 * _probe_pant31dos.mjs - el cruce de DOS MOTORES de la tanda PANT-31 (2026-11-10).
 * Chrome (el del sistema, por channel) y WebKit, en 1440 / 1280 / 1000 / 768 / 390 px y en los
 * dos temas: 10 cruces por motor. Mide la Parte A -- el borde derecho del boton, la hoja completa
 * con su A4 y su zoom, el cuerpo en puntos, la edicion, el pegado llano, la confirmacion de
 * cierre y el encabezado con el logo a la izquierda y el nombre centrado- y la Parte B -- la
 * casilla del PPT de la seccion de protesis-, mas el desplazamiento horizontal, el texto
 * recortado y los errores de consola y de pagina.
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
  const esp = (ms) => new Promise(r => setTimeout(r, ms));
  const caja = (el) => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), der: Math.round(r.right), vis: !!el.offsetParent } };
  const o = {};
  /* La sesion: sin esto el overlay de login tapa la pantalla y nada se puede tocar. */
  try { sessionStorage.setItem('ett_auth', '1') } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display = 'none';
  const av = document.getElementById('modalAvisoEco'); if (av) av.style.display = 'none';
  try {
    localStorage.setItem('centro_tipo_activo', 'default');
    localStorage.setItem('centro_nombre_activo', 'Centro Ficticio de Cardiologia del Norte');
    localStorage.setItem('ett_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
    localStorage.setItem('ett_medico_principal', '0');
  } catch (e) {}
  const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true })) } };
  set('nombre', 'Prueba Ficticia, Ana'); set('ci', '1.234.567-8'); set('sexo', 'F');
  set('cfg-med-lugar', 'Artigas');
  /* ── Parte A: el boton ── */
  if (window.showTab) showTab('informe');
  await esp(300);
  const b = document.getElementById('doc-btn'), iB = document.getElementById('indic-btn');
  o.btn = caja(b); o.evid = caja(iB);
  if (b && iB) {
    o.alineados = Math.abs(b.getBoundingClientRect().right - iB.getBoundingClientRect().right) <= 1.5;
    const fila = b.closest('div');
    o.filaAlto = Math.round(fila.getBoundingClientRect().height);
    o.btnsFila = Array.prototype.slice.call(fila.children).filter(e => e.tagName === 'BUTTON').length;
    const rb = b.getBoundingClientRect();
    o.solapados = Array.prototype.slice.call(fila.children).filter(e => e !== b.parentElement)
      .filter(e => { const r = e.getBoundingClientRect();
        return !(r.right <= rb.x || r.x >= rb.right || r.bottom <= rb.y || r.y >= rb.bottom) }).length;
  }
  /* ── la hoja, en los cuatro documentos ── */
  o.hojas = {};
  for (const cl of ['constancia', 'cve', 'ete', 'burb']) {
    if (typeof docCerrar === 'function') docCerrar();
    docAbrir(cl);
    await esp(260);
    const h = document.getElementById('doc-hoja'), wr = h.parentElement;
    const cs = getComputedStyle(h), rh = h.getBoundingClientRect();
    let abajo = -1e9, derecha = -1e9, recort = 0;
    h.querySelectorAll('*').forEach(el => { const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (r.bottom > abajo) abajo = r.bottom;
      if (r.right > derecha) derecha = r.right;
      if (!el.children.length && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1) recort++; });
    const maq = docMaquetar(DOC_DEFS[cl], docDatos(), docBloquesNuevos(DOC_DEFS[cl], docDatos()));
    o.hojas[cl] = {
      abre: !document.getElementById('doc-ov').hidden,
      zoom: cs.zoom, anchoCss: Math.round(parseFloat(cs.width)), minAlto: Math.round(parseFloat(cs.minHeight)),
      cuerpo: cs.fontSize, cuerpoEsperado: (DOC_DEFS[cl].sz * 4 / 3).toFixed(2) + 'px',
      tintaFueraAbajo: Math.round(abajo - rh.bottom), tintaFueraDerecha: Math.round(derecha - rh.right),
      recortados: recort,
      desbWrap: wr.scrollWidth - wr.clientWidth,
      desbDoc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      hojasPdf: maq ? maq.n : null,
      saltos: h.querySelectorAll('.doc-salto').length,
      chk2Cols: (function () { const c = h.querySelector('.doc-chk2');
        return c ? getComputedStyle(c).gridTemplateColumns.split(' ').length : null })(),
      encCols: (function () { const e = h.querySelector('.doc-enc');
        return e ? getComputedStyle(e).gridTemplateColumns.split(' ').length : null })(),
      encPrimero: (function () { const e = h.querySelector('.doc-enc');
        return e && e.children[0] ? String(e.children[0].className).slice(0, 14) : null })(),
      nombreDesv: (function () { const e = h.querySelector('.doc-enc-nom');
        if (!e) return null; const rn = e.getBoundingClientRect();
        return Math.round(((rn.x + rn.width / 2) - (rh.x + rh.width / 2)) * 10) / 10 })()
    };
  }
  /* ── la edicion y el pegado ── */
  if (typeof docCerrar === 'function') docCerrar();
  docAbrir('constancia'); await esp(240); docActualizarDatos(); await esp(200);
  const h2 = document.getElementById('doc-hoja');
  const p2 = h2.querySelector('p.doc-p[contenteditable="true"]');
  o.edicion = { hay: !!p2, editable: !!(p2 && p2.isContentEditable), pendAntes: docSinEntregar() };
  if (p2) {
    p2.innerText = p2.innerText + ' corregido';
    p2.dispatchEvent(new Event('input', { bubbles: true }));
    await esp(150);
    o.edicion.registra = docSinEntregar();
    p2.focus();
    const rg = document.createRange(); rg.selectNodeContents(p2); rg.collapse(false);
    const sl = getSelection(); sl.removeAllRanges(); sl.addRange(rg);
    const dt = new DataTransfer();
    dt.setData('text/plain', 'PEGADO' + String.fromCharCode(8212) + 'x');
    dt.setData('text/html', '<b>PEGADO</b>');
    const evp = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
    o.edicion.cancela = !p2.dispatchEvent(evp);
    await esp(150);
    o.edicion.pego = p2.innerText.indexOf('PEGADO') > -1;
    o.edicion.sinMarcado = p2.querySelectorAll('b,strong,ul,li').length === 0 && p2.innerText.indexOf('<') === -1;
    o.edicion.sinRaya = p2.innerText.indexOf(String.fromCharCode(8212)) === -1;
  }
  /* ── la confirmacion de cierre ── */
  const ov = document.getElementById('doc-ov'), cf = document.getElementById('doc-conf');
  ov.click(); await esp(200);
  o.cierre = { pregunta: !!(cf && !cf.hidden) && !ov.hidden,
    foco: document.activeElement === document.getElementById('doc-conf-seguir'),
    botonAlto: (function () { const x = document.getElementById('doc-conf-ok');
      return x ? Math.round(x.getBoundingClientRect().height) : null })(),
    cardAncho: (function () { const c = document.querySelector('.doc-conf-card');
      return c ? Math.round(c.getBoundingClientRect().width) : null })(),
    dentroDePantalla: (function () { const c = document.querySelector('.doc-conf-card');
      if (!c) return null; const r = c.getBoundingClientRect();
      return r.x >= -0.5 && r.right <= innerWidth + 0.5 && r.y >= -0.5 })() };
  if (cf && !cf.hidden) { document.getElementById('doc-conf-ok').click(); await esp(150); }
  o.cierre.cerro = !!ov.hidden;
  /* ── Parte B: la casilla del PPT ── */
  if (window.showTab) showTab('lab');
  await esp(350);
  const sb = Array.prototype.slice.call(document.querySelectorAll('.lab-subtab'))
    .filter(x => (x.getAttribute('onclick') || '').indexOf("'mediciones'") > -1)[0];
  if (sb) sb.click();
  await esp(350);
  const card = document.querySelector('#tab-lab .lab-card[data-ppt="protesis"]');
  const chk = card ? card.querySelector('.lab-ppt-chk') : null;
  const otra = document.querySelector('#tab-lab .lab-card[data-ppt="valvulas"] .lab-ppt-chk');
  o.ppt = { tarjeta: !!card, clave: card ? card.getAttribute('data-ppt') : null,
    casilla: caja(chk), igualAValvulas: !!(chk && otra &&
      Math.round(chk.getBoundingClientRect().width) === Math.round(otra.getBoundingClientRect().width) &&
      Math.round(chk.getBoundingClientRect().height) === Math.round(otra.getBoundingClientRect().height)),
    marcada: !!(chk && chk.querySelector('input').checked) };
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
