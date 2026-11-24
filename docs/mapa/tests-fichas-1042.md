# Fichas de los casos TC-1042 a TC-1050 — tanda PR7 (2026-11-23/24)

Los **nueve** casos de la paleta propia del strain, el ingreso de datos numéricos y el PDF de los
dos bull's eye. Archivo propio porque `tests-fichas.md` y `tests-punteros-tandas.md` están por
encima del techo de ~35 KB.

**Los nueve caen `0/9` contra `f6d51f8`** —el cierre de PR6— con el mismo archivo de casos y sólo
el `index.html` distinto, **por sus condiciones y NINGUNO por excepción**.

> ⚠️ **TODO ACCESO VA POR UN AYUDANTE CON GUARDA Y DEVUELVE UNA FORMA VACÍA.** Contra el árbol
> anterior ninguna de las funciones de PR7 existe, y un acceso pelado tira `ReferenceError` que se
> lleva el caso **entero**: la condición sale roja y las de abajo **no llegan a evaluarse**. Es lo
> que TC-827 tuvo que deshacer en PANT-37 y lo que TC-1030 pagó en PR5. Dos de estos nueve lo
> pagaron igual en su primera versión —TC-1046 por `STRAIN_PAL[0]` y TC-1050 por `dib[0].w`— y se
> cerraron con un gris guardado y con una **forma vacía que trae todas las claves**.

---

## TC-1042 · Los ocho tramos, sus bordes y los dos extremos

Sin escena: mide el **dueño único del tramo** y la paleta, que son puros.

- **(A1) a (A4)** — nueve entradas, los ocho colores en orden de −20 a +20, el gris de sin dato y
  las ocho marcas de la leyenda.
- **(B1) a (B8)** — los bordes: **−20 → 1**, **−15 → 2** (el de su derecha, no el 1), **−0,1 → 4**,
  **0 → 5**, **+4,9 → 5**, **+5 → 6**, **+20 → 8**, y los ocho bordes cayendo cada uno en su tramo.
- **(C1) a (C3)** — **−30 → 1** y **+25 → 8**, el color del extremo; y lo que no es número no es
  ningún tramo.
- **(D1)(D2)** — el número en **blanco** sobre los tramos 1, 2, 7 y 8 y en **gris muy oscuro**
  sobre 3 a 6.
- **(E1) CONTROL NEGATIVO** — la paleta de la **motilidad** no contiene ningún color de la de
  strain.

> ⚠️ **`CONTR_MOTILIDAD` SE LEE POR SU NOMBRE PELADO Y NO POR `window`.** Es un `const` de nivel
> de script, así que `window.CONTR_MOTILIDAD` es `undefined` y la condición medía sobre una lista
> **vacía** — que es como leer que no hay nada que comparar.

---

## TC-1043 · El botón APAGADO: arranque sin dato, nueve estados y el toque borra el número

- **(DENOM)(DENOM2)** — la pestaña abre, el bull's eye se dibuja y el interruptor está apagado.
- **(A1) a (A3)** — **17 segmentos y 17 nodos de número**; los 17 arrancan **grises** y con un
  **guion** adentro.
- **(B1) a (B4)** — el ciclo recorre **nueve** estados distintos, en el orden de la paleta, y el
  décimo toque **vuelve** a sin dato. Con un color elegido a mano el segmento **no muestra ningún
  número**.
- **(C1) a (C4)** — un segmento con número y su color derivado; tras el toque el número **ya no
  está**, el color cambió al tramo siguiente y el almacén de números quedó sin su entrada.

---

## TC-1044 · El botón ENCENDIDO: la casilla, el signo y Escape

- **(A1) a (A4)** — el botón existe, lo nombra, mide **44 px** de alto, arranca con
  `aria-pressed="false"`, tiene su globo, y el globo explica **las dos mitades** del gesto, el
  rango y el guion.
- **(B1) a (B4)** — el interruptor se prende, un toque **abre** la casilla, la casilla **no lleva
  `id`** y mide **44 px** de alto.
- **(C1) a (C3)** — al confirmar se cierra, el número se ve **con un decimal** y el color se
  asignó **solo**, derivado del número por el dueño único.
- **(D1) a (D7)** — el signo: sin signo **negativo**, con `+` explícito **positivo**, el menos
  tipográfico vale, la coma y el punto dan lo mismo, `+2,5` da `2.5`, el cero es cero, y lo vacío
  y lo que no es número no dan número.
- **(E1)(E2)** — **−30** y **+25** se pintan con el color del extremo y **publican su número**.
- **(F1)** — borrar deja el segmento sin dato, gris y con guion.
- **(G1) a (G3)** — Escape cierra la casilla y **no cambia** el número ni el color.
- **(H1)(H2)** — apagar el interruptor **cierra** la casilla abierta, y con el modo apagado un
  toque vuelve a ciclar sin abrir casilla.

---

## TC-1045 · El guardado, la restauración y el estudio viejo de cinco estados

- **(A1) a (A7)** — el viaje de ida y vuelta: el guardado lleva los índices y **sólo los números
  de los que tienen uno**; tras limpiar el segmento vuelve a sin dato (denominador); al restaurar
  vuelven el número **negativo**, el **positivo** y el segmento que sólo tenía color, **sin
  número**.
- **(B1) a (B5)** — un estudio **viejo** abre sin error; los cuatro estados pintados se migran
  **1→2, 2→3, 3→5 y 4→7**; el **0 viejo va a SIN DATO** con su guion; **a ninguno se le inventa un
  número**; y el estudio viejo **sigue** contando como strain evaluado.
- **(C1) CONTROL NEGATIVO** — un estudio viejo con **todo en cero** NO es strain evaluado.
- **(D1)** — un número que **no deriva** el tramo guardado no se repone: **gana el color**.
- **(E0) a (E4) — EL GUARDADO DE VERDAD.** El estudio se guarda con `__t.guardar()` y se lee del
  almacén: trae los **índices**, los **números** y la **marca de versión**, y al reabrirlo los dos
  números vuelven con su color.

> ⚠️ **EL BLOQUE (E) VA EN UNA FUNCIÓN `async` PROPIA**: el cuerpo de un caso se evalúa dentro de
> una función **no** `async`, así que un `await` suelto es un `SyntaxError` que se lleva el caso
> entero.
> ⚠️ **Y ESE BLOQUE LO DESTAPÓ EL BARRIDO, no el censo.** Ninguna condición medía que las tres
> claves entraran al estudio que guarda `guardarInforme` —el caso armaba el guardado con
> `strainSnapshot`—, así que la mutación 17 **sobrevivía**.

---

## TC-1046 · «Limpiar»

- **(DENOM)(DENOM2)** — la escena tiene **tres** segmentos pintados y dos con número.
- **(A1)** — el botón «Limpiar» existe, y se aprieta **el botón** y no la función: es el gesto del
  médico.
- **(A2) a (A4)** — los 17 quedan sin dato, los 17 vuelven a mostrar el guion y el almacén de
  números queda vacío.
- **(A5)(A6) CONTROLES NEGATIVOS** — **no toca** el campo SGL global ni los comentarios de strain.
- **(A7)** — y deja de contar como strain evaluado.

---

## TC-1047 · Ningún texto del usuario de SGL nombra la marca

- **(DENOM) a (DENOM5)** — la pestaña abre con sus acordeones desplegados, hay más de 1.200
  caracteres que leer, los dos globos abren con texto, el informe se generó y el PDF se generó de
  verdad.
- **(A1) a (A3)** — la pantalla de SGL no nombra la marca; la frase de arriba describe el gesto
  nuevo y los 17 segmentos; el título de la leyenda dice **«Referencia de colores»**.
- **(B1)(B2)** — ningún globo de strain **se atribuye** la escala («escala GE», «(GE)»), y el globo
  del ingreso numérico no nombra **ninguna** marca.
- **(B3) CONTROL POSITIVO** — el globo de los patrones **sí conserva** la cita de Phelan 2012 con
  su equipo.
- **(C1)(C2)** — el informe y el **PDF generado de verdad** no nombran la marca.
- **(D1) CONTROL POSITIVO** — las **dos** filas de la tabla de amiloidosis conservan el nombre del
  equipo del método publicado.

> ⚠️ **LA PRIMERA VERSIÓN DE (B1) EXIGÍA QUE NINGÚN GLOBO NOMBRARA «General Electric», Y ERA
> DEMASIADO.** El globo de los patrones lo nombra en su bloque «A tener en cuenta» y **es
> correcto**: es la salvedad metodológica de Phelan 2012 y la advertencia de la ASE 2025 de que el
> strain depende del fabricante. Una cita bibliográfica no es una afirmación sobre esta paleta.

---

## TC-1048 · La leyenda, en las dos pantallas y en el PDF

- **(A1) a (A5)** — la leyenda del paciente tiene **ocho cuadritos**, **un** cuadrito gris «Sin
  dato», rotula los **ocho rangos**, **no** lleva nombres de categoría, y los ocho cuadritos llevan
  los ocho colores **en orden**.
- **(B1)(B2)** — la leyenda de los **patrones de ejemplo** es la **misma barra**, del mismo dueño,
  y tampoco lleva nombres de categoría.
- **(DENOM2)(C1) a (C3)** — en el **PDF**: la tabla de colores está, la barra rotula las **ocho
  marcas**, lleva su cuadrito «Sin dato», y el papel **no imprime** ningún nombre de categoría de
  la paleta vieja.

> ⚠️ **EL NAVEGADOR NORMALIZA EL COLOR DEL ESTILO A `rgb()`**: comparar contra el hexadecimal daba
> falso sobre una leyenda correcta. (A5) convierte el hexadecimal antes de comparar.

---

## TC-1049 · Los patrones de ejemplo, recoloreados

- **(DENOM)(DENOM2)** — los quince patrones se dibujaron y tienen rellenos que contar.
- **(A1) a (A3)** — **ningún** color de la paleta vieja sobrevive; **todos** los rellenos salen de
  la paleta propia; y los patrones usan **varios** tramos y no uno solo.
- **(B1) a (B3)** — la cantidad no cambió (**quince**), cada patrón conserva su nombre y la forma
  sigue siendo de **17 segmentos** por patrón.
- **(DENOM3)(C1)(C2) CONTROLES NEGATIVOS** — el bull's eye de **motilidad** tiene sus 17 segmentos
  dibujados y **no usa** ningún color de la paleta de strain, ni en el dibujo ni en su paleta.

> ⚠️ **LA TARJETA DE UN PATRÓN ES `.patron-acc` Y NO `.patron-card`**: con el selector equivocado
> el conteo daba cero sobre una grilla de quince — que se lee igual que «los patrones se
> perdieron».

---

## TC-1050 · El PDF: la tabla, el texto y sus tres formas

Se intercepta **`doc.text`** y **`doc.addImage`**: las **coordenadas** son la única forma de
afirmar «a la derecha del dibujo» y «debajo de su tabla». Y que el texto entre por `doc.text` es, a
la vez, la prueba de que es **texto real** y no una imagen.

- **(DENOM)** — la escena deja **dos** oraciones de motilidad.
- **(A1) a (A4)** — sólo motilidad: un dibujo, su tabla **arriba a la derecha**, el título
  «Motilidad» a la derecha y **debajo** de su tabla, y nada de strain.
- **(B1) a (B5)** — sólo strain: un dibujo, su tabla arriba a la derecha, «Strain (SGL)» debajo de
  ella, el **SGL global en su propio renglón** y las **dos notas una por renglón**, y nada de
  motilidad.
- **(C1) a (C7)** — los dos juntos: **dos** dibujos y **dos** tablas; los dos dibujos miden lo
  **mismo** y arrancan a la **misma altura** (el espacio del texto está reservado para los dos);
  cada tabla queda arriba a la derecha de **su** dibujo; los **dos títulos** están presentes; el
  texto de motilidad va con el dibujo de la izquierda y el de strain con el de la derecha; y cada
  título queda **debajo de su propia tabla**.
- **(D1) a (D3)** — una oración por alteración: la hipoquinesia en un renglón, la discinesia del
  ápex en **otro**, debajo, y los dos son textos **dibujados distintos**.
- **(E1)(E2)** — **«Arterias posiblemente involucradas» no llega al PDF** en ninguna de las tres
  formas, pero **sigue** en la pantalla.
- **(F1)** — el texto del tile es **texto real**: entró por `doc.text`.
- **(G0) a (G2) — EL PAPEL ESTAMPA LOS NÚMEROS.** El renderer es **determinista** (los mismos
  colores sin número dan el mismo PNG) y el dibujo **con** los números **difiere** del de los
  mismos colores **sin** ellos.

> ⚠️ **EL BLOQUE (G) LO DESTAPÓ EL BARRIDO.** Ninguna condición medía que el bull's eye del papel
> estampara los números, así que la mutación 36 —dejar de pasarle el texto al renderer—
> **sobrevivía**. Se mide por los **bytes del PNG** y no por el código, con su denominador de
> determinismo: sin él, dos PNG iguales podrían venir de un renderer que no dibuja nada.
