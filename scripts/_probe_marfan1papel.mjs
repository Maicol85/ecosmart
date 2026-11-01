#!/usr/bin/env node
/**
 * _probe_marfan1papel.mjs — que el papel DESCRIBE y no diagnostica (MARFAN-1, commit 3).
 *
 * Censa las CUATRO superficies -informe en los tres estilos, EN SUMA, el PDF generado de verdad
 * en sus seis plantillas y el PPT- buscando lo que el papel NO puede decir: la regla cumplida,
 * la palabra diagnostico, el umbral de 7, la categoria, ninguna guia, tabla, clase ni folio, y
 * ninguna conducta.
 *
 * CONTROL POSITIVO OBLIGATORIO: la misma escena tiene que traer el puntaje y los rasgos. Sin el,
 * «cero marcadores» no se distingue de «el papel no dice una palabra de Marfan».
 *
 *   node scripts/_probe_marfan1papel.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const MONTAR = `(async () => {
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return;
    if (e.type === 'checkbox') e.checked = (v === 1 || v === true); else e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })) };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Prueba MARFAN1'); S('ci', '586'); S('peso', '70'); S('talla', '170');
  S('sexo', 'M'); S('edad', '34');
  S('marfan_sindrome', 'marfan'); S('marfan_ao_seno', '48'); S('marfan_ao_ascendente', '40');
  /* nueve puntos: 3 + 2 + 2 + 1 + 1 */
  S('mfs_muneca_pulgar', 'ambos'); S('mfs_pectus', 'carinatum'); S('mfs_neumotorax', 1);
  S('mfs_estrias', 1); S('mfs_miopia', 1);
  S('mfs_ectopia_lentis', 'si'); S('mfs_historia_familiar', 'si');
  S('mfs_fbn1_causal', 'si'); S('mfs_fbn1_ao', 'no'); S('mfs_sin_otros', 'si');
  const c = EL('marfan_incluir_chk');
  if (c) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })) }
  /* LA TARJETA ABIERTA con el Z: asi las reglas SI se evaluan y alguna CUMPLE. Es el escenario
     peligroso: si una regla cumplida pudiera filtrarse al papel, es aca donde pasaria. */
  try { critAbrir('marfan') } catch (e) {}
  await new Promise(r => setTimeout(r, 200));
  const z = document.querySelector('#crit-cuerpo [data-mf-z]');
  if (z) { z.value = '2.6'; z.dispatchEvent(new Event('input', { bubbles: true })) }
  await new Promise(r => setTimeout(r, 200));
  const rg = (typeof mfsReglas === 'function') ? mfsReglas() : null;
  /* tolerante al arbol VIEJO, donde nada de esto existe: la sonda sirve de control contra
     HEAD y reventar ahi la dejaria sin denominador */
  const out = { reglas: rg ? rg.reglas.map(x => x.n + ':' + x.estado).join(' ') : 'NO EXISTE',
                alguna: rg ? rg.algunaCumple : 'NO EXISTE',
                score: (typeof mfsScore === 'function') ? mfsScore().pts : 'NO EXISTE' };
  try { critCerrar() } catch (e) {}
  await new Promise(r => setTimeout(r, 150));
  return out;
})()`;

const LEER = `(async () => {
  const EL = id => document.getElementById(id);
  const R = { estilos: {} };
  for (const est of ['narrativo', 'esquematico', 'telegrafico']) {
    const e = EL('estilo_informe');
    if (e) { e.value = est; e.dispatchEvent(new Event('change', { bubbles: true })) }
    try { if (typeof generarInforme === 'function') generarInforme() } catch (x) {}
    await new Promise(r => setTimeout(r, 240));
    R.estilos[est] = { inf: String((EL('informe_texto') || {}).value || ''),
                       sum: String((EL('en_suma') || {}).value || '') };
  }
  R.linea = R.estilos.narrativo.inf.split(String.fromCharCode(10))
    .filter(l => /Score sistémico|ectopia lentis|FBN1|historia familiar|[Aa]ortopat/i.test(l));
  R.suma = R.estilos.narrativo.sum.split(String.fromCharCode(10))
    .filter(l => /Score sistémico|[Aa]ortopat/i.test(l));
  return R;
})()`;

const PPT = `(async () => {
  if (typeof window.PptxGenJS === 'undefined') return { err: 'SIN PPTXGENJS' };
  const Orig = window.PptxGenJS; const reg = { textos: [], slides: 0 };
  window.PptxGenJS = function (...a) { const p = new Orig(...a); const oa = p.addSlide.bind(p);
    p.addSlide = function (...z) { reg.slides++; const s = oa(...z); const ot = s.addText.bind(s);
      s.addText = function (t, ...r) { reg.textos.push(JSON.stringify(t)); return ot(t, ...r) };
      if (typeof s.addTable === 'function') { const oTb = s.addTable.bind(s);
        s.addTable = function (f, ...r) { reg.textos.push('[TABLA] ' + JSON.stringify(f)); return oTb(f, ...r) } }
      return s };
    p.writeFile = function () { return Promise.resolve(true) };
    p.write = function () { return Promise.resolve('') }; return p };
  Object.keys(Orig).forEach(k => { try { window.PptxGenJS[k] = Orig[k] } catch (e) {} });
  const campos = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
    campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    if (e.type === 'checkbox') campos[e.id + '__chk'] = e.checked ? '1' : '0' });
  campos.informe_texto = String((document.getElementById('informe_texto') || {}).value || '');
  campos.en_suma = String((document.getElementById('en_suma') || {}).value || '');
  campos['med-nombre'] = 'Medico de prueba';
  const E = { id: '__mf1p__', fecha: '2026-11-01', nombre: 'Papel MARFAN1', campos: campos };
  const oGI = window.getInformes, oT = window._pptElegirTema, oQ = window._pptElegirPresentador;
  window.getInformes = function () { return [E] };
  window._pptElegirTema = function (cb) { return cb('dark') };
  window._pptElegirPresentador = function (i, cb) { return cb('Medico de prueba') };
  let err = null;
  try { if (typeof generarPPT === 'function') await generarPPT('__mf1p__') } catch (e) { err = String(e).slice(0, 140) }
  await new Promise(r => setTimeout(r, 900));
  window.getInformes = oGI; window._pptElegirTema = oT; window._pptElegirPresentador = oQ;
  window.PptxGenJS = Orig;
  return { slides: reg.slides, n: reg.textos.length, txt: reg.textos.join(' | '), err: err };
})()`;

const PDF = `(async () => {
  const PL = ['clasico', 'moderno', 'minimalista', 'academico', 'compacto', 'elegante'];
  const r = {};
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { err: 'SIN JSPDF' };
  const Orig = window.jspdf.jsPDF;
  for (const p of PL) {
    const reg = { textos: [] };
    window.jspdf.jsPDF = function (...a) { const d = new Orig(...a); const ot = d.text.bind(d);
      d.text = function (t, x, y, ...rest) { reg.textos.push(String(t)); return ot(t, x, y, ...rest) };
      d.save = function () { return true }; d.output = function () { return '' }; return d };
    Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
    try { const pl = document.getElementById('pdf_plantilla'); if (pl) { pl.value = p;
            pl.dispatchEvent(new Event('change', { bubbles: true })) } } catch (e) {}
    try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
          else if (typeof generarPDF === 'function') await generarPDF() } catch (e) {}
    r[p] = { n: reg.textos.length, txt: reg.textos.join(' | ') };
  }
  window.jspdf.jsPDF = Orig;
  return r;
})()`;

(async () => {
  const br = await _pw.chromium.launch({ channel: 'chrome' });
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1500);
  const montaje = await pg.evaluate(MONTAR);
  const txt = await pg.evaluate(LEER);
  const ppt = await pg.evaluate(PPT);
  const pdf = await pg.evaluate(PDF);
  await br.close();

  /* el texto de las cuatro superficies, junto */
  const inf = ['narrativo', 'esquematico', 'telegrafico'].map(k => txt.estilos[k].inf).join(' ');
  const sum = ['narrativo', 'esquematico', 'telegrafico'].map(k => txt.estilos[k].sum).join(' ');
  const pdfTxt = Object.keys(pdf).filter(k => k !== 'err').map(k => pdf[k].txt).join(' ');
  const SUP = { informe: inf, enSuma: sum, pdf: pdfTxt, ppt: String(ppt.txt || '') };

  const PROHIBIDO = ['Ghent', 'Loeys', 'J Med Genet', 'folio', 'Box 1', 'Box 2', 'Clase I',
    'Clase II', 'Nivel B', 'Nivel C', 'ESC 2024', 'Tabla 62', 'diagnóstic', 'Diagnóstic',
    'cumple', 'Cumple', 'criterio de Marfan', 'compromiso sistémico', 'de 20', 'sobre 20',
    'umbral', 'se recomienda', 'debe considerarse', 'MASS', 'ectopia lentis syndrome'];
  const censo = {};
  for (const [sup, t] of Object.entries(SUP)) {
    censo[sup] = {};
    for (const m of PROHIBIDO) { const n = t.split(m).length - 1; if (n) censo[sup][m] = n }
  }
  /* CONTROL POSITIVO: lo que SI tiene que estar */
  const DEBE = ['Score sistémico de 9 puntos', 'pectus carinatum', 'neumotórax espontáneo',
    'ectopia lentis presente', 'historia familiar presente', 'variante de FBN1 causal presente'];
  const positivo = {}, falta = {};
  for (const [sup, t] of Object.entries(SUP)) {
    /* ⚠️ SIN DISTINGUIR MAYUSCULAS: la app escribe «Ectopia lentis presente» al INICIO de
       oracion y la primera version de este control la buscaba en minuscula, asi que daba 5/6
       sobre un papel que la trae. Era un falso negativo de la sonda, no de la app. */
    const tl = t.toLowerCase();
    const hay = DEBE.filter(d => tl.indexOf(d.toLowerCase()) >= 0);
    positivo[sup] = hay.length + '/' + DEBE.length;
    falta[sup] = DEBE.filter(d => hay.indexOf(d) < 0);
  }
  console.log(JSON.stringify({ montaje, lineaInforme: txt.linea, lineaSuma: txt.suma,
    denom: { informe: inf.length, enSuma: sum.length, pdf: pdfTxt.length, ppt: String(ppt.txt || '').length,
             pptSlides: ppt.slides, pdfPlantillas: Object.keys(pdf).length },
    censoProhibido: censo, controlPositivo: positivo, faltaEnPositivo: falta, errs }, null, 1));
  process.exit(0);
})();
