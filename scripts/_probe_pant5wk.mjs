/*
 * _probe_pant5wk.mjs - Chrome y WebKit sobre las zonas de la tanda PANT-5 (2026-11-03).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Dos motores x 1440, 1000, 768 y 390 px x dos temas = DIECISEIS cruces por motor.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 *    channel chrome: sin eso la sonda devuelve los cruces vacios.
 *
 *   node scripts/_probe_pant5wk.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p5wk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['oscuro', 'claro'];

const MEDIR = (tema) => `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  if (${JSON.stringify(tema)} === 'claro') { try { document.documentElement.classList.add('light-mode') } catch (e) {} }
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  const R = (sel) => { const e = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10 } };
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true })); e.dispatchEvent(new Event('change', { bubbles:true })) };
  /* ---- HEMODINAMICA: el dibujo del VD y el Forrester ---- */
  try { showTab('hemodinamica') } catch (e) {}
  const sec = document.getElementById('tep-seccion');
  if (sec && getComputedStyle(sec).display === 'none') { const h = document.querySelector('[onclick*="tep-seccion"]'); if (h) h.click() }
  S('tep_vdvi','1.30'); S('tapse','10'); S('tep_mcconnell','si'); S('tep_tabique_d','si');
  S('it_grado','4'); S('vmax_it','4.2');
  try { vdscSync(); vdscFase(0.40) } catch (e) {}
  const svg = document.getElementById('vdsc-svg');
  o.dibujo = R(svg);
  o.ladoALado = (() => { const f = document.getElementById('vdsc-fila'); if (!f || f.children.length < 2) return null;
    const ys = Array.prototype.slice.call(f.children).map(c => Math.round(c.getBoundingClientRect().y));
    return Math.max.apply(null, ys) - Math.min.apply(null, ys) < 20 })();
  o.botonPausa = (() => { const b = document.getElementById('vdsc-play'); if (!b) return null;
    const r = b.getBoundingClientRect(); return Math.round(r.height) })();
  o.textosDib = svg ? Array.prototype.slice.call(svg.querySelectorAll('text')).filter(t => {
    let n = t; while (n && n !== svg) { if (n.getAttribute && parseFloat(n.getAttribute('opacity')||'1') === 0) return false; n = n.parentNode }
    return (t.textContent||'').trim() }).length : -1;
  o.noGrises = (() => { if (!svg) return -1;
    const gris = c => { const m = String(c).match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
      if (!m) return true; return Math.max(+m[1],+m[2],+m[3]) - Math.min(+m[1],+m[2],+m[3]) <= 6 };
    const cel = getComputedStyle(document.documentElement).getPropertyValue('--vdsc-cel').trim();
    const cm = cel.match(/#([0-9a-fA-F]{6})/);
    const esCel = c => { if (!cm) return false; const m = String(c).match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
      if (!m) return false; const R2=parseInt(cm[1].slice(0,2),16),G=parseInt(cm[1].slice(2,4),16),B=parseInt(cm[1].slice(4,6),16);
      return Math.abs(+m[1]-R2)<=3 && Math.abs(+m[2]-G)<=3 && Math.abs(+m[3]-B)<=3 };
    let n = 0;
    Array.prototype.slice.call(svg.querySelectorAll('*')).forEach(x => {
      if (['defs','linearGradient','radialGradient','stop','pattern','clipPath'].indexOf(x.tagName) > -1) return;
      const cs = getComputedStyle(x);
      ['fill','stroke'].forEach(p => { const v = cs[p];
        if (!v || v === 'none' || String(v).indexOf('url(') === 0) return;
        if (gris(v) || esCel(v)) return; n++ }) });
    return n })();
  try { calcHemo(); hemoForrGrafSync() } catch (e) {}
  const graf = document.getElementById('hemo-forr-graf');
  o.forrAlLado = (() => { const f = document.getElementById('hemo-forr-fila'); if (!f || f.children.length < 2) return null;
    const ys = Array.prototype.slice.call(f.children).map(c => Math.round(c.getBoundingClientRect().y));
    return Math.max.apply(null, ys) - Math.min.apply(null, ys) < 20 })();
  o.forrMsgEnSvg = graf ? Array.prototype.slice.call(graf.querySelectorAll('text'))
    .filter(t => (t.textContent||'').indexOf('capilar pulmonar estimada') > -1).length : -1;
  /* ---- DERRAME y CONSTRICCION ---- */
  /* ⚠️ LAS DOS SECCIONES SE ABREN POR SU ENCABEZADO REAL. Con el acordeon cerrado todos sus
     hijos informan y=0, asi que el contador de «cuantos comparten fila» devolvia 4 en los
     dieciseis cruces -incluido 390 px, donde son UNA columna-: un denominador vacio que se lee
     igual que «las columnas no se apilan». */
  ['derrame-tap','constr-restr'].forEach(k => {
    const s2 = document.getElementById('ete-seccion-' + k);
    if (s2 && getComputedStyle(s2).display === 'none') {
      const h = document.querySelector('[onclick*="' + k + '"]'); if (h) h.click() }
  });
  const dc = document.getElementById('dpt-cols');
  o.dptCols = dc ? (() => { const ys = {}; Array.prototype.slice.call(dc.children)
    .forEach(c => { const k = String(Math.round(c.getBoundingClientRect().y)); ys[k] = (ys[k]||0)+1 });
    return Math.max.apply(null, Object.keys(ys).map(k => ys[k])) })() : -1;
  const cg = document.getElementById('cvr-campos-grid');
  o.cvrCols = cg ? (() => { const ys = {}; Array.prototype.slice.call(cg.children)
    .forEach(c => { const k = String(Math.round(c.getBoundingClientRect().y)); ys[k] = (ys[k]||0)+1 });
    return Math.max.apply(null, Object.keys(ys).map(k => ys[k])) })() : -1;
  /* ---- CONGENITAS: Fallot, las estenosis y CIA/CIV ---- */
  try { showTab('congenitas'); if (typeof ccSubTab === 'function') ccSubTab('congenitas') } catch (e) {}
  const tdf = document.getElementById('tdf-cols');
  if (tdf) { const b = tdf.closest('.sacc-body'); if (b) { b.style.transition='none'; b.style.maxHeight='none' }
    const sa = tdf.closest('.sacc'); if (sa) sa.classList.add('open') }
  o.tdfCols = tdf ? (() => { const ys = {}; Array.prototype.slice.call(tdf.children)
    .forEach(c => { const k = String(Math.round(c.getBoundingClientRect().y)); ys[k] = (ys[k]||0)+1 });
    return Math.max.apply(null, Object.keys(ys).map(k => ys[k])) })() : -1;
  try { if (typeof ccSubTab === 'function') ccSubTab('congenitas2') } catch (e) {}
  ['sacc-cc-esub'].forEach(id => { const s2 = document.getElementById(id);
    if (s2 && !s2.classList.contains('open')) { const h = s2.querySelector('.sacc-hdr'); if (h) h.click() }
    const b = s2 && s2.querySelector('.sacc-body'); if (b) b.style.transition = 'none' });
  S('esub_tipo','membrana'); S('esub_gradiente_medio','45'); S('esub_ia_asociada','moderada');
  try { esubSync() } catch (e) {}
  const cs = (document.getElementById('esub-resultado') || {}).textContent || '';
  o.esubGuia = cs.indexOf('ESC 2020') > -1;
  o.esubSevera = cs.indexOf('severa') > -1;
  /* CIA / CIV con las dos marcadas */
  const sh = document.getElementById('sacc-cc-shunt');
  if (sh && !sh.classList.contains('open')) { const h = sh.querySelector('.sacc-hdr'); if (h) h.click() }
  const b2 = sh && sh.querySelector('.sacc-body'); if (b2) b2.style.transition = 'none';
  ['cia','civ'].forEach(k => { const b3 = document.getElementById('ete-shunt-tab-' + k); if (b3) b3.click() });
  try { eteShuntSync() } catch (e) {}
  const pc = document.getElementById('ete-shunt-pane-cia'), pv = document.getElementById('ete-shunt-pane-civ');
  o.ciaVis = pc ? getComputedStyle(pc).display !== 'none' : null;
  o.civVis = pv ? getComputedStyle(pv).display !== 'none' : null;
  o.ciacivLado = (o.ciaVis && o.civVis)
    ? Math.abs(pc.getBoundingClientRect().y - pv.getBoundingClientRect().y) < 20 : null;
  o.donut = R('#cia-donut-svg');
  /* ---- geometria global ---- */
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = 0;
  document.querySelectorAll('label, .calc-lbl').forEach(e => {
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) o.recortados++ });
  return o;
})()`;

const res = { file: FILE, cruces: {} };
for (const motor of ['chromium', 'webkit']) {
  let nav;
  try { nav = motor === 'chromium' ? await _pw.chromium.launch({ channel: 'chrome' }) : await _pw.webkit.launch() }
  catch (e) { res.cruces[motor] = { error: String(e).slice(0, 120) }; continue }
  for (const w of ANCHOS) for (const t of TEMAS) {
    const k = motor + '@' + w + '@' + t;
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
    pg.on('console', m => { if (m.type() === 'error') errs.push('C:' + m.text().slice(0, 110)) });
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 90000 });
      await pg.waitForTimeout(1200);
      const r = await Promise.race([pg.evaluate(MEDIR(t)),
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout ' + k)), 90000))]);
      r.errores = errs.length; r.err1 = errs[0] || '';
      res.cruces[k] = r;
    } catch (e) { res.cruces[k] = { error: String(e).slice(0, 160) } }
    await ctx.close();
  }
  await nav.close();
}
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
for (const k of Object.keys(res.cruces)) {
  const a = res.cruces[k];
  if (a.error) { console.log(k.padEnd(22) + ' ERROR ' + a.error); continue }
  console.log(k.padEnd(22) + ' | dib ' + (a.dibujo ? a.dibujo.w + 'x' + a.dibujo.h : '-') +
    ' lado=' + a.ladoALado + ' txt=' + a.textosDib + ' noGris=' + a.noGrises + ' pausa=' + a.botonPausa +
    ' | forrLado=' + a.forrAlLado + ' msgSvg=' + a.forrMsgEnSvg +
    ' | dpt=' + a.dptCols + ' tdf=' + a.tdfCols + ' cvr=' + a.cvrCols +
    ' | esubGuia=' + a.esubGuia + ' severa=' + a.esubSevera +
    ' | cia/civ=' + a.ciaVis + '/' + a.civVis + ' lado=' + a.ciacivLado +
    ' donut=' + (a.donut ? a.donut.w : '-') +
    ' | scrollX=' + a.scrollX + ' recort=' + a.recortados + ' err=' + a.errores + ' ' + (a.err1 || ''));
}
