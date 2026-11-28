/* Replica la condicion de TC-1069: las cuatro esquinas de cada texto contra el poligono. */
(() => {
  const out = { lados: [] };
  const PAR = ['Anterior','Anteroseptal','Inferoseptal','Inferior','Inferolateral','Anterolateral'];
  const VAL = [-16.3,-30.1,-10.1,-11.4,-27.3,-23.1];
  const RES = { sgl: -19.7, nVistas: 3, etiqueta: 'SGL aproximado — 3 vistas, 6 paredes',
                terr: PAR.map((p,i) => ({ pared: p, pct: VAL[i], vista: 'a4c' })) };
  const SEC = (typeof _STR_SECTORES !== 'undefined') ? _STR_SECTORES : null;
  out.haySec = !!SEC;
  [640, 760, 900].forEach(S => {
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const c2 = cv.getContext('2d');
    const T = [];
    const orig = c2.fillText.bind(c2);
    c2.fillText = function (t, x, y) {
      const w = c2.measureText(String(t)).width;
      const m = /(\d+(?:\.\d+)?)px/.exec(c2.font);
      const h = m ? parseFloat(m[1]) * 0.78 : 10;
      T.push({ t: String(t), x0: x - w/2, x1: x + w/2, top: y - h/2, bot: y + h/2, x: x, y: y });
      return orig(t, x, y);
    };
    const fin = window._strBullsDibujar(c2, S, RES, true);
    const enSector = (x, y, a0, a1) => {
      const dx = x - fin.cx, dy = y - fin.cy;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < fin.rIn || d > fin.r) return false;
      let g = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 720) % 360;
      return (g >= a0 && g <= a1) || (g + 360 >= a0 && g + 360 <= a1);
    };
    const malos = [];
    (SEC || []).forEach(sc => {
      const am = ((sc.a[0] + sc.a[1]) / 2 - 90) * Math.PI / 180;
      const rango = fin.r - fin.rIn;
      const ptsTxt = [fin.rIn + rango*0.72, fin.rIn + rango*0.36].map(rho =>
        ({ x: fin.cx + Math.cos(am)*rho, y: fin.cy + Math.sin(am)*rho }));
      const mios = T.filter(tt => ptsTxt.some(p =>
        Math.abs((tt.x0+tt.x1)/2 - p.x) < 1.5 && Math.abs((tt.top+tt.bot)/2 - p.y) < 1.5));
      const detalle = mios.map(tt => {
        const esq = [[tt.x0,tt.top],[tt.x1,tt.top],[tt.x0,tt.bot],[tt.x1,tt.bot]];
        const dentro = esq.map(q => enSector(q[0], q[1], sc.a[0], sc.a[1]));
        return { t: tt.t, dentro: dentro.filter(Boolean).length + '/4',
                 d: esq.map(q => Math.round(Math.sqrt((q[0]-fin.cx)**2 + (q[1]-fin.cy)**2))).join(',') };
      });
      const ok = mios.length === 2 && detalle.every(d => d.dentro === '4/4');
      if (!ok) malos.push({ pared: sc.pared, nMios: mios.length, det: detalle });
    });
    out.lados.push({ S: S, r: Math.round(fin.r), rIn: Math.round(fin.rIn),
                     malos: malos.length, detalle: malos.slice(0, 2) });
  });
  return out;
})
()
