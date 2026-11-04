/*
 * _probe_pant9wk.mjs - PANT-9: Chrome y WebKit, los dos temas y los cuatro anchos, sobre las
 * SIETE pantallas de congenitas rediseniadas y la morfologia de TAVI. Mide el reparto en
 * columnas, el lugar de la conclusion, los globos nuevos, el desplazamiento horizontal, el texto
 * recortado y los errores de consola y de pagina.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 * ** WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 *    channel: 'chrome'.
 *   node scripts/_probe_pant9wk.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p9wk.json';
const ANCHOS = [1440, 1000, 768, 390];

const PREP = '(() => {\n'
  + "  var SECS = ['fontan','eisen','ebs','dsav','cvpa','dap','vap'];\n"
  + "  ['modalAvisoEco','login-overlay'].forEach(function (id) { var m = document.getElementById(id); if (m) m.style.display = 'none' });\n"
  + '  var o = {};\n'
  + "  try { showTab('congenitas2') } catch (e) { o.tabErr = String(e).slice(0, 90) }\n"
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
  + "  var SECS = ['fontan','eisen','ebs','dsav','cvpa','dap','vap'];\n"
  + '  var R = function (e) { if (!e) return null; var r = e.getBoundingClientRect();\n'
  + '    return { w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,\n'
  + '             x: Math.round(r.x * 10) / 10 } };\n'
  + '  var o = { secs: {} };\n'
  + '  SECS.forEach(function (k) {\n'
  + "    var card = document.getElementById('sacc-cc-' + k);\n"
  + '    if (!card) { o.secs[k] = "SIN CARD"; return }\n'
  + "    var cols = card.querySelector('.cc9-cols');\n"
  + "    var concl = card.querySelector('.cc9-concl');\n"
  + "    var fila = card.querySelector('.cc9-fila');\n"
  + '    var arr = cols ? Array.prototype.slice.call(cols.children) : [];\n'
  + '    var ws = arr.map(function (c) { return R(c).w });\n'
  + '    var der = !!(concl && fila && concl.getBoundingClientRect().x > fila.getBoundingClientRect().x + 50);\n'
  + '    var rec = 0;\n'
  + "    card.querySelectorAll('label,span,p,b,div').forEach(function (e) {\n"
  + '      if (e.children.length) return; if (!e.offsetParent) return;\n'
  + '      if (e.scrollWidth > e.clientWidth + 1) rec++ });\n'
  + '    var b44 = 0, bTot = 0;\n'
  + "    card.querySelectorAll('button').forEach(function (b) { var r = b.getBoundingClientRect();\n"
  + '      if (r.width > 0) { bTot++; if (r.height >= 44) b44++ } });\n'
  + '    o.secs[k] = { alto: R(card).h, nCols: arr.length, minCol: ws.length ? Math.min.apply(null, ws) : null,\n'
  + '      conclDer: der, nIds: card.querySelectorAll("input[id],select[id],textarea[id]").length,\n'
  + '      nGlobos: card.querySelectorAll(".vinfo-btn").length, recortados: rec,\n'
  + '      btn44: b44 + "/" + bTot };\n'
  + '  });\n'
  + '  /* la franja roja de Eisenmenger: visible, a todo el ancho y FUERA de la fila */\n'
  + "  var ce = document.getElementById('sacc-cc-eisen');\n"
  + "  var cu = ce && ce.querySelector('.cc9-cuadro');\n"
  + "  var fi = ce && ce.querySelector('.cc9-fila');\n"
  + '  var fr = null;\n'
  + '  if (cu) Array.prototype.forEach.call(cu.children, function (c) {\n'
  + "    if ((c.textContent || '').indexOf('Contraindicaciones absolutas') > -1) fr = c });\n"
  + '  o.franja = fr ? { rect: R(fr), fueraDeLaFila: !(fi && fi.contains(fr)),\n'
  + '    visible: !!fr.offsetParent } : "NO ESTA";\n'
  + '  /* la morfologia de TAVI: la opcion nueva existe y el selector tiene cinco */\n'
  + "  var T = document.getElementById('ete_tavi_morf');\n"
  + '  o.tavi = T ? { n: T.options.length,\n'
  + '    nueva: Array.prototype.some.call(T.options, function (x) { return x.value === "protesis_bio" }) } : "NO";\n'
  + '  o.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth;\n'
  + '  o.sw = document.documentElement.scrollWidth; o.cw = document.documentElement.clientWidth;\n'
  + '  return o;\n'
  + '})()';

/* Un globo: abre por clic, cierra por las tres vias, mide su caja y el tamanio de su cuerpo. */
const GLOBO = (k) => '(() => {\n'
  + "  var b = document.querySelector('[data-vinfo=\"" + k + "\"]');\n"
  + '  if (!b) return { existe: false };\n'
  + '  b.scrollIntoView({ block: "center" });\n'
  + '  var rb = b.getBoundingClientRect();\n'
  + '  b.click();\n'
  + "  var c = document.getElementById('vinfo-card');\n"
  + '  var vis = function () { return c && getComputedStyle(c).display !== "none" && c.getBoundingClientRect().width > 0 };\n'
  + '  var abrio = vis();\n'
  + '  var r = c ? c.getBoundingClientRect() : null;\n'
  + '  var cuerpo = {};\n'
  + '  if (c) c.querySelectorAll("[data-vinfo-b]").forEach(function (d) {\n'
  + '    var s = getComputedStyle(d).fontSize; cuerpo[s] = (cuerpo[s] || 0) + (d.textContent || "").length });\n'
  + '  b.click(); var c2 = !vis();\n'
  + '  b.click(); document.body.click(); var c3 = !vis();\n'
  + '  b.click();\n'
  + '  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));\n'
  + '  var c4 = !vis();\n'
  + '  if (vis()) b.click();\n'
  + '  var dentro = r ? (r.x >= -1 && r.y >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1) : null;\n'
  + '  return { existe: true, btn: Math.round(rb.width) + "x" + Math.round(rb.height),\n'
  + '    abrio: abrio, cerro2: c2, cerroFuera: c3, cerroEsc: c4, dentro: dentro,\n'
  + '    caja: r ? (Math.round(r.width) + "x" + Math.round(r.height)) : null, cuerpo: cuerpo };\n'
  + '})()';

const CLAVES = ['cc9-fontan-sat', 'cc9-eisen-sat', 'cc9-ebs-cel', 'cc9-dsav-rvp', 'cc9-cvpa-qp', 'cc9-vap-sec'];
const out = { file: FILE, cruces: [], globos: {} };
try {
  for (const motor of ['chromium', 'webkit']) {
    const opts = motor === 'chromium' ? { channel: 'chrome' } : {};
    const b = await _pw[motor].launch(opts);
    for (const tema of ['dark', 'light']) {
      for (const W of ANCHOS) {
        const ctx = await b.newContext({ viewport: { width: W, height: 900 }, colorScheme: tema });
        const pg = await ctx.newPage();
        const errs = [];
        pg.on('pageerror', e => errs.push('PAGE:' + String(e).slice(0, 90)));
        pg.on('console', m => { if (m.type() === 'error') errs.push('CON:' + m.text().slice(0, 90)) });
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
        await pg.waitForTimeout(900);
        const p = await pg.evaluate(PREP);
        await pg.waitForTimeout(350);
        const f = await pg.evaluate(FOTO);
        out.cruces.push({ motor, tema, W, prep: p, errs, ...f });
        if (tema === 'dark' && W === 1440) {
          out.globos[motor] = {};
          for (const k of CLAVES) out.globos[motor][k] = await pg.evaluate(GLOBO(k));
        }
        await ctx.close();
      }
    }
    await b.close();
  }
} catch (e) { out.error = String(e).slice(0, 300) }
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log('OK ' + OUTF + (out.error ? ' ERR ' + out.error : ''));
