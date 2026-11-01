# Fichas — TC-568, TC-569, TC-570 y TC-571 (tanda AJUSTES-3, 2026-10-31)

> Archivo propio porque `tests.md` acababa de partirse en este mismo commit y no tenía sentido
> volver a engordarlo. El puntero vive en `docs/mapa/tests-punteros-tandas.md`.

---

## TC-568 — el bucle del video en los dos PPT

**Qué fija.** Que el árbol de tiempo que `_pptxBucleEnDiapo` escribe es **el del experimento que
el médico abrió en PowerPoint**, con un `spid` único por video y sin referencias colgadas; que
soporta varios videos en una diapositiva; y que si la validación estricta falla **no escribe
nada**, dejando el paquete sano.

**Por qué mide las piezas y no un `.pptx` generado.** El post-proceso es **puro**: recibe un zip
y devuelve el mismo zip con el árbol escrito. Generar el mazo cuesta decenas de segundos y
depende de que PptxGenJS baje del CDN, que es el rojo intermitente que `E-h` documenta. El PPT
generado de verdad, en los dos caminos, lo mide `scripts/_probe_aj3bucle.mjs`.

**El zip de juguete.** `_pptxBucleVideos` usa tres cosas del zip —la lista de partes, leer una
parte como cadena y escribirla—, así que un objeto con esa interfaz lo ejercita entero sin JSZip.
Se declara en (A1) que es un doble.

| bloque | qué mide |
|---|---|
| (A) | denominadores: las tres piezas existen, el doble expone lo que se usa |
| (B) | el árbol contra el del experimento (normalizando sólo el `spid`), el id libre, el orden tras `clrMapOvr`, la referencia no colgada, el parseo estricto |
| (C) | **dos** videos en una diapositiva: dos `p:video`, `spid` distintos, `cTn` únicos |
| (D) | **tres controles negativos**: sin video, con `p:timing` ya, sin `</p:clrMapOvr>` |
| (E) | el post-proceso sobre el zip, y **la caída** con `DOMParser` roto |
| (F) | el camino de «Imágenes guardadas»: `addMedia`, la caída al cuadro, los dos umbrales |
| (G) | **todo o nada**, con el escenario que lo distingue |

⚠️ **(G) NACIÓ DE UNA MUTACIÓN QUE SOBREVIVIÓ.** El bloque (E) tiene **una sola** diapositiva con
video, así que cambiar «si una falla, ninguna se escribe» por «salteo ésa y sigo» daba el mismo
resultado: no había una segunda que escribir. (G) usa **dos**, una que valida y otra que no.

⚠️ **DOS BUGS PROPIOS, Y CADA UNO COSTÓ UNA CORRIDA.**
1. Los marcadores de la plantilla eran `'ID'` y `'N'`, y `String.replace` con una cadena reemplaza
   la **primera** aparición: la `N` de `<p:cNvPr>` quedaba `<p:c0vPr>` y dejaba de ser un shape.
   El síntoma era «cero videos» sobre una diapositiva que sí los tiene. Hoy van entre guiones
   bajos.
2. La primera versión exigía `JSZip`, que llega por CDN. De ahí el zip de juguete.

---

## TC-569 — los botones de respuesta del panel de Evidencia

**Qué fija.** Que los botones Sí / No / Sin dato de **todas** las preguntas del panel miden 44 px
**también con mouse**, que ninguno cae encima de otro control, que el panel no crece ni desborda,
y que el estado deja de depender sólo del color.

**La escena despierta cinco secciones** —bicúspide, transposición, CIA, CIV y muerte súbita de la
miocardiopatía—, y (A1) lo exige: con una sola, «todos los paneles» no se puede afirmar.

| bloque | qué mide |
|---|---|
| (A) | denominadores: el panel abrió, hay preguntas de varias secciones, hay botones que contar |
| (B) | los 44 px de alto y de ancho, en todos |
| (C) | ninguno con parte de su área táctil en otro control |
| (D) | la media query ya no nombra la botonera, y **sí** sigue nombrando el ⓘ de un término |
| (E) | el estado: control negativo sin marcar, el gesto, la marca de forma, el `aria-pressed` |
| (F) | cero barra horizontal y cero textos recortados |

⚠️ **LOS NODOS SE DESPRENDEN EN CADA REPINTADO.** Contestar una pregunta repinta el panel, así que
el nodo que se clickeó queda desprendido —informa 0×0 y el `textContent` del árbol viejo—. Todas
las lecturas posteriores vuelven a consultar el DOM. Es la trampa que TC-550 documenta.

⚠️ **El panel es un modal `position:fixed`**: `offsetParent` da `null` aunque esté abierto. Se
mira la caja, no el `offsetParent`.

⚠️ **Los puntos del cuadrado de 44 que caen fuera de la ventana no cuentan.** `elementFromPoint`
devuelve `null` ahí, que no es «tapado». Lo que se cuenta es que un toque no caiga en **otro
control**.

---

## TC-570 — la cláusula de la insuficiencia tricuspídea sistémica

**Qué fija.** Que la oración volvió al ⓘ de la sección de la TGA **literal, carácter por
carácter**, con su rótulo de criterio propio, sin folio ni clase; que el párrafo de pantalla sigue
neutro; y que el papel no la dice.

**La cláusula está escrita en el caso.** Si alguien le cambia una palabra, (A2) se pone rojo: eso
es lo que «sin cambiar sus palabras» quiere decir.

| bloque | qué mide |
|---|---|
| (A) | el registro de globos, la cláusula literal una sola vez, el rótulo antes de ella, el antecedente afuera, y **sin folio, sin clase y sin nombrar la guía** |
| (B) | **control negativo**: el párrafo de pantalla no la recuperó y sigue sin afirmar cuál es el ventrículo sistémico |
| (C) | **control negativo**: ni el informe ni el EN SUMA la llevan, ni la frase suelta |

---

## TC-571 — la miocardiopatía hipertrófica del PPT

**Qué fija.** Que la línea del PPT describe y no recomienda —sin guía, sin clase y sin perder un
solo número—, que el informe y el PDF quedan **idénticos**, y que la recomendación vive en la
Evidencia con la AHA/ACC 2024 y su folio.

| bloque | qué mide |
|---|---|
| (A) | denominadores: el `resumen` **sí** trae la recomendación y su guía, y el «(N sin evaluar)» **pegado**, que es el defecto |
| (B) | el `papel`: sin recomendación, sin guía, sin clase ni nivel, con el recuento y su rótulo, **sin perder un número**, con la obstrucción severa |
| (C) | **control negativo**: el podador genérico la sigue dejando parada; por eso la vía es otra |
| (D) | **controles negativos**: el informe y el `resumen` **siguen** diciéndolo |
| (E) | la Evidencia: la AHA/ACC 2024, su folio y su hoja, su clase y su nivel, los cinco factores, la cita registrada, y **control negativo** de que lo de la ESC 2023 sigue entero |

⚠️ **SON DOS SECCIONES DEL PANEL Y NO UNA.** `_indMCH` es la de la hipertrofia y la obstrucción;
`_indMCHSCD` la de prevención de muerte súbita, que es donde vive esto. Preguntarle sólo a la
primera daba **cero** sobre una Evidencia que sí la tiene. Costó una corrida, **y la misma
corrección hubo que hacerle a TC-563**, que censaba igual.

⚠️ **LOS CAMPOS SON LOS DEL MÓDULO.** La primera versión usó los del formulario general —`siv`,
`fevi`, `mch_grad_reposo`—: con ésos `mchConclusion` sí emite, pero la sección de Evidencia no se
despierta y el informe no publica el bloque. El caso medía sobre dos denominadores vacíos.

---

## Casos viejos adaptados, con su motivo

| caso | qué cambió | por qué |
|---|---|---|
| **TC-558 (D1)** | exige que el aviso diga que el clip entra **COMPLETO** | decía que «de un video va sólo su primer cuadro», y dejó de ser cierto |
| **TC-563 (C2)** | **invertida**: la recomendación **sí** vive en la Evidencia; + **(C2b)** su fuente | era la medición que dejaba la poda parada, y su propio comentario anunciaba este día |
| **TC-563 (C6)** | el podador **sigue** parado; + **(C7)(C8)**, la vía nueva | la MCH ya no pasa por el podador |
| **TC-563** | el censo mira **las dos** secciones del panel | con una sola daba cero sin probar nada |
| **TC-567** (título) | ya no afirma que la poda sigue parada | el commit 4 la cerró |
| **TC-567 (A2)** | 4/2/3 → **5/3/4**, los cuatro bloques | el bloque de la AHA suma una I, una IIa y una IIb |
| **TC-567 (A2b)** | **nueva**: las nueve filas de la Tabla 23, sobre los tres bloques de la ESC | para que el invariante de la Tabla 23 siga pudiendo fallar solo |
| **TC-567 (A4)** | tres → **cuatro** bloques | el de la AHA/ACC 2024 |
| **TC-567 (C1)(C2)** | mismo sentido, nombre corregido; + **(C2b)** | el informe y el PDF siguen igual; lo que cambió es el PPT |

⚠️ **(A2b) DISCRIMINA POR EL NIVEL Y NO POR LA SIGLA.** Las líneas del bloque de la AHA **no
dicen «AHA»** en su texto —sólo su título y su línea de fuente—. La ESC usa «Nivel B» a secas; la
AHA, **«B-NR»** y **«C-EO»**, que es la nomenclatura de su propio sistema. La primera versión
filtraba por «AHA» y no filtraba nada.

---

## Las mutaciones — `scripts/_mut_aj3.py`

**Dieciocho**, repartidas una por caso: 1-8 → TC-568, 9-11 → TC-569, 12-14 → TC-570, 15-18 →
TC-571. **18/18 muertas**, en worktree y nunca sobre el árbol vivo, con guarda de md5 antes y
después.

**Cuatro no revierten nada: la aplican de más** —la 07 marca una diapositiva que ya trae su árbol,
la 08 una que no tiene video, la 11 pone la marca de forma también al botón no marcado, y la 14
publica la cláusula de la IT sistémica en el papel de la TGA—, porque las condiciones que las
matan son **controles negativos**.

⚠️ **CUATRO SOBREVIVIERON AL PRIMER BARRIDO, Y SÓLO UNA ERA COBERTURA QUE FALTABA.**

| # | por qué sobrevivió |
|---|---|
| **05** | **hueco real**: el escenario tenía una sola diapositiva con video. → nacieron (G1) y (G2) |
| **14** | **mal dirigida**: mutaba `mchConclusion` —el papel de la miocardiopatía— y TC-570 mira el de la transposición |
| **15** | **freno que tapa al que se muta**: revertía la rama de la ESC, y en la escena de TC-571 el score no es calculable, así que esa rama no aporta conducta. Hoy toca la rama de la AHA |
| **17** | **mal escrita**: cambiaba sólo el **título** del bloque, y las líneas —con la recomendación, la guía y el folio— seguían ahí |
