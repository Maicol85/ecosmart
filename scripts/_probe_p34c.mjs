#!/usr/bin/env node
/* _probe_p34c.mjs - PANT-34, parte C. Mide el selector de arteria: sus tres opciones en las TRES
   dominancias (que arterias quedan, con sus letras), que lo que no se dibuja desaparece COMPLETO
   -trazo, letra y tramo gris-, que NO toca la contractilidad ni el texto de hallazgos ni el
   bloque de arterias involucradas, que tocar un territorio no lo mueve, que sobrevive al cambio
   de vista y de dominancia, y que apagar «Coronarias» lo devuelve a «Todas».
   Mide ademas la fila de los dos desplegables en cinco anchos. */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3600 });
const out = {};
await S.entrar();
await S.viewport(1440, 980);

out.escena = await S.ev(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } };
  try { showTab('contractilidad'); } catch (e) {}
  set('ddvi', '52'); set('vdfvi', '110'); set('vsfvi', '45');
  if (typeof lv3dToggle === 'function') lv3dToggle();
  const cb = document.querySelector('.lv3d-coro-btn'); if (cb) cb.click();
  _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar();
  return { abierto: !!lv3dDiag().abierto, coro: lv3dCoroDiag().coro, art: lv3dCoroDiag().art };
});

/* (C2) y (C3): que arterias quedan en cada combinacion de dominancia y lado. */
out.matriz = await S.ev(() => {
  const r = {};
  const elegir = (a) => { document.querySelector('.lv3d-coro-art-btn').click();
    document.querySelector('.lv3d-coro-a[data-a="' + a + '"]').click(); };
  const leer = () => {
    const s = window.lv3dCoroSonda(0);
    const grupos = s.arterias.reduce((o, a) => { o[a.g] = (o[a.g] || 0) + 1; return o }, {});
    return { n: s.arterias.length, letras: s.letras.slice().sort().join(','),
             grupos: grupos, segs: s.segs, eff: JSON.stringify(s.eff) };
  };
  [0, 1, 2].forEach(d => {
    document.querySelector('.lv3d-coro-dom[data-d="' + d + '"]').click();
    ['todas', 'izq', 'der'].forEach(a => { elegir(a); r['dom' + d + '_' + a] = leer() });
  });
  document.querySelector('.lv3d-coro-dom[data-d="0"]').click();
  elegir('todas');
  return r;
});

/* (C3) la LETRA y el TRAMO GRIS se van con la arteria: medido con un territorio alterado, que es
   lo que enciende el gris. Y por pixeles, que es lo que ve el medico. */
out.letrasYGris = await S.ev(() => {
  const r = {};
  const elegir = (a) => { document.querySelector('.lv3d-coro-art-btn').click();
    document.querySelector('.lv3d-coro-a[data-a="' + a + '"]').click();
    _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar(); };
  /* Alterar segmentos para que haya tramo gris en los TRES grupos.
     ⚠️ `contrEstado` ARRANCA VACIO: recorrerlo no devuelve un solo segmento y el gris nunca se
        enciende -- denominador vacio que se lee igual que «el gris no existe». Los ids salen de
        `CONTR_TERRITORIO`, que es el duenio del reparto. */
  const ids = Object.keys(CONTR_TERRITORIO);
  r.nIds = ids.length;
  ids.forEach(id => { try { contrSetSegmento(id, 1) } catch (e) { r.errSet = String(e) } });
  r.alterados = ids.filter(id => String(contrEstado[id]) === '1').length;
  r.effTrasAlterar = JSON.stringify(contrArteriasDatos().por.DA ? {
    DA: contrArteriasDatos().por.DA.niv, Cx: contrArteriasDatos().por.Cx ? contrArteriasDatos().por.Cx.niv : null,
    CD: contrArteriasDatos().por.CD ? contrArteriasDatos().por.CD.niv : null } : null);
  elegir('todas');
  const todas = window.lv3dCoroSonda(0);
  r.todas = { letras: todas.letras.slice().sort().join(','), segs: todas.segs, eff: JSON.stringify(todas.eff) };
  elegir('izq');
  const izq = window.lv3dCoroSonda(0);
  r.izq = { letras: izq.letras.slice().sort().join(','), segs: izq.segs, eff: JSON.stringify(izq.eff) };
  elegir('der');
  const der = window.lv3dCoroSonda(0);
  r.der = { letras: der.letras.slice().sort().join(','), segs: der.segs, eff: JSON.stringify(der.eff) };
  /* Letras dibujadas de verdad: con «Letras» prendido, el pintor las escribe; se mide por tinta
     en una banda del lienzo contra el mismo lado apagado. */
  elegir('todas');
  const cv = document.getElementById('lv3d-canvas'), ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const hash = () => { const d = ctx.getImageData(0, 0, Math.round(680 * dpr), Math.round(380 * dpr)).data;
    let h = 2166136261; for (let i = 0; i < d.length; i += 4) { h ^= d[i] + d[i + 1] * 3 + d[i + 2] * 7 + d[i + 3] * 11; h = (h * 16777619) >>> 0 } return h.toString(16) };
  r.hashTodas = hash(); elegir('izq'); r.hashIzq = hash(); elegir('der'); r.hashDer = hash();
  elegir('todas'); r.hashTodas2 = hash();
  r.vuelveIgual = r.hashTodas === r.hashTodas2;
  return r;
});

/* (C4) independencia del territorio y de la contractilidad. */
out.independencia = await S.ev(() => {
  const r = {};
  const elegir = (a) => { document.querySelector('.lv3d-coro-art-btn').click();
    document.querySelector('.lv3d-coro-a[data-a="' + a + '"]').click();
    _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar(); };
  const foto = () => ({
    estado: JSON.stringify(contrEstado),
    hallazgos: (document.getElementById('contr-texto-informe') || { textContent: '' }).textContent.trim(),
    leyenda: (document.getElementById('contr-leyenda') || { textContent: '' }).textContent.trim(),
    arterias: (document.getElementById('contr-arterias-li') || { textContent: '' }).textContent.trim(),
    modo: _lv3d.modo
  });
  elegir('todas'); const a0 = foto();
  elegir('izq'); const a1 = foto();
  elegir('der'); const a2 = foto();
  r.estadoIgual = (a0.estado === a1.estado) && (a1.estado === a2.estado);
  r.hallazgosIgual = (a0.hallazgos === a1.hallazgos) && (a1.hallazgos === a2.hallazgos);
  r.arteriasIgual = (a0.arterias === a1.arterias) && (a1.arterias === a2.arterias);
  r.leyendaIgual = (a0.leyenda === a1.leyenda) && (a1.leyenda === a2.leyenda);
  r.arteriasTxt = a0.arterias.slice(0, 90);
  r.hallazgosTxt = a0.hallazgos.slice(0, 90);
  /* Tocar un TERRITORIO no mueve el selector: se cambia un segmento por la via de la app. */
  const art0 = lv3dCoroDiag().art;
  const id = Object.keys(CONTR_TERRITORIO)[0];
  try { contrSetSegmento(id, 2) } catch (e) { r.errSeg = String(e) }
  r.selectorTrasTocarTerritorio = lv3dCoroDiag().art;
  r.selectorNoSeMovio = art0 === lv3dCoroDiag().art;
  /* Y el estado del segmento SI cambio, que es el denominador. */
  r.segmentoCambio = String(contrEstado[id]) === '2';
  return r;
});

/* (C5) sobrevive a la vista y a la dominancia; (A5) apagar lo reinicia. */
out.persistencia = await S.ev(() => {
  const r = {};
  document.querySelector('.lv3d-coro-art-btn').click();
  document.querySelector('.lv3d-coro-a[data-a="der"]').click();
  r.puesto = lv3dCoroDiag().art;
  document.querySelector('.lv3d-coro-vista-btn').click();
  document.querySelector('#lv3d-coro-lista .lv3d-coro-v[data-v="4"]').click();
  r.trasVista = lv3dCoroDiag().art;
  const n1 = window.lv3dCoroSonda(0).arterias.length;
  document.querySelector('.lv3d-coro-dom[data-d="2"]').click();
  r.trasDom = lv3dCoroDiag().art;
  const n2 = window.lv3dCoroSonda(0).arterias.length;
  r.dibujoCambioConLaDominancia = n1 !== n2;
  r.nDer_domDer = n1; r.nDer_domIzq = n2;
  document.querySelector('.lv3d-coro-btn').click();
  r.trasApagar = lv3dCoroDiag().art;
  r.domTrasApagar = lv3dCoroDiag().dom;
  /* Y el boton vuelve a su aspecto de omision. */
  const ab = document.querySelector('.lv3d-coro-art-btn');
  r.botonClase = ab ? ab.className : null;
  r.tituloBoton = ab ? ab.textContent.trim() : null;
  document.querySelector('.lv3d-coro-dom[data-d="0"]').click();
  return r;
});

/* La fila de los dos desplegables, en cinco anchos. */
out.anchos = {};
for (const w of [1440, 1280, 1000, 768, 390]) {
  await S.viewport(w, 900);
  await new Promise(r => setTimeout(r, 320));
  out.anchos[w] = await S.ev(() => {
    const cb = document.querySelector('.lv3d-coro-btn');
    if (!lv3dCoroDiag().coro) cb.click();
    const pan = document.getElementById('lv3d-coro-panel');
    const caja = document.getElementById('lv3d-coro-caja');
    const vb = panel0('.lv3d-coro-vista-btn'), ab = panel0('.lv3d-coro-art-btn');
    function panel0(sel){ const b = document.querySelector(sel); const r = b.getBoundingClientRect();
      return { t: b.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y),
               w: Math.round(r.width), h: Math.round(r.height) } }
    const bs = Array.prototype.map.call(pan.querySelectorAll('button'), b => {
      const r = b.getBoundingClientRect();
      return { t: b.textContent.trim().slice(0, 20), w: Math.round(r.width), h: Math.round(r.height) };
    }).filter(b => b.h > 0);
    /* La lista de arteria abierta: que entre en la pantalla. */
    document.querySelector('.lv3d-coro-art-btn').click();
    const la = document.getElementById('lv3d-coro-lista-art').getBoundingClientRect();
    const dentro = la.left >= 0 && la.right <= window.innerWidth;
    document.querySelector('.lv3d-coro-art-btn').click();
    return { filas: pan.children.length, vista: vb, arteria: ab,
             mismaFila: Math.abs(vb.y - ab.y) < 4,
             botonesVisibles: bs.length, bajo44: bs.filter(b => b.h < 44).length,
             listaDentro: dentro,
             scrollH: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
}
out.errores = S.errores ? S.errores() : null;
console.log(JSON.stringify(out, null, 1));
S.cerrar();
