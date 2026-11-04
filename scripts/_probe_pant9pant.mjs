/*
 * _probe_pant9pant.mjs - PANT-9: mide una pantalla rediseniada de congenitas. Reparto de campos
 * por columna, ancho de la columna mas angosta, lugar de la conclusion, globos nuevos (abren y
 * cierran por clic, por fuera y por Escape), censo de ids, desplazamiento horizontal y texto
 * recortado, a un barrido de anchos y en los dos temas.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant9pant.mjs --file <index.html> --sec fontan --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const SEC = arg('--sec') || 'fontan';
const OUTF = arg('--out') || '/tmp/p9pant.json';
const ANCHOS = (arg('--anchos') || '1440,1260,1220,1219,1000,900,899,768,390').split(',').map(Number);
const TEMAS = (arg('--temas') || 'dark,light').split(',');

const mk = (sec) => ({
  prep: '(() => {\n'
    + "  var SEC = '" + sec + "';\n"
    + "  ['modalAvisoEco','login-overlay'].forEach(function(id){ var m=document.getElementById(id); if(m) m.style.display='none' });\n"
    + '  var o = {};\n'
    + "  try { showTab('congenitas2') } catch(e) { o.tabErr = String(e).slice(0,90) }\n"
    + "  var card = document.getElementById('sacc-cc-' + SEC);\n"
    + '  o.card = !!card;\n'
    + "  if (card && !card.classList.contains('open')) { var h = card.querySelector('.sacc-hdr'); if (h) h.click() }\n"
    + "  document.querySelectorAll('*').forEach(function(e){ e.style.transition='none'; e.style.animation='none' });\n"
    + "  var body = card && card.querySelector('.sacc-body');\n"
    + "  if (body) { body.style.maxHeight='none'; body.style.overflow='visible' }\n"
    + "  o.abierta = card ? card.classList.contains('open') : false;\n"
    + '  return o;\n'
    + '})()',
  foto: '(() => {\n'
    + "  var SEC = '" + sec + "';\n"
    + '  var R = function(e){ if(!e) return null; var r=e.getBoundingClientRect();\n'
    + '    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };\n'
    + "  var card = document.getElementById('sacc-cc-' + SEC);\n"
    + '  if (!card) return { existe:false };\n'
    + "  var body = card.querySelector('.sacc-body');\n"
    + "  var fila = card.querySelector('.cc9-fila');\n"
    + "  var cols = card.querySelector('.cc9-cols');\n"
    + "  var concl = card.querySelector('.cc9-concl');\n"
    + '  var colArr = cols ? Array.prototype.slice.call(cols.children) : [];\n'
    + '  var colInfo = colArr.map(function(c){\n'
    + "    var ids = []; c.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){ ids.push(e.id) });\n"
    + "    var h = c.querySelector('.cc9-h');\n"
    + "    return { h: h ? h.textContent.trim() : null, hSize: h ? getComputedStyle(h).fontSize : null,\n"
    + '             rect: R(c), ids: ids, n: ids.length } });\n'
    + '  var ids = [];\n'
    + "  card.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){ ids.push(e.id) });\n"
    + "  var txt = (body ? body.innerText : '') || '';\n"
    + '  var nC = function(re){ return (txt.match(re)||[]).length };\n'
    + '  var globos = [];\n'
    + "  card.querySelectorAll('.vinfo-btn').forEach(function(b){ var r=b.getBoundingClientRect();\n"
    + "    globos.push({ k: b.getAttribute('data-vinfo'), w: Math.round(r.width), h: Math.round(r.height),\n"
    + "                  lbl: (b.getAttribute('aria-label')||'').slice(0,60) }) });\n"
    + '  var recort = [];\n'
    + "  card.querySelectorAll('label,span,p,b,div').forEach(function(e){\n"
    + '    if (e.children.length) return; if (!e.offsetParent) return;\n'
    + "    if (e.scrollWidth > e.clientWidth + 1) recort.push((e.textContent||'').trim().slice(0,30)) });\n"
    + '  var btns = [];\n'
    + "  card.querySelectorAll('button').forEach(function(b){ var r=b.getBoundingClientRect();\n"
    + "    if (r.width>0) btns.push({ t:(b.textContent||'').trim().slice(0,24), h:Math.round(r.height) }) });\n"
    + '  var minCol = colInfo.length ? Math.min.apply(null, colInfo.map(function(c){ return c.rect.w })) : null;\n'
    + '  var conclDer = (concl && fila && concl.getBoundingClientRect().x > fila.getBoundingClientRect().x + 50);\n'
    + '  return { existe:true, abierta: card.classList.contains("open"),\n'
    + '    cardRect: R(card), bodyRect: R(body), filaRect: R(fila), colsRect: R(cols), conclRect: R(concl),\n'
    + "    filaTpl: fila ? getComputedStyle(fila).gridTemplateColumns : null,\n"
    + "    colsTpl: cols ? getComputedStyle(cols).gridTemplateColumns : null,\n"
    + '    nCols: colInfo.length, cols: colInfo, minCol: minCol, conclDer: !!conclDer,\n'
    + '    nIds: ids.length, ids: ids, largoTxt: txt.length,\n'
    + '    citas: { esc: nC(/ESC 20\\d\\d/g), aha: nC(/ACC\\/AHA|AHA\\/ACC/g), clase: nC(/Clase [I]+[ab]?/g),\n'
    + '             folio: nC(/folio/gi), tabla: nC(/Tabla \\d/g), celer: nC(/Celermajer DS/g) },\n'
    + '    globos: globos, nGlobos: globos.length, recortados: recort, botones: btns,\n'
    + '    scrollH: document.documentElement.scrollWidth > document.documentElement.clientWidth,\n'
    + '    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };\n'
    + '})()'
});

/* El globo: abre por clic, cierra por segundo clic, por clic afuera y por Escape. Mide el cuerpo
   y su tamanio de letra, y cuenta las citas DENTRO de la tarjeta. */
const GLOBO = (k) => '(() => {\n'
  + "  var k = '" + k + "';\n"
  + "  var b = document.querySelector('[data-vinfo=\"' + k + '\"]');\n"
  + '  if (!b) return { existe:false };\n'
  + '  b.scrollIntoView({ block:"center" });\n'
  + '  b.click();\n'
  + "  var c = document.getElementById('vinfo-card');\n"
  + '  var vis = function(){ return c && getComputedStyle(c).display !== "none" && c.getBoundingClientRect().width > 0 };\n'
  + '  var abrio = vis();\n'
  + '  var r = c ? c.getBoundingClientRect() : null;\n'
  + "  var tit = c ? (c.querySelector('#vinfo-tit')||{}).textContent : null;\n"
  + '  var cuerpo = {}; var txt = "";\n'
  + '  if (c) c.querySelectorAll("[data-vinfo-b]").forEach(function(d){\n'
  + '    var s = getComputedStyle(d).fontSize; cuerpo[s] = (cuerpo[s]||0) + (d.textContent||"").length;\n'
  + '    txt += (d.textContent||"") });\n'
  + '  b.click(); var cerro2 = !vis();\n'
  + '  b.click(); document.body.click(); var cerroFuera = !vis();\n'
  + '  b.click();\n'
  + '  document.dispatchEvent(new KeyboardEvent("keydown", { key:"Escape", bubbles:true }));\n'
  + '  var cerroEsc = !vis();\n'
  + '  if (vis()) b.click();\n'
  + '  var dentro = r ? (r.x >= -1 && r.y >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1) : null;\n'
  + '  return { existe:true, abrio:abrio, cerro2:cerro2, cerroFuera:cerroFuera, cerroEsc:cerroEsc,\n'
  + '    rect: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null, dentro:dentro,\n'
  + '    tit: tit, cuerpo: cuerpo, txt: txt,\n'
  + '    citas: { esc: (txt.match(/ESC 20\\d\\d/g)||[]).length, celer: (txt.match(/Celermajer DS/g)||[]).length,\n'
  + '             clase: (txt.match(/Clase [I]+[ab]?/g)||[]).length } };\n'
  + '})()';

const out = { file: FILE, sec: SEC, cruces: [], globos: {} };
try {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  const F = mk(SEC);
  for (const tema of TEMAS) {
    for (const W of ANCHOS) {
      const ctx = await b.newContext({ viewport: { width: W, height: 900 }, colorScheme: tema });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGE:' + String(e).slice(0, 90)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('CON:' + m.text().slice(0, 90)) });
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(900);
      const p = await pg.evaluate(F.prep);
      await pg.waitForTimeout(350);
      const f = await pg.evaluate(F.foto);
      out.cruces.push({ tema, W, prep: p, errs, ...f });
      if (tema === TEMAS[0] && W === ANCHOS[0] && f.globos) {
        for (const g of f.globos) {
          out.globos[g.k] = await pg.evaluate(GLOBO(g.k));
        }
      }
      await ctx.close();
    }
  }
  await b.close();
} catch (e) { out.error = String(e).slice(0, 300) }
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log('OK ' + OUTF + (out.error ? ' ERR ' + out.error : ''));
