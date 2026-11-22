/* P12 · TAREA 4.1 · La flecha de la velocidad, con las DOS escalas y los DOS lados de la base.
   SOLO LEE. La flecha se dibuja con `(v.cms < 0 ? '↓' : '↑')`, asi que lo que se mide es el
   SIGNO de `cms` por cada camino. */
(() => {
  const out = {};
  const reg = n => { try { return window[n] || eval(n); } catch (e) { return null; } };
  const _VEL = reg('_dcmImgVelocidadEn'), _BY = reg('_dcmImgBaseY');
  const _CAL = reg('_medVelCalEn'), _CALDOS = reg('_medCalVelDos');
  const _CR = reg('_cineRegistro'), _CD = reg('_cineDesdeRegistro');
  const flecha = cms => (cms < 0 ? 'abajo' : 'arriba');

  /* Region espectral estandar: `dy` NEGATIVO, que es lo que declaran las 132 del pendrive.
     Recuadro 400-800, cero en la fila 600. */
  const r = { tipo:3, x0:100, y0:400, x1:900, y1:800, ux:4, uy:7, dx:0.002, dy:-0.9425,
              rx0:0, ry0:200, rvx:0, rvy:0 };
  const base = _BY(r);
  out.baseY = base;

  /* (a) ESCALA DEL ARCHIVO, imagen FRESCA -- sin recargar, que es lo que el pedido pide medir. */
  const arriba = base - 100, abajo = base + 100;
  const cmsArr = _VEL(r, arriba), cmsAba = _VEL(r, abajo);
  out.archivoFresco = {
    cmsArriba: Number(cmsArr.toFixed(4)), flechaArriba: flecha(cmsArr),
    cmsAbajo: Number(cmsAba.toFixed(4)), flechaAbajo: flecha(cmsAba),
    correcto: (flecha(cmsArr) === 'arriba' && flecha(cmsAba) === 'abajo')
  };

  /* (b) LA MISMA REGION DESPUES DEL VIAJE POR EL REGISTRO **VIEJO** -- nueve campos, sin `ry0`.
     Es el estado en que quedaba una imagen Doppler al RECARGAR la pagina antes de P12. */
  const viejo = {}; ['tipo','x0','y0','x1','y1','ux','uy','dx','dy'].forEach(k => viejo[k] = r[k]);
  const cmsArrV = _VEL(viejo, arriba), cmsAbaV = _VEL(viejo, abajo);
  out.archivoTrasRecargarVIEJO = {
    baseY: _BY(viejo),
    cmsArriba: String(cmsArrV), flechaArriba: flecha(cmsArrV),
    cmsAbajo: String(cmsAbaV), flechaAbajo: flecha(cmsAbaV),
    /* ⚠️ `NaN < 0` es FALSO, asi que la flecha cae SIEMPRE en «arriba». */
    lasDosDicenArriba: (flecha(cmsArrV) === 'arriba' && flecha(cmsAbaV) === 'arriba')
  };

  /* (c) LA MISMA REGION DESPUES DEL VIAJE POR EL REGISTRO DE HOY -- trece campos. */
  const loop = { nombre:'pw', cuadros:1,
                 d:{ frags:[new Uint8Array([1])], cols:1016, filas:708, msCuadro:0, regiones:[r] } };
  const rv = _CD(_CR('u', loop, '', 'id')).d.regiones[0];
  const cmsArrN = _VEL(rv, arriba), cmsAbaN = _VEL(rv, abajo);
  out.archivoTrasRecargarHOY = {
    baseY: _BY(rv),
    cmsArriba: Number(cmsArrN.toFixed(4)), flechaArriba: flecha(cmsArrN),
    cmsAbajo: Number(cmsAbaN.toFixed(4)), flechaAbajo: flecha(cmsAbaN),
    correcto: (flecha(cmsArrN) === 'arriba' && flecha(cmsAbaN) === 'abajo')
  };

  /* (d) ESCALA MANUAL: el medico marca la fila 500 como 100 cm/s y la 700 como -100 cm/s.
     El cero sale en la 600, la misma que el archivo. */
  const cal = _CALDOS(500, 100, 700, -100);
  out.manual = cal ? (() => {
    const a = _CAL(cal, arriba), b = _CAL(cal, abajo);
    return { y0: cal.y0, cmsPorPx: Number(cal.cmsPorPx.toFixed(4)),
             cmsArriba: Number(a.toFixed(4)), flechaArriba: flecha(a),
             cmsAbajo: Number(b.toFixed(4)), flechaAbajo: flecha(b),
             correcto: (flecha(a) === 'arriba' && flecha(b) === 'abajo') };
  })() : '(no calibro)';

  /* (e) Y EL CASO QUE SERIA UN DEFECTO DE VERDAD: un archivo con `dy` POSITIVO. Ahi la region
     declara que hacia abajo la velocidad CRECE, asi que un punto debajo de la base da positivo
     y la flecha dice «arriba» sobre un punto que esta abajo. Se mide para poder decir si existe
     o no en los archivos que esta casa midio. */
  const rPos = Object.assign({}, r, { dy: 0.9425 });
  const cmsAbaP = _VEL(rPos, abajo);
  out.dyPositivo = { cmsAbajo: Number(cmsAbaP.toFixed(4)), flechaAbajo: flecha(cmsAbaP),
                     seriaDefecto: (flecha(cmsAbaP) === 'arriba') };
  return out;
})();
