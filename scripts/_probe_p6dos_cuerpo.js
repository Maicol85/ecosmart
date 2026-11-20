/* Cuerpo de _probe_p6dos.mjs — PROMPT 6, los dos motores. Aparte, por la leccion de MEDIR-4b. */
(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = {};
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display = 'none';
  window.__clnkBaseTest = window.__P6_BASE;
  window.toast = function () {}; window.alert = function () {}; window.confirm = function () { return true; };
  const CTRL = async b => (await fetch(window.__P6_BASE + '/_control',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })).json();
  /* El tema se pone de VERDAD —la clave mas `loadTheme()`— y se DEVUELVE: esta app no usa
     `prefers-color-scheme`, asi que el `colorScheme` del contexto de Playwright no la mueve.
     Es la leccion de PANT-34, que midio dos veces el tema oscuro sin darse cuenta. */
  try { localStorage.setItem('ett_theme', window.__P6_TEMA); if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  o.temaPuesto = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  try { localStorage.setItem('ett_view_mode', 'avanzado'); if (typeof applyViewMode === 'function') applyViewMode(); } catch (e) {}
  try { localStorage.removeItem('ett_ceibolink_token'); clnkToggle(true); } catch (e) {}
  /* ⚠️ **CUATRO** EQUIPOS Y NO CINCO, Y LO DESTAPO ESTA SONDA. Con `equipos: 5` entra uno
     PENDIENTE, y entonces el sondeo gana por el aviso de equipo nuevo —esa es la prioridad que
     esta app ya tenia: hasta que el medico decida, las imagenes de ese equipo estan en cuarentena
     y no salen en la lista— asi que el cartel de la TANDA no se abria nunca. La primera corrida
     informo `svg: false` y `viajan: 0` en los 32 cruces: un denominador vacio, que se lee igual
     que «el dibujo no esta». Los cuatro autorizados —el ecografo, el buzon y la carpeta de
     entrada— alcanzan para el panel y dejan la tanda medible. */
  await CTRL({ reset: true, equipos: 4, escena: 'vacio' });
  showTab('config'); if (window.cfgOnShow) cfgOnShow();
  await esp(900);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = window.__P6_COD; cod.dispatchEvent(new Event('input', { bubbles: true })); await clnkVincular(); }
  await esp(1500);
  o.vinculado = clnkVinculado();
  if (!o.vinculado) { o.err = 'no se pudo vincular'; return o; }
  const EL = id => document.getElementById(id);
  const cajaDe = n => { if (!n) return null; const r = n.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; };

  /* ══ (1) EL CARTEL DE LA TANDA ═══════════════════════════════════════════════════ */
  await CTRL({ escena: 'tandaTres' });
  await _clnkSondear(true);
  await esp(1200);
  const sv = EL('clnk-tanda-svg');
  o.cartel = {
    abierto: !!(EL('clnkav-ov') && EL('clnkav-ov').style.display !== 'none'),
    svg: !!sv, caja: cajaDe(sv),
    viajan: sv ? sv.querySelectorAll('[data-clnk-viaja]').length : 0,
    /* EL COLOR, RESUELTO: ni un negro heredado. Es la trampa de POP-B con `--amber` y de
       PANT-13 con `--card`: un `var()` en un atributo de presentacion cae en el negro. */
    rellenos: sv ? Array.prototype.map.call(sv.querySelectorAll('rect'),
      r => getComputedStyle(r).fill).join('|') : '',
    negros: sv ? Array.prototype.filter.call(sv.querySelectorAll('rect, text'),
      r => { const f = getComputedStyle(r).fill;
             return f === 'rgb(0, 0, 0)' || f === '#000000' || f === 'rgb(0,0,0)'; }).length : -1,
    animando: sv ? Array.prototype.filter.call(sv.querySelectorAll('[data-clnk-viaja]'),
      r => getComputedStyle(r).animationName === 'clnk-viaja').length : -1,
    botonesApagados: CLNK_AV_BOTONES.map(k => EL('clnkav-' + k))
      .filter(b => b && b.style.display !== 'none' && b.textContent)
      .every(b => b.disabled),
    nBotones: CLNK_AV_BOTONES.map(k => EL('clnkav-' + k))
      .filter(b => b && b.style.display !== 'none' && b.textContent).length,
    dentro: (function () { const m = EL('clnkav-ov');
      if (!m) return null; const c = m.firstElementChild;
      if (!c) return null; const r = c.getBoundingClientRect();
      return r.left >= -0.6 && r.top >= -0.6 && r.right <= window.innerWidth + 0.6; })(),
    recortados: (function () { const m = EL('clnkav-ov'); if (!m) return -1;
      return Array.prototype.filter.call(m.querySelectorAll('*'),
        e => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 &&
             getComputedStyle(e).overflowX !== 'auto').length; })()
  };
  clnkAvisoCerrar();

  /* ══ (2) LA BURBUJA ══════════════════════════════════════════════════════════════ */
  clnkBurbuja(9, true);
  await esp(400);
  const bu = EL('clnk-burbuja');
  const rb = bu ? bu.getBoundingClientRect() : null;
  o.burbuja = {
    caja: cajaDe(bu),
    dentro: !!rb && rb.left >= 0 && rb.top >= 0 && rb.right <= window.innerWidth + 0.6 &&
            rb.bottom <= window.innerHeight + 0.6,
    capa: bu ? getComputedStyle(bu).zIndex : '',
    fondo: bu ? getComputedStyle(bu).backgroundColor : '',
    late: bu ? getComputedStyle(bu).animationName : '',
    ciclo: bu ? getComputedStyle(bu).animationDuration : '',
    altoTactil: rb ? Math.round(rb.height) : -1,
    pad: document.body.style.paddingBottom,
    /* NO TAPA NI UN BOTON, desplazado al final del documento. */
    tapados: (function () {
      window.scrollTo(0, document.documentElement.scrollHeight);
      let n = 0, denom = 0;
      Array.prototype.forEach.call(document.querySelectorAll('button, [role=button], .btn, a[href], summary, input, select'), el => {
        if (el === bu || bu.contains(el)) return;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) return;
        denom++;
        const t = document.elementFromPoint(cx, cy);
        if (t && (t === bu || bu.contains(t))) n++;
      });
      window.scrollTo(0, 0);
      return { tapados: n, denominador: denom };
    })(),
    scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth
  };
  clnkBurbujaOcultar();

  /* ══ (3) EL PANEL DE DATOS DEL ECOGRAFO ══════════════════════════════════════════ */
  await CTRL({ conexion: { puerto_dicom: 4242, aet_puente: 'PUENTE',
    direcciones: [
      { direccion: '192.168.1.23', interfaz: 'en7', probable: false, tipo: 'cable', enlace: true },
      { direccion: '169.254.7.7',  interfaz: 'en9', probable: false, tipo: 'cable', enlace: true },
      { direccion: '192.168.1.50', interfaz: 'en0', probable: false, tipo: 'wifi',  enlace: true },
      { direccion: '192.168.4.4',  interfaz: 'en5', probable: false, tipo: 'cable', enlace: false }
    ],
    aviso: 'Hay mas de una direccion.',
    carpeta_compartida: { ruta: 'C:/CeiboLink-Entrada', usuario: 'ecografo', existe: true, aviso: null } } });
  const det = EL('cfg-clnk-det-conexion'); if (det) det.open = true;
  clnkLeerConexion();
  await esp(1200);
  const cx = EL('cfg-clnk-conexion');
  o.panel = {
    dirs: cx ? Array.prototype.map.call(cx.querySelectorAll('code'),
      c => String(c.textContent)).filter(x => x.indexOf('.') > -1) : [],
    apagadas: cx ? cx.querySelectorAll('[data-clnk-dir-apagada]').length : -1,
    carpeta: !!document.querySelector('[data-clnk-carpeta]'),
    pwd: !!document.querySelector('[data-clnk-carpeta-pwd]'),
    campos: (function () { const c = document.querySelector('[data-clnk-carpeta]');
      return c ? c.querySelectorAll('input, select, textarea').length : -1; })(),
    sinDesconocido: cx ? String(cx.textContent || '').indexOf('desconocido') === -1 : null,
    copiar: cx ? cx.querySelectorAll('[data-clnk-copiar]').length : -1,
    tactil: cx ? Array.prototype.filter.call(cx.querySelectorAll('button'),
      b => b.getBoundingClientRect().height > 0 &&
           b.getBoundingClientRect().height < 43.5).length : -1,
    scrollX: cx ? cx.scrollWidth > cx.clientWidth + 1 : null
  };

  /* ══ (4) LA TARJETA DE LOS QUE NO SE PUEDEN VER ══════════════════════════════════ */
  await CTRL({ escena: 'buzonNoVisibles' });
  await esp(250);
  await clnkRevisarImagenes(true);
  await esp(1400);
  const tj = document.querySelector('[data-clnk-nover-tarjeta]');
  o.tarjeta = {
    hay: !!tj, n: tj ? tj.getAttribute('data-clnk-nover-tarjeta') : '',
    caja: cajaDe(tj),
    filas: tj ? tj.querySelectorAll('[data-clnk-nover-fila]').length : -1,
    botones: CLNK_AV_BOTONES.map(k => EL('clnkav-' + k))
      .filter(b => b && b.style.display !== 'none' && b.textContent)
      .map(b => String(b.textContent)),
    recortados: tj ? Array.prototype.filter.call(tj.querySelectorAll('*'),
      e => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0).length : -1
  };
  clnkAvisoCerrar();
  o.scrollXdoc = document.documentElement.scrollWidth > document.documentElement.clientWidth;
  return o;
})()
