/*
 * _probe_pant6val.mjs - el molde en las otras valvulas (PANT-6, commit 7). GENERICO.
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant6val.mjs --file <index.html> --sec "Insuficiencia aortica" --campos '{"ia_grado":"4"}'
 * Mide a los cuatro anchos, con el panel MAXIMIZADO: el alto y el ancho de la seccion, el
 * VACIO de la columna izquierda, la franja, las tarjetas, las columnas de preguntas, el pie,
 * el conteo de CITAS y de bibliografia, la pregunta de sintomas y su globo.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const SEC = arg('--sec') || 'Insuficiencia a';
const CAMPOS = JSON.parse(arg('--campos') || '{}');
const ANCHOS = [1440, 1000, 768, 390];

const JS = `(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    if (e.options && v !== '' && !Array.prototype.some.call(e.options, x => x.value === String(v))) {
      const op = document.createElement('option'); op.value = String(v); op.textContent = String(v); e.appendChild(op) }
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value };
  const C = ${JSON.stringify(CAMPOS)};
  o.puestos = Object.keys(C).map(k => k + '=' + S(k, C[k])).join(' ');
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) { o.abrErr = String(e) }
  await new Promise(r => setTimeout(r, 260));
  try { const mb = document.querySelector('#indic-card [onclick*="indicMax"]'); if (mb) mb.click() } catch (e) {}
  await new Promise(r => setTimeout(r, 260));
  try { if (typeof _indColsSync === 'function') _indColsSync() } catch (e) {}
  const card = document.getElementById('indic-card');
  o.card = card ? Math.round(card.getBoundingClientRect().width) : null;
  const pref = ${JSON.stringify(SEC)};
  const sec = Array.prototype.slice.call(document.querySelectorAll('#indic-card details'))
    .filter(function(d){ const sm = d.querySelector('summary');
      return sm && (sm.textContent||'').trim().indexOf(pref) === 0 })[0];
  if (!sec) { o.err = 'SIN SECCION ' + pref; return o }
  if (!sec.open) sec.open = true;
  await new Promise(r => setTimeout(r, 120));
  const R = (e) => { if (!e) return null; const q = e.getBoundingClientRect();
    return { w: Math.round(q.width*10)/10, h: Math.round(q.height*10)/10 } };
  o.sec = R(sec);
  o.molde = !!sec.querySelector('[data-ind-molde]');
  /* EL VACIO de la columna izquierda: la grilla de dos columnas de la rama vieja. */
  const g = sec.querySelector('[data-ind-grid]');
  o.gridDisp = g ? getComputedStyle(g).display : null;
  const eco = sec.querySelector('[data-ind-col="eco"]'), cli = sec.querySelector('[data-ind-col="clin"]');
  o.eco = R(eco); o.cli = R(cli);
  o.vacioIzq = (o.eco && o.cli && getComputedStyle(g).display === 'grid')
    ? Math.round((o.cli.h - o.eco.h) * 10) / 10 : null;
  /* El molde. */
  const fr = sec.querySelector('.ind-franja');
  o.franja = R(fr);
  o.franjaCat = fr ? ((fr.querySelector('.ind-franja-cat .ind-franja-val')||{}).textContent||'').trim() : null;
  o.franjaEst = fr ? ((fr.querySelector('.ind-franja-est .ind-franja-val')||{}).textContent||'').trim() : null;
  o.nDatos = sec.querySelectorAll('.ind-dato').length;
  o.datos = Array.prototype.slice.call(sec.querySelectorAll('.ind-dato-lbl'))
    .map(function(d){ return (d.textContent||'').trim().slice(0,28) });
  o.datosGrid = (function(){ const x = sec.querySelector('.ind-datos');
    return x ? getComputedStyle(x).gridTemplateColumns.split(' ').filter(Boolean).length : null })();
  const pc = sec.querySelector('.ind-pregcols');
  /* ⚠️ SE LEE EL display Y NO SOLO grid-template-columns: con display:block el computado
     de esa propiedad devuelve el valor ESPECIFICADO -«minmax(360px, 1fr) minmax(360px, 1fr)»,
     que son cuatro tokens- y contar tokens informaba CUATRO columnas sobre una sola. */
  o.pregcolsDisp = pc ? getComputedStyle(pc).display : null;
  o.pregcols = pc ? (getComputedStyle(pc).display !== 'grid' ? 1
    : getComputedStyle(pc).gridTemplateColumns.split(' ').filter(Boolean).length) : null;
  o.nColsDom = pc ? pc.children.length : null;
  o.grupos = pc ? Array.prototype.slice.call(pc.querySelectorAll('div > div')).filter(function(d){
    return d.children.length === 0 && (d.textContent||'').trim() })
    .map(function(d){ return (d.textContent||'').trim().slice(0,32) }) : null;
  /* Preguntas: cuantas, y la de SINTOMAS con su globo. */
  o.nPreg = sec.querySelectorAll('button.ind-ctrl-btn[data-ind-clin]').length;
  o.claves = Array.prototype.slice.call(sec.querySelectorAll('button.ind-ctrl-btn[data-ind-clin]'))
    .map(function(b){ return b.getAttribute('data-ind-clin') })
    .filter(function(v, i, a){ return a.indexOf(v) === i });
  const sx = Array.prototype.slice.call(sec.querySelectorAll('tr')).filter(function(tr){
    return (tr.textContent||'').trim().indexOf('Síntomas') === 0 });
  o.nSintomas = sx.length;
  o.sxGlobo = sx.length ? sx[0].querySelectorAll('[data-ind-term]').length : 0;
  o.sxTerm = sx.length && sx[0].querySelector('[data-ind-term]')
    ? sx[0].querySelector('[data-ind-term]').getAttribute('data-ind-term') : '';
  /* CITAS y bibliografia. */
  o.corchetes = sec.querySelectorAll('[data-ind-ref], sup').length;
  o.biblio = (function(){ const b = sec.querySelector('[data-ind-biblio]');
    if (!b) return 0; const n = b.querySelectorAll('li').length; if (n) return n;
    return Array.prototype.slice.call(b.children).filter(function(c){ return c.tagName !== 'SUMMARY' })
      .reduce(function(a,c){ return a + Array.prototype.slice.call(c.children)
        .filter(function(x){ return (x.textContent||'').trim().length > 20 }).length }, 0) })();
  o.estadioEnFilas = Array.prototype.slice.call(sec.querySelectorAll('tr')).filter(function(tr){
    return (tr.textContent||'').indexOf('Estadio (AHA/ACC') > -1 }).length;
  o.recom = !!sec.querySelector('[data-ind-recom], .ind-recom');
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = Array.prototype.slice.call(sec.querySelectorAll('.ind-dato-lbl, .ind-franja-val'))
    .filter(function(e){ return e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 }).length;
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1100);
    const a = await Promise.race([pg.evaluate(JS),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
    if (a.err) { console.log(String(w).padStart(4) + ' ' + a.err); await ctx.close(); continue }
    console.log(String(w).padStart(4) + ' | molde=' + a.molde + ' card=' + a.card +
      ' sec ' + (a.sec ? a.sec.w + 'x' + a.sec.h : '-') +
      ' | eco ' + (a.eco ? a.eco.w + 'x' + a.eco.h : '-') + ' cli ' + (a.cli ? a.cli.w + 'x' + a.cli.h : '-') +
      ' VACIO=' + a.vacioIzq +
      ' | franja ' + (a.franja ? a.franja.w + 'x' + a.franja.h : 'NO') +
      ' cat="' + String(a.franjaCat).slice(0,30) + '" est="' + String(a.franjaEst).slice(0,22) + '"' +
      ' | datos=' + a.nDatos + ' grid=' + a.datosGrid +
      ' | pregcols=' + a.pregcols + ' nCols=' + a.nColsDom + ' nPreg=' + a.nPreg +
      ' | sintomas=' + a.nSintomas + ' globo=' + a.sxGlobo + ' term=' + a.sxTerm +
      ' | corchetes=' + a.corchetes + ' biblio=' + a.biblio + ' estadioAbajo=' + a.estadioEnFilas +
      ' | recort=' + a.recortados + ' scrollX=' + a.scrollX + ' | err ' + errs.length + ' ' + (errs[0]||''));
    if (w === 1440) { console.log('      DATOS: ' + JSON.stringify(a.datos));
      console.log('      CLAVES: ' + JSON.stringify(a.claves));
      if (a.grupos) console.log('      GRUPOS: ' + JSON.stringify(a.grupos)); }
  } catch (e) { console.log(w + ' ERROR ' + String(e).slice(0, 170)) }
  await ctx.close();
}
await nav.close();
