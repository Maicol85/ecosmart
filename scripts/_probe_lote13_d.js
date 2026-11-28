/* GRUPO D - el retroceso del trazado. Se prueba la funcion PURA con casos armados, y despues el
   gesto real sobre el canvas del visor. */
(() => {
  const out = { pura: {}, gesto: {} };
  try {
    out.pura.existe = typeof window.medRetroIndice === 'function';
    const F = window.medRetroIndice;
    /* Un camino recto de 20 puntos, separados 5 px. */
    const recto = []; for (let i = 0; i < 20; i++) recto.push({ x: i * 5, y: 0 });
    /* (1) Avanzar no retrocede: un punto mas alla del ultimo. */
    out.pura.avanzar = F(recto, { x: 100, y: 0 });
    /* (2) Volver sobre el punto 12 -que esta a 15 px del ultimo mirado- SI retrocede. */
    out.pura.volver12 = F(recto, { x: 60, y: 0 });
    /* (3) El ultimo tramo NO cuenta: el punto 18 esta dentro del salto de 4. */
    out.pura.ultimoTramo = F(recto, { x: 90, y: 0 });
    /* (4) Con pocos puntos no se retrocede nada. */
    out.pura.corto = F(recto.slice(0, 5), { x: 0, y: 0 });
    /* (5) Lejos del camino no retrocede. */
    out.pura.lejos = F(recto, { x: 60, y: 60 });
    /* (6) El radio manda: a 6 px del punto 12 entra, a 9 no. */
    out.pura.r6 = F(recto, { x: 60, y: 6 });
    out.pura.r9 = F(recto, { x: 60, y: 9 });
    /* (7) Con el trazo cruzado se vuelve al punto MAS NUEVO que entra. */
    const cruz = recto.concat([{ x: 95, y: 20 }, { x: 60, y: 20 }, { x: 60, y: 10 }]);
    out.pura.cruzado = F(cruz, { x: 60, y: 4 });
    out.pura.cruzadoLargo = cruz.length;
    /* (8) Las constantes son las declaradas. */
    out.pura.consts = [MED_RETRO_RADIO, MED_RETRO_SALTO, MED_RETRO_MIN];
    /* (9) La frase de ayuda esta en las CUATRO de contorno y en NINGUNA de clic. */
    const C = _MED_COMO;
    out.pura.ayudaContorno = ['area', 'strain', 'lars', 'vd']
      .every(k => String(C[k]).indexOf(MED_RETRO_AYUDA) >= 0);
    out.pura.ayudaClic = ['vel', 'tiempo', 'fc', 'dist']
      .every(k => String(C[k]).indexOf(MED_RETRO_AYUDA) < 0);
    /* (10) El dueno es uno: la frase no esta escrita suelta en ningun lado. */
    out.pura.unDueno = MED_RETRO_AYUDA.length > 40;
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 300); }

  /* ── EL GESTO, por _medAreaMove. `_medTrazo` y `_medHerr` son ACCESORES sobre la vista activa
     -con set-, asi que se escriben desde window; `_medPuntoCanvas` y `_medPintar` son
     declaraciones de funcion de nivel superior, o sea propiedades de window, y por eso se pueden
     tapar. Con un `const` no se podria: es la trampa que este proyecto ya tiene escrita. */
  try {
    const pc = window._medPuntoCanvas, pin = window._medPintar;
    let prox = null, pintadas = 0;
    window._medPuntoCanvas = () => prox;
    window._medPintar = () => { pintadas++; };
    window._medHerr = 'area';
    const recto = []; for (let i = 0; i < 20; i++) recto.push({ x: i * 5, y: 0 });
    const ev = { preventDefault() {} };

    window._medTrazo = recto.slice();
    prox = { x: 100, y: 0 };                 // avanzar
    window._medAreaMove(ev);
    out.gesto.trasAvanzar = window._medTrazo.length;

    window._medTrazo = recto.slice();
    prox = { x: 60, y: 0 };                  // retroceder al punto 12
    window._medAreaMove(ev);
    out.gesto.trasRetroceder = window._medTrazo.length;
    out.gesto.ultimoX = window._medTrazo[window._medTrazo.length - 1].x;

    /* Y desde ahi se sigue dibujando: un punto nuevo se agrega al trazo recortado. */
    prox = { x: 70, y: 40 };
    window._medAreaMove(ev);
    out.gesto.trasSeguir = window._medTrazo.length;
    out.gesto.sigueUltimo = window._medTrazo[window._medTrazo.length - 1].y;

    /* RETROCESO LENTO: un punto a menos de 2 px del ultimo, pero sobre un punto viejo. Con el
       orden al reves -decimar primero- esto no haria nada. */
    window._medTrazo = recto.slice();
    prox = { x: 94, y: 0 };                  // a 1 px del ultimo: lo decimaria
    window._medAreaMove(ev);
    out.gesto.lentoSobreUltimo = window._medTrazo.length;
    window._medTrazo = recto.slice();
    prox = { x: 66, y: 1 };                  // sobre el punto 13, a 1 px de el
    window._medAreaMove(ev);
    out.gesto.lentoSobreViejo = window._medTrazo.length;

    /* Trazo corto: no se toca. */
    window._medTrazo = recto.slice(0, 5);
    prox = { x: 0, y: 0 };
    window._medAreaMove(ev);
    out.gesto.cortoIntacto = window._medTrazo.length;

    /* SIN TRAZO no hace nada y no tira. */
    window._medTrazo = null;
    prox = { x: 10, y: 10 };
    window._medAreaMove(ev);
    out.gesto.sinTrazo = window._medTrazo;
    out.gesto.pintadas = pintadas;
    window._medPuntoCanvas = pc; window._medPintar = pin;
  } catch (e) { out.gesto.ERROR = String(e && e.message || e).slice(0, 200); }
  return out;
})
()
