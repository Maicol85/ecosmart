(async () => {
  const R = {};
  const fo = window.fetch;
  const B = window.__EQ_BASE;
  const ctrl = (b) => fo.call(window, B + '/_control', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  window.toast = () => {};
  window.__clnkBaseTest = B;
  /* ⚠️ EL OVERLAY DE LOGIN ESTA EN `CLNK_AV_BLOQUEANTES`, asi que con el puesto NINGUN aviso de
     CeiboLink se abre y la medicion de A4 da «no sale el cartel» sobre una app que se porta
     bien. Es el denominador vacio que esta casa documenta. */
  ['modalAvisoEco', 'login-overlay'].forEach(id => {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  R.bloqueantesAlEmpezar = clnkAvisoHayOtraPregunta();

  /* ── El VINNO duplicado: el MISMO nombre desde DOS direcciones. Una autorizada (la del cable
        directo, 169.254) y otra esperando decision (la del router, 192.168.1.90). ── */
  const t0 = Date.now() - 9 * 60000;
  const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
  const VC = { id: 'eq_vinno_cable', estado: 'autorizado', aet: 'VINNO', ip: '169.254.11.5',
               nombre_para_mostrar: 'VINNO', apodo: null, imagenes: 2, ultimo_envio: iso(t0) };
  const VR = { id: 'eq_vinno_router', estado: 'pendiente', aet: 'VINNO', ip: '192.168.1.90',
               nombre_para_mostrar: 'VINNO', apodo: null, imagenes: 0, ultimo_envio: iso(t0 + 60000) };
  const imgs = [
    { id: 'img_v1', equipo: 'eq_vinno_cable', recibida: iso(t0), bytes: 570, tipo: 'imagen',
      modalidad: 'US', vista: null, origen: 'dicom', formato: 'dicom', se_puede_ver: true },
    { id: 'img_v2', equipo: 'eq_vinno_cable', recibida: iso(t0 + 9000), bytes: 570, tipo: 'imagen',
      modalidad: 'US', vista: null, origen: 'dicom', formato: 'dicom', se_puede_ver: true }
  ];
  await ctrl({ reset: true, equipos: [VC, VR], imagenes: imgs });

  cfgSetMode('avanzado');
  clnkToggle(true);
  try { showTab('config'); } catch (e) {}
  try { if (window.cfgOnShow) cfgOnShow(); } catch (e) {}
  await esperar(700);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = window.__EQ_COD; cod.dispatchEvent(new Event('input', { bubbles: true }));
             await clnkVincular(); }
  await esperar(1400);
  R.vinculado = clnkVinculado() === true;

  /* ══ A1 · UN RENGLON POR EQUIPO ══ */
  await clnkLeerEquipos();
  await esperar(300);
  const cont = document.getElementById('cfg-clnk-equipos');
  const filas = cont ? cont.querySelectorAll(':scope > div') : [];
  R.a1_filas = filas.length;
  R.a1_textos = [].map.call(filas, n => String(n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120));
  R.a1_diceLaDireccion = !!(cont && String(cont.textContent || '').indexOf('169.254.11.5') >= 0);
  R.a1_diceCable = !!(cont && String(cont.textContent || '').indexOf('cable directo') >= 0);
  R.a1_haySeparar = !!(cont && String(cont.textContent || '').indexOf('Separar') >= 0);
  R.a1_hayUnir = !!(cont && String(cont.textContent || '').indexOf('Unir') >= 0);

  /* ══ A4 · EL CARTEL CON IMAGENES YA ESPERANDO ══ */
  R.a4_pendientesEstado = await fo.call(window, B + '/v1/estado').then(r => r.json())
    .then(d => ({ imagenes_pendientes: d.imagenes_pendientes, equipos_esperando: d.equipos_esperando }));
  /* Turno 1: hay un equipo esperando decision, asi que sale el aviso de EQUIPO NUEVO. */
  await _clnkSondear(true);
  await esperar(900);
  R.a4_t1_bloqueantes = clnkAvisoHayOtraPregunta();
  R.a4_t1_titulo = (document.getElementById('clnkav-title') || {}).textContent || '';
  R.a4_t1_abierto = !!window._clnkAvisoAbierto;
  /* El medico lo cierra (es lo que hace «Mas tarde», o la ✕). */
  clnkAvisoCerrar(true);
  await esperar(200);
  /* Turno 2 y 3: el equipo sigue PENDIENTE y ya fue avisado. ¿Sale el cartel de IMAGENES? */
  await _clnkSondear(true);
  await esperar(900);
  await _clnkSondear(true);
  await esperar(900);
  R.a4_t2_titulo = (document.getElementById('clnkav-title') || {}).textContent || '';
  R.a4_t2_abierto = !!window._clnkAvisoAbierto;
  R.a4_t2_grupo = !!window._clnkAvisoGrupo;
  /* CONTROL DE LA HIPOTESIS: sin ningun equipo pendiente, el MISMO estado de imagenes. */
  await ctrl({ equipos: [VC] });
  await esperar(200);
  await _clnkSondear(true);
  await esperar(1100);
  R.a4_t3_sinPendiente_titulo = (document.getElementById('clnkav-title') || {}).textContent || '';
  R.a4_t3_sinPendiente_abierto = !!window._clnkAvisoAbierto;
  /* Y el camino forzado, que es el que al medico SI le funciono. */
  const abiertoAntesForzar = !!window._clnkAvisoAbierto;
  clnkAvisoCerrar(true);
  await esperar(200);
  R.a4_forzado = await clnkRevisarImagenes(true);
  await esperar(500);
  R.a4_forzado_titulo = (document.getElementById('clnkav-title') || {}).textContent || '';
  R.a4_abiertoAntesDeForzar = abiertoAntesForzar;
  clnkAvisoCerrar(true);
  await esperar(200);

  /* ══ B1 · EL SONDEO PISA LO QUE SE ESCRIBE ══ */
  await ctrl({ equipos: [VC, VR] });
  await clnkLeerEquipos();
  await esperar(400);
  let inp = null;
  const cs = document.querySelectorAll('[data-clnk-apodo]');
  for (let i = 0; i < cs.length; i++) {
    if (cs[i].getAttribute('data-clnk-apodo') === 'eq_vinno_cable') { inp = cs[i]; break; }
  }
  R.b1_hayCampo = !!inp;
  if (inp) {
    const det = inp.closest('details');
    if (det) det.open = true;
    inp.focus();
    inp.value = 'Vinno del consultorio';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    R.b1_antes = { valor: inp.value, enfocado: document.activeElement === inp,
                   abierto: !!(det && det.open) };
    await clnkLeerEquipos();
    await esperar(300);
    let inp2 = null;
    const cs2 = document.querySelectorAll('[data-clnk-apodo]');
    for (let i = 0; i < cs2.length; i++) {
      if (cs2[i].getAttribute('data-clnk-apodo') === 'eq_vinno_cable') { inp2 = cs2[i]; break; }
    }
    const det2 = inp2 ? inp2.closest('details') : null;
    R.b1_despues = { existe: !!inp2, mismoNodo: inp2 === inp, valor: inp2 ? inp2.value : null,
                     enfocado: !!inp2 && document.activeElement === inp2,
                     abierto: !!(det2 && det2.open) };
  }
  /* Los campos de Ajustes, el mismo problema por otra puerta. */
  const aet = document.getElementById('cfg-clnk-aet');
  if (aet) {
    aet.focus(); aet.value = 'MI_NOMBRE';
    await clnkLeerAjustes();
    await esperar(300);
    R.b1_ajustes = { valorTrasSondeo: aet.value, enfocado: document.activeElement === aet };
  }
  /* El parpadeo: ¿cuantos nodos reescribe un turno con el MISMO contenido? */
  const luz = document.getElementById('cfg-clnk-luz');
  let marcados = 0;
  const obs = new MutationObserver(ms => { marcados += ms.length; });
  obs.observe(document.getElementById('cfg-card-clnk'), { childList: true, subtree: true,
    characterData: true });
  await clnkLeerEstado();
  await esperar(1200);
  obs.disconnect();
  R.b1_mutacionesPorTurno = marcados;
  R.b1_luzDicePreguntando = String((luz || {}).textContent || '');

  /* ══ C1 · BORRADO MULTIPLE ══ */
  R.c1 = {
    clnkbBorrar: typeof window.clnkbBorrar,
    clnkbBorrarUna: typeof window.clnkbBorrarUna,
    clnkbBorrarVarias: typeof window.clnkbBorrarVarias,
    igSelEliminar: typeof window.igSelEliminar,
    igBorrarVariosInformes: typeof window.igBorrarVariosInformes,
    borrarInforme: typeof window.borrarInforme
  };
  return R;
})()
