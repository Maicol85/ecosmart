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
  const celda = i => document.querySelector('#img-grid > div[data-idx="' + i + '"]');
  const past = i => { const c = celda(i); return c ? c.querySelector('[data-img-pdf]') : null; };

  try { if (typeof showTab === 'function') showTab('imagenes'); } catch (e) {}
  await new Promise(r => setTimeout(r, 150));

  /* ══ 1 · ENTRA A LA BIBLIOTECA Y NO AL PDF ═════════════════════════════════════════════ */
  await mediosImportar([jpegFile('a.jpg', '#c22'), jpegFile('b.jpg', '#2c2')], undefined, 'ceibolink');
  await mediosImportar([jpegFile('c.jpg', '#22c')], undefined, undefined);
  R.bib = imgSlots.filter(s => s && s.dataURL).length;
  R.enPdf = infMinCapturas().length;
  R.noPdfTodas = imgSlots.filter(s => s && s.dataURL).every(s => s.noPdf === true);
  R.cuenta = (EL('img-cuenta') || {}).textContent || '(no)';

  /* ══ 2 · LA PASTILLA ES EL ESTADO Y EL CONTROL ═════════════════════════════════════════ */
  const vivos = imgSlots.map((s, i) => (s && s.dataURL) ? i : -1).filter(i => i >= 0);
  const i0 = vivos[0];
  const p0 = past(i0);
  R.past_existe = !!p0;
  R.past_texto0 = p0 ? (p0.textContent || '').trim() : '(no)';
  R.past_aria0 = p0 ? p0.getAttribute('aria-pressed') : '(no)';
  if (p0) p0.click();
  await new Promise(r => setTimeout(r, 120));
  R.past_enPdfTrasClic = infMinCapturas().length;
  const p1 = past(i0);
  R.past_texto1 = p1 ? (p1.textContent || '').trim() : '(no)';
  R.past_aria1 = p1 ? p1.getAttribute('aria-pressed') : '(no)';
  R.past_bibIntacta = imgSlots.filter(s => s && s.dataURL).length;
  if (p1) p1.click();
  await new Promise(r => setTimeout(r, 120));
  R.past_vuelveAcero = infMinCapturas().length;
  R.past_sigueEnBib = imgSlots.filter(s => s && s.dataURL).length;

  /* ══ 3 · EL BOTON «Fuera del PDF»/«Incluir en el PDF» DE LA CELDA YA NO ESTA ═══════════ */
  R.sinBotonViejo = [].slice.call(document.querySelectorAll('#img-grid button'))
    .filter(b => /Incluir en el PDF/.test(b.textContent || '')).length;
  R.sinCartelFuera = (document.getElementById('img-grid').textContent.indexOf('Fuera del PDF') < 0);

  /* ══ 4 · LA FILA DE MINIATURAS SE VE VACIA Y ES DESTINO ════════════════════════════════ */
  try { if (typeof showTab === 'function') showTab('informe'); } catch (e) {}
  await new Promise(r => setTimeout(r, 200));
  infMinPintar();
  const caja = EL('inf-min-fila');
  R.fila_visibleConPdfVacio = !!(caja && getComputedStyle(caja).display !== 'none');
  R.fila_cont = (EL('inf-min-cont') || {}).textContent || '(no)';
  R.fila_placeholder = !!document.querySelector('#inf-min-lista [data-min-vacio]');
  R.fila_cableada = !!(caja && caja._p8drop);
  /* drop sintetico con el tipo propio */
  if (caja) {
    const dt = new DataTransfer();
    dt.setData('application/x-eco-bib', String(i0));
    caja.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
    caja.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
    await new Promise(r => setTimeout(r, 150));
  }
  R.fila_trasDrop = infMinCapturas().length;
  R.fila_bibTrasDrop = imgSlots.filter(s => s && s.dataURL).length;
  /* CONTROL NEGATIVO: un drop SIN el tipo propio no tiene que incluir nada */
  const antesNeg = infMinCapturas().length;
  if (caja) {
    const dt2 = new DataTransfer();
    dt2.setData('text/plain', String(vivos[1]));
    caja.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt2 }));
    await new Promise(r => setTimeout(r, 120));
  }
  R.fila_controlNegativo = (infMinCapturas().length === antesNeg);

  /* ══ 5 · LOS DOS BOTONES DE LOTE ═══════════════════════════════════════════════════════ */
  try { if (typeof showTab === 'function') showTab('imagenes'); } catch (e) {}
  await new Promise(r => setTimeout(r, 150));
  R.lote_botones = [!!EL('img-pdf-todas'), !!EL('img-pdf-ninguna')];
  imgPdfTodas(true);
  R.lote_todas = infMinCapturas().length;
  imgPdfTodas(false);
  R.lote_ninguna = infMinCapturas().length;
  R.lote_bibIntacta = imgSlots.filter(s => s && s.dataURL).length;

  /* ══ 6 · LA ✕ ROJA PREGUNTA, Y LA PASTILLA NO ═══════════════════════════════════════════ */
  const oc = window.confirm; let preguntas = 0;
  window.confirm = function (t) { preguntas++; R.conf_texto = String(t).slice(0, 220); return false; };
  const cel = celda(i0);
  const eq = cel ? cel.querySelector('button[title="Eliminar"]') : null;
  R.eq_existeConTitle = !!eq;
  if (eq) eq.click();
  await new Promise(r => setTimeout(r, 120));
  R.eq_preguntoYnoBorro = (preguntas === 1) && (imgSlots.filter(s => s && s.dataURL).length === R.lote_bibIntacta);
  window.confirm = function () { return true; };
  if (eq) eq.click();
  await new Promise(r => setTimeout(r, 120));
  R.eq_conSiBorra = imgSlots.filter(s => s && s.dataURL).length;
  window.confirm = oc;

  /* ══ 7 · UN ESQUEMA ENTRA INCLUIDO (gesto explicito) ═══════════════════════════════════ */
  try {
    const n0 = infMinEsquemas().length;
    const du = (function () { const c = document.createElement('canvas'); c.width = 20; c.height = 20;
      c.getContext('2d').fillRect(0, 0, 20, 20); return c.toDataURL('image/png'); })();
    esqIncluirEnPDFImg('p8test', 'Esquema de prueba', du);
    R.esq_entraIncluido = (infMinEsquemas().length === n0 + 1);
    R.esq_noPdf = (function () { const i = imgSlots.findIndex(s => s && s.esqClave === 'p8test');
      return i >= 0 ? !!imgSlots[i].noPdf : 'NO ESTA'; })();
  } catch (e) { R.esq_err = String(e && e.message || e).slice(0, 140); }

  /* ══ 8 · UN ESTUDIO VIEJO SE REIMPRIME IDENTICO (sin la marca en disco) ════════════════ */
  try {
    const uuid = 'p8-viejo-0000-0000-0000-00000000000a';
    const du = imgSlots.filter(s => s && s.dataURL)[0];
    await CeiboImg.guardar(uuid, [{ dataURL: du ? du.dataURL : '', ampliada: false, calidad: 'media' }]);
    imgVaciar();
    await imgRestaurar(uuid);
    R.viejo_slots = imgSlots.filter(s => s && s.dataURL).length;
    R.viejo_enPdf = infMinCapturas().length;
    R.viejo_sinMarca = imgSlots.filter(s => s && s.dataURL).every(s => !s.noPdf);
  } catch (e) { R.viejo_err = String(e && e.message || e).slice(0, 160); }
  return R;
})()
