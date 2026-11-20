/* Cuerpo de _probe_p6b.mjs — bloque B. Aparte, por la leccion de MEDIR-4b. */
(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = {};
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display = 'none';
  window.__clnkBaseTest = window.__P6_BASE;
  window.toast = function () {}; window.alert = function () {}; window.confirm = function () { return true; };
  const CTRL = async b => (await fetch(window.__P6_BASE + '/_control',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })).json();
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

  const B = () => document.getElementById('clnk-burbuja');
  const bVis = () => { const b = B(); return !!(b && b.style.display !== 'none' && b.offsetWidth > 0); };
  const bTxt = () => { const b = B(); return b ? String(b.textContent || '').replace(/\s+/g, ' ').trim() : ''; };
  const bN = () => { const b = B(); const n = b && b.querySelector('[data-clnk-bur-n]'); return n ? String(n.textContent) : ''; };
  const abierto = () => { const v = document.getElementById('clnkav-ov'); return !!(v && v.style.display !== 'none'); };

  /* ── (1) LA EQUIS CON LA TANDA ABIERTA DEJA LA BURBUJA ──────────────────── */
  await CTRL({ escena: 'tandaDos' });
  await _clnkSondear(true); await esp(800);
  o.paso1 = { cartelAbrio: abierto(), burbujaAntes: bVis() };
  clnkAvisoCerrar();
  await esp(200);
  o.paso1.burbujaTras = bVis();
  o.paso1.n = bN();
  o.paso1.txt = bTxt();
  o.paso1.late = !!(B() && B().classList.contains('clnk-late'));
  o.paso1.viajan = B() ? B().querySelectorAll('[data-clnk-viaja]').length : 0;
  o.paso1.esBoton = !!(B() && B().tagName === 'BUTTON');
  o.paso1.capa = B() ? getComputedStyle(B()).zIndex : '';

  /* ── (2) EL NUMERO SUBE EN LA BURBUJA, Y EL CARTEL NO VUELVE ────────────── */
  await CTRL({ escena: 'tandaTres' });
  await _clnkSondear(true); await esp(800);
  o.paso2 = { n: bN(), cartel: abierto(), burbuja: bVis(), late: !!(B() && B().classList.contains('clnk-late')) };

  /* ── (3) LA TANDA CIERRA: dice «Llegaron N» y LATE, sin reabrir el cartel ─ */
  await CTRL({ escena: 'tandaCerrada' });
  await _clnkSondear(true); await esp(1600);
  o.paso3 = { txt: bTxt(), n: bN(), late: !!(B() && B().classList.contains('clnk-late')),
              cartel: abierto(), burbuja: bVis(),
              quietos: (() => {
                const l = B() ? B().querySelectorAll('[data-clnk-viaja]') : [];
                return l.length > 0 && Array.prototype.every.call(l, r => r.getAttribute('data-clnk-quieto') === '1');
              })(),
              ciclo: B() ? getComputedStyle(B()).animationDuration : '' };

  /* ── (4) NO SE REABRE SOLA, en tres turnos mas ──────────────────────────── */
  await _clnkSondear(true); await esp(400);
  await _clnkSondear(true); await esp(400);
  await _clnkSondear(true); await esp(400);
  o.paso4 = { cartel: abierto(), burbuja: bVis(), late: !!(B() && B().classList.contains('clnk-late')) };

  /* ── (5) EL CLIC ABRE EL CARTEL GRANDE ─────────────────────────────────── */
  B().click();
  await esp(1800);
  o.paso5 = { cartel: abierto(), burbuja: bVis(),
              titulo: String((document.getElementById('clnkav-title') || {}).textContent || ''),
              marca: window._clnkTandaCerradaPorMedico };
  clnkAvisoCerrar();
  clnkBurbujaOcultar();

  /* ── (6) NO TAPA NINGUN BOTON, EN CINCO ANCHOS ─────────────────────────── */
  o.tapa = {};
  for (const w of [1440, 1280, 1000, 768, 390]) {
    window.__P6_RESIZE && (await window.__P6_RESIZE(w));
    await esp(450);
    clnkBurbuja(7, true);
    await esp(250);
    /* AL FINAL DEL DOCUMENTO, que es donde la reserva de alto tiene que morder: un elemento
       fijo tapa lo que le toque en cualquier otro desplazamiento, y lo que se puede garantizar
       es que el final del documento quede POR ENCIMA de la burbuja. */
    window.scrollTo(0, document.documentElement.scrollHeight);
    await esp(300);
    const b = B();
    const rb = b.getBoundingClientRect();
    const dentro = rb.left >= 0 && rb.top >= 0 && rb.right <= window.innerWidth + 0.6 &&
                   rb.bottom <= window.innerHeight + 0.6;
    let tapados = [];
    Array.prototype.forEach.call(document.querySelectorAll('button, [role=button], .btn, a[href], summary, input, select'), el => {
      if (el === b || b.contains(el)) return;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) return;
      const t = document.elementFromPoint(cx, cy);
      if (t && (t === b || b.contains(t))) {
        tapados.push((el.id || el.tagName.toLowerCase()) + ':' + String(el.textContent || '').trim().slice(0, 18));
      }
    });
    o.tapa[w] = { x: Math.round(rb.left), y: Math.round(rb.top), w: Math.round(rb.width),
                  h: Math.round(rb.height), dentro: dentro, tapados: tapados.length,
                  quienes: tapados.slice(0, 5),
                  pad: document.body.style.paddingBottom,
                  scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth };
    clnkBurbujaOcultar();
    await esp(150);
    o.tapa[w].padRepuesto = document.body.style.paddingBottom;
    window.scrollTo(0, 0);
  }
  window.__P6_RESIZE && (await window.__P6_RESIZE(1280));

  /* ── (7) APAGAR EL MODULO SE LLEVA LA BURBUJA ──────────────────────────── */
  clnkBurbuja(3, true);
  o.paso7 = { antes: bVis() };
  clnkToggle(false);
  o.paso7.tras = bVis();
  o.paso7.marca = window._clnkTandaCerradaPorMedico;
  clnkToggle(true);
  return o;
})()
