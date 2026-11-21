(async () => {
  /* El camino COMPLETO de «Unir con otro equipo»: el boton, el cartel, el desplegable y el
     resultado. Es lo unico de la tanda que TC-985 mide por su pieza (clnkEqGrupoFijar) y no por
     el gesto, asi que se mide aparte. SOLO LEE la app: lo unico que escribe es el store de
     grupos, que se restituye al final. */
  const R = {};
  const fo = window.fetch;
  const B = window.__EQ_BASE;
  const ctrl = (b) => fo.call(window, B + '/_control', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
  const GET = (ruta) => fo.call(window, B + ruta, { headers: {
    Authorization: 'Bearer ' + localStorage.getItem('ett_ceibolink_token') } }).then(r => r.json());
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const EL = (id) => document.getElementById(id);
  const filas = () => { const c = EL('cfg-clnk-equipos');
    return c ? c.querySelectorAll(':scope > div').length : -1; };
  window.toast = () => {};
  window.__clnkBaseTest = B;
  ['modalAvisoEco', 'login-overlay'].forEach(id => {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  try { localStorage.removeItem('ett_clnk_eqgrupos'); } catch (e) {}
  const A = { id: 'eq_u1', estado: 'autorizado', aet: 'VIEJO_AET', ip: '192.168.1.80',
    nombre_para_mostrar: 'VIEJO_AET', apodo: null, imagenes: 4,
    ultimo_envio: '2026-11-21T13:00:00Z' };
  const Bq = { id: 'eq_u2', estado: 'autorizado', aet: 'NUEVO_AET', ip: '192.168.1.81',
    nombre_para_mostrar: 'NUEVO_AET', apodo: null, imagenes: 1,
    ultimo_envio: '2026-11-21T13:30:00Z' };
  await ctrl({ reset: true, equipos: [A, Bq], escena: 'vacio' });
  cfgSetMode('avanzado');
  clnkToggle(true);
  try { showTab('config'); } catch (e) {}
  try { if (window.cfgOnShow) cfgOnShow(); } catch (e) {}
  await esperar(700);
  const cod = EL('cfg-clnk-codigo');
  if (cod) { cod.value = window.__EQ_COD; cod.dispatchEvent(new Event('input', { bubbles: true }));
             await clnkVincular(); }
  await esperar(1400);
  R.vinculado = clnkVinculado() === true;
  try { clnkBurbujaOcultar(); } catch (e) {}
  await clnkLeerEquipos();
  await esperar(300);
  R.filasAntes = filas();
  /* El boton, con el gesto real: se busca el que lleva data-clnk-acc="unir" del primer grupo. */
  const bU = Array.prototype.slice.call(
    EL('cfg-clnk-equipos').querySelectorAll('[data-clnk-acc="unir"]'))
    .filter(b => b.getAttribute('data-clnk-eq') === 'eq_u1')[0];
  R.hayBoton = !!bU;
  const p = bU ? clnkEqUnirPreguntar('eq_u1') : null;
  await esperar(500);
  R.titulo = String((EL('clnkav-title') || {}).textContent || '');
  R.texto = String((EL('clnkav-txt') || {}).textContent || '').slice(0, 170);
  const sel = document.querySelector('[data-clnk-unir]');
  R.haySelect = !!sel;
  R.opciones = sel ? Array.prototype.map.call(sel.options, o => o.textContent).join(' | ') : '';
  R.selectSinId = sel ? (sel.id === '') : null;
  const bots = ['clnkav-b1', 'clnkav-b2', 'clnkav-b3', 'clnkav-b4', 'clnkav-b5']
    .map(id => { const b = EL(id); return (b && b.style.display !== 'none') ? b.textContent : ''; })
    .filter(Boolean);
  R.botones = bots.join(' | ');
  /* Se aprieta «Unir» de verdad. */
  const bOk = Array.prototype.slice.call(document.querySelectorAll('#clnkav-ov button'))
    .filter(b => (b.textContent || '').indexOf('Unir') >= 0)[0];
  R.hayUnir = !!bOk;
  if (bOk) bOk.click();
  R.resuelto = p ? await p : null;
  await esperar(700);
  R.filasDespues = filas();
  R.persistido = String(localStorage.getItem('ett_clnk_eqgrupos') || '');
  R.estados = (await GET('/v1/equipos')).equipos.map(e => e.id + ':' + e.estado).join(',');
  R.textoFila = String((EL('cfg-clnk-equipos') || {}).textContent || '')
    .indexOf('2 direcciones') >= 0;
  /* Y «Cancelar» NO une nada. */
  clnkEqGrupoFijar('eq_u1', 'aet:VIEJO_AET');
  await clnkLeerEquipos();
  await esperar(300);
  R.filasTrasSeparar = filas();
  const p2 = clnkEqUnirPreguntar('eq_u1');
  await esperar(500);
  const bNo = Array.prototype.slice.call(document.querySelectorAll('#clnkav-ov button'))
    .filter(b => (b.textContent || '').indexOf('Cancelar') >= 0)[0];
  if (bNo) bNo.click();
  R.resuelto2 = await p2;
  await esperar(500);
  R.filasTrasCancelar = filas();
  try { localStorage.removeItem('ett_clnk_eqgrupos'); } catch (e) {}
  return R;
})()
