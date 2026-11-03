/*
 * _probe_pant5ciaciv.mjs - CIA y CIV lado a lado (PANT-5, commit 5).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 * Las CUATRO combinaciones de lesiones activas x cuatro anchos.
 *   node scripts/_probe_pant5ciaciv.mjs --file <index.html>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHOS = [1440, 1000, 899, 768, 390];
const COMBOS = ['ninguna', 'cia', 'civ', 'dos'];

const JS = (combo) => `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  /* ⚠️ LA SECCION VIVE EN LA SUB-PESTANIA «CC complejas» (#tab-congenitas2) Y NO EN LA PRIMERA.
     Con solo showTab todo su arbol queda bajo display:none, y la sonda informaba 0x0 en los
     veinte cruces -un denominador vacio que se lee igual que «la maqueta no existe». Es la misma
     trampa que PANT-3 pago con la TGA. */
  try { showTab('congenitas') } catch (e) {}
  try { if (typeof ccSubTab === 'function') ccSubTab('congenitas2') } catch (e) { o.subErr = String(e) }
  const sec = document.getElementById('sacc-cc-shunt');
  if (sec && !sec.classList.contains('open')) { const h = sec.querySelector('.sacc-hdr'); if (h) h.click() }
  const body = sec && sec.querySelector('.sacc-body'); if (body) body.style.transition = 'none';
  /* Los botones se tocan de VERDAD: son los toggles de presencia de PANT-3. */
  const tog = (k) => { const b = document.getElementById('ete-shunt-tab-' + k); if (b) b.click() };
  const want = ${JSON.stringify(combo)};
  if (want === 'cia' || want === 'dos') tog('cia');
  if (want === 'civ' || want === 'dos') tog('civ');
  try { eteShuntSync() } catch (e) { o.syncErr = String(e) }
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  const fila = document.getElementById('ete-shunt-fila');
  const pc = document.getElementById('ete-shunt-pane-cia'), pv = document.getElementById('ete-shunt-pane-civ');
  o.ciaVis = pc ? getComputedStyle(pc).display !== 'none' : null;
  o.civVis = pv ? getComputedStyle(pv).display !== 'none' : null;
  o.chkCia = (document.getElementById('ete_cia_activa') || {}).checked;
  o.chkCiv = (document.getElementById('ete_civ_activa') || {}).checked;
  o.fila = R(fila); o.pc = o.ciaVis ? R(pc) : null; o.pv = o.civVis ? R(pv) : null;
  o.clase = fila ? fila.className : null;
  o.disp = fila ? getComputedStyle(fila).display : null;
  o.ladoALado = (o.pc && o.pv) ? (Math.abs(o.pc.y - o.pv.y) < 20 && o.pc.x < o.pv.x) : null;
  /* Con una sola activa, esa tiene que ocupar el ancho entero de la fila. */
  const sola = o.pc || o.pv;
  o.solaAncho = (sola && o.fila && !(o.pc && o.pv)) ? (Math.abs(sola.w - o.fila.w) < 2) : null;
  o.donut = R(document.getElementById('cia-donut-svg'));
  /* el panel del diagrama y la leyenda de colores no se tocan */
  o.donutPanelChars = (document.getElementById('cia-donut-panel') || {}).innerHTML
    ? document.getElementById('cia-donut-panel').innerHTML.length : 0;
  o.donutSegs = document.querySelectorAll('#cia-donut-svg path, #cia-donut-svg circle').length;
  o.donutTextos = Array.prototype.slice.call(document.querySelectorAll('#cia-donut-svg text')).map(t => (t.textContent||'').trim()).filter(x => x).length;
  /* El boton Integrar al informe, FUERA de la fila */
  const bi = document.querySelector('[data-ete-chk="ete_shunt_incluir_chk"]');
  o.btnFuera = (bi && fila) ? !fila.contains(bi) : null;
  o.btn = R(bi);
  /* geometria global */
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = [];
  if (fila) Array.prototype.slice.call(fila.querySelectorAll('label')).forEach(e => {
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) o.recortados.push((e.textContent||'').trim().slice(0,28)) });
  /* censo de ids dentro de la fila: ninguno puede faltar */
  o.nCampos = fila ? fila.querySelectorAll('input[id], select[id]').length : 0;
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  for (const c of COMBOS) {
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(1000);
      const a = await Promise.race([pg.evaluate(JS(c)),
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
      console.log(String(w).padStart(4) + ' ' + c.padEnd(8) +
        ' | vis cia/civ=' + a.ciaVis + '/' + a.civVis + ' chk=' + a.chkCia + '/' + a.chkCiv +
        ' | disp=' + a.disp + ' clase="' + a.clase + '"' +
        ' | fila ' + (a.fila ? a.fila.w + 'x' + a.fila.h : '-') +
        ' pc ' + (a.pc ? a.pc.w + 'x' + a.pc.h : '-') + ' pv ' + (a.pv ? a.pv.w + 'x' + a.pv.h : '-') +
        ' | ladoALado=' + a.ladoALado + ' solaAncho=' + a.solaAncho +
        ' | donut ' + (a.donut ? a.donut.w + 'x' + a.donut.h : '-') + ' segs=' + a.donutSegs + ' txt=' + a.donutTextos +
        ' panel=' + a.donutPanelChars +
        ' | btnFuera=' + a.btnFuera + ' | campos=' + a.nCampos +
        ' | recort=' + a.recortados.length + (a.recortados.length ? JSON.stringify(a.recortados) : '') +
        ' | scrollX=' + a.scrollX + ' | err ' + errs.length + ' ' + (errs[0] || ''));
    } catch (e) { console.log(w + ' ' + c + ' ERROR ' + String(e).slice(0, 140)) }
    await ctx.close();
  }
}
await nav.close();
