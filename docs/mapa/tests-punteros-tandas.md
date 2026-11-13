# Mapa — los casos de prueba, tanda por tanda


## ECO-CONECTOR-5 (2026-11-13) — TC-872 a TC-881

Diez casos nuevos y **ocho adaptados**. Las fichas, en `docs/mapa/tests-fichas-872.md`; el mapa de
lo que miden, en `docs/mapa/ec5-previa-galeria.md`.

| caso | qué fija |
|---|---|
| TC-872 | «Ver lo que espera» reabre lo cerrado con la ✕; sin nada lo DICE; con un equipo por decidir manda a decidir |
| TC-873 | la fecha del aviso —hoy, ayer, fecha corta— y el panel que se actualiza solo, agrupado y sólo con la tarjeta a la vista |
| TC-874 | UN diálogo propio en vez de dos cuadros nativos, con sus rótulos y los dos pesos; el detalle del resumen por `textContent`; cerrar con la ✕ no abre |
| TC-875 | los dos topes derivados de la memoria en cuatro escenarios, el orden que no se invierte, cuál tope gana, y el factor del pico |
| TC-876 | «para todos los pesados de esta tanda» pregunta UNA vez, y la elección no sobrevive a la tanda siguiente |
| TC-877 | la tira de la vista previa: seis a la vista, la marca sin bajar nada, de a una, el pesado con «Mirar igual», la que falla no frena, y UN solo cuadro convertido |
| TC-878 | MIRAR NO ES DECIDIR, medido de seis formas, con control positivo y la cuarentena que no se expone |
| TC-879 | eliminar sólo lo elegido con dos estudios de imágenes idénticas; el formulario; el estudio que queda sin imágenes; los dos modos excluyentes |
| TC-880 | adjuntar COPIA con TRES estudios, el orden de `indice()`, los esquemas que no viajan, y los tres destinos del visor |
| TC-881 | exportar sólo lo elegido con el tamaño antes y el aviso; cancelar no genera nada; «Importar» por la misma puerta; «Desde imágenes guardadas» |

**Los diez caen 0/10 contra `5a9f0ca` por su denominador declarado y NINGUNO por excepción.**

⚠️ **LOS AYUDANTES DE ESTOS CASOS VIVEN EN EL PRELUDIO (`window.__t`)**, no en una función de
`test_clinico.mjs`: el cuerpo de un caso es una cadena que se evalúa **en el navegador**.

⚠️ **Y UN CASO QUE DISPARE LA PREGUNTA POR UN ARCHIVO PESADO Y NO LA CONTESTE CUELGA LA BATERÍA
ENTERA**: desde ECO-CONECTOR-5 esa pregunta es un diálogo de la app y hay que **apretar** un botón.
Se contesta con `__t.ec5Auto(trozo)`, que además cubre el `confirm` nativo para no colgar contra la
línea base.

## PANT-32 (2026-11-10) — TC-801 a TC-806

Seis casos nuevos, **TC-801 a TC-806**. Fichas: `docs/mapa/tests-fichas-801.md`. Mapa:
`docs/mapa/pant32-modelos-documentos.md`. **51 de 51** mutaciones muertas
(`scripts/_mut_pant32.py`), con el md5 del árbol vivo idéntico antes y después; los seis caen
contra `8967e5f` **por su denominador**, porque el almacén de modelos no existe en ese árbol.
**Diecisiete** casos existentes corridos antes de escribir nada y los diecisiete pasan **sin
adaptación**.

| caso | qué fija | mutaciones |
|---|---|---|
| **TC-801** | el almacén y **la regla de oro**: la identidad con `DOC_DEFS`, el papel de PANT-31, el modelo derivado sin perder una palabra, y el validador | 10 |
| **TC-802** | las cinco convenciones del texto con su ida y vuelta, la negrita en el papel, y la declaración de un propio con su control negativo | 10 |
| **TC-803** | la sección de Config, el interruptor con el **control de `hidden`**, la lista, el cupo y ocultar que no borra | 8 |
| **TC-804** | el menú pintado al instante, el editor, la vista previa con la hoja del Informe, y **los oyentes una sola vez** | 7 |
| **TC-805** | un propio de punta a punta y su papel, con la declaración y las firmas juntas | 8 |
| **TC-806** | exportar e importar, los **diez** rechazos y la ida y vuelta | 8 |

### PANT-32 · las siete del primer barrido, y lo que dijo cada una

**Cuatro huecos reales** — la frase de la constancia duplicada (contar palabras no la veía), el
camino de la **validación** del almacén sin probar (la cadena corrupta caía en el `catch`), ocultar
un incluido **editado**, y el almacén guardando el archivo crudo. **Dos mal dirigidas** — `order:9`
no mueve el DOM, y el tope de propios era **redundante** con el tope total. **Y una que el texto de
prueba no ejercitaba**: la guarda que distingue una casilla de un `pchk` sólo actúa cuando la línea
**arranca** con el cuadrado y deja otro atrás.

**Y un defecto del producto que el barrido obligó a cerrar**: la comparación que decide si un
incluido está editado vivía **sólo** en el botón «Guardar», así que un `ed` idéntico al original
llegado de un archivo **importado** dejaba al documento fuera de la regla de oro. Hoy vive en el
**lector**.

## Las tandas de PANT-14 hacia atras viven en su propio archivo

`docs/mapa/tests-punteros-viejos.md` — las secciones de **PANT-14**, **PANT-3** (sus dos
mitades), **POP-B**, **MARFAN-1**, **MARFAN-2**, **POP-C**, **TGA-3**, **CORR-EVID**, **PANT-2**,
**PANT-5**, **PANT-6** y **PANT-7**, con sus trampas y sus casos adaptados. Salieron en la tanda
**PANT-32** por el techo de ~35 KB de este archivo, textuales y en su orden.

## Las tandas PANT-8 a PANT-14c viven en su propio archivo

Estan en **`docs/mapa/tests-punteros-noviembre.md`**: desde PANT-8 (TC-656) hasta PANT-14c
(TC-713), con sus adaptados y sus repartos de mutaciones.

## Tanda PANT-17 (2026-11-06) — la Evidencia de congénitas, la ventana y el color al tocar

| caso | qué fija | lo matan |
|---|---|---|
| TC-714 | el cuestionario del ductus: 13 preguntas, la dirección pre-responde, el bidireccional no | M01, M02, M03, M20 |
| TC-715 | la coartación: 13 preguntas, cuatro pre-respuestas, la ESC 2024 de aorta rige | M04, M05, M06 |
| TC-716 | la Fallot del VD con su tarjeta de datos, y la tercera columna de la estenosis pulmonar | M07, M08, M09 |
| TC-717 | la bicúspide y la MCH ganan preguntas; las dos secciones vecinas, intactas | M10, M11 |
| TC-718 | la ventana aortopulmonar: seis preguntas y **cero clases** | M12, M13, M14, M15, M16 |
| TC-719 | el color al tocar: toque, vuelta, arrastre, escena nueva y repintado | M17, M18, M19 |

Fichas completas en `docs/mapa/tests-fichas-714.md`. El barrido es
`python3 scripts/_mut_pant17.py <worktree>` — **20 de 20 muertas**, con guarda de md5.

## Tanda PANT-18 (2026-11-06) — la prótesis aórtica, parte 1 de 5

Seis casos nuevos, **TC-723 a TC-728**. Las fichas están en archivo propio,
`docs/mapa/tests-fichas-723.md`, porque `tests-fichas.md` está en 34.237 B.

| caso | qué fija |
|---|---|
| TC-723 | el tiempo de eyección es el campo que ya existía, y el AT/ET gana su fila con los tres tramos y los dos bordes |
| TC-724 | el AT con sus tres tramos, la nota corregida y el bloque de Referencias |
| TC-725 | la tarjeta de severidad resumida, con su «Ver detalle» plegado |
| TC-726 | la TAVI graduada con los cortes absolutos de la quirúrgica |
| TC-727 | el desajuste omitido **sólo** con estenosis significativa |
| TC-728 | el estado visual del botón «Severidad», sin tocar el valor guardado |

**Cuatro casos viejos adaptados**, los cuatro el día que ellos mismos anunciaban: **TC-288** (la
nota del AT), **TC-290** y **TC-291** (la TAVI, que no se graduaba) y **TC-303** (el EN SUMA de la
TAVI, que reutilizaba la línea del cuerpo).

## PANT-19 (2026-11-06) — TC-729 a TC-735

**Fichas en `docs/mapa/tests-fichas-729.md`**, en archivo propio porque `tests-fichas.md` está en
34.237 B.

| caso | qué fija |
|---|---|
| TC-729 | la Tabla A4 contra su transcripción —49 modelos, 211 tamaños, 523 celdas— y las filas de control leídas en imagen |
| TC-730 | las tablas A1, A2 y A3 de TAVI, con el «NA» como `null` y los valve-in-valve aparte |
| TC-731 | el botón «Modelo y tamaño», las sugerencias **por palabra** sin tapar «ver todos», elegir por sugerencia y por la lista, y el Escape con su foco |
| TC-732 | los valores esperados de la tabla, la EOA indexada predicha con los dos cortes de IMC, lo medido con su diferencia en DE y el modo manual sin desvíos inventados |
| TC-733 | TAVI con «All» y valve-in-valve, la limpieza al cambiar de morfología y el recorrido de los cuatro campos nuevos **con sus nombres de columna** |
| TC-734 | la EOA frente a la del modelo como eje **independiente del flujo**, con sus cinco controles negativos |
| TC-735 | la Tabla A5 del catálogo mitral y el control de que la A6 **no** se carga |

**Un caso viejo adaptado**: **TC-135**, que exige que las cuentas de columnas **básicas** y
**totales** crezcan igual (140/441 → **144/445**). Las cuatro columnas nuevas caen como básicas
porque el bloque de la válvula aórtica no está detrás de un checkbox de módulo.

⚠️ **Y TRES más que destapó la corrida completa**, todos de aritmética de columnas o de alcance:
**TC-477 (J)** —437 → 441, el total menos las cuatro de ESE caso—, **TC-479** —439 → 443— y
**TC-483**, cuya condición de la media query medía **el documento entero** y lo que vigila es la
**vista 2D**: hoy extrae el bloque de cada `@media (max-width:900px)` por balance de llaves y
exige que ninguno toque un selector `#v2d`, que es el invariante exacto.

⚠️ **Lo que el barrido de mutaciones enseñó está en `docs/mapa/pant19-catalogo-protesis.md` § 7**:
doce sobrevivientes en **cinco** clases distintas —cinco huecos reales, dos frenos que tapaban a la
mutación, dos pares de guardas redundantes, una mal dirigida y dos mal escritas— de las que
salieron **nueve** condiciones nuevas.

---

## PANT-21 (2026-11-07) — la Evidencia de prótesis, una sección por válvula

| caso | qué fija |
|---|---|
| **TC-742** | la sección **aórtica**: la compuerta con la nativa, el orden, y la recomendación con su clase, su nivel y su folio |
| **TC-743** | el **bloque de causas** de la aórtica: su compuerta «posible» y las **tres escenas de borde** de la Figura 13 |
| **TC-744** | la **mitral**: las **doce** filas de la Tabla 17 que ya estaban —el guardián de la parada del 4a— y su orden propio |
| **TC-745** | la **tricúspide**: el valve-in-valve **transvenoso** y que la Tabla 19 da cortes y no causas |
| **TC-746** | la **pulmonar**: rige la ACC/AHA 2025 de congénitas y la **ESC/EACTS 2025 NO se usa** |
| **TC-747** | el **emisor compartido**: `ordenProt` no toca a ninguna otra sección y la Evidencia **no llega al papel** |

**Las fichas de los seis** → `docs/mapa/tests-fichas-742.md` (archivo propio: `tests-fichas.md`
está a menos de 1 KB del techo).

**Tres casos viejos adaptados**: **TC-291** —**INVERTIDO**, y es el día que ese caso anunciaba:
afirmaba que con una prótesis `_indEA` publica la tarjeta «esta sección no aplica», y hoy exige que
la nativa se calle **y** que la de prótesis exista con sus preguntas, así que puede fallar por los
dos lados—; **TC-322**, con tres escenarios nuevos, que se pone rojo tanto al borrar una sección
**como al agregarla**; y **TC-533**, el conteo de `IND_SECS`, 42 → **45**.

### PANT-21 · dos lecciones del barrido de mutaciones

**Una condición que mira el OBJETO no prueba lo que el EMISOR hace con él.** Las condiciones del
orden miraban el objeto que devuelve la sección, así que romper lo que `ordenProt` *hace* —que
implique el molde de preguntas, y que «Con lo contestado» baje de la grilla— pasaba en verde.
Nacieron `(F2b)` y `(F2c)` de TC-747, que miden el **HTML emitido**.

**Una cita exigida sobre el JOIN de varias filas no puede fallar por una.** `(B6)` de TC-743 pedía
la hoja y el folio sobre el texto de las **cinco** causas pegado, y `(E4)` de TC-746 sobre el de las
**once** preguntas: quitárselos a **una** seguía encontrándolos en las otras. Las dos pasaron a
exigirlos **fila por fila**, y de ahí salió `(E4b)`.

## PANT-20 (2026-11-06) — el catálogo en la mitral, la tricúspide y la pulmonar

| caso | qué fija |
|---|---|
| **TC-736** | la Tabla A7 contra su transcripción (12 / 26 / 82) y sus **cuatro formas de celda** |
| **TC-737** | las Tablas A9 (8 / 28 / 190 / 6) y A8, y que la **A8 queda sin consumidor** |
| **TC-738** | el componente en la **mitral**, con la fila propia y **TC-522 intacto**; los dos cortes de IMC |
| **TC-739** | la **tricúspide**: la decisión 6 (sólo el número) y la conversión de m/s a cm/s |
| **TC-740** | la **pulmonar**: lo impreso —límites y medianas— y la marca `uno` |
| **TC-741** | los **doce campos**, el Excel de **457** y que el **papel no cambia** |

Las fichas, con sus denominadores y sus controles negativos, en
`docs/mapa/tests-fichas-736.md`.

**Casos viejos adaptados:** los **139** conteos de `=== 445` del Excel pasan a `457`, más
`esperadas.length === 441` → `453` en el caso del G2, cada uno con su comentario de adaptación.

⚠️ **Y UN DEFECTO DEL PROPIO SCRIPT DE ADAPTACIÓN, QUE VALE PARA LA PRÓXIMA**: el marcador con el
que protegí `TC-445` de la sustitución **contenía «445»**, así que el propio regex lo pisó y dejó
el caso llamándose `@@TC457@@` — o sea **TC-445 desapareció de la suite** sin un solo error. Lo
cazó contar los casos distintos contra la línea base (755 en vez de 756). **Un marcador de
protección no puede contener lo que se va a reemplazar.**

### PANT-20 · dos lecciones más del barrido de mutaciones

**Una mutación sobre una línea COMPARTIDA se declara al caso que la cubre, no al de la tanda.**
La mutación 21 de PANT-20 rompía la búsqueda por palabra del componente «Modelo y tamaño», que es
**uno solo** para las cuatro posiciones: la condición que la mata es **(B3b) de TC-731**, escrita
por PANT-19 para la aórtica —«ifecta» cae en MEDIO de «Trifecta», y es lo único que separa
«buscar por palabra» de «buscar en cualquier posición»—. Declarada al caso de la tanda nueva
sobrevivía **sobre cobertura que ya existía**, que es indistinguible de un hueco.

**Una mutación que cambia un RÓTULO no borra una fila.** La 40 reemplazaba el texto de la fila de
la ficha pulmonar y la fila seguía ahí, así que la condición que cuenta filas con celda de dato no
podía fallar. Para probar «pierde una fila» hay que borrar el `<tr>` entero.

⚠️ **Y los comentarios del arnés van con `#`:** escribir `/* */` en un archivo de Python lo deja
sin parsear, con el error apuntando al primer carácter no ASCII del comentario.

---

## PANT-22 (2026-11-07) — el interruptor de la Evidencia y los textos comparativos

| caso | qué fija |
|---|---|
| **TC-748** | `_indSectorIncluido` con una clave, con dos y con `null`; las **TRECE** secciones con `av` y su clave; `wilk` y `teer` sin sección |
| **TC-749** | el caso del médico: sin sector incluido, **cero** secciones de sector avanzado; con uno incluido, **sólo** la suya; las no avanzadas intactas |
| **TC-750** | el dato **sigue sincronizado** aunque su Evidencia no exista, por el gesto y por la siembra muda, y después de armar el panel |
| **TC-751** | el censo de textos, con su **control positivo** de seis cadenas viejas y cada número y folio contados uno por uno |
| **TC-752** | el papel sin nada del panel, Excel en **457** y el censo de campos quieto |

**Adaptados, con el motivo escrito:** TC-533 (los conteos de `IND_SECS`, con **(D3) invertida**),
TC-534, TC-535, TC-537 —**(D6b)** con la guarda de idempotencia, más fuerte que antes—, TC-544,
TC-510, TC-349, TC-610 (**(D2) invertida**) y TC-669 a TC-673 (filtro en **(D0)** y **(D2)
invertida** en los cinco).

⚠️ **`__t.avInc` ES IDEMPOTENTE PORQUE `amiloIntegrar` ES UN TOGGLE**: llamarlo sobre un sector ya
integrado lo **retira**, y retirar no borra el textarea, así que el síntoma no se parece a la causa.
⚠️ **NINGUNA EXPRESIÓN REGULAR EN LOS CASOS NUEVOS**: `/\s+/` llega como `/s+/` y se come las «s».

Fichas en `docs/mapa/tests-fichas-748.md`.

⚠️ **Y CINCO MÁS que la corrida completa destapó, no el censo**: **TC-520**, **TC-553** y **TC-554**
medían una sección de Evidencia de un sector avanzado **sin integrar el sector** —ganan su `avInc` y
una condición de denominador—, y **TC-532 (C8)(D8)** y **TC-545 (C6)** quedan **INVERTIDAS**, porque
exigían las dos frases que el commit 5 reescribió. **Los cinco pasan 5/5 contra `e727fe2`.**


---

## PANT-26 (2026-11-09) — TC-769 a TC-777

Nueve casos, en **`docs/mapa/tests-fichas-769.md`** (archivo propio: `tests-fichas.md` estaba en
34,2 KB, medido antes de escribir). Cinco adaptados, con su motivo: **TC-303** y **TC-757** por la
frase nueva, **TC-474** por la mitral sin conclusión por fila, **TC-726** por la atribución que
sale de la salvedad de la TAVI y **TC-734** por el área de la TAVI, que ese caso declaraba que
**no** se evaluaba. Los catorce caen contra el árbol anterior por **47 condiciones y cero
excepciones**.

⚠️ **Dos lecciones de instrumentación.** (1) El **contrato del retorno** de un caso es
`{ extra: F }` y no el array pelado: los nueve salieron rojos de entrada con «el caso no declara
NINGUNA condición», con todas sus condiciones en verde. (2) El `--solo` del arnés de mutaciones
filtra por **índice**, así que retirar una mutación corre los índices de todas las de abajo: una
rerida de «07,18,25,29,30» midió en realidad la 07, la 19, la 26, la 30 y la 31.

---

## PANT-29 (2026-11-10)

**TC-778 a TC-783 REESCRITOS y TC-784 a TC-786 nuevos**; la suite pasa de **798 a 801**. Los seis
de PANT-28 afirmaban las tres fichas grandes que esta tanda quitó, así que se reescribieron sobre
lo que las reemplaza y **conservan su número**. Adaptados: TC-502, TC-509, TC-761, TC-763,
TC-563 y TC-490 —los tres últimos **invertidos**—.

⚠️ **Este archivo cruzó los 35 KB al recibir este bloque**, así que el bloque salió a archivo
propio en vez de engordarlo más: **`docs/mapa/tests-punteros-pant29.md`**, con los nueve casos,
las tres trampas que la tanda pagó y el defecto que TC-783 destapó en la app. Las fichas están en
`docs/mapa/pant29-coronarias-3d.md` § 5.

---

## PANT-30 (2026-11-10) — TC-787 a TC-794

Las ocho fichas estan en **`docs/mapa/tests-fichas-787.md`** (archivo propio: este ya esta en
33,3 KB). Los ocho caen contra `41d9c1d` por condiciones y ninguno por excepcion: **0/8**.

Las trampas que dejaron escritas: el pie del papel se busca **con su tilde** —`docSan` conserva
los acentos y dice «Pagina» con a acentuada, asi que buscarlo sin tilde daba 0 de 1 sobre un pie
que si estaba—; los hermanos de una fila se cuentan **en la fila y no en su padre**; la
subpestaña «Mediciones» **nace oculta** y un acordeon dentro de un panel oculto mide 0x0; hay que
**ceder el turno** despues de escribir en IndexedDB antes de llamar a `showTab` (ver P30-d); y
para que haya uuid hay que interceptar `mostrarCardSeveridadValvular`, no asignar
`valvSevConfirmada` en `window`.



## PANT-31 (2026-11-10) — TC-795 a TC-800

Las fichas de los seis, con sus denominadores, sus controles y las siete trampas de método que
pagaron, están en **`docs/mapa/tests-fichas-795.md`** (archivo propio: `tests-fichas.md` está a
menos de 1 KB de su techo). Adaptados: **TC-789** (las hojas de la cardioversión y del test de
burbujas pasan de 2 a 3, el ancla de las hojas comunes deja de ser su título retirado, las casillas
del ETE de 18 a 20, y su copia de bloques gana `mm` y `aire`, que no llevaba) y **TC-793**, con sus
**tres** condiciones de `data-ppt` **invertidas**.

---

## Tanda PANT-33 (2026-11-10) — el editor sobre la hoja, los dos blancos y el encabezado

**Casos nuevos: TC-807 a TC-812.** Las fichas, en **`docs/mapa/tests-fichas-807.md`**.

**Adaptados, con su motivo:**

| caso | que se le cambio |
|---|---|
| **TC-801** | hay que **sembrar el centro de trabajo**: sin el, el encabezado no dibuja nada y el papel sale con DOS operaciones menos. Gana (A4) y (A5) sobre el papel sin institucion |
| **TC-802** | su tramo (D) estaba escrito sobre `docmodNuevo`, que ya no existe; hoy mide el armado de un documento **en blanco**. Gana (E) con la convencion `## ` y su control negativo. Y **espera a jsPDF**: corrido aislado fallaba por su propia escena |
| **TC-803** | la lista pasa de **cuatro a SEIS** filas con una sola etiqueta; **(C6) y (C7) INVERTIDAS** —el cupo y «Agregar» tienen que NO existir—; (D4) pasa a medir el menu |
| **TC-804** | su tramo del editor viejo salio entero; hoy mide **la hoja**, con cero partes fijas editables |

**Retirados: TC-805 y TC-806**, con su motivo escrito en el lugar donde vivian. Los dos numeros
**no se reusan**.

⚠️ **UNA TRAMPA NUEVA DE ESTE ARCHIVO**: quitar el **ULTIMO** caso buscando «el proximo `caso(`»
se lleva puesta **la cola del runner** —su try/catch, el cierre de Chrome y el codigo de salida—,
porque despues del ultimo caso no hay otro. El sintoma es un suite que corre y **no imprime
nada**, con codigo de salida **0**.

⚠️ **Y OTRA, DE ESCRITURA DE CONDICIONES**: una condicion que junta **dos hechos** con un «y»
dentro de una funcion anonima le da margen a una mutacion para **sobrevivir**. Separadas, se
muere.

**Barrido:** `scripts/_mut_pant33.py`, **41/41 muertas**.

---

## PANT-34 (2026-11-11) — TC-813 a TC-820

**Las fichas de los ocho casos viven en `docs/mapa/tests-fichas-813.md`** (archivo propio, 13,3 KB):
las nueve vistas con su rótulo, el selector de arteria y el esquema de anomalías coronarias de
Referencias. **Adaptados**: TC-779, TC-783 y TC-784, el último con su condición (B2) **invertida**.

⚠️ **UNA TRAMPA NUEVA, y la destapó correr los ocho juntos y no la lectura**: dos casos **heredaban
el estado de «Coronarias»** del caso anterior —prendido y con una vista puesta—, así que medían su
rincón con el rótulo ya dibujado y su primer toque **apagaba** en vez de prender. La normalización
que sirve es **apagar y volver a prender**, porque apagar es lo que reinicia la vista, la
transparencia, las letras, el modo angiografía y el selector de arteria.

⚠️ **Y OTRA, DE ESCRITURA**: el **mismo carácter escrito de dos formas** en `index.html` —la tilde
como `✓` en una línea y literal en la otra— dejó un ancla del barrido en **x0**, que se lee
igual que «no hay cobertura». El `--anclas` lo cazó antes de correr.

**Barrido:** `scripts/_mut_pant34.py`.

---

## PANT-36 (2026-11-11) — TC-821 a TC-824

Las fichas, en **`docs/mapa/tests-fichas-821.md`** (archivo propio: la regla de la casa es que la
ficha de una tanda nueva nace en su archivo).

**Lo que cubren:** la entrada «Asociaciones y síndromes» en su lugar del panel, con su reparto,
su censo y su índice (TC-821); las dos tablas celda por celda, con sus ocho condiciones sobre las
cifras (TC-822); los quince resúmenes de congénitas con el molde y el techo de `ref-miocard`
(TC-823); y que nada llega al papel ni al estudio, con los dos controles de `ref-coronarias` y su
globo (TC-824).

**Adaptados:** TC-502 (A2) 40 → 41, (A4) congénitas 2 → 3 con el total en 41 y (B1) el índice
38 → 39; TC-509 (F3) el censo 40 → 41 con `ref-asoc` en la lista de ids exigidos.

⚠️ **LA LECCIÓN DE ESCRITURA DE ESTA TANDA**: la primera versión de TC-822 **caía por EXCEPCIÓN y
no por sus condiciones**. Contra el árbol anterior la entrada no existe, y un acceso pelado
—`filas(0)[0].querySelectorAll(...)`— tira `TypeError` antes de medir nada. Hoy todo acceso va por
un ayudante con guarda, y el caso cae por doce condiciones.

**Barrido:** `scripts/_mut_p36.py` — **42/42 muertas** en 1,5 min, con las 42 anclas verificadas
con `--anclas` antes de correr.
⚠️ **Y una trampa propia, la misma que PANT-20 pagó**: los comentarios del barrido se escribieron
al principio con `/* */`, que **en un archivo de Python no es un comentario**. Lo cazó el
`SyntaxError` en la primera corrida de `--anclas`.

## PANT-37 (2026-11-11) — el «What if» de la estenosis aórtica

**TC-825 a TC-831**, siete casos. Las fichas, con la escena común y lo que afirma cada uno, están
en **`docs/mapa/tests-fichas-825.md`**. Los siete caen contra `f1412a2` **por condiciones y
NINGUNA por excepción**.

**Adaptados: TC-471 y TC-500**, los dos contadores del registro de globos `VINFO` (142 → **143**
por `wi-aplica`). A los dos se les exige la clave **por nombre**, así que sacarla los vuelve a
poner en rojo.

⚠️ **EL MOTIVO POR EL QUE LOS SIETE LLEVAN AYUDANTES CON GUARDA EN CADA ACCESO**: contra el árbol
anterior el panel, sus controles y las cinco funciones del módulo **no existen**, y un acceso
pelado tira `TypeError` **antes** de medir nada. Los centinelas devuelven una **forma vacía** y no
`null`: un `null` se vuelve a desreferenciar dos líneas más abajo y el caso cae por excepción
igual.

⚠️ **Y LA ESCENA NECESITA ESPERAR DESPUÉS DE «Nuevo estudio» ANTES DE PRENDER LA PASTILLA.**
`limpiarCampos` pasa por el embudo de restauración y `cargarValvPills` repone las pastillas con su
propio retardo: una pastilla prendida dentro de esa ventana **se apaga sola** y la escena queda
sin tarjeta — que se lee igual que «el botón no se agregó». Costó tres corridas.

**Barrido:** `scripts/_mut_p37.py` — **41/41 muertas**, con las 41 anclas verificadas con
`--anclas` antes de correr y el md5 del árbol vivo idéntico antes y después. **El primer barrido
dejó SIETE sobrevivientes y los siete eran huecos reales**, cerrados con condiciones nuevas y no
aflojando la mutación: tres escenas de situación que faltaban —sólo la Vmax severa, sólo el
gradiente severo, y el gradiente **por debajo de la banda que vota**, donde `gGrad` es `null`—;
la regla de hoja del panel leída de `document.styleSheets`, porque la ventana del suite cae del
lado **angosto**, donde el panel es estático y la geometría no puede ver de qué borde sale; y el
panel **cerrado** medido por su `display` computado y no por su clase.
⚠️ **Y UNA DE LAS SIETE ERA EQUIVALENTE Y HUBO QUE REESCRIBIRLA**: sacarle la clase `btn` al
botón **no** le saca el piso de 44 px, porque ese piso sale de la regla **global** de
accesibilidad de la app (`button, [role=button], .btn, … { min-height:44px }`). La mutación de
hoy ataca el piso de verdad, por estilo en línea, y el caso mide además el `min-height`
computado.

---

## ECO-CONECTOR-2 (2026-11-12) — TC-842 a TC-851

Las fichas de los diez están en **`docs/mapa/tests-fichas-842.md`** (archivo propio: medido con
`wc -c` antes de escribir, `tests-fichas-825.md` estaba en 10,8 KB y este archivo en 23,8).

| caso | qué fija |
|---|---|
| TC-842 | el panel compacto: la cabecera, el código primero, los plegables cerrados y enfocables, los 44 px, el alto y los umbrales del espacio |
| TC-843 | Equipos: un renglón por equipo, el plegable por equipo, que se abra sola con un pendiente y la ayuda única |
| TC-844 | el repintado no borra ninguna parte estática, y el apodo entra como texto en `bdi` |
| TC-845 | el sondeo: sus cuatro compuertas, el intervalo, la respuesta vieja, el 401 y que no apile temporizadores |
| TC-846 | la agrupación por ventana deslizante de 2 minutos, con sus dos lados del corte |
| TC-847 | el aviso: sin datos del paciente, tres salidas, no vuelve por las mismas y cerrar las deja esperando |
| TC-848 | adjuntar por la puerta única, la marca del slot, que no se confirme al adjuntar y el paciente sólo si está vacío |
| TC-849 | confirmar sólo cuando quedó escrita, el «verificada false» y que un fallo no se dé por borrado |
| TC-850 | la bandeja: base propia, fuera de toda lista de estudios, del Excel y del PDF |
| TC-851 | la regla de nombre Y documento, con sus dos controles negativos, y el modal de cierre |

**Seis adaptados:** TC-833, TC-834, TC-837, TC-838, TC-839 y TC-841, cada uno con su decisión
escrita en el lugar donde vive la condición. **TC-161 pasa sin adaptar**, porque los diecinueve
ids de ECO-CONECTOR-1 se conservaron a propósito.

---

## ECO-CONECTOR-3 (2026-11-12) — TC-852 a TC-861

Las fichas están en **`docs/mapa/tests-fichas-852.md`** (archivo propio: `tests-fichas-842.md` ya
pasa de los 13 KB y la regla de esta casa es medir con `wc -c` **antes** de escribir).

| caso | qué fija |
|---|---|
| TC-852 | la pregunta de destino: cuatro botones, Descartar/Cancelar, cuenta por tipo, sin datos del paciente, y el nombre del estudio como TEXTO |
| TC-853 | el aviso no se superpone al visor ni al selector, se actualiza en el mismo cartel, y olvidar el grupo protege al aviso de equipo nuevo |
| TC-854 | desde Guardados se pregunta, desde la pestaña Imágenes no, y la marca no se hereda |
| TC-855 | `CeiboImg.agregar` agrega al final, no se lleva los esquemas, respeta el orden de `indice()` y la preexistente no se mueve |
| TC-856 | sin uuid y con el ajuste apagado no se escribe ni se confirma, con su control positivo |
| TC-857 | el cineloop se encola al importarlo, la tira lo muestra «sin guardar» con su peso y se reabre; el botón del visor existe y está escondido |
| TC-858 | el estudio de sólo cineloop confirma, la escritura fallida no, y «Nuevo estudio» avisa |
| TC-859 | la bandeja guarda los cinco cuadros, no confirma sin espacio ni con la escritura fallida, y nada de ella entra al Excel ni al censo |
| TC-860 | asignar va al estudio elegido y a ningún otro, y el envío sale sólo si entró entero |
| TC-861 | el DICOM sin comprimir en sus cinco formas, el tope, la ventana de 16 bits y el mensaje que nombra el formato |

**Adaptados**: **TC-179** (invertida más una nueva), **TC-184** (tres condiciones nuevas: el aviso
pasó del botón del visor al importador) y **TC-847** (tres cambios, queda más fuerte). Los tres caen
contra la línea base por sus condiciones adaptadas. **TC-161, TC-233 y TC-850 pasan sin adaptar.**

⚠️ **TC-764 es sensibilidad de lote PREEXISTENTE**: falla en el lote 15 y pasa aislado, y falla
**idéntico** contra `bff56dc` con el mismo archivo de casos y la misma composición de lotes. No es
de esta tanda.

---

## ECO-CONECTOR-4 (2026-11-12) — TC-862 a TC-871

Diez casos nuevos. Las fichas están en el mapa de la tanda,
**`docs/mapa/ec4-confirmar-pesados.md`** § 6.

| caso | qué fija |
|---|---|
| TC-862 | el hallazgo: el grupo mixto confirma **solo** lo que entró |
| TC-863 | un grupo donde no entra nada no confirma nada; el pendrive tampoco |
| TC-864 | los otros dos sumideros, con su control |
| TC-865 | la pregunta con el peso; «Abrir igual» y «Dejarlo esperando» |
| TC-866 | el tope duro y el fallo por memoria |
| TC-867 | miniaturas y visor; mirar no modifica nada |
| TC-868 | asignar al estudio elegido y a ningún otro; la grilla sin los megas |
| TC-869 | el cineloop en «Todas» y «Videos» |
| TC-870 | fuera del PPT, del Excel, del censo y de la lista de estudios |
| TC-871 | el apodo y el nombre del estudio como texto |

**Adaptado: TC-861 (G), con su condición INVERTIDA.** Afirmaba que el tope de píxeles crudos
rechaza, y eso dejó de ser cierto por orden del médico. Hoy exige que el mensaje de rechazo por
tamaño **ya no esté** y que el mismo descriptor imposible **dispare la pregunta**, así que puede
fallar por los dos lados.
