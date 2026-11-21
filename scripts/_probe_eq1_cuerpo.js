(async () => {
  const R = {};
  const fo = window.fetch;
  const B = window.__EQ_BASE;
  const ctrl = (b) => fo.call(window, B + '/_control', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
  const GET = (r) => fo.call(window, B + r, { headers: {
    Authorization: 'Bearer ' + localStorage.getItem('ett_ceibolink_token') } }).then(x => x.json());
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  /* ⚠️ CERRAR UN CARTEL «porMedico» LEVANTA LA BURBUJA (tarea A del prompt 7), y con una burbuja
     en pantalla `_clnkSondear` vuelve ANTES de revisar las imagenes a proposito. Sin bajarla, el
     turno siguiente mide sobre un cartel que no se abrio y se lee como «el arreglo no anda». */
  const cerrarTodo = (porMedico) => {
    clnkAvisoCerrar(porMedico);
    try { clnkBurbujaOcultar(); } catch (e) {}
  };
  const txt = () => String((document.getElementById('cfg-clnk-equipos') || {}).textContent || '');
  const filas = () => {
    const c = document.getElementById('cfg-clnk-equipos');
    return c ? c.querySelectorAll(':scope > div').length : -1;
  };
  const titulo = () => String((document.getElementById('clnkav-title') || {}).textContent || '');
  const cuerpoAv = () => String((document.getElementById('clnkav-txt') || {}).textContent || '');
  const boton = (n) => {
    const b = document.getElementById('clnkav-b' + n);
    return b && b.style.display !== 'none' ? String(b.textContent || '') : '';
  };
  window.toast = () => {};
  window.__clnkBaseTest = B;
  ['modalAvisoEco', 'login-overlay'].forEach(id => {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  try { localStorage.removeItem('ett_clnk_eqgrupos'); } catch (e) {}

  const t0 = Date.now() - 9 * 60000;
  const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
  const VC = { id: 'eq_vinno_cable', estado: 'autorizado', aet: 'VINNO', ip: '169.254.11.5',
               nombre_para_mostrar: 'VINNO', apodo: null, imagenes: 2, ultimo_envio: iso(t0) };
  const VR = { id: 'eq_vinno_router', estado: 'pendiente', aet: 'VINNO', ip: '10.0.5.90',
               nombre_para_mostrar: 'VINNO', apodo: null, imagenes: 0, ultimo_envio: iso(t0 + 60000) };
  const im = (id, ms) => ({ id, equipo: 'eq_vinno_cable', recibida: iso(ms), bytes: 570,
    tipo: 'imagen', modalidad: 'US', vista: null, origen: 'dicom', formato: 'dicom',
    se_puede_ver: true });
  const CONEX = { puerto_dicom: 4242, aet_puente: 'PUENTE', aviso: null, carpeta_compartida: null,
    direcciones: [
      { direccion: '192.168.1.23', interfaz: 'en7', probable: true, tipo: 'cable', enlace: true },
      { direccion: '10.0.5.4', interfaz: 'en0', probable: false, tipo: 'wifi', enlace: true }
    ] };
  await ctrl({ reset: true, equipos: [VC, VR], imagenes: [im('img_v1', t0), im('img_v2', t0 + 9000)],
               conexion: CONEX });

  cfgSetMode('avanzado');
  clnkToggle(true);
  try { showTab('config'); } catch (e) {}
  try { if (window.cfgOnShow) cfgOnShow(); } catch (e) {}
  await esperar(700);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = window.__EQ_COD; cod.dispatchEvent(new Event('input', { bubbles: true }));
             await clnkVincular(); }
  await esperar(1500);
  R.vinculado = clnkVinculado() === true;

  /* ══ el rotulo de conexion, funcion pura ══ */
  R.conex = {
    loop: clnkEqConexion('127.0.0.1'), loop6: clnkEqConexion('::1'),
    linkLocal: clnkEqConexion('169.254.11.5'),
    cable: clnkEqConexion('192.168.1.44'),
    router: clnkEqConexion('10.0.5.90'),
    ajena: clnkEqConexion('8.8.8.8'), vacia: clnkEqConexion('')
  };

  /* ══ A1 ══ */
  await clnkLeerEquipos();
  await esperar(300);
  R.a1_filas = filas();
  R.a1_cnt = String((document.getElementById('cfg-clnk-eq-cnt') || {}).textContent || '');
  const T = txt();
  R.a1 = { dosDirecciones: T.indexOf('2 direcciones') >= 0,
           ipCable: T.indexOf('169.254.11.5') >= 0, ipRouter: T.indexOf('10.0.5.90') >= 0,
           rotCable: T.indexOf('cable directo') >= 0, rotRouter: T.indexOf('red del router') >= 0,
           separar: T.indexOf('Separar') >= 0, unir: T.indexOf('Unir con otro equipo') >= 0,
           unApodo: document.querySelectorAll('[data-clnk-apodo]').length,
           imgs: (document.getElementById('cfg-clnk-equipos') || {}).querySelectorAll('img').length };
  /* el grupo no autoriza nada: los dos estados siguen siendo los del puente */
  R.a1_estados = (await GET('/v1/equipos')).equipos.map(e => e.id + ':' + e.estado).join(',');

  /* ══ A2 ══ */
    try { Object.keys(_clnkEqAvisados).forEach(k => { delete _clnkEqAvisados[k]; }); } catch (e) {}
  R.a2_abrio = await clnkAvisarEquipoNuevo();
  await esperar(300);
  R.a2_titulo = titulo();
  R.a2_texto = cuerpoAv().slice(0, 240);
  R.a2_botones = [boton(1), boton(2), boton(3), boton(4), boton(5)].filter(Boolean);
  /* «No, es otro equipo» → separado, dos renglones, y SIGUE en cuarentena */
  const b2 = document.getElementById('clnkav-b2');
  if (b2) b2.click();
  await esperar(900);
  R.a2_no_filas = filas();
  R.a2_no_estados = (await GET('/v1/equipos')).equipos.map(e => e.id + ':' + e.estado).join(',');
  /* deshacer: unir de vuelta por «Separar» inverso → se usa el store directo para volver al caso */
  clnkEqGrupoFijar('eq_vinno_router', 'aet:VINNO');
  await clnkLeerEquipos();
  await esperar(300);
  R.a2_tras_unir_filas = filas();
  /* «Sí, es el mismo» → permitir de verdad */
  try { Object.keys(_clnkEqAvisados).forEach(k => { delete _clnkEqAvisados[k]; }); } catch (e) {}
  cerrarTodo(true);
  await esperar(200);
  R.a2b_abrio = await clnkAvisarEquipoNuevo();
  await esperar(300);
  const b1 = document.getElementById('clnkav-b1');
  if (b1) b1.click();
  await esperar(1200);
  R.a2_si_estados = (await GET('/v1/equipos')).equipos.map(e => e.id + ':' + e.estado).join(',');
  R.a2_si_filas = filas();

  /* ══ A4 · EL CASO DEL MEDICO: el pendiente YA fue avisado y hay imagenes esperando ══ */
  await ctrl({ equipos: [VC, VR] });            // VR vuelve a pendiente
  try { Object.keys(_clnkAvisadas).forEach(k => { delete _clnkAvisadas[k]; }); } catch (e) {}
  /* El equipo pendiente YA fue avisado —el medico cerro la pregunta con «Mas tarde»—, que es lo
     que hacia que el sondeo no llegara nunca a mirar las imagenes. */
  _clnkEqAvisados['eq_vinno_router'] = true;
  cerrarTodo(true);
  await esperar(300);
  R.a4_estado = await fo.call(window, B + '/v1/estado').then(r => r.json())
    .then(d => d.imagenes_pendientes + '/' + d.equipos_esperando);
  await _clnkSondear(true);
  await esperar(1200);
  R.a4_abierto = !!_clnkAvisoAbierto;
  const disp = (id) => { const e = document.getElementById(id); return e ? String(e.style.display) : 'NO'; };
  R.a4_diag = { ovDisplay: disp('clnkav-ov'),
                bur: !!window._clnkBur, preg: !!window._clnkPregAbierta,
                otra: clnkAvisoHayOtraPregunta(),
                avisadas: Object.keys(_clnkAvisadas).join(','),
                dstOv: disp('dst-elegir-ov') };
  R.a4_grupo = !!_clnkAvisoGrupo;
  R.a4_titulo = titulo();
  R.a4_texto = cuerpoAv().slice(0, 120);

  /* ══ A5 · una tercera imagen del MISMO envio: el cartel cuenta UNA ══ */
  cerrarTodo(true);
  await esperar(200);
  R.a5_avisadasAntes = Object.keys(_clnkAvisadas).join(',');
  await ctrl({ imagenes: [im('img_v1', t0), im('img_v2', t0 + 9000), im('img_v3', t0 + 18000)] });
  await esperar(200);
  R.a5_abrio = await clnkRevisarImagenes();
  await esperar(500);
  R.a5_titulo = titulo();
  R.a5_texto = cuerpoAv().slice(0, 300);
  /* Y el camino FORZADO —«Ver lo que espera»— vuelve a decir el total: ahi no hay «nuevas». */
  cerrarTodo(true);
  await esperar(200);
  await clnkRevisarImagenes(true);
  await esperar(400);
  R.a5_forzado_texto = cuerpoAv().slice(0, 120);

  /* ══ A1 · «Unir con otro equipo» sale con DOS grupos ══ */
  await ctrl({ equipos: [VC, VR, { id: 'eq_ge', estado: 'autorizado', aet: 'GE_VIVID_01',
    ip: '192.168.1.44', nombre_para_mostrar: 'GE_VIVID_01', apodo: null, imagenes: 3,
    ultimo_envio: iso(t0) }] });
  await clnkLeerEquipos();
  await esperar(400);
  R.a1b = { filas: filas(), unir: txt().indexOf('Unir con otro equipo') >= 0,
            cable: txt().indexOf('por el cable') >= 0 };
  return R;
})()
