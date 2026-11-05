#!/usr/bin/env node
/**
 * _probe_pant13neutro.mjs - el censo de textos que juzgan a las fuentes (PANT-13, commit 5c).
 * Censa en el NAVEGADOR y no por grep -la leccion de PANT-3: enmascarar comentarios con una
 * expresion regular se come el 74 % del archivo-: el DOM visible sin los script, los registros
 * de texto que la app expone -VINFO, las fichas de Referencias, las secciones de Evidencia- y
 * la tabla de diferenciales de Masas, buscando las formas que la regla nueva prohibe.
 *   node scripts/_probe_pant13neutro.mjs [--file <html>] [--solo-masas]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const SOLO = process.argv.indexOf('--solo-masas') > 0;
const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 140)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1500);
const r = await pg.evaluate(`(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const PAT = ['no coinciden','no coincide','difieren','difiere','discrep','contradic',
    'sin resolver','ninguna fuente','ningun documento','no se encontr','no hay forma',
    'no publica','no publican','no lo publica','no la publica','no lo trae'];
  const buscar = (txt, de) => {
    const out = []; const t = String(txt || ''); const low = t.toLowerCase();
    PAT.forEach(p => { let i = low.indexOf(p);
      while (i >= 0) { out.push({ de: de, pat: p, ctx: t.slice(Math.max(0, i - 95), i + 115).replace(/\\s+/g, ' ') });
        i = low.indexOf(p, i + p.length) } });
    return out;
  };
  /* ── (A) LA TABLA DE DIFERENCIALES DE MASAS ── */
  const tb = document.querySelector('.masa-ref-tabla');
  R.masasTabla = tb ? buscar(tb.textContent, 'tabla de masas') : [{ de: 'NO HAY TABLA' }];
  R.masasFilas = tb ? tb.querySelectorAll('tbody tr').length : 0;
  R.masasCeldas = tb ? tb.querySelectorAll('tbody td').length : 0;
  /* la seccion entera de masas, incluida su nota y sus globos */
  const secM = tb ? tb.closest('.card, section') : null;
  R.masasSec = secM ? buscar(secM.textContent, 'seccion de masas') : [];
  /* ── (B) LOS GLOBOS: el registro VINFO entero ── */
  R.vinfo = [];
  try {
    const V = (typeof window.VINFO !== 'undefined') ? window.VINFO
            : (typeof VINFO !== 'undefined') ? VINFO : null;
    R.vinfoN = V ? Object.keys(V).length : 'NO ALCANZABLE';
    if (V) Object.keys(V).forEach(k => {
      const o = V[k]; if (!o) return;
      const partes = [];
      ['tit','lee','ojo','fuente','txt','det','form','pie','nota'].forEach(c => { if (o[c] && typeof o[c] === 'string') partes.push(o[c]) });
      if (typeof o === 'string') partes.push(o);
      if (o.dyn) partes.push('[dyn]');
      buscar(partes.join('  '), 'globo ' + k).forEach(h => R.vinfo.push(h));
    });
  } catch (e) { R.vinfoErr = String(e).slice(0, 110) }
  /* ── (C) LAS FICHAS DE REFERENCIAS ── */
  R.refs = [];
  try {
    const RF = (typeof window.REF_FICHAS !== 'undefined') ? window.REF_FICHAS : null;
    R.refsN = RF ? Object.keys(RF).length : 'NO ALCANZABLE';
    if (RF) Object.keys(RF).forEach(k => {
      buscar(JSON.stringify(RF[k]), 'ficha ' + k).forEach(h => R.refs.push(h));
    });
  } catch (e) { R.refsErr = String(e).slice(0, 110) }
  /* ── (D) LAS SECCIONES DE EVIDENCIA ── */
  R.evid = [];
  try {
    const IS = (typeof window.IND_SECS !== 'undefined') ? window.IND_SECS : null;
    R.evidN = IS ? IS.length : 'NO ALCANZABLE';
    if (IS) IS.forEach((sec, i) => {
      try { buscar(JSON.stringify(sec), 'evidencia ' + i).forEach(h => R.evid.push(h)) } catch (e) {}
    });
  } catch (e) { R.evidErr = String(e).slice(0, 110) }
  /* ── (E) EL DOM VISIBLE, sin los script ni los style ── */
  R.dom = [];
  try {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let n, acc = [];
    while ((n = w.nextNode())) {
      const pt = n.parentElement;
      if (!pt || pt.tagName === 'SCRIPT' || pt.tagName === 'STYLE') continue;
      acc.push(n.nodeValue);
    }
    buscar(acc.join('  '), 'DOM').forEach(h => R.dom.push(h));
  } catch (e) { R.domErr = String(e).slice(0, 110) }
  return R;
})()`).catch(e => ({ EXC: String(e).slice(0, 280) }));
r.errores = errs.slice(0, 4);
console.log(JSON.stringify(r, null, 1));
await pg.close(); await br.close();
