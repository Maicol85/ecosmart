#!/usr/bin/env node
/**
 * _probe_pant13pdf.mjs - el boton «Incluir en el PDF» del corazon maestro (PANT-13, c3).
 * Mide, con el PDF generado DE VERDAD y contando los caracteres emitidos -un denominador vacio
 * no es un cero-: el boton apagado en «Explorar», apagado sin lesiones, encendido con lesiones;
 * que el PDF lleva la version «Segun el estudio» aunque el medico este explorando otra cosa; y
 * que con la casilla apagada el papel es IDENTICO.
 *   node scripts/_probe_pant13pdf.mjs [--file <html>]
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
  /* ESPIA DE jsPDF: envuelve el CONSTRUCTOR, como el arnes de A/B, y no el prototipo -por el
     prototipo el espia media 0 textos y 0 imagenes, que es un denominador vacio y no un cero-.
     Y llama a _pdfAjustarA4, que es la puerta real, reemplazando save y output para que no
     descargue nada. */
  const pdf = async () => {
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { ERR: 'NO HAY jsPDF' };
    const Orig = window.jspdf.jsPDF;
    const reg = { txt: [], figs: 0, imgs: [] };
    window.jspdf.jsPDF = function () {
      const d = new Orig(...arguments);
      const ot = d.text.bind(d);
      d.text = function (t) { reg.txt.push(String(t)); return ot.apply(null, arguments) };
      const oi = d.addImage ? d.addImage.bind(d) : null;
      if (oi) d.addImage = function (dd, f, x, y, w, h) { reg.imgs.push(Math.round(w) + 'x' + Math.round(h)); reg.figs++; return oi.apply(null, arguments) };
      ['circle','line','rect','triangle'].forEach(m => { if (typeof d[m] === 'function') { const o = d[m].bind(d); d[m] = function () { reg.figs++; return o.apply(null, arguments) } } });
      d.save = function () { return true };
      d.output = function () { return '' };
      return d;
    };
    Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
    let err = '';
    try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
          else if (typeof generarPDF === 'function') await generarPDF() } catch (e) { err = String(e).slice(0, 110) }
    await esperar(600);
    window.jspdf.jsPDF = Orig;
    const todo = reg.txt.join(' | ');
    return { nTxt: reg.txt.length, chars: todo.length, figs: reg.figs, nImg: reg.imgs.length,
             imgW: reg.imgs.join(' '), err: err,
             cm3dLbl: (todo.indexOf('Corazón en 3D de congénitas') >= 0),
             lineaCIA: (todo.indexOf('CIA, CIV') >= 0),
             ebsCoa: (todo.indexOf('Ebstein  ·  Coa') >= 0 || todo.indexOf('anomalía de Ebstein') >= 0) };
  };
  /* ── sembrar un estudio con CIA y CIV cargadas y abrir el modulo ── */
  S('nombre', 'Prueba PDF'); S('ci', '1234567');
  try { const b1 = bq('showTab(' + Q + 'congenitas2' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(300);
  try { const b2 = bq('ccSubTab(' + Q + 'congenitas2' + Q); if (b2) b2.click() } catch (e) {}
  await esperar(300);
  R.siembra = { cia: S('ete_cia_tipo', 'secundum'), civ: S('ete_civ_tipo', 'perimembranosa') };
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(400);
  const bot = EL('cc3d-abrir'); if (bot) bot.click();
  await esperar(3200);
  const b = EL('cm3d-pdfb'), n = EL('cm3d-pdfn');
  const leer = () => ({ dis: b ? b.disabled : 'NO', txt: b ? b.textContent : 'NO',
                        aria: b ? b.getAttribute('aria-pressed') : 'NO',
                        aviso: n ? String(n.textContent || '').slice(0, 70) : 'NO',
                        inc: (typeof window.esqEstaIncluido === 'function') ? window.esqEstaIncluido('cm3d') : 'NO' });
  R.hayCargado = (typeof window.cmHayCargado === 'function') ? window.cmHayCargado() : 'NO';
  /* ── (A) con lesiones cargadas y en «Segun el estudio»: habilitado ── */
  R.A_conLesiones = leer();
  /* ── (B) en «Explorar»: apagado con su aviso ── */
  const bExp = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), x => x.getAttribute('data-m') === 'explorar')[0];
  if (bExp) bExp.click(); await esperar(600);
  R.B_explorar = leer();
  const bEst = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), x => x.getAttribute('data-m') !== 'explorar')[0];
  if (bEst) bEst.click(); await esperar(600);
  /* ── (C) el PDF con la casilla APAGADA ── */
  R.C_pdfOff = await pdf();
  /* ── (D) se enciende ── */
  if (b) b.click();
  await esperar(1400);
  R.D_encendido = leer();
  R.D_slot = (typeof window.esqSlotIdx === 'function') ? window.esqSlotIdx('cm3d') : 'NO';
  /* ── (E) el PDF con la casilla ENCENDIDA ── */
  R.E_pdfOn = await pdf();
  /* ⚠️ EL COLOR DEL ESQUEMA RASTERIZADO: un esquema NEGRO es el defecto que PANT-2 pago. Se
     decodifica el dataURL que cmEsqPdfData publica y se cuentan los pixeles por tono. */
  R.E_color = await (async () => {
    const d = (typeof window.cmEsqPdfData === 'function') ? window.cmEsqPdfData() : { data:null };
    if (!d || !d.data) return { ERR: 'sin dataURL' };
    return await new Promise(res => {
      const im = new Image();
      im.onload = () => {
        try {
          const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
          const x = c.getContext('2d'); x.drawImage(im, 0, 0);
          const px = x.getImageData(0, 0, c.width, c.height).data;
          let claros = 0, oscuros = 0, azules = 0, rojos = 0, naranjas = 0, tot = 0;
          for (let i = 0; i < px.length; i += 4 * 7) {
            const r2 = px[i], g2 = px[i + 1], b2 = px[i + 2]; tot++;
            const mx = Math.max(r2, g2, b2), mn = Math.min(r2, g2, b2);
            if (mx > 225 && mx - mn < 22) claros++;
            else if (mx < 70) oscuros++;
            if (b2 > r2 + 35 && b2 > 100) azules++;
            if (r2 > b2 + 55 && r2 > 110 && g2 < 120) rojos++;
            if (r2 > 170 && g2 > 100 && g2 < 190 && b2 < 110) naranjas++;
          }
          res({ w: im.width, h: im.height, tot: tot, claros: claros, oscuros: oscuros,
                azules: azules, rojos: rojos, naranjas: naranjas,
                pctClaro: Math.round(claros * 100 / Math.max(1, tot)),
                pctOscuro: Math.round(oscuros * 100 / Math.max(1, tot)) });
        } catch (e) { res({ ERR: String(e).slice(0, 80) }) }
      };
      im.onerror = () => res({ ERR: 'no decodifica' });
      im.src = d.data;
    });
  })();
  /* ── (F) el PDF lleva la version del estudio aunque se este explorando otra cosa ── */
  if (bExp) bExp.click(); await esperar(600);
  const st = window._cm3dEstado ? window._cm3dEstado() : null;
  if (st) { st.S.base = 'ebs'; st.S.mods = { coa: 'nat' }; try { window.cm3dSync() } catch (e) {} }
  await esperar(700);
  R.F_explorando = st ? (st.S.base + '/' + JSON.stringify(st.S.mods)) : 'NO';
  R.F_lineaPDF = (typeof window.cmLineaPDF === 'function') ? window.cmLineaPDF() : 'NO';
  R.F_estadoTrasLinea = st ? (st.S.base + '/' + JSON.stringify(st.S.mods)) : 'NO';
  R.F_pdf = await pdf();
  if (bEst) bEst.click(); await esperar(600);
  /* ── (G) se apaga y el PDF vuelve a no llevarlo ── */
  if (b) b.click(); await esperar(900);
  R.G_apagado = leer();
  R.G_pdf = await pdf();
  /* ── (H) sin lesiones cargadas: apagado con su aviso ── */
  S('ete_cia_tipo', ''); S('ete_civ_tipo', '');
  try { window.cm3dEstudioSync() } catch (e) {}
  await esperar(800);
  R.H_sinLesiones = leer();
  R.H_hayCargado = (typeof window.cmHayCargado === 'function') ? window.cmHayCargado() : 'NO';
  return R;
})()`).catch(e => ({ EXC: String(e).slice(0, 280) }));
r.errores = errs.slice(0, 6);
console.log(JSON.stringify(r, null, 1));
await pg.close(); await br.close();
