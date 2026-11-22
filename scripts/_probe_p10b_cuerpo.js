(async () => {
  const o = { errs: [] };
  const q = s => document.querySelector(s);
  const esperar = ms => new Promise(r => setTimeout(r, ms));

  // === A · el cuadro propio de calibracion, con su unidad ==============================
  try {
    let pr = _medCalPedirVel('esta primera marca');
    await esperar(60);
    o.A_hayCuadro = !!q('[data-med-calvel="ov"]');
    o.A_hayPrompt = false;
    o.A_inpVacio  = q('[data-med-calvel="inp"]').value === '';
    o.A_okApagado = q('[data-med-calvel="ok"]').disabled === true;
    o.A_unidades  = Array.from(q('[data-med-calvel="uni"]').options).map(x => x.textContent);
    o.A_uniDefecto = q('[data-med-calvel="uni"]').options[q('[data-med-calvel="uni"]').selectedIndex].textContent;
    o.A_altoBotones = [q('[data-med-calvel="ok"]'), q('[data-med-calvel="no"]'), q('[data-med-calvel="uni"]')]
      .map(b => Math.round(b.getBoundingClientRect().height));
    o.A_sinId = ['inp','uni','ok','no','ov'].every(k => !q('[data-med-calvel="'+k+'"]').id);
    // 1,0 m/s -> 100 cm/s
    const inp = q('[data-med-calvel="inp"]');
    inp.value = '1.0'; inp.dispatchEvent(new Event('input', { bubbles: true }));
    o.A_okPrendido = q('[data-med-calvel="ok"]').disabled === false;
    q('[data-med-calvel="ok"]').click();
    o.A_ms = await pr;                                   // 100

    // lo mismo en cm/s
    pr = _medCalPedirVel('esta segunda marca');
    await esperar(60);
    const inp2 = q('[data-med-calvel="inp"]'), sel2 = q('[data-med-calvel="uni"]');
    inp2.value = '50'; inp2.dispatchEvent(new Event('input', { bubbles: true }));
    sel2.value = '1'; sel2.dispatchEvent(new Event('change', { bubbles: true }));
    q('[data-med-calvel="ok"]').click();
    o.A_cms = await pr;                                  // 50

    // cancelar devuelve null y no deja nodo
    pr = _medCalPedirVel('x'); await esperar(60);
    q('[data-med-calvel="no"]').click();
    o.A_cancelado = (await pr) === null;
    o.A_sinNodo = !q('[data-med-calvel="ov"]');
  } catch (e) { o.errs.push('A: ' + e.message); }

  // === B · los dos carteles propios ====================================================
  try {
    _medAviso('T', 'texto');
    await esperar(40);
    o.B_aviso = !!q('[data-med-aviso="ov"]');
    q('[data-med-aviso="ok"]').click(); await esperar(30);
    o.B_avisoSeVa = !q('[data-med-aviso="ov"]');

    window._medEscDudAvisado = false;
    _medEscalaCartel('motivo de prueba');
    await esperar(40);
    o.B_escCartel = !!q('[data-med-escdud="ov"]');
    o.B_escTexto  = (q('[data-med-escdud="ov"]').textContent || '').indexOf('no se pudo leer bien') >= 0;
    o.B_escBotones = Array.from(document.querySelectorAll('[data-med-escdud="cal"],[data-med-escdud="ok"]')).map(b => b.textContent);
    q('[data-med-escdud="ok"]').click(); await esperar(30);
    o.B_escSeVa = !q('[data-med-escdud="ov"]');
    _medEscalaCartel('otro');                 // no vuelve en la misma imagen
    await esperar(30);
    o.B_unaSolaVez = !q('[data-med-escdud="ov"]');
    medCambioDeImagen();
    _medEscalaCartel('tercero'); await esperar(30);
    o.B_vuelveTrasCambio = !!q('[data-med-escdud="ov"]');
    if (q('[data-med-escdud="ok"]')) q('[data-med-escdud="ok"]').click();
  } catch (e) { o.errs.push('B: ' + e.message); }

  // === C · la marca de origen por fila ================================================
  try {
    const base = { ms: 300, picoCms: 100, gradMax: 4, gradMedio: 2, pts: [] };
    window._medVtis = [
      Object.assign({ cm: 21.7, velManual: false, escalaDudosa: null }, base),
      Object.assign({ cm: 22.1, velManual: true,  escalaDudosa: null }, base),
      Object.assign({ cm: 23.0, velManual: false, escalaDudosa: 'el cero cae fuera' }, base)
    ];
    const h = _vtiPanel();
    o.C_archivo = h.indexOf('escala del archivo') >= 0;
    o.C_mano    = h.indexOf('escala vel. a mano') >= 0;
    o.C_dudosa  = h.indexOf('escala dudosa') >= 0;
    o.C_cuantas = (h.match(/escala del archivo|escala vel\. a mano|escala dudosa/g) || []).length;
  } catch (e) { o.errs.push('C: ' + e.message); }

  // === D · la frase de la escala tiene un solo dueño ==================================
  try {
    window._medCalibVel = { y0: 400, cmsPorPx: 0.94 };
    o.D_frase = _medCalVelFrase();
    window._medCalibVel = null;
    o.D_sinCal = _medCalVelFrase();
  } catch (e) { o.errs.push('D: ' + e.message); }

  return o;
})()
