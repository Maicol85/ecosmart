/* Cuerpo de _probe_p13_t4.mjs — TAREA 4 de la tanda P13 (el circulo rojo/verde).
 * Archivo aparte por la leccion de los acentos graves.
 *
 *   T4a  al abrir el visor la fila muestra lo que ya esta en la app, con circulo VERDE
 *   T4b  al re-medir, el numero nuevo en ROJO con «en la app: 20», y recien el circulo pregunta
 *   T4c  tocar el verde lo pasa a rojo y BORRA el campo de la app
 *   T4d  si el campo de la app cambia a mano, el circulo pasa a rojo
 *   T4e  medir NO escribe en la app por si solo
 *   T4f  los dos botones «usar como Ø TSVI / Ø TSVD» no existen
 */
(async () => {
  const o = { err: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);

  const jpg = new Uint8Array([255,216,255,217]);
  const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 };
  const mk = n => ({ nombre:n, cuadros:3, d:{ frags:[jpg,jpg,jpg], cols:1016, filas:708,
    msCuadro:40, regiones:[R2D] } });

  const campoApp = id => { const e = $(id); return e ? String(e.value) : 'NO EXISTE'; };
  const sembrar = (id, v) => { try { const e = $(id); if (!e) return 'no existe';
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true })); return 'ok'; } catch (x) { return 'ERR'; } };
  /* El censo de TODOS los controles con id del formulario: es como se prueba que medir no
     escribe nada por si solo (punto e). */
  const censo = () => { try { return Array.prototype.map.call(
      document.querySelectorAll('input[id], select[id], textarea[id]'),
      e => e.id + '=' + String(e.value)).join('|'); } catch (x) { return 'ERR'; } };
  const circ = campo => { try {
      const b = document.querySelector('[data-med-circ="' + campo + '"]');
      if (!b) return 'sin circulo';
      const sp = b.querySelector('span');
      return { pressed: b.getAttribute('aria-pressed'),
               color: sp ? getComputedStyle(sp).backgroundColor : null,
               tip: (b.getAttribute('title') || '').slice(0, 80) };
    } catch (x) { return 'ERR ' + x.message; } };
  const fila = campo => { try {
      const b = document.querySelector('[data-med-circ="' + campo + '"]');
      const tr = b ? b.closest('tr') : null;
      return tr ? (tr.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90) : null;
    } catch (x) { return 'ERR'; } };

  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}

  /* ── (g) y (a): los diametros se cargan A MANO en la app ANTES de abrir el visor ── */
  o.siembra = { diam_tsvi: sembrar('diam_tsvi', '20'), tsvd_diametro: sembrar('tsvd_diametro', '25') };
  await esp(360);
  o.appAntes = { diam_tsvi: campoApp('diam_tsvi'), tsvd_diametro: campoApp('tsvd_diametro') };

  try { _cineAbrir([mk('P13-T4')]); } catch (e) { o.err.push('abrir: ' + e.message); return o; }
  await esp(560);
  try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) {}
  await esp(360);
  try { _vCon(_vistaA, () => { d2Modo('ao'); }); } catch (e) { o.err.push('d2Modo: ' + e.message); }
  await esp(320);

  o.T4a = { d2Valor_tsvi: (typeof _d2Valor === 'function') ? _d2Valor('vi.tsvi') : 'n/d',
            circulo: circ('vi.tsvi'), fila: fila('vi.tsvi'),
            cebados: (typeof _medCebarDesdeApp === 'function') ? 'si existe' : 'NO EXISTE' };

  /* ── (e) + (b): se MIDE 22 sobre la misma fila y la app NO se toca ── */
  const censoAntes = censo();
  try { _vCon(_vistaA, () => { d2Armar('vi.tsvi'); _d2Capturar(22); }); } catch (e) { o.err.push('medir: ' + e.message); }
  await esp(420);
  o.T4e = { censoIgual: censo() === censoAntes, appTrasMedir: campoApp('diam_tsvi') };
  o.T4b = { d2Valor: _d2Valor('vi.tsvi'), circulo: circ('vi.tsvi'), fila: fila('vi.tsvi'),
            diceEnLaApp: (fila('vi.tsvi') || '').indexOf('en la app: 20') >= 0 };

  /* ── (b) la segunda mitad: tocar el circulo PREGUNTA y recien ahi escribe ── */
  o.T4bPregunta = await (async () => {
    try {
      const p = medCircTocar('vi.tsvi');
      await esp(300);
      const ov = document.querySelector('[data-preg-prop], [role="dialog"][data-borr-conf], #preg-prop-ov');
      const cualquier = Array.prototype.filter.call(document.querySelectorAll('div'),
        d => { try { const cs = getComputedStyle(d);
          return cs.position === 'fixed' && cs.display !== 'none' &&
                 (d.textContent || '').indexOf('ustituir') >= 0; } catch (x) { return false; } });
      const cartel = cualquier[0] || null;
      const txt = cartel ? (cartel.textContent || '').replace(/\s+/g, ' ').slice(0, 160) : null;
      const appDurante = campoApp('diam_tsvi');
      /* Se contesta SI, por el boton del cartel. */
      let apretado = false;
      if (cartel) {
        const bs = Array.prototype.slice.call(cartel.querySelectorAll('button'));
        const si = bs.filter(b => (b.textContent || '').indexOf('sustituir') >= 0)[0];
        if (si) { si.click(); apretado = true; }
      }
      await esp(420);
      try { await p; } catch (x) {}
      await esp(260);
      return { huboCartel: !!cartel, texto: txt, appMientrasPreguntaba: appDurante,
               apretado: apretado, appDespues: campoApp('diam_tsvi'),
               circulo: circ('vi.tsvi') };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── (c) tocar el VERDE lo pasa a rojo y borra el campo de la app ── */
  o.T4c = await (async () => {
    try {
      const antes = campoApp('diam_tsvi');
      const cAntes = circ('vi.tsvi');
      await medCircTocar('vi.tsvi');
      await esp(420);
      return { appAntes: antes, circuloAntes: cAntes, appDespues: campoApp('diam_tsvi'),
               d2SigueConValor: _d2Valor('vi.tsvi'), circuloDespues: circ('vi.tsvi') };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── (d) el campo de la app cambia a mano: el circulo pasa a rojo ── */
  o.T4d = (function () {
    try {
      sembrar('diam_tsvi', '22');
      _d2Render();
      const verde = circ('vi.tsvi');
      sembrar('diam_tsvi', '31');
      _d2Render();
      const rojo = circ('vi.tsvi');
      return { conElMismoValor: verde, trasCambiarloAMano: rojo, fila: fila('vi.tsvi') };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── (f) los dos botones retirados ── */
  o.T4f = { botonesDiam: document.querySelectorAll('[data-vti-diam]').length,
            medVtiDiametroSigue: (typeof medVtiDiametro === 'function') };

  /* ── una fila SIN contraparte en la app no lleva circulo (control negativo) ── */
  o.T4control = (function () {
    try {
      _vCon(_vistaA, () => { d2Modo('vd'); });
      const conBanda = !!document.querySelector('[data-med-circ="vd.tapse"]');
      const sinBanda = !!document.querySelector('[data-med-circ="vd.medio"]');
      return { tapseLleva: conBanda, vdMedioNoLleva: !sinBanda };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  return o;
})()
