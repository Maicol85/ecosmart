/*
 * _probe_pant8wk.mjs - PANT-8: los DOS motores (Chrome del sistema y WebKit de Playwright),
 * cuatro anchos y dos temas. Nombre propio: verificado con ls, no existia.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 *    channel: chrome; sin eso la sonda devuelve los cruces vacios.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant8wk.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p8wk.json';
const ANCHOS = [1440, 1000, 768, 390];

const JS = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if(m) m.style.display='none' });
  const o = {};
  const g = (id) => document.getElementById(id);
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return Math.round(r.width) + 'x' + Math.round(r.height) };
  try { showTab('ete') } catch(e) { o.e1 = 1 }
  const sec = g('ete-seccion-tavi');
  if (sec && getComputedStyle(sec).display === 'none') { try { toggleEteSeccion('tavi') } catch(e) {} }
  document.querySelectorAll('*').forEach(e => { e.style.transition='none'; e.style.animation='none' });
  /* ── los dos botones ── */
  try { eteTaviTab('pre') } catch(e) {}
  const bPre = g('ete-tavi-tab-pre'), bPost = g('ete-tavi-tab-post');
  o.preRect = R(bPre); o.postRect = R(bPost);
  o.preVis = !!(bPre && bPre.offsetParent); o.postVis = !!(bPost && bPost.offsetParent);
  o.preX = bPre ? Math.round(bPre.getBoundingClientRect().x) : -1;
  o.postX = bPost ? Math.round(bPost.getBoundingClientRect().x) : -1;
  o.preRelleno = bPre ? getComputedStyle(bPre).backgroundColor : 'NO';
  o.postRelleno = bPost ? getComputedStyle(bPost).backgroundColor : 'NO';
  /* ── las tres columnas ── */
  try { eteTaviTab('post') } catch(e) {}
  const cc = g('ete-tavi-post-cols');
  o.colsN = cc ? cc.children.length : 0;
  o.colsTpl = cc ? getComputedStyle(cc).gridTemplateColumns : 'NO';
  o.colsLado = cc ? (function(){ const ys = Array.prototype.slice.call(cc.children)
    .map(h => Math.round(h.getBoundingClientRect().y));
    return (Math.max.apply(null,ys) - Math.min.apply(null,ys)) < 20 })() : null;
  o.trasCols = cc && cc.nextElementSibling ? (cc.nextElementSibling.textContent||'').trim().slice(0,22) : 'NO';
  /* ── el globo de la calcificacion ── */
  try { eteTaviTab('pre') } catch(e) {}
  const bi = document.querySelector('[data-vinfo="tavi-calc"]');
  if (bi) bi.scrollIntoView({ block:'center' });
  o.globoRect = R(bi);
  if (bi) bi.click();
  const card = g('vinfo-card');
  const vis = card && getComputedStyle(card).display !== 'none' && card.getBoundingClientRect().width > 0;
  o.globoAbre = !!vis;
  if (vis) {
    const r = card.getBoundingClientRect();
    o.globoCard = R(card);
    o.globoDentro = (r.x >= -1 && r.y >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1);
    const tam = {}; const andar = (n) => { for (const h of n.childNodes) {
      if (h.nodeType === 3) { const s=(h.textContent||'').replace(/\\s+/g,' ').trim(); if(!s) continue;
        const f = getComputedStyle(h.parentElement).fontSize; tam[f]=(tam[f]||0)+s.length }
      else if (h.nodeType === 1) andar(h) } };
    andar(card); o.globoTam = JSON.stringify(tam);
  }
  if (bi) bi.click();
  /* ── la sincronia, en los dos motores ── */
  const S = (id,v) => { const e=g(id); if(!e) return; e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})) };
  S('ete_tavi_valsalva','38');
  o.sincro = (g('ao_sin')||{}).value || '';
  S('ete_tavi_valsalva','');
  /* ── barra horizontal y textos recortados ── */
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  let rec = 0;
  if (sec) Array.prototype.slice.call(sec.querySelectorAll('label, button, .calc-lbl')).forEach(e => {
    if (e.children.length) return;
    if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) rec++ });
  o.recortados = rec;
  return o;
})()`;

const res = { file: FILE, cruces: {} };
for (const motor of ['chromium', 'webkit']) {
  for (const tema of ['dark', 'light']) {
    for (const w of ANCHOS) {
      const k = motor + '|' + tema + '|' + w;
      let nav = null;
      try {
        nav = await _pw[motor].launch(motor === 'chromium' ? { channel: 'chrome' } : {});
        const ctx = await nav.newContext({ viewport: { width: w, height: 900 }, colorScheme: tema });
        const pg = await ctx.newPage();
        const errs = [];
        pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
        await pg.waitForTimeout(1200);
        const r = await pg.evaluate(JS);
        r.errores = errs.length; r.err1 = errs[0] || '';
        res.cruces[k] = r;
        await ctx.close();
      } catch (e) { res.cruces[k] = { error: String(e).slice(0, 180) } }
      try { if (nav) await nav.close() } catch (e) {}
    }
  }
}
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito ' + OUTF);
