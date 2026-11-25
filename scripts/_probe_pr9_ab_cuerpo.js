(async () => {
  /* A/B del PAPEL de PR9. Vuelca la LISTA DE TEXTOS de cada estilo para los dos estudios, para
     poder comparar contenido -y no solo cantidad de hojas- entre dos arboles. Solo siembra y
     genera: cualquier otra medicion en el medio deja estado y entonces A y B comparan dos
     escenas distintas y no dos arboles. */
  const R = { err: [] };
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = String(v); try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
    try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} return true; };
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const SEM_NORMAL = [['nombre','Normal Pruebas'],['fecha','2026-11-24'],['edad','54'],['sexo','M'],
    ['peso','78'],['talla','172'],['ai_diam','36'],
    ['siv','9'],['ddfvi','48'],['dsfvi','30'],['ppvi','9'],['fevi','62'],
    ['onda_e','78'],['onda_a','60'],['tde','190'],['e_sep','8'],['e_lat','11'],
    ['tapse','21'],['vmax_it','2.1'],
    ['informe_texto','Ventriculo izquierdo de dimensiones y funcion normales.\nValvulas sin alteraciones significativas.'],
    ['en_suma','Ecocardiograma dentro de limites normales.']];
  const SEM_LARGO = [['nombre','Largo Pruebas'],['fecha','2026-11-24'],['edad','71'],['sexo','F'],
    ['peso','64'],['talla','158'],
    ['ao_sin','43'],['ao_st','35'],['ao_tub','47'],['diam_cayado','31'],['diam_ao_toracica','27'],
    ['diam_tsvi_ao','20'],['ai_diam','48'],['ai_area','28'],['ai_vol','96'],
    ['ad_area','21'],['vci_diam','21'],['pmad','8'],
    ['siv','13'],['ddfvi','56'],['dsfvi','40'],['ppvi','12'],['vdfvi','160'],['vsfvi','78'],
    ['fevi','49'],['sgl','-13'],['vol_lat','74'],
    ['tvia','130'],['tapse','16'],['s_prime','9'],['vd_bas','41'],['vd_mid','34'],['vd_long','78'],
    ['vd_area_d','27'],['vd_area_s','17'],['fevd','42'],['vd_vi','0.9'],
    ['onda_e','102'],['onda_a','48'],['tde','150'],['triv','60'],['thp','130'],
    ['venp_dur_a','118'],['venp_dur_ar','162'],['venp_vel_ar','44'],['e_sep','5'],['e_lat','7'],
    ['vmax_it','3.2'],['pap_med','34'],['vp_vmax','1.3'],['ip_vmax','2.4'],['ip_vtd','1.6'],
    ['vmax_ao','4.6'],['gmedio_ao','55'],['itv_tsvi','16'],['itv_ao','96'],['diam_tsvi','20'],
    ['hemo_fc','78'],
    ['vm_morf','Reumatica'],['im_grado','3'],['im_vc','6'],['em_area_thp','1.1'],
    ['im_eroa_cont','24'],['vr_cont','20'],['im_fr_cont','24'],
    ['va_morf','Calcificada'],['ia_grado','3'],['ia_vc','5'],['ia_pht','240'],
    ['vt_morf','Normal'],['it_grado','3'],['it_vc','7'],
    ['informe_texto','Ventriculo izquierdo de dimensiones aumentadas con funcion sistolica levemente deprimida.\nValvula mitral reumatica con estenosis moderada.\nInsuficiencia mitral moderada.\nValvula aortica calcificada con estenosis severa.\nInsuficiencia aortica moderada.\nDilatacion de la raiz aortica.\nHipertension pulmonar probable.'],
    ['en_suma','Estenosis mitral reumatica moderada.\nEstenosis aortica severa.\nInsuficiencia mitral moderada.\nHipertension pulmonar probable.']];

  const capturar = (plant) => {
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return null;
    const ts = []; let pags = 1, fsz = 0, fnt = '', rects = 0;
    /* /!\ LAS HOJAS SE CUENTAN POR DOCUMENTO Y NO ACUMULADAS. _pdfAjustarA4 genera el PDF
       VARIAS veces -una por cada paso de la escalera que mide, mas la final-, asi que un
       contador compartido entre instancias suma las hojas de todas las pasadas y publica un
       numero que no es el de ningun documento. La primera version de esta sonda dio «6 hojas»
       sobre un documento de 2 y «268 textos» que eran la suma de cinco pasadas. */
    const docs = [];
    try { setPdfPlantilla(plant); } catch (e) {}
    window.jspdf.jsPDF = function (o) {
      const d = new J(o);
      pags = 1; ts.length = 0; rects = 0;
      docs.push(function () { return { hojas: pags, n: ts.length, rects: rects,
        soloTxt: ts.map(l => l.split('|').slice(4).join('|')).join('\u0001'),
        conFmt: ts.join('\u0001') } });
      const asf = d.setFontSize; d.setFontSize = function (sz) { fsz = sz; return asf.apply(this, arguments) };
      const af = d.setFont; d.setFont = function (n, st) { fnt = n + '/' + (st||''); return af.apply(this, arguments) };
      const at = d.text; d.text = function (t, x, yy) {
        ts.push(pags + '|' + (Math.round(yy*10)/10) + '|' + (Math.round(fsz*100)/100) + '|' + fnt + '|' + String(t));
        return at.apply(this, arguments) };
      const ar = d.rect; d.rect = function () { rects++; return ar.apply(this, arguments) };
      const ap = d.addPage; d.addPage = function () { pags++; return ap.apply(this, arguments) };
      d.save = function () { return this };
      return d; };
    try { _pdfAjustarA4(); } catch (e) { R.err.push('pdf ' + plant + ': ' + String(e && e.message || e).slice(0,160)); }
    window.jspdf.jsPDF = J;
    /* El ULTIMO documento es el que se le entrega al medico: los anteriores son mediciones. */
    const ult = docs.length ? docs[docs.length - 1]() : null;
    return ult ? { hojas: ult.hojas, n: ult.n, rects: ult.rects, pasadas: docs.length,
                   soloTxt: ult.soloTxt, conFmt: ult.conFmt } : null;
  };
  const ESTILOS = ['clasico','moderno','minimalista','academico','compacto','elegante','tipoword'];
  try {
    SEM_NORMAL.forEach(p => set(p[0], p[1]));
    await esperar(700);
    R.normal = {};
    ESTILOS.forEach(function (p) { const c = capturar(p);
      R.normal[p] = c ? { hojas:c.hojas, n:c.n, rects:c.rects, txt:c.soloTxt, fmt:c.conFmt } : 'SIN jsPDF'; });
  } catch (e) { R.err.push('N: ' + String(e && e.message || e).slice(0,200)); }
  try {
    if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (x) {} }
    await esperar(400);
    SEM_LARGO.forEach(p => set(p[0], p[1]));
    await esperar(700);
    R.largo = {};
    ESTILOS.forEach(function (p) { const c = capturar(p);
      R.largo[p] = c ? { hojas:c.hojas, n:c.n, rects:c.rects, txt:c.soloTxt, fmt:c.conFmt } : 'SIN jsPDF'; });
  } catch (e) { R.err.push('L: ' + String(e && e.message || e).slice(0,200)); }
  try { setPdfPlantilla('clasico'); } catch (e) {}
  R.censo = document.querySelectorAll('input[id]').length + '/'
          + document.querySelectorAll('select[id]').length + '/'
          + document.querySelectorAll('textarea[id]').length;
  try { R.excel = Object.keys(LAB_XLS_MAP).length; } catch (e) { R.excel = 'ERR'; }
  return R;
})()
