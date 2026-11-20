# PROMPT 6 — bloque 0: la línea base, medida

Medido el **2026-11-19** sobre `7873930` (sello `v20261119-1634`, md5 `6ff0372e`, 186.658 líneas)
con `scripts/_probe_p6base.mjs` en el **Chrome del sistema** contra el conector falso.
**Cero errores de página y cero errores de consola.**

---

## 1 · El punto D: la causa son DOS cosas independientes, no una

La hipótesis del pedido —«EcoSmart recuerda los identificadores ya vistos»— es **correcta**, y
explica la mitad. La otra mitad —«la tarjeta queda en 0 aunque el puente las tiene»— **tiene otra
causa**, y arreglar sólo la primera dejaría ese síntoma intacto.

### 1a · Por qué no avisa: `_clnkAvisadas` no se vacía al descartar

Reproducido con el gesto del médico, no leyendo:

| Paso | Medido |
|---|---|
| llega el envío, se sondea | aviso **abierto**: «Llegaron 2 imágenes y 1 cineloop del equipo GE del consultorio a las 22:22.» |
| `_clnkAvisadas` | **3** ids |
| se descarta | el puente borra `img_a1`, `img_a2`, `img_a3`; `imagenes_pendientes` **0** |
| `_clnkAvisadas` tras descartar | **3** ids — **los mismos que se acaban de destruir** |
| el ecógrafo manda las MISMAS | `imagenes_pendientes` **3** |
| se sondea | aviso **CERRADO** |

**Control de la hipótesis:** se vacía `_clnkAvisadas` y se vuelve a sondear **sin tocar nada
más** → el aviso **vuelve a abrir**, con el mismo texto. **Control positivo:** con ids **nuevos**
(escena `masNuevas`) el aviso sale igual sin tocar nada.

O sea que la causa es exactamente esa lista, y ninguna otra cosa.

**Por qué los ids son los mismos:** el puente los deriva del contenido del archivo, así que el
mismo archivo re-enviado vuelve con **el mismo `id`**. Para `clnkRevisarImagenes` eso es
indistinguible de «esta imagen ya se avisó», que es la regla que hace que un aviso cerrado con la
✕ no vuelva a salir solo en la misma sesión (decisión 2 de ECO-CONECTOR-2).

⚠️ **NO alcanza con vaciar la lista entera al descartar.** La lista cumple un trabajo real: sin
ella, un aviso que el médico cerró con la ✕ vuelve a abrirse en el sondeo siguiente, cada quince
segundos. Lo que hay que olvidar son **los ids que se destruyeron**, que son los únicos de los que
se sabe que no pueden volver a ser los mismos de antes.

### 1b · Por qué la tarjeta queda en 0: el sondeo nunca la refresca

| Paso | Chips de la tarjeta |
|---|---|
| lista vacía, `clnkLeerEstado()` a mano | `sin imágenes esperando · sin equipos por decidir · 46 MB de 2.0 GB` |
| entran **ocho** imágenes, se sondea | **idéntico**: `sin imágenes esperando` |
| `clnkLeerEstado()` a mano | `8 imágenes esperando · sin equipos por decidir · 46 MB de 2.0 GB` |

Con el panel **a la vista** (`clnkPanelALaVista()` → `true`). `_clnkSondear` pide `/v1/estado`,
lee `imagenes_pendientes` y `equipos_esperando` para **decidir si avisa**, y no escribe un solo
chip; `clnkRefrescar` lo llaman los gestos del médico —descartar, adjuntar, acciones de equipo— y
nunca el sondeo. Es independiente de 1a: con la lista de avisadas vacía, la tarjeta se queda vieja
igual.

---

## 2 · El punto E: `dstLeer` YA funciona; lo roto son la vista previa y el visor

`dstLeer` es la puerta de los **tres** sumideros y clasifica **por los bytes**, con
`_firmaArchivo`:

| Bytes | `_firmaArchivo` | `dstLeer().clase` | `_dcmImgLeer(los mismos bytes)` |
|---|---|---|---|
| JPG (760 B) | `jpeg` | **`imagen`** | **LANZA**: «no tiene la marca «DICM» en el byte 128: no es un DICOM Parte 10» |
| PNG (108 B) | `png` | **`imagen`** | **LANZA**: «el archivo es demasiado corto para ser un DICOM» |
| MP4 (32 B) | `video` | **`video`** | **LANZA**: «el archivo es demasiado corto para ser un DICOM» |
| TXT (29 B) | `null` | rechazo: «no se reconoce el formato. Esta app importa JPG, PNG, BMP, MP4/MOV y DICOM.» | **LANZA** lo mismo |

**Los dos mensajes que el médico vio son, textuales, los que `_dcmImgLeer` lanza.** Y esa función
la llaman **sin preguntar** exactamente dos lugares: `_clnkPrevMini` (la tira de miniaturas de la
vista previa) y `clnkPrevAbrir` (el visor). Ninguno de los dos mira el formato antes.

Lo que esto cambia del pedido: **no hay que escribir un camino de adjuntar nuevo** para JPG, PNG,
BMP, MP4 y MOV al **estudio abierto** — ya entra por `mediosImportar`. Lo que falta es la vista
previa, el visor, y los dos sumideros que hoy **rechazan un video** a propósito:
`dstAGuardado` («los videos MP4/MOV todavía no se pueden adjuntar a un estudio guardado») y
`dstABandeja` («no entran a «Imágenes sin estudio»»).

⚠️ **Y el comentario de `dstAGuardado` dice «desde CeiboLink sólo llegan DICOM, así que esto sólo
alcanza al pendrive». Eso dejó de ser cierto con el buzón.**

⚠️ **`_clnkArchivo` le pone `.dcm` y `application/dicom` a TODO lo que baja.** No rompe `dstLeer`
—que mide los bytes— pero el nombre que el médico ve en un mensaje de error dice `.dcm` sobre un
JPG, y el `type` del `File` es falso.

---

## 3 · Lo que el conector falso manda hoy: contrato **1.1**

| Ruta | Campos que devuelve hoy | Falta para 1.4 |
|---|---|---|
| `GET /v1/estado` | `bytes_tope, bytes_usados, equipos_esperando, imagenes_pendientes, orthanc_vivo, version, vinculado` | `tanda_abierta`, `tanda_imagenes`, `tanda_ultima`, `tanda_cierra`, `bytes_aviso` |
| `GET /v1/imagenes` | clave `imagenes`; por imagen: `bytes, equipo, id, modalidad, recibida, tipo, vence, vista` | la lista `tandas`; por imagen `origen`, `formato`, `se_puede_ver`, `lote`, `lote_cierra` |
| `GET /v1/equipos` | `aet, apodo, estado, id, imagenes, ip, ultimo_envio` | `nombre_para_mostrar` |
| `GET /v1/conexion` | `aet_puente, aviso, direcciones, puerto_dicom`; por dirección `direccion, interfaz, probable` | `carpeta_compartida`; por dirección `tipo` y `enlace` |

`version` **1.1.0**, `bytes_tope` **2147483648**. Hay que llevarlo a **1.4.0** y dejar las
versiones viejas alcanzables, que es lo que el bloque J necesita para medirse.

---

## 4 · Censo de la app, al abrir el prompt

| Qué | Hoy |
|---|---|
| `CLNK_VENTANA_MS` | **120000** — EcoSmart **duplica** la ventana de dos minutos del puente, que es justo lo que el contrato §P8 prohíbe («no la dupliques: usá `lote_cierra`») |
| `CLNK_SONDEO_MS` | **15000**, uno solo |
| `CLNK_ESP_AMBAR` / `CLNK_ESP_ROJO` | **0,85** / **0,95**, calculados acá en vez de leer `bytes_aviso` |
| burbuja | **no existe** (`[id^="clnkbur"]` → cero nodos) |
| `dstCuenta(4,3,1)` | «3 imágenes y 1 cineloop» — **dos** clases, y el punto C pide **cuatro** |
| capa del aviso | **700** |
| `nombre_para_mostrar`, `se_puede_ver`, `lote_cierra`, `tanda_abierta`, `bytes_aviso`, `carpeta_compartida` | **cero apariciones** en `index.html` |
| «2 GB» escrito a mano | **ninguno visible**: la tarjeta ya publica `d.bytes_tope`. El único «2 GB» del archivo está en un **comentario** de `clnkEspacio` |
| `BUZON` / `ENTRADA:` | **cero** apariciones: el prefijo se ve crudo porque `_clnkFilaEquipo` dibuja `apodo || aet` |
