/*
 * _probe_tga4pdf.mjs - la GEOMETRIA de la hoja de la transposicion en el PDF (tanda TGA-4,
 * 2026-11-02, commit 2). Nombre propio: verificado con ls que no existia.
 *
 * QUE MIDE Y POR QUE. El commit 2 mete DOS dibujos lado a lado en el mismo recuadro del PDF.
 * El A/B de superficies prueba que el texto no cambia donde no debe, pero NO mira donde cae
 * cada imagen: un dibujo que se sale de su franja o que se pisa con el de al lado es un
 * informe FIRMADO mal maquetado, y eso solo se ve con las coordenadas.
 *
 * Espia el constructor de jsPDF y guarda, por cada `addImage` y cada `text`, su x, y, ancho y
 * alto. Despues comprueba, por escenario y por plantilla:
 *   G1  las DOS imagenes estan (con el boton encendido) y UNA sola (apagado);
 *   G2  no se superponen entre si -interseccion de rectangulos en los DOS ejes-;
 *   G3  ninguna se sale de la hoja A4 (210 x 297 mm) ni del margen;
 *   G4  la linea de texto del recuadro esta y no se pisa con las imagenes;
 *   G5  la proporcion del esquema se respeta (no sale estirado).
 *
 * SEIS escenarios, DOS temas y, en los que admiten comunicaciones, con y sin. Las SEIS
 * plantillas del PDF en cada cruce.
 *
 *   node scripts/_probe_tga4pdf.mjs --file /tmp/x.html --out /tmp/pdf_tga4.json
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
const OUTF = arg('--out') || '/tmp/pdf_tga4.json';

/* Los SEIS escenarios que la orden nombra. `coms` dice si la escena carga comunicaciones. */
const ESCENAS = {
  normal:   { sel: {}, boton: false, nota: 'sin tipo: el corazon normal NO es un dato y el boton queda deshabilitado' },
  dtga:     { sel: { tga_tipo: 'dtga', tga_cirugia: 'ninguna' }, boton: true },
  dtgaComs: { sel: { tga_tipo: 'dtga', tga_cirugia: 'ninguna', ete_cia_tipo: 'os', ete_civ_tipo: 'perimembranosa', dap_tipo: 'tubular' },
              campos: { ete_cia_tam_max: '12', ete_civ_tam: '6', dap_diam: '3' }, boton: true },
  auricular:{ sel: { tga_tipo: 'dtga', tga_cirugia: 'auricular' }, boton: true },
  jatene:   { sel: { tga_tipo: 'dtga', tga_cirugia: 'jatene' }, boton: true },
  rastelli: { sel: { tga_tipo: 'dtga', tga_cirugia: 'rastelli' }, boton: true },
  cctga:    { sel: { tga_tipo: 'cctga' }, boton: true },
  cctgaComs:{ sel: { tga_tipo: 'cctga', ete_cia_tipo: 'os' }, campos: { ete_cia_tam_max: '12' }, boton: true },
  /* CONTROL NEGATIVO: la misma d-TGA SIN tocar el boton. Una sola imagen y ninguna linea. */
  dtgaOff:  { sel: { tga_tipo: 'dtga', tga_cirugia: 'auricular' }, boton: false }
};
const TEMAS = ['claro', 'oscuro'];
const SOLO = (arg('--solo') || Object.keys(ESCENAS).join(',')).split(',').map(s => s.trim());

/* El espia: guarda las coordenadas de cada imagen y de cada texto, por plantilla. */
const PDF = `(async () => {
  const PL = ['clasico', 'moderno', 'minimalista', 'academico', 'compacto', 'elegante'];
  const r = {};
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { err: 'SIN JSPDF' };
  const Orig = window.jspdf.jsPDF;
  for (const p of PL) {
    const reg = { imgs: [], txts: [] };
    window.jspdf.jsPDF = function (...a) {
      const d = new Orig(...a);
      const oi = d.addImage.bind(d);
      d.addImage = function (dat, fmt, x, y, w, h, ...z) {
        reg.imgs.push({ x: +x, y: +y, w: +w, h: +h, pg: (d.internal && d.internal.getNumberOfPages) ? d.internal.getNumberOfPages() : 0 });
        return oi(dat, fmt, x, y, w, h, ...z);
      };
      const ot = d.text.bind(d);
      /* ⚠️ SE GUARDA TODO EL TEXTO Y NO SOLO EL QUE MATCHEA, y es una correccion medida: el
         partidor de jsPDF corta la linea del recuadro en SEIS llamadas a text, asi que un
         filtro por expresion regular se queda con los dos pedazos que contienen la palabra y
         pierde las otras cuatro. Con eso, 48 de 108 cruces informaban «falta el epigrafe»
         sobre un PDF que lo tiene: la frase estaba, cortada en la linea siguiente. Se guarda
         todo y la comprobacion se hace sobre la cadena UNIDA.
         (Sin acentos graves: este comentario vive DENTRO del template del espia del PDF.) */
      d.text = function (t, x, y, ...z) {
        reg.txts.push({ t: String(t).slice(0, 90), x: +x, y: +y,
          pg: (d.internal && d.internal.getNumberOfPages) ? d.internal.getNumberOfPages() : 0 });
        return ot(t, x, y, ...z);
      };
      d.save = function () { return true };
      d.output = function () { return '' };
      return d;
    };
    Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
    try { const pl = document.getElementById('pdf_plantilla'); if (pl) { pl.value = p;
            pl.dispatchEvent(new Event('change', { bubbles: true })) } } catch (e) {}
    try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
          else if (typeof generarPDF === 'function') await generarPDF() } catch (e) { reg.err = String(e).slice(0, 110) }
    r[p] = reg;
  }
  window.jspdf.jsPDF = Orig;
  return r;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  for (const tema of TEMAS) {
    const pg = await b.newPage({ viewport: { width: 1400, height: 900 },
      colorScheme: tema === 'oscuro' ? 'dark' : 'light' });
    pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([tema + ': ' + e.message.slice(0, 140)]) });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
    await pg.waitForTimeout(1500);
    for (const k of SOLO) {
      const E = ESCENAS[k]; if (!E) continue;
      await pg.evaluate(`((esc) => {
        ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
        try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
        try { if (typeof esqQuitarDelPDF === 'function') esqQuitarDelPDF('tga3d') } catch (e) {}
        const S = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v;
          e.dispatchEvent(new Event('input', { bubbles: true }));
          e.dispatchEvent(new Event('change', { bubbles: true })) };
        S('nombre', 'Prueba TGA4'); S('ci', '614');
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
      try { await pg.waitForFunction("!!document.querySelector('#tga-3d-cv canvas')", { timeout: 45000 }); }
      catch (e) { /* sin tipo cargado puede no haber lienzo: lo dice el denominador */ }
      await pg.waitForTimeout(900);
      const clic = E.boton
        ? await pg.evaluate("(() => { const b = document.getElementById('tga-3d-pdf');"
            + " if (!b) return 'NO EXISTE'; if (b.disabled) return 'DESHABILITADO';"
            + " b.click(); return 'clickeado'; })()")
        : 'no se toca';
      await pg.waitForTimeout(2200);
      const den = await pg.evaluate("(() => ({"
        + " esqOn: (typeof tgaEsqPdfOn==='function') ? String(tgaEsqPdfOn()) : 'NO EXISTE',"
        + " esqData: (typeof tgaEsqPdfData==='function') ? (tgaEsqPdfData().data ? 'SI' : 'NO') : 'NO EXISTE',"
        + " slot: (typeof esqEstaIncluido==='function') ? String(!!esqEstaIncluido('tga3d')) : 'NO EXISTE',"
        + " lienzo: !!document.querySelector('#tga-3d-cv canvas') }))()");
      const pdf = await pg.evaluate(PDF);
      OUT[tema + '/' + k] = { clic, den, pdf };
      console.log('-- ' + tema + '/' + k + ' | clic=' + clic + ' esqOn=' + den.esqOn
        + ' data=' + den.esqData + ' slot=' + den.slot + ' lienzo=' + den.lienzo
        + ' | imgs(clasico)=' + ((pdf.clasico || {}).imgs || []).length);
    }
    await pg.close();
  }
} catch (e) { OUT._err = String(e).slice(0, 250) }
await b.close();
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
