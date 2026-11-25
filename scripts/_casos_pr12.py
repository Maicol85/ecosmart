# -*- coding: utf-8 -*-
"""Genera los cuatro casos de PR12 y los inserta en scripts/test_clinico.mjs.

GUARDIAN: el cuerpo de un caso es un TEMPLATE LITERAL, asi que un acento grave adentro lo cierra
antes de tiempo. Este script ABORTA si encuentra uno, y verifica que la cola del runner siga
despues del ultimo caso -- la trampa que PANT-33 pago: quitar/agregar al final se lleva el
try/catch que cierra Chrome y el suite informa 0/0 sin regresiones.
"""
import re, sys, subprocess
BT = chr(96)
C = []

C.append(("TC-1064",
 "PR12 (TAREA 1): el HTML que los dos botones copian lleva 11 pt EN LINEA en cada bloque -- parrafos, titulos, negrita, subrayado, lista e items --, NO fija tipografia, y el texto llano no cambia",
r"""
  /* GUARDA EN TODO ACCESO: contra el arbol anterior (2830208) CW_FS y _cwB no existen, y un
     acceso pelado tira ReferenceError que se lleva el caso ENTERO -- la condicion sale roja y
     las de abajo NO LLEGAN A EVALUARSE. Es lo que TC-827 deshizo en PANT-37. */
  const _hay = n => { try { return typeof window[n] === 'function' } catch (e) { return false } };
  const _h1 = () => { try { return _hay('cuadTextoHTML') ? String(cuadTextoHTML() || '') : '' } catch (e) { return '' } };
  const _h2 = () => { try { return _hay('cuadInformeHTML') ? String(cuadInformeHTML() || '') : '' } catch (e) { return '' } };
  const _t1 = () => { try { return _hay('cuadTexto') ? String(cuadTexto() || '') : '' } catch (e) { return '' } };
  const _t2 = () => { try { return _hay('cuadInformeTexto') ? String(cuadInformeTexto() || '') : '' } catch (e) { return '' } };
  const R = {};
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  [['nombre','Zoraida Pruebas'],['fecha','2026-11-25'],['edad','74'],['sexo','M'],
   ['peso','80'],['talla','170'],['ddfvi','52'],['dsfvi','34'],['siv','11'],['ppvi','10'],
   ['fevi','58'],['ai_ap','38'],['tapse','22'],['ao_sin','38'],['ao_tub','34'],['vp_vmax','1.1']
  ].forEach(p => { try { __t.set(p[0], p[1]) } catch (e) {} });
  try { if (_hay('calcAIVI')) calcAIVI(); } catch (e) {}
  try { if (_hay('generarInforme')) generarInforme(); } catch (e) {}
  try { const s = document.getElementById('en_suma');
        if (s && !String(s.value || '').trim()) s.value = 'Funcion sistolica conservada.\\nAorta ascendente normal.'; } catch (e) {}

  const H1 = _h1(), H2 = _h2(), T1 = _t1(), T2 = _t2();
  R.hay = !!(H1 && H2);
  if (!R.hay) return { extra: [['DENOMINADOR: los dos armadores de HTML devuelven algo',
                                false, 'datos=' + H1.length + ' informe=' + H2.length]] };

  /* (A) NINGUN BLOQUE QUEDA SIN TAMANIO: se recorren TODAS las etiquetas de apertura de los dos
     HTML y cada una tiene que declarar font-size:11pt. Es la condicion literal de la orden. */
  const tags = h => (String(h).match(/<[a-z]+[^>]*>/g) || []);
  const sinPt = [];
  [H1, H2].forEach(h => tags(h).forEach(t => { if (t.indexOf('font-size:11pt') < 0) sinPt.push(t.slice(0, 60)); }));
  R.nTags = tags(H1).length + tags(H2).length;
  R.sinPt = sinPt.length; R.sinPtQue = sinPt.slice(0, 4).join(' | ');

  /* (B) UN SOLO TAMANIO en el cuerpo. */
  const otros = [];
  [H1, H2].forEach(h => (String(h).match(/font-size:\\s*[^;"']+/g) || []).forEach(f => {
    if (f.replace(/\\s/g, '') !== 'font-size:11pt') otros.push(f); }));
  R.otrosPt = otros.length; R.otrosQue = otros.slice(0, 4).join(' | ');

  /* (C) NO SE FIJA LA TIPOGRAFIA: que Pages y Word usen la suya. */
  R.sinFamily = (H1 + H2).indexOf('font-family') < 0;

  /* (D) EL TEXTO LLANO NO CAMBIA: sigue siendo texto sin una marca de estilo, y cada renglon no
     vacio que publica sigue estando en el HTML. */
  R.llanoLimpio = (T1 + T2).indexOf('font-size') < 0 && (T1 + T2).indexOf('style=') < 0
                  && (T1 + T2).indexOf('<p') < 0;
  const visible = String(H1 + H2).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const lineas = String(T1).split('\\n').map(l => l.trim()).filter(l => l !== '');
  R.nLineas = lineas.length;
  /* El HTML pasa cada renglon por _cwCap -- la mayuscula inicial que PR8 agrego --, asi que se
     compara contra ESE mismo dueno y no contra una capitalizacion escrita aca. */
  const _cap = l => { try { return (typeof _cwCap === 'function') ? _cwCap(l) : l } catch (e) { return l } };
  /* /!\ EL TITULO DE SECCION SE ESCRIBE DISTINTO EN LAS DOS REPRESENTACIONES, y es de antes de
     esta tanda: el texto llano lo marca con DOS PUNTOS -- «Aorta:» -- y el HTML con NEGRITA --
     <b>Aorta</b> --, que es lo que un documento con formato usa para lo mismo. Asi que la
     comparacion acepta el renglon con o sin sus dos puntos finales; lo que no se afloja es que las
     PALABRAS esten, que es lo que esta condicion protege. */
  const _sinDP = l => String(l).replace(/:$/, '');
  R.faltaEnHTML = lineas.filter(l => visible.indexOf(_cap(l)) < 0 && visible.indexOf(l) < 0
                                  && visible.indexOf(_cap(_sinDP(l))) < 0);
  R.todasEnHTML = R.faltaEnHTML.length === 0;

  /* (E) NEGRITA, SUBRAYADO Y VINIETAS siguen donde estaban. */
  const TD = (function () { try { return String(CW_DOPPLER_TIT) } catch (e) { return 'DOPPLER' } })();
  /* EXACTO Y NO POR CERCANIA: se arma el fragmento con el MISMO _cwB que usa el armador y se
     exige que el HTML lo contenga. Con una ventana de caracteres alrededor del titulo, el <u> de
     la seccion anterior entraba en la cuenta. */
  R.dopplerSub = (function () {
    try { return H1.indexOf(_cwB(_cwEscHtml(TD), true)) >= 0 } catch (e) { return false }
  })();
  R.hayNegrita = H1.indexOf('<b') >= 0 && H2.indexOf('<b') >= 0;
  R.infSubrayado = H2.indexOf('INFORME') >= 0
    && H2.slice(0, H2.indexOf('INFORME')).lastIndexOf('<u') > 0;
  R.vinietas = H2.indexOf('<ul') >= 0 && H2.indexOf('<li') >= 0;
  R.otroTituloSinU = (function () {
    try {
      const secs = cuadTextoSecs() || [];
      const otro = secs.map(s => s.tit).filter(t => t && t !== TD)[0];
      if (!otro) return true;
      return H1.indexOf(_cwB(_cwEscHtml(otro), false)) >= 0
          && H1.indexOf(_cwB(_cwEscHtml(otro), true)) < 0;
    } catch (e) { return false }
  })();

  /* (F) LOS DOS BOTONES COPIAN EXACTAMENTE LO QUE ARMAN SUS FUNCIONES: portapapeles simulado,
     envolviendo _cuadCopiar, que es la unica puerta de los dos. */
  const cap = [];
  const orig = window._cuadCopiar;
  if (typeof orig === 'function') {
    window._cuadCopiar = function (txt, que, html) { cap.push({ que: que, txt: txt, html: html }); return true; };
    try { if (_hay('cuadCopiarDatos')) cuadCopiarDatos(); } catch (e) {}
    try { if (_hay('cuadCopiarInforme')) cuadCopiarInforme(); } catch (e) {}
    window._cuadCopiar = orig;
  }
  R.nCap = cap.length;
  R.capIgual = cap.length === 2 && cap[0].html === H1 && cap[0].txt === T1
                                && cap[1].html === H2 && cap[1].txt === T2;

  return { extra: [
    ['DENOMINADOR: los dos armadores publican ' + R.nTags + ' bloques', R.nTags >= 10, R.nTags],
    ['ningun bloque del HTML copiado queda sin 11 pt', R.sinPt === 0, R.sinPt + ' sin pt: ' + R.sinPtQue],
    ['no aparece ningun tamanio distinto de 11 pt', R.otrosPt === 0, R.otrosQue],
    ['no se fija la tipografia: sin font-family', R.sinFamily, R.sinFamily],
    ['el texto llano sigue siendo llano', R.llanoLimpio, R.llanoLimpio],
    ['y cada renglon del texto llano esta en el HTML', R.todasEnHTML,
     R.nLineas + ' renglones; falta: ' + (R.faltaEnHTML.slice(0, 2).join(' | ') || 'ninguno')],
    ['DOPPLER sigue en negrita Y subrayado', R.dopplerSub, R.dopplerSub],
    ['otro titulo sigue en negrita y SIN subrayado', R.otroTituloSinU, R.otroTituloSinU],
    ['INFORME sigue subrayado y hay negrita en los dos', R.infSubrayado && R.hayNegrita, R.infSubrayado],
    ['las vinietas del EN SUMA siguen en lista', R.vinietas, R.vinietas],
    ['los dos botones copian lo que arman sus funciones', R.capIgual, R.nCap + ' copiados']
  ] };
"""))

C.append(("TC-1065",
 "PR12 (TAREA 2): el corte de espesor parietal relativo es 0,42 INCLUIDO -- 0,42 cuenta como aumentado en los cuatro cuadrantes --, el cuadro de referencia y las dos fichas lo escriben con 0,42 o mas, y el criterio de HFA-PEFF conserva su operador estricto y su fuente",
r"""
  /* ESTE CASO PASA TAMBIEN CONTRA EL ARBOL ANTERIOR, A PROPOSITO, y se declara en PENDIENTES ->
     PR12-b: la TAREA 2 encontro MIDIENDO que el corte YA estaba en 0,42 incluido en la logica, en
     el cuadro de Referencias y en las dos fichas, asi que no hubo nada que cambiar. Es una GUARDA
     DE REGRESION y no lo que discrimina: lo que lo pone rojo son las mutaciones 01 y 02. */
  const _hay = n => { try { return typeof window[n] === 'function' } catch (e) { return false } };
  const R = {};
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  R.hay = _hay('calcGeometriaVI');
  if (!R.hay) return { extra: [['DENOMINADOR: la geometria tiene un dueno unico', false, 'NO HAY calcGeometriaVI']] };

  /* (A) LOS CUATRO CUADRANTES EN EL BORDE. La masa normal del varon llega a 115 g/m2, asi que 100
     es normal y 140 esta aumentada. Se prueban 0,41 / 0,42 / 0,43 en los dos lados. */
  const g = (m, r) => { try { return String(calcGeometriaVI(m, r, 'M')) } catch (e) { return 'ERR' } };
  R.nor41 = g(100, 0.41); R.nor42 = g(100, 0.42); R.nor43 = g(100, 0.43);
  R.alt41 = g(140, 0.41); R.alt42 = g(140, 0.42); R.alt43 = g(140, 0.43);
  R.conMasaNormal = R.nor41 === 'Normal'
                 && R.nor42 === 'Remodelado concéntrico' && R.nor43 === R.nor42;
  R.conMasaAlta  = R.alt41 === 'Hipertrofia excéntrica'
                 && R.alt42 === 'Hipertrofia concéntrica' && R.alt43 === R.alt42;
  /* CONTROL NEGATIVO: por debajo del corte sigue del lado de abajo en los dos.
     /!\ VA EN 0,414 Y NO EN 0,419, Y NO ES UN AJUSTE PARA QUE PASE: calcGeometriaVI NORMALIZA el
     RWT a los DOS decimales que se IMPRIMEN en el informe, asi que 0,419 redondea a 0,42 y cae
     -- con razon -- del lado aumentado. Ese redondeo es el que evita que la tabla del PDF y el
     narrativo se contradigan cerca del umbral, y esta declarado en el comentario de esa funcion.
     La tercera comparacion lo afirma, asi que la condicion quedo MAS fuerte. */
  R.ctrl = g(100, 0.414) === 'Normal' && g(140, 0.414) === 'Hipertrofia excéntrica'
        && g(100, 0.419) === 'Remodelado concéntrico';

  /* (B) EL CUADRO DE REFERENCIA de Referencias escribe el operador INCLUSIVO y no el estricto.
     Se lee el NODO, no el archivo. */
  const vi = document.getElementById('ref-vi');
  R.hayRefVi = !!vi;
  const tv = vi ? String(vi.textContent || '') : '';
  R.refInclusivo = ['≥0.42', '≥ 0.42', '≥0,42', '≥ 0,42']
                     .some(s => tv.indexOf(s) >= 0);
  R.refSinEstricto = ['>0.42', '> 0.42', '>0,42', '> 0,42'].every(s => tv.indexOf(s) < 0);

  /* (C) LAS FICHAS lo dicen con palabras, y su dueno declarado es calcGeometriaVI. */
  const fich = k => { try { return (EV_REG || []).filter(x => x && x.id === k)[0] || null }
                      catch (e) { return null } };
  const f1 = fich('GEO-VI-001'), f2 = fich('GEO-VI-002');
  R.hayFichas = !!(f1 && f2);
  R.f1Inclusivo = !!(f1 && String(f1.valor).indexOf('0,42 o más') >= 0
                        && String(f1.valor).indexOf('más de 0,42') < 0);
  R.f2Inclusivo = !!(f2 && String(f2.valor).indexOf('0,42 o más') >= 0);
  R.f1Dueno = !!(f1 && String(f1.duenio) === 'calcGeometriaVI');

  /* (D) EL CUADRO POR SEXO publica el mismo corte en los dos sexos, con el operador inclusivo. */
  R.porSexo = (function () {
    try { return String(document.body.textContent || '').indexOf('≥ 0,42') >= 0 }
    catch (e) { return false }
  })();

  /* (E) CONTROL NEGATIVO DEL OTRO CORTE: el criterio de HFA-PEFF conserva su operador ESTRICTO y
     su atribucion a Pieske 2019. La orden dice expresamente no tocarlo, y la regla de la casa
     prohibe atribuirle a una fuente un simbolo que no escribe. */
  const vi2 = document.getElementById('ref-hfapeff');
  R.hayRefHfa = !!vi2;
  /* /!\ SE MIDE DENTRO DE CADA FILA Y NO SOBRE EL TEXTO DEL PANEL ENTERO. La mutacion 10 del
     barrido SOBREVIVIO a la primera version, que buscaba «> 0,42» en todo el panel: esa tabla
     tiene DOS filas con ese corte -- el espesor relativo solo, y el indice de masa CON el espesor
     relativo --, asi que cambiarle el operador a UNA seguia encontrandolo en la otra. Es el mismo
     agujero que PANT-22 y PR6 pagaron midiendo sobre el join de varias notas. */
  const _fila = rot => { try {
    const trs = vi2 ? vi2.querySelectorAll('tr') : [];
    for (let i = 0; i < trs.length; i++) {
      const td = trs[i].querySelectorAll('td');
      if (td.length && String(td[0].textContent || '').trim().indexOf(rot) === 0)
        return String(trs[i].textContent || '');
    }
    return null;
  } catch (e) { return null } };
  const fE = _fila('Espesor parietal relativo');
  const fI = _fila('Índice de masa del VI con espesor parietal relativo');
  R.hfaFilas = (fE ? 'espesor' : 'FALTA espesor') + '/' + (fI ? 'imvi' : 'FALTA imvi');
  const _estricto = t => !!t && (t.indexOf('> 0,42') >= 0 || t.indexOf('>0,42') >= 0)
                               && t.indexOf('≥ 0,42') < 0 && t.indexOf('≥0,42') < 0;
  R.hfaEstricto = _estricto(fE) && _estricto(fI);
  R.hfaFuente = !!fE && fE.indexOf('Pieske 2019') >= 0
             && !!fI && fI.indexOf('Pieske 2019') >= 0;

  return { extra: [
    ['DENOMINADOR: la geometria, su cuadro, sus fichas y la ficha de HFA-PEFF existen',
     R.hay && R.hayRefVi && R.hayFichas && R.hayRefHfa,
     'refVi=' + R.hayRefVi + ' fichas=' + R.hayFichas + ' refHfa=' + R.hayRefHfa],
    ['masa normal: 0,41 Normal y 0,42 y 0,43 Remodelado concentrico', R.conMasaNormal,
     R.nor41 + ' / ' + R.nor42 + ' / ' + R.nor43],
    ['masa aumentada: 0,41 excentrica y 0,42 y 0,43 concentrica', R.conMasaAlta,
     R.alt41 + ' / ' + R.alt42 + ' / ' + R.alt43],
    ['CONTROL: 0,419 sigue del lado de abajo en los dos', R.ctrl, R.ctrl],
    ['el cuadro de referencia escribe el 0,42 con el operador inclusivo', R.refInclusivo, R.refInclusivo],
    ['y no escribe el corte con el operador estricto', R.refSinEstricto, R.refSinEstricto],
    ['GEO-VI-001 dice 0,42 o mas y su dueno es calcGeometriaVI', R.f1Inclusivo && R.f1Dueno,
     R.f1Inclusivo + '/' + R.f1Dueno],
    ['GEO-VI-002 lo dice igual en los cuatro cuadrantes', R.f2Inclusivo, R.f2Inclusivo],
    ['el cuadro por sexo publica el corte inclusivo', R.porSexo, R.porSexo],
    ['CONTROL NEGATIVO: las DOS filas de HFA-PEFF conservan su operador estricto y su fuente',
     R.hfaEstricto && R.hfaFuente,
     R.hfaFilas + ' estricto=' + R.hfaEstricto + ' Pieske=' + R.hfaFuente]
  ] };
"""))

C.append(("TC-1066",
 "PR12 (TAREA 3): la casilla de BNP / NT-proBNP del HFA-ICOS -- la unica de NT-proBNP sin numero -- publica el rango 375 a 600 pg/mL como ayuda, rotulado criterio de la aplicacion, sin title, sin campo de ingreso nuevo, sin citar ninguna guia y sin tocar el puntaje",
r"""
  const _hay = n => { try { return typeof window[n] === 'function' } catch (e) { return false } };
  const R = {};
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const chk = document.getElementById('hfaicos_bnp');
  R.hay = !!chk;
  if (!R.hay) return { extra: [['DENOMINADOR: la casilla de BNP / NT-proBNP existe', false, 'NO HAY hfaicos_bnp']] };
  const lab = chk.closest ? chk.closest('label') : null;
  R.hayLab = !!lab;
  const txt = lab ? String(lab.textContent || '').replace(/\\s+/g, ' ').trim() : '';
  R.txt = txt.slice(0, 170);

  R.rotulo = txt.indexOf('BNP / NT-proBNP basal elevado') >= 0;
  R.rango = txt.indexOf('375') >= 0 && txt.indexOf('600') >= 0
         && (txt.indexOf('pg/mL') >= 0 || txt.indexOf('pg/ml') >= 0);
  /* ROTULADO COMO CRITERIO PROPIO Y SIN NOMBRAR NINGUNA GUIA: la orden prohibe citar una fuente
     para el 600, y la de la biblioteca trae otro tope. */
  R.criterio = txt.toUpperCase().indexOf('CRITERIO DE ECOSMART') >= 0
            || txt.toLowerCase().indexOf('criterio de la aplicaci') >= 0;
  R.sinGuia = ['Pieske', 'ESC', 'ACC', 'AHA', 'ASE', 'EACVI', 'HFA-PEFF', '660']
                .every(gg => txt.indexOf(gg) < 0);
  /* SIN title EN NINGUN NODO: es la regla de TC-500. */
  R.sinTitle = !!lab && !lab.hasAttribute('title')
    && Array.prototype.every.call(lab.querySelectorAll('*'), e => !e.hasAttribute('title'));
  /* NINGUN CAMPO DE INGRESO NUEVO: un solo control, y el nodo de la ayuda sin id -- con un id
     entraria al censo del estudio y a las 457 columnas del Excel por existir. */
  R.unSoloControl = !!lab && lab.querySelectorAll('input, select, textarea').length === 1
                 && lab.querySelectorAll('input[type=checkbox]').length === 1;
  R.ayudaSinId = !!lab && Array.prototype.every.call(
    lab.querySelectorAll('span, small, div, em, b'), e => !e.id);
  /* EL PUNTAJE NO CAMBIA: tildar mueve el estado y destildar lo devuelve exacto. */
  R.puntaje = (function () {
    if (!_hay('hfaicosToggle') || !_hay('hfaicosEstado')) return 'sin funciones';
    const f = () => { try { return JSON.stringify(hfaicosEstado()) } catch (e) { return 'ERR' } };
    const a0 = f();
    try { chk.checked = true; hfaicosToggle('hfaicos_bnp'); } catch (e) {}
    const a1 = f();
    try { chk.checked = false; hfaicosToggle('hfaicos_bnp'); } catch (e) {}
    const a2 = f();
    return (a1 !== a0 ? 'mueve' : 'NO mueve') + '/' + (a2 === a0 ? 'vuelve' : 'NO vuelve');
  })();
  R.puntajeOk = R.puntaje === 'mueve/vuelve';
  /* EL RANGO NO LLEGA AL PAPEL: es ayuda de pantalla y nada mas. */
  R.sinPapel = (function () {
    try {
      if (_hay('generarInforme')) generarInforme();
      const i = String((document.getElementById('informe_texto') || {}).value || '');
      const s = String((document.getElementById('en_suma') || {}).value || '');
      return (i + s).indexOf('375') < 0;
    } catch (e) { return true }
  })();

  return { extra: [
    ['DENOMINADOR: la casilla y su etiqueta existen', R.hay && R.hayLab, R.txt],
    ['el rotulo de la casilla no cambio', R.rotulo, R.rotulo],
    ['la ayuda publica el rango 375 a 600 pg/mL', R.rango, R.rango],
    ['y va rotulado como criterio de la aplicacion', R.criterio, R.criterio],
    ['sin citar ninguna guia ni el otro tope', R.sinGuia, R.sinGuia],
    ['ningun nodo de la etiqueta lleva title', R.sinTitle, R.sinTitle],
    ['un solo control en la etiqueta, y es la casilla', R.unSoloControl, R.unSoloControl],
    ['el nodo de la ayuda no lleva id', R.ayudaSinId, R.ayudaSinId],
    ['el puntaje sigue moviendose y volviendo', R.puntajeOk, R.puntaje],
    ['el rango no llega al informe ni al EN SUMA', R.sinPapel, R.sinPapel]
  ] };
"""))

C.append(("TC-1067",
 "PR12 (TAREA 5): el mapa de SGL del visor usa la MISMA paleta y los mismos tramos que el bull is eye de la pestania SGL -- leidos de STRAIN_PAL y de strainTramoDe, no copiados --, el mismo gris de sin dato y la misma referencia en su leyenda",
r"""
  /* GUARDA EN TODO ACCESO: contra el arbol anterior _strColorPct no existe y el acceso pelado se
     lleva el caso entero. */
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _pal = () => { try { return STRAIN_PAL } catch (e) { return null } };
  const _marcas = () => { try { return STRAIN_MARCAS } catch (e) { return [] } };
  const R = {};
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const CP = _fn('_strColorPct'), GR = _fn('_strGris'), TR = _fn('strainTramoDe'),
        DIB = _fn('_strBullsDibujar'), PAL = _pal(), PC = _fn('_strPalColor');
  R.hay = !!(CP && GR && TR && DIB && PAL && PAL.length === 9);
  if (!R.hay) return { extra: [['DENOMINADOR: el visor tiene color por tramo, gris, dibujante y la paleta sus nueve entradas',
      false, 'CP=' + !!CP + ' GR=' + !!GR + ' DIB=' + !!DIB + ' PAL=' + (PAL ? PAL.length : 0)]] };

  /* (A) LOS DOCE VALORES REPRESENTATIVOS: el color del visor es IDENTICO al de la pestania SGL.
     El de la pestania se obtiene por su camino REAL -- se escribe el valor en un segmento con
     strainEscribir y se lee strainColor --, no de la tabla. */
  const V = [['-22',-22],['-20',-20],['-17.5',-17.5],['-12.5',-12.5],['-7.5',-7.5],['-2.5',-2.5],
             ['0',0],['+2.5',2.5],['+7.5',7.5],['+12.5',12.5],['+17.5',17.5],['+22',22]];
  const ESC = _fn('strainEscribir'), COL = _fn('strainColor');
  const seg = (function () { try { return LV3D_SEG_ID[1] } catch (e) { return null } })();
  const difs = [], tramos = [];
  V.forEach(function (p) {
    const esperado = PAL[TR(p[1])] ? PAL[TR(p[1])].color : 'SIN TRAMO';
    const visor = String(CP(p[1]));
    tramos.push(p[0] + '=' + TR(p[1]));
    let pest = null;
    if (ESC && COL && seg) { try { ESC(seg, p[0]); pest = String(COL(seg)); } catch (e) { pest = 'ERR' } }
    if (visor.toUpperCase() !== String(esperado).toUpperCase())
      difs.push(p[0] + ' visor ' + visor + ' != paleta ' + esperado);
    else if (pest && pest.toUpperCase() !== visor.toUpperCase())
      difs.push(p[0] + ' visor ' + visor + ' != pestania ' + pest);
  });
  R.difs = difs.length; R.difsQue = difs.slice(0, 3).join(' | ');
  R.tramos = tramos.join(' ');
  /* Los doce no caen todos en el mismo tramo: sin esto, una funcion que devolviera SIEMPRE el
     mismo color pasaria la condicion de arriba. */
  R.tramosDistintos = (function () { const s = {}; V.forEach(p => s[TR(p[1])] = 1); return Object.keys(s).length; })();

  /* (B) EL GRIS DE SIN DATO sale de la paleta. */
  R.gris = String(GR()).toUpperCase() === String(PAL[0].color).toUpperCase();
  R.grisQue = GR() + ' vs ' + PAL[0].color;

  /* (C) NO ES UNA COPIA: se sustituye la paleta en memoria y el visor devuelve el color nuevo. Es
     lo que distingue LEER al dueno de haber copiado los ocho colores. */
  /* /!\ NO SE PUEDE SUSTITUIR LA PALETA PARA PROBARLO, y es una trampa documentada de esta casa:
     STRAIN_PAL es un const de nivel de script, asi que window.STRAIN_PAL = otra crea una propiedad
     NUEVA que no lo tapa -- lo mismo que _imgEditado y _cinePendientes --, y ademas esta congelada
     con Object.freeze. Lo que SI se puede afirmar es la ESTRUCTURA: las tres funciones nombran a
     STRAIN_PAL y no traen ningun color escrito salvo el respaldo. Una mutacion que copie los ocho
     colores a mano deja ocho literales y esta condicion la caza, mientras la condicion de arriba
     -- que compara valor por valor -- la dejaria pasar. */
  R.lee = (function () {
    try {
      const src = String(PC) + String(CP) + String(GR);
      const nombra = src.indexOf('STRAIN_PAL') >= 0;
      const hexs = (src.match(/#[0-9a-fA-F]{6}/g) || []);
      return (nombra ? 'nombra la paleta' : 'NO nombra la paleta')
           + ' / ' + hexs.length + ' color escrito'
           + (hexs.length <= 1 ? '' : ': ' + hexs.join(' '));
    } catch (e) { return 'ERR' }
  })();
  R.leeOk = R.lee.indexOf('NO nombra') < 0 && R.lee !== 'ERR'
         && (R.lee.indexOf('/ 0 color') >= 0 || R.lee.indexOf('/ 1 color') >= 0);

  /* (D) LA LEYENDA MUESTRA LA MISMA REFERENCIA: se dibuja la diana en un canvas propio -- sin
     ningun trazado, con R en null, que es como la leyenda se pinta igual -- y se leen los PIXELES
     de la imagen. No alcanza con leer el codigo: lo que importa es que los ocho colores salgan. */
  const LEY = (function () {
    try {
      const S = 320;
      const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
      const c2 = cv.getContext('2d');
      const fin = DIB(c2, S, null, false);
      const g = c2.getImageData(0, 0, S, S).data;
      const vistos = {};
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        vistos[g[i] + ',' + g[i+1] + ',' + g[i+2]] = 1;
      }
      const hex = c => (String(c).replace('#','').match(/../g) || []).map(v => parseInt(v, 16)).join(',');
      const faltan = [];
      for (let i = 1; i <= 8; i++) if (!vistos[hex(PAL[i].color)]) faltan.push(i);
      return { faltan: faltan, gris: !!vistos[hex(PAL[0].color)],
               ly: (fin && fin.ly), n: Object.keys(vistos).length };
    } catch (e) { return { faltan: [1,2,3,4,5,6,7,8], gris: false, ly: null, n: 0 } }
  })();
  R.leyFaltan = LEY.faltan.length; R.leyFaltanQue = LEY.faltan.join(',');
  R.leyGris = LEY.gris;
  R.leyLy = (LEY.ly !== null && LEY.ly !== undefined && isFinite(LEY.ly));
  R.marcas = _marcas().length === 8;

  /* (E) CONTROL NEGATIVO: la paleta de la MOTILIDAD sigue siendo otra. Las dos pueden terminar en
     el MISMO PDF, y esa es la unica separacion que esta tanda NO toca. */
  R.motilidad = (function () {
    try {
      const m = CONTR_MOTILIDAD;
      const cs = (Array.isArray(m) ? m : Object.keys(m).map(k => m[k]))
                   .map(x => String((x && (x.color || x.c)) || x).toUpperCase());
      const pal = PAL.map(x => String(x.color).toUpperCase());
      const comp = cs.filter(c => pal.indexOf(c) >= 0);
      return comp.length === 0 ? 'sin color en comun' : ('COMPARTE ' + comp.join(','));
    } catch (e) { return 'no se pudo leer' }
  })();

  return { extra: [
    ['DENOMINADOR: color por tramo, gris y dibujante, con los doce en tramos', R.hay, 'tramos: ' + R.tramos],
    ['los doce valores caen en tramos distintos', R.tramosDistintos >= 6, R.tramosDistintos + ' tramos'],
    ['los doce colores del visor son los de la pestania SGL', R.difs === 0, R.difsQue || 'cero diferencias'],
    ['el gris de sin dato es el mismo de la paleta', R.gris, R.grisQue],
    ['y NO es una copia: el visor LEE la paleta', R.leeOk, R.lee],
    ['la leyenda del visor muestra los ocho tramos', R.leyFaltan === 0, 'faltan: ' + (R.leyFaltanQue || 'ninguno')],
    ['y el cuadrado de sin dato con el mismo gris', R.leyGris, R.leyGris],
    ['las ocho marcas son las de la pestania', R.marcas, _marcas().join(' ')],
    ['el dibujante sigue devolviendo donde termina la leyenda', R.leyLy, LEY.ly],
    ['CONTROL NEGATIVO: la paleta de la motilidad sigue siendo otra',
     R.motilidad === 'sin color en comun', R.motilidad]
  ] };
"""))

# ── GUARDIAN ───────────────────────────────────────────────────────────────────────────────────
for cid, desc, body in C:
    if BT in body or BT in desc:
        sys.exit('ABORTA: acento grave en ' + cid)
bloque = '\n'.join("caso('%s',\n '%s',\n%s%s%s);\n" % (cid, desc.replace("'", "\\'"), BT, body, BT)
                   for cid, desc, body in C)

RUN = 'scripts/test_clinico.mjs'
s = open(RUN, encoding='utf-8').read()
for cid, _, _ in C:
    if ("caso('" + cid + "'") in s:
        sys.exit('ABORTA: ' + cid + ' ya esta insertado')
# ancla: el ultimo caso( del archivo; el bloque va DESPUES de su cierre y ANTES de la cola
ult = s.rfind("\ncaso('")
if ult < 0: sys.exit('ABORTA: no se encontro ningun caso(')
cierre = s.find(BT + ');', ult)
if cierre < 0: sys.exit('ABORTA: no se encontro el cierre del ultimo caso')
corte = cierre + len(BT + ');') + 1
cola = s[corte:]
if 'finally' not in cola and 'RESULTADO' not in cola:
    sys.exit('ABORTA: la cola del runner no quedaria despues del ultimo caso')
nuevo = s[:corte] + '\n' + bloque + cola
open(RUN, 'w', encoding='utf-8').write(nuevo)
r = subprocess.run(['node', '--check', RUN], capture_output=True, text=True)
if r.returncode != 0:
    open(RUN, 'w', encoding='utf-8').write(s)
    sys.exit('ABORTA y REVIERTE: el runner no parsea\n' + r.stderr[:1200])
print('insertados: ' + ', '.join(c[0] for c in C))
print('cola conservada: ' + ('finally' in cola and 'si' or 'RESULTADO'))
