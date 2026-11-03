/*
 * _probe_pant5tdf.mjs - la Fallot reparada en tres columnas (PANT-5, commit 7).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant5tdf.mjs --file <index.html>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHOS = (arg('--anchos') || '1600,1440,1300,1200,1100,1000,900,899,768,700,699,390').split(',').map(Number);

const JS = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  try { showTab('congenitas') } catch (e) {}
  /* FALLOT VIVE EN LA PRIMERA SUB-PESTANIA, #tab-congenitas -medido buscando hacia atras el
     contenedor que la envuelve-, no en CC complejas como la CIA y la CIV. Con la sub-pestania
     equivocada todo su arbol queda oculto y la sonda informa 0x0. */
  try { if (typeof ccSubTab === 'function') ccSubTab('congenitas') } catch (e) { o.subErr = String(e) }
  const sec = document.getElementById('sacc-cc-tdf');
  if (sec && !sec.classList.contains('open')) { const h = sec.querySelector('.sacc-hdr'); if (h) h.click() }
  if (!sec) { const hs = Array.prototype.slice.call(document.querySelectorAll('.sacc-hdr'));
    hs.forEach(h => { if (/Fallot/.test(h.textContent || '')) h.click() }) }
  const camp = document.getElementById('tdf-campos');
  if (!camp) { o.error = 'NO HAY tdf-campos'; return o }
  /* ⚠️ EL ACORDEON ABRE CON max-height Y UNA TRANSICION, asi que medir en el acto -o con el
     acordeon a medio abrir- da 0x0 en TODO: los campos, las tres columnas y la fila. Es la
     trampa que la tanda AJ9 documenta. Se fuerza la apertura por estilo y se apaga la
     transicion ANTES de medir, que es lo que la orden pide de las sondas. */
  const bod = camp.closest('.sacc-body');
  if (bod) { bod.style.transition = 'none'; bod.style.maxHeight = 'none'; bod.style.overflow = 'visible'; }
  const sa = camp.closest('.sacc'); if (sa) sa.classList.add('open');
  o.bodAlto = bod ? Math.round(bod.getBoundingClientRect().height) : -1;
  camp.scrollIntoView({ block:'center' });
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  o.camp = R(camp);
  o.sec = R(camp.closest('.sacc-body') || camp.parentNode);
  const cols = document.getElementById('tdf-cols');
  if (cols) {
    o.gtc = getComputedStyle(cols).gridTemplateColumns;
    o.nCols = o.gtc.split(' ').filter(x => x).length;
    const hij = Array.prototype.slice.call(cols.children).map(c => R(c));
    o.minAncho = Math.min.apply(null, hij.map(x => x.w));
    const ys = {}; hij.forEach(x => { const k = String(x.y); ys[k] = (ys[k] || 0) + 1 });
    o.porFila = Object.keys(ys).map(k => ys[k]);
    o.altos = hij.map(x => x.h);
  }
  /* la conclusion: a la derecha o debajo */
  const fila = document.getElementById('tdf-fila');
  o.fila = R(fila);
  if (fila) { o.filaDisp = getComputedStyle(fila).display;
    const hh = Array.prototype.slice.call(fila.children).map(c => Math.round(c.getBoundingClientRect().y*10)/10);
    o.conclAlLado = hh.length > 1 ? (Math.max.apply(null,hh) - Math.min.apply(null,hh) < 20) : null; }
  /* CENSO: los quince campos, uno por columna */
  const IDS = ['tdf_ip_ro','tdf_tsvd_ro','tdf_grad_tsvd','tdf_ep_stent','tdf_func_vd','tdf_psvd_ro',
    'tdf_it_ro','tdf_vtdvdi','tdf_vtsvdi','tdf_vol_fuente','tdf_civ_residual','tdf_civ_grad',
    'tdf_sintomas','tdf_ejercicio','tdf_tv'];
  o.faltan = IDS.filter(id => !document.getElementById(id));
  o.reparto = {};
  if (cols) Array.prototype.slice.call(cols.children).forEach((c, k) => {
    o.reparto[k+1] = IDS.filter(id => { const e = document.getElementById(id); return e && c.contains(e) }) });
  o.volumenes = !!(cols && /Vol.menes del ventr.culo derecho/.test(cols.textContent || ''));
  o.arritmia = !!document.getElementById('tdf-tv-res');
  o.editar = Array.prototype.slice.call(document.querySelectorAll('#tdf-cols button')).filter(b => /Editar/.test(b.textContent||'')).length;
  o.globos = document.querySelectorAll('#tdf-cols .vinfo-btn').length;
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = [];
  if (cols) Array.prototype.slice.call(cols.querySelectorAll('label')).forEach(e => {
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) o.recortados.push((e.textContent||'').trim().slice(0,26)) });
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1000);
    const a = await Promise.race([pg.evaluate(JS),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
    if (a.error) { console.log(w + ' ' + a.error); }
    else console.log(String(w).padStart(4) + ' px | bod=' + a.bodAlto + ' | campos ' + (a.camp ? a.camp.w + 'x' + a.camp.h : '-') +
      ' | cols=' + a.nCols + ' porFila=' + JSON.stringify(a.porFila) + ' minAncho=' + a.minAncho +
      ' | conclAlLado=' + a.conclAlLado + ' (' + a.filaDisp + ')' +
      ' | faltan=' + JSON.stringify(a.faltan) + ' vol=' + a.volumenes + ' arr=' + a.arritmia +
      ' editar=' + a.editar + ' globos=' + a.globos +
      ' | recort=' + a.recortados.length + (a.recortados.length ? JSON.stringify(a.recortados) : '') +
      ' | scrollX=' + a.scrollX + ' | err ' + errs.length + ' ' + (errs[0] || ''));
    if (w === 1440) console.log('      reparto: ' + JSON.stringify(a.reparto) + ' altos=' + JSON.stringify(a.altos));
  } catch (e) { console.log(w + ' ERROR ' + String(e).slice(0, 130)) }
  await ctx.close();
}
await nav.close();
