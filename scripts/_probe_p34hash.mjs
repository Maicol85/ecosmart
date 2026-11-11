#!/usr/bin/env node
/* _probe_p34hash.mjs - PANT-34. Mide si el dibujo del 3D es IDEMPOTENTE: el mismo hash del
   lienzo repintando dos veces sin tocar nada, y tras un viaje de ida y vuelta por el selector de
   arteria. Corre contra el arbol que se le pase, para separar lo preexistente de lo propio. */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3600 });
await S.entrar();
await S.viewport(1440, 980);
const o = await S.ev(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } };
  try { showTab('contractilidad'); } catch (e) {}
  set('ddvi', '52'); set('vdfvi', '110'); set('vsfvi', '45');
  if (typeof lv3dToggle === 'function') lv3dToggle();
  const cv = document.getElementById('lv3d-canvas'), ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const hash = () => { const d = ctx.getImageData(0, 0, Math.round(680 * dpr), Math.round(380 * dpr)).data;
    let h = 2166136261; for (let i = 0; i < d.length; i += 4) { h ^= d[i] + d[i + 1] * 3 + d[i + 2] * 7 + d[i + 3] * 11; h = (h * 16777619) >>> 0 } return h.toString(16) };
  const pintar = () => { _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar() };
  const r = {};
  pintar(); r.h1 = hash();
  pintar(); r.h2 = hash();
  r.h3 = hash();
  r.idempotenteSinTocarNada = (r.h1 === r.h2) && (r.h2 === r.h3);
  r.hashSinLeer = hash() === hash();
  /* Con «Coronarias» prendido y apagado. */
  const cb = document.querySelector('.lv3d-coro-btn');
  pintar(); const apagado1 = hash();
  cb.click(); pintar(); const prendido = hash();
  cb.click(); pintar(); const apagado2 = hash();
  r.cicloCoro = { apagado1: apagado1, prendido: prendido, apagado2: apagado2,
                  vuelveIgual: apagado1 === apagado2, prendidoDistinto: apagado1 !== prendido };
  /* ⚠️ Y LO MISMO TRAS UN CAMBIO MASIVO DE CONTRACTILIDAD, que es la escena en la que el gris se
     enciende: si dos repintados seguidos con el MISMO estado no dan el mismo hash, comparar
     hashes no es un instrumento valido en esa escena. Se mide en los dos arboles. */
  Object.keys(CONTR_TERRITORIO).forEach(id => { try { contrSetSegmento(id, 1) } catch (e) {} });
  pintar(); const g1 = hash();
  pintar(); const g2 = hash();
  pintar(); const g3 = hash();
  r.trasContractilidad = { g1: g1, g2: g2, g3: g3, idempotente: (g1 === g2) && (g2 === g3) };
  Object.keys(CONTR_TERRITORIO).forEach(id => { try { contrSetSegmento(id, 0) } catch (e) {} });
  /* El selector de arteria, si existe. */
  const ab = document.querySelector('.lv3d-coro-art-btn');
  if (ab) {
    cb.click();
    const elegir = (a) => { ab.click(); document.querySelector('.lv3d-coro-a[data-a="' + a + '"]').click(); pintar() };
    elegir('todas'); const t1 = hash();
    elegir('izq'); const i1 = hash();
    elegir('der'); const d1 = hash();
    elegir('todas'); const t2 = hash();
    elegir('izq'); const i2 = hash();
    r.selector = { t1: t1, i1: i1, d1: d1, t2: t2, i2: i2,
                   todasVuelveIgual: t1 === t2, izqVuelveIgual: i1 === i2,
                   tresDistintos: new Set([t1, i1, d1]).size === 3 };
  } else { r.selector = 'NO EXISTE EN ESTE ARBOL' }
  return r;
});
console.log(JSON.stringify(o, null, 1));
S.cerrar();
