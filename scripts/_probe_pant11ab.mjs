#!/usr/bin/env node
/**
 * _probe_pant11ab.mjs - el A/B de SUPERFICIES de la tanda PANT-11 (2026-11-04). Calcado de
 * _probe_pant10ab.mjs, que trae montadas las escenas de Ebstein y de Eisenmenger que esta tanda
 * necesita para el commit 1. Nombre propio: verificado con ls, no existia.
 *
 * Lo que agrega esta tanda, escena por escena y cada una con su control:
 *   - p11dop  : el Doppler mitral con TDE y TRIV cargados -el commit 2 no puede mover el papel-.
 *   - p11vci* : la VCI con y sin la casilla «no se visualiza», con y sin colapso.
 *   - p11coap*: la profundidad de coaptacion en cada campo por separado, con y sin el TEER
 *               integrado, que es lo que el medico pide DEMOSTRAR.
 *   - p11pul* : los estados del pulmon que HEAD SI podia expresar -ahi el papel tiene que salir
 *               identico- y los que NO podia -ahi esta la unica diferencia autorizada-.
 *   - p11mas* : las masas, con el formulario en blanco y con una masa cargada.
 * Las escenas p9* heredadas quedan como control: ninguna de ellas puede moverse por los commits
 * 2 a 11.
 *
 * _probe_pant10ab.mjs - el A/B de SUPERFICIES de la tanda PANT-10 (2026-11-04). Calcado de
 * _probe_pant9ab.mjs, que trae las escenas de las cinco lesiones de esta tanda ya montadas con
 * sus campos y su casilla de integrar. Nombre propio: verificado con ls, no existia.
 *
 * Lo que agrega: el CENSO DE LOS DIECISIETE GLOBOS cc9-* del registro VINFO, con el texto de
 * cada bloque -tit, lee, fuente, ojo- y los marcadores de las frases que el commit 1 corrige.
 * Es el CONTROL POSITIVO: sin el, un cero de superficie firmada no distingue «el papel no se
 * movio» de «la sonda no mira donde el cambio puede actuar». Y la franja roja de Eisenmenger,
 * que por decision del medico tiene que salir IDENTICA a HEAD.
 *
 * _probe_pant9ab.mjs - el A/B de SUPERFICIES de la tanda PANT-9 (2026-11-04). Calcado de
 * _probe_pant8ab.mjs. Nombre propio: verificado con ls, no existia.
 *
 * Lo que agrega esta tanda: una escena por cada una de las SIETE secciones de congenitas
 * rediseniadas, con sus campos cargados y la casilla «Integrar al informe» encendida, su
 * control de compuerta sin integrar, las CUATRO combinaciones de casillas de complicaciones
 * del Fontan y las ocho escenas de morfologia del commit 8.
 *
 * _probe_pant6ab.mjs - el A/B de SUPERFICIES de la tanda PANT-6 (2026-11-03). Calcado de
 * _probe_pant5ab.mjs. Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Lo que agrega esta tanda:
 *   - LAS CUATRO COMBINACIONES de los botones de CIA / CIV, cada una con los campos de las dos
 *     lesiones cargados, y DOS mas con la casilla «Integrar al informe» de abajo encendida: el
 *     papel tiene que salir IDENTICO a HEAD en las seis. Sin los campos cargados, un cero no
 *     distingue «el papel no se movio» de «la escena no llega a la zona».
 *   - En MEDIR, los nodos de pantalla de la seccion -el control POSITIVO-, el censo de ids de
 *     la seccion y el conteo de nodos del diagrama de bordes.
 *
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
const OUTF = arg('--out') || '/tmp/ab_pant10.json';

/* == LAS ESCENAS (PANT-9) ===================================================================
   El papel tiene que salir IDENTICO a HEAD en TODAS, con UNA excepcion posible y declarada: la
   frase que emita la opcion nueva de morfologia de TAVI del commit 8.
   p9vacio y p9ajeno son los controles negativos; cada p9<seccion>Apa es el control de la
   compuerta -los MISMOS datos con la casilla «Integrar al informe» APAGADA-.
   ⚠️ SIN LOS CAMPOS CARGADOS Y SIN INTEGRAR, UN CERO NO PRUEBA NADA: el bloque de cada
      congenita esta detras de su casilla de integrar, asi que sin ella el papel no trae una
      palabra de la seccion en NINGUNO de los dos arboles.
   Las constantes de TAVI de abajo son las que PANT-8 dejo y se conservan tal cual: las usan las
   escenas de morfologia del commit 8. */
const BASE = { peso:'70', talla:'170', ddfvi:'52' };
/* El sizing pre-TAVI completo: los once campos del panel Pre. */
const PRE = { ete_tavi_anillo_diam:'24', ete_tavi_anillo_area:'4.6', ete_tavi_anillo_perim:'76',
  ete_tavi_valsalva:'38', ete_tavi_ust:'32', ete_tavi_ao_asc:'36',
  ete_tavi_cor_izq:'12', ete_tavi_cor_der:'14' };
const PRE_SEL = { ete_tavi_morf:'tricuspide', ete_tavi_calc:'severa', ete_tavi_distrib:'asimetrica' };
/* El control post-TAVI completo, con los insumos de la ecuacion de continuidad que llenan los
   tres espejos readonly -sin ellos el AVA sale vacio y la prosa cambia de rama-. */
const POST = { ete_tavi_pro_tam:'26', ete_tavi_vmax:'2.1', ete_tavi_gmedio:'9',
  ete_tavi_at:'75', ete_tavi_vc_ancho:'0.25', ete_tavi_vc_area:'0.12', ete_tavi_pht:'420',
  ete_tavi_ext_circ:'12', ete_tavi_pro_marca:'Sapien 3',
  diam_tsvi:'20', itv_tsvi:'22', itv_ao:'90' };
const POST_SEL = { ete_tavi_pro_tipo:'balon', ete_tavi_pro_pos:'correcta', ete_tavi_flujo_rev:'proto' };
const M = (a,b) => Object.assign({}, a, b);

const ESCENAS = {
  /* ══ ESCENAS DE LA TANDA PANT-11 ══════════════════════════════════════════════════════════
     Cada una carga los campos que ABREN su zona: sin eso un cero de superficie firmada no
     distingue «el papel no se movio» de «la escena no llega a donde el cambio puede actuar». */
  /* -- COMMIT 2: Doppler mitral. TDE y TRIV cargados, mas lo que hace que la diastolica
     concluya: el papel tiene que salir IDENTICO a HEAD. -- */
  p11dop: { campos: { onda_e:'90', onda_a:'60', e_sep:'6', e_lat:'8', tde:'180', triv:'95',
      thp:'70', ai_vol_idx:'38', it_vel:'2.6', diast_ritmo:'sinusal' } },
  /* -- COMMIT 3: la VCI. p11vciOff es el control: la casilla APAGADA con la cava cargada tiene
     que dar el papel IDENTICO a HEAD. p11vciOn es la unica diferencia autorizada. --
     ⚠️ En HEAD `vci_no_vis` NO existe, asi que la siembra devuelve «NO EXISTE» y la escena cae
     en el camino de siempre: eso es justo lo que hace que el ANTES y el DESPUES se vean. */
  p11vciOff: { campos: { ad_area:'20', vci_diam:'24', vci_col:'<50', tapse:'18',
      it_vel:'3.1', vexus_sh:'normal', vexus_pv:'leve', vexus_ir:'normal' } },
  p11vciOn:  { campos: { ad_area:'20', vci_diam:'24', vci_col:'<50', tapse:'18',
      it_vel:'3.1', vexus_sh:'normal', vexus_pv:'leve', vexus_ir:'normal', vci_no_vis:'1' } },
  /* La cava SIN cargar y la casilla marcada: el papel dice que no se visualiza igual. */
  p11vciSolo: { campos: { ad_area:'20', vci_no_vis:'1' } },
  /* -- COMMIT 4: la profundidad de coaptacion, las CUATRO escenas que el medico pide
     DEMOSTRAR. `integrar` es un GESTO: sin el, el bloque no llega al papel. --
     (i) solo en el campo del ETE, TEER sin integrar -> papel identico a HEAD.
     (ii) solo en el del TEER, TEER sin integrar -> la UNICA diferencia autorizada: el parrafo
          del ETE mitral pasa a mostrar la profundidad que llego del otro campo.
     (iii) en los dos -> identico a HEAD.
     (iv) TEER integrado, con y sin profundidad. */
  p11coapEte:    { campos: { ete_prof_coapt:'12', ete_angulo_vp:'40' }, integrar:['etem'] },
  p11coapTeer:   { campos: { teer_prof_flail:'12', ete_angulo_vp:'40' }, integrar:['etem'] },
  p11coapTeerNi: { campos: { teer_prof_flail:'12', ete_angulo_vp:'40' } },
  p11coapAmbos:  { campos: { ete_prof_coapt:'12', teer_prof_flail:'12', ete_angulo_vp:'40' }, integrar:['etem'] },
  p11coapInt:    { campos: { teer_prof_flail:'12', teer_gap:'8', teer_ancho_flail:'12',
      teer_area_mitral:'4.5', im_grado:'4' }, integrar:['teer'] },
  p11coapIntSin: { campos: { teer_gap:'8', teer_ancho_flail:'12',
      teer_area_mitral:'4.5', im_grado:'4' }, integrar:['teer'] },
  /* (iv-bis) EL EJEMPLO DEL VEREDICTO: la profundidad cargada SOLO en el campo del ETE y el
     TEER INTEGRADO. En HEAD el criterio c4 esta «sin dato»; con el espejo el dato llega y el
     criterio se evalua. Es la unica forma de ver lo que la orden pide mostrar. */
  p11coapEteInt: { campos: { ete_prof_coapt:'12', teer_gap:'8', teer_ancho_flail:'12',
      teer_area_mitral:'4.5', im_grado:'4' }, integrar:['teer'] },
  /* == LAS ESCENAS DE LA TANDA PANT-9 ======================================================
     Una por seccion rediseniada, con TODOS sus campos cargados Y la casilla «Integrar al
     informe» encendida: sin eso un cero de superficie firmada no distingue «el papel no se
     movio» de «la escena no llega a la zona». Al lado, el control de la compuerta -los MISMOS
     datos sin integrar- en las dos secciones mas grandes, y las combinaciones de casillas de
     complicaciones del Fontan, que es lo que la orden pide verificar.
     p9vacio y p9ajeno son los controles negativos. */
  p9vacio: { campos: {} },
  /* -- COMMIT 1: FONTAN -- */
  p9fontan: { campos: { fontan_tipo:'tunel', fontan_fenestracion:'presente',
      fontan_vs_morfologia:'der', fontan_vs_fevi:'45', fontan_vs_fac:'32',
      fontan_saturacion:'90', fontan_it_grado:'moderada', fontan_derrame_pleural:'leve',
      fontan_ascitis:'no', fontan_clase_nyha:'iii', fontan_arritmia:'fa' },
    chk:['fontan_incluir_chk'] },
  p9fontanApa: { campos: { fontan_tipo:'tunel', fontan_fenestracion:'presente',
      fontan_vs_morfologia:'der', fontan_vs_fevi:'45', fontan_vs_fac:'32',
      fontan_saturacion:'90', fontan_it_grado:'moderada', fontan_derrame_pleural:'leve',
      fontan_ascitis:'no', fontan_clase_nyha:'iii', fontan_arritmia:'fa' } },
  /* Las SEIS casillas: «Sin complicaciones» sola, tres marcadas, y las cinco que no son
     «ninguna». La logica de exclusion la decide fontanToggleComp y el orden de los gestos es
     el real, asi que estas tres escenas son las que prueban que el papel no se movio. */
  p9fontanC1: { campos: { fontan_tipo:'extra', fontan_saturacion:'94' },
    chk:['fontan_comp_ninguna','fontan_incluir_chk'] },
  p9fontanC2: { campos: { fontan_tipo:'ap', fontan_saturacion:'88', fontan_ascitis:'moderada' },
    chk:['fontan_comp_epp','fontan_comp_fald','fontan_comp_trombo','fontan_incluir_chk'] },
  p9fontanC3: { campos: { fontan_tipo:'tunel' },
    chk:['fontan_comp_epp','fontan_comp_bronq','fontan_comp_fald','fontan_comp_trombo',
         'fontan_comp_otra','fontan_incluir_chk'] },
  /* El orden que prueba la exclusion: primero una complicacion, despues «ninguna». */
  p9fontanC4: { campos: { fontan_tipo:'tunel' },
    chk:['fontan_comp_epp','fontan_comp_ninguna','fontan_incluir_chk'] },
  /* -- COMMIT 2: EISENMENGER -- */
  p9eisen: { campos: { eis_lesion_base:'civ', eis_saturacion_reposo:'84',
      eis_saturacion_ejercicio:'72', eis_psap:'95', eis_pdap:'40', eis_it_vel:'4.6',
      eis_vd_funcion:'moderada', eis_pericardio:'leve', eis_clase_nyha:'iii',
      eis_sincope:'si', eis_hemoptisis:'si' },
    chk:['eisen_incluir_chk'] },
  p9eisenApa: { campos: { eis_lesion_base:'civ', eis_saturacion_reposo:'84',
      eis_saturacion_ejercicio:'72', eis_psap:'95', eis_pdap:'40', eis_it_vel:'4.6',
      eis_vd_funcion:'moderada', eis_pericardio:'leve', eis_clase_nyha:'iii',
      eis_sincope:'si', eis_hemoptisis:'si' } },
  /* -- COMMIT 3: EBSTEIN -- (peso y talla para que el indexado por superficie exista) */
  p9ebs: { campos: { peso:'70', talla:'170', ebs_desplazamiento:'22', ebs_atrializacion:'40',
      ebs_func_vd:'moderada', ebs_area_ad:'30', ebs_area_vd_atrial:'14',
      ebs_area_vd_func:'10', ebs_area_ai:'18', ebs_area_vi:'20', ebs_tsv:'si',
      ebs_vias:'no', ebs_sintomas:'si', ebs_saturacion:'88', ebs_ejercicio:'si',
      ebs_progresion:'no', it_grado:'4' },
    chk:['ebs_incluir_chk'] },
  p9ebsApa: { campos: { peso:'70', talla:'170', ebs_desplazamiento:'22', ebs_atrializacion:'40',
      ebs_func_vd:'moderada', ebs_area_ad:'30', ebs_area_vd_atrial:'14',
      ebs_area_vd_func:'10', ebs_area_ai:'18', ebs_area_vi:'20', ebs_tsv:'si',
      ebs_vias:'no', ebs_sintomas:'si', ebs_saturacion:'88', ebs_ejercicio:'si',
      ebs_progresion:'no', it_grado:'4' } },
  /* Las cinco areas INCOMPLETAS: la tira del indice dice cuantas faltan, y es lo que la orden
     manda conservar tal cual. */
  p9ebsParc: { campos: { peso:'70', talla:'170', ebs_desplazamiento:'18',
      ebs_area_ad:'28', ebs_area_vd_atrial:'12' }, chk:['ebs_incluir_chk'] },
  /* -- COMMIT 4: DSAV -- */
  p9dsav: { campos: { dsav_tipo:'completo', dsav_regurg_av_izq:'moderada',
      dsav_regurg_av_der:'leve', dsav_dssd_mm:'12', dsav_qp_qs:'2.1', dsav_down:'si',
      dsav_htp:'moderada', dsav_rvp_uw:'4.5', fevi:'52', dsvi:'32' },
    chk:['dsav_incluir_chk'] },
  p9dsavApa: { campos: { dsav_tipo:'completo', dsav_regurg_av_izq:'moderada',
      dsav_regurg_av_der:'leve', dsav_dssd_mm:'12', dsav_qp_qs:'2.1', dsav_down:'si',
      dsav_htp:'moderada', dsav_rvp_uw:'4.5', fevi:'52', dsvi:'32' } },
  /* -- COMMIT 5: CVPA -- */
  p9cvpa: { campos: { cvpa_venas_numero:'2', cvpa_conexion:'vcs', cvpa_lado:'der',
      cvpa_qp_qs:'1.8', cvpa_htp:'leve', cvpa_sintomas:'disnea' },
    chk:['cvpa_incluir_chk'] },
  p9cvpaApa: { campos: { cvpa_venas_numero:'2', cvpa_conexion:'vcs', cvpa_lado:'der',
      cvpa_qp_qs:'1.8', cvpa_htp:'leve', cvpa_sintomas:'disnea' } },
  /* -- COMMIT 6: DAP -- */
  p9dap: { campos: { dap_tipo:'restrictivo', dap_diam:'3', dap_dir:'id', dap_vmax:'4.2',
      dap_paps:'35' }, chk:['ductus_incluir_chk'] },
  p9dapApa: { campos: { dap_tipo:'restrictivo', dap_diam:'3', dap_dir:'id', dap_vmax:'4.2',
      dap_paps:'35' } },
  /* -- COMMIT 7: VAP -- */
  p9vap: { campos: { vap_tipo:'i', vap_diam:'8', vap_dir:'id', vap_htp:'si' },
    chk:['vap_incluir_chk'] },
  p9vapApa: { campos: { vap_tipo:'i', vap_diam:'8', vap_dir:'id', vap_htp:'si' } },
  /* -- COMMIT 8: LA MORFOLOGIA DE TAVI --
     Los dos pares que la orden manda probar y los dos controles sin equivalente. */
  p9tvBi:    { campos: { va_morf:'Bicúspide' } },
  p9tvBiT:   { campos: { ete_tavi_morf:'bicuspide' } },
  p9tvViv:   { campos: { ete_tavi_morf:'protesis_bio' } },
  p9tvBio:   { campos: { va_morf:'Prótesis biológica' } },
  p9tvTri:   { campos: { va_morf:'Trivalva normal' } },
  p9tvTriT:  { campos: { ete_tavi_morf:'tricuspide' } },
  p9tvCuad:  { campos: { ete_tavi_morf:'cuadricuspide' } },
  /* La escena que muestra LA FRASE PROPIA de la opcion nueva en el papel: el modulo de
     TAVI integrado, con el sizing minimo. En HEAD la opcion NO EXISTE, asi que poner su
     valor deja el selector vacio -la trampa de medir un A/B con una opcion que el arbol
     viejo no tiene-: esta escena se mide SOLO en el arbol nuevo y su antes es «la opcion
     no se podia consignar». */
  p9tvVivInt: { campos: M(BASE,{ ete_tavi_morf:'protesis_bio', ete_tavi_anillo_diam:'24' }),
    chk:['ete_tavi_incluir_chk'] },
  p9tvMec:   { campos: { va_morf:'Prótesis mecánica' } },
  /* El control negativo: un estudio con datos de OTRAS pestanias y nada de congenitas. */
  p9ajeno: { campos: { im_vc:'8', ea_dtsvi:'20', itv_tsvi:'20', itv_ao:'100', vmax_ao:'4.5',
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
  /* ══ PANT-6, COMMIT 1: LOS NODOS DE PANTALLA DE CIA / CIV -- CONTROL POSITIVO ═══════════
     Sin esto, un cero en las superficies firmadas no se distingue de una sonda que no mira
     donde el cambio puede actuar. Aca SI hay diferencias y tienen que estar. */
  try {
    const f = document.getElementById('ete-shunt-fila');
    out['_pant_cc_filaHijos'] = f ? f.children.length : 'NO EXISTE';
    out['_pant_cc_filaDisp'] = f ? getComputedStyle(f).display : 'NO EXISTE';
    out['_pant_cc_cuadros'] = document.querySelectorAll('.ete-shunt-cuadro').length;
    out['_pant_cc_comun'] = document.getElementById('ete-shunt-comun') ? 'SI' : 'NO';
    out['_pant_cc_btnEnCia'] = (function(){ const b=document.getElementById('ete-shunt-tab-cia'),
      p=document.getElementById('ete-shunt-pane-cia'); return !!(b&&p&&p.contains(b)) })();
    out['_pant_cc_btnEnCiv'] = (function(){ const b=document.getElementById('ete-shunt-tab-civ'),
      p=document.getElementById('ete-shunt-pane-civ'); return !!(b&&p&&p.contains(b)) })();
    out['_pant_cc_papsItCia'] = document.getElementById('ete-cia-paps-it') ? 'SI' : 'NO';
    out['_pant_cc_donutSegs'] = document.querySelectorAll('#cia-donut-svg path, #cia-donut-svg circle').length;
    /* El censo de ids de la seccion: ninguno puede faltar ni sobrar. */
    const sc = document.getElementById('sacc-cc-shunt');
    const cu = sc && sc.querySelector('.sacc-body');
    out['_pant_cc_ids'] = cu ? Array.prototype.slice.call(cu.querySelectorAll('input[id], select[id], textarea[id]'))
      .map(e => e.id).sort().join(',') : 'NO EXISTE';
  } catch (e) { out['_pant_cc_filaHijos'] = 'EXC ' + String(e).slice(0,40) }
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
  /* == EL DENOMINADOR DE LA TANDA PANT-8 ====================================================
     Es el control POSITIVO: sin el, un cero de superficie firmada no se distingue de una sonda
     que no mira donde el cambio puede actuar. Nada de esto es papel. */
  /* == EL DENOMINADOR DE LA TANDA PANT-9 ====================================================
     Es el control POSITIVO: sin el, un cero de superficie firmada no se distingue de una sonda
     que no mira donde el cambio puede actuar. Nada de esto es papel. */
  out['_p9_denom'] = (function () {
    const j = {};
    const V = (id) => String((document.getElementById(id) || {}).value || '');
    const SECS = ['fontan','eisen','ebs','dsav','cvpa','dap','vap'];
    SECS.forEach(function (k) {
      const card = document.getElementById('sacc-cc-' + k);
      if (!card) { j[k] = 'SIN CARD'; return }
      const cols = card.querySelector('.cc9-cols');
      const concl = card.querySelector('.cc9-concl');
      const ids = [];
      card.querySelectorAll('input[id],select[id],textarea[id]').forEach(function (e) { ids.push(e.id) });
      const glob = [];
      card.querySelectorAll('.vinfo-btn').forEach(function (b) { glob.push(b.getAttribute('data-vinfo')) });
      const body = card.querySelector('.sacc-body');
      j[k] = [cols ? cols.children.length : 0, !!concl, ids.length,
              glob.join('+') || '-', (body ? (body.innerText || '').length : 0)].join('|');
    });
    try { j.nGlobos = (typeof VINFO !== 'undefined') ? Object.keys(VINFO).length : 'sin VINFO' } catch (e) { j.nGlobos = 'sin VINFO' }
    /* las conclusiones de cada seccion, que NO deben cambiar con los mismos datos */
    try { j.fontanC = (document.getElementById('fontan-resultado') || {}).innerText || '' } catch (e) {}
    try { j.eisenC = (document.getElementById('eisen-resultado') || {}).innerText || '' } catch (e) {}
    try { j.ebsC = (document.getElementById('ebs-concl') || {}).textContent || '' } catch (e) {}
    try { j.dsavC = (document.getElementById('dsav-resultado') || {}).innerText || '' } catch (e) {}
    try { j.cvpaC = (document.getElementById('cvpa-resultado') || {}).innerText || '' } catch (e) {}
    try { j.dapC = (document.getElementById('dap-concl') || {}).textContent || '' } catch (e) {}
    try { j.vapC = (document.getElementById('vap-concl') || {}).textContent || '' } catch (e) {}
    try { j.ebsCel = (document.getElementById('ebs-celermajer') || {}).textContent || '' } catch (e) {}
    /* la morfologia a los dos lados: el espejo del commit 8 */
    j.morf = V('va_morf') + '|' + V('ete_tavi_morf');
    try { j.labTavi = (typeof _labUsaTavi === 'function')
      ? !!_labUsaTavi({ campos: out._campos || {} }) : 'sin fn' } catch (e) { j.labTavi = 'EXC' }
    return JSON.stringify(j);
  })();
  /* == PANT-10, COMMIT 1 - EL CENSO DE LOS DIECISIETE GLOBOS cc9-* =========================
     CONTROL POSITIVO de esta tanda. Se le pregunta al REGISTRO y no al DOM: el texto de un
     globo vive en VINFO, y medirlo ahi no depende de que la pestania este abierta ni de que el
     boton tenga caja -que es la trampa que PANT-7 pago con dos globos que informaban 0x0-.
     ⚠️ VINFO no esta en window: se lee por el renderizador, que es el unico que lo alcanza.
     Lo que se mide es el HTML que _vInfoHTML produce para cada clave, que es exactamente lo
     que el medico lee. */
  try {
    const CC9 = ['cc9-fontan-sat','cc9-fontan-iav','cc9-eisen-sat','cc9-eisen-sin',
      'cc9-eisen-hem','cc9-eisen-per','cc9-ebs-sec','cc9-ebs-cel','cc9-ebs-cia',
      'cc9-dsav-comp','cc9-dsav-down','cc9-dsav-rav','cc9-dsav-rvp',
      'cc9-cvpa-sec','cc9-cvpa-dren','cc9-cvpa-qp','cc9-vap-sec'];
    /* ⚠️ SIN EXPRESION REGULAR: este bloque vive DENTRO del template literal de MEDIR, y una
       barra invertida simple la consume el template -la trampa que esta casa ya documenta tres
       veces, donde /\s+/ llegaba al navegador como /s+/ y borraba todas las eses del texto-. */
    const NN = (s) => String(s || '').split(String.fromCharCode(10)).join(' ')
      .split(String.fromCharCode(9)).join(' ').split(String.fromCharCode(13)).join(' ')
      .split('  ').join(' ').split('  ').join(' ').split('  ').join(' ').trim();
    const tmp = document.createElement('div');
    let faltan = 0;
    CC9.forEach((k) => {
      let h = '';
      try { h = (typeof _vInfoHTML === 'function') ? _vInfoHTML(k, null) : 'SIN FN' } catch (e) { h = 'EXC' }
      tmp.innerHTML = h;
      const txt = NN(tmp.textContent);
      if (!txt || txt.indexOf('Referencia') === 0) faltan++;
      out['_pant_glob_' + k] = txt;
      out['_pant_globN_' + k] = txt.length;
    });
    out['_pant_glob_faltan'] = faltan;
    /* Los marcadores de lo que el commit 1 RETIRA y de lo que AGREGA, contados sobre el texto
       de los diecisiete juntos. En HEAD los de «retira» dan 1 y los de «agrega» dan 0. */
    const todo = CC9.map((k) => out['_pant_glob_' + k]).join(' ~ ');
    out['_pant_glob_largo'] = todo.length;
    [['kappa','=0,39'], ['sobreestima','sobreestima la severidad'],
     ['mort50','Mortalidad materna >50'], ['mort3050','30 a 50 %'],
     ['escVap','ESC 2020: cierre indicado siempre'],
     ['menos1pc','Menos del 1 % de las cardiopat'],
     /* ⚠️ LOS DOS MARCADORES DE ABAJO SE AFINARON, Y POR QUE. «Solo en el tipo completo» sin
        tilde no existia: el texto de HEAD escribe «Sólo», asi que el marcador daba 0 en los dos
        lados -un control que no podia fallar-. Y «sólo se ve la forma parcial» sigue dando 1 en
        el arbol nuevo porque el texto corregido NOMBRA la afirmacion anterior para decir que la
        fuente la contradice: lo que hay que medir es la AFIRMACION, no la mencion, asi que el
        marcador pide la frase entera con su causa. */
     ['soloCompleto','Sólo en el tipo completo'],
     ['soloParcial','En el adulto sólo se ve la forma parcial: la total es una emergencia'],
     ['ecoSubest','El eco subestima el shunt'],
     ['malPronost','Marcador de mal pronostico'],
     ['fatal','episodio masivo y fatal'],
     ['marcadorDisf','marcador de disfuncion del ventriculo sistemico'],
     ['sat9395','>93-95'],
     ['folio1042','folio 1042'], ['folioE209','folio e209'], ['folioE174','folio e174'],
     ['folio611','folio 611'], ['folio595','folio 595'], ['folioE241','folio e241'],
     ['folio575','folio 575'], ['folioE158','folio e158'], ['folio586','folio 586'],
     ['n50neonatos','50 neonatos'], ['n28','en 28'], ['mil','1 cada 1000 nacidos vivos']
    ].forEach((par) => { out['_pant_glob_m_' + par[0]] = (todo.indexOf(par[1]) > -1) ? 1 : 0 });
  } catch (e) { out['_pant_glob_faltan'] = 'EXC ' + String(e).slice(0, 60) }
  /* La FRANJA ROJA de contraindicaciones de Eisenmenger: decision expresa del medico, queda
     IDENTICA a HEAD. Se mide su texto entero y su color, no su presencia. */
  try {
    const NN2 = (t) => String(t || '').split(String.fromCharCode(10)).join(' ')
      .split('  ').join(' ').split('  ').join(' ').split('  ').join(' ').trim();
    /* ⚠️ LA FRANJA NO TIENE id: es un div con estilo en linea dentro de #sacc-cc-eisen, justo
       antes de #eisen-fila. Se busca por su texto, que es lo unico estable. La primera version
       de esta sonda la buscaba por un id inventado y daba NO EXISTE en los DOS arboles: un
       denominador vacio, que se lee igual que «no cambio». */
    const sec = document.getElementById('sacc-cc-eisen');
    let fr = null;
    if (sec) { const ds = Array.prototype.slice.call(sec.querySelectorAll('div'));
      for (let i = 0; i < ds.length; i++) {
        if ((ds[i].textContent || '').indexOf('Contraindicaciones absolutas') > -1
            && ds[i].querySelectorAll('div').length === 0) { fr = ds[i]; break } } }
    out['_pant_eisFranja'] = fr ? NN2(fr.textContent) : 'NO EXISTE';
    out['_pant_eisFranjaN'] = String(out['_pant_eisFranja']).length;
  } catch (e) { out['_pant_eisFranja'] = 'EXC' }
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
