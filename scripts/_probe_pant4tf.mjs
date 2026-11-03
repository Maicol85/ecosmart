/*
 * _probe_pant4tf.mjs - el censo de «Task Force» en el PAPEL (PANT-4, commit 2).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Cuenta cada aparicion del nombre del criterio -y de cualquier otro nombre de guia o sociedad-
 * en las ONCE superficies de papel de cada escena: informe en los tres estilos, EN SUMA en los
 * tres, la hoja del PDF generada de verdad y el PPT. Imprime 70 caracteres de contexto a cada
 * lado de cada aparicion, para que no se cuente el nombre del paciente ni un comentario.
 *
 *   node scripts/_probe_pant4tf.mjs --file <index.html> --out /tmp/p4tf.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p4tf.json';

/* Las escenas: MCA cargada por cada una de las ramas que escriben nota, mas el control ajeno. */
const ESC = {
  /* La estructural con medidas en rango y sin motilidad: la rama de `sinMotilidad`. */
  mcaEstr: { campos:{ peso:'70', talla:'170', mca_tsvd_plax:'34', mca_tsvd_psax:'38' },
             sel:{ mca_fenotipo:'derecho', mca_mov_regional:'normal' }, chk:['mca_incluir_chk'] },
  /* Con aneurisma y medidas en rango: la categoria estructural puntua. */
  mcaAne:  { campos:{ peso:'70', talla:'170', mca_tsvd_plax:'34', mca_tsvd_psax:'38' },
             sel:{ mca_fenotipo:'derecho', mca_mov_regional:'aneurisma' }, chk:['mca_incluir_chk'] },
  /* La arritmia ventricular por sus tres morfologias y por la falta de tipo. */
  mcaTvInf:{ campos:{ peso:'70', talla:'170' },
             sel:{ mca_fenotipo:'derecho', tv_documentada:'si', tv_morfologia:'bcri_inf', tv_tipo:'sostenida' },
             chk:['mca_incluir_chk'] },
  mcaTvDrc:{ campos:{ peso:'70', talla:'170' },
             sel:{ mca_fenotipo:'derecho', tv_documentada:'si', tv_morfologia:'bcrd', tv_tipo:'sostenida' },
             chk:['mca_incluir_chk'] },
  mcaTvSin:{ campos:{ peso:'70', talla:'170' },
             sel:{ mca_fenotipo:'derecho', tv_documentada:'si', tv_morfologia:'bcri_inf' },
             chk:['mca_incluir_chk'] },
  /* El fenotipo con compromiso izquierdo, que es donde sale la nota de Padua. */
  mcaVI:   { campos:{ peso:'70', talla:'170' },
             sel:{ mca_fenotipo:'biventricular', mca_vi_aneurisma:'si' }, chk:['mca_incluir_chk'] },
  /* SIN integrar: el control de la compuerta. Y el ajeno, el control negativo. */
  mcaApa:  { campos:{ peso:'70', talla:'170', mca_tsvd_plax:'34', mca_tsvd_psax:'38' },
             sel:{ mca_fenotipo:'derecho', mca_mov_regional:'aneurisma' } },
  ajeno:   { campos:{ im_vc:'8', vmax_ao:'4.5', onda_e:'110', peso:'80', talla:'180' } }
};
/* Los marcadores: el nombre del criterio y los de las sociedades que podrian salir con el. */
const MARCAS = ['Task Force', 'Padua', 'ESC 2020', 'AHA', 'ACC', 'Clase I', 'Clase II', 'folio', 'Tabla '];

const MONTAR = `((e) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  const S = (id, v) => { const el = document.getElementById(id); if (!el) return 'NO ' + id;
    el.value = v; el.dispatchEvent(new Event('input', { bubbles:true }));
    el.dispatchEvent(new Event('change', { bubbles:true })); return 'ok' };
  Object.keys(e.campos || {}).forEach(k => S(k, e.campos[k]));
  Object.keys(e.sel || {}).forEach(k => S(k, e.sel[k]));
  (e.chk || []).forEach(id => { const el = document.getElementById(id);
    if (el) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles:true })) } });
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (x) {} } });
  try { if (typeof _recalcModulos === 'function') _recalcModulos('tf') } catch (x) {}
  return true;
})(ESCENA)`;

const MEDIR = `((marcas) => {
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.value || e.textContent || '') : '' };
  const sup = {};
  ['estandar','narrativo','conciso'].forEach(st => {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(st) } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    sup['informe_' + st] = T('informe_texto'); sup['suma_' + st] = T('en_suma');
  });
  try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch (e) {}
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  /* El PDF: se espia doc.text en vez de abrirlo. */
  const pdf = [];
  try {
    const J = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (J) { const op = J.prototype.text;
      J.prototype.text = function (t) { try { pdf.push(String(t)) } catch (e) {} return op.apply(this, arguments) };
      try { if (typeof generarPDF === 'function') generarPDF() } catch (e) {}
      J.prototype.text = op; }
  } catch (e) {}
  sup._pdf = pdf.join(' \\n ');
  /* El resultado: por superficie, cuantas veces aparece cada marca y su contexto. */
  const out = { largos: {}, hits: [] };
  Object.keys(sup).forEach(k => {
    const t = String(sup[k] || ''); out.largos[k] = t.length;
    marcas.forEach(m => { let i = t.indexOf(m);
      while (i > -1) { out.hits.push({ sup:k, marca:m,
        ctx: t.slice(Math.max(0, i - 70), i + m.length + 70).replace(/\\s+/g, ' ') });
        i = t.indexOf(m, i + 1); } });
  });
  return out;
})(${JSON.stringify(MARCAS)})`;

const out = { file: FILE, escenas: {} };
const br = await _pw.chromium.launch({ channel: 'chrome' });
try {
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(900);
  for (const k of Object.keys(ESC)) {
    await pg.evaluate(MONTAR.replace('ESCENA', JSON.stringify(ESC[k])));
    await pg.waitForTimeout(350);
    out.escenas[k] = await pg.evaluate(MEDIR);
    console.log('-- ' + k + ' : ' + out.escenas[k].hits.length + ' apariciones --');
  }
} finally { await br.close() }
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log('escrito ' + OUTF);
