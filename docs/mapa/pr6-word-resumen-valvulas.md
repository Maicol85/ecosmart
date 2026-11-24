# El texto «tipo Word», el resumen de válvulas y el noveno estilo de PDF — tanda PR6 (2026-11-23)

Mapa del **texto «tipo Word»** (`cuadTexto`), de los **dos botones de copiar**, del **interruptor
«Incluir resumen de válvulas»**, del **noveno estilo de PDF** y de las **cuatro notas** que esta
tanda le agregó a la Evidencia de estenosis aórtica. Armado sobre el commit de cierre; **sin
números de línea a propósito** —la línea cambia en cada edición, el nombre de la función no—.

Línea base **`8618cd9`** (cierre de PR5, sello `v20261123-0743`, md5 `3ebd3272`).
Casos **TC-1035 a TC-1041**; lo declarado, en `docs/PENDIENTES.md` → **PR6-a** a **PR6-i**.

---

## 0. La TAREA 1 ya estaba hecha

El arrastre de los cuadros, su supervivencia, el botón que lo restablece, su llegada al PDF y la
adaptación de cada cuadro a su fila **existían desde la tanda CUADROS** (18/11/2026). Está todo en
`docs/mapa/cuadros-pdf-tarjeta.md` §7. Esta tanda **no escribió una línea de producto** para eso;
lo que agregó es **TC-1041**, que lo fija entero en un lugar e incluye la mitad que ninguno de los
cuatro casos previos medía: que el orden nuevo **llega al PDF**. Ver **PR6-a**.

---

## 1. El texto «tipo Word» — el dueño único

| función | qué hace |
|---|---|
| `cuadTextoSecs()` | **el armador**. Devuelve `[{tit, lineas:[str]}]`. Una sección sin una sola línea con datos **no sale**; una línea sin una sola pieza, tampoco. El título `DOPPLER` sale sólo si alguna de sus tres sub-secciones tiene algo. |
| `cuadTexto()` | el mismo contenido en **texto plano**, que es lo que copian los dos botones. |
| `cuadTextoFaltan()` | **la regla de completitud, medible**: las claves del índice de cuadros que tienen valor y **no** aparecen en ninguna tabla de orden. Con el formulario poblado tiene que dar **cero**. |
| `_cwIndice()` | el índice de los **doce cuadros**: `cuadroId\|rótulo` → valor, salteando los hallazgos y el cuadro `otros`. |
| `_cwIndiceValv()` | el índice de las **tres secciones de válvula** (el resumen de la TAREA 2), de donde salen la cuantificación de la insuficiencia y las áreas. |
| `_cwVal(clave, …)` | resuelve una clave contra los **tres** índices por su prefijo. |
| `_cwPz(lbl, val)` / `_cwLinea(piezas)` | una pieza «Etiqueta: valor» y una línea con « - » entre ellas. |
| `_cwAvmTxt()` | el área mitral en la forma «valor (método)». |
| `CW_SECS` · `CW_SECS_DOP` · `CW_DOPPLER_TIT` | **el ORDEN**, en un solo lugar: el de la planilla de papel del médico. |
| `CW_NO_MEDIDA` · `CW_CUAD_FUERA` | lo que **no** es una medida y el cuadro del que no se toma nada. |

⚠️ **LOS VALORES SALEN DEL ÍNDICE DE `cuadDefs()`, NO DE UNA SEGUNDA LECTURA DE LOS CAMPOS**, y es
la decisión de fondo de la tanda. Reescribir acá `vPdf('tapse',' mm')` sería la segunda derivación
del mismo dato: el día que una fila cambie de unidad, de banda de plausibilidad o de marca de
«revisar», el cuadro del PDF y este texto publicarían **dos números distintos del mismo estudio**.
Tomando el valor ya armado por el cuadro eso es **imposible por construcción**, y además vuelve
**medible** la completitud. Lo fija **TC-1036 (C1)**, que compara cada valor del cuadro contra el
texto, y **(E1)**, que exige que el armador no nombre un solo campo por su id.

⚠️ **LAS CLAVES LLEVAN PREFIJO SEGÚN SU DUEÑO, Y HAY TRES PORQUE HAY TRES DUEÑOS.** Sin prefijo
sale del índice de los doce cuadros; `RV|` del resumen de válvulas; `CX|` de `cuadCtx`; y `CW|` de
los cinco derivados que **no tienen fila en ningún cuadro** —las dos velocidades de la
insuficiencia pulmonar, que el cuadro consume como insumo de la PAPm y la PAPd y no publica, más
las tres formas «valor (método)» de la cuantificación mitral—. Van con prefijo propio en vez de
disimularse entre las claves de cuadro **porque son la única excepción** a la regla de arriba.

⚠️ **LA TERCERA POSICIÓN DEL PAR ES LA UNIDAD, Y ES OPCIONAL.** Sólo la necesitan los valores
crudos de `cuadCtx` —el AVA—, porque los de los cuadros ya la traen puesta adentro.

⚠️ **EL AVA SALE DE `cuadCtx` Y NO DE LA FILA DE VÁLVULAS, y la diferencia es la COMPUERTA y no el
número.** Los dos leen `CX.avaC`, el mismo dueño, pero la fila de válvulas lo gatea por `eaReal`
—que haya un grado de estenosis consignado— y este texto no: es una **medición**, no un grado. Sin
eso el texto publicaba el **AVA indexado sin el AVA**, que es peor que las dos cosas. Lo fija
**TC-1035 (B3)(B4)**, con su denominador —esa escena no tiene grado puesto—, y lo destapó el
barrido de mutaciones y no la lectura.

⚠️ **`emAvmPdfPartes()` DEVUELVE OTRA FORMA QUE `_imMetodoPdfPartes()`**: aquélla da `{met, val}`
y ésta `{met, txt}` con el prefijo del método **ya puesto adentro**. Pasada por `_cuadMetTxt` salía
«undefined (THP)» sobre un área medida. Por eso existe `_cwAvmTxt`, que emite la misma forma desde
la otra y **respeta la regla de su dueño** de no prefijar el texto de «no evaluable».

## 2. Qué NO entra en el texto

Los **hallazgos de válvula** —la morfología y los grados IM, IAo, IT, EA, EM y ET—, las **notas**
de cada válvula y el **cuadro «Otros» entero**: su única línea son el pericardio, las masas, el
pulmón y las variantes anatómicas, que son hallazgos y no medidas. **La geometría ventricular SÍ
entra**, y con ella la clasificación de la FEVI y el RWT: son clasificaciones de un número medido.
Ver **PR6-d**.

⚠️ **LAS DOS LISTAS DE EXCLUSIÓN SÓLO SE HACEN VALER A TRAVÉS DE `cuadTextoFaltan()`**, y lo
destapó el barrido: vaciarlas **no cambia el texto** —las tablas de orden no referencian ninguna
clave de hallazgo ni del cuadro `otros`—, cambia el ÍNDICE. Por eso las mutaciones 09 y 10 están
declaradas a **TC-1036** y no a TC-1035.

⚠️ **EL GUARDIA DEL EM-DASH DE `_cwPz` NO TIENE CAMINO ALCANZABLE**: `_cwIndice` filtra los
valores vacíos antes, así que `_cwPz` nunca ve uno. Se conserva como defensa de borde; el filtro
que de verdad muerde es el de `_cwIndice`, y es el que la mutación 11 ataca.

## 3. Los campos que entraron por la REGLA DE COMPLETITUD

Quince campos en siete grupos, más los dos que la orden pide y los cuadros no publican. La tabla
entera, con su cuadro de origen y el renglón donde se ubicó cada uno, está en **PR6-e**.

## 4. Los dos botones de copiar

| función | qué hace |
|---|---|
| `_cuadCopiar(txt, queCosa)` | las dos vías —`navigator.clipboard` y el `<textarea>` oculto con `execCommand`— y, si fallan las dos, un cuadro propio con el texto **ya seleccionado**. |
| `cuadCopiarDatos()` | el texto numérico, **sin datos del paciente**. |
| `cuadInformeTexto()` / `cuadCopiarInforme()` | el informe con su EN SUMA; con el EN SUMA vacío, **sólo el informe** y sin el rótulo. |

⚠️ **LA COPIA NO DEPENDE DE LOS CUADROS QUITADOS NI MOVIDOS, Y ES POR CONSTRUCCIÓN**: el índice
sale de `cuadDefs()` —los doce, sin filtrar— y **no** de `cuadVisibles()`, que es la que aplica el
orden y los quitados. Lo fija **TC-1037 (C1)(C2)** con tres cuadros quitados, y la mutación 12 lo
prueba cambiando una función por la otra.

⚠️ **EL AVISO ES MÍNIMO Y NO DICE EL TEXTO**: lo copiado son los datos de un paciente. Esto
**duplica la mecánica** del copiador de CeiboLink a propósito; el motivo está en **PR6-f**.

## 5. El interruptor «Incluir resumen de válvulas»

`_cuadResumenValv` → `cuadResumenValvOn()` → `cuadResumenValvToggle(on)`. **Sólo en memoria**, y
las dos cosas están pedidas: en `localStorage` sobreviviría al cierre, y en el estudio viajaría
pegado a un paciente y una reimpresión saldría con una fila que ese informe firmado nunca tuvo.

`cuadResumenValvDefs()` son **las tres secciones de válvula del BLOQUE 5 que la tanda CUADROS
retiró** (`f5a4e19`), recuperadas de su padre con los mismos campos y las mismas guardas. **Tres
diferencias deliberadas**, cada una con su motivo en el código y en **PR6-c**: sin la columna
`ref`, sin la sección «Otros» y sin la fila «EROA IT».

⚠️ **NO ENTRA EN `cuadReset` NI EN `cuadPersonalizado`**: ese botón restablece el **orden** y los
**quitados**, y el punto de aviso existe porque un cuadro quitado y olvidado saca un estudio **sin**
un dato — y esto **agrega** datos. Ver **PR6-b**.

⚠️ **`_cap` NO SE PUEDE USAR DESDE AFUERA DE `generarPDFReal`**: es un `const` **local** de esa
función, y la fila original vivía adentro. De ahí `_cuadCap`, al lado de los otros `_cuad*`.

## 6. El noveno estilo de PDF — «Tipo Word»

`PDF_PLANTILLAS` pasa a **nueve** entradas; con eso queda registrado en los tres lugares que lo
consumen —el selector de Config, el despachador del encabezado y las miniaturas—, porque **todos
salen de esa única lista**.

⚠️ **ES EL ÚNICO QUE CAMBIA EL CUERPO Y NO SÓLO EL ENCABEZADO**, lo que contradice el comentario
que encabeza ese catálogo; queda dicho ahí. Usa el encabezado **clásico** —`_PLANTILLAS_FN.tipoword`
apunta a la **misma** función, no a una copia— y el mismo pie y la misma firma.

- **Texto de verdad y no una imagen**: cada renglón entra por `doc.text`. **Cero** llamadas a
  `addImage`, medido.
- **Una línea por `doc.text`** y no un párrafo envuelto, que es lo que la orden pide para que al
  copiar desde el PDF las líneas queden separadas. Lo fija **TC-1039 (B4b)**, que exige que **dos
  renglones de la misma sección sean dos textos dibujados distintos** — contar los que empiezan
  con un rótulo **no alcanza**, y por eso la mutación 22 sobrevivió al primer barrido.
- **Título en negrita y subrayado**, medido pegándole a cada texto el **estilo de letra vigente**
  y buscando una raya fina y ancha justo debajo y en su misma `x`. **Un conteo global de negritas
  no sirve**: el estilo clásico pide **865** y «Tipo Word» **130** —las cabeceras de sus doce
  cuadros—, así que «más negritas que el clásico» es **falso sobre un papel correcto**.
- **No lleva el resumen de válvulas**, y la compuerta vive en **este** camino: devuelve antes de
  llegar a la línea que lo dibuja, así que el interruptor no lo alcanza por construcción. Lo fija
  **TC-1038 (D1)** comparando los bytes prendido y apagado, y la mutación 23 lo prueba.
- **Todo pasa por `_sanML`**: ésta es la única ruta de PDF sin saneador.

## 7. Las cuatro notas de la Evidencia de estenosis aórtica

Van en el arreglo `notas` de `_indEA`, en la forma `{txt, refs}` —que `_indSecPie` ya soportaba—,
**después** de la nota de la calcificación por tomografía. Los cuatro contenidos, sus fuentes y sus
folios están en **PR6-d** de `docs/fuentes/FUENTES.md` y en el commit de la TAREA 5.

⚠️ **CADA FUENTE EN SU PROPIA ORACIÓN**, por la regla fija del 2026-11-04: ningún texto dice que
dos fuentes no coinciden, ni las compara, ni afirma lo que una no dice. Lo fija **TC-1040 (A7)**,
que busca nueve formas prohibidas y exige cero, y la mutación 30 lo prueba metiendo una.

⚠️ **EL FOLIO VA EN EL TEXTO DE LA NOTA, Y ES UNA EXCEPCIÓN ACORDADA** de esta tanda: la regla
general manda el folio a la línea de fuente, y las dos entradas de bibliografía lo ganan también
ahí. Acá va porque **cada nota cita un folio distinto del mismo documento** y la línea de fuente es
común a la sección.

⚠️ **LOS UMBRALES DEL SCORE DE CALCIO NO SE REPITEN**: ya estaban en la nota de la calcificación,
que en esta tanda **gana su folio** (hoja 32, folio 4666). Escribirlos otra vez serían dos cifras
del mismo corte en la misma sección, que es cómo una se queda vieja.

**Y la frase «Revisar el diámetro del tracto de salida y el trazado de las integrales
velocidad-tiempo.» salió del informe, del EN SUMA y del PDF.** La descripción queda entera —el
grado consignado, los números que lo desmienten y el grado que les correspondería—. **El aviso de
pantalla no se tocó**, por orden expresa.

## 8. Los casos

**TC-1035** a **TC-1041** — fichas en `docs/mapa/tests-fichas-1035.md`. **Seis caen 0/6 contra
`8618cd9`** con el mismo archivo de casos y sólo el `index.html` distinto, por **46 condiciones** y
**cero excepciones**. **TC-1041 pasa en los dos árboles a propósito**: la TAREA 1 ya estaba hecha,
así que es una guarda de regresión y no lo que discrimina.

El barrido de mutaciones es `scripts/_mut_pr6.py`; las sondas, `scripts/_probe_pr6*.mjs` con sus
cuerpos aparte —por la lección de los acentos graves—; el insertador de los casos, con su guardián
de delta cero, `scripts/_casos_pr6.py`.
