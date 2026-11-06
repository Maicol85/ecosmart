#!/usr/bin/env node
/**
 * _probe_pant14c_wk.mjs - LOS DIECISEIS CRUCES de cierre de la tanda PANT-14c (2026-11-06):
 * DOS MOTORES x 1440, 1000, 768 y 390 px x dos temas.
 *
 * Las otras dos sondas de la tanda —_probe_pant14c_tga.mjs y _probe_pant14c_color.mjs— corren
 * SOLO el Chrome del sistema; esta corre los dos motores y mide las claves de cierre de los
 * siete commits. Nombre propio: verificado con ls, no existia.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema con
 *    channel: 'chrome'.
 * ⚠️ SIN ACENTOS GRAVES en el cuerpo medido: es un template literal.
 *
 *   node scripts/_probe_pant14c_wk.mjs                 # el arbol vivo
 *   node scripts/_probe_pant14c_wk.mjs --file X.html   # otro arbol (el control)
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.mjs',
              process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/node_modules/playwright/index.mjs'];
let _pw = null;
for (const c of CAND) { try { _pw = await import(c); break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(0) }
const { chromium, webkit } = _pw;
const { pathToFileURL } = await import('node:url');
const path = await import('node:path');

const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || path.resolve('index.html');

const CUERPO = `
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const EL = (i) => document.getElementById(i);
  const o = { errs: [] };
  try { sessionStorage.setItem('ett_auth', '1') } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco() } catch (e) {}

  /* ── (1) COMMIT 1: las constantes del PDF y el texto de cuatro partes ── */
  o.pdfAr = (typeof CM_PDF_AR !== 'undefined') ? CM_PDF_AR : 'NO';
  o.pdfMargen = (typeof CM_PDF_MARGEN !== 'undefined') ? CM_PDF_MARGEN : 'NO';
  o.papelPartes = (function () {
    if (typeof cmPapelTexto !== 'function') return 'NO FN';
    try {
      const t = EL('ete_cia_tipo'); if (t) { t.value = 'secundum';
        t.dispatchEvent(new Event('change', { bubbles: true })) }
      const x = String(cmPapelTexto() || '');
      const n = x ? x.split(String.fromCharCode(10)).filter(function (q) { return q.trim() }).length : 0;
      const prohibidas = ['ESC ', 'AHA', 'Clase ', 'Nivel ', 'folio', 'Tabla ', 'recomiend',
                          'indicad', 'se sugiere', 'sin datos suficientes'];
      let mal = 0;
      prohibidas.forEach(function (p) { if (x.indexOf(p) >= 0) mal++ });
      return n + '|prohibidas=' + mal;
    } catch (e) { return 'EXC' }
  })();

  /* ── (2) COMMIT 2: la casilla del posoperatorio ── */
  o.popHidden = (EL('pop_esq_pdf') || {}).type || 'NO';
  o.popSinDatos = (typeof popHayDatos === 'function') ? popHayDatos() : 'NO FN';
  o.popDataVacio = (function () {
    try { const pe = EL('pop_esq_pdf'); if (!pe) return 'NO CAMPO';
      pe.value = '1';
      const r = (typeof popEsqPdfData === 'function') ? !!popEsqPdfData() : 'NO FN';
      pe.value = '';
      return r;
    } catch (e) { return 'EXC' }
  })();

  /* ── (3) COMMIT 3: los colores, el anillo, las suturas y la leyenda ── */
  o.violOsc = (typeof TGA3D_C !== 'undefined' && TGA3D_C.violet != null)
    ? ('0x' + TGA3D_C.violet.toString(16)) : 'NO';
  o.violCla = (typeof TGA3D_C !== 'undefined' && TGA3D_C.violetClaro != null)
    ? ('0x' + TGA3D_C.violetClaro.toString(16)) : 'NO';
  o.celeste = (typeof CM_C !== 'undefined' && CM_C.celeste != null) ? ('0x' + CM_C.celeste.toString(16)) : 'NO';
  o.verde = (typeof CM_C !== 'undefined' && CM_C.green != null) ? ('0x' + CM_C.green.toString(16)) : 'NO';
  o.leyEntradas = (typeof CM_LEY !== 'undefined')
    ? CM_LEY.filter(function (e) { return !!EL('cm3d-leg-' + e.id) }).length : 'NO';
  o.leyEntradas2 = (typeof CM_LEY !== 'undefined')
    ? CM_LEY.filter(function (e) { return !!EL('cm3d-leg2-' + e.id) }).length : 'NO';
  o.escMus = (function () {
    try {
      _cm3d.S.base = 'tga'; _cm3d.S.bv.tga = 'mus'; _cm3d.S.mods = {}; _cm3d.S.ck = {};
      const s = cmEscena(_cm3d.S);
      const tub = (s.ex || []).filter(function (x) { return x.t === 'tube' });
      const osc = tub.filter(function (x) { return x.c === TGA3D_C.violet }).length;
      const cla = tub.filter(function (x) { return x.c === TGA3D_C.violetClaro }).length;
      const rot = (s.lb || []).map(function (l) { return l[0] });
      return 'tubos=' + tub.length + ' osc=' + osc + ' cla=' + cla
        + ' rotTunel=' + ((rot.indexOf('Túnel cavas') >= 0 ? 1 : 0) + (rot.indexOf('Túnel venas pulm.') >= 0 ? 1 : 0));
    } catch (e) { return 'EXC' }
  })();
  o.anilloAcostado = (function () {
    try {
      _cm3d.S.base = 'tga'; _cm3d.S.bv.tga = 'd'; _cm3d.S.mods = {}; _cm3d.S.ck = { tobs: true };
      const s = cmEscena(_cm3d.S);
      const g = (s.ex || []).filter(function (x) { return x.t === 'ring' && x.col === CM_C.grey });
      if (g.length !== 1) return 'anillos=' + g.length;
      return (g[0].nrm && !g[0].rx && !g[0].ry) ? 'acostado' : 'NO';
    } catch (e) { return 'EXC' }
  })();
  o.suturasMalla = (function () {
    try {
      _cm3d.S.base = 'tga'; _cm3d.S.bv.tga = 'jat'; _cm3d.S.mods = {}; _cm3d.S.ck = {};
      const s = cmEscena(_cm3d.S);
      const m = (s.ex || []).filter(function (x) { return x.t === 'malla' });
      const an = (s.ex || []).filter(function (x) { return x.t === 'ring' && x.col === CM_C.orange });
      return 'mallas=' + m.length + ' anillosNaranjas=' + an.length
        + ' conNrm=' + m.filter(function (x) { return !!x.nrm }).length;
    } catch (e) { return 'EXC' }
  })();

  /* ── (4) COMMIT 4: el titulo y los textos chicos ── */
  o.tituloNodos = (!!EL('cm3d-tit') ? 1 : 0) + (!!EL('cm3d-schtit') ? 1 : 0);
  o.fraseRetirada = (typeof cc3dTextoSync === 'function')
    ? (String(cc3dTextoSync).indexOf('Todas las lesiones cargadas') >= 0 ? 'SIGUE' : 'no') : 'NO FN';
  o.aclaracionesEnGlobo = (function () {
    const ip = EL('cm3d-ip'); const t = ip ? String(ip.textContent || '') : '';
    return (t.indexOf('esquemático, no a escala') >= 0 && t.indexOf('rota arrastrando') >= 0) ? 'si' : 'NO';
  })();

  /* ── (5) COMMIT 5: la pestania de transposicion ── */
  try { const b = document.querySelector('[onclick*="ccSubTab"][onclick*="congenitas2"]'); if (b) b.click() } catch (e) {}
  await esperar(320);
  try { if (typeof ccSubTab === 'function') ccSubTab('congenitas2') } catch (e) {}
  await esperar(260);
  try { const a = EL('sacc-cc-tga');
    if (a && !a.classList.contains('open')) { const h = a.querySelector('.sacc-hdr'); if (h) h.click() } } catch (e) {}
  await esperar(420);
  o.verBtnPropio = !!EL('tga-ver3d');
  o.btnComun = !!EL('cc3d-abrir');
  const g5 = EL('tga-grupos');
  o.grupos = g5 ? g5.querySelectorAll('.cc9-col').length : 'NO';
  o.encabezados = g5 ? g5.querySelectorAll('.cc9-h').length : 'NO';
  o.campos = g5 ? g5.querySelectorAll('.fg').length : 'NO';
  o.cols = g5 ? (getComputedStyle(g5).gridTemplateColumns || '').split(' ').filter(Boolean).length : 'NO';
  o.conclDebajo = (function () {
    const c = EL('tga-concl-box'), f = EL('tga-fila');
    if (!c || !f) return 'NO';
    return (c.parentElement === f && !(g5 && g5.contains(c))) ? 'si' : 'NO';
  })();
  o.gruposVacios = (function () {
    if (!g5) return 'NO';
    return Array.prototype.filter.call(g5.querySelectorAll('.cc9-col'), function (c) {
      return getComputedStyle(c).display !== 'none'
        && Array.prototype.every.call(c.querySelectorAll('.fg'), function (f) { return f.offsetParent === null })
    }).length;
  })();

  /* ── (6) COMMIT 6: las secciones de congenitas ── */
  o.cerrador = typeof ccSeccionesCerrar;
  o.soloCongenitas = (typeof CC_TABS_CERRAR !== 'undefined') ? CC_TABS_CERRAR.join(',') : 'NO';
  o.cerradas = await (async function () {
    try {
      ['cc-tga', 'cc-cvpa', 'cc-ebs'].forEach(function (k) {
        try { if (typeof secToggle === 'function') secToggle(k) } catch (e) {} });
      await esperar(380);
      const t2 = EL('tab-congenitas2');
      const antes = t2 ? t2.querySelectorAll('.sacc.open').length : -1;
      if (typeof showTab === 'function') showTab('valvulas');
      await esperar(300);
      if (typeof showTab === 'function') showTab('congenitas2');
      await esperar(420);
      const desp = t2 ? t2.querySelectorAll('.sacc.open').length : -1;
      return 'antes=' + antes + ' alVolver=' + desp;
    } catch (e) { return 'EXC' }
  })();

  /* ── lo transversal ── */
  o.scrollX = (function () { const c = document.querySelector('.app-content');
    return c ? Math.max(0, c.scrollWidth - c.clientWidth) : 'NO' })();
  o.recortados = (function () {
    let n = 0;
    document.querySelectorAll('.app-content *').forEach(function (e) {
      if (e.children.length) return;
      const t = String(e.textContent || '').trim();
      if (!t || t.length < 3) return;
      if (e.offsetParent === null) return;
      if (e.id === 'cm3d-circ-sr') return;
      if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow === 'hidden') n++;
    });
    return n;
  })();
  return o;
`;

const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];
const OUT = {};
for (const [nom, motor] of [['chrome', chromium], ['webkit', webkit]]) {
  let br = null;
  try {
    br = nom === 'chrome' ? await motor.launch({ channel: 'chrome' }) : await motor.launch();
  } catch (e) { OUT[nom] = { ERR: String(e.message).slice(0, 120) }; continue }
  for (const w of ANCHOS) for (const tema of TEMAS) {
    const ctx = await br.newContext({ viewport: { width: w, height: 900 },
      colorScheme: tema === 'dark' ? 'dark' : 'light' });
    const pag = await ctx.newPage();
    const errs = [];
    pag.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
    try {
      await pag.goto(pathToFileURL(FILE).href);
      await pag.waitForFunction('typeof generarInforme === "function"', null, { timeout: 60000 });
      await pag.evaluate('try{sessionStorage.setItem("ett_auth","1")}catch(e){}');
      await pag.reload();
      await pag.waitForFunction('typeof generarInforme === "function"', null, { timeout: 60000 });
      await pag.evaluate(`try{document.documentElement.setAttribute('data-theme','${tema}')}catch(e){}`);
      const r = await pag.evaluate(new Function(`return (async () => { ${CUERPO} })()`));
      r.errsPagina = errs.length;
      OUT[nom + ':' + tema + ':' + w] = r;
    } catch (e) {
      OUT[nom + ':' + tema + ':' + w] = { ERR: String(e.message).slice(0, 140), errsPagina: errs.length };
    }
    await ctx.close();
  }
  await br.close();
}
console.log(JSON.stringify(OUT, null, 1));
