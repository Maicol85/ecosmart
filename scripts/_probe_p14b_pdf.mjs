#!/usr/bin/env node
/**
 * _probe_p14b_pdf.mjs - el PDF con UN SOLO dibujo (PANT-14b, commit 3).
 * Genera el PDF de verdad con el gesto real -el boton del encabezado y su tarjeta de
 * severidades- y mide: cuantas imagenes trae, si alguna esta DUPLICADA -el mismo dataURL dos
 * veces, que es el defecto que el medico reporto-, y de donde sale cada una.
 *   node scripts/_probe_p14b_pdf.mjs [--file <html>] [--caso <n>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const SOLO = arg('--caso');

const CASOS = [
  { n:'cia',      sub:'congenitas2', campos:[['ete_cia_tipo','secundum']] },
  { n:'ciaEsq',   sub:'congenitas2', campos:[['ete_cia_tipo','secundum']], esquema:true },
  { n:'tga',      sub:'congenitas2', campos:[['tga_tipo','dtga']] },
  { n:'fallot',   sub:'congenitas2', campos:[['tdf_func_vd','normal'],['ip_grado','Severa']] },
  { n:'vacio',    sub:'congenitas',  campos:[] },
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
      return 'SIN OPCION ' + v + ' [' + Array.prototype.map.call(e.options, o => o.value).join('|') + ']';
    if (e.type === 'checkbox') { e.checked = (v === 'si') } else { e.value = v }
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok' };
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
        reg.imgs.push({ w: Math.round(w), h: Math.round(h), x: Math.round(x), y: Math.round(y),
                        largo: String(dd || '').length, hash: String(dd || '').slice(-120),
                        dato: String(dd || '') });
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
    /* LA PRUEBA DEL DIBUJO DOBLE: el mismo dataURL dos veces */
    const vistos = {}, dup = [];
    reg.imgs.forEach(function (i) { const k = i.largo + ':' + i.hash;
      if (vistos[k]) { dup.push(i.w + 'x' + i.h + ' (largo ' + i.largo + ')') } vistos[k] = (vistos[k] || 0) + 1 });
    return { nTxt: reg.txt.length, chars: todo.length, figs: reg.figs, nImg: reg.imgs.length, err: err,
             etiqCm3d: (todo.indexOf('Corazón en 3D de congénitas') >= 0),
             etiqImgs: (todo.indexOf('Imágenes del estudio') >= 0 || todo.indexOf('Imagenes del estudio') >= 0),
             etiqTga: (todo.indexOf('Transposición de grandes arterias — esquema 3D') >= 0),
             medidas: reg.imgs.map(i => i.w + 'x' + i.h).join(' '),
             duplicadas: dup, nDup: dup.length,
             muestras: await Promise.all(reg.imgs.map(function (g) {
               if (!g.dato || g.dato.indexOf('data:image') !== 0) return Promise.resolve({ ERR: 'no es imagen' });
               return new Promise(function (res) { const im = new Image();
                 im.onload = function () { try {
                   const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
                   const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0);
                   const pts = [[0.5,0.5],[0.25,0.25],[0.75,0.25],[0.25,0.75],[0.75,0.75],[0.5,0.2],[0.5,0.8]];
                   let neg = 0, bla = 0; const col = [];
                   pts.forEach(function (q) { const d2 = cx.getImageData(Math.round(im.width*q[0]), Math.round(im.height*q[1]), 1, 1).data;
                     if (d2[0] < 26 && d2[1] < 26 && d2[2] < 26) neg++;
                     if (d2[0] > 246 && d2[1] > 246 && d2[2] > 246) bla++;
                     col.push(d2[0]+','+d2[1]+','+d2[2]) });
                   res({ mm: g.w+'x'+g.h, px: im.width+'x'+im.height, negras: neg, blancas: bla, colores: col.join(' | ') });
                 } catch (e) { res({ ERR: String(e).slice(0,80) }) } };
                 im.onerror = function () { res({ ERR: 'NO DECODIFICA' }) };
                 im.src = g.dato; }) })) };
  };
  /* el estudio */
  const nm = EL('nombre'); if (nm) { nm.value = 'Prueba P14B'; nm.dispatchEvent(new Event('input', { bubbles: true })) }
  const ci = EL('ci'); if (ci) { ci.value = '9876543'; ci.dispatchEvent(new Event('input', { bubbles: true })) }
  try { const b1 = bq('showTab(' + Q + CASO.sub + Q); if (b1) b1.click() } catch (e) {}
  await esperar(420);
  R.siembra = {};
  for (const c of CASO.campos) { R.siembra[c[0]] = gesto(c[0], c[1]); await esperar(130) }
  await esperar(460);
  /* abrir el modulo */
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(420);
  const ab = EL('cc3d-abrir'); if (ab) ab.click();
  await esperar(3400);
  /* el esquema de circulacion, con su boton real */
  if (CASO.esquema) { const sb = EL('cm3d-esb'); R.schBtn = sb ? 'click' : 'NO HAY';
    if (sb) { sb.click(); await esperar(1200) } }
  R.schAbierto = (function () { const c = EL('cm3d-sch');
    return c ? (getComputedStyle(c).display !== 'none' && !c.hidden) : 'NO HAY' })();
  /* tocar el boton del PDF */
  const b = EL('cm3d-pdfb');
  R.btnApagado = b ? !!b.disabled : 'NO HAY';
  R.btnAviso = (EL('cm3d-pdfn') || {}).textContent || '';
  if (b && !b.disabled) { b.click(); await esperar(2600) }
  R.incluido = (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('cm3d') : 'SIN FN';
  R.pdfConCasilla = await pdf();
  /* apagar y volver a generar */
  const b2 = EL('cm3d-pdfb');
  if (b2 && !b2.disabled && b2.getAttribute('aria-pressed') === 'true') { b2.click(); await esperar(1400) }
  R.pdfSinCasilla = await pdf();
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
