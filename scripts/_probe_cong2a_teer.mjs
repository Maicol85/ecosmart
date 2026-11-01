#!/usr/bin/env node
/**
 * _probe_cong2a_teer.mjs — los criterios TEER (CONG-2A, commit 4: inventario 4a y 4b).
 * Mide cada dibujo con su caja, los campos que ilustra, el alto de la seccion, si todos los
 * campos de los criterios entran en una pantalla de 1440x900 y si los numeros de los dibujos
 * siguen a sus campos y quedan legibles.
 *   node scripts/_probe_cong2a_teer.mjs [--file <html>] [--motor chrome|webkit]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
import fs from 'fs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MOTOR = arg('--motor') || 'chrome';
const OUT = { archivo: FILE };
for (const m of (MOTOR === 'dos' ? ['chrome', 'webkit'] : [MOTOR])) {
  const br = m === 'webkit' ? await _pw.webkit.launch() : await _pw.chromium.launch({ channel: 'chrome' });
  for (const w of [1440, 1000, 768, 390]) for (const t of ['dark', 'light']) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 }, colorScheme: t });
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 90)));
    pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 90)) });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
    await pg.waitForTimeout(1300);
    if (t === 'light') await pg.evaluate("document.documentElement.classList.add('light-mode')");
    const r = await pg.evaluate(`(async () => {
      const R = {};
      const EL = id => document.getElementById(id);
      const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
        e.dispatchEvent(new Event('input', { bubbles: true }));
        e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
      const caja = el => { if (!el) return null; const q = el.getBoundingClientRect();
        return { w: Math.round(q.width), h: Math.round(q.height), x: Math.round(q.left), y: Math.round(q.top) } };
      ['modalAvisoEco','login-overlay'].forEach(i => { const z = EL(i); if (z) z.style.display = 'none' });
      try { limpiarCampos(true) } catch (e) {}
      const bq = x => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
        b => String(b.getAttribute('onclick')).indexOf(x) >= 0)[0];
      const Q = String.fromCharCode(39);
      try { const b = bq('showTab(' + Q + 'ete' + Q); if (b) b.click(); else showTab('ete') } catch (e) {}
      await new Promise(z => setTimeout(z, 350));
      /* la seccion de criterios TEER vive en un acordeon de la pestania ETE: se abre por su
         encabezado real, y se registra DESPUES. */
      /* ATENCION, DENOMINADOR: la seccion de criterios TEER es el div ete-seccion-teer, que nace
         en display:none y lo abre toggleEteSeccion desde el h2 de su tarjeta. La primera version
         de esta sonda buscaba un .sacc y daba null: altoCampos salia null y el censo de las tres
         etiquetas del medico daba 0 de 0, o sea «no estan» sobre una seccion que no se abrio. */
      const sec = EL('ete-seccion-teer');
      const h = Array.prototype.filter.call(document.querySelectorAll('h2[onclick]'),
        e => String(e.getAttribute('onclick')).indexOf('toggleEteSeccion') >= 0
          && String(e.textContent || '').indexOf('Criterios TEER') >= 0)[0];
      if (h && sec && getComputedStyle(sec).display === 'none') h.click();
      await new Promise(z => setTimeout(z, 520));
      try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
      R.secAbierta = sec ? (getComputedStyle(sec).display !== 'none' ? 'si' : 'NO') : 'NO EXISTE';
      R.secCaja = caja(sec);
      /* ── los cuatro dibujos, con su caja y el campo que ilustran ─────────────────────── */
      const PARES = [['teer-fig-gap','teer_flail_gap','teer-fig-gap-val','34'],
                     ['teer-fig-anch','teer_ancho_flail','teer-fig-anch-val','23'],
                     ['teer-fig-prof','teer_prof_flail','teer-fig-prof-val','35'],
                     ['teer-fig-len','teer_gap','teer-fig-len-val','34']];
      R.figs = PARES.map(p => { const f = EL(p[0]); const c = caja(f);
        return { id: p[0], campo: p[1], caja: c, existe: !!f } });
      /* ── todos los campos de los criterios: cuantos y donde ─────────────────────────── */
      const campos = sec ? Array.prototype.map.call(sec.querySelectorAll('input[id^="teer_"], select[id^="teer_"]'),
        e => ({ id: e.id, caja: caja(e.closest('.fg') || e) })) : [];
      R.nCampos = campos.length;
      const ys = campos.filter(c => c.caja && c.caja.h > 0);
      R.campoPrimero = ys.length ? ys[0].caja.y : null;
      R.campoUltimo = ys.length ? Math.max.apply(null, ys.map(c => c.caja.y + c.caja.h)) : null;
      R.altoCampos = (R.campoPrimero != null) ? (R.campoUltimo - R.campoPrimero) : null;
      /* «entran en una pantalla de 1440x900»: el alto que ocupan los campos de los criterios,
         contra el alto util de la ventana. */
      R.altoVentana = window.innerHeight;
      R.entranEnUnaPantalla = (R.altoCampos != null) ? (R.altoCampos <= window.innerHeight) : null;
      /* ── los numeros de los dibujos siguen a sus campos y son legibles ───────────────── */
      PARES.forEach(p => S(p[1], p[3]));
      try { if (typeof calcTEER === 'function') calcTEER() } catch (e) {}
      await new Promise(z => setTimeout(z, 420));
      R.numeros = PARES.map(p => { const v = EL(p[2]);
        let px = 0; if (v) { try { px = parseFloat(getComputedStyle(v).fontSize) || 0 } catch (e) {} }
        const cj = caja(v);
        return { id: p[2], txt: v ? String(v.textContent || '').trim() : 'NO', esperado: p[3],
                 fontPx: Math.round(px * 10) / 10, caja: cj } });
      /* ── P1 ──────────────────────────────────────────────────────────────────────────── */
      R.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const rec = [];
      if (sec) Array.prototype.forEach.call(sec.querySelectorAll('label, span, button'), e => {
        if (e.offsetParent === null) return;
        if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) rec.push((e.id || e.tagName) + ':' + e.scrollWidth + '>' + e.clientWidth) });
      R.nRecort = rec.length; R.recortados = rec.slice(0, 6);
      /* scroll interno dentro de la caja de los criterios */
      R.scrollInterno = sec ? Math.max(0, sec.scrollHeight - sec.clientHeight) : null;
      /* los veredictos y etiquetas NO se tocan: se censan para el control negativo */
      const txtSec = sec ? String(sec.textContent || '') : '';
      R.etiquetas = { noApto: (txtSec.split('NO apto').length - 1),
                      heartTeam: (txtSec.split('Heart Team').length - 1),
                      compleja: (txtSec.split('anatomía compleja').length - 1) };
      return R;
    })()`, { timeout: 90000 });
    r.errs = errs;
    OUT[m + '_' + w + '_' + t] = r;
    console.log(m, w, t, '| figs=' + r.figs.map(f => f.caja ? f.caja.w + 'x' + f.caja.h : 'NO').join(' '),
      '| altoCampos=' + r.altoCampos, '| 1pantalla=' + r.entranEnUnaPantalla,
      '| sec=' + r.secAbierta + ' nCampos=' + r.nCampos,
      '| nums=' + r.numeros.map(n => n.txt + '@' + n.fontPx).join(' '),
      '| scrollX=' + r.scrollX, '| recort=' + r.nRecort, '| etq=' + JSON.stringify(r.etiquetas), '| errs=' + errs.length);
    await pg.close();
  }
  await br.close();
}
const OUTF = arg('--out') || '/tmp/cong2a_teer.json';
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
