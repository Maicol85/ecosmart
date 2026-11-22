/* Cuerpo de la sonda de linea base del PROMPT 12. SOLO LEE.
   Mide el viaje de ida y vuelta de una REGION ESPECTRAL por el registro de disco:
   `_cineRegistro` -> (lo que se guarda) -> `_cineDesdeRegistro`, que es exactamente el camino
   que recorre una imagen Doppler guardada cuando se recarga la pagina (`medFijasRestaurar`) y
   cuando se reabre un cineloop del estudio.
   El cuerpo vive en su propio archivo a proposito: asi los acentos graves son codigo y no
   cierran ningun template. */
(() => {
  const out = { paso: 'inicio' };
  const falta = [];
  ['_cineRegistro', '_cineDesdeRegistro', '_dcmImgRegionVelocidad', '_dcmImgRegionMedible',
   '_dcmImgRegionTiempo', '_dcmImgRegionVti', '_dcmImgBaseY'].forEach(n => {
    let hay = false;
    try { hay = (typeof window[n] === 'function'); } catch (e) {}
    if (!hay) { try { hay = (typeof eval(n) === 'function'); } catch (e) {} }
    if (!hay) falta.push(n);
  });
  out.faltan = falta;

  /* DENOMINADOR: una region de velocidad REAL en su forma, con los numeros del caso del VINNO
     que P10 dejo documentado. No es un dato de ningun paciente: son los campos del encabezado.
       tipo 3 (spectral), recuadro de la fila 400 a la 800, columna 100 a 900,
       ux 4 (segundos), uy 7 (cm/s), dx 0,002 s/px, dy -0,9425 cm/s/px,
       ry0 200 (desplazamiento DESDE y0=400, o sea la fila 600 de la imagen),
       rx0 0, rvx 0, rvy 0. */
  const regOrig = { tipo: 3, x0: 100, y0: 400, x1: 900, y1: 800,
                    ux: 4, uy: 7, dx: 0.002, dy: -0.9425,
                    rx0: 0, ry0: 200, rvx: 0, rvy: 0 };

  const f = (fn, a) => { try { return fn(a); } catch (e) { return 'ERR:' + (e && e.message); } };
  const reg = n => { try { return window[n] || eval(n); } catch (e) { return null; } };
  const _RV = reg('_dcmImgRegionVelocidad'), _RM = reg('_dcmImgRegionMedible');
  const _RT = reg('_dcmImgRegionTiempo'), _RVTI = reg('_dcmImgRegionVti');
  const _BY = reg('_dcmImgBaseY');
  const _CR = reg('_cineRegistro'), _CD = reg('_cineDesdeRegistro');

  /* ANTES: la region tal cual sale del archivo. Es el control POSITIVO: si aca no se puede
     medir velocidad, la sonda no esta midiendo nada y el cero de abajo no significa nada. */
  out.antes = {
    campos: Object.keys(regOrig).slice().sort().join(','),
    velocidad: f(_RV, regOrig), distancia: f(_RM, regOrig),
    tiempo: f(_RT, regOrig), vti: f(_RVTI, regOrig),
    baseY: f(_BY, regOrig)
  };

  /* El viaje. Un cuadro de un byte alcanza: lo que se mide es la region, no los pixeles. */
  const loop = { nombre: 'pw tsvi', cuadros: 1,
                 d: { frags: [new Uint8Array([1])], cols: 1016, filas: 708, msCuadro: 0,
                      regiones: [regOrig] } };
  let rec = null, vuelta = null;
  try { rec = _CR('uuid-de-prueba', loop, '', 'id-de-prueba'); } catch (e) { out.errCR = String(e && e.message); }
  if (rec) {
    out.guardado = {
      campos: (rec.regiones && rec.regiones[0]) ? Object.keys(rec.regiones[0]).slice().sort().join(',') : '(sin region)',
      nRegiones: (rec.regiones || []).length
    };
    try { vuelta = _CD(rec); } catch (e) { out.errCD = String(e && e.message); }
  }
  const rv = (vuelta && vuelta.d && vuelta.d.regiones) ? vuelta.d.regiones[0] : null;
  out.despues = rv ? {
    campos: Object.keys(rv).slice().sort().join(','),
    velocidad: f(_RV, rv), distancia: f(_RM, rv),
    tiempo: f(_RT, rv), vti: f(_RVTI, rv),
    baseY: f(_BY, rv)
  } : '(no volvio ninguna region)';

  /* Que campos se PERDEN, listados por nombre. */
  if (rv) {
    const perdidos = Object.keys(regOrig).filter(k => !(k in rv));
    out.perdidos = perdidos.slice().sort();
  }

  /* Y el mismo viaje con el camino REAL de una fija: medFijasRestaurar usa _cineDesdeRegistro
     sobre lo que CeiboCine devuelve, asi que el registro de arriba ES lo que hay en disco. */
  out.paso = 'listo';
  return out;
})();
