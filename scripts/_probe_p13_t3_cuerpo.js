/* Cuerpo de _probe_p13_t3.mjs — TAREA 3 de la tanda P13 (calibracion de velocidad).
 *
 *   T3v  el VTI de prueba, a seis decimales, antes y despues: NINGUNA formula se movio
 *   T3p  la calibracion MANUAL se conserva al cerrar y reabrir, y la ultima manda
 *   T3a  si falta la escala de velocidad, elegir Velocidad o VTI entra SOLO en calibracion
 */
(async () => {
  const o = { err: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const jpg = new Uint8Array([255,216,255,217]);
  /* Una region DOPPLER: eje X en tiempo (ux=4) y eje Y en velocidad (uy=7), con su pixel de
     referencia y su valor fisico. Es el fixture de P12. */
  const RDOP = { ux:4, uy:7, dx:0.004, dy:-0.9425, x0:0, y0:200, x1:600, y1:700,
                 rx0:0, ry0:400, rvx:0, rvy:0, tipo:3 };
  const R2D  = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 };
  const SINREG = [];
  const mk = (n, regs) => ({ nombre:n, cuadros:2, d:{ frags:[jpg,jpg], cols:1016, filas:708,
    msCuadro:40, regiones:regs } });

  try { if (typeof __t === 'object' && __t && __t.limpiar) __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}

  /* ── T3v: el VTI con la escala DEL ARCHIVO, a seis decimales ── */
  o.T3v = (function () {
    try {
      _cineAbrir([mk('P13-T3-dop', [RDOP])]);
      const r = _vistaA.datos.loops[0].d.regiones[0];
      const medible = _dcmImgRegionVelocidad(r);
      const tiempo = _dcmImgRegionTiempo(r);
      const base = (typeof _dcmImgBaseY === 'function') ? _dcmImgBaseY(r) : 'n/d';
      /* Una envolvente triangular con el pico a 100 px de la base. */
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const x = 100 + i * 8;
        const y = base - (i <= 20 ? i * 5 : (40 - i) * 5);
        pts.push({ x: x, y: y });
      }
      const v = (typeof _vtiDe === 'function') ? _vtiDe(pts) : null;
      return { regionVelocidad: medible, regionTiempo: tiempo, baseY: base,
               ok: !!(v && v.ok), cm: v && v.cm != null ? Number(v.cm.toFixed(6)) : null,
               picoCms: v && v.picoCms != null ? Number(v.picoCms.toFixed(6)) : null,
               gradMax: v && v.gradMax != null ? Number(v.gradMax.toFixed(6)) : null,
               motivo: v && v.motivo ? String(v.motivo).slice(0, 60) : null };
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── T3a: una imagen SIN region -> elegir Velocidad entra solo en calibracion ── */
  o.T3a = (function () {
    try {
      const R = {};
      _cineAbrir([mk('P13-T3-sinreg', SINREG)]);
      if (!_vistaA.medOn) { try { medToggle(); } catch (e) {} }
      _vCon(_vistaA, () => { medHerramienta('vel'); });
      R.sinRegion_vel = !!_vistaA.medCalibrandoVel;
      _vCon(_vistaA, () => { medHerramienta('dist'); medHerramienta('vti'); });
      R.sinRegion_vti = !!_vistaA.medCalibrandoVel;
      /* CONTROL POSITIVO: con la escala del archivo NO entra a calibrar. */
      _cineAbrir([mk('P13-T3-dop2', [RDOP])]);
      if (!_vistaA.medOn) { try { medToggle(); } catch (e) {} }
      _vCon(_vistaA, () => { medHerramienta('vel'); });
      R.conEscalaDelArchivo = !!_vistaA.medCalibrandoVel;
      /* CONTROL NEGATIVO: sobre un modo M NO se ofrece calibrar (eje Y en cm). */
      const MM = { ux:4, uy:3, dx:0.004, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:2 };
      _cineAbrir([mk('P13-T3-modoM', [MM])]);
      if (!_vistaA.medOn) { try { medToggle(); } catch (e) {} }
      _vCon(_vistaA, () => { medHerramienta('vel'); });
      R.sobreModoM = !!_vistaA.medCalibrandoVel;
      R.herrTrasModoM = _vistaA.medHerr;
      /* y una imagen 2D: tampoco, el mensaje explica que es para Doppler */
      _cineAbrir([mk('P13-T3-2d', [R2D])]);
      if (!_vistaA.medOn) { try { medToggle(); } catch (e) {} }
      _vCon(_vistaA, () => { medHerramienta('vel'); });
      R.sobre2D = !!_vistaA.medCalibrandoVel;
      return R;
    } catch (e) { return 'ERR ' + e.message; }
  })();

  /* ── T3p: la calibracion MANUAL se conserva al cerrar y reabrir ── */
  o.T3p = await (async () => {
    try {
      const R = {};
      const L = mk('P13-T3-manual', SINREG);
      _cineAbrir([L]);
      await esp(300);
      if (!_vistaA.medOn) { try { medToggle(); } catch (e) {} }
      /* Se fija la escala por el DUEÑO de la cuenta, que es la funcion pura de MEDIR-3. */
      _vCon(_vistaA, () => {
        const cal = _medCalVelDos(500, 0, 400, 100);
        _vistaA.medCalibVel = cal;
        _medCalVelPersistir(_vistaA);
      });
      R.fijada = _vistaA.medCalibVel ? { cms: _vistaA.medCalibVel.cmsPorPx, y0: _vistaA.medCalibVel.y0 } : null;
      cineCerrar();
      await esp(260);
      _cineAbrir([L]);
      await esp(420);
      R.trasReabrir = _vistaA.medCalibVel ? { cms: _vistaA.medCalibVel.cmsPorPx, y0: _vistaA.medCalibVel.y0 } : null;
      /* La ULTIMA manda: se recalibra con otra escala y se vuelve a reabrir. */
      _vCon(_vistaA, () => {
        const cal2 = _medCalVelDos(500, 0, 300, 100);
        _vistaA.medCalibVel = cal2;
        _medCalVelPersistir(_vistaA);
      });
      const seg = _vistaA.medCalibVel.cmsPorPx;
      cineCerrar();
      await esp(260);
      _cineAbrir([L]);
      await esp(420);
      R.segunda = seg;
      R.trasReabrirLaSegunda = _vistaA.medCalibVel ? _vistaA.medCalibVel.cmsPorPx : null;
      /* CONTROL NEGATIVO: OTRA imagen no hereda la escala. */
      _cineAbrir([mk('P13-T3-otra', SINREG)]);
      await esp(420);
      R.CONTROL_otraImagen = _vistaA.medCalibVel ? _vistaA.medCalibVel.cmsPorPx : null;
      R.clave = (typeof _medCalVelClaveDe === 'function') ? String(_medCalVelClaveDe(_vistaA)).slice(0, 40) : 'n/d';
      R.sinDatosDelPaciente = (function () {
        try { const t = localStorage.getItem('ett_med_calvel') || '';
          return t.indexOf('PRUEBA') < 0 && t.indexOf('P13-T3') < 0; } catch (e) { return 'ERR'; }
      })();
      return R;
    } catch (e) { return 'ERR ' + e.message; }
  })();

  return o;
})()
