#!/usr/bin/env node
/**
 * _probe_popc_pdf.mjs - el esquema del posoperatorio en el PDF (POP-C, commit 10).
 *
 * Genera el PDF DE VERDAD espiando el constructor de jsPDF y cuenta las imagenes y los textos,
 * con la casilla MARCADA y DESMARCADA, en tema claro y oscuro. Con la casilla desmarcada el
 * papel tiene que quedar IDENTICO al de HEAD, que es lo que la orden exige.
 *
 *   node scripts/_probe_popc_pdf.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `(async (e) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const W = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.value = v; el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true})) };
  const C = (id, o) => { const el = EL(id); if (!el) return; el.checked = o;
    el.dispatchEvent(new Event('change',{bubbles:true})) };

  if (e.tema) document.documentElement.setAttribute('data-theme', e.tema);
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(300);
  const sec = EL('pop-seccion');
  const abierta = () => !!(sec && sec.offsetParent && sec.getBoundingClientRect().height > 100);
  if (!abierta()) { const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click(); }
  await W(400);
  S('nombre','Paciente de prueba'); S('documento','1234567');
  S('peso','70'); S('talla','170'); S('hemo_fc','80');
  S('pop_monitor','swan'); await W(200);
  S('pop_sw_gc','4'); S('pop_sw_pam','78'); S('pop_sw_pad','10'); S('pop_cx_horas','6');
  S('pop_cx_tipo','cabg');
  await W(500);
  const sv0 = EL('pop-esq-svg'); if (sv0) sv0.scrollIntoView({ block:'center' });
  await W(600);
  R.hayBoton = !!EL('pop-esq-pdf-btn');
  R.hayCampo = !!EL('pop_esq_pdf');
  if (e.marcar) {
    const b = EL('pop-esq-pdf-btn'); if (b) b.click();
    /* la rasterizacion tiene un diferido propio de 700 ms */
    await W(2200);
  }
  R.casilla = (EL('pop_esq_pdf') || {}).value || '';
  R.hayData = !!((typeof popEsqPdfData === 'function') && popEsqPdfData());
  R.largoData = (typeof popEsqPdfData === 'function' && popEsqPdfData())
    ? popEsqPdfData().length : 0;
  R.enRegistro = (typeof PDF_DIAG_REG !== 'undefined')
    ? PDF_DIAG_REG.filter(d => d.k === 'pop').length : 'NO EXISTE';

  /* ── EL PDF, GENERADO DE VERDAD ── */
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) { R.pdf = 'SIN JSPDF'; return R }
  const Orig = window.jspdf.jsPDF;
  const reg = { textos: [], imgs: 0 };
  window.jspdf.jsPDF = function (...a) {
    const dd = new Orig(...a);
    const ot = dd.text.bind(dd);
    dd.text = function (t, x, y, ...rest) { reg.textos.push(String(t)); return ot(t, x, y, ...rest) };
    const oi = dd.addImage ? dd.addImage.bind(dd) : null;
    if (oi) dd.addImage = function (...z) { reg.imgs++; return oi(...z) };
    dd.save = function () { return true };
    dd.output = function () { return '' };
    return dd;
  };
  Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (x) {} });
  try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4(); }
  catch (x) { R.errs.push('pdf: ' + String(x).slice(0,80)) }
  window.jspdf.jsPDF = Orig;
  const txt = reg.textos.join(' | ');
  R.pdf = { nTextos: reg.textos.length, nImgs: reg.imgs,
    epigrafe: (txt.match(/Esquema ilustrativo: no es una imagen del estudio ni est. a escala/g) || []).length,
    rotuloSec: (txt.match(/Esquema del posoperatorio/g) || []).length,
    famPop: (txt.match(/Posoperatorio de cirug.a card.aca/g) || []).length,
    largo: txt.length };
  return R;
})`;

const ESC = [
  { n: 'sin marcar · claro',  marcar: false, tema: 'light' },
  { n: 'MARCADA   · claro',   marcar: true,  tema: 'light' },
  { n: 'sin marcar · oscuro', marcar: false, tema: 'dark' },
  { n: 'MARCADA   · oscuro',  marcar: true,  tema: 'dark' }
];

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  console.log('===== EL ESQUEMA DEL POSOPERATORIO EN EL PDF (POP-C 10) =====');
  console.log('archivo:', FILE);
  for (const e of ESC) {
    const pg = await b.newPage({ viewport: { width: 1440, height: 1200 } });
    const errs = [];
    pg.on('pageerror', x => errs.push('PAGE ' + x.message));
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(2500);
    let R;
    try {
      R = await Promise.race([ pg.evaluate(new Function('return ' + CUERPO)(), e),
        new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT')), 120000)) ]);
    } catch (x) { console.log('\n-- ' + e.n + ' -- FALLO: ' + x.message); await pg.close(); continue }
    console.log('\n-- ' + e.n + ' --');
    console.log('   boton y campo existen : ' + R.hayBoton + ' / ' + R.hayCampo
      + '   entradas «pop» en el registro: ' + R.enRegistro);
    console.log('   casilla               : "' + R.casilla + '"   hay imagen preparada: '
      + R.hayData + ' (' + R.largoData + ' caracteres)');
    console.log('   PDF                   : ' + JSON.stringify(R.pdf));
    if (R.errs.length) console.log('   errs: ' + R.errs.join(' ; '));
    if (errs.length) console.log('   errores de pagina: ' + errs.slice(0,3).join(' ; '));
    await pg.close();
  }
  await b.close();
  process.exit(0);
})();
