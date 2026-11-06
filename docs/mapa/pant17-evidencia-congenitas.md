# Mapa — la Evidencia de congénitas, la ventana aortopulmonar y el color al tocar (PANT-17)

Qué tocó la tanda del 2026-11-06 y dónde está cada cosa. Los nombres son de función y de
constante, no de línea: la línea cambia en cada edición.

## 1. El mecanismo del panel, lo que se amplió

| pieza | qué hace | qué cambió |
|---|---|---|
| `IND_GUIA_LBL` / `IND_GUIA_CORTA` | la etiqueta de la guía de cada pregunta | gana la clave **`serie`** → «Yakut 2018 — serie de casos» / «Serie» |
| `_indPregNota` | arma la nota de una pregunta | la línea de referencia pasa a llevar **`refLbl`** por pregunta; sin él dice «ESC 2020 (anterior)», que es lo que decían las diez secciones anteriores |
| `_indPregBadge` | la etiqueta corta con su clase | lee la clase de `rec` con una expresión regular y **falla cerrado**: sin clase legible publica sólo la guía |
| `IND_REFS` | el registro de citas | gana `ao1534`, `ao1535`, `ao1536`, `ao1537`, `ao1468`, `ao300` (Tabla 69) · `ao70`, `ao172`, `ao893`, `ao899`, `ao969`, `ao981`, `ao986`, `ao1001`, `ao1500`, `ao1510`, `ao1514`, `ao1515`, `ao1519`, `ao1522`, `ao1523` (Tabla 68) · **`yakut2018apw`** |

## 2. Las secciones que ganaron cuestionario

| sección | registro | función | preguntas | pre-respondidas desde el estudio |
|---|---|---|---|---|
| Ductus arterioso permeable | `DAP_PREG` | `_indDAP` | 13 | la dirección (`dap_dir`) |
| Coartación de aorta | `COA_PREG` | `_indCoAo` | 13 | cinco, por `COA_RESP` |
| Fallot reparada — VD y arritmias | `TDFVD_PREG` | **`_indTdFVD`** (sección NUEVA) | 14 | — |
| Estenosis pulmonar | `EP_PREG_ACC` | `_indEP` (tercera columna) | 9 | — |
| Bicúspide — conclusión | `VABC_PREG` | `_indVABConcl` | 11 | — |
| MCH obstructiva | `MCHO_PREG` | `_indMCH` | 13 | — |
| **Ventana aortopulmonar** | **`VAP_PREG`** | **`_indVAP`** (sección NUEVA) | **6** | Eisenmenger, por `vap_dir` |

**El bidireccional NO se traduce**, ni en el ductus ni en la ventana: `di` contesta que sí, `id`
que no, y `bi` queda **sin contestar a propósito** — la dirección neta no se deduce del
selector. Es el control negativo de TC-714 y de TC-718.

⚠️ **`filas` NO ES OPCIONAL.** `_indSecHTMLCuerpo` hace `r.filas.some(...)` **sin guarda**, así
que una sección sin tarjeta de datos tira dentro del bucle de `IND_SECS` —que atrapa la
excepción— y **desaparece del panel sin un solo error en consola**. Lo pagó `_indTdFVD` en el
commit 4. Lo fijan TC-716 (B2) y TC-718 (B2), y las mutaciones M07 y M15.

## 3. La ventana aortopulmonar — la única sección sin clase ni nivel

Lo que la sostiene es una **serie de casos** (Yakut 2018, 30 pacientes, un solo centro), y una
serie no gradúa recomendaciones: cada pregunta publica el **número**, su **denominador** y la
**población**, con la hoja y el folio del artículo. Medido: `clases` = 0 en las cuatro escenas
de la ventana, contra 52 en la CIA que corre al lado.

La **única** pregunta que sale de una guía es la del Eisenmenger —ACC/AHA 2025, hoja 93, folio
e207, recomendación 11— y **tampoco publica su clase**: en su fuente lleva Clase 3: Daño ·
Nivel B-NR, y eso queda en `docs/PENDIENTES.md` → **P17-d**.

La **referencia 13 (Mori)** se reproduce tal como el artículo la escribe, **como texto y sin
corchete**: ese documento no está en la biblioteca y lo que no se leyó no se cita.

## 4. El color al tocar (corazón maestro 3D)

| pieza | dónde | qué hace |
|---|---|---|
| `_cm3d.sinColor` | el estado del módulo | conjunto de las estructuras apagadas, **memoria de sesión**, prototipo nulo |
| `_matSC` | dentro de `cm3dInit` | **un solo** material compartido, de malla y gris neutro |
| `cmKeysSet()` | al final de `build()` | reparte el ordinal (`m0`, `m1`, …) sobre los hijos del grupo; las partículas no consumen ordinal |
| `cmSinColorAplicar()` | al final de **`setIns()`** | guarda el material original en el propio objeto y lo intercambia |
| `cmTocar(e)` | en `pointerup` | el rayo sobre `root.children`, sin recursión |

**Por qué el aplicador cuelga de `setIns` y no de `build`:** `setIns` **reasigna** el material de
las cámaras en cada pasada, así que una copia guardada una sola vez quedaría vieja. `setIns` es
el **único embudo** por el que pasan los dos caminos —`build` y el setter de «Por dentro»—.

**Por qué lo apagado se borra al cambiar de escena:** las claves son ordinales, estables mientras
`build()` dibuje lo mismo. `build()` compara la firma de `_cm3d.S` con la de la pasada anterior
y, si cambió, vacía el conjunto. Un repintado del MISMO dibujo conserva lo apagado.

**El toque se separa del arrastre por la distancia:** menos de **6 px** entre el `pointerdown` y
el `pointerup`. Sin ese umbral, soltar después de girar apagaría lo que quedara debajo del dedo.

## 5. Cómo se mide cada cosa

| qué | sonda |
|---|---|
| las secciones del panel, sus preguntas, folios y formas prohibidas | `scripts/_probe_pant17ev.mjs` (`--esc` acepta una **lista** separada por comas) |
| el color al tocar, **por píxeles** | `scripts/_probe_pant17col.mjs` |
| el censo de clases de las diez secciones de control | `scripts/_probe_pant17ctrl.mjs` |
| las mutaciones dirigidas | `scripts/_mut_pant17.py <worktree>` |

⚠️ **El color se mide por PÍXELES y no por geometría** —un contorno no mueve un solo punto, que
es la lección de PANT-14—, y el dibujo se quieta con la **frecuencia en cero** y no con la
pausa: con el bucle pausado el lienzo conserva el cuadro anterior.

⚠️ **`IND_SECS` y los registros se alcanzan por su NOMBRE PELADO**: son `const` de nivel de
script y viven en el ámbito léxico global. Con `window.IND_SECS` la medición sale sobre un
denominador vacío — la lección que PANT-13 pagó con `_cm3d`.

## 6. Los casos

**TC-714** el ductus · **TC-715** la coartación · **TC-716** la Fallot del VD y la estenosis
pulmonar · **TC-717** la bicúspide y la MCH, con sus dos controles negativos · **TC-718** la
ventana · **TC-719** el color al tocar.

⚠️ **Se cuenta por ROTULO y no por botonera.** Una pregunta pre-respondida desde el estudio sale
como fila **sin** botonera: contar botoneras mide «cuántas quedan por contestar» y no «cuántas
publica la sección». Costó una corrida, en cuatro condiciones de tres casos distintos.
⚠️ **Y el valor se busca por CLAVE del registro, no por una expresión regular sobre el rótulo**:
un rótulo es texto de pantalla y se reescribe; la clave es el contrato.
