# Fichas de los casos TC-801 a TC-806 — tanda PANT-32 (2026-11-10)

Archivo propio porque `tests-fichas-795.md` y `tests-fichas.md` ya cargan sus propias tandas, y
porque un archivo de fichas que crece con cada tanda termina siendo imposible de presupuestar. El
índice por tanda está en `docs/mapa/tests-punteros-tandas.md`; el mapa de la tanda, en
`docs/mapa/pant32-modelos-documentos.md`.

Los seis caen contra `8967e5f` (el cierre de PANT-31) **por su denominador**: las funciones del
almacén de modelos no existen en ese árbol. Lo que prueba que sus condiciones **discriminan** es
el barrido de mutaciones, `scripts/_mut_pant32.py`, con **51** anclas verificadas una por una
antes de correr.

⚠️ **Ninguno de los seis usa una expresión regular**, y es a propósito: el cuerpo de un caso es un
template literal, así que `/\s+/g` llega como `/s+/g` y reemplaza las «s» por espacios. Y ninguno
lleva un acento grave, **ni en sus comentarios** — esta tanda lo pagó **dos veces**, en TC-803 y
en una corrección posterior del mismo caso.

---

## TC-801 — el almacén y la regla de oro

| bloque | qué fija |
|---|---|
| **(A1)-(A3)** | para los cuatro incluidos sin editar, `docmodDef(clave) === DOC_DEFS[clave]` —la **identidad**, no una copia igual— y el papel de PANT-31: **1/13**, **3/150**, **3/198** y **3/152** |
| **(B0)-(B2)** | el modelo original se **deriva** de la definición y no pierde una palabra del cuerpo: 13, 318, 459 y 342 palabras, contadas sin expresiones regulares |
| **(B3)-(B3c)** | la frase con los datos del paciente es una **pieza**, su texto libre **no la repite** y en el papel sale **una** sola vez |
| **(B4)-(B6)** | el título de la constancia sale de su propio bloque; el ETE trae sus **seis** preguntas con «Antes del estudio» entre ellas |
| **(C1)-(C3)** | el almacén nace con los cuatro y cero propios, se escribe y se relee |
| **(C4)-(C5)** | **control negativo**: editada, la constancia ya **no** devuelve el objeto de `DOC_DEFS`, y los otros tres siguen con su papel intacto |
| **(C6)** | un cuerpo **igual al original** devuelve la identidad: la regla de oro no depende de una bandera |
| **(C7)-(C8c)** | un valor corrupto **y** un json válido con otra forma dan el estado vacío, sin tirar, y la regla de oro sigue valiendo |
| **(C9)-(C13)** | el validador rechaza clave desconocida, versión, incluido inexistente y un número donde va un texto, y acepta un estado bueno |

Restaura el valor que había en `localStorage` al cerrar.

## TC-802 — las cinco convenciones y la declaración de un propio

| bloque | qué fija |
|---|---|
| **(A1)-(A10b)** | las **ocho** piezas de un texto de prueba: párrafo, `ul` de dos con su `fuerte` y sin asteriscos, `chk2` de dos, `raya` con el párrafo de arriba como rótulo, `pr` con tres tramos, `pchk` con los cuadrados en el medio, `chk1` sola, y la línea que **arranca** con el prefijo de casilla y deja un **tercer** cuadrado, que es un `pchk` y conserva sus tres cuadrados |
| **(A11)-(A12)** | **controles negativos**: dos líneas sin blanco son **un** párrafo; con el blanco son **dos** |
| **(B1)-(B2)** | la ida y vuelta: texto → bloques → texto → bloques da los mismos tipos y conserva el `fuerte` |
| **(C1)-(C6)** | en el **papel**: la viñeta, seis cuadrados dibujados, la raya, la negrita como **peso por palabra**, y **cero** asteriscos y **cero** glifos de cuadrado impresos |
| **(D1)-(D3)** | la declaración de un **propio** dice «en qué consiste el procedimiento» y «se me realice el procedimiento descrito en este documento», y no nombra ningún estudio |
| **(D4)-(D5)** | **control negativo**: el ETE incluido conserva su procedimiento palabra por palabra y **no** dice «descrito en este documento» |

## TC-803 — la sección de Configuración, el interruptor y la lista

| bloque | qué fija |
|---|---|
| **(A1)-(A6)** | es un `section.cfg-card` con su `.cfg-sec-title`, **entre** «Imágenes del estudio» y «Modo de visualización», visible, y la línea del pie con su texto exacto |
| **(B1)-(B7)** | el interruptor nace **encendido**, la casilla lo refleja, apagarlo pone la clase `doc-oculto` y deja el envoltorio en `display:none` con alto **cero**, se guarda en su clave propia y `docmodBotonOn` lo dice |
| **(B8)** | ⚠️ **el control que importa**: con `hidden` y **sin** la clase, el envoltorio computa `flex` y el botón sigue midiendo 132 px. Si alguien cambia la clase por `hidden`, esto se pone rojo |
| **(B9)** | prenderlo lo devuelve, con sus 44 px |
| **(C1)-(C7)** | las cuatro filas, sus etiquetas de tipo y de origen, «Editar» en las cuatro, **«Borrar» en ninguna**, el cupo «4 de 6 documentos» y el botón de agregar activo |
| **(D1)-(D5)** | ocultar pone su etiqueta, **no borra** el modelo ni su texto, el **cupo no cambia** y mostrarlo lo deja igual que al principio |
| **(D6)-(D8)** | y un incluido **editado** no pierde su texto al ocultarlo ni al mostrarlo |
| **(E1)-(E2)** | ningún control por debajo de 44 px y ninguna fila desbordando la tarjeta |

⚠️ **La geometría del botón se mide en el INFORME, no en Config**: en Config su pestaña está en
`display:none` y todo informa 0×0, que se lee igual que «el botón no está». La primera versión del
caso lo medía en Config y daba rojo sobre un denominador vacío.

## TC-804 — el menú pintado y el editor

| bloque | qué fija |
|---|---|
| **(A1)-(A3)** | las opciones salen del almacén, llevan su clave en `data-doc-k`, **ninguna** tiene `onclick` inline y las cuatro conservan su `role="menuitem"` |
| **(A4)-(A6)** | ocultar saca del menú **al instante**, mostrar devuelve, y con ninguno visible el menú dice «No hay documentos visibles.» |
| **(A7)** | tocar la opción **abre** la hoja de ese documento |
| **(B1)-(B10)** | el editor abre en la misma pantalla, esconde la lista, el cupo y los botones, trae «Volver a Documentos», los campos son `input` y `textarea`, **cero** `contenteditable` en su columna, las tres piezas tildadas, la línea de ayuda con sus cuatro convenciones, el aviso de las piezas repetidas y los bloques grises |
| **(C1)-(C5)** | la vista previa se pintó, con las clases **de la hoja del Informe**, un paciente **ficticio**, **cero** `contenteditable` y el número de hojas |
| **(C6)-(C8)** | escribir la actualiza, y un texto que parece HTML se ve como **texto**, con **cero** elementos `b` y `script` |
| **(D1)-(D4)** | ⚠️ **los oyentes, una sola vez**: dos clics en «Agregar pregunta» agregan **dos** y «Volver al texto original» pregunta **una** vez, medido **después de cuatro repintados**, que es la única condición en que el defecto aparece. Y carga el original **sin guardar** |
| **(E1)-(E4)** | Cancelar con cambios **pregunta**; al decir que no queda abierto; al decir que sí cierra y vuelve la lista; y nada se guardó |

⚠️ **Hay que cambiar algo antes de probar (E1)**: después de «Volver al texto original» el editor
tiene el mismo contenido con el que abrió, así que Cancelar cierra **sin** preguntar, que es lo
correcto. La primera versión del caso fallaba por su escena, no por la app.

## TC-805 — un documento propio de punta a punta

| bloque | qué fija |
|---|---|
| **(A1)-(A3)** | la pregunta de tipo va **en la pantalla** —cero `prompt` y cero `confirm`—, con sus dos opciones con nombre, un Cancelar, y los tres con 44 px |
| **(A4)-(A9)** | la plantilla: el título «Consentimiento para », **sin** campo de nombre, las **cinco** preguntas vacías que lo **dicen**, y las tres piezas tildadas |
| **(B1)-(B5)** | Guardar **pregunta** el nombre; en blanco **avisa y no guarda** y el editor queda abierto; con nombre guarda como propio y visible, y su fila lleva «Propio» y **sí** ofrece Borrar |
| **(C1)-(C5)** | la plantilla de constancia con su pieza de frase y **sin** preguntas; con **dos** propios el cupo llega a seis y lo dice, el botón queda **desactivado**, y llamar a la función igual no deja agregar un tercero |
| **(D2)-(D8)** | el papel: **10,2 / 13,4 pt**; la declaración y la tabla de firmas en la **misma** hoja y **no** en la primera; las hojas comunes **después**; **un** solo `salto`; la pregunta vacía **no se imprime**; el encabezado centrado y la línea del paciente |
| **(D9)** | destildar la tabla de firmas la saca y **deja la firma del médico** |
| **(E1)-(E6)** | el menú ofrece los propios **después** de los incluidos; la hoja abre con el **nombre** del documento; es editable; la clave de «Imágenes» es `doc-<clave>`; la miniatura lleva el nombre; e «Imprimir» arma el PDF y dice cuántas hojas |
| **(F1)-(F4)** | borrar **pregunta** nombrándolo y diciendo que no se puede deshacer, libera el cupo, el otro propio sigue, y **control**: los cuatro incluidos siguen devolviendo su objeto |

## TC-806 — exportar e importar

| bloque | qué fija |
|---|---|
| **(A1)-(A4)** | los dos botones con sus 44 px, el selector de archivo oculto con su `accept` de json, y la línea que dice que el archivo no lleva datos de pacientes |
| **(B1)-(B6)** | el archivo baja con el nombre que la orden fija, con su marca de formato y su versión, **sólo** las cinco claves, lo editado de los incluidos, su visibilidad y su nombre, y el propio con su tipo, su título, sus preguntas y sus piezas |
| **(B7)-(B8)** | ⚠️ **por el complementario**: **cero** apariciones del nombre del paciente, su documento, la institución, el médico, su matrícula y cualquier `data:image`; y el interruptor del botón tampoco viaja |
| **(C0)-(C6)** | la ida y vuelta: importar **pregunta**, y todo vuelve idéntico —el propio con su clave, su nombre y su pieza destildada; la constancia con su texto; el ETE oculto; la cardioversión con su nombre— con los tres sin editar siguiendo con la identidad |
| **(C7)** | y lo que queda guardado es el estado **normalizado**: `v`, `incl` y `prop`, sin la marca de formato ni la fecha del archivo |
| **(D1)-(D10)** | **diez** archivos rechazados **enteros**, cada uno con su mensaje, **sin preguntar** y con el almacén idéntico: ajeno, dañado, sin marca, clave desconocida, versión, un número donde va un texto, nombre de 62, texto de pregunta de 6.100, 31 preguntas y **tres** propios con su mensaje propio |
| **(E1)** | decir **no** a la confirmación no cambia nada |
| **(E2)-(E6)** | un archivo con texto que parece código **sí** entra, porque es texto válido, y se muestra como **texto** en la lista, en el menú, en la hoja y en el **papel** |

Restaura `HTMLAnchorElement.prototype.click`, `window.Blob`, `confirm`, `alert` y el valor de
`localStorage` en un `finally`.
