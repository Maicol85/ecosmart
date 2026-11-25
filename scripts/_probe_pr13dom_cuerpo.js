/* PR13 - mide el VISOR REAL: el canvas en su contenedor, y la formula por su camino real. */
(async () => {
  const R = { err: [] };
  const F = n => { try { return typeof window[n] === 'function' ? window[n] : null } catch (e) { return null } };
  const V = n => { try { return eval(n) } catch (e) { return undefined } };
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  try {
    const c = document.createElement('canvas'); c.width = 600; c.height = 500;
    const g = c.getContext('2d'); g.fillStyle = '#223'; g.fillRect(0, 0, 600, 500);
    const b64 = c.toDataURL('image/jpeg').split(',')[1];
    const bin = atob(b64); const jpeg = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) jpeg[i] = bin.charCodeAt(i);
    const DX = 0.05;
    const reg = { tipo:1, x0:20, y0:20, x1:580, y1:480, ux:3, uy:3, dx:DX, dy:DX, rx0:20, ry0:20, rvx:0, rvy:0 };
    const loop = { nombre:'a4c.dcm', cuadros:4,
      d:{ frags:[jpeg,jpeg,jpeg,jpeg], cols:600, filas:500, msCuadro:40, regiones:[reg] } };
    /* /!\ EL MODULO DE DEFORMACION TIENE QUE ESTAR ENCENDIDO, o `medHerramienta('strain')` cae a
       Distancia por su primera capa -medido: la herramienta quedaba en «dist» y `_strain` en
       null-. Es una preferencia del medico en localStorage, no algo del visor. */
    try { localStorage.setItem(V('EE_DEF_KEY') || 'ett_ee_def', '1'); } catch (e) {}
    try { __t.limpiar(); } catch (e) {}
    try { if (F('imgVaciar')) imgVaciar(); } catch (e) {}
    _cineAbrir([loop]);
    await esperar(260);
    if (!V('_medOn') && F('medToggle')) { medToggle(); await esperar(160); }
    if (F('medHerramienta')) medHerramienta('strain');
    await esperar(160);
    R.visorAbierto = !!document.getElementById('cine-ov');
    R.herramienta = String(V('_medHerr'));

    /* ── LA FORMULA, POR SU CAMINO REAL: se siembran los arcos y se lee _strainCalcular ── */
    const CALC = F('_strainCalcular');
    const sembrar = pares => {
      const st = V('_strain'); if (!st) return null;
      /* /!\ LOS `pts` NO PUEDEN IR VACIOS: `dibujarTr`, dentro de `_medPintar`, lee pts[0].x y con
         un arreglo vacio tira un TypeError que se ve como error de PAGINA -medido-. Un trazado de
         verdad siempre trae puntos, asi que es la siembra la que tiene que parecerse al dato real
         y no el dibujante el que tenga que defenderse de un contorno imposible. */
      const PT = [{x:100,y:400},{x:300,y:120},{x:500,y:400}];
      const mk = (aA, aB) => ({ arcoAcm: aA, arcoBcm: aB, bordeCm: aA + aB, Lcm: 7,
                                cuerdaCm: 1, metodo: 'libre', imagen: 'a4c.dcm',
                                /* `eje` necesita `M` -el punto medio del anillo- ademas de `apex`:
                                   `dibujarTr` lee tr.eje.M.x y sin el tira un TypeError que se ve
                                   como error de PAGINA. Medido, no supuesto. */
                                eje: { apex: PT[1], M: { x:300, y:400 }, L: 280 },
                                pts: PT.slice(), cmPorPx: 0.01 });
      ['a4c','a2c','a3c'].forEach(k => { st.vistas[k] = { d: null, s: null }; });
      Object.keys(pares).forEach(k => {
        st.vistas[k] = { d: mk(pares[k][0], pares[k][2]), s: mk(pares[k][1], pares[k][3]) };
      });
      st.vista = Object.keys(pares)[0];
      return CALC ? CALC() : null;
    };
    const pct = r2 => (r2 && r2.terr) ? r2.terr.map(t => +t.pct.toFixed(6)) : null;
    R.formula = {};
    R.formula.menos20 = pct(sembrar({ a4c: [100, 80, 100, 80] }));
    R.formula.mas20   = pct(sembrar({ a4c: [100, 120, 100, 120] }));
    R.formula.cero    = pct(sembrar({ a4c: [100, 100, 100, 100] }));
    /* ES UN COCIENTE: escalar los dos largos por el mismo factor no mueve el resultado, asi que
       no depende de la calibracion mm/px. */
    R.formula.escalado7  = pct(sembrar({ a4c: [700, 560, 700, 560] }));
    R.formula.escalado013 = pct(sembrar({ a4c: [1.3, 1.04, 1.3, 1.04] }));

    /* ── LOS SEIS VALORES DEL PEDIDO, por el camino real, y su SGL ── */
    const r6 = sembrar({ a4c: [100, 83.7, 100, 69.9], a2c: [100, 89.9, 100, 88.6],
                         a3c: [100, 72.7, 100, 76.9] });
    R.seisPct = pct(r6);
    R.seisPares = r6 ? r6.terr.map(t => t.vista + '/' + t.pared + '=' + t.pct.toFixed(1)) : null;
    R.sgl6 = r6 ? +r6.sgl.toFixed(6) : null;
    R.sgl6Uno = r6 ? r6.sgl.toFixed(1) : null;

    /* ── EL LAYOUT REAL ── */
    if (F('_medEstado')) _medEstado();
    if (F('_strBullsRepintar')) _strBullsRepintar();
    await esperar(220);
    const cv = document.getElementById('cine-str-be');
    R.canvas = cv ? (function () {
      const b = cv.getBoundingClientRect();
      const cont = cv.parentElement ? cv.parentElement.getBoundingClientRect() : null;
      const col = (cv.closest('.cine-col-der') || cv.closest('#cine-paneles') || cv.closest('#cine-modal'));
      const cb = col ? col.getBoundingClientRect() : null;
      return { backing: { w: cv.width, h: cv.height }, cssW: cv.style.width,
               rect: { x:+b.x.toFixed(1), y:+b.y.toFixed(1), w:+b.width.toFixed(1), h:+b.height.toFixed(1) },
               contenedor: cont ? { x:+cont.x.toFixed(1), w:+cont.width.toFixed(1) } : null,
               dentroDelContenedor: cont ? (b.left >= cont.left - 0.5 && b.right <= cont.right + 0.5) : null,
               columna: cb ? { x:+cb.x.toFixed(1), w:+cb.width.toFixed(1), clase: col.className.slice(0,40) } : null,
               dentroDeLaColumna: cb ? (b.left >= cb.left - 0.5 && b.right <= cb.right + 0.5) : null };
    })() : null;
    R.scroll = { docW: document.documentElement.scrollWidth, docC: document.documentElement.clientWidth,
                 hayScrollH: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
    const modal = document.getElementById('cine-modal');
    R.modal = modal ? { w:+modal.getBoundingClientRect().width.toFixed(1),
                        scrollW: modal.scrollWidth, clientW: modal.clientWidth,
                        hayScrollH: modal.scrollWidth > modal.clientWidth + 1 } : null;
    /* El pie del panel: el SGL y el subtitulo que el canvas dibuja se leen de los pixeles, pero
       el SUBTITULO tambien se puede leer del texto que el dibujante emite. Se captura aparte. */
    R.textoDelPie = (function () {
      const S = 300;
      const cv2 = document.createElement('canvas'); cv2.width = S; cv2.height = S;
      const g2 = cv2.getContext('2d');
      const vistos = [];
      const ft = g2.fillText.bind(g2);
      g2.fillText = function (t, x, y) { vistos.push(String(t)); return ft(t, x, y); };
      try { F('_strBullsDibujar')(g2, S, F('_strResultadoVivo')(), false); } catch (e) { vistos.push('ERR ' + e.message); }
      return vistos;
    })();
    try { if (F('cineCerrar')) cineCerrar(); } catch (e) {}
    R.ventana = { w: window.innerWidth, h: window.innerHeight };
  } catch (e) { R.err.push('cuerpo: ' + String(e && e.message || e).slice(0, 300)); }
  return R;
})()
