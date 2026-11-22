/* P12 · TAREA 4.2 y 4.3 · SOLO REPORTE. No cambia nada: siembra, lee y repone. */
(() => {
  const out = {};
  const reg = n => { try { return window[n] || eval(n); } catch (e) { return null; } };
  const n0 = v => (v == null ? null : Number(v));

  /* ── 4.2 · LA MARCA DE ESCALA EN LA TABLA DEL VISOR ──────────────────────────────────────
     Se siembran DOS envolventes: una con `velManual` y otra sin. Lo que se mide es lo que la
     tabla PUBLICA por cada fila, y lo que publica el renglón del botón que carga al informe. */
  const _V = reg('_vistaA');
  const vtisOrig = _V ? (_V.medVtis || null) : null;
  out.hayVista = !!_V;
  try {
    const mk = (cm, man) => ({ pts: [], cm: cm, ms: 300, picoCms: 120, gradMax: 5.8,
                               gradMedio: 2.9, velManual: !!man, escalaDudosa: null, rol: null });
    const lista = [mk(20.1, false), mk(22.4, true)];
    if (_V) _V.medVtis = lista;
    const tabla = reg('_vtiPanel');
    out.hayPintorDeTabla = !!tabla;
    /* El pintor real es el que arma el panel del VTI. Se busca por el marcado que emite. */
    let html = '';
    if (tabla) { try { html = String(tabla() || ''); } catch (e) { html = 'ERR:' + (e && e.message); } }
    out.v42 = {
      dicePorArchivo: html.indexOf('escala del archivo') > -1,
      diceAMano: html.indexOf('escala vel. a mano') > -1,
      lasDosMarcasDistintas: (html.indexOf('escala del archivo') > -1 &&
                              html.indexOf('escala vel. a mano') > -1)
    };
    /* Y lo que llega al INFORME: `medVtiCargar` escribe el numero y nada mas. Se mira si los
       campos del informe tienen ALGUN lugar donde viva la procedencia. */
    out.v42.camposDelInforme = ['itv_tsvi', 'vti_tsvd'].map(id => {
      const el = document.getElementById(id);
      return { id: id, existe: !!el,
               /* un campo gemelo que guarde la procedencia no existe: se busca por los nombres
                  que tendria si existiera. */
               hayGemeloDeOrigen: !!(document.getElementById(id + '_origen') ||
                                     document.getElementById(id + '_esc')) };
    });
    out.v42.fuenteDeCargar = (typeof medVtiCargar === 'function')
      ? (String(medVtiCargar).indexOf('velManual') > -1 ? 'MENCIONA velManual' : 'NO menciona velManual')
      : '(no existe)';
  } finally {
    if (_V) { if (vtisOrig) _V.medVtis = vtisOrig; else try { delete _V.medVtis; } catch (e) {} }
  }

  /* ── 4.3 · EL PASAJE DE DATOS VISOR <-> APP PARA LOS DIAMETROS ───────────────────────────
     Premisa del pedido: «el visor no lee los diametros cargados en la app, ni la app lee los
     que se escriben en el visor». Se mide sembrando el campo DE LA APP y leyendo lo que el
     visor resuelve. */
  const ids = ['diam_tsvi', 'tsvd_diametro'];
  const prev = {};
  ids.forEach(id => { const el = document.getElementById(id); prev[id] = el ? el.value : null; });
  try {
    const poner = (id, v) => { const el = document.getElementById(id); if (!el) return false;
      el.value = v; try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
      return true; };
    out.v43 = { camposExisten: ids.map(id => ({ id: id, existe: !!document.getElementById(id) })) };
    out.v43.puso = [poner('diam_tsvi', '21.5'), poner('tsvd_diametro', '24.0')];
    const q = reg('_vtiQpQs');
    let r = null;
    try { r = q ? q() : null; } catch (e) { r = { ERR: String(e && e.message) }; }
    out.v43.loQueElVisorLee = r ? { dI: n0(r.dI), dD: n0(r.dD), faltan: r.faltan || null } : null;
    out.v43.elVisorSiLeeLaApp = !!(r && r.faltan &&
      r.faltan.indexOf('diámetro del TSVI') < 0 && r.faltan.indexOf('diámetro del TSVD') < 0);
    /* Y al revés: `medVtiDiametro` escribe en ESOS MISMOS campos, o sea que es el mismo dueño. */
    out.v43.aDondeEscribeElVisor = (typeof medVtiDiametro === 'function')
      ? (String(medVtiDiametro).indexOf('diam_tsvi') > -1 &&
         String(medVtiDiametro).indexOf('tsvd_diametro') > -1
         ? 'a los MISMOS campos de la app' : 'a otro lugar')
      : '(no existe)';
    /* El boton de cargar los VTI sale solo con las CUATRO cosas: lo dice `faltan`. */
    out.v43.faltanConLosDiametrosPuestos = r ? (r.faltan || []) : null;
  } finally {
    ids.forEach(id => { const el = document.getElementById(id);
      if (el && prev[id] !== null) { el.value = prev[id];
        try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {} } });
  }
  return out;
})();
