/*
 * _probe_pant2a3.mjs - EL CENSO A3: los TRES esquemas que pasan por `esqRasterizar` (tanda
 * PANT-2, correccion A3, 2026-11-02). Nombre propio: verificado con ls que no existia.
 *
 * QUE MIDE Y POR QUE. La correccion A2 arregla el color DENTRO de `esqRasterizar`, que es el
 * dueno unico de SVG a imagen. A3 pide verificar si los DEMAS diagramas que lo usan tambien
 * salian mal. Censado en el codigo: solo TRES lo usan -el esquema del posoperatorio, el de la
 * transposicion y el de la orejuela-; los otros siete de PDF_DIAG_REG traen su propio dataURL
 * de un canvas y no pasan por aca.
 *
 * Por cada uno, sin generar el PDF -que es lo que lo hace barato y exacto-:
 *   N1  el SVG existe en el DOM (DENOMINADOR: sin el, todo lo demas da cero y parece sano);
 *   N2  cuantos var(--x) trae el marcado del DOM y cuantos quedan tras el resolvedor;
 *   N3  si el marcado declara font-family tras el resolvedor;
 *   N4  rasterizado de verdad con `esqRasterizar`: la MODA del color y la fraccion de casi
 *       negros de una zona interior conocida, y la moda del lienzo entero.
 * El CONTROL de idempotencia: el de la orejuela resuelve sus colores con `esqColor` al emitir,
 * asi que tiene que dar cero var( en los DOS arboles y salir igual antes y despues.
 *
 *   node scripts/_probe_pant2a3.mjs --file /tmp/x.html --out /tmp/pant2a3.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant2a3.json';
const TEMAS = ['claro', 'oscuro'];

/* El montaje: carga lo minimo de cada uno de los tres y abre su pestania y su acordeon por el
   boton real, que es lo que les da caja y marcado. */
const MONTA = `(() => {
  const R = { pasos: [] };
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) { R.pasos.push('falta ' + id); return false }
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true };
  const CK = (id) => { const e = document.getElementById(id); if (!e) { R.pasos.push('falta chk ' + id); return false }
    if (!e.checked) e.click(); return true };
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  const abreAcc = (id) => { const a = document.getElementById(id);
    if (a && !a.classList.contains('open')) { const h = document.querySelector('#' + id + ' .sacc-hdr'); if (h) h.click() }
    return !!a };
  S('nombre', 'Prueba PANT2 A3'); S('ci', '620'); S('peso', '70'); S('talla', '170');
  /* 1) LA TRANSPOSICION */
  const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click();
  const b2 = bq('ccSubTab(' + Q + 'congenitas2'); if (b2) b2.click();
  abreAcc('sacc-cc-tga');
  S('tga_tipo', 'dtga'); S('tga_cirugia', 'auricular');
  const tt = document.getElementById('tga_tipo'); if (tt && tt.value) tt.dispatchEvent(new Event('change', { bubbles: true }));
  /* 2) LA OREJUELA, en la pestania del ETE */
  const b3 = bq('showTab(' + Q + 'ete' + Q); if (b3) b3.click();
  if (typeof toggleEteSeccion === 'function') { try { toggleEteSeccion('oai_sec') } catch (e) {} }
  S('oai_morfologia', 'Ala de pollo'); S('oai_ostium_diam', '22'); S('oai_profundidad', '30');
  /* 3) EL POSOPERATORIO */
  const b4 = bq('showTab(' + Q + 'posoperatorio' + Q); if (b4) b4.click();
  S('pop_horas', '6'); S('pop_cx_tipo', 'valvular');
  S('hemo_gc', '3.2'); S('hemo_pam', '70'); S('hemo_pvc', '12');
  R.tabs = Array.prototype.map.call(document.querySelectorAll('.tab-btn'), x => String(x.textContent||'').trim().slice(0,22));
  return R;
})()`;

/* La medicion de un esquema: marcado, var( antes y despues, font-family, y el raster real. */
const MIDE = `(async (id, zona) => {
  const o = { id: id };
  let nodo = document.getElementById(id);
  /* El de la orejuela es un <div> contenedor: su <svg> es el hijo. */
  if (nodo && nodo.tagName.toLowerCase() !== 'svg') nodo = nodo.querySelector('svg');
  if (!nodo) return Object.assign(o, { existe: false });
  o.existe = true;
  let tx = '';
  try { tx = new XMLSerializer().serializeToString(nodo) } catch (e) { tx = '' }
  o.len = tx.length;
  o.varDom = tx.split('var(--').length - 1;
  if (typeof esqSvgParaRaster === 'function') {
    const r = esqSvgParaRaster(tx);
    o.varRas = r.split('var(--').length - 1;
    o.ffRas = r.indexOf('font-family') >= 0 ? 'SI' : 'NO';
    o.arreglo = 'SI';
  } else { o.varRas = o.varDom; o.ffRas = tx.indexOf('font-family') >= 0 ? 'SI' : 'NO'; o.arreglo = 'NO EXISTE' }
  if (typeof esqRasterizar !== 'function') return Object.assign(o, { err: 'sin esqRasterizar' });
  const vb = String(nodo.getAttribute('viewBox') || '0 0 300 300').trim().split(/\\s+/).map(Number);
  const vbW = vb[2] || 300, vbH = vb[3] || 300;
  const W = 600, H = Math.round(600 * vbH / vbW);
  const d = await esqRasterizar(tx, W, H);
  if (!d) return Object.assign(o, { err: 'no rasterizo' });
  const im = new Image();
  const ok = await new Promise(res => { im.onload = () => res(true); im.onerror = () => res(false); im.src = d;
    setTimeout(() => res(false), 8000) });
  if (!ok) return Object.assign(o, { err: 'no decodifica' });
  const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
  const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0);
  const mide = (x0, y0, w, h, nom) => {
    let dd; try { dd = cx.getImageData(x0, y0, w, h).data } catch (e) { return { err: 'x' } }
    const c = {}; let neg = 0, tot = 0;
    for (let i = 0; i < dd.length; i += 4) {
      const R = dd[i], G = dd[i+1], B = dd[i+2];
      tot++; if (0.299*R + 0.587*G + 0.114*B < 40) neg++;
      const k = (R >> 3) + ',' + (G >> 3) + ',' + (B >> 3); c[k] = (c[k] || 0) + 1;
    }
    let mj = null, nm = -1;
    Object.keys(c).forEach(k => { if (c[k] > nm) { nm = c[k]; mj = k } });
    return { nom: nom, moda: mj.split(',').map(v => (+v) * 8 + 4), negroFrac: +(neg/tot).toFixed(3) };
  };
  o.W = im.naturalWidth; o.H = im.naturalHeight;
  o.todo = mide(0, 0, o.W, o.H, 'todo');
  if (zona) {
    const sx = o.W / vbW, sy = o.H / vbH;
    o.zona = mide(Math.round(zona.x*sx), Math.round(zona.y*sy),
      Math.max(1, Math.round(zona.w*sx)), Math.max(1, Math.round(zona.h*sy)), 'zona');
  }
  return o;
})`;

/* Las zonas interiores conocidas de cada uno, en unidades de su propio viewBox. */
const OBJ = [
  { id: 'tga-esq-svg', zona: { x: 46, y: 84, w: 68, h: 32 }, esp: '--bg', que: 'TGA, cavidad TL' },
  { id: 'pop-esq-svg', zona: null, esp: null, que: 'posoperatorio, lienzo entero' },
  { id: 'oai-esq', zona: null, esp: null, que: 'orejuela, lienzo entero (CONTROL de idempotencia)' }
];

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, objetos: OBJ.map(o => o.id) };
try {
  for (const tema of TEMAS) {
    const pg = await b.newPage({ viewport: { width: 1400, height: 900 } });
    pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([tema + ': ' + e.message.slice(0, 140)]) });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
    await pg.waitForTimeout(1500);
    await pg.evaluate("(() => { const h = document.documentElement;"
      + " if (" + JSON.stringify(tema) + " === 'claro') h.classList.add('light-mode'); else h.classList.remove('light-mode');"
      + " try { if (typeof lv3dAlCambiarTema === 'function') lv3dAlCambiarTema() } catch (e) {} return 1 })()");
    const mt = await pg.evaluate(MONTA);
    await pg.waitForTimeout(2500);
    const css = await pg.evaluate("(() => { const cs = getComputedStyle(document.documentElement); const o = {};"
      + " ['--bg','--bg2','--bg3','--border','--text','--text2','--accent','--accent2','--red']"
      + "  .forEach(n => { o[n] = String(cs.getPropertyValue(n)||'').trim() }); return o })()");
    const res = {};
    for (const o of OBJ) {
      res[o.id] = await pg.evaluate("(" + MIDE + ")(" + JSON.stringify(o.id) + ", " + JSON.stringify(o.zona) + ")");
      const r = res[o.id];
      console.log('-- ' + tema + ' | ' + o.que + ' | existe=' + r.existe
        + ' varDom=' + r.varDom + ' varRas=' + r.varRas + ' ff=' + r.ffRas
        + ' | todo moda=' + (r.todo ? r.todo.moda.join('/') : '-')
        + ' negro=' + (r.todo ? r.todo.negroFrac : '-')
        + (r.zona ? (' | zona moda=' + r.zona.moda.join('/') + ' negro=' + r.zona.negroFrac) : '')
        + (r.err ? (' ERR=' + r.err) : ''));
    }
    OUT[tema] = { montaje: mt, css, res };
    await pg.close();
  }
} catch (e) { OUT._err = String(e).slice(0, 250) }
await b.close();
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
