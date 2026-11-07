#!/usr/bin/env node
/** _probe_pant23fuera.mjs - PANT-23, commit 1: los globos FUERA del panel de Evidencia.
 *  Los censa por su mecanismo y los deja listados para P23-b. SOLO LECTURA. */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');

const CUERPO = `(async () => {
  const R = {};
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const norm = function (t) { const s = String(t == null ? '' : t); let o = '', sp = false;
    for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13 || c === 160) { sp = true; continue }
      if (sp && o) o += ' '; sp = false; o += s.charAt(i); }
    return o; };
  const GLIFO = String.fromCharCode(9432);
  const ov = document.getElementById('indic-overlay');
  /* todo elemento cuyo texto propio es el glifo del globo */
  const cands = Array.prototype.slice.call(document.querySelectorAll('button, span, a, summary, div'))
    .filter(function (e) { const t = norm(e.textContent); return t === GLIFO || t.indexOf(GLIFO) === 0 })
    .filter(function (e) { return !e.querySelector('button, span, a, summary') || norm(e.textContent) === GLIFO });
  const clasif = function (e) {
    const oc = e.getAttribute('onclick') || '';
    if (e.hasAttribute('data-ind-term')) return 'panel:data-ind-term';
    if (e.closest('details[data-ind-info]')) return 'panel:data-ind-info';
    if (e.closest('details[data-ind-detalle]')) return 'panel:data-ind-detalle';
    if (e.closest('details[data-ind-biblio]')) return 'panel:data-ind-biblio';
    if (e.closest('details[data-ind-bloque]')) return 'panel:data-ind-bloque';
    if (oc.indexOf('_vInfoAbrir') > -1) return 'fuera:_vInfoAbrir (vinfo-card)';
    if (oc.indexOf('evRefAbrir') > -1) return 'fuera:evRefAbrir';
    if (oc) return 'fuera:onclick ' + oc.slice(0, 34);
    if (e.tagName === 'SUMMARY') return 'fuera:summary de details';
    return 'fuera:sin onclick';
  };
  const porClase = {}; const fuera = [];
  cands.forEach(function (e) {
    const k = clasif(e); porClase[k] = (porClase[k] || 0) + 1;
    if (k.indexOf('fuera:') === 0 && fuera.length < 400) {
      /* la pestania a la que pertenece */
      let tab = ''; let p = e;
      while (p && p !== document.body) { if (p.id && p.id.indexOf('tab-') === 0) { tab = p.id; break }
        if (p.classList && p.classList.contains('tab-content') && p.id) { tab = p.id; break } p = p.parentElement }
      fuera.push({ mec: k, tab: tab, id: e.id || '', aria: norm(e.getAttribute('aria-label') || '').slice(0, 44) });
    }
  });
  R.porClase = porClase;
  R.nFuera = fuera.length;
  /* agrupado por mecanismo y pestania */
  const agr = {};
  fuera.forEach(function (f) { const k = f.mec + ' @ ' + (f.tab || '(sin pestania)');
    agr[k] = (agr[k] || 0) + 1 });
  R.fueraAgrupado = agr;
  R.dentroDelOverlay = ov ? cands.filter(function (e) { return ov.contains(e) }).length : null;
  R.total = cands.length;
  return R;
})()`;

const nav = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1600);
let r; try { r = await pg.evaluate(CUERPO) } catch (e) { r = { ERR: String(e.message).slice(0, 600) } }
await ctx.close(); await nav.close();
console.log(JSON.stringify(r, null, 1));
