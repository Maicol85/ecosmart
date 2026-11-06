#!/usr/bin/env node
/**
 * _probe_pant14c_pop.mjs - el esquema del posoperatorio que sale solo (PANT-14c, commit 2).
 * LA TABLA casilla x datos x «Nuevo estudio», con el PDF generado de verdad por el boton real
 * del encabezado y su tarjeta de severidades. Mide, por escena: el valor del campo, si el boton
 * se ve marcado, si el PDF emite la pagina del esquema y con cuantas imagenes.
 *   node scripts/_probe_pant14c_pop.mjs [--file <html>] [--caso <n>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const SOLO = arg('--caso');

/* DATOS del posoperatorio: los que hacen que el esquema tenga algo que decir. */
const DATOS = { peso:'70', talla:'170', pop_hora:'6', pop_ic:'1.76', pop_lactato:'3.2' };

const CASOS = [
  /* casilla x datos, con el boton real */
  { n:'offSin',   datos:false, tocar:false },
  { n:'offCon',   datos:true,  tocar:false },
  { n:'onSin',    datos:false, tocar:true  },
  { n:'onCon',    datos:true,  tocar:true  },
  /* el recorrido (m): encender, «Nuevo estudio», y medir */
  { n:'onNuevo',  datos:true,  tocar:true, nuevo:true },
  { n:'onSinNuevo', datos:false, tocar:true, nuevo:true },
];

const CUERPO = (caso) => `(async () => {
  const R = { caso: ${JSON.stringify(caso.n)} }; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const CASO = ${JSON.stringify(caso)}; const DATOS = ${JSON.stringify(DATOS)};
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const gesto = (id, v) => { const e = EL(id); if (!e) return 'NO EXISTE ' + id;
    if (e.type === 'checkbox') { e.checked = (v === 'si') } else { e.value = v }
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok' };
  const pdf = async () => {
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { ERR: 'NO HAY jsPDF' };
    const Orig = window.jspdf.jsPDF;
    const reg = { txt: [], imgs: [] };
    window.jspdf.jsPDF = function () {
      const d = new Orig(...arguments);
      const ot = d.text ? d.text.bind(d) : null;
      if (ot) d.text = function (t) { reg.txt.push(Array.isArray(t) ? t.join(' ') : String(t == null ? '' : t)); return ot.apply(null, arguments) };
      const oi = d.addImage ? d.addImage.bind(d) : null;
      if (oi) d.addImage = function (dd, f, x, y, w, h) {
        reg.imgs.push({ mm: Math.round(w) + 'x' + Math.round(h), largo: String(dd || '').length });
        return oi.apply(null, arguments) };
      d.save = function () { return true }; d.output = function () { return '' };
      return d;
    };
    Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
    const bot = EL('hdr-pdf-quick');
    try { if (bot) { bot.click() } else if (typeof generarPDF === 'function') { generarPDF() } } catch (e) {}
    await esperar(700);
    try { const cf = EL('rev-confirm'); if (cf) cf.click() } catch (e) {}
    await esperar(5200);
    window.jspdf.jsPDF = Orig;
    const todo = reg.txt.join(' | ');
    return { nTxt: reg.txt.length, chars: todo.length, nImg: reg.imgs.length,
             medidas: reg.imgs.map(i => i.mm).join(' '),
             etiqPop: (todo.indexOf('Esquema del posoperatorio') >= 0),
             nEtiqPop: (todo.split('Esquema del posoperatorio').length - 1) };
  };
  const nm = EL('nombre'); if (nm) { nm.value = 'Prueba P14C POP'; nm.dispatchEvent(new Event('input', { bubbles: true })) }
  const ci = EL('ci'); if (ci) { ci.value = '1234567'; ci.dispatchEvent(new Event('input', { bubbles: true })) }
  /* la pestania del posoperatorio */
  try { const b1 = bq('showTab(' + Q + 'posoperatorio' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(500);
  R.pestania = !!bq('showTab(' + Q + 'posoperatorio' + Q);
  if (CASO.datos) { R.siembra = {};
    for (const k of Object.keys(DATOS)) { R.siembra[k] = gesto(k, DATOS[k]); await esperar(110) } }
  await esperar(900);
  /* el boton real de inclusion */
  R.campoAntes = (EL('pop_esq_pdf') || {}).value;
  if (CASO.tocar) { const b = EL('pop-esq-pdf-btn'); R.btn = b ? 'click' : 'NO HAY';
    if (b) { b.click(); await esperar(1400) } }
  R.campoDespues = (EL('pop_esq_pdf') || {}).value;
  R.onAntes = (typeof popEsqPdfOn === 'function') ? popEsqPdfOn() : 'SIN FN';
  R.dataAntes = (typeof popEsqPdfData === 'function') ? !!popEsqPdfData() : 'SIN FN';
  if (CASO.nuevo) {
    /* «Nuevo estudio» por su boton real y «Continuar sin guardar» */
    try { if (typeof nuevoEstudio === 'function') nuevoEstudio() } catch (e) {}
    await esperar(600);
    const cont = Array.prototype.filter.call(document.querySelectorAll('button'),
      b => /Continuar sin guardar/i.test(b.textContent || ''))[0];
    R.contBtn = cont ? 'click' : 'NO HAY';
    if (cont) { cont.click(); await esperar(1600) }
    else { try { if (typeof limpiarCampos === 'function') limpiarCampos() } catch (e) {} await esperar(900) }
    try { const b1 = bq('showTab(' + Q + 'posoperatorio' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(700);
  }
  R.campoFinal = (EL('pop_esq_pdf') || {}).value;
  R.onFinal = (typeof popEsqPdfOn === 'function') ? popEsqPdfOn() : 'SIN FN';
  R.btnMarcado = (function () { const b = EL('pop-esq-pdf-btn');
    return b ? (b.className + '/' + (b.getAttribute('aria-pressed') || '-')) : 'NO HAY' })();
  R.dataFinal = (typeof popEsqPdfData === 'function') ? !!popEsqPdfData() : 'SIN FN';
  R.hayDatos = (function () { try { const d = (typeof popEsquema === 'function') ? popEsquema() : null;
    return d ? 'esquema ok' : 'sin esquema' } catch (e) { return 'EXC ' + String(e).slice(0,50) } })();
  R.popSuf = (function () { try { return (typeof popPatron === 'function') ? !!popPatron().suficiente : 'SIN FN' } catch (e) { return 'EXC' } })();
  R.pdf = await pdf();
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
