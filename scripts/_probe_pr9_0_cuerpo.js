(async () => {
  /* PRE-CHECK de PR9. Solo MIDE. Cuatro bloques: la tabla de strain, el PDF Tipo Word con un
     estudio largo y uno normal, el recuadro del score de Wilkins y el ingreso del SGL. */
  const R = { err: [] };
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = String(v); try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
    try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} return true; };
  const cap = (id) => { try { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; }
    catch (x) { return null } };
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}

  /* ── BLOQUE B · LA TABLA DE STRAIN ───────────────────────────────────────────────────────── */
  try {
    /* LA PESTANIA ES tab-sgl Y SE ABRE POR SU BOTON, no por showTab (P30-d: esa funcion lee el
       window.event global y revienta cuando lo que hay ahi es un success de IndexedDB). Sin
       abrirla, el contenedor vive en display:none y TODA la geometria da 0x0, que se lee igual
       que «la tabla no esta». */
    const btns = Array.prototype.slice.call(document.querySelectorAll('.tab,[role=tab],button'));
    const t = btns.find(b => (b.getAttribute('onclick')||'').indexOf("'sgl'") >= 0)
           || btns.find(b => /strain/i.test(b.textContent || ''));
    if (t) t.click();
    await esperar(500);
    const sec = document.getElementById('tab-sgl');
    if (sec && getComputedStyle(sec).display === 'none') { sec.classList.add('active'); sec.style.display = 'block'; }
    await esperar(300);
    if (typeof scRender === 'function') scRender();
    await esperar(200);
    const caja = document.getElementById('sgl-calc');
    R.tabla = { existe: !!caja, caja: cap('sgl-calc') };
    if (caja) {
      const parte = (sel) => { const e = caja.querySelector(sel); if (!e) return null;
        const r = e.getBoundingClientRect();
        return { h: Math.round(r.height), w: Math.round(r.width), txt: (e.textContent||'').slice(0,80) }; };
      R.tabla.tit   = parte('.sc-tit');
      R.tabla.nota  = parte('.sc-nota');
      R.tabla.thead = parte('thead');
      R.tabla.filas = Array.prototype.slice.call(caja.querySelectorAll('tbody tr'))
        .map(tr => Math.round(tr.getBoundingClientRect().height));
      R.tabla.celdas = Array.prototype.slice.call(caja.querySelectorAll('tbody td')).map(td => {
        const r = td.getBoundingClientRect();
        return { h: Math.round(r.height), lineas: (td.textContent||'').trim().length,
                 txt: (td.textContent||'').trim().slice(0,70) };
      });
      R.tabla.botones = Array.prototype.slice.call(caja.querySelectorAll('button')).map(b => {
        const r = b.getBoundingClientRect();
        return { ico: b.textContent, w: Math.round(r.width), h: Math.round(r.height),
                 title: b.getAttribute('title'), clase: b.className };
      });
      R.tabla.falta = Array.prototype.slice.call(caja.querySelectorAll('.sc-falta'))
        .map(d => (d.textContent||'').slice(0,90));
      try { R.tabla.css = { letra: getComputedStyle(caja.querySelector('td')).fontSize,
                            pad: getComputedStyle(caja.querySelector('td')).padding }; } catch (x) {}
      R.tabla.scrollDoc = Math.round(document.documentElement.scrollWidth - document.documentElement.clientWidth);
      R.tabla.scrollCaja = Math.round(caja.scrollWidth - caja.clientWidth);
    }
  } catch (e) { R.err.push('tabla: ' + String(e && e.message || e).slice(0,200)); }

  /* ── BLOQUE D · EL INGRESO DEL SGL: COMO SE COLA UN -1718 ────────────────────────────────── */
  try {
    R.sgl = {};
    R.sgl.parse = {};
    [ '-17', '1718', '-1718', '17', '+18', '-1718.4', '999', '12,5', '-20', '  -1718  ' ]
      .forEach(t => { try { R.sgl.parse[t] = String(strainParseNum(t)) } catch (x) { R.sgl.parse[t] = 'ERR' } });
    try { R.sgl.tramoDe1718 = strainTramoDe(-1718); } catch (x) { R.sgl.tramoDe1718 = 'ERR'; }
    /* El gesto real: abrir la casilla de un segmento, escribir -17, confirmar, reabrir, poner el
       cursor al final SIN seleccionar y escribir 18. Es lo que el medico describio. */
    const seg = document.querySelector('#sgl-svg-bullseye [data-strainid]');
    R.sgl.haySeg = !!seg;
    if (seg) {
      const id = seg.getAttribute('data-strainid');
      R.sgl.id = id;
      if (!strainNumModoOn()) { try { strainNumToggle() } catch (x) {} }
      strainCajaAbrir(id, seg);
      let c = document.querySelector('[data-strain-caja]');
      R.sgl.cajaAbre = !!c;
      if (c) {
        R.sgl.tipo = c.type; R.sgl.maxlength = c.getAttribute('maxlength');
        R.sgl.inputmode = c.getAttribute('inputmode'); R.sgl.pattern = c.getAttribute('pattern');
        c.value = '-17'; strainCajaCerrar(true);
        R.sgl.tras17 = String(strainNum[id]);
        /* Reabre: la casilla NACE con el valor viejo. Sin seleccion, escribir APENDE. */
        strainCajaAbrir(id, seg);
        c = document.querySelector('[data-strain-caja]');
        R.sgl.valorAlReabrir = c ? c.value : null;
        if (c) {
          c.setSelectionRange(c.value.length, c.value.length);   /* el caret al final: tocar la casilla */
          c.value = c.value + '18';                              /* y escribir dos digitos */
          R.sgl.loQueQueda = c.value;
          strainCajaCerrar(true);
        }
        R.sgl.tras1718 = String(strainNum[id]);
        R.sgl.tramoQueQueda = String(strainIdx(id));
        R.sgl.pintado = (typeof strainNumTxt === 'function') ? strainNumTxt(id) : 'ERR';
        /* Pegar un numero largo */
        strainCajaAbrir(id, seg);
        c = document.querySelector('[data-strain-caja]');
        if (c) { c.value = '-123456'; strainCajaCerrar(true); }
        R.sgl.trasPegar = String(strainNum[id]);
      }
    }
    /* Los promedios con un -1718 adentro: es lo que el medico vio */
    try {
      const ids = SC_GRUPOS.g17.map(i => window._scIdPub ? _scIdPub(i) : null);
      R.sgl.prom17ConBasura = String(scPromedio(SC_GRUPOS.g17));
    } catch (x) {}
    try { if (typeof sglReset === 'function') sglReset(); } catch (x) {}
  } catch (e) { R.err.push('sgl: ' + String(e && e.message || e).slice(0,200)); }

  /* ── REDONDEO ────────────────────────────────────────────────────────────────────────────── */
  try {
    R.redondeo = {};
    [ -15.75, 15.75, -11.25, 11.25, -0.125, 0.125, -2.5, 2.5 ].forEach(x => {
      R.redondeo['M1 ' + x] = (Math.round(x * 10) / 10).toFixed(1);
      R.redondeo['M2 ' + x] = (Math.round(x * 100) / 100).toFixed(2);
    });
  } catch (e) { R.err.push('red: ' + String(e && e.message || e).slice(0,200)); }

  /* ── BLOQUE C · EL PDF ───────────────────────────────────────────────────────────────────── */
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
    ['wilkins_movilidad','2'],['wilkins_engrosamiento','2'],['wilkins_calcificacion','1'],
    ['wilkins_subvalvular','2'],
    ['informe_texto','Ventriculo izquierdo de dimensiones aumentadas con funcion sistolica levemente deprimida.\nValvula mitral reumatica con estenosis moderada.\nInsuficiencia mitral moderada.\nValvula aortica calcificada con estenosis severa.\nInsuficiencia aortica moderada.\nDilatacion de la raiz aortica.\nHipertension pulmonar probable.'],
    ['en_suma','Estenosis mitral reumatica moderada.\nEstenosis aortica severa.\nInsuficiencia mitral moderada.\nHipertension pulmonar probable.']];

  const capturar = (plant) => {
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return null;
    const ops = []; let pags = 1;
    try { setPdfPlantilla(plant); } catch (e) {}
    window.jspdf.jsPDF = function (o) {
      const d = new J(o);
      let fsz = 0, fnt = '', fsty = '';
      const asf = d.setFontSize; d.setFontSize = function (s) { fsz = s; return asf.apply(this, arguments) };
      const af = d.setFont; d.setFont = function (n, s) { fnt = n; fsty = s || ''; return af.apply(this, arguments) };
      const at = d.text; d.text = function (t, x, y) {
        ops.push({ k:'t', t:String(t).slice(0,60), x:Math.round(x*10)/10, y:Math.round(y*10)/10,
                   fs:Math.round(fsz*100)/100, f:fnt+'/'+fsty, p:pags });
        return at.apply(this, arguments) };
      const ar = d.rect; d.rect = function (x, y, w, h) {
        ops.push({ k:'r', x:Math.round(x*10)/10, y:Math.round(y*10)/10,
                   w:Math.round(w*10)/10, h:Math.round(h*10)/10, p:pags });
        return ar.apply(this, arguments) };
      const ap = d.addPage; d.addPage = function () { pags++; return ap.apply(this, arguments) };
      const ai = d.addImage; d.addImage = function (a,b,x,y,w,h) {
        ops.push({ k:'i', x:Math.round(x*10)/10, y:Math.round(y*10)/10, w:Math.round(w), h:Math.round(h), p:pags });
        return ai.apply(this, arguments) };
      d.save = function () { return this };
      return d; };
    try { _pdfAjustarA4(); } catch (e) { R.err.push('pdf ' + plant + ': ' + String(e && e.message || e).slice(0,160)); }
    window.jspdf.jsPDF = J;
    return { pags, ops };
  };
  const resumir = (cap) => {
    if (!cap) return 'SIN jsPDF';
    const ts = cap.ops.filter(o => o.k === 't');
    const tam = {};
    ts.forEach(o => { const k = o.fs + ' ' + o.f; tam[k] = (tam[k]||0)+1 });
    return { hojas: cap.pags, textos: ts.length, rects: cap.ops.filter(o=>o.k==='r').length,
             imgs: cap.ops.filter(o=>o.k==='i').length, tamanios: tam };
  };
  try {
    SEM_NORMAL.forEach(p => set(p[0], p[1]));
    await esperar(700);
    const cN = capturar('tipoword');
    R.pdfNormal = resumir(cN);
    if (cN) {
      /* Los primeros 40 textos con su y, para ver los huecos irregulares */
      R.pdfNormalOps = cN.ops.filter(o => o.k === 't').slice(0, 46)
        .map(o => o.p + '|' + o.y + '|' + o.fs + '|' + o.f + '|' + o.t);
    }
    R.pdfNormalClasico = resumir(capturar('clasico'));
  } catch (e) { R.err.push('pdfN: ' + String(e && e.message || e).slice(0,200)); }

  try {
    if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (x) {} }
    await esperar(400);
    SEM_LARGO.forEach(p => set(p[0], p[1]));
    /* El score de Wilkins al PDF */
    try { const b = document.getElementById('cx-wilkins-pdf'); if (b) b.click(); } catch (x) {}
    await esperar(800);
    try { R.wilkinsOn = String((document.getElementById('wilkins_incluir_pdf')||{}).value); } catch (x) {}
    const cL = capturar('tipoword');
    R.pdfLargo = resumir(cL);
    if (cL) {
      R.pdfLargoOps = cL.ops.filter(o => o.k === 't').slice(0, 46)
        .map(o => o.p + '|' + o.y + '|' + o.fs + '|' + o.f + '|' + o.t);
      /* EL RECUADRO DEL WILKINS: el rect gris y el texto que viene despues */
      const idx = cL.ops.findIndex(o => o.k === 't' && /Salvedad/.test(o.t));
      if (idx >= 0) {
        R.wilkins = { desde: idx };
        R.wilkins.ventana = cL.ops.slice(Math.max(0, idx - 8), idx + 14).map(o =>
          o.k === 't' ? ('T p' + o.p + ' y=' + o.y + ' fs=' + o.fs + ' ' + o.t)
                      : (o.k.toUpperCase() + ' p' + o.p + ' y=' + o.y + ' h=' + (o.h||'') + ' w=' + (o.w||'')));
      } else { R.wilkins = 'sin Salvedad en el PDF'; }
      /* Los rects del color del tema (la franja azul) en la hoja del Wilkins */
      R.pdfLargoRectsGrandes = cL.ops.filter(o => o.k === 'r' && o.w > 150)
        .map(o => 'p' + o.p + ' y=' + o.y + ' h=' + o.h + ' w=' + o.w).slice(0, 24);
    }
    R.pdfLargoClasico = resumir(capturar('clasico'));
  } catch (e) { R.err.push('pdfL: ' + String(e && e.message || e).slice(0,200)); }
  try { setPdfPlantilla('clasico'); } catch (e) {}
  return R;
})()
