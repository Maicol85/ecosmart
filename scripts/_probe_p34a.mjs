#!/usr/bin/env node
/* _probe_p34a.mjs - PANT-34, parte A. Mide las NUEVE vistas, el titulo FIJO del boton, la tilde
   de la lista y el ROTULO dentro del cuadro: que aparece en el rincon derecho de abajo, que dice
   el nombre de la vista, que cambia al elegir otra, que desaparece al quitarla o al apagar
   «Coronarias», y que no escribe un solo grado. El rotulo se mide POR PIXELES en su rincon, con
   el control de que la brujula no se movio. */
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
  if (typeof lv3dPausar === 'function') lv3dPausar();
  _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar();
  return { abierto: !!lv3dDiag().abierto, coro: lv3dCoroDiag().coro };
});

out.A = await S.ev(() => {
  const r = {};
  const cv = document.getElementById('lv3d-canvas');
  const ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const tinta = (x0, y0, x1, y1) => {
    const d = ctx.getImageData(Math.round(x0 * dpr), Math.round(y0 * dpr),
                               Math.round((x1 - x0) * dpr), Math.round((y1 - y0) * dpr)).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++;
    return n;
  };
  const RINCON = [520, 310, 676, 350], BRUJULA = [10, 290, 110, 375];
  r.opciones = Array.prototype.map.call(document.querySelectorAll('#lv3d-coro-lista .lv3d-coro-v'),
    b => b.textContent.trim());
  r.nVistas = r.opciones.length;
  r.tabla = LV3D_CORO_VISTAS.map(v => v.n + ' ' + v.a + '/' + v.b);
  r.tituloSinVista = document.querySelector('.lv3d-coro-vista-btn').textContent.trim();
  r.rincónSinVista = tinta.apply(null, RINCON);
  r.brujulaSinVista = tinta.apply(null, BRUJULA);
  /* Cada vista: su matriz, su rotulo en pixeles, el titulo del boton y el texto de la opcion. */
  const vistas = [];
  for (let v = 0; v < r.nVistas; v++) {
    document.querySelector('.lv3d-coro-vista-btn').click();
    document.querySelector('#lv3d-coro-lista .lv3d-coro-v[data-v="' + v + '"]').click();
    _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar();
    const opciones = Array.prototype.map.call(document.querySelectorAll('#lv3d-coro-lista .lv3d-coro-v'),
      b => b.textContent.trim());
    vistas.push({
      v: v, nombre: LV3D_CORO_VISTAS[v].n,
      titulo: document.querySelector('.lv3d-coro-vista-btn').textContent.trim(),
      conTilde: opciones.filter(t => t.indexOf('✓') === 0),
      matriz: JSON.stringify(_lv3d.R.map(f => f.map(x => Math.round(x * 1000) / 1000))),
      rincon: tinta.apply(null, RINCON),
      brujula: tinta.apply(null, BRUJULA),
      diag: lv3dCoroDiag().vista
    });
  }
  r.vistas = vistas;
  r.matricesDistintas = new Set(vistas.map(v => v.matriz)).size;
  /* Quitar la vista: se vuelve a «ninguna» tocando la misma opcion (como hoy). */
  document.querySelector('.lv3d-coro-vista-btn').click();
  document.querySelector('#lv3d-coro-lista .lv3d-coro-v[data-v="8"]').click();
  _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar();
  r.trasElegirDeNuevo = { vista: lv3dCoroDiag().vista, rincon: tinta.apply(null, RINCON) };
  /* Soltar la vista con el gesto que ya existia: elegir una punta. */
  const bv = document.querySelector('.lv3d-vista'); if (bv) bv.click();
  _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar();
  r.trasSoltar = { vista: lv3dCoroDiag().vista, rincon: tinta.apply(null, RINCON) };
  /* Apagar «Coronarias». */
  document.querySelector('.lv3d-coro-vista-btn').click();
  document.querySelector('#lv3d-coro-lista .lv3d-coro-v[data-v="1"]').click();
  _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar();
  r.antesDeApagar = { vista: lv3dCoroDiag().vista, rincon: tinta.apply(null, RINCON) };
  document.querySelector('.lv3d-coro-btn').click();
  _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar();
  r.trasApagar = { vista: lv3dCoroDiag().vista, coro: lv3dCoroDiag().coro, rincon: tinta.apply(null, RINCON) };
  /* Un grado en pantalla? Censo del panel, del pie y del DOM visible del recuadro. */
  const pan = document.getElementById('lv3d-coro-panel');
  const pie = document.getElementById('lv3d-coro-pie');
  const txt = (pan ? pan.textContent : '') + ' ' + (pie ? pie.textContent : '');
  r.gradosEnPantalla = (txt.match(/\d+\s*(?:°|grados)/g) || []);
  return r;
});

/* El rotulo en modo angiografia y en tema oscuro: que siga teniendo tinta. */
out.angioYTema = {};
for (const tema of ['light', 'dark']) {
  await S.tema(tema);
  await new Promise(r => setTimeout(r, 260));
  out.angioYTema[tema] = await S.ev(() => {
    const cv = document.getElementById('lv3d-canvas');
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const tinta = () => { const d = ctx.getImageData(Math.round(520 * dpr), Math.round(310 * dpr),
      Math.round(156 * dpr), Math.round(40 * dpr)).data;
      let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++; return n };
    const cb = document.querySelector('.lv3d-coro-btn');
    if (!lv3dCoroDiag().coro) cb.click();
    _lv3d.pal = null;
    document.querySelector('.lv3d-coro-vista-btn').click();
    document.querySelector('#lv3d-coro-lista .lv3d-coro-v[data-v="7"]').click();
    _lv3d.corriendo = false; _lv3d.fase = 0; _lv3d.pal = lv3dPaleta(); lv3dDibujar();
    const normal = tinta();
    document.querySelector('.lv3d-coro-vista-btn').click();
    document.querySelector('#lv3d-coro-lista .lv3d-coro-angio').click();
    _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar();
    const angio = tinta();
    document.querySelector('.lv3d-coro-vista-btn').click();
    document.querySelector('#lv3d-coro-lista .lv3d-coro-angio').click();
    _lv3d.corriendo = false; _lv3d.fase = 0; lv3dDibujar();
    return { normal: normal, angio: angio, vista: lv3dCoroDiag().vista };
  });
}
out.errores = S.errores ? S.errores() : null;
console.log(JSON.stringify(out, null, 1));
S.cerrar();
