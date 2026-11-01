#!/usr/bin/env node
/**
 * _probe_cong2a_pant.mjs — la pantalla de la TGA y el recuadro del 3D (CONG-2A, 2a / 2c / 3a / 3b).
 *
 * Inventario y verificacion en los cuatro anchos y los dos temas, en los dos motores.
 * ATENCION 1: la seccion vive en la sub-pestana «CC complejas» (#tab-congenitas2) y hay que
 * abrir las DOS pestanas por su boton real, si no todo da 0x0.
 * ATENCION 2: el acordeon de la TGA nace CERRADO -por eso sus controles llevan data-ui-, asi
 * que se abre y se registra DESPUES de abrirlo.
 * ATENCION 3: un `elementFromPoint` fuera del viewport devuelve null, no «tapado»: los
 * controles se traen a la vista antes de medir el area tactil.
 *
 *   node scripts/_probe_cong2a_pant.mjs [--file <html>] [--motor chrome|webkit|dos] [--tipo <v>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
import fs from 'fs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MOTOR = arg('--motor') || 'chrome';
const TIPO = arg('--tipo') === null ? '' : arg('--tipo');
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];

const MEDIR = `(async (TIPO) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  const cajaId = id => caja(EL(id));
  const T = id => { const e = EL(id); return e ? String(e.textContent || '').split(' ').filter(Boolean).join(' ').trim() : 'NO' };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Prueba CONG2A'); S('ci', '572'); S('peso', '70'); S('talla', '170'); S('sexo', 'M');

  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click(); else showTab('congenitas');
        const b2 = bq('ccSubTab(' + Q + 'congenitas2'); if (b2) b2.click(); else ccSubTab('congenitas2') } catch (e) {}
  await new Promise(r => setTimeout(r, 320));
  const acc = EL('sacc-cc-tga');
  if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-tga .sacc-hdr'); if (h) h.click() }
  await new Promise(r => setTimeout(r, 450));
  R.accAbierto = acc ? (acc.classList.contains('open') ? 'si' : 'NO') : 'NO EXISTE';
  /* Las animaciones de apertura del acordeon dan un rect de MITAD de la transicion: sin esto,
     un hijo informa una caja superpuesta con su propio encabezado. Es la trampa del AJ9. */
  try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
  await new Promise(r => setTimeout(r, 120));

  if (TIPO) { S('tga_tipo', TIPO); await new Promise(r => setTimeout(r, 1800)) }
  R.tipo = TIPO || '(vacio)';
  R.three = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');

  /* ── INVENTARIO: cada campo de la seccion con su id, su caja y su posicion ───────────── */
  const sec = EL('sacc-cc-tga');
  const campos = [];
  /* ATENCION: solo los campos de tga-campos. La primera version barria la seccion ENTERA y
     agrupaba por coordenada y, asi que los tres controles del dibujo -que viven en la columna
     DERECHA, a la misma altura- aparecian como filas 3 y 4 de la grilla. Artefacto de la sonda. */
  const zona = EL('tga-campos') || sec;
  if (zona) Array.prototype.forEach.call(zona.querySelectorAll('select[id], input[id], textarea[id]'), e => {
    if (String(e.type) === 'checkbox' && e.style.display === 'none') return;
    const fg = e.closest('.fg') || e.parentElement;
    const lb = fg ? fg.querySelector('label') : null;
    const c = caja(fg);
    campos.push({ id: e.id, lbl: lb ? String(lb.textContent || '').trim().slice(0, 34) : '',
                  vis: !!(fg && fg.offsetParent !== null), x: c ? c.x : -1, y: c ? c.y : -1,
                  w: c ? c.w : -1 });
  });
  /* La FILA es la coordenada y agrupada, y la COLUMNA el orden de x dentro de la fila. */
  const vis = campos.filter(c => c.vis && c.y >= 0).sort((a, b) => a.y - b.y || a.x - b.x);
  const filas = []; vis.forEach(c => { const f = filas.find(f => Math.abs(f.y - c.y) < 14);
    if (f) f.ids.push(c.id); else filas.push({ y: c.y, ids: [c.id] }) });
  R.campos = campos.map(c => c.id + (c.vis ? '' : '(oculto)'));
  R.filas = filas.map((f, i) => (i + 1) + ': ' + f.ids.join(' | '));
  R.nVis = vis.length;

  /* ── EL DIBUJO Y SU RECUADRO ─────────────────────────────────────────────────────────── */
  R.box = cajaId('tga-3d-box');
  R.host = cajaId('tga-3d-cv');
  const cvs = document.querySelector('#tga-3d-cv canvas');
  R.canvas = caja(cvs);
  R.concl = cajaId('tga-concl');
  R.integrar = (function () { const b = document.querySelector('[data-ete-chk="tga_incluir_chk"]'); return caja(b) })();
  /* DESBORDA? el canvas (o el host) por debajo del borde inferior de su tarjeta. */
  const bb = R.box, hh = R.host, cc = R.canvas;
  R.desborda = (bb && hh) ? Math.max(0, Math.round((hh.y + hh.h) - (bb.y + bb.h))) : 'NO';
  R.desbordaCanvas = (bb && cc) ? Math.max(0, Math.round((cc.y + cc.h) - (bb.y + bb.h))) : 'NO';
  /* PISA «Conclusion»? solape vertical entre la caja del dibujo y la fila de la conclusion. */
  R.pisaConcl = (hh && R.concl) ? ((hh.y + hh.h) > R.concl.y ? Math.round((hh.y + hh.h) - R.concl.y) : 0) : 'NO';
  /* LADO A LADO? el dibujo a la derecha de los campos y a su misma altura. */
  const bcampos = cajaId('tga-campos');
  R.campBox = bcampos;
  R.ladoALado = (bcampos && bb) ? ((bb.x >= bcampos.x + bcampos.w - 4) ? 'si' : 'apilado') : 'sin-fila';
  R.secAlto = (function () { const c = caja(sec); return c ? c.h : -1 })();

  /* ── P1: sin barra horizontal, sin texto recortado, botones de 44 px ─────────────────── */
  R.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const recort = [];
  if (sec) Array.prototype.forEach.call(sec.querySelectorAll('label, .calc-lbl, button, option'), e => {
    if (e.offsetParent === null) return;
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) recort.push((e.id || e.tagName) + ':' + e.scrollWidth + '>' + e.clientWidth);
  });
  R.recortados = recort.slice(0, 8); R.nRecort = recort.length;
  const bot = [];
  if (sec) Array.prototype.forEach.call(sec.querySelectorAll('button, input[type=checkbox], input[type=number]'), e => {
    if (e.offsetParent === null) return;
    /* ATENCION: el area tactil de una casilla es su LABEL, no el input de 13x13: los dos
       checkbox del dibujo viven dentro de un label.chk-toque con min-height 44px. Medir el input
       daba dos falsos positivos. Es la trampa que CLAUDE.md ya documenta para .pac-id-mk. */
    const dest = (e.type === 'checkbox' && e.closest('label')) ? e.closest('label') : e;
    const c = caja(dest); if (!c || !c.w) return;
    bot.push({ id: e.id || e.textContent.trim().slice(0, 14), w: c.w, h: c.h, ok44: c.h >= 43.5 });
  });
  R.botones = bot.length; R.bot44 = bot.filter(b => b.ok44).length;
  R.botChicos = bot.filter(b => !b.ok44).map(b => b.id + ' ' + b.w + 'x' + b.h).slice(0, 8);
  /* El parrafo de encabezado y el globo. */
  R.parrafo = (function () { const p = sec ? sec.querySelector('p') : null;
    return p ? String(p.textContent || '').split(' ').filter(Boolean).join(' ').trim().length : -1 })();
  R.parrafoTxt = (function () { const p = sec ? sec.querySelector('p') : null;
    return p ? String(p.textContent || '').split(' ').filter(Boolean).join(' ').trim().slice(0, 120) : '' })();
  R.globos = sec ? sec.querySelectorAll('.vinfo-btn, [onclick*="vInfoClic"]').length : -1;
  return R;
})(${JSON.stringify(TIPO)})`;

const OUT = { archivo: FILE, tipo: TIPO };
for (const m of (MOTOR === 'dos' ? ['chrome', 'webkit'] : [MOTOR])) {
  const br = m === 'webkit' ? await _pw.webkit.launch() : await _pw.chromium.launch({ channel: 'chrome' });
  for (const w of ANCHOS) for (const t of TEMAS) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 }, colorScheme: t });
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE: ' + e.message.slice(0, 110)));
    pg.on('console', c => { if (c.type() === 'error') errs.push('CONS: ' + c.text().slice(0, 110)) });
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
      await pg.waitForTimeout(1400);
      if (t === 'light') await pg.evaluate(`document.documentElement.classList.add('light-mode')`);
      const r = await pg.evaluate(MEDIR, { timeout: 90000 });
      r.errsPagina = errs;
      OUT[m + '_' + w + '_' + t] = r;
      console.log(m, w, t, '| lado=' + r.ladoALado, '| desborda=' + r.desborda, '| pisaConcl=' + r.pisaConcl,
        '| scrollX=' + r.scrollX, '| recort=' + r.nRecort, '| bot44=' + r.bot44 + '/' + r.botones,
        '| errs=' + errs.length);
    } catch (e) { OUT[m + '_' + w + '_' + t] = { err: String(e).slice(0, 180) }; console.log(m, w, t, 'ERR', String(e).slice(0, 120)) }
    await pg.close();
  }
  await br.close();
}
const OUTF = arg('--out') || '/tmp/cong2a_pant.json';
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
