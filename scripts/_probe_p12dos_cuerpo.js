/* Cuerpo de la sonda de dos motores de P12. En su propio archivo a proposito: asi los acentos
   graves son codigo y no cierran ningun template. */
(async () => {
  const o = { errFn: [] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  o.tema = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';

  /* EL DETECTOR DE QUE SON DOS ARBOLES: lo de P12 y no lo de P11. */
  o.tieneLoNuevo = (typeof window.avisoProp === 'function') &&
                   (typeof window.preguntaProp === 'function') &&
                   (typeof window.pedirProp === 'function') &&
                   (typeof window._clnkBorrarEnPuente === 'function') &&
                   (typeof window.MED_CAL_VEL_RECETA === 'string');

  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             x: Math.round(r.left), y: Math.round(r.top) }; };
  const dentro = c => !!(c && c.x >= 0 && c.y >= 0 &&
    c.x + c.w <= window.innerWidth + 1 && c.y + c.h <= window.innerHeight + 1);
  const limpiar = () => {
    ['[data-med-aviso="ov"]','[data-borr-conf]','[data-ped-prop="ov"]'].forEach(s => {
      document.querySelectorAll(s).forEach(n => { try { n.remove(); } catch (e) {} });
    });
  };

  /* ── 1 · LOS TRES PRIMITIVOS: geometria, piso tactil, foco y contraste ──────────────────── */
  const medirCartel = (sel, selBotones) => {
    const ov = document.querySelector(sel);
    if (!ov) return null;
    const bs = [].slice.call(ov.querySelectorAll('button'));
    const altos = bs.map(b => Math.round(b.getBoundingClientRect().height));
    const cajaC = caja(ov.firstElementChild);
    return { ov: caja(ov), tarjeta: cajaC, dentro: dentro(cajaC),
             nBotones: bs.length, altos: altos,
             bajoDe44: altos.filter(h => h < 44).length,
             rotulos: bs.map(b => String(b.textContent || '').trim()).slice(0, 4),
             enfocado: (document.activeElement && bs.indexOf(document.activeElement) >= 0)
                       ? String(document.activeElement.textContent || '').trim() : null,
             /* El texto entra por textContent, asi que no puede haber un elemento inyectado por
                un dato. Se cuenta: el cuerpo del cartel no tiene hijos de marcado propios. */
             cuerpoLargo: String(ov.textContent || '').length };
  };

  limpiar();
  try { avisoProp('Titulo de prueba', 'Texto de prueba del aviso propio.'); } catch (e) { o.errFn.push('avisoProp: ' + e.message); }
  await esp(140);
  o.aviso = medirCartel('[data-med-aviso="ov"]');
  limpiar();

  let pr = null;
  try { pr = preguntaProp('Pregunta de prueba', ['Primer parrafo.', 'Segundo parrafo.'], 'Confirmar', 'btn-primary'); }
  catch (e) { o.errFn.push('preguntaProp: ' + e.message); }
  await esp(140);
  o.pregunta = medirCartel('[data-borr-conf]');
  if (o.pregunta) {
    const ov = document.querySelector('[data-borr-conf]');
    const bs = [].slice.call(ov.querySelectorAll('button'));
    const si = bs.filter(b => String(b.textContent || '').trim() === 'Confirmar')[0];
    o.pregunta.siEsAzul = !!(si && si.classList.contains('btn-primary') && !si.classList.contains('btn-danger'));
    /* «Cancelar» PRIMERO: el que viene apretando Enter no confirma nada. */
    o.pregunta.cancelarPrimero = !!(bs[0] && String(bs[0].textContent || '').trim() === 'Cancelar');
  }
  try { const ov = document.querySelector('[data-borr-conf]');
    const b = [].slice.call(ov.querySelectorAll('button')).filter(x => String(x.textContent||'').trim()==='Cancelar')[0];
    if (b) b.click(); } catch (e) {}
  try { o.pregunta && (o.preguntaDevolvio = (await pr) === false); } catch (e) {}
  limpiar();

  let pd = null;
  try { pd = pedirProp('Valor de prueba', 'Entre 1 y 9.', '5'); } catch (e) { o.errFn.push('pedirProp: ' + e.message); }
  await esp(140);
  o.pedir = medirCartel('[data-ped-prop="ov"]');
  if (o.pedir) {
    const inp = document.querySelector('[data-ped-prop="inp"]');
    o.pedir.campoExiste = !!inp;
    o.pedir.campoSinId = !!(inp && !inp.id);
    o.pedir.valorInicial = inp ? String(inp.value) : null;
    o.pedir.campoEnfocado = (document.activeElement === inp);
    /* LA CADENA VACIA ES UN VALOR VALIDO: el boton NO se deshabilita con el campo vacio. */
    if (inp) { inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles:true })); }
    await esp(80);
    const bok = document.querySelector('[data-ped-prop="ok"]');
    o.pedir.okConVacio = !!(bok && !bok.disabled);
  }
  try { const b = document.querySelector('[data-ped-prop="no"]'); if (b) b.click(); } catch (e) {}
  try { o.pedir && (o.pedirDevolvio = (await pd) === null); } catch (e) {}
  limpiar();

  /* ── 2 · LA ESCALA DE VELOCIDAD SOBREVIVE AL VIAJE POR EL REGISTRO ──────────────────────── */
  try {
    const reg = { tipo:3, x0:100, y0:400, x1:900, y1:800, ux:4, uy:7, dx:0.002, dy:-0.9425,
                  rx0:0, ry0:200, rvx:0, rvy:0 };
    const rv = _cineDesdeRegistro(_cineRegistro('u-p12d', { nombre:'d', cuadros:1,
      d:{ frags:[new Uint8Array([1])], cols:1016, filas:708, msCuadro:0, regiones:[reg] } },
      '', 'id-p12d')).d.regiones[0];
    o.escala = {
      camposAntes: Object.keys(reg).length,
      camposDespues: Object.keys(rv).length,
      baseAntes: _dcmImgBaseY(reg),
      baseDespues: _dcmImgBaseY(rv),
      velAntes: !!_dcmImgRegionVelocidad(reg),
      velDespues: !!_dcmImgRegionVelocidad(rv),
      /* CONTROL: el eje del TIEMPO sobrevivia antes de P12 tambien. */
      tiempoDespues: !!_dcmImgRegionTiempo(rv),
      /* Y la FLECHA: el signo que decide si dice arriba o abajo. */
      flechaArriba: (_dcmImgVelocidadEn(rv, _dcmImgBaseY(rv) - 100) < 0) ? 'abajo' : 'arriba',
      flechaAbajo:  (_dcmImgVelocidadEn(rv, _dcmImgBaseY(rv) + 100) < 0) ? 'abajo' : 'arriba'
    };
  } catch (e) { o.errFn.push('escala: ' + e.message); }

  /* ── 3 · LA RECETA Y LA FRASE DEL QUE HACER ─────────────────────────────────────────────── */
  try {
    o.textos = {
      recetaNombraElCero: String(window.MED_CAL_VEL_RECETA || '').indexOf('el cero') > -1,
      recetaNombraLasDosUnidades: String(window.MED_CAL_VEL_RECETA || '').indexOf('m/s') > -1 &&
                                  String(window.MED_CAL_VEL_RECETA || '').indexOf('cm/s') > -1,
      receta2DiceCualesquiera: String(window.MED_CAL_VEL_RECETA2 || '').indexOf('cualesquiera') > -1,
      comoNombraElBoton: String(window.MED_COMO_CALIBRAR_VEL || '').indexOf('Calibrar vel.') > -1,
      /* Y NO dice «la regla», que es el control que no existe. */
      comoNoDiceLaRegla: String(window.MED_COMO_CALIBRAR_VEL || '').indexOf('la regla') < 0
    };
  } catch (e) { o.errFn.push('textos: ' + e.message); }

  /* ── 4 · EL BOTON DEL CARTEL DE LLEGADA CON SU (0) ──────────────────────────────────────── */
  /* Se arma el cartel SIN red: `_clnkPreguntarQue` sólo necesita un grupo repartido, y el
     reparto sale del registro `ett_clnk_vistas`, que es localStorage. */
  try {
    const vistasOrig = localStorage.getItem('ett_clnk_vistas');
    const t0 = Date.now() - 9 * 60000;
    const ids = ['img_d1','img_d2','img_d3'];
    const marca = {}; ids.forEach(i => { marca[i] = { d:'guardado', t: Date.now() }; });
    localStorage.setItem('ett_clnk_vistas', JSON.stringify(marca));
    window._clnkVistas = null;
    const g = { equipo:'eq_d', ids: ids.slice(), primero: t0, ultimo: t0,
                imagenes: ids.map(i => ({ id:i, tipo:'imagen', bytes:570, se_puede_ver:true })) };
    _clnkTipos(g); _clnkRepartir(g);
    o.cartel = { nNuevos: (g.idsNuevos||[]).length, nRepes: (g.idsRepes||[]).length };
    _clnkPreguntarQue(g, 'VINNO');
    await esp(240);
    const b1 = $('clnkav-b1'), b2 = $('clnkav-b2');
    const cu = $('clnkav-cuerpo');
    o.cartel.rot1 = b1 ? String(b1.textContent || '') : '(no hay)';
    o.cartel.diceCero = o.cartel.rot1.indexOf('(0)') > -1;
    o.cartel.b1Disabled = !!(b1 && b1.disabled);
    o.cartel.b1Opacidad = b1 ? getComputedStyle(b1).opacity : null;
    o.cartel.b1SeVeApagado = !!(b1 && parseFloat(getComputedStyle(b1).opacity) < 0.9);
    o.cartel.b1Titulo = b1 ? String(b1.title || '').slice(0, 70) : '';
    o.cartel.b2NoApagado = !!(b2 && !b2.disabled && !b2.classList.contains('clnk-av-off'));
    o.cartel.cuerpoDiceDescartan = !!(cu && String(cu.textContent || '').indexOf('se descart') > -1);
    o.cartel.b1Caja = caja(b1);
    try { clnkAvisoCerrar(); } catch (e) {}
    if (vistasOrig === null) localStorage.removeItem('ett_clnk_vistas');
    else localStorage.setItem('ett_clnk_vistas', vistasOrig);
    window._clnkVistas = null;
  } catch (e) { o.errFn.push('cartel: ' + e.message); }

  /* ── 5 · NINGUN CARTEL QUEDO ABIERTO, Y NINGUN DESPLAZAMIENTO HORIZONTAL ────────────────── */
  limpiar();
  o.cartelesAbiertos = document.querySelectorAll(
    '[data-med-aviso="ov"],[data-borr-conf],[data-ped-prop="ov"]').length;
  o.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  /* IDS DUPLICADOS. Esta linea decia «cero, que es lo que los tres carteles garantizan por no
     llevar ninguno», y ERA FALSO para el documento entero: la app tiene 109 ids repetidos,
     medido, y es PREEXISTENTE -- el mismo 109 en los ocho cruces de los DOS arboles, con el
     detector de dos arboles diciendo NO en 921b72b y SI en el vivo--. Lo que los tres
     carteles de P12 garantizan es que NO AGREGAN ninguno, que es otra cosa: ninguno de sus
     nodos lleva id. El numero se publica para que un aumento se vea. */
  const vistos = Object.create(null); let dup = 0;
  document.querySelectorAll('[id]').forEach(n => {
    if (vistos[n.id]) dup++; else vistos[n.id] = 1; });
  o.idsDuplicados = dup;
  return o;
})();
