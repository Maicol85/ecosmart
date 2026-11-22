/* Cuerpo de _probe_p13_0.mjs - BLOQUE 0 de la tanda P13. Corre DENTRO del navegador.
 *
 * VIVE EN UN ARCHIVO APARTE A PROPOSITO, igual que el de MEDIR-4b y el de P11: metido en un
 * template literal de la sonda, un acento grave en un comentario lo cierra antes de tiempo, y
 * cuando lo que queda es JS valido node --check NO lo ve.
 *
 * MIDE, sin tocar una linea del producto. Cada bloque es un punto del PROMPT 13:
 *   A1  1a - visibilidad de "+ Vista" y "Cerrar" con el visor recien abierto (sin medir)
 *   A2  1b/1d - cuantos "Cerrar vista" y cuantos botones de tamanio hay, y donde viven
 *   A3  1c - los rotulos por posicion con dos vistas, y al cerrar la de la izquierda
 *   A4  1f - alineacion: y y tamanio de las dos imagenes, con una y con dos vistas
 *   A5  1g - la tabla salta de columna al tocar Medir en la otra vista
 *   A6  1i - el boton de guardar el cineloop existe
 *   A7  1j - al abrir un video NUEVO: vistas fantasma y medidas arrastradas
 *   A8  1m - los contornos del Simpson al tocar Listo
 *   A9  1h - el boton de la columna escondida en tamanio Normal
 *   B1  4g - el visor lee los diametros cargados a mano en la app
 */
(async () => {
  const o = { err: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const visible = el => {
    if (!el) return false;
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
  };
  const padre = el => (el && el.parentElement) ? (el.parentElement.id || el.parentElement.className || '?') : null;

  o.temaReal = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  o.vp = { w: window.innerWidth, h: window.innerHeight };

  /* El fixture: una region 2D isotropica, el mismo de las sondas de esta casa. */
  const jpg = new Uint8Array([255,216,255,217]);
  const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 };
  const mk = (n, c) => ({ nombre:n, cuadros:(c||6), d:{ frags:[jpg,jpg,jpg,jpg,jpg,jpg], cols:1016, filas:708,
    msCuadro:40, regiones:[R2D] } });

  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}

  /* ══ B1 (4g) - LOS DIAMETROS DE LA APP, SEMBRADOS *ANTES* DE ABRIR EL VISOR ═══════════════
     Es el orden del medico: carga 20 y 25 a mano en el informe y despues abre el visor. */
  const sembrar = (id, v) => { try { const e = $(id); if (!e) return 'no existe';
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true })); return 'ok'; } catch (x) { return 'ERR'; } };
  o.B1siembra = { diam_tsvi: sembrar('diam_tsvi', '20'), tsvd_diametro: sembrar('tsvd_diametro', '25') };
  await esp(320);

  try { _cineAbrir([mk('P13-A')]); } catch (e) { o.err.push('abrir: ' + e.message); return o; }
  await esp(520);

  /* ── A1 (1a): el visor recien abierto, SIN medir ── */
  const estado = () => {
    const ov = $('cine-ov');
    return { min: !!(ov && ov.classList.contains('cine-min')),
             max: !!(ov && ov.classList.contains('cine-max')),
             sinpanel: !!(ov && ov.classList.contains('cine-sinpanel')) };
  };
  const censo = () => ({
    addB:      visible($('cine-add-b')),
    cerrar:    visible($('cine-cerrar')),
    cerrarTodo:visible($('cine-cerrar-todo')),
    maxi:      visible($('cine-maxi')),
    maxiPadre: padre($('cine-maxi')),
    maxiN:     document.querySelectorAll('[id$="cine-maxi"]').length,
    guardar:   visible($('cine-guardar')),
    cerrarV:   Array.prototype.map.call(document.querySelectorAll('[id$="cine-cerrar-v"]'),
                 e => ({ id:e.id, vis:visible(e), padre:padre(e) })),
    pan:       Array.prototype.map.call(document.querySelectorAll('[id$="cine-pan"]'),
                 e => ({ id:e.id, vis:visible(e) }))
  });
  o.A1abierto = { estado: estado(), ...censo() };

  /* ── A1b: lo mismo despues de tocar Medir ── */
  try { $('cine-medir').click(); } catch (e) { o.err.push('medir: ' + e.message); }
  await esp(420);
  o.A1midiendo = { estado: estado(), ...censo() };

  /* ── A4 (1f) con UNA vista: donde arranca la imagen ── */
  const imgs = () => Array.prototype.map.call(document.querySelectorAll('[id$="cine-cv"]'),
    e => ({ id:e.id, ...caja(e) }));
  const barras = () => Array.prototype.map.call(document.querySelectorAll('[id$="cine-grp-med"]'),
    e => ({ id:e.id, ...caja(e), padre:padre(e), botones:e.querySelectorAll('button').length }));
  o.A4una = { imgs: imgs(), barras: barras(),
    modal: caja($('cine-modal')),
    modalScrollY: (function(){ const m=$('cine-modal'); return m ? m.scrollHeight - m.clientHeight : null; })() };

  /* ── B1 (4g): ¿la tabla del visor muestra los 20 y 25 de la app? ── */
  o.B1 = (function () {
    try {
      const r = { d2: null, dop: null, campos: {} };
      r.campos.diam_tsvi = $('diam_tsvi') ? $('diam_tsvi').value : 'no existe';
      r.campos.tsvd_diametro = $('tsvd_diametro') ? $('tsvd_diametro').value : 'no existe';
      r.d2 = (typeof _d2Valor === 'function')
        ? { 'vi.tsvi': _d2Valor('vi.tsvi'), 'vd.tsvd': _d2Valor('vd.tsvd'), 'vci.vci': _d2Valor('vci.vci') } : 'no hay _d2Valor';
      r.dop = (typeof _dopEstado === 'function')
        ? { 'ao.diam': _dopEstado().ao.diam, 'pul.diamTsvd': _dopEstado().pul.diamTsvd } : 'no hay _dopEstado';
      /* Y lo que el medico VE: la fila de la tabla. */
      try { d2Modo('ao'); } catch (e) {}
      const t = $('d2-cajon');
      r.tablaAo = t ? (t.textContent || '').replace(/\s+/g, ' ').slice(0, 300) : null;
      r.tablaAoVis = visible(t);
      /* El panel de VTI y su boton de usar la ultima regla como diametro. */
      r.btnDiam = document.querySelectorAll('[data-vti-diam]').length;
      return r;
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── A9 (1h): el boton de la columna en tamanio Normal ── */
  o.A9panNormal = (function () {
    try { const b = $('cine-pan'); if (!b) return 'no existe';
      return { vis: visible(b), display: getComputedStyle(b).display, max: estado().max }; }
    catch (e) { return 'ERR'; }
  })();

  /* ── A3 (1c) y A2 (1b/1d): DOS vistas ──────────────────────────────────────────────────
     SE MONTAN A MANO Y NO POR `vistaBAbrir`, y esto lo decidio medir: esa funcion pide el
     estudio GUARDADO (`_imgUuidActual`) y lista los cineloops del disco, asi que sin estudio
     devuelve false, llama a `vistaBCerrar` y la sonda mide DOS VISTAS QUE NUNCA SE ABRIERON
     —lo que se lee igual que «todo bien». Es el camino de TC-199. */
  try {
    const cont = $('cine-paneles');
    const libre = (_vistaA && _vistaA.pfx === 'b-') ? { p:'', r:'A' } : { p:'b-', r:'B' };
    const VB = _vNueva(libre.p, libre.r);
    _vMontarPanel(cont, libre.p);
    _vistaB = VB;
    _vCablear(VB);
    _vCon(VB, () => { VB.datos = { loops:[mk('P13-B2')], i:0, cuadro:0, timer:null }; _cineCargarLoop(); });
    _vAccionesSync(); _vToggleSync();
    _vCon(VB, () => { try { medToggle(); } catch (e) {} });
  } catch (e) { o.err.push('vistaB: ' + e.message); }
  await esp(700);
  const rots = () => Array.prototype.map.call(document.querySelectorAll('#cine-paneles > div'),
    (p, i) => { const b = p.querySelector('[id$="cine-encab"] b');
      return { i, id:p.id, rot: b ? b.textContent : null, x: Math.round(p.getBoundingClientRect().x) }; });
  o.A3dos = { hayB: !!_vistaB, pfxA: _vistaA.pfx, rotA: _vistaA.rot,
    pfxB: _vistaB ? _vistaB.pfx : null, rotB: _vistaB ? _vistaB.rot : null,
    paneles: rots(), ...censo(), imgs: imgs(), barras: barras() };

  /* ── A5 (1g): la tabla salta al tocar Medir en la otra vista ── */
  o.A5tabla = (function () {
    try {
      const d2 = $('d2-cajon'), dop = $('cine-dop-slot');
      return { d2Padre: padre(d2), dopPadre: padre(dop), d2Vis: visible(d2) };
    } catch (e) { return 'ERR'; }
  })();
  try {
    /* Se mide en la A (TAPSE) y despues se toca Medir en la B, que es el gesto del medico. */
    _vCon(_vistaA, () => { try { d2Modo('vd'); d2Armar('vd.tapse'); } catch (e) {} });
    await esp(260);
    o.A5trasMedirA = { d2Padre: padre($('d2-cajon')), destino: (typeof _d2Estado === 'function') ? _d2Estado().destino : null };
    if (_vistaB) { _vCon(_vistaB, () => { try { medHerramienta('dist'); } catch (e) {} }); }
    await esp(320);
    o.A5trasMedirB = { d2Padre: padre($('d2-cajon')) };
  } catch (e) { o.err.push('A5: ' + e.message); }

  /* ── A4b (1f) con dos vistas y en pantalla completa (1e) ── */
  o.A4dos = { imgs: imgs(), barras: barras(), cols: document.querySelectorAll('#cine-paneles .cine-col-der').length,
    colsVis: Array.prototype.filter.call(document.querySelectorAll('#cine-paneles .cine-col-der'), visible).length };
  try { cineMaxToggle(); } catch (e) {}
  await esp(520);
  o.A4dosMax = { imgs: imgs(), barras: barras(),
    cols: document.querySelectorAll('#cine-paneles .cine-col-der').length,
    colsVis: Array.prototype.filter.call(document.querySelectorAll('#cine-paneles .cine-col-der'), visible).length,
    pan: Array.prototype.map.call(document.querySelectorAll('[id$="cine-pan"]'), e => ({ id:e.id, vis:visible(e) })),
    maxiN: document.querySelectorAll('[id$="cine-maxi"]').length, maxiPadre: padre($('cine-maxi')) };
  try { cineMaxToggle(); } catch (e) {}
  await esp(320);

  /* ── A6 (1i): el boton de guardar el cineloop ── */
  o.A6guardar = (function () {
    try { const b = $('cine-guardar'); if (!b) return 'no existe';
      return { txt: (b.textContent || '').trim().slice(0,60), vis: visible(b), enMin: estado().min }; }
    catch (e) { return 'ERR'; }
  })();

  /* ── A8 (1m): los contornos del Simpson al tocar Listo ── */
  o.A8simpson = (function () {
    try {
      const cv = $('cine-med');
      if (!cv) return 'no hay canvas de medicion';
      const tinta = () => {
        try { const g = cv.getContext('2d');
          const d = g.getImageData(0, 0, cv.width, cv.height).data;
          let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++;
          return n; } catch (e) { return 'ERR ' + e.message; }
      };
      return { tintaAntes: tinta(), w: cv.width, h: cv.height };
    } catch (e) { return 'ERR'; }
  })();
  /* El trazado va con eventos de raton REALES y se confirma con `medSimpsonConfirmar`, que es
     el camino de los casos del suite: `_simp.pendiente` tiene `pts`, `eje`, `diam` y `cmPorPx`,
     y armarlo a mano mide otra cosa. `_simp.pares` tiene SIEMPRE largo 2 —son las dos ranuras de
     ventana, no los contornos— asi que lo que se cuenta es cuantos casilleros tienen algo. */
  o.A8traza = await (async () => {
    try {
      const cv = $('cine-med');
      if (!cv) return 'no hay canvas';
      _vCon(_vistaA, () => { try { medHerramienta('simpson'); } catch (e) {} });
      await esp(140);
      const ac = (x, y) => { const r = cv.getBoundingClientRect();
        return { clientX: r.left + x * (r.width / cv.width), clientY: r.top + y * (r.height / cv.height) }; };
      const tri = (cx, yb, W, H) => { const p = [], paso = 12, x0 = cx - W/2, x1 = cx + W/2, ya = yb - H;
        const n1 = Math.ceil(Math.hypot(W/2, H) / paso);
        for (let i = 0; i <= n1; i++) p.push({ x: x0 + (cx-x0)*i/n1, y: yb + (ya-yb)*i/n1 });
        for (let i = 1; i <= n1; i++) p.push({ x: cx + (x1-cx)*i/n1, y: ya + (yb-ya)*i/n1 });
        return p.map(q => ({ x: Math.round(q.x), y: Math.round(q.y) })); };
      const trazar = async pts => {
        cv.dispatchEvent(new MouseEvent('mousedown', Object.assign({ bubbles:true }, ac(pts[0].x, pts[0].y))));
        for (let i = 1; i < pts.length; i++)
          cv.dispatchEvent(new MouseEvent('mousemove', Object.assign({ bubbles:true }, ac(pts[i].x, pts[i].y))));
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles:true }));
        const z = pts[pts.length-1];
        cv.dispatchEvent(new MouseEvent('click', Object.assign({ bubbles:true }, ac(z.x, z.y))));
        await esp(140);
      };
      const tinta = () => { try { const g = cv.getContext('2d');
        const d = g.getImageData(0, 0, cv.width, cv.height).data;
        let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++; return n; } catch (e) { return 'ERR'; } };
      const llenos = () => { try { const S = _vistaA.simp; if (!S) return 0;
        let n = 0; (S.pares || []).forEach(r => { if (r && r.d) n++; if (r && r.s) n++; }); return n; } catch (e) { return 'ERR'; } };
      const R = {};
      await trazar(tri(300, 450, 200, 300));
      R.trasTrazarD = { tinta: tinta(), pendiente: !!_vistaA.simp && !!_vistaA.simp.pendiente };
      _vCon(_vistaA, () => { try { medSimpsonConfirmar(); } catch (e) {} });
      await esp(200);
      /* ESTE es el control de que no se reabre el defecto de P11: confirmada la diastole, la
         fase pasa a sistole y NO se tiene que ver nada. */
      R.trasConfirmarD = { tinta: tinta(), fase: _vistaA.simp.fase, llenos: llenos() };
      await trazar(tri(300, 450, 120, 300));
      _vCon(_vistaA, () => { try { medSimpsonConfirmar(); } catch (e) {} });
      await esp(220);
      R.trasListo = { tinta: tinta(), fase: _vistaA.simp.fase, llenos: llenos(),
        ocultar: !!_vistaA.simp.ocultar, fevi: _vistaA.simp.res ? _vistaA.simp.res.fevi : null };
      return R;
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── A6 (1i): el boton de guardar el cineloop ── */
  o.A6guardar = (function () {
    try { const b = $('cine-guardar'); if (!b) return 'no existe';
      return { txt: (b.textContent || '').trim().slice(0,60), vis: visible(b), enMin: estado().min }; }
    catch (e) { return 'ERR'; }
  })();

  /* ── A8 (1m): los contornos del Simpson al tocar Listo ── */
  o.A8simpson = (function () {
    try {
      const cv = $('cine-med');
      if (!cv) return 'no hay canvas de medicion';
      const tinta = () => {
        try { const g = cv.getContext('2d');
          const d = g.getImageData(0, 0, cv.width, cv.height).data;
          let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++;
          return n; } catch (e) { return 'ERR ' + e.message; }
      };
      return { tintaAntes: tinta(), w: cv.width, h: cv.height };
    } catch (e) { return 'ERR'; }
  })();
  try {
    _vCon(_vistaA, () => {
      medHerramienta('simpson');
      /* Los dos contornos se siembran por la puerta del gesto: _simpAceptar es la que
         confirma un trazado, y es la que el boton Listo llama. */
      const pts = (dy) => { const a = []; for (let k = 0; k < 14; k++)
        a.push({ x: 300 + 90 * Math.sin(k / 13 * Math.PI), y: 80 + dy + k * 24 }); return a; };
      try { _medTrazo = { pts: pts(0) }; } catch (e) {}
      try { if (typeof _simpAceptar === 'function') _simpAceptar(); } catch (e) {}
      try { _medTrazo = { pts: pts(10) }; } catch (e) {}
      try { if (typeof _simpAceptar === 'function') _simpAceptar(); } catch (e) {}
      try { _medPintar(); } catch (e) {}
    });
  } catch (e) { o.err.push('simpson: ' + e.message); }
  await esp(520);
  o.A8tras = (function () {
    try {
      const cv = $('cine-med'); if (!cv) return 'no hay canvas';
      const g = cv.getContext('2d');
      const d = g.getImageData(0, 0, cv.width, cv.height).data;
      let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++;
      const S = _vistaA.simp;
      return { tinta: n, pares: S ? (S.pares || []).length : null,
        pendiente: !!(S && S.pendiente), fase: S ? S.fase : null,
        ocultar: !!(S && S.ocultar), uni: visible($('cine-simp-uni')) };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── A3b (1c): cerrar la vista de la IZQUIERDA ── */
  try {
    const izq = o.A3dos.paneles.length > 1
      ? (o.A3dos.paneles[0].x <= o.A3dos.paneles[1].x ? o.A3dos.paneles[0] : o.A3dos.paneles[1]) : null;
    const Vizq = (izq && izq.id && izq.id.indexOf('b-') === 0) ? _vistaB : _vistaA;
    if (_vistaB) vistaCerrarUna(Vizq);
  } catch (e) { o.err.push('cerrarIzq: ' + e.message); }
  await esp(420);
  o.A3trasCerrarIzq = { pfxA: _vistaA.pfx, rotA: _vistaA.rot, hayB: !!_vistaB, paneles: rots(),
    maxiN: document.querySelectorAll('[id$="cine-maxi"]').length,
    /* El boton de la vista que SOBREVIVE, por su prefijo: medir `cine-maxi` pelado despues de
       cerrar la vista sin prefijo es medir un id que ya no existe. */
    maxiSobrevive: visible($(_vistaA.pfx + 'cine-maxi')),
    cerrarVvis: visible($(_vistaA.pfx + 'cine-cerrar-v')) };

  /* ── A9b (1h): el boton de la columna con la columna ESCONDIDA, en tamanio Normal ── */
  o.A9b = (function () {
    try {
      const pf = _vistaA.pfx;
      const r = {};
      const ov = $('cine-ov');
      r.normalConColumna = visible($(pf + 'cine-pan'));
      cinePanelToggle();
      r.sinpanel = ov.classList.contains('cine-sinpanel');
      r.normalSinColumna = visible($(pf + 'cine-pan'));
      r.colVis = visible($(pf + 'cine-col'));
      /* Y que salir de pantalla completa devuelva la columna: se entra y se sale. */
      cineMaxToggle();
      const enMax = { sinpanel: ov.classList.contains('cine-sinpanel') };
      cineMaxToggle();
      r.trasSalirDeMax = { sinpanel: ov.classList.contains('cine-sinpanel'), colVis: visible($(pf + 'cine-col')) };
      r.enMax = enMax;
      return r;
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── A7 (1j): abrir un video NUEVO ── */
  try { _cineAbrir([mk('P13-B', 4)]); } catch (e) { o.err.push('abrir2: ' + e.message); }
  await esp(620);
  o.A7nuevo = {
    paneles: document.querySelectorAll('#cine-paneles > div').length,
    panelesVis: Array.prototype.filter.call(document.querySelectorAll('#cine-paneles > div'), visible).length,
    hayB: !!_vistaB,
    d2Vals: (typeof _d2Estado === 'function')
      ? JSON.stringify(_d2Estado().vi) + ' | vd:' + JSON.stringify(_d2Estado().vd) : 'n/d',
    medLineas: _vistaA.medLineas.length, medVtis: _vistaA.medVtis.length,
    simp: _vistaA.simp ? ((_vistaA.simp.pares || []).length + ' pares') : 'null',
    tablaD2: (function(){ const t = $('d2-cajon'); return t ? (t.textContent||'').replace(/\s+/g,' ').slice(0,200) : null; })(),
    tablaD2Vis: visible($('d2-cajon'))
  };

  return o;
})()
