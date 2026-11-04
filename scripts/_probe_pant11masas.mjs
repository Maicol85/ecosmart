#!/usr/bin/env node
/**
 * _probe_pant11masas.mjs - la mudanza de «Masas» a la pestania Otros (PANT-11, commit 8).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide, a los cuatro anchos y en los dos temas:
 *   - que los NUEVE campos vivan ahora dentro de #tab-otros y NO dentro de #tab-pericardio,
 *     con la CADENA DE PADRES -no solo el id-, que es como se caza un div de mas;
 *   - el ancho del cuerpo de las dos pestanias, antes y despues: un </div> de mas lo delata;
 *   - las tres columnas por tema y su apilado por debajo de 900 px;
 *   - `cardAutoOpen`: la seccion NO se abre con el valor de fabrica y SI con una masa presente;
 *   - el titulo «Pericardio» y el texto de ejemplo sin la palabra masa.
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant11_masas.json';

const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach((id) => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(st);
  return true;
})()`;

const MED = `(() => {
  const out = {};
  const ID9 = ['masa_presente','masa_cavidad','masa_loc','masa_tam_mm','masa_morf','masa_movil',
               'masa_eco','masa_dx','masa_notas'];
  /* LA CADENA DE PADRES, y no el id: un div de mas deja el campo en otro contenedor sin que el
     conteo de etiquetas lo note. Es la leccion de PANT-6 y PANT-7. */
  out.enOtros = ID9.filter((k) => { const e = document.getElementById(k);
    return !!(e && e.closest('#tab-otros')); }).length;
  out.enPericardio = ID9.filter((k) => { const e = document.getElementById(k);
    return !!(e && e.closest('#tab-pericardio')); }).length;
  out.existen = ID9.filter((k) => !!document.getElementById(k)).length;
  out.enSeccion = ID9.filter((k) => { const e = document.getElementById(k);
    return !!(e && e.closest('#ete-seccion-masas')); }).length;
  /* El ancho del CUERPO de las dos pestanias: un </div> de mas lo cambia. */
  ['tab-otros', 'tab-pericardio'].forEach((t) => {
    const e = document.getElementById(t);
    out['ancho_' + t] = e ? Math.round(e.getBoundingClientRect().width) : 'NO EXISTE';
  });
  out.appContent = (function () { const e = document.getElementById('app-content');
    return e ? Math.round(e.getBoundingClientRect().width) : 'NO EXISTE'; })();
  /* Titulo de la seccion del pericardio y texto de ejemplo del campo de notas. */
  out.tituloPeri = (function () {
    const h = Array.prototype.slice.call(document.querySelectorAll('h2.card-head'))
      .filter((x) => (x.getAttribute('onclick') || '').indexOf('pericardio-masas') >= 0)[0];
    return h ? String(h.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE';
  })();
  out.ejemploNotas = (function () { const e = document.getElementById('otras_notas');
    return e ? e.getAttribute('placeholder') : 'NO EXISTE'; })();
  out.ordenOtros = Array.prototype.slice.call(document.querySelectorAll('#tab-otros .otr-sub'))
    .map((e) => e.id).join(' > ');
  return out;
})()`;

const COLS = `(() => {
  const c = document.querySelector('.masa-cols');
  if (!c) return { error: 'NO EXISTE' };
  const ys = {};
  Array.prototype.slice.call(c.children).forEach((e) => { const b = e.getBoundingClientRect();
    if (b.width === 0) return; const k = Math.round(b.top); ys[k] = (ys[k] || 0) + 1; });
  const h = Array.prototype.slice.call(c.querySelectorAll('.masa-col-h')).map((e) => e.textContent);
  const an = c.firstElementChild ? Math.round(c.firstElementChild.getBoundingClientRect().width) : 0;
  const sec = document.getElementById('ete-seccion-masas');
  return { reparto: Object.keys(ys).map((k) => ys[k]).join('+'), titulos: h, anchoCol: an,
           alto: sec ? Math.round(sec.getBoundingClientRect().height) : 0,
           scrollH: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ? 'SI' : 'NO',
           recortes: Array.prototype.slice.call(c.querySelectorAll('label, .masa-col-h'))
             .filter((e) => e.scrollWidth > e.clientWidth + 2 && e.getBoundingClientRect().width > 0).length };
})()`;

const browser = await chromium.launch({ channel: 'chrome' });
const res = {};
for (const w of [1440, 1000, 768, 390]) {
  for (const tema of ['dark', 'light']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
    await page.goto('file://' + FILE);
    await page.waitForTimeout(900);
    if (tema === 'light') await page.evaluate(`document.documentElement.classList.add('light-mode')`);
    await page.evaluate(PREP);
    /* Las dos pestanias por su BOTON REAL. */
    await page.evaluate(`(() => { const b = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'))
      .filter((x) => /Otros/i.test(x.textContent || ''))[0]; if (b) b.click(); })()`);
    await page.waitForTimeout(400);
    const r = {};
    r.medidas = await page.evaluate(MED);
    /* cardAutoOpen con el valor de FABRICA: no puede abrir la seccion. */
    r.autoFabrica = await page.evaluate(`(() => { const s = document.getElementById('ete-seccion-masas');
      if (!s) return 'NO EXISTE'; s.style.display = 'none';
      try { cardAutoOpen('tab-otros') } catch (e) {}
      return getComputedStyle(s).display; })()`);
    /* cardAutoOpen con una masa PRESENTE: tiene que abrirla. */
    r.autoPresente = await page.evaluate(`(() => { const s = document.getElementById('ete-seccion-masas');
      const m = document.getElementById('masa_presente');
      if (!s || !m) return 'NO EXISTE'; s.style.display = 'none'; m.selectedIndex = 1;
      m.dispatchEvent(new Event('change', { bubbles: true }));
      try { cardAutoOpen('tab-otros') } catch (e) {}
      return getComputedStyle(s).display; })()`);
    /* Abrir la seccion por su encabezado real y medir las columnas con la masa presente. */
    await page.evaluate(`(() => { const s = document.getElementById('ete-seccion-masas');
      if (s && getComputedStyle(s).display === 'none') {
        const h = Array.prototype.slice.call(document.querySelectorAll('h2.card-head'))
          .filter((x) => (x.getAttribute('onclick') || '').indexOf("'masas'") >= 0)[0];
        if (h) h.click(); }
      try { showMasaPanel() } catch (e) {} })()`);
    await page.waitForTimeout(300);
    r.cols = await page.evaluate(COLS);
    /* La TABLA de diferenciales del commit 9a. */
    r.tabla = await page.evaluate(`(() => {
      const t = document.querySelector('.masa-ref-tabla');
      if (!t) return { error: 'NO EXISTE' };
      const filas = Array.prototype.slice.call(t.querySelectorAll('tbody tr'));
      const cols = t.querySelectorAll('thead th').length;
      /* Cada fila tiene que traer su fuente con hoja y folio. */
      const conFuente = filas.filter((f) => /folio/.test(f.lastElementChild.textContent || '')).length;
      /* Ninguna palabra de CONDUCTA en el cuerpo de la tabla. */
      const cuerpo = filas.map((f) => f.textContent).join(' ');
      const conducta = ['se recomienda','indicad','debe considerar','conviene','tratamiento',
                        'cirugia','cirugía','anticoagular','derivar'].filter((k) => cuerpo.toLowerCase().indexOf(k) >= 0);
      const w = t.closest('.masa-ref-wrap');
      return { filas: filas.length, cols: cols, conFuente: conFuente, conducta: conducta,
               entidades: filas.map((f) => (f.firstElementChild.textContent || '').trim()),
               scrollPropio: w ? (w.scrollWidth > w.clientWidth + 1 ? 'SI' : 'no') : 'NO EXISTE',
               scrollPagina: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ? 'SI' : 'NO',
               largo: cuerpo.length };
    })()`);
    /* El globo del titulo: 44x44, abre y cierra por las TRES vias. */
    r.globo = await page.evaluate(`(() => {
      const b = document.querySelector('[data-vinfo="masa-ref"]');
      if (!b) return { error: 'NO EXISTE' };
      b.scrollIntoView({ block: 'center' });
      const r0 = b.getBoundingClientRect();
      b.click();
      const c = document.getElementById('vinfo-card');
      const abierto = c ? getComputedStyle(c).display !== 'none' : false;
      const txt = c ? String(c.textContent || '').replace(/\\s+/g, ' ').trim() : '';
      /* Cierre 1: el mismo boton. */
      b.click(); const cerr1 = c ? getComputedStyle(c).display === 'none' : false;
      /* Cierre 2: Escape. */
      b.click(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const cerr2 = c ? getComputedStyle(c).display === 'none' : false;
      /* Cierre 3: un clic fuera. */
      b.click(); document.body.click();
      const cerr3 = c ? getComputedStyle(c).display === 'none' : false;
      return { caja: Math.round(r0.width) + 'x' + Math.round(r0.height), abrio: abierto,
               cierra: [cerr1, cerr2, cerr3].join('/'), chars: txt.length,
               folio: /folio/.test(txt) ? 'SI' : 'NO' };
    })()`);
    /* El globo de la FILA de la vegetacion (commit 9b). */
    r.globoEI = await page.evaluate(`(() => {
      const b = document.querySelector('[data-vinfo="masa-ref-ei"]');
      if (!b) return { error: 'NO EXISTE' };
      b.scrollIntoView({ block: 'center' });
      const r0 = b.getBoundingClientRect();
      b.click();
      const c = document.getElementById('vinfo-card');
      const ab = c ? getComputedStyle(c).display !== 'none' : false;
      const t = c ? String(c.textContent || '').replace(/\\s+/g, ' ').trim() : '';
      b.click(); const c1 = c ? getComputedStyle(c).display === 'none' : false;
      b.click(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const c2 = c ? getComputedStyle(c).display === 'none' : false;
      b.click(); document.body.click();
      const c3 = c ? getComputedStyle(c).display === 'none' : false;
      return { caja: Math.round(r0.width) + 'x' + Math.round(r0.height), abrio: ab,
               cierra: [c1, c2, c3].join('/'), chars: t.length,
               cortes: ['10 mm o más', 'más de 10 mm', 'más de 10 a 15 mm'].filter((k) => t.indexOf(k) >= 0).length,
               folios: ['3991', '4007', 'e162', '3966'].filter((k) => t.indexOf(k) >= 0).length,
               sinScore: t.indexOf('no hay ningún score') >= 0 || t.indexOf('NO hay ningún score') >= 0 };
    })()`);
    r._errores = errs;
    res[w + 'px_' + tema] = r;
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito: ' + OUTF);
