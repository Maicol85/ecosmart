/* Cuerpo de _probe_p13dos.mjs — los DOS motores, tanda P13. Corre DENTRO del navegador.
 * Archivo aparte por la leccion de los acentos graves. */
(async () => {
  const o = { err: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const vis = el => { if (!el) return false; const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  /* El tema REAL, puesto por la clave de la app y devuelto para que no se pueda medir dos veces
     el mismo lado — la leccion de PANT-34. */
  o.temaReal = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  o.vp = { w: window.innerWidth, h: window.innerHeight };

  const jpg = new Uint8Array([255,216,255,217]);
  const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 };
  const mk = n => ({ nombre:n, cuadros:3, d:{ frags:[jpg,jpg,jpg], cols:1016, filas:708, msCuadro:40, regiones:[R2D] } });

  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}

  /* El diametro cargado a mano, para el circulo */
  try { const e = $('diam_tsvi'); if (e) { e.value = '20'; e.dispatchEvent(new Event('input', { bubbles:true })); } } catch (e) {}
  await esp(240);

  try { _cineAbrir([mk('P13-dos')]); } catch (e) { o.err.push('abrir: ' + e.message); return o; }
  await esp(520);

  /* ── 1a: los dos controles del modal, con el visor recien abierto ── */
  o.A = { min: $('cine-ov').classList.contains('cine-min'),
          addB: vis($('cine-add-b')), cerrar: vis($('cine-cerrar')),
          cerrarV: vis($('cine-cerrar-v')), guardar: !!$('cine-guardar'),
          maxi: vis($('cine-maxi')), maxiEnRacimo: !!($('cine-maxi') && $('cine-maxi').closest('[id$="cine-imgtr"]')),
          maxiAlto: (function(){ const b=$('cine-maxi'); return b?Math.round(b.getBoundingClientRect().height):null; })(),
          pan: vis($('cine-pan')) };

  try { $('cine-medir').click(); } catch (e) {}
  await esp(400);
  /* ── el circulo: color, contraste y area tactil ── */
  try { _vCon(_vistaA, () => { d2Modo('ao'); }); } catch (e) {}
  await esp(320);
  o.C = (function () {
    try {
      const bs = [].slice.call(document.querySelectorAll('[data-med-circ]'));
      const b = bs.filter(x => x.getAttribute('data-med-circ') === 'vi.tsvi')[0] || null;
      const sp = b ? b.querySelector('span') : null;
      const r = b ? b.getBoundingClientRect() : null;
      return { n: bs.length, hay: !!b,
        pressed: b ? b.getAttribute('aria-pressed') : null,
        color: sp ? getComputedStyle(sp).backgroundColor : null,
        tactil: r ? Math.round(Math.max(r.height, (function(){ try { const cs=getComputedStyle(b,'::after');
          return parseFloat(cs.height)||0; } catch(e){ return 0; } })())) : null,
        altoFila: (function(){ const tr = b ? b.closest('tr') : null;
          return tr ? Math.round(tr.getBoundingClientRect().height) : null; })(),
        tieneTitulo: !!(b && (b.getAttribute('title') || '').length > 10),
        tieneAria: !!(b && (b.getAttribute('aria-label') || '').length > 10) };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── 1h: el interruptor aparece con la columna escondida, tambien en Normal ── */
  try { cinePanelToggle(); } catch (e) {}
  await esp(240);
  o.H = { sinpanel: $('cine-ov').classList.contains('cine-sinpanel'), pan: vis($('cine-pan')),
          col: vis(document.querySelector('#cine-panel .cine-col-der')) };
  try { cineMaxToggle(); } catch (e) {}
  await esp(320);
  try { cineMaxToggle(); } catch (e) {}
  await esp(320);
  o.Hvuelve = { sinpanel: $('cine-ov').classList.contains('cine-sinpanel'),
                col: vis(document.querySelector('#cine-panel .cine-col-der')) };

  /* ── 13-B 3a: pantalla completa con UNA vista ── */
  try { cineMaxToggle(); } catch (e) {}
  await esp(520);
  o.Max1 = { imgh: getComputedStyle($('cine-ov')).getPropertyValue('--cine-imgh').trim(),
    img: caja($('cine-cv')), modalScrollY: (function(){ const m=$('cine-modal'); return m ? m.scrollHeight - m.clientHeight : null; })(),
    pieOculto: (function(){ const e=$('cine-pie'); return !!e && getComputedStyle(e).display === 'none'; })(),
    bodyOv: getComputedStyle(document.body).overflow,
    htmlOv: getComputedStyle(document.documentElement).overflow,
    pctAlto: Math.round(100 * ($('cine-cv') ? $('cine-cv').getBoundingClientRect().height : 0) / window.innerHeight) };
  try { cineMaxToggle(); } catch (e) {}
  await esp(320);
  o.TrasSalir = { bodyOv: getComputedStyle(document.body).overflow,
                  htmlOv: getComputedStyle(document.documentElement).overflow };

  /* ── DOS vistas: 1b, 1d, 1c y el 1e en pantalla completa ── */
  try {
    const cont = $('cine-paneles');
    const libre = (_vistaA && _vistaA.pfx === 'b-') ? { p:'', r:'A' } : { p:'b-', r:'B' };
    const VB = _vNueva(libre.p, libre.r);
    _vMontarPanel(cont, libre.p);
    _vistaB = VB; _vCablear(VB);
    _vCon(VB, () => { VB.datos = { loops:[mk('P13-dos-B')], i:0, cuadro:0, timer:null }; _cineCargarLoop(); });
    _vAccionesSync(); _vToggleSync();
  } catch (e) { o.err.push('vistaB: ' + e.message); }
  await esp(640);
  const pfxA = _vistaA.pfx || '', pfxB = _vistaB ? (_vistaB.pfx || '') : null;
  o.D = { hayB: !!_vistaB,
    cerrarV: document.querySelectorAll('#cine-ov [id$="cine-cerrar-v"]').length,
    cerrarVvisibles: [].slice.call(document.querySelectorAll('#cine-ov [id$="cine-cerrar-v"]')).filter(e => getComputedStyle(e).display !== 'none').length,
    enEncab: [].slice.call(document.querySelectorAll('#cine-ov [id$="cine-cerrar-v"]')).every(e => !!e.closest('[id$="cine-encab"]')),
    maxi: document.querySelectorAll('#cine-ov [id$="cine-maxi"]').length,
    rotA: (function(){ const b=$(pfxA+'cine-rot'); return b?(b.textContent||'').trim():''; })(),
    rotB: (function(){ const b=$((pfxB||'')+'cine-rot'); return b?(b.textContent||'').trim():''; })(),
    imgs: [].slice.call(document.querySelectorAll('[id$="cine-cv"]')).map(e => caja(e)),
    barras: [].slice.call(document.querySelectorAll('[id$="cine-grp-med"]')).map(e => ({ id:e.id, ...caja(e), botones:e.querySelectorAll('button').length })) };
  try { cineMaxToggle(); } catch (e) {}
  await esp(620);
  o.E = { imgh: getComputedStyle($('cine-paneles')).getPropertyValue('--cine-imgh').trim(),
    grande: (function(){ const p=document.querySelector('#cine-paneles .cine-v-grande'); return p?caja(p):null; })(),
    chica: (function(){ const p=document.querySelector('#cine-paneles .cine-v-chica'); return p?caja(p):null; })(),
    imgs: [].slice.call(document.querySelectorAll('[id$="cine-cv"]')).map(e => caja(e)),
    colsVis: [].slice.call(document.querySelectorAll('#cine-paneles .cine-col-der')).filter(vis).length,
    panEnChica: (function(){ const p=document.querySelector('#cine-paneles .cine-v-chica');
      const b=p?p.querySelector('[id$="cine-pan"]'):null; return b?vis(b):'n/d'; })(),
    modalScrollY: (function(){ const m=$('cine-modal'); return m ? m.scrollHeight - m.clientHeight : null; })() };
  try { cineMaxToggle(); } catch (e) {}
  await esp(300);

  o.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  /* ids duplicados dentro del visor, con las dos vistas montadas */
  o.dup = (function () { const ov = $('cine-ov'); if (!ov) return ['(sin overlay)'];
    const vistos = {}, dup = [];
    ov.querySelectorAll('[id]').forEach(e => { if (vistos[e.id]) { if (dup.indexOf(e.id) < 0) dup.push(e.id); } else vistos[e.id] = true; });
    return dup; })();
  return o;
})()
