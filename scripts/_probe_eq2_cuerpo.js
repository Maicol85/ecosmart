(async () => {
  const R = {};
  const fo = window.fetch;
  const B = window.__EQ_BASE;
  const ctrl = (b) => fo.call(window, B + '/_control', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const card = () => document.getElementById('cfg-card-clnk');
  const campo = (id) => {
    const cs = document.querySelectorAll('[data-clnk-apodo]');
    for (let i = 0; i < cs.length; i++) {
      if (cs[i].getAttribute('data-clnk-apodo') === id) return cs[i];
    }
    return null;
  };
  /* Cuenta las mutaciones del DOM de la tarjeta durante un bloque de trabajo. */
  const mide = async (fn, ms) => {
    let n = 0;
    const obs = new MutationObserver(l => { n += l.length; });
    obs.observe(card(), { childList: true, subtree: true, characterData: true, attributes: true });
    await fn();
    await esperar(ms || 900);
    obs.disconnect();
    return n;
  };
  window.toast = () => {};
  window.__clnkBaseTest = B;
  ['modalAvisoEco', 'login-overlay'].forEach(id => {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  try { localStorage.removeItem('ett_clnk_eqgrupos'); } catch (e) {}

  const t0 = Date.now() - 9 * 60000;
  const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
  const A = { id: 'eq_a', estado: 'autorizado', aet: 'GE_UNO', ip: '192.168.1.44',
              nombre_para_mostrar: 'GE_UNO', apodo: null, imagenes: 3, ultimo_envio: iso(t0) };
  const C = { id: 'eq_c', estado: 'autorizado', aet: 'GE_DOS', ip: '192.168.1.45',
              nombre_para_mostrar: 'GE_DOS', apodo: null, imagenes: 1, ultimo_envio: iso(t0) };
  await ctrl({ reset: true, equipos: [A], escena: 'vacio' });

  cfgSetMode('avanzado');
  clnkToggle(true);
  try { showTab('config'); } catch (e) {}
  try { if (window.cfgOnShow) cfgOnShow(); } catch (e) {}
  await esperar(700);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = window.__EQ_COD; cod.dispatchEvent(new Event('input', { bubbles: true }));
             await clnkVincular(); }
  await esperar(1600);
  R.vinculado = clnkVinculado() === true;
  R.filas = (document.getElementById('cfg-clnk-equipos') || {}).children.length;

  /* ══ B1 · UN TURNO DE SONDEO CON EL MISMO CONTENIDO NO ESCRIBE NADA ══ */
  R.mutQuieto = await mide(() => _clnkSondear(true), 1400);
  R.mutQuieto2 = await mide(() => clnkLeerEstado(), 1400);
  R.mutMedico = await mide(() => clnkLeerEstado(true), 1400);

  /* ══ B1 · EL APODO SE PUEDE ESCRIBIR ══ */
  /* ⚠️ SIN LA SECCION «Equipos» ABIERTA, EL CAMPO ESTA DENTRO DE UN `details` CERRADO Y
     `focus()` NO HACE NADA —medido: `activeElement` se queda en BODY—. Es la trampa de
     `display:none` sin geometria que este archivo documenta, y sin abrirla toda esta medicion
     pasaria sobre un campo que nadie enfoco. */
  const secEq = document.getElementById('cfg-clnk-det-equipos');
  if (secEq) secEq.open = true;
  await esperar(150);
  let inp = campo('eq_a');
  R.b_hayCampo = !!inp;
  const det = inp ? inp.closest('details') : null;
  if (det) det.open = true;
  await esperar(80);
  inp.focus();
  inp.value = 'Vinno del consultorio';
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  /* El sondeo entero, cuatro turnos, con el foco dentro del campo. */
  R.b_focoTras = [];
  const quien = () => { const a = document.activeElement; return a ? (a.tagName + ':' +
    (a.getAttribute && a.getAttribute('data-clnk-apodo') || a.id || '')) : 'NADA'; };
  R.b_focoTras.push('inicial=' + quien());
  for (let i = 0; i < 4; i++) {
    await _clnkSondear(true); await esperar(250);
    R.b_focoTras.push(i + '=' + quien());
  }
  await clnkLeerEquipos();
  await esperar(300);
  const inp2 = campo('eq_a');
  const det2 = inp2 ? inp2.closest('details') : null;
  R.b_conFoco = { mismoNodo: inp2 === inp, valor: inp2 ? inp2.value : null,
                  enfocado: document.activeElement === inp2,
                  abierto: !!(det2 && det2.open) };
  /* ══ B1 · Y SI LA LISTA CAMBIA DE VERDAD, SE REPINTA SIN PERDER NI EL BORRADOR NI LO ABIERTO ══ */
  inp2.blur();
  await ctrl({ equipos: [A, C] });
  await clnkLeerEquipos();
  await esperar(400);
  const inp3 = campo('eq_a');
  const det3 = inp3 ? inp3.closest('details') : null;
  R.b_trasCambio = { filas: (document.getElementById('cfg-clnk-equipos') || {}).children.length,
                     mismoNodo: inp3 === inp2, valor: inp3 ? inp3.value : null,
                     abierto: !!(det3 && det3.open) };
  /* El foco se repone cuando el repintado ocurre con el foco en el campo y la firma cambiada:
     se fuerza quitando la marca de firma. */
  inp3.focus();
  try { inp3.setSelectionRange(5, 5); } catch (e) {}
  await ctrl({ equipos: [A] });
  window._clnkEqFirmaForzar = 1;
  _clnkEqFirma = 'xxx';
  await clnkLeerEquipos();          // con el foco adentro: POSTERGA
  await esperar(250);
  R.b_posterga = { mismoNodo: campo('eq_a') === inp3, valor: campo('eq_a').value,
                   enfocado: document.activeElement === campo('eq_a') };
  campo('eq_a').blur();
  await clnkLeerEquipos();          // ahora si repinta
  await esperar(300);
  R.b_trasBlur = { mismoNodo: campo('eq_a') === inp3, valor: campo('eq_a').value,
                   filas: (document.getElementById('cfg-clnk-equipos') || {}).children.length };

  /* ══ B1 · LOS CAMPOS DE AJUSTES ══ */
  const secAj = document.getElementById('cfg-clnk-det-ajustes');
  if (secAj) secAj.open = true;
  await esperar(150);
  const aet = document.getElementById('cfg-clnk-aet');
  const hor = document.getElementById('cfg-clnk-horas');
  R.aj_valores = { aet: aet ? aet.value : null, horas: hor ? hor.value : null };
  aet.focus(); aet.value = 'MI_NOMBRE';
  await clnkLeerAjustes();
  await esperar(300);
  R.aj_conFoco = { valor: aet.value, enfocado: document.activeElement === aet };
  aet.blur();
  await clnkLeerAjustes();
  await esperar(300);
  R.aj_trasBlur = aet.value;
  /* Y con el campo intacto, la lectura SI lo pone al dia. */
  await ctrl({ ajustes: { horas_retencion: 30, aet_puente: 'OTRONOMBRE' } });
  await clnkLeerAjustes();
  await esperar(300);
  R.aj_horasAlDia = hor.value;
  /* Abrir el panel vuelve a lo guardado. */
  clnkOnMostrar();
  await esperar(1300);
  R.aj_trasAbrir = aet.value;

  /* ══ el aviso de equipo nuevo sigue abriendo la seccion sola ══ */
  await ctrl({ equipos: [A, { id: 'eq_p', estado: 'pendiente', aet: 'OTRO', ip: '192.168.1.70',
    nombre_para_mostrar: 'OTRO', apodo: null, imagenes: 1, ultimo_envio: iso(t0) }] });
  const dq = document.getElementById('cfg-clnk-det-equipos');
  if (dq) dq.open = false;
  await clnkLeerEquipos();
  await esperar(400);
  R.pend_abreSola = !!(dq && dq.open);
  R.pend_cnt = String((document.getElementById('cfg-clnk-eq-cnt') || {}).textContent || '');
  return R;
})()
