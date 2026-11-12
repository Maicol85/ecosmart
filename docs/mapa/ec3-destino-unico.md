# Mapa — el destino único de las imágenes (tanda ECO-CONECTOR-3, 2026-11-12)

Armado sobre el commit del sello `v20261112-1339`. **No guarda números de línea a propósito**: la
línea cambia en cada edición, el nombre de la función no.

---

## 1 · La pregunta de destino, una sola para las dos entradas

Hasta esta tanda había **dos** entradas de imágenes que decidían el destino solas y de dos
maneras distintas: el aviso de CeiboLink preguntaba entre tres salidas, y «📥 Importar imágenes y
videos» del menú de Guardados metía los archivos en el formulario abierto **sin preguntar y sin
guardarlos en ningún lado**. Las dos hacen la misma pregunta, así que la hacen con el mismo
componente.

| pieza | qué es |
|---|---|
| `dstPreguntar(ctx)` | **la pregunta**. Cuatro botones apilados sobre el modal `#clnkav-ov`, que ya existía |
| `dstAlActual(ctx)` | sumidero 1 — el estudio abierto, por `mediosImportar` |
| `dstAGuardado(ctx, inf)` | sumidero 2 — un estudio guardado, por `CeiboImg.agregar` y `CeiboCine.guardar` |
| `dstABandeja(ctx)` | sumidero 3 — la bandeja, con el cineloop **entero** |
| `clnkDescartar(ids)` | la cuarta salida, desde CeiboLink |
| `dstLeer(file)` | clasifica un archivo **sin tocar `imgSlots`** |
| `dstElegirEstudio(cb)` | el selector de estudio guardado |
| `dstCuenta(n, nFijas, nLoops)` | la cuenta por tipo, en un solo lugar |
| `dstMB(bytes)` | el peso en castellano |
| `_dstBlobDeDataURL(url)` | un `dataURL` de vuelta a `Blob`, **sin una llamada de red** |

**El contexto `ctx`** es lo único que cambia entre las dos entradas:

```
{ origen: 'ceibolink' | 'pendrive',
  items: [ { id, nombre, traer: () => Promise<File>, buf? } ],
  nFijas, nLoops,        // null desde el pendrive: no se sabe sin abrir cada archivo
  equipo,                // sólo CeiboLink
  cancelar,              // true -> el cuarto botón dice «Cancelar» y no «Descartar»
  titulo, texto }
```

- **Entrada A — CeiboLink**: `clnkRevisarImagenes` → `_clnkAvisoArmarAcciones(g)` → `dstPreguntar`.
  Los items bajan su archivo **cuando se les pide**: si el médico descarta, no se baja un byte.
  `clnkItems(ids)` los arma.
- **Entrada B — el pendrive**: `mediosPick(true)` pone `data-preguntar` en el input compartido,
  `mediosArchivosElegidos(inp)` lo lee y lo **borra**, y llama a `dstDesdePendrive(files)`.
- **La pestaña Imágenes NO pregunta**: `mediosPick()` sin argumento. Ahí el destino es obvio.

⚠️ **La marca viaja en un ATRIBUTO del input y no en una variable de módulo**, por el mismo motivo
por el que `origen` viaja por parámetro en `mediosImportar`: el selector de archivos es asíncrono y
el médico puede abrir uno desde Guardados y otro desde la pestaña Imágenes. Con una variable
compartida, el segundo gesto heredaría la marca del primero.

⚠️ **El cuarto botón `#clnkav-b4` es nuevo y no rompe a los que piden tres**: `clnkAvisoAbrir`
esconde todo botón sin texto, así que el aviso de equipo nuevo sigue viéndose igual.

---

## 2 · El aviso: cuenta por tipo, se actualiza y se posterga

- **Cuenta por tipo** — `_clnkTipos(g)` reparte por el campo `tipo` de la lista del contrato
  (`imagen` = fija, `video` = cineloop) y `_clnkAvisoTexto(g, nom, hora)` arma la frase en **un solo
  lugar**, usado por la apertura y por la actualización.
- **Se actualiza en el mismo cartel** — `_clnkAvisoGrupo` guarda el grupo que está en pantalla.
  `clnkRevisarImagenes`, con el aviso abierto, busca el grupo del **mismo equipo** que contenga
  alguno de los ids que el aviso ya mostraba; si creció, reescribe el texto y **rearma las
  acciones** sobre los ids nuevos. Si no creció, no toca nada.
- ⚠️ **Al cerrar se olvida el grupo** (`clnkAvisoCerrar`). Sin esa línea, el próximo sondeo creería
  que hay un aviso de imágenes en pantalla y trataría de actualizar un cartel cerrado: el médico no
  vería un aviso nuevo nunca más en esa sesión.
- **Se posterga** — `CLNK_AV_BLOQUEANTES` pasa de cuatro a **seis**: se agregan `cine-ov` (el visor
  de cineloop) y `dst-elegir-ov` (el selector). Falla cerrado.

---

## 3 · Adjuntar a un estudio guardado

**`CeiboImg.agregar(uuid, imgs)`** vive **dentro** de `CeiboImg` y no en el módulo de CeiboLink: la
**allowlist** de campos y el `get` **antes** del `put` que conserva los esquemas son invariantes de
ese almacén, y una segunda copia a veinte mil líneas de distancia es cómo se pierde un esquema el
día que la lista cambie.

- **Al final y no intercalado**: `indice()` y `marcar()` acuerdan que el índice recorre primero los
  slots y después los esquemas. Agregar al final de `imgs` deja quietos los índices de lo que ya
  estaba —las estrellas y las notas siguen sobre la misma imagen— y empuja a los esquemas, que no
  tienen índice propio.
- **No toca el registro del estudio**: no hay una línea que escriba un campo, así que **no puede
  pisar los datos del paciente**.
- **No crea uuid**: quien llama trae el del estudio elegido.

**El selector** (`dstElegirEstudio`, `_dstElegirPintar`) reusa los **dueños** del orden y de la
etiqueta de mes —`getInformes`, `igCmpFecha`, `igMesLbl`— y **no** `igItemHTML`, que emite 34 líneas
con **ocho** manejadores en línea que en modo elegir hacen lo que no hay que hacer, y cuyo
contenedor es un id fijo que ya está en pantalla.

- Todo entra por `textContent` y el nombre y el documento van en un **`bdi`**.
- **Ni un solo `id`** en sus campos: el censo del estudio y el Excel recorren `input[id]`.
- Busca por nombre **o** por documento, sin tildes (`_dstSinTildes`).

**Las cuatro puertas cerradas**, cada una con su mensaje:
1. estudio sin uuid → se dice y no se escribe;
2. «Guardar imágenes con los estudios» apagado → se dice, no se escribe y **no se confirma**;
3. el estudio elegido es el abierto → se trata como «actual» (si no, el próximo guardado
   reemplazaría `imgs` con lo que haya en `imgSlots` y las recién escritas desaparecerían);
4. un MP4/MOV → se dice que todavía no entra a un estudio guardado.

---

## 4 · El cineloop entero y automático

⚠️ **EL BOTÓN «💾 Guardar» DEL VISOR EXISTE Y ESTÁ ESCONDIDO.** Vive en `cine-guardar`, en la columna
derecha del reproductor, y la regla `#cine-ov.cine-min [id$="cine-guardar"] { display:none
!important }` lo oculta en el **modo mínimo** — que es el modo en el que el visor **siempre** abre.
Sólo aparece después de apretar «📏 Medir». Eso explica exactamente por qué el médico veía «Medir»,
«Capturar» y los controles de medición y no un botón de guardar. **Se deja inofensivo**: guardar ya
no depende de él.

- `dcmImgImportar` **encola** cada cineloop que importa (`_cineEncolar`) y, si el estudio ya tiene
  uuid y el ajuste está encendido, lo escribe en el acto con `_cinePendientesPersistir`.
- Con el ajuste **apagado** se encola igual: `imgPersistir` sale antes de llegar a la cola, así que
  no se escribe nada —lo que el ajuste promete— y la cola le sirve a «Nuevo estudio» para avisar.
- **El peso se dice** en el toast, con `dstMB`.

**La tira «archivos del estudio»** (`cineStripRender`) suma una clase nueva, **`cinepend`**: lo
adjuntado que todavía no está en disco, con su peso y la nota «sin guardar». Se reabre desde ahí
(`_cineAbrir([pl.loop])`, el objeto que vive en memoria) y su ✕ llama a `_cineSacarPendiente(i)`,
que lo saca de la cola **sin borrar nada de disco**.

---

## 5 · La confirmación a CeiboLink

**El hueco que esta tanda cierra**: la confirmación vivía en el `.then` de `CeiboImg.guardar`, que
está **debajo** del return temprano `if (!vivas.length && !_imgEditado)`. Un estudio con **sólo** un
cineloop de CeiboLink —que no ocupa casilla— guardaba el cineloop y **nunca** confirmaba.

Hoy `imgPersistir`:
1. lanza `_cinePendientesPersistir(uuid)` y guarda su promesa;
2. en el camino del return temprano, espera esa promesa y confirma **si escribió al menos uno y no
   falló ninguno**;
3. en el camino normal, espera **las dos** escrituras antes de confirmar.

⚠️ **`_cineFallos()`** cuenta los cineloops que no se pudieron escribir. Con uno solo no se confirma
nada: `_clnkPorConfirmar` es una lista de ids **sin mapa** a cada cineloop, así que confirmar «los
que salieron» pediría borrar también el que no salió. **No confirmar de más cuesta que una copia
sobreviva su plazo en el conector; confirmar de más cuesta la imagen.**

---

## 6 · La bandeja, con el cineloop entero

⚠️ **EL CINELOOP ENTERO VA A `ceibomed_bandeja` Y NO A `ceibomed_cine`, y la razón está MEDIDA**:
`CeiboCine.recolectar(uuidsVivos)` **borra todo registro cuyo `uuid` no sea el de un estudio vivo**,
y lo llama la limpieza que corre después de cualquier operación que cambie el conjunto de estudios.
Un registro de bandeja ahí adentro —que por definición no pertenece a ningún estudio— lo destruiría
el primer barrido, en silencio. Darle un uuid de estudio falso es peor: lo haría aparecer en la tira
de ese estudio y en su PDF.

- **Se retiró `_clnkbBytesADataURL`**, que guardaba el **primer cuadro** y después confirmaba el
  borrado: los demás cuadros dejaban de existir en todo el mundo.
- **Formato**: `reg.loops[] = { nombre, cuadros, ms, cols, filas, poster, datos, offs, bytes,
  clnkId }` — la misma forma que `_cineRegistro` menos el `uuid`, así que `_cineDesdeRegistro` la
  reconstruye sin un segundo formato que mantener.
- **Sin espacio no se guarda, no se confirma y se dice** con los números.
- **Visible en Guardados**: `#ig-bandeja` dentro de `#ig-img-view`, pintado por `igBandejaRender`,
  con cantidad por tipo, equipo, fecha y peso. Nace oculto y se muestra sólo si hay algo.
- **`clnkbLeer(id)`** devuelve el registro completo; `clnkbListar()` recorre con **cursor** y no con
  `getAll()`, así que los megas no se materializan sólo para contar.

**Asignar un envío** (`clnkbAsignarPreguntar`, `clnkbAsignar`): la misma pregunta adaptada a tres
salidas. Al estudio **abierto** se escribe en el formulario (`imgCompressLoad` + `_cineEncolar`); a
uno **guardado**, en disco (`CeiboImg.agregar` + `CeiboCine.guardar`). ⚠️ **El envío se borra de la
bandeja sólo si entró ENTERO**: uno partido entre la bandeja y un estudio es peor que uno entero en
el lugar equivocado, que al menos se puede volver a asignar.

---

## 7 · El DICOM sin comprimir

`DCMIMG_TS` pasa las dos sintaxis nativas a `ok:true`, con dos campos nuevos: `crudo:true` y, en la
implícita, `impl:true`.

- **`_dcmImgLeer`** gana el recorrido **implícito** —sin campo VR: etiqueta (4 bytes) + longitud
  (4 bytes)—, el salto de secuencia implícito (`_dcmSaltarSQImpl`), el pixel data **sin encapsular**
  (`d.crudo = { px, bytes }`) y **siete** elementos del grupo 0028 que con el comprimido no hacían
  falta porque el JPEG se describe a sí mismo.
- **`_dcmCrudoAFrags(d)`** dibuja cada cuadro en un canvas y lo codifica a JPEG, dejándolo en
  `d.frags`. De ahí en adelante un DICOM sin comprimir es **indistinguible** de uno comprimido: un
  solo camino. **No hay lector nuevo ni biblioteca.**
- **`_dcmCrudoRechazo(d)`** es la compuerta, y corre **antes de tocar un canvas**: el tope
  (`DCM_CRUDO_MAX`, 192 MB de píxeles crudos), los bits distintos de 8 y 16, las muestras distintas
  de 1 y 3, el color en **planos separados** y el color que no es RGB. Cada uno se dice **por su
  nombre**.
- **La ventana de 16 bits es UNA para todo el archivo**: la que declara `(0028,1050/1051)` o, si no,
  el mínimo y el máximo del **primer** cuadro. Con una ventana por cuadro un cineloop parpadea.
- **Se sueltan los píxeles crudos** al terminar: son decenas de MB.
- **La BE queda afuera**: su dataset va en orden de bytes invertido y nada del recorrido lo
  contempla. Rechazarla por nombre es honesto; adivinarla no.

---

## 8 · Dónde está cada cosa

| si la tarea es… | leé |
|---|---|
| tocar la pregunta de destino, sus cuatro salidas o el selector de estudio | este archivo, §1 y §3 |
| tocar el texto del aviso, su cuenta por tipo o su posposición | este archivo, §2 · el panel, en `ceibolink-panel.md` · el aviso de EC2, en `ec2-aviso-bandeja.md` |
| tocar el cineloop automático, la cola o la tira | este archivo, §4 |
| tocar la confirmación a CeiboLink | este archivo, §5 |
| tocar la bandeja o la asignación | este archivo, §6 |
| tocar el lector de DICOM sin comprimir o su tope | este archivo, §7 |
| los casos de esta tanda | `docs/mapa/tests-fichas-852.md` |

---

## ⚠️ Lo que ECO-CONECTOR-4 cambió de acá (2026-11-12)

Tres cosas de este mapa dejaron de ser ciertas, y están en
**`docs/mapa/ec4-confirmar-pesados.md`**:

1. **`dstAlActual` ya no anota el id «si el importador no lanzó»**: el importador devuelve un
   **veredicto por archivo** y sólo se confirma lo que entró. Es el defecto que el médico encontró
   con CeiboLink real — un DICOM rechazado se le confirmaba al conector, que lo borraba.
2. **El tope de píxeles crudos ya no rechaza**: pregunta, con el peso a la vista y dos salidas.
   Hay además un **tope duro** por encima del cual no se ofrece abrir.
3. **El bloque «Sin estudio» muestra miniaturas y las abre en un visor**: hasta ECO-CONECTOR-3
   sólo se podía asignar o borrar a ciegas.
