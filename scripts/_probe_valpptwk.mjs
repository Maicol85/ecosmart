#!/usr/bin/env node
/**
 * _probe_valpptwk.mjs - CHROME y WEBKIT sobre las zonas de la tanda VAL-PPT (2026-11-02).
 *
 * Dos motores x cuatro anchos x dos temas = 16 cruces por motor. Mide lo que la tanda toca:
 * las opciones nuevas, los tres globos de Valvulas, el selector del posoperatorio, el rotulo de
 * la miocardiopatia, y los invariantes de siempre -scroll horizontal, texto recortado y errores
 * de consola y de pagina-.
 *
 * ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 *    channel chrome: sin eso la sonda devuelve los cruces vacios.
 * ⚠️ Los globos viven dentro del ACORDEON de cada valvula: abrir la pestaña no les da caja.
 *
 *   node scripts/_probe_valpptwk.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || process.cwd() + '/index.html';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];

const MEDIR = `(() => {
  const R = {};
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const bt = bq('showTab(' + Q + 'valvulas'); if (bt) bt.click();
  ['valv-mitral','valv-aortica','valv-tricuspide'].forEach(k => {
    const sec = EL('ete-seccion-' + k);
    if (sec && sec.style.display === 'none') { const h = bq('toggleEteSeccion(' + Q + k); if (h) h.click() }
  });
  const ops = id => { const e = EL(id); return e ? e.options.length : 0 };
  R.opsMitral = ops('vm_morf');          /* 9 en HEAD, 11 hoy */
  R.opsTricus = ops('vt_morf');          /* 8 en HEAD, 10 hoy */
  R.opsAortic = ops('va_morf');          /* 9, no cambia */
  R.opsPulmon = ops('vp_morf');          /* 7, no cambia */
  /* Los tres globos: caja, puntos propios y glifo. */
  R.globos = {};
  ['vm-morf-tipos','vt-morf-tipos','va-morf-tipos'].forEach(k => {
    const b = document.querySelector('[data-vinfo="' + k + '"]');
    if (!b) { R.globos[k] = 'NO EXISTE'; return }
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    const pts = [[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],
                 [r.right-2,r.bottom-2],[r.left+r.width/2,r.top+r.height/2]];
    const prop = pts.filter(p => { const el = document.elementFromPoint(p[0], p[1]);
      return !!(el && (el === b || b.contains(el))) }).length;
    R.globos[k] = Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + prop + '/5 '
                + (b.textContent || '').trim();
  });
  /* El rotulo de la miocardiopatia. */
  const bt2 = bq('showTab(' + Q + 'congenitas'); if (bt2) bt2.click();
  const n = EL('mch-aha');
  R.rotuloMCH = (n && n.parentNode) ? (n.parentNode.textContent || '').trim().slice(0, 40) : 'NO EXISTE';
  /* El selector del posoperatorio. */
  const bt3 = bq('showTab(' + Q + 'hemodinamica'); if (bt3) bt3.click();
  const sec2 = EL('pop-seccion');
  if (sec2 && !(sec2.offsetParent && sec2.getBoundingClientRect().height > 100)) {
    const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click() }
  const cx = EL('pop_cx_valv');
  if (cx && !cx.checked) { cx.checked = true; cx.dispatchEvent(new Event('change', { bubbles: true })) }
  try { if (typeof popCxVSync === 'function') popCxVSync() } catch (e) {}
  R.popMi = ops('pop-esp-vmi');          /* 3 en HEAD, 5 hoy */
  R.popAo = ops('pop-esp-vao');          /* 3 en HEAD, 4 hoy */
  R.popPu = ops('pop-esp-vpu');          /* 3, no cambia */
  /* Invariantes de siempre. */
  R.scrollH = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  let rec = 0;
  document.querySelectorAll('label, .calc-lbl, button, option').forEach(e => {
    if (!e.offsetParent) return;
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) rec++;
  });
  R.recortados = rec;
  return R;
})`;

(async () => {
  const OUT = {};
  for (const motor of ['chromium', 'webkit']) {
    const b = (motor === 'chromium')
      ? await _pw.chromium.launch({ channel: 'chrome', headless: true })
      : await _pw.webkit.launch({ headless: true });
    for (const w of ANCHOS) for (const tema of TEMAS) {
      const k = motor + '|' + w + '|' + tema;
      const pg = await b.newPage({ viewport: { width: w, height: 900 },
                                   colorScheme: tema === 'dark' ? 'dark' : 'light' });
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 90)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('CON ' + m.text().slice(0, 90)) });
      try {
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
        await pg.waitForTimeout(2200);
        OUT[k] = await pg.evaluate(new Function('return ' + MEDIR)());
        OUT[k].errs = errs.length;
        OUT[k].errsTxt = errs.slice(0, 2).join(' | ');
      } catch (e) { OUT[k] = { _err: String(e).slice(0, 110) } }
      await pg.close();
    }
    await b.close();
  }
  console.log('===== CHROME Y WEBKIT — TANDA VAL-PPT =====');
  console.log('archivo:', FILE);
  console.log('⚠️ WebKit de Playwright NO es Safari. Chrome va por el del sistema.');
  console.log('');
  const ks = Object.keys(OUT);
  for (const k of ks) {
    const r = OUT[k];
    if (r._err) { console.log(k.padEnd(24) + ' ERROR ' + r._err); continue }
    console.log(k.padEnd(24) + ' ops m/t/a/p=' + r.opsMitral + '/' + r.opsTricus + '/'
      + r.opsAortic + '/' + r.opsPulmon
      + '  pop mi/ao/pu=' + r.popMi + '/' + r.popAo + '/' + r.popPu
      + '  MCH=' + (r.rotuloMCH || '').slice(0, 14)
      + '  scrollH=' + r.scrollH + '  recortados=' + r.recortados + '  errs=' + r.errs);
    console.log('    globos: ' + JSON.stringify(r.globos));
    if (r.errs) console.log('    -> ' + r.errsTxt);
  }
  /* Diferencias ENTRE MOTORES, cruce por cruce. */
  let dif = 0;
  for (const w of ANCHOS) for (const t of TEMAS) {
    const a = OUT['chromium|' + w + '|' + t], b2 = OUT['webkit|' + w + '|' + t];
    if (!a || !b2) continue;
    for (const c of ['opsMitral','opsTricus','opsAortic','opsPulmon','popMi','popAo','popPu',
                     'rotuloMCH','scrollH']) {
      if (String(a[c]) !== String(b2[c])) { dif++;
        console.log('DIFERENCIA ENTRE MOTORES ' + w + '/' + t + ' ' + c + ': ' + a[c] + ' vs ' + b2[c]) }
    }
  }
  console.log('\\nDIFERENCIAS ENTRE MOTORES: ' + dif);
  const tErr = ks.reduce((a, k) => a + ((OUT[k] && OUT[k].errs) || 0), 0);
  const tSc = ks.reduce((a, k) => a + ((OUT[k] && OUT[k].scrollH) || 0), 0);
  console.log('TOTAL errores de consola/pagina: ' + tErr + '  ·  scroll horizontal: ' + tSc);
})();
