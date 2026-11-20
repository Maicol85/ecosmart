/* Cuerpo de _probe_p6base.mjs. VIVE APARTE a proposito: el cuerpo de una sonda es una CADENA
   que se evalua en el navegador, y escribirlo dentro de un template literal del .mjs hace que
   cualquier acento grave de un comentario cierre la cadena. Es la leccion de MEDIR-4b. */
(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = {};
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display = 'none';
  window.__clnkBaseTest = window.__P6_BASE;
  const toasts = [];
  window.toast = function (t) { toasts.push(String(t)); };
  window.alert = function () {}; window.confirm = function () { return true; };
  const CTRL = async b => {
    const r = await fetch(window.__P6_BASE + '/_control',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    return r.json();
  };
  try { localStorage.setItem('ett_view_mode', 'avanzado'); if (typeof applyViewMode === 'function') applyViewMode(); } catch (e) {}
  try { localStorage.removeItem('ett_ceibolink_token'); clnkToggle(true); } catch (e) {}
  await CTRL({ reset: true, equipos: 1, escena: 'unEnvio' });
  showTab('config'); if (window.cfgOnShow) cfgOnShow();
  await esp(900);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = window.__P6_COD; cod.dispatchEvent(new Event('input', { bubbles: true })); await clnkVincular(); }
  await esp(1500);
  o.vinculado = clnkVinculado();
  if (!o.vinculado) { o.err = 'no se pudo vincular con el conector falso'; return o; }

  const tit = () => { const t = document.getElementById('clnkav-title'); return t ? t.textContent : ''; };
  const txt = () => { const t = document.getElementById('clnkav-txt'); return t ? t.textContent : ''; };
  const abierto = () => { const v = document.getElementById('clnkav-ov'); return !!(v && v.style.display !== 'none'); };
  const chips = () => {
    const n = document.getElementById('cfg-clnk-nums');
    return n ? n.textContent.replace(/\s+/g, ' ').trim() : '';
  };

  /* ══ (1) LA CAUSA DEL PUNTO D ═════════════════════════════════════════════════════════════
     Se reproduce el gesto del medico: llega un envio, se avisa, se DESCARTA, el ecografo manda
     EXACTAMENTE LAS MISMAS (los mismos ids, que es lo que la hipotesis dice), y se sondea. */
  o.d = {};
  await _clnkSondear(true);
  await esp(1200);
  o.d.primerAviso = { abierto: abierto(), titulo: tit(), texto: txt().slice(0, 120) };
  o.d.avisadasTrasPrimer = Object.keys(window._clnkAvisadas || {}).length;

  /* Descartar: borra en el conector. El confirm esta sustituido arriba y devuelve true. */
  await clnkDescartar(['img_a1', 'img_a2', 'img_a3']);
  await esp(1200);
  const e1 = await CTRL({});
  o.d.borradasEnPuente = e1.escenario.borradas.slice();
  o.d.pendientesTrasDescartar = e1.escenario.imagenes_pendientes;
  o.d.chipsTrasDescartar = chips();
  o.d.avisadasTrasDescartar = Object.keys(window._clnkAvisadas || {}).length;

  /* El ecografo vuelve a mandar LAS MISMAS: los mismos ids. */
  const e2 = await CTRL({ escena: 'unEnvio' });
  o.d.pendientesTrasReenvio = e2.escenario.imagenes_pendientes;
  await _clnkSondear(true);
  await esp(1500);
  o.d.trasReenvio = { abierto: abierto(), titulo: tit(), texto: txt().slice(0, 120) };
  o.d.chipsTrasReenvio = chips();
  o.d.panelALaVista = clnkPanelALaVista();

  /* EL CONTROL de la hipotesis: se vacia la lista en memoria y se vuelve a sondear SIN tocar
     nada mas. Si el aviso vuelve, la causa es esa lista y ninguna otra cosa. */
  try { Object.keys(window._clnkAvisadas).forEach(k => { delete window._clnkAvisadas[k]; }); } catch (e) {}
  o.d.avisadasTrasVaciar = Object.keys(window._clnkAvisadas || {}).length;
  await _clnkSondear(true);
  await esp(1500);
  o.d.trasVaciarLaLista = { abierto: abierto(), titulo: tit(), texto: txt().slice(0, 120) };
  clnkAvisoCerrar();

  /* CONTROL POSITIVO: con ids NUEVOS el aviso sale igual sin tocar nada. */
  await CTRL({ escena: 'masNuevas' });
  await _clnkSondear(true);
  await esp(1500);
  o.d.idsNuevos = { abierto: abierto(), titulo: tit() };
  clnkAvisoCerrar();

  /* ══ (2) ¿EL SONDEO PONE AL DIA LA TARJETA? ═══════════════════════════════════════════════
     Con el panel A LA VISTA, se leen los chips, entran imagenes nuevas, se sondea, y se vuelven
     a leer. Si no cambian, el sondeo no refresca la tarjeta. */
  o.tarjeta = {};
  await CTRL({ escena: 'vacio' });
  clnkLeerEstado(); await esp(1200);
  o.tarjeta.conListaVacia = chips();
  await CTRL({ escena: 'previaOcho' });
  await _clnkSondear(true);
  await esp(1600);
  o.tarjeta.trasSondeoConOcho = chips();
  clnkAvisoCerrar();
  clnkLeerEstado(); await esp(1200);
  o.tarjeta.trasLeerEstadoAMano = chips();

  /* ══ (3) ¿QUE HACE `dstLeer` CON UN JPG, UN PNG Y UN MP4? ═════════════════════════════════
     Es la mitad del punto E que NO hace falta arreglar si ya funciona. Se arman los bytes a
     mano —cabeceras reales, sin un dato de nadie— y se le dan a la MISMA funcion que usan los
     tres sumideros. Tambien se le pasa cada uno a `_dcmImgLeer`, que es la que el visor y la
     vista previa llaman SIN preguntar: ahi tiene que salir el mensaje que el medico vio. */
  o.formatos = {};
  const jpgBytes = (() => {
    const c = document.createElement('canvas'); c.width = 8; c.height = 8;
    const g = c.getContext('2d'); g.fillStyle = '#4080c0'; g.fillRect(0, 0, 8, 8);
    const du = c.toDataURL('image/jpeg', 0.8);
    const b = atob(du.split(',')[1]); const u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  })();
  const pngBytes = (() => {
    const c = document.createElement('canvas'); c.width = 8; c.height = 8;
    const g = c.getContext('2d'); g.fillStyle = '#c04040'; g.fillRect(0, 0, 8, 8);
    const du = c.toDataURL('image/png');
    const b = atob(du.split(',')[1]); const u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  })();
  /* Un ISO-BMFF minimo: la caja `ftyp` con la marca que `_firmaArchivo` mide. */
  const mp4Bytes = (() => {
    const u = new Uint8Array(32);
    u[3] = 24;
    'ftyp'.split('').forEach((ch, i) => { u[4 + i] = ch.charCodeAt(0); });
    'isom'.split('').forEach((ch, i) => { u[8 + i] = ch.charCodeAt(0); });
    return u;
  })();
  const txtBytes = new TextEncoder().encode('INFORME\nsin un dato de nadie\n');
  const pruebas = [['jpg', jpgBytes], ['png', pngBytes], ['mp4', mp4Bytes], ['txt', txtBytes]];
  for (const par of pruebas) {
    const nm = par[0], by = par[1];
    const r = { bytes: by.length };
    try { r.firma = _firmaArchivo(by.subarray(0, Math.min(132, by.length))); } catch (e) { r.firma = 'ERR ' + e.message; }
    /* `_clnkArchivo` es la que CeiboLink usa para envolver lo que baja, y hoy escribe
       `.dcm` y `application/dicom` en todo. */
    const f = _clnkArchivo(by, 'img_prueba.dcm');
    try {
      const d = await dstLeer(f, { origen: 'ceibolink' });
      r.clase = d.clase || null;
      r.rechazo = d.rechazo ? String(d.rechazo).slice(0, 110) : null;
    } catch (e) { r.dstLeerLanzo = String(e && e.message || e).slice(0, 110); }
    /* Y lo que hace la funcion que la vista previa y el visor llaman SIN preguntar. */
    try {
      const dd = _dcmImgLeer(by.buffer.slice(by.byteOffset, by.byteOffset + by.length));
      r.dcmImgLeer = dd ? 'devolvio objeto' : 'devolvio null';
    } catch (e) { r.dcmImgLeer = 'LANZO: ' + String(e && e.message || e).slice(0, 90); }
    o.formatos[nm] = r;
  }

  /* ══ (4) LO QUE EL CONTRATO 1.4 MANDA Y EL FALSO TODAVIA NO ═══════════════════════════════ */
  const st = await (await fetch(window.__P6_BASE + '/v1/estado')).json();
  o.estadoFalso = { version: st.version, campos: Object.keys(st).sort().join(','),
                    tieneTanda: ('tanda_abierta' in st), tieneAviso: ('bytes_aviso' in st),
                    bytes_tope: st.bytes_tope };
  const tk = localStorage.getItem('ett_ceibolink_token') || '';
  const imgs = await (await fetch(window.__P6_BASE + '/v1/imagenes',
    { headers: { Authorization: 'Bearer ' + tk } })).json();
  o.imagenesFalso = { claves: Object.keys(imgs).sort().join(','),
                      camposDeUna: imgs.imagenes && imgs.imagenes[0] ? Object.keys(imgs.imagenes[0]).sort().join(',') : '' };
  const eqs = await (await fetch(window.__P6_BASE + '/v1/equipos',
    { headers: { Authorization: 'Bearer ' + tk } })).json();
  o.equiposFalso = { camposDeUno: eqs.equipos && eqs.equipos[0] ? Object.keys(eqs.equipos[0]).sort().join(',') : '' };
  const cx = await (await fetch(window.__P6_BASE + '/v1/conexion',
    { headers: { Authorization: 'Bearer ' + tk } })).json();
  o.conexionFalso = { claves: Object.keys(cx).sort().join(','),
                      camposDeUna: cx.direcciones && cx.direcciones[0] ? Object.keys(cx.direcciones[0]).sort().join(',') : '' };

  /* ══ (5) LO QUE LA APP TIENE HOY, CENSADO ════════════════════════════════════════════════ */
  o.censo = {
    ventanaPropia: (typeof CLNK_VENTANA_MS !== 'undefined') ? CLNK_VENTANA_MS : 'no existe',
    sondeoMs: (typeof CLNK_SONDEO_MS !== 'undefined') ? CLNK_SONDEO_MS : 'no existe',
    espAmbar: (typeof CLNK_ESP_AMBAR !== 'undefined') ? CLNK_ESP_AMBAR : 'no existe',
    hayBurbuja: !!document.querySelector('[id^="clnkbur"]'),
    tipoCuentaSoloDos: String(typeof dstCuenta === 'function' ? dstCuenta(4, 3, 1) : ''),
    avisoZ: (() => { const v = document.getElementById('clnkav-ov'); return v ? getComputedStyle(v).zIndex : ''; })()
  };
  o.toasts = toasts.slice(-8);
  return o;
})()
