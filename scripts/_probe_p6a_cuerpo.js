/* Cuerpo de _probe_p6a.mjs — bloque A. Aparte, por la leccion de MEDIR-4b. */
(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = {};
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display = 'none';
  window.__clnkBaseTest = window.__P6_BASE;
  window.toast = function () {}; window.alert = function () {}; window.confirm = function () { return true; };
  const CTRL = async b => {
    const r = await fetch(window.__P6_BASE + '/_control',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    return r.json();
  };
  try { localStorage.setItem('ett_view_mode', 'avanzado'); if (typeof applyViewMode === 'function') applyViewMode(); } catch (e) {}
  try { localStorage.removeItem('ett_ceibolink_token'); clnkToggle(true); } catch (e) {}
  await CTRL({ reset: true, equipos: 1, escena: 'vacio' });
  showTab('config'); if (window.cfgOnShow) cfgOnShow();
  await esp(900);
  const cod = document.getElementById('cfg-clnk-codigo');
  if (cod) { cod.value = window.__P6_COD; cod.dispatchEvent(new Event('input', { bubbles: true })); await clnkVincular(); }
  await esp(1500);
  o.vinculado = clnkVinculado();
  if (!o.vinculado) { o.err = 'no se pudo vincular'; return o; }

  const tit = () => (document.getElementById('clnkav-title') || {}).textContent || '';
  const abierto = () => { const v = document.getElementById('clnkav-ov'); return !!(v && v.style.display !== 'none'); };
  const cuerpo = () => document.getElementById('clnkav-cuerpo');
  const cont = () => { const n = cuerpo() && cuerpo().querySelector('[data-clnk-tanda-n]'); return n ? n.textContent : ''; };
  const estado = () => { const n = cuerpo() && cuerpo().querySelector('[data-clnk-tanda-estado]'); return n ? n.textContent : ''; };
  const botones = () => CLNK_AV_BOTONES.map(k => {
    const b = document.getElementById('clnkav-' + k);
    if (!b || b.style.display === 'none' || !b.textContent) return null;
    return { txt: b.textContent, off: !!b.disabled };
  }).filter(Boolean);

  /* ── (1) UNA SOLA IMAGEN: el cartel sale YA ─────────────────────────────── */
  await CTRL({ escena: 'tandaUna' });
  await _clnkSondear(true);
  await esp(900);
  o.unaImagen = { abierto: abierto(), titulo: tit(), n: cont(), estado: estado(),
                  botones: botones(), cadencia: clnkSondeoMs(),
                  viajan: cuerpo() ? cuerpo().querySelectorAll('[data-clnk-viaja]').length : 0,
                  svg: !!document.getElementById('clnk-tanda-svg') };

  /* ── (2) EL CONTADOR SUBE en el sondeo siguiente, sin reiniciar el dibujo ── */
  const svg1 = document.getElementById('clnk-tanda-svg');
  await CTRL({ escena: 'tandaTres' });
  await _clnkSondear(true);
  await esp(900);
  o.subio = { n: cont(), mismoSvg: document.getElementById('clnk-tanda-svg') === svg1,
              titulo: tit(), botonesOff: botones().every(b => b.off) };

  /* ── (3) LA TANDA CIERRA: «Listo» y los botones se prenden ──────────────── */
  await CTRL({ escena: 'tandaCerrada' });
  await _clnkSondear(true);
  await esp(2200);
  o.cerro = { abierto: abierto(), titulo: tit(), n: cont(), estado: estado(),
              botones: botones(), cadencia: clnkSondeoMs(),
              quietos: (() => {
                const l = cuerpo() ? cuerpo().querySelectorAll('[data-clnk-viaja]') : [];
                return l.length > 0 && Array.prototype.every.call(l,
                  r => r.getAttribute('data-clnk-quieto') === '1' &&
                       getComputedStyle(r).animationName === 'none');
              })(),
              nViajan: cuerpo() ? cuerpo().querySelectorAll('[data-clnk-viaja]').length : 0 };
  clnkAvisoCerrar();

  /* ── (4) LA ✕ CON LA TANDA ABIERTA: no se reabre sola ───────────────────── */
  await CTRL({ escena: 'vacio' });
  await _clnkSondear(true); await esp(500);
  await CTRL({ escena: 'tandaDos' });
  await _clnkSondear(true); await esp(900);
  o.equis = { abrioPrimero: abierto() };
  clnkAvisoCerrar();
  o.equis.marcaPuesta = window._clnkTandaCerradaPorMedico === true;
  await _clnkSondear(true); await esp(900);
  o.equis.reabrio = abierto();
  o.equis.tandaSigueAbierta = (await (await fetch(window.__P6_BASE + '/v1/estado')).json()).tanda_abierta;

  /* ── (5) CONTROL NEGATIVO: contra un puente 1.3.0 no hay cartel de tanda ── */
  await CTRL({ version: '1.3.0', escena: 'tandaTres' });
  window._clnkTandaCerradaPorMedico = false;
  window._clnkTanda = null;
  const st13 = await (await fetch(window.__P6_BASE + '/v1/estado')).json();
  o.puente13 = { tieneCampos: ('tanda_abierta' in st13),
                 tandaDe: clnkTandaDe(st13),
                 cadencia: clnkSondeoMs() };
  await CTRL({ version: '1.4.0' });

  /* ── (6) LA CADENCIA: el temporizador cambia de periodo y no se duplica ── */
  await CTRL({ reset: true, equipos: 1, escena: 'vacio' });
  window._clnkTanda = null; clnkSondeoSync();
  o.cad = { sinTanda: clnkSondeoMs(), puesto: window._clnkSondeoMsPuesto };
  window._clnkTanda = { abierta: true, n: 1 };
  clnkSondeoSync();
  o.cad.conTanda = window._clnkSondeoMsPuesto;
  const t1 = window._clnkSondeoTimer;
  clnkSondeoSync(); clnkSondeoSync();
  o.cad.idempotente = (window._clnkSondeoTimer === t1);
  window._clnkTanda = null; clnkSondeoSync();
  o.cad.vuelve = window._clnkSondeoMsPuesto;
  return o;
})()
