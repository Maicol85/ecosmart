/* Cuerpo de _probe_medir5a.mjs, que corre DENTRO del navegador.
 *
 * Vive en un archivo aparte a proposito (mejora de metodo de MEDIR-4b): metido en un template
 * literal, un acento grave en un comentario lo cierra antes de tiempo, y cuando lo que queda es
 * JS valido `node --check` NO lo ve.
 *
 * Reproduce el escenario del medico: Simpson biplano con la A2C en la vista A y la A4C en la
 * vista B, y despues mide los diez hallazgos.
 */
(async () => {
  const o = { err: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const txt = id => { const e = $(id); return e ? (e.textContent || '') : null; };
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const vis = el => { if (!el) return false; const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  o.temaReal = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';

  /* ══ A10 — LOS CORTES DE ANCHO QUE EXISTEN HOY, LEIDOS DEL CSS Y NO ADIVINADOS ════════════ */
  o.a10 = (function () {
    try {
      const cortes = [];
      for (const hoja of Array.from(document.styleSheets)) {
        let reglas = null;
        try { reglas = hoja.cssRules; } catch (e) { continue; }
        if (!reglas) continue;
        for (const r of Array.from(reglas)) {
          if (r.type !== CSSRule.MEDIA_RULE) continue;
          const txtR = String(r.conditionText || '');
          let tocaVisor = false;
          try { for (const s of Array.from(r.cssRules))
            if (String(s.selectorText || '').indexOf('cine-') > -1) tocaVisor = true; } catch (e) {}
          if (tocaVisor) cortes.push(txtR);
        }
      }
      return { mediasDelVisor: cortes.sort(),
               hay1920: cortes.some(c => c.indexOf('1920') > -1),
               hay2560: cortes.some(c => c.indexOf('2560') > -1) };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── El fixture: dos regiones como un DICOM, isotropicas, y TRES cuadros para poder moverse ── */
  const jpg = new Uint8Array([255,216,255,217]);
  const R2D  = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:240, tipo:1 };
  const RDOP = { ux:4, uy:7, dx:0.004, dy:-0.5, ry0:420, rvy:0, x0:0, y0:250, x1:600, y1:500, tipo:2 };
  const mk = (n, c) => ({ nombre:n, cuadros:(c||3), d:{ frags:[jpg,jpg,jpg], cols:600, filas:500,
    msCuadro:40, regiones:[R2D, RDOP] } });

  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}
  try { const sv = (id, v) => { const e = $(id); if (e) { e.value = v;
    e.dispatchEvent(new Event('input', { bubbles:true })); e.dispatchEvent(new Event('change', { bubbles:true })); } };
    sv('peso', '70'); sv('talla', '170'); } catch (e) { o.err.push('bsa: ' + e.message); }

  /* ── Abrir el visor y la vista B, por el camino real ── */
  try { _cineAbrir([mk('A2C-fix', 3)]); } catch (e) { o.err.push('abrir: ' + e.message); return o; }
  await esp(460);
  try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) { o.err.push('medir: ' + e.message); }
  await esp(360);

  try {
    const u8 = new Uint8Array([255,216,255,217]);
    const b64 = btoa(String.fromCharCode.apply(null, u8));
    const UU = 'estudio-de-prueba-0001';
    const reg = { id:'c-probe-1', uuid:UU, nombre:'A4C-fix', cuadros:3, bytes:9000,
      tipo:'loop', poster:'data:image/jpeg;base64,' + b64 };
    if (typeof CeiboCine === 'object' && CeiboCine) {
      CeiboCine.listar = async () => [reg]; CeiboCine.indice = async () => [reg];
    }
    window._cineLoopDeDisco = async () => mk('A4C-fix', 3);
    if (typeof CeiboImg === 'object' && CeiboImg) CeiboImg.leer = async () => [];
    try { cfgToggleGuardarImagenes(true); } catch (e) {}
    await esp(160);
    await imgRestaurar(UU);
    await esp(240);
    const pr = vistaBAbrir();
    await esp(700);
    const th = document.querySelector('[data-vpick-i]');
    o.pickAbierto = !!th;
    if (th) { th.click(); await esp(900); }
    try { await pr; } catch (e) {}
    await esp(500);
  } catch (e) { o.err.push('vistaB: ' + e.message); }
  o.vistaBAbierta = !!_vistaB;
  if (!_vistaB) { o.err.push('sin vista B: el resto no se puede medir'); return o; }
  const pfxB = _vistaB.pfx;

  /* ── Los insumos del Simpson, SEMBRADOS: el raton sobre un canvas angosto da coordenadas
     degeneradas (TC-897). Lo que se mide aca es el maquetado y el reparto, no la aritmetica. ── */
  /* ⚠️ SE SIEMBRA POR `_simpAceptar` Y NO ESCRIBIENDO EL PAR A MANO, y la primera version lo
     pago: un par con solo `diamCm` y `Lcm` le falta `pts`, `eje` y `diam`, asi que `_medPintar`
     —que DIBUJA el contorno— tiraba «reading '0'» y con el se caia el repintado del biplano. El
     error era de la sonda y no de la app. Este es el patron de TC-897 y de TC-241.
     El triangulo cae dentro de la region 2D del fixture (y de 35 a 235, la region llega a 240). */
  const tri = (cx, yb, W, H) => {
    const p = [], paso = 12, x0 = cx - W/2, x1 = cx + W/2, ya = yb - H;
    const n1 = Math.ceil(Math.hypot(W/2, H) / paso);
    for (let i = 0; i <= n1; i++) p.push({ x: x0 + (cx-x0)*i/n1, y: yb + (ya-yb)*i/n1 });
    for (let i = 1; i <= n1; i++) p.push({ x: cx + (x1-cx)*i/n1, y: ya + (yb-ya)*i/n1 });
    return p.map(q => ({ x: Math.round(q.x), y: Math.round(q.y) }));
  };
  const CX = 300, YB = 235, HH = 200;
  const ANCHO = { a4cD: 200, a4cS: 120, a2cD: 180, a2cS: 126 };
  const sembrarSimp = (V, vent, conSistole) => {
    const paso = (n, fn) => { try { return fn(); }
      catch (e) { o.err.push('sembrar ' + vent + '/' + n + ': ' + e.message); return null; } };
    paso('medOn', () => _vCon(V, () => { if (!V.medOn) medToggle(); }));
    paso('herr', () => _vCon(V, () => medHerramienta('simpson')));
    paso('vent', () => _vCon(V, () => medSimpsonElegirVista(vent)));
    const poner = (fase, W) => paso(fase, () => _vCon(V, () => {
      const S = _simp; if (!S) throw new Error('sin sesion');
      S.fase = fase;
      const m = _simpAceptar(tri(CX, YB, W, HH));
      if (m) throw new Error('aceptar: ' + m);
      medSimpsonConfirmar();
    }));
    poner('d', vent === 'a4c' ? ANCHO.a4cD : ANCHO.a2cD);
    if (conSistole) poner('s', vent === 'a4c' ? ANCHO.a4cS : ANCHO.a2cS);
    paso('estado', () => _vCon(V, () => _medEstado()));
  };

  /* ══ A3 AMPLIADO — LA GEOMETRIA DE LA IMAGEN, TOMADA EN TRES MOMENTOS ═══════════════════
     El hallazgo dice que al medir el Simpson la imagen SUBE y tapa la fila de botones, y que al
     apretar Limpiar la posicion corrida NO VUELVE SOLA. Una posicion que no vuelve es un estilo
     pegado, asi que se toman las cajas Y los estilos EN LINEA del lienzo, del recorte y de los
     dos canvas, en los tres momentos: sin resultado, con el biplano, y tras Limpiar. */
  const medirImagen = pfx => {
    const li = $(pfx + 'cine-lienzo'), rc = $(pfx + 'cine-recorte');
    const cv = $(pfx + 'cine-cv'), md = $(pfx + 'cine-med');
    const est = el => { if (!el) return null; const s = getComputedStyle(el);
      return { pos: s.position, top: s.top, mt: s.marginTop, mb: s.marginBottom,
               tr: s.transform === 'none' ? 'none' : s.transform.slice(0, 40),
               maxH: s.maxHeight, h: s.height }; };
    const inl = el => el ? (el.getAttribute('style') || '').slice(0, 220) : null;
    return {
      lienzo: caja(li), recorte: caja(rc), cv: caja(cv), med: caja(md),
      estLienzo: est(li), estRecorte: est(rc), estCv: est(cv), estMed: est(md),
      inlineRecorte: inl(rc), inlineCv: inl(cv), inlineMed: inl(md),
      /* La distancia de la imagen a la barra de arriba: si la imagen sube, esto se hace
         negativo o se achica. Es la medida directa del hallazgo. */
      barraY: (function () { const b = document.querySelector('#' + pfx + 'cine-panel .cine-barra');
        return b ? Math.round(b.getBoundingClientRect().y) : null; })(),
      huecoBarraImagen: (function () {
        const b = document.querySelector('#' + pfx + 'cine-panel .cine-barra');
        if (!b || !li) return null;
        const rb = b.getBoundingClientRect(), rl = li.getBoundingClientRect();
        return Math.round(rl.y - (rb.y + rb.height)); })()
    };
  };
  o.a3img = { antes: { A: medirImagen(''), B: medirImagen(pfxB) } };

  /* ══ B1 / B3 — LA BARRA UNICA Y EL ORDEN DEL VD ════════════════════════════════════════ */
  o.b1 = (function () { try {
    const side = $('cine-side'); if (!side) return 'sin cine-side';
    const filas = Array.from(side.children).map(d => ({
      rot: (d.querySelector('span') || {}).textContent || '',
      oculta: getComputedStyle(d).display === 'none',
      btns: Array.from(d.querySelectorAll('button')).map(b => (b.textContent || '').trim())
    }));
    return {
      nFilas: filas.length,
      filas: filas,
      /* La fila «Modo» sigue en el documento y sus botones siguen alcanzables por JS. */
      modoOculta: !!(filas[0] && filas[0].oculta),
      gDopExiste: !!$('cine-g-dop'),
      gDopFueraDeTab: (function () { const e = $('cine-g-dop'); return !!e && e.offsetParent === null; })(),
      /* Las herramientas de los DOS grupos a la vez, sin tocar «Modo». */
      verDist: !!$('cine-med-dist'), verVel: !!$('cine-med-vel'),
      verSimp: !!$('cine-med-simp'), verVti: !!$('cine-med-vti'),
      ordenDop: ['cine-med-vel','cine-med-vti','cine-med-t','cine-med-fc']
        .map(id => { const e = $(id); return e ? (e.textContent || '').trim() : null; })
    };
  } catch (e) { return 'ERR ' + e.message; } })();
  o.b3 = (function () { try {
    return (typeof _D2_FILAS_DE === 'object' && _D2_FILAS_DE)
      ? { vd: _D2_FILAS_DE.vd.slice(),
          rotVD: (typeof _d2Filas === 'function') ? _d2Filas('vd').map(f => f[0]) : null }
      : null;
  } catch (e) { return 'ERR ' + e.message; } })();

  /* ══ A5 — ¿SALE LA TABLA CHICA AL TERMINAR LA DIASTOLE? ══════════════════════════════════
     Se mide con UNA sola fase confirmada en la vista A y NADA en la B: si la tabla sale, el
     hallazgo es falso; si no sale, hay que decidir si es diseño o fallo. */
  sembrarSimp(_vistaA, 'a2c', false);
  await esp(400);
  o.a5 = {
    paresA: _vistaA.simp ? _vistaA.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null,
    filasVivas: (typeof _simpFilasVivas === 'function') ? _simpFilasVivas().length : null,
    filasTabla: (typeof _simpFilasTabla === 'function') ? _simpFilasTabla().length : null,
    monoDeA: (typeof _simpMonoDeS === 'function' && _vistaA.simp)
      ? !!_simpMonoDeS(_vistaA.simp, 0) : null,
    uniVisible: vis($('cine-simp-uni')),
    uniTieneTabla: !!($('cine-simp-uni') && $('cine-simp-uni').querySelector('table')),
    uniDiceVFD: (txt('cine-simp-uni') || '').indexOf('VFD') > -1,
    /* El panel de la vista A, que es donde el medico esperaria el resumen de la fase hecha. */
    barraDiceVFD: (txt('cine-med-barra') || '').indexOf('VFD') > -1,
    barraA: (txt('cine-med-barra') || '').replace(/\s+/g, ' ').trim().slice(0, 260)
  };

  /* ══ M5-a — LA FILA PARCIAL DE LA DIASTOLE ══════════════════════════════════════════════
     Se mide EN ESTE MOMENTO, que es el unico con una sola fase confirmada: la vista A tiene la
     diastole de la A2C y nada mas. Lo que importa no es solo que la fila se vea, sino que NO
     entre en ninguna de las cuatro salidas que persisten, integran o imprimen. */
  o.m5a = (function () { try {
    const uni = $('cine-simp-uni');
    const t = uni ? uni.querySelector('table') : null;
    const filasTxt = t ? Array.from(t.querySelectorAll('tbody tr')).map(tr =>
      Array.from(tr.querySelectorAll('td')).map(td => (td.textContent || '').trim())) : [];
    const parc = (typeof _simpFilasParciales === 'function') ? _simpFilasParciales() : null;
    const cursivas = t ? Array.from(t.querySelectorAll('tbody tr'))
      .filter(tr => getComputedStyle(tr).fontStyle === 'italic').length : null;
    return {
      hayTabla: !!t,
      nParciales: parc ? parc.length : null,
      rotParcial: parc && parc[0] ? parc[0].rot : null,
      vfdParcial: parc && parc[0] ? +parc[0].m.vfd.toFixed(4) : null,
      filas: filasTxt,
      filasEnCursiva: cursivas,
      diceParcial: (txt('cine-simp-uni') || '').indexOf('parcial') > -1,
      dicePorQue: (txt('cine-simp-uni') || '').indexOf('falta la sístole') > -1,
      diceNoIntegra: (txt('cine-simp-uni') || '').indexOf('no se integra al informe') > -1,
      /* ⚠️ LAS CUATRO SALIDAS QUE UN PARCIAL NO PUEDE TOCAR. */
      vivas: (typeof _simpFilasVivas === 'function') ? _simpFilasVivas().length : null,
      enTabla: (typeof _simpFilasTabla === 'function') ? _simpFilasTabla().length : null,
      enResumen: (typeof _simpResumen === 'function')
        ? (function () { const R = _simpResumen(); return R ? R.vistas.length : 0; })() : null,
      enCanvas: (typeof _simpTablaCanvas === 'function') ? !!_simpTablaCanvas() : null,
      /* Y el campo del informe sigue vacio: un parcial no se integra. */
      campoFevi: (function () { const e = $('fevi'); return e ? String(e.value || '') : '(no existe)'; })()
    };
  } catch (e) { return 'ERR ' + e.message; } })();

  /* ══ M5-c / M5-d / M5-e — EL ANCHO EXTRA, EL ROTULO Y EL CARTEL ═════════════════════════ */
  o.m5cde = (function () { try {
    const mod = $('cine-modal');
    const cs = mod ? getComputedStyle(mod) : null;
    const img = $('cine-recorte'), col = document.querySelector('#cine-panel .cine-col-der');
    const g = $('cine-guardar');
    const r = {
      ventana: window.innerWidth,
      modalMaxW: cs ? cs.maxWidth : null,
      modalW: mod ? Math.round(mod.getBoundingClientRect().width) : null,
      imagenW: img ? Math.round(img.getBoundingClientRect().width) : null,
      colMedW: col ? Math.round(col.getBoundingClientRect().width) : null
    };
    if (g) {
      const gc = g.getBoundingClientRect();
      r.guardarRot = (g.textContent || '').trim();
      r.guardarW = Math.round(gc.width); r.guardarH = Math.round(gc.height);
      /* ⚠️ «RECORTADO» SE MIDE CON `scrollWidth`/`scrollHeight` CONTRA EL CLIENTE, no mirando el
         texto: el boton es `overflow:hidden`, asi que un rotulo que no entra se corta en silencio
         y el `textContent` sigue completo. */
      r.guardarCortado = (g.scrollWidth > g.clientWidth + 1) || (g.scrollHeight > g.clientHeight + 1);
      r.guardarScroll = g.scrollWidth + 'x' + g.scrollHeight + ' en ' + g.clientWidth + 'x' + g.clientHeight;
    }
    return r;
  } catch (e) { return 'ERR ' + e.message; } })();

  /* El cartel azul de la pestania Imagenes. No necesita el visor abierto. */
  o.m5e = (function () { try {
    const av = $('med-fija-aviso');
    let prendido = false;
    if (typeof _medFijaOn !== 'undefined' && !_medFijaOn && typeof medFijaToggle === 'function') {
      medFijaToggle(); prendido = true;
    }
    const t = av ? (av.textContent || '').replace(/\s+/g, ' ').trim() : null;
    if (prendido && typeof medFijaToggle === 'function') medFijaToggle();
    return {
      hay: !!av, largo: t ? t.length : null,
      diceNoEscribeCampos: !!t && t.indexOf('no escriben ningún campo del informe') > -1,
      diceComoQueden: !!t && t.indexOf('📸 Capturar') > -1,
      diceBiblioteca: !!t && t.indexOf('Guardar en biblioteca') > -1,
      /* La frase vieja YA NO puede estar: era la afirmacion equivocada. */
      sigueLaVieja: !!t && t.indexOf('sólo para ver en pantalla') > -1,
      texto: t ? t.slice(0, 420) : null
    };
  } catch (e) { return 'ERR ' + e.message; } })();

  /* Ahora el biplano completo: A2C en la A y A4C en la B. */
  sembrarSimp(_vistaA, 'a2c', true);
  await esp(300);
  sembrarSimp(_vistaB, 'a4c', true);
  await esp(500);
  try { _medEstado(); } catch (e) {}
  await esp(400);

  o.escena = {
    nombresA: _vistaA.simp ? _vistaA.simp.nombres.slice() : null,
    nombresB: _vistaB.simp ? _vistaB.simp.nombres.slice() : null,
    paresA: _vistaA.simp ? _vistaA.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null,
    paresB: _vistaB.simp ? _vistaB.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null,
    biplano: (function () { try { const R = _vBiplanoDatos();
      return R ? { vfd:+R.vfd.toFixed(3), vfs:+R.vfs.toFixed(3), fevi:+R.fevi.toFixed(3) } : null;
    } catch (e) { return 'ERR ' + e.message; } })(),
    filasTabla: (typeof _simpFilasTabla === 'function')
      ? _simpFilasTabla().map(f => f.rot) : null
  };

  /* ══ A6 — LOS GLOBOS ⓘ DE METODO, MEDIDOS CON EL BIPLANO EN PANTALLA ════════════════════
     ⚠️ SE MIDE ACA Y NO AL FINAL, Y LA PRIMERA VERSION LO MIDIO MAL: al final la vista A ya
     estaba en Velocidad, asi que `cine-biplano` estaba escondido y su globo no existia — la
     sonda contaba UNO sobre una pantalla que tiene DOS. */
  const globosMetodo = () => {
    const bs = Array.from(document.querySelectorAll('[data-med-info="simp-metodo"]'));
    return {
      n: bs.length,
      donde: bs.map(b => b.closest('#cine-simp-uni') ? 'cine-simp-uni'
        : b.closest('#cine-biplano') ? 'cine-biplano'
        : b.closest('#cine-panel') ? 'panel-A'
        : b.closest('#' + pfxB + 'cine-panel') ? 'panel-B' : 'otro'),
      visibles: bs.filter(b => vis(b)).length,
      nNotas: (typeof _medPanelInfo === 'function')
        ? (function () { const d = _medPanelInfo('simp-metodo'); return d ? d.txts.length : null; })() : null
    };
  };
  o.a6bip = globosMetodo();
  o.a6bip.bipVisible = vis($('cine-biplano'));
  o.a6bip.uniVisible = vis($('cine-simp-uni'));

  /* ══ A3 — LA FILA DE BOTONES CON EL RESULTADO EN PANTALLA ════════════════════════════════
     Se mide la barra de cada vista: su caja, si esta dentro del modal visible, y si algun nodo
     se le superpone. «Tapar» se mide con elementFromPoint sobre el centro de un boton. */
  const barraDe = pfx => document.querySelector('#' + pfx + 'cine-panel .cine-barra');
  const medirBarra = pfx => {
    const bar = barraDe(pfx); if (!bar) return null;
    const bs = Array.from(bar.querySelectorAll('button'));
    const mod = $('cine-modal'), cm = mod ? mod.getBoundingClientRect() : null;
    const cap = bs.filter(b => (b.textContent || '').indexOf('medici') > -1)[0] || null;
    const cc = cap ? cap.getBoundingClientRect() : null;
    let tapa = null;
    if (cc && cc.width > 0) {
      const el = document.elementFromPoint(Math.round(cc.x + cc.width / 2), Math.round(cc.y + cc.height / 2));
      tapa = el ? (el === cap || cap.contains(el) ? 'propio' : (el.id || el.className || el.tagName)) : 'fuera';
    }
    return {
      n: bs.length, caja: caja(bar), visible: vis(bar),
      rot: bs.map(x => (x.textContent || '').trim().slice(0, 20)),
      altos: bs.map(x => Math.round(x.getBoundingClientRect().height)),
      capturaMedicion: cc ? caja(cap) : null,
      /* Dentro del rectangulo del modal: un boton con y < y del modal esta desplazado fuera. */
      dentroDelModal: (cc && cm) ? (cc.y >= cm.y - 1 && cc.y + cc.height <= cm.y + cm.height + 1) : null,
      tapadoPor: tapa
    };
  };
  o.a3img.conBiplano = { A: medirImagen(''), B: medirImagen(pfxB) };
  o.a3img.subioA = (o.a3img.antes.A.lienzo && o.a3img.conBiplano.A.lienzo)
    ? (o.a3img.conBiplano.A.lienzo.y - o.a3img.antes.A.lienzo.y) : null;
  o.a3img.huecoAntesA = o.a3img.antes.A.huecoBarraImagen;
  o.a3img.huecoConBipA = o.a3img.conBiplano.A.huecoBarraImagen;
  o.a3 = {
    barraA: medirBarra(''), barraB: medirBarra(pfxB),
    modal: caja($('cine-modal')),
    modalScrollY: (function () { const m = $('cine-modal');
      return m ? { scrollTop: Math.round(m.scrollTop), scrollH: Math.round(m.scrollHeight),
                   clientH: Math.round(m.clientHeight),
                   desborda: m.scrollHeight - m.clientHeight } : null; })(),
    uniCaja: caja($('cine-simp-uni')), bipCaja: caja($('cine-biplano'))
  };

  /* ══ A4 — LA BARRA DEL VIDEO ═════════════════════════════════════════════════════════════ */
  const medirVideo = pfx => {
    const sl = $(pfx + 'cine-slider'), pl = $(pfx + 'cine-play');
    const pv = $(pfx + 'cine-prev'), nx = $(pfx + 'cine-next');
    const mod = $('cine-modal'), cm = mod ? mod.getBoundingClientRect() : null;
    const sc = sl ? sl.getBoundingClientRect() : null;
    let tapa = null;
    if (sc && sc.width > 0) {
      const el = document.elementFromPoint(Math.round(sc.x + sc.width / 2), Math.round(sc.y + sc.height / 2));
      tapa = el ? (el === sl ? 'propio' : (el.id || el.className || el.tagName)) : 'fuera';
    }
    return {
      sliderVisible: vis(sl), sliderCaja: caja(sl),
      sliderDisabled: sl ? sl.disabled : null,
      sliderMax: sl ? sl.max : null, sliderValor: sl ? sl.value : null,
      playVisible: vis(pl), playDisabled: pl ? pl.disabled : null,
      playRot: pl ? (pl.textContent || '').trim() : null,
      prevVisible: vis(pv), nextVisible: vis(nx),
      prevDisplay: pv ? getComputedStyle(pv).display : null,
      dentroDelModal: (sc && cm) ? (sc.y >= cm.y - 1 && sc.y + sc.height <= cm.y + cm.height + 1) : null,
      tapadoPor: tapa
    };
  };
  o.a4 = { videoA: medirVideo(''), videoB: medirVideo(pfxB) };

  /* ══ A6 — LOS GLOBOS ⓘ DE METODO ════════════════════════════════════════════════════════ */
  o.a6 = globosMetodo();

  /* ══ A7 — EL CARTEL DE VENTANA ══════════════════════════════════════════════════════════ */
  o.a7 = (function () {
    const bs = Array.from(document.querySelectorAll('[data-simpuni-vista]'));
    if (!bs.length) return { n: 0 };
    const fila = bs[0].parentElement;
    const uni = $('cine-simp-uni');
    const tabla = uni ? uni.querySelector('table') : null;
    const fc = fila ? fila.getBoundingClientRect() : null;
    const tc = tabla ? tabla.getBoundingClientRect() : null;
    const solapa = (a, b) => !!(a && b && a.width > 0 && b.width > 0 &&
      a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height);
    return {
      n: bs.length, caja: caja(fila), anchoUni: uni ? Math.round(uni.getBoundingClientRect().width) : null,
      rot: bs.map(b => (b.textContent || '').trim()),
      /* ¿Ocupa la fila el ancho entero del panel? Es lo que el medico llama «estorba». */
      fraccionDelAncho: (fc && uni) ? Math.round(fc.width / uni.getBoundingClientRect().width * 100) : null,
      centrada: (fc && uni) ? Math.round((fc.x + fc.width / 2) -
        (uni.getBoundingClientRect().x + uni.getBoundingClientRect().width / 2)) : null,
      solapaTabla: solapa(fc, tc),
      /* Y contra las dos columnas de medidas, que es lo que el hallazgo nombra. */
      solapaColDerA: solapa(fc, document.querySelector('#cine-panel .cine-col-der')
        ? document.querySelector('#cine-panel .cine-col-der').getBoundingClientRect() : null),
      estilo: fila ? (fila.getAttribute('style') || '').slice(0, 180) : null
    };
  })();

  /* ══ A9 — LOS CARTELES DEL SIMPSON EN DOPPLER ══════════════════════════════════════════
     La vista A pasa a Velocidad (grupo Doppler) y la B se queda en Simpson. */
  try { _vCon(_vistaA, () => medHerramienta('vel')); } catch (e) { o.err.push('velA: ' + e.message); }
  await esp(420);
  o.a9 = {
    herrA: _vistaA.medHerr, herrB: _vistaB ? _vistaB.medHerr : null,
    pasosEnA: document.querySelectorAll('[data-simp-paso][data-simp-pfx=""]').length,
    pasosEnB: document.querySelectorAll('[data-simp-paso][data-simp-pfx="' + pfxB + '"]').length,
    listoEnA: !!document.querySelector('[data-simp-listo][data-simp-pfx=""]'),
    barraAdiceDiastole: (txt('cine-med-barra') || '').indexOf('iástole') > -1,
    barraAdiceSistole: (txt('cine-med-barra') || '').indexOf('ístole') > -1,
    barraA: (txt('cine-med-barra') || '').replace(/\s+/g, ' ').trim().slice(0, 200),
    uniVisibleConDoppler: vis($('cine-simp-uni')),
    bipVisibleConDoppler: vis($('cine-biplano'))
  };

  /* ══ A1 — EN QUE RANURA CAE CADA CAJON ══════════════════════════════════════════════════
     La A en Doppler (valvula mitral abierta) y la B en Distancia con el VD abierto: es el
     escenario literal del hallazgo. */
  try { _vCon(_vistaA, () => { if (typeof dopModo === 'function') dopModo('mit'); }); } catch (e) { o.err.push('dopMit: ' + e.message); }
  await esp(260);
  try { _vCon(_vistaB, () => medHerramienta('dist')); } catch (e) { o.err.push('distB: ' + e.message); }
  await esp(260);
  try { _vCon(_vistaB, () => { if (typeof d2Modo === 'function') d2Modo('vd'); }); } catch (e) { o.err.push('d2vd: ' + e.message); }
  await esp(420);
  /* Y un numero del VD medido DESDE la vista B, para que la tabla tenga contenido. */
  try { _vCon(_vistaB, () => { if (typeof _d2Poner === 'function') _d2Poner('vd.basal', 42); }); } catch (e) {}
  try { if (typeof _d2Render === 'function') _d2Render(); } catch (e) {}
  await esp(360);

  const ranuraDe = id => { const n = $(id); if (!n) return null;
    const p = n.parentElement; if (!p) return 'sin padre';
    return p.id || p.className || p.tagName; };
  const enPanel = id => { const n = $(id); if (!n) return null;
    if (n.closest('#' + pfxB + 'cine-panel')) return 'B';
    if (n.closest('#cine-panel')) return 'A';
    return 'fuera'; };
  o.a1 = {
    herrA: _vistaA.medHerr, herrB: _vistaB.medHerr,
    dopModo: (typeof _dopEstado === 'function') ? _dopEstado().modo : null,
    d2Modo: (typeof _d2Estado === 'function') ? _d2Estado().modo : null,
    d2Visible: (typeof _d2Visible === 'function') ? _d2Visible() : null,
    dopVisible: (typeof _dopVisible === 'function') ? _dopVisible() : null,
    /* EL NUCLEO DEL HALLAZGO: donde esta cada cajon y en que panel. */
    ranuraDop: ranuraDe('cine-dop-slot'), ranuraD2: ranuraDe('d2-cajon'),
    panelDop: enPanel('cine-dop-slot'), panelD2: enPanel('d2-cajon'),
    d2CajonVisible: vis($('d2-cajon')), dopCajonVisible: vis($('dop-cajon')),
    d2DiceVD: (txt('d2-cajon') || '').indexOf('VD basal') > -1,
    d2Texto: (txt('d2-cajon') || '').replace(/\s+/g, ' ').trim().slice(0, 180),
    dopTexto: (txt('dop-cajon') || '').replace(/\s+/g, ' ').trim().slice(0, 180),
    /* Y cuantas tablas se ven a la vez dentro de la columna de la vista A. */
    tablasEnColA: document.querySelectorAll('#cine-panel .cine-col-der table').length,
    tablasEnColB: document.querySelectorAll('#' + pfxB + 'cine-panel .cine-col-der table').length
  };

  /* ══ C3 — «GUARDAR EN BIBLIOTECA» EN LAS DOS TABLAS ════════════════════════════════════
     La escena de A1 ya dejo la mitral abierta en la A y el VD con un valor en la B, que es
     exactamente lo que las dos compuertas necesitan. */
  /* ⚠️ HAY QUE SEMBRAR UN VALOR DOPPLER, Y LO DESTAPO LA MEDICION: la escena de A1 abre la mitral
     pero no mide nada en ella, asi que `_dopHayValores()` daba falso y el boton de guardar del
     cajon Doppler NO se dibujaba — la sonda media su rotulo sobre un boton ausente y devolvia
     null en los dos arboles, que se lee igual que «el rename no se aplico». */
  try { _vCon(_vistaA, () => { const E = _dopEstado(); E.mit.ondaE = 80; });
        if (typeof _dopRender === 'function') _dopRender(); } catch (e) { o.err.push('semDop: ' + e.message); }
  await esp(300);
  o.c3 = (function () { try {
    const r = {};
    const fila = id => { const n = $(id); if (!n) return null;
      const bs = Array.from(n.querySelectorAll('[data-dop-acc],[data-d2-acc]'));
      return bs.map(b => (b.textContent || '').trim()); };
    r.accDop = fila('dop-cajon');
    r.accD2 = fila('d2-cajon');
    /* «Al lado de Limpiar» se mide por la distancia en el orden del DOM: 1 es pegado. */
    const pegado = (id, attr) => { const n = $(id); if (!n) return null;
      const bs = Array.from(n.querySelectorAll('[' + attr + ']'));
      const iL = bs.findIndex(b => b.getAttribute(attr) === 'limpiar');
      const iG = bs.findIndex(b => b.getAttribute(attr) === 'guardar');
      return (iL < 0 || iG < 0) ? null : (iG - iL); };
    r.pegadoDop = pegado('dop-cajon', 'data-dop-acc');
    r.pegadoD2 = pegado('d2-cajon', 'data-d2-acc');
    r.rotDop = (function () { const b = document.querySelector('[data-dop-acc="guardar"]');
      return b ? (b.textContent || '').trim() : null; })();
    r.rotD2 = (function () { const b = document.querySelector('[data-d2-acc="guardar"]');
      return b ? (b.textContent || '').trim() : null; })();
    /* El renderizador unico y los dos canvas. */
    r.hayMedSecCanvas = (typeof _medSecCanvas === 'function');
    r.secD2 = (typeof _d2SeccionesGuardado === 'function')
      ? _d2SeccionesGuardado().map(s => s.rot + ':' + s.filas.length) : null;
    r.sufD2 = (typeof _d2SufijoGuardado === 'function') ? _d2SufijoGuardado() : null;
    const cvD2 = (typeof _d2Canvas === 'function') ? _d2Canvas() : null;
    r.cvD2 = cvD2 ? (cvD2.width + 'x' + cvD2.height) : null;
    /* ⚠️ EL HASH DEL CANVAS DEL DOPPLER: es lo que prueba que la extraccion a `_medSecCanvas`
       no cambio un pixel. Se compara contra el mismo numero en el arbol anterior. */
    const cvDop = (typeof _dopCanvas === 'function') ? _dopCanvas() : null;
    r.cvDop = cvDop ? (cvDop.width + 'x' + cvDop.height) : null;
    r.hashDop = cvDop ? (function () { const u = cvDop.toDataURL('image/png');
      let h = 0; for (let i = 0; i < u.length; i++) { h = (h * 31 + u.charCodeAt(i)) | 0; }
      return (h >>> 0).toString(16) + ':' + u.length; })() : null;
    /* Y que guardar NO escriba un solo campo del informe: censo antes y despues. */
    const censo = () => Array.from(document.querySelectorAll('input[id], select[id], textarea[id]'))
      .filter(e => !e.closest('#cine-ov'))
      .map(e => e.id + '=' + String(e.value == null ? '' : e.value)).join('|');
    r.censoAntes = censo().length;
    r.censoAntesHash = (function () { const u = censo(); let h = 0;
      for (let i = 0; i < u.length; i++) { h = (h * 31 + u.charCodeAt(i)) | 0; }
      return (h >>> 0).toString(16); })();
    r._censoFn = true;
    return r;
  } catch (e) { return 'ERR ' + e.message; } })();
  try {
    if (typeof d2GuardarBiblioteca === 'function') { await d2GuardarBiblioteca(); await esp(900); }
    const censo = () => Array.from(document.querySelectorAll('input[id], select[id], textarea[id]'))
      .filter(e => !e.closest('#cine-ov'))
      .map(e => e.id + '=' + String(e.value == null ? '' : e.value)).join('|');
    o.c3.censoDespues = censo().length;
    o.c3.censoDespuesHash = (function () { const u = censo(); let h = 0;
      for (let i = 0; i < u.length; i++) { h = (h * 31 + u.charCodeAt(i)) | 0; }
      return (h >>> 0).toString(16); })();
    o.c3.censoIgual = (o.c3.censoAntesHash === o.c3.censoDespuesHash);
  } catch (e) { o.err.push('c3guardar: ' + e.message); }

  /* ══ B2 — LA TABLA: VALOR ANGOSTO, SIN LAPIZ, EL NUMERO TOCABLE, «MEDIR» Y ✕ ═══════════ */
  o.b2 = (function () { try {
    const caj = $('d2-cajon'); if (!caj) return 'sin cajon';
    const t = caj.querySelector('table.med-tabla'); if (!t) return 'sin tabla';
    const anchoCol = Array.from(t.querySelectorAll('col')).map(c => c.style.width);
    const trs = Array.from(t.querySelectorAll('tbody tr'));
    const filas = trs.map(tr => {
      const tds = tr.querySelectorAll('td');
      if (tds.length < 3) return null;
      const bs = Array.from(tds[2].querySelectorAll('button')).map(b => (b.textContent || '').trim());
      const vb = tds[1].querySelector('button');
      return {
        nom: (tds[0].textContent || '').trim().slice(0, 22),
        val: (tds[1].textContent || '').trim().slice(0, 14),
        valEsBoton: !!vb,
        valCorr: vb ? vb.getAttribute('data-d2-corr') : null,
        valAlto: vb ? Math.round(vb.getBoundingClientRect().height) : null,
        acc: bs,
        cursiva: getComputedStyle(tr).fontStyle === 'italic',
        altoFila: Math.round(tr.getBoundingClientRect().height)
      };
    }).filter(Boolean);
    /* El area TACTIL del valor: el `::after` de `med-fbot` da 44 px sin agrandar la fila. */
    const areaVal = (function () {
      const vb = t.querySelector('tbody td:nth-child(2) button');
      if (!vb) return null;
      const r = vb.getBoundingClientRect();
      const a = getComputedStyle(vb, '::after');
      return { visible: Math.round(r.height), tactil: a.height };
    })();
    /* ⚠️ CERO PARES DE AREAS TACTILES SOLAPADAS entre los valores de filas consecutivas. */
    const vbs = Array.from(t.querySelectorAll('tbody td:nth-child(2) button'))
      .map(b => { const r = b.getBoundingClientRect();
        return { c: r.y + r.height / 2 }; });
    /* ⚠️ CON DENOMINADOR. Sin el, a 390 px la tabla devolvia alturas en CERO —el cajon no esta
       renderizado a ese ancho— y la cuenta de solapes daba 4 sobre nada, que se lee igual que un
       defecto. La medicion solo vale si la tabla tiene caja. */
    const tienCaja = Math.round(t.getBoundingClientRect().height) > 0;
    let solapes = tienCaja ? 0 : null;
    if (tienCaja) for (let i = 1; i < vbs.length; i++)
      if (Math.abs(vbs[i].c - vbs[i-1].c) < 44) solapes++;
    return {
      medible: tienCaja,
      porQueNo: tienCaja ? null : (function () {
        let n = t, cad = [];
        while (n && n !== document.body) {
          const s2 = getComputedStyle(n);
          if (s2.display === 'none') cad.push((n.id || n.className || n.tagName) + ':display-none');
          n = n.parentElement;
        }
        return cad.length ? cad.join(' > ') : 'con caja cero pero sin display:none';
      })(),
      anchoCol: anchoCol, layout: getComputedStyle(t).tableLayout,
      nFilas: filas.length, filas: filas,
      hayLapiz: (caj.textContent || '').indexOf('✏️') > -1,
      lapizEnGlobo: (function () { try { const d = _medPanelInfo('d2');
        return d ? d.txts.join(' ').indexOf('✏️') > -1 : null; } catch (e) { return 'ERR'; } })(),
      globoDiceTocar: (function () { try { const d = _medPanelInfo('d2');
        return d ? d.txts.join(' ').indexOf('TOCA EL NUMERO') > -1 : null; } catch (e) { return 'ERR'; } })(),
      areaVal: areaVal, solapesValor: solapes,
      /* El ancho de la tabla NO se mueve al pasar de guion a numero: se mide el ancho de la
         columna del valor antes y despues de escribir uno. */
      anchoAntes: (function () { const c = t.querySelector('tbody td:nth-child(2)');
        return c ? Math.round(c.getBoundingClientRect().width) : null; })(),
      /* ⚠️ POR QUE UNA FILA CON VALOR MIDE EL DOBLE: si los dos botones de acciones no entran en
         su celda, envuelven, y `row-gap:22px` suma otros 44 px. Se mide el ancho de la celda y
         el que de verdad ocupan los botones, que es lo unico que dice si hay que repartir
         distinto o si es otra cosa. */
      accCelda: (function () { const c = t.querySelector('tbody td:nth-child(3)');
        return c ? Math.round(c.getBoundingClientRect().width) : null; })(),
      accBotones: (function () {
        const c = t.querySelector('tbody tr:nth-child(2) td:nth-child(3)');
        if (!c) return null;
        const bs = Array.from(c.querySelectorAll('button'));
        return { n: bs.length, anchos: bs.map(b => Math.round(b.getBoundingClientRect().width)),
                 suma: bs.reduce((a, b) => a + b.getBoundingClientRect().width, 0).toFixed(0),
                 lineas: (function () { const ys = bs.map(b => Math.round(b.getBoundingClientRect().y));
                   return ys.filter((v, i, a2) => a2.indexOf(v) === i).length; })() };
      })()
    };
  } catch (e) { return 'ERR ' + e.message; } })();
  try {
    /* Se escribe un valor en una fila que estaba en guion y se vuelve a medir el ancho. */
    _vCon(_vistaB, () => { if (typeof _d2Poner === 'function') _d2Poner('vd.medio', 33); });
    if (typeof _d2Render === 'function') _d2Render();
    await esp(320);
    const t2 = $('d2-cajon') ? $('d2-cajon').querySelector('table.med-tabla') : null;
    o.b2.anchoDespues = t2 ? (function () { const c = t2.querySelector('tbody td:nth-child(2)');
      return c ? Math.round(c.getBoundingClientRect().width) : null; })() : null;
    o.b2.anchoIgual = (o.b2.anchoAntes === o.b2.anchoDespues);
  } catch (e) { o.err.push('b2ancho: ' + e.message); }

  /* ══ B4 a B9 — LAS CUATRO VALVULAS, LOS CALCULADOS, LA FC Y EL CARTEL ══════════════════ */
  /* ⚠️ LA FC SE SIEMBRA EN EL CAMPO DEL INFORME, que es de donde el visor la LEE. Sin esto el
     gasto cardiaco daba null y la mini tabla decia «cargala en el informe»: la sonda medía un
     estado real pero no el que B8 describe. */
  try { const e = $('ao_fc'); if (e) { e.value = '70';
    e.dispatchEvent(new Event('input', { bubbles:true })); } } catch (e) {}
  await esp(220);
  o.b47 = (function () { try {
    const r = {};
    /* Insumos sembrados en el ESTADO, que es lo que la tabla lee. No se toca ningun campo del
       formulario: lo que esto prueba es el reparto y las cuentas, no el gesto. */
    _vCon(_vistaA, () => {
      const E = _dopEstado();
      E.ao.diam = 20; E.ao.vtiTsvi = 22; E.ao.vtiAo = 44; E.ao.vmax = 4; E.ao.pht = 400;
      E.ao.jetDiam = 5; E.ao.vc = 3;
      E.mit.ondaE = 80; E.mit.ondaA = 50; E.mit.ePrimaSept = 6; E.mit.ePrimaLat = 10;
      E.mit.pht = 220; E.mit.triv = 90; E.mit.tde = 180; E.mit.vtiVm = 20;
      E.mit.vmaxIm = 5; E.mit.vtiIm = 110; E.mit.vmaxAlias = 40; E.mit.pisa = 9; E.mit.vc = 6;
      E.tri.ondaS = 12; E.tri.trivTdi = 70; E.tri.vmaxIt = 3; E.tri.vtiVt = 40;
      E.tri.gradMedioVt = 5; E.tri.thpVt = 200; E.tri.vciDiam = 18; E.tri.vciCol = '>50';
      E.pul.tap = 100; E.pul.vtiPul = 18; E.pul.diamTsvd = 22; E.pul.vmaxEp = 1.2;
      E.pul.vmaxIp = 2; E.pul.vmaxIpTd = 2.5;
    });
    const rot = m => _dopFilas(m).map(f => f[0]);
    r.ordenAo = rot('ao'); r.ordenMit = rot('mit');
    r.ordenTri = rot('tri'); r.ordenPul = rot('pul');
    const D = _vCon(_vistaA, () => _dopDerivados());
    r.calcAo = (typeof _dopCalcFilas === 'function') ? _dopCalcFilas('ao', D).map(f => f[0] + '=' + f[1]) : null;
    r.calcMit = (typeof _dopCalcFilas === 'function') ? _dopCalcFilas('mit', D).map(f => f[0] + '=' + f[1]) : null;
    /* ⚠️ EL CONTRATO NUMERICO, contra los dueños de la app y no contra una cuenta escrita aca:
       area del TSVI = pi*(20/20)^2 = 3.1416 cm2; AVA = 3.1416*22/44 = 1.5708; DVI = 0.5;
       VS = pi*(20/10/2)^2*22 = 69.115 mL; E/A = 1.6; E/e' = 80/8 = 10; AVM por THP = 1.0;
       PmAD con 18 mm y colapso > 50 % = 3 mmHg. */
    r.num = { ava: D.ava, dvi: D.dvi, vs: D.vs, vsi: D.vsi, gc: D.gc, fc: D.fc,
              ea: D.ea, ee: D.ee, avmPht: D.avmPht, avmCont: D.avmCont,
              pmad: D.pmad ? D.pmad.pmad : null, bsa: D.bsa };
    return r;
  } catch (e) { return 'ERR ' + e.message; } })();

  /* El bloque en pantalla, con la tricuspide abierta (selector de colapso) y con la aortica. */
  o.b8 = (function () { try {
    _vCon(_vistaA, () => { if (typeof dopModo === 'function' && _dopEstado().modo !== 'ao') dopModo('ao'); });
    if (typeof _dopRender === 'function') _dopRender();
    const cc = $('cine-calc');
    const t = cc ? cc.querySelector('table') : null;
    return {
      hay: !!cc, visible: vis(cc),
      despuesDePaneles: (function () { const pn = $('cine-paneles');
        return !!(pn && cc && (pn.compareDocumentPosition(cc) & Node.DOCUMENT_POSITION_FOLLOWING)); })(),
      nCalc: t ? t.querySelectorAll('tr').length : 0,
      calcCursiva: t ? Array.from(t.querySelectorAll('tr'))
        .every(tr => getComputedStyle(tr).fontStyle === 'italic') : null,
      diceSoloVer: (cc ? (cc.textContent || '') : '').indexOf('sólo ver') > -1,
      diceNoEscribe: (cc ? (cc.textContent || '') : '').indexOf('no se escriben en ningún campo') > -1,
      /* B8: la FC fija */
      fcTitulo: (cc ? (cc.textContent || '') : '').indexOf('Frecuencia cardíaca') > -1,
      fcSoloLectura: (cc ? (cc.textContent || '') : '').indexOf('sólo lectura') > -1,
      fcSinControles: cc ? cc.querySelectorAll('input,select,textarea').length : null,
      texto: (cc ? (cc.textContent || '') : '').replace(/\s+/g, ' ').trim().slice(0, 300)
    };
  } catch (e) { return 'ERR ' + e.message; } })();

  o.b6 = (function () { try {
    _vCon(_vistaA, () => { if (typeof dopModo === 'function') dopModo('tri'); });
    if (typeof _dopRender === 'function') _dopRender();
    const caj = $('dop-cajon');
    const bs = caj ? Array.from(caj.querySelectorAll('[data-dop-vcicol]')) : [];
    return { nSelector: bs.length, rot: bs.map(b => (b.textContent || '').trim()),
             activo: bs.filter(b => b.className.indexOf('btn-primary') > -1)
               .map(b => b.getAttribute('data-dop-vcicol')),
             hayPmAD: (caj ? (caj.textContent || '') : '').indexOf('PmAD') > -1 };
  } catch (e) { return 'ERR ' + e.message; } })();

  /* ══ B9 — EL CARTEL DE CALIBRACION ════════════════════════════════════════════════════
     ⚠️ SE MIDE SOBRE UN FIXTURE SIN REGIONES, y lo destapo medir: con el fixture de siempre
     —que declara una region 2D y una Doppler— `_medCalFalta` devolvia null en las cuatro
     herramientas, o sea «no falta nada», que es CORRECTO pero no ejercita el cartel. El caso que
     B9 describe es una imagen sin escala: una captura de pantalla, un JPG, un DICOM que no la
     trae. Se abre uno asi para medirlo. */
  try {
    const sinReg = { nombre:'sin-escala', cuadros:1,
      d:{ frags:[jpg], cols:600, filas:500, msCuadro:40, regiones:[] } };
    _cineAbrir([sinReg]);
    await esp(520);
    _vCon(_vistaA, () => { if (!_vistaA.medOn) medToggle(); });
    await esp(300);
  } catch (e) { o.err.push('b9fix: ' + e.message); }
  o.b9 = (function () { try {
    const r = {};
    r.faltaDist = _vCon(_vistaA, () => { const F = _medCalFalta('dist'); return F ? F.eje : null; });
    r.faltaVel = _vCon(_vistaA, () => { const F = _medCalFalta('vel'); return F ? F.eje : null; });
    r.faltaVti = _vCon(_vistaA, () => { const F = _medCalFalta('vti'); return F ? F.eje : null; });
    r.faltaT = _vCon(_vistaA, () => { const F = _medCalFalta('tiempo'); return F ? F.eje : null; });
    const F2 = _vCon(_vistaA, () => _medCalFalta('dist'));
    r.conSinCalib = F2 ? F2.eje : null;
    if (F2) {
      _vCon(_vistaA, () => _medCalCartel('dist'));
      const ov = $('med-cal-ov');
      r.cartel = !!ov;
      r.tieneBoton = !!$('med-cal-ahora');
      r.rotBoton = $('med-cal-ahora') ? ($('med-cal-ahora').textContent || '').trim() : null;
      r.altoBoton = $('med-cal-ahora') ? Math.round($('med-cal-ahora').getBoundingClientRect().height) : null;
      r.guia = ov ? (ov.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200) : null;
      r.diceRegla = !!(ov && (ov.textContent || '').indexOf('regla de profundidad') > -1);
      try { $('med-cal-ok').click(); } catch (e) {}
      r.cerro = !$('med-cal-ov');
    }
    /* Y el del TIEMPO no ofrece «Calibrar ahora», porque no se puede. */
    const F3 = _vCon(_vistaA, () => _medCalFalta('tiempo'));
    r.tiempoSinAccion = F3 ? (F3.accion === null) : null;
    return r;
  } catch (e) { return 'ERR ' + e.message; } })();

  /* ══ A8 — EL FAC DEL VD PIERDE LA DIASTOLE AL MOVER EL CUADRO ═══════════════════════════ */
  o.a8 = (function () { try {
    const r = {};
    r.areasEsEstadoDeVista = (function () {
      try { const d = Object.getOwnPropertyDescriptor(_vistaA, 'medAreas');
        return !!(d || ('medAreas' in _vistaA)); } catch (e) { return 'ERR'; } })();
    r.simpEsEstadoDeVista = (function () {
      try { return !!(_vistaA && _vistaA.simp); } catch (e) { return 'ERR'; } })();
    /* Se siembran las DOS areas del VD como las guarda la herramienta Area. */
    _vCon(_vistaB, () => {
      medHerramienta('area');
      _medAreas = [ { pts:[{x:1,y:1}], cm2: 20.0, est: 'vdd' },
                    { pts:[{x:2,y:2}], cm2: 12.0, est: 'vds' } ];
    });
    r.antes = _vCon(_vistaB, () => _medAreas.map(a => a.est + ':' + a.cm2));
    r.facAntes = (typeof _medFacVD === 'function')
      ? (function () { const f = _medFacVD(20.0, 12.0); return f ? +f.fac.toFixed(2) : null; })() : null;
    /* El gesto real: mover el cuadro del cineloop. */
    return r;
  } catch (e) { return 'ERR ' + e.message; } })();
  try { await _vCon(_vistaB, () => cineIr(1)); } catch (e) { o.err.push('cineIr: ' + e.message); }
  await esp(500);
  try {
    o.a8.despues = _vCon(_vistaB, () => _medAreas.map(a => a.est + ':' + a.cm2));
    o.a8.perdioLaDiastole = !(o.a8.despues || []).some(s => s.indexOf('vdd') === 0);
    /* El Simpson, en cambio, sobrevive: es el control positivo de que mover el cuadro no borra
       TODO, sino solo lo que `medReset` tira. */
    o.a8.simpsonSobrevive = !!(_vistaB.simp && _vistaB.simp.pares[0].d && _vistaB.simp.pares[0].s);
  } catch (e) { o.err.push('a8post: ' + e.message); }

  /* ══ A2 — QUE QUEDA VIVO TRAS LIMPIAR, Y LA TABLA GUARDADA ═════════════════════════════ */
  o.a2 = (function () { try {
    const r = {};
    r.hayGuardado = (typeof _simpGuardado === 'function') ? !!_simpGuardado() : null;
    r.filasAntes = (typeof _simpFilasTabla === 'function') ? _simpFilasTabla().map(f => f.rot) : null;
    r.vivasAntes = (typeof _simpFilasVivas === 'function') ? _simpFilasVivas().map(f => f.rot) : null;
    return r;
  } catch (e) { return 'ERR ' + e.message; } })();
  /* Limpiar, por el camino real: el boton del panel unico. */
  try { _vCon(_vistaA, () => medHerramienta('simpson')); } catch (e) {}
  await esp(380);
  try {
    const b = $('cine-simp-limpiar-u');
    o.a2.hayBotonLimpiar = !!b;
    if (b) { b.click(); await esp(520); }
  } catch (e) { o.err.push('limpiar: ' + e.message); }
  await esp(300);
  try {
    o.a2.paresAtras = _vistaA.simp ? _vistaA.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null;
    o.a2.paresBtras = _vistaB.simp ? _vistaB.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null;
    o.a2.vivasTras = (typeof _simpFilasVivas === 'function') ? _simpFilasVivas().map(f => f.rot) : null;
    o.a2.filasTras = (typeof _simpFilasTabla === 'function') ? _simpFilasTabla().map(f => f.rot) : null;
    o.a2.guardadaTras = (typeof _simpFilasTabla === 'function')
      ? _simpFilasTabla().some(f => f.guardada) : null;
    o.a2.quedoLaOtraVista = !!(_vistaB.simp && _vistaB.simp.pares[0].d && _vistaB.simp.pares[0].s);
    o.a2.uniTexto = (txt('cine-simp-uni') || '').replace(/\s+/g, ' ').trim().slice(0, 220);
    /* ══ A3 AMPLIADO — ¿VUELVE LA IMAGEN A SU LUGAR TRAS LIMPIAR? ═══════════════════════ */
    o.a3img.trasLimpiar = { A: medirImagen(''), B: medirImagen(pfxB) };
    o.a3img.volvioA = (o.a3img.antes.A.lienzo && o.a3img.trasLimpiar.A.lienzo)
      ? (o.a3img.trasLimpiar.A.lienzo.y - o.a3img.antes.A.lienzo.y) : null;
    o.a3img.huecoTrasLimpiarA = o.a3img.trasLimpiar.A.huecoBarraImagen;
    o.a3img.barraTapadaTrasLimpiar = (function () {
      const b = medirBarra(''); return b ? b.tapadoPor : null; })();
  } catch (e) { o.err.push('a2post: ' + e.message); }

  /* ══ A9 CON UNA SOLA VISTA — EL CASO DEL MEDICO ═════════════════════════════════════════
     Con DOS vistas el panel unico se ve con la A en Doppler porque la B sigue en Simpson, y eso
     es correcto. El hallazgo tiene que medirse con UNA vista: tocar Simpson, trazar, y pasar al
     grupo Doppler. */
  try {
    if (typeof vistaCerrarUna === 'function' && _vistaB) vistaCerrarUna(_vistaB);
    await esp(600);
  } catch (e) { o.err.push('cerrarB: ' + e.message); }
  o.a9uni = { vistasAbiertas: (typeof _vTodas === 'function') ? _vTodas().length : null };
  try {
    const V = _vistaA;
    _vCon(V, () => { if (!V.medOn) medToggle(); medHerramienta('simpson'); });
    await esp(360);
    /* Un par completo en la unica vista, para que haya tabla y resultado. */
    _vCon(V, () => { _simp.fase = 'd'; _simpAceptar(tri(CX, YB, 190, HH)); medSimpsonConfirmar();
                     _simp.fase = 's'; _simpAceptar(tri(CX, YB, 125, HH)); medSimpsonConfirmar(); });
    _vCon(V, () => _medEstado());
    await esp(420);
    o.a9uni.conSimpson = {
      pasos: document.querySelectorAll('[data-simp-paso]').length,
      listo: document.querySelectorAll('[data-simp-listo]').length,
      uni: vis($('cine-simp-uni')), bip: vis($('cine-biplano')),
      barraDiceFase: (txt('cine-med-barra') || '').indexOf('ístole') > -1
    };
    /* Y ahora al grupo Doppler. */
    _vCon(V, () => medHerramienta('vel'));
    await esp(480);
    o.a9uni.conDoppler = {
      herr: V.medHerr,
      pasos: document.querySelectorAll('[data-simp-paso]').length,
      listo: document.querySelectorAll('[data-simp-listo]').length,
      uni: vis($('cine-simp-uni')), bip: vis($('cine-biplano')),
      barraDiceFase: (txt('cine-med-barra') || '').indexOf('ístole') > -1,
      barra: (txt('cine-med-barra') || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      uniTexto: (txt('cine-simp-uni') || '').replace(/\s+/g, ' ').trim().slice(0, 140),
      herrActiva: (typeof _simpUniHerrActiva === 'function') ? _simpUniHerrActiva() : null,
      docId: (typeof _simpUniDocId !== 'undefined') ? _simpUniDocId : '(no existe)',
      /* El globo de metodo, que es lo que A6 manda dejar en UNO solo. */
      globos: globosMetodo()
    };
  } catch (e) { o.err.push('a9uni: ' + e.message); }

  /* ══ A9, EL UNICO CAMINO QUE PODRIA PRODUCIRLO: UN TRAZADO SIN CONFIRMAR ════════════════
     Con una vista y por el camino normal el panel se esconde bien al pasar a Doppler (medido).
     `_simpUniHerrActiva` tiene DOS atajos que se saltean la pregunta por la herramienta:
     `pend` y `_simpUniDocId`. Se mide el primero, que es el alcanzable sin guardar nada. */
  try {
    const V = _vistaA;
    _vCon(V, () => { medHerramienta('simpson'); _simpAceptar(tri(CX, YB, 160, HH)); });
    _vCon(V, () => _medEstado());
    await esp(380);
    o.a9pend = { pendiente: !!(V.simp && V.simp.pendiente),
                 uniConSimpson: vis($('cine-simp-uni')) };
    _vCon(V, () => medHerramienta('vel'));
    await esp(480);
    o.a9pend.herr = V.medHerr;
    o.a9pend.sigueElPendiente = !!(V.simp && V.simp.pendiente);
    o.a9pend.uniConDoppler = vis($('cine-simp-uni'));
    o.a9pend.herrActiva = (typeof _simpUniHerrActiva === 'function') ? _simpUniHerrActiva() : null;
    o.a9pend.pasos = document.querySelectorAll('[data-simp-paso]').length;
    o.a9pend.rescate = !!$('cine-simp-conf-u');
    o.a9pend.uniTexto = (txt('cine-simp-uni') || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  } catch (e) { o.err.push('a9pend: ' + e.message); }

  return o;
})()
