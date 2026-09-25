# EcoSmart — trampas de este archivo

Leer esto antes de tocar `index.html`. Son cosas que ya costaron una sesión cada una;
ninguna es evidente leyendo el código alrededor.


## El diagrama del ETE mitral: EL PINTOR SE COMÍA LA ZONA DE TOQUE (2026-09-25)

Reportado como dos cosas —«en las proyecciones de arriba sólo se activa un segmento, los toques
siguientes no hacen nada» y «en modo Día las líneas de las valvas casi no se ven»—. Son **tres
defectos**, y ninguno estaba donde el reporte apuntaba: el oyente nunca se quita, y el problema de
contraste no era del tema.

### ⚠️ NO ERA EL OYENTE: ERA LA SUPERFICIE CLICKEABLE, QUE LA DESTRUÍA `eteClick`

Cada segmento de las cuatro proyecciones tiene **dos** trazos: la línea de la valva y un **clon
invisible de 22 unidades de ancho** que un `setTimeout(500)` agrega para poder apretarlo con el
dedo. `eteClick` pintaba `el.querySelectorAll("path,line")`, o sea **los dos**, y le escribía al
clon `stroke-width: 4` —o se lo sacaba entero en la rama «Normal», que deja el 1 de fábrica—.

| | ancho de la zona de toque |
|---|---|
| al abrir la app | 22 unidades ≈ **20 px** |
| tras el primer toque | 4 ≈ **3,5 px** |
| tras «Limpiar» | 1 ≈ **0,9 px** |

Primer toque perfecto, y de ahí en más el segmento es inalcanzable con un dedo. **La vista
quirúrgica no lo sufre porque sus segmentos son POLÍGONOS con relleno**: su superficie de toque no
depende del grosor del trazo, y por eso ahí «sí funciona bien y se pueden activar varios seguidos»,
que es exactamente lo que decía el reporte.

Hoy hay **`ETE_SEL_TRAZO = "path:not(.ete-hit),line:not(.ete-hit)"`**, una constante, y la usan las
tres funciones que recorren un grupo. **El pintor no puede tocar lo que hace clickeable al
segmento.**

### ⚠️ Y LA TAPA `square` DEL CLON LE ROBABA EL PUNTO MEDIO AL VECINO

Segundo robo, encontrado midiendo y no leyendo. El clon heredaba `stroke-linecap: square` del
dibujo, y esa tapa **estira el trazo media anchura MÁS ALLÁ de cada extremo**: con 22 de ancho son
**once unidades dentro del segmento contiguo**, que en estas proyecciones mide entre 21 y 26. O sea
que la banda del vecino llega siempre más allá de la mitad del otro.

Medido punto por punto sobre los trece segmentos, muestreando del 5 % al 95 % del trazo:

| | con `square` | con `butt` |
|---|---|---|
| `valve-A3` | **11/19** — A2 se come siete, el centro incluido | 19/19 |
| `valve-P1` | **11/19** | 19/19 |
| `valve-P3-bc` · `valve-P1-bc` | 15/19 cada uno | 19/19 |
| `valve-A1` | **9/18**, y A1 sólo existe en la 2 cámaras | 18/18 |

Apuntarle al medio de A3 activaba A2. Hoy el clon lleva `butt` —y `stroke-linejoin: round`, que
hoy no cambia nada porque los trece son un `M…L…` de dos puntos, pero el día que uno tenga un
vértice el `miter` de fábrica dispara la misma punta por la otra puerta—.

**Contrapartida declarada:** `butt` abre una zona muerta donde dos segmentos **no comparten
vértice**. En la bicomisural, `valve-P3-bc` termina en `(71,85 · 95,14)` y `valve-A2-bc` arranca en
`(75,71 · 95,14)`: **3,86 unidades** que la tapa cuadrada cubría, mientras le robaba la punta a P3.
Ahí un toque ahora no hace nada en vez de activar el segmento equivocado. Es la dirección correcta
—falla cerrado— y nadie lo va a reportar como defecto.

### ⚠️ LAS LÍNEAS DE VALVA NO ESTABAN «POCO CONTRASTADAS»: NO TENÍAN COLOR, EN LOS DOS TEMAS

Tercer defecto, y el reporte lo leyó como un problema de modo Día porque ahí es donde se nota.
El color de fábrica vivía en el `style` **en línea** del path —`stroke: #e2e8f0; stroke-width: 2.5`—
que es **el mismo bloque de declaración que `eteClick` escribe al pintar la lesión**. Así que su
rama «Normal», que es un `removeProperty`, no sacaba un override: **borraba el color de fábrica**.
Y el arranque llama a `eteSegSync` → `eteClick` con v = 0 para los seis, o sea que los trece
segmentos quedaban en **`stroke: none` en cada carga de la app**.

Medido: `computed stroke: none` en modo Noche y en modo Día. Las líneas de las valvas no se veían
**nunca**; de noche el resto del dibujo —`#e2e8f0` sobre la tarjeta oscura— sí, y eso hacía que
pareciera un problema de contraste de una sola parte.

Hoy en los trece el color base va como **ATRIBUTO de presentación** (`stroke="currentColor"
stroke-width="2.5"`), que pierde contra el estilo en línea mientras hay lesión y **reaparece solo**
cuando `eteClick` lo saca. Es la única forma de que `removeProperty` signifique «sacá el override»
y no «borrá todo».

**Hay un assert de arranque que lo vigila**, porque si no la regla vivía sólo en un comentario: la
salida de matplotlib —que es de donde vienen estas cuatro proyecciones— usa la forma contraria, así
que pegar un segmento nuevo se ve **perfecto** y falla al sexto toque, cuando el ciclo vuelve a
«Normal» y el segmento desaparece del diagrama para siempre, sin error y sin consola. El assert
mira el **atributo** y no el `style`: es el invariante, y además es inmune al momento en que corra
—con un estudio restaurado los segmentos con lesión sí tienen `style.stroke` escrito—.

### El contraste: `currentColor` + una variable por tema

Las cuatro proyecciones son SVG de matplotlib con **89 trazos** de color cableado en `#e2e8f0`, un
gris casi blanco: sobre el fondo de la tarjeta en modo Día —blanco puro— eso es **1,2:1**. No sólo
las valvas: los contornos del ventrículo y **las letras A1/A2/P1…**, que es lo que dice qué segmento
es cuál. Hoy todos dicen `currentColor` y el color lo pone `.ete-proy { color: var(--ete-traza) }`.

Medido: **13,8:1 de noche y 10,35:1 de día**. Los dos valores están elegidos para que la traza pese
lo mismo en los dos temas; `var(--text)` habría dado 15,5:1 en claro y el dibujo se vería más
cargado de día que de noche.

**El color de la LESIÓN no sigue al tema, y hay una condición que lo fija:** ámbar, rojo, azul,
violeta y verde son los mismos en los dos, porque los pone `eteClick` inline.

### ⚠️ LA VISTA QUIRÚRGICA TIENE LA CONVENCIÓN CONTRARIA, A PROPÓSITO

`eteQxDataURL` —el único camino por el que un diagrama del ETE mitral llega al PDF firmado— decide
qué imprime con `el.style.fill` / `el.style.stroke`. Los `ete-qx-*` ya llevan `fill="transparent"`
y `stroke="none"` como **atributos**, así que «hacer lo mismo que arriba» haría que la hoja firmada
saliera con **la válvula en blanco** mientras la pantalla se ve perfecta. Los dos bloques lo dicen
en su comentario. Las proyecciones **no van al PDF por ningún camino** —verificado—.

### Declarado y sin hacer

- **Ctrl+P en modo Noche imprime el diagrama en blanco.** El navegador conserva el color y descarta
  el fondo. Antes fallaba en los dos temas; ahora falla en uno solo, que es **más difícil de
  notar**. Un `@media print` sobre `--ete-traza` arregla las cuatro proyecciones y deja la vista
  quirúrgica igual de invisible, porque aquélla dibuja con `var(--text)`: el arreglo entero es otra
  tarea.

  **⚠️ NO TOCA AL INFORME CLÍNICO, y está MEDIDO, no razonado.** Es exclusivo del Ctrl+P del
  navegador sobre la página cruda — que además nunca fue una forma de emitir un informe: el
  comentario de `generarPDFReal` dice que `window.print()` se descartó porque «capturaba la
  interfaz entera», y la única aparición de `window.print` en el archivo **es ese comentario**.
  Lo verificado, con el estudio cargado y tres lesiones sembradas:

  | | |
  |---|---|
  | las cuatro proyecciones en el PDF | **no entran por ningún camino**: fuera de su declaración, lo único que las nombra es la regla `.ete-proy` — cero lectores en JS |
  | el único diagrama del ETE que llega al papel | la **vista quirúrgica**, por `eteQxDataURL` |
  | ese PNG en los dos temas | **byte por byte idéntico** (huella `48aad5e2`, 67.734 caracteres) — lo dibuja un canvas con fondo `#ffffff` y tinta `#1f2937` cableados, y los colores de lesión salen de `ETE_FILL`/`ETE_STROKE`, que son hex fijos |
  | el PDF entero en los dos temas | **2.429.400 bytes idénticos**; lo único que difiere es el `/ID` del trailer |
  | control | **dos PDF del MISMO tema también difieren en ese `/ID`** — o sea que la diferencia es del identificador de archivo, no del tema |

  **Ojo al repetir esta medición:** buscar los bytes del PNG dentro del PDF da **falso negativo**,
  porque jsPDF re-comprime la imagen. Con eso salía `qxDentroDelPDF: false` sobre un PDF que sí la
  llevaba, y «los dos temas dan igual» habría sido igualdad de ausencia. Lo que sirve es
  interceptar `addImage` y comparar el dataURL que recibe.
- **`currentColor` no sobrevive a serializar el SVG suelto.** Hoy nadie lo hace, pero `_svgToPng`
  es el patrón que alguien copiaría para meter las proyecciones en el PDF. Y ojo: las cuatro
  comparten ids de glifo, así que extraer **una sola** pierde las letras, que viven en la de 4
  cámaras.
- **Las proyecciones y la vista quirúrgica tienen dos grises distintos en modo Día** (`#334155`
  contra el `var(--text)` de la qx). De noche son indistinguibles.

### TC-252, y las cinco mutaciones

**El clic sintético cae en el punto geométrico EXACTO, así que acierta aun sobre una línea de
2,5 px: con el dedo puesto en el medio matemático el defecto NO se reproduce.** Por eso el caso
toca **7 unidades al costado** de la línea — holgado dentro de la banda de 22, que llega a once de
cada lado, y muy afuera de los 4 px a los que el defecto la encogía. Sin eso, la condición de los
tres toques seguidos pasaba con el defecto puesto y lo único que lo cazaba era el ancho medido.

Las cinco, cada una en su condición: el selector de vuelta a `path,line` (cae por cinco, con
«NO LLEGO» en los tres toques), la tapa cuadrada de vuelta (imprime `valve-A1 lo toma
valve-A2-2ch`), el color base de vuelta al `style` en línea (`none 1px`), el modo Día con el color
de noche (**1,23:1**) y los rótulos de vuelta al gris cableado (1,23:1, con la proyección nombrada).

**Y el caso mide TRES testigos por tema, no uno.** Con sólo el path de la valva —que toma el color
de un atributo— revertir los 76 trazos del `style` en línea, **rótulos incluidos**, dejaba el caso
en verde: el diagrama sin decir qué segmento es cuál sobre la tarjeta blanca, que es la parte
clínicamente portante de la figura.

### ⚠️ TC-252 PASABA CON `--solo` Y FALLABA EN EL SUITE — y el culpable era otro caso

Los trece segmentos aparecían «robados» por `B[static]<SPAN<DIV<DIV<`**`DIV#lab-imp-modal[fixed]`**.
TC-131 abre la vista previa del import de Excel con `labImportarXLSX(file)` y **nunca la cerraba**:
es `position:fixed` sobre todo el documento, así que los ~130 casos siguientes venían corriendo
debajo de él. Ninguno lo notaba porque ninguno medía geometría.

Se cerró en los dos lados: `labImpCerrar()` en TC-131, que es donde se abre, y en **`__t.resetVisor()`**
junto con `cerrarAvisoEco()`, por el mismo argumento que todo lo demás —con una línea por caso, el
que se olvide hereda el estado del anterior—.

**Lo resolvió una corrida, porque el diagnóstico nombra la CADENA de ancestros con su
`position`.** Es la lección de `#ig-lista-view` aplicada: un diagnóstico que dice dónde está el
intruso cuesta una corrida; una hipótesis cuesta varias. Y desde ahora un intruso `position:fixed`
cae en el **DENOMINADOR** de TC-252, con su nombre, en vez de disfrazarse de defecto del diagrama.

### Dos trampas propias, las dos ya escritas en este archivo

- **El backtick dentro del cuerpo de un caso: van OCHENTA**, otra vez en un comentario recién
  escrito —el que explica la suposición de la función de luminancia—.
- **Y un comentario mío volvió a romper el bloque `<script>` entero**: al reemplazar el bloque del
  assert, el párrafo nuevo quedó **después** del `*/` y el bloque 8 —donde vive `CeiboStore`— dejó
  de parsear con `Unexpected identifier 'mira'`. El chequeo comparado contra HEAD lo caza en
  segundos; leer el diff, no.

### `tresDistintos` podía pasar con dos de los tres toques muertos

El prefijo `NO LLEGO` se fundía con el color, así que fallo/ok/fallo daba tres cadenas distintas.
Hoy la condición exige primero que **los tres hayan llegado**. Lo encontró `/sharp-edges`; el caso
funcionaba hoy y estaba a un refactor de mentir.


## El botón 🫀 CC abre un CUADRO PROPIO (2026-09-24, cuarta decisión de la jornada)

Decisión de Maicol, y **resuelve de raíz lo que las dos versiones anteriores parchaban**. El
template ya no vive dentro de `informe_texto`: vive en `#cc_segmentario`, un `<textarea>` propio
dentro de `#cc-seg-wrap`, arriba del informe. El botón es un **toggle**: primer toque abre con el
template cargado, segundo cierra y **descarta** sin preguntar.

### Por qué cambió, y por qué NO hubo que tocar `generarInforme`

«Generar Informe» y las tres pastillas de estilo son regeneraciones **explícitas** —`_infEscribir`
con `silencioso=false` hace `lineasNuevas.slice()`— así que reescriben `informe_texto` entero y se
llevaban el template. En un campo propio eso es **imposible por construcción**: no comparten
textarea. Medido el aislamiento por los tres caminos, incluido el que la versión anterior no podía
cerrar —con el estudio reabierto, un refresco silencioso de VEXUS o Pericardio hacía que
`_infMerge` descartara el párrafo sin una palabra—.

### El `id` es lo que da las tres columnas gratis

`guardarInforme` barre `textarea[id]` y lo guarda en `campos`; `limpiarCampos` barre `textarea` y
lo vacía; las rutas de restauración lo reponen con el barrido genérico. El prefijo `cc_` no está
en `_CAMPOS_FUERA_DEL_ESTUDIO`. Por eso es un `<textarea>` con id y no un div editable.

### ⚠️ LA VISIBILIDAD SE DERIVA DEL CONTENIDO, y por eso cerrar DESCARTA

Con una bandera persistida aparte, «cerrado» y «tiene texto» pueden discrepar, y la discrepancia
es muda en las dos direcciones: un campo oculto CON TEXTO que `guardarInforme` guarda y el PDF
imprime es la fuga de los `input[type=hidden]` que este archivo documenta tres veces. Derivada no
puede pasar. **No existe el estado «cerrado con contenido».**

`ccSegSync` corre en **cuatro** momentos y los cuatro hacen falta: `RECALC_MODULOS` (restauración),
el final de `limpiarCampos` (que no pasa por ese embudo), el `onchange` del textarea, y el
**arranque** —`_autosaveRestore` tiene tres salidas tempranas, así que en un recargar donde el
navegador restaura el formulario solo, nadie repintaba—.

**`onchange` y NUNCA `oninput`**: colgado del `input`, un Ctrl+A + Supr esconde el cuadro con el
cursor adentro, a mitad de la edición. Es la misma razón por la que `_refrescarInformeSiGenerado`
va en `onchange`.

### ⚠️ `[hidden]` NO ESCONDÍA NADA — tercera vez, y la primera que un caso lo dejó pasar

`.fg { display:flex }` vive en la hoja del **autor** y `[hidden]{display:none}` en la del
**navegador**, que pierde siempre. Medido: `hidden === true`, `display: flex` y **156 px de alto
real** — el cuadro se dibujaba en todos los estudios, con su label y su placeholder, y
`ccToggleSegmentario` decía por toast «cerrado» sobre algo que seguía en pantalla.

**Y TC-217 pasaba EN VERDE**, porque medía `w.hidden === true` en vez de
`getComputedStyle(w).display`. Este archivo ya tenía escrita la regla —«en los casos, medir
`getComputedStyle(...).display`, no el atributo»— desde el banner de versión, y aun así. Hoy hay
`.fg[hidden]{display:none}` junto a las otras tres reglas de rescate, el caso mide las dos cosas
—el estilo **y** el atributo, porque de ése cuelga el lector de pantalla— y la mutación que borra
la regla cae por **cuatro** condiciones.

### ⚠️ `sv()` NO TRIMEA Y `ccSegSync` SÍ: dos predicados sobre el mismo campo

Con `cc_segmentario` en `"\n   "` —un Enter que quedó al borrar a mano, un pegado desde Word— el
cuadro se escondía en pantalla, el detalle de Guardados y el PPT lo omitían, y **el PDF firmado
imprimía la barra «ANALISIS SEGMENTARIO» con un párrafo vacío debajo**. Es el campo oculto que el
PDF igual imprime, entrando por la diferencia entre dos maneras de preguntar lo mismo. Un solo
predicado: `sv('cc_segmentario').trim()`. La mutación imprime `escondido=true barraEnPDF=true`.

### El PDF: bloque propio, no concatenado

Se dibuja con `drawBar('Analisis segmentario')` justo **antes** del bloque `15-16. INFORME`, con el
mismo estilo de párrafo. Bloque propio y no pegado al narrativo porque internamente son dos campos
y fundirlos haría que el documento diga una cosa y el formulario otra.

- **El título no se agrega a las ocho plantillas de `_TBL`**: se pasa literal y `drawBar` resuelve
  el resto —`barUpper` lo pone en mayúsculas donde la plantilla lo pide—. Una clave nueva serían
  ocho ediciones para un texto que ninguna plantilla necesita variar.
- **Va sin acento a propósito.** `drawBar` dibuja con `doc.text` **directo**, la única ruta sin
  saneador — es cómo los umbrales de severidad valvular salieron ilegibles en todos los PDF
  firmados. El papel dice «ANALISIS SEGMENTARIO» y la app «Análisis segmentario», igual que
  `drawBar('TECNICA Y SEDACION')`.
- **Está del lado correcto del `if (_AJ.medir) return`**: cuenta como cuerpo y lo comprime la
  escalera A4, igual que el informe.
- **En el PDF los placeholders salen `Septum interauricular:.....`, sin el espacio.** `amiloSanPDF`
  tiene `.replace(/\s+([.,;:)])/g, '$1')` —quita el espacio delante de un signo— y estos empiezan
  con punto. Se declara en vez de special-casear un saneador del que dependen 70.000 líneas.

### Dos superficies más, y se agregaron aunque el pedido hablara sólo del PDF

`verDetalleInforme` y la diapositiva del informe del PPT. Sin eso, la app mostraría un estudio
guardado **sin** la sección que el PDF de ese mismo estudio imprime — una superficie que esconde lo
que otra firma. En el PPT va rotulada y separada por un renglón, no fundida.

### El formato: UNA LÍNEA POR ORACIÓN, con guion (2026-09-24, quinta decisión de la jornada)

Decisión de Maicol. Era un párrafo corrido con puntos seguidos; hoy el encabezado va solo y cada
segmento en su renglón con «- ». **Ninguna oración cambió una palabra**: sólo dónde cortan y la
mayúscula inicial del situs.

**LOS SALTOS SON `\n` REALES Y LAS TRES SUPERFICIES LOS CONSERVAN POR MOTIVOS DISTINTOS**, así
que no hay una sola pieza a la que mirar si alguna vuelve a salir corrida:

| | qué lo sostiene | qué pasa si se toca |
|---|---|---|
| **PDF** | `amiloSanPDFml` sanea línea por línea y `splitTextToSize` parte por salto | `amiloSanPDF` a secas los BORRA —su catch-all `[^\x20-\xFF]` incluye el `\n`— y el bloque sale completo, legible y en un párrafo |
| **detalle de Guardados** | `white-space:pre-wrap` en el contenedor | el HTML los colapsa a un espacio, sin ningún error |
| **PPT** | `_pptTxt` deja pasar el 0x0A… | …**pero la pieza que decide ahí es otra** — ver abajo |

**⚠️ EN EL PPT EL SOSPECHOSO NO ES `_pptTxt`, ES EL PARTIDOR.** La diapositiva del informe hace
`texto.split(/\n+/)` y reensambla con **un solo** `\n`, así que el renglón en blanco que separa el
bloque del narrativo **no llega nunca** y cada ítem pasa a ser un párrafo propio para el
acumulador. Dos consecuencias: la primera línea del informe queda pegada debajo de
«- Septum interventricular: .....» y se lee como un **noveno ítem** de la lista, y la lista se
puede cortar entre diapositivas por cualquier bullet. **Las dos son PREEXISTENTES** —ese partidor
no se tocó— y la primera se **agravó** con este cambio, porque antes el segmentario era prosa.
**Declarado y no corregido**: tocar ese partidor mueve la paginación de todas las diapositivas de
informe. Lo encontró `/sharp-edges`, no la lectura.

### ⚠️ EL `focus()` HACÍA QUE EL CUADRO ABRIERA MOSTRANDO SU ÚLTIMA LÍNEA

`focus()` deja el cursor al final y el navegador arrastra el scroll hasta él. Con el párrafo de
antes no se notaba; con nueve renglones el contenido mide 141 px en una caja de 90 y **lo primero
que veía el médico era «- Arco aórtico izquierdo.»**, con el encabezado fuera de vista: se lee como
si el template empezara a la mitad. Se fija `setSelectionRange(0,0)` **antes** de enfocar, que es
lo único que cubre todos los anchos —a 375 px las líneas envuelven a 242 px y el scroll vuelve
igual—. El caso mide la **selección** y no el `scrollTop`: aquélla la fija el código
explícitamente, mientras que el desplazamiento lo decide el navegador y en un harness sin pintar
puede dar 0 por casualidad, o sea una condición que pasa sin probar nada.

### ⚠️ UN `min-height` SE MIDE EN EL BREAKPOINT MÁS ANCHO, NO EN LA VENTANA QUE UNO TIENE DELANTE

Hay dos media queries que **suben** el cuerpo del textarea —13,5 px desde 1400 y 14 px desde
1920—, así que los mismos nueve renglones miden **141, 161 y 165 px** según el monitor. Puse 150
midiendo en la ventana angosta del preview, y **en un escritorio de verdad la caja volvía a nacer
con scroll sobre su propio texto de fábrica**. Lo cazó `/sharp-edges` leyendo las media queries y
se confirmó midiendo a 1500 y a 1920. Hoy son **170**. Al tocar el texto o esas media queries,
medir a 1920.

### El «- » inicial es seguro HOY porque el campo no sale a ninguna tabla

Auditado, no supuesto: `cc_segmentario` no está en `LAB_XLS_MAP`, ni en `_IG_SECTIONS`, ni en el
exportador DICOM, y los dos parsers por marcador del archivo —`amiloPreview` y
`amiloDibujarSecciones`, que reconocen `##` y `!!`— operan sobre `am-txt-*`. **El día que entre a
un export CSV, un renglón que empieza con `-` es una FÓRMULA para Excel**, y `_csvCell` —lo único
que neutraliza `^[=+\-@]`— **no tiene un solo llamador**: no hay red puesta.

### La condición del PDF contaba guiones en TODO el documento

`R.pdfConGuion` sobre la lista entera de objetos de texto **se pondría en rojo con el bloque
perfectamente impreso** el día que el estudio de prueba integre HFA-PEFF o cardio-oncología: los
dos emiten renglones con `'- '`. Y `amiloSanPDF` normaliza las rayas largas a `-`, así que
cualquier renglón que hoy empiece con raya también contaría. Se cuenta **entre la barra del bloque
y la del INFORME**, que es lo que el caso ya tenía calculado. Lo encontró `/sharp-edges`.

**Y el backtick dentro del cuerpo de un caso volvió a entrar** —van SETENTA Y NUEVE—, otra vez en
el comentario que acababa de escribir, el que explica justamente esto. `node --check` lo caza
apuntando a la línea del `caso(`.

### Tres mutaciones, cada una en su condición

Volver al párrafo corrido (cae por cuatro, con el párrafo entero en el diagnóstico), el PDF
saneando con `amiloSanPDF` en vez de `amiloSanPDFml` —que es la que importa: **la pantalla queda
perfecta y sólo el papel colapsa**— y quitar el `setSelectionRange`, que imprime
`selectionStart=581`.

**Medido en el PDF real**: el bloque imprime nueve objetos de texto, ninguno envuelve —el ítem más
largo entra en una línea— y el documento sigue en **una hoja** con y sin el cuadro, así que el
cambio no empuja la escalera A4.

### El texto: cuatro segmentos y DOS placeholders que no afirman nada

Fuente: **Corbett L, Forster J, Gamlin W, et al. Echo Res Pract 2022;9:10** (BSE), Tabla 4 —un
informe de ejemplo con la redacción de cada segmento normal—.

**Los dos septum van con puntos suspensivos y SIN estado.** La Tabla 4 dice «Atrial septum intact»,
y acá eso sería una afirmación que la app **contradice en el mismo informe firmado**: el emisor de
CIA/CIV publica «CIA. Tamaño 18 × 4 mm…» y el del foramen «Foramen oval permeable». Como
placeholder no afirma nada. **Y el ductus se sacó por completo** —ni afirmación ni placeholder—
porque su emisor publica «Ductus arterioso permeable…». Por lo mismo se fueron los «no dilatada»:
el tamaño de las cámaras tiene sus propias líneas, que llevan el número que las sostiene.

«Al menos tres venas pulmonares» es lo que dice la guía: en un transtorácico de adulto las cuatro
rara vez se demuestran.

### Once mutaciones, diez en su condición y una declarada

Volver a insertar en `informe_texto`, cerrar sin descartar, el PDF sin el bloque, el bloque
**después** del informe (`seg=34 informe=23`), ductus de vuelta en el texto, «íntegro» de vuelta en
los septum, sin la columna de `limpiarCampos`, sin la de `RECALC_MODULOS`, sin la regla
`.fg[hidden]` y el PDF sin `.trim()`.

**La que sobrevive está declarada**: sacar el `ccSegSync` del arranque. El harness recarga la
página y el caso llama a `__t.limpiar()`, que sincroniza; el escenario que esa línea cubre —el
navegador restaurando el formulario solo en un recargar— no se puede producir desde el harness.

### Lo que queda declarado y sin hacer

- **`cc_segmentario` no está en `LAB_XLS_MAP`**, así que no viaja al Excel del Laboratorio ni
  vuelve de una reimportación. Es consistente con pericardio y POP; queda como decisión, no olvido.
- **Cerrar no pide confirmación aunque el médico haya editado**, y no hay deshacer: asignar
  `.value` por código no deja entrada en la pila del textarea. Es decisión explícita de Maicol
  —campo aislado, bajo riesgo— y se aparta del patrón de `resetETTConfirmar`.


## ~~El botón 🫀 CC es un INSERTO DE TEXTO FIJO~~ (2026-09-24) — SUPERADA el mismo día

> **⚠️ SUPERADA POR LA ENTRADA DE ARRIBA.** El template ya no se inserta en `informe_texto`: vive
> en un campo propio. Lo que sigue vale para entender **por qué** se cambió —los tres caminos que
> reescriben el informe, medidos— y para el texto, que es el mismo salvo los dos septum. Todo lo
> que habla de insertar en el cursor, de `_ccUltimoFoco` o de la selección describe código
> ELIMINADO.

Simplificación decidida por Maicol, y **revierte casi todo lo que la entrada de abajo describe**.
El botón no lee datos, no decide si mostrarse, no combina hallazgos y no tilda ninguna casilla:
**inserta `CC_TEMPLATE_SEGMENTARIO` y nada más**, y está SIEMPRE visible.

Se eliminaron `_ccFormComoEstudio` —el Proxy que hacía pasar el formulario por un estudio
guardado—, `_CC_CHK_EXCEP`/`_ccChkId`, `_ccAssertChks`, `_ccTieneDatosEnPantalla`,
`_ccGruposDeSecciones`, `ccSeccionesConDatos`, `ccIntegrarSync` —con sus dos columnas,
`RECALC_MODULOS` y `limpiarCampos`— y `ccIntegrarTodas`. **`_CC_SECS` NO se tocó**: es la
clasificación del Laboratorio, del filtro de cohorte, del PDF de auditoría y del PPT, y nunca fue
de este botón. Hay una condición de TC-217 que lo vigila —19 claves y `_ccSecPred` viva—, porque
borrarla «de paso» es el riesgo de esta simplificación.

### CONSECUENCIA DECLARADA: el atajo para tildar varias secciones DESAPARECE

Integrar una sección de CC al informe vuelve a ser el «📎 Integrar» de cada sección, como antes
del 2026-09-21. No es un olvido: el botón pasó a contestar otra pregunta.

### ⚠️ EL ORDEN IMPORTA, Y ESTÁ MEDIDO — el pedido describe el que pierde el template

| | |
|---|---|
| insertar el template y DESPUÉS «Generar Informe» | **el template SE PIERDE** |
| «Generar Informe» y DESPUÉS insertar el template | sobrevive |

«Generar Informe» es la regeneración **explícita**: `_infEscribir` con `silencioso=false` hace
`lineasNuevas.slice()`, o sea reescribe el informe entero. **Ojo con la premisa del pedido**: dice
que eso «ya se corrigió en el commit anterior». No es así — lo que se corrigió fue la llamada del
BOTÓN a `generarInforme`, no `generarInforme`. Esa corrección vivía dentro de `ccIntegrarTodas` y
se fue con él; `generarInforme` explícito siempre fue destructivo y sigue siéndolo, a propósito.

No se tocó, por pedido explícito. **El botón lo DICE en su toast** en vez de dejar que el médico
lo descubra con el informe ya escrito, y TC-217 fija el comportamiento como CONOCIDO —no como
deseable— para que el día que alguien lo cambie se entere de que este caso lo daba por cierto.
**DUDA DECLARADA**: si molesta, la salida limpia es que el template viaje como una sección más
—un campo propio que `generarInforme` reemita—, no que el botón aprenda a defenderse.

### El texto se cotejó, no se redactó de memoria

Fuente: **Corbett L, Forster J, Gamlin W, et al. «A practical guideline for performing a
comprehensive transthoracic echocardiogram in the congenital heart disease patient: consensus
recommendations from the British Society of Echocardiography». Echo Res Pract 2022;9:10**
(doi:10.1186/s44156-022-00006-5), cuya **Tabla 4 es un informe de ejemplo** con la redacción de
cada segmento normal. La ESC 2020 de congénitas del adulto (Baumgartner, EHJ 2021;42:563)
recomienda el análisis segmentario secuencial como parte integral de la evaluación; «conexiones
concordantes» es la nomenclatura de Anderson, y las fuentes en español la usan igual.

**⚠️ «AL MENOS TRES VENAS PULMONARES» NO ES UNA TIBIEZA**: es lo que dice la guía, porque en un
transtorácico de adulto las cuatro rara vez se demuestran. Escribir «las cuatro venas pulmonares»
afirmaría una demostración que el estudio no suele tener. Hay una condición que lo fija por los
dos lados, y la mutación que lo cambia cae por dos.

**Registro: «aurícula» y «auriculoventricular»**, que es lo que usa el resto del archivo —73
contra 2, y 26 contra 0—. La literatura en español admite «atrio»/«atrioventricular»; lo que un
informe firmado no puede es usar las dos.

**Y es una afirmación DEL MÉDICO, no de la app**, que es lo único que hace aceptable un texto
fijo. Un template que se insertara solo sería «un default tranquilizador es una afirmación»:
describiría un análisis segmentario completo que nadie hizo. Acá lo inserta un gesto deliberado
sobre un paciente que el médico ya sabe que no tiene TGA corregida ni conexión venosa pulmonar
anómala, que son las dos condiciones de la app que alteran conexiones de verdad.

### ⚠️ EL `/sharp-edges` ENCONTRÓ CUATRO, Y EL PRIMERO BORRABA TEXTO DEL MÉDICO

- **LA INSERCIÓN SE COMÍA LA SELECCIÓN.** Escrito con `selectionStart`/`selectionEnd` como par
  —que es el idioma de «insertar en un textarea»— el rango seleccionado **desaparece**, bajo un
  comentario que decía «no borra». Reproducido: seleccionar la primera línea y tocar el botón se
  llevaba «Función sistólica normal, FEVI 58% por Simpson biplano.». No es un gesto raro —doble
  clic sobre una palabra, triple sobre un párrafo, arrastrar para releer una frase— **ni
  recuperable**: asignar `.value` por código NO deja entrada en la pila de deshacer del textarea,
  así que Ctrl+Z no lo trae. Hoy se colapsa a `selectionEnd`.
- **EL TEXTO AFIRMABA TRES COSAS QUE LA APP PUEDE CONTRADECIR EN EL MISMO INFORME.** La Tabla 4
  de la BSE es un informe **completo** de un paciente normal, así que sus frases se sostienen
  entre ellas; acá el texto es fijo y el botón no lee un solo dato. Ver la lista arriba.
- **El foco del propio botón latcheaba la guarda del cursor.** `ta.focus()` —el que deja el
  cursor al final de lo insertado— dispara el oyente, así que desde el primer clic de la sesión
  `_ccUltimoFoco === ta` **para siempre**, y nada lo devuelve a null, ni «Nuevo estudio». La
  guarda se auto-anulaba: pasaba a usar el cursor aunque el médico nunca hubiera tocado el
  informe, que es exactamente el estado que existe para cubrir. Hoy hay `_ccInsertando`.
- **`let` → `var`.** `ccInsertarTemplate` es una **declaración** de función, o sea hoisteada y
  llamable desde su `onclick` aunque el bloque `<script>` —de la línea ~15729 a la ~72700— muera
  en una sentencia anterior. Con `let`, ahí la lectura tira `ReferenceError` por zona muerta y el
  botón no hace **nada**, ni siquiera el toast de fallback; con `var` vale `undefined` y el
  template se inserta al final. **Y el comentario que escribí primero afirmaba que declararlo
  arriba protegía: no protege**, la posición es irrelevante para un manejador de clic.

### ⚠️ SON TRES CAMINOS QUE REESCRIBEN EL INFORME, NO UNO — y es PREEXISTENTE

El toast decía «Generar Informe». Medido, son tres:

| | |
|---|---|
| «Generar Informe» | reescribe todo |
| las tres pastillas de estilo | `setEstiloInforme` regenera **explícito** — y están pegadas al botón CC |
| con el estudio REABIERTO, cualquier refresco silencioso | `infBaseDesdeDOM` adopta el texto como base y el merge lo descarta |

El tercero es el que más engaña: se dispara con un `onchange` de VEXUS o de Pericardio, **sin
toast**, y el párrafo desaparece del informe firmado.

**NO ES DEL TEMPLATE, y eso se midió antes de intentar arreglarlo**: le pasa idéntico a una frase
escrita a mano y a una insertada con «💬 Frases». Es cómo se comportan `_infBase`/`_infMerge`
desde antes, así que arreglarlo es tocar el motor de procedencia del informe —fuera de alcance por
pedido explícito—. Lo que se hizo es que el aviso hable de **«lo que escribas»** y nombre los dos
caminos que el médico controla, en vez de prometer que los otros eran seguros.

### La guarda del cursor es REDUNDANTE con el navegador de hoy, y se declara

Medido: **Chrome deja `selectionStart` AL FINAL cuando se asigna `.value`** —519 de 519 tras
`generarInforme`, 33 de 33 tras una asignación directa—, así que en el flujo real las dos ramas de
`usaCursor` aterrizan en el mismo lugar y **la mutación que lo fuerza a `true` sobrevivía**. El
estado que la guarda cubre es un cursor en 0 sin que el médico haya tocado el textarea —otro
navegador, o un `setSelectionRange` de código—, y ahí insertar «en el cursor» mete el template
ARRIBA de todo, delante de la función sistólica. El caso lo **sintetiza** en vez de esperarlo, y
lo declara.

### ⚠️ LA PESTAÑA INFORME ESTÁ EN `display:none` EN EL HARNESS, Y AHÍ `focus()` ES UN NO-OP

Medido tras `__t.limpiar()`: `tab-informe` queda oculto, `ta.focus()` dispara **cero** eventos y
`document.activeElement` no se mueve. Con eso, **la mutación que hace que el foco propio latchee
la guarda SOBREVIVÍA**: no se puede latchear lo que nunca se enfoca. El caso medía en un estado
donde el defecto es imposible. Hoy TC-217 llama `showTab('informe')` y **declara** que el foco
real anda antes de medir nada — y después deshace ese foco, porque para el oyente es
legítimamente «foco del médico» y sin eso la condición mediría el que puso el propio caso.

### Once mutaciones, cada una en su condición

El botón de vuelta a `hidden`, `usaCursor` siempre falso, `usaCursor` siempre verdadero, sin el
salto de línea antes del template —que publicaba «…Sin masas intracardíacas.Análisis segmentario
secuencial: …»—, «las cuatro venas pulmonares», una guarda de «ya existe» que impide el segundo
inserto, el toast sin el aviso, la inserción borrando la selección, el foco propio latcheando la
guarda, «no dilatada» de vuelta en el texto, y el toast nombrando un solo camino.

**La condición que separa «inserta un fijo» de «combina» no es que el texto aparezca**: es que sea
**el mismo** con el formulario vacío y con tres cardiopatías cargadas, y que **ninguna casilla de
integración quede tildada**. Y la que impide que la maquinaria vuelva por la puerta de atrás no es
ninguna de las anteriores —insertar texto y leer datos conviven sin contradecirse— sino que las
**ocho funciones no existan**.


## ~~El botón 🫀 CC se escondía justo donde tenía algo que hacer~~ (2026-09-24) — SUPERADA

> **⚠️ SUPERADA POR LA ENTRADA DE ARRIBA, el mismo día.** Todo lo que sigue describe la compuerta
> por datos y el tilde masivo, que **ya no existen**. Se conserva por tres cosas que siguen
> valiendo: el hallazgo clínico del foramen —que hoy es inalcanzable porque no hay lectura de
> datos, no porque se haya arreglado dos veces—, la corrección de la regeneración destructiva
> —que se fue con `ccIntegrarTodas` y por eso el orden del template importa— y el argumento de
> por qué `_CC_SECS` no se puede ensanchar, que hay que no olvidar si alguien vuelve a intentar
> que el botón lea datos.

Reportado como tres cosas —ubicación, diseño y «no genera nada»—. Las dos primeras son decisión
de Maicol; la tercera era un defecto real, y el diagnóstico del reporte apuntaba al lugar
equivocado: la función andaba perfecto, lo que fallaba era **la compuerta que decide si el botón
aparece**.

### ⚠️ `_CC_SECS.pred` CONTESTA OTRA PREGUNTA, y por eso no alcanza sola

Esa lista dice **«¿este estudio cuenta como CIA para la estadística?»** y es estricta a propósito:
`cia` exige `ete_cia_tipo`, o sea el TIPO consignado. La pregunta del botón es otra —**«¿tildar
esta casilla va a producir texto en el informe?»**— y el emisor la contesta con el tamaño, el
borde o la dirección **solos** (`if(cTipo||cMax!=null||cMin!=null||bm||cDir)`).

Medido con el caso exacto del reporte, una CIA de 18 × 4 mm con borde VCI de 6 mm y sin tipo:

| | |
|---|---|
| `ccSeccionesConDatos()` | **`[]`** — botón **oculto** |
| tildando `ete_shunt_incluir_chk` a mano | «CIA. Tamaño 18 × 4 mm. Borde mínimo 6 mm (VCI).» |

**`_CC_SECS` NO se tocó**, y ésa es la mitad que importa: es la clasificación que comparten el
Laboratorio, el filtro de cohorte, el PDF de auditoría y el PPT, y ensancharla metería en el
denominador de «Estudios con CIA» a pacientes a los que nadie les consignó el tipo. Lo que se
agrega es la **unión** con un predicado que contesta la pregunta del botón.

### ⚠️ EL `/sharp-edges` ENCONTRÓ CUATRO, Y EL PRIMERO ERA PEOR QUE EL DEFECTO ORIGINAL

Ninguno lo vio la lectura, y el primero lo introduje yo **en este mismo commit**, copiando la
regla de `secAutoOpen` sin preguntarme qué significa cada control.

- **UN HALLAZGO NEGATIVO ENCENDÍA LA SECCIÓN Y PUBLICABA UNA AFIRMACIÓN.** `secAutoOpen` cuenta
  `selectedIndex > 0`, y con esa regla acá, contestar **«Aneurisma del septum: No»** —o sea la
  AUSENCIA de un aneurisma— encendía el foramen, tildaba su casilla y el informe firmado decía
  **«Foramen oval permeable.»** más una línea en el EN SUMA, sobre un paciente en el que nadie
  dijo que hubiera un foramen. Reproducido con `fop_asa='no'` y el resto del formulario en
  blanco; idem con `fop_contraste='no'`. Es «un default tranquilizador es una afirmación»
  entrando por una **acción masiva**, que hereda la guarda más débil de cada una de las
  diecinueve secciones. **Hoy el barrido cuenta sólo campos de TIPEO**: una medición no puede ser
  una negación, y lo que un select aporta ya lo cubre `pred`, que está escrito sobre esos mismos
  selects descriptivos. Las casillas quedan fuera por lo mismo — `fontan_comp_ninguna` es
  literalmente «sin complicaciones».
  **Y el aviso nuevo era ciego a esto**: ahí el texto SÍ cambia. La comparación caza el modo de
  falla benigno —«tildé y no salió nada»— y no el peligroso.
- **EL BOTÓN BORRABA LAS EDICIONES A MANO, y es PREEXISTENTE.** Llamaba a `generarInforme()`
  pelado, o sea la regeneración **explícita**, donde `_infEscribir` hace `lineasNuevas.slice()` y
  descarta lo que el médico tipeó o insertó con «💬 Frases». El «📎 Integrar» de cada sección no
  hace eso —sólo tilda, y el refresco lo trae el oyente con debounce, que es silencioso—, así que
  **el mismo acto destruía ediciones por un camino y no por el otro**. Medido en los dos
  sentidos: con la regeneración explícita la frase se pierde; con `{silencioso:true}` sobrevive y
  la CIA aparece igual. Con el informe todavía en blanco sí va la generación completa: no hay
  nada que preservar. **Y es lo que vuelve honesta la comparación del aviso**: antes el texto
  podía cambiar sólo porque se borró lo del médico, y el aviso se callaba justo cuando tenía que
  hablar.
- **El `try/catch` mudo hacía que el aviso culpara al dato clínico.** Si `generarInforme` lanza
  —o no existe porque su bloque `<script>` dejó de parsear, cosa que este archivo documenta haber
  pagado dos veces— las casillas quedan tildadas, el texto igual, y el toast mandaba al médico a
  revisar campos clínicos por una falla de código. Hoy se distingue «el emisor no corrió» de «el
  emisor no emitió». **La mutación que saca esa guarda SOBREVIVE y está declarada**: hoy
  `generarInforme` no lanza, así que la rama es defensa en profundidad y no hay condición que la
  pueda ejercer sin romper el bloque a propósito.
- **El comentario prometía una dirección de falla para dos bloques y describía uno.** «Falla hacia
  INCLUIR» encabezaba `p` y `d`, y `d` caía a `false`. No era alcanzable —nada dentro de
  `_ccTieneDatosEnPantalla` puede lanzar— pero dejaba un fail-closed silencioso bajo un comentario
  que promete lo contrario.

Y dos de presentación: el rótulo decía «CIA/CIV» sobre un estudio con sólo una CIV —hoy `pred`
distingue cuál matcheó y el barrido cae al grupo entero, que es lo honesto—, y con sólo
`sinCasilla` el toast salía `🫀 0 sección(es) … :  · ⚠️ sin casilla: X`, con la lista vacía y los
dos puntos colgando.

**`_ccAssertChks` vigila ahora DOS cosas**: que la casilla exista y que esté **dentro de un
`.sacc`**. Desde que el contenedor se deriva de la casilla, una que viva fuera de un acordeón deja
esa sección invisible al barrido para siempre y sin un solo error — el `if (!acc) return false` se
la traga.

### Lo que queda DECLARADO y sin cerrar

- **En Modo Básico el botón integra y el médico no puede des-integrar.** Vive en la pestaña
  Informe, que siempre se ve; las dos pestañas de CC son `.tab-special data-mod="congenitas"` y
  ahí se esconden, así que la salida que el comentario nombra —«un clic en 📎 Integrar de esa
  sección»— es inalcanzable. Es **preexistente** —el botón siempre pudo integrar en Modo Básico—
  y este cambio lo agrava porque ensancha cuándo aparece.
- **El botón no da estado.** Después de integrar queda idéntico, a diferencia del «📎 Integrar» →
  «✓ Integrado» de cada sección. La segunda pulsación es inocua desde que la regeneración es
  silenciosa, pero no hay señal de que el gesto ya se hizo.
- **El tilde se persiste y se exporta.** Va a `<id>__chk`, que consumen el Excel, `_labIntegrado`
  y el filtro de cohorte: un tilde de más no agrega sólo un párrafo, hace que el estudio cuente
  como sección integrada en la estadística y en el PDF de auditoría.

### El segundo predicado se DERIVA del DOM, no es una lista paralela

Es el mismo criterio de `secAutoOpen` —«¿este acordeón tiene datos?»— y el contenedor sale de la
**casilla** (`closest('.sacc')`), no de un mapa escrito aparte: si una sección cambia de acordeón,
su casilla se muda con ella y el barrido la sigue. Con un mapa propio mediría el acordeón viejo y
**no daría ningún error**.

Las exclusiones y su motivo:

- **Sólo campos de TIPEO** — ver el hallazgo de arriba. Y **no se filtra por `[type=number]`**: el
  script de arranque convierte esos inputs a `type=text` con `inputmode=decimal`, así que ese
  selector devuelve **cero**. Se excluye por lo que no sirve (`hidden`, `checkbox`, `radio`).
- **`[readonly]` y `[data-espejo]`** — un espejo es dato de OTRA sección mostrado acá por
  comodidad; la sección de CIA/CIV muestra seis que se llenan con el TSVI, el TSVD, el DDVI y la
  ASC. **La mutación que las saca es la que más enseña**: un estudio **sin ninguna cardiopatía
  congénita** —FEVI, DSVI, VD basal, sexo, septum, TSVI, aorta y «TV documentada: no»— enciende
  **siete** secciones y las tilda: `CIA/CIV, CoAo, VAB, MCH, TdF, DSAV, CVPA`.
- **La propia casilla de integración** — contarla haría el predicado auto-cumplido desde el primer
  tilde. Hoy queda fuera además por no ser un campo de tipeo; la comprobación explícita se
  conserva porque es la que fija el contrato.

Control negativo medido: con el formulario vacío, y con ese estudio sin CC, **cero** secciones.

**Barrido de las 18 casillas, por las dos vías:** con su campo numérico cargado entran **18/18**;
con su select descriptivo, **16/18**. Los dos que no son `fop_mov` y `ebs_func_vd`, que son
selects secundarios y no el hallazgo — correcto y conservador.

### La unidad es la CASILLA, no la sección

CIA y CIV comparten casilla **y viven en el mismo acordeón** (`sacc-cc-shunt`), así que ninguna
medición del DOM las puede distinguir. `_ccGruposDeSecciones()` agrupa por casilla y el rótulo se
arma con las etiquetas de `_CC_SECS` → **«CIA/CIV»**. Eso arregla de paso un defecto del dedupe
anterior, que se quedaba con la primera y decía **«CIA» sobre un estudio con sólo una CIV**.

### El toast compara el TEXTO, no cuenta tildes

«Se tildaron N casillas» describe el **gesto**, no la consecuencia — y el defecto que se reportó
fue literalmente «toqué el botón y no produjo ningún texto», con el toast saliendo verde igual.
Desde que la compuerta es ancha, el caso es alcanzable y **está medido**: con sólo
`tdf_vol_fuente` cargado, el botón aparece, tilda la casilla de Fallot y **el informe queda
idéntico**. Ahí el aviso lo dice en vez de confirmar un éxito que el informe desmiente dos
centímetros más abajo.

**No es un resguardo que no se pueda hacer fallar**, y se midió en vez de suponerlo: barrido de
los **80 campos de tipeo** de las 18 casillas → **26 tildan y dejan el informe idéntico**. Uno de
ellos es `ete_cia_vel`, del mismo acordeón que el caso del reporte: el emisor de CIA no lo incluye
en su compuerta. Es AGREGADO y no por sección a propósito: atribuirlo exigiría instrumentar los
catorce emisores, y **`cc-txt-<k>` no sirve como señal** porque `CC_HOJA_ORDEN` tiene catorce de
las diecinueve — las cinco que faltan darían un «no emitió» falso.

### La ubicación: pedida dos veces, y el comentario que la resistía tenía razón a medias

El botón vuelve a estar **pegado a las tres pastillas** y con el mismo `btn-ghost` que Frases e
Indicaciones. El comentario anterior lo había puesto en el grupo de acciones citando que mezclar
una acción con el selector de estado ya hizo que «Frases» se leyera como un cuarto estilo. Lo que
ese razonamiento no vio es que el `margin-left:auto` de ese grupo **baja el grupo entero a un
segundo renglón** en pantalla angosta, y ahí el botón quedaba lejos de todo: eso es lo que se
reportó como «está en otro lugar». Medido a 390 px, hoy CC queda **primero del segundo renglón**,
justo debajo de Narrativo, y a 1280 px contiguo a él.

**El riesgo sigue en pie y está declarado**: con `btn-ghost` se ve idéntico a «Conciso». Tres cosas
lo separan y **conviene no borrar ninguna** — no lleva `estilo-pill` ni `data-estilo`, así que
`setEstiloInforme` nunca le pone el `btn-primary` de «activo»; y **nace oculto**, o sea que en la
enorme mayoría de los estudios la fila tiene tres botones y no cuatro. Una opción de estilo está
siempre; ésta aparece sólo cuando hay una cardiopatía congénita cargada.

**`.btn-purple` se eliminó**: su único usuario era este botón. Se borra en vez de dejarla huérfana
porque una clase de color sin usuarios invita a «restaurarle el color», que es justo lo que se
revirtió. La mutación que le pone `btn-primary` cae por dos condiciones, y la segunda es la que
vale: **3,21 : 1 en el tema oscuro**, el mismo defecto de `--purple` con otra cara.

### «Que combine varias CC» NO reproducía

Medido con cinco condiciones cargadas a la vez —CIA, CIV, DAP, CoAo y MCH, las tres primeras sin
tipo—: el cuerpo emite los cinco párrafos y el EN SUMA las cinco líneas. Cada sección empuja su
propia entrada a `etePars`; no hay ninguna que pise a la anterior. Lo que el reporte leyó como
«sólo refleja la última» es el mismo defecto de la compuerta: **las que no aparecían eran las que
el botón no llegaba a tildar**.

### ⏳ PENDIENTE SEPARADO: el template de cavidades y conexiones

Pedido como punto 5 y **no se improvisó**. Tres razones, la primera medible:

1. **La app no recoge análisis segmentario: «situs» tiene CERO apariciones en todo el archivo.**
   No hay campo de situs, ni de conexión veno-atrial, ni atrio-ventricular, ni ventrículo-arterial.
2. **Un template que afirme «situs solitus, concordancia AV y VA» sobre un estudio donde nadie lo
   miró es un default tranquilizador**, o sea la afirmación que este archivo persigue desde los
   tres selects del TEER — y acá va al informe **firmado**.
3. **El punto pide que salga «cuando no hay datos de CC cargados aún», que es justo cuando el
   botón está OCULTO.** Ofrecerlo ahí exige mostrarlo siempre, lo que revierte la compuerta que
   este mismo commit acaba de arreglar, y le da dos significados al mismo botón: «integrar lo
   cargado» y «escribir texto que no sale de ningún campo».

El camino correcto es una **sección de análisis segmentario** con sus cuatro selects de opción 0
vacía, su casilla de integración, su entrada en `_CC_SECS`, sus columnas de Excel y su emisor —o
sea el mismo trabajo que cualquiera de las diecinueve—. Sesión propia.

### Diez mutaciones, nueve en su condición y una declarada

Sin la unión (cae la CIA sin tipo y el denominador del aviso), sin las exclusiones del barrido
(cae el control negativo, con las siete secciones impresas), el botón de vuelta al grupo de
acciones (cae sólo la adyacencia), `btn-primary` en vez de `btn-ghost` (cae el aspecto y el
contraste, **3,21 : 1 en oscuro**), sin agrupar por casilla (cae el rótulo y el toast imprime «1
ya estaban» sobre un estudio recién limpiado), sin el aviso del informe que no cambia, el barrido
contando selects y casillas (cae el hallazgo negativo, con `asa=FOP contraste=FOP` impreso), la
regeneración de vuelta a explícita (cae «las ediciones a mano sobreviven», con `frase=false`) y el
rótulo tomando siempre el grupo entero.

**La que sobrevive está declarada**: sacarle al aviso la guarda de `regenero`. Hoy `generarInforme`
no lanza, así que esa rama es defensa en profundidad y no hay condición que la pueda ejercer sin
romper el bloque a propósito.

**Y dos condiciones nacieron sin el escenario que discrimina.** «No cuenta doble» pasaba con el
rótulo del grupo entero, porque en su escenario CIA **y** CIV tienen datos y las dos
implementaciones dan «CIA/CIV»; el caso que separa es **una sola de las dos**. Y el aviso del
informe mudo se probaba con `tdf_vol_fuente`, que es un select y dejó de encender la sección con
el arreglo del hallazgo negativo — hubo que buscar un campo de tipeo que de verdad no publique.

### Y mi propio script de reemplazo se comió el backtick de cierre del caso

Para sacar los **backticks que volví a escribir dentro del cuerpo de TC-217** —van SETENTA, y las
siete de esta tanda otra vez en comentarios recién escritos— hice un reemplazo entre `index('`')`
y `rindex('`')` sobre el rango «de TC-217 a TC-218». El `rindex` encontró un backtick del
**comentario de cabecera de TC-218**, así que el rango se pasó de largo: convirtió el `` ` `` que
CIERRA el template literal de TC-217 y de paso rompió una línea del comentario de TC-218.
`node --check` lo cazó las dos veces, pero apuntando a la línea del `caso(`. Es la entrada «los
reemplazos por rango son peligrosos» aplicada a mi propia herramienta: **el ancla de fin tiene que
ser única y verificada, no el último carácter que aparezca en un rango estimado.** Y después,
contar los casos: 266, igual que HEAD.


## «Guardar tabla»: UNA SOLA CAPTURA CON TODAS LAS VÁLVULAS MEDIDAS (2026-09-24)

Tercera decisión de Maicol sobre el cajón Doppler en la misma jornada, y **cierra la duda que la
segunda dejó declarada**. «Guardar tabla» pasó de emitir la válvula ABIERTA a emitir una sección
por cada válvula con mediciones, en un solo archivo. Las que no se midieron **se omiten enteras**.

### La razón clínica no es la comodidad: es la ecuación de continuidad

La fila `AVM por continuidad` de la **mitral** se calcula con `ao.diam` y `ao.vtiTsvi`, o sea
**insumos aórticos**. Con una tabla por válvula, esa tabla publicaba un área valvular apoyada en
dos valores que ella no llevaba: un número que no se puede auditar desde el documento donde está
impreso. Combinadas, el número y sus insumos viajan juntos. **Si alguna vez se vuelve a partir en
una entrada por válvula, ésta es la fila que hay que resolver primero.**

### Las cuatro reglas que sostienen la composición

| | |
|---|---|
| **qué entra** | `_dopSeccionesGuardado()` — una sección por válvula con `_dopValvConDatos`, más «sin asignar». Es el MISMO predicado que pinta el punto en el botón, así que no pueden discrepar |
| **qué filas** | sólo las **medidas**. En el panel un «—» es un afford con su botón «medir»; en un PNG estático se lee como «se miró y dio normal» |
| **qué descargos** | los de las filas **publicadas** (`_DOP_DISC[].si`), no los de la válvula |
| **cómo se llama** | el sufijo se **deriva de las secciones**, nunca de un predicado escrito aparte |

### ⚠️ EL `/sharp-edges` ENCONTRÓ CUATRO, Y TRES ERAN AFIRMACIONES CLÍNICAS

Ninguna la vio la lectura, y dos vivían dentro de comentarios que yo acababa de escribir
afirmando lo contrario — que es el patrón que este archivo persigue desde el `_dupKey`.

- **`AVAi` publicaba un cociente cuyo denominador no viaja.** La BSA sale de `getBSA()`, que lee
  peso y talla **del formulario**, mientras el cajón es estado de módulo que sobrevive al cambio
  de estudio **a propósito** (hay un aviso entero, `avisoImg`, para eso). O sea que una AVA medida
  con un paciente podía dividirse por la BSA del siguiente y publicarse como «AVAi 0,42 cm²/m²»
  —estenosis crítica indexada— sin una traza de con qué superficie salió. Hoy la fila es
  **`AVAi (BSA 2.00)`**, el mismo patrón que `PSAP (PVC 10)` ya resolvía bien dos filas más abajo.
  **Es PREEXISTENTE**: la tabla combinada lo agrava porque circula con más contexto, no lo crea.
- **Los descargos se indexaban por VÁLVULA y el invariante estaba escrito por MEDICIÓN.** Medir
  sólo la Vmax de la estenosis tricuspídea —sin tocar la IT, o sea sin PSAP posible— quemaba igual
  la cita ESC/ERS 2022 sobre estimación de PSAP al pie de una tabla que no la lleva. Una cita de
  guía sobre presión pulmonar en un PDF firmado se lee como que la presión pulmonar se valoró.
  Hoy cada entrada declara qué fila la dispara, y **matchea por PREFIJO** porque dos rótulos llevan
  su parámetro adentro (`PSAP (PVC 10)`, `AVAi (BSA 2.00)`).
- **Una válvula con un solo campo medido salía como seis guiones y una severidad al pie** — o sea
  exactamente el modo de falla que el comentario de al lado decía evitar omitiendo la válvula
  entera. La compuerta era todo-o-nada por válvula y las filas base de `_dopFilas` son
  incondicionales, así que el defecto entraba por la puerta de al lado. Y había una contradicción
  interna que lo sellaba: **`_dopMetaGuardado` ya descartaba los nulos**, así que la imagen y el
  dato del MISMO registro publicaban listas distintas.
- **El sufijo del nombre no contaba las mediciones «sin asignar».** Bajo un comentario que
  afirmaba derivarse del «MISMO predicado que decide qué secciones entran» — y `_dopSeccionesGuardado`
  tiene una segunda rama. Con sólo sueltas cargadas el archivo salía «Doppler · 14:32» y dos
  guardados del mismo minuto quedaban indistinguibles en la tira, que es justo lo que ese sufijo
  existe para evitar.

### El filete de sección no se dibujaba, y sólo se vio MIRANDO la imagen

Escribí `secH = 28` y la cebra de la primera fila —que se pinta desde `y - 16`— tapaba la línea
divisoria. Sintaxis correcta, ninguna condición en rojo, y la única señal era que dos bloques de
filas se leían como una sola tabla. Hoy son 34 y el caso lo mide **por píxel** (`#d1d5db` en la
fila del filete), no por inspección. **Al tocar `secH`, `filaH` o el `y` del filete: mirar la
captura, no el código.**

### El título se achica, y el resguardo NO se alcanza con los rótulos de hoy

Medido: con las cuatro válvulas el título mide **511 px de los 596 útiles** a 17 px, así que entra
y el achique nunca dispara. Un resguardo que no se puede hacer fallar se lee como protección sin
serlo —es por lo que este archivo borró el «deshacer» de `calcET`— así que el caso lo **ejerce
alargando un rótulo de válvula**, que es el cambio futuro contra el que existe. Se conserva porque
`fillText` recorta por la cola **en silencio** y lo que desaparecería es justo la lista de válvulas
que el archivo contiene. **Declarado: el piso es 11 px; un rótulo disparatado se recorta igual, y
eso es el límite del recurso, no un defecto del dibujante.**

### Al escribir los casos, tres veces el mismo error: medir el carácter en el papel equivocado

- **Buscar «Aórtica» en todo lo dibujado para probar el TÍTULO** daba rojo sobre una tabla mitral
  perfecta: el descargo de la mitral NOMBRA el acordeón Aórtica, porque de ahí saca los insumos del
  AVM. El título es el **primer** `fillText`, y se mide aparte.
- **Buscar «—» para probar que no hay celdas vacías** daba rojo por el separador del propio título
  (`Mediciones Doppler — Tricúspide`). Una celda vacía es una **pieza dibujada** que vale
  exactamente «—», no una subcadena.
- **Sembrar una onda E para que apareciera la cita del AVM**: desde que el descargo cuelga de la
  fila publicada, hay que sembrar el **PHT**, que es lo que produce `AVM por PHT`.

**Diez mutaciones, cada una en su condición**, entre ellas las cuatro de los hallazgos de arriba.
**Backticks dentro del cuerpo de un caso: van SESENTA Y NUEVE**, tres en esta iteración y las tres
en comentarios recién escritos.


## El cajón Doppler vive SÓLO dentro del visor, con un cajón por válvula (2026-09-24)

Rediseño deliberado, decidido por Maicol, que **revierte la conclusión de la entrada siguiente**:
allá se midió que `#dop-casa` era el único acceso a lo medido sin visor y por eso no se tocó.
Lo que cambió no es la medición sino el **requisito**: ese acceso ya no se quiere, y lo reemplaza
una captura de la tabla en la biblioteca del estudio.

**Son DOS iteraciones del mismo día.** La primera movió el cajón adentro del visor y compuso
imagen+tabla en una sola captura; la segunda separó los dos guardados. Lo que sigue describe el
estado final — si algo de más abajo menciona el compuesto, es un resto y hay que corregirlo.

| | antes | hoy |
|---|---|---|
| dónde vive el nodo | se **mudaba** entre `#dop-casa` y `#cine-dop-slot` | **nace** en `#cine-dop-slot` |
| quién lo muestra sin visor | el botón 📊 (`E.abierto`) | **nadie** — no existe «sin visor» |
| acceso a lo medido tras cerrar | reabrir el panel con 📊 | la **tabla guardada** en la biblioteca |
| al abrir el grupo Doppler | tabla genérica de cinco filas | **sólo** los cuatro botones de válvula |

Eliminados: `#dop-casa`, `#dop-btn`, `dopToggle`, `_dopUbicar`, `dopHerr` y el campo `abierto`.

### Que el panel desaparezca al cerrar dejó de ser una línea de código

`#cine-ov` es `position:fixed;inset:0` y se esconde entero: con el cajón adentro, «se cierra el
visor → desaparece» es una **consecuencia del árbol**, no algo que alguien tenga que acordarse de
hacer. Verificado tras `cineCerrar()`: el nodo existe, mide 0×0 y no queda un solo rastro en la
pestaña Imágenes — y `_dop` intacto, porque esconder no es limpiar.

### Sacar la tabla genérica de la pantalla la volvía invisible, no inexistente

`_dopCapturar` cae en `E.gen.*` cuando nadie armó un campo, y ese camino **sigue vivo**: las
herramientas de Doppler están en la barra lateral del visor y se pueden elegir sin tocar el cajón.
Con la tabla genérica fuera de la pantalla, esos números existirían en el estado y no se verían
por ningún camino. Por eso hay `_dopFilasSueltas()`, que muestra **sólo las que tienen valor**
bajo «Mediciones sin asignar» — una tabla de guiones bajo ese rótulo entrena a ignorarla.

### UN CAJÓN POR VÁLVULA, Y SOBREVIVE AL CAMBIO DE IMAGEN — que es el método, no una tolerancia

Los cuatro sub-objetos (`ao`/`mit`/`tri`/`pul`) viven en `_dop`, que es estado de **módulo**:
ninguna función del visor los toca al cambiar de cineloop. Verificado leyendo los tres únicos
escritores —`_dopEstado`, `_dopLimpiar` y el botón— y reproducido en el navegador con el flujo
exacto que pidió Maicol: diámetro y VTI del TSVI en la imagen 1, ondas E y A en la 2, VTI aórtico
en la 3 —y ahí el cajón aórtico **reabre con lo de la 1** y la AVA aparece sola—, las dos e' en la
4 —y el mitral reabre con su E/A—.

**Esto no es una comodidad: la ecuación de continuidad lo EXIGE.** El VTI del TSVI y el de la
válvula aórtica se miden en planos distintos, así que un cajón que se vaciara al cambiar de imagen
no podría calcular una AVA nunca. Por eso la mutación que hace que `_cineAbrir` llame a
`_dopLimpiar` tira **diez condiciones** de TC-251.

Lo que sí se limpia son las tres puertas de siempre —el botón, `limpiarCampos` y
`cerrarSesionReal`—, que es la fuga entre pacientes.

### ⚠️ EL PANEL PINTA DOS TABLAS, Y LO GUARDADO SE LLEVABA UNA

Lo cazó `/sharp-edges`, no la lectura, y el detalle importa: `_dopCanvas` y `_dopMetaGuardado`
seguían saliendo de `_dopFilas()` **con un comentario recién escrito que afirmaba** «sale de
`_dopFilas`, la misma lista que pinta el panel, así que lo guardado no puede decir otra cosa que
lo que el médico vio». Ese invariante se rompió en el mismo commit que dejó escrito el comentario.
La lista única fue un rato `_dopFilasTodas()` —válvula + separador + sueltas—; desde la tabla
combinada (ver la entrada de arriba) es **`_dopSeccionesGuardado()`**, que arma una sección por
válvula con datos y la consumen la captura, la meta, los descargos y el nombre del registro. Y la
compuerta del botón mira el cajón entero: escrita sólo sobre la válvula, un panel con sueltas y sin
válvula elegida **mostraba valores que ningún control podía guardar**, y desde que no hay
`#dop-casa` la biblioteca es la única salida.

### DOS GUARDADOS INDEPENDIENTES, y el compuesto se eliminó el mismo día

La primera versión componía el cuadro del visor con la tabla debajo en una sola captura.
**Segunda decisión de Maicol (2026-09-24): son dos acciones distintas y dos entradas distintas
de la biblioteca**, y `_dopCanvasConImagen` se borró.

| gesto | qué guarda | dónde está el botón |
|---|---|---|
| **📸 Capturar+Med** | la ecografía con sus calipers (`medCapturarConMedicion`) | barra fija del visor |
| **💾 Guardar tabla** | sólo la tabla del cajón (`dopGuardarBiblioteca` → `_dopCanvas()`) | pie del cajón |

El rótulo dice **«tabla»** y el toast también: los dos botones están a dos centímetros, y un
«Guardar» pelado al lado del otro no dice cuál es cuál — el médico aprieta el que tiene más
cerca y descubre qué guardó al abrir la tira. **Y el nombre del registro lleva la hora**, porque
el cajón acumula y guardar parcial y volver a guardar es el flujo natural: sin ella, dos tarjetas
«Doppler — Aórtica» con miniaturas de 150 px son indistinguibles.

Las mediciones viajan además como **dato** en `rec.meta` (parámetro opcional de
`_bibGuardarJpeg`, bajo clave fija y nunca por spread, que pisaría `id`/`uuid`/`tipo`), **con sus
descargos adentro**: si son recuperables como dato, su reparo tiene que serlo también.

**Con el compuesto se fue `_dopAvisoOtrasImgs`**, que existía sólo por él: avisaba que la tabla
podía no corresponder al cuadro de arriba. Sin cuadro arriba esa frase sería falsa — y acumular
entre imágenes no es una tolerancia, es lo que **la ecuación de continuidad exige**: el VTI del
TSVI y el de la válvula aórtica se miden en planos distintos. Un aviso ahí sería ruido sobre el
flujo correcto.

### ⚠️ EL SIGNO DE LA VELOCIDAD DEJABA DOS FILAS SIN DIBUJAR — el defecto más caro de la serie

`_medVelClic` entrega la velocidad **con signo**, y en apical el anillo mitral **se aleja** del
transductor en diástole: la e' se mide **por debajo de la línea de base**, o sea negativa.
`_dopDerivados` exige `> 0` para promediarlas —y hace bien, un e' negativo no es un e'— así que
medir la e' donde de verdad está dejaba **`e' promedio` y `E/e'` sin dibujarse, sin una palabra**,
en el bloque que decide presiones de llenado. Reproducido en el navegador antes y después:

| | antes | hoy |
|---|---|---|
| e' septal / lateral (clic bajo la base) | **−10,0 / −15,0** | 10,0 / 15,0 |
| fila `e' promedio` | **ausente** | 12,5 cm/s |
| fila `E/e'` | **ausente** | 3,6 |

Y la fila de `e' promedio` la había agregado yo en ese mismo turno: **nació inalcanzable por la
vía de medición**, sólo llegable tipeando a mano. Dos formas de cargar el mismo dato que no se
comportaban igual, que es justo lo que el pedido pedía que no pasara.

**Se normaliza en `_dopCapturar` y en `dopCorregir`**, que son los dos únicos bordes por donde
entra un número. Ninguna magnitud del cajón admite negativo —velocidades pico, VTI, tiempos,
diámetros, gradientes— y **el visor ya muestra módulo con una flecha al lado** por esta misma
razón. Sin normalizar, un solo clic producía dos artefactos que se contradicen: la ecografía con
«4.03 m/s ↓» quemado y la tabla con «−4.03 m/s». La dirección no se pierde: sigue dibujada sobre
la imagen, que es donde significa algo.

### ⚠️ BANDAS DE PLAUSIBILIDAD: sólo los campos con contrapartida EXACTA, y tuve que sacar tres

El cajón aceptaba lo que el importador de la misma app rechaza: un «2» tipeado por «20» en el
diámetro del TSVI publicaba una **AVA de 0,03 cm²** —estenosis crítica— sin ninguna señal. Las
bandas salen de `DCM_RANGO` y `CHM_RANGO`, leídas con guarda porque viven en otro bloque
`<script>`; sin ellas no hay banda y el cajón se comporta como antes, que es el lado que no
destruye una medición.

**Prestar la banda de un campo que contesta OTRA pregunta es peor que no tener banda**: rechaza
mediciones legítimas y lo hace en silencio. Tres que escribí y tuve que sacar:

- **`ao.gradMedio` con `em_gmedio` [1–60]** — ése es el gradiente medio de una *estenosis mitral
  informada*; el cajón mide cualquier válvula, y una aórtica normal da 0,3 mmHg. **Lo cazó TC-249
  poniéndose en rojo sobre un trazado correcto.**
- **`ao.vtiAo` y los VTI mitrales con [2–60]** — en una estenosis aórtica severa el VTI aórtico
  pasa de 100 cm: la banda rechazaba justamente la patología que se está midiendo.
- **`mit.pht` con la banda del PHT aórtico [50–1500]** — una válvula mitral normal tiene un tiempo
  de hemipresión de 30 a 60 ms.

Quedan nueve, todas «mismo campo, misma pregunta», y cubren los tres errores que de verdad
ocurren: el diámetro en centímetros, el PHT con dos clics pegados y la onda E en m/s.

### `_dopSevPHT` caía en «Severa» por descarte

Era `if (>500) Leve; if (>=200) Moderada; return Severa;` — el `else` mudo que este archivo
documenta para `epGradoPorGmax`. Un PHT de **8 ms** publicaba «Severidad IAo: Severa
(orientativo)» en una tabla que va a la biblioteca y desde ahí al PDF. Hoy la última rama es
explícita y hay además una guarda de banda.
**Declarado: la rama explícita es REDUNDANTE por construcción** —todo valor dentro de la banda
clasifica en alguna de las tres— y se conserva porque fija el contrato. La mutación que la
revierte **sobrevive**; la que cae es la que saca la guarda de banda, que es la capa que la
condición ejerce.

### Lo que el panel muestra es lo que se guarda, y «Limpiar» dice qué borra

El panel arma con `_dopFilas(m)` + `_dopFilasSueltas()` y el archivo con
`_dopSeccionesGuardado()`, que es **los mismos dos armadores** aplicados a las cuatro válvulas. Lo
que cambió con la tabla combinada es el ALCANCE, no la fuente: ninguna fila puede decir en el
archivo algo distinto de lo que dice en pantalla. Estuvo un rato saliendo de `_dopFilas()` con un
comentario recién escrito que afirmaba lo contrario: desde la selección progresiva el panel pinta
**dos** listas, así que el invariante se rompió en el mismo commit que dejó escrita la frase.

**La única diferencia deliberada: el archivo NO lleva las filas sin valor.** En el panel un «—» es
un afford —tiene su botón «medir» al lado— y en un PNG estático, al lado de otra sección con
números completos, seis guiones se leen como «se miró y dio normal».

Dos mitigaciones más, que salieron del `/sharp-edges` y son del mismo problema —el panel muestra
UNA válvula y el estado tiene cuatro—:

- **El botón de cada válvula lleva un punto si esa válvula tiene datos.** Sin él, desde la mitral
  una aórtica cargada es indistinguible de una vacía.
- **«🗑️ Limpiar» pregunta y NOMBRA las válvulas que va a borrar**, porque borra las cuatro y la
  pantalla muestra una. La confirmación va en un **envoltorio** (`_dopLimpiarConfirmar`): a
  `_dopLimpiar` la llaman `limpiarCampos` y `cerrarSesionReal`, y el diálogo no puede aparecer en
  una ruta automática — es la forma de `resetETTConfirmar` del módulo de amiloidosis. Con el
  cajón vacío no pregunta.

### ~~DUDA DECLARADA: «Guardar tabla» guarda la válvula ABIERTA~~ — CERRADA el mismo día

> **RESUELTA (2026-09-24, tercera decisión de la jornada).** Ver la entrada «UNA SOLA CAPTURA
> CON TODAS LAS VÁLVULAS» arriba. Se conserva el enunciado porque el argumento que lo cerró es el
> que hay que no olvidar al tocar esto.

Decía: con un cajón por válvula, «captura SÓLO la tabla del cajón» es la abierta, así que al final
del flujo de cuatro imágenes el médico tiene la mitral en pantalla y las otras tres quedan sin
artefacto. **Y pesaba más de lo que parecía: la fila `AVM por continuidad` de la mitral se calcula
con `ao.diam` y `ao.vtiTsvi`, o sea insumos AÓRTICOS**, así que esa tabla publicaba un área
apoyada en dos valores que ella no llevaba. Hoy el número y sus insumos viajan en el mismo archivo,
y hay una condición de TC-251 que lo fija comparando la fila contra `_dopDerivados().avmCont`.


### Al reescribir los casos: dos trampas propias, las dos de denominador

- **`_dopLimpiar` CONSERVA la válvula elegida**, así que leer el estado de fábrica después de
  llamarlo mide otra cosa. Medido: con esa versión, la mutación que hace nacer el cajón con la
  aórtica ya abierta —o sea la que anula la selección progresiva entera— **pasaba en verde**. Hay
  que soltar `_dop = null` y repintar.
- **Las e' hay que clickearlas DONDE ESTÁN, o sea bajo la línea de base.** Con los clics por
  arriba salen positivas de casualidad y la mutación que saca el `Math.abs` **sobrevive**. El caso
  mide donde el médico mide.
- **El valor esperado se DERIVA del cálculo, no se escribe.** `clientY` es entero por
  especificación y el fixture es un canvas escalado, así que el promedio sale 12,78 y no 12,5:
  buscar el literal daba rojo sobre una fila perfectamente dibujada. Se afirma la RELACIÓN —que
  sea la media de las dos medidas y quede entre ellas— que además es más fuerte.

Y **el cajón se busca DESPUÉS de abrir el visor**: antes de la primera apertura el nodo no existe,
así que leerlo arriba daba `null` con `--solo` y el nodo de una corrida anterior dentro del suite.

**Diecisiete mutaciones entre las dos iteraciones, cada una en su condición.** Las que más
enseñan: el cajón naciendo con válvula elegida (anulaba la selección progresiva entera y pasaba en
verde hasta corregir el denominador), `_dopNormalizar` sin el `Math.abs` (cae por cinco
condiciones, las dos filas invisibles incluidas), `_cineAbrir` limpiando `_dop` (cae por diez), y
`_dopCanvas`/`_dopMetaGuardado` de vuelta a una sola lista.

**Backticks dentro del cuerpo de un caso: van SESENTA Y SEIS**, seis en las dos iteraciones y las
seis en comentarios recién escritos. Y el `\n` de un regex volvió a entrar crudo: `/\n/g` dentro
del cuerpo de un caso deja de parsear — se resuelve con `String.fromCharCode(10)`.

### Queda declarado y sin resolver

**Con dos vistas abiertas, la visibilidad del cajón la decide el grupo de la vista ACTIVA.**
`_dop` es estado de módulo y `medGrupo` es por vista, así que activar la vista B en 2D esconde el
panel aunque la A —donde se está midiendo— tenga el grupo Doppler abierto. No se pierde nada
(`_dop` persiste) pero el panel aparece y desaparece por una razón que no está a la vista. Es
preexistente —el slot ya era compartido— y ahora pesa más, porque el cajón es el único acceso.


## Auditoría de la barra de Imágenes — y el cajón Doppler NO está duplicado (2026-09-24)

> **⚠️ SUPERADA por la entrada de arriba, el mismo día.** Lo que midió sigue siendo cierto —no
> había duplicación y `#dop-casa` era el único acceso sin visor— y por eso no se tocó nada
> entonces. Lo que cambió después es el **requisito**: Maicol decidió que ese acceso no se quiere,
> y el reemplazo es la imagen en la biblioteca. Se conserva porque la medición del conteo de nodos
> y la auditoría de los cuatro botones siguen valiendo.

El pedido decía «el panel Doppler aparece duplicado: una instancia a nivel general de la tab
Imágenes y otra dentro del visor; la de nivel general no debería existir». **Medido antes de
tocar nada: no hay duplicación, y borrar la de "nivel general" rompería la app.**

### Hay UN nodo, y lo que se ve son sus dos domicilios

`document.querySelectorAll('#dop-cajon').length` devuelve **1** en los dos estados. `_dopUbicar`
hace `appendChild` del único nodo entre `#dop-casa` (tab Imágenes) y `#cine-dop-slot` (visor), y
`appendChild` sobre un nodo que ya tiene padre lo **mueve**. Medido con el visor abierto:
`padre === 'cine-dop-slot'` y **`#dop-casa` queda vacía** — o sea que en ningún momento hay dos.

Lo que el pedido llama «dos instancias» es el mismo panel visto en dos momentos distintos.

### `#dop-casa` es el ÚNICO acceso a lo medido cuando no hay visor

Es lo que hace que borrarla no sea una limpieza sino una pérdida de datos. Medido: se mide algo
dentro del visor (`E.gen.vel = 2.75`), se cierra con `cineCerrar()` → el cajón vuelve a
`#dop-casa` con `display:none` **y el valor intacto**; el botón 📊 lo reabre y la tabla vuelve
con el 2,75. Sin la casa, ese número no se puede volver a ver por ningún camino — y es desde esa
tabla que se guarda en la biblioteca. La sección de abajo ya lo dice con todas las letras: *«un
cierre de pantalla que destruya el acceso a lo medido sería peor que el cajón siempre visible que
esto vino a corregir»*.

**No se tocó nada.** El cambio pedido habría reintroducido, por la otra punta, el defecto que
TC-249/250 cerró.

### La auditoría de los cuatro botones: los cuatro son de nivel de página

| botón | qué hace | nivel | por qué |
|---|---|---|---|
| **📏 Medir** | `medFijaToggle` pone `#img-grid` en clase `med-on` | **página** | Es la compuerta que LLEVA al visor: con el modo apagado, tocar una miniatura no abre nada. No puede vivir adentro del visor porque es lo que hace que el visor se abra. |
| **🩻 Importar DICOM** | `dcmImgPick` | **página** | Trae archivos a los slots del estudio. No hay «la imagen actual» al momento de importar. |
| **📥 Importar imágenes y videos** | `mediosPick` | **página** | Igual que el anterior. |
| **📊 Doppler** | `dopToggle` alterna `E.abierto` | **página, y es deliberado** | Es la compuerta del cajón **sólo cuando no hay visor**. Con el visor abierto manda el grupo de la barra lateral y el botón se apaga solo (`_dopRender` le saca el `btn-primary`), porque `#cine-ov` es `position:fixed;inset:0` y taparía al botón. Ver la tabla «Dos reglas de visibilidad» de abajo. |

**Conclusión: no hay nada que mover ni ningún botón huérfano.** Verificado en el navegador el
flujo completo: cargar imagen por `imgCompressLoad` → 📏 Medir → clic en la miniatura abre el
visor → el cajón se muda al slot → grupo Doppler activo desde adentro → cerrar → vuelve a la casa
con sus valores.

**La trampa de este pedido, para la próxima:** «lo veo en dos lugares» y «hay dos nodos» no son
lo mismo, y la diferencia se mide con una línea (`querySelectorAll(...).length`). Contar antes de
borrar cuesta treinta segundos; borrar el ancla de un nodo que se muda no da ningún error — deja
un `appendChild` sobre `null` que `_dopUbicar` se traga con su `if (destino && ...)`, así que el
cajón simplemente **no vuelve nunca** y nadie se entera hasta que un médico busca lo que midió.


## El cajón Doppler vivía DETRÁS del overlay del visor — y sus botones eran inalcanzables (TC-249/250)

> **⚠️ PARCIALMENTE SUPERADA (2026-09-24).** El diagnóstico —los botones «medir» eran inalcanzables
> porque `#cine-ov` tapa la pestaña— sigue siendo la razón por la que el cajón vive dentro del
> visor. Lo que ya NO aplica es la mudanza (`_dopUbicar` no existe) ni la tabla «Dos reglas de
> visibilidad»: hoy hay **una** regla, el grupo de la barra lateral, y el botón 📊 se eliminó. Ver
> la entrada «El cajón Doppler vive SÓLO dentro del visor», arriba.

El pedido decía «corregir la UX: que el cajón se muestre sólo con un visor abierto y el modo
Doppler activo». Medido antes de tocar nada, eso era **imposible de implementar literal** — y al
medirlo apareció por qué: **`#cine-ov` es `position:fixed;inset:0`, o sea que TAPA la pestaña
Imágenes entera.** El cajón vivía sólo allá, así que mientras el visor estaba abierto no se veía.

**Lo que eso significaba en la práctica: los botones «medir» del acordeón NUNCA se podían
apretar.** `dopArmar` exige `_dopHayVisor()` —sin visor avisa «Abrí una imagen en el visor»— y
con visor el cajón estaba detrás del overlay. La compuerta y el control eran mutuamente
excluyentes: el acordeón aórtico que se había construido la sesión anterior tenía todos sus
campos armables y **ninguno alcanzable**. Es el control muerto que este archivo documenta con los
siete acordeones de Congénitas, con el agravante de que acá se veía perfecto en la pestaña de al
lado. El «UX» del pedido era esto.

### El nodo se MUEVE, no se duplica

`_dopUbicar` hace `appendChild` del **único** `#dop-cajon` entre `#cine-dop-slot` (dentro del
visor) y `#dop-casa` (la pestaña Imágenes). `appendChild` sobre un nodo que ya tiene padre lo
mueve, así que el oyente delegado, el `innerHTML` recién pintado y el estado del DOM viajan con
él. **Con dos contenedores habría dos oyentes y dos pintados del mismo estado**, que es como lo
que el médico ve y lo que se guarda dejan de coincidir — el defecto que este archivo ya cerró con
la tabla de Simpson. Se comprueba el padre antes de mover: reinsertar en cada repintado rehace el
layout del panel mientras se arrastra el slider.

### Dos reglas de visibilidad, y son distintas a propósito

| | quién decide |
|---|---|
| **con visor abierto** | el GRUPO de la barra lateral (`_medGrupoAbierto() === 'dop'`) |
| **sin visor** | el botón 📊 (`E.abierto`) |

Con el visor abierto **no puede mandar el botón 📊**: está detrás del overlay, o sea una compuerta
que el médico no puede tocar. Y sin visor **tiene que haber una forma de volver a ver la tabla**,
porque es desde donde se guarda en la biblioteca: `cineCerrar` pone `abierto = false` —eso es
«ocultarlo al cerrar el visor»— y el 📊 la reabre entera. **Esconder no es limpiar**: `_dop` no se
toca, y hay una condición que exige que la tabla vuelva con sus valores. Un cierre de pantalla que
destruya el acceso a lo medido sería peor que el cajón siempre visible que esto vino a corregir.

`_dopRender` se engancha en **`_medEstado`**, que es el embudo por el que pasa todo cambio de
estado de la barra. Colgarlo de `medGrupoToggle` dejaría fuera los otros caminos que mueven el
grupo: **elegir una herramienta abre su grupo** (`medHerramienta` escribe `_medGrupo`) y
`medApagar` lo devuelve al de fábrica.

### ⚠️ LAS UNIDADES NO SON UNIFORMES, Y SIGUEN A LAS DEL INFORME

La herramienta de velocidad entrega **siempre m/s**. El informe guarda las ondas del llenado
mitral y las e' del anillo en **cm/s** (`onda_e`, `e_sep`, `e_lat`) y los jets de regurgitación en
**m/s** (`vmax_it`, `vmax_ao`). Uniformar el cajón haría que el médico lea 0,85 acá y 85 en el
campo de al lado sobre la misma medición; uniformar al revés deja la Vmax IM en 150 y su gradiente
en **90.000 mmHg**. La conversión va en `_dopCapturar`, que es el único borde por donde entra un
número, y hay una condición por cada lado.

### Lo que NO se reimplementó, que es casi todo

- **Los gradientes** salen de `_medGradMmHg`, la del visor. Cinco velocidades × `4v²` escrito a
  mano son cinco lugares donde olvidarse del cuadrado — es `vp_gmax` («con Vmax 4 m/s el gradiente
  da 16»).
- **El AVM por continuidad ES `_avaContinuidad` con el VTI mitral en el denominador.**
  `π·(d/20)²·vtiTsvi / X`: con X = VTI aórtico da el área aórtica, con X = VTI mitral la mitral.
  No hay una segunda fórmula — y con ella vendría de regalo el error de escala del diámetro en
  milímetros, que este archivo ya pagó tres veces. **Sus insumos salen del acordeón AÓRTICO**
  (`ao.vtiTsvi`, `ao.diam`): campos propios habrían sido la segunda entrada del mismo TSVI, el
  patrón del espesor parietal. La fila lo dice, porque si no se lee como autónoma.
- **El AVM por PHT** obligó a extraer **`_avmPorPHT`**: el 220 estaba escrito en `calcTHP`, en
  `calcEM`, en `cxAVT` y en dos tablas de referencia, y ésta habría sido la quinta copia. Se
  rewireó `calcTHP` como extracción pura —conserva su `toFixed(2)` y cae a la expresión anterior
  si el helper devolviera `null`—. Hay una condición que compara el número del cajón contra el que
  publica `avm_thp`.
- **E/A, E/e' y los AVM no se gradúan.** Esta app borró a propósito la graduación del SGL porque
  convivían tres escalas; una banda inventada acá sería la misma historia sobre el llenado mitral.

### La PSAP del cajón puede NO coincidir con la del informe, y por eso la fila lleva la PVC adentro

`calcPSAP` suma el gradiente IT y la `pmad` **estimada desde la VCI**; el cajón suma la PVC que el
médico elige en el selector (5/10/15). Los dos números son correctos y pueden diferir sobre el
mismo paciente — el cajón mide **antes** de que la VCI esté cargada, que es su razón de ser. Por
eso el rótulo es `PSAP (PVC 10)` y no `PSAP`: una PSAP sin decir con qué PVC salió no se puede
auditar contra la del informe. El descargo lo declara.

### ⚠️ LOS DESCARGOS SON POR VÁLVULA, y eso no es cosmético

Van **quemados en la imagen** que se guarda en la biblioteca, y desde ahí pueden llegar al PDF.
Con una lista única, la tabla de la mitral saldría declarando la salvedad de la aorta y callando
la suya. `_dopDisc()` concatena los de la válvula abierta con una línea base que dice que el cajón
no escribe ningún campo del informe — que es lo único que separa esa imagen de un informe cuando
se la mira fuera de la app.

### El defecto que destapó TC-250: `dopCorregir` mandaba todo a `E.gen`

Era `const obj = p[0] === 'ao' ? E.ao : E.gen`. Con cuatro acordeones eso escribe el PHT mitral en
`E.gen.pht`, **una propiedad que no existe**: el valor se perdía sin error y la fila seguía
mostrando un guion. Lo cazó el caso —el AVM por PHT salía `null` con el PHT recién tipeado— y no
la lectura. Hoy el grupo se resuelve por su nombre con `hasOwnProperty`, que además impide que un
campo mal escrito acuñe una propiedad nueva que ningún derivado lee. **Lo mismo `_dopCapturar`**:
la cadena de `if` por campo aórtico habrían sido veinte ramas, y la que se olvide manda la
medición a la fila genérica en silencio.

### Verificación

Doce mutaciones, cada una en su condición: las unidades a m/s, el AVM por continuidad con el VTI
aórtico, la PSAP sin PVC, el TAP medido con Velocidad, un solo descargo para las cuatro válvulas,
`dopCorregir` de vuelta al ternario, el E/e' quedándose con el septal, el cajón visible con
cualquier grupo, `cineCerrar` sin devolverlo ni esconderlo, «Conservar» borrando, «Limpiar» sin
borrar, y el nodo sin mudarse.

**Dos condiciones necesitaron su denominador y sin él no probaban nada.** «El cajón se muda a la
ranura» leía el `ov` capturado en el paso 1, o sea **antes** de que el visor existiera: `null`, y
la condición daba false sobre un cajón bien mudado. Y «el AVM por continuidad no es la AVA» exige
que los dos VTI **difieran** — con el mismo valor las dos cuentas coinciden y cualquier mutación
sobrevive.

**Backticks dentro del cuerpo de un caso: van CINCUENTA Y OCHO**, dos tandas en esta sesión y las
dos en comentarios recién escritos — una de ellas explicando justamente la trampa del denominador
de arriba.


## «El CHM importa 0 campos» NO era el lector: era el ORDEN del mensaje (TC-178)

Reportado como regresión del día: *«0 campos importados · 31 campos no reconocidos · 1 omitido
por duplicado»*, sobre el mismo archivo que el día anterior andaba.

**Medido antes de tocar una línea, y en dos pasos que conviene repetir:**

1. **`git show` de los cinco commits del día contra el camino del CHM: CERO líneas tocadas.**
   Ni `_chm*`, ni `CHM_MAPA`, ni `dcmImportarSR`, ni `_dcmRenderPreview`, ni el contador. Una
   regresión exige que algo haya cambiado; si el `grep` no encuentra nada, la hipótesis ya está
   en problemas.
2. **Reproducido importando el MISMO CHM dos veces:**

| | toast |
|---|---|
| 1ª | `✅ 34 campos importados … · 112 campos no reconocidos · 1 estudio(s) nuevo(s)` |
| 2ª | `✅ 0 campos importados … · 0 nuevos · 1 omitido(s) por duplicado` |

O sea: **la deduplicación funcionando** sobre un estudio ya importado. El «31» del reporte
contra el «112» de acá es porque el pendrive tiene DOS CHM distintos.

### ⚠️ LO QUE SÍ ERA UN DEFECTO: el mensaje arrancaba con un tilde verde y un cero

`✅ 0 campos importados` al frente, y el motivo —«1 omitido por duplicado»— al final de una
frase larga, detrás del equipo, la fecha y el conteo de no reconocidos. **Se lee como que el
lector se rompió**, y así se reportó.

El comentario de esa misma función ya había anticipado la mitad del problema —*«el que lee el
toast se queda con la primera cifra»*— y arreglado el **conteo**; lo que faltaba era el **orden**.
Hoy, cuando no entró nada porque ya estaba, el aviso lidera con eso, sin tilde verde, y nombra la
salida («elegí Actualizar»). Si además entró algo, el mensaje de siempre sigue siendo el correcto.

### Dos trampas al cubrirlo con un caso

- **El modo del duplicado se FIJA, no se hereda.** Los radios `dcm-dup` traen «Omitir» por
  defecto, pero dejarlo librado hacía que el caso midiera a veces «Actualizar», que fusiona y
  anuncia «34 campos» — un mensaje **correcto para otra cosa**.
- **⚠️ El toast de la PRIMERA importación llega dentro de la ventana de la segunda.** Se emite
  después del `await` de su guardado, así que limpiar el array de toasts antes de clickear
  capturaba el anterior y la condición daba rojo sobre un mensaje correcto. Se toma el **último**.


## «El visor abre con medidas de otro paciente»: era el cajón Doppler, y avisa

El visor **sí se limpia**: medido en los tres caminos de apertura que se pudieron ejercer
—`_cineAbrir` con el visor cerrado, con el visor abierto, y dos imágenes con el MISMO rótulo—,
`_medVels`, `_medTiempos` y `_medVtis` quedan en cero. Lo que conserva mediciones del paciente
anterior es el **cajón Doppler**, y lo hace **a propósito**: acumular entre imágenes es su razón
de ser.

**El riesgo real es el caso en que las imágenes nuevas son de otro paciente y nadie apretó
«Nuevo estudio»:** ahí la tabla sigue mostrando los números del anterior. Decisión de Maicol
(2026-09-23): **se avisa, no se limpia** — limpiar al importar rompería la acumulación que se
pidió expresamente.

El aviso sale **arriba de la tabla** —lo que se lee primero son los números; un reparo al pie
llega tarde— y **no dispara con el cajón vacío**: un aviso que salta cuando no hay riesgo
entrena a ignorarlo. Se engancha en las tres puertas de importación y **no borra nada**;
«Entendido» lo saca y los datos quedan.


## Cajón Doppler: acumula entre imágenes, y por eso NO puede leer el visor (TC-249)

Mediciones Doppler que se van juntando mientras el estudio está abierto, con acordeón de la
válvula aórtica. **Vive en la app —tab Imágenes— y no dentro del modal del visor.**

### ⚠️ ACUMULAR OBLIGA A CAPTURAR EN EL MOMENTO DE MEDIR

`_medVels`, `_medTiempos` y `_medVtis` son de la **vista** y **`medCambioDeImagen` las vacía**:
están para dibujar sobre la imagen que se está mirando, no para guardar nada. Así que el cajón
no puede leerlas después — tiene que capturar cuando la medición se completa, que es lo que hace
`_dopCapturar` desde los cuatro sitios donde el visor guarda (VTI, las dos ramas de velocidad, y
tiempo/FC).

**La condición que separa esto de un cajón decorativo** es que los valores sigan estando después
de cerrar el visor y abrir otra imagen **mientras las listas del visor están vacías**. Sin esa
segunda mitad, «persiste» se cumpliría leyendo del visor, que es justo lo que no se puede hacer.

### ⚠️ LA FÓRMULA DEL PEDIDO ESTABA EN OTRAS UNIDADES — CIEN VECES

Decía `AVA = 0,785 × Diam² × VTI_TSVI / VTI_VAo`. Es correcta con el diámetro en **centímetros**;
el campo de esta app está en **milímetros**, así que aplicada tal cual da un AVA **cien veces
mayor**. Hay una condición que lo mide con los mismos insumos. Es la misma clase de error que ya
se pagó en el área tricuspídea y en el gasto cardíaco por eco del módulo POP — y el número sale
plausible: 313 cm² es absurdo, pero basta otro factor equivocado para caer en un valor normal.

**Lo que se hizo es no escribir ninguna fórmula.** `calcAo` ya calculaba la continuidad; se
extrajo `_avaContinuidad(dtsviMm, vtiTsvi, vtiAo)` **sin cambiarle una operación** y la usan las
dos. La AVA decide si una estenosis aórtica es severa: dos implementaciones del mismo cociente en
el mismo estudio es el defecto que este archivo persigue desde el THP. Lo mismo el gradiente, que
sale de `_medGradMmHg` —la misma del visor—, y la superficie corporal, de `getBSA()`.

**Es la única línea que se tocó del tab Válvulas**, y es una extracción pura: `calcAo` conserva su
`toFixed(2)` y cae a la expresión anterior si el helper devolviera `null`, para que la extracción
no pueda cambiar lo que se publica.

### La severidad por PHT usa los cortes QUE LA APP YA APLICA

`calcIA_ESC` gradúa con **>500 leve, 200-500 moderada, <200 severa**, y los mismos tres números
están en la referencia del PDF, en el resumen y en el Laboratorio. El pedido traía exactamente
ésos, así que no hubo conflicto — pero conviene saber que **ya hay cuatro copias del corte** y el
cajón es la quinta, declarada en su comentario. Unificarlas exige tocar Válvulas, el informe y el
Laboratorio: fuera del alcance de este cambio.

**Y es un VOTO, no un veredicto.** Allá el PHT es uno de tres parámetros que se integran; acá va
solo. Por eso se rotula «orientativo» y lleva el descargo debajo de la tabla **y quemado en la
imagen** — una tabla de gradientes y AVA que circula sola, y que desde la biblioteca puede llegar
al PDF, sin decir eso es «un número sin su reparo».

### No escribe NINGÚN campo del informe, y esa es toda la arquitectura

Convive con `vmax_ao`, `itv_ao`, `diam_tsvi`, `ava_cont` e `ia_pht` sin tocarlos: los de allá son
el informe firmado y los de acá lo que se está midiendo ahora. **Su salida es una imagen a la
biblioteca**, y desde ahí el médico decide si va al PDF — el mismo camino que cualquier otra
imagen. Hay una condición que verifica que esos seis campos sigan vacíos después de haber medido
de todo.

**Ningún control del cajón lleva `id`**, por lo mismo que los paneles de referencia de Marfan:
`guardarInforme` barre `input[id]` de todo el documento y un campo con id se guardaría en
`campos` de cada estudio. El único id es el del contenedor, que no es un input.

### ⚠️ ES ESTADO DE MÓDULO: tres puertas de limpieza, y la tercera es explícita a propósito

Sin limpiar, las mediciones del paciente A quedan en el cajón del paciente B — la fuga de
`ete_tavi_jet_horas` con otra cara. Se limpia en **«Limpiar»**, en **`limpiarCampos`** (nuevo
estudio y reabrir) y en **`cerrarSesionReal`**. La tercera es redundante hoy —`limpiarCampos`
llega hasta ahí por dos de los tres caminos— y **se pone igual**: el invariante del cierre de
sesión no puede depender en silencio de una línea enterrada veinte mil líneas más abajo, que es
lo que este archivo ya dejó escrito al declarar la mutación superviviente del `_autosaveDescartar`.

**Limpiar borra los DATOS y no cierra el panel:** cerrarlo sería esconder el cajón a mitad de
trabajo.

### El VTI completa la Vmax sólo si está VACÍA

El pico de la envolvente aórtica **es** la Vmax, así que se aprovecha. Pero pisar una Vmax que el
médico midió aparte —con un clic sobre el pico que él eligió— sería el campo «auto» que
sobrescribe lo tipeado, que es el defecto de `vp_gmax`. Regla de `_syncSiVacio` y del importador
DICOM: sólo se completa lo que está en blanco.

### Los derivados no se guardan: se recalculan al pintar

AVA, AVAi, Grad Máx y la severidad salen de `_dopDerivados()` en cada render. Un derivado
almacenado es el campo que se calcula una vez y se queda viejo. Y **aparecen solos** cuando hay
con qué: si falta un insumo la fila no se muestra, en vez de un guion, que al lado de una unidad
se lee como «medido y dio cero».

### Ningún control va en un `onclick` inline: `data-*` con oyente DELEGADO

Semgrep subió **de 126 a 129** con los `onclick="dopArmar('…')"`. Hoy lo interpolado son claves
literales del propio archivo, así que no hay dato de paciente — pero la regla vale igual, porque
en un atributo de evento **el escape no protege**: el parser decodifica la entidad ANTES de
compilar el handler. Es el agujero que este archivo documenta para CardioSalud y el que ya obligó
a convertir el donut de la CIA y la tira de la biblioteca. El oyente va en el **contenedor** y se
registra **una sola vez**: `_dopRender` reescribe el `innerHTML` en cada repintado, así que
enganchar por botón acumularía un oyente por pintada. De vuelta en 126.

**Y al convertirlo, el caso tuvo que empezar a CLICKEAR.** Llamaba a `dopArmar`/`dopHerr`
directo, que prueba la lógica y no el cableado — el hueco exacto por el que pasó el defecto del
VTI en la sesión anterior.

### ⚠️ `dopModo` ALTERNA, como `medToggle`

Llamarlo con el modo ya puesto lo **apaga**. La comprobación por clic dejaba el cajón en aórtica
y el `dopModo('ao')` siguiente lo mandaba a genérico: la tabla pasaba a las filas genéricas y el
botón «medir» de la fila del VTI **dejaba de existir**. En los casos, fijar el modo (`if (modo
!== 'ao')`), no alternarlo. Es la misma trampa que `medToggle` ya costó en TC-196.

### ⚠️ TC-228 PASABA CON `--solo` Y FALLABA EN EL SUITE — octava vez, y la causa no era obvia

TC-249 corre justo antes, y le rompía la condición «cada cosa una sola vez» con `veces=2`. Lo que
lo hace instructivo es **cómo se encontró y cuántas hipótesis fallaron**: no era el `fillText` que
TC-249 envuelve, ni `cerrarSesionReal`, ni `limpiarCampos` — las tres se probaron quitándolas una
por una y las tres siguieron en rojo. Lo resolvió **truncar el cuerpo de TC-249 por mitades** hasta
ver en qué paso aparecía: el **paso 12**, que guarda un estudio y lo reabre para probar el guardado
en biblioteca.

La causa: el `finally` hacía `__t.limpiar()` y **no** `imgVaciar()`. `limpiarCampos` **no suelta
`_imgUuidActual` ni vacía los slots** —lo dice el comentario de `imgVaciar` y lo documenta TC-246
con todas las letras—, así que el estudio reabierto sobrevivía al caso. Y TC-228 intercepta
`fillText` **en el PROTOTIPO**, o sea que cuenta lo que pinte **cualquier** canvas durante su
ventana de 700 ms.

**Dos reglas que deja:** al usar `__t.guardar` + `__t.reabrir` en un caso, el `finally` va con
`imgVaciar()` además de `__t.limpiar()`. Y una condición que cuenta interceptando el prototipo
mide todo lo que pinte la página, no sólo lo suyo — es robusta contra el defecto que vigila y
frágil contra el estado que le dejó el caso anterior.

### Tres condiciones nacieron SIN DENOMINADOR, las tres en el mismo caso

Y las tres las delató una mutación que sobrevivía, no la lectura:

- **«vive fuera del visor»** se escribió como *«existe `#cine-ov` Y no contiene al cajón»* y daba
  **false** sobre un cajón bien ubicado: el visor no se había abierto nunca, así que el overlay
  no existía. El invariante es **«no está adentro»**, que se cumple también sin overlay.
- **«la Vmax medida no se pisa»** medía la Vmax en el MISMO punto que el vértice del triángulo
  del VTI, así que pisarla daba **el mismo número**. Hay que medirla a otra altura.
- **«no escribe campos del informe»** corría **al final**, después de `limpiarCampos` y
  `cerrarSesionReal`: esos campos están vacíos pase lo que pase. Movida a donde el cajón tiene
  los cinco valores cargados, con el denominador al lado.


## El VTI no se podía medir: la herramienta nunca estuvo en la lista de arrastre (TC-218)

**La envolvente no se podía trazar. Nunca.** `_medAreaDown` gateaba por herramienta con una
cadena de `!==` y **`'vti'` no estaba** —verificado con `git log -S`: cero commits, no es que se
haya caído, es que nunca entró—. El `mousedown` salía de inmediato, `_medTrazo` no se poblaba, y
la rama de VTI de `_medAreaUp` —que existe desde el primer día— era **código muerto**: nunca
había un trazo que soltar.

### ⚠️ POR QUÉ NINGÚN CASO LO VIO: TC-218 probaba el ayudante, no la puerta

`_vtiDe(pts)` se llamaba **directo**, con los puntos armados a mano, y el caso ni siquiera abría
el visor. Probaba la integral —que estaba perfecta: 20 cm exactos contra un triángulo analítico—
y no el camino que la alimenta. Es la lección de TC-238 palabra por palabra, y la más cara de
esta serie: *un caso que le pasa los datos a la función no prueba el camino que los arma.*
Desde este commit TC-218 **arrastra de verdad**: abre el visor, aprieta, recorre y suelta.

### Y son DOS mitades: la lista y la calibración de distancia

Agregar `'vti'` a la lista **no alcanzaba**. La misma guarda lleva `|| _medCalibrando`, y
`_medCalibrando` es la calibración de **distancia**, que se enciende sola cuando el archivo no
trae ninguna región 2D medible — o sea en **todo Doppler espectral puro**, que es exactamente
donde se mide un VTI. Así que el arrastre seguía saliendo por la segunda mitad.

La compuerta correcta es *«frená a las que CONSUMEN la escala de distancia»*, no *«frená a
todas»*: el VTI vive de la escala de velocidad y la del tiempo. Eso lo emparenta con Velocidad,
Tiempo y FC, a las que `_medManejador` rutea **sin mirar `_medCalibrando`** — o sea que el VTI
era el único Doppler bloqueado, y sólo por compartir el manejador de arrastre con las cuatro
herramientas de distancia. Hoy `_MED_HERR_ARRASTRE` mapea cada una a la escala de la que vive.

### El otro defecto, y era MUDO: el VTI ignoraba la calibración manual

`_vtiDe` leía la escala de velocidad **sólo de la región del archivo** y no sabía que existe
`_medCalibVel`, mientras `_medVelClic` le da precedencia —su propio comentario lo dice: «la
calibración manual MANDA cuando existe»—. Las dos son alcanzables en la misma sesión sobre la
misma imagen. Medido, con el archivo declarando 0,5 cm/s por píxel y el médico recalibrando a 1:

| | escala | pico del mismo trazo |
|---|---|---|
| herramienta **Velocidad** | manual | **60 cm/s** |
| panel **VTI** | la del archivo | **30 cm/s** |

Un factor 2 —la razón entre las dos escalas— presentado como dos mediciones, sin nada que dijera
cuál era cuál. Y el VTI **viaja**: alimenta el Qp/Qs y se puede cargar al informe. El invariante
que lo fija no es «el número cambia» sino que **el pico del VTI sea idénticamente lo que devuelve
`_medVelCalEn`**, o sea la misma función que usa la herramienta de al lado.

**Y el panel lo DECLARA por fila, no una vez al pie:** las envolventes trazadas antes y después
de recalibrar conviven en la misma lista, y sin la marca por fila dos números de escalas
distintas se leen como dos mediciones comparables.

### ⚠️ EL GRADIENTE MEDIO NO ES 4×(v media)²

Es el promedio de `4v²` **en el tiempo**, así que se integra a la par del VTI y se divide por el
tiempo total. Por Jensen —función convexa— la forma ingenua **subestima siempre**, y más cuanto
más picuda es la envolvente: o sea más en la estenosis severa, que es donde el número decide la
conducta. Sobre el triángulo del caso el valor analítico es `gradMax/3` = 0,333 mmHg y la ingenua
da 0,25. **La condición exige las dos cosas** —que dé el analítico Y que difiera de la ingenua—:
sin la segunda, una implementación equivocada que casualmente se acercara pasaría igual.

### El sitio de guardado copiaba TRES de los SEIS campos

`_medVtis.push` se quedaba con `cm`, `ms` y `picoCms`. Al agregar los gradientes, el panel leía
`v.gradMax.toFixed` sobre `undefined` y **tiraba la barra de medición entera**. Lo cazó el caso,
no la lectura. Se guarda la medición completa —`velManual` ni siquiera se podría reconstruir
después, porque la calibración puede haber cambiado entre que se trazó y que se lee el panel— y
el panel **omite** lo que falte en vez de romper: un throw ahí no deja el panel a medias, se
lleva las nueve herramientas.

### ⚠️ EL ARREGLO ESTUVO A PUNTO DE ENSANCHAR LO QUE EL VTI ACEPTA

Al partir la compuerta en dos ejes, con `_medCalibVel` puesta el `velOK` se cumple por la vía
manual y un **modo M** declara el eje de tiempo: pasaba y publicaba un «VTI» con unidades
correctas y **sin ningún significado**. La calibración manual reemplaza una escala **ausente**;
no pisa una presente que dice que el eje vertical es DISTANCIA. Hoy el modo M se rechaza
**siempre**, y su comprobación va **antes** de la de velocidad — puesta después queda
inalcanzable, porque con calibración manual la de velocidad ni se evalúa.

**Asimetría declarada:** la herramienta Velocidad **sí** dejaría medir ahí, porque da precedencia
a la calibración manual antes de mirar la región. Es deliberado: allá el médico ve un número
suelto; acá lo integra y el resultado alimenta el Qp/Qs y el informe.

### ⚠️ TC-218 ATRAPABA SU EXCEPCIÓN Y NO LA AFIRMABA

Tenía `catch (e) { R.excepcion = ... }` y **ninguna condición la miraba**. Un throw a mitad
dejaba las `R` de abajo en `undefined` y el caso reportaba *seis condiciones vagas* en vez de la
causa. Hoy el denominador va primero. Al escribir un caso con `try/catch`, la primera condición
es que no haya excepción.

### El `\` dentro del template literal, tres veces en una sesión y una cara NUEVA

La trampa que este archivo documenta diez veces volvió tres veces seguidas al escribir este caso,
y una de las tres no estaba descrita:

- **`/Vmax\s*[\d.]+\s*m\/s/`** → el literal se come la barra y llega **`/Vmaxs*[d.]+s*m/s/`**: el
  `\/` quedó como `/` y **cerró el regex antes de tiempo**, dejando `s/` suelto. `SyntaxError`, y
  el caso entero muerto por una condición cosmética. Las otras nueve veces el `\s` sólo dejaba de
  matchear; ésta rompe el parseo.
- **`.replace(/\s+/g, ' ')`** → `/s+/g`, que reemplazó **todas las eses por espacios**. El
  diagnóstico decía «el e pectro», que es lo que lo delató.
- Y el de siempre en `[\d.]`.

**La regla sigue siendo la misma y ahora con más razón: dentro del cuerpo de un caso, `indexOf`.**

### Dos comprobadores que daban rojo sobre código correcto

Los dos del mismo tipo —el denominador—, y los dos costaron una corrida:

- **`indexOf('VTI ')` enganchaba el ENCABEZADO del panel** («VTI — integral velocidad-tiempo»),
  donde no hay número. Hay que buscar **desde la fila**, no desde el principio.
- **`indexOf('CENTIMETROS')` sin tilde** sobre un mensaje que la lleva. Se busca `modo M`, que no
  tiene acentos.


## Deformación: una casilla de Config que gobierna un GRUPO DEL VISOR (TC-248)

El grupo **Deformación** del visor —Strain VI, LARS y Strain VD— queda detrás de una casilla en
⚙️ Config, **apagada de fábrica** y protegida por contraseña.

### ⚠️ NO VA EN `EE_MODULES`, y el motivo lo grita la propia app

Esa lista es de módulos con **pestaña**: cada entrada tiene su botón `data-mod` y hay una guarda
en `DOMContentLoaded` que compara las dos listas. Deformación **no es una pestaña**: es uno de los
tres grupos de `_MED_GRUPOS`, junto a 2D y Doppler/M. Metido ahí, cada arranque imprimiría
`[modulos] EE_MODULES y data-mod no coinciden — sin botón: ['deformacion']` sobre una app
perfectamente sana, y un aviso que grita sin motivo deja de leerse. La casilla se dibuja **suelta**
al lado de las nueve, no dentro del `.map`.

### ⚠️ `eeModOn` FALLA ABIERTO — acá hace falta lo contrario

`eeModOn` es `m[k] !== false`, o sea **visible por omisión**. El default pedido es el opuesto:
apagado hasta que alguien escriba la clave. Por eso clave propia (`ett_deformacion`) y por eso
`eeDefOn` **falla CERRADO**: si `localStorage` tira, el módulo queda oculto, que es el estado
«nada más cambia». Reusar `eeModOn` habría dado un módulo encendido de fábrica.

### Son TRES capas, y cada una tiene su condición

Este archivo ya documenta que *«defensa en profundidad sin una condición por capa es una capa que
nadie sabe si existe»* —lo documenta porque una mutación sobrevivió por eso en TC-206—, así que:

| capa | dónde | qué impide |
|---|---|---|
| 1 | filtro en `_medSideRender` | los tres botones no están en el DOM |
| 2 | `medHerramienta` | pedir `'strain'` con el módulo apagado deja `'dist'` |
| 3 | `_medSoltarDef` | apagar **midiendo** devuelve la herramienta al defecto |

**La tercera es la que menos se ve y la que más importa.** `_medHerr` es estado de la **vista** y
sobrevive al cambio de Config, así que sin ella queda en `'strain'` con su grupo ya fuera de la
barra: el panel se sigue dibujando debajo de una barra que no ofrece esa herramienta. La mutación
que la anula cae por tres condiciones.

**`_medEsDef` deriva de `_MED_HERRS`, no de una lista escrita al lado.** Esa tabla ya declara el
grupo de cada herramienta; con una copia, agregar una cuarta la dejaría fuera del gate y visible
con el módulo apagado — y eso no da error, sólo una herramienta que no debería estar.

### `_medDefOn` cruza de bloque, así que va con guarda

`eeDefOn` vive en el bloque **53** (Config) y `_medSideRender` en el **37** (visor). Una llamada
pelada funciona —las declaraciones de nivel superior quedan en `window`— pero este archivo ya se
quedó sin JavaScript dos veces por un bloque que dejó de parsear, y ahí un `ReferenceError`
adentro de `_medSideRender` se llevaría puesta **la barra entera**: las nueve herramientas, no las
tres del módulo. Falla **cerrado**, igual que `eeDefOn`.

### ⚠️ LA CONTRASEÑA ES UNA BARRERA DE CORTESÍA, NO UN CONTROL DE ACCESO

Queda dicho en el código y se repite acá porque es lo que más fácil se lee al revés. **El gate real
es la bandera de `localStorage`**, que se pone a mano desde la consola en cinco segundos; y un hash
de siete caracteres se rompe por fuerza bruta al instante. Lo que el hash cumple es que el literal
**no esté escrito en el fuente**, que es lo que se pidió. Sirve para que el módulo no se encienda
sin querer; no protege de nadie que quiera entrar. Para dimensionarlo: la clave del **login** de
esta misma app está comparada contra un literal, o sea en texto plano.

**El hash es SÍNCRONO a propósito.** `crypto.subtle` sólo existe en contexto seguro, y este archivo
documenta que la app se usa en `http://192.168.x.x` —la LAN del sanatorio—: ahí un SHA-256 dejaría
al médico **sin poder activar el módulo**, que es el peor lugar para descubrirlo. Se recorta el
texto porque un espacio pegado al pegar la clave da otro hash y el «Contraseña incorrecta»
resultante sería inexplicable.

**El input lleva prefijo `cfg-`**, que `_noEsDelEstudio` excluye. Sin él, `guardarInforme` —que
barre `input[id]` de TODO el documento— metería la contraseña dentro de `campos` de **cada estudio
guardado** y saldría en el backup JSON que el médico manda por correo. Es exactamente el defecto
que el comentario de `doLogin` documenta haber cerrado.

**APAGAR NO PIDE CLAVE, y es deliberado**: la dirección segura sale gratis. Exigirla para apagar
dejaría al médico que la olvidó con un módulo que no puede sacar de la pantalla.

### ⚠️ ENCENDERLO VA EN EL RUNNER, Y ES PORTANTE — medido, no supuesto

Seis casos clickean las herramientas de ese grupo (TC-199, 204, 205, 206, 207, 208). Con el módulo
apagado de fábrica, sus botones **no están en el DOM** y `__t.herr` devuelve
`NO EXISTE cine-med-str` — un diagnóstico que no apunta a su causa. El encendido va en
`__t.resetVisor()`, que corre **antes de cada caso**, por el mismo motivo que el reset del visor:
con una línea por caso, el que se olvide hereda el estado del anterior. Y así TC-248 puede apagarlo
para probar el gate sin llevarse puesto al siguiente, aunque su `finally` no llegue a correr.

**Verificado por mutación del HARNESS**, no por lectura: sacando esa línea, TC-199 y TC-206 caen.
Sin esa comprobación, «estos seis se romperían» habría sido una suposición.

### Dos trampas del propio caso, las dos de denominador

- **La diana NO se dibuja con sólo elegir la herramienta.** `cine-str-be` sale recién cuando hay
  algo trazado, así que mi primera comprobación —«la diana no está con el módulo apagado»— daba
  `false` **en los dos estados** y se leía como un gate que funciona. Lo que sí se dibuja siempre
  es el **panel**, con su selector de ventana apical; ése es el marcador.
- **Y el primer marcador que elegí tampoco servía**: `dos contornos manuales` vive en una rama
  posterior del panel, no en el primer paso. Hubo que **leer la barra** en los dos estados antes de
  elegir qué buscar, en vez de suponerlo.

**El control negativo es lo que separa este caso de uno decorativo:** después de apagar, Área
**sigue andando**. Sin esa condición, «quedó en `dist`» se cumpliría igual con un `medHerramienta`
roto del todo. Lo mismo del otro lado: la condición de que la contraseña no viaje va con un
control negativo —que la FEVI **sí** viaje—, porque «no aparece» se cumple igual con un barrido
roto del todo.

**Backticks dentro del cuerpo de un caso: van CINCUENTA Y CUATRO**, otra vez en un comentario
recién escrito — el que explicaba por qué la contraseña no puede entrar a `campos`, y que estaba
lleno de nombres de función entre acentos graves. `node --check` lo caza, apuntando a la línea del
`caso(`, doscientas líneas antes del culpable.


## El arrastre de la biblioteca NO estaba roto: estaba FINGIDO (TC-247)

El pedido decía «el drag & drop de biblioteca → slot no funciona, corregirlo». Medido antes de
tocar nada: `cineStripRender` son 180 líneas con **cero** `draggable`, **cero** `dragstart`,
**cero** `dataTransfer`. Nunca existió.

**Pero el reporte era exacto como experiencia**, y ahí está lo interesante. La miniatura de la
tarjeta es un `<img>`, y **un `<img>` es arrastrable por omisión en todo navegador**: el gesto
arrancaba, la imagen se despegaba y seguía al puntero, y al soltarla sobre un espacio de la
grilla el manejador hacía

```js
const from = parseInt(e.dataTransfer.getData('text/plain'));   // el dataURL de la miniatura
if (!isNaN(from)) imgSwap(from, idx);                          // NaN → no hace nada
```

O sea que el arrastre nativo llenaba `text/plain` con el `data:` URL, `parseInt` daba `NaN` y el
drop lo descartaba **sin una palabra**. **Un gesto que parece funcionar y no hace nada es peor
que uno que no existe, porque no hay nada que mirar.**

### ⚠️ POR ESO LO QUE NO SE PUEDE ARRASTRAR LLEVA `draggable="false"` EXPLÍCITO

Es la mitad que se olvida. Poner `draggable="true"` en las tarjetas que sí van al informe deja
la falsa promesa viva en las demás —un video, un cineloop, algo que ya ocupa un slot—, que
siguen arrastrándose solas por el `<img>` y siguen sin hacer nada. Hay una condición que exige
que **todas** declaren, y otra que exige que alguna diga que no.

### Una mutación que ROMPE EL ARCHIVO no es una mutación

La primera versión de la que saca `draggable` borraba el tramo `' draggable="' + (alPdf ? … ) +
'"' +`. Ese texto **empieza adentro del literal**, después de la comilla que lo abre, así que el
resultado era `'      ' style="position:...` — sintaxis rota, el bloque entero sin parsear y la
app sin cargar. El caso no dio ni verde ni rojo: **no imprimió resultado**, y en una tanda de seis
eso se lee igual que una corrida lenta.

La mutación correcta cambia `(alPdf ? 'true' : 'false')` por `('false')`: la tarjeta deja de ser
arrastrable **sin tocar la estructura**. Cae en «la tarjeta SE PUEDE arrastrar», que es su
condición.

**Al mutar dentro de una concatenación de cadenas, mutar el VALOR y no el tramo de texto.** Y si
un mutante no imprime `RESULTADO`, el sospechoso es la sintaxis, no el caso.

### El payload va en un TIPO PROPIO, no en `text/plain`

`text/plain` es el carril de la grilla para **reordenar slots** y lleva un índice. Meter ahí un
id lo manda a `parseInt` → `NaN`, que es el defecto de arriba con otra cara. Con
`application/x-ceibomed-bib` los dos arrastres conviven sin pisarse, y hay una condición que
suelta un arrastre **nativo** —sólo `text/plain`— y exige que **no caiga nada**.

### Se hizo SIN TOCAR el módulo de imágenes, y por el patrón que este archivo ya usa

El oyente va **en el contenedor** (`#img-grid`) y registrado una sola vez, no en cada celda:
`imgRender` las reconstruye en cada repintado, así que un oyente por celda muere en el primero.
Es la misma delegación que ya usan el clic de la grilla y la tira.

Y es lo que permitió no tocar `_imgAttach`: el `drop` de la celda corre primero, no encuentra un
índice en `text/plain`, no hace nada, y el evento **burbujea** hasta el contenedor. El
reordenamiento de slots queda intacto.

### ⚠️ SIN `preventDefault()` EN `dragover` EL `drop` NO LLEGA — y la mutación SOBREVIVIÓ

Es la regla de HTML5 que más se olvida, y su síntoma es **idéntico** al de un manejador que no se
registró: no pasa nada y no hay error. Pero sacarla **no ponía el caso en rojo**, y el motivo
importa por partida doble:

1. **Un `drop` despachado con `dispatchEvent` llega igual.** La regla «sin `preventDefault` no hay
   `drop`» la aplica el **motor de arrastre** del navegador, no el despacho sintético. O sea que
   ninguna condición que suelte a mano puede ver ese defecto.
2. **Y para un drop sobre una CELDA la línea es redundante hoy**, que es lo que la primera lectura
   no vio: `_imgAttach` ya le pone a cada celda un `dragover` que previene **siempre**, para
   reordenar slots. El navegador dispara el `drop` igual. Donde la línea **sí** hace falta es en el
   **hueco entre celdas** —ahí el drop cae al primer espacio libre y ningún manejador de celda
   corre—, que es un caso que el arrastre real ejerce y el sintético no distingue.

Lo que sí la caza: despachar el `dragover` **sobre el contenedor**, no sobre una celda. Los
oyentes de `_imgAttach` viven en los descendientes, así que sobre `#img-grid` el único que corre
es el delegado y `defaultPrevented` lo refleja **sólo a él**. Con eso la mutación cae, y la
condición gemela —que un `text/plain` **no** quede prevenido— fija que el carril de reordenar
sigue siendo ajeno.

**La lección general: antes de declarar que una mutación sobrevive por un hueco del caso, buscar
si el invariante ya lo sostiene OTRO código.** Acá lo sostenía una línea escrita para otra cosa, a
8.000 líneas de distancia, y eso cambia qué condición hay que escribir.

### `_bibVaAlSlot` es UNA definición para las dos puertas

El botón 📄 y el arrastre contestan la misma pregunta —¿este archivo puede ocupar un espacio del
informe?—. Estuvo un rato dentro del closure de la tarjeta y el cableado no la veía
(`alPdf is not defined`, **lo cazó el caso, no la lectura**). Copiarla habría sido la lista
paralela de siempre: el arrastre ofreciendo lo que el botón no ofrece en cuanto una se afine.

### Soltar sobre un espacio OCUPADO no pisa nada, y lo dice

`_dcmImgReservar(n, preferido)` ya respetaba el preferido **sólo si está vacío**, así que la
caída al primer libre sale gratis. Lo que se agregó es que el aviso **nombre el destino real**:
un archivo que aterriza en otro lado del que el médico señaló, en silencio, se lee como que la
app hizo otra cosa.

## `beforeunload`: la tercera puerta, y la única que no puede ofrecer «Guardar»

«Nuevo estudio» y «Cerrar sesión» ya preguntaban; cerrar la pestaña no avisaba nada — y es la
salida que el médico usa sin pensarla (⌘W).

**El navegador pone SU diálogo y no se puede personalizar** desde Chrome 51 y Firefox 44: no hay
texto propio ni botones propios. Lo único que se decide desde la app es **si aparece**. Por eso
acá no hay tres opciones como en las otras dos puertas.

**Se marca con `preventDefault()` Y con `returnValue`, y hacen falta los dos**: el primero es lo
que dice el estándar, el segundo es lo que Chrome sigue mirando. Devolver la cadena es la tercera
forma histórica y se deja por los navegadores viejos.

**FALLA HACIA DEJAR CERRAR.** Si el predicado no está, no se bloquea la salida: un diálogo sobre
un formulario vacío entrena a cerrarlo sin leer, y el que se cierra sin leer es el que no protege
el día que importa. Ojo con la asimetría: `_hayAlgoSinGuardar` falla **cerrado** por su lado, así
que un error de verdad **sí** pregunta; lo que no pregunta es la *ausencia* del predicado.

**Se extrajo con nombre (`_beforeUnloadAviso`) para poder probarlo.** Un caso no puede cerrar la
pestaña, pero sí llamar a la función con un evento de mentira y mirar si la marcó — que es el
invariante. Sin extraerlo, esto se quedaba sin cobertura.


## «No deja importar sin guardar» NO REPRODUCE — y lo que sí faltaba era el cineloop (TC-246)

El pedido del 2026-09-23 decía que EcoSmart no permite importar si el estudio no está guardado.
**Medido antes de tocar una línea**, en un estudio sin nombre, sin cédula y sin guardar:

| | |
|---|---|
| DICOM fijo por `dcmImgImportar` | **entra** — slot +1 |
| JPEG por `mediosImportar` | **entra** — slot +1 |
| CHM por `dcmImportarSR` | **abre su vista previa con 35 filas**, y los slots anteriores siguen |
| excepciones | **cero** |

Ninguna de las cuatro puertas de importación mira el uuid ni `_cinePuedeGuardar`. Lo que el
médico ve es un **toast** que avisa que la imagen no se va a escribir en disco porque «Guardar
imágenes con los estudios» está **apagado de fábrica** — y eso no es una restricción para
importar: es el aviso que se agregó a propósito para que *el interruptor deje de mentir sobre el
disco*. **Sacarlo reintroduce un defecto cerrado**, y hay una condición de TC-246 que lo fija.

### Lo que SÍ faltaba, y es una asimetría vieja

`_cinePuedeGuardar()` exige toggle **y** estudio guardado, y gobierna **escribir en disco**, no
importar. Para las **fijas** existe la contrapartida desde TC-233 —`medFijasPersistir(uuid)`,
disparada desde `imgPersistir`, que es el único momento en que el uuid existe—. Para los
**cineloops no existía**: el 💾 del visor sobre un estudio sin guardar decía «guardá el estudio
primero» y **no dejaba nada anotado**. Había que acordarse de volver al visor y apretarlo otra
vez, y nadie se acuerda.

Hoy `_cineEncolar` lo anota y `_cinePendientesPersistir(uuid)` lo escribe al guardar.

### ⚠️ SE ENCOLA SÓLO SI LO QUE FALTA ES EL uuid

Por eso `_cinePuedeGuardar` devuelve `falta:'toggle'|'uuid'` y no sólo `ok`. Con el toggle
apagado, encolar sería prometer un guardado que **no va a ocurrir nunca**: ahí el médico tiene
que ir a encenderlo, y el `alert` de siempre es la respuesta correcta.

### ⚠️ LA LLAMADA VA ARRIBA DEL `return` TEMPRANO DE `imgPersistir`

Ese return corta cuando **no hay imágenes** (`!vivas.length && !_imgEditado`), y un estudio puede
tener **sólo cineloops**: el médico que importó un cineloop, apretó 💾 y no guardó todavía no
tiene ningún slot lleno. Puesta debajo, la cola no se vaciaba nunca y el 💾 volvía a ser el botón
que no anota nada. Es el modo de falla de TC-233 con la variante de que **lo que corta es la
ausencia de otra cosa**.

### La cola se vacía al cambiar de estudio, o es una fuga entre pacientes

Es memoria de sesión y sobrevive al cambio de estudio igual que la época. Sin la línea en
`limpiarCampos`, un cineloop que el médico pidió guardar sobre el paciente A —y que nunca se
escribió porque no guardó ese estudio— se escribiría **dentro del estudio del paciente B**. Es la
fuga de `ete_tavi_jet_horas` con los píxeles de otro paciente.

**La asignación va pelada, sin `typeof` ni try/catch.** `_cinePendientes` es un `let` del mismo
bloque declarado más abajo: a la hora en que `limpiarCampos` corre ya está inicializado, y un
`typeof` sobre zona muerta **lanza** en vez de devolver `'undefined'` — envuelto en un catch
dejaría la cola sin limpiar **en silencio**, que es el fallo abierto que la línea viene a cerrar.

### Encolar RETIENE MEMORIA, y se declara

Los fragmentos son vistas sobre el ArrayBuffer del archivo entero, así que mientras la cola viva
esos megas viven con ella — es el mismo motivo por el que `cineCerrar` suelta `V.datos`, y el más
grande del pendrive son 17 MB. Se acepta porque la cola **sólo tiene lo que el médico pidió
guardar** y se vacía al guardar o al cambiar de estudio. Encolar «todos los cineloops abiertos por
las dudas» habrían sido decenas de MB que nadie pidió.

## «Cerrar» no existe como una sola cosa, y el modal de tres opciones YA ESTABA

El pedido pedía un aviso «al cerrar» con tres opciones. En esta app **cerrar son tres cosas
distintas** y sólo una tenía dueño:

| | qué hacía |
|---|---|
| cerrar la pestaña | **no hay ningún `beforeunload`** — no avisa nada |
| «Cerrar sesión» | no avisa, y deja formulario e imágenes intactos detrás del overlay |
| **«Nuevo estudio»** | **ya tenía el modal con las tres opciones exactas** |

Decisión de Maicol (2026-09-23): el aviso es el de **«Nuevo estudio»**. Lo que cambió es el texto
—nombra las **imágenes**, no sólo «los datos»— y que **sólo aparece si hay algo que perder**.

### El título nombra las imágenes a propósito

El caso que este aviso protege es el del médico que importó del pendrive y **todavía no puso el
nombre**: formulario vacío y slots llenos. Decir sólo «datos» describe la mitad de lo que se
pierde, y es justo la mitad que no se ve mirando el formulario.

### ⚠️ «HAY ALGO QUE PERDER» SON TRES COSAS, NO UNA

`_hayAlgoSinGuardar` mira formulario, **imágenes de los slots** y **cineloops encolados**. Mirar
sólo el formulario dejaba fuera exactamente el caso de arriba. Y **falla CERRADO**: ante cualquier
error responde que sí hay. Preguntar de más cuesta un clic; preguntar de menos cuesta el estudio.

### El predicado de «formulario vacío» se EXTRAJO, no se copió

`_formTieneDatos` es ahora una sola definición para las dos preguntas que son la misma vista desde
los dos lados: `_autosaveRestore` pregunta «¿está vacío?» y `nuevoEstudio` «¿hay algo que perder?».
Esa heurística **ya se afinó dos veces** —primero por los `readonly`, después por `firma-esp`— y
cada vez estuvo a punto de dejar la restauración del borrador muerta; con dos copias, la próxima
afinada deja una vieja. **«Con datos» es distinto de su `defaultValue`, no distinto de cadena
vacía**: cuatro campos traen texto del HTML o los llena la configuración del médico.

### Al pedir el paciente, se lleva AL CAMPO

`guardarInforme` avisaba «ingresá nombre o documento» y dejaba al médico donde estuviera — y desde
«Nuevo estudio» el modal ya se cerró, así que podía quedar mirando otra pestaña. Ahora hace foco
en `#nombre` y va a la pestaña Paciente. Va **donde vive la regla** y no en el llamador: con una
copia por camino de guardado, el día que la regla cambie una se queda vieja.

### ⚠️ «CERRAR SESIÓN» AHORA PREGUNTA Y LIMPIA — y con eso se cierra un pendiente viejo

Hasta hoy `cerrarSesion()` sólo tapaba la app con el overlay del login: detrás quedaban
**intactos el formulario, las imágenes y el borrador del autosave**. En un hospital eso es una
computadora compartida con el estudio del paciente anterior a la vista del siguiente. Este
archivo ya lo tenía anotado en «Deuda conocida» —«`cerrarSesion()` no es un borde de sesión»— y
lo dejaba ahí porque cerrarlo exigía **una decisión de producto**:

> *«limpiarlo pierde trabajo en curso, conservarlo mantiene la fuga»*

**El modal ES la decisión.** No se descarta nada sin haberle ofrecido guardarlo primero, así que
el dilema deja de existir: se pregunta con las mismas tres opciones y recién después se limpia.
Decisión de Maicol (2026-09-23).

**El borrador del autosave también se descarta, y sin eso el resto no sirve de nada.**
`_autosaveRestore` corre en `DOMContentLoaded` **sin mirar `ett_auth`**, así que el formulario del
paciente anterior volvería solo detrás del login en cuanto alguien recargue. Limpiar la pantalla
y dejar el borrador es tapar la fuga por el lado que se ve.

**Un solo modal para las dos salidas.** «Nuevo estudio» y «Cerrar sesión» hacen la misma pregunta
y tienen las mismas tres respuestas; lo único que cambia es el texto y a dónde se va después
(`_neModo` / `_neSalir`). Con dos modales, el día que se agregue una opción una de las dos salidas
se queda vieja.

**FALLA HACIA EL COMPORTAMIENTO VIEJO, no hacia limpiar.** `cerrarSesion` vive en el bloque 3 y
todo lo demás en el 12 — ya usaba `typeof` para lo de allá. Si el bloque 12 no está, se cierra la
sesión **sin** limpiar, que es lo que hacía antes: perder el estudio en curso por un bloque que
dejó de parsear sería peor que la fuga que esto viene a cerrar. Por eso el predicado se lee a
`null` y se compara contra `true`/`false` explícitos, no por truthiness.

**Contrapartida declarada:** un estudio ya GUARDADO y sin tocar también dispara la pregunta — el
predicado mira si hay datos en pantalla, no si difieren de lo guardado. Se acepta: ahí «Cerrar sin
guardar» es la respuesta correcta y no se pierde nada, y el lado alternativo —no preguntar— es el
que deja el estudio a la vista del próximo.

### ⚠️ UNA MUTACIÓN SOBREVIVE, Y ESTÁ DECLARADA: el `_autosaveDescartar` de `_neSalir`

Sacarlo deja TC-246 **en verde**. No es un hueco del caso: es que `limpiarCampos` **ya hace ese
`removeItem`**, y los dos caminos que llegan a `_neSalir` —«Guardar y continuar» y «Continuar sin
guardar»— pasan antes por ahí. O sea que la línea es redundante hoy.

**Queda igual, y por un motivo concreto:** el invariante del cierre de sesión no puede depender
*en silencio* de una línea enterrada a veinte mil líneas, dentro de una función cuyo trabajo es
otro. El día que alguien separe «limpiar el formulario» de «descartar el borrador» —que es una
separación razonable— la fuga vuelve sin que nada la nombre. Lo que **sí** cubre el caso es el
invariante, no la implementación: *tras cerrar sesión no queda borrador*, venga de donde venga.

Es el mismo criterio con el que este archivo conserva los extremos redundantes del contorno de 3
puntos y el `classList.toggle` del render: **se declara que la mutación sobrevive en vez de
apretar la condición a un detalle que la cace**.

### ⚠️ TC-184 SE PUSO EN ROJO, Y POR DOS MOTIVOS DISTINTOS — sólo uno era esperado

El esperado: fijaba que sin uuid **sale un `alert`** que manda a guardar el estudio. Eso es
exactamente lo que este cambio saca — ahora hay un toast que dice que **espera**, no que falta.
El `alert` se conserva para la otra compuerta, la del **toggle apagado**, que es donde el médico
sí tiene que ir a hacer algo; esa condición sigue verde y es la que separa las dos.

**El segundo no era esperado y es la lección:** el paso siguiente del caso hace
`imgPersistir(uuid)` y después cuenta **un** registro para medir *«con las dos condiciones,
guarda solo al importar»*. Con la cola viva, ese `imgPersistir` **escribía además el cineloop
encolado dos pasos antes**, así que el conteo daba 2 y caían tres condiciones que no tienen nada
que ver con el cambio.

No es un defecto del producto: en el flujo real el médico no importa dos veces el mismo archivo,
y la cola se vacía al escribirse. Es que **una cola que sobrevive al `cineCerrar` cruza los pasos
de un caso**, y el caso contaba registros suponiendo que nadie más escribía. Hoy TC-184 la vacía
explícitamente antes de ese paso, con el motivo escrito.

**La regla que deja: al agregar algo que ESCRIBE en el guardado del estudio, buscar los casos que
CUENTAN registros.** El `grep` útil no es por el nombre de lo nuevo —no lo mencionan— sino por
`CeiboCine.listar` y por los conteos de la tira.

### Una trampa del propio caso: `__t.limpiar()` NO es «Nuevo estudio»

`__t.limpiar()` llama a `limpiarCampos`, que **no vacía las imágenes ni suelta `_imgUuidActual`**
—lo dice el comentario de `imgVaciar`—. El camino real es `neContinuarSinGuardar()`, que llama a
las dos. La primera versión de TC-246 usaba el primero, así que el estudio seguía teniendo uuid y
el 💾 **guardaba en vez de encolar**: el caso medía una ruta que el médico no recorre.


## El panel de Simpson es UNO para las dos vistas — y quién manda al confirmar

Con las dos vistas midiendo Simpson, el resultado, la tabla, el texto y los botones se
dibujaban **una vez por vista**. No era un descuido: `_simpPanel()` se pinta dentro de
`cine-med-barra`, que es de cada vista, y la tabla ya cruzaba las dos desde TC-241 — lo que se
duplicaba era el continente, no el dato. Hoy todo eso vive en **`#cine-simp-uni`**, un nodo
compartido debajo de las dos vistas.

### ⚠️ MANDA EL TRAZADO, NO EL SELECTOR

Es la decisión que sostiene todo el panel. Con un solo «Confirmar trazado» hay dos candidatos a
destino —la ventana que marca el selector y la vista donde el médico acaba de trazar— y **no
pueden ser el selector**: el contorno pendiente vive en la vista cuyo canvas se usó, así que un
selector apuntando a la otra ventana confirmaría en el lugar equivocado, o no haría nada, que
desde la pantalla se ve igual que un botón roto. Y lo primero es peor que lo segundo: atribuye
un contorno a una ventana que no es la suya, que es la misma clase de daño que las paredes
intercambiadas del strain.

`_simpDestino()` resuelve en este orden: **1)** la vista con trazado pendiente —la activa
primero, si las dos tuvieran uno—; **2)** la ventana elegida en el selector, esté donde esté;
**3)** la vista activa. El selector se dibuja marcando la ventana del DESTINO, así que **sigue**
al trazado en vez de contradecirlo, y mientras hay algo sin confirmar el panel lo dice.
Decisión de Maicol (2026-09-22).

### El selector NO es «vista A / vista B», y por eso hay `_simpUbicarVentana`

Es `A4C / A2C`, o sea la ventana anatómica, y eso es lo que hace que el panel único sirva para
los **dos** flujos: el biplano cruzado (la 4C en la vista A y la 2C en la B) y el biplano dentro
de UNA vista (trazar, cambiar de cineloop, trazar — que es lo que el propio panel recomienda y
lo que ejercen cinco casos con `medSimpsonSegundaVista`). Un toggle que eligiera la vista del
visor rompía el segundo.

Por eso hay un resolutor `ventana → {V, i}` que recorre las dos vistas. Y al declarar una
ventana que todavía no existe se reusa **`medSimpsonElegirVista`** en vez de reescribir su
regla: la de no renombrar un par que ya tiene contornos, que es afirmar sobre una medición ya
hecha.

### ⚠️ LA GUÍA DEL TRAZADO SE QUEDA EN CADA VISTA, y es una decisión

El panel por vista no quedó vacío: conserva la línea de **paso en curso** —qué fase trazar y
cómo—. Mudarla abajo la dejaba a media pantalla de la imagen a la que se refiere. Lo que sí se
sacó de ahí es todo lo que no depende de qué canvas se está mirando. Decisión de Maicol
(2026-09-22).

### El botón de integrar del biplano de UNA vista se habría perdido en silencio

`cine-simp-integ` vivía en el panel por vista, y `cine-biplano` —que es el titular del cruce
A × B— **sólo aparece con las dos vistas**. Al recortar el panel por vista, un biplano trazado
con las dos ventanas dentro de una sola vista se quedaba sin ninguna forma de llegar al campo
FEVI del informe. Hoy el botón sale en `_simpUniCabecera`, que es la rama que se dibuja
justamente cuando no hay cruce. **Al mover un panel, enumerar los botones que se llevaban una
acción que nadie más ofrece.**

### `_docGuardarEnBiblioteca` devuelve el REGISTRO, no `true`

Hacía falta el id para ofrecer «Eliminar» sobre el archivo recién guardado. Es un ensanche
compatible —los dos llamadores sólo miraban la verdad del retorno y un objeto es truthy— y no
un cambio de contrato. El «📄 Incluir en PDF» de ese bloque va por **`_bibAlSlot(id)`**, o sea
desde lo ya guardado y no regenerando el canvas: con dos caminos, lo que queda en los archivos
del estudio y lo que sale en el informe podrían comprimirse distinto.

`_simpUniDocId` es de **sesión** y no se persiste: sólo le da salida al gesto que el médico
acaba de hacer.

### El id del panel va en `_CINE_COMPARTIDOS`

Es del modal, no de una vista. Sin esa entrada `_medEl` lo buscaría como `b-cine-simp-uni`
desde la vista B y devolvería null — sin error, sólo un panel que deja de repintarse.

### Se repinta desde DOS embudos, y hacen falta los dos

`_vBiplanoPintar` (donde cambia el cruce A × B) y `_medEstado` (cada repintado de barra). El
segundo no es redundante: el trazado pendiente, la ventana declarada y el par completo salen de
la sesión de UNA vista y tienen que verse abajo en el acto, y eso no pasa por el biplano.

### ⚠️ AL RECORTAR EL PANEL POR VISTA SE PERDIERON LAS SALVEDADES CLÍNICAS

Y no lo vio la lectura: lo cazó **TC-190 poniéndose en rojo**. Se fueron con el recorte el aviso
del **ápex escorzado** —que la guía lista como la limitación principal del método—, el
«**todavía NO está en el informe**» y la guía de cómo llegar al biplano desde un monoplanar.
Publicar la FEVI sin ellas es «un número sin su reparo», que es lo que este archivo persigue
desde la nota del NT-proBNP.

Están repuestas en `_simpUniTexto`, **una sola vez**. La lección general: al mover un panel, lo
que se enumera no son los controles sino **las afirmaciones que ese panel hacía** — un botón que
falta se ve; una salvedad que falta, no.

### Los seis casos reapuntados, y por qué ninguno cambió de invariante

| caso | leía | lee |
|---|---|---|
| TC-190 | resultado y salvedades en `cine-med-barra` | en `cine-simp-uni` |
| TC-191 | «Método» y «campo FEVI» en la barra | en el panel único |
| TC-192 | nombres de imagen y «MISMA imagen» en la barra | en el panel único |
| TC-237 | `[data-simp-vista]`, tabla en la barra | `[data-simpuni-vista]`, tabla única |
| TC-239 | `[id$="cine-simp-limpiar"]`… | `#cine-simp-limpiar-u`, y exige **uno** de cada |
| TC-241 | comparaba `tablaA` contra `tablaB` | **una** tabla y **cero** en las barras |

**TC-241 es el que más cambia y el que queda más fuerte.** Comparar las dos copias era la forma
de cazar que una quedara vieja; con una sola tabla eso es imposible por construcción, así que la
condición pasó a exigir que no haya dos. Y TC-191 dejó de pinar la oración entera («Ya está en
el campo FEVI») para buscar `campo FEVI`: un caso que fija el texto hay que tocarlo cada vez que
el texto cambia a propósito.

**TC-239 tenía un `[id$="…"]` que se volvía vacuo.** Con los ids sin prefijo, la terminación
seguía matcheando otra cosa o nada; pasó a id exacto **y a contar**, porque «existe» no distingue
uno de dos y dos es justamente el defecto que este cambio saca.

### TC-245 fija la decisión de ruteo, que es lo único sin cobertura previa

Verificado por mutación: invertir el orden de `_simpDestino` —que el selector le gane al
trazado— y hacer que `_simpEnDestino` corra en la vista activa ignorando el destino. Sin ese
caso, las dos pasaban en verde y el contorno terminaba atribuido a la ventana equivocada.

**Una trampa del propio caso:** `_simpAceptar` deja el trazado pendiente y **no repinta** — en la
app el repintado lo dispara el `mouseup` del canvas, que hace `_medPintar(); _medEstado();`. La
primera versión leía el panel sin eso y la condición del aviso daba rojo **sobre código sano**.
Al fabricar un trazado a mano, correr también lo que el manejador corre después.


## La sesión de medición sobrevive al visor, así que necesita dueño (TC-206)

Desbloquea `wip/visor-strain-integrado`, que quedó parkeada con doce rojos porque conservar lo
medido al cerrar el visor abrió una fuga entre pacientes. Las tres tareas de aquella rama
—diana integrada, la vista A que abre midiendo y el ✕ que cierra todo sin perder nada— quedan
como estaban; lo que cambia es **de quién es** una medición.

### ⚠️ EL DEFECTO: `_strainPersistir` CORRE EN CADA REPINTADO Y LEE LA SESIÓN EN MEMORIA

Hasta que el ✕ conservó los trazados, la fuga era imposible por accidente: el observador del
overlay llamaba a `medApagar` y se llevaba puesto todo. Desde que se conserva, la sesión vive
**más que la pantalla que la creó**, y el estudio de abajo puede cambiar sin que el visor se
entere — «Nuevo estudio» y «reabrir» no lo tocan.

Medido con una sonda que imprime el estado en cada paso, que es lo que lo resolvió:

| | sesión de la vista A | campo `strain_manual` |
|---|---|---|
| medido el paciente A | VIVO | el resumen de A |
| `cineCerrar()` | **VIVO** | el resumen de A |
| tras «Nuevo estudio» | **VIVO** | vacío |
| se siembra otro estudio | VIVO | `-19.5` |
| se abre el visor **sin medir** | VIVO | **el resumen de A otra vez** |

El último paso es el defecto: abrir el visor dispara `_medEstado` → `_strainPersistir`, que
publica la sesión que quedó viva sobre el campo del estudio nuevo. Se ve en el `ts` del JSON,
que pasa de la fecha sembrada a una nueva.

### LA GUARDA DE CONTEXTO NO FALLABA: NO DISPARABA NUNCA

La rama traía una comparación por nombre + documento + uuid al reabrir el visor, y desactivarla
daba el mismo resultado que dejarla. El motivo no es que estuviera mal escrita: **en el flujo
real el visor se abre ANTES de llenar el formulario**, así que los tres campos están vacíos y
dos estudios seguidos dan la misma clave `{'','',''}`. Se sacó, no se complementó — un resguardo
que no se puede hacer fallar se lee como protección sin serlo.

**La lección general: una identidad que se lee del formulario no sirve para marcar algo que nace
antes que el formulario.** Lo que invalida una medición no es «cambió el nombre del paciente»,
es el EVENTO «cambió el estudio».

### La época: un contador, no una identidad

`_estudioEpoca` sube **una vez** en `limpiarCampos`, que es el embudo por el que pasan los cuatro
caminos que cambian de estudio —«Nuevo estudio» con y sin guardar, `editarInforme` y
`cargarEstudioPorId`, verificado por `grep` de sus llamadores—. Cada vista guarda en `epoca` la
del estudio que midió, y `_vEpocaVigente(V)` responde si esa sesión todavía tiene dueño.

**No depende de lo que el médico haya escrito**, así que no tiene el agujero de la guarda
anterior. Y de paso arregla el caso que aquélla tenía que tratar aparte: el uuid aparece a mitad
del trabajo —medir y guardar al final es el flujo normal— y con la época eso no es un cambio de
estudio, así que los trazados no se sueltan al guardar.

### ⚠️ SON DOS MITADES Y NINGUNA REEMPLAZA A LA OTRA

- **El borde de ESCRITURA** —`_vEpocaVigente` en `_strainResumenDeVista`, en `_simpFilasVivas` y
  en `_vBiplanoDatos`— es lo que impide que la medición de un estudio entre al campo de otro.
- **La limpieza al abrir** —en `_cineAbrir`— es lo que evita que el médico vea el panel y la
  diana del paciente anterior mientras mide al siguiente.

Sin la primera hay fuga; sin la segunda hay una diana que miente en pantalla.

**Y la de escritura NO la ejercía ninguna condición.** La mutación que la borra **sobrevivió** a
la primera versión del caso, porque en el escenario de TC-206 la limpieza de `_cineAbrir` corre
antes que cualquier persistencia y tapa el agujero. Se agregó una condición que llama a
`_strainPersistir()` **directo**, con la sesión caduca viva y un centinela en el campo. *Defensa
en profundidad sin una condición por capa es una capa que nadie sabe si existe.*

### El caso mixto: una vista fresca y la otra caduca

`_vBiplanoDatos` es **el único sitio que cruza las sesiones de las dos vistas**, y las compuertas
de `_simpFilasVivas` no lo alcanzan: aquéllas filtran cada fila por separado y ésta **multiplica**
los diámetros de una vista por los de la otra. Lo que salía no era una fila de más sino **una
FEVI biplano con la 4C de un paciente y la 2C de otro** — y esa FEVI la ofrece `_simpEscribirFEVI`
para integrarla al informe firmado. Un número presentable y de nadie.

Lo encontró auditar los lectores directos de `V.simp` / `V.strain`, no el suite: **son sólo dos
en todo el archivo**, y el otro ya estaba cubierto. **Queda verificado por razonamiento y por la
compuerta, no por un caso**: montar dos vistas de dos estudios distintos exige un escenario que
hoy ningún caso arma. Declarado, no resuelto.

### ⚠️ EL `++` VA FUERA DEL `try/catch`, Y ESTUVO ADENTRO UN RATO

La tentación es ponerlo pegado al vaciado de `strain_manual`, que es donde se lee natural. Ahí
está mal: esas dos líneas viven en **`eteShuntTaviReset`**, que `limpiarCampos` llama envuelta en
`try { } catch (e) {}`. Cualquier excepción de las líneas de arriba —un id que cambie, un canvas
que no esté— se come el `++` **en silencio** y la fuga vuelve con el suite en verde.

Hay una mutación que lo fija: con `eteShuntTaviReset` lanzando, TC-206 cae por «NO SE FILTRA AL
PACIENTE SIGUIENTE» —el vaciado del campo sí se pierde— y **NO** por las condiciones de la época,
que siguen en verde. Eso es exactamente lo que se quería: las dos protecciones son independientes.

### Una condición del caso CAMBIÓ DE SIGNO a propósito

TC-206 decía «cerrar el visor limpia la sesión» y pinaba el comportamiento anterior. El ✕ ahora
conserva, así que esa condición daba rojo sobre el código que se vino a escribir. **No se borró:
se reapuntó a un invariante más fuerte** —la sesión sobrevive (si no, el ✕ perdería varios minutos
de trabajo sin avisar) Y sigue atada a su estudio—, más dos condiciones nuevas que separan «sigue
viva en memoria» de «ya no puede publicarse». Con una sola, «sigue viva» se leería como la fuga y
«no pertenece» se cumpliría sobre una sesión que no existe.

### Si aparece un quinto tipo de medición

Su `_xIniciar` tiene que llamar a `_vSellarEpoca()`, como ya hacen los cuatro que hay —Simpson,
strain del VI, LARS y strain del VD—. Olvidarlo **no da error**: deja `epoca` en la del tipo
anterior o en `null`, y esa medición queda sin dueño, que es el estado exacto que produjo TC-206.
Y `_medSoltarSesiones` devuelve `epoca` a `null` **en la misma línea** que las sesiones: dejarla
con el número viejo sobre una vista ya vacía haría que el primer trazado del paciente siguiente
naciera marcado como del anterior.

### ⚠️ «ABRIR LISTO PARA MEDIR» NO PUEDE PISAR LA HERRAMIENTA ACTIVA

Defecto **de producto**, encontrado persiguiendo los rojos del suite y **no** reportado por
nadie. `_cineAbrir` forzaba `_medHerr = 'dist'` en cada apertura, y `_cineAbrir` es la puerta por
la que **la tira abre otro cineloop**. O sea que el médico que hace un Simpson biplano —traza la
4C, cambia a la 2C, traza— volvía a Distancia al cambiar de imagen, **en silencio**: los
contornos siguientes no entraban al Simpson y el par quedaba a medias. Lo mismo el strain, que
trabaja igual sobre dos o tres ventanas apicales.

Las dos mediciones que CRUZAN imágenes son justo las que el visor rompía. Hoy, si ya está
midiendo, no se le toca nada: «abrir listo para medir» significa encender la medición cuando
está apagada.

**Se llevó por delante el fallo REAL de cuatro casos** —TC-192, TC-200, TC-201 y TC-228—, y eso
es lo que lo delata como defecto de producto y no como una expectativa vieja del suite: un
cambio de contrato rompe condiciones que *afirman lo contrario*; esto rompía **resultados
clínicos**. TC-200 imprimía «2 vistas dan 4 territorios — encontrado: **2**», TC-201 y TC-192
reventaban con `TypeError` sobre un canvas y un trazado que nunca se completaban.

Precisión, porque la diferencia importa al leer el diff: a TC-192 este arreglo le sacó el
`TypeError`, y **después** siguió necesitando el reapuntado del contrato de cierre. Son dos
causas distintas en el mismo caso, y sólo una era del suite.

### Los casos que usaban el cierre como reset, y cómo se reapuntaron

**Seis** casos fijaban «cerrar el visor limpia / borra la sesión», que es la premisa que el ✕
vino a cambiar — los cinco de la tabla más el propio TC-206, que está descrito arriba.
**Ninguno se borró**: en los seis la condición se partió en las dos que ahora corresponden, y la
segunda es la que no existía antes.

| caso | decía | dice |
|---|---|---|
| TC-192 | `_simp === null` | conserva la sesión **y** sigue atada a su estudio |
| TC-196 | `!medOn && simp === null` | apaga la medición (pantalla) **y** conserva el Simpson (trabajo) |
| TC-199 | `strain === null` | conserva **y** mantiene dueño |
| TC-204 | `medGrupo==='2d' && lars===null` | el grupo vuelve al defecto **y** el LARS se conserva |
| TC-205 | `vd === null` | conserva **y** mantiene dueño |

**El patrón que se repite en los cinco: mezclaban ESTADO DE PANTALLA con TRABAJO DEL MÉDICO en
una sola condición.** `_medOn` y `_medGrupo` son de la pantalla y siguen reseteándose; las
sesiones son el trabajo y sobreviven. Mientras cerrar destruía las dos cosas a la vez, la
distinción no se notaba.

**Y TC-196 tenía además un `medToggle` pelado.** Hoy el suite tiene **cuarenta** sitios con la
guarda `if (!_medOn) medToggle()` y éste se escapó porque usa la forma `_vCon(V, medToggle)`:
**un `grep` del patrón con paréntesis no lo encuentra**. `medToggle` ALTERNA, así que con el
visor abriendo ya encendido el toggle lo **apagaba** y el caso medía lo contrario de lo que dice
medir. Al alinear una llamada que cambió de contrato, buscar también las formas que la pasan
**por referencia** — es la misma lección que «`grep` de la llamada no encuentra lo que se pasa
como callback», que este archivo ya documenta para `medCambioDeImagen`.

### ⚠️ EL SUITE CORRE LOS 259 CASOS EN UNA SOLA PÁGINA, y el reset del visor salía GRATIS

No hay recarga entre casos: el runner evalúa uno tras otro sobre el mismo documento. Hasta
ahora el aislamiento del visor lo daba el propio defecto que esta sesión vino a arreglar —
`cineCerrar()` llamaba a `vistaBCerrar()` y el observador del overlay a `medApagar()`, así que
cualquier caso que terminara cerrando dejaba la pizarra limpia para el siguiente.

Desde que cerrar **conserva**, la vista B y las sesiones sobreviven al caso que las creó.
Resultado medido: **TC-228, TC-239, TC-241 y TC-244 verdes con `--solo` y rojos en el suite**, y
los cuatro con diagnósticos que no apuntaban a su causa —TC-244 acusaba a su propio denominador
(«este caso corre con UNA vista») cuando lo que pasaba es que el caso anterior le dejó dos—.

**El reset va en el RUNNER, no en cada caso** (`__t.resetVisor`, llamado antes de cada uno). Con
una línea por caso, el que se olvide hereda el estado del anterior; y son los casos que todavía
no existen los que más van a olvidarse. Cada paso va en su propio `try`: si uno falla, los demás
tienen que correr igual.

**Es aislamiento del suite, no comportamiento de la app.** En la app, conservar entre aperturas
es lo correcto y quien decide de quién es una medición es la época. Confundir las dos cosas
llevaría a «arreglar» el producto para que el suite quede verde, que es exactamente al revés.

### Backticks dentro del cuerpo de un caso: van CINCUENTA Y DOS

Tres tandas en la misma sesión, las tres en comentarios recién escritos — y la última explicando
por qué `medToggle` alterna. `node --check` las caza, apuntando a la línea del `caso(`, decenas
de líneas antes del culpable. **El barrido que conviene** es recorrer cada cuerpo de caso
contando backticks no escapados: encuentra las cuatro de un saque en vez de una por corrida.


## El visor no tenía UNA regla responsive — y el descalce no era de mobile (TC-244)

Medido con las dos vistas abiertas, antes de tocar nada:

| | 1400 px | 900 px | 390 px |
|---|---|---|---|
| layout | A 127‥694 · B 706‥1273 | side by side + scroll horizontal | paneles de **158 px** |
| botones fuera del viewport | 0 | 0 | **4** |
| **calce del overlay tras resize** | **0,−67 · 363×303** | **0,−67 · 209×174** | — |

**Las vistas NO se superponen: se aplastan.** `superpuestos: false` en los tres anchos. Lo que
pasa es que `#cine-paneles` era `display:flex` fijo y las dos se repartían el ancho que hubiera.

### ⚠️ EL DESCALCE DE LAS MEDICIONES PASA TAMBIÉN EN DESKTOP

Se reportó como problema de pantallas chicas y no lo es. `_medPintar` calza el canvas de
medición sobre la imagen leyendo `getBoundingClientRect()` **en el momento de pintar**, y nadie
lo volvía a llamar si después cambiaba el ancho: la imagen se reacomoda —lleva `max-width:100%`—
y las líneas se quedan donde estaban. A 1400 px el overlay quedaba **67 px más arriba y 363 px
más ancho** que la imagen. Una regla dibujada sobre una estructura y mostrada sobre otra.

Cerrado con un oyente de `resize` con debounce que repinta **las dos vistas**, cada una en su
contexto, y registrado de forma perezosa como `_medObservar` — colgarlo a nivel de módulo ataría
un oyente al documento aunque el visor no se abra nunca.

**Y el alternador tiene el mismo problema por otra puerta:** el panel que aparece venía de
`display:none`, o sea que su canvas medía CERO. Sin repintar, alternar deja las mediciones de la
vista que vuelve fuera de lugar.

### ⚠️ `!important` NO ES PEREZA ACÁ: el panel trae `display:flex` EN LÍNEA

`_vPanelHTML` emite `style="flex:1;min-width:0;display:flex;..."`, y un estilo en línea le gana
a la hoja sin importar la especificidad del selector. La primera versión de la media query
aplicaba y **las dos vistas seguían a la vista**: medido, `visA:true, visB:true` a 390 px. Es el
defecto que este archivo ya documenta con `[hidden]` y el banner de versión.

### El corte de tablet es 1023 y no 768

A 900 px las dos vistas todavía entran «a lo ancho» y el resultado es scroll horizontal, que es
**peor** que apilarlas: con dos paneles de 413 px ninguna imagen se lee bien y encima hay que
desplazar. Por eso el apilado empieza antes del breakpoint de 768 que usa el resto de la app.

**El scroll horizontal a 900 px NO se cerró y es PREEXISTENTE** — está en la medición sobre HEAD,
antes de este cambio. Queda anotado, no arreglado.

### El alternador se niega a cambiar si no hay vista B

Sin esa guarda, tocarlo esconde el panel A y muestra uno que no existe: **pantalla en blanco**.
La primera versión del caso esperaba lo contrario y dio rojo sobre código correcto.

### ⚠️ EL HARNESS CORRE EN UNA VENTANA DE ~756 px, o sea EN RANGO ANGOSTO

Así que desde este commit el panel B está oculto ahí, y los casos que comparan las dos vistas
medían `undefined` sobre un canvas de tamaño cero: TC-196 y TC-199 se pusieron en rojo. Se
agregó `__t.anchoDesktop()`, que fuerza el layout ancho con
`setProperty(..., 'important')` — **un estilo en línea con `!important` es lo único que le gana
al `!important` de la hoja**.

**Y eso creó el defecto siguiente: TC-244 pasaba con `--solo` y fallaba en el suite.** Esos
estilos en línea sobreviven al caso que los puso, así que TC-244 medía `row` a 756 px y acusaba
a la media query de no aplicar. Hoy limpia lo forzado antes de medir. Es «pasa con --solo y
falla en el suite» por séptima vez, y otra vez el denominador.

### Dos trampas del propio caso, las dos ya documentadas

- **El `\s` dentro del template literal**, décima vez: `/max-width:\s*1023px/` llegó como
  `max-width:s*1023px` y no matcheó nunca. Se resolvió con `indexOf`, que es lo que este archivo
  recomienda desde la quinta.
- **Backticks dentro del cuerpo de un caso: van CUARENTA Y NUEVE**, dos en el mismo comentario
  recién escrito — el que explicaba justamente la trampa del denominador de arriba.

### Una mutación que sobrevivía porque la condición era floja

«Sacar el `!important`» pasaba en verde: la condición buscaba `display: none !important` suelto
en la hoja, y las **otras tres** reglas conservan el suyo. Hoy busca la regla BASE
—`#cine-paneles > div`— y exige que sea ella la que lo tenga.

### Cambiar un estilo NO emite `resize`

La sonda angostaba el contenedor y esperaba que el oyente corriera solo. Hay que despachar el
evento a mano, igual que `scrollTo` con el suyo.


## El visor de documentos se achicaba hasta ser ilegible — y no se estiraba (TC-243)

Tres cosas pedidas sobre «el modal de la tabla Simpson». **La tabla de Simpson no es un
modal**: `_simpTablaHTML()` se concatena a `cab`, o sea al contenido de `cine-med-barra`, la
columna izquierda del panel. El modal que existe es **`_docVer`**, el que abre un documento
guardado en la biblioteca — y ahí sí entra la tabla, guardada con 📋.

De los tres puntos, **uno ya estaba hecho y otro no reproducía**:

| pedido | medido |
|---|---|
| Cruz ✕ | **faltaba** |
| Cerrar al clic fuera, y no al clic dentro | **ya andaba**: `if (ev.target === ov) cerrar()` |
| «No ocupar todo el ancho» | **no reproduce** — a 1400 px la imagen medía 640, su tamaño natural |

### ⚠️ `max-width` SÓLO ACHICA, NUNCA AGRANDA

De ahí que «ocupa toda la pantalla» no se sostenga: un `<img>` sin `width` se dibuja en su
tamaño intrínseco y `max-width:100%` lo único que puede hacer es encogerlo. Poner un tope de
700 px habría sido un no-op —los dos documentos que la app genera miden **640**, la tabla por
`W = 640` y la diana por `S = 640`— o sea un resguardo que no se puede hacer fallar, que este
archivo ya documenta como peor que no tenerlo.

### Lo que sí estaba roto era lo contrario, y el pedido no lo nombraba

Medido con `Emulation.setDeviceMetricsOverride`, que es lo único confiable para anchos —
`window.resizeTo` en headless **no hace nada** y devolvió 756 px para 1400 y para 390:

| | 1400 px | 390 px |
|---|---|---|
| ancho de la imagen | 640 | **354** |

O sea la tabla al **55 %**: cinco columnas de texto dibujadas para 640 px, ilegibles. Achicar
está bien para una foto y es lo peor posible para una tabla, **y este modal muestra las dos**.
Hoy la imagen conserva su tamaño y la caja se desplaza. Contrapartida declarada: en un celular
hay que desplazar en horizontal, que es preferible a un documento clínico ilegible.

### La ✕ pasó de cosmética a necesaria

Con la imagen desplazable puede no quedar backdrop visible que tocar, y el único camino que
quedaba era **Escape**, que en un celular no existe. Área táctil 44 con disco visible de 28,
por lo mismo que la biblioteca: la regla `button{min-width:44px}` gana sobre cualquier `width`
en línea.

### El caso no necesita cambiar el viewport, y por eso se puede correr

El harness no lo expone por caso, así que TC-243 **angosta la CAJA**, que es lo que de verdad
decide: con la regla vieja la imagen se encoge con ella, con la nueva se queda en 640 y aparece
desplazamiento. El denominador va declarado —el documento mide 640 y la caja se angosta por
debajo—, porque si no «no se achica» se cumple sin que ninguna regla lo impida.

**Una mutación sobrevive y se declara:** sacarle el `stopPropagation` a la ✕ es un **no-op**.
El evento burbujea a `ov.onclick`, que exige `ev.target === ov`, y el target es el botón — así
que no cierra dos veces ni hace nada distinto. Se deja el `stopPropagation` porque fija el
contrato, no porque el caso lo cace.

**Al anclar la mutación del backdrop apareció que ese patrón está escrito DOS veces** en el
archivo (hay otro modal con el mismo `if (ev.target === ov)`). No se tocó; queda anotado.


## La biblioteca: un botón por acción, y el `width` que era letra muerta (TC-242)

Cinco tareas. **Dos ya estaban hechas**, una se difirió por decisión, y la que más costó fue
descubrir que el tamaño que el código declaraba no era el que se dibujaba.

### ⚠️ `min-width` NO COMPITE CON `width`: los ✕ de 22 px se veían de 44

El pedido decía «pequeño y discreto». Medido en el navegador antes de tocar nada:

| | escrito en el fuente | dibujado |
|---|---|---|
| ✕ de la tira | `width:22px;height:22px` | **44×44** |
| ✕ del slot | `width:22px;height:22px` | **44×44** |

La regla de accesibilidad del archivo —`button{min-height:44px;min-width:44px}`— **gana
siempre**, porque `min-width` y `width` son propiedades DISTINTAS y no se resuelven por
especificidad. Ese `22px` no hacía nada desde el día que se escribió, y es casi seguro el
origen del pedido.

**O sea que «achicar el botón» no es una opción: la regla lo vuelve a inflar.** Lo que se hace
es **separar el área táctil del disco pintado** — botón de 44×44 transparente, disco de 20 px
alineado a su esquina con `padding` + `flex`. Es el recurso que `.asoc-info-btn` ya usa al
revés (márgenes negativos para SUBIR a 44).

**COSTO DECLARADO:** las dos esquinas superiores de la miniatura dejan de abrir el archivo,
porque ahí hay un botón transparente. Se acepta porque el ✕ pide confirmación y el 📄 dice por
toast qué hizo; la alternativa era eximir de la regla táctil a un control **destructivo**, que
es el lado peor.

### El ✕ va en TODAS, y borra cosas distintas según dónde viva el archivo

Salía sólo en las tarjetas con registro en disco, así que **una foto importada con el guardado
apagado se veía en la biblioteca y no había forma de sacarla de ahí**. Hoy va en las cuatro
clases y `_bibBorrar` decide qué borra, diciéndolo en el `confirm`:

| la tarjeta es | el ✕ borra | y deja |
|---|---|---|
| slot **+** disco (una fija DICOM) | el original → se pierde la escala | la imagen en el PDF |
| sólo disco (cineloop, doc, fija huérfana) | el registro | los slots |
| sólo slot (foto sin persistir) | el slot → **sale del informe** | — |

Sin ese reparto, el médico aprieta un ✕ creyendo que libera espacio y lo que hace es sacar una
ecografía del informe que está por firmar.

### El 📄 es el ÚNICO puente al PDF, y por eso no va en todas

La biblioteca **no sale en el informe por diseño**; el slot sí. El 📄 no aparece en video ni
cineloop —no son una página del informe— **ni en lo que ya ocupa un slot**: ahí «mandalo al
PDF» duplicaría la misma ecografía. Es el control que no significa nada del que este archivo
ya habla.

### ⚠️ LA CAPTURA VA A LA BIBLIOTECA, CON RED — y la red no es opcional

Decisión de Maicol (2026-09-22). `_cinePuedeGuardar()` exige DOS cosas —el toggle «Guardar
imágenes con los estudios», que viene **apagado de fábrica**, y un estudio ya guardado— y el
flujo normal es importar y medir mientras se llena el formulario, o sea con las dos sin
cumplir. Mandando la captura sólo a la biblioteca, en la configuración por defecto el botón
Capturar **no dejaría el cuadro en ningún lado**: es «el interruptor mentía sobre el disco»
otra vez, y acá se pierde un cuadro que el médico eligió a mano.

Así que si la biblioteca no puede escribir, el cuadro va al slot y el toast **dice por qué**.
Medido en los dos escenarios: con el toggle encendido `bib +1, slots +0`; apagado, `slots +1`
con el motivo impreso. Sin esa segunda mitad, el mismo gesto tendría dos resultados sin
ninguna señal de cuál ocurrió.

**Efecto colateral en el suite, declarado:** TC-182, TC-187, TC-202, TC-227 y TC-228 siguen en
verde **porque caen a la red** —ninguno guarda el estudio—, así que esos cinco ya no cubren el
camino de la biblioteca. Lo cubre TC-242.

### Dos tareas que ya estaban hechas — medidas, no supuestas

- **Selección múltiple:** el input ya lleva `multiple` y `mediosImportar` ya itera. Medido:
  tres archivos en una sola llamada → tres slots, con el toast «✅ 3 imagen(es) de 3
  archivo(s)». **No se tocó el importador**, que además estaba fuera de alcance por el pedido.
- **✕ en los slots:** existía y ya era independiente. Medido: borrar un slot deja la
  biblioteca en 1→1.

### Tres trampas del propio caso, y las dos mutaciones que sobrevivieron

- **M2 —«el 📄 deja de excluir lo que ya está en un slot»— sobrevivió entera.** En mi
  escenario ninguna tarjeta estaba en slot **y** en disco a la vez, así que la cláusula que la
  mutación borra era un **no-op ahí**: las dos reglas daban el mismo resultado. Se agregó una
  fija con slot **y** registro —el estado que deja importar un DICOM con el guardado
  encendido— y recién ahí discrimina. *El denominador otra vez, en su forma más cara: la
  condición estaba bien escrita y no probaba nada.*
- **M5 —«el botón vuelve a 20×20»— SIGUE SOBREVIVIENDO, y está bien que sobreviva.** Leída
  como código es un **no-op para el invariante**: con `width:20px` la regla global lo infla a
  44 igual. La mutación no reintroduce el defecto, lo **demuestra**. Se declara en vez de
  apretar la condición a un píxel cosmético, que sería el literal 53 otra vez.
- **M1 mataba el caso en vez de hacerlo fallar** (`null.click` sobre el ✕ que acababa de
  sacar), arrastrando cuatro condiciones que no le tocaban. Hoy el botón se busca y se
  **declara** si no está.
- **Backticks dentro del cuerpo de un caso: van CUARENTA Y OCHO** — otra vez en un comentario
  recién escrito, el que explicaba por qué el video no se ejerce.

### Lo que NO se hizo, y por qué

**Tarea 5 —autoplay y bucle del video en el PPT— quedó para su propia sesión** (decisión de
Maicol). PptxGenJS 3.12 no expone ninguna de las dos: hay que inyectar a mano el bloque
`<p:timing>` post-procesando el paquete con el JSZip que ya usa `_pptxDescargarSaneado`. El
riesgo está documentado acá mismo: un XML mal formado hace que PowerPoint pida reparar y **al
reparar borre la diapositiva entera**. PowerPoint está instalado en esta máquina, así que se
puede verificar de verdad — y sin esa verificación no se commitea.


## La vista B abre midiendo, y la tabla de Simpson es UNA para las dos (TC-241)

Tres bugs reportados. **Uno no se reproduce**, y los otros dos destaparon un tercero.

### 1 · La vista B nacía muda

Abría con el canvas de medición oculto y sin herramienta elegida, así que el médico tenía que
descubrir que había que encender algo — en una vista que se abre **exactamente para medir la
segunda apical**. Hoy `vistaBAbrir` entra en modo medición con 2D Distancia.

**⚠️ NO SE FUERZA LA CALIBRACIÓN, y es una desviación deliberada del pedido.** `medToggle` ya
entra solo en modo calibrar cuando el archivo no declara escala, que es el respaldo que existe
para los 15 sin región. Forzarlo sobre un DICOM que **sí** la trae pisaría la escala del archivo
con dos clics a mano — la escala 2D del pendrive va de 0,046 a 0,926 mm/píxel y calibrar a ojo
son ~5 %. Medido: con un loop sin escala el aviso dice «Antes de medir, calibrá la escala…»; con
uno que la declara, `bCalibrando: false`.

### 2 · Los botones YA estaban a la derecha — no se reprodujo

Medido antes de tocar nada: `recalB` termina en 725 y `panelB` también en 725, y en las **dos**
vistas el botón arranca después de que termina la barra guía. No se cambió una línea. La
condición queda igual, con su denominador declarado —que los dos paneles estén en posiciones
distintas—, porque sin eso «los dos a la derecha» se cumple midiendo dos veces el mismo panel.

### ⚠️ 3 · CADA VISTA LLEVA SU SESIÓN DE SIMPSON, así que había DOS TABLAS

La A mostraba su tabla con la A4C y la B otra con la A2C: dos tablas del mismo ventrículo,
**ninguna con el biplano que el médico acababa de medir lado a lado**. `_simpFilasVivas()`
recorre las dos sesiones, deduplica por rótulo y cierra con el biplano de `_vBiplanoDatos()`.
`_simpResumen` se reescribió para consumirla, así que **lo que se guarda es lo que se muestra**.

**Y confirmar en una dejaba la OTRA vieja.** La tabla compartida se arma en cada repintado de
panel y `medSimpsonConfirmar` sólo repintaba el suyo: con la A2C recién confirmada en la vista B,
el panel de la A seguía mostrando una tabla de una sola fila. Lo cerró `_simpRepintarOtraVista()`,
que repinta **sólo el panel** de la otra vista, atado a ella con `_vCon` para que `_medEstado` lea
los accesores correctos. **Esto no estaba en el reporte: lo encontró medir los dos paneles.**

Medición final, los dos paneles con las mismas tres filas:
`A4C|95.3|69.0|26.3|27.6 · A2C|48.0|34.7|13.4|27.8 · Biplano|74.1|53.5|20.6|27.8`.

### Una condición VACUA, declarada

«y 2D Distancia elegida» pasa con la activación sacada: `dist` y `2d` son los valores de fábrica
de `_vNueva`. Queda porque fija la intención, y al lado hay dos que sí caen —«abre MIDIENDO» y
«con la capa de medición ya dibujada»—. Escrita sola habría sido cobertura que no existe.

### El mutante corría contra un suite VIEJO

`shutil.copytree` sólo copia si el destino no existe, así que `/tmp/mut241/scripts` quedó con la
versión previa a agregar la condición nueva: la mutación «no» la cazaba porque **esa condición no
estaba en el archivo que corría**. Media hora buscando por qué el canvas seguía visible con
`medToggle` sin correr. **El runner de mutación tiene que re-copiar el suite en cada corrida**, no
sólo la primera. Lo delató un `assert` del script de parcheo, no el resultado.

**Control negativo, contra HEAD:** dos tablas de una fila cada una y la de A quedándose vieja.
Con el arreglo, `tablaA` y `tablaB` idénticas y con las tres filas.


## «No se pudo leer del disco» era un ARRAY QUE NO ERA ARRAY (TC-240)

Reportado como que la vista B no podía abrir cineloops **que la tira abría perfectamente**, y
leído —razonablemente— como «usa otra ruta de lectura». **El disco no tenía nada que ver.**

### ⚠️ `_cineDesdeRegistro` DEVUELVE UN OBJETO, NO UN ARRAY

La tira lo envolvía —`_cineAbrir([_cineDesdeRegistro(r)])`— y el selector de la vista B se
quedaba con el retorno pelado y lo trataba como lista:

```
const loops = _cineDesdeRegistro(lista[elegido]);
if (!loops || !loops.length) { alert('Ese cineloop no se pudo leer del disco.'); ... }
```

`loops.length` sobre un objeto es **`undefined`**, así que la guarda daba verdadero **siempre**:
el mensaje salía en el 100 % de los casos. Y si no hubiera estado, `V.datos.loops` habría quedado
con un objeto donde el reproductor espera una lista y `D.loops[D.i]` daba `undefined`.

**Los bytes estaban.** `CeiboCine.listar` usa `getAll`, así que trae el registro entero con
`datos` y `offs` — el mensaje culpaba al disco de un error de tipo. *Un mensaje de error que
nombra la causa equivocada manda a revisar lo que está sano.*

### El arreglo es UNA ruta, no dos arregladas

`_cineLoopDeDisco(id)` lee y construye, y la comparten la tira y el selector; lo único que los
distingue es **dónde** abren el loop. Con dos caminos, esto vuelve a divergir — ya divergió una
vez y el síntoma fue un botón que no funcionaba nunca.

**Y la guarda pasó a mirar los CUADROS, no el objeto**: un registro truncado produce un loop con
cero fragmentos, y eso abre un reproductor **vacío** en vez de fallar. La mutación que la
devuelve a `if (!loop)` cae por su condición.

### El denominador del caso es la TIRA

TC-240 comprueba primero que la tira abre ESE mismo cineloop con sus tres cuadros. Sin eso, «la
vista B falla» no distingue un selector roto de un registro ilegible — que es exactamente la
lectura equivocada con la que llegó el reporte.

**Control negativo, contra HEAD:** `tiraAbre: true` con 3 cuadros y `quejaVistaB: 1`,
`loopsEsArray: false`. Con el arreglo: `quejas: 0`, `vistaBCuadros: 3`, `loopsEsArray: true`.


## A4C fija, y la A3C desplaza a la A2C — sólo en la PRESENTACIÓN (2026-09-22)

El panel del strain tiene dos lugares: la vista de referencia y la que se está agregando. Al
llegar la tercera ventana, la A3C ocupa el segundo. Medido por la posición de la marca de fila
en el HTML del panel:

| | A4C | A2C | A3C |
|---|---|---|---|
| dos vistas | 392 | 616 | 773 |
| tres vistas | 392 | **766** | **616** |

### ⚠️ LA FILA DE LA A2C NO DESAPARECE, Y ES EL PUNTO

Esconderla diría que dejó de contar, y es al revés: con las tres vistas el SGL promedia **seis
territorios** y el bull's eye pinta **16 de 17** segmentos; sin la A2C serían cuatro y 10.
Verificado en la misma corrida: las tres vistas siguen completas y `_strainCalcular` devuelve
**6 territorios**. La fila baja a una línea secundaria que dice, con todas las letras, que
**sigue contando**.

**El desplazamiento se dispara con la A3C COMPLETA**, no con la A3C elegida: antes de eso el
segundo lugar sigue siendo el de la A2C, que es donde se está trabajando.

### Sin caso automático todavía — declarado

Está verificado **por medición**, no por un caso del suite. Es presentación pura y el dato quedó
comprobado intacto, pero un arreglo sin caso es un arreglo que se deshace sin que nadie se
entere. El caso natural es seguir el patrón de la sonda: sembrar `_strain.vistas` y ordenar por
la posición de `<b>A4C</b>` en el HTML del panel.

**Y la sonda tropezó dos veces con lo mismo.** El `\s` de un regex se pierde dentro del template
literal —la trampa que este archivo documenta nueve veces— y después, buscando «A4C» en el
`textContent`, el orden salía mezclado porque esa sigla **también aparece en el párrafo
explicativo**. Se ordena por la marca de fila, que es única.


## La tabla de Simpson viaja con el estudio, y «biblioteca» no es «PDF» (TC-239)

### ⚠️ «GUARDAR EN BIBLIOTECA» Y «INCLUIR EN PDF» TIENEN QUE HACER COSAS DISTINTAS

O son dos botones iguales. Decisión de Maicol (2026-09-22):

| | dónde va | ¿sale en el informe? |
|---|---|---|
| 📋 Guardar en biblioteca | `ceibomed_cine`, tipo `doc` → **tira de archivos** | **no** |
| 📄 Incluir en PDF | un **slot** de imagen | sí |
| 🗑️ Limpiar | borra lo guardado **y** la sesión | — |

**`tipo:'doc'` no es cosmético: hay dos filtros que ya existían y que un tipo nuevo rompe.**
`medFijasRestaurar` sólo rehidrata `tipo === 'fija'` —correcto, un documento no es medible— y
**`_vElegirLoop` listaba «todo lo que no es fija»**, así que sin excluirlo una tabla de resultados
aparecía como **cineloop elegible para la segunda vista**. Se corrigió en el mismo commit.

### El resumen vive en un `hidden`, o sea que hay que limpiarlo A MANO

`simpson_manual`, espejo exacto de `strain_manual`. Viaja en `campos` por el barrido de
`guardarInforme`, **pero ese barrido toma `input[type=text]` e `input[type=number]`** y un
`hidden` no entra. Sin la línea en `limpiarCampos`, la FEVI biplano de un paciente queda dentro
del estudio del siguiente — es la fuga de `ete_tavi_jet_horas`. La mutación que la saca imprime
`largo=248` sobre un formulario recién limpiado.

**Se guardan SÓLO LOS NÚMEROS**, no los contornos: son decenas de KB de anatomía del paciente en
el registro y en cada backup para redibujar algo que ya se decidió no reabrir. Consecuencia
declarada: al reabrir, la tabla vuelve **rotulada como guardada** y no se puede seguir midiendo
sobre ella.

**Y la tabla se dibuja FUERA del `if (R)`**: con el estudio reabierto no hay sesión viva y el
resultado es `null`, pero los números guardados sí están. `_simpFilasTabla` cae a lo persistido —
y es **un solo armador** para la tabla en pantalla y la del canvas: con dos, lo que se ve y lo que
se guarda podrían dejar de coincidir.

### Un dibujante por artefacto, no dos

`_strBullsCanvas` se extrajo de `medStrainCapturar` para que **biblioteca y PDF usen el mismo**:
con dos copias, la diana del informe y la guardada podrían dejar de llevar el mismo descargo de
método. Lo mismo `_simpTablaCanvas` con `_simpFilasTabla`.

### Tres tropiezos del caso, los tres conocidos

- **La mutación del filtro del selector SOBREVIVIÓ.** La condición recalculaba el filtro dentro
  del caso, o sea probaba **su propia copia** de la regla. Hoy llama a `_vElegirLoop` de verdad:
  el estudio tiene un documento y **cero** cineloops, así que con el filtro bien no se abre ningún
  selector y con el filtro roto aparece una tarjeta.
- **TC-238 se puso en rojo por un texto que yo mismo reescribí** al agregar los botones de la
  diana. Reapuntado al invariante.
- **Y el regex de reemplazo no matcheaba**: en el FUENTE la frase está partida por la
  concatenación —«…el campo `' + '`SGL.»— así que entre las dos palabras no hay un espacio sino
  un operador. *Buscar en el fuente de una función lo que la función CONCATENA es buscar algo que
  no está escrito así.*

### La sonda también se equivocó, y del mismo modo de siempre

El paso de «vuelve al reabrir» daba `false` sobre código sano: re-guardaba con `_ettEditandoId`
en `null`, o sea **creaba un estudio NUEVO**, y después reabría el original —que nunca había visto
la tabla—. El denominador otra vez.

### Lo que ya estaba y no hubo que hacer

Los **botones de ventana del strain ya están en la columna izquierda**: `_strainPanel` se pinta
dentro de `cine-med-barra`, que *es* la columna izquierda de la ZONA 4. Y el selector visual de
cineloop se hizo en el commit anterior.


## El cineloop de la segunda vista se elige POR LA MINIATURA (TC-238)

Tercera etapa del rediseño del visor. **Buena parte de la Tarea 3 ya existía** y lo que valió fue
medirlo antes de reconstruirlo:

| pedido | estado real |
|---|---|
| botones [A4C] [A2C] [A3C] | **ya existían** (`data-str-vista`) |
| confirmar diástole y sístole | ya existían |
| bull's eye progresivo | **ya lo era** — 4 segmentos con una vista, 10 con dos, 16 con tres |
| «Incluir en PDF» | `medStrainCapturar` **ya hacía exactamente eso**; le faltaba el rótulo |
| elegir el cineloop de la 2ª vista | era un **cuadro de texto con menú numerado** |

### «Incluir en PDF» ERA UN BOTÓN QUE YA ESTABA, MAL ROTULADO

`medStrainCapturar` dibuja la diana a 640 px, **quema el descargo de método** —«NO equivalente al
speckle tracking automático» y «Orientativo, requiere correlación clínica»— y la manda a un slot
por `imgCompressLoad`, que es lo que sale en el PDF. Decía «📸 Capturar diagrama», que describe el
gesto y no la consecuencia.

Hoy dice **«📄 Incluir en el PDF»** con la aclaración de que va como imagen y **no escribe el campo
`sgl`**. Esa segunda mitad no es adorno: ese campo alimenta el marco HFA-ICOS y las decisiones de
cardio-oncología, y el único corte vivo del SGL (−16 %) está definido para speckle tracking.
Decisión de Maicol (2026-09-22).

### Elegir por un número es elegir a ciegas

El nombre del registro es el del archivo del ecógrafo —**un UID casi siempre**— así que el menú
numerado obligaba al médico a acordarse de cuál era cuál. `_vPickerLoop` muestra las miniaturas,
como la tira y como el selector del strain. Se arma con la API del DOM y el póster va por `.src`,
nunca interpolado en HTML.

**LAS TRES SALIDAS se prueban** —elegir, Cancelar y Escape—: es lo que separa un selector de una
trampa. Un médico que no quiere ninguno de los cineloops tiene que poder salir.

### ⚠️ EL CASO PROBABA EL AYUDANTE Y NO LA PUERTA

La mutación que devuelve el menú numerado **dentro de `_vElegirLoop`** sobrevivió entera: el caso
llamaba a `_vPickerLoop` directo y nunca pasaba por ahí. Es la misma lección que `medFijaClic`.
Hoy hay una condición que llama a `_vElegirLoop` de verdad —con `CeiboCine.listar` sustituido y
`_imgUuidActual` puesto— y exige que aparezca el selector visual.

**Y no alcanza con buscar el nombre de la función en el fuente**: el comentario que explica qué se
reemplazó contenía el literal, así que la comprobación daba falso positivo sobre código correcto.
Se intercepta la función y se exige que NO se llame. *En los comentarios, describir* — otra vez, y
ahora con un chequeo tropezando.

### ⚠️ UNA MUTACIÓN QUEDÓ SIN EXPLICAR, y se declara

La que rompe la salida por **Escape** —cambiar la tecla que escucha el manejador— **pasa en
verde**, y no se pudo reproducir por qué: con el manejador mutado la promesa no debería
resolverse, y el caso termina igual. No se da por buena la condición de Escape: está escrita y
verificada a mano, **no por mutación**. Si alguien retoma esto, el sospechoso es otro oyente de
`keydown` del documento resolviendo el cierre por un camino que no es el del selector.

### Lo que sigue pendiente de la Tarea 3

- **«A4C queda fijo, A2C se reemplaza por A3C»** no se implementó. Hoy las dos vistas del visor
  —A y B— son independientes y el médico elige qué cineloop va en cada una; la regla pedida es
  una política de QUÉ ventana ocupa el panel derecho, y encima de un sistema donde el panel no
  sabe de ventanas. Decidido que el dato de la A2C **no se descarta** (2026-09-22), así que lo
  que falta es sólo la parte de presentación.
- **«Guardar tabla de resultados» de Simpson**, que sigue de la etapa anterior.


## Simpson declara la ventana, y eso destrabó la etiqueta por nombre (TC-237)

Segunda etapa del rediseño del visor. **El bloqueo de fondo era el modelo de datos.**

### ⚠️ `_simp.vista` ERA UN ÍNDICE, NO UNA VENTANA

Por eso este archivo documentaba, desde el 2026-09-21, que la etiqueta de la captura **no podía
decir «A4C»**: el panel pedía «la vista que estés usando» y después «la SEGUNDA vista (la otra
apical)» —el médico podía empezar por la 2C— y `_simpCalcular` devolvía `bi` y **ningún nombre**.
Escribirlo habría sido afirmar en una imagen clínica un dato que la app no recogía.

Los botones **[A4C] [A2C]** lo declaran, así que el dato existe. `_simp.nombres` es un array
paralelo a `pares`, y la etiqueta pasó de `1 vista · FEVI 27.6 %` a **`A4C · FEVI 27.6 %`**; con
las dos, `A4C+A2C`.

**SIGUE CAYENDO A LA CANTIDAD CUANDO NO SE DECLARÓ, y no es un respaldo cosmético:** es lo que
impide afirmar «A4C» sobre un trazado del que nadie dijo de qué ventana salió. La mutación que
rellena el nombre por omisión imprime `A4C · FEVI 27.6 %` sobre una sesión sin declarar.

### Los botones son un SELECTOR, no un rótulo

Declarar una ventana que ya está en el **otro** índice **va a ese par** en vez de duplicarla: dos
pares con el mismo nombre harían que el biplano promediara la misma vista dos veces bajo dos
nombres. Y si el par en curso ya tiene nombre **y algún contorno**, se pasa al otro en vez de
renombrarlo — renombrar cambiaría de qué ventana son dos trazados ya confirmados.

**⚠️ LA MUTACIÓN DE ESTO SOBREVIVIÓ A LA PRIMERA VERSIÓN DEL CASO.** El paso declaraba la segunda
ventana con el par 1 **ya nombrado y trazado**, y ahí la rama de renombre termina también en el
par 0: el resultado coincide y sacar la búsqueda del nombre es un **no-op**. Hoy el par 1 se
visita **sin declararlo**, que es donde esa búsqueda es lo único que decide.

### ⚠️ LA FILA DE CIERRE ES EL BIPLANO, NO EL PROMEDIO

El pedido decía «Prom». El biplano **no es una media**: usa el producto cruzado de los diámetros
de las dos vistas —Σ(a·b)— y el **eje más largo** de las dos, textual de la guía. Medido sobre un
par real: **VFD biplano 74,1 mL contra 71,7 del promedio** de las monoplanares. Publicar ese
promedio al lado dejaría **dos FEVI en la misma tabla**, y la que se integra al informe es la del
biplano.

**Y el comentario que escribí primero afirmaba que promediar «sobrestima de forma sistemática».
La medición lo desmintió**: acá el promedio salió MÁS BAJO, porque el biplano se queda con el eje
más largo. Qué lado queda arriba depende de la geometría. Corregido antes de commitear — es
«un comentario que afirma una invariante no la garantiza», otra vez y sobre lo que acababa de
medir.

`VEyec = VFD − VFS`. **Se verifica en las dos clases de fila**: la del biplano sale de
`_simp.res` y las de cada ventana de `_simpMonoDe`, así que comprobarla sólo abajo dejaba viva la
mutación del monoplano — sobrevivió hasta que se agregó la condición de la fila monoplanar.

### «Agregar la otra vista (biplano)» se ELIMINÓ

Movía el índice dentro de la **misma** vista del visor, así que las dos apicales terminaban
trazadas sobre el mismo cineloop —que es justo lo que el propio panel avisa como error— salvo que
el médico cambiara de imagen a mano. Hoy la salida es **«➕ Vista»**, que abre la segunda vista al
lado y deja elegir su cineloop.

`medSimpsonSegundaVista` **se conserva**: es la transición «ir al par 2» y la usan cinco casos del
suite. Lo que desapareció es el botón que la ofrecía.

**TC-190 se puso en rojo y ésa es la señal**: pinaba la EXISTENCIA de ese botón. Reapuntado al
invariante —que con un monoplano el panel **ofrezca** el camino al biplano— y no al control que lo
ofrecía.

### Lo que queda pendiente

**«Guardar tabla de resultados» NO se hizo.** El camino coherente es el de `strain_manual`: un
`<input type="hidden">` con el resumen en JSON, que viaja en `campos` por el barrido de
`guardarInforme` — y que hay que **limpiar a mano** en `limpiarCampos`, porque ese barrido toma
`input[type=text]` e `input[type=number]` y un `hidden` no entra. Es la fuga de
`ete_tavi_jet_horas`, y sin esa línea las mediciones de un paciente quedarían dentro del estudio
del siguiente.

Y sigue pendiente toda la **Tarea 3 (Strain)**: mudar los botones de ventana a la izquierda, el
selector visual de cineloop para la segunda vista —hoy `_vElegirLoop` es un `prompt()` con un menú
numerado— y el «Incluir en PDF» del bull's eye, que por decisión de Maicol (2026-09-22) va por
`medCapturarConMedicion` y **no** escribiendo el campo `sgl`.


## Columna derecha del visor, y la calibración explicada antes de medir (TC-236)

Primera etapa del rediseño de UX del visor. **Lo que sigue pendiente está al final de la entrada.**

### «Medir» dejó de ser una compuerta, y por eso cambió de rótulo

Elegir una herramienta ya encendía la medición, así que ese botón sólo servía para **apagarla**:
un control rotulado «Medir» que en la práctica significaba lo contrario. Hoy **nace oculto** y
aparece, ya rotulado **«✕ Salir de medición»**, sólo con la medición encendida.

**No se borró**, y es deliberado: sin él no habría forma de salir del modo medición sin cerrar el
visor — el overlay se queda capturando los clics sobre la imagen.

**⚠️ La visibilidad se decide en `medToggle`, no en `_medFijosSync`.** La rama de apagado **no
pasa** por `_medEstado`, así que puesto sólo en el sync el botón quedaba visible con la medición
ya apagada (medido). Y el rótulo se sacó de `medToggle`: escribirlo desde dos lados dejaba a las
dos funciones peleando, y ganaba la última en correr.

### ⚠️ «➕ Vista» y «Cerrar» SE MUDARON, Y LOS IDS SON LOS MISMOS

Estaban en el pie del modal y pasaron a la columna derecha del panel **A** —conservando
`cine-add-b` y `cine-cerrar`, así que el cableado del modal los sigue encontrando—. Se emiten
**sólo en la vista A**: son controles del modal y no de la vista, y duplicarlos en la B daría dos
botones «Cerrar» cerrando lo mismo. La B tiene su «✕ Cerrar vista», que es otra cosa.

**Dejarlos también en el pie habría dejado ids DUPLICADOS**, y ahí `getElementById` devuelve el
primero y el otro se dibuja **sin responder** — el defecto que la barra de la vista B ya pagó. Hay
una condición que cuenta las apariciones dentro del overlay y exige **una** de cada.

### La columna va en TRES grupos con filete: medir · capturar · vista

Sin separadores los ocho botones se leen como una sola lista y **«Borrar» queda al lado de
«Guardar»**, que hacen cosas opuestas.

### Sin calibrar: la instrucción primero, y sólo «Recalibrar»

| | antes | hoy |
|---|---|---|
| imagen sin escala | «Este archivo **no trae la escala**. Calibrá a mano…» | «**Antes de medir, calibrá la escala.** Trazá una distancia conocida del ecógrafo…» |
| calibrada | la escala y nada más | la escala **+** «Si necesitás recalibrar, tocá **Recalibrar →**» |

Lo primero era un **diagnóstico sobre el archivo** cuando lo que el médico necesita es el paso
siguiente. Y de los controles de medición queda sólo **Recalibrar**: no hay nada medido que
borrar, y ofrecerlo al lado del único botón que sirve compite con él.

**⚠️ EL TEXTO VA EN LA RAMA DE `_medCalibrando`, y ésa es la que se ve.** Con cero regiones
`_medAutoCalibrar` entra **sola** en modo calibrar, así que la rama `else` —la que uno escribe
primero— sólo se alcanza si el médico canceló. Poner la instrucción sólo ahí la vuelve casi
inalcanzable; lo cazó medirlo, no leerlo.

**Lo que NO se sacó es la línea que dice QUÉ escala se está usando.** Es lo único que permite
auditar una medición cuando conviven la del archivo y la manual, y este archivo ya lo fija.

### ⚠️ `_medSinCalibrar` NO alcanza a velocidad ni a tiempo

Tienen su **propia** escala —el eje Y en cm/s, el eje X en segundos— y sus propios avisos, que ya
distinguen los tres casos. Meterlas haría que un Doppler espectral perfectamente medible saliera
rotulado «sin calibrar», porque su eje horizontal no está en centímetros: el pendrive declara
**157 regiones así contra 281 de tejido 2D, sin un solo solapamiento**.

**Y la condición que lo fija nació VACUA.** La medía sobre la imagen que **sí** trae escala, donde
el predicado da `false` de todos modos: la mutación que saca la salida temprana **sobrevivió**.
Hoy se mide sobre la imagen SIN escala, que es donde esa salida es lo único que puede devolver
`false`. *El denominador otra vez.*

### Lo que queda pendiente de este rediseño

Esta etapa es la base compartida. **No se hicieron todavía**: los botones de ventana de Simpson
—que son el enabler para que la etiqueta pueda decir «A4C», hoy imposible porque `_simp.vista` es
un ÍNDICE y no un nombre—, la tabla biplano con VEyec y promedio, el reemplazo de «Agregar la otra
vista» por «+ Vista», el selector visual de cineloop para la segunda vista —hoy es un `prompt()`
con un menú numerado— y el «Incluir en PDF» del bull's eye, que por decisión de Maicol
(2026-09-22) va por `medCapturarConMedicion`, el camino que quema el descargo de método en el PNG,
y **no** escribiendo el campo `sgl`.


## Galería y panel de videos en la vista de SÓLO LECTURA (TC-235)

El detalle de un estudio guardado mostraba el texto y nada más: para ver las ecografías había que
entrar a **Editar**, que carga el estudio en el formulario y pisa lo que el médico tenga abierto.
Ahora, debajo del informe: **galería de miniaturas** y, si hay, **panel de cineloops/videos**.

### ⚠️ LA GALERÍA TIENE QUE MOSTRAR EXACTAMENTE LO QUE IMPRIME EL PDF

Si no, es una mentira sobre un documento firmado. Tres decisiones salen de ahí:

- **La fuente es `CeiboImg.leer(uuid)`, NO `imgSlots`.** El formulario vivo puede ser de otro
  paciente: la mutación que lo lee muestra la ecografía de B sobre el detalle de C.
- **NO se gatea por el toggle de guardado.** Es la misma regla que `pdfDeInformeGuardado` ya
  declara en su comentario: leer por uuid trae las de ESE estudio, y gatearlo haría que apagar
  una preferencia escondiera imágenes que el informe sí lleva.
- **El filtro es `_pptEsImagen`**, el predicado compartido, que excluye el **póster de un video**
  —un slot con `dataURL` como cualquier otro—. Es justo lo que el PDF excluye; sin eso la galería
  mostraría como «imagen del informe» un cuadro que el médico nunca eligió. Medido: 3 slots en
  disco, **2 miniaturas**.

### ⚠️ `CeiboCine` GUARDA DOS COSAS, Y CONTAR LA LISTA ENTERA MIENTE

Ahí viven los cineloops **y** las imágenes fijas DICOM (`tipo:'fija'`, un cuadro). Contar
`cines.length` diría «2 cineloops» sobre un estudio que tiene uno y una foto — y esa foto **ya
está arriba, en la galería**. Un cineloop es `cuadros > 1`. La mutación imprime `2 cineloops`.

**Y el MP4 no es un cineloop.** Vive en `ceibomed_video` y **no se puede medir**, así que el texto
que pedía el prompt —«Para verlos y hacer mediciones»— sería falso sobre él. El panel nombra lo
que hay: «1 cineloop y 1 video MP4», y la frase de acción cambia según corresponda.

### `null` no es `[]`, otra vez

`CeiboImg.leer` devuelve **null** cuando no se pudo leer y **[]** cuando el estudio no tiene
imágenes. Colapsarlas haría que un fallo transitorio de IndexedDB se vea igual que un estudio sin
ecografías — y acá el médico concluiría que **el informe no las tiene**. Se distingue y se dice.
La mutación que las colapsa imprime `corrio, txt=""`: se calló.

### El detalle sigue siendo SÍNCRONO, y los medios llegan después

`verDetalleInforme` arma una cadena y la asigna de una vez. Hacerla `async` habría dejado la
pantalla en blanco hasta que resolviera IndexedDB —hasta 3 s en el primer arranque— sobre el
texto del informe, que es lo que el médico viene a ver. Se pinta un hueco (`ig-det-medios`) y se
rellena al llegar, con **token de generación** (`_igDetGen`) que `volverAListaInformes` también
incrementa: sin eso, entrar a un estudio y saltar a otro antes de que la base resuelva dejaba la
galería del anterior sobre el detalle del nuevo.

**El token se declara ARRIBA, junto a `volverAListaInformes`**, y no al lado de donde se usa: un
`typeof` sobre un `let` declarado más abajo es la zona muerta temporal que este archivo ya
documenta —**no devuelve `'undefined'`, LANZA**— y escribir la guarda habría enseñado el patrón
equivocado.

### Se arma con la API del DOM, y el dataURL va por `.src`

Misma regla que el selector de imágenes del PPT: nada se interpola en HTML. Semgrep no se movió.

### Un escenario mal armado dio rojo sobre código sano

El paso del «estudio vacío» no llamaba a `imgVaciar()` antes de guardar, así que
`guardarInforme` persistía las imágenes del estudio ANTERIOR dentro del vacío: la galería las
mostraba **con razón** y la condición acusaba al código. `limpiarCampos` **no vacía las
imágenes** —lo hace «Nuevo estudio», y este archivo ya lo documenta—. Hoy el paso vacía primero
y **después** reabre el otro estudio para dejar el formulario cargado, que es lo que vuelve
discriminante la condición: ahí sí cae la galería que leyera `imgSlots`.

**Backticks dentro del cuerpo de un caso: van CUARENTA Y CINCO** — otra vez en un comentario
recién escrito, el que explicaba por qué el diagnóstico tenía que distinguir «no corrió» de
«corrió y salió vacío».

### ⚠️ EL PENDRIVE APARECIÓ, Y DESTAPÓ DOS ROJOS — uno mío YA PUSHEADO

Con `/Volumes/DISK_IMG` montado la suite pasó de 18 fallas a **3**: los 17 casos que reportaban
«sin verificar» corrieron de verdad. Y ahí se vio lo que el desmontaje tapaba.

- **TC-188 lo rompí yo, en `0fa6de6`, y lo pusheé sin saberlo.** Pinaba que una foto común se
  RECHAZARA al tocarla en modo medición; ese rechazo se sacó a propósito al unificar la tira. Es
  exactamente el riesgo que ese commit dejó declarado —«toqué ese camino y el suite no me lo iba
  a decir»— y ocurrió. Reapuntado al invariante nuevo: la foto **abre con CERO regiones**, o sea
  sin inventar escala, y ya no sale el motivo viejo. Verificado por mutación: devolver el rechazo
  pone las dos condiciones en rojo.
  Y una tercera condición —«un slot vacío se ignora sin avisos»— caía **por cascada**: el paso
  anterior ahora deja el visor abierto y el siguiente medía sobre ese `_cineDatos`. Se cierra
  entre pasos. *Un rojo colateral que no se puede explicar no se da por bueno.*
- **TC-197 NO es mío.** Revienta con `Cannot read properties of null (reading 'click')` sobre
  `#cine-med-calvel`, y falla **idéntico** en `f7f7fd5`, `1179859` y `35e9aa4` — o sea desde
  bastante antes de esta sesión. Queda declarado y sin tocar: es el módulo de velocidad, fuera
  del alcance de este commit.

  > **⚠️ CORRECCIÓN (2026-09-23): «preexistente» era FALSO, y el método para concluirlo también.**
  > `#cine-med-calvel` existió entre `543f4cb` y **`429244f`** —el rediseño del visor en cinco
  > zonas, de esa misma jornada— que lo fusionó con el de recalibrar distancia en un control
  > único (`cine-med-recal`) que cambia de rótulo según la herramienta activa. El caso no se
  > reapuntó y murió desde ahí.
  > Los tres commits que se citaron como prueba son **todos posteriores** a `429244f`
  > (21 y 22 de septiembre contra el 20): **tres puntos de muestreo del mismo lado de la rotura
  > no prueban que venga de antes**, sólo que ya estaba rota en los tres. Para afirmar
  > «preexistente» hay que encontrar un commit donde el caso **pase**, o bisecar hasta el que
  > lo rompe. Reparado y en verde el 2026-09-23.

**La regla que deja: un caso apagado por falta de fixture NO es cobertura.** Mientras el pendrive
esté desmontado, los 17 no vigilan nada y un cambio puede pasar por encima de ellos y llegar a
`main`. Antes de tocar el visor, la medición o los importadores, **montar el pendrive y correr la
suite** — es el único momento en que esos casos dicen algo.


## La tira lista los ARCHIVOS del estudio, no sólo los DICOM (TC-234)

Decisión de Maicol (2026-09-22). `#cine-strip` se titulaba «DICOM guardados en este estudio» y
leía **una sola fuente** —`CeiboCine`—, así que un JPG o un MP4 no aparecían nunca: eso es lo que
se reportó como que «no quedaban en la tira». Hoy se arma de **dos**: los SLOTS, que son el
contenido del estudio en pantalla, y los registros de disco.

| ícono | qué es | se mide |
|---|---|---|
| 📷 | JPG · PNG · BMP | sí, **calibrando a mano** |
| 🎬 | MP4 | **no** — sólo documentación, con su disclaimer en rojo |
| 📏 | DICOM fijo | sí; **automático si el archivo declara región**, manual si no |
| ▶️ | cineloop DICOM | se reproduce; conserva su ícono porque es lo único que *suena* a play |

**AVI y TIFF no necesitan regla**: se rechazan en el importador, así que nunca llegan a existir.

### Los slots se muestran SIN uuid, el disco no

`imgSlots` **es** el formulario abierto, o sea el paciente actual por construcción, así que
listarlo antes de guardar el estudio es seguro y es lo que hace que la tira sirva mientras se
carga. Lo que sigue exigiendo uuid es la **lectura de disco**, que está indexada por estudio —
ahí un formulario en blanco con el cineloop del paciente previo abajo es lo que no puede pasar.

**Un DICOM fijo está en las dos fuentes** —el slot con su `_dcmId` y el registro con el MISMO
id— y es UNA sola cosa: se deduplica por id quedándose con la del slot, que es la que sabe en
qué posición del PDF va.

### ⚠️ EL ✕ BORRA EL ORIGINAL DE DISCO, NO LA IMAGEN DEL ESTUDIO

Por eso sólo aparece en las tarjetas que **tienen registro en disco**. Sin esa comprobación
saldría también sobre una fija que todavía no se persistió —estudio sin guardar— y el clic no
borraría nada, en silencio. Quitar la imagen del estudio es el ✕ **de la grilla**, que es otra
acción con otras consecuencias; confundirlos sería poner dos botones iguales con dos
significados.

### «Calibración automática» se AFIRMA sólo si el archivo declara la región

Un DICOM sin regiones existe —15 de los 301 del pendrive— y ahí la calibración es manual igual
que en un JPG. La mutación que pone `auto = true` imprime `auto=2 manual=1` sobre un escenario
que tiene uno de cada.

### La grilla no puede contradecir a la tira

`medFijaClic` rechazaba una imagen sin escala con *«cualquier número sería inventado»*. Desde que
la tira deja medir un JPG, esa frase dejaría a las dos superficies contestando distinto sobre el
MISMO archivo. Hoy cae en `medImagenAbrir`, que abre un «loop» de un cuadro con `regiones: []` —
y con cero regiones `_medAutoCalibrar` **ya** abre el modo calibrar, que es el respaldo que
existía para los archivos sin escala. **No hizo falta ningún camino nuevo en el visor.**

Lo que sostiene el cambio clínico es que la escala no se inventa: sale de dos clics del médico
sobre la **regla de profundidad que el ecógrafo quema en los píxeles**, y la barra del visor
declara que la calibración es manual. **El video sigue rechazándose**, con su motivo propio.

### `_orig` cuando está, el del slot cuando no

`_orig` es el dataURL sin recomprimir ni redimensionar: calibrar sobre más píxeles baja el error
relativo del clic. No sobrevive a reabrir el estudio —no se persiste, a propósito, son varios
MB— y ahí se cae al del slot, que es **self-consistente igual**: se calibra y se mide sobre los
MISMOS píxeles. La calibración **no se persiste**, y es lo correcto: si la imagen cambia de
tamaño —el selector de calidad la re-comprime— una escala guardada dejaría de valer.

### ⚠️ `cineStripSync` YA NO PUEDE MIRAR SÓLO EL uuid

Esa condición servía cuando la tira leía sólo el disco, indexado por estudio. Desde que lista los
slots, **cualquier import, borrado o reordenamiento dentro del mismo estudio la deja vieja** — y
el import es justo el caso que el médico mira. Se agregó una **huella de los slots**, que es la
lista de claves y **no un contador**: con un conteo, reemplazar una imagen por otra deja el mismo
número y la tira sigue mostrando la anterior.

### Dos casos viejos apuntaban al marcado que cambié, y el suite no me lo iba a decir

TC-184 y TC-185 leen `data-cine-id` y las clases `.cine-abrir`/`.cine-borrar`. **Están en rojo
por el pendrive desmontado**, así que un renombre los habría dejado inservibles sin que ninguna
corrida lo mostrara. Se conservaron los dos nombres —`data-cine-id` sigue en las tarjetas con
registro en disco— y `data-strip-i` se agregó al lado para las de slot, que no tienen id de
disco. **Al tocar marcado que consume un caso apagado, buscarlo a mano: el verde no lo cubre.**

De TC-184 hubo que reapuntar una condición: `innerHTML === ''` dejó de ser el invariante de «la
tira quedó vacía», porque con una imagen en la grilla la tira tiene contenido **y está bien que
lo tenga**. Hoy fija que el registro borrado ya no aparece.

### TC-216 se puso en rojo, y ésa es la señal

Pinaba la frase **literal** del cartel —«usá la tira DICOM de abajo»— que cambió a propósito: con
la tira unificada la imagen se abre igual desde el slot, así que mandar a la tira quedaría
prometiendo algo que esa tarjeta ya no tiene. Se reapuntó al **hecho**: que el cartel diga qué se
perdió —el original, o sea la escala del archivo— y que igual se puede medir. La condición no es
vacua: sin cartel el texto es `(no)` y falla igual. Es la misma corrección que ya se les hizo a
TC-123, TC-132 y TC-203.


## El viaje completo de lo importado, medido por formato (TC-233)

Auditoría del ciclo **importar → grilla → guardar → reabrir** para los cinco formatos del botón
nuevo. Lo que sigue está MEDIDO en Chrome por CDP, no leído.

| | slot | grilla | disco | reabre | tira |
|---|---|---|---|---|---|
| JPEG · PNG · BMP | ✓ | ✓ | `ceibomed_img` | ✓ | — |
| MP4 | ✓ | ✓ | `ceibomed_img` + `ceibomed_video` | ✓ | — |
| DICOM | ✓ | ✓ | + `ceibomed_cine` | ✓ | ✓ |

**La tira NO es la grilla, y el reporte las confundía.** `#cine-strip` se titula «DICOM guardados
en este estudio» y lista **originales medibles**; un JPG no tiene escala, así que no puede
aparecer ahí. Lo que el médico busca para un JPG es la grilla de imágenes, que funciona.

### ⚠️ EL RESULTADO DEPENDÍA DEL ORDEN EN QUE SE HICIERAN DOS COSAS SIN ORDEN

`medFijaGuardar` tenía **un solo disparador** —dentro de `dcmImgImportar`— gateado por
`_cinePuedeGuardar()`, que exige uuid de estudio. Y el flujo normal del médico es **importar
mientras llena el formulario y guardar al final**: ahí el uuid todavía no existe, así que el
original nunca se escribía, y **no había un segundo intento en ninguna parte**. Medido:

| | `ceibomed_cine` | tira | medible al reabrir |
|---|---|---|---|
| importar → guardar (el flujo normal) | **0** | **0** | **no** |
| guardar → importar | 1 | 1 | sí |

El síntoma es peor que perder el archivo. El slot vuelve con su `_dcmId` —viaja en la lista
blanca de `CeiboImg.guardar` desde TC-216— y `_medFijas` está vacío: **la llave sin cerradura**.
Ahí `_imgAvisoMedir` pinta «📏 Para medir esta imagen, usá la tira DICOM de abajo» **sobre una
tira vacía** — un cartel que manda a mirar algo que no existe.

Cerrado con `medFijasPersistir(uuid)`, llamada desde `imgPersistir`, que es el único momento en
que el uuid ya existe. **Se recorre `imgSlots`, NUNCA `_medFijas`**: esa tabla es memoria de
SESIÓN y conserva las fijas de los pacientes anteriores, así que escribirlas todas bajo este uuid
metería la imagen de otro paciente adentro de este estudio. La mutación que la recorre imprime
`ajenas=1`.

### El cartel sobrevivía al motivo que lo justificaba

`medFijasRestaurar` repintaba con `if (n && _medFijaOn …)`. El realce del modo medición sí
depende de ese estado, pero **el cartel se pinta siempre** —`imgRender` lo interpola sin mirar el
modo— y cuelga de `_medFijas`, que es justo lo que esa función acaba de cambiar. Con el modo
apagado, o sea el caso normal al reabrir, la grilla quedaba diciendo «usá la tira» sobre una
imagen que YA se podía medir desde el slot. Se sacó `_medFijaOn` de la condición.

### ⚠️ LA IMAGEN ERA EL ÚNICO FORMATO QUE SE PERDÍA EN SILENCIO

Con «Guardar imágenes con los estudios» apagado —**el estado de fábrica**— nada se escribe. El
video ya avisaba (`_videoAvisarPersistencia`) y el cineloop también (`_cinePuedeGuardar`, que
distingue cuál de las dos condiciones falta). La imagen no: sacaba **«✅ 1 imagen(es) de 1
archivo(s) elegido(s)»** —un tilde verde confirmando el éxito— y al reabrir no estaba. Es «el
interruptor mentía sobre el disco» otra vez.

Hoy `_avisarPersistenciaMedios(que)` es compartida y el video queda con su redacción intacta.
Recibe **el sujeto ya redactado** («Este video», «Esta imagen», «Las 3 imágenes») porque el género
y el número cambian la frase entera y una plantilla daría «Este imagen».

**Va en las TRES puertas de importación** —`mediosImportar`, `dcmImgImportar` y `imgFileElegido`—
y no en `imgCompressLoad`. Poniéndolo en la puerta común avisaría también en cada captura del
visor y en cada Ctrl+V, que son decenas por estudio. **Consecuencia declarada:** pegar con Ctrl+V
sigue sin avisar.

### Paridad con el «+» de un slot: verificada, no supuesta

Mismo archivo por las dos puertas da lo mismo en los dos formatos probados:

| | slot | `_dcmId` | medible |
|---|---|---|---|
| DICOM por «+» / por botón | 1 / 1 | 1 / 1 | 1 / 1 |
| JPEG por «+» / por botón | 1 / 1 | 0 / 0 | 0 / 0 |

Por eso el aviso tuvo que ir **también** en `imgFileElegido`: sin eso el mismo JPG entraba
avisando por una puerta y en silencio por la otra, justo en el caso que se acababa de arreglar.

### Un plazo fijo en un caso no es una condición, es una apuesta

TC-233 nació con `await esperar(900)` y **fallaba 1 de cada 4 corridas dentro del suite y ninguna
aislado**, con `slots=1 dcmId=0`. El slot lo crea el compresor dentro de su `.then()` y el id lo
ata el `MutationObserver` de la grilla: son **dos saltos asincrónicos**, y 900 ms no siempre
alcanzan con el harness cargado. Hoy se **sondea** hasta 6 s y se registra cuánto tardó de verdad,
que es lo que separa «tardó más» de «no pasó nunca».

**No se da por explicado el mecanismo.** El sondeo hace que el caso mida el invariante en vez de
un plazo, y 6/6 corridas en verde; pero no se reprodujo por qué a los 900 ms el slot existía con
el id todavía sin atar. Si vuelve a aparecer, el sospechoso es `imgCompressLoad` eligiendo un
target distinto del reservado —ahí el pendiente apunta a un slot que nunca se llena— y la señal
sería que el sondeo agote los 6 s en vez de pasar.

**Y el rojo colateral casi me hace dar por buenas tres mutaciones.** Con el plazo fijo, M1, M2 y
M5 caían además en «la fija entra al slot con su `_dcmId`», que no les toca: la cascada venía del
plazo y no de la mutación. Es *«un rojo colateral que no se puede explicar no se da por bueno»*.
Con el sondeo, cada una cae sólo donde le corresponde.

**Backticks dentro del cuerpo de un caso: van CUARENTA Y TRES** — dos tandas en esta sesión, las
dos en comentarios recién escritos, y la segunda en el que explicaba el sondeo de arriba.


## Importar imágenes y videos de cualquier ecógrafo (TC-232)

Botón «📥 Importar imágenes y videos» en la tab Imágenes y la misma opción en el menú
Importar de Guardados. Un clasificador por bytes (`_firmaArchivo`) que reparte a las puertas
que YA EXISTEN: DICOM a `dcmImgImportar`, MP4/MOV a `videoCargarEnSlot`, JPEG/PNG/BMP a
`imgCompressLoad`. **No hay un segundo lector de nada.**

### ⚠️ DOS FORMATOS DEL PEDIDO NO LOS ABRE EL NAVEGADOR, y está medido

| | medido contra este Chrome |
|---|---|
| BMP 1×1 bien formado | `new Image()` → **DECODIFICA 1x1** |
| **TIFF** 1×1 bien formado | `new Image()` → **NO DECODIFICA**; `_imgComprimir` rechaza «imagen ilegible» |
| **AVI** | `canPlayType` devuelve la **cadena vacía** en `video/avi`, `video/x-msvideo` y `video/msvideo` |
| MP4 | `canPlayType` → `maybe` |

Chrome y Firefox nunca soportaron TIFF en `<img>`; Safari sí. Y ningún navegador reproduce
AVI. Se detectan igual y se rechazan **diciendo el motivo y la salida** («exportalo como JPG
o PNG», «exportá el clip como MP4 H.264»). **El rótulo del botón no los promete**: decisión
de Maicol (2026-09-22), porque prometerlos manda al médico a descubrirlo recién con el
archivo del ecógrafo en la mano.

Sin ese motivo propio, hoy un AVI cae al flujo de foto y muere con «No se pudo procesar la
imagen», que manda a revisar un archivo que está perfecto.

### Tres firmas se ENDURECIERON respecto de la tabla del pedido

**Reconocer de más es peor que no reconocer**: manda un archivo ajeno a un decodificador que
lo dibuja a medias en vez de rechazarlo.

- **`52 49 46 46` NO identifica un AVI.** WAV y WEBP empiezan con los mismos cuatro bytes; el
  subtipo está en los **bytes 8-11** y en un AVI es `AVI ` **con el espacio final** — por eso
  `_asciiDe` no hace `trim()`, a diferencia de `_dcmImgAscii`. La mutación que devuelve `avi`
  para todo RIFF cae por dos condiciones.
- **`49 49`/`4D 4D` son dos bytes.** El TIFF real son cuatro: `49 49 2A 00` o `4D 4D 00 2A`.
- **`42 4D` también son dos.** Se cruza contra el tamaño de la cabecera DIB del byte 14, que
  sólo toma valores de una lista corta. Un «BM» con DIB 999 ya no pasa.
- **JPEG va con `FF D8 FF`** y no con `FF D8`: después del SOI viene siempre un marcador y
  todo marcador arranca con FF, así que el tercer byte no rechaza ningún JPEG real.

**MP4 estaba en la lista de «acepta» del pedido y NO en su tabla de magic bytes.** Lo cubre
la detección por `ftyp` que ya usaba `_esVideoSoportado` — la misma prueba, no una copia.

### ⚠️ LOS SLOTS SE RESERVAN SINCRÓNICAMENTE, Y ES LA CONDICIÓN QUE MÁS CUESTA PROBAR

`imgCompressLoad` elige slot **dentro de su `.then()`**, así que sin `_dcmImgReservar` el
orden de las imágenes depende de cuál termine de comprimirse primero — y ése es el orden en
que salen en el PDF.

**La mutación que saca la reserva SOBREVIVIÓ a la primera versión del caso.** Con tres JPEG
de 4×4, 5×5 y 6×6 se comprimen tan rápido que terminan en orden igual: el caso medía una
carrera que nunca ocurría. Hoy la primera imagen es de **1200×1200 con ruido determinista**
—incompresible, así que el encoder trabaja de verdad— y las otras dos chicas la pasan si
nadie reservó el lugar. Con la mutación puesta el orden sale `false,false,false`.
*Un fixture cómodo no prueba el caso incómodo*, otra vez.

Y el denominador va declarado: **las tres imágenes tienen que diferir entre sí**. Con tres
iguales, cualquier orden pasa.

### El Blob va CON SU TIPO, y el tipo sale de los bytes

Un archivo de ecógrafo suele venir **sin extensión**, así que `File.type` es cadena vacía y
el `data:` que arma FileReader sale `application/octet-stream`. Medido: hoy Chrome lo olfatea
igual y la imagen entra — pero eso es una tolerancia del navegador, no una garantía, y
`_orig` es lo que re-comprime el selector de calidad. Se envuelve en un Blob con el MIME que
decide `_firmaArchivo`, que es la misma razón por la que `dcmImgImportar` ya lo hacía.

### Los DICOM van AL FINAL, y el denominador nombra las dos cuentas

`dcmImgImportar` emite **su propio resumen** y puede abrir el reproductor de cineloop, que es
un modal: corriendo antes, taparía el alert de los rechazos y el médico no se enteraría de lo
que no entró. Por eso el aviso de `mediosImportar` dice «… de 8 archivo(s) elegido(s) · 1
DICOM, se informan aparte»: sin nombrarlos, la cuenta no cierra y parece que se perdieron.

### Lo que NO se hizo, y por qué

- **TXT y HTML quedaron fuera.** No existe ningún parser —cero `DOMParser` con `text/html` en
  el archivo; el CHM sólo extrae `patient_exam_data.xml`— y **no hay un solo archivo de
  muestra** con qué escribirlo. «Intentar parsear» texto de vendor desconocido es cómo entra
  una medición equivocada a un informe firmado, que es justo lo que `dcmImportarSR` evita al
  rechazar con el motivo en vez de arrastrar un parser sobre basura. Decisión de Maicol: se
  retoma cuando haya un TXT o un HTML real. **El rótulo no los nombra.**
- **La opción de mediciones se RENOMBRÓ, no se duplicó.** «🏥 DICOM SR» ya routeaba CHM del
  GE y DICOM SR por los bytes desde que existe el lector de CHM —su input acepta `.chm`— pero
  el rótulo decía sólo «.dcm del ecógrafo» y prometía de menos. Hoy es «📋 Importar
  mediciones — CHM del GE Vivid · DICOM SR». Agregar una segunda entrada al mismo
  `dcmImportarSR` habría dejado dos opciones del mismo menú haciendo exactamente lo mismo, y
  hay una condición que fija que sólo una apunte a `ig-import-dcm`.
- **WEBP no se acepta**, aunque Chrome lo decodifique: no está en el pedido y no tiene caso.
  Se rechaza **nombrando el subtipo RIFF**, que es accionable, en vez de con un genérico.

### Asimetría declarada: el «+» de un slot sigue con su propio ruteo

`imgFileElegido` —el «+» de cada slot— tiene su ruteo inline desde antes: DICOM por el magic
del byte 128, video por `ftyp`, y **todo lo demás al flujo de foto**. O sea que un TIFF o un
AVI soltados ahí siguen muriendo con «No se pudo procesar la imagen», mientras por el botón
nuevo dan el motivo exacto. **No se unificó a propósito**: era «sólo agregar botones» y
cambiar el «+» es tocar un control que nadie pidió mover. Si alguna vez se unifica, el
reemplazo es directo —`_firmaArchivo` contesta lo mismo y más— y hay que acordarse de que
ese camino sí pasa `slotPreferido`.

### El input no lleva `accept`, y acá pesa más que en los otros dos

Los dos inputs que ya existían lo omiten porque el GE Vivid escribe sin extensión. Éste
existe justamente para los ecógrafos que **no** son el GE, y no se sabe con qué extensión
—o sin ninguna— escribe cada uno. Por eso también se leen **132 bytes y no el archivo
entero** antes de clasificar: con el selector mostrando todo, alcanza con marcar una carpeta
con un video de varios GB para que un `arrayBuffer()` entero entre a memoria.

## «Conexión por red (DICOM)» sólo en Modo Avanzado — y son DOS superficies (TC-230)

La tarjeta de Config se renombró («🔌 Orthanc / DICOM en red» → «🔌 Conexión por red (DICOM)»)
y pasó a verse **sólo en Modo Avanzado**.

### ⚠️ ESCONDER SÓLO LA TARJETA DEJA UN CONTROL HUÉRFANO

Orthanc tiene **dos** superficies, y la segunda vive en otra pestaña: el botón
**«🔍 Buscar en Orthanc»** de la tab Imágenes, que gobierna `orthancBotonSync()`. Medido antes
de tocar nada, con Orthanc activado:

| | tarjeta de Config | botón de Imágenes |
|---|---|---|
| Modo Básico, antes | **332 px** | **44 px** |
| Modo Básico, hoy | 0 | 0 |

Con sólo el arreglo de Config, Modo Básico dejaba el botón visible **y su panel de
configuración escondido**: un control que el médico no puede ni apagar ni configurar desde
ningún lado. Por eso `orthancBotonSync` gatea también por modo, aunque viva en la tab Imágenes
— es el mismo módulo, no otro.

**El botón NO se sincroniza desde `cfgSetMode`**, y es deliberado: `showTab('imagenes')` ya lo
llama y es el único camino por el que ese botón se llega a ver. Agregarlo ahí sería un
resguardo que no se puede hacer fallar.

### La visibilidad la gobierna `orthancRender()`, no una regla CSS

El modo vive en `localStorage`, no en una clase del documento, así que no hay selector que
escribir. Va en `orthancRender` —el módulo se gobierna a sí mismo— y **no** en
`applyViewMode()`, que maneja las FILAS DE PESTAÑAS y no sabe nada de las tarjetas de Config.

**Y `cfgSetMode` la llama, que es la mitad que se olvida:** sin eso, apretar «Modo Básico» con
Config ABIERTO dejaba la tarjeta en pantalla hasta reabrir la pestaña. Son las dos columnas de
siempre —el embudo de repintado (`cfgOnShow`) y el borde que no pasa por él—. La mutación que
saca esa llamada cae **sólo** en «desaparece EN EL ACTO»; la que saca el gate cae en las tres.

### ⚠️ EL MODO VA DENTRO DE `orthancActivo()`, no AND-eado afuera (TC-231)

La primera versión dejaba el invariante «Básico ⇒ cero superficie de Orthanc» sostenido por
**dos `&& _orthModoAvanzado()` que coincidían** en los dos consumidores, con el predicado
pelado sin saber nada del modo. El tercer consumidor que apareciera —un auto-buscar al entrar a
Imágenes, un badge de «hay estudios nuevos», un sondeo— recibía `true` en Modo Básico **por
defecto** y resucitaba justamente la superficie que el médico no puede apagar desde ninguna
pantalla. **El camino fácil era el inseguro.**

Hoy `orthancActivo() = _orthEncendido() && _orthModoAvanzado()`, y `_orthEncendido()` es el
lector CRUDO que sólo usa la casilla. Consecuencia útil: la limpieza de `orthancRender` cuelga
de `on`, así que **pasa a cubrir las dos compuertas de una** — ver abajo.

### Falla hacia VISIBLE — pero el lado seguro lo fija el MARCADO, no la función

`_orthModoAvanzado()` devuelve `true` si `eeGetMode` no existe. Es el default de la app y el
lado seguro: esconder la tarjeta deja al médico sin forma de apagar una conexión que sigue
activa, y la única señal sería su ausencia — indistinguible de «esta app no tiene eso».

**Pero sus dos ramas de escape son inalcanzables**, y el comentario que decía lo contrario
estaba atribuyendo protección a quien no la ejerce: `eeGetMode` es una declaración de función
del **mismo bloque `<script>`** —hoisteada, así que el `typeof` nunca da false, y lo que se
llevara ese bloque se llevaría también a `_orthModoAvanzado` y a `orthancRender`—, y si
`localStorage` tira, `cfgRenderModulos()` revienta **sin try/catch** antes, porque
`orthancRender()` es la última sentencia de `cfgOnShow`. En los dos escenarios decide que
`#cfg-card-orthanc` **nace sin `display:none`**. Es la decisión OPUESTA a la del botón «Buscar
en Orthanc», que nace `display:none`: aquél promete una búsqueda que no existe, ésta es la
única forma de apagar la conexión. Las dos son correctas; sólo una está declarada en el marcado.

### ⚠️ EL TRABAJO ASÍNCRONO SOBREVIVE AL GATE si no lleva token (TC-231)

«Verificar conexión» son hasta **6 s de fetch + 4 s de sondeo**, y los botones de modo viven en
una tarjeta **contigua del mismo panel Config**: apretar «Modo Básico» con eso en vuelo dejaba
que `_orthPintarDatos` escribiera AE Title, puerto DICOM, host y la receta CORS **dentro de la
tarjeta ya escondida**, hasta diez segundos después. `orthancBuscar` es la misma forma con otra
cara: Escape cierra el overlay pero **no aborta el fetch**, y al resolver poblaba
`_orthEstudios`, que el propio código marca como *«SÓLO en memoria: lleva NOMBRES de paciente»*.

Cerrado con `_orthGen`, el mismo recurso que `_imgGen` y `_cineStripGen`: se incrementa en
`cfgSetMode` y en `orthancToggle`, se captura **antes del primer `await`** y se compara antes de
escribir. No hay fuga a disco —lo único persistido son los ids opacos de `_orthGuardarVistos`—;
el daño es estado obsoleto y una consulta de red que sobrevive a su compuerta.

**HAY DOS TOKENS EN EL CAMINO OK DE `orthancVerificar` Y LA MUTACIÓN NECESITA LOS DOS.** Sacar
sólo el de después del `fetch` **pasó en verde**: queda el de después de `r.json()`. Es defensa
en profundidad funcionando, no un hueco del caso — la misma lección que la guarda duplicada de
la sincronización del visor. *Al mutar un predicado, contar cuántas veces está escrito antes de
leer el resultado.*

**Y un `assert` del script de parcheo lo frenó a tiempo**, otra vez: el segundo token tiene la
**misma indentación** que el de `orthancBuscar`, así que el reemplazo matcheaba dos veces y el
archivo **no se escribió**. Sin esa guarda habría corrido el caso creyendo que había mutado.

### Esconder no es limpiar

La línea `if (!on) { _orthPintarEstado(''); _orthDatosOcultar(); }` estaba gateada por la
**casilla** y no por el modo, así que volver a Avanzado reponía la salida vieja de «Verificar»
—sin fecha y sin marca de obsoleta— y, combinada con lo de arriba, esa salida podía ser el
resultado de una verificación terminada **después** de que el modo la apagara. Desde que el modo
entró al predicado, `on` cubre las dos compuertas y la línea no cambió una letra.

### Denominadores de TC-231, y son cuatro

Que Orthanc quede **encendido**, que la verificación haya **arrancado** (si no, «no aterrizó» se
mide sobre nada), que la búsqueda haya **arrancado**, y que la segunda verificación haya salido
**bien** (si no, no hay nada que pueda resucitar). Las cuatro son condiciones declaradas.

**El doble de `_orthTraerEstudios` se restaura POR ASIGNACIÓN, nunca con `delete`**: es una
declaración de función de nivel superior, o sea una propiedad **no configurable** del objeto
global, y el `delete` es un no-op mudo que se lleva puesto el caso siguiente. Ya pasó con
`orthancImportarEstudio` en TC-222. Que ahí sí se pueda interceptar por `window` —a diferencia
de lo que vive dentro de un IIFE— es lo que hace innecesario sustituir `fetch`.

### Dos compuertas distintas, y confundirlas borra el apagado

El **MODO** esconde la tarjeta entera; la **CASILLA** esconde el cuerpo (dirección, verificar,
estado). Con Orthanc apagado la tarjeta sigue midiendo 237 px, que es lo que permite volver a
encenderlo. La mutación del arreglo a medias —esconder el cuerpo en vez de la tarjeta— deja el
**título suelto** en Modo Básico y cae por su condición.

### El denominador es que Orthanc esté ACTIVADO

Con la casilla apagada el botón mide 0 por su **otra** compuerta, así que un caso que no la
encienda mide cero sobre cero y pasa en verde con el arreglo revertido. TC-230 lo enciende y lo
declara como condición.

**Y restaura el modo en el `finally`**: Modo Básico esconde las filas de pestañas especiales y
de herramientas, o sea que dejarlo puesto se lleva por delante los casos siguientes.

### ⚠️ `document.body.innerText` NO SIRVE PARA BUSCAR TEXTO EN ESTA APP

Medido: devuelve **3909 caracteres de toda la app** y **no encuentra ni el rótulo que está
visible**, con su título midiendo 31 px. La condición «el rótulo viejo no sobrevive» escrita
así daba `false` con el rótulo viejo **y** con el nuevo — o sea pasaba sin probar nada, y la
mutación que revierte el renombre la dejaba en verde. Se reapuntó a los `.cfg-sec-title`.
`textContent` sí lo encuentra, pero incluye el contenido de los `<script>`, así que un
comentario del código con el rótulo viejo daría un falso positivo.

### Lo que NO cambió, y se verificó

- **El manual (`ECO_AYUDA`) no menciona Orthanc** — cero ocurrencias, así que el renombre no
  tiene la cuarta superficie que este archivo documenta para los rótulos de pestaña.
- **TC-161 no se rompe**: su lista `YA_ESTABAN` no incluye Orthanc y compara
  `cards.length >= YA_ESTABAN.length`.
- **Ningún id de control cambió.** El `id="cfg-card-orthanc"` nuevo es de una `<section>`, y
  `guardarInforme` barre `input/select/textarea`, así que no viaja al estudio — y además lleva
  el prefijo `cfg-`, que `_noEsDelEstudio` ya excluye.


## Los controles del visor no viajan dentro del estudio (TC-229)

`cine-cap-etiq` (la etiqueta de la captura) y `cine-slider` (el índice de cuadro) entraban en
`campos` de **cada estudio guardado**. Son controles del visor, no mediciones: no describen al
paciente. `_noEsDelEstudio` los excluye ahora por prefijo — el mismo arreglo que recibió
`fcg-valve-select` el 2026-09-09, y por el mismo motivo.

Tres cosas hacían que se viera poco: `cineCerrar()` sólo pone `display:none`, así que el input
**sobrevive en el DOM con su valor**; el barrido de `guardarInforme` **no mira visibilidad**; y
antes del autocompletado la etiqueta casi siempre estaba vacía, así que la clave viajaba con
cadena vacía y no llamaba la atención.

### ⚠️ SON CUATRO CONTROLES, NO DOS: LA SEGUNDA VISTA DUPLICA CADA UNO

Es lo único que separa el arreglo del arreglo a medias. La vista B se monta con
`_vNueva('b-', 'B')`, así que sus ids son **`b-cine-cap-etiq`** y **`b-cine-slider`** — y la
regex está anclada en `^`. Un `cine-` pelado deja pasar la mitad:

| | con `cine-` pelado | con `(?:b-)?cine-` |
|---|---|---|
| `cine-cap-etiq` · `cine-slider` | excluidos | excluidos |
| `b-cine-cap-etiq` · `b-cine-slider` | **siguen viajando** | excluidos |

La mutación que lo deja a medias imprime exactamente `b-cine-slider, b-cine-cap-etiq`. Medido
antes de tocar nada: el barrido ve **cuatro**. `b-` sólo lo acuña ese constructor, así que la
alternativa no se lleva nada ajeno.

### Se prueba GUARDANDO un estudio, no testeando la regex

Es la regla que este archivo ya fija para el prefijo `cfg-` de Orthanc. TC-229 guarda por
`__t.guardar()` —o sea `guardarInforme` de verdad, con su card de severidades— y mira las claves
de `campos`. Con el **denominador declarado**: que al guardar los cuatro controles **existan y
tengan valor**, porque sobre un visor cerrado o un input vacío «no aparece la clave» se cumple
sin probar nada. Lleva además control negativo —el nombre y la FEVI **sí** viajan—, que es lo
que caza una regex demasiado amplia: la mutación que le agrega `fevi` cae ahí.

### Lo que el arreglo NO cambia, y se verificó

- **Nadie leía esas claves**: cero consumidores de `campos['cine-…']`, y no están en
  `LAB_XLS_MAP`, así que no había Excel ni PDF colgando de ellas.
- **`limpiarCampos` sigue limpiando el input**: su barrido de texto **no** usa esta regex (sólo
  el de checkboxes, y el visor no tiene ninguno). Excluirlo del estudio no es borrarlo de la
  pantalla, y hay una condición que lo fija.
- **El autocompletado sigue andando** — su propia condición, con su mutación.

## La etiqueta dice DE DÓNDE viene el valor (TC-228)

Reemplaza a la primera versión de esta entrada, que rotulaba sólo la ventana. Hoy la etiqueta
lleva **procedencia + valor** y el renglón de abajo, **sólo el método**:

| | etiqueta (19 px) | resultado (15 px) |
|---|---|---|
| strain 1 vista | `A4C · SGL -16.7 %` | `contornos manuales, no speckle tracking · SGL orientativo` |
| strain 2 vistas | `A4C+A2C · SGL -18.3 %` | `… · SGL aproximado` |
| strain 3 vistas | `A4C+A2C+A3C · SGL -18.3 %` | `… · SGL con cobertura estándar` |
| Simpson monoplano | `1 vista · FEVI 52.6 %` | `Simpson monoplano por trazado manual` |
| Simpson biplano | `2 vistas · FEVI 52.6 %` | `Simpson biplano por trazado manual` |

Las siglas salen de `_strVista(k).rot` (su primer token), no de un mapa nuevo.

### ⚠️ SIMPSON NO SABE QUÉ VISTA TRAZÓ, así que se rotula por CANTIDAD

El pedido decía `A4C · FEVI X% · Simpson biplano`. **No es implementable**: el panel de Simpson
pide «la vista que estés usando» y después «la SEGUNDA vista (la otra apical)» —el médico puede
empezar por la 2C— y `_simpCalcular` devuelve `bi` y **ningún nombre**. Escribir «A4C» sería
afirmar en una imagen clínica un dato que la app no recoge. Y el biplano sale de **dos** vistas,
así que nombrar una sería incorrecto aunque se supiera cuál. Decisión de Maicol (2026-09-21):
`1 vista` / `2 vistas`. La mutación que le pone un nombre imprime `A4C · FEVI 52.6 %`.

### ⚠️ EL DESCARGO DE MÉTODO SE VENÍA RECORTANDO, Y ESO ES LO QUE ORDENA EL REPARTO

Defecto **preexistente**, encontrado al medir si los formatos nuevos entraban. `fillText` no
envuelve: recorta por la **cola**, que es donde vive `contornos manuales, no speckle tracking`.
Medido sobre el renglón que ya se quemaba, a 15 px:

| ancho del cineloop | texto | disponible | |
|---|---|---|---|
| 600 | 843 px | 590 | **recorta 253** |
| **636** (el más angosto del pendrive) | 843 | 626 | **recorta 217** |
| 800 | 843 | 790 | **recorta 53** |
| 1016 | 937 | 1005 | ok |

Verificado en píxeles, no por aritmética: la tinta llegaba a la **columna 635 de 636**. O sea
que en casi todo cineloop real el descargo salía cortado — lo que TC-227 existe para proteger.
Hoy: **527 de 636**. Dos arreglos: el reparto de arriba (cada cosa una vez) y `_medFontQueEntra`,
que achica el cuerpo hasta que entre, con piso de 9 px — el mismo recurso que `_pptFsQueEntra`.

### ⚠️ EL NÚMERO TIENE QUE QUEDAR QUEMADO POR UNO DE LOS DOS RENGLONES, SIEMPRE

Si la etiqueta la puso la app, ya lleva el valor y abajo va sólo el método. **Pero si el médico
escribió la suya** —que puede decir cualquier cosa— vuelve el texto completo: sin esa
distinción, una etiqueta propia dejaba la captura **sin el número**, que es exactamente el
defecto que TC-227 cerró, reintroducido por la puerta de al lado. La mutación que usa siempre el
texto corto imprime `mala ventana apical || contornos manuales, no speckle tracking` — sin un
solo número. Se decide con `laPusoLaApp`, comparando contra `_medEtiqAuto`.

### La rama de UN renglón con resultado quedó INALCANZABLE, y se deja declarada

El rótulo sale del **mismo cálculo** que el resultado, así que «hay resultado» implica «hay
etiqueta»: un renglón solo ya sólo puede ser la etiqueta del médico sin medición. **TC-227 se
puso en rojo por eso y tenía razón**: su escenario de «sólo resultado» comparaba 456 contra 456
y había dejado de medir. Se reapuntó a que el segundo renglón exista y esté dibujado, que es el
invariante real —la mutación que lo borra sigue imprimiendo `arriba=725 abajo=0`—.

### El caso fija invariantes, no el texto

Un caso que escribiera `A4C+A2C · SGL -18.3 %` literal hay que tocarlo cada vez que el texto
cambie a propósito. TC-228 exige: que la etiqueta **nombre las vistas que aportaron y ninguna
más** (con dos vistas, A3C **no** aparece), que lleve el valor que devuelve el cálculo, que
Simpson **no nombre ninguna**, que el número esté quemado en los dos escenarios y que nada
se recorte a 636 px. Cinco mutaciones, cada una en su condición.

**Backticks dentro del cuerpo de un caso: van TREINTA Y NUEVE**, otra vez en el comentario
recién escrito — el que explicaba por qué se reapuntaba TC-227.

## La ventana anatómica prefija la etiqueta de la captura (TC-228)

Al capturar durante el strain, la etiqueta se completa sola con la ventana que el médico ya
declaró: `A4C — apical 4 cámaras`. El rótulo sale de **`_strVista(...).rot`**, la misma tabla
que rotula los territorios y arma la guía del trazado — con un segundo mapa, el texto quemado
en el PNG y la pared que se publica podrían dejar de corresponderse.

### ⚠️ EL PEDIDO ANTERIOR PEDÍA OTRA COSA Y HABRÍA SIDO UNA REGRESIÓN

Pedía autocompletar la etiqueta con **el resultado** de la herramienta. Medido: eso ya lo hace
`_medResultadoParaCaptura` desde `e334eea`, y los textos pedidos eran un **subconjunto** de los
actuales —les faltaban `por trazado manual` y `contornos manuales, no speckle tracking`—, o sea
que adoptarlos sacaba el descargo de método de la imagen que circula sola. Además el resultado
habría quedado impreso **dos veces** en la misma franja, en negrita 19 px y en 15 px.

**Y «la etiqueta del slot» no existe.** El esquema del slot es `{dataURL, ampliada, calidad,
_orig?}` (+`origen`, `videoId`): no hay campo de texto, `imgRender` no dibuja ninguno y el PDF
no imprime pie por imagen. La etiqueta es `#cine-cap-etiq`, un input **del visor** que se quema
dentro del JPEG. Lo que sí faltaba —y es esto— era la **ventana anatómica**, que complementa el
resultado en vez de duplicarlo.

### ⚠️ «NO PISAR SI HAY ALGO» ES UNA TRAMPA: EL RÓTULO SE QUEDA PEGADO

`_medEtiqueta` **no tenía ningún reset** —sus dos únicas escrituras son los `oninput`— y sobrevive
al cambio de herramienta y de imagen (medido). Con la regla «no pisar» a secas, el campo deja de
estar vacío en el **primer** autocompletado y desde ahí es indistinguible de texto tipeado:

| | con «no pisar» a secas | hoy |
|---|---|---|
| capturo A4C | `A4C — apical 4 cámaras` | ídem |
| declaro A2C y capturo | **`A4C — apical 4 cámaras`** ← miente | `A2C — apical 2 cámaras` |

Es la misma familia que «quemaría una FEVI vieja en la captura de un strain», por otra puerta.
Por eso hay **`_medEtiqAuto`**, que guarda el texto exacto que puso la app: lo único que el
autocompletado puede reemplazar es **lo suyo**. Y por eso el reset de `medCambioDeImagen` compara
**igualdad** y no «hay algo» — borrar sin esa condición destruiría texto del médico.

**La mutación que lo fija imprime el valor medido**: `condicion: «Y SE ACTUALIZA AL CAMBIAR DE
VENTANA» · encontrado: A4C — apical 4 cámaras` sobre un escenario que declaró A2C.

### Gateado por la HERRAMIENTA ACTIVA, igual que el resultado

`_strain.vista` **sobrevive al cambio de imagen** —el flujo declara la ventana ANTES de abrir su
cineloop, y este archivo ya documenta que borrarla ahí puso seis casos en rojo—. Sin el gate
`_medHerr === 'strain'`, una captura de Doppler hecha después de un strain saldría rotulada A4C:
el reset limpia el **campo**, no `_strain.vista`. La mutación que saca el gate imprime
`vista=a4c etiqueta=A4C — apical 4 cámaras`.

### La llamada va ANTES de leer `etiq`, y la tinta sola no lo caza

Si `_medEtiqAutoPoner()` corre después, el rótulo aparece recién en la captura **siguiente**.
La condición que lo fija es la **altura de la franja** —con ventana hay etiqueta Y resultado, o
sea dos renglones (456 px); sin ventana, uno solo (434)—. Contar tinta en el renglón de arriba
**no alcanza**: la mutación imprime `altoSin=434 altoCon=434 tinta=3049`, o sea que hay tinta de
sobra y es la del **resultado**. Cinco mutaciones, las cinco en su propia condición.

### Una corrida del suite se colgó, y los «70 Chrome huérfanos» eran de otra app

La primera corrida quedó **59 min al 0,0 % de CPU** después de TC-199, con el archivo sin crecer.
TC-200 aislado pasa en tiempo normal, y el cambio no crea ninguna promesa.

**⚠️ Y `pgrep -f "user-data-dir"` devolvió 70 procesos que NO eran del harness**: son los helpers
de **ChatGPT y de Claude Desktop**, que usan ese mismo flag. Matarlos habría cerrado las apps del
usuario. Los del harness se identifican por su bandera propia —`--headless=new
--remote-debugging-port=0`—, y con ese patrón eran **23**. *Antes de matar por patrón, mirar el
`command` completo de lo que matcheó.*

## El resultado en la captura, y la diana borrosa (TC-227)

### BUG 3: la captura llevaba las LÍNEAS y no el NÚMERO

`medCapturarConMedicion` componía imagen + overlay + franja de etiqueta. El resultado —FEVI o
SGL— no estaba en ninguno de los tres: **vive en el panel, no en el canvas**. El PNG que llega
al PDF mostraba un trazado sin decir qué dio.

**⚠️ Y EL NÚMERO NUNCA VA SOLO: va con su MÉTODO.** Un PNG que dice «FEVI 58 %» o «SGL −18 %»
es indistinguible de una medición del equipo, y este archivo ya documenta ese costo exacto para
el bull's eye —*«sin el descargo quemado nadie que lo mire después sabe con qué método
salió»*—. Acá vale más, porque es la imagen del paciente. Se quema
`FEVI 51,4 % · Simpson biplano por trazado manual` y
`SGL −16,7 % · … · contornos manuales, no speckle tracking`.

**Biplano y monoplano se distinguen**, porque no son la misma medición: la guía recomienda el
biplano y sus valores normales se midieron así. Y **no se gradúa**: esta app borró la
graduación del SGL a propósito y el monoplano no tiene cortes propios.

**⚠️ MANDA LA HERRAMIENTA ACTIVA, no el primero que tenga datos.** Las sesiones de Simpson y de
strain **conviven** —las dos sobreviven al cambio de imagen— así que preguntar «¿hay un
Simpson?» primero quemaría una **FEVI vieja** en la captura de un strain. Lo tuve mal en la
primera versión y lo delató la sonda. El escenario del caso siembra **las dos a la vez**, que
es lo único que distingue una implementación de la otra.

### BUG 4: no era el tamaño de la letra, era el backing store

El canvas de la diana nacía con `width="300"` y se mostraba a 300 px de CSS. Medido:
**`devicePixelRatio` es 2** en este mismo Chrome, así que el navegador estira esos 300 al doble
y **todo** sale borroso — lo que más se nota son los rótulos de pared, que a esa escala salen
en **7 px** (`esc = S/320`, `round(7.5 × 0,9375)`).

Se dibuja a `S × dpr` con el tamaño CSS fijado en `S` y el contexto escalado: **el dibujante no
cambia una línea** —sigue razonando en las mismas coordenadas— y el texto rasteriza a
resolución nativa. Acotado a 3 para no inflar el canvas por nada.

**No se tocaron los tamaños de fuente**, y es deliberado: este archivo documenta que la diana
ya se salió del canvas una vez y que *un canvas no avisa, recorta en silencio*. El reporte dice
«borrosas», no «chicas».

### Dos mutaciones que SOBREVIVIERON, y las dos eran huecos del caso

- **`dpr = 1` sobrevivía porque en el harness `devicePixelRatio` VALE 1.** La condición
  `backing === 300 × dpr` se cumple igual sin el arreglo: era **vacua** en ese entorno. Hoy el
  caso **fuerza** `devicePixelRatio` a 2 con `Object.defineProperty` y declara si pudo. La
  lección es la de siempre con otra cara: *una condición que depende del entorno hay que
  fijarla, no heredarla*.
- **Borrar el renglón del resultado sobrevivía porque mutaba OTRA RAMA.** El dibujo tiene dos:
  un renglón (sólo etiqueta o sólo resultado) y **dos** (etiqueta + resultado). Mi escenario
  sólo ejercía la primera. Hoy captura con las dos combinaciones y cuenta tinta **arriba y
  abajo**; la mutación imprime `arriba=725 abajo=0`.

### Y la forma del fixture, TRES veces en la misma sesión

Un trazado tiene **dos consumidores con campos distintos**, y los dos muerden:

| | lee | si falta |
|---|---|---|
| `_simpCalcular` | `diamCm` —un **ARRAY de 20 discos**, no un escalar— y `Lcm` | volumen `NaN` → `null`, la captura sale sin FEVI y parece que el arreglo no anda |
| `_medPintar` | `pts[]` para dibujar el contorno | `Cannot read properties of undefined`… **sólo si hay canvas** |

Y no eran dos campos sino **siete**: `_medPintar` lee además `eje.M`, `eje.apex`, `eje.L`,
`eje.ux`, `eje.uy` y `diam[]` —otro array, en **píxeles**, distinto de `diamCm`—. Los fui
descubriendo **de a uno por corrida**, que es la forma más cara posible.

Ese «sólo si hay canvas» es lo que lo vuelve traicionero: con `--solo` no hay visor abierto y
el caso **pasa**; en el suite completo, con el visor que dejó un caso anterior, **revienta**.
Es «pasa con --solo y falla en el suite» por **sexta** vez.

**LA SALIDA NO ERA ADIVINAR MEJOR, ERA DEJAR DE ADIVINAR.** El trazado se arma ahora con los
**constructores de la app** —`_simpEje` y `_simpDiametros` sobre un contorno de puntos
reales—, así que todos los campos salen coherentes entre sí y de la misma fuente que los de
verdad; la forma exacta la fija `_simpAceptar`. **Al fabricar una estructura que la app
construye, usar su constructor y no una copia a mano** — y si hace falta mirarlo, está en el
sitio donde la app la crea, no en el que la consume.

Verificado con aritmética cerrada: 20 discos de 4 cm y L = 8 dan `π/4 · 128 = 100,5 ml`.

**Y un `assert` del script de parcheo lo frenó a tiempo**, otra vez: el reemplazo de los
fixtures no matcheó —las dos entradas estaban partidas en dos líneas— y el archivo **no se
escribió**. Sin esa guarda habría corrido el caso creyendo que lo había arreglado, porque el
`--solo` da verde con el fixture viejo. Es lo que separa «no se aplicó» de «se aplicó mal».


## Los dos bugs del flujo de medición — y uno era una premisa falsa (TC-226)

### ⚠️ BUG 1: «al cambiar de imagen el visor no recalibra» — MEDIDO, ES FALSO

La escala **se relee sola del archivo nuevo**. `_medRegs()` lee
`_cineDatos.loops[i].d.regiones` en vivo, no cacheada. Medido con dos loops de escalas
distintas:

| | |
|---|---|
| loop 0 | `dx = 0,05` |
| tras cambiar a loop 1 | `dx = 0,20` |
| `_medEscalaEn()` en la nueva | `ok:true · fuente: "del archivo"` |

O sea que en las **286 de 301** imágenes del pendrive que declaran regiones **no hay nada que
recalibrar**: se mide de una.

**Lo que sí estaba trabado son las 15 sin escala.** Ahí hace falta calibración manual, y
`medCambioDeImagen` la borra —**correctamente**, es de la imagen que se deja— pero **nadie
llevaba al médico a calibrar de nuevo**: esa regla vivía sólo en `medToggle`, o sea **al
ENCENDER la medición**, no al cambiar de imagen con la medición ya prendida. Ése era el «paso
extra» del reporte. Hoy la regla está en `_medAutoCalibrar()` y la llaman **las dos**.

**⚠️ Y LO QUE NO SE HACE: arrastrar la calibración de la imagen anterior.** Es la lectura
literal de «recalibrar automáticamente» y es **peligrosa**: la escala va de **0,046 a 0,926
mm/px** entre archivos, así que reusarla daría un número plausible y equivocado **sin ningún
síntoma**. La mutación que la conserva cae por dos condiciones. Decisión de Maicol
(2026-09-21).

### BUG 2: la compuerta existía por un motivo, y el arreglo no es sacarla

`medStrainConfirmar` exigía ventana declarada porque sin ella el getter `pares` devolvía **un
literal nuevo en cada lectura**: asignarle era un guardado que **no guardaba nada, en
silencio**. Sacar la compuerta sola reintroduce exactamente esa pérdida — y hay una mutación
que lo demuestra.

El arreglo es **darle un casillero real**: `_strain.sinVista = {d,s}`, al que cae el getter
mientras no haya ventana. Confirmar guarda de verdad, y `medStrainElegirVista` **muda** lo
parqueado a la ventana que se elija. Si esa ventana ya tenía par, **se pregunta** antes de
pisarlo, y con un «no» **no se cambia de ventana**: lo parqueado sigue parqueado y se puede
elegir otra.

**Un par completo sin declarar SÍ detiene el flujo**, y eso se conserva a propósito: sin saber
de qué vista es, no se le puede atribuir ningún territorio. Hasta declararlo **no cuenta para
el SGL** — hay una condición que lo fija.

### ⚠️ EL TERCER «DEFECTO» ERA MÍO, Y HUBO QUE REVERTIRLO

Propuse —y Maicol aprobó sobre mi descripción— **borrar la ventana declarada al cambiar de
imagen**: pasar de A4C a A2C dejaba `'a4c'` puesta y el contorno de la imagen nueva se
guardaría en el casillero de la vieja. **Reproducido, es al revés:** el flujo **declara la
ventana ANTES de abrir su imagen** —`medStrainVistaSiguiente()` y recién después se carga el
cineloop de esa vista— así que borrarla la borra **justo cuando el médico acaba de elegirla**.

Medido con el borrado puesto: el SGL salía con **una vista en vez de tres** y **seis casos de
strain** se pusieron en rojo (TC-199, 200, 201, 204, 205, 207) — todos verdes contra HEAD, o
sea regresión mía y no expectativas viejas.

**Y la contaminación que yo quería evitar ya estaba cubierta**: cada trazado guarda su imagen y
`_strainCalcular` compara la de diástole contra la de sístole (`mismaImagen`). Revertido, con
una condición que fija ese guard en su lugar.

La lección es la de siempre, aplicada a mi propia propuesta: **una hipótesis sobre el flujo no
vale hasta reproducirla**. La aprobación de Maicol se dio sobre mi descripción, que era falsa.

### Y la segunda regresión: «ninguna región MEDIBLE» no es «ninguna región»

`_medAutoCalibrar` nació copiando la condición de `medToggle` —*no hay ninguna región
medible*— y con eso **cambiar a una imagen Doppler abría el modo calibrar**, tapando el mensaje
que explica que ahí el eje horizontal es **tiempo**. Una imagen Doppler **tiene** regiones,
sólo que ninguna es 2D. Puso en rojo TC-199, TC-204 y TC-205.

La condición correcta para el cambio de imagen es más estricta: **el archivo no trae NINGUNA
región**. Con regiones presentes, cada herramienta ya da su propio rechazo explicado y el modo
calibrar sobra. `medToggle` quedó **byte por byte como estaba**: no se le cambia el
comportamiento a una función que no se vino a tocar.

### El panel tuvo que aprender a no saber la vista

`VA = _strVista(_strain.vista)` es `null` mientras no se declare, y el paso de trazado lo usaba
en **seis** lugares. Todo lo que depende de la vista cae a una redacción genérica — y el
**orden del trazado no se puede dar sin saberla**: la geometría es la misma —de un anillo, por
el ápex, al otro— pero **qué pared es cuál lo decide la vista**. Así que se dice eso, y que los
rótulos se asignan al declararla, en vez de nombrar paredes que todavía no se sabe cuáles son.
El selector de ventana va **siempre visible** mientras se traza: es lo que hace que declararla
sea un acto y no un paso que bloquea.

### Dos trampas propias

- **`grep` de la llamada no encuentra lo que se pasa por REFERENCIA.** Busqué
  `medCambioDeImagen()` con paréntesis y di por hecho que **no tenía llamadores** —iba a
  reportarlo como hallazgo grave—. Se pasa como referencia dentro de un `MutationObserver`:
  `_vCon(V, medCambioDeImagen)`. Es la misma lección que «grepear declaraciones no encuentra lo
  que se exporta desde un IIFE», por la otra punta.
- **Backticks dentro del cuerpo de un caso: van TREINTA Y OCHO**, otra vez en el comentario
  recién escrito para explicar la reversión de arriba.
- **Un trazo falso tiene DOS consumidores con campos distintos, y los dos muerden.**
  `_strainCalcular` lee `arcoAcm`/`arcoBcm` —no `bordeCm`—: con la forma equivocada el SGL
  sale `null` y parece que el cambio rompió el cálculo. Y `dibujarTr` lee `pts[0]`, el último
  punto y `eje.M`/`eje.apex`: sin eso revienta con «Cannot read properties of undefined»…
  **pero sólo cuando hay canvas**, o sea que con `--solo` pasaba y en el suite completo —con
  el visor ya abierto por un caso anterior— se caía. Es «los nombres de campo exactos» **más**
  el denominador, juntos.


## «Editar» se mudó de la lista al detalle (TC-225)

La fila de Guardados tenía **seis** controles —⭐ · nota · Evol · PDF · Editar · 🗑️ · ···— y el
que abre el estudio para corregirlo compartía tamaño y peso visual con el que lo borra. Editar
pasa al detalle; la fila queda sin él y sin su separador.

### ⚠️ UN COMENTARIO CON ACENTOS GRAVES ME ROMPIÓ EL BLOQUE 8

El marcado del detalle se arma dentro de un **template literal**, así que los backticks del
comentario que escribí para explicar el cambio **cerraron la cadena** y se llevaron el bloque
`<script>` entero — el 8, que es **donde vive `CeiboStore`**. Lo cazó el chequeo de sintaxis
comparado contra HEAD: pasó de fallar 2 bloques (los del extractor, que fallan siempre) a
fallar 3, con `Unexpected identifier 'margin'`.

Este archivo ya documenta «un comentario mío rompió el bloque `<script>` entero» y la cuenta de
backticks dentro del cuerpo de un caso va en 36 — pero **ésta es la primera vez que pasa en
`index.html` y no en el suite**. La regla es la misma y ahora vale para los dos lados: dentro
de un template literal, **describir sin acentos graves**. Quedó dicho en el propio comentario.

### El contraste descartó la clase que parecía natural

El botón necesitaba una clase al mudarse. `btn-primary` es la que sugiere «acción principal» y
**falla AA en el tema oscuro**. Medido sobre los dos temas:

| clase | oscuro | claro | |
|---|---|---|---|
| **`btn-primary`** | **3,21** | 4,70 | ✗ cablea el blanco |
| `btn-ghost` | 13,2 | 14,05 | ✓ |
| `btn-green` | 9,45 | 5,48 | ✓ |
| `btn-save` | 4,86 | 4,86 | ✓ |

Es el mismo defecto que este archivo documenta para `--purple` en el botón CC: **cablear un
solo color de texto deja el botón ilegible en uno de los dos temas**. `.btn-primary` ya se usa
en otros lados —eso es preexistente y fuera de alcance— pero **no se agrega una instancia
nueva**. Queda `btn-ghost`, la misma clase que el botón ya tenía: **cambia de lugar, no de
apariencia**, y la prominencia sale de ir primero.

La condición del caso exige AA en los **dos** temas **y que las dos lecturas DIFIERAN** — si
dieran lo mismo estaría midiendo dos veces el mismo tema, que es la trampa de TC-114.

### «Eliminar» se separa con `margin-left:auto`, no con un margen fijo

Con `flex-wrap`, un margen fijo lo deja **pegado al siguiente** en cuanto la fila envuelve, que
es justo lo que pasa en móvil. La condición contempla las dos formas de estar separado —hueco
grande en la misma línea, o en otro renglón— y además exige que **los otros tres sigan juntos
entre sí**, que es lo que le da sentido al hueco. La mutación que saca el `margin-left` imprime
`hueco=8 gap=8`.

### Lo que un chequeo de marcado NO ve

Mover un botón es barato de escribir y caro de verificar: lo que puede romperse no es que no
aparezca —eso se ve— sino que **aparezca y no haga lo mismo**. Los cuatro se **clickean de
verdad** y se comprueba a qué función llama cada uno. La mutación que le cambia el destino al
botón de Editar cae ahí, con la lista de llamadas en el diagnóstico.

**Y el suite no dependía del botón**: sus dos usuarios llaman `editarInforme(id)` directo, y
`__t.reabrir` va por `cargarEstudioPorId`. Se verificó antes de mover, no después.


## Origen del SGL: no es una etiqueta, cambia QUIÉN entra al Bland-Altman (TC-224)

Dos botones bajo el campo SGL —🤖 Automático · ✋ Manual— y cinco variables clínicas más en el
Excel de strain.

### ⚠️ EL SELECTOR CONTAMINA UNA CONCORDANCIA QUE YA EXISTÍA

El exportador de strain existe para medir acuerdo **entre métodos**: manual del visor contra el
automático del equipo. Y `_labStrainFilas` toma el campo `sgl` como automático **sin
condición**: `auto = -Math.abs(_labGls(inf))`. Desde que el médico puede declarar ese valor como
**Manual**, el Bland-Altman pasaría a comparar **manual contra manual** — concordancia
espuriamente buena, y son los números que se citan en un paper.

Decisión de Maicol (2026-09-21): esos estudios **no entran** a la concordancia ni al promedio
del «SGL del informe», siguen en la hoja Datos con su origen, y la hoja Estadísticas los cuenta
aparte. La mutación que ignora el origen deja `n=4` donde deben ser 3.

**Y UN ORIGEN VACÍO SÍ ENTRA.** El campo es opcional: no declararlo **no es** declararlo
manual. Sin esa segunda condición, una implementación que excluyera todo lo no marcado como
«auto» pasaba igual — la mutación `origen !== 'auto'` existe para eso.

### El estado vive en un DESPLEGABLE OCULTO, y eso es lo que evita tocar otros módulos

Los botones son sólo la pintura. El valor vive en un `select` con `display:none`, así que
hereda **las tres columnas gratis**: `guardarInforme` barre `select[id]` —viaja con el
estudio—, las rutas de restauración lo repueblan con el barrido genérico, y `limpiarCampos` lo
resetea con su `selectedIndex = 0`.

Un `input[type=hidden]` habría hecho las dos primeras y **no la tercera**: ese barrido toma
`input[type=text]` e `input[type=number]`, y este archivo ya pagó esa fuga entre pacientes con
`ete_tavi_jet_horas` y `co_serie_json`.

Lo único que sí necesitó las dos columnas es **repintar los botones** (`sglOrigenSync` en
`RECALC_MODULOS` **y** al final de `limpiarCampos`): el desplegable oculto no se ve, así que la
única superficie que puede mentir es el botón. La mutación que le pone default «auto» cae por
dos condiciones.

**Un segundo clic en el botón activo lo desmarca.** El campo es opcional, así que tiene que
haber forma de volver a «no declarado» sin recargar; si no, marcar por error deja una
afirmación pegada al estudio.

### ⚠️ EL RITMO NO SE EXPORTA CRUDO

`hf_ritmo` viene de fábrica en **`auto`**, que significa «deducilo de la Diastólica» y **no es
un ritmo**; y el resolutor de la app (`_hfSrcCampos().ritmo()`) **cae a sinusal** cuando no hay
nada. Exportar eso afirmaría ritmo sinusal en todo estudio donde nadie lo miró — en un dataset
eso es fabricar el dato. Sólo se emite lo **consignado**:

| | |
|---|---|
| `hf_ritmo` = `rs` / `fa` | alguien lo eligió → se emite |
| `diast_ritmo` = `fa` | alguien lo eligió → se emite (su opción 0 es «sinusal», o sea que un «sinusal» ahí puede ser el default intacto) |
| cualquier otra cosa | **vacío** |

La mutación que devuelve «Sinusal» por omisión cae por su condición.

### Dos premisas del pedido que no se sostuvieron

- **«Diagnóstico principal» no existe.** No hay `diagnostico` ni equivalente estructurado.
  Decisión de Maicol: **no se exporta columna** y la hoja Estadísticas dice por qué —una
  columna vacía en todas las filas se lee como dato faltante y no como campo inexistente—. El
  texto del informe tampoco: el exportador tiene modo anónimo y el EN SUMA puede llevar nombres
  escritos a mano, así que exportarlo lo rompería.
- **«SGL manual del visor» ya era una columna** (`SGL manual (%)`), igual que «SGL del informe».

### El encabezado dejó de afirmar

`SGL automático (%)` pasó a **`SGL del informe (%)`**: desde que el origen se declara, aquel
rótulo sería una afirmación que el propio dato puede contradecir. El origen va en su columna al
lado, y hay una más —**«Entra al Bland-Altman»**— que dice **fila por fila** si el par entró,
para que quien analiza no tenga que reconstruir el criterio desde la hoja de Estadísticas.

### ⚠️ Y «las hojas 2 y 3 no se tocan» era INCOMPATIBLE con la decisión

El pedido lo pedía como verificación. Excluir del Bland-Altman **necesariamente** saca filas de
la hoja 2 y agrega el contador y las notas a la hoja 3. Gana la decisión; lo que sí se conserva
byte por byte son **las columnas** de la hoja 2, y hay una condición que las fija.

### Tres trampas del propio caso

- **La forma de `strain_manual` es `{vistas:{A:{vi:{…}}}}`**, no `{vi:{…}}`. Mi primera sonda
  usó la forma de adentro y el exportador salió por su «no hay estudios con strain manual»: el
  caso medía sobre cero filas. Es «los nombres de campo exactos» otra vez.
- **Un regex con paréntesis escapados dentro del cuerpo de un caso NO matchea nunca.** El
  template literal se come la barra invertida y `\(` queda como **grupo**, así que
  `/Comparables \(entran…\)/` daba `false` sobre una hoja correcta. Se resuelve con `indexOf`,
  que es lo que este archivo recomienda desde la quinta vez.
- **Escribir el nombre de una etiqueta dentro de un comentario rompe el conteo de balance.**
  Puse la palabra literal en la explicación y el balance de `select` pasó de 51 a 52 sin que el
  marcado hubiera cambiado. En los comentarios, describir.

### Y un comentario que quedó explicando la función equivocada

Al insertar los helpers justo antes de `_labStrainFilas`, su comentario de cabecera —«una fila
por estudio con strain manual»— quedó describiendo **mis** helpers. Es el mismo defecto que el
reordenamiento de tarjetas del Laboratorio ya documenta: **la unidad que se mueve es "lo que
precede + la función"**. Se repuso pegado a la suya.


## Importar un estudio desde Orthanc — y el PatientID que NO es la cédula (TC-223)

Elegir un estudio en el panel baja sus instancias y las mete **por las puertas que ya existen**:
`dcmImgImportar` para imágenes y cineloops —la misma del botón «Importar DICOM» y del «+» de un
slot— y `dcmImportarSR` para los informes estructurados. **No hay un segundo lector de DICOM**:
con dos, el estudio que entra del pendrive y el que entra de Orthanc podrían divergir.

### ⚠️ EL PUNTO 4 DEL PEDIDO REINTRODUCÍA UN DEFECTO YA CERRADO

Pedía cargar «nombre, fecha de nacimiento, **CI**» del DICOM. El **PatientID no es la cédula**:
en un ecógrafo de hospital es el **número de historia clínica**. El comentario de
`_dcmPaciente` ya lo documenta, con el daño concreto:

> *«entra en la clave primaria de `_dupKeys` igual que un documento real: un número de historia
> que coincida con la cédula de otro paciente en la misma fecha hacía que "Actualizar" pisara
> el nombre y el documento del paciente equivocado y le fusionara adentro las mediciones de
> este estudio.»*

Acá se respeta: el identificador **se muestra** —con la explicación de por qué no se cargó— y
**no se escribe en `ci`**. La mutación que lo escribe imprime `ci="HC-88231"` en el diagnóstico.

### Y NO HAY CAMPO DE FECHA DE NACIMIENTO

Los campos de paciente son `nombre`, `ci`, `edad`, `fecha` y `sexo`. La fecha de nacimiento no
se descarta: se usa con la fecha del estudio para derivar la **EDAD**, que es el campo que
existe y el que alimenta la superficie corporal.

**⚠️ Y EL PRIMER ESCENARIO DE LA EDAD NO DISCRIMINABA.** Nacido en **marzo** con estudio en
**septiembre**, el cumpleaños ya pasó, así que con ajuste y sin ajuste da 46 igual: la mutación
que saca el `a--` **sobrevivió**. El valor que separa las dos implementaciones es un cumpleaños
que **todavía no llegó** (25/dic → 45, no 46). Es «elegir el valor que distingue el umbral
correcto del error plausible», otra vez. Se agregó además la banda: sin fecha, o una fecha
imposible, **no publican un número** — sin ella la mutación devolvía una edad de **−74**.

### Lo demás que se decidió, y por qué

- **Los datos del paciente salen del objeto de Orthanc** (`PatientMainDicomTags`), no de parsear
  los archivos: es lo que Orthanc ya indexó y evita un tercer parser.
- **Sólo se escribe lo que está VACÍO.** Pisar lo que el médico tipeó sería peor que no
  completar: el dato del ecógrafo no es necesariamente el correcto. La mutación que pisa cae.
- **`sexo` admite sólo `M`/`F`.** DICOM también emite `O`, y asignar un valor que no es opción
  deja el select **sin selección**, en silencio — lo que este archivo ya documenta con
  `vab_tipo` y con el centro del encabezado.
- **`edad` lleva `oninput="calcBSA()"`** y asignar `.value` **no lo dispara**: sin despachar el
  evento, la superficie corporal queda en blanco con la edad cargada.
- **El SR NO llena campos solo**, y eso es mejor que lo que pedía el punto 3: `dcmImportarSR`
  termina en `_dcmRenderPreview()`, o sea una **vista previa que el médico confirma**. El aviso
  lo dice en vez de prometer un autocompletado que no ocurre.
- **La clasificación SR vs imagen usa `_dcmImgLeer(buf).sop`**, que expone el SOP Class del
  meta-grupo **antes** de rechazar por sintaxis de transferencia — o sea que clasifica incluso
  un archivo que ese lector no sabe dibujar. Sin tercer parser.
- **Se ordena por `InstanceNumber`**: define en qué orden caen las imágenes en los slots, o sea
  el orden en que salen en el PDF.
- **Se cede el hilo en cada vuelta.** Sin eso la pestaña queda congelada y la barra de progreso
  **no se repinta**: existe y no se ve.
- **El overlay de progreso es `_bkProgAbrir/_bkProg/_bkProgCerrar`, el del backup**, que ya
  tiene documentado por qué es overlay y no toast.

### ⚠️ `delete window.<funcion>` NO BORRA NADA, y se lleva puesto el caso siguiente

TC-222 sustituía `orthancImportarEstudio` por un espía y lo «restauraba» con `delete`. **No
funciona.** Medido en este Chrome sobre esa propiedad:

| | |
|---|---|
| `configurable` | **false** |
| lo que devuelve el `delete` | **false** |
| qué queda después | **el espía** |

Una **declaración de función en nivel superior** crea una propiedad **no configurable** del
objeto global, así que borrarla es un **no-op silencioso**. Consecuencia: el espía de TC-222
sobrevivía, **TC-223 corría contra él** y fallaba entero —`img=-1 sr=-1`— mientras con `--solo`
daba verde. Es «pasa con --solo y falla en el suite» por **cuarta vez** en este archivo, y la
primera cuyo culpable es otro caso y no el entorno.

**La forma correcta es guardar y restaurar por ASIGNACIÓN** (la propiedad es `writable: true`),
y para simular la ausencia, asignar `undefined` en vez de borrar.

**Y lo delató un `assert` del script de parcheo**, no el suite: el comentario que escribí para
explicar esto contenía la sentencia literal y hacía fallar la guarda final —además de llevar
**backticks**, que habrían roto el template literal del caso—. El `assert` corre **antes** del
`write`, así que el archivo no se tocó: es lo que separa «no se aplicó» de «se aplicó mal».
Backticks dentro del cuerpo de un caso: **van TREINTA Y SEIS**.

### Dos trampas del propio caso

- **Un JPEG hecho a mano no es un JPEG.** El mío tenía tabla de cuantización trucha y ninguna
  tabla de Huffman: se extraía bien del DICOM y después `imgCompressLoad` **no lo podía abrir**,
  así que la imagen nunca llegaba al slot y el caso acusaba al importador de un defecto propio.
  El suite ya tiene un 1×1 decodificable de verdad — hay que usar ése.
- **Muestrear el DOM con `setInterval(20)` dio CERO.** Con `fetch` sustituido la importación
  entera dura menos que un tick, así que el overlay nace y muere entre dos muestras. Se
  **instrumenta la frontera** —envolviendo `_bkProgAbrir`/`_bkProg`— y de paso la condición se
  vuelve más fuerte: exige «Importando imagen 1/3» **y** «3/3», o sea que la barra avanza.

### Alcance declarado

El camino de la **imagen** se prueba de punta a punta —DICOM sintético que termina en un slot—
y el del **SR por espía** sobre `dcmImportarSR`: lo que este código decide es **a qué puerta**
mandar cada archivo, no cómo se lee un SR, que ya cubren TC-143 y los del CHM. **Contra un
Orthanc real no se probó**: el que hay en la máquina no tiene ningún estudio todavía, y
subirle uno de prueba para verificar no es algo que deba hacer una verificación.


## Panel de estudios de Orthanc en la tab Imágenes (TC-222)

Botón «🔍 Buscar en Orthanc» junto a «Importar DICOM», visible sólo con Orthanc activado, y un
panel propio **dentro de EcoSmart** — no se abre la interfaz de Orthanc.

### ⚠️ VERIFICADO CONTRA EL ORTHANC REAL, y confirmó la decisión del Prompt 1

Apareció un Orthanc de verdad corriendo en la máquina (`lsof -iTCP:8042` → `Orthanc`), así que
por primera vez se pudo verificar contra el servidor y no contra un doble. Lo que dio:

| | |
|---|---|
| `curl http://localhost:8042/system` | **HTTP 200** |
| cabeceras `Access-Control-*` | **ninguna** |
| el panel, desde el navegador | *«Hay un servidor … pero el navegador no me deja leerlo. Casi siempre es CORS»* |

O sea: **Orthanc anda perfecto y el navegador lo bloquea igual.** Una implementación con el
mensaje único del pedido original —«¿está instalado y corriendo?»— habría mandado al médico a
revisar un servidor que acababa de instalar y que funciona. El sondeo `no-cors` que distingue
los dos casos **no era una precaución teórica**: es el caso real de una instalación nueva.

### Dos cosas que el Orthanc real desmintió o resolvió

- **`Version` es la cadena `"mainline"`, no un semver.** Una detección de capacidades por
  comparación de versión —«¿es ≥ 1.11?»— habría sido frágil. Acá se **prueba el endpoint y se
  cae al respaldo**, que es lo que corresponde y quedó validado por accidente.
- **`Level: "Study"` es el valor correcto.** La documentación muestra `"Study"` en un ejemplo y
  `"Studies"` en otro; el servidor real acepta `"Study"` y devuelve lista.

### La API: tres cosas que no son obvias y rompen MUDAS

1. **`Modality` NO está a nivel estudio, está a nivel SERIE.** `/studies?expand` no la trae.
2. **La cantidad de imágenes tampoco**: hay que pedir los tags **computados**
   `ModalitiesInStudy` y `NumberOfStudyRelatedInstances`…
3. …**y vuelven en una sección `RequestedTags` APARTE**, no dentro de `MainDicomTags`. Leerlos
   de ahí devuelve `undefined` en silencio. La mutación que lo hace cae por su condición.

`InstitutionName` **sí** está en los tags principales del estudio.

**`RequestedTags` existe desde Orthanc 1.11**, así que hay un respaldo por `/studies?expand`
que anda en toda versión y da todo menos esos dos. Ahí se imprime **«—» y se DICE por qué**, en
vez de dejar dos columnas vacías. La mutación que inventa los valores cae.

### ⚠️ «NUEVO» SE DECIDE POR CONJUNTO DE IDS, NUNCA POR MARCA DE TIEMPO

La fecha la pone **Orthanc** y la marca la pondría **este navegador**: son **dos relojes**, y
Orthanc puede correr en otra máquina. Es la misma razón por la que el banner de versión compara
**sello contra sello y no contra `Last-Modified`**.

**Y la condición que lo fija necesita un escenario incómodo**, porque con estudios de fechas
normales las dos implementaciones coinciden: hay un estudio **de 1999 sin ver** —que tiene que
salir NUEVO— y uno **de 2099 ya visto** —que no—. La mutación por timestamp los da vuelta los
dos y el diagnóstico imprime `["id-futuro","id-hoy"]`.

**La primera búsqueda NO marca nada como nuevo.** Con todo resaltado, el resaltado no distingue
nada y encima entrena a ignorarlo; esa pasada fija la línea base.

**El resaltado lleva la PALABRA «NUEVO», no sólo el borde verde**: un color solo no lo ve quien
no distingue el verde y no sobrevive a una captura en gris.

### SEGURIDAD: en disco sólo van los ids

La lista lleva **nombres de paciente** y vive **sólo en memoria** (`_orthEstudios`). Lo único
que se persiste son los **ids opacos** de Orthanc, que es lo que necesita la comparación.
Persistir la lista sería dato clínico en disco sin cifrar, contra la regla de la casa — y hay
una condición que recorre `localStorage` entero buscando los nombres del escenario. La mutación
que cachea la lista cae ahí.

**«Sólo localhost» se implementó como un AVISO y no como un bloqueo.** La sección de Config ya
admite una dirección de LAN a propósito —Orthanc puede correr en otra máquina de la clínica— así
que bloquear rompería lo que ya existe. Lo que se detecta es una dirección **pública**: loopback,
RFC1918, CGNAT y link-local pasan; una IP enrutable avisa que la API podría ser alcanzable desde
internet. Un dominio **no se adivina**.

### Detalles

- **La fecha se parte a mano.** `new Date('yyyy-mm-dd')` es UTC y en Uruguay devuelve el **día
  anterior** — este archivo ya lo pagó con `_pptFechaLarga`. Y el orden es por la **cadena**
  `StudyDate+StudyTime`, donde el orden lexicográfico ES el cronológico.
- **El nombre DICOM viene `APELLIDO^NOMBRE^^^`** y se colapsan los separadores vacíos.
- **El id del estudio va por `data-orth-estudio` con listener delegado**, nunca interpolado en
  un `onclick`: la lista se reconstruye en cada tecla del filtro, así que enganchar por fila
  acumularía un listener por pulsación.
- **El botón nace OCULTO y lo enciende `orthancBotonSync()`.** Al revés, un bloque que dejara
  de parsear lo dejaría prendido prometiendo una búsqueda que no existe.
- **Se repinta al entrar a la tab**, porque la preferencia puede haberse movido en **otra
  pestaña** del navegador, donde este documento no se entera.
- **El tope es 500 y se DECLARA cuánto quedó afuera** — sin eso, un recorte silencioso se lee
  como «esto es todo lo que hay».
- **Sin respuesta NO se dice «no tiene estudios»**: son cosas distintas y hay una condición que
  lo separa.

### El seam de la importación, que todavía no existe

Elegir un estudio cierra el panel y delega en `window.orthancImportarEstudio(id)` **si está
definida**; si no, lo **dice**. Un clic que cierra el panel y no hace nada más se lee como que
la app se colgó — es el defecto de los controles mudos que este archivo documenta con los siete
acordeones de Congénitas.

### Lo que NO se pudo verificar

El Orthanc real **no tiene ningún estudio todavía**, así que la forma de un estudio POBLADO
—nombres exactos de los campos, formato de `ModalitiesInStudy` con varias modalidades— sigue
verificada sólo contra el doble, cuya forma sale de la documentación. **No se le subió un
estudio de prueba**: escribir en el servidor clínico de alguien no es algo que haga una
verificación. Se cierra en cuanto el ecógrafo mande el primero.


## Orthanc en Config — cuatro premisas medidas, y ninguna daba lo que el pedido suponía (TC-220)

Sección «🔌 Orthanc / DICOM en red» en ⚙️ Config: interruptor, dirección, «Verificar conexión»
y los datos para configurar el ecógrafo. EcoSmart sólo **consulta** la API REST de Orthanc.

### 1 · ⚠️ LA IP DE LA MÁQUINA NO SE PUEDE DETECTAR DESDE EL NAVEGADOR

El pedido decía «La IP se detecta automáticamente». **No se puede.** La vía histórica eran los
candidatos ICE de WebRTC y Chrome los ofusca con mDNS desde la v80. Medido en este Chrome:

| | |
|---|---|
| candidatos ICE | **1** |
| IPs numéricas | **0** |
| el único candidato | `22ceee99-…-c14953d2fd8e.local` |

Un botón «Detectar automáticamente» habría sido un control que **no puede funcionar nunca**.
Decisión de Maicol (2026-09-21): la IP se **deriva de la dirección que el médico tipeó**, y con
`localhost` se dice que no se puede y se da el comando (`ipconfig` / `ifconfig`). **No se
inventa una IP**: publicar una equivocada hace que el médico la copie al ecógrafo y el envío
falle sin ninguna pista. La mutación que la inventa cae por dos condiciones.

### 2 · ⚠️ ORTHANC NO MANDA CORS DE FÁBRICA, Y EL FALLO ES INDISTINGUIBLE DE «NO ESTÁ»

El pedido daba un solo mensaje de error: *«No se encontró Orthanc. ¿Está instalado y
corriendo?»*. Ése es **el mensaje equivocado en el caso más probable**: Orthanc viene sin
cabeceras CORS, así que el primer «Verificar» de toda instalación nueva falla con Orthanc
perfecto. Y medido, los dos fallos son el MISMO error:

| | |
|---|---|
| CORS bloqueado | `TypeError: Failed to fetch` |
| puerto sin nadie | `TypeError: Failed to fetch` |

**Un sondeo `no-cors` SÍ los distingue** — medido: con el servidor vivo la respuesta **opaca
resuelve** (`status 0`, `type:"opaque"`) y con el puerto muerto **rechaza**. De ahí salen los
dos mensajes. La mutación que salta el sondeo imprime «❌ No se encontró Orthanc» sobre un
Orthanc que está ahí.

**La receta que se imprime lleva el ORIGEN EXACTO y no `"*"`**, y eso es clínico: con el
comodín, **cualquier página** que el médico abra en otra pestaña podría leer los estudios de su
Orthanc. Hay una condición que lo fija.

### 3 · ⚠️ DESDE HTTPS, CHROME BLOQUEA EL ACCESO A LOOPBACK

Medido sobre `https://ecosmart.ceibomed.com` con Chrome real por CDP:

> *«Access to fetch at 'http://localhost:8042/system' … has been blocked by CORS policy:
> Permission was denied for this request to access the `loopback` address space»*

Falla igual `127.0.0.1`, y **también falla el sondeo `no-cors`** — o sea que ahí el
discriminador del punto 2 deja de discriminar. Por eso el mensaje de HTTPS **nombra las dos
causas** en vez de elegir una. Está gateado por un permiso del navegador, así que el fallo **no
prueba que Orthanc falte**.

**⚠️ DEUDA DECLARADA: el camino CON el permiso concedido NO está verificado.** No se puede
reproducir en headless (no hay diálogo) y correr Chrome con esa protección desactivada lo
bloqueó el clasificador. Queda para probar a mano con Orthanc corriendo. **En `http://localhost`
sí está verificado de punta a punta.**

### 4 · El puerto DICOM y el AE Title salen de `/system`, NO de constantes

El pedido los fijaba en `4242` y `ORTHANC`. Son los valores **por omisión de Orthanc** y son
**configurables**: `/system` publica `DicomPort` y `DicomAet`. Cablearlos haría que el médico
copie datos equivocados al ecógrafo, sin ningún síntoma hasta que el envío falle. Se leen del
servidor y, si no vienen, se cae al defecto **rotulándolo** «valor por defecto». El escenario
del caso usa `11112` y `MIPACS` a propósito — con los valores de fábrica, la mutación que
cablea pasaría en verde.

**Y el texto decía «para que tu ecógrafo envíe estudios a EcoSmart».** Es falso: el ecógrafo
envía a **Orthanc** y EcoSmart lee de Orthanc. Dicho al revés, manda al médico a buscar
EcoSmart en la lista de destinos del ecógrafo, donde no está.

### Arranque automático: la premisa de Windows era la más cara (TC-221)

El pedido decía: *«Durante la instalación elegí "Install as a Windows Service"»*. **Esa opción
no existe.** Verificado en dos páginas del proyecto:

> *«The official Windows installers include a Windows service that automatically starts Orthanc
> during the startup of Microsoft Windows.»* — página de descarga
> *«Orthanc is running as a Windows Service, which means that it will automatically start
> whenever your computer starts.»* — quickstart de Windows

O sea que **ya está hecho**. Imprimir esos tres pasos mandaba al médico a abrir el instalador a
buscar una casilla inexistente y a concluir que había hecho algo mal, **con Orthanc ya
arrancando solo**. Hoy el bloque dice que ya está y da cómo **comprobarlo** (`services.msc`).
La mutación que restaura el texto del pedido imprime la frase completa en el diagnóstico.

### Y el comando de Mac no existía: el pedido lo dejaba como placeholder

`[comando LaunchAgent de Orthanc]`. Medido antes de inventarlo:

| | |
|---|---|
| `brew info orthanc` | **«No available formula»** — tampoco como cask |
| distribución de macOS | **binarios sueltos**, sin instalador |
| integración de servicio oficial para Mac | **ninguna** |

Así que no hay comando que citar: hay que **escribir el LaunchAgent**, y el panel **declara que
esa receta no sale del proyecto**. Se ofrecen dos caminos: Docker —que el proyecto sí
documenta— y el LaunchAgent para los binarios.

**Dos apartamientos deliberados de los ejemplos oficiales de Docker**, porque aquéllos son para
probar y esto es para una app clínica:

- **`orthancteam/orthanc` y no `jodogne/orthanc`**: la doc dice que aquélla soporta **ARM64**,
  que es lo que traen los Mac de hoy.
- **con `-v` y sin `--rm`**: los ejemplos de la doc usan `--rm` y ningún volumen. Sin volumen,
  **reiniciar el contenedor borra los estudios**. La mutación que copia el ejemplo oficial cae
  por tres condiciones.

**El comando se verificó ejecutándolo de verdad**, con `HOME` redirigido a un sandbox: produce
un plist que `plutil -lint` acepta y cuyas claves lee launchd. **No se corrió
`launchctl bootstrap`** — registrar un servicio en la máquina del usuario no es algo que haga
una verificación. Y se usa `bootstrap` y no `load`, que en macOS 26 está deprecado
(«Recommended alternatives: bootstrap | enable»).

### El botón está SIEMPRE, además de desplegarse la primera vez

El pedido ofrecía «una cosa **o** la otra». Se hacen las dos: mostrarlo una sola vez y sin
botón lo vuelve **inalcanzable** después, que es exactamente el defecto que la barra de memoria
documenta haber evitado con el aviso de cuota.

### No se afirma haber DETECTADO que Orthanc ya es un servicio

`/system` no informa nada de eso, así que la frase va en condicional —«si ya lo instalaste como
servicio…, EcoSmart no puede saberlo desde acá»— en vez de darlo por detectado. La mutación que
lo afirma cae por su condición.

### El sistema del navegador no es el del servidor

Con una dirección de LAN, Orthanc corre en **otra computadora** y el sistema de ESTE navegador
no dice nada de aquélla: ahí se muestran **los dos** y se avisa que los pasos van en la otra
máquina. Con `localhost` sí coinciden y se muestra uno solo. Sistema desconocido → los dos.

### Y la mutación que mataba el caso en vez de hacerlo fallar

Dibujar el botón sólo la primera vez reventaba TC-221 con
`Cannot read properties of null (reading 'click')`, así que **la condición que existe para
declarar ese defecto nunca se evaluaba**. Es la lección de TC-207: rojo es rojo, pero un caso
que se muere no diagnostica. Con un `clk()` que devuelve `false` si el botón no está, la
mutación cae en «el botón sigue» con un mensaje legible.

### Los ids van con prefijo `cfg-`, y no es estilo

`guardarInforme` barre `input[id]` de **todo el documento** y `_noEsDelEstudio()` excluye por
prefijo. Sin él, la dirección de Orthanc y el interruptor se guardarían en `campos` de **cada
estudio**, viajarían al Excel y los contaría `detectar_huerfanos` — la misma regla que los
paneles de referencia de Marfan y Fontan. **El caso lo prueba guardando un estudio de verdad y
mirando las claves**, no testeando la regex.

### El campo sobrevive a «Nuevo estudio» porque la fuente de verdad es localStorage

`limpiarCampos` vacía `input[type=text]` de todo el documento **sin mirar prefijo** —es lo que
ya le pasa a `firma-nombre`— así que el campo puede quedar en blanco con la dirección bien
guardada. `orthancRender()` la repone desde `cfgOnShow`, que es el embudo de repoblado de
Config. Y como `limpiarCampos` asigna `.value` **sin disparar `input`**, vaciarlo NO borra lo
guardado.

### Detalles que no son adorno

- **Un esquema ajeno se RECHAZA, no se reescribe.** `file:///etc/passwd` salía como
  `http://file:8042`: no es un agujero —ese host no resuelve— pero mangle en silencio lo que el
  médico tipeó y después el error habla de una dirección que nadie escribió. El `://` distingue
  un esquema de un `host:puerto`, así que `localhost:8042` sigue entrando.
- **`usuario:clave@` se descarta** al reconstruir el origen: no viaja en cada fetch ni queda
  impreso en el cartel de estado.
- **El valor a copiar va en `data-orth-copiar` con listener delegado**, nunca interpolado en un
  `onclick`: ahí el escape no protege porque el parser decodifica la entidad ANTES de compilar
  el handler. Y estos valores vienen de la red, no son literales del archivo.
- **El «Copiar» tiene dos vías y avisa si fallan las dos.** `navigator.clipboard` exige contexto
  seguro Y activación de usuario; `execCommand` es el respaldo. Un «Copiar» que no copia y no
  avisa hace que el médico pegue en el ecógrafo lo que tenía antes en el portapapeles.
  **NO SE PUDO VERIFICAR EN HEADLESS**: un `.click()` sintético no da activación de usuario y
  las dos vías se niegan. Queda para la prueba a mano.
- **El 401 no se confunde con ausencia.** Orthanc con autenticación responde, y decir «no está
  instalado» ahí es falso.

### Tres trampas del propio caso

- **TC-219 pasaba con `--solo` y fallaba en el suite**, por tercera vez en este archivo — y
  **mis dos primeras hipótesis fueron falsas**. Supuse overlays del visor: agregué un cierre
  defensivo y siguió fallando. Supuse el plazo del render —`imgStorageRender` es asíncrona— y
  puse un sondeo en vez de los 170 ms fijos: siguió fallando. Cada hipótesis costó una corrida
  completa del suite.

  Lo resolvió **hacer que el caso recorriera la cadena de ancestros y nombrara el culpable**:

  > `ig-img-storage d=block h=0 < H2[card-head] d=flex h=0 < DIV[card] h=0 ov=hidden <`
  > **`ig-lista-view d=none h=0`** `< tab-guardados[active] d=block h=516`

  La pestaña Guardados tiene **DOS SUB-VISTAS** —lista y detalle— y algún caso anterior la
  deja en la de detalle, así que `ig-lista-view` queda en `display:none` y **todo lo que cuelga
  de ella mide cero**, con la pestaña perfectamente activa. Se vuelve a la lista por
  `volverAListaInformes()`, que es el camino real.

  **La lección operativa: un diagnóstico que nombra el valor medido cuesta UNA corrida; una
  hipótesis cuesta varias y puede errar dos veces seguidas.** La condición de denominador hizo
  su trabajo —declaró que la medición no valía en vez de reportar un fallo falso del colapso—
  pero decía *qué* fallaba y no *dónde*.
- **Buscar el texto `on…=` en el `innerHTML` da falso positivo.** El payload viaja **escapado**
  dentro de `data-orth-copiar`, así que al serializar aparece como texto de atributo y el regex
  lo matchea sobre un panel perfectamente sano. El invariante es que **ningún elemento tenga un
  atributo de evento** — se recorre `el.attributes`.
- **Backticks dentro del cuerpo de un caso: van TREINTA Y CUATRO** —tres en este turno— y las
  tres en comentarios recién escritos, uno de ellos explicando justamente esta trampa.

### TC-161 se puso en rojo con 8/8, y ésa es la señal

Fijaba `cards.length === 7` — el **inventario del día** en que se escribió, no el invariante: dio
rojo sobre un Config perfectamente sano apenas apareció la tarjeta de Orthanc. Es el literal 53
otra vez. Y un conteo además es **débil**: 7 sigue dando 7 si alguien borra una tarjeta y agrega
otra. Reapuntado a **las siete por TÍTULO**: borrar una cae siempre y además **dice cuál**
—verificado por mutación, el diagnóstico imprime «Médicos»—, y agregar una no molesta a nadie.

### Y el suite se colgó, que no es lo mismo que ir lento

Una corrida quedó **56 minutos al 0,0 % de CPU** — idle, esperando una promesa que no resuelve.
Peor: la lancé con `| tail -40`, que **bufferiza toda la salida**, así que no se podía saber en
qué caso quedó. **Para una corrida larga, redirigir a un archivo y no pasarla por `tail`.**


## La barra de memoria despliega el detalle — y el `onclick` que la tenía en 44 px (TC-219)

Los tres contadores (📷 imágenes · 🎬 cineloops · 💾 espacio) pasan a mostrarse al pasar por
encima o al tocar la barra. Por defecto queda sólo la barra de color con el porcentaje.

### ⚠️ EL AVISO DE CUOTA NO ENTRA AL COLAPSO, y es lo único que este caso existe para fijar

El pedido decía «el detalle (imágenes, cineloops, espacio usado)» — o sea **los tres
contadores**, que es exactamente lo que se colapsó. El **bloque de aviso con el botón
«📤 Exportar estudios antiguos» queda afuera**, porque la entrada de TC-211 ya lo decidió:

> *«El BLOQUE se muestra SIEMPRE por encima del 60 %: es un estado, y esconderlo porque ya se
> mostró una vez se lleva puesto el botón justo cuando hace falta.»*

Y en táctil no hay hover, así que meterlo adentro lo volvería **inalcanzable** en el celular.
La condición que separa un caso útil de uno decorativo es **aviso VISIBLE con el detalle
CERRADO**: la mutación que mueve el `av.appendChild` de `cont` a `det` cae ahí y sólo ahí.

### EL HOVER VA POR CSS Y NO POR JS, y el motivo es el repintado

`imgStorageRender` repinta el contenedor entero —la llaman `renderInformesGuardados`, el
guardado, el borrado y cada cambio de la lista—, así que un `mouseenter` guardado en una
variable se pierde en el primer repintado y el detalle **se cierra solo con el puntero
encima**. El navegador reevalúa `:hover` sobre el nodo nuevo sin que nadie se acuerde.
Lo que sí necesita estado es el **clic**, que es el único camino en táctil.

**El hover no se ejerce en el caso**, y está declarado: `getComputedStyle` no resuelve
pseudo-clases sin puntero real —este archivo ya documenta que mutar una regla `:hover` no pone
nada en rojo—. Se verifica que la **regla exista** en `document.styleSheets`, que es
verificación sobre el fuente, el mismo recurso que TC-98 usa para `TEER_CRIT`.

### El `display` del detalle NO puede ir en línea

`mk()` arma todo con `style.cssText`, y un `display:block` inline **le gana** a
`.ig-stor-det{display:none}` de la hoja: el detalle quedaría siempre visible. Es el conflicto
que este archivo ya pagó con `[hidden]` y el banner de versión.

### ⚠️ LA PREMISA QUE FALTABA: ya había un «clic para ver el detalle», y era un TOAST

El contenedor traía `onclick="imgStorageDetalle()"` con `title="Tocar para ver el detalle"`, y
esa función mostraba **el mismo dato** —estudios, MB, porcentaje— como toast. El pedido no la
menciona. Con el detalle desplegable, un clic habría disparado **las dos presentaciones del
mismo dato**, y la de arriba se va sola a los tres segundos mientras el panel se queda. Se
borró `imgStorageDetalle` —su único llamador era ese atributo— en vez de dejarla esperando a
que alguien la volviera a enganchar.

### Y sacar ese atributo cerró un defecto de layout PREEXISTENTE

La regla táctil global matchea por el **atributo** (`[onclick]{min-height:44px;min-width:44px}`),
y el contenedor es un **hijo de flex sin `flex-grow`**: con `min-width:44px` se encogía a
**44 px de ancho** y todo el contenido se envolvía dentro de esa columna. Medido en el mismo
layout, HEAD contra hoy:

| | HEAD | hoy |
|---|---|---|
| `min-width` del contenedor | **44px** | `auto` |
| ancho real | 44 px | 212 px |
| bloque de aviso | **44×114** — el texto y el botón en una columna de 44 px | 212×114 |
| detalle | 44×225, siempre visible | 0×0 cerrado |

O sea que el aviso de cuota y su botón se venían dibujando en una tira de 44 px de ancho. Es
«un `onclick` inline infla el elemento a 44×44» otra vez, con la cara del `min-width`.

El disparador nuevo lleva `role="button"`, que matchea la **misma** regla y le da a la fila sus
44 px de alto — ahí sí es lo correcto: pasó a ser un objetivo táctil de verdad.

### ⚠️ INVENTÉ EL ID DEL CONTENEDOR, y habría fallado en silencio

Escribí `document.getElementById('img-storage-info')`. El real es **`ig-img-storage`**. Las dos
funciones nuevas salían por su `if (!cont) return` y el clic no habría hecho **nada**, sin
error. Lo cazó ir a leer TC-211, que ya lo nombraba. **Un id inventado no falla, calla** —
enésima vez, y acá el modo de falla era «la función que acabás de escribir nunca hace nada».

### Dos mutaciones que enseñaron algo

- **`_igDetalleAbierto = true` SOBREVIVÍA, y el caso era vacuo.** Mi condición llamaba a
  `cerrar()` y **después** comprobaba que estuviera cerrado — o sea comprobaba lo que el propio
  caso acababa de hacer. Es «si el valor lo pusiste vos, no probaste nada» aplicado al estado
  inicial de un módulo. Sacado el `cerrar()`, la mutación cae por **cinco** condiciones.
- **`cont.classList.toggle('abierta', …)` en el render es REDUNDANTE hoy y queda a propósito.**
  `cont.textContent = ''` vacía los **hijos**; el contenedor no se recrea, así que la clase
  sobrevive al repintado sola. Está declarado en el código en vez de dejar creer que la
  mutación la caza. Lo que **no** es redundante es el `aria-expanded`: la fila **sí** se recrea
  en cada pintada, y su mutación cae por «ABIERTO SOBREVIVE A UN REPINTADO».

### El denominador de un caso que mide ALTO es que la pestaña esté abierta

Las dos primeras condiciones de geometría dieron rojo sobre código sano: en `display:none`
**todo mide 0**, así que el alto dejaba de distinguir «colapsado» de «la pestaña está cerrada».
El caso llama `showTab('guardados')` y **declara** que hay geometría antes de medir nada.

### Y el preview headless NO sirve para medir píxeles absolutos acá

`window.innerWidth` devuelve **0** y el `h2.card-head` mide **28 px de ancho**: la página se
maqueta a ancho degenerado. Las comparaciones **relativas** en la misma sesión sí valen —es
como se midió la tabla de arriba— pero cualquier número citado como «a 1280 px» sería falso.
Para absolutos, el harness, que maneja un Chrome de verdad.









## VTI en el visor y Qp/Qs — sin una segunda fórmula (TC-218)

Séptima herramienta del grupo Doppler/M: se recorre la envolvente del espectro y sale la
integral velocidad-tiempo en cm, más un panel de Qp/Qs.

### ⚠️ LA FÓRMULA DEL PEDIDO ESTABA MAL POR PARTIDA DOBLE

Pedía `Qp/Qs = (TSVI × VTI_TSVI) / (TSVD × VTI_TSVD)`. Dos errores:

1. **Diámetro LINEAL en vez de al cuadrado** — el flujo es *área* × VTI, y el área va con D².
2. **Qp y Qs invertidos** — el TSVI es el tracto **sistémico**; el pedido lo pone en el numerador.

Medido sobre TSVI 20 mm / VTI 16 cm y TSVD 28 mm / VTI 20 cm:

| | |
|---|---|
| `eteQpQs()`, la del informe | **2,45** — «shunt significativo, evaluar cierre» |
| la del pedido | **0,571** — «sin cortocircuito significativo» |

**Un shunt que se opera, informado como ausente.** Por eso el panel **no implementa la fórmula**:
le pasa los cuatro valores a `eteQpQs()` con un `src` sintético. Con una segunda copia, el visor
y el informe publicarían números distintos del mismo paciente. La mutación que restaura la
fórmula del pedido imprime `0.5714` en tres condiciones.

**Y la escala tampoco se reescribe.** `eteQpQsInterp` tiene **cuatro** bandas y la que el pedido
omitía es la que más cambia la conducta: **`< 1`, flujo neto de derecha a izquierda** — ahí la
graduación por magnitud no aplica y hay que descartar Eisenmenger. La mutación que pone las tres
bandas del pedido cae por «el panel usa esa interpretación, no otra».

### El VTI se verifica contra un TRIÁNGULO de área analítica

Base 200 px × 0,004 s/px = 0,8 s; altura 100 px × 0,5 cm/s/px = 50 cm/s → **VTI = ½·0,8·50 = 20 cm
exacto**. Medido: **20,000000, error 0 %**. Sin una figura de área conocida, «da 19,7» no se
distingue de «la integral está mal por un 1,5 %».

**SE INTEGRA EL VALOR ABSOLUTO**, y no es cosmético: `PhysicalDeltaY` es **negativo** en las 132
regiones de velocidad del pendrive, así que un flujo trazado por debajo de la línea de base daría
un VTI **negativo**. Un VTI es una magnitud. El caso traza el mismo triángulo espejado y exige el
mismo número; la mutación que quita el `Math.abs` lo pone en rojo.

### La compuerta exige LOS DOS EJES, y eso la separa de sus vecinas

La velocidad sólo necesita el eje Y en cm/s; el tiempo sólo el eje X en segundos. **El VTI es la
integral de una por el otro.** Un modo M tiene el eje X en segundos y el Y en **centímetros**: ahí
«el área bajo la curva» daría cm·s —una distancia integrada en el tiempo— y el número saldría
perfectamente presentable. La mutación que deja la compuerta en un solo eje hace pasar el modo M.

Cada rechazo dice **su** motivo: el 2D manda a ✏️ Área, el modo M explica que su eje vertical son
centímetros, y una región con velocidad pero sin tiempo dice que faltan las dos escalas. El caso
exige que los motivos **difieran** — decir «no es Doppler» en los tres sería falso en dos.

### El botón carga los VTI, NO el cociente

**No hay campo donde poner el cociente**: para CIA/CIV/DAP el Qp/Qs del informe se **calcula** desde
`diam_tsvi`, `itv_tsvi`, `tsvd_diametro` y `vti_tsvd` (los únicos `*_qp_qs` que existen son los de
DSAV y CVPA, de sus propias secciones). Copiar el número a un campo derivado sería la fórmula
duplicada que este archivo ya pagó tres veces: se quedaría viejo en cuanto se corrija cualquiera
de los cuatro. Se cargan los **VTI** y el informe recalcula — el caso verifica que dé **el mismo
número**, que es lo que impide que haya dos Qp/Qs.

Los diámetros salen del informe; si falta alguno **se dice cuál**, y se ofrece usar la última
distancia medida con 📏 —que es la otra vía que el pedido nombraba— escribiéndola en el campo del
informe, no en una variable del visor.

### Detalles

- **El rol TSVI/TSVD es exclusivo**: asignar una envolvente nueva a un tracto libera la anterior,
  o dos reclamarían el mismo lado y el desempate quedaría en el orden de trazado.
- **La curva se dibuja ABIERTA.** Una envolvente no se cierra: el tramo por la línea de base ya
  está contado dentro de la integral.
- **El VTI SÍ se borra al cambiar de cuadro**, a diferencia de Simpson —que lo necesita para ir de
  diástole a sístole—: una envolvente es de ESE cuadro del espectro.
- **Banda de plausibilidad 0,5–150 cm.** Fuera de ahí no hay VTI de tracto de salida posible: es
  un trazo mal hecho o una escala equivocada, y publicar el número sería peor que no medir.
- Los botones del panel van por `data-*` con listener atado a **su vista** (`_vBind`), nunca con el
  índice interpolado dentro de un `onclick`.

## ~~Botón 🫀 CC: no es un estilo, es un atajo de integración~~ (TC-217) — SUPERADA 2026-09-24

> **⚠️ SUPERADA. NO SEGUIR LAS INSTRUCCIONES DE ESTA ENTRADA.** Desde el 2026-09-24 el botón no
> integra nada: inserta un texto fijo. Todo lo que sigue describe maquinaria ELIMINADA —el Proxy
> `_ccFormComoEstudio`, `_ccAssertChks`, el contrato del `dispatchEvent('change')`, `.btn-purple`—
> y, lo que la vuelve peligrosa, **da una instrucción directa para reponerla**: «las dos columnas
> de siempre: `ccIntegrarSync` va en `RECALC_MODULOS` y al final de `limpiarCampos`». Esas dos
> líneas se sacaron a propósito. Ver la entrada del botón CC al principio del archivo.
> Lo que sigue valiendo: por qué el botón no lleva `estilo-pill` ni `data-estilo`, y por qué los
> predicados de pertenencia son los de `_CC_SECS` si alguna vez vuelve a leer datos.

### La premisa: «estilo CC» no encaja en el mecanismo, y las secciones ya bajan al informe

`estiloPick(c, e, n)` elige entre **tres redacciones de la misma frase**, en 21 sitios. No
reordena ni agrega secciones. Y las 12 fichas de CC **ya emiten** anatomía, hemodinámica y
conclusión cuando el médico integra cada sección. La «anatomía segmentaria» (situs, conexiones AV
y VA) la app **no la recoge** — un cuarto estilo que la prometiera estaría inventando datos.

Lo que falta no es un generador: es **tildar diecinueve casillas una por una**. Eso hace el botón.
Decisión de Maicol (2026-09-21).

### VA EN EL GRUPO DE ACCIONES, y el propio marcado explica por qué

El pedido decía «junto a Conciso/Estándar/Narrativo». El comentario que ya estaba ahí dice:
*«Mezcladas en la misma fila, "Frases" se leía como un cuarto estilo de informe»* — y por eso las
acciones se separaron con `margin-left:auto`. Poner el botón entre las pastillas repetiría el
defecto que ese comentario documenta haber corregido. TC-217 lo fija: el botón **no** lleva
`estilo-pill` ni `data-estilo`.

### ⚠️ `--purple` INVIERTE su contraste entre temas

Medido: blanco da **3,18:1** sobre `#9b7fe8` (tema oscuro, el de fábrica) y **5,32:1** sobre
`#7457c9` (claro); el casi-negro da 5,93 y 3,55. **Cablear un solo color de texto —como hace
`.btn-primary` con el blanco— deja el botón ilegible en uno de los dos temas.** Son dos reglas:
`.btn-purple` con `#0f1117` y `html.light-mode .btn-purple` con `#fff`. Es el blanco sobre
`--green` de la barra lateral del visor, otra vez. El caso mide en los dos temas **y exige que
difieran** — si dieran lo mismo estaría midiendo dos veces el mismo tema, que es la trampa de
TC-114. La mutación que vuelve al blanco fijo imprime `3.18 / 5.32`.

### Los predicados son los de `_CC_SECS`, y el formulario se lee con un Proxy

Esa lista ya define «este estudio tiene una CIA» para el Laboratorio y para el filtro de cohorte;
una segunda definición haría que el botón aparezca sobre un estudio que el Laboratorio no cuenta.
Como los predicados reciben un **estudio guardado** (`_labCampoRaw(inf, id)`) y acá hay que mirar
el **formulario**, se les pasa un `{campos}` que es un **Proxy leyendo del DOM** —replicando el
sufijo `__chk` de las casillas—. Una sola definición, dos fuentes.

**Las casillas NO siguen todas `<k>_incluir_chk`.** Tres excepciones reales: el ductus es
`ductus_incluir_chk`, la coartación `coart_incluir_chk`, y **CIA y CIV comparten una sola**
(`ete_shunt_incluir_chk`) porque son un bloque. `_ccAssertChks()` corre al arrancar: un id
inexistente no da error, da una sección que el botón dice integrar y que nunca se integra.

**Y la casilla compartida no puede contar doble.** La condición que lo fija **no es el conteo**:
sin el dedupe, la CIV encuentra la casilla ya tildada por la CIA y cae en «ya estaban», así que
el total sigue dando 3 y la mutación sobrevive —pasó—. Lo que delata la doble cuenta es que el
resumen mencione **«ya estaban» en la primera pasada**, sobre un estudio recién limpiado.

### El `change` es redundante HOY, y por eso está probado

Ninguna casilla tiene manejador propio: son `input` ocultos que mueve el botón «📎 Integrar» de
cada sección. Así que el `dispatchEvent('change')` no hace nada — y un resguardo que no se puede
hacer fallar **se lee como protección sin serlo**, que es por lo que se borró el «deshacer» de
`calcET`. Se conserva porque fija el contrato para la sección que mañana le cuelgue un manejador,
y el contrato **está probado**: el caso engancha un listener de prueba y exige que el botón lo
dispare. Sin esa condición la mutación sobrevivía.

**Las dos columnas de siempre**: `ccIntegrarSync` va en `RECALC_MODULOS` **y** al final de
`limpiarCampos` —que no pasa por ese embudo—, más el debounce de `input`/`change` que ya usaba
el botón de Indicaciones. Se comparte ese debounce en vez de agregar un segundo par de listeners
con `capture` sobre el documento.

## Medir desde el slot tras reabrir — y el arreglo «de una palabra» que NO alcanzaba (TC-216)

### La premisa del pedido estaba INVERTIDA

Pedía un cartel «📏 para medir usá la tira de abajo» **en los slots que tienen `_dcmId`**. Con
`_dcmId` resuelto, medir desde el slot **funciona** — `medFijaClic` → `_medFijaDe` lo exige. O sea
que ese gate mostraría el cartel justo cuando **no hace falta**, y en el caso que el pedido
describe —estudio reabierto— **no aparecería nunca**, porque `_dcmId` no viajaba al disco.

El cartel va gateado por lo **contrario**: slot con imagen, **con** `_dcmId`, y **sin** original en
`_medFijas`. La mutación que restaura el gate del pedido imprime el patrón `false,true,true,false`
sobre cuatro slots — el cartel apareciendo también en el que sí se puede medir.

### ⚠️ Y el arreglo «de una palabra» que este archivo anotaba ERA FALSO

La entrada de TC-188 decía: *«alcanza con sumar `_dcmId` a esa lista blanca — es una palabra»*.
**No alcanza**, y verificarlo costó diez minutos:

- **`_medFijas` es memoria pura** (`Object.create(null)`, poblado sólo por `_medFijaRegistrar` en
  la importación). No sobrevive ni a recargar la página.
- **`_cineRegistro` acuñaba su propio `id`** con `_uuidNuevo()`, **distinto** del `_dcmId` del
  slot. Así que aunque el `_dcmId` viajara, el registro de disco no se podía emparejar con él.

O sea que el slot volvía con **la llave y sin cerradura**. Hoy son tres piezas y hacen falta las
tres: `_dcmId` en la lista blanca de `CeiboImg.guardar`, `_cineRegistro(uuid, loop, poster,
idFijo)` para que el registro use **el mismo id**, y **`medFijasRestaurar(uuid)`** —contraparte de
`videoRestaurar`— que rehidrata `_medFijas` desde `ceibomed_cine`. Cada una tiene su mutación y
las tres ponen en rojo «SE PUEDE MEDIR DESDE EL SLOT».

**Al emparejar, por `id` y nunca por posición**: un estudio puede tener varias fijas y los slots
se reordenan arrastrando.

### Lo que queda sin poder medirse desde el slot, y por eso el cartel sigue

Dos casos, los dos reales: estudios guardados **antes** de este cambio, y los guardados con
«Guardar imágenes con los estudios» **apagado** —ahí `medFijaGuardar` corta en
`_cinePuedeGuardar()` y el original nunca se escribió—. Para ésos el rechazo genérico decía «esta
imagen no tiene datos de escala DICOM», que es **falso**: la escala existe, lo que se perdió es el
vínculo. El cartel dice dónde está la imagen en vez de mandar a buscar un problema que no hay.

**El cartel lleva `pointer-events:none`** —si no, tapa el clic del propio slot— y se llama con
`typeof _imgAvisoMedir === 'function'`: vive en el bloque del visor y se dibuja desde el de
imágenes, y este archivo ya se quedó sin JavaScript dos veces por un bloque que dejó de parsear.
Sin la guarda, un cartel se llevaría puesta **la grilla entera**.

## Backup por niveles, y el techo que lo impone el MOTOR (TC-215)

Tres niveles al exportar: **📄 Solo informes · 🖼️ Informes + imágenes · 💾 Backup completo**, con
el tamaño de cada uno calculado antes de elegir.

### La premisa del pedido: «informes + imágenes (igual que hoy)» — NO era igual que hoy

El backup de hasta ayer era `JSON.stringify(list)` y **nada más**. Las imágenes viven en
`ceibomed_img`, los cineloops en `ceibomed_cine` y los videos en `ceibomed_video`, y **ninguno
viajaba**. O sea que el nivel 1 del pedido ES lo de hoy, y el nivel 2 es **capacidad nueva**.

**Y la app lo PROMETÍA en seis superficies, cuatro visibles al médico**: el párrafo de Config bajo
el interruptor, el de la tab Imágenes, **el manual**, y —la peor— el `confirm()` de «borrar todas
las imágenes», que justificaba su «esto no se puede deshacer» en que **no había backup posible**.
Esa frase mandaba a borrar algo que a partir de ahora sí es recuperable. Las seis se actualizaron
en el mismo commit: es «el rótulo vive en cuatro superficies y el manual es la que se pudre» más
«un aviso que quedó describiendo el estado anterior es peor que no tenerlo».

### ⚠️ EL TECHO NO ES UNA PREFERENCIA: son 512 MiB, y los pone V8

Un JSON se arma y se lee **como UNA cadena**: `JSON.stringify` para escribirlo, `readAsText` +
`JSON.parse` para leerlo. **Medido en este Chrome: el máximo de una cadena es 536.870.888
caracteres** — `'a'.repeat(2**29)` tira «Invalid string length». Y base64 infla 4/3, así que el
tope real de medios son **~384 MB**.

El pedido decía «⚠️ Puede ser varios GB». Un archivo así **se escribiría y no se podría restaurar
nunca** — el peor modo de falla que puede tener un backup, porque se descubre el día que hace
falta. Decisión de Maicol (2026-09-21): **pasado el tope no se exporta**; se dice cuánto pesa,
cuál es el límite, y se manda a usar el filtro **por rango de fechas o por selección que este
mismo modal ya tenía**. `BK_TOPE_BYTES` deja margen (460 MB) bajo el límite del motor.

**Hay dos líneas de defensa y el caso prueba las dos**: el radio deshabilitado, y la guarda del
botón. Ejercer la segunda exige **saltear la primera** con un `dispatchEvent` — si no, el nivel se
queda en «informes» y exportar ESO es correcto. Así nació esa condición: **en rojo sobre código
sano**.

### El nivel «informes» emite el ARRAY PELADO, no un sobre

Los otros dos van en sobre (`{_ecosmart_backup:2, nivel, estudios, medios}`); «informes» sigue
siendo el array de siempre. Dos motivos: un archivo exportado hoy se abre con cualquier versión
anterior, y **«el backup actual sigue funcionando igual» se vuelve verificable BYTE POR BYTE** —
la condición compara contra `JSON.stringify(list, null, 2)`, que es literalmente el exportador
anterior. La mutación que lo mete en un sobre cae ahí.

### Lo que puede salir mal en la restauración, y no es obvio

**EL uuid PUEDE CAMBIAR AL IMPORTAR.** `importEjecutar` reasigna el uuid si es inválido o si ya
está en uso —pasa al importar dos veces el mismo backup en modo «todos»—, y los medios del sobre
están indexados por el uuid **del archivo**. Escribirlos bajo ése los dejaría colgados de una
ficha inexistente, y **el recolector de huérfanos los borraría en el arranque siguiente**: el
médico restaura 300 MB y al día siguiente no están. Hoy `importEjecutar` arma un mapa
`uuid del archivo → uuid final` en sus **dos** ramas y la restauración escribe por ahí. Un estudio
omitido por duplicado no está en el mapa, así que sus medios **no se escriben**.

**El `id` de un cineloop se conserva sólo si el uuid no cambió.** Con el uuid igual, reimportar el
mismo backup sobreescribe los mismos registros y es idempotente; con el uuid nuevo hay que acuñar
otro `id`, o el segundo import **pisa los cineloops del primero**.

**Los medios van DESPUÉS de guardar la lista de estudios.** Si esa escritura falla, no se escriben
cientos de MB bajo uuid de fichas que no existen.

**Y los medios NO entran en `campos`.** `validarInformeImportado` rechaza el informe **entero** ante
una clave desconocida, así que meterlos adentro haría irrecuperable todo backup con medios.

### Restaurar no alcanza si el interruptor está apagado

`imgRestaurar` corta antes de leer con «Guardar imágenes con los estudios» en off —el estado de
**fábrica**—, así que el médico restaura y **no ve nada**. Se dice y se **ofrece encenderlo**; la
app no cambia una preferencia de la máquina por su cuenta. Decisión de Maicol (2026-09-21).

### Detalles de implementación que no son adorno

- **La estimación se lee por uuid, no se escala desde `uso()`.** La exportación se filtra por
  rango, centro o selección: escalar el total por la fracción de estudios daría un número
  plausible y falso. Medido contra el archivo real, la estimación queda dentro del 15 %.
- **El archivo se arma por PARTES y se colapsa en Blobs cada 300.** Concatenar un string de
  cientos de MB choca con el mismo límite del motor que impone el tope.
- **Base64 en trozos de 32 KB**: `String.fromCharCode.apply` con 17 MB de golpe revienta la pila.
- **El progreso es un overlay, no un toast.** La exportación completa tarda lo que tarde leer
  cientos de MB de IndexedDB, y un toast que se va a los tres segundos deja al médico mirando una
  pantalla quieta sin saber si la app se colgó. Se cede el hilo con `setTimeout(0)` entre estudios.

**Seis mutaciones, las seis en su condición:** el nivel «informes» metido en un sobre, el nivel
«imágenes» llevándose los pesados, la restauración usando el uuid del archivo, el tope que no
frena, el aviso del interruptor, y el cineloop restaurado sin su tabla de offsets.

## La franja negra del PPT era la MATRIZ DE ROTACIÓN, y el video que «no persiste» (TC-213/214)

Dos reportes del mismo turno. Los dos se reprodujeron midiendo, y ninguno era lo que decía el título.

### 1 · PowerPoint NO APLICA LA MATRIZ DE ROTACIÓN

Reportado como «el video muestra contenido sólo en la mitad derecha; el póster no está centrado».
**No es el póster.** Medido sobre el clip real: el póster sale completo y bien orientado
(576×1024, cuartos de luminancia 90/121/126/95), y el PPT que el médico generó lleva el marco ya
en 1,95"×3,47" (relación 0,562), o sea **con el arreglo de aspecto puesto**.

Lo que pasa es que un clip grabado con el celular en vertical se codifica **APAISADO** —el `tkhd`
declara 1024×576— más una **matriz de rotación de 90°**. Chrome la aplica: `videoWidth/Height`
dan 576×1024 y `drawImage` dibuja la imagen derecha. **PowerPoint la ignora y dibuja los cuadros
crudos.** Verificado en PowerPoint con el archivo real: el video sale como una franja acostada
contra el borde derecho y el resto del marco queda negro.

**Ninguna geometría arregla eso.** Con el marco vertical sale la franja; con el marco apaisado
saldría proporcionado pero **girado 90°**, o sea un eco acostado. **El archivo hay que
NORMALIZARLO**: se re-codifica dibujando los cuadros ya rotados en un canvas, que es exactamente
lo que `_cineAMp4` hace con un cineloop. Medido sobre el clip del médico: `tkhd` pasa de 1024×576
a **576×1024**, deja de declarar rotación, 1,90 MB → 1,48 MB en 12,6 s.

**Verificado en PowerPoint, que es el único oráculo:** un MP4 vertical **sin** matriz de rotación
llena el marco entero, con la banda «ARRIBA» arriba y «ABAJO» abajo y **cero franjas negras**.

**Sólo se normaliza si el archivo declara rotación** —cuesta una generación de pérdida y el tiempo
del clip—. La decisión sale de comparar el `tkhd` con lo que entrega el elemento `<video>`:
`_videoTkhdWH` lee el box en los primeros y los últimos 256 KB, porque el `moov` puede estar en
cualquiera de los dos extremos, y exige que el box mida 92 o 104 bytes para no confundirse con
esos cuatro caracteres apareciendo dentro de los datos.

#### ⚠️ Y la primera implementación no funcionaba en segundo plano

Reproducía el `<video>` y copiaba cada cuadro con **`requestVideoFrameCallback`**, que **no
dispara en una pestaña oculta** — misma familia que el `requestAnimationFrame` que ya colgó
`labGenerarPDF`. Medido: 16,4 s esperando y un blob **vacío**. Hoy avanza por **seeks**, que no
dependen de que el navegador presente cuadros: anda con la pestaña de fondo y se puede verificar
en el harness. El clip conserva su duración —o sea su velocidad— y queda remuestreado a 25 fps
(+1,8 % de duración medido, por el remuestreo y la cola).

### 2 · El video «que no persiste»: el videoId SÍ viaja

Medido con el archivo real: en disco quedan el slot **con su `videoId`** (claves
`dataURL,ampliada,calidad,origen,videoId,videoNombre`) y el registro en `ceibomed_video` con sus
1.901.480 bytes; al reabrir por Guardados → Editar → «Cargar datos», el slot vuelve con el mismo
`videoId`, el blob se repuebla y el badge se dibuja. **La lista blanca y la restauración están
bien.**

**Lo que faltaba es el caso del TOGGLE APAGADO, que es el estado de FÁBRICA.** Ahí el video se
carga, se ve, se reproduce y se puede capturar — y al reabrir **desaparece sin una palabra**:
`imgPersistir` corta antes de escribir e `imgRestaurar` corta antes de leer. Medido: 0 slots y 0
videos en disco, y la reapertura ni siquiera intenta la lectura. El **cineloop ya avisaba esto
mismo** con `_cinePuedeGuardar()`, distinguiendo los dos motivos; el video del slot no. Es «el
interruptor mentía sobre el disco» otra vez.

**Y `videoPersistir` podía BORRAR.** `CeiboVideo.guardar` **reemplaza** todos los videos del
estudio, y los bytes viven en `_videoBlobs`, que es memoria de sesión repoblada por
`videoRestaurar` de forma **asíncrona y sin que nadie la espere**. Si se guarda con esa lectura
en vuelo —o si falló— la lista sale vacía y el video guardado se destruye. Hoy **falla cerrado**:
un slot con `videoId` cuyo blob no está en memoria **aborta la escritura entera**. Es la misma
regla que `imgPersistir` ya aplica con `_imgEditado`.

### Lo que costó, y son todas lecciones repetidas

- **Mi sonda no clickeaba el modal de `editarInforme`.** Daba «0 slots restaurados» y parecía el
  defecto reportado. `editarInforme` abre un modal con `#edit-ok`; sin apretarlo no carga nada.
  **Antes de creerle a una restauración que no restaura, confirmar que la carga ocurrió** — el
  campo `nombre` vacío lo gritaba.
- **La condición de la rotación SOBREVIVIÓ a su mutación.** Probaba `_videoTkhdWH` y la
  comparación **por su cuenta**, así que el generador ignorando la decisión pasaba en verde. Es
  «un caso que reimplementa la regla prueba su propia copia», **sexta vez**. Hoy el fixture se
  guarda con el `tkhd` **cruzado a mano** —MediaRecorder no produce la matriz, hay que fabricar
  el caso— y la condición mira **los bytes que embebe el generador**: con la mutación imprime
  `4564 vs 4564 guardados`.
- **TC-214 pasaba con `--solo` y fallaba en el suite.** `imgPersistir` **aborta mientras dura una
  reimpresión** —es deliberado— y TC-213 deja esa bandera en vuelo. El caso espera a que baje y
  **lo declara como condición**. Es el denominador otra vez.
- **Backticks dentro del cuerpo de un caso: van TREINTA**, seis en este turno, todos en
  comentarios recién escritos.
- **El archivo del paciente no entró al repo**: se copió al directorio servido, se usó y se borró.

## «El video no aparece en el PPT»: estaba, y eran el MARCO y el PÓSTER (2026-09-21)

Reportado como «el selector detecta el video (1 de 1, 1.8 MB) pero al generar el PPT el video no
aparece». **El video aparecía.** Verificado con el archivo real del médico, de punta a punta:

| | |
|---|---|
| `CeiboVideo.leer` | devuelve el registro con sus **1.901.480 bytes exactos** |
| `_blobADataURL` | 2.535.330 caracteres, `data:video/mp4;base64,AAAAGGZ0…` |
| la parte del `.pptx` | `ppt/media/media-3-1.mp4`, **byte por byte idéntica al original** |
| PowerPoint | abre **sin pedir reparación**, muestra «Formato de vídeo» / «Reproducir», y **el video se reproduce** |

**Lo que el médico veía era un rectángulo, y por dos defectos que se sumaban:**

### 1 · La relación de aspecto estaba CABLEADA en 4:3

`_pptAgregarVideos` usaba `cols/filas` para el cineloop y **4:3 fijo para los MP4**. El primer clip
real que entró es **vertical**: `videoWidth/videoHeight` = **576×1024, relación 0,563**. O sea que
el marco salía **2,4 veces más ancho** de lo que le corresponde, y PowerPoint dibuja el póster
**estirado** dentro del rectángulo que se le da.

⚠️ **El `tkhd` del archivo declara 1024×576 y una matriz de rotación**: leer el encabezado da la
relación **INVERTIDA**. Lo único que sirve es `videoWidth`/`videoHeight` del elemento `<video>`,
que vienen **ya rotados** — y `_videoPoster` **ya los devolvía**: los tiré al armar la lista. El
4:3 queda sólo como último recurso.

### 2 · El póster era NEGRO ENTERO, y eso es lo normal en un eco

Medido sobre ese clip: a 0,05 s la **luminancia media es 1** y el **100 % de los píxeles** está por
debajo de 25. No es una rareza — un cineloop de ecocardiografía arranca antes de que entre la
imagen. Y PowerPoint **dibuja el póster** y no pone ningún adorno encima hasta que se selecciona el
objeto: **la diapositiva se ve como un rectángulo negro vacío**, y el médico concluye que el video
no se incluyó.

`_videoPoster` prueba ahora cuatro instantes y gana el primero con contenido; si todos salen negros
devuelve el primero igual —el video entra, aunque su portada sea negra—. Medido sobre el mismo
archivo: **luminancia 1 → 108**, píxeles casi negros **100 % → 1 %**, en 211 ms.

**⚠️ Los instantes van en SEGUNDOS ABSOLUTOS, no como fracción de la duración**, y esto lo
descubrió el caso: **un blob de `MediaRecorder` declara `duration = Infinity`** hasta que se lo
busca hasta el final, así que con fracciones el bucle **no avanzaba nunca** y el póster salía negro
igual. Con absolutos anda sin saber cuánto dura — y además el patrón real es una ventana de
arranque, no una proporción.

**Se escucha `seeked` y no `loadeddata`:** aquél dispara una vez y acá hay que capturar después de
cada salto.

### 3 · Y la hoja no decía que había que clickear

Se agregó **«▶ Clic sobre la imagen para reproducir · el video no arranca solo»** debajo del marco.
Lo segundo es una limitación real: **PptxGenJS 3.12 no expone autoplay**, así que en la
presentación el clip queda quieto hasta que alguien lo toca. Callarlo es lo que hace que un
rectángulo con el primer cuadro se lea como un error de la app.

### Lo que este episodio enseña sobre el caso de prueba

**TC-213 pasaba y el defecto estaba ahí, porque el fixture lo escondía por partida doble**: era
**apaisado** —así que el 4:3 cableado no se notaba— y **luminoso desde el primer cuadro** —así que
el póster negro no podía aparecer—. Hoy el fixture es **vertical y arranca en negro**, que es lo
que midió el archivo real. *Un fixture cómodo no prueba el caso incómodo.*

**Y TC-213 nunca ejerció `generarPPT`**, que es el único llamador de producción: ponía `_pptImgSel`
a mano. Eso no era lo que fallaba —la sonda que sí lo ejerció pasó— pero es el hueco que habría
dejado pasar un defecto en la cadena de los tres modales.

**Cuatro mutaciones nuevas, las cuatro en su condición:** la relación de vuelta a 4:3 (el
diagnóstico imprime `4.63x3.47` contra un video de `0.563`), el póster quedándose con el primer
cuadro, las dimensiones sin viajar, y la hoja sin la línea de aviso.

### Cómo se diagnosticó, que es lo que conviene repetir

**No se adivinó: se corrió el archivo del médico por el camino real.** Estaba en `~/Downloads` —lo
encontró un `find`— y se pasó por `videoCargarEnSlot` → `guardarInforme` → `CeiboVideo` →
`_pptVideosDeEstudio` → `_pptAgregarVideos` → `.pptx`, midiendo cada paso. Todo daba bien, y eso es
lo que apuntó al **renderizado** en vez de al camino de datos. Después se abrió en PowerPoint —que
es el único oráculo— y ahí se vio el marco apaisado con el contenido corrido.

**El archivo del paciente NO entró al repo**: se copió al directorio servido, se usó y se borró en
la misma sesión. Lo único versionado es el fixture sintético.

## Videos en el PPT: el MP4 se embebe, el cineloop hay que CODIFICARLO (TC-213)

Sección «🎬 Videos del estudio» en el selector del PPT, y una diapositiva por video.

### La premisa del pedido tenía un paso de menos, y ése era todo el problema

«El cineloop se convierte a secuencia de frames JPEG y se embebe como video» — **una secuencia de
JPEG no es un video**. PowerPoint no reproduce una secuencia de imágenes: hay que **codificarla**,
y la única vía sin agregar una dependencia al archivo es `MediaRecorder` sobre un canvas.

**TIENE QUE SER MP4/H.264. PowerPoint no reproduce WebM**, así que si el navegador no ofrece
`video/mp4` no hay respaldo: se declara en el panel —antes de que el médico lo tilde— y el
cineloop no va. Bajar a WebM produciría un `.pptx` que abre perfecto y con una diapositiva donde
el video no arranca: el modo de falla que se descubre proyectando.

Medido: Chrome 148 soporta `video/mp4;codecs=avc1.42E01E`. **Safari no se verificó** —el navegador
está concedido a nivel «lectura»—, y ahí `MediaRecorder` tiene su propia historia.

**Y la grabación es EN TIEMPO REAL**: un loop de 172 cuadros a 56/s tarda sus 3 segundos de reloj.
No se puede optimizar; es cómo funciona `MediaRecorder`. El panel lo dice y hay un toast por
cineloop con la duración.

### El póster de un video salía como foto muda en la grilla — defecto PREEXISTENTE

El slot de un video lleva su primer cuadro como `dataURL`, y `_pptImgsDeEstudio` sólo filtraba por
`_imgSrcOK`: **el PPT venía incluyendo ese cuadro como una imagen fija más**, mientras el PDF lo
excluye desde el día que se agregaron los videos. Con la sección nueva el mismo video habría
salido **dos veces**, como foto y como video.

Hoy el filtro es **uno solo** —`_pptEsImagen`, con `!s.videoId`— y lo comparten el selector y el
generador. Que sea uno solo no es prolijidad: `_pptImgSel.sel` son POSICIONES sobre esa lista, así
que dos criterios hacen que el médico tilde la imagen 3 y al PPT vaya otra. Es la trampa que este
archivo ya documenta para el selector de imágenes, por la puerta de al lado.

**El denominador del aviso de descarte también tuvo que excluirlos**, o el médico leía «1 de 4
imágenes no se pudieron incluir por formato» sobre un mazo completo.

### La velocidad sale del archivo, y los videos arrancan SIN TILDAR

- `_cinePptMs` lee `ms` del registro —el `FrameTime` del DICOM— y el clip **repite el loop entero**
  hasta pasar `CINE_PPT_MIN_S` (3 s). Repetir **no cambia la velocidad**, que es lo que el pedido
  fija, y evita el clip de medio segundo que parpadea y se acabó. La espera del bucle va contra el
  reloj **absoluto**: con `setTimeout(ms)` a secas, los ~2 ms de decodificar alargan el clip y el
  eco se ve más lento que en el visor — justo lo que `_cineFps` vino a evitar.
- **Ninguno tildado por defecto.** Un video pesa entre cien y mil veces más que una imagen, así que
  el default tiene que ser la decisión barata. Por lo mismo «Todas las imágenes» **no** toca los
  videos, y el rótulo lo dice.

### El aviso de tamaño es una ESTIMACIÓN, y se puede estimar porque fijamos el bitrate

El tamaño real de un cineloop sólo se conoce después de codificar, y codificar tarda lo que dura el
clip. Como `CINE_PPT_BPS` lo fija la app, `duración × bitrate / 8` es una estimación defendible —
se rotula «≈» y el peso se muestra **siempre** que haya un video elegido, no sólo al cruzar el
umbral: el `confirm` llega al apretar «Generar», y para entonces la decisión ya está tomada.

`PPT_VIDEO_AVISO_MB` es constante propia y no `VIDEO_AVISO_MB`: aquél es por ARCHIVO al cargarlo en
un slot, éste es el TOTAL de video que entra al `.pptx`.

Ojo con la estimación: medido sobre un cineloop sintético de 120×90, estimaba 1,0 MB y el real dio
**99 KB**. Sobreestima, que es el lado correcto para un aviso.

### Detalles de PptxGenJS 3.12 verificados, no supuestos

- **`addMedia({type:'video', data:'data:video/mp4;base64,…'})` funciona**: escribe
  `ppt/media/media-N-M.mp4` y `[Content_Types].xml` **ya declara `mp4` por omisión**.
- **No interfiere con `_pptxDescargarSaneado`**: ese saneador poda `<Override>`, y el mp4 entra
  como `<Default>`. Verificado sobre un paquete real con un MP4 de 43.182 bytes: la poda quita los
  2 `Override` fantasma de slideMaster y el video sale **byte por byte igual**.
- **El `cover` se convierte a PNG.** La librería lo escribe SIEMPRE como `preencoded.png` con
  `ContentType="image/png"`: pasarle el JPEG del póster mete bytes JPEG en un archivo `.png`. Sin
  `cover` pone su botón de play gris de 55 KB, que en una presentación clínica no dice nada.
- **Un `.mov` va con `extn:'mov'` y con la salvedad impresa.** MOV y MP4 son los dos ISO-BMFF, pero
  PowerPoint decide por la extensión de la parte embebida: escribirlo como `.mp4` sería mentirle
  sobre el contenedor. Que Windows lo reproduzca **no está verificado** y el aviso lo dice.

### ⚠️ VERIFICACIÓN QUE NO SE PUDO HACER: PowerPoint

Este archivo dice que **PowerPoint es el único oráculo** que decide si un `.pptx` abre sin pedir
reparación, y que está instalado en esta máquina. **No se pudo usar**: la captura de pantalla falló
en toda la sesión (`SCContentFilter`), PowerPoint dejó de responder a Apple Events —señal de un
diálogo modal invisible— y no hay forma de leer qué decía. Lo verificado es **estructural**: el
paquete descomprimido, los `Content_Types`, los rels y los bytes del MP4 intactos tras el saneo.
**Abrirlo en PowerPoint queda pendiente** y es lo primero a hacer cuando la captura vuelva.

### Y una trampa del entorno que costó media hora

**`P.write()` NO RESUELVE NUNCA en la pestaña del preview headless.** Medido sobre un mazo
vainilla de la propia librería, sin una línea de esta app y **sin `addMedia`**: un deck de sólo
texto también se cuelga. Es el estrangulamiento de timers de una página oculta —la misma familia
que el `requestAnimationFrame` que colgaba `labGenerarPDF`—, y JSZip trocea con `setTimeout`.
Parece un defecto del cambio que uno acaba de hacer. **Para verificar un `.pptx` hay que usar el
harness (`scripts/test_clinico.mjs`), que maneja un Chrome de verdad**, no el preview.

### Dos defectos del propio caso, los dos de denominador

- **`lista[lista.length - 1]` no es «el estudio que acabo de guardar».** El borrado del caso
  anterior es una escritura **asincrona**, así que en el suite completo la última posición puede
  seguir siendo la suya: TC-213 generaba el mazo del paciente de TC-210 y la condición del título
  daba rojo **sobre código sano**. Se resuelve por el `estudioId` que devuelve `__t.guardar()`, con
  una condición propia que lo afirma. Con `--solo` pasaba; sólo el suite completo lo mostró.
- **La mitad de «la selección no se hereda» era vacua**: el caso ponía `_pptImgSel` en null y
  después comprobaba que estuviera en null. Es la lección de TC-210 repetida. Hoy la segunda
  corrida **no toca la variable** y con la mutación salen 2 diapositivas de video heredadas.

**Seis mutaciones, las seis en rojo y cada una en su condición:** el cineloop embebido como el JPEG
guardado (el diagnóstico imprime `JF / 832 bytes` en vez de `ftyp`), los videos tildados por
defecto, el póster de vuelta en la grilla, el aviso de tamaño sin disparar, la selección heredada, y
la velocidad cableada a 25 cuadros/s.

**TC-210 se puso en rojo y era la señal**: `_pptElegirImagenes` pasó a tres argumentos y el caso le
pasaba el callback donde van los videos. Reapuntado a la firma nueva con `[]`, que además fija que
el camino sin videos sigue comportándose igual.

## Video MP4 en los slots — sólo documentación (TC-212)

Videos del celular u otra fuente. Base **aparte** (`ceibomed_video`, `CeiboVideo`), como
`CeiboCine` y por el motivo que `CeiboImg` ya documenta: agregar un store a `ceibomed_img`
exige subir `DB_VER`, y con **dos pestañas abiertas** el upgrade se bloquea y la tienda de
IMÁGENES cae a modo respaldo.

### EL VIDEO NO SALE EN EL PDF, y eso sostiene todo lo demás

El slot lleva el **primer cuadro** como miniatura. Sin el filtro `!s.videoId`, el informe
**firmado** saldría con un cuadro que el médico **no eligió** —el primero del archivo— y el
botón «capturar frame» no tendría sentido. Lo que sale es el cuadro que captura a mano, que
ocupa **otro** slot como imagen normal (no reemplaza al video: se pueden querer varios).

`videoId` viaja en la lista blanca de `CeiboImg.guardar` **y** en la repoblación de
`imgRestaurar`. Sin cualquiera de las dos el slot vuelve como **foto**: se imprime en el PDF y
el reproductor desaparece.

### Sin mediciones: no hacía falta compuerta, hacía falta el MOTIVO

`medFijaClic` exige `slot._dcmId`, que un video no tiene, así que ya caía en el rechazo. Lo que
se agregó es el mensaje correcto: el genérico habla de «una foto o una captura de pantalla»,
que sobre un video suena a que le falta un dato y no a que **el método no aplica**. Escribir una
compuerta nueva habría sido un resguardo que no se puede hacer fallar.

### Lo que costó, y es la cuarta vez

**LA MUTACIÓN QUE DEVUELVE EL VIDEO AL PDF SOBREVIVIÓ.** Mi condición hacía el filtro de
`imgSlots` **dentro del caso** — o sea una COPIA de la regla que venía a probar. Es «un caso que
reimplementa la regla prueba su propia copia», cuarta vez en esta sesión.

Al corregirlo apareció lo siguiente: **`generarPDFReal` no se deja manejar desde el harness**
—devuelve temprano y dibuja cero imágenes, incluso con nombre e informe cargados— así que no hay
forma de ejercer ese camino de punta a punta. Se resolvió con **verificación sobre el FUENTE**,
que es el recurso que TC-98 ya usa para `TEER_CRIT` por el mismo motivo, y **declarado como
tal**: la condición lee la línea del filtro y exige `!s.videoId`, más que sea el **único** filtro
de slots hacia el PDF —si aparece un segundo, este caso dejaría de cubrirlo y hay que
enterarse—. Queda anotado que el camino completo **no** está ejercido.

**Backticks dentro del cuerpo de un caso: van VEINTISÉIS**, tres en este turno, las tres en
comentarios recién escritos — uno de ellos explicando justamente esta trampa.

### Detalles que no son obvios

- **Detección por `ftyp` en los bytes 4-7** (MP4 y MOV son ISO-BMFF). El MIME entra como
  segunda vía pero **no alcanza solo**: `file.type` sale de la extensión en varios navegadores,
  que es lo que el pedido pide no usar.
- **El póster necesita un `seek`**: sin `currentTime = 0.05`, Chrome y Safari entregan
  `loadeddata` con el cuadro en negro.
- **Si el navegador no puede decodificar el video, se rechaza el archivo** en vez de dejar un
  slot con un hueco: un `ftyp` válido puede ser un códec que este navegador no trae.
- **Los blobs viven en `_videoBlobs`, no dentro del slot**: `CeiboImg.guardar` serializa el slot
  y ahí entrarían 50 MB de video en la tienda de imágenes.
- **El aviso obligatorio va como `alert` una vez por sesión** y como toast después. Es una
  limitación del MÉTODO —no se puede medir— así que tiene que interrumpir la primera vez.
- **El caso graba su propio video con `MediaRecorder`** desde un canvas: sin binarios en el repo
  y sin PHI.

## Barra de memoria: umbrales, contadores y avisos (TC-211)

Cuatro tramos (🟢 <60 · 🟡 60-79 · 🟠 80-89 · 🔴 ≥90), contadores debajo y aviso con botón de
exportar. **El corte anterior era uno solo, en 85 %, y se reemplaza**: con dos escalas sobre el
mismo porcentaje, la barra se pone roja en un umbral y el aviso habla de otro — el defecto de
«tres agendas» que este archivo ya pagó.

**EL COLOR Y EL TEXTO SALEN DEL MISMO `_IG_TRAMOS`**, y la condición que lo fija cruza los dos
en los **bordes exactos** (59/60, 79/80, 89/90). Una condición que sólo mirara que hay cuatro
colores pasa con la tabla del aviso desalineada.

### El aviso: el toast va una vez, el BLOQUE se queda

`sessionStorage` y no `localStorage`: el pedido dice «no repetir en cada recarga», no «no
repetir nunca» — con `localStorage`, cruzar el 90 % una vez silenciaría el aviso **para
siempre**, que es justo cuando hay que verlo. Y cruzar el umbral **siguiente** vuelve a avisar.

**El bloque con el botón de exportar se muestra SIEMPRE por encima del 60 %.** Esconderlo
porque ya se mostró una vez se lleva puesto el botón justo cuando hace falta. Lo que va una vez
por sesión es el toast, que es la parte que interrumpe. La mutación que esconde el bloque cae
por dos condiciones.

⚠️ **`sessionStorage` no es «cerrar el navegador»**: se copia al duplicar la pestaña y lo repone
la restauración de sesión, así que el aviso puede saltearse alguna vez. Aceptable para un
recordatorio; **no lo sería para una compuerta**.

### Los contadores

- **`CeiboImg.uso()` no devolvía el conteo de imágenes**, sólo de ESTUDIOS con imágenes. Se
  agregó `imgs` —aditivo, los consumidores existentes leen `estudios` y `bytes`—. La mutación
  que muestra `estudios` bajo el rótulo «imágenes» cae.
- **Las lecturas fallan a cero POR SEPARADO.** Con un `Promise.all` pelado, que IndexedDB no
  responda para los cineloops borraría también el conteo de imágenes y la barra diría
  «0 imágenes» sobre un disco lleno.
- **Sin cuota informada no se inventa denominador**: se dice que el navegador no la informa, en
  vez de imprimir «de 0.0 MB disponibles». Es la misma regla que ya tenía la barra.

### La barra mide ALMACENAMIENTO, no contenido clínico

Muestra **imágenes, cineloops y espacio usado**. Acá vivió un contador de «estudios con strain
manual» y **se sacó el mismo día** (decisión de Maicol): el strain tiene su propia sección en el
Laboratorio, que es donde se lo va a buscar, y un dato clínico en una barra de disco invita a
agregarle el siguiente.

Lo que se ganó además de la claridad: la barra **dejó de leer `getInformes()`** y de depender de
`_labStrainDeEstudio`, o sea de que el bloque del Laboratorio parsee. Un contador de
almacenamiento no tiene por qué caerse con el módulo de estadística — este archivo ya documenta
dos veces que un bloque dejó de parsear y se llevó puesto todo lo que colgaba de él. **Si vuelve
la tentación de poner un conteo clínico acá, ése es el motivo para no hacerlo**, y TC-211 lo fija
por AUSENCIA: la mutación que devuelve el contador lo pone en rojo.

### Lo que NO cambió, a propósito

**Con el guardado de imágenes APAGADO la barra sigue vaciándose.** Es el comportamiento que ya
tenía —afirmaría un consumo sobre una función que la app no está usando— y el toggle viene
apagado de fábrica, así que en una instalación limpia no se ve nada. Con el contador de strain
afuera esto dejó de importar: lo que la barra muestra ahora **sólo existe si el guardado está
encendido**.

**El botón abre `igIOToggle('exp')`, el desplegable de exportar que ya vive en esa cabecera.**
No se escribió un exportador nuevo: con dos, el backup de un botón y el del otro pueden
divergir.

### Una mutación que era un no-op

La primera versión de M2 fue `if (x) { } else if (!x) {`, que es **lo mismo** que `if (!x)`.
Dio verde y por un momento pareció un superviviente. **Antes de creerle a una mutación que
sobrevive, leerla como código**: si es equivalente al original, no probó nada.

## Selector de imágenes del PPT — y una premisa que verifiqué MAL (2026-09-20)

### Lo primero: mi propia verificación estaba equivocada

Reporté que «el PPT individual no lleva ninguna imagen del estudio» porque `imgSlots` tiene
**cero** apariciones en `_pptDesdeFormulario`. Es cierto y **no significa eso**: las
diapositivas de imágenes existen desde antes —`_pptAgregarImagenes`, en grilla de hasta SEIS—
y leen de **IndexedDB** por `_pptLeerImgs`, no del array en memoria. La premisa del pedido era
correcta y la desmentí.

**Un grep que no encuentra el nombre que uno esperaba NO prueba la ausencia de la
funcionalidad.** Hay que buscar el EFECTO —acá, `addImage` con `sizing`— y no la variable que
uno supone que la alimenta. Es el mismo error que este archivo documenta con «grepear
declaraciones no encuentra lo que se exporta desde un IIFE», por la otra punta.

### Dónde estaba el riesgo real: dos listas con índices distintos

El panel corre **antes** de `pdfDeInformeGuardado`, y en ese momento `imgSlots` tiene las
imágenes del estudio **ABIERTO**, que puede no ser el que se exporta —`generarPPT(id)` se
dispara desde la lista de Guardados, sobre cualquier estudio—. Por eso el selector lee por
`CeiboImg.leer(inf.uuid)` con el **mismo filtro `_imgSrcOK`** que usa el generador: misma
fuente, mismo filtro, mismos índices.

Con dos criterios, el médico tilda la imagen 3 y al PPT va otra — **y nada lo delata**, porque
las dos son imágenes válidas del mismo estudio. Es el modo de falla más caro de esta tarea y no
lo habría mostrado ninguna prueba que sólo contara diapositivas.

### `origen` y por qué entra a la lista blanca de persistencia

Las capturas del visor —mediciones, bull's eye, cuadro de cineloop— entran por
`imgCompressLoad`, **la misma puerta que una foto**, y el slot no guardaba procedencia: eran
indistinguibles. Las tres capturas (`cineCapturar`, `medStrainCapturar`,
`medCapturarConMedicion`) pasan ahora `'visor'`.

**Y `origen` entra a la lista blanca de `CeiboImg.guardar`.** Sin eso la marca muere al guardar,
y reabrir un estudio para exportarlo **es el flujo normal**: el selector vería cero capturas del
visor en todo estudio que no se acabara de medir. Son ~16 bytes por imagen. La mutación que lo
devuelve a `'estudio'` cae por dos condiciones.

### Lo demás

- **Sin `_pptImgSel` el mazo sale como siempre** —todas, de a seis—, que es el camino de
  cualquier otro llamador de `_pptDesdeFormulario` y lo que hace verificable «el PPT existente
  sigue funcionando igual».
- **`_pptGrilla` ya daba las grillas de 1/2/3/4** (`[1,1]`, `[2,1]`, `[3,1]`, `[2,2]`): el
  layout sólo cambia el tamaño del bloque, no hubo que escribir geometría nueva.
- **Deseleccionar todas genera el mazo sin esa diapositiva**, que es el punto 5 del pedido.
- **El dataURL no se interpola nunca en HTML**: va por `.src`, y el panel se arma con
  `createElement`/`textContent`.

### La mutación que sobrevivió, y por qué

«No limpiar `_pptImgSel` al terminar» pasaba en verde: mi condición leía que la variable fuera
null **después de que el propio caso la pusiera en null**. El invariante real es que **el PPT
siguiente no herede la selección del anterior**, y se prueba dejando que lo limpie el generador
y generando otra vez sin tocar nada. Es «si el valor lo pusiste vos, no probaste nada» aplicado
a una variable de módulo.

**Backtick dentro del cuerpo de un caso: van VEINTITRÉS**, otra vez en el comentario que
acababa de escribir para explicar la trampa de arriba.

## Strain manual en el Laboratorio: el signo, y lo que NO entra a la estadística (TC-209)

Tarjeta «💚 Strain Manual» al final de la subtab **Mediciones**, debajo de Estadística
descriptiva. Lee `campos['strain_manual']` —lo que persiste `_strainResumen`— y **no recalcula
nada**: con una segunda implementación, el Laboratorio publicaría números distintos de los que
el médico vio en el visor.

### EL SIGNO, que es lo único que puede arruinar el Bland-Altman en silencio

`sgl` **acepta las dos convenciones**: no tiene `min` ni `max`, y el resto del Laboratorio lo
consume con `Math.abs` (`_labSglResumen`). El manual sale **siempre negativo** de
`_strainCalcular`. Restarlos crudos da, sobre un −19 manual contra un 18 automático tipeado en
positivo, una diferencia de **−37** — que se lee como una discrepancia enorme entre métodos y es
un artefacto de tipeo.

- **El automático se normaliza a negativo en el borde** (`-Math.abs`).
- **El manual se deja como se midió.** Ahí el signo **es información**: un manual positivo
  significa que las fases se confirmaron al revés, y taparlo con `Math.abs` escondería el único
  error que ese número delata solo. Es la misma razón por la que `_strainCalcular` no fuerza el
  signo.

La cohorte de TC-209 tiene el automático sembrado **alternando los dos signos**, a propósito.
Sin normalizar, el sesgo se va de ~0 a ~−20 pp. Y la condición que separa las dos decisiones es
**«un manual invertido sigue positivo»**: mirar la tabla no alcanza —`-26.4` **contiene**
`26.4`, así que buscar el texto pasa con el signo dado vuelta— y hay que mirar el dato. La
mutación que normaliza también el manual sobrevivió a la primera versión del caso por eso.

### Los implausibles se listan y NO votan

Un manual invertido o fuera de (−45 %, 0 %) corre el sesgo y ensancha los límites de acuerdo
hasta volverlos inútiles. Van **a la tabla marcados con ⚠** —el médico tiene que verlos— y
**fuera** de la estadística, del Bland-Altman y de la hoja 2 del Excel. Se declara cuántos
quedaron afuera, en pantalla y en la hoja de Estadísticas.

### Decisiones que no estaban en el pedido

- **Dos vistas abiertas (A y B) son dos strains.** Se toma la que sostiene **más vistas
  apicales**; con empate, la A. Promediarlas mezclaría dos mediciones independientes bajo un
  solo número.
- **`data-ppt-no` con el motivo.** `_labPptAssertClaves()` exige uno de los dos atributos en
  toda `.lab-card`; una tarjeta sin ninguno **no da error**, da una casilla que el médico tilda
  y no produce nada. Ésta es una tabla de investigación con su propio exportador, no una
  diapositiva — el mismo caso que los dos exportadores de la subtab Informe.
- **El clic abre `verDetalleInforme`, no `editarInforme`.** Aquél carga el estudio EN EL
  FORMULARIO y pisaría lo que el médico tenga cargado; desde una tabla de investigación se
  quiere mirar, no editar.
- **El export pasa por `_labPreguntarAnonimo`**, como los demás: es el único camino por el que
  los datos salen de la máquina.
- **DE muestral (n−1), y `null` con n < 2.** Un cero se lee como «no hay dispersión», que es una
  afirmación sobre una muestra de uno.

### Lo que costó

**SEMGREP SUBIÓ DE 126 A 131 Y LOS CINCO ERAN MÍOS**, todos `ceibo-xss-innerhtml-concat`
—`innerHTML = a + b`—. Se arma la cadena y se asigna una vez: de vuelta en 126. Es lo mismo que
ya se hizo con `popConclSync` y con el render del Forrester.

**Y el primer diff de Semgrep dio «HEAD 0», que es el denominador roto que este archivo ya
documenta:** sin `--max-target-bytes 20000000` el escáner saltea el archivo en silencio y
devuelve cero hallazgos, que se lee igual que «no había nada». La invocación correcta hay que
copiarla de `scan.py`, no reconstruirla.

**TC-153 se puso en rojo y tenía razón a medias.** Pinaba que las tarjetas exceptuadas fueran
**exactamente dos** y vivieran en la subtab Informe — el inventario del día que se escribió, no
el invariante. Con una tarjeta nueva que legítimamente no es una diapositiva, daba rojo sobre un
registro sano. Es el literal 53 otra vez. Reapuntado a «toda exceptuada declara su motivo» y
«ninguna reclama diapositiva»; lo que de verdad importa —que ninguna sea muda— ya lo fijaba otra
condición.

**`labSubTab(id, el)` necesita el elemento**: llamarla con un solo argumento revienta con
`null.classList`. En los casos, **clickear el botón real** — además prueba el camino del médico
y no sólo la función.

## La diana de 17 segmentos del visor, y la A3C que trazaba al revés (2026-09-20)

### Tarea 1 — de las tres vistas, sólo la A3C estaba invertida

A4C (inferoseptal → anterolateral) y A2C (inferior → anterior) **ya estaban en el orden
pedido**. La **A3C** trazaba del **inferolateral** al **anteroseptal**, o sea al revés: el
médico marcaba primero el anillo que el panel llamaba inferolateral, y el arco A —el primero—
se publicaba con ese rótulo.

`orden` y `paredes` se mueven **juntos**. Invertir el rótulo sin invertir el trazado deja las
dos paredes intercambiadas, que es el defecto que este archivo cerró el mismo día.

### Tarea 2 — LOS NÚMEROS DEL PEDIDO ESTABAN CRUZADOS, y la referencia vive en el archivo

El pedido traía Inferoseptal 2/8/14 y Anteroseptal 3/9/17. **`EE_SEGS` —la lista de 17
segmentos que ya usa el bull's eye del INFORME— dice lo contrario**: 2 «Anteroseptal basal»,
3 «Inferoseptal basal», 8/9 ídem en el medio, 5/11 inferolateral y 6/12 anterolateral.
Anterior e inferior sí coincidían.

Aplicado tal cual, el mismo PDF podía llevar **dos dianas de 17 segmentos donde el segmento 2
se llama anteroseptal en una y se pinta como inferoseptal en la otra**. Decisión de Maicol:
manda `EE_SEGS`, que además es la asignación con la que ya coincidía la corrección de
vistas→paredes del mismo día.

**Antes de implementar un mapeo anatómico, buscar si el archivo ya tiene uno.** Acá estaba a
37.000 líneas de distancia y es el que firma el informe.

### Los tres segmentos que no son de una sola pared

| segmento | quién lo comparte | qué se hace |
|---|---|---|
| **14** septal apical | anteroseptal + inferoseptal | promedio, **y sólo con las dos** |
| **16** lateral apical | anterolateral + inferolateral | promedio, **y sólo con las dos** |
| **17** ápex | ninguna | **gris siempre** — este método no lo mide |

Pintarlos con una sola pared sería la herencia de «pared ancha» que este mismo diagrama sacó
horas antes, por la puerta de al lado. La condición que lo fija es que el color del 14 **no
coincida con ninguna** de las dos paredes que lo forman: si coincidiera, estaría heredando en
vez de promediando.

**El SGL salió del centro.** Ese círculo ES el segmento 17, y escribir el SGL encima lo hacía
leer como el valor medido del ápex — un número sobre el único segmento que el método declara no
medir. Bajó debajo de la diana.

### Cuánto se pinta, que es el invariante que vale

| | segmentos pintados |
|---|---|
| 1 vista (A4C) | **4** — 3, 6, 9, 12 |
| 2 vistas (+A2C) | **10** — suma 1, 4, 7, 10, 13, 15 |
| 3 vistas | **16** — sólo el 17 queda gris |

Las condiciones comparan la **lista de segmentos**, no un conteo: con un conteo, la mutación
que cruza los septales pasa en verde porque sigue pintando cuatro.

### Lo que costó

**LA DIANA SE SALÍA DEL CANVAS.** Al pasar de 6 sextantes a 17 segmentos hay dos líneas más
abajo (SGL y ápex), y en la captura otras dos del descargo. Con el radio anterior la leyenda
caía **fuera** — y un canvas **no avisa**: recorta en silencio, así que el descargo habría
desaparecido del PNG que va al PDF y la imagen se vería perfectamente bien. Se midió buscando
la última fila con algo dibujado: hoy quedan ~10 px de margen en los dos tamaños (300 y 640).

**El muestreo va al 22 % del sector, no a su centro.** El rótulo y el número de cada territorio
van centrados en su segmento del anillo medio, así que muestrear el centro devuelve el color de
una letra. Ya había pasado con los sextantes y lo volví a hacer.

**«UNA vez por territorio» se cuenta interceptando `fillText`**, no leyendo el canvas: un número
son píxeles. Y el filtro tuvo que acotarse a los valores **con decimal** — los rótulos de la
leyenda («0 %», «−30 %») también llevan `%` y hacían contar 4 sobre un dibujo con 2 territorios.

**TC-203 volvió a ponerse en rojo por pinar un literal**, esta vez `INFEROLATERAL` en la A3C.
Se reapuntó a derivar de `_STR_VISTAS`, igual que TC-208. Un caso que fija texto hay que
tocarlo cada vez que el texto cambia a propósito; uno que fija el invariante, no.

## Territorios del strain: la A4C es INFEROSEPTAL + ANTEROLATERAL (2026-09-20)

Corrección de Maicol. Reemplaza lo que decía la entrada anterior sobre la «pared ancha»: ese
párrafo describía el modelo viejo y **ya no aplica**.

| vista | territorios |
|---|---|
| **A4C** | Inferoseptal + Anterolateral |
| **A2C** | Anterior + Inferior |
| **A3C** | Anteroseptal + Inferolateral |

A2C y A3C ya nombraban esos pares. Lo que cambió es la **A4C**, que declaraba «Septal» y
«Lateral» — paredes ANCHAS que se hacían cargo de **dos sextantes cada una**.

### El cambio es hacia mostrar MENOS, y ése es el punto

`_STR_FUENTE` pasa a ser **1:1**: cada vista aporta dos sextantes y sólo ésos.

| | antes | ahora |
|---|---|---|
| 1 vista (A4C) | **4 sextantes pintados** — dos con un número heredado de la pared vecina | **2 pintados**, cuatro en gris |
| 2 vistas | 6 pintados, ninguno gris | **4 pintados**, dos en gris |
| 3 vistas | 6, cada uno propio | 6, cada uno propio |

Con el modelo viejo, un médico que sólo tenía la A4C veía **medio bull's eye pintado sobre dos
mediciones**: el anteroseptal mostraba el número del inferoseptal porque «la pared septal abarca
los dos». Hoy el diagrama pinta lo que se midió y deja gris lo que no. El anteroseptal lo aporta
la A3C y el anterior la A2C; sin esas vistas no se inventan.

**La condición que lo fija no es «los rótulos son correctos» sino el CONTEO por vista**:
«1 vista pinta DOS sextantes, no cuatro» y «sólo con TRES vistas se completan los seis». Las
tres mutaciones —devolver una herencia a la tabla, devolver las paredes anchas a la A4C, y
cruzar inferoseptal con anteroseptal— caen ahí. Una condición que sólo mirara los nombres pasa
con el modelo viejo reintroducido.

**El rótulo «(pared X)» del dibujante queda INALCANZABLE y se deja a propósito**, declarado como
tal en el código: fija el contrato de que un número heredado tiene que salir marcado. Es el
mismo criterio que los extremos redundantes del contorno de 3 puntos.

### Dos casos se pusieron en rojo y los dos tenían razón

- **TC-201** fijaba el modelo viejo entero («los dos sextantes septales pintados», «la pared
  ancha pinta sus dos sextantes igual», «2 vistas: no queda ningún gris»). Reapuntado al conteo.
- **TC-203** pinaba el literal `/anillo mitral SEPTAL/`. La A4C hoy pide el **INFEROSEPTAL**, y
  el regex anclado en «anillo mitral » deja de matchear — la colisión de substring al revés: no
  es que matchee de más, es que el ancla impide que matchee. Pasó a derivar el rótulo de
  `_strVista(...).paredes[0]`, o sea a pinar el invariante y no el texto.

### Lo que NO se cambió, y hay que decidirlo

**El ORDEN de trazado de A2C y A3C quedó como estaba.** La corrección listó los pares como
«Anterior + Inferior» y «Anteroseptal + Inferolateral», mientras el código traza
`['Inferior','Anterior']` y `['Inferolateral','Anteroseptal']`. En A4C el orden de la corrección
**sí** coincide con el del código (septal primero). El orden no es cosmético: define qué anillo
se le pide marcar primero al médico, y si se invierte sin invertir el trazado, las dos paredes
salen **intercambiadas** — que es exactamente el defecto que se cerró horas antes. Se
interpretó la lista como enumeración del par, no como orden de trazado. **Si el orden tiene que
invertirse en esas dos vistas, es un cambio aparte y hay que decirlo.**

## Strain: la barra lateral, el rótulo que no seguía a la vista, y los botones (TC-208)

### El defecto clínico: el panel PEDÍA marcar una pared que en esa vista no se ve

Reportado como «con A2C se mostraban los territorios de la A3C». **Medido antes de tocar nada,
esa parte es falsa**: `_strainCalcular` toma `V.paredes[i]` de `_STR_VISTAS` filtrado por clave,
así que A2C publica Inferior/Anterior y A3C Inferolateral/Anteroseptal, siempre. La guía del
trazado libre también salía bien en las tres.

**Lo que sí estaba cableado a la A4C eran los rótulos de lo que hay que MARCAR.** El modo de
3 puntos pedía «1. anillo mitral SEPTAL / 2. ÁPEX / 3. anillo mitral LATERAL» en las tres
vistas, y el aviso de «el orden importa» decía «suponen que marcaste del septal al lateral»
igual. En A2C eso nombra una pared que **en esa vista no se ve**.

**Por qué es peor que un rótulo feo:** el médico marca donde se le pide. Si en A2C se le pide
el anillo septal, marca el que tiene más cerca, el contorno queda recorrido al revés, y el
resultado publica **las dos paredes intercambiadas** — que es exactamente lo que ese aviso
existe para evitar. El cálculo no puede detectarlo: los dos arcos son igual de válidos, sólo
cambia cuál es cuál. El síntoma reportado —paredes que no corresponden a la vista— es
compatible con esto, aunque el mecanismo no fuera el que el reporte suponía.

Hoy los tres puntos salen de `_strPuntos3(V)`, que los deriva de `paredes`, **la misma lista que
rotula los territorios**. Con dos fuentes, el punto que se marca y la pared que se publica
pueden dejar de corresponderse — y la condición que lo fija no es «los rótulos son correctos»
sino **«lo que se PIDE marcar es lo que se PUBLICA»**, cruzando las dos. La mutación que los
vuelve a cablear cae por tres condiciones.

### Los botones: hay DOS `return` en el panel y hay que medir los dos

«Confirmar diástole» y «Empezar de nuevo» quedaban **debajo** del bull's eye de 300 px: el
médico termina de trazar, mira la imagen, y el botón que cierra ese gesto está fuera de la
pantalla. Suben a continuación del panel guía.

**LA MUTACIÓN SOBREVIVIÓ A LA PRIMERA VERSIÓN DEL CASO.** `_strainPanel` tiene dos salidas —la
rama de «¿agregás otra vista?», con el par completo, y la de **trazado**— y yo había medido
sólo la primera. La mutación tocaba la segunda, que es donde el médico pasa el tiempo. La
condición nueva completa una vista y traza en la siguiente: recién ahí coexisten el bull's eye
y el botón de confirmar.

### La barra lateral, y el blanco sobre verde que no se leía

Los tres grupos pasan a 12,5 px / 700 con filete de 4 px **de su propio color** —`--accent`,
`--purple`, `--green`— y el abierto va relleno; los subítems quedan en un cajón sangrado, a
10 px / 400, colgado del grupo por un filete del mismo color.

**El color va en `_MED_GRUPOS`, la misma lista que ya tiene rótulo y tooltip.** Con una tabla
aparte, agregar un grupo da un botón sin color y el `undefined` entra al atributo `style` **sin
dar error**: el filete no se dibuja y parece una decisión de diseño.

**EL TEXTO SOBRE EL RELLENO SE DERIVA DE LA LUMINANCIA, NO SE CABLEA A BLANCO.** Medido: blanco
sobre `--green` da **2,0:1** —ilegible— y justo en el grupo ABIERTO y en la herramienta
SELECCIONADA, que son los dos elementos que más hay que poder leer. Es `.grado-3` del módulo de
amiloidosis otra vez: la caja se ve de color y las palabras no. `_medTextoSobre` resuelve la
variable y elige el que más contrasta; con eso el mínimo pasa de **2,0 a 4,7:1** y sirve en los
dos temas y con cualquier color que se agregue.

**El contraste se mide en los DOS temas y el caso exige que DIFIERAN.** Mi primera sonda
conmutaba con un `setTheme` que no existe, así que midió dos veces el mismo tema y devolvió
números idénticos — que se leen como «anda igual en los dos». El tema real es
`html.light-mode`. Es la trampa de TC-114, y el denominador es una condición propia.

### Lo que costó

**Un `assert` que corta el script se lleva TODAS las ediciones de ese script.** El que agregaba
los colores falló, y con él se perdió la mitad del mismo archivo que reescribía la barra
lateral. Reapliqué sólo la mitad que recordaba y la sonda lo delató: los grupos seguían en
11 px con el borde genérico. **Después de un script con varios cambios y un assert que falló,
reaplicar TODOS, no el que se tiene en la cabeza.**

**Y el `\d` se lo comió el template literal**, en la sonda del contraste: `[\d.]+` llegó como
`[d.]+`, no matcheó ningún dígito y el caso reventó con `null.slice`. Es la misma familia que
el `\s` que este archivo documenta nueve veces. Se resolvió con `indexOf`/`split`, que es lo
que la propia entrada recomienda desde la quinta vez.

## Strain VI — el selector de cineloop y vista (TC-207)

El flujo arranca en **miniaturas**, no en una vista impuesta: el médico toca el cineloop, EcoSmart
pregunta *«¿Qué vista es este cineloop?»* con A4C/A2C/A3C, recién ahí se traza, y al cerrar el par
ofrece *«¿Agregás otra vista?»*, que vuelve al selector marcando lo ya usado.

**La premisa del pedido estaba incompleta y por eso el selector mira DOS orígenes.** «Los cineloops
guardados en el estudio» sugiere leer sólo IndexedDB, y con eso el selector quedaba **vacío justo
cuando se lo necesita**: `imgGuardadoActivo()` lee `cfg-guardar-imagenes` de `localStorage`, que **no
existe por omisión** —el guardado viene apagado de fábrica— y además guardar exige uuid de estudio.
Mientras tanto el flujo habitual es importar del pendrive y medir sobre lo recién importado, que vive
en `_cineDatos.loops` y nunca tocó el disco. `_strainLoopsDisponibles()` une abiertos + guardados y
deduplica por nombre. TC-207 fija el guardado **apagado** a propósito: es el denominador bajo el cual
un selector que mirara sólo lo guardado no tendría nada que mostrar.

**El mismo cineloop sirve para dos vistas** —lo decide el médico, es el punto 6 del pedido—. Se
permite, y el aviso de «salieron de la misma imagen» se conserva, porque una adquisición es una vista.
`medStrainVistaSiguiente` deja `loopListo = true` por eso mismo: sigue en la misma adquisición, no hay
que volver a elegirla.

**Trampa que costó dos vueltas: un caso que se muere no diagnostica.** Las primeras dos mutaciones
—listar sólo lo guardado, y fijar la vista sola— ponían TC-207 en rojo con una **excepción**
(`.click()` sobre `undefined`, después `.imagen` sobre `null`), no con una condición. Rojo es rojo,
pero el mensaje no decía *qué* se rompió, y peor: las condiciones que existen para declarar ese
defecto nunca llegaban a evaluarse. Con un `clk(el)` que devuelve `false` si el elemento no está, y
lecturas guardadas, cada mutación cae ahora en **su** condición:
- listar sólo los guardados → «LISTA LOS ABIERTOS, no solo los guardados»
- elegir loop fija la vista sola → «no fija la vista sola»
- no revocar los blob URL → «cerrar el visor revoca las miniaturas»
- prohibir reusar un cineloop → «EL MISMO cineloop sirve para otra vista»

**Las miniaturas de los abiertos son blob URL** (`URL.createObjectURL` sobre el fragmento JPEG); se
revocan en cada redibujo del selector y al cerrar el visor. Las de los guardados usan el `poster` que
ya trae el registro.

**`medStrainConfirmar` exige vista.** El getter `pares` devolvía `undefined` con `vista === null`, así
que un confirmar prematuro escribía sobre un objeto descartable y la medición se perdía en silencio.
Ahora el getter cae en `{d:null, s:null}` y el confirmar avisa y corta.

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

## Hoja de cardiopatías congénitas en el PDF del informe

Página condicional al final, una sección por CC con subtítulos, en vez del párrafo corrido.
Catorce CC conectadas por once sitios de llamada (la tabla de Ebstein/TdF/TGA/MCA cubre cuatro).

### Por qué un textarea persistido y no un array en memoria
Fue la decisión de diseño del turno, y se tomó **antes** de escribir el código: `generarInforme`
se dispara por un listener con *debounce* sobre `input`, y las rutas de restauración pueblan el
formulario asignando `.value`, **que no dispara `input`** — está escrito en `RECALC_MODULOS`. O
sea que al reimprimir un estudio guardado la función **no vuelve a correr**, y un array de módulo
habría quedado con las secciones del **paciente anterior** dentro de un PDF firmado.

La solución es el patrón que ya usan los módulos avanzados con `am-txt-*`: el texto vive en un
`<textarea>` con id, así que `capturarForm` lo guarda solo y el barrido de restauración lo repone
—y, lo que importa, lo **vacía** cuando la clave no está (`el.value = c[el.id] !== undefined ?
c[el.id] : ''`)—. Verificado que `cc-` no cae en `_noEsDelEstudio` ni en
`_CAMPOS_FUERA_DEL_ESTUDIO`; si cayera, la hoja desaparecería del PDF reimpreso **en silencio**.

Los textareas se construyen **al arrancar** y no al integrar: si no existen cuando corre la
restauración, el barrido los saltea sin avisar. Es el defecto que `amiloRestaurarDesdeCampos`
documenta para `am-txt-*`.

`ccHojaReset()` vacía las catorce al principio de `generarInforme`. Sin él, destildar una CC
dejaba su hoja en el PDF para siempre con el texto de la última vez que sí estuvo — el defecto
que `am-integrados` cerró del lado de amiloidosis. Mutante sin reset: la hoja de CoAo sobrevive
al destildado.

### Dos premisas del pedido que medí como falsas
- **La plantilla de clase no es implementable para las catorce.** Sólo `coa`, `fop`, `vab`, `ebs`,
  `mch`, `tdf` y `fontan` citan una clase, y sólo en algunas ramas; `dap`, `vap`, `tga`, `mca` y
  `eisen` no publican ninguna. Poner «(Clase IIa)» donde la app no la afirma es la cita falsa que
  este archivo ya documenta con la nota del NT-proBNP y con la cianosis de Ebstein, que va **sin
  clase a propósito** porque la ESC 2020 no publica cuál le corresponde. La línea de guía se
  **copia** del clasificador, no se arma.
- **El seguimiento tampoco.** Sólo seis módulos publican uno, más `coaSeguimiento()`. Para el
  resto la app no tiene periodicidad de controles, y escribirla sería contenido clínico nuevo en
  un informe firmado. La línea sale sólo cuando existe.

### El bug que costó el turno: un `const` local que sombreaba al global
La primera versión del helper vivía **dentro** de `generarInforme`. Al cambiar de diseño lo
«revertí» con un corte por índices que dejó la definición local viva. A partir de ahí, los once
sitios de llamada resolvían `ccHoja` contra el **local** —que escribía en un array muerto— y no
contra la función de módulo que escribe el textarea.

El síntoma era desconcertante: el bloque corría, el escritor funcionaba llamado a mano, y el
textarea quedaba vacío. Lo resolvió instrumentar **dentro** de la función y comparar la traza:
`["reset","coa-llamada","coa-post:0"]` contra `dentro=["k=coa","ors=3","val=158"]`. El `ors=3`
era la llamada directa de la sonda, no la del bloque — o sea que la del bloque **nunca entró a la
función instrumentada**. Ahí quedó claro que eran dos funciones distintas.

Reglas que deja:
- **Revertir por corte de índices no es revertir.** Verificar con un `grep` de la definición, no
  del uso.
- **Ante «se llama y no hace nada», instrumentar adentro y comparar la traza con la de una
  llamada directa.** Si las dos no coinciden, no es la misma función.

### La trampa cuadrática cobró la deuda que yo mismo había anotado
Al agregar una página, el PDF del informe creció y **la suite se colgó**: veinte minutos sin
salida, clavada después de TC-151. Eran las dos extracciones que en la tanda anterior dejé
anotadas como «el riesgo cuadrático sigue ahí si sus documentos crecen» — y creció por mi propio
cambio, en el turno siguiente. Las dos pasaron a la alternancia determinista.

**Anotar una deuda no la contiene.** Si el arreglo es mecánico y ya está validado en otro sitio,
aplicarlo a los tres sitios cuesta lo mismo que documentarlo en uno.

Y el backtick dentro del template literal de un caso, **quinta vez en la sesión**, otra vez en un
comentario recién escrito — esta vez en un `slice(1,-4)` entre comillas invertidas.

## PDF de auditoría: antecedentes combinados y filas que se pisaban

Dos arreglos, y en los dos el diagnóstico del pedido no era el correcto.

### 1 · «La tabla cuenta combinaciones» — la cuenta ya era individual
`freqData` del PDF **ya recorría el array y contaba cada antecedente por separado**. Creado desde
el formulario, `antecedentes_sel` es un array con un elemento por casilla y la tabla salía bien.

El problema está en los estudios **importados**: el importador de Excel parte la celda **sólo por
`|`** (`tipo === 'lista'`). Una planilla que escriba «HTA, DM» o «HTA + Dislipemia» deja las dos
cosas en **un** elemento, y la rama `arr = [a]` lo convierte en una entrada más. De ahí las filas
«HTA + DM» que se ven mezcladas con las sueltas: el recuento nunca estuvo mal, los **datos** venían
pegados.

Mutante que revierte el arreglo — reproduce el síntoma exacto del pedido:
`{"HTA, DM":1, "HTA + Dislipemia + DM":1, "HTA":1, "DM; Tabaquismo":1}`.

**El separador `/` NO entra, y es lo que más importa.** Seis de los dieciocho antecedentes
canónicos lo llevan adentro: «FA / flutter», «ACV / AIT», «EPOC / asma», «Cardiopatía isquémica /
IAM previo», «Quimioterapia / radioterapia», «Dispositivo implantado (MPP/CDI/CRT)». Partir por
`/` inventaría «FA», «flutter», «ACV», «AIT»… antecedentes que nadie registró — peor que la tabla
larga que se quiere arreglar.

**Pero la protección real no es el separador: es la regla todo-o-nada.** Se parte sólo si **todos**
los fragmentos son del vocabulario. Lo descubrí por mutación: agregar `/` al separador **no mató
ningún test**, porque «FA» y «flutter» no son canónicos y la entrada vuelve entera igual. El `/`
queda excluido como segunda línea —si alguien relaja la guarda, no se lleva puestos seis
antecedentes—, y el test que de verdad pinta la regla es otro: `'HTA, Amiloidosis rara'` tiene que
quedar **entero**, porque partir lo reconocible daría «HTA» + «Amiloidosis rara», o sea un
antecedente inventado a partir de texto libre. Ese mutante sí muere.

También se cuenta **por estudio** con un `Set`: con la casilla HTA marcada *y* una celda «HTA, DM»,
el mismo paciente sumaba dos veces y el porcentaje se pasaba del 100 %.

**Alcance ampliado a propósito:** el arreglo va en el seam `_labFreqEntries` y el PDF pasó a
delegar en él. Su `freqData` era el **mismo cuerpo letra por letra** — el defecto de las dos cuentas
del mismo dato que este archivo ya pagó cuatro veces. Con la copia viva, el dashboard y el PDF
habrían publicado tablas de antecedentes distintas sobre la misma cohorte.

### 2 · «El texto se corta» — se superponía
`drawTable` tenía `rowH` fijo en 6,4 mm y dibujaba cada celda con `{maxWidth}`. Ese `maxWidth`
**sí** parte el texto en varias líneas —jsPDF lo hace solo— pero el recuadro seguía midiendo 6,4,
así que los renglones sobrantes se dibujaban **encima de la fila de abajo**. No se cortaba nada: se
pisaba. En las tablas de conducta de las CC eso arruinaba justamente la columna del criterio, que
es la que impide leer la tabla como una indicación validada.

Ahora la fila se **mide** antes de dibujarse: se baja el cuerpo de 9 a 7 pt mientras eso alcance
para entrar en dos líneas, y si a 7 pt sigue necesitando más, la fila **crece**. Se mide con el
mismo estilo con que se dibuja —la negrita de la última columna es más ancha, y medirla en normal
daba una línea de menos justo en la celda que se desborda—. Con una sola línea el texto cae donde
caía antes (y0+4,1 contra y0+4,2), así que las tablas de dos columnas no se mueven.

### Cómo se verificó — midiendo posiciones, no texto
El texto completo **ya salía** antes del arreglo, así que buscarlo en el PDF no distingue nada.
TC-174 parsea el content stream con **coordenadas** (`Td`/`Tm`) y mide el salto vertical entre dos
filas consecutivas de la tabla de conductas de la CIA. Mutante con alto fijo:
`salto=18.1 pt · fijo=18.1 pt` (6,4 mm exactos). Con el arreglo: 28,6 pt, o sea dos renglones.

Dos correcciones al propio test antes de que midiera lo que decía:
- La ventana `y > a2.y - 1` se tragaba renglones de la fila siguiente.
- El filtro «x mayor que el rótulo» metía también la columna de n(%). La tabla es
  `drawTable(M, [44, 110, 26], …)`, así que la columna del criterio está a 44 mm exactos.

Y el backtick dentro del template literal de un caso, **cuarta vez en esta sesión**, otra vez en un
comentario recién escrito.

## TdF — y el cierre: las doce fichas, con dos CC que a propósito no la tienen

Duodécima ficha. **Y la que yo había anunciado mal.** Dije que TdF arrastraba `calcVP()` (84 L) y
`vpSync()`; los dos salen **sólo dentro de un comentario** de `tdfConclusion`. Ese dato vino del
detector viejo, el que no despojaba comentarios — el **mismo falso positivo** que ya había
encontrado y corregido en VAB, y que igual volví a propagar porque reporté sin re-medir. TdF era
la más chica de las tres: sombra + cuatro llamadas a `tvEstado`/`tvFrase`.

### El aserto: el estado sintomático ES la clase
La diferencia entre Clase I y Clase IIa en el reemplazo valvular pulmonar **es** que el paciente
tenga síntomas. Formulario con `tdf_sintomas:'no'`, objeto con `'si'`. Mutante sin la sombra:
`conSint="reintervencion_iia" sinSint="reintervencion_iia"` — un paciente sintomático **bajado de
Clase I a IIa** porque el formulario decía que no.

### Dos ids que me inventé, cazados antes de commitear
- **`tdf_psvd` no existe.** La sección lee `psap_calc`, el campo compartido. Un id inventado no da
  error: da una métrica vacía que se lee como «nadie lo midió».
- **`ip_grado` no tiene atributo `value`**: el valor **es el texto** («Sin insuficiencia» / «Leve»
  / «Moderada» / «Severa»), igual que `et_grado` —ya documentado—. Mi `=== '4'` no matchearía
  nunca y la proporción habría dado 0 % sobre una cohorte con insuficiencias severas. Y el corte
  de obstrucción es `EP_GMAX_LEVE_MAX = 36`, no 30.

Los tres los cazó el fixture dando `seguimiento` donde esperaba reintervención, más un `grep -c`
de cada id contra el archivo. **Verificar los ids contra el fuente antes de escribir la ficha**, no
después.

### El estado final: DOCE fichas, y dos ausencias deliberadas
`CC_ORDEN` = cia · civ · dap · vap · coa · fop · vab · ebs · tdf · tga · mch · mca.

**Eisenmenger y Fontan NO tienen ficha, y no es un pendiente.** `eisenEstado` y `fontanEstado` no
devuelven una clave de conducta: devuelven **alertas** (embarazo contraindicado, síncope,
hemoptisis) y un plan de seguimiento. No hay cascada que tabular, e inventarle una sería escribir
un criterio que el informe individual no afirma. Ya están representadas en la diapositiva 11 del
PPT con NYHA y saturación promedio.

De las doce, **diez publican conducta** y llevan el encuadre genérico; **dos no**: la MCA
clasifica diagnóstico (Task Force 2010) y la MCH estratifica riesgo (HCM Risk-SCD), y cada una
lleva rótulo, columna y encuadre propios. TC-172 fija el número en **10 sobre 12**: si a una de
esas dos le ponen el genérico, el conteo se va a 11 y caen varias condiciones juntas.

### La auditoría final
27 funciones de la cadena de CC barridas con el detector corregido: **cero** helpers sin `src`,
**cero** lecturas del DOM fuera de las 9 ramas `!src` deliberadas (el camino literal de los
clasificadores viejos cuando no se les pasa estudio).

## MCH: la cadena más larga, y la fila que impide estratificar donde el modelo no aplica

Undécima ficha. **Quince funciones** en el cierre transitivo, nueve de ellas threadeadas:
`mchConclusion`, `mchAHA`, `mchScoreESC`, `mchExclusiones`, `mchFamMS`, `mchEspesor`, `mchFevi`,
`mchGrad`, `mchGradMax`. `tvEstado`/`tvFrase` ya aceptaban `src` de la tanda de MCA.

### La tabla estratifica riesgo — y acá la ESC sí ata una clase
Como la MCA, la MCH **no publica conducta**: publica las bandas del HCM Risk-SCD. Pero a
diferencia de la MCA, la ESC 2023 **sí** ata una clase de recomendación a cada banda, y esa clase
es la que la app ya imprime en el informe individual. Se **copió de ahí**, no se redactó: `alto` →
desfibrilador a considerar (IIa), `intermedio` → puede considerarse (IIb), `bajo` → no indicado
de rutina, con la salvedad de los modificadores.

Cortes **verificados en el código**, no de memoria: `<4` bajo, `<6` intermedio, `>=6` alto. El
`>=6` está comentado en la fuente como deliberado — en 6,00 exacto la diferencia entre IIa y IIb
es un implante.

### La fila `no_aplicable` es la razón de ser de la ficha
Con una de las seis exclusiones del HCM Risk-SCD activa, el modelo **no está validado**. Publicar
una banda igual es lo que hacía salir «riesgo bajo, desfibrilador no indicado» sobre un paciente
en estudio por sospecha de amiloidosis — defecto que la sección ya documentaba. La fila lo
declara en vez de estratificar.

Y ése es el aserto que discrimina: formulario con `mch_ex_fenocopia:'no'`, objeto con `'si'`.
Mutante (`mchExclusiones` leyendo el DOM): `conEx="bajo" sinEx="bajo"` — el Laboratorio
estratificando riesgo sobre un paciente en el que el score no corresponde.

### Tres tropiezos del test, todos del mismo tipo: medir sobre algo que no se calculó
1. **`incompleto` contra `incompleto`.** La TVNS es la séptima variable del modelo y **no es un
   campo propio de MCH** — sale de `tvEstado`. Sin `tv_documentada` en el fixture, el score no se
   calcula y el aserto comparaba dos bandas inexistentes.
2. **`bajo` contra `bajo`.** Con las siete variables, 16 contra 32 mm en un paciente joven mueve
   el score pero **no cruza el corte de 4 %**. Medir la *banda* daba un aserto que pasaría igual
   con la cadena rota. Se pasó a comparar el **porcentaje**, que es el seam real. Mutante
   (`mchEspesor` sin `src`): los dos dan `pct 2.503506599243932` — el de los 21 mm del formulario.
3. **Dos asertos duplicados**, dos veces, por splices por índice que insertaron sin borrar. Los
   delató que la misma condición apareciera repetida en la salida del mutante.

La regla que dejan las tres: **antes de creerle a un aserto que pasa, mirar que el valor medido
exista.** Un `incompleto` o un `bajo` de los dos lados no es una comparación, es un empate sobre
vacío.

## VAB: la cadena larga, y un factor de riesgo que venía del paciente equivocado

Décima ficha. `vabConclusion(src)` → `vabFactores(src)` → `coaConclusion(src)`: **tres niveles**,
y el del medio es el que hace interesante el caso.

### La coartación no es un campo de VAB: es la conclusión de otra sección
`vabFactores` deriva «coartación de aorta documentada» de `coaConclusion()`, no de un desplegable
propio — decisión ya documentada y correcta, porque preguntar dos veces el mismo hecho es cómo el
informe se contradice consigo mismo. Pero esa llamada **leía el DOM**. Y la coartación es un
factor de riesgo que **baja el umbral quirúrgico de la aorta de 52 a 50 mm**.

O sea: un estudio guardado de 51 mm, sin coartación, corriendo en el Laboratorio mientras otro
paciente con coartación estaba cargado en pantalla, salía con **cirugía indicada**. No un número
distinto — una indicación quirúrgica que ese paciente no tiene.

Medido, no supuesto. Mutante con `coaConclusion()` sin `src`:
`conCoa="cx_50_fr" sinCoa="cx_50_fr"`. Con el arreglo: `cx_50_fr` / `vigilancia_50`.

### Dos asertos, dos profundidades
- **Diámetro** (prueba la sombra): formulario con `ao_tub:'51'`, objetos con 56 y 42 → `cx_55` vs
  `dilatacion_leve`. Mutante que revierte la sombra: los dos dan `contradiccion`.
- **Coartación** (prueba la cadena de tres): el único que baja hasta `coaConclusion`.

El primero pasa con la cadena rota. Por eso hacen falta los dos.

### El barrido tuvo un falso positivo y hubo que arreglarlo
El detector de la tanda anterior marcó cuatro problemas —`coaGmax()`/`coaNV()` sin `src` en
`vabFactores` y en `ebsConclusion`— y **los cuatro eran texto dentro de mis propios comentarios**,
que mencionan esos nombres al explicar el defecto. El detector salteaba líneas que *empiezan* con
`/*`, no las continuaciones de un bloque. Se reescribió con un despojador real de comentarios y
literales de cadena; recién ahí dio limpio. Un detector con falsos positivos se empieza a ignorar,
y entonces deja de servir para los verdaderos.

### Rótulos con el número adentro
Los cinco umbrales de la ESC 2024 son criterios **distintos** —55, raíz ≥50, 52 con riesgo bajo,
50 con factores, 45 con cirugía concomitante— y bajo un solo rótulo «Cirugía» quedan
indistinguibles en el papel firmado. Cada fila lleva su diámetro. Y existen `umbral_sin_riesgo` y
`riesgo_no_bajo` porque **alcanzar el diámetro no es alcanzar la indicación**: el riesgo
quirúrgico tiene que constar como bajo. TC-172 fija las dos cosas.

## MCA: una tabla que NO son conductas, y el estado de módulo que no es un campo

Novena ficha, y la que obligó a cambiar el motor. Dos cosas la separan de las ocho anteriores.

### 1 · Las bandas del Task Force NO son conductas
`mcaConclusion` devuelve `definitivo / limitrofe / posible / sin_criterios`: son **categorías
diagnósticas**, no indicaciones terapéuticas. La app **no publica conducta** para la MCA — no hay
una rama que diga qué hacer. Imprimir esas bandas bajo una columna titulada «Conducta», con el
encuadre «sugerencia orientativa… el médico decide la conducta», **convierte un diagnóstico en
una indicación de tratamiento** en un PDF firmado. Son afirmaciones clínicas distintas.

La ficha trae cuatro rótulos propios y el motor los respeta con `||` sobre los de siempre:
`condTit`, `condCol`, `condTitPpt`, `encuadre`/`encuadrePpt`/`piePpt`. El PDF sale con
«clasificación diagnóstica Task Force 2010 — NO ES UNA CONDUCTA» y la columna dice «Categoría
diagnóstica».

Efecto colateral útil y **verificado**: con nueve fichas, el encuadre genérico aparece **ocho**
veces. TC-172 lo fija en 8. Si alguien le pone el genérico a la MCA, el conteo pasa a 9 y caen
cuatro condiciones a la vez — comprobado por mutación.

El encuadre propio además declara la limitación real: el diagnóstico definitivo exige histología,
ECG, arritmias y genética, que el ecocardiograma no aporta. **La banda calculada acá es parcial
por construcción**, y el papel tiene que decirlo.

### 2 · La contractilidad no es un campo
`mcaVI()` leía `contrEstado`, `contrDifusa` y `contrDisqSep`: **variables de módulo**, o sea el
paciente que esté cargado en pantalla. Se persisten como JSON en `campos.contractilidad` y
`campos.contr_flags`. El nuevo `_ccContr(src)` parsea ese snapshot replicando exactamente lo que
hace `_restaurarContractilidad` (string-o-objeto, `JSON.parse` con guarda, `Number(x) || 0`); si
las dos lecturas divergieran, el Laboratorio y el informe firmado describirían motilidades
distintas del mismo estudio.

Esto es lo que hacía a la MCA **no** una de las chicas: el resto del trabajo eran sombras
mecánicas; esto es un módulo entero que había que sourcear.

### La cadena completa, y cómo se verificó que no quedó nada suelto
Siete funciones threadeadas: `mcaConclusion`, `mcaScore`, `mcaCatI`, `mcaVI`, `_mcaChk`,
`mcaFamMuerteSubita` y `tvEstado`/`tvFrase` (el módulo de TV, compartido con MCH).

No se auditó leyendo: se escribió un **barrido** que recorre el cuerpo de cada función de la
cadena y marca (a) toda llamada a un helper de la cadena sin `src`, (b) todo `_mcaChk` sin su
segundo argumento y (c) toda lectura de `getElementById` / `v(` / `contrEstado`. **Encontró una
que la lectura a ojo había dejado pasar** — `mcaFamMuerteSubita()` dentro de `mcaConclusion` —,
y recién después dio limpio. Un shim que se queda a mitad de camino produce un resultado
plausible, que es por lo que no alcanza con revisar.

### Los dos asertos no vacuos de la MCA
- **Estructural:** el formulario tiene `mca_tsvd_plax:'34'` + `aqui_disc`; el objeto de `sinE` no
  trae ninguno. Sin propagar `src` por `mcaCatI()`, las dos bandas colapsan.
- **Contractilidad:** dos objetos que difieren **sólo** en el snapshot JSON. Mutante
  (`_ccContr` ignorando `src.contractilidad`): `conAneur=[] conNada=[]` — los dos narrativos
  idénticos y vacíos.

## Ebstein — y la corrección a «MCA y Ebstein son las chicas»

Octava ficha. Y una corrección a lo que yo mismo había reportado: **MCA no es de las chicas.**
El recuento de helpers que di contaba los de una línea y se le escapó lo importante —
`mcaVI()` lee `contrEstado`, `contrDifusa` y `contrDisqSep`, que son **variables de módulo del
bloque de Contractilidad**, no campos. Se persisten (`campos['contractilidad']` y `contr_flags`,
como JSON), así que la versión source-aware tiene que **parsear ese snapshot**, no leer el
estado vivo. Ebstein sí era chica y se hizo primero.

Dato que acota el trabajo de MCA cuando le toque: **el `clave` de `mcaConclusion` no depende de
`mcaVI()`** — sale sólo de `mcaScore()` y de la guarda `sc.catI.fuera`. `vi` es narrativo. Aun
así hay que sourcearlo: un narrativo armado con la contractilidad del paciente en pantalla es el
«clasificador a medias» con otro nombre.

### Lo que Ebstein necesitó más allá de la sombra
La sombra **no alcanza a los helpers**: tienen ámbito propio y siguen apuntando al binding de
módulo. Hubo que threadear tres:
- `ebsCelermajer(src)` — con su propia sombra de `_ebsNv`.
- `getBSA(src)` — parámetro opcional; la rama sin `src` queda literal porque la usan decenas de
  llamadores en pantalla.
- `fopConclusion(src)` — ya era source-aware, sólo faltaba pasarle el argumento.

### El aserto que prueba el helper, separado del que prueba la sombra
Dos condiciones distintas, y **cada mutación mata la suya**:
- **Sombra:** el formulario tiene `ebs_saturacion:'94'` (sin cianosis) y el objeto `'85'`. Sin
  sombra, el mutante devolvió `conSat="considerar_cirugia" sinSat="considerar_cirugia"`.
- **Helper:** el formulario tiene las cinco áreas **válidas** y el objeto una de 900 cm². Si
  `ebsCelermajer()` sigue leyendo el DOM calcula un índice válido, no hay valor fuera de rango y
  la cascada termina en `seguimiento` en vez de cortar. El mutante devolvió
  `mala="seguimiento" buena="seguimiento"`.

Sin el segundo aserto, el primero pasa con el helper roto — que es exactamente cómo se coló el
`coaGmax()`/`coaNV()` la primera vez.

### Decisiones de la ficha
- **No hay campo de «tipo»:** lo que clasifica es el **grado de Celermajer**, un índice calculado.
  Se distribuye por la función del VD, con `tipoTit` rotulándolo como lo que es.
- **La cianosis va sin número de clase.** La ESC 2020 la nombra entre los desencadenantes de
  intervención pero no publica la clase; ponerle una sería cita falsa — el defecto de la nota del
  NT-proBNP. TC-172 lo fija: la fila existe y `'Cianosis en reposo - Clase'` **no** aparece.
- **El índice se promedia sobre los estudios con las cinco áreas**, no sobre la cohorte: falta
  una y devuelve null. El pie lo dice.

## TGA: el shim por SOMBRA, que es el patrón para las cinco que faltan

Séptima ficha. `tgaConclusion` pasó a aceptar un estudio guardado, y el modo de hacerlo importa
más que el resultado: es la plantilla de las cinco que quedan.

### La sombra, y por qué no se renombra cada llamada
Dos lectores nuevos a nivel de módulo, `_ccSv(id, src)` y `_ccNv(id, src)` —sin `src` leen el
formulario, **literal**, para no mover el informe firmado—. Y dentro de la función:

    function tgaConclusion(src){
      const _tgaSv = id => _ccSv(id, src), _tgaNv = id => _ccNv(id, src);

El `const` local **sombrea** el helper de módulo del mismo nombre en todo el cuerpo, así que los
~15 sitios de llamada quedan **intactos**. La alternativa era renombrarlos uno por uno — que es
exactamente el barrido que en este archivo ya se llevó por delante tres campos ajenos con el
`_vel` → `_veloc`. Con la sombra, **un sitio que se olvide no existe**: o la función entera lee
del estudio, o no compila. Y `tgaSync()` sigue llamando al helper de módulo con un argumento, o
sea al DOM, sin cambio alguno.

Lo que la sombra **no** resuelve: los helpers externos. `mchExclusiones()`, `vabFactores()`,
`calcVP()` y `getBSA()` tienen su propio ámbito y siguen apuntando al binding de módulo. Esas
cinco necesitan threading explícito — es el trabajo que queda.

### El aserto no vacuo, otra vez
La comparación DOM↔`src` **no prueba nada** cuando las dos rutas leen los mismos datos. El aserto
que discrimina usa un escenario donde el campo que decide existe **sólo en el objeto** y el
formulario tiene un valor **distinto**: `tga_func_vd` ausente del objeto pero `'moderada'` en
pantalla. Con el shim, `sinF` cae en `sin_funcion`; sin el shim lee el DOM y colapsa en
`disfuncion` junto con `conF`. Verificado por mutación — quitar la línea de la sombra da
`conF="disfuncion" sinF="disfuncion"`.

No hace falta limpiar el formulario; **al contrario**: que tenga un valor distinto del que se
quiere probar es lo que hace discriminante al aserto.

### Dos trampas conocidas, pagadas de nuevo
- **El backtick dentro del template literal**, tercera vez en esta sesión, en un comentario mío.
- **Un marcador de PDF con paréntesis.** `'ventriculo sistemico (VD)'` da cero coincidencias
  sobre un texto que **sí** está impreso: jsPDF escapa los paréntesis en el content stream. El
  marcador se cortó antes del paréntesis.

## VAP y FOP en el Laboratorio — y por qué las otras ocho CC no son «lo mismo otra vez»

Se agregaron **dos fichas**: ventana aortopulmonar y foramen oval. Las dos completas —bloques A,
B, C y D— porque `vapConclusion(src)` y `fopConclusion(src)` ya aceptaban un estudio guardado.
Con eso el Laboratorio pasa de cuatro cardiopatías a seis. **No** se agregaron las otras ocho, y
la razón no es falta de tiempo: son tres problemas distintos que el pedido trata como uno solo.

### El pedido dice «ocho CC restantes» y en realidad son tres grupos

1. **Dos que NO tienen conducta que publicar.** `eisenEstado` y `fontanEstado` no devuelven una
   clave de conducta: devuelven **alertas** (embarazo contraindicado, síncope, hemoptisis) y un
   plan de seguimiento. No hay cascada terapéutica que contar. Inventarle una tabla de conductas
   sería escribir un criterio que el informe individual no afirma — que es exactamente lo que la
   regla crítica del pedido prohíbe. Además **ya están representadas**: la diapositiva 11 del PPT
   les da su bloque con NYHA y saturación promedio.
2. **Seis que necesitan un refactor, no una ficha.** `vabConclusion`, `mchConclusion`,
   `mcaConclusion`, `ebsConclusion`, `tdfConclusion` y `tgaConclusion` leen el DOM. No
   directamente —eso sería un shim de dos líneas— sino a través de sus helpers: `_mchSv`/`_mchNv`,
   `_mcaSv`/`_mcaNv`, `_tvSv`/`_tvNv`, `_ebsSv`/`_ebsNv`, `_tdfSv`/`_tdfNv`, `_tgaSv`/`_tgaNv`,
   más `mchExclusiones()` (45 L), `vabFactores()` (46 L), `getBSA()` y `calcVP()` (84 L).
   Medido con cierre transitivo, no leyendo la primera línea de cada función.
3. **Los dos que sí se hicieron.**

### El motor ahora admite una CC sin Bloque D
`_labCCResumen` devuelve `cond: null` cuando la ficha no trae `clasif`/`conductas`, y las dos
superficies omiten la tabla. La alternativa era peor que no tenerla: **una tabla con todas las
conductas en cero afirma que se evaluó el criterio y que ningún paciente lo cumple**, cuando lo
que pasa es que nadie lo evaluó. En el PPT la barra de distribución pasa a ocupar la hoja entera
—media diapositiva en blanco al lado de un hueco se lee como un dato que falta— y el encuadre
«sugerencia orientativa» **no** se imprime: firmar un descargo sobre algo que no se dijo hace
creer que en algún lado hubo una recomendación.

### Una fila que no podía existir: `FOP descartado`
La tabla del FOP tenía once filas, una por rama del clasificador. Una de ellas es **inalcanzable
desde el Laboratorio** y se sacó. `_CC_SECS` cuenta la sección por `fop_tunel`, `fop_asa_mm` o
`fop_burbujas`; la rama `descartado` exige que los tres estén vacíos (contraste negativo sin
anatomía). **Ningún estudio puede cumplir el predicado de pertenencia y esa rama a la vez.** Un
«FOP descartado: 0 (0%)» impreso en el PDF afirma que se contó y que a nadie le dio — y lo cierto
es que esos estudios nunca entran al denominador. Si alguna vez entrara uno cae en `otras`, que
el pie declara. TC-173 fija las tres mitades: que el clasificador **sí** produce la clave, que el
estudio **no** entra a la sección, y que la tabla **no** lista la fila.

No se ensanchó el predicado para incluirlos: traería al denominador «Estudios con FOP» a
pacientes en los que el FOP fue **descartado**.

### Una lectura muerta del formulario dentro de un clasificador source-aware
`vapConclusion` tenía `const q = ccQpQsDe('vap')` — sin `src` y **sin un solo uso**. Ninguna rama
lo mira. Como no votaba no hubo resultado contaminado; lo que había era la mecha puesta para el
próximo que agregue una rama por Qp/Qs y la escriba sobre el paciente de la pantalla en vez del
del estudio. Es el mismo defecto que este archivo ya pagó con `coaGmax()`/`coaNV()`, sólo que
detenido antes de costar algo. Se borró.

### `soloShuntUnico:false` en las dos, por razones DISTINTAS
- **VAP:** su criterio es la **dirección** del shunt y la HTP, no un cociente de flujos. Excluir
  del denominador a los que tienen más de un shunt descartaría estudios por una razón que esa
  rama no usa. La atribución del Qp/Qs se aplica donde sí corresponde: en la métrica del bloque C,
  vía `_ccQpQsAtrib(i, 'vap')` — que ahora toma la CC como parámetro.
- **FOP:** está **deliberadamente fuera de `CC_SHUNTS`** (es un shunt fisiológico del 25 % de la
  población, y contarlo apagaría el Qp/Qs de la CIA en uno de cada cuatro pacientes). Por eso
  `_ccShuntGruposDe` nunca lo nombra, y con `true` el denominador sería **cero en todo estudio que
  además tenga una CIA**. Confirmado por mutación: el caso pasa a `fuera=1`.

Poner el mismo valor por el mismo motivo habría sido la conclusión cómoda y equivocada.

### `CC_ORDEN` con assert de arranque
El orden de las secciones estaba escrito como literal `['cia','civ','dap','coa']` **en las dos
superficies**. Ahora es una constante leída por las dos, con un assert que compara contra
`Object.keys(CC_FICHAS)` en las **dos direcciones**. Sin él, una ficha nueva sin entrada en el
orden no da error: da una sección que simplemente no se imprime — y una que está en el PDF y no en
el PPT viola «PDF ≥ PPT» sin que nada lo delate.

### El FOP no distribuye un «tipo»
No hay clasificación anatómica en la sección. Lo que se distribuye es el **grado de shunt por
burbujas**. `tipoTit` cambia el rótulo en las dos superficies; el PDF prefija `Grado de shunt:` en
vez de `Tipo:`. Rotularlo «tipo» nombraría una variable que la sección no registra.

### La trampa cara: un test que no falla, se cuelga — y una regex que nunca fue lo que decía

Agregar la ventana y el foramen a TC-172 dejó la suite **colgada**. No en rojo: sin una sola
línea de salida, minutos. El primer diagnóstico —«hay 22 Chrome huérfanos, es la máquina»— era
falso; con el entorno limpio volvió a colgarse a los 18 minutos.

Tres sondas con `Promise.race` y timeout acotaron el problema hasta descartar lo obvio:
`labGenerarPDF()` termina bien con los seis estudios, y la extracción de texto también. Lo que
colgaba estaba **entre medio**, y el motivo resultó ser doble:

**1. La regex nunca estuvo anclada en paréntesis.** El cuerpo de un `caso()` es un **template
literal**, así que se come los escapes. Lo escrito era:

    const re = /\((.*?)\) ?Tj/g;      // lo que se lee en el fuente

y lo que llegaba a la página era:

    /((.*?)) ?Tj/g                     // sin UN SOLO paréntesis literal

Un grupo vacío seguido de ` ?Tj`. Esta extracción **nunca leyó «la cadena entre paréntesis»**:
leía desde donde cayera hasta el `Tj` siguiente. Funcionaba de casualidad, porque el texto
buscado caía igual adentro de lo capturado. Corolario: la regla ya documentada de que «un
marcador con `(` da cero coincidencias» era cierta **por otro motivo** del que afirmaba su
comentario.

**2. Sin ancla, el `.*?` lazy es cuadrático sobre el stream de un PDF con PNG embebidos.** El
costo no está en los matches sino en la **última** llamada a `exec()`: la que ya no encuentra
nada y recorre cientos de miles de bytes binarios con backtracking. Por eso el síntoma apareció
recién al crecer el documento —dos secciones y dos gráficas más—, y por eso no se manifestó como
un test en rojo sino como **una corrida que no vuelve**.

La corrección duplica las barras para que sobrevivan al template y usa una alternancia
determinista (una rama empieza por barra, la otra la excluye), así que no hay backtracking:

    const re = /\\(((?:\\\\[\\s\\S]|[^()\\\\])*)\\)\\s?Tj/g;

**Las otras dos extracciones del archivo (~8124 y ~8288) sí llevan las barras dobles**, así que
esas están ancladas de verdad — pero también usan `.*?` lazy, o sea que el riesgo cuadrático
sigue ahí si sus documentos crecen. Queda anotado, no corregido: no se tocan tests que pasan.

Reglas que deja:
- **Un test que se cuelga no es un test lento.** No hay timeout por caso: `awaitPromise:true`
  espera para siempre. Ante una corrida sin salida, sondear con `Promise.race` en vez de esperar.
- **Una regex dentro de un template literal no es la regex que se lee.** Verificar imprimiendo
  la cadena resultante antes de creerle al fuente.

### Trampas de esta tanda
- **El backtick dentro del template literal de un caso, otra vez.** En un comentario que acababa
  de escribir. Rompe el archivo entero con `missing ) after argument list`.
- **Un pie que contradecía a su propia tabla.** El `pie` del FOP decía que un estudio con el
  foramen descartado «se cuenta como FOP descartado» — y acababa de establecerse que esos
  estudios **no entran a la sección**. Lo cazó la condición que exige que la frase no aparezca en
  el PDF. El texto se corrigió para decir lo que de verdad pasa: quedan fuera del denominador.
- **Un denominador vacío que pasaba el test.** La primera versión de TC-173 exigía que
  `props.asa` tuviera denominador propio y daba `de=0`: **ningún fixture cargaba el aneurisma**.
  La condición estaba bien escrita y no probaba nada. Se agregaron tres estudios (marcado, medido
  y negado) y la condición pasó a ser `de===3 && n===2`.
- **Un fixture que trae el dato no puede probar la rama que lo pide.** `acv_sin_edad` necesitó un
  constructor propio: el `mk` genérico inyecta `edad` siempre.

Verificado: TC-173 (29 condiciones) más VAP y FOP agregados a TC-172, que genera el **PDF real**.
Cuatro mutaciones, cada una en rojo donde le toca: FOP a `soloShuntUnico:true`, la
contraindicación de la VAP dejando de evaluarse primero, la fila inalcanzable reapareciendo, y
`vap` fuera de `CC_ORDEN`.

## PPT del estudio individual: la hoja PostCEC que faltaba, y tres premisas del pedido que eran falsas

El pedido describía un PPT de **seis diapositivas** con texto que se corta, fuente demasiado
grande y disposición pobre. Medido contra el generador real (`_pptDesdeFormulario`, 1194 líneas,
13 llamadas a `nueva()`), tres de esas premisas no se sostienen:

- **«Seis diapositivas» habría BORRADO módulos.** Las hojas de ETE, congénitas, amiloidosis,
  cardio-onco, eco pulmonar y hemodinámica son condicionales (`integrado(k)`), no relleno: salen
  sólo si el médico integró ese módulo al informe. Colapsar a seis las elimina de los estudios que
  sí las tienen. Se leyó el pedido como **la columna vertebral**, no como un mandato de borrar.
- **La hoja de Mediciones ya tenía dos columnas y autoajuste.** `_pptFsQueEntra([IZQ, DER], …)`
  mide el contenido y elige el cuerpo de letra que entra. No había nada que arreglar ahí.
- **El narrativo ya está en 10 pt y se parte en varias hojas** — por DEBAJO del piso de 11 pt que
  pedía el prompt. Bajarlo no aplicaba y subirlo lo habría hecho cortarse. Se dejó como estaba.

**Lo que sí faltaba: POP tenía CERO ocurrencias en el PPT individual.** Un estudio con el módulo
de cirugía cardíaca integrado se presentaba sin su bloque hemodinámico. Esa es la hoja nueva, y
sale entera de `popPatron()` —el mismo seam que pinta la conclusión en pantalla y escribe la hoja
del PDF—. Las cinco preguntas ya vienen con su `cls`, así que el semáforo se **traduce**, no se
decide: reimplementar el color habría sido la tercera copia del criterio. `orange` se mapea a 🟡 y
no a 🔴, porque decir «actuar» sobre lo que la app marca como intermedio es un cambio clínico
disfrazado de detalle de formato.

Tres mediciones agregadas a la hoja de Mediciones: **DSVI** (el id real es `dsfvi`), **VRT**
(`vmax_it` — es el cuarto criterio ASE 2016 de la diastólica, y sin él la tabla mostraba tres de
los cuatro parámetros que el grado usa) y **Pericardio**.

### Dos trampas que costaron una pasada
- **`R.pat` es un OBJETO `{k, lbl, cls}`.** Concatenarlo imprime `[object Object]` en la
  diapositiva firmada. Es exactamente el defecto que este archivo ya pagó con `dptTamano()`. Se
  usa `.lbl`.
- **`tabla()` emite por `addTable`, no por `addText`.** La sonda que interceptaba sólo `addText`
  reportaba **todas** las filas de tabla como ausentes — un falso «no se dibujó» sobre una hoja
  completa. Hay que interceptar las dos.

Verificado sobre un PPT real con POP integrado: `totalHojas:4`, `indicePostCEC:2`, y en esa hoja
`tipoCx/horas/monitor/droga/ic/pcp/rvs/patron` todos presentes, `patronTextoOk:true`,
`verde:2 amarillo:2 rojo:1`, disclaimer presente. 187/187, huérfanos limpio, Semgrep 123/0 ERROR.
**Safari no se verificó** — el navegador está concedido en nivel «read» y no se puede navegar.
Sin test de regresión todavía para esta hoja.

## PPT del estudio individual: hoja PostCEC y tres mediciones — y lo que NO se toco

### POP no existia en el PPT individual
Cero ocurrencias de `pop` en `_pptDesdeFormulario`: un estudio con el modulo integrado se
presentaba sin su bloque hemodinamico, aunque el PDF si lo traia. Ahora hay hoja condicional por
`integrado('pop')` —la misma casilla que gobierna la hoja del PDF—: contexto quirurgico (tipo,
horas, monitoreo, drogas ACTIVAS con su dosis), hemodinamica con la FUENTE de cada valor entre
parentesis —el IC puede venir del Swan, del PiCCO o del eco—, el patron en franja propia y las
cinco preguntas de `popPatron()` con semaforo.

El semaforo se TRADUCE, no se decide: las preguntas ya vienen con su `cls`. El clasificador tiene
cuatro bandas y la escala pedida tres, asi que `orange` cae en amarillo y no en rojo — mapearlo a
rojo diria «actuar» sobre un hallazgo que la app marca como intermedio.

### `R.pat` es un objeto, no una cadena
La primera version hacia `'Patrón hemodinámico: ' + R.pat` y eso imprime **«[object Object]»** en
la diapositiva. `popPatron().pat` es `{k, lbl, cls}`; el texto que publican la pantalla y el PDF
es `.lbl`. Es el mismo defecto que este archivo ya pago con `dptTamano()`. Lo caza la sonda
porque compara contra `'object Object'`, no solo contra la presencia de la palabra «Patron».

### Las filas de tabla NO pasan por addText
La sonda interceptaba `addSlide().addText` y daba `false` en las siete filas de la hoja —parecia
que la tabla no existia—. `tabla()` emite por **`addTable`**. Interceptando las dos: las siete
filas estan. Tercera vez en la sesion que el defecto esta en la sonda: **antes de reportar un
elemento ausente, confirmar que el metodo por el que se dibuja es el que se esta mirando.**

### Tres mediciones que faltaban
`DSVI` (el id real es `dsfvi`, no `dsvi`), `VRT` (`vmax_it`) y `Pericardio`. La VRT es el CUARTO
criterio de la diastolica ASE 2016 y su ausencia dejaba la tabla mostrando tres de los cuatro
parametros que el grado usa.

### Lo que NO se hizo, y por que
- **No se colapso a 6 diapositivas.** El generador produce hasta 13, con ETE, congenitas,
  amiloidosis, cardio-oncologia, eco pulmonar y hemodinamica gateadas por `integrado(...)`. La
  estructura de 6 describe el ESQUELETO —portada, mediciones, informe, en suma, PostCEC,
  preguntas— y aplicarla al pie de la letra habria borrado seis hojas de contenido clinico de un
  documento que circula. Las condicionales quedan.
- **La hoja de mediciones YA tenia** dos columnas y autoajuste (`_pptFsQueEntra`), que es lo que
  el pedido describe como faltante.
- **El informe narrativo ya va a 10 pt y se PARTE en varias hojas** cuando no entra. El pedido
  pide autoajustar «hasta 11 pt», que es MAS grande que lo actual: subir el piso haria que
  desborde justo el caso que hoy se resuelve partiendo. No se toco.
- **Sin caso de regresion para la hoja PostCEC.** Verificada con un PPT generado de verdad
  (4 hojas, PostCEC en el indice 2, 2 verdes / 2 amarillos / 1 rojo, disclaimer del modulo), pero
  sin cobertura automatica. Queda como deuda.

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

### CHM del GE Vivid — segundo modo del importador (2026-09-19)
El botón «Importar → DICOM SR» ahora rutea **por los bytes del archivo**, no por la extensión:
`ITSF` al inicio → lector CHM; `DICM` en el byte 128 → lector SR. El Vivid IQ nombra su CHM con
el UID DICOM del estudio, así que por el nombre los dos formatos son indistinguibles.

**El XML está comprimido y hay un descompresor LZX completo en el archivo.** No es una decisión
de estilo: se midió sobre el CHM real y hay **cero** apariciones en claro de `measurements`,
`measpar` o `<Patient`. La sección es `MSCompressed` con `LZXC v2`, ventana de 64 KB, y una
ResetTable de 5 bloques (133.996 B → 12.004 B). Un `indexOf` no puede funcionar.

- **El modo de falla del LZX es silencioso, y ya mordió dos veces durante el desarrollo.**
  1) Sin la **realineación del bitstream a 16 bits al terminar cada marco de 32 KB**, el primer
  marco sale perfecto —HTML válido, con BOM— y la corrupción arranca a mitad del segundo. No hay
  excepción. 2) Sumarle `byteOffset` a índices que ya son relativos a la vista `Uint8Array` hacía
  leer 12 KB más adelante; ahí sí tiró «símbolo Huffman inválido», pero fue suerte: con otro
  desplazamiento habría devuelto bytes. Por eso las comprobaciones de `_chmExtraer` (largo total
  contra la ResetTable) y el `DOMParser` no son decorativas.
- **La verificación es el SHA-256, en TC-177.** Largo correcto y XML bien formado son
  estructurales; el hash es lo único que afirma «byte a byte». Cubre los tres intervalos de
  reset, incluido el último de 2.924 bytes.
- **No hay oráculo externo todavía.** `brew install p7zip` quedó bloqueado en la sesión, así que
  la descompresión está verificada contra un prototipo propio en Python **más** una redundancia
  interna del archivo: `temp_report.htm` (que sale del principio del flujo) y
  `patient_exam_data.xml` (que sale del final) traen los mismos números, y coinciden en 10/10 de
  las mediciones cruzadas. Es evidencia fuerte, no es un tercero. Si algún día hay `7z`, correr
  `7z e` sobre el CHM y comparar el hash con el de TC-177 cierra el punto.

**Cuatro cosas del diccionario que NO son obvias y cuestan un error clínico silencioso:**

| Parámetro GE | Campo | Trampa |
|---|---|---|
| `EF(Biplane)_03` | `fevi` | **SIN el prefijo `2D/`**, aunque las otras medidas 2D lo lleven. Escrito con prefijo no matchea y la FEVI no se importa, sin ningún error. Lo cazó el cruce XML↔HTML, no la lectura. |
| `AR Vmax` | `ia_vmax_cw` | El GE manda **m/s** y ese campo de la app está en **cm/s** (lo dice su etiqueta). Directo, un jet de 3,18 entra como 3,18 cm/s. |
| `2D/IVSd` y las demás lineales | `siv`… | GE en **cm**, EcoSmart en **mm**. Un septum de 0,6 cm entra como 0,6 mm. |
| `2D/Pulmonic Diam` / `2D/Systemic Diam` | — | **Colisionan** con `RVOT Diam` / `LVOT Diam`: en el archivo real los cuatro están, con valores distintos. No se mapean. |

**La conversión NO está hardcodeada.** Se lee el `<unit>` que declara cada medición y el factor
sale de la tabla `ucum` del campo —la misma que usa el lector de SR—, así que un equipo
configurado en otra unidad convierte igual y una unidad desconocida **descarta** en vez de
suponer. Los campos que el SR no cubre traen su `ucum` y su rango en `CHM_MAPA` / `CHM_RANGO`;
**no se tocó `DCM_RANGO`** porque esa tabla la consume además el importador de Excel.

**Lo que a propósito NO se importa:** `vd_fac` y `Qp/Qs` (calculados: entran las áreas y las VTI
que los alimentan — el FAC que calcula la app coincide con el que publica el GE, y eso es parte
de TC-177); `patientId` como `ci` (es el número de historia, misma razón que en el SR:
envenena `_dupKeys`); `InstitutionName` como `centro_nombre` (ese control es un `<select>`
reconstruido desde la lista del usuario y **asignarle un valor sin `<option>` falla en silencio**
— está documentado más abajo). Los tres se **muestran** en la vista previa.

**`0.0*`.** El GE marca las mediciones inválidas con un asterisco pegado al número. `parseFloat`
devuelve 0 y un septum de 0 mm no es un faltante, es un hallazgo inventado: se exige que el texto
sea un número y nada más. Ojo al probarlo — **la primera versión del test pasaba sin la guarda**,
porque el 0 igual quedaba afuera por el rango. La condición que la fija usa un valor marcado
inválido pero **plausible** (`12.5*`), que es el único que distingue las dos defensas.

**SAFARI SIGUE SIN VERIFICARSE, en todo el módulo DICOM.** Ni el importador, ni el visor de
imágenes, ni el reproductor de cineloop se probaron nunca en Safari: en estas sesiones el
navegador está concedido a nivel «lectura» y no se puede manejar. Todo lo verificado corre en
Chrome vía CDP. El código no usa nada exótico —`arrayBuffer`, `Blob`, `FileReader`, `DataView`,
`createImageBitmap`, `canvas`— pero eso es un argumento, no una medición. Dos cosas a mirar
primero cuando se pueda: `createImageBitmap` sobre un `Blob` de JPEG (Safari lo soporta desde la
15, pero ignora `resizeWidth` en algunas versiones — acá no se usa) y que el modal del
reproductor no quede atrapado por el `overflow:hidden` del acordeón, que ya mordió antes.

**Sin PHI en el repo.** El CHM es de un paciente real y este repo es público: TC-177 y TC-178
leen el archivo del disco (`~/Desktop/*.chm` o `ECO_CHM=/ruta`) y **dicen que no corrieron** si no
está. Las conversiones se verifican contra el crudo del propio archivo (relación, no literal), y
lo único versionado es un SHA-256.

### Importar imágenes .dcm en la tab Imágenes (2026-09-19) — reemplaza al «visor pendiente»
Botón **🩻 Importar DICOM** en la tab Imágenes. Saca el JPEG que ya viene adentro del `.dcm` y
se lo entrega a **`imgCompressLoad`**, que es la misma puerta por la que entra una foto elegida
a mano o pegada con Ctrl+V. Por eso el selector de calidad, el `_orig` en memoria, el token
`_imgGen`, la persistencia en IndexedDB y la salida al PDF funcionan sin tocarse: **no hay un
segundo camino que pueda desincronizarse**.

**No hay ninguna librería, y es una decisión medida — no una omisión.** Los 274 `.dcm` del Vivid
iq que hay en el equipo son `1.2.840.10008.1.2.4.50` (JPEG Baseline) y el fragmento de píxeles es
un **JFIF estándar completo**: arranca en `FFD8`, trae su APP0 y `createImageBitmap` lo abre sin
ayuda, con las dimensiones exactas que declara el DICOM (verificado en TC-180). Cornerstone son
**2,78 MB** entre el bundle y su worker — un decodificador que el navegador ya tiene.
Decisión de Maicol (2026-09-19): las librerías quedan para el multi-frame y se bajarían **bajo
demanda**; las imágenes fijas no bajan nada y andan sin conexión.

Si alguna vez hace falta Cornerstone, los datos ya están verificados contra **dos CDN
independientes** (jsDelivr y unpkg dan bytes idénticos), y el `integrity` NO se puede poner en un
worker cargado por `fetch`+blob: hay que verificar el hash a mano con `crypto.subtle` antes de
ejecutarlo. Versiones reales y SHA-512:

| archivo | tamaño | sha512 |
|---|---|---|
| `dicom-parser@1.8.21/dist/dicomParser.min.js` | 32 KB | `ib39OnNMTCR2Kpiycx…` |
| `cornerstone-core@2.6.1/dist/cornerstone.min.js` | 92 KB | `Vz3JxG7+MpSVab9qNJ…` |
| `cornerstone-wado-image-loader@4.13.2/dist/cornerstoneWADOImageLoader.bundle.min.js` | 1,39 MB | `y3Ecm4OSRBS8F+R0S7…` |
| `…@4.13.2/dist/index.worker.bundle.min.worker.js` | 1,27 MB | `7vOSZ56MtkfsHloxar…` |

**Ojo con el nombre del worker:** `cornerstoneWADOImageLoaderWebWorker.min.js` es de la v3 y **da
404** en la 4.13.2; el archivo real es `index.worker.bundle.min.worker.js`.

### Cineloop — reproductor (2026-09-19)
Un `.dcm` multi-frame abre un **reproductor en modal** con slider, play/pause y «📸 Capturar
cuadro». El cineloop **no se guarda ni va al PDF**: va el cuadro que el médico captura, que entra
por `imgCompressLoad` como cualquier otra imagen.

- **Es un modal y no va adentro del slot, y el pedido decía adentro.** `imgRender()` reconstruye
  la grilla entera con `cell.innerHTML = …` en cada redibujo, y la llaman `imgSetCount`,
  `imgAddSlot`, `imgSwap`, `imgRemove` e `imgSetCalidad`. Un canvas dentro de una celda lo borra
  el primer redibujo, con el reproductor andando y **sin ningún error a la vista**. Sostenerlo
  exigiría modificar `imgRender`, que estaba fuera de alcance. El modal además da lugar al slider,
  que en una celda de 150 px no entra.
- **No se escribe nada en el slot hasta capturar.** Poner el cuadro 0 «por las dudas» sería lo
  contrario de lo pedido: el PDF saldría con un cuadro que nadie miró.
- **Los cuadros NO se predecodifican.** Se guardan los JPEG comprimidos y se decodifica el que se
  muestra. Medido: `createImageBitmap` tarda **2,0 ms** a 1016×708, contra un presupuesto de
  17,9 ms en el loop más rápido. Predecodificar 172 cuadros a RGBA serían ~495 MB para nada.
- **La compuerta es «más de un cuadro», NO «más de un cuadro Y SOP Class de US Multi-frame».**
  Exigir las dos cosas rechazaría en silencio un multi-frame legítimo con otra SOP Class —un
  Secondary Capture multicuadro—, que es justo el caso para el que esto tiene que servir cuando
  llegue un Philips o un Canon. La SOP Class se muestra, no decide.
- **Se exige un fragmento por cuadro.** En los 22 del pendrive se cumple siempre y el BOT
  coincide, pero el estándar permite repartir un cuadro en varios fragmentos y ahí hay que leer
  la tabla para saber dónde empieza cada uno. No hay archivo así con qué probarlo: se rechaza
  con el motivo. Adivinar mal el reparto **no da error** — muestra cuadros mezclados, que no se
  ven como una falla sino como un eco raro.

**LA VELOCIDAD SALE DEL ARCHIVO, y los «25 fps por defecto» del pedido son falsos para estos
archivos.** `FrameTime` (0018,1063) está declarado en los 22 y va de **17,86 ms (56 cuadros/s) a
78,37 ms (12,8 cuadros/s)**. Reproducir todo a 25 muestra el de 56 a menos de la mitad de
velocidad y el de 12,8 al doble — y en un eco **la velocidad con la que se mueve la pared es parte
de lo que se está mirando**. Los 25 fps quedan como último recurso, sólo si el archivo no declara
nada, y la interfaz dice cuál se está usando y de dónde salió.

**Lo que hay que no romper nunca: capturar tiene que guardar el cuadro que se está viendo.** Un
reproductor que navega bien pero captura el cuadro 0 se ve perfecto en pantalla y mete en el PDF
una imagen que nadie eligió. TC-182 lo fija comparando el `_orig` del slot contra el cuadro N
decodificado por afuera, y exigiendo que difiera del cuadro 0. La mutación que captura el 0 lo
pone en rojo.

**Al comparar cuadros, mirar el CENTRO.** La primera versión de TC-182 muestreaba los 200×200 de
arriba a la izquierda: en un eco eso es fondo negro, el cuadro 0 y el del medio salían idénticos
y la condición «no se quedó en el cuadro 0» pasaba sin probar nada. Hoy muestrea el centro **y
además afirma que los dos cuadros comparados son distintos**, que es el denominador.

### Regla sobre la imagen (2026-09-20)
Botón **📏 Medir** en el visor. Las mediciones son **sólo para ver en pantalla**: no se guardan,
no viajan al estudio y **no salen en el PDF**.

**LA ESCALA SALE DEL ARCHIVO, y la premisa del pedido era falsa donde importaba.** Decía que el
Vivid no trae escala porque `PixelSpacing` (0028,0030) está ausente — y es cierto que ese tag no
está, pero en ecografía la escala **nunca** va ahí: va en **(0018,6011) Sequence of Ultrasound
Regions**. Medido sobre los 296 archivos del pendrive:

| | |
|---|---|
| **281 regiones `cm × cm`** (tejido 2D y color), con `PhysicalDeltaX == PhysicalDeltaY` | ahí una línea SÍ es una distancia, y la escala la escribió el equipo |
| **157 regiones `seg × cm/s`** o `seg × cm` (Doppler espectral) | el eje horizontal es **tiempo**: una «distancia en mm» ahí no significa nada |
| **142 archivos con 2 o 7 regiones** | cada una con su rectángulo y su escala |
| escala 2D de **0,046 a 0,926 mm/píxel**, 33 valores distintos | **no es una constante del equipo**: cambia con la profundidad de cada adquisición |

Calibrar a mano sobre una escala de ~37 px/cm con ±2 px de pulso son ~5 % — **±2 mm en una raíz
aórtica de 40**. Por eso la calibración manual quedó como **respaldo** (15 archivos sin región, y
otras marcas) y como override con «Recalibrar», no como camino principal. Decisión de Maicol
(2026-09-20). La barra dice siempre cuál de las dos escalas está usando.

**Dónde NO se mide:** sobre una región de Doppler espectral se avisa que el eje horizontal es
tiempo y no se dibuja nada; y no se mide entre dos puntos con **escalas distintas**.

> **Ojo con esa guarda: compara ESCALAS, no identidad de regiones.** La primera versión comparaba
> identidad y parecía lo prolijo — hasta que se midió: en los 296 archivos **ninguno** tiene dos
> zonas medibles con escalas distintas, porque el recuadro de color se superpone al 2D **con la
> misma escala**. O sea que comparar identidad bloqueaba «medir del 2D al color», que es
> frecuente y perfectamente válido, y no prevenía nada real. Hay una condición para cada lado.

**El clic llega en píxeles de PANTALLA.** El canvas se muestra escalado por CSS (`max-width:100%`),
así que usar `offsetX` directo da una medición **que cambia con el tamaño de la ventana**: un
número prolijo y equivocado. Se divide por `cv.width / rect.width`. Está fijado con una condición
que mide la misma línea con el canvas a 240 px y a tamaño completo.

**Al probar: separar la aritmética del clic.** `MouseEvent.clientX` es **entero por
especificación**, así que el viaje imagen → pantalla → imagen pierde subpíxeles (~0,2 % con el
canvas a 0,4×). La primera versión de TC-187 comparaba los milímetros contra los 200 px que
*quería* marcar y daba rojo por esa cuantización, que un clic real también tiene. Hoy la
aritmética se verifica **contra la línea realmente dibujada** —exacta a 1e-9— y el mapeo del clic
se mide aparte, con la tolerancia derivada de la escala, no elegida a dedo.

**Nada del reproductor se modificó** salvo agregarle el botón: la regla vive en su propio canvas
superpuesto y se entera de los cambios observando `#cine-num` (cuadro), `#cine-cual` (otro
cineloop) y el `display` de `#cine-ov` (cierre). Al cambiar de cuadro se borran las mediciones
pero **se conserva la calibración manual**: es una propiedad de la imagen, no del cuadro.

### Tiempo y frecuencia cardíaca (2026-09-20)
Dos herramientas más: **⏱️ Tiempo** (intervalo en ms — TDE, TRIV, tiempo de aceleración) y
**💓 FC** (RR en ms + `60.000/RR` en lpm).

**Son la misma medición con dos lecturas, y por eso son DOS herramientas y no una que adivine.**
Mostrar «FC 227 lpm» al lado de un TDE de 264 ms sería ruido; y esconder la FC con una
heurística de plausibilidad sería peor, porque **264 ms cae de lleno en el rango de un RR
creíble**. La intención la declara el médico eligiendo la herramienta.

**La compuerta del tiempo NO es la de la velocidad**, y la asimetría es real:

| | eje X | eje Y | velocidad | tiempo |
|---|---|---|---|---|
| Doppler espectral | segundos | cm/s | **sí** | **sí** |
| Modo M | segundos | **cm** | no | **sí** |
| 2D / color | cm | cm | no | no |

**El tipo de región no sirve como filtro.** De las 157 regiones con eje X en segundos del
pendrive, **19 están declaradas «tissue 2D» y 6 «color flow»** — son tiras de modo M y de modo
M color. El `RegionDataType` dice qué se está imaginando; las **unidades** dicen qué son los
ejes. Filtrar por tipo perdería 25 regiones donde el tiempo se mide perfectamente.

**Sólo cuenta la separación horizontal**, y por eso se dibuja como **llave horizontal** y no
como una recta entre los dos clics: una línea inclinada sugeriría que la altura participa.

**El ancho temporal del trazo va de 56 a 3997 ms.** En una tira de 56 ms no entra ningún RR,
así que la FC se muestra **siempre junto al intervalo que la produjo**: con el intervalo a la
vista, un valor imposible se nota.

> **Tres condiciones nacieron sin valor acá, todas por el mismo motivo — el denominador.**
> La de «sólo cuenta lo horizontal» clicaba los dos puntos a la **misma altura**, así que la
> distancia euclídea y la horizontal coincidían. La del filtro por unidades usaba una región
> sintética que **heredaba el tipo espectral**, o sea justo el caso que el filtro por tipo
> acepta igual. Y la del punto colgado rechazaba el **primer** clic, con la lista ya vacía.
> Las tres las delataron mutaciones que sobrevivían.

### Velocidad sobre Doppler espectral (2026-09-20)
Cuarta herramienta. Clic en el pico → velocidad en cm/s y m/s, y gradiente por Bernoulli
simplificada **ΔP = 4·V²** con V en m/s. Es lo inverso de la regla: ahí el Doppler se bloquea,
acá es lo único donde se mide.

**La compuerta NO es «es Doppler», es «el eje Y está en cm/s».** Medido: de las **157 regiones
espectrales** del pendrive, **25 tienen el eje Y en CENTÍMETROS** — son trazos de **modo M**,
distancia contra tiempo. Ahí «velocidad» devolvería una distancia con nombre de velocidad, y el
número saldría igual de prolijo. Cada rechazo dice **cuál** es el motivo: sobre 2D manda a usar
📏, sobre modo M explica que el eje está en centímetros.

**De dónde sale el cero.** Del **píxel de referencia** (0018,6022) y su valor físico
(0018,602A). Verificado: los 132 regiones de velocidad del pendrive lo traen, y el valor físico
es **0 en las 132**. La velocidad es `rvy + (y − ry0)·dy`, y el **signo sale del archivo**:
`PhysicalDeltaY` es negativo en las 132, o sea que arriba de la línea es positivo. No se asume.

- **La línea de base cae FUERA del recuadro visible en 65 de 132.** Es normal —un trazo CW
  mostrado entero hacia abajo— y por eso el dibujo traza una punteada del punto hasta el cero:
  sin ella el número parece salir de la nada. Y por eso tampoco sirve ninguna heurística del
  tipo «el cero está en el medio de la región».
- **`PhysicalDeltaX` está en SEGUNDOS, no en ms** (0,004632 s/px en el ejemplo). El pedido decía
  ms.
- **(0018,6022) tiene VR = SL, o sea CON SIGNO.** Leerlo sin signo convierte un −25 en
  4.294.967.271 y la velocidad sale absurda en vez de fallar. En el pendrive el mínimo es 10
  —ninguno negativo— así que **no es alcanzable con los archivos de hoy**; es legal igual, y la
  guarda se prueba sobre el parser con bytes armados a mano. Sin eso, la mutación que lee SL
  como UL sobrevivía.

**Cómo se verifica una velocidad sin poder leer la escala dibujada:** por el píxel de referencia.
Ahí tiene que dar **exactamente cero**, y desde ahí la escala es lineal — N píxeles son N·dy.
Las dos cosas se afirman con exactitud contra los metadatos, sin depender de OCR ni del ojo.

### Simpson biplano en el visor (2026-09-20)
Tercera herramienta: cuatro trazados guiados (4C diástole, 4C sístole, 2C diástole, 2C sístole)
→ VFD, VFS y FEVI. **No va al PDF.**

**Fuente: Lang et al., ASE/EACVI 2015** (J Am Soc Echocardiogr 2015;28:1-39). Se leyó el PDF
completo. **Tres cosas del pedido contradecían la guía:**

| Pedido | Lang 2015, textual |
|---|---|
| «L = eje largo **promedio**» | *"The use of the **longer** LV length between the apical two- and four-chamber views is recommended."* |
| «**Detectar** el eje largo (punto más apical)» | *"At the mitral valve level, the contour is closed by connecting the two opposite sections of the mitral ring with a straight line. LV length is defined as the distance between the **bisector of this line** and the apical point of the LV contour, which is most distant to it."* |
| «Leve 41-51» para ambos sexos | Tabla 4: hombres 41-51, **mujeres 41-53**. Con el corte del pedido, una mujer con 52-53 % queda **sin categoría** |

El ápex **se deriva** de la recta del anillo mitral, no se adivina: por eso el trazado tiene que
empezar y terminar en el anillo. Con la cuerda más larga del contorno, un VI dilatado o un trazo
descuidado eligen un eje que no es el ápex-base y el volumen sale mal **sin síntoma**. La guía
además lista *"Apex frequently foreshortened"* como la limitación propia del método, y el panel
lo dice.

**LA CLASIFICACIÓN USA `UMBRAL_FEVI_NORMAL` (50), NO LA TABLA 4, Y ES A PROPÓSITO.** Esa
constante gobierna el informe firmado. Con los cortes de la guía, un hombre con 51 % sería
«leve» en el visor y «normal» en el informe **sobre el mismo número** — el defecto que ya pagó
la PSAP y que documenta la nota de `UMBRAL_PSAP_ELEVADA`. Decisión de Maicol (2026-09-20): una
sola clasificación. Si algún día se adopta la de la guía, **se cambia la constante y cambia todo
junto**, no sólo el visor.

> Dato para esa discusión, del propio documento: el texto principal dice *"EF is not
> significantly related to gender, age, or body size… EF in the range of 53% to 73% should be
> classified as normal"* — un rango **único**, en tensión con su propia Tabla 4 por sexo.

**EL BIPLANO ERA INALCANZABLE, y se arregló el 2026-09-20 (segundo pase).** La apical 4C y la
2C son **adquisiciones distintas**, o sea cineloops distintos: el médico tiene que cambiar de
imagen entre el primer par y el segundo. Y al cambiar, el observador de `#cine-cual` llamaba a
`medApagar()`, que dejaba `_simp` en `null` — se perdían los dos trazados confirmados y los
cuatro pasos no se completaban **nunca**. O sea: el biplano estaba escrito, probado… y no se
podía usar. Hoy hay dos funciones distintas:

- **`medCambioDeImagen()`** — otro cineloop en el mismo visor. Borra reglas, áreas y la
  calibración manual (son de la imagen que se deja) y **conserva la sesión de Simpson**.
- **`medApagar()`** — se cerró el visor. Ahí sí se va todo, `_simp` incluido.

> Lección: una función puede estar completa, testeada y con sus mutaciones en rojo, y aun así
> ser **inalcanzable por el flujo real**. Los tests de Simpson trazaban las cuatro vistas sobre
> el mismo cineloop, que es lo único que se podía hacer en un test — y eso es justamente lo que
> nunca pasa en la práctica.

**Cada trazado lleva la escala de SU imagen.** Segundo defecto, que sólo se volvió alcanzable al
arreglar el primero: `_simpCalcular` usaba un solo `cmPorPx` —el del primer trazado— para los
cuatro. Mientras las dos vistas estaban obligadas a compartir cineloop daba igual; con dos loops
de profundidades distintas, no. Medido: la escala 2D del pendrive va de **0,046 a 0,926 mm/píxel**.
Hoy se guarda `diamCm` y `Lcm` por trazado. `diam` en píxeles queda sólo para dibujar.

**Si los cuatro trazados salen de la misma imagen, se avisa.** La app no sabe distinguir una 4C
de una 2C —eso lo sabe el médico— pero sí sabe si el archivo es el mismo, y eso es casi siempre
un monoplanar trazado dos veces.

**Pendiente: la vista en paralelo.** Dos cineloops lado a lado con reproductores y herramientas
independientes exige convertir en instancias **13 estados globales, 18 referencias a ids fijos,
2 MutationObservers y el listener de `mouseup` en `document`**. Es una refactorización del visor,
no un agregado. Decisión de Maicol (2026-09-20): primero este arreglo, que desbloquea el biplano
hoy; el panel doble y la sincronización van sobre una base que ya funciona.

**FLUJO FLEXIBLE (2026-09-20).** Con **un par** —diástole y sístole de la misma vista— ya sale
**FEVI monoplanar**; agregando la segunda vista se recalcula **biplano**. Antes exigía las cuatro
y era un problema real: con una sola vista buena no se podía medir nada.

**Monoplano y biplano no son lo mismo, y la interfaz lo dice.** La guía recomienda el biplano
para el VI —*"the biplane method of disks summation… is the recommended 2D echocardiographic
method by consensus of this committee"*— y **no describe un monoplano para el ventrículo**: sus
pasajes de *"single-plane"* son de la **aurícula**. Además los valores normales se midieron
*"using the biplane method of disks"*, así que clasificar un monoplano con esos cortes es una
extrapolación. El panel lo dice en lugar de disimularlo.

**Integrar al informe: SÓLO el biplano, y no es capricho.** El campo `fevi_met` de la app tiene
exactamente tres opciones — «Simpson biplano», «Teicholz», «Visual»—. **No hay monoplano.**
Integrarlo lo rotularía «Simpson biplano» en un documento firmado, que es nombrar mal el método.
El panel explica por qué en vez de sólo no ofrecer el botón. Al integrar se escribe `fevi` y se
fuerza `fevi_met`, y **no se pisa un valor ya cargado sin preguntar** — mismo criterio que el
importador DICOM con su «Este estudio ya tiene X guardado».

**Simpson es la única medición que NO se borra al cambiar de cuadro**, y tiene que serlo: la
diástole y la sístole están en cuadros distintos, así que borrar lo confirmado haría imposible
completar la medición. Lo que sí pasa al reproducir o mover el slider es que **se deja de
dibujar** (`_simp.ocultar`): un contorno de diástole encima de un cuadro de sístole invita a
creer que se trazó sobre esa imagen. **Ocultar no es borrar** — sigue contando para el cálculo, y
hay una mutación que lo verifica (borrar de verdad pone el caso en rojo).

**Se rechaza si los píxeles no son cuadrados.** Los diámetros de los discos se miden en
direcciones cualesquiera y un solo factor no alcanza con `dx ≠ dy`. Ninguna región real es así;
ante una que lo sea, es preferible no calcular que calcular mal.

**Cómo se probó un número clínico:** triángulos, que tienen volumen de Simpson **analítico**
—`Σ(a_i·b_i) = W4·W2·6,6625`, con la constante saliendo de `Σ(i+0,5)² = 2665/400`—. Con 4C
200×300 y 2C 180×300 en diástole y 120/108 en sístole, la **FEVI da exactamente 64 %**
(`1 − 12.960/36.000`), y eso sólo sale si `a_i` y `b_i` se **multiplican**. Dos trampas del test:
la serie para probar «L la más larga» usaba H=400 y el ápex **se salía de la región** —el
trazado se rechazaba, no se calculaba nada y la condición daba «0,0 ≠ 0,0», que se leía como un
fallo de L; hoy se afirma primero que hubo resultado—. Y la condición de clasificación **no
distinguía nada**: la FEVI trazada es 64 %, «normal» con 50 y con 52. La franja que importa es
**50–51,9** y se prueba llamando a la función directo.

### Área por trazado libre (2026-09-20)
Selector **📏 Distancia / ✏️ Área** en la barra de medición. Con Área, se mantiene apretado y se
recorre el borde: al soltar, el contorno **se cierra solo** y sale el área en cm². Mismas reglas
que la regla — escala del archivo, nada sobre Doppler, nada cruzando escalas — y lo mismo al
cambiar de cuadro: se borra.

**El área usa `dx × dy`, no `dx²`.** Hoy da idéntico —las 281 regiones medibles del pendrive son
isotrópicas— pero el estándar permite píxeles anisotrópicos y entonces `dx²` estaría mal. Por la
misma razón la **distancia** pasó a calcularse por componente. Las dos cosas están pinneadas con
una región anisotrópica armada a mano, porque no hay ningún archivo así con qué probarlo.

**Cuatro trampas de esta herramienta, todas encontradas por mutación y todas silenciosas:**

- **Sin `Math.abs`, Shoelace devuelve el área con SIGNO** según el sentido del trazado. Un
  contorno recorrido al revés mostraría «−14,83 cm²». El primer test trazaba el rectángulo en un
  solo sentido y no lo cazaba; hoy traza los dos.
- **Una tolerancia sin fundamento es un agujero.** La condición geométrica usaba una tolerancia
  18× mayor que el error real —176 px² sobre 20.000, medido— y por eso dejaba pasar una mutación
  que se comía el último lado del polígono (error ~1.940 px², casi 10 %). Hoy la tolerancia es
  `q × perímetro`, derivada de la cuantización, no elegida a dedo.
- **Un `mouseup` sintético NO genera `click`.** El navegador sólo emite `click` para secuencias
  de entrada reales, así que un arrastre simulado sin `click` explícito **no se parece al de
  verdad** y dejaba sin probar la guarda que apaga la regla en modo Área. Sin esa guarda, cada
  contorno deja además un punto de regla fantasma, porque el `mouseup` de un arrastre dispara un
  `click`.
- **El `mouseup` se escucha en el `document`, no en el canvas.** Al recorrer un borde se suelta el
  botón fuera de la imagen todo el tiempo; enganchado al canvas, el trazo quedaba abierto siguiendo
  al mouse para siempre.

**Lo que NO se detecta, y conviene saberlo:** un contorno que **se cruza a sí mismo**. Shoelace le
resta las partes solapadas, así que una figura en ocho devuelve **menos** área que la real, sin
ningún síntoma. En la práctica el error de un trazo a mano son slivers despreciables, pero si
alguna vez hay que medir un contorno complicado, es lo primero a revisar.

### Medir una imagen fija (2026-09-20)
Botón **📏 Medir** en la tab Imágenes. Con el modo activo, tocar un slot con una imagen
importada de un DICOM la abre **en el visor, con el original**; una foto común avisa que no
tiene escala; un slot vacío se ignora.

**Por qué no se mide sobre el slot:** ese JPEG está recomprimido **y redimensionado**
(800×600 en calidad media), así que `PhysicalDeltaX` ya no le aplica. Medir ahí daría un número
equivocado **sin ningún síntoma**. TC-188 lo fija comparando las dimensiones de lo que abre el
visor contra las que declara el archivo, y muere si alguien lo cambia para abrir el slot.

**Qué se guarda, y por qué NO el archivo entero como pedía el punto 4.** Medido sobre las 274
fijas del pendrive: **el JPEG es el 3,1 % del archivo** — 143 KB contra 4,5 MB de media.
Guardar los `.dcm` completos serían **1.223 MB contra 38 MB**, 32 veces más para exactamente la
misma capacidad de medir, y volvería a poner en disco el `PatientName`, el `PatientID` y la
institución en claro, que es lo que se sacó el 2026-09-19. Se guarda el cuadro y las regiones,
en `CeiboCine` con `tipo:'fija'` — misma base, mismo recolector de huérfanos, misma cuota.

**Cómo se ata al slot, y qué NO sobrevive.** El id vive **dentro** del objeto del slot
(`_dcmId`), no en una estructura paralela indexada por posición: `imgSwap` intercambia objetos
enteros y `imgRemove` anula el slot, así que un paralelo terminaría abriendo el original de
**otra** imagen. Es la misma razón por la que `_orig` vive ahí.
Pero `CeiboImg.guardar` persiste una lista blanca explícita —`{dataURL, ampliada, calidad}`— y
ese diseño es deliberado, así que **el vínculo con el slot NO sobrevive a reabrir el estudio**.
Lo que sí sobrevive es la imagen: aparece en la tira marcada como «imagen fija» y se mide desde
ahí. Decisión de Maicol (2026-09-20). Si alguna vez se quiere que el slot siga andando tras
reabrir, alcanza con sumar `_dcmId` a esa lista blanca — es una palabra y no viola su motivo,
que es el tamaño.

**Nada de `imgRender` se tocó.** El realce y el cursor salen de una regla CSS colgada de una
clase en `#img-grid`, y el clic se escucha **por delegación** en el contenedor, que sobrevive a
los repintados — las celdas no. El id se ata al slot desde el mismo `MutationObserver` de
`#img-grid` que ya sincroniza la tira, porque `imgCompressLoad` crea el slot dentro de su
`.then()` y no existe cuando se reserva el índice.

**Semgrep: la línea base pasó de 125 a 126** (el `innerHTML` del aviso del modo medición, todo
literales). Al mutar, ojo con una trampa: cambiar `cols`/`filas` **no** sirve como mutación de
«abrir el slot en vez del original», porque `cineIr` redimensiona el canvas según el bitmap
decodificado y pisa el metadato. La mutación fiel tiene que pasarle los bytes del slot.

### El visor es un conjunto de VISTAS, no un singleton (2026-09-20)

Reemplaza al panel B de sólo visualización de la entrada de abajo, que se conserva porque sus
lecciones sobre la sincronización siguen valiendo. Hoy hay dos instancias completas: cada una
con su imagen, su canvas de medición, su reproductor y **las seis herramientas**.

**CÓMO SE HIZO SIN REESCRIBIR 2.000 LÍNEAS.** El módulo tenía trece `let` de nivel superior
—`_medPuntos`, `_simp`, `_cineDatos`…— leídos y **escritos** desde unas cincuenta funciones.
Renombrarlos a `V.algo` en cada sitio es el barrido masivo que este archivo ya documenta
habiendo costado tres campos ajenos con el `_vel` → `_veloc`. En su lugar los nombres viejos
pasaron a ser **propiedades de acceso** que resuelven contra la vista activa (`_V`): el cuerpo
de esas cincuenta funciones no cambió **ni un carácter** y sigue diciendo `_medPuntos.push(p)`.
Es la sombra de `tgaConclusion` escalada — o toda la función lee de la vista, o no compila.
**Los ids de la vista A siguen sin prefijo** (`cine-cv`, `cine-med`, `cine-num`) a propósito:
así «una sola vista se comporta igual que antes» es verificable hasta en el DOM, y los 209
casos que ya apuntaban ahí siguieron midiendo lo mismo. La segunda vista lleva `b-`.

**`_V` ES AMBIENTE, Y ÉSA ES LA ÚNICA TRAMPA QUE IMPORTA.** Tres formas de pisarla, y las tres
hay que respetarlas al tocar esto:

1. **`async`.** Una función que hace `await` puede despertarse con otra vista activa. `cineIr`
   captura `const V = _V` **antes** del `await` y usa `V.` después. Sin eso, el decodificado de
   la B vuelve mientras la A está activa y se dibuja el cuadro de una en el canvas de la otra
   — que se ve como un eco raro, no como un error.
2. **`setInterval` y `MutationObserver`.** Corren fuera de todo contexto: los dispara el
   navegador, no un clic. Van envueltos en `_vCon(V, …)`.
3. **Los manejadores del canvas, y ésta la cazó el caso, no la lectura.** Atar
   `cv.onclick = _medManejador()` parece correcto —el manejador cuelga del canvas de esta
   vista— y no lo es: `_medClic` resuelve su canvas y su estado contra la vista activa **en el
   momento del clic**, que por omisión es la A. Medido: un clic sobre la vista B escribía la
   regla en la A, con el número calculado con la escala de la A, y desde la pantalla se veía
   como que el clic «no hizo nada». Van con `_vBind(V, …)`.

**EL `mouseup` DEL DOCUMENTO SE INSTALA UNA SOLA VEZ.** Se escucha en el documento porque al
recorrer un borde se suelta el botón fuera de la imagen todo el tiempo; y el documento es
**uno** para las dos vistas. Con `addEventListener` de la misma función desde las dos,
apagar la medición en una lo quitaba para las **dos** y el área de la otra quedaba muerta sin
ningún síntoma. Hoy hay un oyente único que despacha a `_vArrastre`, la vista que empezó el
arrastre — sin esa marca, soltar sobre la B cerraría el contorno de la A.

**EL BIPLANO ENTRE VISTAS NO REIMPLEMENTA NADA.** `_vBiplanoDatos` toma el par de cada
instancia y llama a `_simpVolumenML` y `_simpClasificar`, las mismas de una sola vista. Y
`_simpEscribirFEVI` se extrajo para que las **dos** vías de integración —la sesión de una
vista y el cruce A × B— compartan la regla de no pisar un valor cargado sin preguntar: con dos
copias, una podría pisarlo y la otra no, sobre el mismo campo del informe firmado.

**`_simp.trazos` NO EXISTE.** La estructura real es `_simp.pares[vista][fase]`. Escribí
`_vBiplanoDatos` contra el nombre inventado y habría devuelto `null` para siempre, en
silencio: nunca habría salido un biplano y no habría habido error que mirar. Lo cazó ir a leer
la estructura antes de confiar en ella. **Un campo inventado no falla, calla** — por enésima
vez, y acá con la agravante de que el modo de falla era «la función que acabás de escribir
nunca hace nada».

**LO QUE EL BIPLANO ENTRE VISTAS AGREGA ES VERLAS JUNTAS, no hacer posible lo imposible.** La
sesión de Simpson sobrevive al cambio de imagen desde antes, así que el biplano ya se podía
completar con una sola vista cambiando de cineloop. Conviene saberlo antes de estimar el valor
de una refactorización de este tamaño.

**MUTACIONES: cinco verificadas, tres NO.** Caen donde les toca el manejador atado sin su
vista (hay que sacar `_vBind` de los DOS sitios —`medToggle` y `medHerramienta`— porque
revertir uno solo es un no-op, igual que la guarda duplicada de la sincronización), el biplano
con una sola escala para los cuatro trazados, la sincronización copiando el índice, la
etiqueta volviendo al cm/s con signo, y la calibración ignorando la línea de base.
**Quedaron sin verificar** las de «cerrar la vista B no saca su panel», «el observador de la B
corre en la A» y «se ofrece calibrar aunque el archivo traiga escala»: el pendrive se desmontó
a mitad de sesión y sin él los casos que dependen de archivos reales reportan «sin verificar»
—el primer intento de la de cerrar la vista B dio rojo **por el fixture ausente y no por la
mutación**, que es el falso positivo contra el que este archivo ya advierte—. Se completan
volviendo a montar `/Volumes/DISK_IMG`.

Lo de la calibración sobre modo M igual tiene evidencia más fuerte que una mutación: **el
defecto ocurrió de verdad** durante el desarrollo —la condición amplia era mi primera versión—
y TC-193 se puso en rojo solo.

**Sin verificar en Safari**, como todo el módulo DICOM: el navegador está concedido a nivel
«lectura». Todo corrió en Chrome por CDP, con el pendrive montado.

### El visor en cinco zonas, y el strain que NO se guardaba en ninguna parte (2026-09-20)

Dos trabajos en un commit porque quedaron entrelazados en el mismo archivo: el rediseño de la
interfaz del visor y la persistencia del strain manual.

#### TIEMPO Y FC NO VAN EN «2D» — las compuertas son mutuamente excluyentes

El diseño pedía Distancia, Área, Simpson, **Tiempo y FC** bajo «2D», y Velocidad sola en
Doppler. `_dcmImgRegionMedible` exige `ux === 3` (cm) y `_dcmImgRegionTiempo` exige `ux === 4`
(segundos): **el mismo campo no puede valer las dos cosas**. Bajo «2D», Tiempo y FC devolverían
«esta imagen no tiene ningún trazo con el eje horizontal en tiempo» sobre TODA imagen 2D — el
menú prometiendo lo que la herramienta no puede hacer ahí. En el censo del pendrive son 281
regiones 2D contra 157 con el eje X en segundos, **sin un solo solapamiento**. Los tres van
juntos en «Doppler / M». Decisión de Maicol.

**`_MED_HERRS` es la fuente única** —rótulo, grupo, tooltip e id— y la barra lateral se genera
de ahí. Con dos listas, agregar una herramienta a una vista y no a la otra es cuestión de
tiempo.

#### Dos controles que nacían muertos, y el caso no los veía

- **La barra lateral se pintaba sólo desde `_medEstado`**, que únicamente corre con la medición
  encendida: la zona 2 nacía vacía y las nueve herramientas eran inalcanzables hasta apretar
  «Medir». Se pinta también al cablear.
- **Y un botón de herramienta con la medición apagada no hacía nada.** Antes no era alcanzable
  —las herramientas vivían dentro de la barra, que aparecía con la medición ya encendida— y con
  la lateral siempre visible pasa a serlo. Elegir una herramienta **enciende** la medición.
  «Visible, clicable, sin ningún efecto» es como este archivo describe los siete acordeones
  rotos de Congénitas.

#### Mover el input de etiqueta ELIMINÓ un sink en vez de mitigarlo

Estaba dentro de la barra, que se reconstruye por `innerHTML` en cada medición, así que su
valor se reemitía por un **atributo** y había que escaparlo —y se perdía el foco a mitad de una
palabra—. Ahora es estático y su valor se lee y escribe como **propiedad**: el atributo ya no
existe. **TC-202 se puso en rojo y ésa es la señal**: su condición verificaba que en el marcado
apareciera `&quot;`, o sea el mecanismo de escape, no el invariante. Hoy fija lo más fuerte —el
veneno no aparece en el marcado **en ninguna forma**— y sigue cazando la regresión de volver a
interpolarlo.

#### El strain manual no se guardaba en NINGUNA parte

El pedido del módulo de Laboratorio partía de «los valores de strain manual viven en los
estudios guardados en IndexedDB». **Falso, y de forma terminante**: `_strain`, `_lars` y `_vd`
son propiedades en memoria de la vista, `medApagar` las pone en `null` al cerrar el visor, y no
había **una sola** escritura a `campos`, a `CeiboStore` ni a IndexedDB. Lo decía el propio
módulo desde la primera herramienta —«no se guardan, no viajan al estudio»— y lo verifican
condiciones de TC-204 y TC-205. (`campos['strain_sgl']` es el bull's eye de 17 segmentos **del
informe**, otra cosa.) Construido tal cual, el módulo habría sido una tabla sin filas, un
Bland-Altman que nunca llega a diez puntos y un Excel con encabezados y nada debajo.

**Se guardan SÓLO LOS RESULTADOS**, unos veinte números, no los contornos. Decisión de Maicol:
alcanza para la tabla, el Bland-Altman y el Excel; las listas de puntos serían decenas de KB de
anatomía del paciente en el registro y en cada backup para redibujar algo que ya se decidió no
reabrir.

**Vive en `campos['strain_manual']` vía un `<input type="hidden">`** — el patrón de
`co_serie_json` y `hfaicos_manual`: viaja con el estudio porque `guardarInforme` barre
`input[id]`, y lo repone la restauración sin una línea nueva.

**⚠️ Y SE LIMPIA A MANO.** El barrido de `limpiarCampos` toma `input[type=text]` e
`input[type=number]`: un `hidden` no entra. Sin esa línea, las mediciones del paciente anterior
quedan DENTRO del estudio del siguiente — es la fuga de `ete_tavi_jet_horas`, y la mutación que
la reintroduce cae por dos condiciones de TC-206.

**Guardar no es integrar.** El strain manual sigue sin tocar `sgl`, sin salir en el PDF y sin
aparecer en el documento firmado: se guarda como MEDICIÓN del estudio. Los tres paneles siguen
diciendo «no se integra al informe firmado» porque sigue siendo cierto, y hay una mutación —la
persistencia escribiendo además `sgl`— que lo vigila.

**Si no hay mediciones NO se pisa lo guardado**: abrir el visor sin medir no puede borrar el
strain de otra sesión. Es una condición propia, porque el modo de falla sería mudo.

### Strain de pared libre del VD, y el caso que probaba su propia copia (2026-09-20)

Tercera variante del método de contornos manuales. Fuente: ASE 2025 corazón derecho
(Mukherjee/Rudski, JASE 2025;38(3):141-186) — **la misma guía que esta app ya cita** para la
función diastólica del VD, así que el corazón derecho queda con una sola referencia.

**EL SEPTO NO ENTRA, y no es redacción.** «Strain de pared libre» y «strain global del VD» son
magnitudes distintas: el global promedia pared libre y septo y da valores **menos negativos**.
Publicar uno con los cortes del otro es comparar contra la tabla equivocada. Se dice en el paso
y en el descargo.

**LOS UMBRALES SON POR SEXO y salen del campo `sexo` del estudio** —más negativo que −20 % en
hombres, que −21 % en mujeres—. **Sin sexo consignado NO se clasifica**: se muestran los dos
cortes y se dice cuál falta. Suponer uno cambiaría el veredicto de un paciente en la franja de
−20 a −21 sin que nadie lo haya decidido. Es la regla del `coa_diast_anterogrado`: un campo
vacío no es una respuesta. El campo sólo se **lee**; no se escribe nada del informe.

**⚠️ EL SENTIDO DE LA DESIGUALDAD, en palabras y nunca con el operador solo.** «Normal si es más
negativo que −20 %» quiere decir que −25 es normal y −18 no. Escrito «< −20 %» es correcto y se
lee al revés — este archivo documenta la leyenda de `#ref-cardiotox`, que decía «disfunción
subclínica: <-16%» y leída literal significaba lo contrario.

**`_contornoLargo` se extrajo para que no haya una tercera copia de las mismas tres guardas.**
El LARS y el VD sólo necesitan la compuerta 2D, la guarda de píxeles cuadrados y `bordeCm`; el
eje largo lo necesitan Simpson y el strain del VI, no éstos. Con tres copias, la que se quede
sin la guarda de isotropía mide mal sin ningún síntoma.

#### El caso probaba su propia copia de la regla — y la peor mutación sobrevivía

Mi primera versión de TC-205 tenía un helper `clasificar(pct, sexo)` que hacía `pct < umbral`
**por su cuenta**. O sea: una **copia paralela de la regla que el caso venía a probar**. La
mutación que **invierte la desigualdad** del código —la más peligrosa de todas, porque deja a
−18 leyéndose como normal— pasaba **entera en verde**.

Hoy se le pregunta a `_vdCalcular`. Los trazos se arman trazando de verdad y después se les
fija `bordeCm` al valor exacto que hace falta: la estructura es real y el número no arrastra la
cuantización del clic, que impediría probar el borde de −20 contra −21. Con eso la mutación cae
y el diagnóstico imprime la inversión: `h25=false h18=true`.

**Es la tercera vez en tres turnos que un caso no prueba el camino que dice probar** —el botón
de la barra, `medStrain3Confirmar`, y ahora esto—. El patrón es siempre el mismo: **el caso
rehace el trabajo en vez de pedírselo al código**. La condición correcta interroga a la función
que decide, no a una reconstrucción de lo que debería decidir.

**Y la condición que separa dos umbrales de uno** es la franja de −20 a −21: ahí el MISMO número
—−20,5 %— es normal en hombre y anormal en mujer. Sin ella, la mutación que iguala los dos
cortes pasa, porque todas las demás condiciones usan valores lejos del borde.

**Backtick dentro del cuerpo de un caso: van VEINTIDÓS**, y otra vez en el comentario que
acababa de escribir para explicar la trampa de arriba.

### Grupos colapsables, guía del ciclo y LARS (2026-09-20)

Tres cambios del mismo panel. Lo que hay que saber antes de tocarlo:

#### «El grupo de la herramienta activa manda» deja la función MUERTA

Fue mi primera versión de `_medGrupoAbierto`, y parece lo correcto —«la herramienta activa
mantiene su grupo abierto»—. Pero **siempre hay una herramienta activa** —de fábrica,
Distancia— así que su grupo ganaba sobre la elección del médico y **los otros dos no se podían
abrir nunca**. La función habría nacido inservible.

Lo correcto es al revés: el grupo abierto lo decide el médico (`medGrupo`, por VISTA), y
**elegir una herramienta abre SU grupo** — eso es lo que hace que la activa quede visible. Lo
único que no se puede es colapsar el grupo de la activa, porque dejaría el botón encendido
escondido y la barra diría una cosa mientras el canvas hace otra.
**Lo cazó el caso al no encontrar el botón de Strain después de abrir su grupo**, no la
relectura.

**Y los casos que clickean un botón de herramienta tuvieron que aprender los grupos.** Los de
Doppler y Deformación **no están en el DOM** con su grupo cerrado, así que un caso que clickea
directo revienta con «null.click» y parece que la herramienta desapareció. Está resuelto con
`__t.herr(id, pfx)` en el preludio, que abre el grupo y después clickea — 21 sitios.

#### La guía del momento del ciclo es informativa, y tiene que serlo

La app **no tiene ECG ni forma de saber en qué fase está el cuadro**. Fingir que valida el
momento sería peor que no decir nada. Los tres renglones de cada fase son tres caminos al mismo
instante —el ECG, la válvula, el volumen— porque no siempre hay ECG en la imagen.

#### LARS: las fórmulas, y el signo que la ASE publica al revés

Con L1 = AI mínima (referencia, inicio del QRS), L2 = máxima, L3 = pre-contracción:
`reservorio = (L2−L1)/L1`, `conducto = (L2−L3)/L1`, `contracción = (L3−L1)/L1`. Los tres salen
**positivos** y cumplen **reservorio = conducto + contracción** — una verificación interna
gratis, que se muestra y que fija un caso.

**⚠️ La ASE publica conducto y contracción con signo NEGATIVO** (−22 % y −18 % donde acá dice
22 % y 18 %). Son las mismas magnitudes con el signo invertido, y **se declara en el panel**:
un informe de speckle tracking al lado los va a mostrar negativos, y este archivo ya pagó dos
veces el costo de un signo que nadie explicó.

**Sólo el reservorio tiene corte publicado** (≥18 %, ASE 2025). Conducto y contracción se
muestran sin referencia: inventarles una sería la cuarta escala del mismo dato.

**Reusa `_medAreaValidar` y `_strainLargoPx`** — la compuerta 2D y el largo del trazo son los
mismos del área y del strain del VI. Y como el método exige **tres cuadros distintos**, cambiar
de cuadro oculta lo confirmado y no lo borra, igual que el strain del VI.

#### Verificar contra «la geometría conocida» mide también la RASTERIZACIÓN del propio caso

TC-204 traza circunferencias, cuyo perímetro es proporcional al radio, así que el reservorio
esperado es `(R2−R1)/R1` — independiente de π y de la escala. Con r=60 daba **37,81 % contra
40 %**: −2,2 pp. Medido aparte, el redondeo a píxeles enteros explica sólo −0,3 pp; el resto es
**la cuantización del clic en pantalla**, y el efecto es RELATIVO al radio. Con r=120 cae a la
mitad. La tolerancia sale de esa medición, no de buscar un número que haga pasar el caso.

### Contorno sugerido por 3 puntos, y el sesgo que aparece al MEZCLAR métodos (2026-09-20)

Alternativa al trazado libre: se marcan anillo septal, ápex y anillo lateral, la app propone un
contorno con Catmull-Rom y el médico lo ajusta arrastrando siete puntos de control. Confirmado,
entra por **`_strainAceptar`, la misma puerta**, así que de ahí en adelante los dos métodos son
indistinguibles — mismos arcos por pared, mismo bull's eye, misma captura.

**CUÁNTO SE PIERDE POR NO TRAZAR EL BORDE, medido antes de implementar** sobre contornos
superelípticos —a propósito NO elipses: la primera medición usó una media elipse como «verdad»
y midió un modelo de media elipse contra ella, que es «ida y vuelta exacto no prueba nada»—:

| | longitud | strain |
|---|---|---|
| spline por 3 puntos | **4-6 % corta** | sesgo **0,02 a 0,21 pp** |

O sea: **sirve para strain aunque sea un mal contorno absoluto**, porque el subregistro se
cancela en el cociente. Eso es lo que hace legítimo el método, y está dicho en el panel.

**⚠️ LO QUE ROMPE LA CANCELACIÓN ES MEZCLAR LOS MÉTODOS ENTRE LAS DOS FASES.** Medido:
diástole a mano con sístole por 3 puntos —o al revés— da **±3,7 a ±4,4 pp**, veinte veces el
sesgo de usar el mismo método en las dos, y alcanza para dar vuelta la impresión clínica
(−5,1 % contra −9,4 % en el ventrículo dilatado). Cada trazado guarda su `metodo` y el panel lo
**declara**; no se bloquea, porque hay razones legítimas para trazar una fase a mano y la otra
no. El pedido no lo mencionaba.

**UNA SOLA DENSIDAD PARA DIBUJAR Y PARA MEDIR.** Estaban en 20 y 26 tramos por segmento: la
curva que el médico aprobaba en pantalla no era la que se medía al confirmar, porque la
poligonal de una curva depende de en cuántos tramos se la parta. Lo encontró la condición que
exige que el borde confirmado sea el de la curva dibujada. Es «si se mide un alto y se dibuja
otro», otra vez.

**Los controles se reparten por LONGITUD DE ARCO, no por parámetro.** Por parámetro quedan
amontonados cerca del ápex —ahí la curva se dobla— y el médico tendría cinco controles para
ajustar la punta y ninguno para las paredes.

#### Dos mutaciones que SOBREVIVIERON, y qué significa cada una

- **Fijar los extremos a los puntos marcados es REDUNDANTE hoy.** Con `meta = 0` y `meta = L`
  el remuestreo por arco ya aterriza exacto en el primero y el último punto de la curva, que
  Catmull-Rom hace pasar por los extremos. Las dos líneas quedan porque fijan el **contrato**:
  el día que cambie el remuestreo, `_STR_NCTRL` o el tipo de spline, los extremos tienen que
  seguir siendo los puntos marcados. Se declara en el código que es redundante, en vez de
  dejarla pasar como si la mutación la hubiera cazado.
- **Confirmar la poligonal cruda en vez del spline sobrevivía a la primera versión del caso**,
  porque la condición de «misma puerta» alimentaba los puntos a mano y salteaba
  `medStrain3Confirmar`. Un caso que le pasa los datos a la función no prueba el camino que los
  arma — la misma lección que el botón de la barra el turno pasado.

**Y la trampa del clic, por segunda vez en dos turnos.** La condición «la curva pasa por los
puntos del anillo» comparaba contra **los píxeles que yo quise clickear**, y `clientX` es entero
por especificación: el viaje imagen → pantalla → imagen pierde ~1 px, así que medía la
cuantización del clic y no el spline. Con tolerancia de 2 px una mutación sobrevivía; con
tolerancia exacta fallaba el código sano. Se compara contra el punto **registrado** —exacto— y
el clic se mide aparte. **Ya estaba escrito en este archivo para TC-197 y lo volví a hacer.**

### Capturar con las mediciones, y LOS BOTONES MUERTOS DE LA VISTA B (2026-09-20)

Segundo botón de captura: compone el canvas de la imagen con el de medición y agrega una
etiqueta opcional. El de siempre —«📸 Capturar cuadro»— no se tocó: sigue sacando el JPEG del
archivo a resolución plena, sin mediciones.

**ACÁ SÍ SE COMPONE DESDE EL CANVAS, y no contradice la regla del módulo.** Capturar desde el
JPEG original existe para no reencodear; para superponer dos capas el reencodeado es
inevitable. Y no cuesta calidad: `cineIr` dibuja el bitmap **1:1** en un canvas del tamaño
exacto del bitmap —sin remuestreo— y `_medPintar` pone el de medición en ESE mismo tamaño, así
que componerlos es una copia de píxeles. Se llama a `_medPintar()` antes: el overlay conserva
lo último dibujado y, si el cuadro cambió y nadie repintó, se compondría el overlay de otro
cuadro sobre esta imagen.

**El overlay sólo se compone si mide EXACTAMENTE lo mismo.** Escalarlo para que entre movería
cada medición de lugar respecto de la anatomía que describe.

**LA ETIQUETA SE ESCAPA EN EL ATRIBUTO, NO EN EL CANVAS.** `fillText` no interpreta marcado —
el canvas no tiene superficie de inyección—. El sink real es el `value="…"` del input, que se
**reemite en cada repintado de la barra**: sin `escHtml`, una comilla lo cierra y lo que sigue
se parsea como marcado, y ahí un `on*` **se compila** — que es donde escapar después ya no
sirve. La mutación que lo saca deja el atributo de evento puesto y cae por tres condiciones.
Y el valor vive en la vista (`medEtiqueta`), porque la barra se reconstruye por `innerHTML` en
cada medición y un input adentro nace vacío si no se repone.

#### El defecto que destapó: la barra de la vista B emitía los ids SIN prefijo

Los once botones de herramienta y los de los paneles de Simpson y strain salían con el id
cableado —`cine-med-dist`, `cine-simp-conf`…— sin el prefijo de la vista. Consecuencia sobre
la vista B: **el documento quedaba con ids duplicados**, `getElementById` devolvía siempre el
de A, el cableado `if (bd) bd.onclick = …` se saltaba en silencio y **los botones de B se
dibujaban y no respondían**. Se veían perfectos.

Y el cableado, además, ataba los manejadores **pelados**: aun con el id correcto habrían
corrido contra la vista ACTIVA —la A por omisión—, así que un clic en la barra de B movía la
herramienta de A. Es la misma trampa del contexto ambiente que ya se había cerrado para los
manejadores del canvas; **la barra quedó afuera aquella vez y nadie se enteró porque TC-196
ejercía `medHerramienta` por `_vCon` y nunca clickeaba el botón**.

**La lección es del caso, no del código: un caso que llama a la función no prueba el botón.**
Hoy TC-202 hace **clic real** sobre el botón de la barra de B y exige que mueva a B y no a A;
la mutación que revierte el atado imprime `A=area B=dist`.

**Cómo se verifica que una capa se compuso: por PÍXELES, contra la captura sin ella.** Dos
trampas propias al escribirlo, las dos de muestreo:
- **La fila exacta de la línea cae en el borde antialias.** Muestrear `y=60` sobre una línea de
  2 px daba 59 de diferencia contra un umbral de 60, sobre una composición perfecta. Se toma el
  máximo en una ventana vertical.
- **La columna del medio cae sobre la caja negra de la etiqueta de la regla**, que sobre un
  fondo ya oscuro casi no cambia el píxel: 83 contra 264 de las columnas de línea desnuda. Se
  muestrea donde la línea está sola.
Y el denominador: **lejos de la línea las dos imágenes tienen que ser casi iguales**; si no,
«difieren sobre la línea» no probaría que se compuso nada.

### Strain: trazado, SGL por territorios, y las dos cosas que el método NO puede (2026-09-20)

Séptima herramienta del visor: el trazado guiado de dos contornos y el acortamiento que sale de
ellos. **No escribe nada en el informe** — ver abajo por qué eso es una decisión clínica y no
una etapa pendiente.

**NO REIMPLEMENTA NADA DE LO QUE YA EXISTE, y no es prolijidad.** La compuerta «2D con escala en
cm, una sola zona» es `_medAreaValidar`, la misma del área; el eje largo es **`_simpEje`, el
mismo de Simpson**. El pedido decía «igual que Simpson — Lang 2015», y la forma de que sea igual
es que sea **el mismo**, no uno escrito al lado que mañana diverge sobre el mismo ventrículo en
el mismo informe.
**La mutación que lo demuestra es la más instructiva de la tanda:** reimplementar el eje como
«la cuerda más larga del contorno» —que es lo que uno escribiría sin leer la guía— da **315,8 px
donde el correcto da 300**. Un 5 % de error, en un número que se ve perfectamente plausible. Es
exactamente lo que el comentario de Simpson advierte: sin la recta del anillo, «el punto más
apical» no está definido.

#### La decisión que condiciona el cálculo: qué longitud es el borde

El flujo cierra el contorno al soltar, como se pidió. Pero **«cerrado» sirve para DEFINIR el eje
y no para medir**: la recta que une los dos extremos del anillo atraviesa la cavidad y **no es
pared**. Meterla en la longitud mete en el strain un segmento que no es miocardio.

Se guardan las dos por separado —`bordeCm` (el trazo ABIERTO) y `cuerdaCm` (la recta)— para que
el cálculo use la que corresponda y para que la diferencia sea visible en vez de quedar
escondida adentro de un perímetro. Medido sobre contornos plausibles (media elipse, anillo
30-44 mm, eje 64-95 mm):

| | anillo | borde | perímetro cerrado | cuerda / borde |
|---|---|---|---|---|
| diástole normal | 36 mm | 169,7 | 205,7 | **21,2 %** |
| sístole normal | 30 mm | 136,3 | 166,3 | **22,0 %** |

**Sobre el SGL la diferencia es más chica de lo que parece — y no es despreciable.** Con el
borde abierto da **−19,7 %** y con el perímetro cerrado **−19,2 %**: **0,5 puntos
porcentuales**, porque la cuerda se acorta en sístole casi en la misma proporción que el borde.
Pero el único corte vivo de esta app sobre el SGL es el **−16 % del HFA-ICOS**, y ahí 0,5 pp
cruzan el umbral: un −16,2 y un −15,7 son dos bandas distintas de riesgo. **Queda decidido
guardar las dos y declarar cuál es cuál; qué usa el cálculo es la decisión del próximo paso.**

#### El cálculo, y las tres cosas que NO hace

**`strain = (L_sístole − L_diástole) / L_diástole × 100`, con L = `bordeCm`.** Decisión de
Maicol (2026-09-20): la cuerda del anillo no entra porque atraviesa la cavidad y no es pared
miocárdica. Medido en la geometría del caso de prueba, meterla mueve el resultado de **−20,8 %
a −22,7 %**; sobre contornos con forma de VI la diferencia baja a ~0,5 pp, que sigue alcanzando
para cruzar el único corte que esta app aplica sobre el SGL.

**EL SIGNO SALE DE LA MEDICIÓN, NO SE FUERZA.** `-Math.abs(pct)` es la tentación —el convenio
de la app es negativo, así que «nunca sale mal»— y sería esconder el único error que el número
puede delatar solo: si el borde de sístole sale más largo que el de diástole, o los contornos
no recorren la misma extensión, o se confirmaron las fases al revés. Forzado a negativo, un par
invertido da un strain perfectamente presentable. **La mutación que lo fuerza convierte un
+26,2 % en un −26,2 %** y el panel deja de avisar.

**NO SE GRADÚA EN BANDAS, y no es una omisión.** Esta app **borró a propósito** la graduación
del SGL —convivían tres escalas y el informe firmado se contradecía solo— y lo declara en el
Laboratorio: «esta app no clasifica el SGL en bandas». Agregar leve/moderado/severo acá sería
la cuarta escala del mismo dato.

**NO SE APLICA EL CORTE DE −16 %, y éste es el punto clínico del turno.** Ese corte es el único
vivo del SGL en esta app (HFA-ICOS, cardio-oncología) y está definido para **GLS por speckle
tracking**. Lo que mide esta herramienta es el **acortamiento de un contorno endocárdico trazado
a mano en dos cuadros**: emparentado, y no la misma magnitud. Aplicarle el corte sería la cita
falsa que este archivo persigue desde la nota del NT-proBNP. El panel dice qué es y qué no es.

**NO ESCRIBE EL CAMPO `sgl` DEL INFORME**, por lo mismo: ese campo alimenta el marco HFA-ICOS y
las decisiones de cardio-oncología. Meter ahí un número obtenido por otro método lo rotularía
como GLS en un documento que decide conducta. La mutación que lo integra deja `sgl = −20.8` y
cae por esa condición.

**La banda (−45 %, 0 %) es de PLAUSIBILIDAD, no de severidad.** Un acortamiento fuera de ahí no
es un hallazgo extremo: es casi siempre que los dos contornos no recorren la misma extensión
—uno llegó al anillo y el otro no—, que es el modo de falla propio del método manual, como el
ápex escorzado lo es del de discos. Se declara; no gradúa.

**TC-200 lo fija sin depender del pendrive, y su condición discriminante no es «el número es
correcto»** —lo sería con las dos convenciones— **sino que sea el del borde abierto y NO el del
perímetro cerrado**, calculado aparte dentro del propio caso. Con la mutación los dos colapsan
al mismo valor y el diagnóstico lo imprime: «abierto=−22.70 % cerrado=−22.70 %».

#### El bull's eye del visor, y la escala que casi queda INVERTIDA

Diagrama polar propio del visor. **No toca `strainEstado` ni `#sgl-svg-bullseye`** — aquél es
el de 17 segmentos del informe, que el médico pinta a mano y que baja al PDF firmado.

**EL PEDIDO TRAÍA VERDE = NORMAL / ROJO = ANORMAL, Y ESO LO DEJABA AL REVÉS DEL OTRO.** El
bull's eye del informe usa la paleta GE, donde **normal es ROJO** (`#DC2626`) y la discinesia
es AZUL (`#1D4ED8`). Los dos pueden terminar en el **mismo PDF** con el mismo aspecto: un
sector rojo significaría «normal» en uno y «severamente anormal» en el otro. Es el defecto de
las dos escalas incompatibles que este archivo ya documenta tres veces —el SGL con signo
invertido, el mapeo de Forrester rotado, las tres agendas de cardio-onco— y acá sobre un
documento firmado.

**La escala es de INTENSIDAD, no de bandas**, en un tono que no existe en la paleta GE: la
oscuridad crece con la MAGNITUD del acortamiento y el número va impreso en cada sextante. No
nombra severidad y no se ancla a ningún umbral — que es lo que ya hace `_labSglResumen`, y lo
que corresponde a un método al que el corte de −16 % no aplica. Decisión de Maicol
(2026-09-20). Las bandas −18/−16 que pedía el pedido son, además, la graduación que `calcSGL`
**borró a propósito**: convivían tres umbrales y el informe salía «SGL (>=-18%): -18% - Zona
gris». La mutación que las reintroduce con la paleta GE cae por «no aparece el rojo de GE».

**SON SIEMPRE SEIS SEXTANTES, y los que no tienen dato van en GRIS.** Repartir el disco en
tantos sectores como territorios haya —media pantalla por pared con una sola vista— dibuja un
ventrículo completo sobre media medición y no deja ver lo que falta. Con una vista quedan
grises el anterior y el inferior; con dos, ninguno.

**Y una pared ancha pinta SUS DOS sextantes**: la «septal» de la A4C abarca anteroseptal e
inferoseptal —por eso no se le puede atribuir una sola coronaria— hasta que la A3C aporte el
anteroseptal por separado. Cuando un sextante hereda de una pared ancha **se marca**: si no,
dos sextantes con el mismo número se leen como dos mediciones independientes que dieron igual.
La mutación que hace ganar a la pared ancha sobre el territorio específico borra el aporte de
la A3C y cae por tres condiciones.

**NO SE PUBLICA ATRIBUCIÓN CORONARIA**, que era el punto 4 del pedido. El método resuelve
paredes enteras, no basal/medio/apical: la septal de la A4C abarca anteroseptal (DA) e
inferoseptal (CD), que son arterias distintas. Y el mapeo pedido **omitía la pared anterior**,
que es territorio de la DA. Decisión de Maicol (2026-09-20): el diagrama muestra los
territorios y la atribución la hace el médico.

**LA IMAGEN CAPTURADA LLEVA EL TÍTULO Y EL DESCARGO QUEMADOS.** Sin eso, el PNG que llega al
PDF es un bull's eye indistinguible del validado —el del informe— y nadie que lo mire después
sabe con qué método salió. Un solo dibujante para la pantalla y para la captura, parametrizado
por tamaño: con dos se desincronizan.

**TC-201 verifica sobre los PÍXELES DIBUJADOS**, no sobre el código: leer que la función existe
no dice dónde cayó el gris. Trampa propia al escribirlo: el muestreo caía **sobre el texto** de
los rótulos y devolvía el color de una letra, así que «la pared ancha pinta sus dos sextantes
igual» daba false sobre un dibujo correcto. Se muestrea en la banda libre entre el círculo
central y los rótulos.

#### Dos contornos libres NO resuelven 6/12/17 segmentos — medido antes de implementar

El pedido traía `strain_i = (L_sist_i − L_diast_i)/L_diast_i` sobre la grilla del modelo AHA:
6 segmentos con A4C, 12 con A4C+A2C, 17 con las tres. **No se puede, y el motivo es aritmético.**
Partir cada contorno en *k* tramos de igual longitud de arco da
`(L_s/k − L_d/k)/(L_d/k)` = `(L_s − L_d)/L_d` — **el global, para todo i**. Medido antes de
escribir una línea, sobre media elipse con interpolación exacta:

| partición | dispersión entre segmentos | qué es |
|---|---|---|
| arco igual, 6 · 12 · 17 | **exactamente 0,00** | el SGL global repetido k veces |
| fracción del eje largo | 0,8 pp | sobre una pared que se acorta **uniforme** → artefacto del corte |

La primera publica 17 números idénticos bajo el rótulo «strain por segmento», que un médico
lee como *«strain uniforme, sin disfunción regional»* — una conclusión clínica que el método no
puede sostener. La segunda es peor: **no es degenerada, así que parece señal**, y no lo es.
Y las dos caerían sobre los **mismos segmentos del bull's eye que la app ya tiene**
(`strainEstado`, que va al PDF), o sea una segunda fuente del mismo dato por otro método.

**Lo que dos trazados libres SÍ resuelven son las dos PAREDES.** El ápex —que ya deriva
`_simpEje`— y los dos extremos del anillo son los únicos puntos que los dos contornos comparten
como referencia anatómica. De ahí salen **2 territorios por vista: 2 / 4 / 6**, y ésos sí se
distinguen entre sí. Decisión de Maicol (2026-09-20). **TC-200 lo vuelve a medir en vivo**: su
condición «los territorios se distinguen entre sí» cae con la mutación que los parte por arco
igual, con el diagnóstico imprimiendo «difieren 0.0 pp».

**El rótulo de la pared depende de la DIRECCIÓN en que se traza y no hay forma de deducirla**
—la orientación de la imagen varía entre equipos y entre presets—. El panel dice en qué orden
trazar cada vista, los rótulos suponen ese orden, y **eso se declara**: un rótulo de pared
equivocado es peor que no rotular.

**El SGL es el PROMEDIO de los territorios, no el cociente de las longitudes sumadas.** Con
paredes de largo distinto los dos números difieren, y el que corresponde es el promedio —es
como se define el GLS sobre los segmentos, cada uno pesando igual—. La mutación que lo cambia a
longitudes sumadas cae por dos condiciones.

**El disclaimer va PEGADO al resultado, no al pie.** Lo que se lee primero es el número; un
descargo tres bloques abajo llega tarde. La mutación que lo saca cae por tres condiciones, una
por cada superficie donde tiene que estar —una vista, tres vistas, y el caso implausible—.

#### El aviso de cambio de cuadro NO se copió de Simpson, a propósito

Simpson avisa sólo si había un trazado **sin confirmar**. En strain, **cambiar de cuadro es
parte del método** —el panel le pide al médico ir de diástole a sístole—, así que el momento en
que el contorno confirmado desaparece de la pantalla es el momento en que la app le dijo que lo
hiciera. Sin una palabra ahí se lee como que se perdió el trabajo. Se avisa siempre que haya
algo que se deje de dibujar, y se distingue aparte si además se descartó lo pendiente.
Copiar el comportamiento de Simpson habría sido lo cómodo; **lo cazó TC-199**, que esperaba el
aviso y lo encontró mudo.

**Las dos vistas salen gratis** del modelo de instancias: `strain` es una clave más en `_vNueva`
y una entrada más en el mapa de accesores. Cero líneas específicas para la vista B — que era
todo el punto de aquella refactorización.

**TC-199 no depende del pendrive**: cuadros generados con un canvas y regiones sintéticas, 2D y
espectral. Cuatro mutaciones, las cuatro cazadas. Y el triángulo del caso tiene eje largo
**exactamente** igual a su altura, así que el eje se verifica contra un número cerrado y no
contra una tolerancia elegida a dedo.

### La guarda de reentrada de la sincronización — y el bucle que no existía (2026-09-20)

**EL REPORTE DESCRIBÍA `cineBIr → cineIr → observador → cineBIr`. Ninguna de las tres flechas
existe.** `cineBIr` tiene **cero** ocurrencias desde la refactorización a instancias, el
observador dejó de manejar la sincronización —hoy sale directo de `cineIr`— y la vuelta B→A
nunca existió: `_vSyncAplicar` sólo llama a `cineIr` sobre la vista B, y `cineIr` sólo llama a
`_vSyncAplicar` cuando la vista es la A.

**De dónde salió: es la mutación B6 de este mismo archivo.** La entrada del panel B dice «la
mutación que la vuelve bidireccional **cuelga la suite**» — o sea la describe como un hecho
medido, porque lo es, pero de un defecto **introducido a propósito para probar el caso**, no
de uno vivo. Leída fuera de contexto se lee como un bug abierto.
**Regla que queda: al documentar una mutación, decir que es una mutación en la misma oración**,
no sólo en el párrafo que la encuadra. Media sesión de diagnóstico depende de eso.

**LA GUARDA SE AGREGÓ IGUAL, y no es un adorno.** Este archivo ya la dejaba recomendada («si se
vuelve a tocar, la guarda va antes de la refactorización»). `_vSincronizando` corta la
**reentrada**; el `dB.cuadro === n` que ya estaba corta el **régimen estacionario**. No son
redundantes: cubren dos cosas distintas y conviene no borrar ninguna creyendo que sobra.

**QUÉ CUBRE Y QUÉ NO, con precisión.** Todo el camino A→B es síncrono hasta el primer `await`
de `cineIr`, así que un flag síncrono corta la recursión. **Si algún día la vuelta B→A se
dispara DESPUÉS de un `await`, este flag ya estará liberado y no la va a cortar** — ahí hay que
sostenerlo hasta que termine el `cineIr` de la B, o poner el corte del lado de la vuelta. Está
escrito arriba de la función para que no se descubra colgando la app.

**El `finally` va, aunque el flag no se pueda trabar.** Una función `async` **no lanza de forma
síncrona** —una excepción en su cuerpo vuelve como promesa rechazada—, así que el flag se
libera igual. Se pone por barato, no porque el razonamiento de arriba sea frágil.

**LA MUTACIÓN QUE MÁS VALE ES LA DEL `finally`.** Un flag que se pone y **nunca se libera** no
rompe nada visible al instante: mata la sincronización **a partir del segundo movimiento**, en
silencio. Es el defecto clásico de este patrón y lo caza TC-198 por tres condiciones a la vez.
Las otras dos mutaciones —no poner el flag, y ponerlo sin consultarlo— caen cada una en la suya.

**TC-198 NO DEPENDE DEL PENDRIVE: los cuadros se generan en la página con un canvas.** Es una
invariante de lógica pura y atarla a un disco montado la vuelve inverificable justo cuando hace
falta — que es exactamente lo que pasó en esta sesión, con el pendrive desmontado a mitad de
camino y quince casos reportando «sin verificar». **Un caso que no necesita PHI no debería
pedirla.**

### Velocidad: la escala del archivo estaba bien, y el respaldo es para los 15 sin región (2026-09-20)

**EL REPORTE DECÍA «las velocidades dan −403 cm/s, la escala del archivo no se lee bien». La
escala se lee bien.** Medido sobre los 301 archivos del pendrive, antes de tocar una línea:

| | |
|---|---|
| regiones de velocidad **superpuestas** | 0 — no hay ambigüedad al elegir región |
| `ReferencePixelPhysicalValueY` ≠ 0 | 0 — el cero siempre es el píxel de referencia |
| `PhysicalDeltaY` positivo | 0 — las 132 declaran arriba-positivo |
| regiones donde −403 cm/s cae **dentro** del recuadro | 26 de 132 |
| archivos **sin ninguna región** | 15 de 301 |

−403 cm/s son **−4,03 m/s**, una velocidad de chorro normal, y el signo lo declara el archivo.
En **65 de 132** regiones la línea de base cae **fuera** del recuadro visible —un trazo CW
dibujado entero hacia abajo— así que ahí *todo* lo que se clickee da negativo, correctamente.
Y el gradiente salía bien desde siempre, porque 4V² eleva al cuadrado: −4,03 → 65 mmHg.

**Lo que se arregló es la PRESENTACIÓN.** Se muestra la magnitud en m/s con la dirección al
lado (↑ hacia el transductor, ↓ alejándose), que es como se reporta y como están los campos de
la app —`vmax_it`, `vmax_ao` son positivos—. Decisión de Maicol. El signo del archivo se sigue
usando: es de donde sale la flecha.

**LA CALIBRACIÓN MANUAL NECESITA DOS COSAS Y NO UNA**, y eso la separa de la de distancia: el
**cero** —dónde está la línea de base— y la **escala**. Una distancia sólo necesita el factor;
una velocidad no es la diferencia entre dos puntos marcados sino la altura de **uno** sobre la
base. Por eso el trazo va de la línea de base a una marca conocida, y `_medVelCalEn` es
`(y0 − y) · cmsPorPx`: la dirección sale de la geometría, no se supone.

**SE OFRECE SOLA SÓLO SI LA IMAGEN NO DECLARA NINGUNA REGIÓN, y la condición amplia era una
regresión peligrosa.** La primera versión entraba con «no hay región de VELOCIDAD» — y de las
157 regiones espectrales del pendrive, **25 tienen el eje Y en centímetros**: son trazos de
**modo M**, distancia contra tiempo. Con esa condición, elegir la herramienta sobre un modo M
ofrecía calibrar una escala de velocidad sobre un eje de **distancia**, y el número habría
salido plausible. Ahí la respuesta correcta es el aviso que explica qué es ese trazo.
**Lo cazó TC-193, que ya vigilaba ese aviso** — un caso viejo poniéndose en rojo es la señal,
no el problema.

**Pisar la escala del archivo es una decisión explícita** («Recalibrar velocidad») y la barra
lo **declara** mientras esté pisada. Un número de velocidad sin saber de dónde salió la escala
no se puede auditar, y acá conviven dos fuentes.

**Al probar: separar la aritmética del clic.** `MouseEvent.clientY` es **entero por
especificación**, así que el viaje imagen → pantalla → imagen pierde subpíxeles: pedir y=400
sobre un canvas escalado por CSS deja y=402,43. La primera versión de TC-197 comparaba contra
los píxeles que yo *quise* clickear y daba rojo por esa cuantización, que un clic real también
tiene. Hoy la conversión se verifica **contra el estado registrado** y es exacta a 1e−12, y el
mapeo del clic se mide aparte con la tolerancia derivada del escalado real. Es la misma
corrección que ya se le hizo a TC-187.

**Y `medToggle` ALTERNA.** Llamarlo en un caso con la medición ya encendida la **apaga**, y
entonces el canvas queda con `display:none` y sin manejadores: los clics no llegan a ningún
lado y se ve como si la herramienta no anduviera. Me costó una vuelta de diagnóstico en este
mismo caso. En los casos, `if (!_medOn) medToggle();`.

**Backtick dentro del cuerpo de un caso: van VEINTIUNO**, y otra vez en un comentario recién
escrito — el que explicaba justamente la trampa de arriba.

### Panel B: segunda vista, SÓLO de visualización (2026-09-20)
> **SUPERADO por la entrada de arriba (mismo día).** El panel B pasó a ser una instancia
> completa con sus seis herramientas. Lo que sigue vale para la sincronización —que no cambió—
> y para el censo de lo que costaba la refactorización, que era el argumento para no hacerla.
`➕ Agregar vista` abre un segundo reproductor al lado del A, con su propio play/pausa/slider, y
`🔗 Sincronizar` hace que **A mande y B siga**. Las herramientas de medición siguen viviendo en el
panel A. Decisión de Maicol: el panel doble era el paso que quedaba pendiente del arreglo del
Simpson biplano, y darle herramientas propias exige la refactorización a instancias que esa misma
entrada declara —19 globales y 21 ids fijos—, que es otra tarea.

**LA SINCRONIZACIÓN ES POR POSICIÓN RELATIVA, NO POR ÍNDICE.** Copiar el índice es lo obvio y está
mal: los dos loops tienen distinta cantidad de cuadros —en el pendrive van de 41 a 172— así que con
A en el cuadro 100 el B se quedaría **clavado en el primer cuarto de su ciclo**, y el que mira
creería estar comparando la misma fase del latido. Se calcula la fracción `cuadro/(n−1)` de A y se
aplica sobre los cuadros de B.

**Va en UN solo sentido, y si alguna vez se hace bidireccional hay que cortar el lazo.** Hoy
`cineBIr` no llama a `cineIr`, así que no hay realimentación. La mutación que la agrega
—`cineBIr` moviendo a A— **cuelga la suite**: `cineBIr → cineIr → observador de `#cine-num` →
`_cineSyncAplicar` → `cineBIr` → …, y como todo el camino es `await`, el caso no vuelve nunca. Es
«un test que se cuelga no es un test lento» otra vez, con la diferencia de que acá el cuelgue **es**
el síntoma. Queda distinguible de un verde, pero no se lee como un rojo: si se vuelve a tocar, la
guarda va antes de la refactorización, no después.

**La guarda de la sincronización está DUPLICADA, y por eso ninguna mutación de un solo sitio la
mata.** `if (_cineSync)` está en el observador **y** al principio de `_cineSyncAplicar`. Saqué
primero la de afuera —sobrevivió— y después la de adentro —sobrevivió también—, y las dos veces
empecé a buscar el hueco en el caso. No había hueco: es defensa en profundidad funcionando, y la
mutación fiel tiene que sacar **las dos**. Con las dos afuera, el caso cae.
**Al mutar un predicado, contar cuántas veces está escrito antes de leer el resultado.**

**`cineCerrar()` cierra el panel B primero.** Sin eso la vista del paciente anterior sobrevive al
cierre del visor y reaparece en el loop siguiente.

**DOS CONDICIONES DE TC-195 NACIERON SIN DENOMINADOR, las dos del mismo tipo:**
- **«cerrar B apaga la sincronización»** se comprobaba después del paso que ya la había apagado, así
  que se cumplía sola. Hoy se vuelve a encender antes de cerrar, y hay una condición que lo afirma.
- **«apagada, B no sigue a A»** dejaba a B en el cuadro 1 y movía A al 2 — y `esperado(2)` también
  daba 1, así que la condición pasaba con la sincronización forzada a andar siempre. Hoy B se manda
  al **último** cuadro, que la sincronización desde el cuadro 2 de A no puede producir, con una
  condición que verifica justamente eso.

Las dos las delataron mutaciones que sobrevivían, no la relectura. Cinco de las seis mutaciones caen
donde les toca (índice en vez de posición relativa, slider de B dimensionado con los cuadros de A,
cerrar B sin apagar la sync, cerrar el visor sin cerrar B, y la guarda con los dos sitios sacados).

**Safari sigue sin verificarse**, como todo el módulo DICOM: el navegador está concedido a nivel
«lectura» y no se puede manejar. Todo lo de acá corre en Chrome por CDP.

### Cineloop — persistencia (2026-09-19)
Los cineloops se guardan en **`ceibomed_cine`**, una base aparte de `ceibomed_img`, un registro
por loop con índice por estudio. Aparte y no un store nuevo en la base de imágenes porque eso
obliga a subir `DB_VER` y tocar `CeiboImg`: un `onupgradeneeded` mal resuelto se lleva puestas
las imágenes de todos los estudios. Un registro por loop y no por estudio porque si no, abrir
uno cargaría todos los del estudio a memoria — 50 MB para mirar 4.

**NO SE GUARDA EL `.dcm`. Se guardan los cuadros JPEG y cuatro números** (cantidad, velocidad,
ancho, alto). Medido sobre el pendrive: esos archivos traen **`PatientName`, `PatientID` e
`InstitutionName` en claro** en la cabecera, y **`BurnedInAnnotation` = YES** en 41 de 60. Hoy
los slots guardan un JPEG reencodeado por canvas, o sea **sin** cabecera; guardar el archivo
crudo pondría el nombre y la cédula en texto plano dentro de IndexedDB por primera vez en esta
app. Los cuadros son ~99 % del archivo, así que el reproductor no pierde nada. El nombre
**dibujado en los píxeles** queda — eso no se puede quitar, y es la misma exposición que ya
tienen las imágenes fijas guardadas. TC-184 lo fija buscando `DICM`, la raíz de UID
`1.2.840.10008` y el `PatientName` real del archivo **dentro de los bytes guardados**.

**Dos condiciones para guardar, y se dicen por separado:** el toggle «Guardar imágenes con los
estudios» (apagado por defecto) y que el estudio tenga uuid, que sólo aparece al guardarlo. Si
falta alguna no se escribe nada y el aviso dice **cuál** falta. Guardar «por las dudas» con el
toggle apagado sería escribir en disco justamente lo que ese interruptor promete que no escribe.

**El almacenamiento es best-effort.** Medido: `persisted` arranca en `false` y la cuota del
origen es de 10 GB. Se pide `navigator.storage.persist()` la primera vez que se guarda un loop y
**se dice lo que el navegador contestó**: si la niega, el aviso avisa que puede borrarlo y que el
pendrive sigue siendo el respaldo. Prometer permanencia sin tenerla es peor que no prometer.

**El umbral de 50 MB del pedido casi nunca dispara**: el cineloop más grande del pendrive es
17 MB. El aviso que sirve es el de cuota, que se chequea **antes** de escribir y dice los números;
sin eso el fallo llega como un `QuotaExceededError` seco y parece que la app se rompió.

**`_cineVivosParaRecolectar` está separada de la acción a propósito.** Devuelve la lista de uuid
vivos o **`null` = no recolectar**, y `null` incluye el caso de **lista vacía**: «no hay estudios»
y «no se pudo leer la lista» llegan iguales, los dos como `[]`, y lo segundo destruiría megabytes
de video clínico por un fallo transitorio. Está afuera además porque es la parte que hay que poder
probar sin depender de cuántos estudios haya — la primera versión de TC-184 asumía la lista vacía,
**pasaba con `--solo` y fallaba dentro del suite**, donde los casos anteriores ya habían guardado
estudios. El caso no fijaba su propio denominador.

**La tira se sincroniza contra `#img-grid`, no sólo contra la activación de la tab
(2026-09-20).** El defecto: al abrir un estudio desde Guardados, los cineloops no volvían —las
imágenes fijas sí—. La causa no era la que parecía. `cargarEstudioPorId` termina con
`showTab('datos')`, así que el médico entra a Imágenes **después**; pero llama a
`imgRestaurar(inf.uuid)` **sin esperarla**. Si se entra a la tab antes de que IndexedDB
resuelva, `_imgUuidActual` todavía es `null`, la tira se pintaba vacía **y no se volvía a
pintar nunca**. Las fijas sí volvían porque `imgRender()` corre *dentro* del `.then()`, cuando
la lectura llega. Eso explica exactamente la asimetría del síntoma.

El enganche que sí llega a tiempo es la grilla: `imgRestaurar` pone `_imgUuidActual = uuid` y
**recién después** llama a `imgRender()`, y lo llama también cuando el estudio no tiene ninguna
imagen fija —`CeiboImg.leer` devuelve `[]`, que no es `null`—, que es justo el caso de un
estudio con cineloop y sin fotos. «Nuevo estudio» entra por `imgVaciar`, que nulea el uuid y
repinta igual, así que la tira se limpia sola por el mismo camino.
**No se engancha a `imgRestaurar`:** vive en otro módulo y `cargarEstudioPorId` la llama por su
nombre léxico, así que envolver `window.imgRestaurar` no interceptaría nada — y fallaría en
silencio.

Dos cosas sobre las pruebas de esto, porque las dos costaron una vuelta:
- **`limpiarCampos` NO vacía las imágenes**; lo hace `imgVaciar()`, y sólo desde «Nuevo
  estudio» (lo dice su propio comentario). Una prueba que use `__t.limpiar()` como si fuera
  «paciente nuevo» no reproduce nada: `_imgUuidActual` queda con el estudio anterior y no se
  distingue el arreglo de la falla. Hay que llamar a `imgVaciar()`.
- **Probar el vaciado con la tira ya vacía no prueba el vaciado.** La primera versión de TC-185
  lo hacía y sacar el limpiado no la ponía en rojo. La condición útil exige que antes hubiera
  algo pintado.

**El token `_cineStripGen` es defensa en profundidad y su carrera NO es alcanzable por
`cargarEstudioPorId`:** `imgRestaurar` ya descarta su propia lectura tardía con `_imgGen`, así
que la del estudio anterior nunca setea el uuid ni repinta. El token cubre las **otras** puertas
que llaman a `cineStripRender` —activar la tab, guardar, borrar—, donde no hay nadie aguas
arriba filtrando. Se prueba pidiendo un render y envejeciéndolo antes de que resuelva. Si algún
día alguien lo borra «porque no hace falta», esa condición se pone en rojo.

**El id NO se interpola dentro de un `onclick`.** Va por `data-cine-id` y el manejador se ata
desde JS. Escapar no alcanza en un atributo de evento: el parser decodifica la entidad **antes**
de compilar el handler — es el mismo agujero que documenta la entrada de CardioSalud. Lo cazó
Semgrep (`ceibo-xss-inline-event-dynamic`) sobre la primera versión de la tira, que usaba
`onclick="cineAbrirGuardado('" + escHtml(id) + "')"`. Hoy además se filtra por `_uuidValido` en el
borde. Al tocar la tira: **no volver a meter datos en un atributo `on*`**, por escapados que estén.

**Semgrep: la línea base pasó de 124 a 125** con esto (el `cont.innerHTML` de la tira, misma forma
que el modal). Las dos de `inline-event-dynamic` que habían aparecido **se arreglaron, no se
documentaron como falso positivo** — eran reales.

**Semgrep: la línea base pasó de 123 a 124.** El hallazgo nuevo es `ceibo-xss-innerhtml-concat`
sobre el `ov.innerHTML` del modal. Es falso positivo verificado: **todo lo concatenado son
literales** y cada texto que viene del archivo se escribe con `textContent`. Es la misma forma
que ya tiene `_dcmRenderPreview`, que está en la base desde antes. Si algún día alguien
interpola un dato del DICOM ahí, deja de ser falso positivo — la regla es amplia a propósito.

> **CORRECCIÓN (2026-09-19, mismo día).** Antes decía acá que no había ningún archivo multi-frame
> con qué probar y por eso el reproductor estaba diferido. Eso era cierto **de la base Horos** y
> **falso del pendrive**: `/Volumes/DISK_IMG/GEMS_IMG` tiene **22 cineloops** reales. Horos había
> importado sólo las imágenes fijas. La lección: *la base de datos de un visor no es el export del
> ecógrafo* — mirar el origen, no la copia.

**El «+» de cada slot también abre DICOM (2026-09-20).** Se miran 132 bytes: si dicen `DICM`,
va por el importador; si no, se llama a **`imgFileChosen` tal cual**, con el mismo evento — no
hay una segunda implementación del camino de la foto que pueda desviarse. Un cineloop elegido
desde el «+» abre el reproductor y **no ocupa el slot**, igual que desde el botón.

- **Hubo que sacarle el `accept` al `#img-file-input` también**, y el pedido decía no tocarlo.
  El filtro es por MIME derivado de la **extensión** y los archivos del Vivid no tienen ninguna:
  con `image/*` quedaban en gris y la detección por bytes habría sido **código inalcanzable**.
  No hay otra puerta — los `drop` de los slots sólo reordenan (`text/plain` con el índice), no
  aceptan archivos del sistema. Decisión de Maicol (2026-09-20). El costo es que al agregar una
  foto el selector ya no prefiltra a imágenes.
- **`_dcmImgReservar` toma un slot preferido.** El «+» señala un lugar; mandar la imagen al
  primer hueco de la grilla sería moverle la foto adonde el médico no la puso. El botón de
  importar no lo pasa: importa un lote y no tiene destino elegido.
- Al tocar esto: el defecto más probable es que el `onchange` quede apuntando a `imgFileChosen`
  y **todo lo demás esté perfecto**. TC-186 dispara el input real con un `DataTransfer` para
  cubrir el cableado, no sólo la función.

**Sin el filtro del selector (2026-09-19).** El input **no lleva `accept`**, y es a propósito: el
Vivid escribe los 296 archivos del pendrive **sin ninguna extensión** (`GEMS_IMG/…/Q9JGCGT0`), así
que `accept=".dcm"` los mostraba en gris y no se podían elegir — el filtro del selector es por
extensión y estos no tienen. El formato se valida por los bytes, que es lo único que dice si algo
es DICOM. Tres cosas que se siguen de eso y que no son cosméticas:

- **Se leen 132 bytes antes de cargar el archivo.** Con el selector mostrando todo, alcanza con
  marcar una carpeta con un video adentro para que un `arrayBuffer()` de varios GB entre a memoria
  antes de poder rechazarlo. Con el recorte, un archivo ajeno cuesta 132 bytes.
- **La lista de errores se recorta a 12 y el recorte se dice.** Se puede marcar el pendrive entero:
  un alert de 296 renglones no se lee, se cierra — y el que lo cierra cree que vio todo.
- **El DICOMDIR se reconoce por su SOP Class** (`1.2.840.10008.1.3.10`) y se nombra. Está en la
  raíz del pendrive y ahora es de lo primero que se ve; sin esa rama el motivo sería «está
  comprimido en Explicit VR LE», que manda a mirar donde no es.

**Al probar el DICOMDIR, cuidado con el nombre del archivo.** La primera versión del test buscaba
la palabra «DICOMDIR» en el mensaje de rechazo — y el mensaje **arranca con el nombre del
archivo**, que justamente se llama DICOMDIR. La condición pasaba con la rama borrada. Lo delató
una mutación. Hoy busca «no una imagen», que sólo produce esa rama.

**Tres trampas del formato que costaron una vuelta cada una:**

- **El ítem 0 del pixel data encapsulado es SIEMPRE la Basic Offset Table**, no un fragmento de
  imagen. Contarla como imagen da un «JPEG» que no arranca con `FFD8`. Fue el primer error al
  mirar estos archivos.
- **Adentro de un ítem de longitud indefinida el contenido son ELEMENTOS, no más ítems.** Un
  recorrido que asuma estructura de ítem lee la longitud donde está el VR, salta a cualquier lado
  y se pierde el pixel data: se ve como «el archivo no trae imagen» sobre un archivo válido.
  Por eso `_dcmImgSaltarSQ` es un recorrido de verdad y no un barrido de delimitadores.
- **Un cuadro puede venir partido en varios fragmentos** —es legal—: se concatenan. Quedarse con
  el primero da un JPEG truncado, que el navegador dibuja **a medias** en vez de fallar.

**`_dcmImgReservar` reserva los slots de forma sincrónica y eso no es cosmético:**
`imgCompressLoad` elige slot dentro de su `.then()`, así que sin reservar antes el orden de las
imágenes depende de cuál termine de comprimirse primero — y ese es el orden en que salen en el
PDF.

**Tests.** TC-179 sintético: construye DICOM byte a byte dentro de la página con un JPEG de 1×1,
así que corre siempre y **no lleva un solo dato de paciente**. Cubre extracción, las tres trampas
de arriba, el rechazo por nombre de cada sintaxis, el multi-frame, la reserva de slots y —lo que
importa— que la imagen **sale en el PDF real**, espiando `addImage`. TC-180 corre sobre los `.dcm`
reales y contrasta el JPEG extraído contra un **extractor independiente escrito en Node**: dos
implementaciones del mismo estándar, mismo hash. Lee del disco y **avisa si no encuentra
archivos**, porque son de pacientes y este repo es público.

Siete mutaciones verificadas en rojo. Una sobrevivió a la primera versión: la condición del
cuadro partido probaba que **el lector** devuelve dos fragmentos, no que `dcmImgImportar` los
**concatene** — el mismo error de «verificar el hecho de al lado» que ya había pasado con el
`0.0*` del importador CHM. Se agregó la prueba de punta a punta.

### DICOM — visor de imágenes (pendiente, 2026-09-14) — SUPERADO, ver la entrada de arriba
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
- ~~**`cerrarSesion()` no es un borde de sesión**~~ — **CERRADO 2026-09-23.** Decía que detrás
  del overlay quedaban intactos el formulario, las imágenes y el borrador, y que cerrarlo exigía
  «decidir qué pasa con el borrador: limpiarlo pierde trabajo en curso, conservarlo mantiene la
  fuga — una decisión de producto». **La decisión fue el modal**: se pregunta con las mismas tres
  opciones de «Nuevo estudio» y recién después se limpia, así que no se descarta nada sin haber
  ofrecido guardarlo. Se limpian formulario, imágenes **y el borrador del autosave** —sin esto
  último `_autosaveRestore` lo repone detrás del login en la próxima recarga, que es la mitad que
  el párrafo viejo daba por insalvable—. Ver la entrada del panel de cierre, arriba. Lo que SIGUE
  abierto de aquel párrafo: los listeners de autosave siguen enganchados con la sesión cerrada,
  aunque ya no tienen formulario del que copiar.
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
