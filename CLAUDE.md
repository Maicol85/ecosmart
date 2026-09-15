# EcoSmart — trampas de este archivo

Leer esto antes de tocar `index.html`. Son cosas que ya costaron una sesión cada una;
ninguna es evidente leyendo el código alrededor.

## Arquitectura

- **Un solo archivo**, **1,75 MB / 31.233 líneas** (medido 2026-09-08). HTML + CSS + JS
  inline, sin build, sin dependencias externas más allá de jsPDF, XLSX y PptxGenJS por CDN.
  No confundir con los **1,24 MB / ~21.000 líneas del JS extraído**, que es lo que escanea
  Semgrep: `scan.py` saca el JS de los `<script>` antes de analizar, así que sus números de
  línea NO son los del archivo. Para ubicar un hallazgo hay que buscar el fragmento con
  `grep`, no sumarle un offset.
- **`CeiboStore` es el borde de confianza para los id de informe.** El saneo va ahí, no en
  las plantillas: cinco funciones leen `CeiboStore.getLocal()` directo sin pasar por
  `getInformes()`, así que arreglar `getInformes` deja esas cinco afuera, y una plantilla
  nueva reabre el agujero.
- **`amiloSanPDFml` es la función correcta para texto multilínea en el PDF.** `amiloSanPDF`
  es la de una sola línea.
- **El extractor de JS falla siempre en los bloques 0 y 1.** Cualquier chequeo de sintaxis
  que los recorra va a reportarlos como rotos y no lo están: es el extractor, que corta mal
  por un `</script>` dentro de una cadena. Comparar SIEMPRE contra HEAD antes de creerle a
  un resultado. `CeiboStore` vive en el **bloque 8**, que sí se valida.

## Trampas

### Un campo «auto» que se calcula UNA vez es peor que uno vacío
`vp_gmax` («G. Máx pulmonar — auto») se derivaba con `if (vmax && !gmax)`: se llenaba en el
primer keystroke y **nunca más**. Como el `oninput` dispara carácter por carácter, tipear «4.5»
dejaba el gradiente del «4» intermedio —64 en vez de 81—, y corregir una velocidad ya cargada no
movía nada. El síntoma que se reportó fue «con Vmax 4 m/s el gradiente da 16»: reproducido exacto
en el navegador, es el gradiente de una Vmax 2 anterior sobreviviendo al cambio de velocidad.
**La fórmula siempre estuvo bien; lo que estaba mal era cuándo se aplicaba.** Antes de creerle al
diagnóstico de un bug de cálculo, reproducirlo: el reporte decía «falta elevar al cuadrado» y el
`4 * vmax * vmax` estaba ahí, correcto, desde siempre.

Regla: un campo derivado se recalcula **siempre** que cambia su origen, y se **limpia** cuando el
origen desaparece. Si no, el informe firmado publica dos números contradiciéndose dentro del
mismo paréntesis: «Válvula pulmonar estenosis moderada/severa (Vmax 4 m/s, Gmax 16 mmHg)».

### `dataset` no se persiste, pero tampoco se limpia solo
Las marcas de «este valor lo escribió la app» (`derivadoDe`, `sugerido`, `espejoDe`) viven en el
nodo del DOM. Escribí tres comentarios afirmando que «un estudio reabierto nunca coincide, falla
del lado seguro» — **la premisa era falsa**. No persistirse no es lo mismo que limpiarse: su
alcance es la **sesión**, no el estudio, y `limpiarCampos` vacía `.value` sin tocarlas.

Consecuencia medida: paciente A con Vmax 3 deja `vp_gmax = 36` y `derivadoDe = "36"`; «Nuevo
estudio» vacía el campo y deja la marca; el médico del paciente B, que no tiene velocidad, tipea
el gradiente medido —36— y **el campo se borra solo en la tecla que lo completa**. El espacio de
colisión es justo el de los valores redondos (16, 25, 36, 49, 64), que son los que se tipean a
mano. El archivo ya sabía esto: `limpiarCampos` borra `dataset.tocado` y `dataset.desdeEstudio`
a mano, y la reimpresión los respalda. Faltaba aplicarlo. Hoy hay un barrido **por atributo**
(`[data-derivado-de],[data-sugerido],[data-espejo-de]`) en `limpiarCampos` y un backup/restore en
`_pdfDeInformeGuardadoArmar`, para que una marca nueva quede cubierta sin que nadie se acuerde.

### Clasificar un número y publicar OTRO
La FAC se calculaba cruda, se clasificaba cruda y se **guardaba redondeada**. Con áreas 20,0 /
13,1 (FAC 34,5): la cápsula decía «35% — disfunción (<35%)» —contradiciéndose sola— y el informe
firmado, que lee `vd_fac` ya redondeado, decía «función sistólica conservada (FAC 35%)». En el
borde de severidad, la cápsula decía «25% — disfunción severa (<25%)» y el En Suma no emitía la
línea, porque `25 < 25` es falso. Es el mismo defecto que `calcGeometriaVI` documenta haber
cerrado. **Clasificar siempre sobre el valor que se imprime.**

### Un default tranquilizador es una afirmación
Los tres selects del TEER —calcificación, clefts, trombo en AI— tenían `value="no"` como opción
0, así que en todo estudio nuevo valían «no» sin que nadie los mirara. Mientras eso sólo pintaba
badges en pantalla, pasaba; en cuanto el módulo ganó «Integrar al informe», la hoja del PDF
**afirmaba** «sin calcificación densa» y «sin clefts» —los dos hallazgos que más limitan el
agarre del clip— y esos dos «cumplidos» alcanzaban para concluir **APTO**. Hoy los tres arrancan
en «— no evaluado —», c9/c10 devuelven `null` en ese estado, y el trombo sin consignar nunca
llega a «apto»: es contraindicación **absoluta** y el lado seguro es pedirlo, no suponerlo.

### Un criterio que se pinta y no se cuenta
`fallos` en el TEER era `[c1..c6, c9]` y `noIngresados` sólo `[c1..c6]`, mientras `r.orden`
pintaba e imprimía los once. Resultado: con los seis anatómicos correctos y `teer_clefts = 'si'`,
la misma hoja firmada decía «Clefts/perforaciones - limitan agarre» y dos renglones abajo «APTO
para TEER - criterios cumplidos». Y «Faltan N criterio(s)» contaba sobre 6 de 8. Hoy hay **una
sola lista** (`veto`) de la que salen `fallos`, `evaluados` y `noIngresados`, para que agregar un
criterio no exija acordarse de tres sitios.

**Volvió a pasar, con `c7` y `c8` (2026-09-15).** El arreglo de `c10` unificó la lista pero no
revisó quién más se estaba pintando sin contar: los dos criterios de inclusión del COAPT —FEVI
20-50 % y DTSVI ≤70 mm— nunca habían estado, así que la hoja firmada seguía pudiendo decir «78mm
>70mm - NO apto» y, nueve renglones abajo, «✅ APTO para TEER». Lo encontró el test suite, no una
relectura. Hoy vetan, gateados por `esSec` estricto. La regla que queda: **al cerrar un defecto
de esta forma, enumerar todo lo que se pinta y cruzarlo contra la lista**, no sólo arreglar el
que se reportó.

### Al borrar una calculadora duplicada, lo que se borra es el SCORE, no el dato
La pestaña de Cardio-Oncología tuvo dos estimadores de riesgo basal: el score propio de
`calcCardioOnco` (riesgo CV + edad + FEVI + dosis, bandas ≤1/≤3/≤5) y el marco HFA-ICOS. Bajaban
al mismo informe firmado por caminos distintos —uno a la hoja del PDF, el otro al narrativo— así
que un paciente con doxorrubicina 250 mg/m² y nada más cargado salía «MODERADO (2 pts)» en una
página y «MUY ALTO» en otra, con dos agendas de control incompatibles. **Se eliminó el score
propio (2026-09-15).** Queda una sola calculadora.

Lo que hace que borrar esto no rompa media app son dos decisiones:

1. **Los CAMPOS de entrada se quedan.** `co_farmaco`, `co_dosis_antrac`, `co_fevi_basal`,
   `co_gls_basal`, `co_edad` y `co_riesgo_cv` los leen la cascada de toxicidad, la tabla de
   evolución, la hoja del PDF, el Excel y el filtro de cohorte del Laboratorio — y viven en los
   estudios ya guardados. Borrarlos habría vaciado columnas de exportaciones históricas. El
   bloque pasó a llamarse «Datos basales»: sigue siendo entrada de datos, ya no calcula.
2. **El CONTENEDOR se queda y se repuebla.** `co-riesgo-resultado` es de donde toman la
   clasificación la hoja del PDF y el texto del módulo integrado (`_amRows`) y el PPT
   (`_pptSpan`). Borrarlo habría dejado esas tres superficies mudas. Se lo llena desde
   `hfaicosEstado()`, y con eso las tres pasan a publicar la banda nueva **sin tocar ninguna**.

Y el acoplamiento que hay que no olvidar: el contenedor lo pintan DOS caminos —`calcCardioOnco`,
que corre con los campos basales, y `calcHFAICOS`, que corre al tildar un factor—. Con un solo
llamador, tildar un factor repintaba la cápsula de la calculadora y dejaba el contenedor que baja
al informe con la banda anterior. Un pintor (`hfaicosPublicarBasal`), dos llamadores.

**El aviso que concilia cambió tres veces en el día**, y cada versión describía un estado distinto
de la app: «esta tabla no se imprime» → «al informe bajan DOS bandas» → «una sola banda». Un aviso
que quedó describiendo el estado anterior es peor que no tenerlo; TC-99 lo fija.

### Un invariante que vive sólo en la interfaz no es un invariante
Los dos criterios de FEVI de la calculadora se excluyen: una misma medición no puede estar en
50-54% y por debajo de 50. La exclusión se escribió en `hfaicosToggle`, o sea en el clic — y
alcanzaba mientras el único camino fuera el dedo del médico. Pero `hfaicosSyncDesdeEstudio` tilda
por su cuenta: una casilla marcada a mano, protegida contra la deducción, convivía con la
deducida. **3 puntos por una sola FEVI**, una banda entera de más, y el informe firmado listando
la misma FEVI basal en dos rangos disjuntos. Es «bloquear no es recalcular»: la exclusión tiene
que estar en `hfaicosEstado()`, que es quien suma.

### Una marca que protege una decisión tiene que durar lo que dura la decisión
«Esta casilla la movió una persona, no la deduzcas de nuevo» vivía en `dataset.manual`. El estado
del checkbox **se persiste**; `dataset` **no**, y además `limpiarCampos` barre una lista CERRADA
de atributos (`data-derivado-de`, `data-sugerido`, `data-espejo-de`) donde `data-manual` no
estaba. Los dos extremos fallaban:
- el médico destildaba «FEVI <50%», guardaba, y al día siguiente —página nueva— abría la sección
  de su propio estudio y la deducción se lo volvía a tildar, subiendo de banda un informe firmado;
- y la marca del paciente A sobrevivía a «Nuevo estudio», así que al paciente B no se le deducía
  nada y su informe decía «sin factores» sobre una FEVI de 38.

Pasó a un `<input type="hidden">` (`hfaicos_manual`), que viaja con el estudio, lo repone la
restauración y lo limpia `limpiarCampos` — **a mano**, porque el barrido genérico toma
`input[type=text]` e `input[type=number]` y los ocultos hay que nombrarlos uno por uno.

### «Basal» quiere decir basal: no caerse al dato de hoy
La deducción tomaba `co_fevi_basal` y, si estaba vacío, `fevi` — la FEVI **del estudio de hoy**.
En un control de ciclo 4 esa FEVI puede estar caída *por* el tratamiento, y con ella se tildaba
«FEVI **basal** <50%»: una afirmación falsa, en un informe firmado, sobre una medición anterior al
tratamiento. Sin la basal cargada no se deduce nada. Ídem el GLS, que además exige signo negativo
porque el resto de cardio-onco usa `Math.abs` y un `18` tipeado en vez de `-18` no recibe ningún
aviso en ninguna otra parte de la app.

### Un estilo acotado por id no viaja con la sección que se muda
Al repartir Congénitas en dos pestañas, la nueva quedó con celdas más altas, texto más grande y
otro fondo. El marcado era idéntico —las secciones se movieron enteras— pero **cinco reglas CSS
estaban acotadas a `#tab-congenitas`**, y a propósito: `.sacc` lo usan seis pestañas y el selector
pelado repintaría las otras cinco.

El arreglo **no es copiar el bloque** —eso crea una segunda fuente que se desincroniza— sino
**sumar el id nuevo a las mismas cinco reglas**. Con una sola sin actualizar, la diferencia vuelve.

**TC-114** compara propiedades **computadas** y en **los dos temas**. Dos detalles que lo hacen
valer: el fondo sale de una variable que cambia con el tema, así que el caso verifica además que
las dos lecturas **difieran entre sí** — si dieran lo mismo estaría comparando dos veces el mismo
tema y pasaría sin probar el modo noche (me pasó al verificarlo a mano). Y **las dos reglas de
`:hover` quedan sin cobertura**: `getComputedStyle` no resuelve pseudo-clases sin hover real, y
mutarlas no pone nada en rojo — verificado, no supuesto.

### Eisenmenger: las alertas son el módulo, y suben al EN SUMA
Sección implementada el 2026-09-15 (antes era un acordeón vacío). Lo que aporta no es la
descripción de la lesión sino **tres alertas que cambian una conducta**, y dos son de vida o
muerte: saturación <90 % (**embarazo contraindicado, mortalidad materna >50 %**), síncope y
hemoptisis. Por eso **suben al EN SUMA** y no se quedan en el cuerpo — una alerta que hay que ir a
buscar tres párrafos abajo ya falló.

**Ninguna se dispara por un campo vacío.** Condicionan por `=== 'si'` explícito o por un número
medido: un select en blanco no dice «no tiene síncope», dice «nadie lo preguntó». Es la regla del
`coa_diast_anterogrado`.

**La saturación se valida por banda (40-100 %).** Un `9` tipeado por `90` publicaría «saturación
crítica — embarazo contraindicado» sobre un paciente bien saturado, y un `900` no publicaría nada:
los dos emiten una conducta sobre un número ilegible. Fuera de banda se declara y NO vota.

**El panel de contraindicaciones absolutas va siempre visible**, no condicionado a ningún campo:
son absolutas por la fisiología del síndrome, no por el valor de una medición. Un aviso que sólo
aparece cuando el dato ya está cargado llega después de la consulta en que había que darlo.

**El derrame pericárdico sale en el informe pero NO en el EN SUMA**: es pronóstico, no una conducta
distinta hoy. El EN SUMA se reserva para lo accionable.

**Campos:** `eis_lesion_base`, `eis_saturacion_reposo`, `eis_saturacion_ejercicio`, `eis_psap`,
`eis_pdap`, `eis_it_vel`, `eis_vd_funcion`, `eis_pericardio`, `eis_clase_nyha`, `eis_sincope`,
`eis_hemoptisis`, `eisen_incluir_chk`. Con sus once columnas de Excel.

### TdF: un umbral que vive en la prosa no es un umbral
Las tres ramas de `tdfConclusion` decían «el criterio volumétrico se evalúa por RESONANCIA» — y
**no había campo**. La app nombraba el umbral y **nunca podía aplicarlo**: un asintomático con
insuficiencia pulmonar severa y un VTDVD indexado de 180 salía «sin criterios de reintervención
por los datos cargados», con el criterio que lo indica impreso dos renglones más arriba como algo
que se hace en otro lado. Cerrado el 2026-09-15 con `tdf_vtdvdi`, `tdf_vtsvdi` y `tdf_vol_fuente`.

**Umbrales ESC 2020** (Baumgartner, *EHJ* 2021;42:563), Clase IIa del asintomático con IP severa:
**VTDVDi ≥160 ml/m² O VTSVDi ≥80 ml/m²**. En `TDF_VTDVDI_MIN` / `TDF_VTSVDI_MIN` porque los
nombran tres superficies.

**El método importa tanto como el número, y acá más que en ningún otro campo: estos volúmenes NO
los mide un ecocardiograma — se transcriben.** Los umbrales están validados sobre **resonancia**,
y la **ecocardiografía 3D subestima** los volúmenes del VD, así que un 150 por eco puede ser un
170 real. Con método no consignado, eco 3D o tomografía el valor **se describe y NO vota**, y el
informe dice por qué. Es `coaConclusion` otra vez: el número correcto medido con el método
equivocado. Un campo que se transcribe de otra imagen **necesita un campo de fuente al lado**.

**Y las tres ramas dejaron de prometer lo que ya está.** Antes mandaban «se evalúa por
resonancia» aunque la resonancia ya estuviera cargada y por debajo del umbral: el informe firmado
pedía un estudio que el paciente ya tenía hecho. Al agregar el campo que satisface una promesa,
hay que **apagar la promesa**.

**Pendiente de decisión — hay una guía POSTERIOR.** El **2025 ACC/AHA/HRS/ISACHD/SCAI Guideline
for the Management of Adults With Congenital Heart Disease** (publicada el **2025-12-18**,
*Circulation* doi:10.1161/CIR.0000000000001402 · *JACC* doi:10.1016/j.jacc.2025.09.006) **mueve el
criterio de VTDVD a VTSVD**: usa **VTSVDi >80 ml/m²** y el **cociente de volúmenes VD/VI** como
criterios primarios, y **abandona el INDICATOR score**. No se implementó: **el texto completo de
la recomendación, su clase y el valor del cociente están detrás de paywall** y no se aplica un
umbral clínico sobre una paráfrasis de buscador — es la misma regla por la que se pidió la Tabla
62 antes de tocar Marfan. Consecuencia concreta de la diferencia: un paciente con **VTDVDi 170 y
VTSVDi 70** tiene criterio por ESC 2020 y **no** por ACC/AHA 2025. Los dos campos ya se recogen,
así que migrar es cambiar qué vota, no recolectar de nuevo.

### Fontan: las complicaciones tienen TRES estados, no dos
Sección implementada el 2026-09-15 (antes era un acordeón vacío). Lo que la separa de las otras
once no son los campos sino la regla de las complicaciones: **«ninguna casilla marcada» NO es
«sin complicaciones», es «nadie las interrogó»**. Para afirmar la ausencia hay que marcar «Sin
complicaciones» explícitamente, y por eso esa casilla existe y es **excluyente** con las cinco
restantes. Sin esa distinción, el informe de un paciente al que nadie le preguntó por enteropatía
diría «sin complicaciones»: una afirmación tranquilizadora sobre cero evaluación, firmada.

**La exclusión se impone en el borde (`fontanToggleComp`) Y se resuelve en la evaluación.** El
borde no alcanza: un import de Excel escribe las seis casillas sin pasar por ahí. Ante la
contradicción —«sin complicaciones» marcada Y alguna otra también— manda **lo que SÍ está
consignado**: afirmar la ausencia sobre una contradicción es el lado peligroso.

**El riesgo de embarazo sólo se declara cuando SE SABE si hay complicaciones.** Con complicaciones
es clase IV de la OMS (contraindicado) y sin ellas clase III; pero **sin interrogarlas no es
ninguna de las dos**. Publicar «clase III — 19-27 % de eventos» sobre un paciente al que nadie le
preguntó es exactamente la afirmación que el párrafo de arriba evita. Y al EN SUMA sube **sólo la
clase IV**: la III es una condición de seguimiento, y meterla en el resumen la hace leer como si
fuera una contraindicación.

**Tres bandas de plausibilidad, no una** (FEVI 10-85, FAC 10-80, saturación 40-100). Fuera de
banda el valor se declara y **no vota** — la regla de Eisenmenger.

**Campos:** `fontan_tipo`, `fontan_fenestracion`, `fontan_vs_morfologia`, `fontan_vs_fevi`,
`fontan_vs_fac`, `fontan_saturacion`, `fontan_it_grado`, `fontan_derrame_pleural`,
`fontan_ascitis`, `fontan_clase_nyha`, `fontan_arritmia`, las seis casillas `fontan_comp_*`
(`ninguna`, `epp`, `bronq`, `fald`, `trombo`, `otra`) y `fontan_incluir_chk`. Con sus **17
columnas de Excel** — las seis complicaciones van como columnas BINARIAS y no como una lista
separada por comas, para que se puedan reimportar y filtrar.

### «No cargan en Safari» era el Excel, y el navegador no tenía nada que ver
Reportado el 2026-09-15 como «Marfan, Eisenmenger y Fontan no cargan en Safari». **En Chrome no
había una sola excepción, las quince secciones renderizaban con sus campos, y el sitio desplegado
era byte por byte idéntico al local.** Safari 26.6 soporta todo lo que usa el archivo (se grepeó
lookbehind, `Object.hasOwn`, `??=`, `at()`, `structuredClone`: lo único anterior a Safari 16.4 es
código viejo y compartido por toda la app). Abierta en Safari, la app carga.

Lo que sí estaba roto, y afectaba **exactamente a esas tres secciones**: sus **dieciocho columnas
de Excel declaradas `vocab` no tenían NINGUNA entrada en `LAB_XLS_VOCAB`**. `_labXlsVocab`
devuelve `null` y el importador **descarta la FILA ENTERA** —nombre, cédula, FEVI, informe—, así
que un estudio de esas tres secciones **no vuelve nunca de su propio Excel**. Eso es lo que «no
carga»: no la pantalla, la reimportación.

Y la ayuda de la plantilla estaba **escrita a mano** en `LAB_XLS_OPCIONES`, así que el archivo
**enseñaba el formato que el importador rechazaba**: el médico leía «Túnel lateral · …», lo
tipeaba, y perdía el estudio completo. El propio archivo ya lo decía dos líneas arriba de donde
se escribió —«se derivan del vocabulario, no se escriben a mano, para que un ejemplo no pueda
enseñar un valor que el importador rechaza»— y `_labXlsAssertVocab()` lo gritaba en la consola
**desde el arranque, durante tres commits seguidos**.

**El diagnóstico correcto salió de mirar la consola, no el código.** Las dos primeras hipótesis
—que Safari no llegara a las pestañas en ventana angosta, y que `congenitas2` quedara oculto por
`eeModOn`— eran falsas y se descartaron **midiendo**: el desplegable «Sección avanzada» de móvil
lista las diez especiales, y `eeModOn` falla ABIERTO (`m[k] !== false`).

Cuatro reglas que quedan:
1. **Al agregar una columna `vocab`, la entrada va en `LAB_XLS_ETIQ` + `LAB_XLS_VOCAB`, nunca en
   `LAB_XLS_OPCIONES`.** El bucle de propagación **sólo AMPLÍA vocabularios que ya existen**
   (`if (!voc) return;`), así que hay que **sembrar** `LAB_XLS_VOCAB.<campo>`; el de
   `LAB_XLS_OPCIONES` sí crea la entrada, pero **respeta la que esté escrita a mano** y por eso
   una ayuda manual gana y miente.
2. **Mirar la consola al arrancar la app.** Hay dos asserts de arranque (`_labXlsAssertVocab`,
   `_labXlsAssertBloques`) y un aviso de módulos. Estaban los tres gritando.
3. **El token sale del `<option value>` REAL.** Escribí `no_valorable` y el select dice `no_val`:
   inventado se cae en silencio. Lo cazó TC-119 comparando el select contra el mapa, no la
   lectura — es el `escaso` por `pocas` del FOP otra vez.
4. **Un `MAPA[...][c.campo] || ''` inline en `_labExcelRow` es una copia más.** Las dieciocho
   pasaron a `_labXlsEtiq(campo, valor)`: exportador e importador leen la misma tabla.

**TC-119** fija las tres puntas: cero columnas sin vocabulario, que lo que la app **exporta** el
importador lo acepte y resuelva al mismo token, y que la ayuda no ofrezca nada que rechace.

### `congenitas2` era medio módulo
El botón de 🫀 CC estructurales tenía `data-mod="congenitas2"`, clave que **no existe en
`EE_MODULES`**. Como `cfgRenderModulos` sólo dibuja las claves de esa lista, la pestaña **no
tenía casilla en Config**: no se podía apagar, y destildar «🧬 Congénitas» escondía la primera
pestaña y dejaba la segunda. Medio módulo, con Marfan de un lado y Eisenmenger/Fontan del otro.
Pasó a `data-mod="congenitas"`: son **un** módulo partido en dos por largo, no dos. Lo gritaba el
arranque de la app.

### Un panel pintado con `.calc-row` sin id sobrevive a «Nuevo estudio»
El barrido de `limpiarCampos` es `.calc-box .calc-row span[id]:not(.calc-lbl)`: **exige el id**.
Eisenmenger y Fontan pintan sus filas con `<span>` sin id —igual que los dos paneles de
cardio-onco, que ya habían pagado esto—, así que el panel del paciente anterior quedaba en
pantalla con el formulario en blanco: saturación crítica y complicaciones de otra persona.

**Y `limpiarCampos` NO pasa por el embudo de `RECALC_MODULOS`.** Estar en esa lista no alcanza:
hay que nombrar la función **también** al final de `limpiarCampos`. Son las dos columnas, como ya
lo documenta `calcCardioOnco`.

Encontrado el 2026-09-15 revisando el diff de Fontan; **Eisenmenger lo tenía desde el día
anterior** y se cerró en el mismo commit. Lo fijan TC-118 y TC-117, y se verificó por mutación:
sacando cada una de las dos llamadas, el caso que le corresponde se pone en rojo.

**Al agregar una sección con panel: o los `<span>` llevan id, o la función de pintado se nombra
en `limpiarCampos`.**

**Auditadas las doce el 2026-09-15 (TC-120): fugaban TRES, las mismas tres secciones nuevas** —
Marfan, Eisenmenger y Fontan—. Las otras nueve vuelven solas a su estado vacío. Las tres están
nombradas en `limpiarCampos`.

**El caso costó tres pasadas y las tres enseñan algo sobre cómo NO medir esto:**
- Buscar el valor tipeado dentro de la sección con un entero corto —un `5`, un `4`— matchea los
  números de las **tablas de referencia** que viven en la misma sección: cuatro falsos positivos.
- Acotarlo a `.calc-box` dejó **nueve de trece secciones sin medir en silencio**, porque nueve
  pintan en `<k>-concl` y sólo tres en `<k>-resultado`. El caso pasaba sin probar nada.
- El invariante que sí sirve es **«el panel vuelve EXACTAMENTE a su estado vacío»**: no necesita
  valor distinguible y caza cualquier residuo. Y el caso **reporta** la sección que no reacciona
  al dato en vez de saltearla — el denominador se declara, no se supone.

### Un badge de sección tiene UN solo dueño
`eteInclSync` deriva el badge de cada sección desde su `*_incluir_chk`
(`fontan_incluir_chk` → `fontan_badge`) y lo muestra cuando está **integrada**. La primera versión
de `fontanSync` lo escribía además desde `hayDatos`, o sea **dos escritores con dos significados**,
y ganaba el que corriera último: retirar la sección la apagaba y el tecleo siguiente la volvía a
encender. Se quitó de `fontanSync`. **Eisenmenger conserva el escritor duplicado** (`eisenSync`,
la línea del `eisen_badge`) — es cosmético y quedó declarado, no corregido.

### Marfan / EHAT: el umbral quirúrgico sale del SÍNDROME, no del diámetro (ESC 2024, Tabla 62)
Sección implementada el 2026-09-15 (antes era un acordeón vacío). **Loeys-Dietz opera a los 45 mm
donde el Marfan espera a 50 y la EHAT no sindrómica a 55.** Aplicar el umbral del Marfan a un
Loeys-Dietz son 5 mm de más sobre una aorta que diseca antes.

Por eso **sin síndrome declarado NO se concluye**: no es un dato que falte para completar la
ficha, es el que ELIGE el umbral. Con 47 mm, un Loeys-Dietz tiene indicación Clase I y una EHAT no
tiene ninguna. Y ese estado **sube al EN SUMA**, porque no es «sin hallazgo» sino «no se puede
concluir» — dejarlo sólo en el cuerpo lo vuelve invisible.

**Turner va indexado** (`marfan_ita`, índice de tamaño aórtico) y no por diámetro absoluto: la
talla baja hace que un diámetro normal sea patológico. Sin el índice tampoco se concluye, aunque
haya un diámetro cargado. Y lleva **DOS cortes distintos**, no uno con dos ramas:

| ASI | Con factores de riesgo | Sin factores |
|---|---|---|
| **>23 mm/m²** | **Clase IIa** | sin indicación |
| **>25 mm/m²** | Clase IIa | **Clase IIb** |

La primera versión usaba 25 para las dos ramas, así que una Turner con **ASI 24 y antecedente
familiar de disección** salía «sin criterios» — el escenario exacto en que el umbral bajo existe.
Entre 23 y 25 sin factores el texto nombra el umbral que se cruza con ellos: es lo que decide el
intervalo del próximo control.

**El diámetro que decide es el MAYOR de seno y ascendente.** Mirar sólo el seno deja fuera el
fenotipo tubular, que es el que tiene la dilatación en la ascendente.

**Campos:** `marfan_sindrome`, `marfan_ao_seno`, `marfan_ao_ascendente`, `marfan_ita` (sólo Turner),
`marfan_factores_riesgo`, `marfan_incluir_chk`. Con sus cinco columnas de Excel.

**Umbrales confirmados contra la Tabla 62 de la ESC/EACTS 2024 por Maicol (2026-09-15)** — la
misma guía que ya usaba `vabConclusion`, así que **la aortopatía de la app quedó con UNA sola
referencia**. Los factores de riesgo son los de esa tabla: HTA no controlada, historia familiar de
disección, **progresión >5 mm/año** (no >3), deseo de embarazo y necesidad de reemplazo valvular
aórtico.

**CoAo conserva ESC 2020 a propósito**: la coartación se indica por la guía de cardiopatías
congénitas del adulto, no por la de aorta. Dos años distintos en la app no son una inconsistencia
si cada uno es el correcto para su entidad — lo que no puede pasar es que **la misma** entidad se
clasifique con dos.

### Ante dos guías: la más reciente y la más estricta. Nunca retroceder en seguridad clínica
Regla permanente de este proyecto (Maicol, 2026-09-15):

1. **La más reciente.**
2. **La más estricta.**
3. **Nunca retroceder** en seguridad clínica.
4. **Documentar qué guía y qué año** — en el texto del informe, no sólo en el comentario: quien
   lee el PDF meses después necesita saber con qué regla se clasificó.
5. **Si difieren, gana la más protectora para el paciente.**

Importa porque un pedido puede citar una guía **anterior** a la que el código ya implementa, sin
que quien lo escribe lo sepa. Aplicarlo al pie de la letra baja el estándar de un documento que se
firma y se entrega.

Los dos casos del mismo día, uno en cada dirección:
- **VAB, aortopatía.** El pedido traía ESC 2020 y `vabConclusion` ya tenía **ESC 2024**, más
  estricta donde difieren (cirugía concomitante desde **45 mm**, no 50). Aplicarlo habría
  **desindicado** el reemplazo aórtico en aortas de 45-49 mm de pacientes que ya iban a quirófano.
  → **No se aplicó**, y se reportó la tabla comparativa.
- **CoAo, indicación de intervención.** El código indicaba con el gradiente **Doppler** cuando la
  ESC 2020 indica sobre el **pico-pico invasivo**. Lo que estaba era *menos* protector —una
  coartación severa con colaterales salía «seguimiento clínico»—. → **Se corrigió**.

**Antes de aplicar un umbral pedido**, mirar qué guía y qué año implementa el código
(`grep "ESC 20"` sobre la función). Si el pedido es anterior o menos estricto: no aplicarlo,
reportar qué umbrales difieren y **qué paciente concreto queda desprotegido**, y esperar la
decisión. La comparación va con el caso clínico, no sólo con los números: «45 vs 50 mm» no dice
nada; «deja de operarse la aorta de 47 mm del paciente que ya está en quirófano» sí.

### `vab_tipo` usa el Consenso Internacional 2021, no Sievers — y los valores viejos se migran
Desde el 2026-09-15 `vab_tipo` guarda `fused_rl` · `fused_rn` · `fused_ln` · `dos_senos_ll` ·
`dos_senos_ap` · `partial` · `no_clasif` (Michelena et al., JTCVS 2021). Antes guardaba Sievers
(2007), que clasifica por inspección **quirúrgica** y por eso no se puede aplicar a un paciente
sin operar.

**El mapeo vive en `_migrarCamposLegacy`**, no en el mapa de etiquetas:

| Sievers | Consenso 2021 |
|---|---|
| `t0` | `dos_senos_ll` |
| `t1rl` | `fused_rl` |
| `t1rn` | `fused_rn` |
| `t1nl` | `fused_ln` |
| `t2` | `no_clasif` |

`t2` era «unicúspide funcional» y **no tiene equivalente**: es otra entidad, no otro nombre para
la misma. Va a «no clasificable» y no a una fusión inventada.

**Por qué la migración y no dejar las claves viejas en `VAB_TIPO_TXT`:** sin traducir, el estudio
guardado reabre con el select **vacío** —el valor ya no es una opción— y el informe pierde la
morfología **en silencio**: no hay error, sólo un campo en blanco. Y dejándolas además en el mapa
de etiquetas, un estudio migrado y otro sin migrar imprimirían dos nomenclaturas en la misma serie.

**Hay que actualizar TRES superficies más, no sólo el `<select>`:** `VAB_TIPO_TXT` (informe y EN
SUMA), el vocabulario del import de Excel, y las etiquetas del gráfico de distribución del
Laboratorio —ésa es la que se olvida: con las claves viejas, las barras quedan vacías y el panel
dice que ningún estudio tiene tipo consignado.

**Campos nuevos:** `vab_simetria`. **Columnas de Excel agregadas (8):** las tres de CoAo
(`coa_gradiente_picopico`, `coa_estenosis_relativa`, `coa_hta`) y cinco de VAB (tipo, rafe,
simetría, aorta ascendente y cirugía valvular prevista).

**La aortopatía NO se tocó:** `vabConclusion` ya implementa **ESC 2024**, que es posterior a la
ESC 2020, y es más estricta donde difieren (fenotipo raíz ≥50 → Clase I, y concomitante desde
**45** mm y no 50). Bajarla a 2020 habría **desindicado** el reemplazo aórtico en aortas de 45-49
mm de pacientes que ya van a quirófano.

### El número correcto puede estar medido con el método equivocado
`coaConclusion` emitía «indicación de intervención según ESC 2020» cuando el gradiente **Doppler**
pasaba 20 mmHg. El umbral es el de la guía; el método, no. La ESC 2020 indica sobre el
**pico-pico invasivo**, y el Doppler en coartación **se subestima con colaterales extensas** —el
paciente que más las tiene es el más grave— y **se sobreestima post-stent**. Fallaba en las dos
direcciones, y la primera es la peligrosa: una coartación severa con colaterales salía «sin
gradiente significativo — seguimiento clínico» en un informe firmado.

Corregido el 2026-09-15. El Doppler **no se borró**: sigue describiendo la lesión y sigue mandando
a completar estudio. Lo que perdió es la potestad de indicar una intervención.

Dos decisiones del algoritmo que no estaban en el pedido y conviene no revertir:
- **Sin HTA consignada no se concluye.** Con el pico-pico ≥20 y `coa_hta` vacío falta la mitad
  del criterio Clase I: se pide el dato en vez de suponer que no la tiene. Suponer «no» degrada
  un Clase I a IIa en silencio.
- **El seguimiento del operado es un párrafo propio, no una coletilla de la conclusión.** Aplica
  aunque no haya indicación: un post-stent sin criterios actuales igual necesita control anual e
  imagen cada 3-5 años. Pegado a la conclusión desaparecía justo cuando ésta dice «sin criterios».

**Campos nuevos:** `coa_gradiente_picopico`, `coa_estenosis_relativa`, `coa_hta`. Y `coa_situacion`
se **extendió** con `post_stent` y `post_cirugia` en vez de crear un campo paralelo — ya existía
con `nativa`/`recoartacion`, y dos campos para el mismo concepto es la duplicación que este
archivo viene pagando.

**Editar por número de línea es cómo se escribe en el módulo de al lado.** El bloque que imprime
el pico-pico se aplicó primero en el de **ductus**: la línea `etePars.push(p.join('. ') + '. ' +
c.txt + '.')` aparece **cuatro veces**, idéntica, una por módulo. Lo cazó TC-113, no la lectura.
Anclar por el comentario de sección, nunca por índice.

### Nunca reconstruir una pestaña desde sus partes: mover, y dejar el resto quieto
Repartir las doce secciones de Congénitas en dos pestañas se hizo **tres veces**. Las dos
primeras extraían cada `.sacc` y **reconstruían** la pestaña concatenando las secciones en el
orden nuevo — y con eso se comieron **dos bloques de código embebido que vivían ENTRE las
secciones**, más los comentarios que los explicaban.

**Los 127 casos pasaban igual.** Lo delató contar los bloques: 55 → 53. Un conteo de una cosa que
nadie mira es lo único que vio el daño.

La versión que quedó **no reconstruye**: reemplaza cada sección **en su posición** por un
marcador, arma el grupo en el primer marcador y vacía los demás. Lo que está entre secciones no se
toca porque nunca se lo levanta.

Dos avisos más de esa mudanza:
- **`sacc-cc-mch` está en columna 0** y las otras once a dos espacios. Un extractor que confía en
  el sangrado se saltea justo ésa. Hay que recorrer profundidad de `<div>`.
- **Escribir la marca de apertura de un bloque de código dentro de un comentario HTML** rompe el
  conteo Y el extractor de sintaxis: los dos lo leen como bloque real. Pasó igual con la marca de
  etiqueta en otro comentario el mismo día. En los comentarios, describir; no transcribir marcado.

**TC-112** cuenta las diecinueve secciones, verifica que cada una esté en su pestaña y —esto es lo
que separa un test útil de uno decorativo— que un **campo característico** de cada una de las doce
originales siga DENTRO de su sección: una sección vaciada pero con su cabecera pasa todo lo demás.

### Un signo invertido en un umbral se lee igual de bien que el correcto
La leyenda de `#ref-cardiotox` decía «SGL normal: más negativo que -18% · **disfunción
subclínica: <-16%**». Leído literal, «menor que -16» es **-20**, que es un strain normal: la
línea describía el deterioro al revés. Sobrevivió porque un `<` y un `>` frente a un número
negativo se leen los dos como plausibles, y porque nadie compara la frase con el criterio.
Lo correcto es lo que dice la tabla del marco HFA-ICOS: **deteriorado = >-16%, menos negativo es
peor**. Al escribir un umbral sobre una magnitud negativa, decir además en qué dirección empeora.

### Tres agendas para el mismo paciente, y ninguna era la de la guía
«Antraciclinas, riesgo alto» tenía tres calendarios de eco en dos pestañas: «basal → 3m → 6m →
anual» (Referencias), «c/ciclo si alto riesgo» (tabla de fármacos) y «cada 2 ciclos» (tabla por
clase). Ninguno estaba marcado como el bueno. Ahora los tres dicen lo mismo y **reparten por
banda**, que es lo que faltaba: alto → cada 2 ciclos, muy alto → cada ciclo, los dos con basal +
al finalizar + 12 meses.

**Un marcador de alto riesgo no es una banda de riesgo.** «Riesgo muy alto HFA-ICOS: FEVI <50%»
confundía las dos cosas: FEVI <50% son 2 puntos, y 2-3 puntos es **alto** — el muy alto empieza
en 4. La distinción decide la frecuencia de control, así que la línea ahora dice las dos cosas:
cuánto vale cada marcador y dónde cae el paciente con uno solo.

### Una tabla de referencia nueva se revisa contra las tablas que YA están, no sólo contra el código
Las dos tablas de cardio-onco que se agregaron el 2026-09-15 traían, en su columna de seguimiento
eco, «Si la FEVI cae >=10 pp o <50%: **suspender**». Los umbrales coinciden con
`CO_UMBRAL_FEVI_CAIDA` / `CO_UMBRAL_FEVI_ABS`, así que contra el código no chirriaban. Lo que
contradecían era **la tabla de grados de la misma sección plegable, 91 líneas más arriba**, que
ese mismo día había quedado diciendo que una FEVI de 48 con caída de 14 pp es CTRCD **moderada**
→ «Continuar con cardioprotección». Y el caso peor no necesita caída ninguna: una FEVI estable de
46 satisface «<50%» y salía mandando suspender la quimioterapia.

Es el defecto de `7357c29` reintroducido **el mismo día**, movido de columna. Lo encontró el
`/differential-review` del agregado, no la lectura.

Tres reglas que quedan:
1. **Un umbral correcto con una conducta pegada puede seguir siendo un error.** Verificar el
   número no alcanza: hay que verificar qué se hace con él, y contra qué dice el resto.
2. **Una tabla que describe conducta remite al clasificador, no lo duplica.** Las dos filas ahora
   dicen «graduar la CTRCD con la primera tabla de esta sección, que es la que define la
   conducta».
3. **Un aviso que concilia dos escalas tiene que ser exacto o no sirve.** El primero decía
   «cuenta factores» y omitía que la tabla también resuelve por fármaco —con doxorrubicina
   250 mg/m² y nada más cargado da «Muy alto» mientras la calculadora dice «MODERADO (2 pts)»—, y
   prometía «manda esta tabla» cuando **al PDF firmado baja el score de la calculadora**. Un aviso
   que promete lo que el artefacto no hace es peor que no tener aviso.

### Un test de restauracion que limpia a mano no prueba la limpieza
Los doce primeros casos de guardado pasaban por «Nuevo estudio» antes de reabrir. Parecia
correcto —es lo que hace el medico— pero significaba que **ninguno dependia de la limpieza que
`cargarEstudioPorId` hace por dentro**: al sacarle el `limpiarCampos(true)` a index.html, el
suite entero seguia en verde. Justo la fuga mas cara de esta app, con doce casos escritos para
cubrirla, y cubierta por ninguno.

El escenario que si la necesita es el que la propia funcion documenta: un estudio con `campos`
**ralo** —los importados de Excel y de DICOM construyen el objeto desde cero y traen unas pocas
decenas de claves— abierto **encima** de un paciente cargado. El bucle de restauracion solo pisa
las claves que el estudio TRAE. Eso es TC-GR-14, y se escribe metiendo el estudio ralo directo en
el store, que es lo que hace un importador.

Lo mismo con `RECALC_MODULOS`: quitarlo tampoco ponia nada en rojo, porque lo que repinta son
**capsulas y botones**, y los casos miraban el informe (que `generarInforme` recalcula solo) y
los textarea. Se cierra mirando lo que esa lista es la unica en tocar: el texto del boton
«✓ Integrado al informe» (`eteInclSync`) y la capsula del TEER (`calcTEER`).

**La regla:** un caso de restauracion tiene que depender de la restauracion. Si el caso deja el
formulario limpio por su cuenta, esta probando el guardado, no el viaje. Y la unica forma de
saberlo es **romper la funcion en una copia y ver si algo se pone en rojo**.

### Capturar el valor, no la referencia
En un caso que abre DOS estudios, `const badge = document.getElementById(...)` y despues
`badge.hidden` en la lista de condiciones lee el estado del SEGUNDO estudio: las condiciones se
evaluan al final, no donde estan escritas. El texto del boton no tenia el problema porque
`.textContent` devuelve una cadena. Capturar el valor en el momento en que se quiere observar.

### El cero se rechaza donde no puede ser una medición, no «en los criterios de techo»
Los criterios de techo del TEER (`v <= X`) fallan ABIERTOS con el cero: «0mm ≤15mm ✓» cuenta como
criterio CUMPLIDO en la hoja firmada, y ninguno de esos campos tiene `min`. La tentación es
uniformar —los cinco son de techo, los cinco llevan `> 0`— y **es la regla equivocada**.

Llevan guarda **cuatro**: gap, profundidad de coaptación, PASP y DTSVI. No hay PASP de cero ni
DTSVI de cero; y una coaptación o un tenting de 0 describen un hallazgo **patológico**, así que
contarlos como cumplidos es el error en la dirección peligrosa.

**La anchura de flail es la excepción, decidida por Maicol (2026-09-15):** 0 mm es «no hay flail»
—el prolapso sin flail de todos los días— y satisface genuinamente el «≤15 mm». Es anatomía
**favorable**, no un dato que falta. Con la guarda puesta el estudio pasaba de «✅ APTO» a
«⚠️ Posiblemente apto — completar datos faltantes: Anchura de flail», mandando al médico a buscar
una medición que ya había hecho. Lo que se pierde a cambio: un 0 tipeado por error cuenta como
cumplido. Se acepta porque es indistinguible del medido y el caso frecuente es el medido.

La regla, entonces, es **campo por campo: ¿este cero puede ser una medición?** No «¿es un techo?».

**Y la decisión tiene que estar en las DOS superficies.** `teerEstado` decide el informe firmado y
`TEER_CRIT` el PDF de auditoría del Laboratorio. TC-98 lo verifica **leyendo el fuente** —única
verificación textual del suite— porque `TEER_CRIT` es un `const` local dentro de `labEteRender` y
no se alcanza desde el harness. Se agregó porque la mutación lo pidió: al sacar la guarda de c5
probé revertirla **sólo** del lado del Laboratorio y el suite siguió en **verde**. Para un
invariante que es «dos listas tienen que coincidir», mirar el texto es exactamente lo que
corresponde; por eso no se generaliza a nada más.

### Si la reimpresión empieza a BORRAR un global, hay que reponerlo — «no escribir» no alcanzaba
`_pdfDeInformeGuardadoArmar` respalda y repone todo estado global que toca: `imgSlots`,
`_imgEditado`, `esqSevManual`, `chkEstado`, `dataset.tocado`, `_MARCAS_DERIV`, `_infBase`,
`_sumaBase`, `amiloSnapshot`. Al arreglar el agujero de la reimpresión (2026-09-15) esa función
pasó a **borrar** `_amiloUltimo`, que antes sólo se abstenía de escribir — y `_amiloUltimo` no
estaba en la lista, porque hasta ese día no había nada que reponer.

Consecuencia, encontrada por el `/differential-review` del propio arreglo: el médico reimprime
cualquier guardado —o exporta el PPT, que pasa por el mismo camino— y **el estudio que tiene en
pantalla pierde el refresco automático de sus ocho módulos por el resto de la sesión**. Carga el
trombo de la orejuela después de haber integrado el TEER y la pantalla dice «CONTRAINDICADO»
mientras la hoja del PDF sigue diciendo «APTO»: exactamente el defecto que `amiloRefrescarSiIntacto`
existe para cerrar. Y no se recupera desde la interfaz — con la marca borrada, «Retirar» +
«Integrar» tampoco regenera; sólo «Nuevo estudio».

Dos reglas: **(1)** un arreglo que cambia «no tocar» por «borrar» convierte un global en estado
que hay que respaldar, aunque la línea que se editó esté a 800 líneas del backup. **(2)** al
reponerlo, **reemplazar el contenido, no la referencia** (`for…in` + `Object.assign`): es un
`var` de nivel superior que otros bloques leen por su nombre, y reasignarlo los deja mirando el
objeto viejo. Sin cobertura automática: probarlo exige generar un PDF real y esperar el
`setTimeout` de la restauración.

### Convertir decoración en decisor cambia lo que significan sus insumos
Al meter `c7`/`c8` en el `veto` del TEER, tres cosas que eran inocuas mientras esos criterios
sólo se pintaban se volvieron defectos **el mismo commit**, y ninguna está en el diff de la línea
que se cambió:
- **El espejo congelado.** `teer_fevi`/`teer_dtsvi` se copiaban con `_syncSiVacio` —escribe una
  vez, no refresca—, así que corregir la FEVI en su propia tab dejaba al criterio evaluándose
  contra el valor viejo. Pasaron a `_syncDerivado`, que es lo que `teer_pasp` ya hacía dos líneas
  más abajo *por este mismo motivo*.
- **El cero.** `dtsvi <= 70` es un criterio de **techo**: falla abierto con el 0. Un `dsfvi`
  tipeado 0 imprimía «0mm ≤70mm ✓» y podía dejar `noIngresados` en cero y publicar «APTO».
- **La compuerta.** `hayDatos` contaba los criterios evaluados, y como esos dos se espejan solos,
  el botón «Integrar al informe» se destrababa sobre un módulo en el que nadie entró: el PDF
  firmado se llevaba una hoja TEER entera cuyas únicas filas con dato eran valores auto-copiados.
  Hoy la compuerta cuenta `tipeados` — **vetar y ser evidencia de intención son dos cosas
  distintas**.

Antes de ascender un campo de decorativo a decisorio, preguntarse por sus tres bordes: **de dónde
viene el valor** (¿espejo de una sola vez?), **qué hace con el cero y el vacío**, y **qué
compuertas lo cuentan** para decidir si el módulo «tiene datos». Cubierto por TC-90.

### No traduzcas emoji al sanear para el PDF
`_teerAsciiPDF` mapeaba ✅→«SI» y ❌→«NO». El título «❌ CONTRAINDICADO — trombo en aurícula
izquierda» salía impreso como **«NO CONTRAINDICADO - trombo en aurícula izquierda»**: la negación
de una contraindicación absoluta, en la línea de conclusión de un informe firmado. Los emoji se
**borran**; el texto que queda ya dice qué pasa. Y el saneador colapsa espacios horizontales con
`[^\S\n]+`, no `\s+`, para no aplanar el texto libre del médico — el mismo par
`amiloSanPDF` / `amiloSanPDFml` de siempre, con otro nombre.

### Un `else` mudo manda la basura a la rama más grave
`epGradoPorGmax` era una cascada sin guarda: `null` y `0` se coercionan y caen en «Normal», y
`NaN`, `undefined` o una cadena hacen fallar las tres comparaciones y salen por el `return`
final, o sea **«Estenosis severa»**. Y estaba exportada en `window`. Las funciones que clasifican
severidad devuelven `null` para lo que no es un número, y el llamador decide qué hacer con eso.

### Un predicado `hayDatos` que en realidad pregunta si APLICA
El slot `hayDatos` de `amiloSecs` falla **abierto** por diseño (`catch → _ok = true`), y está
bien para la pregunta que dice contestar: impedirle al médico integrar algo que sí cargó es peor
que el defecto que cierra. El módulo `hfpeff` lo reusa para otra pregunta —«¿este score aplica a
este paciente?»— cuya dirección de falla es la **opuesta**. Hoy queda cubierto porque
`amiloTextoHFAPEFF` reevalúa la compuerta por su cuenta y devuelve `''`, pero eso es suerte de la
doble evaluación, no diseño. Si hace falta una tercera compuerta clínica, va en una propiedad
propia con `catch → false`.

### Editar la redacción no es consentir que cambie la premisa
`amiloRefrescarSiIntacto` sale temprano si el médico tocó «✏️ Editar», y eso convertía un clic en
un permiso permanente: se integraba el HFA-PEFF con la FEVI vacía, se corregía una coma, después
se cargaba FEVI 28, y la hoja del PDF seguía diciendo «HFpEF confirmado» mientras la pantalla
decía «score no aplicable». Cuando cambia la **premisa clínica** —no el dato, la premisa— el
módulo se retira aunque el texto esté editado, con toast, porque ahí sí se pierde algo escrito.

### Una lista cableada a mano al lado de una lista de datos
`AO_SEGS` es la fuente de los segmentos aórticos… pero las DOS tablas del PDF enumeraban los
tres clásicos a mano. Al agregar el cayado y la aorta descendente, el informe firmado quedó
diciendo «el cayado aórtico se encuentra moderadamente dilatado» en el narrativo mientras la
celda rotulada «Aorta torácica» resumía `Valsalva 34 · Sinotub. 30 · Ao asc 36` **sin
asterisco**, que en una celda sin referencias se lee como afirmación de normalidad. Es el mismo
defecto que el narrativo ya había cerrado para `ao_tub`, reabierto desde la tabla, y otra vez
del lado de callar el hallazgo. Las dos tablas derivan de `AO_SEGS` desde 2026-09-14.

Antes de agregar un elemento a una lista de datos, `grep` de sus claves para encontrar las
superficies que las enumeran a mano. Acá el problema **no** era que algo iterara `AO_SEGS`
asumiendo tres: era que nadie la iteraba.

### Gatear un criterio por tipo de caso puede sacarlo del veredicto
Al mostrar en el TEER sólo los campos del tipo de IM, metí las longitudes de velo en el bloque
de IM primaria. Eso las sacó del `veto` en la IM secundaria — y `teer_lva` se puebla **solo**,
espejado desde la sección ETE. Con `ete_lva = 12`, el criterio cuyo texto de fallo dice
literalmente «NO apto» dejaba de contar, el valor quedaba oculto en pantalla y la hoja firmada
pasaba de «❌ NO apto» a «✅ APTO para TEER — criterios cumplidos».

Dos reglas que salieron de ahí:
- **Ocultar un campo y seguir contándolo, o dejar de contarlo sin decirlo, son las dos caras del
  mismo error.** La visibilidad tiene que seguir al criterio, no al revés.
- **Un criterio que NO APLICA no es un criterio que FALTA.** La primera versión dejaba los ocho
  fijos en `noIngresados`, así que consignar el tipo de IM convertía un estudio completo en
  «Posiblemente apto — completar datos faltantes».

### La copia del Laboratorio también hay que migrarla
`TEER_CRIT` (panel ETE del Lab) es una **segunda implementación** de los criterios de
`teerEstado()`. Al gatear la de pantalla por tipo de IM y no la del Lab, **todo** estudio con el
tipo consignado salía distinto en las dos superficies: «✅ APTO» en el informe firmado y
«⚠️ Posiblemente apto — faltan datos» en el PDF de auditoría. Mientras sigan siendo dos, tienen
que gatear igual — y la de `teerEstado` es la que manda.

**Y hay que migrarla EN EL MISMO COMMIT.** Al agregar `c7`/`c8` al `veto` (2026-09-15), el
comentario de `TEER_CRIT` decía textualmente que FEVI y DTSVI quedaban fuera **porque
`calcTEER` los dejaba fuera**: arreglar sólo la pantalla habría dejado el informe firmado
diciendo «❌ NO apto» y el PDF de auditoría «✅ Elegible» sobre el mismo estudio. Un comentario
que explica una exclusión por referencia a otra función es una **dependencia**, no una nota.
Entraron los dos con un `tipo:'coapt'` nuevo en `_teerAplica`. Ojo con el efecto colateral: el
predicado `usaTeer` también recorre `TEER_CRIT`, y como esos dos campos se espejan solos, había
que excluirlos de la compuerta o el denominador del panel crecía con cualquier transtorácico que
tuviera la FEVI medida.

### Fuera de rango también tiene que bloquear la cápsula
El VD ganó `min`/`max` como la aorta, pero la primera versión sólo lo aplicó al informe: un
longitudinal tipeado en centímetros (9,5 por 95) daba «Verificar la medición» en el informe y
«Normal (longitudinal 9.5 mm)» en la cápsula, al mismo tiempo. Un valor ilegible bloquea la
NEGACIÓN en **todas** las superficies, no sólo en la firmada.

### Borrar una frase del informe puede romper un conteo del Laboratorio
`_LAB_HALLAZGOS` clasifica **por texto** sobre `en_suma + informe_texto`. La fila «HTP» matcheaba
`/hipertensión pulmonar|HTP/`, y en un ETT corriente con PSAP alta, TAP ≥ 105 ms y el módulo
ESC/ERS sin integrar, la **única** ocurrencia de esas palabras en todo el informe era la salvedad
«la PSAP estimada no clasifica la HTP por sí sola». Al sacarla (2026-09-14, pedido de Maicol) esos
estudios dejaron de contar: como `_labHallazgosCuenta` filtra `n > 0`, la fila HTP **desaparecía
entera** del dashboard y de la sección 3 del PDF de auditoría, mientras en el MISMO documento
«Distribución de PSAP estimada» seguía mostrando los casos > 35 mmHg.

Antes de borrar o reescribir una frase del informe, `grep` de sus palabras sobre los patrones del
Laboratorio (`_LAB_HALLAZGOS`, `_labMenciona`, los filtros de cohorte, `_algunaMencion`). Hoy la
fila HTP va por `byField` con el NÚMERO primero y el texto como segunda vía, que es lo que el
filtro de cohorte ya hacía.

### Una escala de cuatro bandas en la columna `ref` es una graduación
La fila PSAP de las tablas del PDF traía `ref: '<35 / 35–50 / 50–70 / >70 mmHg'`. Esa columna es
la de **umbrales de severidad** —lo dice el comentario de `drawTablaCompacta`—, así que cuatro
bandas al lado del valor son una clasificación de HTP en todo menos en el nombre, justo lo que la
app se cuida de no hacer en las otras cinco superficies («rango, no grado de HTP»). Se sostenía
por el contrapeso de la salvedad del narrativo; al salir ésa, la tabla quedaba como la única
lectura y la más afirmativa. Hoy lleva un solo corte de normalidad.

### Un umbral con comentario que lo defiende no se toca de memoria
El piso del criterio menor de NT-proBNP en FA del HFA-PEFF es **375** (Pieske 2019). El 365 no
existe en la guía: es una errata muy repetida en la literatura secundaria. Ya se corrigió en
`2693c48` (2026-08-26), con el argumento escrito arriba de la función, y **volvió a aparecer el
2026-09-14** — lo escribí yo, de memoria, mientras hacía otro cambio, y encima puse un
comentario nuevo que decía «estaba en 375 desde siempre» contradiciendo al que estaba dos líneas
más abajo, sin tocarlo. El `git log -S` tarda diez segundos y lo habría evitado.

Dos reglas:
- **Antes de cambiar un número clínico, `git log -S "<el valor viejo>"`.** Si alguien lo puso a
  propósito, la justificación está en el commit o en el comentario de al lado.
- **Si lo cambiás igual, reescribí el comentario viejo en el MISMO commit.** Un archivo que
  afirma las dos cosas a dos líneas de distancia garantiza que el próximo pase lo vuelva a dar
  vuelta, y el que lea primero el de arriba va a creer que el código está mal.

Lo que estaba en juego: FA con NT-proBNP entre 365 y 375 —diez pg/ml— donde el dominio humoral
pasa de 0 a 1 punto, suficiente para mover el total de 4 a 5, o sea de «probabilidad intermedia»
a «HFpEF confirmado» en un informe firmado.

### Una vista previa promete, y si el PDF no cumple es peor que no tenerla
El bloque «Descripción para el informe» del post-TAVI nació gateando con `!disp` **sólo la rama
negativa**, mientras el párrafo del PDF entero vive dentro de `if(hayProtesis)`. Resultado: un
control post-TAVI con la regurgitación medida y el modelo del dispositivo sin consignar —caso
habitual, no siempre se tiene la marca a mano— mostraba «Insuficiencia paravalvular moderada,
extensión 15%» bajo un rótulo que dice «para el informe», y el PDF firmado no imprimía **una
palabra**. El médico lee que el hallazgo viaja, no lo transcribe, y desaparece.

Antes de la vista previa no había falsa garantía: **la regresión la introduce la promesa**. Si
se agrega una, su compuerta tiene que ser **el mismo predicado** que la del emisor, no uno por
rama — y cuando no se cumple, decirlo («falta consignar la prótesis: nada de este bloque sale en
el informe»), no mostrar un guion.

### Negar exige evidencia de haber buscado
`taviRpvNarrativa()` salió con «Sin insuficiencia paravalvular significativa» para el caso «sin
horas marcadas y sin ningún parámetro» — que es exactamente el estado de *nadie la evaluó*.
Tildar «Integrar al informe» y elegir el tipo de prótesis alcanzaba para que el informe firmado
negara la regurgitación. Y podía salir **a un punto de distancia** de «Flujo reverso diastólico
en aorta descendente holodiastólico», que se imprime aparte y es signo de regurgitación al menos
moderada: el mismo párrafo negando y describiendo el hallazgo.

Hoy la negación necesita una de dos evidencias explícitas: un parámetro **medido en cero**
(`rpv.nula`) o el flujo reverso consignado como **ausente**. Sin eso, `null` y el párrafo se
calla. Mismo criterio que los tres selects del TEER: el default no puede ser la respuesta
tranquilizadora.

De paso: un cero medido tampoco es un hallazgo trivial. `ext_circ = 0` caía en la lista `triv`
de `eteTaviRPV` y, con ese único parámetro, la cascada salía por el `return` final con **«Leve»**
— el informe imprimía «Insuficiencia paravalvular leve, extensión circunferencial 0%», el grado
contradiciendo al número que lo sostiene dentro del mismo paréntesis.

### `input[type=hidden]` NO entra en el barrido de `limpiarCampos`
El barrido toma `input[type=text], input[type=number]`. Cada oculto hay que limpiarlo **a mano**,
y los dos que hay son datos del paciente: `ete_tavi_jet_horas` (horas del jet paravalvular) y
`co_serie_json` (serie de seguimiento de Cardio-Oncología congelada en el estudio). Medido con la
segunda: sin la línea explícita, los tres controles del paciente A sobrevivían a «Nuevo estudio»
y quedaban dentro del estudio del paciente B — guardados en `campos` e impresos en su hoja. Es la
misma fuga que este archivo ya pagó con los segmentos del ETE.

### Una hoja que se agrega con `addPage()` va DESPUÉS de `_pagCuerpo`
`generarPDFReal` cuenta `_pagCuerpo` y después hace `if (_AJ.medir) return`. Todo lo que se
dibuje **antes** de esa línea cuenta como CUERPO, y `_pdfAjustarA4` intenta comprimirlo a una
hoja. La hoja de Cardio-Oncología nació del lado equivocado: `pagCuerpo <= 1` no se alcanzaba
nunca, se gastaban cinco generaciones de medición —cada una renderizando el canvas— para volver
al paso 0, el cuerpo dejaba de comprimirse, y saltaba el toast de «informe muy extenso» en todo
estudio de cardio-oncología. ETT Avanzado, ETE e imágenes ya viven del lado correcto; el
comentario de `_pagCuerpo` lo dice y hay que leerlo antes de agregar una hoja.

### `doc.text` no envuelve, y `maxWidth` no avanza `y`
Dos caras del mismo descuido, las dos pagadas en la hoja de Cardio-Oncología:
- **Sin `splitTextToSize`**, jsPDF sigue escribiendo hacia la derecha y el visor recorta en el
  borde del papel, en silencio. La clasificación de toxicidad medía 157 mm sobre los 104
  disponibles y perdía `otoxicidad SEVERA (ESC 2022)` — o sea el GRADO, lo único que decide
  suspender o continuar la quimioterapia. La salvedad del score perdía la cita de la guía, que
  es justo la cláusula que existe para que no se lea como HFA-ICOS validado.
- **Con `maxWidth`**, el texto sí se parte, pero el llamador avanza `y` como si fuera una línea
  y lo siguiente se dibuja encima. Ya estaba escrito en Wilkins y en GTP.
Y si una tabla puede saltar de página, el encabezado de columnas **se repite**: cuatro columnas
numéricas sin rótulo, donde FEVI, su delta, GLS y su delta se ven todos igual, no son una tabla.

### Una columna «vocab» sin vocabulario rechaza la FILA ENTERA al reimportar
Declarar una columna como `'vocab'` en `LAB_XLS_MAP` y olvidarse de `LAB_XLS_VOCAB` no falla al
exportar ni al ver la plantilla: falla al **reimportar**, y descarta el estudio completo —nombre,
CI, FEVI, informe, todo—, no la celda. El bucle que propaga etiquetas sólo **amplía** vocabularios
existentes; el de `LAB_XLS_OPCIONES` sí **crea** la entrada desde `LAB_XLS_ETIQ`, así que el
mensaje que ve el médico queda en el peor estado posible:

> «Lóbulos orejuela»: "2 lóbulos" no es un valor válido (1 lóbulo · 2 lóbulos · 3 o más lóbulos)

le dice que su valor no sirve y se lo lista como válido en la misma línea. Y la plantilla saca su
ayuda de `LAB_XLS_OPCIONES`, o sea que **enseña el formato que el importador rechaza**.

Pasó con `oai_lobulos` el 2026-09-15 y no lo veía nada: el bloque resolvía bien,
`_labXlsAssertBloques()` daba cero, la plantilla se veía correcta. Desde entonces hay
**`_labXlsAssertVocab()`**, que corre al arrancar y lista las columnas `'vocab'` sin vocabulario.
Si agregás una columna de vocabulario, mirá la consola.

### Si el valor lo pusiste vos, no probaste nada
Al cerrar la fuga del centro en reimpresión (2026-09-14) monté la prueba escribiendo
`med-centro.textContent = 'CENTRO AL FIRMAR'` desde la consola, vi la fuga, la arreglé, vi que
se cerraba, y hasta corrí un control negativo contra HEAD que la reprodujo. Todo verde. Sólo que
**el médico no puede escribir ahí**: el `<div>` que contiene el span está `hidden` y la clave que
lo puebla no la escribe nadie. Había verificado el mecanismo y no la *alcanzabilidad*, así que
casi agrego 60 líneas —persistir el span en `campos`, reponerlo en la reimpresión, una bandera
nueva— para conservar un dato que nunca existe. Es el mismo error de denominador de siempre, con
otra cara: antes era medir sobre un contenedor vacío; acá fue poblar yo la entrada.
Antes de arreglar un campo, preguntar **quién lo escribe en la app real** — `grep` de la clave y
mirar si su contenedor es visible. Si la respuesta es «nadie», el arreglo es otro.


### `amiloSanPDF` borra los `\n`
Su catch-all es `[^\x20-\xFF]`, o sea que se lleva puesto el salto de línea, y además
termina en `.trim()`. Aplicada de una pasada a `informeTxt` o `sumaTxt` —que son
`inf.join('\n')`— pega todos los párrafos en un bloque corrido. Usar **`amiloSanPDFml`**,
que sanea línea por línea y conserva la sangría.

### `render()` sale temprano
Tiene un `if(!tablExpanded) return;` antes de poblar `tbody`. Un test que mida `#tbody` con
la tabla colapsada da **cero handlers y cero scripts sobre un contenedor vacío**: falso
negativo perfecto. Poner `tablExpanded = true` y mostrar `#tbl-wrap` antes de medir, y
contar las filas para confirmar que hay denominador.

### `renderSeguimientoLista` lee por clave de paciente
No hay ninguna global `coSeguimiento` que sirva para el test: la función arma la clave con
`_coPacienteKey()` a partir del nombre/documento cargado y busca `co_seguimiento[clave]`.
Setear una variable global no ejerce el sink; hay que setear `#nombre`, pedir la clave y
escribir el store indexado por ella.

### `typeof` sobre un `const` en zona muerta **lanza**
No devuelve `'undefined'`. Si una sentencia de nivel superior hace `typeof X` y `X` es un
`const` declarado más abajo, tira `ReferenceError` — y al ser nivel superior se lleva puesto
todo el resto del bloque `<script>`. Como las funciones se hoistean, la app arranca con la
interfaz completa y sin estado, sin más rastro que una traza. Ya pasó con `DCM_RANGO`.
Solución: función perezosa que resuelva en la primera llamada, o mover la declaración.

### Los reemplazos por rango de líneas son peligrosos
Usar **siempre anclas de texto único** y `assert` de que la ancla aparece exactamente una
vez. Un reemplazo por índice borró 106 líneas —`_lsLocal`, `_lsChunks`, `_lsGuardar`,
`_idbGuardar`, `_idbLeer`, `_abrir`: la capa de persistencia entera— y **`node --check` lo
dio por bueno**, porque sólo valida sintaxis y el archivo seguía siendo JS válido. Se
detectó recién en el navegador, con `CeiboStore` dando `undefined`. Después de un cambio
grande, mirar `git diff` y contar las líneas eliminadas.

### `getLocal()` devuelve una copia **superficial** (desde 2026-09-08)
Antes devolvía el array vivo y un `push()` directo esquivaba el saneo de id. Ahora
`getLocal()`/`getChunk()` hacen `.slice()`, así que **mutar el array devuelto no hace nada**.

Lo superficial es deliberado: **los objetos se siguen compartiendo**. Un `.find()` devuelve
el informe real, se puede mutar y se persiste con `setLocal`, que vuelve a pasar por
`_sanearIds`. Una copia profunda rompería eso y además clonaría las imágenes en base64 de
cada estudio en cada llamada.

Lo que se cerró es la mutación del **array** (push/splice/length). Si necesitás cambiar la
lista, andá por `setLocal`/`setChunk`.

### Eco Estrés: `ee*` NO identifica el módulo, y el IIFE no es viable
Se quitó el export explícito de `window.eeIncluirPDF` el 2026-09-08. Eso **no** volvió
inalcanzable la función: una declaración de función en nivel superior de un `<script>`
clásico ya crea la propiedad en `window`, así que `typeof window.eeIncluirPDF` sigue dando
`'function'`. El export era redundante.

**Envolver "el bloque" en un IIFE no se puede** (analizado 2026-09-08). No hay un bloque:
son **73 declaraciones `ee*` en cinco clusters entre las líneas 7437 y 30207**, con **599
funciones ajenas intercaladas**. Y peor, el prefijo miente: en este archivo `ee` es tanto
*Eco Estrés* como *EcoSmart ETT*. `eeGetMode`, `eeGetModules` y `eeModOn` (cluster
30162-30207) son la **configuración de modo básico/avanzado de la app**, van de la mano de
`cfgSetMode` y alimentan el selector «Sección avanzada»; encerrarlas apagaría esa función.
Un wrap mecánico por prefijo rompe la app.

Lo que **sí** se hizo, y cierra el riesgo real: el gate del PDF exige ahora que el toggle
`ee-incluir-pdf` **exista en el DOM**, además de la bandera. Como la interfaz se retiró, la
condición no puede dar verdadero, y vuelve sola el día que se restaure la UI —sin dejar un
booleano que alguien tenga que acordarse de invertir—. Verificado forzando
`ecoestres_incluir_pdf='1'` y generando el PDF: la sección no sale.

El riesgo que esto cerraba era concreto: llamar `eeIncluirPDF()` a mano ponía la bandera, la
limpieza sólo corre al arrancar, y el PDF podía estampar una sección «ECO ESTRÉS» con los 17
segmentos en NORMAL sobre un estudio donde no se hizo ninguno. **No re-agregar el export.**

### `badge(cls, txt)` — verificar la allowlist contra el CSS
La lista de clases permitidas tiene que salir de `grep` de las clases `.badge-*` que
realmente existen, no de suponerlas. Una primera versión omitió `orange` y `yellow` —57
llamadas— y las habría pintado de gris: un badge de alerta degradado a uno neutro es una
regresión de señal clínica, no un detalle visual.

### `disabled` no sobrevive a la reimpresión — no lo uses como compuerta de contenido
`.checked` se persiste (`<id>__chk`) y las tres rutas de restauración lo reponen. **`disabled`
no**: no está en el HTML, `guardarInforme` no lo guarda y nadie lo repone. Y lo que lo baja es
un recálculo (`calcEM`) que **no corre en la reimpresión** —ahí los campos se llenan asignando
`.value`, y eso no dispara `oninput`; `calcEM` tampoco está en la lista de recálculos de
`_pdfDeInformeGuardadoArmar`—.

Resultado medido: un `c.checked && !c.disabled` hacía que, después de un «Nuevo estudio»
—que deja `disabled=true`—, reimprimir un informe guardado con la continuidad marcada saliera
**sin** continuidad. Distinto del que se firmó, sin ningún aviso. Gatear por el **dato** (¿hay
valor?), nunca por el estado visual del control. Hay regla Semgrep:
`ceibo-checked-gateado-por-disabled`.

### `__chk` presente ≠ «el médico decidió»
`guardarInforme` barre **todos** los `input[type=checkbox][id]` y escribe la clave siempre, con
`'0'` incluso para un control que nunca se mostró. Inferir una decisión de que la clave exista
hace que, desde el primer guardado, todo estudio la traiga y el comportamiento «auto» muera al
reabrir. Si hace falta distinguir «no» de «no decidió», va **bandera propia** (acá:
`<id>__tocado`), persistida y restaurada aparte.

### Una bandera booleana no puede representar dos decisiones opuestas
`dataset.tocado` empezó significando «el médico decidió» y gobernaba el auto-marcado del
selector de AVm. Como la rama «sin valor» de `_emPdfChk` desmarcaba incondicionalmente, y el
`oninput` de un campo pasa **siempre** por `''` al corregir una medida con backspace, la
bandera protegía el «no» del médico y **destruía su «sí»**: al volver el valor ya no re-marcaba,
y «Sobreescribir» persistía la pérdida como un «no» que nadie había dado. Hoy la rama sin valor
respeta la bandera en los dos sentidos, y el gate real es el número en `emAvmPdfVal`.

Y se separó en **dos** banderas: `tocado` («el médico decidió», es lo único que se persiste) y
`desdeEstudio` («esta carga ya trae respuesta», muere con la sesión). Con una sola, reabrir un
estudio y volver a guardarlo promovía `__tocado` a `'1'` sin intervención de nadie, y la clave
dejaba de significar lo que dice su nombre.

### `('0','0')` es ambiguo: distinguir «dijo que no» de «no había valor»
`guardarInforme` barre **todos** los checkbox y escribe la clave siempre, así que un `__chk='0'`
puede venir de un control que nunca se mostró. Para decidir si respetar ese `'0'` se mira si el
**estudio trae el número** (`avm_cont`, `avm_plan`/`avm_ete`) — dato que ya está persistido, sin
clave nueva. Con valor el `'0'` es una respuesta real; sin valor sólo dice «no había nada que
incluir» y el auto-marcado sigue vivo.

Usar `> 0` y no `!isNaN`: un `"0"` parsea a 0 y daría «hay valor», pero `calcEM` y `emAvmPdfVal`
lo tratan como ausencia por truthiness. Criterios distintos sobre el mismo dato = casilla
congelada sobre un estudio que sí tenía medición.

### Reimprimir y editar+regenerar tienen que dar el mismo PDF
No divergen al cargar —**ninguno de los dos caminos llama `calcEM`**—, sino después: en la
sesión de edición el médico **tiene** que abrir la píldora de estenosis mitral (`limpiarCampos`
oculta los bloques y borra `valv-pill-*`), y ese clic dispara `calcEM`, que es lo único capaz de
mover un `.checked` sin que nadie lo toque. Cualquier estado que gobierne contenido impreso y se
recalcule ahí tiene que estar congelado antes.

Queda **una divergencia intencional**: un estudio anterior al selector (o importado) no trae las
claves, así que al reimprimirlo sale sólo THP y al editarlo corre el auto-marcado. Es correcto
—nunca hubo un PDF firmado con este selector— pero es una decisión, no un descuido.

### Un comentario mío rompió el bloque `<script>` entero
Al insertar texto de comentario justo después de un `*/` quedó fuera del comentario y el bloque 8
—donde vive `CeiboStore`— dejó de parsear: **DOM completo, todo el JS `undefined`**, y la consola
del preview no mostró nada. Es el mismo síntoma que describe la sección del TDZ.
Chequeo que lo detecta, y que hay que correr **comparando contra HEAD** porque los bloques 0 y 1
fallan siempre por el extractor:
```bash
node -e "const s=require('fs').readFileSync('index.html','utf8');
const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0;
while((m=re.exec(s))){try{new Function(m[1]);}catch(e){console.log(i+': '+e.message);}i++;}"
```
Sólo 0 y 1 deben aparecer. Cualquier otro bloque en la lista es código muerto.

### Nunca borrar localStorage sin fusionar
`_lsBorrar()` sólo puede correr **después** de escribir en IndexedDB y **verificar** la copia.
El caso que costó el arreglo:

> Sesión N: migración hecha, IndexedDB con todo, localStorage vacío.
> Sesión N+1: `_abrir()` tarda más de 3 s —disco frío, otra pestaña, perfil privado— y el
> timeout degrada la sesión a localStorage de forma **irreversible**: el guard `listo` descarta
> el `onsuccess` posterior, así que una apertura simplemente lenta arruina la sesión entera. La
> lista de Guardados aparece **vacía**, indistinguible de «no hay estudios». El médico trabaja
> igual y lo que guarda va a localStorage.
> Sesión N+2: IndexedDB abre bien, `enIDB` trae los viejos, y el `if (restos) _lsBorrar()`
> —cuyo comentario decía «sobras de una migración cortada»— **borraba el estudio nuevo**. Sin
> fusionar y sin ningún aviso.

`restos > 0` no distingue una sobra de una escritura nueva y única. Hoy lo resuelve
`_fusionarDesdeLS()`: unión por id, desempate por **`fecha_guardado` más nueva** (empate y
fecha ilegible los gana IndexedDB), y el disco se libera sólo con la copia confirmada. Si la
verificación falla, `fusionPendiente:true` y localStorage queda intacto para el próximo arranque.

**No usar «localStorage siempre gana».** Fue la primera versión de este arreglo y estaba mal por
una premisa falsa: que si hay IndexedDB migrado, lo que esté en localStorage se escribió después.
`_persistir` la desmiente — cuando IndexedDB **rechaza** una escritura cae a
`_lsGuardar(local, chunk)` con `_db` **no nulo**, o sea en sesión normal, y no vuelca el estudio
nuevo sino **la caché entera**. localStorage queda con una foto completa de la base, y nada la
limpia hasta el arranque siguiente. Con esa regla, un fallo transitorio de IndexedDB a las 10:00
hacía que al otro día la fusión pisara los 60 estudios con la versión de las 10:00 — las
ediciones de toda la jornada revertidas, y en silencio, porque el aviso colgaba de `agregados` y
ahí `agregados` vale 0. **Un rollback de la base entera es peor que el bug original.**

Contrapartida asumida: la unión no tiene tombstones, así que un estudio borrado durante una
sesión con respaldo **vuelve a aparecer**. Se eligió ese lado a propósito —resucitar se deshace
borrando otra vez; perder no se deshace— y el aviso lo dice en vez de anunciar sólo «sincronizado».

### `uuid` es la clave estable; `id` es sólo el índice numérico interno
**Todo recurso externo —imágenes, adjuntos futuros— se cuelga del `uuid`, nunca del `id`.**
`id` lo reescribe `_sanearIds` en cada lectura/escritura si es inválido o duplicado, y los
importadores lo reasignan ante colisión: lo indexado por `id` se orfanaría solo, sin que nadie
borre nada. `estudioId` es más estable pero viene `undefined` en los importados de Excel/DICOM
y en los backups viejos.

El `uuid` se genera una vez y **no se modifica nunca**. Las reglas que lo sostienen:

- **`_sanearIds` sólo lo asigna si falta**, jamás lo pisa. Es el borde por el que pasan las
  cinco vías de entrada (JSON, Excel, DICOM, escritura directa, lectura cruda de
  localStorage/IndexedDB); `validarInformeImportado` cubre **una** sola.
- **La migración perezosa hay que PERSISTIRLA.** `_sanearIds` asigna en memoria; si el arranque
  no escribe, el uuid muere con la pestaña y la sesión siguiente genera otro para el mismo
  estudio. En una sesión de sólo consulta —abrir, mirar, colgar imágenes— eso deja los recursos
  huérfanos sin que nadie edite ni borre. Por eso el arranque fuerza una escritura cuando
  `_uuidAsignados > 0`.
- **«Sobreescribir» conserva el uuid del registro existente**, tanto en `guardarInforme` como en
  el import modo «sobre». Es la misma ficha con datos corregidos; tomar el uuid entrante
  desconectaría sus imágenes por la vía más frecuente de todas.
- **El alta por import deduplica el uuid** contra la base y regenera ante colisión. Reimportar
  el mismo backup en modo «todos» dejaría dos fichas con el mismo uuid, que rompe la clave igual
  que si cambiara.
- **`uuid` tiene que estar en `_INF_CAMPOS_PERMITIDOS`.** La validación rechaza el informe
  **entero** ante un campo desconocido, así que sin esa entrada cualquier backup exportado desde
  esta versión sería irrecuperable: el archivo se ve bien y el import dice «formato inválido».

**No es único a nivel global, y no puede serlo:** `_local` y `_chunk` contienen legítimamente la
misma ficha, así que dos registros con el mismo uuid son **una** ficha con dos representaciones.
Cualquier recolector de imágenes huérfanas tiene que deduplicar por uuid antes de decidir, o va
a creer que un recurso quedó sin dueño porque borró una de las dos copias.

`crypto.randomUUID()` exige **contexto seguro**: no existe en `http://192.168.x.x` (la LAN del
sanatorio, que es un modo de uso real), ni en Safari/iOS anterior a 15.4. El fallback baja a
`getRandomValues` —que no está gateada y el archivo ya usa en `_dcmUID`— y sólo como último
escalón a `Math.random`. Los uuid del fallback llevan prefijo `x` para distinguirlos al depurar.

### Las imágenes viven en `CeiboImg`, una base de IndexedDB APARTE
Base `ceibomed_img`, store `imagenes`, clave = `uuid` del estudio. **No** es un object store más
dentro de `ceibomed`, y eso es deliberado: agregar un store ahí exige subir `DB_VER`, y `_abrir()`
resuelve `null` ante `onblocked` — o sea que con **dos pestañas abiertas**, que es lo habitual, el
upgrade se bloquea y la tienda de **estudios** cae a modo respaldo. Una base nueva no versiona la
vieja, y el barrido por clave de `_idbGuardar` no puede alcanzarla ni por error.

Falla cerrado: sin IndexedDB no hay imágenes persistidas y la app funciona como antes. **No hay
respaldo a localStorage** a propósito — cada imagen son decenas de KB en base64 y reventaría la
cuota, con el agravante de que `_lsGuardar` borra los chunks antes de saber si puede escribirlos.

**`imgRestaurar` es AUTORITATIVA: el estudio abierto manda sobre lo que haya en pantalla.**
Antes salía sin tocar nada cuando el estudio no tenía imágenes guardadas, «respetando lo que el
médico tenga en pantalla». Esa premisa valía cuando `imgSlots` sólo podía contener lo que él
hubiera cargado a mano; desde que las imágenes se restauran solas dejó de valer, y quedaba una
fuga entre pacientes **reproducible en dos clics**: abrir el estudio A (con imágenes), abrir el B
(sin ellas), y el formulario de B se quedaba con las ecografías de A — que iban al PDF firmado de
B y, al guardar, quedaban persistidas bajo el uuid de B para siempre. Medido y reproducido.

La única excepción es que la **lectura falle**: por eso `CeiboImg.leer` devuelve `null` cuando no
se pudo leer y `[]` cuando el estudio genuinamente no tiene. Con un solo valor para las dos
cosas, un error transitorio se traducía en «no tiene imágenes» y aguas abajo en un borrado.

**Toda lectura lleva token de generación** (`_imgGen`). La primera del arranque paga la apertura
de la base —hasta 3 s— y ni `editarInforme` ni `cargarEstudioPorId` la esperan: sin el token, una
restauración en vuelo aterrizaba sobre el paciente siguiente o sobre un «Nuevo estudio».

**`imgPersistir` no borra por omisión.** `imgSlots` vacío al guardar sólo borra si el médico
tocó las imágenes (`_imgEditado`). Sin esa bandera, dos situaciones que no son una decisión suya
destruían lo guardado: la ventana de reimpresión —que vacía `imgSlots` ~600 ms y `guardarInforme`
no tiene guard de reentrada— y una lectura fallida. Además se aborta si `_pdfGuardadoEnCurso`.

**Apagar el toggle NO borra.** Sería destruir dato clínico por cambiar una preferencia, sin
confirmación. El toggle es prospectivo y el borrado es un botón explícito en Config que dice
cuántos estudios afecta y que no hay backup posible. El commit anterior afirmaba lo contrario y
el código no lo hacía: el interruptor mentía sobre el disco.

**El borrado es por recolector, no por camino.** `imgRecolectarHuerfanas()` compara contra el
conjunto vivo de uuid en vez de engancharse a cada una de las diez vías de borrado: la que se
olvide deja huérfanos, y mañana hay una más.

La guarda va sobre el **estado del store**, no sobre el largo de la lista: exige
`CeiboStore.lista()`, `modo() === 'indexedDB'` y que **ningún estudio vivo carezca de uuid**. La
primera versión sólo cubría el caso «lista vacía» y encima era casi tautológica —`getInformes()`
es la unión de los dos baldes—. Lo peligroso no es la lista vacía sino la **parcial**: un arranque
degradado deja la caché con 2 estudios mientras IndexedDB tiene 60, y borrar uno de esos dos
recolectaba las imágenes de los otros 58 — que no están en ningún backup.

Las vías que sólo reescriben el `id` (`_sanearIds`, `_nuevoIdUnico`) **ya no orfanan nada**,
porque la clave es el uuid. Ése era todo el punto de agregarlo.

### Los caminos que borran o reasignan un estudio
Cualquier cosa que se cuelgue del `id` de un estudio —imágenes, adjuntos, notas externas— tiene
que considerar estos diez. **No indexar por `informe.id`**: lo reescribe `_sanearIds` y lo
reasigna el importador.

| # | Camino | Qué hace |
|---|---|---|
| 1 | `eliminarInforme` (21084) | filtra y `setLocal`/`setChunk` |
| 2 | `eliminarInformeYVolver` (23236) | **copia literal del anterior**; enganchar uno solo deja huérfanos por el otro |
| 3 | `limpiarTodosInformes` (21097) | `setLocal([])` + chunk vacío — borra todo |
| 4 | `importEjecutar` modo «sobre» (21259) | conserva el id y **reemplaza el contenido**: lo colgado queda atado a un estudio que ya es otro |
| 5 | `importEjecutar` + `_nuevoIdUnico` (21258) | ante colisión el estudio entra con **id nuevo** |
| 6 | `guardarInforme` «Sobreescribir» (20129) | reemplaza conservando `id` y `estudioId` |
| 7 | `guardarInforme` «Guardar como nuevo» | `id` y `estudioId` **nuevos** |
| 8 | `_sanearIds` | **cambia el `id`** en cada lectura/escritura si es inválido o duplicado — orfaniza sin que nadie borre |
| 9 | `_idbGuardar` (19910) | barre por clave todo lo que tenga `app:'eco'` y no esté en el lote |
| 10 | `_lsBorrar` (19837) | hoy sólo tras `_fusionarDesdeLS` con copia confirmada |

`estudioId` es más estable que `id` —se preserva al sobreescribir y es lo que usa el QR— pero
viene `undefined` en los importados de Excel/DICOM y en los backups viejos.

### `toast()` clasificaba emoji como error
La heurística usaba la clase `[⚠️❌🚫]`, que descompone los emoji en unidades UTF-16: la clase
terminaba conteniendo el surrogate alto `U+D83D` (de `🚫`) y marcaba como error **cualquier**
emoji de ese rango — `💾`, `🔄`, `📝`. Los avisos informativos salían con `role="alert"` y
`aria-live="assertive"`, interrumpiendo al lector de pantalla. Va con **alternancia**
(`/⚠️|❌|🚫|…/`), no con clase de caracteres. Vale para cualquier regex de emoji en este archivo.

### La base de procedencia del informe es lo GENERADO, no lo que quedó en pantalla
`_infBase` contesta «¿qué escribió la app?». Devolverle la salida **fusionada** —que es lo
natural, porque es lo que tiene el textarea— mete las líneas del médico dentro de la base, y en
el refresco siguiente `actual === base` dispara el atajo de «sin ediciones» y las borra todas.
La protección dura entonces **un solo refresco**, que es peor que no tenerla porque parece
funcionar. Pasó dos veces en la misma sesión, por dos caminos distintos:

- promoviendo la salida cuando **no había base** (el médico tipea antes de generar), y
- promoviendo la salida fusionada en el **flujo normal** (generar → editar → dos cambios de dato).

Al probar un merge, **encadenar al menos dos regeneraciones seguidas**. Con una sola pasada los
dos defectos daban verde.

### Las imágenes se vacían en «Nuevo estudio», NO en `limpiarCampos`
`limpiarCampos` también lo llama `editarInforme`, y las imágenes **no se persisten con el
estudio**: borrarlas al reabrir un informe para corregirlo destruye dato que no se puede
recuperar de ningún lado. El vaciado (`imgVaciar()`) va en `neGuardarYContinuar` y
`neContinuarSinGuardar`, que son los dos caminos de «Nuevo estudio».

Se muta el array **en sitio** (`length=0; push(null,null)`): el backup de la reimpresión es un
`slice()` y repone mutando en sitio también, así que los dos tenedores tienen que hablar de la
misma identidad de array.

### Un `onclick` inline infla el elemento a 44×44
La hoja de estilos trae una regla de área táctil:
`button, [role="button"], .btn, .tab-btn, .nav-tab, .chip, .cal-cell, .seg-cell, [onclick] { min-height:44px; min-width:44px }`.
Matchea por el **atributo**, no por el tipo de elemento: poner `onclick=` en un checkbox lo
agranda a 44×44 —tres veces los de al lado— y rompe la fila. Si sólo hace falta reaccionar al
cambio, usar `onchange`.

### Una regla Semgrep nueva se verifica contra el código que la originó
La primera versión de `ceibo-checked-gateado-por-disabled` daba 0 hallazgos y parecía calibrada.
No matcheaba el caso real: `!!(c && c.checked && !c.disabled)` asocia a la izquierda, así que el
operando izquierdo del `&&` externo es `(c && c.checked)` y el patrón `$C.checked && !$C.disabled`
no aplica. Antes de dar por buena una regla, correrla sobre un archivo con el defecto **y** con
la versión corregida, y confirmar que distingue. Cero hallazgos suele ser un patrón mal escrito,
no un código limpio — mismo error de denominador que el resto de esta lista.

### Un contador `{}` con clave del estudio pierde el caso `__proto__` en silencio
Los gráficos del Laboratorio cuentan con `obj[k] = (obj[k]||0)+1` donde `k` sale de un campo del
estudio. Sobre un objeto literal eso **no crea la propiedad** si `k` es `__proto__`: el setter de
`__proto__` descarta los valores que no son objetos, y lo hace sin error. `Object.entries` nunca
ve la entrada, así que ese estudio desaparece de la distribución y el gráfico queda **coherente
con un caso de menos** — peor que romperse, porque no hay nada que mirar. Medido en el navegador:
`const o={}; o['__proto__']=(o['__proto__']||0)+1; Object.keys(o).length` → `0`; con
`Object.create(null)` → `1`. Los contadores cuya clave venga de datos van con prototipo nulo.
Lo cubre la regla `ceibo-contador-objeto-literal-con-clave-de-dato`.

### `MAPA[k] || 'Otro'` no cae al fallback con `k='constructor'`
La traducción por allowlist protege de mostrar el valor crudo del estudio, pero **sólo para las
claves propias**. Con `k='constructor'` devuelve la función `Object`, que es truthy, y el rótulo
pasa a ser `"function Object() { [native code] }"`; con `toString` o `valueOf`, ídem. Medido, no
supuesto. No es XSS —`String(Object)` no trae `<`— pero rompe justo la garantía por la que existe
la allowlist: que lo mostrado sea siempre un literal del archivo. Usar el helper `_lblDe(mapa, k)`,
que hace `Object.prototype.hasOwnProperty.call` (`.call` y no `mapa.hasOwnProperty`, porque el
mapa puede ser de prototipo nulo).
**No hay regla Semgrep para esto y no es un olvido**: `$MAPA[$K] || "..."` da 43 hits con ~12
reales, y acotarla a mapas literales inline la deja en 0 —ni siquiera matchea el código que la
originó, donde el mapa tiene nombre—. Quedan sin cubrir, y hay que mirarlos a mano si se tocan:
`ETE_INCL_LBL[id] || 'La sección'`, `INSUF_TXT[n] || 'Severa'`, `farmMap[f]`, y el bloque de
exportación a Excel (`{balon:…,auto:…}[c.ete_tavi_pro_tipo] || ''`).

### Semgrep: 118 warnings, 106 son ruido
El triage completo del 2026-09-08 dio **106 falsos positivos / 12 reales**. Los falsos
vienen del patrón `innerHTML +=` con resultados numéricos (`.toFixed()`, `Math.round`,
`.length`) y con constantes de las tablas de referencia del propio archivo. Los 12 reales
compartían una sola causa —el id sin sanear— y están **cerrados por construcción en
CeiboStore**; siguen apareciendo en el conteo porque las reglas son sintácticas y no ven el
saneo del borde. **No "arreglar" los 106 restantes sin triagearlos de nuevo**: la mayoría
son correctos como están.

### `ci: ci || '—'` — el placeholder que se hace pasar por documento
`guardarInforme` guarda `nombre || '—'` y `ci || '—'` con raya U+2014. Cualquier código que
pregunte «¿esta ficha tiene documento?» mirando si `ci` está vacío responde **sí** para todo
estudio cargado sin cédula, que es el caso más común del Laboratorio. Y las normalizaciones
del tipo `.replace(/[.\-\s]/g,'')` sacan el guion ASCII pero **no** la raya, así que sobrevive
y llega a las claves.

Costó dos rondas de revisión encontrarlo, porque leída sola cada mitad es correcta: el
placeholder existe para que la lista no muestre un hueco, y la normalización saca los
separadores que la gente tipea. El defecto es de la interacción. `_dupSinDato()` es la
respuesta: **presencia de una letra o un dígito**, no `!== ''`. Si escribís otra cosa que
decida sobre identidad de paciente, usala; `\p{L}\p{N}` y no `[a-z0-9]`, o un nombre en
alfabeto no latino queda sin identidad y se reinserta en cada importación.

### Dedup de importación: una sola identidad, y con un Set de consumidos
Las cuatro vías (JSON, Excel, DICOM y los dos previews) comparten `_dupKeys` →
`_dupIndice` / `_dupBuscarClave` / `_dupBuscar` / `_dupRegistrar`. Hubo una `_dupKey`
paralela cuyo comentario **juraba** que las dos vías compartían criterio; hacía años que no
era cierto y ese comentario es lo que hizo que nadie mirara. Si agregás una vía de
importación, no escribas la búsqueda de nuevo.

Tres invariantes que no son obvias y que se rompieron una por una:
- **La clave de nombre no une dos fichas que las dos tienen documento.** Son homónimos. Sin
  esa regla, «sobreescribir» pisa el estudio de un paciente con el de otro conservando id,
  uuid y estudioId del equivocado: el QR del PDF firmado de Ana abre el informe de Juan.
- **Un estudio guardado no puede ser destino de dos registros del mismo archivo.** De ahí el
  `Set` de índices consumidos que reciben los tres ejecutores. Sin él, dos filas fusionan
  sobre la misma ficha y el toast dice «2 actualizados» sobre un solo registro con las
  mediciones de dos pacientes mezcladas.
- **Después de sobreescribir o fusionar hay que re-registrar.** La ficha cambió de
  nombre/CI/fecha; sus claves viejas ya no la describen.

El índice guarda una **lista** de candidatos por clave, no uno: la app deja tener «Ana, CI
12345» y «Ana, sin CI» del mismo día con «Guardar como nuevo», y quedarse con el primero
resolvía al paciente equivocado.

### `_IG_SECTIONS`: los ids son del DOM, y un id inventado no falla, calla
El renderer descarta el campo vacío, así que un id equivocado no rompe nada visible: la fila
no aparece nunca. Había seis escritos «como suenan» (`vci_colapso` por `vci_col`, `dtd_e` por
`tde`, `gmax_ao` por `gmax_calc`, `gmed_ao` por `gmedio_ao`, más `ad_vol` y `vp_e` que no
existen). El detalle callaba el colapso de VCI, el TDE y los dos gradientes aórticos — lo que
define la severidad de una estenosis. Al agregar un campo, verificá que exista
`id="<ese id>"`. Excepción: `indicaciones` y `antecedentes_sel` son claves array de
`guardarInforme`, no ids.

**Ojo con los calculados.** `gmax_calc` es `readonly` y está en `LAB_XLS_SOLO_EXPORT`, así
que el import de Excel no lo escribe y nada lo recalcula al abrir: importar una `vmax_ao`
corregida deja el gradiente viejo, y ahora el detalle los muestra **juntos**. Es
«bloquear no es recalcular» otra vez. Sin resolver.

## Antes de cada push — dos scripts

Los dos viven en `ecosmart/scripts/`, no tocan `index.html` y devuelven código de salida 1 si
hay algo que mirar, así que se pueden enganchar a un pre-push.

### 1 · Campos huérfanos

```bash
python3 scripts/detectar_huerfanos.py
```

Busca controles que el médico ve y puede cargar, pero cuyo id **no nombra nadie en el
JavaScript**: el dato se carga, se guarda en `campos` —porque `guardarInforme` barre `input[id]`
sin mirar cuál— y después no sale en el informe, ni en el PDF, ni en el Excel. Desaparece sin
aviso. Es el bug del cayado aórtico (punto 8 de las lecciones de abajo).

**Si aparece un campo nuevo en la lista:** verificar que tiene destino —informe narrativo, EN
SUMA, tabla del PDF, PPT, Excel del Laboratorio o alguna función de cálculo que alimente a
esos— o documentar por qué es local, agregándolo a `CONOCIDOS_LOCALES` **con el motivo**. Una
lista de exclusiones sin razones es donde se esconden los bugs.

Validado contra el commit anterior al arreglo: marca `diam_cayado` y `diam_ao_toracica`, y
desaparecen al arreglarlos. Hoy: 709 campos, 613 con destino, 9 con id armado por concatenación,
86 fuera del estudio por prefijo, **1 candidato** (`oai_lobulos`, ver «Deuda conocida»).

El script contesta *«nadie lo nombra»*, no *«no tiene destino»*: un id mencionado una sola vez
—por ejemplo en `limpiarCampos`— tiene mención y no tiene destino. La decisión final es humana.

### 2 · Test suite clínico

```bash
node scripts/test_clinico.mjs            # 132 casos, sin defectos abiertos
node scripts/test_clinico.mjs --solo TC-04
node scripts/test_clinico.mjs --ver      # con el navegador a la vista, para depurar
```

**Correr antes de cualquier push que toque el informe narrativo, el EN SUMA o una fórmula de
cálculo. Tienen que pasar los 132. Si alguno falla, corregir antes de seguir.**

**TC-01 a TC-17 — los bugs del 2026-09-14.** VD que desaparecía (TC-01/03), gradiente pulmonar
congelado (TC-04), AD ausente del EN SUMA (TC-06), HFA-PEFF sin compuerta de FEVI (TC-07/08),
los tres escenarios de EAo (TC-09/11), fuga entre pacientes (TC-12), la contraindicación
invertida del TEER (TC-13), aorta (TC-14/15) y las sincronías de PSAP y e' (TC-16/17).

**TC-18 a TC-88 — barrido por módulo (2026-09-15).** VI dimensiones y FEVI (18-21), geometría
(22-26), diastólica (27-29), aurículas (30-33), VD (34-38), aorta (39-41), mitral (42-45),
aórtica (46-48), tricúspide y pulmonar (49-51), hemodinámica (52-56), HFA-PEFF (57-58),
pericardio (59-60), congénitas (61-66), amiloidosis (67-68), cardio-oncología (69-72, 88),
ETE/TEER/TAVI/orejuela (73-78), derivados y sincronías (79-83).

**`scripts/check_mobile.js` — usabilidad en celular, MIDIENDO la página (2026-09-15).** Corre la
app por CDP igual que el suite, en 360 y 390 px, y reporta el selector CSS de cada problema:
texto que desborda, objetivos táctiles chicos, tablas anchas sin scroll, badges cortados, inputs
bajos, lo que se sale del viewport y hermanos superpuestos. Complementa —no reemplaza— al
`check_mobile.py` de la skill, que es estático: «este texto desborda» y «estos dos se pisan» no
se deducen del HTML, dependen del layout resuelto.

**Abre todas las pestañas y secciones antes de medir.** Lo que está en `display:none` no tiene
geometría, así que un barrido sobre la app cerrada encuentra CERO problemas y parece impecable —
el mismo denominador engañoso que contar filas de una tabla colapsada.

**Tres filtros de falso positivo que lo hacen legible** (sin ellos daba 241 hallazgos y no se
leía): nada dentro de un `<svg>` —los `<path>` de un dibujo se superponen por definición—; nada
`display:inline` en la comprobación de superposición —el rect de un `<b>` que envuelve dos
renglones abarca las dos líneas—; y un checkbox dentro de un `<label>` se mide por el label,
porque tocar el texto también marca. Hoy: **10 hallazgos ALTA**, todos reales.

**TC-110 — los umbrales del filtro de cohorte y sus etiquetas salen de la misma constante.** El
50 de la banda alta de PSAP estaba escrito cuatro veces (los dos lados del predicado, `_COH_LBL`
y el texto del `<option>`): ahora sale de `UMBRAL_PSAP_COHORTE_ALTA`. Importa porque esa
descripción alimenta el encabezado del PDF de auditoría — una etiqueta cableada sobre un
predicado por constante hace que el papel declare un denominador que no se usó.

**TC-111 — el rediseño de Cardio-Oncología no perdió ni duplicó contenido (2026-09-15).** Dos
reorganizaciones visuales: los doce factores de la calculadora en cuatro columnas por ORIGEN DEL
DATO (demográfico y clínico · ecocardiográfico · humoral · fármaco) y la Referencia rápida en
cuatro subtabs (CTRCD · HFA-ICOS · Cardiotoxicidad · Monitoreo eco). Ningún id, ninguna función.

**Los cuatro casos que leen `#co-referencia-seccion` por `textContent` siguen valiendo porque
`display:none` NO saca el texto de `textContent`.** TC-111 fija esa dependencia: si alguien pasa a
QUITAR los paneles del DOM, da rojo ahí y no en silencio dentro de TC-93/99/100/108.

**La subtab «Monitoreo eco» es una COPIA** de la columna de seguimiento de «Cardiotoxicidad» —se
consulta sin leer las otras seis columnas—, así que las frases que remiten a la graduación
aparecen **cuatro** veces, no dos. TC-99 cuenta cuatro: si alguna vez se edita el texto de un solo
lado, el número deja de dar y avisa. Extraer esa columna por posición de celda y no buscando
«Basal»: Hormonoterapia empieza con «No rutinario» y se perdía en silencio.

**TC-109 — quedó una sola calculadora de riesgo basal (2026-09-15).** Verifica que el score
viejo no vuelva por ningún lado, que la cápsula del bloque «Datos basales» publique la banda
HFA-ICOS con su mismo puntaje, que tildar un factor repinte **también** el contenedor que baja al
informe, que los seis campos de entrada sigan existiendo, y que el aviso de dosis acumulada
—que no era parte del score— se conserve.

**TC-101 a TC-108 — Calculadora de Riesgo CV basal, marco HFA-ICOS (2026-09-15).** Cubren las
cuatro bandas por los dos lados de cada corte, la exclusión de los dos criterios de FEVI, el piso
por fármaco (incluida la dirección peligrosa: que NO pueda bajar una banda ganada por puntaje),
la deducción de FEVI/GLS y su respeto por la decisión del médico, el párrafo del informe, el viaje
completo con el estudio, y que la tabla de referencia de al lado clasifique igual.

**Campos de la calculadora (viajan con el estudio):** doce checkbox `hfaicos_edad`,
`hfaicos_sexo_fem`, `hfaicos_hta`, `hfaicos_dm`, `hfaicos_obesidad`, `hfaicos_tabaco`,
`hfaicos_cv_previa`, `hfaicos_fevi_lim`, `hfaicos_fevi_red`, `hfaicos_gls_alt`,
`hfaicos_troponina`, `hfaicos_bnp` (como `<id>__chk`); el select `hfaicos_farmaco`; el oculto
`hfaicos_manual` (qué casillas movió una persona); y la casilla de integración
`hfaicos_incluir_chk`. Las doce filas son **HTML estático**: si se generaran al abrir la sección,
en una carga limpia los `<input>` no existirían y `cargarEstudioPorId` —que hace
`if (el) el.value = val`— no tendría dónde reponer lo guardado.

**TC-100 — las dos pestañas de referencia de cardio-onco dicen lo mismo (2026-09-15).** La
leyenda de `#ref-cardiotox` (pestaña Referencias) y las tablas de `#co-referencia-seccion`
(pestaña Cardio-Oncología) describen al mismo paciente desde pestañas distintas, y estaban
desincronizadas en tres cosas: el signo del SGL, el calendario de eco de antraciclinas (había
**tres** agendas) y la confusión entre «marcador de alto riesgo» y «banda de riesgo global».
El caso lee los dos contenedores en la misma corrida — nada más las ata, son prosa HTML.

**TC-99 — las tablas de referencia contra el clasificador de al lado (2026-09-15).** La pestaña
de Cardio-Oncología suma dos tablas nuevas de sólo referencia (marco HFA-ICOS y cardiotoxicidad
por clase con seguimiento eco). TC-99 fija lo que no puede volver a pasar: que una fila mande
**suspender** por un umbral que la tabla de grados de esa misma sección resuelve como
«Continuar», y que el aviso de escalas siga describiendo con exactitud lo que hace
`calcCardioOnco`.

**TC-GR-01 a TC-GR-15 — guardar y restaurar (2026-09-15).** Era la brecha mas grande del
suite. Entran por las funciones REALES —`guardarInforme` con su card de severidades, y
`cargarEstudioPorId`— y no por el store, porque lo que se prueba es el viaje completo. El helper
`__t.guardar()` / `__t.reabrir()` / `__t.borrar()` esta en el PRELUDIO; cada caso borra lo que
guardo, porque un estudio que sobrevive cambia el denominador del siguiente.

Cubren: los datos del paciente (01), el informe identico antes y despues (02), la EAo con su
escenario recalculado (03), la FEVI y la coartacion que no viajan al paciente siguiente (04, 05),
los modulos integrados HFA-PEFF / TEER / amiloidosis (06, 07, 11), la serie congelada de
cardio-onco (08), corregir tras reabrir (09), reabrir encima de otro paciente (10), la casilla de
morfologia ETE con su boton y su badge (12), el estudio IMPORTADO ralo abierto encima de otro
(14) y la contractilidad y el strain segmentarios (15).

**TC-84 a TC-98 — los defectos que el propio suite encontró, ya cerrados (2026-09-15).** TEER c7
y c8 al `veto` (84/85), el gate `esSec` estricto que evita que el arreglo se coma el caso común
(89), la AI por diámetro AP en el EN SUMA con su lado normal (87) y los tres bordes que apareció
el differential-review del arreglo (90: espejo vivo, cero, compuerta). Segunda tanda: c1b como
advertencia declarada (86), la PASP en cero (91), la reimpresión que no puede recalcular (92) y
la tabla de Referencias de cardio-onco atada al clasificador (93). Tercera: el redondeo del SGL a
la precisión que se publica (94), los cinco criterios de techo del TEER contra el cero (95), el
estudio parado en el umbral de su propia cohorte (96) y las copias sueltas de las dos fórmulas de
cardio-onco (97), y las dos listas del cero verificadas sobre el fuente (98).

**⚠ El cuerpo de un caso es un template literal: NO usar acentos graves adentro**, ni en un
comentario. Un backtick cierra la cadena y el archivo deja de parsear con un `SyntaxError` que
apunta a la línea del `caso(`, decenas de líneas ANTES del culpable. Ya se pagó cuatro veces en
una sola sesión; el aviso está también arriba de `const caso` en el script.

**Dos reglas que rigen los casos nuevos:**
- El **umbral y el operador** salen del código —`>` y `>=` no son lo mismo—, y se prueban **por
  los dos lados del corte**. Un caso que mira 50 y 70 pasa igual con el umbral corrido tres
  milímetros.
- El **texto literal** sale de la **salida real** de la app corrida en Chrome, nunca de memoria
  ni de un resumen: así no se congela una redacción que nunca existió.

**BSA = 2,00 exacta** con peso 80 / talla 180 (`sqrt(80·180/3600) = 2`). Todo lo indexado —LAVI,
masa VI, VLI, AVAi— da números redondos y el caso dice qué umbral prueba en vez de arrastrar una
superficie corporal arbitraria escondida en los insumos.

**`casoAbierto()` — defectos abiertos (xfail).** Describe lo que la app *debería* hacer sobre un
defecto vivo. Falla a propósito y **no tiñe el resultado**: si contara, el suite quedaría rojo
para siempre y se dejaría de correr, que es exactamente como un defecto deja de verse. Pero si
alguno **pasa**, el runner sale con 1 y pide promoverlo a `caso()` — un arreglo silencioso
también es un cambio del que hay que enterarse. De los cuatro que abrió el barrido **no queda
ninguno**; hoy el helper no tiene usuarios y se conserva para el próximo.

**Un xfail sobrevive a una decisión, y ahí hay que borrarlo, no mantenerlo.** TC-86 decía «el
velo posterior debe pesar en el veredicto» mientras la decisión estaba pendiente. Cuando se
decidió lo contrario —c1b es advertencia—, ese xfail dejó de describir un defecto y pasó a
empujar hacia la conducta descartada: el día que alguien «lo arreglara», el runner habría salido
con 1 exigiendo promoverlo. Se convirtió en caso normal que fija la decisión por el lado
correcto. **Al tomar una decisión, revisar si algún `casoAbierto()` afirmaba lo opuesto.**

**No usa Playwright** — `pip install` está bloqueado en este entorno y bajar un Chromium propio
son ~150 MB. Node 24 trae `fetch` y `WebSocket` nativos, así que el script habla **CDP directo
contra el Google Chrome del sistema**: cero dependencias, cero descargas, y prueba sobre el motor
real en vez de sobre un DOM simulado. Si mañana no hay Chrome, el script lo dice y sale con 2.

#### Un suite que no sabe fallar no sirve

Los 17 originales se verificaron contra `c055342~1`, el commit anterior a los arreglos: daba
**6/17**, y TC-04 imprimía «valor esperado: 64 · encontrado: 16».

Para los casos nuevos no hay un commit viejo con el defecto, así que se validaron por
**mutación**: se copia `index.html` a `/tmp`, se le mueve un umbral y se corre el suite contra la
copia. **Nunca sobre el archivo real.** Trece umbrales movidos en dos tandas y cada uno lo cazó
el caso que le corresponde: FEVI→TC-20, LAVI→TC-30, área AD→TC-33, VD medio→TC-35, TAPSE→TC-36,
FAC severa→TC-37, `AO_REF`→TC-14/39, PmAD→TC-50/52/80, Gmax pulmonar→TC-51, área mitral del
TEER→TC-74.

**Dos mutaciones NO fueron cazadas, y las dos enseñaron algo:**

1. **NT-proBNP 375 → 365 pasó desapercibido.** Los valores del caso (300, 400, 700) caen del
   mismo lado de los dos umbrales. Justo la regresión que ya ocurrió en este repo. Se agregó
   **370**, que es el único valor que los separa: con 375 vale 0 puntos, con 365 vale 1.
   **Regla: al testear un umbral, elegir el valor que distingue el umbral correcto del error
   plausible**, no un valor cómodo lejos del corte.
2. **`CO_UMBRAL_FEVI_CAIDA` de 10 a 20 no puso nada en rojo.** Porque no es el umbral que
   clasifica: ver abajo, en «Deuda conocida».

**Al agregar un caso, hacer lo mismo:** moverle el umbral a una copia y confirmar que se pone
rojo. Un caso que no se puede hacer fallar no está probando nada.

#### Qué queda sin cobertura

Medido, no estimado: el suite maneja **111 de los 623 campos del estudio (18 %)** e invoca 18
funciones de la app directo. El 18 % es de *campos tocados*, que es lo único contable sin
instrumentar el archivo; la cobertura de **ramas que deciden el informe firmado** es bastante más
alta, porque los casos se escribieron eligiendo los cortes, no los campos.

**Sin cobertura automática, en orden de lo que más pesa en un informe firmado:**

1. **Motilidad segmentaria** — los 17 segmentos, el bull's eye y `contrFraseNarrativa()`. Es
   estado de módulo con clics sobre un diagrama, no campos: *requiere verificación manual*.
2. **Guardado y restauración** — `cargarEstudioPorId`, `editarInforme`, las dos rutas de
   reimpresión y `RECALC_MODULOS`. Es donde vive la clase de bug más cara de esta app (el
   derivado que no se recalcula al reabrir). No es imposible de testear: hace falta guardar un
   estudio y volver a abrirlo dentro del mismo navegador. **Es la brecha que más conviene cerrar.**
3. **PDF y PPT** — `jsPDF`, el QR, la firma, los saltos de página. El suite prueba los **textos**
   que alimentan las hojas (`amiloTexto*`), no el dibujo. Para el dibujo ya está la técnica de
   interceptar `save()` y leer el content stream.
4. **Laboratorio** — Excel, estadística, asociaciones, panel de cohorte, subtab CC.
5. **Congénitas incompletas** — sólo CIA, CIV, MCH, MCA (una rama) y VAB. Quedan FOP, Ebstein,
   Tetralogía de Fallot, TGA, ventana aortopulmonar, ductus y coartación. Los dos últimos se
   probaron a mano en el navegador y funcionan; no quedaron como caso porque sus checkbox son
   `ductus_incluir_chk` y `coart_incluir_chk`, no `dap_`/`coa_`.
6. **Diastólica: sólo el algoritmo por defecto** (ASE 2025) y sólo en ritmo sinusal. BSE 2024,
   ASE/EACVI 2016 y la rama de FA quedan afuera.
7. **Score HCM Risk-SCD calculado** — está cubierto que *no se publica incompleto*, no el número
   con las siete variables cargadas.
8. **Algoritmo de amiloidosis** — el score ETT sí; el algoritmo diagnóstico (centellograma,
   proteínas monoclonales) no, porque su estado vive en variables de módulo y no en campos.
9. **Resto:** Eco Estrés (el bloque ya está inerte), Eco Pulmonar, masas intracardíacas,
   taquicardia ventricular, historia clínica, frases rápidas, segmentos del ETE, pre-TAVI,
   panel de indicaciones (`_IG_SECTIONS`), DICOM e imágenes en IndexedDB.

## LECCIONES APRENDIDAS — 14/09/2026

Retrospectiva de la sesión del 2026-09-14 (commits `762b739` … `61e0bd3`). Las trampas
operativas están arriba, en «Trampas», con el detalle técnico; esto es el índice de qué salió
mal y qué regla queda.

**Tres puntos del pedido original no coincidían con lo verificado en el navegador y se
corrigieron acá en vez de copiarse.** Están marcados con ⚠︎. Escribir una lección falsa en este
archivo es peor que no escribirla: es el archivo que la próxima sesión lee como verdad, y hoy ya
nos pasó dos veces (ver el punto 15).

1. **VD desapareció del informe.** El commit `58fccf6` unificó tamaño y función en una oración y
   dejó vacía la rama «todo normal», así que un VD medido y normal salía idéntico a uno que nadie
   miró. Y la compuerta `tapse || sp` hacía desaparecer el VD entero —incluido un basal de
   48 mm— si no se había medido OTRA cosa. *Precisión: no desaparecía de todos los informes; sí
   del caso normal siempre, y del dilatado cuando faltaban TAPSE y S'.*
   **Lección:** al unificar compuertas, enumerar los escenarios, incluido el de campo único. La
   compuerta correcta era «¿hay alguna medida del VD?», no «¿hay TAPSE o S'?».

2. **Gradiente pulmonar congelado.** `if (vmax && !gmax)` calculaba una sola vez. Con el
   `oninput` disparando por carácter, tipear «4.5» dejaba el gradiente del «4» intermedio.
   **Lección:** un campo derivado se recalcula **siempre** que cambia su origen, y se **limpia**
   cuando el origen desaparece. Si no, el informe publica dos números contradiciéndose dentro del
   mismo paréntesis. Y antes de creerle al diagnóstico de un bug de cálculo, reproducirlo: el
   reporte decía «falta elevar al cuadrado» y la fórmula estaba bien desde siempre.

3. **FAC y FEVD no son lo mismo.** FAC = 2D por áreas, corte <35 %. FEVD = 3D/RMC, corte <45 %.
   **Lección:** documentar el método en el comentario del campo, y no cablear un campo huérfano a
   un cálculo que mide otra cosa sólo porque el nombre suena parecido.

4. **Contraindicación invertida en el TEER.** `_teerAsciiPDF` mapeaba ❌→«NO» al sanear para
   jsPDF, así que «❌ CONTRAINDICADO — trombo en aurícula izquierda» se imprimía
   **«NO CONTRAINDICADO»**. *Lo agarró el `/differential-review`: nunca llegó a un paciente.*
   **Lección:** al sanear texto para el PDF, los iconos se **borran**, no se traducen — el texto
   que queda ya dice qué pasa. Y todo estado negativo de seguridad clínica se verifica leyendo la
   salida real, no el código que la produce.

5. **Fuga de estado entre pacientes.** Dos vías, las dos con id en el DOM:
   `dataset.derivadoDe` / `sugerido` / `espejoDe` viven en el nodo y `limpiarCampos` sólo vacía
   `.value`; y los `input[type=hidden]` (`ete_tavi_jet_horas`, `co_serie_json`) no entran en el
   barrido `input[type=text], input[type=number]`.
   ⚠︎ *La formulación original decía «todo campo que no tiene id en el DOM». No es eso: los cuatro
   casos SÍ tienen id. El criterio real es el de abajo.*
   **Lección:** **no persistirse no es lo mismo que limpiarse.** Todo lo que no lo alcance el
   barrido de `.value` —marcas de `dataset`, inputs ocultos, `display` inline— se limpia a mano en
   `limpiarCampos` y se respalda en la reimpresión. Medido: la serie de seguimiento del paciente A
   terminaba dentro del estudio del paciente B, guardada e impresa en su hoja.

6. **FAC clasificada sobre un número y publicada sobre otro.** La cápsula clasificaba el valor
   CRUDO (34,5 → «disfunción, <35 %») y el campo guardaba el REDONDEADO (35), que es lo que lee
   el informe (→ «función conservada»). Pantalla e informe se contradecían.
   ⚠︎ *La lección original decía «clasificar siempre el valor crudo, no el formateado». Es al
   revés de lo que se hizo y reintroduciría el bug.*
   **Lección:** clasificar **el valor que se imprime**. Si se publica redondeado, se clasifica
   redondeado. Lo que no puede pasar es que el número que decide la banda y el número que sale en
   el informe sean distintos. Es el mismo cierre que ya tenía `calcGeometriaVI`.

7. **`ea_grado` vs las mediciones — dos fuentes de verdad.** Manda `ea_grado` (la pastilla, que
   fija el médico y viaja con el estudio); el algoritmo aporta el subtipo y los datos entre
   paréntesis. Si se contradicen, el informe **lo dice** en vez de elegir por su cuenta.
   **Lección:** cuando hay dos fuentes para el mismo dato, definir cuál manda, documentarlo, y
   publicar la discrepancia en vez de resolverla en silencio.

8. **Campos huérfanos — cayado y aorta torácica descendente.** `diam_cayado` y
   `diam_ao_toracica` existían en pantalla sin `oninput`, fuera de `AO_SEGS`, del informe, de la
   tabla del PDF y del Excel. El médico los cargaba y desaparecían.
   **Lección:** todo campo visible necesita un destino —informe, tabla del PDF, Laboratorio o
   Excel—. Si no lo tiene, es un campo que promete y no cumple. El `grep` de su id es de diez
   segundos.

9. **Asimetría entre estructuras análogas.** La AD dilatada llegaba al narrativo y no al EN SUMA;
   la AI dilatada sí. Mismo patrón en pre/post TAVI y en las rutas de restauración.
   **Lección:** al implementar un comportamiento para una cavidad, válvula o módulo, recorrer
   sistemáticamente sus análogos y verificar que tienen el mismo tratamiento.

   **Ampliación (2026-09-15): los análogos no son sólo otras estructuras, son las otras RUTAS DE
   MEDICIÓN de la misma.** Al arreglar la AD se recorrieron las cavidades, no las vías: dentro de
   la AI, la rama del **volumen indexado** hacía `suma.push` y la del **diámetro AP** no tenía ni
   uno, así que la misma aurícula dilatada subía al EN SUMA o no según con qué se la hubiera
   medido — y la vía sin cobertura era la más frecuente en un eco de rutina. El informe firmado
   decía «Aurícula izquierda dilatada» arriba y «Estudio sin alteraciones estructurales ni
   funcionales significativas» abajo. Lo encontró el test suite. Cuando un hallazgo tiene dos
   formas de medirse, **son dos análogos** y hay que recorrerlos igual. Cubierto por TC-87, que
   verifica las dos mitades: que el hallazgo suba **y** que la afirmación tranquilizadora deje de
   emitirse — sin la segunda, un `suma.push` de más seguiría pasando el test.

10. **HFA-PEFF sin compuerta de FEVI.** El score es exclusivo de FEVI ≥50 % y se calculaba con
    cualquiera. Se bloquea en las cinco superficies (pantalla, línea del Doppler, informe, EN
    SUMA, hoja del PDF) **y en el Laboratorio**, que era la quinta y no lo miraba: el mismo
    paciente salía HFrEF en su informe y HFpEF en la estadística.
    **Lección:** documentar las precondiciones clínicas de un score y bloquear el cálculo si no se
    cumplen. Y que la compuerta viaje dentro del resultado no obliga a nadie a mirarla: hay que
    recorrer los consumidores uno por uno.

11. **Insuficiencia pulmonar cargada y ausente del informe.** `ip_grado`, `ip_vmax` e `ip_vtd` no
    los leía nadie del narrativo.
    **Lección:** todo campo clínico cargado necesita reflejo en el informe. Si no hay texto para
    él, es un bug, no una decisión.

12. **TEER mostraba criterios de otro tipo de IM.** Los de coaptación (IM funcional) aparecían en
    la primaria y al revés. Pero el arreglo trajo lo importante: **ocultar un campo y dejar de
    contarlo son la misma decisión**, y al mover las longitudes de velo al bloque de la primaria
    dejaron de vetar en la secundaria — un «❌ NO apto» pasó a «✅ APTO» en la hoja firmada.
    **Lección:** filtrar campos por tipo de patología está bien; hacerlo tiene que gatear por el
    **dato** (`teer_tipo_im`), nunca por la visibilidad, y un criterio que NO APLICA no es un
    criterio que FALTA.

13. ⚠︎ **PREMISA FALSA — el pre-TAVI SÍ integra al informe.** Verificado en el navegador: el
    botón «Integrar al informe» existe (es el mismo `ete_tavi_incluir_chk` para pre y post) y con
    anillo, senos y coronarias cargados el párrafo pre-TAVI sale completo. Sin tildar no sale
    nada — que es el comportamiento de todos los módulos del ETE.
    **Lo que queda de la lección, que sigue valiendo:** los módulos que forman un par
    (pre/post, basal/seguimiento) tienen que comportarse igual, y eso hay que verificarlo. Acá la
    verificación dio simétrico.

14. ⚠︎ **PREMISA FALSA — la PSAP normal YA aparece en la tabla del PDF.** Verificado con VRT 2,2
    y PmAD 3 (PSAP 22, normal): el PDF imprime la fila. Sale siempre que `psap_calc` tenga valor,
    en las dos tablas, sin mirar si es normal o alta.
    **Matiz importante de la lección propuesta:** «la compuerta debe ser ¿hay dato?, no ¿el dato
    es patológico?» vale para **publicar un valor medido**. NO vale para **afirmar una
    normalidad**: sin medición no se niega nada (aorta sin medir, RPV sin evaluar, VD sin
    diámetro). Las dos reglas conviven — publicar lo medido, callar lo no medido.

15. **La disputa del NT-proBNP en FA — 375 vs 365.** El valor correcto es **375** (Pieske et al.,
    Eur Heart J 2019;40:3297-3317; criterio menor en FA 375-660 pg/mL). Ya se había corregido en
    `2693c48` (2026-08-26) con la justificación escrita arriba de la función, y **lo volví a
    bajar a 365 en esta sesión**, de memoria, con un comentario nuevo que decía «estaba en 375
    desde siempre» —falso— contradiciendo al que estaba dos líneas más abajo sin tocarlo. Lo
    agarró el `/differential-review`.
    **Regla:** antes de cambiar un número clínico, `git log -S "<el valor viejo>"`. Si hay un
    comentario que lo justifica, leerlo. Si se cambia igual, **reescribir ese comentario en el
    mismo commit**: un archivo que afirma las dos cosas a dos líneas de distancia garantiza que
    el próximo pase lo vuelva a dar vuelta.

16. **La serie de Cardio-Oncología no viajaba con el estudio.** `co_seguimiento` vive en una
    clave global de localStorage indexada por paciente: reimprimir un informe firmado en marzo
    traía los controles de junio.
    **Lección:** todo dato que sale en el PDF firmado tiene que viajar **dentro del estudio**
    (en `campos`), no en una clave global. La serie se congela al integrar y sólo cambia al
    reintegrar explícitamente — con aviso en pantalla cuando la congelada y la viva difieren, que
    se compara por **contenido** y no por cantidad.

**El patrón que atraviesa la sesión:** de las correcciones pedidas, seis partían de premisas que
no se sostuvieron al abrir el código (gradiente pulmonar, AVA en las tablas, bandas de `ao_st`,
pre-TAVI, PSAP normal, botón de indicaciones). Verificar la premisa antes de construir ahorró
trabajo en todos los casos y evitó cambios que habrían roto cosas que funcionaban. Y de los
defectos GRAVES encontrados en los reviews, la mayoría los había introducido yo en el mismo
cambio que venía a arreglar otra cosa: **correr `/differential-review` sobre el diff antes de
cada push no es burocracia, es lo que atrapó la contraindicación invertida.**

## Tests de regresión

`tests/regresion.json` tiene dos pacientes. **Correr los dos en el navegador antes de cada
commit** que toque renderizado, escapes, el store o el PDF.

- **Paciente 1 — envenenado.** Cuatro campos malformados, uno por contexto de inyección.
  Se espera: cero ejecuciones, cero atributos de evento, cero elementos inyectados, los
  campos visibles como texto literal, y el id reparado a un `number` en la banda ≥ 9e14.
  No hay que assertar el número exacto: es determinista para un contenido dado, pero el
  contrato es «number y en la banda».
  No entra por el import JSON —`validarInformeImportado` lo rechaza— así que hay que
  escribirlo con `CeiboStore.setLocal([...])`. Eso es correcto: la escritura directa es
  justamente el vector que queda abierto.

- **Paciente 2 — legítimo con extremos.** Sirve para detectar la defensa que se pasa. Se
  espera: el nombre `O'Brien & Cía <Cardiólogo>` visible **tal cual** (si se ven entidades
  hay doble escape), y **FEVI 0 y edad 0 visibles como `0`, no como celda vacía** — ese es
  el caso que protege el cambio de `escHtml` a `String(s ?? '')`.

El JSON lista además los cinco sinks a verificar y cómo montar cada vista sin caer en el
falso negativo del contenedor vacío. **Antes de contar cualquier resultado, confirmar que la
vista renderizó**: contar filas, ítems o bytes. Un cero sobre cero elementos no prueba nada.

## Rangos de importación

`DCM_RANGO` y `LAB_XLS_RANGO` **asumen paciente adulto**. Un seno aórtico neonatal (~6-9 mm)
cae bajo el piso de 10 mm y la fila se rechaza entera. Está documentado en el propio código,
arriba de `DCM_RANGO`, con la lista de campos afectados. No bajar los pisos: son los que
atrapan un `1,2` escrito por `12`. Si hace falta pediatría, rango por franja etaria usando
el campo `edad` que ya está en el mapa de Excel.

### CIA/CIV y tractos de salida: sin red
`ete_cia_tam_max`, `ete_cia_tam_min`, `ete_civ_tam`, `tsvd_diametro`, `vti_tsvd`,
`diam_tsvi`, `itv_tsvi` **no figuran en ninguna de las dos tablas de rango**. Entran por
Excel sin ventana de plausibilidad: un TSVI de 210 mm escrito por 21,0 se importa sin
chistar, y de ahí sale el **Qp/Qs** del shunt.

No se les inventó rango a propósito: son campos de cardiopatía congénita, o sea población
pediátrica por definición, y una ventana adulta rechazaría los casos legítimos — el mismo
problema que ya tiene `DCM_RANGO`. La salida correcta es rango por franja etaria usando el
campo `edad`, que ya está en el mapa de Excel. Hasta entonces, **saber que no hay red**.

Contexto: esta sección se movió a la tab Hemodinámica el 2026-09-08 y quedó más a mano, así
que es donde más probablemente entre un dato fuera de escala.

## Hallazgos de auditoría verificados como FALSOS (2026-09-09)

Seis de una tanda de siete no existían. Se documentan con la evidencia para que no vuelvan a
entrar en una lista de correcciones: cada uno cuesta media sesión de verificación.

- **«`eeHasData()` puede activarse con datos del ETE».** Invierte la relación: `eeHasData`
  (~8012) es de Eco Estrés y sólo lee `ee-*`, `eeBull`, `eeImg`, `eeEcg`. No hay ninguna ruta
  del ETE. Y el gate está cerrado por partida doble: la UI se retiró —cero ocurrencias de
  `id="ee-incluir-pdf"`, `ee-res-global`, `ee-b-mets`— y su único consumidor (~18654) exige
  `document.getElementById('ee-incluir-pdf')`, que no puede existir. El defecto real de esta
  función (`.length` por `.some(Boolean)`) se cerró el 2026-09-08.
- **«El bull's eye no se limpia al cargar otro paciente».** `limpiarCampos` **sí** lo limpia,
  en las líneas 16344-16345, vía `contrReset()` y `sglReset()`. Grepear `strainEstado` dentro
  de la función da cero y parece confirmar el bug — el reseteo va por esas dos funciones. Es
  el caso típico donde el grep miente: medir en el navegador. Verificado pintando segmentos y
  llamando `limpiarCampos()`: estado a 0 y el SVG repinta al color de índice 0.
- **«El bull's eye no se captura si el canvas está fuera del viewport».** No hay canvas en
  pantalla: el de la UI es un `<svg>` (`sgl-svg-bullseye`, 3585) y `bullseyeDataURL` (~27436)
  crea un canvas **desprendido** con `document.createElement`. La posición del scroll es
  irrelevante. El arreglo pedido —scrollear o «renderizar offscreen»— habría creado la segunda
  ruta de dibujo contra la que advierte el comentario de ~26058.
- **«FEVI Simpson calcula con un solo plano».** No existe cálculo de Simpson por planos.
  `fevi` es un `<input type="number">` (1759) que el médico tipea, y `fevi_met` es una
  etiqueta. Nada escribe `fevi` por código; no hay `id="fevi_simpson"`.
- **«THP se calcula con AVm planimetría vacío».** `calcTHP` (~13340) lee sólo `thp`, tiene
  guarda `if (!thp) { setv('avm_thp',''); return; }` y nunca mira `avm_plan`. AVm por THP es
  220/THP (Hatle): la planimetría es una medición independiente, no una entrada.
- **«Frases rápidas fallan con textarea >10.000 caracteres».** No hay ningún límite:
  `frasesInsertar` (~15005) no chequea longitud y `#informe_texto` (9459) no tiene
  `maxlength`. El único `maxlength` del archivo es 400, en la nota de caso de interés.

**Lo que sí era real de esa tanda:** el aviso médico-legal sólo salía desde `doLogin()`.

### El algoritmo de amiloidosis: estado de módulo que no era del formulario
`gradoGamma` y `protMonoc` (~23557) son dos `var` de nivel superior con dato clínico del
paciente, y el panel de conclusión son tres `div` sueltos (`#algo-title`, `#algo-body`,
`#algo-accion`) que **no alcanza ningún barrido** de `limpiarCampos` —ni el de
`.calc-box .calc-row span[id]` ni el de `[id$="-badge"]`—.

Lo peligroso no era que no se limpiara: era que se limpiaba **a medias**. El bucle de inputs
sí vaciaba `alg-motivo` y `alg-ett-score`, así que el paciente nuevo veía «Motivo de
sospecha: no especificado» arriba y «ATTR confirmado — Grado 3 (VPP 100%)» abajo. Se lee
como una evaluación fresca. Un clic en «Integrar al informe» metía el centellograma del
paciente anterior en el informe del actual. Reproducido en el navegador.

Y `resetAlgoritmo` tampoco alcanzaba solo: nuleaba las variables pero **no repintaba**,
porque no llamaba a `actualizarAlgoritmo()`. El cartel sobrevivía también al botón «🔄 Nueva
evaluación». Hoy `resetAlgoritmo` termina llamando a `actualizarAlgoritmo()`, y la rama
temprana de ésa —la de estado en null— es la única que decide cómo se ve el panel vacío.

**La lección general:** al agregar un módulo con estado propio, las tres columnas son
`limpiarCampos` / `editarInforme`+`cargarEstudioPorId` / `guardarInforme`. Si falta la
primera, el dato del paciente anterior viaja. Y un reseteo que no repinta no es un reseteo.

### El aviso médico-legal falla CERRADO
`_avisoLegalForzar()` (~1113) toca el DOM directamente en vez de llamar a `mostrarAvisoEco`,
que vive ~33.000 líneas más abajo en otro bloque `<script>`: si ese bloque deja de parsear
—ya pasó dos veces— la función desaparece y el aviso deja de salir.

Antes había dos caminos y los dos fallaban abiertos, de forma distinta: con `typeof` era un
no-op mudo, y la llamada pelada de `doLogin` tiraba `ReferenceError` **después** de marcar
la sesión y ocultar el overlay, o sea que el login quedaba hecho y el disclaimer no aparecía
nunca. Ahora, si `#modalAvisoEco` no está, se revierte al login. **No cambiar esto por un
`try/catch` mudo:** el requisito que custodia `clinical-disclaimer-guard` no puede fallar de
un modo que se vea igual que un arranque sano.

### El z-index del login no es negociable
`#login-overlay` está en `2147483000`. Estaba en 9999 mientras ocho overlays escritos a mano
viven entre 99998 y 100000, así que «Cerrar sesión» levantaba la pantalla **por debajo** de
ellos — y el modal de `editarInforme` lleva el nombre del paciente en el cuerpo. Si agregás
un overlay, no le pongas más que eso.

### Clasificar por texto libre: sin guarda de negación el sesgo es sistemático
Varias estadísticas del Laboratorio salen de buscar palabras en el informe narrativo
—hallazgos frecuentes, geometría del VI, grado diastólico, contractilidad difusa, casos de
docencia—. Todas usaban `regex.test(texto)`, así que «se descarta HTP» contaba como un caso
DE HTP. El sesgo **no es aleatorio**: un laboratorio que informa bien nombra lo que descartó,
así que infla justo lo que más se menciona para negarlo, y esas cifras van a un PDF de
auditoría. Medido sobre una cohorte de 8: HTP contaba 4, son 2.

Ahora todo pasa por **`_labMenciona(txt, re)`**. Mira hacia atrás desde cada ocurrencia,
dentro de la misma oración (`.`/`;`/salto cortan la ventana), y una mención afirmativa
alcanza. Deliberadamente no mira hacia adelante: «HTP no severa» menciona HTP y lo negado es
el calificativo. Si agregás una clasificación por texto, usala — no escribas otro `.test()`.

Y `_labGeomCat` es la **única** implementación de geometría del VI: había dos copias
idénticas, dashboard y PDF. La rama `normal` ya no usa `\bnormal\b` suelto, que matcheaba
«función diastólica normal» y clasificaba la geometría de ese estudio como normal, inflando
numerador y denominador a la vez.

### El denominador se declara una vez, o el PDF publica dos
La sección de Valvulopatías tenía la gráfica dividiendo por `infs.length` y las seis tablas
por la base de cada válvula, **en la misma página**, bajo un subtítulo que decía las dos
cosas: «Solo pacientes con valvulopatía documentada — % sobre total (n=…)». Y como la gráfica
imprime el `n` crudo dentro de cada barra, el mismo número aparecía dos veces con dos
porcentajes: la barra decía «n=2 · 1%» y la tabla «2 (25%)».

La base correcta es **por válvula**: un estudio sin `im_grado` no dice nada sobre la mitral,
así que meterlo en su denominador no mide prevalencia, mide cuánto se completó el formulario.
`_labValvCounts` devuelve `bases[]` y el `n` va en el título de cada tabla, porque es distinto
en cada una.

**`pctOf(n, 0)` devolvía `0`, que es el valor que más se parece a un resultado.** La estenosis
tricuspídea no existe en el modelo de datos (su accesor es `() => null`), así que el PDF
imprimía cuatro filas confiadas en «0 (0%)» y un auditor leía «este laboratorio no tiene
estenosis tricuspídea». Con base 0 la celda ahora dice «—» y el título «(sin datos)».

### Frases direccionales: el texto no puede afirmar lo que el semáforo niega
`interpTxt` elegía la lectura clínica por el SIGNO del coeficiente y nada más, así que una
correlación de rho=0,05 con p=0,8 publicaba «A mayor FEVI, mayor presión pulmonar» en la
tabla, el Excel y el PDF. No podía consultar el p ajustado: `runOne` corre antes de que
exista `pAdj`, que necesita las 29 asociaciones juntas. La decisión se movió a `_bh`, después
del ajuste. Umbral: el **p ajustado**, el mismo del semáforo. Si el semáforo no está verde,
el texto dice «Sin asociación significativa.».

### Estenosis mitral: una sola escuela, y el THP no vota aparte
El archivo tenía dos convenciones conviviendo, y no eran dos opiniones sino dos épocas: la
tabla de referencia y el score decían «AVm ≤1,5 severa» (ESC) y en la misma tabla «THP ≥220
severa»; la calculadora `cxAVT` decía «severa <1,0» (AHA/ACC clásico).

**El THP y el AVm no son dos mediciones.** El AVm por THP ES 220/THP (Hatle), así que THP
≥220 equivale a AVm ≤1,0. Entre 147 y 219 ms el mismo número daba «severa» por el área y
«moderada» por el THP, y **las dos votaban en el mismo score**: una medición contada dos veces
y en contra de sí misma. Se eliminó el voto del THP; sigue entrando como `AVm(THP)`.

Verificado contra las guías (2026-09): ESC/EACTS 2021 y 2025 → severa AVm ≤1,5 cm², sin
cambios entre ediciones. ASE 2023 → AVm ≤1,5, THP ≥150 ms, gradiente medio ≥10 mmHg.

**Cambio clínico declarado:** el gradiente medio pasó de `>10` a `≥10` para severa. Un
gradiente de 10 exacto ahora es severa. Casi entra disfrazado de refactor bajo un comentario
mío que afirmaba «ya coincidía y no se tocó» — lo cazó `/differential-review`. **Un cambio de
umbral no puede viajar dentro de una extracción de constantes.**

**No hay `THP_SEVERO_MIN`.** Se creó y se borró en la misma sesión: no gobernaba nada —el
motor clasifica el área, no el THP— y encima desfasaba, porque el corte efectivo es 220/1,5 =
146,7 (≥147 ms) y no ≥150. La tabla de referencia publica ≥147 y explica por qué difiere del
≥150 que publica ASE. Una constante que no gobierna nada es peor que el literal.

### Extraer un umbral es leer por función, no grepear el literal
En la extracción de LAVI/masa/PSAP/FEVI se pasaron por alto ~20 sitios, y **tres estaban en la
línea contigua a uno que sí se cambió** (`(aiVol/bsa) > 34`, `FEVICAT f>=50`, el rótulo
`PSAP > 35`). El patrón delata el método: una pasada por el literal exacto en vez de leer la
función. Dos de los omitidos eran clasificatorios y uno escribía el **informe narrativo
firmado** («AI de dimensiones normales»).

Y no todo número igual es el mismo umbral. Quedan literales A PROPÓSITO:
- `fevi >= 20 && fevi <= 50` — rango de elegibilidad COAPT del TEER, no normalidad.
- la escala 50/54 de cardio-oncología — ESC 2022, otra guía.
- `uLaviMay = fa ? 40 : ...` — el ajuste por FA del HFA-PEFF.
- la tabla de **prótesis** mitral (`AVm <1.0`, `THP >200`) — obstrucción protésica, otra
  entidad. Se ve como la escala vieja y NO lo es. No la "arregles".
- `hviSeveridad` arranca sus bandas en 96 y 116, o sea `UMBRAL_MASA_HVI_* + 1`: acopladas sin
  nombrarlas. Hay un comentario cruzado; si movés el umbral, movelas.

### El bloque de Eco Estrés ya está inerte — no le pongas una bandera falsa
Sus dos listeners sobre `document` (click en `#ee-eye-pop`, paste en `#tab-ee`) preguntan por
su propio DOM adentro y salen temprano. Medido: ninguno llega a `preventDefault()`. Y
«desactivar los exports» no hace nada: son declaraciones de función de nivel superior, así que
`window.eeX` existe aunque se borre la línea de export.

Una condición «que nunca sea true» sería un retroceso: hay que acordarse de invertirla el día
que vuelva la UI, mientras que la guarda por DOM revive sola. Es el criterio con el que ya se
cerró el gate del PDF. **Lo único real** es el orden: el paste de Eco Estrés se registra ANTES
que `imgPasteHandler`, así que al restaurar la UI hay que decidir el orden, no descubrirlo.

### Semgrep: 114 warnings y los 114 son ruido (triage 2026-09-09)
Re-triage completo. El conteo **nunca fue 146**. De 131 previos: 13 eran la regla
`ceibo-contador-objeto-literal-con-clave-de-dato` y se cerraron arreglando los contadores;
otros 4 desaparecieron al afinar `ceibo-xss-event-property-dynamic` (ver abajo). Quedan 114.

Los 114 restantes se reparten en dos reglas y **ninguno es real**:
- `ceibo-xss-innerhtml-concat` (69) — casi todos interpolan resultados numéricos
  (`toFixed`, `Math.round`, `.length`) o constantes de las tablas de referencia del propio
  archivo. Los que sí tocan dato de paciente pasan por `escHtml()` **una línea más abajo**,
  dentro de un `.map()`, y la regla es sintáctica: no lo ve.
- `ceibo-xss-inline-event-dynamic` (45) — en su mayoría `onclick="fn(${inf.id})"`. El `id` se
  sanea en el borde de `CeiboStore` y el test de regresión asserta que es `number` ≥9e14.

### `ceibo-xss-event-property-dynamic` — regla afinada (2026-09-09), 22/22 falsos positivos
Marcaba **cualquier** valor asignado a `onclick`/`onerror`/etc. Excluía la función inline
(`= function(){}`, `= ()=>`) pero **no la referencia con nombre**, que es la forma más común y
la correcta. Al medirla sobre la suite entera —no sólo EcoSmart— dio **22 de 22 falsos
positivos**: `canc.onclick = cerrar`, `img.onerror = reject`, `i.onload = ()=>res(i)`,
`$("mYes").onclick = null`. Penalizaba el idioma que uno quiere que se use, y hasta el de
limpiar un handler.

El riesgo real es asignar una **cadena**: eso el navegador lo compila. La regla ahora exige
que el valor sea literal de cadena, plantilla o concatenación. Es un estrechamiento puro: no
puede perder señal que la versión anterior tuviera.

**Verificado en las dos direcciones**, que es lo que hace falta para tocar una regla:
- *Negativo* — suite completa 1020 → 998, exactamente −22, y **ninguna otra regla se movió**
  ni apareció ningún hallazgo nuevo. EcoSmart 118 → 114.
- *Positivo* — un archivo de prueba con las dos familias: dispara en las 4 asignaciones de
  cadena (`= "alert(1)"`, `= "x(" + d + ")"`, `` = `alert(${d})` ``, `= "x"`) y en 0 de las 6
  formas correctas. Sin esta mitad, una regla que no marca nada parece perfecta.

El ruleset vive en `~/Desktop/APLICACIONES/.ceibomed-security/ceibomed-rules.yml` y **no está
bajo control de versiones**: APLICACIONES no es un repo y cada app tiene el suyo, así que ese
archivo no lo versiona nadie. Los cambios al ruleset no viajan en ningún commit.

Método usado, por si hay que repetirlo: mapear la línea del JS extraído a la del HTML
(`scan.py` concatena los `<script>`, así que los números NO coinciden), y después cruzar cada
hallazgo contra una ventana de 4 líneas buscando dato de paciente sin escape. Dio 2
sospechosos y los dos resultaron falsos: interpolaban `sev` y `color`, que son literales
asignados en las ramas de arriba. **No "arreglar" los 118 sin re-triagearlos.**

Verificado además que este trabajo no introdujo ninguno: 0 hallazgos sobre las 694 líneas
modificadas en los cinco commits de la auditoría.

### Contadores: `Object.create(null)` en los 12, no en cinco
Un contador `{}` con clave que viene del estudio se corrompe con las claves del prototipo.
Medido en el navegador con `['constructor','__proto__','valueOf','toString']`:

    literal {}            → {"constructor":"function Object() { [native code] }1", …}  y
                             **`__proto__` desaparece**: 3 claves donde deberían ser 4
    Object.create(null)   → {"constructor":1,"__proto__":1,"valueOf":1,"toString":1}

`(counts[k] || 0) + 1` sobre un literal devuelve el método heredado (truthy), lo concatena
como string, y `__proto__` ni siquiera crea propiedad: ese estudio se cae del conteo **en
silencio**. Si agregás un contador cuya clave salga de un estudio, `Object.create(null)`.

Y `MAPA[k] || 'Otro'` tiene el mismo agujero: con `k='constructor'` el `||` no cae al
fallback. Para eso está **`_lblDe(mapa, k)`**, que usa `hasOwnProperty`.

### Leer `campos[]` directo esquiva la resolución de alias
`_labFevi` resuelve `fevi | fevi_simpson` y `_labGls` resuelve `sgl | gls_global`. Tres
lugares leían la clave cruda y **los estudios importados se caían de la estadística sin
avisar**. Medido sobre una cohorte de 4 con la mitad en formato alias: la distribución de FEVI
del dashboard veía **2 de 4**.

Trampa al migrar: `numCampo` usa `v ? …`, así que un FEVI de `"0"` da null; `_labNum` usa
`String(v).trim() !== ''`, así que da 0. Y si el filtro era `!isNaN(v)`, hay que cambiarlo a
`!== null`, porque **`isNaN(null)` es `false`** y los ausentes pasarían el filtro sumando como
cero. Es el mismo tropiezo que ya nos costó el filtro de FEVI del Laboratorio.

**Queda a propósito sin migrar** `antec()` del módulo de asociaciones (~31231): usa regex
ancladas (`/^HTA$/`) sobre los elementos del array. `_labArrCol` devuelve el array unido por
`' | '`, así que la ancla dejaría de matchear; y usar el texto libre legacy como si fuera un
elemento convertiría «no sé» en «No», que en una tabla de chi² es un falso negativo. Hoy
devuelve `null` para los legacy, o sea que quedan fuera del denominador — que es lo correcto.

### Código muerto: 30 funciones, ninguna se borró
Documentado para que nadie las "arregle" ni las dé por vivas. **No borrarlas sin leer esto.**

- **Cluster Eco Estrés (14)** — `eeBullPdfTog`, `eeCalcCFVR`, `eeEcgChosen`, `eeEvalCFVR`,
  `eeEvalEE`, `eeEvalPSAP`, `eeImgChosen`, `eeOnShow`, `eeProtoMode`, `eeResetBull`,
  `eeSwitchBullTab`, `eeSwitchTab`, `eeToggleStep`, `eeUpdateResult`, más
  `generarInformeEcoEstres`. Muertas porque la interfaz se retiró; se conservan para cuando
  vuelva.
- **Diagrama de segmentos del ETE (3)** — `toggleSegmento`, `resetDiagrama`,
  `updateProyeccion`. Necesitan `id="seg-A1"`, que no existe.
- **El QR está desconectado de punta a punta (4)** — `eeStudyUrl`, `eeQrDataURL`,
  `eeQrEnabled`, `cfgToggleQr`, y **tampoco existe la casilla `#cfg-qr`**. Un comentario mío
  anterior afirmaba que la casilla seguía en Config: era falso, ya está corregido en el
  código.
- **Sueltas (9)** — `_coPuntos`, `_csvCell`, `actualizarBtnComparativo`,
  `calcPISA` (es un alias de una línea a `calcIM_ESC`), `ecoCentroBtn`, `ecoMedToggle`,
  `eteSetModo`, `ptpCad`, `saveCentroLabel`, `selPatron`, `valvSevReset`.
- **Constantes sin uso (3)** — `CHUNK_SIZE`, `CHUNK_KEY` (restos del troceado de
  localStorage) y `SGL_ESCALA`.

`valvSevReset` merece una nota: parece un reseteo que falta llamar, pero **no lo es** —
`valvSevConfirmada` sí se resetea en `limpiarCampos`, `editarInforme` y `cargarEstudioPorId`.
Es un envoltorio redundante, no un bug.

Cuidado con el método: contar apariciones y restar declaraciones **da falsos muertos**. Los
`toggleContrDifusa` / `Multiple` / `DisqSep` aparecían como muertos y se llaman desde `onclick`
inline en el HTML. Y hay funciones invocadas por nombre desde listas
(`['calcAI','calcAo',…].forEach(f => window[f]())`) que ningún grep de llamada directa
encuentra. Verificar las dos cosas antes de declarar algo muerto.

### `requestAnimationFrame` no dispara con la pestaña oculta — y eso colgaba el PDF
`labGenerarPDF` no llegaba nunca a `doc.save()`. **No era un artefacto del preview headless**,
que es lo que yo había supuesto y anotado como deuda: es un bug de producción.

`_labChartImg` y `_labPieImg` resolvían su promesa **dentro de un `requestAnimationFrame`
anidado**. Con `document.hidden === true` el rAF no se estrangula: **no dispara**. Medido: ni
el simple ni el anidado en 2 s; `setTimeout` sí. Como `labGenerarPDF` las espera, la promesa
quedaba pendiente para siempre — sin error, sin aviso y sin PDF.

**El caso de producción no requiere nada raro:** el médico aprieta «Generar PDF de auditoría»
—que tarda ~13 s con 12 estudios— y se va a otra pestaña mientras espera. `document.hidden`
pasa a true, el rAF deja de disparar y al volver no hay nada. La pantalla se ve igual que si
no hubiera apretado el botón.

El arreglo es **`_trasPintar(cb)`**: doble rAF (rápido y garantiza el cuadro cuando la pestaña
está visible) con un `setTimeout(120)` de respaldo, ejecutando una sola vez gane quien gane.
Con `animation:false` Chart.js ya pintó de forma síncrona en el constructor, así que el
respaldo nunca captura un canvas a medio dibujar.

Este archivo YA había tropezado con esto en `pdfPlantillaIr` y lo dejó anotado ahí; las dos
funciones de gráfica se salvaron de esa pasada. **Si una promesa depende de un rAF, tiene que
tener respaldo.** `animate()` del fonocardiograma sigue con rAF a propósito: es una animación
visual y que no corra oculta es lo correcto.

Medición, con 12 estudios y la pestaña oculta:

    HEAD          → no termina; `doc.save()` nunca se llama
    con el fix    → 6 páginas, 67 KB, 16 imágenes, 12 secciones, ~13 s

Tres corridas seguidas en la misma página: 12,6 s · 13,0 s · **90 s**. La tercera no se cuelga
—termina, con sus 6 páginas—: es el estrangulamiento agresivo de timers que Chrome aplica a
una página oculta desde hace rato (un `setTimeout(120)` pasa a tardar 620 ms). Es del entorno,
no del código; con la pestaña visible gana el rAF y no se nota. **Ojo al medir: yo di la
tercera corrida por colgada dos veces por no esperar lo suficiente.** Antes de declarar un
cuelgue, confirmar que el reloj no está estrangulado.

### `estudioId`: migración perezosa derivada del `id`, no del contenido
Los estudios anteriores al campo —y todo lo que entró por Excel o DICOM antes de que esas
vías lo acuñaran— quedaban sin `estudioId` para siempre. Ahora `_sanearIds` lo asigna al leer,
igual que el uuid: sólo si falta, jamás pisa uno existente.

**No se acuña con `_nuevoEstudioId()`** (Date.now()+azar) por dos razones del borde:
`_sanearIds` corre por separado sobre `_local` y `_chunk`, donde el mismo estudio vive
legítimamente en los dos; y asigna EN MEMORIA, así que un valor aleatorio muere con la pestaña
si el arranque no persiste — que es el problema que obligó a `_uuidAsignados` a forzar una
escritura.

**Se deriva del `id` ya saneado, no de `_idReparado(r)`.** Mi primera versión hasheaba el
contenido otra vez y el comentario afirmaba que una colisión «no agrega un modo de fallo
nuevo». Era falso, y el contraejemplo estaba 40 líneas más arriba en el mismo bucle: para el
`id` la colisión se resuelve por **sondeo** (`while (vistos.has(n))`), así que dos registros
con la misma tupla salen con ids distintos. Rehashear se salteaba ese sondeo y los dejaba como
dos estudios compartiendo un solo `estudioId`. Reproducido: dos registros de tupla idéntica
daban los dos `mig-901ofg74yb`; ahora dan `...yb` y `...yc`.

No era teórico: antes de `2b95740` el import JSON en modo «todos» no acuñaba `estudioId` y
`fecha_guardado` viene del archivo, no del reloj, así que reimportar el mismo backup dejaba dos
registros con tupla idéntica y sin el campo. El médico corrige la copia #2, firma, y el QR de
ese PDF abría la copia #1 sin corregir.

**`_idReparado` es ahora FORMATO DE CABLE.** Cambiarle la tupla o el hash reasigna en silencio
el `estudioId` de cada estudio migrado y mata el QR de todos los PDF ya impresos desde ellos.

### `String(v)` lanza, y en `_sanearIds` eso se lleva 12.500 líneas
`String({toString:null})` tira `TypeError` —`toString` no invocable, `valueOf` heredado
devuelve el objeto, ToPrimitive falla— y `JSON.parse` produce exactamente eso. `_idReparado`
hacía cuatro `String()` sin red.

Acá una excepción no se pierde en una tarjeta: `_sanearIds` corre como sentencia de nivel
superior **dentro del IIFE de CeiboStore**, sin try/catch, así que el throw impide que
`const CeiboStore` se inicialice y se lleva el resto del bloque. Es el síntoma que este archivo
ya documenta dos veces: **DOM completo y todo el JS `undefined`** — el médico ve la app entera
y ningún estudio.

El modelo de amenaza no es hipotético y ya está documentado en el propio borde: la app se abre
con doble clic (`file://`), varios navegadores comparten origen entre archivos locales, y la
base `ceibomed` la comparte toda la suite. Y **la migración del estudioId amplió el disparador**:
antes `_idReparado` sólo corría con un `id` inválido; ahora corre para el 100 % de una base
vieja. Cerrado con `_str()`, que envuelve el `String()` en try/catch. Verificado sembrando
`{"toString":null}` con un id válido: CeiboStore vivo y los dos estudios legibles.

### Arreglar la copia del PDF y dejar la del dashboard es la trampa al revés
El análisis acumulado de los 8 commits encontró que la auditoría había migrado **sólo la copia
que se imprime** de tres lógicas duplicadas, dejando rancia la que el médico mira:

- **Hallazgos frecuentes** vivía dos veces. Migré el PDF a `_labMenciona` y el dashboard quedó
  con `.test()` crudo. Medido sobre la cohorte de la reproducción —dos estudios diciendo «se
  descarta HTP» y uno con HTP real—: el Laboratorio mostraba **n=3** y el PDF firmado imprimía
  **n=1**, mismo período, misma cohorte. Ahora hay una sola lista (`_LAB_HALLAZGOS`) y una
  sola cuenta (`_labHallazgosCuenta`); los dos llamadores le agregan su presentación.
- **El subtítulo de valvulopatías del dashboard.** `_labValvChartCfg` la comparten pantalla y
  PDF; al cambiar el reparto a base por válvula actualicé sólo el subtítulo del PDF. La
  pantalla siguió anunciando «% sobre total (n=<todos>)» sobre barras que ya no dividían por
  eso — y como la barra imprime el n crudo adentro, se leía «n=1 · 50 %» bajo ese cartel.
- **`DIAST` del módulo de asociaciones** era una TERCERA copia de la clasificación diastólica.
  «no hay patrón restrictivo» matcheaba `restrictiv` y clasificaba grado III —la categoría más
  severa— en las cuatro chi² contra HTA, DM, FA y sexo. Y discrepaba de `_labDiastGrado`: el
  mismo estudio era «Sin disfunción» en una pantalla y «III» en la otra. Ahora delega.

**Y el conteo de sitios que yo mismo documenté estaba mal.** Escribí «tres lugares leían la
clave cruda» y migré tres; el cuarto era `labCompararRender`, que además usaba el `numCampo`
con `v ? …` —o sea un `fevi:"0"` daba null—. Su «% con GLS» es un indicador de completitud del
laboratorio y subdeclaraba. **Antes de escribir «son N sitios», contarlos con grep.**

### Los filtros de Guardados definen la cohorte del PDF firmado
`aplicarFiltros` y `_tieneValv` cruzaban texto libre con `.includes()`/`.test()` crudos, así
que filtrar «Diastólica: Grado III» arrastraba los informes que dicen «sin patrón restrictivo».
No es cosmético: **el filtro define el denominador de todo el informe de auditoría**, incluidos
los denominadores que esta misma auditoría acaba de arreglar. Pasaron por `_labMenciona` vía
`_algunaMencion`, que escapa los metacaracteres porque las palabras vienen de mapas legibles.

### Dependencias entre bloques `<script>`: usar `window` y respaldo
`diastGrade` (bloque del modal de evolución) referenciaba `UMBRAL_LAVI_DILATADO` pelado, siendo
un `const` del bloque de CeiboStore. Funciona, pero ese módulo protege sus otras dependencias
cruzadas (`typeof escHtml === 'function'`) y ésta no: si el bloque grande deja de parsear —ya
pasó dos veces— antes había un `34` literal que seguía andando y ahora sería `ReferenceError`.
Pasó a `window.UMBRAL_LAVI_DILATADO` con respaldo, como el resto.

### `PF()` devuelve NaN, y `NaN != null`: el guard «¿hay dato?» falla ABIERTO
Ductus y coartación (2026-09-10) nacieron con `const nv = id => PF(el.value)`. `PF('')` es
`NaN`, `NaN == null` es **false**, así que `hayDato` daba `true` con el formulario en blanco y
la app afirmaba «Ductus pequeño restrictivo sin repercusión hemodinámica» y «Coartación de
aorta sin gradiente significativo» en pantalla **y en el informe firmado**, sobre un paciente
al que nadie le había cargado nada. Los `if (!c) return;` de los dos emisores eran código
muerto que se leía como una guarda.
**El helper canónico es `v(id)`** (línea ~11468): hace el `isNaN(n) ? null : n` que `PF` no
hace. `PF` es sólo el parseo tolerante a la coma decimal — no es un lector de campo.
Al revisar cualquier módulo nuevo: buscar `PF(` fuera de `v()` y comprobar contra qué se
compara el resultado. Contra `null` está mal siempre.

### Descartar un valor fuera de rango también falla abierto si la cascada termina negando
Corolario del anterior, encontrado en el `/differential-review` de la misma tanda. Poner una
banda de plausibilidad y devolver `null` fuera de ella **no alcanza**: si la última rama de la
cascada es una afirmación —«sin repercusión hemodinámica», «sin gradiente significativo»—, el
valor descartado cae ahí y *«no pude leer esto»* se publica como *«esto es normal»*.
El caso real es la unidad: una Vmax en cm/s (300 en vez de 3,0) da un gradiente de 360.000, se
descarta por banda, y el informe firmado salía diciendo «sin gradiente significativo —
seguimiento clínico» **con «Gradiente máximo estimado 360000 mmHg» impreso dos renglones más
arriba**. Un error de tipeo invertía la conducta, y hacia el lado benigno.
El patrón correcto ya estaba en el archivo: `eteQpQs()` descarta fuera de 0,2–10 **y**
`eteQpQsMotivo()` existe para que «falta el dato» y «el número es imposible» no se vean
iguales. Ahora `dapConclusion`/`coaConclusion` anotan lo que quedó fuera de escala en `fuera[]`
y eso corta la cascada antes de las ramas benignas (`clave:'no_interpretable'`).
Tercera cara del mismo problema: **una negación necesita que se haya medido algo**. «Sin
gradiente significativo» sobre un estudio donde nadie midió un gradiente es una afirmación sin
respaldo; hoy devuelve `clave:'incompleto'`.

### Un checkbox no puede afirmar una ausencia
`coa_diast_anterogrado` desmarcado significa las dos cosas a la vez —«lo interrogué y no está»
y «no lo interrogué»— y su estado de fábrica es desmarcado por las tres vías (`limpiarCampos`,
reimpresión, import de Excel sin la columna). El párrafo imprimía
`cola ? 'presente' : 'Sin flujo diastólico anterógrado'` **incondicionalmente** — era el único
`push` sin guarda de los dos módulos. Ahora sólo se afirma la presencia.
Si algún día hace falta registrar el «lo busqué y no está», va como `<select>` de tres estados,
que es lo que ya hace `sv('oai_trombo')`.

### Un dato global no se le atribuye a la sección que lo pide prestado
`psap_calc` (PAPs por IT del estudio) y `eteQpQs()` (flujo global TSVI/TSVD) no dicen **por qué
defecto** pasan. Prestárselos al ductus sin recaudo hacía que un paciente con IM severa y PSAP
62 al que se le veía un ductus de 2 mm terminara con «evaluar operabilidad antes de indicar
cierre» **en el EN SUMA**. Hoy: la PSAP se presta sólo si el ductus es `no_restrictivo` o mide
≥3 mm, y el Qp/Qs se ignora si hay una CIA/CIV cargada. Es el mismo defecto que ya se cerró en
TAVI con el PHT de la IA nativa.

### MCH — especificación verificada del score, pendiente de implementar

Acordado con Maicol el 2026-09-10, antes de escribir la sección. Se registra acá porque la
implementación va dos etapas más adelante y la fórmula **no se puede reconstruir de memoria**.

**Fórmula HCM Risk-SCD (ESC, O'Mahony 2014) — verificada coeficiente por coeficiente:**

```
riesgo a 5 años = 1 − 0.998^exp(PI)
PI =  0.15939858 × espesor máximo (mm)
    − 0.00294271 × espesor máximo² (mm²)
    + 0.0259082  × diámetro AP de aurícula izquierda (mm)
    + 0.00446131 × gradiente TSVI máximo (mmHg)
    + 0.4583082  × historia familiar de muerte súbita (0/1)
    + 0.82639195 × TVNS (0/1)
    + 0.71650361 × síncope inexplicado (0/1)
    − 0.01799934 × edad en la evaluación (años)
```
Bandas: <4 % bajo (DAI no indicado de rutina) · 4-6 % intermedio (IIb) · >6 % alto (IIa).

**El campo de aurícula es `ai_diam` («Diámetro AP (mm)», tab AI/VI), NO `lars` ni el LAVI.**
La nota original decía «LAVI (ml/m²) — sincronizar con `lars`», y son tres magnitudes
distintas: `lars` es strain de reservorio en **%** y alimenta `calcDiastol`. El coeficiente
está calibrado sobre milímetros. Medido: espesor 25 mm, gradiente 60, familiar sí, 40 años →
con `ai_diam`=48 da **5,80 % (intermedio, DAI IIb)** y con `lars`=25 da **3,24 % (bajo, no
indicado)**. Cruza la banda. En un segundo caso el número cae de 15,94 % a 7,30 %.

**Exclusiones del modelo — son compuertas, no factores.** El HCM Risk-SCD no está validado en:
menores de 16 años · atletas · fenocopias metabólicas o infiltrativas (Fabry, **amiloidosis** —
y esta app tiene módulo propio de amiloidosis, así que el caso es alcanzable) · HCM sindrómica ·
parada cardíaca o TV sostenida previa (ya son prevención secundaria: el DAI está indicado con
independencia del score) · post-miectomía o post-alcoholización septal. Sin estas guardas el
número sale igual y no se puede usar.

**Factores mayores AHA/ACC 2020** (para el cálculo paralelo): historia familiar de muerte
súbita por MCH · espesor ≥30 mm · síncope inexplicado · TVNS · aneurisma apical ·
**disfunción sistólica del VI (FEVI <50 %)** · realce tardío extenso por RMN. La
**respuesta tensional anormal al ejercicio NO figura** en la lista de 2020 (venía de
iteraciones anteriores), y la FEVI sí — la app ya tiene el campo.

**Decisiones tomadas por Maicol el 2026-09-10, para no re-litigarlas al implementar:**

1. **Los siete de la AHA/ACC 2020 cuentan; la respuesta tensional va aparte.** Se registra como
   campo propio, el informe la menciona y NO suma al conteo, con la aclaración literal:
   «Factor de riesgo reconocido en guías previas, no incluido en el conteo AHA/ACC 2020».
2. **Las exclusiones son compuertas:** si alguna está marcada, no se muestra el porcentaje y se
   nombra cuál lo impide. Con parada cardíaca o TV sostenida previa, además, aclarar que el DAI
   está indicado con independencia del score. La amiloidosis se deriva del módulo propio de la
   app si está cargado, en vez de preguntarse otra vez.
3. **Los cuatro campos que no están en ningún modelo** —HTA resistente, crecimiento anual del
   espesor, deseo de embarazo y talla— entran como contexto: el médico los marca si los tiene,
   **no suman a ningún score**, y el informe los menciona como «factores adicionales
   considerados». *(Ojo: la selección de la pregunta decía «sólo el deseo de embarazo» y el
   texto de la respuesta decía los cuatro; se tomó el texto, que traía la redacción decidida.
   Confirmar antes de escribir la sección.)*
4. **Los dos scores se muestran lado a lado**, cada uno con su guía y su clase: `ESC 2022: X % a
   5 años — Clase X` · `AHA 2020: N factores mayores — Clase X`, y la nota de que la AHA incluye
   la fibrosis por RMN, que el ecocardiograma no evalúa.
5. **Si faltan campos del score de la ESC, no se muestra el número**: se listan cuáles faltan.
   Es el mismo criterio que ya rige en FOP con el ACV y en VAB con el riesgo quirúrgico.

### MCH — lo que quedó implementado distinto de la decisión, y por qué

- **La fenocopia NO se deriva del módulo de amiloidosis**, aunque la decisión 2 decía derivarla.
  Que ese módulo tenga datos significa que la amiloidosis se está **evaluando**, que es lo
  contrario de que esté confirmada: se usa justamente para descartarla. Derivar una exclusión de
  «alguien miró» sería inventar un diagnóstico. Lo que sí se hace es avisar: si el módulo tiene
  datos y la pregunta quedó sin contestar, la lista de pendientes lo dice con todas las letras.
- **Las exclusiones sin contestar no bloquean el número**, lo declaran. Bloquear pediría contestar
  seis desplegables antes de ver nada. La aplicabilidad no verificada viaja en las dos superficies
  —cuerpo y EN SUMA— y el manual y la ayuda en pantalla lo dicen. La asimetría con los tres
  binarios del score es deliberada: aquellos entran en la ecuación y un «no consta» tratado como 0
  cambia el número; una exclusión sin contestar no cambia el número, cambia si el número
  corresponde.

### Dos deudas cerradas el 2026-09-10

- **`cargarEstudioPorId` ahora llama a `limpiarCampos(true)`.** Era la última de las tres rutas
  de restauración que no limpiaba antes de poblar, y el bucle sólo pisa las claves que el estudio
  TRAE. Reproducido antes de arreglarlo: con un paciente en pantalla y abriendo por `?estudio=`
  un importado de Excel, la pantalla quedaba con el NOMBRE del estudio nuevo y la coartación, la
  bicúspide, el espesor de la miocardiopatía y las notas clínicas del anterior, más la casilla
  «✓ Integrado al informe» tildada. El PDF de ese paciente salía con «indicación de intervención
  según ESC 2020» por una coartación de otra persona.
  `limpiarCampos` acepta ahora un parámetro `silencioso`: el toast «Formulario limpiado» es
  correcto cuando el médico aprieta «Nuevo estudio» y es ruido cuando la limpieza es un paso
  interno de cargar otro estudio.
- **`_IG_SECTIONS` conoce las once secciones de Congénitas.** El renderer aprendió `f.map`, que
  traduce el TOKEN guardado (`t1rl`, `sept_ant`) a su etiqueta: sin eso «Ver detalle» habría
  mostrado los tokens crudos. Un token que no está en el mapa se OMITE en vez de imprimirse, y
  `no_eval` se omite a propósito —esta vista resume lo que se encontró y llenarla de «No consta»
  la vuelve ilegible—. El renderer ya salteaba las secciones sin campos, así que un paciente con
  sólo una coartación ve una tarjeta y no once.

### Taquicardia ventricular unificada — 2026-09-10

La TV vivía en tres campos sin relación: `mch_tvns` (binario, variable del HCM Risk-SCD con
coeficiente 0,826), `tdf_tv` (binario, criterio ESC 2020 de reintervención en Fallot) y tres
casillas de MCA marcadas a mano. Un «Sí» en uno y un blanco en otro daba un informe firmado que
se contestaba distinto tres veces sobre el mismo paciente.

Ahora hay un bloque compartido —`tv_documentada`, `tv_tipo`, `tv_morfologia`, `tv_ev24h`— y
`tvEstado()` es la única fuente. Los tres campos viejos quedaron como ESPEJOS que escribe
`tvSync()`; ninguna lógica los lee.

**Decisiones tomadas (las tres del médico, 2026-09-10):**
1. **Criterio MAYOR de MCA: sólo TV sostenida.** Es MÁS EXIGENTE que el Task Force 2010, que
   dice *«non-sustained **or** sustained VT of left bundle branch morphology with superior axis»*
   y las cuenta a las dos. La TVNS de eje superior baja a menor. Como el puntaje se imprime
   rotulado «Task Force 2010», **el informe declara la divergencia con todas las letras** —en el
   cuerpo por `tvEstado().notas` y en el EN SUMA por `resumenF`—. Un número con el nombre de una
   guía calculado con otra regla y sin avisar es una cita falsa.
2. **Eje INFERIOR y eje no determinado: criterio MENOR, no cero.** Acá se siguió el Task Force
   contra el pedido original, que los ponía en 0 puntos. El texto los incluye explícitamente.
3. **Una TV sostenida NO se traduce a `mch_tvns='si'`.** La variable del modelo es «TVNS», y una
   TV sostenida es otra cosa: es una EXCLUSIÓN del HCM Risk-SCD, que no está validado en
   prevención secundaria. La app AVISA y no marca `mch_ex_parada` sola, porque esa pregunta es
   por un ANTECEDENTE y la TV de este estudio puede ser el episodio índice.

**El bloque compartido rompió invariantes que el archivo ya tenía escritas.** Un campo que era
propio de una sección pasó a ser global, y con eso heredó los tres problemas de los globales:

- **Un campo compartido no despierta una sección.** `tdf_tv` estaba en el `hayDato` de Fallot;
  al volverse compartido, cualquier paciente con una TV documentada y ninguna cardiopatía
  congénita veía «Tetralogía de Fallot reparada» en el panel. Lo mismo con la categoría V en
  MCA: 800 extrasístoles —que el bloque pide con independencia de la TV— afirmaban
  «Miocardiopatía arritmogénica … Task Force 2010: 1 punto». Los dos salieron de su `hayDato`.
  Es la misma regla que ya aplicaban `tga_*` con `dil`, `mcaConclusion` con `vi.hay` y
  `tdfConclusion` con `ip_grado`.
- **Un espejo no cuenta como «esta sección tiene datos».** `secAutoOpen` excluye espejos con
  `:not([readonly])`, y eso NO alcanzaba: `mch_tvns`/`tdf_tv` son `<select disabled>` —el
  selector toma todos los select— y `mca_v_*` son inputs ocultos sin readonly. Contestar «No»
  en «TV documentada» abría solos los acordeones de MCH y de Fallot. Se agregó `[data-espejo]`
  al selector y el atributo a los cinco espejos.
- **Un badge sin casilla de inclusión no lo apaga nadie.** `tv_badge` sobrevivía a «Nuevo
  estudio»: `eteInclSync` apaga los otros catorce por su `*_incluir_chk`, y el barrido
  `[id$="-badge"]` de `limpiarCampos` no lo ve porque el id lleva guion BAJO. `tvSync` entró a
  la lista de repintado de `eteShuntTaviReset`.

**Un derivado no se importa.** Los cinco espejos entraron a `LAB_XLS_SOLO_EXPORT`. Una planilla
cuya única columna de MCA fuera «MCA TV eje superior = Sí» encendía la casilla de inclusión de
la sección —el badge decía «✓ Integrado al informe»— y después `tvSync` borraba el espejo, la
sección puntuaba cero y `mcaConclusion` devolvía `null`: badge encendido sobre un informe sin la
sección. Con más columnas era peor: «Task Force 2010: 2 puntos» sobre una fila que sostenía 4.

**La migración no puede poner en cero, en silencio, algo que está en un PDF firmado.** La
primera versión de `_migrarCamposLegacy` sólo miraba `mch_tvns`/`tdf_tv`, y el caso NORMAL de
un paciente evaluado por MCA —criterio marcado a mano, esos dos vacíos porque nadie abre esos
acordeones para registrar una arritmia— no matcheaba ninguna rama: 4 puntos («definitivo») se
reimprimían como 2 («posible») sin una sola nota, y `tvSync` después escribía `''` sobre los
espejos, así que al guardar la pérdida se persistía. Ahora lee también `mca_v_*`.
Y el «no» NO se ensancha: `tdf_tv='no'` decía «no hubo TV» y se traduce; `mch_tvns='no'` decía
«no hubo TV NO SOSTENIDA», que no niega una sostenida, y traducirlo sería el mismo error de tipo
que este bloque vino a cerrar. El recuento de extrasístoles de un `mca_v_men2` legado es
irrecuperable —la casilla existía, el número no— y por eso hay `tv_legacy_ev`, que hace que el
informe lo PIDA en vez de callarlo.

**Un rótulo tiene que describir todo lo que el campo carga.** `mca_v_men1` pasó a llevar dos
hechos (eje inferior/no determinado, y eje superior no sostenida por la regla más exigente) y
su etiqueta seguía diciendo sólo «eje inferior»: «Ver detalle» mostraba «Morfología: BRI eje
superior» y tres filas abajo «Arritmias — menor (TV con BRI y eje **inferior**): Sí», y el Excel
traía las dos afirmaciones en la MISMA fila. Se renombró a «criterio menor por morfología».

**Defecto preexistente cerrado de paso.** `tdfConclusion` afirmaba «taquicardia ventricular
**sostenida** documentada» a partir de un binario que no distinguía el tipo, y sobre eso sostenía
una indicación Clase IIa de recambio valvular pulmonar. Ahora el tipo viene del bloque
compartido; sin tipo cargado no se afirma nada, se pide el dato. Además la salvedad salió de la
rama `ipSevera || obstrModerada` —la única que arma `criterios[]`—: por las otras tres el cuerpo
describía la TV y dos oraciones después decía «sin criterios de reintervención» sin decir por
qué. Cuidado con el texto por rama: en `reintervencion_i` la obstrucción SÍ está presente, así
que la frase «no están presentes en este estudio» sería falsa ahí y tiene su propia rama.

**El recuento de EV se cuenta con enteros.** Los `input type=number` de esta app se convierten en
runtime a `text` con `inputmode="decimal"`, así que `step="1"` no restringe nada: un «500,5»
llegaba como 500.5, que es `> 500` y encendía el criterio menor sobre medio latido.

### Los dos algoritmos de MCH, verificados contra la fuente — 2026-09-10 (tarde)

Se verificó la AHA/ACC 2020 (Ommen, *Circulation* 2020;142:e558, §7.2), su actualización 2024
(*JACC*, DOI 10.1016/j.jacc.2024.02.014), la ESC 2023 (Arbelo, *EHJ* 2023;44:3503, Tabla 23 y
Fig. 16) y la ESC 2014 (Elliott, *EHJ* 2014;35:2733, §9.5.2 — la **única** que publica la fórmula
con unidades). Salieron **dos defectos clínicos preexistentes**:

- **`mchAHA` contaba SIETE factores mayores y son CINCO.** La rec. 3 (COR 2a) enumera: muerte
  súbita familiar, HVI ≥30 mm, síncope reciente, aneurisma apical y FEVI <50 %. **La TVNS y el
  realce tardío extenso NO son mayores**: comparten la rec. 6, que es **COR 2b**. Un paciente
  cuyo único hallazgo era una TVNS salía con «1 factor mayor — desfibrilador razonable (Clase
  IIa)». Subir una clase es cambiar la conducta.
- **Un solo campo de muerte súbita familiar alimentaba TRES umbrales incompatibles.** Task Force
  <35, ESC <40 (o cualquier edad si el familiar tenía MCH establecida), AHA ≤50. La ESC y la AHA
  leían el binario **sin mirar la edad**, así que una muerte a los 60 entraba como «Sí» en los
  dos. Ahora hay `mchFamMS()`, `mch_fam_ms_mch`, y el informe explica por qué un mismo hecho
  cuenta en un algoritmo y no en el otro.

**Lo que la verificación desmintió del pedido, y hay que recordar para no reintroducirlo:**
- La caja **«SCD risk modifiers»** (obstrucción del TSVI, realce tardío, aneurisma apical,
  mutaciones múltiples) es de la guía **ACCF/AHA 2011**, §6.3.1.2. La palabra «modifier» aparece
  **cero veces** en la de 2020. En 2020 el aneurisma ascendió a factor mayor, el realce quedó como
  árbitro IIb, y la obstrucción desapareció del esquema de riesgo.
- La **respuesta tensional anormal al ejercicio** la RETIRÓ la guía de 2020 («the removal of
  abnormal blood pressure response to exercise as a routine part of the SCD risk evaluation») y el
  HCM Risk-SCD nunca la incluyó. No va en ningún diagrama.
- Las **mutaciones sarcoméricas múltiples** no son factor de decisión en adultos: no figuran en el
  esquema AHA —en 2024 el genotipo entra a la Tabla 8 como factor **pediátrico**— y la ESC 2023
  §7.1.5.5 desaconseja usar las variantes sarcoméricas para guiar el implante en prevención
  primaria de riesgo bajo o intermedio. `mch_mult_mut` se registra por su valor en el tamizaje
  familiar, y el informe lo dice así.
- **AHA 2024 endureció el aneurisma apical:** exige «with transmural scar or LGE». Los diagramas
  siguen 2020, que es lo que cita el informe.
- El **diámetro de AI** del score es el **anteroposterior en mm**: la ESC 2023 (Tabla 19) dice
  expresamente que no hay datos sobre área ni volumen. Nada de strain.

**Los dos algoritmos dan indicaciones OPUESTAS en el mismo paciente**, y el panel lo declara en
una tabla de siete filas. La más grande: con aneurisma apical aislado, la AHA implanta (factor
mayor, IIa) y la ESC pide calcular el score igual y **no** decidir por el aneurisma solo (también
IIa, pero para hacerlo así). También divergen en FEVI <50 % (mayor vs IIb sólo en banda baja),
TVNS (árbitro IIb vs la variable de mayor coeficiente del score) y el corte familiar (50 vs 40).

**Un panel de referencia se GENERA desde las constantes que puntúan.** El de MCA sale de
`MCA_CATS` y `MCA_UMBRAL`; los umbrales de la categoría I se extrajeron a esa constante para que
scorer y panel no puedan divergir. Dos trampas que igual aparecieron y hay que vigilar:
- **No derivar un borde con aritmética de enteros.** Imprimir «29-31» con `mayor - 1` reintroduce
  la deriva dentro de la misma expresión que dice evitarla: los campos son decimales y en runtime
  pasan a `text`, así que un 31,5 puntúa como menor mientras el panel dice que termina en 31. Se
  imprime el mismo operador que aplica el código: «≥29 y <32».
- **Una banda no puede compartir el borde con la siguiente.** «4 – 6 %» ponía el 6 en las dos
  cajas; el código corta en `pct < 6`, y ahí la diferencia entre IIa y IIb es un implante.

**Un desplegable nuevo agrega un estado, no dos.** `mch_fam_ms_mch` tiene cuatro valores (`''`,
`no_eval`, `no`, `si`) y la primera versión sólo distinguía `si`: los otros tres colapsaban en «no
cumple», `fhx` los traducía a `'no'` —una negación EXPLÍCITA— y el score se publicaba sin el
término 0,4583. Medido: 5,80 % (intermedio, IIb) bajaba a **3,71 %** (bajo, «no indicado de
rutina»). Un desplegable que nadie miró cambiaba la conducta publicada.

**Una negación sobre preguntas sin contestar no es una negación.** La rec. 6 de la AHA es
expresamente para pacientes **sin** factores mayores; no haberlos evaluado no es haberlos
descartado, y si el que falta estuviera presente sería IIa. Por eso `clase` es `null` con
`pendientes > 0`, y las tres superficies —cuerpo, EN SUMA y panel— leen `aha.clase` en vez de
re-derivarla. Antes cada una decidía por su cuenta y ya habían dejado de coincidir: con los cinco
mayores en blanco y una TVNS, el cuerpo publicaba Clase IIb y el EN SUMA no la mencionaba.

**Una edad de cero pasaba las tres bandas.** `ed >= 0` en vez de `ed > 0` dejaba entrar el 0, que
cumple ≤50, <40 y <35 a la vez. La edad del PACIENTE ya exigía `> 0`; la del familiar no.

**El informe no puede cuantificar más que la pregunta.** El texto del árbitro decía «realce tardío
extenso (≥15 % de la masa del VI)» sobre un desplegable rotulado sólo «Realce tardío extenso»: un
«Sí» cualitativo se publicaba como si el médico hubiera consignado una medición, y esa frase es la
que sostiene la Clase IIb. El umbral se movió a la ETIQUETA del campo, que es donde cambia lo que
el «Sí» significa.

### Categoría V de MCA — vuelta al Task Force verbatim, 2026-09-10 (tarde)

Revierte la decisión 1 de la entrada de la mañana. El criterio MAYOR vuelve a ser «non-sustained
**or** sustained VT of left bundle branch morphology with superior axis»: el tipo NO cambia la
jerarquía, y tampoco la bloquea que falte. `tv_tipo` se sigue registrando porque lo necesitan las
otras dos secciones —el HCM Risk-SCD distingue la TVNS de la sostenida, que es una exclusión del
modelo, y la ESC 2020 en Fallot pide expresamente la sostenida— pero para MCA es información
clínica, no una entrada del puntaje. Con esto desapareció todo el aparato de declaración de
divergencia: `menorEjeSup`, las notas y las dos ramas de `resumenF`. El rótulo «Task Force 2010»
vuelve a corresponderse con la regla aplicada.

### EN SUMA de congénitas — línea concisa por sección, 2026-09-10 (noche)

**La premisa del pedido era falsa para 9 de las 12 secciones.** Medido antes de tocar nada: con
CoAo + VAB + MCH activas, las tres ya subían al EN SUMA. Lo que era cierto es otra cosa: CIA/CIV
nunca subía su conclusión (sólo un Qp/Qs suelto), el formato era el PÁRRAFO ENTERO —hasta 570
caracteres— y ductus/coartación/ventana/foramen estaban filtrados por `clave`.

**Política editorial nueva (decisión del médico):** el EN SUMA informa HALLAZGOS y CRITERIOS
DIAGNÓSTICOS, **nunca recomendaciones terapéuticas**. «Criterios de significación», no
«indicación de intervención»; el porcentaje del score y su banda, no la clase del desfibrilador.
Revierte lo que el emisor de la coartación tenía escrito —«dejar una indicación de intervención
sólo en el cuerpo es lo que la conclusión existe para evitar»—. Lo que la reemplaza no es el
silencio: la línea publica el CRITERIO que dispara la conducta, que es el hecho verificable.

**Un constructor por sección (`ccSumaLinea`), leyendo los mismos accesores que la conclusión.**
Recalcular sería una segunda derivación del mismo hecho.

**Dos defectos preexistentes que la auditoría destapó y se cerraron:**
- **El fallback negaba hallazgos que el propio informe describía.** `if (suma.length === 0)
  suma.push('Estudio sin alteraciones estructurales ni funcionales significativas.')` no
  distinguía «no hay hallazgos» de «los hallazgos no pasaron su filtro». Una CIA de 30 × 24 mm
  con borde de 2 mm, descrita en el cuerpo, salía en el EN SUMA como «sin alteraciones».
- **El único separador del informe era código muerto.** `inf.push('', ...etePars)` escribe una
  cadena vacía como separador y `inf.filter(Boolean)`, dos líneas después, la borra. Por eso el
  bloque lleva un RÓTULO —truthy, sobrevive al filtro— y no una línea en blanco.

**Trece defectos del propio diff, y el patrón que los une: una línea corta miente más fácil que
un párrafo.** El párrafo trae su contexto; la línea condensa y en el camino se comen las
salvedades. Los que hay que recordar:

- **Un id mal escrito falla en SILENCIO.** `ao_raiz` no existe —el real es `ao_sin`— y `v()`
  devuelve `null` para un elemento inexistente. El EN SUMA publicaba la ascendente de 44 mm
  mientras el cuerpo indicaba cirugía por una raíz de 54. Grepear el id antes de usarlo.
- **Un rótulo puede ser un diagnóstico.** `ebsConclusion` cambia el suyo a «Desplazamiento por
  debajo del umbral diagnóstico» y la línea escribía «Anomalía de Ebstein» fijo. Ídem FOP: con
  el contraste negativo el cuerpo abre con «Septum interauricular» y la línea decía «FOP». Se
  EXPONE el rótulo desde la conclusión en vez de recalcularlo.
- **Un número no se publica sin su compuerta.** El gradiente subaórtico de la TGA sólo se imprime
  con `tga_obstr_subaortica === 'si'`: sin eso, la línea publicaba 70 mmHg al lado de un cuerpo
  que decía «sin obstrucción subaórtica».
- **La compuerta de «dato principal» silenciaba lo más grave.** Eisenmenger de la ventana
  aortopulmonar se dispara con la DIRECCIÓN sola; la cola diastólica basta sola para una
  coartación significativa; el ACV criptogénico basta solo en el foramen. Las claves que importan
  pasan aunque falte la medida.
- **`espH.valor` es null fuera de banda; `espH.crudo` no.** Con `valor` en la compuerta, un
  espesor tipeado en cm borraba la sección entera del EN SUMA en vez de declarar el problema.
  Un valor ilegible bloquea la NEGACIÓN, no la afirmación.
- **CIA y CIV no tenían banda de plausibilidad en ninguna parte** —deuda ya declarada— y no
  importaba porque sus números no llegaban al EN SUMA. Ahora sí: una velocidad en cm/s publicaba
  «gradiente 360000 mmHg» en la conclusión firmada.
- **`MAPA[k] || k` volvió a colarse en once sitios.** Existe `_ccLbl` justamente para eso.
- **Una bandera tiene que probar lo que su nombre dice.** `_ccHuboParrafo` salía de
  `etePars.length`, que es el acumulador del bloque ETE ENTERO: un estudio normal con la aorta
  descrita por ETE ponía la bandera en true y el EN SUMA decía «sin OTRAS alteraciones — ver los
  hallazgos descritos en el cuerpo», implicando hallazgos que no existían. Se marca sección por
  sección.
- **Lo que viajaba en `resumen` y no en `txt` viajaba ahí a propósito.** MCH colgaba del resumen
  la aplicabilidad no verificada, la resonancia faltante y la TV sostenida; MCA, las salvedades
  de la categoría de arritmias; TdF, la TV sostenida. Ninguna es una conducta: las tres dicen si
  el número de arriba corresponde. Al reescribir la línea se perdieron todas y hubo que reponerlas.

**Medido:** 3 secciones activas → 325 caracteres, 5 líneas, **1 página**. Antes, las mismas tres
daban 542 caracteres de párrafos. Con 8 secciones son 742 caracteres y 2 páginas.

### Diapositiva de congénitas en el PPT — 2026-09-10 (noche)

Una fila «Hallazgos» y otra «Conclusión según guías» por sección incluida, entre la de ETE y el
informe narrativo. Los hallazgos son la MISMA línea que sube al EN SUMA (`ccSumaLinea`).

**El PPT es ahora el único consumidor de `<sec>Conclusion().resumen` en toda la app.** El cuerpo
del informe imprime `txt`; el EN SUMA pasó a `ccSumaLinea`. Cinco de las diez secciones no
devuelven `resumen` y ahí el `||` cae a `txt`. Una corrección clínica sobre `txt` **no le llega
sola** a la diapositiva, y el único lugar donde se vería la divergencia es el proyector.

**Doce secciones no entran en una diapositiva.** Medido: 8,64 pulgadas de contenido contra 3,96
disponibles — más del doble fuera del área visible, y PowerPoint no recorta: dibuja por debajo
del borde y la diapositiva se ve entera hasta que se proyecta. Se pagina, como ya hace el informe
narrativo, con contador «(1/3)» en el título. Once secciones dan tres diapositivas.

**Lecciones del PPT que costaron esta vez:**

- **`_pptAvisos` es un `const` LOCAL de `_pptDesdeFormulario`.** `window._pptAvisos` no existe, así
  que un test que lo lea siempre da vacío y parece que no hubo desbordamiento. Para verificar hay
  que **interceptar `toast`**. Ese falso negativo tapó un desbordamiento del doble del área útil.
- **El aviso de `_pptFsQueEntra` nombraba siempre «Parámetros ecocardiográficos».** Lo usan tres
  diapositivas distintas; con la de congénitas desbordada, el mensaje mandaba al médico a revisar
  una tabla que no tenía nada que ver. Ahora lleva parámetro `donde`.
- **`_pptFsQueEntra` y `tabla` tienen que compartir `colK`.** Si el estimador cuenta líneas sobre
  un ancho que el renderer no usa, la tabla sale por debajo del borde **sin ningún aviso**, porque
  el modelo dijo que entraba.
- **Repartir dos columnas por número de secciones o de filas no sirve.** Una MCH ocupa cuatro veces
  más que una ventana aortopulmonar. Se reparte por longitud de texto, que es lo que determina los
  renglones.
- **Crear la diapositiva antes de armar las filas deja diapositivas vacías.** `hayEte` es la unión
  de cuatro claves y una de ellas —`etem`— dejó de aportar filas cuando cada grupo pasó a consultar
  su propia compuerta: integrarla sola abría una diapositiva que afirmaba «Ecocardiograma
  Transesofágico» con el médico y el disclaimer al pie y nada en el medio. `nueva()` va DESPUÉS
  de `if (F.length)`.
- **Mudar contenido de una diapositiva a otra pierde lo que la nueva no pidió.** Al sacar CIA/CIV
  de ETE se perdieron el DDVI indexado y la PAPs por IT —las dos que dicen si el shunt repercutió—
  porque la línea del EN SUMA no las lleva. Y la compuerta del EN SUMA exige el TAMAÑO mientras el
  cuerpo del informe emite párrafo con el tipo o el borde solos: un informe que describía «CIA
  ostium secundum, shunt de izquierda a derecha, Qp/Qs 2,10» se quedaba sin diapositiva, con el
  informe abierto al lado del proyector.
- **Un grupo de filas tiene que consultar SU compuerta, no la unión.** «Válvula mitral», «Orejuela
  izquierda» y «Aorta torácica» se agregaban incondicionalmente: el médico retiraba el módulo de
  orejuela del informe —y la app le confirmaba «ya no sale en el informe»— y el PPT igual
  proyectaba «Trombo en orejuela» leído del DOM vivo.
- **`hdrTxt` se lee sin default** y el comentario de `PPT_TEMAS` enseña el patrón contrario. No es
  la única —`teal`, `txt`, `txt2`, `bg`, `rojo`, `fila1`, `fila2` también— pero es la que rompe más
  silenciosamente: un color de texto `undefined` no lanza, dibuja invisible.

**Verificado:** las seis paletas (ninguna omite una clave que la diapositiva lea; contraste mínimo
12,4:1 en el dato), 1 a 12 secciones, el reparto en dos columnas, la paginación con fuzz de 4.000
casos sin perder ni duplicar secciones, y que retirar un módulo del informe lo saca del PPT.

### BLOQUEANTE — los cinco grados valvulares nunca están vacíos (2026-09-10)

**Descubierto en la auditoría del Laboratorio y sin resolver.** Invalida todo el bloque de
valvulopatías en pantalla y en el PDF de auditoría, y contamina las asociaciones.

`im_grado`, `ia_grado` e `it_grado` son `<input type="hidden" value="0">`; `ea_grado` y
`em_grado` son `<select>` cuya primera opción es `value="sin"`. Como `guardarInforme` barre
`input[id], select[id], textarea[id]` de TODO el documento, **cada estudio guardado lleva los
cinco campos rellenos aunque nadie haya mirado la válvula**. Y `limpiarCampos` los repone.

Consecuencia: `_labRegurgSev` devuelve `'Sin'` —no `null`— para el valor de fábrica, así que
«estudios con esa válvula evaluada» **es idéntico a** «todos los estudios del período». El
subtítulo que el propio Laboratorio imprime se contradice a sí mismo:

> «Porcentajes sobre los estudios con esa válvula evaluada — el n de cada barra es su propio
> numerador, **no sobre los 118 del período**.»

y el `n` de la barra ES 118. En el PDF es peor porque el `n` se imprime como sello de confianza.

Es el mismo patrón que este archivo ya documentó para los checkboxes —«`__chk` presente ≠ el
médico decidió»— aplicado a un hidden numérico, y **neutraliza la corrección de denominadores
que CLAUDE.md daba por cerrada**: aquella asumió que la ausencia se vería como campo vacío.

**La corrección es un cambio del modelo de datos, no del Laboratorio:** los tres hidden tienen
que nacer `value=""` y la primera opción de los dos select ser `value=""` («— no evaluada —»),
con `'0'`/`'sin'` reservados para «la busqué y no está». Eso necesita migración de los estudios
guardados, que hoy no se pueden distinguir. Hasta entonces **ningún denominador por válvula es
interpretable**, y cualquier filtro de cohorte por AUSENCIA de valvulopatía incluiría en
silencio todos los estudios donde nadie miró.

**Impacto en lo pedido:** los filtros de valvulopatías del panel de cohorte (Tarea 2) y los
bloques de Ebstein/TdF/TGA de la subtab CC (Tarea 1) leen estos campos.

### Laboratorio — base para la subtab CC y el panel de cohorte (2026-09-10)

- **`pctOf(n, 0)` devolvía 0.** Una sección sin un solo estudio imprimía una distribución
  completa de «0 (0%)», con su gráfica de barras a cero al lado, y eso se lee como «lo medimos y
  dio cero». La corrección existía sólo en la mini-tabla de valvulopatías; las seis secciones
  hermanas del mismo PDF seguían con la distribución de ceros. Ahora `_labCel(n, tot)` resuelve
  el caso en un solo lugar y devuelve «— (sin datos)». 27 celdas migradas.
- **`labCompararRender` era la única subtab que leía `getInformes()` crudo.** Que ignore el
  PERÍODO es correcto —define sus propias fechas— pero así también ignoraba el filtro de CENTRO:
  el médico destildaba un centro, el encabezado decía «48 estudios» y esa pestaña comparaba
  sobre los 137 de todos los centros sin un cartel que lo dijera. Se partió la base en
  `_labFiltrarBase(todos, sinPeriodo)` con dos entradas: `labGetInformes()` y
  `labGetInformesSinPeriodo()`. **El filtro de centro —y la cohorte, cuando exista— son
  propiedades del PACIENTE, no de la ventana temporal, así que valen para cualquier rango.**
- **La ecuación del HCM Risk-SCD se extrajo a `_hcmRiskSCD(esp, ai, grad, edad, fhx, tvns, sinc)`.**
  El Laboratorio necesita el score sobre los `campos` de estudios guardados, donde no hay
  formulario que leer, y escribir los ocho coeficientes una segunda vez es la forma garantizada
  de que las dos copias diverjan sin que nadie lo note. Verificado: el caso trabajado da
  5,796378 % por los dos caminos.
- **Las bandas de plausibilidad van ADENTRO de la ecuación.** El modo de falla es traicionero:
  por el término cuadrático del espesor, un valor absurdo no da un número absurdo — `exp(pi)`
  colapsa a 0 y el resultado es **0 %**, un riesgo de muerte súbita de cero que pasa cualquier
  control de «¿es un porcentaje?». `mchScoreESC` bandeaba antes de llamar; el Laboratorio no
  tendría cómo.

**Arquitectura para el panel de cohorte:** `labGetInformes()` es el accesor único de las diez
subtabs estadísticas (11 call sites). La cohorte va DENTRO de `_labFiltrarBase` y las pestañas
la heredan sin tocarlas — igual que el período y el centro.

### Subtab «CC / Genéticas» del Laboratorio — 2026-09-11

Trece bloques sobre las doce secciones de la pestaña Congénitas. `labCCRender(infs, n)`.

**Tres tarjetas SE MUDARON desde Hemodinámica** —CIA/CIV, Qp/Qs y bordes de la CIA— con su
markup y su código. Quedaban ahí desde antes de que la sección se mudara a la pestaña
«🧬 Congénitas» del paciente; con las dos, la misma estadística viviría dos veces en el mismo
Laboratorio calculada por dos caminos. Es el tercer lugar donde CIA/CIV se mudó por el mismo
motivo, después de la pestaña del paciente y de la diapositiva de ETE del PPT.

**Los predicados de pertenencia ya existían** dentro de `labHemoRender`, razonados y comentados.
Se mudaron en vez de reescribirse.

**Decisiones del médico (2026-09-11):** los grados ordinales van como DISTRIBUCIÓN, nunca como
promedio —leve=1 y severa=4 no dan «moderada»=2,5, la escala no es una magnitud—; y los filtros
de valvulopatías se construyen sobre el modelo de datos actual, con la salvedad visible.

**Once defectos del propio diff, y el patrón que los une: reimplementar una regla clínica en el
Laboratorio la desincroniza de la pestaña del paciente sin que nada lo delate.** El daño acá no
es un informe firmado equivocado, es un número agregado que no significa lo que el rótulo dice, y
un porcentaje mal calculado se lee exactamente igual de bien que uno correcto.

- **Un `option value` inventado se cae en silencio.** El mapa de burbujas del FOP decía `escaso`
  y el select dice `pocas`: `distrib` descartaba la categoría entera —la de MENOR riesgo
  embólico— y las dos barras restantes se llevaban todo el peso visual sin sumar 100 %.
  **Verificar los `option value` reales antes de mapearlos.**
- **El denominador se declara UNA vez.** La nota de la tarjeta de actividad prometía «sobre el
  total del período» y las barras dividían por los estudios con alguna sección: 10 CIA en 100
  estudios leían **50 %** bajo un cartel que prometía 10 %.
- **`mch_fam_ms` crudo reintroduce el defecto cerrado la noche anterior.** Un solo campo alimenta
  tres umbrales incompatibles (Task Force <35, ESC <40 o cualquier edad con MCH establecida,
  AHA ≤50). Leerlo crudo contaba como «Sí» una muerte súbita a los 60 en los dos algoritmos.
  Medido tras el arreglo: familiar a los 30 → intermedio; a los 60 → bajo; a los 60 con MCH
  establecida → intermedio; sin edad → no entra al score.
- **`_hcmRiskSCD` sólo valida sus cuatro argumentos NUMÉRICOS.** Los tres binarios los exige
  `mchScoreESC`, no la ecuación. Pasarlos como `=== 'si'` convierte un «no consta» en un 0
  medido, y los tres coeficientes suman 2,00 en el índice: el porcentaje sale sistemáticamente
  bajo. **Al extraer una fórmula, las guardas que quedan en el llamador viajan con el llamador.**
- **`mca_vi_men2` NO es un campo.** Es una celda DERIVADA de la muerte súbita familiar <35 años.
  `_labCampoRaw` devolvía siempre `''` y el criterio no disparaba nunca: un Limítrofe se
  publicaba como Posible y un Definitivo como Limítrofe.
- **Una compuerta `fuera` no es un filtro por campo.** `mcaCatI` invalida la CATEGORÍA ENTERA con
  un valor ilegible; ignorarlo para seguir evaluando los otros dos daba criterio MAYOR por el FAC
  sobre un TSVD de 320 mm que el informe declaraba no interpretable.
- **Las bandas de plausibilidad del Laboratorio tienen que ser las de la pestaña.** Seis campos
  divergían. La peor: la coartación bandeaba la velocidad a 9 m/s y no el gradiente a 150 mmHg,
  así que hasta **324 mmHg** entraban al promedio y al conteo de «> 20 mmHg».
- **Un dato global no se le atribuye a la sección que lo pide prestado** — también acá. El Qp/Qs
  de una CIA se sumaba al «Qp/Qs promedio» de la tarjeta del ductus.
- **`_labFevi` y no `_labNum(i,'fevi')`:** los importados guardan `fevi_simpson` y perdían el
  factor mayor de disfunción sistólica.
- **`MCA_UMBRAL` tenía un tercer lector con literales.** Coincidían, pero el contrato de la
  constante es que exista una sola copia.
- **`deBase(x, d)` colapsa la base vacía.** Componer «x de y (z%)» a mano daba
  «0 de 0 (— (sin datos))», que además afirma un numerador y un denominador que no existen.

**Dos salvedades que ahora se imprimen en la propia tarjeta:** el «Puntaje Task Force promedio»
de MCA mide también cuánto se completó el formulario —las cinco categorías no-eco son casillas
que nadie abre salvo que sospeche la enfermedad, y sin marcar suman 0 como si fueran negativas—;
y «Con IP consignada» de Fallot subdeclara, porque la opción vacía de `ip_grado` está rotulada
«Sin insuficiencia» y el vacío significa las dos cosas.

### Panel de cohorte del Laboratorio («Filtros») — 2026-09-11

`_LAB_COHORTE` es una FOTO de los controles tomada al apretar «Aplicar», no una lectura del DOM:
leyéndolo como se lee el período, tocar un control recalcularía las once subtabs a media edición
y el botón no significaría nada. Vive DENTRO de `_labFiltrarBase`, así que las once subtabs,
«Comparar períodos», el PDF de auditoría y el Excel la heredan sin tocarlas.

**La regla que hace que estos filtros no mientan: lo que no se puede EVALUAR queda FUERA, no
dentro.** Un «FEVI < 40 %» que dejara pasar los estudios sin FEVI armaría una cohorte de
disfunción severa con pacientes a los que nadie se la midió, y ese `n` es el denominador de todo
el Laboratorio y del PDF de auditoría. Los 24 criterios se verificaron uno por uno.

**Seis reglas clínicas se EXTRAJERON para que el filtro no las reimplemente**, que es el defecto
que este archivo ya pagó tres veces: `_CC_SECS` (los doce predicados congénitos, desde
`labCCRender`), `_labEsEte`/`_labUsaTavi`/`_labOaiTromboSi`/`_labTepSignos` (desde
`labEteRender`), `_labHfPeffRaw`/`_labHfPeff`/`_labPeptido` (desde `_labAdvancedRender`),
`_htp2022Core` (desde `calcHTP2022`) y `_ctrcdEstado`/`_ctrcdEsGrado`/`_ctrcdGlsRel` (desde
`calcCardioOnco`). **Si agregás un filtro, el predicado sale de donde ya vive o se extrae: no se
escribe de nuevo.** El panel diría «12 estudios encontrados» y la subtab que los explica contaría
otra cosa, y los dos números se leen exactamente igual de bien.

**`calcHTP2022` llama a `_htp2022Core({num:_hfN, txt:sv, chk:_hfChk})` y NO con `_HF_SRC_DOM`.**
Ése es un `const` declarado 340 líneas más abajo, y leerlo antes de su línea no da `undefined`:
lanza, y se lleva el bloque `<script>` entero. Las tres que se pasan son declaraciones de
función, que se hoistean.

**El orden de las nueve ramas de `_ctrcdEstado` es la regla, no un detalle de implementación.**
Una FEVI de 38 con caída de 12 pp sobre un basal de 35 NO es CTRCD severa —la severa exige que la
reducción por debajo de 40 sea NUEVA, o sea basal ≥40— y tampoco moderada: es
`empeoramiento_sub40`, que la guía no gradúa. Un filtro escrito a ojo como «FEVI<50 y caída≥10»
se lo lleva. Verificado sobre 900 combinaciones contra la cascada anterior: cero divergencias.

**Compuertas que no son obvias y que hay que respetar al agregar filtros:**
- **HTP.** Los signos A, B y C se derivan de mediciones de rutina, así que el núcleo clasifica
  CUALQUIER estudio. `_labHtpUsado` exige VRT medida o categorizada a mano, o algún signo tildado.
  Y **`nomedible` NO cuenta como categorizada**: con esa opción el núcleo cae en el `else` y
  devuelve INTERMEDIA con ≥2 categorías de signos, o sea que el estudio cuya VRT el médico declaró
  no medible entraría a la cohorte clasificado por hallazgos incidentales. El informe firmado
  sigue publicando esa probabilidad —`calcHTP2022` no cambió—; lo que no se hace es armar una
  cohorte con ella.
- **HFA-PEFF.** La banda `prob` sólo existe con los TRES dominios: con uno sin medir el techo es
  4 puntos y un «alto» es aritméticamente imposible. Pero **el piso de dos dominios es una regla
  del SCORE, no del péptido** — por eso hay `_labHfPeffRaw` (sin piso) y `_labHfPeff` (con piso).
  Con una sola capa, un NT-proBNP de 3.000 medido quedaba fuera del filtro de péptidos por un
  requisito ajeno.
- **Péptidos.** El dominio humoral admite DOS vías, el número o el tilde manual (`_hum1`), para
  el laboratorio informado sin el valor exacto. `_labPeptido` lee `hum.todos` YA RESUELTO; la
  primera versión re-testeaba `ntprobnp`/`bnp` contra `hfUmbrales` y era una TERCERA copia que ya
  discrepaba: el tilde entraba a «HFA-PEFF alto» y no entraba ni a «elevado» ni a «normal».
- **Trombo de orejuela: sólo `si`.** El select tiene además `sospecha`, y la app trata el
  confirmado como contraindicación ABSOLUTA de valvuloplastia.
- **Edad mínima: `> 0`, no `!== null`.** `_cohNum` devuelve 0 para un «0» tipeado y un 0 en ese
  campo se LEE como «sin piso», pero activaba la cohorte y descartaba todo estudio sin `edad`.
  El techo sí admite 0: «Edad ≤ 0» no se lee como «sin techo».

**Los umbrales del filtro salen de las constantes que ya gobiernan la pantalla.** FEVI por
`UMBRAL_FEVI_NORMAL` (el mismo de `FEVICAT`), amiloidosis por `_labAmilBanda` (que es lo que
rotula el gráfico de Avanzado) y PSAP por `UMBRAL_PSAP_ELEVADA` con los MISMOS operadores que la
distribución de General. Este último casi se escapa: escrito como «<36 / 36–50» coincidía con el
gráfico **sólo porque `psap_calc` se guarda con `toFixed(0)`** — con un valor fraccionario, un
35,5 caía en la barra «36–50» y en el bucket «<36» en la misma pantalla. Los rótulos del selector
se derivan del umbral, para que no puedan mentir.

**Todo rótulo que nombre la población va por `_labPobTxt()` / `_labPobDe()`.** Son 21 sitios,
cuatro dentro del PDF de auditoría. Decían «en el período» al lado de números que con cohorte
activa ya no son los del período. El aviso amarillo no alcanza —el PDF ni siquiera lo tiene— y es
el defecto que este archivo documenta en «el denominador se declara una vez». Al agregar un
rótulo con un `n`, usalos.

**La cohorte se escapa del Laboratorio por dos caminos y los dos tuvieron que declararla:**
- El **PDF de auditoría** lleva en la portada «Cohorte filtrada — los totales NO son los del
  laboratorio completo» con los filtros enumerados y `splitTextToSize`, porque la descripción
  crece con cada filtro y `doc.text` no envuelve ni avisa.
- El **Excel** lleva hoja «Cohorte», sufijo `_cohorte_filtrada` en el nombre y un subtítulo
  naranja en el botón. Su botón vive en **Guardados**, o sea la única pantalla desde la que se
  exporta y a la que el aviso amarillo NO llega (`_labCohortePintar` itera
  `#tab-lab .lab-subpanel`). Antes ese subtítulo atribuía al PERÍODO las exclusiones de la
  cohorte, y ese archivo es el que va a **CeiboAnalytics**, o sea otra frontera de confianza.

**`cerrarSesion()` limpia la cohorte.** Es estado de módulo y sobrevivía al cambio de usuario en
una máquina compartida; en el Laboratorio se veía por el badge, pero no por el camino del Excel.
Es la columna que faltaba del patrón que este archivo ya documenta para `gradoGamma`/`protMonoc`.

**Lo que queda sabido y sin cerrar:**
- **«Moderada» en los filtros de regurgitación arrastra el grado 3** (moderada-severa), porque
  `_labRegurgSev` mapea 2 y 3 a «Moderada». Es preexistente y COMPARTIDO con la subtab
  Valvulopatías, así que cohorte y subtab cierran entre sí; pero el rótulo del filtro dice menos
  de lo que el filtro hace.
- **Los bordes de cardio-oncología son `>` y el clasificador usa `>=`.** Una caída de exactamente
  10,0 pp es CTRCD moderada en el informe y queda fuera del filtro «> 10 puntos». Las etiquetas
  dicen «>», así que es honesto, pero los dos números conviven en la misma pantalla.
- **La deuda BLOQUEANTE de los cinco grados valvulares sigue abierta** (ver la sección propia).
  Los filtros se construyeron sobre el modelo actual por decisión del médico, con la salvedad
  impresa en el grupo de Valvulopatías. No la agrava: las tres opciones son Leve/Moderada/Severa
  y el valor de fábrica mapea a «Sin», que no es opción, así que los estudios no evaluados quedan
  fuera de las tres.

### Asociaciones clínicas y asociación libre — 2026-09-11

Nueve asociaciones pre-especificadas (`ASSOC_A`, bloque A) y un explorador X/Y con 23 variables
(`LIBRE`, bloque B). Los dos viven DENTRO del IIFE de estadística para usar `spearman`, `ranks`,
`chi2p`, `_bh`, `pTxt`, `desc` y `detSPChart` sin duplicar una sola fórmula.

**Cuatro derivaciones más se extrajeron de `labCCRender`** —`_ccQpQs`, `_ccCoaGradMax`,
`_ccMchGradMax` y `_ccMcaTF`/`_ccMcaCatI`/`_ccMcaFamMS35`— por la misma razón de siempre. El
puntaje Task Force es el delicado: lleva la compuerta de valor ilegible (un TSVD de 320 invalida
la categoría ENTERA) y la muerte súbita familiar <35, que **no es un campo** sino una celda
derivada. Dos fuzz independientes, 20.000 y 200.000 estudios: cero divergencias.

**Estadística — lo que hay que saber antes de tocar esto:**

- **`kruskal` existe porque la geometría del VI es NOMINAL de cuatro niveles.** Un scatter y un ρ
  ahí no significan nada y reducirla a «HVI sí/no» tira información que el médico cargó. Lleva
  corrección por empates —el score ETT es entero sobre pocas categorías, así que los empates son
  la regla— y se verificó sin implementación de referencia, que es lo que este archivo ya
  documenta como método: aritmética a mano con y sin empates, y la **identidad H = z² con
  Mann-Whitney** para k=2 (coincide a 1e−9).
- **Piso POR GRUPO, no sólo total.** Era la única de las cuatro pruebas del módulo sin él
  —Mann-Whitney exige 8 por grupo, Chi² exige frecuencia esperada ≥5— y la corrección por empates
  lo AMPLIFICA: con doce estudios empatados y tres grupos de un paciente, C = 0,49 y el H
  corregido se duplica. Medido: H = 17,00 con p < 0,001 sobre grupos de tres.
- **El ajuste BH depende de la FAMILIA, así que el q de un bloque no es comparable con el del
  otro.** PSAP–TAPSE está en los dos y no puede tener el mismo q; va marcada con ↕ y el detalle
  lo explica. Ninguna de las dos cifras está mal — contestan preguntas distintas.
- **`m` se CALCULA, nunca se escribe.** Decía «m=29» fijo y `_bh` corrige sobre las que tienen p
  no nulo: con una cohorte chica son cinco. Desde que `sigLight` distingue «no calculada» de «no
  significativa», el médico puede contarlas y ver que el número declarado no cierra. Y `_mGeneral`
  se toma en `computeAll`, no en el render: allá las filas son las que pasaron los filtros de
  pantalla, y corregir sobre lo que se muestra es el sesgo que BH viene a eliminar.
- **«FDR» sobre una sola prueba no significa nada.** La multiplicidad la genera el médico probando
  pares, no la app mostrando uno. Por eso `_libreSesion` acumula los pares de la sesión y el
  ajuste se recalcula sobre todos. Se guardan **por clave y sin su número**: se recomputan sobre
  la cohorte vigente en cada repintado, porque guardarlos con el resultado dejaba p-valores de
  otra población al lado del nuevo, y BH mezclando dos poblaciones no es una familia.
  Los tres modos de reiniciar la cuenta —recargar, cerrar sesión, el botón— se DECLARAN en
  pantalla: una corrección que se puede esquivar sin saberlo es peor que no tenerla.

**TRES asociaciones son parcialmente tautológicas, y la tercera se escapó en la primera pasada:**
el E/e′ es criterio del dominio funcional del propio HFA-PEFF; el FAC es criterio de la categoría
estructural del propio Task Force; y el **score ETT de amiloidosis incluye el RWT** (`ett-rwt`, 3
de sus 10 puntos, criterio > 0,6) mientras `GEOM` clasifica con **ese mismo cociente** 2·PP/DDVI
(corte 0,42), así que el grupo concéntrico tiene el puntaje elevado por construcción. Al agregar
una asociación nueva: **buscar si una variable PUNTÚA a la otra.** `_LIBRE_COMPONENTES` tiene las
listas verificadas contra el código que arma cada score, no supuestas.

**Un puntaje compuesto no devuelve `null` ante la ausencia, devuelve 0.** `_ccMcaTF` da 0 sobre un
estudio donde nadie abrió la sección, porque 0 es un puntaje legítimo — y es la única de las 23
variables de `LIBRE` que codifica la ausencia como número. Sin gatearlo por la población, el
bloque libre informaba «N = 60» sobre una cohorte con 3 MCA evaluadas, bajo un cartel que dice
«tienen las dos variables cargadas», y el ρ medía «¿se abrió la pestaña?». **Si agregás un puntaje
al registro, gatealo por su población.**

**Cambio de comportamiento declarado — una prueba que no se corrió deja de verse como negativa.**
`sigLight` devuelve `—` con p nulo, no `⚫`, porque la leyenda que la propia app imprime define
`⚫` como «no significativo». Alcanza a la tabla general, al Excel y al PDF de auditoría. Por el
mismo motivo `spearman` con varianza cero devuelve `null` en vez de `{rho:0, p:1}`: una variable
CONSTANTE en la cohorte no es una correlación nula, es una prueba que no se puede correr. Es el
mismo error de tipo que se cerró con `pctOf(n, 0)`. Las **tres** leyendas nombran el cuarto
estado: el párrafo suelto, el panel «¿Cómo leer esta tabla?» —que es el que el médico abre a
propósito— y la del PDF.

**La firma de población tiene que ver la BASE, no sólo los filtros.** `_labPobFirma` existe porque
`labInit()` cuelga del `onclick` del botón de navegación y volver a la pestaña disparaba «la
población cambió» sin que cambiara nada. Pero mirando sólo período, centros y cohorte se pasaba al
otro extremo: tras un **import** —donde la población cambia de verdad sin tocar un control— el ρ
suelto y su gráfica quedaban describiendo la población anterior en silencio. Un falso negativo es
el peor lado del intercambio: el falso positivo avisa de más, éste calla justo cuando importa.
Hoy la firma incluye la cuenta y la `fecha_guardado` máxima —la cuenta sola no ve una edición—.

**Dos trampas de plomería que costaron:**
- **`detSPChart(cont, …)` exige un ancestro ESTRICTO**: hace `cont.querySelector('[data-sc] canvas')`,
  que no matchea el propio `cont`. Pasar el wrap no dibuja nada y sin error. Por eso hay un
  contenedor propio (`lab-asocL-graf-cont`) y no un `.parentNode`, que convertía el contenedor en
  la tarjeta entera y tomaba el PRIMER `[data-sc]` que hubiera. Y la rama sin Chart.js de
  `detSPChart` escribe sobre el `[data-sc]`, o sea que **borra el canvas del DOM para siempre**: el
  llamador lo repone antes.
- **El `catch` de un render VACÍA su tabla**, no la deja. `labAsocARender` lanza dentro del cálculo,
  o sea antes de pisar el `innerHTML`: los números viejos quedaban en pantalla mientras el
  encabezado y la tabla general ya se habían movido a la cohorte nueva.

**`labAsociacionesInit` inicializa los TRES bloques.** Antes sólo la tabla general, y lo único que
dibujaba los otros dos era `labInit()`, que hoy cuelga de un único `onclick` inline. El día que
haya una segunda entrada a la pestaña, el bloque A queda en blanco y los dos `<select>` sin
opciones, con lo cual «Calcular» sale por un `return` mudo.

**Deuda anotada:** con N = 10 —el mínimo que pide el bloque A— Spearman necesita |ρ| ≈ 0,64 para
llegar a p < 0,05. La ausencia de semáforo verde **no dice que no haya asociación**, dice que la
cohorte no alcanza para verla. La nota al pie lo declara; no lo borres al tocar el bloque.

### PDF del análisis estadístico — 2026-09-11

`labAnalisisPDF()`. Documento distinto del de auditoría: aquél describe la ACTIVIDAD del
laboratorio, éste una COHORTE y sus asociaciones, y por eso tiene su propio disclaimer.

**No recalcula nada y ADEMÁS recibe la población congelada.** Tres seams —`_labEstDescriptiva`,
`_labAsocParaPDF`, `_labScatterPng`— devuelven lo mismo que pinta la pantalla. Que compartan la
CUENTA no alcanza si cada uno elige su MUESTRA: el PDF espera tres imágenes (más de medio
segundo, porque `_labValvChartPng` tiene un `setTimeout(300)` fijo) y el botón está a dos
elementos de «Aplicar filtros», así que releyendo `informes()` salía un documento con la portada,
el banner de cohorte y la gráfica de válvulas de una cohorte y las asociaciones de otra, sin
rastro. Y `informes()` dentro de un `.map` hacía que las nueve clínicas leyeran poblaciones
distintas entre sí. **Al agregar un seam: parámetro de población, y hoisteado fuera del map.**

**`_asocEstablecida` es EL criterio para trazar una recta de tendencia.** Había tres —la tabla
general con el p CRUDO, el bloque clínico con el ajustado sin piso de N, el PDF con los dos— y
cada comentario afirmaba ser igual a otro. La regla ya estaba escrita en `interpTxt`/`_bh`: si el
semáforo no está verde, no se afirma una dirección; y una recta ES una afirmación de dirección.
**Cambio de comportamiento declarado:** la tabla general traza menos rectas que antes.
Ojo con la distinción que quedó: `pAdj < 0.05` decide si la fila se LISTA, `_asocEstablecida`
decide si se traza la recta. Las 🟡 se listan con `*`; excluirlas las borraba del PDF bajo un
título que dice «significativas».

**`_labSanPDF` tiene catch-all `[^\x20-\xFF]` y no es opcional.** jsPDF codifica en UTF-16
**toda** cadena que tenga un solo carácter fuera de WinAnsi, y la fuente Helvetica la imprime
ilegible — no se pierde el símbolo, se pierde **la línea entera**. El `⚠️` de la nota de
valvulopatías rompía justamente la frase que declara sobre qué base están los porcentajes
impresos al lado, y el `⚠fe<5` de una Chi² rompía la celda con la advertencia de calidad del
dato. Es el mismo modo de falla que los umbrales de severidad valvular. **No metas emoji en una
cadena destinada a `doc.text`.**

**`doc.text(..., {maxWidth})` NO trunca: parte y dibuja hacia abajo**, mientras el llamador avanza
`y` como si fuera una línea, así que la segunda se imprime ENCIMA de la fila siguiente —y si esa
fila es impar, su relleno la TAPA: texto perdido en silencio. Medido a 8,5 pt: el estadístico de
una Chi² («Chi2=9.15  V=0.35») mide 25,0 mm sobre 22,64 disponibles, o sea que **toda** fila Chi²
significativa desbordaba, y diez de las veintinueve exploratorias son Chi². Repartir mejor los
180 mm no alcanza. La tabla del PDF de análisis **deriva el alto de fila del contenido**
(`splitTextToSize` + `altoDe`); la de `labGenerarPDF` sigue con alto fijo — si le metés una
columna angosta, mirá esto primero.

**Una gráfica sin leyenda es un número sin denominador.** La de valvulopatías codifica la válvula
por TONO y la severidad por OPACIDAD, con la leyenda de Chart.js apagada en `_labValvChartCfg`.
Las otras dos superficies aportan el decodificador —`_labValvLegendHTML` en el dashboard, las seis
mini-tablas en el PDF de auditoría—; ésta imprimía la imagen sola. Si publicás esa gráfica en una
superficie nueva, va con su tabla.

**`sv('medico')` NO EXISTE.** El id real es `med-nombre`. Era código muerto permanente, así que el
responsable salía sólo del campo del modal del PDF de auditoría —que para este botón no hay razón
de haber abierto— y la línea entera se omitía: un documento con estadística de una cohorte de
pacientes circulando con cero atribución. Siempre queda raya de firma, como en el otro PDF. Es
«un id inventado no falla, calla», otra vez.

**Guard de reentrada y `try/catch` en todo generador `async` de PDF.** Sin el catch, cualquier
throw queda como promesa rechazada sin manejador y el médico se queda mirando «⏳ Generando…»:
**una falla total se ve exactamente igual que una generación lenta**, y el reflejo es apretar otra
vez, que dispara dos generaciones concurrentes. El archivo ya tenía el patrón en
`_pdfGuardadoEnCurso`.

**El pie es compartido (`_labPdfPie`) porque es donde va el disclaimer.** Su alto se CALCULA
(`_labPdfPieAlto`) y el piso de contenido del análisis deriva de ahí: el disclaimer crece hacia
arriba y con dos líneas ya pisaba el borde inferior de una fila de tabla, sin error y sin que se
note salvo mirando la última hoja. El actual deja sitio para unos 23 caracteres más — agregarle
una frase lo parte en dos. **`_LAB_PDF.BOTTOM` es el piso SIN pie extra; no lo uses crudo si tu
documento lleva disclaimer.**

**Las primitivas de dibujo están duplicadas a propósito** entre los dos PDF, y es una decisión, no
un olvido: giran alrededor de un `y` de cierre que `labGenerarPDF` toca en ~80 lugares, y
rewirearlas ahí es un cambio de radio mayor que la duplicación que evitaría. Son presentación
pura, sin regla clínica. **Si tocás una, mirá la otra** — ya divergieron una vez, en el orden del
`ensure` respecto del título (el de auditoría resuelve la imagen primero, el nuevo no lo hacía y
dejaba títulos huérfanos al pie de una hoja).

**Lo que este documento DECLARA, y hay que mantener:** la cohorte (hereda los filtros), el N de
cada tabla, el tamaño de cada familia de pruebas —listar sólo las significativas sin decir cuántas
se corrieron es la presentación que convierte ruido en hallazgo—, que los dos p ajustados no son
comparables entre familias, la circularidad con `(!)`, y que con **m = 0** no corrió ninguna
prueba: ahí «ninguna resultó significativa» sería declarar un negativo sobre algo que no se midió,
y es el caso de las cohortes chicas, que es cuando más se usa el botón.

**El saneador de `labAsociacionesExportPDF` se consolidó en `_labSanPDF`.** Tenía una
transliteración local de siete símbolos que no cubría acentos, y nueve de sus once columnas iban
crudas a `doc.text`: «Función sistólica», «Geometría VI» y «Patrón diastólico» salían rotas en ese
PDF desde siempre. Además translitera `ρ` como `r` mientras el común usa `rho` — los dos botones
de la misma barra imprimían distinto el mismo número.

### Excel del Laboratorio — bloques, 44 columnas nuevas y plantilla virgen (2026-09-11)

305 columnas en 16 bloques. `LAB_XLS_BLOQUES` asigna por prefijo con desempate por orden del
array, `_labOrdenarCols` reagrupa al final, y `_labXlsAssertBloques()` comprueba al arrancar que
cada prefijo declarado resuelva a SU bloque — se agregó porque «Morfología » se tragaba
«Morfología orejuela» y la entrada del bloque 16 quedaba como código muerto que se leía como si
funcionara. La hoja «Bloques» no lo delataba: se calcula con la misma función, así que quedaba
internamente consistente y mal.

**Lo que la librería escribe y lo que no — MEDIDO, no supuesto.** SheetJS 0.18.5 comunitaria:
- **estilos de celda: NO** (se escribió un libro con relleno y negrita y `styles.xml` sale sin el
  relleno y sin `<b/>`). Por eso los bloques se declaran en su hoja y no con color.
- **`!freeze`: NO**, en sus dos formas documentadas (objeto y referencia). Se quitó y la hoja de
  instrucciones pide el paso manual. Dejarlo habría sido código que no hace nada bajo un
  comentario que promete el formato.
- **comentarios de celda y `!autofilter`: SÍ.** Los comentarios son lo que reemplaza al color.

**La plantilla y el export salen de la MISMA fuente** (`_labExcelRow` sobre un estudio vacío +
`_labOrdenarCols`). Construirla desde `LAB_XLS_MAP` daba 275 contra 305 y la primera diferencia
caía en el bloque 3, o sea que los dos archivos quedaban CORRIDOS de ahí en adelante — el defecto
contra el que advertía el comentario de esa función, que pedía que coincidieran sin que nada lo
garantizara. **El camino por el que podrían volver a divergir:** el export toma las cabeceras de
`rows[0]` y la plantilla de un estudio vacío, así que una clave CONDICIONAL en `_labExcelRow`
(`...(cond ? {x} : {})`) las separa en silencio. Hoy no hay ninguna.

**`caso_interes` tiene DOS claves persistidas y la canónica es la que NO lleva sufijo.**
`guardarInforme` la escribe dos veces —por el barrido genérico de casillas como
`caso_interes__chk`, y en su línea propia como `caso_interes`— y los seis consumidores reales
(la ⭐ de Guardados, el pilar de Docencia, el tablero, el badge y las dos restauraciones) leen la
segunda. Además `toggleCasoInteresGuardado` escribe directo al store sin pasar por el formulario,
así que el `__chk` de un estudio marcado con la estrella NUNCA se actualiza. Se excluyó
`caso_interes` del barrido de `_restaurarChkInclusion`, que pisaba la canónica con la rancia.

> **Esto estuvo escrito al revés unas horas y el round-trip lo dio por bueno**, porque
> `_labExcelRow` leía `__chk` y el importador escribía `__chk`: eran espejo. Es literalmente
> «ida y vuelta exacto no prueba nada». **La prueba correcta es contra el CONSUMIDOR**, no contra
> el otro extremo del tubo. Al agregar una columna de casilla, verificá con el predicado que usa
> la pantalla que la muestra.

**Reincidí dos veces en la zona muerta temporal, en la misma edición.** Dos sentencias de nivel
superior leían `LAB_XLS_OPCIONES` y `_labXlsNorm` **antes de sus declaraciones**, y eso mata el
bloque `<script>` ENTERO: 49 `const` sin inicializar, funciones vivas por hoisting, y la app
cargando con la interfaz completa y sin estado. **`node --check` da verde** porque es error de
ejecución. Lo que lo detecta es **recargar y probar centinelas repartidos por el bloque** —el
último `const` declarado y algo del final— no leer el diff. Si agregás una tabla que dependa de
otra, mirá el ORDEN antes que la lógica.

**Criterio de qué columna entra (decisión del médico, 2026-09-11):** lo que EcoSmart realmente
GUARDA y puede REIMPORTAR, o sea lo que tiene `id` de input/select/textarea —porque
`guardarInforme` barre esos tres tags—. Los derivados sin control propio no entran por el mapa;
los que se exportan salen de `_labExcelRow` como columnas calculadas.

**`_labXlsEsCalculado` tiene DOS mitades y hay que usar las dos:** `LAB_XLS_SOLO_EXPORT` **y** el
atributo `readonly` del DOM. Leer sólo la primera hacía que el comentario del encabezado
prometiera «se reimporta» sobre AVm continuidad, AVA continuidad, AVm indexada y PVC, que la app
calcula. La condición se comparte, no se reescribe.

**Al agregar un select al Excel, tres cosas:**
1. Los valores salen de los `option value` **leídos del DOM**. Un value inventado se cae en
   silencio (ya pasó con `escaso` por `pocas`).
2. Un `vocab` **sin entrada en `LAB_XLS_VOCAB` RECHAZA la celda**, y sin entrada en
   `LAB_XLS_OPCIONES` el error sale con los paréntesis vacíos. Los quince nuevos salían así.
3. El export emite la **etiqueta legible** y el vocabulario acepta las DOS formas. Sin eso, un
   Excel exportado por la propia app no se reimportaba. `_labXlsNorm` unifica además las rayas
   (la app muestra raya larga y quien tipea escribe guion).

**Valores de fábrica que afirman un negativo.** Tres selects nuevos no tienen opción vacía, así
que TODO estudio guardado los trae: `co_riesgo_cv` («Ninguno»), `hf_ritmo` («Automático») y el
`0` de las cuatro subescalas de Wilkins, que significa «sin puntuar» y no un puntaje. Se emiten
sólo si el módulo se usó. Es el mismo patrón que los cinco grados valvulares y que «`__chk`
presente ≠ el médico decidió».

**Columnas que quedan FUERA del Excel y por qué.** De las 250 de `ecosmart_plantilla_v2.xlsx`,
164 no tienen campo persistido en la app: GLS y contractilidad segmentarios (16 segmentos cada
uno), eco pulmonar completo, dominios del HFA-PEFF, detalle de TEER, VEXUS agregado, seguimiento
oncológico, y los derivados puros (ASC, IMC, LAVI, masa, E/e'). Los derivados que SÍ se exportan
los calcula `_labExcelRow` al vuelo. **La plantilla v2 del escritorio está desactualizada**: le
faltan las 130 columnas de CC/Genéticas y no refleja esta estructura.

**Deuda declarada:** las cuatro entradas `readonly` del mapa (`avm_cont`, `ava_cont`, `avm_idx`,
`hemo_pvc`) existen sólo para que la columna aparezca en la lista «calculadas» del preview de
importación. Si alguien le saca el `readonly` a uno de esos inputs, la columna pasa a ser
importable sin que nada la recalcule al abrir el estudio — «bloquear no es recalcular» con el
gatillo invertido. La dependencia no está declarada en ningún lado salvo el atributo HTML.

### Panel de indicaciones según guías — 2026-09-11

`indicAbrir()` / `indicRender()` / `IND_SECS`, en el bloque `<script>` de `critAbrir`. Nueve
secciones que muestran los datos del estudio EN CURSO contra los umbrales publicados. Es **sólo
pantalla**: verificado generando el PDF con el panel abierto y buscando sus cadenas en el content
stream —cero— con el denominador confirmado (el PDF traía «Paciente Prueba»).

**No tiene estado, y eso es la mitad del diseño.** Se re-deriva del formulario en cada apertura,
así que no necesita columna en `limpiarCampos` / `editarInforme`+`cargarEstudioPorId` /
`guardarInforme` — el trío que este archivo declara obligatorio para todo módulo con estado propio
— y no puede arrastrar al paciente anterior como hicieron `gradoGamma`/`protMonoc`.

**Cuatro reglas del módulo, todas en el comentario de cabecera del código:** no reimplementar
ninguna regla clínica; comparar contra `null` sólo con `_ge/_le/_gt/_lt` (`null <= 1.0` es **true**,
y con `ava <= 1.0` suelto la sección de estenosis aórtica severa se activaba sobre un formulario en
blanco); leer las constantes de otros bloques por `window.X` **sin literal de respaldo**, para que
falte antes de mentir; y que la marca ✅ signifique una sola cosa.

**Las citas del pedido original estaban mal en siete de nueve, y se verificaron contra el texto
primario de cada guía antes de escribirlas.** Es el trabajo que más valor tuvo de toda la tarea y
hay que repetirlo ante cualquier umbral nuevo. Lo que cambió:

| Sección | Decía el pedido | Dice la guía |
|---|---|---|
| IM primaria | DTSI > 45 mm · FEVI < 60 % | **DTSI ≥ 40 mm · FEVI ≤ 60 %** (ESC/EACTS 2021, I B). El 45 es de la **ESC 2017**, y la propia guía de 2021 lo imprime en su tabla de recomendaciones revisadas |
| CIA | RVP < 5 UW · Qp/Qs ≥ 1,5 en la Clase I | **RVP < 3 UW** (I B). El Qp/Qs **no está** en la Clase I: aparece en las filas IIa (3–5 UW) y IIb (≥ 5 UW), y con **>**, no ≥ |
| MCH | Reducción septal Clase IIa | **Clase I B** (ESC 2023, Rec. Table 20), con ≥ 50 mmHg en reposo o máximo provocado **y CF III–IV**. El IIa C de esa misma tabla es la fila del **síncope de esfuerzo recurrente**, que comparte el umbral de 50 |
| VAB | Clase I > 50 mm, y > 45 con cirugía valvular | Los dos son **IIa** desde 2024. Clase I es ≥ 55 mm, y ≥ 50 mm **sólo en fenotipo de raíz**. La frase del pedido está reproducida casi literal en la tabla de recomendaciones modificadas de la ESC 2024, como texto de **2014** |
| FOP | ESC 2020, Clase IIa, < 60 años | **ESO/EAPCI 2019** (Pristipino, *EHJ* 40:3182), metodología **GRADE** («recomendación fuerte», no clase ESC), **18 a 65 años**. En la ESC 2020 de congénitas la palabra «criptogénico» aparece **cero veces** |
| EM | Valvuloplastia I si Wilkins ≤ 8 | El score **no es criterio positivo**. La guía define «características **desfavorables**» como VARIAS de una lista donde «score > 8» es una; un 9 aislado no descalifica. Y el gatillo de la Clase I es el **síntoma** |
| Coartación | Gradiente > 20 mmHg | **Invasivo pico-a-pico ≥ 20**, y la **HTA es condición** (sin ella, IIa). Falta un criterio entero: estrechamiento **≥ 50 %** respecto de la aorta a nivel del diafragma permite intervenir con gradiente < 20 |

Las dos que estaban bien —estenosis e insuficiencia aórtica— igual necesitaron precisiones: en la
aórtica estenótica la **indicación** (I B con síntomas) es una cosa y la **modalidad** otra
(SAVR I B < 75 años y riesgo bajo; TAVI I A ≥ 75 o riesgo alto); en la insuficiencia faltaba el
DTSI > 50 mm / > 25 mm/m², que es Clase I al mismo nivel que la FEVI.

**Y dos defectos del pedido sobre el modelo de datos, encontrados al verificar los ids:**
- **«IM severa = im_sev_final 3» es falso.** El 3 es «Moderada-severa» y la severa es el **4**;
  `_labRegurgSev` mapea el 3 a «Moderada». Con el 3 el panel abría sobre moderadas y callaba sobre
  severas. Ídem `ia_sev_final`.
- **`vab_ao_asc` no existe.** La ascendente es **`ao_tub`**; `vab_asc_ro` es un espejo readonly que
  escribe `vabSync`. Leer el espejo habría sido leer una copia.

**Decisión del médico (2026-09-11): el mecanismo de la IM se DECLARA, no se gatea.** El único campo
que registra primaria vs secundaria es `teer_tipo_im`, dentro del bloque TEER de la pestaña ETE, y
arranca vacío. Gatear por él dejaba a un prolapso con IM severa sin ver nada y sin decir por qué.

**Cuatro defectos del propio diff que vale la pena recordar:**
- **La marca ✅ significaba dos cosas incompatibles** —«criterio de la guía alcanzado» en la aórtica
  y «valor normal» en la mitral— y **no había leyenda**, así que nada lo delataba. Ahora la leyenda
  se imprime (`_indLeyendaHTML`) y ✅ significa siempre «este dato alcanza un criterio», aunque el
  valor sea malo. Una FEVI conservada, que no es criterio de ninguna indicación, lleva «—».
- **La apertura automática se decidía por prefijo y se comía un caso.** VAB abría con
  `clave.indexOf('cx') === 0` sobre las **dieciséis** claves de `vabConclusion`, y `concomitante_45`
  no empieza con `cx`: la sección quedaba colapsada sobre un paciente al que la app le indica
  reemplazo de la aorta. Es el `'Morfología '` que se tragaba `'Morfología orejuela'` otra vez. Hoy
  la regla vive sólo en `_indSecHTML` (✅/🔴 o aviso) y **ninguna sección trae su propia `abrir`**.
- **La coartación no puede producir un ✅** —su criterio es invasivo— así que quedaba colapsada justo
  en el paciente que importa. Se abre por el `aviso`, y el aviso es la conclusión que `coaConclusion`
  ya publica en el informe firmado, no un criterio nuevo escrito en el panel.
- **Derivé un borde con aritmética de enteros** en `vdBasCat` («42-45» desde `VD_BAS_NORMAL_MAX + 1`).
  `vd_bas` es decimal y en runtime los `input number` de esta app pasan a `text`, así que un 41,5
  clasificaba «leve» bajo un cartel que decía que la banda empieza en 42. Se imprime el mismo
  operador que aplica el código: «>41 y ≤45». Ya estaba documentado con el panel de MCA.

**Y un comentario mío que afirmaba algo falso, corregido antes de commitear.** Justificaba la
extracción de `wilkinsScore()` diciendo que al reabrir un estudio el total quedaría en «—». **No
queda**: `editarInforme` y `cargarEstudioPorId` llaman a `calcWilkins()` a mano justamente por eso,
y sus comentarios lo explican. Medido en el navegador sobre un estudio reabierto: «8 / 16». La
extracción se sostiene por otras dos razones —la banda se necesita como DATO (la alternativa era
`dataset.banda`, un atributo que escribe una función de pintado, o parsear el badge, que ya causó un
defecto real) y saca una dependencia de orden que **ya se olvidó una vez**, según el comentario del
bloque de recálculos de la restauración por `?estudio=`—.

**`VD_BAS_NORMAL_MAX` (41) NO es el umbral de HTP.** `_htp2022Core` usa `vdBas > 41` como signo
ecocardiográfico de categoría A —el límite superior de lo normal— y `vdBasCat` marca «dilatado»
desde >45. Son dos criterios distintos sobre la misma medida y **no hay que unificarlos**.

**Al verificar este panel, cuidado con el denominador.** El paciente ficticio «completo»
(`paciente_ficticio_completo.json`) enciende **dos** de las nueve secciones: estenosis mitral y CIA.
Verificar sólo con él no dice nada sobre las otras siete. Hace falta un estudio adversario que las
encienda a la vez, y el formulario vacío para el mensaje de «sin criterios».

**El botón vive en la fila de estilo de la pestaña Informe, no en el header** (2026-09-11), y
**sólo aparece si hay criterios**. `indicHayCriterios()` corre las MISMAS `IND_SECS` que el panel:
una condición escrita aparte —«EA severa o IM severa o…»— sería una segunda copia de las nueve
compuertas. **Falla hacia VISIBLE**: si una sección lanza, el botón se muestra. Escondido, la única
señal sería su ausencia, indistinguible de «este paciente no tiene nada».

**Y el enganche no puede ser sólo un listener de eventos.** Las rutas de restauración pueblan
asignando `.value`, que **no dispara `input`**: con sólo el listener con debounce, abrir un estudio
guardado con EA severa dejaba el botón apagado. Va en **`RECALC_MODULOS`** —el embudo de
`editarInforme`, `cargarEstudioPorId`, el autoguardado y las dos rutas de reimpresión— **más una
llamada explícita al final de `limpiarCampos`, que NO pasa por ese embudo**. Sin ella, después de
«Nuevo estudio» quedaba visible el botón del paciente anterior. Si agregás algo que dependa del
estado del formulario, las dos columnas son ésas: `RECALC_MODULOS` y `limpiarCampos`.

**La `.no-print` no sirve fuera de `#amilo-root`.** La única regla que la apaga está scopeada a ese
subárbol, así que ponérsela a un overlay nuevo es un atributo decorativo bajo un comentario que
promete que no se imprime. El panel lleva su propia regla por ID.


### Frases rápidas — destino y separador (2026-09-11)

`frasesInsertar` inserta en el **último textarea con foco** (`informe_texto` / `en_suma`, en
`FRASES_TAS`); sin foco previo, el Informe.

**El registro del foco va al ARRANCAR, no al abrir el panel.** El único llamado a
`frasesInitCursor` estaba dentro de `frasesToggle`, y el flujo normal es el contrario: el médico
escribe en el EN SUMA y **recién después** abre las frases, así que ese `focus` ocurría antes de que
existiera el listener y el destino quedaba sin registrar. El bug sobrevivía al arreglo en la primera
inserción de cada sesión.

**El snapshot del cursor vive en el ELEMENTO** (`ta._frasePos` / `ta._fraseVal`), no en globales:
compartido, el cursor de un textarea pisaba al del otro al alternar. Ojo al leerlo — una propiedad
de elemento sin asignar es `undefined`, no `null`, así que la comparación va con `== null`.

**El separador se decide por la POSICIÓN, no por `alFinal`.** `alFinal` significa «no había cursor
recordado o estaba stale», que **no** es «el cursor está al final». Con el cursor al final —donde
queda después de tipear— las frases salían pegadas: «…normales.Función sistólica conservada.». En
HEAD casi no se veía porque la inicialización perezosa hacía que la primera inserción no tuviera
cursor registrado y cayera por la rama que sí separa; al registrar el foco desde el arranque, esa
rama dejó de tomarse y el defecto quedó al descubierto en el caso normal.

**Una frase la pisa un «Generar Informe» explícito, y NO es un defecto.** `_infEscribir` sólo hace
merge cuando el refresco es `silencioso`; en la regeneración explícita la salida es `lineasNuevas`
entera, a propósito. Por la vía que sí protege —los refrescos automáticos de VEXUS y amiloidosis—
la frase sobrevive a dos regeneraciones encadenadas, que es lo que este archivo exige para dar un
merge por probado. El comportamiento es simétrico entre los dos textareas.


### Donut de bordes de la CIA — 2026-09-11

`CIA_DONUT_SEGS` (geometría) · `colorBordeCIA` (bandas) · `ciaDonutRender` (SVG de pantalla) ·
`ciaDonutDataURL` (PNG del PDF) · `ciaDonutCentro` (los cinco textos del centro).

**Una sola geometría para las dos superficies.** Las mismas cadenas de path alimentan el `<svg>`
y el `Path2D` del canvas: `Path2D` acepta sintaxis de path de SVG, arcos incluidos. Si tocás un
sector, se mueve en los dos lados — que es el punto.

**`html2canvas` NO EXISTE en este proyecto y el bull's eye no captura DOM.** Es la tercera vez que
alguien supone lo contrario; ya está en la lista de hallazgos falsos verificados. `bullseyeDataURL`
crea un canvas **desprendido** con `document.createElement` y dibuja con `Path2D`. Cualquier
diagrama nuevo para el PDF va por ahí. Agregar html2canvas rompería la regla de recursos externos
auditados y sumaría un hash SRI que mantener.

**El layout «al lado del bull's eye» no entra en A4 y está medido:** donut 54 mm + su tabla ~90 =
144; una columna de diana son 54 + 34 de leyenda = 88. Total 232 sobre 192 útiles. El donut va en
banda propia a lo ancho, siempre debajo de las dianas.

**`_PDF_DIANA_LADO` (54 mm) lo comparten las dos dianas y el reloj del TAVI.** Antes el reloj iba a
40 y el 54 estaba escrito dos veces; el mismo informe mostraba círculos de tamaños distintos sin
razón clínica. Si agregás otra imagen cuadrada al informe, usá la constante.

**Los cinco inputs de borde siguen existiendo.** «Reemplazar la tabla» fue reemplazar su
PRESENTACIÓN: son campos persistidos que barre `guardarInforme` por `input[id]`, y sacarlos dejaba
el estudio sin bordes. La columna «Ventana ETE» se mudó al panel, que muestra la del borde tocado.

**El repintado cuelga de `eteShuntSync` y no de un `oninput` propio.** Esa función ya está en el
`oninput` de los cinco bordes y en el `onchange` de los selects, Y en `RECALC_MODULOS`, que es el
embudo de las rutas de restauración — donde reponer asigna `.value` y no dispara eventos.

**CINCO sectores de 72° que cierran los 360°, uno por borde** (corregido 2026-09-11). Antes eran
seis: había un «→Ao» sin campo propio que espejaba el color del aórtico, así que ese borde ocupaba
dos de seis porciones y la proporción que el anillo sugiere era falsa. Los `d` salen de
trigonometría y se verifican MIDIENDO EL DIBUJO —180 sondas a radio 80: cero huecos, cero solapes,
72° en los cinco, nada fuera del anillo—, no leyendo el path.

**Las siglas van en una SEGUNDA pasada y con `pointer-events:none`.** Dentro del bucle, el relleno
del sector siguiente tapa la sigla del anterior en los bordes compartidos (pasa en el SVG y en el
canvas). Y sin la guarda de puntero el clic sobre la letra no llega al `[data-seg]`: el centro del
sector sería la única zona muerta. Su color es el campo `text` del MISMO `colorBordeCIA` que pinta
el relleno — no hay un segundo mapa de tonos.

**El diagrama va al FINAL del panel CIA**, debajo de los campos y del shunt: es una lectura, no un
control de entrada, y arriba empujaba los campos bajo el pliegue.

**Sin `onclick` inline: `data-seg` + listener delegado registrado una vez.** Por dos motivos —el
inline se compila tras decodificar entidades, así que ahí el escape no protege; y la regla de área
táctil `[onclick]` infla a 44×44, que sobre un `<path>` de SVG no tiene sentido—. `ciaDonutRender`
reescribe el `innerHTML` en cada repintado, así que enganchar por path acumularía un listener por
tecla tipeada.

**El rótulo del centro se abrevia (`CIA_TIPO_CORTO`) y `CIA_TIPO_TXT` NO se toca.** El círculo
interior tiene 92 px de diámetro y «seno venoso de vena cava superior» mide ~150 a 9 px: se salía
encima de los sectores. La prosa del informe necesita el nombre completo; la restricción es sólo
del donut. Medidos los cinco: 66–78 px.

**El ejemplo del pedido se contradecía:** daba «Aórtico 4 → Borderline» y «VCS 4 → Adecuado». Manda
`colorBordeCIA`, que es la definición que el propio pedido trae.

**Nada de escalas nuevas:** la interpretación del Qp/Qs sale de `eteQpQsInterp` y el borde mínimo de
`eteCiaBordeMin`. La escala propuesta en el pedido («Mínimo/Moderado/Significativo») habría sido una
cuarta copia del mismo corte, discrepando con el cuerpo del informe en la misma hoja.


### Congénitas — estilo del acordeón y el desbalance de CIA/CIV (2026-09-11)

**ETE y Hemodinámica usan el MISMO patrón: `.card` + `h2.card-head`. Ninguna de las dos usa
`.sacc`.** ETE tiene nueve `.card-head` y cero acordeones. Si alguien pide «igualar a ETE» o
«igualar a Hemodinámica», es la misma regla. El estilo de Congénitas está scopeado a
`#tab-congenitas` **a propósito**: `.sacc` lo usan seis tabs con 21 acordeones, y cinco de ellas
están siempre expandidas en PC — ahí un header con fondo se lee como una barra de sección nueva.

**Contar líneas borradas NO detecta un desbalance de etiquetas.** La pasada del donut dejó el
panel `ete-shunt-pane-cia` cerrando justo después del rótulo «Bordes»: los cinco campos, el
shunt, la PAPs y el propio donut quedaron como HERMANOS del `.sacc-body`, o sea fuera del
contenedor colapsable, y el card tenía ocho hijos en vez de dos. Dos causas que se compensaban a
medias —dos `</div>` huérfanos de la tabla vieja y dos cierres faltantes en el bloque del donut—,
que es lo que lo volvía invisible leyendo el diff. **Lo que lo encontró fue preguntarle al DOM
quiénes son los hijos del card.** Al mover bloques de HTML: contar `<div>` contra `</div>` en la
región, y verificar la CONTENCIÓN en el navegador.

**Las transiciones CSS no avanzan en el preview headless.** El `max-height` del `.sacc-body`
queda congelado en el valor inicial de la transición, así que un acordeón cerrado mide su altura
completa y parece no colapsar — pasa igual en acordeones que no se tocaron. Para medir el
colapso hay que anular la transición; entonces cierra a 0 px. Falso «bug» de CSS garantizado.


### Botones «Integrar al informe» de Hemodinámica y la hoja de VEXUS — 2026-09-13

**El pedido partía de una premisa falsa y hubo que preguntar antes de construir.** «VEXUS no tiene
botón para integrar al informe» es cierto; «hay que hacer que al integrar escriba la conclusión en
el narrativo» ya estaba hecho. El bloque 11b de `generarInforme` emite `VEXUS N (detalle):
VEXUS_INTERP[N]` **desde siempre y sin botón**, y el texto de ejemplo del pedido —«Sin congestión
venosa sistémica significativa. Presión venosa central probablemente normal.»— es literalmente
`VEXUS_INTERP[0]`. Verificado en el navegador antes de escribir una línea.

**La asimetría con HTP/TEP es deliberada.** VEXUS está gateado por el DATO
(`vexusEstado().score !== null`: VCI medida Y al menos una vena interrogada); HTP y TEP por el
BOTÓN (`amiloIntegrado('htp')`). El gate por dato es más fuerte —no se puede olvidar—, así que el
botón nuevo gobierna **sólo la hoja del PDF** y no toca el narrativo. Decidido por Maicol.

**Todo `gen()` de `amiloSecs` tiene que poder decir «no aplicado».** `amiloIntegrar` **no tiene
compuerta de datos**: corre `sec.gen()` aunque el módulo esté en blanco. Si el generador no
distingue el caso vacío, un clic estampa una normalidad en un informe firmado — que es lo que hace
hoy el módulo pulmonar avanzado. `amiloTextoVEXUS` distingue además los dos motivos («falta la
VCI» vs «ninguna vena interrogada»), como `eteQpQsMotivo()`.

**EL TEXTO INTEGRADO SE CONGELA Y NADA LO RECALCULA.** `amiloIntegrar` guarda la salida en
`am-txt-<k>` y ahí queda; el único módulo con refresco era `wilk` (`amiloRefrescarSiIntacto`,
llamado en un solo sitio). Con VEXUS eso era una bomba, porque su narrativo **sí** se auto-refresca
en cada `onchange`: integrar con VEXUS 3, corregir un vaso a normal —dos clics, el gesto normal de
corregir una medida— y el mismo PDF firmado salía con **VEXUS 2 en el cuerpo y VEXUS 3 en la hoja
adjunta**, sin ningún aviso. Lo encontraron las dos revisiones por separado. Cerrado llamando
`amiloRefrescarSiIntacto('vexus')` desde `vexusRefrescarInforme()`, que es el embudo de los dos
caminos (los selects del protocolo y el `onchange` de `vci_diam`/`vci_col`). **Si agregás un módulo
cuyo texto pueda cambiar después de integrarlo, enganchá el refresco o documentá por qué no.**

**`soloHoja:true` en el descriptor de la sección.** Sin esa marca los avisos mentían: retirar el
módulo decía «VEXUS — congestión venosa ya no sale en el informe» mientras el cuerpo del informe
seguía diciendo «Congestión venosa severa… considerar descongestión activa». Es «el interruptor
mentía sobre el disco» otra vez. El rótulo del botón sí se dejó igual que el de las demás, a
pedido: la consistencia visual era el motivo del cambio.

**Tres helpers, no tres copias.** `vexusDetalle(st)`, `vexusCobertura(st)` y la constante
`VEXUS_SALVEDAD` los comparten el narrativo y la hoja. La primera versión de este mismo cambio
extrajo `vexusDetalle` para matar una duplicación **y en el mismo commit creó otra**: la salvedad
de confusores quedó copiada verbatim —cita bibliográfica incluida— bajo un comentario que decía
«igual que en el narrativo». Lo cazó `/differential-review`. Un comentario que afirma una
invariante no la garantiza; si dos superficies tienen que decir lo mismo, que sea la misma cadena.

**Los botones de Hemodinámica van al PIE**, con `text-align:center;margin-top:12px`. HTP y TEP los
tenían arriba del contenido, donde se leen como un control de entrada y no como el cierre de la
evaluación — y encima invitaban a integrar antes de llenar la sección, que es justo lo que abre la
ventana de divergencia de arriba.

**Al medir esto:** el screenshot del preview headless volvió negro con la página cargada y con
layout correcto (`getBoundingClientRect` daba valores válidos). No es un fallo de la app. Para el
modo día/noche verificá por **estilos computados** del elemento, no por imagen.

### Pericardio — Derrame/Taponamiento y Constricción vs Restricción — 2026-09-13

`dptEstado` · `dptFrases` · `dptSuma` · `dptMandaSuma` · `cvrFilas` · `cvrEstado` · `cvrFrases` ·
`cvrMotivo`, más `amiloTextoDPT` / `amiloTextoCVR` para la hoja del PDF.

**Dos premisas del pedido eran falsas y se decidieron antes de escribir.** (1) El tamaño del
derrame YA existía en el select `pericardio`, que alimenta narrativo, tabla del PDF, Excel, PPT y
Laboratorio; un select propio habría sido una cuarta graduación con bordes distintos («leve <10»
contra «leve 5-10» + «mínimo <5»). Se lee de ahí. (2) El pedido decía e' en **mm/s** con umbral 7:
el 7 es cm/s, que es la unidad de `e_sep`/`e_lat` y la que usan los umbrales del propio archivo.

**Dos votos de la tabla de constricción salían del mismo hecho, y tres votos de dos números.**
Medido: con `e_sep=9` y `e_lat=8` y NADA más, la app firmaba «compatible con pericarditis
constrictiva» — sin un solo dato del pericardio. Y un perfil diastólico de rutina (`e_sep=7`,
`e_lat=6`, `onda_e=100`) firmaba «criterios mixtos […] se recomienda cateterismo cardíaco derecho
e izquierdo simultáneo». Las filas 1-3 salen de dos números de la tab Diastólica que están
cargados en casi todos los estudios. Cerrado con dos marcas en las filas: **`esp`** (específico
del pericardio — sin ninguno evaluado no se concluye NADA) y **`adic`** (los «≥2 criterios
adicionales» son adicionales AL REVERSUS, no las filas anulares que ya lo contienen).
**Al agregar una fila a una tabla de criterios, preguntarse de qué medición sale cada una:
`nC >= 3` cuenta filas, no hechos independientes.**

**Una negación no puede ignorar un hallazgo positivo del mismo párrafo.** El informe decía
«Colapso de aurícula derecha.» y dos renglones después «Sin criterios ecocardiográficos de
compromiso hemodinámico» — el colapso auricular derecho es el signo más precoz y estaba
consignado ahí arriba. La cascada sólo puntuaba `dpt_col_vd`. Hoy los otros tres colapsos, el
swinging heart y la variación tricúspide entran como `otros` y cortan la rama benigna.

**«Sin compromiso» exige los TRES criterios evaluados**, no uno. Con 1-2 hay una rama `parcial`
que nombra lo que falta. Es la regla de MCH: una negación sobre preguntas sin contestar no es una
negación.

**La compuerta de una exclusión tiene que ser el EMISOR, no la clave.** `dptMandaSuma` miraba
`clave` y `dptSuma` exigía además que el tamaño fuera moderado o severo: para derrame **leve y
mínimo** las dos divergían, se suprimía la línea histórica y no se ponía nada — la exclusión sin
reemplazo contra la que el propio comentario advertía. Hoy `dptMandaSuma()` devuelve
`dptSuma() !== ''` y no pueden separarse.

**La supresión del CUERPO y la del EN SUMA no comparten predicado.** Con una sola, el informe
decía «Derrame moderado (10-20mm). Sin masas.» y dos renglones después «Derrame pericárdico
moderado, de distribución circunferencial…». Son dos compuertas: `_dptManda` (EN SUMA, mira el
emisor) y `_dptDescribe` (cuerpo, alcanza con que el módulo describa el derrame).

**Una banda 0-100 no atrapa el error de escala que importa.** `0,25` tipeado por `25` cae dentro,
y `patronRestr` exige `varM <= 25` para afirmar «sin respirofasicidad significativa»: el error de
escala **satisfacía la afirmación de ausencia** y ayudaba a firmar «miocardiopatía restrictiva».
Hoy el intervalo abierto (0,1) se trata como no medido y el informe lo dice; el **0 exacto sigue
siendo una medición legítima** y no se descarta. Verificado en el navegador en los dos sentidos.

**Los rótulos publican el operador que aplica el código.** `f.c`/`f.r` se imprimen verbatim en la
hoja del PDF: la fila de e' septal decía «>7» y aplicaba `>= 7`, así que un 7,0 salía ✅
Constricción bajo un rótulo que lo excluía y ningún rótulo cubría el 7. Y los umbrales de los
rótulos del HTML salen de las constantes por JS (`dpt-lbl-mitral`, `dpt-lbl-tric`), no de un
literal que se queda viejo el día que se mueva el corte.

**`_refrescarInformeSiGenerado()`** se extrajo de `vexusRefrescarInforme` y lo comparten los tres
módulos. Va en `onchange` y NUNCA en `oninput`. Y ojo con la diferencia: **`dptSync`/`cvrSync`
repintan** (son los que van en `RECALC_MODULOS`, donde no se puede tocar el informe del estudio
que se está abriendo) y **`dptCambio`/`cvrCambio` además publican**.

**`onda_e` también alimenta este módulo.** Es el numerador de E/e' vía `hfapeffDatos()`, y sin
engancharlo la hoja del PDF y el narrativo del MISMO documento llevaban dos E/e' distintos. Al
agregar un módulo que lee campos prestados, enganchar **todos** los que alimentan el cálculo — no
sólo los obvios.

**`api-key-protector` daba 30 falsos positivos sobre el idioma `clave` — CORREGIDO 2026-09-13.**
Su regex de «contraseña comparada con literal» trataba `clave` como token de contraseña, así que
matcheaba `st.clave === 'sin_derrame'` — y `clave` es justamente la convención del archivo para la
clave de una conclusión (`dapConclusion`, `coaConclusion`). Ocho ya existían; este módulo sumó 22.
Se sacó `clave` de esa regla **y se conservó en la de declaración** (`var clave = 'secreto'` sí
nombra lo que guarda). Verificado en las dos direcciones, que es lo que hace falta para tocar una
regla: *negativo* — la suite pasa de 34 a 1 hallazgo por esa regla, y los 33 que desaparecen
comparan todos contra tokens de estado (`'restrictiva'`, `'taponamiento'`, `'no_interpretable'`,
`'descartado'`…), ninguno es un secreto; las otras reglas no se movieron (18 + 9 idénticos).
*Positivo* — archivo de prueba con 6 credenciales reales y 6 líneas del idioma clínico: dispara en
las 6 reales (incluida `const clave = 'secretoDeVerdad'`, que caza la regla de declaración) y en 0
de las 6 clínicas. **Un gate que grita 34 veces deja de leerse: ésa es la forma de fallar de un
escáner, y es peor que no tenerlo.**

### Mover un acordeón de tab cambia QUIÉN puede llegar a él — 2026-09-13

Los dos módulos de Pericardio se movieron de 🗂️ Otros a 🫀 Hemodinámica. El markup se movió
verbatim (verificado por MD5: el bloque y **todo el JS del archivo** son byte-idénticos antes y
después), pero **las dos tabs no tienen el mismo régimen de visibilidad**:

- **🗂️ Otros** es un `.tab-btn` del rail, sin `data-mod`. `applyViewMode()` no lo toca nunca:
  visible siempre.
- **🫀 Hemodinámica** es `.tab-btn.tab-special` con `data-mod="hemodinamica"`, dentro de la fila
  `.tabs-special`. En Modo Básico `applyViewMode` oculta **la fila entera**, y en Avanzado el
  botón depende de `eeModOn('hemodinamica')`.

Medido en el navegador a 1280 px: en avanzado con todo tildado las dos se ven; en **Modo Básico**
y con el **módulo destildado en Config**, Hemodinámica desaparece y Otros sigue ahí. O sea que
los dos módulos pasaron de «siempre alcanzables» a «alcanzables sólo en Avanzado con el módulo
tildado» — igual que HTP, TEP, VEXUS y HFA-PEFF, que ya vivían ahí.

**Lo que hace que esto importe y no sea sólo UX:** el dato y sus efectos sobre el informe firmado
NO se van con la tab. Los 19 campos los persiste el barrido genérico de `guardarInforme`,
`dptSync`/`cvrSync` siguen corriendo desde `RECALC_MODULOS`, y la emisión está gateada por
`amiloIntegrado('dpt')`, que mira `#am-wrap-dpt` en la tab **Informe** — que nunca se oculta. Así
que un estudio integrado en Avanzado sigue suprimiendo la línea histórica del EN SUMA y
publicando la valoración de taponamiento cuando el médico abre la app en Modo Básico, **con el
formulario fuera de alcance**. Y `ett_view_mode`/`ett_modules` viven en `localStorage`: son
preferencia **del dispositivo**, mientras la bandera de integración viaja **con el estudio**.

**Deliberadamente NO se gateó la emisión por `eeModOn`.** Hacerlo ataría el contenido de un
informe firmado a una preferencia de la máquina: el mismo estudio saldría distinto en dos
computadoras, que es peor que el problema. Los cuatro módulos que ya estaban en esa tab tampoco
lo hacen. Queda declarado, no resuelto.

**Al mover un bloque de tab, mirar el régimen de la tab destino, no sólo el markup.** El
movimiento puede ser perfecto —byte por byte— y aun así cambiar quién ve el módulo.

**Y los punteros posicionales de las cadenas visibles se pudren con la mudanza.** Tres textos
decían «el campo Pericardio de arriba» / «Cargalo arriba», cierto cuando el módulo vivía debajo
del acordeón «Pericardio y Masas» en la misma tab, falso desde que cruzó de tab. El propio bloque
ya tenía la convención correcta en sus otros seis espejos —`(tab VD/AD)`, `(Doppler)`,
`(Derrame/Taponamiento)`—: **nombrar la fuente, nunca su posición.** Un «arriba» en una cadena
visible es una afirmación sobre el layout que ningún test cubre.

**El manual (`ECO_AYUDA`) enumera el contenido de cada tab**, así que una mudanza lo desactualiza
en silencio. Ya había un comentario propio advirtiendo que dos arrays divergieron y el manual
llegó a decir que Pericardio vivía en dos lugares distintos. Al mover una sección, actualizar el
párrafo de la tab destino — y el de la de origen si queda enumerando algo que ya no está.

### Amiloidosis — rediseño a tres acordeones — 2026-09-13

Las tres subtabs de fondo oscuro pasaron a ser tres acordeones con el patrón de Hemodinámica.
El Score ETT quedó en cuatro columnas con el resultado ABAJO, el Algoritmo en dos, y la Guía
intacta. **Ningún id de campo cambió**: 74 de 78 sobreviven y las cuatro bajas son `amilo-root`
(pasó a clase) y los tres contenedores de subtab.

**El scope CSS pasó de `#amilo-root` a `.amilo-root`.** No es cosmético: el estilo del módulo
tiene que aplicarse a los TRES cuerpos de acordeón y un id no se puede repetir. El armazón del
acordeón queda FUERA de ese div a propósito — `.amilo-root *{margin:0;padding:0}` y
`.amilo-root .card` pisan el estilo global, y adentro el header no se vería como los de
Hemodinámica, que era justo lo que se pidió igualar. **Contrapartida asumida:** 102 selectores
perdieron un escalón de especificidad (id → clase). Hoy ninguna regla global les gana —está
verificado contra los bloques `<style>` posteriores—, pero una regla global de dos clases sobre
`.card`, `.btn` o `.badge` cambiaría el módulo sin error. Si hace falta red: `@layer` o duplicar
la clase (`.amilo-root.amilo-root`).

**Contar `<div>` NO detectó un desbalance semántico, otra vez.** Al componer el Algoritmo reusé
un fragmento que arrastraba el `</div>` de un contenedor que no incluí: las etiquetas cerraban
—el conteo daba 0— pero la `.card` cerraba ANTES del centellograma, la grilla `cols2` quedaba
con tres hijos y el bloque del centellograma sin tarjeta. Mi chequeo en el navegador tampoco lo
vio porque conté `:scope > .card`, y el intruso era un `<div>` pelado. **Contar hijos no alcanza:
hay que contar los hijos ESPERADOS y comprobar que cada uno sea lo que se supone que es.**

**Autollenado desde otras pestañas** (`_AM_FUENTE` + `amAutoLlenar` + el botón «↓ Traer del
formulario»). Decisión de Maicol: el médico no retipea lo que ya está cargado. RWT ← `ppvi`/
`ddfvi`, E/e' ← `onda_e` y el `eprom` de `hfapeffDatos()` —que se expuso en vez de escribir la
quinta copia de la fórmula—, TAPSE ← `tapse`, SGL ← `sgl`. El ápice/base no tiene fuente y sigue
manual. Tres reglas que costaron las dos revisiones:

1. **El signo del SGL se normaliza EN EL BORDE.** `sgl` no tiene `min` ni `max` y el resto del
   archivo ya sabe que puede venir con cualquier signo (sus dos consumidores lo envuelven en
   `Math.abs`). El autollenado lo pasaba crudo a un umbral CON signo: con el strain cargado en
   absoluto —18, que es NORMAL— `18 >= -13` daba verdadero y marcaba «|SGL| ≤ 13%». Un punto de
   más, **siempre hacia el sobrediagnóstico**, y justo el que mueve un 7 a un 8, que es el corte
   de «amiloidosis muy sugestiva». Lo encontraron las dos revisiones por separado.
2. **TODOS los insumos o ninguno, y en dos pasadas.** Con uno solo rellenado, la función de
   cálculo cae en su rama «falta un dato» y `amCalcSinDato` DESMARCA el criterio: traer datos a
   medias restaba 1 punto (E/e') o 3 (RWT) sobre un estudio ya firmado. Y la primera versión, con
   una sola pasada, dejaba escrito el insumo que sí tenía fuente aunque devolviera «no llené».
3. **Va detrás de un BOTÓN, no de abrir el acordeón.** Colgarlo de la apertura convertía el gesto
   de MIRAR en uno de escribir — uno toca «Calcular ▾» para ver de dónde salió un criterio— y
   sobre un criterio que el médico había DESTILDADO a propósito lo volvía a marcar en silencio,
   porque `toggleCrit` limpia el origen al destildar (deliberadamente, su comentario lo explica)
   y `amAplicarCalc` sólo respeta `'manual'`. Con el botón, traer el dato es una decisión y no un
   efecto colateral, y `toggleCrit`/`amAplicarCalc` quedaron sin tocar.

**Hoja propia del PDF.** Con el Score ETT **y** el Algoritmo integrados los dos, se dibuja
«EVALUACION DE AMILOIDOSIS CARDIACA» aparte; con uno solo vuelven a la hoja de ETT Avanzado. La
condición es tener los dos, así que no se marcó el grupo en `amiloSecs()`.

**Lo que NO se cambió, y por qué.** Los textos de las cuatro conclusiones del algoritmo se
conservaron enteros (decisión de Maicol): los del pedido eran más cortos y perdían la distinción
entre «sin captación + proteínas anormales» (→ RMC primero) y «con captación + proteínas
anormales» (→ biopsia obligatoria: puede ser ATTR con GMSI, AL, o coexistencia). Verificado por
MD5 que `calcETT`, `actualizarAlgoritmo`, `amiloTextoETT` y `amiloTextoAlgoritmo` quedaron byte
por byte iguales. Las bandas del score también: ya cruzaban HVI y criterios cualitativos, que es
más de lo que pedía la especificación.

### Amiloidosis — estilo sobrio, y dos regresiones que metió el propio ajuste — 2026-09-13

Cambio declarado como «sólo visual», y lo fue en JS: ids 1667 → 1667 sin altas ni bajas,
handlers inline 925 → 925, y los cuerpos de `calcETT`, `actualizarAlgoritmo`, `amiloTextoETT` y
`amiloTextoAlgoritmo` byte por byte iguales. Pero **un cambio de CSS puede romper cosas medibles**,
y este metió dos.

**`:not()` APORTA la especificidad de su argumento.** Para excluir el botón del reset del módulo
escribí `.amilo-root *:not(.btn)`, creyendo que seguía valiendo (0,1,0). Vale **(0,2,0)**, así que
pasó a ganarle a `.amilo-root label` y `.amilo-root select`, que son (0,1,1). Medido: los cuatro
`<select>` quedaron con `padding:0` y **20 px de alto** —y `select` NO está en la allowlist de la
regla táctil de 44 px, así que nadie los rescataba— y los 19 `<label>` perdieron su
`margin-bottom`. La forma correcta es **`:where(:not(.btn))`**: `:where()` aporta especificidad
CERO y el selector vuelve a valer exactamente lo que valía. Lo cazó el `/differential-review`
midiendo el alto del select, no leyendo el selector.

**Volver flex un contenedor sin `min-width:0` desborda.** Las tarjetas de proteínas monoclonales
pasaron a `display:flex` con tres hijos en fila: un hijo de flex no baja de su min-content, así
que desbordaban 33 px a 375 y 16 px a 768. Y la primera corrección —`min-width:0` en el último
hijo— **seguía desbordando a 768**, porque los tres hijos competían por la fila. Lo resolvió
`flex-wrap` con la descripción a `flex-basis:100%`. **Al compactar algo, medir a 375 y a 768, no
sólo en el escritorio.**

**Los botones no se re-estilan: se borran los overrides.** El módulo tenía su propia escala
(13px/700, padding 9×18, radio 9) y se veía el doble de grueso. Borrar `.amilo-root .btn*` deja
actuar al `.btn` global, que es el de Hemodinámica — verificado byte a byte en las ocho
propiedades. Replicar los números habría funcionado igual hoy y se habría desincronizado el día
que se ajuste el botón global.

**La señal clínica no se degradó, y eso se verificó explícitamente.** El panel de conclusión
perdió los cuatro gradientes pero la severidad sigue en el borde izquierdo de color (púrpura /
rojo / ámbar / verde, cuatro tonos distintos medidos) y en el emoji, y el estado «sin conclusión»
es `display:none`, así que no hay un panel gris con el que confundirse. Las cuatro clases
(`prob-alta`, `prob-baja`, `biopsia`, `intermedio`) conservan sus nombres porque las escribe
`actualizarAlgoritmo`.

**Ningún hex fijo dentro de `.amilo-root`: es un subárbol de DOS temas.** `.grado-3` usaba
`#8B0000` —color pensado para fondo blanco— y en el tema oscuro, que es el default, daba ~1,7:1:
el grado Perugini **más severo**, el que da VPP 100% para ATTR, era el **menos visible** de los
cuatro. Bajar el número de 22 px a 14 px lo empeoró. Hoy sale de `--red-fuerte`, definido por
tema. Lo mismo con `.warn-box` (`#7A4F00`, ~1,8:1) y `.info-box`: pasaron a la convención del
resto de la app —fondo neutro, borde izquierdo de color, texto en el gris del tema—. **La caja se
veía de color y las palabras no se leían**, que es la regla de `badge()` por otra cara: la señal
llegaba, el contenido no.

**Los dos botones destructivos piden confirmación — CERRADO 2026-09-13.** «Limpiar» y «Nueva
evaluación» se ven idénticos a «Integrar al informe» (`.btn-ghost` y `.btn-integrar` tienen
declaraciones byte a byte iguales), que es consecuencia de unificar el estilo. Cuatro cosas que
costaron la revisión:

- **El `confirm()` va en un ENVOLTORIO, no dentro del reset.** `resetETT` y `resetAlgoritmo` las
  llama también `limpiarCampos` en cada «Nuevo estudio» y al abrir otro estudio: el diálogo
  habría aparecido en una ruta automática, delante de alguien que no apretó nada.
  `resetETTConfirmar`/`resetAlgoritmoConfirmar` los llaman SÓLO los dos botones, y las funciones
  crudas no cambian para ningún otro llamador —ni para los que se agreguen mañana—.
- **El predicado falla CERRADO.** `_amHayDato` devolvía `false` si no encontraba la sección: sobre
  una acción destructiva, «no la encuentro» no puede significar «no hay nada que perder», y el
  modo de falla era mudo — si cambia el id del contenedor, el borrado sigue funcionando y lo único
  que desaparece es la confirmación. Hoy devuelve `true`. Este módulo ya renombró sus contenedores
  una vez.
- **Un valor que parsea a 0 no es dato, y no es una regla nueva:** es la que ya aplican los
  consumidores (`actualizarAlgoritmo` lee el score con `PF(...) || null`). Sin eso, «→ Pasar score
  al Algoritmo» con el score vacío escribía un `'0'` y «Nueva evaluación» preguntaba sobre un
  algoritmo en blanco. Dos criterios distintos sobre el mismo dato, otra vez.
- **`gradoGamma !== null`, nunca truthiness.** `selGrado(0)` es «No capta nada», una respuesta
  clínica real con valor `0`; un `!gradoGamma` la habría tratado como vacío y el botón habría
  borrado el centellograma sin preguntar. Y las dos variables de módulo van al predicado aparte:
  el barrido del DOM no las ve porque no son campos del formulario.

De paso se guardaron los tres `getElementById` pelados del final de `resetETT` **en la fuente** y
no envolviendo la llamada nueva: arregla a los dos llamadores y al tercero que venga. Un throw ahí
abortaba antes de `calcETT()` y dejaba los campos vacíos con el panel del score mostrando todavía
el número del paciente anterior.

### Cardio-Oncología y Eco Pulmonar a acordeones · botón HC — 2026-09-14

Dos conversiones a acordeón (`.card` + `h2.card-head` + `toggleCard`, el patrón de Hemodinámica)
y un botón placeholder. Sin bajas de id en todo el archivo y balance de `<div>` sin cambios.

**`secAutoOpen` NO alcanza a los acordeones `toggleCard`.** Sólo recorre `.sacc`, así que ninguna
sección del patrón `toggleCard` se auto-abre cuando tiene datos. Consecuencia en Cardio-Oncología:
un estudio con cardiotoxicidad severa calculada se ve como cuatro barras cerradas, sin indicio de
que adentro hay algo. **No lo introdujo este cambio** —Hemodinámica, Congénitas y Amiloidosis se
comportan igual desde antes— pero ahora alcanza a un módulo cuyo rótulo decide si se suspende una
quimioterapia. La pieza para cerrarlo ya existe: `.incl-badge`, que se creó justo para «el botón
vive DENTRO del cuerpo colapsable y con la sección cerrada no se veía nada».

**El botón HC va como HERMANO del `.sacc-hdr`, no adentro.** Ese header ya ES un `<button>`:
anidar botones es HTML inválido y, peor, el handler de afuera se come el clic de adentro — tocar
HC habría abierto el acordeón en vez de la historia clínica. Va en `position:absolute` sobre la
barra; verificado que no se recorta por el `overflow:hidden` de `.card`, que no dispara
`secToggle`, y que conserva sus eventos en PC, donde `#tab-datos .sacc .sacc-hdr` tiene
`pointer-events:none`.

**La visibilidad se decide con `_dupSinDato()`, nunca con `!== ''`.** `guardarInforme` guarda
`ci || '—'` con raya U+2014, así que **toda** ficha sin cédula «tiene» algo en el campo. Medido:
con `'—'` el botón queda oculto, como corresponde. Y `hcSync` entró a `RECALC_MODULOS` y a
`limpiarCampos` porque las rutas de restauración asignan `.value` sin disparar `oninput`.

**Los 44×44 del botón NO salen de la suma del padding** (12+19,5 = 43,5): salen de que
`.sacc-hdr` también es un `<button>` y la regla táctil global lo estira a 44. Coinciden por la
regla, no por la aritmética — si algún día se le hace excepción a esa regla para compactar la
barra, hay que revisar este botón.

**Un botón que no hace nada visible se lee como que la app se colgó.** `hcAbrir` era sólo un
`console.log`; se le agregó un toast. No es panel ni modal —eso llega con Supabase—, es la señal
mínima de que el clic llegó. Y **no loguea el documento**: un `console.log('HC: ' + ci)` metería
un identificador de paciente en una superficie que nadie limpia.

### `cardAutoOpen` — auto-apertura de los acordeones `toggleCard` — 2026-09-14

`secAutoOpen` sólo recorre `.sacc`, y **Hemodinámica no tiene ninguno**: son 5 `toggleCard`, igual
que los 3 de Amiloidosis y los 2 de Pericardio. O sea que de los acordeones de la app, los únicos
que se abren solos cuando tienen datos son los 12 `.sacc` de Congénitas. La premisa «que se abran
igual que los de Hemodinámica» era falsa: aquellos tampoco lo hacían.

`cardAutoOpen(tabId)` es la hermana para el patrón `toggleCard`, y es **opt-in por
`data-autoopen`** en el div de sección, no automática para todo `toggleCard`: abrir de golpe los
10 acordeones de las otras tres pestañas habría cambiado el comportamiento de algo que nadie pidió
tocar. Hoy lo llevan las tres secciones de Cardio-Oncología que tienen campos —la de referencia no
tiene ninguno, así que no se marcó—. Sumar otra es agregarle el atributo.

Mismas exclusiones que `secAutoOpen` (`:not([readonly])`, `:not([data-espejo])`) y por el mismo
motivo: un espejo es dato de OTRA sección mostrado por comodidad, y contarlo abre secciones de
pacientes que no tienen esa patología. Y repinta la flecha: abrir por código sin tocarla deja el
afford diciendo «cerrado» sobre una sección abierta.

### MCH y MCA — párrafos en el informe y tabla por columnas — 2026-09-14

Cambio de PRESENTACIÓN. Ninguna oración clínica se tocó: las 16 de `mchConclusion` y las 22 de
`mcaConclusion` son las mismas y en el mismo orden, verificado de dos maneras —capturando la
salida de 4 escenarios ANTES de editar y comparando frase por frase después (cero perdidas, cero
inventadas, orden idéntico), y releyendo los `partes.push` contra `git show HEAD`—.

**Los párrafos se emiten como ELEMENTOS SEPARADOS de `etePars`, nunca como un string con `\n`.**
`_infEscribir` trata `lineasNuevas` como un array de LÍNEAS y `_infMerge` compara línea contra
línea: un salto embebido deja `base` con un elemento donde `actual` —que sale de
`value.split('\n')`— tiene varios, y el merge siguiente toma esas líneas por texto escrito por el
médico. La protección de las ediciones manuales se rompe en silencio. Vale igual para el EN SUMA,
por eso `sumaCC` acepta un array y no un string con saltos.

**`_ccParrafos(partes, cortes)` corta el MISMO array, no re-deriva nada.** `txt` sigue siendo
`partes.join('. ')` para la tarjeta de pantalla, así que pantalla e informe no pueden divergir.
Agrupar sin reordenar fue deliberado: reordenar habría hecho imposible probar que no se perdió
ninguna oración.

**La tabla de MCA quedó en cinco mini-tablas, una por categoría, y cada una conserva sus `<tr>`.**
No es decorativo: `mcaTogglePunto` resuelve la fila con `cel.closest('tr')` para apagar el hermano
de la misma fila, y su guarda es `if (fila)` — sin un `<tr>` ancestro la exclusión mutua se
perdería SIN ERROR. Las 17 celdas se movieron verbatim: mismos ids, mismos `onclick`, mismos
`title`. Conteo Task Force verificado por clic real: jerarquía, duplicados y desmarcado intactos.

**Lo que la revisión encontró y hay que recordar:**
- **`ccSumaLinea` tiene nueve llamadores y uno NO pasa por `sumaCC`**: el del PPT hacía
  `String(array)` → los criterios salían pegados por comas. Sin error, y el único lugar donde se
  veía era el proyector. Al cambiar el tipo de retorno de una función, contar los llamadores.
- **`.mca-tabla th` lleva `text-transform:uppercase`**, así que los encabezados `M` y `m` de
  Mayor/Menor renderizaban los dos como «M». Hoy dicen «May.» y «Men.».
- **Las salvedades del EN SUMA arrancaban en minúscula**: se escribieron para ir tras un ` — ` a
  mitad de frase y como línea propia quedaban mal en un informe firmado.
- **El blanco de toque de las celdas cayó de 52 a 26 px** al angostar las columnas. Restituido a
  ~34×29. Sigue por debajo de los 44 px de la guía, como ya estaba antes.

**El ajuste A4, medido y no estimado.** El EN SUMA de MCH pasó de 1 línea a 3-4, y el renglón del
EN SUMA es el caro: `_pdfAjustarA4` no toca `PDF_FS_FIJO`, así que la escalera casi no lo
recupera. A/B sobre el mismo estudio pesado (MCH + MCA integradas), con `generarPDFReal({medir:true})`:
**antes 2 hojas de cuerpo, ahora 2** — el cambio suma 3 líneas al EN SUMA y 6 al cuerpo y no agrega
hoja. Un estudio exactamente en el borde sí podría volcar, y eso es inherente a «una línea por
criterio». Si aparece, la palanca es juntar las salvedades con la línea de la AHA.

## Deuda conocida sin resolver

### Reabrir un estudio deja tres capsulas en «—» (TC-GR-13, abierto)

`cargarEstudioPorId` (~L32394) recalcula CINCO funciones —`calcVI`, `calcAI`, `calcAorta`,
`calcVD`, `calcVEXUS`— mas `RECALC_MODULOS`. La reimpresion, que es la otra ruta de restauracion,
recalcula CATORCE, y entre las que le sobran estan **`calcPSAP`, `calcSGL` y `calcBSA`**. Esas
tres escriben capsulas que nadie mas repone.

Medido: `psap-interp` «37 mmHg (PmAD 3 mmHg)» → «—», `sgl-interp` «SGL -14%» → «—», `bsa-val`
«2.00 m²» → «— m²». Las demas vuelven bien porque sus funciones si estan en la lista.

**El informe NO se ve afectado**: el narrativo lee los inputs readonly (`psap_calc`, `pmad`), que
viajan en `campos` — por eso TC-GR-10 pasa y el PDF reabierto sale identico. Lo que queda mal es
la PANTALLA, que muestra «—» mientras el informe de ese mismo estudio dice «PSAP estimada de
37 mmHg». Es la contradiccion capsula/informe que este archivo se cuida de evitar, en la ruta que
usa el QR del PDF — o sea la que abre un colega. El arreglo son tres nombres en esa lista.

### El barrido del suite: qué quedó abierto (2026-09-15, segunda tanda)

De los cuatro defectos que abrió el barrido **no queda ninguno**. El suite no tiene casos ⊘.
Los cuatro están documentados en «Trampas»: c7/c8 del TEER en «Un criterio que se pinta y no se
cuenta» y «Convertir decoración en decisor cambia lo que significan sus insumos»; la AI por
diámetro AP, en la lección de las asimetrías entre rutas de medición; y c1b, decidido como
**advertencia** (ver abajo).

**c1b es advertencia, no veto — decisión de Maicol, 2026-09-15.** Las guías no lo tratan como
contraindicación: es factibilidad técnica del operador. Lo que cambió con la decisión no es sólo
que siga fuera del `veto`, sino que **lo diga**: el texto de fallo pasó a «Advertencia: agarre
difícil, evaluar con el operador. No modifica el veredicto», la cápsula lo pinta en amarillo con
«⚠» en vez de rojo con «✗» —el color sale de `r.vetoIds`, derivado de la misma lista que decide
el veredicto, para que no pueda desincronizarse—, la ayuda del campo dice «Ideal» y no «Req», y
la tabla de Referencias lo saca de «Inclusión» y le da su propia línea. **TC-86 dejó de ser
`casoAbierto` y pasó a caso normal**: sostener un xfail que dice «debe pesar en el veredicto»
DESPUÉS de decidir lo contrario es peor que no tenerlo — el runner exigiría promoverlo el día
que alguien lo «arregle», o sea que empujaría activamente hacia la conducta descartada.

### Cardio-Oncología: qué queda sin atar (2026-09-15)

Cerrado el 2026-09-15: el clasificador, el filtro de cohorte y `CO_UMBRAL_FEVI_SEVERA` (el 40,
que estaba escrito cuatro veces) leen las constantes; las **dos** tablas estáticas se corrigieron;
y las cinco copias sueltas de las fórmulas de caída pasan por `_ctrcdGlsRel` / `_ctrcdFeviCaida`.
Lo atan TC-88, TC-93, TC-96 y TC-97.

**Lo que queda, y por qué se dejó:**

- **La prosa de `calcCardioOnco`** nombra los números al lector: «(40-49)», «(>=50)», «(>= 15%)»
  y los cuatro que dicen 40 con palabras. No decide nada, pero un rótulo que contradice al
  veredicto de al lado es un informe firmado que se desmiente solo.
- **Las dos tablas estáticas** son HTML y no pueden leer una constante. Ya no contradicen al
  código, pero si alguna constante se mueve hay que tocarlas a mano.
- **`gt15` del filtro de FEVI** sigue siendo un 15 literal a propósito: es una segunda banda, más
  estricta, que el clasificador no usa — no hay dos copias que puedan divergir.

**El `n` de las cohortes de cardio-onco cambió.** El filtro pasó de `>` a `>=` para coincidir con
el clasificador, así que los estudios parados en el corte exacto —una caída de 10,0 pp, un GLS de
15,0 %— ahora entran donde antes quedaban afuera de su propia cohorte. Las tres etiquetas dicen
«≥», incluida la del encabezado del PDF de auditoría, así que dos PDF del mismo filtro se
distinguen por su texto. **Cualquier cohorte exportada antes de hoy tiene un `n` menor sobre los
mismos datos.**

### El redondeo de cardio-onco ensanchó la banda 0,05 pp — decidido, no descubierto

**Cerrado el 2026-09-15**, pero con una consecuencia que hay que tener escrita. `_ctrcdGlsRel` y
`_ctrcdFeviCaida` redondean a un decimal, que es la precisión con la que esos números se
PUBLICAN. El motivo era una contradicción dentro de la misma hoja firmada: `-18 → -15.3` daba
`14.999999999999996`, fallaba `>= 15`, y el paciente salía «Sin toxicidad detectada» en verde
mientras la interfaz mostraba «15,0 %». Ídem `64.1 − 54.1 = 9.999999999999993` impreso «10.0 pp»
bajo un pie que declara el umbral en ≥10.

**El umbral efectivo pasó a ser «crudo ≥ 14,95».** Verificado por barrido: **cero** casos donde el
redondeo quita un positivo —el falso negativo en verde está cerrado— y **~19 pares** en rango
clínico donde lo agrega y el crudo está genuinamente por debajo (−29,4 → −25 da 14,966). Para
esos el crudo sí es más exacto. Es un ensanchamiento de 0,05 pp **aceptado**, coherente con la
regla de la casa (lección 6: clasificar el valor que se imprime) — pero es una decisión clínica,
no una corrección aritmética, y el comentario de la función lo dice con esas palabras.

### TEER: lo que queda reportado y sin tocar (2026-09-15)

- *(Cerrado el 2026-09-15 — ver «El cero se rechaza donde no puede ser una medición», en
  Trampas.)*
- **`_teerAplica` admite los criterios COAPT por el primer brazo de `usaTeer`.** Con
  `teer_tipo_im='secundaria'` consignado y ningún otro campo TEER cargado, `ingresados` llega a 2
  por los dos espejos y el estudio cae en un veredicto del panel en vez de en «Sin criterios
  anatómicos cargados». Alcance estrecho y no sale del dashboard del Laboratorio.
- **La asimetría de `null` en c9/c10 entre pantalla y Laboratorio.** En `teerEstado` un select de
  calcificación/clefts sin evaluar es «no ingresado» y baja el veredicto a «Posiblemente apto»;
  en el Lab sólo puede sumar a `fallados` y nunca entra en `_aplican.length`. Un estudio con los
  siete numéricos y los dos selects en «— no evaluado —» sale «⚠️ Posiblemente apto» en la hoja
  firmada y «✅ Apto» en la estadística. Preexistente.

### Dos arreglos sin cobertura automática (2026-09-15)

Verificados leyendo el código y razonando la cadena, **no** por un caso del suite. Se dice acá
para que no se lean como cubiertos:
- **El respaldo de `_amiloUltimo` en la reimpresión.** Probarlo exige generar un PDF real con
  jsPDF y esperar el `setTimeout` de la restauración; es demasiado frágil para este suite.
- **Los segmentos del bull's eye, pintados con el mouse.** TC-GR-15 prueba que la
  contractilidad y el strain VIAJAN con el estudio (serializar, guardar, reponer) escribiendo
  `contrEstado` / `strainEstado` en memoria. Pintar el diagrama a mano y verificar los colores
  tras reabrir **requiere verificacion manual**.
- **La reimpresion a PDF de un estudio guardado.** TC-92 y TC-GR-06/07/11 cubren el TEXTO que
  baja al PDF; el dibujo con jsPDF y el `setTimeout` de la restauracion posterior, no.
- **Dos estudios con el mismo `estudioId`.** Poner un id fijo en `guardarInforme` no pone nada en
  rojo: cada caso guarda uno solo y lo borra. `getInformes` deduplica por `id`, no por
  `estudioId`, asi que dos estudios con el mismo `estudioId` conviven y `cargarEstudioPorId`
  abre el primero. Sin cobertura.
- ~~La guarda `cero:'no'` de `TEER_CRIT`.~~ **Cerrada por TC-98**, que verifica sobre el
  FUENTE que las dos listas coincidan. Es la única verificación textual del suite; ver por qué
  en «El cero se rechaza donde no puede ser una medición».
- **La hoja de cardio-onco que `_coFila` dibuja con jsPDF.** Su copia de las fórmulas se ruteó a
  `_ctrcdGlsRel` / `_ctrcdFeviCaida`, pero `_coFila` es un closure dentro de la función del PDF y
  no se alcanza desde el harness. TC-97 cubre el TEXTO DEL MÓDULO INTEGRADO, que es otra
  superficie — la etiqueta del caso lo dice para no prometer de más. Lo mismo el export PPT.

**Cómo se descubrió que no estaba cubierta:** revirtiendo el arreglo en una copia y viendo que el
suite seguía en verde. Un caso cuya etiqueta nombra una superficie que no toca es peor que no
tener el caso: se lee como cobertura. La mutación es lo único que lo delata.

### VD / válvula pulmonar / TEER / HFA-PEFF (2026-09-14) — reglas para no romperlo
- **El grado del VD sale de `vdBasCat`, no de un `> 41` suelto.** Había dos umbrales sobre la
  misma medida —`VD_BAS_NORMAL_MAX` (41, normal) y `VD_BAS_LEVE_MAX` (45, dilatado)— y el informe
  contestaba «¿está dilatado?» con el primero mientras la cápsula decía «Leve (>41 y ≤45mm)». Hoy
  el narrativo dice «levemente dilatado» / «dilatado» según la misma función que pinta la
  cápsula. Si aparece un tercer consumidor, que también pase por ahí.
- **`calcVP` corre en `cargarEstudioPorId` y NO en la reimpresión.** Es deliberado: reimprimir
  reproduce lo que se firmó, aunque lo firmado tuviera el gradiente congelado; abrir para editar
  lo corrige, que es cuando el médico está mirando. Consecuencia aceptada: en un estudio viejo
  con el gradiente mal, reimprimir y editar+regenerar **no** dan el mismo PDF. Es la misma
  divergencia que ya tiene el HFA-PEFF cuando la compuerta de FEVI lo retira al reabrir.
- **`_labHfPeffRaw` excluye los estudios con FEVI reducida.** Esto **cambió los conteos
  históricos** del panel, del filtro de cohorte y de las asociaciones, en la dirección correcta:
  esos estudios nunca debieron puntuar. Si un número del Laboratorio no coincide con una captura
  vieja, es por acá.
- **`_HF_ALIAS.fevi` incluye `fevi_simpson`.** Sin ese alias la compuerta no podía bloquear
  NINGÚN estudio importado de PDF: caían todos en «sin FEVI». Cualquier campo nuevo que el
  importador emita con otro nombre necesita su entrada acá, igual que en `_labFevi`.
- **La compuerta de FEVI se consulta por `r.gate`, no recalculando.** Hay cinco superficies
  (pantalla, línea del Doppler, hoja del PDF, En Suma, Laboratorio) y el `gate` viaja dentro del
  resultado de `hfapeffScore`. Eso **no** obliga a nadie a mirarlo —el Laboratorio no lo miraba—:
  cualquier consumidor nuevo de `r.total` tiene que preguntarse primero si aplica.

### EAo / VLI / TEER / VD / aorta (2026-09-14, segunda tanda)
- **`eaEscenario()` es la fuente única del escenario de estenosis aórtica.** El GRADO lo sigue
  fijando `ea_grado` (decisión de Maicol); el algoritmo aporta el subtipo y los números, y
  `discordanciaGrado` publica el desacuerdo en vez de resolverlo en silencio. El AVA pasa por
  `avaEsSevera`/`avaEsModerada`, NO por un `<=` propio.
- **El VLI decide «paradojal» vs «flujo normal»**, dos conductas opuestas. Está en `vliCalc()`,
  con campo, cápsula, fila del PDF y columna del Excel, y `_vliPintar` está en `RECALC_MODULOS`.
- **`calcVD`, `calcTEER` y `calcOAI` están en `RECALC_MODULOS`** aunque sean `calc*`: los tres
  pintan estado que no es sólo un número (la cápsula de los tres diámetros, los `display` de los
  bloques del TEER, y la marca de «área derivada» de la orejuela).
- **La EAo LEVE no va al En Suma** (pedido explícito) pero llama `ccMarcarParrafo()`: el silencio
  es «no listarla», no «negarla» con el fallback de «sin alteraciones significativas».

**Queda abierto, sin tocar en este commit:**
- **El anillo aórtico del TAVI tiene UN solo diámetro** (`ete_tavi_anillo_diam`, «ETE 120–140°»),
  así que no se puede calcular el área ni el perímetro de la elipse: de un diámetro sale un
  círculo, que es lo que el anillo aórtico no es. Área y perímetro siguen tipeándose a mano,
  normalmente desde el TAC, que es el gold standard del sizing. Decisión de Maicol (2026-09-14):
  no agregar campos. Si mañana se agregan «mayor» y «menor», el perímetro va con **Ramanujan**
  —`π·[3(a+b) − √((3a+b)(a+3b))]`— y no con `π·√((D1²+D2²)/2)`, que es la aproximación RMS y
  suele citarse con el nombre equivocado; difieren ~0,3 mm en un anillo de 26×20.
- **La modalidad de la distancia coronaria no viaja al PDF.** La nota «preferentemente de TAC
  multicorte» está al lado del campo, pero el párrafo del informe imprime «Distancia al anillo:
  coronaria izquierda 9 mm» sin decir si salió de TAC o de ETE. Si el número decide riesgo de
  oclusión, la modalidad debería salir con él — haría falta un select `ete_tavi_cor_fuente`.
- **El área del ostium de la orejuela viaja al Laboratorio sin distinguir estimada de medida.**
  Desde que se calcula desde el diámetro, `oai_area_ostium` mezcla una estimación CIRCULAR con
  las mediciones 3D directas en el promedio del panel ETE, y como la marca `derivadoDe` no se
  persiste, no hay forma de separarlas retroactivamente. Si el dato va a usarse para estadística,
  necesita bandera propia persistida, del estilo `<id>__tocado`.
- **`teer_flail_gap` sigue sin leerlo nadie**, y ahora pesa más: con `c4` gateado a IM secundaria,
  la vía primaria se quedó sin ningún veto de gap/profundidad, con el campo visible al lado. Un
  flail gap de 20 mm en IM primaria da hoy «APTO».
- **`c2` evalúa `teer_gap` (rotulado «Longitud coaptación», donde MÁS es mejor) contra `<= 10`,
  que es el umbral del flail gap.** Vota invertido: una coaptación de 12 mm sale ✗ y una de 0 ✓.
  Preexistente, pero ahora es uno de los criterios del veto de IM secundaria.
- **Cambiar el tipo de IM con la hoja TEER integrada y editada a mano** no la retira: es un cambio
  de PREMISA, igual que la FEVI en el HFA-PEFF, y ahí sí se resolvió.
- **El panel de indicaciones de CIA sigue preguntando sólo por `vd_bas`.** Puede ser correcto (el
  criterio ASE de sobrecarga es sobre el basal), pero son dos respuestas a «¿está dilatado el VD?».
- **`_IG_SECTIONS` no lista `diam_cayado` ni `diam_ao_toracica`**: el detalle del estudio guardado
  los calla en vez de fallar.
- **`teer_*` no está en el Excel del Laboratorio.** El módulo ya llega al informe firmado pero
  sus campos no tienen columnas propias; el panel ETE del Lab reconstruye los criterios con su
  propia lista (`TEER_CRIT`), que es una **segunda copia** de los umbrales de `teerEstado()`. La
  de `teerEstado` es la que manda; si divergen, las dos superficies cuentan cohortes distintas.
  Además `TEER_CRIT` sigue sin contar clefts ni trombo.
- **`ip_grado` / `ip_vmax` / `ip_vtd` tampoco están en el Excel.** Hoy la insuficiencia pulmonar
  llega al informe y al PDF, y no al Laboratorio.
- **`vd_area_d` / `vd_area_s` no tienen banda de plausibilidad** en `DCM_RANGO` ni en los rangos
  de importación del Excel. La guarda de `calcVD` sólo rechaza el par imposible (telesistólica
  ≥ telediastólica, o cero), no un área de 300 cm².
- **`_syncDerivado` no valida unicidad del destino.** Con dos orígenes apuntando al mismo campo,
  gana el último en silencio. Hoy hay un solo mapeo; el módulo TEER ya tiene el patrón de dos
  orígenes resuelto por precedencia explícita con `_syncSiVacio`, así que es cuestión de tiempo.

### Pericardio en el Laboratorio — fuente inyectable (2026-09-14)
El módulo (`dptEstado`, `cvrEstado`, `dptTamano`, `dptPletora`, `cvrDatos`, `_dptPct`, `_dptMm`)
leía el DOM directo. Ahora tiene **fuente inyectable**: `_pcSrc` en `null` = formulario en
pantalla; `_pcCon(campos, fn)` la apunta a un estudio y la restaura en un `finally`. Lo usan el
Excel (22 columnas nuevas, bloque `17 · PERICARDIO AVANZADO`) y el filtro de cohorte.

**Reglas para no romperlo:**
- **Toda lectura del módulo va por `_pcV` / `_pcSv` / `_pcChk`.** Una sola que quede en `v()`,
  `sv()` o `_amChk()` hace que la columna del Excel mezcle la fila con el paciente EN PANTALLA,
  y eso parece correcto. Ya pasó dos veces en este mismo commit: `_amChk('dpt_swinging')` hacía
  que un swinging marcado en pantalla sacara toda fila con derrame como «incipiente», y `_dptMm`
  leía los tres milímetros de la pantalla.
- **Los checkbox NO son `_pcSv`.** En `campos` viven como `<id>__chk` con '1'/'0'. Para eso está
  `_pcChk`.
- **`cvrDatos` con fuente usa `hfapeffDatos(_hfSrcCampos(_pcSrc))`.** Saltearlo dejaba `ee` en
  null, y `patronRestr` lo exige: `restrictiva` era **inalcanzable** desde el Excel y el filtro
  —la opción devolvía cero siempre— y `constrictiva` se subdeclaraba, porque «E/e' < 15» vota
  por constricción. De paso resuelve los alias (`e_prima_sept`, `gls_global`) que `_pcV` no sabe.
- **`_pcHayDpt` NO puede mirar `pericardio` a secas.** Ese `<select>` no tiene opción vacía y
  arranca en «Normal, sin derrame», así que `guardarInforme` lo persiste en todos los estudios:
  la guarda daba `true` siempre y la columna salía «sin_derrame» en las 305 filas. Mira que el
  select diga algo distinto de normal, o que haya un campo propio del módulo.
- **`_pcHayCvr` NO puede mirar `e_sep`/`e_lat`.** Son de la tab Diastólica y están en casi todos
  los estudios.
- **Las dos guardas viven en UN solo lugar** (`_pcHayDpt`/`_pcHayCvr`). Estaban duplicadas entre
  `_labExcelRow` y `_labCohorteOk`: si divergen, el Excel y el filtro cuentan cohortes distintas
  sobre los mismos datos.
- **Las opciones del filtro son las claves EXACTAS de cada cascada.** `dptEstado` devuelve siete
  y `cvrEstado` cinco. Inventar una —puse «compromiso», que no existe— da una opción que filtra a
  cero siempre, sin error. Y `mixto` y `no_concluyente` son claves DISTINTAS: la primera es «vota
  por las dos», la segunda «no alcanza para ninguna».
- **Prefijos «DPT » y «CVR » y no «Pericardio »:** el bloque 8 ya declara ese prefijo y gana el
  primero que matchea. Lo cubre `_labXlsAssertBloques()`.
- `_PC_MEMO` es un `WeakMap` por estudio, como `_LAB_HF_MEMO`: sin él son ~3 cascadas × 6 pasadas
  × N estudios por repintado del Laboratorio.

### Laboratorio — las subtabs NO son las seis del pedido (2026-09-14)
Hay **doce**, en este orden: `filtros`, `general`, `mediciones`, `asociaciones`, `calidad`,
`avanzado`, `hemo`, `cc`, `ete`, `medicos`, `comparar`, `informe`. **Docencia no es una subtab**
—es el «Pilar 5», una tarjeta dentro de un panel— y **Exportar/Importar tampoco**: es una opción
del menú que llama a `labExportarXLSX()`. El reordenamiento quedó SIN HACER esperando decisión.

### DICOM — estado al 2026-09-14
El módulo SR está escrito a mano (TID 5300) y ahora cubre **31 campos**: 18 con código LOINC
verificado y 13 con **esquema privado `99CEIBOMED`** (`CM-DSFVI`, `CM-GLS`…). Más 4 calculados
marcados `soloExport:true`, que se emiten y no se importan.

- **Los 13 privados no los va a entender otro visor.** Un PACS los muestra sin nombre clínico.
  Se eligió eso sobre inventar un LOINC: un código estándar equivocado hace que el PACS archive
  el GLS bajo «fracción de eyección» sin que nada avise. Si algún día se verifica el LOINC real
  de alguno **contra el estándar**, se agrega ADELANTE en su `cods` y el privado queda atrás
  como respaldo de los archivos ya emitidos.
- **`DCM_ETIQ` es un respaldo, no la vía principal.** Matchea por el texto del Code Meaning y
  sólo cuando el código no se reconoce. Todo lo que entra por ahí va **destildado**. Se sacaron
  a propósito las etiquetas peladas ambiguas —`S'`, `AT`, `DT`, `E wave`, `E vel`,
  `Longitudinal Strain`, `Global LS`, `IVC`, `Acc Time`, `DecT`—: todas nombran también OTRA
  medición con las mismas unidades y el mismo rango, así que un match por texto metía el número
  en el campo equivocado sin que nada lo delatara. Al agregar etiquetas nuevas: **si no dice de
  qué estructura es, no va.**
- **Dos niveles de rango, y no son lo mismo.** `DCM_RANGO` es lo físicamente posible y
  **rechaza** (atrapa el error de unidades cm/s↔m/s). `DCM_RANGO_CLIN` es lo normal y sólo
  **avisa**, sin destildar. Un `null` en la banda clínica significa «sin piso/techo de
  normalidad», no cero. Bandas demasiado angostas entrenan al médico a ignorar el cartel.
- **El signo del GLS se normaliza en las DOS puntas.** El campo `sgl` admite positivo y
  negativo; el exportador emite `-Math.abs()` y el importador lo fuerza al leer. Normalizar en
  una sola punta rompía la identidad del ida y vuelta.
- **`cx_gtp_ee` NO se exporta, aunque parezca un calculado.** Es un input libre del módulo de
  gradiente transpulmonar que se llena una vez al abrir el acordeón y sólo si está vacío: no se
  refresca al corregir e' septal, y puede tener un valor de un cateterismo. El E/e' canónico es
  el span `#ee-val`, que no es un input.
- **`vci_col` no se exporta:** es un `<select>` con «>50» / «<50», no un número. Un content item
  NUM exige un DS numérico. Si hace falta, va como CODE.
- **14 conceptos del pedido NO existen en la app** y por eso no se exportan: IVSs, LVPWs, FS,
  LVEDV, LVESV, CO, LV Mass, RWT, RV FAC, LAVi, E/A, e' mean, s' septal y s' lateral del VI.
  Las últimas cinco son derivadas; las nueve primeras EcoSmart no las recoge. Para exportarlas
  hay que **agregar los campos al formulario** primero.

### DICOM — visor de imágenes (pendiente, 2026-09-14)
Investigado y **no implementado**, esperando un archivo real del **Vivid Q7**.
- `https://cdnjs.cloudflare.com/ajax/libs/dcmjs/0.29.0/dcmjs.min.js` da **404**. dcmjs NO está
  en cdnjs (la API responde «Library not found») y no hay ninguna librería DICOM ahí.
- Sí están en jsDelivr: `dcmjs@0.52.0`, `dicom-parser@1.8.21`, `cornerstone-core@2.6.1`,
  `cornerstone-wado-image-loader@4.13.2`. jsDelivr ya es un origen de esta app (pptxgenjs) y los
  6 scripts externos llevan `integrity` SHA-512.
- **Un SR no tiene imágenes.** Los cine loops son objetos DICOM aparte con pixel data y en la
  práctica vienen comprimidos (JPEG / JPEG-LS / RLE); el parser propio los rechaza a propósito.
  dcmjs solo tampoco los decodifica: hace falta el stack cornerstone con códecs WASM.
- **Lo primero a mirar cuando llegue el archivo:** la sintaxis de transferencia (0002,0010). Si
  el Vivid Q7 exporta sin comprimir, el parser que ya existe alcanza y se evita la dependencia.

### Aorta — umbrales unificados (2026-09-14, ESC 2021)
Un solo `AO_REF` gobierna la cápsula de pantalla, el narrativo, el EN SUMA, las dos tablas del
PDF **y el Laboratorio**: `sin 40 · st 38 · tub 40`, con `>` estricto (40,0 exacto es normal).
Bandas completas por segmento en `AO_SEGS`:

| segmento | normal | leve | moderada | severa |
|---|---|---|---|---|
| Valsalva / ascendente | ≤40 | 41-45 | 46-50 | >50 |
| Sinotubular | ≤38 | 39-44 | 45-49 | ≥50 |

Tres cosas que conviene no volver a mover sin pensarlas:

- **El panel de indicaciones NO usa `AO_REF`, y está bien así.** `_indVAB`, `vabConclusion` y
  `ccSumaLinea` van a 45 / 50 / 52 / 55 mm: son los umbrales **quirúrgicos** de la ESC 2024
  (Clase I B ≥55, ≥50 en fenotipo de raíz, IIa desde 45). «Dilatada» y «operable» contestan
  preguntas distintas. Cablearlos a `AO_REF` haría que la app propusiera criterios de cirugía
  sobre una aorta de 41 mm. Si alguna vez alguien pide «una sola constante para todo», esto es
  lo que hay que responder.
- **Sin ninguna medición, la aorta NO se nombra.** Se sacó la frase «Aorta torácica de calibre
  normal» que salía con los tres campos vacíos: era una normalidad declarada en el informe
  firmado sobre algo que nadie midió, y no medir la aorta es lo habitual en un ETT de rutina.
  Mismo criterio que el módulo pulmonar. Un valor fuera de la banda de plausibilidad tampoco
  deja afirmar normalidad: nombra el segmento y pide verificar.
- **`AO_INTERP_EL` es una lista paralela a `AO_SEGS`.** Agregar un segmento sin su entrada ahí da
  `getElementById(undefined)` → `return` mudo: el narrativo lo incluye y la pantalla no muestra
  cápsula. Las dos tablas del PDF tampoco se generan desde `AO_SEGS`. Hay assert de arranque para
  las bandas invertidas y para `mod` faltante, no para esto.
- **`Object.freeze` no avisa.** Fuera de modo estricto, `AO_REF.sin = 45` desde otro bloque es un
  no-op MUDO: protege del accidente, no señaliza la mutación deliberada.

### Eco Pulmonar — `amiloSecs` falla ABIERTO a propósito
La compuerta `hayDatos` de `amiloIntegrar` es **opcional**: 16 de las 17 secciones no la declaran
y se integran sin control. El default se eligió así porque impedirle al médico integrar algo que
sí cargó es peor que el defecto que cierra. Pero el camino fácil —copiar la línea de la sección
de arriba— no tiene compuerta ni avisa. Si se agregan más secciones conviene invertirlo a
opt-out (`sinCompuerta:true`) con un `console.warn` de arranque para las que no declaren ninguna
de las dos, como hace `_labXlsAssertBloques()`.

### Segmentos del ETE — la clave global de localStorage sigue teniendo un escritor
`eteClick` escribe **las dos** representaciones: el espejo por estudio (`#ete_seg_*`, que es el
que viaja en el backup) y la clave global `ete_seg_*`, que fugaba entre pacientes. Hoy la fuga
está tapada porque `limpiarCampos` llama a `eteLimpiarSegmentos()`, que pone las seis en 0. La
tapa depende de que ese llamado siga ahí. Con el espejo en su lugar, la clave global ya no tiene
consumidor legítimo y se podría sacar — no se hizo hoy para no ampliar el diff.

- **`med-centro` es un span huérfano y le gana al centro de Config en TODO PDF.** El encabezado
  resuelve `_medCentro || centroStr || 'CeiboMed'` (~21244) y `_medCentro` es `sv('med-centro')`,
  un `<span contenteditable>` dentro de `<div id="hdr-med-datos" hidden>` (~1408). Nadie lo puede
  tipear —el contenedor está oculto— y **`ett_med_centro`, la única clave que lo puebla vía
  `initHdrEditable` (~34101), no la escribe NADIE en el archivo**: quedó huérfana al pasar los
  centros a ⚙️ Config. En una instalación limpia vale `''` y todo funciona por `centroStr`.
  Pero en una instalación que venga de antes de esa migración la clave puede seguir en disco, y
  entonces **todos** los PDF —no sólo las reimpresiones— llevan en el encabezado una institución
  PRE-migración, ignorando la que el médico configuró. Es invisible: el campo está oculto y el
  botón del encabezado muestra `ecoGetCentroPrincipal()`, no el span.
  Para saber si esta máquina está afectada, en la consola de la app:
  `localStorage.getItem('ett_med_centro')` — si devuelve algo que no sea `null` ni `''`, el
  encabezado de los PDF del día está saliendo con ese valor.
  Arreglarlo es borrar la clave huérfana y sacar el span del orden de resolución, pero eso toca
  el camino del PDF de todos los días: no se hace de taquito junto con otra cosa.

- **Reimprimiendo, el copyright institucional puede caer al genérico.** `_fInst` (~22825) ya no
  usa `hdrCentroNombre()` durante una reimpresión, así que si `centroStr` queda vacío el pie sale
  `© … EcoSmart` en vez del de la clínica. Y `centroStr` queda vacío más seguido de lo que
  parece: la reimpresión repone `centro_nombre` con `el.value = c[el.id]` sobre un `<select>` que
  `renderCentroField` reconstruye desde `ecoGetCentros()` (~28599); asignar un valor que ya no
  tiene `<option>` **falla en silencio** y deja `''`. Pasa con centros renombrados o borrados y
  con todo lo importado de Excel/DICOM. Es la decisión deliberada —mejor sin institución que con
  la equivocada en un documento firmado— pero conviene saber que el disparador no es raro.

- ~~`generarInformeConEvolucion` cruza pacientes sin documento~~ — **CERRADO 2026-09-14.** Hoy
  gatea con `!_dupSinDato(ci)`: sin documento real no hay evolución longitudinal y se genera el
  informe directo. Verificado en el navegador sembrando tres estudios —dos sin cédula, de
  pacientes distintos, y uno con cédula real—: con `'—'`, espacios, `'-'` y `'.'` el modal NO
  abre; con documento real abre con **un** estudio, el de la misma cédula. De paso, el `hayCI` de
  `verEvolucion` pasó del literal `ci !== '—'` a `_dupSinDato`, que también atrapa `'.'`, `'-'` y
  los espacios: **un solo predicado de identidad en toda la app**.
  Al probarlo, dos trampas del instrumento: `mostrarModalEvolucion` vive DENTRO del IIFE, así que
  reemplazar `window.mostrarModalEvolucion` no intercepta nada y el modal real se abre igual; y
  esa función **sale temprano si ya existe `#evol-modal-overlay`**, así que un overlay colgado de
  una prueba anterior hace que la siguiente parezca no hacer nada. Detectar por el id del overlay,
  y limpiarlo entre casos.

- **Los campos de Pericardio no están en `_IG_SECTIONS`, ni en el mapa de Excel, ni en
  `LAB_XLS_RANGO`.** Los 19 ids nuevos (`dpt_*`, `cvr_*`, `resp_var_*`) **sí** se guardan y se
  restauran —`guardarInforme` barre `input[id]/select[id]/textarea[id]` y las tres rutas son
  genéricas—, pero no salen en «Ver detalle» ni viajan al Excel del Laboratorio, a diferencia de
  sus hermanos `dap_*`/`coa_*`, que están en las tres listas. Queda declarado, no es un olvido.
- ~~`CVR_EPRIMA_CM_S = 7` se aplica también al e' lateral~~ — **CERRADO 2026-09-13.** Hoy son dos
  constantes, `CVR_ESEP_CM_S = 7` y `CVR_ELAT_CM_S = 10`, alineadas con la clasificación
  diastólica del archivo. **Una constante que gobierna dos umbrales distintos es peor que dos
  literales**: parece que los acopla y lo que hace es esconder que uno de los dos está mal.
  **Y subir el umbral del lateral rompió la calibración de `nR < 2`, que es la lección de esta
  tanda.** Mi primera nota decía «la conclusión no cambia porque la gobiernan el reversus y los
  criterios adicionales» y nombraba una sola interacción (E/e' >15). Era falso, y lo midió el
  `/differential-review` enumerando las **1.166.400 combinaciones alcanzables**: `constrictiva`
  perdía el **46,7%** de su dominio y `restrictiva` ganaba el **75%**. Con el lateral votando
  'r' en casi toda constricción real, el presupuesto de votos en contra bajaba a CERO: el caso
  testigo era una constricción de manual con **TC pericárdica normal** —entre el 18 y el 28% de
  las constricciones probadas quirúrgicamente— y E/e' de 12, que pasaba a «no es posible
  diferenciar, se recomienda cateterismo». Cerrado haciendo que el lateral reducido vote
  restricción **sólo si el septal también lo está**: con el septal conservado, un lateral bajo ES
  el annulus reversus, y eso ya lo cuenta su propia fila. El mismo hecho no puede votar dos veces
  en direcciones opuestas.
  **Al mover un umbral, medir qué le pasa a los CONTEOS que dependen de él**, no sólo a la fila
  que se tocó. Un umbral puede ser el correcto y aun así romper la cascada que lo consume.
- **`patronRestr` lo satisfacía un perfil diastólico de rutina** (detectado y cerrado 2026-09-13).
  La compuerta `espEval === 0` protegía el lado de la constricción y no el restrictivo, porque el
  único criterio específico que `patronRestr` necesita es la respirofasicidad mitral: **el dato
  que abre la compuerta era el mismo que la satisfacía** — un guardián no puede ser también la
  llave. Medido: `e' septal 6,5 · e' lateral 9,5 · onda E 140 · variación mitral 10` —cuatro
  números de la tab Diastólica, cero datos del pericardio— firmaba «compatible con miocardiopatía
  restrictiva» en el cuerpo y en el EN SUMA. Con el lateral en 10 dejó de ser un borde y pasó a
  ser el grado II-III corriente. Hoy la rama exige `espEval >= 2`.
- **`no_concluyente` no imprime nada, a propósito.** Un estudio que antes caía en `mixto` y ahora
  cae acá pierde la recomendación de cateterismo sin que se imprima nada en su lugar. Es
  deliberado —un párrafo que diga «no concluyente» ocupa lugar en el informe y no aporta— pero es
  una decisión, no un descuido: la pantalla sí lo explica con `cvrMotivo()`, que lee el conteo
  real en vez de un texto fijo.

- **VEXUS 0 con venas severas se lee como normalidad.** Con VCI < 20 mm el grado es 0 aunque los
  tres vasos estén severos —es correcto por protocolo—, pero el texto imprime «VEXUS 0 | 3 severos
  de 3 vasos evaluados: …; VCI < 20 mm» y debajo «Sin congestión venosa sistémica significativa.
  Presión venosa central probablemente normal.», sin ningún calificativo y **sin la salvedad**
  (`score >= 1`). La pantalla lo dice mucho mejor: `calcVEXUS` escribe «(no cuentan: VCI < 20 mm)»,
  que nombra la consecuencia en vez de yuxtaponer el dato. Afecta por igual al narrativo y a la
  hoja —es la misma redacción—, así que no lo introdujo la hoja nueva. Cambiarlo toca el texto del
  informe firmado: es decisión clínica, no técnica.
- ~~Cardio-Oncología deja el panel del paciente anterior y lo manda al PDF firmado~~ —
  **CERRADO 2026-09-14.** `calcCardioOnco` entró a `RECALC_MODULOS` y a `limpiarCampos`, que son
  las dos columnas que le faltaban (la tercera, `guardarInforme`, ya la cubría el barrido
  genérico). El defecto: sus dos paneles se llenan con `.calc-row` cuyos `<span>` **no llevan
  `id`**, así que el barrido `.calc-box .calc-row span[id]` no los alcanza, y
  `amiloTextoCardioOnco` los lee del DOM con `_amRows` en vez de recalcular. Verificado antes y
  después: «Nuevo estudio» dejaba los campos vacíos y los paneles con «Riesgo MUY ALTO» y la
  cardiotoxicidad SEVERA del anterior; hoy se repintan con lo que corresponde al formulario vacío.
  **Queda una salvedad sobre el panel de riesgo:** con el formulario en blanco dice «Riesgo BAJO
  (0 pts)», o sea afirma sobre cero mediciones. El panel de toxicidad sí tiene su compuerta («No
  evaluable — sin FEVI actual, GLS ni troponina cargados»); el de riesgo no. Es preexistente y
  ahora se ve, porque antes lo tapaba el dato del paciente anterior.
- **El módulo pulmonar avanzado publica un pulmón normal completo sin que nadie mire nada, y borra
  el hallazgo real del básico** (verificado 2026-09-13, sin corregir). Sus cinco `<select>` no
  tienen opción vacía y arrancan todos en el valor normal; `amiloIntegrar` no tiene compuerta de
  datos. Peor: la exclusión mutua con el módulo básico es **incondicional**, así que un «Derrame
  pleural mínimo (Balik 25 mm, ~500 ml)» cargado en el básico desaparece y en su lugar se imprime
  **«Sin derrame pleural.»** Un hallazgo convertido en su negación.
- **La oración de aorta del narrativo decide sólo con `ao_sin`** (verificado 2026-09-13, sin
  corregir). La ascendente (`ao_tub`) y la unión sinotubular (`ao_st`) no se leen, y la rama `else`
  afirma: con `ao_tub`=52 mm y el seno vacío el informe dice «Aorta torácica de calibre normal»
  mientras la tabla del MISMO PDF imprime `Ao asc 52* mm (* dilatado)`.
- **`ete_morfo_incluir`: el botón dice «✓ Integrado» y el informe sale sin la sección** (verificado
  2026-09-13, sin corregir). El checkbox se persiste con el estudio, pero la compuerta del informe
  lee la clave global de `localStorage` que `limpiarCampos` borra, y `_restaurarChkInclusion`
  repone `.checked` sin despachar `change`. La técnica del ETE, su gemela, lo hace bien: prefiere
  el checkbox. Se agregaron juntas y sólo una leyó el control.

- **La ESC/EACTS 2021 de valvulopatías está SUPERADA por la 2025** (*Eur Heart J* 2025;46:4635,
  doi:10.1093/eurheartj/ehaf194 — su preámbulo dice «updates and replaces the previous version from
  2021»). EcoSmart la cita en varios lugares, no sólo en el panel de indicaciones. Lo que cambia y
  ya está verificado contra la fuente: el corte de edad de la modalidad en estenosis aórtica pasa de
  **75 a 70 años**; en IM primaria la Clase I suma el **DTSI indexado ≥ 20 mm/m²** y aparece una
  Clase I nueva con función preservada cuando concurren **tres de cuatro** (FA, PAPs en reposo
  > 50 mmHg, dilatación auricular, IT secundaria al menos moderada); y en IA la fila IIb se reescribe
  a DTSI indexado > 22 mm/m². **Ojo al migrar:** el 20 mm/m² de la edición 2025 es el umbral
  **mitral**, no el aórtico — cruzarlos es fácil y cambia la conducta.
  Decisión de Maicol (2026-09-11): no migrar ahora. El panel sigue citando la 2021 **con los valores
  correctos de esa edición**, y la migración es tarea propia porque toca el informe firmado.
- **Hay DOS implementaciones del score de Wilkins.** `wilkinsScore()`/`calcWilkins` (pestaña ETE,
  `wilkins-*`) y la de la calculadora `cx` (`cx-wilkins-total`, ~13480). Comparten las bandas
  (≤ 8 / ≤ 11) pero **no el texto**: una dice «resultado intermedio» y la otra «Resultado subóptimo
  probable», y la segunda no tiene la guarda de score incompleto que la primera documenta como
  necesaria —sin ella, un solo criterio en 2 sale «favorable para valvuloplastia percutánea»—. Es
  preexistente; el panel de indicaciones usa la primera.

- **Contraseña en el código.** `doLogin()` compara contra un literal. Choca con el checklist
  («sin contraseñas hardcodeadas visibles»), pero es la única compuerta que tiene la app y
  sacarla sin backend la deja abierta. Se resuelve con la migración a Supabase, no parcheando
  del lado del cliente. Mientras tanto: **es una barrera de cortesía, no un control de
  acceso** — cualquiera que abra el archivo la lee.
- **El «logo del centro» es UNO SOLO para toda la app, no uno por centro.** Decidido dejarlo
  así (2026-09-10) y resolverlo en la migración a Supabase, junto con el resto del estado que
  hoy vive en `localStorage` sin noción de identidad.
  El mecanismo *parece* multi-centro y no lo es: la clave es `logo_centro_<getCentroKey()>`,
  `getCentroKey()` lee `centro_tipo_activo`, y esa clave la escribe **únicamente**
  `selectCentroTipo()` — alcanzable sólo desde botones `.centro-opt` / `centro_opt_N` que
  **no existen en el HTML** (verificado: cero ocurrencias como clase o como id; sólo aparecen
  dentro del `querySelectorAll`/`getElementById` de esa misma función). En una instalación
  nueva la clave nunca se crea y `getCentroKey()` devuelve `'default'` para siempre. La lista
  que el médico sí usa —«🏥 Centros de trabajo»— escribe otra clave, `ett_centro_principal`,
  que es la que alimentan el botón del header y el select del formulario.
  **Consecuencia al leer un informe:** con dos centros cargados, el PDF sale con el NOMBRE del
  centro principal y el ÚNICO logotipo guardado. Lo heredan las tres superficies que leen esa
  clave: el logo del header (`renderLogoCentro`), el encabezado del PDF (`_hdrLogo` dentro de
  `generarPDFReal`) y la portada/cierre del PPT (`_pptLogo`).
  **No "arreglarlo" moviendo la clave a `ett_centro_principal` sin plan de migración:** cambia
  de qué logotipo salen los informes firmados y deja huérfano lo guardado en
  `logo_centro_default`.
  Al depurar: si en tu navegador `getCentroKey()` NO devuelve `'default'`, es porque alguien
  seteó `centro_tipo_activo` a mano en una sesión anterior — no es el estado de un usuario
  real. Confirmar con `localStorage.getItem('centro_tipo_activo')` antes de sacar conclusiones
  sobre esta ruta; ya produjo una verificación inválida.
- **Nadie mide el ancho del copyright del pie del PDF.** `_fCopyr` va centrado en `x=105` con
  `doc.text` directo, sin `splitTextToSize`: jsPDF no envuelve ni avisa, así que se recorta por
  los dos márgenes. Importa en **modo institucional**, donde `_fCopyr` lleva el nombre de la
  clínica adentro (`'© 2026 ' + _fInst + ' · Todos los derechos reservados · Uso clínico
  exclusivo'`). Es deuda anterior, pero se anota ahora porque el ÚNICO `getTextWidth` que se
  aplicaba a `_fCopyr` vivía dentro del bloque de la línea de cierre de Académico, y ese bloque
  quedó dormido el 2026-09-10 al apagar `firmaCierre`. Nunca protegió al copyright —protegía a
  la línea de cierre *de* él— pero era lo único que lo tocaba.
- **`gmax_calc` puede quedar rancio.** Ver la sección de `_IG_SECTIONS`.
- **Tres entradas independientes del espesor parietal máximo.** `siv`/`ppvi` (AI · VI),
  `ett-septo`/`ett-pp` (Amiloidosis) y `mch_espesor` (MCH). El módulo de amiloidosis imprime
  «Espesor parietal máximo X mm» con umbral de 12 mm y la MCH imprime la misma frase con umbral
  de 15, en la MISMA tarjeta y con botones de integrar independientes — y el caso natural es
  tenerlos los dos activos, porque la duda entre MCH y amiloidosis es el diferencial clásico de
  una HVI inexplicada. Mitigado calificando la frase de MCH («medido en esta sección») y
  documentándolo en el manual, pero **siguen siendo tres mediciones del mismo hecho**. Lo
  correcto es una sola, con las otras como espejo. Es el patrón `va_morf` / `coa_ao_asc` por
  tercera vez: al agregar una sección, buscar SIEMPRE si el dato ya existe con otro id.
- **`mch_ctx_hta` duplica `vab_fr_hta`, y `mch_ctx_embarazo` duplica `vab_fr_embarazo`.** Misma
  pregunta clínica textual, secciones contiguas de la misma pestaña, nada las sincroniza. En VAB
  la HTA resistente **vota** (es uno de los nueve factores) y en MCH es sólo contexto, así que un
  «Sí» en una y un «No» en la otra no produce una afirmación falsa dentro de ninguna, pero sí un
  informe que se contesta a sí mismo dos veces distinto. No es colisión `mch_ctx_crecimiento` vs
  `vab_fr_crecimiento`: uno es crecimiento del espesor parietal y el otro de la aorta.
- **Cuatro `MAPA[k] || ''` nuevos en `_labExcelRow`** (ductus y coartación, 2026-09-10). Suma a
  los que esa sección ya nombra. `c` es `inf.campos`, no el DOM, así que por `<select>` y por
  Excel no se llega —`_labXlsVocab` valida o rechaza la fila—, pero el import de backup JSON
  acepta claves arbitrarias y `'constructor'` devolvería la función en vez del fallback. No es
  XSS (`String(Object)` no trae `<`). El helper `_lblDe(mapa, k)` ya existe y resuelve esto;
  el bloque entero de `_labExcelRow` merece una pasada, no un parche por caso.
- **`cerrarSesion()` no es un borde de sesión.** No recarga ni llama a `limpiarCampos` /
  `imgVaciar`: detrás del overlay quedan intactos el formulario, las imágenes y todo el
  estado de módulo. Y los listeners de autosave siguen enganchados, así que un input con la
  sesión «cerrada» sigue escribiendo el formulario del paciente anterior en `localStorage`.
  El arreglo obvio —terminar en `location.reload()`— **no alcanza solo**: `_autosaveRestore`
  corre en `DOMContentLoaded` sin mirar `ett_auth`, así que repondría ese formulario detrás
  del login. Cerrarlo de verdad exige decidir qué pasa con el borrador: limpiarlo pierde
  trabajo en curso, conservarlo mantiene la fuga. Es una decisión de producto, no técnica.
- **Si vuelve la UI de Eco Estrés, `eeResetAll` necesita vaciar `eeImg` y `eeEcg`.** Hoy sólo
  barre `#tab-ee input/select/textarea` y `eeBull`. No fuga porque no hay UI que las pueble y
  el PDF está gateado por `#ee-incluir-pdf`; las dos ausencias se tapan mutuamente y
  restaurar la interfaz destapa las dos. Necesitan el tratamiento de `imgVaciar` —mutación en
  sitio, `_imgGen++`— ANTES de que vuelva el toggle.
- ~~`labGenerarPDF` no termina~~ — **DIAGNOSTICADO Y CERRADO (2026-09-09)**. No era del
  entorno: ver la sección «rAF no dispara con la pestaña oculta». Los cambios de esa función
  ya se pueden verificar de punta a punta.

## Auditoría 2026-09-09 — resumen de la tanda

Seis commits: `2b95740`, `3486302`, `1b5e9e8`, `7904fe4` y este. Lo que sigue es el saldo.

### Corregido (por orden de gravedad)
1. **El algoritmo de amiloidosis se llevaba el paciente anterior.** `gradoGamma`/`protMonoc`
   sobrevivían a «Nuevo estudio» y quedaba MEDIO limpio: «Motivo: no especificado» arriba y
   «ATTR confirmado — Grado 3» abajo. Un clic metía el centellograma del anterior en el
   informe del actual.
2. **La clave de nombre fusionaba pacientes distintos al importar.** En modo «sobreescribir»
   el informe de uno reemplazaba al de otro conservando id, uuid y estudioId del equivocado:
   el QR firmado de Ana abría el informe de Juan.
3. **`ci: ci || '—'`**: todo estudio guardado sin cédula figuraba como si tuviera documento,
   porque la raya U+2014 sobrevivía a la normalización.
4. **El aviso médico-legal salía sólo al tipear la contraseña** y fallaba ABIERTO por los dos
   caminos.
5. **Estenosis mitral con dos escuelas y el THP votando dos veces** contra sí mismo. Incluye
   un cambio clínico declarado: gradiente medio de 10 pasa de moderada a severa.
6. **El PDF del Laboratorio publicaba dos denominadores del mismo dato** con un subtítulo que
   decía las dos cosas; y `pctOf(n,0)` afirmaba «0%» sobre una entidad que la app no registra.
7. **Frases clínicas direccionales sin mirar el p**: rho=0,05 con p=0,8 publicaba «A mayor
   FEVI, mayor presión pulmonar».
8. **Regex sobre texto libre sin negación**: «se descarta HTP» contaba como HTP. Medido, el
   doble.
9. **`estudioId` se perdía al sobreescribir** → QR muerto en un PDF ya firmado.
10. **Seis ids inexistentes en el detalle** callaban colapso de VCI, TDE y los dos gradientes
    aórticos; el volumen de derrame se calculaba dos veces con guardas distintas; el PPT leía
    claves que nadie escribe; los accesores de alias se esquivaban; los contadores se
    corrompían con claves del prototipo.

### Patrones a evitar (los que más caro salieron)
- **Un reseteo que no repinta no es un reseteo.** `resetAlgoritmo` nuleaba variables y dejaba
  el cartel en pantalla.
- **Grepear el literal no es leer la función.** En la extracción de umbrales se pasaron ~20
  sitios, tres en la línea contigua a uno que sí se cambió.
- **Un cambio de umbral no puede viajar dentro de un refactor.** El gradiente de 10 casi entra
  disfrazado, bajo un comentario mío que afirmaba lo contrario.
- **Una constante que no gobierna nada es peor que el literal.** `THP_SEVERO_MIN` se creó y se
  borró en la misma sesión.
- **Verificar en el navegador, no por grep.** «El bull's eye no se limpia» parecía cierto por
  grep y era falso: el reseteo va por `contrReset`/`sglReset`.
- **Mirar el denominador antes de contar.** Un test dio «sin XSS» sobre un contenedor vacío;
  otro midió la columna equivocada y reportó 29 frases direccionales donde había 1.
- **Un comentario que afirma una invariante no la garantiza.** El de `_dupKey` juraba que las
  dos vías compartían criterio y hacía años que no.
- **`isNaN(null)` es `false`** y **`typeof` sobre un `const` en zona muerta lanza**.

### Falsos positivos verificados — no volver a levantarlos
Nueve de las correcciones pedidas en la tanda no existían: `eeHasData` con datos del ETE, el
bull's eye sin limpiar, la captura fuera del viewport, FEVI Simpson con un plano, THP sin
planimetría, frases rápidas con límite de 10.000, los listeners de Eco Estrés «interfiriendo»,
y el conteo de 146 warnings de Semgrep (son 118). Cada uno está documentado arriba con la
evidencia.
