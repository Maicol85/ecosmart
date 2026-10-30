<!-- mapa armado sobre 9751f05, 2026-10-29; los números de línea no se guardan a propósito -->
# Mapa de funciones — «Imágenes guardadas», la estrella de imagen, el PPT y los esquemas

Tanda IMÁGENES. Cuatro cosas que viven juntas: la segunda vista de la pantalla **Guardados**, la
**estrella de imagen** con su nota, el **PPT** armado desde esa pantalla y la **función común** que
guarda un esquema de la app como imagen del estudio, cuyo primer uso es la **orejuela izquierda**
de la pestaña ETE.

La referencia visual aprobada es `docs/3d/demo_guardados_imagenes_esquema_aprobado.html` para la
pantalla y `docs/3d/demo_orejuela_esquema_aprobado.html` para el dibujo. **El límite de 24
elementos por PPT y los tres repartos (1, 2 y 4 por diapositiva) salen de esa demo**, no de una
estimación.

Lo que **no** cambió, y está medido: informe narrativo, EN SUMA, PDF, Excel del Laboratorio y PPT
del estudio son idénticos a HEAD en todo estudio. Ver «El A/B y sus dos mitades» al final.

---

## Dónde se guarda una imagen, y las dos listas del mismo registro

| Base | Store | keyPath | Qué guarda |
|---|---|---|---|
| `ceibomed_img` | `imagenes` | `uuid` | `{uuid, imgs[], esqs[], bytes, ts}` |
| `ceibomed_video` | `videos` | `id` (índice `uuid`) | los bytes de los videos |
| `ceibomed_cine` | `cineloops` | `id` (índice `uuid`) | cineloops, fijas DICOM y documentos |

**`imgs` son los SLOTS del formulario** —lo que el médico importó o capturó, lo que se imprime en
el PDF y lo que ofrece el selector del PPT del estudio— y cada uno viaja con una allowlist
explícita: `dataURL`, `ampliada`, `calidad`, `origen`, `_dcmId`, `videoId`, `videoNombre` y, desde
esta tanda, `star`, `nota` y `esquema`.

**`esqs` son los ESQUEMAS**, y es una lista aparte a propósito. Un esquema no es una captura: no
ocupa un espacio de la grilla, no se imprime, no entra al PPT del estudio y no lo elige nadie.
Con la separación, `CeiboImg.leer` sigue devolviendo **sólo `imgs`**, así que ningún emisor
existente tiene que filtrar nada — y eso es lo que garantiza que el papel no se mueva. La
alternativa, meterlo entre los slots con una marca, exigía filtrarlo en **cinco** lectores
maduros (el PDF del formulario, el PDF de un estudio guardado, el PPT, su selector y el
exportador de backup) y el primer olvido publicaba un esquema dentro de un informe firmado.

⚠️ **El precio, declarado: `CeiboImg.guardar` hace un `get` antes del `put`.** Corre en cada
guardado del estudio, y sin leer primero un `put` pelado se llevaría los esquemas puestos. Lo fija
la condición **(F6)** de TC-550 y lo mata la mutación 17.

⚠️ **Un esquema NO entra al backup.** `exportBackup` lee por `CeiboImg.leer`, que devuelve `imgs`.
Se pierde al resetear el navegador y no sobrevive a un import. Declarado en `PENDIENTES.md`
→ **IMG-c**; cambiar el formato del backup es otra orden.

---

## La pantalla

`igVista` — `'inf'` | `'img'`. **«Informes guardados» es el activo por omisión** y no se resetea al
reentrar a la pestaña: la elección es del médico. Lo fija **(A1)**.
`igVistaCambiar(v)` — cambia de vista, vacía los meses abiertos, invalida el índice al entrar a
imágenes y repinta por `renderInformesGuardados`.
`igImgSync(filtrados)` — muestra u oculta cada mitad y, en la vista de imágenes, pinta. **La
llama `igPintar` en un `finally`.**
`_igMostrar(id, mostrar)` — guarda el `display` ORIGINAL en el dataset la primera vez. ⚠️ El
contenedor de Exportar e Importar es un `display:flex` **en línea**: restaurarlo con una cadena
vacía lo dejaba en `block`, con los dos desplegables apilados. Lo mata la mutación 03.

### ⚠️ Por qué el enganche es `igPintar` y no `renderizarListaFiltrada`

`igPintar` es el **único punto por el que pasan las dos cadenas de filtrado** —la larga de
`aplicarFiltros`, con los cinco filtros clínicos y los siete numéricos, y la corta de
`igRepintarTodoSinFiltrar`—. Enganchada en `renderizarListaFiltrada` la pantalla quedaba sorda a
la corta; duplicando el filtrado, las dos pantallas podían discrepar. Es el mismo argumento que
este repositorio ya escribió para `_igPintadosIds`.

La pantalla **no vuelve a filtrar nada**: recibe los estudios que ya pasaron todos los filtros.
Medido: 11 estudios → 165 imágenes, 63 → 945, 13 → 195, FEVI clínico 33 → 495 y el **numérico**
30 → 450, o sea estudios × 15 exacto en los cinco. Lo matan las mutaciones 06 (se arma con todos)
y 07 (se arma con la cadena corta, que no ve los numéricos).

### El rendimiento, con los números al lado

`CeiboImg.indice()` — el índice **sin los `dataURL`**, leído con un **cursor**: 110 registros y
1.650 slots en **137 ms** y 174.571 caracteres de metadata, con `traeDataURL` en false verificado.
Con `getAll()` serían los 108 MB materializados de una vez (221 MB de heap, medido en el commit 1).
`igImgBlobs(uuid)` — los `dataURL` de un estudio, con caché acotada a `IG_IMG_CACHE_MAX` = 40
estudios. ⚠️ **Concatena `imgs` + `esqs` en el MISMO orden que `indice()`**: las dos listas se
recorren por el mismo `idx`, así que invertir una hace que la pantalla abra una imagen y muestre
otra, y las dos son imágenes válidas del mismo estudio.
`igImgPintar(estudios)` — los meses **nacen plegados** y un mes plegado no construye ninguna
miniatura: pintar la página entera cuesta **3 ms síncronos y 22 ms hasta pintar** con 12 grupos y
cero miniaturas. Lo fija **(B1)** y lo mata la mutación 02.
`igImgLlenarMes(grupo)` / `igImgMesToggle(btn)` — construyen las miniaturas **al abrir el mes**:
135 miniaturas en 1 ms de clic, con 72 imágenes cargadas —las del viewport más 150 px—.
`igImgIORearmar` / `igImgIOApagar` / `igImgPintarMiniatura(d)` — el `IntersectionObserver`, con
`rootMargin: '150px'`. Se rearma en cada pintado: los nodos que miraba ya no existen.

La **numeración** es la posición de la imagen en el TOTAL guardado —del estudio más nuevo al más
viejo y, dentro de un estudio, por su orden— y no en la lista filtrada: igual que el «N.º» de un
estudio, «12» identifica siempre a la misma imagen cambien o no los filtros. Es además el número
con el que viaja al PPT.

`igImgAdornar(boton, it)` — **punto de extensión único de la miniatura**: la estrella, el ✎ de la
nota y el número de orden del PPT. Que haya un solo constructor es lo que evita que la grilla se
arme distinto en dos caminos.
`.ig-img-pie` — ⚠️ los cuatro distintivos de abajo van en una **franja flex** y no en cuatro
`position:absolute`: el ✎ y el rótulo «esquema» caían los dos en la esquina inferior derecha, y
el ▶ del video con el número de orden en la izquierda.

### El visor de una imagen guardada

`igImgVisorAbrir(uuid, idx, n, modoTapa)` / `igImgVisorCerrar` / `igImgVisorExtender` /
`igImgMeta(uuid, idx)` / `igImgVisorMedir`.
En la app **se ve el estudio y el paciente**, por `textContent` y nunca por `innerHTML`. En **modo
tapa** no se muestra el paciente y se dice por qué: lo que el médico mira es lo que va al PPT, y
ahí la imagen lleva sólo su número. «📏 Medir» abre el estudio y lleva a su pestaña de imágenes,
que es donde vive el visor con medición: `medImagenAbrir` trabaja sobre `imgSlots`.

---

## La estrella de IMAGEN

**Dos marcas distintas y se ven distintas.** La del ESTUDIO («Casos de interés») es amarilla
`#f5c842` y vive en `campos.caso_interes`; la de la IMAGEN es naranja `#f0a020` y vive en el slot.
Medido en Chrome: `rgb(240, 160, 32)`. Lo fija **(D2)** y lo mata la mutación 08.

`CeiboImg.marcar(uuid, idx, parche)` — **el único escritor**, compartido por la estrella de la
grilla y la del visor, así que las dos no pueden discrepar. Lee-modifica-escribe dentro de **una**
transacción `readwrite`. Un `idx` por encima de `imgs.length` es un esquema, con el mismo acuerdo
de orden que `indice()`.
`igImgStarClic(boton)` — escribe primero y repinta después: si la escritura falla, la pantalla no
puede quedar diciendo que la imagen está marcada.
`igImgNotaGuardar()` / `igImgVisorStar()` — la nota se guarda al **salir del campo** y al cerrar el
visor, nunca por tecla, y al guardarla **se repinta** (sin eso el ✎ quedaba en disco y la
miniatura seguía sin anunciarlo). Desmarcar **borra** la nota: una nota sin estrella no existe
—lo fija **(D6)** y lo mata la mutación 09—.
`IG_IMG_NOTA_MAX` = 300, el mismo número en el `maxlength` y en el borde de escritura.

⚠️ **Lo que hubiera perdido la marca:** `imgPersistir` reescribe el juego entero desde `imgSlots`,
así que un slot restaurado sin las marcas las borraba del disco en el próximo guardado del
estudio. `imgRestaurar` las lleva al slot; medido restaurando seis imágenes, guardando y
releyendo.

La estrella de la grilla mide **44×44** —la regla global de accesibilidad la alcanza por su
`role="button"`— y va con `tabindex="-1"`: un control enfocable dentro de un `<button>` es marcado
inválido. El camino de teclado es Enter sobre la miniatura y la estrella de 44 px del visor.

---

## El PPT: privacidad y armado

`IG_IMG_PPT_MAX` = **24** y `IG_IMG_PPT_POR` = **[1, 2, 4]**, los dos de la demo aprobada.
`_igImgSel` — el orden es el de **elección**, reordenable con las flechas y se saca con la cruz.
Medido eligiendo al revés: clickeadas de la 26 a la 3, la 26 queda en la posición 1.
`igImgSidePintar(mostradas, total)` — la columna derecha entera, por DOM y con
`addEventListener`: un atributo `onclick` infla cada botón a 44 px y la lista de 24 filas no
entra en 232 px.
`igImgPptPedir()` / `igImgPptAviso(mostrar)` — el **aviso previo**. Es un paso propio y no un
`confirm()`: dice que el mazo no lleva ningún nombre, que muchas capturas del ecógrafo traen el
nombre **quemado dentro de la imagen** y que la franja cambia según el equipo, y cuenta cuántas de
las elegidas quedan sin tapar. «Volver y tapar» no genera nada.
`_igImgTapas` / `igImgTapaPintar` / `igImgTapaCablear` / `igImgQuemarTapa(dataURL, tapa)` — el
cuadrado negro. Se guarda en **fracciones** del ancho y del alto, no en píxeles del visor: el
visor muestra a 460 px y el PPT exporta a 800×600. **La tapa se QUEMA dentro de la imagen**, que
es lo único que tapa de verdad; si el quemado falla la imagen **no se exporta**.
`igImgPptExportar()` — reúsa `PptxGenJS`, `PPT_TEMAS` con el tema guardado, `PPT_FONT`, `_pptTxt`,
`_pptEsImagen` y `_pptxDescargarSaneado`. **Ninguna librería nueva.**

**Lo que el archivo lleva, verificado abriéndolo:** 24 diapositivas, 25 medios, 1.393.967 bytes, y
los únicos textos son **los números de imagen y el disclaimer** `DISC_PPT`. Censo sobre los 24 XML:
**ningún nombre de paciente**, y el nombre del archivo (`EcoSmart_Imagenes_<fecha>.pptx`) tampoco
nombra a nadie. El centro y el médico **no van**: salen del estudio cargado en el formulario, que
puede no ser ninguno de los de las imágenes elegidas.

`DISC_PPT` subió a nivel de módulo: con dos copias, el día que una se corrija la misma app
proyecta dos salvedades distintas ante colegas.

**No hay desenfoque automático ni interruptor de «ocultar nombres»**: no estaba aprobado.

---

## La función común de esquemas, y el primero

`ESQ_PIE` — la leyenda de la demo. `esqColor(nombre, porOmision)` — resuelve una variable de CSS
contra el tema vivo. ⚠️ **Los colores van literales en el marcado**: un SVG rasterizado se
decodifica fuera del documento, donde las variables de CSS no existen, y el dibujo saldría negro
sobre negro.
`esqRasterizar(svgTxt, ancho, alto)` — SVG → `<img>` → canvas → JPEG, con **fondo opaco** (un JPEG
no tiene canal alfa) y **reloj propio de 8 s** (una imagen que no decodifica deja la promesa
dormida y cuelga al barrido que la llamó).
`esqGuardarComoImagen(clave, nombre, svgTxt, ancho, alto)` — devuelve `{ok, motivo}` y **no tira**:
la llaman barridos. La `clave` identifica QUÉ esquema es, así que volver a guardarlo **reemplaza**
el anterior: **una sola copia por estudio**. Lo mata la mutación 14.
`CeiboImg.guardarEsquema(uuid, clave, dataURL, nombre)` / `CeiboImg.esquemas(uuid)`. La estrella y
la nota de un esquema **sobreviven** a que el dibujo se redibuje.

### El esquema de la orejuela izquierda

`OAI_ESQ_W` = 340, `OAI_ESQ_H` = 350. `OAI_ESQ_PATHS`, `OAI_ESQ_LOBES`, `OAI_ESQ_TIP` — las
siluetas, portadas de la demo. **La clave de cada una es la del desplegable de la app**, no la de
la demo: `veleta` es la manga de viento y `coliflor` el brócoli.
`_oaiCerrada`, `_oaiBlob`, `_oaiTaper(d, o)` — el motor de geometría. ⚠️ `_oaiTaper` necesita un
`<path>` **en el DOM** (`#oai-esq-tmp`): un path creado con `createElementNS` y no insertado
devuelve longitud 0 en Chrome y la silueta sale vacía sin ningún error.
`oaiEsqSVG()` — **único emisor del dibujo**, usado por la pantalla y por la imagen que se guarda,
así que el médico guarda lo que está viendo.
`oaiEsqHayDatos()` — con los cuatro campos vacíos no se dibuja ni se guarda.

**NO JUZGA.** Sus textos son «Cx reborde VPSI VM VI Ø 21 mm prof. 26 mm Doppler pulsado 48 cm/s»
y el censo de «apta», «no apta», «elegib», «Watchman», «Amulet» y «contraindic» da **cero en las
cuatro morfologías**. La elegibilidad vive en su recuadro, con sus tablas y sus fuentes. Lo fija
**(F1)** y lo mata la mutación 15, que **aplica de más**.

**Sin animación**, a diferencia de la demo: lo que se guarda es una imagen fija, así que animar la
pantalla dejaría el dibujo guardado distinto del que el médico mira, y P1 se cumple por
construcción.

### ⚠️ PINTAR Y GUARDAR SON DOS FUNCIONES, Y ESO ES TODO EL DISEÑO

`oaiEsqSync()` **sólo pinta**. `oaiEsqGesto()` pinta **y** guarda, y es lo que llaman los cuatro
`oninput`/`onchange` de los campos. `calcOAI` —que está en `RECALC_MODULOS`— llama al primero.

Si el guardado colgara de `calcOAI`, **abrir un estudio guardado le escribiría un esquema que
nadie pidió**, que es exactamente «migrar estudios guardados». Es la lección que el D-9, el D-10 y
el D-11 pagaron tres veces. Lo fija **(F3)**, medido con su denominador —el dibujo sí se repinta,
con los valores nuevos, y el registro conserva el mismo `ts`— y lo mata la mutación 16, que
**aplica de más**.

`oaiEsqGuardarDiferido()` — 700 ms y con **firma**: tecleando «12» pasan dos cambios y sin esperar
se escriben dos imágenes de las que una sobra. La firma evita además reescribir la misma imagen.
`oaiEsqAlGuardarEstudio()` / `_esqAlGuardar()` — la **segunda puerta**: hasta el 💾 no hay uuid, y
el flujo normal es medir primero y guardar después, así que sin ella el esquema de un estudio
nuevo no se guardaría nunca. Las tres salidas de `guardarInforme` llaman al embudo, no repiten la
llamada.

El motivo se **dice** cuando no se puede guardar (`#oai-esq-estado`): un esquema que no se guarda
y no avisa es la promesa que el informe no cumple.

---

## Ids del DOM

**Cabecera de Guardados:** `ig-vista-inf`, `ig-vista-img` (ambos `data-ig-vista`), `ig-img-storage`.
**Lo que es sólo de «Informes guardados»:** `ig-lista`, `ig-vacio`, `ig-btn-borrar-todos`,
`ig-io-acciones`.
**La página:** `ig-img-view`, `ig-img-lista`, `ig-img-side`, `ig-img-side-ppt`, `ig-img-contador`,
y los cuatro botones `data-ig-imgf` (`all`, `img`, `vid`, `star`).
**El visor:** `ig-imgv-ov`, `ig-imgv-tit`, `ig-imgv-info`, `ig-imgv-img`, `ig-imgv-msk`,
`ig-imgv-hdl`, `ig-imgv-star`, `ig-imgv-medir`, `ig-imgv-cerrar`, `ig-imgv-nota-box`,
`ig-imgv-nota`, `ig-imgv-ir`, `ig-imgv-pie`.
**El PPT:** `ig-ppt-on`, `ig-ppt-exportar`, `ig-ppt-res`, `ig-ppt-aviso-ov`, `ig-ppt-aviso-txt`,
`ig-ppt-volver`, `ig-ppt-seguir`.
**El esquema:** `oai-esq-caja`, `oai-esq`, `oai-esq-tmp`, `oai-esq-estado`.

⚠️ **Ningún control de esta pantalla lleva un atributo `onclick`**: la regla táctil global matchea
por el ATRIBUTO (`[onclick]{min-height:44px}`) y en una miniatura de 94×70 eso infla la celda y
rompe la grilla. Todo va por delegación con `addEventListener`.
⚠️ **El único control nuevo con `id` que es un campo de entrada es `ig-imgv-nota`**, y el prefijo
`ig-` de `_noEsDelEstudio` lo deja afuera de `campos`: censo 1028 → 1029, **+1 control de pantalla
y CERO campos guardados nuevos**, verificado por diff de ids contra HEAD. Lo fija **(H3)**.

---

## El A/B y sus dos mitades

`_probe_yab.mjs` sobre 132 escenas, 147.032 claves y 58.080 celdas de Excel da **cero diferencias**
en superficie firmada y cero en pantalla, en los cuatro commits que tocan código. ⚠️ **Ese cero es
un control NEGATIVO para el commit 5**: ninguna de esas 132 escenas carga la orejuela.

La prueba del commit 5 es `_probe_img2.mjs --file <HEAD>` contra el árbol nuevo, con la orejuela
**cargada** y el esquema ya guardado: el informe en los tres estilos idéntico al carácter (612
caracteres), el EN SUMA idéntico, las **440** columnas del Excel idénticas clave por clave y los
campos guardados iguales.

Y el **control positivo** de los commits 2 a 4 es el mismo `_probe_img2.mjs` contra HEAD: los dos
botones, la página, el índice y el visor dan «NO EXISTE», o sea que la sonda distingue los dos
árboles.

Las sondas: `scripts/_probe_img1.mjs` (`--censo` y `--perf`, reutilizable) y
`scripts/_probe_img2.mjs`. Las mutaciones: `scripts/_mut_img.py`.

---

## Puntero · lo que la TANDA NOCTURNA, Parte A le movió al esquema de la orejuela (2026-10-30)

El esquema de la orejuela que esta tanda creó **se mudó de lugar, se puso en movimiento y gana
tres controles**. Lo de acá sigue describiendo la **función común** (`esqGuardarComoImagen`,
`esqRasterizar`, `CeiboImg.guardarEsquema`), que no se tocó. Lo que cambió del esquema de la
orejuela está en **`docs/mapa/noc-a-orejuela.md`**:

- la caja del dibujo ya **no vive después del recuadro de resultados**: es hermana de la grilla
  de campos dentro de `#oai-fila`, y a partir de 900 px va a la derecha;
- `oaiEsqSVG` **toma la fase** (`oaiEsqSVG(fase, remolino)`), y lo que se rasteriza es el cuadro
  que está en pantalla;
- el guardado automático de `oaiEsqGuardarDiferido` **sale temprano** mientras el médico haya
  elegido un cuadro con «Incluir en el PDF» para ese mismo estudio (`_oaiEsqManualUuid`);
- el motivo «el guardado de imágenes está apagado» ahora **dice dónde se prende**.

---

## → La TANDA CORRECCIONES (2026-10-30) — puntero

Vive en **`docs/mapa/cor-correcciones.md`**, en archivo propio. Lo que esta zona perdió o ganó:

- **§ 1** · el informe de la orejuela publica las medidas con mayúscula y **sin veredicto de
  aptitud**; «no apto para cierre percutáneo (trombo presente)» se fue y el hecho pasó a la
  Evidencia con Meier 2014, folio 1401. Incluye el **barrido 1c** de veredictos del papel
  firmado, con su denominador.
- **§ 2** · **un solo corte de 75 ms** para el TRIV: `DT_TRIV_HTP_PANEL` se retiró. Y las tres
  formas de la frase de elementos a favor de hipertensión pulmonar, con `vdDisfPresente()` como
  dueño único de «VD disfuncionante».
- **§ 3** · la grilla de VD/AD en **tres columnas de seis**, sin la fila 7, con el VD/VI y su
  selector en una fila.
- **§ 4** · la raíz de AI/VI **leída** en la pantalla de Marfan sin escribirse, y el mensaje del
  índice de Turner nombrando lo que falta.
- **§ 5** · «Incluir en el PDF» **independiente de Config** y con el estudio sin guardar, como
  interruptor. El inventario 5a está medido generando el PDF de verdad.
- **§ 6** · el dibujo de la orejuela **portado de la demo**: aurícula izquierda, VPSI, sin el
  triángulo del VI, trombo adentro, dos capas de silueta y «Manga de viento».
