(() => {
  const o = { errs: [] };
  const R = (y0,y1,ry0,dy,dx) => ({ tipo:3, x0:50, y0:y0, x1:900, y1:y1,
                                    rx0:850, ry0:ry0, rvx:0, rvy:0, dx:dx, dy:dy, ux:4, uy:7 });

  // === A · la fila del cero sale de y0 + ry0 ===========================================
  const r = R(400, 760, 10, -0.94, 0.004);
  o.A_baseY = _dcmImgBaseY(r);                       // 410, no 10
  o.A_velEnBase = _dcmImgVelocidadEn(r, 410);        // 0
  o.A_velArriba = +_dcmImgVelocidadEn(r, 310).toFixed(2);   // +94
  o.A_velAbajo  = +_dcmImgVelocidadEn(r, 510).toFixed(2);   // -94

  // === B · el caso del VINNO reproducido con el offset que la cuenta implica ============
  // Recuadro que arranca en la fila 400 con dy -0,9425: offset viejo = 400*0,9425 = 377 cm/s.
  const rv = R(400, 760, 10, -0.9425, 0.0047);
  const baseVieja = rv.ry0, baseNueva = _dcmImgBaseY(rv);
  o.B_offsetViejo = +Math.abs((baseNueva - baseVieja) * rv.dy).toFixed(1);   // ~377
  // una envolvente triangular de un latido, pico 1,29 m/s, 305 ms
  const dur = 0.305, nseg = 400, pxTot = Math.round(dur / rv.dx);
  /* La envolvente se arma con media/pico = 0,55, que es la forma que la cuenta del caso del
     VINNO implica (21,66 / 0,305 = 71 cm/s de media contra 1,29 m/s de pico). Se busca el
     exponente numericamente en vez de escribir un 1,7 a ojo. */
  const medPico = k => { let a = 0; for (let i = 0; i <= nseg; i++) a += Math.pow(Math.sin(Math.PI*i/nseg), k); return a / (nseg+1); };
  let kLo = 0.5, kHi = 6;
  for (let it = 0; it < 60; it++) { const km = (kLo+kHi)/2; if (medPico(km) > 0.55) kLo = km; else kHi = km; }
  const kExp = (kLo+kHi)/2;
  o.B_mediaPico = +medPico(kExp).toFixed(3);
  o.B_exp = +kExp.toFixed(3);
  const pts = [];
  for (let i = 0; i <= nseg; i++) {
    const f = i / nseg;
    const vcms = 129 * Math.pow(Math.sin(Math.PI * f), kExp);   // por debajo de la base
    const y = baseNueva + vcms / Math.abs(rv.dy);
    pts.push({ x: 100 + f * pxTot, y: y });
  }
  const regsOrig = window._medRegs;
  window._medRegs = () => [rv];
  try {
    const res = _vtiDe(pts);
    o.B_ok = !!res.ok;
    o.B_vti = res.ok ? +res.cm.toFixed(2) : res.motivo.slice(0,80);
    o.B_pico = res.ok ? +(res.picoCms/100).toFixed(2) : null;
    o.B_ms = res.ok ? Math.round(res.ms) : null;
    o.B_escalaDudosa = res.ok ? (res.escalaDudosa || null) : null;
    // y ahora lo mismo con la lectura VIEJA, simulada: el cero en la fila ry0 cruda
    const ptsViejo = pts.map(q => ({ x:q.x, y:q.y }));
    const rVie = Object.assign({}, rv, { y0: 0 });   // y0=0 reproduce la cuenta vieja
    window._medRegs = () => [Object.assign({}, rVie, { y0: 0, y1: 760 })];
    const res2 = _vtiDe(ptsViejo);
    o.B_viejo_ok = !!res2.ok;
    o.B_viejo_vti = res2.ok ? +res2.cm.toFixed(1) : res2.motivo.slice(0,60);
    o.B_viejo_pico = res2.ok ? +(res2.picoCms/100).toFixed(2) : null;
  } catch (e) { o.errs.push('B: ' + e.message); }
  window._medRegs = regsOrig;

  // === C · el chequeo de coherencia ====================================================
  o.C_buena  = _dcmImgEscalaVelDudosa(R(400, 760, 10, -0.94, 0.004));      // null
  o.C_fuera  = !!_dcmImgEscalaVelDudosa(R(400, 760, -200, -0.94, 0.004));  // motivo
  o.C_fueraTxt = String(_dcmImgEscalaVelDudosa(R(400,760,-200,-0.94,0.004)) || '').slice(0,70);
  o.C_sinY0  = _dcmImgEscalaVelDudosa({ uy:7, dy:-0.9, ry0:10 });          // null (no es region)
  o.C_frase  = typeof MED_ESC_DUDOSA === 'string' ? MED_ESC_DUDOSA.slice(0,40) : null;

  // === D · el eje del tiempo NO se movio ===============================================
  o.D_ms = +_dcmImgMsEntre(R(400,760,10,-0.94,0.004), 100, 200).toFixed(1); // 100*0.004*1000
  return o;
})()
