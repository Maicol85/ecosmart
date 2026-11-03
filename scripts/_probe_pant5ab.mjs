#!/usr/bin/env node
/**
 * _probe_pant5ab.mjs - el A/B de SUPERFICIES de la tanda PANT-5 (2026-11-03). Calcado de
 * _probe_pant4ab.mjs, que hereda el linaje pant3 -> popab -> c2ab -> c1ab -> bab -> aab -> r2ab.
 *
 * Lo que agrega esta tanda:
 *   - CUATRO escenas del dibujo de sobrecarga del VD: el formulario vacio -donde el dibujo
 *     tiene que quedar MUDO-, el VD dilatado con insuficiencia tricuspidea severa, las dos
 *     marcas juntas con la velocidad maxima, y un estudio AJENO al VD.
 *   - La FIRMA del esquema valvular 2D de Valvulas, nodo por nodo: el commit 1 no puede moverle
 *     un atributo, y la unica forma de probarlo es comparar su SVG entero.
 *   - La FIRMA del dibujo nuevo, que es el control POSITIVO: sin ella, un cero de superficie
 *     firmada no se distingue de una sonda que no mira donde el cambio puede actuar.
 *
 * _probe_pant3ab.mjs - el A/B de SUPERFICIES de la tanda POP-V2 (2026-10-29). Calcado de
 * _probe_c2ab.mjs, que hereda el linaje _probe_c1ab -> _probe_bab -> _probe_aab -> _probe_r2ab.
 *
 * Lo que agrega esta tanda son las escenas del posoperatorio que sus siete commits tocan:
 *   - el modulo VACIO y el AJENO, que es donde el pedido exige CERO diferencias;
 *   - el modulo CARGADO con y sin integrar, que es la unica forma de que su hoja del PDF y su
 *     diapositiva del PPT existan;
 *   - las dosis por dilucion: el caso conocido (4 mg en 100 ml a 21 ml/h con 70 kg = 0,20), una
 *     dosis TIPEADA a mano sobre una dilucion cargada, y un estudio SIN peso;
 *   - las cuatro fuentes de PAM con la LINEA ARTERIAL adentro;
 *   - Impella, ECMO venovenoso y el balon con sus tres timings;
 *   - los bordes de los cortes de la conclusion: IC 2,1 / 2,2 / 2,3, lactato 2,0 / 2,1,
 *     TAPSE 16 / 17 / 18 y VD/VI 0,9 / 0,91;
 *   - el caso que midio el medico: IC 1,57 con PAM 58 y TAPSE 12.
 * En MEDIR se agregan los nodos de pantalla del modulo, su conclusion entera, el contador del
 * desplegable, el texto del dibujo y el censo del registro VINFO.
 *
 * _probe_c2ab.mjs - el A/B de SUPERFICIES de la tanda C2 (2026-10-28). Calcado de
 * _probe_c1ab.mjs, que hereda el linaje _probe_bab -> _probe_aab -> _probe_r2ab.
 *
 * Lo que agrega esta tanda:
 *   - OCHO escenas de ECO PULMONAR: el derrame con su distancia pleural (25 mm -> 500 ml), el
 *     valor fuera de rango, la consolidacion, las dos juntas (para el ORDEN del EN SUMA), el
 *     neumotorax, el patron «Indeterminado» -que es el unico que dice «Correlacionar con la
 *     clinica»-, y las dos del modulo SIN integrar / integrado, que es la compuerta del 1h.
 *   - DOS escenas de CONSTRICCION vs RESTRICCION: el cociente por encima y por debajo de 0,78,
 *     que es donde la fila «Lectura» tiene que seguir diciendo lo mismo.
 *   - SEIS escenas de BORDES del FORRESTER: PCP 15, 18 y 19 cruzadas con IC 2,1, 2,2 y 2,3.
 *   - La escena de AMILOIDOSIS con el boton «Traer del formulario», que el commit 3 retira.
 * En MEDIR se agregan los nodos de pantalla de esas zonas, el CENSO DE «Balik» sobre todas las
 * superficies medidas, el conteo del registro VINFO y el inventario de cortes del commit 4.
 *
 * _probe_c1ab.mjs - el A/B de SUPERFICIES de la tanda C1 (2026-10-28). Calcado de
 * _probe_bab.mjs, que a su vez viene de _probe_aab.mjs.
 *
 * ⚠️ EL DEFECTO DE `RECALC_MODULOS.forEach` YA VIENE CORREGIDO en el original del que se copia
 *    (la tanda B lo cerro): el montaje llama a `_recalcModulos('ab')`, que es la funcion.
 *
 * Lo que agrega esta tanda son las escenas de VExUS por GRADO -los cuatro, porque los cuatro
 * rotulos cambian-, las cuatro combinaciones del Forrester mas sus DOS bordes, las cuatro
 * fuentes de PAM para la RVS, el POCUS con y sin VD/VI, y la tabla de signos de HTP con una
 * casilla manual sin marcar. Y en `MEDIR`, los nodos `_pant_` de esas cinco zonas.
 *
 * _probe_bab.mjs - el A/B de SUPERFICIES de la tanda B (2026-10-27). Calcado de _probe_aab.mjs;
 * lo unico que agrega son las TRES escenas con UNA sola fuente de PAM, que es donde el
 * encabezado de la tanda exige CERO diferencias, y una CUARTA con dos que difieren.
 * Calcado de _probe_r2ab.mjs. Agrega cuatro escenas -fallot, vexus, conco, pop-, el PPT,
 * y el TEXTO del panel de Evidencia y de las tres fichas de Referencias que la tanda toca:
 * ahi SI tiene que haber diferencias, y es lo unico que puede tenerlas.
 *
 * Volca, para cada escena, las superficies firmadas y las de pantalla, y se corre DOS veces
 * -contra el arbol vivo y contra una copia de HEAD- para comparar con `_ab_r2diff.mjs`.
 * Cada superficie se enumera UNA POR UNA: informe en los tres estilos, EN SUMA, Excel con sus
 * 440 columnas CLAVE POR CLAVE, campos del estudio, PDF generado de verdad en sus seis
 * plantillas, PPT, PDF de auditoria y el Laboratorio por sus funciones dueñas.
 *
 *   node scripts/_probe_r2ab.mjs --file /tmp/head_r2.html --out /tmp/ab_head.json
 *   node scripts/_probe_r2ab.mjs --out /tmp/ab_nuevo.json --solo vacio,derrame
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/ab_pant5.json';

/* == LAS ESCENAS (PANT-4, commit 1) =========================================================
   La tabla de combinaciones que el punto 1a exige, una escena por combinacion que cambia la
   frase. `p4vacio` y `p4ajeno` son los controles negativos -ninguna parte de esta tanda los
   toca- y `s1Apa` / `v1Apa` son el control de la compuerta: los MISMOS datos con la casilla
   «Integrar al informe» APAGADA, donde el papel tiene que salir vacio en los DOS arboles. */
const BASE = { peso:'70', talla:'170', ddfvi:'52' };
const S = (o) => Object.assign({}, BASE, o);

const ESCENAS = {
  p4vacio: { campos: {} },
  /* -- PANT-5, COMMIT 1: EL DIBUJO DE SOBRECARGA DEL VD --
     p5vdVacio es el formulario sin NINGUNO de los seis datos: el dibujo tiene que quedar en un
     corazon normal MUDO. p5vd es el VD dilatado con la tricuspidea severa. p5vdTodo lleva las
     dos marcas y la velocidad maxima. p5vdAjeno es un estudio con datos de OTRA pestania, que
     es el control negativo: ni el dibujo ni el papel se mueven por el. */
  p5vdVacio: { campos: {} },
  p5vd:      { campos: { tep_vdvi:'1.25', tapse:'12', vmax_it:'3.6' }, sel:{ it_grado:'4' } },
  p5vdTodo:  { campos: { tep_vdvi:'1.30', tapse:'10', vmax_it:'4.2' },
               sel:{ it_grado:'4', tep_mcconnell:'si', tep_tabique_d:'si' } },
  p5vdAjeno: { campos: { ai_diam:'38', siv:'11' } },
  /* -- PANT-5, COMMIT 4: DERRAME PERICARDICO Y TAPONAMIENTO --
     p5dpt lleva los QUINCE campos de la seccion cargados, que es la unica forma de que su
     descripcion y su linea de papel existan. p5dptVacio es el control negativo. */
  p5dptVacio: { campos: {} },
  /* -- PANT-5, COMMIT 5: LAS CUATRO COMBINACIONES DE CIA / CIV --
     El papel tiene que salir IDENTICO en las cuatro, con y sin el boton de abajo. Las lesiones
     se marcan por sus dos checkbox ocultos, que son el estado que `guardarInforme` captura. */
  p5ccNada: { campos: { ete_cia_tam_max:'14', ete_civ_tam:'8' } },
  p5ccCia:  { campos: { ete_cia_tam_max:'14', ete_cia_tam_min:'11', ete_cia_borde_post:'6' },
              sel: { ete_cia_tipo:'secundum' }, chk: ['ete_cia_activa'] },
  p5ccCiv:  { campos: { ete_civ_tam:'8' }, sel: { ete_civ_tipo:'perimembranosa' },
              chk: ['ete_civ_activa'] },
  p5ccDos:  { campos: { ete_cia_tam_max:'14', ete_cia_tam_min:'11', ete_civ_tam:'8' },
              sel: { ete_cia_tipo:'secundum', ete_civ_tipo:'perimembranosa' },
              chk: ['ete_cia_activa','ete_civ_activa'] },
  p5ccDosI: { campos: { ete_cia_tam_max:'14', ete_cia_tam_min:'11', ete_civ_tam:'8' },
              sel: { ete_cia_tipo:'secundum', ete_civ_tipo:'perimembranosa' },
              chk: ['ete_cia_activa','ete_civ_activa','ete_shunt_incluir_chk'] },
  p5dpt: { campos: { dpt_mm_post:'18', dpt_mm_lat:'12', dpt_mm_ant:'9', dpt_col_ad_dur:'0.45',
                     resp_var_mitral:'30', resp_var_tric:'45', dpt_var_ao:'22', dpt_var_pulm:'18',
                     },
           /* ⚠️ EL TAMANIO DEL DERRAME SALE DEL SELECTOR `pericardio` DE LA PESTANIA OTROS, y su
              valor es el TEXTO de la opcion, no una clave. La primera version de esta escena
              ponia `peri_derrame:'moderado'` -un id que no existe- y el informe salia IDENTICO
              al de la escena vacia: «Sin derrame pericardico ni masas intracardiacas», con el
              badge en «SIN DERRAME». Un denominador vacio, no un cero. */
           sel: { pericardio:'Derrame moderado (10-20mm)', dpt_local:'circ', dpt_col_ad:'si', dpt_col_vd:'si', dpt_col_ai:'no', dpt_col_vi:'no' },
           chk: ['dpt_libre','dpt_swinging'] },
  /* -- ESTENOSIS SUBAORTICA --
     s1 es EL CASO DEL MEDICO: tipo membrana, insuficiencia aortica moderada, SIN gradientes. */
  s1:    { campos: S({}), sel:{ esub_tipo:'membrana', esub_ia_asociada:'moderada' }, chk:['esub_incluir_chk'] },
  s1Apa: { campos: S({}), sel:{ esub_tipo:'membrana', esub_ia_asociada:'moderada' } },
  /* s2: severa, con los dos gradientes, insuficiencia leve y Valsalva sin cambios. */
  s2:    { campos: S({ esub_gradiente_medio:'45', esub_gradiente_mmhg:'80' }),
           sel:{ esub_tipo:'membrana', esub_ia_asociada:'leve', esub_valsalva:'sin_cambios' }, chk:['esub_incluir_chk'] },
  /* s3: NO severa -se declaraba el supuesto de flujo normal-, sin insuficiencia, Valsalva que AUMENTA. */
  s3:    { campos: S({ esub_gradiente_medio:'20', esub_gradiente_mmhg:'60' }),
           sel:{ esub_tipo:'membrana', esub_ia_asociada:'no', esub_valsalva:'aumenta' }, chk:['esub_incluir_chk'] },
  /* s4: TUNEL con longitud, insuficiencia severa, Valsalva que disminuye. */
  s4:    { campos: S({ esub_gradiente_medio:'20', esub_longitud_mm:'16' }),
           sel:{ esub_tipo:'tunel', esub_ia_asociada:'severa', esub_valsalva:'disminuye' }, chk:['esub_incluir_chk'] },
  /* s5: tunel SIN gradiente medio -la rama de «no se gradua»- y con longitud. */
  s5:    { campos: S({ esub_longitud_mm:'16' }), sel:{ esub_tipo:'tunel' }, chk:['esub_incluir_chk'] },
  /* s6: gradiente FUERA DE RANGO. */
  s6:    { campos: S({ esub_gradiente_medio:'900' }), sel:{ esub_tipo:'membrana' }, chk:['esub_incluir_chk'] },
  /* s7 y s8: los bordes del corte, 40 exactos y 39. */
  s7:    { campos: S({ esub_gradiente_medio:'40' }), sel:{ esub_tipo:'noesp' }, chk:['esub_incluir_chk'] },
  s8:    { campos: S({ esub_gradiente_medio:'39' }), sel:{ esub_tipo:'membrana' }, chk:['esub_incluir_chk'] },
  /* -- ESTENOSIS SUPRAVALVULAR AORTICA --
     v1 es EL CASO DEL MEDICO: forma de reloj de arena, ostios normales, estenosis pulmonar leve. */
  v1:    { campos: S({}), sel:{ easv_tipo:'reloj', easv_coronarias:'normales', easv_estenosis_pulmonar:'leve' },
           chk:['easv_incluir_chk'] },
  v1Apa: { campos: S({}), sel:{ easv_tipo:'reloj', easv_coronarias:'normales', easv_estenosis_pulmonar:'leve' } },
  /* v2: severa, Williams, ostios comprometidos y estenosis pulmonar moderada -las tres alertas-. */
  v2:    { campos: S({ easv_gradiente_medio:'45', easv_gradiente_mmhg:'85' }),
           sel:{ easv_tipo:'reloj', easv_williams:'si', easv_coronarias:'comprometidos', easv_estenosis_pulmonar:'moderada' },
           chk:['easv_incluir_chk'] },
  /* v3: difusa, los tres negativos explicitos -sin sindrome, ostios no evaluados, sin estenosis pulmonar-. */
  v3:    { campos: S({ easv_gradiente_medio:'20' }),
           sel:{ easv_tipo:'difusa', easv_williams:'no', easv_coronarias:'no_eval', easv_estenosis_pulmonar:'no' },
           chk:['easv_incluir_chk'] },
  /* v4: membranosa con DILATACION coronaria, que es la alerta sin linea de EN SUMA. */
  v4:    { campos: S({ easv_gradiente_medio:'20' }),
           sel:{ easv_tipo:'membranosa', easv_coronarias:'dilatacion' }, chk:['easv_incluir_chk'] },
  /* v5: fuera de rango. v6: el borde de 40 exactos. */
  v5:    { campos: S({ easv_gradiente_medio:'900' }), sel:{ easv_tipo:'noesp' }, chk:['easv_incluir_chk'] },
  v6:    { campos: S({ easv_gradiente_medio:'40' }), sel:{ easv_tipo:'reloj' }, chk:['easv_incluir_chk'] },
  /* Las DOS lesiones a la vez, que es donde se ve que cada hallazgo se nombra una sola vez. */
  sv:    { campos: S({ esub_gradiente_medio:'45', easv_gradiente_medio:'45' }),
           sel:{ esub_tipo:'membrana', esub_ia_asociada:'moderada', easv_tipo:'reloj', easv_coronarias:'comprometidos' },
           chk:['esub_incluir_chk','easv_incluir_chk'] },
  /* -- LAS ESCENAS DE MCA (commit 2) --
     Una por cada rama que escribe una nota con el nombre del criterio, mas el control de la
     compuerta -los MISMOS datos sin integrar- y el ajeno. Van en el A/B y no solo en el censo
     porque el censo midio el PDF sobre un denominador VACIO: su espia de jsPDF devolvio cero
     caracteres, asi que el PDF y el PPT los tiene que medir este arnes, que los genera de verdad. */
  mcaEstr: { campos:{ peso:'70', talla:'170', mca_tsvd_plax:'34', mca_tsvd_psax:'38' },
             sel:{ mca_fenotipo:'derecho', mca_mov_regional:'normal' }, chk:['mca_incluir_chk'] },
  mcaAne:  { campos:{ peso:'70', talla:'170', mca_tsvd_plax:'34', mca_tsvd_psax:'38' },
             sel:{ mca_fenotipo:'derecho', mca_mov_regional:'aneurisma' }, chk:['mca_incluir_chk'] },
  mcaTvDrc:{ campos:{ peso:'70', talla:'170' },
             sel:{ mca_fenotipo:'derecho', tv_documentada:'si', tv_morfologia:'bcrd', tv_tipo:'sostenida' },
             chk:['mca_incluir_chk'] },
  mcaTvSin:{ campos:{ peso:'70', talla:'170' },
             sel:{ mca_fenotipo:'derecho', tv_documentada:'si', tv_morfologia:'bcri_inf' },
             chk:['mca_incluir_chk'] },
  mcaVI:   { campos:{ peso:'70', talla:'170' },
             sel:{ mca_fenotipo:'biventricular', mca_vi_aneurisma:'si' }, chk:['mca_incluir_chk'] },
  /* El control de la compuerta: los mismos datos SIN integrar. */
  mcaApa:  { campos:{ peso:'70', talla:'170', mca_tsvd_plax:'34', mca_tsvd_psax:'38' },
             sel:{ mca_fenotipo:'derecho', mca_mov_regional:'aneurisma' } },
  p4ajeno: { campos: { im_vc:'8', ea_dtsvi:'20', itv_tsvi:'20', itv_ao:'100', vmax_ao:'4.5',
                       onda_e:'110', e_sep:'5', e_lat:'6', ai_vol:'70', peso:'80', talla:'180' } }
};
const SOLO = (arg('--solo') || Object.keys(ESCENAS).join(',')).split(',').map(s => s.trim());

const MONTAR = `((esc) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  Object.keys(esc.campos || {}).forEach(k => { if (esc.campos[k] !== '') S(k, esc.campos[k]) });
  Object.keys(esc.sel || {}).forEach(k => S(k, esc.sel[k]));
  /* ADVERTENCIA: LAS CASILLAS DE DROGA VAN POR SU GESTO REAL. popSync corre desde el onchange
     de la casilla, y es quien abre la fila de la dosis y quien escribe el contador del
     desplegable: ponerle checked sin despachar el evento deja la fila cerrada y la dosis sin
     calcular, o sea una escena que no llega a la zona. Y van DESPUES de los campos, porque al
     apagarse popSync BORRA la dilucion y la dosis.
     (Sin acentos graves: este comentario vive DENTRO del template de MONTAR.) */
  (esc.chk || []).forEach(id => { const e = document.getElementById(id);
    if (e) { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })) } });
  /* El gesto "les" pone los dos campos del commit 1 de PANT-3. Se pone el CHECKBOX, que es el
     estado, y se despacha change igual que el gesto real. En HEAD no existen, asi que la escena
     queda gateada solo por la casilla de abajo, que es lo que HEAD hace.
     (Sin acentos graves: este comentario vive DENTRO del template de MONTAR.) */
  (esc.les || []).forEach(k => { const e = document.getElementById(k === 'civ' ? 'ete_civ_activa' : 'ete_cia_activa');
    if (e) { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })) } });
  try { if (typeof eteShuntSync === 'function') eteShuntSync() } catch (e) {}
  /* El gesto "clics" toca botones reales por id: lo necesita el boton del esquema al PDF, que no
     es un campo ni una casilla. Va ANTES de los calculadores. */
  (esc.clics || []).forEach(id => { const e = document.getElementById(id); if (e) e.click() });
  /* Los campos de dilucion y la dosis se reponen DESPUES de marcar, por el borrado de arriba. */
  Object.keys(esc.campos || {}).forEach(k => { if (/^pop_.*_(diluc_mg|diluc_ml|veloc|dosis)$/.test(k)
    && esc.campos[k] !== '') S(k, esc.campos[k]) });
  (esc.pastillas || []).forEach(p => { const b = document.getElementById('pill-' + p[1] + '-' + p[0]);
    if (b && !b.classList.contains('btn-primary')) b.click() });
  /* ⚠️ INTEGRAR ES UN GESTO, Y SIN EL EL BLOQUE NO LLEGA AL PAPEL. Lo midio la tanda A con su
     mutacion M15: la hoja de ETT Avanzado del PDF y la diapositiva del PPT publican el bloque
     de hemodinamica SOLO si el medico lo integro. Sin esto, un A/B sobre el texto de la capsula
     da cero en las superficies firmadas y parece que el cambio no las toca. */
  (esc.integrar || []).forEach(k => { try { if (typeof amiloIntegrar === 'function') amiloIntegrar(k) } catch (e) {} });
  /* Todos los calculadores, para que no haya desfase por el orden de carga. */
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  /* ADVERTENCIA: era RECALC_MODULOS.forEach, y RECALC_MODULOS es una FUNCION: tiraba
     TypeError, el catch lo tragaba y el embudo de restauracion NUNCA corria. Viene asi desde
     _probe_r2ab.mjs, o sea que varias tandas midieron su A/B sin pasar por el embudo. Lo
     destapo la tanda B al agregarle una entrada y ver que el A/B no la tocaba. */
  try { if (typeof _recalcModulos === 'function') _recalcModulos('ab'); } catch (e) {}
  return true;
})(ESC)`;

const MEDIR = `(() => {
  const out = {};
  /* == PANT-5 · LA FIRMA DE LOS DOS DIBUJOS ===================================================
     El esquema valvular 2D NO puede moverse por el commit 1, y la unica forma de probarlo es
     comparar su SVG entero -cada nodo con sus atributos ordenados-. El dibujo NUEVO va al lado
     como control POSITIVO: sin el, un cero de superficie firmada no se distingue de una sonda
     que no mira donde el cambio puede actuar. */
  const firma = (sel) => { const r = document.querySelector(sel); if (!r) return 'NO EXISTE';
    const ps = [];
    const rec = (n) => { if (n.nodeType !== 1) return;
      const at = Array.prototype.slice.call(n.attributes).map(a => a.name + '=' + a.value).sort().join(';');
      ps.push(n.tagName + '[' + at + ']' + (n.children.length ? '' : ('{' + (n.textContent||'').trim() + '}')));
      Array.prototype.slice.call(n.children).forEach(rec) };
    rec(r); return ps.join('|') };
  try { if (typeof showTab === 'function') showTab('valvulas') } catch (e) {}
  try { const bt = document.getElementById('v2d-abrir'); if (bt && document.getElementById('v2d-ov') && document.getElementById('v2d-ov').hasAttribute('hidden')) bt.click() } catch (e) {}
  out._v2dFirma = firma('#v2d-svg');
  out._v2dFirmaN = String(out._v2dFirma).length;
  try { if (typeof v2dCerrar === 'function') v2dCerrar() } catch (e) {}
  try { if (typeof showTab === 'function') showTab('hemodinamica') } catch (e) {}
  try { const sec = document.getElementById('tep-seccion');
    if (sec && getComputedStyle(sec).display === 'none') { const h = document.querySelector('[onclick*="tep-seccion"]'); if (h) h.click() } } catch (e) {}
  try { if (typeof vdscSync === 'function') vdscSync() } catch (e) {}
  try { if (typeof vdscFase === 'function') vdscFase(0.40) } catch (e) {}
  out._vdscFirma = firma('#vdsc-svg');
  out._vdscFirmaN = String(out._vdscFirma).length;
  out._vdscTextos = (function(){ const g = document.getElementById('vdsc-svg'); if (!g) return 'NO EXISTE';
    return Array.prototype.slice.call(g.querySelectorAll('text')).filter(t => {
      let n = t; while (n && n !== g) { if (n.getAttribute && parseFloat(n.getAttribute('opacity')||'1') === 0) return false; n = n.parentNode }
      return (t.textContent||'').trim().length > 0 }).map(t => (t.textContent||'').trim()).join(' / ') })();
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.value || e.textContent || '') : 'NO EXISTE' };
  /* 1-3 · EL INFORME EN LOS TRES ESTILOS, y 4 · su EN SUMA. El estilo es estado de SESION. */
  ['estandar', 'narrativo', 'conciso'].forEach(st => {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(st) } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    out['informe_' + st] = T('informe_texto');
    out['suma_' + st] = T('en_suma');
  });
  try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch (e) {}
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  /* 5 · EL EXCEL, clave por clave. */
  try {
    const campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    });
    out._camposN = Object.keys(campos).length;
    out._camposClaves = Object.keys(campos).sort().join(',');
    out._campos = campos;
    const fila = (typeof _labExcelRow === 'function') ? _labExcelRow({ campos: campos, fecha: '2026-10-21' }) : null;
    out._excelN = fila ? Object.keys(fila).length : 'SIN FN';
    out._excel = fila || {};
  } catch (e) { out._excelErr = String(e).slice(0, 140) }
  /* 6 · El LABORATORIO por sus funciones dueñas. */
  const inf = { campos: out._campos || {}, fecha: '2026-10-21',
                informe: out.informe_estandar || '', en_suma: out.suma_estandar || '' };
  ['_labDiastGrado', '_labGeomCat', '_labValvCounts', '_labEmLectura', '_labDisfSistVent',
   '_labEstenSev', '_labHtpProb', '_labFevi'].forEach(fn => {
    try { out['lab_' + fn] = (typeof window[fn] === 'function')
      ? JSON.stringify(window[fn](inf, 'em_grado')) : 'SIN FN' } catch (e) { out['lab_' + fn] = 'EXC' }
  });
  /* 7 · Las capsulas de pantalla de las zonas que esta tanda toca. */
  ['htp2022-catA', 'htp2022-catB', 'htp2022-catC', 'htp2022-prob', 'htp2022-vrt-interp',
   'dpt-concl-badge', 'dpt-tam-eco', 'vab-concl', 'cx-concl-badge', 'ett-score-num',
   'ett-score-cat', 'ett-hvi-badge', 'ett-cual-count', 'hemo-ic', 'hemo-rvs', 'hemo-perfil',
   'hemo-forrester', 'oai-elegibilidad', 'pua-patron', 'co-ctrcd-badge'].forEach(id => {
    out['pant_' + id] = T(id);
  });
  /* ══ 8 · EL PANEL DE EVIDENCIA Y LAS FICHAS QUE LA TANDA TOCA ══════════════════════════════
     Aca SI tiene que haber diferencias: es lo unico que la tanda A cambia. Se mide para poder
     mostrarlas una por una y para probar que la sonda DISTINGUE escenarios -si saliera igual en
     los dos lados, el A/B no estaria mirando lo que la tanda toco-. */
  try { if (typeof indicRender === 'function') indicRender() } catch (e) {}
  /* La barra invertida va DOBLE: esta linea vive dentro de un template de JavaScript, que
     consume una, y /\\s+/ escrito simple llegaba al navegador como /s+/ — o sea borraba
     todas las ESES del texto medido. Paso inadvertido una corrida entera: el volcado decia
     «ademá valor» y «Mecani mo». Afectaba a los DOS lados igual, asi que el A/B seguia
     siendo valido, pero el texto era ilegible y una diferencia de solo eses quedaba tapada. */
  const N = (s) => String(s || '').replace(/\\s+/g, ' ').trim();
  const cu = document.getElementById('indic-cuerpo');
  out._evN = cu ? cu.querySelectorAll('details').length : -1;
  out._evSecs = cu ? [].slice.call(cu.children).filter(d => d.tagName === 'DETAILS')
    .map(d => N((d.querySelector('summary') || {}).textContent)).join(' || ') : 'SIN PANEL';
  out._evCompactas = cu ? cu.querySelectorAll('[data-ind-compacta]').length : -1;
  out._evTexto = N(cu ? cu.textContent : '');
  ['ref-pop', 'ref-pulmon', 'ref-cardiotox', 'co-referencia-seccion'].forEach(id => {
    out['_ficha_' + id] = N((document.getElementById(id) || {}).textContent);
  });
  out._manualSello = N((document.getElementById('manual-cuerpo') || document.body).textContent)
    .indexOf('v20260916-0227') > -1 ? 'SELLO VIEJO PRESENTE' : 'sin el sello viejo';
  /* ══ EL CONTROL POSITIVO DE LA TANDA B ═══════════════════════════════════════════════════
     Los TRES nodos de PANTALLA que esta tanda SI cambia. Van con prefijo _pant para que el
     comparador los agrupe aparte de las superficies firmadas. Sin ellos, un «cero diferencias»
     en el bloque A no se distingue de «la sonda no esta mirando nada»: es exactamente el
     denominador que este repo exige al lado de cada A/B. */
  ['ao-ref-pam', 'hemo-pam-auto', 'pop-pam-aviso'].forEach((id) => {
    const e = document.getElementById(id);
    out['_pant_' + id] = e ? N(e.textContent) : 'NO EXISTE';
  });
  /* ══ LOS NODOS DE PANTALLA DE LA TANDA C1 ═══════════════════════════════════════════════
     Las cinco zonas que esta tanda toca. Van con prefijo _pant_ para que el comparador las
     agrupe aparte de las superficies firmadas: aca SI puede haber diferencias. */
  ['vexus-score', 'vexus-interp', 'vexus-severos', 'vexus-vci-aviso',
   'hemo-forrester', 'hemo-rvs', 'hemo-ic', 'hemo-perfil', 'pop-pocus-vd',
   'htp2022-est-a1', 'htp2022-est-a2', 'htp2022-est-a3', 'htp2022-est-b1', 'htp2022-est-b2',
   'htp2022-est-b3', 'htp2022-est-b4', 'htp2022-est-b5', 'htp2022-est-c1', 'htp2022-est-c2',
   'htp2022-est-c3'].forEach((id) => {
    const e = document.getElementById(id);
    out['_pant_' + id] = e ? N(e.textContent) : 'NO EXISTE';
  });
  /* El GRAFICO del commit 4: su descripcion accesible y si hay punto dibujado. Contra HEAD
     sale NO EXISTE en los dos campos, que es lo correcto: el nodo todavia no existe. */
  try {
    const g = document.getElementById('hemo-forr-graf');
    out['_pant_graf_desc'] = g ? N(g.getAttribute('aria-label') || (g.querySelector('[data-forr-desc]') || {}).textContent) : 'NO EXISTE';
    out['_pant_graf_pts'] = g ? g.querySelectorAll('svg circle').length : 'NO EXISTE';
    out['_pant_graf_cuad'] = g ? N((g.querySelector('[data-forr-desc]') || {}).textContent) : 'NO EXISTE';
    out['_pant_graf_vacio'] = g ? N((g.querySelector('svg text[font-style=\"italic\"]') || {}).textContent) : 'NO EXISTE';
  } catch (e) { out['_pant_graf_desc'] = 'EXC' }
  /* ══ LOS NODOS DE PANTALLA DE LA TANDA C2 ═══════════════════════════════════════════════
     Las cuatro zonas que toca: el eco pulmonar, constriccion/restriccion, el modulo de
     amiloidosis y el Forrester. Prefijo '_pant_': aca SI puede haber diferencias. */
  ['pua-patron', 'pua-patron-interp', 'cvr-coc-eval', 'cvr-concl-badge', 'cvr-concl',
   'cvr-conteo', 'cvr-reversus', 'hemo-forrester', 'hemo-perfil', 'hemo-ic', 'hemo-pcp',
   'am-prev-pulm', 'ett-score-num'].forEach((id) => {
    const e = document.getElementById(id);
    out['_pant_' + id] = e ? N(e.textContent) : 'NO EXISTE';
  });
  /* ── EL ROTULO DEL CAMPO DEL DERRAME (1a) y el del cociente (commit 2) ───────────────── */
  out['_pant_lbl_balik'] = (function () {
    const i = document.getElementById('pua_balik');
    const l = i && i.parentElement && i.parentElement.querySelector('label');
    return l ? N(l.textContent) : 'NO EXISTE';
  })();
  out['_pant_lbl_coc'] = (function () {
    const i = document.getElementById('cvr_hep_coc');
    const l = i && i.parentElement && i.parentElement.querySelector('label');
    return l ? N(l.textContent) : 'NO EXISTE';
  })();
  /* El TEXTO LARGO que vive debajo de cada uno de los dos campos de constriccion. El commit 2
     lo deja en UNA linea corta; su contenido integro pasa al ⓘ. Se miden los DOS: el nodo de
     pantalla y la tarjeta del registro, para probar que nada se perdio. */
  out['_pant_coc_nota'] = (function () {
    const i = document.getElementById('cvr_hep_coc');
    const w = i && i.parentElement;
    if (!w) return 'NO EXISTE';
    const d = [].slice.call(w.querySelectorAll('div')).filter(function (x) {
      return !x.className || x.className.indexOf('calc-row') < 0; });
    return d.length ? N(d[d.length - 1].textContent) : 'SIN NOTA';
  })();
  out['_pant_cvr_ecosmart'] = (function () {
    const b = document.getElementById('cvr-concl');
    const caja = b && b.parentElement;
    if (!caja) return 'NO EXISTE';
    const t = N(caja.textContent);
    const i = t.indexOf('CRITERIO DE ECOSMART');
    return i > -1 ? t.slice(i) : 'SIN BLOQUE';
  })();
  /* ── EL BOTON «Traer del formulario» (commit 3) ──────────────────────────────────────── */
  out['_pant_btn_traer'] = (function () {
    const bs = [].slice.call(document.querySelectorAll('button'))
      .filter(function (b) { return N(b.textContent).indexOf('Traer del formulario') > -1; });
    return bs.length ? bs.length + ' boton(es): ' + bs.map(function (b) { return N(b.textContent) }).join(' | ')
                     : 'NINGUNO';
  })();
  out['_pant_aviso_traer'] = (function () {
    const t = N(document.body.textContent);
    return t.indexOf('No hay datos suficientes cargados') > -1 ? 'AVISO PRESENTE' : 'sin aviso';
  })();
  /* ── EL BLOQUE «Eco Pulmonar» DEL ETT AVANZADO (1h) ──────────────────────────────────── */
  out['_pant_am_pulm'] = (function () {
    const w = document.getElementById('am-wrap-pulm');
    if (!w) return 'NO EXISTE EN EL DOM';
    return (w.style.display === 'none' ? 'oculto' : 'visible') + ' | txt=' +
           N((document.getElementById('am-txt-pulm') || {}).value || '');
  })();
  out['_pant_am_secs'] = (function () {
    try { return amiloSecs().map(function (s) { return s.k }).join(',') } catch (e) { return 'EXC' }
  })();
  out['_pant_am_enInforme'] = (function () {
    try { return (amiloEnInforme() || []).map(function (d) { return d.k }).join(',') || 'NINGUNO' }
    catch (e) { return 'EXC' }
  })();
  /* ══ EL CENSO DE «Balik» SOBRE TODAS LAS SUPERFICIES MEDIDAS (1b) ════════════════════════
     Una por una, con su nombre: un censo que sume todo en un booleano no dice cual quedo. */
  out['_balik_censo'] = (function () {
    const donde = [];
    const mirar = {
      informe_estandar: out.informe_estandar, informe_narrativo: out.informe_narrativo,
      informe_conciso: out.informe_conciso, suma_estandar: out.suma_estandar,
      suma_narrativo: out.suma_narrativo, suma_conciso: out.suma_conciso,
      pantalla: N(document.body.textContent),
      ficha_pulmon: out._ficha_ref_pulmon, evidencia: out._evTexto,
      am_txt_pulm: N((document.getElementById('am-txt-pulm') || {}).value || '')
    };
    Object.keys(mirar).forEach(function (k) {
      if (String(mirar[k] || '').toLowerCase().indexOf('balik') > -1) donde.push(k);
    });
    return donde.length ? donde.join(',') : 'EN NINGUNA';
  })();
  /* ══ EL REGISTRO DE TARJETAS ⓘ ══════════════════════════════════════════════════════════ */
  out['_vinfoN'] = (function () { try { return Object.keys(VINFO).length } catch (e) { return 'EXC' } })();
  out['_vinfo_cvr'] = (function () {
    try { return ['cvr-coc', 'cvr-ecosmart'].map(function (k) {
      return k + '=' + (VINFO[k] ? 'SI' : 'no') }).join(',') } catch (e) { return 'EXC' }
  })();
  /* ══ EL INVENTARIO DE CORTES DEL COMMIT 4, LEIDO DEL CODIGO VIVO ═════════════════════════ */
  out['_cortes'] = (function () {
    const g = function (n) { try { return String(window[n]) } catch (e) { return 'no expuesta' } };
    let fc = 'no expuesta';
    try { fc = ['1.9/10|' + forrCuadrante(1.9, 10), '2.2/10|' + forrCuadrante(2.2, 10),
                '2.3/10|' + forrCuadrante(2.3, 10), '3.0/15|' + forrCuadrante(3.0, 15),
                '3.0/18|' + forrCuadrante(3.0, 18), '3.0/19|' + forrCuadrante(3.0, 19),
                '2.2/18|' + forrCuadrante(2.2, 18), '2.2/19|' + forrCuadrante(2.2, 19)].join(' ');
    } catch (e) { fc = 'EXC ' + String(e).slice(0, 60) }
    let ib = 'no expuesta';
    try { ib = [2.1, 2.2, 2.3].map(function (v) {
      const r = _icBanda(v); return v + '|' + (r ? r.txt : 'null') }).join(' ') } catch (e) { ib = 'EXC' }
    return JSON.stringify({ UMBRAL_PCP_HUMEDO: g('UMBRAL_PCP_HUMEDO'),
      FORR_IC_CORTE: (function(){ try { return String(FORR_IC_CORTE) } catch(e){ return 'no global' } })(),
      forrCuadrante: fc, icBanda: ib });
  })();
  /* ══ EL DENOMINADOR DE LAS CINCO ZONAS ══════════════════════════════════════════════════
     Sin esto, un «cero diferencias» no se distingue de «la escena no llego a la zona». */
  out['_c1_denom'] = JSON.stringify({
    vexusGrado: (function(){ try { const st = vexusEstado(); return st ? st.score : null } catch(e){ return 'EXC' } })(),
    forrester:  N((document.getElementById('hemo-forrester') || {}).textContent).slice(0, 60),
    rvsHay:     N((document.getElementById('hemo-rvs') || {}).textContent) !== '\u2014',
    pamEfe:     (function(){ try { const r = pamEfectiva(); return r ? (r.val + '/' + r.fuente) : 'null' } catch(e){ return 'EXC' } })(),
    /* ⚠️ LA BARRA VA DOBLE: esta linea vive dentro de un template de JavaScript, que consume
       una. Escrita simple llegaba al navegador como /VD/VI .../ -o sea la regex /VD/ seguida
       de basura- y page.evaluate moria con «Invalid regular expression flags». Es la misma
       trampa que el comentario de la barra de /\\s+/ documenta mas arriba. */
    pocusVdVi:  (function(){ const m = N((document.getElementById('pop-pocus-vd') || {}).textContent).match(/VD\\/VI ([^ ]+)/); return m ? m[1] : 'sin fila' })(),
    htpSignos:  (function(){ try { return _htp2022Signos({ num:_hfN, txt:sv, chk:_hfChk }).map(function(g){ return g.k + ':' + g.estado + (g.presente ? '+' : '-') }).join(',') } catch(e){ return 'EXC' } })(),
    evVexus:    (out._evTexto || '').indexOf('VExUS') > -1 || (out._evSecs || '').indexOf('Congestión venosa') > -1
  });
  /* ══ EL DENOMINADOR DE LAS CUATRO ZONAS DE LA C2 ═════════════════════════════════════════
     Sin esto un cero no se distingue de «la escena no llego». 'pulHay' y 'pulInt' son las DOS
     compuertas del informe pulmonar; 'ee' dice si el E/e' cayo donde la escena de borde queria. */
  out['_c2_denom'] = JSON.stringify({
    pulHay:  (function(){ try { return !!pulAvanzadoHayDatos() } catch(e){ return 'EXC' } })(),
    pulInt:  (function(){ try { return !!pulAvanzadoIntegrado() } catch(e){ return 'no existe' } })(),
    pulFras: (function(){ try { return (pulAvFrases() || []).length } catch(e){ return 'EXC' } })(),
    pulPatr: (function(){ try { const r = pulAvPatron(); return r ? r.p : 'null' } catch(e){ return 'EXC' } })(),
    cvrLect: N((document.getElementById('cvr-coc-eval') || {}).textContent),
    ic:      N((document.getElementById('hemo-ic') || {}).textContent).slice(0, 40),
    pcp:     N((document.getElementById('hemo-pcp') || {}).textContent).slice(0, 40),
    forr:    N((document.getElementById('hemo-forrester') || {}).textContent).slice(0, 50)
  });
  /* == LOS NODOS DE PANTALLA DE LA TANDA POP-V2 ============================================
     Prefijo _pant_: aca SI puede haber diferencias, y son el CONTROL POSITIVO de que la sonda
     distingue escenarios. Sin ellos, un cero en superficie firmada no se distingue de una
     sonda que no mira nada. */
  ['pop-concl-box', 'pop-pocus-vd', 'pop-pocus-peri', 'pop-pocus-pleura', 'pop-pocus-pulmon',
   'pop-esq-txt', 'pop-sw-ic', 'pop-sw-rvs', 'pop-sw-rvp', 'pop-sw-vs', 'pop-eco-ic',
   'pop-eco-gc', 'pop-pam-aviso', 'pop_farmacos_cnt', 'pop_mon_lbl',
   'pop_nor_calc', 'pop_adr_calc', 'pop_dob_calc'].forEach(function (id) {
    const e = document.getElementById(id);
    out['_pant_' + id] = e ? N(e.textContent) : 'NO EXISTE';
  });
  /* El ORDEN de las tarjetas del modulo, de marcado: es lo que el commit 1 cambia. */
  out['_pant_pop_orden'] = [].slice.call(document.querySelectorAll('#pop-seccion [data-pop]'))
    .map(function (c) { return c.getAttribute('data-pop') }).join(',');
  /* El DESPLEGABLE: si existe, si esta abierto y que dice su encabezado. */
  out['_pant_pop_detalle'] = (function () {
    const d = document.getElementById('pop_farmacos_det');
    if (!d) return 'NO EXISTE';
    return (d.open ? 'abierto' : 'cerrado') + ' | ' +
           N((document.getElementById('pop_farmacos_sum') || {}).textContent);
  })();
  /* El CAMPO de la linea arterial: si existe, si se ve y su valor. */
  out['_pant_pop_pai'] = (function () {
    const i = document.getElementById('pop_pai_pam');
    if (!i) return 'NO EXISTE';
    const w = document.getElementById('pop_pai_wrap');
    return (w ? (w.style.display === 'none' ? 'oculto' : 'visible') : 'sin envoltorio') +
           ' | ' + String(i.value || '');
  })();
  /* El SELECTOR de timing del balon. */
  out['_pant_pop_timing'] = (function () {
    const sl = document.getElementById('pop_bcia_timing');
    if (!sl) return 'NO EXISTE';
    const w = document.getElementById('pop_bcia_timing_wrap');
    return (w ? (w.style.display === 'none' ? 'oculto' : 'visible') : 'sin envoltorio') +
           ' | ' + String(sl.value || '');
  })();
  /* Los NODOS del dibujo que esta tanda agrega, por su marca data-pop-esq. */
  out['_pant_pop_dibujo'] = (function () {
    const svg = document.getElementById('pop-esq-svg');
    if (!svg) return 'NO EXISTE';
    const ver = function (k) { const e = svg.querySelector('[data-pop-esq="' + k + '"]');
      return k + '=' + (e ? (e.getAttribute('display') || 'inline') : 'no') };
    const lb = svg.querySelectorAll('[data-pop-esq="lineaB"]');
    const tim = svg.querySelector('[data-pop-esq="timing"]');
    return [ver('impella'), ver('helice'), ver('ecmovv'), ver('ecmova'), ver('balon'),
            ver('pleuraD'), ver('pleuraI'),
            'lineaB=' + (lb.length ? [].slice.call(lb).filter(function (e) {
              return (e.getAttribute('display') || 'inline') !== 'none' }).length : 'no'),
            'timing=' + (tim ? N(tim.textContent) : 'no')].join(' ');
  })();
  /* La CONCLUSION: su texto normalizado, el patron y las senales sueltas, por separado. */
  out['_pant_pop_patron'] = (function () {
    try { const r = popPatron(); return r && r.pat ? (r.pat.k + ' | ' + r.pat.lbl) : 'null' }
    catch (e) { return 'EXC ' + String(e).slice(0, 80) }
  })();
  out['_pant_pop_senales'] = (function () {
    try { const r = popPatron(); return (r && r.senales) ? r.senales.join(' || ') : 'SIN CAMPO' }
    catch (e) { return 'EXC' }
  })();
  /* == EL DENOMINADOR DE LA TANDA POP-V2 ====================================================
     Sin esto, un cero no se distingue de «la escena no llego a la zona»: sin indice cardiaco la
     conclusion dice «Datos insuficientes», el boton de integrar queda deshabilitado y la hoja
     del PDF no se emite. */
  out['_pop_denom'] = (function () {
    const j = {};
    try { const r = popPatron();
      j.ic = r.ic === null ? null : Number(r.ic.toFixed(3));
      j.icBanda = r.icBanda ? r.icBanda.txt : null;
      j.pcp = r.pcp; j.rvs = r.rvs === null ? null : Math.round(r.rvs);
      j.pam = r.pam; j.pamFuente = r.pamFuente; j.tapse = r.tapse; j.vdvi = r.vdvi;
      j.suficiente = r.suficiente; j.nPreg = (r.preguntas || []).length;
      j.nSen = (r.senales || []).length;
    } catch (e) { j.popPatron = 'EXC ' + String(e).slice(0, 80) }
    try { j.dosisNor = N((document.getElementById('pop_nor_calc') || {}).textContent) } catch (e) {}
    try { j.dosisNorVal = String((document.getElementById('pop_nor_dosis') || {}).value || '') } catch (e) {}
    try { j.integrado = (typeof amiloIntegrado === 'function') ? !!amiloIntegrado('pop') : 'sin fn' } catch (e) {}
    try { const b = document.getElementById('pop_integrar'); j.btn = b ? (b.disabled ? 'off' : 'on') : 'no' } catch (e) {}
    try { j.hojaPop = (typeof amiloTextoPOP === 'function') ? amiloTextoPOP().length : 'sin fn' } catch (e) {}
    try { j.sumaPop = (typeof popSumaLinea === 'function') ? popSumaLinea() : 'sin fn' } catch (e) {}
    try { j.lacCorte = (typeof POP_LACTATO_MAX !== 'undefined') ? POP_LACTATO_MAX : 'no existe' } catch (e) { j.lacCorte = 'no existe' }
    return JSON.stringify(j);
  })();
  return out;
})()`;

/* ══ 10 · EL PPT, espiando a PptxGenJS ═══════════════════════════════════════════════════════ */
const PPT = `(async () => {
  if (typeof window.PptxGenJS === 'undefined') return { err: 'SIN PPTXGENJS' };
  const Orig = window.PptxGenJS;
  const reg = { textos: [], slides: 0, tablas: 0 };
  window.PptxGenJS = function (...a) {
    const p = new Orig(...a);
    const oa = p.addSlide.bind(p);
    p.addSlide = function (...z) { reg.slides++; const s = oa(...z);
      const ot = s.addText.bind(s);
      s.addText = function (t, ...r) { reg.textos.push(JSON.stringify(t).slice(0, 400)); return ot(t, ...r) };
      /* ⚠️ EL ESPIA HEREDADO SOLO MIRABA addText, Y LAS TABLAS DEL PPT VAN POR addTable.
         La fila «Perfil de Forrester» de la diapositiva de Hemodinamica es una FILA DE TABLA,
         asi que no aparecia en el volcado y el A/B daba cero sobre ella sin que eso probara
         nada: es el denominador vacio que este repositorio documenta. Las tandas que usaron
         esta sonda midieron «el PPT (23 textos)» sin ninguna tabla adentro. */
      if (typeof s.addTable === 'function') {
        const oTb = s.addTable.bind(s);
        s.addTable = function (filas, ...r) { reg.tablas++;
          /* ADVERTENCIA: 1200 caracteres NO alcanzan. La franja de drogas del posoperatorio cae
             DENTRO de la tabla de contexto, y con el recorte en 1200 la dosis quedaba cortada: el
             A/B del commit 2 daba cero sobre el PPT sin que eso probara nada. Medido. */
          reg.textos.push('[TABLA] ' + JSON.stringify(filas).slice(0, 6000)); return oTb(filas, ...r) };
      }
      return s; };
    p.writeFile = function () { return Promise.resolve(true) };
    p.write = function () { return Promise.resolve('') };
    return p;
  };
  Object.keys(Orig).forEach(k => { try { window.PptxGenJS[k] = Orig[k] } catch (e) {} });
  /* ⚠️ EL DENOMINADOR DEL PPT: generarPPT(id) exige un estudio GUARDADO con informe y
     contesta DOS modales. La primera version de esta sonda lo llamaba con el id de un boton y
     devolvia «0 diapositivas, sin error», que es indistinguible de «el PPT no cambio». Aca se
     inyecta un estudio sintetico armado con los campos de la escena y se contestan los dos
     modales, asi que el constructor corre de verdad. Si slides sale 0, la medicion NO vale. */
  const campos = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
    campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    /* ADVERTENCIA: UNA CASILLA SE PERSISTE COMO <id>__chk, NO COMO <id>, Y ESTA SONDA LO TENIA
       MAL. generarPPT carga el estudio guardado en el formulario -pdfDeInformeGuardado- y la
       reposicion lee c[el.id + '__chk']; sin esa clave, TODAS las casillas vuelven apagadas.
       Medido: la franja de drogas del posoperatorio decia «sin infusion activa» sobre una
       escena con la noradrenalina marcada, en los DOS arboles, asi que el A/B daba cero sobre
       el PPT sin que eso probara nada. Es un denominador envenenado del arnes, no un defecto de
       la app. Viene heredado de _probe_r2ab.mjs: las sondas de las tandas R2, A, B, C1 y C2
       tienen el mismo defecto y midieron su PPT con todas las casillas apagadas. */
    if (e.type === 'checkbox') campos[e.id + '__chk'] = e.checked ? '1' : '0';
  });
  campos.informe_texto = String((document.getElementById('informe_texto') || {}).value || '');
  campos.en_suma = String((document.getElementById('en_suma') || {}).value || '');
  campos['med-nombre'] = 'Medico de prueba';
  const ESTU = { id: '__ab__', fecha: '2026-10-26', nombre: 'AB Tanda A', campos: campos };
  const oGI = window.getInformes, oTema = window._pptElegirTema, oQuien = window._pptElegirPresentador;
  window.getInformes = function () { return [ESTU] };
  window._pptElegirTema = function (cb) { return cb('dark') };
  window._pptElegirPresentador = function (inf, cb) { return cb('Medico de prueba') };
  let err = null;
  try { if (typeof generarPPT === 'function') await generarPPT('__ab__'); } catch (e) { err = String(e).slice(0, 140) }
  await new Promise(r => setTimeout(r, 900));
  window.getInformes = oGI; window._pptElegirTema = oTema; window._pptElegirPresentador = oQuien;
  window.PptxGenJS = Orig;
  return { slides: reg.slides, n: reg.textos.length, txt: reg.textos.join(' | '), err: err };
})()`;

/* 8-9 · EL PDF GENERADO DE VERDAD en sus seis plantillas, espiando el constructor de jsPDF. */
const PDF = `(async () => {
  const PL = ['clasico', 'moderno', 'minimalista', 'academico', 'compacto', 'elegante'];
  const r = {};
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { err: 'SIN JSPDF' };
  const Orig = window.jspdf.jsPDF;
  for (const p of PL) {
    const reg = { textos: [], nFigs: 0 };
    window.jspdf.jsPDF = function (...a) {
      const d = new Orig(...a);
      const ot = d.text.bind(d);
      d.text = function (t, x, y, ...rest) { reg.textos.push(String(t)); return ot(t, x, y, ...rest) };
      ['circle', 'line', 'rect', 'addImage', 'triangle'].forEach(m => {
        if (typeof d[m] === 'function') { const o = d[m].bind(d); d[m] = function (...z) { reg.nFigs++; return o(...z) } }
      });
      d.save = function () { return true };
      d.output = function () { return '' };
      return d;
    };
    Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
    try { const pl = document.getElementById('pdf_plantilla'); if (pl) { pl.value = p;
            pl.dispatchEvent(new Event('change', { bubbles: true })) } } catch (e) {}
    try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
          else if (typeof generarPDF === 'function') await generarPDF() } catch (e) { reg.err = String(e).slice(0, 110) }
    r[p] = { n: reg.textos.length, figs: reg.nFigs, txt: reg.textos.join(' | ') };
  }
  window.jspdf.jsPDF = Orig;
  return r;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  const pg = await b.newPage({ viewport: { width: 1200, height: 700 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 150)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);
  for (const k of SOLO) {
    if (!ESCENAS[k]) continue;
    await pg.evaluate(MONTAR.replace('ESC', JSON.stringify(ESCENAS[k])));
    /* ⚠️ EL DEBOUNCE DE 220 ms TIENE QUE HABER CORRIDO ANTES DE MEDIR. Los campos se ponen
       despachando `input` y `change`, asi que el barrido de espejos queda AGENDADO: midiendo en
       el acto se lee el arbol de antes del barrido, y los tres nodos de pantalla de la PAM
       salen vacios en los dos lados. Medido: sin esta espera el control positivo daba cero. */
    await new Promise((r) => setTimeout(r, 500));
    OUT[k] = await pg.evaluate(MEDIR);
    /* ADVERTENCIA: EL PPT VA ANTES DEL PDF, Y SE MIDIO POR QUE. Con el PDF primero, la franja
       de drogas del posoperatorio salia «sin infusion activa» en la diapositiva sobre una
       escena con la noradrenalina MARCADA: generar el PDF deja las casillas del modulo en otro
       estado, asi que el A/B del commit 2 daba cero sobre el PPT sin que eso probara nada.
       Es un denominador envenenado, no una diferencia. Medido en los dos arboles. */
    OUT[k]._ppt = await pg.evaluate(PPT);
    OUT[k]._pdf = await pg.evaluate(PDF);
    console.log('-- escena ' + k + ' medida (campos=' + OUT[k]._camposN + ' excel=' + OUT[k]._excelN
      + ' secciones de Evidencia=' + OUT[k]._evN + ' compactas=' + OUT[k]._evCompactas
      + ' ppt=' + (OUT[k]._ppt || {}).n + ') --');
    console.log('   denom POP: ' + (OUT[k]._pop_denom || ''));
  }
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF + ' (' + fs.statSync(OUTF).size + ' bytes)');
