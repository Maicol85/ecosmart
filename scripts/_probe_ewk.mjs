#!/usr/bin/env node
/**
 * _probe_ewk.mjs - la tanda E en los DOS motores: HTP y HF-PEFF.
 * Cierra las mediciones que la sonda de CDP no puede hacer, porque CDP solo habla con Chrome:
 *   texto   - los once signos de la tabla de HTP, las dos hojas del PDF, la conclusion del
 *             score y las dos secciones de Evidencia, en Chrome y en WebKit.
 *   maqueta - la tabla de signos a TRES viewports x DOS temas, con el color REAL resuelto y
 *             el scroll horizontal de la PAGINA.
 *   captura - la tabla, las dos fichas de Referencias y las dos secciones de Evidencia.
 *
 *   node scripts/_probe_ewk.mjs --dest /tmp/cap_e > /tmp/ewk.NEW.json
 *   node scripts/_probe_ewk.mjs --file /tmp/index.EHEAD.html > /tmp/ewk.HEAD.json
 *
 * ADVERTENCIA: WebKit de Playwright NO es Safari, y se declara.
 * Sin acentos graves dentro del template de la sonda, tampoco en sus comentarios.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

/* Playwright se resuelve POR RUTA. Si no esta, la sonda lo DICE y sale con codigo 2. */
const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file');
const DEST = arg('--dest');
const SOLO = (arg('--solo') || '').split(',').map(s => s.trim()).filter(Boolean);
const corre = (g) => !SOLO.length || SOLO.indexOf(g) > -1;

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

const SONDA = `window.__P = {
  despejar() {
    var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++; }
    });
    return n },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },
  /* El escenario se arma con asignacion directa mas el evento, porque aca no hay CDP para
     teclas reales. Lo que esta sonda mide es MAQUETA y TEXTO en el OTRO motor; la cuenta con
     teclas de verdad la mide la sonda de CDP. Se declara. */
  set(id, v) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value },
  geo(id) { var e = document.getElementById(id); if (!e) return { ok:false, falta:id };
    var r = e.getBoundingClientRect();
    return { ok: r.width > 0 && r.height > 0, w: Math.round(r.width), h: Math.round(r.height) } },
  color(sel) { var e = document.querySelector(sel); if (!e) return 'NO EXISTE ' + sel;
    return getComputedStyle(e).color },
  scrollH() { var d = document.documentElement;
    return { hay: d.scrollWidth > d.clientWidth, sw: d.scrollWidth, cw: d.clientWidth } },

  /* La seccion de HTP nace CERRADA y vive en Hemodinamica: sin abrirla la tabla mide 0x0 y
     «cero scroll horizontal» sale sobre una pantalla que no esta dibujada. */
  abrirHtp() {
    try { if (typeof showTab === 'function') showTab('hemodinamica') } catch (e) {}
    try { var d = document.getElementById('htp2022-seccion');
      if (d && getComputedStyle(d).display === 'none' && typeof toggleCard === 'function')
        toggleCard('htp2022-seccion', document.getElementById('htp2022-arrow')) } catch (e) {}
    return window.__P.geo('htp2022-tabla') },

  /* La escena de HTP: un signo de cada categoria y la VRT alta, con los campos reales. */
  escHtp() {
    window.__P.abrirHtp();
    var o = {};
    o.vrt = window.__P.set('vmax_it', '3.5');
    o.tvia = window.__P.set('tvia', '90');
    o.ad = window.__P.set('ad_area', '22');
    o.vciD = window.__P.set('vci_diam', '25');
    o.vciC = window.__P.set('vci_col', '<50');
    o.ap = window.__P.set('ip_ap_diam', '30');
    o.ao = window.__P.set('ao_sin', '28');
    try { if (typeof calcHTP2022 === 'function') calcHTP2022() } catch (e) {}
    return o },

  /* La escena de HF-PEFF: los tres dominios con datos. BSA exacta con 80 kg y 180 cm. */
  escHf() {
    var o = {};
    [['peso','80'],['talla','180'],['edad','70'],['fevi','60'],
     ['onda_e','120'],['e_sep','5'],['e_lat','7'],['ai_vol','90'],
     ['ddfvi','45'],['siv','14'],['ppvi','14'],['hf_ntprobnp','900']].forEach(function(p){
      o[p[0]] = window.__P.set(p[0], p[1]); });
    try { if (typeof calcHFAPEFF === 'function') calcHFAPEFF() } catch (e) {}
    try { if (typeof hfapeffPintar === 'function') hfapeffPintar() } catch (e) {}
    return o },

  /* La tabla de signos, leida del DOM renderizado. */
  htpTabla() {
    var t = document.getElementById('htp2022-tabla');
    if (!t) return 'NO EXISTE';
    var trs = t.querySelectorAll('tr[data-htp-signo]'), fs = [];
    for (var i = 0; i < trs.length; i++) {
      var tr = trs[i], tds = tr.querySelectorAll('td'), b = tr.getBoundingClientRect();
      fs.push({ clave: tr.getAttribute('data-htp-signo'), cat: tr.getAttribute('data-htp-cat'),
                estado: tr.getAttribute('data-htp-estado'),
                signo: tds[0] ? (tds[0].textContent || '').trim() : null,
                criterio: tds[1] ? (tds[1].textContent || '').trim() : null,
                txtEstado: tds[2] ? (tds[2].textContent || '').trim() : null,
                cols: tds.length, geo: Math.round(b.width) + 'x' + Math.round(b.height) });
    }
    var gr = Array.prototype.map.call(t.querySelectorAll('tr[data-htp-grupo]'),
      function(x){ return (x.textContent || '').trim() });
    return { n: fs.length, filas: fs, grupos: gr,
             prob: ((document.getElementById('htp2022-prob') || {}).textContent || '').trim() } },

  /* Las dos hojas del PDF, crudas. */
  pdfHtp() { try { return typeof amiloTextoHTP === 'function' ? amiloTextoHTP() : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },
  pdfHf()  { try { return typeof amiloTextoHFAPEFF === 'function' ? amiloTextoHFAPEFF() : 'SIN FN' }
    catch (e) { return 'EXC: ' + e.message } },

  /* La conclusion del score, por su dueno. */
  hfConcl() { try {
    if (typeof hfapeffScore !== 'function' || typeof hfapeffConclusion !== 'function') return 'SIN FN';
    var r = hfapeffScore(); return { total: r.total, txt: hfapeffConclusion(r) } }
    catch (e) { return 'EXC: ' + e.message } },

  /* Una seccion del panel de Evidencia, por su titulo. IND_SECS es un const de MODULO y NO una
     propiedad de window: el identificador pelado si se ve. */
  evid(pref) { try {
    var S = (typeof IND_SECS !== 'undefined') ? IND_SECS : null;
    if (!S) return 'SIN IND_SECS';
    var norm = function(s){ return String(s || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '') };
    for (var i = 0; i < S.length; i++) {
      if (norm(S[i].tit).indexOf(norm(pref)) === 0) {
        var r = S[i].fn();
        if (!r) return { nula: true };
        var bl = (r.bloques || []).map(function(b){
          return { tit: b.tit || null, n: (b.lineas || []).length,
                   lineas: (b.lineas || []).map(function(l){ return String(l.txt || '').slice(0, 170) }) } });
        return { tit: S[i].tit, nFilas: (r.filas || []).length,
                 filas: (r.filas || []).map(function(f){ return String(f.lbl || f.txt || '').slice(0, 90) }),
                 nBloques: bl.length, bloques: bl,
                 nNotas: (r.notas || []).length };
      }
    }
    return 'SIN SECCION ' + pref }
    catch (e) { return 'EXC: ' + e.message } },

  /* Una ficha de Referencias, por su id. */
  ficha(id) { try { var e = document.getElementById(id);
    if (!e) return 'NO EXISTE ' + id;
    var t = (e.textContent || '').replace(/\\u00a0/g, ' ');
    t = t.split(/[ ]+/).join(' ');
    return { largo: t.length, hash: (function(){ var h = 0;
      for (var i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) | 0 } return h })(),
      tablas: e.querySelectorAll('table').length, filas: e.querySelectorAll('tr').length,
      ecosmart: t.indexOf('CRITERIO DE ECOSMART') > -1 || t.indexOf('Criterio de EcoSmart') > -1 } }
    catch (e) { return 'EXC: ' + e.message } }
};
1`;

async function correrMotor(nombre, lanzar) {
  const nav = await lanzar();
  const ctx = await nav.newContext({ viewport: { width: 1200, height: 700 } });
  const pag = await ctx.newPage();
  const errs = [];
  pag.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  pag.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)) });
  await pag.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
  await pag.evaluate(() => { try { sessionStorage.setItem('ett_auth', '1') } catch (e) {} });
  await pag.reload({ waitUntil: 'load' });
  await pag.waitForTimeout(2500);
  await pag.evaluate(SONDA);
  const g = { celdas: {}, texto: {}, errs };

  if (corre('texto')) {
    await pag.evaluate(() => window.__P.despejar());
    g.texto.escHtp = await pag.evaluate(() => window.__P.escHtp());
    g.texto.tabla = await pag.evaluate(() => window.__P.htpTabla());
    g.texto.pdfHtp = await pag.evaluate(() => window.__P.pdfHtp());
    g.texto.escHf = await pag.evaluate(() => window.__P.escHf());
    g.texto.hfConcl = await pag.evaluate(() => window.__P.hfConcl());
    g.texto.pdfHf = await pag.evaluate(() => window.__P.pdfHf());
    g.texto.evidHtp = await pag.evaluate(() => window.__P.evid('Hipertension pulmonar'));
    g.texto.evidHf = await pag.evaluate(() => window.__P.evid('Insuficiencia cardiaca con fraccion'));
    /* Denominador: la tabla tiene que tener sus once filas y la escena producir probabilidad. */
    const t = g.texto.tabla;
    if (!t || t.n !== 11) throw new Error('DENOMINADOR tabla ' + nombre + ': ' + JSON.stringify(t && t.n));
  }

  if (corre('maqueta')) {
    for (const claro of [false, true]) {
      for (const w of [1200, 768, 360]) {
        await pag.setViewportSize({ width: w, height: w === 1200 ? 700 : (w === 768 ? 1024 : 740) });
        const ok = await pag.evaluate((c) => window.__P.tema(c), claro);
        if (!ok) throw new Error('EL TEMA NO QUEDO en ' + nombre + ' ' + w);
        await pag.waitForTimeout(100);
        await pag.evaluate(() => window.__P.despejar());
        const gt = await pag.evaluate(() => window.__P.abrirHtp());
        if (!gt || !gt.ok) throw new Error('SIN GEOMETRIA htp2022-tabla ' + nombre + ' ' + w
                                           + ' ' + JSON.stringify(gt));
        const c = { tabla: gt, scroll: await pag.evaluate(() => window.__P.scrollH()),
          colorEst: await pag.evaluate(() => window.__P.color('#htp2022-est-a1')),
          colorProb: await pag.evaluate(() => window.__P.color('#htp2022-prob')),
          filas: (await pag.evaluate(() => window.__P.htpTabla())).filas.map(f => f.geo) };
        c.denom = !!(gt.ok && c.filas.length === 11);
        if (!c.denom) throw new Error('DENOMINADOR maqueta ' + nombre + ' ' + w);
        g.celdas[(claro ? 'dia' : 'noche') + '|' + w] = c;
        if (DEST) {
          try { const el = await pag.$('#htp2022-tabla');
            if (el) { await el.scrollIntoViewIfNeeded();
              await pag.screenshot({ path: join(DEST,
                'ewk_tabla_' + nombre + '_' + w + '_' + (claro ? 'dia' : 'noche') + '.png') }); } }
          catch (e) { out.abortos.push('captura tabla ' + nombre + ' ' + w + ': ' + e.message); }
        }
      }
    }
    await pag.evaluate(() => window.__P.tema(false));
    await pag.setViewportSize({ width: 1200, height: 700 });
  }

  /* Las dos fichas de Referencias, con su captura. */
  if (corre('refs')) {
    g.texto.refHtp = await pag.evaluate(() => window.__P.ficha('ref-htp'));
    g.texto.refHf = await pag.evaluate(() => window.__P.ficha('ref-hfapeff'));
    if (DEST) {
      for (const [id, sub] of [['ref-htp', 'fun'], ['ref-hfapeff', 'fun']]) {
        for (const claro of [false, true]) {
          try {
            await pag.evaluate((c) => window.__P.tema(c), claro);
            await pag.evaluate((s) => { try { showTab('refs') } catch (e) {}
              try { refSubTab(s, document.querySelector('[data-ref-sub="' + s + '"]')) } catch (e) {}
              try { var h = document.getElementById(arguments[0]); } catch (e) {} }, sub);
            await pag.evaluate((i) => { var e = document.getElementById(i);
              if (e && getComputedStyle(e).display === 'none') {
                var hd = e.previousElementSibling; if (hd) hd.click(); } }, id);
            await pag.waitForTimeout(120);
            await pag.evaluate(() => window.__P.despejar());
            const el = await pag.$('#' + id);
            if (el) { await el.scrollIntoViewIfNeeded();
              await pag.screenshot({ path: join(DEST,
                'ewk_' + id + '_' + nombre + '_' + (claro ? 'dia' : 'noche') + '.png') }); }
          } catch (e) { out.abortos.push('captura ' + id + ' ' + nombre + ': ' + e.message); }
        }
      }
      await pag.evaluate(() => window.__P.tema(false));
    }
  }
  await ctx.close(); await nav.close();
  return g;
}

try {
  out.grupos.chrome = await correrMotor('chrome', () => chromium.launch({ channel: 'chrome' }));
} catch (e) { out.abortos.push('chrome: ' + e.message); }
try {
  out.grupos.webkit = await correrMotor('webkit', () => webkit.launch());
} catch (e) { out.abortos.push('webkit: ' + e.message); }

console.log(JSON.stringify(out, null, 1));
try { srv.close() } catch (e) {}
process.exit(0);
