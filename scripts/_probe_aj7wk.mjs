/* Sonda de MAQUETA en DOS MOTORES para la tanda AJ7 (2026-10-24).
 *
 *   node scripts/_probe_aj7wk.mjs [--file /ruta/index.html] [--dest /dir/capturas]
 *
 * Mide, a 1440 px y 390 px y en los DOS temas, lo que esta tanda movio:
 *   - CERO barra horizontal de la PAGINA.
 *   - La linea de Fallot del EN SUMA y el resumen descriptivo.
 *   - La caja del ateroma: que filas se ven.
 *   - La oracion del VD con el strain votando, y el cuadro de Referencias con su banda.
 *   - El tipo de IM y el Carpentier con protesis, y el rotulo de la morfologia sin recortarse.
 *   - El aviso de la VCI de VExUS en sus tres bordes.
 *   - Los dos globos de 44x44.
 *   - El corte de HTP en sus dos superficies.
 *   - La geometria de TODA la app: cuantas pestanas tienen caja. Un <div> sin cerrar no lanza
 *     -el parser re-anida lo que viene despues- y ningun A/B de texto lo ve; lo unico que lo
 *     delata es que pestanas AJENAS informen 0x0, que es lo que la tanda I pago.
 *
 * ⚠️ Playwright se resuelve POR RUTA. Si no esta, la sonda lo DICE y sale con codigo 2.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1)); process.exit(2); }
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file'), DEST = arg('--dest');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer(async (req, rq) => {
  try {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const p = (rel === 'index.html' && ARCH) ? ARCH : join(RAIZ, rel);
    rq.writeHead(200, { 'Content-Type': MIME[extname(rel)] || 'application/octet-stream' }).end(await readFile(p));
  } catch { rq.writeHead(404).end('no'); }
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const PORT = srv.address().port;
if (DEST) { try { await mkdir(DEST, { recursive: true }) } catch (e) {} }

const out = { arbol: ARCH || 'VIVO', md5: null, grupos: {}, abortos: [] };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

const SONDA = `window.__M = {
  despejar() { var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++ } });
    return n },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },
  set(id, v) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    if (e.tagName === 'SELECT') {
      var hay = Array.prototype.some.call(e.options, function(o){ return o.value === v });
      if (!hay) return 'NO HAY OPCION ' + v;
    }
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value },
  pon(o) { var r = {}; Object.keys(o).forEach(function(k){ r[k] = window.__M.set(k, o[k]) }); return r },
  limpiar() { try { limpiarCampos(true) } catch (e) {} return 1 },
  txt(id) { var e = document.getElementById(id);
    return e ? (e.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE ' + id },
  abrir(id) { var e = document.getElementById(id); if (!e) return false;
    var sec = e.closest ? e.closest('.tab-section') : null;
    if (sec) { try { showTab(String(sec.id || '').replace(/^tab-/, '')) } catch (x) {} }
    var n = e.parentNode;
    while (n && n.nodeType === 1 && n !== document.body) {
      if (getComputedStyle(n).display === 'none') n.style.display = 'block';
      n = n.parentNode; }
    return e.getBoundingClientRect().width > 0 },

  scrollH() { var d = document.documentElement;
    return { hay: d.scrollWidth > d.clientWidth, sw: d.scrollWidth, cw: d.clientWidth } },

  /* El centinela del div sin cerrar: pestanas AJENAS en 0x0. */
  pestanas() {
    var bs = Array.prototype.slice.call(document.querySelectorAll('.tab-btn[onclick]'));
    var o = { n: 0, conCaja: 0, cero: [] };
    bs.forEach(function(b){
      var m = /showTab\\('([^']+)'/.exec(b.getAttribute('onclick') || ''); if (!m) return;
      o.n++;
      try { showTab(m[1]) } catch (e) {}
      var p = document.getElementById('tab-' + m[1]);
      var r = p ? p.getBoundingClientRect() : { width:0, height:0 };
      if (r.width > 0 && r.height > 0) o.conCaja++; else o.cero.push(m[1]);
    });
    return o },

  /* TEXTO RECORTADO: cualquier nodo cuyo contenido no entra en su caja. */
  recortes(sel) {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll(sel), function(e){
      var r = e.getBoundingClientRect();
      if (!r.width) return;
      if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)
        out.push((e.id || e.className || e.tagName) + ' ' + e.scrollWidth + '/' + e.clientWidth);
    });
    return out },

  escFallot() {
    window.__M.limpiar();
    window.__M.pon({ nombre:'AJ7', ci:'1', tdf_func_vd:'normal', tdf_grad_tsvd:'36',
                     tdf_sintomas:'no', ip_grado:'Severa', it_grado:'2' });
    var c = null; try { c = tdfConclusion() } catch (e) {}
    var s = null; try { s = ccSumaLinea('tdf') } catch (e) {}
    return { suma: s, resumen: c ? c.resumen : null, igualTxt: !!c && c.resumen === c.txt } },

  escAtero() {
    window.__M.limpiar();
    window.__M.abrir('ao_grado_atero');
    window.__M.pon({ nombre:'AJ7', ci:'2', ao_segmento:'arco', ao_grado_atero:'4', ao_grosor_placa:'6' });
    return Array.prototype.map.call(
      document.querySelectorAll('#ete-seccion-aorta .calc-box .calc-row'), function(r){
        var l = r.querySelector('.calc-lbl');
        return (l ? l.textContent.trim() : '') + '=' + (getComputedStyle(r).display !== 'none'); }) },

  escVD() {
    var o = {};
    [['leve','-18'], ['bajo','-12'], ['normal','-25']].forEach(function(p){
      window.__M.limpiar();
      window.__M.abrir('vd_strain_pl');
      window.__M.pon({ nombre:'AJ7', ci:'3', tapse:'22', s_prime:'13', vd_strain_pl:p[1] });
      try { generarInforme() } catch (e) {}
      var t = (document.getElementById('informe_texto') || {}).value || '';
      o[p[0]] = t.split('\\n').filter(function(l){ return /ventr[ií]culo derecho/i.test(l) }).join(' ');
    });
    /* DENOMINADOR: la ficha vive dentro de una subpestana PLEGADA. Sin abrirla con su propio
       toggle, evRefPintar sale temprano y la sonda informa CERO filas — un verde sobre cero
       elementos. Medido: la primera version devolvia [] y chip:false en los dos motores. */
    try { showTab('referencias') } catch (e) {}
    try { if (typeof toggleRef === 'function') toggleRef('vd2', null) } catch (e) {}
    try { if (typeof evRefPintar === 'function') evRefPintar('vd2') } catch (e) {}
    var h = document.getElementById('ref-vd2-cuerpo');
    if (h) { var n2 = h.parentNode;
      while (n2 && n2.nodeType === 1 && n2 !== document.body) {
        if (getComputedStyle(n2).display === 'none') n2.style.display = 'block';
        n2 = n2.parentNode; }
      try { if (typeof evRefPintar === 'function') evRefPintar('vd2') } catch (e) {} }
    o.filas = h ? Array.prototype.map.call(h.querySelectorAll('tr'), function(tr){
      return Array.prototype.map.call(tr.querySelectorAll('th,td'), function(c){
        return (c.textContent || '').trim() }).join(' | ') })
      .filter(function(x){ return x.indexOf('Strain') === 0 }) : ['NO HAY ref-vd2-cuerpo'];
    o.chip = !!h && /CRITERIO DE ECOSMART/.test(h.textContent || '');
    return o },

  escMitral() {
    var o = {};
    ['Mixomatosa / Barlow', 'Prótesis biológica'].forEach(function(m){
      window.__M.limpiar();
      window.__M.abrir('vm_morf');
      window.__M.pon({ nombre:'AJ7', ci:'4', vm_morf:m, vm_tipo_im:'primaria', vm_carp:'II' });
      try { if (typeof vmMorfFitSync === 'function') vmMorfFitSync() } catch (e) {}
      var e1 = document.getElementById('vm_tipo_im'), e2 = document.getElementById('vm_carp');
      var mo = document.getElementById('vm_morf');
      var cs = mo ? getComputedStyle(mo) : null;
      var util = null, w = null;
      if (mo && cs) {
        var r = mo.getBoundingClientRect();
        util = Math.round(r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 18);
        var cv = document.createElement('canvas').getContext('2d');
        cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        var op = mo.options[mo.selectedIndex];
        w = op ? Math.round(cv.measureText(op.text).width) : null;
      }
      o[m] = { dis: !!(e1 && e1.disabled), op: e1 ? getComputedStyle(e1).opacity : null,
               v1: e1 ? e1.value : null, v2: e2 ? e2.value : null,
               fs: cs ? cs.fontSize : null, util: util, w: w, entra: (w != null && util != null) ? w <= util : null };
    });
    return o },

  escVexus() {
    var o = {};
    ['19','20','21'].forEach(function(d){
      window.__M.limpiar();
      window.__M.abrir('vexus_ir');
      window.__M.pon({ nombre:'AJ7', ci:'5', vci_diam:d, vexus_sh:'2' });
      o[d] = window.__M.txt('vexus-vci-aviso');
    });
    return o },

  escGlobos() {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll('button.vinfo-btn-44'), function(b){
      var n = b.parentNode;
      while (n && n.nodeType === 1 && n !== document.body) {
        if (getComputedStyle(n).display === 'none') n.style.display = 'block';
        n = n.parentNode; }
      try { b.scrollIntoView({ block:'center' }) } catch (e) {}
      var r = b.getBoundingClientRect();
      var pts = [[r.left+1,r.top+1],[r.right-1,r.top+1],[r.left+1,r.bottom-1],[r.right-1,r.bottom-1],
                 [(r.left+r.right)/2,(r.top+r.bottom)/2]];
      out.push({ k: b.getAttribute('data-vinfo'), w: Math.round(r.width), h: Math.round(r.height),
                 propios: pts.filter(function(p){ return document.elementFromPoint(p[0],p[1]) === b }).length });
    });
    return out },

  escHP() {
    window.__M.limpiar();
    window.__M.abrir('e_sep');
    window.__M.pon({ nombre:'AJ7', ci:'6', peso:'80', talla:'175', onda_e:'90', e_sep:'6', e_lat:'8' });
    var o = { dueno: (typeof window.HP_PAPM_MIN === 'number') ? window.HP_PAPM_MIN : 'NO EXISTE' };
    [['19',27.868852], ['20',29.5], ['21',29.6]].forEach(function(p){
      var e = document.getElementById('psap_calc'); if (!e) { o[p[0]] = 'NO EXISTE psap_calc'; return; }
      e.value = String(p[1]); e.dispatchEvent(new Event('input',{bubbles:true}));
      try { calcHemo() } catch (x) {}
      o[p[0]] = window.__M.txt('hemo-htp-tipo').slice(0, 60);
    });
    return o }
};
1`;

async function correrMotor(nombre, lanzar) {
  const nav = await lanzar();
  const g = { celdas: {}, errs: [] };
  for (const W of [1440, 390]) {
    const ctx = await nav.newContext({ viewport: { width: W, height: 900 } });
    const pag = await ctx.newPage();
    pag.on('pageerror', (e) => g.errs.push(nombre + '@' + W + ': ' + String(e.message).slice(0, 160)));
    pag.on('console', (m) => { if (m.type() === 'error') g.errs.push(nombre + '@' + W + ' console: ' + m.text().slice(0, 160)) });
    await pag.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
    await pag.evaluate(() => { try { sessionStorage.setItem('ett_auth', '1') } catch (e) {} });
    await pag.reload({ waitUntil: 'load' });
    await pag.waitForTimeout(2500);
    await pag.evaluate(SONDA);
    for (const claro of [false, true]) {
      const k = W + (claro ? '_claro' : '_oscuro');
      const c = {};
      c.despejo = await pag.evaluate(() => window.__M.despejar());
      c.tema = await pag.evaluate(cl => window.__M.tema(cl), claro);
      c.pestanas = await pag.evaluate(() => window.__M.pestanas());
      c.fallot = await pag.evaluate(() => window.__M.escFallot());
      c.atero = await pag.evaluate(() => window.__M.escAtero());
      c.vd = await pag.evaluate(() => window.__M.escVD());
      c.mitral = await pag.evaluate(() => window.__M.escMitral());
      c.vexus = await pag.evaluate(() => window.__M.escVexus());
      c.globos = await pag.evaluate(() => window.__M.escGlobos());
      c.hp = await pag.evaluate(() => window.__M.escHP());
      c.recortes = await pag.evaluate(() => window.__M.recortes('.calc-row, .calc-lbl, .ev-ref td, select'));
      c.scroll = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `aj7_${nombre}_${k}.png`) }) } catch (e) {} }
      g.celdas[k] = c;
    }
    await ctx.close();
  }
  await nav.close();
  return g;
}

try { out.grupos.chrome = await correrMotor('chrome', () => chromium.launch({ channel: 'chrome' })); }
catch (e) { out.abortos.push('chrome: ' + e.message); }
try { out.grupos.webkit = await correrMotor('webkit', () => webkit.launch()); }
catch (e) { out.abortos.push('webkit: ' + e.message); }

console.log(JSON.stringify(out, null, 1));
try { srv.close() } catch (e) {}
process.exit(0);
