/* TAREA 0 de PR13 - SOLO MIDE. El cuerpo vive aparte por la leccion de los acentos graves. */
(() => {
  const R = { err: [] };
  const F = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const V = n => { try { return eval(n) } catch (e) { return undefined } };

  /* ── (4) LOS LIMITES REALES DE LOS OCHO TRAMOS, y que pasa fuera de [-20, +20] ── */
  const TR = F('strainTramoDe'), CP = F('_strColorPct'), GR = F('_strGris');
  const PAL = V('STRAIN_PAL'), MAR = V('STRAIN_MARCAS'), NTR = V('STRAIN_N_TRAMOS');
  R.hay = { strainTramoDe: !!TR, _strColorPct: !!CP, _strGris: !!GR,
            PAL: PAL ? PAL.length : 0, MARCAS: MAR ? MAR.slice() : null, NTR: NTR };
  if (TR) {
    /* El limite real de cada tramo, barriendo de -30 a +30 de 0,01 en 0,01 */
    const lim = {};
    let prev = null;
    for (let x = -3000; x <= 3000; x++) {
      const v = x / 100, t = TR(v);
      if (t !== prev) { lim[t] = lim[t] || []; lim[t].push(+v.toFixed(2)); prev = t; }
    }
    R.primerValorDeCadaTramo = lim;
    R.bordes = [-20.01, -20, -19.99, -15.01, -15, -14.99, -0.01, 0, 0.01,
                14.99, 15, 15.01, 19.99, 20, 20.01, 25, 30.1, -30.1, -16]
                 .map(v => v + '=>' + TR(v)).join('  ');
    R.clampAbajo = (TR(-30.1) === 1 && TR(-25) === 1 && TR(-20.01) === 1 && TR(-20) === 1);
    R.clampArriba = (TR(20) === 8 && TR(20.01) === 8 && TR(25) === 8 && TR(30.1) === 8);
    if (CP) {
      R.mismoColor_30y16 = String(CP(-30.1)) === String(CP(-16));
      R.colorExtremos = { menos30: String(CP(-30.1)), menos16: String(CP(-16)),
                          mas20: String(CP(20)), mas25: String(CP(25)) };
    }
  }

  /* ── (5) LOS ROTULOS Y LA REGLA DE COLOR DE TEXTO DE LA PESTANIA ── */
  if (PAL) {
    R.paleta = PAL.map((p, i) => ({ i: i, color: p.color, txt: p.txt, rango: p.rango }));
    /* El contraste real de cada txt sobre su color, por WCAG */
    const lum = c => {
      const m = String(c).replace('#', '').match(/../g).map(h => parseInt(h, 16) / 255);
      const f = u => (u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4));
      return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
    };
    const ratio = (a, b) => { const x = lum(a), y = lum(b);
      return +(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05))).toFixed(2); };
    R.contrastePestania = PAL.map((p, i) => i + ':' + ratio(p.txt, p.color)).join('  ');
    R.contrasteMinimo = Math.min.apply(null, PAL.map(p => ratio(p.txt, p.color)));
    /* Y el contraste si se usara el oscuro #111827 en todos, que es lo que el mapa hace hoy */
    R.contrasteHoyDelMapa = PAL.map((p, i) => i + ':' + ratio('#111827', p.color)).join('  ');
  }
  R.rotulosPestania = MAR ? MAR.map(v => (v > 0 ? '+' : '') + v).join(' ') : null;
  R.formatoNumeroPestaniaBullsEye = (function () {
    try { return 'strainNumTxt usa String(v): ' + (function (v) { return (v > 0 ? '+' : '') + String(v) })(-15.8) }
    catch (e) { return 'ERR' }
  })();
  R.formatoConComa = (function () { const f = F('_scN'); return f ? [f(-15.75, 1), f(-19.7, 1), f(0, 1)].join(' | ') : 'NO HAY _scN' })();

  /* ── (2) POR QUE EL TEXTO DE LA LEYENDA SE CORTA: se mide el ancho REAL del texto ── */
  const TXT = 'la misma referencia de colores que el bull’s eye de la pestaña SGL; no gradúa severidad';
  R.textoLeyenda = TXT;
  R.anchoDelTexto = [300, 640].map(function (S) {
    const c = document.createElement('canvas'); c.width = S; c.height = S;
    const g = c.getContext('2d');
    const esc = S / 320;
    g.font = Math.round(8 * esc) + 'px system-ui, sans-serif';
    const w = g.measureText(TXT).width;
    /* la barra de la leyenda y donde cae el ultimo rotulo */
    const lw = S * 0.46, lx = S / 2 - lw / 2, bw = lw / 8;
    return { S: S, fontPx: Math.round(8 * esc), anchoTexto: +w.toFixed(1), canvas: S,
             sobra: +(w - S).toFixed(1), cortaCadaLado: +((w - S) / 2).toFixed(1),
             barra: { lw: +lw.toFixed(1), lx: +lx.toFixed(1), bw: +bw.toFixed(2),
                      finBarra: +(lx + lw).toFixed(1),
                      chipGris_x: +(lx + lw + 8 * esc).toFixed(1) },
             anchoDe_mas20: +g.measureText('+20').width.toFixed(1),
             anchoDe_menos20: +g.measureText('≤ −20').width.toFixed(1) };
  });

  /* ── (2) EL SGL DEL PIE: promedio de los seis, por el camino real ── */
  const AG = F('_strAgregar');
  if (AG) {
    const seis = [-16.3, -30.1, -10.1, -11.4, -27.3, -23.1];
    const nom = ['Inferoseptal', 'Anterolateral', 'Inferior', 'Anterior', 'Anteroseptal', 'Inferolateral'];
    const vis = ['a4c', 'a4c', 'a2c', 'a2c', 'a3c', 'a3c'];
    const terr = seis.map((p, i) => ({ vista: vis[i], pared: nom[i], pct: p, ld: 100, ls: 100 + p }));
    const r = AG(terr);
    R.sglDeLosSeis = r ? +r.sgl.toFixed(6) : null;
    R.sglEsperado = +(seis.reduce((a, b) => a + b, 0) / 6).toFixed(6);
    R.sumaDeLosSeis = +seis.reduce((a, b) => a + b, 0).toFixed(6);
    R.sglUnDecimal = r ? r.sgl.toFixed(1) : null;
    R.nVistasYEtiqueta = r ? (r.nVistas + ' | ' + r.etiqueta) : null;
  } else R.err.push('NO HAY _strAgregar');

  /* ── (2) COMO SE PINTA HOY: los anillos ── */
  const AN = V('_STR_ANILLOS'), FU = V('_STR_SEG_FUENTE'), RO = V('_STR_SEG_ROTULO');
  R.anillos = AN ? AN.length : null;
  R.anillosPorRadio = AN ? (function () {
    const g = {};
    AN.forEach(s => { const k = s.r0 + '-' + s.r1; (g[k] = g[k] || []).push(s.seg) });
    return g;
  })() : null;
  R.segmentosDeCadaPared = FU ? (function () {
    const g = {};
    Object.keys(FU).forEach(n => (FU[n] || []).forEach(w => { (g[w] = g[w] || []).push(+n) }));
    Object.keys(g).forEach(w => g[w].sort((a, b) => a - b));
    return g;
  })() : null;
  R.dondeVaElNumero = RO || null;

  /* ── (3) OTROS USOS DEL MISMO DIBUJANTE ── */
  R.consumidores = ['_strBullsRepintar', '_strBullsCanvas', 'medStrainCapturar',
                    'medStrainBullsBiblioteca'].map(n => n + '=' + !!F(n)).join('  ');
  R.canvasDePantalla = (function () {
    const e = document.getElementById('cine-str-be');
    return e ? { existe: true, w: e.width, h: e.height, cssW: e.style.width } : { existe: false };
  })();

  /* ── (3) ANCHO REAL DE LA COLUMNA DEL VISOR a este ancho de ventana ── */
  R.ventana = { w: window.innerWidth, h: window.innerHeight };
  return R;
})()
