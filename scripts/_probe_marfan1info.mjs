#!/usr/bin/env node
/**
 * _probe_marfan1info.mjs — un globo por rasgo (MARFAN-1, commit 5).
 *
 * Mide: cada rasgo y cada criterio aparte tiene su globo; cada globo abre, mide 44x44 con sus
 * cinco puntos, trae SU folio y queda dentro de la pantalla; los que corresponden DICEN lo que
 * el articulo no define; y —el control que importa— abrir un globo NO tilda su rasgo ni mueve
 * el puntaje, que es el defecto que el score de amiloidosis pago una vez.
 *
 *   node scripts/_probe_marfan1info.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const MEDIR = `(async () => {
  const R = { errs: [], globos: [] };
  const EL = id => document.getElementById(id);
  const T = el => el ? String(el.textContent || '').split(' ').filter(Boolean).join(' ').trim() : '';
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  critAbrir('marfan'); await new Promise(r => setTimeout(r, 250));

  /* DENOMINADOR: cuantos rasgos declaran globo y cuantos botones hay de verdad */
  R.declarados = MFS_SCORE.filter(x => x.i).length + MFS_APARTE.filter(x => x.i).length;
  R.totalRasgos = MFS_SCORE.length + MFS_APARTE.length;
  const btns = Array.prototype.slice.call(document.querySelectorAll('#crit-cuerpo [data-vinfo]'));
  R.botones = btns.length;
  R.claves = btns.map(b => b.getAttribute('data-vinfo'));

  const scoreAntes = mfsScore().pts;
  for (const b of btns) {
    const clave = b.getAttribute('data-vinfo');
    b.scrollIntoView({ block: 'center' });
    await new Promise(r => setTimeout(r, 120));
    const r0 = b.getBoundingClientRect();
    const pts = [[r0.left + 2, r0.top + 2], [r0.right - 2, r0.top + 2],
                 [r0.left + 2, r0.bottom - 2], [r0.right - 2, r0.bottom - 2],
                 [(r0.left + r0.right) / 2, (r0.top + r0.bottom) / 2]];
    const puntos = pts.map(p => { const e = document.elementFromPoint(p[0], p[1]);
      return e === b ? 'P' : (e && b.contains(e) ? 'p' : (e ? (e.tagName === 'BUTTON' ? 'X' : '-') : 'n')) }).join('');
    b.click();
    await new Promise(r => setTimeout(r, 220));
    const card = EL('vinfo-card');
    const rc = card ? card.getBoundingClientRect() : null;
    const txt = T(card);
    R.globos.push({ clave: clave,
      caja: Math.round(r0.width) + 'x' + Math.round(r0.height), puntos: puntos,
      abre: !!card && rc.width > 0, chars: txt.length,
      folio: (txt.match(/[Ff]olios? [0-9]+/g) || []).join(','),
      noDefine: /NO (da|fija|define|dice|hay|acompa)/.test(txt),
      dentro: rc ? (rc.left >= -1 && rc.top >= -1 && rc.right <= window.innerWidth + 1 ? 'si' : 'NO') : 'NO',
      /* ningun globo puede traer una cita de guia de manejo: esto es el articulo original */
      ajeno: /ESC 20|AHA|Clase I|Nivel B/.test(txt) });
    b.click(); await new Promise(r => setTimeout(r, 110));
  }
  /* EL CONTROL QUE IMPORTA: abrir los globos no tildo nada */
  R.scoreAntes = scoreAntes;
  R.scoreDespues = mfsScore().pts;
  R.tildadosDespues = mfsScore().tildados.length;
  R.aparteDespues = MFS_APARTE.map(x => mfsAparte(null, x.c)).filter(Boolean).length;
  return R;
})()`;

(async () => {
  const br = await _pw.chromium.launch({ channel: 'chrome' });
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text().slice(0, 120)) });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1400);
  let r;
  try { r = await pg.evaluate(MEDIR) } catch (e) { r = { fatal: e.message } }
  r.errsPagina = errs;
  console.log(JSON.stringify(r, null, 1));
  await br.close();
  process.exit(0);
})();
