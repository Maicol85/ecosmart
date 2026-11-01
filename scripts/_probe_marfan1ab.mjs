#!/usr/bin/env node
/**
 * _probe_marfan1ab.mjs — A/B de la tanda MARFAN-1 contra HEAD.
 *
 * Compara, escena por escena: el informe en los TRES estilos, el EN SUMA, las 441 columnas de
 * Excel clave por clave, el juego de campos guardados y el estado de la seccion.
 *
 * DENOMINADOR DECLARADO: las escenas `mf*` despiertan la seccion de Marfan -sindrome y
 * diametros cargados, con y sin integrar-; `vacio` y `ajeno` son los controles NEGATIVOS. Un
 * campo mudo no prueba nada al vaciarse, asi que las escenas con rasgos los cargan de verdad.
 *
 *   node scripts/_probe_marfan1ab.mjs --head <html> [--nuevo <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const HEAD = arg('--head');
const NUEVO = arg('--nuevo') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const PESADO = process.argv.indexOf('--pdf') > 0;  /* PDF y PPT: solo cuando se piden */

/* Las escenas. Cada una es un juego de campos; las claves que el arbol viejo no tiene se
   ignoran solas -asignar a un id inexistente no hace nada-, que es lo que permite comparar. */
const ESCENAS = {
  vacio:   {},
  ajeno:   { ddvi: '52', siv: '11', ao_sin: '34', fevi: '60' },
  mfBase:  { marfan_sindrome: 'marfan', marfan_ao_seno: '48', marfan_ao_ascendente: '40' },
  mfInteg: { marfan_sindrome: 'marfan', marfan_ao_seno: '48', marfan_ao_ascendente: '40', _integrar: 1 },
  mfCxI:   { marfan_sindrome: 'marfan', marfan_ao_seno: '52', marfan_ao_ascendente: '44', _integrar: 1 },
  mfLds:   { marfan_sindrome: 'lds', marfan_ao_seno: '46', _integrar: 1 },
  mfTurner:{ marfan_sindrome: 'turner', marfan_ao_ascendente: '42', _integrar: 1 },
  mfEds:   { marfan_sindrome: 'eds', marfan_ao_seno: '41', _integrar: 1 },
  mfSinS:  { marfan_ao_seno: '47', _integrar: 1 },
  /* con los rasgos del score cargados: en HEAD esos ids NO EXISTEN y se ignoran, asi que esta
     escena mide que cargarlos no mueve el papel del commit 1 */
  mfScore9:{ marfan_sindrome: 'marfan', marfan_ao_seno: '48', _integrar: 1,
             mfs_muneca_pulgar: 'ambos', mfs_pectus: 'carinatum', mfs_neumotorax: 1,
             mfs_estrias: 1, mfs_miopia: 1 },
  mfApart: { marfan_sindrome: 'marfan', marfan_ao_seno: '48', _integrar: 1,
             mfs_ectopia_lentis: 'si', mfs_historia_familiar: 'si', mfs_fbn1_causal: 'si',
             mfs_fbn1_ao: 'no', mfs_sin_otros: 'si', mfs_diseccion_raiz: 'no' }
};

const MEDIR = `(async (ESC) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return; 
    if (e.type === 'checkbox') { e.checked = (v === 1 || v === '1' || v === true) }
    else { e.value = v }
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })) };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Prueba MARFAN1'); S('ci', '586'); S('peso', '70'); S('talla', '170');
  S('sexo', 'M'); S('edad', '34');
  Object.keys(ESC).forEach(k => { if (k.charAt(0) !== '_') S(k, ESC[k]) });
  if (ESC._integrar) { const c = EL('marfan_incluir_chk');
    if (c) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })) } }
  try { if (typeof marfanSync === 'function') marfanSync() } catch (e) {}
  await new Promise(r => setTimeout(r, 420));

  R.estilos = {};
  for (const est of ['narrativo', 'esquematico', 'telegrafico']) {
    const e = EL('estilo_informe');
    if (e) { e.value = est; e.dispatchEvent(new Event('change', { bubbles: true })) }
    try { if (typeof generarInforme === 'function') generarInforme() } catch (x) { R.errs.push(est + ':' + x.message) }
    await new Promise(r => setTimeout(r, 240));
    const t = EL('informe_texto'), s = EL('en_suma');
    R.estilos[est] = { inf: t ? String(t.value || '') : 'NO', sum: s ? String(s.value || '') : 'NO' };
  }
  /* las 441 columnas de Excel, clave por clave */
  R.xls = (function(){ try {
    const blob = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      if (e.type === 'checkbox') blob[e.id + '__chk'] = e.checked ? '1' : '0'; else blob[e.id] = e.value });
    if (typeof _labExcelRow !== 'function') return { n: 'NO _labExcelRow' };
    const f = _labExcelRow({ campos: blob });
    const ks = Object.keys(f).sort();
    return { n: ks.length, v: ks.map(k => k + '=' + (f[k] === null || f[k] === undefined ? '' : f[k])).join('|') };
  } catch (e) { return { err: e.message } } })();
  /* el juego de campos guardados */
  R.campos = (function(){ const ids = [];
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return; ids.push(e.id) });
    return ids.sort().join(',') })();
  R.estado = (typeof marfanEstado === 'function') ? JSON.stringify(marfanEstado()) : 'NO';
  /* la linea de Marfan aislada, para leerla sin el resto del informe */
  R.mfLinea = String(R.estilos.narrativo.inf).split(String.fromCharCode(10))
    .filter(l => /Score sistémico|[Aa]ortopat|ectopia lentis|FBN1|historia familiar/i.test(l)).join(' // ');
  R.mfSuma = String(R.estilos.narrativo.sum).split(String.fromCharCode(10))
    .filter(l => /Score sistémico|[Aa]ortopat/i.test(l)).join(' // ');
  R.estado = (typeof marfanEstado === 'function') ? JSON.stringify(marfanEstado()) : 'NO';
  R.capsula = (function(){ const e = EL('marfan-resultado');
    return e ? String(e.textContent || '').split(' ').filter(Boolean).join(' ') : 'NO' })();
  return R;
})`;

/* ══ EL PPT, espiando a PptxGenJS. VA ANTES DEL PDF: generar el PDF deja las casillas del
   formulario en otro estado y el PPT saldria medido sobre un denominador envenenado -la
   trampa que la tanda AJUSTES-3 documenta-.
   El espia mira addText Y addTable: las filas de tabla no pasan por addText, y una sonda que
   solo mire la primera da cero sobre ellas sin que eso pruebe nada. */
const PPT = `(async () => {
  if (typeof window.PptxGenJS === 'undefined') return { err: 'SIN PPTXGENJS' };
  const Orig = window.PptxGenJS;
  const reg = { textos: [], slides: 0, tablas: 0 };
  window.PptxGenJS = function (...a) {
    const p = new Orig(...a);
    const oa = p.addSlide.bind(p);
    p.addSlide = function (...z) { reg.slides++; const s = oa(...z);
      const ot = s.addText.bind(s);
      s.addText = function (t, ...r) { reg.textos.push(JSON.stringify(t).slice(0, 400)); return ot(t, ...r) };
      if (typeof s.addTable === 'function') { const oTb = s.addTable.bind(s);
        s.addTable = function (f, ...r) { reg.tablas++;
          reg.textos.push('[TABLA] ' + JSON.stringify(f).slice(0, 6000)); return oTb(f, ...r) } }
      return s };
    p.writeFile = function () { return Promise.resolve(true) };
    p.write = function () { return Promise.resolve('') };
    return p };
  Object.keys(Orig).forEach(k => { try { window.PptxGenJS[k] = Orig[k] } catch (e) {} });
  /* ⚠️ UNA CASILLA SE PERSISTE COMO <id>__chk Y NO COMO <id>: sin esa clave, generarPPT carga
     el estudio y repone TODAS las casillas apagadas, asi que el PPT se mediria con el modulo
     sin integrar en los dos arboles. */
  const campos = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
    campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    if (e.type === 'checkbox') campos[e.id + '__chk'] = e.checked ? '1' : '0' });
  campos.informe_texto = String((document.getElementById('informe_texto') || {}).value || '');
  campos.en_suma = String((document.getElementById('en_suma') || {}).value || '');
  campos['med-nombre'] = 'Medico de prueba';
  const ESTU = { id: '__mf1__', fecha: '2026-11-01', nombre: 'AB MARFAN1', campos: campos };
  const oGI = window.getInformes, oT = window._pptElegirTema, oQ = window._pptElegirPresentador;
  window.getInformes = function () { return [ESTU] };
  window._pptElegirTema = function (cb) { return cb('dark') };
  window._pptElegirPresentador = function (i, cb) { return cb('Medico de prueba') };
  let err = null;
  try { if (typeof generarPPT === 'function') await generarPPT('__mf1__') } catch (e) { err = String(e).slice(0, 140) }
  await new Promise(r => setTimeout(r, 900));
  window.getInformes = oGI; window._pptElegirTema = oT; window._pptElegirPresentador = oQ;
  window.PptxGenJS = Orig;
  return { slides: reg.slides, tablas: reg.tablas, n: reg.textos.length, txt: reg.textos.join(' | '), err: err };
})()`;

/* ══ EL PDF generado de verdad, en sus SEIS plantillas, espiando el constructor de jsPDF. */
const PDF = `(async () => {
  const PL = ['clasico', 'moderno', 'minimalista', 'academico', 'compacto', 'elegante'];
  const r = {};
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { err: 'SIN JSPDF' };
  const Orig = window.jspdf.jsPDF;
  for (const p of PL) {
    const reg = { textos: [], nFigs: 0 };
    window.jspdf.jsPDF = function (...a) {
      const d = new Orig(...a);
      const ot = d.text.bind(d);
      d.text = function (t, x, y, ...rest) { reg.textos.push(String(t)); return ot(t, x, y, ...rest) };
      ['circle', 'line', 'rect', 'addImage', 'triangle'].forEach(m => {
        if (typeof d[m] === 'function') { const o = d[m].bind(d); d[m] = function (...z) { reg.nFigs++; return o(...z) } } });
      d.save = function () { return true }; d.output = function () { return '' };
      return d };
    Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
    try { const pl = document.getElementById('pdf_plantilla'); if (pl) { pl.value = p;
            pl.dispatchEvent(new Event('change', { bubbles: true })) } } catch (e) {}
    try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
          else if (typeof generarPDF === 'function') await generarPDF() } catch (e) { reg.err = String(e).slice(0, 110) }
    r[p] = { n: reg.textos.length, figs: reg.nFigs, txt: reg.textos.join(' | ') };
  }
  window.jspdf.jsPDF = Orig;
  return r;
})()`;

const correr = async (br, file) => {
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text().slice(0, 120)) });
  await pg.goto('file://' + file);
  await pg.waitForTimeout(1500);
  const out = {};
  for (const [nom, esc] of Object.entries(ESCENAS)) {
    try { out[nom] = await pg.evaluate(MEDIR + '(' + JSON.stringify(esc) + ')') }
    catch (e) { out[nom] = { fatal: e.message }; continue }
    if (PESADO) {
      try { out[nom]._ppt = await pg.evaluate(PPT) } catch (e) { out[nom]._ppt = { err: e.message } }
      try { out[nom]._pdf = await pg.evaluate(PDF) } catch (e) { out[nom]._pdf = { err: e.message } }
    }
  }
  out.__errs = errs;
  await ctx.close();
  return out;
};

(async () => {
  const br = await _pw.chromium.launch({ channel: 'chrome' });
  const A = await correr(br, HEAD), B = await correr(br, NUEVO);
  await br.close();
  const difs = [], denom = { escenas: 0, claves: 0, xls: 0, pptTextos: 0, pdfTextos: 0 };
  for (const nom of Object.keys(ESCENAS)) {
    const a = A[nom], b = B[nom];
    denom.escenas++;
    if (!a || !b || a.fatal || b.fatal) { difs.push([nom, 'FATAL', String(a && a.fatal), String(b && b.fatal)]); continue }
    for (const est of ['narrativo', 'esquematico', 'telegrafico']) {
      for (const cual of ['inf', 'sum']) {
        denom.claves++;
        if (a.estilos[est][cual] !== b.estilos[est][cual]) difs.push([nom, est + '.' + cual, a.estilos[est][cual], b.estilos[est][cual]]);
      }
    }
    denom.claves++; if (a.xls.n !== b.xls.n) difs.push([nom, 'xls.n', a.xls.n, b.xls.n]);
    denom.xls += (typeof a.xls.n === 'number' ? a.xls.n : 0);
    denom.claves++; if (a.xls.v !== b.xls.v) {
      const av = String(a.xls.v).split('|'), bv = String(b.xls.v).split('|');
      const d = av.filter((x, i) => x !== bv[i]).slice(0, 4);
      difs.push([nom, 'xls.v', d.join(' ;; '), '(ver)']);
    }
    denom.claves++; if (a.capsula !== b.capsula) difs.push([nom, 'capsula', a.capsula, b.capsula]);
    denom.claves++; if (a.estado !== b.estado) difs.push([nom, 'estado', a.estado, b.estado]);
    if (a._ppt && b._ppt) {
      denom.claves++; denom.pptTextos += (a._ppt.n || 0);
      if (a._ppt.txt !== b._ppt.txt) difs.push([nom, 'ppt', String(a._ppt.txt).slice(0, 200), String(b._ppt.txt).slice(0, 200)]);
      if ((a._ppt.slides || 0) === 0) difs.push([nom, 'ppt.DENOM', 'CERO diapositivas: la medicion NO vale', a._ppt.err]);
    }
    if (a._pdf && b._pdf) {
      for (const pl of Object.keys(a._pdf)) {
        denom.claves++; denom.pdfTextos += ((a._pdf[pl] || {}).n || 0);
        if (JSON.stringify(a._pdf[pl]) !== JSON.stringify(b._pdf[pl]))
          difs.push([nom, 'pdf.' + pl, String((a._pdf[pl] || {}).txt).slice(0, 200), String((b._pdf[pl] || {}).txt).slice(0, 200)]);
      }
    }
  }
  /* los campos guardados: diferencia de ids, una sola vez */
  const ca = (A.vacio.campos || '').split(','), cb = (B.vacio.campos || '').split(',');
  const nuevos = cb.filter(x => ca.indexOf(x) < 0), perdidos = ca.filter(x => cb.indexOf(x) < 0);
  console.log(JSON.stringify({ denom, nDifs: difs.length, difs: difs.slice(0, 40),
    camposHEAD: ca.length, camposNUEVO: cb.length, camposNuevos: nuevos, camposPerdidos: perdidos,
    errsHEAD: A.__errs.slice(0, 3), errsNUEVO: B.__errs.slice(0, 3) }, null, 1));
  process.exit(0);
})();
