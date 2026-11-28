/* Cuanto falta para que los rotulos entren a 640 con titulo. */
(() => {
  const out = { radios: [] };
  const PAR = ['Anterior','Anteroseptal','Inferoseptal','Inferior','Inferolateral','Anterolateral'];
  const VAL = [-16.3,-30.1,-10.1,-11.4,-27.3,-23.1];
  const R = { sgl: -19.7, nVistas: 3, etiqueta: 'SGL aproximado — 3 vistas, 6 paredes',
              terr: PAR.map((p,i) => ({ pared: p, pct: VAL[i], vista: 'a4c' })) };
  [640, 760, 900].forEach(S => {
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const c2 = cv.getContext('2d');
    const fuentes = [];
    const orig = c2.fillText.bind(c2);
    c2.fillText = function (t, x, y) { fuentes.push({ t: String(t), f: c2.font }); return orig(t,x,y); };
    const fin = window._strBullsDibujar(c2, S, R, true);
    const chicos = fuentes.filter(x => /Antero|Infero|Anterior|Inferior/.test(x.t))
      .map(x => x.t + '@' + (/(\d+)px/.exec(x.f) || [,'?'])[1]);
    out.radios.push({ S: S, r: Math.round(fin.r), esc: +fin.esc.toFixed(2),
                      uCap: fin.capL1 + '+' + fin.capL2, rotulos: chicos });
  });
  return out;
})
()
