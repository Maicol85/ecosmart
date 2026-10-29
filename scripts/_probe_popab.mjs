#!/usr/bin/env node
/**
 * _probe_popab.mjs - el A/B de SUPERFICIES de la tanda POP-V2 (2026-10-29). Calcado de
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
const OUTF = arg('--out') || '/tmp/ab_pop.json';

/* ══ LAS ESCENAS ═══════════════════════════════════════════════════════════════════════
   Cada una es un objeto de campos + los gestos que no son un campo. El escenario AJENO existe
   para probar que la sonda distingue escenarios: ninguna parte de esta tanda lo toca. */
const ESCENAS = {
  vacio:   { campos: {} },
  derrame: { campos: {}, sel: { pericardio: 'Derrame moderado (10-20mm)', pericardio_hemo: 'no' } },
  vab:     { campos: { ao_sin: '46', ao_tub: '47' }, pastillas: [['aortica', 'esten']],
             sel: { vab_fenotipo: 'rl', va_morf: 'Bicúspide' } },
  htp:     { campos: { vmax_it: '2.8', vd_bas: '45', vd_vi: '0.9', tapse: '18', ip_ap_diam: '28',
                       ao_sin: '30', vci_diam: '24', ad_area: '16', tvia: '120' },
             sel: { vci_col: '>50' } },
  hemo:    { campos: { peso: '80', talla: '180', fc: '70', pam: '90', ddfvi: '50', vsfvi: '35',
                       onda_e: '90', e_sep: '8', e_lat: '10', diam_tsvi_ao: '20', itv_tsvi: '20' } },
  amil:    { campos: { ett_septo_x: '' } },   /* los de amiloidosis van por su propio grupo */
  /* La escena de constriccion/restriccion: el e' medial en el tramo que el R2-E4 mueve, con un
     criterio especifico cargado para que la cascada llegue a clasificar. */
  cvr:     { campos: { e_sep: '7', e_lat: '12', onda_e: '100' },
             sel: { cvr_rebote: 'si', resp_var_tric: '45' } },
  /* La de amiloidosis: septo ASIMETRICO, que es la escena que el R2-E5 pide mostrar. */
  amilo:   { campos: { rwt_septo_x: '' } },
  /* ══ ESCENAS NUEVAS DE LA TANDA A ═══════════════════════════════════════════════════════
     Despiertan las cuatro secciones compactas que la sonda de la R2 no cubria. Si una no
     despierta, el `_ev` de su medicion sale vacio y el denominador lo dice. */
  fallot:  { campos: { tdf_grad_tsvd: '30', tdf_vtsvdi: '90', tdf_vtdvdi: '170', fevd: '40',
                       fevi: '45', ip_vmax: '2.6', vmax_it: '3.2' },
             sel: { tdf_civ_residual: 'no', tdf_sintomas: 'no', tdf_func_vd: 'moderada',
                    tdf_vol_fuente: 'rmc', tdf_ejercicio: 'si', ip_grado: 'Severa' } },
  /* La de amiloidosis: el modulo pide espesor Y puntos del score, si no _indAmil no despierta
     -medido: las escenas amil y amilo de la R2 dan CERO secciones-. */
  amiloid: { campos: {}, sel: { 'ett-septo': '16', 'ett-pp': '14', 'ett-rwt': '1', 'ett-ee': '1',
                                'ett-cual-1': '1', 'ett-cual-2': '1' } },
  vexus:   { campos: { vci_diam: '24' }, sel: { vexus_sh: '2', vexus_pv: '1', vexus_ir: '2' } },
  /* ══ ESCENAS DE LA TANDA C1 ══════════════════════════════════════════════════════════════
     ⚠️ CADA UNA TIENE SU DENOMINADOR DECLARADO EN EL VOLCADO. Una escena de VExUS que no
     llega a graduar deja `_pant_vexus-interp` vacio y el A/B da cero sin que eso pruebe nada:
     es la trampa del denominador que este repositorio documenta. Por eso la sonda publica
     `_c1_denom`, que dice cuales de las cinco zonas DESPERTARON en esa escena.

     Los cuatro grados de VExUS, uno por escena. La regla la decide `vexusGrado`:
       g0 — vena cava por debajo de 20 mm (los vasos no cuentan)
       g1 — 20 mm o mas y NINGUN vaso severo
       g2 — mas de 20 mm y EXACTAMENTE un vaso severo
       g3 — mas de 20 mm y dos o mas vasos severos */
  vxg0:    { campos: { vci_diam: '15' }, sel: { vexus_sh: '2', vexus_pv: '2', vexus_ir: '2' } },
  vxg1:    { campos: { vci_diam: '24' }, sel: { vexus_sh: '1', vexus_pv: '1', vexus_ir: '0' } },
  vxg2:    { campos: { vci_diam: '24' }, sel: { vexus_sh: '2', vexus_pv: '1', vexus_ir: '0' } },
  vxg3:    { campos: { vci_diam: '24' }, sel: { vexus_sh: '2', vexus_pv: '2', vexus_ir: '0' } },
  /* ── EL FORRESTER: sus cuatro cuadrantes y sus DOS bordes ──────────────────────────────────
     El IC sale de VS x FC / 1000 / ASC y la PCP de Nagueh sobre E/e'. Los valores se eligieron
     resolviendo las dos cuentas hacia atras; el volcado publica el IC y la PCP medidos, asi
     que si un numero no cae donde se penso, se ve en el propio volcado y no hay que suponerlo.
     Peso 80 / talla 180 -> ASC 2,0 m2 (Mosteller). DTSVI 20 mm, VTI-TSVI 20 cm -> VS 62,8 mL.
       FC 80 -> GC 5,03 -> IC 2,51   (por encima de 2,2: NO frio)
       FC 60 -> GC 3,77 -> IC 1,88   (por debajo de 2,2: frio)
     PCP = 1,24 x (E/e') + 1,9:  E/e' 8  -> 11,8 mmHg (<=15: seco)
                                 E/e' 16 -> 21,7 mmHg (>15: humedo) */
  forA:    { campos: { peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20',
                       onda_e:'80', e_sep:'10', e_lat:'10' } },
  forB:    { campos: { peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20',
                       onda_e:'160', e_sep:'10', e_lat:'10' } },
  forL:    { campos: { peso:'80', talla:'180', hemo_fc:'60', diam_tsvi:'20', itv_tsvi:'20',
                       onda_e:'80', e_sep:'10', e_lat:'10' } },
  forC:    { campos: { peso:'80', talla:'180', hemo_fc:'60', diam_tsvi:'20', itv_tsvi:'20',
                       onda_e:'160', e_sep:'10', e_lat:'10' } },
  /* Los TRES mensajes de «falta...»: sin PCP, sin IC, sin ninguno de los dos. */
  forSinPcp: { campos: { peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20' } },
  forSinIc:  { campos: { peso:'80', talla:'180', onda_e:'80', e_sep:'10', e_lat:'10' } },
  forSinNada:{ campos: { peso:'80', talla:'180' } },
  /* Las DOS escenas que llegan al papel: el bloque de hemodinamica INTEGRADO, una con el
     Forrester completo -control negativo: el texto no cambia- y otra con la PCP faltando, que
     es donde el mensaje viaja al informe integrado, a la hoja del PDF y al PPT. */
  forIntOk:  { campos: { peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20',
                         onda_e:'80', e_sep:'10', e_lat:'10' }, integrar: ['hemo'] },
  forIntFal: { campos: { peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20' },
               integrar: ['hemo'] },
  /* ── LA RVS Y SUS CUATRO FUENTES DE PAM ────────────────────────────────────────────────────
     El dueno unico es `pamEfectiva`: cateter, luego tipeada, luego calculada. La RVS necesita
     ademas PVC (que sale de la VCI) y gasto cardiaco. */
  /* ⚠️ LOS NOMBRES REALES SON `pop_sw_pam` y `pop_monitor`, medidos en el marcado. La primera
     version de esta sonda uso `pop_swan_pam` y `pop_asist_tipo`, que NO EXISTEN: el helper `S`
     devuelve «NO EXISTE id» y sigue, asi que la escena montaba sin PAM por cateter y el A/B
     habria dado cero sobre el commit 3a sin que eso probara nada. */
  rvsCat:  { campos: { peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20',
                       vci_diam:'18', pop_sw_pam:'58' }, sel: { vci_col:'>50', pop_monitor:'swan' } },
  rvsTip:  { campos: { peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20',
                       vci_diam:'18', hemo_pam:'90' }, sel: { vci_col:'>50' } },
  rvsDos:  { campos: { peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20',
                       vci_diam:'18', hemo_pam:'90', pop_sw_pam:'58' },
             sel: { vci_col:'>50', pop_monitor:'swan' } },
  rvsNada: { campos: { peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20',
                       vci_diam:'18' }, sel: { vci_col:'>50' } },
  /* ── EL POCUS DEL POSOPERATORIO ────────────────────────────────────────────────────────────
     `popVdNum` carga `vd_vi` DIRECTO, que es el campo de la pestana VD/AD que el bloque no
     miraba: es la escena del defecto. `popVdDer` usa la derivacion de `vd_bas / ddfvi`, que YA
     funcionaba -control negativo: no puede cambiar-. `popVdSel` deja el SELECTOR de tramo sin
     numero. `popSinVd` no tiene ninguno de los tres. */
  popVdNum:{ campos: { pop_cx_horas:'12', vd_vi:'1.30', tapse:'16' }, sel: { pop_cx_tipo:'cabg' } },
  popVdDer:{ campos: { pop_cx_horas:'12', vd_bas:'39', ddfvi:'30', tapse:'16' },
             sel: { pop_cx_tipo:'cabg' } },
  popVdSel:{ campos: { pop_cx_horas:'12', tapse:'16' },
             sel: { pop_cx_tipo:'cabg', vd_vi_sel: 'gt1' } },
  popSinVd:{ campos: { pop_cx_horas:'12', tapse:'16' }, sel: { pop_cx_tipo:'cabg' } },
  /* Las mismas dos, con el bloque del posoperatorio INTEGRADO: es la unica forma de que el
     POCUS llegue a la hoja del PDF y al PPT, igual que el bloque de hemodinamica. */
  popIntNum:{ campos: { pop_cx_horas:'12', vd_vi:'1.30', tapse:'16' },
              sel: { pop_cx_tipo:'cabg' }, integrar: ['pop'] },
  popIntSin:{ campos: { pop_cx_horas:'12', tapse:'16' },
              sel: { pop_cx_tipo:'cabg' }, integrar: ['pop'] },
  /* La RVS por cateter con el bloque de hemodinamica integrado: la diferencia (d) en el papel. */
  rvsIntCat:{ campos: { peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20',
                        vci_diam:'18', pop_sw_pam:'58' },
              sel: { vci_col:'>50', pop_monitor:'swan' }, integrar: ['hemo'] },
  /* ── LA TABLA DE SIGNOS DE HTP con una casilla MANUAL sin marcar y una AUTOMATICA medida ──── */
  htpSig:  { campos: { vmax_it:'3.2', tvia:'120', ip_ap_diam:'28', ao_sin:'30', ad_area:'16',
                       vci_diam:'24', vd_bas:'45', ddfvi:'40', tapse:'18' },
             sel: { vci_col:'>50' } },
  conco:   { campos: { co_fevi_basal: '60', co_fevi_actual: '45', co_dosis_antrac: '300',
                       co_gls_basal: '-20', co_gls_actual: '-15' },
             sel: { co_farmaco: 'inmunoterapia', co_troponi: 'si' } },
  pop:     { campos: { pop_cx_horas: '12' },
             sel: { pop_cx_tipo: 'cabg', pop_asist_tipo: 'ecmo_va', pop_pleura_der: 'moderado' } },
  /* ══ ESCENAS DE LA TANDA B ═══════════════════════════════════════════════════════════
     Las tres con UNA sola fuente de PAM -donde el papel tiene que salir IDENTICO- y una
     cuarta con dos que difieren, que es la unica donde se permite una diferencia y donde
     ademas sirve de control de que la sonda distingue escenarios. El posoperatorio va
     poblado en las cuatro: es el modulo que publica la PAM en una hoja del PDF. */
  pamI:    { campos: { peso: '80', talla: '175', pop_cx_horas: '8', pop_sw_pam: '58',
                       pop_sw_gc: '4.2', pop_sw_pad: '9', pop_sw_pcp: '14', pop_sw_paps: '38',
                       pop_sw_papd: '18', diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75' },
             sel: { pop_monitor: 'swan' } },
  pamT:    { campos: { peso: '80', talla: '175', pop_cx_horas: '8', hemo_pam: '95',
                       diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75', vci_diam: '22' } },
  pamC:    { campos: { peso: '80', talla: '175', pop_cx_horas: '8', ao_pas: '120', ao_pad: '70',
                       diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75', vci_diam: '22' } },
  pamIT:   { campos: { peso: '80', talla: '175', pop_cx_horas: '8', pop_sw_pam: '58',
                       pop_sw_gc: '4.2', pop_sw_pad: '9', pop_sw_pcp: '14', hemo_pam: '95',
                       diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75' },
             sel: { pop_monitor: 'swan' } },
  /* ══ ESCENAS DE LA TANDA C2 ═══════════════════════════════════════════════════════════
     ── ECO PULMONAR ───────────────────────────────────────────────────────────────────────
     `pua_balik` en 25 mm es el ejemplo literal de la orden: 25 x 20 = 500 ml. El modulo se
     INTEGRA en casi todas porque hasta hoy esa es la compuerta del informe (`pulAvanzadoIntegrado`);
     `pulSinInt` es la misma escena SIN integrar, que es el control de esa compuerta. */
  pulDer:  { campos: { pua_balik: '25' },
             sel: { pua_derrame: 'si', pua_derrame_tipo: 'libre', pua_derrame_lado: 'bilateral',
                    pul_derrame_tam: 'moderado' }, integrar: ['pulm'] },
  /* Fuera del rango plausible: la frase NO estima volumen y eso no lo toca esta tanda. */
  pulFuera:{ campos: { pua_balik: '200' },
             sel: { pua_derrame: 'si', pua_derrame_lado: 'bilateral' }, integrar: ['pulm'] },
  pulCons: { campos: { pul_consol_nota: 'base derecha' },
             sel: { pua_consol: 'si', pua_consol_bronco: 'con' }, integrar: ['pulm'] },
  /* LAS DOS JUNTAS: es la escena del 1d -el ORDEN del EN SUMA, derrame primero-. */
  pulDos:  { campos: { pua_balik: '25', pul_consol_nota: 'base derecha' },
             sel: { pua_derrame: 'si', pua_derrame_lado: 'bilateral', pul_derrame_tam: 'moderado',
                    pua_consol: 'si', pua_consol_bronco: 'con' }, integrar: ['pulm'] },
  /* El patron completo: deslizamiento, lineas A y B, para el esquema por lineas del 1g. */
  pulPatr: { campos: { pua_balik: '25' },
             sel: { pua_desliz: 'presente', pua_desliz_lado: 'bilateral', pua_lineasa: 'presentes',
                    pua_lineasb: 'presentes', pua_lineasb_cant: 'multiples', pua_derrame: 'si',
                    pua_derrame_lado: 'bilateral', pul_derrame_tam: 'moderado', pua_consol: 'no' },
             integrar: ['pulm'] },
  pulNeumo:{ campos: {}, sel: { pua_desliz: 'abolido', pua_lineasa: 'presentes',
                                pua_lineasb: 'ausentes', pua_punto: 'si' }, integrar: ['pulm'] },
  /* El UNICO patron que publica «Correlacionar con la clinica»: deslizamiento anormal que no
     llega a ninguna rama. Es la escena del 1f. */
  pulIndet:{ campos: {}, sel: { pua_desliz: 'reducido' }, integrar: ['pulm'] },
  /* SIN integrar: hoy el informe queda MUDO sobre el pulmon. Es el denominador del 1h. */
  pulSinInt:{ campos: { pua_balik: '25' },
              sel: { pua_derrame: 'si', pua_derrame_lado: 'bilateral', pul_derrame_tam: 'moderado' } },
  /* ── CONSTRICCION vs RESTRICCION ────────────────────────────────────────────────────────
     Los dos lados del 0,78. La fila «Lectura» y el veredicto NO pueden cambiar (commit 2). */
  cvrAlto: { campos: { cvr_hep_coc: '0.79', e_sep: '7', e_lat: '12', onda_e: '100' },
             sel: { cvr_rebote: 'si', cvr_hepatico: 'esp' } },
  cvrBajo: { campos: { cvr_hep_coc: '0.78', e_sep: '7', e_lat: '12', onda_e: '100' },
             sel: { cvr_rebote: 'si', cvr_hepatico: 'esp' } },
  cvrInt:  { campos: { cvr_hep_coc: '0.79', e_sep: '7', e_lat: '12', onda_e: '100' },
             sel: { cvr_rebote: 'si', cvr_hepatico: 'esp' }, integrar: ['cvr'] },
  /* ── LOS SEIS BORDES DEL FORRESTER (commit 4) ───────────────────────────────────────────
     La PCP sale de la formula de Nagueh: PCP = 1,24 x (E/e') + 1,9. Para apuntarle a un valor
     se despeja el E/e': PCP 15 -> E/e' = 10,56 ; PCP 18 -> 12,98 ; PCP 19 -> 13,79.
     Con `onda_e` fija en 130 se busca el e' promedio que da ese cociente.
     El IC = GC/BSA, con GC = area del TSVI x ITV x FC. Peso 80 / talla 180 -> BSA 1,99.
     ⚠️ LOS VALORES SE VERIFICAN EN EL VOLCADO (`_c2_denom`), no se dan por buenos: si el
     E/e' no cae donde se quiere, la escena no esta en el borde y el A/B no prueba nada. */
  forPcp15: { campos: { peso:'80', talla:'180', hemo_fc:'70', diam_tsvi:'20', itv_tsvi:'20',
                        onda_e:'130', e_sep:'11.6', e_lat:'13.0' } },
  forPcp18: { campos: { peso:'80', talla:'180', hemo_fc:'70', diam_tsvi:'20', itv_tsvi:'20',
                        onda_e:'130', e_sep:'9.5', e_lat:'10.5' } },
  forPcp19: { campos: { peso:'80', talla:'180', hemo_fc:'70', diam_tsvi:'20', itv_tsvi:'20',
                        onda_e:'130', e_sep:'9.0', e_lat:'9.9' } },
  forIc21:  { campos: { peso:'80', talla:'180', hemo_fc:'60', diam_tsvi:'20', itv_tsvi:'22',
                        onda_e:'80', e_sep:'10', e_lat:'10' } },
  forIc22:  { campos: { peso:'80', talla:'180', hemo_fc:'63', diam_tsvi:'20', itv_tsvi:'22',
                        onda_e:'80', e_sep:'10', e_lat:'10' } },
  forIc23:  { campos: { peso:'80', talla:'180', hemo_fc:'66', diam_tsvi:'20', itv_tsvi:'22',
                        onda_e:'80', e_sep:'10', e_lat:'10' } },
  /* ⚠️ EL DENOMINADOR DE LA DIFERENCIA (b): la MISMA escena `forPcp15` con el bloque de
     hemodinamica INTEGRADO. Sin ella, el A/B del commit 4 da «cero en superficie firmada» y eso
     no se distingue de «la sonda no mira una escena donde el cambio pueda actuar»: la capsula
     del Forrester llega al informe integrado, a la hoja de ETT Avanzado del PDF y al PPT SOLO
     si el medico integro el modulo. Lo midio la tanda A con su mutacion M15. */
  forIntPcp15: { campos: { peso:'80', talla:'180', hemo_fc:'70', diam_tsvi:'20', itv_tsvi:'20',
                           onda_e:'130', e_sep:'11.6', e_lat:'13.0' }, integrar: ['hemo'] },
  /* ── AMILOIDOSIS: el boton «Traer del formulario» del commit 3 ──────────────────────────
     Con los ocho datos compartidos cargados, que es donde el D-11 midio que el boton no hace
     nada y avisa al reves. */
  amiBoton: { campos: { siv:'14', ppvi:'12', ddfvi:'45', tapse:'16', e_sep:'6', e_lat:'8',
                        onda_e:'90', gls:'-14' } },
  /* ══ ESCENAS DE LA TANDA POP-V2 ═════════════════════════════════════════════════════════
     ⚠️ CADA UNA PUBLICA SU DENOMINADOR EN `_pop_denom`: una escena que no llega a tener indice
     cardiaco deja la conclusion en «Datos insuficientes», el boton «Integrar» deshabilitado y la
     hoja del PDF sin emitir, y entonces un «cero diferencias» no se distingue de «la escena no
     llego a la zona». Es la trampa del denominador que este repositorio documenta.
     ── EL MODULO VACIO Y EL MODULO CARGADO ───────────────────────────────────────────────────
     `popVacio` no toca un solo campo del posoperatorio: es donde el pedido exige que informe,
     EN SUMA, PDF, PPT y Excel salgan IDENTICOS a HEAD. */
  popVacio:  { campos: { peso: '70', talla: '170', ddfvi: '50' } },
  /* Peso 70 / talla 170 -> SC 1,8277 m2 (Mosteller). GC 3,2 -> IC 1,75 (bajo).
     PCP 22 (>18) y RVS (58-14)/3,2*80 = 1100 (normal) -> patron «falla del VI». */
  popLleno:  { campos: { peso: '70', talla: '170', pop_cx_horas: '6', pop_lactato: '3.4',
                         pop_sw_gc: '3.2', pop_sw_fc: '88', pop_sw_pam: '58', pop_sw_paps: '42',
                         pop_sw_papd: '20', pop_sw_pcp: '22', pop_sw_pad: '14',
                         tapse: '12', tep_vdvi: '1.1' },
               sel: { pop_monitor: 'swan', pop_cx_tipo: 'cabg', pop_asist_tipo: 'bcia',
                      pop_pleura_der: 'moderado', pop_pleura_izq: 'leve',
                      pop_pulmon_lineasb: 'difusas' } },
  popLlenoInt: { campos: { peso: '70', talla: '170', pop_cx_horas: '6', pop_lactato: '3.4',
                           pop_sw_gc: '3.2', pop_sw_fc: '88', pop_sw_pam: '58', pop_sw_paps: '42',
                           pop_sw_papd: '20', pop_sw_pcp: '22', pop_sw_pad: '14',
                           tapse: '12', tep_vdvi: '1.1' },
                 sel: { pop_monitor: 'swan', pop_cx_tipo: 'cabg', pop_asist_tipo: 'bcia',
                        pop_pleura_der: 'moderado', pop_pleura_izq: 'leve',
                        pop_pulmon_lineasb: 'difusas' }, integrar: ['pop'] },
  /* ── LAS DOSIS POR DILUCION ────────────────────────────────────────────────────────────────
     El caso conocido del pedido: 4 mg en 100 ml a 21 ml/h con 70 kg -> 0,20 mcg/kg/min.
     `dosisMano` tiene la MISMA dilucion y ademas una dosis tipeada que NO es la calculada: es
     donde se comprueba que no se pisa. `dosisSinPeso` no tiene peso. */
  dosisAuto: { campos: { peso: '70', talla: '170', pop_cx_horas: '6', pop_sw_gc: '3.2',
                         pop_sw_pam: '70', pop_nor_diluc_mg: '4', pop_nor_diluc_ml: '100',
                         pop_nor_veloc: '21' },
               chk: ['pop_nor_activa'], sel: { pop_monitor: 'swan' } },
  dosisMano: { campos: { peso: '70', talla: '170', pop_cx_horas: '6', pop_sw_gc: '3.2',
                         pop_sw_pam: '70', pop_nor_diluc_mg: '4', pop_nor_diluc_ml: '100',
                         pop_nor_veloc: '21', pop_nor_dosis: '0.35' },
               chk: ['pop_nor_activa'], sel: { pop_monitor: 'swan' } },
  dosisSinPeso: { campos: { pop_cx_horas: '6', pop_nor_diluc_mg: '4', pop_nor_diluc_ml: '100',
                            pop_nor_veloc: '21' },
                  chk: ['pop_nor_activa'], sel: { pop_monitor: 'swan' } },
  dosisAutoInt: { campos: { peso: '70', talla: '170', pop_cx_horas: '6', pop_sw_gc: '3.2',
                            pop_sw_pam: '70', pop_nor_diluc_mg: '4', pop_nor_diluc_ml: '100',
                            pop_nor_veloc: '21' },
                  chk: ['pop_nor_activa'], sel: { pop_monitor: 'swan' }, integrar: ['pop'] },
  /* ── LA PAM Y SUS CUATRO FUENTES, CON LA LINEA ARTERIAL ───────────────────────────────────
     `pamArt` elige «Presion arterial invasiva solamente», que es la opcion que hasta esta tanda
     no abria ningun campo. `pamArtSwan` tiene las DOS: el Swan gana, por precedencia.
     `pamArtTip` tiene la linea arterial y la tipeada: la linea gana. */
  pamArt:     { campos: { peso: '70', talla: '170', pop_cx_horas: '6', pop_pai_pam: '62',
                          diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75', vci_diam: '18' },
                sel: { pop_monitor: 'pai', vci_col: '>50' } },
  pamArtSwan: { campos: { peso: '70', talla: '170', pop_cx_horas: '6', pop_pai_pam: '62',
                          pop_sw_pam: '58', pop_sw_gc: '3.2', pop_sw_pad: '14' },
                sel: { pop_monitor: 'swan' } },
  pamArtTip:  { campos: { peso: '70', talla: '170', pop_cx_horas: '6', pop_pai_pam: '62',
                          hemo_pam: '95', diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75',
                          vci_diam: '18' },
                sel: { pop_monitor: 'pai', vci_col: '>50' } },
  pamArtInt:  { campos: { peso: '70', talla: '170', pop_cx_horas: '6', pop_pai_pam: '62',
                          diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75', vci_diam: '18' },
                sel: { pop_monitor: 'pai', vci_col: '>50' }, integrar: ['pop'] },
  /* ── LOS DISPOSITIVOS DEL DIBUJO ──────────────────────────────────────────────────────────
     Los tres timings del balon van en escenas propias: el rotulo del dibujo es lo unico que
     cambia entre ellas, y con una sola escena una mutacion que lo borre sobrevive. */
  dispImp:  { campos: { peso: '70', talla: '170', pop_sw_gc: '3.2', pop_sw_pam: '70' },
              sel: { pop_monitor: 'swan', pop_asist_tipo: 'impella', pop_impella_nivel: 'P4' } },
  dispEcmoVV: { campos: { peso: '70', talla: '170', pop_sw_gc: '3.2', pop_sw_pam: '70',
                          pop_ecmo_flujo: '4.0' },
                sel: { pop_monitor: 'swan', pop_asist_tipo: 'ecmo_vv' } },
  dispEcmoVA: { campos: { peso: '70', talla: '170', pop_sw_gc: '3.2', pop_sw_pam: '70',
                          pop_ecmo_flujo: '4.5' },
                sel: { pop_monitor: 'swan', pop_asist_tipo: 'ecmo_va' } },
  dispBctSin: { campos: { peso: '70', talla: '170', pop_sw_gc: '3.2', pop_sw_pam: '70' },
                sel: { pop_monitor: 'swan', pop_asist_tipo: 'bcia', pop_bcia_ratio: '1:1' } },
  dispBctVer: { campos: { peso: '70', talla: '170', pop_sw_gc: '3.2', pop_sw_pam: '70' },
                sel: { pop_monitor: 'swan', pop_asist_tipo: 'bcia', pop_bcia_ratio: '1:1',
                       pop_bcia_timing: 'verificado' } },
  dispBctInc: { campos: { peso: '70', talla: '170', pop_sw_gc: '3.2', pop_sw_pam: '70' },
                sel: { pop_monitor: 'swan', pop_asist_tipo: 'bcia', pop_bcia_ratio: '1:1',
                       pop_bcia_timing: 'inconsistente' } },
  dispPleura: { campos: { peso: '70', talla: '170', pop_sw_gc: '3.2', pop_sw_pam: '70' },
                sel: { pop_monitor: 'swan', pop_pleura_der: 'severo', pop_pleura_izq: 'moderado',
                       pop_pulmon_lineasb: 'difusas' } },
  /* ── LOS BORDES DE LOS CORTES DE LA CONCLUSION ────────────────────────────────────────────
     SC 1,8277 con peso 70 / talla 170. GC = IC x SC:
       IC 2,1 -> GC 3,838   IC 2,2 -> GC 4,021   IC 2,3 -> GC 4,204
     La PAM se deja en 70 para que la vasoplejia no se mezcle con el borde del IC. */
  icB21: { campos: { peso:'70', talla:'170', pop_sw_gc:'3.838', pop_sw_pam:'70', pop_sw_pad:'10',
                     pop_sw_pcp:'14' }, sel: { pop_monitor:'swan' } },
  icB22: { campos: { peso:'70', talla:'170', pop_sw_gc:'4.021', pop_sw_pam:'70', pop_sw_pad:'10',
                     pop_sw_pcp:'14' }, sel: { pop_monitor:'swan' } },
  icB23: { campos: { peso:'70', talla:'170', pop_sw_gc:'4.204', pop_sw_pam:'70', pop_sw_pad:'10',
                     pop_sw_pcp:'14' }, sel: { pop_monitor:'swan' } },
  lacB20: { campos: { peso:'70', talla:'170', pop_sw_gc:'4.204', pop_sw_pam:'70', pop_sw_pad:'10',
                      pop_sw_pcp:'14', pop_lactato:'2.0' }, sel: { pop_monitor:'swan' } },
  lacB21: { campos: { peso:'70', talla:'170', pop_sw_gc:'4.204', pop_sw_pam:'70', pop_sw_pad:'10',
                      pop_sw_pcp:'14', pop_lactato:'2.1' }, sel: { pop_monitor:'swan' } },
  tapB16: { campos: { peso:'70', talla:'170', pop_sw_gc:'3.2', pop_sw_pam:'70', tapse:'16',
                      tep_vdvi:'0.80' }, sel: { pop_monitor:'swan' } },
  tapB17: { campos: { peso:'70', talla:'170', pop_sw_gc:'3.2', pop_sw_pam:'70', tapse:'17',
                      tep_vdvi:'0.80' }, sel: { pop_monitor:'swan' } },
  tapB18: { campos: { peso:'70', talla:'170', pop_sw_gc:'3.2', pop_sw_pam:'70', tapse:'18',
                      tep_vdvi:'0.80' }, sel: { pop_monitor:'swan' } },
  vdviB90: { campos: { peso:'70', talla:'170', pop_sw_gc:'3.2', pop_sw_pam:'70', tapse:'20',
                       tep_vdvi:'0.90' }, sel: { pop_monitor:'swan' } },
  vdviB91: { campos: { peso:'70', talla:'170', pop_sw_gc:'3.2', pop_sw_pam:'70', tapse:'20',
                       tep_vdvi:'0.91' }, sel: { pop_monitor:'swan' } },
  /* ── LAS CUATRO SENALES SUELTAS DEL COMMIT 5 ──────────────────────────────────────────────
     Todas con el IC por ENCIMA del corte, que es la condicion de las cuatro: gasto aparentemente
     adecuado. GC 4,204 -> IC 2,3. */
  senSop: { campos: { peso:'70', talla:'170', pop_sw_gc:'4.204', pop_sw_pam:'70', pop_sw_pad:'10',
                      pop_sw_pcp:'14' }, chk: ['pop_nor_activa'], sel: { pop_monitor:'swan' } },
  senLac: { campos: { peso:'70', talla:'170', pop_sw_gc:'4.204', pop_sw_pam:'70', pop_sw_pad:'10',
                      pop_sw_pcp:'14', pop_lactato:'3.4' }, sel: { pop_monitor:'swan' } },
  senPcp: { campos: { peso:'70', talla:'170', pop_sw_gc:'4.204', pop_sw_pam:'70', pop_sw_pad:'10',
                      pop_sw_pcp:'22' }, sel: { pop_monitor:'swan' } },
  senVd:  { campos: { peso:'70', talla:'170', pop_sw_gc:'4.204', pop_sw_pam:'70', pop_sw_pad:'10',
                      pop_sw_pcp:'22', tapse:'12' }, sel: { pop_monitor:'swan' } },
  /* ⚠️ EL CASO QUE MIDIO EL MEDICO: IC 1,57 con PAM 58 y TAPSE 12, donde la conclusion decia
     «Sin patron de bajo gasto ni vasoplejia». GC = 1,57 x 1,8277 = 2,870. */
  medico: { campos: { peso:'70', talla:'170', pop_sw_gc:'2.870', pop_sw_pam:'58', pop_sw_pad:'10',
                      pop_sw_pcp:'14', tapse:'12', pop_lactato:'4.2' },
            sel: { pop_monitor:'swan' } },
  ajeno:   { campos: { im_vc: '8', ea_dtsvi: '20', itv_tsvi: '20', itv_ao: '100', vmax_ao: '4.5',
                       onda_e: '110', e_sep: '5', e_lat: '6', ai_vol: '70', peso: '80', talla: '180' } }
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
