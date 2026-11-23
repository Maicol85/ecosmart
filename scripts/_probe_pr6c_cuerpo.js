/* Cuerpo de la sonda del NOVENO ESTILO «Tipo Word» (PR6-4). SIN ACENTOS GRAVES a proposito. */
(() => {
  const out = {};
  const g = (id) => document.getElementById(id);
  const set = (id, val) => { const e = g(id); if (!e) return false;
    e.value = String(val); e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  const chk = (id, on) => { const e = g(id); if (!e) return false;
    e.checked = !!on; e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  const hay = (n) => { try { return typeof window[n] === 'function' } catch (e) { return false } };

  /* (A) EL ESTILO ESTA REGISTRADO, y en LAS DOS listas: el catalogo y el despachador. */
  out.reg = {
    n: (typeof PDF_PLANTILLAS !== 'undefined') ? PDF_PLANTILLAS.length : -1,
    ids: (typeof PDF_PLANTILLAS !== 'undefined') ? PDF_PLANTILLAS.map((p) => p.id).join(',') : 'NO',
    nom: (typeof PDF_PLANTILLAS !== 'undefined')
      ? (PDF_PLANTILLAS.filter((p) => p.id === 'tipoword')[0] || {}).nom : 'NO',
    tieneMiniatura: (typeof _PLTZ_SVG !== 'undefined') ? !!_PLTZ_SVG.tipoword : 'NO',
    /* Se ACEPTA al elegirlo: `setPdfPlantilla` valida contra el catalogo. */
    seElige: (function () {
      try { setPdfPlantilla('tipoword');
            return (hay('pdfPlantillaGet') ? pdfPlantillaGet() : '?') === 'tipoword'; }
      catch (e) { return 'ERR: ' + String(e && e.message || e); }
    })()
  };
  /* El selector de Config lo pinta del catalogo: nueve botones. */
  try { if (hay('initPdfPlantillas')) initPdfPlantillas(); } catch (e) {}
  out.reg.botonesSelector = document.querySelectorAll('#pltz-grid [data-pltz]').length;
  out.reg.botonTipoWord = !!document.querySelector('#pltz-grid [data-pltz="tipoword"]');

  /* La siembra: la de estenosis aortica con insuficiencia mitral. */
  try { if (hay('limpiarCampos')) limpiarCampos(); } catch (e) {}
  [['nombre','Zoraida Pruebas'],['fecha','2026-11-23'],['edad','74'],['sexo','M'],
   ['peso','80'],['talla','170'],
   ['ao_sin','41'],['ao_st','33'],['ao_tub','45'],['diam_tsvi_ao','21'],
   ['ai_diam','45'],['ai_area','24'],['ai_vol','82'],
   ['ad_area','18'],['vci_diam','20'],['vci_col','<50'],['pmad','8'],
   ['siv','13'],['ddfvi','56'],['dsfvi','38'],['ppvi','12'],['vdfvi','150'],['vsfvi','66'],
   ['fevi','52'],['sgl','-15'],['vol_lat','84'],
   ['tvia','101'],['tapse','18'],['s_prime','11'],['vd_bas','38'],['vd_mid','31'],['vd_long','74'],
   ['onda_e','95'],['onda_a','58'],['tde','210'],['triv','95'],['thp','70'],
   ['e_sep','6'],['e_lat','9'],
   ['vmax_it','3.1'],['vp_vmax','1.2'],['ip_vmax','2.4'],['ip_vtd','1.5'],
   ['vmax_ao','4.4'],['gmedio_ao','48'],['itv_tsvi','19'],['itv_ao','98'],['diam_tsvi','21'],
   ['hemo_fc','72'],
   ['vm_morf','Prolapso / EVMS'],['im_grado','3'],['im_vc','6'],
   ['im_eroa_cont','28'],['vr_cont','45'],['im_fr_cont','42'],
   ['va_morf','Calcificada'],['ea_grado','severa'],['ia_grado','2'],['ia_vc','3'],['ia_pht','420'],
   ['vt_morf','Normal'],['it_grado','2'],['it_vc','5']
  ].forEach((p) => set(p[0], p[1]));
  chk('im_pdf_cont', true);
  try { if (hay('generarInforme')) generarInforme(); } catch (e) {}
  try { const t = g('en_suma'); if (t && !t.value.trim()) {
    t.value = 'Estenosis aortica severa.'; t.dispatchEvent(new Event('input', { bubbles: true })); } } catch (e) {}

  /* (B) EL PDF DE VERDAD. Se envuelve el CONSTRUCTOR y no el prototipo. */
  const pdfBytes = () => {
    let cap = null;
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return null;
    let imgs = 0;
    window.jspdf.jsPDF = function (o) {
      const d = new J(o);
      /* Se cuentan las IMAGENES: la orden exige que el texto sea texto REAL y no una imagen. */
      const ai = d.addImage;
      d.addImage = function () { imgs++; return ai.apply(this, arguments) };
      d.save = function () { try { cap = this.output('datauristring') } catch (e) {} return this };
      return d;
    };
    try { if (hay('_pdfAjustarA4')) _pdfAjustarA4(); } catch (e) {}
    window.jspdf.jsPDF = J;
    if (!cap) return { b:null, imgs:imgs };
    try { return { b: atob(String(cap).split(',')[1]), imgs: imgs } } catch (e) { return { b:null, imgs:imgs } }
  };
  const cuenta = (b, frag) => {
    if (!b) return 'SIN PDF';
    const B = b.toLowerCase(), f = frag.toLowerCase();
    let n = 0, i = B.indexOf(f);
    while (i >= 0) { n++; i = B.indexOf(f, i + 1) }
    return n;
  };
  /* Los TEXTOS dibujados, extraidos de los operadores Tj/TJ del PDF sin comprimir: es la unica
     forma de afirmar «una linea por renglon» y no «el texto esta en algun lado». */
  const renglones = (b) => {
    if (!b) return [];
    const out2 = []; const re = /\(((?:\\.|[^\\()])*)\)\s*Tj/g;
    let m; while ((m = re.exec(b)) !== null) out2.push(m[1].replace(/\\([()\\])/g, '$1'));
    return out2;
  };
  const medir = (estilo) => {
    try { if (hay('setPdfPlantilla')) setPdfPlantilla(estilo); } catch (e) {}
    const r = pdfBytes(); const b = r.b;
    const rg = renglones(b);
    return { bytes: b ? b.length : 'SIN PDF', imagenes: r.imgs,
      /* Un titulo de cuadro: el DENOMINADOR de si los cuadros estan o no. */
      gasto: cuenta(b, 'Gasto card'), aorta: cuenta(b, 'Aorta tor'),
      /* El resumen de valvulas. */
      valv: cuenta(b, 'lvula Mitral'),
      /* Los titulos del texto tipo Word, uno por seccion. */
      titWord: ['Aorta', 'DOPPLER', 'lvula mitral', 'lvula a'].map((f) => f + ':' + cuenta(b, f)).join(' '),
      /* El informe y el EN SUMA. */
      informe: cuenta(b, 'Pruebas'), enSuma: cuenta(b, 'EN SUMA'),
      /* El encabezado clasico y el pie. */
      renglones: rg.length,
      /* Los renglones que arrancan con un rotulo del texto tipo Word, uno por linea. */
      lineasWord: rg.filter((t) => /^(SV: |AP: |SIV: |FEVI: |TAP: |onda E: |V\.Max|THP: )/.test(t)).length,
      muestra: rg.filter((t) => /^(SV: |onda E: |V\.Max: )/.test(t)).slice(0, 3).join(' // ') };
  };
  out.clasico = medir('clasico');
  out.tipoword = medir('tipoword');
  /* (C) CON EL INTERRUPTOR PRENDIDO, «Tipo Word» SIGUE SIN EL RESUMEN DE VALVULAS. */
  try { if (hay('cuadResumenValvToggle')) cuadResumenValvToggle(true); } catch (e) {}
  out.tipowordConSwitch = medir('tipoword');
  out.clasicoConSwitch = medir('clasico');
  try { if (hay('cuadResumenValvToggle')) cuadResumenValvToggle(false); } catch (e) {}
  try { if (hay('setPdfPlantilla')) setPdfPlantilla('clasico'); } catch (e) {}
  return out;
})()
