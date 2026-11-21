(async () => {
  const R = {};
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  /* ⚠️ NINGUN CAMINO DE ESTA PARTE PUEDE ABRIR UN DIALOGO NATIVO (regla P8-b3): se cuentan. */
  let nativos = [];
  window.confirm = function (t) { nativos.push('confirm:' + String(t).slice(0, 40)); return true; };
  window.alert = function (t) { nativos.push('alert:' + String(t).slice(0, 40)); };
  window.prompt = function (t) { nativos.push('prompt'); return null; };
  let toasts = [];
  window.toast = (t) => { toasts.push(String(t)); };
  ['modalAvisoEco', 'login-overlay'].forEach(id => {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  /* El censo de controles CON id: lo que esta parte agrega no puede entrar al estudio. */
  const censo = () => Array.prototype.slice.call(
    document.querySelectorAll('input[id],select[id],textarea[id]')).map(e => e.id).sort().join(',');
  R.censoAntes = censo().length;

  /* ══════════ C1 · LA BANDEJA ══════════ */
  const reg = { id: 'env_prueba', origen: 'ceibolink', equipo: 'VINNO',
    recibida: new Date().toISOString(), ts: new Date().toISOString(),
    imgs: [{ dataURL: 'd0', thumb: '', clnkId: 'A0' },
           { dataURL: 'd1', thumb: '', clnkId: 'A1' },
           { dataURL: 'd2', thumb: '', clnkId: 'A2' }],
    loops: [{ nombre: 'loop0', cuadros: 3, ms: 30, poster: '', bytes: 100 }] };
  R.c1_guardado = await clnkbGuardar(reg);
  try { showTab('imagenes'); } catch (e) {}
  await clnkbRender();
  await esperar(300);
  const lis = () => document.getElementById('clnkb-lista');
  R.c1_minis = lis() ? lis().querySelectorAll('button[aria-label]').length : -1;
  R.c1_hayElegir = !!(lis() && lis().querySelector('[data-clnkb-elegir]'));
  R.c1_sinModo_abre = !!(lis() && lis().querySelector('[data-clnkb-sel]')) === false;
  /* prender el modo elegir */
  clnkbElegirModo(true);
  await esperar(300);
  R.c1_conModo = { todas: !!lis().querySelector('[data-clnkb-sel="todas"]'),
                   ninguna: !!lis().querySelector('[data-clnkb-sel="ninguna"]'),
                   borrar: !!lis().querySelector('[data-clnkb-borrar-sel]') };
  /* elegir la 0 y la 2 tocando la miniatura, que es el gesto real */
  const minis = () => Array.prototype.slice.call(lis().querySelectorAll('button[aria-pressed]'));
  R.c1_miniaturasConPressed = minis().length;
  minis()[0].click(); await esperar(200);
  minis()[2].click(); await esperar(250);
  R.c1_elegidas = clnkbSelCuenta();
  R.c1_marcadas = minis().filter(b => b.getAttribute('aria-pressed') === 'true').length;
  R.c1_botonBorrar = !!lis().querySelector('[data-clnkb-borrar-sel]');
  /* ══ UNA SOLA CONFIRMACION, Y ES PROPIA ══ */
  const pBorrar = clnkbBorrarElegidas();
  await esperar(400);
  const dlg = Array.prototype.slice.call(document.querySelectorAll('[role=dialog]'))
    .filter(d => d.getBoundingClientRect().height > 0);
  R.c1_dialogos = dlg.length;
  R.c1_dialogoTexto = dlg.length ? String(dlg[0].textContent || '').slice(0, 170) : '';
  R.c1_nativosHastaAqui = nativos.slice();
  const btnSi = dlg.length ? Array.prototype.slice.call(dlg[0].querySelectorAll('button'))
    .filter(b => /Borrar/.test(b.textContent || ''))[0] : null;
  R.c1_hayBotonSi = !!btnSi;
  if (btnSi) btnSi.click();
  R.c1_borradas = await pBorrar;
  await esperar(400);
  const reg2 = await clnkbLeer('env_prueba');
  R.c1_quedan = reg2 ? { imgs: (reg2.imgs || []).map(x => x.clnkId).join(','),
                         loops: (reg2.loops || []).length } : null;
  R.c1_toasts = toasts.slice(-1);

  /* ══ el desfase: con los largos cambiados NO se borra nada ══ */
  const r3 = await clnkbBorrarVarias('env_prueba', [{ clase: 'img', k: 0 }], { n: 99, nLoops: 99 });
  R.c1_desfase = { ok: r3.ok, borradas: r3.borradas, desfasado: !!r3.desfasado };
  const reg3 = await clnkbLeer('env_prueba');
  R.c1_trasDesfase = reg3 ? (reg3.imgs || []).map(x => x.clnkId).join(',') : null;
  /* y «Todas» alcanza lo que esta a la vista */
  await clnkbSelTodas(true);
  R.c1_todas = clnkbSelCuenta();
  await clnkbSelTodas(false);
  R.c1_ninguna = clnkbSelCuenta();
  clnkbElegirModo(false);

  /* ══════════ C2 · LOS ESTUDIOS ══════════ */
  const est = (id, nom, ci, f, uuid) => ({ id: id, nombre: nom, ci: ci, doc_tipo: 'CI',
    fecha_estudio: f, uuid: uuid, campos: {}, informe: '' });
  CeiboStore.setLocal([est(901, 'PRUEBA UNO', '1111111', '2026-11-01', 'uuid-901'),
                       est(902, 'PRUEBA DOS', '2222222', '2026-11-02', 'uuid-902'),
                       est(903, 'PRUEBA TRES', '3333333', '2026-11-03', 'uuid-903')]);
  try { showTab('guardados'); } catch (e) {}
  renderInformesGuardados();
  await esperar(500);
  R.c2_enLista = (igListaEnPantalla() || []).length;
  R.c2_hayBoton = !!document.getElementById('ig-btn-borrar-varios');
  R.c2_abrio = igBorrarVariosAbrir();
  await esperar(300);
  const mod = Array.prototype.slice.call(document.querySelectorAll('[role=dialog]'))
    .filter(d => d.getBoundingClientRect().height > 0)[0];
  R.c2_modal = !!mod;
  R.c2_casillas = mod ? mod.querySelectorAll('[data-ig-borr]').length : -1;
  R.c2_casillasConId = mod ? mod.querySelectorAll('input[id]').length : -1;
  R.c2_dice = mod ? (String(mod.textContent || '').indexOf('el filtro deja ver') >= 0) : false;
  /* elegir DOS con el gesto real */
  const cs = mod ? Array.prototype.slice.call(mod.querySelectorAll('[data-ig-borr]')) : [];
  cs[0].click(); cs[2].click();
  await esperar(200);
  R.c2_cuenta = String(mod.textContent || '').indexOf('Elegidos: 2') >= 0;
  const bB = Array.prototype.slice.call(mod.querySelectorAll('button'))
    .filter(b => /Borrar 2/.test(b.textContent || ''))[0];
  R.c2_hayBoton2 = !!bB;
  bB.click();
  await esperar(500);
  const conf = Array.prototype.slice.call(document.querySelectorAll('[role=dialog]'))
    .filter(d => d.getBoundingClientRect().height > 0);
  R.c2_dialogos = conf.length;
  R.c2_confTexto = conf.length ? String(conf[conf.length - 1].textContent || '').slice(0, 260) : '';
  const bSi = conf.length ? Array.prototype.slice.call(conf[conf.length - 1].querySelectorAll('button'))
    .filter(b => /Borrar 2/.test(b.textContent || ''))[0] : null;
  R.c2_hayConfirmar = !!bSi;
  if (bSi) bSi.click();
  await esperar(900);
  R.c2_quedan = (CeiboStore.getLocal() || []).map(i => i.id).join(',');
  R.c2_modalCerrado = !Array.prototype.slice.call(document.querySelectorAll('[role=dialog]'))
    .some(d => d.getBoundingClientRect().height > 0);
  R.c2_toasts = toasts.slice(-1);
  R.nativos = nativos;
  R.censoDespues = censo().length;
  R.censoIgual = R.censoAntes === R.censoDespues;
  return R;
})()
