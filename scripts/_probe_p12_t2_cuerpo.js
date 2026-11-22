/* P12 · TAREA 2 · Las repetidas y el boton con (0), medido contra el conector falso. */
(async () => {
  const out = { paso: 'inicio' };
  const fo = window.fetch;
  const B = window.__P6_BASE;
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const ctrl = b => fo.call(window, B + '/_control', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
  window.toast = () => {};
  window.__clnkBaseTest = B;
  /* ⚠️ EL OVERLAY DE LOGIN ESTA EN `CLNK_AV_BLOQUEANTES`: con el puesto NINGUN aviso se abre y
     la medicion diria «no sale el cartel» sobre una app que se porta bien. */
  ['modalAvisoEco', 'login-overlay'].forEach(id => {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });

  const t0 = Date.now() - 9 * 60000;
  const iso = ms => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
  const EQ = { id: 'eq_x1', estado: 'autorizado', aet: 'VINNO', ip: '169.254.11.5',
               nombre_para_mostrar: 'VINNO', apodo: null, imagenes: 3, ultimo_envio: iso(t0) };
  const im = (id, dt) => ({ id: id, equipo: 'eq_x1', recibida: iso(t0 + dt), bytes: 570,
                            tipo: 'imagen', modalidad: 'US', vista: null, origen: 'dicom',
                            formato: 'dicom', se_puede_ver: true });

  cfgSetMode('avanzado');
  clnkToggle(true);
  try { showTab('config'); } catch (e) {}
  try { if (window.cfgOnShow) cfgOnShow(); } catch (e) {}
  await esperar(700);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = window.__P6_COD; cod.dispatchEvent(new Event('input', { bubbles: true }));
             await clnkVincular(); }
  await esperar(1400);
  out.vinculado = (clnkVinculado() === true);

  const tok = () => localStorage.getItem('ett_ceibolink_token') || '';
  const enPuente = async () => {
    const d = await fo.call(window, B + '/v1/imagenes', { headers: { Authorization: 'Bearer ' + tok() } })
      .then(r => r.json()).catch(() => null);
    return (d && d.imagenes) ? d.imagenes.map(i => String(i.id)).sort() : null;
  };
  const bot = k => document.getElementById('clnkav-b' + k);
  const rot = k => { const b = bot(k); return b ? String(b.textContent || '') : '(no hay)'; };
  const apagado = k => { const b = bot(k); return b ? (!!b.disabled || b.classList.contains('clnk-av-off')) : null; };
  const cuerpo = () => { const c = document.getElementById('clnkav-cuerpo'); return c ? String(c.textContent || '') : ''; };
  const sembrarVistas = o => {
    try { localStorage.setItem('ett_clnk_vistas', JSON.stringify(o)); } catch (e) {}
    try { window._clnkVistas = null; } catch (e) {}
    try { if (window._clnkAvisadas) Object.keys(_clnkAvisadas).forEach(k => { delete _clnkAvisadas[k]; }); } catch (e) {}
  };

  /* ── ESCENA A: tres imagenes, DOS ya vistas -> 1 nueva, 2 repetidas ─────────────────── */
  sembrarVistas({ img_p1: { d: 'guardado', t: Date.now() }, img_p2: { d: 'estudio', t: Date.now() } });
  await ctrl({ reset: true, equipos: [EQ],
               imagenes: [im('img_p1', 0), im('img_p2', 8000), im('img_p3', 16000)] });
  await esperar(300);
  try { await clnkRevisarImagenes(true); } catch (e) { out.errA = String(e && e.message); }
  await esperar(600);
  out.A = { b1: rot(1), b2: rot(2), b1Apagado: apagado(1), cuerpo: cuerpo() };
  const gA = window._clnkAvisoGrupo;
  out.A.nNuevos = gA ? (gA.idsNuevos || []).length : null;
  out.A.nRepes = gA ? (gA.idsRepes || []).length : null;
  out.A.diceQueSeDescartan = (out.A.cuerpo.indexOf('se descart') > -1);
  out.A.enPuenteAntes = await enPuente();
  try { bot(1).click(); } catch (e) { out.errClic = String(e && e.message); }
  await esperar(2600);
  out.A.enPuenteDespues = await enPuente();
  const q = out.A.enPuenteDespues || [];
  out.A.repesBorradas = (q.indexOf('img_p1') < 0 && q.indexOf('img_p2') < 0);
  out.A.nuevaSigueEnPuente = (q.indexOf('img_p3') >= 0);
  out.A.p1Descartada = (_clnkVistaDe('img_p1') === 'descartada');
  out.A.p2Descartada = (_clnkVistaDe('img_p2') === 'descartada');
  try { clnkAvisoCerrar(); } catch (e) {}

  /* ── ESCENA B: CERO nuevas. El boton tiene que decir (0) y verse apagado. ───────────── */
  sembrarVistas({ img_q1: { d: 'guardado', t: Date.now() }, img_q2: { d: 'estudio', t: Date.now() },
                  img_q3: { d: 'bandeja', t: Date.now() } });
  await ctrl({ reset: true, equipos: [EQ],
               imagenes: [im('img_q1', 0), im('img_q2', 8000), im('img_q3', 16000)] });
  await esperar(300);
  try { await clnkRevisarImagenes(true); } catch (e) { out.errB = String(e && e.message); }
  await esperar(600);
  out.B = { b1: rot(1), b2: rot(2), b1Apagado: apagado(1),
            b1Titulo: String((bot(1) || {}).title || ''),
            b1Opacidad: (() => { try { return getComputedStyle(bot(1)).opacity; } catch (e) { return null; } })(),
            b1Disabled: !!(bot(1) || {}).disabled,
            cuerpo: cuerpo() };
  const gB = window._clnkAvisoGrupo;
  out.B.nNuevos = gB ? (gB.idsNuevos || []).length : null;
  out.B.nRepes = gB ? (gB.idsRepes || []).length : null;
  out.B.diceCero = (out.B.b1.indexOf('(0)') > -1);
  /* Y apretarlo no hace nada Y NO PIERDE NADA: las tres siguen en el puente. */
  try { bot(1).click(); } catch (e) {}
  await esperar(900);
  out.B.enPuenteTrasClic = await enPuente();
  try { clnkAvisoCerrar(); } catch (e) {}

  /* ── CONTROL NEGATIVO: TODAS nuevas. El boton NO esta apagado y no se habla de descartar. ── */
  sembrarVistas({});
  await ctrl({ reset: true, equipos: [EQ],
               imagenes: [im('img_r1', 0), im('img_r2', 8000), im('img_r3', 16000)] });
  await esperar(300);
  try { await clnkRevisarImagenes(true); } catch (e) { out.errC = String(e && e.message); }
  await esperar(600);
  out.C = { b1: rot(1), b1Apagado: apagado(1), cuerpo: cuerpo() };
  const gC = window._clnkAvisoGrupo;
  out.C.nNuevos = gC ? (gC.idsNuevos || []).length : null;
  out.C.nRepes = gC ? (gC.idsRepes || []).length : null;
  out.C.noHablaDeDescartar = (out.C.cuerpo.indexOf('se descart') < 0);
  try { clnkAvisoCerrar(); } catch (e) {}

  out.paso = 'listo';
  return out;
})();
