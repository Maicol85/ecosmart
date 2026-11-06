/**
 * _probe_pant17ctrl.mjs — EL CONTROL DE LAS SECCIONES DE EVIDENCIA (PANT-17, commit 8).
 *
 * Censa, seccion por seccion, QUE CLASES publica hoy cada una: cuantas lineas de Clase I y
 * cuantas de Clase III, con su texto. Es la mitad MEDIBLE del control que el punto 8 pide —la
 * otra mitad es leer en imagen la tabla de cada guia y comparar, y eso se declara en P17-c—.
 *
 * Llama a las funciones de `IND_SECS` DIRECTAMENTE y por su nombre pelado: son `const` de
 * nivel de script y viven en el ambito lexico global, asi que `window.IND_SECS` corta y la
 * medicion sale sobre un denominador vacio —es la leccion que PANT-13 pago con `_cm3d`—.
 *
 *   node scripts/_probe_pant17ctrl.mjs --file <index.html> --out <json>
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let _pw; try { _pw = require(process.env.HOME + '/.pwtmp/node_modules/playwright') }
catch (e) { console.log('SIN PLAYWRIGHT'); process.exit(0) }
const RAIZ = process.cwd();
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p17ctrl.json';

/* Un estudio que abre TODAS las congenitas a la vez. No se busca que sea un paciente posible
   —no lo es—: se busca el DENOMINADOR, o sea que ninguna seccion quede sin medir. */
const SEMBRAR = {
  ete_cia_tipo:'secundum', ete_cia_tam_max:'18', ete_cia_dir:'id',
  ete_civ_tipo:'perimembranosa', ete_civ_tam:'8', ete_civ_dir:'id',
  tga_tipo:'cctga', tga_cirugia:'ninguna',
  dsav_tipo:'completo', dsav_vi:'55',
  ebs_desplazamiento:'12', ebs_func_vd:'moderada', ebs_sintomas:'si',
  fontan_tipo:'ext', fontan_clase_nyha:'ii', fontan_it_grado:'2',
  cvpa_venas_numero:'1', cvpa_conexion:'vcs', cvpa_htp:'no',
  eis_lesion_base:'civ', eis_clase_nyha:'iii', eis_saturacion_reposo:'84',
  mch_grad_reposo:'60', mch_siv:'22', mch_sincope:'si',
  fop_shunt_reposo:'si', fop_burbujas:'si', fop_tunel:'9',
  dap_tipo:'no_restrictivo', dap_diam:'4', dap_dir:'id',
  coa_vmax:'3.2', coa_situacion:'nativa', coa_hta:'si',
  vap_tipo:'i', vap_diam:'8',
  vab_tipo:'fused_rl', ao_tub:'50',
  tdf_sintomas:'si', vp_gmax:'70'
};

const CENSO = (campos) => '(() => {\n'
  + '  var C = ' + JSON.stringify(campos) + ';\n'
  + '  ["modalAvisoEco","login-overlay"].forEach(function (id) { var m = document.getElementById(id); if (m) m.style.display = "none" });\n'
  + '  try { if (typeof limpiarCampos === "function") limpiarCampos(true) } catch (e) {}\n'
  + '  Object.keys(C).forEach(function (k) { var e = document.getElementById(k); if (!e) return;\n'
  + '    e.value = C[k];\n'
  + '    e.dispatchEvent(new Event("input", { bubbles: true }));\n'
  + '    e.dispatchEvent(new Event("change", { bubbles: true })) });\n'
  + '  Object.keys(window).forEach(function (k) { if (/^calc[A-Z]/.test(k) && typeof window[k] === "function") {\n'
  + '    try { window[k]() } catch (e) {} } });\n'
  + '  var out = [], secs = null;\n'
  + '  try { secs = IND_SECS } catch (e) { return { error: "sin IND_SECS: " + String(e).slice(0, 80) } }\n'
  + '  secs.forEach(function (S) {\n'
  + '    var r = null, err = null;\n'
  + '    try { r = S.fn() } catch (e) { err = String(e).slice(0, 90) }\n'
  + '    if (err) { out.push({ tit: S.tit, err: err }); return }\n'
  + '    if (!r) { out.push({ tit: S.tit, abre: false }); return }\n'
  + '    var txt = [];\n'
  + '    (r.bloques || []).forEach(function (b) { (b.lineas || []).forEach(function (l) { if (l && l.txt) txt.push(l.txt) }) });\n'
  + '    (r.clinica || []).forEach(function (f) { if (f && f.nota) txt.push(f.nota) });\n'
  + '    (r.filas || []).forEach(function (f) { if (f && f.nota) txt.push(f.nota) });\n'
  + '    if (r.guia && r.guia.txt) txt.push(r.guia.txt);\n'
  + '    (r.notas || []).forEach(function (t) { txt.push(String(t)) });\n'
  + '    var uno = txt.join("\\n");\n'
  + '    var cI = [], cIII = [], cOtra = 0;\n'
  + '    txt.forEach(function (t) {\n'
  + '      /* Clase I y Clase 1 son la misma clase escrita por dos sociedades; Clase III y\n'
  + '         Clase 3 tambien. Se excluyen II/IIa/IIb y 2/2a/2b con el limite de palabra. */\n'
  + '      if (/Clase (I|1)(?![IVab0-9])/.test(t)) cI.push(t.slice(0, 190));\n'
  + '      if (/Clase (III|3)(?![IVab0-9])/.test(t)) cIII.push(t.slice(0, 190));\n'
  + '      if (/Clase (IIa|IIb|II|2a|2b|2)(?![IVab0-9])/.test(t)) cOtra++;\n'
  + '    });\n'
  + '    out.push({ tit: S.tit, abre: true, preguntas: !!r.preguntas, compacta: !!r.compacta,\n'
  + '      nPreg: (r.clinica || []).filter(function (f) { return f && f.ops }).length,\n'
  + '      nI: cI.length, nIII: cIII.length, nII: cOtra,\n'
  + '      folios: (uno.match(/folios? [e]?[0-9]+/g) || []).filter(function (v, i, a) { return a.indexOf(v) === i }).sort(),\n'
  + '      lineasI: cI, lineasIII: cIII });\n'
  + '  });\n'
  + '  return { n: out.length, secs: out };\n'
  + '})()';

const res = { file: FILE, errs: [] };
const br = await _pw.chromium.launch({ channel: 'chrome' });
try {
  const pg = await br.newPage({ viewportSize: { width: 1440, height: 900 } });
  pg.on('pageerror', e => res.errs.push(String(e).slice(0, 140)));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1200);
  res.censo = await pg.evaluate(CENSO(SEMBRAR));
} finally { await br.close() }
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('OK ' + OUTF);
