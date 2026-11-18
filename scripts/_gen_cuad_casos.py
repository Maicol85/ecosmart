# -*- coding: utf-8 -*-
"""Generador de los casos de la tanda CUADROS (18/11/2026).

Los cuerpos se escriben ACA y se insertan en scripts/test_clinico.mjs, por dos motivos medidos:
  1. EL ACENTO GRAVE. El cuerpo de un caso es un template literal; uno adentro cierra la cadena, y
     lo peor que puede pasar es que lo que queda SIGA siendo JS valido: ahi `node --check` pasa y
     el caso se registra con un cuerpo que no es una cadena -- lo que PANT-31 pago con TC-798.
     Este generador ASEGURA que ningun cuerpo tenga uno, y tampoco la secuencia de interpolacion.
  2. La siembra es la MISMA en los dieciseis casos y vive una sola vez.
"""
import io, sys

SEED = """
  __t.limpiar();
  /* El overlay de login tapa la pagina entera y elementFromPoint devuelve login-overlay en todos
     los puntos: la trampa que TC-395 documenta con sus tres denominadores. */
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  [['nombre','Zoraida Pruebas'],['fecha','2026-11-18'],['edad','64'],['sexo','M'],['peso','78'],['talla','172'],
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
   ['pericardio','Derrame leve (<10mm)'],['otras_notas','Sin masas'],
   ['pua_lineasb','focales'],['pua_derrame','si'],['pua_derrame_lado','bilateral']
  ].forEach(function (p) { __t.set(p[0], p[1]); });
  __t.chk('im_pdf_cont', true);
  __t.chk('otr_var_chiari', true);
"""

AYUDA = """
  /* ⚠️ TODO ACCESO VA POR UN AYUDANTE CON GUARDA y devuelve una forma vacia. Contra el arbol
     anterior ninguna de estas funciones existe, y un acceso pelado tira ReferenceError que se
     lleva el caso ENTERO: la condicion «sin excepciones» sale roja y las de abajo no llegan a
     evaluarse. Es exactamente lo que TC-827 tuvo que deshacer en PANT-37. */
  const _hay = n => { try { return typeof window[n] === 'function' } catch (e) { return false } };
  const _defs = () => { try { return _hay('cuadDefs') ? cuadDefs() : [] } catch (e) { return [] } };
  const _uno = id => _defs().filter(d => d.id === id)[0] || null;
  const _vals = d => (d ? (d.items || []).concat(d.items2 || []) : [])
      .filter(i => i && i.val != null && String(i.val).trim() !== '');
  const _rot = d => _vals(d).map(i => i.lbl).join('|');
  const _lin = d => (d && d.lineas ? d.lineas : []).map(l => l.txt).join(' /// ');
  const _todo = () => _defs().map(d => _rot(d)).join('|');
  /* ⚠️ ESCRIBIR SIN DISPARAR EVENTOS. ia_grado es un input OCULTO cuyo onchange llama a
     sincronizarGradoIA, que lo vuelve a derivar de la vena contracta y del THP: con __t.set
     -- que dispara input y change -- el 4 se pisa solo y este caso medía sobre un motivo que no
     existe. Medido: salia 3. */
  const _mudo = (id, val) => { const e = document.getElementById(id); if (e) e.value = String(val); };
  /* ⚠️ EL ARRASTRE, CON SU DENOMINADOR. Dos trampas medidas: la ventana del arnes mide 756x469,
     asi que a ese ancho la tarjeta pone UN cuadro por fila y el tercero cae abajo del pliegue --
     donde elementFromPoint devuelve null--; y el overlay de login tapa la pagina entera. Por eso
     se arrastra sobre el cuadro SIGUIENTE y la funcion DEVUELVE que encontro debajo del puntero:
     sin eso, «no se movio» y «no habia nada debajo» se leen igual. Se suelta en la esquina lejana
     -- derecha y abajo -- para que el destino sea «despues» con los dos ejes, en una fila o
     apilado. */
  const _arrastrar = (ia, ib) => {
    const cj = document.querySelectorAll('#cuad-grid > [data-cuad-id]');
    const a = cj[ia], b = cj[ib];
    if (!a || !b) return 'FALTAN CAJAS';
    const gr = a.querySelector('.cuad-grip');
    if (!gr) return 'SIN MANIJA';
    const rb = b.getBoundingClientRect();
    const px = rb.left + rb.width - 6, py = rb.top + rb.height - 6;
    const el = document.elementFromPoint(px, py);
    const over = (el && el.closest) ? el.closest('#cuad-grid > [data-cuad-id]') : null;
    const rg = gr.getBoundingClientRect();
    const pev = (t, x, y) => { let e;
      try { e = new PointerEvent(t, { bubbles:true, cancelable:true, pointerId:1, pointerType:'touch', clientX:x, clientY:y }) }
      catch (err) { e = new MouseEvent(t, { bubbles:true, cancelable:true, clientX:x, clientY:y }) }
      gr.dispatchEvent(e); };
    pev('pointerdown', rg.left + 4, rg.top + 4);
    pev('pointermove', px, py);
    pev('pointerup', px, py);
    return over ? over.getAttribute('data-cuad-id') : 'NADA BAJO EL PUNTERO';
  };
"""

PDF = """
  /* ⚠️ EL PDF SE GENERA DE VERDAD Y SE LEEN SUS BYTES. Se envuelve el CONSTRUCTOR y no el
     prototipo: jsPDF 2.5.1 DEVUELVE UN OBJETO PROPIO desde su constructor y le copia los metodos
     de jsPDF.API uno por uno, asi que jsPDF.prototype.save no es el save que el documento usa --
     medido: con el prototipo parcheado la captura daba null sobre un PDF que SI se habia generado.
     Y el documento sale SIN comprimir, asi que el texto dibujado aparece literal en los bytes: por
     eso alcanza con buscar un fragmento ASCII del titulo de un cuadro. Los fragmentos son ASCII a
     proposito -- el PDF va en WinAnsi y un acento no sobrevive a la comparacion. */
  const _pdfBytes = () => {
    let cap = null;
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return null;
    window.jspdf.jsPDF = function (o) {
      const d = new J(o);
      d.save = function () { try { cap = this.output('datauristring') } catch (e) {} return this };
      return d;
    };
    try { _pdfAjustarA4(); } catch (e) {}
    window.jspdf.jsPDF = J;
    if (!cap) return null;
    try { return atob(String(cap).split(',')[1]) } catch (e) { return null }
  };
  /* ⚠️ LA BUSQUEDA ES INSENSIBLE A MAYUSCULAS, Y NO ES PEREZA: dos de las ocho plantillas
     -- minimalista y compacto -- declaran hdrUpper, asi que el titulo del cuadro sale
     «GASTO CARDIACO» en el papel. Medido: con la comparacion sensible esos dos estilos daban
     «falta el cuadro del gasto» sobre un PDF que lo tenia. */
  const _cont = (b, t) => { if (!b) return -1;
    const B = String(b).toUpperCase(), T = String(t).toUpperCase();
    let n = 0, i = B.indexOf(T);
    while (i >= 0) { n++; i = B.indexOf(T, i + 1) } return n };
"""

CASOS = []
def caso(cid, titulo, cuerpo):
    CASOS.append((cid, titulo, cuerpo))

# ══════════════════════════ A — EL PAPEL ══════════════════════════
caso('TC-928',
 'CUADROS (A): los DOCE cuadros de datos en el orden de arranque, con sus titulos, de a TRES por fila -- cuadDefs es el dueno unico que leen el papel y la tarjeta, y el orden de fabrica es una constante y no se deriva del titulo',
 SEED + AYUDA + """
  const R = {};
  try {
    R.ids = _defs().map(d => d.id).join(',');
    R.n = _defs().length;
    R.vis = _hay('cuadVisibles') ? cuadVisibles().map(d => d.id).join(',') : null;
    R.filas12 = _hay('cuadFilas') ? cuadFilas(12).join('-') : null;
    R.base = (function () { try { return CUAD_IDS.join(',') } catch (e) { return null } })();
    /* Los titulos se comparan por un fragmento ASCII: el PDF va en WinAnsi y los acentos no
       sobreviven, asi que esta casa compara lo que de verdad se puede comparar en las dos
       superficies. */
    const FRAG = [['ao','Aorta tor'],['ai','cula izquierda'],['advci','cula derecha / VCI'],
                  ['viest','Estructura'],['visis','n sist'],['vd','culo derecho'],
                  ['vm','Transmitral / Vena pulmonar'],['dti','DTI mitral'],
                  ['trip','spide / Pulmonar'],['va','Gradientes y continuidad'],
                  ['gc','Gasto card'],['otros','Otros']];
    R.tit = FRAG.filter(f => { const d = _uno(f[0]); return !d || String(d.titulo).indexOf(f[1]) < 0; })
                .map(f => f[0]).join(',');
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['hay DOCE cuadros', R.n === 12, String(R.n)],
    ['en el orden de arranque del medico',
       R.ids === 'ao,ai,advci,viest,visis,vd,vm,dti,trip,va,gc,otros', R.ids],
    ['y la constante del orden de fabrica dice lo mismo', R.base === R.ids, R.base],
    ['los doce titulos son los pedidos', R.tit === '', R.tit],
    ['con el estudio sembrado los doce tienen datos y salen', R.vis === R.ids, R.vis],
    ['y se reparten de a TRES por fila', R.filas12 === '3-3-3-3', R.filas12]
  ] };
""")

caso('TC-929',
 'CUADROS (A): el cuadro de la AORTA publica sus segmentos con un asterisco en los dilatados y el pie «* Aorta dilatada» solo si corresponde, y el O TSVI vive SOLO ahi -- sale del cuadro de continuidad, que publica el DVI en su lugar',
 SEED + AYUDA + """
  const R = {};
  try {
    const ao = _uno('ao');
    R.rot = _rot(ao);
    R.vals = _vals(ao).map(i => String(i.val)).join('|');
    R.nota = ao ? (ao.nota || null) : null;
    R.ast = _vals(ao).filter(i => String(i.val).indexOf('*') > -1).map(i => i.lbl).join(',');
    /* ⚠️ EL DIAMETRO DEL TSVI SE BUSCA POR SU ROTULO EXACTO y no por «contiene TSVI»: «VTI TSVI»
       es la integral velocidad-tiempo del tracto, OTRA medicion, y con el predicado laxo el cuadro
       de continuidad contaba como si publicara el diametro. */
    const _ROT_TSVI = String.fromCharCode(216) + ' TSVI';
    R.cuantos = _defs().filter(d => _vals(d).some(i => i.lbl === _ROT_TSVI)).map(d => d.id).join(',');
    const va = _uno('va');
    R.vaRot = _rot(va);
    R.vaDvi = _vals(va).filter(i => i.lbl === 'DVI').map(i => String(i.val))[0] || null;
    /* Sin ninguna dilatacion no hay pie: su ausencia no puede ser decorativa. */
    __t.set('ao_sin', '30'); __t.set('ao_tub', '30'); __t.set('diam_cayado', '30');
    __t.set('diam_ao_toracica', '26'); __t.set('ao_st', '28');
    const ao2 = _uno('ao');
    R.nota2 = ao2 ? (ao2.nota || null) : null;
    R.ast2 = _vals(ao2).filter(i => String(i.val).indexOf('*') > -1).length;
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['el cuadro lista los CINCO segmentos y el O TSVI',
       R.rot === 'SV|ST|Ao asc|Cayado|Ao desc|' + String.fromCharCode(216) + ' TSVI', R.rot],
    ['los dilatados llevan asterisco y los normales no', R.ast === 'SV,Ao asc', R.ast],
    ['y el pie lo explica', R.nota === '* Aorta dilatada', String(R.nota)],
    ['sin ninguna dilatacion el pie NO sale', R.nota2 === null, String(R.nota2)],
    ['ni queda un asterisco suelto', R.ast2 === 0, String(R.ast2)],
    ['el O TSVI vive en UN solo cuadro, el de la aorta', R.cuantos === 'ao', R.cuantos],
    ['y el de continuidad publica el DVI en su lugar',
       R.vaRot === 'V. m' + String.fromCharCode(225) + 'x Ao|G. m' + String.fromCharCode(225) + 'x|G. medio|VTI TSVI|VTI Vao|DVI', R.vaRot],
    ['con su valor', R.vaDvi === '0.19', String(R.vaDvi)]
  ] };
""")

caso('TC-930',
 'CUADROS (A): VI-Estructura publica el VDFVI indexado y el VD sus siete filas pedidas mas la FEVD y la relacion VD/VI -- que son numeros MEDIDOS y no se retiran del papel, declarado',
 SEED + AYUDA + """
  const R = {};
  try {
    R.viest = _rot(_uno('viest'));
    R.vdfvi = _vals(_uno('viest')).filter(i => i.lbl === 'VDFVI idx').map(i => String(i.val))[0] || null;
    R.vd = _rot(_uno('vd'));
    R.visis = _rot(_uno('visis'));
    /* El indexado se calcula con la superficie corporal del dueno unico y no se rehace aca. */
    __t.set('peso', ''); __t.set('talla', '');
    R.sinBsa = _vals(_uno('viest')).filter(i => i.lbl === 'VDFVI idx').length;
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  const _A = String.fromCharCode(225);
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['VI-Estructura lista sus seis filas con el VDFVI indexado',
       R.viest === 'SIV|DDVI|DSVI|PP|VDFVI idx|VSFVI idx', R.viest],
    ['y el VDFVI indexado trae su valor', R.vdfvi === '72.5 ml/m' + String.fromCharCode(178), String(R.vdfvi)],
    ['sin superficie corporal la fila no se publica', R.sinBsa === 0, String(R.sinBsa)],
    ['el VD lista TAP, TAPSE, S-prima, los tres diametros y la FAC',
       R.vd.indexOf('TAP|TAPSE|S' + String.fromCharCode(39) + '|Di' + _A + 'm. basal|Di' + _A + 'm. medio|Longitud|FAC') === 0, R.vd],
    ['y conserva la FEVD y la relacion VD/VI, que son numeros medidos',
       R.vd === 'TAP|TAPSE|S' + String.fromCharCode(39) + '|Di' + _A + 'm. basal|Di' + _A + 'm. medio|Longitud|FAC|FEVD|VD/VI', R.vd],
    ['la funcion sistolica no se movio',
       R.visis === 'FEVI|FA|SGL|Vol. lat.|Masa idx|RWT|Geometria', R.visis]
  ] };
""")

caso('TC-931',
 'CUADROS (A): el cuadro VM va en DOS columnas -- transmitral a la izquierda y vena pulmonar a la derecha -- y el AVm por THP dice SOLO «no corresponde» con insuficiencia aortica severa, mientras el panel de pantalla conserva el texto largo',
 SEED + AYUDA + """
  const R = {};
  try {
    const vm = _uno('vm');
    R.izq = (vm ? (vm.items || []) : []).map(i => i.lbl).join('|');
    R.der = (vm ? (vm.items2 || []) : []).map(i => i.lbl).join('|');
    R.tit = vm ? vm.titulo : null;
    /* ⚠️ EL GRADO DE LA IAo SE REESCRIBE AL FINAL, Y NO ES UN ADORNO: calcIA_ESC lo deriva de
       la vena contracta y del THP en cada evento, asi que el 4 de la semilla lo pisa cualquier
       campo que se siembre despues. Medido: salia 3, y entonces este caso medir sobre un motivo
       que no existe -- un denominador vacio que se lee igual que «el arreglo no sirve». */
    _mudo('ia_grado', '4');
    /* Con la IAo severa cargada, el area por THP no corresponde. */
    /* ⚠️ SE VUELVE A PEDIR LA DEFINICION, y no es un detalle: cuadDefs devuelve un objeto NUEVO
       en cada llamada -- leer el de arriba daria el estado anterior al grado que se acaba de
       escribir, que es un caso verde sobre una medicion vieja. */
    R.avm = _vals(_uno('vm')).filter(i => i.lbl === 'AVm THP').map(i => String(i.val))[0] || null;
    R.iaG = String((document.getElementById('ia_grado') || {}).value || '');
    /* El DUENO del motivo no cambia, y el panel de pantalla sigue publicando el texto largo: lo
       que se acorta es SOLO la celda del papel. */
    R.motivo = (typeof emAvmThpPdfMotivo === 'function') ? emAvmThpPdfMotivo() : null;
    R.largo = (typeof EM_THP_IA_TXT !== 'undefined') ? EM_THP_IA_TXT : null;
    /* Sin IAo severa vuelve el numero. */
    __t.set('ia_grado', '1');
    R.avm2 = _vals(_uno('vm')).filter(i => i.lbl === 'AVm THP').map(i => String(i.val))[0] || null;
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['el titulo nombra las dos estructuras',
       String(R.tit).indexOf('Transmitral / Vena pulmonar') > -1, String(R.tit)],
    ['la columna izquierda es el Doppler transmitral',
       R.izq === 'Onda E|Onda A|E/A|TDE|TRIV|THP|AVm THP', R.izq],
    ['la derecha es la vena pulmonar',
       R.der === 'Dur. A mit.|S/D pulm.|Dur. Ar|Veloc. Ar|Ar-A', R.der],
    ['DENOMINADOR: la escena tiene insuficiencia aortica severa', R.iaG === '4', String(R.iaG)],
    ['y el AVm por THP dice SOLO «no corresponde»', R.avm === 'no corresponde', String(R.avm)],
    ['sin el texto largo', String(R.avm).indexOf('insuficiencia a') < 0, String(R.avm)],
    ['el dueno del motivo sigue siendo el de siempre y conserva su texto largo',
       R.motivo === R.largo && String(R.largo).indexOf('no v') > -1, String(R.motivo)],
    ['y sin IAo severa vuelve el numero', /^[0-9]/.test(String(R.avm2)), String(R.avm2)]
  ] };
""")

caso('TC-932',
 'CUADROS (A): el cuadro «Tricuspide / Pulmonar» va en DOS columnas con los dos rotulos en su titulo, y la valvula pulmonar deja de tener cuadro propio -- sus datos y las dos presiones derivadas de su insuficiencia viven en la columna derecha',
 SEED + AYUDA + """
  const R = {};
  try {
    const tp = _uno('trip');
    R.tit = tp ? tp.titulo : null;
    R.izq = (tp ? (tp.items || []) : []).map(i => i.lbl).join('|');
    R.der = (tp ? (tp.items2 || []) : []).map(i => i.lbl).join('|');
    /* Ningun OTRO cuadro de los doce publica un dato de la valvula pulmonar. */
    R.otros = _defs().filter(d => d.id !== 'trip')
      .filter(d => _vals(d).some(i => String(i.lbl).indexOf('VP') > -1
                                   || String(i.lbl).indexOf('(IP)') > -1)).map(d => d.id).join(',');
    R.vals = _vals(tp).map(i => i.lbl + '=' + i.val).join('|');
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  const _A = String.fromCharCode(225), _U = String.fromCharCode(250);
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['el titulo lleva los dos rotulos', R.tit === 'Tric' + _U + 'spide / Pulmonar', String(R.tit)],
    ['la columna izquierda es la tricuspide',
       R.izq === 'V. m' + _A + 'x IT|Grad. IT|PSAP|PAP media', R.izq],
    ['la derecha es la pulmonar, con las dos presiones de su insuficiencia',
       R.der === 'V. m' + _A + 'x VP|G. m' + _A + 'x VP|DVI VP|PAPm (IP)|PAPd (IP)', R.der],
    ['y ningun otro cuadro publica un dato de la pulmonar', R.otros === '', R.otros],
    ['con sus valores',
       R.vals.indexOf('V. m' + _A + 'x VP=1.1 m/s') > -1 && R.vals.indexOf('PAPm (IP)=24 mmHg') > -1, R.vals]
  ] };
""")

caso('TC-933',
 'CUADROS (A): el cuadro VA va en DOS columnas -- gradientes a la izquierda, continuidad con el DVI a la derecha -- y el cuadro del gasto cardiaco queda SIN el AVA y SIN el AVA indexado, que pasan a la linea de la estenosis aortica',
 SEED + AYUDA + """
  const R = {};
  try {
    const va = _uno('va'), gc = _uno('gc');
    R.vaTit = va ? va.titulo : null;
    R.izq = (va ? (va.items || []) : []).map(i => i.lbl).join('|');
    R.der = (va ? (va.items2 || []) : []).map(i => i.lbl).join('|');
    R.gc = _rot(gc);
    R.gcVals = _vals(gc).map(i => i.lbl + '=' + i.val).join('|');
    /* La FC va en la ranura ref y es la UNICA que queda en todo el papel. */
    R.gcRef = (gc ? (gc.items || []) : []).filter(i => i.lbl === 'GC').map(i => String(i.ref || ''))[0] || null;
    /* NINGUN cuadro publica el AVA: vive en la linea de la estenosis. */
    R.avaEnCuadro = _defs().filter(d => _vals(d).some(i => String(i.lbl).indexOf('AVA') === 0)).map(d => d.id).join(',');
    R.lineaEA = _lin(va);
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  const _A = String.fromCharCode(225), _O = String.fromCharCode(243);
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['el titulo nombra las dos mitades', R.vaTit === 'VA ' + String.fromCharCode(8212) + ' Gradientes y continuidad', String(R.vaTit)],
    ['la izquierda son los tres gradientes', R.izq === 'V. m' + _A + 'x Ao|G. m' + _A + 'x|G. medio', R.izq],
    ['la derecha es la continuidad con el DVI', R.der === 'VTI TSVI|VTI Vao|DVI', R.der],
    ['el gasto cardiaco queda con sus cuatro filas',
       R.gc === 'Vol. sist' + _O + 'l.|VLI|GC|IC', R.gc],
    ['SIN el AVA ni el AVA indexado', R.gc.indexOf('AVA') < 0, R.gc],
    ['y ningun otro cuadro los publica', R.avaEnCuadro === '', R.avaEnCuadro],
    ['el AVA y el indexado salen en la linea de la estenosis aortica',
       R.lineaEA.indexOf('AVA 0.66') > -1 && R.lineaEA.indexOf('AVAi 0.34') > -1, R.lineaEA],
    ['la fila del gasto dice con que frecuencia se calculo',
       R.gcRef === 'con FC de 72 lpm', String(R.gcRef)]
  ] };
""")

caso('TC-934',
 'CUADROS (A): el cuadro «Otros» queda en UNA sola linea con sus partes separadas por un punto medio -- pericardio, masas, pulmon y alteraciones anatomicas -- y NO repite nada de la aorta',
 SEED + AYUDA + """
  const R = {};
  try {
    const ot = _uno('otros');
    R.n = _vals(ot).length;
    R.lbl = _vals(ot).map(i => String(i.lbl)).join('|');
    R.txt = _vals(ot).map(i => String(i.val)).join('');
    R.partes = R.txt.split(' ' + String.fromCharCode(183) + ' ').length;
    /* La aorta NO vuelve a aparecer: hasta esta tanda este cuadro la resumia por segunda vez. */
    R.aorta = R.txt.indexOf('Aorta') > -1 || R.txt.indexOf('Valsalva') > -1 || R.txt.indexOf('Sinotub') > -1;
    /* Sin pulmon ni variantes la linea se acorta sola. */
    __t.set('pua_derrame', ''); __t.chk('otr_var_chiari', false);
    R.txt2 = _vals(_uno('otros')).map(i => String(i.val)).join('');
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['el cuadro tiene UNA sola celda', R.n === 1, String(R.n)],
    ['sin rotulo, porque el titulo del cuadro ya lo dice', R.lbl === '', R.lbl],
    ['con el pericardio, las masas, el pulmon y la variante anatomica',
       R.txt.indexOf('Derrame leve') === 0 && R.txt.indexOf('Sin masas') > -1
       && R.txt.indexOf('Derrame pleural bilateral') > -1 && R.txt.indexOf('Chiari') > -1, R.txt],
    ['separadas por un punto medio', R.partes === 4, R.txt],
    ['y NO repite nada de la aorta', R.aorta === false, R.txt],
    ['sin pulmon ni variantes la linea se acorta sola',
       R.txt2.indexOf('Chiari') < 0 && R.txt2.indexOf('pleural') < 0 && R.txt2.indexOf('Sin masas') > -1, R.txt2]
  ] };
""")

caso('TC-935',
 'CUADROS (A): se elimina del PDF la fila de cuadros de valvulas -- en los OCHO estilos, tambien en los que caia en una segunda hoja -- y TODOS los valores de referencia; queda UNA sola llamada al dibujante de tablas y una sola ref, la frecuencia del gasto',
 SEED + AYUDA + PDF + """
  const R = {};
  try {
    /* (1) NINGUN valor de referencia en ninguna celda de los doce cuadros. La unica ref que
       queda es la frecuencia cardiaca, que no es una referencia sino el insumo del gasto. */
    const refs = [];
    _defs().forEach(d => (d.items || []).concat(d.items2 || []).forEach(i => {
      if (i && i.ref != null && String(i.ref).trim() !== '') refs.push(d.id + ':' + i.ref);
    }));
    R.refs = refs.join(' | ');
    R.refsN = refs.length;
    R.refsCorte = refs.filter(x => /[<>]/.test(x) || x.indexOf(String.fromCharCode(8804)) > -1
                                                  || x.indexOf(String.fromCharCode(8805)) > -1).length;
    /* (2) UNA sola llamada al dibujante dentro del generador: un estilo que armara sus propios
       cuadros tendria la suya. En el arbol anterior habia CINCO. */
    const src = (typeof generarPDFReal === 'function') ? String(generarPDFReal) : '';
    /* Son DOS apariciones: la declaracion de la funcion y su UNICA llamada. En el arbol
       anterior eran SEIS -- la declaracion y los cinco literales. */
    R.llamadas = _cont(src, 'drawTablaCompacta(');
    /* (3) EL PDF DE VERDAD, EN LOS OCHO ESTILOS: ni un rastro de los cuatro cuadros de valvula. */
    const EST = ['clasico','moderno','minimalista','academico','compacto','elegante','bicolor','institucional'];
    const mal = [];
    EST.forEach(e => {
      try { if (typeof setPdfPlantilla === 'function') setPdfPlantilla(e); } catch (x) {}
      const b = _pdfBytes();
      if (!b) { mal.push(e + '=SIN PDF'); return; }
      const v = _cont(b, 'lvula Mitral') + _cont(b, 'lvula A') + _cont(b, 'lvula Tric')
              + _cont(b, 'AVA / GC / IC') + _cont(b, 'Continuidad TSVI');
      if (v !== 0) mal.push(e + '=' + v);
      if (_cont(b, 'Gasto card') !== 1) mal.push(e + '/sinGC');
    });
    R.mal = mal.join(',');
    R.estilos = EST.length;
    try { if (typeof setPdfPlantilla === 'function') setPdfPlantilla('clasico'); } catch (x) {}
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['queda UNA sola ref en los doce cuadros', R.refsN === 1, R.refs],
    ['y no es un valor de referencia: es la frecuencia del gasto',
       R.refs === 'gc:con FC de 72 lpm', R.refs],
    ['cero celdas con un corte de normalidad o una escala de severidad', R.refsCorte === 0, R.refs],
    ['UNA sola llamada al dibujante de tablas, no cinco: la declaracion mas una',
       R.llamadas === 2, String(R.llamadas)],
    ['DENOMINADOR: se probaron los OCHO estilos', R.estilos === 8, String(R.estilos)],
    ['y en los ocho el PDF sale sin la fila de valvulas y con el cuadro del gasto', R.mal === '', R.mal]
  ] };
""")

caso('TC-936',
 'CUADROS (A): las lineas de valvula van DENTRO del cuadro de su estructura -- la mitral en VM, la aortica en VA, la tricuspide y la pulmonar en el suyo -- una por hallazgo, con la morfologia marcada, y solo si hay alteracion',
 SEED + AYUDA + """
  const R = {};
  try {
    /* ⚠️ SIN DISPARAR EVENTOS: ver la nota de _mudo. */
    _mudo('ia_grado', '4');
    R.vm = _lin(_uno('vm'));
    R.va = _lin(_uno('va'));
    R.tp = _lin(_uno('trip'));
    R.azulVM = (_uno('vm') ? _uno('vm').lineas : []).filter(l => l.azul).map(l => l.txt).join(',');
    R.azulVA = (_uno('va') ? _uno('va').lineas : []).filter(l => l.azul).map(l => l.txt).join(',');
    /* Las lineas viven SOLO en los tres cuadros de valvula. */
    R.conLineas = _defs().filter(d => (d.lineas || []).length).map(d => d.id).join(',');
    /* SIN ALTERACION NO HAY LINEA. Se apaga todo lo valvular y los tres cuadros quedan mudos. */
    [['vm_morf','Normal'],['im_grado','0'],['em_grado','sin'],['vm_notas',''],
     ['va_morf','Trivalva normal'],['ea_grado','sin'],['va_notas',''],
     ['vt_morf','Normal'],['it_grado','0'],['et_grado','sin'],['vp_morf','Normal'],
     ['ip_grado','Sin insuficiencia']].forEach(p => __t.set(p[0], p[1]));
    _mudo('ia_grado', '0'); _mudo('im_grado', '0'); _mudo('it_grado', '0');
    R.mudos = _defs().filter(d => (d.lineas || []).length).map(d => d.id).join(',');
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['la mitral publica su morfologia, su insuficiencia con los numeros de cada metodo y la nota',
       R.vm.indexOf('Prolapso / EVMS') > -1 && R.vm.indexOf('IM severa: VC 7 mm') > -1
       && R.vm.indexOf('EROA 26.1 mm') > -1 && R.vm.indexOf('(Cont)') > -1
       && R.vm.indexOf('Flail de P2.') > -1, R.vm],
    ['la aortica publica su morfologia, la estenosis con el area y la insuficiencia con sus dos medidas',
       R.va.indexOf('Calcificada') > -1 && R.va.indexOf('EA severa: AVA 0.66') > -1
       && R.va.indexOf('IAo severa: VC 4 mm') > -1 && R.va.indexOf('THP 220 ms') > -1, R.va],
    ['la tricuspide y la pulmonar publican sus grados en su propio cuadro',
       R.tp.indexOf('IT moderada') > -1 && R.tp.indexOf('IP moderada') > -1, R.tp],
    ['la morfologia va marcada y los grados no',
       R.azulVM === 'Prolapso / EVMS' && R.azulVA.indexOf('Calcificada') === 0, R.azulVM + ' // ' + R.azulVA],
    ['las lineas viven SOLO en los tres cuadros de valvula', R.conLineas === 'vm,trip,va', R.conLineas],
    ['y sin ninguna alteracion no hay una sola linea', R.mudos === '', R.mudos]
  ] };
""")

caso('TC-937',
 'CUADROS (A): ningun dato vive en dos cuadros a la vez -- censo de los rotulos de las doce cajas, con el O TSVI, el AVA, la PSAP y el gradiente IT mirados uno por uno',
 SEED + AYUDA + """
  const R = {};
  try {
    /* El censo es por ROTULO dentro de los cuadros: dos celdas con el mismo rotulo en dos cuadros
       distintos son el mismo dato publicado dos veces. */
    const vistos = Object.create(null), rep = [];
    _defs().forEach(d => _vals(d).forEach(i => {
      const k = String(i.lbl);
      if (k === '') return;
      if (vistos[k]) rep.push(k + ' en ' + vistos[k] + ' y ' + d.id); else vistos[k] = d.id;
    }));
    R.rep = rep.join(' | ');
    R.n = Object.keys(vistos).length;
    /* Y los cuatro que la tanda movio, uno por uno. */
    const donde = lbl => _defs().filter(d => _vals(d).some(i => i.lbl === lbl)).map(d => d.id).join(',');
    R.tsvi = donde(String.fromCharCode(216) + ' TSVI');
    R.psap = donde('PSAP');
    R.grad = donde('Grad. IT');
    R.ava  = _defs().filter(d => _vals(d).some(i => String(i.lbl).indexOf('AVA') === 0)).map(d => d.id).join(',');
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['DENOMINADOR: el censo recorrio los rotulos de los doce cuadros', R.n > 50, String(R.n)],
    ['ningun rotulo aparece en dos cuadros', R.rep === '', R.rep],
    ['el diametro del TSVI vive solo en la aorta', R.tsvi === 'ao', R.tsvi],
    ['la PSAP vive solo en el cuadro de la tricuspide', R.psap === 'trip', R.psap],
    ['el gradiente de la IT tambien', R.grad === 'trip', R.grad],
    ['y el AVA no vive en ningun cuadro: esta en la linea de la estenosis', R.ava === '', R.ava]
  ] };
""")

# ══════════════════════════ B — LA TARJETA ══════════════════════════
caso('TC-938',
 'CUADROS (B): el boton de los cuatro cuadraditos vive a la derecha de «Evidencia», es chico, rectangular, SIN texto y tocable en 44 px, y abre una tarjeta con los MISMOS cuadros del PDF -- sin datos del paciente y sin el texto del informe',
 SEED + AYUDA + """
  const R = {};
  try {
    try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
    /* ⚠️ LO QUE ESTA EN display:none NO TIENE GEOMETRIA: el boton vive en la pestana del Informe
       y sin abrirla mide 0x0, que se lee igual que «el boton no esta». */
    try { showTab('informe'); } catch (e) {}
    const b = document.getElementById('cuad-btn');
    R.hayBtn = !!b;
    if (b) {
      const r = b.getBoundingClientRect();
      R.w = Math.round(r.width); R.h = Math.round(r.height);
      R.txt = (b.textContent || '').trim();
      R.rects = b.querySelectorAll('svg rect').length;
      /* A la DERECHA de Evidencia y en su misma fila: se mide por el orden del DOM. */
      const ev = document.getElementById('indic-btn');
      R.hermanos = !!(ev && ev.parentNode === b.parentNode);
      R.despues = !!(ev && (ev.compareDocumentPosition(b) & 4) === 4);
    }
    if (_hay('cuadAbrir')) cuadAbrir();
    const ov = document.getElementById('cuad-ov');
    R.abierta = !!(ov && !ov.hidden);
    const cajas = document.querySelectorAll('#cuad-grid > [data-cuad-id]');
    R.n = cajas.length;
    R.ids = Array.prototype.map.call(cajas, n => n.getAttribute('data-cuad-id')).join(',');
    R.mismos = R.ids === (_hay('cuadVisibles') ? cuadVisibles().map(d => d.id).join(',') : 'x');
    /* La tarjeta NO publica datos del paciente ni el texto del informe. */
    const t = ov ? (ov.textContent || '') : '';
    R.nombre = t.indexOf(String(__t.val('nombre') || 'ZZZ')) > -1;
    const inf = String((document.getElementById('informe_texto') || {}).value || '');
    R.informe = inf.length > 40 && t.indexOf(inf.slice(0, 40)) > -1;
    /* Y cada cuadro muestra sus datos. */
    const c0 = document.querySelector('#cuad-grid > [data-cuad-id="ao"]');
    /* ⚠️ SIN NINGUNA EXPRESION REGULAR: una barra invertida NO sobrevive al template literal del
       cuerpo de un caso -- un patron de espacios llega como la letra «s» y reemplaza las eses del
       texto por espacios. Es una trampa que esta casa ya pago varias veces. */
    R.ao = c0 ? String(c0.textContent || '') : null;
    if (_hay('cuadCerrar')) cuadCerrar();
    R.cerrada = !!(ov && ov.hidden);
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['el boton existe', R.hayBtn === true, String(R.hayBtn)],
    ['es chico, rectangular y tocable en 44 px', R.w === 44 && R.h === 44, R.w + 'x' + R.h],
    ['sin una letra de texto', R.txt === '', JSON.stringify(R.txt)],
    ['con el icono de CUATRO cuadraditos', R.rects === 4, String(R.rects)],
    ['en la misma fila que «Evidencia» y a su derecha',
       R.hermanos === true && R.despues === true, R.hermanos + '/' + R.despues],
    ['abre la tarjeta', R.abierta === true, String(R.abierta)],
    ['con los DOCE cuadros del estudio', R.n === 12, String(R.n)],
    ['que son exactamente los que va a imprimir el PDF', R.mismos === true, R.ids],
    ['sin el nombre del paciente', R.nombre === false, String(R.nombre)],
    ['y sin el texto del informe', R.informe === false, String(R.informe)],
    ['cada cuadro muestra sus datos', String(R.ao).indexOf('SV: 41 mm') > -1, String(R.ao)],
    ['y se cierra', R.cerrada === true, String(R.cerrada)]
  ] };
""")

caso('TC-939',
 'CUADROS (B): en la tarjeta se quita un cuadro con su cruz y pasa a la franja de quitados con su nombre, se recupera con UN toque, se reordena arrastrando con eventos de puntero -- asi funciona con el dedo -- y «Restablecer» vuelve al orden de fabrica',
 SEED + AYUDA + """
  const R = {};
  try {
    try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
    try { showTab('informe'); } catch (e) {}
    if (_hay('cuadReset')) cuadReset();
    if (_hay('cuadAbrir')) cuadAbrir();
    const ids = () => Array.prototype.map.call(
      document.querySelectorAll('#cuad-grid > [data-cuad-id]'), n => n.getAttribute('data-cuad-id')).join(',');
    const chips = () => document.querySelectorAll('#cuad-chips button').length;
    R.ids0 = ids();
    /* (1) QUITAR con la cruz del propio cuadro, no llamando a la funcion. */
    const caja = document.querySelector('#cuad-grid > [data-cuad-id="gc"]');
    const x = caja ? caja.querySelector('.cuad-x') : null;
    R.hayX = !!x;
    if (x) { const rx = x.getBoundingClientRect(); R.xw = Math.round(rx.width); R.xh = Math.round(rx.height); x.click(); }
    R.ids1 = ids();
    R.franja = !(document.getElementById('cuad-franja') || {}).hidden;
    R.chips1 = chips();
    R.chipTxt = (document.querySelector('#cuad-chips button') || {}).textContent || null;
    /* (2) RECUPERAR con un toque. */
    const ch = document.querySelector('#cuad-chips button');
    if (ch) ch.click();
    R.ids2 = ids(); R.chips2 = chips();
    /* (3) ARRASTRAR con eventos de PUNTERO, que es lo que funciona con el dedo. */
    const cajas = document.querySelectorAll('#cuad-grid > [data-cuad-id]');
    const gr0 = cajas[0] ? cajas[0].querySelector('.cuad-grip') : null;
    R.arrastrable = !!gr0;
    R.touch = gr0 ? ((getComputedStyle(gr0).touchAction || '') === 'none') : null;
    R.over = _arrastrar(0, 1);
    R.ids3 = ids();
    /* (4) RESTABLECER. */
    const rb = document.getElementById('cuad-rest');
    if (rb) rb.click();
    R.ids4 = ids();
    if (_hay('cuadCerrar')) cuadCerrar();
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  const BASE = 'ao,ai,advci,viest,visis,vd,vm,dti,trip,va,gc,otros';
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['DENOMINADOR: la tarjeta arranca con los doce en el orden de fabrica', R.ids0 === BASE, R.ids0],
    ['cada cuadro trae su cruz, tocable en 44 px', R.hayX === true && R.xw === 44 && R.xh === 44, R.xw + 'x' + R.xh],
    ['tocarla saca el cuadro del informe', R.ids1 === 'ao,ai,advci,viest,visis,vd,vm,dti,trip,va,otros', R.ids1],
    ['y lo manda a la franja de quitados', R.franja === true && R.chips1 === 1, String(R.chips1)],
    ['con su nombre, no con un numero', String(R.chipTxt).indexOf('Gasto card') > -1, String(R.chipTxt)],
    ['un toque en la franja lo devuelve a su lugar', R.ids2 === BASE && R.chips2 === 0, R.ids2],
    ['cada cuadro tiene su manija, preparada para el dedo', R.arrastrable === true && R.touch === true, String(R.touch)],
    ['DENOMINADOR: el arrastre encontro el cuadro de destino debajo del puntero',
       R.over === 'ai', String(R.over)],
    ['arrastrar la primera caja sobre la siguiente la mueve',
       R.ids3 === 'ai,ao,advci,viest,visis,vd,vm,dti,trip,va,gc,otros', R.ids3],
    ['y «Restablecer» vuelve al orden de fabrica', R.ids4 === BASE, R.ids4]
  ] };
""")

caso('TC-940',
 'CUADROS (B): la tarjeta NO escribe un solo campo -- ni el estudio, ni el Excel, ni el informe, ni el EN SUMA -- y abrirla y cerrarla sin tocar nada deja el PDF exactamente igual que sin abrirla',
 SEED + AYUDA + PDF + """
  const R = {};
  try {
    try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
    if (_hay('cuadReset')) cuadReset();
    const censo = () => Array.prototype.map.call(
      document.querySelectorAll('input[id],select[id],textarea[id]'),
      e => e.id + '=' + (e.type === 'checkbox' ? (e.checked ? '1' : '0') : String(e.value))).join('|');
    const inf0 = String((document.getElementById('informe_texto') || {}).value || '');
    const sum0 = String((document.getElementById('en_suma') || {}).value || '');
    const xls0 = (typeof LAB_XLS_MAP !== 'undefined') ? Object.keys(LAB_XLS_MAP).length : null;
    const antes = censo();
    /* El PDF ANTES de abrir la tarjeta. */
    const b0 = _pdfBytes();
    /* Abrir, mirar y cerrar SIN TOCAR NADA. */
    if (_hay('cuadAbrir')) cuadAbrir();
    /* ⚠️ !({}).hidden DA true: sin el objeto de verdad este denominador decia «la tarjeta se
       abrio» sobre un arbol donde la tarjeta no existe. */
    const _ov = document.getElementById('cuad-ov');
    R.abierta = !!(_ov && !_ov.hidden);
    if (_hay('cuadCerrar')) cuadCerrar();
    const b1 = _pdfBytes();
    R.censoIgual = (censo() === antes);
    R.infIgual = String((document.getElementById('informe_texto') || {}).value || '') === inf0;
    R.sumIgual = String((document.getElementById('en_suma') || {}).value || '') === sum0;
    R.xlsIgual = ((typeof LAB_XLS_MAP !== 'undefined') ? Object.keys(LAB_XLS_MAP).length : null) === xls0;
    R.hayPdf = !!(b0 && b1);
    R.largoIgual = !!(b0 && b1 && b0.length === b1.length);
    /* Y los doce titulos salen la misma cantidad de veces en los dos. */
    const T = ['Aorta tor','cula izquierda','cula derecha / VCI','Estructura','n sist',
               'culo derecho','Transmitral / Vena pulmonar','DTI mitral','spide / Pulmonar',
               'Gradientes y continuidad','Gasto card','Otros'];
    R.dif = (b0 && b1) ? T.filter(x => _cont(b0, x) !== _cont(b1, x)).join(',') : 'SIN PDF';
    R.doce = b0 ? T.filter(x => _cont(b0, x) >= 1).length : 0;
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['DENOMINADOR: la tarjeta se abrio de verdad', R.abierta === true, String(R.abierta)],
    ['el censo de TODOS los campos con id queda identico', R.censoIgual === true, String(R.censoIgual)],
    ['el informe narrativo no se toca', R.infIgual === true, String(R.infIgual)],
    ['el EN SUMA tampoco', R.sumIgual === true, String(R.sumIgual)],
    ['y el mapa del Excel del Laboratorio tampoco', R.xlsIgual === true, String(R.xlsIgual)],
    ['DENOMINADOR: se generaron los dos PDF', R.hayPdf === true, String(R.hayPdf)],
    ['y los doce cuadros estan en el primero', R.doce === 12, String(R.doce)],
    ['el PDF de despues pesa lo mismo', R.largoIgual === true, String(R.largoIgual)],
    ['y publica los mismos cuadros la misma cantidad de veces', R.dif === '', R.dif]
  ] };
""")

caso('TC-941',
 'CUADROS (B): la configuracion de cuadros NO se descarta al limpiar ni al abrir otro estudio -- vale para todos hasta «Restablecer» -- y el PDF la refleja en dos estilos distintos',
 SEED + AYUDA + PDF + """
  const R = {};
  try {
    try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
    if (_hay('cuadReset')) cuadReset();
    /* Se arma la configuracion POR LA TARJETA, que es como la arma el medico. */
    if (_hay('cuadAbrir')) cuadAbrir();
    const caja = document.querySelector('#cuad-grid > [data-cuad-id="gc"]');
    if (caja && caja.querySelector('.cuad-x')) caja.querySelector('.cuad-x').click();
    if (_hay('cuadCerrar')) cuadCerrar();
    R.cfg0 = _hay('cuadVisibles') ? cuadVisibles().map(d => d.id).join(',') : null;
    /* (1) «Nuevo estudio» NO la descarta. */
    __t.nuevoEstudio();
    R.trasNuevo = (typeof _cuadQuit !== 'undefined') ? _cuadQuit.join(',') : null;
    R.persNuevo = _hay('cuadPersonalizado') ? cuadPersonalizado() : null;
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return (async () => {
    let est = null;
    try {
      /* (2) ABRIR OTRO ESTUDIO tampoco: se guarda uno de verdad y se reabre. */
      [['nombre','Segundo'],['fecha','2026-11-18'],['sexo','F'],['ddfvi','47'],['fevi','61'],
       ['ai_diam','36'],['vmax_ao','1.4'],['itv_tsvi','17'],['itv_ao','90'],['diam_tsvi','20'],
       ['hemo_fc','68']].forEach(p => __t.set(p[0], p[1]));
      const g = await __t.guardar();
      est = g.estudioId;
      __t.reabrir(est);
      await new Promise(r => setTimeout(r, 400));
      R.trasReabrir = (typeof _cuadQuit !== 'undefined') ? _cuadQuit.join(',') : null;
      R.visReabrir = _hay('cuadVisibles') ? cuadVisibles().map(d => d.id).join(',') : null;
      R.persReabrir = _hay('cuadPersonalizado') ? cuadPersonalizado() : null;
      /* (3) EL PDF LA REFLEJA EN DOS ESTILOS DISTINTOS. */
      const mal = [];
      ['clasico', 'moderno'].forEach(e => {
        try { if (typeof setPdfPlantilla === 'function') setPdfPlantilla(e); } catch (x) {}
        const b = _pdfBytes();
        if (!b) { mal.push(e + '=SIN PDF'); return; }
        if (_cont(b, 'Gasto card') !== 0) mal.push(e + '=sale el quitado');
        /* ⚠️ SE PREGUNTA POR UN CUADRO QUE ESTE ESTUDIO SI TIENE. El segundo estudio no trae
           Doppler tisular, asi que el cuadro DTI no sale -- y preguntar por el daba «falta uno
           que si va» sobre un PDF correcto. Se usa VI-Estructura, que tiene el DDVI cargado. */
        if (_cont(b, 'Estructura') !== 1) mal.push(e + '=falta uno que si va');
      });
      R.mal = mal.join(',');
      /* (4) «Restablecer» la deshace. */
      if (_hay('cuadRestablecer')) { if (_hay('cuadAbrir')) cuadAbrir(); cuadRestablecer();
        if (_hay('cuadCerrar')) cuadCerrar(); }
      R.trasRest = (typeof _cuadQuit !== 'undefined') ? _cuadQuit.join(',') : null;
      R.persRest = _hay('cuadPersonalizado') ? cuadPersonalizado() : null;
      const b2 = _pdfBytes();
      R.vuelve = b2 ? _cont(b2, 'Gasto card') : -1;
      try { if (typeof setPdfPlantilla === 'function') setPdfPlantilla('clasico'); } catch (x) {}
    } catch (e) { R.err2 = String(e && e.message || e).slice(0, 200); }
    try { if (est) await __t.borrar(est); } catch (e) {}
    return { extra: [
      ['sin excepciones', !R.err && !R.err2, String(R.err) + ' / ' + String(R.err2)],
      ['DENOMINADOR: la tarjeta dejo un cuadro quitado',
         R.cfg0 === 'ao,ai,advci,viest,visis,vd,vm,dti,trip,va,otros', String(R.cfg0)],
      ['«Nuevo estudio» NO la descarta', R.trasNuevo === 'gc' && R.persNuevo === true, String(R.trasNuevo)],
      ['abrir OTRO estudio tampoco', R.trasReabrir === 'gc' && R.persReabrir === true, String(R.trasReabrir)],
      ['y se le aplica a ese estudio', String(R.visReabrir).indexOf('gc') < 0, String(R.visReabrir)],
      ['el PDF la refleja en los DOS estilos', R.mal === '', R.mal],
      ['«Restablecer» la deshace', R.trasRest === '' && R.persRest === false, String(R.trasRest)],
      ['y el cuadro vuelve al papel', R.vuelve === 1, String(R.vuelve)]
    ] };
  })();
""")

caso('TC-942',
 'CUADROS (B): el boton muestra un PUNTO de aviso cuando la configuracion no es la de fabrica -- al quitar un cuadro Y al reordenar -- y lo dice ademas con palabras en su title y su aria-label; «Restablecer» lo apaga, y el aviso no depende solo del color',
 SEED + AYUDA + """
  const R = {};
  try {
    try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
    try { showTab('informe'); } catch (e) {}
    if (_hay('cuadReset')) cuadReset();
    if (_hay('cuadBtnSync')) cuadBtnSync();
    const b = document.getElementById('cuad-btn'), p = document.getElementById('cuad-pt');
    R.hay = !!(b && p);
    const lee = () => ({ pt: p ? p.hidden : null, tit: b ? String(b.getAttribute('title') || '') : '',
                         aria: b ? String(b.getAttribute('aria-label') || '') : '' });
    R.fab = lee();
    /* (1) QUITAR prende el punto. */
    if (_hay('cuadAbrir')) cuadAbrir();
    const caja = document.querySelector('#cuad-grid > [data-cuad-id="gc"]');
    if (caja && caja.querySelector('.cuad-x')) caja.querySelector('.cuad-x').click();
    R.quit = lee();
    /* (2) RESTABLECER lo apaga. */
    const rb = document.getElementById('cuad-rest');
    if (rb) rb.click();
    R.rest = lee();
    /* (3) REORDENAR SIN QUITAR NADA tambien lo prende: el aviso no es solo «falta un cuadro». */
    R.over = _arrastrar(0, 1);
    R.orden = lee();
    R.quitVacio = (typeof _cuadQuit !== 'undefined') ? _cuadQuit.length : -1;
    /* (4) Y un arrastre que devuelve cada cuadro a su lugar NO deja el punto prendido: el
       predicado compara el CONTENIDO del orden y no si alguien escribio la variable. */
    if (typeof _cuadOrden !== 'undefined') _cuadOrden = CUAD_IDS.slice();
    if (_hay('cuadBtnSync')) cuadBtnSync();
    R.mismo = lee();
    if (_hay('cuadRestablecer')) cuadRestablecer();
    if (_hay('cuadCerrar')) cuadCerrar();
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['DENOMINADOR: el boton y su punto existen', R.hay === true, String(R.hay)],
    ['con la configuracion de fabrica el punto NO aparece', R.fab.pt === true, JSON.stringify(R.fab)],
    ['y las palabras lo dicen', R.fab.tit.indexOf('fabrica') > -1 || R.fab.tit.indexOf('f' + String.fromCharCode(225) + 'brica') > -1, R.fab.tit],
    ['al quitar un cuadro el punto aparece', R.quit.pt === false, JSON.stringify(R.quit)],
    ['y el aviso NO depende solo del color: lo dice el title y el aria-label',
       R.quit.tit.indexOf('personalizado') > -1 && R.quit.aria.indexOf('personalizado') > -1, R.quit.tit + ' // ' + R.quit.aria],
    ['y dice cuantos cuadros faltan', R.quit.tit.indexOf('1 cuadro quitado') > -1, R.quit.tit],
    ['«Restablecer» lo apaga', R.rest.pt === true, JSON.stringify(R.rest)],
    ['DENOMINADOR: el arrastre encontro el cuadro de destino', R.over === 'ai', String(R.over)],
    ['reordenar SIN quitar nada tambien lo prende',
       R.orden.pt === false && R.quitVacio === 0, JSON.stringify(R.orden) + ' quit=' + R.quitVacio],
    ['y lo dice con palabras', R.orden.tit.indexOf('orden cambiado') > -1, R.orden.tit],
    ['un orden que termina igual al de fabrica NO deja el punto prendido',
       R.mismo.pt === true, JSON.stringify(R.mismo)]
  ] };
""")

# ══════════════════════════ C — LA GRILLA ══════════════════════════
caso('TC-943',
 'CUADROS (C): el reparto de la grilla es el mismo en la tarjeta y en el PDF -- filas de tres, dos en mitades, uno a fila completa y las dos ultimas de a 2 + 2 cuando sobra uno -- con los siete ejemplos del medico, y una fila no se parte entre dos hojas',
 SEED + AYUDA + """
  const R = {};
  try {
    try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
    /* (1) LOS SIETE EJEMPLOS, mas los bordes de cada rama. */
    const f = n => _hay('cuadFilas') ? cuadFilas(n).join('-') : 'SIN';
    R.ej = [12, 11, 10, 7, 4, 2, 1].map(n => n + ':' + f(n)).join(' ');
    R.extra = [0, 3, 5, 6, 8, 9, 13].map(n => n + ':' + f(n)).join(' ');
    /* (2) LA SUMA DE CADA REPARTO ES EL TOTAL: ningun cuadro se pierde ni se duplica. */
    const malSuma = [];
    for (let n = 1; n <= 20; n++) {
      const fs = _hay('cuadFilas') ? cuadFilas(n) : [];
      const s = fs.reduce((a, b) => a + b, 0);
      if (s !== n) malSuma.push(n + '=' + s);
      if (fs.some(k => k < 1 || k > 3)) malSuma.push(n + '/tam');
    }
    R.malSuma = malSuma.join(',');
    /* (3) LA TARJETA USA EL MISMO REPARTO: el span de seis columnas sale de el. */
    if (_hay('cuadReset')) cuadReset();
    if (_hay('cuadAbrir')) cuadAbrir();
    const spans = () => Array.prototype.map.call(
      document.querySelectorAll('#cuad-grid > [data-cuad-id]'), n => n.getAttribute('data-cuad-span')).join(',');
    R.span12 = spans();
    /* Con un cuadro quitado quedan once: 3-3-3-2, o sea dos cajas de media fila al final. */
    const caja = document.querySelector('#cuad-grid > [data-cuad-id="gc"]');
    if (caja && caja.querySelector('.cuad-x')) caja.querySelector('.cuad-x').click();
    R.span11 = spans();
    /* Con dos quitados quedan diez: 3-3-2-2. */
    const c2 = document.querySelector('#cuad-grid > [data-cuad-id="dti"]');
    if (c2 && c2.querySelector('.cuad-x')) c2.querySelector('.cuad-x').click();
    R.span10 = spans();
    if (_hay('cuadRestablecer')) cuadRestablecer();
    if (_hay('cuadCerrar')) cuadCerrar();
    /* (4) UNA FILA ES ATOMICA EN EL PAPEL: el dibujante pide hoja con el alto de la fila
       COMPLETA antes de dibujar nada, asi que un cuadro no puede quedar partido. */
    const src = (typeof generarPDFReal === 'function') ? String(generarPDFReal) : '';
    const i = src.indexOf('function drawTablaCompacta');
    /* El corte va holgado: la funcion crecio con el bloque de lineas de valvula y con 9000
       caracteres la guarda quedaba afuera -- un rojo sobre codigo correcto. */
    const cuerpo = i >= 0 ? src.slice(i, i + 24000) : '';
    R.atomica = cuerpo.indexOf('checkPage(tblH + 3)') > -1;
    R.largo = cuerpo.length;
  } catch (e) { R.err = String(e && e.message || e).slice(0, 200); }
  return { extra: [
    ['sin excepciones', !R.err, R.err],
    ['los siete ejemplos del medico dan lo pedido',
       R.ej === '12:3-3-3-3 11:3-3-3-2 10:3-3-2-2 7:3-2-2 4:2-2 2:2 1:1', R.ej],
    ['y los bordes de cada rama tambien',
       R.extra === '0: 3:3 5:3-2 6:3-3 8:3-3-2 9:3-3-3 13:3-3-3-2-2', R.extra],
    ['el reparto nunca pierde ni duplica un cuadro, y ninguna fila pasa de tres',
       R.malSuma === '', R.malSuma],
    ['la tarjeta reparte los doce de a tres', R.span12 === '2,2,2,2,2,2,2,2,2,2,2,2', R.span12],
    ['con once, las dos ultimas van a media fila', R.span11 === '2,2,2,2,2,2,2,2,2,3,3', R.span11],
    ['con diez, las cuatro ultimas van de a dos', R.span10 === '2,2,2,2,2,2,3,3,3,3', R.span10],
    ['y en el papel una fila es atomica: se pide hoja con su alto completo',
       R.atomica === true, String(R.atomica) + ' (' + R.largo + ' car.)']
  ] };
""")

# ══════════════════════════ ESCRITURA ══════════════════════════
BT = chr(96)
RUTA = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/scripts/test_clinico.mjs'

def main():
    src = io.open(RUTA, encoding='utf-8').read()
    partes = []
    for cid, titulo, cuerpo in CASOS:
        # ⚠️ EL GUARDIAN: ni un acento grave y ni una interpolacion en el cuerpo. Un acento grave
        #    cierra el template literal del caso, y lo peor que puede pasar es que lo que queda
        #    SIGA siendo JS valido -- ahi node --check pasa y el caso se registra con un cuerpo
        #    que no es una cadena, que es lo que PANT-31 pago con TC-798.
        assert BT not in cuerpo, cid + ': tiene un acento grave en el cuerpo'
        assert BT not in titulo, cid + ': tiene un acento grave en el titulo'
        assert '$' + '{' not in cuerpo, cid + ': tiene una interpolacion en el cuerpo'
        assert chr(92) not in cuerpo, cid + ': tiene una barra invertida en el cuerpo'
        assert "'" not in titulo, cid + ': el titulo lleva comilla simple'
        assert cid not in src, cid + ': ya existe en el archivo'
        partes.append("caso('" + cid + "', '" + titulo + "', " + BT + cuerpo + BT + ");\n")
    nuevo = "\n" + "\n".join(partes)
    # ⚠️ SE INSERTA ANTES DE LA COLA DEL RUNNER, no al final del archivo: el archivo NO termina
    #    con el ultimo caso -- despues vienen las ~170 lineas que levantan el servidor, abren
    #    Chrome y corren la lista. Un caso agregado al final se registraria DESPUES de que el
    #    runner ya leyo CASOS, o sea que no se ejecutaria nunca y el total cerraria igual.
    ANCLA = "\ntry {\n  const s = await servir(); servidor = s.srv;"
    assert src.count(ANCLA) == 1, 'el ancla del runner no aparece exactamente una vez'
    k = src.index(ANCLA)
    io.open(RUTA, 'w', encoding='utf-8').write(src[:k] + nuevo + src[k:])
    print('insertados', len(CASOS), 'casos:', ', '.join(c[0] for c in CASOS))

if __name__ == '__main__':
    main()
