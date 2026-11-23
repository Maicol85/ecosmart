#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Inserta los casos TC-1035 a TC-1041 de la tanda PR6 en test_clinico.mjs.

Por que un insertador y no editar a mano: el cuerpo de un caso es un TEMPLATE LITERAL, asi que
UN acento grave de mas lo cierra antes de tiempo y lo que queda a veces es JS VALIDO -node --check
PASA y el runner informa «el caso no declara NINGUNA condicion»-. Lo pago PANT-31 y esta misma
tanda lo volvio a pagar en la TAREA 4. El guardian exige delta de acentos graves EXACTAMENTE
igual al numero de cuerpos que se insertan (dos por caso: el que abre y el que cierra).
"""
import re, subprocess, sys, shutil

P = 'scripts/test_clinico.mjs'
# OJO: los cuerpos se construyen con chr(96) para que este archivo NO tenga acentos graves sueltos.
AG = chr(96)

CASOS = []

def caso(nombre, titulo, cuerpo):
    CASOS.append((nombre, titulo, cuerpo))

# ── ayudantes comunes, en texto, sin acentos graves ──────────────────────────
PRELUDIO = """
  /* ⚠️ TODO ACCESO VA POR UN AYUDANTE CON GUARDA Y DEVUELVE UNA FORMA VACIA. Contra el arbol
     anterior (8618cd9) ninguna de las funciones de PR6 existe, y un acceso pelado tira
     ReferenceError que se lleva el caso ENTERO: la condicion «sin excepciones» sale roja y las de
     abajo NO LLEGAN A EVALUARSE. Es lo que TC-827 tuvo que deshacer en PANT-37 y lo que TC-1030
     pago en PR5. */
  const _hay = n => { try { return typeof window[n] === 'function' } catch (e) { return false } };
  const _txt = () => { try { return _hay('cuadTexto') ? cuadTexto() : '' } catch (e) { return '' } };
  const _secs = () => { try { return _hay('cuadTextoSecs') ? cuadTextoSecs() : [] } catch (e) { return [] } };
  const _faltan = () => { try { return _hay('cuadTextoFaltan') ? cuadTextoFaltan() : ['NO EXISTE'] }
                          catch (e) { return ['ERR'] } };
  /* El PDF se genera DE VERDAD y se leen sus bytes. Se envuelve el CONSTRUCTOR y no el prototipo:
     jsPDF 2.5.1 devuelve un objeto propio y le copia los metodos uno por uno. Sale sin comprimir,
     asi que el texto dibujado aparece literal; los fragmentos son ASCII porque va en WinAnsi. */
  const _pdf = () => {
    let cap = null, imgs = 0;
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return { b:null, imgs:0 };
    window.jspdf.jsPDF = function (o) {
      const d = new J(o);
      const ai = d.addImage;
      d.addImage = function () { imgs++; return ai.apply(this, arguments) };
      d.save = function () { try { cap = this.output('datauristring') } catch (e) {} return this };
      return d;
    };
    try { if (_hay('_pdfAjustarA4')) _pdfAjustarA4(); } catch (e) {}
    window.jspdf.jsPDF = J;
    if (!cap) return { b:null, imgs:imgs };
    try { return { b: atob(String(cap).split(',')[1]), imgs: imgs } } catch (e) { return { b:null, imgs:imgs } }
  };
  const _cont = (b, f) => { if (!b) return -1;
    const B = b.toLowerCase(), q = f.toLowerCase(); let n = 0, i = B.indexOf(q);
    while (i >= 0) { n++; i = B.indexOf(q, i + 1) } return n; };
"""

SIEMBRA_EA_IM = """
  [['nombre','Zoraida Pruebas'],['fecha','2026-11-23'],['edad','74'],['sexo','M'],
   ['peso','80'],['talla','170'],
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
  ].forEach(p => __t.set(p[0], p[1]));
  __t.chk('im_pdf_cont', true);
"""

caso('TC-1035',
 'PR6 (TAREA 3): el texto tipo Word sale con los TRES casos de oro -- normal, estenosis aortica con insuficiencia mitral y casi vacio --, con el orden de secciones fijo, DOPPLER como titulo propio, y CERO hallazgos de valvula, cero contenido del cuadro «Otros» y cero datos del paciente',
 PRELUDIO + """
  const R = {};
  /* (A) EL CASI VACIO. Es el tercer caso de oro Y el denominador de los otros dos: una seccion
     sin datos NO SALE, y una etiqueta sin valor NO SE IMPRIME. */
  __t.limpiar();
  __t.set('nombre', 'Vacio'); __t.set('edad', '50'); __t.set('sexo', 'M'); __t.set('ddfvi', '48');
  R.vacioSecs = _secs().map(s => s.tit).join(' | ');
  R.vacioTexto = _txt();
  R.vacioUnaLinea = _secs().length === 1 && (_secs()[0].lineas || []).length === 1;

  /* (B) EL NORMAL. */
  __t.limpiar();
  [['nombre','Normal'],['edad','44'],['sexo','F'],['peso','62'],['talla','162'],
   ['ao_sin','31'],['ao_st','27'],['ao_tub','29'],['diam_tsvi_ao','20'],
   ['ai_diam','33'],['ai_area','17'],['ai_vol','44'],['ad_area','14'],['vci_diam','14'],
   ['siv','8'],['ddfvi','45'],['dsfvi','28'],['ppvi','8'],['fevi','63'],['sgl','-21'],
   ['tapse','23'],['vd_bas','32'],['onda_e','82'],['onda_a','60'],['tde','190'],['triv','72'],
   ['e_sep','10'],['e_lat','14'],['vmax_it','2.1'],['vmax_ao','1.3'],['gmedio_ao','5'],
   ['itv_tsvi','22'],['itv_ao','26'],['diam_tsvi','20'],['hemo_fc','68'],
   ['vm_morf','Normal'],['va_morf','Trivalva normal'],['vt_morf','Normal']
  ].forEach(p => __t.set(p[0], p[1]));
  R.normalSecs = _secs().map(s => s.tit).join(' | ');
  R.normalTexto = _txt();

  /* (C) LA ESTENOSIS AORTICA CON INSUFICIENCIA MITRAL. */
  __t.limpiar();""" + SIEMBRA_EA_IM + """
  R.eaSecs = _secs().map(s => s.tit).join(' | ');
  const T = _txt();
  R.eaTexto = T;

  /* (D) EL ORDEN, exactamente el que la orden fija. */
  R.ordenPedido = 'Aorta | Aur' + String.fromCharCode(237) + 'cula izquierda | Ventr'
    + String.fromCharCode(237) + 'culo izquierdo | Ventr' + String.fromCharCode(237)
    + 'culo derecho | Aur' + String.fromCharCode(237) + 'cula derecha y VCI | DOPPLER | V'
    + String.fromCharCode(225) + 'lvula mitral | V' + String.fromCharCode(225)
    + 'lvula a' + String.fromCharCode(243) + 'rtica | V' + String.fromCharCode(225)
    + 'lvula tric' + String.fromCharCode(250) + 'spide y pulmonar';

  /* (E) NINGUN HALLAZGO DE VALVULA.
     ⚠️ LOS PATRONES VAN ANCLADOS AL ARRANQUE DE UNA PIEZA Y NO SUELTOS, porque sueltos dan DOS
     falsos positivos sobre un texto correcto: «IT: » cae dentro de «V.Max IT: 3.1 m/s» y el «74»
     de la edad cae dentro de «longitudinal: 74 mm». Una pieza arranca al principio de la linea
     -tras la sangria- o despues de un « - ». */
  const _piezas = s => { const out = [];
    String(s).split(String.fromCharCode(10)).forEach(l => l.replace(/^\\s+/, '').split(' - ')
      .forEach(p => out.push(p.trim()))); return out; };
  const PROH = ['IM', 'IAo', 'IT', 'EA grado', 'EM grado', 'ET grado', 'Morf.'];
  R.hallazgos = _piezas(T).filter(p => PROH.some(k => p === k || p.indexOf(k + ':') === 0))
    .concat(['Prolapso', 'Calcificada', 'Flail'].filter(f => T.indexOf(f) >= 0)).join(',');
  /* Ni el cuadro «Otros»: pericardio, masas, pulmon y variantes son HALLAZGOS, no medidas. */
  R.otros = ['Derrame', 'Sin masas', 'Pericardio'].filter(f => T.indexOf(f) >= 0).join(',');
  /* Ni datos del paciente: el NOMBRE, no un numero pelado. */
  R.paciente = ['Zoraida', 'Pruebas', 'Vacio'].filter(f => T.indexOf(f) >= 0).join(',');
  /* (F) Y la geometria ventricular SI entra, que es lo que la orden pide explicitamente. */
  R.geom = T.indexOf('Geometr') >= 0;

  return { extra: [
    ['(A1) DENOMINADOR: con el estudio casi vacio sale UNA sola seccion con UNA sola linea',
      R.vacioUnaLinea === true, R.vacioSecs + ' >>> ' + R.vacioTexto.slice(0, 120)],
    ['(A2) y es la del ventriculo izquierdo, con el unico dato cargado',
      R.vacioTexto.indexOf('DDVI: 48 mm') >= 0, R.vacioTexto.slice(0, 160)],
    ['(B1) el estudio NORMAL saca las nueve secciones en el orden pedido',
      R.normalSecs === R.ordenPedido, R.normalSecs],
    ['(B2) con sus piezas «Etiqueta: valor unidad» separadas por un guion',
      R.normalTexto.indexOf('SV: 31 mm - ST: 27 mm') >= 0, R.normalTexto.slice(0, 200)],
    ['(C1) la estenosis aortica con insuficiencia mitral tambien saca las nueve',
      R.eaSecs === R.ordenPedido, R.eaSecs],
    ['(C2) con la cuantificacion de la insuficiencia en su renglon: vena contracta, ORE, volumen regurgitante y FR',
      R.eaTexto.indexOf('vena contracta: 6 mm') >= 0 && R.eaTexto.indexOf('ORE: 28.0') >= 0
      && R.eaTexto.indexOf('volumen regurgitante: 45.0') >= 0 && R.eaTexto.indexOf('FR: 42%') >= 0,
      _piezas(R.eaTexto).filter(p => p.indexOf('ORE') === 0 || p.indexOf('vena contracta') === 0).join(' / ')],
    ['(C3) y con el area, el AVA y el AVA indexado de la aortica',
      R.eaTexto.indexOf('AVA: 0.67 cm2') >= 0 && R.eaTexto.indexOf('AVA idx: 0.34') >= 0,
      _piezas(R.eaTexto).filter(p => p.indexOf('AVA') === 0).join(' / ')],
    ['(D1) DOPPLER va como titulo propio, sin datos, antes de las tres valvulas',
      R.eaSecs.indexOf('VCI | DOPPLER | V') >= 0, R.eaSecs],
    ['(E1) CERO hallazgos de valvula en el texto', R.hallazgos === '', R.hallazgos],
    ['(E2) CERO contenido del cuadro «Otros»', R.otros === '', R.otros],
    ['(E3) CERO datos del paciente', R.paciente === '', R.paciente],
    ['(F1) y la geometria ventricular SI sale, que es un derivado y no un hallazgo de valvula',
      R.geom === true, _piezas(R.eaTexto).filter(p => p.indexOf('Geometr') === 0).join('')]
  ] };
""")

caso('TC-1036',
 'PR6 (TAREA 3): la REGLA DE COMPLETITUD -- todo campo numerico cargado que sale en los cuadros del PDF sale en el texto tipo Word -- y sus valores son los MISMOS que publica el cuadro, no una segunda derivacion',
 PRELUDIO + """
  const R = {};
  __t.limpiar();""" + SIEMBRA_EA_IM + """
  const T = _txt();
  /* (A) LA COMPLETITUD, MEDIDA SOBRE LAS CLAVES Y NO SOBRE EL TEXTO FINAL, y es a proposito: una
     pieza puede faltar del texto porque ESTE paciente no tiene el dato -lo correcto- o porque
     nadie la ubico -el defecto-, y comparando cadenas las dos cosas se leen igual. */
  R.faltan = _faltan();
  /* (B) DENOMINADOR: habia algo que contar. Sin esto, cero faltantes sobre cero claves se lee
     igual que cero faltantes sobre ciento veinte. */
  R.claves = (() => { try { if (!_hay('cuadDefs')) return -1;
    let n = 0; cuadDefs().forEach(d => { if (d.id === 'otros') return;
      (d.items || []).concat(d.items2 || []).forEach(i => {
        if (!i || i.val == null || String(i.val).trim() === '') return;
        if (['Morf.','IM','IAo','IT','EA grado','EM grado','ET grado','Notas'].indexOf(i.lbl) >= 0) return;
        n++; }); }); return n; } catch (e) { return -1 } })();
  /* (C) LOS VALORES SON LOS DEL CUADRO: cada uno aparece LITERAL en el texto. */
  R.distintos = (() => { try { if (!_hay('cuadDefs')) return ['NO EXISTE'];
    const mal = []; cuadDefs().forEach(d => { if (d.id === 'otros') return;
      (d.items || []).concat(d.items2 || []).forEach(i => {
        if (!i || i.val == null) return; const s = String(i.val).trim(); if (!s) return;
        if (['Morf.','IM','IAo','IT','EA grado','EM grado','ET grado','Notas'].indexOf(i.lbl) >= 0) return;
        if (T.indexOf(s) < 0) mal.push(d.id + '|' + i.lbl + '=' + s); }); });
    return mal; } catch (e) { return ['ERR'] } })();
  /* (D) LOS SEIS GRUPOS QUE ENTRARON POR LA REGLA y no por la lista de la orden. */
  R.porCompletitud = [
    ['los dos volumenes indexados', T.indexOf('VDFVI idx') >= 0 && T.indexOf('VSFVI idx') >= 0],
    ['el volumen latido', T.indexOf('Vol. latido') >= 0],
    ['el gasto cardiaco entero', T.indexOf('Vol. sist') >= 0 && T.indexOf('VLI:') >= 0
      && T.indexOf('GC:') >= 0 && T.indexOf('IC:') >= 0],
    ['la FAC, la FEVD y la relacion VD/VI', T.indexOf('FAC:') >= 0 && T.indexOf('FEVD:') >= 0
      && T.indexOf('VD/VI:') >= 0],
    ['la PmAD', T.indexOf('PmAD:') >= 0],
    ['los cinco de la vena pulmonar', T.indexOf('dur. A mitral') >= 0 && T.indexOf('dur. Ar') >= 0
      && T.indexOf('veloc. Ar') >= 0 && T.indexOf('Ar-A') >= 0],
    ['la PAP media', T.indexOf('PAP media') >= 0]
  ].filter(x => !x[1]).map(x => x[0]).join(' ; ');
  /* (E) Y EL TEXTO NO INVENTA NINGUNA DERIVACION: la funcion no nombra un solo campo del
     formulario por su id. Lo que arma el indice es cuadDefs(). */
  R.sinLecturaPropia = (() => { try {
    const src = String(cuadTextoSecs) + String(_cwIndice);
    return ['tapse', 'ddfvi', 'onda_e', 'vmax_ao', 'ai_diam']
      .filter(id => src.indexOf(id) >= 0).join(',') || 'ninguno';
  } catch (e) { return 'ERR' } })();

  return { extra: [
    ['(A1) CERO campos de los cuadros quedan fuera del texto', R.faltan.length === 0,
      R.faltan.join(' ; ') || 'ninguno'],
    ['(B1) DENOMINADOR: habia mas de cincuenta claves con valor que contar', R.claves > 50, String(R.claves)],
    ['(C1) y cada valor del cuadro aparece LITERAL en el texto -- ni una segunda derivacion',
      R.distintos.length === 0, R.distintos.join(' ; ') || 'todos'],
    ['(D1) los siete grupos que entraron por la regla de completitud estan',
      R.porCompletitud === '', R.porCompletitud],
    ['(E1) y el armador NO lee un solo campo del formulario por su id: su indice sale de cuadDefs',
      R.sinLecturaPropia === 'ninguno', R.sinLecturaPropia]
  ] };
""")
print('dos casos definidos')

caso('TC-1037',
 'PR6 (TAREA 3): los DOS botones de copiar existen en la tarjeta, se tocan en 44 px, copian EXACTAMENTE lo que arman sus funciones -- medido con el portapapeles simulado y por el gesto real -- y la copia NO depende de los cuadros quitados ni movidos',
 PRELUDIO + """
  const R = {};
  __t.limpiar();""" + SIEMBRA_EA_IM + """
  /* DENOMINADOR DEL SEGUNDO BOTON: el informe hay que GENERARLO. Con el textarea vacio la funcion
     devuelve cadena vacia, el copiador dice «no hay nada que copiar» y NO copia -que es lo
     correcto-, asi que sin esto se medirian «1 copiado» sobre dos botones que funcionan. */
  try { if (_hay('generarInforme')) generarInforme(); } catch (e) {}
  try { const t = document.getElementById('en_suma');
    if (t && !t.value.trim()) { t.value = 'Estenosis aortica severa.';
      t.dispatchEvent(new Event('input', { bubbles: true })); } } catch (e) {}
  /* LA TARJETA SE ABRE: lo que esta en display:none NO TIENE GEOMETRIA y 0x0 se lee igual que
     «el boton no esta». */
  try { if (_hay('cuadAbrir')) cuadAbrir(); } catch (e) {}
  R.abierta = (() => { const o = document.getElementById('cuad-ov');
    return !!o && !o.hasAttribute('hidden'); })();
  const bs = Array.prototype.slice.call(document.querySelectorAll('.cuad-copia'));
  R.n = bs.length;
  R.cajas = bs.map(b => { const q = b.getBoundingClientRect();
    return Math.round(q.width) + 'x' + Math.round(q.height) }).join(' ');
  R.chicos = bs.filter(b => { const q = b.getBoundingClientRect();
    return q.width < 44 || q.height < 44 }).length;
  R.conTitulo = bs.every(b => (b.getAttribute('title') || '').length > 20);
  R.ariaIgual = bs.every(b => b.getAttribute('title') === b.getAttribute('aria-label'));

  /* EL PORTAPAPELES SIMULADO, y se aprieta el boton: asi se mide lo que de verdad LLEGA al
     portapapeles y no lo que la funcion devuelve. */
  const orig = navigator.clipboard && navigator.clipboard.writeText;
  let cap = [];
  try {
    if (!navigator.clipboard) Object.defineProperty(navigator, 'clipboard', { value:{}, configurable:true });
    navigator.clipboard.writeText = function (t) { cap.push(String(t)); return Promise.resolve(); };
  } catch (e) { R.noSePudoSustituir = String(e && e.message || e); }
  if (bs[0]) bs[0].click();
  if (bs[1]) bs[1].click();
  R.copiados = cap.length;
  R.datosIgual = (cap[0] != null) ? (cap[0] === _txt()) : false;
  R.informeIgual = (cap[1] != null && _hay('cuadInformeTexto')) ? (cap[1] === cuadInformeTexto()) : false;
  /* El de datos no lleva un dato del paciente; el del informe SI lo lleva, que es su trabajo. */
  R.datosSinPaciente = (cap[0] != null)
    ? ['Zoraida', 'Pruebas'].filter(f => cap[0].indexOf(f) >= 0).join(',') : 'SIN COPIA';
  R.informeConSuma = (cap[1] != null) ? (cap[1].indexOf('EN SUMA') >= 0) : false;

  /* LA COPIA NO DEPENDE DE LOS CUADROS QUITADOS NI MOVIDOS. */
  const antes = cap[0];
  try { if (_hay('cuadQuitar')) { cuadQuitar('va'); cuadQuitar('vd'); cuadQuitar('ai'); } } catch (e) {}
  R.visiblesTrasQuitar = (() => { try { return _hay('cuadVisibles') ? cuadVisibles().length : -1 }
                                  catch (e) { return -1 } })();
  cap = []; if (bs[0]) bs[0].click();
  R.igualTrasQuitar = (cap[0] === antes);
  try { if (_hay('cuadRestablecer')) cuadRestablecer(); } catch (e) {}
  try { if (orig) navigator.clipboard.writeText = orig; } catch (e) {}
  try { if (_hay('cuadCerrar')) cuadCerrar(); } catch (e) {}

  return { extra: [
    ['(A0) DENOMINADOR: la tarjeta de Cuadros esta abierta', R.abierta === true, String(R.abierta)],
    ['(A1) hay DOS botones de copiar en la tarjeta', R.n === 2, String(R.n)],
    ['(A2) los dos se tocan en 44 px o mas', R.chicos === 0, R.cajas],
    ['(A3) los dos tienen su explicacion al pasar el mouse', R.conTitulo === true, String(R.conTitulo)],
    ['(A4) y la dicen tambien con palabras en su aria-label', R.ariaIgual === true, String(R.ariaIgual)],
    ['(B1) DENOMINADOR: los DOS copiaron', R.copiados === 2, String(R.copiados)],
    ['(B2) el primero copia EXACTAMENTE el texto que arma la funcion', R.datosIgual === true, String(R.datosIgual)],
    ['(B3) y sin un solo dato del paciente', R.datosSinPaciente === '', R.datosSinPaciente],
    ['(B4) el segundo copia EXACTAMENTE el informe que arma la funcion', R.informeIgual === true, String(R.informeIgual)],
    ['(B5) con su EN SUMA', R.informeConSuma === true, String(R.informeConSuma)],
    ['(C1) DENOMINADOR: se quitaron tres cuadros', R.visiblesTrasQuitar === 9, String(R.visiblesTrasQuitar)],
    ['(C2) y la copia de datos es IDENTICA: no depende de los cuadros quitados',
      R.igualTrasQuitar === true, String(R.igualTrasQuitar)]
  ] };
""")

caso('TC-1038',
 'PR6 (TAREA 2): el interruptor «Incluir resumen de valvulas» viene APAGADO, con el apagado el PDF sale sin una sola fila de valvula, prendido saca las TRES secciones, sobrevive a «Restablecer» y a «Nuevo estudio», no escribe un solo campo, y el estilo «Tipo Word» lo IGNORA',
 PRELUDIO + """
  const R = {};
  const _censo = () => Array.prototype.map.call(
    document.querySelectorAll('input[id], select[id], textarea[id]'),
    e => e.id + '=' + (e.type === 'checkbox' ? (e.checked ? 1 : 0) : e.value)).join('|');
  __t.limpiar();""" + SIEMBRA_EA_IM + """
  try { if (_hay('cuadAbrir')) cuadAbrir(); } catch (e) {}
  const lab = document.querySelector('[data-cuad-rv]');
  const cas = lab ? lab.querySelector('input[type=checkbox]') : null;
  R.existe = !!lab;
  R.sinId = cas ? !cas.id : 'SIN CASILLA';
  R.apagado = cas ? (cas.checked === false) : 'SIN CASILLA';
  R.estado = _hay('cuadResumenValvOn') ? cuadResumenValvOn() : 'NO';
  R.caja = cas ? (() => { const q = cas.getBoundingClientRect();
    return Math.round(q.width) + 'x' + Math.round(q.height) })() : 'SIN CASILLA';
  /* Las TRES secciones y nada mas: ni «Otros» -que es el cuadro doce- ni la fila «EROA IT», cuyo
     campo NO existe, ni una sola columna de valores de referencia, que CUADROS retiro del papel. */
  const rv = () => { try { return _hay('cuadResumenValvDefs') ? cuadResumenValvDefs() : [] }
                     catch (e) { return [] } };
  R.defsN = rv().length;
  R.defsIds = rv().map(d => d.id).join('|');
  R.conRef = rv().reduce((a, d) => a + (d.items || []).filter(i => i && i.ref).length, 0);
  R.hayOtros = rv().some(d => String(d.titulo).toLowerCase() === 'otros');
  R.hayEroaIt = rv().some(d => (d.items || []).some(i => i && /EROA IT/.test(i.lbl || '')));
  /* EL PDF, GENERADO DE VERDAD, apagado y prendido. */
  const censoAntes = _censo();
  const a = _pdf();
  R.pdfApagado = { bytes: a.b ? a.b.length : 'SIN PDF',
    valv: _cont(a.b, 'lvula Mitral') + _cont(a.b, 'lvula Tric'),
    /* DENOMINADOR: los doce cuadros SI estan. Sin esto, cero filas de valvula sobre un PDF sin
       cuadros se lee igual que cero filas de valvula sobre un PDF completo. */
    gasto: _cont(a.b, 'Gasto card') };
  /* Se prende POR EL GESTO REAL -- un clic en la casilla -- y no llamando a la funcion. */
  if (cas) cas.click();
  R.trasClic = { casilla: cas ? cas.checked : 'SIN CASILLA',
                 estado: _hay('cuadResumenValvOn') ? cuadResumenValvOn() : 'NO' };
  const b2 = _pdf();
  R.pdfPrendido = { bytes: b2.b ? b2.b.length : 'SIN PDF',
    vm: _cont(b2.b, 'lvula Mitral'), vt: _cont(b2.b, 'lvula Tric'),
    gasto: _cont(b2.b, 'Gasto card') };
  R.censoIgual = (_censo() === censoAntes);
  /* «Tipo Word» LO IGNORA: con el interruptor prendido su PDF es IDENTICO al de con el apagado. */
  try { if (_hay('setPdfPlantilla')) setPdfPlantilla('tipoword'); } catch (e) {}
  const w1 = _pdf();
  try { if (_hay('cuadResumenValvToggle')) cuadResumenValvToggle(false); } catch (e) {}
  const w0 = _pdf();
  R.wordIgnora = (w1.b && w0.b) ? (w1.b.length === w0.b.length) : 'SIN PDF';
  R.wordBytes = (w1.b ? w1.b.length : '?') + ' / ' + (w0.b ? w0.b.length : '?');
  try { if (_hay('setPdfPlantilla')) setPdfPlantilla('clasico'); } catch (e) {}
  /* SOBREVIVE a «Restablecer» y a «Nuevo estudio»: vale para todos los estudios hasta cerrar la
     app. No va a localStorage ni al guardado del estudio. */
  try { if (_hay('cuadResumenValvToggle')) cuadResumenValvToggle(true); } catch (e) {}
  try { if (_hay('cuadRestablecer')) cuadRestablecer(); } catch (e) {}
  R.trasRestablecer = _hay('cuadResumenValvOn') ? cuadResumenValvOn() : 'NO';
  __t.limpiar();
  R.trasNuevoEstudio = _hay('cuadResumenValvOn') ? cuadResumenValvOn() : 'NO';
  R.enDisco = (() => { try { return Object.keys(localStorage)
    .filter(k => /resumen|rvalv|cuadResumen/i.test(k)).join(',') || 'ninguna' }
    catch (e) { return 'ERR' } })();
  try { if (_hay('cuadResumenValvToggle')) cuadResumenValvToggle(false); } catch (e) {}
  try { if (_hay('cuadCerrar')) cuadCerrar(); } catch (e) {}

  return { extra: [
    ['(A1) el interruptor existe en la tarjeta', R.existe === true, String(R.existe)],
    ['(A2) y viene APAGADO de fabrica', R.apagado === true && R.estado === false,
      String(R.apagado) + ' / ' + String(R.estado)],
    ['(A3) su casilla NO lleva id, asi que no entra al censo del estudio ni al Excel',
      R.sinId === true, String(R.sinId)],
    ['(A4) y se toca en 44 px', R.caja === '44x44', R.caja],
    ['(B1) son TRES secciones de valvula', R.defsN === 3 && R.defsIds === 'rv_vm|rv_va|rv_vt',
      R.defsN + ' / ' + R.defsIds],
    ['(B2) sin una sola columna de valores de referencia', R.conRef === 0, String(R.conRef)],
    ['(B3) sin la seccion «Otros», que es el cuadro doce', R.hayOtros === false, String(R.hayOtros)],
    ['(B4) y sin la fila «EROA IT», cuyo campo no existe', R.hayEroaIt === false, String(R.hayEroaIt)],
    ['(C0) DENOMINADOR: apagado, el PDF trae los doce cuadros', R.pdfApagado.gasto === 1,
      String(R.pdfApagado.gasto)],
    ['(C1) y NI UNA fila de valvula', R.pdfApagado.valv === 0, String(R.pdfApagado.valv)],
    ['(C2) el clic en la casilla lo prende', R.trasClic.casilla === true && R.trasClic.estado === true,
      String(R.trasClic.casilla) + ' / ' + String(R.trasClic.estado)],
    ['(C3) y entonces el PDF saca la mitral y la tricuspide, sin perder los doce cuadros',
      R.pdfPrendido.vm === 1 && R.pdfPrendido.vt === 1 && R.pdfPrendido.gasto === 1,
      JSON.stringify(R.pdfPrendido)],
    ['(C4) el PDF crece, que es el denominador de que algo se dibujo',
      R.pdfPrendido.bytes > R.pdfApagado.bytes, R.pdfApagado.bytes + ' -> ' + R.pdfPrendido.bytes],
    ['(C5) y no escribio un solo campo: el censo de controles con id es identico',
      R.censoIgual === true, String(R.censoIgual)],
    ['(D1) el estilo «Tipo Word» lo IGNORA: su PDF es identico prendido y apagado',
      R.wordIgnora === true, R.wordBytes],
    ['(E1) sobrevive a «Restablecer», que restablece el ORDEN y los quitados',
      R.trasRestablecer === true, String(R.trasRestablecer)],
    ['(E2) y a «Nuevo estudio»: vale para todos los estudios hasta cerrar la app',
      R.trasNuevoEstudio === true, String(R.trasNuevoEstudio)],
    ['(E3) y NO se guarda en el navegador', R.enDisco === 'ninguna', R.enDisco]
  ] };
""")
print('cuatro casos definidos')

caso('TC-1039',
 'PR6 (TAREA 4): el noveno estilo «Tipo Word» esta registrado en el catalogo, en el selector de Config y en el despachador; su PDF trae el texto como TEXTO REAL -- cero imagenes, una linea por renglon -- en lugar de los doce cuadros, y conserva el informe, el EN SUMA y el encabezado',
 PRELUDIO + """
  const R = {};
  /* (A) REGISTRADO EN LAS TRES LISTAS QUE LO CONSUMEN. El catalogo es la unica fuente de verdad de
     que ids son validos -lo usan el selector y el despachador-, asi que con dos listas un id
     agregado en un lado dibujaria el encabezado clasico sin que nada lo avisara. */
  R.catN = (typeof PDF_PLANTILLAS !== 'undefined') ? PDF_PLANTILLAS.length : -1;
  R.catIds = (typeof PDF_PLANTILLAS !== 'undefined') ? PDF_PLANTILLAS.map(p => p.id).join(',') : 'NO';
  R.nom = (typeof PDF_PLANTILLAS !== 'undefined')
    ? ((PDF_PLANTILLAS.filter(p => p.id === 'tipoword')[0] || {}).nom || 'NO') : 'NO';
  R.miniatura = (typeof _PLTZ_SVG !== 'undefined') ? !!_PLTZ_SVG.tipoword : false;
  R.seElige = (() => { try { setPdfPlantilla('tipoword');
    return (_hay('pdfPlantillaGet') ? pdfPlantillaGet() : '?') === 'tipoword' } catch (e) { return false } })();
  try { if (_hay('showTab')) { const b = document.querySelector('[onclick*="config"]'); if (b) b.click(); } } catch (e) {}
  try { if (_hay('cfgOnShow')) cfgOnShow(); } catch (e) {}
  R.selN = document.querySelectorAll('#pltz-grid [data-pltz]').length;
  R.selTieneWord = !!document.querySelector('#pltz-grid [data-pltz="tipoword"]');

  __t.limpiar();""" + SIEMBRA_EA_IM + """
  try { if (_hay('generarInforme')) generarInforme(); } catch (e) {}
  try { const t = document.getElementById('en_suma');
    if (t && !t.value.trim()) { t.value = 'Estenosis aortica severa.';
      t.dispatchEvent(new Event('input', { bubbles: true })); } } catch (e) {}

  /* Los renglones DIBUJADOS, extraidos de los operadores Tj del PDF sin comprimir: es la unica
     forma de afirmar «una linea por renglon» y no «el texto esta en algun lado». */
  const _reng = b => { if (!b) return [];
    const out = []; const re = /\\(((?:\\\\.|[^\\\\()])*)\\)\\s*Tj/g; let m;
    while ((m = re.exec(b)) !== null) out.push(m[1].replace(/\\\\([()\\\\])/g, '$1'));
    return out; };
  const _medir = est => { try { if (_hay('setPdfPlantilla')) setPdfPlantilla(est) } catch (e) {}
    const r = _pdf(); const rg = _reng(r.b);
    return { bytes: r.b ? r.b.length : 'SIN PDF', imgs: r.imgs,
      gasto: _cont(r.b, 'Gasto card'), informe: _cont(r.b, 'Pruebas'), suma: _cont(r.b, 'EN SUMA'),
      lineas: rg.filter(t => /^(SV: |AP: |SIV: |FEVI: |TAP: |onda E: |V\\.Max|THP: )/.test(t)).length,
      muestra: rg.filter(t => /^(SV: |onda E: )/.test(t)).slice(0, 2).join(' // ') }; };
  R.clasico = _medir('clasico');
  R.word = _medir('tipoword');
  try { if (_hay('setPdfPlantilla')) setPdfPlantilla('clasico') } catch (e) {}

  return { extra: [
    ['(A1) el catalogo tiene NUEVE plantillas', R.catN === 9, R.catN + ': ' + R.catIds],
    ['(A2) la novena se llama «Tipo Word»', R.nom === 'Tipo Word', R.nom],
    ['(A3) tiene su miniatura en el selector', R.miniatura === true, String(R.miniatura)],
    ['(A4) el despachador la acepta', R.seElige === true, String(R.seElige)],
    ['(A5) y el selector de Config la ofrece: nueve botones, uno de ellos el suyo',
      R.selN === 9 && R.selTieneWord === true, R.selN + ' / ' + String(R.selTieneWord)],
    ['(B0) DENOMINADOR: con el estilo clasico el PDF trae los doce cuadros y ninguna linea de texto',
      R.clasico.gasto === 1 && R.clasico.lineas === 0, JSON.stringify(R.clasico)],
    ['(B1) con «Tipo Word» NO sale el cuadro del gasto: los cuadros se reemplazan',
      R.word.gasto === 0, String(R.word.gasto)],
    ['(B2) y en su lugar salen las lineas del texto, una por renglon', R.word.lineas >= 8,
      R.word.lineas + ' >>> ' + R.word.muestra],
    ['(B3) es TEXTO REAL y no una imagen: cero llamadas a addImage', R.word.imgs === 0, String(R.word.imgs)],
    ['(B4) cada renglon es su propio texto dibujado, no un parrafo envuelto',
      /^SV: /.test(R.word.muestra), R.word.muestra.slice(0, 120)],
    ['(B5) conserva el informe', R.word.informe >= 1, String(R.word.informe)],
    ['(B6) y el EN SUMA', R.word.suma >= 1, String(R.word.suma)]
  ] };
""")

caso('TC-1040',
 'PR6 (TAREA 5): los CUATRO contenidos estan en la Evidencia de estenosis aortica con su guia, su hoja y su folio, sin comparar dos fuentes ni decir que algo falta; y la frase del tracto de salida ya NO sale en el informe, el EN SUMA ni el PDF, que siguen describiendo la discordancia entera',
 PRELUDIO + """
  const R = {};
  const FR = 'Revisar el di' + String.fromCharCode(225) + 'metro del tracto de salida';
  /* (A) LA EVIDENCIA, en SU escena: la seccion NO ABRE con un area que no es severa ni moderada,
     asi que con la escena de la discordancia de grado devolvia null y «no abre» se lee igual que
     «las notas no estan». */
  __t.limpiar();""" + SIEMBRA_EA_IM + """
  const ev = (() => { try { return (typeof _indEA === 'function') ? _indEA() : null }
                      catch (e) { return null } })();
  R.abre = !!ev;
  const notas = ev ? (ev.notas || []).map(n => (typeof n === 'string') ? { txt:n, refs:null } : n) : [];
  const U = notas.map(n => n.txt).join(' @@ ');
  R.notasN = notas.length;
  R.conRefs = notas.filter(n => n.refs && n.refs.length).length;
  R.c1 = U.indexOf('paradojal') >= 0 && U.indexOf('score de calcio') >= 0 && U.indexOf('e90') >= 0;
  R.c2 = U.indexOf('errores de medici') >= 0 && U.indexOf('4670') >= 0;
  R.c3 = U.indexOf('sin bajo flujo') >= 0 && U.indexOf('varias ventanas') >= 0;
  R.c4 = U.indexOf('no coincide con las mediciones') >= 0 && U.indexOf('4663') >= 0;
  R.folios = ['e90', 'e92', '4663', '4664', '4666', '4670'].filter(f => U.indexOf(f) < 0).join(',');
  /* LA REGLA FIJA DEL 2026-11-04: ningun texto compara dos fuentes ni dice que algo no se
     encontro. Cada una se cita por lo que ELLA dice, en su propia oracion. */
  R.compara = ['no coinciden', 'difieren', 'discrepan', 'se contradicen', 'no se encontr',
               'ninguna gu', 'a diferencia de', 'mientras la gu', 'sin resolver']
    .filter(f => U.toLowerCase().indexOf(f.toLowerCase()) >= 0).join(',');
  /* Y las dos entradas de bibliografia ganaron los folios de la aortica, sin perder los mitrales. */
  R.biblio = (() => { try { if (typeof IND_REFS === 'undefined') return 'NO';
    const f = (IND_REFS.filter(x => x.k === 'ahaVc2020')[0] || {}).full || '';
    return (f.indexOf('e90') >= 0 && f.indexOf('e92') >= 0 && f.indexOf('e121') >= 0)
      ? 'ok' : 'falta: ' + f.slice(-120); } catch (e) { return 'ERR' } })();

  /* (B) LA FRASE, en la escena que de verdad monta la discordancia: grado consignado «moderada»
     contra mediciones SEVERAS. Al reves -grado severo con mediciones leves- el sincronizador de
     severidad le gana al select y el escenario vuelve sin discordancia. */
  __t.limpiar();
  [['nombre','Disc'],['edad','70'],['sexo','M'],['peso','80'],['talla','172'],
   ['diam_tsvi','20'],['itv_tsvi','18'],['itv_ao','71'],
   ['vmax_ao','4.6'],['gmedio_ao','55'],['fevi','60'],['va_morf','Calcificada'],
   ['ea_grado','moderada']
  ].forEach(p => __t.set(p[0], p[1]));
  R.disc = (() => { try { const e = eaEscenario();
    return e ? (e.grado + '/' + e.esperado + '/' + !!e.discordanciaGrado) : 'SIN ESCENARIO';
  } catch (e) { return 'ERR' } })();
  const r = __t.informe();
  const inf = String(r.texto || ''), sm = String(r.suma || '');
  R.lineaDisc = inf.split(String.fromCharCode(10))
    .filter(l => l.indexOf('no coincide con las mediciones') >= 0)[0] || '';
  R.enInforme = inf.indexOf(FR) >= 0;
  R.enSuma = sm.indexOf(FR) >= 0;
  R.describe = R.lineaDisc.indexOf('(moderada)') >= 0 && R.lineaDisc.indexOf('AVA') >= 0
    && R.lineaDisc.indexOf('severa') >= 0;
  const p = _pdf();
  R.enPdf = p.b ? (p.b.indexOf('metro del tracto de salida') >= 0) : 'SIN PDF';
  R.pdfDescribe = p.b ? (p.b.indexOf('no coincide con las mediciones') >= 0) : 'SIN PDF';

  return { extra: [
    ['(A0) DENOMINADOR: la Evidencia de estenosis aortica ABRE', R.abre === true, String(R.abre)],
    ['(A1) cuatro de sus notas citan una fuente', R.conRefs === 4, R.conRefs + ' de ' + R.notasN],
    ['(A2) el score de calcio por TAC en la rama PARADOJAL, con su folio', R.c1 === true, String(R.c1)],
    ['(A3) la medicion del tracto de salida como causa de gradiente bajo, con su folio', R.c2 === true, String(R.c2)],
    ['(A4) el repaso de las integrales con FEVI reducida SIN bajo flujo', R.c3 === true, String(R.c3)],
    ['(A5) y la discordancia de grado, con su folio', R.c4 === true, String(R.c4)],
    ['(A6) los seis folios estan', R.folios === '', R.folios],
    ['(A7) y NINGUN texto compara dos fuentes ni dice que algo no se encontro', R.compara === '', R.compara],
    ['(A8) la bibliografia gano los folios de la aortica sin perder los mitrales', R.biblio === 'ok', R.biblio],
    ['(B0) DENOMINADOR: la escena monta una discordancia de grado de verdad',
      R.disc === 'moderada/severa/true', R.disc],
    ['(B1) la frase del tracto de salida ya NO sale en el informe', R.enInforme === false, R.lineaDisc.slice(0, 220)],
    ['(B2) ni en el EN SUMA', R.enSuma === false, sm.slice(0, 200)],
    ['(B3) ni en el PDF', R.enPdf === false, String(R.enPdf)],
    ['(B4) y el informe sigue describiendo la discordancia con sus numeros y el grado que corresponderia',
      R.describe === true, R.lineaDisc.slice(0, 220)],
    ['(B5) y el PDF tambien', R.pdfDescribe === true, String(R.pdfDescribe)]
  ] };
""")
print('seis casos definidos')

caso('TC-1041',
 'PR6 (TAREA 1, YA ESTABA HECHA): el orden de los cuadros se mueve arrastrando, se mantiene al abrir otro estudio y al limpiar, lo restablece el boton, LLEGA AL PDF, y cada cuadro se adapta al tamanio de su fila sin estirar a los demas',
 PRELUDIO + """
  const R = {};
  /* ⚠️ ESTA TAREA YA ESTABA HECHA AL ABRIR LA TANDA -la hizo CUADROS el 18/11 con eventos de
     puntero- y este caso NO la implementa: la FIJA ENTERA en un solo lugar, incluido lo que
     TC-939 y TC-941 no median -que el orden nuevo LLEGA AL PDF-. */
  __t.limpiar();""" + SIEMBRA_EA_IM + """
  try { if (_hay('cuadAbrir')) cuadAbrir(); } catch (e) {}
  R.deFabrica = (() => { try { return _hay('cuadOrdenVigente') ? cuadOrdenVigente().join(',') : 'NO' }
                         catch (e) { return 'ERR' } })();
  /* (A) EL ARRASTRE, CON SU DENOMINADOR. La ventana del arnes mide 756x469, asi que a ese ancho la
     tarjeta pone pocos cuadros por fila y uno lejano cae debajo del pliegue, donde
     elementFromPoint devuelve null; por eso se arrastra sobre el cuadro SIGUIENTE y la funcion
     DEVUELVE lo que encontro debajo del puntero: sin eso, «no se movio» y «no habia nada debajo»
     se leen igual. */
  const _arr = (ia, ib) => {
    const cj = document.querySelectorAll('#cuad-grid > [data-cuad-id]');
    const a = cj[ia], b = cj[ib];
    if (!a || !b) return 'FALTAN CAJAS';
    const gr = a.querySelector('.cuad-grip');
    if (!gr) return 'SIN MANIJA';
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const pev = (t, x, y) => gr.dispatchEvent(new PointerEvent(t,
      { bubbles:true, cancelable:true, pointerId:1, clientX:x, clientY:y }));
    pev('pointerdown', ra.left + 6, ra.top + 6);
    const px = rb.right - 3, py = rb.bottom - 3;
    pev('pointermove', px, py);
    const over = document.elementFromPoint(px, py);
    pev('pointerup', px, py);
    return over ? ((over.closest && over.closest('[data-cuad-id]'))
      ? over.closest('[data-cuad-id]').getAttribute('data-cuad-id') : 'OTRO NODO') : 'NADA BAJO EL PUNTERO';
  };
  R.destino = _arr(0, 1);
  R.trasArrastrar = (() => { try { return cuadOrdenVigente().join(',') } catch (e) { return 'ERR' } })();
  R.semovio = R.trasArrastrar !== R.deFabrica;
  /* (B) SE MANTIENE al limpiar y al abrir otro estudio: NO hay gancho en limpiarCampos, y la
     ausencia de ese gancho ES la decision (correccion del medico del 18/11). */
  __t.limpiar();
  R.trasLimpiar = (() => { try { return cuadOrdenVigente().join(',') } catch (e) { return 'ERR' } })();
  /* (C) LLEGA AL PDF. Es lo que TC-939 y TC-941 no median del arrastre: se compara el ORDEN en que
     los titulos aparecen en los bytes del papel. */""" + SIEMBRA_EA_IM + """
  const _ordenEnPdf = () => { const r = _pdf(); if (!r.b) return 'SIN PDF';
    const B = r.b.toLowerCase();
    return [['ao', 'aorta tor'], ['ai', 'aur'], ['gc', 'gasto card']]
      .map(p => [p[0], B.indexOf(p[1])]).filter(p => p[1] >= 0)
      .sort((x, y) => x[1] - y[1]).map(p => p[0]).join(','); };
  R.pdfTrasArrastrar = _ordenEnPdf();
  /* (D) LO RESTABLECE EL BOTON. */
  const bot = document.getElementById('cuad-rest');
  R.hayBoton = !!bot;
  R.rotuloBoton = bot ? (bot.textContent || '').trim() : 'SIN BOTON';
  if (bot) bot.click();
  R.trasRestablecer = (() => { try { return cuadOrdenVigente().join(',') } catch (e) { return 'ERR' } })();
  R.pdfTrasRestablecer = _ordenEnPdf();
  /* (E) CADA CUADRO SE ADAPTA A SU FILA: el reparto de la grilla es el mismo en los dos lados, y un
     cuadro ancho NO estira a los demas -se lo lleva su propia fila-. */
  R.filas = (() => { try { if (!_hay('cuadFilas')) return 'NO';
    return [12, 11, 10, 7, 4, 2, 1].map(n => n + '=' + cuadFilas(n).join('+')).join(' ') }
    catch (e) { return 'ERR' } })();
  R.filasPedido = '12=3+3+3+3 11=3+3+3+2 10=3+3+2+2 7=3+2+2 4=2+2 2=2 1=1';
  /* Y en la tarjeta, el span por cuadro sobre una grilla de SEIS columnas: con tres no hay forma
     de partir una fila en mitades. */
  R.spans = (() => { try { if (!_hay('_cuadSpans')) return 'NO';
    return [3, 2, 1].map(n => n + '=' + _cuadSpans(n).join('+')).join(' ') } catch (e) { return 'ERR' } })();
  try { if (_hay('cuadCerrar')) cuadCerrar(); } catch (e) {}

  return { extra: [
    ['(A0) DENOMINADOR: el arrastre encontro el cuadro de destino debajo del puntero',
      R.destino !== 'NADA BAJO EL PUNTERO' && R.destino !== 'FALTAN CAJAS' && R.destino !== 'SIN MANIJA',
      String(R.destino)],
    ['(A1) arrastrar el primer cuadro sobre el siguiente cambia el orden', R.semovio === true,
      R.deFabrica + ' -> ' + R.trasArrastrar],
    ['(B1) el orden SOBREVIVE a «Nuevo estudio»: vale para todos los estudios',
      R.trasLimpiar === R.trasArrastrar, R.trasLimpiar],
    ['(C1) y LLEGA AL PDF: los cuadros salen en el orden nuevo',
      R.pdfTrasArrastrar !== 'SIN PDF' && R.pdfTrasArrastrar.indexOf('ai,ao') === 0,
      String(R.pdfTrasArrastrar)],
    ['(D1) el boton de restablecer existe', R.hayBoton === true, R.rotuloBoton],
    ['(D2) y devuelve el orden de fabrica', R.trasRestablecer === R.deFabrica,
      R.trasRestablecer + ' vs ' + R.deFabrica],
    ['(D3) tambien en el PDF', R.pdfTrasRestablecer.indexOf('ao,ai') === 0, String(R.pdfTrasRestablecer)],
    ['(E1) el reparto de filas es el de los siete ejemplos del medico',
      R.filas === R.filasPedido, R.filas],
    ['(E2) y en la tarjeta un cuadro solo se lleva su fila entera sin estirar a los demas',
      R.spans === '3=2+2+2 2=3+3 1=6', R.spans]
  ] };
""")

# ── inserción, con el guardián ────────────────────────────────────────────────
def main():
    s = open(P, encoding='utf-8').read()
    ag0 = len(re.findall(r'(?<!\\)' + AG, s))
    if ("caso('TC-1035'" in s):
        print('ABORTA: TC-1035 ya esta en el archivo'); return 1
    bloque = '\n'
    for nom, tit, cuerpo in CASOS:
        if AG in cuerpo:
            print('ABORTA: el cuerpo de %s tiene un acento grave' % nom); return 1
        bloque += ("\ncaso('%s',\n '%s',\n%s%s%s);\n"
                   % (nom, tit.replace("'", "\\'"), AG, cuerpo, AG))
    s2 = s.rstrip('\n') + '\n' + bloque
    ag1 = len(re.findall(r'(?<!\\)' + AG, s2))
    esperado = 2 * len(CASOS)
    if ag1 - ag0 != esperado:
        print('ABORTA: delta de acentos graves %d, se esperaban %d' % (ag1 - ag0, esperado)); return 1
    shutil.copy2(P, P + '.pr6bak')
    open(P, 'w', encoding='utf-8').write(s2)
    r = subprocess.run(['node', '--check', P], capture_output=True, text=True)
    if r.returncode != 0:
        shutil.copy2(P + '.pr6bak', P)
        print('ABORTA: no parsea. Revertido.\n' + r.stderr[:500]); return 1
    print('OK: %d casos insertados, delta de acentos graves %d' % (len(CASOS), ag1 - ag0))
    return 0

if __name__ == '__main__':
    sys.exit(main())
