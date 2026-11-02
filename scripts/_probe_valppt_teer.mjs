#!/usr/bin/env node
/**
 * _probe_valppt_teer.mjs - el CENSO del papel de las tres etiquetas del TEER (VAL-PPT-5a).
 *
 * Las etiquetas son «NO apto», «Heart Team» y «anatomia compleja», que `teerEstado()` escribe
 * en los textos de fallo de sus criterios y en su conclusion.
 *
 * ⚠️ EL DENOMINADOR ES EL MODULO INTEGRADO, y sin el un cero no prueba nada: el bloque del
 * TEER llega al papel SOLO si el medico lo integra al informe. La sonda lo integra, verifica
 * que `amiloEnInforme()` devuelva `teer` y que `am-txt-teer` tenga texto, y recien entonces
 * cuenta. Y lleva CONTROL POSITIVO: el mismo censo sobre la PANTALLA, donde las etiquetas se
 * quedan.
 *
 * Las cuatro superficies del papel se enumeran UNA POR UNA: informe en los tres estilos, EN
 * SUMA en los tres, el PDF generado de verdad en sus seis plantillas, y el PPT.
 *
 *   node scripts/_probe_valppt_teer.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || process.cwd() + '/index.html';

const CUERPO = `(async () => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const W = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.value = v; el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true})) };
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  /* Un estudio que haga FALLAR varios criterios del TEER: asi las tres etiquetas aparecen.
     Un estudio que los cumpla todos dice «APTO» y no ejercita «NO apto» ni «Heart Team». */
  /* ⚠️ LOS IDS SON LOS QUE teerEstado LEE DE VERDAD, censados en el archivo: todos con
     prefijo teer_. La primera version pidio ete_flail_ancho, psap y otros cinco que NO
     existen, asi que solo dos criterios fallaban y el censo no podia ver «Heart Team» ni
     «anatomia compleja». Un censo sobre un escenario que no los produce da cero y parece que
     el papel esta limpio. */
  S('peso','78'); S('talla','174'); S('edad','76'); S('sexo','M');
  S('teer_lva','18');          /* velo anterior < 20 -> NO apto */
  S('teer_lvp','6');           /* velo posterior < 7 -> NO apto */
  S('teer_area_mitral','3.5'); /* area < 4 -> NO apto */
  S('teer_pasp','78');         /* PASP > 70 -> NO apto */
  S('teer_dtsvi','72');        /* DSFVI > 70 -> NO apto (COAPT) */
  S('teer_ancho_flail','16');  /* flail >= 15 -> anatomia compleja, Heart Team */
  S('teer_prof_flail','12');   /* profundidad >= 11 -> anatomia compleja, Heart Team */
  S('teer_flail_gap','11');    /* flail gap >= 10 -> NO apto */
  S('teer_gap','1');
  S('teer_fevi','45');
  S('teer_tipo_im','primaria');
  S('teer_trombo','no'); S('teer_calcificacion','no'); S('teer_clefts','no');
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (x) {} } });
  try { if (typeof teerSync === 'function') teerSync() } catch (x) {}
  try { if (typeof _recalcModulos === 'function') _recalcModulos('teer') } catch (x) {}
  await W(400);
  /* INTEGRAR: la compuerta del papel. */
  try { if (typeof amiloIntegrar === 'function') amiloIntegrar('teer') } catch (x) { R.errs.push('integrar: ' + x) }
  await W(400);
  R.integrado = (typeof amiloEnInforme === 'function') ? JSON.stringify((amiloEnInforme()||[]).map(z => z.k)) : 'n/d';
  R.amTxtN = String((EL('am-txt-teer') || {}).value || (EL('am-txt-teer') || {}).textContent || '').length;
  const MARC = ['NO apto', 'Heart Team', 'anatomía compleja'];
  const cuenta = t => { const o = {};
    MARC.forEach(m => { const n = String(t).split(m).length - 1; if (n) o[m] = n }); return o };
  /* 1 a 6 - informe y EN SUMA, en los tres estilos. */
  R.sup = {}; R.denom = {};
  for (const st of ['estandar','narrativo','conciso']) {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(st) } catch (x) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (x) {}
    const inf = String((EL('informe_texto')||{}).value || '');
    const sum = String((EL('en_suma')||{}).value || '');
    R.sup['informe_' + st] = cuenta(inf); R.denom['informe_' + st] = inf.length;
    R.sup['suma_' + st] = cuenta(sum);    R.denom['suma_' + st] = sum.length;
  }
  try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch (x) {}
  try { if (typeof generarInforme === 'function') generarInforme() } catch (x) {}
  /* 7 - el PPT. El espia es el de _probe_valpptab.mjs, que SI funciona: la primera version
     de esta sonda envolvia el constructor sin reemplazar addSlide correctamente y el
     denominador salia en CERO caracteres, o sea que su «cero etiquetas» no probaba nada. */
  try {
    if (typeof window.PptxGenJS === 'undefined') { R.errs.push('SIN PPTXGENJS') }
    else {
      const Orig = window.PptxGenJS;
      const reg = [];
      window.PptxGenJS = function (...a) {
        const pz = new Orig(...a);
        const oa = pz.addSlide.bind(pz);
        pz.addSlide = function (...z) { const s2 = oa(...z);
          const ot = s2.addText.bind(s2);
          s2.addText = function (t, ...r) { reg.push(JSON.stringify(t).slice(0, 900)); return ot(t, ...r) };
          if (typeof s2.addTable === 'function') { const oTb = s2.addTable.bind(s2);
            s2.addTable = function (f2, ...r) { reg.push('[TABLA] ' + JSON.stringify(f2).slice(0, 6000)); return oTb(f2, ...r) } }
          return s2 };
        pz.writeFile = function () { return Promise.resolve(true) };
        pz.write = function () { return Promise.resolve('') };
        return pz;
      };
      Object.keys(Orig).forEach(k => { try { window.PptxGenJS[k] = Orig[k] } catch (x) {} });
      try { if (typeof generarPPT === 'function') await generarPPT() } catch (x) { R.errs.push('ppt: ' + String(x).slice(0,80)) }
      window.PptxGenJS = Orig;
      R.sup._ppt = cuenta(reg.join(' | ')); R.denom._ppt = reg.join(' | ').length;
    }
  } catch (x) { R.errs.push('PPT ' + String(x).slice(0,90)) }
  /* 8 - el PDF generado de verdad, en sus seis plantillas. */
  try {
    const Orig = window.jspdf.jsPDF;
    const PL = ['estandar','compacto','clasico','moderno','minimal','premium'];
    R.pdf = {};
    for (const p of PL) {
      const txt = [];
      window.jspdf.jsPDF = function (...a) { const d = new Orig(...a);
        const ot = d.text.bind(d);
        d.text = function (t, x, y, ...rest) { txt.push(String(t)); return ot(t, x, y, ...rest) };
        d.save = function(){ return true }; d.output = function(){ return '' };
        return d };
      Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (x) {} });
      try { const pl = EL('pdf_plantilla'); if (pl) { pl.value = p;
              pl.dispatchEvent(new Event('change', { bubbles: true })) } } catch (x) {}
      try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
            else if (typeof generarPDF === 'function') await generarPDF() } catch (x) { R.errs.push('pdf ' + p) }
      R.pdf[p] = { n: txt.join(' ').length, marc: cuenta(txt.join(' ')) };
    }
    window.jspdf.jsPDF = Orig;
  } catch (x) { R.errs.push('PDF ' + String(x).slice(0,90)) }
  /* CONTROL POSITIVO - la PANTALLA, donde las etiquetas se quedan. */
  const pant = ['teer-badge','teer-titulo','teer-nota','teer-c1','teer-c3','teer-c4','teer-c5',
                'teer-c6','teer-c8','teer-c11'].map(id => String((EL(id)||{}).textContent || '')).join(' | ');
  R.pantalla = cuenta(pant); R.denomPantalla = pant.length;
  R.pantallaTxt = pant.slice(0, 420);
  return R;
})`;

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  const R = await pg.evaluate(new Function('return ' + CUERPO)());
  console.log('===== LAS TRES ETIQUETAS DEL TEER EN EL PAPEL (VAL-PPT-5a) =====');
  console.log('archivo:', FILE);
  console.log('DENOMINADOR: modulo integrado =', R.integrado, '| am-txt-teer =', R.amTxtN, 'caracteres');
  console.log('');
  console.log('PAPEL:');
  for (const k of Object.keys(R.sup)) {
    const o = R.sup[k], n = Object.keys(o).length;
    console.log('  ' + k.padEnd(18) + (R.denom[k] || 0) + ' car.  ->  '
      + (n ? JSON.stringify(o) : 'cero'));
  }
  if (R.pdf) for (const p of Object.keys(R.pdf)) {
    const o = R.pdf[p].marc, n = Object.keys(o).length;
    console.log('  pdf_' + p.padEnd(14) + R.pdf[p].n + ' car.  ->  ' + (n ? JSON.stringify(o) : 'cero'));
  }
  console.log('');
  console.log('CONTROL POSITIVO - la PANTALLA (' + R.denomPantalla + ' car.): '
    + JSON.stringify(R.pantalla));
  console.log('  ' + R.pantallaTxt);
  const totalPapel = Object.keys(R.sup).reduce((a, k) => a + Object.keys(R.sup[k]).length, 0)
    + (R.pdf ? Object.keys(R.pdf).reduce((a, p) => a + Object.keys(R.pdf[p].marc).length, 0) : 0);
  console.log('\nRESULTADO: ' + totalPapel + ' superficie(s) de PAPEL con alguna etiqueta');
  if (R.errs && R.errs.length) console.log('errs: ' + R.errs.slice(0,5).join(' ; '));
  console.log('errores de pagina: ' + (errs.length ? errs.join(' | ') : 'ninguno'));
  await b.close();
  process.exit(0);
})();
