/* Cuerpo de _probe_p13_t2.mjs — TAREA 2 de la tanda P13. Corre DENTRO del navegador.
 * Archivo aparte por la leccion de los acentos graves.
 *
 *   T2a  una captura cae en la seccion de IMAGENES FIJAS y no entre los cineloops
 *   T2b  el tamanio de las miniaturas de la biblioteca
 *   T2c  «Guardar en biblioteca» de una tabla de medidas genera UN solo elemento
 *   T1j  cerrar y reabrir el MISMO cineloop no pierde lo medido; otro SI lo suelta
 */
(async () => {
  const o = { err: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) }; };

  const jpgMin = new Uint8Array([255,216,255,217]);
  const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 };
  /* Un JPEG de verdad, porque una captura pasa por el decodificador: cuatro bytes no se
     decodifican y la medicion saldria sobre una imagen vacia. */
  const jpgReal = await (async () => {
    try {
      const c = document.createElement('canvas'); c.width = 48; c.height = 36;
      const g = c.getContext('2d');
      for (let y = 0; y < 36; y++) for (let x = 0; x < 48; x++) {
        g.fillStyle = 'rgb(' + ((x * 5) % 256) + ',' + ((y * 7) % 256) + ',120)';
        g.fillRect(x, y, 1, 1);
      }
      const b = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
      return new Uint8Array(await b.arrayBuffer());
    } catch (e) { return jpgMin; }
  })();
  const mk = (n, fr) => ({ nombre:n, cuadros:(fr||[jpgReal,jpgReal]).length,
    d:{ frags:(fr||[jpgReal,jpgReal]), cols:48, filas:36, msCuadro:40, regiones:[R2D] } });

  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}
  try { localStorage.setItem('cfg-guardar-imagenes', '1'); } catch (e) {}

  /* ── Un estudio GUARDADO: sin uuid la captura no puede ir al disco del estudio y cae en un
     slot, o sea que la tira no se ejercita y la medicion no dice nada (denominador vacio). ── */
  try {
    const set = (id, v) => { const e = $(id); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles:true })); } };
    set('nombre', 'PRUEBA P13');
    set('documento', '0000001');
    /* ⚠️ `__t` NO EXISTE EN ESTA SONDA: ese arnes lo inyecta el runner de la bateria, no la
       pagina. La primera corrida salio con `uuid:false` y la tira sin ninguna fija en disco, o
       sea midiendo sobre un denominador vacio. Se guarda por la funcion REAL. */
    await new Promise(res => { try { guardarInforme(() => res(1)); setTimeout(() => res(0), 2500); }
      catch (e) { res(0); } });
  } catch (e) { o.err.push('guardar: ' + e.message); }
  await esp(500);
  o.uuid = (typeof _imgUuidActual !== 'undefined') ? !!_imgUuidActual : 'n/d';

  /* ── T2a: se abre un cineloop y se captura un cuadro ── */
  try { _cineAbrir([mk('P13-T2-cine', [jpgReal, jpgReal, jpgReal])]); } catch (e) { o.err.push('abrir: ' + e.message); }
  await esp(500);
  try { await _cineEncolar(_vistaA.datos.loops[0]); } catch (e) {}
  try { if (typeof cineCapturar === 'function') await cineCapturar(); } catch (e) { o.err.push('capturar: ' + e.message); }
  await esp(900);
  try { if (typeof cineStripRender === 'function') await cineStripRender(); } catch (e) {}
  await esp(700);

  o.T2a = (function () {
    try {
      const strip = $('cine-strip');
      if (!strip) return 'no hay tira';
      const txt = (strip.textContent || '').replace(/\s+/g, ' ');
      const rots = Array.prototype.map.call(strip.querySelectorAll('div'), d => (d.textContent || '').trim())
        .filter(t => t === 'Imágenes fijas' || t === 'Cineloops');
      /* De que grupo es cada ficha: se mira el orden de los rotulos y de las grillas. */
      const grupos = [];
      Array.prototype.forEach.call(strip.children, ch => {
        const t = (ch.textContent || '').trim();
        if (t === 'Imágenes fijas' || t === 'Cineloops') { grupos.push({ rot:t, fichas:null }); return; }
        if (grupos.length && grupos[grupos.length - 1].fichas == null &&
            ch.querySelectorAll('[data-strip-i],[data-cine-id]').length) {
          grupos[grupos.length - 1].fichas = ch.querySelectorAll('[data-strip-i],[data-cine-id]').length;
        }
      });
      return { rotulos: rots, grupos: grupos,
        diceFijas: txt.indexOf('Imágenes fijas') >= 0, diceCines: txt.indexOf('Cineloops') >= 0,
        nFichas: strip.querySelectorAll('[data-strip-i],[data-cine-id]').length,
        slots: (typeof imgSlots !== 'undefined') ? imgSlots.filter(x => x && x.dataURL).length : 'n/d' };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── T2b: el tamanio de la celda y de la miniatura de la biblioteca ──────────────────────
     ⚠️ LA PESTANIA TIENE QUE ESTAR ABIERTA: lo que esta en `display:none` no tiene geometria, y
     una celda de 0x0 se lee igual que «la miniatura no se dibuja». Es la regla fija de esta casa.
     Se cierra el visor primero, que tapa la pagina entera. */
  try { cineCerrar(); } catch (e) {}
  await esp(260);
  try { showTab('imagenes'); } catch (e) { try { showTab('img'); } catch (x) {} }
  await esp(420);
  o.T2b = (function () {
    try {
      const g = $('img-grid');
      if (!g) return 'no hay grilla';
      const cs = getComputedStyle(g);
      const cel = g.querySelector('div[data-idx]');
      const im = cel ? cel.querySelector('img') : null;
      return { cols: cs.gridTemplateColumns.split(' ').length, plantilla: cs.gridTemplateColumns.slice(0, 80),
        celda: caja(cel), img: caja(im),
        imgMaxH: im ? getComputedStyle(im).maxHeight : null,
        celdaMinH: cel ? getComputedStyle(cel).minHeight : null };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── T2c: «Guardar en biblioteca» de una tabla de medidas ── */
  o.T2c = await (async () => {
    try {
      const antes = await CeiboCine.listar(_imgUuidActual);
      const docsAntes = (antes || []).filter(r => r && r.tipo === 'doc').length;
      /* Se siembra una medicion 2D y se guarda la tabla por el camino del boton. */
      _vCon(_vistaA, () => { try { if (!_medOn) medToggle(); d2Modo('vi'); _d2Poner('vi.sivd', 9.1); _d2Render(); } catch (e) {} });
      await esp(260);
      const b = document.querySelector('[data-d2-acc="guardar"]') || document.querySelector('[data-dop-acc="guardar"]');
      if (!b) return { nota: 'no hay boton de guardar tabla', docsAntes: docsAntes };
      b.click();
      await esp(1200);
      const desp = await CeiboCine.listar(_imgUuidActual);
      const docs = (desp || []).filter(r => r && r.tipo === 'doc');
      try { if (typeof cineStripRender === 'function') await cineStripRender(); } catch (e) {}
      await esp(600);
      const strip = $('cine-strip');
      const enTira = strip ? strip.querySelectorAll('[data-cine-id]').length : 'n/d';
      const slots = (typeof imgSlots !== 'undefined') ? imgSlots.filter(x => x && x._docId).length : 'n/d';
      return { docsAntes: docsAntes, docsDespues: docs.length, nuevos: docs.length - docsAntes,
        fichasEnTira: enTira, slotsConDoc: slots };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── T1j: el MISMO cineloop conserva lo medido; otro lo suelta ── */
  o.T1j = (function () {
    try {
      /* El loop se arma aca y no se lee de la vista: para este punto el visor ya se cerro y
         `cineCerrar` SUELTA `datos` —son los 17 MB del archivo—, asi que no hay de donde leerlo. */
      const L = mk('P13-T1j', [jpgReal, jpgReal]);
      _cineAbrir([L]);
      _d2Poner('vi.sivd', 9.1);
      const antes = _d2Valor('vi.sivd');
      cineCerrar();
      _cineAbrir([L]);
      const mismoObj = _d2Valor('vi.sivd');
      /* Y con otro OBJETO que es el MISMO archivo: la identidad es por contenido, no por
         referencia, que es lo que `_cineClave` promete. */
      _d2Poner('vi.sivd', 9.1);
      _cineAbrir([mk('P13-T1j', [jpgReal, jpgReal])]);
      const mismoClave = _d2Valor('vi.sivd');
      /* Otro video, por la puerta de la BIBLIOTECA: la tabla se vacia. */
      _d2Poner('vi.sivd', 9.1);
      _cineAbrir([mk('P13-T1j-otro', [jpgReal])], 'bib');
      const otroBib = _d2Valor('vi.sivd');
      /* Y otro video por la puerta de la IMPORTACION, que la orden no nombra: acumula, que es
         la conducta declarada de la que depende la continuidad. Es el CONTROL NEGATIVO. */
      _d2Poner('vi.sivd', 9.1);
      _cineAbrir([mk('P13-T1j-otro2', [jpgReal, jpgReal, jpgReal])]);
      const otroImport = _d2Valor('vi.sivd');
      return { antes: antes, trasReabrirElMismoObjeto: mismoObj,
               trasReabrirOtroObjetoDelMismoArchivo: mismoClave,
               trasAbrirOtroDesdeLaBiblioteca: otroBib,
               CONTROL_trasImportarOtro: otroImport };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  return o;
})()
