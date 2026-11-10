#!/usr/bin/env node
/**
 * _probe_pant30img.mjs - «Guardar en Imagenes» de los documentos del Informe (PANT-30, commit 3).
 * Mide el ciclo COMPLETO sobre un estudio GUARDADO de verdad, que es la unica forma de que
 * haya uuid: guardar -> reabrir -> actualizar (volver a guardar reemplaza) -> quitar.
 * ⚠️ DENOMINADOR: antes de contar esquemas se comprueba que el estudio tenga uuid y que Config
 *    tenga el guardado de imagenes prendido. Sin uuid, `esqGuardarDataURL` niega con su motivo y
 *    el registro queda en cero -- que es lo correcto y se lee igual que «no guardo nada».
 * ⚠️ Y SE COMPRUEBA QUE EL DOCUMENTO VAYA A `esqs` Y NO A `imgs`: una constancia dentro de
 *    `imgs` se imprimiria en la pagina «Imagenes del estudio» del informe FIRMADO.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p30cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3200 });
const R = { file: FILE };

R.prep = await S.ev(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  set('nombre', 'Prueba Ficticia, Ana'); set('ci', '1.234.567-8'); set('sexo', 'F');
  set('fecha', '2026-11-10'); set('cfg-med-lugar', 'Artigas');
  /* La casilla «Guardar imagenes con los estudios» de Config: de fabrica esta APAGADA, asi que
     sin prenderla el guardado niega con su motivo y la prueba mediria la compuerta y no el ciclo. */
  try { localStorage.setItem('cfg-guardar-imagenes', '1'); } catch (e) {}
  return { activo: (typeof imgGuardadoActivo === 'function') ? imgGuardadoActivo() : null };
});

R.guardaEstudio = await S.ev(async () => {
  if (typeof guardarInforme !== 'function') return { fn: false };
  /* ⚠️ HAY QUE INTERCEPTAR mostrarCardSeveridadValvular Y NO PONER valvSevConfirmada EN window.
     Esa bandera es un let de nivel superior: asignarla en window no hace nada y guardarInforme
     devuelve false SIN UN SOLO TOAST -- la primera corrida de esta sonda dio cero informes, cero
     avisos y uuid vacio, que se lee igual que «el guardado esta roto». La trampa esta escrita en
     test_clinico.mjs, en la ficha de TC-535. */
  const prev = window.mostrarCardSeveridadValvular;
  let cardPedida = false;
  window.mostrarCardSeveridadValvular = function (cb) { cardPedida = true; if (cb) cb(); };
  try { guardarInforme(); } catch (e) { return { fn: true, error: String(e).slice(0, 120) }; }
  await new Promise(r => setTimeout(r, 2600));
  window.mostrarCardSeveridadValvular = prev;
  return { fn: true, cardPedida: cardPedida,
           uuid: (typeof _imgUuidActual !== 'undefined') ? String(_imgUuidActual || '') : null,
           nInformes: (typeof getInformes === 'function') ? (getInformes() || []).length : null };
});

R.ciclo = await S.ev(async () => {
  const o = {};
  const uuid = (typeof _imgUuidActual !== 'undefined') ? _imgUuidActual : null;
  o.uuid = !!uuid;
  if (!uuid) return o;
  if (window.showTab) showTab('informe');
  window.docAbrir('constancia');
  o.quitarOcultoAlAbrir = !!document.getElementById('doc-quitar').hidden;
  /* (1) guardar */
  window.docGuardarImagen();
  await new Promise(r => setTimeout(r, 3500));
  o.estadoTrasGuardar = document.getElementById('doc-estado').textContent;
  const es1 = await CeiboImg.esquemas(uuid);
  const mio1 = (es1 || []).filter(e => e && e.clave === 'doc-constancia');
  o.esqs = (es1 || []).length;
  o.mios = mio1.length;
  o.nombre = mio1.length ? mio1[0].nombre : null;
  o.tieneDataURL = mio1.length ? String(mio1[0].dataURL || '').slice(0, 11) : null;
  o.bytes = mio1.length ? String(mio1[0].dataURL || '').length : 0;
  /* ⚠️ NO entra a `imgs`, que es lo que el PDF del informe imprime. */
  const slots = await CeiboImg.leer(uuid);
  o.imgsConDoc = (slots || []).filter(x => x && String(x.nombre || '').indexOf('Constancia') > -1).length;
  o.imgsTotal = (slots || []).length;
  o.quitarVisibleTrasGuardar = !document.getElementById('doc-quitar').hidden;
  /* (2) actualizar: volver a guardar REEMPLAZA, no agrega */
  window.docGuardarImagen();
  await new Promise(r => setTimeout(r, 3500));
  const es2 = await CeiboImg.esquemas(uuid);
  o.miosTrasReguardar = (es2 || []).filter(e => e && e.clave === 'doc-constancia').length;
  o.esqsTrasReguardar = (es2 || []).length;
  /* (3) reabrir: el boton de quitar tiene que aparecer solo */
  window.docCerrar();
  window.docAbrir('constancia');
  await new Promise(r => setTimeout(r, 900));
  o.quitarVisibleAlReabrir = !document.getElementById('doc-quitar').hidden;
  /* (4) quitar */
  window.docQuitarImagen();
  await new Promise(r => setTimeout(r, 1500));
  o.estadoTrasQuitar = document.getElementById('doc-estado').textContent;
  const es3 = await CeiboImg.esquemas(uuid);
  o.miosTrasQuitar = (es3 || []).filter(e => e && e.clave === 'doc-constancia').length;
  o.quitarOcultoTrasQuitar = !!document.getElementById('doc-quitar').hidden;
  /* (5) CONTROL NEGATIVO: quitar de nuevo no puede decir que quito algo */
  window.docQuitarImagen();
  await new Promise(r => setTimeout(r, 1200));
  o.estadoSegundoQuitar = document.getElementById('doc-estado').textContent;
  return o;
});

R.errores = S.errs;
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
