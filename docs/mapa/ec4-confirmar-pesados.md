# ECO-CONECTOR-4 — confirmar solo lo que entró, archivos pesados, ver antes de asignar, cineloops a la vista

Mapa de la tanda **ECO-CONECTOR-4** (2026-11-12). Está armado sobre el commit de cierre y **no
guarda números de línea** a propósito: la línea cambia en cada edición, el nombre de la función no.

Lo que la tanda cerró salió de que el médico probó ECO-CONECTOR-3 con CeiboLink **real** y
encontró cuatro cosas. La primera era grave y las otras tres eran de uso.

---

## 1 · El veredicto por archivo — por qué existe

### El defecto

El médico adjuntó al estudio abierto un grupo de **dos imágenes y un DICOM sin comprimir de
1016×708 por 171 cuadros** (351,9 MB de píxeles). EcoSmart rechazó el grande con un cartel —estaba
por encima del tope de 192 MB— y las otras dos entraron. El médico guardó el estudio. Después
CeiboLink mostraba «sin imágenes esperando» y «0 KB de 2.0 GB», cuando antes decía 4 imágenes y
368 MB.

**El archivo rechazado se confirmó y se borró en CeiboLink, sin haber entrado a ningún lado.**

### Dónde estaba, y dónde NO estaba

La hipótesis de la orden —«el id se anota apenas el importador vuelve sin lanzar excepción»— era
**correcta para UN sumidero de los tres**, y eso cambió el arreglo:

| sumidero | función | cómo confirmaba | ¿roto? |
|---|---|---|---|
| estudio abierto | `dstAlActual` | `await mediosImportar(...)` y, si no lanzó, `push(id)` | **SÍ** |
| estudio guardado | `dstAGuardado` | `confirmar.push(id)` sólo tras `CeiboImg.agregar` / `CeiboCine.guardar` ok | no |
| bandeja | `dstABandeja` | `_clnkPorConfirmar.push` sólo tras `clnkbGuardar` ok | no |

Los dos de abajo usan `dstLeer` directo y ya tenían un resultado explícito. El de arriba delegaba
en `mediosImportar`, **que no devolvía nada**, y un rechazo vuelve sin lanzar: el importador junta
los motivos en una lista y los muestra en un cartel.

### El arreglo, en el origen

`mediosImportar` y `dcmImgImportar` devuelven ahora:

```js
{ n: <archivos>, ok: <entraron>, no: <no entraron>, res: [ { nombre, ok, motivo }, … ] }
```

`res[i]` corresponde a `files[i]`. **Arranca en `ok:false`** a propósito: lo que no llegue a
marcarse como entrado no se confirma. Una copia de más en el conector se borra sola a las 24 h; una
imagen borrada sin copia no vuelve.

⚠️ **`imgCompressLoad` DEVUELVE UNA PROMESA de «el slot quedó puesto», y las dos puertas la
ESPERAN.** Es el segundo hueco, y no estaba en la orden: la compresión es **asíncrona** y puede no
llegar a poner la imagen por dos caminos —el token `_imgGen` cambió porque se abrió otro estudio, o
`_imgComprimir` falló—. Hasta esta tanda la **reserva** del slot se tomaba por éxito. Los
llamadores que no esperan el valor siguen funcionando exactamente igual: lo que se agrega es el
valor de vuelta.

⚠️ **UN CINELOOP «ENTRÓ» CUANDO QUEDÓ EN LA COLA DEL ESTUDIO**, no cuando se abrió el reproductor:
la cola es lo que `imgPersistir` escribe al guardar, y de eso depende la confirmación. Si la
escritura falla, se **desmarca**.

### Quién consume el veredicto

`dstAlActual` mira `r.res[0].ok` —manda un archivo por vez, de a uno y en serie— y sólo entonces
anota el id. Lo que no entró va a `fallos[]` con su motivo, y el cartel dice **cuántos siguen
esperando**: sin ese número, «no se pudieron adjuntar 1 de 3» se lee como que ese archivo se
perdió.

---

## 2 · El tope deja de rechazar

| constante | valor | qué hace |
|---|---|---|
| `DCM_CRUDO_MAX` | 192 MB | a partir de acá se **pregunta** |
| `DCM_CRUDO_DURO` | 768 MB | a partir de acá **no se ofrece abrir** |

Los dos se leen por `_dcmCrudoTope()` y `_dcmCrudoTopeDuro()`, que honran `window.__dcmCrudoMaxTest`
y `window.__dcmCrudoDuroTest`. ⚠️ **El duro se ordena con `Math.max` contra el blando**: con los dos
ganchos puestos al revés, un archivo caería a la vez en «preguntar» y en «ni preguntes», y cuál gana
dependería del orden de dos `if`.

`_dcmCrudoRechazo` conserva sólo los rechazos **duros**: el formato que esta app no interpreta
—bits, muestras, planar, espacio de color— y el pixel data más corto de lo que el archivo declara.

`_dcmCrudoPreguntar(d, info)` vive en **un** lugar y por eso alcanza a las dos puertas que
convierten píxeles crudos: `dcmImgImportar` y `dstLeer`.

⚠️ **ES UN `confirm` NATIVO Y NO EL MODAL DE LA APP**, y está medido por qué: cuando esto corre, el
modal de CeiboLink **ya está abierto** mostrando el progreso («Bajando 2 de 3…»), así que abrir el
mismo modal encima lo pisaría y al volver no habría a qué estado regresar. Es además lo que esta app
ya hace para el tamaño de un video, en `videoCargarEnSlot`. **Lo que cuesta, declarado**: los dos
botones se ven como «Aceptar» y «Cancelar», así que el texto dice con todas las letras qué hace cada
uno (`Aceptar = ABRIR IGUAL` / `Cancelar = DEJARLO ESPERANDO`).

### El fallo por memoria

El bucle de conversión entero va dentro de un `try`. Quedarse sin memoria **no es un `return`
ordenado**: `createImageData` y `toDataURL` lanzan. Hasta esta tanda esa excepción subía hasta
`dcmImgImportar`, que la contaba como un fallo del archivo… pero por el camino del estudio abierto el
id ya se anotaba igual. Acá se convierte en un NO ENTRÓ explícito. Los cuadros ya comprimidos se
**sueltan** antes de volver.

`window.__dcmFallaMemoriaTest` es el gancho que deja a un caso ejercitar esa rama sin agotar de
verdad la memoria de la máquina.

---

## 3 · «Sin estudio»: ver antes de asignar

| pieza | dónde |
|---|---|
| la miniatura que se guarda | `dstThumb`, llamada desde `dstABandeja` |
| la lista sin los megas | `clnkbListar` → `thumbs` + `posters` |
| la fila de miniaturas | `_igBandMiniaturas` / `_igBandMini` |
| abrir un archivo | `clnkbVer(idEnvio, clase, k)` |
| el lightbox de una fija | `_clnkbVerFija` / `_clnkbVerCerrar` |

⚠️ **LOS `thumb` Y NO LOS `dataURL`.** Una fija de la bandeja es un JPEG de calidad media de un par
de cientos de KB; veinte envíos de diez imágenes serían decenas de MB en memoria sólo para dibujar
una grilla de 62 px. El `thumb` son ~4 KB y lo escribe `dstABandeja` con los píxeles que ya tiene en
la mano. Los cineloops ya tenían su `poster`.

⚠️ **UN `<button>` Y NO UN `div` CON `onclick`**: así lo alcanza la regla táctil global del archivo
—`button, [role=button], .btn, …` con su piso de 44 px— y lo anuncia el lector de pantalla.

⚠️ **EL CINELOOP VA A `_cineAbrir`, EL VISOR QUE YA EXISTE**: lo que la bandeja guarda es exactamente
la misma forma que un cineloop de un estudio —cuadros concatenados con su tabla de
desplazamientos—, así que `_cineDesdeRegistro` lo reconstruye sin una línea propia.

⚠️ **PARA LA FIJA NO HAY UN VISOR REUTILIZABLE, y se midió.** El de «Imágenes guardadas»
(`igImgVisorAbrir`) está atado a `uuid` + `idx` de un **estudio guardado**: lee por
`igImgBlobs(uuid)` y busca el informe por `uuid`. La bandeja, por definición, no tiene estudio.
Enhebrarle un modo a un visor maduro que el médico usa todos los días —con su estrella, su nota, su
tapa de PPT y su «ir al estudio»— para una ventana de mirar es el mismo cambio que ECO-CONECTOR-3
decidió NO hacer con `igItemHTML`. Lo que se usa es el **molde de `_docVer`**.

⚠️ **LAS DOS ACCIONES OPERAN SOBRE EL ENVÍO ENTERO, Y LO DICEN.** Un envío partido entre la bandeja y
un estudio es peor que uno entero en el lugar equivocado —el segundo se vuelve a asignar, el primero
hay que reconstruirlo—, y ésa es la invariante que `clnkbAsignar` ya tiene medida.

**Mirar no modifica nada**, y no es una promesa: `clnkbVer` lee el registro y no escribe en ninguna
base, no toca `imgSlots`, no encola y no confirma ni un id.

---

## 4 · Los cineloops en «Imágenes guardadas»

`CeiboCine.indice()` es nuevo y va **con cursor**: de cada registro copia la metadata y el `poster` y
descarta `datos` y `offs` en la iteración siguiente. ⚠️ `listar`, `uso` y `recolectar` usan
`getAll()`, que materializa TODOS los registros con sus megas adentro — el pico de más de cien MB que
esta casa ya documenta, y por eso existe `CeiboImg.indice`.

⚠️ **SÓLO LOS `tipo:'loop'`, Y NO ES UN FILTRO DE ADORNO**: esa base guarda **dos** cosas, los
cineloops y el **original** de cada fija DICOM (`tipo:'fija'`), y esa fija ya está en la galería como
imagen del estudio. Sin el filtro, cada DICOM fijo aparecería dos veces.

| pieza | dónde |
|---|---|
| el índice | `CeiboCine.indice()` |
| se carga con el de imágenes | `igImgIndiceCargar` → `_igLoopIndice` |
| el filtro | `igLoopPasaTipo()` |
| se agrupan por mes | `igImgPintar` → `_empujarLoops` |
| la celda | `igImgLlenarMes`, rama `it.loop` |
| el clic | `igImgThClic`, rama `th.dataset.igCine` |

**Qué filtros pasa:** «Todas» y «Videos». **No** pasa «Imágenes», porque no lo es, y **no** pasa
«⭐ De interés» — la estrella se guarda por slot con `CeiboImg.marcar(uuid, idx, …)` y un cineloop
no tiene slot ni idx: no hay dónde escribirla. Con la estrella fuera, ese filtro sigue devolviendo
exactamente lo que devolvía antes de esta tanda.

**No entran al mazo del PPT**, con el motivo a la vista en `ig-ppt-res`. Una diapositiva lleva una
**imagen**, y meter un cineloop ahí significa convertirlo a MP4 —que esta app sabe hacer, pero por el
camino del PPT del estudio, con su propio aviso de peso—. Mezclarlo acá sin esa maquinaria pondría en
el mazo un cuadro suelto haciéndose pasar por el cineloop.

⚠️ **NO SUMAN A `totalImgs` NI A `mostradas`**, y es una decisión: `n` es el número que identifica a
UNA imagen en el visor y en el PPT, y correrlo cambiaría el número de **todas** las imágenes
guardadas del médico. El pie los cuenta aparte («… y 3 cineloops»).

El índice se invalida **al entrar a Guardados**, que es donde ya se invalidaba el de imágenes: un
lugar en vez de cinco.

---

## 5 · Lo que esta tanda NO tocó

- La carga de DICOM desde pendrive **dentro de un estudio abierto**: el destino es obvio y sigue
  yendo directo.
- Los demás formatos DICOM comprimidos y la BE sin comprimir (siguen en `EC3-g` y `EC3-i`).
- La carpeta vigilada de CeiboLink, el login con Supabase y cualquier cosa del lado del conector.

---

## 6 · Los casos

| caso | qué fija |
|---|---|
| **TC-862** | el hallazgo: el grupo mixto confirma **solo** lo que entró, y el conector borra exactamente esas dos |
| **TC-863** | un grupo donde no entra nada no confirma nada; el pendrive tampoco cuenta un rechazo como éxito |
| **TC-864** | los otros dos sumideros, con su control |
| **TC-865** | la pregunta con el peso; «Abrir igual» y «Dejarlo esperando» |
| **TC-866** | el tope duro y el fallo por memoria |
| **TC-867** | miniaturas y visor; mirar no modifica nada |
| **TC-868** | asignar al estudio elegido y a ningún otro; borrar con confirmación; la grilla sin los megas |
| **TC-869** | el cineloop en «Todas» y «Videos», con su marca, abriendo su visor |
| **TC-870** | fuera del PPT, del Excel, del censo y de la lista de estudios |
| **TC-871** | el apodo y el nombre del estudio como texto, aislados en un `bdi` |

**Adaptado:** **TC-861 (G)**, con su condición **invertida** — afirmaba que el tope rechaza, y eso
dejó de ser cierto por orden del médico. Hoy exige que el mensaje de rechazo por tamaño **ya no
esté** y que el mismo descriptor imposible **dispare la pregunta**, así que puede fallar por los dos
lados.

El barrido de mutaciones es `scripts/_mut_ec4.py`; las seis que la orden pide son la **01 a la 06**,
en su orden.
