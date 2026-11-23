/* Cuerpo de la sonda de PR6. SIN ACENTOS GRAVES a proposito: metido en el template literal del
   runner, uno solo lo cierra antes de tiempo y cuando lo que queda es JS valido node --check NO
   lo ve (la leccion de PANT-31). */
(() => {
  const out = {};
  const g = (id) => document.getElementById(id);
  const set = (id, val) => { const e = g(id); if (!e) return false;
    e.value = String(val); e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  const chk = (id, on) => { const e = g(id); if (!e) return false;
    e.checked = !!on; e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  /* TODO ACCESO POR UN AYUDANTE CON GUARDA: contra el arbol anterior estas funciones no existen y
     un acceso pelado tira ReferenceError que se lleva la sonda entera. */
  const hay = (n) => { try { return typeof window[n] === 'function' } catch (e) { return false } };
  /* El censo de controles con id: lo que el estudio guarda y lo que el Excel exporta recorren
     input[id] / select[id] / textarea[id], asi que una casilla con id entraria por existir. */
  const censo = () => Array.prototype.map.call(
    document.querySelectorAll('input[id], select[id], textarea[id]'),
    (e) => e.id + '=' + (e.type === 'checkbox' ? (e.checked ? 1 : 0) : e.value)).join('|');

  /* ══ LA SIEMBRA. Es la de TC-935, con valvulopatia en las tres valvulas. ══ */
  [['nombre','Zoraida Pruebas'],['fecha','2026-11-23'],['edad','64'],['sexo','M'],
   ['peso','78'],['talla','172'],
   ['ao_sin','41'],['ao_st','33'],['ao_tub','45'],['diam_cayado','30'],['diam_ao_toracica','26'],
   ['diam_tsvi_ao','21'],['ai_diam','42'],['ai_area','23'],['ai_vol','78'],
   ['ad_area','17'],['vci_diam','19'],['vci_col','>50'],['pmad','5'],
   ['siv','12'],['ddfvi','52'],['dsfvi','34'],['ppvi','11'],['vdfvi','140'],['vsfvi','58'],
   ['fevi','58'],['sgl','-17'],['vol_lat','82'],
   ['tvia','110'],['tapse','19'],['s_prime','11'],['vd_bas','38'],['vd_mid','31'],['vd_long','74'],
   ['vd_area_d','24'],['vd_area_s','14'],['fevd','48'],['vd_vi','0.8'],
   ['onda_e','88'],['onda_a','62'],['tde','198'],['triv','82'],['thp','95'],
   ['venp_dur_a','120'],['venp_dur_ar','155'],['venp_vel_ar','42'],
   ['e_sep','7'],['e_lat','10'],
   ['vmax_it','2.8'],['pap_med','22'],['vp_vmax','1.1'],['ip_vmax','2.2'],['ip_vtd','1.4'],
   ['ip_grado','Moderada'],
   ['vmax_ao','4.2'],['gmedio_ao','46'],['itv_tsvi','18'],['itv_ao','95'],['diam_tsvi','21'],
   ['hemo_fc','72'],
   ['vm_morf','Prolapso / EVMS'],['im_grado','4'],['im_vc','7'],
   ['im_eroa_cont','26.1'],['vr_cont','22.7'],['im_fr_cont','26'],['vm_notas','Flail de P2.'],
   ['va_morf','Calcificada'],['ia_grado','4'],['ia_vc','4'],['ia_pht','220'],
   ['vt_morf','Normal'],['it_grado','2'],['it_vc','5'],
   ['pericardio','Derrame leve (<10mm)'],['otras_notas','Sin masas']
  ].forEach((p) => set(p[0], p[1]));
  chk('im_pdf_cont', true);

  /* ══ (A) EL INTERRUPTOR EXISTE, ES DISCRETO Y VIENE APAGADO ══
     LA TARJETA SE ABRE PRIMERO. Nace con el atributo hidden, y lo que esta en display:none NO
     TIENE GEOMETRIA: getBoundingClientRect devuelve 0x0 y eso se lee igual que «el control no
     esta». Es la trampa que check_mobile.js y la sonda de PANT-20 ya documentan. */
  try { if (hay('cuadAbrir')) cuadAbrir() } catch (e) {}
  out.tarjetaAbierta = (() => { const o = g('cuad-ov');
    return !o ? 'SIN OVERLAY' : (o.hasAttribute('hidden') ? 'CERRADA' : 'abierta') })();
  const lab = document.querySelector('[data-cuad-rv]');
  const cas = lab ? lab.querySelector('input[type=checkbox]') : null;
  out.sw = {
    existe: !!lab,
    sinId: cas ? !cas.id : 'SIN CASILLA',
    apagadoDeFabrica: cas ? (cas.checked === false) : 'SIN CASILLA',
    estadoDeFabrica: hay('cuadResumenValvOn') ? cuadResumenValvOn() : 'NO',
    texto: lab ? (lab.querySelector('span') || {}).textContent : null,
    /* El area tactil: el renglon entero, porque el label envuelve la casilla. */
    cajaLabel: lab ? (() => { const r = lab.getBoundingClientRect();
      return Math.round(r.width) + 'x' + Math.round(r.height) })() : null,
    cajaCasilla: cas ? (() => { const r = cas.getBoundingClientRect();
      return Math.round(r.width) + 'x' + Math.round(r.height) })() : null
  };

  /* ══ (B) LAS TRES SECCIONES, Y SOLO LAS TRES ══ */
  const rvDefs = () => { try { return hay('cuadResumenValvDefs') ? cuadResumenValvDefs() : [] }
                         catch (e) { return [] } };
  out.defs = {
    n: rvDefs().length,
    ids: rvDefs().map((d) => d.id).join('|'),
    titulos: rvDefs().map((d) => d.titulo).join('|'),
    /* NINGUNA trae columna de referencia: la tanda CUADROS las retiro del papel por orden. */
    conRef: rvDefs().reduce((a, d) => a + (d.items || []).filter((i) => i && i.ref).length, 0),
    /* NI una seccion «Otros»: es el cuadro doce. */
    hayOtros: rvDefs().some((d) => String(d.titulo).toLowerCase() === 'otros'),
    /* NI la fila EROA IT, cuyo campo no existe. */
    hayEroaIt: rvDefs().some((d) => (d.items || []).some((i) => i && /EROA IT/.test(i.lbl || ''))),
    rotulos: rvDefs().map((d) => (d.items || []).filter((i) => i && i.val != null
      && String(i.val).trim() !== '').map((i) => i.lbl).join(',')).join(' || ')
  };
  /* Y los doce cuadros no se movieron: ni uno mas, ni uno menos. */
  out.doce = { n: (() => { try { return hay('cuadDefs') ? cuadDefs().length : -1 } catch (e) { return -1 } })(),
               visibles: (() => { try { return hay('cuadVisibles') ? cuadVisibles().length : -1 } catch (e) { return -1 } })() };

  /* ══ (C) EL PDF, GENERADO DE VERDAD, APAGADO Y PRENDIDO ══
     Se envuelve el CONSTRUCTOR y no el prototipo: jsPDF 2.5.1 devuelve un objeto propio y le
     copia los metodos uno por uno. El documento sale SIN comprimir, asi que el texto dibujado
     aparece literal en los bytes. Los fragmentos son ASCII a proposito: el PDF va en WinAnsi. */
  const pdfBytes = () => {
    let cap = null;
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return null;
    window.jspdf.jsPDF = function (o) {
      const d = new J(o);
      d.save = function () { try { cap = this.output('datauristring') } catch (e) {} return this };
      return d;
    };
    try { if (hay('_pdfAjustarA4')) _pdfAjustarA4(); } catch (e) {}
    window.jspdf.jsPDF = J;
    if (!cap) return null;
    try { return atob(String(cap).split(',')[1]) } catch (e) { return null }
  };
  /* La busqueda es insensible a mayusculas: dos plantillas declaran hdrUpper, asi que el titulo
     de un cuadro sale en mayusculas en el papel. */
  const cuenta = (b, frag) => {
    if (!b) return 'SIN PDF';
    const B = b.toLowerCase(), f = frag.toLowerCase();
    let n = 0, i = B.indexOf(f);
    while (i >= 0) { n++; i = B.indexOf(f, i + 1) }
    return n;
  };
  const medirPdf = () => {
    const b = pdfBytes();
    return { bytes: b ? b.length : 'SIN PDF',
             vm: cuenta(b, 'lvula Mitral'), va: cuenta(b, 'lvula A'), vt: cuenta(b, 'lvula Tric'),
             /* DENOMINADOR: cuales de los doce titulos aparecen de verdad en el papel. */
             gasto: cuenta(b, 'Gasto card'),
             doceEnPapel: ['Aorta tor','Aur','VI ', 'Ventr', 'DTI mit', 'Tric', 'VA ', 'VM ', 'Otros']
               .map((f) => f + ':' + cuenta(b, f)).join(' '),
             tieneInforme: cuenta(b, 'Pruebas'),
             paginas: cuenta(b, '/Type /Page') };
  };
  const censoAntes = censo();
  out.pdfApagado = medirPdf();


  /* Se prende POR EL GESTO REAL -- un clic en la casilla -- y no llamando a la funcion. */
  if (cas) { cas.click(); }
  out.swTrasClic = { casilla: cas ? cas.checked : 'SIN CASILLA',
                     estado: hay('cuadResumenValvOn') ? cuadResumenValvOn() : 'NO' };
  out.pdfPrendido = medirPdf();
  /* No escribio un solo campo: el censo de controles con id, identico. */
  out.censoIgual = (censo() === censoAntes);

  /* ══ (D) «Restablecer» NO lo apaga -- es una INCLUSION, no el orden ══ */
  try { if (hay('cuadRestablecer')) cuadRestablecer() } catch (e) {}
  out.trasRestablecer = hay('cuadResumenValvOn') ? cuadResumenValvOn() : 'NO';
  /* Y el punto de aviso no se enciende por el interruptor: solo por el orden y los quitados. */
  out.personalizadoConSwitch = (() => { try {
    return hay('cuadPersonalizado') ? cuadPersonalizado() : 'NO' } catch (e) { return 'ERR' } })();

  /* ══ (E) «Nuevo estudio» NO lo apaga (vale para todos los estudios) ══ */
  try { if (hay('limpiarCampos')) limpiarCampos() } catch (e) {}
  out.trasNuevoEstudio = hay('cuadResumenValvOn') ? cuadResumenValvOn() : 'NO';
  /* Se deja apagado y la tarjeta cerrada: una sonda que deja un overlay con role=dialog abierto
     se lo deja a todo lo que mida despues (la leccion de TC-955 en la tanda EQ). */
  try { if (hay('cuadResumenValvToggle')) cuadResumenValvToggle(false) } catch (e) {}
  try { if (hay('cuadCerrar')) cuadCerrar() } catch (e) {}
  return out;
})()
