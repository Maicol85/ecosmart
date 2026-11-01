#!/usr/bin/env node
/**
 * _probe_marfan2tarj.mjs — la tarjeta de criterios de MARFAN-2 (commit 2).
 *
 * Mide: que la tarjeta entre en 1440x900 sin scroll interno; los CUATRO globos con el glifo
 * estandar; que las DIECINUEVE definiciones sigan publicadas con su folio dentro de su globo
 * de grupo; los selectores sin texto cortado; el puntaje de la opcion elegida; y las reglas en
 * una linea con lo que falta dicho UNA vez.
 *
 * ATENCION 1: el que scrollea es crit-card, no crit-cuerpo (ver la sonda de inventario).
 * ATENCION 2: la seccion vive en C. Congenitas y su acordeon nace CERRADO.
 * ATENCION 3: un globo se abre por su boton REAL; vInfoClic a mano no prueba el cableado.
 *
 *   node scripts/_probe_marfan2tarj.mjs [--file <html>] [--motor chrome|webkit]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MOTOR = arg('--motor') || 'chrome';

const MEDIR = `(async () => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return;
    if (e.type === 'checkbox') e.checked = (v === 1 || v === true); else e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })) };
  const T = el => el ? String(el.textContent || '').split(/\\s+/).filter(Boolean).join(' ').trim() : 'NO EXISTE';
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Prueba MARFAN2'); S('ci', '591'); S('peso', '70'); S('talla', '170');
  S('sexo', 'M'); S('edad', '34');
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click(); else showTab('congenitas') } catch (e) {}
  await new Promise(r => setTimeout(r, 300));
  const acc = EL('sacc-cc-marfan');
  if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-marfan .sacc-hdr'); if (h) h.click() }
  await new Promise(r => setTimeout(r, 420));
  try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
  S('marfan_sindrome', 'marfan'); S('marfan_ao_seno', '52'); S('marfan_ao_ascendente', '44');
  S('marfan_factores_riesgo', 'si');
  await new Promise(r => setTimeout(r, 250));

  /* ── EL GLOBO DE LA SECCION, por su boton real ────────────────────────────── */
  const glifo = b => { const t = String(b.textContent || '').trim();
    return t.length ? ('U+' + t.codePointAt(0).toString(16).toUpperCase()) : 'VACIO' };
  { const b = document.querySelector('#marfan-resultado [data-vinfo="mf-conducta"]');
    R.secGlobo = b ? { glifo: glifo(b), caja: caja(b), cls: b.className } : 'NO EXISTE';
    if (b) { b.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 120));
      b.click(); await new Promise(r => setTimeout(r, 260));
      const c = EL('vinfo-card');
      /* ATENCION: la tarjeta es position fixed, asi que su offsetParent es null AUNQUE este
         dibujada -la trampa que la tanda D2 documenta-. Lo que dice si se ve es su caja. */
      const rc = c ? c.getBoundingClientRect() : null;
      R.secTarjeta = { visible: (rc && rc.width > 0 && rc.height > 0) ? 'si' : 'NO', txt: T(c), caja: caja(c) };
      b.click(); await new Promise(r => setTimeout(r, 150)); } }

  /* ── LA TARJETA ───────────────────────────────────────────────────────────── */
  const bcrit = bq('critAbrir(' + Q + 'marfan' + Q);
  if (bcrit) bcrit.click(); else { try { critAbrir('marfan') } catch (e) { R.errs.push('critAbrir ' + e.message) } }
  await new Promise(r => setTimeout(r, 650));
  const card = EL('crit-card'), cuerpo = EL('crit-cuerpo');
  R.tarjeta = { cuerpo: caja(cuerpo), card: caja(card),
    scrollInterno: card ? Math.max(0, card.scrollHeight - card.clientHeight) : -1,
    scrollH: card ? card.scrollHeight : -1, clientH: card ? card.clientHeight : -1,
    ventana: { w: window.innerWidth, h: window.innerHeight } };

  /* maqueta: figura a la DERECHA, tres bandas a la izquierda */
  R.maqueta = { izq: caja(document.querySelector('#crit-cuerpo .mfs-tarj-izq')),
                der: caja(document.querySelector('#crit-cuerpo .mfs-tarj-der')),
                bandas: Array.prototype.map.call(document.querySelectorAll('#crit-cuerpo .mfs-banda'),
                  b => ({ tit: T(b.querySelector('.mfs-banda-tit')).slice(0, 40), caja: caja(b) })) };
  R.figuraDerecha = (R.maqueta.izq && R.maqueta.der)
    ? (R.maqueta.der.x > R.maqueta.izq.x ? 'si' : 'NO') : 'NO EXISTE';
  R.figuraIntacta = EL('mfs-fig-svg') ? 'si' : 'NO';

  /* ── LOS GLOBOS DE LA TARJETA ─────────────────────────────────────────────── */
  R.globos = Array.prototype.map.call(document.querySelectorAll('#crit-cuerpo .vinfo-btn'), b => ({
    clave: b.getAttribute('data-vinfo'), glifo: glifo(b), caja: caja(b), cls: b.className }));
  R.nGlobos = R.globos.length;

  /* cada globo se abre por su boton real y se lee su contenido */
  R.cont = {};
  for (const g of R.globos) {
    const b = document.querySelector('#crit-cuerpo [data-vinfo="' + g.clave + '"]');
    if (!b) continue;
    b.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 120));
    b.click(); await new Promise(r => setTimeout(r, 300));
    const c = EL('vinfo-card');
    R.cont[g.clave] = { txt: T(c), caja: caja(c),
      defs: c ? Array.prototype.map.call(c.querySelectorAll('[data-mfs-def]'), d => d.getAttribute('data-mfs-def')) : [],
      reglas: c ? c.querySelectorAll('[data-mfs-regla]').length : 0,
      dentro: (function () { const r = c ? c.getBoundingClientRect() : null;
        return r ? (r.left >= -1 && r.top >= -1 && r.right <= window.innerWidth + 1 &&
                    r.bottom <= window.innerHeight + 1 ? 'si' : 'NO') : 'NO' })() };
    b.click(); await new Promise(r => setTimeout(r, 160));
  }
  /* las DIECINUEVE definiciones y su folio */
  const CLAVES = ['mfs-muneca','mfs-pectus','mfs-pie','mfs-neumotorax','mfs-ectasia','mfs-protrusion',
    'mfs-proporciones','mfs-escoliosis','mfs-codo','mfs-facies','mfs-estrias','mfs-miopia','mfs-prolapso',
    'mfs-ectopia','mfs-historia','mfs-fbn1c','mfs-fbn1ao','mfs-diseccion','mfs-sinotros'];
  const todas = [].concat(((R.cont['mfs-puntaje'] || {}).defs) || [], ((R.cont['mfs-aparte'] || {}).defs) || []);
  R.defs = { esperadas: CLAVES.length, publicadas: todas.length,
             faltan: CLAVES.filter(k => todas.indexOf(k) < 0),
             sobran: todas.filter(k => CLAVES.indexOf(k) < 0) };
  /* cada definicion con su folio, leida del texto del globo que le toca */
  R.defsConFolio = CLAVES.filter(function (k) {
    const g = (CLAVES.indexOf(k) < 13) ? 'mfs-puntaje' : 'mfs-aparte';
    const t = (R.cont[g] || {}).txt || '';
    const e = (typeof VINFO !== 'undefined' && VINFO[k]) ? String(VINFO[k].lee || '') : '';
    const m = e.match(/[Ff]olios? [0-9, y]+\\./);
    return !!(m && t.indexOf(m[0]) >= 0);
  }).length;

  /* ── SELECTORES Y PUNTOS ──────────────────────────────────────────────────── */
  R.selCortados = [];
  Array.prototype.forEach.call(document.querySelectorAll('#crit-cuerpo select.mfs-sel'), function (s) {
    const op = s.options[s.selectedIndex] || s.options[0];
    const txt = op ? String(op.textContent) : '';
    const med = document.createElement('span');
    med.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    med.style.font = window.getComputedStyle(s).font; med.textContent = txt;
    document.body.appendChild(med);
    const need = med.getBoundingClientRect().width; med.remove();
    const cs = window.getComputedStyle(s);
    const util = s.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 18;
    R.selCortados.push({ id: s.id, txt: txt, util: Math.round(util), need: Math.round(need),
                         cortado: (need > util + 1) ? 'SI' : 'no' });
  });
  R.pts = {};
  for (const caso of [['mfs_pie','plano','1'], ['mfs_pie','retropie','2'], ['mfs_pie','','2'],
                      ['mfs_pectus','excavatum','1'], ['mfs_pectus','carinatum','2'],
                      ['mfs_muneca_pulgar','uno','1'], ['mfs_muneca_pulgar','ambos','3']]) {
    S(caso[0], caso[1]);
    try { mfsCalc() } catch (e) {}
    await new Promise(r => setTimeout(r, 60));
    const b = document.querySelector('#crit-cuerpo [data-mf-pts="' + caso[0] + '"]');
    R.pts[caso[0] + '=' + (caso[1] || 'vacio')] = { mostrado: b ? String(b.textContent).trim() : 'NO', espera: caso[2] };
    S(caso[0], '');
  }
  /* el badge sigue al total */
  S('mfs_pie', 'plano'); S('mfs_pectus', 'carinatum'); S('mfs_muneca_pulgar', 'ambos');
  try { mfsCalc() } catch (e) {}
  await new Promise(r => setTimeout(r, 80));
  R.badge = T(document.querySelector('#crit-cuerpo [data-mf-badge]'));
  R.msg = T(document.querySelector('#crit-cuerpo [data-mf-msg]'));

  /* ── LAS REGLAS ───────────────────────────────────────────────────────────── */
  R.reglas = Array.prototype.map.call(document.querySelectorAll('#crit-cuerpo .mfs-reg'), function (d) {
    const r = d.getBoundingClientRect();
    return { txt: T(d.querySelector('.mfs-reg-txt')), est: T(d.querySelector('.mfs-reg-est')),
             h: Math.round(r.height), por: d.querySelector('.mfs-reg-por') ? 'SI' : 'no' };
  });
  R.falta = { n: document.querySelectorAll('#crit-cuerpo .mfs-falta').length,
              txt: T(document.querySelector('#crit-cuerpo .mfs-falta')) };
  R.notaFija = { n: document.querySelectorAll('#crit-cuerpo .mfs-nota-fija').length,
                 txt: T(document.querySelector('#crit-cuerpo .mfs-nota-fija')) };
  R.grupos = Array.prototype.map.call(document.querySelectorAll('#crit-cuerpo .mfs-reg-grupo'), T);
  /* el texto repetido de HEAD: cuantas reglas repiten el mismo motivo */
  R.repiteZ = (T(cuerpo).match(/falta el valor del Z/g) || []).length;
  R.repiteOtros = (T(cuerpo).match(/contestar si hay rasgos de otros/g) || []).length;
  /* la guia, la tabla y el folio NO viven en el cuerpo de la tarjeta */
  const tc = T(cuerpo);
  R.citaEnTarjeta = { folio: (tc.match(/folio/gi) || []).length, box: (tc.match(/Box \\d/g) || []).length,
                      jmedgenet: tc.indexOf('J Med Genet') >= 0 ? 'SI' : 'no' };
  R.pie = T(document.querySelector('#crit-cuerpo > div:last-child'));
  try { critCerrar() } catch (e) {}
  R.recorte = [];
  return R;
})()`;

const b = MOTOR === 'webkit' ? await _pw.webkit.launch() : await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
const pg = await ctx.newPage();
const errs = [];
pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)) });
pg.on('pageerror', e => errs.push('PAGE: ' + e.message.slice(0, 150)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(1300);
let r;
try { r = await Promise.race([pg.evaluate(MEDIR),
  new Promise((_, rj) => setTimeout(() => rj(new Error('reloj')), 120000))]); }
catch (e) { r = { errs: ['EVAL: ' + e.message] }; }
r.consola = errs;
console.log(JSON.stringify({ motor: MOTOR, file: FILE, r }, null, 1));
await b.close();
