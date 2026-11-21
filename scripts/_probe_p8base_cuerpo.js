(async () => {
  const R = {};
  const EL = id => document.getElementById(id);
  try { EL('login-overlay').style.display = 'none'; } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}

  /* ── Imagen sintetica: un JPEG de verdad, hecho con un canvas. Sin un solo dato de paciente. */
  function jpegFile(nom, color) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 48;
    const x = c.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, 64, 48);
    x.fillStyle = '#000'; x.fillRect(4, 4, 20, 10);
    const du = c.toDataURL('image/jpeg', 0.9);
    const b = atob(du.split(',')[1]); const u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return new File([u], nom, { type: 'image/jpeg' });
  }

  /* ══ A · LA ENTRADA ════════════════════════════════════════════════════════════════════ */
  try { if (typeof showTab === 'function') showTab('imagenes'); } catch (e) {}
  await new Promise(r => setTimeout(r, 120));
  R.A_slotsAntes = imgSlots.filter(s => s && s.dataURL).length;
  let r1 = null;
  try { r1 = await mediosImportar([jpegFile('a.jpg', '#c22'), jpegFile('b.jpg', '#2c2')], undefined, 'ceibolink'); }
  catch (e) { R.A_err = String(e && e.message || e).slice(0, 120); }
  R.A_veredicto = r1 ? { n: r1.n, ok: r1.ok } : null;
  R.A_slotsDespues = imgSlots.filter(s => s && s.dataURL).length;
  R.A_enPdf = (typeof infMinCapturas === 'function') ? infMinCapturas().length : 'SIN FN';
  R.A_origenMarcado = imgSlots.filter(s => s && s.origen === 'ceibolink').length;
  /* el mismo lote por la puerta del pendrive (sin origen) */
  let r2 = null;
  try { r2 = await mediosImportar([jpegFile('c.jpg', '#22c')], undefined, undefined); } catch (e) {}
  R.A_pendriveSlots = imgSlots.filter(s => s && s.dataURL).length;
  R.A_pendriveEnPdf = infMinCapturas().length;
  R.A_pendriveOrigen = imgSlots.filter(s => s && s.dataURL).map(s => s.origen || '(sin)');

  /* ══ B · QUITAR UNA MINIATURA DEL INFORME ══════════════════════════════════════════════ */
  const caps = infMinCapturas();
  R.B_caps = caps.length;
  if (caps.length) {
    const i0 = caps[0].i;
    infMinQuitarCaptura(i0);
    R.B_noPdf = !!imgSlots[i0].noPdf;
    R.B_capsDespues = infMinCapturas().length;
    const cel = document.querySelector('#img-grid > div[data-idx="' + i0 + '"]');
    R.B_celdaTexto = cel ? (cel.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160) : 'SIN CELDA';
    R.B_celdaDiceFuera = !!(cel && cel.textContent.indexOf('Fuera del PDF') >= 0);
    R.B_botonReincluir = !!(cel && cel.querySelector('button[onclick*="infMinReincluir"]'));
    /* se vuelve a incluir para no dejar la escena sucia */
    infMinReincluir(i0);
    R.B_vuelve = infMinCapturas().length;
  }

  /* ══ C · BORRAR DE LA GRILLA Y GUARDAR → ¿SE VA DE LA BIBLIOTECA? ═══════════════════════ */
  R.C_guardadoActivo = (typeof imgGuardadoActivo === 'function') ? imgGuardadoActivo() : 'SIN FN';
  const uuid = 'p8-prueba-0000-0000-0000-000000000001';
  try {
    window._imgUuidActual = uuid;
    const ok1 = await imgPersistir(uuid);
    const bib1 = await CeiboImg.leer(uuid);
    R.C_escritas = Array.isArray(bib1) ? bib1.length : String(bib1);
    /* borrar UNA de la grilla */
    const vivos = imgSlots.map((s, i) => (s && s.dataURL) ? i : -1).filter(i => i >= 0);
    imgRemove(null, vivos[0]);
    R.C_slotsTrasBorrar = imgSlots.filter(s => s && s.dataURL).length;
    await imgPersistir(uuid);
    const bib2 = await CeiboImg.leer(uuid);
    R.C_bibliotecaTrasBorrar = Array.isArray(bib2) ? bib2.length : String(bib2);
    R.C_borrarGrillaBorraBiblioteca = (Array.isArray(bib1) && Array.isArray(bib2)) ? (bib2.length < bib1.length) : 'NO MEDIBLE';
    /* y una QUITADA del PDF (noPdf): ¿sobrevive en la biblioteca? */
    const v2 = imgSlots.map((s, i) => (s && s.dataURL) ? i : -1).filter(i => i >= 0);
    if (v2.length) {
      infMinQuitarCaptura(v2[0]);
      await imgPersistir(uuid);
      const bib3 = await CeiboImg.leer(uuid);
      R.C_bibliotecaTrasQuitarDelPdf = Array.isArray(bib3) ? bib3.length : String(bib3);
      R.C_noPdfPersistido = Array.isArray(bib3) ? bib3.filter(s => s && s.noPdf).length : 'NO';
    }
  } catch (e) { R.C_err = String(e && e.message || e).slice(0, 200); }

  /* ══ D · 1.5 · GUARDAR SIN DOCUMENTO ═══════════════════════════════════════════════════ */
  try {
    R.D_predicado = (typeof clnkEstudioTieneImagenes === 'function') ? clnkEstudioTieneImagenes() : 'SIN FN';
    R.D_irATabPaciente = (typeof irATabPaciente === 'function');
    const n = EL('nombre'), ci = EL('ci');
    if (n) n.value = 'Prueba Sintetica';
    if (ci) ci.value = '';
    /* se cuenta el toast interceptando la funcion */
    const toasts = [];
    const orig = window.toast;
    window.toast = function (t) { toasts.push(String(t).slice(0, 140)); if (orig) try { orig.apply(this, arguments) } catch (e) {} };
    let rv = 'NO CORRIO';
    try { rv = guardarInforme(); } catch (e) { rv = 'LANZO: ' + String(e && e.message || e).slice(0, 80); }
    window.toast = orig;
    R.D_guardarDevolvio = rv;
    R.D_toasts = toasts;
  } catch (e) { R.D_err = String(e && e.message || e).slice(0, 200); }

  /* ══ E · 1.6 · MEDIR DESDE LA GRILLA ═══════════════════════════════════════════════════ */
  R.E_medFijaOn = (typeof _medFijaOn !== 'undefined') ? _medFijaOn : 'SIN VAR';
  R.E_botonMedir = !!EL('med-fija-btn');
  R.E_visorAntes = !!(EL('cine-ov') && EL('cine-ov').style.display !== 'none');
  try {
    const v = imgSlots.map((s, i) => (s && s.dataURL) ? i : -1).filter(i => i >= 0)[0];
    const cel = document.querySelector('#img-grid > div[data-idx="' + v + '"] img');
    if (cel) cel.click();
    await new Promise(r => setTimeout(r, 160));
    R.E_visorTrasClicSinModo = !!(EL('cine-ov') && EL('cine-ov').style.display !== 'none');
  } catch (e) { R.E_err = String(e && e.message || e).slice(0, 120); }

  /* ══ F · 1.4 · SELECCION MULTIPLE ══════════════════════════════════════════════════════ */
  R.F_galeriaModoElegir = (typeof window.igSelEliminar === 'function');
  R.F_galeriaMarcarTodas = (typeof window.igSelTodas === 'function') || (typeof window.igSelMarcarTodas === 'function');
  R.F_bandejaBorrarUna = (typeof window.clnkbBorrarUna === 'function');
  R.F_bandejaBorrarVarias = (typeof window.clnkbBorrarVarias === 'function');
  R.F_estudiosBorrarVarios = (typeof window.igEstSelEliminar === 'function');

  /* ══ G · inventario de funciones que la Parte 1 va a tocar ═════════════════════════════ */
  R.G = {};
  ['imgRender','imgPersistir','imgRestaurar','infMinPintar','infMinQuitarCaptura','infMinReincluir',
   'imgRemove','mediosImportar','dstAlActual','dstAGuardado','dstABandeja','dstPreguntar',
   'clnkConfirmarPersistidas','clnkDescartar','imgDesdeGuardadas','igSelAlAbierto','medFijaToggle']
   .forEach(f => { R.G[f] = (typeof window[f] === 'function'); });

  return R;
})()
