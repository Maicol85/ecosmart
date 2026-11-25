(async () => {
  /* EL PDF DE PR9: el estudio LARGO DE VERDAD -con el score de Wilkins integrado al informe-,
     en «Tipo Word» y en «clasico». Mide hojas POR DOCUMENTO, tamanios de letra por parte,
     separaciones, titulos huerfanos, lineas cortadas, solapes de recuadro y colores de anexo. */
  const R = { err: [] };
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = String(v); try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
    try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} return true; };
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}

  const SEM = [['nombre','Largo Pruebas'],['fecha','2026-11-24'],['edad','71'],['sexo','F'],
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
    ['wilkins_movilidad','2'],['wilkins_engrosamiento','2'],['wilkins_calcificacion','1'],
    ['wilkins_subvalvular','2'],
    ['informe_texto','Ventriculo izquierdo de dimensiones aumentadas con funcion sistolica levemente deprimida.\nValvula mitral reumatica con estenosis moderada.\nInsuficiencia mitral moderada.\nValvula aortica calcificada con estenosis severa.\nInsuficiencia aortica moderada.\nDilatacion de la raiz aortica.\nHipertension pulmonar probable.'],
    ['en_suma','Estenosis mitral reumatica moderada.\nEstenosis aortica severa.\nInsuficiencia mitral moderada.\nHipertension pulmonar probable.']];
  SEM.forEach(p => set(p[0], p[1]));
  try { calcWilkins(); } catch (e) {}
  await esperar(700);
  /* EL MODULO DEL WILKINS, INTEGRADO AL INFORME: es lo que lo manda a su hoja del PDF, con la
     franja de titulo, el recuadro gris de la salvedad y el subtitulo «Desglose por criterio». */
  try { amiloIntegrar('wilk'); } catch (e) { R.err.push('integrar: ' + String(e && e.message || e).slice(0,140)); }
  await esperar(500);
  R.wilkEnInforme = (function () { try {
    return (amiloEnInforme() || []).map(d => d.k).join(',') } catch (e) { return 'ERR' } })();

  const capturar = (plant) => {
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return null;
    let ops = [], pags = 1, fsz = 0, fnt = '';
    const docs = [];
    try { setPdfPlantilla(plant); } catch (e) {}
    window.jspdf.jsPDF = function (o) {
      const d = new J(o);
      ops = []; pags = 1;
      const mios = ops;
      docs.push(function () { return { hojas: pags, ops: mios } });
      const asf = d.setFontSize; d.setFontSize = function (sz) { fsz = sz; return asf.apply(this, arguments) };
      const af = d.setFont; d.setFont = function (n, st) { fnt = n + '/' + (st||''); return af.apply(this, arguments) };
      const at = d.text; d.text = function (t, x, yy) {
        mios.push({ k:'t', t:String(t), x:Math.round(x*100)/100, y:Math.round(yy*100)/100,
                    fs:Math.round(fsz*100)/100, f:fnt, p:pags });
        return at.apply(this, arguments) };
      const ar = d.rect; d.rect = function (x, yy, w, h, st) {
        mios.push({ k:'r', x:Math.round(x*100)/100, y:Math.round(yy*100)/100,
                    w:Math.round(w*100)/100, h:Math.round(h*100)/100, st:String(st||''), p:pags });
        return ar.apply(this, arguments) };
      /* El color de relleno, para saber si un anexo sale en color en «Tipo Word» (PR9-2.6). */
      const afc = d.setFillColor; d.setFillColor = function (r2,g2,b2) {
        mios.push({ k:'fc', c:[r2,g2,b2].join(','), p:pags }); return afc.apply(this, arguments) };
      const ap = d.addPage; d.addPage = function () { pags++; return ap.apply(this, arguments) };
      d.save = function () { return this };
      return d; };
    try { _pdfAjustarA4(); } catch (e) { R.err.push('pdf ' + plant + ': ' + String(e && e.message || e).slice(0,160)); }
    window.jspdf.jsPDF = J;
    return docs.length ? docs[docs.length - 1]() : null;
  };

  const analizar = (cap) => {
    if (!cap) return 'SIN jsPDF';
    const ts = cap.ops.filter(o => o.k === 't');
    const tam = {}; ts.forEach(o => { const k = o.fs + ' ' + o.f; tam[k] = (tam[k]||0)+1 });
    /* TITULO HUERFANO: un texto en NEGRITA que es el ULTIMO de su hoja. */
    const porHoja = {};
    ts.forEach(o => { (porHoja[o.p] = porHoja[o.p] || []).push(o) });
    const huerfanos = [];
    Object.keys(porHoja).forEach(function (pg) {
      const arr = porHoja[pg];
      /* el pie y la firma van a y fija >= 270: no cuentan como «ultimo del cuerpo» */
      const cuerpo = arr.filter(o => o.y < 262);
      if (!cuerpo.length) return;
      const ult = cuerpo[cuerpo.length - 1];
      /* bolditalic NO es un titulo: es como las ocho plantillas que no son «Tipo Word» dibujan
         los items del EN SUMA, y el ultimo de ellos al pie de una hoja es contenido, no un
         encabezado huerfano. Medido: sin esta exclusion el detector marcaba «Hipertension
         pulmonar probable.» en clasico y en moderno, igual en los dos arboles. */
      if (/bold/.test(ult.f) && !/bolditalic/.test(ult.f))
        huerfanos.push('p' + pg + ' y=' + ult.y + ' ' + ult.t.slice(0,40));
    });
    /* LOS CUERPOS DE LETRA DEL CUERPO DEL DOCUMENTO, por hoja: tienen que ser los mismos. */
    const porHojaTam = {};
    Object.keys(porHoja).forEach(function (pg) {
      porHojaTam[pg] = Array.from(new Set(porHoja[pg].filter(o => o.y > 28 && o.y < 262)
        .map(o => o.fs))).sort(function (a,b) { return a-b }).join(',');
    });
    /* SOLAPE DE RECUADRO: para cada rect de relleno con alto > 7,5 mm y ancho > 50, el primer
       texto que arranque DESPUES de su borde de arriba tiene que tener su tope por debajo del
       borde de ABAJO, o estar DENTRO del recuadro. */
    const CAP = 0.3528 * 0.717;
    const solapes = [];
    cap.ops.forEach(function (o, i) {
      if (o.k !== 'r' || o.h <= 7.5 || o.w <= 50) return;
      const abajo = o.y + o.h;
      /* /!\ UNA LINEA DE BASE EXACTAMENTE EN EL BORDE DE ABAJO ES EL DEFECTO, NO «adentro». La
         primera version de este detector descartaba t.y <= abajo y por eso daba «ninguno» sobre
         la tarjeta del Wilkins, que es justo el caso que el medico reporto: ahi la base del
         subtitulo cae EXACTAMENTE en el borde y sus mayusculas suben 2,44 mm hacia adentro. Se
         toma el PRIMER texto cuya base este en el borde o por debajo, y se exige que su TOPE no
         quede por encima de ese borde. */
      for (let j = i + 1; j < cap.ops.length; j++) {
        const t = cap.ops[j];
        if (t.k !== 't' || t.p !== o.p) continue;
        if (t.y < abajo - 0.01) continue;             /* todavia dentro del recuadro */
        const tope = t.y - t.fs * CAP;
        if (tope < abajo - 0.01) solapes.push('p' + t.p + ' rect[' + o.y + '..' + Math.round(abajo*100)/100
          + '] vs ' + JSON.stringify(t.t.slice(0,30)) + ' tope=' + Math.round(tope*100)/100
          + ' pisa=' + Math.round((abajo - tope)*100)/100);
        break;
      }
    });
    /* COLORES: todo relleno que NO sea blanco ni negro ni gris, por hoja (PR9-2.6). */
    const colores = {};
    cap.ops.forEach(function (o) {
      if (o.k !== 'fc') return;
      const c = o.c.split(',').map(Number);
      if (c.length === 3 && !(c[0] === c[1] && c[1] === c[2])) {
        const k = 'p' + o.p + ' rgb(' + o.c + ')';
        colores[k] = (colores[k] || 0) + 1;
      }
    });
    return { hojas: cap.hojas, textos: ts.length, tamanios: tam, huerfanos: huerfanos,
             tamPorHoja: porHojaTam, solapes: solapes, colores: Object.keys(colores).slice(0, 14) };
  };
  /* LOS NUEVE ESTILOS, que es lo que la orden pide para el recuadro del score: «generá tambien
     el PDF del score de Wilkins en los otros estilos y confirma que no hay solapamiento». */
  ['tipoword','clasico','moderno','minimalista','academico','compacto','elegante','bicolor',
   'institucional'].forEach(function (p) {
    try { R[p] = analizar(capturar(p)); }
    catch (e) { R.err.push(p + ': ' + String(e && e.message || e).slice(0,160)); }
  });
  try { setPdfPlantilla('clasico'); } catch (e) {}
  return R;
})()
