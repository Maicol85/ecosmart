(async () => {
  const R = {};
  const fo = window.fetch;
  let ped = [];
  window.fetch = function (u, o) { ped.push(String(u)); return fo.call(window, u, o); };
  const B = window.__P6_BASE;
  const alC = () => ped.filter(u => u.indexOf(B) === 0).length;
  const urls = () => ped.filter(u => u.indexOf(B) === 0).map(u => u.slice(B.length).split('?')[0]);
  const ctrl = (b) => fo.call(window, B + '/_control', { method:'POST',
    headers:{'Content-Type':'application/json'}, body: JSON.stringify(b) }).then(r => r.json());
  const oculto = (v) => Object.defineProperty(Document.prototype, 'hidden',
    { configurable:true, get: () => v });
  window.toast = () => {};
  window.__clnkBaseTest = B;
  await ctrl({ reset:true, equipos:1, escena:'vacio' });
  cfgSetMode('avanzado');
  clnkToggle(true);
  try { showTab('config'); } catch (e) {}
  try { if (window.cfgOnShow) cfgOnShow(); } catch (e) {}
  await new Promise(r => setTimeout(r, 700));
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = window.__P6_COD; cod.dispatchEvent(new Event('input', { bubbles:true }));
             await clnkVincular(); }
  await new Promise(r => setTimeout(r, 1300));
  R.vinculado = clnkVinculado() === true;
  R.panelALaVista = clnkPanelALaVista();

  /* -- ESCENA 1: sondeo A LA VISTA (lo que TC-845 hace en su bloque C2) y enseguida ocultar. -- */
  ped = [];
  await _clnkSondear();
  await new Promise(r => setTimeout(r, 300));
  R.e1_trasSondeoVisible = urls();
  R.e1_refTimerPendiente = (window.clnkRefTimerPendiente ? clnkRefTimerPendiente() : 'no expuesto');
  oculto(true);
  R.e1_debeOculta = clnkSondeoDebe();
  ped = [];
  await _clnkSondear();
  await new Promise(r => setTimeout(r, 350));
  R.e1_pedidosOculta = alC();
  R.e1_urlsOculta = urls();
  /* la caja del nodo sigue estando: es la guarda que no ve la pestania del navegador */
  R.e1_panelALaVistaConOculta = clnkPanelALaVista();
  oculto(false);

  /* -- CONTROL DE LA HIPOTESIS: el mismo camino, pero dejando que el rebote termine ANTES de
        ocultar. Si la causa es el rebote en vuelo, aca tiene que dar CERO. -- */
  await new Promise(r => setTimeout(r, 400));
  ped = [];
  await _clnkSondear();
  await new Promise(r => setTimeout(r, 1200));   // deja disparar el rebote de 400 ms
  R.e2_trasEsperar = urls();
  oculto(true);
  ped = [];
  await _clnkSondear();
  await new Promise(r => setTimeout(r, 350));
  R.e2_pedidosOculta = alC();
  R.e2_urlsOculta = urls();
  oculto(false);
  return R;
})()
