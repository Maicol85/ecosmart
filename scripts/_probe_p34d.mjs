#!/usr/bin/env node
/* _probe_p34d.mjs - PANT-34, parte D. SOLO MEDICION: ¿la captura del 3D -la misma que va al PDF-
   incluye el rotulo de la vista y respeta el selector de arteria? No cambia nada del
   comportamiento de la captura. Se mide sobre el PNG de verdad, leyendo sus pixeles.
   Tres cosas: que el rotulo este en el PNG, que no tape nada -el rincon estaba vacio- y que el
   PNG cambie con el selector. */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3600 });
await S.entrar();
await S.viewport(1440, 980);
const o = await S.ev(async () => {
  const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } };
  try { showTab('contractilidad') } catch (e) {}
  set('ddvi', '52'); set('vdfvi', '110');
  if (typeof lv3dToggle === 'function') lv3dToggle();
  const r = {};
  /* Lee el PNG de la captura y devuelve su tamanio, su hash y la tinta de dos rincones de la
     banda del modelo: el de la brujula y el del rotulo. El fondo del PNG es BLANCO opaco
     (LV3D_CAP_PAL), asi que «tinta» es «no blanco». */
  /* ⚠️ LA ANIMACION SE PAUSA ANTES DE CADA CAPTURA, y esta medido por que: sin pausarla, entre
     dos capturas corren cuadros de rAF -la lectura del PNG es asincrona- y el PNG sale con otra
     fase del latido. La primera version de esta sonda dio seis hashes distintos y parecia que el
     selector no volvia a su dibujo; lo que se movia era el corazon. */
  const pausar = () => { _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar() };
  const leer = async () => {
    const u = _lv3d.cap ? _lv3d.cap.url : null;
    if (!u) return null;
    const im = new Image();
    await new Promise((res, rej) => { im.onload = res; im.onerror = rej; im.src = u });
    const c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    const cx = c.getContext('2d');
    cx.drawImage(im, 0, 0);
    const k = im.width/680;                      // la escala de la captura
    const tinta = (x0, y0, x1, y1) => {
      const d = cx.getImageData(Math.round(x0*k), Math.round(y0*k),
                                Math.round((x1-x0)*k), Math.round((y1-y0)*k)).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] < 245 || d[i+1] < 245 || d[i+2] < 245) n++;
      return n;
    };
    const d = cx.getImageData(0, 0, c.width, c.height).data;
    let h = 2166136261;
    for (let i = 0; i < d.length; i += 4){ h ^= d[i] + d[i+1]*3 + d[i+2]*7; h = (h*16777619) >>> 0 }
    return { w: im.width, h: im.height, esc: k, hash: h.toString(16),
             rotulo: tinta(520, 310, 676, 350), brujula: tinta(10, 290, 110, 375),
             bandaDelPie: tinta(0, 386, 680, 400) };
  };
  /* 1. Con «Coronarias» APAGADO. */
  pausar(); lv3dCapturar(); r.apagado = await leer();
  /* 2. Prendido, sin vista. */
  document.querySelector('.lv3d-coro-btn').click();
  pausar(); lv3dCapturar(); r.sinVista = await leer();
  /* 3. Con la vista «Lateral» puesta. */
  document.querySelector('.lv3d-coro-vista-btn').click();
  document.querySelector('#lv3d-coro-lista .lv3d-coro-v[data-v="7"]').click();
  pausar(); lv3dCapturar(); r.conVista = await leer();
  /* 4. Con el selector en «Derecha». */
  document.querySelector('.lv3d-coro-art-btn').click();
  document.querySelector('.lv3d-coro-a[data-a="der"]').click();
  pausar(); lv3dCapturar(); r.conVistaYDerecha = await leer();
  /* 5. Y en «Izquierda». */
  document.querySelector('.lv3d-coro-art-btn').click();
  document.querySelector('.lv3d-coro-a[data-a="izq"]').click();
  pausar(); lv3dCapturar(); r.conVistaYIzquierda = await leer();
  /* 6. De vuelta a «Todas»: el PNG tiene que volver al de (3). */
  document.querySelector('.lv3d-coro-art-btn').click();
  document.querySelector('.lv3d-coro-a[data-a="todas"]').click();
  pausar(); lv3dCapturar(); r.vuelta = await leer();
  r.cap = _lv3d.cap ? { fase: _lv3d.cap.fase, tiene: !!_lv3d.cap.url } : null;
  /* ¿La captura va al PDF? Se mira quien lee `_lv3d.cap`. */
  r.toggleEnPDF = !!document.querySelector('.lv3d-cap-tomar');
  return r;
});
console.log(JSON.stringify(o, null, 1));
S.cerrar();
