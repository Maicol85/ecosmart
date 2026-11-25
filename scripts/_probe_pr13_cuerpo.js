/* PR13 - mide el diagrama nuevo: seis sectores, nueve rotulos, texto entero y contraste. */
(() => {
  const R = { err: [] };
  const F = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const V = n => { try { return eval(n) } catch (e) { return undefined } };
  const DIB = F('_strBullsDibujar'), AG = F('_strAgregar'), CP = F('_strColorPct'),
        GR = F('_strGris'), TR = F('strainTramoDe'), TXS = F('_strTxtSobre'),
        BOR = F('_strBordes'), FMT = F('_strFmt');
  const PAL = V('STRAIN_PAL'), SEC = V('_STR_SECTORES'), RDISCO = V('_STR_R_DISCO');
  R.hay = { DIB: !!DIB, AG: !!AG, TXS: !!TXS, BOR: !!BOR, FMT: !!FMT,
            SEC: SEC ? SEC.length : 0, RDISCO: RDISCO,
            anillosRetirados: (V('_STR_ANILLOS') === undefined),
            fuenteRetirada: (V('_STR_SEG_FUENTE') === undefined),
            rotuloRetirado: (V('_STR_SEG_ROTULO') === undefined) };
  if (!DIB || !AG || !SEC) { R.err.push('faltan piezas'); return R; }

  R.bordes = BOR ? BOR() : null;
  R.sectores = SEC.map(s => s.pared + ':' + s.a[0] + '-' + s.a[1]);
  R.formato = FMT ? [FMT(-19.716667), FMT(-16.3), FMT(0)] : null;

  /* CONTRASTE de la regla de texto, tramo por tramo */
  const lum = c => { const m = String(c).replace('#','').match(/../g).map(h => parseInt(h,16)/255);
    const f = u => (u <= 0.03928 ? u/12.92 : Math.pow((u+0.055)/1.055, 2.4));
    return 0.2126*f(m[0]) + 0.7152*f(m[1]) + 0.0722*f(m[2]); };
  const ratio = (a,b) => { const x = lum(a), y = lum(b);
    return +(((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05))).toFixed(2); };
  R.contraste = PAL ? PAL.map((p,i) => i + ':' + ratio(TXS ? TXS(i) : p.txt, p.color)).join('  ') : null;
  R.contrasteMin = PAL ? Math.min.apply(null, PAL.map((p,i) => ratio(TXS ? TXS(i) : p.txt, p.color))) : null;
  R.igualALaPestania = PAL ? PAL.map((p,i) => (TXS && TXS(i) === p.txt) ? 1 : 0).join('') : null;

  /* LOS SEIS VALORES: por el camino real -_strAgregar- */
  const vals = [-16.3, -30.1, -10.1, -11.4, -27.3, -23.1];
  const nom  = ['Inferoseptal','Anterolateral','Inferior','Anterior','Anteroseptal','Inferolateral'];
  const vis  = ['a4c','a4c','a2c','a2c','a3c','a3c'];
  const terr = vals.map((p,i) => ({ vista: vis[i], pared: nom[i], pct: p, ld: 100, ls: 100 + p }));
  const RES = AG(terr);
  R.sgl = RES ? RES.sgl.toFixed(6) : null;

  /* UNA MEDICION POR TAMANIO: se instrumenta el contexto para registrar CADA dibujo con su
     rectangulo real, y despues se leen los pixeles. */
  const medir = (S, conTitulo, Rs) => {
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const g = cv.getContext('2d');
    const textos = [], rects = [];
    const ft = g.fillText.bind(g), fr = g.fillRect.bind(g);
    g.fillText = function (t, x, y) {
      let w = 0; try { w = g.measureText(t).width } catch (e) {}
      const al = g.textAlign;
      const x0 = al === 'center' ? x - w/2 : (al === 'right' ? x - w : x);
      const mm = String(g.font).match(/(\d+(?:\.\d+)?)px/);
      const px = parseFloat(mm ? mm[1] : 10);
      /* El rectangulo depende del textBaseline: con 'middle' el centro vertical es la y. */
      const bl = g.textBaseline;
      const top = bl === 'middle' ? (y - px*0.39) : (y - px*0.8);
      const bot = bl === 'middle' ? (y + px*0.39) : (y + px*0.22);
      textos.push({ t: String(t), x0: +x0.toFixed(1), x1: +(x0+w).toFixed(1), w: +w.toFixed(1),
                    yBase: +y.toFixed(1), top: +top.toFixed(1), bot: +bot.toFixed(1),
                    font: px, color: String(g.fillStyle), align: al, bl: bl });
      return ft(t, x, y);
    };
    g.fillRect = function (x, y, w, h) {
      rects.push({ x: +x.toFixed(1), y: +y.toFixed(1), w: +w.toFixed(1), h: +h.toFixed(1), color: String(g.fillStyle) });
      return fr(x, y, w, h);
    };
    const fin = DIB(g, S, Rs, conTitulo);
    g.fillText = ft; g.fillRect = fr;
    const px = g.getImageData(0,0,S,S).data;
    const en = (X,Y) => { const i = ((Y|0)*S + (X|0))*4; return px[i]+','+px[i+1]+','+px[i+2] };
    const hex = c => (String(c).replace('#','').match(/../g)||[]).map(v=>parseInt(v,16)).join(',');

    /* La geometria que el dibujante uso: se deduce del rect de la barra de la leyenda */
    const barra = rects.filter(x => Math.abs(x.h - S/320*9) < 1.2 && x.w > 1 && x.w < S);
    /* El radio y el centro se reconstruyen muestreando: se busca el borde del diagrama sobre la
       vertical hacia ARRIBA desde el centro geometrico del dibujo. Mas simple y robusto: se
       muestrea cada pared sobre su bisectriz a varias fracciones del radio y se exige que el
       color sea UNO SOLO -ni anillos-. */
    const uu = n => n * (S/320);
    /* Se recalcula igual que el dibujante para poder muestrear: */
    const LEY = 'la misma referencia de colores que el bull’s eye de la pestaña SGL; no gradúa severidad';
    g.font = Math.round(uu(8)) + 'px system-ui, sans-serif';
    const envol = F('_strEnvolver') ? F('_strEnvolver')(g, LEY, S - uu(16), 2) : [LEY];
    const uDeb = 34 + 46 + 11*(envol.length-1) + 7 + (conTitulo ? 34 : 0);
    const uArr = conTitulo ? 30 : 7;
    const r = Math.max(uu(40), (S - uu(uArr) - uu(uDeb))/2);
    const cxx = S/2, cyy = uu(uArr) + r;

    /* (A) CADA PARED, UN SOLO COLOR DEL DISCO AL BORDE: se muestrea a 0,32 / 0,50 / 0,66 / 0,84
       / 0,95 del radio sobre la bisectriz. Con anillos, dos de esas caen en anillos distintos. */
    const porPared = {}; if (Rs) Rs.terr.forEach(t => porPared[t.pared] = t);
    const paredes = SEC.map(sc => {
      const am = ((sc.a[0]+sc.a[1])/2 - 90) * Math.PI/180;
      /* /!\ LOS RADIOS DE MUESTREO EVITAN LA BANDA DEL TEXTO Y CRUZAN LAS DOS FRONTERAS QUE
         TENIAN LOS ANILLOS VIEJOS -0,47 y 0,72-. Con 0,66 adentro, la muestra caia sobre el glifo
         del nombre y «un solo color» daba falso sobre un sector que si es uniforme. */
      /* /!\ LOS RADIOS DE MUESTREO EVITAN LAS DOS BANDAS DEL TEXTO -el numero a 0,51 r y el
         nombre a 0,79 r, con su alto- Y CRUZAN LAS DOS FRONTERAS QUE TENIAN LOS ANILLOS VIEJOS,
         0,47 y 0,72: si quedara un anillo, dos de estas muestras darian colores distintos. */
      /* /!\ SE DESCARTAN LAS MUESTRAS QUE CAEN SOBRE UN TEXTO, usando los rectangulos que el
         instrumento registro. Sin eso, una muestra que roza el borde del numero -a 0,5 px de su
         caja, con el antialias de por medio- hacia que «un solo color» diera falso sobre un
         sector que SI es uniforme: pasaba en el Anteroseptal de la captura. */
      const sobreTexto = (X, Y) => textos.some(t =>
        X >= t.x0 - 1.5 && X <= t.x1 + 1.5 && Y >= t.top - 1.5 && Y <= t.bot + 1.5);
      const pts = [0.28,0.33,0.40,0.63,0.68,0.90,0.96]
        .map(f => ({ x: cxx + Math.cos(am)*r*f, y: cyy + Math.sin(am)*r*f, f: f }))
        .filter(p => !sobreTexto(p.x, p.y));
      const col = pts.map(p => en(p.x, p.y));
      const unico = col.length >= 4 && col.every(c => c === col[0]);
      const t = porPared[sc.pared];
      const esp = t ? hex(CP(t.pct)) : hex(GR());
      return { pared: sc.pared, colores: col, unSoloColor: unico, esperado: esp, correcto: col[0] === esp };
    });
    const disco = en(cxx, cyy);

    /* (B) EL TEXTO DE CADA SECTOR, DENTRO DE SU POLIGONO. Para un sector de 60 grados la cuerda
       a la distancia rho vale rho, asi que el ancho disponible en el renglon de abajo del bloque
       es (rho_abajo). Se compara el rectangulo REAL del texto contra esa cuerda. */
    /* /!\ LA CONTENCION SE MIDE CONTRA EL POLIGONO REAL Y NO CONTRA UNA CUERDA. Un sector de 60
       grados tiene una cuerda igual a su radio, pero el texto es HORIZONTAL y el sector no: en
       los cuatro diagonales las esquinas se salen por el LADO aunque el ancho entre en la
       cuerda. Se prueban las cuatro esquinas: radio entre el disco y el borde, y angulo entre
       los dos lados -con la vuelta, porque el sector Anterior es [330, 390]-. */
    const enSector = (x, y, a0, a1) => {
      const dx = x - cxx, dy = y - cyy, d = Math.hypot(dx, dy);
      if (d < r*RDISCO || d > r) return false;
      const gg = (Math.atan2(dy, dx) * 180/Math.PI + 90 + 720) % 360;
      return (gg >= a0 && gg <= a1) || (gg + 360 >= a0 && gg + 360 <= a1);
    };
    const dentro = SEC.map(sc => {
      const am = ((sc.a[0]+sc.a[1])/2 - 90) * Math.PI/180;
      const rIn = r*RDISCO, rango = r - rIn;
      const pts = [rIn + rango*0.72, rIn + rango*0.36]
        .map(rho => ({ x: cxx + Math.cos(am)*rho, y: cyy + Math.sin(am)*rho }));
      const mios = textos.filter(t => pts.some(p =>
        Math.abs((t.x0+t.x1)/2 - p.x) < 1.5 && Math.abs((t.top+t.bot)/2 - p.y) < 1.5));
      const peor = mios.map(t => {
        const esq = [[t.x0,t.top],[t.x1,t.top],[t.x0,t.bot],[t.x1,t.bot]];
        return { t: t.t, w: t.w, font: t.font,
                 entra: esq.every(p => enSector(p[0], p[1], sc.a[0], sc.a[1])) };
      });
      return { pared: sc.pared, textos: peor.map(p => p.t),
               todosEntran: peor.length === 2 && peor.every(p => p.entra), detalle: peor };
    });

    /* (C) LOS ROTULOS DE LA LEYENDA: cuantos, donde, y si se pisan */
    const bor = BOR ? BOR() : [];
    const rot = textos.filter(t => bor.indexOf(t.t) >= 0);
    rot.sort((a,b) => a.x0 - b.x0);
    let pisan = 0;
    for (let i = 0; i + 1 < rot.length; i++) if (rot[i].x1 > rot[i+1].x0) pisan++;
    const lw = S*0.70, lx = cxx - lw/2, bw = lw/8;
    const enBorde = rot.every(t => {
      const c = (t.x0+t.x1)/2, i = bor.indexOf(t.t);
      return Math.abs(c - (lx + bw*i)) < 1.2;
    });

    /* (D) EL TEXTO EXPLICATIVO: entero, en <=2 renglones, dentro del canvas */
    const expl = textos.filter(t => envol.indexOf(t.t) >= 0);
    const explCompleto = envol.join(' ') === LEY;
    const explDentro = expl.every(t => t.x0 >= 0 && t.x1 <= S);
    const explCentrado = expl.every(t => Math.abs((t.x0+t.x1)/2 - S/2) < 1.2);

    /* (E) NADA SE SALE DEL CANVAS */
    const fueraTxt = textos.filter(t => t.x0 < -0.5 || t.x1 > S + 0.5 || t.bot > S + 0.5 || t.top < -0.5);
    const fueraRect = rects.filter(x => x.x < -0.5 || x.x + x.w > S + 0.5 || x.y + x.h > S + 0.5);

    return { S: S, conTitulo: conTitulo, r: +r.toFixed(1), cy: +cyy.toFixed(1),
             nTextos: textos.length, nRects: rects.length,
             paredes: paredes, discoGris: disco === hex(GR()), disco: disco, grisEsperado: hex(GR()),
             textoDentroDelSector: dentro,
             rotulos: rot.map(t => t.t), nRotulos: rot.length, rotulosEnBorde: enBorde, rotulosSePisan: pisan,
             explLineas: envol, explCompleto: explCompleto, explDentro: explDentro, explCentrado: explCentrado,
             fueraDelCanvas: { textos: fueraTxt.map(t => t.t + '@' + t.x0 + '..' + t.x1 + '/' + t.bot), rects: fueraRect },
             ly: fin ? +fin.ly.toFixed(1) : null,
             descargoEntra: conTitulo ? (fin ? (fin.ly + 28*fin.esc + 2 <= S) : null) : 'no aplica',
             aireAbajo: fin ? +(S - fin.ly - 2*fin.esc).toFixed(1) : null,
             hay17: textos.some(t => t.t === '17'),
             haySinDato: textos.filter(t => t.t === 'Sin dato').length,
             haySinDatos: textos.some(t => t.t === 'sin datos') };
  };

  R.pantallaConSeis = medir(300, false, RES);
  R.capturaConSeis  = medir(640, true, RES);
  /* Con CUATRO valores: dos paredes quedan sin dato */
  const RES4 = AG(terr.slice(0,4));
  R.pantallaConCuatro = medir(300, false, RES4);
  /* Sin nada */
  R.pantallaSinNada = medir(300, false, null);
  R.ventana = { w: window.innerWidth, h: window.innerHeight };
  return R;
})()
