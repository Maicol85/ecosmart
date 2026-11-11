#!/usr/bin/env node
/**
 * _probe_p36fichas.mjs - PANT-36 (2026-11-11). Un arbol (--file), para A/B.
 * Vuelca el texto de TODAS las entradas de Referencias -- cada una ABIERTA y con su subpestania
 * ACTIVA -- mas el clon del globo ⓘ `otr-rac`, para comparar carácter por carácter contra la
 * linea base y probar que ninguna otra ficha se movio.
 * ⚠️ HAY QUE ABRIR CADA UNA: cerrada, el `textContent` es el mismo, pero `evRefPintar` sólo
 * pinta las fichas de su subpestania AL ABRIRLA, asi que sin activar los nueve paneles varias
 * salen vacias y la comparacion se hace sobre nada.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
await S.viewport(1440, 900);
await S.ev(() => { if (window.showTab) showTab('refs'); });
await S.esperar(500);
for (const sub of ['calc', 'dim', 'fun', 'valv', 'ao', 'congenitas', 'cardiotox', 'hemo', 'otros']) {
  await S.ev((k) => { if (typeof refSubTab === 'function') refSubTab(k); }, sub);
  await S.esperar(260);
  await S.ev(() => {
    const t = document.getElementById('tab-refs');
    [].slice.call(t.querySelectorAll('h2.card-head')).forEach(h => {
      const oc = h.getAttribute('onclick') || '';
      const a = oc.indexOf("toggleRef('"); if (a < 0) return;
      const b = oc.indexOf("'", a + 11); const id = oc.slice(a + 11, b);
      const d = document.getElementById('ref-' + id);
      if (d && getComputedStyle(d).display === 'none') { try { toggleRef(id, h) } catch (e) {} }
    });
  });
  await S.esperar(260);
}
R.fichas = await S.ev(() => {
  const N = s => String(s || '').replace(/\s+/g, ' ').trim();
  const t = document.getElementById('tab-refs');
  const o = {};
  [].slice.call(t.querySelectorAll('h2.card-head')).forEach(h => {
    const oc = h.getAttribute('onclick') || '';
    const a = oc.indexOf("toggleRef('"); if (a < 0) return;
    const b = oc.indexOf("'", a + 11); const id = oc.slice(a + 11, b);
    const d = document.getElementById('ref-' + id);
    o['ref-' + id] = { titulo: N(h.textContent).replace(/[▶▼]/g, '').trim(),
                       chars: d ? N(d.textContent).length : -1,
                       txt: d ? N(d.textContent) : null };
  });
  let clon = -1;
  try { const w = _otrRefClon('ref-coronarias'); clon = N(w.textContent).length; } catch (e) { clon = 'EXC' }
  let clonTxt = null;
  try { const w = _otrRefClon('ref-coronarias'); clonTxt = N(w.textContent); } catch (e) {}
  return { entradas: o, clonOtrRac: clon, clonTexto: clonTxt };
});
R.errs = S.errs.slice(0, 6);
console.log(JSON.stringify(R));
S.cerrar();
