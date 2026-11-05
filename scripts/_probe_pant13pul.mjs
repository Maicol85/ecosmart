#!/usr/bin/env node
/**
 * _probe_pant13pul.mjs - el broncograma en puntitos y el boton del PDF (PANT-13, commit 6).
 * Mide: los puntos con y sin broncograma -contandolos y verificando que NO quedan lineas-, el
 * resto del dibujo idéntico, el boton con su campo guardado, el PDF generado DE VERDAD con la
 * casilla apagada y encendida contando los caracteres emitidos, el color del raster, y «Nuevo
 * estudio».
 *   node scripts/_probe_pant13pul.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = (arg('--anchos') || '1440').split(',').map(Number);
const br = await _pw.chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
for (const w of ANCHOS) {
  const pg = await br.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 140)));
  pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 140)) });
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
    const pdf = async () => {
      if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { ERR: 'NO HAY jsPDF' };
      const Orig = window.jspdf.jsPDF;
      const reg = { txt: [], figs: 0, imgs: [] };
      window.jspdf.jsPDF = function () {
        const d = new Orig(...arguments);
        const ot = d.text.bind(d);
        d.text = function (t) { reg.txt.push(String(t)); return ot.apply(null, arguments) };
        const oi = d.addImage ? d.addImage.bind(d) : null;
        if (oi) d.addImage = function (dd, f, x, y, w2, h2) { reg.imgs.push(Math.round(w2) + 'x' + Math.round(h2)); reg.figs++; return oi.apply(null, arguments) };
        ['circle','line','rect','triangle'].forEach(m => { if (typeof d[m] === 'function') { const o = d[m].bind(d); d[m] = function () { reg.figs++; return o.apply(null, arguments) } } });
        d.save = function () { return true }; d.output = function () { return '' };
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
               lbl: (todo.indexOf('Ecograf') >= 0 && todo.indexOf('diagrama') >= 0),
               desc: (todo.indexOf('broncograma a') >= 0) };
    };
    S('nombre', 'Prueba pulmon'); S('ci', '7654321');
    try { const b1 = bq('showTab(' + Q + 'pericardio' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(600);
    /* sembrar la consolidacion con broncograma */
    R.siembra = { cons: S('pua_consol', 'si'), lado: S('pua_consol_lado', 'der'),
                  bronco: S('pua_consol_bronco', 'con') };
    if (typeof window.pulDibSync === 'function') { try { window.pulDibSync() } catch (e) {} }
    await esperar(500);
    const svg = () => EL('pul-dib-svg');
    const mirar = () => { const sv = svg(); if (!sv) return { ERR: 'NO SVG' };
      /* el grupo del broncograma es el que esta recortado por el blob */
      const gs = Array.prototype.filter.call(sv.querySelectorAll('g[clip-path]'),
        g => String(g.getAttribute('clip-path') || '').indexOf('pulDibBlob') >= 0);
      let pts = 0, lineas = 0, rr = [];
      gs.forEach(g => { pts += g.querySelectorAll('circle').length;
        lineas += g.querySelectorAll('path, line, polyline').length;
        Array.prototype.forEach.call(g.querySelectorAll('circle'), c => rr.push(c.getAttribute('r'))) });
      return { grupos: gs.length, puntos: pts, lineas: lineas,
               radios: Array.from(new Set(rr)).sort().join(','),
               nodos: sv.querySelectorAll('*').length };
    };
    R.conBronco = mirar();
    R.descCon = String((EL('pul-dib-desc') || {}).textContent || '').slice(0, 170);
    /* sin broncograma: ni un punto, y el resto del dibujo igual */
    S('pua_consol_bronco', 'sin');
    if (typeof window.pulDibSync === 'function') { try { window.pulDibSync() } catch (e) {} }
    await esperar(400);
    R.sinBronco = mirar();
    /* control: sin consolidacion tampoco hay puntos */
    S('pua_consol', 'no');
    if (typeof window.pulDibSync === 'function') { try { window.pulDibSync() } catch (e) {} }
    await esperar(400);
    R.sinCons = mirar();
    /* volver a la escena con broncograma */
    S('pua_consol', 'si'); S('pua_consol_bronco', 'con');
    if (typeof window.pulDibSync === 'function') { try { window.pulDibSync() } catch (e) {} }
    await esperar(400);
    /* ── EL BOTON ── */
    const b = EL('pul-dib-pdf-toggle'), f = EL('pul_dib_pdf');
    R.boton = { existe: !!b, campo: !!f, alto: b ? Math.round(b.getBoundingClientRect().height) : 'NO',
                val0: f ? f.value : 'NO', txt: b ? String(b.textContent || '').slice(0, 45) : 'NO' };
    R.pdfOff = await pdf();
    if (b) b.click();
    await esperar(1500);
    R.tras = { val: f ? f.value : 'NO', on: (typeof window.pulDibPdfOn === 'function') ? window.pulDibPdfOn() : 'NO',
               data: (typeof window.pulDibPdfData === 'function') ? !!(window.pulDibPdfData() || {}).data : 'NO' };
    R.pdfOn = await pdf();
    /* el color del raster: un diagrama negro es el defecto de PANT-2 */
    R.color = await (async () => {
      const d = (typeof window.pulDibPdfData === 'function') ? window.pulDibPdfData() : { data:null };
      if (!d || !d.data) return { ERR: 'sin dataURL' };
      return await new Promise(res => { const im = new Image();
        im.onload = () => { try {
          const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
          const x = c.getContext('2d'); x.drawImage(im, 0, 0);
          const px = x.getImageData(0, 0, c.width, c.height).data;
          let claros = 0, oscuros = 0, verdes = 0, grises = 0, tot = 0;
          for (let i = 0; i < px.length; i += 4 * 7) {
            const r2 = px[i], g2 = px[i+1], b2 = px[i+2]; tot++;
            const mx = Math.max(r2,g2,b2), mn = Math.min(r2,g2,b2);
            if (mx > 225 && mx - mn < 22) claros++;
            else if (mx < 70) oscuros++;
            if (g2 > r2 + 12 && g2 > b2 + 8) verdes++;
            if (mx - mn < 18 && mx >= 110 && mx <= 215) grises++;
          }
          res({ w: im.width, h: im.height, tot: tot, pctClaro: Math.round(claros*100/Math.max(1,tot)),
                pctOscuro: Math.round(oscuros*100/Math.max(1,tot)), verdes: verdes, grises: grises });
        } catch (e) { res({ ERR: String(e).slice(0,70) }) } };
        im.onerror = () => res({ ERR: 'no decodifica' }); im.src = d.data; });
    })();
    /* ── «Nuevo estudio» apaga el boton ── */
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    await esperar(500);
    R.trasNuevo = { val: f ? f.value : 'NO', on: (typeof window.pulDibPdfOn === 'function') ? window.pulDibPdfOn() : 'NO' };
    /* el pie con sus tildes */
    R.pie = String((EL('pul-dib-pie') || {}).textContent || '');
    return R;
  })()`).catch(e => ({ EXC: String(e).slice(0, 280) }));
  r.errores = errs.slice(0, 5);
  OUT['w' + w] = r;
  await pg.close();
}
await br.close();
console.log(JSON.stringify(OUT, null, 1));
