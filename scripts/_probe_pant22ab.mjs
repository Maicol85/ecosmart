#!/usr/bin/env node
/**
 * _probe_pant19ab.mjs - el A/B de SUPERFICIES de la tanda PANT-19 (2026-11-06). Copia del de
 * PANT-18, que trae montadas las escenas de las tandas anteriores: quedan como CONTROL, porque
 * ninguna de ellas puede moverse por esta tanda. Las escenas con MODELO cargado se le suman en
 * el commit 4, que es cuando existe el campo.
 * ⚠️ EL CERO DE ESTE ARNES ES UN CONTROL NEGATIVO PARA LOS COMMITS 2, 3 y 6: su montaje siembra
 * campos y NO abre la card de «Modelo y tamano», asi que sobre el catalogo no prueba nada. Lo
 * que prueba que el catalogo esta bien cargado es el caso de integridad contra la transcripcion.
 * Nombre propio: verificado con ls, no existia.
 *
 * (cabecera original de PANT-17)
 * _probe_pant17ab.mjs - el A/B de SUPERFICIES de la tanda PANT-17 (2026-11-06). Copia del de
 * PANT-14c, que trae montadas las escenas de las tandas anteriores: quedan como CONTROL, porque
 * ninguna de ellas puede moverse por esta tanda. Se le suman SIETE escenas propias, una por
 * cuestionario nuevo mas la ventana aortopulmonar y un estudio ajeno.
 * ⚠️ ESTE ARNES NO CONTESTA NINGUNA PREGUNTA DEL PANEL -lo contestado vive en `_indClin`, que
 * es memoria del panel y no un campo-, asi que su cero prueba que las SECCIONES NUEVAS no
 * mueven el papel; lo que prueba que el cuestionario funciona son TC-714 a TC-719.
 *
 * (cabecera original de PANT-14c)
 * _probe_pant14c_ab.mjs - el A/B de SUPERFICIES de la tanda PANT-14c (2026-11-05).
 * Copia del de PANT-14b, que trae montadas las escenas de las tandas anteriores: quedan como
 * CONTROL, porque ninguna de ellas puede moverse por esta tanda. Se le agregan las escenas del
 * esquema del posoperatorio -la tabla casilla x datos del commit 2-.
 * ⚠️ EL CERO DE ESTE ARNES ES UN CONTROL NEGATIVO PARA EL COMMIT 1: su montaje siembra campos y
 * no abre el modulo ni toca «Incluir en el PDF», asi que sobre el bloque del corazon maestro no
 * prueba nada. Lo que prueba el commit 1 es _probe_pant14c_pdf.mjs, antes y despues.
 * Nombre propio: verificado con ls, no existia.
 *
 * (cabecera original de PANT-14b)
 * _probe_p14b_ab.mjs - el A/B de SUPERFICIES de la tanda PANT-14b (2026-11-05). Calcado de
 * _probe_pant12ab.mjs, que trae montadas las escenas de las tandas anteriores: quedan como
 * CONTROL, porque ninguna de ellas puede moverse por esta tanda.
 * Nombre propio: verificado con ls, no existia.
 *
 * El commit 1 (etiquetas, tildes y campo corto) NO puede mover ninguna superficie firmada: las
 * tildes que cambia estan en la DESCRIPCION del diagrama del pulmon, que es un texto de PANTALLA
 * (`#pul-dib-desc`), y las del modulo estan en su titulo, su title y su aria-label.
 * ⚠️ POR ESO SU CERO ES UN CONTROL, no una prueba: lo que prueba el commit 1 son
 * _probe_pant13etq.mjs (el desfase de las etiquetas) y _probe_pant13tildes.mjs (el censo).
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
const OUTF = arg('--out') || '/tmp/ab_pant21.json';

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
  /* ══ ESCENAS DE LA TANDA PANT-22 — LA EVIDENCIA DE UN SECTOR AVANZADO ═══════════════════════
     Nada de esta tanda llega al papel: el panel de Evidencia vive SOLO en pantalla. Asi que el
     informe en los tres estilos, el EN SUMA, las 457 columnas de Excel, el censo de campos, el
     PDF y el PPT tienen que salir IDENTICOS a HEAD en las seis.
     LAS ESCENAS CON SECTOR INTEGRADO NO SON UN ADORNO: sin ellas el cero del A/B seria un
     control negativo sobre escenas que no alcanzan la zona que la tanda toca -ninguna de las
     108 heredadas integra un sector avanzado-. Con el sector INTEGRADO su hoja del PDF y su
     diapositiva del PPT SI se emiten, que es el denominador que hace que el cero pruebe algo.
     p22med    - el caso del medico: TAPSE bajo y E/e-prima elevado, y NINGUN sector integrado.
     p22medCvr - el mismo dato, con la constriccion integrada: su hoja llega al papel.
     p22medHem - idem con el perfil hemodinamico.
     p22medAmi - idem con las DOS hojas de amiloidosis.
     p22medTre - los tres a la vez.
     p22avTodo - dato amplio y los sectores que se dejen integrar, que es el maximo de papel.
     (Sin acentos graves: este comentario vive dentro del archivo del arnes.) */
  p22med:     { pastillas:[],
                campos:{ nombre:'P22', ci:'22', tapse:'14', onda_e:'95', e_sep:'5', e_lat:'7' } },
  p22medCvr:  { pastillas:[], integrar:['cvr'],
                campos:{ nombre:'P22', ci:'22', tapse:'14', onda_e:'95', e_sep:'5', e_lat:'7' } },
  p22medHem:  { pastillas:[], integrar:['hemo'],
                campos:{ nombre:'P22', ci:'22', tapse:'14', onda_e:'95', e_sep:'5', e_lat:'7' } },
  p22medAmi:  { pastillas:[], integrar:['ett','alg'],
                campos:{ nombre:'P22', ci:'22', tapse:'14', onda_e:'95', e_sep:'5', e_lat:'7' } },
  p22medTre:  { pastillas:[], integrar:['cvr','hemo','ett'],
                campos:{ nombre:'P22', ci:'22', tapse:'14', onda_e:'95', e_sep:'5', e_lat:'7' } },
  p22avTodo:  { pastillas:[], integrar:['ett','alg','hemo','hfpeff','htp','tep','vexus','dpt','cvr','conco'],
                campos:{ nombre:'P22', ci:'22', peso:'75', talla:'175', tapse:'14',
                         onda_e:'95', e_sep:'5', e_lat:'7', siv:'14', ppvi:'14', fevi:'55',
                         it_vmax:'3.2', diam_tsvi:'22', itv_tsvi:'22', fc:'70' } },
  /* ══ ESCENAS DE LA TANDA PANT-20 — EL CATALOGO EN LA MITRAL, LA TRICUSPIDE Y LA PULMONAR ══
     El papel tiene que salir IDENTICO a HEAD en TODAS: esta tanda no autoriza ningun cambio de
     papel. Las UNICAS diferencias admitidas son las del INVENTARIO del formulario -los doce
     campos guardados nuevos y las doce columnas de Excel-, que estan VACIAS en las escenas
     donde el modelo no se carga y traen su valor en las seis donde si.
     Cada una lleva la pastilla de su lesion ABIERTA: sin ella el informe no describe esa
     valvula y el papel sale vacio en los DOS arboles, o sea que un cero no probaria nada.
     ⚠️ LOS CAMPOS DEL MODELO NO EXISTEN EN HEAD, asi que en ese arbol la siembra no los
     encuentra y el resto de la escena queda identico: es lo correcto, y la diferencia que
     aparece es exactamente el inventario. */
  p20vmMec:   { sel:{ vm_morf:'Prótesis mecánica' }, pastillas:[['mitral','esten']],
                campos:{ peso:'75', talla:'175', em_gmedio:'6', em_vmax:'1.9',
                         em_thp_display:'120', vm_prot_modelo:'Carbomedics', vm_prot_tam:'27' } },
  p20vmBio:   { sel:{ vm_morf:'Prótesis biológica' }, pastillas:[['mitral','esten']],
                campos:{ peso:'75', talla:'175', em_gmedio:'7', em_vmax:'2.0',
                         vm_prot_modelo:'Hancock II', vm_prot_tam:'29' } },
  p20vtMec:   { sel:{ vt_morf:'Prótesis mecánica' }, pastillas:[['tricuspide','esten']],
                campos:{ peso:'75', talla:'175', et_gmedio:'5', et_thp:'90', et_e_vmax:'150',
                         vt_prot_modelo:'St. Jude Medical Standard', vt_prot_tam:'29' } },
  p20vtBio:   { sel:{ vt_morf:'Prótesis biológica' }, pastillas:[['tricuspide','esten']],
                campos:{ peso:'75', talla:'175', et_gmedio:'6',
                         vt_prot_modelo:'Medtronic Mosaic', vt_prot_tam:'31' } },
  p20vpMec:   { sel:{ vp_morf:'Prótesis mecánica' }, pastillas:[],
                campos:{ peso:'75', talla:'175', ep_gmedio:'12', ep_vmax:'2.2',
                         vp_prot_modelo:'St. Jude', vp_prot_tam:'25' } },
  p20vpLim:   { sel:{ vp_morf:'Prótesis biológica' }, pastillas:[],
                campos:{ peso:'75', talla:'175', ep_gmedio:'10',
                         vp_prot_modelo:'Homograft', vp_prot_tam:'' } },
  /* control negativo propio: las tres morfologias protesicas SIN modelo cargado. */
  p20sinMod:  { sel:{ vm_morf:'Prótesis mecánica', vt_morf:'Prótesis mecánica',
                      vp_morf:'Prótesis mecánica' }, pastillas:[['mitral','esten']],
                campos:{ peso:'75', talla:'175', em_gmedio:'6', et_gmedio:'5', ep_gmedio:'12' } },
  /* ══ ESCENAS DE LA TANDA PANT-21 — LA EVIDENCIA DE PROTESIS ════════════════════
     Las cuatro llevan la valvula en el estado ALTERADO que abre el bloque de causas -«posible»
     en la aortica, la mitral y la pulmonar; «aislado» en la tricuspide-, que es justo donde esta
     tanda agrega texto a la PANTALLA. El papel tiene que salir IDENTICO a HEAD en las cuatro:
     la Evidencia no llega al informe, al EN SUMA, al PDF ni al PPT.
     Sin estas cuatro, el cero del A/B seria un control negativo sobre escenas que no alcanzan la
     zona que la tanda toca. */
  p21aoPos:   { sel:{ va_morf:'Pr\u00f3tesis mec\u00e1nica' }, pastillas:[['aortica','esten']],
                campos:{ peso:'75', talla:'175', vmax_ao:'3.5', gmedio_ao:'25',
                         va_at:'95', tango_te:'300', tsvi_diam:'21', tsvi_vti:'20', vti_ao:'70' } },
  p21vmPos:   { sel:{ vm_morf:'Pr\u00f3tesis biol\u00f3gica' }, pastillas:[['mitral','esten']],
                campos:{ peso:'75', talla:'175', em_gmedio:'7', em_vmax:'2.1', thp:'150' } },
  p21vtAis:   { sel:{ vt_morf:'Pr\u00f3tesis biol\u00f3gica' }, pastillas:[['tricuspide','esten']],
                campos:{ peso:'75', talla:'175', et_gmedio:'7' } },
  p21vpPos:   { sel:{ vp_morf:'Pr\u00f3tesis biol\u00f3gica' }, pastillas:[],
                campos:{ peso:'75', talla:'175', ep_gmedio:'20', ep_vmax:'3.2' } },
  /* ══ ESCENAS DE LA TANDA PANT-18 — LA PROTESIS AORTICA ════════════════════════════════════
     El papel tiene que salir IDENTICO a HEAD en TODAS, con DOS excepciones autorizadas:
       (a) commit 6 — una TAVI que cumple criterios pasa a emitir la misma frase de severidad
           que las demas protesis aorticas, en vez de «sin graduacion»;
       (b) commit 7 — con «sugiere estenosis protesica significativa» el papel deja de escribir
           la frase del desajuste.
     TODAS llevan la pastilla de la lesion ABIERTA: sin ella el informe no describe la aortica
     y el papel sale vacio en los DOS arboles, o sea que un cero no probaria nada.
     `tango_te` se siembra por su id de SIEMPRE —existe en los dos arboles—, que es como se
     evita la trampa de poner un valor que HEAD no tiene.
       p18mec/p18bio/p18tavi - estenosis significativa Y desajuste severo: la escena del medico.
       p18*Normal            - sin criterios: el papel no puede moverse por el commit 7.
       p18mecPosible         - posible estenosis + desajuste severo: el desajuste SE QUEDA.
       p18mecPpmSolo         - sin estenosis + desajuste severo: el desajuste SE QUEDA.
       p18mecFaltan          - sin DVI: «falta un dato», y el desajuste SE QUEDA.
       p18nativa / p18ajeno  - los dos controles negativos. */
  p18mec:       { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
                  campos:{ peso:'70', talla:'170', vmax_ao:'5', ea_dtsvi:'21',
                           ea_vtitsvi:'10', ea_vtiao:'45', va_at:'101', tango_te:'300' } },
  p18bio:       { sel:{ va_morf:'Prótesis biológica' }, pastillas:[['aortica','esten']],
                  campos:{ peso:'70', talla:'170', vmax_ao:'5', ea_dtsvi:'21',
                           ea_vtitsvi:'10', ea_vtiao:'45', va_at:'101', tango_te:'300' } },
  p18tavi:      { sel:{ va_morf:'TAVI' }, pastillas:[['aortica','esten']],
                  campos:{ peso:'70', talla:'170', vmax_ao:'5', ea_dtsvi:'21',
                           ea_vtitsvi:'10', ea_vtiao:'45', va_at:'101', tango_te:'300' } },
  p18mecNormal: { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
                  campos:{ peso:'70', talla:'170', vmax_ao:'2.5', gmedio_ao:'10', ea_dtsvi:'21',
                           ea_vtitsvi:'20', ea_vtiao:'40', va_at:'70', tango_te:'300' } },
  p18taviNormal:{ sel:{ va_morf:'TAVI' }, pastillas:[['aortica','esten']],
                  campos:{ peso:'70', talla:'170', vmax_ao:'2.5', gmedio_ao:'10', ea_dtsvi:'21',
                           ea_vtitsvi:'20', ea_vtiao:'40', va_at:'70', tango_te:'300' } },
  p18mecPosible:{ sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
                  campos:{ peso:'70', talla:'170', vmax_ao:'3.5', gmedio_ao:'25', ea_dtsvi:'21',
                           ea_vtitsvi:'12', ea_vtiao:'40', va_at:'95', tango_te:'300' } },
  p18mecPpmSolo:{ sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
                  campos:{ peso:'70', talla:'170', vmax_ao:'2.5', gmedio_ao:'10', ea_dtsvi:'16',
                           ea_vtitsvi:'20', ea_vtiao:'40', va_at:'70', tango_te:'300' } },
  p18mecFaltan: { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
                  campos:{ peso:'70', talla:'170', vmax_ao:'5', va_at:'101', tango_te:'300' } },
  p18nativa:    { sel:{ va_morf:'Trivalva normal' }, pastillas:[['aortica','esten']],
                  campos:{ peso:'70', talla:'170', vmax_ao:'5', ea_dtsvi:'21',
                           ea_vtitsvi:'10', ea_vtiao:'45', va_at:'101', tango_te:'300' } },
  p18ajeno:     { campos:{ fevi:'60', ddvi:'48' } },
  /* ══ ESCENAS DE LA TANDA PANT-17 ═════════════════════════════════════════
     Una por seccion que gano cuestionario, mas la ventana aortopulmonar -que es seccion NUEVA-,
     mas un estudio ajeno de control. Ninguna de las siete puede mover el papel: lo que la tanda
     agrega vive SOLO en el panel de Evidencia. */
  p17dap:  { dap_tipo:'no_restrictivo', dap_diam:'4', dap_dir:'id' },
  p17coa:  { coa_vmax:'3.2', coa_situacion:'nativa', coa_hta:'si',
             coa_gradiente_picopico:'28', coa_estenosis_relativa:'60' },
  p17tdf:  { tdf_sintomas:'si' },
  p17ep:   { vp_gmax:'70' },
  p17vab:  { vab_tipo:'fused_rl', ao_tub:'50' },
  p17mch:  { mch_grad_reposo:'60', mch_siv:'22' },
  p17vap:  { vap_tipo:'i', vap_diam:'8', vap_dir:'id', vap_htp:'no' },
  p17vapDI:{ vap_tipo:'iii', vap_diam:'12', vap_dir:'di' },
  p17ajeno:{ fevi:'60', ddvi:'48' },
  /* ══ ESCENAS DE LA TANDA PANT-14c ═════════════════════════════════════════════════════════
     EL COMMIT 2: la tabla casilla x datos del esquema del posoperatorio. `pop_esq_pdf` es un
     `input[type=hidden]`, asi que la siembra le escribe el valor directo, que es lo que el
     boton hace.
       p14cPopOnSin  - casilla ENCENDIDA y NINGUN dato del posoperatorio: la UNICA diferencia de
                       papel autorizada de este commit -el PDF deja de emitir el esquema vacio-.
       p14cPopOnCon  - casilla ENCENDIDA y datos cargados: papel IDENTICO a HEAD. Es el control
                       que importa: sin el, un cero no distingue «no se emite el vacio» de «no
                       se emite nunca».
       p14cPopOffCon - casilla APAGADA y datos cargados: identico a HEAD (no se emitia).
       p14cPopOffSin - los dos apagados: identico a HEAD. */
  p14cPopOnSin:  { campos: { pop_esq_pdf:'1' } },
  p14cPopOnCon:  { campos: { pop_esq_pdf:'1', peso:'70', talla:'170', pop_hora:'6',
      pop_ic:'1.76', pop_lactato:'3.2', pop_cx_valv:'si' } },
  p14cPopOffCon: { campos: { peso:'70', talla:'170', pop_hora:'6',
      pop_ic:'1.76', pop_lactato:'3.2', pop_cx_valv:'si' } },
  p14cPopOffSin: { campos: {} },
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
  /* -- COMMITS 5 a 7: la ecografia pulmonar. Las tres primeras son ESTUDIOS VIEJOS -solo los
     campos legados, que es todo lo que HEAD tenia-: ahi el papel tiene que salir IDENTICO.
     Las que usan los campos nuevos no existen en HEAD -sus selectores no estan-, asi que su
     comparacion util es contra la escena legada equivalente DENTRO del arbol nuevo. -- */
  p11pulVacio:  { campos: { pua_desliz:'presente', pua_lineasa:'presentes' } },
  p11pulLegBil: { campos: { pua_derrame:'si', pua_derrame_lado:'bilateral',
      pul_derrame_tam:'moderado', pua_derrame_tipo:'libre', pua_balik:'25' } },
  p11pulLegDer: { campos: { pua_derrame:'si', pua_derrame_lado:'unilateral derecho',
      pul_derrame_tam:'mínimo', pua_derrame_tipo:'libre' } },
  p11pulLegIzq: { campos: { pua_derrame:'si', pua_derrame_lado:'unilateral izquierdo',
      pul_derrame_tam:'severo' } },
  p11pulNoDer:  { campos: { pua_derrame:'no' } },
  p11pulConsol: { campos: { pua_consol:'si', pua_consol_bronco:'con', pul_consol_nota:'base derecha' } },
  p11pulLineas: { campos: { pua_lineasb:'presentes', pua_lineasb_cant:'multiples',
      pua_z_lat_d:'', pua_desliz:'presente' } },
  /* Las que usan los campos NUEVOS. */
  p11pulNvoBil: { campos: { pua_derrame:'si', pua_derrame_der:'moderado', pua_derrame_izq:'moderado',
      pua_derrame_tipo:'libre', pua_balik:'25' } },
  p11pulNvoDer: { campos: { pua_derrame:'si', pua_derrame_der:'leve', pua_derrame_izq:'ausente',
      pua_derrame_tipo:'libre' } },
  p11pulNvoIzq: { campos: { pua_derrame:'si', pua_derrame_der:'ausente', pua_derrame_izq:'severo' } },
  p11pulDisti:  { campos: { pua_derrame:'si', pua_derrame_der:'leve', pua_derrame_izq:'severo',
      pua_derrame_tipo:'libre', pua_balik:'25' } },
  p11pulAusent: { campos: { pua_derrame:'si', pua_derrame_der:'ausente', pua_derrame_izq:'ausente' } },
  p11pulCnLado: { campos: { pua_consol:'si', pua_consol_bronco:'con', pua_consol_lado:'der',
      pul_consol_nota:'base derecha' } },
  /* -- COMMIT 6: la MEDICION previa a la sincronia con el posoperatorio. --
     p11medPopPleu dice si escribir los campos de pleura del posoperatorio hace que un estudio
     comun cuente como posoperatorio; p11medDoble, si con el posoperatorio INTEGRADO el derrame
     se imprimiria DOS veces en el informe. */
  p11medPopPleu: { campos: { pop_pleura_der:'moderado', pop_pleura_izq:'leve' } },
  p11medDoble:   { campos: { peso:'70', talla:'170', pop_monitor:'picco', pop_picco_ic:'1.8',
      pop_pleura_der:'moderado', pop_pleura_izq:'moderado',
      pua_derrame:'si', pua_derrame_der:'moderado', pua_derrame_izq:'moderado' },
      integrar:['pop'] },
  p11medDobleHead: { campos: { peso:'70', talla:'170', pop_monitor:'picco', pop_picco_ic:'1.8',
      pop_pleura_der:'moderado', pop_pleura_izq:'moderado',
      pua_derrame:'si', pua_derrame_lado:'bilateral', pul_derrame_tam:'moderado' },
      integrar:['pop'] },
  /* -- COMMIT 8: la mudanza de Masas. El papel tiene que salir IDENTICO en las dos. -- */
  p11masBlanco: { campos: { pericardio:'leve' } },
  p11masCargada: { campos: { masa_presente:'Masa / imagen intracardíaca presente',
      masa_cavidad:'AI', masa_loc:'Septo', masa_tam_mm:'18', masa_morf:'Pediculada',
      masa_movil:'Móvil', masa_eco:'Mixta', masa_dx:'Mixoma',
      masa_notas:'pediculada en fosa oval', otras_notas:'control en 6 meses' } },
  /* == LAS ESCENAS DE LA TANDA PANT-9 ======================================================
     Una por seccion rediseniada, con TODOS sus campos cargados Y la casilla «Integrar al
     informe» encendida: sin eso un cero de superficie firmada no distingue «el papel no se
     movio» de «la escena no llega a la zona». Al lado, el control de la compuerta -los MISMOS
     datos sin integrar- en las dos secciones mas grandes, y las combinaciones de casillas de
     complicaciones del Fontan, que es lo que la orden pide verificar.
     p9vacio y p9ajeno son los controles negativos. */
  /* ══ ESCENAS DE LA TANDA PANT-12 ══════════════════════════════════════════════════════════ */
  p12vcsOff:  { chk:['otr_var_eustaquio'], campos:{ onda_e:'90', e_sep:'6', e_lat:'8' } },
  p12vcsOn:   { chk:['otr_var_eustaquio','otr_var_vcsip'], campos:{ onda_e:'90', e_sep:'6', e_lat:'8' } },
  p12vcsSolo: { chk:['otr_var_vcsip'] },
  p12vcsSeno: { chk:['otr_var_senocor','otr_var_vcsip'] },
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
                       onda_e:'110', e_sep:'5', e_lat:'6', ai_vol:'70', peso:'80', talla:'180' } },
  /* ══ PANT-19: escenas CON MODELO CARGADO ═════════════════════════════════════
     Hasta el commit 4 el modelo NO toca una sola superficie firmada, asi que estas escenas
     tienen que dar CERO. En el commit 5 cambian las que cumplen SUS tres condiciones -protesis
     quirurgica, modelo del catalogo con desvio de la EOA, y AVA por continuidad calculada-, y
     ninguna otra. Los campos del modelo NO EXISTEN en HEAD: ponerlos ahi es inocuo -el campo no
     esta y el valor se descarta-, que es justo lo que hace de estas escenas un control util. */
  p19modMec: { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
               campos:{ va_prot_modelo:'St. Jude Medical Standard', va_prot_tam:'23',
                        peso:'75', talla:'175', gmedio_ao:'24.5', vmax_ao:'3.2',
                        ea_dtsvi:'21', ea_vtitsvi:'18', ea_vtiao:'60' } },
  p19modBio: { sel:{ va_morf:'Prótesis biológica' }, pastillas:[['aortica','esten']],
               campos:{ va_prot_modelo:'Abbott Trifecta', va_prot_tam:'23',
                        peso:'75', talla:'175', gmedio_ao:'8', vmax_ao:'2.6',
                        ea_dtsvi:'21', ea_vtitsvi:'20', ea_vtiao:'60' } },
  /* el MISMO estudio SIN modelo: el control que separa «el modelo no mueve el papel» de
     «la escena no llega a la zona». */
  p19sinMod: { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
               campos:{ peso:'75', talla:'175', gmedio_ao:'24.5', vmax_ao:'3.2',
                        ea_dtsvi:'21', ea_vtitsvi:'18', ea_vtiao:'60' } },
  /* TAVI con modelo y el modo MANUAL: ninguno de los dos entra en la regla del commit 5. */
  p19modTavi: { sel:{ va_morf:'TAVI' }, pastillas:[['aortica','esten']],
                campos:{ va_prot_modelo:'SAPIEN 3', va_prot_tam:'All',
                         peso:'75', talla:'175', gmedio_ao:'11', vmax_ao:'2.4',
                         ea_dtsvi:'21', ea_vtitsvi:'20', ea_vtiao:'55' } },
  p19modMan: { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
               campos:{ va_prot_modelo:'Marca equis', va_prot_tam:'21',
                        va_prot_gmref:'14', va_prot_eoaref:'1.3',
                        peso:'75', talla:'175', gmedio_ao:'24.5', vmax_ao:'3.2',
                        ea_dtsvi:'21', ea_vtitsvi:'18', ea_vtiao:'60' } },
  /* ══ LA FAMILIA DONDE EL COMMIT 5 CAMBIA EL PAPEL ═════════════════════════════
     Con el TSVI de 21 mm la EOA y el DVI se mueven JUNTOS —los dos salen del cociente de los
     dos VTI— y la EOA nunca dice nada que el DVI no diga. Lo que los separa es el DIAMETRO del
     TSVI: con 16 mm el DVI se queda NORMAL (0,40) mientras el area cae a 0,80 cm², dos desvios
     por debajo de la del modelo. Con el eje dependiente del flujo en significativa, la tarjeta
     pasa de «posible» a «significativa» y con ella la frase del informe y la del EN SUMA.
     Es la UNICA diferencia de papel que esta tanda autoriza. */
  p19eoaCambia: { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
                  campos:{ va_prot_modelo:'St. Jude Medical Standard', va_prot_tam:'23',
                           peso:'75', talla:'175', gmedio_ao:'38', vmax_ao:'4.5',
                           ea_dtsvi:'16', ea_vtitsvi:'18', ea_vtiao:'45' } },
  /* el MISMO estudio sin modelo: el control que prueba que el cambio lo trae el modelo */
  p19eoaCambiaSin: { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
                     campos:{ peso:'75', talla:'175', gmedio_ao:'38', vmax_ao:'4.5',
                              ea_dtsvi:'16', ea_vtitsvi:'18', ea_vtiao:'45' } },
  /* y los dos controles de la regla: TAVI y modo MANUAL con los MISMOS numeros */
  p19eoaTavi: { sel:{ va_morf:'TAVI' }, pastillas:[['aortica','esten']],
                campos:{ va_prot_modelo:'SAPIEN 3', va_prot_tam:'All',
                         peso:'75', talla:'175', gmedio_ao:'38', vmax_ao:'4.5',
                         ea_dtsvi:'16', ea_vtitsvi:'18', ea_vtiao:'45' } },
  p19eoaMan: { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
               campos:{ va_prot_modelo:'Marca equis', va_prot_tam:'21',
                        va_prot_gmref:'14', va_prot_eoaref:'1.3',
                        peso:'75', talla:'175', gmedio_ao:'38', vmax_ao:'4.5',
                        ea_dtsvi:'16', ea_vtitsvi:'18', ea_vtiao:'45' } },
  /* un modelo cuya EOA esta impresa SIN desvio: tampoco entra en la regla */
  p19eoaSinSD: { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
                 campos:{ va_prot_modelo:'Edwards Mira', va_prot_tam:'25',
                          peso:'75', talla:'175', gmedio_ao:'38', vmax_ao:'4.5',
                          ea_dtsvi:'16', ea_vtitsvi:'18', ea_vtiao:'45' } },
  /* una EOA MEDIDA MUY POR DEBAJO de la del modelo: es la escena donde el commit 5 cambia. */
  p19modZbajo: { sel:{ va_morf:'Prótesis mecánica' }, pastillas:[['aortica','esten']],
                 campos:{ va_prot_modelo:'St. Jude Medical Standard', va_prot_tam:'23',
                          peso:'75', talla:'175', gmedio_ao:'22', vmax_ao:'3.2',
                          ea_dtsvi:'21', ea_vtitsvi:'18', ea_vtiao:'95' } }
};
const SOLO = (arg('--solo') || Object.keys(ESCENAS).join(',')).split(',').map(s => s.trim());

const MONTAR = `((esc) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  /* ⚠️ pop_esq_pdf SE NORMALIZA A MANO EN CADA UNA, Y SE MIDIO POR QUE (PANT-14c).
     En HEAD ese campo es un input[type=hidden] que limpiarCampos NO alcanza, asi que la PRIMERA
     que lo enciende lo deja encendido para TODAS las que siguen: medido, en el arbol de HEAD la
     pagina del esquema del posoperatorio aparecia en las 63 posteriores. Con el arbol nuevo
     limpiarCampos si lo apaga, asi que sin esta linea las dos corridas no arrancan del mismo
     estado y el A/B mostraria diferencias en todas las de abajo: seria el arnes midiendo la fuga
     de HEAD y no lo que cada commit cambia. La fuga la mide _probe_pant14c_pop.mjs, con el boton
     real y el recorrido de Nuevo estudio.
     ⚠️ Y ESTE COMENTARIO NO PUEDE CONTENER LA PALABRA QUE EL RUNNER USA DE MARCADOR: el montaje
     hace MONTAR.replace(<marcador>, JSON), y String.replace con una cadena cambia la PRIMERA
     aparicion. Escrito con esa palabra adentro, el JSON se inyectaba en este comentario y el
     parametro quedaba sin definir: «no esta definida». Es la trampa que TGA-4 ya documenta.
     (Sin acentos graves: este comentario vive DENTRO del template de MONTAR.) */
  try { const _pe = document.getElementById('pop_esq_pdf'); if (_pe) _pe.value = '';
        if (typeof popEsqPdfSync === 'function') popEsqPdfSync() } catch (e) {}
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
