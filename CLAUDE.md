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

### El rótulo de una pestaña vive en CUATRO superficies, y el manual es la que se pudre
> **Las dos pestañas se llaman hoy «🧬 CC frecuentes» y «🧬 CC complejas»** (2026-09-16). Antes
> fueron «🧬 Congénitas» / «🫀 CC estructurales» y después «Congénitas I / II». **Los IDs nunca
> cambiaron** —`congenitas` y `congenitas2`—, que es exactamente el punto de esta entrada. En el
> último renombre el rótulo estaba en **once sitios**: los dos botones, `EE_MODULES`, el subtítulo
> de la sección VAB que remite a la otra pestaña, **seis** referencias del manual y dos
> comentarios del código. TC-123 verifica que **ninguno** de los nombres anteriores sobreviva.


Renombrar «🧬 Congénitas» y «🫀 CC estructurales» a **«🧬 Congénitas I»** y **«🧬 Congénitas II»**
(2026-09-15) no es cambiar un `<button>`. El texto aparece en:
1. **el botón** de la pestaña;
2. **`EE_MODULES`**, que es el rótulo de la casilla de Config;
3. **`#ecoAdvSelect`**, el desplegable de móvil — éste **deriva** su texto del botón, así que se
   arregla solo, pero hay que verificarlo;
4. **`ECO_AYUDA`**, el manual, que **enumera el contenido de cada pestaña**.

**Los IDs no se renombran.** `congenitas` y `congenitas2` los usan `showTab`, `data-mod` y las
preferencias guardadas en `localStorage` (`ett_modules`): cambiarlos rompería la configuración de
cada máquina en la que la app ya corrió. Lo que cambia es el texto.

**El rótulo de Config tuvo que decir «I y II».** Desde que las dos pestañas comparten
`data-mod="congenitas"`, esa única casilla gobierna las dos; con el rótulo viejo prometía menos de
lo que hacía.

**Y el manual ya tenía DOS afirmaciones falsas desde el reparto**, que este renombre destapó:
decía que CIA/CIV está en «🧬 Congénitas, **primera de las tres secciones**» cuando está en la
**II** y las secciones son **diecinueve**. También ubicaba mal el ductus. Ya había una entrada en
este archivo advirtiendo exactamente esto —«el manual enumera el contenido de cada tab, así que
una mudanza lo desactualiza en silencio»— y aun así pasó. **Al mover o renombrar una sección,
`grep` del nombre de la pestaña sobre `ECO_AYUDA` es obligatorio.** Lo fija **TC-123**, que compara
las cuatro superficies y verifica que el nombre viejo no sobreviva en ninguna parte visible.

**El mapeo verificado, por si hace falta otra vez** (leído del archivo, no de memoria):
`I` → vab, coa, marfan, fop, esub, easv, mch, mca, tdf, tv · `II` → shunt (CIA/CIV), dap, vap,
dsav, cvpa, tga, ebs, eisen, fontan.

**Al verificar un renombre en el navegador, forzar carga nueva.** La primera medición en Safari
devolvió los nombres VIEJOS: `open location` sobre una URL ya abierta **reusa la pestaña**, que
tenía el archivo anterior. Se resuelve con un parámetro único (`?v=$(date +%s)`). Es el mismo
caché que ya costó tres diagnósticos — ver [[ecosmart-768px-oculta-todas-las-tabs]] y la entrada
de la pestaña del 11 de septiembre.

### `secToggle` recibe `cc-X`, no `X` — y un id que no existe deja el acordeón MUERTO
`secToggle(id)` resuelve **`#sacc-<id>`**, y los cards de Congénitas se llaman **`sacc-cc-<X>`**:
la cabecera tiene que pasar **`cc-fontan`**, no `fontan`. **Siete de las diecinueve** pasaban el
token sin el prefijo —`marfan`, `eisen`, `fontan` y los cuatro placeholders `esub`, `easv`,
`dsav`, `cvpa`—, así que `secToggle` salía por su `if (!acc) return` y el botón quedaba **muerto:
visible, clicable, sin ningún efecto**. Tres secciones clínicas enteras inalcanzables.

**Ninguna prueba lo veía, y ésa es la lección.** TC-112 verifica que la sección y su cabecera
EXISTAN; TC-120 lee el CONTENIDO del panel, que está en el DOM **abierto o cerrado**. Las dos
pasaban. **Ver que algo está no es lo mismo que poder alcanzarlo** — y todo lo que el suite
probaba de esas secciones (informe, EN SUMA, Excel, fugas) seguía andando, porque nada de eso
necesita abrir el acordeón. Lo cubre **TC-122**, que **cliquea de verdad** las 28 cabeceras de la
app y exige que la clase `open` cambie en los dos sentidos, más el cruce estático token→id.

`secToggle` ya **no falla en silencio**: un id que no resuelve escribe `console.error`. Es «un id
inventado no falla, calla» por enésima vez, y acá el coste era una sección clínica completa.

**Al agregar un acordeón a Congénitas: el card es `sacc-cc-X` y la cabecera llama
`secToggle('cc-X')`.** Los cuatro placeholders nacieron rotos y nadie lo notó **porque están
vacíos**: un placeholder roto se ve igual que uno que funciona.

**Y el caso de prueba nació con el mismo defecto que venía a cazar.** Su primera versión leía el
token con `/secToggle\('([^']+)'\)/` dentro del **template literal** del cuerpo del caso: el
literal se come una barra invertida, el regex emitido quedó con los paréntesis **sin escapar** y
no matcheó nunca — los 28 acordeones salieron «no llama a secToggle» y el caso acusaba a la app
de un defecto propio. Es la trampa del `\s` que este archivo ya documenta. **Dentro del cuerpo de
un caso, partir la cadena con `indexOf`/`slice` en vez de un regex con escapes.**

### Sello de versión: `scripts/sellar_version.py` ANTES de cada `git add`
Agregado el 2026-09-15 después de que una pestaña con un archivo de **cuatro días** costara medio
día de diagnóstico — la tercera vez. El pie publica `EcoSmart · v20260915-2032` y, si la copia
publicada es más nueva, sale un aviso amarillo con una ✕.

```bash
python3 scripts/sellar_version.py          # sella con la hora actual — CORRER ANTES DE git add
python3 scripts/sellar_version.py --check  # no escribe; sale 1 si algo quedó desfasado
```

**El script sella TRES superficies desde el mismo instante** y `--check` verifica que las tres
coincidan: `ECO_BUILD` (cadena local, para mostrar), `ECO_BUILD_MS` (epoch, para comparar) y el
`<span id="eco-build-sello">` del pie. Más `version.json`. **Los dos archivos van en el commit.**

**Dos constantes y no una.** La cadena se lee en hora local y la comparación necesita un instante
absoluto: mezclarlas es un error de tres horas que aparece y desaparece con el huso.

**El pie es HTML ESTÁTICO, no lo pinta JS.** La primera versión lo escribía en `DOMContentLoaded`
y tenía dos problemas: una **carrera** —el caso leía el pie antes del init y falló 1 de cada 4— y
uno de fondo, peor: este archivo ya se quedó **sin JavaScript dos veces** por un bloque que dejó
de parsear, y el sello existe justamente para esos momentos. **Un sello que necesita que la app
funcione para decir qué versión es no sirve para diagnosticar una app que no funciona.**

**Se compara sello contra sello, NO contra `Last-Modified`.** La fecha de modificación del archivo
publicado es la del **despliegue** y el sello es la del **commit**: si el push se demora respecto
del commit —cosa que pasa seguido— la diferencia crece sola y el banner sale **falso para todos
los que ya tienen la versión buena**. `version.json` son treinta bytes con el mismo sello, así
que el retraso del despliegue sólo puede hacer que el aviso llegue tarde, nunca de más.

**Falla siempre hacia «no mostrar nada»**: sin red, sin `version.json`, con un JSON ilegible o
fuera de `https` no se dibuja nada. Fuera de https ni siquiera se pide — en localhost no hay con
qué comparar. Petición a **ruta relativa**, así que mismo origen por construcción: sin CORS, sin
terceros y sin enviar un solo dato.

### `[hidden]` pierde contra un `display` en línea — y un test que mira la propiedad no lo ve
El banner nació con `hidden` **y** `style="display:flex"`. La regla del navegador
`[hidden]{display:none}` tiene menos peso que un estilo en línea, así que **el banner se dibujaba
en todas las cargas** con `element.hidden === true`. Y **TC-126 daba verde**, porque comprobaba la
propiedad. Lo encontró medir la geometría en el navegador, no el caso.

Dos reglas: **mover `hidden` Y `display`** —el primero para el lector de pantalla, el segundo para
el ojo— y, en los casos, **medir `getComputedStyle(...).display`, no el atributo**.

**Y el pintor se extrajo (`ecoBannerMostrar`).** Mostrar el banner vivía en línea dentro del
`.then()` del fetch, así que ningún caso podía ejercerlo sin red: sacarle el `display` **no ponía
nada en rojo**. Un caso que pinta el elemento a mano prueba el navegador, no el código. Es el
mismo corte evaluación/pintor que `teerEstado`/`calcTEER`, y acá también hay un predicado puro
—`ecoVersionMasNueva(j)`— que se prueba por los dos lados del umbral sin levantar un servidor.

### Un panel de referencia NO puede llevar `id` en sus controles
Los paneles de Marfan (Ghent 2010), Eisenmenger y Fontan se agregaron el 2026-09-15 reusando el
armazón de MCH/MCA: un solo `#crit-overlay`, registro `CRIT_PANELES {titulo, render}`, y
`critAbrir`/`critCerrar` con cierre por ✕, clic afuera y Escape. El botón va **al principio del
`.card-body`**, que es donde está el de MCH — **no dentro del `.sacc-hdr`**, que ya es un
`<button>`: anidarlos es HTML inválido y el handler de afuera se come el clic.

**Ningún control de estos paneles lleva `id`, y no es estilo.** `guardarInforme` barre
`input[id]` de **todo el documento**: un checkbox de referencia con id se persistiría en `campos`
de **cada** estudio —y como `<id>__chk`, en todos, aunque nadie abra el panel—, viajaría al Excel
y lo contaría `detectar_huerfanos`, indistinguible de un hallazgo del paciente. Se usan atributos
`data-*` y las consultas se acotan a `#crit-cuerpo`. **TC-125 lo verifica recorriendo el panel
abierto y exigiendo cero ids** — es la condición que separa «panel de referencia» de «campos
clínicos disfrazados».

**El panel contesta otra pregunta que la sección, y lo dice.** Ghent 2010 contesta «¿este paciente
tiene Marfan?»; la sección contesta «¿esta aorta se opera?» (ESC 2024). Sin esa aclaración impresa,
un score de 7 se lee como una indicación quirúrgica.

**Y el panel de Fontan no publica un corte que la sección no aplica.** El pedido traía «Clase IV
… o sat <85 %» mientras el clasificador usa **las complicaciones consignadas** y su alerta de
circuito corta en **90 %**. Tres números para el mismo paciente es el defecto de «tres agendas»
otra vez: el panel describe el 85 % como marcador de fallo avanzado de la literatura y **declara
que la sección clasifica por complicaciones**. Lo fija TC-125.

**Lo que costó tres rondas de mutación, y vale para cualquier calculadora de criterios:** un caso
que prueba sólo el lado POSITIVO deja pasar vías inventadas. Ghent exige **dos** criterios sin
historia familiar, y el escenario feliz (aorta + score) sobrevivía a agregar «ectopia lentis sola
→ Marfan». Hubo que agregar el negativo de cada vía. Después, «con historia familiar basta **un**
criterio mayor» sólo se prueba con **exactamente uno**: el escenario tenía dos y exigir dos pasaba
igual. Y al final, sacarle la historia familiar al predicado **no cambiaba una palabra** —el
`!hf` decide el texto y corta antes— pero dejaba el recuadro en **verde** diciendo «Marcá la
historia familiar»: el color y el texto salían de dos expresiones distintas. **Si un caso no
prueba el lado negativo de cada rama, no prueba la regla.**

### Exportador de Excel con filtros por módulo — y el default constante otra vez
Agregado el 2026-09-16. `labExpAbrir()` abre un modal antes de exportar: **siete** módulos con
casilla, dos radios de filas, cuenta en vivo y preferencias en `localStorage`
(`ett_lab_export_pref`). Medido: **411 columnas → 118** sin ningún módulo, un 71 % menos.
(Nacieron ocho; `contr` pasó a básico el mismo día — ver la entrada de abajo.)

**LOS MÓDULOS SE DERIVAN DE `LAB_XLS_BLOQUES`**, que ya declaraba cuáles bloques son `avanzada`.
Escribir una segunda lista de 300 nombres de columna habría sido la lista paralela de siempre: al
agregar una columna caería sola en su bloque y **no** en su módulo, y desaparecería del Excel sin
que nada lo diga. Donde un bloque abarca dos módulos clínicos —el **16** tiene ETE y
cardio-oncología juntos— se desempata por **prefijo**, y **los prefijos ganan sobre los bloques**.

**`_labAssertModulos()` corre al arrancar**, como `_labXlsAssertBloques`: un prefijo mal escrito no
da error, da un **módulo vacío** que se ve igual que uno bien definido y se lleva sus columnas a
los básicos. Verifica que cada prefijo matchee, que cada bloque exista y que cada módulo reclame
al menos una columna.

**EL DEFAULT CONSTANTE, POR TERCERA VEZ.** «¿Este estudio tiene datos del módulo?» no se puede
contestar con «alguna columna no vacía»: **cuatro columnas de pericardio salen «No» en un estudio
en blanco** —igual que los grados valvulares salen «Sin»—, así que «sólo con datos» devolvía
**todos** los estudios y el filtro no filtraba nada. Se compara contra la fila de un **estudio
vacío** (`_labRowVacia()`), lo que cubre la clase entera: cualquier columna futura con default
constante queda cubierta sola, sin lista de excepciones.

**Sin ningún módulo elegido, «sólo con datos» se IGNORA.** Filtrar por «tiene datos de los módulos
elegidos» cuando no se eligió ninguno daría **cero filas** y un Excel vacío que parece un error de
la app. El modal lo dice en la cuenta.

**La plantilla comparte el filtro y no se escribió un segundo generador**: `labPlantillaXLSX(true,
sel)` — la «plantilla virgen» ya existía. Si la plantilla enseñara columnas que el export no
emite, el médico la rellena y reimporta datos que no tienen destino.

### GLS y contractilidad son BÁSICOS — y el comentario que defendía lo contrario era falso
El 2026-09-16 se eliminó el módulo `contr` del exportador: sus columnas pasaron a básicas y el
checkbox desapareció. Quedan **siete** módulos opcionales; las básicas suben de **116 a 118** y el
total sigue en **411**.

**El argumento no es «GLS es importante» sino que el BLOQUE ya era básico.** `GLS (%)`,
`Trastornos sectoriales` y `TS_Presente` viven las tres en el bloque **`4 · VENTRÍCULO IZQUIERDO`**,
entre `FEVI Simpson (%)` y `Masa VI (g/m²)`. El módulo sacaba **dos de las diecisiete** columnas de
ese bloque mientras las otras quince nunca fueron opcionales: un Excel de ventrículo izquierdo sin
la motilidad no es un export focalizado, es uno incompleto.

**El comentario que justificaba el módulo afirmaba un número falso.** Decía que era «los SEGMENTOS,
que son diecisiete columnas». Son **DOS** —un texto resumen y su binario— y lo desmintió el conteo,
no la lectura. **Los diecisiete segmentos no tienen columna en el Excel por ningún camino**:
`_labExcelRow` no los emite, ni los de contractilidad ni los de strain. Están en la lista de
columnas ausentes que este archivo ya tenía, y el comentario del exportador la contradecía a 300
líneas de distancia. Es «un comentario que afirma una invariante no la garantiza», otra vez.

**El invariante que fija TC-135 NO es «estas tres columnas son básicas».** Nombrar tres deja
abierto que mañana alguien module una cuarta del mismo bloque. La condición es **«ninguna columna
del bloque 4 tiene módulo»**, y eso es lo que separa un caso útil de uno decorativo: la mutación
que agrega un módulo `geom` sobre `Geometría VI` —una columna del bloque 4 que NO está en el
núcleo— **sólo la caza esa condición**; las que nombran las tres pasan en verde.

**Una preferencia guardada con un módulo borrado no lo revive**: `_labExpLeerPref` ya filtraba
`sel` contra `LAB_XLS_MODULOS`, así que un `{sel:['contr','peri']}` en disco vuelve como `['peri']`.
Al borrar un módulo, verificar que ese filtro exista — sin él, la preferencia resucita una clave
que `_labModDeCol` ya no reconoce y el filtro de filas empieza a descartar estudios en silencio.

### Buscar una frase encuentra lo que ya sabías que estaba
Las dos pestañas de congénitas tenían **dos** bloques de título, no uno. El lote del 2026-09-16
sacó el de «🧬 Cardiopatías congénitas y miocardiopatías genéticas» y **dejó vivo** un segundo,
escrito **sin acentos** —«🧬 Cardiopatias del adulto y miocardiopatias geneticas»—, que el grep de
la forma acentuada no encontró. TC-132 lo daba por resuelto porque **buscaba frases concretas**.

**La condición correcta no es «no aparece este texto» sino «antes de la primera sección no hay
NADA que renderice».** Hoy TC-132 recorre los hijos de cada pestaña hasta el primer `.sacc` y
exige texto vacío, en las dos. Con eso, cualquier bloque nuevo —con acentos, sin acentos o en
otro idioma— se pone en rojo solo.

**Dos trampas del propio caso al escribirlo:**
- **`textContent` incluye los nodos de COMENTARIO.** El comentario de cabecera de la pestaña es
  largo y se contaba como texto visible. Hay que saltear `nodeType === 8`.
- **El `\s` se lo volvió a comer el template literal**, por séptima vez: quedó en `/s+/g` y borró
  **todas las eses** del texto. Se ve en el diagnóstico —«la do co a a propo ito»—. Acá ni hacía
  falta la regex: alcanzaba con `trim()`.

### Cambiar la unidad de un campo NO es cambiar la etiqueta
`dt_onda_e` y `dt_onda_a` pasaron de **m/s a cm/s** el 2026-09-16, como las ondas E y A de la
mitral. El pedido decía «E/A automático: sin cambio en la fórmula» —correcto, es una razón entre
magnitudes de la misma unidad— **y no mencionaba `E/e'`**, que se calculaba como **`e * 100 / ep`**
justamente porque E venía en **m/s** y e' en **cm/s**. Dejar ese `×100` habría publicado un `E/e'`
**cien veces mayor** —un 7,5 saliendo 750— en el informe firmado y en el PDF. **Al mover una
unidad, buscar todas las fórmulas que la convertían.**

Banda nueva: **10–200 cm/s**. Y las etiquetas cambian en CUATRO sitios: el campo, la frase del
informe, la fila de la tabla del PDF y la columna del Excel.

### Los signos indirectos de HTP viven en UNA frase: `htpIndirectosFrase()`
El TAP estaba escrito **a mano en las dos ramas** de la línea de la válvula tricúspide, con **dos
redacciones distintas** —«Se suman elementos indirectos…» y «Se evidencian elementos
indirectos…»— más una tercera en el EN SUMA. Y el **TRIV tricuspídeo no aparecía en ninguna**
aunque estuviera cargado.

Hoy hay una sola función que devuelve `(TAP < 105 ms)`, `(TRIV tricuspídeo > 60 ms)` o los dos
unidos por «y», y la usan los tres sitios. El texto es **«Presenta elementos indirectos de HTP …»**
y el umbral 105 dejó de estar suelto en la cascada.

**La línea tiene DOS ramas —con PSAP calculable y sin ella— y hay que probar las dos.** Los casos
que sólo cargan el TAP no miden IT, así que ejercen únicamente la segunda: una redacción vieja
dejada en la primera **sobrevivía a la mutación**. Hace falta un escenario con `vmax_it` y VCI.

**Al EN SUMA sigue yendo sólo sin PSAP estimable**, como antes: con PSAP el resumen ya gradúa por
ella.

### Un reemplazo por rango se comió el caso siguiente
Al reescribir TC-133 con `s[:i] + nuevo + s[j:]`, el marcador de fin `j` era el cierre de
**TC-134**, no el de TC-133: el reemplazo **borró el caso entero**, 4.478 bytes y sus 25
condiciones. El suite pasó de **149 a 148 sin una sola falla**, porque un caso que no existe no
falla. Lo delató el CONTEO, no el resultado.

Se recuperó con `git show HEAD:` y se verificó **byte por byte** contra HEAD. Es exactamente la
entrada «Los reemplazos por rango de líneas son peligrosos» que este archivo ya tenía, aplicada al
propio suite: **después de un reemplazo por rango, contar los casos.**

### La brecha del Excel eran OCHO columnas, no cuarenta
Auditoría del 2026-09-16 sobre todo lo construido en la semana. El pedido las daba por ausentes en
bloque; medido campo por campo, **casi todo ya estaba**: Doppler tricuspídeo 4/4, válvula pulmonar
6/6, TdF 12/12, Ebstein 15/15, y las demás secciones completas salvo un campo cada una.

**Cómo se mide bien, porque mis dos primeros barridos dieron falsos negativos.** Los checkbox se
persisten con sufijo **`__chk`**, así que buscar `'fontan_comp_epp'` en `LAB_XLS_MAP` no encuentra
`'fontan_comp_epp__chk'` y seis columnas que SÍ estaban salían como faltantes. Y un regex sobre
`'([a-z_0-9]+)'` no matchea `cardioOnco` por la mayúscula. **Comparar con la cadena entrecomillada
exacta, contemplando el sufijo, y mirar las DOS direcciones** —`LAB_XLS_MAP` es el import y
`_labExcelRow` el export, y un campo puede estar en una y no en la otra—.

**Lo que faltaba de verdad:**
- **`et_grado`.** Viajaban el THP, el VTI y el área —los tres insumos de la significación— y **no
  el grado que el médico consignó**. Entra como `opcion`, así que necesitó su entrada en
  `LAB_XLS_LISTAS`: sin ella `_labXlsLista` devuelve `null` y el importador **descarta la fila
  entera**.
- **Las SIETE casillas de inclusión** de las secciones nuevas (Marfan, Eisenmenger, Fontan,
  subaórtica, supravalvular, DSAV, CVPA), mientras las **doce viejas sí estaban**. No es
  cosmético: esa casilla decide si la sección **sale en el informe firmado**, así que un estudio
  reimportado volvía con los datos y **sin la decisión de integrarlos** — la sección desaparecía
  del informe sin que nada lo dijera. Es el defecto de `ete_morfo_incluir`, por la vía del Excel.

El Excel pasó de **421 a 429 columnas** y de 128 a **129 básicas**; TC-135 fija los dos y TC-146 el
contenido. Ojo con el `0` de una casilla apagada: **no es lo mismo que ausente**, y el caso lo
distingue.

### POP rediseñado en cards, y dos variables del pedido que no existen — 2026-09-18

Sólo presentación: ni un cálculo ni un seam cambiaron. Cinco acordeones apilados pasan a una
grilla de dos columnas (una en móvil), con la conclusión a ancho completo.

**`--surface-2` NO EXISTE en este archivo.** El pedido la nombraba para el fondo de las cards, y
una variable CSS inexistente no da error: da fondo transparente. Las reales son `--bg2`/`--bg3`.
**Y el borde va en 1 px, no en 0,5**: en pantallas no-retina 0,5 px redondea a 0 o a 1 según el
navegador, así que la misma card se vería con borde en una máquina y sin él en otra.

**NO HAY «CALCULADOR DE UCI» EN ESTA APP.** El pedido pedía copiarle el diseño; las trece
menciones de mcg/kg/min del archivo son todas de POP. UCI/CTI es otra app de la suite. El
calculador se hizo con el idioma de ésta (`calc-box`/`calc-row`).

**El encabezado pasó a `h2.card-head` + `toggleCard`**, que es el patrón exacto de las otras seis
secciones de la pestaña — era lo que el pedido pedía igualar. De paso gana el plegado, que es lo
que mantiene navegable una pestaña con siete secciones.

**LA FÓRMULA DEL CALCULADOR ES CORRECTA Y SE VERIFICÓ.** `(mg × 1000 / ml) × (ml/h) / 60 / peso`
cierra dimensionalmente y con un caso conocido: noradrenalina **4 mg en 100 ml a 10 ml/h en 70 kg
→ 0,10 mcg/kg/min**, que es una dosis baja típica. El peso sale del campo del estudio —dos pesos
para el mismo paciente es el patrón del espesor parietal— y **sin peso no se calcula**: estimar
con 70 kg publicaría una dosis que no es la de este paciente.

**El resultado NO pisa la dosis tipeada a mano**: se muestra al lado con un botón «usar». La
dosis puede venir de la bomba, y sobrescribirla sería el defecto del campo «auto» al revés.

**Al apagar una droga se borran también los tres campos de dilución**, por el mismo motivo que la
dosis: `guardarInforme` barre `input[id]` sin mirar visibilidad.

#### Lo que costó

**LOS CHEQUEOS SE CORRIERON ANTES DEL COMMIT, que es la corrección del turno anterior — y
encontraron dos cosas.** `detectar_huerfanos` marcó los **diez** `pop_<k>_vel`: su heurística de
«id armado por concatenación» no reconoce ese sufijo, aunque `_diluc_mg` y `_diluc_ml` —que
aparecen en la MISMA expresión— sí los reconoce. Se renombraron a `_veloc`, que además es más
descriptivo; **no se taparon en `CONOCIDOS_LOCALES`**, porque tienen destino real.

**SEMGREP QUEDÓ EN 124 Y NO ESTÁ RESUELTO.** Subió a 125 por dos `innerHTML = a + b + c` míos
—el de la conclusión y el del calculador—, que se arreglaron asignando en un paso. **El tercero no
lo pude aislar dentro de la sesión.** Es WARNING, no ERROR, y la familia sintáctica
`ceibo-xss-innerhtml-concat` ya tiene 69 falsos positivos triageados — pero **eso no está
confirmado para éste**. Queda como lo primero a mirar en el próximo turno: el método es correr el
scan sobre `git show HEAD:index.html` y diffear regla por regla.

### POP-4: la integración ya estaba construida, y el EN SUMA decía lo contrario — 2026-09-18

Bloque 5 y las seis superficies. **La mitad del trabajo fue no construir nada.**

**EL MÓDULO ENTRA POR `amiloSecs()`, que es el camino de los otros dieciocho.** Registrar
`{ k:'pop', gen:amiloTextoPOP, hayDatos:… }` le da, sin una sola vía nueva: la hoja del PDF del
paciente, la diapositiva del PPT del paciente (`amiloEnInforme()` ya la alimenta), el centinela
persistido `am-txt-pop` y el conteo del Laboratorio por `_labIntegrado`. Lo único que hubo que
escribir aparte fue la línea del EN SUMA y las dos superficies del Laboratorio.

**`popPatron()` DEVUELVE DATOS, NO HTML**, y lo consumen las cinco superficies. Ninguna banda se
define adentro: IC por `_icBanda`, RVS por `_rvsBanda`, taponamiento por `dptEstado()`, TAPSE por
`UMBRAL_TAPSE_NORMAL`, VD/VI por el 0,9 de la cápsula de TEP. Lo único propio es cómo se
**combinan**, que es exactamente lo que el cuadro del placeholder anticipaba.

**LA PCP PREFIERE LA MEDIDA Y LO DECLARA.** Con Swan-Ganz usa `pop_sw_pcp`; sin él cae a la
estimada por Nagueh, y la hoja dice cuál. Mezclarlas sin decirlo publicaría un patrón sostenido
en una estimación como si fuera medición.

**El taponamiento se evalúa PRIMERO y no se diluye en un «mixto»**: es la conducta más urgente.
Y «datos insuficientes» no es «sin patrón» — sin IC calculable no se clasifica nada, y el botón
**no se habilita**: una hoja PostCEC sobre un módulo en blanco describiría una evaluación que no
se hizo, en un informe firmado.

#### El defecto que casi entra al resumen firmado

**LA LÍNEA DEL EN SUMA DECÍA «Gasto cardíaco adecuado» SOBRE UN IC DE 1,60.** La primera versión
tomaba el texto de la PREGUNTA de la primera respuesta roja y le quitaba los signos: una respuesta
ROJA a «¿Gasto cardíaco adecuado?» salía al resumen como la afirmación contraria. Es el defecto
del «❌ CONTRAINDICADO» → «NO CONTRAINDICADO» que este archivo documenta, en el campo que más se
lee y se copia. Hoy cada pregunta lleva su `hallazgo` en forma AFIRMATIVA («bajo gasto»,
«congestión», «taponamiento») y el resumen usa ése. La mutación que revierte lo pone en rojo con
la frase completa en el diagnóstico.

**Verificado con una falla de VI de manual**: GC 3,2 con SC 2,00 → IC 1,60 (bajo), PCP medida 24
(alta), RVS (80−12)/3,2×80 = 1700 (elevada). Clasifica `falla_vi`, el botón se habilita, el
módulo entra por `amiloEnInforme`, el EN SUMA sale «PostCEC CABG — hora 6 h — Patrón: Falla del
ventrículo izquierdo — IC 1.60 L/min/m² — bajo gasto.» y la hoja lleva el disclaimer como nota a
ancho completo y la concordancia Swan vs eco.

#### Lo que costó

**SEMGREP SUBIÓ A 124 Y ERA MÍO.** `popConclSync` hacía `e.innerHTML = a + b + c`, que es lo que
matchea `ceibo-xss-innerhtml-concat`. Se arma la cadena y se asigna una vez: de vuelta en 123. De
paso se escapó con `escHtml` el tipo de cirugía y el patrón en la tarjeta del Laboratorio —salen
del ESTUDIO, no de un literal, y un backup JSON trae claves arbitrarias—, que era correcto
independientemente del contador.

**EL `\n` DEL CASO CORRIÓ LA SUERTE DEL `\s`.** `suma.split('\n')` dentro del template literal
quedó como un salto REAL dentro de una cadena de comillas simples y el caso **ni parseaba**. Se
resolvió con `String.fromCharCode(10)`. Es la novena de esta familia.

**TC-164 quedó corto** al aparecer la décima tarjeta de Avanzado: la lista esperada se actualizó.

**`detectar_huerfanos` CAZÓ DOS CAMPOS QUE NO LEÍA NADIE**, y eran de verdad: `pop_sw_fc` —la FC
del catéter— y `pop_picco_gc` —el gasto del PiCCO— existían en el marcado desde POP-1 y POP-2 y
ninguna función los tocaba. El médico los cargaba y desaparecían: el bug del cayado aórtico, otra
vez. Hoy la FC del Swan calcula el **volumen sistólico por termodilución** (GC/FC) y **declara si
difiere en más de 5 lpm de la FC del estudio** —dos frecuencias en la misma hoja sin decirlo es el
defecto de los dos denominadores—, y el GC del PiCCO se muestra sin banda propia, porque el que
gradúa es el IC, que es el indexado. **El detector se corrió DESPUÉS de commitear y por eso el
hallazgo entró en un segundo commit**: va antes del `git add`, como dice la propia sección de
este archivo.

### POP-3: el POCUS no inventa cortes, y el `\s` se comió las eses por octava vez — 2026-09-18

Bloque 4 con sus cuatro subsecciones. **Las dos sincronizadas no tienen criterios propios**, que
era la regla del pedido y la decisión ya tomada para el taponamiento.

**Pericardio lee `dptEstado()`** y publica su conclusión con el rótulo del filtro de cohorte.
Verificado: con derrame moderado y los tres criterios mayores, `dptEstado` dice `taponamiento` y
el POP publica «Taponamiento (3 criterios mayores)». No se reevalúa nada acá.

**LOS DOS SEMÁFOROS DE TRES BANDAS DEL PEDIDO NO SE APLICARON — tercera vez en este módulo.**
La app ya publica los dos parámetros en la cápsula de TEP, **dos acordeones más arriba en la
misma pestaña**:

| | la app | el pedido | el caso que choca |
|---|---|---|---|
| TAPSE | binario, `UMBRAL_TAPSE_NORMAL` = 17 | 🟢≥17 / 🟡12-16 / 🔴<12 | **14 mm**: rojo arriba, amarillo acá |
| VD/VI | ≥0,9 = dilatación (criterio de TEP) | 🟢<0,6 / 🟡0,6-1,0 / 🔴>1,0 | **0,95**: rojo arriba, amarillo acá · **0,7**: verde arriba, amarillo acá |

Se conservan los de la app y el bloque **lo declara en pantalla**. Si algún día se gradúa el
TAPSE en tres bandas, se mueve en `UMBRAL_TAPSE_NORMAL` y en la cápsula de TEP, no acá.

**El hemotórax se declara y NO cambia la banda de conducta**: la decide el equipo quirúrgico y
depende del débito, que esta app no recoge. Callarlo sería peor que no graduarlo.

#### Lo que costó

**`dptTamano()` DEVUELVE UN OBJETO, no una cadena.** Interpolarlo directo imprimía
**«Tamaño del derrame[object Object]»**. Lo cazó la sonda, no la lectura — es el mismo error de
tipo que `_lblDe` devolviendo `'Otro'`.

**EL `\s` SE LO COMIÓ EL TEMPLATE LITERAL, POR OCTAVA VEZ.** El caso normalizaba con `/\s+/g`,
quedó en `/s+/g` y **borró todas las eses**: el diagnóstico decía «di función», «Pre ente»,
«Conclu ión», «de cartar». El caso daba rojo acusando al código de un defecto propio. Se quitó el
regex: acá no hacía falta normalizar nada, alcanza con `indexOf` sobre el `textContent` crudo. Es
literalmente lo que este archivo recomienda desde la quinta vez.

**POP-4 sigue sin empezar.** Toca seis superficies, una de ellas el informe firmado.

#### Las cinco decisiones de POP-4, tomadas antes de escribirlo

Están en el comentario del placeholder —que es donde va a mirar quien retome— y acá. Ninguna
banda de POP-4 se define dentro de POP-4:

| lo que POP-4 necesita | de dónde sale |
|---|---|
| taponamiento | `dptEstado()` — siete claves, la que firma el informe |
| GC / IC | `_icBanda` |
| RVS (vasoplejia) | `_rvsBanda` |
| RVP | `RVP_ELEVADA_UW` — un corte, dos unidades de presentación |
| TAPSE · VD/VI | `UMBRAL_TAPSE_NORMAL` y el 0,9 de la cápsula de TEP |

**Se pregunta POR LA BANDA, no por el número.** `_rvsBanda(rvs)` ya devuelve la de vasodilatación
por debajo de 800; escribir `< 800` dentro de POP sería la segunda copia del mismo corte, y el día
que se mueva la cápsula diría «RVS normal» y el bloque POP «vasoplejia» sobre el mismo paciente.
Vale igual para los otros cuatro.

**Lo único propio de POP-4 es cómo se COMBINAN esas bandas en un patrón** y el texto orientativo
que sale de ahí. Ésa es toda la superficie nueva, y es donde hay que poner la verificación.

### POP: la conversión del TSVI verificada con casos reales, y el taponamiento sale de `dptEstado()` — 2026-09-18

**LA CONVERSIÓN ESTÁ BIEN Y AHORA ESTÁ FIJADA CON CASOS DE POST-OPERATORIO, no con el caso de
números redondos.** `_hemoVSEco` hace `PI * (d/10/2)^2 * itv`: el diámetro pasa de mm a cm y a
radio en un solo paso, el VTI ya viene en cm y no se toca. Medido sobre cinco pacientes
plausibles, comparando contra la aritmética escrita aparte (`d/20`):

| caso | TSVI | VTI | FC | VS | GC | IC |
|---|---|---|---|---|---|---|
| mujer 1,60 m taquicárdica | 18 mm | 16 | 95 | 40,7 ml | 3,87 | 2,37 límite |
| varón estándar POP CABG | 21 mm | 18 | 80 | 62,3 ml | 4,99 | 2,53 normal |
| varón grande bradicárdico | 24 mm | 22 | 62 | 99,5 ml | 6,17 | 2,79 normal |
| bajo gasto POP | 20 mm | 11 | 88 | 34,6 ml | 3,04 | 1,62 bajo |
| hiperdinámico / vasoplejia | 22 mm | 24 | 105 | 91,2 ml | **9,58** | 4,82 elevado |

**Los cinco coinciden con el cálculo a mano.** Cuatro caen en 3-8 L/min y **el quinto no, a
propósito**: una vasoplejia post-CEC con VTI 24 y FC 105 corre de verdad a 9-10 L/min, y la banda
lo rotula «elevado». **3-8 no es un techo fisiológico, es el rango habitual** — usarlo como
validación habría rechazado al paciente vasopléjico, que es justo el que este módulo viene a
describir. Los volúmenes sistólicos (34-100 ml) son todos plausibles.

TC-167 fija ahora los cuatro casos de rango habitual contra la aritmética independiente, más el
volumen sistólico. La mutación con la fórmula del pedido —`(d/2)^2` con d en mm— sigue dando
**439,82 L/min**.

**TAPONAMIENTO EN POP-4: SALE DE `dptEstado()`, y la decisión quedó escrita EN EL PLACEHOLDER**,
no sólo acá — es donde va a mirar quien retome. Esa cascada clasifica en siete claves
(`taponamiento`, `incipiente`, `incipiente_cuantia`, `sin_compromiso`, `incompleto`, `parcial`,
`sin_derrame`) y es la que ya firma el informe; para leerla sobre un estudio guardado existe
`_pcCon(campos, fn)`.

Definir «colapso VD + VCI dilatada» dentro de POP —como lo describía el pedido— habría puesto
**dos definiciones de taponamiento en el mismo documento**: una que exige tres criterios mayores
y distingue «compromiso incipiente» de «derrame sin criterios evaluados», y otra de dos
condiciones. Sobre la conducta más urgente que este módulo puede emitir. **Corolario registrado:
«Falla VD» tampoco inventa cortes** — TAPSE y VD/VI ya tienen los suyos y POP-3 los sincroniza.

### POP-2: tres escalas del mismo número, y una fórmula 100× — 2026-09-18

Bloque 3 del módulo POP. **Lo que más valor tuvo fue lo que NO se implementó.**

**LA FÓRMULA DEL GC POR ECO QUE TRAÍA EL PEDIDO DABA UN GASTO DE 440 L/min.**
`π × (TSVI/2)² × VTI × FC / 1000` con el TSVI en **milímetros** —que es como lo guarda esta
app— da un volumen cien veces mayor. La app ya lo hacía bien (`dtsvi / 10 / 2`: a cm y a radio en
un paso). Es la misma trampa que este archivo documenta para el área tricuspídea, y la mutación
que la reintroduce imprime **439,82 L/min** en la cápsula.

**EL SEMÁFORO DE IC DEL PEDIDO ERA UNA TERCERA ESCALA.** `calcHemo` ya publica, **en esa misma
pestaña**, <2,2 rojo · <2,5 límite · ≤4,0 verde; y `FORR_IC_CORTE` usa el 2,2 para el diagrama de
Forrester. El pedido traía 🟢>2,2 / 🟡1,8-2,2 / 🔴<1,8: un IC de **2,3** habría salido verde en
POP y «límite» dos centímetros más arriba, y uno de **2,0**, amarillo acá y ROJO allá. Decisión
de Maicol: **manda la de la app**, extraída a `_icBanda` y compartida. Ídem `_rvsBanda`.

**LA RVP TENÍA DOS UNIDADES Y DOS CORTES.** La app la publica en Wood con corte >2 UW (ESC/ERS
2022); el pedido, en dyn·s·cm⁻⁵ con normal <250, que son **3,1 UW**. Un paciente de 2,5 UW salía
«normal» acá y «elevada» en el módulo de HTP. Decisión: **las dos unidades, UN solo corte** — el
de la app. Se muestra «2,3 UW (187 dinas·s·cm⁻⁵)» con el semáforo decidido por las UW.

**TRES IDS DEL PEDIDO NO EXISTEN.** `tsvi`, `vti` y `fc` — los reales son `diam_tsvi`,
`itv_tsvi` y `hemo_fc`, y viven en Hemodinámica, no en AI/VI. Verificado antes de escribir una
línea; un id inventado no falla, calla.

**Peso y talla no se vuelven a pedir**: la SC sale de `getBSA()`, la misma de toda la app. Dos
campos para la misma medida es el patrón del espesor parietal, que este archivo ya pagó tres
veces.

**La RVS de POP usa la PAD MEDIDA por el catéter y la de la cápsula la PVC estimada por VCI.**
Las dos son correctas y pueden diferir; la diferencia se **declara en pantalla** en vez de dejar
dos números con el mismo nombre.

**El denominador de la concordancia es el gasto por termodilución**, no el promedio de los dos:
lo que se quiere medir es cuánto se aparta el eco de la referencia. Y sin GC del catéter el
bloque no se muestra — comparar contra un hueco daría 100 % y se leería como discordancia total.

**Verificado con un caso de números redondos** (peso 80 / talla 180 → SC = 2,00 exacta): IC 2,50
· RVS 1120 · RVP 2,33 UW = 187 dyn · GC eco 4,40 · IC eco 2,20 · diferencia 12 %. Los seis dan
exacto, y **la cápsula de la app publica el mismo GC y el mismo IC** que el bloque POP — que es
la condición que impide la segunda implementación.

**POP-3 y POP-4 no se empezaron.** POP-4 toca seis superficies, incluida la del informe firmado.

### POP Cirugía Cardíaca (POP-1): estructura, y no es una subtab — 2026-09-18

Bloques 1 y 2 con sus 19 campos, placeholders declarados para 3, 4 y 5, y el botón de integrar
deshabilitado. **Sin una sola línea de cálculo**, que es lo que pedía la tarea.

**NO ES UNA SUBTAB, y el pedido la describía así** («al lado de las subtabs existentes»).
`tab-hemodinamica` **no tiene subtabs**: tiene seis acordeones `toggleCard` —perfil
hemodinámico, HTP, TEP, VEXUS, HFA-PEFF y derrame—. Montar un rail habría obligado a
reestructurar los seis, que es exactamente lo que la regla «sin tocar nada de lo existente»
prohíbe. POP se agregó con el MISMO patrón y al mismo nivel.

**El prefijo `pop_` se eligió DESPUÉS de verificarlo contra `_noVaciar`**, la allowlist de
`editarInforme`: no matchea, así que los campos se tratan como del estudio y los barren solos
`guardarInforme`, `limpiarCampos` y las rutas de restauración. Medido: **25 claves en `campos`**
—19 ids más los 6 `__chk` de las casillas—, y reabrir repone valores y visibilidad.

**LA DOSIS SE BORRA AL DESMARCAR LA DROGA, no sólo se oculta.** `guardarInforme` barre
`input[id]` **sin mirar visibilidad**, así que una dosis escondida viaja DENTRO del estudio y
puede llegar al informe el día que el módulo genere texto (POP-4). Es la misma lección que este
archivo ya tiene escrita para los selectores del VEXUS —«deshabilitarlos parecía prolijo pero
dejaba los valores cargados escondidos»—. Ídem el ratio de BCIA al cambiar a ECMO. La mutación
que sólo oculta pone en rojo dos condiciones, con el `5` de la dobutamina en el diagnóstico.

**No se usó `disabled` como compuerta**: no se persiste ni lo repone ninguna ruta de
restauración. Está documentado en este archivo y acá sólo se usa en el botón, que es cosmético.

**`popSync` va en las DOS columnas** —`RECALC_MODULOS` y el final de `limpiarCampos`—. Sin la
segunda, «Nuevo estudio» dejaba abiertas las filas de dosis del paciente anterior.

**Los acordeones se abren por ANCHO, no por datos.** `cardAutoOpen` abre «los que tienen datos»,
que es otra pregunta; acá el pedido era móvil cerrado / escritorio abierto. Medido a 1280 (los
cinco abiertos) y a 390 (los tres cerrados, sin scroll horizontal). Se repinta la flecha además
del panel.

**La opción 0 de los tres selects es VACÍA, no «Ninguna».** «Ninguna cirugía» y «nadie lo
consignó» no son lo mismo en un post-operatorio, y un default que afirma es el defecto que este
archivo documenta tres veces.

**DEUDA DECLARADA: `detectar_huerfanos` marca tres candidatos** —`pop_cx_tipo`, `pop_cx_horas`,
`pop_monitor`—. Es **correcto y esperado**: POP-1 es sólo estructura y esos campos todavía no
tienen destino. **No se agregaron a `CONOCIDOS_LOCALES`**: hacerlo taparía el aviso justo cuando
POP-4 tenga que darles salida. Los de drogas y asistencia no aparecen porque `popSync` arma sus
ids por concatenación.

**Mi sonda midió sobre la nada una vez más:** le pasé `est.id` a `cargarEstudioPorId`, que espera
el **`estudioId`**, y todos los campos volvieron vacíos — parecía que la restauración estaba
rota. Es la quinta vez en la sesión.

### Los cuatro módulos en las tres superficies, por un seam cada uno — 2026-09-18

HFA-PEFF, VEXUS, derrame/taponamiento y constricción-vs-restricción pasan al PDF de auditoría y
al PPT del Laboratorio. **Lo primero que se hizo no fue escribir la sección ni la diapositiva:
fue extraer los cuatro seams** —`_labHfpeffResumen`, `_labVexusResumen`, `_labDptResumen`,
`_labCvrResumen`— y hacer que la tarjeta del Laboratorio los consuma. Con tres implementaciones,
el papel firmado y el proyector cuentan la misma cohorte distinto, y el proyector es la
superficie donde eso no se puede verificar.

**LA POBLACIÓN SE FILTRA ADENTRO DEL SEAM, no en el llamador.** Los tres consumidores reciben
`infs` y el seam se queda con los que integraron. Dejar el filtro afuera es lo que permite que
una superficie pase otra población — y ya había pasado: **la tarjeta de HFA-PEFF calculaba sobre
«score calculable» mientras el contador de dos tarjetas más arriba contaba integrados**, o sea
dos n del mismo módulo en la misma pantalla. Se alineó a integrados (decisión de Maicol) y **sus
números BAJAN**: un estudio con los tres dominios medidos y el módulo nunca integrado ya no
cuenta.

**El seam expone también los ARRAYS** (`arr`, `arrCompletos`), no sólo los totales: la tarjeta
los recorre para el histograma y los dominios, y con sólo los totales habría tenido que
recalcularlos — la segunda copia por la puerta de al lado.

**Cada superficie sale sólo con ≥1 caso integrado**, y las hojas del PPT con n < 3 llevan el
aviso de cohorte chica que ya existía (`avisoN`). Las omisiones se declaran con su motivo, como
el resto del mazo.

**PDF ≥ PPT, verificado y no afirmado**: la sección del PDF trae además los promedios de
NT-proBNP y BNP y el desglose de dominios, que la diapositiva no lleva. TC-165 lo fija buscando
esa cadena en el content stream.

**Los rótulos de las conclusiones salen de los `<option>` del filtro de cohorte**
(`_labLblConclusion`), que ya son la traducción de esas claves. Lo que el filtro no ofrece
—`sin_datos` de `cvrEstado`— cae a la clave cruda, a propósito.

#### Lo que costó

**TRES ASERCIONES DE MI PROPIO SCRIPT ME FRENARON, Y LAS TRES TENÍAN RAZÓN.** Conté
`'lab-card '` con espacio sobre un marcado que dice `class="lab-card"`; después `s.index()`
encontró una ocurrencia ANTERIOR del ancla de fin y el bloque salió invertido; y a la tercera el
rango abarcaba 18 referencias en vez de 6. **Ninguna escribió el archivo.** Un `assert` antes del
`write` es lo que separa «no se aplicó» de «se aplicó mal», que es el error que este archivo ya
documenta tres veces.

**TC-156 DABA ROJO POR UNA CONDICIÓN DEMASIADO AMPLIA.** Exigía que la metodología «no declare
NINGUNA omisión»; desde que el grupo `hemo` incorporó los cuatro módulos nuevos, esos cuatro se
declaran omitidos cuando nadie los integró — que es correcto y es justo lo que TC-165 verifica.
Se acotó a los tres módulos que ese caso prueba. **Una condición que habla de «ninguno» se rompe
cuando el conjunto crece.**

**La mutación que lo vigila** es el seam que deja de filtrar por integración: los cuatro n pasan
de 1/2/1/1 a 5 y caen tres condiciones. Es la que distingue «cuenta a los que integraron» de
«cuenta a todos», que es la única diferencia que importa acá.

### El contador del Laboratorio NO contaba «Integrar al informe» — 2026-09-18

Reordenamiento de subtabs y de Avanzado, y el centinela de integración. **Los reordenamientos
eran casi nada y el centinela era otra cosa de la que decía el pedido.**

**El rail ya estaba en el orden pedido salvo las dos últimas**: sólo hubo que intercambiar
Informe ↔ Asociaciones. Y **Avanzado sólo tenía «Uso del módulo avanzado» tercera en vez de
primera**; las otras cinco ya estaban. La tarjeta se movió **con su comentario pegado**: en esta
subtab viven párrafos y comentarios ENTRE las tarjetas, y mover una suelta los deja explicando
la equivocada — la trampa que el reordenamiento anterior ya documentó.

#### «Hoy esto funciona para Hemodinámica, TEP, Amiloidosis y Cardio-Onco» era falso

Los cuatro contaban por **DATO CARGADO**, no por integración: `_labHemoUsado` mira `hemo_fc` o
`hemo_pam`, `_labAmilUsado` mira `alg-ett-score`, `_labOncoUsado` mira `co_farmaco`. Ninguno mira
el botón.

**El centinela persistido SÍ existe y es `campos['am-txt-<k>']`.** `amiloIntegrar(k)` escribe el
texto del módulo en un `<textarea id="am-txt-<k>">` y `guardarInforme` barre `textarea[id]`.
**`amiloIntegrado(k)` NO sirve para esto**: mira el `display` de un div del DOM vivo, o sea el
estudio abierto, no el guardado.

**NO SE CAMBIARON LOS `_lab*Usado`, Y ESA ES LA DECISIÓN QUE IMPORTA.** La respuesta elegida fue
«los ocho por integración», pero esos cuatro predicados tienen otros consumidores que necesitan
el significado viejo:
- `_labOncoUsado` gatea la columna **«Riesgo CV basal» del Excel** — con el criterio nuevo, todo
  estudio con datos oncológicos sin integrar perdería esa celda;
- `_labOncoUsado` y `_labAmilUsado` definen la **población de las asociaciones estadísticas**
  (`A_POBL`), así que cambiarlos mueve los p-valores de un PDF de auditoría firmado;
- `_labTepUsado` es el predicado del **filtro de cohorte**.

Nada de eso se pidió. Se agregó `_labIntegrado(inf, k)` y **el contador pasa a usarlo**; los
`_lab*Usado` quedan intactos para sus otros lectores. Los dos significados conviven porque son
dos preguntas distintas —«¿se cargó el dato?» y «¿bajó al informe firmado?»— y la tarjeta lo
**declara en pantalla**. Antes de cambiar un predicado compartido, `grep` de sus consumidores:
acá eran cuatro y tres estaban fuera del Laboratorio.

**Amiloidosis son DOS claves** (`ett` y `alg`) y se integran por separado: basta una.

**Consecuencia declarada**: los conteos de los cuatro módulos que ya estaban **BAJAN**. Medido
sobre la cohorte del caso: hemodinámica pasa de 2 a 1 y cardio-onco de 1 a 0, porque los estudios
con el dato y sin integrar dejan de sumar.

#### Las tres tarjetas nuevas

VEXUS, derrame/taponamiento y constricción-vs-restricción. **Sus claves `data-ppt` se registraron
en `LAB_PPT_GRUPOS`**: `_labPptAssertGrupos()` exige que toda clave pertenezca a exactamente un
grupo, y una tarjeta sin grupo **no da error** — da una casilla que el médico tilda y no produce
nada. Se sumaron al grupo `hemo`, que pasó a llamarse «Hemodinámica y pericardio».

**Los rótulos de las conclusiones salen de los `<option>` del filtro de cohorte**
(`#coh-dpt-con`, `#coh-cvr-con`), que ya son la traducción de esas mismas claves. Un segundo mapa
se desincroniza y el síntoma sería mudo: una fila rotulada `incipiente_cuantia` en vez de con su
texto. Lo que el filtro no ofrece —`sin_datos` de `cvrEstado`— cae a la clave cruda, a propósito.

#### Lo que costó

**CUATRO CASOS ANTERIORES SE PUSIERON EN ROJO, Y LOS CUATRO TENÍAN RAZÓN.** TC-142 pinaba el
orden viejo de las subtabs y de Avanzado; TC-155 y TC-156 pinaban **el literal 53** de tarjetas
con casilla, que daba rojo con **56/56** —o sea con el registro perfectamente sano—. Los dos
conteos pasaron a comparar los dos lados entre sí en vez de contra un número fijo: *que toda
tarjeta tenga grupo y todo grupo tenga tarjeta* ya lo dicen las tres condiciones de arriba.

**MI SONDA LEYÓ `.length` DE UN OBJETO.** `_labPptAssertGrupos()` devuelve
`{enDom, enGrupo, sinGrupo, …}`, no un array: `.length` daba `undefined` y `JSON.stringify`
**omite las claves undefined**, así que las dos líneas del assert simplemente no aparecieron en
la salida y no lo noté hasta buscarlas. Lo que sí probaba algo era `console.error: ninguno`.

**Un reemplazo por regex se comió una sola línea de una condición de dos** y dejó un `]`
colgando: el suite pasó de 179 a «178/179 con excepción SyntaxError». Es la entrada «los
reemplazos por rango son peligrosos» otra vez, y el que la caza es el chequeo de sintaxis.

**Backtick dentro del cuerpo de un caso: van VEINTE**, segunda vez en dos turnos, otra vez en el
comentario que explicaba el cambio.

**Una mutación, cazada:** el contador de vuelta a dato cargado pone en rojo las dos condiciones
negativas —hemodinámica sube a 2 y cardio-onco a 1—, que son las que separan «cuenta integración»
de «cuenta cualquier cosa».

### La salvedad era una CELDA, y el PPT ya hacía tres de las seis cosas pedidas — 2026-09-18

Seis tareas. **Dos ya estaban hechas, una lo estaba a medias y tres eran reales.**

#### PDF · el tipo `nota`, y el defecto eran SEIS hojas y no una

El pedido decía que «la conclusión y la Salvedad están dentro de la tabla». Medido en el content
stream: **la conclusión ya salía a ancho completo** (`x = 31,2 pt`) — la línea de `VEXUS_INTERP`
no tiene ` | `, así que cae en la rama `txt`. La que estaba rota era **la Salvedad**, empujada
como `'Salvedad | ' + texto`, o sea una fila `kv`: 230 caracteres exprimidos en la columna del
VALOR, que mide el 46 % del ancho. En HEAD se dibujaba en `x = 308,5 pt` y **cuatro** líneas.

**Y no era sólo VEXUS: son SEIS hojas** —TEP, VEXUS, derrame/taponamiento, constricción (×2) y
Wilkins—. Se reportó la que el médico miró. Al arreglar un defecto de formato, `grep` del patrón
que lo produce.

`amiloDibujarSecciones` ganó el tipo **`nota`** con marcador `!!`: ancho completo, itálica, fondo
al 7 % del tema y filete de color. **Los tres a la vez porque cada uno falla por su lado** — el
fondo desaparece en una fotocopia, el filete solo se lee como decoración, y la itálica sola no
separa el bloque de la tabla de arriba. Hoy: `x = 38,3 pt` y dos líneas.

**Un marcador y no «si el valor es largo, sacalo de la tabla»**: el umbral sería arbitrario y el
formato quedaría dependiendo de cuánto escribió alguien. Lo decide quien redacta la hoja, que es
quien sabe si eso es un dato o una advertencia. Y `_NOTA_PAD` se usa en `plan()` **y** en el
bucle: si se mide un alto y se dibuja otro, el autoajuste A4 elige el cuerpo sobre un alto que no
existe — es el defecto que esta misma función ya documenta para el hueco entre secciones.

#### PPT · lo que ya estaba

- **La portada ya mostraba** presentador · institución, período, N, fecha de generación y el
  aviso de cohorte filtrada. **El modal ya se precargaba de Config** (`med-nombre` +
  `ecoGetCentroPrincipal`). Lo único que faltaba era el **rango real**: `periodo` es la etiqueta
  del selector, así que con doce estudios de marzo y abril la portada decía «Último año» y la
  sala entendía doce meses de actividad.
- **La diapositiva de tendencia ya existía**, gateada en ≥2 meses, que es la condición que el
  pedido pedía. Lo que cambió es la forma.
- **Las diapositivas ya eran condicionales** y las omisiones **ya se declaraban** con su motivo.

**El rango se ordena como CADENA.** `fecha_estudio` es ISO, y ahí el orden lexicográfico ES el
cronológico; `new Date('2026-03-05')` lo interpreta como UTC y en Uruguay devuelve el día
anterior — el defecto que este archivo ya documenta para `_pptFechaLarga`.

#### PPT · dos gráficos y no dos series

Volumen de estudios y FEVI promedio compartían eje. Con 4 estudios y una FEVI de 58, la línea de
actividad quedaba aplastada contra el piso. Es «dos escalas incompatibles», que ya obligó a
partir la comparación de subgrupos. Hoy: **barras** para el conteo, **línea** para la FEVI, y
título dinámico «Evolución — 2026/02 — 2026/04». La regla de no graficar la FEVI con huecos se
conserva: el eje X es el mismo y una línea con huecos se lee como un desplome.

#### `MIN_OPC` de 3 a 1, y por qué el aviso no es opcional

Decisión de Maicol. Con el umbral en 3, una cohorte chica —que es cuando más se usa este mazo—
perdía casi todas las hojas de una vez. El costo es real: con uno o dos casos una torta es una
porción del 100 % y un promedio es el valor de ese paciente. **Por eso toda hoja con n < 3 lleva
impresa la salvedad**, y va ARRIBA, debajo del título: el pie de estas hojas ya está ocupado por
las salvedades metodológicas y una advertencia apilada al final se lee último, o no se lee.
**El umbral decide si la hoja SALE; el aviso decide cómo se lee.**

**«Resumen general siempre presente» NO se aplicó** (decisión de Maicol): sigue gateado por su
casilla, porque el checkbox es la única fuente de verdad del mazo. Fijas quedan portada,
metodología y cierre.

#### ETE y hemodinámica

ETE eran cinco `dato` seguidos a 16 pt con el mismo paso: las líneas largas de Wilkins y TEER se
salían de la columna y el rótulo de cada tema quedaba pegado al valor del anterior. Hoy **cuatro
bloques** separados por un filete al 18 %, valores a 12 pt y columna de 5,5" (el gráfico arranca
en 6,2, hay sitio). Hemodinámica: el Forrester pasa de 2,75×1,97 a **4,3×3,08** y la torta baja a
2,2×1,9 — **el diagrama ES la hoja**, ubica a cada paciente en su cuadrante; la torta cuenta
cuántos hay en cada uno, que es el mismo dato agregado. Se conservó la proporción 460:330.

#### Lo que costó

**DOS CASOS ANTERIORES SE PUSIERON EN ROJO, Y ESO ES LA SEÑAL.** TC-150 tomaba el primer gráfico
de **línea** y exigía que sus valores fueran los de `_labMeses`; desde que el volumen va en
barras, ese primer `line` es la FEVI. Y TC-151 exigía la omisión de la hoja sistólica sobre una
cohorte de dos, que con el umbral en 1 **ya no se omite**: la condición que vigila el formato de
`faltanN` se quedó **sin denominador**. Se le agregó una corrida con una cohorte SIN NINGUNA
FEVI, que es donde `faltanN` dispara ahora. Los dos invariantes siguen intactos; lo que cambió es
dónde mirarlos.

**MI SONDA MIDIÓ TRES VECES SOBRE LA NADA, Y LAS TRES PARECÍAN VERDES:**
1. `VEXUS_VASOS` es un `const` de módulo y **no existe en `window`**, así que el bucle que
   sembraba los vasos no seteó ninguno: `score` en null, la salvedad nunca se emitió y
   `xDeLaSalvedad` salió `[]`. Un array vacío se lee igual que «no hay problema».
2. Después medí `amiloImprimirPDF('ett')`, que imprime la hoja del score de amiloidosis y no la
   de VEXUS. **23 objetos de texto en todo el documento** — el denominador lo gritaba.
3. Un `assert` del script de parcheo falló, **el archivo no se escribió**, y la corrida siguiente
   usó la sonda vieja con el mismo resultado de antes. Tercera vez en dos sesiones: **después de
   parchear, confirmar que el archivo cambió.**

**El control negativo es lo que la validó**: contra HEAD la salvedad sale en `x = 308,5` y cuatro
líneas; con el arreglo, `38,3` y dos.

**Y la condición de los dos gráficos daba rojo contra un generador correcto.** La escribí contra
el texto de la diapositiva, y **los títulos de un gráfico viven en el CHART**, no en sus objetos
de texto. Es la misma corrección que ya se les hizo a TC-150 y a la torta de amiloidosis.

**Backtick dentro del cuerpo de un caso: van DIECINUEVE**, y fue en el comentario que escribí
para explicar por qué se reapuntaba TC-151.

**Cuatro mutaciones, las cuatro cazadas:** la salvedad de vuelta a fila de tabla (cae por tres
condiciones, con `308.5` en el diagnóstico), el volumen de vuelta a línea, el Forrester de vuelta
a 2,75×1,97 y la portada sin el rango real.

### Config en siete tarjetas, y la séptima el pedido no la nombraba — 2026-09-18

Reorganización visual: cada sección pasó a una tarjeta con borde propio dentro de una grilla de
dos columnas (`.cfg-grid` / `.cfg-card`), que colapsa a una en ≤768 px. **Ningún campo, id ni
handler cambió** — lo único que se tocó del contenido son los `border-top`/`padding-top` que
separaban las secciones, porque ahora ese trabajo lo hace el borde de la tarjeta. Los
`border-top` **internos** de «Institución y firma» —los que separan Modo institucional y Logo—
se conservan.

**EL PEDIDO ENUMERABA SEIS TARJETAS Y CONFIG TIENE SIETE SECCIONES.** La que faltaba es
**👨‍⚕️ Médicos**, que no es una lista más: el médico marcado como **Principal** es de donde
salen el nombre y la matrícula que **firman el informe** — la propia tarjeta de Institución lo
dice en su primer párrafo. Construir las seis del pedido la habría dejado sin destino, contra la
regla explícita de no eliminar nada. Decisión de Maicol: **tarjeta propia**, pegada a Centros.

**LAS MINIATURAS DEL PDF YA ESTABAN EN 4/2 COLUMNAS** — el pedido las pedía y estaban desde
antes, con un comentario que explicaba por qué (2×4 y 4×2 son las dos únicas formas en que ocho
quedan parejas). Lo que sí cambió es el TAMAÑO: de 74 a 54 px de alto. Y la tarjeta del PDF **no**
se extiende a las dos columnas, que fue lo primero que probé: a ancho completo las celdas quedan
en ~280 px con el dibujo de 130 px centrado y el resto aire, o sea la «tarjeta grande» que el
rediseño venía a achicar. En media fila la celda da ~135 px y la miniatura la llena.

**`minmax(0, 1fr)` y no `1fr`.** Un hijo de grid no baja de su min-content, y la tarjeta del PDF
tiene adentro su propia grilla de cuatro: con `1fr` desbordaba la columna en vez de encogerse, y
eso es scroll horizontal en móvil — justo lo que el rediseño venía a evitar.

**Medido en cuatro anchos, no mirado:** 1280 → 2 columnas, 7 tarjetas, miniaturas en 4, svg
94×54; 768, 390 y 360 → 1 columna y miniaturas en 2. **Cero scroll horizontal y cero elementos
fuera del viewport en los cuatro.** `check_mobile.js` sigue en los 2 hallazgos ALTA de la línea
base y **ninguno** sale de Config.

**A 768 EXACTOS la grilla ya es de una columna**, no de dos. El pedido decía «≥768 px: dos
columnas». Se conservó `max-width:768px` porque es el breakpoint de **todas** las grillas del
archivo (`.grid-2`, `.grid-3`, `.grid-4`, `#pltz-grid`): cambiar sólo ésta a 767 habría dejado
Config comportándose distinto del resto de la app en el ancho exacto de un iPad vertical.

#### Lo que costó

**ESCRIBÍ MARCADO LITERAL DENTRO DE UN COMENTARIO HTML, que es lo que este archivo advierte dos
veces que no hay que hacer.** El comentario de cabecera decía «cada sección es una
`<section class=...>`» y el conteo de balance pasó a ver **8 aperturas y 7 cierres**: una
etiqueta descrita en prosa se cuenta como marcado real. Lo delató el conteo, no la lectura.
En los comentarios, describir.

**LA PRIMERA MUTACIÓN NO SE APLICÓ Y EL CASO DIO VERDE.** El script de Python lanzó
`ValueError: substring not found`, así que la copia quedó **idéntica** al archivo real — y un
caso que pasa sobre el código sin mutar no prueba nada. Es el mismo error de denominador que ya
está documentado para la extracción de seams. **Después de mutar, confirmar que el archivo
CAMBIÓ** —acá, −1141 bytes— antes de leer el resultado.

**El caso enumera los CONTROLES, no las tarjetas.** Contar siete no distingue una tarjeta
completa de una vaciada que conserva su título, y el modo de fallo de una reorganización de
markup es mudo: la página sigue dibujando y lo único que pasa es que el médico ya no puede
configurar algo. TC-161 verifica los **treinta** ids, que sigan **dentro** de la tab —un id
suelto en otra parte del documento existe para `getElementById` y es inalcanzable para el
médico—, las ocho plantillas y las cinco opciones del nombre de archivo. La mutación que borra
la tarjeta de Médicos cae por tres condiciones.

**Sin probar en Safari**: el navegador está concedido en modo sólo lectura, así que no se puede
navegar hasta Config para mirarlo. Verificado en Chrome a 1280, 768, 390 y 360.

### El color del PDF: la premisa era cierta, y el defecto vivía en DOS superficies — 2026-09-18

«El encabezado toma el color de la plantilla y los módulos avanzados el del header» resultó
**cierto**, que no es lo habitual en esta serie de pedidos. Medido: `amiloDibujarSecciones`
recibe `tema: TEMA` —el color elegido— y `_hdrModerno` cableaba `[198,40,40]`, así que un
informe con Moderno salía con el encabezado **rojo** y las hojas siguientes del color del
médico. Elegante igual, con `[212,160,23]`.

**PERO EL CABLEADO NO ESTABA SÓLO EN EL ENCABEZADO.** `_TBL_ESTILOS` —el estilo de las tablas,
las barras de sección, el bloque del informe, el EN SUMA y la firma— tenía el rojo en **siete**
claves de Moderno y el oro/crema en **once** de Elegante. Arreglar sólo las dos funciones de
encabezado habría **mudado** la inconsistencia del encabezado al cuerpo en vez de cerrarla: la
banda del título obedeciendo al selector y el párrafo del EN SUMA todavía rojo. Al cerrar un
defecto de color, enumerar TODAS las superficies que pintan, no la que se reportó.

**La infraestructura ya existía y no hubo que inventarla.** `_C` resolvía centinelas
(`'TEMA'`, `'TEMA_30'`, `'TEMA_08'`) desde que se hizo Bicolor; faltaban dos tintes
(`'TEMA_15'`, `'TEMA_04'`). Las dos plantillas pasaron de arrays a centinelas.

**`TEMA_04` no es un número elegido a ojo:** es el mismo tinte que usa el fondo del encabezado
de Elegante (`_mezclar(TEMA, blanco, 0.96)`). Con dos valores distintos, la banda del título y
la franja de la tabla se ven como dos cremas diferentes en la misma hoja.

**EL MAPA DE COLORES ESTABA ESCRITO TRES VECES** —`_temaPDF` en `generarPDFReal`, `TEMA_PDF` en
`amiloImprimirPDF` y `PDF_BTN_COLORS` en hex dentro de `setPdfColor`— y las tres coincidían por
suerte, no por construcción. Hoy hay una sola, `PDF_TEMA_RGB` + `pdfTemaRGB()`, con validación
contra el mapa: un `pdf_color` desconocido cae al 1 y no llega un `undefined` a
`setFillColor`, que en jsPDF **no lanza** — pinta negro y arrastra el resto de la página.

#### Lo que NO se cambió, y es una decisión

**Minimalista, Académico y Compacto siguen sin color** (decisión de Maicol). Tomado al pie de la
letra, «las plantillas no definen el color» las habría pintado también — y la **ausencia** de
color es su diseño: Minimalista se llama así y su descripción dice «Sin color. Una línea fina y
nada más». Quien la elige quiere un informe sobrio. TC-160 lo fija por el lado negativo, y la
mutación que las pinta lo pone en rojo.

**Las descripciones y las miniaturas se actualizaron, porque si no mienten.** Moderno decía
«Banda **roja** a todo el ancho» y Elegante «**Crema y dorado**»; las miniaturas los dibujaban.
Las miniaturas ahora llevan **tokens** (`%A%`, `%A15%`, `%A55%`, `%A82%`, `%A96%`, `%AD%`) que
`_pltzSvgTeñido` resuelve contra el color elegido — y de paso se cierra un desfase preexistente:
Clásico, Bicolor e Institucional mostraban el azul por defecto aunque el médico hubiera elegido
bordó. **Token y no un mapa hex→hex**: un mapa deja de matchear EN SILENCIO el día que alguien
retoca un color del dibujo; un token mal escrito se ve, queda literal en el atributo.
**`%A%` se reemplaza ÚLTIMO**: es prefijo de todos los demás y hacerlo primero dejaría `%A15%`
como `<hex>15%`. Es la colisión de substring, cuarta vez.

#### Lo que costó

**MI PRIMERA MEDICIÓN NO MEDÍA NADA Y PARECÍA VERDE.** La sonda imprimía con
`console.log('%-14s …')` y **`%-14s` no es un especificador de Node** —sólo existen `%s`, `%d`,
`%j`…—, así que se imprimió literal y corrió todos los argumentos una posición: la columna que
decía si quedaban colores viejos salió como `NaN`, que se lee igual con hallazgos y sin ellos.
**Un formato roto convierte una verificación en un adorno.** Reescrita con concatenación.

**El control negativo contra HEAD es lo que la validó:** ahí la sonda imprime
`>>> rojo Moderno` y `>>> oro oscuro Elegante`, y con el arreglo, ninguno. Sin esa mitad, «cero
colores viejos» no distingue «lo arreglé» de «la sonda no busca bien».

**LA CONDICIÓN «Moderno usa el color elegido» PASABA CON EL DEFECTO REINTRODUCIDO.** Preguntaba
si el color del tema APARECE en la hoja, y las tablas ya lo aportan por su cuenta: revertir el
encabezado a rojo la dejaba en verde. Se cuenta en vez de preguntar por la presencia — medido, 4
apariciones con las dos mitades obedeciendo y 1 al revertir. **Presencia no es obediencia.**

**Tres mutaciones, las tres cazadas:** el encabezado de Moderno revertido, las barras de sección
de Elegante revertidas, y Minimalista pintada con el tema.

### El formulario ya salía en blanco: lo que se filtraba era el diagrama del ETE — 2026-09-18

El pedido era «al abrir la app, si no hay un estudio en edición, llamar `limpiarCampos()` en
`DOMContentLoaded`», y traía tres premisas. **Las tres se midieron antes de tocar nada y las tres
fallaron**, cada una en una dirección distinta.

**1 · «Los campos no salen en blanco» — FALSO.** En una apertura limpia hay **cero** campos de
texto/número/textarea fuera de su valor por defecto. `nombre` y `fevi` vacíos. Lo único que puede
llenar el formulario al arrancar es la restauración del borrador del autosave, que **es**
exactamente «un estudio en edición activa» — o sea, lo que el propio pedido quería preservar.

**2 · «Verificar qué flag existe en localStorage para detectar edición activa» — NO EXISTE
NINGUNA.** El censo completo de claves no tiene nada parecido: sólo configuración del médico y del
centro, tema, y `ecosmart_autosave`. La sesión (`ett_auth`) vive en `sessionStorage`.
`eeCurrentInformeId` es una variable de módulo, no se persiste.

**3 · `limpiarCampos()` EN EL ARRANQUE DEJA SIN FIRMA TODOS LOS PDF.** Medido sobre una copia en
`/tmp`, que es la única forma de saberlo: `limpiarCampos` barre
`input[type=text], input[type=number]` **de todo el documento y sin excluir los readonly** —su
propio comentario dice «(incluye readonly calculados)»— así que corriendo después de
`aplicarMedico()` vacía `firma-nombre` y `firma-cjpp`. El bloque de firma queda en blanco hasta
que el médico vuelva a entrar a Config. De paso se lleva `lab-pdf-titulo` y pone `lab-periodo` en
30 (`selectedIndex = 0`), o sea que el Laboratorio arranca con otra ventana temporal y otro
denominador. **No se aplicó.**

#### Lo que sí estaba roto, y no era un campo del formulario

`ete_seg_A1`…`ete_seg_P3` eran claves **GLOBALES** de localStorage —no por estudio— y un
`setTimeout(300)` del arranque las volcaba a los espejos en **cada carga de la app**. La tapa que
este archivo daba por suficiente (`limpiarCampos` → `eteLimpiarSegmentos()`) sólo corre en «Nuevo
estudio»: **no cubría el arranque**. Reproducido: formulario en blanco y el resumen del diagrama
diciendo «🔴 Hallazgos: A1: Flail · A2: Flail · A3: Flail» del paciente anterior.

**El arreglo es sacar la clave, no limpiarla.** El estado no se pierde porque los espejos son
`input[type=hidden][id]`: viajan en `campos` por el barrido de `guardarInforme`, los repone
`eteSegSync` desde `RECALC_MODULOS`, y el autosave los guarda porque barre `input[id]`. Este
archivo ya lo declaraba —«la clave global ya no tiene consumidor legítimo y se podría sacar»— y lo
que faltaba era medir que la tapa no alcanzaba. Se **purgan** además las que hayan quedado en
disco: son hallazgos clínicos sin cifrar y sin dueño, y sin la purga sobreviven en cada máquina
donde la app ya corrió.

#### Y el hallazgo que apareció de paso: la restauración del borrador estaba MUERTA otra vez

La guarda «formulario vacío» de `_autosaveRestore` excluye los `readonly`, y su comentario dice
haber cerrado exactamente este defecto nombrando cuatro campos. **Quedaron dos afuera**:
`firma-esp` y `cfg-med-especialidad` son `input[type=text]` **sin** `readonly` que la configuración
del médico llena al arrancar. Medido: con especialidad cargada el borrador **no vuelve nunca**; sin
especialidad vuelve. O sea que para cualquier médico configurado de verdad, cerrar la pestaña a
mitad de un estudio perdía todo, con la app prometiendo lo contrario en cada tecla.

**La condición correcta no es «no es readonly» sino «es un campo del estudio».** Eso ya estaba
escrito: `_noVaciar`, dentro de `editarInforme`, con el comentario «prefijos de campos que NO son
del estudio». Se subió a nivel de módulo como **`_CAMPOS_FUERA_DEL_ESTUDIO`** y `editarInforme`
quedó con un **alias local**, así que su cuerpo no cambió ni un carácter. Una sola expresión, dos
preguntas: qué no vaciar al abrir un estudio, y qué no cuenta como evidencia de formulario empezado.

#### Lo que costó

**LA TAREA 1 YA ESTABA HECHA POR OTRO AGENTE, Y SE HABÍA LLEVADO `version.json`.** Los tres JSON de
prueba aparecieron en `tests/` solos, minutos antes —hay sesiones concurrentes sobre este repo—, y
el movimiento arrastró **`version.json`**, que es el único `.json` versionado de la raíz y **no es
un fixture**: el banner de versión hace `fetch('version.json?_v=…')` a **ruta relativa**, así que
desde `tests/` da 404. Y como ese chequeo *falla hacia no mostrar nada*, el mecanismo entero muere
**en silencio** — justo el que existe porque una pestaña con un archivo viejo ya costó medio día de
diagnóstico tres veces. Restaurado byte a byte desde HEAD; `sellar_version.py --check` en verde.
**Al mover archivos en lote, mirar cuáles están versionados**: un `mv *.json` no distingue un
fixture de un artefacto de despliegue.

**Cuatro mutaciones, las cuatro cazadas y cada una sólo por sus condiciones:** `eteClick` volviendo
a escribir la clave global, `eteSegSync` volviendo a consultarla (el diagnóstico imprime literal
«🔴 Hallazgos: A1: Flail», que es el síntoma), el espejo convertido en no-op —que es la regresión
que NO hay que introducir al sacar la clave— y la guarda `empty` revertida. En esta última, la
condición del **denominador** («los tres campos de configuración están fuera de su default») se
mantuvo verde: el caso probó lo que dice probar.

**Un caso que sólo verifica que el borrador vuelve puede arreglarse «ignorando todo».** TC-159
lleva el contrapeso: sobre un formulario YA EMPEZADO la restauración **no pisa** nada.

### Diagrama de Forrester: la línea que se dibuja ES el operador que clasifica — 2026-09-16

IC vs PCP con los cuatro cuadrantes, un punto por estudio, interactivo en el Laboratorio y como PNG
en la diapositiva de hemodinámica.

**LA DIVISORIA DEL PEDIDO ERA 18 mmHg Y LA APP CLASIFICA EN 15.** Con la línea en 18 y los colores
saliendo de `_labForrester`, **todo punto entre 15 y 18 saldría pintado de «húmedo» por debajo de
la línea de «seco»**: un diagrama que se contradice solo. Y el 15 no es una elección interna — la
cápsula del formulario **lo imprime**: «con congestión (PCP >15)». Se conservó el 15 (decisión de
Maicol) y se extrajo a **`UMBRAL_PCP_HUMEDO`**, que ahora gobierna los cuatro sitios: las dos ramas
de `calcHemo`, `_labICPCP` y la divisoria del diagrama — incluida **la cadena de la cápsula**, que
antes llevaba el número escrito adentro, que es la forma más segura de que el rótulo y el operador
se separen. Mismo valor: no es un cambio clínico. **Es la tercera escala invertida o corrida que
llega en un pedido sobre un dato que la app ya clasifica bien** (antes el SGL y el Forrester).

**`_labICPCP(inf)` devuelve los NÚMEROS; `_labForrester` quedó como una línea que lee su `perfil`.**
El diagrama necesita ubicar el punto, y aquella devolvía sólo la letra: con dos implementaciones el
punto podría caer en un cuadrante y el color decir otro. `ic` y `pcp` van en null **por separado**
—«no se pudo estimar el IC» y «no se pudo estimar la PCP» son cosas distintas— porque el que dibuja
necesita distinguirlas para **no poner un punto en el origen, que se leería como un paciente en
shock**. Un estudio al que le falte cualquiera de los dos no entra.

**UN PUNTO EXIGE OCHO CAMPOS:** `hemo_fc`, `diam_tsvi`, `itv_tsvi`, `talla`, `peso` para el IC, y
`onda_e`, `e_sep`, `e_lat` para la PCP de Nagueh. Es exigente, así que en una base real el diagrama
puede salir con pocos puntos o vacío — **por eso el estado vacío es lo más importante del diseño**:
sin estudios estimables se dibuja igual, con sus cuadrantes y el mensaje. Un contenedor en blanco
se lee como que el módulo se rompió.

#### La paleta se INYECTA, y es lo que hace que un solo generador sirva para las dos superficies

**Un `var(--x)` dentro de un SVG serializado no se resuelve: el PNG sale sin color.** El pedido
quería CSS variables (para el modo día/noche) **y** el mismo SVG exportado a PNG — las dos cosas no
conviven si el `var()` va adentro. `_labForrSVG(puntos, pal, opts)` recibe la paleta: en el
Laboratorio se pasan las variables **ya resueltas con `getComputedStyle`** —así respeta el tema— y
para la diapositiva `_FORR_PAL_PPT`, una paleta clara fija, porque el tema oscuro sobre una
diapositiva blanca daría un rectángulo negro en el medio de la hoja. **Un generador, sin lista
paralela.** Medido: el fondo pasa de `#181c27` a `#ffffff` al cambiar de tema, y el caso exige que
los dos valores **difieran** — si dieran lo mismo estaría comparando dos veces el mismo tema, que
es la trampa que ya costó TC-114.

**Sin `onclick` inline: `data-eid` + listener delegado registrado UNA vez.** Dos motivos, los mismos
del donut de la CIA: el atributo se compila **después** de decodificar entidades, así que ahí el
escape no protege; y `innerHTML` se reescribe en cada repintado, así que enganchar por círculo
acumularía un listener por cada pintada. El tooltip es un `<title>` nativo de SVG — sin JS.
Verificado con «O'Brien & \<b\>X\</b\>»: sale como entidad en el marcado y **cero elementos
inyectados**.

**El jitter es DETERMINISTA, derivado del índice.** Con `Math.random` el mismo estudio salta de
lugar en cada repintado y dos capturas del mismo período no se pueden comparar.

#### Lo que costó

**SEMGREP SUBIÓ A 124 Y HABÍA QUE MIRARLO.** El hallazgo nuevo era `ceibo-xss-innerhtml-concat`
sobre el `cont.innerHTML = '…' + _labForrSVG(…)` del render. **Triageado: falso positivo de la
misma clase que los 69 que el ruleset ya tiene** —lo que se interpola es SVG con el nombre ya
escapado adentro de `_labForrSVG`, y la regla es sintáctica—. Pero la regla de la casa es no sumar
warnings, así que se reescribió con la API del DOM y el SVG se asigna **solo, sin concatenar**: de
vuelta en 123 y sin nada que triagear. **Para aislar cuál era el nuevo, correr el scan sobre
`git show HEAD:index.html` y diffear (regla, texto)** — el reporte del ruleset es de julio y no
sirve como línea base.

**EL CDN EMPEZÓ A FALLAR SEGUIDO Y NO ERA LA RED.** `curl` daba 200 en 0,87 s y el caso decía «la
librería no llegó»; medido en el navegador, **PptxGenJS estaba a los 6 s**. Es una carrera: el
bundle son 477 KB, es el último de los seis scripts externos, y el archivo creció. Cerrado como ya
lo hacía TC-131 con SheetJS: **los seis casos que dependen de PptxGenJS esperan hasta 8 s** antes
de rendirse, y si igual no llega fallan con el motivo escrito. **Un rojo intermitente del entorno
es peor que no tener el caso: se deja de creerle al rojo.** Verificado con tres corridas completas
seguidas: 172/172 las tres.

**TC-156 se puso en rojo por pinar la palabra «ESTIMADA»** en una nota que reescribí a propósito.
Se reapuntó al HECHO —que la hoja declare que no reemplaza la medición invasiva y con qué corte
separa húmedo de seco—, que es la misma corrección que ya se les hizo a TC-123 y TC-132.

**Backtick dentro del cuerpo de un caso: van diecisiete**, y ésta fue en el comentario que escribí
para explicar la espera del CDN.

**Tres mutaciones, las tres cazadas:** rotar los cuadrantes, mover la divisoria a 18 dejando el
clasificador en 15, y dejar entrar un estudio sin IC con el punto en el origen.

### Las tres diapositivas que faltaban, y dos seams de los tres que el pedido pedía — 2026-09-16

Cierra el mazo: contractilidad, amiloidosis y hemodinámica pasaron de «tildás la tarjeta y se
declara la omisión» a producir su hoja.

**LA PREMISA «sus datos viven inline como innerHTML» ERA FALSA PARA CONTRACTILIDAD.**
`_labContrPoblacion(infs)` **ya era un seam** —devuelve `{N, sinTrast, conTrast, difusa, disqSep,
pctById}` con los diecisiete segmentos— y `_labContrRenderDash` ya sólo pintaba: el corte
evaluación/pintor estaba hecho. Escribir el `_labContrResumen` que pedía la tarea habría sido la
segunda copia que esta misma tanda persigue. **De los tres seams pedidos, los reales eran dos.**

**EL BULL'S EYE VA COMO PNG Y EL CAMINO YA ESTABA PROBADO.** `addImage` de PptxGenJS 3.12 no
acepta SVG, pero `_svgToPng` existe y el **PDF de auditoría ya incrusta ESTA MISMA diana** con él.
La diapositiva la reusa. Si la conversión falla —canvas bloqueado, imagen que no carga— cae a una
lista de los ocho segmentos con más compromiso **y lo dice en la hoja**: un cuadro en blanco se lee
como «no hubo trastornos», que es lo contrario de lo que pasó.

#### El mapeo de Forrester del pedido estaba rotado, y no se aplicó

| | La app (y la literatura) | El pedido |
|---|---|---|
| I | **seco-caliente** (normal) | húmedo-caliente |
| II | **húmedo-caliente** (congestión) | húmedo-frío |
| III | **seco-frío** (hipoperfusión) | seco-caliente |
| IV | **húmedo-frío** (las dos) | seco-frío |

Aplicarlo habría rotulado **«I» al paciente congestivo y «IV» al seco-frío**: dos conductas
cambiadas de lugar en una diapositiva que se proyecta, y contradiciendo a la cápsula del
formulario y al informe firmado, que ya publican el correcto. Es la tercera vez que un pedido trae
una escala invertida sobre un dato que la app ya clasifica bien —antes fueron el SGL y el signo
del strain—. **`_LAB_FORR_LBL` es ahora una constante compartida** entre el render y el mazo, así
que la etiqueta no puede divergir: es la misma cadena. La mutación que lo revierte pone en rojo
dos condiciones de TC-156.

**`_labAmilResumen` NO tiene una cuarta banda «confirmada».** El pedido la nombraba; el score ETT
tiene **tres** (`_LAB_AMIL_LBL`: probable ≥8 · intermedio 6-7 · baja <6), porque **confirmar
amiloidosis exige centellograma y proteínas monoclonales**, que son el ALGORITMO y no el puntaje.
Inventarla habría hecho que una diapositiva proyectara «confirmada» sobre un score
ecocardiográfico. La hoja lo declara al pie.

**El sparkling se cuenta sobre los EVALUADOS.** Su select arranca en «— no evaluado —», así que
contar el vacío como ausencia bajaría el porcentaje de presentes sin que nada lo delate. Es la
regla del trombo de orejuela, y la mutación que la revierte lo pone en rojo.

#### Lo que costó, y es lo mismo tres veces

**UN «BYTE POR BYTE IDÉNTICO» SOBRE UN ARCHIVO QUE NO SE TOCÓ NO PRUEBA NADA.** La primera pasada
de la extracción tenía un `assert` que falló a mitad del script de Python, así que **no se escribió
el archivo** — y la comparación posterior dio «idéntico» y parecía éxito. Lo delató contar las
referencias (`grep -c` dio 0) y el `git diff --stat`. **Después de una edición, confirmar que el
archivo CAMBIÓ antes de celebrar que la salida no cambió.** Es el error de denominador otra vez, en
su forma más pura.

**MI SONDA ESTABA MAL EN LAS DOS COSAS, Y ACUSÓ AL CÓDIGO.** Con la cohorte sembrada,
contractilidad daba `con=1, difusa=0, disquinesia=0` sobre tres estudios que debían contar:
- **el texto del informe vive DENTRO de `campos`** —`guardarInforme` barre `textarea[id]` y
  `informe_texto`/`en_suma` lo son—, que es de donde leen `_labContrPoblacion` **y**
  `_labHallazgosCuenta`. Ponerlo en el nivel superior del estudio deja las dos en cero;
- y **los ids de segmento son `basal_anterior` / `mid_anterior` / `apical_lateral`**, no
  `basal_ant`. Un id inventado no falla: calla, y la diana sale gris.

El Forrester daba todo «No clasificado» por una tercera: la PCP es la de **Nagueh**, así que sin
`onda_e` + `e_sep` + `e_lat` no hay perfil. **Las tres eran de la sonda.** Verificarlo costó menos
que el impulso de «arreglar» el seam.

**La condición de la torta no podía mirar el texto de la hoja.** Los rótulos de un `addChart` viven
en el CHART, no en los objetos de texto de la diapositiva: buscarlos en el `innerText` da vacío y
el caso acusa al generador. Se intercepta en la **frontera de la API**, que es lo que ya hacía
TC-150 — y de paso la condición quedó más fuerte: la torta tiene que llevar, **valor por valor**,
lo que devuelve `_labAmilResumen`. Que la diapositiva exista no prueba nada.

**TC-155 SE PUSO EN ROJO Y ESA ES LA SEÑAL.** Verificaba que amiloidosis y contractilidad se
declararan como omitidas «porque todavía no tienen hoja»; ahora la tienen. La condición se reapuntó
al otro disparador del mismo mecanismo —**falta de datos**— y quedó exigiendo que el motivo
**nombre el dato que falta**, no un genérico: sin eso el médico no sabe si corregir el filtro o
cargar el campo.

**Tres mutaciones, las tres cazadas:** la diapositiva que recalcula la distribución en vez de leer
el seam, el sparkling contado sobre todos, y el Forrester revertido al mapeo del pedido. Y el CDN
volvió a fallar dos veces —una en TC-156 y otra en TC-155— con el rojo del entorno y no del código.

### El mazo lo arman las CASILLAS, no el modal — 2026-09-16

Commit 3 de tres. `_labPPTGenerar` dejó de mirar `o.mods`/`o.anal` —el selector de seis categorías
del modal— y pasó a mirar las casillas «☐ PPT» de las 53 tarjetas. El modal quedó con presentador,
institución, fecha y paleta.

**`LAB_PPT_GRUPOS` ES UNA LISTA Y NO SE PUEDE DERIVAR.** «Esta tarjeta va en la diapositiva de
función ventricular» es una decisión editorial, no un hecho del DOM. Lo que sí se puede es impedir
que se pudra: **`_labPptAssertGrupos()`** exige que toda clave `data-ppt` pertenezca a
**exactamente un** grupo, y vigila las dos direcciones —una tarjeta sin grupo y un grupo que
nombre una tarjeta inexistente—. Las dos fallan MUDAS: la primera da una casilla que el médico
tilda y no produce nada, que es literalmente el «sólo 7 diapositivas» de la semana pasada.

**QUINCE GRUPOS PARA 53 TARJETAS.** Trece salen del pedido; las tres últimas —asociaciones,
tendencia y subgrupos— son las que Maicol decidió conservar del mazo anterior y que la agrupación
propuesta no mencionaba. Sin esa decisión se habrían perdido las asociaciones ya corregidas por
comparaciones múltiples, que es lo que más aporta en un ateneo.

**LO QUE TIENE CASILLA Y TODAVÍA NO TIENE HOJA SE DECLARA.** Contractilidad, amiloidosis y
hemodinámica se tildan y todavía no producen diapositiva —sus números siguen inline en el render
del Laboratorio—. En vez de callar, cada una emite su omisión con el motivo, en el toast y en la
hoja de metodología. Es la lección del «sólo 7 diapositivas» aplicada por adelantado: el médico
tildó la tarjeta y tiene derecho a saber por qué no salió.

**La compuerta de «ninguna tildada» va ANTES del modal**, junto a la del período vacío y por el
mismo motivo: un mazo de tres hojas fijas no es una presentación, y descubrirlo después de elegir
la paleta es peor. **El mensaje dice DÓNDE está el control**, porque el modal ya no lo tiene.

**La diapositiva de filtros sólo sale con cohorte activa, y lo que aporta es el N SIN filtrar.**
La portada ya declara el período y el N; sin filtros esta hoja diría «ninguno», que es una
diapositiva entera para no decir nada. Lo que la portada no puede dar es el contraste: «N = 12»
sin decir que se descartaron 83 publica un denominador que la sala lee como todo el laboratorio.
`_labPptNSinCohorte()` apaga `_LAB_COHORTE` y lo repone en un `finally` —el patrón `_pcCon` del
pericardio— y devuelve `null` si algo falla: un número de más sería peor que la ausencia.

**La diapositiva de ETE consume los cuatro seams del commit 2**, no recalcula nada. Es la razón
por la que ese commit existió.

#### Lo que costó

**CUATRO CASOS ANTERIORES SE PUSIERON EN ROJO, Y ESO ES LA SEÑAL, NO EL PROBLEMA.** TC-148, 150,
151 y 152 pasaban `mods`/`anal` al generador. Se reapuntaron con un helper del preludio,
`__t.pptSel(claves)`, que escribe las casillas — el mismo movimiento que ya se le hizo a TC-148
cuando el mazo se volvió modular y a TC-150/151 cuando cambió el punto de salida del `.pptx`.

**TC-150 PERDIÓ SU TEMA.** Se llamaba «14 diapositivas, selector de contenido…» y las dos mitades
dejaron de existir: el conteo exacto ahora depende de qué se tilde y el selector del modal ya no
está. Se le quitaron esas condiciones —las cubre TC-155— y quedó con lo que sigue siendo suyo:
gráficos nativos, semáforo de la FEVI y asociaciones leídas del Lab. **Se renombró.** Un caso cuyo
título nombra algo que ya no prueba se lee como cobertura que no existe.

**LA CONDICIÓN QUE SEPARA «las casillas mandan» DE «sale todo igual»** no es el conteo sino que con
sólo TAVI tildado **NO aparezca ninguna hoja de los otros grupos**. La mutación `G = () => true`
—el generador ignora las casillas— da un mazo de catorce perfectamente plausible; sólo esa
condición lo caza. **Dos mutaciones, las dos cazadas.**

**Y otra vez la trampa de la red:** la primera corrida de la segunda mutación dio rojo por «la
librería no llegó». Confirmar por qué condición cayó, no que cayó.

**Medí la compuerta de «ninguna tildada» sobre un store VACÍO y no probé nada:** salía por la
compuerta del período, que está antes. El caso siembra el store, pone el período en «todo el
tiempo» y limpia la cohorte antes de ejercerla. Es el denominador otra vez, por tercera vez en
esta tanda.

**Verificado con el mazo real:** sólo TAVI → **4 diapositivas** (portada · ETE · metodología ·
cierre); TAVI + Eisenmenger + FEVI → **7**; ninguna tildada → 3 fijas y el generador no se llama.

### Extraer un seam sin tocar el render: alias locales y comparación byte a byte — 2026-09-16

Commit 2 de tres. La subtab ETE calculaba TAVI, Wilkins, orejuela y TEER **inline** dentro de
`labEteRender` —405 líneas de cálculo y pintura entrelazados—, así que el PPT no tenía cómo leer
esos números sin escribir una segunda copia. Hoy hay cuatro seams de módulo: `_labTaviResumen`,
`_labWilkinsResumen`, `_labOaiResumen`, `_labTeerResumen`, más los predicados de pertenencia
(`_labUsaOai`, `_labUsaWilkins`, `_labUsaEteVM`, `_labUsaTeer`, `_LAB_TEER_CRIT`, `_labTeerAplica`).

**LA TÉCNICA QUE HIZO QUE ESTO FUERA SEGURO, Y QUE CONVIENE REPETIR.** Partir una función de 405
líneas con comentarios críticos cada dos es exactamente el cambio que este archivo documenta que
se comió dos bloques al repartir Congénitas. Dos recursos lo evitaron:

1. **Alias locales.** Los predicados se subieron a módulo con nombre nuevo y dentro de
   `labEteRender` quedó `const usaOai = _labUsaOai, TEER_CRIT = _LAB_TEER_CRIT, …`. El cuerpo de
   400 líneas **no cambió ni un carácter**, así que el diff es sólo el bloque que se movió.
2. **Destructuring con renombrado.** El cálculo se reemplazó por
   `const { gm, vm, ava, pro: op, rpv, nR, horas, nJet } = _labTaviResumen(taviArr);` — los
   nombres locales son los mismos, así que **las líneas de pintura tampoco cambiaron**.

**LA VERIFICACIÓN ES LA COMPARACIÓN BYTE A BYTE DEL `innerHTML`, Y ES LA QUE CAZÓ EL ERROR.** Se
sembró una cohorte ETE de 13 estudios con valores en bandas distintas, se capturó el `innerHTML`
de los **15 contenedores** ANTES de tocar nada, y se comparó después. La primera pasada dio
**tres contenedores del TEER VACÍOS**: `_labTeerResumen` había quedado usando `TEER_CRIT` y
`_teerAplica`, que son los **alias locales** de `labEteRender` y a nivel de módulo no existen.

Lo importante es **cómo se veía ese fallo**: `labEteRender` está envuelta en try/catch, así que no
hubo error visible; el bloque simplemente no pintaba, y un contenedor vacío se lee exactamente
igual que *«este período no tiene TEER»*. **El chequeo de sintaxis dio verde y los 168 casos
siguieron en verde.** Sin la comparación byte a byte se habría commiteado una subtab que perdió un
tercio de su contenido.

**Al subir un bloque a nivel de módulo, buscar qué nombres LOCALES usaba.** Es el mismo error que
`_sgl` en el commit anterior, por la puerta contraria: allá leí una variable de otra función, acá
me llevé el cuerpo y dejé las referencias.

**TC-154 prueba que el render CONSUME el seam, no sólo que el seam calcula bien.** Esa distinción
es todo el punto: si `labEteRender` siguiera calculando por su cuenta, el seam sería una **tercera**
copia y un caso que sólo verificara sus números pasaría en verde. Por eso cada bloque compara el
seam contra lo que quedó **pintado en la pantalla**. **Tres mutaciones, las tres cazadas**, y la
que lo demuestra es la que hace que el render de TAVI recalcule el gradiente por su cuenta: los
números del seam siguen bien y sólo cae la condición «el dashboard publica ESE gradiente».

**EL CASO PASABA CON `--solo` Y FALLABA EN EL SUITE, con los CINCO bloques vacíos.** No era la
extracción: un caso anterior deja el selector de período en otra ventana y la cohorte sembrada
—marzo de 2026— queda fuera. Otra vez «un contenedor vacío se lee igual que no hay datos». Hoy el
caso **fija su propio denominador** —período «todo el tiempo», cohorte limpia— y **comprueba que
quedó en 10 antes de mirar una sola cifra**. Sin esa condición, los cinco bloques midiendo sobre
cero habrían pasado como «no hay datos» en vez de como un caso que no probó nada.

**Backtick dentro del cuerpo de un caso: van dieciséis**, y ésta fue en el comentario que escribí
para explicar la forma de `_promPos`.

**Lo que ya estaba extraído y no hizo falta tocar** —verificado uno por uno, no supuesto—:
`_ccQpQs`, `_ccCoaGradMax`, `_ccMchGradMax`, `_ccMcaTF`, `_hcmRiskSCD`, `_ctrcdEstado`,
`_ctrcdGlsRel`, `_ctrcdFeviCaida`, `_labAmilBanda`, `_labValvCounts`, `_labHallazgosCuenta`,
`_labTapse`, `_labEsEte`, `_labUsaTavi`, `_labOaiTromboSi`, `_CC_SECS`, `_ccSecPred`. Diecisiete
de los que el plan daba por faltantes ya existían: **el pedido estimaba ~15 seams nuevos y los
reales eran cuatro más los predicados.** Medir antes de construir ahorró el 70 % del trabajo.

**Queda sin extraer la contractilidad de población** (`lab-contr-tabla` / `lab-contr-be`, que
`labRenderExtras` calcula inline). Es el único hueco que le queda al mazo agrupado, y está
declarado, no olvidado.

### La casilla «☐ PPT» de cada tarjeta, y el SGL que NO se gradúa — 2026-09-16

Commit 1 de tres. Las 55 tarjetas del Laboratorio ganan una casilla que decide qué entra al PPT
estadístico, y Mediciones gana una tarjeta de SGL. El generador agrupado va en el commit 3.

**EL PATRÓN VISUAL ES EL DE INFECTSMART Y LAS DOS SEMÁNTICAS ESTÁN INVERTIDAS.** Allá
(`infectsmart/index.html:3576`) el label es `.chk-inline` con `float:right` dentro de un `<h4>`, y
`statSecOn(k)` es `window._statSec[k] !== false`: arranca **marcada** y vive **en memoria**, así
que se pierde al recargar. Acá arranca **desmarcada** y se **persiste** — el mazo se arma una vez
y se repite en cada ateneo. El parecido invita a suponer lo contrario, por eso está declarado.
Y el `float:right` no se copió: este header es **flex**, donde el float no hace nada; va
`margin-left:auto`, igual que el `.asoc-info-btn` que ya vivía ahí.

**LA CLAVE VIVE EN `data-ppt` DE LA TARJETA.** No en una lista aparte, no derivada del rótulo y no
por posición. Derivarla del texto del header ataría una clave funcional a una cadena que se
renombra —este archivo ya documenta que el rótulo de una pestaña vive en cuatro superficies y se
pudre— y un renombre perdería la preferencia guardada **en silencio**; un índice posicional es lo
primero que se rompe cuando el Laboratorio gana una tarjeta. El atributo viaja PEGADO a la tarjeta,
así que no es una lista paralela: mover la tarjeta mueve su clave.

**Las DOS tarjetas de la subtab Informe llevan `data-ppt-no` con el motivo**: son los exportadores
—el del PDF y el de este mismo PPT—, no datos, y una casilla «incluir en el PPT» sobre el botón que
genera el PPT no significa nada. Es una excepción DECLARADA, y por eso `_labPptAssertClaves()` exige
**uno de los dos atributos en las 55**: una tarjeta nueva sin ninguno no da error, da una tarjeta
**muda** que jamás puede entrar al mazo y se ve igual que una bien declarada.

**LA CASILLA NO LLEVA `id`, Y NO ES ESTILO.** `guardarInforme` barre `input[id]` de TODO el
documento: con id se persistiría en `campos` de **cada** estudio como `<id>__chk`, viajaría al
Excel y la contaría `detectar_huerfanos`, indistinguible de un dato del paciente. Es la misma regla
que los paneles de referencia de Marfan/Fontan. Se identifica con `data-ppt-chk`.

**`onchange` y NUNCA `onclick`.** La regla táctil global matchea por el **atributo**
(`[onclick]{min-height:44px;min-width:44px}`) e inflaría la casilla a tres veces el alto de la fila.
Ya está escrito en este archivo y ya pasó una vez.

**El área táctil llega a 44×44 con márgenes negativos** (`margin:-11px 0 -11px auto`), que es el
mismo recurso que ya usaba `.asoc-info-btn` dos reglas más abajo. Medido: sin ellos el label daba
**39×14** y el header crecía 16 px en las 53 tarjetas; con ellos la casilla mide 44 y el header
sigue en 42. Verificado además que **no se superpone** con el botón ℹ️ de la tarjeta de
Asociaciones, que es la única que ya tenía un control en el header. `check_mobile.js` no reporta
ninguna de las 53.

**LA PREFERENCIA SE FILTRA CONTRA EL DOM AL LEERLA** (`_labPptChkMarcadas`), igual que
`_labExpLeerPref` contra el catálogo de módulos del Excel. Sin ese filtro, la clave de una tarjeta
que mañana se borre resucita y el generador la consulta con un `if` que ya no existe.

#### El SGL: promedio y distribución, SIN graduar

**EL PEDIDO TRAÍA BANDAS 18/15/10 Y NO SE APLICARON — decisión de Maicol.** Tres motivos, en orden:

1. **La app ya BORRÓ la graduación del SGL a propósito.** `calcSGL` lo dice con todas las letras:
   convivían TRES umbrales —20/16 en el badge y −18 en la referencia impresa— y el informe firmado
   salía «SGL (>=-18%): -18% - Zona gris», o sea la referencia diciendo que alcanza y la etiqueta
   pegada al lado diciendo que no. Hoy el único corte vivo es el **−16 %** del HFA-ICOS, que usan
   la calculadora de riesgo y cardio-oncología. Publicar 18/15/10 sería la **cuarta** escala del
   mismo dato, y en la superficie que más circula.
2. **Los cortes estaban invertidos.** «Normal (> -18 %)» leído literal es −10, que es el PEOR
   valor; «Severo (< -10 %)» es −20, que es normal. Es «un signo invertido en un umbral se lee
   igual de bien que el correcto», que este archivo ya documenta sobre esta misma magnitud.
3. **Y dejaban un hueco** entre −14 y −15: un |SGL| de 14,5 no caía en ninguna banda.

La tarjeta publica **|SGL| promedio, mediana, rango** y una distribución por **intervalos de dos
puntos porcentuales** derivados del mínimo y el máximo observados. Los rótulos no nombran
severidad, y la tarjeta **declara en pantalla** que no es una graduación y cuál es el único umbral
que la app sí aplica — porque siete barras de colores se leen como una escala si nadie dice que no
lo son, que es la misma razón por la que la diapositiva de PSAP lleva su salvedad.

**NO SE TOCÓ `VARS` NI `_labEstDescriptiva`, y es deliberado.** `LIBRE` ya tiene una entrada `gls`
que usa `_labGls` **sin `Math.abs`**, mientras `lab-gls-prom` sí lo aplica. Agregar `gls` a `VARS`
habría dejado dos definiciones del mismo dato —una con signo y otra sin— porque `LIBRE` pisa la
heredada. En su lugar hay un seam propio, `_labSglResumen`, **y el «GLS promedio» de Corazón
anatómico pasó a consumirlo**: con dos copias, dos tarjetas del mismo Laboratorio podían publicar
promedios distintos sobre la misma cohorte. Verificado en el navegador: las dos dicen 15,7 %.

**SIN BANDA DE PLAUSIBILIDAD, también deliberado.** `sgl` no tiene `min`/`max` en su input ni
entrada en `LAB_XLS_RANGO`; inventar una acá sería la divergencia de bandas que este archivo ya
pagó en seis campos. El filtro (`!== null && !== 0`) y el `Math.abs` se conservan **byte por byte**
del cálculo que ya hacía Corazón anatómico, para que ese número no cambie.

#### Lo que costó, y la regla que queda

**`const _sgl` en `labInit` y su uso en `labRenderExtras` son DOS FUNCIONES DISTINTAS.** El «GLS
promedio» se pinta en `labInit` y la distribución de geometría en `labRenderExtras`; puse la
variable en una y la leí en la otra, y salió `ReferenceError: _sgl is not defined`. **El chequeo de
sintaxis dio verde** —es error de ejecución— y **el suite de 167 casos siguió en verde**, porque
ninguno ejercitaba ese render. Lo cazó correr `labInit()` con una cohorte sembrada. Hoy el seam se
vuelve a pedir en cada función: recalcular no puede divergir porque es la MISMA función sobre la
MISMA cohorte, y eso es exactamente lo que el seam compra.

**LA PRIMERA CORRIDA DE UNA MUTACIÓN DIO ROJO EN TRES CONDICIONES QUE NO ERAN LA SUYA, Y LA SEGUNDA
EN UNA SOLA.** No era la mutación: era una **carrera**. La inyección cuelga de `DOMContentLoaded` y
con `--solo` el caso puede medir antes. Es la misma que costó el sello de versión. Cerrada llamando
`_labPptChkInyectar()` al principio del caso —idempotente, y de paso la ejercita—; verificado
corriéndolo tres veces seguidas. **Un rojo colateral que no se puede explicar no se da por bueno:
la mutación sólo vale si cae la condición que la vigila.**

**Los intervalos suman exactamente el `n`**, y hay una condición que lo fija. Sin ella, un valor
que cayera fuera de todos los bins haría que la distribución publique menos casos que el promedio
de arriba, en la misma tarjeta, sin que nada lo diga.

**Cuatro mutaciones, las cuatro cazadas y cada una sólo por su condición:** una tarjeta que pierde
`data-ppt`, el seam que deja de filtrar el cero, la distribución que vuelve a graduar
leve/moderado/severo, y la preferencia que deja de filtrarse contra el DOM.

**El inventario del pedido no coincidía con el Laboratorio, y la diferencia es grande.** El mensaje
enumeraba ~45 tarjetas; hay **54**. No existen como tarjeta «Resumen ejecutivo», «SGL», «ET
significativa» ni «EP/IP nivel y etiología»; **VEXUS tampoco** —vive dentro de «Función sistólica y
diastólica»—; FEVI y diastólica son **una sola** tarjeta, igual que Doppler tricuspídeo y función
diastólica del VD; y quedaban fuera trece que sí existen (Corazón anatómico, Indicaciones,
Antecedentes, Indicadores automáticos, Docencia, Análisis por médico, Estadística descriptiva, Uso
del módulo avanzado, las tres de Asociaciones, Qp/Qs, Bordes de la CIA, Ventana aortopulmonar).
**Derivar las casillas del DOM en vez de escribir la lista es lo que hace que eso no importe.**

### Un `#` en un color borró dos diapositivas enteras — 2026-09-16

**Reabre el «PowerPoint pide reparar» que la entrada de abajo daba por cerrado: era sólo LA MITAD.**
Podar los `Override` colgados del `[Content_Types].xml` era necesario y no suficiente. El segundo
defecto —independiente, y el que seguía disparando la advertencia— era un **color**.

**OOXML exige `ST_HexColorRGB`: seis dígitos hexadecimales y nada más.** Un `#` adelante no es un
carácter que PowerPoint ignore: invalida la parte entera. Y lo que hace al reparar no es descartar
el color, es **borrar la diapositiva completa**, con su texto y sus otros gráficos.

**POR ESO «LAS DIAPOSITIVAS 2 Y 5 SALEN VACÍAS» Y «SIGUE PIDIENDO REPARAR» ERAN EL MISMO BUG.** Se
reportaron como dos y se diagnosticaron como dos hasta abrir el archivo en PowerPoint: las dos
hojas en blanco eran lo que la reparación se había llevado. **Dos síntomas simultáneos en el mismo
artefacto son un solo defecto hasta que se demuestre lo contrario.**

**De dónde venía el `#`:** los seams `_labDiastDist`, `_labGeomDist`, `_labFeviDist` y
`_labPsapDist` guardan el color en formato **CSS**, porque los consume el dashboard y allá el `#`
es obligatorio. El comentario de la extracción decía —correctamente— que «las etiquetas y los
colores se conservan byte por byte para que el dashboard no cambie»: el defecto no fue conservar el
`#`, fue que el segundo consumidor necesitaba otro formato y nadie tradujo en el borde.

**Por qué caían DOS gráficos y no los diez.** PptxGenJS normaliza el color en la ruta de la
**torta** (`createColorElement` le saca el `#`) y **no** en la de las **barras**, que lo interpola
crudo en `<a:srgbClr val="…">`. Las dos únicas barras que reciben un seam con su color propio son
la diastólica del resumen (hoja 2) y la de la hoja 5. La de FEVI pasa `cols` explícito y la de PSAP
descarta el color: por eso las hojas 4 y 7 salían bien. **Un defecto que aparece en dos de diez
llamadas parece un caso raro y es una asimetría de la librería.**

**Cómo se encontró, y por qué ningún chequeo automático alcanzaba.** El XML estaba **bien formado**,
las **relaciones `r:id` resolvían todas**, el `[Content_Types].xml` no tenía ni una parte colgada, y
`docProps/app.xml` era consistente. Siete comprobaciones estructurales en verde sobre un archivo que
PowerPoint rompe. **La advertencia de reparación es de ESQUEMA, y un `xsd:sequence` o un
`ST_HexColorRGB` no los ve ningún parser genérico.** Lo que lo encontró fue **abrir el archivo en
PowerPoint** —está instalado en esta máquina— y, con el síntoma reproducido, barrer el paquete
entero buscando `srgbClr val=` que no fueran seis hex: **cuatro apariciones, todas en chart2 y
chart6, o sea exactamente las hojas 2 y 5**. El barrido tardó menos que cualquiera de las
verificaciones que habían dado verde.

**El arreglo va en el BORDE, no en los seams.** `_pptHex(c)` normaliza (saca el `#`, expande el de
tres dígitos, pasa a mayúsculas, devuelve `null` para lo que no es un color) y `_pptAddChart(s, …)`
es el **único** punto por el que el mazo llega a `addChart`: sanea la paleta de series, toda opción
`*Color` y el relleno del área. Es poda por EXISTENCIA y no una lista de cuáles pueden traer `#`,
así que cubre el color que alguien agregue mañana — que es exactamente cómo entró éste.

**Un color ilegible se REEMPLAZA por gris, no se descarta.** Filtrar la paleta correría las
categorías una posición y pintaría de **verde la FEVI severamente reducida**, que es el defecto
contra el que TC-150 ya tiene una condición. Un color equivocado es cosmético; una escala corrida
es una lectura clínica invertida en una sala.

**TC-152 lo fija, y su condición es GENÉRICA: cero `srgbClr` fuera de seis hexadecimales en TODO el
paquete**, leído del `.pptx` real. Buscar el `#` en los dos gráficos que fallaron pasaría en verde
el día que un seam nuevo entre por otra hoja. Prueba además que el defecto EXISTÍA —un mazo
vainilla con `chartColors:['#f05454']` en una barra escribe el inválido tal cual—, que el seam
**sigue** devolviendo el color con `#` para el dashboard, y que las hojas 2 y 5 conservan su
`graphicFrame`. **Tres mutaciones, las tres cazadas**: quitar el saneo de la paleta, descartar en
vez de reemplazar, y hacer que `gBarras` vuelva a `addChart` directo.

**Y otra vez la trampa de la red:** la primera corrida de la mutación M1 dio rojo por «falta
PptxGenJS» —el CDN no llegó— y no por la mutación. **Al mutar sobre casos que dependen de red,
confirmar por qué condición cayó**, no que cayó.

**Verificado en PowerPoint, que es el único oráculo que decide esto:** el archivo anterior abría con
«PowerPoint encontró un problema con el contenido», reparaba, avisaba «no pudo leer algún contenido
y tuvo que quitarlo», y dejaba **2 y 5 en blanco** con 3, 4 y 6 intactas. El corregido abre **sin
advertencia**, con las 14 diapositivas y el semáforo de la diastólica en su orden (Grado II ámbar,
Grado III rojo).

### Los dos bugs del .pptx: uno era de la librería y el otro era un silencio
> **⚠ ESTA ENTRADA DA POR CERRADO EL «PowerPoint pide reparar» Y ERA SÓLO LA MITAD.** La poda de
> `Override` que describe es correcta y necesaria, y **no alcanzaba**: el archivo seguía pidiendo
> reparación por un `#` en un color de gráfico. Ver la entrada de arriba, que es la que cierra el
> defecto. Lo de acá abajo sigue siendo válido para lo que describe — el `[Content_Types].xml` y
> el silencio de las omisiones.

Reportados el 2026-09-16 desde el archivo REAL, que es lo que los hizo visibles: los dos pasaban
el suite entero.

**«PowerPoint pide reparar» ES UN BUG DE PptxGenJS 3.12.0, NO DE LA APP.** Escribe en
`[Content_Types].xml` un `<Override>` de **slideMaster por diapositiva** y embarca **uno solo**:
PowerPoint busca las partes declaradas, no las encuentra, y abre con la advertencia. Medido sobre
un mazo **vainilla** de la propia librería —sin una línea de esta app—: 1 diapositiva declara 1
(correcto), 3 declaran 3, 5 declaran 5, con **1 master real siempre**. El mazo del Laboratorio
llegaba con **13 overrides colgados**.

**Cómo se diagnostica un .pptx: se descomprime.** El XML estaba **bien formado** y todas las
relaciones `r:id` resolvían — por ahí no era. La advertencia de reparación es de **esquema y de
paquete**, no de sintaxis, así que hay que mirar `[Content_Types].xml` y cruzar cada `PartName`
contra las entradas reales del zip. Para obtener el archivo sin descargarlo:
`await P.write({outputType:'base64'})` desde el navegador y volcarlo a disco.

**El arreglo poda por EXISTENCIA, no por lista de excepciones.** `_pptxDescargarSaneado(P, nombre)`
usa el **JSZip que el propio bundle expone en `window`**, borra todo `Override` cuya parte no esté
en el zip y descarga por ancla + objectURL. Así cubre cualquier otra parte fantasma que la
librería invente mañana. **Falla abierto**: sin JSZip descarga por la vía normal y lo declara —un
archivo con advertencia es mejor que ningún archivo—. Y el `revokeObjectURL` va **diferido**:
revocar en el mismo tick cancela la descarga en Safari.

**AFECTABA A LOS DOS EXPORTADORES.** El PPT del estudio individual arrastraba el mismo defecto
desde que tiene más de una diapositiva; se descubrió diagnosticando el del Laboratorio y se
arregló en el mismo commit. Buscar el resto de los llamadores es parte del arreglo.

**«Sólo 7 diapositivas» NO era un bug de lógica: era un SILENCIO.** Reproducido variando el N:
con **1 o 2 estudios salen 7** y con 3 o más salen 10. Se caen a la vez TODAS las compuertas de
datos —FEVI, diastólica, PSAP, subgrupos, oncología— y quedan las cinco fijas más las dos
opcionales que no tienen compuerta (valvulopatías y asociaciones). El selector **funcionaba**: la
prueba es que esas dos, que dependen sólo del modal, sí salían.

El defecto real es que el médico tildaba diez casillas, recibía siete hojas y **no tenía forma de
saber** si faltaba un dato, si el filtro estaba mal o si la app se había roto. Hoy cada omisión se
declara con su motivo y su número —«Función sistólica: 2 estudio(s) con FEVI medida, se necesitan
al menos 3»— en el toast **y en la hoja de metodología**, que es la que sobrevive al ateneo.
El conteo final depende de qué datos existen, y eso es correcto; lo que no podía ser es que no se
dijera.

**Tres trampas de los casos de prueba en este arreglo:**
- **Cambiar el borde de salida rompe la interceptación.** TC-148 y TC-150 capturaban por
  `PptxGenJS.prototype.writeFile`; desde que el mazo sale por `_pptxDescargarSaneado`, ese punto
  dejó de ejecutarse y los dos casos se quedaron sin capturar nada. **Al mover el punto de salida
  de un artefacto, buscar quién lo estaba interceptando.**
- **PptxGenJS guarda el texto como ARRAY DE RUNS**, no siempre como cadena. Leyendo sólo el caso
  `typeof === 'string'`, la hoja de metodología quedaba invisible para el caso.
- **Una mutación sobrevivió por una frase compartida.** «El motivo pierde el número de estudios»
  pasaba en verde porque yo buscaba «se necesitan al menos», y esa frase también la escriben las
  omisiones de tendencia y subgrupos, que **no** pasan por `faltanN`. La condición tiene que ser
  específica del emisor que se está probando.

**El caso prueba primero que el defecto EXISTÍA.** TC-151 genera un mazo vainilla de la librería y
exige que declare partes inexistentes, antes de verificar que el helper las quita. Sin esa mitad,
el caso no distingue «lo arreglé» de «nunca estuvo roto».

### PPT del Laboratorio rediseñado: gráficos NATIVOS y selector de contenido
2026-09-16. De 9 diapositivas con barras dibujadas a mano a **14 modulares** con `addChart`.
Verificado que el bundle 3.12.0 trae `addChart` y los tipos `bar · pie · line · doughnut ·
scatter · radar · area · bubble`; la app **nunca lo había usado** (cero llamadas).

**GREPEAR DECLARACIONES NO ENCUENTRA LO QUE SE EXPORTA DESDE UN IIFE.** Mi primer diagnóstico
dijo que `_labAsocParaPDF` y `_labEstDescriptiva` **no existían** — CLAUDE.md afirmaba lo
contrario y tenía razón: se asignan a `window` desde dentro del IIFE de estadística, así que
`function X`/`const X` no matchea. **La lista de lo alcanzable se saca del navegador**, con
`typeof` sobre el scope global, no del archivo. Y confirmó lo contrario para los estadísticos:
`spearman`, `chi2p`, `_bh`, `interpTxt` y `sigLight` **no** son alcanzables — recalcular una
asociación desde el PPT no es una tentación, es imposible.

**Los seams que consume el mazo, todos ya existentes:** `_labEstDescriptiva` (once medidas con
su n, media, rango y percentiles), `_labAsocParaPDF` (asociaciones YA corregidas por
comparaciones múltiples), `_labMeses`, `_labFeviDist`, `_labPsapDist`, `_labGeomDist`,
`_labDiastDist`, `_labValvCounts`, `_labHallazgosCuenta`, `_labFreqEntries`, `_labSexos`.

**Sólo se publican las asociaciones que el Lab marca como establecidas** (`ok`, o sea después de
la corrección), y si no hay ninguna **la diapositiva se genera igual y lo declara** con cuántas
se probaron (decisión de Maicol). Publicar la de mayor coeficiente sin ese filtro proyectaría
«fuerte» sobre lo que el propio Lab considera ruido — es la regla de `_asocEstablecida`.

**LA MUTACIÓN QUE EL PEDIDO EXIGÍA SOBREVIVIÓ A LA PRIMERA VERSIÓN DEL CASO.** «El PPT recalcula
las asociaciones» pasaba en verde, porque mis condiciones verificaban que la diapositiva
existiera y llevara las salvedades — y un generador que recalcula **las escribe igual**. Lo que
distingue leer de recalcular es comparar **los datos**: cuántas asociaciones se muestran contra
cuántas marca el Lab, y que cada tamaño de efecto y cada rótulo de fuerza sean los suyos. Misma
técnica para la tendencia: la serie tiene que coincidir **valor por valor** con `_labMeses`.

**Instrumentar por la FRONTERA DE LA API, no por los internos.** Leer los objetos de la
diapositiva no sirve: los datos del gráfico no quedan ahí sino en el registro de la presentación,
y las opciones viven en `options` y no en `opts`. Envolviendo `addSlide` para envolver el
`addChart` de la slide se captura exactamente lo que la app pasa — tipo, series y opciones. Ojo:
**PptxGenJS normaliza `labels` a array ANIDADO** (soporta categorías multinivel), así que
`labels[0]` es `['Fuerte']` y no `'Fuerte'`.

**Dos escalas incompatibles en un gráfico agrupado.** La comparación de subgrupos pedía PSAP
(~40 mmHg), E/e' (~10) y una distribución (%) en uno solo: el E/e' quedaría como una raya y el
porcentaje no comparte eje con ninguno. Van **dos** gráficos, medias y distribución.

**Un gráfico de ceros NO es un gráfico vacío: es peor.** `gBarras`/`gTorta` devuelven `false`
sin dibujar cuando ninguna categoría tiene valor, y el llamador pone el cartel en el `else` —
nunca los dos, que es el defecto de superposición que ya se pagó en la versión anterior.

**TC-148 FIJABA LAS DIAPOSITIVAS POR ÍNDICE Y SE ROMPIÓ.** Usaba `txtDe(4)`/`txtDe(8)` sobre un
mazo de nueve fijas; al volverse modular esos índices pasaron a otra hoja y el caso acusaba al
generador de haber perdido el cierre. Pasó a buscar **por título**. Y dos de sus condiciones
quedaron obsoletas *a propósito*: la distribución diastólica ahora es un gráfico y su rótulo ya
no está en el `innerText` —se verifica sobre `_labDiastDist`, que es el invariante real y no
depende de la presentación—, y «PSAP promedio de los elevados» la sacó la especificación nueva.
**Un índice posicional es lo primero que se rompe cuando el mazo gana una hoja.**

**Backticks dentro del cuerpo de un caso: van catorce**, y la decimocuarta fue en el comentario
que escribí para explicar la decimotercera.

**El caso depende de RED** (PptxGenJS por CDN) y falla **con el motivo escrito**, nunca se saltea:
en una corrida de mutación el CDN no llegó y el resultado rojo era del entorno, no de la mutación.
Al mutar sobre casos que dependen de red, **confirmar por qué condición cayó**.

### El manual: de 20 pestañas y 32 páginas a 8 y 14 — y el marcado es un contrato
Reescrito el 2026-09-16. **El PDF del manual ya existía** (`generarManualPDF` → `_manualPDFArmar`)
y **deriva de `ECO_AYUDA`** vía `_manualAplanar()`: reescribir el manual reescribió el PDF solo.
Antes de «agregar» el PDF que pedía la tarea, conviene mirar — ya estaba, y con fuente única.

**La medida que vale es el CONTEO DE PÁGINAS DEL PDF REAL, no el tamaño del HTML.** Medido
envolviendo el **constructor** de jsPDF, porque `save()` es propiedad de la instancia: **32
páginas antes, 14 después**. El HTML bajó de 102,8 a 36,6 KB, pero ese número no era el criterio.

**EL MARCADO ES UN CONTRATO CON EL APLANADOR.** `_manualAplanar()` reconoce por NOMBRE DE CLASE:
`mBox mAviso` → «ATENCION:», `mBox mTip` → «CONSEJO:», `mBox mCaso` → «EJEMPLO:», `mSub` abre
sección, y `mP`/`mUl`/`mOl`/`mTbl`/`mKbd`. Una clase nueva **no rompe nada en pantalla**: rompe el
PDF, en silencio, y sólo se ve descargándolo y leyéndolo entero. TC-149 lo fija enumerando las
clases usadas y exigiendo que todas estén en la lista conocida.

**DOS «DEFECTOS» QUE REPORTÉ Y NO EXISTÍAN.** Vale escribirlos porque el error fue de método:
- **«Las filas de las tablas se pegan con una coma».** La coma era de **mi propia sonda**:
  `_manualAplanar` devuelve un **array de bloques** (`.split('\n\n').map().filter()`) y yo lo
  concatené a una cadena, que es una conversión implícita con separador coma. Las filas ya se
  separaban bien — hay una regla `</tr>` → `\n\n` **antes** de la de celdas.
- **«Las entidades HTML salen literales en el PDF».** Cierto en abstracto, falso en concreto: el
  manual sólo usa `&lt;` y `&gt;`, y las dos ya estaban cubiertas. Escribí un decodificador de
  dieciocho entidades **y lo revertí**, porque nada lo ejercitaba — la convención del manual es
  escribir los símbolos LITERALES (`≥`, `≤`, `—`) y `_pdfSafe` los translitera. Un resguardo que
  no se puede hacer fallar se lee como protección y no lo es; es la misma razón por la que se
  borró el «deshacer» de `calcET`. **El aplanador quedó byte por byte como estaba.**

**TRES ADVERTENCIAS DEL MANUAL HABÍAN QUEDADO FALSAS**, y las tres describían el estado anterior a
esta semana: que Fallot «no tiene campos de volumen, y es deliberado» (los tiene desde el 15/9),
que la válvula pulmonar «no tiene columna propia» (tiene seis desde el rediseño) y que el Excel
«se lleva 94 columnas» (son **429**, 129 básicas). **Al inventariar las 44 advertencias antes de
reescribir aparecieron solas**; leyendo el manual de corrido no se habrían notado, porque las tres
están redactadas con la misma seguridad que las que sí son ciertas.

**TC-123 PINABA UNA ORACIÓN LITERAL Y HUBO QUE CAMBIARLO.** Exigía la frase exacta
`CC complejas</b>, primera de sus secciones`, que era la redacción de un manual concreto: bloqueaba
cualquier reescritura legítima sin que el dato hubiera dejado de ser cierto. Pasó a verificar el
**hecho** —CIA/CIV se describe bajo el encabezado de CC complejas y NO bajo el de CC frecuentes,
por posición en el texto—. **Verificado por mutación**: mover ese `<li>` a la otra lista lo pone en
rojo. Es la misma corrección que ya se le hizo a TC-132: *la condición correcta no es «aparece este
texto» sino el invariante que ese texto representa*.

**La octava pestaña —«Referencia clínica»— es lo que MÁS comprimió.** Siete tablas con todos los
cortes, su guía y su año. Hasta ahora esos números estaban repetidos en cinco pestañas distintas;
ahora están una sola vez, y eso es a la vez menos texto y menos superficies donde un umbral puede
quedar viejo. Decisión de Maicol; se eliminó «Preguntas frecuentes» y sus respuestas útiles se
absorbieron donde corresponden.

**Qué se conservó, explícitamente:** los umbrales con su guía y su año, las advertencias que
cambian una conducta (HTP no se gradúa por PSAP, ET binaria, VEXUS por el vaso peor y sus
confusores, TdF por resonancia, Marfan por síndrome, Fontan tres estados, FA → BSE 2024, caída de
FEVI en puntos porcentuales), las instrucciones de flujo no obvias (backup JSON como única copia,
modo avanzado que no borra, imágenes apagadas de fábrica, el Excel no es backup) y los disclaimers.
Se eliminaron los consejos que repetían lo que el campo ya dice y **los párrafos que explicaban
decisiones de diseño**, que son documentación interna y no manual de usuario.

**Sin probar en Safari**: el navegador está concedido en modo sólo lectura. Verificado en Chrome
que las 8 pestañas dibujan su botón, que las 8 tienen contenido distinto y no vacío, que las 7
tablas de la referencia se construyen y que los recuadros de advertencia se renderizan.

### PPT estadístico del Laboratorio — y el defecto que destapó la extracción
Agregado el 2026-09-16 en la subtab Informe. Mazo de **9 diapositivas** con la casuística del
período. Es INDEPENDIENTE del PPT del estudio individual —aquél cuenta un paciente, éste una
serie— y comparte con él exactamente tres cosas: las seis paletas de `PPT_TEMAS`, el saneador
`_pptTxt` y el resolutor de logo. Nada más.

**LA DIASTÓLICA DEL DASHBOARD ESTABA MAL, y lo destapó ir a buscar de dónde sacar el dato.**
`_labDiastGrado` usa `_labMenciona` (con guarda de negación) y su comentario dice ser «la misma
heurística que la distribución». **No lo era**: la distribución de `labInit` estaba escrita
aparte con `.test()` CRUDO. Medido sobre una cohorte de 4 donde dos NIEGAN el patrón restrictivo:

| | III | II | sin | total |
|---|---|---|---|---|
| **antes** (`.test()` crudo) | **3** | 1 | 0 | 4 |
| **ahora** (`_labMenciona`) | **1** | 1 | 1 | 3 |

Un sobreconteo de **3×** en el grado más severo, con el sesgo sistemático de siempre: un
laboratorio que informa bien nombra lo que descartó, así que se infla justo lo que más se menciona
para negarlo. Es la misma clase que ya se cerró para hallazgos, geometría y el módulo de
asociaciones — **esta copia quedó afuera y nadie la vio porque el comentario afirmaba lo
contrario**. Los conteos del panel BAJAN. Es un cambio de comportamiento, no un refactor.

**SIETE SEAMS extraídos, y la razón no es estética.** `_labFeviDist`, `_labPsapDist`,
`_labGeomDist`, `_labDiastDist`, `_labSexos`, `_labFreqEntries` y `_labMeses` estaban inline en
`labInit`/`labRenderExtras`. Un PPT que recalculara esas bandas publicaría, **en un archivo que se
proyecta y circula sin la app al lado**, números distintos de los de la pantalla sobre la misma
cohorte. Las etiquetas y los colores se conservaron byte por byte para que el dashboard no cambie.
Los que ya eran de módulo —`_labValvCounts`, `_labHallazgosCuenta`, `_labFevi`, `_labPsap`,
`_labTapse`— se usan tal cual.

**RANGOS de PSAP, NO grados de HTP** (decisión de Maicol). El pedido pedía «distribución
leve/moderada/severa» y eso es exactamente el defecto que el panel de estadística ya cerró: el
comentario de `_labPsapDist` lo dice — rotular esas bandas así es enseñar desde la estadística la
clasificación que el informe se niega a hacer. Vale DOBLE en el PPT, que es la superficie que más
circula de las tres. La diapositiva **lo declara en pantalla**, porque cuatro bandas de color al
lado de un número se leen como una graduación si nadie dice que no lo son.

**La diapositiva 8 del pedido no era una diapositiva.** Su contenido son los tres campos del
modal, que el propio pedido describe dos bloques más abajo. Se reemplazó por **actividad por mes**
(decisión de Maicol), que sale de `_labMeses` y no exige nada nuevo.

**La compuerta del período vacío va ANTES del modal.** Pedirle presentador, institución, fecha y
paleta para después avisarle que no hay estudios es hacerle llenar un formulario para nada.

**LA COHORTE SE DECLARA EN LA PORTADA**, no en una nota al pie, y el nombre del archivo lleva
`_cohorte_filtrada`. Un mazo que proyecta «N = 12» sin decir que hay filtros activos publica un
denominador que la sala lee como «todo el laboratorio en el período». Es la regla que ya cumplen
el PDF de auditoría y el Excel.

**`_pptLogoDato()` es una FUNCIÓN, no una constante de módulo.** Era un IIFE local de
`_pptDesdeFormulario`; al subirlo, como `const` se evaluaría una sola vez al cargar la página y el
logo quedaría congelado hasta recargar. Conserva el fail-closed: si el validador no está, se
descarta el logo — la forma `typeof X === 'function' && !X(d)` se saltea la validación cuando X no
existe y manda el dato crudo a `addImage`.

**Dos defectos de mi propio primer borrador, los dos encontrados LEYENDO las diapositivas
generadas, no el código:**
- **El cartel de «sin datos» se dibujaba ADEMÁS de las barras en cero**, superpuestos. En HTML el
  navegador reflowea y se nota; en una diapositiva las dos cosas se dibujan una sobre la otra. El
  mensaje va en el `else`, no después.
- **La actividad por mes decía «2 (100 %)»**. Ahí el riel es el mes de MÁS actividad, así que ese
  100 % se lee como «el 100 % de los estudios fueron en abril». Hoy esa barra muestra sólo el
  conteo (`sinPct`) y el pie explica contra qué es relativa.

**`_pptFechaLarga` no usa `new Date(str)`.** Ese constructor interpreta `yyyy-mm-dd` como UTC y en
Uruguay (UTC−3) devuelve **el día anterior**: la fecha del ateneo saldría corrida un día en la
diapositiva de cierre. Se parte la cadena a mano.

**Cómo se verifica un PPT: interceptando `writeFile`.** Es la técnica que este archivo ya usa para
`jsPDF.save`. Sin eso lo único verificable es que la función no lanza, que es lo que no importa.
TC-148 lee las 9 diapositivas reales, cuenta la tabla de valvulopatías y compara el fondo contra
la paleta elegida. **Cinco mutaciones, las cinco cazadas**, entre ellas la que rotula las bandas de
PSAP como Leve/Moderada/Severa y la que revierte la diastólica al `.test()` crudo.

**Dos trampas del propio caso:**
- **Backticks dentro del cuerpo, duodécima y decimotercera vez** — y la segunda fue en el
  comentario que escribí para *arreglar* la primera. `node --check` las caza, apuntando a la línea
  del `caso(`, decenas de líneas antes del culpable.
- **El nombre del archivo hay que guardarlo ANTES** de resetear la captura para probar la
  compuerta del período vacío. Leído después daba cadena vacía y la condición acusaba al código.

**Verificado que no se usa nada posterior a Safari 15.4** en las 388 líneas nuevas: sin
optional chaining, sin `??`, sin `.at()`, sin `Object.hasOwn`, sin lookbehind. **La descarga en
Safari NO se probó**: el navegador está concedido en modo sólo lectura, así que no se puede
disparar el botón desde acá.

### El Laboratorio ya muestra las siete secciones nuevas — y cómo se hizo sin replicar reglas
> Esta entrada REEMPLAZA a «Lo que el Laboratorio todavía NO muestra», que describía el estado
> anterior al 2026-09-16. Hoy `labCCRender` tiene **17 bloques** y Mediciones dos secciones más.

**La fuente inyectable es lo que hizo posible no replicar nada.** `marfanEstado`, `eisenEstado`,
`fontanEstado`, `dopTricEstado` y `dtDiastEstado` aceptan ahora un `src` opcional: sin argumento
leen el FORMULARIO como siempre, y con el objeto `campos` de un estudio guardado leen de ahí. Es
el patrón `_pcSrc`/`_pcCon` del pericardio sin el estado global. Los trece bloques viejos leen
`campos` crudo y **replican** las cascadas —el de MCH lo dice en su propio comentario—, que es lo
que costó once defectos; los cuatro nuevos llaman a la función.

**La equivalencia se verificó en las dos rutas antes de construir nada encima**, y hay que
hacerlo así: poblar el formulario, leer por la ruta de siempre, leer lo mismo por la inyectada y
exigir JSON idéntico. **Tres veces seguidas la diferencia fue mi sonda, no el código**, y las
tres enseñan lo mismo —*el token sale del `<option value>` real*—:
- `loeys` no existe; el valor es **`lds`**. Con el inválido el `<select>` queda sin selección y
  la ruta del formulario devuelve vacío, así que el «DIFIEREN» acusaba al código.
- Las clases funcionales se guardan en **minúscula** (`i`/`ii`/`iii`/`iv`), y el tipo de Fontan
  es **`extra`**, no `tcpe_extra`.
- Los checkbox viven en `campos` como **`<id>__chk`**. Pasar `fontan_comp_epp` sin el sufijo hace
  que la ruta inyectada no vea la complicación — y de ahí cuelga `embarazo`, que pasa a `null`.

**`_lblDe` NO sirve para preguntar si una clave existe: devuelve la cadena `'Otro'`.** Es para
ROTULAR. Lo usé como guarda (`if (!u)`) y la guarda **nunca habría disparado**, porque `'Otro'` es
truthy y `'Otro'.i` es `undefined`; y puesto sobre `MARFAN_SIND_TXT[sind] || 'Aortopatía'` cambiaba
el texto del **informe firmado** de «Aortopatía» a «Otro» en el caso común de una aorta medida sin
síndrome. Para preguntar está `_tieneClave(mapa, k)`, que se agregó **en el bloque 19** y no se
tomó prestado del 42: una dependencia cruzada entre bloques sin respaldo se vuelve
`ReferenceError` el día que el bloque grande deja de parsear, y este archivo ya se quedó sin
JavaScript dos veces por eso.

**`UMBRAL[sind]` lanzaba, y la parameterización lo volvió alcanzable.** Desde el formulario el
`select` sólo puede tener sus cinco opciones; desde `campos` el valor es arbitrario —Excel, backup
JSON, store—. Y el llamador es el Laboratorio, que **itera N estudios**: uno con un token raro se
llevaba la subtab entera. Hoy hay rama `sindrome_no_reconocido`, y **no se supone un umbral del
medio**: es la misma razón por la que `!sind` no concluye. Verificado con `constructor`,
`__proto__`, `toString` y un token inventado.

**LA NOVENA CLAVE SE PERDÍA EN SILENCIO.** `marfanEstado` devuelve nueve, y mi mapa tenía ocho:
faltaba **`umbral_iia_sin_fr`** («por encima del umbral en que los factores de riesgo pasan a
indicar cirugía; falta consignar si los hay»). `_labDistribDe` descarta lo que no esté en la
allowlist, así que **cuatro estudios se contaban como tres** y el porcentaje se repartía entre los
otros. Peor: yo calculaba «no concluibles» **por resta** (`conCx − criterios − sin_indicacion`),
así que la clave sin mapear se atribuía a una categoría clínica que no le correspondía. Hoy se
cuenta por **conjuntos explícitos** y existe la fila «Con indicación clasificada», cuyo invariante
—**N de N**— es lo único que pone en rojo una décima clave que nadie mapeó. **Al distribuir sobre
las claves de una cascada, contar cuántas quedaron sin etiqueta.**

**LOS PROMEDIOS SALEN DEL OBJETO QUE DEVUELVE LA CASCADA, no de `promDe(arr, campo, lo, hi)`.**
Verificado campo por campo: ninguno de estos tiene banda en `LAB_XLS_RANGO` **ni** `min`/`max` en
su input — la plausibilidad vive **dentro** de la función (saturación 40-100, FEVI 10-85). Escribir
los cortes en el Laboratorio sería la divergencia de bandas que este archivo ya pagó en seis
campos. Efecto medido: una saturación de `9` (tipeada por 90) **no entra** al promedio, y el
denominador de «< 90 %» son las saturaciones válidas y no todos los estudios.

**`_CC_SECS` pasó de 12 a 19 claves, y eso TOCA OTRA PANTALLA.** Es la fuente única: el panel de
Filtros genera sus casillas con `_CC_SECS.map`, así que **el filtro de cohorte gana siete casillas
nuevas**. Es deseable —hasta hoy no se podía filtrar por estas secciones— pero es un cambio de una
pantalla que nadie pidió tocar, y por eso está declarado. Escribir los predicados sueltos en
`labCCRender` habría sido la lista paralela de siempre. Los nueve `select` implicados se
verificaron uno por uno: **los nueve tienen opción 0 vacía**, así que ningún predicado matchea un
estudio en blanco — sin esa verificación el bloque habría dicho que todo el laboratorio tiene
Fontan, que es el defecto de `fop_acv` y el de `pericardio`.

**«No especificada» no cuenta como etiología.** Es la opción 0 de `ep_etiologia`/`ip_etiologia`
**y** el valor al que migran los estudios viejos: contarla es leer un default como hallazgo. Se
informa aparte. En cambio en VM/VA/VT **un mismo campo guarda morfología y etiología**
—«Calcificada» y «Endocarditis» conviven en el desplegable— así que el rótulo dice las dos cosas
en vez de prometer sólo etiologías.

**`setHtml`/`stat`/`empty` ya estaban declarados CUATRO veces**, uno por función de render del
Laboratorio. Unificarlos es refactorizar cuatro funciones y no pertenecía a este cambio: se
subieron a nivel de módulo **sólo** `_labDistrib`, `_labDistribDe`, `_labBarrasDe`, `_labCuenta` y
`_labEstado`, que tenían **una sola copia**. El que obliga es `_labDistrib`, por su guarda de
prototipo nulo; `_labBarrasDe` recibe el `empty` del llamador para no crear una quinta copia.

**Un estudio no puede tumbar una tarjeta: `_labEstado(fn, inf, contador)`.** Y el caso de prueba
**no** usa un estudio-bomba: un getter que lanza **no puede venir de `JSON.parse`**, así que
probarlo con eso sería probar el mecanismo y no la alcanzabilidad — la regla de «si el valor lo
pusiste vos, no probaste nada». Se prueba el seam directamente: devuelve `null`, cuenta el fallo y
no propaga.

**Colisión de substring, tercera vez en la sesión: `'Clase I'` está dentro de `'Clase IIa'`.** La
condición pasaba con la rama equivocada. Se busca el texto que **sólo** produce esa rama.

**`_labCampoRaw` puede lanzar y nadie lo envuelve — PREEXISTENTE, no tocado.** Hace
`String(v).trim()` sobre `inf.campos[id]`, y `JSON.parse('{"x":{"toString":null}}')` produce
exactamente el valor que hace lanzar a `String()`. Lo atraviesan **los diecinueve predicados** de
`_CC_SECS` y casi todo el Laboratorio. Es la misma clase que `_sanearIds` ya cerró con `_str()`.
Queda declarado; cerrarlo es un cambio de radio mayor que esta tarea.

**TC-147** lo fija con 23 condiciones y **cinco mutaciones verificadas**, entre ellas la que pidió
el pedido: el bloque Marfan reimplementando el diagnóstico con un umbral cableado en 50 **se pone
en rojo** — porque un Loeys-Dietz de 47 mm tiene Clase I y un Marfan de 47 mm no. Ninguna condición
que sólo cuente estudios lo detecta.

### Soporte y contacto: cuatro `mailto:` y una decisión de privacidad
Agregada al final de Config el 2026-09-16. Sin servidor, sin formulario y sin dependencias: el
cliente de correo del dispositivo hace todo, así que anda igual en escritorio y en móvil y **no
agrega una superficie de red** a una app que no tiene ninguna.

**TODO SE CODIFICA CON `encodeURIComponent`, y no es cosmético.** Los cuerpos llevan **saltos de
línea** —que en una URL van como `%0A`— y el asunto lleva corchetes. Armado por concatenación
cruda, el primer `&` o `#` de un texto **corta el resto de la URL** y el correo se abre con el
cuerpo a la mitad, sin ningún error visible. Lo fija la mutación «se arma por concatenación».

**NO SE ADJUNTA UN SOLO DATO DE PACIENTE, y es una decisión.** Sería trivial meter el nombre del
estudio abierto o un volcado de `localStorage` para «facilitar el diagnóstico», y sería **sacar
dato clínico de la máquina por un canal que ni siquiera es de la app**: el correo queda en los
enviados del médico y en el servidor de su proveedor. Lo único automático es la VERSIÓN, que es lo
que hace falta para reproducir un error y no identifica a nadie. Hay un caso que lo vigila —la
mutación que empieza a adjuntar el nombre lo pone en rojo—.

**La versión sale de `ECO_BUILD`**, la constante que sella `scripts/sellar_version.py` en el commit
—la misma del pie—, con respaldo: un asunto sin versión sigue siendo un reporte útil, y una
excepción ahí dejaría la sección entera sin dibujar.

### El guardado de imágenes ya estaba entero — lo que faltaba era cobertura
El pedido del 2026-09-16 traía IndexedDB, toggle, tres calidades, barra de almacenamiento y
borrado **como si no existieran**. Está todo implementado desde antes: `CeiboImg` sobre la base
`ceibomed_img`, `cfg-guardar-imagenes` apagado por defecto, `IMG_CAL` con `mini`/`media`/`orig` y
un `rank` que ordena —así la calidad **sólo puede bajar**—, `imgStorageRender` midiendo contra
`navigator.storage.estimate()`, y `cfgBorrarTodasImagenes` con su recolector.

**La barra NO está en Config y eso es deliberado**: vive en la cabecera de Informes Guardados,
que es donde el médico está cuando el espacio le importa —viendo la lista que lo ocupa—. En Config
quedaba enterrada bajo una preferencia que se toca una vez. Está escrito en el comentario, al lado
del toggle, para que el próximo pedido no la «agregue» de nuevo.

**Lo que sí faltaba: ningún caso lo probaba.** Un módulo que escribe dato clínico en disco y cuyo
único resguardo es «falla cerrado» merece que eso esté fijado. **TC-145** cubre ahora el toggle
apagado por defecto, el orden de los rangos de calidad, la barra contra la cuota del origen, que
el borrado vaya por recolector, y que `CeiboImg.leer` distinga «no pude leer» (`null`) de «no
tiene» (`[]`) — la diferencia que evita que un error transitorio se traduzca en un borrado.

### El orden de las tabs avanzadas vive en TRES superficies, y sólo dos se derivan
Reordenadas el 2026-09-16 a: **Hemodinámica · Eco Pulmonar · ETE · Cardio-Oncología · Amiloidosis ·
CC frecuentes · CC complejas** (patologías) y **Calculadoras · Fonocardiograma · Referencias**
(herramientas, sin cambios).

**Nada de lo que cuelga de las tabs es posicional**, y eso es lo que hace que reordenar sea seguro:
`showTab` va por id, `data-mod` por clave, y `ett_modules` en `localStorage` es un objeto
clave→booleano. Verificado apagando «pulmonar» **después** de moverla: sigue ocultando su botón y
no toca a los demás.

**El desplegable de móvil se deriva solo**: `ecoAdvBuild` recorre `.subtabs-wrap .tab-btn` en orden
del DOM. Importa verificarlo igual, porque por debajo de 768 px **es la única vía** a las avanzadas
y si dejara de seguir el orden nadie lo notaría desde el escritorio.

**`EE_MODULES` NO se deriva del DOM** — es la copia a mano que ordena las casillas de Config, y hay
que reordenarla en paralelo. La guarda de arranque que ya existe compara los CONJUNTOS de claves,
no el orden, así que una divergencia de orden es muda: el médico busca «Eco Pulmonar» en Config
donde la vio arriba y no está. **Las claves no se tocan nunca.**

**El comentario de las dos CC viaja con ellas.** Explica por qué `congenitas2` lleva
`data-mod="congenitas"` —son un módulo partido en dos, y con `data-mod` propio la segunda no tenía
casilla en Config—, así que se mueve junto a los dos botones que describe. Es la misma regla que en
el reorden de Avanzado del Laboratorio.

**TC-123 NO cubría el orden**: busca los botones por `showTab('id')`, así que pasaba igual antes y
después. No había que actualizarlo — lo que faltaba era un caso del orden, y es **TC-144**.

**Y el reorden destapó una frase vieja de la tarea anterior.** El panel de Filtros del Laboratorio
enumera, en TEXTO VISIBLE, las pestañas que la cohorte recalcula: seguía diciendo «Calidad,
Hemodinámica, Por médico, Comparar períodos» cuatro commits después de que las plegara. Un
enumerado en prosa no lo cubre ningún test y no lo mueve ningún grep de código — al plegar o
renombrar una pestaña hay que buscar también **el texto que la nombra para el usuario**.

### Un hallazgo de auditoría por NÚMERO DE LÍNEA apunta a otro archivo
El 2026-09-16 volvieron S3 y S4 —los dos XSS almacenados— citando las líneas **16162** y **13273**.
Los dos estaban cerrados hace rato, y esas líneas hoy son **un comentario del módulo de pericardio
y CSS del Laboratorio**: el archivo creció miles de líneas desde el informe. **Antes de reabrir un
hallazgo por número de línea, mirar qué hay HOY en esa línea.** Cuesta diez segundos y evita media
sesión arreglando algo que no existe — es la misma clase que la lista de «Hallazgos de auditoría
verificados como FALSOS» de más abajo.

**Cómo se verifica que un XSS está cerrado, y por qué leer el código no alcanza:**
1. **Barrido del archivo**, no de las dos líneas citadas: interpolaciones de dato de estudio hacia
   `innerHTML` sin escape, y handlers `on*` con datos de usuario. Hoy: cero de las primeras —los
   dos candidatos arman una variable cruda y la insertan como `title="${escHtml(tit)}"`— y cero de
   los segundos: lo que queda en `on*` es un número calculado y un índice de bucle.
2. **Paciente envenenado en el navegador.** `O'Brien & <script>alert(1)</script>`, documento con
   apóstrofe, EN SUMA con `<img src=x onerror=…>`. Se cuentan scripts inyectados, `img[onerror]`,
   atributos de evento que lleven el nombre, y se intercepta `alert`. **Confirmando primero que la
   lista renderizó filas**: sin denominador, contar inyecciones da cero y parece seguro.
3. **Semgrep contra la línea base** (123), mirando además que ningún hallazgo caiga en esas rutas.

**El patrón correcto para el handler, que es el que está implementado:** `data-nombre` y `data-ci`
escapados + `onclick="verEvolucionEl(this)"`, y la función lee `el.dataset`. Nada del paciente
entra al atributo que el navegador compila — que es donde `escHtml` NO protege, porque el parser
decodifica la entidad ANTES de compilar el handler.

**Estaban cerrados y sin una sola prueba automática.** La única cobertura era el procedimiento
manual de `tests/regresion.json`. Un arreglo sin caso es un arreglo que se deshace sin que nadie se
entere — y éste ya volvió a aparecer en un informe. Lo fija **TC-143**, verificado por mutación:
reintroducir S3, reintroducir S4 y sacar el escape del nombre de la lista lo ponen en rojo.

**`#evol-tabla` es marcado muerto.** Aparece una sola vez en el archivo —su declaración— y nadie lo
llena: la evolución longitudinal es un **gráfico** (Chart.js sobre `#chart-evolucion`), no una
tabla. Anotado al pasar; no se tocó en un commit de seguridad.

### El Laboratorio pasó de DOCE subtabs a OCHO
2026-09-16. Calidad, Por médico y Comparar períodos se plegaron dentro de **General**;
Hemodinámica dentro de **Avanzado**. Más el orden interno de Mediciones y Avanzado, el renombre de
«Informe PDF» a «Informe» y la tabla resumen de valvulopatías.

**LOS PANELES SON CONTENEDORES; el contenido lo pintan funciones por `getElementById`**, que no
sabe de subtabs. Por eso plegar cuatro paneles dentro de otros dos es mudanza y no lógica: ningún
render cambió.

**LO QUE SÍ HAY QUE MOVER SON LOS `init`.** `labSubTab` llamaba `labMedicoInit()` y
`labCompararInit()` al abrir SUS subtabs; plegados dentro de General, esos dos bloques quedaban en
el DOM, visibles y **vacíos** — el selector de médicos sin opciones y el comparador sin fechas, que
se ve igual que «este laboratorio no tiene médicos cargados». Es la asimetría que
`labAsociacionesInit` ya tenía declarada.

**«Informe PDF» vivía en DOS superficies**: el botón y el manual (`ECO_AYUDA`). Es la regla que
este archivo tiene escrita para los rótulos de pestaña — y el `grep` la encontró antes de que el
manual quedara describiendo una subtab con otro nombre.

**EN AVANZADO NO SE PODÍA REORDENAR MOVIENDO SÓLO LAS TARJETAS.** Entre ellas vivían un párrafo
introductorio y cuatro comentarios que explican cada sección: mover las `.lab-card` sueltas los
habría dejado pegados a la tarjeta equivocada. La unidad que se mueve es **«lo que precede + la
tarjeta»**. En Mediciones no hacía falta —entre tarjetas sólo hay blancos— pero se verificó antes,
que es el punto: es exactamente el defecto que se comió dos bloques al repartir Congénitas.

**Y cuatro comentarios quedaron describiendo la subtab que acababa de desaparecer** («se mudó a la
subtab Hemodinámica»). Un comentario que sobrevive a la mudanza que describe es peor que no
tenerlo: el siguiente que lea va a buscar una subtab que no existe.

### La tabla resumen de valvulopatías, y por qué recién ahora son OCHO filas
Ocho válvulas × cuatro columnas, **antes** de los gráficos: es el dato del que salen las barras, y
quien quiere el número no debería tener que leerlo de una barra.

**Las tres filas que faltaban las habilitó el trabajo de esta misma sesión.** Cuando esta tarea se
pausó, sólo cinco válvulas tenían modelo de datos utilizable: `et_grado` estaba cableada a
`() => null` en `_labValvCounts` con un comentario falso, `ip_grado` guardaba cadena vacía mientras
su etiqueta afirmaba «Sin insuficiencia», y `ep_grado` **no existía** —la estenosis pulmonar vivía
dentro de `vp_morf` mezclada con la morfología y la insuficiencia—. Las tres se arreglaron antes de
volver acá; por eso la tabla sale completa y sin filas inventadas.

**Una sola fuente de conteo.** La tabla usa el MISMO `_labValvCounts` que el gráfico: con su propio
conteo, la tabla y las barras de la misma tarjeta podrían publicar números distintos — el defecto
del subtítulo de los denominadores que este archivo ya pagó.

**La columna «Sin» se DERIVA de la base**, no se cuenta aparte: `base − (leve + moderada + severa)`.
El denominador es el total del período porque **no marcar una válvula significa valorarla como
normal** en el flujo de esta app. Lo que NO se cuenta es el campo **ausente** —un Excel importado
sin esa columna—: ahí «Sin» sería una afirmación sobre un dato que no existe, y la diferencia se
declara al pie en vez de repartirse en las celdas. Con base 0 la celda dice «—» y no «0», que es
`pctOf(n, 0)` otra vez.

**El PPT sigue fuera.** El pedido lo incluye y a la vez dice «no crear nada nuevo todavía»; se
decidió diferirlo, y esta tarea es sólo reorganización.

### ET completa: tres criterios con el MISMO peso, y un veredicto binario
Agregados el 2026-09-16: **`et_thp`** (ms, banda 50-400), **`et_vti_diast`** (cm) y el área
**`et_avt`** por continuidad, sólo lectura. La guía **no gradúa** la estenosis tricuspídea —no hay
leve/moderada/severa validada—: es significativa o no, y basta con que se cumpla **UNO** de
`ET_GMEDIO_SIGNIF` 5 mmHg · `ET_THP_SIGNIF` 190 ms · `ET_AVT_SIGNIF` 1 cm² (EAE/ASE 2009 ·
ESC/EACTS 2021). Por eso el veredicto es un `some`, no una cascada: ninguno manda sobre los otros.

**El área reusa el patrón de la mitral, y el diámetro está en MILÍMETROS.** `avm_cont` hace
`PI * (D/20)^2` —dividir por 20 pasa a cm y saca el radio en un solo paso—. Escribirlo como
`D^2 * PI/4` con D en mm da un número **cien veces mayor**, y el error se ve plausible: un área
tricuspídea de 490 cm² es absurda, pero una de 4,9 cm² —la del TSVD, si uno se olvida de dividir
por el VTI— es exactamente un valor normal. Lo fija la mutación «el diámetro se toma en cm».

**LOS DOS INSUMOS DEL NUMERADOR VIVEN EN OTRA PESTAÑA.** `tsvd_diametro` y `vti_tsvd` son de
`tab-vd`. La ayuda del campo **nombra la fuente**, no su posición: este archivo ya pagó tres
cadenas que decían «el campo de arriba» cuando el bloque cambió de pestaña.

**`et_vti_diast` va 5-100 cm, NO 5-60 como pedía el prompt.** En una ET severa el flujo de entrada
se acelera y el tiempo diastólico se alarga: un VTI de 60-70 cm es el de un paciente **real** con
estenosis severa. Con el techo en 60 ese valor cae fuera de banda y el criterio del área **deja de
votar justo en el caso más grave** — la banda habría rechazado lo que vino a medir.

**La aritmética del pedido estaba mal por un factor de diez, y encima invertía la conclusión.**
Decía «Ø TSVD 2,5 cm + VTI-TSVD 15 + VTI diast 10 → AVT ≈ 0,74 cm² → ET significativa». El cálculo
real da **7,36 cm²**, que es un área tricuspídea **normal** (lo normal es 7-9 cm²); 0,74 sería
estenosis severa. El caso habría fijado un número equivocado **y** el veredicto contrario. Para
probar el criterio del área con valores fisiológicos: TSVD 25 mm + VTI-TSVD 12 + VTI diast 60 →
**0,98 cm²**, que sí es significativa.

**`it_vti` NO es `et_vti_diast`.** El primero es el VTI del jet de regurgitación y vive quince
líneas más abajo, en el bloque de insuficiencia: mismas unidades, rango parecido. Cargar uno donde
va el otro no da error — da un área por continuidad plausible y equivocada. El campo lo advierte.

**Corte evaluación/pintor**: `etEstado()` decide y `calcET` sólo pinta. El informe lee `etEstado`,
así que pantalla y PDF no pueden divergir — antes el narrativo recalculaba la significación desde
`et_gmedio` por su cuenta, y al sumar dos criterios habrían quedado dos definiciones del mismo
hecho en el mismo documento.

**Con datos y sin ningún criterio cumplido se DECLARA** («Sin criterios de ET significativa con los
datos disponibles»), pero **no sube al EN SUMA**: el médico midió tres cosas y el informe tiene que
decir qué dieron, sin que eso sea un hallazgo. Sin ningún dato, silencio.

**El área del Excel se RECALCULA, no lee el campo de pantalla.** Ese `readonly` no se repinta al
reabrir, así que la planilla publicaría el área del paciente anterior — la lección de `gmax_calc`.
Y entra en `LAB_XLS_SOLO_EXPORT`: es derivada y no se importa. `calcET` entró a `RECALC_MODULOS`,
sin lo cual el área y la cápsula no vuelven al reabrir un estudio.

**Dos casos anteriores fijaban la redacción vieja** y dieron rojo, correctamente: TC-137 pinaba
«clínicamente significativa» —que cambió al integrar los tres criterios— y TC-135 el conteo de
columnas (417/124 → **421/128**). Un caso que fija texto es un caso que hay que actualizar cuando
el texto cambia a propósito; que se ponga rojo es la señal, no el problema.

**Y la colisión de substring, segunda vez en la sesión:** `indexOf('significativa')` matchea dentro
de **«Sin criterios de ET significativa»**, que es justo la frase que la condición esperaba ver. Al
verificar una ausencia, buscar la forma AFIRMATIVA completa.

### La mudanza de la válvula pulmonar, y por qué esta vez NO cambió el régimen
Commit 2b (2026-09-16). Los siete campos de medición vivían en el acordeón «Doppler Pulmonar» de
**`tab-doppler`** y la morfología con sus etiologías en **`tab-valvulas`**: la válvula estaba
partida entre dos pestañas y cargar un caso obligaba a saltar y volver. Hoy todo vive en el
acordeón de Válvula Pulmonar, en dos solapas (`vpTab`, copia del patrón `eteShuntTab`).

**LAS DOS PESTAÑAS SON `.tab-btn` DEL RAIL SIN `data-mod`, o sea el MISMO régimen de
visibilidad.** Eso es lo que hace que esta mudanza sea segura y la distingue de la de Pericardio
—que este archivo documenta— donde el módulo pasó de «siempre alcanzable» a «sólo en Avanzado con
el módulo tildado». Acá nadie pierde acceso a nada. **Verificarlo es el primer paso de cualquier
mudanza entre pestañas**, antes de mover una línea.

**El GRADO de la IP quedó en la solapa de morfología, no en la de mediciones**: es una evaluación
integral del médico (densidad del jet, tiempo de desaceleración, vena contracta), no un número
derivado. Las dos filas de PAP que pinta `calcIP` sí viajaron con las mediciones.

**Las solapas NO tocan valores: sólo `display`.** Los dos paneles están siempre en el DOM, así que
`guardarInforme` —que barre `input[id]`/`select[id]` de todo el documento sin mirar visibilidad—
sigue viendo los siete, `limpiarCampos` los limpia y `calcVP`/`calcIP` los leen. `getElementById`
no sabe de pestañas ni de paneles ocultos: por eso esto es presentación y no lógica.

**Contar `<div>` no habría detectado nada de esto.** Lo que se verificó es el **conjunto de ids**
antes y después —perdidos: sólo `dop-pulmonar` y `dop-pulmonar-arrow`, que son el acordeón que
desaparece; nuevos: los cuatro de las solapas— y después, en el navegador, **en qué pestaña y en
qué panel cayó cada campo**. TC-140 lo fija, más que `tab-doppler` no conserve ningún id de
pulmonar.

### EL RUNNER TIRABA EL DIAGNÓSTICO DE CADA CONDICIÓN
`(r.extra || []).forEach(([desc, ok]) => ...)` desestructuraba **dos** elementos de una tupla de
**tres**. Decenas de casos escriben el valor real como tercer elemento —`['la cápsula dice X',
cond, valorReal]`— y el runner lo descartaba, así que al fallar una condición imprimía el nombre
y **nada más**. El render de abajo ya sabía mostrarlo (`if (enc)`); lo que faltaba era pasárselo.

Costó varias vueltas de probe en la misma sesión: cada rojo obligaba a montar un script aparte
para leer un valor que el caso **ya tenía en la mano**. Arreglado el 2026-09-16. Con eso, un id
perdido en la mudanza ahora se lee como «faltan: ip_vtd» en vez de como una excepción muda.

**Y un caso tiene que poder reportar el campo que falta sin reventar.** Las condiciones de un
`extra` se evalúan TODAS al construir el array, así que un helper que devuelve `null` para un id
inexistente hace que la condición siguiente lance **antes** de que se reporte «falta este id».
Devolver el objeto con nulos adentro convierte la excepción en condición roja legible.

**Dos trampas propias, otra vez las mismas:** `__t.guardar()` devuelve una **promesa** con
`{ok, estudioId}` —sin `await`, `reabrir` recibe la promesa, no abre nada y los campos vuelven
vacíos: el caso midiendo sobre un formulario en blanco y culpando a la mudanza—; y **backticks en
un comentario dentro del cuerpo de un caso**, que ya van once. `node --check` los caza antes de
correr nada, pero apuntando a la línea del `caso(`, decenas de líneas antes del culpable.

### Válvula pulmonar: `vp_morf` era UN select para tres cosas
Separado el 2026-09-16 (commit 2a: modelo de datos y lógica; las solapas y la mudanza de pestaña
van aparte). `vp_morf` mezclaba **morfología, estenosis e insuficiencia** en un solo select, así
que elegir «Insuficiencia leve» **borraba la posibilidad de consignar estenosis** y viceversa —
mutuamente excluyentes por construcción cuando clínicamente coexisten. Hoy: morfología en
`vp_morf`, estenosis en **`ep_grado`** (+ `ep_nivel`, `ep_etiologia`) e insuficiencia en
`ip_grado` (+ `ip_etiologia`).

**`calcVP` escribe `ep_grado` y `_MARCAS_DERIV` tuvo que seguirlo.** Esa lista respalda las marcas
`dataset` durante la reimpresión: dejarla apuntando a `vp_morf` habría respaldado una marca que ya
nadie escribe y perdido la que sí.

**La traducción del auto-grado vive en UN lugar.** `epGradoPorGmax` devuelve «Estenosis leve» —con
la palabra adentro— y las opciones son «sin»/«Leve»/… Un valor inventado no falla: deja el select
**sin selección** y el grado desaparece en silencio.

**«Moderada-severa» no la produce el auto-grado, y la cápsula lo dice.** `epGradoPorGmax` tiene
TRES bandas de estenosis (ESC/ASE) y el select tiene cuatro. Partir la banda 36-64 exigiría un
corte que ninguna guía publica y el informe lo citaría al lado de «ESC/ASE». Es elección manual, y
se declara **en pantalla** para que su ausencia no se lea como que el cálculo la descartó.

**LA OPCIÓN 0 DE LAS DOS ETIOLOGÍAS ERA UN HALLAZGO.** `ep_etiologia` arrancaba en «Congénita
valvular» e `ip_etiologia` en «Fisiológica (traza)»: consignar un grado y **no tocar el select**
publicaba esa etiología en el informe firmado. Es el defecto de los tres selects del TEER. Hoy
«No especificada» es la primera en las dos, y ni ella ni «No especificado» del nivel se imprimen.

**LA NORMALIDAD EXIGE «Normal» EXPLÍCITO.** La compuerta era «no es anormal», que dejaba pasar
**«No especificada»** —el valor al que MIGRAN los estudios viejos— y el informe salía «Válvula
pulmonar normal.» sobre una válvula que nadie miró. La negación sin evidencia entrando por la
puerta de la migración. Sin morfología consignada y sin mediciones, la válvula no se nombra.

**Pero con mediciones normales la palabra «normal» SÍ va.** Antes la aportaba `vp_morf`; al
separarlo, un estudio con Vmax 1,4 m/s pasó de «Válvula pulmonar normal (Vmax 1.4 m/s…)» a
«Válvula pulmonar (Vmax 1.4 m/s…)» y el lector dejaba de saber si se había valorado. Ahí la
normalidad **está sostenida por una medición**, que es lo que la separa del caso de arriba.

**LA MIGRACIÓN TIENE OCHO MAPEOS, NO CINCO.** El pedido listaba los cinco de `vp_morf`; faltaban
los **tres de `ip_grado`**, que también cambió de valores —perdió el prefijo «IP» y el
«(fisiológica)», que era una **etiología metida dentro del grado**—. Sin ellos el select reabre
**en blanco** (`selectedIndex = -1`) y el hueco se persiste al guardar. Y los cuatro valores de
estenosis migran a **«No especificada», no a «Normal»**: el campo viejo las mezclaba, así que
«Estenosis leve» no decía nada de la forma y escribir «Normal» inventaría un hallazgo.
Medido sobre los 95 reales: **3 estudios** con `vp_morf` fisiológica y **1** con el `ip_grado`
viejo. La migración **no pisa** un campo destino que ya traiga valor propio.

**Tres consumidores dependían del prefijo «IP».** `tdfConclusion` hacía
`replace(/^IP\s*/i, 'insuficiencia pulmonar ')` — con «Moderada» no hay prefijo que cambiar y el
párrafo de Fallot publicaba **«Moderada» suelto**; la línea del EN SUMA de Fallot quedaba en
«— Moderada», que no dice de qué; e `IP_L` del Laboratorio indexa por el valor del select, así que
conserva las claves viejas **y** las nuevas porque `distrib` lee `campos` CRUDO y hay estudios sin
migrar.

**`ep_grado` es la SÉPTIMA válvula del Laboratorio.** `_labEstenSev` la lee sin cambios. Ojo:
«Moderada-severa» cae en `/severa/` **antes** que en `/moderada/`, así que el Lab la cuenta como
**Severa**, mientras `_labRegurgSev` mapea el grado 3 de las regurgitaciones a **Moderada**. Es una
asimetría entre los dos helpers; se eligió el lado que **no degrada** la severidad, y ninguna otra
estenosis tiene esa banda, así que no cambia ningún conteo existente. Declarado.

**Seis columnas nuevas de Excel, no cuatro.** El pedido listaba `ep_grado`, `ep_nivel`,
`ep_etiologia` e `ip_etiologia`; se agregaron también **`vp_morf` e `ip_grado`**, porque exportar
la etiología de una insuficiencia cuyo **grado** no viaja da una planilla que no se puede leer
sola. Van nombradas y **no por prefijo**: «EP » e «IP » son dos letras y el bloque 8 ya se lleva
todo lo que empiece con «IM» o «IT» — es como «Morfología » se tragó «Morfología orejuela».
El Excel pasó de **411 a 417 columnas** y de 118 a **124 básicas**; TC-135 fija los dos números.

**`vpSync` va en las DOS columnas** —`RECALC_MODULOS` y el final de `limpiarCampos`— porque las
rutas de restauración reponen asignando `.value` y eso no dispara `onchange`, y `limpiarCampos` no
pasa por ese embudo.

**Tres trampas de los casos de prueba:**
- **TC-137 derivaba el índice de la válvula como `length - 1`.** Al agregar la pulmonar como
  séptima, ese índice pasó a apuntar a otra columna. **Indexar por nombre**, no por posición.
- **TC-51 y TC-137 usaban el token viejo `'IP severa'`**, que ya no es opción: asignarlo deja el
  select sin selección y el caso mide sobre un campo vacío.
- **Backticks en un comentario dentro del cuerpo de un caso**, décima vez. `node --check` lo caza
  antes de correr nada.

**Lo que NO se hizo, y por qué.** El pedido decía «Gradiente medio VP (ya existe)» — **no existe**.
Hay `em_gmedio`, `ea_gmedio` y `et_gmedio`, no pulmonar. Y no es un olvido menor: `epGradoPorGmax`
gradúa por el gradiente **PICO**, así que un campo de gradiente medio nuevo no lo graduaría nada y
nacería huérfano. Queda fuera hasta decidir qué lo consume.

### Etiologías en VM/VA/VT: tres trampas, y ninguna estaba en el pedido
Agregadas el 2026-09-16: **VM** + Endocarditis, Isquémica (disfunción/rotura músculo papilar);
**VA** + Endocarditis, Carcinoide; **VT** + Carcinoide, Endocarditis, Funcional / dilatación VD.

**1 · `LAB_XLS_LISTAS` es una lista PARALELA a las opciones del select, y decide qué acepta el
importador.** Los tres selects entran al Excel con tipo `'opcion'`; su lista de valores válidos
está escrita a mano y **`_labXlsAssertVocab` sólo audita las columnas `vocab`**, así que nada la
vigilaba. Una opción que esté en el select y no en la lista **exporta bien** y al reimportar cae
en `errs` → **descarta la FILA ENTERA** (nombre, cédula, FEVI, informe). Es el defecto que costó
la sesión de «no cargan en Safari», por la otra mitad del mapa. Hoy lo vigila
**`_labXlsAssertListas()`**, que compara contra el DOM **en las dos direcciones** y corre en
`DOMContentLoaded` —no en línea— porque el bloque se evalúa antes de que existan los selects y un
assert sobre un DOM a medias reporta divergencias falsas. **No deriva la lista del DOM a
propósito:** la lista es el CONTRATO del importador, y derivarla haría que un cambio en el HTML
ensanchara en silencio lo que se acepta desde un archivo externo.

**2 · Endocarditis no es una morfología.** La plantilla que ya existía es «Válvula mitral **de
morfología** X», así que las etiologías nuevas salían como «de morfología endocarditis». Y cada
válvula usa una construcción distinta —«Válvula aórtica X», «La válvula aórtica **es** X», «(X)»—,
así que `VALV_MORF_ETIOL` devuelve **cuatro formas** (`de`/`presenta`/`adj`/`es`). **Para toda
opción que no esté en el mapa la salida es byte por byte la de antes**, que es lo que permite
agregar etiologías sin tocar la redacción de las seis morfologías que ya estaban.

**3 · `vt_morf` NO LLEGABA AL NARRATIVO.** Vivía sólo en la tabla del PDF y en la columna del
Excel: una afectación carcinoide de la tricúspide —que es la válvula que la carcinoide afecta
característicamente— se cargaba y **no aparecía en el informe firmado**. `detectar_huerfanos` no
lo marcaba porque el id sí está nombrado; lo que no tenía era **destino narrativo**, que es
justamente la distinción que ese script declara no poder hacer.

**La opción «Funcional / dilatación VD» se contradecía sola.** Es el MECANISMO de una
insuficiencia, no una morfología suelta: sobre un estudio sin IT producía «Válvula tricúspide con
insuficiencia funcional por dilatación del ventrículo derecho. Válvula tricúspide **sin
insuficiencia valorable**.» en la misma línea. Hoy ahí se declara la inconsistencia («sin grado de
insuficiencia cargado») en vez de publicar las dos mitades. Y en la rama sin IT la morfología se
**pliega** en la oración, porque si no «Válvula tricúspide» abría dos oraciones seguidas.

**La nota didáctica va FUERA de la etiqueta de la opción.** El pedido traía «Funcional / dilatación
VD **(causa más frecuente de IT)**». El valor de la opción es lo que se persiste, lo que imprime la
tabla del PDF y lo que viaja a la celda del Excel: esa frase de manual habría quedado dentro de un
documento firmado y dentro de un dato. La nota se puso como línea de ayuda bajo el select, que es
el idioma que el archivo ya usa (el de Williams).

**EL EN SUMA NEGABA LA ENDOCARDITIS.** Medido: con `vm_morf = 'Endocarditis'` el cuerpo decía
«Válvula mitral con endocarditis» y el resumen —la superficie que se lee y se copia— decía
**«Estudio sin alteraciones estructurales ni funcionales significativas.»**. Es el defecto que
`ccMarcarParrafo` ya cerraba para congénitas, sobre otra pestaña. Las cuatro etiologías lo llaman;
**no se empuja una línea nueva al resumen**, sólo se marca que hubo párrafo y el fallback pasa a
«Sin OTRAS alteraciones — ver los hallazgos descritos en el cuerpo». **«Calcificada», «Reumática»,
«Prótesis» y «Mixomatosa» siguen sin marcar**: son descriptores crónicos que esta app nunca
resumió y cambiarlos tocaría informes existentes — declarado, no hecho.

**Dos trampas del propio caso de prueba:**
- **`indexOf('funcional')` matchea «funcionales»** del propio fallback, así que la condición que
  verificaba que la morfología no se repitiera en el EN SUMA daba rojo contra la frase que venía a
  comprobar. Al buscar una palabra corta en el resumen, mirar de qué otra es prefijo.
- **La línea de la tricúspide tiene DOS ramas y los casos sólo ejercían la de sin insuficiencia.**
  Borrar `vtFrag` entero —la rama CON IT— **no ponía nada en rojo**. Hace falta un escenario con
  `vmax_it` y VCI. Es la misma trampa que la rama con PSAP de la diastólica del VD, dos tareas
  antes.

**Y las menciones de marcado en los comentarios rompen el conteo de balance.** Escribir la etiqueta
de opción o de select literal dentro de un comentario hace que `count('<option') - count('</option>')`
se mueva sin que el markup haya cambiado, y ese conteo es el control que detecta desbalances
reales. En los comentarios, describir; no transcribir marcado.

### `calcET` era una bomba armada: no tenía rama de normalidad
Corregido el 2026-09-16. La cascada era `<2 → Leve · <=5 → Moderada · else → Severa`, **sin
ninguna rama de normalidad**: un gradiente medio tricuspídeo **normal —1 a 2 mmHg—** se escribía
como **`'Leve'`** en `et_grado` y de ahí bajaba al informe firmado y al EN SUMA («ET leve.»).
Y contradecía a la leyenda que la propia app imprime **dos renglones más abajo**, que ya decía
«≥5 mmHg sugiere ET clínicamente significativa». **No lo cobró nadie sólo porque `et_gmedio` está
vacío en los 6 estudios que traen el campo** — medido, no supuesto.

**La guía define UN umbral, no tres bandas.** EAE/ASE 2009 (Baumgartner, *JASE* 2009) y ESC/EACTS
2021: ET hemodinámicamente significativa = **gradiente medio ≥5 mmHg** (más VTI de entrada >60 cm,
T½ ≥190 ms y área ≤1 cm², **ninguno de los cuales esta app recoge**). **No hay graduación
leve/moderada/severa publicada** para la tricúspide: es binaria. `ET_GMEDIO_SIGNIF = 5`.

**Por encima del umbral `calcET` NO escribe un grado, y es deliberado.** Cualquier grado sería
inventado. Y agregar una opción «Significativa» al select tampoco sirve: la pastilla de severidad
deriva su nivel con `nivelDe()`, que sólo reconoce leve/moderada/severa, así que esa opción
dejaría **la pastilla diciendo «Sin est.» sobre un select que dice «Significativa»** — dos
respuestas a la misma pregunta en la misma tarjeta. Se declara la significación en la cápsula y en
el informe, **que la emite desde el gradiente medido**, y el grado queda para el médico.

**Esa emisión desde el gradiente no es opcional.** Sin ella, 8 mmHg con el select en «Sin
estenosis» —que es justo el estado que deja `calcET`— salía en **silencio**: el número que define
la enfermedad, medido y cargado, no aparecía en el informe firmado.

**EL «DESHACER» QUE PEDÍ ERA CÓDIGO MUERTO, Y LO DELATÓ LA MUTACIÓN.** Escribí la rama de
`dataset.sugerido` igual que la de `calcVP` y **sacarla no ponía nada en rojo**. `calcVP` la
necesita porque sugiere **tres** valores distintos del de reposo, así que borrar la velocidad
dejaba una estenosis afirmada; `calcET` sólo puede sugerir **`'Sin estenosis'`, que ES el valor de
reposo** — revertirlo es escribir encima lo mismo. Un resguardo que no se puede hacer fallar se
lee como protección y no lo es. Lo que sí hay que limpiar, y sí es alcanzable, es la **cápsula**:
sin eso queda «Significativa (8 mmHg)» en pantalla sobre un campo de gradiente ya vacío.

### `et_grado` sí tiene modelo de datos — el comentario que decía lo contrario era falso
`_labValvCounts` lo tenía en `() => null` con el comentario «Esten. Tricúspidea no existe en el
modelo de datos actual». **Falso**: `et_grado` es un `<select>` cuya primera opción es
`<option>Sin estenosis</option>` —sin atributo `value`, así que el valor **es** el texto—, el
mismo modelo que `em_grado`/`ea_grado` (`'sin'`). Medido: **presente en los 95 estudios reales**.
`_labEstenSev` ya sabía leerlo (su rama `/sin|esclerosis/` matchea «Sin estenosis»): era **una
línea**. Mientras estuvo en `null`, `pctOf(n, 0)` mandaba la mini-tabla del PDF de auditoría a
imprimir «— (sin datos)» — un documento firmado declarando que este laboratorio no tiene una sola
tricúspide valorada, cuando las 95 lo estaban.

### `ip_grado`: la etiqueta afirmaba y el valor negaba
Era el **único** de los siete grados valvulares con `value=""` en su opción 0. La **etiqueta**
decía «Sin insuficiencia» y el **valor** era cadena vacía: el médico veía el select afirmando y lo
que se guardaba era «nadie contestó», así que el paciente con la pulmonar valorada normal no
contaba en ningún denominador. Es la **inversa** de «un default tranquilizador es una afirmación»
— acá la afirmación estaba en la pantalla y no en el dato. Hoy el valor es el mismo texto que la
etiqueta, como `et_grado` («Sin estenosis») y `vp_morf` («Normal»).

**CAMBIAR EL TOKEN ROMPE CINCO CONSUMIDORES**, todos los cuales preguntaban «¿hay IP?» con la
simple verdad/falsedad de `ip_grado` —que con la cadena vacía funcionaba **por accidente**—:

| consumidor | qué pasaba con el token nuevo |
|---|---|
| `hayIP` (informe) | siempre verdadero → **«Válvula pulmonar normal.» desaparecía de TODOS los informes** |
| bloque 10b del informe | «insuficiencia pulmonar **sin insuficiencia**» |
| `tdfConclusion` | un **«Sin»** suelto como cláusula del párrafo de Fallot |
| EN SUMA de Fallot | « — Sin insuficiencia» colgando de cada línea |
| `distrib(…, IP_L)` | categoría no mapeada |

Por eso existe **`ipHayInsuf(val)`**, la única definición: acepta la cadena vacía como «no hay»
para que un legado sin migrar se comporte igual que uno migrado. **Si aparece un sexto consumidor,
usa ésa.** `IP_L` **no** lleva entrada para el token nuevo a propósito: `distrib` descarta lo que
no está en el mapa, así que «Con IP consignada» sigue contando los que **tienen** insuficiencia.

**Y necesita migración.** Sin ella un estudio con `''` reabre **mostrando un hueco** —asignar un
`.value` que ya no es ninguna opción deja `selectedIndex = -1`, no la primera— y al volver a
guardar se persiste ese hueco. Es la misma pérdida silenciosa que cerró `_VAB_SIEVERS`. La
traducción **no inventa un hallazgo**: la etiqueta que el médico tenía delante decía exactamente
eso. Sólo se toca la clave **si existe**: un estudio que nunca tuvo el campo se queda sin él.

**`et_grado`, `ip_grado`, `vp_morf`, `et_gmedio`, `vp_vmax` e `ip_vmax` NO están en el mapa de
Excel** — verificado contra `LAB_XLS_MAP`. Por eso este cambio de token **no toca el round-trip**
ni necesita entrada en `LAB_XLS_VOCAB`.

### La sexta pastilla no se restauraba
`cargarValvPills()` tenía `if (valvula === 'tricuspide' && tipo === 'esten') return;` — la única
de las seis que no volvía al reabrir. El botón existe (`pill-esten-tricuspide`) y funciona al
clickearlo, pero al recargar el bloque se cerraba y `et_gmedio` dejaba de verse, **con el grado
todavía en el informe**: «Estenosis tricuspídea moderada» con el gradiente que la sostiene fuera
de la vista.

### Diastólica del VD: el patrón sale del E/A solo — y exigir E/e' abría dos silencios
Agregada el 2026-09-16. Guía aplicada: **ASE 2025** (Mukherjee et al., *JASE* 2025;38(3):141-186,
**Tabla 6**), que **reemplaza a la ASE 2010** (Rudski, *JASE* 2010;23:685-713) — la que se cita
casi siempre para esto. Los cortes no cambiaron entre ediciones; lo que cambió es que 2025 los
publica como tabla con **una columna por patrón**, y esa tabla contesta lo que la prosa de 2010
dejaba ambiguo.

| Tabla 6 | Normal | Relajación | Pseudonormal | Restrictivo |
|---|---|---|---|---|
| **E/A** | ≥0,8 a <2,0 | **<0,8** | **0,8 a 2,1** | **>2,1** |
| **E/e'** | <6,0 | *(vacío)* | **>6** | *(vacío)* |

**La celda de `E/e'` está EN BLANCO para relajación y para restrictivo.** La guía dice, en su
propia maquetación, que ahí el cociente no participa: el patrón sale del **E/A solo** y el `E/e'`
desempata **únicamente** la banda del medio.

**El pedido traía una cascada que exigía `E/e'` en las tres bandas, y eso dejaba DOS
combinaciones sin ninguna rama — las dos en silencio, las dos del paciente más enfermo:**
- **`E/A < 0,8` + `E/e' > 6`** — relajación anormal *con presiones de llenado elevadas*. No
  matcheaba «E/A<0,8 + E/e'≤6» ni ninguna otra: el informe no decía una palabra de la diastólica.
- **`E/A > 2,1` + `E/e' ≤ 6`** — **patrón restrictivo, el más grave**, sin rama. La guía lo define
  por `E/A > 2,1` y tiempo de desaceleración < 120 ms; el `E/e'` no entra en ese renglón.

Es el «else mudo» que este archivo ya pagó tres veces. **Los cuatro escenarios que el pedido
enumeraba dan exactamente el mismo resultado con una cascada y con la otra** — la diferencia son
sólo esos dos huecos, y los dos se cierran hacia NOMBRAR el hallazgo.

**El grado exige la clasificación completa.** Con el `E/A` solo la guía igual nombra el patrón en
las bandas externas, pero graduar «leve/moderada/severa» sobre un único cociente afirma más de lo
medido: se dice «patrón sugestivo de…» y **no se gradúa**. Decisión editorial del pedido, honrada.

**`indeterminado` NO sube al EN SUMA.** La banda 0,8-2,1 sin `E/e'` **puede ser normal**, así que
publicar «patrón sugestivo de disfunción diastólica» ahí afirma lo que no se estableció. Se
describe en el cuerpo («patrón sugestivo de llenado normal o pseudonormal») y no se resume.

**LA COMPUERTA DEL BLOQUE DEL VD TENÍA UN AGUJERO PREEXISTENTE, y lo destapó esto.**
`dopTricFrase()` se empuja **dentro** de `if (hayTam || hayFunc || vdFuera.length)`, así que un
estudio con el Doppler tricuspídeo cargado y **ningún** diámetro, TAPSE, S' ni FAC perdía la línea
entera —«Doppler tricuspídeo: E …, A …, E/A …»— sin una palabra. Es el mismo defecto que el
comentario de esa función describe para `tapse || sp`, reintroducido por la puerta de al lado al
agregar el bloque tricuspídeo dos tareas antes. Hoy la compuerta incluye el estado diastólico y la
frase tricuspídea; sin eso, la diastólica habría heredado el silencio y ahí lo que se pierde es un
patrón restrictivo.

**La IT significativa se DECLARA, no bloquea.** La ASE 2010 lo dice textual sobre estos mismos
parámetros: *«they may not be valid in the presence of significant tricuspid regurgitation»*. Una
IT importante infla la onda E, así que empuja el `E/A` hacia restrictivo y el `E/e'` hacia
pseudonormal: **el sesgo es hacia sobrediagnosticar**. La salvedad se imprime **sólo cuando se
afirma un patrón anormal** —que es cuando puede engañar— y el corte es `it_grado ≥ 3`
(mod-severa): con el corte en «moderada» saldría en media base y dejaría de leerse.

**EL TRIV TRICUSPÍDEO NO ENTRA, aunque la Tabla 6 lo liste.** `dt_triv` existe y la tabla marca
`RV IVRT > 73 ms` como criterio de pseudonormal — pero en esta app ese mismo número ya gobierna
**otra** pregunta: signo indirecto de HTP con corte **60 ms** (`DT_TRIV_HTP`). Son dos umbrales
sobre la misma medición para dos preguntas distintas, igual que `VD_BAS_NORMAL_MAX` (41) y
`vdBasCat` (>45), que este archivo dice explícitamente que **no** hay que unificar. Sumarlo
cambiaría la clasificación de los estudios que hoy salen indeterminados. **Declarado, no hecho.**

**Las otras cinco filas de la Tabla 6 tampoco están**: tiempo de desaceleración tricuspídeo, flujo
anterógrado diastólico en la arteria pulmonar, relación S/D y predominio diastólico de venas
suprahepáticas, y `e'/a'`. La app no recoge ninguna. Por eso la banda del medio sin `E/e'` queda
indeterminada en vez de resolverse.

**Alcance, textual (Recomendación 1):** *«Although RV diastolic function is generally feasible in
most patients, standardized assessment and reporting are limited mostly to select populations such
as patients with or at risk for PH.»* No se gatea por eso —la app no puede saber si el paciente
está en riesgo de HTP— pero explica por qué esto describe y no diagnostica.

**Lo fija TC-136** con 28 condiciones y **siete mutaciones**, entre ellas la que reintroduce la
cascada del pedido: pone en rojo exactamente las dos condiciones de los huecos. Los umbrales se
prueban **por los dos lados** (`0,79`/`0,80` · `2,10`/`2,11` · `6,0`/`6,1`) porque el operador es
`<`, `>` y `>`, no `<=` ni `>=`.

### Doppler tricuspídeo: de cuatro campos pedidos, sólo uno era nuevo
Agregado el 2026-09-16 al bloque tricuspídeo: **`dt_onda_e`**, **`dt_onda_a`**, **`dt_eprime_lat`**
y **`dt_triv`**, con `E/A` y `E/e'` calculados. **Antes de crear un campo se verificaron los tres
que el pedido daba por existentes, y dos cambiaron el plan:**

- **`vmax_it` ya existe** — es la Vmax de la insuficiencia tricuspídea. No se duplica.
- **TAP ya existe y su id es `tvia`**, no `tap`. Vive en el bloque del VD, rotulado «TAP (ms)», y
  va al Excel como tal. Un `dt_tap` habría sido la segunda entrada del mismo dato.
- **`triv` ya existe pero es el del VENTRÍCULO IZQUIERDO** —está junto a `tde` y `thp` en el
  bloque diastólico—, así que el tricuspídeo **sí** hacía falta. El rótulo del campo nuevo lo dice
  con todas las letras, para que nadie cargue uno donde va el otro.

**EL TAP NO SE TRATA EN ESTE MÓDULO, Y ES A PROPÓSITO.** El pedido lo incluía —con frase propia y
con la oración combinada TRIV+TAP—, pero **la app ya lo publica dos veces**: la línea de la válvula
tricúspide del narrativo dice «Se suman elementos indirectos de hipertensión pulmonar dado por
TAP < 105 ms», y el EN SUMA agrega «Elementos indirectos de hipertensión pulmonar (TAP < 105 ms),
sin PSAP estimable» cuando no hay PSAP. Agregarlo habría sido la **tercera** superficie diciendo lo
mismo del mismo número en el mismo informe. Y el umbral 105 vive en esa función: **no se duplicó**
en una constante nueva.

**Los signos son INDIRECTOS y el texto lo dice.** El diagnóstico de hipertensión pulmonar lo hacen
la PSAP y la clasificación ESC 2022, que están en la misma tarjeta. Por eso **nada de esto sube al
EN SUMA**.

**Acoplamiento declarado con el Laboratorio:** la fila «HTP» de `_LAB_HALLAZGOS` cae a una búsqueda
de texto sobre el informe cuando la PSAP no alcanza, así que un estudio cuya única mención de HTP
sea la frase del TRIV **pasa a contar como HTP** en el dashboard y en el PDF de auditoría. Medido
sobre los 95 estudios reales: 5 traen TAP, 1 tiene TAP<105 y **ése ya contaba** — impacto hoy
**cero**. Para el TAP era el comportamiento buscado; para el TRIV es una vía nueva. Si el conteo de
HTP se infla, mirar acá.

**Un valor fuera de banda cuenta como DATO.** Sin eso, una onda E de 9 m/s —error de unidades—
salía por el return temprano y **desaparecía del informe sin una palabra**: el médico la tipeó y no
aparecía en ningún lado. `hayDatos` incluye `fuera.length`.

**Campos:** los cuatro de arriba, con sus **cuatro columnas de Excel** y cuatro filas en la tabla
del VD del PDF. `calcDopTric` entró a `RECALC_MODULOS`: las dos cápsulas no se repintan solas al
reabrir un estudio.

### No marcar una válvula es un HALLAZGO, no un campo vacío
**El flujo clínico de esta app es que el médico marca SÓLO lo que el paciente tiene.** Si no marcó
nada, el paciente no tiene esa valvulopatía — y **eso es un dato válido**. Por eso el valor de
fábrica de `im_grado`/`ia_grado`/`it_grado` (`'0'`), `em_grado`/`ea_grado` (`'sin'`) y `et_grado`
(`'Sin estenosis'`) se traduce a **`'Sin'`**, que es un grado, y el denominador de las barras de
valvulopatías es el **total de estudios del período**.

**El 2026-09-16 se implementó lo contrario y estaba mal. Revertido el mismo día.** Se agregó una
compuerta (`_labValvEvaluada`) que exigía una bandera `<id>__tocado` o un valor distinto del de
fábrica. **Medido sobre los 95 estudios reales**, el denominador de la insuficiencia mitral caía
de **95 a 44** y el gráfico pasaba a decir **«Sin: 0 %»** — o sea que **ningún** paciente del
laboratorio tenía una mitral normal y el **100 %** de los evaluados tenía insuficiencia. Un número
que se lee como real y es falso. La estenosis tricuspídea quedaba en **n = 0** y desaparecía de la
sección, cuando en realidad se valoró como normal en los 95.

**El defecto real estaba en el RÓTULO, no en el denominador.** La sección decía «Porcentajes sobre
los estudios con esa válvula evaluada — **no** sobre los N del período» mientras el `n` **era** el
del período: prometía un filtro que no existe y que, con este flujo, **no debe existir**. Hoy las
dos superficies —pantalla y PDF de auditoría— dicen *«Porcentajes sobre el total de estudios del
período. No marcar una válvula indica que fue valorada como normal.»* El PDF además llevaba un
AVISO que leía el default como una duda («puede incluir estudios donde nadie la miró»): en un
documento de auditoría esa frase hace que el lector descuente los números enteros.

**La entrada anterior de este archivo leyó la contradicción al revés** —asumió que el denominador
estaba mal en vez del cartel— y de ahí salió el intento fallido. **Antes de «arreglar» un
denominador, preguntarse qué significa el valor de fábrica en el flujo de trabajo real**, y
medirlo: acá bastó calcular la distribución resultante para ver que el arreglo producía un 0 %
imposible.

**Lo único que sigue sin contar es el campo AUSENTE** (`undefined` o cadena vacía), que es el caso
de un Excel importado sin esa columna: ahí no hay dato, ni de presencia ni de ausencia. En la base
real, **ausentes = 0** para los seis.

**Censo del 2026-09-16 (95 estudios), por si hace falta otra vez:** los seis presentes en los 95;
con valor distinto del de fábrica **44** (IM), **8** (IA), **59** (IT), **8** (EM), **10** (EA) y
**0** (ET). `ip_grado` sólo aparece en 6 porque su primera opción **sí** es vacía — es el único de
los siete que no comparte este modelo.

### Tres de seis correcciones ya estaban hechas — verificar antes de rehacer
Del lote del 2026-09-16, **la mitad ya estaba resuelta** y la «Deuda conocida» de este archivo
estaba **vieja**:
- **Las tres cápsulas al reabrir** (`psap-interp`, `sgl-interp`, `bsa-val`): `calcBSA`, `calcPSAP`
  y `calcSGL` **ya estaban** en la lista de recálculo de `cargarEstudioPorId`. La entrada
  «TC-GR-13, abierto» describía un estado anterior.
- **La sincronía del SGL**: `sgl` ↔ `sgl_gls` ya funcionaba en **las dos direcciones** —la ida por
  `calcSGL`, la vuelta por el `oninput` inline de `sgl_gls`—. Medido: escribir −18 en uno deja −18
  en el otro, y al revés.
- **La limpieza de las diez secciones de Congénitas**: ninguna fuga; los veinte campos probados
  quedan vacíos tras `limpiarCampos`.

Las tres quedan **fijadas por TC-132** para que no se deshagan. **Antes de rehacer un arreglo,
medirlo**: la sección «Deuda conocida» describe el estado del día que se escribió, no el de hoy.

### La hamburguesa lleva RÓTULO, no sólo el glifo
Por debajo de 768 px el rail y la fila de pestañas especiales se ocultan, y el `≡` es el **único**
camino a las diez secciones del estudio. Un glifo pelado no dice que ahí haya navegación. Ahora
dice **«≡ Secciones»** —la convención del resto de la app, no un patrón nuevo— y mide **104×44 px**
a 760, 700 y 390; en escritorio sigue `display:none`, así que el layout no cambia. De paso: el
`min-height:44px` estaba escrito y **no se aplicaba** —medía 44×**31**— porque el `line-height`
heredado lo achataba.

### El round-trip de Excel está verificado — y por qué NO es tautológico
**TC-131** (2026-09-16) cierra la brecha más grande que quedaba: guarda un estudio real con valor
en **57 campos** de las nueve secciones de congénitas, lo exporta con **`_labExportarXLSXReal`**
—el mismo camino del botón—, deja que **SheetJS** serialice el `.xlsx`, arma un `File` y se lo da
a **`labImportarXLSX`**, que es el mismo camino del import. Después compara campo por campo.
Medido: **100 claves en la vuelta, 57 comparadas, cero diferencias**, y los decimales sobreviven
(`2.4`, `1.9`, `23.5`).

**Este archivo documenta que «ida y vuelta exacto no prueba nada» cuando exportador e importador
son espejo. Acá NO lo son**, y por eso el caso vale: el export va **token → etiqueta legible**
(`LAB_XLS_ETIQ`) y el import va **celda → normalización → vocabulario → token**
(`LAB_XLS_VOCAB`), que son **dos tablas distintas**; más el parseo numérico con su ventana de
plausibilidad, más la serialización de SheetJS —que es donde vivió el defecto de los id en
notación científica—. Si alguna pieza se desalinea, el token no vuelve.

**Se prueba con valor en TODOS los campos**: uno vacío pasa el round-trip siempre, así que un
caso con huecos mide sobre un denominador falso.

**Los espejos se verifican por ausencia.** `dsav_fevi`, `dsav_dtsvi_mm`, `cvpa_vd_dilatado` y
`cvpa_cia_asociada` **no existen** —esas secciones leen `fevi`, `dsfvi`, `vd_bas` y
`ete_cia_tipo`—, y el caso exige que **no vuelvan** como campo propio ni tengan columna. Sin esa
condición, agregar una columna para un espejo pasaría desapercibido y crearía la segunda entrada
de la misma medición.

**Mutación que SOBREVIVE y está bien que sobreviva**: renombrar una etiqueta de `LAB_XLS_ETIQ`
(«Derecha» → «Lado derecho») **no rompe el round-trip**, porque el bucle de propagación agrega la
etiqueta nueva al vocabulario. Es la fuente única funcionando; no hay nada que arreglar.

**DEPENDE DE RED: SheetJS llega por CDN.** El caso **espera hasta 6 s** a que cargue —sin esa
espera daba rojo intermitente, que es peor que no tener el caso— y si no llega **falla con el
motivo escrito**, nunca se saltea en silencio. Un caso que se saltea solo es cobertura que no
existe.

### CVPA parcial: la indicación exige LOS DOS, y el VD dilatado sin Qp/Qs no tranquiliza
Sección implementada el 2026-09-15. **Con ésta, CERO placeholders**: las diecinueve secciones de
Congénitas I y II tienen contenido. Lo fija TC-112, cuyo array `PH` quedó vacío.

**La corrección quirúrgica exige Qp/Qs ≥1,5 Y ventrículo derecho dilatado.** Ninguno solo la
activa: un Qp/Qs de 1,8 sin repercusión no opera, y un VD dilatado puede serlo por otra cosa.

**El agujero que tenía la cascada del pedido.** Decía «Qp/Qs <1,5 **o no calculado** + VD no
dilatado → sin criterios, seguimiento anual», que deja sin rama al caso **VD DILATADO SIN Qp/Qs**
— justamente el paciente en el que hay que cuantificar — y lo mandaba a la rama que tranquiliza.
Acá tiene rama propia y **pide la resonancia**. Es la regla de la casa: una negación necesita que
se haya medido algo. Y con **nada** medido tampoco se niega: rama `incompleto`.

**El VD y la CIA son los del ESTUDIO.** La dilatación sale de **`vdBasCat()`** sobre `vd_bas`
—este archivo dice literalmente que si aparece un tercer consumidor pase por ahí— y el tipo de CIA
de **`ete_cia_tipo`**, que ya trae las opciones de seno venoso. Campos propios habrían dejado a
esta sección diciendo «CIA de seno venoso» mientras la de CIA/CIV dice ostium secundum, en el
mismo informe. `vdBasCat` devuelve `null` sin medición, así que **«no dilatado» y «no medido» no
se confunden** — y esa diferencia es la que decide si se tranquiliza o se pide el dato.

**El Qp/Qs se declara SIEMPRE como ecocardiográfico.** En esta lesión el eco **subestima** el
shunt y la ESC 2020 pone a la **resonancia** como método de referencia. Por eso, además, con VD
dilatado y Qp/Qs por debajo de 1,5 el informe **manda a cuantificar por resonancia en vez de
descartar**: la discordancia entre repercusión y cálculo es esperable, no tranquilizadora.

**Campos:** `cvpa_venas_numero`, `cvpa_conexion`, `cvpa_lado`, `cvpa_qp_qs`, `cvpa_htp`,
`cvpa_sintomas`, `cvpa_incluir_chk`. Con sus **seis columnas de Excel**. Los dos espejos de sólo
lectura (`cvpa_cia_ro`, `cvpa_vd_ro`) llevan `data-espejo` para no despertar la sección solos.

### DSAV: el criterio ventricular sólo vota con regurgitación izquierda severa
Sección implementada el 2026-09-15. Queda **un** placeholder en la suite: `cvpa`.

**El DTSVI y la FEVI son criterio de CIRUGÍA VALVULAR, no de disfunción.** Sólo votan con
**regurgitación de la válvula AV izquierda severa**: sin válvula severa no hay válvula que operar.
Sin esa compuerta, un DTSVI de 44 mm en una miocardiopatía dilatada **sin** regurgitación habría
publicado «criterios de cirugía valvular cumplidos». Y el informe **no los nombra** cuando no
aplican — repetirlos ahí los convertiría en un criterio que nadie aplicó.

**El umbral del pedido estaba en 45 mm y no se aplicó.** La ESC 2020 remite la regurgitación AV
izquierda a las recomendaciones de **insuficiencia mitral**, y el panel de indicaciones de esta
app **ya implementa las correctas**: **DTSI ≥40 mm** y **FEVI ≤60 %** (ESC/EACTS 2021, Clase I).
El 45 es de la **ESC 2017**, que la propia guía de 2021 imprime en su tabla de recomendaciones
revisadas al bajarlo a 40. Va hacia el lado **menos protector**: deja fuera al paciente con DTSVI
de 42 mm que la guía opera. Es la misma corrección que este archivo ya documenta para la IM
primaria — la tercera vez que un pedido trae el número viejo.

**La FEVI y el DTSVI son los del ESTUDIO (`fevi`, `dsfvi`), no campos propios.** Crear
`dsav_fevi`/`dsav_dtsvi_mm` habría sido la tercera y cuarta entrada de la misma medición: el
patrón del espesor parietal. Se espejan de sólo lectura (`dsav_vi_ro`, con `data-espejo` para que
no despierten la sección) y así se ve con qué está decidiendo.

**No se pide prestado `eteQpQs()`.** Ese Qp/Qs es el flujo global TSVI/TSVD y **no dice por qué
defecto pasa**: en un paciente con DSAV y otro shunt lo atribuiría al que se esté mirando. Es la
lección del ductus. El Qp/Qs de la sección es una estimación propia y consignada.

**Sobre el cierre decide la RESISTENCIA, no la PSAP del eco.** ≥5 UW → contraindicado (ESC 2020,
Clase III); 3-5 UW → cateterismo con vasorreactividad, decisión individualizada. Y con
**HTP severa sin RVP consignada** el informe **pide la resistencia** en vez de decidir con la
presión estimada — negar o afirmar la operabilidad con el eco es exactamente lo que la guía no
hace.

**Campos:** `dsav_tipo`, `dsav_regurg_av_izq`, `dsav_regurg_av_der`, `dsav_dssd_mm` (sólo se
imprime en el tipo completo), `dsav_qp_qs`, `dsav_down`, `dsav_htp`, `dsav_rvp_uw`,
`dsav_incluir_chk`. Con sus **ocho columnas de Excel**.

### Supravalvular aórtica: lo propio son los ostios coronarios, y alertan solos
Sección implementada el 2026-09-15. **Mismo criterio de gradiente que la subaórtica** —ESC 2020,
**medio ≥40 mmHg a flujo normal**, a cualquier nivel del tracto de salida— y por el mismo motivo:
el pedido graduaba por el pico y eso es una cita falsa. Ver la entrada de la subaórtica.

**Lo que separa a esta forma de las otras dos son los ostios coronarios.** La estenosis está por
**encima** de la unión sinotubular, así que los ostios quedan **proximales**, en la cámara de alta
presión: es la única de las tres en que la obstrucción puede producir **isquemia por sí misma**.
Por eso el compromiso coronario **alerta aunque el gradiente no sea severo** — no es contexto, es
lo que cambia la conducta.

**«No evaluados» NO es «normales».** El informe declara los ostios como **pendientes** cuando
nadie los miró, y nombra «normales» sólo cuando se consignó. Negar un riesgo de isquemia sin
haberlo buscado es la afirmación tranquilizadora que este archivo persigue desde el TEER.

**Campos:** `easv_tipo`, `easv_gradiente_medio`, `easv_gradiente_mmhg` (pico), `easv_williams`,
`easv_coronarias`, `easv_estenosis_pulmonar`, `easv_incluir_chk`. Con sus **seis columnas**.

### Estenosis subaórtica: gradúa el gradiente MEDIO, no el pico
Sección implementada el 2026-09-15. **La ESC 2020 adaptó la definición de obstrucción SEVERA del
tracto de salida izquierdo —a CUALQUIER nivel: valvular, subvalvular y supravalvular— al gradiente
MEDIO ≥40 mmHg a flujo normal**, para alinearla con la estenosis aórtica valvular.

**El pedido graduaba por el gradiente PICO con cortes 20/40 y no se aplicó.** Un pico de 45 con
medio de 24 es **moderada** para la guía; publicarlo como «severa — evaluar cirugía» al lado de la
sigla ESC 2020 es una **cita falsa**, y el error va hacia **sobre-indicar** cirugía. Es el mismo
defecto que ya costó la coartación: el número correcto medido con el método equivocado. El pico se
**describe** —es lo que sale del eco— y **sin el medio no se gradúa**: el informe dice cuál falta.

**«A flujo normal» no es decorativo.** Con gasto bajo el gradiente subestima, así que no alcanzar
40 **no descarta** severidad. La salvedad se imprime **sólo** cuando se gradúa como NO severa, que
es la afirmación que podría tranquilizar de más.

**La longitud del túnel se imprime SÓLO con el túnel.** En una membrana no significa nada, y el
campo puede conservar el valor de otro paciente si alguien cambió el tipo después de medirla.

**Valsalva distingue la lesión fija de la dinámica.** Un gradiente que **aumenta** con Valsalva es
el comportamiento de una obstrucción **dinámica**: el informe manda al diferencial con
miocardiopatía hipertrófica antes de atribuir el gradiente a la lesión subaórtica. No se resuelve
acá —es otro diagnóstico— pero callarlo dejaría al informe llamando «fija» a una lesión que no se
comporta como tal. Ojo: `mch_grad_reposo` y `mch_grad_valsalva` son el gradiente del **mismo
tracto** por otra entidad; dos gradientes del mismo tracto en un PDF firmado es el patrón que este
archivo ya pagó en Fallot.

**La IA secundaria moderada o severa sube al EN SUMA**: es marcador de severidad y progresión y
pesa por sí misma en la decisión quirúrgica. La leve se describe y no alerta — es lo habitual.

**Campos:** `esub_tipo`, `esub_gradiente_medio`, `esub_gradiente_mmhg` (pico), `esub_ia_asociada`,
`esub_longitud_mm`, `esub_valsalva`, `esub_incluir_chk`. Con sus **seis columnas de Excel**.

### Ebstein: la saturación es lo que convertía «hay una comunicación» en «hay un shunt»
Agregado el 2026-09-15: **`ebs_saturacion`**, banda 40-100 %, y una rama de **cianosis** en la
cascada. La sección ya detectaba la CIA (desde `ete_cia_*`) y el foramen (desde `fopConclusion`),
y su propio comentario decía que «una CIA con shunt derecha-izquierda es lo que produce cianosis y
lo que se cierra en el acto quirúrgico» — pero **no había con qué saber si ese shunt era
derecha-izquierda**. Eso es lo único que faltaba.

**El 90 % se atribuye como corte convencional, NO a la guía.** La ESC 2020 nombra la **cianosis**
entre los desencadenantes de intervención en Ebstein y recomienda **cerrar la comunicación
interauricular en el mismo acto de la cirugía valvular** cuando se prevea hemodinámicamente
tolerada; **no publica un número para Ebstein**. Escribir «<90 % (ESC 2020)» sería una cita falsa
— el defecto de la nota del NT-proBNP. Por el mismo motivo la rama **no lleva número de clase**:
no pude verificar cuál le corresponde.

**El cierre sólo se nombra con una comunicación DOCUMENTADA.** Sin ella la conducta dice «la
cianosis obliga a buscarla», que es lo que corresponde; prometer «se cierra en el mismo acto»
sobre un paciente al que nadie le encontró una comunicación describe una cirugía que no aplica.

**Y con indicación Clase I por otra vía la cianosis no desaparece**: no cambia la indicación, pero
es lo que decide cerrar la comunicación durante esa cirugía. Mismo criterio que la salvedad de la
TV en Fallot.

### Tres partes del pedido de Ebstein NO se implementaron, y por qué
El pedido del 2026-09-15 traía tres cosas que **ya existían o contradecían el archivo**. Queda
escrito para que no se «corrijan» de vuelta:

1. **Dos campos de área sumada** (`ebstein_area_atrializada` / `ebstein_area_funcional`). El
   índice **ya se calcula** en `ebsCelermajer()` desde **cinco** áreas propias, y están separadas
   **a propósito**: el comentario de esa función explica que Celermajer se mide en **telediástole**
   mientras las áreas auriculares de tamaño de cámara se miden en telesístole, así que reusarlas
   inflaría el numerador. Dos campos sumados serían una **segunda vía de entrada** para el mismo
   dato — la duplicación que este archivo ya pagó con el espesor parietal.
2. **`ebstein_cia_asociada`** (select Sin CIA / CIA / FOP). CIA y FOP **ya se detectan desde sus
   secciones reales**. Un select propio acá sería una **tercera** fuente del mismo hecho, capaz de
   decir «CIA presente» mientras la sección de CIA/CIV dice otra cosa, en el mismo informe.
3. **«Celermajer grado 3-4 → criterio de intervención ESC 2020».** El índice **no figura en la
   ESC 2020** —verificado por búsqueda de texto completo, ya documentado arriba de
   `ebsCelermajer`—, se derivó en **28 neonatos** y por eco **sobreestima** (κ=0,39 contra
   resonancia; sólo el índice por RMC correlacionó con el VO₂ pico). El informe **ya imprime** que
   «la indicación quirúrgica de la ESC 2020 es clínica y no depende de este índice». Implementarlo
   habría hecho que la app publicara «criterios de intervención ESC 2020» sobre un índice que esa
   guía no contiene. **El índice describe; no indica.** Lo fija TC-124, que verifica que un grado 4
   aislado NO produzca indicación.

**Campos:** `ebs_saturacion`, con su columna de Excel. Los cinco de áreas, el desplazamiento, la
atrialización, la función del VD, TSV, vías, síntomas, ejercicio y progresión ya estaban.

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

## Pie interpretativo por gráfica en el PDF de auditoría — y dos secciones que no se hicieron

Siete pies, uno debajo de cada gráfica y **antes** de la nota metodológica: FEVI, diastólica,
geometría del VI, TAPSE, PSAP, valvulopatías y contractilidad. Helper `_pie(n, txt)` junto a
`sectionChart` —no dentro del bloque avanzado, porque las secciones 4 a 11 no ven aquel `_nota`—.

Dos reglas que valen para todos: **con menos de 3 casos no se emite** —una frase como «predominio
de función conservada» sobre dos estudios describe a dos pacientes, no a una población—, y los
números salen de **las mismas variables** que alimentan la tabla y la gráfica de arriba, nunca
recalculados: un pie que contradice a la gráfica que describe es peor que no tenerlo.

### SGL: no se implementó, y no por falta de datos
El pedido traía «SGL promedio [X]% — normal si >-18% / reducido entre -12 y -18% / severamente
reducido si <-12%». Tres problemas, cada uno suficiente:
1. **No hay sección de SGL en el PDF de auditoría.** La única aparición de «SGL» en
   `labGenerarPDF` está dentro de un comentario. Sin gráfica no hay pie que poner debajo.
2. **`_labSglResumen` se niega a graduar, a propósito.** Su comentario: los bins «no nombran
   severidad y no se anclan a ningún umbral clínico, justamente para que nadie lea una graduación
   donde no la hay». Y hay una tarea cerrada —«Tarjeta SGL en Mediciones, sin graduar»— que lo
   decidió. Agregar la graduación revierte esa decisión sin decirlo.
3. **Las comparaciones están invertidas para el convenio del archivo.** El SGL se normaliza a
   NEGATIVO en el borde (`-Math.abs(x)`) y el Lab usa `ref:-20`. Con eso, «normal si > -18»
   clasifica un −20 —perfectamente normal— como fuera de rango, y «severamente reducido si < −12»
   lo captura a él. Y si se leyera de `_labSglResumen`, que devuelve `Math.abs`, **toda** cohorte
   daría «normal» porque 18,4 > −18 siempre. La app ya publica su propio corte en otro lado
   (`Math.abs(sgl) < 16` = reducida), que tampoco es −18/−12.

### Forrester: tampoco hay gráfica en este PDF
Cero apariciones de «Forrester» en `labGenerarPDF`. El diagrama vive en el **PPT** del
Laboratorio, no en el PDF de auditoría. Nada que anotar.

### Decisiones de contenido
- **FEVI**: «reducida» es < 40 % —moderada más severa— y no todo lo que baja de 50, porque la
  tabla de arriba separa «levemente reducida» como banda propia. Fundirlas haría que el pie y la
  gráfica cuenten distinto sobre la misma cohorte.
- **TAPSE**: las dos reglas del pedido dejan un hueco exacto en 80/20 —«>80 conservada» y «>20
  alterado» son las dos falsas—. Se agregó una tercera rama descriptiva: una gráfica sin pie,
  entre otras seis que lo tienen, se lee como que faltó el dato.
- **PSAP**: el pie dice «PSAP elevada», no «hipertensión pulmonar». La sección ya declara que la
  app no clasifica HTP por PSAP estimada, y el pie no puede afirmar más que la gráfica.
- **Valvulopatías**: se compara la **proporción**, no el conteo. Cada válvula tiene su propio
  denominador —el subtítulo de la sección lo declara— y la más evaluada ganaría siempre por tener
  la base más grande. «Significativa» es moderada o severa; contar la leve haría que casi toda
  cohorte tenga una «más frecuente». El pie declara su base porque no es la de la sección.

### Cuatro marcadores falsos en la verificación
El primer barrido dio 6 pies y dos apareciendo con n=2. Ninguna de las dos cosas era cierta:
- «PSAP estimada» es el **título de la sección**, así que daba positivo donde el pie no se emitió.
- «Disfuncion diastolica Grado» aparece en el narrativo de los propios estudios.
- Los ausentes eran **ids inventados en la sonda**: `_labPsap` lee `psap_calc`, y `_labGeomCat` /
  `_labDiastGrado` leen el **texto** del informe (`en_suma` + `informe_texto`), no campos
  numéricos. Con los ids reales aparecieron los tres.
- Y el último: **jsPDF escapa los paréntesis** en el content stream, así que el marcador
  `'predominante ('` daba cero sobre un pie impreso. Ya había pasado con el encuadre orientativo.

Con los marcadores corregidos: **7 pies con la cohorte, 0 con n=2**, sobre un PDF de n=2 que sí
tiene contenido —si saliera vacío, el cero no probaría nada—.

## DAP y CoAo en el Laboratorio, y el motor de fichas que reemplaza al copiar-pegar

### `CC_FICHAS` — una fila por cardiopatía, no una función por cardiopatía
`_labShuntResumen` era un cuerpo con un `esCia ? … : …` en cada línea. Con doce CC eso se vuelve
una cascada de ternarios ilegible, así que pasó a `_labCCResumen(infs, k)` leyendo `CC_FICHAS`:
predicado de pertenencia, campo de tipo, campo de tamaño, **métricas** promediables, **proporciones**
con denominador propio, lista de conductas y clasificador. Agregar una CC es agregar una fila —el
PDF y el PPT la recorren sin tocarse—. Las ocho que faltan son ocho filas.

Una clave que el clasificador devuelve y la ficha no lista se **cuenta aparte** (`otras`) en vez
de silenciarse: si aparece, la lista quedó vieja respecto del clasificador y hay que enterarse.

### Los criterios NO se escribieron: salen del clasificador que firma el informe
- **CoAo ya publicaba clases de indicación ESC 2020** — `indicacion_i`, `iia`, `iib`,
  `sin_indicacion`, `limitrofe`—. El Bloque D es contar `coaConclusion(src).clave`. No hubo nada
  que inventar. `significativa` / `no_significativa` quedan como **filas propias** y no se funden
  con las clases: TC-113 ya fija que la indicación sale del **pico-pico invasivo**, no del Doppler.
- **DAP publica FISIOLOGÍA, no conducta.** De sus siete ramas, sólo tres traen conducta explícita
  (`htp` → evaluar operabilidad antes de indicar cierre; `grande` → considerar cierre; `silente` →
  no requiere cierre). En `moderado` y `pequeno` la app describe la repercusión y no indica nada.
  La columna de criterio **lo dice** en vez de completar el hueco con una conducta que el informe
  individual no afirma. TC-172 lo vigila.

### El enabler quedó cerrado: toda la cadena del Qp/Qs es source-aware
`eteQpQs(src)`, `ccShuntsConDatos(src)` y `ccQpQsDe(cual, src)`, y con eso `dapConclusion(src)`,
que era lo que lo tenía pendiente. Los **alias** de ids viejos (`ete_shunt_tsvd`,
`ete_shunt_vti_tsvd`) se mudaron a `eteQpQs` y **`_ccQpQs` ahora delega**: era una segunda
implementación del mismo cociente con su propia lista de alias. `_ccQpQsAtrib` delega en
`ccQpQsDe` y `_ccShuntGruposDe` en `ccShuntsConDatos`. Tres duplicados menos.
De paso: `eteQpQsMotivo` aparecía en mi auditoría como dependencia DOM de `dapConclusion` y era
un **falso positivo** — sólo figura en un comentario. Auditar por `grep` sobre el cuerpo cuenta
también lo que está comentado.

### Dos asertos vacuos en el mismo caso, otra vez
TC-171 comparaba `dapConclusion()` contra `dapConclusion(campos)` con el formulario y `campos`
cargados con **los mismos datos**: una función que volviera a leer el DOM daba idéntico y el
aserto pasaba. El segundo llamaba a `ccQpQsDe` directo, sin pasar por `dapConclusion`, así que
tampoco veía la mutación. **Las dos mutaciones dieron verde.**

Lo que sí prueba: un `campos` donde el Qp/Qs existe **sólo** en el objeto —el formulario de ese
caso nunca cargó `diam_tsvi` ni sus tres compañeros— y una rama donde el cociente **decide**.
Con `dap_tipo` consignado el tipo manda y vuelve a ser vacuo; sin tipo, un Qp/Qs > 2,2 da
`grande` y su ausencia da `moderado` por diámetro. Mutado: `conQ="moderado" sinQ="moderado"`.

**La regla, ahora con dos casos:** un aserto de equivalencia entre dos rutas no prueba nada si
las dos leen la misma fuente, y uno de sensibilidad no prueba nada si el valor que se mueve no
llega a cambiar el resultado. Hay que elegir el escenario donde el dato es el que decide.

### Verificado con datos reales
PDF: cuatro secciones —CIA, CIV, DAP, CoAo—, el encuadre **cuatro veces** (una por tabla), la
tabla de tres columnas con la guía al lado de cada conducta, CoAo con su Clase I por gradiente
invasivo y las filas Doppler separadas. PPT: **14 diapositivas**, una hoja por CC.
Con más de seis conductas —CoAo tiene diez— el paso de las filas se achica en vez de truncar la
lista: una conducta que no se muestra desaparece del denominador visible y el resto de los
porcentajes deja de sumar.

### Faltan ocho
VAP, FOP, VAB, Ebstein, MCH, MCA, TdF, TGA, Eisenmenger y Fontan. `vapConclusion(src)`,
`fopConclusion(src)`, `eisenEstado(src)` y `fontanEstado(src)` ya aceptan el estudio; las seis
restantes son el shim mecánico, sin helpers sucios. Después, una fila en `CC_FICHAS` cada una.

## Encuadre «sugerencia orientativa» en las tablas de conductas de CC

Texto, no lógica. La tabla de conductas agrupa por criterio ecocardiográfico; leída sin encuadre
—sobre todo proyectada— pasa por indicación terapéutica.

- **PDF**: una `_nota` propia inmediatamente debajo de cada tabla, antes del detalle
  metodológico. Van separadas a propósito: la salvedad médico-legal y el denominador son cosas
  distintas, y mezclarlas diluye la primera.
- **PPT**: línea en el pie, en el slot y con el rojo del disclaimer de amiloidosis y
  cardio-oncología. Dos advertencias del mismo peso con formatos distintos se leen como si una
  importara menos.

Hoy aplica a **CIA y CIV**, que son las dos únicas con tabla de conductas. Las otras doce todavía
no tienen sección ni hoja; cuando se agreguen, el encuadre va con ellas.

### Los acentos NO llegan al PDF — y por eso ninguna `_nota` los tiene
Se escribió la nota con acentos y se midió el content stream: sale «guias vigentes»,
«recomendacion clinica», «medico tratante». No es mojibake: `_labSanPDF` los despoja a propósito,
porque la helvetica/WinAnsi de jsPDF no los soporta —el mismo saneador que existe porque los
umbrales de severidad valvular salieron ilegibles en TODOS los PDF firmados—. Se devolvió el
fuente a ASCII: escribir acentos ahí no los hace aparecer, sólo hace creer al que lea el código
que aparecen. **En el PPT sí van acentuados** y se verificó que llegan intactos; PptxGenJS no
tiene esa limitación.

### El pie de una diapositiva es UNA línea
`conPie` dibuja su filete en `H-0.62`, así que el slot de contenido es `H-0.86` con alto `0.22`
—termina justo en `H-0.64`—. La hoja de CIA/CIV usaba `0.30` ahí y se metía debajo del filete.
Al entrar el disclaimer, la salvedad metodológica bajó a la columna izquierda debajo de las
barras y el paso de las filas del Bloque D se ajustó de `0.35` a `0.32` para no chocar.

### Cobertura
**TC-172** genera el PDF del Laboratorio con una CIA y una CIV y exige que el encuadre aparezca
**exactamente dos veces** —una por tabla— y que la frase entre completa: el texto envuelve en dos
líneas y buscar la oración entera de un saque da cero. Primero confirma que el PDF tiene páginas,
porque contar apariciones sobre un documento vacío da cero y parece un defecto.
Verificado por mutación: sin la `_nota`, el caso cae en «el encuadre aparece una vez por tabla»
con «0 veces». La corrida del mutante tarda bastante —genera el PDF con sus gráficos—; parece
colgada y no lo está.

## Las demás CC: el refactor que hay que hacer ANTES, y un clasificador a medias que casi sale

Para replicar el patrón de CIA/CIV en las otras doce cardiopatías hace falta que el Laboratorio
pueda correr **el clasificador que ya tiene la app** sobre un estudio guardado. La regla de no
definir criterios propios no deja la alternativa: reimplementar el umbral en el Lab produce dos
implementaciones que divergen, y lo que divergiría es una conducta clínica.

### El bloqueo real
`_labEstado(fn, inf)` llama `fn(inf.campos)`. De los doce clasificadores, **sólo `eisenEstado(src)`
y `fontanEstado(src)` aceptan el objeto**; los otros diez son `xxxConclusion()` sin parámetros y
leen el DOM. Auditados uno por uno, están casi limpios: siete no leen el DOM fuera de sus helpers
`sv2`/`nv`, y los sitios sueltos son cuatro —dos en `dapConclusion`, uno en `coaConclusion` (la
casilla) y uno en `fopConclusion` (la edad)—. El shim es el de `eisenEstado`: `src ? src[id] : …`,
con la rama sin `src` **literal** para no mover el informe firmado.

### Hecho en este turno
`vapConclusion(src)`, `coaConclusion(src)` y `fopConclusion(src)`. La coartación arrastró a sus
tres helpers —`coaNV`, `coaGmax`, `coaRatio`— que también leían el DOM; `coaBanda` es pura y no
se tocó. Cubierto por **TC-171**, que llena el formulario, arma `campos` con la convención de
`guardarInforme` (id del control, y el sufijo de casilla con '1') y exige que la conclusión sea
idéntica por las dos rutas.

### El clasificador a medias — lo que el test cazó
La primera versión del refactor dejó `coaConclusion(src)` llamando a `coaGmax()` y `coaNV()` sin
`src`. Resultado: los **selects** salían del estudio guardado y el **gradiente** del formulario en
pantalla. Un clasificador a medias mezcla dos pacientes y no lo dice — y el aserto de equivalencia
pasaba igual, porque en el test el formulario y `campos` tenían los mismos datos. Lo delató la
condición de la casilla, que sólo decide cuando el gradiente NO es concluyente.

Dos reglas que quedan:
- **Un shim en la función de entrada no alcanza**: hay que seguir la cadena de helpers. `src` que
  no se propaga es peor que no tenerlo, porque el resultado parece plausible.
- **Un aserto de equivalencia entre dos rutas no prueba nada si las dos leen la misma fuente.**
  El escenario tiene que ser uno donde el dato exista SÓLO en la ruta que se quiere probar.

### `dapConclusion` queda pendiente, revertida a propósito
No es un shim: depende de `ccQpQsDe` / `ccShuntsConDatos` / `eteQpQsMotivo`, y toda esa maquinaria
de atribución del Qp/Qs lee el DOM. El equivalente source-aware ya existe para el Laboratorio
—`_ccQpQsAtrib(i)`, del bloque de CIA/CIV—, así que el trabajo es unificar las dos, no parchear.
Se revirtió al estado commiteado para no dejar un clasificador a medias. TC-171 lo declara con un
aserto sobre su aridad en vez de afirmar una equivalencia que hoy sería vacua.

### Lo que falta para cerrar el pedido de las doce
1. `dapConclusion` + unificar la atribución del Qp/Qs.
2. Las seis limpias: `vab`, `ebs`, `mch`, `mca`, `tdf`, `tga` — shim mecánico, sin helpers sucios.
3. El motor genérico: una tabla de configuración con una fila por CC (predicado, campo de tipo,
   campo de tamaño, clasificador) que alimente PDF y PPT, para que agregar una CC sea un dato y no
   código nuevo. **Ninguna de las doce tiene todavía su sección ni su hoja.**

## CIA y CIV en el PDF y el PPT del Laboratorio — y cuatro criterios que no se implementaron como venían

Prototipo de estadística clínica por cardiopatía congénita: una sección del PDF y una hoja del
PPT para cada una, con demografía, distribución por tipo, características estructurales y
criterios terapéuticos. Un solo seam —`_labShuntResumen(infs, cual)`— alimenta las dos
superficies, que es la única forma de que «PDF ≥ PPT» signifique algo.

### Lo que ya existía y NO se reimplementó
`_ccSecPred('cia'/'civ')`, `_ccQpQs` (recalcula desde los cuatro campos guardados),
`colorBordeCIA()` con sus cuatro bandas, `_CIA_BORDES`, `vdBasCat()` + `VD_BAS_NORMAL_MAX`,
el corte de 32 mm/m² del DDVI indexado y `CC_SHUNTS`. Las dos listas que el Laboratorio habría
tenido que copiar —`CC_SHUNTS` y `_CIA_BORDES`— se **exportaron a `window`** en vez de
duplicarse; `_ccDdviIdx` subió de local de `labCCRender` a nivel de módulo por lo mismo.

### Los cuatro criterios del pedido que no se implementaron literales
1. **FOP no es un tipo de CIA.** Es entidad propia con su `fopArr`, y `CC_SHUNTS` lo excluye a
   propósito con su comentario. Como fila de la tabla de tipos se contaba dos veces contra un
   denominador que lo excluye. Queda fuera.
2. **Las tres conductas de CIA dejaban un hueco.** Borde de 4 mm —la banda *borderline* de
   `colorBordeCIA`— con Qp/Qs 1,8 no caía en percutáneo (pide ≥5), ni en quirúrgico (pide
   deficiente <3), ni en expectante (pide Qp/Qs <1,5). El `else` mudo otra vez. Se agregó fila
   propia, y otra de «no clasificable» para cuando falta el dato que decide.
3. **No había compuerta de contraindicación.** Un shunt derecha→izquierda o bidireccional con
   Qp/Qs 1,95 y bordes de 8 mm salía rotulado **«cierre percutáneo»**, que es donde el cierre
   está contraindicado. Se agregó fila propia evaluada PRIMERO, como el taponamiento en
   `popPatron()`. Verificado: ese paciente da `contra`, no `perc`.
4. **La indicación de cerrar se decide antes que la vía.** «Borde deficiente → quirúrgico»
   leído literal manda a cirugía una CIA de 6 mm con Qp/Qs 1,1 y VD normal, que no hay que
   cerrar de ninguna manera. La cascada evalúa primero si hay indicación (Qp/Qs ≥1,5 o
   sobrecarga de VD) y recién después elige vía. **Aprobada el 2026-09-18**: la cascada es la de
   la ESC 2020 —primero si hay indicación de cerrar, después por qué vía— y las dos superficies
   la citan así.

### Encuadre: sugerencia orientativa, no recomendación
Agrupar pacientes por criterio ecocardiográfico **no es indicar una conducta**, y una tabla
titulada «criterios terapéuticos» proyectada en una sala se lee como si lo fuera. El encuadre va
donde se lee primero, no en el pie: en el PPT como subtítulo rojo debajo del encabezado del
bloque, y en el PDF **en el título de la sección** y abriendo la nota, antes del detalle
metodológico. Quien lee un informe firmado no siempre llega al final del párrafo.

### El Qp/Qs del Bloque D respeta la negativa del informe individual
`_ccQpQs` no aplica la atribución de `ccQpQsDe`: con dos shunts documentados el informe firmado
se niega a atribuir el cociente y el Laboratorio lo atribuía igual. Para describir es discutible;
para **clasificar conducta** significa que el agregado afirma más que el informe del que salió.
`_ccQpQsAtrib()` aplica la misma regla y esos estudios salen del Bloque D —se declara cuántos y
por qué—, pero siguen contando en los Bloques A, B y C.

### Lo que no es computable y se dice en vez de simularse
- La **CIV no tiene campo de dirección del shunt** (cero ocurrencias de `ete_civ_dir`): su
  contraindicación se apoya sólo en el Qp/Qs < 1. Va en la salvedad.
- **«DDVI dilatado sin otra causa»**: un ecocardiograma no excluye las otras causas de VI
  dilatado. La fila de cierre indicado puede incluir estudios cuya dilatación tenga otro origen,
  y la nota lo dice.

### Tres denominadores vacíos en un mismo turno
El PDF de prueba salió con **0 páginas y 0 Tj**, y los diez chequeos dieron `false`. Ninguno
significaba nada: `_labFiltrarBase` filtra por **`inf.fecha_estudio`**, no por `inf.fecha`, así
que los cinco estudios sintéticos no llegaban al Laboratorio. Con el campo correcto: 7 páginas,
355 Tj y las dos secciones completas.
El PPT salió con **3 diapositivas** —sólo las fijas— porque el estado de las casillas «☐ PPT»
**no vive en el DOM**: `_labPptChkMarcadas()` lee `_labPptChkLeer()`. Tildar el `input` no
cambia nada. Con `_labPptChkSet()`: 12 diapositivas, con la hoja de CIA y sus criterios.
Y `seccionCIA:false` con la sección presente, porque **jsPDF escapa los paréntesis** en el
content stream: buscar `'Comunicacion interauricular (CIA)'` da cero.
Los tres son la misma lección y ya está escrita arriba: **confirmar que hay denominador antes de
contar**. Un `false` sobre una superficie vacía se lee igual que un defecto real.

### El caso que no probaba nada — y por qué salía verde
TC-170 se escribió pasando las condiciones como **cuarto argumento de `caso()`**. `caso()` toma
**tres** (`id`, `nombre`, `fn`): el cuarto se descartaba en silencio. Las condiciones van DENTRO
del objeto que devuelve el cuerpo —`extra: [[desc, ok, diag]]`, o `debe`/`noDebe`/`debeSuma`/
`noSuma`/`esperado`/`noEsperado`—, y sin ninguna de esas claves `evaluar()` no encuentra nada que
comprobar y devuelve cero fallos. **Verde vacío.** Pasaba igual sobre un mutante con la compuerta
de contraindicación removida, y se commiteó afirmando que «cubre la cascada».

Un verde vacío es peor que un rojo: ocupa el lugar de la cobertura que uno cree tener. Ahora
`evaluar()` **rechaza el caso que no declara ninguna condición**, con el mensaje que explica
dónde van. Corrida sobre los 185: ningún otro caso era vacío, así que era el único.

Dos cosas más que enturbiaron el diagnóstico y conviene no repetir:
- **`grep -c` que devuelve 0 sale con estado 1 y corta la cadena `&&`.** En la primera
  investigación, un `grep -c ... && ls && python3 …` se interrumpió en el grep que contaba las
  ocurrencias restantes del código mutado —cero, que era justo lo que se quería confirmar—, así
  que el canario nunca se aplicó y el `ls` nunca corrió. Pareció que el harness ignoraba la
  mutación. Para verificar una ausencia, `grep -c` va suelto o con `|| true`.
- El harness **sí** respeta la copia: `RAIZ = dirname(dirname(import.meta.url))`, así que correr
  `node /tmp/mut/scripts/test_clinico.mjs` sirve `/tmp/mut/index.html`. No hace falta pasarle la
  ruta —el argumento posicional se ignora— y no era ahí el problema.

### Mutaciones: tres, tres rojos
Con TC-170 reescrito, cada mutación cae en su condición y con el valor real en el diagnóstico:
- quitar `if (dir === 'di' || dir === 'bi') return 'contra'` → «el shunt derecha a izquierda se
  contraindica pese a bordes anchos», encontrado `perc`;
- colapsar la banda borderline en percutáneo → «el borde de 4 mm no se pierde», encontrado `perc`;
- quitar el `g.size > 1` de la atribución → «con dos shunts el Qp/Qs no se atribuye»,
  encontrado `1.953125`.

### Verificado con datos reales
PDF: 7 páginas, secciones de CIA y CIV, tabla de criterios a tres columnas con la guía al lado de
cada conducta, nota de atribución, PSAP y el aviso «COHORTE INSUFICIENTE» como primera fila.
PPT: 12 diapositivas, hoja por defecto, criterios con ESC 2020 GUCH y ESC 2023 GUCH.
El encuadre se verificó en los artefactos generados, no en el código: «SUGERENCIA ORIENTATIVA, NO
RECOMENDACION» en el título de la sección del PDF, la nota abriendo con él, y «Sugerencia
orientativa, no recomendación terapéutica» en la hoja del PPT.
Suite 185/185 · Semgrep 123 / 0 ERROR · sin huérfanos nuevos.

## POP — layout final (2×2 + fila completa) y un renombre que se llevó tres campos ajenos

Rediseño visual del subtab POP, sin tocar lógica ni seams. La grilla quedó
`repeat(2, minmax(0,1fr))` con `gap:10px`, el orden de DOM Contexto → Datos hemodinámicos →
Soporte → POCUS → Conclusión (`grid-column:1/-1`), `.pop-integrar-wrap` centrando el botón y
`.pop-pocus-grid` finalmente **aplicado al marcado** — estaba definido en el CSS del turno
anterior pero nunca envuelto alrededor del contenido, así que el POCUS salía a una columna en
escritorio. Medido a 1280 (dos columnas, subgrilla de POCUS en 2) y a 390 (una columna,
subgrilla en 1), sin scroll horizontal en ninguno.

### El centro del viewport no es el centro del contenido
La sonda dio `botonCentrado:false` en escritorio y `true` en móvil sobre un botón
perfectamente centrado. Comparaba contra `vw/2` = 640, pero el contenido de la pestaña arranca
en `left:176` por el rail lateral y mide 1088: su centro está en 720. La diferencia de 80 px
superaba la tolerancia de 40. **La referencia de una medición de centrado es el contenedor, no
la ventana** — en móvil coinciden y el error no se ve, que es lo que lo hace traicionero.
Tercera vez en la sesión que el defecto está en la sonda y no en el código.

### Un renombre por sufijo se llevó tres campos que no eran suyos
Para cerrar los huérfanos `pop_<k>_vel` del turno anterior renombré `_vel'` → `_veloc'` y
`_vel"` → `_veloc"` sobre el archivo entero. El sufijo no es exclusivo de POP: se llevó
**`eis_it_vel`** (velocidad de IT de Eisenmenger), **`ete_cia_vel`** y **`ete_civ_vel`** —
tres campos preexistentes del estudio, con columna de Excel y con destino clínico (el de CIA/CIV
alimenta el gradiente). Los estudios guardados con el nombre viejo habrían dejado de restaurar
ese campo, en silencio y sin error.

Lo atrapó el suite —«los 66 campos vuelven idénticos» marcó `eis_it_vel: NO VOLVIÓ (ida=4.6)`—
pero **sólo ese**: `ete_cia_vel` y `ete_civ_vel` no tienen caso que los cubra y salieron por
inspección de `grep -o "[a-z_]*_veloc"`. Reglas que quedan:

- Un renombre masivo se acota por **prefijo del módulo** (`pop_`), no por sufijo compartido.
- Antes de escribir, listar qué matchea: `grep -o` del patrón y mirar la lista completa. Son
  quince segundos y acá habría mostrado los tres intrusos de entrada.
- Después de escribir, listar qué quedó con el nombre nuevo y confirmar que **todos** pertenecen
  al módulo que se quería tocar.
- Un campo que viaja en el estudio y no tiene caso de ida y vuelta se rompe sin ruido. Los dos
  del ETE quedan como deuda de cobertura.

### Semgrep: el handler inline del calculador
El hallazgo 124 pendiente del turno anterior era `ceibo-interp-en-string-de-handler`: el botón
«usar» del calculador de dilución emitía `onclick="popDosisCopiar('<k>')"` con `k` interpolado
dentro del handler, donde `esc()` no protege porque el parser decodifica la entidad antes de
compilar. Reemplazado por el patrón que el archivo ya usa en `#pltz-grid`: `data-pop-usar` con
`escHtml()` y **un** listener delegado registrado una sola vez. Vuelta a 123 / 0 ERROR.

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

### ~~BLOQUEANTE~~ — CERRADO Y MAL PLANTEADO: los grados valvulares nunca están vacíos (2026-09-10)
> **Cerrado el 2026-09-16, y la premisa era equivocada.** Que los seis grados estén en todos los
> estudios **no es un defecto**: en este flujo el médico marca sólo lo que el paciente tiene, así
> que el valor de fábrica significa «valorada como normal» y el denominador del período es el
> correcto. Lo que estaba mal era el **rótulo**, que prometía un filtro inexistente — corregido en
> la pantalla y en el PDF de auditoría. Implementar lo que esta entrada pedía hizo que la
> insuficiencia mitral saliera «Sin: 0 %» sobre 95 estudios. Ver «No marcar una válvula es un
> HALLAZGO, no un campo vacío». Lo de abajo se conserva como registro de cómo se leyó mal.



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
(`tests/paciente_ficticio_completo.json`) enciende **dos** de las nueve secciones: estenosis mitral
y CIA.
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

### ~~Segmentos del ETE — la clave global de localStorage sigue teniendo un escritor~~
**CERRADO 2026-09-18, y la tapa no tapaba lo que importaba.** Esta entrada decía que la fuga
estaba cubierta porque `limpiarCampos` llama a `eteLimpiarSegmentos()`. Cierto y **insuficiente**:
ese llamado sólo corre en «Nuevo estudio», y la clave se leía **en el arranque**, que es el camino
de cada mañana. Medido en el navegador: con el paciente anterior marcado con flail en A1/A2/A3,
abrir EcoSmart de cero dejaba el diagrama pintado y el resumen diciendo **«🔴 Hallazgos: A1: Flail ·
A2: Flail · A3: Flail»** sobre un formulario en blanco. Ver la entrada de la fecha.

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
