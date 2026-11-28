/* GRUPO A - despues. Mide cada RENGLON del descargo y de la leyenda contra el ancho del canvas,
   y que no se pierda una palabra: los renglones unidos tienen que dar el texto entero. */
(() => {
  const out = { denom: {}, medidas: [] };
  try {
    const SEIS = [-16.3, -30.1, -10.1, -11.4, -27.3, -23.1];
    const PAR = ['Anterior', 'Anteroseptal', 'Inferoseptal', 'Inferior', 'Inferolateral', 'Anterolateral'];
    const R = { sgl: -19.7, nVistas: 3, etiqueta: 'SGL aproximado — 3 vistas, 6 paredes',
                terr: PAR.map((p, i) => ({ pared: p, pct: SEIS[i], vista: 'a4c' })) };
    out.denom.terr = R.terr.length;
    const L1 = window._STR_CAP_L1 !== undefined ? window._STR_CAP_L1 : null;
    out.denom.constantes = !!(typeof _STR_CAP_L1 === 'string' && typeof _STR_CAP_L2 === 'string');
    [300, 640, 1000].forEach(S => {
      const cv = document.createElement('canvas');
      cv.width = S; cv.height = S;
      const c2 = cv.getContext('2d');
      /* Se interceptan los fillText para medir CADA renglon tal como se dibuja. */
      const vistos = [];
      const orig = c2.fillText.bind(c2);
      c2.fillText = function (t, x, y) {
        vistos.push({ t: String(t), x: x, y: y, w: c2.measureText(String(t)).width,
                      f: c2.font });
        return orig(t, x, y);
      };
      const fin = window._strBullsDibujar(c2, S, R, true);
      const fuera = vistos.filter(v => (v.x - v.w / 2) < 0 || (v.x + v.w / 2) > S || v.y > S || v.y < 0);
      /* Los renglones del descargo: los que el dibujante declara. */
      const t1 = _STR_CAP_L1.replace(/\s+/g, ' ').trim();
      const t2 = (_STR_CAP_L2 + R.etiqueta + '.').replace(/\s+/g, ' ').trim();
      /* Reconstruyo cada texto de sus renglones dibujados, en orden, saltando el titulo. */
      const cuerpo = vistos.filter(v => v.y > fin.ly + 1);
      const unidos = cuerpo.map(v => v.t).join(' ').replace(/\s+/g, ' ').trim();
      out.medidas.push({
        S: S, nCap1: fin.capL1, nCap2: fin.capL2,
        ly: Math.round(fin.ly), lyFin: Math.round(fin.lyFin),
        textosDibujados: vistos.length,
        fuera: fuera.length,
        primerFuera: fuera.length ? { t: fuera[0].t.slice(0, 40), w: Math.round(fuera[0].w) } : null,
        maxAncho: Math.round(Math.max.apply(null, vistos.map(v => v.w))),
        descargoEntero: unidos === (t1 + ' ' + t2),
        conPuntosSusp: cuerpo.some(v => v.t.indexOf('…') >= 0),
        radio: Math.round(fin.r)
      });
    });
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 300); }
  return out;
})
()
