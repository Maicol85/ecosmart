/*
 * _probe_pant2a.mjs - EL COLOR del esquema de circulacion en el PDF (tanda PANT-2, correccion A,
 * 2026-11-02). Nombre propio: verificado con ls que no existia.
 *
 * QUE MIDE Y POR QUE. El medico reporto que el esquema sale con las cajas NEGRAS y el texto en
 * serif. TGA-4 verifico la GEOMETRIA del PDF (sin superposicion ni cortes) pero NO los colores:
 * es un hueco de verificacion. Esta sonda lo cierra midiendo el PIXEL.
 *
 *   A1  reproduce: genera el PDF de verdad y mide el dataURL que entra a addImage;
 *   A2  por cada caja del esquema, la MODA del color del interior contra el color de PANTALLA
 *       (tolerancia declarada: distancia euclidea RGB <= 30, por los artefactos del JPEG 0.9);
 *   A2b la fraccion de pixeles casi negros del interior (luminancia < 40) por caja;
 *   A3  lo mismo para TODAS las imagenes que llegan al PDF, para ver que otro diagrama sale mal;
 *   A4  la linea de texto que el papel publica.
 *
 * Tambien cuenta los var(--x) que quedan en el marcado serializado, que es la causa candidata.
 *
 *   node scripts/_probe_pant2a.mjs --file /tmp/x.html --out /tmp/pant2a.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant2a.json';

/* Los SEIS escenarios de la orden, con los mismos montajes que la sonda de TGA-4. */
const ESCENAS = {
  dtga:     { sel: { tga_tipo: 'dtga', tga_cirugia: 'ninguna' }, boton: true },
  auricular:{ sel: { tga_tipo: 'dtga', tga_cirugia: 'auricular' }, boton: true },
  jatene:   { sel: { tga_tipo: 'dtga', tga_cirugia: 'jatene' }, boton: true },
  rastelli: { sel: { tga_tipo: 'dtga', tga_cirugia: 'rastelli' }, boton: true },
  cctga:    { sel: { tga_tipo: 'cctga' }, boton: true },
  auricComs:{ sel: { tga_tipo: 'dtga', tga_cirugia: 'auricular', ete_cia_tipo: 'os', ete_civ_tipo: 'perimembranosa', dap_tipo: 'tubular' },
              campos: { ete_cia_tam_max: '12', ete_civ_tam: '6', dap_diam: '3' }, boton: true },
  /* CONTROL NEGATIVO: la misma d-TGA sin tocar el boton. No debe haber esquema. */
  dtgaOff:  { sel: { tga_tipo: 'dtga', tga_cirugia: 'auricular' }, boton: false }
};
const TEMAS = ['claro', 'oscuro'];
const SOLO = (arg('--solo') || Object.keys(ESCENAS).join(',')).split(',').map(s => s.trim());

/* El espia del PDF: guarda, por cada addImage, el dataURL COMPLETO. Una sola plantilla, porque
   la geometria de las seis ya la midio TGA-4 y lo que aca interesa es el pixel. */
const PDF = `(async () => {
  const r = { imgs: [], txts: [] };
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { err: 'SIN JSPDF' };
  const Orig = window.jspdf.jsPDF;
  window.jspdf.jsPDF = function (...a) {
    const d = new Orig(...a);
    const oi = d.addImage.bind(d);
    d.addImage = function (dat, fmt, x, y, w, h, ...z) {
      r.imgs.push({ dat: String(dat || ''), x: +x, y: +y, w: +w, h: +h });
      return oi(dat, fmt, x, y, w, h, ...z);
    };
    const ot = d.text.bind(d);
    d.text = function (t, x, y, ...z) { r.txts.push(String(t).slice(0, 160)); return ot(t, x, y, ...z) };
    d.save = function () { return true };
    d.output = function () { return '' };
    return d;
  };
  Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
  try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
        else if (typeof generarPDF === 'function') await generarPDF() } catch (e) { r.err = String(e).slice(0, 110) }
  window.jspdf.jsPDF = Orig;
  return r;
})()`;

/* La medicion del pixel. Las zonas van en unidades del viewBox del esquema (300 x 290) y se
   escalan al tamanio real de la imagen, asi que no depende de TGA_ESQ_PDF_W/H.
   La MODA se cuantiza a multiplos de 8 para que los artefactos del JPEG no la partan. */
const MEDIR = `(async (dataURL, zonas, vbW, vbH) => {
  const im = new Image();
  const ok = await new Promise(res => { im.onload = () => res(true); im.onerror = () => res(false); im.src = dataURL;
    setTimeout(() => res(false), 8000) });
  if (!ok) return { err: 'no decodifica' };
  const W = im.naturalWidth, H = im.naturalHeight;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0);
  const out = { W: W, H: H, zonas: {} };
  const sx = W / vbW, sy = H / vbH;
  zonas.forEach(z => {
    const x0 = Math.round(z.x * sx), y0 = Math.round(z.y * sy);
    const w = Math.max(1, Math.round(z.w * sx)), h = Math.max(1, Math.round(z.h * sy));
    let d; try { d = cx.getImageData(x0, y0, w, h).data } catch (e) { out.zonas[z.n] = { err: String(e).slice(0,60) }; return }
    const cuentas = {}; let negros = 0, tot = 0, minL = 999, minC = null, maxL = -1, maxC = null;
    for (let i = 0; i < d.length; i += 4) {
      const R = d[i], G = d[i+1], B = d[i+2];
      const L = 0.299 * R + 0.587 * G + 0.114 * B;
      tot++;
      if (L < 40) negros++;
      if (L < minL) { minL = L; minC = [R, G, B] }
      if (L > maxL) { maxL = L; maxC = [R, G, B] }
      const k = (R >> 3) + ',' + (G >> 3) + ',' + (B >> 3);
      cuentas[k] = (cuentas[k] || 0) + 1;
    }
    let mejor = null, nMejor = -1;
    Object.keys(cuentas).forEach(k => { if (cuentas[k] > nMejor) { nMejor = cuentas[k]; mejor = k } });
    const p = mejor.split(',').map(v => (+v) * 8 + 4);
    /* ⚠️ EL CONTRASTE SE MIDE CONTRA EL COLOR MAS ALEJADO DEL FONDO, no contra el mas OSCURO, y
       es una correccion medida: en tema oscuro el pixel mas oscuro de una caja ES el propio
       fondo, asi que el ratio salia 1,09 sobre un dibujo perfectamente legible. El texto es el
       extremo CONTRARIO al fondo, y cual de los dos es depende del tema. */
    const _lum = (c) => { const f = (v) => { v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]) };
    const _rat = (a, b) => { const x = _lum(a), y = _lum(b);
      return +(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05))).toFixed(2) };
    const rOsc = minC ? _rat(p, minC) : 0, rCla = maxC ? _rat(p, maxC) : 0;
    out.zonas[z.n] = { moda: p, modaFrac: +(nMejor / tot).toFixed(3),
      negroFrac: +(negros / tot).toFixed(3), masOscuro: minC, masClaro: maxC,
      contraste: Math.max(rOsc, rCla), px: tot };
  });
  return out;
})`;

/* Las zonas del esquema, en unidades del viewBox. Interior con 6 de margen para esquivar el
   borde y su esquina redondeada (rx=8). Las cuatro cavidades esperan var(--bg) de relleno; los
   dos organos, var(--bg3). */
const ZONAS = [
  { n: 'cav_TL', x: 46, y: 84, w: 68, h: 32 },
  { n: 'cav_TR', x: 186, y: 84, w: 68, h: 32 },
  { n: 'cav_BL', x: 46, y: 164, w: 68, h: 32 },
  { n: 'cav_BR', x: 186, y: 164, w: 68, h: 32 },
  { n: 'org_pulm', x: 66, y: 14, w: 168, h: 18 },
  { n: 'org_cuerpo', x: 66, y: 256, w: 168, h: 18 },
  /* Control: el fondo del lienzo, fuera de toda caja. El rasterizador lo pinta blanco opaco. */
  { n: 'fondo', x: 2, y: 2, w: 30, h: 20 }
];

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, zonas: ZONAS.map(z => z.n) };
try {
  for (const tema of TEMAS) {
    const pg = await b.newPage({ viewport: { width: 1400, height: 900 },
      colorScheme: tema === 'oscuro' ? 'dark' : 'light' });
    pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([tema + ': ' + e.message.slice(0, 140)]) });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
    await pg.waitForTimeout(1500);
    /* EL TEMA DE LA APP ES LA CLASE light-mode EN <html>, no prefers-color-scheme: el
       colorScheme de Playwright NO lo mueve. Medido contra HEAD: --bg daba #0f1117 en los dos
       cruces, o sea que los dos temas median el MISMO. */
    await pg.evaluate("(() => { const t = " + JSON.stringify(tema) + ";"
      + " const h = document.documentElement;"
      + " if (t === 'claro') h.classList.add('light-mode'); else h.classList.remove('light-mode');"
      + " try { localStorage.setItem('ett_theme', t === 'claro' ? 'light' : 'dark') } catch (e) {}"
      + " try { if (typeof lv3dAlCambiarTema === 'function') lv3dAlCambiarTema() } catch (e) {}"
      + " return String(getComputedStyle(h).getPropertyValue('--bg')).trim() })()");
    await pg.waitForTimeout(400);
    for (const k of SOLO) {
      const E = ESCENAS[k]; if (!E) continue;
      await pg.evaluate(`((esc) => {
        ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
        try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
        try { if (typeof esqQuitarDelPDF === 'function') esqQuitarDelPDF('tga3d') } catch (e) {}
        const S = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v;
          e.dispatchEvent(new Event('input', { bubbles: true }));
          e.dispatchEvent(new Event('change', { bubbles: true })) };
        S('nombre', 'Prueba PANT2'); S('ci', '619');
        Object.keys(esc.campos || {}).forEach(x => S(x, esc.campos[x]));
        Object.keys(esc.sel || {}).forEach(x => S(x, esc.sel[x]));
        try { if (typeof eteInclToggle === 'function') eteInclToggle('tga_incluir_chk') } catch (e) {}
        const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
          x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
        const Q = String.fromCharCode(39);
        const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click();
        const b2 = bq('ccSubTab(' + Q + 'congenitas2'); if (b2) b2.click();
        const acc = document.getElementById('sacc-cc-tga');
        if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-tga .sacc-hdr'); if (h) h.click() }
        const t = document.getElementById('tga_tipo'); if (t && t.value) t.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })(${JSON.stringify(E)})`);
      try { await pg.waitForFunction("!!document.querySelector('#tga-3d-cv canvas')", { timeout: 45000 }) } catch (e) {}
      await pg.waitForTimeout(900);
      const clic = E.boton
        ? await pg.evaluate("(() => { const b = document.getElementById('tga-3d-pdf');"
            + " if (!b) return 'NO EXISTE'; if (b.disabled) return 'DESHABILITADO';"
            + " b.click(); return 'clickeado'; })()")
        : 'no se toca';
      await pg.waitForTimeout(2200);
      /* El denominador y la causa candidata: cuantos var( quedan en el marcado serializado, y
         si el SVG declara font-family. Mas los colores de PANTALLA con que comparar. */
      const den = await pg.evaluate("(() => { const o = {};"
        + " o.esqOn = (typeof tgaEsqPdfOn==='function') ? String(tgaEsqPdfOn()) : 'NO EXISTE';"
        + " const dd = (typeof tgaEsqPdfData==='function') ? tgaEsqPdfData() : null;"
        + " o.esqData = (dd && dd.data) ? 'SI' : 'NO';"
        + " o.linea = dd ? String(dd.linea || '') : '';"
        + " o.pre = (dd && dd.data) ? String(dd.data).slice(0, 48) : '';"
        + " const cont = document.getElementById('tga-esq-svg');"
        + " const svg = cont && cont.firstChild;"
        + " let tx = ''; try { tx = svg ? new XMLSerializer().serializeToString(svg) : '' } catch (e) {}"
        + " o.svgLen = tx.length;"
        + " o.nVar = (tx.split('var(--').length - 1);"
        + " o.ff = tx.indexOf('font-family') >= 0 ? 'SI' : 'NO';"
        /* Y el marcado QUE DE VERDAD SE RASTERIZA, que es el del DOM pasado por el resolvedor.
           El del DOM tiene var( a proposito —ahi las variables SI existen—, asi que medir solo
           ese no dice nada del papel: es la diferencia entre la causa y el arreglo. */
        + " o.rasVar = (typeof esqSvgParaRaster === 'function' && tx)"
        + "   ? (esqSvgParaRaster(tx).split('var(--').length - 1) : 'NO EXISTE';"
        + " o.rasFF = (typeof esqSvgParaRaster === 'function' && tx)"
        + "   ? (esqSvgParaRaster(tx).indexOf('font-family') >= 0 ? 'SI' : 'NO') : 'NO EXISTE';"
        + " const cs = getComputedStyle(document.documentElement);"
        + " o.css = {}; ['--bg','--bg3','--border','--text','--text2','--tga-esq-azul','--tga-esq-rojo','--tga-esq-naranja']"
        + "   .forEach(n => { o.css[n] = String(cs.getPropertyValue(n) || '').trim() });"
        + " o.pantTxt = (() => { const e = document.getElementById('tga-esq-txt'); return e ? String(e.textContent||'') : '' })();"
        + " return o })()");
      /* La medicion del pixel sobre el dataURL que el papel publica. */
      let pix = { err: 'sin data' };
      if (den.esqData === 'SI') {
        pix = await pg.evaluate("(" + MEDIR + ")(tgaEsqPdfData().data, " + JSON.stringify(ZONAS) + ", 300, 290)");
      }
      /* El PDF de verdad, para confirmar que ESE dataURL es el que entra. */
      const pdf = await pg.evaluate(PDF);
      const imgs = (pdf.imgs || []).map(i => ({ x: i.x, y: i.y, w: +i.w.toFixed(1), h: +i.h.toFixed(1),
        len: i.dat.length, pre: i.dat.slice(0, 48) }));
      const enPdf = den.pre ? imgs.some(i => i.pre === den.pre) : false;
      /* A3: la fraccion de negros de CADA imagen del PDF, zona completa. */
      const otras = [];
      for (let i = 0; i < (pdf.imgs || []).length; i++) {
        const d = pdf.imgs[i].dat;
        if (!d || d.indexOf('data:image') !== 0) { otras.push({ i: i, err: 'no es dataURL' }); continue }
        const m = await pg.evaluate("(" + MEDIR + ")(" + JSON.stringify(d)
          + ", [{n:'todo',x:0,y:0,w:1,h:1}], 1, 1)");
        otras.push({ i: i, W: m.W, H: m.H, pre: d.slice(0, 32),
          negroFrac: (m.zonas && m.zonas.todo) ? m.zonas.todo.negroFrac : null,
          moda: (m.zonas && m.zonas.todo) ? m.zonas.todo.moda : null });
      }
      OUT[tema + '/' + k] = { clic, den, pix, imgs, enPdf, otras,
        pdfTxtEsq: (pdf.txts || []).filter(t => /esquem|Circulaci|ilustrativ|no se dibuja|transposici/i.test(t)),
        pdfTxtTodo: (pdf.txts || []) };
      console.log('-- ' + tema + '/' + k + ' | clic=' + clic + ' data=' + den.esqData
        + ' nVar=' + den.nVar + '/ras=' + den.rasVar + ' ff=' + den.rasFF + ' enPdf=' + enPdf
        + ' | negro TL=' + ((pix.zonas && pix.zonas.cav_TL) ? pix.zonas.cav_TL.negroFrac : '-')
        + ' moda TL=' + ((pix.zonas && pix.zonas.cav_TL) ? pix.zonas.cav_TL.moda.join('/') : '-')
        + ' | imgs=' + imgs.length);
    }
    await pg.close();
  }
} catch (e) { OUT._err = String(e).slice(0, 250) }
await b.close();
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
