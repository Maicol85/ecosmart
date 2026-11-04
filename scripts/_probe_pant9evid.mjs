/*
 * _probe_pant9evid.mjs - PANT-9, commit 9: el inventario de SOLO LECTURA de la Evidencia de las
 * secciones de congenitas. Para cada seccion del registro siembra su escenario, abre el panel y
 * mide: si la seccion abre, cuantas preguntas de tres estados tiene, que guias nombra, cuantas
 * citas y que folios, que filas de datos del estudio publica, si lleva el molde compacto, y la
 * geometria del panel a los cuatro anchos. No escribe nada: es solo lectura.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant9evid.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p9evid.json';

/* Las semillas: las mismas que TC-322 usa para abrir cada seccion. Solo las de congenitas y las
   que una congenita puede abrir. */
const SEMILLAS = [
  ['Estenosis pulmonar', { vp_gmax: '70' }],
  ['Comunicacion interauricular', { ete_cia_tipo: 'secundum', ete_cia_tam_max: '18' }],
  ['Comunicacion interventricular', { ete_civ_tipo: 'perimembranosa' }],
  ['Ductus arterioso permeable', { dap_tipo: 'no_restrictivo', dap_diam: '4' }],
  ['Coartacion de aorta', { coa_vmax: '3.2' }],
  ['Estenosis subaortica', { esub_tipo: 'membrana', esub_gradiente_medio: '45' }],
  ['Estenosis supravalvular aortica', { easv_tipo: 'reloj', easv_gradiente_medio: '45' }],
  ['Foramen oval permeable', { fop_shunt_valsalva: 'si', fop_burbujas: 'abundante', fop_acv: 'si', edad: '45' }],
  ['Miocardiopatia hipertrofica obstructiva', { mch_grad_reposo: '60' }],
  ['Miocardiopatia hipertrofica prevencion', { mch_aneurisma_apical: 'si' }],
  ['Transposicion de grandes arterias', { tga_tipo: 'mustard' }],
  ['Tetralogia de Fallot reparada', { tdf_sintomas: 'si' }],
  ['Valvula aortica bicuspide aorta', { ao_tub: '50', va_morf: 'Bicúspide' }],
  ['Valvula aortica bicuspide conclusion', { vab_tipo: 'fused_rl', ao_tub: '50' }],
  /* Las SEIS pantallas que esta tanda redisenia y que NO tienen Evidencia: la siembra existe
     para probar que, con la pantalla cargada, el panel NO abre ninguna seccion propia. */
  ['SIN EVIDENCIA ebstein', { peso: '70', talla: '170', ebs_desplazamiento: '22', ebs_atrializacion: '40' }],
  ['SIN EVIDENCIA eisenmenger', { eis_lesion_base: 'civ', eis_saturacion_reposo: '84', eis_psap: '95' }],
  ['SIN EVIDENCIA fontan', { fontan_tipo: 'tunel', fontan_saturacion: '90' }],
  ['SIN EVIDENCIA dsav', { dsav_tipo: 'completo', dsav_qp_qs: '2.1' }],
  ['SIN EVIDENCIA cvpa', { cvpa_venas_numero: '2', cvpa_conexion: 'vcs' }],
  ['SIN EVIDENCIA vap', { vap_tipo: 'i', vap_diam: '8' }]
];

const MEDIR = (campos) => '(() => {\n'
  + '  var C = ' + JSON.stringify(campos) + ';\n'
  + '  ["modalAvisoEco","login-overlay"].forEach(function (id) { var m = document.getElementById(id); if (m) m.style.display = "none" });\n'
  + '  try { if (typeof limpiarCampos === "function") limpiarCampos(true) } catch (e) {}\n'
  + '  Object.keys(C).forEach(function (k) { var e = document.getElementById(k); if (!e) return;\n'
  + '    e.value = C[k]; e.dispatchEvent(new Event("input", { bubbles: true }));\n'
  + '    e.dispatchEvent(new Event("change", { bubbles: true })) });\n'
  + '  Object.keys(window).forEach(function (k) { if (/^calc[A-Z]/.test(k) && typeof window[k] === "function") {\n'
  + '    try { window[k]() } catch (e) {} } });\n'
  + '  try { if (typeof indicCerrar === "function") indicCerrar() } catch (e) {}\n'
  + '  try { indicAbrir() } catch (e) { return { error: String(e).slice(0, 110) } }\n'
  + '  document.querySelectorAll("*").forEach(function (e) { e.style.transition = "none"; e.style.animation = "none" });\n'
  + '  var card = document.getElementById("indic-card");\n'
  + '  var cuerpo = document.getElementById("indic-cuerpo");\n'
  + '  if (!card || !cuerpo) return { error: "sin panel" };\n'
  + '  var rc = card.getBoundingClientRect();\n'
  + '  var secs = [];\n'
  + '  /* SOLO las secciones de PRIMER NIVEL: los details anidados son las tarjetas de los\n'
  + '     terminos del glosario, y contarlas daba 28 secciones donde hay dos. */\n'
  + '  Array.prototype.slice.call(cuerpo.querySelectorAll("details")).filter(function (d) {\n'
  + '    return d.parentElement === cuerpo || (d.parentElement && d.parentElement.parentElement === cuerpo && !d.parentElement.closest("details"));\n'
  + '  }).forEach(function (d) {\n'
  + '    var sum = d.querySelector("summary");\n'
  + '    var tit = sum ? (sum.textContent || "").trim().slice(0, 70) : "(sin summary)";\n'
  + '    var txt = d.innerText || "";\n'
  + '    /* El censo de guias, folios y citas va sobre textContent y NO sobre innerText: un\n'
  + '       details CERRADO -las tarjetas de los globos- no aporta innerText, asi que contar\n'
  + '       ahi daba cero guias en secciones que si las nombran. */\n'
  + '    var tall = d.textContent || "";\n'
  + '    var nC = function (re) { return (tall.match(re) || []).length };\n'
  + '    /* preguntas de tres estados: una fila con su botonera */\n'
  + '    var preg = d.querySelectorAll("[data-ind-preg-fila]").length;\n'
  + '    if (!preg) preg = d.querySelectorAll("[data-ind-ctrl]").length;\n'
  + '    if (!preg) { var n = 0; d.querySelectorAll("button").forEach(function (b) {\n'
  + '      if (/^(S\\u00ed|No|\\?)$/.test((b.textContent || "").trim())) n++ }); preg = Math.round(n / 3) }\n'
  + '    var folios = (tall.match(/folio[s]? [0-9e.\\u2013-]+/gi) || []);\n'
  + '    var hojas = (tall.match(/hoja [0-9]+/gi) || []);\n'
  + '    var guias = [];\n'
  + '    ["ESC 2020","ESC 2024","ESC 2023","ESC/EACTS 2025","ESC/ERS 2022","ACC/AHA 2025",'
  + '     "AHA/ACC 2024","AHA/ASA 2021","ASE 2024","ASE 2025","ASE 2019","ASE 2020"].forEach(function (g) {\n'
  + '      if (tall.indexOf(g) > -1) guias.push(g) });\n'
  + '    var datos = [];\n'
  + '    d.querySelectorAll(".ind-datos > div").forEach(function (x) { datos.push((x.textContent || "").trim().slice(0, 40)) });\n'
  + '    var grid = d.querySelector("[data-ind-grid]");\n'
  + '    secs.push({ tit: tit, largo: txt.length, preg: preg,\n'
  + '      citas: nC(/\\[[0-9]+\\]/g), guias: guias, folios: folios.slice(0, 12), hojas: hojas.slice(0, 8),\n'
  + '      bib: (tall.match(/\\[[0-9]+\\] [A-Z]/g) || []).length, datos: datos.slice(0, 14),\n'
  + '      compacta: grid ? (grid.getAttribute("data-ind-compacta") === "1") : false,\n'
  + '      dos: grid ? (grid.getAttribute("data-ind-dos") === "1") : false,\n'
  + '      esPreg: grid ? (grid.getAttribute("data-ind-preg") === "1") : false });\n'
  + '  });\n'
  + '  return { nSecs: secs.length, secs: secs,\n'
  + '    panel: { w: Math.round(rc.width), h: Math.round(rc.height) },\n'
  + '    cuerpoScroll: cuerpo.scrollHeight, cuerpoAlto: Math.round(cuerpo.getBoundingClientRect().height) };\n'
  + '})()';

/* El papel: la Evidencia no deberia llegar. Se mide el informe y el EN SUMA con la seccion
   sembrada y se busca la marca de una recomendacion de la propia Evidencia. */
const PAPEL = '(() => {\n'
  + '  try { if (typeof indicCerrar === "function") indicCerrar() } catch (e) {}\n'
  + '  var o = {};\n'
  + '  try { generarInforme() } catch (e) { o.err = String(e).slice(0, 80) }\n'
  + '  var inf = (document.getElementById("informe_texto") || {}).value || "";\n'
  + '  var sum = (document.getElementById("en_suma") || {}).value || "";\n'
  + '  o.infLargo = inf.length; o.sumLargo = sum.length;\n'
  + '  var marcas = ["Clase I","Clase II","Nivel B","Nivel C","folio","Recomendaciones que aplican"];\n'
  + '  o.marcas = {};\n'
  + '  marcas.forEach(function (m) { o.marcas[m] = (inf.indexOf(m) > -1) || (sum.indexOf(m) > -1) });\n'
  + '  return o;\n'
  + '})()';

const out = { file: FILE, semillas: {}, geo: [], errs: [] };
try {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => out.errs.push('PAGE:' + String(e).slice(0, 110)));
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(900);
  for (const s of SEMILLAS) {
    const r = await pg.evaluate(MEDIR(s[1]));
    const pap = await pg.evaluate(PAPEL);
    out.semillas[s[0]] = { medida: r, papel: pap };
    await pg.waitForTimeout(60);
  }
  await ctx.close();
  /* la geometria del panel a los cuatro anchos, con una seccion de congenitas sembrada */
  for (const W of [1440, 1000, 768, 390]) {
    const c2 = await b.newContext({ viewport: { width: W, height: 900 } });
    const p2 = await c2.newPage();
    await p2.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await p2.waitForTimeout(900);
    const r = await p2.evaluate(MEDIR({ ete_cia_tipo: 'secundum', ete_cia_tam_max: '18' }));
    out.geo.push({ W, panel: r.panel, nSecs: r.nSecs, cuerpoAlto: r.cuerpoAlto, cuerpoScroll: r.cuerpoScroll });
    await c2.close();
  }
  await b.close();
} catch (e) { out.error = String(e).slice(0, 300) }
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log('OK ' + OUTF + (out.error ? ' ERR ' + out.error : ''));
