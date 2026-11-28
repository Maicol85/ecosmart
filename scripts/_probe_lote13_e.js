/* GRUPO E - «Cambiar vista» en Strain VI. Se siembra el estado del modulo y se mide el PASO que
   el panel publica, los botones que emite y que no se pierda nada. */
(() => {
  const out = { denom: {}, esc: [] };
  const P = () => { try { return window._strainPaso() } catch (e) { return 'ERR' } };
  const H = () => { try { return String(window._strainPanel ? _strainPanel() : '') } catch (e) { return '' } };
  const tieneBoton = (h, id) => h.indexOf('"' + id + '"') >= 0 || h.indexOf(id) >= 0;
  try {
    out.denom.hayFns = ['medStrainCambiarVista', 'medStrainSeguirEnVista', '_strainPaso']
      .every(n => typeof window[n] === 'function');
    /* Se arranca la sesion por el camino real y se le declara una ventana con su par. */
    window._medHerr = 'strain';
    window._strainIniciar ? _strainIniciar() : (typeof _strainIniciar === 'function' && _strainIniciar());
    const S = window._strain;
    out.denom.haySesion = !!S;
    if (!S) return out;
    S.loopListo = true;
    const trazo = { bordeCm: 9.1, imagen: 'loop1', metodo: 'libre' };
    S.vistas.a4c.d = Object.assign({}, trazo);
    S.vistas.a4c.s = Object.assign({}, trazo, { bordeCm: 7.4 });
    S.vista = 'a4c'; S.fase = 'd';
    out.esc.push({ q: 'con una ventana declarada', paso: P(),
                   cambiar: tieneBoton(H(), 'cine-str-cambiar'),
                   seguir: tieneBoton(H(), 'cine-str-seguir') });
    /* 1 - Cambiar vista SIN nada pendiente: va al paso 2 de una, sin preguntar. */
    window.medStrainCambiarVista();
    out.esc.push({ q: 'tras Cambiar vista', paso: P(), eligiendo: !!S.eligiendoVista,
                   seguir: tieneBoton(H(), 'cine-str-seguir'),
                   /* Lo confirmado sigue ahi. */
                   a4cEntera: !!(S.vistas.a4c.d && S.vistas.a4c.s),
                   a4cD: S.vistas.a4c.d ? S.vistas.a4c.d.bordeCm : null,
                   a2cVacia: !(S.vistas.a2c.d || S.vistas.a2c.s) });
    /* 2 - «Seguir en A4C» vuelve a trazar sin elegir. */
    window.medStrainSeguirEnVista();
    out.esc.push({ q: 'tras Seguir', paso: P(), eligiendo: !!S.eligiendoVista, vista: S.vista });
    /* 3 - Elegir OTRA ventana: el puntero se mueve y los valores NO se mezclan. */
    window.medStrainCambiarVista();
    window.medStrainElegirVista('a2c');
    out.esc.push({ q: 'tras elegir A2C', paso: P(), eligiendo: !!S.eligiendoVista, vista: S.vista,
                   a4cSigue: !!(S.vistas.a4c.d && S.vistas.a4c.s),
                   a4cD: S.vistas.a4c.d ? S.vistas.a4c.d.bordeCm : null,
                   a2cSigueVacia: !(S.vistas.a2c.d || S.vistas.a2c.s) });
    /* 4 - CON un trazo pendiente: PREGUNTA y no cambia de paso hasta que se conteste. */
    S.pendiente = { bordeCm: 8.8 };
    const antesPaso = P();
    window.medStrainCambiarVista();
    const ov = document.querySelector('[data-preg-prop],[data-borr-conf]');
    out.esc.push({ q: 'con trazo pendiente', pasoAntes: antesPaso, pasoAhora: P(),
                   pregunto: !!ov, pendienteSigue: !!S.pendiente,
                   eligiendo: !!S.eligiendoVista,
                   textoPreg: ov ? String(ov.textContent || '').replace(/\s+/g, ' ').slice(0, 110) : null });
    /* Se contesta NO: no se cambia nada. */
    if (ov) {
      const bs = Array.from(ov.querySelectorAll('button'));
      const no = bs.filter(b => /cancelar/i.test(String(b.textContent)))[0] || bs[0];
      if (no) no.click();
    }
    out.esc.push({ q: 'tras decir que no', paso: P(), pendienteSigue: !!S.pendiente,
                   eligiendo: !!S.eligiendoVista });
    /* 5 - Volver al paso 1 apaga la marca. */
    S.eligiendoVista = true;
    window.medStrainOtroLoop();
    out.esc.push({ q: 'tras Elegir otro cineloop', paso: P(), eligiendo: !!S.eligiendoVista });
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 300); }
  return out;
})
()
