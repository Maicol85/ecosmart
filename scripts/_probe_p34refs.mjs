#!/usr/bin/env node
/* _probe_p34refs.mjs - PANT-34, parte B. Volcado de Referencias para compararlo CARACTER POR
   CARACTER entre dos arboles: el texto del globo otr-rac, el texto de cada ficha, el reparto de
   subpestanias, los encabezados con toggleRef y el indice del buscador. Se corre en los dos
   arboles y se comparan los dos volcados. */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3600 });
await S.entrar();
await S.viewport(1440, 980);
const o = await S.ev(() => {
  const norm = s => String(s == null ? '' : s).replace(/[\s ]+/g, ' ').trim();
  try { showTab('refs') } catch (e) {}
  const r = {};
  /* Todas las solapas, para que `evRefPintar` pinte lo que pinta al abrir cada una. */
  const solapas = Array.prototype.map.call(document.querySelectorAll('[id^="ref-subtab-"]'), b => b.id);
  solapas.forEach(id => { const b = document.getElementById(id); if (b) b.click() });
  r.solapas = solapas;
  /* Cada ficha: su id, su encabezado y su texto, con la ficha ABIERTA. */
  const fichas = {};
  Array.prototype.forEach.call(document.querySelectorAll('h2.card-head'), h => {
    const oc = h.getAttribute('onclick') || '';
    const m = oc.match(/toggleRef\('([^']+)'/);
    if (!m) return;
    const id = 'ref-' + m[1];
    const c = document.getElementById(id);
    if (!c) { fichas[id] = 'SIN CUERPO'; return }
    if (getComputedStyle(c).display === 'none') h.click();
    fichas[id] = { cab: norm(h.textContent), txt: norm(c.textContent) };
  });
  r.fichas = fichas;
  r.nFichas = Object.keys(fichas).length;
  r.reparto = (typeof REF_SUBTAB !== 'undefined')
    ? Object.keys(REF_SUBTAB).map(k => k + ':' + REF_SUBTAB[k].join(',')) : null;
  /* El globo otr-rac, por el clon. */
  try { r.clon = norm(window._otrRefClon('ref-coronarias').textContent) } catch (e) { r.clon = 'ERR ' + e }
  /* El indice del buscador: se arma con los encabezados, asi que se vuelca tal cual. */
  r.encabezados = Array.prototype.map.call(document.querySelectorAll('h2.card-head'),
    h => norm(h.textContent)).filter(t => t.length > 0);
  return r;
});
console.log(JSON.stringify(o, null, 1));
S.cerrar();
