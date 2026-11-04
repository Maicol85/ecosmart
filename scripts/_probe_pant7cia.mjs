/*
 * _probe_pant7cia.mjs - PANT-7 commit 2: la hoja avanzada del PDF con el diagrama de la CIA.
 * Nombre propio: verificado con ls, no existia.
 *
 * Mide TRES cosas, cada una con su denominador:
 *   1) que la LINEA DE CORRIDO de los bordes ya no este en el PDF, contando los caracteres de
 *      texto que el PDF emitio -un denominador vacio no es un cero-;
 *   2) que cada borde medido tenga su valor DENTRO de su sector, contando los pixeles del color
 *      de texto de ese sector dentro de su region del PNG, y que ninguno de los que entraron
 *      haya salido a la lista lateral -lo dice info.fuera, con el ancho medido de cada uno-;
 *   3) los COLORES y la GEOMETRIA del diagrama en el PDF: el color de cada sector muestreado en
 *      el pixel que le toca, y la posicion y el tamanio de cada addImage.
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant7cia.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p7cia.json';

/* Las escenas. La primera es LA DEL MEDICO, con los mismos cinco bordes de su captura. */
const ESCENAS = {
  ciaMedico: { campos: { ete_cia_borde_vcs: '4', ete_cia_borde_ao: '7', ete_cia_borde_av: '10',
                         ete_cia_borde_vci: '12', ete_cia_borde_post: '2',
                         ete_cia_tam: '18', ete_cia_vel: '3' },
               sel: { ete_cia_dir: 'id' }, chk: ['ete_shunt_incluir_chk'] },
  /* Dos digitos y un decimal en los cinco: el caso con el texto mas ancho posible. */
  ciaAncho:  { campos: { ete_cia_borde_vcs: '14.5', ete_cia_borde_ao: '17.5', ete_cia_borde_av: '10.5',
                         ete_cia_borde_vci: '12.5', ete_cia_borde_post: '18.5',
                         ete_cia_tam: '22', ete_cia_vel: '3.4' },
               sel: { ete_cia_dir: 'id' }, chk: ['ete_shunt_incluir_chk'] },
  /* Tres de los cinco sin medir: los sin dato NO escriben numero. */
  ciaParcial:{ campos: { ete_cia_borde_vcs: '4', ete_cia_borde_post: '2', ete_cia_tam: '18' },
               sel: { ete_cia_dir: 'id' }, chk: ['ete_shunt_incluir_chk'] },
  /* CONTROL NEGATIVO: los mismos bordes SIN la casilla, asi que no hay diagrama ni linea. */
  ciaSinChk: { campos: { ete_cia_borde_vcs: '4', ete_cia_borde_ao: '7', ete_cia_borde_av: '10',
                         ete_cia_borde_vci: '12', ete_cia_borde_post: '2', ete_cia_tam: '18' },
               sel: { ete_cia_dir: 'id' }, chk: [] }
};
const SOLO = (arg('--solo') || Object.keys(ESCENAS).join(',')).split(',').map(s => s.trim());

const MONTAR = `((esc) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos() } catch (e) {}
  const S = (id, v2) => { const e = document.getElementById(id); if (!e) return 0;
    e.value = v2; e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return 1 };
  let n = 0;
  Object.keys(esc.campos||{}).forEach(k => { n += S(k, esc.campos[k]) });
  Object.keys(esc.sel||{}).forEach(k => { n += S(k, esc.sel[k]) });
  document.querySelectorAll('input[type=checkbox][id]').forEach(e => { e.checked = false });
  (esc.chk||[]).forEach(id => { const e = document.getElementById(id);
    if (e) { e.checked = true; e.dispatchEvent(new Event('change',{bubbles:true})) } });
  /* El nombre y el documento: sin ellos varios emisores salen temprano. */
  S('pac_nombre','Prueba PANT7'); S('pac_ci','1234567');
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k]==='function') {
    try { window[k]() } catch(e){} } });
  try { if (typeof _recalcModulos === 'function') _recalcModulos('ab') } catch(e){}
  try { if (typeof generarInforme === 'function') generarInforme() } catch(e){}
  return n;
})(ESC)`;

/* El DIAGRAMA: lo que info.fuera dice, y los pixeles del PNG. */
const DONUT = `(async () => {
  const o = { err: null };
  try {
    if (typeof ciaDonutDataURL !== 'function') return { err: 'SIN ciaDonutDataURL' };
    const info = {};
    const url = ciaDonutDataURL(info);
    o.urlBytes = String(url || '').length;
    o.fuera = info.fuera || 'SIN info.fuera';
    o.acepta = (info.fuera !== undefined);
    /* Los pixeles: se vuelca el PNG a un canvas y se muestrea.
       - el COLOR de cada sector, en un punto a radio 100 (fuera de la zona de texto);
       - cuantos pixeles del COLOR DE TEXTO de ese sector hay dentro de su region, que es como
         se prueba que el valor esta DIBUJADO ADENTRO y no al costado. */
    const im = new Image();
    await new Promise((res, rej) => { im.onload = res; im.onerror = rej; im.src = url });
    const S = im.width;
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0);
    const dat = cx.getImageData(0, 0, S, S).data;
    o.lienzo = S;
    const k = S / 260;                      /* el viewBox del dibujo es 260x260 centrado en 0,0 */
    const px = (X, Y) => { const i = ((Math.round(Y) * S) + Math.round(X)) * 4;
      return [dat[i], dat[i+1], dat[i+2]] };
    const aPx = (x, y) => [S/2 + x*k, S/2 + y*k];
    const hexRgb = (h) => String(h).replace('#','').match(/../g).map(z => parseInt(z,16));
    const cerca = (a, b, t) => Math.abs(a[0]-b[0])<=t && Math.abs(a[1]-b[1])<=t && Math.abs(a[2]-b[2])<=t;
    o.sectores = CIA_DONUT_SEGS.map(function (seg) {
      const mm = (typeof _ciaSegMm === 'function') ? _ciaSegMm(seg) : null;
      const col = colorBordeCIA(mm);
      const cen = Math.atan2(seg.sy, seg.sx);
      const p = aPx(100 * Math.cos(cen), 100 * Math.sin(cen));
      const got = px(p[0], p[1]);
      /* los pixeles de color de TEXTO dentro de la region del sector, radio 50 a 112 */
      const esp = hexRgb(col.text);
      let nTxt = 0;
      for (let r = 50; r <= 112; r += 1) {
        for (let dd = -34; dd <= 34; dd += 1) {
          const ang = cen + dd * Math.PI / 180;
          const q = aPx(r * Math.cos(ang), r * Math.sin(ang));
          if (cerca(px(q[0], q[1]), esp, 60)) nTxt++;
        }
      }
      /* El MARGEN se publica siempre, no solo cuando un valor sale: con fuera vacio en las
         cuatro escenas, sin el margen no se sabe si entro con holgura o por un pelo. */
      let med = null;
      try {
        const cv2 = document.createElement('canvas'); const c2 = cv2.getContext('2d');
        c2.font = '500 9px Helvetica, Arial, sans-serif';
        const wS = c2.measureText(seg.sigla).width;
        c2.font = '600 9.5px Helvetica, Arial, sans-serif';
        const wV = mm == null ? 0 : c2.measureText(String(mm) + ' mm').width;
        med = { wSig: Math.round(wS*10)/10, wVal: Math.round(wV*10)/10,
                dSig: _ciaSegAnchoDisp(seg, seg.sy - 5), dVal: _ciaSegAnchoDisp(seg, seg.sy + 5.5) };
        med.holguraVal = Math.round((med.dVal - med.wVal)*10)/10;
      } catch (x) { med = { err: String(x).slice(0,60) } }
      return { sigla: seg.sigla, mm: mm, estado: col.estado,
               fillEsperado: col.fill, fillMedido: 'rgb(' + got.join(',') + ')',
               fillOk: cerca(got, hexRgb(col.fill), 8), pixTexto: nTxt, med: med };
    });
  } catch (e) { o.err = String(e).slice(0, 180) }
  return o;
})()`;

/* El PDF generado de verdad, con coordenadas y el denominador en caracteres. */
const PDF = `(async () => {
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { err: 'SIN JSPDF' };
  const Orig = window.jspdf.jsPDF;
  const reg = { imgs: [], txt: [], pags: 0, err: null };
  window.jspdf.jsPDF = function (...a) {
    const d = new Orig(...a);
    const oAdd = d.addPage ? d.addPage.bind(d) : null;
    if (oAdd) d.addPage = function (...z) { reg.pags++; return oAdd(...z) };
    const ot = d.text.bind(d);
    d.text = function (t, x, y, ...rest) {
      reg.txt.push({ p: reg.pags, t: String(t).slice(0, 200),
                     x: Math.round(Number(x)*10)/10, y: Math.round(Number(y)*10)/10 });
      return ot(t, x, y, ...rest);
    };
    const oi = d.addImage.bind(d);
    d.addImage = function (data, fmt, x, y, w, h, ...rest) {
      reg.imgs.push({ p: reg.pags, x: Math.round(Number(x)*10)/10, y: Math.round(Number(y)*10)/10,
                      w: Math.round(Number(w)*10)/10, h: Math.round(Number(h)*10)/10,
                      bytes: String(data||'').length });
      return oi(data, fmt, x, y, w, h, ...rest);
    };
    const or = d.rect ? d.rect.bind(d) : null;
    if (or) d.rect = function (...z) { return or(...z) };
    d.save = function () { return true };
    d.output = function () { return '' };
    return d;
  };
  Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
  try { const pl = document.getElementById('pdf_plantilla');
        if (pl) { pl.value = 'clasico'; pl.dispatchEvent(new Event('change',{bubbles:true})) } } catch (e) {}
  try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
        else if (typeof generarPDF === 'function') await generarPDF() } catch (e) { reg.err = String(e).slice(0,160) }
  window.jspdf.jsPDF = Orig;
  return reg;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  const pg = await b.newPage({ viewport: { width: 1200, height: 800 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0,150)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);
  for (const k of SOLO) {
    if (!ESCENAS[k]) continue;
    const nC = await pg.evaluate(MONTAR.replace('ESC', JSON.stringify(ESCENAS[k])));
    await new Promise(r => setTimeout(r, 700));
    const don = await pg.evaluate(DONUT);
    const pdf = await pg.evaluate(PDF);
    const r = { campos: nC, donut: don, pdfErr: pdf.err || null, pags: pdf.pags };
    /* EL DENOMINADOR: cuantos caracteres de texto emitio el PDF. */
    r.pdfChars = (pdf.txt || []).reduce((a, t) => a + t.t.length, 0);
    r.pdfTextos = (pdf.txt || []).length;
    r.pdfImgs = (pdf.imgs || []).length;
    /* La LINEA DE CORRIDO: sus fragmentos propios. */
    const frag = ['borde m', 'vel. del jet', '(borderline)', '(adecuado)', '(deficiente)',
                  'AV / Mitral 10 mm', 'VCS 4 mm'];
    r.lineaFrag = {};
    frag.forEach(f => { r.lineaFrag[f] = (pdf.txt || []).filter(t => t.t.indexOf(f) > -1).length });
    /* La hoja de congenitas y la imagen del diagrama en ella. */
    const tCong = (pdf.txt || []).filter(t => /CARDIOPATIAS CONGENITAS|Cardiopatias congenitas/i.test(t.t));
    r.pagsCong = tCong.map(t => t.p);
    const tLbl = (pdf.txt || []).filter(t => /CIA|interauricular/i.test(t.t) && t.t.length < 60).slice(0, 4);
    r.rotCia = tLbl.map(t => t.t + ' @' + t.x + ',' + t.y);
    r.imgsCong = (pdf.imgs || []).filter(i => r.pagsCong.indexOf(i.p) > -1)
                                 .map(i => i.x + ',' + i.y + ' ' + i.w + 'x' + i.h + ' b=' + i.bytes);
    /* La lista lateral: sus filas, si las hay. */
    r.legFilas = (pdf.txt || []).filter(t => /\\d+ mm · (adecuado|borderline|deficiente)/.test(t.t))
                                .map(t => t.t + ' @' + t.x + ',' + t.y);
    OUT[k] = r;
  }
} catch (e) { OUT._err = String(e).slice(0, 220) }
await b.close();
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito ' + OUTF);
