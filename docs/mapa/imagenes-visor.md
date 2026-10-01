<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->
# Mapa de funciones — imágenes y visor de cineloop

Módulo de imágenes (pestaña 🖼️ Imágenes) y visor de cineloop (`#cine-ov`). Confirmado con `grep`
y lectura del fragmento; lo dudoso va marcado y recogido al final.

El visor es **un overlay único**, construido una sola vez, que aloja **dos vistas** (A y B) del
mismo emisor de marcado, con prefijo `b-` en los ids de la B. El estado de cada vista vive en su
objeto (`_vistaA`, `_V` es la activa) y los nombres de ambiente (`_medOn`, `_medCalib`,
`_cineDatos`…) son propiedades redirigidas a la vista activa.

---

## Visor y reproducción

`_cineAbrir` — construye el overlay `#cine-ov` una sola vez, guarda `{loops, i, cuadro, timer}` y monta la vista A — llamada por: `dcmImgImportar`, `medImagenAbrir`, `medFijaAbrirGuardada`.
`_vPanelHTML` — emite el marcado de UNA vista, en cinco zonas: barra lateral de herramientas, lienzo, reproductor, columna de acciones y panel guía.
`_vMontarPanel` / `_vCablear` — montan el panel de una vista y atan sus controles; cada manejador queda ligado a su vista con `_vBind` / `_vCon` — atarlos pelados escribía la medición de la B dentro de la A.
`_cineCargarLoop` — carga el loop `D.i`: dimensiona el canvas a `cols × filas`, resetea el slider, escribe `#cine-cual` y `#cine-ayuda` y dispara la medición de recorte. El primer cuadro lo pinta `_cineRecorteMedir`, para no dibujar dos veces.
`cineIr(n)` — dibuja un cuadro: decodifica el fragmento JPEG con `createImageBitmap` y lo pinta en `cine-cv`. Contador de generación (`V.gen`) para que un decodificado tardío no pise el cuadro elegido.
`cineToggle` — play/pausa, con `setInterval` al período que declara el archivo; alterna el rótulo entre `▶ Reproducir` y `⏸ Pausa`. `_cineDetener` para el timer y restaura el rótulo.
`cineLoop(paso)` — loop anterior / siguiente de la misma importación (`‹` y `›`); sólo actúa con más de uno.
`_cineFps(d)` — velocidad: `msCuadro`, o `fpsDeclarado`, y 25 fps como último recurso, rotulado «por omisión — el archivo no la declara».
`cineCapturar` — captura el cuadro visible **a resolución plena y desde el JPEG original**, no desde el canvas. Entra por `_capturaALaBiblioteca`, puerta única de las capturas: intenta `_bibGuardarJpeg` y, si falla, cae al slot vía `imgCompressLoad`; el toast dice qué camino se tomó.
`cineCerrar` — esconde el overlay, detiene las dos vistas, invalida el recorte en vuelo y suelta los fragmentos. **No destruye la vista B y conserva lo medido.**
`cineGuardarActual` — guarda el cineloop abierto; si sólo falta el uuid lo encola, y avisa si pesa más de `CINE_AVISO_MB`.
`vistaBAbrir` / `vistaBCerrar` / `vistaSyncToggle` / `vistaAlternarMobil` — segunda vista, sincronismo y alternador para pantalla angosta — ⚠️ no verificado: sólo que `_cineAbrir` las cablea.
`_vElegirLoop` / `_vPickerLoop` — eligen qué cineloop va en una vista, desde los registros guardados.
`_vRepintarOverlays` / `_vObservarAncho` — recalzan el canvas de medición al cambiar el ancho: `_medPintar` lo calza leyendo `getBoundingClientRect()` al pintar, así que sin esto las reglas quedan corridas. `_vBiplanoDatos` / `_vBiplanoPintar` resuelven el cruce A × B en `#cine-biplano`.

**Zoom: no hay** control de zoom ni de paneo. Lo más cercano son dos cosas distintas: la familia
`_cineRecorte*` (`De`, `Calc`, `Aplicar`, `Medir`) con `_cineBBoxCuadro`, que recorta
**automáticamente el margen negro** escalando y corriendo el canvas con porcentajes dentro de
`cine-recorte` (en píxeles el canvas no cambia, así que la calibración no se entera); e
`imgToggleAmpliar`, que marca un slot para que salga a ancho completo **en el PDF**.

**Velocidad: tampoco hay control.** La cadencia la fija el archivo vía `_cineFps`; no hay
selector de 0,5× / 2×. El único ajuste sobre el tiempo es ir cuadro a cuadro con `cine-slider`.

---

## Medición y calibración

El modo medición dibuja sobre un segundo canvas, `cine-med`, hermano del de imagen.

`medToggle` — enciende/apaga la medición de la vista: muestra el overlay, **pausa el cineloop** y ata clic, mousedown y mousemove.
`medHerramienta(h)` — selecciona herramienta, abre su grupo, enciende la medición si estaba apagada e inicia la sesión del método. Deformación tiene tres compuertas: `_medSideRender` no la dibuja, ésta la rechaza y `_medSoltarDef` deshace el estado.
`_MED_HERRS` / `_MED_GRUPOS` / `_MED_GRUPO_DE` — las diez herramientas en tres grupos: 2D (Distancia, Área, Simpson), Doppler/M (Velocidad, Tiempo, FC, VTI) y Deformación (Strain VI, LARS, Strain VD).
`_medSideRender` — pinta la barra lateral en `cine-side`; el color del grupo sale del tema y el del texto se deriva por luminancia con `_medTextoSobre`.
`_medPunto` / `_medPuntoCanvas` — pasan el clic de pantalla al espacio de la imagen dividiendo por `cv.width / rect.width`.
`_medEscalaEn(p)` — **el corazón de la calibración**: mm por píxel ahí, o el motivo por el que ahí no se mide. Prioridad: región DICOM que contenga el punto → calibración manual → rechazo con mensaje. Devuelve `mmPorPx` y `mmPorPxY` por separado, porque el área necesita las dos (`cm² = px² × dx × dy`), y un `fuente`: `'del archivo'` o `'calibración manual'`. `_medRegs` da las regiones del loop.
`medRecalibrar` — calibración manual de **distancia**: borra la escala manual y su línea, y espera una referencia conocida.
`medCalibrarVelocidad` — calibración manual de **velocidad** (eje del trazo espectral). Se ofrece siempre con esa herramienta activa, pero sólo se activa sola si el archivo no declara ninguna región. **El modo M se rechaza siempre**, también con calibración manual puesta: ahí el eje Y es distancia, no velocidad.
`_medVelCalEn` / `_vtiVelCmsEn` / `_medGradMmHg` / `_vtiDe` — velocidad en un punto, VTI por envolvente y gradiente `ΔP = 4·V²`. Hay además un `_medAutoCalibrar` — ⚠️ no verificado.
`_medShoelacePx` / `_medAreaCm2` / `_medAreaValidar` — área por fórmula del cordón, en valor absoluto. **Un contorno que se cruza a sí mismo devuelve menos área que la real, sin síntoma.**
`_medAreaDown` / `_medAreaMove` / `_medAreaUp` / `_medClic` / `_medVelClic` / `_medTiempoClic` / `_medManejador` — manejadores de puntero; sólo uno escucha a la vez, porque el `mouseup` de un arrastre dispara un `click`.
`_medPintar` — redibuja el overlay y lo calza sobre la imagen. `_medBarra`, `_medEstado` y `_medFijosSync` manejan el panel guía (`cine-med-barra`) y la visibilidad de los botones fijos.
`medBorrar` — borra las mediciones de la vista; **la calibración se conserva**.
`medReset` — al cambiar de cuadro borra lo del cuadro que se deja, conserva la calibración manual y **oculta sin borrar** lo confirmado de Simpson, Strain, LARS y VD: esos métodos exigen cuadros distintos.
`medCerrarVisor` / `medApagar` — apagan la medición y resetean el estado; `medApagar` descarta además las sesiones de Simpson y de strain.
`medCapturarConMedicion` — captura el cuadro **con** las mediciones más una franja blanca con la etiqueta y el resultado (`_medResultadoParaCaptura`, `_medResultadoCorto`, `_medEtiqAutoPoner`, `_medFontQueEntra`). El overlay sólo se compone si mide exactamente lo mismo que la imagen; escalarlo movería cada medición respecto de la anatomía.
Los cuatro métodos multi-paso tienen su familia de prefijo, cada una con `Confirmar` y
`Reiniciar`: `medSimpson*` (FEVI por discos, con `Integrar`, `SegundaVista`, `TablaPDF`),
`medStrain*` (strain del VI y bull's eye, con `VistaSiguiente`, `ElegirLoop`), `medLars*` y
`medVd*`.
`medVtiAsignar` / `medVtiCargar` / `_vtiPanel` — asignan los VTI medidos a un rol y los cargan al informe. `medGrupoToggle` es el acordeón de la barra lateral.

### Medir sobre una imagen fija de la grilla

`medFijaToggle` — enciende el modo «📏 Medir» de la grilla: marca `#img-grid` con la clase `med-on` y muestra `#med-fija-aviso`, que dice que **las mediciones no salen en el PDF** y que **los videos MP4 no se miden**.
`medFijaClic` — oyente delegado sobre `#img-grid`; resuelve el slot por `dataset.idx` y abre el visor. `_medFijaDe`, `_medFijaRegistrar`, `_imgAvisoMedir` y `_medFlushPendientes` sostienen la tabla de sesión `_medFijas` (los originales DICOM por `_dcmId`) y el cartel de la tarjeta.
`medImagenAbrir(idx)` — abre un slot cualquiera como loop de **un** cuadro con `regiones: []`; el nombre es literalmente «Imagen del estudio · sin escala DICOM», así que sólo se mide calibrando a mano. `medFijaAbrirGuardada(id)` hace lo propio con una fija de disco.

---

## DICOM

**Sí, hay soporte DICOM real**, y son dos lectores distintos con propósitos distintos.

**1) Imágenes y cineloops** — parser propio, sin librería:
`_dcmImgLeer(buf)` — valida la marca `DICM` en el byte 128, recorre el meta header (siempre Explicit VR LE) tomando `(0002,0010)` sintaxis de transferencia y `(0002,0002)` SOP Class, y devuelve un objeto con `ts`, `sop`, `cols`, `filas`, `frags`, `regiones`, `dicomdir` y `rechazo`, entre otros. Los cuadros quedan como fragmentos JPEG (`7FE0,0010`), no como píxeles decodificados.
`DCMIMG_TS` / `_DCMIMG_VR4` — sintaxis de transferencia aceptadas y VR de longitud de 4 bytes. **Sólo se importa JPEG Baseline**, lo que exporta el GE Vivid; otra compresión se rechaza con su nombre.
`_dcmImgRegiones` — lee la secuencia de regiones de calibración (con `_dcmImgAscii` y `_dcmImgSaltarSQ` como accesorios). `SL` y `SS` se leen **con signo**: un Reference Pixel Y0 negativo leído sin signo se volvía un número astronómico y la velocidad salía absurda en vez de fallar.
`_dcmImgRegionEn` / `_dcmImgRegionMedible` / `_dcmImgRegionVelocidad` / `_dcmImgRegionTiempo` / `_dcmImgRegionVti` / `_dcmImgVelocidadEn` — qué región cubre un punto y qué se mide ahí. `dcmImgPick` abre `#dcmimg-file-input`.
`dcmImgImportar(fileList, slotPreferido)` — **lee 132 bytes antes del archivo entero**: si no dicen `DICM` no se carga nada, porque el input sin `accept` permite marcar una carpeta con un video de varios GB adentro. Rechaza el `DICOMDIR` nombrándolo. `_dcmImgReservar(n, preferido)` le reserva los slots.
`mediosImportar` / `mediosPick` / `_firmaArchivo` / `_MEDIO_MIME` — importador unificado: clasifica por **los bytes**, no por la extensión, y rutea a DICOM, imagen o video.

**2) Mediciones (DICOM SR)** — bloque aparte, ajeno al visor, con su propio lector de dataset
Parte 10 (`_dcmLeerP10`, `_dcmDataset`, `_dcmSecuencia`, `_dcmRecorrer`). Entra por
`dcmImportarSR(fileList)` —mediciones de un SR o de un CHM del GE Vivid al formulario, con
previsualización y mapeo por etiqueta y por código— y sale por `dcmExportarSR`, que emite un SR
del estudio para PACS.

Hay además un camino **por red**: Orthanc, un servidor DICOM local (`orthancBuscar`,
`orthancFiltrar`, `orthancPanelCerrar`, panel `#orth-panel-overlay`) — ⚠️ no verificado.

---

## Ciclo de vida de imágenes

El estado son dos variables: `imgSlots` (con `null` en los vacíos) y `imgSlotCount`.

`imgRender` — repinta la grilla `#img-grid` entera desde `imgSlots`.
`imgRenderCountBtns` / `imgSetCount(n)` / `imgAddSlot` / `imgEnsureLen` / `_imgLastFilled` — cantidad de slots (`#img-count-btns`); `imgSetCount` no baja del último ocupado.
`imgPick(idx)` — marca `imgActiveSlot` y abre `#img-file-input`; `imgFileChosen` / `imgFileElegido` reciben el archivo elegido.
`imgCompressLoad(file, idx, origen)` — puerta única de entrada de una imagen a un slot: comprime y la deja en `imgSlots[idx]`. `origen` distingue `'estudio'` de `'visor'`.
`_imgComprimir(src, cal)` / `imgSetCalidad(idx, cal)` / `_imgSelectorCalidad` — calidad con la que la imagen sale en el PDF. El original vive en `_orig`, **sólo en memoria**.
`imgRemove(e, idx)` — borra un slot y marca editado. `imgSwap(a, b)` y `_imgAttach` reordenan arrastrando (PC) o con tap-para-intercambiar (mobile); `imgSwapSel` guarda el tap.
`imgToggleAmpliar(idx)` — marca el slot como ampliado (ancho completo y media página **en el PDF**); doble clic o tap prolongado.
`imgVaciar` — **vaciado completo al abrir un paciente nuevo**: incrementa `_imgGen` para invalidar restauraciones en vuelo, pone `_imgEditado = false` y `_imgUuidActual = null`, deja dos slots vacíos y repinta — llamada por «Nuevo estudio».
`imgMarcarEditado` / `_imgEditado` — bandera de «el médico tocó las imágenes en esta sesión». **Autoriza el borrado** de lo persistido cuando `imgSlots` queda vacío: sin ella, la reimpresión de un PDF o una lectura fallida de IndexedDB convertían un estado transitorio en destrucción permanente.
`_imgUuidActual` — uuid del estudio en pantalla. Se pone al guardar y al restaurar y se limpia en `imgVaciar`; si sobreviviera, un cambio de calidad escribiría sobre el paciente anterior.
`imgGuardadoActivo` — lee el toggle «Guardar imágenes con los estudios» de `localStorage`, clave `cfg-guardar-imagenes` (`IMG_CFG_KEY`). **Viene apagado de fábrica**: así las imágenes viven sólo en la sesión.
`videoAbrir(idx)` / `videoRestaurar(uuid)` / `_videoPoster` / `_videoTkhdWH` / `_videoNormalizarMp4` — slots de video. Un slot con `videoId` es un video, no una foto: sin esa marca volvería como imagen y se imprimiría en el PDF.
`cineStripRender` — pinta la tira `#cine-strip`, que es **«los archivos del estudio»**: dos fuentes, los slots en pantalla primero y los registros de disco después, deduplicando por id. La lectura de disco exige uuid válido; los slots se muestran sin él, porque son el formulario abierto.
`_bibGuardarJpeg(bytes, cols, filas, nombre, posterURL, meta)` — escribe un JPEG en los archivos del estudio como registro `tipo:'doc'`, y repinta la tira. `_bibVaAlSlot` decide si un archivo puede ocupar un espacio de la grilla, para el botón 📄 y el arrastre.

---

## Persistencia (IndexedDB)

**Cuatro bases separadas, una por tipo de contenido**; agregar un store a cualquiera exige subir
su `DB_VER`. Las cuatro comparten la forma: un `_abrir()` que cachea la promesa y falla
**cerrado** (`resolve(null)` ante error, `onblocked` o 3 s de timeout) y un `_tx(modo, fn)` que
resuelve `null`/`{ok:false}` si la transacción aborta. **No hay respaldo a `localStorage` a
propósito**: cada imagen son decenas de KB en base64.

| Base | Store | keyPath | Índice | Qué guarda |
|---|---|---|---|---|
| `ceibomed` | `informes` | `_pk` | `app` | los estudios (ajena a este módulo) |
| `ceibomed_img` | `imagenes` | `uuid` | — | el juego de imágenes de un estudio |
| `ceibomed_video` | `videos` | `id` | `uuid` | los bytes de los videos |
| `ceibomed_cine` | `cineloops` | `id` | `uuid` | cineloops, fijas DICOM y documentos |

`CeiboImg` — `disponible`, `guardar(uuid, imgs)`, `leer(uuid)`, `borrar(uuid)`, `borrarTodo`, `recolectar(uuidsVivos)`, `uso`, `cuota`. El `guardar` usa una **allowlist explícita y no un spread**, y eso garantiza que `_orig` no llegue al disco. Viaja por slot: `dataURL`, `ampliada`, `calidad`, `origen`, `_dcmId` y `videoId`/`videoNombre`. Sin imágenes **borra el registro**.

`CeiboVideo` — `disponible`, `guardar(uuid, vids)`, `leer(uuid)`, `borrarTodo`, `uso`.

`CeiboCine` — `disponible`, `guardar(rec)`, `listar(uuid)`, `leer(id)`, `borrar(id)`, `recolectar(uuidsVivos)`, `uso`. **Guarda tres cosas distintas** discriminadas por `tipo`: `'loop'`, `'fija'` y `'doc'`.

`_cineRegistro(uuid, loop, poster, idFijo)` — arma el registro: concatena los fragmentos JPEG en un `Uint8Array` con un `Int32Array` de offsets. **Lo que se guarda no es el `.dcm`**: son los cuadros JPEG y cuatro números (cantidad, velocidad, ancho y alto), y se tira la cabecera DICOM, que trae `PatientName`, `PatientID` e `InstitutionName` en claro. Las regiones de escala **sí** viajan: sin ellas un loop reabierto no se podría medir. `_cineDesdeRegistro(r)` reconstruye con `subarray` lo que consume `_cineAbrir`.

**Quién lee y escribe**

- Escriben: `imgPersistir(uuid)` → `CeiboImg.guardar`; `cineGuardarActual` y `_bibGuardarJpeg` → `CeiboCine.guardar`; `medFijasPersistir(uuid)` → los originales de las fijas; `_cinePersistir`.
- Leen: `imgRestaurar(uuid)` → `CeiboImg.leer`, y llama en cadena a `videoRestaurar` y `medFijasRestaurar`; `cineStripRender` y `medFijasRestaurar` → `CeiboCine.listar`; `medFijaAbrirGuardada` → `.leer`.
- Borra: `imgRecolectarHuerfanas` → `CeiboImg.recolectar`, gateada por `CeiboStore.lista()` y `CeiboStore.modo() === 'indexedDB'`. La condición es sobre **el estado del store**, no sobre el largo de la lista: con un arranque degradado la caché puede tener 2 estudios mientras IndexedDB tiene 60.
- Mide: `imgStorageRender` pinta el consumo en `#ig-img-storage` con `CeiboImg.uso()` y `CeiboImg.cuota()`, **por DOM y no con `innerHTML`**.

`_cinePuedeGuardar` — las **dos** condiciones para que guardar signifique algo, reportadas por
separado (`falta: 'toggle' | 'uuid'`). Como el flujo normal es importar y medir mientras se llena
el formulario, lo habitual es que falte el uuid: de ahí `_cineEncolar`.

---

## Botones e ids del DOM

**Pestaña 🖼️ Imágenes:** `img-count-btns`, `img-grid`, `med-fija-btn` (`medFijaToggle`),
`med-fija-aviso`, `cine-strip`, `ig-img-storage` (en Config/IO), los campos ocultos
`strain_manual` y `simpson_manual`, y tres inputs ocultos: `img-file-input` (`imgFileElegido`),
`dcmimg-file-input` (`dcmImgImportar`) y `medios-file-input` (`mediosImportar`). Botones visibles
de importación: «🩻 Importar DICOM» (`dcmImgPick`), «📥 Importar imágenes y videos» (`mediosPick`)
y «🔍 Buscar en Orthanc» (`orth-buscar-btn`). Los dos inputs de importación van **sin `accept`** a
propósito: el filtro real es la firma de bytes, así que los archivos sin extensión también entran.

**Overlay del visor** (`cine-ov`, `position:fixed;inset:0`): `cine-vtoggle`, `cine-cerrar-todo`
(la ✕, que no pide confirmación porque no se pierde nada), `cine-paneles`, `cine-biplano`,
`cine-simp-uni`, `cine-dop-slot` con `dop-cajon`, `d2-cajon`, `cine-sync`.

**Por vista** (prefijo `b-` en la B): `cine-panel`, `cine-cual`, `cine-side`, `cine-lienzo`,
`cine-recorte`, `cine-cv` (imagen), `cine-med` (overlay de medición), `cine-play`, `cine-slider`,
`cine-num`, `cine-prev`, `cine-next`, `cine-ayuda`, `cine-acciones`, `cine-medir`,
`cine-med-recal`, `cine-med-borrar`, `cine-guardar`, `cine-cap`, `cine-med-cap`, `cine-cap-etiq`
(con `maxlength` de `_CAP_ETIQ_MAX`), `cine-med-barra` y, sólo en la vista A, `cine-add-b` y
`cine-cerrar`. Los ids de las herramientas salen de `_MED_HERRS`:
`cine-med-dist`, `cine-med-area`, `cine-med-simp`, `cine-med-vel`, `cine-med-t`, `cine-med-fc`,
`cine-med-vti`, `cine-med-str`, `cine-med-lars`, `cine-med-vd`.

Dos reglas de id: **ningún control de los cajones Doppler y 2D lleva `id`**, porque
`guardarInforme` barre `input[id]` de todo el documento y esos cajones son anotadores, no dato
del informe; y «➕ Vista» y «Cerrar» se emiten **sólo en la vista A**, para no duplicar ids.

---

## No confirmado

Confirmadas por nombre y por llamador, con el cuerpo **no leído**: `vistaBAbrir`, `vistaBCerrar`,
`vistaSyncToggle`, `vistaAlternarMobil`, `_medAutoCalibrar`, `_cineEncolar` y los iniciadores de
método (`_simpIniciar`, `_strainIniciar`, `_larsIniciar`, `_vdIniciar`).

- Orthanc: confirmados el marcado, los ids del panel y los manejadores; no se leyó la implementación ni cómo se configura el host.
- `_cineRecorteMedir` y `_cineBBoxCuadro`: el recorte sale de un bounding box del cuadro decodificado; no se leyó el umbral de negro ni cuántos cuadros muestrea.
- `_cinePptMs`, `_cineAMp4` y vecinas: hay un camino de cineloop hacia PPT/MP4; sólo se confirmaron los nombres.
- Nada de este mapa se verificó en Chrome: es lectura de código sobre `5137c30`, no una medición.
