# Fichas de los casos TC-813 a TC-820 — tanda PANT-34 (2026-11-11)

Archivo propio porque `tests-fichas.md` está a menos de 1 KB de su techo y
`tests-punteros-tandas.md` lo cruzó en PANT-31. Los ocho casos viven en
`scripts/test_clinico.mjs`, después de TC-812.

**Los ocho caen contra la línea base `31399ad` por 64 condiciones y NINGUNA por excepción**,
verificado en un worktree alternando sólo `index.html` con el mismo archivo de casos. Los
accesores llevan guarda a propósito: contra el árbol anterior no existen ni las tres vistas
nuevas, ni el selector de arteria, ni el motor del esquema, y un `null.click()` o un
`ReferenceError` cortaría el caso antes de llegar a su condición — que es lo único que prueba que
discrimina.

---

## TC-813 — las nueve vistas, el título fijo y la tilde

**Escena:** Contractilidad con DDFVI 58 y VDFVI 140, el 3D abierto y «Coronarias» prendido.

| # | qué fija |
|---|---|
| (A0 DENOM) | el 3D abrió, el bucle corre y el modelo tiene tamaño |
| (A0b DENOM) | «Coronarias» está prendido y el panel se ve |
| (A1) | la lista trae **NUEVE** vistas, y no las seis de PANT-29 |
| (A2) | los nueve nombres exactos y en su orden, **leídos del DOM** |
| (A3) | el `data-v` de cada uno es su índice, 0 a 8 |
| (A4) | los nueve rótulos salen de `LV3D_CORO_VISTAS`, **el dueño único del nombre** |
| (A5) | la lista nace cerrada y «Modo angiografía» sigue en ella |
| (B1) | los nueve giros internos son los que la orden fija |
| (B2) | «Lateral» es lateral izquierda de 90° sin angulación y «AP caudal» de frente |
| (C1) | el título del botón es **siempre el mismo**, en las nueve |
| (C2) | y **no** dice «Vista:» en ninguna, que es lo que hacía hasta PANT-33 |
| (C3) | la tilde marca **una** sola opción y es la elegida |
| (C4) | las nueve dan **nueve** orientaciones distintas del modelo |
| (D1) | ni el panel ni el pie escriben un solo grado |
| (D2) | la línea «Vista simulada, aproximada.» sigue, una sola y la misma |

⚠️ **(A4) es la condición que cierra el riesgo de las dos listas**: si alguien escribe el nombre a
mano en el marcado y lo cambia, la lista y el rótulo del cuadro dirían cosas distintas de la misma
vista.

⚠️ **(B2) lleva la guarda de largo PRIMERO**: contra el árbol anterior `LV3D_CORO_VISTAS[7]` es
`undefined` y leerle `a` tira.

---

## TC-814 — el rótulo dentro del cuadro

**Escena:** la misma, con la animación en **pausa** y la fase en 0 — sin eso dos lecturas del
lienzo son de dos momentos distintos.

**Instrumento:** tinta (alfa > 8) en dos zonas lógicas del lienzo: el rincón del rótulo
(x 520–676, y 310–350) y el de la brújula (x 10–110, y 290–375), que no se tocan.

| # | qué fija |
|---|---|
| (A0 DENOM) | el 3D abrió con tamaño y «Coronarias» arranca apagado |
| (A1) | con «Coronarias» apagado, el rincón derecho de abajo está **vacío** |
| (A2) | prendido pero **sin vista**, sigue vacío: el rótulo es de la vista, no del botón |
| (A3) | con cada una de las nueve vistas el rincón tiene tinta |
| (A4) | la brújula sigue dibujada en su rincón, que es el izquierdo |
| (A5) | la tinta del rincón **cambia** según la vista, o sea que dice su nombre |
| (B1) | al soltar la vista —eligiendo una punta— el rótulo desaparece |
| (B2 DENOM) | antes de apagar hay vista puesta, selector en «Derecha» y tinta en el rincón |
| (B3) | apagar se lleva el rótulo y devuelve el selector a «Todas» |
| (B4) | y la **dominancia** sigue sin reiniciarse |

⚠️ **(A5) no se puede reemplazar por «hay tinta»**: un rótulo fijo tendría tinta igual. Nueve
nombres de distinto largo dan al menos tres cantidades de tinta distintas (medido: ocho).

⚠️ **Este caso normaliza el estado antes de medir**, y lo destapó correr los ocho juntos: el caso
anterior deja «Coronarias» prendido con una vista puesta, así que medía 617 píxeles donde esperaba
cero y su primer toque **apagaba** en vez de prender.

---

## TC-815 — el selector de arteria y las nueve combinaciones

**Escena:** la misma, con **los 17 segmentos alterados** para que el tramo gris esté encendido.
⚠️ `contrEstado` **arranca vacío**: los ids salen de `CONTR_TERRITORIO`, que es el dueño del
reparto. Sin eso el gris nunca se enciende y las condiciones miden cero sobre cero.

| # | qué fija |
|---|---|
| (A0 DENOM) | el gris está encendido en los tres grupos, con sus 17 ids |
| (A1) | el botón «Arteria» existe y su título es ese, sin el lado elegido |
| (A2) | está en la **misma fila** que «Vista de angiografía» y los dos miden 44 px |
| (A3) | el panel sigue teniendo **tres** filas: el botón nuevo no agrega una |
| (A4) | tres opciones con `data-a` `todas,izq,der`, y arranca en «Todas» con su tilde |
| (A5) | su lista nace cerrada y es distinta de la de vistas |
| (B1) | dominancia **derecha**: 20 / 12 / 8, con `Cx,D,DA,MO` y `CD,DP,PL` |
| (B2) | **codominante**: la PL se va con la izquierda y la DP se queda con la derecha |
| (B3) | dominancia **izquierda**: la DP y la PL son de la circunfleja; la derecha queda con la CD sola |
| (B4) | con «Izquierda» no queda ni una arteria del grupo CD, en las tres dominancias |
| (B5) | con «Derecha» queda **sólo** ese grupo: ni el tronco, ni la DA, ni la circunfleja |
| (C1) | los segmentos dibujados bajan con el lado: el trazo también se va |
| (C2) | las letras que quedan son las de las arterias dibujadas |
| (C3) | con «Derecha» el corte del gris de la CD sigue calculado y sólo queda ese grupo |

⚠️ **(B4) y (B5) son las que prueban que el criterio es el campo `g`** y no una lista propia: el
día que la dominancia mueva una rama, el selector la sigue sin tocar nada.

---

## TC-816 — la independencia y la persistencia

**Escena:** la misma, con los 17 segmentos alterados para que el bloque «Arterias posiblemente
involucradas» diga algo — con la contractilidad intacta dice «Ninguna.» y comparar tres «Ninguna.»
no prueba independencia.

| # | qué fija |
|---|---|
| (A0 DENOM) | hay contractilidad alterada y el bloque de arterias dice algo |
| (A0b DENOM) | el selector **existe**: sin él las tres fotos son la misma |
| (B1) | elegir un lado no cambia el estado de contractilidad |
| (B2) | ni el texto de hallazgos del informe |
| (B3) | ni el bloque «Arterias posiblemente involucradas» |
| (B4) | ni la leyenda del territorio, ni el modo de color del 3D |
| (C1 DENOM) | el segmento **sí** cambió de motilidad |
| (C2) | y el selector sigue donde estaba |
| (D1) | cambiar de vista no lo suelta |
| (D2) | cambiar de dominancia tampoco, y el dibujo se actualiza al instante (8 → 2) |

---

## TC-817 — la estructura de la ficha y el globo

| # | qué fija |
|---|---|
| (A0 DENOM) | la ficha existe, está en la subpestaña de congénitas y abre |
| (A1) | tiene **cuatro** hijos y el esquema es el **tercero**, con `data-ref-solo` y el id `rac-root` |
| (A2) | los dos primeros siguen **sin** la marca y con su texto intacto, palabra por palabra |
| (B1) | **cinco** apartados, en el orden que la orden fija |
| (B2) | cada título lleva su casilla delante y su sigla en una pastilla |
| (B3) | el texto es corrido: 3, 3, 2, 1 y 3 párrafos |
| (C1) | **dieciocho** casillas: cinco de título y trece dentro de las frases |
| (C2) | el reparto por apartado es 5, 5, 1, 1 y 6 |
| (C3) | **ninguna lleva `id`**, así que ningún recolector ni «Nuevo estudio» las alcanza |
| (C4) | las dieciocho son de verificación y su **etiqueta las envuelve** |
| (C5) | al abrir están destildadas y los cinco cuadros ocultos **por clase**, sin `hidden` |
| (D1) | el texto nuevo existe y no nombra una guía, un folio, una clase ni deja nada pendiente |
| (D2) | ni escribe un solo grado |
| (D3) | el pie de cada cuadro dice cómo se lee el esquema |
| (E1) | el clon del globo sigue en **478** caracteres |
| (E2) | y lo que clona es la ficha vieja, sin una palabra del esquema nuevo |
| (F1) | siguen los **cuarenta** encabezados con `toggleRef` que alimentan el buscador |
| (F2) | la subpestaña de congénitas sigue con sus **dos** entradas |

---

## TC-818 — las dieciocho casillas, una por una

| # | qué fija |
|---|---|
| (A0 DENOM) | la ficha abre con sus dieciocho casillas y el **motor** del esquema existe |
| (A1) | las dieciocho, una por una, dibujan su esquema con su base de tres cavidades y su leyenda, y destildarla lo oculta sin SVG |
| (A2) | destildar la última deja los cinco cuadros ocultos |
| (B1) | los tres caminos se dibujan a la vez: más trazos y más filas de leyenda |
| (B2) | el intramural se **agrega** a los tres, con su fila de leyenda |
| (B3) | sólo el título dibuja el origen y las normales, y el pie pide un camino |
| (B4) | con un camino tildado la nota desaparece |
| (B5) | el apartado de la izquierda usa el mismo molde |
| (C1) | la ALCAPA dibuja la derecha dilatada, las colaterales y el flujo invertido con su flecha |
| (C2) | la ARCAPA dibuja su derecha naciendo de la pulmonar, con su punto y su rótulo |
| (D1) | con el título solo, un origen solo o una desembocadura sola, el pie pide las dos |
| (D2) | con un origen **y** una desembocadura dibuja su recorrido, con su círculo y su rótulo |
| (D3) | dos orígenes por tres desembocaduras dibujan **seis** recorridos |
| (D4) | al destildar todo, los cinco cuadros vuelven a estar ocultos |

---

## TC-819 — la geometría y el color

⚠️ **`getBBox` devuelve ceros en un subárbol `display:none`**, así que la ficha se abre y los cinco
cuadros se hacen visibles **antes** de medir: sin eso todo da cero y parece impecable.

| # | qué fija |
|---|---|
| (A0 DENOM) | el motor existe y los cinco cuadros se ven con su SVG con caja |
| (A1) | el lienzo de los cinco es `0 0 400 360` |
| (A2) | **ningún** rótulo se sale del lienzo |
| (A3) | **ningún** par de rótulos se encima, con tolerancia de una unidad |
| (A4) | ni un trazo ni un relleno en **negro**: el color se resuelve por regla de CSS |
| (A5) | el esquema de los caminos usa **cinco** colores distintos |
| (B1) | el tema claro y el oscuro dan **dos** paletas distintas, las dos sin un negro |
| (C0 DENOM) | el apartado existe con su cuerpo, su texto y su cuadro |
| (C1 DENOM) | a este ancho el cuerpo va en fila y el cuadro al costado, en 230 px, sin solaparse |
| (C2) | la casilla con su texto mide **24 px o más** de zona táctil |
| (C3) | la ficha no desborda a lo ancho |
| (C4) | el corte está declarado sobre la **ventana** en 700 px |

⚠️ **(A3) lleva tolerancia de una unidad, y está medido por qué**: los dos rótulos de desembocadura
de la fístula están en (6,44) y (6,60) —coordenadas del pedido— y la caja de un texto de 13 unidades
mide unas 16, así que **se tocan por 0,07 unidades** sin superponerse. Con la comparación estricta
en coma flotante el caso marcaba un solape que el médico no puede ver. Declarado en `P34-b`.

⚠️ **(A4) es la condición del negro**: un `var()` escrito dentro de un atributo de presentación es
inválido en tiempo de cómputo y cae en el negro heredado de la raíz — la trampa de POP-B con
`--amber` y de PANT-13 con `--card`. Cero negros es lo que prueba que el color va por una regla.

---

## TC-820 — la captura

⚠️ **La animación se pausa antes de cada captura**: leer el PNG es asíncrono, así que entre dos
capturas corren cuadros de `requestAnimationFrame` y cada PNG sale con otra fase del latido.

| # | qué fija |
|---|---|
| (A0 DENOM) | la captura se hizo y el PNG sale a escala 2 sobre el lienzo de 680 |
| (A1) | con «Coronarias» apagado, el rincón del rótulo está vacío en el PNG |
| (A2) | prendido pero sin vista, sigue vacío |
| (A2b DENOM) | la vista «Lateral» y el selector de arteria **existen** en este árbol |
| (A3) | con una vista puesta, el rótulo **sale** en el PNG que va al PDF |
| (A4) | la banda del pie del PNG queda intacta: el rótulo no se le encima |
| (B1) | la captura respeta el selector: los tres lados dan tres PNG distintos |
| (B2) | volver a «Todas» devuelve el **mismo** PNG |
| (B3) | el rótulo sigue en el PNG con cualquiera de los tres lados |

---

## Los tres casos adaptados

| caso | qué cambió, y por qué |
|---|---|
| **TC-779** | (B2) y (B3) **cambian de sujeto**: el cuerpo propio de la ficha dejó de ser las cuatro viñetas de PANT-29 y pasa a ser el esquema. Lo que el caso sigue vigilando —los hijos 1 y 2 intactos y el globo en 478— está en (A1), (A2), (A3), (C1) y (C2), **intactas**. El techo de 850 caracteres y 7 viñetas **no aplica** a esta sección: la orden la releva, y (B3) hoy exige lo contrario —cero viñetas y más de 850 caracteres—, así que puede fallar por los dos lados |
| **TC-783** | (B6) pasa de **seis** a **nueve** vistas; (B7) de **siete** a **ocho** botones, porque el selector de arteria agrega uno visible. Entra en la lista a propósito: un botón nuevo que no se mide es un botón que puede quedar por debajo del piso táctil sin que nadie se entere |
| **TC-784** | (B1) pasa de seis a **nueve** dibujos distintos; **(B2) queda INVERTIDA**, y es el día que ese caso anunciaba: exigía que el botón dijera «Vista: …» y hoy exige que **no** lo diga, que el título sea el mismo en las nueve y que la **tilde** marque la elegida |
