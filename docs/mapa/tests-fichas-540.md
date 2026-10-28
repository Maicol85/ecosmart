<!-- Ficha del TC-540. Archivo propio porque `tests-fichas.md` ya estaba en 34,2 KB. -->

# TC-540 — la tanda D: calculadora de riesgo CV y score de amiloidosis

**Dónde**: `scripts/test_clinico.mjs`, justo después de TC-539.
**Qué fija**: 31 condiciones en diez grupos, con **tres denominadores declarados** y **cinco
controles negativos**.

## Los grupos

| Grupo | Qué fija |
|---|---|
| **DENOMINADOR CO** | las quince casillas existen y la cápsula responde — sin esto, todo lo demás mide sobre un módulo que no se montó |
| **C1 · C2** | hay **un solo** selector de fármaco y «Datos basales» lo refleja |
| **A1** | anti-HER2 sin factores = **BAJO** (en HEAD salía alto) |
| **A2** | antraciclina + anti-HER2 = **ALTO**, por la nota al pie g |
| **A3** | la **asimetría de la FA**: bajo con antraciclinas, moderado con anti-HER2 |
| **A4** | IC previa = muy alto · cardiopatía isquémica = alto |
| **A5** | los **dos bordes** de la regla: 4 puntos moderado, 5 alto, un solo M1 bajo |
| **A6** | las **dos filas de edad**: 72 moderado, 83 alto |
| **A7** | sexo femenino y GLS basal **no puntúan**, y la pantalla los nombra |
| **A8** | el antecedente CV **sin especificar** no suma y pide elegir cuál |
| **B1 · B2 · B3** | la derivación por categoría, y **B3 es control negativo**: en bajo no hay acción |
| **B4 · B5** | la última fila vale en cualquier categoría; **B5 es control negativo**: sin hallazgos no se afirma que no los haya |
| **B6** | clases y niveles **en el globo**, no en la línea visible (regla R2) |
| **D1 · D2** | el calendario es del fármaco: 3 meses en anti-HER2, dos ciclos en antraciclinas |
| **D3 · D4** | un fármaco sin columna no recibe calendario, con **dos textos distintos** |
| **E1** | vaciar la calculadora vacía «Datos basales» |
| **DENOMINADOR F** | el score se pobló solo, o sea que había algo que contar |
| **F1 · F2** | cuatro criterios se marcan solos; **F2 es control negativo**: el ápice nunca |
| **F3** | el puntaje llega solo al algoritmo y el botón retirado no está |
| **F4** | el destildado a mano sobrevive al barrido |
| **F5** | módulo → app escribe si está vacío y **no pisa** si difiere |
| **G1** | las **once filas** del rendimiento por corte contra la Tabla 4 |
| **G2 · G3 · G4** | sin «transtiretina», con los límites de la fuente, sin el apellido del autor |
| **DENOMINADOR H · H1** | las siete tablas y ninguna celda sin tilde |
| **I1 · I2** | **controles negativos**: un estudio ajeno no nombra ninguno de los dos módulos y su `alg-ett-score` sigue vacío |

## Lo que costó escribirlo

⚠️ **ACENTOS GRAVES EN EL CUERPO.** Dos veces: una en un comentario que citaba `co_edad` y otra en
uno que citaba `window`. El cuerpo es un template literal y uno solo lo cierra, con un
`SyntaxError` que apunta decenas de líneas antes del culpable. `check_backticks.py` sólo mira
`scripts/*.mjs` por patrón, así que **no los caza dentro de un `caso(...)`**: hay que contar los
backticks del fragmento antes de insertarlo.

⚠️ **EL GLOBO ⓘ NO SE LEE DESDE `VINFO`.** Esa constante **no está en `window`** —es un `const` de
módulo—, así que leerla daba cadena vacía y tres condiciones pasaban por el lado equivocado. Se
abre por su **botón real**, que además es el gesto del médico.

⚠️ **Y EL BOTÓN DEL GLOBO MIDE 0 × 0 CON LA TARJETA PLEGADA.** `_vInfoColocar` sale sin abrir nada
cuando el ancla no tiene caja, así que el caso abre la pestaña por su botón **y** despliega sus
tarjetas antes de medir. Es la lección **E-b** de este repo: `showTab` por código no le da caja a
la tarjeta de adentro.

⚠️ **E1 PASABA EN HEAD Y NO DEBÍA.** El helper `farmaco()` llama a `calcCardioOnco()`, que es
**justo** el disparador que la app no tiene cuando el médico destilda una casilla: con esa llamada
el defecto de limpieza no aparece. Hoy la condición hace **sólo el gesto**. Es el error de TC-519,
que fabricaba el disparador que faltaba y pasaba en verde sobre un defecto.

⚠️ **LA MARCA DE «LO DECIDIÓ UNA PERSONA» SOBREVIVE A `limpiar()`.** Vive en el input oculto
`hfaicos_manual`, que **viaja con el estudio**, así que una escena heredaba las casillas protegidas
de la anterior. `escenaCO()` lo vacía a mano, igual que TC-539 tuvo que borrar las pastillas de
válvulas.

⚠️ **CONTRA HEAD CAE ENTERO, NO ABORTA.** La primera versión reventaba en la condición A7
(`a7.fueraDeTabla.length` sobre un objeto que HEAD no devuelve) y las veinte condiciones de abajo
no llegaban a correr: una sola excepción ocultaba qué distinguía de verdad los dos árboles. Con
los accesos endurecidos, **31 de 31 condiciones caen contra HEAD** y los cinco controles negativos
pasan en los dos, que es como tiene que ser.

---

# TC-541 — la corrección D-9: borrar borra de verdad

**Dónde**: justo después de TC-540. **15 condiciones**, con **cuatro denominadores declarados** y
**tres controles negativos**. Cae en **8 de sus 15** contra el HEAD de la tanda D.

| Grupo | Qué fija |
|---|---|
| **DENOM. A** | los ocho campos existen, el módulo los refleja y el score se pobló — sin esto, «quedó vacío» no prueba nada |
| **B1 · B2** | los ocho se dejan borrar y el reflejo **sigue al dato**: se vacía, o queda con lo que resta |
| **C1 · C2 · C3** | tras **cinco segundos**, tras cambiar de pestaña, y tras **guardar y reabrir** |
| **DENOM. C · C4** | el estudio con los ocho vacíos se guardó de verdad, y el score bajó |
| **D1 · D2** | el cartel de HVI se va con los **dos** espesores vacíos; **D2 es control negativo**: con uno solo, sigue |
| **E1 · E2** | el gesto dentro del módulo escribe en un campo vacío y **no pisa** uno cargado |
| **E3** | **control negativo**: el barrido NO escribe en el estudio. Es el que mata la mutación clave |
| **DENOM. F · F1** | lo que el médico tipea en el módulo sobrevive al barrido |
| **DENOM. G · G1** | con la **fuente incompleta** —dos de tres insumos— el reflejo no se lleva puestos los que quedan |

## Lo que costó

⚠️ **(B2) EXIGÍA VACÍO Y ESTABA MAL.** Borrando una sola `e′`, el promedio del calculador pasa a
valer la que queda: no desaparece. La primera versión daba rojo sobre el comportamiento correcto.
Hoy cada campo declara **qué espera** tras su borrado.

⚠️ **(F1) Y (G1) NACIERON DE MUTACIONES QUE SOBREVIVIERON**, no de la lectura: una cubría lo que el
médico tipea dentro del módulo y la otra el caso de la fuente incompleta.

⚠️ **ACENTOS GRAVES EN EL CUERPO, POR CUARTA VEZ EN LA TANDA.** El cuerpo es un template literal y
uno solo lo cierra, con un `SyntaxError` que apunta decenas de líneas antes. Contar los backticks
del fragmento **antes** de insertarlo es más barato que leer ese error.

---

## TC-542 — el dueño del dato, en los dos sentidos (D-10)

**Qué fija.** Los seis hallazgos del médico con sus valores exactos: peso 70, talla 170, septo 14,
pared posterior 12, DDVI 45, el septo subiendo a 18 y a 20, el DDVI borrado, el tecleo del «1» y
después el «5», el cartel de HVI y «Nuevo estudio».

**Veintidós condiciones, SIETE de ellas denominadores**, y **cae en seis** contra el HEAD del D-9.

| Grupo | Qué exige |
|---|---|
| DENOM A | los diecisiete nodos de los dos lados existen |
| DENOM B | los tres del VI quedaron cargados en el **estudio** |
| (H1) | el calculador se llena solo con 14, 12 y 45, **esperando el debounce real** |
| (H1b) | **control negativo**: con 0,58 el criterio NO se marca — el corte es *mayor* a 0,6 |
| (H2a) | el módulo sigue al septo: 18, espesor 0,67 y el criterio marcado |
| DENOM C | el borrador guarda el campo **del módulo** además del del estudio |
| DENOM D | la recarga borró las marcas de espejo y el restaurador no tiró |
| (H2b) (H2c) | tras recargar sigue mostrando el dato, y **sigue al dato nuevo**: 20 y 0,71 |
| (H4) (H4b) | borrado el DDVI se vacía y el criterio se destilda; el septo y la pared **no** se van con él |
| (H3) (H3b) (H3c) | el cartel dice 14,0 mm; borrado el septo **cae a 12,0 mm**; vaciados los dos, se va |
| DENOM E | el septo del estudio arranca vacío |
| (H6) (H6b) | el estudio recibe **los dos dígitos**, en el encabezado y en el espesor relativo |
| (H6c) (H6d) | **control negativo**: el 20 cargado a mano no se pisa y lo del módulo no se borra |
| DENOM G | el TAPSE llegó solo al calculador antes del gesto |
| (H6e) (H6f) | con **un solo** campo espejo, el 16 del estudio no se pisa y el 21 del módulo queda |
| (N1) (N2) | el criterio destildado a mano sigue destildado, y el calculador igual refleja el dato |
| (N3) (N4) | el `e′` promedio se autollena, y escrito a mano **no** se pisa |
| DENOM F · (H5) (H5b) | había datos; «Nuevo estudio» no deja ninguno; los por omisión **siguen** |

### Lo que costó

⚠️ **El tecleo tiene que ser dígito por dígito.** Un solo evento con la cadena entera no reproduce
nada: el defecto vivía en el estado intermedio, con el estudio ya escrito por el primer dígito.

⚠️ **El espesor relativo se lee con `V()` y no con `T()`.** El campo del resultado es un `<input>`,
así que su `textContent` está vacío siempre. Escrito con `T()` daba rojo sobre un valor correcto, y
las tres condiciones decían `result=` pelado — que es justo lo que delata el error.

⚠️ **La recarga se ejercita por su camino, no con `location.reload()`.** Un `Runtime.evaluate` que
navega la página no devuelve: el contexto muere con el `evaluate` en vuelo y la sonda queda dormida.
Medido: **trece minutos a 0 % de CPU sin escribir un byte**, y otros dos con las marcas de progreso
puestas, colgado exactamente en ese paso. Lo que corre una recarga es el restaurador del borrador, y
eso sí se puede llamar: se guarda el borrador, se devuelve cada campo a su `defaultValue` **y se
borran las marcas de espejo**, que es el DOM que da una carga nueva.
⚠️ **La primera versión de esa simulación NO borraba las marcas, e informó «H2 no se reproduce»
sobre el defecto.** Dejar las marcas puestas es dejar puesta justamente la cosa que la recarga
destruye.

⚠️ **El caso quedó primero DESPUÉS del arnés** —al final del archivo, detrás del `}` de la limpieza
de Chrome— y el suite informó **0/0 ✓**: ni rojo ni verde, simplemente no existía. Un caso que no se
registra pasa por no estar.

⚠️ **Y devolvía `ex` en vez de `{ extra: ex }`**, que el arnés nombra con todas las letras: «las
condiciones van dentro del objeto devuelto». Con el array pelado el caso sale rojo con veintidós
condiciones verdes adentro.

⚠️ **Acentos graves: la quinta vez.** Dos de mis comentarios dentro del template de la sonda
llevaban nombres entre acentos graves y el archivo dejó de parsear con un `SyntaxError` que apunta
a otra línea. Contarlos antes de insertar, no después.

---

## TC-543 — un dato, dos puertas, gana la última edición (D-11)

**Veintisiete condiciones, SEIS de ellas denominadores**, y **cae en seis** contra el HEAD del D-10.

| Grupo | Qué exige |
|---|---|
| DENOM A | existen los campos de las dos puertas y los nodos de lo derivado |
| DENOM B | el módulo recibió cada dato del estudio **antes** del gesto |
| (A) | lo tecleado en el módulo llega al estudio **tecla por tecla** y **pisa** lo que había, en los ocho datos |
| (B) | el retroceso también llega: queda «1» y después **vacío en los dos lados** |
| (C) | lo cargado en AI/VI se ve en el calculador |
| DENOM C · (D1) | el botón violeta anuncia el valor **sin que nadie lo abra** |
| (D2) (D3) | borrados los tres, el botón vuelve a «Calcular» y el espesor, el cartel y el score quedan vacíos |
| (D4) (D5) | la flecha sigue diciendo si el acordeón está abierto, y la etiqueta sigue al dato igual |
| (E1) (E2) (E3) | **controles**: el barrido, los recálculos y el cambio de pestaña **no** escriben |
| (E4) | **control por el camino del espesor relativo**, no sólo por el del TAPSE |
| DENOM F · (E5) | la marca de espejo **no** sobrevive a «Nuevo estudio» |
| DENOM D · (F) | abrir un estudio guardado no escribe nada y el módulo lo refleja |
| (G1) (G2) (G3) | un «−» solo no borra el dato ni se lo come el barrido, y completado **sí** llega |
| DENOM E · (H1) (H2) | el criterio destildado a mano se respeta, y el gesto igual llega al estudio |

### Lo que costó

⚠️ **El caso se colgó 27 minutos a 0 % de CPU, y la causa era MÍA.** `guardarInforme` tiene una
salida temprana: **sin nombre ni documento del paciente avisa por `toast` y hace `return` sin
llamar al callback**, así que la promesa del helper de guardado no resuelve nunca. Mi escena no
ponía nombre. Dos arreglos, y los dos hacen falta: el nombre, y un **reloj** sobre esa promesa —un
caso que se cuelga no es un caso rojo, es un caso que no corre, y en un lote se lleva puesto todo
lo que viene después.
⚠️ **Y la tarjeta de confirmación de severidades se busca varias veces, no una.** El helper la
clickea justo después de pedir el guardado; si aparece un instante más tarde, ese clic no la
encuentra.

⚠️ **Las marcas de progreso dentro de `ex` no sirven para diagnosticar un cuelgue**: el arnés sólo
las imprime cuando el caso **devuelve**. Lo que sirvió fue bisecar con un `return` temprano.

⚠️ **Tres condiciones nacieron de mutaciones que sobrevivieron**, y las tres por el mismo motivo
—el control miraba un solo camino—: la **flecha** del botón (las otras condiciones la recortaban),
el control del **espesor relativo** (los de automatismo miraban sólo el TAPSE, así que reintroducir
la escritura dentro de `calcRWT` no rompía nada) y la **marca de espejo** en «Nuevo estudio».

⚠️ **La expectativa del `e′` promedio estaba al revés en la primera versión.** Es el único de los
ocho sin camino de vuelta: al teclear ahí el módulo **conserva** lo tecleado y el estudio no cambia;
al vaciarlo, el reflejo lo repuebla. Escrito como si fuera de dos puertas, daba rojo sobre el
comportamiento correcto.

⚠️ **Acentos graves: la séptima vez.** Dos comentarios nuevos llevaban nombres entre acentos graves
y el archivo dejó de parsear con un `SyntaxError` que apunta a otra línea.
