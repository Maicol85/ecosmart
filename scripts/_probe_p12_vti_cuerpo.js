/* P12 · TAREA 3.1 · El VTI de punta a punta, antes y despues del viaje por el registro.
   Lo que el pedido exige: «Mismo resultado de VTI antes y despues de recargar». */
(() => {
  const out = {};
  const reg = n => { try { return window[n] || eval(n); } catch (e) { return null; } };
  const _CR = reg('_cineRegistro'), _CD = reg('_cineDesdeRegistro');
  const _VTI = reg('_vtiDe'), _RVTI = reg('_dcmImgRegionVti');

  /* Region espectral con los numeros del encabezado del caso del VINNO que P10 documento.
     Ningun dato de ningun paciente: son coordenadas de pixel y escalas de eje. */
  const regOrig = { tipo: 3, x0: 100, y0: 400, x1: 900, y1: 800,
                    ux: 4, uy: 7, dx: 0.002, dy: -0.9425,
                    rx0: 0, ry0: 200, rvx: 0, rvy: 0 };
  /* Una envolvente sintetica: un triangulo por debajo de la linea de cero (fila 600), que es
     como se traza un flujo de salida. 60 puntos, de la columna 200 a la 500. */
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const x = 200 + i * 5;
    const h = Math.sin(Math.PI * i / 60) * 120;        // pico de 120 px bajo la base
    pts.push({ x: Math.round(x), y: Math.round(600 + h) });
  }

  const loop = { nombre: 'pw tsvi', cuadros: 1,
                 d: { frags: [new Uint8Array([1])], cols: 1016, filas: 708, msCuadro: 0,
                      regiones: [regOrig] } };

  /* `_vtiDe` lee las regiones por `_medRegs()`, que sale de la vista del visor. Se sustituye
     SOLO esa lectura, que es la unica entrada del calculo, y se repone al terminar.
     ⚠️ La calibracion manual se apaga: con ella puesta mandaria sobre la del archivo y la
     medicion no diria nada sobre la escala del archivo, que es lo que esta tarea arregla. */
  const _regsOrig = window._medRegs, _calOrig = window._medCalibVel;
  const medir = (regs) => {
    window._medRegs = () => regs;
    try { window._medCalibVel = null; } catch (e) {}
    let r = null;
    try { r = _VTI(pts); } catch (e) { r = { ok: false, motivo: 'ERR:' + (e && e.message) }; }
    return r;
  };

  try {
    const antes = medir([regOrig]);
    const rec = _CR('uuid-de-prueba', loop, '', 'id-de-prueba');
    const vuelta = _CD(rec);
    const rv = vuelta.d.regiones[0];
    const despues = medir([rv]);
    const n = v => (v == null ? null : Number(v.toFixed(6)));
    out.antes = antes.ok ? { cm: n(antes.cm), ms: n(antes.ms), picoCms: n(antes.picoCms),
                             gradMax: n(antes.gradMax), gradMedio: n(antes.gradMedio),
                             velManual: !!antes.velManual }
                         : { ok: false, motivo: String(antes.motivo || '').slice(0, 120) };
    out.despues = despues.ok ? { cm: n(despues.cm), ms: n(despues.ms), picoCms: n(despues.picoCms),
                                 gradMax: n(despues.gradMax), gradMedio: n(despues.gradMedio),
                                 velManual: !!despues.velManual }
                             : { ok: false, motivo: String(despues.motivo || '').slice(0, 120) };
    out.iguales = (antes.ok && despues.ok &&
                   Math.abs(antes.cm - despues.cm) < 1e-9 &&
                   Math.abs(antes.picoCms - despues.picoCms) < 1e-9 &&
                   Math.abs(antes.gradMax - despues.gradMax) < 1e-9);
    out.vtiRegionAntes = !!_RVTI(regOrig);
    out.vtiRegionDespues = !!_RVTI(rv);

    /* CONTROL POSITIVO de la sonda: con el registro recortado a los NUEVE campos de antes de
       P12 -o sea simulando un registro viejo- el VTI tiene que FALLAR. Sin esto, dos «ok»
       iguales podrian venir de que la sonda no mide nada. */
    const viejo = {}; ['tipo','x0','y0','x1','y1','ux','uy','dx','dy'].forEach(k => viejo[k] = rv[k]);
    const conViejo = medir([viejo]);
    out.registroViejoFalla = !conViejo.ok;
    out.registroViejoMotivo = conViejo.ok ? null : String(conViejo.motivo || '').slice(0, 90);

    /* CONTROL NEGATIVO: una region 2D -los dos ejes en cm- no mide VTI ni antes ni despues, y
       su escala de DISTANCIA si sobrevive el viaje. Es lo que prueba que mm no se toco. */
    const reg2D = { tipo: 1, x0: 0, y0: 0, x1: 500, y1: 500,
                    ux: 3, uy: 3, dx: 0.0312, dy: 0.0312 };
    const loop2 = { nombre: '2d', cuadros: 1,
                    d: { frags: [new Uint8Array([1])], cols: 500, filas: 500, msCuadro: 0,
                         regiones: [reg2D] } };
    const rv2 = _CD(_CR('u2', loop2, '', 'id2')).d.regiones[0];
    const _RM = reg('_dcmImgRegionMedible');
    out.mmAntes = !!_RM(reg2D);
    out.mmDespues = !!_RM(rv2);
    out.mmEscalaIgual = (rv2.dx === reg2D.dx && rv2.dy === reg2D.dy);
  } finally {
    window._medRegs = _regsOrig;
    try { window._medCalibVel = _calOrig; } catch (e) {}
  }
  return out;
})();
