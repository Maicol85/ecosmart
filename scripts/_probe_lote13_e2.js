/* Diagnostico: por que TC-1076 no ve la pregunta. */
(() => {
  const out = {};
  try {
    window._medHerr = 'strain';
    window._strainIniciar();
    const S = window._strain;
    S.loopListo = true;
    const tz = c => ({ bordeCm: c, imagen: 'loop1', metodo: 'libre' });
    S.vistas.a4c.d = tz(9.1); S.vistas.a4c.s = tz(7.4);
    S.vista = 'a4c'; S.fase = 'd';
    window.medStrainCambiarVista();
    window.medStrainElegirVista('a2c');
    out.trasElegir = { vista: S.vista, mismoObjeto: S === window._strain,
                       elig: !!S.eligiendoVista };
    S.pendiente = { bordeCm: 8.8 };
    out.pendPuesto = !!window._strain.pendiente;
    out.pts3 = (window._strain.pts3 || []).length;
    out.ctrl = (window._strain.ctrl || []).length;
    window.medStrainCambiarVista();
    out.overlays = Array.from(document.querySelectorAll('[data-borr-conf]')).length;
    out.roleDialog = Array.from(document.querySelectorAll('[role=dialog]')).map(x => x.id || x.getAttribute('data-borr-conf') || '?').slice(0,5);
    out.pendDespues = !!window._strain.pendiente;
    out.eligDespues = !!window._strain.eligiendoVista;
    out.hayPreguntaProp = typeof window.preguntaProp === 'function';
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 250); }
  return out;
})
()
