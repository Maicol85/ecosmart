/* Cuerpo de _probe_medir4b.mjs, que corre DENTRO del navegador.
 *
 * ⚠️ VIVE EN UN ARCHIVO APARTE A PROPOSITO, y es una mejora de metodo de esta tanda: metido en un
 * template literal de la sonda, un acento grave en un comentario lo cierra antes de tiempo, y
 * cuando lo que queda es JS valido `node --check` NO lo ve. Esta casa lo pago veintiocho tandas
 * seguidas. Acá se lee con readFile y se pasa a page.evaluate como texto, asi que los acentos
 * graves son simplemente codigo y no hay nada que escapar.
 */
(async () => {
  const o = { err: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const txt = id => { const e = $(id); return e ? (e.textContent || '') : null; };
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };

  /* El tema que de verdad quedo puesto, DEVUELTO: es lo que impide informar «dos temas» habiendo
     medido dos veces el mismo. */
  o.temaReal = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  o.colorTexto = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();

  /* ── Contraste WCAG, el mismo calculo que la sonda de MEDIR-4a ── */
  const rgb = s => { const m = /rgba?\(([^)]+)\)/.exec(String(s)); if (!m) return null;
    const n = m[1].split(',').map(x => parseFloat(x));
    return { r:n[0], g:n[1], b:n[2], a:(n.length > 3 ? n[3] : 1) }; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(c.r) + 0.7152*f(c.g) + 0.0722*f(c.b); };
  const mezcla = (fg, bg) => ({ r: fg.r*fg.a + bg.r*(1-fg.a), g: fg.g*fg.a + bg.g*(1-fg.a),
    b: fg.b*fg.a + bg.b*(1-fg.a), a:1 });
  const fondoDe = el => { let n = el;
    while (n && n.nodeType === 1) { const c = rgb(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.05) return c; n = n.parentElement; }
    return { r:255, g:255, b:255, a:1 }; };
  const contraste = el => { try {
      const fg0 = rgb(getComputedStyle(el).color); if (!fg0) return null;
      const bg = fondoDe(el); const fg = fg0.a < 1 ? mezcla(fg0, bg) : fg0;
      const L1 = lum(fg), L2 = lum(bg);
      return Math.round(((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05))*100)/100;
    } catch (e) { return null; } };

  /* ── El fixture: dos regiones como un DICOM, isotropicas ── */
  const jpg = new Uint8Array([255,216,255,217]);
  const R2D  = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:240, tipo:1 };
  const RDOP = { ux:4, uy:7, dx:0.004, dy:-0.5, ry0:420, rvy:0, x0:0, y0:250, x1:600, y1:500, tipo:2 };
  const mk = (n, c) => ({ nombre:n, cuadros:(c||1), d:{ frags:[jpg], cols:600, filas:500,
    msCuadro:40, regiones:[R2D, RDOP] } });

  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}
  try { const sv = (id, v) => { const e = $(id); if (e) { e.value = v;
    e.dispatchEvent(new Event('input', { bubbles:true })); e.dispatchEvent(new Event('change', { bubbles:true })); } };
    sv('peso', '70'); sv('talla', '170'); } catch (e) { o.err.push('bsa: ' + e.message); }
  o.bsa = (typeof getBSA === 'function') ? getBSA() : null;

  /* ⚠️ EL TOGGLE DE GUARDADO SE PRENDE ANTES DE TOMAR LA FOTO DE `localStorage`, porque lo
     prende ESTA SONDA —`imgRestaurar` sale temprano sin el y el selector de la vista B no
     abriria— y no la funcion que se esta midiendo. Con la foto tomada antes, `cfg-guardar-imagenes`
     aparecia como «clave nueva» y se leia como si el Simpson escribiera en disco. */
  try { cfgToggleGuardarImagenes(true); } catch (e) {}
  await esp(120);
  const lsAntes = (function () { const a = []; for (let i=0;i<localStorage.length;i++) a.push(localStorage.key(i)); return a.sort(); })();

  /* ══ X2 — LA LINEA BASE NUMERICA, SOBRE INSUMOS SEMBRADOS Y NO SOBRE EL GESTO ═══════════════
     ⚠️ ES ASI Y NO MIDIENDO LA FEVI QUE SALE DE TRAZAR, y esto se descubrio midiendo: el mismo
     triangulo trazado con el raton da un numero LIGERAMENTE distinto segun el layout, porque las
     coordenadas de imagen salen de `getBoundingClientRect()` del canvas y el redondeo cambia con
     el ancho de la ventana. O sea que «los mismos trazados» no quiere decir «el mismo gesto»:
     quiere decir los mismos `diamCm` y el mismo `Lcm`. Sembrandolos, el contrato es exacto y
     ademas vale igual en los ocho anchos y en los dos motores.
     Los diametros son una rampa fija; no representan un ventriculo, representan un INSUMO. */
  o.x2num = (function () {
    try {
      const N = (typeof SIMP_N !== 'undefined') ? SIMP_N : 20;
      const ramp = (a, b) => { const v = []; for (let i = 0; i < N; i++) v.push(a + (b - a) * i / (N - 1)); return v; };
      const d4d = ramp(4.0, 1.2), d4s = ramp(2.6, 0.8), d2d = ramp(3.6, 1.0), d2s = ramp(2.4, 0.7);
      const vfdMono = _simpVolumenML(d4d, d4d, 8.4), vfsMono = _simpVolumenML(d4s, d4s, 8.0);
      const vfdBi = _simpVolumenML(d4d, d2d, 8.4), vfsBi = _simpVolumenML(d4s, d2s, 8.0);
      return {
        vfdMono: +vfdMono.toFixed(6), vfsMono: +vfsMono.toFixed(6),
        feviMono: +(((vfdMono - vfsMono) / vfdMono) * 100).toFixed(6),
        vfdBi: +vfdBi.toFixed(6), vfsBi: +vfsBi.toFixed(6),
        feviBi: +(((vfdBi - vfsBi) / vfdBi) * 100).toFixed(6),
        /* Y la clasificacion de esos mismos numeros, que es la que el panel publica. */
        clasMono: _simpClasificar(((vfdMono - vfsMono) / vfdMono) * 100).txt,
        clasBi: _simpClasificar(((vfdBi - vfsBi) / vfdBi) * 100).txt,
        discos: N
      };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  try { _cineAbrir([mk('A4C-fix')]); } catch (e) { o.err.push('abrir: ' + e.message); return o; }
  await esp(460);
  try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) { o.err.push('medir: ' + e.message); }
  await esp(360);

  /* La barra de SIETE botones de la vista A, ANTES de tocar el Simpson: es el control de que la
     barra de dos pasos no le cambia el alto ni el orden (A3). */
  const barraDe = pfx => { const b = document.getElementById(pfx + 'cine-med-barra');
    const bar = document.querySelector('#' + (pfx ? pfx : '') + 'cine-panel .cine-barra')
             || (b ? b.parentElement.querySelector('.cine-barra') : null);
    if (!bar) return null;
    const bs = Array.from(bar.querySelectorAll('button'));
    return { n: bs.length, alto: Math.round(bar.getBoundingClientRect().height),
             rot: bs.map(x => (x.textContent||'').trim().slice(0,18)),
             altos: bs.map(x => Math.round(x.getBoundingClientRect().height)) };
  };
  o.barraAntes = barraDe('');

  /* ── El trazador, el triangulo isosceles de TC-190 ── */
  const trazarEn = async (pfx, pts) => {
    const cv = document.getElementById(pfx + 'cine-med');
    if (!cv) { o.err.push('sin canvas ' + pfx); return false; }
    const ac = (x, y) => { const r = cv.getBoundingClientRect();
      return { clientX: r.left + x * (r.width / cv.width), clientY: r.top + y * (r.height / cv.height) }; };
    cv.dispatchEvent(new MouseEvent('mousedown', Object.assign({ bubbles:true }, ac(pts[0].x, pts[0].y))));
    for (let i = 1; i < pts.length; i++)
      cv.dispatchEvent(new MouseEvent('mousemove', Object.assign({ bubbles:true }, ac(pts[i].x, pts[i].y))));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles:true }));
    const z = pts[pts.length-1];
    cv.dispatchEvent(new MouseEvent('click', Object.assign({ bubbles:true }, ac(z.x, z.y))));
    await esp(140);
    return true;
  };
  const tri = (cx, yb, W, H) => {
    const p = [], paso = 12, x0 = cx - W/2, x1 = cx + W/2, ya = yb - H;
    const n1 = Math.ceil(Math.hypot(W/2, H) / paso);
    for (let i = 0; i <= n1; i++) p.push({ x: x0 + (cx-x0)*i/n1, y: yb + (ya-yb)*i/n1 });
    for (let i = 1; i <= n1; i++) p.push({ x: cx + (x1-cx)*i/n1, y: ya + (yb-ya)*i/n1 });
    return p.map(q => ({ x: Math.round(q.x), y: Math.round(q.y) }));
  };
  const CX = 300, YB = 235, H = 200, W4D = 200, W4S = 120, W2D = 180, W2S = 126;

  /* El boton del paso y el Listo de una vista, por su atributo. */
  const pasos = pfx => Array.from(document.querySelectorAll('[data-simp-paso][data-simp-pfx="' + pfx + '"]'));
  const listoDe = pfx => document.querySelector('[data-simp-listo][data-simp-pfx="' + pfx + '"]');

  /* ══ A1 — LA VENTANA QUEDA RESUELTA AL ABRIR LA HERRAMIENTA ═══════════════════════════════ */
  try { if (typeof __t === 'object' && __t && __t.herr) __t.herr('cine-med-simp');
        else medHerramienta('simpson'); } catch (e) { o.err.push('herr: ' + e.message); }
  await esp(300);
  o.a1 = {
    herrEsSimpson: (typeof _medHerr !== 'undefined') ? (_medHerr === 'simpson') : null,
    /* Antes de esta tanda nacia [null, null]. Ahora la ranura 0 nace declarada. */
    nombresAlNacer: (_simp && _simp.nombres) ? _simp.nombres.slice() : null,
    ventanaLibreDeA: (typeof _simpVentanaLibre === 'function') ? _simpVentanaLibre() : null,
    bloqueadaSinContorno: (typeof _simpVentanaBloqueada === 'function') ? _simpVentanaBloqueada() : null,
    panelDiceVentana: (txt('cine-med-barra')||'').indexOf('Ventana de este par') > -1,
    panelDiceA4C: (txt('cine-med-barra')||'').indexOf('A4C') > -1,
    /* Se puede cambiar ANTES de trazar: es lo que A1 permite. */
    cambioAntesDeTrazar: (function () {
      try { medSimpsonElegirVista('a2c'); const a = _simp.nombres.slice();
            medSimpsonElegirVista('a4c'); return { tras2c: a, vuelta: _simp.nombres.slice() }; }
      catch (e) { return 'ERR ' + e.message; }
    })()
  };

  /* ══ A2 / C1 — LA BARRA DE DOS PASOS ═════════════════════════════════════════════════════ */
  const ps0 = pasos('');
  o.a2 = {
    nPasos: ps0.length,
    rotulos: ps0.map(b => (b.textContent||'').trim()),
    actual: ps0.map(b => b.getAttribute('aria-current')),
    /* Un SOLO Listo en la vista, y CERO «Confirmar trazado» en el panel de abajo mientras la
       herramienta Simpson esta activa (el boton de rescate no se dibuja). */
    hayListo: !!listoDe(''),
    rotuloListo: listoDe('') ? (listoDe('').textContent||'').trim() : null,
    listoApagadoSinTrazado: listoDe('') ? listoDe('').getAttribute('aria-disabled') : null,
    /* ⚠️ NO lleva `disabled`: un control deshabilitado no emite click y no podria explicarse. */
    listoSinDisabled: listoDe('') ? !listoDe('').hasAttribute('disabled') : null,
    confirmarViejoEnUni: !!$('cine-simp-conf-u'),
    nListoEnDoc: document.querySelectorAll('[data-simp-listo]').length
  };

  /* ══ A3 — 44 px, AZUL SOLO PARA LO PRENDIDO, CONTRASTE, Y LA BARRA DE SIETE INTACTA ══════ */
  /* ⚠️ «AZUL SOLO PARA LO PRENDIDO» SE MIDE CONTRA EL COLOR DE ACENTO Y NO CON «¿tiene relleno?».
     La primera version contaba cualquier fondo con alfa > 0,2 y daba DOS de dos, porque
     `.btn-ghost` tambien trae un fondo propio: la medicion decia que los dos estaban prendidos
     sobre una barra que esta bien. Lo que hay que contar es cuantos llevan el ACENTO. */
  const acento = (function () {
    try { const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d);
      const c = rgb(getComputedStyle(d).color); d.remove(); return c; } catch (e) { return null; }
  })();
  const esAcento = el => { const c = rgb(getComputedStyle(el).backgroundColor);
    if (!c || !acento) return false;
    return Math.abs(c.r-acento.r) < 10 && Math.abs(c.g-acento.g) < 10 && Math.abs(c.b-acento.b) < 10 && c.a > 0.5; };
  o.a3 = {
    altosPasos: ps0.map(b => Math.round(b.getBoundingClientRect().height)),
    altoListo: listoDe('') ? Math.round(listoDe('').getBoundingClientRect().height) : null,
    /* Cuantos llevan el acento: tiene que ser UNO, el paso en curso. */
    conAcento: ps0.filter(esAcento).length,
    acentoRGB: acento ? [Math.round(acento.r), Math.round(acento.g), Math.round(acento.b)] : null,
    contrastes: ps0.map(b => contraste(b)).concat([contraste(listoDe(''))]).filter(x => x != null),
    barraDespues: barraDe('')
  };
  o.a3.peorContraste = o.a3.contrastes.length ? Math.min.apply(null, o.a3.contrastes) : null;
  o.a3.barraIntacta = !!(o.barraAntes && o.a3.barraDespues &&
    o.barraAntes.n === o.a3.barraDespues.n &&
    o.barraAntes.alto === o.a3.barraDespues.alto &&
    o.barraAntes.rot.join('|') === o.a3.barraDespues.rot.join('|'));

  /* ── Los dos trazados de la vista A, apretando el Listo de verdad ── */
  await trazarEn('', tri(CX, YB, W4D, H));
  o.a2.pendienteTrasTrazar = !!(_simp && _simp.pendiente);
  o.a2.listoPrendidoConPendiente = listoDe('') ? (listoDe('').getAttribute('aria-disabled') === null) : null;
  if (listoDe('')) listoDe('').click();
  await esp(200);
  o.a2.faseTrasListo = _simp ? _simp.fase : null;
  o.a2.diastoleHecha = !!(_simp && _simp.pares[_simp.vista].d);
  o.a2.tildeEnDiastole = pasos('').map(b => (b.textContent||'').trim().indexOf('✓') === 0);
  /* Con un contorno confirmado la ventana YA NO se cambia (A1). */
  o.a1.bloqueadaConContorno = (typeof _simpVentanaBloqueada === 'function') ? _simpVentanaBloqueada() : null;
  o.a1.panelDiceNoSeCambia = (txt('cine-med-barra')||'').indexOf('ya no se cambia') > -1;

  await trazarEn('', tri(CX, YB, W4S, H));
  if (listoDe('')) listoDe('').click();
  await esp(240);
  o.a2.parCompleto = !!(_simp && _simp.pares[0].d && _simp.pares[0].s);
  o.x2 = { monoEsperado: (1 - (W4S*W4S)/(W4D*W4D)) * 100,
           monoMedido: (_simp && _simp.res) ? _simp.res.fevi : null };
  o.x2.monoCerca = (o.x2.monoMedido != null) ? Math.abs(o.x2.monoMedido - o.x2.monoEsperado) < 1.5 : null;

  /* ══ A2 — REHACER UNA FASE SIN PERDER LA OTRA ════════════════════════════════════════════ */
  o.rehacer = { antes: { d: !!_simp.pares[0].d, s: !!_simp.pares[0].s } };
  try {
    const pd = pasos('').filter(b => b.getAttribute('data-simp-paso') === 'd')[0];
    if (pd) pd.click();
    await esp(220);
    o.rehacer.tras = { d: !!_simp.pares[0].d, s: !!_simp.pares[0].s, fase: _simp.fase };
    /* La sistole SIGUE ahi: es todo el punto de rehacer una fase y no «Empezar de nuevo». */
    o.rehacer.sistoleSobrevive = !!_simp.pares[0].s;
    /* Y se vuelve a trazar la diastole para seguir midiendo. */
    await trazarEn('', tri(CX, YB, W4D, H));
    if (listoDe('')) listoDe('').click();
    await esp(220);
    o.rehacer.recuperado = !!(_simp.pares[0].d && _simp.pares[0].s);
    o.rehacer.feviIgual = (_simp.res && o.x2.monoMedido != null)
      ? Math.abs(_simp.res.fevi - o.x2.monoMedido) < 1e-9 : null;
  } catch (e) { o.err.push('rehacer: ' + e.message); }

  /* ══ A2 — EL «LISTO» DE RESCATE: CONFIRMAR NUNCA QUEDA INALCANZABLE ══════════════════════
     Con un contorno trazado y SIN confirmar, cambiar de herramienta esconde la barra de pasos
     —`_simpPanel` sólo se dibuja con la herramienta Simpson activa—, y ahí tiene que aparecer el
     botón de rescate en el panel de abajo. Es el defecto que este archivo ya documenta: sin esto
     el médico cambiaba de cuadro, `medReset` mataba el pendiente y lo trazado se perdía. */
  o.rescate = {};
  try {
    await trazarEn('', tri(CX, YB, W4S + 6, H));
    o.rescate.hayPendiente = !!(_simp && _simp.pendiente);
    o.rescate.pasosConSimpson = pasos('').length;
    o.rescate.rescateConSimpson = !!$('cine-simp-conf-u');
    medHerramienta('dist');
    await esp(280);
    o.rescate.pendienteSigue = !!(_simp && _simp.pendiente);
    o.rescate.pasosTrasCambiar = pasos('').length;
    o.rescate.rescateTrasCambiar = !!$('cine-simp-conf-u');
    o.rescate.rotuloRescate = txt('cine-simp-conf-u');
    /* Y confirma de verdad desde ahí. */
    const dAntes = !!(_simp && _simp.pares[0].d);
    if ($('cine-simp-conf-u')) $('cine-simp-conf-u').click();
    await esp(260);
    o.rescate.confirmoDesdeRescate = !!(_simp && _simp.pares[0].d) && !(_simp && _simp.pendiente);
    o.rescate.dAntes = dAntes;
    /* Se deja la diástole como estaba, para no ensuciar lo que sigue. */
    medHerramienta('simpson');
    await esp(220);
    medSimpsonRehacer('d');
    await esp(160);
    await trazarEn('', tri(CX, YB, W4D, H));
    if (listoDe('')) listoDe('').click();
    await esp(220);
    o.rescate.restaurado = !!(_simp && _simp.pares[0].d && _simp.pares[0].s);
  } catch (e) { o.err.push('rescate: ' + e.message); }

  /* ══ C5 — CON UNA SOLA VISTA, EL MONOPLANAR EN LA FRANJA DE ABAJO ════════════════════════ */
  o.c5 = {
    uniVisible: $('cine-simp-uni') ? getComputedStyle($('cine-simp-uni')).display !== 'none' : null,
    uniFueraDeColumna: !!($('cine-simp-uni') && !$('cine-simp-uni').closest('.cine-col-der')),
    uniDespuesDePaneles: (function () { const p = $('cine-paneles'), b = $('cine-simp-uni');
      return (p && b) ? !!(p.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) : null; })(),
    diceMonoplanar: (txt('cine-simp-uni')||'').indexOf('monoplanar') > -1,
    bipOculto: $('cine-biplano') ? getComputedStyle($('cine-biplano')).display === 'none' : null
  };

  /* ══ LA VISTA B, POR LA PUERTA REAL ══════════════════════════════════════════════════════ */
  try {
    const u8 = new Uint8Array([255,216,255,217]);
    const b64 = btoa(String.fromCharCode.apply(null, u8));
    const UU = 'estudio-de-prueba-0001';
    const reg = { id:'c-probe-1', uuid:UU, nombre:'A2C-fix', cuadros:3, bytes:9000,
      tipo:'loop', poster:'data:image/jpeg;base64,' + b64 };
    if (typeof CeiboCine === 'object' && CeiboCine) {
      CeiboCine.listar = async () => [reg]; CeiboCine.indice = async () => [reg];
    }
    window._cineLoopDeDisco = async () => mk('A2C-fix', 3);
    if (typeof CeiboImg === 'object' && CeiboImg) CeiboImg.leer = async () => [];
    /* imgRestaurar sale temprano con el guardado de imagenes apagado, asi que no dejaria el uuid
       y el selector no abriria. Y va DESPUES de imgVaciar, que lo pone en null. */
    try { cfgToggleGuardarImagenes(true); } catch (e) {}
    await esp(160);
    await imgRestaurar(UU);
    await esp(240);
    o.uuidPuesto = (typeof _imgUuidActual !== 'undefined') ? String(_imgUuidActual) : '(?)';
    const pr = vistaBAbrir();
    await esp(700);
    const th = document.querySelector('[data-vpick-i]');
    o.pickAbierto = !!th;
    if (th) { th.click(); await esp(900); }
    try { await pr; } catch (e) {}
    await esp(500);
  } catch (e) { o.err.push('vistaB: ' + e.message); }
  o.vistaBAbierta = !!_vistaB;
  o.nPaneles = document.querySelectorAll('#cine-paneles [id$="cine-panel"]').length;

  if (_vistaB) {
    const pfxB = _vistaB.pfx;
    o.pfxB = pfxB;
    /* ⚠️ CERO IDS DUPLICADOS, ACOTADO AL VISOR. El censo crudo del documento devuelve 43 que son
       TODOS de los SVG de matplotlib embebidos en la app (figure_1, patch_1, DejaVuSans-...),
       preexistentes y ajenos: contarlos da 43 siempre y no prueba nada. */
    o.idsDupVisor = (function () {
      const vistos = Object.create(null), dup = [];
      const ov = $('cine-ov'); if (!ov) return null;
      ov.querySelectorAll('[id]').forEach(e => {
        if (vistos[e.id]) { if (dup.indexOf(e.id) < 0) dup.push(e.id); } else vistos[e.id] = 1; });
      return dup;
    })();

    try { _vCon(_vistaB, () => { if (!_vistaB.medOn) medToggle(); }); } catch (e) { o.err.push('medirB: ' + e.message); }
    await esp(320);
    try { _vCon(_vistaB, () => medHerramienta('simpson')); } catch (e) { o.err.push('herrB: ' + e.message); }
    await esp(300);

    /* ══ A1 — LA SEGUNDA VISTA SE LLEVA LA VENTANA LIBRE ══════════════════════════════════ */
    o.a1.nombresB = _vistaB.simp ? _vistaB.simp.nombres.slice() : null;
    o.a1.repartoCorrecto = !!(_vistaA.simp && _vistaB.simp &&
      _vistaA.simp.nombres[0] === 'a4c' && _vistaB.simp.nombres[0] === 'a2c');
    /* ══ C1 — LOS DOS PASOS EN EL PANEL DE CADA VISTA ═════════════════════════════════════ */
    o.c1 = { pasosA: pasos('').length, pasosB: pasos(pfxB).length,
             listoA: !!listoDe(''), listoB: !!listoDe(pfxB),
             rotB: pasos(pfxB).map(b => (b.textContent||'').trim()),
             /* Cada barra DENTRO del panel de su vista: es lo que «a la derecha de su imagen»
                exige, y lo que un id sin prefijo habria roto. */
             barraBEnPanelB: (function () { const p = pasos(pfxB)[0];
               return p ? !!p.closest('#' + pfxB + 'cine-panel') : null; })(),
             barraAEnPanelA: (function () { const p = pasos('')[0];
               return p ? !!p.closest('#cine-panel') : null; })() };

    /* ── Los dos trazados de la B, con SU Listo ── */
    await trazarEn(pfxB, tri(CX, YB, W2D, H));
    o.c1.pendBtrasTrazar = !!(_vistaB.simp && _vistaB.simp.pendiente);
    /* ⚠️ EL LISTO DE LA B TIENE QUE CONFIRMAR EN LA B. Con un ruteo por la vista activa esto
       confirmaria en la A, porque `_V` fuera de un manejador envuelto es siempre `_vistaA`. */
    if (listoDe(pfxB)) listoDe(pfxB).click();
    await esp(220);
    o.c1.diastoleBhecha = !!(_vistaB.simp && _vistaB.simp.pares[0].d);
    o.c1.noEscribioEnA = !!(_vistaA.simp && _vistaA.simp.pares[0].d && _vistaA.simp.pares[0].s);
    await trazarEn(pfxB, tri(CX, YB, W2S, H));
    if (listoDe(pfxB)) listoDe(pfxB).click();
    await esp(300);

    /* ══ B1 — LOS DOS PARES CONVIVEN Y ALIMENTAN EL BIPLANO ══════════════════════════════ */
    o.b1 = {
      paresA: _vistaA.simp ? _vistaA.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null,
      paresB: _vistaB.simp ? _vistaB.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null,
      losDosAlaVez: !!(_vistaA.simp && _vistaA.simp.pares[0].d && _vistaA.simp.pares[0].s &&
                       _vistaB.simp && _vistaB.simp.pares[0].d && _vistaB.simp.pares[0].s),
      biplano: (function () { const R = _vBiplanoDatos();
        return R ? { vfd:+R.vfd.toFixed(3), vfs:+R.vfs.toFixed(3), fevi:+R.fevi.toFixed(3) } : null; })()
    };
    o.x2.biEsperado = (1 - (W2S*W4S)/(W2D*W4D)) * 100;
    o.x2.biMedido = o.b1.biplano ? o.b1.biplano.fevi : null;
    o.x2.biCerca = (o.x2.biMedido != null) ? Math.abs(o.x2.biMedido - o.x2.biEsperado) < 1.5 : null;
    o.x2.biVFD = o.b1.biplano ? o.b1.biplano.vfd : null;
    o.x2.biVFS = o.b1.biplano ? o.b1.biplano.vfs : null;

    /* ══ B2 — LA CALIBRACION NO SE MEZCLA ════════════════════════════════════════════════ */
    o.b2 = { antes: { a:_vistaA.medCalib, b:_vistaB.medCalib } };
    try {
      _vCon(_vistaA, () => { _medCalib = { mmPorPx: 0.123, mmPorPxY: 0.123 }; });
      o.b2.tras = { a: _vistaA.medCalib ? _vistaA.medCalib.mmPorPx : null,
                    b: _vistaB.medCalib ? _vistaB.medCalib.mmPorPx : null };
      o.b2.noSeMezcla = (o.b2.tras.a === 0.123 && o.b2.tras.b === null);
      _vCon(_vistaA, () => { _medCalib = null; });
    } catch (e) { o.err.push('b2: ' + e.message); }

    /* ══ C2 — LOS TRES NUMEROS GRANDES Y LA TABLA DE TRES FILAS ══════════════════════════ */
    const bip = $('cine-biplano');
    o.c2 = {
      bipVisible: bip ? getComputedStyle(bip).display !== 'none' : null,
      /* Los tres valores, por su tamaño de letra COMPUTADO: «grandes» es medible. */
      tamanos: bip ? Array.from(bip.querySelectorAll('div')).map(d => {
        const t = (d.textContent||'').trim();
        const fs = parseFloat(getComputedStyle(d).fontSize);
        return (fs >= 18 && /[0-9]/.test(t) && t.length < 16) ? { t: t.slice(0,14), fs: Math.round(fs) } : null;
      }).filter(Boolean) : null,
      /* La clasificacion que la app ya usa, por su palabra. */
      clasEnPanel: (function () { const s = txt('cine-biplano')||'';
        return (typeof FEVI_CATS !== 'undefined' ? FEVI_CATS : []).filter(c => s.indexOf(c.adj) > -1).map(c => c.adj); })(),
      /* La tabla: tres filas y sus columnas, con mL y mL/m2. */
      tabla: (function () {
        const t = $('cine-simp-uni') ? $('cine-simp-uni').querySelector('table') : null;
        if (!t) return null;
        const th = Array.from(t.querySelectorAll('thead th')).map(x => (x.textContent||'').trim());
        const tr = Array.from(t.querySelectorAll('tbody tr')).map(x =>
          Array.from(x.querySelectorAll('td')).map(y => (y.textContent||'').trim()));
        return { th: th, filas: tr.map(f => f[0]), nFilas: tr.length, nCols: th.length,
                 tieneML: th.filter(h => h.indexOf('mL') > -1 && h.indexOf('m²') < 0).length,
                 tieneIX: th.filter(h => h.indexOf('m²') > -1).length };
      })(),
      /* El resultado integrado, abajo y al medio: fuera de la columna y despues de los paneles. */
      bipFueraDeColumna: !!(bip && !bip.closest('.cine-col-der')),
      bipDespuesDePaneles: (function () { const p = $('cine-paneles');
        return (p && bip) ? !!(p.compareDocumentPosition(bip) & Node.DOCUMENT_POSITION_FOLLOWING) : null; })(),
      bipCentrado: (function () { const m = $('cine-modal'), b = caja(bip);
        if (!m || !b) return null; const mm = caja(m);
        return Math.round((b.x - mm.x) - ((mm.x + mm.w) - (b.x + b.w))); })(),
      /* Nada cortado ni desbordado. */
      desbordeTabla: (function () { const t = $('cine-simp-uni') ? $('cine-simp-uni').querySelector('table') : null;
        return t ? (t.scrollWidth - t.clientWidth) : null; })(),
      docScrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      cortados: (function () { let n = 0; const c = $('cine-biplano');
        if (!c) return 0;
        c.querySelectorAll('div,span,b').forEach(e => { if (e.children.length === 0 &&
          (e.scrollWidth - e.clientWidth) > 1) n++; });
        return n; })()
    };

    /* ══ C3 — LAS NOTAS DE METODO DENTRO DEL GLOBO Y YA NO EN EL PANEL ═══════════════════ */
    const PANEL = (txt('cine-biplano')||'') + ' ' + (txt('cine-simp-uni')||'') + ' ' +
                  (txt('cine-med-barra')||'') + ' ' + (txt(pfxB + 'cine-med-barra')||'');
    const GLOBO = (typeof _medPanelInfo === 'function')
      ? (function () { const d = _medPanelInfo('simp-metodo'); return d ? d.txts.join(' \n ') : ''; })() : '';
    const CLAVES = (typeof _medPanelInfo === 'function') ? _medPanelInfo() : null;
    const FR = [
      ['noEsPromedio', 'no es el promedio de las dos ventanas'],
      ['productoCruzado', 'producto cruzado'],
      ['ejeMasLargo', 'eje largo más largo'],
      ['veyec', 'VEyec = VFD − VFS'],
      ['cadaVentanaMono', 'SU monoplanar'],
      ['aseEacvi', 'ASE/EACVI 2015'],
      ['escalaSuImagen', 'escala de SU imagen'],
      ['clasifInforme', 'clasificación de la FEVI es la misma que usa el informe'],
      ['apexEscorzado', 'ápex está bien visualizado'],
      ['monoAsume', 'asume el ventrículo circular'],
      ['guiaRecomienda', 'La guía recomienda el biplano'],
      ['dosCaminos', 'tocar «➕ Vista»'],
      ['contornosNoGuardan', 'contornos no se guardan']
    ];
    o.c3 = { hayBotonInfo: !!document.querySelector('[data-med-info="simp-metodo"]'),
             claveRegistrada: !!(CLAVES && CLAVES.indexOf('simp-metodo') >= 0),
             nNotas: (function () { const d = _medPanelInfo('simp-metodo'); return d ? d.txts.length : 0; })(),
             enGlobo: {}, enPanel: {} };
    FR.forEach(f => { o.c3.enGlobo[f[0]] = GLOBO.indexOf(f[1]) > -1;
                      o.c3.enPanel[f[0]] = PANEL.indexOf(f[1]) > -1; });
    o.c3.todasEnGlobo = FR.filter(f => o.c3.enGlobo[f[0]]).length;
    o.c3.ningunaEnPanel = FR.filter(f => o.c3.enPanel[f[0]]).length;
    o.c3.total = FR.length;
    /* El ⓘ, de 44 px de area tactil (el ::after de esta casa) y alcanzable. */
    o.c3.infoCaja = (function () { const b = document.querySelector('[data-med-info="simp-metodo"]');
      return b ? caja(b) : null; })();

    /* ══ B3 (b) — DOS VENTANAS IGUALES NO DAN BIPLANO ════════════════════════════════════ */
    o.b3b = { biplanoAntes: !!_vBiplanoDatos() };
    try {
      _vCon(_vistaB, () => { _vistaB.simp.nombres[0] = 'a4c'; });
      _vBiplanoPintar();
      await esp(240);
      o.b3b.nombresIguales = [_vistaA.simp.nombres[0], _vistaB.simp.nombres[0]];
      o.b3b.biplanoConIguales = !!_vBiplanoDatos();
      o.b3b.mismaVentana = (typeof _vBiplanoMismaVentana === 'function') ? _vBiplanoMismaVentana() : null;
      o.b3b.mensaje = (txt('cine-biplano')||'').slice(0, 170);
      o.b3b.mensajeUnaLinea = ((txt('cine-biplano')||'').indexOf('misma ventana') > -1);
      /* Y cada una queda con SU monoplanar: DOS filas, no una. */
      o.b3b.filas = (typeof _simpFilasTabla === 'function')
        ? _simpFilasTabla().map(f => ({ rot:f.rot, mono:f.mono, fevi:+f.m.fevi.toFixed(1) })) : null;
      o.b3b.nMono = o.b3b.filas ? o.b3b.filas.filter(f => f.mono).length : null;
      /* Se devuelve a 4C/2C. */
      _vCon(_vistaB, () => { _vistaB.simp.nombres[0] = 'a2c'; });
      _vBiplanoPintar();
      await esp(220);
      o.b3b.biplanoTrasVolver = !!_vBiplanoDatos();
      o.b3b.feviTrasVolver = (function () { const R = _vBiplanoDatos(); return R ? +R.fevi.toFixed(3) : null; })();
    } catch (e) { o.err.push('b3b: ' + e.message); }

    /* ══ H5 — EL BOTON DE INTEGRAR ESCRIBE LO MISMO QUE ANTES ════════════════════════════ */
    o.integ = { feviAntes: $('fevi') ? String($('fevi').value||'') : null,
                boton: !!$('cine-biplano-integ'),
                rotulo: txt('cine-biplano-integ') };
    try { if ($('cine-biplano-integ')) { $('cine-biplano-integ').click(); await esp(320); } }
    catch (e) { o.err.push('integ: ' + e.message); }
    o.integ.feviDespues = $('fevi') ? String($('fevi').value||'') : null;
    o.integ.metDespues = $('fevi_met') ? String($('fevi_met').value||'') : null;
    o.integ.esperado = (o.x2.biMedido != null) ? o.x2.biMedido.toFixed(0) : null;
    o.integ.escribioIgual = (o.integ.feviDespues === o.integ.esperado);
    o.integ.panelDiceIntegrada = (txt('cine-biplano')||'').indexOf('Integrada al campo FEVI') > -1;

    /* ══ B3 (a) — CERRAR UNA VISTA DESCARTA SU TRAZADO Y EL BIPLANO DESAPARECE ═══════════ */
    o.b3a = { antes: !!_vBiplanoDatos(), paneles: o.nPaneles };
    try {
      const VB = _vistaB;
      vistaCerrarUna(VB);
      await esp(600);
      o.b3a.vistaB = !!_vistaB;
      o.b3a.paneles2 = document.querySelectorAll('#cine-paneles [id$="cine-panel"]').length;
      o.b3a.biplano = !!_vBiplanoDatos();
      o.b3a.simpDeLaCerrada = !!VB.simp;
      o.b3a.monoDeLaViva = (_vistaA.simp && typeof _simpMonoDeS === 'function')
        ? (function () { const m = _simpMonoDeS(_vistaA.simp, 0); return m ? +m.fevi.toFixed(3) : null; })() : null;
      o.b3a.rotQueQueda = _vistaA.rot;
      o.b3a.bipOculto = $('cine-biplano') ? getComputedStyle($('cine-biplano')).display === 'none' : null;
      o.b3a.uniSigue = $('cine-simp-uni') ? getComputedStyle($('cine-simp-uni')).display !== 'none' : null;
      /* Y sin ids duplicados tras cerrar y reabrir (leccion 12), acotado al visor. */
      o.b3a.idsDupVisor = (function () {
        const vistos = Object.create(null), dup = [], ov = $('cine-ov');
        if (!ov) return null;
        ov.querySelectorAll('[id]').forEach(e => {
          if (vistos[e.id]) { if (dup.indexOf(e.id) < 0) dup.push(e.id); } else vistos[e.id] = 1; });
        return dup;
      })();
    } catch (e) { o.err.push('b3a: ' + e.message); }
  }

  /* ══ B1 — NADA NUEVO EN EL ALMACENAMIENTO DEL NAVEGADOR ════════════════════════════════ */
  const lsDespues = (function () { const a = []; for (let i=0;i<localStorage.length;i++) a.push(localStorage.key(i)); return a.sort(); })();
  o.ls = { nuevas: lsDespues.filter(k => lsAntes.indexOf(k) < 0) };
  o.errs = o.err;
  return o;
})()
