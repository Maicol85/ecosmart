#!/usr/bin/env node
/**
 * _probe_aj1pdf.mjs - la GEOMETRIA del PDF generado de verdad, para el commit 2 de la tanda
 * AJUSTES-1 (2026-10-30).
 *
 * POR QUE EXISTE Y NO ALCANZA CON `_probe_aj1ab.mjs`: el commit 2 mueve la COMPOSICION y no
 * los textos -el dibujo de la orejuela pasa de la pagina «Imagenes del estudio» a su tabla, y
 * el resumen de la VAB pasa de debajo del dibujo a su costado-. El espia del A/B heredado
 * guarda el TEXTO de cada `doc.text` y la CANTIDAD de figuras, asi que un cambio que no toca
 * ni una palabra ni el numero de `addImage` le sale IDENTICO. Medido: el A/B del commit 2
 * contra el del 1 daba UNA sola diferencia, y las dos del VAB y del resumen no aparecian.
 * Esta sonda registra las COORDENADAS: x, y, ancho y alto de cada `addImage`, y x/y de cada
 * `text`. Con eso «al costado» y «debajo» son distinguibles.
 *
 *   node scripts/_probe_aj1pdf.mjs --out /tmp/aj1/pdf.NEW.json
 *   node scripts/_probe_aj1pdf.mjs --file "$PWD/_head_aj1.html" --out /tmp/aj1/pdf.HEAD.json
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
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
const OUTF = arg('--out') || '/tmp/aj1/pdf.json';

/* Las CUATRO escenas del commit 2, cada una con su denominador declarado:
   - orejETE : la seccion de la orejuela INTEGRADA (su tabla va a la hoja del ETE) + el dibujo
               incluido. Es el caso «el dibujo junto a su tabla y no repetido».
   - orejSola: los MISMOS datos, el dibujo incluido y la seccion SIN integrar. Es el caso
               «en Imagenes del estudio con su resumen al lado».
   - orejTabla: la seccion integrada y el dibujo NO incluido. Control negativo: no hay dibujo
               que mover, asi que la hoja del ETE tiene que salir como en HEAD.
   - vab     : la bicuspide con su dibujo incluido en el PDF. Es el caso 2b. */
const ESCENAS = {
  orejETE:  { campos: { oai_ostium_diam: '26', oai_profundidad: '37', oai_vel_vac: '30' },
              sel: { oai_morfologia: 'ala', oai_trombo: 'no', oai_sec: 'leve', oai_lobulos: '2',
                     im_grado: '2', vm_carp: 'II' },
              integrar: ['oai'], esquema: true },
  orejSola: { campos: { oai_ostium_diam: '26', oai_profundidad: '37', oai_vel_vac: '30' },
              sel: { oai_morfologia: 'ala', oai_trombo: 'no', oai_sec: 'leve', oai_lobulos: '2',
                     im_grado: '2', vm_carp: 'II' },
              esquema: true },
  orejTabla:{ campos: { oai_ostium_diam: '26', oai_profundidad: '37', oai_vel_vac: '30' },
              sel: { oai_morfologia: 'ala', oai_trombo: 'no', oai_sec: 'leve', oai_lobulos: '2' },
              integrar: ['oai'] },
  /* Una orejuela SIN un solo dato mas que el dibujo: el resumen sale vacio y el esquema cae al
     reparto normal de dos por fila. Es el «si no hay datos, sin resumen» de la orden. */
  orejPela: { campos: {}, sel: {}, esquemaForzado: true },
  vab:      { campos: { ao_sin: '42', peso: '70', talla: '170', vab_pdf: '1' },
              sel: { sexo: 'M', va_morf: 'Bicúspide', vab_tipo: 'fused_rl', vab_rafe: 'si',
                     vab_simetria: 'simetrica' } },
  /* Control negativo del 2b: la bicuspide SIN el dibujo incluido -el bloque no se emite-. */
  vabOff:   { campos: { ao_sin: '42', peso: '70', talla: '170' },
              sel: { sexo: 'M', va_morf: 'Bicúspide', vab_tipo: 'fused_rl', vab_rafe: 'si',
                     vab_simetria: 'simetrica' } },
  /* Y un estudio AJENO: ninguna parte del commit 2 lo toca. */
  ajeno:    { campos: { im_vc: '8', onda_e: '110', e_sep: '5', e_lat: '6', ai_vol: '70',
                        peso: '80', talla: '180' }, sel: {} }
};
const SOLO = (arg('--solo') || Object.keys(ESCENAS).join(',')).split(',').map(s => s.trim());

const MONTAR = `((esc) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  Object.keys(esc.campos || {}).forEach(k => { if (esc.campos[k] !== '') S(k, esc.campos[k]) });
  Object.keys(esc.sel || {}).forEach(k => S(k, esc.sel[k]));
  (esc.integrar || []).forEach(k => { try { if (typeof amiloIntegrar === 'function') amiloIntegrar(k) } catch (e) {} });
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  try { if (typeof _recalcModulos === 'function') _recalcModulos('ab'); } catch (e) {}
  try { if (typeof generarInforme === 'function') generarInforme(); } catch (e) {}
  /* El esquema es un INTERRUPTOR: se quita antes, siempre, asi la escena no hereda el slot de
     la anterior ni lo apaga por segunda vez. */
  try { if (typeof esqQuitarDelPDF === 'function') esqQuitarDelPDF('orejuela') } catch (e) {}
  if (esc.esquema || esc.esquemaForzado) {
    try { if (typeof oaiEsqIncluirPDF === 'function') return oaiEsqIncluirPDF().then(() => true) }
    catch (e) {}
  }
  return true;
})(ESC)`;

/* El espia: registra COORDENADAS. Se mide una sola plantilla -clasico-, porque la composicion
   no depende de la plantilla: lo que cambia entre ellas son los colores y el cuerpo de letra. */
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
      reg.txt.push({ p: reg.pags, t: String(t).slice(0, 90),
                     x: Math.round(Number(x) * 10) / 10, y: Math.round(Number(y) * 10) / 10 });
      return ot(t, x, y, ...rest);
    };
    const oi = d.addImage.bind(d);
    d.addImage = function (data, fmt, x, y, w, h, ...rest) {
      reg.imgs.push({ p: reg.pags, x: Math.round(Number(x) * 10) / 10, y: Math.round(Number(y) * 10) / 10,
                      w: Math.round(Number(w) * 10) / 10, h: Math.round(Number(h) * 10) / 10,
                      bytes: String(data || '').length });
      return oi(data, fmt, x, y, w, h, ...rest);
    };
    d.save = function () { return true };
    d.output = function () { return '' };
    return d;
  };
  Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
  try { const pl = document.getElementById('pdf_plantilla');
        if (pl) { pl.value = 'clasico'; pl.dispatchEvent(new Event('change', { bubbles: true })) } } catch (e) {}
  try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
        else if (typeof generarPDF === 'function') await generarPDF() } catch (e) { reg.err = String(e).slice(0, 160) }
  window.jspdf.jsPDF = Orig;
  return reg;
})()`;

/* El denominador: sin esto, «el dibujo no esta en la pagina de imagenes» no se distingue de
   «el dibujo nunca se incluyo». */
const DENOM = `(() => {
  const j = {};
  try { j.esqIncl = (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('orejuela') : 'sin fn' } catch (e) {}
  try { j.slots = (typeof imgSlots === 'undefined') ? 'sin imgSlots'
        : imgSlots.filter(s => s && s.dataURL).length } catch (e) {}
  try { j.eteEnInf = (typeof amiloEnInforme === 'function')
        ? ((amiloEnInforme() || []).filter(x => x.grupo === 'ete').map(x => x.k).join(',') || 'NINGUNA') : 'sin fn' } catch (e) {}
  try { j.resumen = (typeof oaiResumenPDF === 'function')
        ? oaiResumenPDF().map(f => f[0] + '=' + f[1]).join(' | ') : 'sin fn' } catch (e) {}
  try { j.vabOn = (typeof vabPdfOn === 'function') ? vabPdfOn() : 'sin fn' } catch (e) {}
  try { j.vabFilas = (typeof vabPdfFilas === 'function') ? (vabPdfFilas() || []).length : 'sin fn' } catch (e) {}
  try { j.esqAlto = (typeof _oaiEsqAlto === 'function') ? _oaiEsqAlto() : 'sin fn' } catch (e) {}
  return j;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  const pg = await b.newPage({ viewport: { width: 1200, height: 700 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 150)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);
  for (const k of SOLO) {
    if (!ESCENAS[k]) continue;
    await pg.evaluate(MONTAR.replace('ESC', JSON.stringify(ESCENAS[k])));
    await new Promise(r => setTimeout(r, 700));
    const den = await pg.evaluate(DENOM);
    const pdf = await pg.evaluate(PDF);
    /* Las tres cosas que la orden pide poder distinguir, derivadas de las coordenadas. */
    const resumen = {};
    /* 1 · la hoja del ETE: en que pagina cae la tabla de la orejuela y si hay una imagen en esa
       misma pagina, a su derecha. */
    /* ⚠️ LA COMPARACION ES EXACTA Y SENSIBLE A MAYUSCULAS, y la primera version no lo era:
       con /OREJUELA IZQUIERDA/i el `find` enganchaba la oracion del CUERPO del informe
       -«Orejuela izquierda: ostium 26 mm…»-, que cae en la pagina 0, y la sonda informaba que
       la tabla estaba en la pagina 0 cuando la hoja del ETE es otra. El rotulo de la banda es
       el titulo de la seccion, en mayusculas y solo. */
    const tTabla = pdf.txt.find(t => t.t === 'OREJUELA IZQUIERDA');
    resumen.pagTabla = tTabla ? tTabla.p : null;
    resumen.yTabla = tTabla ? tTabla.y : null;
    /* 2 · la pagina «Imagenes del estudio» y las imagenes que lleva. */
    const tImgPag = pdf.txt.filter(t => /Imágenes del estudio/.test(t.t)).map(t => t.p);
    resumen.pagsImagenes = tImgPag;
    resumen.imgsEnPagImagenes = pdf.imgs.filter(i => tImgPag.indexOf(i.p) > -1).length;
    /* 3 · la imagen que cae en la MISMA pagina que la tabla, y de que lado. */
    resumen.imgJuntoATabla = tTabla
      ? pdf.imgs.filter(i => i.p === tTabla.p && i.x > 100).map(i => i.x + ',' + i.y + ' ' + i.w + 'x' + i.h)
      : [];
    /* 4 · el bloque de la VAB: la banda, su dibujo y la primera fila de su tabla. */
    const tVab = pdf.txt.find(t => /VÁLVULA AÓRTICA BICÚSPIDE/.test(t.t));
    const tFeno = pdf.txt.find(t => t.t === 'Fenotipo:');
    const iVab = tVab ? pdf.imgs.find(i => i.p === tVab.p && i.y > tVab.y && i.y < tVab.y + 30) : null;
    resumen.vabBanda = tVab ? (tVab.x + ',' + tVab.y) : null;
    resumen.vabDibujo = iVab ? (iVab.x + ',' + iVab.y + ' ' + iVab.w + 'x' + iVab.h) : null;
    resumen.vabFila1 = tFeno ? (tFeno.x + ',' + tFeno.y) : null;
    /* alto del bloque de la VAB: de la banda a la ultima fila de su tabla o al pie del dibujo */
    /* El ALTO del bloque: de la banda al pie de lo mas bajo que le pertenece, que son su
       dibujo y las filas de SU tabla. Se identifican por el rotulo, no por un radio en mm:
       la primera version tomaba todo texto dentro de 140 mm hacia abajo y se llevaba el
       bloque del foramen oval, que viene justo despues. */
    if (tVab) {
      const ROT = ['Fenotipo:', 'Rafe:', 'Cúspides:', 'Estenosis aórtica:', 'Insuficiencia aórtica:'];
      const filas = pdf.txt.filter(t => t.p === tVab.p && t.y > tVab.y && ROT.indexOf(t.t) > -1);
      resumen.vabFilasY = filas.map(t => t.x + ',' + t.y).join(' ');
      const yFin = Math.max(iVab ? iVab.y + iVab.h : 0,
                            filas.length ? Math.max.apply(null, filas.map(t => t.y)) : 0);
      resumen.vabAlto = Math.round((yFin - tVab.y) * 10) / 10;
    } else { resumen.vabAlto = null; resumen.vabFilasY = ''; }
    /* 5 · el resumen al lado del esquema en la pagina de imagenes. */
    resumen.resumenAlLado = pdf.txt.filter(t => tImgPag.indexOf(t.p) > -1 &&
      /Orejuela izquierda|Ostium|Profundidad|Vel\. de vaciamiento|Contraste espont|Trombo|Insuficiencia mitral|Carpentier|Morfolog/.test(t.t))
      .map(t => t.t + '@' + t.x + ',' + t.y);
    OUT[k] = { denom: den, pags: pdf.pags, nImgs: pdf.imgs.length, nTxt: pdf.txt.length,
               err: pdf.err, resumen: resumen, imgs: pdf.imgs };
    console.log('-- ' + k + ' | pags=' + pdf.pags + ' imgs=' + pdf.imgs.length +
                ' | esqIncl=' + den.esqIncl + ' slots=' + den.slots + ' eteEnInf=' + den.eteEnInf +
                ' vabOn=' + den.vabOn);
    console.log('   tabla pag=' + resumen.pagTabla + ' | pagsImagenes=' + JSON.stringify(resumen.pagsImagenes) +
                ' imgsAhi=' + resumen.imgsEnPagImagenes + ' | juntoATabla=' + JSON.stringify(resumen.imgJuntoATabla));
    console.log('   VAB banda=' + resumen.vabBanda + ' dibujo=' + resumen.vabDibujo +
                ' alto=' + resumen.vabAlto + ' filas=' + resumen.vabFilasY);
    console.log('   resumen al lado: ' + JSON.stringify(resumen.resumenAlLado));
  }
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF + ' (' + fs.statSync(OUTF).size + ' bytes)');
