#!/usr/bin/env node
/**
 * _probe_pant11dib.mjs - el DIBUJO de la ecografia pulmonar y la DISPOSICION de su seccion
 * (PANT-11, commit 7). Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide, a 1440, 1000, 768 y 390 px y en los dos temas, con la pestania y la seccion abiertas
 * por su BOTON REAL y las transiciones apagadas:
 *   - la DISPOSICION: alto y ancho de la seccion, el reparto de los campos y el hueco al pie;
 *   - el DIBUJO en nueve escenas, con la GEOMETRIA REAL (getBBox): nada fuera del lienzo y
 *     ningun cruce entre los textos.
 * Se corre contra el arbol vivo y contra una copia de HEAD, y se comparan los JSON.
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
const OUTF = arg('--out') || '/tmp/pant11_dib.json';

const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach((id) => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(st);
  const tb = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'))
    .filter((x) => /Pericardio/i.test(x.textContent || ''))[0];
  if (tb) tb.click();
  /* La seccion abre por su encabezado real: toggleCard programatico deja la .card sin caja. */
  const sec = document.getElementById('pua-seccion');
  if (sec && getComputedStyle(sec).display === 'none') {
    const h = Array.prototype.slice.call(document.querySelectorAll('h2.card-head'))
      .filter((x) => (x.getAttribute('onclick') || '').indexOf('pua-seccion') >= 0)[0];
    if (h) h.click();
  }
  return sec ? getComputedStyle(sec).display : 'NO EXISTE';
})()`;

const DISP = `(() => {
  const out = {};
  const sec = document.getElementById('pua-seccion');
  if (!sec) return { error: 'NO EXISTE' };
  const r = sec.getBoundingClientRect();
  out.caja = Math.round(r.width) + 'x' + Math.round(r.height);
  out.alto = Math.round(r.height);
  /* El HUECO AL PIE: lo que queda entre el ultimo elemento con caja y el borde de abajo. */
  let maxB = r.top;
  /* Se miran las HOJAS de contenido -campos, encabezados de columna, cajas de conclusion,
     botones y el pie del dibujo- y no todos los descendientes: un div de envoltura llega
     siempre hasta abajo y el hueco daria cero sin medir nada. */
  Array.prototype.slice.call(sec.querySelectorAll('.fg, .pul-col-h, .calc-box, button, #pul-dib-pie, #pul-dib-svg'))
    .forEach((e) => {
      const b = e.getBoundingClientRect();
      if (b.width > 0 && b.height > 0 && b.bottom > maxB) maxB = b.bottom;
    });
  out.huecoPie = Math.round(r.bottom - maxB);
  /* El OTRO hueco, que es el que PANT-8 midio: lo que queda por debajo del ultimo CAMPO,
     contando la caja del patron global y el pie como espacio no ocupado por campos. */
  let maxF = r.top;
  Array.prototype.slice.call(sec.querySelectorAll('.fg')).forEach((e) => {
    const b = e.getBoundingClientRect();
    if (b.width > 0 && b.height > 0 && b.bottom > maxF) maxF = b.bottom;
  });
  out.huecoTrasCampos = Math.round(r.bottom - maxF);
  /* El OCUPADO: la misma cuenta que PANT-8 publico como «area ocupada por los campos», con el
     dibujo contando como contenido. Es lo que dice si el espacio vacio se lleno. */
  let ar = 0;
  Array.prototype.slice.call(sec.querySelectorAll('.fg, .calc-box, #pul-dib-svg, #pul-dib-desc, #pul-dib-pie'))
    .forEach((e) => { const b = e.getBoundingClientRect(); if (b.width > 0) ar += b.width * b.height; });
  out.ocupado = Math.round(ar / (r.width * r.height) * 100) + '%';
  /* Reparto de las columnas de campos. */
  const cols = document.querySelector('.pul-cols');
  out.colsPorFila = (function () {
    if (!cols) return 'NO EXISTE';
    const ys = {};
    Array.prototype.slice.call(cols.children).forEach((c) => {
      const b = c.getBoundingClientRect(); if (b.width === 0) return;
      const k = Math.round(b.top); ys[k] = (ys[k] || 0) + 1;
    });
    return Object.keys(ys).map((k) => ys[k]).join('+');
  })();
  out.anchoCol = (function () { const c = cols && cols.firstElementChild;
    return c ? Math.round(c.getBoundingClientRect().width) : 'NO EXISTE'; })();
  /* Dibujo al lado o apilado. */
  const izq = document.getElementById('pul-izq'), dib = document.getElementById('pul-dib-caja');
  if (izq && dib) {
    const a = izq.getBoundingClientRect(), b = dib.getBoundingClientRect();
    out.dibujo = Math.round(b.width) + 'x' + Math.round(b.height);
    out.ladoALado = (b.left >= a.right - 2) ? 'SI' : 'NO';
    out.anchoIzq = Math.round(a.width);
  } else { out.dibujo = 'NO EXISTE'; out.ladoALado = 'NO EXISTE'; }
  out.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ? 'SI' : 'NO';
  /* Texto recortado dentro de la seccion. */
  out.recortes = Array.prototype.slice.call(sec.querySelectorAll('label, .pul-col-h, #pul-dib-pie, #pul-dib-desc'))
    .filter((e) => e.scrollWidth > e.clientWidth + 2 && e.getBoundingClientRect().width > 0).length;
  return out;
})()`;

/* La geometria real del dibujo: nada fuera del lienzo y ningun cruce entre textos. */
const GEOM = `(() => {
  const svg = document.getElementById('pul-dib-svg');
  if (!svg) return { error: 'NO EXISTE' };
  const vb = svg.viewBox.baseVal;
  const nodos = Array.prototype.slice.call(svg.querySelectorAll('path, line, circle, rect, text'));
  let fuera = 0;
  nodos.forEach((n) => {
    /* ADVERTENCIA: getBBox IGNORA el clip-path -la leccion de la TANDA CORRECCIONES-, y las
       lineas B se dibujan de 260 unidades desde el hilio justamente para que el recorte las
       corte contra el borde del pulmon. Un nodo dentro de un grupo recortado esta, por
       construccion, dentro del contorno del pulmon, que esta entero en el lienzo: contarlo por
       su caja cruda da un FALSO positivo. Se excluyen y se declara. */
    if (!n.getBBox || n.closest('clipPath') || n.closest('defs') || n.closest('g[clip-path]')) return;
    let b; try { b = n.getBBox(); } catch (e) { return; }
    if (b.width === 0 && b.height === 0) return;
    /* Los nodos del lado izquierdo viven en un grupo espejado; getBBox da coordenadas LOCALES,
       asi que el espejo se aplica a mano antes de comparar con el lienzo. */
    const esp = !!(n.closest('g[transform^="translate(440"]'));
    const x0 = esp ? (440 - (b.x + b.width)) : b.x, x1 = esp ? (440 - b.x) : (b.x + b.width);
    if (x0 < vb.x - 1 || x1 > vb.x + vb.width + 1 || b.y < vb.y - 1 || b.y + b.height > vb.y + vb.height + 1) fuera++;
  });
  const txt = Array.prototype.slice.call(svg.querySelectorAll('text'));
  let cruces = 0;
  for (let i = 0; i < txt.length; i++) for (let j = i + 1; j < txt.length; j++) {
    const a = txt[i].getBoundingClientRect(), b = txt[j].getBoundingClientRect();
    if (a.width && b.width && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) cruces++;
  }
  const r = svg.getBoundingClientRect();
  /* La letra RENDERIZADA: el font-size esta en unidades del viewBox, asi que hay que
     escalarlo por el ancho real. El esquema valvular 2D de Valvulas da 7,43 px -5,2 sobre un
     viewBox de 154 a 220 px de ancho- y esta es la referencia que la orden fija. */
  const t0 = txt[0] ? getComputedStyle(txt[0]).fontSize : 'NO';
  const esc = r0 => r0;
  const fsPx = txt[0] ? (parseFloat(getComputedStyle(txt[0]).fontSize) * svg.getBoundingClientRect().width / vb.width) : null;
  return { nodos: nodos.length, fuera: fuera, cruces: cruces,
           caja: Math.round(r.width) + 'x' + Math.round(r.height), letra: t0,
           letraPx: fsPx === null ? 'NO' : Math.round(fsPx * 100) / 100,
           textos: txt.length,
           desc: (document.getElementById('pul-dib-desc') || {}).textContent || 'NO EXISTE' };
})()`;

const SEM = `((c) => { const S = (id, v) => { const e = document.getElementById(id); if (!e) return;
  if (e.type === 'checkbox') { e.checked = !!v; } else { e.value = v; }
  e.dispatchEvent(new Event('change', { bubbles: true })); };
  try { limpiarCampos(true) } catch (e) {}
  Object.keys(c).forEach((k) => S(k, c[k]));
  try { pulAvUI() } catch (e) {}
  return true })`;

const ESCENAS = {
  vacia: {},
  derDistinto: { pua_derrame: 'si', pua_derrame_der: 'leve', pua_derrame_izq: 'severo' },
  derBilateral: { pua_derrame: 'si', pua_derrame_der: 'moderado', pua_derrame_izq: 'moderado' },
  lbUnaZona: { pua_lineasb: 'presentes', pua_z_bas_d: 1 },
  lbTresZonas: { pua_lineasb: 'presentes', pua_z_ant_d: 1, pua_z_lat_d: 1, pua_z_bas_d: 1 },
  lbSinZona: { pua_lineasb: 'presentes' },
  consDer: { pua_consol: 'si', pua_consol_lado: 'der', pua_consol_bronco: 'con' },
  consIzqSinBronco: { pua_consol: 'si', pua_consol_lado: 'izq', pua_consol_bronco: 'sin' },
  consBilat: { pua_consol: 'si', pua_consol_lado: 'bilateral', pua_consol_bronco: 'fluido' },
  neumoIzq: { pua_punto: 'si', pua_desliz_lado: 'izquierdo', pua_desliz: 'abolido' },
  neumoBilat: { pua_punto: 'si', pua_desliz_lado: 'bilateral' },
  combinada: { pua_derrame: 'si', pua_derrame_der: 'severo', pua_derrame_izq: 'leve',
               pua_lineasb: 'presentes', pua_z_lat_i: 1, pua_consol: 'si',
               pua_consol_lado: 'der', pua_consol_bronco: 'con' }
};

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
    const abrio = await page.evaluate(PREP);
    await page.waitForTimeout(400);
    const r = { _abrio: abrio };
    r.disposicion = await page.evaluate(DISP);
    r.escenas = {};
    for (const k of Object.keys(ESCENAS)) {
      await page.evaluate(`(${SEM})(${JSON.stringify(ESCENAS[k])})`);
      await page.waitForTimeout(160);
      r.escenas[k] = await page.evaluate(GEOM);
    }
    r._errores = errs;
    res[w + 'px_' + tema] = r;
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito: ' + OUTF);
