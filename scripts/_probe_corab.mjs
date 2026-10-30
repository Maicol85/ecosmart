#!/usr/bin/env node
/**
 * _probe_yab.mjs - el A/B de SUPERFICIES de la tanda Y, Parte 1 (2026-10-29). Calcado de
 * _probe_popab.mjs, que hereda el linaje _probe_c2ab -> _probe_c1ab -> _probe_bab ->
 * _probe_aab -> _probe_r2ab, con los dos defectos de instrumentacion que esa cadena pago ya
 * corregidos: el _recalcModulos que era un forEach sobre una funcion, y las casillas que se
 * persisten como <id>__chk y no como <id>.
 *
 * Lo que agrega esta tanda son las escenas de VD/AD, del SEXO y de la AORTA:
 *   - el STRAIN de pared libre en sus cuatro bandas mas el 0 y el fuera de banda (commit 1);
 *   - el TRIV por sus DOS puertas y sus bordes 74, 75 y 76 ms (commit 2);
 *   - la RAIZ AORTICA en 35, 36, 39, 40 y 45 mm, sin sexo y con los dos, y el indice de
 *     dimension aortica a los dos lados de 22 mm/m2 (commits 3 y 4);
 *   - la AORTOPATIA HEREDITARIA -Marfan y Turner-, que es donde el commit 4 retira del papel el
 *     umbral, la clase, el nivel y el indice;
 *   - los OTROS SEGMENTOS de la Figura 5 -union sinotubular y ascendente- (commit 5);
 *   - la BICUSPIDE y la COARTACION (commit 6).
 * En MEDIR se agregan los nodos _pant_ de la pestania VD/AD -las once filas de su cuadro de
 * referencias y el cuadro del Doppler tricuspide- y los de la aorta.
 *
 * ⚠️ LA COPIA DE HEAD VA EN EL DIRECTORIO DEL PROYECTO Y NO EN /tmp: el archivo carga su
 * tipografia por ruta RELATIVA, asi que una copia en /tmp fabrica un ERR_FILE_NOT_FOUND que se
 * lee como un error de consola del lado viejo. Es la trampa 8a del mapa de la tanda G.
 *
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
const OUTF = arg('--out') || '/tmp/cor/ab_cor.json';

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
  cvr:     { campos: { e_sep: '7', e_lat: '12', onda_e: '100' },
             sel: { cvr_rebote: 'si', resp_var_tric: '45' } },
  /* La de amiloidosis: septo ASIMETRICO, que es la escena que el R2-E5 pide mostrar. */
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
  pulDer:  { campos: { pua_balik: '25' },
             sel: { pua_derrame: 'si', pua_derrame_tipo: 'libre', pua_derrame_lado: 'bilateral',
                    pul_derrame_tam: 'moderado' }, integrar: ['pulm'] },
  /* Fuera del rango plausible: la frase NO estima volumen y eso no lo toca esta tanda. */
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
  pamArt:     { campos: { peso: '70', talla: '170', pop_cx_horas: '6', pop_pai_pam: '62',
                          diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75', vci_diam: '18' },
                sel: { pop_monitor: 'pai', vci_col: '>50' } },
  senVd:  { campos: { peso:'70', talla:'170', pop_sw_gc:'4.1817', pop_sw_pam:'70', pop_sw_pad:'10',
                      pop_sw_pcp:'22', tapse:'12' }, sel: { pop_monitor:'swan' } },
  /* ⚠️ EL CASO QUE MIDIO EL MEDICO: IC 1,57 con PAM 58 y TAPSE 12, donde la conclusion decia
     «Sin patron de bajo gasto ni vasoplejia». GC = 1,57 x 1,8277 = 2,870. */
  medicoInt: { campos: { peso:'70', talla:'170', pop_sw_gc:'2.8544', pop_sw_pam:'58', pop_sw_pad:'10',
                         pop_sw_pcp:'14', tapse:'12', pop_lactato:'4.2', pop_cx_horas:'6' },
               sel: { pop_monitor:'swan', pop_cx_tipo:'cabg' }, integrar: ['pop'] },
  /* Y una integrada con el gasto NO bajo y senales, que es el otro rotulo nuevo. */
  yStrL:   { campos: { vd_strain_pl: '-18' } },
  yTri74:  { campos: { dt_triv: '74' } },
  yTri75:  { campos: { dt_triv: '75' } },
  yTri76:  { campos: { dt_triv: '76' } },
  yTri59:  { campos: { dt_triv: '59' } },
  yTri60:  { campos: { dt_triv: '60' } },
  yTri61:  { campos: { dt_triv: '61' } },
  /* ── LA RAIZ AORTICA, SIN SEXO Y CON LOS DOS (commits 3, 4 y 5) ──────────────────────────
     El peso y la talla son INSUMOS del criterio por indice: sin ellos getBSA devuelve null, el
     indice no existe y la escena no llega a esa rama. Peso 70 / talla 170 -> ASC 1,818 m2
     (medido con getBSA en la tanda POP-V2; NO 1,8277):
       39 / 1,818 = 21,45 mm/m2   ·   40 / 1,818 = 22,00   (el 22 EXACTO no vota: el operador
       del indice es estricto)
     Para cruzar el 22 hace falta una superficie chica. Peso 45 / talla 150 -> ASC 1,369 m2:
       30 / 1,369 = 21,91   ·   31 / 1,369 = 22,64 */
  yAo36:   { campos: { ao_sin: '36', peso: '70', talla: '170' } },
  yAo39:   { campos: { ao_sin: '39', peso: '70', talla: '170' } },
  yAo40:   { campos: { ao_sin: '40', peso: '70', talla: '170' } },
  yMarfan: { campos: { marfan_ao_seno: '46', peso: '70', talla: '170' },
             sel: { marfan_sindrome: 'marfan' } },
  yMarfanI:{ campos: { marfan_ao_seno: '46', peso: '70', talla: '170' },
             sel: { marfan_sindrome: 'marfan' }, integrar: ['marfan'] },
  yTurner: { campos: { marfan_ao_seno: '35', peso: '45', talla: '145' },
             sel: { marfan_sindrome: 'turner' } },
  yTurnerI:{ campos: { marfan_ao_seno: '35', peso: '45', talla: '145' },
             sel: { marfan_sindrome: 'turner' }, integrar: ['marfan'] },
  /* ── LA BICUSPIDE Y LA COARTACION (commit 6) ───────────────────────────────────────────── */
  yVab:    { campos: { ao_sin: '42', peso: '70', talla: '170' }, sel: { sexo: 'M',
             va_morf: 'Bicúspide', vab_fenotipo: 'rl' } },
  yCoa:    { campos: { coa_vmax: '3.2', coa_gmedio: '25', coa_istmo: '9', peso: '70', talla: '170' },
             sel: { sexo: 'M', coa_situacion: 'nativa' } },
  ajeno:   { campos: { im_vc: '8', ea_dtsvi: '20', itv_tsvi: '20', itv_ao: '100', vmax_ao: '4.5',
                       onda_e: '110', e_sep: '5', e_lat: '6', ai_vol: '70', peso: '80', talla: '180' } },

  /* ══ LAS ESCENAS DE LA TANDA DE CORRECCIONES (2026-10-30) ═══════════════════════════════
     Cada bloque declara SU denominador. Las de orejuela son las unicas que el commit 1
     autoriza a mover, y `orejSinDim` es su control negativo: tiene trombo pero no tiene ni
     ostium ni profundidad, asi que NO llega a la oracion que el commit 1 reescribe. */
  orejTrom:{ campos: { oai_ostium_diam: '26', oai_profundidad: '37', oai_vel_vac: '18' },
             sel: { oai_trombo: 'si', oai_sec: 'severo', oai_lobulos: '2' } },
  orejLim: { campos: { oai_ostium_diam: '26', oai_profundidad: '37' },
             sel: { oai_trombo: 'no' } },
  orejSolo:{ campos: { oai_ostium_diam: '22' } },
  orejProf:{ campos: { oai_profundidad: '30' } },
  orejSinDim:{ campos: { oai_vel_vac: '18' }, sel: { oai_trombo: 'si' } },
  orejLob3:{ campos: { oai_ostium_diam: '26', oai_profundidad: '37' },
             sel: { oai_trombo: 'no', oai_lobulos: '3' } },
  orejLob3T:{ campos: { oai_ostium_diam: '26', oai_profundidad: '37' },
             sel: { oai_trombo: 'si', oai_lobulos: '3' } },
  /* ── EL TRIV Y LA HTP (commit 2) ──────────────────────────────────────────────────────
     Los bordes del corte viejo (60) y del nuevo (75) con la IT MEDIDA y en rango, para que
     el unico cambio posible sea la frase de elementos indirectos. `tvia` se carga en 120
     -por encima de 105- para que el TAP NO vote y el TRIV quede solo en la frase. */
  cTri60:  { campos: { dt_triv: '60', tvia: '120', vmax_it: '3.6', ad_area: '14' } },
  cTri65:  { campos: { dt_triv: '65', tvia: '120', vmax_it: '3.6', ad_area: '14' } },
  cTri74:  { campos: { dt_triv: '74', tvia: '120', vmax_it: '3.6', ad_area: '14' } },
  cTri75:  { campos: { dt_triv: '75', tvia: '120', vmax_it: '3.6', ad_area: '14' } },
  cTri76:  { campos: { dt_triv: '76', tvia: '120', vmax_it: '3.6', ad_area: '14' } },
  /* El TAP solo, sin TRIV: el control de que la frase no cambia por el otro signo. */
  cTapSolo:{ campos: { tvia: '95', vmax_it: '3.6', ad_area: '14' } },
  /* (i) IT NO MEDIDA con elementos a favor. Sin `vmax_it` no hay PSAP, que es la compuerta. */
  cSinIt:  { campos: { dt_triv: '80', tvia: '95', ad_area: '14' } },
  cSinItTriv:{ campos: { dt_triv: '80', ad_area: '14', tvia: '120' } },
  cSinItTap:{ campos: { tvia: '95', ad_area: '14' } },
  /* Control negativo de (i): IT no medida y NINGUN elemento a favor. */
  cSinItNada:{ campos: { ad_area: '14', tvia: '120' } },
  /* (ii) IT MEDIDA sin rango de HTP (VRT <= 2,8) + VD DISFUNCIONANTE + elementos a favor. */
  cSubest: { campos: { vmax_it: '2.4', dt_triv: '80', tvia: '95', tapse: '12', s_prime: '7',
                       ad_area: '14' } },
  /* Control negativo A de (ii): misma IT baja y elementos a favor, VD NORMAL. */
  cSubestVdOk:{ campos: { vmax_it: '2.4', dt_triv: '80', tvia: '95', tapse: '22', s_prime: '12',
                       ad_area: '14' } },
  /* Control negativo B de (ii): VD disfuncionante y IT EN RANGO de HTP. */
  cSubestItAlta:{ campos: { vmax_it: '3.6', dt_triv: '80', tvia: '95', tapse: '12',
                       s_prime: '7', ad_area: '14' } },
  /* Control negativo C de (ii): VD disfuncionante, IT baja y NINGUN elemento a favor. */
  cSubestSinEl:{ campos: { vmax_it: '2.4', tvia: '120', tapse: '12', s_prime: '7',
                       ad_area: '14' } },
  /* ── VD/AD REORDENADO (commit 3) ──────────────────────────────────────────────────────
     El papel tiene que salir IDENTICO: mover una celda de la grilla no cambia un dato. */
  cVdLleno:{ campos: { tvia: '110', tapse: '14', s_prime: '9', vd_tei: '0.6',
                       vd_strain_pl: '18', fevd: '38', 'vd-triv': '80', vd_bas: '45',
                       vd_mid: '38', vd_long: '80', vd_vi: '1.2', vd_pared: '6',
                       tsvd_diametro: '22', vti_tsvd: '18', ip_ap_diam: '28',
                       vd_area_d: '24', vd_area_s: '16' } },
  cVdSel:  { campos: { vd_bas: '45' }, sel: { vd_vi_sel: 'gt1' } },
  /* ── MARFAN Y TURNER (commit 4) ───────────────────────────────────────────────────────
     `cMarfanRaiz` es el caso que el medico describio: la raiz cargada en AI/VI y el campo
     del modulo VACIO. En HEAD la pantalla de Marfan no muestra nada. */
  /* ⚠️ ESTA ES LA ESCENA DEL MEDICO, Y LA PRIMERA VERSION NO LO ERA: con el sindrome elegido
     el modulo YA ESTA EN USO, asi que el espejo del G-4 copia `ao_sin` a `marfan_ao_seno` y la
     lectura no tiene nada que mostrar -el campo propio esta lleno-. El caso reportado es la
     raiz cargada en AI/VI con el modulo de Marfan SIN TOCAR. */
  cRaizSola:{ campos: { ao_sin: '39', peso: '70', talla: '175' }, sel: { sexo: 'M' } },
  cRaizSolaM:{ campos: { ao_sin: '41', peso: '70', talla: '175' }, sel: { sexo: 'F' } },
  cMarfanRaiz:{ campos: { ao_sin: '39', peso: '70', talla: '175' },
             sel: { sexo: 'M', marfan_sindrome: 'marfan' } },
  cMarfanRaizI:{ campos: { ao_sin: '39', peso: '70', talla: '175' },
             sel: { sexo: 'M', marfan_sindrome: 'marfan' }, integrar: ['marfan'] },
  cMarfanProp:{ campos: { ao_sin: '39', marfan_ao_seno: '43', peso: '70', talla: '175' },
             sel: { sexo: 'M', marfan_sindrome: 'marfan' } },
  cTurnerFalta:{ campos: { peso: '45', talla: '145' },
             sel: { marfan_sindrome: 'turner' } },
  cTurnerSinPeso:{ campos: { ao_tub: '32', talla: '145' },
             sel: { marfan_sindrome: 'turner' } },
  cTurnerOk:{ campos: { ao_tub: '32', peso: '45', talla: '145' },
             sel: { marfan_sindrome: 'turner' } },
  cTurnerOkI:{ campos: { ao_tub: '32', peso: '45', talla: '145' },
             sel: { marfan_sindrome: 'turner' }, integrar: ['marfan'] },

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
  /* ══ EL CENSO DE VEREDICTOS DEL PAPEL FIRMADO (barrido 1c, 2026-10-30) ═══════════════════
     Busca las palabras de veredicto y de conducta en las CUATRO superficies firmadas y
     NUNCA en el cuerpo del documento: document.body.textContent trae el codigo fuente de
     los diecisiete <script> inline, asi que un censo sobre el body se mide a si mismo. Es la
     trampa que la tanda C2 pago con «Balik». El denominador son los caracteres medidos. */
  try {
    const PAL = ['no apto', 'apto', 'candidat', 'se recomienda', 'recomendad', 'debe ',
                 'deberá', 'debería', 'indicad', 'se sugiere', 'conviene ', 'considerar',
                 'contraindica'];
    const sup = { informe: out.informe_estandar || '', informe_nar: out.informe_narrativo || '',
                  informe_con: out.informe_conciso || '', suma: out.suma_estandar || '' };
    const ver = {};
    let chars = 0;
    Object.keys(sup).forEach((s) => {
      const t = String(sup[s]); chars += t.length;
      const low = t.toLowerCase();
      PAL.forEach((p) => {
        let i = low.indexOf(p);
        while (i > -1) {
          (ver[s + '::' + p] = ver[s + '::' + p] || []).push(t.slice(Math.max(0, i - 55), i + p.length + 55));
          i = low.indexOf(p, i + 1);
        }
      });
    });
    out._verChars = chars;
    out._veredictos = ver;
  } catch (e) { out._verErr = String(e).slice(0, 140) }
  /* ══ LOS NODOS DE PANTALLA DE ESTA TANDA ═════════════════════════════════════════════════
     Van con prefijo _pant_ para que el comparador los agrupe aparte: aca SI puede haber
     diferencias. Sin ellos, un «cero en superficie firmada» no se distingue de «la sonda no
     esta mirando nada». */
  ['oai-elegibilidad', 'oai-notas', 'oai-esq-estado', 'oai-vel-interp', 'oai-esq-pdf',
   'marfan-ita-origen', 'marfan_ao_seno',
   'dt-triv-ref', 'vd-triv-ref', 'vd-triv-interp', 'dt_triv-interp',
   'marfan-ao-lectura', 'marfan-ita-val', 'marfan-ita-falta', 'marfan-concl',
   'vd-vi-interp', 'htp2022-prob'].forEach((id) => {
    const e = document.getElementById(id);
    out['_pant_' + id] = e ? N(e.textContent || e.value || '') : 'NO EXISTE';
  });
  /* El denominador de esta tanda: que zonas DESPERTARON en la escena. */
  try {
    const _d = [];
    const _hay = (id) => { const e = document.getElementById(id); return !!(e && String(e.value || '').trim()) };
    if (_hay('oai_ostium_diam') || _hay('oai_profundidad')) _d.push('orejuela-dim');
    if (_hay('dt_triv')) _d.push('triv');
    if (_hay('vmax_it')) _d.push('it-medida'); else _d.push('it-NO-medida');
    if (_hay('ao_sin') || _hay('marfan_ao_seno')) _d.push('raiz');
    if (_hay('ao_tub')) _d.push('ascendente');
    out._cor_denom = _d.join(' + ');
    out._cor_htpInd = (typeof htpIndirectosFrase === 'function')
      ? String(htpIndirectosFrase()) : 'SIN FN';
    out._cor_trivCorte = (typeof DT_TRIV_HTP !== 'undefined' ? String(DT_TRIV_HTP) : '?')
      + '/' + (typeof DT_TRIV_HTP_PANEL !== 'undefined' ? String(DT_TRIV_HTP_PANEL) : '?');
    out._cor_vdGrid = [].slice.call(document.querySelectorAll('.vd-grid .fg'))
      .map((d) => { const c = (d.className.match(/vd-c([0-9])/) || [])[1],
                          r = (d.className.match(/vd-r([0-9])/) || [])[1],
                          i = d.querySelector('input[id],select[id]');
                    return (c || '?') + ':' + (r || '?') + ':' + (i ? i.id : '?') }).join(' | ');
  } catch (e) { out._cor_denomErr = String(e).slice(0, 140) }
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
  /* ══ LOS NODOS DE PANTALLA DE LA TANDA Y ═════════════════════════════════════════════════
     Prefijo _pant_: aca SI puede haber diferencias, y son el CONTROL POSITIVO de que la sonda
     mira lo que la tanda toca. Sin ellos, un cero en superficie firmada no se distingue de «la
     sonda no esta mirando nada». */
  ['vd-strain-interp', 'vd-tei-interp', 'tapse-interp', 'sprime-interp', 'tap-interp',
   'fevd-interp', 'vd-tam', 'vd-vi-interp', 'vd-pared-interp', 'vd-qp-interp', 'fac-interp',
   'vd-triv-interp', 'dt_triv_ref', 'dt_tde_ref', 'dt_diast_ref', 'sprime-interp',
   'ao-ref-sin', 'ao-ref-st', 'ao-ref-tub', 'ao-ref-cay', 'ao-ref-desc',
   'marfan_badge', 'coa-concl-badge', 'vab-concl', 'aivi-sexo-aviso'].forEach((id) => {
    const e = document.getElementById(id);
    out['_pant_' + id] = e ? N(e.textContent) : 'NO EXISTE';
  });
  /* La fila del cuadro de referencias del VD, por su orden y por su visibilidad. */
  out['_pant_vd_filas'] = (function () {
    const t = document.getElementById('vd-tei-interp');
    const caja = t ? t.closest('.calc-box') : null;
    if (!caja) return 'NO CAJA';
    return [].slice.call(caja.querySelectorAll('.calc-row')).map(function (r) {
      const v = r.querySelector('span[id]:not(.calc-lbl)');
      const vis = getComputedStyle(r).display !== 'none';
      return (v ? v.id : '?') + (vis ? '' : '[oculta]');
    }).join(',');
  })();
  out['_pant_vd_bajoCampo'] = !!document.getElementById('vd_strain_pl-grado');
  out['_pant_vd_marca'] = N((document.getElementById('vd_strain_pl-marca') || {}).textContent);
  /* ══ EL DENOMINADOR DE LA TANDA Y ═════════════════════════════════════════════════════════
     Sin esto, un cero no se distingue de «la escena no llego a la zona»: una raiz sin peso ni
     talla no tiene indice, un strain fuera de banda no gradua y un Marfan sin integrar no llega
     al papel. */
  out['_y_denom'] = (function () {
    const j = {};
    try { j.strainCat = (typeof vdStrainPlCat === 'function')
      ? vdStrainPlCat((document.getElementById('vd_strain_pl') || {}).value) : 'sin fn' } catch (e) {}
    try { j.triv = String((document.getElementById('dt_triv') || {}).value || '') } catch (e) {}
    /* ⚠️ EL ESPEJO VA CON GUION MEDIO -vd-triv- Y NO CON GUION BAJO. Escrito con guion bajo, el
       denominador decia «NO EXISTE» en los DOS arboles y el A/B del commit 2 daba cero sin que
       eso probara nada: la sonda medía un id que la app no tiene. Lo destapo mirar el volcado. */
    try { j.trivVd = String((document.getElementById('vd-triv') || {}).value || 'NO EXISTE') } catch (e) {}
    try { j.trivEsDelEstudio = (typeof _noEsDelEstudio === 'function')
      ? !_noEsDelEstudio('vd-triv') : 'sin fn' } catch (e) {}
    try { j.sexo = String((document.getElementById('sexo') || {}).value || '') } catch (e) {}
    try { j.bsa = (typeof getBSA === 'function') ? getBSA() : 'sin fn' } catch (e) {}
    try { j.aoSin = String((document.getElementById('ao_sin') || {}).value || '') } catch (e) {}
    try { const sg = (typeof AO_SEGS !== 'undefined') ? AO_SEGS[0] : null;
      const x = (typeof v === 'function') ? v('ao_sin') : null;
      j.aoRef = sg ? aoSegRef(sg) : 'no';
      j.aoIda = (sg && x != null) ? aoSegIda(sg, x) : null;
      j.aoGrado = (sg && x != null) ? aoSegGrado(sg, x) : null;
      j.aoPorIda = (sg && x != null) ? aoSegPorIda(sg, x) : null;
    } catch (e) { j.ao = 'EXC ' + String(e).slice(0, 60) }
    try { j.marfanSeno = String((document.getElementById('marfan_ao_seno') || {}).value || '') } catch (e) {}
    try { j.marfanInt = (typeof amiloIntegrado === 'function') ? !!amiloIntegrado('marfan') : 'sin fn' } catch (e) {}
    try { j.marfanHay = (typeof marfanEstado === 'function') ? !!marfanEstado().hayDatos : 'sin fn' } catch (e) {}
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
    console.log('   denom COR: ' + (OUT[k]._cor_denom || '') + ' | htpInd=' + (OUT[k]._cor_htpInd || '') + ' | corte=' + (OUT[k]._cor_trivCorte || ''));
  }
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF + ' (' + fs.statSync(OUTF).size + ' bytes)');
