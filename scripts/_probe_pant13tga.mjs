#!/usr/bin/env node
/**
 * _probe_pant13tga.mjs - la transposicion dentro del corazon maestro (PANT-13, commit 4).
 * Mide: las cinco variantes con y sin cada casilla, el cambio de variante con lesiones ya
 * elegidas -que las saca solas-, las reglas de compatibilidad, «Segun el estudio» leyendo la
 * pestania, el boton del PDF apagado con transposicion cargada, y el modulo sin libreria.
 *   node scripts/_probe_pant13tga.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 150)));
pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 150)) });
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1500);
const r = await pg.evaluate(`(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id;
    if (e.type === 'checkbox') { e.checked = !!v } else { e.value = v }
    e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); return 'ok' };
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(400);
  const bot = EL('cc3d-abrir'); if (bot) bot.click();
  await esperar(3000);
  const st = window._cm3dEstado ? window._cm3dEstado() : null;
  if (!st) return { ERR: 'no hay estado' };
  const bExp = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') === 'explorar')[0];
  if (bExp) bExp.click(); await esperar(600);
  const fila = t => Array.prototype.filter.call(document.querySelectorAll('#cm3d-baseb .cm3d-rw, #cm3d-modb .cm3d-rw'),
    b => String((b.querySelector('.cm3d-sg1') || {}).textContent || '').indexOf(t) === 0)[0];
  /* ── (A) la fila de la TGA y sus cinco variantes ── */
  const fT = fila('TGA'); if (fT) fT.click();
  await esperar(500);
  R.A_base = st.S.base;
  R.A_chips = Array.prototype.map.call(document.querySelectorAll('#cm3d-baseb .cm3d-sub .cm3d-chip'), e => e.textContent).join(',');
  R.A_casillas = Array.prototype.map.call(document.querySelectorAll('#cm3d-baseb .cm3d-sub .cm3d-ck'), e => String(e.textContent || '').trim()).join(' | ');
  /* ── (B) cada variante dibuja algo y su texto es el de la transposicion ── */
  const chip = t => Array.prototype.filter.call(document.querySelectorAll('#cm3d-baseb .cm3d-sub .cm3d-chip'), e => e.textContent === t)[0];
  R.B = {};
  for (const v of ['d-TGA', 'Jatene', 'Mus/Sen', 'Rastelli', 'ccTGA']) {
    const c = chip(v); if (c) c.click();
    await esperar(450);
    const e2 = window.cmEscena(st.S);
    R.B[v] = { bv: st.S.bv.tga, ar: (e2.ar || []).length, fl: (e2.fl || []).length,
               ex: (e2.ex || []).length, lb: (e2.lb || []).map(x => x[0]).join(','),
               info: String(e2.info || '').slice(0, 44), circ: String(e2.circ || '').slice(0, 40) };
  }
  /* ── (C) las dos casillas ── */
  const cc = chip('d-TGA'); if (cc) cc.click(); await esperar(400);
  const cks = Array.prototype.slice.call(document.querySelectorAll('#cm3d-baseb .cm3d-sub .cm3d-ck input'));
  R.C_nCasillas = cks.length;
  const base0 = JSON.stringify(window.cmEscena(st.S).ex.length);
  if (cks[0]) { cks[0].checked = true; cks[0].dispatchEvent(new Event('change', { bubbles: true })) }
  await esperar(400);
  R.C_civResidual = { ck: JSON.stringify(st.S.ck), ex: window.cmEscena(st.S).ex.length, base: base0 };
  if (cks[1]) { cks[1].checked = true; cks[1].dispatchEvent(new Event('change', { bubbles: true })) }
  await esperar(400);
  R.C_obstr = { ck: JSON.stringify(st.S.ck), ex: window.cmEscena(st.S).ex.length };
  /* ── (D) las reglas: con d-TGA se admiten CIA, CIV, DAP y VCSI; con Mus/Sen solo VCSI ── */
  const apagadas = () => Array.prototype.filter.call(document.querySelectorAll('#cm3d-modb .cm3d-rw'), b => b.disabled)
    .map(b => (b.querySelector('.cm3d-sg1') || {}).textContent).join(',');
  R.D_dtga_apagadas = apagadas();
  const cm = chip('Mus/Sen'); if (cm) cm.click(); await esperar(450);
  R.D_mus_apagadas = apagadas();
  const cr = chip('Rastelli'); if (cr) cr.click(); await esperar(450);
  R.D_ras_apagadas = apagadas();
  const cj = chip('Jatene'); if (cj) cj.click(); await esperar(450);
  R.D_jat_apagadas = apagadas();
  /* ── (E) al cambiar de variante, la lesion elegida se saca sola ── */
  const cd = chip('d-TGA'); if (cd) cd.click(); await esperar(450);
  const fC = fila('CIA'); if (fC) fC.click(); await esperar(450);
  R.E_conCia = JSON.stringify(st.S.mods);
  const cm2 = chip('Mus/Sen'); if (cm2) cm2.click(); await esperar(500);
  R.E_trasMusSen = JSON.stringify(st.S.mods);
  /* ── (F) «Segun el estudio» lee la pestania ── */
  try { const b2 = bq('showTab(' + Q + 'congenitas2' + Q); if (b2) b2.click() } catch (e) {}
  await esperar(250);
  try { const b3 = bq('ccSubTab(' + Q + 'congenitas2' + Q); if (b3) b3.click() } catch (e) {}
  await esperar(300);
  R.F_siembra = { tipo: S('tga_tipo', 'dtga'), cir: S('tga_cirugia', 'jatene'),
                  civ: S('tga_civ_residual', 'si'), obs: S('tga_obstr_subaortica', 'si') };
  try { const b4 = bq('showTab(' + Q + 'congenitas' + Q); if (b4) b4.click() } catch (e) {}
  await esperar(400);
  const bEst = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') !== 'explorar')[0];
  if (bEst) bEst.click(); await esperar(700);
  R.F_leido = { base: st.S.base, bv: st.S.bv.tga, ck: JSON.stringify(st.S.ck), mods: JSON.stringify(st.S.mods) };
  R.F_linea = String((EL('cc3d-faltan') || {}).textContent || '').slice(0, 200);
  /* ── (G) el boton del PDF con transposicion cargada: apagado con su aviso ── */
  const bp = EL('cm3d-pdfb');
  R.G_pdf = { dis: bp ? bp.disabled : 'NO', aviso: String((EL('cm3d-pdfn') || {}).textContent || '').slice(0, 90) };
  /* ── (H) la transposicion ya NO dice «tiene su propio diagrama» ── */
  R.H_propio = String((EL('cc3d-faltan') || {}).textContent || '').indexOf('propio diagrama') >= 0;
  R.H_dibujadas = String((EL('cc3d-faltan') || {}).textContent || '').indexOf('TGA') >= 0;
  /* ── (I) el aviso sin libreria sigue en su sitio ── */
  R.I_aviso = (function () { const a = EL('cm3d-aviso'); if (!a) return 'NO EXISTE';
    return Array.prototype.filter.call(a.childNodes, n => n.nodeType === 3).map(n => n.nodeValue).join('').trim().slice(0, 70) })();
  return R;
})()`).catch(e => ({ EXC: String(e).slice(0, 300) }));
r.errores = errs.slice(0, 6);
console.log(JSON.stringify(r, null, 1));
await pg.close(); await br.close();
