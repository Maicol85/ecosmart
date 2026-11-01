#!/usr/bin/env node
/**
 * _probe_marfan1score.mjs — el score sistemico del Box 2 (MARFAN-1, commit 1).
 *
 * Mide: los diecinueve campos nuevos existen y SON del estudio; el maximo es 20; cada rasgo
 * suma lo suyo; los tres grupos con alternativa son EXCLUYENTES; la ectopia lentis quedo FUERA
 * del puntaje; el prestamo sobrevive a abrir y cerrar la tarjeta dos veces y a abrir OTRO
 * panel; un valor sin equivalente no se cuenta y se avisa; y el censo sube SOLO en los nuevos.
 *
 *   node scripts/_probe_marfan1score.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const MEDIR = `(async () => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const C = (id, on) => { const e = EL(id); if (!e) return 'NO ' + id; e.checked = !!on;
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.checked };
  const T = el => el ? String(el.textContent || '').split(' ').filter(Boolean).join(' ').trim() : 'NO';
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}

  /* (A) DENOMINADOR: los campos existen ANTES de abrir la tarjeta. Sin esto, «se guardan»
     no se distingue de «la tarjeta los creo recien ahora». */
  const IDS = (typeof MFS_SCORE !== 'undefined' ? MFS_SCORE.map(r => r.c) : [])
    .concat(typeof MFS_APARTE !== 'undefined' ? MFS_APARTE.map(r => r.c) : []);
  R.nIds = IDS.length;
  R.existenSinAbrir = IDS.filter(i => !EL(i));
  R.sonDelEstudio = IDS.filter(i => typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(i));
  R.camposN = (function(){ const ids = [];
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return; ids.push(e.id) });
    return ids.length })();

  /* (B) EL MAXIMO ES 20 y la tabla tiene trece rasgos */
  R.max = typeof MFS_SCORE_MAX !== 'undefined' ? MFS_SCORE_MAX : 'NO';
  R.corte = typeof MFS_SCORE_CORTE !== 'undefined' ? MFS_SCORE_CORTE : 'NO';
  R.nRasgos = typeof MFS_SCORE !== 'undefined' ? MFS_SCORE.length : 'NO';
  /* todo tildado al maximo */
  MFS_SCORE.forEach(r => { if (r.t === 'sel') S(r.c, r.ops[0][0]); else C(r.c, true) });
  R.scoreTodo = mfsScore().pts;
  R.tildadosTodo = mfsScore().tildados.length;
  /* la alternativa MENOR de cada grupo */
  MFS_SCORE.forEach(r => { if (r.t === 'sel') S(r.c, r.ops[1][0]) });
  R.scoreMenores = mfsScore().pts;

  /* (C) EXCLUYENTES: un campo no puede sumar las dos alternativas */
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('mfs_muneca_pulgar', 'ambos'); R.munecaAmbos = mfsScore().pts;
  S('mfs_muneca_pulgar', 'uno');   R.munecaUno = mfsScore().pts;
  S('mfs_muneca_pulgar', '');      R.munecaVacio = mfsScore().pts;

  /* (D) LA ECTOPIA LENTIS NO SUMA — el defecto que esta tanda cierra */
  S('mfs_ectopia_lentis', 'si'); R.scoreConEctopia = mfsScore().pts;
  R.ectopiaEnScore = (typeof MFS_SCORE !== 'undefined') &&
    MFS_SCORE.some(r => /lentis|cristalino/i.test(r.rot));
  R.ectopiaLeida = mfsAparte(null, 'mfs_ectopia_lentis');

  /* (E) VALOR SIN EQUIVALENTE: no se cuenta y se avisa */
  const ep = EL('mfs_pectus');
  if (ep) { const o = document.createElement('option'); o.value = 'requiere_cirugia'; o.textContent = 'x';
    ep.appendChild(o); ep.value = 'requiere_cirugia'; ep.dispatchEvent(new Event('change', { bubbles: true })) }
  R.sinEq = mfsScore().sinEquivalente.map(x => x.c + '=' + x.val);
  R.scoreConSinEq = mfsScore().pts;
  if (ep) { ep.removeChild(ep.lastElementChild); ep.value = '' ; ep.dispatchEvent(new Event('change', { bubbles: true })) }

  /* (F) EL PRESTAMO: abrir, cerrar, abrir, abrir OTRO panel — los datos sobreviven */
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('mfs_muneca_pulgar', 'ambos'); C('mfs_neumotorax', true); S('mfs_ectopia_lentis', 'si');
  const leer = () => ({ mp: (EL('mfs_muneca_pulgar') || {}).value,
    nx: !!(EL('mfs_neumotorax') || {}).checked, el: (EL('mfs_ectopia_lentis') || {}).value,
    n: document.querySelectorAll('#mfs_muneca_pulgar').length, pts: mfsScore().pts });
  R.prestamo = { antes: leer() };
  critAbrir('marfan'); await new Promise(r => setTimeout(r, 180));
  R.prestamo.abierta1 = leer();
  R.prestamo.enTarjeta1 = !!document.querySelector('#crit-cuerpo #mfs_muneca_pulgar');
  R.prestamo.badge1 = T(document.querySelector('#crit-cuerpo [data-mf-badge]'));
  R.prestamo.msg1 = T(document.querySelector('#crit-cuerpo [data-mf-msg]'));
  critCerrar(); await new Promise(r => setTimeout(r, 120));
  R.prestamo.cerrada = leer();
  R.prestamo.devueltoASeccion = !!document.querySelector('#sacc-cc-marfan #mfs_muneca_pulgar');
  critAbrir('marfan'); await new Promise(r => setTimeout(r, 180));
  R.prestamo.abierta2 = leer();
  R.prestamo.badge2 = T(document.querySelector('#crit-cuerpo [data-mf-badge]'));
  /* abrir OTRO panel: es donde el innerHTML se llevaria los campos */
  critAbrir('eisen'); await new Promise(r => setTimeout(r, 180));
  R.prestamo.trasOtroPanel = leer();
  critCerrar(); await new Promise(r => setTimeout(r, 120));
  R.prestamo.final = leer();

  /* (G) ROUND-TRIP: guardar y volver a leer los campos desde el blob */
  R.roundtrip = (function(){ try {
    const blob = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      if (e.type === 'checkbox') blob[e.id + '__chk'] = e.checked ? '1' : '0'; else blob[e.id] = e.value });
    const mios = IDS.filter(i => (i in blob) || ((i + '__chk') in blob));
    return { enBlob: mios.length, de: IDS.length,
             scoreDesdeBlob: mfsScore(blob).pts, scoreVivo: mfsScore().pts,
             ectopiaDesdeBlob: mfsAparte(blob, 'mfs_ectopia_lentis') };
  } catch (e) { return { err: e.message } } })();

  /* (H) CONTROL NEGATIVO: un estudio sin un solo rasgo da 0 y nada se tilda */
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  R.vacio = { pts: mfsScore().pts, tildados: mfsScore().tildados.length,
              sinEq: mfsScore().sinEquivalente.length, ectopia: mfsAparte(null, 'mfs_ectopia_lentis') };
  return R;
})()`;

(async () => {
  const br = await _pw.chromium.launch({ channel: 'chrome' });
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text().slice(0, 140)) });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1400);
  let r;
  try { r = await pg.evaluate(MEDIR) } catch (e) { r = { fatal: e.message } }
  r.errsPagina = errs;
  console.log(JSON.stringify(r, null, 1));
  await br.close();
  process.exit(0);
})();
