#!/usr/bin/env node
/* _probe_p34txt.mjs - PANT-34, parte C. Mide si el texto de los DOS botones de la primera fila
   entra en su caja a 73 px de ancho, que es lo que miden a 1000, 1280 y 1440 px: alto de
   desplazamiento contra alto de cliente, y si el panel desborda. */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3600 });
await S.entrar();
const out = {};
for (const w of [1440, 1280, 1000, 768, 390]) {
  await S.viewport(w, 900);
  await new Promise(r => setTimeout(r, 300));
  out[w] = await S.ev(() => {
    const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v;
      e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } };
    try { showTab('contractilidad'); } catch (e) {}
    set('ddvi', '52'); set('vdfvi', '110');
    if (!lv3dDiag().abierto && typeof lv3dToggle === 'function') lv3dToggle();
    if (!lv3dCoroDiag().coro) document.querySelector('.lv3d-coro-btn').click();
    const med = (sel) => { const b = document.querySelector(sel);
      const r = b.getBoundingClientRect();
      return { t: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height),
               sh: b.scrollHeight, ch: b.clientHeight, sw: b.scrollWidth, cw: b.clientWidth,
               recortado: b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1 } };
    const pan = document.getElementById('lv3d-coro-panel');
    const col = document.getElementById('lv3d-col-der');
    return { vista: med('.lv3d-coro-vista-btn'), arteria: med('.lv3d-coro-art-btn'),
             panelW: Math.round(pan.getBoundingClientRect().width),
             colW: Math.round(col.getBoundingClientRect().width),
             desbordaPanel: pan.scrollWidth > pan.clientWidth + 1,
             scrollH: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
}
console.log(JSON.stringify(out, null, 1));
S.cerrar();
