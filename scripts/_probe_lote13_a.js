/* GRUPO A - el aviso quemado en la captura del mapa. Mide cada linea del descargo contra el
   ancho del canvas, en tres tamanios de imagen, con el denominador de que hubo territorios. */
(function () {
  const out = { denom: {}, medidas: [] };
  try {
    /* Siembra: seis paredes con dato, por el camino real del modulo. */
    const SEIS = [-16.3, -30.1, -10.1, -11.4, -27.3, -23.1];
    const PAR = ['Anterior', 'Anteroseptal', 'Inferoseptal', 'Inferior', 'Inferolateral', 'Anterolateral'];
    out.denom.hayDibujante = typeof window._strBullsCanvas === 'function';
    const R = { sgl: -19.7, nVistas: 3, etiqueta: 'SGL aproximado - 3 vistas, 6 paredes',
                terr: PAR.map(function (p, i) { return { pared: p, pct: SEIS[i], vista: 'a4c' }; }) };
    out.denom.terr = R.terr.length;
    /* Se mide con un canvas propio y el MISMO dibujante, que es como las dos salidas se pintan. */
    const TAMS = [300, 640, 1000];
    TAMS.forEach(function (S) {
      const cv = document.createElement('canvas');
      cv.width = S; cv.height = S;
      const c2 = cv.getContext('2d');
      const fin = window._strBullsDibujar(c2, S, R, true);
      const e = fin.esc;
      const L1 = 'Calculado por metodo de dos contornos manuales - NO equivalente al speckle tracking automatico.';
      const L2 = 'Orientativo, requiere correlacion clinica. ' + R.etiqueta + '.';
      c2.font = 'bold ' + Math.round(9 * e) + 'px system-ui, sans-serif';
      const w1 = c2.measureText(L1).width;
      c2.font = Math.round(9 * e) + 'px system-ui, sans-serif';
      const w2 = c2.measureText(L2).width;
      out.medidas.push({
        S: S, esc: +e.toFixed(3), ly: Math.round(fin.ly),
        anchoL1: Math.round(w1), anchoL2: Math.round(w2),
        cortaL1: w1 > S, cortaL2: w2 > S,
        sobraL1: Math.round(w1 - S), sobraL2: Math.round(w2 - S),
        /* La base de cada linea contra el alto del canvas: si se pasa, el renglon sale afuera. */
        baseL1: Math.round(fin.ly + 16 * e), baseL2: Math.round(fin.ly + 28 * e),
        seVaAbajoL2: (fin.ly + 28 * e) > S
      });
    });
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 300); }
  return out;
})
()
