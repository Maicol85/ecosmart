/* Cuerpo de la sonda del TEXTO TIPO WORD (PR6-3). SIN ACENTOS GRAVES a proposito. */
(() => {
  const out = {};
  const g = (id) => document.getElementById(id);
  const set = (id, val) => { const e = g(id); if (!e) return false;
    e.value = String(val); e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  const chk = (id, on) => { const e = g(id); if (!e) return false;
    e.checked = !!on; e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  const hay = (n) => { try { return typeof window[n] === 'function' } catch (e) { return false } };
  const txt = () => { try { return hay('cuadTexto') ? cuadTexto() : 'NO EXISTE' }
                      catch (e) { return 'ERR: ' + String(e && e.message || e) } };
  const faltan = () => { try { return hay('cuadTextoFaltan') ? cuadTextoFaltan() : ['NO EXISTE'] }
                         catch (e) { return ['ERR: ' + String(e && e.message || e)] } };
  const secs = () => { try { return hay('cuadTextoSecs') ? cuadTextoSecs() : [] }
                       catch (e) { return [] } };
  const limpiar = () => { try { if (hay('limpiarCampos')) limpiarCampos() } catch (e) {} };

  /* ══ (A) ESTUDIO CASI VACIO -- el tercer caso de oro, y es el DENOMINADOR de los otros dos ══ */
  limpiar();
  set('nombre', 'Vacio'); set('edad', '50'); set('sexo', 'M');
  set('ddfvi', '48');
  out.casiVacio = { texto: txt(), secs: secs().map((s) => s.tit).join(' | '), faltan: faltan() };

  /* ══ (B) ESTUDIO NORMAL ══ */
  limpiar();
  [['nombre','Normal'],['fecha','2026-11-23'],['edad','44'],['sexo','F'],['peso','62'],['talla','162'],
   ['ao_sin','31'],['ao_st','27'],['ao_tub','29'],['diam_cayado','26'],['diam_ao_toracica','22'],
   ['diam_tsvi_ao','20'],['ai_diam','33'],['ai_area','17'],['ai_vol','44'],
   ['ad_area','14'],['vci_diam','14'],['vci_col','>50'],['pmad','3'],
   ['siv','8'],['ddfvi','45'],['dsfvi','28'],['ppvi','8'],['vdfvi','92'],['vsfvi','34'],
   ['fevi','63'],['sgl','-21'],['vol_lat','58'],
   ['tvia','130'],['tapse','23'],['s_prime','13'],['vd_bas','32'],['vd_mid','26'],['vd_long','68'],
   ['vd_area_d','19'],['vd_area_s','10'],['fevd','58'],['vd_vi','0.6'],
   ['onda_e','82'],['onda_a','60'],['tde','190'],['triv','72'],['thp','62'],
   ['venp_dur_a','118'],['venp_dur_ar','100'],['venp_vel_ar','24'],
   ['e_sep','10'],['e_lat','14'],
   ['vmax_it','2.1'],['pap_med','14'],['vp_vmax','0.9'],['ip_vmax','1.6'],['ip_vtd','1.1'],
   ['vmax_ao','1.3'],['gmedio_ao','5'],['itv_tsvi','22'],['itv_ao','26'],['diam_tsvi','20'],
   ['hemo_fc','68'],
   ['vm_morf','Normal'],['va_morf','Trivalva normal'],['vt_morf','Normal'],
   ['pericardio','Sin derrame'],['otras_notas','Sin masas']
  ].forEach((p) => set(p[0], p[1]));
  out.normal = { texto: txt(), faltan: faltan() };

  /* ══ (C) ESTENOSIS AORTICA CON INSUFICIENCIA MITRAL ══ */
  limpiar();
  [['nombre','EA con IM'],['fecha','2026-11-23'],['edad','74'],['sexo','M'],['peso','80'],['talla','170'],
   ['ao_sin','41'],['ao_st','33'],['ao_tub','45'],['diam_cayado','30'],['diam_ao_toracica','26'],
   ['diam_tsvi_ao','21'],['ai_diam','45'],['ai_area','24'],['ai_vol','82'],
   ['ad_area','18'],['vci_diam','20'],['vci_col','<50'],['pmad','8'],
   ['siv','13'],['ddfvi','56'],['dsfvi','38'],['ppvi','12'],['vdfvi','150'],['vsfvi','66'],
   ['fevi','52'],['sgl','-15'],['vol_lat','84'],
   ['tvia','101'],['tapse','18'],['s_prime','11'],['vd_bas','38'],['vd_mid','31'],['vd_long','74'],
   ['vd_area_d','24'],['vd_area_s','14'],['fevd','46'],['vd_vi','0.8'],
   ['onda_e','95'],['onda_a','58'],['tde','210'],['triv','95'],['thp','70'],
   ['venp_dur_a','125'],['venp_dur_ar','160'],['venp_vel_ar','42'],
   ['e_sep','6'],['e_lat','9'],
   ['vmax_it','3.1'],['pap_med','26'],['vp_vmax','1.2'],['ip_vmax','2.4'],['ip_vtd','1.5'],
   ['vmax_ao','4.4'],['gmedio_ao','48'],['itv_tsvi','19'],['itv_ao','98'],['diam_tsvi','21'],
   ['hemo_fc','72'],
   ['vm_morf','Prolapso / EVMS'],['im_grado','3'],['im_vc','6'],
   ['im_eroa_cont','28'],['vr_cont','45'],['im_fr_cont','42'],['vm_notas','Flail de P2.'],
   ['va_morf','Calcificada'],['ea_grado','severa'],['ia_grado','2'],['ia_vc','3'],['ia_pht','420'],
   ['vt_morf','Normal'],['it_grado','2'],['it_vc','5'],
   ['pericardio','Derrame leve (<10mm)'],['otras_notas','Sin masas']
  ].forEach((p) => set(p[0], p[1]));
  chk('im_pdf_cont', true);
  out.eaIm = { texto: txt(), faltan: faltan() };

  /* ══ (D) ORDEN de secciones, y el DOPPLER con su titulo propio ══ */
  out.orden = secs().map((s) => s.tit).join(' | ');

  /* ══ (E) NINGUN HALLAZGO DE VALVULA en el texto ══ */
  const T = out.eaIm.texto;
  out.sinHallazgos = {
    /* Los grados y la morfologia, que el cuadro publica y este texto no. */
    /* ⚠️ LOS PATRONES VAN ANCLADOS AL ARRANQUE DE UNA PIEZA, Y NO SUELTOS. Sueltos daban DOS
       falsos positivos sobre un texto correcto: «IT: » cae dentro de «V.Max IT: 3.1 m/s» y el
       «74» de la edad cae dentro de «longitudinal: 74 mm». Una pieza arranca al principio de la
       linea -tras la sangria- o despues de un « - », asi que se mide ahi. */
    grados: (() => {
      const piezas = [];
      T.split(/\r?\n/).forEach((l) => l.replace(/^\s+/, '').split(' - ')
        .forEach((p) => piezas.push(p.trim())));
      const PROH = ['IM', 'IAo', 'IT', 'EA grado', 'EM grado', 'ET grado', 'Morf.'];
      return piezas.filter((p) => PROH.some((k) => p === k || p.indexOf(k + ':') === 0))
        .concat(['Prolapso', 'Calcificada', 'Flail'].filter((f) => T.indexOf(f) >= 0))
        .join(',');
    })(),
    /* Ni el cuadro «Otros»: pericardio, masas, pulmon y variantes son hallazgos. */
    otros: ['Derrame', 'masas', 'Sin masas', 'Pericardio'].filter((f) => T.indexOf(f) >= 0).join(','),
    /* Ni el texto del informe ni datos del paciente. */
    /* El NOMBRE y el documento, no un numero pelado: el «74» de la edad es tambien el valor de
       «longitudinal: 74 mm», y buscarlo suelto acusa al texto de publicar la edad. */
    paciente: ['EA con IM', 'Zoraida', 'Pruebas', 'Vacio', 'Normal:'].filter((f) => T.indexOf(f) >= 0).join(',')
  };

  /* ══ (F) LOS NUMEROS DEL TEXTO SON LOS DEL CUADRO -- ni una segunda derivacion ══
     Se comparan pieza por pieza contra el indice de cuadDefs(), que es de donde salen. */
  out.coinciden = (() => {
    let defs = []; try { defs = cuadDefs() } catch (e) { return 'ERR' }
    const malas = [];
    defs.forEach((d) => { (d.items || []).concat(d.items2 || []).forEach((i) => {
      if (!i || i.val == null) return;
      const s = String(i.val).trim(); if (!s) return;
      if (['Morf.','IM','IAo','IT','EA grado','EM grado','ET grado','Notas'].indexOf(i.lbl) >= 0) return;
      if (d.id === 'otros') return;
      /* El valor tiene que aparecer LITERAL en el texto. */
      if (T.indexOf(s) < 0) malas.push(d.id + '|' + i.lbl + '=' + s);
    }); });
    return malas.length ? malas.join(' ; ') : 'TODOS';
  })();
  /* ══ (G) LOS DOS BOTONES, con el portapapeles SIMULADO y por el GESTO REAL ══
     Se sustituye navigator.clipboard.writeText y se aprieta el boton: asi se mide lo que de
     verdad llega al portapapeles y no lo que la funcion devuelve. */
  out.botones = (() => {
    /* ⚠️ DENOMINADOR DEL SEGUNDO BOTON: el informe hay que GENERARLO. Con el textarea vacio
       `cuadInformeTexto()` devuelve cadena vacia, `_cuadCopiar` dice «no hay nada que copiar» y
       no copia -que es lo correcto-, asi que la primera medicion dio «copiados: 1» sobre dos
       botones que funcionan. Un cero sobre nada se lee igual que un cero sobre algo. */
    try { if (hay('generarInforme')) generarInforme() } catch (e) {}
    try { const t = g('en_suma'); if (t && !t.value.trim()) {
      t.value = 'Estenosis aortica severa. Insuficiencia mitral moderada.';
      t.dispatchEvent(new Event('input', { bubbles: true })); } } catch (e) {}
    try { if (hay('cuadAbrir')) cuadAbrir() } catch (e) {}
    const bs = Array.prototype.slice.call(document.querySelectorAll('.cuad-copia'));
    const r = { n: bs.length,
      cajas: bs.map((b) => { const q = b.getBoundingClientRect();
        return Math.round(q.width) + 'x' + Math.round(q.height) }).join(' '),
      titulos: bs.map((b) => (b.getAttribute('title') || '').slice(0, 40)).join(' || '),
      ariaIgual: bs.every((b) => b.getAttribute('title') === b.getAttribute('aria-label')) };
    /* El portapapeles simulado. Se guarda el original y se repone. */
    const orig = navigator.clipboard && navigator.clipboard.writeText;
    let cap = [];
    try {
      if (!navigator.clipboard) Object.defineProperty(navigator, 'clipboard', { value:{}, configurable:true });
      navigator.clipboard.writeText = function (t) { cap.push(String(t)); return Promise.resolve(); };
    } catch (e) { r.noSePudoSustituir = String(e && e.message || e); return r; }
    if (bs[0]) bs[0].click();
    if (bs[1]) bs[1].click();
    r.copiados = cap.length;
    r.datosIgualAFuncion = (cap[0] != null && hay('cuadTexto')) ? (cap[0] === cuadTexto()) : 'NO';
    r.informeIgualAFuncion = (cap[1] != null && hay('cuadInformeTexto'))
      ? (cap[1] === cuadInformeTexto()) : 'NO';
    r.datosSinPaciente = cap[0] != null
      ? ['EA con IM', 'Zoraida', 'Pruebas'].filter((f) => cap[0].indexOf(f) >= 0).join(',') : 'NO';
    /* Y la copia NO depende de los cuadros quitados ni movidos. */
    const antes = cap[0];
    try { if (hay('cuadQuitar')) { cuadQuitar('va'); cuadQuitar('vd'); cuadQuitar('ai'); } } catch (e) {}
    cap = []; if (bs[0]) bs[0].click();
    r.quitadosN = (() => { try { return hay('cuadVisibles') ? cuadVisibles().length : -1 } catch (e) { return -1 } })();
    r.igualTrasQuitar = (cap[0] === antes);
    try { if (hay('cuadRestablecer')) cuadRestablecer() } catch (e) {}
    try { if (orig) navigator.clipboard.writeText = orig; } catch (e) {}
    try { if (hay('cuadCerrar')) cuadCerrar() } catch (e) {}
    return r;
  })();
  return out;
})()
