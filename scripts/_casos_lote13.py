# -*- coding: utf-8 -*-
"""Genera los ocho casos del lote post-PR13 y los inserta en scripts/test_clinico.mjs.

GUARDIAN: el cuerpo de un caso es un TEMPLATE LITERAL, asi que un acento grave adentro lo cierra
antes de tiempo. Este script ABORTA si encuentra uno, verifica que la cola del runner siga despues
del ultimo caso y revierte si el archivo no parsea.
"""
import re, sys, subprocess, io
BT = chr(96)
C = []

# ──────────────────── TC-1072 · GRUPO A · el descargo de la captura ────────────────────
C.append(("TC-1072",
 "LOTE POST-PR13 (GRUPO A): el descargo quemado en la captura del mapa de strain se MIDE y se parte en los renglones que entran, con el texto ENTERO, sin un punto suspensivo y sin un solo texto fuera del canvas, en tres tamanios de imagen",
r"""
  /* GUARDA EN TODO ACCESO: contra el arbol anterior _STR_CAP_L1 no existe y un acceso pelado
     tira ReferenceError que se lleva el caso ENTERO -- la leccion de TC-827. */
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _v  = n => { try { return eval(n) } catch (e) { return undefined } };
  const R = { tams: [] };
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const DIB = _fn('_strBullsDibujar'), ENV = _fn('_strEnvolver');
  const L1 = _v('_STR_CAP_L1'), L2 = _v('_STR_CAP_L2');
  R.hay = !!(DIB && ENV && typeof L1 === 'string' && typeof L2 === 'string');
  if (!R.hay) return { extra: [['DENOMINADOR: el dibujante y las dos constantes del descargo existen',
                                false, 'dib=' + !!DIB + ' env=' + !!ENV + ' l1=' + (typeof L1)]] };
  const PAR = ['Anterior','Anteroseptal','Inferoseptal','Inferior','Inferolateral','Anterolateral'];
  const VAL = [-16.3,-30.1,-10.1,-11.4,-27.3,-23.1];
  const RES = { sgl: -19.7, nVistas: 3, etiqueta: 'SGL aproximado — 3 vistas, 6 paredes',
                terr: PAR.map((p, i) => ({ pared: p, pct: VAL[i], vista: 'a4c' })) };
  R.terr = RES.terr.length;
  [300, 640, 1000].forEach(S => {
    const cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    const c2 = cv.getContext('2d');
    const vistos = [];
    const orig = c2.fillText.bind(c2);
    c2.fillText = function (t, x, y) {
      vistos.push({ t: String(t), x: x, y: y, w: c2.measureText(String(t)).width });
      return orig(t, x, y);
    };
    const fin = DIB(c2, S, RES, true);
    /* FUERA DEL CANVAS: un canvas RECORTA EN SILENCIO, asi que lo que se cuenta es cada renglon
       dibujado contra los cuatro bordes. */
    const fuera = vistos.filter(x => (x.x - x.w / 2) < 0 || (x.x + x.w / 2) > S || x.y > S || x.y < 0);
    /* EL TEXTO ENTERO, palabra por palabra: los renglones del descargo -los que caen DESPUES de
       la base de la leyenda- unidos tienen que dar los dos textos completos. */
    const norm = t => String(t).replace(/\\s+/g, ' ').trim();
    const cuerpo = vistos.filter(x => x.y > fin.ly + 1);
    const unidos = norm(cuerpo.map(x => x.t).join(' '));
    const esperado = norm(L1) + ' ' + norm(L2 + RES.etiqueta + '.');
    R.tams.push({ S: S, fuera: fuera.length, entero: unidos === esperado,
                  susp: cuerpo.some(x => x.t.indexOf('…') >= 0),
                  nCap: (fin.capL1 || 0) + (fin.capL2 || 0),
                  maxW: Math.round(Math.max.apply(null, vistos.map(x => x.w))),
                  lyFin: Math.round(fin.lyFin || 0), r: Math.round(fin.r || 0) });
  });
  R.sinFuera = R.tams.every(t => t.fuera === 0);
  R.todosEnteros = R.tams.every(t => t.entero);
  R.sinSusp = R.tams.every(t => !t.susp);
  R.cabeAncho = R.tams.every(t => t.maxW < t.S);
  /* MARGENES PAREJOS, que es lo que la orden pide y lo que «no sale fuera» no alcanzaba a medir:
     con el ancho disponible igual al canvas los renglones caben justo y la condicion de arriba
     seguia pasando. */
  R.margen = R.tams.map(t => Math.round((t.S - t.maxW) / 2));
  R.hayMargen = R.margen.every(m => m >= 4);
  R.cabeAlto = R.tams.every(t => t.lyFin <= t.S);
  R.partio = R.tams.some(t => t.nCap > 2);
  R.radio = R.tams.every(t => t.r > 0);
  /* Y el dibujante PUBLICA cuantos renglones dibujo: sin eso, «se partio» no se puede medir. */
  R.publica = R.tams.every(t => t.nCap >= 2);
  return { extra: [
    ['DENOMINADOR: el dibujante y las dos constantes del descargo existen, con seis paredes',
      R.hay && R.terr === 6, 'terr=' + R.terr],
    ['CERO textos fuera del canvas en 300, 640 y 1000 px', R.sinFuera, JSON.stringify(R.tams)],
    ['el descargo sale ENTERO, palabra por palabra, en los tres', R.todosEnteros, JSON.stringify(R.tams)],
    ['y sin un solo punto suspensivo: no se perdio una palabra', R.sinSusp, JSON.stringify(R.tams)],
    ['ningun renglon es mas ancho que el canvas', R.cabeAncho, JSON.stringify(R.tams.map(t => t.maxW + '/' + t.S))],
    ['y queda margen a los DOS lados en los tres tamanios', R.hayMargen, JSON.stringify(R.margen)],
    ['y el ultimo renglon no se sale por abajo', R.cabeAlto, JSON.stringify(R.tams.map(t => t.lyFin + '/' + t.S))],
    ['el dibujante publica cuantos renglones dibujo', R.publica, JSON.stringify(R.tams.map(t => t.nCap))],
    ['y en algun tamanio el descargo se PARTIO en mas de dos renglones', R.partio,
      JSON.stringify(R.tams.map(t => t.nCap))],
    ['el diagrama sigue teniendo radio en los tres', R.radio, JSON.stringify(R.tams.map(t => t.r))]
  ] };
"""))

# ──────────────────── TC-1073 · GRUPO B · el copiado en pixeles ────────────────────
C.append(("TC-1073",
 "LOTE POST-PR13 (GRUPO B): el HTML que los dos botones copian declara el tamanio en PIXELES en cada bloque y ya no en puntos -- medido con el convertidor de Cocoa, 11pt se pega como 14,5 pt y 11px como 11 --, sin tocar la negrita, el subrayado ni las vinietas",
r"""
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _v  = n => { try { return eval(n) } catch (e) { return undefined } };
  const R = {};
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const HI = _fn('cuadInformeHTML'), HD = _fn('cuadTextoHTML'), CB = _fn('_cwB');
  const PT = _v('CW_PT'), FS = _v('CW_FS');
  R.hay = !!(HI && HD && CB && typeof PT === 'string');
  if (!R.hay) return { extra: [['DENOMINADOR: los dos armadores y el dueno del tamanio existen',
                                false, 'hi=' + !!HI + ' hd=' + !!HD + ' pt=' + (typeof PT)]] };
  __t.set('informe_texto', 'Ventriculo izquierdo de dimensiones normales.\\nFEVI 58 por ciento.');
  __t.set('en_suma', 'Estenosis aortica severa\\nFuncion sistolica conservada');
  [['ddvi','48'],['dsvi','30'],['fevi','58'],['ai_ap','36'],['tapse','22'],['ao_fc','70']]
    .forEach(p => { try { __t.set(p[0], p[1]) } catch (e) {} });
  const H1 = String(HD() || ''), H2 = String(HI() || '');
  R.largos = H1.length + '/' + H2.length;
  R.hayHtml = H1.length > 40 && H2.length > 40;
  /* EL DUENIO es uno y esta en pixeles. */
  R.pt = PT;
  R.enPx = /^[0-9.]+px$/.test(String(PT));
  R.fsUsaDueno = String(FS || '').indexOf(String(PT)) >= 0;
  /* NINGUN bloque con texto queda sin el tamanio, y ninguno declara puntos. */
  const tags = h => (String(h).match(/<[a-z]+[^>]*>/g) || []);
  const sin = [];
  [H1, H2].forEach(h => tags(h).forEach(t => { if (t.indexOf('font-size:' + PT) < 0) sin.push(t.slice(0, 50)); }));
  R.sin = sin.length;
  R.ceroPt = (H1 + H2).indexOf('pt;') < 0 && (H1 + H2).indexOf('11pt') < 0;
  /* UN SOLO tamanio. */
  const otros = [];
  [H1, H2].forEach(h => (String(h).match(/font-size:[^;"']+/g) || []).forEach(f => {
    if (f.replace(/\\s/g, '') !== 'font-size:' + PT) otros.push(f); }));
  R.otros = otros.length;
  /* LO QUE NO SE TOCO: negrita, subrayado y vinietas siguen, y la tipografia sigue sin fijarse. */
  R.negrita = (H1.match(/<b(\\s[^>]*)?>/g) || []).length > 0 && (H2.match(/<b(\\s[^>]*)?>/g) || []).length > 0;
  R.subrayado = (H2.match(/<u(\\s[^>]*)?>/g) || []).length > 0;
  R.vinietas = H2.indexOf('<ul') >= 0 && H2.indexOf('<li') >= 0;
  R.sinFamily = (H1 + H2).indexOf('font-family') < 0;
  /* Y el TEXTO LLANO sigue llano. */
  const T1 = String((_fn('cuadTexto') || (() => ''))() || '');
  const T2 = String((_fn('cuadInformeTexto') || (() => ''))() || '');
  R.llano = (T1 + T2).indexOf('font-size') < 0 && (T1 + T2).indexOf('style=') < 0;
  return { extra: [
    ['DENOMINADOR: los dos armadores devuelven HTML con el estudio sembrado', R.hay && R.hayHtml, R.largos],
    ['el dueno del tamanio declara PIXELES', R.enPx, String(R.pt)],
    ['y es UN SOLO dueno: el estilo lo lee de ahi', R.fsUsaDueno, String(FS)],
    ['ningun bloque con texto queda sin el tamanio', R.sin === 0, R.sin + ' sin: ' + sin.slice(0, 3).join(' | ')],
    ['y no queda un solo tamanio en PUNTOS en los dos HTML', R.ceroPt, R.ceroPt],
    ['no aparece ningun tamanio distinto del dueno', R.otros === 0, otros.slice(0, 3).join(' | ')],
    ['la negrita sigue en los dos HTML', R.negrita, R.negrita],
    ['el subrayado sigue en el informe', R.subrayado, R.subrayado],
    ['las vinietas siguen en el EN SUMA', R.vinietas, R.vinietas],
    ['y la tipografia sigue sin fijarse', R.sinFamily, R.sinFamily],
    ['el texto llano sigue siendo llano', R.llano, R.llano]
  ] };
"""))

# ──────────────────── TC-1074 · GRUPO C · el NT-proBNP y AF-4/AF-5 ────────────────────
C.append(("TC-1074",
 "LOTE POST-PR13 (GRUPO C): la casilla del marcador humoral basal deja de publicar un rango y dice el limite del laboratorio, con su globo que cita autor y anio, sin title y sin tildear el factor al abrirlo; y las tres frases de AF-4 y AF-5 salen de las notas del Simpson dejando lo que la fuente SI dice",
r"""
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _v  = n => { try { return eval(n) } catch (e) { return undefined } };
  const R = {};
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  try { showTab('cardioOnco'); } catch (e) {}
  const chk = document.getElementById('hfaicos_bnp');
  R.hayCasilla = !!chk;
  if (!R.hayCasilla) return { extra: [['DENOMINADOR: la casilla del marcador humoral existe', false, 'no esta']] };
  /* El bloque puede vivir dentro de un acordeon: sin abrirlo el globo mide 0x0, que se lee igual
     que «el globo no esta». */
  let n0 = chk.parentElement;
  while (n0 && n0 !== document.body) {
    try { if (getComputedStyle(n0).display === 'none') n0.style.display = ''; } catch (e) {}
    try { if (n0.tagName === 'DETAILS') n0.open = true; } catch (e) {}
    n0 = n0.parentElement;
  }
  const lab = chk.closest('label');
  const txt = lab ? String(lab.textContent || '').replace(/\\s+/g, ' ').trim() : '';
  R.txt = txt.slice(0, 120);
  R.sinRango = txt.indexOf('375') < 0 && txt.indexOf('600') < 0;
  R.conLimite = txt.indexOf('por encima del l') >= 0 && txt.indexOf('laboratorio local') >= 0;
  R.sinChip = txt.indexOf('CRITERIO DE ECOSMART') < 0;
  const g = lab ? lab.querySelector('[data-vinfo="hfaicos-bnp"]') : null;
  R.hayGlobo = !!g;
  R.sinTitle = g ? !g.hasAttribute('title') : null;
  const rg = g ? g.getBoundingClientRect() : null;
  R.caja = rg ? Math.round(rg.width) + 'x' + Math.round(rg.height) : 'no hay';
  R.tactil = !!(rg && rg.width >= 44 && rg.height >= 44);
  /* El globo esta en el registro y cita autor y anio, sin un numero. */
  const REG = _v('VINFO');
  const E = REG ? REG['hfaicos-bnp'] : null;
  R.enRegistro = !!E;
  const cuerpo = E ? String((E.lee || '') + ' ' + (E.fuente || '')) : '';
  R.citaLyon = cuerpo.indexOf('Lyon 2022') >= 0;
  R.globoSinNumero = cuerpo.indexOf('375') < 0 && cuerpo.indexOf('600') < 0;
  /* Y ABRIRLO NO TILDEA EL FACTOR: el boton vive dentro del label que envuelve la casilla. */
  if (g) {
    const antes = chk.checked;
    g.click();
    R.tildeo = (chk.checked !== antes);
    if (chk.checked !== antes) chk.checked = antes;
    try { if (_fn('vInfoCerrar')) vInfoCerrar(); } catch (e) {}
  }
  /* AF-4 (dos frases) y AF-5 (una) fuera, y lo que la fuente SI dice adentro. */
  const NN = _v('_SIMP_NOTAS_METODO');
  R.hayNotas = Array.isArray(NN);
  const todo = R.hayNotas ? NN.join(' | ') : '';
  R.nNotas = R.hayNotas ? NN.length : -1;
  R.af4a = todo.indexOf('depende de la geometr') < 0;
  R.af4b = todo.indexOf('por separado') < 0;
  R.af5 = todo.indexOf('valores normales con los que se clasifica') < 0;
  R.queda1 = todo.indexOf('producto cruzado') >= 0;
  R.queda2 = todo.indexOf('el más largo de las dos ventanas (Lang 2015)') >= 0;
  R.queda3 = todo.indexOf('Lang 2015 recomienda el biplano.') >= 0;
  R.queda4 = todo.indexOf('no se integra al informe ni va al PDF') >= 0;
  return { extra: [
    ['DENOMINADOR: la casilla existe, con su label y las notas del Simpson',
      R.hayCasilla && R.hayNotas, 'notas=' + R.nNotas],
    ['la ayuda de la casilla ya NO publica el rango', R.sinRango, R.txt],
    ['y dice el limite del laboratorio local', R.conLimite, R.txt],
    ['sin el chip de criterio propio, que ya no hace falta', R.sinChip, R.txt],
    ['la casilla gana su globo', R.hayGlobo, R.caja],
    ['que se toca en 44 px', R.tactil, R.caja],
    ['y NO lleva title, por la regla de los globos de esta casa', R.sinTitle === true, String(R.sinTitle)],
    ['el globo esta en el registro y cita autor y anio', R.enRegistro && R.citaLyon, cuerpo.slice(-40)],
    ['y no publica ningun numero', R.globoSinNumero, R.globoSinNumero],
    ['abrir el globo NO tildea el factor', R.tildeo === false, 'tildeo=' + R.tildeo],
    ['AF-4, frase de la geometria: fuera', R.af4a, R.af4a],
    ['AF-4, «por separado»: fuera', R.af4b, R.af4b],
    ['AF-5, los valores normales de biplano: fuera', R.af5, R.af5],
    ['y lo que la fuente SI dice se queda, en las cuatro notas',
      R.queda1 && R.queda2 && R.queda3 && R.queda4,
      [R.queda1, R.queda2, R.queda3, R.queda4].join(',')],
    ['las nueve notas siguen siendo nueve: no se borro una entrada', R.nNotas === 9, String(R.nNotas)]
  ] };
"""))

# ──────────────────── TC-1075 · GRUPO D · el retroceso ────────────────────
C.append(("TC-1075",
 "LOTE POST-PR13 (GRUPO D): retroceder con el dedo sobre lo dibujado quita los puntos hasta ahi y deja seguir desde ese punto -- se decide por cercania a un punto viejo y no por angulo, se mira ANTES de decimar, el ultimo tramo no cuenta, un trazo corto no se toca y el trazo cruzado vuelve al punto mas nuevo",
r"""
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _v  = n => { try { return eval(n) } catch (e) { return undefined } };
  const R = { pura: {}, gesto: {} };
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const F = _fn('medRetroIndice'), MV = _fn('_medAreaMove');
  const RAD = _v('MED_RETRO_RADIO'), SAL = _v('MED_RETRO_SALTO'), MIN = _v('MED_RETRO_MIN'),
        AYU = _v('MED_RETRO_AYUDA'), COMO = _v('_MED_COMO');
  R.hay = !!(F && MV && typeof RAD === 'number' && typeof AYU === 'string');
  if (!R.hay) return { extra: [['DENOMINADOR: la funcion del retroceso, el movedor y las constantes existen',
                                false, 'f=' + !!F + ' mv=' + !!MV + ' rad=' + (typeof RAD)]] };
  const recto = []; for (let i = 0; i < 20; i++) recto.push({ x: i * 5, y: 0 });
  R.pura.avanzar = F(recto, { x: 100, y: 0 });
  R.pura.volver = F(recto, { x: 60, y: 0 });
  R.pura.ultimoTramo = F(recto, { x: 90, y: 0 });
  /* El piso se prueba con SIETE puntos y no cinco: con cinco, el salto de cuatro ya deja el
     bucle sin recorrido y la condicion pasaba aunque el piso no existiera. */
  R.pura.corto = F(recto.slice(0, 7), { x: 0, y: 0 });
  R.pura.lejos = F(recto, { x: 60, y: 60 });
  R.pura.dentroDelRadio = F(recto, { x: 60, y: RAD - 1 });
  R.pura.fueraDelRadio = F(recto, { x: 60, y: RAD + 2 });
  const cruz = recto.concat([{ x: 95, y: 20 }, { x: 60, y: 20 }, { x: 60, y: 10 }]);
  R.pura.cruzado = F(cruz, { x: 60, y: 4 });
  /* EL GESTO. _medTrazo y _medHerr son ACCESORES sobre la vista activa -con set-, asi que se
     escriben por window; _medPuntoCanvas y _medPintar son declaraciones de funcion de nivel
     superior, o sea propiedades de window, y por eso se pueden tapar. Con un const no se podria. */
  const pc = window._medPuntoCanvas, pin = window._medPintar;
  let prox = null;
  window._medPuntoCanvas = () => prox;
  window._medPintar = () => {};
  window._medHerr = 'area';
  const ev = { preventDefault() {} };
  window._medTrazo = recto.slice(); prox = { x: 100, y: 0 }; MV(ev);
  R.gesto.avanzo = window._medTrazo.length;
  window._medTrazo = recto.slice(); prox = { x: 60, y: 0 }; MV(ev);
  R.gesto.retrocedio = window._medTrazo.length;
  R.gesto.ultimoX = window._medTrazo[window._medTrazo.length - 1].x;
  prox = { x: 70, y: 40 }; MV(ev);
  R.gesto.siguio = window._medTrazo.length;
  R.gesto.siguioY = window._medTrazo[window._medTrazo.length - 1].y;
  /* RETROCESO LENTO: a 1 px de un punto VIEJO. Con el orden al reves -decimar primero- esto no
     haria nada, que es la mitad que importa de este arreglo. */
  window._medTrazo = recto.slice(); prox = { x: 94, y: 0 }; MV(ev);
  R.gesto.lentoSobreUltimo = window._medTrazo.length;
  /* /!\ LA ESCENA DEL RETROCESO LENTO NECESITA UN TRAZO QUE VUELVA SOBRE SI MISMO: en un trazo
     recto, un punto cerca de un punto VIEJO esta lejos del ultimo, asi que la decimacion no lo
     descartaba y la mutacion que decima primero sobrevivia. Con un trazo en U el ultimo punto
     queda al lado de uno viejo, y ahi el ORDEN importa de verdad. */
  const uu = [];
  for (let i = 0; i < 12; i++) uu.push({ x: i * 5, y: 0 });
  for (let i = 0; i < 12; i++) uu.push({ x: 55 - i * 5, y: 3 });
  /* El punto tiene que estar a MENOS de 2 px del ultimo -ahi la decimacion lo descartaria- y a la
     vez dentro del radio de un punto viejo. (1,3) esta a 1 px del ultimo (0,3) y a 5 px de uu[1]. */
  window._medTrazo = uu.slice(); prox = { x: 1, y: 3 }; MV(ev);
  R.gesto.lentoEnU = window._medTrazo.length;
  R.gesto.largoU = uu.length;
  window._medTrazo = recto.slice(); prox = { x: 66, y: 1 }; MV(ev);
  R.gesto.lentoSobreViejo = window._medTrazo.length;
  window._medTrazo = null; prox = { x: 10, y: 10 };
  let tiro = false; try { MV(ev) } catch (e) { tiro = true }
  R.gesto.sinTrazo = !tiro && window._medTrazo === null;
  window._medPuntoCanvas = pc; window._medPintar = pin;
  /* La frase del gesto, con un solo dueno, en las CUATRO de contorno y en NINGUNA de clic. */
  R.ayudaContorno = ['area','strain','lars','vd'].every(k => String(COMO[k]).indexOf(AYU) >= 0);
  R.ayudaClic = ['vel','tiempo','fc','dist'].every(k => String(COMO[k]).indexOf(AYU) < 0);
  return { extra: [
    ['DENOMINADOR: la funcion pura, el movedor y las tres constantes existen', R.hay,
      [RAD, SAL, MIN].join('/')],
    ['avanzar no retrocede', R.pura.avanzar === -1, String(R.pura.avanzar)],
    ['volver sobre el camino retrocede', R.pura.volver > 0, String(R.pura.volver)],
    ['el tramo que se esta dibujando NO cuenta', R.pura.ultimoTramo === -1, String(R.pura.ultimoTramo)],
    ['con pocos puntos no hay camino al que volver', R.pura.corto === -1, String(R.pura.corto)],
    ['lejos del camino no retrocede', R.pura.lejos === -1, String(R.pura.lejos)],
    ['el radio manda por los dos lados', R.pura.dentroDelRadio > 0 && R.pura.fueraDelRadio === -1,
      R.pura.dentroDelRadio + ' / ' + R.pura.fueraDelRadio],
    ['con el trazo cruzado se vuelve al punto MAS NUEVO, no se borra entero',
      R.pura.cruzado >= 13, String(R.pura.cruzado)],
    ['por el gesto: avanzar AGREGA', R.gesto.avanzo === 21, String(R.gesto.avanzo)],
    ['por el gesto: retroceder RECORTA', R.gesto.retrocedio < 20 && R.gesto.ultimoX === 65,
      R.gesto.retrocedio + ' ultimo x=' + R.gesto.ultimoX],
    ['y desde ahi se SIGUE dibujando', R.gesto.siguio === R.gesto.retrocedio + 1 && R.gesto.siguioY === 40,
      R.gesto.siguio + ' y=' + R.gesto.siguioY],
    ['el retroceso se mira ANTES de decimar: sobre un punto viejo a 1 px SI retrocede',
      R.gesto.lentoSobreViejo < 20, String(R.gesto.lentoSobreViejo)],
    ['y con un trazo que vuelve sobre si mismo, un punto pegado al ultimo tambien retrocede',
      R.gesto.lentoEnU < R.gesto.largoU, R.gesto.lentoEnU + '/' + R.gesto.largoU],
    ['y sobre el ultimo a 1 px se decima y no pasa nada', R.gesto.lentoSobreUltimo === 20,
      String(R.gesto.lentoSobreUltimo)],
    ['sin trazo no hace nada y no tira', R.gesto.sinTrazo, R.gesto.sinTrazo],
    ['la frase del gesto esta en las CUATRO de contorno', R.ayudaContorno, R.ayudaContorno],
    ['y en NINGUNA de clic, donde no hay trazo al que volver', R.ayudaClic, R.ayudaClic]
  ] };
"""))

# ──────────────────── TC-1076 · GRUPO E · Cambiar vista ────────────────────
C.append(("TC-1076",
 "LOTE POST-PR13 (GRUPO E): «Cambiar vista» del strain del VI vuelve a la eleccion de ventana sin perder lo confirmado, con su salida sin elegir, preguntando cuando hay un trazado sin confirmar, y sin mezclar los valores de dos ventanas",
r"""
  /* /!\ EL CUERPO DEVUELVE UNA IIFE ASYNC, que es como los casos de esta casa esperan algo: el
     puente del arnes hace que preguntaProp devuelva una promesa, y su then corre en un
     microturno. Sin el envoltorio, el await de abajo da «await is only valid in async
     functions» y el caso cae por excepcion en vez de medir. */
  return (async () => {
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const R = { esc: [] };
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const PASO = _fn('_strainPaso'), PAN = _fn('_strainPanel'), INI = _fn('_strainIniciar'),
        CAMB = _fn('medStrainCambiarVista'), SEG = _fn('medStrainSeguirEnVista'),
        ELE = _fn('medStrainElegirVista'), OTRO = _fn('medStrainOtroLoop');
  R.hay = !!(PASO && PAN && INI && CAMB && SEG && ELE && OTRO);
  if (!R.hay) return { extra: [['DENOMINADOR: el paso, el panel y las cuatro funciones de ventana existen',
                                false, 'camb=' + !!CAMB + ' seg=' + !!SEG]] };
  window._medHerr = 'strain';
  INI();
  const S = window._strain;
  R.haySesion = !!S;
  if (!S) return { extra: [['DENOMINADOR: la sesion de strain arranca', false, 'no arranco']] };
  S.loopListo = true;
  const tz = c => ({ bordeCm: c, imagen: 'loop1', metodo: 'libre' });
  S.vistas.a4c.d = tz(9.1); S.vistas.a4c.s = tz(7.4);
  S.vista = 'a4c'; S.fase = 'd';
  const tiene = (h, id) => String(h).indexOf(id) >= 0;
  R.esc.push({ q: 'en una ventana', paso: PASO(), camb: tiene(PAN(), 'cine-str-cambiar'),
               seg: tiene(PAN(), 'cine-str-seguir') });
  CAMB();
  R.esc.push({ q: 'tras cambiar', paso: PASO(), seg: tiene(PAN(), 'cine-str-seguir'),
               a4c: !!(S.vistas.a4c.d && S.vistas.a4c.s),
               a4cD: S.vistas.a4c.d ? S.vistas.a4c.d.bordeCm : null,
               a2cVacia: !(S.vistas.a2c.d || S.vistas.a2c.s) });
  SEG();
  R.esc.push({ q: 'tras seguir', paso: PASO(), vista: S.vista });
  CAMB(); ELE('a2c');
  R.esc.push({ q: 'tras elegir otra', paso: PASO(), vista: S.vista,
               a4c: !!(S.vistas.a4c.d && S.vistas.a4c.s),
               a4cD: S.vistas.a4c.d ? S.vistas.a4c.d.bordeCm : null,
               a2cVacia: !(S.vistas.a2c.d || S.vistas.a2c.s) });
  /* CON un trazado sin confirmar: PREGUNTA y no cambia de paso si se dice que no.
     /!\\ SE MIDE SUSTITUYENDO window.confirm Y NO BUSCANDO EL OVERLAY, y es por el PUENTE del
     arnes: propPuenteOn -armado por omision en el reset- reemplaza preguntaProp por una que
     llama a confirm y NO crea ningun nodo, asi que buscar el cartel da cero sobre una app que
     pregunta bien. Es como los 239 casos de esta casa ya lo miden, y de paso mide las DOS
     ramas en vez de una. */
  S.pendiente = { bordeCm: 8.8 };
  const pasoAntes = PASO();
  const cfOrig = window.confirm;
  let msg = null;
  window.confirm = function (m) { msg = String(m == null ? '' : m); return false; };
  CAMB();
  await new Promise(r => setTimeout(r, 30));
  R.pregunto = msg != null;
  R.textoPreg = msg ? msg.replace(/\\s+/g, ' ').slice(0, 110) : null;
  R.nombraElTrazado = !!(msg && msg.indexOf('sin confirmar') >= 0 && msg.indexOf('se descarta') >= 0);
  R.diceQueNoSePierde = !!(msg && msg.indexOf('no se toca') >= 0);
  R.trasNo = { paso: PASO(), pend: !!S.pendiente };
  /* Y diciendo que SI, cambia y descarta el pendiente. */
  msg = null;
  window.confirm = function (m) { msg = String(m == null ? '' : m); return true; };
  CAMB();
  await new Promise(r => setTimeout(r, 30));
  R.trasSi = { paso: PASO(), pend: !!S.pendiente, elig: !!S.eligiendoVista,
               a4c: !!(S.vistas.a4c.d && S.vistas.a4c.s) };
  window.confirm = cfOrig;
  SEG();
  S.eligiendoVista = true;
  OTRO();
  R.trasOtroLoop = PASO();
  const e = R.esc;
  return { extra: [
    ['DENOMINADOR: la sesion arranca y las cuatro funciones existen', R.hay && R.haySesion, 'ok'],
    ['en una ventana el panel emite «Cambiar vista» y no la salida', e[0].camb && !e[0].seg,
      JSON.stringify(e[0])],
    ['«Cambiar vista» lleva a la eleccion de ventana', e[1].paso === 'vista', JSON.stringify(e[1])],
    ['y ahi aparece la salida sin elegir', e[1].seg, JSON.stringify(e[1])],
    ['lo confirmado NO se pierde: la ventana sigue con sus dos trazos y su largo',
      e[1].a4c && e[1].a4cD === 9.1, JSON.stringify(e[1])],
    ['la salida devuelve a trazar en la MISMA ventana', e[2].paso === 'trazar' && e[2].vista === 'a4c',
      JSON.stringify(e[2])],
    ['elegir otra ventana mueve el puntero', e[3].paso === 'trazar' && e[3].vista === 'a2c',
      JSON.stringify(e[3])],
    ['y los valores NO se mezclan: la primera sigue con lo suyo y la nueva sigue vacia',
      e[3].a4c && e[3].a4cD === 9.1 && e[3].a2cVacia, JSON.stringify(e[3])],
    ['con un trazado sin confirmar PREGUNTA', R.pregunto, R.textoPreg],
    ['y la pregunta nombra el trazado que se descarta', R.nombraElTrazado, R.textoPreg],
    ['y aclara que lo confirmado no se toca', R.diceQueNoSePierde, R.textoPreg],
    ['diciendo que NO, nada se toca: sigue en la ventana y el trazado sigue ahi',
      R.trasNo.paso === 'trazar' && R.trasNo.pend, JSON.stringify(R.trasNo)],
    ['diciendo que SI, va a la eleccion, descarta el pendiente y conserva lo confirmado',
      R.trasSi.paso === 'vista' && !R.trasSi.pend && R.trasSi.a4c, JSON.stringify(R.trasSi)],
    ['volver al paso del cineloop apaga la pantalla de eleccion', R.trasOtroLoop === 'loop',
      String(R.trasOtroLoop)]
  ] };
  })();
"""))

# ──────────────────── TC-1077 · GRUPO F · textos, signo y fuente ────────────────────
C.append(("TC-1077",
 "LOTE POST-PR13 (GRUPO F): el trazado del VD se pide del anillo tricuspideo lateral HASTA EL APEX -- la contradiccion con «no incluyas el septo» ya no esta --, el conducto y la contraccion salen con UN solo signo menos, y el nombre de la guia sale de los dos textos de pantalla y vive en el globo con autor, anio y folio",
r"""
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _v  = n => { try { return eval(n) } catch (e) { return undefined } };
  const R = {};
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const T = h => String(h || '').replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();
  const VDP = _fn('_vdPanel'), VDI = _fn('_vdIniciar'), LAP = _fn('_larsPanel'),
        LAI = _fn('_larsIniciar'), LAC = _fn('_larsCalcular');
  const NV = _v('_VD_NOTAS'), NL = _v('_LARS_NOTAS'), COMO = _v('_MED_COMO');
  R.hay = !!(VDP && VDI && LAP && LAI && LAC && Array.isArray(NV) && Array.isArray(NL));
  if (!R.hay) return { extra: [['DENOMINADOR: los dos paneles y las dos listas de notas existen',
                                false, 'nv=' + (NV && NV.length) + ' nl=' + (NL && NL.length)]] };
  /* ── EL VD ── */
  window._medHerr = 'vd';
  VDI();
  /* /!\ EL CUADRO DE REFERENCIAS DEL VD SOLO SE DIBUJA CON RESULTADO: sin sembrar los dos trazos,
     la condicion de que el folio no este en pantalla medía un panel que no publica ninguna
     referencia -- un denominador vacio. */
  window._vd.trazos.d = { bordeCm: 10.0, imagen: 'loop1', cmPorPx: 0.02 };
  window._vd.trazos.s = { bordeCm: 7.5, imagen: 'loop1', cmPorPx: 0.02 };
  const hv = T(VDP());
  R.vdConResultado = hv.indexOf('Strain VD pared libre') >= 0;
  R.vdSinSeptal = hv.indexOf('anillo septal') < 0;
  R.vdHastaApex = hv.indexOf('hasta el ápex del VD') >= 0;
  R.vdSigueSepto = hv.indexOf('No incluyas el septo') >= 0;
  R.vdSinGuia = hv.indexOf('ASE 2025') < 0 && hv.indexOf('folio 145') < 0 && hv.indexOf('Tabla 1') < 0;
  R.vdGlobo = String(VDP()).indexOf('data-med-info="vd-metodo"') >= 0;
  const nv = NV.join(' | ');
  R.vdCita = nv.indexOf('Mukherjee 2025') >= 0 && nv.indexOf('folio 145') >= 0;
  R.vdNotaSepto = nv.indexOf('El septo no entra') >= 0;
  R.vdAyuda = String(COMO.vd).indexOf('hasta el ápex') >= 0 && String(COMO.vd).indexOf('al septal') < 0;
  R.vdCorte = _v('VD_STRAIN_NORMAL');
  /* ── EL LARS ── */
  window._medHerr = 'lars';
  LAI();
  const L = window._lars;
  const mk = (c, cu) => ({ bordeCm: c, imagen: 'loop1', cmPorPx: 0.02, loop: 0, cuadro: cu,
                           pts: [{x:10,y:10},{x:60,y:20},{x:40,y:70}] });
  L.trazos.min = mk(8.0, 3); L.trazos.max = mk(11.0, 9); L.trazos.preA = mk(9.5, 14);
  const hl = T(LAP());
  R.larsSinGuia = hl.indexOf('ASE 2025') < 0;
  R.larsDescribe = hl.indexOf('normal 18 % o más') >= 0;
  R.larsGlobo = String(LAP()).indexOf('data-med-info="lars-metodo"') >= 0;
  const nl = NL.join(' | ');
  R.larsCita = nl.indexOf('Thomas 2025') >= 0 && nl.indexOf('folio 1007') >= 0 && nl.indexOf('folio 995') >= 0;
  R.larsCuerda = nl.indexOf('no se suma al per') >= 0;
  R.larsOndaP = nl.indexOf('empieza la onda P') >= 0;
  R.larsFA = nl.indexOf('fibrilación auricular') >= 0;
  R.larsCorte = _v('LARS_RESERVORIO_NORMAL');
  R.larsPasos = (_v('_LARS_PASOS') || []).length;
  /* La pre-contraccion EN EL PANEL. El paso solo se dibuja mientras FALTA un trazado: con los
     tres puestos el panel muestra el resultado y no la guia, que es el denominador. */
  L.trazos.preA = null; L.paso = 2;
  const hp = T(LAP());
  R.panelOndaP = hp.indexOf('empieza la onda P') >= 0;
  R.panelFA = hp.indexOf('fibrilaci') >= 0;
  L.trazos.preA = mk(9.5, 14);
  /* ── EL DOBLE SIGNO: orden INVERTIDO a proposito, con L3 por encima de L2. ── */
  L.trazos.min = mk(8.0, 3); L.trazos.max = mk(9.0, 9); L.trazos.preA = mk(12.5, 14);
  const RR = LAC();
  R.condNeg = RR ? RR.cond < 0 : null;
  R.ordenMal = RR ? !RR.ordenOk : null;
  const h2 = T(LAP());
  /* /!\ DOS MENOS SEGUIDOS, DE CUALQUIER CLASE: el defecto real mezcla el menos TIPOGRAFICO del
     texto con el ASCII que toFixed produce, y buscar dos tipograficos no lo veia. */
  const esMenos = c => c === '−' || c === '-' || c === '–';
  R.sinDobleMenos = (function () {
    for (let i = 1; i < h2.length; i++) if (esMenos(h2[i - 1]) && esMenos(h2[i])) return false;
    return true;
  })();
  R.avisaOrden = h2.indexOf('no están en el orden esperado') >= 0;
  return { extra: [
    ['DENOMINADOR: los dos paneles y las dos listas de notas existen',
      R.hay, 'nv=' + NV.length + ' nl=' + NL.length],
    ['el VD ya NO dice «hasta el anillo septal»', R.vdSinSeptal, hv.slice(0, 150)],
    ['y pide trazar hasta el APEX', R.vdHastaApex, hv.slice(0, 150)],
    ['el aviso de no incluir el septo SIGUE, y ya no se contradice', R.vdSigueSepto, R.vdSigueSepto],
    ['la ayuda de la herramienta dice lo mismo', R.vdAyuda, String(COMO.vd).slice(0, 110)],
    ['DENOMINADOR: el panel del VD publica su resultado, o sea su cuadro de referencias',
      R.vdConResultado, hv.slice(0, 110)],
    ['el nombre de la guia, su tabla y su folio salieron del texto de pantalla del VD', R.vdSinGuia,
      hv.slice(hv.indexOf('Normal'), hv.indexOf('Normal') + 110)],
    ['y viven en el globo del panel, con autor y anio', R.vdGlobo && R.vdCita, nv.slice(0, 120)],
    ['el corte del VD no se movio', R.vdCorte === -20, String(R.vdCorte)],
    ['el nombre de la guia salio tambien del texto de pantalla del LARS', R.larsSinGuia, hl.slice(0, 140)],
    ['que ahora DESCRIBE el valor', R.larsDescribe, hl.slice(0, 140)],
    ['y el globo del LARS cita autor, anio y los dos folios', R.larsGlobo && R.larsCita, nl.slice(0, 140)],
    ['el corte del reservorio no se movio', R.larsCorte === 18, String(R.larsCorte)],
    ['el globo explica que la cuerda del plano mitral no se suma al perimetro', R.larsCuerda, R.larsCuerda],
    ['la pre-contraccion se explica EN EL PANEL: el punto donde empieza la onda P', R.panelOndaP, hp.slice(0, 160)],
    ['y el panel avisa que sin electrocardiograma o en fibrilacion no se identifica', R.panelFA, R.panelFA],
    ['con el orden invertido el conducto sale negativo', R.condNeg && R.ordenMal,
      RR ? RR.cond.toFixed(2) : 'sin calculo'],
    ['y el texto lo publica con UN SOLO signo menos', R.sinDobleMenos, h2.slice(h2.indexOf('otras publ'), h2.indexOf('otras publ') + 90)],
    ['y el aviso de orden sigue avisando', R.avisaOrden, R.avisaOrden],
    ['los tres trazados siguen pidiendose: no se cambio cuantos son', R.larsPasos === 3, String(R.larsPasos)]
  ] };
"""))

# ──────────────────── TC-1078 · GRUPO F5 · cada trazo en su cuadro ────────────────────
C.append(("TC-1078",
 "LOTE POST-PR13 (GRUPO F5): cada contorno del LARS se dibuja SOLO en el cuadro en que se trazo -- en el cuadro de la AI minima sale la minima y nada mas -- y un trazo guardado sin cuadro, de antes del lote, se sigue mostrando",
r"""
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const R = { porCuadro: [] };
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const PIN = _fn('_medPintar'), LAI = _fn('_larsIniciar');
  R.hayFns = !!(PIN && LAI);
  if (!R.hayFns) return { extra: [['DENOMINADOR: el pintor y el iniciador del LARS existen', false,
                                   'pin=' + !!PIN + ' lai=' + !!LAI]] };
  /* Un contenedor propio con los dos canvas que el pintor busca por id: asi se cuenta lo
     DIBUJADO y no se afirma que el codigo contenga el predicado, que seria tautologico. */
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-4000px;top:0;width:400px;height:300px;';
  const base = document.createElement('canvas');
  base.id = 'cine-cv'; base.width = 400; base.height = 300;
  base.style.cssText = 'width:400px;height:300px;display:block;';
  const ov = document.createElement('canvas');
  ov.id = 'cine-med'; ov.width = 400; ov.height = 300;
  host.appendChild(base); host.appendChild(ov);
  document.body.appendChild(host);
  R.nodos = !!(document.getElementById('cine-med') && document.getElementById('cine-cv'));
  const ctx = ov.getContext('2d');
  let contornos = 0, rotulos = [];
  const bp = ctx.beginPath.bind(ctx), ft = ctx.fillText.bind(ctx);
  ctx.beginPath = function () { contornos++; return bp(); };
  ctx.fillText = function (t, x, y) { rotulos.push(String(t)); return ft(t, x, y); };
  window._medOn = true;
  window._medHerr = 'lars';
  LAI();
  const L = window._lars;
  const mk = (c, cu) => ({ bordeCm: c, imagen: 'loop1', cmPorPx: 0.02, loop: 0, cuadro: cu,
                           pts: [{x:10,y:10},{x:60,y:20},{x:40,y:70},{x:10,y:10}] });
  L.trazos.min = mk(8.0, 3); L.trazos.max = mk(11.0, 9); L.trazos.preA = mk(9.5, 14);
  window._cineDatos = { loops: [{ nombre: 'loop1', cuadros: 20 }], i: 0, cuadro: 3, timer: null };
  R.sembrado = !!(window._cineDatos && L.trazos.min && L.trazos.max && L.trazos.preA);
  [3, 9, 14, 7].forEach(c => {
    window._cineDatos.cuadro = c;
    contornos = 0; rotulos = [];
    try { PIN(); } catch (e) { R.errPintar = String(e && e.message || e).slice(0, 90); }
    R.porCuadro.push({ cuadro: c, n: contornos, rot: rotulos.filter(t => /AI m|pre-A/.test(t)) });
  });
  /* CONTROL: un trazo SIN cuadro -de antes de este lote- se sigue dibujando. */
  L.trazos.min.cuadro = null; L.trazos.min.loop = null;
  window._cineDatos.cuadro = 7;
  contornos = 0; rotulos = [];
  try { PIN(); } catch (e) {}
  R.viejo = { n: contornos, rot: rotulos.filter(t => /AI m|pre-A/.test(t)) };
  /* Y que el GUARDADO del cuadro salga del propio medidor del contorno, que es de donde sale
     todo: el caso siembra los trazos a mano, asi que sin esto la mutacion que deja de guardarlo
     sobrevive. Necesita una region medible, que es lo que la compuerta 2D exige. */
  const CL = _fn('_contornoLargo');
  window._cineDatos = { loops: [{ nombre: 'loop1', cuadros: 20,
      d: { regiones: [{ ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:400, y1:300, tipo:1 }] } }],
    i: 0, cuadro: 11, timer: null };
  const rr = CL ? CL([{x:20,y:20},{x:120,y:40},{x:80,y:140}], 'la aurícula') : null;
  R.guarda = rr ? { ok: !!rr.ok, cuadro: rr.ok ? rr.dato.cuadro : null,
                    loop: rr.ok ? rr.dato.loop : null,
                    motivo: rr.ok ? null : String(rr.motivo).slice(0, 70) } : 'sin funcion';
  try { document.body.removeChild(host); } catch (e) {}
  window._medOn = false;
  const p = R.porCuadro;
  const uno = (i, k) => p[i] && p[i].n === 1 && p[i].rot.length === 1 && p[i].rot[0].indexOf(k) === 0;
  return { extra: [
    ['DENOMINADOR: los dos canvas existen y los tres trazos estan sembrados en cuadros distintos',
      R.nodos && R.sembrado, JSON.stringify(p.map(x => x.cuadro))],
    ['en el cuadro de la AI minima se dibuja SOLO la minima', uno(0, 'AI mín.'), JSON.stringify(p[0])],
    ['en el de la maxima SOLO la maxima', uno(1, 'AI máx.'), JSON.stringify(p[1])],
    ['en el de la pre-contraccion SOLO la pre-contraccion', uno(2, 'pre-A'), JSON.stringify(p[2])],
    ['y en un cuadro sin ningun trazado no se dibuja ninguno', p[3] && p[3].n === 0, JSON.stringify(p[3])],
    ['CONTROL: un trazo guardado sin cuadro se sigue mostrando', R.viejo.n === 1,
      JSON.stringify(R.viejo)],
    ['y el pintor no tiro en ninguno de los cuatro cuadros', !R.errPintar, String(R.errPintar || 'sin error')],
    ['el cuadro lo GUARDA el propio medidor del contorno, que es de donde sale todo',
      !!(R.guarda && R.guarda.ok && R.guarda.cuadro === 11 && R.guarda.loop === 0),
      JSON.stringify(R.guarda)]
  ] };
"""))

# ──────────────────── TC-1079 · GRUPOS G y H ────────────────────
C.append(("TC-1079",
 "LOTE POST-PR13 (GRUPOS G y H): los iconos de la tabla de calculos miden 14 px con zona de toque de 44 y la flecha escribe el promedio en el campo de SGL global; y el visor gana pantalla completa con su boton debajo del de columna, controles que se esconden solos, pausa al tocar la imagen SOLO sin columna y nunca midiendo, y la barra espaciadora que respeta un boton enfocado",
r"""
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _v  = n => { try { return eval(n) } catch (e) { return undefined } };
  const R = { g: {}, h: {} };
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  /* ── GRUPO G: la tabla de calculos del SGL ── */
  try { showTab('contractilidad'); } catch (e) {}
  const SR = _fn('scRender'), SET = _fn('strainSet');
  const SEGID = _v('LV3D_SEG_ID');
  const caja = document.getElementById('sgl-calc');
  R.g.hay = !!(SR && SET && caja && Array.isArray(SEGID));
  if (R.g.hay) {
    try { SR(); } catch (e) {}
    let n0 = caja;
    while (n0 && n0 !== document.body) {
      try { if (getComputedStyle(n0).display === 'none') n0.style.display = ''; } catch (e) {}
      n0 = n0.parentElement;
    }
    /* La clave de un segmento es su NOMBRE y no su numero: sembrar con el indice deja los
       diecisiete sin dato y la flecha apagada, que se lee igual que «no escribe». */
    /* /!\ EL PROMEDIO TIENE QUE TENER DECIMALES: con los diecisiete en -16 el promedio es -16
       entero y el valor crudo y el redondeado se escriben igual, asi que la condicion no podia
       ver si el redondeo estaba. Doce en -16 y cinco en -15 dan -15,705..., que redondeado a un
       decimal es -15,7. */
    for (let i = 1; i <= 17; i++) { try { SET(SEGID[i], 2, i <= 12 ? -16 : -15) } catch (e) {} }
    try { SR(); } catch (e) {}
    const bs = Array.from(caja.querySelectorAll('button.sc-ico'));
    R.g.nBotones = bs.length;
    R.g.medidas = bs.slice(0, 4).map(b => {
      const r = b.getBoundingClientRect(), ca = getComputedStyle(b, '::after');
      return { caja: Math.round(r.width) + 'x' + Math.round(r.height),
               toque: ca.width + 'x' + ca.height, sinDisabled: !b.hasAttribute('disabled') };
    });
    R.g.chico = bs.every(b => { const r = b.getBoundingClientRect(); return r.width <= 20 && r.height <= 20; });
    R.g.tactil = bs.every(b => { const c = getComputedStyle(b, '::after');
      return parseFloat(c.width) >= 44 && parseFloat(c.height) >= 44; });
    R.g.sinDisabled = bs.every(b => !b.hasAttribute('disabled'));
    const campo = document.getElementById('sgl_gls') || document.getElementById('sgl');
    R.g.campo = campo ? campo.id : null;
    if (campo) campo.value = '';
    const calc = bs.filter(b => /^Calcular/.test(b.getAttribute('title') || ''));
    const fl0 = bs.filter(b => /SGL global/i.test(b.getAttribute('title') || ''));
    R.g.apagadaAntes = fl0.length ? fl0[0].getAttribute('aria-disabled') === 'true' : null;
    R.g.motivoEnTitle = fl0.length ? /hay que calcularlo/.test(fl0[0].getAttribute('title') || '') : null;
    if (calc.length) calc[0].click();
    const bs2 = Array.from(caja.querySelectorAll('button.sc-ico'));
    const fl = bs2.filter(b => /SGL global/i.test(b.getAttribute('title') || ''));
    R.g.encendidaDespues = fl.length ? fl[0].getAttribute('aria-disabled') !== 'true' : null;
    if (fl.length && campo) { fl[0].click(); R.g.escribio = String(campo.value || ''); }
  }
  /* ── GRUPO H: pantalla completa del visor ── */
  const AB = _fn('_cineAbrir'), FST = _fn('cineFsToggle'), FSS = _fn('cineFsSync'),
        FSA = _fn('cineFsActiva'), FSP = _fn('cineFsPausaToggle'), DESP = _fn('_cineFsDespertar');
  R.h.hayFns = !!(AB && FST && FSS && FSA && FSP && DESP);
  R.h.ms = _v('CINE_FS_OCULTAR_MS');
  if (R.h.hayFns) {
    const cvj = document.createElement('canvas'); cvj.width = 64; cvj.height = 48;
    const cj = cvj.getContext('2d'); cj.fillStyle = '#345'; cj.fillRect(0, 0, 64, 48);
    const url = cvj.toDataURL('image/jpeg', 0.8);
    AB([{ nombre: 'prueba.dcm', cuadros: 6,
          d: { frags: [url, url, url, url, url, url], cols: 64, filas: 48, msCuadro: 50,
               regiones: [{ ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:64, y1:48, tipo:1 }] } }]);
    const ov = document.getElementById('cine-ov');
    R.h.abierto = !!(ov && ov.style.display !== 'none');
    const bfs = document.getElementById('cine-fs'), bpan = document.getElementById('cine-pan');
    R.h.hayBoton = !!bfs;
    if (bfs && bpan) {
      const rf = bfs.getBoundingClientRect(), rp = bpan.getBoundingClientRect();
      /* /!\ «DEBAJO» SE MIDE POR EL ORDEN DEL DOM Y LA DIRECCION DEL RACIMO, no por sus bordes de arriba:
         con dos botones del mismo id -lo que una mutacion produce- getElementById devuelve uno de
         los dos y la comparacion de top pasa igual. El orden del DOM no se puede confundir, y
         el racimo en COLUMNA es lo que hace que «despues» signifique «debajo». */
      const hijos = Array.from(bfs.parentElement.children);
      const iFs = hijos.map(x => x.id).lastIndexOf('cine-fs');
      const iFs0 = hijos.map(x => x.id).indexOf('cine-fs');
      const iPan = hijos.map(x => x.id).indexOf('cine-pan');
      R.h.columna = getComputedStyle(bfs.parentElement).flexDirection;
      R.h.debajo = iFs0 > iPan && iFs === iFs0 && R.h.columna === 'column' && rf.top >= rp.top;
      R.h.indices = 'fs=' + iFs0 + ' pan=' + iPan + ' ultimoFs=' + iFs;
      R.h.mismoRacimo = bfs.parentElement === bpan.parentElement;
      R.h.orden = hijos.map(x => x.id).join(',');
      R.h.caja = Math.round(rf.width) + 'x' + Math.round(rf.height);
      R.h.tactil = rf.width >= 44 && rf.height >= 44;
      R.h.pressed = bfs.getAttribute('aria-pressed');
    }
    /* EL ESTADO LO DICE EL NAVEGADOR: sin pantalla completa, el sincronizador SACA la clase
       aunque alguien la haya puesto a mano. */
    R.h.activaAlAbrir = FSA();
    ov.classList.add('cine-fs');
    const ctrl = document.getElementById('cine-ctrl');
    R.h.hayCtrl = !!ctrl;
    R.h.ctrlFlota = ctrl ? getComputedStyle(ctrl).position : null;
    ov.classList.add('cine-fs-ocultos');
    R.h.ctrlSinToque = ctrl ? getComputedStyle(ctrl).pointerEvents : null;
    R.h.salidaVisible = bfs ? getComputedStyle(bfs).opacity : null;
    /* /!\ LA OPACIDAD TRANSICIONA, asi que una lectura inmediata devuelve el valor de ARRANQUE y
       da 1 aunque la regla la mande a 0. Lo que no transiciona es la REGLA: se lee de la hoja de
       estilos -la receta de MEDIR-4b- y se exige que el racimo de arriba a la derecha, el del
       boton de salida, NO este entre los que se esconden. */
    R.h.reglaOcultos = (function () {
      try {
        for (const h of Array.from(document.styleSheets)) {
          let rs; try { rs = h.cssRules } catch (e) { continue }
          for (const r of Array.from(rs || [])) {
            const t = String(r.selectorText || '');
            if (t.indexOf('cine-fs-ocultos') >= 0 && String(r.style && r.style.opacity) === '0') return t;
          }
        }
      } catch (e) {}
      return null;
    })();
    R.h.salidaFueraDeOcultos = !!(R.h.reglaOcultos && R.h.reglaOcultos.indexOf('imgbtns-tr') < 0);
    ov.classList.remove('cine-fs-ocultos');
    FSS();
    R.h.syncSaca = !ov.classList.contains('cine-fs');
    /* LA PAUSA, con sus tres guardas. */
    const D = window._cineDatos;
    R.h.hayDatos = !!D;
    R.h.conColumna = FSP(null);
    ov.classList.add('cine-sinpanel');
    const corria = !!(D && D.timer);
    R.h.sinColumna = FSP(null);
    R.h.cambioTimer = (!!(D && D.timer)) !== corria;
    const sen = document.getElementById('cine-fs-senial');
    R.h.senial = !!sen;
    R.h.senialSinToque = sen ? getComputedStyle(sen).pointerEvents : null;
    window._medOn = true;
    R.h.midiendo = FSP(null);
    window._medOn = false;
    ov.classList.remove('cine-sinpanel');
    /* LA BARRA ESPACIADORA, con teclado de verdad. El foco se SUELTA: document.body.focus() no
       mueve el foco -el body no es enfocable- y la guarda del boton cortaria con razon. */
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
    const a1 = !!(D && D.timer);
    const k1 = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true });
    document.dispatchEvent(k1);
    R.h.espacio = (!!(D && D.timer)) !== a1;
    R.h.espacioAtendido = k1.defaultPrevented;
    const a2 = !!(D && D.timer);
    if (bfs) bfs.focus();
    const k2 = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true });
    document.dispatchEvent(k2);
    R.h.espacioConBoton = (!!(D && D.timer)) !== a2;
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
    try { window._cineDetener(); } catch (e) {}
    try { if (_fn('cineCerrar')) cineCerrar(); } catch (e) {}
  }
  return { extra: [
    ['DENOMINADOR G: la tabla de calculos, su pintor y los ids de segmento existen', R.g.hay,
      'botones=' + R.g.nBotones],
    ['los iconos de la tabla se VEN chicos', R.g.chico, JSON.stringify(R.g.medidas)],
    ['y se TOCAN en 44 px por su pseudo-elemento', R.g.tactil, JSON.stringify(R.g.medidas)],
    ['ninguno lleva el atributo disabled: su clic dice el motivo', R.g.sinDisabled, R.g.sinDisabled],
    ['la flecha arranca apagada y el motivo vive en su title', R.g.apagadaAntes && R.g.motivoEnTitle,
      'apagada=' + R.g.apagadaAntes],
    ['tras calcular se enciende', R.g.encendidaDespues, 'encendida=' + R.g.encendidaDespues],
    ['y escribe el promedio REDONDEADO a un decimal en el campo de SGL global',
      R.g.escribio === '-15.7' && R.g.campo === 'sgl_gls', R.g.campo + ' = ' + R.g.escribio],
    ['DENOMINADOR H: las cinco funciones de pantalla completa existen y el visor abre',
      R.h.hayFns && R.h.abierto, 'ms=' + R.h.ms],
    ['el boton de pantalla completa existe, es UNICO y va DESPUES del de columna, en un racimo apilado',
      R.h.hayBoton && R.h.debajo, R.h.orden + ' | ' + R.h.indices + ' | ' + R.h.columna],
    ['en el mismo racimo y con area tactil de 44 px', R.h.mismoRacimo && R.h.tactil, R.h.caja],
    ['y nace con su aria-pressed puesto por el dueno del estado', R.h.pressed === 'false',
      String(R.h.pressed)],
    ['el autoocultado espera 3 segundos', R.h.ms === 3000, String(R.h.ms)],
    ['los controles flotan sobre la imagen', R.h.hayCtrl && R.h.ctrlFlota === 'absolute',
      String(R.h.ctrlFlota)],
    ['escondidos no reciben el toque', R.h.ctrlSinToque === 'none', String(R.h.ctrlSinToque)],
    ['y el boton de salida NO se esconde: su racimo no entra en la regla de los ocultos',
      R.h.salidaFueraDeOcultos, String(R.h.reglaOcultos || 'sin regla').slice(0, 140)],
    ['el estado lo dice el navegador: el sincronizador saca la clase', R.h.syncSaca, R.h.syncSaca],
    ['con la columna a la vista el clic sobre la imagen NO pausa', R.h.conColumna === false,
      String(R.h.conColumna)],
    ['sin columna SI pausa, y cambia el estado de la reproduccion',
      R.h.sinColumna === true && R.h.cambioTimer, String(R.h.sinColumna)],
    ['con su senial, que no recibe el toque', R.h.senial && R.h.senialSinToque === 'none',
      String(R.h.senialSinToque)],
    ['y mientras se mide NO pausa: el clic para medir sigue midiendo', R.h.midiendo === false,
      String(R.h.midiendo)],
    ['la barra espaciadora pausa y la atiende', R.h.espacio && R.h.espacioAtendido,
      'cambio=' + R.h.espacio],
    ['y con un boton enfocado no se la roba', R.h.espacioConBoton === false,
      String(R.h.espacioConBoton)]
  ] };
"""))

for cid, desc, body in C:
    if BT in body or BT in desc: sys.exit('ABORTA: acento grave en ' + cid)
bloque = '\n'.join("caso('%s',\n '%s',\n%s%s%s);\n" % (cid, desc.replace("'", "\\'"), BT, body, BT)
                   for cid, desc, body in C)
RUN = 'scripts/test_clinico.mjs'
s = io.open(RUN, encoding='utf-8').read()
for cid, _, _ in C:
    if ("caso('" + cid + "'") in s: sys.exit('ABORTA: ' + cid + ' ya esta insertado')
ult = s.rfind("\ncaso('")
if ult < 0: sys.exit('ABORTA: no se encontro ningun caso(')
cierre = s.find(BT + ');', ult)
if cierre < 0: sys.exit('ABORTA: no se encontro el cierre del ultimo caso')
corte = cierre + len(BT + ');') + 1
cola = s[corte:]
if 'finally' not in cola: sys.exit('ABORTA: la cola del runner no quedaria despues del ultimo caso')
io.open(RUN, 'w', encoding='utf-8').write(s[:corte] + '\n' + bloque + cola)
r = subprocess.run(['node', '--check', RUN], capture_output=True, text=True)
if r.returncode != 0:
    io.open(RUN, 'w', encoding='utf-8').write(s)
    sys.exit('ABORTA y REVIERTE: el runner no parsea\n' + r.stderr[:1500])
print('insertados: ' + ', '.join(c[0] for c in C))
