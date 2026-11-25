# -*- coding: utf-8 -*-
"""Genera los cuatro casos de PR13 y los inserta en scripts/test_clinico.mjs.

GUARDIAN: el cuerpo de un caso es un TEMPLATE LITERAL, asi que un acento grave adentro lo cierra
antes de tiempo. Este script ABORTA si encuentra uno, verifica que la cola del runner siga despues
del ultimo caso y revierte si el archivo no parsea.
"""
import re, sys, subprocess, io
BT = chr(96)
C = []

# ─────────────────────────── TC-1068 · LA LEYENDA ───────────────────────────
C.append(("TC-1068",
 "PR13 (TAREA 1): la leyenda del mapa del visor lleva los NUEVE rotulos en los bordes entre cuadritos -- con los dos extremos diciendo que la escala acota --, el cuadrado de sin dato en su propia fila y el texto explicativo ENTERO en hasta dos renglones dentro del canvas",
r"""
  /* GUARDA EN TODO ACCESO: contra el arbol anterior (e4ee124) _strBordes no existe y un acceso
     pelado tira ReferenceError que se lleva el caso ENTERO -- la leccion de TC-827. */
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _v  = n => { try { return eval(n) } catch (e) { return undefined } };
  const R = {};
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const DIB = _fn('_strBullsDibujar'), BOR = _fn('_strBordes'), AG = _fn('_strAgregar'),
        TR = _fn('strainTramoDe'), CP = _fn('_strColorPct'), GR = _fn('_strGris');
  const PAL = _v('STRAIN_PAL'), MAR = _v('STRAIN_MARCAS');
  R.hay = !!(DIB && BOR && AG && TR && CP && GR && PAL && MAR);
  if (!R.hay) return { extra: [['DENOMINADOR: el dibujante y los nueve bordes existen', false,
      'DIB=' + !!DIB + ' BOR=' + !!BOR + ' PAL=' + (PAL ? PAL.length : 0)]] };

  /* (A) LOS NUEVE ROTULOS, DERIVADOS DE SUS DUENIOS Y NO ESCRITOS. Las ocho marcas son el borde
     izquierdo de cada tramo y el noveno es el borde derecho del ultimo. */
  const bor = BOR();
  R.nueve = bor.length === 9;
  R.rotulos = bor.join(' ');
  R.derivados = (function () {
    const esp = MAR.map(function (x, i) {
      const t = (x > 0 ? '+' : (x < 0 ? '−' : '')) + Math.abs(x);
      return i === 0 ? ('≤ ' + t) : t;
    });
    return esp.every(function (t, i) { return bor[i] === t });
  })();
  /* (B) LOS DOS EXTREMOS ACOTAN, Y LA MEDICION LO JUSTIFICA: lo que cae por debajo de -20 y por
     encima de +20 toma el color del primer y del ultimo tramo. */
  R.acotan = bor[0].indexOf('≤') === 0 && bor[8].indexOf('≥') === 0;
  R.clampAbajo = TR(-20.01) === 1 && TR(-25) === 1 && TR(-30.1) === 1 && TR(-20) === 1;
  R.clampArriba = TR(20) === 8 && TR(20.01) === 8 && TR(30.1) === 8;
  R.mismoColorQue16 = String(CP(-30.1)) === String(CP(-16));

  /* (C) EL DIBUJO: se instrumenta el contexto para registrar CADA texto con su rectangulo REAL.
     Es lo que el pedido llama verificar con rectangulos y no con CSS. */
  const vals = [-16.3, -30.1, -10.1, -11.4, -27.3, -23.1];
  const nom  = ['Inferoseptal','Anterolateral','Inferior','Anterior','Anteroseptal','Inferolateral'];
  const vis  = ['a4c','a4c','a2c','a2c','a3c','a3c'];
  const RES = AG(vals.map(function (p, i) {
    return { vista: vis[i], pared: nom[i], pct: p, ld: 100, ls: 100 + p } }));
  const medir = function (S, conTitulo) {
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const g = cv.getContext('2d');
    const T = [];
    const ft = g.fillText.bind(g);
    g.fillText = function (t, x, y) {
      let w = 0; try { w = g.measureText(t).width } catch (e) {}
      const al = g.textAlign, bl = g.textBaseline;
      const mm = String(g.font).match(/(\\d+(?:\\.\\d+)?)px/);
      const px = parseFloat(mm ? mm[1] : 10);
      const x0 = al === 'center' ? x - w/2 : (al === 'right' ? x - w : x);
      const top = bl === 'middle' ? y - px*0.39 : y - px*0.8;
      const bot = bl === 'middle' ? y + px*0.39 : y + px*0.22;
      T.push({ t: String(t), x0: x0, x1: x0 + w, top: top, bot: bot, w: w });
      return ft(t, x, y);
    };
    const fin = DIB(g, S, RES, conTitulo);
    g.fillText = ft;
    return { S: S, T: T, fin: fin };
  };
  const M3 = medir(300, false), M6 = medir(640, true);

  /* Los nueve rotulos DIBUJADOS, en orden, sin pisarse y centrados en los nueve bordes. */
  const chequear = function (M) {
    const S = M.S, lw = S * 0.70, lx = S/2 - lw/2, bw = lw / 8;
    const rot = M.T.filter(function (t) { return bor.indexOf(t.t) >= 0 })
                   .sort(function (a, b) { return a.x0 - b.x0 });
    let pisan = 0;
    for (let i = 0; i + 1 < rot.length; i++) if (rot[i].x1 > rot[i+1].x0) pisan++;
    const enBorde = rot.length === 9 && rot.every(function (t) {
      const c = (t.x0 + t.x1)/2, i = bor.indexOf(t.t);
      return Math.abs(c - (lx + bw*i)) < 1.2;
    });
    const expl = M.T.filter(function (t) { return t.t.indexOf('referencia de colores') >= 0
                                               || t.t.indexOf('severidad') >= 0 });
    const texto = expl.map(function (t) { return t.t }).join(' ');
    const fuera = M.T.filter(function (t) { return t.x0 < -0.5 || t.x1 > S + 0.5
                                                || t.bot > S + 0.5 || t.top < -0.5 });
    const gris = M.T.filter(function (t) { return t.t === 'sin datos' });
    const rotY = rot.length ? rot[0].bot : 0;
    return { nRot: rot.length, pisan: pisan, enBorde: enBorde,
             explRenglones: expl.length, explTexto: texto,
             explCompleto: texto.indexOf('no grad') >= 0 && texto.indexOf('severidad') >= 0,
             explDentro: expl.length > 0 && expl.every(function (t) { return t.x0 >= 0 && t.x1 <= S }),
             explCentrado: expl.length > 0 && expl.every(function (t) { return Math.abs((t.x0+t.x1)/2 - S/2) < 1.2 }),
             grisEnSuFila: gris.length === 1 && gris[0].top > rotY,
             fuera: fuera.map(function (t) { return t.t }),
             ly: M.fin ? M.fin.ly : null,
             descargoEntra: M.fin ? (M.fin.ly + 28*M.fin.esc + 2 <= S) : false };
  };
  R.p = chequear(M3); R.c = chequear(M6);

  /* (D) EL ESPACIO DE DIBUJO NO DEPENDE DEL ANCHO DE LA VENTANA, y eso es lo que hace que los
     tres anchos del pedido den lo mismo: el canvas dibuja siempre en S unidades y el CSS lo
     escala con max-width. Se afirma la propiedad, y la medicion en los tres anchos esta en
     scripts/_probe_pr13.mjs y en scripts/_probe_pr13dom.mjs. */
  R.escalaPorCss = (function () {
    try {
      const m = String(_v('_strBullsRepintar'));
      return m.indexOf('max-width') >= 0 || m.indexOf('style.width') >= 0;
    } catch (e) { return false }
  })();

  return { extra: [
    ['DENOMINADOR: el dibujante, los nueve bordes y la paleta existen', R.hay, R.rotulos],
    ['los rotulos son NUEVE y salen de STRAIN_MARCAS, no escritos', R.nueve && R.derivados, R.rotulos],
    ['los dos extremos dicen que la escala acota', R.acotan, bor[0] + ' .. ' + bor[8]],
    ['y la medicion lo justifica: por debajo de -20 cae en el tramo 1', R.clampAbajo && R.mismoColorQue16,
      'clamp=' + R.clampAbajo + ' mismoColorQue-16=' + R.mismoColorQue16],
    ['y por encima de +20, en el 8', R.clampArriba, R.clampArriba],
    ['los nueve se dibujan EN EL BORDE entre cuadritos y no en el centro', R.p.enBorde && R.c.enBorde,
      'pantalla=' + R.p.nRot + ' captura=' + R.c.nRot],
    ['y no se pisan entre si', R.p.pisan === 0 && R.c.pisan === 0, R.p.pisan + '/' + R.c.pisan],
    ['el cuadrado de sin dato queda en su PROPIA fila', R.p.grisEnSuFila && R.c.grisEnSuFila,
      R.p.grisEnSuFila + '/' + R.c.grisEnSuFila],
    ['el texto explicativo sale ENTERO en hasta dos renglones', R.p.explCompleto && R.c.explCompleto
      && R.p.explRenglones <= 2 && R.c.explRenglones <= 2, R.p.explRenglones + ' renglones: ' + R.p.explTexto],
    ['centrado y sin cortarse a ningun lado', R.p.explDentro && R.p.explCentrado && R.c.explDentro && R.c.explCentrado,
      R.p.explDentro + '/' + R.c.explDentro],
    ['nada queda fuera del canvas, en los dos tamanios', R.p.fuera.length === 0 && R.c.fuera.length === 0,
      R.p.fuera.concat(R.c.fuera).join(' | ') || 'nada'],
    ['y en la captura las dos lineas del descargo siguen entrando', R.c.descargoEntra, R.c.ly],
    ['el canvas se escala por CSS, asi que el dibujo no depende del ancho de la ventana', R.escalaPorCss, R.escalaPorCss]
  ] };
"""))

# ─────────────────────────── TC-1069 · LOS SEIS SECTORES ───────────────────────────
C.append(("TC-1069",
 "PR13 (TAREA 2): el mapa del visor son SEIS sectores -- uno por pared, del disco al borde, sin anillos --, cada uno con el color que la pestania SGL da a su valor, su nombre y su numero con coma DENTRO del sector, el gris con Sin dato, el disco con 17 y el pie diciendo cuantas vistas y cuantas paredes",
r"""
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _v  = n => { try { return eval(n) } catch (e) { return undefined } };
  const R = {};
  __t.limpiar();
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const DIB = _fn('_strBullsDibujar'), AG = _fn('_strAgregar'), CP = _fn('_strColorPct'),
        GR = _fn('_strGris'), TR = _fn('strainTramoDe'), ESC = _fn('strainEscribir'), COL = _fn('strainColor');
  const SEC = _v('_STR_SECTORES'), RD = _v('_STR_R_DISCO');
  R.hay = !!(DIB && AG && CP && GR && SEC && SEC.length === 6 && typeof RD === 'number');
  R.anillosRetirados = (_v('_STR_ANILLOS') === undefined) && (_v('_STR_SEG_FUENTE') === undefined)
                    && (_v('_STR_SEG_ROTULO') === undefined);
  if (!R.hay) return { extra: [['DENOMINADOR: hay SEIS sectores y un disco central', false,
      'SEC=' + (SEC ? SEC.length : 0) + ' RD=' + RD]] };

  R.paredes = SEC.map(function (s) { return s.pared }).join(',');
  R.angulos = SEC.map(function (s) { return s.a[1] - s.a[0] }).join(',');
  R.sesenta = SEC.every(function (s) { return s.a[1] - s.a[0] === 60 });
  R.anteriorArriba = SEC[0].pared === 'Anterior' && SEC[0].a[0] === 330 && SEC[0].a[1] === 390;

  const vals = [-16.3, -30.1, -10.1, -11.4, -27.3, -23.1];
  const nom  = ['Inferoseptal','Anterolateral','Inferior','Anterior','Anteroseptal','Inferolateral'];
  const vis  = ['a4c','a4c','a2c','a2c','a3c','a3c'];
  const mkT = n => vals.slice(0, n).map(function (p, i) {
    return { vista: vis[i], pared: nom[i], pct: p, ld: 100, ls: 100 + p } });
  const RES = AG(mkT(6)), RES4 = AG(mkT(4));

  /* El color que la PESTANIA da a cada valor, por su camino real: se escribe el numero en un
     segmento y se lee strainColor. Es el cruce que el pedido pide. */
  const seg = (function () { try { return LV3D_SEG_ID[1] } catch (e) { return null } })();
  const colorDeLaPestania = function (p) {
    if (!(ESC && COL && seg)) return null;
    try { ESC(seg, (p > 0 ? '+' : '') + p); return String(COL(seg)); } catch (e) { return 'ERR' }
  };

  const medir = function (S, conTitulo, Rs) {
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const g = cv.getContext('2d');
    const T = [];
    const ft = g.fillText.bind(g);
    g.fillText = function (t, x, y) {
      let w = 0; try { w = g.measureText(t).width } catch (e) {}
      const al = g.textAlign, bl = g.textBaseline;
      const mm = String(g.font).match(/(\\d+(?:\\.\\d+)?)px/);
      const px = parseFloat(mm ? mm[1] : 10);
      const x0 = al === 'center' ? x - w/2 : (al === 'right' ? x - w : x);
      const top = bl === 'middle' ? y - px*0.39 : y - px*0.8;
      const bot = bl === 'middle' ? y + px*0.39 : y + px*0.22;
      T.push({ t: String(t), x0: x0, x1: x0 + w, top: top, bot: bot, w: w });
      return ft(t, x, y);
    };
    const fin = DIB(g, S, Rs, conTitulo);
    g.fillText = ft;
    const d = g.getImageData(0, 0, S, S).data;
    const pix = function (x, y) { const i = ((y|0)*S + (x|0))*4; return d[i] + ',' + d[i+1] + ',' + d[i+2] };
    const hex = function (c) { return (String(c).replace('#','').match(/../g) || [])
      .map(function (v) { return parseInt(v, 16) }).join(',') };
    const porPared = {}; if (Rs) Rs.terr.forEach(function (t) { porPared[t.pared] = t });
    const sobreTexto = function (X, Y) { return T.some(function (t) {
      return X >= t.x0 - 1.5 && X <= t.x1 + 1.5 && Y >= t.top - 1.5 && Y <= t.bot + 1.5 }) };
    const enSector = function (x, y, a0, a1) {
      const dx = x - fin.cx, dy = y - fin.cy, dd = Math.sqrt(dx*dx + dy*dy);
      if (dd < fin.rIn || dd > fin.r) return false;
      const gg = (Math.atan2(dy, dx) * 180/Math.PI + 90 + 720) % 360;
      return (gg >= a0 && gg <= a1) || (gg + 360 >= a0 && gg + 360 <= a1);
    };
    const out = SEC.map(function (sc) {
      const am = ((sc.a[0] + sc.a[1])/2 - 90) * Math.PI/180;
      /* CRUZA LAS DOS FRONTERAS QUE TENIAN LOS ANILLOS -0,47 y 0,72- y descarta las muestras que
         caen sobre un texto: si quedara un anillo, dos de estas darian colores distintos. */
      const pts = [0.28,0.33,0.40,0.63,0.68,0.90,0.96]
        .map(function (f) { return { x: fin.cx + Math.cos(am)*fin.r*f, y: fin.cy + Math.sin(am)*fin.r*f } })
        .filter(function (p) { return !sobreTexto(p.x, p.y) });
      const cols = pts.map(function (p) { return pix(p.x, p.y) });
      const t = porPared[sc.pared];
      const espVisor = t ? hex(CP(t.pct)) : hex(GR());
      const espPest = t ? hex(colorDeLaPestania(t.pct)) : null;
      /* El nombre y el numero del sector, y si sus CUATRO esquinas entran en el poligono. */
      const rango = fin.r - fin.rIn;
      const ptsTxt = [fin.rIn + rango*0.72, fin.rIn + rango*0.36].map(function (rho) {
        return { x: fin.cx + Math.cos(am)*rho, y: fin.cy + Math.sin(am)*rho } });
      const mios = T.filter(function (tt) { return ptsTxt.some(function (p) {
        return Math.abs((tt.x0+tt.x1)/2 - p.x) < 1.5 && Math.abs((tt.top+tt.bot)/2 - p.y) < 1.5 }) });
      const entran = mios.length === 2 && mios.every(function (tt) {
        return [[tt.x0,tt.top],[tt.x1,tt.top],[tt.x0,tt.bot],[tt.x1,tt.bot]]
          .every(function (q) { return enSector(q[0], q[1], sc.a[0], sc.a[1]) }) });
      return { pared: sc.pared, nMuestras: cols.length,
               unSoloColor: cols.length >= 4 && cols.every(function (c) { return c === cols[0] }),
               color: cols[0], esperadoVisor: espVisor, esperadoPestania: espPest,
               igualAlVisor: cols[0] === espVisor,
               igualALaPestania: espPest === null || cols[0] === espPest,
               textos: mios.map(function (tt) { return tt.t }), textoEntra: entran };
    });
    const disco = pix(fin.cx + fin.rIn*0.45, fin.cy + fin.rIn*0.45);
    return { S: S, sect: out, disco: disco, grisEsperado: hex(GR()),
             hay17: T.some(function (t) { return t.t === '17' }),
             sinDato: T.filter(function (t) { return t.t === 'Sin dato' }).length,
             pie: T.map(function (t) { return t.t }).filter(function (t) { return t.indexOf('SGL') === 0 || t.indexOf('pared') >= 0 }) };
  };

  const M3 = medir(300, false, RES), M6 = medir(640, true, RES), M4 = medir(300, false, RES4);
  const todos = function (M, k) { return M.sect.every(function (x) { return x[k] }) };
  R.unSolo = todos(M3,'unSoloColor') && todos(M6,'unSoloColor') && todos(M4,'unSoloColor');
  R.colorVisor = todos(M3,'igualAlVisor') && todos(M6,'igualAlVisor') && todos(M4,'igualAlVisor');
  R.colorPest = todos(M3,'igualALaPestania') && todos(M6,'igualALaPestania');
  R.textoEntra = todos(M3,'textoEntra') && todos(M6,'textoEntra') && todos(M4,'textoEntra');
  R.malTexto = M3.sect.concat(M6.sect).filter(function (x) { return !x.textoEntra })
                 .map(function (x) { return x.pared + ':' + x.textos.join('+') }).join(' | ');
  R.discoGris = M3.disco === M3.grisEsperado && M6.disco === M6.grisEsperado;
  R.hay17 = M3.hay17 && M6.hay17;
  R.sinDato6 = M3.sinDato === 0; R.sinDato4 = M4.sinDato === 2;
  R.coma = M3.sect.filter(function (x) { return x.textos.some(function (t) { return t.indexOf(',') >= 0 }) }).length;
  R.conPunto = M3.sect.filter(function (x) { return x.textos.some(function (t) {
    return /\\d\\.\\d/.test(t) }) }).length;
  R.pie = M3.pie.join(' | ');
  R.pieDice = M3.pie.some(function (t) { return t.indexOf('3 vistas') >= 0 && t.indexOf('6 paredes') >= 0
    && t.indexOf('el ápex (17) no lo mide este método') >= 0 });
  R.pie4 = M4.pie.some(function (t) { return t.indexOf('4 paredes') >= 0 });

  return { extra: [
    ['DENOMINADOR: hay SEIS sectores, uno por pared, y un disco central', R.hay, R.paredes],
    ['PR13: los anillos y el reparto por segmento SE RETIRARON', R.anillosRetirados, R.anillosRetirados],
    ['cada sector mide 60 grados y Anterior va arriba', R.sesenta && R.anteriorArriba, R.angulos],
    ['cada sector es de UN SOLO color del disco al borde -- sin anillos', R.unSolo,
      M3.sect.map(function (x) { return x.pared + ':' + x.nMuestras }).join(' ')],
    ['y ese color es el que la paleta da a su valor', R.colorVisor,
      M3.sect.map(function (x) { return x.color + (x.igualAlVisor ? '' : '!=' + x.esperadoVisor) }).join(' ')],
    ['CRUZADO contra la pestania SGL: el mismo valor, el mismo color', R.colorPest,
      M3.sect.map(function (x) { return x.esperadoPestania }).join(' ')],
    ['el nombre y el numero entran DENTRO del poligono del sector', R.textoEntra, R.malTexto || 'los doce entran'],
    ['el numero va con COMA, como la pestania', R.coma === 6 && R.conPunto === 0,
      'conComa=' + R.coma + ' conPunto=' + R.conPunto],
    ['una pared sin dato sale gris y dice Sin dato', R.sinDato6 && R.sinDato4,
      'con seis=' + M3.sinDato + ' con cuatro=' + M4.sinDato],
    ['el disco central queda gris y lleva el 17', R.discoGris && R.hay17, M3.disco + ' vs ' + M3.grisEsperado],
    ['el pie dice las vistas, las paredes y que el apex no se mide', R.pieDice, R.pie],
    ['y las paredes del pie son las que de verdad tienen valor', R.pie4, M4.pie.join(' | ')]
  ] };
"""))

# ─────────────────────────── TC-1070 · EL CONTRASTE ───────────────────────────
C.append(("TC-1070",
 "PR13 (TAREA 2c): el color del texto del mapa es el de la pestania SGL donde alcanza y se endurece donde no, con contraste de 4,5 a 1 o mas en los NUEVE colores de la paleta -- y la paleta no se toca",
r"""
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _v  = n => { try { return eval(n) } catch (e) { return undefined } };
  const R = {};
  __t.limpiar();
  const TXS = _fn('_strTxtSobre'), PAL = _v('STRAIN_PAL'), CTXT = _fn('strainColorTxt');
  R.hay = !!(TXS && PAL && PAL.length === 9);
  if (!R.hay) return { extra: [['DENOMINADOR: la regla de color de texto del mapa existe', false,
      'TXS=' + !!TXS + ' PAL=' + (PAL ? PAL.length : 0)]] };

  const lum = function (c) {
    const m = (String(c).replace('#','').match(/../g) || []).map(function (h) { return parseInt(h,16)/255 });
    const f = function (u) { return u <= 0.03928 ? u/12.92 : Math.pow((u+0.055)/1.055, 2.4) };
    return 0.2126*f(m[0]) + 0.7152*f(m[1]) + 0.0722*f(m[2]);
  };
  const ratio = function (a, b) { const x = lum(a), y = lum(b);
    return Math.round(((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)) * 100) / 100 };

  R.delMapa = PAL.map(function (p, i) { return i + ':' + ratio(TXS(i), p.color) }).join('  ');
  R.minMapa = Math.min.apply(null, PAL.map(function (p, i) { return ratio(TXS(i), p.color) }));
  R.todosPasan = PAL.every(function (p, i) { return ratio(TXS(i), p.color) >= 4.5 });
  /* La regla de la PESTANIA, sin endurecer: es STRAIN_PAL[i].txt, la que lee strainColorTxt. */
  R.dePestania = PAL.map(function (p, i) { return i + ':' + ratio(p.txt, p.color) }).join('  ');
  R.minPestania = Math.min.apply(null, PAL.map(function (p) { return ratio(p.txt, p.color) }));
  R.cuantosFallanEnLaPestania = PAL.filter(function (p) { return ratio(p.txt, p.color) < 4.5 }).length;
  /* DONDE ALCANZA, ES EXACTAMENTE EL DE LA PESTANIA: ocho de los nueve. */
  R.igualQueLaPestania = PAL.map(function (p, i) { return (TXS(i) === p.txt) ? 1 : 0 }).join('');
  R.cuantosIguales = PAL.filter(function (p, i) { return TXS(i) === p.txt }).length;
  R.losQueCambian = PAL.map(function (p, i) { return (TXS(i) === p.txt) ? null : i })
                       .filter(function (x) { return x !== null }).join(',');
  /* Y LA PALETA NO SE TOCA: su txt sigue siendo el que la pestania publica. */
  R.pestaniaIntacta = (function () {
    try {
      if (!CTXT) return 'no hay strainColorTxt';
      const ESC = _fn('strainEscribir'), seg = LV3D_SEG_ID[1];
      ESC(seg, '-18');
      return String(CTXT(seg)) === String(PAL[1].txt) ? 'intacta' : 'CAMBIO';
    } catch (e) { return 'ERR' }
  })();
  /* El mapa NO escribe con el oscuro fijo que tenia antes de PR12: sobre el violeta intenso daba
     1,89 y es lo que el medico vio como ilegible. */
  R.noUsaElOscuroFijo = TXS(1) !== '#111827' && ratio('#111827', PAL[1].color) < 2.5;

  return { extra: [
    ['DENOMINADOR: la regla del mapa y la paleta de nueve existen', R.hay, R.delMapa],
    ['los NUEVE colores llegan a 4,5 a 1 o mas', R.todosPasan, 'minimo=' + R.minMapa],
    ['la regla de la pestania NO alcanzaba en uno, y esta medido', R.cuantosFallanEnLaPestania === 1,
      R.dePestania + ' | minimo=' + R.minPestania],
    ['donde alcanza es EXACTAMENTE el de la pestania: ocho de los nueve', R.cuantosIguales === 8,
      R.igualQueLaPestania + ' cambia el ' + R.losQueCambian],
    ['y la pestania sigue publicando su propio color', R.pestaniaIntacta === 'intacta', R.pestaniaIntacta],
    ['el mapa ya no escribe con el oscuro fijo sobre el violeta intenso', R.noUsaElOscuroFijo,
      TXS(1) + ' / el oscuro daba ' + ratio('#111827', PAL[1].color)]
  ] };
"""))

# ─────────────────────────── TC-1071 · LA FORMULA ───────────────────────────
C.append(("TC-1071",
 "PR13 (TAREA 3): la formula del strain por pared se verifica por el camino real del codigo -- 100 a 80 da -20,0 por ciento, 100 a 120 da +20,0 y 100 a 100 da 0 --, es un cociente que no depende de la calibracion, y los seis valores conocidos dan un SGL de -19,7",
r"""
  const _fn = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const _v  = n => { try { return eval(n) } catch (e) { return undefined } };
  const R = {};
  __t.limpiar();
  const CALC = _fn('_strainCalcular'), AG = _fn('_strAgregar'), INI = _fn('_strainIniciar');
  R.hay = !!(CALC && AG);
  if (!R.hay) return { extra: [['DENOMINADOR: el calculo del strain por pared existe', false,
      'CALC=' + !!CALC + ' AG=' + !!AG]] };

  /* POR EL CAMINO REAL Y SIN REIMPLEMENTAR LA FORMULA: se siembran los LARGOS de los dos arcos
     en el estado del visor y se lee lo que _strainCalcular devuelve. */
  try { if (INI) INI(); } catch (e) {}
  const st = _v('_strain');
  R.hayEstado = !!(st && st.vistas);
  if (!R.hayEstado) return { extra: [['DENOMINADOR: el estado del strain del visor existe', false, 'sin _strain']] };
  const PT = [{x:100,y:400},{x:300,y:120},{x:500,y:400}];
  const mk = function (aA, aB) { return { arcoAcm: aA, arcoBcm: aB, bordeCm: aA + aB, Lcm: 7,
    cuerdaCm: 1, metodo: 'libre', imagen: 'a4c.dcm',
    eje: { apex: PT[1], M: { x:300, y:400 }, L: 280 }, pts: PT.slice(), cmPorPx: 0.01 } };
  const sembrar = function (pares) {
    ['a4c','a2c','a3c'].forEach(function (k) { st.vistas[k] = { d: null, s: null } });
    Object.keys(pares).forEach(function (k) {
      st.vistas[k] = { d: mk(pares[k][0], pares[k][2]), s: mk(pares[k][1], pares[k][3]) };
    });
    st.vista = Object.keys(pares)[0];
    try { return CALC() } catch (e) { return null }
  };
  const pct = function (r) { return (r && r.terr)
    ? r.terr.map(function (t) { return Math.round(t.pct * 1e6) / 1e6 }) : null };

  R.menos20 = pct(sembrar({ a4c: [100, 80, 100, 80] }));
  R.mas20   = pct(sembrar({ a4c: [100, 120, 100, 120] }));
  R.cero    = pct(sembrar({ a4c: [100, 100, 100, 100] }));
  /* ES UN COCIENTE: escalar los DOS largos por el mismo factor no mueve el resultado, asi que no
     depende de la calibracion mm/px de la imagen. */
  R.escala7   = pct(sembrar({ a4c: [700, 560, 700, 560] }));
  R.escala013 = pct(sembrar({ a4c: [1.3, 1.04, 1.3, 1.04] }));

  R.ok20  = JSON.stringify(R.menos20) === JSON.stringify([-20, -20]);
  R.okMas = JSON.stringify(R.mas20) === JSON.stringify([20, 20]);
  R.ok0   = JSON.stringify(R.cero) === JSON.stringify([0, 0]);
  R.cociente = JSON.stringify(R.escala7) === JSON.stringify([-20, -20])
            && JSON.stringify(R.escala013) === JSON.stringify([-20, -20]);

  /* LOS SEIS VALORES CONOCIDOS, por el mismo camino, y su SGL. */
  const r6 = sembrar({ a4c: [100, 83.7, 100, 69.9], a2c: [100, 89.9, 100, 88.6],
                       a3c: [100, 72.7, 100, 76.9] });
  R.seis = pct(r6);
  R.seisRedondo = r6 ? r6.terr.map(function (t) { return Math.round(t.pct * 10) / 10 }) : null;
  R.suma = R.seisRedondo ? Math.round(R.seisRedondo.reduce(function (a, b) { return a + b }, 0) * 10) / 10 : null;
  R.sgl = r6 ? Math.round(r6.sgl * 1e6) / 1e6 : null;
  R.sglUno = r6 ? r6.sgl.toFixed(1) : null;
  R.esPromedio = r6 ? Math.abs(r6.sgl - (R.seis.reduce(function (a, b) { return a + b }, 0) / 6)) < 1e-9 : false;
  /* Y el SGL que el dibujante publica sale del mismo numero, con coma. */
  const FMT = _fn('_strFmt');
  R.sglPublicado = (FMT && r6) ? FMT(r6.sgl) : null;

  return { extra: [
    ['DENOMINADOR: el calculo y el estado del visor existen', R.hay && R.hayEstado, JSON.stringify(R.menos20)],
    ['100 a 80 da -20,0 por ciento', R.ok20, JSON.stringify(R.menos20)],
    ['100 a 120 da +20,0 por ciento', R.okMas, JSON.stringify(R.mas20)],
    ['100 a 100 da 0', R.ok0, JSON.stringify(R.cero)],
    ['es un COCIENTE: escalar los dos largos no cambia el resultado', R.cociente,
      JSON.stringify(R.escala7) + ' y ' + JSON.stringify(R.escala013)],
    ['los seis valores conocidos salen exactos', JSON.stringify(R.seisRedondo) === JSON.stringify([-16.3,-30.1,-10.1,-11.4,-27.3,-23.1]),
      JSON.stringify(R.seisRedondo)],
    ['su suma es -118,3 y el SGL es su promedio', R.suma === -118.3 && R.esPromedio, R.suma + ' / ' + R.sgl],
    ['y el SGL publicado es -19,7 con coma', R.sglUno === '-19.7' && R.sglPublicado === '-19,7 %',
      R.sglUno + ' -> ' + R.sglPublicado]
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
