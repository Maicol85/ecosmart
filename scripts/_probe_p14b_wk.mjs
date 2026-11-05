#!/usr/bin/env node
/**
 * _probe_p14b_wk.mjs - Chrome y WebKit, cuatro anchos y dos temas (PANT-14b).
 * ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema.
 *   node scripts/_probe_p14b_wk.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = [[1440,900],[1000,900],[768,900],[390,844]];

const CUERPO = `(async () => {
  const R = {}; const EL = i => document.getElementById(i);
  const esp = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const caja = e => { if (!e) return 'NO EXISTE'; const r = e.getBoundingClientRect();
    return (r.width > 0 && r.height > 0) ? Math.round(r.width) + 'x' + Math.round(r.height) : '0x0' };
  /* el estudio: una transposicion con switch auricular y su obstruccion, mas una CIA */
  try { const b = bq('showTab(' + Q + 'congenitas2' + Q); if (b) b.click() } catch (e) {}
  await esp(420);
  try { const sb = bq('ccSubTab(' + Q + 'congenitas2' + Q); if (sb) sb.click() } catch (e) {}
  await esp(300);
  try { const hd = document.querySelector('#sacc-cc-tga .sacc-hdr');
        if (hd && hd.getAttribute('aria-expanded') !== 'true') hd.click() } catch (e) {}
  await esp(400);
  const pon = (id, v) => { const e = EL(id); if (!e) return 'NO';
    if (e.tagName === 'SELECT' && !Array.prototype.some.call(e.options, o => o.value === v)) return 'SIN OPCION';
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' };
  R.pTipo = pon('tga_tipo', 'mustard');
  R.pObs = pon('tga_obstr_subaortica', 'si');
  R.pCia = pon('ete_cia_tipo', 'secundum');
  await esp(1400);
  /* el recuadro viejo, retirado, y el boton nuevo */
  R.recuadroDisp = EL('tga-3d-box') ? getComputedStyle(EL('tga-3d-box')).display : 'NO EXISTE';
  R.lienzoViejo = caja(EL('tga-3d-cv'));
  R.btnVer3D = caja(EL('tga-ver3d'));
  R.threeDesdePestania = (typeof window.THREE === 'undefined') ? 'NO cargada' : 'CARGADA';
  /* el interruptor de la CIA se encendio solo */
  R.swCia = !!(EL('ete_cia_activa') && EL('ete_cia_activa').checked);
  R.swTga = !!(EL('tga_incluir_chk') && EL('tga_incluir_chk').checked);
  /* se abre el modulo con el boton de la pestania */
  const bv = EL('tga-ver3d'); if (bv) bv.click();
  await esp(4000);
  R.panelDisp = EL('cc3d-panel') ? getComputedStyle(EL('cc3d-panel')).display : 'NO EXISTE';
  R.lienzoModulo = caja(EL('cm3d-cv'));
  R.canvas = EL('cm3d-cv') ? EL('cm3d-cv').querySelectorAll('canvas').length : -1;
  R.threeTrasAbrir = (typeof window.THREE === 'undefined') ? 'NO cargada' : 'CARGADA';
  try { R.base = _cm3d.S.base; R.bv = _cm3d.S.bv[_cm3d.S.base];
        R.modo = _cm3d.modo; R.ck = Object.keys(_cm3d.S.ck || {}).sort().join(',') } catch (e) {}
  /* el esquema, abierto con su boton */
  const esb = EL('cm3d-esb'); if (esb) esb.click();
  await esp(1300);
  const sv = EL('cm3d-schsvg');
  R.esqNodos = sv ? sv.querySelectorAll('rect,path,circle,text').length : 0;
  R.esqVars = sv ? (String(sv.innerHTML).match(/var\\(--/g) || []).length : -1;
  R.esqCaja = caja(sv);
  /* el violeta del tunel, en el esquema y en la escena */
  const vio = (typeof TGA_ESQ_VIOLETA !== 'undefined') ? String(TGA_ESQ_VIOLETA).toLowerCase() : '#x';
  let nVio = 0;
  if (sv) sv.querySelectorAll('rect,path').forEach(function (e) {
    if (String(e.getAttribute('stroke') || '').toLowerCase() === vio) nVio++ });
  R.esqVioleta = nVio;
  try { const sc = cmEscena(_cm3d.S);
    R.tubosVioleta = (sc.ex || []).filter(function (x) { return x.t === 'tube' && x.c === TGA3D_C.violet }).length;
    R.rotTunel = (sc.lb || []).filter(function (l) { return /Túnel/.test(l[0]) }).length;
    R.anilloGris = (sc.ex || []).filter(function (x) { return x.t === 'ring' && x.col === TGA3D_C.grey }).length;
    R.anilloPri = (sc.ex || []).filter(function (x) { return x.t === 'ring' && x.pri }).length;
  } catch (e) { R.escenaERR = String(e).slice(0, 80) }
  /* las dos leyendas del tunel */
  R.leg3d = EL('cm3d-leg-tun') ? !EL('cm3d-leg-tun').hidden : 'NO EXISTE';
  R.legEsq = EL('cm3d-leg2-tun') ? !EL('cm3d-leg2-tun').hidden : 'NO EXISTE';
  /* el boton del PDF, activo con transposicion */
  const pb = EL('cm3d-pdfb');
  R.pdfBtn = pb ? (pb.disabled ? 'apagado' : 'activo') : 'NO EXISTE';
  R.pdfCaja = caja(pb);
  R.pdfAvisoTga = String((EL('cm3d-pdfn') || {}).textContent || '').indexOf('transposici') >= 0;
  /* el globo del esquema, reponible y tocable */
  const gl = Array.prototype.filter.call(document.querySelectorAll('[data-vinfo="tga-esq"]'),
    function (e) { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 });
  R.globoEsq = gl.length ? caja(gl[0]) : '0x0';
  /* la linea de estado */
  R.linea = String((EL('cc3d-faltan') || {}).textContent || '').slice(0, 90);
  /* ni barra horizontal ni texto recortado */
  const cu = document.querySelector('.app-content') || document.body;
  R.scrollH = Math.max(0, cu.scrollWidth - cu.clientWidth);
  let rec = 0;
  document.querySelectorAll('#cc3d-panel *, #tab-congenitas2 *').forEach(function (e) {
    if (e.children.length) return; const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    if (e.id === 'cc3d-alt' || /visually/.test(e.className || '')) return;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'visible') rec++ });
  R.recortados = rec;
  return R;
})()`;

const salida = {};
for (const motor of ['chrome', 'webkit']) {
  let br;
  try {
    br = (motor === 'chrome') ? await _pw.chromium.launch({ channel: 'chrome' }) : await _pw.webkit.launch();
  } catch (e) { salida[motor] = { fatal: 'no arranca: ' + String(e).slice(0, 120) }; continue }
  for (const [w, h] of ANCHOS) {
    for (const tema of ['oscuro', 'claro']) {
      const ctx = await br.newContext({ viewport: { width: w, height: h },
        colorScheme: tema === 'claro' ? 'light' : 'dark' });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 110)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text().slice(0, 110)) });
      const clave = motor + '/' + w + 'px/' + tema;
      try {
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
        await pg.waitForTimeout(2000);
        if (tema === 'claro') { await pg.evaluate("try{document.documentElement.classList.add('light-mode')}catch(e){}") }
        const r = await pg.evaluate(CUERPO);
        r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon|Unable to load|font/i.test(e));
        salida[clave] = r;
      } catch (e) { salida[clave] = { fatal: String(e).slice(0, 180), errs } }
      await ctx.close();
    }
  }
  await br.close();
}
console.log(JSON.stringify(salida, null, 1));
