/**
 * _probe_p38b1_cuerpo.js — el cuerpo de la sonda del BLOQUE 1 de PANT-38 (2026-11-15).
 *
 * ⚠️ EL CUERPO VIVE EN UN ARCHIVO APARTE, Y ES LA MEJORA DE METODO DE MEDIR-4b. Metido dentro
 * de un template literal del arnes, cada acento grave de este archivo cierra la cadena y el
 * arnes deja de parsear —la trampa que esta casa pago veintinueve tandas seguidas—. Leido con
 * `readFile` y pasado como TEXTO a `page.evaluate`, los acentos graves son codigo y nada mas.
 *
 * Mide el acomodo de los cuadros de Contractilidad: la posicion y el tamanio de cada uno con el
 * 3D cerrado y abierto, con cero hallazgos y con cinco, para poder afirmar las cuatro cosas que
 * el medico pide: (1) el cuadro de los botones no se mueve al abrir el 3D; (2) el de hallazgos
 * crece con los hallazgos y NO iguala al 3D; (3) las cajas de la fila del 3D no cambian; (4) en
 * angosto la disposicion es la de hoy.
 *
 * ⚠️ DEVUELVE EL TEMA QUE QUEDO PUESTO. El tema de esta app es la clase `light-mode` que pone
 * `loadTheme()` leyendo `localStorage.ett_theme`, NO `prefers-color-scheme`: una sonda que use
 * el `colorScheme` del contexto mide el tema oscuro las dos veces.
 */
(async (TEMA) => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = { w: innerWidth, temaPedido: TEMA };
  const caja = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top), l: Math.round(r.left) }; };
  const g = (id) => document.getElementById(id);

  try { localStorage.setItem('ett_theme', TEMA === 'dia' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  o.temaPuesto = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = g('login-overlay');
  if (lo) lo.style.display = 'none';

  /* La pestania y la seccion. Sin abrir la seccion los nodos estan en display:none y NO tienen
     geometria: un barrido sobre la app cerrada da ceros y se lee igual que «no desborda». */
  try { if (typeof showTab === 'function') showTab('contractilidad'); } catch (e) {}
  await esp(120);
  try {
    const hdr = document.querySelector('#sacc-contr .sacc-hdr');
    if (hdr && hdr.getAttribute('aria-expanded') !== 'true') hdr.click();
  } catch (e) {}
  await esp(260);

  /* DENOMINADOR: que los tres nodos existan y tengan caja. Sin esto, un cero de desborde o una
     posicion que «no cambia» se leen igual que un arreglo que anda. */
  o.existen = {
    fila: !!g('lv3d-fila'), hall: !!g('lv3d-bloque-hallazgos'),
    bot: !!g('lv3d-bloque-botones'), panel: !!g('lv3d-panel'),
    slot: !!g('lv3d-slot-botones'), colDer: !!document.querySelector('.contr-col-der')
  };
  o.secAbierta = (() => { const b = g('lv3d-btn'); return !!(b && b.getBoundingClientRect().height > 0); })();

  /* Donde vive el cuadro de los botones: el padre REAL, no el que uno supone. */
  const donde = () => { const b = g('lv3d-bloque-botones');
    return b && b.parentNode ? (b.parentNode.id || b.parentNode.className || '?') : 'SIN PADRE'; };

  /* ⚠️ LOS HALLAZGOS SE SIEMBRAN POR `contrSetSegmento`, QUE ES EL DUENIO. El clic sobre el
     bull's eye depende de la geometria del SVG y a 390 px no esta donde uno cree.
     ⚠️ LOS IDS SALEN DE `LV3D_SEG_ID` Y NO DE LA CABEZA. La primera version de esta sonda uso
     's1'..'s8', que NO existen: `contrSetSegmento` los escribe igual en `contrEstado`, nadie los
     lee, y el texto igual cambia —de 52 a 29 caracteres— porque el repintado corre. O sea que
     la siembra parecia andar y el cuadro «no crecia»: un denominador vacio que se lee como un
     hallazgo. Se toman del dueño, y la sonda DEVUELVE cuantos segmentos quedaron marcados. */
  const sembrar = (n) => {
    try {
      const ids = (typeof LV3D_SEG_ID !== 'undefined' && LV3D_SEG_ID)
        ? LV3D_SEG_ID.filter(Boolean) : [];
      if (typeof contrReset === 'function') contrReset();
      for (let i = 0; i < n && i < ids.length; i++) {
        if (typeof contrSetSegmento === 'function') contrSetSegmento(ids[i], 2);
      }
    } catch (e) {}
  };
  const limpiar = () => { try { if (typeof contrReset === 'function') contrReset(); } catch (e) {} };

  const foto = () => ({
    donde: donde(),
    hall: caja(g('lv3d-bloque-hallazgos')),
    bot: caja(g('lv3d-bloque-botones')),
    panel: caja(g('lv3d-panel')),
    fila: caja(g('lv3d-fila')),
    /* La fila del 3D: el dibujo y la columna de los cinco cuadros. El punto 3 del pedido. */
    lienzo: caja(g('lv3d-lienzo')),
    colDer3d: caja(g('lv3d-col-der')),
    canvas: caja(g('lv3d-canvas')),
    /* El cuadro del territorio coronario, que no se tiene que mover. */
    terr: (() => { const c = document.querySelector('.contr-col-der');
      return c ? caja(c.firstElementChild) : null; })(),
    colDer: caja(document.querySelector('.contr-col-der')),
    textoHall: ((g('contr-texto-informe') || {}).textContent || '').trim().length,
    /* DENOMINADOR DE LA SIEMBRA: cuantos segmentos quedaron marcados de verdad. Sin esto, un
       cuadro que «no crece» puede ser el arreglo roto o la siembra que no sembro. */
    nSeg: (() => { try {
      return Object.keys(contrEstado || {}).filter(k => Number(contrEstado[k]) > 0).length;
    } catch (e) { return 'ERR'; } })(),
    nLineas: (g('contr-texto-informe') || { children: [] }).children.length,
    alignItems: (() => { const f = g('lv3d-fila'); return f ? getComputedStyle(f).alignItems : '?'; })(),
    cols: (() => { const f = g('lv3d-fila'); return f ? getComputedStyle(f).gridTemplateColumns : '?'; })(),
    /* Los dos botones, por su rotulo y su piso tactil: que sigan siendo los MISMOS. */
    botones: Array.prototype.map.call(
      (g('lv3d-bloque-botones') || document.createElement('div')).querySelectorAll('button'),
      b => ({ txt: (b.textContent || '').replace(/\s+/g, ' ').trim(),
              h: Math.round(b.getBoundingClientRect().height),
              id: b.id || '' })),
    /* Cuantos cuadros hay en TODO el documento: el punto 5 (no duplicar). Se cuenta el BLOQUE y
       su campo, no un rotulo: «🧹 Limpiar» aparece en cinco modulos distintos de la app y
       contarlo daria cinco en los dos arboles, que no dice nada. */
    nBloques: document.querySelectorAll('#lv3d-bloque-botones').length,
    nSlots: document.querySelectorAll('#lv3d-slot-botones').length,
    nPdfTog: document.querySelectorAll('#contr-pdf-toggle').length,
    nCampo: document.querySelectorAll('#contr_be_pdf').length
  });

  /* ══ CERRADO, sin hallazgos ═════════════════════════════════════════════════════════════ */
  try { if (typeof lv3dCerrar === 'function') lv3dCerrar(); } catch (e) {}
  limpiar(); await esp(200);
  o.cerrado0 = foto();

  /* ══ CERRADO, con cinco hallazgos ══════════════════════════════════════════════════════ */
  sembrar(5); await esp(220);
  o.cerrado5 = foto();

  /* ══ ABIERTO, con cinco hallazgos ══════════════════════════════════════════════════════ */
  try { if (typeof lv3dAbrir === 'function') lv3dAbrir(); } catch (e) {}
  await esp(500);
  o.abierto5 = foto();

  /* ══ ABIERTO, sin hallazgos ════════════════════════════════════════════════════════════ */
  limpiar(); await esp(260);
  o.abierto0 = foto();

  /* ══ LOS CRITERIOS, calculados acá y no leídos a ojo del volcado ═══════════════════════ */
  const ang = innerWidth <= 768;
  o.angosto = ang;
  /* (1) El cuadro de los botones no se mueve al abrir el 3D. */
  o.c1_botNoSeMueve = (() => {
    const a = o.cerrado5.bot, b = o.abierto5.bot;
    if (!a || !b) return 'SIN CAJA';
    return { dt: b.t - a.t, dl: b.l - a.l, dw: b.w - a.w, dh: b.h - a.h };
  })();
  /* (2) Hallazgos crece con los hallazgos y NO iguala el alto del 3D. */
  o.c2_hallCrece = (o.abierto5.hall && o.abierto0.hall)
    ? (o.abierto5.hall.h - o.abierto0.hall.h) : 'SIN CAJA';
  o.c2_hallVsPanel = (o.abierto5.hall && o.abierto5.panel)
    ? { hall: o.abierto5.hall.h, panel: o.abierto5.panel.h,
        iguala: Math.abs(o.abierto5.hall.h - o.abierto5.panel.h) <= 2 } : 'SIN CAJA';
  /* (3) La fila del 3D no cambia: se compara contra el otro arbol, afuera. */
  o.c3_fila3d = { lienzo: o.abierto5.lienzo, colDer3d: o.abierto5.colDer3d, canvas: o.abierto5.canvas };
  /* (4) El territorio no se mueve entre los cuatro estados. */
  o.c4_terrQuieto = (() => {
    const t = [o.cerrado0.terr, o.cerrado5.terr, o.abierto5.terr, o.abierto0.terr].filter(Boolean);
    if (t.length < 4) return 'SIN CAJA';
    return { dl: Math.max.apply(null, t.map(x => x.l)) - Math.min.apply(null, t.map(x => x.l)),
             dt: Math.max.apply(null, t.map(x => x.t)) - Math.min.apply(null, t.map(x => x.t)) };
  })();

  /* Desplazamiento horizontal y texto recortado dentro de la seccion. */
  sembrar(5); await esp(220);
  o.scrollDoc = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const rec = [];
  Array.prototype.forEach.call(document.querySelectorAll('#sacc-contr *'), e => {
    if (e.children.length) return;
    const t = (e.textContent || '').trim();
    if (!t) return;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible')
      rec.push(t.slice(0, 26));
  });
  o.recortados = rec;
  /* Area tactil de los dos botones: que ninguno caiga por debajo de 44 px. */
  o.tactil = (o.abierto5.botones || []).map(b => b.h);
  return o;
})
