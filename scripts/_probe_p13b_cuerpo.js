/* Cuerpo de _probe_p13b.mjs — PROMPT 13-B. Corre DENTRO del navegador.
 *
 *   B2  la traba con DOS cineloops: cuantas mutaciones del DOM hay DEBAJO de los videos con uno
 *       reproduciendose y con los dos, y cuantas veces se MUEVE un cajon de columna
 *   B3  pantalla completa en un monitor grande: donde esta el limite, con una y con dos vistas
 */
(async () => {
  const o = { err: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };

  const jpg = new Uint8Array([255,216,255,217]);
  const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 };
  const mk = (n, c) => { const fr = []; for (let i = 0; i < (c || 8); i++) fr.push(jpg);
    return { nombre:n, cuadros:fr.length, d:{ frags:fr, cols:1016, filas:708, msCuadro:40, regiones:[R2D] } }; };

  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}
  o.vp = { w: window.innerWidth, h: window.innerHeight };

  try { _cineAbrir([mk('P13B-A')]); } catch (e) { o.err.push('abrir: ' + e.message); return o; }
  await esp(520);
  try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) {}
  await esp(320);
  /* Se siembra una medicion en cada cajon: sin valores la tabla no se dibuja y el contador de
     mutaciones mide sobre nada — el denominador. */
  try { _vCon(_vistaA, () => { d2Modo('vi'); _d2Poner('vi.ddvi', 52); _d2Render(); }); } catch (e) {}
  await esp(260);

  /* La vista B, a mano (ver la nota del bloque 0: `vistaBAbrir` pide el estudio guardado). */
  try {
    const cont = $('cine-paneles');
    const libre = (_vistaA && _vistaA.pfx === 'b-') ? { p:'', r:'A' } : { p:'b-', r:'B' };
    const VB = _vNueva(libre.p, libre.r);
    _vMontarPanel(cont, libre.p);
    _vistaB = VB; _vCablear(VB);
    _vCon(VB, () => { VB.datos = { loops:[mk('P13B-B', 6)], i:0, cuadro:0, timer:null }; _cineCargarLoop(); });
    _vAccionesSync(); _vToggleSync();
    _vCon(VB, () => { try { medToggle(); } catch (e) {} });
  } catch (e) { o.err.push('vistaB: ' + e.message); }
  await esp(620);
  o.hayB = !!_vistaB;

  /* ══ B2 — EL CONTADOR DE MUTACIONES DEBAJO DE LOS VIDEOS ═══════════════════════════════════
     Se observa el MODAL entero y se descartan las mutaciones que caen dentro de un canvas o del
     contador de cuadros: lo que el medico ve parpadear es lo de ABAJO. Se cuenta ademas cuantas
     veces un cajon CAMBIA DE PADRE, que es la mudanza entre columnas. */
  const medirMut = async (cuantos, ms) => {
    const modal = $('cine-modal');
    if (!modal) return 'no hay modal';
    let mut = 0, mudanzas = 0;
    const padres = {};
    const ids = ['d2-cajon', 'cine-dop-slot', 'cine-calc'];
    ids.forEach(id => { const n = $(id); padres[id] = n && n.parentElement ? n.parentElement.id : null; });
    const obs = new MutationObserver(recs => {
      recs.forEach(r => {
        const t = r.target;
        if (!t) return;
        /* lo de la imagen y el contador no cuenta: eso TIENE que cambiar en cada cuadro */
        let p = t, dentroDeImagen = false;
        for (let k = 0; k < 8 && p; k++) {
          const id = p.id || '';
          if (id.indexOf('cine-recorte') >= 0 || id.indexOf('cine-num') >= 0 ||
              id.indexOf('cine-slider') >= 0) { dentroDeImagen = true; break; }
          p = p.parentElement;
        }
        if (!dentroDeImagen) mut++;
      });
      ids.forEach(id => { const n = $(id);
        const q = n && n.parentElement ? n.parentElement.id : null;
        if (q !== padres[id]) { mudanzas++; padres[id] = q; } });
    });
    obs.observe(modal, { childList:true, characterData:true, subtree:true, attributes:true });
    /* Se reproducen `cuantos` cineloops */
    try { _vCon(_vistaA, cineToggle); } catch (e) {}
    if (cuantos > 1) { try { _vCon(_vistaB, cineToggle); } catch (e) {} }
    await esp(ms);
    try { _vCon(_vistaA, _cineDetener); } catch (e) {}
    try { if (_vistaB) _vCon(_vistaB, _cineDetener); } catch (e) {}
    obs.disconnect();
    await esp(200);
    return { mutaciones: mut, mudanzasDeColumna: mudanzas, ms: ms };
  };
  o.B2unCineloop  = await medirMut(1, 2000);
  o.B2dosCineloops = await medirMut(2, 2000);

  /* ══ B3 — PANTALLA COMPLETA EN UN MONITOR GRANDE ═══════════════════════════════════════════ */
  const geo = () => {
    const ov = $('cine-ov'), m = $('cine-modal');
    const cv = $('cine-cv'), cvB = $('b-cine-cv');
    return {
      max: !!(ov && ov.classList.contains('cine-max')),
      dosVistas: !!_vistaB,
      modal: caja(m),
      modalScrollY: m ? (m.scrollHeight - m.clientHeight) : null,
      docScrollY: Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight),
      imgA: caja(cv), imgB: caja(cvB),
      imghVar: ov ? getComputedStyle(ov).getPropertyValue('--cine-imgh').trim() : null,
      /* el hueco que queda a los costados de la imagen dentro de su panel */
      vacioLatA: (function(){ try { const p = $('cine-panel'), c = $('cine-cv');
        if (!p || !c) return null; return Math.round(p.getBoundingClientRect().width - c.getBoundingClientRect().width); } catch(e){ return null; } })(),
      encabVista: (function(){ try { const e = $('cine-encab');
        return e ? Math.round(e.getBoundingClientRect().height) : null; } catch(x){ return null; } })(),
      pctAlto: (function(){ try { const c = $('cine-cv');
        return c ? Math.round(100 * c.getBoundingClientRect().height / window.innerHeight) : null; } catch(x){ return null; } })()
    };
  };
  o.B3dosNormal = geo();
  try { cineMaxToggle(); } catch (e) {}
  await esp(560);
  o.B3dosMax = geo();
  try { cineMaxToggle(); } catch (e) {}
  await esp(320);
  /* Y con UNA sola vista, que es el caso que el 1e no reparte */
  try { if (_vistaB) vistaCerrarUna(_vistaB); } catch (e) {}
  await esp(420);
  o.B3unaNormal = geo();
  try { cineMaxToggle(); } catch (e) {}
  await esp(560);
  o.B3unaMax = geo();
  try { cineMaxToggle(); } catch (e) {}
  await esp(260);
  return o;
})()
