/**
 * _probe_pant17b_fmt.mjs — EL FORMATO NUEVO DE LA EVIDENCIA DE CONGENITAS (PANT-17b, commit 3).
 *
 * Mide, por seccion y a los cuatro anchos: la linea de respuestas del encabezado, el recuadro
 * «Con lo contestado», el «Ver detalle de la guia» con los bloques fijos adentro, el alto del
 * contenido VISIBLE -con los plegables cerrados, que es lo que el medico ve- y las preguntas.
 * Corre sobre los DOS arboles con el mismo codigo, asi que las lineas se comparan como conjunto.
 *
 *   node scripts/_probe_pant17b_fmt.mjs --file <index.html> --out <json> [--motor chrome|webkit]
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let _pw; try { _pw = require(process.env.HOME + '/.pwtmp/node_modules/playwright') }
catch (e) { console.log('SIN PLAYWRIGHT'); process.exit(0) }
const RAIZ = process.cwd();
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p17b_fmt.json';
const MOTOR = arg('--motor') || 'chrome';

/* Las escenas: la que el medico mostro -el ductus- y cuatro mas que abren otras secciones. */
const ESC = {
  dap:  { dap_tipo: 'no_restrictivo', dap_diam: '4', dap_dir: 'id' },
  cia:  { ete_cia_tipo: 'secundum', ete_cia_tam_max: '18' },
  dsav: { dsav_tipo: 'completo' },
  coa:  { coa_vmax: '3.2', coa_situacion: 'nativa', coa_hta: 'si',
          coa_gradiente_picopico: '28', coa_estenosis_relativa: '60' },
  tdf:  { tdf_sintomas: 'si' },
  vab:  { vab_tipo: 'fused_rl', ao_tub: '50' },
  mch:  { mch_grad_reposo: '60' },
  vap:  { vap_tipo: 'i', vap_diam: '8' },
  ebs:  { ebs_desplazamiento: '12' },
  fon:  { fontan_tipo: 'extracardiaco' },
  cvpa: { cvpa_venas_numero: '1' },
  eis:  { eis_lesion_base: 'civ' },
  civ:  { ete_civ_tipo: 'perimembranosa' },
  tga:  { tga_tipo: 'mustard' },
  vacio: {}
};
const PROHIBIDAS = ['no coincid', 'difieren', 'discrepan', 'se contradicen', 'no se encontr',
  'ninguna fuente', 'sin resolver', 'pendiente de revisi', 'sin validar'];

const SEMBRAR = (campos) => '(() => {\n'
  + '  var C = ' + JSON.stringify(campos) + ';\n'
  + '  ["modalAvisoEco","login-overlay"].forEach(function (id) { var m = document.getElementById(id); if (m) m.style.display = "none" });\n'
  + '  try { if (typeof limpiarCampos === "function") limpiarCampos(true) } catch (e) {}\n'
  + '  Object.keys(C).forEach(function (k) { var e = document.getElementById(k); if (!e) return;\n'
  + '    if (e.type === "checkbox") { e.checked = (C[k] === "1") } else { e.value = C[k] }\n'
  + '    e.dispatchEvent(new Event("input", { bubbles: true }));\n'
  + '    e.dispatchEvent(new Event("change", { bubbles: true })) });\n'
  + '  Object.keys(window).forEach(function (k) { if (/^calc[A-Z]/.test(k) && typeof window[k] === "function") {\n'
  + '    try { window[k]() } catch (e) {} } });\n'
  + '  try { if (typeof indicCerrar === "function") indicCerrar() } catch (e) {}\n'
  + '  try { indicAbrir() } catch (e) { return { error: String(e).slice(0, 120) } }\n'
  + '  document.querySelectorAll("*").forEach(function (e) { e.style.transition = "none"; e.style.animation = "none" });\n'
  + '  return { ok: 1 };\n'
  + '})()';

const MEDIR = '(() => {\n'
  + '  var PROH = ' + JSON.stringify(PROHIBIDAS) + ';\n'
  + '  var cuerpo = document.getElementById("indic-cuerpo");\n'
  + '  if (!cuerpo) return { error: "sin panel" };\n'
  + '  var tops = Array.prototype.slice.call(cuerpo.querySelectorAll("details")).filter(function (d) {\n'
  + '    return !d.parentElement.closest("details") });\n'
  + '  var out = [];\n'
  + '  tops.forEach(function (d) {\n'
  + '    d.open = true;\n'
  + '    var sum = d.querySelector("summary");\n'
  + '    var tit = sum ? (sum.textContent || "").trim().slice(0, 60) : "(sin summary)";\n'
  + '    /* el alto del contenido VISIBLE: todos los plegables de adentro CERRADOS */\n'
  + '    Array.prototype.slice.call(d.querySelectorAll("details")).forEach(function (x) { x.open = false });\n'
  + '    var cont = d.querySelector(":scope > div");\n'
  + '    var altoCerrado = cont ? Math.round(cont.getBoundingClientRect().height) : -1;\n'
  + '    /* la linea de respuestas */\n'
  + '    var cta = d.querySelector("[data-ind-cuenta]");\n'
  + '    var ctaTxt = cta ? (cta.textContent || "").trim() : null;\n'
  + '    var ctaAlto = cta ? Math.round(cta.getBoundingClientRect().height) : -1;\n'
  + '    var ctaAncho = cta ? Math.round(cta.getBoundingClientRect().width) : -1;\n'
  + '    var ctaScroll = cta ? cta.scrollWidth : -1;\n'
  + '    /* el recuadro «Con lo contestado»: el primer div cuyo rotulo lo nombra */\n'
  + '    var adapt = null;\n'
  + '    Array.prototype.slice.call(d.querySelectorAll("div")).forEach(function (x) {\n'
  + '      if (adapt) return;\n'
  + '      var t = (x.textContent || "").trim();\n'
  + '      if (/^CON LO CONTESTADO/i.test(t) || /^Con lo contestado/.test(t)) {\n'
  + '        var caja = x.parentElement;\n'
  + '        if (caja && /border-left/.test(caja.getAttribute("style") || "")) adapt = caja;\n'
  + '      } });\n'
  + '    var adaptTxt = adapt ? (adapt.textContent || "").trim() : null;\n'
  + '    var adaptN = 0, adaptClases = [];\n'
  + '    if (adapt) {\n'
  + '      var m = adaptTxt.match(/Con lo contestado \\((\\d+)\\)/i);\n'
  + '      adaptN = m ? +m[1] : 0;\n'
  + '      adaptClases = (adaptTxt.match(/Clase\\s+(?:III|II[ab]|I|[0-9][ab]?)/g) || []);\n'
  + '    }\n'
  + '    var faltan = adaptTxt ? /Falta contestar:/.test(adaptTxt) : false;\n'
  + '    var noRec = adaptTxt ? (adaptTxt.match(/No recomendado/g) || []).length : 0;\n'
  + '    /* el «Ver detalle de la guia» */\n'
  + '    var det = null;\n'
  + '    Array.prototype.slice.call(d.querySelectorAll("details[data-ind-bloque]")).forEach(function (x) {\n'
  + '      var s2 = x.querySelector("summary");\n'
  + '      if (s2 && /Ver detalle de la gu/.test(s2.textContent || "")) det = x });\n'
  + '    var detTxt = det ? (det.textContent || "").trim() : null;\n'
  + '    /* las lineas de texto de la seccion, como CONJUNTO: es lo que se compara entre arboles */\n'
  + '    var lineas = [];\n'
  + '    Array.prototype.slice.call(d.querySelectorAll("div, td, summary")).forEach(function (x) {\n'
  + '      if (x.children.length) return;\n'
  + '      var t = (x.textContent || "").replace(/\\s+/g, " ").trim();\n'
  + '      if (t.length > 30) lineas.push(t);\n'
  + '    });\n'
  + '    /* preguntas: una botonera de tres estados */\n'
  + '    var padres = [], marcados = 0;\n'
  + '    Array.prototype.slice.call(d.querySelectorAll("button, [role=button]")).forEach(function (b) {\n'
  + '      var t = (b.textContent || "").trim();\n'
  + '      if (!/^(S\\u00ed|No|\\?)$/.test(t)) return;\n'
  + '      var pp = b.parentElement; if (pp && padres.indexOf(pp) < 0) padres.push(pp);\n'
  + '      if (b.getAttribute("aria-pressed") === "true") marcados++;\n'
  + '    });\n'
  + '    var tall = d.textContent || "";\n'
  + '    var proh = PROH.filter(function (x) { return tall.toLowerCase().indexOf(x) >= 0 });\n'
  + '    out.push({ tit: tit, altoCerrado: altoCerrado, ctaTxt: ctaTxt, ctaAlto: ctaAlto,\n'
  + '      ctaAncho: ctaAncho, ctaScroll: ctaScroll, adapt: !!adapt, adaptN: adaptN,\n'
  + '      adaptClases: adaptClases.length, faltan: faltan, noRec: noRec,\n'
  + '      det: !!det, detLargo: detTxt ? detTxt.length : 0,\n'
  + '      balance: /Condiciones presentes en este paciente/.test(tall),\n'
  + '      listaLarga: /Recomendaciones que aplican con lo contestado/.test(tall),\n'
  + '      filaResp: /Respuestas/.test(tall) && !cta,\n'
  + '      preg: padres.length, marcados: marcados, lineas: lineas, proh: proh });\n'
  + '  });\n'
  + '  return { secs: out };\n'
  + '})()';

/* El gesto real sobre el ductus: contestar Si a N preguntas y No a las demas. */
/* El gesto real sobre el ductus: contestar Si a N preguntas y No a las demas.
   ⚠️ SE RECONSULTA LA SECCION Y SUS BOTONERAS EN CADA CLIC. El panel se REPINTA al contestar, asi
   que los nodos de la lista se desprenden: con una sola consulta, del segundo clic en adelante se
   clickean nodos huerfanos y no pasa nada -el conteo salia «2 Si» con diez clics-. */
const GESTO = (nSi) => '(async () => {\n'
  + '  function sec() {\n'
  + '    var cuerpo = document.getElementById("indic-cuerpo"); if (!cuerpo) return null;\n'
  + '    var tops = Array.prototype.slice.call(cuerpo.querySelectorAll("details")).filter(function (d) {\n'
  + '      return !d.parentElement.closest("details") });\n'
  + '    var r = null;\n'
  + '    tops.forEach(function (d) { var s2 = d.querySelector("summary");\n'
  + '      if (!r && s2 && /[Dd]uctus/.test(s2.textContent || "")) r = d });\n'
  + '    if (r) r.open = true;\n'
  + '    return r;\n'
  + '  }\n'
  + '  function grupos(d) {\n'
  + '    var g = [];\n'
  + '    Array.prototype.slice.call(d.querySelectorAll("button")).forEach(function (b) {\n'
  + '      if (!/^(S\\u00ed|No|\\?)$/.test((b.textContent || "").trim())) return;\n'
  + '      var pp = b.parentElement; if (pp && g.indexOf(pp) < 0) g.push(pp) });\n'
  + '    return g;\n'
  + '  }\n'
  + '  var d0 = sec(); if (!d0) return { error: "sin seccion del ductus" };\n'
  + '  var total = grupos(d0).length, hechos = 0, si = 0;\n'
  + '  for (var i = 0; i < total; i++) {\n'
  + '    var d = sec(); if (!d) break;\n'
  + '    var g = grupos(d); if (i >= g.length) break;\n'
  + '    var quiero = (si < ' + nSi + ') ? "S\\u00ed" : "No";\n'
  + '    var b2 = Array.prototype.slice.call(g[i].querySelectorAll("button")).filter(function (b) {\n'
  + '      return (b.textContent || "").trim() === quiero })[0];\n'
  + '    if (b2) { b2.click(); hechos++; if (quiero === "S\\u00ed") si++ }\n'
  + '    await new Promise(function (r) { setTimeout(r, 24) });\n'
  + '  }\n'
  + '  await new Promise(function (r) { setTimeout(r, 320) });\n'
  + '  return { grupos: total, clics: hechos, siPuestos: si };\n'
  + '})()';

(async () => {
  const R = { file: FILE, motor: MOTOR, anchos: {} };
  const br = MOTOR === 'webkit' ? await _pw.webkit.launch()
                                : await _pw.chromium.launch({ channel: 'chrome' });
  try {
    for (const w of [1440, 1000, 768, 390]) {
      const ctx = await br.newContext({ viewport: { width: w, height: 900 } });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', e => errs.push(String(e && e.message || e)));
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      const porEsc = {};
      for (const k of Object.keys(ESC)) {
        try {
          const sb = await pg.evaluate(SEMBRAR(ESC[k]));
          if (sb && sb.error) { porEsc[k] = { error: sb.error }; continue }
          await pg.waitForTimeout(260);
          porEsc[k] = await pg.evaluate(MEDIR);
        } catch (e) { porEsc[k] = { error: String(e && e.message || e) } }
      }
      /* el caso de las capturas del medico: el ductus con 10 Si y 3 No */
      let ductus = null;
      try {
        await pg.evaluate(SEMBRAR(ESC.dap));
        await pg.waitForTimeout(260);
        const g = await pg.evaluate(GESTO(10));
        const m = await pg.evaluate(MEDIR);
        const s = (m.secs || []).filter(x => /[Dd]uctus/.test(x.tit))[0] || null;
        ductus = { gesto: g, sec: s };
      } catch (e) { ductus = { error: String(e && e.message || e) } }
      R.anchos[w] = { esc: porEsc, ductus: ductus, errores: errs.slice(0, 6) };
      await ctx.close();
    }
  } finally { await br.close() }
  fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
  console.log('OK ->', OUTF);
  for (const w of Object.keys(R.anchos)) {
    const A = R.anchos[w];
    const d = A.ductus && A.ductus.sec;
    console.log(`${MOTOR} ${w}px  ductus: gesto=${JSON.stringify(A.ductus && A.ductus.gesto)} cta="${d && d.ctaTxt}" ctaAlto=${d && d.ctaAlto} adapt=${d && d.adapt}/${d && d.adaptN} det=${d && d.det} altoCerrado=${d && d.altoCerrado} preg=${d && d.preg} balance=${d && d.balance} lista=${d && d.listaLarga}`);
    const n = Object.keys(A.esc).reduce((a, k) => a + ((A.esc[k].secs || []).length), 0);
    console.log(`         secciones medidas: ${n} | errores: ${A.errores.length}`);
  }
})();
