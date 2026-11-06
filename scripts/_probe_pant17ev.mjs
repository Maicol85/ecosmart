/*
 * _probe_pant17ev.mjs - PANT-17: mide las secciones de Evidencia que la tanda toca o crea.
 * Por escenario: abre el panel por su boton real, apaga transiciones y cuenta, para cada
 * seccion de primer nivel, las preguntas de tres estados, cuantas vienen PRE-RESPONDIDAS del
 * estudio, las guias nombradas, los folios, las entradas de bibliografia y las formas que la
 * regla del 04/11 prohibe. Mide ademas la geometria del panel a los cuatro anchos y el PAPEL.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant17ev.mjs --file <index.html> --out <json> [--esc <clave>]
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p17ev.json';
const SOLO = arg('--esc');

const ESCENAS = {
  dap:  { dap_tipo: 'no_restrictivo', dap_diam: '4', dap_dir: 'id' },
  dapDI:{ dap_tipo: 'no_restrictivo', dap_diam: '4', dap_dir: 'di' },
  dapBI:{ dap_tipo: 'no_restrictivo', dap_diam: '4', dap_dir: 'bi' },
  coa:  { coa_vmax: '3.2', coa_situacion: 'nativa', coa_hta: 'si',
          coa_gradiente_picopico: '28', coa_estenosis_relativa: '60' },
  coaNO:{ coa_vmax: '3.2', coa_situacion: 'nativa', coa_hta: 'no',
          coa_gradiente_picopico: '12', coa_estenosis_relativa: '30' },
  coaVac:{ coa_vmax: '3.2' },
  tdf:  { tdf_sintomas: 'si' },
  ep:   { vp_gmax: '70' },
  vab:  { vab_tipo: 'fused_rl', ao_tub: '50' },
  mch:  { mch_grad_reposo: '60' },
  vap:  { vap_tipo: 'i', vap_diam: '8' },
  cia:  { ete_cia_tipo: 'secundum', ete_cia_tam_max: '18' },
  ajeno:{ fevi: '60', ddvi: '48' }
};
/* Las formas que la regla del 04/11 prohibe. Se buscan sobre textContent de cada seccion. */
const PROHIBIDAS = ['no coincid', 'difieren', 'discrepan', 'se contradicen', 'no se encontr',
  'ninguna fuente', 'ninguna gu', 'no publica', 'sin resolver', 'pendiente de revisi',
  'sin validar', 'a confirmar por'];

const MEDIR = (campos, prohib) => '(() => {\n'
  + '  var C = ' + JSON.stringify(campos) + ', PROH = ' + JSON.stringify(prohib) + ';\n'
  + '  ["modalAvisoEco","login-overlay"].forEach(function (id) { var m = document.getElementById(id); if (m) m.style.display = "none" });\n'
  + '  try { if (typeof limpiarCampos === "function") limpiarCampos(true) } catch (e) {}\n'
  + '  Object.keys(C).forEach(function (k) { var e = document.getElementById(k); if (!e) return;\n'
  + '    if (e.type === "checkbox") { e.checked = (C[k] === "1" || C[k] === true) } else { e.value = C[k] }\n'
  + '    e.dispatchEvent(new Event("input", { bubbles: true }));\n'
  + '    e.dispatchEvent(new Event("change", { bubbles: true })) });\n'
  + '  Object.keys(window).forEach(function (k) { if (/^calc[A-Z]/.test(k) && typeof window[k] === "function") {\n'
  + '    try { window[k]() } catch (e) {} } });\n'
  + '  try { if (typeof indicCerrar === "function") indicCerrar() } catch (e) {}\n'
  + '  try { indicAbrir() } catch (e) { return { error: String(e).slice(0, 120) } }\n'
  + '  document.querySelectorAll("*").forEach(function (e) { e.style.transition = "none"; e.style.animation = "none" });\n'
  + '  var cuerpo = document.getElementById("indic-cuerpo");\n'
  + '  if (!cuerpo) return { error: "sin panel" };\n'
  + '  var secs = [];\n'
  + '  Array.prototype.slice.call(cuerpo.querySelectorAll("details")).filter(function (d) {\n'
  + '    return !d.parentElement.closest("details");\n'
  + '  }).forEach(function (d) {\n'
  + '    /* ⚠️ SE ABREN TODAS. Una seccion que nace CERRADA mide 175 px de cuerpo haya lo que\n'
  + '       haya adentro, asi que el alto del contenido se lee igual antes y despues y la\n'
  + '       medicion no prueba nada. Abrirlas no cambia los conteos -el DOM esta igual- y es lo\n'
  + '       unico que hace comparable el alto del contenido. */\n'
  + '    d.open = true;\n'
  + '    var sum = d.querySelector("summary");\n'
  + '    var tit = sum ? (sum.textContent || "").trim().slice(0, 72) : "(sin summary)";\n'
  + '    var tall = d.textContent || "";\n'
  + '    /* UNA PREGUNTA = una botonera de tres estados. Se cuentan las botoneras y no los\n'
  + '       botones: el divisor fijo de 3 se rompe el dia que una botonera tenga dos opciones. */\n'
  + '    var bots = Array.prototype.slice.call(d.querySelectorAll("button, [role=button], .ind-ctrl-b"));\n'
  + '    var padres = [];\n'
  + '    bots.forEach(function (b) {\n'
  + '      var t = (b.textContent || "").trim();\n'
  + '      if (!/^(S\\u00ed|No|\\?)$/.test(t)) return;\n'
  + '      var p = b.parentElement; if (!p) return;\n'
  + '      /* Por IDENTIDAD del nodo y no por una clave de texto: todas las botoneras comparten\n'
  + '         la clase ind-ctrl-fila y son el unico hijo de su celda, asi que cualquier clave\n'
  + '         armada con className + indice las colapsa en UNA. Costo una medicion. */\n'
  + '      if (padres.indexOf(p) < 0) padres.push(p);\n'
  + '    });\n'
  + '    var preg = padres.length;\n'
  + '    /* PRE-RESPONDIDAS: el molde marca la fila leida del estudio con un texto propio. */\n'
  + '    var marcados = 0;\n'
  + '    bots.forEach(function (b) {\n'
  + '      var t = (b.textContent || "").trim();\n'
  + '      if (!/^(S\\u00ed|No|\\?)$/.test(t)) return;\n'
  + '      if (b.getAttribute("aria-pressed") === "true" || /\\bon\\b|activo|sel/.test(b.className)) marcados++;\n'
  + '    });\n'
  + '    var nC = function (re) { return (tall.match(re) || []).length };\n'
  + '    var guias = [];\n'
  + '    [["ESC 2020",/ESC 2020/],["ACC\\/AHA 2025",/ACC\\/AHA 2025/],["ESC 2024",/ESC 2024/],\n'
  + '     ["ESC 2023",/ESC 2023/],["AHA\\/ACC 2024",/AHA\\/ACC 2024/],["ESC\\/EACTS 2025",/ESC\\/EACTS 2025/],\n'
  + '     ["AHA\\/ASA 2021",/AHA\\/ASA 2021/],["ESC\\/ERS 2022",/ESC\\/ERS 2022/]].forEach(function (g) {\n'
  + '       if (g[1].test(tall)) guias.push(g[0]) });\n'
  + '    var folios = (tall.match(/folios? [e]?[0-9]+/g) || []);\n'
  + '    var fset = {}; folios.forEach(function (f) { fset[f] = 1 });\n'
  + '    var bad = [];\n'
  + '    PROH.forEach(function (p) { if (tall.toLowerCase().indexOf(p) > -1) bad.push(p) });\n'
  + '    var grid = d.querySelector("[data-ind-compacta]");\n'
  + '    secs.push({ tit: tit, largo: tall.length, preg: preg, marcados: marcados,\n'
  + '      citas: nC(/\\[[0-9]+\\]/g), clases: nC(/Clase [0-9IV]/g),\n'
  + '      bib: (tall.match(/\\[[0-9]+\\] [A-Z]/g) || []).length,\n'
  + '      guias: guias, folios: Object.keys(fset).sort(),\n'
  + '      compacta: !!grid, esPreg: grid ? (grid.getAttribute("data-ind-preg") === "1") : false,\n'
  + '      prohibidas: bad });\n'
  + '  });\n'
  + '  var card = document.getElementById("indic-card");\n'
  + '  var rc = card ? card.getBoundingClientRect() : null;\n'
  + '  return { nSecs: secs.length, secs: secs,\n'
  + '    panel: rc ? { w: Math.round(rc.width), h: Math.round(rc.height) } : null,\n'
  + '    cuerpoAlto: cuerpo.clientHeight, cuerpoScroll: cuerpo.scrollHeight,\n'
  + '    scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth };\n'
  + '})()';

/* El PAPEL: la Evidencia no puede llegar a ninguna superficie firmada. */
const PAPEL = '(() => {\n'
  + '  var out = {};\n'
  + '  try { if (typeof generarInforme === "function") generarInforme() } catch (e) {}\n'
  + '  ["informe_texto","en_suma"].forEach(function (id) { var e = document.getElementById(id);\n'
  + '    out[id] = e ? String(e.value || e.textContent || "") : "" });\n'
  + '  var t = Object.keys(out).map(function (k) { return out[k] }).join("\\n");\n'
  + '  var m = {};\n'
  + '  ["Clase I","Clase 1","Nivel ","folio","Recomendaciones que aplican","ACC/AHA","ESC 20"].forEach(function (p) {\n'
  + '    m[p] = (t.split(p).length - 1) });\n'
  + '  return { largo: t.length, marcadores: m };\n'
  + '})()';

const ANCHOS = [1440, 1000, 768, 390];
const res = { file: FILE, escenas: {}, geo: [], errs: [] };
const br = await _pw.chromium.launch({ channel: 'chrome' });
try {
  const pg = await br.newPage({ viewportSize: { width: 1440, height: 900 } });
  pg.on('pageerror', e => res.errs.push(String(e).slice(0, 140)));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1200);
  for (const [k, campos] of Object.entries(ESCENAS)) {
    if (SOLO && k !== SOLO) continue;
    try {
      res.escenas[k] = { medida: await pg.evaluate(MEDIR(campos, PROHIBIDAS)) };
      res.escenas[k].papel = await pg.evaluate(PAPEL);
    } catch (e) { res.escenas[k] = { error: String(e).slice(0, 160) } }
  }
  /* Geometria CON LA SECCION ABIERTA: sin volver a sembrar en cada ancho, el panel que se mide
     es el de la ULTIMA escena del bucle de arriba, que puede no abrir ninguna seccion — un
     denominador vacio que se lee como "no cambio nada". */
  const GEOESC = arg('--geo') || 'coa';
  for (const W of ANCHOS) {
    await pg.setViewportSize({ width: W, height: 900 });
    await pg.waitForTimeout(220);
    /* ⚠️ LA GEOMETRIA SE LEE DENTRO DEL MISMO evaluate QUE ABRE EL PANEL. Leerla en una
       llamada aparte, aunque sea 160 ms despues, devolvia un panel de 283 px de alto con la
       seccion de la coartacion abierta: un denominador vacio que se lee como "no cambio nada". */
    try {
      const m = await pg.evaluate(MEDIR(ESCENAS[GEOESC] || {}, PROHIBIDAS));
      if (m && !m.error) res.geo.push({ W: W, esc: GEOESC, nSecs: m.nSecs, panel: m.panel,
        cuerpoAlto: m.cuerpoAlto, cuerpoScroll: m.cuerpoScroll, scrollX: m.scrollX });
      else res.errs.push('geo ' + W + ': ' + ((m && m.error) || 'sin medida'));
    } catch (e) { res.errs.push('geo ' + W + ': ' + String(e).slice(0, 90)) }
  }
} finally { await br.close() }
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('OK', OUTF);
