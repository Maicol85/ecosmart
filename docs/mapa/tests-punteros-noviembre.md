# Mapa — los casos de prueba de las tandas PANT-8 a PANT-14c (noviembre de 2026)

> Salieron de `docs/mapa/tests-punteros-tandas.md` en la tanda **PANT-14c**, que lo cruzo el
> techo de 35 KB al escribirle su puntero: 31.438 B mas 5.215 del bloque nuevo dan 36.653.
> Las tandas anteriores a la PANT-8 siguen en ese archivo. **Cero lineas perdidas**, verificado
> una por una.

## PANT-8 (2026-11-04) — la pantalla de TAVI, las referencias del VD y el molde de la pulmonar

| caso | qué fija |
|---|---|
| **TC-656** | los dos botones de TAVI: cada uno en su esquina, pintados enteros con `cc-pane-on` y con su marca a salvo del barrido de `showTab` |
| **TC-657** | el panel Post-TAVI en tres columnas desde 900 px, con los campos en el grupo que ya tenían |
| **TC-658** | la sincronía de TAVI con Aorta / AI en los dos sentidos, con el estudio como dueño y el módulo como puerta |
| **TC-659** | el globo de la calcificación: ninguna fuente la gradúa, sin conducta y sin clase |
| **TC-660** | Referencias del VD con el tronco y las ramas de la arteria pulmonar y los tres TSVD |
| **TC-661** | el molde de Evidencia en la estenosis pulmonar, sin fila de estadio; la prótesis mitral **NO** se toca |

Las fichas, con las cinco trampas de método que costaron una corrida cada una, en
`docs/mapa/tests-fichas-656.md`.

---

## Tanda PANT-9 (2026-11-04) — las siete pantallas de congénitas y el valve-in-valve de TAVI

**Seis casos nuevos, TC-662 a TC-667.** Sus fichas están en archivo propio:
`docs/mapa/tests-fichas-662.md` —porque `tests-fichas.md` está en 34.237 B, al techo—.

| Caso | Qué fija |
|---|---|
| **TC-662** | Fontan en tres columnas, las seis casillas de complicaciones con su lógica, y las dos notas en su globo |
| **TC-663** | Eisenmenger en tres columnas, **la franja roja arriba y visible**, y las cuatro notas en su globo |
| **TC-664** | Ebstein en tres columnas, el párrafo de la sección, la nota de las áreas y **la caja roja** en sus globos |
| **TC-665** | DSAV, CVPA, ductus y VAP en tres columnas; la línea de diseño del DSAV **fuera** de la pantalla y **fuera** del globo |
| **TC-666** | el contrato de la hoja de estilos: los dos cortes por su **valor**, el piso dentro de la media query, y que las clases son propias de estas siete secciones |
| **TC-667** | la opción de valve-in-valve, su texto de papel y las dos parejas de sincronía en los dos sentidos, con la condición del Laboratorio |

**Casos viejos adaptados, con su motivo:** **TC-471** y **TC-500** (el registro de globos, 123 →
**140**), **TC-502 (C3)** (las tarjetas sin ficha en Referencias, 50 → **67**, nombradas una por
una) y **TC-535 (K0/K1/K2)** (los globos de 44×44, 44 → **61**).

⚠️ **Y DOS CONDICIONES NACIERON DEL BARRIDO DE MUTACIONES, porque eran huecos reales:** **TC-666
(D1b)** —nada afirmaba que la regla **base** de la fila sea de una sola columna, así que declarar la
conclusión a la derecha **fuera** de toda media query sobrevivía— y **TC-663 (B5)**, que miraba sólo
el bloque «Qué mide» del globo, así que mover la franja roja al bloque «A tener en cuenta»
sobrevivía.

El arnés de mutaciones es `scripts/_mut_pant9.py`: **41 mutaciones, 41 muertas**, cada una
declarando **su** caso. Siete no revierten nada: la aplican **de más**, porque las condiciones que
las matan son controles negativos.

## PANT-10 (2026-11-04) — los textos de congénitas y la Evidencia de cinco lesiones

| Caso | Qué fija |
|---|---|
| **TC-668** | Los diecisiete textos `cc9-*` corregidos contra su hoja, lo retirado ausente y la franja de Eisenmenger idéntica |
| **TC-669** | La Evidencia del defecto del septo auriculoventricular, 13 preguntas |
| **TC-670** | La Evidencia de la anomalía de Ebstein, 12 preguntas |
| **TC-671** | La Evidencia de la circulación de Fontan, 14 preguntas |
| **TC-672** | La Evidencia de la conexión venosa pulmonar anómala parcial, 9 preguntas |
| **TC-673** | La Evidencia del síndrome de Eisenmenger, 14 preguntas |

Fichas en **`docs/mapa/tests-fichas-668.md`**. Adaptados: **TC-322** (cinco escenarios nuevos) y
**TC-533 (L4)** (`IND_SECS` de 35 a 40). Mutaciones: `scripts/_mut_pant10.py`, **36/36 muertas**.

## PANT-11 (2026-11-04) — el papel de Ebstein y Eisenmenger, la VCI, el eco pulmonar y las masas

| Caso | Qué fija |
|---|---|
| **TC-674** | El papel de Ebstein y de Eisenmenger sin los once marcadores, con la relación de áreas publicada igual, la mortalidad materna en «30 a 50 %» y el PPT generado de verdad |
| **TC-675** | El TDE y el TRIV intercambiados: clases, marcado, Tab y el papel que no se puede mover |
| **TC-676** | La casilla «(no se visualiza VCI)»: su área de 44 × 44, el vaciado con guardado, la PmAD por el camino mudo, el desmarcado y «Nuevo estudio» |
| **TC-677** | Las dos profundidades de coaptación: el gesto en los dos sentidos, la reconciliación idempotente y los dos cargados y distintos |
| **TC-678** | El derrame pleural por lado, la derivación a los dos legados, la sincronía con el posoperatorio con su guarda, y el dibujo de solo lectura |
| **TC-679** | Las masas en Otros como tercera sección hermana, la tabla de diferenciales, los dos globos y las dos fichas de Referencias |

Fichas en **`docs/mapa/tests-fichas-674.md`**. Adaptados: **TC-471** y **TC-500** (`VINFO` de 140 a
142), **TC-502** (las fichas de 36 a 38, el reparto de «Otros» de 12 a 14, el índice del buscador
de 34 a 36 y las tarjetas sin botón de 67 a 69), **TC-509** (los once campos partidos en TRES del
pericardio y NUEVE de masas, las TRES secciones de Otros y las 38 entradas) y **TC-535** (los
globos de 44 × 44, de 61 a 63). Mutaciones: `scripts/_mut_pant11.py`, **44/44 muertas**, con
**cuatro** condiciones nacidas de mutaciones que sobrevivieron al primer barrido.

## Tanda PANT-12 (2026-11-04) — el corazón maestro, parte 1

| Caso | Qué fija |
|---|---|
| **TC-680** | Las **tres guardas del reloj** del motor 3D, en los **dos** motores, y que el parámetro de la curva no salga de rango |
| **TC-681** | La casilla **«Vena cava superior izquierda persistente»**: un campo guardado, sin columna de Excel, su frase en el cuerpo del informe y **no** en el EN SUMA |
| **TC-682** | El **motor modular**: lienzo propio, la transposición en su sitio, las cinco anatomías, las nueve lesiones, Eisenmenger como modificador, las reglas de compatibilidad y las **tres listas paralelas** |
| **TC-683** | Los **dos modos**, la **tabla lateral** de 21 filas y el **globo** con sus tres vías de cierre |
| **TC-684** | Los **textos verificados** hoja por hoja contra las guías, y las dos frases que no pueden entrar a la app |
| **TC-685** | **«Según el estudio»**: once escenas con el gesto real, la dirección del cortocircuito, lo que se declara en vez de dibujarse, y que **sólo lee** |

Las fichas están en `docs/mapa/tests-fichas-680.md` (archivo propio: `tests-fichas.md` está a
menos de 1 KB del techo). El mapa de la tanda es `docs/mapa/pant12-corazon-maestro.md`.

## La tanda PANT-13 — «Explorar», la transposición dentro del corazón maestro, Masas y el pulmón (2026-11-04 y 05)

**Siete casos nuevos, uno por commit de código.** Los siete caen contra la base de la tanda
(`866482f`) por **124 condiciones y NINGUNA por excepción**.

| Caso | Qué fija |
|---|---|
| **TC-686** | El **lienzo sigue al ancho** de su recuadro en cada cuadro, así que las etiquetas no se despegan; y el texto visible del módulo y del diagrama del pulmón lleva sus **tildes** |
| **TC-687** | **«Explorar» en tres zonas** con sus dos listas y sin la tabla lateral; las combinaciones con **sigla** y nombre completo; los botones finos de 30 px con **área táctil de 44**; y el **esquema de circulación** con su inversión por Eisenmenger |
| **TC-688** | **«Incluir en el PDF» del corazón maestro**: apagado en «Explorar», sin nada cargado y con una transposición cargada; y el PDF lleva la versión **del estudio** aunque se esté explorando otra cosa |
| **TC-689** | La **transposición como SEXTA anatomía de base**, con sus cinco variantes, sus dos casillas, las reglas de la demo, la lectura de su pestaña, y el **recuadro de la pestaña que NO se retiró** |
| **TC-690** | La **tabla de diferenciales de Masas nace cerrada**, el globo queda **fuera** del botón, el contenido no se perdió, los tres textos quedaron neutros y en la sección **no queda** una frase que juzgue una guía |
| **TC-691** | El **broncograma aéreo en puntitos** recortados por la mancha y con el radio por orden de bronquio; y el **botón del PDF** del diagrama con su campo oculto, que se vacía con «Nuevo estudio» |
| **TC-692** | Las **siete variantes en grilla compacta** de una, dos o tres columnas, con el detalle que aparece sólo cuando hace falta, **sin borrar un valor** y **sin tocar** las notas de ASIA ni de la circunfleja |

Las fichas están en `docs/mapa/tests-fichas-686.md` (archivo propio: `tests-fichas.md` está a
menos de 1 KB del techo → `docs/PENDIENTES.md` → **P13-e**). El mapa de la tanda es
`docs/mapa/pant13-explorar-tga-masas.md`.

---

## PANT-14b (2026-11-05) — seis casos nuevos y nueve viejos adaptados

| caso | qué fija |
|---|---|
| **TC-699** | el módulo deriva su estado de las pestañas en vivo, no sobrevive a «Nuevo estudio», la línea no se contradice con el dibujo, la estenosis pulmonar sin nivel nombra su sección, y el botón y el panel viven sólo dentro de las congénitas |
| **TC-700** | el interruptor de presencia se enciende solo, el informe incluye la sección, el apagado a mano se respeta, y las tres marcas mueren con «Nuevo estudio» |
| **TC-701** | el slot del módulo queda fuera de las capturas y el esquema entra al PDF sólo con su botón abierto |
| **TC-702** | el esquema de la transposición sale del dueño único de la pestaña, el recuadro viejo está oculto, «Ver en 3D» existe, y el botón del PDF ya no se apaga con transposición —por sus DOS mitades— |
| **TC-703** | el túnel en violeta con sus dos rótulos, las partículas con su color y la leyenda condicional |
| **TC-704** | el anillo por debajo del origen de la aorta, orientado a la cámara y con prioridad de render, y ningún otro anillo la lleva |

Los seis **caen contra `4ebeee4` por 51 condiciones y ninguna por excepción**.

**Adaptados, con el motivo en el caso:** **TC-623** (bloques B, C, F e I — **INVERTIDO**, el día que
ese caso anunciaba), **TC-688** (bloque G — **INVERTIDO**; (D3) a los dos estados; gana (G4) que
quita lo que encendió), **TC-619** (A3 — **INVERTIDA** por una regla fija del proyecto), **TC-603**
(I8 — el color resuelto), **TC-562** (C3 — los dos rótulos), **TC-601** (B5/B6 — la fila pasa a tres
hijos), **TC-624** (D0 — el denominador exige que el globo se pueda TOCAR), y **TC-694**, que vuelve
a verde solo.

⚠️ **Tres defectos de mis propios casos, los tres de la primera corrida:** el cuerpo de un caso se
envuelve en una función **no async**, así que `await` tira; el contrato del runner es
`[descripción, BOOLEANO, diagnóstico]` y escribirlo como `[desc, valor, esperado]` hace que una
condición cuyo valor es **0** falle aunque sea correcta y que cualquier valor distinto de cero pase
sin comparar nada; y el acento grave dentro de un comentario, por decimoctava tanda seguida.

---

## PANT-14c (2026-11-05/06) — nueve casos nuevos y siete viejos adaptados

Las fichas, con sus denominadores y sus controles negativos, en
**`docs/mapa/tests-fichas-705.md`** (archivo propio: `tests-fichas.md` está en 34,2 KB).

| caso | commit | qué fija |
|---|---|---|
| **TC-705** | 1 | el 3D del PDF se recorta al contenido y se estampa con `CM_PDF_AR`; `cmPapelTexto` arma sus cuatro partes con textos que la app ya tiene, sin guía, sin clase, sin folio y sin conducta |
| **TC-706** | 1d | `cmSchSet` rasteriza el esquema al abrirlo, que es lo que cierra «abrí el esquema y el PDF no lo trajo» cuando el botón se toca primero |
| **TC-707** | 2 | el esquema del posoperatorio deja de emitirse con la casilla encendida y **sin datos**, y «Nuevo estudio» la apaga —es un `input hidden` que el barrido no alcanzaba— |
| **TC-708** | 3a/3b | los dos violetas se separan por luminancia y del azul por matiz; el switch auricular lleva las cavas en oscuro y las venas pulmonares en claro, y el Rastelli el túnel en oscuro y el conducto en claro |
| **TC-709** | 3d/3e | el anillo de la obstrucción se orienta con la **tangente** de la aorta y se ubica `CM_OBS_BAJO` por debajo de su origen; las dos suturas del Jatene dejan de ser anillos y pasan a bandas de malla |
| **TC-710** | 3c/3f/3g | la cava izquierda en celeste, el parche del Fallot operado en verde con la CIV residual en su **borde**, y la leyenda prendiendo sólo lo que está dibujado |
| **TC-711** | 4 | el título se dibuja en el recuadro y en la cabecera del esquema desde el **mismo** cálculo que el papel, y los dos textos chicos que repetían lo que el dibujo muestra ya no están |
| **TC-712** | 5 | la sección pierde su «Ver en 3D» propio y sus once campos pasan a cuatro grupos con encabezado, con la conclusión a todo el ancho y sin que un grupo sin campos visibles ocupe su columna |
| **TC-713** | 6 | al entrar a una pestaña de congénitas se cierran todas sus secciones, lo que se abre mientras se está en ella se queda, y `secAutoOpen` sigue funcionando en las otras pestañas |

**Los nueve caen contra `741d0cc` por 99 condiciones y NINGUNA por excepción**, verificado en un
worktree alternando sólo `index.html` con el mismo archivo de casos: 15, 2, 7, 14, 10, 18, 12, 14 y 7.

**Adaptados, con el motivo escrito en el caso:**

| caso | qué pasó |
|---|---|
| **TC-573** | el caso grande de la maqueta de esa pantalla. Caía **por excepción**; sus (A1), (C1), (C2), (C3), (D2), (D3), (D4), (F1b) y (F1c) pasan de la grilla única de dos columnas al reparto **por grupos**, y **(B1) queda con el orden nuevo** (ver abajo) |
| **TC-601** | (A1), (B2), (B4), (B5c), (B6) y (B7) — la maqueta de `#tga-fila`. **(B2) y (B4) INVERTIDAS**: la conclusión sale de la columna de campos y va a todo el ancho debajo. (B5b) **no se toca** |
| **TC-697** | (C4) **INVERTIDA** — el día que anunciaba: la frase «Todas las lesiones cargadas están dibujadas» se retira por repetir lo que el dibujo y su título ya muestran. Gana **(C4b)** |
| **TC-699** | (A2) **INVERTIDA**, misma causa. Gana **(A2b)** |
| **TC-702** | (B2) **INVERTIDA** — el botón propio se retira y queda el común. Gana **(B2b)**; (B3b) pasa a tocar el común. (B3) **no se toca**: `tgaVer3D` no se borró |
| **TC-703** | (B2) **adaptada** a un violeta por camino, (C1) a las **tres** variantes sin violeta con **(C1b)** y **(C1c)** para el Rastelli, y (C2) **INVERTIDA**: con el Rastelli la leyenda ahora **se enciende** |
| **TC-704** | (B1) y (B2) — el día que anunciaba. El anillo deja de estar 0,30 **vertical** y de frente a la cámara: hoy se mide la **distancia** siguiendo la tangente y que lleve su **normal** con radio no menor que el de la aorta |

⚠️ **CUATRO DEFECTOS DE MIS PROPIOS CASOS, los cuatro de la primera corrida, y los cuatro son
denominadores vacíos o anclas débiles.** (1) `pop_hora` **no existe** —es `pop_cx_horas`—, así que
el control del predicado de datos daba falso sobre un formulario que seguía vacío. (2) La clave de
la anomalía de Ebstein es **`cc-ebs`** y no `cc-ebstein`: sólo se abrían dos secciones y el
denominador no se cumplía. (3) **`showTab` está ENVUELTA DOS VECES** —el repintado de los botones
flotantes y el cajón lateral—, así que `String(showTab)` devuelve el envoltorio y **no contiene** ni
`secAutoOpen` ni `ccSeccionesCerrar`: las dos condiciones del orden daban falso sobre código
correcto, y se reemplazaron por **(B2)**, que mide el comportamiento —una sección con datos, que
`secAutoOpen` abriría, queda cerrada— y es más fuerte. (4) Buscar «Necesita conexi» en **todo** el
documento lo encuentra en la caja de aviso del exportador de PowerPoint: un **falso positivo**.

⚠️ **Y DIEZ LECTURAS A PELO QUE MATABAN EL CASO POR EXCEPCIÓN contra el árbol anterior**
—`TGA3D_C.violetClaro`, `CM_OBS_BAJO`, `CM_FAL_PARCHE`, `CM_FAL_PARCHE_R`, `CM_LEY`,
`cmTituloSync`, `cmLeyendaSync`, `cmTunelLeySync`, `cmColoresEscena`, `tgaGruposSync` y
`ccSeccionesCerrar`—. Es la lección de **TC-546**, y un caso que cae por excepción no dice **qué**
invariante se rompió: de 6 excepciones a **cero**, y de 24 condiciones rojas a **99**.
