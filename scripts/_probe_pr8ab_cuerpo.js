(async () => {
  /* A/B del PAPEL. Solo siembra y genera los PDF, nada mas: cualquier otra medicion en el medio
     deja estado -el strain, los cuadros quitados, la plantilla elegida- y entonces el A y el B
     comparan dos escenas distintas y no dos arboles. Es la leccion del primer intento. */
  const R = { err: [] };
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = String(v); try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
    try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} return true; };
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const SEM = [['nombre','Zoraida Pruebas'],['fecha','2026-11-24'],['edad','64'],['sexo','M'],
    ['peso','78'],['talla','172'],
    ['ao_sin','41'],['ao_st','33'],['ao_tub','45'],['diam_cayado','30'],['diam_ao_toracica','26'],
    ['diam_tsvi_ao','21'],['ai_diam','42'],['ai_area','23'],['ai_vol','78'],
    ['ad_area','17'],['vci_diam','19'],['pmad','5'],
    ['siv','12'],['ddfvi','52'],['dsfvi','34'],['ppvi','11'],['vdfvi','140'],['vsfvi','58'],
    ['fevi','58'],['sgl','-17'],['vol_lat','82'],
    ['tvia','110'],['tapse','19'],['s_prime','11'],['vd_bas','38'],['vd_mid','31'],['vd_long','74'],
    ['vd_area_d','24'],['vd_area_s','14'],['fevd','48'],['vd_vi','0.8'],
    ['onda_e','88'],['onda_a','62'],['tde','198'],['triv','82'],['thp','95'],
    ['venp_dur_a','120'],['venp_dur_ar','155'],['venp_vel_ar','42'],['e_sep','7'],['e_lat','10'],
    ['vmax_it','2.8'],['pap_med','26'],['vp_vmax','1.1'],['ip_vmax','2.2'],['ip_vtd','1.4'],
    ['vmax_ao','4.2'],['gmedio_ao','46'],['itv_tsvi','18'],['itv_ao','95'],['diam_tsvi','21'],
    ['hemo_fc','72'],
    ['vm_morf','Prolapso / EVMS'],['im_grado','4'],['im_vc','7'],
    ['im_eroa_cont','26.1'],['vr_cont','22.7'],['im_fr_cont','26'],
    ['va_morf','Calcificada'],['ia_grado','4'],['ia_vc','4'],['ia_pht','220'],
    ['vt_morf','Normal'],['it_grado','2'],['it_vc','5'],
    ['informe_texto','Ventriculo izquierdo de dimensiones normales.\nFuncion sistolica conservada.'],
    ['en_suma','Insuficiencia mitral severa.\nEstenosis aortica moderada.']];
  SEM.forEach(p => set(p[0], p[1]));
  try { const c = document.getElementById('vci_col'); if (c) { c.value = '>50'; c.dispatchEvent(new Event('change',{bubbles:true})) } } catch (e) {}
  await esperar(600);
  const pdfTextos = (plant) => {
    const out = []; let n = 0, circ = 0, rects = 0, imgs = 0;
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return null;
    try { setPdfPlantilla(plant); } catch (e) {}
    window.jspdf.jsPDF = function (o) { const d = new J(o);
      const at = d.text; d.text = function (t) { n++; out.push(String(t)); return at.apply(this, arguments) };
      const ac = d.circle; d.circle = function (x, y, r) { if (r <= 0.8) circ++; return ac.apply(this, arguments) };
      const ar = d.rect; d.rect = function () { rects++; return ar.apply(this, arguments) };
      const ai = d.addImage; d.addImage = function () { imgs++; return ai.apply(this, arguments) };
      d.save = function () { return this };
      return d; };
    try { _pdfAjustarA4(); } catch (e) { R.err.push('pdf ' + plant + ': ' + String(e && e.message || e).slice(0,120)); }
    window.jspdf.jsPDF = J;
    const txt = out.join('\u0001');
    let h = 0; for (let i = 0; i < txt.length; i++) { h = (h * 31 + txt.charCodeAt(i)) | 0; }
    return { n, chars: txt.length, hash: h, circ, rects, imgs };
  };
  ['clasico','moderno','minimalista','academico','compacto','elegante','tipoword'].forEach(function (p) {
    try { const r = pdfTextos(p); R[p] = r ? JSON.stringify(r) : 'SIN jsPDF'; }
    catch (e) { R[p] = 'ERR ' + String(e && e.message || e).slice(0, 120); }
  });
  try { setPdfPlantilla('clasico'); } catch (e) {}
  R.censo = document.querySelectorAll('input[id]').length + '/'
          + document.querySelectorAll('select[id]').length + '/'
          + document.querySelectorAll('textarea[id]').length;
  try { R.excel = Object.keys(LAB_XLS_MAP).length; } catch (e) { R.excel = 'ERR'; }
  try { const i = document.getElementById('informe_texto'), s2 = document.getElementById('en_suma');
        R.informe = (i ? i.value.length : -1) + '/' + (s2 ? s2.value.length : -1); } catch (e) {}
  return R;
})()
