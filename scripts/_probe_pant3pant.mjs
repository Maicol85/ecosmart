/*
 * _probe_pant3pant.mjs - una PANTALLA de congenitas, antes y despues (tanda PANT-3, commits 5 a 8).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide lo que la orden exige de cada pantalla que se toca:
 *   · el CENSO DE IDS de sus campos, que tiene que ser IDENTICO antes y despues;
 *   · el conteo de CITAS de guia visibles en la pantalla (clase, nivel, hoja, folio, sociedad),
 *     que no puede subir;
 *   · el alto y el ancho a 1440, 1000, 768 y 390 px;
 *   · la disposicion -cuantas columnas tiene cada grilla, medido por la posicion real de los
 *     campos y no por la hoja de estilos-;
 *   · los globos ⓘ de la seccion, su tamanio y si su tarjeta entra en la pantalla;
 *   · las frases que tenian que salir, con CONTROL POSITIVO contra el arbol viejo.
 *
 *   node scripts/_probe_pant3pant.mjs --file <index.html> --sec sacc-cc-mch --out /tmp/p3p.json
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
const SEC  = arg('--sec') || 'sacc-cc-mch';
const TAB  = arg('--tab') || 'congenitas';
const OUTF = arg('--out') || '/tmp/p3p.json';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);
/* Las frases que esta tanda saca de la pantalla. Se cuentan en los DOS arboles: en el viejo
   tienen que estar -ese es el control positivo- y en el nuevo tienen que valer cero. */
const FRASES = (arg('--frases') || 'salió de la lista en esa edición|El realce tardío sí cuenta para la AHA|no se promedian|1 de cada 500|Umbral diagnóstico|El HCM Risk-SCD no está validado').split('|');

const ABRIR = (sec, tab) => `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { showTab(${JSON.stringify(tab)}) } catch (e) {}
  try { ccSubTab(${JSON.stringify(tab)}) } catch (e) {}
  const s = document.getElementById(${JSON.stringify(sec)});
  if (!s) return { err: 'NO EXISTE' };
  if (!s.classList.contains('open')) { const h = s.querySelector('.sacc-hdr'); if (h) h.click() }
  /* La animacion del acordeon dura 0,3 s y medir en el acto lee la caja de mitad de camino: es
     la trampa que la tanda AJ9 documenta. Se le saca la transicion. */
  const b = s.querySelector('.sacc-body'); if (b) b.style.transition = 'none';
  return { abierto: s.classList.contains('open') };
})()`;

const MEDIR = (sec) => `(() => {
  const s = document.getElementById(${JSON.stringify(sec)});
  if (!s) return { err: 'NO EXISTE' };
  const o = {};
  const r = s.getBoundingClientRect();
  o.w = Math.round(r.width); o.h = Math.round(r.height);
  const cu = s.querySelector('.sacc-body');
  o.cuerpoH = cu ? Math.round(cu.scrollHeight) : 0;
  /* El censo de ids: lo que la orden exige identico. */
  const ids = [];
  s.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => ids.push(e.id));
  o.ids = ids.sort(); o.nIds = ids.length;
  /* Las columnas REALES: se agrupan los campos por su coordenada y, y el maximo de campos que
     comparten una fila es el numero de columnas. Medido y no leido de la hoja de estilos. */
  const filas = {};
  s.querySelectorAll('.fg').forEach(e => {
    const q = e.getBoundingClientRect();
    if (q.width <= 0) return;
    const k = Math.round(q.top);
    filas[k] = (filas[k] || 0) + 1;
  });
  const vals = Object.values(filas);
  o.colsMax = vals.length ? Math.max.apply(null, vals) : 0;
  o.filasCampos = vals.length;
  /* Las citas de guia VISIBLES en la pantalla, sin los script. */
  let t = '';
  const w = document.createTreeWalker(s, NodeFilter.SHOW_TEXT, { acceptNode: (n) => {
    let p = n.parentElement;
    while (p) { if (p.tagName === 'SCRIPT' || p.tagName === 'STYLE') return NodeFilter.FILTER_REJECT; p = p.parentElement }
    return NodeFilter.FILTER_ACCEPT } });
  while (w.nextNode()) t += ' ' + w.currentNode.nodeValue;
  o.texto = t.replace(/\\s+/g, ' ').trim();
  o.largoTexto = o.texto.length;
  const cnt = (re) => (o.texto.match(re) || []).length;
  o.citas = { clase: cnt(/Clase\\s+I+[ab]?\\b/g), nivel: cnt(/Nivel\\s+[ABC]\\b/g),
              folio: cnt(/folio\\s+[\\w.]+/gi), hoja: cnt(/hoja\\s+\\d+/gi),
              tabla: cnt(/Tabla\\s+\\d+/g), soc: cnt(/\\b(ESC|AHA\\/ACC|AHA|ACC|ASE|EACVI)\\b/g) };
  /* Los globos de la seccion. */
  const gl = [];
  s.querySelectorAll('[data-vinfo]').forEach(b => {
    const q = b.getBoundingClientRect();
    gl.push({ k: b.getAttribute('data-vinfo'), w: Math.round(q.width), h: Math.round(q.height) });
  });
  o.globos = gl; o.nGlobos = gl.length;
  o.scrollX = document.documentElement.scrollWidth > document.documentElement.clientWidth ? 1 : 0;
  /* Texto recortado dentro de la seccion. */
  let rec = 0;
  s.querySelectorAll('label, .calc-lbl, .mch-h, option').forEach(e => {
    if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) rec++;
  });
  o.recortados = rec;
  return o;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, sec: SEC };
try {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 140)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1600);
  OUT.abrir = await pg.evaluate(ABRIR(SEC, TAB));
  await pg.waitForTimeout(500);
  OUT.anchos = {};
  for (const w of ANCHOS) {
    await pg.setViewportSize({ width: w, height: 900 });
    await pg.waitForTimeout(400);
    await pg.evaluate(ABRIR(SEC, TAB));
    await pg.waitForTimeout(420);
    OUT.anchos[w] = await pg.evaluate(MEDIR(SEC));
  }
  /* Las frases, sobre el texto de 1440 px. */
  const t = (OUT.anchos[1440] || {}).texto || '';
  OUT.frases = {};
  FRASES.forEach(f => { OUT.frases[f] = t.indexOf(f) > -1 ? 1 : 0 });
  /* Los globos: que abran, que entren en la pantalla y que no traigan conducta. */
  await pg.setViewportSize({ width: 1440, height: 900 });
  await pg.waitForTimeout(350);
  await pg.evaluate(ABRIR(SEC, TAB));
  await pg.waitForTimeout(400);
  OUT.tarjetas = await pg.evaluate(`(() => {
    const s = document.getElementById(${JSON.stringify(SEC)});
    const out = [];
    s.querySelectorAll('[data-vinfo]').forEach(b => {
      try {
        b.scrollIntoView({ block:'center' });
        b.click();
        const c = document.getElementById('vinfo-card');
        const vis = c && getComputedStyle(c).display !== 'none';
        const t = c ? String(c.textContent || '') : '';
        const q = c ? c.getBoundingClientRect() : null;
        out.push({ k: b.getAttribute('data-vinfo'), abre: vis ? 1 : 0, largo: t.length,
                   dentro: q ? (q.left >= -1 && q.top >= -1 && q.right <= innerWidth + 1 && q.bottom <= innerHeight + 1 ? 1 : 0) : 0,
                   conducta: /se recomienda|indicad[oa]|considerar|razonable|debe/i.test(t) ? 1 : 0,
                   folio: /folio/i.test(t) ? 1 : 0 });
        b.click();
      } catch (e) { out.push({ k: b.getAttribute('data-vinfo'), err: String(e).slice(0, 60) }) }
    });
    return out;
  })()`);
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 300) }
try { await b.close() } catch (e) {}
/* El texto completo no va al archivo: pesa y no se compara entero. */
Object.values(OUT.anchos || {}).forEach(o => { if (o && o.texto) { o.textoMuestra = o.texto.slice(0, 400); delete o.texto } });
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
const a = OUT.anchos || {};
console.log('seccion ' + SEC + '  abierto=' + JSON.stringify(OUT.abrir));
ANCHOS.forEach(w => { const o = a[w] || {};
  console.log('  ' + String(w).padStart(5) + 'px  alto=' + String(o.h).padStart(5) + '  cuerpo=' + String(o.cuerpoH).padStart(5) +
              '  ancho=' + String(o.w).padStart(5) + '  colsMax=' + o.colsMax + '  filas=' + o.filasCampos +
              '  ids=' + o.nIds + '  globos=' + o.nGlobos + '  recortados=' + o.recortados + '  scrollX=' + o.scrollX); });
console.log('citas a 1440: ' + JSON.stringify((a[1440] || {}).citas));
console.log('frases: ' + JSON.stringify(OUT.frases));
console.log('tarjetas: ' + JSON.stringify(OUT.tarjetas));
console.log('escrito: ' + OUTF);
