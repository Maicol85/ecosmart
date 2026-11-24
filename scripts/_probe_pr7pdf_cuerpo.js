/* Cuerpo de la sonda del PDF de PR7 (TAREA 3). SIN ACENTOS GRAVES a proposito.
   Mide INTERCEPTANDO doc.text y doc.addImage: las coordenadas son la unica forma de afirmar
   «el texto a la derecha del dibujo y debajo de su tabla», que es lo que la orden pide. */
(() => {
  const out = {};
  const g = id => document.getElementById(id);
  const hay = n => { try { return typeof window[n] === 'function' } catch (e) { return false } };
  const set = (id, val) => { const e = g(id); if (!e) return false;
    e.value = String(val); e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };

  try { if (hay('limpiarCampos')) limpiarCampos(); } catch (e) {}
  [['nombre','Zoraida Pruebas'],['fecha','2026-11-23'],['edad','74'],['sexo','M'],
   ['peso','80'],['talla','170'],['fevi','52'],['sgl_gls','-18'],
   ['sgl_notas','Reduccion del strain en la cara anterior.\nPreservacion apical relativa.']
  ].forEach(p => set(p[0], p[1]));

  /* MOTILIDAD: hipoquinesia en los tres niveles de la cara anterior y aquinesia del apex, que
     es la escena con la que la orden ejemplifica las dos oraciones. */
  try {
    if (hay('contrSetSegmento')) {
      contrSetSegmento('basal_anterior', 1);
      contrSetSegmento('mid_anterior', 1);
      contrSetSegmento('apical_anterior', 1);
      contrSetSegmento('apex', 3);
    }
  } catch (e) { out.errContr = String(e && e.message || e); }
  /* STRAIN: dos numeros y un color elegido a mano. */
  try {
    window.sglReset();
    window.strainEscribir('basal_anterior', '-8');
    window.strainEscribir('mid_anterior', '+6');
    window.strainSet('apex', 1, null);
  } catch (e) { out.errStrain = String(e && e.message || e); }
  try { if (hay('generarInforme')) generarInforme(); } catch (e) {}
  try { if (hay('contrRenderInforme')) contrRenderInforme(); } catch (e) {}
  out.lineasMotilidad = (hay('contrGetLineasInforme') ? contrGetLineasInforme() : []).slice();
  out.arteriasEnPantalla = (function () {
    const z = document.getElementById('contr-arterias');
    return z ? String(z.innerText || z.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) : 'SIN BLOQUE';
  })();

  /* El PDF de verdad, con doc.text y doc.addImage interceptados. */
  const generar = () => {
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return null;
    const txts = [], imgs = [], rects = [];
    window.jspdf.jsPDF = function (o) {
      const d = new J(o);
      const t0 = d.text, a0 = d.addImage, r0 = d.rect;
      d.text = function (txt, x, y) {
        try {
          const arr = Array.isArray(txt) ? txt : [txt];
          arr.forEach((s2, i) => txts.push({ t: String(s2), x: Math.round(x * 10) / 10,
                                             y: Math.round((y + i * 0) * 10) / 10, p: d.internal.getNumberOfPages() }));
        } catch (e) {}
        return t0.apply(this, arguments);
      };
      d.addImage = function (data, fmt, x, y, w, h) {
        try { imgs.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10,
                          w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10,
                          p: d.internal.getNumberOfPages() }); } catch (e) {}
        return a0.apply(this, arguments);
      };
      d.rect = function (x, y, w, h) {
        try { rects.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10,
                           w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10,
                           p: d.internal.getNumberOfPages() }); } catch (e) {}
        return r0.apply(this, arguments);
      };
      d.save = function () { return this };
      return d;
    };
    try { if (hay('_pdfAjustarA4')) _pdfAjustarA4(); } catch (e) { out.errPdf = String(e && e.message || e); }
    window.jspdf.jsPDF = J;
    return { txts, imgs, rects };
  };
  const TIT = 'Contractilidad y strain longitudinal';
  const analizar = r => {
    if (!r) return 'SIN PDF';
    const tit = r.txts.filter(t => t.t.indexOf(TIT) >= 0)[0] || null;
    if (!tit) return { tile: false, textos: r.txts.length };
    const pag = tit.p;
    /* Todo lo que cae en la misma hoja y por debajo del titulo del tile. */
    const z = r.txts.filter(t => t.p === pag && t.y >= tit.y - 1);
    const im = r.imgs.filter(i => i.p === pag);
    const sel = s2 => z.filter(t => t.t.indexOf(s2) >= 0).map(t => t.t + '@' + t.x + ',' + t.y);
    const refs = z.filter(t => t.t === 'Ref.:');
    const mot = z.filter(t => t.t === 'Motilidad')[0] || null;
    const stn = z.filter(t => t.t === 'Strain (SGL)')[0] || null;
    const gls = z.filter(t => t.t.indexOf('SGL global:') >= 0)[0] || null;
    return {
      tile: true, hoja: pag, tituloY: tit.y,
      dibujos: im.map(i => i.x + ',' + i.y + ' ' + i.w + 'x' + i.h),
      refs: refs.map(t => t.x + ',' + t.y),
      motilidad: mot ? (mot.x + ',' + mot.y) : null,
      strain: stn ? (stn.x + ',' + stn.y) : null,
      glsRenglon: gls ? gls.t : null,
      glsXY: gls ? (gls.x + ',' + gls.y) : null,
      lineasHipo: sel('Hipoquinesia'),
      lineasAqui: sel('quinesia del'),
      notas: sel('Preservacion apical'),
      notas2: sel('cara anterior'),
      arterias: z.filter(t => t.t.indexOf('Arterias posiblemente') >= 0).length,
      sinDato: z.filter(t => t.t === 'Sin dato').length,
      marcas: z.filter(t => /^[+-]?(20|15|10|5|0)$/.test(t.t)).map(t => t.t).join(','),
      /* Los renglones del tile, ordenados: la prueba de que son renglones DISTINTOS. */
      renglonesTile: z.filter(t => t.y > tit.y && t.t.length > 2)
                      .sort((a, b) => (a.x - b.x) || (a.y - b.y))
                      .map(t => Math.round(t.x) + '|' + Math.round(t.y) + '|' + t.t.slice(0, 44))
    };
  };
  const conToggles = (contr, sgl) => {
    const a = g('contr_be_pdf'), b = g('sgl_be_pdf');
    if (a) a.value = contr ? '1' : '';
    if (b) b.value = sgl ? '1' : '';
    return analizar(generar());
  };
  out.soloContr = conToggles(true, false);
  out.soloSgl   = conToggles(false, true);
  out.losDos    = conToggles(true, true);
  const a = g('contr_be_pdf'), b = g('sgl_be_pdf');
  if (a) a.value = ''; if (b) b.value = '';
  return out;
})()
