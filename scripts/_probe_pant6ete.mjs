/*
 * _probe_pant6ete.mjs - morfologia y mediciones de la mitral en UNA seccion (PANT-6, c4).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant6ete.mjs --file <index.html>
 * Mide, a los cuatro anchos y con CUATRO estudios -solo morfologia, solo mediciones, ambas y
 * ninguna-: cuantos acordeones hay, su titulo, su estado al abrir, el badge de cada casilla, el
 * reparto de los campos en columnas, el alto y el ancho, y la sincronia de los velos.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHOS = [1440, 1000, 768, 390];
const ESCENAS = ['ninguna', 'solo-morfo', 'solo-medic', 'ambas'];
const OCHO = ['ete_lva','ete_lvp','ete_diam_anular','ete_area_mitral',
              'ete_altura_tenting','ete_area_tenting','ete_angulo_vp','ete_prof_coapt'];
const TRES = ['ete_etiologia','ete_carpentier','ete_mecanismo'];

const JS = (esc) => `(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  try { showTab('ete') } catch (e) { try { showTab('ETE') } catch (e2) { o.tabErr = String(e2) } }
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value };
  const q = ${JSON.stringify(esc)};
  if (q === 'solo-morfo' || q === 'ambas') { S('ete_etiologia','barlow'); S('ete_carpentier','II'); S('ete_mecanismo','prolapso') }
  if (q === 'solo-medic' || q === 'ambas') { S('ete_lva','24'); S('ete_lvp','12');
    S('ete_diam_anular','38'); S('ete_area_mitral','3.2'); S('ete_altura_tenting','8');
    S('ete_area_tenting','2.1'); S('ete_angulo_vp','40'); S('ete_prof_coapt','7') }
  try { calcETE() } catch (e) {}
  /* EL ESTADO AL ABRIR, antes de tocar nada: eso es la «apertura automatica». */
  const disp = (id) => { const e = document.getElementById(id);
    return e ? getComputedStyle(e).display : 'NO EXISTE' };
  o.autoMorfo = disp('ete-seccion-morfo');
  o.autoMedic = disp('ete-seccion-mediciones-mitral');
  /* Los encabezados de acordeon que nombran la morfologia o las mediciones de la mitral. */
  o.heads = Array.prototype.slice.call(document.querySelectorAll('#tab-ete .card-head, .card-head'))
    .filter(function(h){ const t = (h.textContent||'').toLowerCase();
      /* El encabezado de morfologia dice «VM» y no «mitral»: filtrar por «mitral» lo dejaba
         afuera y la sonda informaba UN acordeon donde hay dos. */
      return t.indexOf('morfolog') > -1 || t.indexOf('mediciones ete') > -1 })
    .map(function(h){ return (h.textContent||'').replace(/\\s+/g,' ').trim().slice(0,60) });
  o.nHeads = o.heads.length;
  /* Se abre por su boton REAL. */
  (function(){ const h = document.querySelector('[onclick*="toggleEteSeccion(\\'morfo\\'"]');
    if (h) h.click(); })();
  (function(){ const h = document.querySelector('[onclick*="toggleEteSeccion(\\'mediciones-mitral\\'"]');
    if (h) h.click(); })();
  await new Promise(r => setTimeout(r, 140));
  o.abMorfo = disp('ete-seccion-morfo');
  o.abMedic = disp('ete-seccion-mediciones-mitral');
  /* El badge de cada casilla. */
  try { if (typeof eteInclSync === 'function') eteInclSync() } catch (e) {}
  const bdg = (id) => { const e = document.getElementById(id);
    return e ? (e.hasAttribute('hidden') ? 'oculto' : 'visible') : 'NO EXISTE' };
  o.badgeMorfo = bdg('ete_morfo_badge');
  /* Los dos botones de inclusion, cada uno con su estado. */
  const btn = (sel) => { const b = document.querySelector(sel);
    return b ? ((b.textContent||'').trim().slice(0,22) + ' pressed=' + b.getAttribute('aria-pressed')) : 'NO EXISTE' };
  o.btnMorfo = btn('[data-ete-chk="ete_morfo_incluir_chk"]');
  o.btnMedic = btn('[data-am-k="etem"]');
  /* La maqueta: cuantas columnas y que campo cae en cada una. */
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10,
             x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  const cols = document.getElementById('etem-cols');
  o.cols = cols ? getComputedStyle(cols).gridTemplateColumns.split(' ').filter(Boolean).length : null;
  o.colsDisp = cols ? getComputedStyle(cols).display : null;
  /* El campo -> su columna, por la x de su contenedor de columna. */
  o.reparto = {};
  if (cols) {
    const hijos = Array.prototype.slice.call(cols.children);
    ${JSON.stringify(TRES.concat(OCHO))}.forEach(function(id){
      const e = document.getElementById(id); if (!e) { o.reparto[id] = 'NO EXISTE'; return }
      let k = -1; hijos.forEach(function(c,i){ if (c.contains(e)) k = i });
      o.reparto[id] = k;
    });
  }
  /* Los once campos existen y ninguno se perdio. */
  o.falta = ${JSON.stringify(TRES.concat(OCHO))}.filter(function(id){ return !document.getElementById(id) });
  /* El cuadro de caracteristicas desfavorables: sus filas no cambian. */
  const cb = document.getElementById('etem-desfav');
  o.desfav = cb ? cb.querySelectorAll('.calc-row').length : (function(){
    const t = Array.prototype.slice.call(document.querySelectorAll('#ete-seccion-mediciones-mitral .calc-box, #ete-seccion-morfo .calc-box'))
      .filter(function(x){ return (x.textContent||'').indexOf('DESFAVORABLES') > -1 })[0];
    return t ? t.querySelectorAll('.calc-row').length : 0 })();
  /* La seccion entera y el dibujo, que NO se funde. */
  o.secMorfo = R(document.getElementById('ete-seccion-morfo'));
  o.secMedic = R(document.getElementById('ete-seccion-mediciones-mitral'));
  o.m3d = R(document.getElementById('m3d-fila'));
  /* LA SINCRONIA DE LOS VELOS, en los DOS sentidos (PANT-5). */
  S('ete_lva','26'); try { etemVeloGesto('ete_lva') } catch (e) {}
  o.sinc1 = (document.getElementById('teer_lva')||{}).value;
  S('teer_lvp','9'); try { etemVeloGesto('teer_lvp') } catch (e) {}
  o.sinc2 = (document.getElementById('ete_lvp')||{}).value;
  /* geometria */
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = Array.prototype.slice.call(document.querySelectorAll('#ete-seccion-morfo label, #ete-seccion-mediciones-mitral label'))
    .filter(function(e){ return e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 })
    .map(function(e){ return (e.textContent||'').trim().slice(0,24) });
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  for (const esc of ESCENAS) {
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(1100);
      const a = await Promise.race([pg.evaluate(JS(esc)),
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
      console.log(String(w).padStart(4) + ' ' + esc.padEnd(11) +
        ' | heads=' + a.nHeads + ' auto M/Me=' + a.autoMorfo + '/' + a.autoMedic +
        ' abierto=' + a.abMorfo + '/' + a.abMedic +
        ' | badge=' + a.badgeMorfo + ' btnM="' + a.btnMorfo + '" btnMe="' + a.btnMedic + '"' +
        ' | cols=' + a.cols + ' disp=' + a.colsDisp +
        ' | secM ' + (a.secMorfo ? a.secMorfo.w + 'x' + a.secMorfo.h : '-') +
        ' secMe ' + (a.secMedic ? a.secMedic.w + 'x' + a.secMedic.h : '-') +
        ' m3d ' + (a.m3d ? a.m3d.w + 'x' + a.m3d.h : '-') +
        ' | desfav=' + a.desfav + ' falta=' + a.falta.length + (a.falta.length?JSON.stringify(a.falta):'') +
        ' | sinc ' + a.sinc1 + '/' + a.sinc2 +
        ' | recort=' + a.recortados.length + ' scrollX=' + a.scrollX + ' | err ' + errs.length + ' ' + (errs[0]||''));
      if (w === 1440 && esc === 'ambas') {
        console.log('      HEADS: ' + JSON.stringify(a.heads));
        console.log('      REPARTO: ' + JSON.stringify(a.reparto));
      }
    } catch (e) { console.log(w + ' ' + esc + ' ERROR ' + String(e).slice(0, 170)) }
    await ctx.close();
  }
}
await nav.close();
