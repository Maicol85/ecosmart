#!/usr/bin/env node
/**
 * _probe_cong2a_mch.mjs — el papel de la miocardiopatia hipertrofica (CONG-2A, commit 5a).
 * Censa, con su DENOMINADOR, cada mencion de guia, clase y recomendacion de desfibrilador en el
 * informe (tres estilos), el EN SUMA (tres), la hoja del PDF y el PPT; y verifica que el mismo
 * contenido este en la Evidencia con su fuente. Guarda ademas TODOS LOS NUMEROS del papel, para
 * probar que ninguno desaparece.
 *   node scripts/_probe_cong2a_mch.mjs [--file <html>] [--out <json>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
import fs from 'fs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1400, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push(e.message.slice(0, 100)));
pg.on('console', c => { if (c.type() === 'error') errs.push(c.text().slice(0, 100)) });
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1500);
/* ATENCION, DENOMINADOR: el score HCM Risk-SCD pide espesor, ai_diam, gradiente, EDAD del
   paciente, historia familiar, TVNS y sincope -lo dice mchScoreESC-, y el modulo llega al papel
   por la casilla mch_incluir_chk, no por amiloIntegrar, que es un TOGGLE. La primera version de
   estas escenas usaba mch_edad y mch_ai, que no existen, asi que las cuatro salian «incompleto»
   y el censo del papel daba cero sobre un informe que no nombraba la miocardiopatia. */
const BASE = { mch_presente: 'si', siv: '20', ppvi: '12', ai_diam: '45', fevi: '60' };
const ESCENAS = {
  /* riesgo ALTO por el score de la ESC y DOS factores mayores de la AHA */
  alto: Object.assign({}, BASE, { mch_espesor: '32', ai_diam: '52', edad: '28',
         mch_grad_reposo: '20', mch_grad_valsalva: '70', mch_fam_ms: 'si', mch_fam_ms_edad: '35',
         mch_fam_ms_mch: 'si', mch_sincope: 'si', mch_tvns: 'si', mch_aneurisma_apical: 'si',
         mch_fibrosis_rmn: 'si', siv: '32' }),
  /* banda BAJA sin ningun factor: la rama «no indicado de rutina» */
  bajo: Object.assign({}, BASE, { mch_espesor: '15', ai_diam: '35', edad: '65',
         mch_grad_reposo: '8', mch_grad_valsalva: '10', mch_fam_ms: 'no', mch_sincope: 'no',
         mch_tvns: 'no', mch_aneurisma_apical: 'no', mch_fibrosis_rmn: 'no', siv: '15' }),
  /* INTERMEDIO */
  inter: Object.assign({}, BASE, { mch_espesor: '20', ai_diam: '44', edad: '40',
          mch_grad_reposo: '15', mch_grad_valsalva: '35', mch_fam_ms: 'no', mch_sincope: 'si',
          mch_tvns: 'no', mch_aneurisma_apical: 'no', mch_fibrosis_rmn: 'no', siv: '20' }),
  /* arbitros SIN factores mayores: la rama Clase IIb de la AHA */
  arbit: Object.assign({}, BASE, { mch_espesor: '16', ai_diam: '38', edad: '50',
          mch_grad_reposo: '10', mch_grad_valsalva: '12', mch_fam_ms: 'no', mch_sincope: 'no',
          mch_tvns: 'si', mch_aneurisma_apical: 'no', mch_fibrosis_rmn: 'no', siv: '16' }),
  /* CONTROL NEGATIVO: ninguna miocardiopatia cargada */
  ajeno: { ddfvi: '52', fevi: '58', ao_sin: '34' }
};
const PALABRAS = ['AHA/ACC 2020','AHA/ACC','AHA','ESC 2023','ESC','HCM Risk-SCD','Clase IIa',
                  'Clase IIb','Clase I','desfibrilador','prevención secundaria','razonable',
                  'puede considerarse','a considerar','no indicado de rutina','guía','guías',
                  'folio','Tabla'];
const OUT = { archivo: FILE };
for (const k of Object.keys(ESCENAS)) {
  const r = await pg.evaluate(`(async (ESC) => {
    const EL = id => document.getElementById(id);
    const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
    ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
    try { limpiarCampos(true) } catch (e) {}
    S('nombre', 'Prueba MCH'); S('ci', '572'); S('peso', '70'); S('talla', '170'); S('sexo', 'M');
    Object.keys(ESC).forEach(id => S(id, ESC[id]));
    Object.keys(window).forEach(x => { if (/^calc[A-Z]/.test(x) && typeof window[x] === 'function') { try { window[x]() } catch (e) {} } });
    try { if (typeof _recalcModulos === 'function') _recalcModulos('ab') } catch (e) {}
    await new Promise(z => setTimeout(z, 600));
    /* DENOMINADOR: el modulo tiene que estar INTEGRADO, si no el papel no trae una palabra de
       la MCH y el cero del censo no distingue «no lo dice» de «no hay nada que decir».
       ATENCION: amiloIntegrar es un TOGGLE —sobre un modulo ya integrado RETIRA—, y la primera
       version de esta sonda lo llamaba a ciegas: el barrido automatico ya lo habia integrado,
       asi que mi llamada lo SACABA y el informe salia en 483 caracteres sin una palabra de la
       miocardiopatia, igual que el control ajeno. */
    try { const ck = EL('mch_incluir_chk');
      if (ck && !ck.checked) { ck.checked = true; ck.dispatchEvent(new Event('change', { bubbles: true })) } } catch (e) {}
    try { if (typeof _recalcModulos === 'function') _recalcModulos() } catch (e) {}
    await new Promise(z => setTimeout(z, 700));
    const o = { denom: {} };
    try { o.denom.integrado = (typeof amiloIntegrado === 'function') ? !!amiloIntegrado('mch') : 'NO FN' } catch (e) { o.denom.integrado = 'EXC' }
    try { o.denom.enInforme = (typeof amiloEnInforme === 'function')
      ? (amiloEnInforme() || []).map(x => x.k).join(',') : 'NO FN' } catch (e) { o.denom.enInforme = 'EXC' }
    try { const c = mchConclusion(); o.denom.txtLargo = c ? String(c.txt || '').length : 0;
      o.concl = c ? { clave: c.clave, txt: String(c.txt || ''), resumen: String(c.resumen || ''),
                      papel: String(c.papel || '') } : null } catch (e) { o.concl = { err: String(e.message).slice(0, 90) } }
    const sup = {};
    ['estandar','narrativo','conciso'].forEach(st => {
      try { setEstiloInforme(st) } catch (e) {} try { generarInforme() } catch (e) {}
      sup['informe_' + st] = String((EL('informe_texto') || {}).value || '');
      sup['suma_' + st] = String((EL('en_suma') || {}).value || '');
    });
    try { setEstiloInforme('estandar') } catch (e) {} try { generarInforme() } catch (e) {}
    /* el PDF generado de VERDAD */
    const Or = window.jspdf && window.jspdf.jsPDF; let pdf = '';
    if (Or) { const reg = [];
      const F = function () { const d = new Or(...arguments); const t = d.text.bind(d);
        d.text = function (s) { try { reg.push(Array.isArray(s) ? s.join(' ') : String(s)) } catch (e) {} return t.apply(d, arguments) }; return d };
      Object.keys(Or).forEach(x => { try { F[x] = Or[x] } catch (e) {} });
      window.jspdf.jsPDF = F;
      try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
            else if (typeof generarPDF === 'function') await generarPDF() } catch (e) {}
      window.jspdf.jsPDF = Or; pdf = reg.join(' | ');
    }
    sup['pdf'] = pdf;
    /* el PPT: se espia addText Y addTable sobre el PROTOTIPO, que es lo que funciona */
    let ppt = '';
    try { const P = window.PptxGenJS;
      if (P && P.prototype && P.prototype.addSlide) {
        const reg = []; const as = P.prototype.addSlide;
        P.prototype.addSlide = function () { const sl = as.apply(this, arguments);
          const at = sl.addText, ab = sl.addTable;
          if (at) sl.addText = function (x) { try { reg.push(typeof x === 'string' ? x : JSON.stringify(x)) } catch (e) {} return at.apply(sl, arguments) };
          if (ab) sl.addTable = function (x) { try { reg.push(JSON.stringify(x)) } catch (e) {} return ab.apply(sl, arguments) };
          return sl };
        try { if (typeof generarPPT === 'function') await generarPPT() } catch (e) {}
        P.prototype.addSlide = as; ppt = reg.join(' | ');
      } } catch (e) { ppt = 'EXC ' + String(e.message).slice(0, 60) }
    sup['ppt'] = ppt;
    o.largos = {}; Object.keys(sup).forEach(x => { o.largos[x] = sup[x].length });
    o.censo = {};
    Object.keys(sup).forEach(x => { const c = {};
      ${JSON.stringify(PALABRAS)}.forEach(w => { const n = sup[x].split(w).length - 1; if (n) c[w] = n });
      o.censo[x] = c });
    /* TODOS LOS NUMEROS del informe estandar y del PDF, para probar que ninguno desaparece. */
    const nums = t => { const out = []; let cur = '';
      for (let i = 0; i < t.length; i++) { const ch = t[i];
        if ((ch >= '0' && ch <= '9') || ch === ',' || ch === '.') cur += ch;
        else { if (cur && cur[0] >= '0' && cur[0] <= '9') out.push(cur.replace(/[.,]+$/, '')); cur = '' } }
      if (cur && cur[0] >= '0' && cur[0] <= '9') out.push(cur.replace(/[.,]+$/, ''));
      return out.filter(Boolean).sort() };
    o.numeros = { informe: nums(sup.informe_estandar), suma: nums(sup.suma_estandar), pdf: nums(sup.pdf) };
    /* LA EVIDENCIA: la seccion de muerte subita con su fuente y sus folios */
    try { if (typeof indicRender === 'function') indicRender() } catch (e) {}
    try { const sec = IND_SECS.filter(x => x.tit.indexOf('Miocardiopatía hipertrófica') === 0);
      o.evidencia = sec.map(x => { let R = null; try { R = x.fn() } catch (q) { return { tit: x.tit, err: 1 } }
        if (!R) return { tit: x.tit, aplica: false };
        const lin = []; (R.bloques || []).forEach(b => b.lineas.forEach(l => lin.push(l.txt)));
        const todo = lin.join(' ') + ' ' + ((R.guia && R.guia.txt) || '');
        return { tit: x.tit.slice(0, 60), aplica: true, nLineas: lin.length,
                 desfib: (todo.split('desfibrilador').length - 1) + (todo.split('ICD').length - 1),
                 e1267: todo.indexOf('e1267') >= 0, f3561: todo.indexOf('3561') >= 0 || todo.indexOf('3562') >= 0,
                 aha2024: todo.indexOf('AHA/ACC 2024') >= 0 || todo.indexOf('2024') >= 0,
                 clases: (todo.split('Clase I').length - 1) }; });
    } catch (e) { o.evidencia = 'EXC ' + String(e.message).slice(0, 70) }
    return o;
  })(${JSON.stringify(ESCENAS[k])})`, { timeout: 180000 });
  OUT[k] = r;
  console.log('== escena ' + k + ' == integrado=' + r.denom.enInforme + ' txt=' + r.denom.txtLargo
    + ' largos=' + JSON.stringify(r.largos));
  console.log('   censo informe_estandar:', JSON.stringify(r.censo.informe_estandar));
  console.log('   censo suma_estandar   :', JSON.stringify(r.censo.suma_estandar));
  console.log('   censo pdf             :', JSON.stringify(r.censo.pdf));
  console.log('   censo ppt             :', JSON.stringify(r.censo.ppt));
}
console.log('EVIDENCIA:', JSON.stringify(OUT.alto.evidencia));
console.log('errores:', errs.length, errs.slice(0, 3));
await br.close();
const OUTF = arg('--out') || '/tmp/cong2a_mch.json';
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
