/* Cuerpo de la sonda de la tanda CUADROS. Vive aparte y se lee con readFile: así los acentos
   graves son codigo normal y no cierran el template de la sonda — la leccion de MEDIR-4b. */
function (opt) {
  var O = { escena: opt.escena };
  function set(id, val) {
    var e = document.getElementById(id);
    if (!e) return 'NO EXISTE ' + id;
    if (e.type === 'checkbox') { e.checked = !!val; }
    else { e.value = String(val); }
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return null;
  }
  var faltan = [];
  function S(id, val) { var r = set(id, val); if (r) faltan.push(id); }

  /* ⚠️ EL OVERLAY DE LOGIN TAPA LA PAGINA ENTERA y `elementFromPoint` devuelve `login-overlay`
     en TODOS los puntos: sin esto el arrastre mide «no hay ningun cuadro debajo del dedo» sobre
     un arrastre que funciona. Es la trampa que TC-395 documenta con sus tres denominadores. */
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  try { limpiarCampos(true); } catch (e) {}

  if (opt.escena === 'full') {
    S('nombre', 'Prueba Cuadros'); S('fecha', '2026-11-18'); S('edad', '64'); S('sexo', 'M');
    S('peso', '78'); S('talla', '172');
    S('ao_sin', '41'); S('ao_st', '33'); S('ao_tub', '45');
    S('diam_cayado', '30'); S('diam_ao_toracica', '26'); S('diam_tsvi_ao', '21');
    S('ai_diam', '42'); S('ai_area', '23'); S('ai_vol', '78');
    S('ad_area', '17'); S('vci_diam', '19'); S('vci_col', '>50'); S('pmad', '5');
    S('siv', '12'); S('ddfvi', '52'); S('dsfvi', '34'); S('ppvi', '11');
    S('vdfvi', '140'); S('vsfvi', '58'); S('fevi', '58'); S('sgl', '-17'); S('vol_lat', '82');
    S('tvia', '110'); S('tapse', '19'); S('s_prime', '11');
    S('vd_bas', '38'); S('vd_mid', '31'); S('vd_long', '74'); S('vd_fac', '42'); S('fevd', '48');
    S('onda_e', '88'); S('onda_a', '62'); S('tde', '198'); S('triv', '82'); S('thp', '95');
    S('venp_dur_a', '120'); S('venp_dur_ar', '155'); S('venp_vel_ar', '42');
    S('e_sep', '7'); S('e_lat', '10');
    S('vmax_it', '2.8'); S('pap_med', '22');
    S('vp_vmax', '1.1'); S('vp_morf', 'Normal'); S('ip_vmax', '2.2'); S('ip_vtd', '1.4');
    S('ip_grado', 'Moderada');
    S('vmax_ao', '4.2'); S('gmedio_ao', '46'); S('itv_tsvi', '18'); S('itv_ao', '95');
    S('diam_tsvi', '21'); S('hemo_fc', '72');
    /* Las lineas de valvula */
    S('vm_morf', 'Prolapso / EVMS'); S('im_grado', '4'); S('im_vc', '7');
    S('im_eroa_cont', '26.1'); S('vr_cont', '22.7'); S('im_fr_cont', '26');
    /* La casilla «Cont:» del selector de metodo: sin tildarla `_imMetodoPdfPartes` no publica el
       metodo por continuidad, que es exactamente lo que su comentario dice. */
    S('im_pdf_cont', true);
    S('em_grado', 'sin'); S('vm_notas', 'Flail de P2.');
    S('va_morf', 'Calcificada'); S('ia_grado', '4'); S('ia_vc', '4'); S('ia_pht', '220');
    S('vt_morf', 'Normal'); S('it_grado', '2'); S('it_vc', '5');
    S('pericardio', 'Derrame leve (<10mm)'); S('otras_notas', 'Sin masas');
    S('pua_lineasb', 'focales'); S('pua_derrame', 'si'); S('pua_derrame_lado', 'bilateral');
    S('otr_var_chiari', true);
    S('vd_vi', '0.8');
  } else {
    S('nombre', 'Minimo'); S('fecha', '2026-11-18'); S('sexo', 'F');
    S('ddfvi', '48'); S('fevi', '62'); S('ai_diam', '36');
  }
  try { if (typeof recalcularTodo === 'function') recalcularTodo(); } catch (e) {}
  /* ⚠️ EL INFORME NARRATIVO SE GENERA, y no es un adorno: sin el, el PDF sale con los cuadros y
     nada mas, y la paginacion que hay que mirar —que el texto del informe siga fluyendo con la
     fila de valvulas retirada— no se puede medir sobre un papel sin informe. */
  try { if (opt.escena === 'full' && typeof generarInforme === 'function') generarInforme(); } catch (e) {}
  try { if (typeof calcAo === 'function') calcAo(); } catch (e) {}
  try { if (typeof calcHemo === 'function') calcHemo(); } catch (e) {}
  O.faltan = faltan;

  /* (A) LOS DOCE CUADROS Y SU ORDEN */
  try {
    O.defs = cuadDefs().map(function (d) {
      return { id: d.id, tit: d.titulo,
               n: (d.items || []).filter(function (i) { return i.val != null && String(i.val).trim() !== '' }).length,
               n2: (d.items2 || []).filter(function (i) { return i.val != null && String(i.val).trim() !== '' }).length,
               lin: (d.lineas || []).map(function (l) { return (l.azul ? '*' : '') + l.txt }),
               nota: d.nota || null,
               refs: (d.items || []).concat(d.items2 || []).map(function (i) { return i.ref || '' }).filter(function (x) { return x !== '' }) };
    });
  } catch (e) { O.defsErr = String(e && e.message || e); }
  try { O.vis = cuadVisibles().map(function (d) { return d.id }); } catch (e) { O.visErr = String(e && e.message || e); }
  try {
    O.filas = {};
    [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13].forEach(function (n) { O.filas[n] = cuadFilas(n).join('-') });
  } catch (e) { O.filasErr = String(e && e.message || e); }

  /* (B) EL PDF DE VERDAD, con save interceptado */
  O.pdf = null;
  /* ⚠️ SE ENVUELVE EL CONSTRUCTOR Y NO EL PROTOTIPO, Y ESTO SE MIDIO: jsPDF 2.5.1 **DEVUELVE UN
     OBJETO PROPIO** desde su constructor y le copia los metodos de `jsPDF.API` uno por uno, asi
     que `jsPDF.prototype.save` no es el `save` que el documento termina usando. Con el prototipo
     parcheado la captura daba null sobre un PDF que SI se habia generado — un falso negativo que
     se lee igual que «el PDF no sale». */
  function pdfGen() {
    var cap = null;
    var J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return { error: 'NO HAY jsPDF' };
    window.jspdf.jsPDF = function (o) {
      var d = new J(o);
      d.save = function () { try { cap = this.output('datauristring') } catch (e) { cap = 'ERR ' + e } return this };
      return d;
    };
    try { _pdfAjustarA4(); } catch (e) { window.jspdf.jsPDF = J; return { error: String(e && e.message || e) } }
    window.jspdf.jsPDF = J;
    if (!cap || String(cap).indexOf('ERR') === 0) return { error: 'sin captura ' + cap };
    return { b64: String(cap).split(',')[1] };
  }
  /* La configuracion de demo: un cuadro quitado y el orden cambiado, para que el PDF de cada
     estilo tenga que reflejarla. */
  if (opt.cfg === 'demo') {
    _cuadQuit = ['gc'];
    _cuadOrden = ['otros', 'ao', 'ai', 'advci', 'viest', 'visis', 'vd', 'vm', 'dti', 'trip', 'va', 'gc'];
  }
  O.cfgVis = cuadVisibles().map(function (d) { return d.id });
  if (opt.pdf !== false) O.pdf = pdfGen();

  /* (C) QUITAR, REORDENAR Y RESTABLECER — sobre el estado, sin tarjeta todavia */
  try {
    O.pers0 = cuadPersonalizado();
    _cuadQuit = ['gc'];
    O.visQuit1 = cuadVisibles().map(function (d) { return d.id });
    _cuadQuit = ['gc', 'otros', 'dti'];
    O.visQuit3 = cuadVisibles().map(function (d) { return d.id });
    O.pers1 = cuadPersonalizado();
    _cuadQuit = [];
    _cuadOrden = ['otros', 'gc', 'ao', 'ai', 'advci', 'viest', 'visis', 'vd', 'vm', 'dti', 'trip', 'va'];
    O.visOrden = cuadVisibles().map(function (d) { return d.id });
    O.pers2 = cuadPersonalizado();
    cuadReset();
    O.visReset = cuadVisibles().map(function (d) { return d.id });
    O.pers3 = cuadPersonalizado();
  } catch (e) { O.estadoErr = String(e && e.message || e) }
  /* ══ (D) LA TARJETA ══════════════════════════════════════════════════════════════════════
     Se mide el BOTON, el punto de aviso, la grilla, el quitar y recuperar, el arrastre con
     eventos de puntero y «Restablecer». Y el censo de TODOS los controles con id antes y despues:
     la tarjeta no escribe un solo campo, y eso no se promete, se mide. */
  if (opt.tarjeta) {
    var T = {};
    function censo() {
      var o = [];
      Array.prototype.forEach.call(document.querySelectorAll('input[id],select[id],textarea[id]'), function (e) {
        o.push(e.id + '=' + (e.type === 'checkbox' ? (e.checked ? '1' : '0') : String(e.value)));
      });
      return o.join('|');
    }
    function caja(el) { var r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } }
    function ids() {
      return Array.prototype.map.call(document.querySelectorAll('#cuad-grid > [data-cuad-id]'),
        function (n) { return n.getAttribute('data-cuad-id') }).join(',');
    }
    function spans() {
      return Array.prototype.map.call(document.querySelectorAll('#cuad-grid > [data-cuad-id]'),
        function (n) { return n.getAttribute('data-cuad-span') }).join(',');
    }
    try { cuadReset(); } catch (e) {}
    var antes = censo();
    var b = document.getElementById('cuad-btn');
    T.btn = b ? caja(b) : null;
    T.btnSvg = !!(b && b.querySelector('svg rect') && b.querySelectorAll('svg rect').length === 4);
    T.btnTexto = b ? (b.textContent || '').trim() : null;
    try { cuadBtnSync(); } catch (e) {}
    T.pt0 = (function () { var e = document.getElementById('cuad-pt'); return e ? e.hidden : null })();
    T.tit0 = b ? b.getAttribute('title') : null;
    /* El desplazamiento horizontal ANTES de abrir la tarjeta: sin este denominador, un scroll
       preexistente de la pagina se lee como si lo hubiera traido la tarjeta. */
    T.scrollXsin = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    try { cuadAbrir(); } catch (e) { T.abrirErr = String(e && e.message || e) }
    T.abierta = !document.getElementById('cuad-ov').hidden;
    T.ids0 = ids(); T.spans0 = spans();
    /* ⚠️ EL `span` ES UN ATRIBUTO Y LA MEDIA QUERY DE CELULAR LO PISA, asi que el atributo NO
       dice cuantos cuadros hay por fila: se mide el ANCHO real contra el de la grilla. Un cuadro
       por fila en celular es el ancho de la grilla; tres por fila es un tercio. */
    var _g = document.getElementById('cuad-grid'), _c0 = document.querySelector('#cuad-grid > [data-cuad-id]');
    T.gridW = _g ? Math.round(_g.getBoundingClientRect().width) : null;
    T.cajaW = _c0 ? Math.round(_c0.getBoundingClientRect().width) : null;
    T.porFila = (T.gridW && T.cajaW) ? Math.round(T.gridW / T.cajaW) : null;
    T.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    /* Textos recortados DENTRO de un cuadro: el titulo lleva puntos suspensivos a proposito
       (y su `title` completo), asi que se mide el CUERPO, que no puede perder un dato. */
    T.recortados = 0;
    Array.prototype.forEach.call(document.querySelectorAll('#cuad-grid .cuad-brow, #cuad-grid .cuad-blin'),
      function (n) { if (n.scrollWidth > n.clientWidth + 1) T.recortados++ });
    T.n0 = T.ids0 ? T.ids0.split(',').length : 0;
    /* Los dos controles de cada cuadro: el area tactil de esta casa son 44 px. */
    var g1 = document.querySelector('#cuad-grid .cuad-grip');
    var x1 = document.querySelector('#cuad-grid .cuad-x');
    T.grip = g1 ? caja(g1) : null; T.equis = x1 ? caja(x1) : null;
    /* (D1) QUITAR UNO, DOS Y TRES */
    try { cuadQuitar('gc'); } catch (e) {}
    T.ids1 = ids(); T.spans1 = spans();
    T.franja1 = !document.getElementById('cuad-franja').hidden;
    T.chips1 = document.querySelectorAll('#cuad-chips button').length;
    T.pt1 = document.getElementById('cuad-pt').hidden;
    T.tit1 = b.getAttribute('title');
    try { cuadQuitar('dti'); cuadQuitar('otros'); } catch (e) {}
    T.ids3 = ids(); T.spans3 = spans(); T.chips3 = document.querySelectorAll('#cuad-chips button').length;
    /* (D2) RECUPERAR CON UN TOQUE */
    var chip = document.querySelector('#cuad-chips button');
    T.chipTxt = chip ? (chip.textContent || '').trim() : null;
    if (chip) chip.click();
    T.idsRec = ids(); T.chipsRec = document.querySelectorAll('#cuad-chips button').length;
    /* (D3) EL ARRASTRE CON EVENTOS DE PUNTERO */
    try { cuadRestablecer(); } catch (e) {}
    var cajas = document.querySelectorAll('#cuad-grid > [data-cuad-id]');
    T.antesArr = ids();
    if (cajas.length >= 3) {
      var orig = cajas[0], dest = cajas[2];
      var gr = orig.querySelector('.cuad-grip');
      var rd = dest.getBoundingClientRect();
      function pev(t, x, y) {
        var e;
        try { e = new PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 1,
                                        pointerType: 'touch', clientX: x, clientY: y }) }
        catch (err) { e = new MouseEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y }); }
        gr.dispatchEvent(e);
      }
      var rg = gr.getBoundingClientRect();
      pev('pointerdown', rg.left + 4, rg.top + 4);
      pev('pointermove', rd.left + rd.width - 6, rd.top + 10);
      pev('pointerup', rd.left + rd.width - 6, rd.top + 10);
    }
    T.despuesArr = ids();
    T.ordenArr = (typeof _cuadOrden !== 'undefined' && _cuadOrden) ? _cuadOrden.join(',') : null;
    T.ptArr = document.getElementById('cuad-pt').hidden;
    /* (D4) RESTABLECER */
    try { cuadRestablecer(); } catch (e) {}
    T.idsRest = ids(); T.ptRest = document.getElementById('cuad-pt').hidden;
    T.titRest = b.getAttribute('title');
    /* (D5) CERRAR CON ESCAPE */
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    T.cerrada = document.getElementById('cuad-ov').hidden;
    T.censoIgual = (censo() === antes);
    O.tarjeta = T;
  }
  /* ══ (E) LA CONFIGURACION SOBREVIVE A «Nuevo estudio» Y A ABRIR OTRO ESTUDIO ══════════════
     Correccion del medico del 18/11/2026. `cargarEstudioPorId` limpia antes de poblar, asi que si
     `limpiarCampos` no la descarta, ninguna de las dos puertas la descarta.
     ⚠️ VA AL FINAL: vacia el formulario, y todo lo de arriba mide sobre los datos sembrados. */
  try {
    _cuadQuit = ['gc'];
    _cuadOrden = ['otros'].concat(CUAD_IDS.filter(function (x) { return x !== 'otros' }));
    limpiarCampos(true);
    O.trasLimpiar = { quit: _cuadQuit.join(','), orden: cuadOrdenVigente().join(','),
                      pers: cuadPersonalizado() };
    cuadReset();
  } catch (e) { O.persErr = String(e && e.message || e) }
  return O;
}
