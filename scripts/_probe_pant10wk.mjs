/*
 * _probe_pant10wk.mjs - PANT-10: Chrome y WebKit, los dos temas y los cuatro anchos. Mide los
 * diecisiete globos corregidos, la franja de contraindicaciones de Eisenmenger, las CINCO
 * secciones de Evidencia nuevas con su reparto en columnas, el desplazamiento horizontal, el
 * texto recortado y los errores de consola y de pagina.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda, y sin expresiones
 * regulares con barra invertida: el template se la come.
 * ** WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 *    channel: 'chrome'.
 *   node scripts/_probe_pant10wk.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p10wk.json';
const ANCHOS = [1440, 1000, 768, 390];

/* Siembra las cinco lesiones a la vez, abre sus acordeones y apaga las transiciones. */
const PREP = '(() => {\n'
  + "  var SECS = ['fontan','eisen','ebs','dsav','cvpa','vap'];\n"
  + "  ['modalAvisoEco','login-overlay'].forEach(function (id) { var m = document.getElementById(id); if (m) m.style.display = 'none' });\n"
  + '  var o = {};\n'
  + "  try { showTab('congenitas2') } catch (e) { o.tabErr = String(e).slice(0, 90) }\n"
  + '  var S = function (id, v) { var e = document.getElementById(id); if (!e) return 0;\n'
  + "    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));\n"
  + "    e.dispatchEvent(new Event('change', { bubbles: true })); return 1 };\n"
  + '  var CAMPOS = {\n'
  + "    peso:'70', talla:'170',\n"
  + "    dsav_tipo:'completo', dsav_regurg_av_izq:'severa', dsav_qp_qs:'2.1', dsav_rvp_uw:'4.5',\n"
  + "    ebs_desplazamiento:'22', ebs_func_vd:'moderada', ebs_saturacion:'88',\n"
  + "    fontan_tipo:'ap', fontan_saturacion:'88', fontan_clase_nyha:'iii',\n"
  + "    cvpa_venas_numero:'2', cvpa_conexion:'vcs', cvpa_qp_qs:'1.8',\n"
  + "    eis_lesion_base:'civ', eis_saturacion_reposo:'84', eis_psap:'95',\n"
  + "    vap_tipo:'i', vap_diam:'8' };\n"
  + '  o.puestos = Object.keys(CAMPOS).map(function (k) { return S(k, CAMPOS[k]) })\n'
  + '    .reduce(function (a, b) { return a + b }, 0);\n'
  + '  SECS.forEach(function (k) {\n'
  + "    var c = document.getElementById('sacc-cc-' + k);\n"
  + "    if (c && !c.classList.contains('open')) { var h = c.querySelector('.sacc-hdr'); if (h) h.click() }\n"
  + '  });\n'
  + "  document.querySelectorAll('*').forEach(function (e) { e.style.transition = 'none'; e.style.animation = 'none' });\n"
  + '  SECS.forEach(function (k) {\n'
  + "    var c = document.getElementById('sacc-cc-' + k);\n"
  + "    var b = c && c.querySelector('.sacc-body');\n"
  + "    if (b) { b.style.maxHeight = 'none'; b.style.overflow = 'visible' }\n"
  + '  });\n'
  + '  o.abiertas = SECS.filter(function (k) {\n'
  + "    var c = document.getElementById('sacc-cc-' + k); return !!(c && c.classList.contains('open')) }).length;\n"
  + '  return o;\n'
  + '})()';

const FOTO = '(() => {\n'
  + '  var o = {};\n'
  + '  var NN = function (s) { return String(s ||\'\').split(String.fromCharCode(10)).join(\' \')\n'
  + "    .split('  ').join(' ').split('  ').join(' ').trim() };\n"
  + '  var R = function (e) { if (!e) return null; var r = e.getBoundingClientRect();\n'
  + '    return { w: Math.round(r.width), h: Math.round(r.height) } };\n'
  + '  /* ── LOS DIECISIETE GLOBOS, por el renderizador ── */\n'
  + "  var CC9 = ['cc9-fontan-sat','cc9-fontan-iav','cc9-eisen-sat','cc9-eisen-sin',\n"
  + "    'cc9-eisen-hem','cc9-eisen-per','cc9-ebs-sec','cc9-ebs-cel','cc9-ebs-cia',\n"
  + "    'cc9-dsav-comp','cc9-dsav-down','cc9-dsav-rav','cc9-dsav-rvp',\n"
  + "    'cc9-cvpa-sec','cc9-cvpa-dren','cc9-cvpa-qp','cc9-vap-sec'];\n"
  + "  var tmp = document.createElement('div');\n"
  + '  var txts = CC9.map(function (k) { var h = \'\';\n'
  + "    try { h = (typeof _vInfoHTML === 'function') ? _vInfoHTML(k, null) : '' } catch (e) { h = '' }\n"
  + '    tmp.innerHTML = h; return NN(tmp.textContent) });\n'
  + '  o.globosN = txts.length;\n'
  + '  o.globosVacios = txts.filter(function (t) { return !t || t.length < 40 }).length;\n'
  + '  o.globosLargo = txts.join(\' \').length;\n'
  + '  var todo = txts.join(\' ~ \');\n'
  + "  o.gKappa = todo.indexOf('=0,39') > -1 ? 1 : 0;\n"
  + "  o.gMort50 = todo.indexOf('Mortalidad materna >50') > -1 ? 1 : 0;\n"
  + "  o.gMort3050 = todo.indexOf('30 a 50 %') > -1 ? 1 : 0;\n"
  + "  o.gEscVap = todo.indexOf('ESC 2020: cierre indicado siempre') > -1 ? 1 : 0;\n"
  + "  o.gFolios = ['folio 1042','folio e209','folio e174','folio 611','folio 595','folio e241',\n"
  + "    'folio 575','folio e158','folio 586'].filter(function (f) { return todo.indexOf(f) > -1 }).length;\n"
  + '  /* ── LA FRANJA DE EISENMENGER: no tiene id, se busca por su texto ── */\n'
  + "  var sec = document.getElementById('sacc-cc-eisen');\n"
  + '  var fr = null;\n'
  + "  if (sec) { var ds = Array.prototype.slice.call(sec.querySelectorAll('div'));\n"
  + '    for (var i = 0; i < ds.length; i++) {\n'
  + "      if ((ds[i].textContent || '').indexOf('Contraindicaciones absolutas') > -1\n"
  + '          && ds[i].querySelectorAll(\'div\').length === 0) { fr = ds[i]; break } } }\n'
  + "  o.franja = fr ? NN(fr.textContent) : 'NO EXISTE';\n"
  + '  o.franjaN = String(o.franja).length;\n'
  + '  o.franjaVis = fr ? !!R(fr) && R(fr).w > 100 : false;\n'
  + '  /* ── LAS CINCO SECCIONES DE EVIDENCIA ── */\n'
  + "  try { if (typeof indicAbrir === 'function') indicAbrir(); } catch (e) {}\n"
  + "  try { if (typeof indicRender === 'function') indicRender(); } catch (e) {}\n"
  + "  var cu = document.getElementById('indic-cuerpo');\n"
  + '  o.evSecs = cu ? Array.prototype.slice.call(cu.children)\n'
  + "    .filter(function (d) { return d.tagName === 'DETAILS' })\n"
  + "    .map(function (d) { return NN((d.querySelector('summary') || {}).textContent).slice(0, 48) }) : [];\n"
  + '  o.evN = o.evSecs.length;\n'
  + '  var LAS5 = [\'Defecto del septo\', \'Ebstein\', \'Fontan\', \'venosa pulmonar\', \'Eisenmenger\'];\n'
  + '  o.ev5 = LAS5.filter(function (p) { return o.evSecs.some(function (t) { return t.indexOf(p) > -1 }) }).length;\n'
  + "  o.evCompactas = cu ? cu.querySelectorAll('[data-ind-compacta]').length : -1;\n"
  + "  o.evPreg2col = cu ? cu.querySelectorAll('[data-ind-preg]').length : -1;\n"
  + '  o.evTexto = cu ? NN(cu.textContent).length : 0;\n'
  + "  var pan = document.getElementById('indic-panel') || document.getElementById('indic-modal');\n"
  + '  o.panel = R(pan);\n'
  + '  /* ── LOS BOTONES DE RESPUESTA: area tactil ── */\n'
  + "  var btns = cu ? Array.prototype.slice.call(cu.querySelectorAll('.ind-ctrl button, button[data-ind-op]')) : [];\n"
  + '  o.btnN = btns.length;\n'
  + '  o.btn44 = btns.filter(function (b) { var r = b.getBoundingClientRect();\n'
  + '    return r.height >= 30 && r.width >= 30 }).length;\n'
  + '  /* ── DESPLAZAMIENTO HORIZONTAL Y TEXTO RECORTADO ── */\n'
  + "  var cuerpo = document.getElementById('app-content') || document.body;\n"
  + '  o.scrollX = Math.max(0, cuerpo.scrollWidth - cuerpo.clientWidth);\n'
  + '  var rec = 0;\n'
  + "  Array.prototype.forEach.call(document.querySelectorAll('label, .calc-lbl, .cc9-h, option'), function (e) {\n"
  + '    if (e.offsetParent === null) return;\n'
  + '    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) rec++ });\n'
  + '  o.recortados = rec;\n'
  + '  return o;\n'
  + '})()';

const OUT = { file: FILE, cruces: [] };
for (const nav of ['chromium', 'webkit']) {
  for (const tema of ['light', 'dark']) {
    for (const W of ANCHOS) {
      const cons = [], perr = [];
      let b = null;
      try {
        b = nav === 'chromium'
          ? await _pw.chromium.launch({ channel: 'chrome' })
          : await _pw.webkit.launch();
        const pg = await b.newPage({ viewport: { width: W, height: 900 }, colorScheme: tema });
        pg.on('console', (m) => { if (m.type() === 'error') cons.push(m.text().slice(0, 110)) });
        pg.on('pageerror', (e) => perr.push(e.message.slice(0, 110)));
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
        await pg.waitForTimeout(1400);
        const prep = await pg.evaluate(PREP);
        await pg.waitForTimeout(600);
        const foto = await pg.evaluate(FOTO);
        OUT.cruces.push({ nav, tema, W, prep, foto, consola: cons, pageErr: perr });
        console.log(nav + ' ' + tema + ' ' + W + ' -> ev5=' + foto.ev5 + '/5 globos=' + foto.globosN
          + ' vacios=' + foto.globosVacios + ' franja=' + foto.franjaN
          + ' scrollX=' + foto.scrollX + ' recortados=' + foto.recortados
          + ' errC=' + cons.length + ' errP=' + perr.length);
        await pg.close();
      } catch (e) {
        OUT.cruces.push({ nav, tema, W, err: String(e).slice(0, 200) });
        console.log(nav + ' ' + tema + ' ' + W + ' -> EXC ' + String(e).slice(0, 90));
      }
      try { if (b) await b.close() } catch (e) {}
    }
  }
}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
