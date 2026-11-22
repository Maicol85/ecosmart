/* Cuerpo de _probe_p11a.mjs — TAREA 1 de la tanda P11. Corre DENTRO del navegador.
 * Vive aparte por la leccion de los acentos graves (MEDIR-4b).
 *
 * Mide, con el camino REAL (el visor se abre con _cineAbrir, la vista B con vistaBAbrir mas un
 * clic sobre su miniatura, y las mediciones con clics sobre el canvas de medicion):
 *   1.1  la imagen en tamanio Normal: cuanto ocupa y cuanto queda vacio
 *   1.2  pantalla completa: la imagen llena el alto, la columna no tapa, y el interruptor
 *   1.3  dos vistas en pantalla completa: UNA columna, la de la vista con foco
 *   1.4  los botones de la barra en la columna; sobre la imagen solo los racimos y Capturar
 *   1.5  los racimos: 44 px de area tactil, sin texto, donde corresponde
 *   1.6  cambiar de tamanio NO pierde lo medido y los milimetros quedan EXACTOS
 */
(async () => {
  const o = { err: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };

  o.temaReal = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  o.vp = { w: window.innerWidth, h: window.innerHeight };

  const jpg = new Uint8Array([255,216,255,217]);
  const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:1016, y1:708, tipo:1 };
  const mk = (n, c) => ({ nombre:n, cuadros:(c||4), d:{ frags:[jpg,jpg,jpg,jpg], cols:1016, filas:708,
    msCuadro:40, regiones:[R2D] } });

  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}

  /* ── La geometria, una sola funcion ─────────────────────────────────────────────────────── */
  const geo = pfx => {
    const q = id => $((pfx || '') + id);
    const ov = $('cine-ov'), modal = $('cine-modal');
    const cv = q('cine-cv'), lienzo = q('cine-lienzo'), rec = q('cine-recorte');
    const g = {
      max: !!(ov && ov.classList.contains('cine-max')),
      min: !!(ov && ov.classList.contains('cine-min')),
      sinpanel: !!(ov && ov.classList.contains('cine-sinpanel')),
      modal: caja(modal), cv: caja(cv), lienzo: caja(lienzo), rec: caja(rec),
      col: caja(q('cine-col')),
      colDisplay: q('cine-col') ? getComputedStyle(q('cine-col')).display : null,
      modalScrollY: modal ? (modal.scrollHeight - modal.clientHeight) : null,
      docScrollX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      cvPx: cv ? (cv.width + 'x' + cv.height) : null
    };
    if (g.cv && g.lienzo) { g.negroLat = g.lienzo.w - g.cv.w; g.negroVert = g.lienzo.h - g.cv.h; }
    if (g.cv && g.rec) g.recNegro = (g.rec.w - g.cv.w) + 'x' + (g.rec.h - g.cv.h);
    if (g.cv) { g.pctAncho = Math.round(100 * g.cv.w / window.innerWidth);
                g.pctAlto  = Math.round(100 * g.cv.h / window.innerHeight); }
    /* ¿La columna TAPA la imagen? Se mide el solape horizontal real. */
    if (g.col && g.cv && g.colDisplay !== 'none') {
      const a = q('cine-col').getBoundingClientRect(), b = q('cine-cv').getBoundingClientRect();
      g.colSolapa = Math.round(Math.max(0, Math.min(a.right,b.right) - Math.max(a.left,b.left)));
      g.colPos = getComputedStyle(q('cine-col')).position;
    } else { g.colSolapa = 0; g.colPos = '(escondida)'; }
    return g;
  };

  /* ── Donde esta cada control ────────────────────────────────────────────────────────────── */
  const donde = pfx => {
    const q = id => $((pfx || '') + id);
    const dentro = (id, cont) => { const e = q(id), c = q(cont); return !!(e && c && c.contains(e)); };
    const r = {
      barraEnCol: dentro('cine-grp-med', 'cine-barra-slot'),
      barraEnCasa: dentro('cine-grp-med', 'cine-barra-casa'),
      barraEnPanel: !!(q('cine-grp-med') && q('cine-grp-med').closest('[id$="cine-panel"]') === q('cine-panel')),
      capEnImagen: dentro('cine-cap', 'cine-imgbl'),
      capEnBarra: dentro('cine-cap', 'cine-grp-med'),
      maxiEnImagen: !!($('cine-maxi') && q('cine-imgtr') && q('cine-imgtr').contains($('cine-maxi'))),
      encabVisible: !!(q('cine-encab') && q('cine-encab').getBoundingClientRect().height > 0),
      /* El orden de la barra, que tres casos del suite miden */
      barraRot: (function(){ const b = q('cine-grp-med'); if (!b) return null;
        return Array.from(b.querySelectorAll('button')).map(x => (x.textContent||'').trim().slice(0,14)); })(),
      /* Los racimos: cuantos botones, su area tactil y si llevan texto */
      racimos: ['cine-imgtr','cine-imgbr','cine-imgbl'].map(id => { const c = q(id); if (!c) return null;
        const bs = Array.from(c.querySelectorAll('button'));
        return { id: id, n: bs.length,
          vis: bs.filter(b => b.getBoundingClientRect().height > 0).length,
          cajas: bs.map(b => { const k = caja(b); return k ? (k.w + 'x' + k.h) : '0x0'; }),
          txt: bs.map(b => (b.textContent||'').trim().slice(0,12)) }; })
    };
    /* Lo que queda SOBRE la imagen: los botones que caen dentro de la caja del recorte */
    const rec = q('cine-recorte');
    if (rec) {
      const rr = rec.getBoundingClientRect();
      r.sobreImagen = Array.from($('cine-ov').querySelectorAll('button')).filter(b => {
        const k = b.getBoundingClientRect();
        if (!k.width || !k.height) return false;
        return k.left >= rr.left - 1 && k.right <= rr.right + 1 && k.top >= rr.top - 1 && k.bottom <= rr.bottom + 1;
      }).map(b => b.id || (b.textContent||'').trim().slice(0,12));
    }
    return r;
  };

  try { _cineAbrir([mk('P11-fix')]); } catch (e) { o.err.push('abrir: ' + e.message); return o; }
  await esp(520);

  /* ══ 1.1 — NORMAL, UNA VISTA, SIN MEDIR (modo minimo) ══ */
  o.n1_min = geo('');
  o.n1_minDonde = donde('');

  /* Con la medicion encendida, que es cuando la columna lleva contenido */
  try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) { o.err.push('medir: ' + e.message); }
  await esp(360);
  o.n1_med = geo('');
  o.n1_medDonde = donde('');

  /* ══ 1.6 — LO MEDIDO Y LOS MILIMETROS, ANTES Y DESPUES DE CAMBIAR DE TAMANIO ══
     Con el GESTO REAL: dos clics sobre el canvas de medicion. Las coordenadas de pantalla se
     derivan de dos coordenadas de IMAGEN fijas, que es lo unico que hace comparable la medicion
     entre dos tamanios distintos — un clic en el mismo punto de la PANTALLA cae en otro punto de
     la imagen cuando la imagen cambia de tamanio. */
  const PIX_A = { x: 200, y: 150 }, PIX_B = { x: 600, y: 150 };
  const clicEnImagen = (pix) => {
    const cv = $('cine-med') || $('cine-cv');
    const r = cv.getBoundingClientRect();
    const cvb = $('cine-cv');
    const sx = r.width / cvb.width, sy = r.height / cvb.height;
    const x = r.left + pix.x * sx, y = r.top + pix.y * sy;
    cv.dispatchEvent(new MouseEvent('click', { bubbles:true, clientX:x, clientY:y }));
  };
  const medir = async () => {
    try { _vCon(_vistaA, () => medHerramienta('dist')); } catch (e) {}
    await esp(200);
    clicEnImagen(PIX_A); await esp(120); clicEnImagen(PIX_B); await esp(220);
    const l = _vistaA.medLineas.filter(x => !x.calibracion);
    return l.length ? { mm: l[l.length-1].mm, ax: l[l.length-1].ax, bx: l[l.length-1].bx } : null;
  };
  o.m_normal = await medir();
  o.m_nLineas = _vistaA.medLineas.length;
  /* El calce del overlay sobre la imagen, que es lo que hace que una regla caiga donde se marco */
  const calce = () => { const b = $('cine-cv'), m = $('cine-med');
    if (!b || !m) return 'faltan';
    const q1 = b.getBoundingClientRect(), p1 = m.getBoundingClientRect();
    return Math.round(p1.left-q1.left) + ',' + Math.round(p1.top-q1.top) + ' ' +
           Math.round(p1.width-q1.width) + 'x' + Math.round(p1.height-q1.height); };
  o.m_calceNormal = calce();

  /* ══ 1.2 — PANTALLA COMPLETA ══ */
  try { $('cine-maxi').click(); } catch (e) { o.err.push('maxi: ' + e.message); }
  await esp(460);
  o.x1_max = geo('');
  o.x1_maxDonde = donde('');
  o.m_trasMax = { nLineas: _vistaA.medLineas.length,
                  mm: (function(){ const l = _vistaA.medLineas.filter(x=>!x.calibracion);
                       return l.length ? l[l.length-1].mm : null; })(),
                  medOn: !!_vistaA.medOn, herr: _vistaA.medHerr,
                  calib: _vistaA.medCalib ? 'si' : 'no', calce: calce() };
  /* La MISMA medicion, con la imagen de otro tamanio: los milimetros tienen que coincidir */
  o.m_maxNueva = await medir();

  /* El interruptor de la columna */
  try { $('cine-pan').click(); } catch (e) { o.err.push('pan: ' + e.message); }
  await esp(420);
  o.x2_sinpanel = geo('');
  o.x2_sigueMidiendo = { medOn: !!_vistaA.medOn, herr: _vistaA.medHerr,
                         nLineas: _vistaA.medLineas.length, calce: calce() };
  o.m_sinpanelNueva = await medir();
  try { $('cine-pan').click(); } catch (e) {}
  await esp(380);
  o.x3_conpanel = geo('');

  /* ══ 1.6 — Esc sale del tamanio y NO cierra ══ */
  return o;
})()
