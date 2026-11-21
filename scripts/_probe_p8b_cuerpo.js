(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  try { EL('login-overlay').style.display = 'none'; } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  function jpegFile(nom, color) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 48;
    const x = c.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, 64, 48);
    const du = c.toDataURL('image/jpeg', 0.9);
    const b = atob(du.split(',')[1]); const u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return new File([u], nom, { type: 'image/jpeg' });
  }
  /* ══ 1.3 · ¿HAY DEDUPLICACION AL REIMPORTAR EL MISMO ARCHIVO? ═══════════════════════════ */
  try { if (typeof showTab === 'function') showTab('imagenes'); } catch (e) {}
  await new Promise(r => setTimeout(r, 120));
  const f = jpegFile('mismo.jpg', '#852');
  await mediosImportar([f], undefined, 'ceibolink');
  const n1 = imgSlots.filter(s => s && s.dataURL).length;
  await mediosImportar([f], undefined, 'ceibolink');
  const n2 = imgSlots.filter(s => s && s.dataURL).length;
  R.dedup_slots = [n1, n2];
  R.dedup_hayDedup = (n2 === n1);
  const dus = imgSlots.filter(s => s && s.dataURL).map(s => s.dataURL);
  R.dedup_dataURLidenticos = (dus.length >= 2 && dus[0] === dus[1]);
  /* ¿existe algún registro de ids ya adjuntados, por imagen? */
  R.dedup_registroIds = {
    _clnkPorConfirmar: (typeof window._clnkPorConfirmar !== 'undefined') ? window._clnkPorConfirmar.length : 'SIN VAR',
    hayListaAdjuntadas: (typeof window._clnkAdjuntadas !== 'undefined'),
    slotLlevaIdDeCeiboLink: imgSlots.filter(s => s && s.clnkId).length
  };

  /* ══ 1.4 · ¿POR QUE EL BORRADO INDIVIDUAL «NO SE CONCRETA»? ═════════════════════════════ */
  /* La hipotesis: igSelEliminar saca el slot del formulario SOLO si `_imgUuidActual === uuid`.
     Con el estudio abierto y SIN uuid puesto, el slot sobrevive y el guardado siguiente lo
     reescribe en la biblioteca. Se mide leyendo el codigo de la condicion y el estado real. */
  R.borr_imgUuidActual = (typeof _imgUuidActual !== 'undefined') ? (_imgUuidActual || null) : 'SIN VAR';
  R.borr_condicionEnCodigo = (typeof igSelEliminar === 'function')
    ? (String(igSelEliminar).indexOf('abierto === uuid') >= 0) : 'SIN FN';
  R.borr_igSelPorIndice = (typeof igSelEliminar === 'function')
    ? (String(igSelEliminar).indexOf('porUuid.get(e.uuid).push(e.idx)') >= 0) : 'SIN FN';

  /* ══ 2.7 · ITEM 5 · DESFASE DE LA VISTA B RESPECTO DE LA A ══════════════════════════════ */
  try {
    /* se abre el visor con la primera fija que haya */
    const v = imgSlots.map((s, i) => (s && s.dataURL) ? i : -1).filter(i => i >= 0)[0];
    if (typeof medFijaToggle === 'function' && !_medFijaOn) medFijaToggle();
    const cel = document.querySelector('#img-grid > div[data-idx="' + v + '"] img');
    if (cel) cel.click();
    await new Promise(r => setTimeout(r, 400));
    R.v27_visorAbierto = !!(EL('cine-ov') && EL('cine-ov').style.display !== 'none');
    if (R.v27_visorAbierto && typeof vistaBAbrir === 'function') {
      vistaBAbrir();
      await new Promise(r => setTimeout(r, 400));
      const pa = EL('cine-panel'), pb = EL('b-cine-panel');
      const ia = EL('cine-recorte'), ib = EL('b-cine-recorte');
      const bx = e => { if (!e) return null; const r = e.getBoundingClientRect();
                        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      R.v27_panelA = bx(pa); R.v27_panelB = bx(pb);
      R.v27_imgA = bx(ia); R.v27_imgB = bx(ib);
      if (R.v27_panelA && R.v27_panelB) {
        R.v27_desfaseTop = R.v27_panelB.y - R.v27_panelA.y;
        R.v27_desfaseAlto = R.v27_panelB.h - R.v27_panelA.h;
        R.v27_bordeDerA = R.v27_panelA.x + R.v27_panelA.w;
        R.v27_bordeDerB = R.v27_panelB.x + R.v27_panelB.w;
      }
      if (R.v27_imgA && R.v27_imgB) {
        R.v27_desfaseImgTop = R.v27_imgB.y - R.v27_imgA.y;
        R.v27_desfaseImgAlto = R.v27_imgB.h - R.v27_imgA.h;
      }
      /* item 3 · strain con dos vistas: ¿el estado es por vista? */
      R.v27_strainPorVista = (typeof _vTodas === 'function' && typeof _vCon === 'function')
        ? _vTodas().map(V => { let t = 'ERR'; try { _vCon(V, () => { t = (typeof _strain === 'undefined') ? 'SIN VAR' : (_strain === null ? 'null' : 'objeto') }) } catch (e) {} return t; })
        : 'SIN HELPERS';
      R.v27_cuantasVistas = (typeof _vTodas === 'function') ? _vTodas().length : 'SIN FN';
      /* item 4 · el icono junto a la X */
      const mx = EL('cine-maxi');
      R.v27_iconoDiagonal = mx ? { title: mx.title, texto: (mx.textContent || '').trim().slice(0, 12),
                                   aria: mx.getAttribute('aria-pressed') } : 'NO EXISTE';
      /* item 1 · + Vista y medir fuera de un estudio guardado */
      const ab = EL('cine-add-b');
      R.v27_addB = ab ? { disabled: !!ab.disabled, title: String(ab.title || '').slice(0, 90) } : 'NO EXISTE';
      const bm = EL('cine-medir');
      R.v27_botonMedir = bm ? { disabled: !!bm.disabled, title: String(bm.title || '').slice(0, 90) } : 'NO EXISTE';
      /* item 2 · ¿existe la casilla «A la app»? */
      R.v27_casillaALaApp = !!document.querySelector('[data-med-alaapp], #med-alaapp') ||
        (document.body.textContent.indexOf('A la app') >= 0);
      /* 2.3 · botones de cuadro anterior/siguiente y tamaños */
      R.v27_botonesBarra = [...document.querySelectorAll('#cine-ov button[id]')].map(b => b.id).slice(0, 40);
    }
  } catch (e) { R.v27_err = String(e && e.message || e).slice(0, 200); }
  /* 2.7 item 7 · la cadencia del sondeo */
  R.v27_sondeoMs = (typeof clnkSondeoMs === 'function') ? clnkSondeoMs() : 'SIN FN';
  R.v27_sondeoSoloSiPanelALaVista = (typeof clnkPanelALaVista === 'function');
  return R;
})()
