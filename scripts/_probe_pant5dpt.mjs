/*
 * _probe_pant5dpt.mjs - el derrame pericardico en cuatro columnas (PANT-5, commit 4).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant5dpt.mjs --file <index.html>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHOS = [1440, 1200, 1100, 1099, 1000, 768, 700, 699, 390];

const JS = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  /* ⚠️ LA SECCION VIVE EN LA PESTANIA DE HEMODINAMICA, no en una de pericardio: localizado
     buscando hacia atras el tab-section que la contiene. Con otra pestania abierta todo su arbol
     queda bajo display:none, asi que abierta daba true -el acordeon SI se abre- y toda la
     geometria daba 0x0: un denominador vacio que se lee igual que «la maqueta no existe». */
  try { showTab('hemodinamica') } catch (e) {}
  /* la seccion se abre por su encabezado real */
  const h = document.querySelector('[onclick*="derrame-tap"]'); if (h) h.click();
  const sec = document.getElementById('ete-seccion-derrame-tap');
  o.abierta = sec ? getComputedStyle(sec).display !== 'none' : null;
  if (!o.abierta) { const hs = Array.prototype.slice.call(document.querySelectorAll('h2.card-head'));
    hs.forEach(x => { if (/Derrame peric/.test(x.textContent || '')) x.click() });
    o.abierta = sec ? getComputedStyle(sec).display !== 'none' : null }
  if (!sec) { o.error = 'NO HAY SECCION'; return o }
  sec.scrollIntoView({ block:'center' });
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, y: Math.round(r.y*10)/10 } };
  o.sec = R(sec);
  const cols = document.getElementById('dpt-cols');
  o.cols = R(cols);
  if (cols) {
    o.nCols = getComputedStyle(cols).gridTemplateColumns.split(' ').filter(x => x).length;
    o.anchoCol = getComputedStyle(cols).gridTemplateColumns;
    const hijos = Array.prototype.slice.call(cols.children).map(c => R(c));
    o.hijos = hijos;
    /* COLUMNAS POR FILA: cuantos hijos comparten la misma y. */
    const ys = {}; hijos.forEach(x => { const k = String(x.y); ys[k] = (ys[k] || 0) + 1 });
    o.porFila = Object.keys(ys).map(k => ys[k]);
    o.minAncho = Math.min.apply(null, hijos.map(x => x.w));
  }
  /* CENSO DE LOS CAMPOS: los quince editables y los seis de solo lectura tienen que estar. */
  const IDS = ['dpt_local','dpt_mm_post','dpt_mm_lat','dpt_mm_ant','dpt_libre','dpt_fibrina',
    'dpt_hemo','dpt_col_ad','dpt_col_ad_dur','dpt_col_vd','dpt_col_ai','dpt_col_vi',
    'resp_var_mitral','resp_var_tric','dpt_var_ao','dpt_var_pulm','dpt_swinging'];
  const RO = ['dpt-tam-eco','dpt-vci-eco','dpt-vcicol-eco','dpt-lbl-addur','dpt-lbl-mitral','dpt-lbl-tric'];
  o.faltan = IDS.filter(id => !document.getElementById(id));
  o.faltanRO = RO.filter(id => !document.getElementById(id));
  o.enCols = IDS.filter(id => { const e = document.getElementById(id); return e && cols && cols.contains(e) }).length;
  /* en que columna cayo cada uno */
  o.reparto = {};
  if (cols) { Array.prototype.slice.call(cols.children).forEach((c, k) => {
    o.reparto[k+1] = IDS.concat(RO).filter(id => { const e = document.getElementById(id); return e && c.contains(e) }) }) }
  /* la descripcion y el aviso, DEBAJO y a ancho completo */
  const desc = document.getElementById('dpt-concl');
  o.desc = R(desc && desc.closest('.calc-box'));
  o.descDebajo = (o.cols && o.desc) ? (o.desc.y > o.cols.y + o.cols.h - 2) : null;
  o.descAncho = (o.cols && o.desc) ? (Math.abs(o.desc.w - o.cols.w) < 40) : null;
  /* conclusion automatica intacta */
  o.badge = (document.getElementById('dpt-concl-badge') || {}).textContent || '';
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  /* texto recortado dentro de las columnas */
  o.recortados = [];
  if (cols) Array.prototype.slice.call(cols.querySelectorAll('label, .calc-lbl')).forEach(e => {
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) o.recortados.push((e.textContent||'').trim().slice(0,32)) });
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 120)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1100);
    const a = await Promise.race([pg.evaluate(JS),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
    console.log(String(w).padStart(4) + ' px | abierta=' + a.abierta +
      ' | sec ' + (a.sec ? a.sec.w + 'x' + a.sec.h : '-') +
      ' | cols=' + a.nCols + ' porFila=' + JSON.stringify(a.porFila) +
      ' minAncho=' + a.minAncho +
      ' | campos en cols ' + a.enCols + '/17 faltan=' + JSON.stringify(a.faltan) + JSON.stringify(a.faltanRO) +
      ' | desc debajo=' + a.descDebajo + ' ancho=' + a.descAncho +
      ' | badge="' + String(a.badge).trim() + '"' +
      ' | recortados=' + a.recortados.length + (a.recortados.length ? JSON.stringify(a.recortados) : '') +
      ' | scrollX=' + a.scrollX + ' | err ' + errs.length + ' ' + (errs[0] || ''));
    if (w === 1440) console.log('      reparto: ' + JSON.stringify(a.reparto));
  } catch (e) { console.log(w + ' ERROR ' + String(e).slice(0, 160)) }
  await ctx.close();
}
await nav.close();
