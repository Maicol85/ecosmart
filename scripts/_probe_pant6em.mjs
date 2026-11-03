/*
 * _probe_pant6em.mjs - la Evidencia de la estenosis mitral con el molde nuevo (PANT-6, c3).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant6em.mjs --file <index.html>
 * Mide, con el panel MAXIMIZADO y a los cuatro anchos: el alto y el ancho de la seccion, la
 * franja ambar, las tarjetas de datos, las dos columnas de preguntas, el pie, el conteo de
 * CITAS, la pregunta de sintomas con CADA etiologia, los tres estados y el contraste del ambar.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHOS = [1440, 1000, 768, 390];
/* Las cuatro etiologias que el selector de Valvulas ofrece para la mitral, mas la vacia. */
const ETIO = ['', 'Reumatica', 'Calcificada'];

const JS = (etio, tema) => `(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  if (${JSON.stringify(tema)}) { try { document.documentElement.setAttribute('data-theme', ${JSON.stringify(tema)}) } catch (e) {} }
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    if (e.options && v !== '' && !Array.prototype.some.call(e.options, x => x.value === String(v))) {
      const op = document.createElement('option'); op.value = String(v); op.textContent = String(v); e.appendChild(op) }
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value };
  /* El denominador: una estenosis mitral severa, que es lo que abre la seccion. */
  S('avm_plan','1.2'); S('em_gmedio','12'); S('em_grado','severa'); S('it_grado','4');
  /* La etiologia: el selector real de Valvulas. Se busca la opcion cuyo texto empiece asi. */
  const want = ${JSON.stringify(etio)};
  o.etioPuesta = (function(){
    const e = document.getElementById('vm_morf'); if (!e) return 'NO vm_morf';
    if (want === '') { e.value = ''; e.dispatchEvent(new Event('change',{bubbles:true})); return '(vacia)' }
    const op = Array.prototype.slice.call(e.options).filter(function(x){
      const t = (x.textContent||'').toLowerCase();
      return want === 'Reumatica' ? t.indexOf('reum') > -1
           : t.indexOf('calcif') > -1 || t.indexOf('degener') > -1 });
    if (!op.length) return 'SIN OPCION ' + want;
    e.value = op[0].value; e.dispatchEvent(new Event('change',{bubbles:true}));
    return op[0].value; })();
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  /* El panel, abierto y MAXIMIZADO, que es como la orden pide medirlo. */
  try { if (typeof indicAbrir === 'function') indicAbrir(); else {
    const b = document.querySelector('[onclick*="indicAbrir"]'); if (b) b.click() } } catch (e) { o.abrErr = String(e) }
  await new Promise(r => setTimeout(r, 260));
  try { const mb = document.querySelector('#indic-card [onclick*="indicMax"]'); if (mb) mb.click() } catch (e) {}
  await new Promise(r => setTimeout(r, 260));
  try { if (typeof _indColsSync === 'function') _indColsSync() } catch (e) {}
  const card = document.getElementById('indic-card');
  o.card = card ? Math.round(card.getBoundingClientRect().width) : null;
  /* La seccion de la estenosis mitral: su <details>. */
  const sec = Array.prototype.slice.call(document.querySelectorAll('#indic-card details'))
    .filter(function(d){ const sm = d.querySelector('summary');
      return sm && (sm.textContent||'').trim().indexOf('Estenosis mitral') === 0 })[0];
  if (!sec) { o.err = 'SIN SECCION'; return o }
  if (!sec.open) sec.open = true;
  await new Promise(r => setTimeout(r, 120));
  const R = (e) => { if (!e) return null; const q = e.getBoundingClientRect();
    return { w: Math.round(q.width*10)/10, h: Math.round(q.height*10)/10, x: Math.round(q.x*10)/10, y: Math.round(q.y*10)/10 } };
  o.sec = R(sec);
  o.molde = !!sec.querySelector('[data-ind-molde]');
  const fr = sec.querySelector('.ind-franja');
  o.franja = R(fr);
  o.franjaCat = fr ? (fr.querySelector('.ind-franja-cat .ind-franja-val')||{}).textContent : null;
  o.franjaEt  = fr ? (fr.querySelector('.ind-franja-cat .ind-franja-et')||{}).textContent : null;
  o.franjaEst = fr ? ((fr.querySelector('.ind-franja-est .ind-franja-val')||{}).textContent || '(sin estadio)') : null;
  /* El contraste del ambar, calculado sobre el color COMPUTADO. */
  o.contraste = (function(){
    if (!fr) return null;
    const v = fr.querySelector('.ind-franja-val'); if (!v) return null;
    const lum = (c) => { const m2 = String(c).match(/(\\d+),\\s*(\\d+),\\s*(\\d+)/); if (!m2) return null;
      const f = (x) => { x = x/255; return x <= 0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055, 2.4) };
      return 0.2126*f(+m2[1]) + 0.7152*f(+m2[2]) + 0.0722*f(+m2[3]) };
    /* el fondo efectivo: la franja es translucida sobre el fondo de la seccion */
    const bgF = getComputedStyle(fr).backgroundColor, bgS = getComputedStyle(sec).backgroundColor;
    const pa = String(bgF).match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?/);
    const pb = String(bgS).match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    if (!pa || !pb) return null;
    const al = pa[4] === undefined ? 1 : parseFloat(pa[4]);
    const mez = [0,1,2].map(function(i){ return Math.round(+pa[i+1]*al + +pb[i+1]*(1-al)) });
    const lb = lum('rgb(' + mez.join(',') + ')'), lf = lum(getComputedStyle(v).color);
    if (lb == null || lf == null) return null;
    const hi = Math.max(lb, lf), lo = Math.min(lb, lf);
    return Math.round((hi+0.05)/(lo+0.05)*100)/100; })();
  /* Las tarjetas de datos. */
  const dts = sec.querySelectorAll('.ind-dato');
  o.nDatos = dts.length;
  o.datos = Array.prototype.slice.call(dts).map(function(d){
    return ((d.querySelector('.ind-dato-lbl')||{}).textContent||'').trim().slice(0,26) });
  o.datosGrid = (function(){ const g = sec.querySelector('.ind-datos');
    return g ? getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length : null })();
  /* Las dos columnas de preguntas. */
  const pc = sec.querySelector('.ind-pregcols');
  o.pregcols = pc ? getComputedStyle(pc).gridTemplateColumns.split(' ').filter(Boolean).length : null;
  o.pregcolsDisp = pc ? getComputedStyle(pc).display : null;
  o.nCols = pc ? pc.children.length : null;
  o.grupos = pc ? Array.prototype.slice.call(pc.querySelectorAll('div > div')).filter(function(d){
    return d.children.length === 0 && (d.textContent||'').trim() })
    .map(function(d){ return (d.textContent||'').trim().slice(0,30) }) : null;
  /* El pie: la tabla de recomendaciones, a todo el ancho. */
  o.pieFilas = (function(){
    const ts = Array.prototype.slice.call(sec.querySelectorAll('[data-ind-molde] > table'));
    return ts.length ? ts[ts.length-1].querySelectorAll('tr').length : 0 })();
  /* LA PREGUNTA DE SINTOMAS: existe, es UNA sola, y sus TRES estados. */
  const sx = Array.prototype.slice.call(sec.querySelectorAll('tr')).filter(function(tr){
    return (tr.textContent||'').trim().indexOf('Síntomas') === 0 });
  o.nSintomas = sx.length;
  o.sxBotones = sx.length ? sx[0].querySelectorAll('button.ind-ctrl-btn[data-ind-clin]').length : 0;
  o.sxClave = sx.length ? ((sx[0].querySelector('button.ind-ctrl-btn[data-ind-clin]')||{}).getAttribute
    ? sx[0].querySelector('button.ind-ctrl-btn[data-ind-clin]').getAttribute('data-ind-clin') : '') : '';
  o.sxGlobo = sx.length ? sx[0].querySelectorAll('.vinfo-btn, [data-ind-term]').length : 0;
  o.sxAlto = sx.length ? Math.round(sx[0].getBoundingClientRect().height*10)/10 : 0;
  /* EL CONTEO DE CITAS de la seccion: los corchetes y las entradas de bibliografia. */
  o.corchetes = sec.querySelectorAll('[data-ind-ref], sup').length;
  o.corchTxt = Array.prototype.slice.call(sec.querySelectorAll('[data-ind-ref], sup'))
    .map(function(e){ return (e.textContent||'').trim() }).join('');
  o.biblio = (function(){ const b = sec.querySelector('[data-ind-biblio]');
    if (!b) return 0;
    /* Las entradas de bibliografia no son <li>: se cuentan sus hijos con texto. */
    const n = b.querySelectorAll('li').length;
    if (n) return n;
    return Array.prototype.slice.call(b.children).filter(function(c){
      return c.tagName !== 'SUMMARY' }).reduce(function(a,c){
      return a + Array.prototype.slice.call(c.children).filter(function(x){
        return (x.textContent||'').trim().length > 20 }).length }, 0) })();
  /* El NUMERO MAS ALTO de corchete = cuantos documentos distintos cita la seccion. */
  o.docs = (function(){ const ns = (o.corchTxt.match(/\d+/g) || []).map(Number);
    return ns.length ? Math.max.apply(null, ns) : 0 })();
  /* El estadio NO se repite abajo. */
  o.estadioEnFilas = Array.prototype.slice.call(sec.querySelectorAll('tr')).filter(function(tr){
    return (tr.textContent||'').indexOf('Estadio (AHA/ACC') > -1 }).length;
  /* geometria */
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = Array.prototype.slice.call(sec.querySelectorAll('.ind-dato-lbl, .ind-franja-val, .ind-franja-et'))
    .filter(function(e){ return e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 })
    .map(function(e){ return (e.textContent||'').trim().slice(0,24) });
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  for (const et of ETIO) {
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(1100);
      const a = await Promise.race([pg.evaluate(JS(et, '')),
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
      console.log(String(w).padStart(4) + ' ' + (et || '(vacia)').padEnd(12) +
        ' | molde=' + a.molde + ' card=' + a.card + ' sec ' + (a.sec ? a.sec.w + 'x' + a.sec.h : '-') +
        ' | franja ' + (a.franja ? a.franja.w + 'x' + a.franja.h : 'NO') +
        ' cat="' + String(a.franjaCat).trim().slice(0,34) + '" est="' + String(a.franjaEst).trim().slice(0,26) + '"' +
        ' contraste=' + a.contraste +
        ' | datos=' + a.nDatos + ' grid=' + a.datosGrid +
        ' | pregcols=' + a.pregcols + ' disp=' + a.pregcolsDisp + ' nCols=' + a.nCols +
        ' | pieFilas=' + a.pieFilas +
        ' | sintomas=' + a.nSintomas + ' botones=' + a.sxBotones + ' clave=' + a.sxClave + ' globo=' + a.sxGlobo + ' alto=' + a.sxAlto +
        ' | corchetes=' + a.corchetes + ' docs=' + a.docs + ' biblio=' + a.biblio +
        ' | estadioAbajo=' + a.estadioEnFilas +
        ' | recort=' + a.recortados.length + (a.recortados.length ? JSON.stringify(a.recortados) : '') +
        ' scrollX=' + a.scrollX + ' | err ' + errs.length + ' ' + (errs[0] || ''));
      if (w === 1440 && et === 'Reumatica') {
        console.log('      DATOS: ' + JSON.stringify(a.datos));
        console.log('      GRUPOS: ' + JSON.stringify(a.grupos));
        console.log('      CORCHETES: "' + a.corchTxt + '"');
      }
    } catch (e) { console.log(w + ' ' + et + ' ERROR ' + String(e).slice(0, 170)) }
    await ctx.close();
  }
}
await nav.close();
