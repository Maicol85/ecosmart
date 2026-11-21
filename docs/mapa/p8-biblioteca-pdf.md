# Mapa — P8: la biblioteca del estudio y la selección del PDF

> Por nombre de función y de constante, **no por línea**. Medido sobre el árbol de la tanda P8
> (2026-11-21). Lo que esta tanda **midió antes de tocar nada** está en
> `docs/INVENTARIO_P8.md`; la guía manual, en `docs/GUIA_PRUEBA_P8.md`.

---

## 1. El modelo, en una línea

**`imgSlots` es la BIBLIOTECA del estudio. La selección del PDF son los slots SIN `noPdf`.**

| Superficie | Qué muestra | Dueño del pintado |
|---|---|---|
| `#img-grid` (pestaña **Imágenes**) | **la biblioteca**: todo lo que llegó | `imgRender` |
| `#inf-min-fila` / `#inf-min-lista` (pestaña **Informe**) | **la selección del PDF** | `infMinPintar` |
| «Imágenes guardadas» (Guardados) | la biblioteca **de todos** los estudios, en disco | `igImgPintar` |

Las dos primeras son **la misma lista** vista de dos formas, y eso es por construcción: la
segunda es `infMinCapturas()`, que filtra la primera. No hay dos estados que puedan discrepar.

### Por qué `noPdf` y no un campo nuevo

Porque evita una migración, y eso está medido. Los **seis** emisores del PDF, `infMinCapturas`,
`infMinEsquemas` y la lista blanca de `CeiboImg.guardar`/`imgRestaurar` **ya** preguntaban por
`!s.noPdf` desde AJUSTES-2. Un estudio guardado antes de esta tanda no trae el campo,
`!!undefined` es `false`, y **se reimprime idéntico**. Un campo `enPdf` invertido habría dejado
todos los estudios viejos imprimiendo sin imágenes.

**Lo único que cambió es con qué marca NACE una imagen nueva.**

---

## 2. La entrada: `imgCompressLoad` es la puerta única

Toda imagen fija entra por ahí, y desde P8 el slot nace con **`noPdf: true`**.

Alcanza a las cuatro entradas **por construcción y no por una lista**:

| Entrada | Camino | Marca al nacer |
|---|---|---|
| Cable (CeiboLink) | `dstAlActual` → `mediosImportar` → `imgCompressLoad` | fuera del PDF |
| Pendrive | `dcmImgPick` → `dcmImgImportar` → `imgCompressLoad` | fuera del PDF |
| «+» de un slot, Ctrl+V | `imgPick` / paste → `imgCompressLoad` | fuera del PDF |
| Captura del visor | `imgCompressLoad(..., 'visor')` | fuera del PDF |
| **Un esquema** (orejuela, VAB, 3D…) | `esqIncluirEnPDFImg` — **no pasa por ahí** | **incluido** |

El esquema es la excepción deliberada: su botón «Incluir en el PDF» **es** el gesto explícito del
médico, así que entra incluido. Lo fija TC-978 (D1) como control negativo.

---

## 3. Los cuatro gestos, y quién es dueño de cada uno

| Gesto | Función | Qué hace | Qué NO hace |
|---|---|---|---|
| Pastilla **＋ AL PDF** / **✓ EN EL PDF** | `imgTogglePdf` | delega en `infMinReincluir` / `infMinQuitarCaptura` | no borra nada |
| **✕ de una miniatura** del Informe | `infMinQuitarCaptura` | pone `noPdf` | no borra de la biblioteca |
| **Arrastre** biblioteca → fila | `_infMinDropCablear` | `infMinReincluir` | no copia ni mueve nada en disco |
| **✕ roja** de la celda | `imgBorrarBib` → `imgRemove` | borra el slot, **preguntando** | — |
| **📄 Todas / 🗂 Ninguna** | `imgPdfTodas(on)` | escribe la marca en lote | no toca los esquemas |

**El predicado es uno solo: `_imgEnPdf(slot)`.** Lo consultan la pastilla, los dos botones de
lote y el renglón de cuenta. Un **video** nunca está en el PDF: ese predicado lo excluye, igual
que `infMinCapturas`.

⚠️ **`imgRemove` NO se tocó.** La llaman tres casos de la batería y `igSelEliminar`; lo que
cambió es la **puerta de pantalla**, que ahora pregunta. Y la ✕ conserva su `title="Eliminar"`,
que un caso exige celda por celda.

⚠️ **El «doble borrado» desapareció por construcción.** Hay **un** borrado y vive en la
biblioteca; la fila del Informe y la pastilla sólo cambian la marca.

### El arrastre: dos tipos en el mismo `dataTransfer`

`_imgAttach` pone **`text/plain`** (el que la grilla ya usaba para reordenar entre celdas) **y**
**`application/x-eco-bib`** (nuevo). La fila del Informe mira **sólo el segundo**: sus propias
miniaturas se arrastran entre sí para reordenar y también ponen su índice en `text/plain`, así
que mirar ese tipo haría que reordenar una miniatura disparara además una inclusión.
Lo fija TC-979 (C3) como control negativo.

### La fila vacía se VE, y no es cosmética

Con el PDF arrancando vacío, `n === 0` pasó de ser el caso raro a ser el caso normal. Si la fila
siguiera escondida no habría **(a)** dónde soltar lo que se arrastra ni **(b)** nada que dijera
que el informe va a salir sin imágenes. Se esconde **sólo** cuando tampoco hay biblioteca.

---

## 4. La deduplicación (1.3)

**Clave = nombre del archivo + hash FNV‑1a de su contenido** (`_imgClaveArchivo`), guardada en
`slot._srcKey`, **sólo en memoria** (no está en la lista blanca de `CeiboImg.guardar`).

⚠️ **ES OPT‑IN DESDE LAS DOS PUERTAS DE IMPORTACIÓN.** Sin clave no se deduplica nada: eso deja
afuera, a propósito, la **captura del visor** y el **pegado** —el médico captura el mismo cuadro
dos veces porque quiere— y deja adentro el cable, el pendrive y «Desde imágenes guardadas».

⚠️ **EL PRIMER INTENTO DEDUPLICABA POR EL `dataURL` COMPRIMIDO Y LA BATERÍA LO DESMINTIÓ.**
TC-234 importa **dos DICOM con los mismos píxeles y distinta región** —uno declara su escala y el
otro no— y el slot guarda el JPEG recomprimido, no la cabecera: los dos daban bytes idénticos y
el segundo se descartaba. Son dos archivos **clínicamente distintos** (uno se mide con la escala
del archivo, el otro hay que calibrarlo a mano). TC-242 pagó lo mismo con tres fijas hechas de
los mismos bytes.

Una repetida devuelve **`'dup'`** y no `false`, y la diferencia es todo el punto: con `false` el
archivo contaría como «no entró», el aviso diría que sigue esperando en CeiboLink y **no se
confirmaría al guardar**, dejando la copia allá para siempre. La imagen **sí** está en el
estudio; lo que no se hizo es duplicarla.

⚠️ **NO SE LE CONFIRMA NADA AL PUENTE AL ADJUNTAR** (decisión de Maicol, 2026-11-21). Se mantiene
la regla de que nunca se borra en CeiboLink algo que EcoSmart no haya guardado completo.

### Los tres carteles acumulados, y por qué la clave PERSISTE

**Dato real del médico, con el VINNO por router:** el equipo mandó **9** imágenes y la última
llegó tarde, así que hubo **tres carteles** — y **cada cartel adjunta TODO lo que el puente tiene
acumulado, no sólo lo nuevo**: 7, después 8, después 9. **El estudio quedaba con 24.**

`imgSlots` **es** la biblioteca, así que **un solo barrido** cubre las dos mitades de la regla
—«sólo se agregan las que no están ya en el estudio **o en la biblioteca**»—: alcanza con
preguntar si **este** archivo ya está. **No hace falta recordar qué carteles hubo.**

⚠️ **Y POR ESO `_srcKey` ENTRA EN LAS DOS ALLOWLISTS DE `CeiboImg`.** La clave en memoria cerraba
el caso **dentro de una sesión**; el otro caso que el médico pidió cubrir es el **reenvío completo
después de GUARDAR**, y ahí `imgSlots` se repuebla del disco. Sin persistirla, el lote entero
volvía a entrar. Son ~45 bytes por imagen, **no es un campo del estudio ni una columna de Excel**
—vive en el objeto del slot, como `star`, `nota`, `esquema` y `noPdf`— y un registro de antes de
P8 que no la trae simplemente **no deduplica**, que es el comportamiento anterior, en vez de
romper. Es el mismo criterio con que `noPdf` entró en AJUSTES-2.

Lo mide **TC-984** en cinco tramos: los tres carteles (**9 y no 24**), que las nueve cuenten como
**entradas** en los tres —así nada queda esperando por error—, el reenvío completo tras guardar y
reabrir, una décima imagen que **sí** entra (control negativo) y un registro viejo sin la clave.

---

## 5. El guardián de desfase de `CeiboImg.quitar` (1.4)

`quitar(uuid, idxs, esperados)` — el tercer argumento es **opcional** y es el `dataURL` que la
pantalla creía que estaba en cada posición. Lo que no coincide **no se borra** y se informa en
`desfasados`. Sin `esperados` se comporta exactamente como antes, así que los llamadores viejos
no cambian.

Por qué: los índices son **posiciones**, y la galería los saca de un índice y de una caché por
estudio (`_igImgBlobs`). Cualquier escritura entremedio —guardar el estudio abierto, adjuntar un
envío, borrar otra imagen— los corre de lugar sin que la pantalla se entere, y un índice corrido
**no falla: borra OTRA imagen del mismo estudio**. `igSelEliminar` invalida la caché **antes** de
leer, pasa los esperados, y dice el desfase en vez de perder la imagen equivocada en silencio.

---

## 6. Medir desde la grilla (1.6)

El botón «📏 Medir» **se retiró de la pantalla**; `medFijaToggle` y `_medFijaOn` **siguen
existiendo** (los llaman seis casos y es el camino programático; con el modo encendido lo único
que cambia es el realce punteado de las celdas).

Un clic sobre la imagen abre el visor por `_medClicEnvoltorio`, con una **ventana de 260 ms** que
el `dblclick` —«ampliada»— cancela, y que `imgRender` también cancela (si la grilla se repinta,
la celda que el temporizador iba a abrir ya no es la misma imagen). La celda se **re-resuelve por
su `data-idx`** al vencer, no se guarda el nodo.

El precio, declarado: abrir el visor tarda un cuarto de segundo más que antes.

⚠️ **Las miniaturas del Informe no abren el visor**, y es deliberado: esa fila es la selección
del PDF y su único gesto es reordenar y quitar. La misma imagen se abre desde la biblioteca.

---

## 7. El aviso al guardar sin documento (1.5)

La regla no cambió (ECO-CONECTOR-2: con imágenes de CeiboLink se exige nombre **Y** documento).
Lo que cambió es la **forma del aviso**: el `toast` se conserva —es el que la batería mide— y se
suma un cartel que **no se va solo**, con tres cosas que el toast no decía: qué falta
exactamente, **cuántas** imágenes están esperando, y que **no se perdieron**.

⚠️ **Y un aviso que no exige una decisión va por `_dstNota`, no por `_dstAviso`.** Fuera de una
tanda, `_dstAviso` es un **`alert` nativo**: el runner no lo sustituye y la batería entera queda
colgada esperando un clic. Esta tanda lo pagó con una corrida de 31 casos que hubo que matar.

---

## 8. Lo que NO se tocó

- Ningún cálculo clínico, corte, umbral ni fórmula.
- El PDF, el EN SUMA, el PPT y el Excel del Laboratorio: **cero columnas nuevas, cero campos
  guardados nuevos** — por construcción, porque esta tanda no agrega un solo `input`, `select` ni
  `textarea` con `id`.
- `imgRemove`, `imgPersistir` y `imgRestaurar` en su contrato: lo que cambió es con qué marca
  nace un slot.
- El puente (`ecosmart-conector`).
- El VTI (1.7): la causa **no está cerrada** — ver `docs/INVENTARIO_P8.md` § 1.7 y
  `docs/PENDIENTES.md` → **P8-a**.
