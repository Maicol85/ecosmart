# INVENTARIO P8 — imágenes, biblioteca, grilla del PDF y visor

> **Documento de SOLO LECTURA.** No se tocó una línea de `index.html`: md5 `cf41995d`,
> 188.426 líneas, sello `v20261121-0308`, el mismo que cerró el prompt 7.
> Todo lo de abajo está **medido en Chrome real** con dos sondas
> (`scripts/_probe_p8base.mjs` y `scripts/_probe_p8b.mjs`, con sus dos cuerpos), sobre
> **imágenes sintéticas hechas con un canvas** — ni un dato de paciente.

---

## 0. El mapa real, que no es el que el pedido supone

Hay **TRES** superficies de imagen, y la confusión de todo el reporte sale de que dos de
ellas son **la misma lista**:

| Lo que el médico llama | Lo que es en el código | Dónde vive |
|---|---|---|
| «la grilla *Incluir en el PDF*» | `imgSlots` + `#img-grid` | pestaña **Imágenes** |
| «las miniaturas del informe» | `infMinCapturas()` + `#inf-min-fila` | pestaña **Informe** |
| «la biblioteca» | `CeiboImg` por uuid + «Imágenes guardadas» | **Guardados** |

**MEDIDO: la biblioteca NO es una lista aparte — se DERIVA de la grilla.** `imgPersistir`
hace `CeiboImg.guardar(uuid, imgSlots.filter(s => s && s.dataURL))`, o sea **reemplaza** la
biblioteca con lo que haya en la grilla en cada guardado. Y las miniaturas del informe son
`imgSlots` filtrado por `!s.noPdf`.

**Hoy no existe ningún camino que lleve una imagen a la biblioteca del estudio abierto sin
pasar por la grilla.** Eso es lo que hace que el modelo pedido sea un cambio de arquitectura
y no un arreglo: **la grilla es la única lista que hay.**

---

## 1.1 · «Las imágenes del cable entran directo a la grilla»

**Qué se encontró.** Es cierto, **y el pendrive hace exactamente lo mismo**: la premisa
«con pendrive entran solo a la biblioteca» es **FALSA a nivel de código y está medida**.

Las dos vías comparten **una sola puerta**, `mediosImportar` → `imgCompressLoad` →
`imgSlots`. Lo único que las distingue es el tercer argumento `origen`:

```
mediosImportar([a.jpg, b.jpg], undefined, 'ceibolink')  →  2 slots · 2 en el PDF · origen 'ceibolink'
mediosImportar([c.jpg],        undefined, undefined)    →  1 slot  · 1 en el PDF · origen 'estudio'
```

Medido: `slots 0 → 2 → 3`, `infMinCapturas() 0 → 2 → 3`, `origen: ['ceibolink','ceibolink','estudio']`.
**Las tres entraron a la grilla y las tres salen en el PDF.**

**Por qué el pendrive «funciona bien» igual.** Porque del pendrive el médico trae sobre todo
**cineloops**, y un multicuadro NO ocupa slot: `dcmImgImportar` lo manda a la **cola de
cineloops** (`_cineEncolar`) y a la tira, no a la grilla. Las **fijas** del pendrive sí van a
la grilla, igual que las del cable. La diferencia que él percibe es de **volumen**: del cable
llegaron 22 fijas de golpe.

**Qué afecta.** El PDF firmado: 22 imágenes incluidas sin que nadie las eligiera.

**Cómo se corrige.** No se puede «igualar al camino del pendrive», porque ese camino tiene el
mismo defecto. Hay que **separar la biblioteca de la selección del PDF** (ver §Modelo).

---

## 1.2 · Grilla, miniaturas y biblioteca

### (a) «Quito la miniatura y en la grilla sigue figurando como incluida» — **FALSA, medido**

Las dos listas **ya están sincronizadas**. `infMinQuitarCaptura(i)` pone `noPdf` en el slot,
llama a `imgRender()` **y** a `infMinPintar()`. Medido:

- `infMinCapturas()` baja **3 → 2** en el acto;
- la celda de la grilla pasa a decir, textual:
  `"Fuera del PDFIncluir en el PDF✕MiniaturaCalidad mediaCalidad original1 KB"`;
- el botón `infMinReincluir` **existe** en la celda;
- volver a incluir devuelve **2 → 3**.

**Lo que SÍ está roto es la legibilidad, no el dato.** El cartel «Fuera del PDF» mide
**10 px**, vive pegado al borde inferior de la celda, **debajo del selector de calidad**, y su
botón «Incluir en el PDF» es `background:var(--bg2)` + `color:var(--text)` sobre una banda
`var(--bg3)` con `border:1px solid var(--border)` — **gris sobre gris**, que es exactamente la
otra queja del reporte. **Son el mismo defecto.**

### (b) «Borrar desde la grilla borra de la biblioteca» — **CONFIRMADO, medido**

```
imgPersistir(uuid)            →  biblioteca = 3
imgRemove(null, slot)         →  slots = 2
imgPersistir(uuid)            →  biblioteca = 2      ← la perdió
```

**Causa:** `CeiboImg.guardar` **reemplaza** el juego completo con `imgSlots`. No es un segundo
borrado: es que **no hay una segunda lista**.

### (c) Quitar del PDF (`noPdf`) **NO** borra de la biblioteca — **ya funciona**

Medido: tras `infMinQuitarCaptura` + guardar, la biblioteca queda en **2** con **1 registro
marcado `noPdf`**. O sea que la mitad del modelo pedido ya está implementada.

### (d) «No se pueden volver a arrastrar («ya están»)» — **IDENTIFICADO**

El mensaje es de `igSelAGuardado`: **«Ése es el mismo estudio de donde salieron: no hay nada
que copiar.»** El médico, al no ver el botón gris‑sobre‑gris de (a), fue a «Imágenes
guardadas» → modo elegir → adjuntar al estudio, y esa función se niega —con razón— a copiar
una imagen al estudio donde ya está. **No hay hoy ningún gesto de arrastre de la biblioteca a
la grilla:** el único camino de vuelta es ese botón invisible.

---

## 1.3 · Entrega y duplicados — **lo que el pedido manda reportar primero**

### ¿Cuándo se limpian las «imágenes esperando» del puente?

**En UN solo lugar**, y es deliberado: dentro del `.then(ok => …)` de `CeiboImg.guardar`, en
`imgPersistir`. O sea **sólo cuando la imagen quedó ESCRITA en disco**, no cuando el médico
apretó Guardar. `clnkConfirmarPersistidas()` recorre `_clnkPorConfirmar` y hace
`POST /v1/imagenes/<id>/confirmar`. Los otros dos caminos son `clnkDescartar` (DELETE, con
confirmación) y el vencimiento del plazo del propio puente.

`imgPersistir` devuelve `false` —y por lo tanto **no confirma**— por tres caminos que no son
una decisión del médico: «Guardar imágenes con los estudios» apagado, base bloqueada, y
reimpresión de un PDF en curso.

### ¿Por qué el puente las volvió a ofrecer?

Tres mecanismos, los tres medidos o leídos:

1. **Adjuntar al estudio abierto NO confirma nada**, a propósito: la imagen está en el
   formulario, no en disco. `dstAlActual` sólo **anota** el id en `_clnkPorConfirmar`.
2. **Sin documento el estudio no se guarda** (§1.5), así que `imgPersistir` nunca corrió y
   nunca se confirmó nada → las 22 siguen esperando allá.
3. **`_clnkAvisadas` vive en memoria** y `clnkRevisarImagenes(forzar)` —«Ver lo que espera»—
   **la ignora a propósito**. Un refresco de página, o ese botón, vuelven a ofrecer el lote.

### ¿Por qué entraron 44 en vez de 22? — **CONFIRMADO, medido**

**No hay deduplicación de ninguna clase, y no la puede haber con lo que el slot guarda hoy.**

```
mediosImportar([mismo.jpg], 'ceibolink')  →  1 slot
mismo File otra vez                        →  2 slots, con dataURL IDÉNTICO
slots que llevan el id de CeiboLink        →  0
_clnkPorConfirmar                          →  lista PLANA de ids, sin mapa a slot
hay lista de «ya adjuntadas»               →  NO
```

El puente deriva el id de cada imagen **del contenido**, así que un reenvío vuelve con el
**mismo id** — pero **el slot no se queda con ese id**, así que al volver a adjuntar no hay
contra qué comparar. Las dos copias quedan con el mismo `dataURL` y nada lo nota.

**Cómo se corrige.** (1) guardar el id del puente en el slot (`clnkId`); (2) una lista de ids
ya adjuntados **a este estudio**, que se vacíe en «Nuevo estudio» como `_clnkPorConfirmar`;
(3) al adjuntar, saltear el id ya presente y **decirlo**. Y dar por recibidas al adjuntar es
una **decisión de riesgo**: hoy el diseño explícito es «nunca se borra en CeiboLink algo que
EcoSmart no haya guardado completo» → §Decisiones.

---

## 1.4 · Borrado de varias a la vez, y el borrado individual que «no se concreta»

**Qué se encontró.**

| Pantalla | Selección múltiple | Una sola confirmación | «Marcar todas» |
|---|---|---|---|
| «Imágenes guardadas» (biblioteca) | **YA EXISTE** (`igSelEliminar`) | **SÍ** | **NO** |
| «Imágenes sin estudio» (bandeja) | **NO** (`clnkbBorrarUna`, de a una) | — | **NO** |
| Estudios guardados | **NO** | — | **NO** |

**Por qué el borrado individual a veces no se concreta — MECANISMO IDENTIFICADO, medido.**
`igSelEliminar` saca la imagen del formulario **sólo si** `_imgUuidActual === uuid`:

```
_imgUuidActual con un estudio abierto sin guardar  →  null
la condición `abierto === uuid` está en el código   →  sí
la selección trabaja por ÍNDICE (e.idx)            →  sí
```

Con `_imgUuidActual` en `null` —estudio abierto que todavía no se guardó ni se restauró— el
borrado **sí** saca el registro del disco, pero **deja el slot en el formulario**; y el
guardado siguiente, con `CeiboImg.guardar` reemplazando el juego completo, **la vuelve a
escribir**. Eso es literalmente «la confirmación se acepta y la imagen sigue, o reaparece».
El segundo mecanismo es el **corrimiento de índices**: `_igSel` guarda posiciones y quitar una
corre las demás, así que un segundo borrado sin repintado opera sobre un índice viejo.

---

## 1.5 · Guardar sin documento — **la premisa es FALSA: sí avisa, medido**

```
clnkEstudioTieneImagenes()  →  true
guardarInforme()            →  false
toasts emitidos             →  ["⚠️ Hay imágenes que llegaron del ecógrafo: para guardar
                                 hace falta el nombre Y el documento"]
irATabPaciente              →  existe, y se llama
```

La regla es de ECO‑CONECTOR‑2: **con imágenes de CeiboLink se exige nombre Y documento**; sin
ellas rige la de siempre, nombre **O** documento. El aviso dice el motivo exacto y lleva el
foco al campo.

**Lo que está roto es la forma del aviso, no su contenido:** es un `toast`, que se desvanece y
se puede perder detrás del sondeo del panel. **Cómo se corrige:** cambiarlo por un aviso que
no se vaya solo (el modal propio que la app ya usa), diciendo además **cuántas** imágenes
quedan esperando y que **no se perdieron**.

---

## 1.6 · Medir desde la grilla — **CONFIRMADO, medido**

```
_medFijaOn al arrancar                  →  false
clic en una imagen de la grilla         →  el visor NO abre
```

En la grilla el clic sólo abre el visor con **modo medición encendido** (`medFijaToggle`), y
es por diseño: la celda ya tiene tres gestos propios —doble clic = **ampliada**, toque
sostenido = **intercambiar**, arrastre = **reordenar**— y `medFijaClic` corre en fase de
captura con `preventDefault()`. En la biblioteca no hay esos gestos, así que el visor abre
directo. **Quitar el botón obliga a reasignar esos tres gestos** → §Decisiones.

---

## 1.7 · El VTI del VINNO — **causa NO cerrada; dos candidatas y el discriminador**

**Lo que el código hace, leído entero.** Hay **un solo** cálculo de VTI, `_vtiDe(pts)`:
trapecios sobre `Σ (|v₁|+|v₂|)/2 · |Δx_px| · dx`, con `dx` = `PhysicalDeltaX` en **segundos**
por píxel y la velocidad de `_vtiVelCmsEn`. Las unidades se cancelan solas, **no hay ningún
factor inventado**, y el eje del tiempo **sale siempre de la región del archivo** (no se puede
calibrar a mano). La banda de plausibilidad es **0,5 – 150 cm**.

**«El aviso dijo 167,8 y la tabla 136,7» — EXPLICADO, y no es una contradicción.** 167,8 > 150,
así que ese trazo fue **rechazado** y nunca entró a `_medVtis`. El 136,7 de la tabla es un
trazo **anterior**, que pasó la banda y quedó. Son **dos trazos distintos**; lo que confunde es
que el rechazo **deja la fila vieja a la vista** sin decir que no se reemplazó.

**Por qué 136,7 contra los 21,66 del equipo.** La razón es **6,31×**. Como el panel publica
también la **Vmax** y el médico no la reportó como equivocada, la escala de **velocidad** está
bien → el error está en el **eje del tiempo o en el ancho del trazo**:

- **Candidata A — trazo de varios latidos (la más probable).** Un VTI de TSVI normal son
  ~21 cm en ~300 ms de eyección. 6,31 × 21,66 ≈ 136,7 es, exactamente, **la envolvente de
  ~6 latidos** o de todo el barrido. **La app no tiene ninguna guarda de duración**: la banda
  0,5–150 cm admite seis latidos sin una palabra. Y `|Δx|` suma también los tramos en que el
  trazo vuelve sobre sí mismo.
- **Candidata B — `PhysicalDeltaX` del VINNO.** Las 301 regiones medidas de esta casa son de
  **GE y Sonoscape**; **no se midió nunca un VINNO**. La unidad se verifica (`ux === 4`,
  segundos), así que una unidad equivocada se rechazaría, no se escalaría — pero un **valor**
  distinto de `dx` escalaría el VTI y dejaría la Vmax intacta, que es justo el patrón.

**EL DISCRIMINADOR, y es un dato que ya está en pantalla:** la fila del panel imprime los
**ms** del trazo. Con ~1.800–2.000 ms es la **A**; con ~300 ms y el VTI igual en 136,7 es la
**B**.

**NO SE CORRIGIÓ.** Lo que lo cerraría es un corte clínico nuevo (duración máxima de un trazo
de un latido) y esta casa no mueve un corte sin decisión del médico. → §Decisiones.

---

## 2.7 · SOLO REVISAR Y REPORTAR

| Pregunta | Respuesta medida |
|---|---|
| ¿Por qué «+ Vista» y medir están deshabilitados en Vista previa / Imágenes sin estudio? | **No están deshabilitados: no existen.** Esa pantalla no es el visor — es `_clnkbVerFija`, un lightbox propio (`#clnkb-ver`) con dos acciones. El prompt 7 (TAREA G) le puso el renglón **«Para medir, asignala a un estudio»** en una sola constante (`CLNKB_MEDIR_MSG`). **Es diseño:** la regla de la casa es que las mediciones viven DENTRO del estudio. En el visor de verdad, medido, `cine-add-b` y `cine-medir` están **habilitados** incluso con el estudio sin guardar. |
| ¿Existe el checkbox «A la app» decidido el 14/11? | **NO existe.** Cero `[data-med-alaapp]`, cero `#med-alaapp`. Las cuatro apariciones del texto «A la app» en el archivo son comentarios ajenos. MEDIR‑3 lo declara explícitamente fuera de alcance («No entran las dos vistas, la casilla “A la app”…»). |
| ¿Cómo queda el strain con el visor de dos imágenes? | `_strain` es **estado POR VISTA**: `resetVisor` lo anula con `_vTodas().forEach(V => _vCon(V, …))` y medido devuelve un estado por vista. Las «vistas» internas del strain (A4C/A2C/A3C, `_STR_VISTAS`) son **otra cosa** y viven dentro de cada vista del visor. **No hay cruce.** |
| ¿Qué hace el ícono de flecha diagonal junto a la X? | Es `#cine-maxi`, glifo **⛶**, `title` **«Maximizar el visor»** / «Restaurar el tamaño del visor», `aria-pressed`. Alterna el visor entre normal y grande (`cineMaxToggle`). **No hay «Minimizar»**, excluido a propósito desde MEDIR‑1. |
| El leve desfase de la Vista B respecto de la A | **NO MEDIDO.** `vistaBAbrir()` llama a `_vElegirLoop(V)`, que **espera que el médico elija una imagen**; sin elección devuelve `!ok` y se cierra sola — la sonda quedó con **una** vista (`_vTodas().length === 1`). MEDIR‑4a lo midió en **0 px** (los dos bordes derechos alineados, 0 de desfase de alto) en 16 cruces, pero **eso fue en MEDIR‑4a y hay seis tandas encima**. Hay que medirlo con el picker real a ≥1369 px. |
| ¿La escala distingue «calibrada a mano» de «tomada del archivo»? | **SÍ, en los tres ejes.** Distancia: «Escala **calibrada a mano**: N mm por píxel» / «Escala **tomada del archivo**». Tiempo: «Escala de tiempo **tomada del archivo**». Velocidad: «Escala de velocidad **calibrada a mano** / **tomada del archivo**». Y la **fila de cada VTI** lleva además su propia marca «· escala vel. manual», por fila y no al pie, justamente para que dos trazos de escalas distintas no se lean como comparables. |
| ¿La «pestañada» cada ~15 s ocurre solo en Configuración? | **Sí, y la causa está identificada.** Es el sondeo de CeiboLink repintando su tarjeta. `clnkSondeoDebe()` lo gatea por `clnkPanelALaVista()` —la **caja** del nodo— y por `document.hidden`, así que **sólo corre con la tarjeta a la vista**, o sea en ⚙️ Configuración. Los ~15 s son el valor **del build que vos probaste** (el pusheado). ⚠️ **En el árbol de hoy, sin pushear, el prompt 7 lo bajó a 4 s** (`clnkSondeoMs() === 4000`, medido): **vas a ver la pestañada más seguido, no menos.** Si molesta, lo que hay que arreglar es el **repintado** —que hoy reescribe la tarjeta entera— y no la cadencia. |

---

## Lo que NO se puede hacer como está pedido, y por qué

1. **«Igualalas al camino del pendrive (solo biblioteca)»** — el pendrive **también** entra a
   la grilla. No hay un camino bueno que copiar: hay que construir la separación.
2. **«Se elimina el botón “Incluir en el PDF”»** — si nada entra al PDF por omisión, hace
   falta **algún** gesto para incluir. El arrastre es el pedido; el botón que desaparece es el
   gris‑sobre‑gris del cartel `noPdf`.
3. **1.7** — no se cierra sin un corte clínico nuevo, o sin un `.dcm` del VINNO para medir.

---

## Modelo propuesto (para implementar en la Parte 1)

Una sola lista en memoria, `imgSlots` = **la biblioteca del estudio**, con un campo por slot
que dice si está en el PDF:

- **entra** → slot **sin** la marca → biblioteca, fuera del PDF;
- **arrastrar a la grilla del PDF** → pone la marca;
- **✕ en la grilla del PDF o en una miniatura** → quita la marca, **no borra**;
- **🗑 en la biblioteca** → borra el slot → se va del PDF también;
- `imgPersistir` escribe **todos** los slots con su marca; `imgRestaurar` las repone.

⚠️ **La marca tiene que ser `enPdf` y no el `noPdf` de hoy, con un cuidado:** un estudio
guardado **antes** del cambio no trae `enPdf`, y con el campo ausente hay que caer en
`!noPdf` —o sea **incluido**— para que un informe viejo se reimprima **idéntico**. Invertir el
default sin eso dejaría todos los estudios guardados imprimiendo **sin imágenes**.
