/*
 * _probe_pant9morf.mjs - PANT-9, commit 8: la opcion nueva de morfologia de TAVI y la sincronia
 * con la morfologia de Valvulas. Mide cada pareja en los DOS sentidos, con valor en cada lado,
 * con vacio y con borrado, con el gesto real (despachando los eventos del selector) y con una
 * siembra MUDA (como la de restaurar un estudio guardado, que no despacha nada).
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant9morf.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p9morf.json';

/* El inventario de los dos selectores, tal como estan en el arbol que se mide. */
const INV = '(() => {\n'
  + '  var o = {};\n'
  + '  var g = function (id) { var e = document.getElementById(id); if (!e) return null;\n'
  + '    return Array.prototype.slice.call(e.options).map(function (x) { return x.value + " :: " + x.text }) };\n'
  + '  o.va = g("va_morf"); o.tavi = g("ete_tavi_morf");\n'
  + '  try { o.txt = JSON.stringify(TAVI_TXT.morf) } catch (e) { o.txt = "SIN TAVI_TXT" }\n'
  + '  try { o.pares = JSON.stringify(TAVI_MORF_PARES) } catch (e) { o.pares = "SIN PARES" }\n'
  + '  try { o.haySync = (typeof taviMorfSync === "function") } catch (e) { o.haySync = false }\n'
  + '  return o;\n'
  + '})()';

/* Un caso de sincronia. `gesto` true despacha input+change (lo que hace el medico); false es la
   siembra MUDA, que es como repone un estudio guardado: ahi NADA debe moverse. */
const CASO = (c) => '(() => {\n'
  + '  var C = ' + JSON.stringify(c) + ';\n'
  + '  ["modalAvisoEco","login-overlay"].forEach(function (id) { var m = document.getElementById(id); if (m) m.style.display = "none" });\n'
  + '  try { if (typeof limpiarCampos === "function") limpiarCampos(true) } catch (e) {}\n'
  + '  var S = function (id, v, gesto) { var e = document.getElementById(id); if (!e) return "NO EXISTE";\n'
  + '    e.value = v;\n'
  + '    if (gesto) { e.dispatchEvent(new Event("input", { bubbles: true }));\n'
  + '                 e.dispatchEvent(new Event("change", { bubbles: true })) }\n'
  + '    return e.value };\n'
  + '  var V = function (id) { var e = document.getElementById(id); return e ? String(e.value || "") : "NO EXISTE" };\n'
  + '  var o = {};\n'
  + '  /* el estado previo: lo que haya que dejar puesto antes del gesto que se mide */\n'
  + '  (C.previo || []).forEach(function (pp) { S(pp[0], pp[1], true) });\n'
  + '  o.antes = V("ete_tavi_morf") + " | " + V("va_morf");\n'
  + '  o.enUso = (typeof _taviModuloEnUso === "function") ? _taviModuloEnUso() : "sin fn";\n'
  + '  /* el gesto que se mide */\n'
  + '  o.puesto = S(C.id, C.val, !!C.gesto);\n'
  + '  o.despues = V("ete_tavi_morf") + " | " + V("va_morf");\n'
  + '  o.tavi = V("ete_tavi_morf"); o.va = V("va_morf");\n'
  + '  /* el Laboratorio: este estudio cuenta como «Con TAVI»? */\n'
  + '  try {\n'
  + '    var camp = {};\n'
  + '    document.querySelectorAll("input[id],select[id],textarea[id]").forEach(function (e) {\n'
  + '      if (e.type === "checkbox") { camp[e.id + "__chk"] = e.checked ? "1" : "0" } else { camp[e.id] = e.value } });\n'
  + '    o.labTavi = (typeof _labUsaTavi === "function") ? !!_labUsaTavi({ campos: camp }) : "sin fn";\n'
  + '  } catch (e) { o.labTavi = "EXC" }\n'
  + '  return o;\n'
  + '})()';

/* LOS CASOS. `previo` deja el estado; el gesto medido es (id, val).
   El modulo de TAVI se declara «en uso» cargando un campo de TAVI que NO es espejo. */
const EN_USO = [['ete_tavi_anillo_diam', '24']];
const CASOS = [
  /* -- sentido TAVI -> VALVULAS: incondicional -- */
  { k: 'tavi_bi', id: 'ete_tavi_morf', val: 'bicuspide', gesto: true },
  { k: 'tavi_viv', id: 'ete_tavi_morf', val: 'protesis_bio', gesto: true },
  /* sin equivalente: no escribe nada */
  { k: 'tavi_tri', id: 'ete_tavi_morf', val: 'tricuspide', gesto: true },
  { k: 'tavi_cuad', id: 'ete_tavi_morf', val: 'cuadricuspide', gesto: true },
  /* vaciar TAVI con Valvulas en el valor equivalente: Valvulas NO se vacia (no tiene opcion vacia) */
  { k: 'tavi_vacia', previo: [['ete_tavi_morf', 'bicuspide']], id: 'ete_tavi_morf', val: '', gesto: true },
  /* -- sentido VALVULAS -> TAVI: condicional al modulo en uso -- */
  { k: 'va_bi_sinuso', id: 'va_morf', val: 'Bicúspide', gesto: true },
  { k: 'va_bi_enuso', previo: EN_USO, id: 'va_morf', val: 'Bicúspide', gesto: true },
  { k: 'va_bio_enuso', previo: EN_USO, id: 'va_morf', val: 'Prótesis biológica', gesto: true },
  /* sin equivalente */
  { k: 'va_tri_enuso', previo: EN_USO, id: 'va_morf', val: 'Trivalva normal', gesto: true },
  { k: 'va_calc_enuso', previo: EN_USO, id: 'va_morf', val: 'Calcificada', gesto: true },
  { k: 'va_mec_enuso', previo: EN_USO, id: 'va_morf', val: 'Prótesis mecánica', gesto: true },
  /* cambiar de un valor con equivalente a uno sin equivalente: no borra el otro lado */
  { k: 'va_bi_a_calc', previo: EN_USO.concat([['va_morf', 'Bicúspide']]), id: 'va_morf', val: 'Calcificada', gesto: true },
  /* -- SIEMBRA MUDA: como repone un estudio guardado. Nada se mueve. -- */
  { k: 'mudo_tavi_bi', id: 'ete_tavi_morf', val: 'bicuspide', gesto: false },
  { k: 'mudo_va_bi', previo: EN_USO, id: 'va_morf', val: 'Bicúspide', gesto: false }
];

const out = { file: FILE, inv: null, casos: {}, errs: [] };
try {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => out.errs.push('PAGE:' + String(e).slice(0, 110)));
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(900);
  out.inv = await pg.evaluate(INV);
  for (const c of CASOS) {
    out.casos[c.k] = await pg.evaluate(CASO(c));
    await pg.waitForTimeout(60);
  }
  await b.close();
} catch (e) { out.error = String(e).slice(0, 300) }
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log('OK ' + OUTF + (out.error ? ' ERR ' + out.error : ''));
