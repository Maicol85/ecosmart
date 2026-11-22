/* Cuerpo de _probe_p11_0.mjs — bloque 0 de la tanda P11. Corre DENTRO del navegador.
 *
 * ⚠️ VIVE EN UN ARCHIVO APARTE A PROPOSITO, igual que el de MEDIR-4b: metido en un template
 * literal de la sonda, un acento grave en un comentario lo cierra antes de tiempo, y cuando lo
 * que queda es JS valido `node --check` NO lo ve. Aca se lee con readFile y se pasa como texto.
 *
 * MIDE, sin tocar una linea del producto:
 *   L1  la geometria del visor NORMAL: modal, lienzo, canvas, columna, barra, reproductor, y
 *       CUANTO ESPACIO QUEDA VACIO alrededor de la imagen (el hallazgo 1.1)
 *   L2  la misma geometria MAXIMIZADO (lo que hoy es «pantalla completa»)
 *   L3  lo mismo con DOS vistas
 *   B1  las medidas al cambiar de cuadro y al volver (2.2)
 *   B2  el contorno de la diastole dibujado al empezar la sistole (2.3)
 *   B3  donde esta el foco despues de medir y despues de Reproducir (2.1)
 */
(async () => {
  const o = { err: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };

  o.temaReal = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  o.vp = { w: window.innerWidth, h: window.innerHeight };

  /* El fixture: una region 2D isotropica, como los demas probes de esta casa. CUATRO cuadros,
     que es lo que hace medible el cambio de cuadro. */
  const jpg = new Uint8Array([255,216,255,217]);
  const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 };
  const mk = (n, c) => ({ nombre:n, cuadros:(c||4), d:{ frags:[jpg,jpg,jpg,jpg], cols:1016, filas:708,
    msCuadro:40, regiones:[R2D] } });

  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}

  try { _cineAbrir([mk('P11-fix')]); } catch (e) { o.err.push('abrir: ' + e.message); return o; }
  await esp(500);

  /* ── La geometria, con una funcion para no escribir la medicion dos veces ── */
  const geo = () => {
    const modal = caja($('cine-modal'));
    const lienzo = caja($('cine-lienzo'));
    const rec = caja($('cine-recorte'));
    const cv = caja($('cine-cv'));
    const col = document.querySelector('#cine-panel .cine-col-der');
    const barra = $('cine-grp-med');
    const pan = caja($('cine-panel'));
    const cvEl = $('cine-cv');
    const g = {
      max: !!(($('cine-ov')||{classList:{contains:()=>false}}).classList.contains('cine-max')),
      min: !!(($('cine-ov')||{classList:{contains:()=>false}}).classList.contains('cine-min')),
      modal, lienzo, rec, cv, panel: pan,
      col: caja(col), barra: caja(barra),
      cvMaxH: cvEl ? getComputedStyle(cvEl).maxHeight : null,
      cvMaxW: cvEl ? getComputedStyle(cvEl).maxWidth : null,
      modalScrollY: (function(){ const m=$('cine-modal'); return m ? m.scrollHeight - m.clientHeight : null; })(),
      docScrollX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    };
    /* EL VACIO: cuanto de la ventana NO lo ocupa la imagen, por eje. Es el numero del 1.1. */
    if (cv && modal) {
      g.vacioDer = Math.round(modal.x + modal.w - (cv.x + cv.w));
      g.vacioAbajo = Math.round(modal.y + modal.h - (cv.y + cv.h));
      g.imgPctAlto = Math.round(100 * cv.h / window.innerHeight);
      g.imgPctAncho = Math.round(100 * cv.w / window.innerWidth);
    }
    /* El hueco negro dentro del lienzo: el recorte mide la imagen, el lienzo la columna. */
    if (lienzo && rec) { g.negroLat = Math.round(lienzo.w - rec.w); g.negroVert = Math.round(lienzo.h - rec.h); }
    return g;
  };

  o.L1normal1v = geo();

  /* ── L2: maximizado ── */
  try { cineMaxToggle(); } catch (e) { o.err.push('max: ' + e.message); }
  await esp(420);
  o.L2max1v = geo();
  /* La columna, maximizado: ¿tapa la imagen? ¿donde arranca? */
  o.L2colTapa = (function(){
    try { const c = document.querySelector('#cine-panel .cine-col-der'), cv = $('cine-cv');
      if (!c || !cv) return null; const a = c.getBoundingClientRect(), b = cv.getBoundingClientRect();
      return { solapa: Math.round(Math.max(0, Math.min(a.right,b.right) - Math.max(a.left,b.left))),
               pos: getComputedStyle(c).position };
    } catch (e) { return 'ERR'; }
  })();
  try { cineMaxToggle(); } catch (e) {}
  await esp(300);

  /* ── L3: dos vistas ── */
  try {
    const pr = vistaBAbrir();
    await esp(260);
    const mini = document.querySelector('#cine-ov [data-vpick]') ||
                 document.querySelector('#cine-ov button img');
    if (mini) { (mini.closest('button') || mini).click(); }
    if (pr && pr.then) await pr;
  } catch (e) { o.err.push('vistaB: ' + e.message); }
  await esp(520);
  o.L3dos = { hayB: !!_vistaB, geoA: geo(),
    cols: document.querySelectorAll('#cine-paneles .cine-col-der').length,
    clase2v: !!($('cine-paneles')||{classList:{contains:()=>false}}).classList.contains('cine-2v') };
  try { cineMaxToggle(); } catch (e) {}
  await esp(420);
  o.L3dosMax = { geoA: geo(), cols: document.querySelectorAll('#cine-paneles .cine-col-der').length };
  try { cineMaxToggle(); } catch (e) {}
  await esp(260);
  try { if (_vistaB) vistaCerrarUna(_vistaB); } catch (e) { o.err.push('cerrarB: ' + e.message); }
  await esp(300);

  /* ── B1: las medidas por cuadro ── */
  try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) { o.err.push('medir: ' + e.message); }
  await esp(320);
  o.B1 = (function () {
    try {
      const antes = _vistaA.datos.cuadro;
      /* Se siembra una linea en el cuadro actual, por la misma puerta que el clic: el arreglo. */
      _vCon(_vistaA, () => { _medLineas.push(_medSello({ ax:10, ay:10, bx:60, by:10, mm: 25 })); _medPintar(); });
      const n0 = _vistaA.medLineas.length;
      return { cuadro0: antes, lineas0: n0 };
    } catch (e) { return 'ERR ' + e.message; }
  })();
  try { _vCon(_vistaA, () => cineIr(2)); } catch (e) {}
  await esp(420);
  o.B1b = { cuadro: _vistaA.datos.cuadro, lineas: _vistaA.medLineas.length,
            num: ($('cine-num')||{textContent:''}).textContent };
  try { _vCon(_vistaA, () => cineIr(0)); } catch (e) {}
  await esp(420);
  o.B1c = { cuadro: _vistaA.datos.cuadro, lineas: _vistaA.medLineas.length,
            num: ($('cine-num')||{textContent:''}).textContent };

  /* ── B2: el contorno de la diastole al empezar la sistole ──
     Se siembra el par de diastole por la puerta del propio modulo y se lee el estado que
     `_medPintar` usa para decidir si lo dibuja. */
  o.B2 = (function () {
    try {
      _vCon(_vistaA, () => { if (typeof medHerramienta === 'function') medHerramienta('simpson'); });
      if (!_simp) return { sinSesion: true };
      const pts = []; for (let i = 0; i < 12; i++) pts.push({ x: 100 + i*10, y: 100 + (i%3)*20 });
      const tr = { pts: pts, eje:{ M:{x:100,y:100}, apex:{x:200,y:300}, ux:0.4, uy:0.9, L:200 },
                   diam: new Array(20).fill(30), vol: 50, imagen:'fix' };
      _simp.pares[_simp.vista].d = tr;
      _simp.fase = 's'; _simp.pendiente = null; _simp.ocultar = false;
      const ultimo = _simp.pares[_simp.vista][_simp.fase === 'd' ? 's' : 'd'];
      const dibuja = !!(_simp.pendiente || (_simp.ocultar ? null : ultimo));
      return { fase: _simp.fase, hayD: !!_simp.pares[_simp.vista].d, ocultar: !!_simp.ocultar,
               dibujaElOtro: dibuja };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── B3: donde queda el foco ── */
  o.B3 = (function () {
    const quien = () => { const a = document.activeElement; return a ? (a.id || a.tagName) : 'null'; };
    const r = { alAbrir: quien() };
    try { const cv = $('cine-med'); if (cv) cv.dispatchEvent(new MouseEvent('click', { bubbles:true, clientX:50, clientY:50 })); } catch (e) {}
    r.trasClicCanvas = quien();
    try { $('cine-play').click(); } catch (e) {}
    r.trasPlay = quien();
    try { $('cine-play').click(); } catch (e) {}
    r.hayKeydownEnOverlay = (function(){
      /* No se puede enumerar oyentes desde la pagina; se declara lo que SI se puede saber. */
      return null;
    })();
    return r;
  })();

  o.slider = (function(){ const s = $('cine-slider'); return s ? { max: s.max, value: s.value, tag: s.tagName } : null; })();
  return o;
})()
