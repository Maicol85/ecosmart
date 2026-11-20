/* Cuerpo de _probe_p6b0.mjs — bloque B, medicion previa: que hay HOY en el rincon de abajo a la
   derecha, para que la burbuja no tape un boton. Solo lee. */
(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = { anchos: {} };
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display = 'none';
  window.toast = function () {};
  /* Se recorren las pestanias principales: un boton flotante puede vivir en una sola. */
  o.tabs = [];
  const bt = [].slice.call(document.querySelectorAll('[onclick*="showTab("]'));
  bt.forEach(b => {
    const m = String(b.getAttribute('onclick') || '').match(/showTab\('([a-z0-9_-]+)'/);
    if (m && o.tabs.indexOf(m[1]) < 0) o.tabs.push(m[1]);
  });
  for (const tb of o.tabs) {
    try { showTab(tb); } catch (e) {}
    await esp(160);
  }
  try { showTab(o.tabs[0] || 'informe'); } catch (e) {}
  await esp(300);
  const W = window.innerWidth, H = window.innerHeight;
  /* Todo lo FIJO o PEGAJOSO del documento, con su caja y su capa. */
  const fijos = [];
  Array.prototype.forEach.call(document.querySelectorAll('*'), el => {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' && cs.position !== 'sticky') return;
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    fijos.push({ tag: el.tagName.toLowerCase(), id: el.id || '',
                 cls: String(el.className || '').slice(0, 40),
                 pos: cs.position, z: cs.zIndex,
                 x: Math.round(r.left), y: Math.round(r.top),
                 w: Math.round(r.width), h: Math.round(r.height),
                 derAbajo: (r.right > W - 170 && r.bottom > H - 170) });
  });
  o.fijos = fijos;
  o.viewport = { W: W, H: H };
  /* Y los botones VISIBLES cuyo centro cae en el rincon de 170x170 de abajo a la derecha. */
  const enRincon = [];
  Array.prototype.forEach.call(document.querySelectorAll('button, [role=button], .btn, a[href]'), el => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cx > W - 170 && cy > H - 170) {
      enRincon.push({ tag: el.tagName.toLowerCase(), id: el.id || '',
                      txt: String(el.textContent || '').trim().slice(0, 28),
                      x: Math.round(r.left), y: Math.round(r.top),
                      w: Math.round(r.width), h: Math.round(r.height) });
    }
  });
  o.botonesEnRincon = enRincon;
  /* Las capas mas altas del documento, para elegir la de la burbuja sin moverle la capa a nadie. */
  const capas = {};
  Array.prototype.forEach.call(document.querySelectorAll('*'), el => {
    const z = getComputedStyle(el).zIndex;
    if (z === 'auto' || !z) return;
    const n = Number(z);
    if (!isFinite(n) || n < 100) return;
    capas[n] = (capas[n] || 0) + 1;
  });
  o.capas = Object.keys(capas).map(Number).sort((a, b) => a - b)
               .map(n => n + ' x' + capas[n]);
  return o;
})()
