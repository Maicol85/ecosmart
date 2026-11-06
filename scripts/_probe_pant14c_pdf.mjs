#!/usr/bin/env node
/**
 * _probe_pant14c_pdf.mjs - el PDF del corazon maestro: imagen, esquema y texto (PANT-14c, commit 1).
 * REPRODUCE lo que el medico reporto con el GESTO REAL: cuantas imagenes del modulo trae el PDF,
 * su tamanio en px y en mm, su relacion alto/ancho contra la del recuadro del 3D en pantalla, que
 * porcentaje del lienzo es corazon y que porcentaje fondo blanco, y si el esquema esta.
 *   node scripts/_probe_pant14c_pdf.mjs [--file <html>] [--caso <n>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const SOLO = arg('--caso');

const CASOS = [
  { n:'tgaCerr',  sub:'congenitas2', campos:[['tga_tipo','dtga']] },
  { n:'tgaAbie',  sub:'congenitas2', campos:[['tga_tipo','dtga']], esquema:true },
  { n:'fallot',   sub:'congenitas2', campos:[['tdf_func_vd','normal'],['ip_grado','Severa']] },
  { n:'fallotAb', sub:'congenitas2', campos:[['tdf_func_vd','normal'],['ip_grado','Severa']], esquema:true },
  { n:'cia',      sub:'congenitas2', campos:[['ete_cia_tipo','secundum']] },
  { n:'ciaAbie',  sub:'congenitas2', campos:[['ete_cia_tipo','secundum']], esquema:true },
  /* EL ORDEN INVERSO: el medico toca «Incluir en el PDF» PRIMERO y abre el esquema DESPUES. */
  { n:'tgaInv',   sub:'congenitas2', campos:[['tga_tipo','dtga']], esqDespues:true },
  { n:'ciaInv',   sub:'congenitas2', campos:[['ete_cia_tipo','secundum']], esqDespues:true },
];

const CUERPO = (caso) => `(async () => {
  const R = { caso: ${JSON.stringify(caso.n)} }; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const CASO = ${JSON.stringify(caso)};
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const gesto = (id, v) => { const e = EL(id); if (!e) return 'NO EXISTE ' + id;
    if (e.tagName === 'SELECT' && !Array.prototype.some.call(e.options, o => o.value === v))
      return 'SIN OPCION ' + v;
    if (e.type === 'checkbox') { e.checked = (v === 'si') } else { e.value = v }
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok' };
  /* MIDE LA IMAGEN: porcentaje de pixeles que NO son blancos (el corazon) y la caja que los
     contiene, que es lo que dice si el dibujo esta chico dentro de un lienzo blanco. */
  const medirImg = (dato) => new Promise(function (res) {
    if (!dato || String(dato).indexOf('data:image') !== 0) return res({ ERR: 'no es imagen' });
    const im = new Image();
    im.onload = function () { try {
      const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
      const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0);
      const d = cx.getImageData(0, 0, im.width, im.height).data;
      let noBl = 0, neg = 0, minX = im.width, maxX = -1, minY = im.height, maxY = -1;
      for (let y = 0; y < im.height; y++) { for (let x = 0; x < im.width; x++) {
        const i = (y * im.width + x) * 4;
        const bl = (d[i] > 246 && d[i+1] > 246 && d[i+2] > 246);
        if (d[i] < 26 && d[i+1] < 26 && d[i+2] < 26) neg++;
        if (!bl) { noBl++; if (x < minX) minX = x; if (x > maxX) maxX = x;
                   if (y < minY) minY = y; if (y > maxY) maxY = y } } }
      const tot = im.width * im.height;
      res({ px: im.width + 'x' + im.height, arPx: +(im.height / im.width).toFixed(3),
            pctNoBlanco: +(100 * noBl / tot).toFixed(1), pctNegro: +(100 * neg / tot).toFixed(2),
            cajaCont: (maxX < 0) ? 'VACIA' : ((maxX - minX + 1) + 'x' + (maxY - minY + 1)),
            pctAnchoUsado: (maxX < 0) ? 0 : +(100 * (maxX - minX + 1) / im.width).toFixed(1),
            pctAltoUsado: (maxY < 0) ? 0 : +(100 * (maxY - minY + 1) / im.height).toFixed(1) });
    } catch (e) { res({ ERR: String(e).slice(0, 80) }) } };
    im.onerror = function () { res({ ERR: 'NO DECODIFICA' }) };
    im.src = dato; });
  const pdf = async () => {
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { ERR: 'NO HAY jsPDF' };
    const Orig = window.jspdf.jsPDF;
    const reg = { txt: [], figs: 0, imgs: [] };
    window.jspdf.jsPDF = function () {
      const d = new Orig(...arguments);
      const ot = d.text ? d.text.bind(d) : null;
      if (ot) d.text = function (t) { reg.txt.push(Array.isArray(t) ? t.join(' ') : String(t == null ? '' : t)); return ot.apply(null, arguments) };
      const oi = d.addImage ? d.addImage.bind(d) : null;
      if (oi) d.addImage = function (dd, f, x, y, w, h) {
        reg.imgs.push({ mmW: +Number(w).toFixed(1), mmH: +Number(h).toFixed(1),
                        x: Math.round(x), y: Math.round(y), largo: String(dd || '').length,
                        hash: String(dd || '').slice(-120), dato: String(dd || '') });
        reg.figs++; return oi.apply(null, arguments) };
      ['circle','line','rect','triangle'].forEach(m => { if (typeof d[m] === 'function') { const o = d[m].bind(d); d[m] = function () { reg.figs++; return o.apply(null, arguments) } } });
      d.save = function () { return true }; d.output = function () { return '' };
      return d;
    };
    Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
    let err = '';
    const bot = EL('hdr-pdf-quick');
    try { if (bot) { bot.click() } else if (typeof generarPDF === 'function') { generarPDF() } } catch (e) { err = String(e).slice(0, 120) }
    await esperar(700);
    try { const cf = EL('rev-confirm'); if (cf) cf.click() } catch (e) {}
    await esperar(5200);
    window.jspdf.jsPDF = Orig;
    const todo = reg.txt.join(' | ');
    const vistos = {}, dup = [];
    reg.imgs.forEach(function (i) { const k = i.largo + ':' + i.hash;
      if (vistos[k]) { dup.push(i.mmW + 'x' + i.mmH) } vistos[k] = (vistos[k] || 0) + 1 });
    const med = [];
    for (const g of reg.imgs) { const m = await medirImg(g.dato);
      m.mm = g.mmW + 'x' + g.mmH; m.arMm = +(g.mmH / g.mmW).toFixed(3); med.push(m) }
    return { nTxt: reg.txt.length, chars: todo.length, figs: reg.figs, nImg: reg.imgs.length, err: err,
             etiqCm3d: (todo.indexOf('Corazón en 3D de congénitas') >= 0),
             nEtiqCm3d: (todo.split('Corazón en 3D de congénitas').length - 1),
             medidas: reg.imgs.map(i => i.mmW + 'x' + i.mmH).join(' '),
             nDup: dup.length, duplicadas: dup, imgs: med, textos: reg.txt };
  };
  /* el estudio */
  const nm = EL('nombre'); if (nm) { nm.value = 'Prueba P14C'; nm.dispatchEvent(new Event('input', { bubbles: true })) }
  const ci = EL('ci'); if (ci) { ci.value = '9876543'; ci.dispatchEvent(new Event('input', { bubbles: true })) }
  try { const b1 = bq('showTab(' + Q + CASO.sub + Q); if (b1) b1.click() } catch (e) {}
  await esperar(420);
  R.siembra = {};
  for (const c of CASO.campos) { R.siembra[c[0]] = gesto(c[0], c[1]); await esperar(130) }
  await esperar(460);
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(420);
  const ab = EL('cc3d-abrir'); if (ab) ab.click();
  await esperar(3400);
  /* GEOMETRIA EN PANTALLA: el recuadro del 3D y su lienzo */
  R.pantalla = (function () {
    const host = EL('cm3d-cv'), cv = host ? host.querySelector('canvas') : null;
    const sh = EL('cm3d-shell'), bx = EL('cm3d-box');
    const rh = host ? host.getBoundingClientRect() : null;
    return { hostW: rh ? Math.round(rh.width) : 'NO HAY', hostH: rh ? Math.round(rh.height) : 0,
             arHost: rh && rh.width ? +(rh.height / rh.width).toFixed(3) : 0,
             cvAttr: cv ? (cv.width + 'x' + cv.height) : 'NO HAY CANVAS',
             arCv: cv && cv.width ? +(cv.height / cv.width).toFixed(3) : 0,
             boxW: bx ? Math.round(bx.getBoundingClientRect().width) : 'NO HAY' };
  })();
  if (CASO.esquema) { const sb = EL('cm3d-esb'); R.schBtn = sb ? 'click' : 'NO HAY';
    if (sb) { sb.click(); await esperar(1400) } }
  R.schAbierto = (function () { const c = EL('cm3d-sch');
    return c ? (getComputedStyle(c).display !== 'none' && !c.hidden) : 'NO HAY' })();
  R.cmEsqPdfOnAntes = (typeof cmEsqPdfOn === 'function') ? cmEsqPdfOn() : 'SIN FN';
  const b = EL('cm3d-pdfb');
  R.btnApagado = b ? !!b.disabled : 'NO HAY';
  if (b && !b.disabled) { b.click(); await esperar(2800) }
  R.incluido = (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('cm3d') : 'SIN FN';
  if (CASO.esqDespues) { const sb2 = EL('cm3d-esb'); R.schBtn2 = sb2 ? 'click' : 'NO HAY';
    if (sb2) { sb2.click(); await esperar(1600) }
    R.schAbierto2 = (function () { const c = EL('cm3d-sch');
      return c ? (getComputedStyle(c).display !== 'none' && !c.hidden) : 'NO HAY' })() }
  R.cmEsqPdfOn = (typeof cmEsqPdfOn === 'function') ? cmEsqPdfOn() : 'SIN FN';
  R.schFlag = (typeof window._cm3dEstado === 'function') ? !!window._cm3dEstado().sch : 'SIN FN';
  R.esqData = (typeof cmEsqPdfData === 'function') ? !!(cmEsqPdfData() || {}).data : 'SIN FN';
  R.lineaPDF = (typeof cmLineaPDF === 'function') ? String(cmLineaPDF() || '') : 'SIN FN';
  R.pdfConCasilla = await pdf();
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const salida = {};
for (const caso of CASOS) {
  if (SOLO && caso.n !== SOLO) continue;
  const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
    await pg.waitForTimeout(1900);
    const r = await pg.evaluate(CUERPO(caso));
    r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
    salida[caso.n] = r;
  } catch (e) { salida[caso.n] = { fatal: String(e).slice(0, 220), errs } }
  await pg.close();
}
await br.close();
console.log(JSON.stringify(salida, null, 1));
