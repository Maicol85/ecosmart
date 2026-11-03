# EcoSmart — registro de tandas

> **Un solo archivo, un bloque por tanda, para que otra herramienta lo lea.** Cada bloque trae el
> nombre de la tanda, su fecha, los códigos y títulos de sus commits, tres líneas de qué cambió y
> lo que quedó pendiente. Creado por la tanda **CONG-2A** (punto 5b).
>
> ⚠️ **NADA DE LO QUE HAY ACÁ SE INVENTÓ.** Los códigos, los títulos y las fechas salen de
> `git log`; el «qué cambió» y los pendientes, de las secciones de «Estado vigente» de
> `CLAUDE.md` y de `docs/PENDIENTES.md`. Lo que esas dos fuentes no dicen, acá no está.
> ⚠️ **Y NO REEMPLAZA A `CLAUDE.md`:** la bitácora de cada tanda —qué se midió, qué premisa
> resultó falsa, qué trampa se pagó— sigue en «Estado vigente» y en `docs/HISTORIAL_CLAUDE.md`.
> Esto es el índice.
>
> **Cómo se agrega un bloque:** al cerrar una tanda, se copia el molde de abajo con sus commits
> tal como los imprime `git log --format="%h|%ad|%s" --date=short --reverse`, y se escriben las
> tres líneas y los pendientes. El archivo va en orden cronológico, el más nuevo al final.

---

### Segunda mitad — commits 6 a 10 (2026-11-03)

| commit | qué |
|---|---|
| `ca412db` 6 | **MCA**: dos columnas de criterios del eco, tres de categorías, conclusión a la derecha, cuatro globos. La zona no ecocardiográfica a todo el ancho **por medición** |
| `eb8b794` 7 | **Fallot**: tres globos y conclusión a la derecha. La disposición en tres columnas **PARADA**; el recuadro que se contradecía, retirado |
| `6bb3e71` 8a | **Estenosis subaórtica**: los **DOS** cortes rotulados medio y pico, cada uno con guía, hoja, folio y condición |
| `11ccfe7` 8b | **Estenosis supravalvular**: ídem, con la salvedad de que la guía no publica recuadro propio |
| `27aa986` 9 | **Arritmia ventricular**: primera sección, «Limpiar», tarjeta, valor nuevo «Parada cardíaca recuperada», espejo condicional de MCH |
| `ae9d1b4` 9b | **El arreglo estructural**: la mudanza rompía las dos sub-pestañas y MCA cerraba un div de más |
| `9691de6` 10 | **PSAP, PmAP y PDAP** en 25 rótulos de pantalla |
| `6dff25f` 10b | los tres rótulos que el censo de origen no encontró y sí el caso |
| — 11 | cobertura y documentación |

**Lo que se midió:** A/B por commit contra el árbol anterior, **cero** diferencias de superficie
firmada en los commits 6, 7, 8a, 8b y 10, y en el 9 la **única** diferencia es la descripción del
valor nuevo. **33/33 mutaciones muertas.** Cinco casos nuevos, **TC-628 a TC-632**.

**Lo que quedó parado:** la disposición en tres columnas de Fallot (**P3-i**), y ocho cosas más
en `docs/PENDIENTES.md` → **P3-i** a **P3-p**.

## PANT-3 — los botones CIA y CIV, el esquema de la TGA, el corazón maestro, MCH, MCA, Fallot, las dos estenosis aórticas, la arritmia ventricular y los rótulos de presión (2026-11-02 y 03)

**Seis commits de los once de la orden.** Línea base al abrir: `origin/main` = `HEAD` =
**`efce508`**, sello `v20261102-2051`, md5 `8af4c80b`, pendrive `DISK_IMG` montado.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

| commit | qué | estado |
|---|---|---|
| `5504f6d` | **1** — los botones CIA y CIV marcan la lesión y la llevan al informe | cerrado y verificado |
| `bc363f6` | **2** — los rótulos del esquema de la TGA y su ⓘ sin el cartel | cerrado y verificado |
| `eeb3ccf` | **3** — el censo de los carteles de «revisión pendiente» y lo que se retiró | cerrado y verificado |
| `75b555f` | **4** — el botón «3D» del corazón maestro, fase 1 | cerrado y verificado |
| `15098a5` | **5** — la pantalla de MCH en tres columnas | cerrado y verificado |
| el de cierre | **11** — cobertura y documentación | cerrado |

**Los commits 6 a 10 NO se hicieron y ninguno quedó a medias**: MCA, Fallot, las dos estenosis
aórticas, la arritmia ventricular y los rótulos de las presiones pulmonares. Declarado en
`docs/PENDIENTES.md` → **P3-h**, con el estado exacto en `docs/CONTINUACION_PANT3.md`.

**Lo que más pesó, en una línea cada uno:**
- el botón «CIA» no significaba nada y `showTab` lo desmarcaba al cambiar de pantalla, porque
  barre `.active` de todo `.tab-btn`; hoy es un dato del estudio que viaja con él;
- los rótulos del esquema: **61 cruces desnudos y 14 rótulos pisados → 0 y 0**;
- el censo de «revisión pendiente» encontró **una sola** frase visible, y se reescribió en vez de
  borrarse porque su mitad informativa evita un error;
- el corazón maestro **no dibuja nada nuevo**: presta el recuadro que ya existía;
- la pantalla de MCH pasa de **1287 a 939 px** a 1440, con el censo de ids intacto.

**Dos fuentes leídas en imagen**, con su regla de folio comprobada en el pie impreso: ESC 2022
(Zeppenfeld), hoja 66 → folio 4062; y AHA/ACC 2024 (Ommen), hojas 9 → e1247 y 29 → e1267.

**Campos guardados: 1002 → 1004**, los dos autorizados. **Excel 441** columnas con las mismas
claves. **Semgrep 124 WARNING / 0 ERROR.** **Celular 59 a 360 px y 68 a 390, con 17 ALTA.**

## TANDA NOCTURNA, Parte A — «A» · 2026-10-30

- `427aa06` A1: el esquema de la orejuela al lado de los campos, y los dos rotulos que se pisaban
- `6b589b6` A2: el esquema se mueve con el latido, y el cuadro que el medico elige gana
- `42c4ccb` A3: el globo de «Orejuela izquierda» se reescribe con otro enfoque
- `b9f824d` A4: borrar un estudio se lleva tambien sus videos y sus cineloops (cierra IMG-a)
- `08dd2e9` A3-b: la tarjeta de un globo deja de poder ser mas alta que la pantalla
- `4e47037` A5: TC-551, las catorce mutaciones, la documentacion y el sello de la Parte A

**Qué cambió.** El esquema de la orejuela pasó a estar al lado de los campos y dejó de pisar sus
propios rótulos; gana el cuadro que el médico elige y se anima con el latido. Borrar un estudio
recoge además sus videos y sus cineloops, que no tenían recolector. Y una tarjeta de ⓘ ya no
puede ser más alta que la pantalla.

**Pendiente.** `NOC-A-a` a `NOC-A-h` — entre ellos, el chorro de insuficiencia es central siempre
porque el velo afectado no existe en la app, y dos fuentes que la orden nombraba y no están en la
biblioteca.

---

## TANDA NOCTURNA, Parte B — «B» · 2026-10-30

- `9e70ba6` B1: el TRIV del VD tambien en las referencias de VD/AD, como dato de referencia
- `779902a` B2: el indice de tamanio aortico se calcula solo, y el iDA se publica con un decimal
- `9d422ca` B3: la aortopatia hereditaria publica el sindrome, el diametro y «dilatada», y nada mas
- `9c479cc` B5: TC-552, las catorce mutaciones, la documentacion y el sello de la Parte B

**Qué cambió.** El índice de tamaño aórtico se calcula solo y sólo se publica en Turner. El
informe firmado de una aortopatía hereditaria dejó de llevar la recomendación con su clase, su
nivel, su tabla y su folio: de cinco escenas que publicaban una clase a cero en diez.

**Pendiente.** `NOC-B-a` a `NOC-B-g`. El commit **B4 no se hizo**: son dos cambios clínicos sobre
el papel firmado —cortes nuevos por sexo para la unión sinotubular y la ascendente— y empezarlo
sin poder cerrarlo habría dejado un cambio clínico a medias.

---

## TANDA CORRECCIONES — «COR» · 2026-10-30

- `1853085` COR-1: el informe de la orejuela publica las medidas y ningun veredicto de aptitud
- `48461eb` COR-2: un solo corte de 75 ms para el TRIV, y la frase de elementos a favor de HTP en tres formas
- `03e8919` COR-3: la grilla de VD/AD en tres columnas de seis, simetrica y sin huecos
- `b9493e8` COR-4: la raiz cargada en AI/VI se VE en la pantalla de Marfan, y Turner dice que le falta
- `37f2bf2` COR-5: «Incluir en el PDF» funciona siempre, es un interruptor y es independiente de Config
- `67c6f7d` COR-6: el esquema de la orejuela portado de la demo, sin reinterpretar
- `ac5d1b4` COR-7: TC-553, las veinticuatro mutaciones, la documentacion y el sello

**Qué cambió.** El informe firmado dejó de declarar a un paciente «no apto para cierre
percutáneo». El TRIV quedó con un corte único de 75 ms y un dueño único de la frase de elementos
a favor de hipertensión pulmonar. Y «Incluir en el PDF» de la orejuela, que no incluía nada
—cero imágenes con Config prendido y apagado—, pasa a poner el esquema como slot.

**Pendiente.** `COR-a` a `COR-g`. Dos frases de conducta quedan reportadas y sin tocar, y el
cuadro de referencias de VD/AD no se reordenó.

---

## TANDA AJUSTES-1 — «AJ1» · 2026-10-30

- `612dd82` AJ1-1: la orejuela sin recomendaciones ni ruido
- `05569e8` AJ1-2: el PDF sin repetir la orejuela, y la VAB con su resumen al costado
- `cc6e0fd` AJ1-3: el EN SUMA nombra la valvula aortica bicuspide
- `3f6e436` AJ1-4: la frase del gradiente, con su fuente leida en imagen
- `ed321eb` AJ1-5: la fila de miniaturas de lo que va al PDF
- `ad0067f` AJ1-6: TC-554, las catorce mutaciones, la documentacion y el sello

**Qué cambió.** Con una bicúspide cargada y nada más, el EN SUMA decía «Estudio sin alteraciones
estructurales ni funcionales significativas»: hoy la nombra. El PDF dejó de repetir la orejuela y
la fila de miniaturas muestra lo que va al papel, con su ✕ para quitarlo.

**Pendiente.** `AJ1-a` a `AJ1-g`. El orden de los diagramas en la fila se paró: reordenarlos
exige inventar y persistir un orden, o sea un campo guardado nuevo.

---

## TANDA AORTA-2 — «AO2» · 2026-10-30

- `13a7e58` AO2-1: los otros segmentos de la Figura 5 — la union sinotubular y la aorta ascendente por sexo
- `fa7c865` AO2-2: la bicuspide y la coartacion — el EN SUMA, los tres textos de pantalla y los umbrales
- `2e61d47` AO2-3: la Evidencia de la bicuspide con la Tabla 68 y sus nueve factores en tres estados
- `5cc2a36` AO2-4: TC-555, las catorce mutaciones, los trece casos adaptados y la documentacion

**Qué cambió.** Una unión sinotubular de 34 mm en una mujer salía «Aorta torácica de calibre
normal» en el informe firmado: hoy los dos segmentos se gradúan por sexo con los valores de la
Figura 5. Las seis casillas de factores de riesgo de la bicúspide salieron de la pantalla y sus
nueve factores pasaron a tres estados en la Evidencia.

**Pendiente.** `AO2-a` a `AO2-g`. La línea integrada del EN SUMA de la coartación y
`coaConclusion().txt` siguen publicando clase y folio.

---

## TANDA D2 — «D2» · 2026-10-30

- `1866fd2` D2-1: la calculadora no clasifica sin farmaco elegido
- `f973566` D2-2: las seis columnas de la Tabla 4 — anti-VEGF, BCR-ABL, mieloma y RAF/MEK
- `1c03919` D2-3: las tablas A y C de HFA-ICOS se dibujan desde el dueno que clasifica (D-c)
- `8c198a8` D2-4: el monitoreo de inmunoterapia y de anti-VEGF (D-g)
- `420a67b` D2-5: TC-556, las quince mutaciones, los catorce casos adaptados y la documentacion

**Qué cambió.** Con el selector de fármaco vacío la calculadora de riesgo cardiovascular
clasificaba igual, y el informe firmado publicaba «riesgo alto» sobre un paciente sin tratamiento
elegido. Las seis columnas de la Tabla 4 entraron enteras y las tablas A y C dejaron de
contradecir al dueño que clasifica.

**Pendiente.** `D2-a` a `D2-g`. La tabla B no se tocó: agrupar fármacos en bandas no tiene
equivalente en la Tabla 4.

---

## TANDA AJUSTES-2 — «AJ2» · 2026-10-30 y 31

- `ed6ab4d` AJ2-1: la coartacion en el papel, sin recomendaciones y sin guias
- `3e40fbb` AJ2-2: todo diagrama incluido se guarda con el estudio y aparece en Guardados
- `8376605` AJ2-3: la orejuela que «a veces queda y a veces no» en el PDF — determinista
- `26e7dd3` AJ2-4: el ⓘ de la fila de miniaturas y «Manga de viento» sin riesgo
- `93cc85c` AJ2-5: el ⓘ del TRIV en VD/AD y en el Doppler tricuspide
- `aff0b87` AJ2-6: el barrido del papel — las DOS conductas que quedaban
- `07ffe05` AJ2-7: TC-557, las dieciocho mutaciones, los siete casos adaptados y la documentacion

**Qué cambió.** El informe firmado de una coartación mandaba a medir el gradiente pico-pico
invasivo y citaba la guía con su figura y su folio: hoy describe. Con Config prendido y cuatro
diagramas incluidos, el estudio guardado quedaba con cero imágenes y cero esquemas. Y el barrido
de las cuatro superficies encontró cinco menciones de conducta, de las que se retiraron dos.

**Pendiente.** `AJ2-a` a `AJ2-g`. `congenitas-otros.md` quedó a 500 bytes del techo y la
coartación vive ahí.

---

## TANDA IMÁGENES-3 — «IMG3» · 2026-10-31

- `f6e3197` IMG3-1: el visor de «Imagenes guardadas» reproduce el video en bucle y se agranda
- `69c9bff` IMG3-2: el PPT con video — el cuadro fijo, el aviso de 100 MB y el de privacidad
- `92ba745` IMG3-3: el motor de tercios de las hojas de diagramas del PDF
- `d172624` IMG3-4: la linea de texto de cada diagrama
- `822a261` IMG3-5: la CIA debajo de su texto (R-4) y las capturas al final (R-5)
- `197df0d` IMG3-6: la comparacion con la demo aprobada y la cobertura de la Parte B
- `6c8dc0f` IMG3-7: la capsula de la coartacion en la app, sin guia ni conducta
- `2ea773e` IMG3-8: las dos citas que quedaban en el papel
- `0eecc32` IMG3-9: el PPT de congenitas sin guia, sin clase y sin conducta
- `c5dc409` IMG3-10: cobertura y documentacion de toda la tanda; la PARTE D declarada y no hecha

**Qué cambió.** El estudio de prueba del médico pasa de cinco hojas de PDF a tres y sus diagramas
de cinco hojas a una, con un motor de tercios declarativo que no corta ningún dibujo por
construcción. El visor reproduce el video en bucle. Y el PPT de congénitas poda la guía, la clase
y la conducta, con una regla de todo o nada.

**Pendiente.** `IMG3-a` a `IMG3-j`. La **PARTE D** —el diagrama 3D de la transposición— no se
hizo: su inventario sí, y decidió que sólo dos de los seis escenarios de la demo eran alcanzables
con los datos que la app tenía.

---

## TANDA TGA — «TGA» · 2026-10-31

- `b85f3ea` TGA-1: la cirugia realizada y el valor de anatomia d-TGA
- `0c1337d` TGA-2: el diagrama 3D de la transposicion, portado de la demo aprobada
- `7f6540b` TGA-3: la cirugia realizada en el informe y en el EN SUMA
- `61f6968` TGA-4: cobertura, documentacion, la PARTE B parada y el experimento del bucle

**Qué cambió.** El diagrama 3D de la transposición entró portado de la demo aprobada, con
three.js r128 cargada sólo al abrir la sección y con su hash SRI verificado por dos caminos. Se
agregó UN campo guardado —la cirugía realizada— y un valor nuevo de anatomía, d-TGA. La
comparación con la demo dio 20 de 20 escenarios alcanzables idénticos.

**Pendiente.** `TGA-a` a `TGA-h`. Jatene y Rastelli quedaron parados porque el informe firmado
afirmaba que el ventrículo derecho es el sistémico. La **PARTE B** —retirar del PPT la
recomendación de desfibrilador de la miocardiopatía hipertrófica— se paró porque su fuente no
estaba en la Evidencia.

---

## TANDA TGA-2 — «T2» · 2026-10-31

- `5d0d942` T2-1: Jatene y Rastelli habilitados, con el papel describiendo y no interpretando
- `1f60647` T2-2: la Evidencia de la transposicion, con sus preguntas en tres estados
- `4018b24` T2-3: la Evidencia de la comunicacion interauricular, con sus nueve preguntas
- `d902f59` T2-4: la Evidencia de la comunicacion interventricular, con sus siete preguntas
- `d6ddb02` T2-5: la Tabla 23 de la ESC 2023 entra en la Evidencia; la poda del PPT sigue PARADA
- `7fde2ff` T2-6: cobertura, documentacion, el sello y lo que quedo PARADO
- `8d37a65` T2-6b: el recuento de preguntas del panel era 26 y son 38

**Qué cambió.** Jatene y Rastelli se publican: la decisión del médico lo resolvió por el lado del
texto —con esas dos cirugías el papel describe y no interpreta— y no del campo. Cuatro secciones
del panel de Evidencia pasaron a preguntar, con 38 preguntas de tres estados. La comparación con
la demo pasó de 20 a 30 de 30.

**Pendiente.** `TGA2-a` a `TGA2-h`. Tres campos quedan parados porque su redacción nombra el
ventrículo o la válvula sistémico. La **Parte C** se hizo a medias: la AHA/ACC 2020 que el PPT
cita no está en la biblioteca.

---

## TANDA AJUSTES-3 — «AJ3» · 2026-10-31

- `bcc333b` AJ3-1: el bucle del video entra en los DOS caminos de PPT
- `37fe3ab` AJ3-2: los botones de respuesta de la Evidencia, a 44 px tambien con mouse
- `d851260` AJ3-3: la clausula de la IT sistemica de la TGA vuelve, en el ⓘ de su seccion
- `eaea958` AJ3-4: la miocardiopatia hipertrofica del PPT describe, y la AHA/ACC 2024 entra en la Evidencia
- `ddb3fa5` AJ3-5: se parten los dos mapas que estaban al techo
- `bae00b8` AJ3-6: cobertura, documentacion, el sello y lo que quedo PARADO

**Qué cambió.** El bucle del video entró en los dos caminos de PPT, con validación estricta y
falla cerrada: si una diapositiva no valida, ninguna se escribe. Los botones de respuesta del
panel pasaron a 44 px también con mouse, lo que cerró cinco solapes reales. Y la línea de la
miocardiopatía hipertrófica del PPT describe, con la AHA/ACC 2024 leída en imagen cargada en la
Evidencia.

**Pendiente.** `AJ3-a` a `AJ3-g`. La etiqueta «AHA/ACC 2020» seguía en el informe, el EN SUMA y
el PDF, y el cuerpo que el PPT proyecta seguía nombrando guías.

---

## TANDA CONG-2A — «CONG-2A» · 2026-10-31 y 2026-11-01

- `655ffc2` CONG-2A-1: la morfologia aortica es el quinto origen de la seccion de la VAB
- `1f8d30b` CONG-2A-2: la pantalla de la TGA, campos a la izquierda y dibujo a la derecha
- `30714c9` CONG-2A-3: el 3D dentro de su recuadro, corazon normal por defecto y las comunicaciones de sus pestanas
- `ce1a6a6` CONG-2A-4: los cuatro dibujos de los criterios TEER, a la derecha de su campo
- `4894cee` CONG-2A-5a: el papel de la miocardiopatia hipertrofica describe, sin guias ni conducta
- `07b695c` CONG-2A-5b: las dos reglas fijas en CLAUDE.md y el registro de tandas
- CONG-2A-6: cobertura, documentacion, el sello y lo que quedo PARADO

**Qué cambió.** La matriz de «desmarcar» barrió los 105 selectores con opción vacía de las
diecinueve secciones de congénitas y encontró uno solo que sobrevive, en la válvula bicúspide, con
su causa en la morfología aórtica de Válvulas. La pantalla de la TGA quedó con los campos a la
izquierda y el dibujo a la derecha, el 3D dentro de su recuadro y con el corazón normal por
omisión, y los cuatro dibujos de los criterios TEER pasaron a la derecha de su campo. Y el papel
de la miocardiopatía hipertrófica dejó de nombrar guías, clases y la recomendación del
desfibrilador.

**Pendiente.** Ver el bloque de esta tanda en `docs/PENDIENTES.md`.

---

## TANDA POP-A — «POP-A» · 2026-11-01

- `162aa9d` POP-A-1: las tres columnas independientes del posoperatorio y sus rotulos
- `49864a0` POP-A-2: un solo campo «Elegir farmaco» y el azul de metileno
- `3561bf9` POP-A-3: asistencia, monitoreo en columnas y los datos hemodinamicos
- `67038f5` POP-A-4: cirugias combinables, valvulas operadas y drenajes
- `d1bd8ad` POP-A-5: una sola tarjeta «Eco y POCUS», con el derrame pericardico por su dueno
- `bc1ad49` POP-A-6: la disposicion de abajo, con el dibujo identico a HEAD
- POP-A-7: cobertura, documentacion, el sello y lo que quedo PARADO

**Qué cambió.** La pestaña de posoperatorio pasó de una pila de seis tarjetas —2096 px a 1440 px
y 2857 a 1000, medido— a **tres columnas independientes**, cada una su propio contenedor flex, con
el corte sobre la ventana en 900 px. El monitoreo dejó de ser un acordeón y es una tarjeta fija
con el Swan en tres columnas agrupadas y el PiCCO en dos. Las once casillas de fármacos pasaron a
**un panel absoluto** que se abre desde un botón único y no empuja nada, con el **azul de
metileno** como fármaco nuevo: sin unidad, sin fórmula por peso, fuera del patrón y fuera del
dibujo. «Tipo de cirugía» pasó a **cuatro casillas combinables** con el estudio viejo que se lee y
no se reescribe, más las cuatro válvulas operadas con su tipo tomado de Válvulas y los tres
drenajes. El eco y el POCUS quedaron en una sola tarjeta, el derrame pericárdico ganó una segunda
puerta a su dueño, y abajo el dibujo quedó a media pantalla con las características y la
conclusión a su derecha.

**El dibujo del esquema no se tocó**, y está verificado nodo por nodo contra `47ff639`: 77 nodos,
firma del SVG idéntica, `viewBox` idéntico. Eso es la tanda POP-B.

**Dieciocho campos guardados nuevos**, todos de la lista autorizada, y **Excel 441 → 441**.

**Pendiente.** Ver el bloque de esta tanda en `docs/PENDIENTES.md` → **PA-a** a **PA-i**.

---

## POP-B — arreglos de POP-A y la primera mitad del dibujo del posoperatorio (2026-11-01)

- `dbdc5bf` POP-B-1: el boton «Integrar al informe» del posoperatorio ya dice por que no puede
- `a7662ba` POP-B-2: el tipo de una valvula operada son SOLO las protesis, y el papel no dice una nativa
- `423eb8a` POP-B-3: el conteo de farmacos cuenta las filas, no las casillas mas la asistencia
- `1469c7b` POP-B-4: Pleura y pulmon a ancho completo, y el eco con el VD al lado
- `7bd3e14` POP-B-5: el inventario del dibujo, los textos sin superponerse y el derrame pleural dibujado
- `5b43c4a` POP-B-6: el puente, la malla de la aorta y los tres drenajes
- `a0850ca` POP-B-7: las cuatro valvulas operadas con su tipo y su latido
- POP-B-8: cobertura, documentacion, el sello y lo que quedo PARADO

**Qué cambió.** El botón «Integrar al informe» del posoperatorio **conserva el `title` que dice
por qué no puede integrar** —`_amiloAvisoPintar` se lo borraba 220 ms después, en los ocho árboles
medidos—. El tipo de una válvula operada ofrece **sólo las prótesis** que su dueño tiene, con una
morfología nativa queda en «elegir tipo» y lo **avisa** nombrándola, y el **papel ya no describe
la cirugía con una morfología nativa**. El contador de fármacos cuenta **las filas** y no las
casillas más la asistencia. «Pleura y pulmón» salió a una tarjeta de **ancho completo** debajo de
las tres columnas y la ecocardiografía quedó al lado del ventrículo derecho: la columna más alta
bajó de **1228 a 647 px**.

**Y el dibujo ganó cuatro capas.** El derrame pleural pasó de una elipse igual para los tres
grados a un **nivel de líquido** que sube con el grado, recortado con la misma ruta que dibuja el
pulmón. Entraron el **puente aortocoronario**, la **malla del injerto de aorta**, los **tres
drenajes** y las **cuatro válvulas operadas** con su tipo —mecánica, biológica o anillo punteado
sin tipo— latiendo con la **frecuencia cargada**, la aórtica y la pulmonar en sístole y la mitral
y la tricúspide en diástole. Y los **tres textos que se superponían** dejaron de hacerlo: cero
superposiciones y cero textos fuera del lienzo en treinta escenas.

**Ningún campo guardado nuevo, ningún id cambiado y Excel en 441 columnas.** El papel sólo se
mueve donde la orden lo autoriza: una válvula operada con morfología nativa pasa de
«tricúspide — Mixomatosa» a «tricúspide — sin tipo consignado».

**Pendiente.** Ver el bloque de esta tanda en `docs/PENDIENTES.md` → **POPB-a** a **POPB-g**.

---

## MARFAN-1 — la tarjeta de criterios con el artículo original (2026-11-01)

**Siete commits.** `8d95df3` (1, el score del Box 2 y los diecinueve campos) · `31ee701` (2, las
siete reglas del Box 1) · `b032969` (3, el papel describe los rasgos) · `7d39fb9` (4, la pantalla
y el globo de «Conducta aórtica») · `b98ae7a` (5, un globo por rasgo) · `aeeae9e` (6, la figura
que se transforma) · el de cobertura y documentación.

Al empezar, `origin/main` = `HEAD` = **`27a917d`**, el cierre de POP-B, ya publicado, con sello
`v20261101-0834` y md5 `b6e61443`. **El push lo corre Maicol.**

**Qué hizo:** corrigió la tarjeta de criterios de Marfan con el artículo original (Loeys 2010),
leído en imagen; convirtió sus rasgos en diecinueve campos del estudio; implementó las siete
reglas del Box 1 sólo en pantalla; hizo que el papel describa los rasgos sin la regla; reordenó
la pantalla; agregó veintiún globos con la definición del artículo; y portó la figura que se
transforma desde la demo del médico.

**Qué dejó pendiente:** `MF1-a` a `MF1-h` en `docs/PENDIENTES.md` — el Z que no es campo
guardado, las reglas 3 y 6 con el formulario vacío, las otras cinco categorías del artículo, el
lado del neumotórax, lo que la figura todavía no tiene, la Evidencia de aortopatías, los dos
mapas al techo y la segunda mitad del caveat.

**Dónde está todo:** `docs/mapa/marfan1-ghent.md` (mapa nuevo, 11,1 KB) y
`docs/mapa/tests-fichas-586.md` (fichas, archivo propio).

---

## MARFAN-2 — la pantalla de Marfan, su tarjeta y el Z de la raíz (2026-11-02)

**Cinco commits.** `23212e2` (1, la sección en columnas) · `b626253` (2, la tarjeta en una sola
pantalla) · `92b1cda` (3, la conclusión sin indicaciones) · `0d2217d` (4, el Z) · el de cobertura
y documentación. Al empezar, `origin/main` = `HEAD` = **`40fb624`**, el cierre de MARFAN-1, ya
publicado, con md5 de `index.html` **`05086dab`** y el pendrive `DISK_IMG` montado.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

**Qué hizo:**
1. La sección en dos columnas —síndrome y factores a la izquierda, los dos diámetros a la
   derecha— y el texto largo de la guía al globo de la sección.
2. La tarjeta de criterios **de 1307 px con 538 de scroll interno a 826 sin ninguno**, en tres
   bandas con la figura a la derecha; los globos **de veintiuno a cuatro**, con el glifo estándar
   de la app, sin perder una sola de las diecinueve definiciones; los selectores sin texto
   cortado y el puntaje de la **opción elegida**; las reglas en una línea.
3. La conclusión en **cuatro filas ordenadas** y la pastilla diciendo si **cumple** o **no cumple**
   los criterios en vez de indicar una cirugía — ampliación de la regla fija: la pantalla tampoco
   da indicaciones.
4. El **Z de la raíz** como campo guardado que viaja con el estudio, con las reglas 1, 2, 3 y 7
   leyéndolo también sobre un estudio archivado.

**Qué PARÓ y por qué:** el **Z calculado**, porque el artículo de Devereux 2012 **no está en la
biblioteca** —censado por contenido sobre los 245 PDF, con control positivo—, y porque lo que el
Loeys cita para ese método es su referencia 13 (Roman 1989), que tampoco está. Y la **nota del
Laboratorio**, que quedó vencida pero está fuera del alcance de la orden.

**Qué dejó pendiente:** `MF2-a` a `MF2-h` en `docs/PENDIENTES.md`.

**Dónde está todo:** `docs/mapa/marfan2-pantalla-z.md` (mapa nuevo, 12,4 KB) y
`docs/mapa/tests-fichas-591.md` (fichas, archivo propio).

---

## POP-C — el posoperatorio terminado, Marfan y el dibujo al PDF · 2026-11-02

**Commits** (`git log --format="%h|%ad|%s" --date=short --reverse`):

```
4593686|2026-11-01|POP-C-1: el selector del tipo de valvula operada sigue a Valvulas
afdd4da|2026-11-01|POP-C-2: la linea de Marfan dice solo lo positivo, y el Z de la raiz se calcula
7356d94|2026-11-01|POP-C-3: la hemodinamica del posoperatorio con el consenso de shock
20b164a|2026-11-01|POP-C-4: integrar con cualquier dato, y los tres avisos que salian sin color
e14e17a|2026-11-01|POP-C-5: las valvulas del dibujo son las de la demo v9, con su latido
e2a794b|2026-11-01|POP-C-6: los chorros de insuficiencia, sincronizados con su valvula
3093691|2026-11-01|POP-C-7: los cateteres del Swan y del PiCCO en el dibujo
8f50dc6|2026-11-01|POP-C-8: las cavidades siguen al dato medido, y el anillo del derrame al tamano
4fe6947|2026-11-01|POP-C-9: los trazados de TAPSE y de E/A dentro de las cavidades
1e3514e|2026-11-01|POP-C-10: el esquema del posoperatorio entra al PDF
```
(más el commit 11, de cobertura y documentación.)

**Qué hizo:**
1. **El selector del tipo de válvula operada** sigue a Válvulas: el sentido Válvulas →
   posoperatorio **no funcionaba en ninguna de las cuatro** —ni al poner la prótesis, ni al
   cambiarla, ni al sacarla— porque `popCxVSync` tenía un solo llamador, `popSync`, que el
   barrido de espejos excluye a propósito.
2. **La línea de Marfan** escribe sólo lo positivo, y **el Z de la raíz se calcula** con la
   ecuación de Devereux 2012, leída en imagen: cierra **MF2-a**. El manual siempre gana, el
   calculado no se guarda y no llega al papel.
3. **La hemodinámica del posoperatorio** con el consenso de la SAC 2024: el corte de bajo gasto
   pasa a estricto —sólo en el posoperatorio, declarando la divergencia con Hemodinámica—, la
   precarga muestra su valor sin banda ni veredicto, el pericardio lista sus signos y los dos
   rótulos nombran de dónde vienen el patrón y los cortes del VD.
4. **«Integrar al informe» con cualquier dato** (cierra **POPB-a**) y los **tres avisos globales**
   que salían sin color (cierra **POPB-h**): el anillo del botón **no se dibujaba en absoluto**.
5. **El dibujo**: las válvulas de la demo v9 con su apertura rotatoria, los chorros de
   insuficiencia sincronizados con la fase contraria a su válvula, los catéteres del Swan y del
   PiCCO, las cavidades siguiendo al dato medido, el anillo del derrame creciendo con el tamaño
   (cierra **POPB-d**) y los trazados de TAPSE y de E/A.
6. **El esquema entra al PDF** con su casilla, su epígrafe fijo y su fila en el registro de
   diagramas (cierra **POPB-e**).

**Qué PARÓ y por qué:** el **corte de 21 mm del pericardio**, porque no existe —`DPT_VCI_PLETORA_MM`
ya vale 20 y los únicos 21 mm son de la probabilidad de HTP, que es otra guía y otro módulo—.

**Qué dejó pendiente:** `POPC-a` a `POPC-j` en `docs/PENDIENTES.md`.

**Dónde está todo:** `docs/mapa/popc-posoperatorio-marfan.md` (mapa nuevo, 17,2 KB) y
`docs/mapa/tests-fichas-595.md` (fichas, archivo propio).

---

## TANDA TGA-3 (2026-11-01) — la conclusión a la izquierda, el papel sin conductas y el esquema de circulación

**Commits:** `d2261f4` (1) · `d2cb912` (2) · `91ae620` (3) · `1c9eb6d` (4) · `60aebc3` (5) · el de
cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`96b7ff0`**, el cierre de POP-C,
ya publicado, con md5 de `index.html` **`747b6597`** y sello `v20261101-2008`. **El push lo corre
el médico: esta tanda tenía orden expresa de NO pushear.**

**Qué hizo:**

1. **La conclusión de la TGA pasa a la columna izquierda** (pedido del médico), al hueco que la
   maqueta de CONG-2A dejaba vacío bajo los campos: medido, **368 px de alto por 549 de ancho a
   1440 px** y 475 × 358 a 1000. Su contenido **no cambia** —214 caracteres en los dos árboles— y
   `#tga-fila` sigue con **dos** hijos, así que la maqueta de 900 px no se mueve.
2. **La conducta de la TGA sale del papel.** Medido en HEAD con la sección integrada:
   «seguimiento anual» salía **una** vez en el informe en cada uno de los **tres** estilos, **tres**
   veces en cada una de las **seis** plantillas del PDF y **una** en el PPT; y la rama de la
   insuficiencia tricuspídea llevaba **«(ESC 2020)»** al informe firmado. Censo de once marcadores
   por las once superficies: **381 → 0**. `tgaConclusion` gana la salida `papel`, derivada de la
   **misma** lista de partes, así que las dos salidas no pueden divergir.
3. **El esquema de circulación de la sangre**, dentro del recuadro del 3D y al lado del 3D: cuatro
   cavidades, pulmones arriba, cuerpo abajo, las dos válvulas y las comunicaciones en naranja,
   **sin selector** —lee los mismos dueños que el 3D— y **solo lectura**.
4. **Las tres cirugías** (switch auricular, Jatene, Rastelli) con su **control clínico hecho antes
   de dibujar** contra `TGA3D_CIRC`, que es de la app y no la prosa de la demo. Los seis
   recorridos **coinciden**, así que ninguno quedó parado.
5. **La TGA corregida**, el **ⓘ** del esquema y dos detalles que pidió la verificación: la rama
   `descriptivo` también devuelve `papel` —y eso **cierra una regresión del commit 2**, que había
   dejado la diapositiva de Jatene y Rastelli sin su fila de conclusión— y la tipografía mínima
   del SVG sube de 11 a 12 en el `viewBox`.

**Qué NO se movió:** ni un corte, ni un umbral, ni una clase, ni un folio. **Cero campos guardados
nuevos**, Excel en **441** columnas con las mismas claves, censo de campos idéntico, Semgrep **124
WARNING / 0 ERROR** y celular **59 / 68 con 17 ALTA**, la línea base exacta.

**Qué se declaró con su medición en vez de decidirlo:** el corte de la maqueta en **1200 px** y no
en 900 —al lado, a 1000 px el 3D quedaría en **126 px**, inservible—; el `resumen` que ya no lee
ninguna superficie; el esquema fuera del PDF; la diapositiva del PPT sin condición en la suite; la
conducta que sigue en la **pantalla** porque la orden lo pide por los dos lados; y las dos
conductas que la Evidencia no respalda.

**Qué dejó pendiente:** `T3-a` a `T3-g` en `docs/PENDIENTES.md`.

**Dónde está todo:** `docs/mapa/tga3-esquema-circulacion.md` (mapa nuevo, 16,7 KB) y
`docs/mapa/tests-fichas-601.md` (fichas, archivo propio).

---

## VAL-PPT (2026-11-02) — las opciones de plastia, TEER y TAVI, los retoques y el PPT

**Commits.** DOCE. `9da2a0e` (1) · `7f25750` (2) · `76a458a` (3) · `84e5196` (4) · `71d76a6`
(5a) · `1aa31be` (6) · `84f1941` (7) · `a0e8dd6` (8) · `2073e3e`, `aa43ecc`, `67a71b9` y
`7bd0b6a`, los cuatro de cobertura y documentación.
Sello **`v20261102-0107`**, md5 de `index.html` **`738944d2`**.
Al empezar, `origin/main` = `HEAD` = **`5ae3959`**, el cierre de TGA-3, ya publicado, con md5
**`7ff2a3f2`** y el pendrive `DISK_IMG` montado. **El push lo corre Maicol.**

**Qué hizo.**
1. Cuatro opciones nuevas —plastia y TEER en la mitral y en la tricúspide— como **valores** de
   los campos de morfología que ya existían, en sus **tres listas paralelas**, y el selector del
   posoperatorio ampliado a TAVI, plastia y TEER por construcción.
2. Los tres globos de Válvulas con lo que la fuente dice de cada tipo **y lo que no define**.
   Ningún corte nuevo.
3. El papel describe los tipos nuevos, y el EN SUMA deja de negar una mitral intervenida que es
   el único hallazgo.
4. Los tres símbolos del dibujo del posoperatorio, portados de la demo v9.
5. Las tres etiquetas del TEER salen del papel y se quedan en la pantalla.
6. El rótulo de la miocardiopatía hipertrófica pasa a 2024, verificado en imagen.
7. La disposición del PPT elige la de mayor área sin deformar, y el número pasa a ser opcional.
8. La diapositiva inicial, la final y el diseño de fondo elegible.

**Qué se paró y se reportó.** El commit 5b entero (cuatro conductas de la TGA sin respaldo en la
Evidencia), el 6a (su premisa no se reproduce), el Laboratorio y «TAVI de cambio».

**Cobertura.** Cuatro casos nuevos, TC-605 a TC-608, que caen contra HEAD por **46 condiciones y
ninguna por excepción**. **24/24 mutaciones dirigidas muertas.** **Diecisiete casos viejos
adaptados**, los diecisiete destapados por la corrida completa: nueve en el 9b (TC-13, TC-289,
TC-470, TC-471, TC-472, TC-474, TC-500, TC-502, TC-535) y ocho en el 9d —los cuatro del TEER
(TC-74, TC-86, TC-92, TC-GR-07), que exigían el veredicto en la hoja del PDF, y los cuatro del
posoperatorio (TC-580, TC-583, TC-585, TC-595)—. De ahí nacieron la condición **(E9c)** —ninguna
pieza de plastia, TAVI ni TEER encendida sobre una prótesis mecánica— y la **mutación 23** que
la mata.

**La excepción de `CLAUDE.md` que dejó de ser cierta.** Decía que las tres etiquetas del TEER
«llegan a la hoja del PDF … y se quedan». El commit 5a las sacó del papel por orden expresa de
Maicol; la primera mitad de la regla —no se tocan, siguen en la pantalla— se conserva, y la
segunda se corrigió con la medición al lado.

**Línea base al cierre.** Suite **617/623** en doce lotes, 623 de 623 ejecutados, md5 de
`index.html` idéntico antes y después (`738944d2`), pendrive verificado en las catorce
oportunidades. Rojos: TC-223, TC-376, TC-390 y TC-406 (los cuatro de siempre) más TC-182 y
TC-551 (intermitentes declarados, verdes aislados). Semgrep 124 WARNING / 0 ERROR. Excel 441
columnas. Cero campos guardados nuevos. Celular 59 / 68 con 17 ALTA. `index.html` 10,91 MB /
153.139 líneas, sello `v20261102-0107`.

**Lo que queda para el médico.** Abrir en PowerPoint los tres `.pptx` de
`~/Desktop/ceibo-ppt-valppt/` (**VP-f**) y correr el `git push`, que esta tanda tenía prohibido.
→ `docs/PENDIENTES.md` **VP-a** a **VP-j**.

**Cobertura.** TC-605 a TC-608, que caen contra HEAD por **46 condiciones y ninguna excepción**;
**23/23 mutaciones dirigidas muertas**; tres condiciones nacidas del barrido.

**Dónde está todo.** `docs/mapa/valppt-opciones-ppt.md` · `docs/mapa/tests-fichas-605.md` ·
`docs/fuentes/FUENTES.md` → «La tanda VAL-PPT» · `docs/GUIA_PRUEBA_VALPPT.md`.

---

## CORR-EVID — las correcciones de VAL-PPT y la ACC/AHA 2025 en la Evidencia (2026-11-02)

**Commits:** `b49ea1e` (1) · `696fa5f` (2) · `b617556` (4 y 5) · `c1c3f7b` (6 y 7) · el de
cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`91dd547`**, el cierre de
VAL-PPT, ya publicado, con md5 de `index.html` **`738944d2`** y sello `v20261102-0107`.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

**Lo que hizo.**
- **Commit 1** — el EN SUMA nombra siempre la válvula reparada, con su insuficiencia en la misma
  línea y sin repetirla aparte. Dueño único `valvRepSuma`; la pasada de VAL-PPT-3 se retira.
- **Commit 2** — PARADO tras medirlo: el dato SÍ llega al dibujo y los cuatro símbolos son
  distintos. La comparación sobre el **SVG que renderiza la app** contra la demo v9 da **8 de 8
  iguales**. Lo que falta es la casilla de válvula operada, que es una decisión de diseño.
- **Commit 3** — PARADO tras medirlo: la fila del conteo **ya decía 2024**. Lo que el médico ve es
  la tarjeta de criterios, que es otra superficie.
- **Commits 4 y 5** — el molde de «una pregunta, una guía» (`IND_GUIA_LBL`, `_indPregNota`,
  `acc2025achd`) y la Evidencia de la transposición con las **dos** guías: 18 + 12 + 12 + 8
  preguntas.
- **Commits 6 y 7** — la Evidencia de la comunicación interauricular y de la interventricular, 14
  preguntas cada una, con tres notas de tramo y dos diferencias de clase declaradas.
- **Commit 8** — PARADO: de las cuatro conductas de la pantalla de la TGA, dos quedan respaldadas,
  una parcialmente y una no.

**Lo que dejó declarado:** `CE-a` a `CE-g` en `docs/PENDIENTES.md`.

---

## TGA-4 — el PDF de la transposición, el panel compacto y la conclusión descriptiva (2026-11-02)

**Commits:** `8294072` (1) · `ca110fa` (2) · `4873668` (3) · `30adbbe` (4) · `38df3b4` (5) · el de
cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`7f7d5ec`**, el cierre de
CORR-EVID, ya publicado, con md5 de `index.html` **`16cf562a`** y sello `v20261102-1206`.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

**Lo que hizo.**
- **Commit 1** — tres retoques del papel firmado: el prefijo «Segun la guia: » sale del recuadro
  de las **nueve** hojas de congénitas que lo emitían (la plantilla es compartida); la cláusula
  «complicación esperable en la ccTGA» sale del bloqueo auriculoventricular, porque esa rama la
  recorren tres anatomías y en dos nombraba otra; y la caja «Tricúspide / PSAP» del PDF nombra la
  **válvula** pulmonar cuando hay datos, con el mismo arreglo que el bloque ya le había hecho a
  la **vena** pulmonar.
- **Commit 2** — el esquema de circulación entra al PDF **al lado del 3D y con el mismo botón**.
  Pre-rasterización con el patrón del posoperatorio; el motor de tercios no se toca. Cierra la
  mitad de PDF de **T3-c**. Dos defectos los encontró la propia medición: el esquema de la vista
  de **referencia** se rasterizaba, y generar el PPT y enseguida el PDF **perdía** el esquema.
- **Commit 3** — el panel de Evidencia de la transposición, compacto: una línea por pregunta con
  tres estados «Sí | No | ?», etiqueta corta de guía, el detalle en el ⓘ debajo de la fila,
  contador, lista de lo contestado que sí, la frase del pie **una** vez, dos columnas por ancho de
  **panel** con su botón, y cuatro grupos sólo en el switch auricular. La causa de los 104 px por
  pregunta no era la prosa —ya estaba plegada— sino que los dos botones se apilaban en 60 px.
- **Commit 4** — la conclusión de **pantalla** de la transposición pasa a descriptiva; cierra
  **T3-e**, **T3-f**, **VP-a** y **CE-d**. Y el corte de **50 mmHg** se buscó en las dos guías
  completas y se **PARÓ**: existe para la estenosis subaórtica en la ACC/AHA (pico ≥50, texto de
  apoyo sin clase) y la ESC 2020 lo **bajó** a media ≥40; en el capítulo de la transposición no
  hay ningún número.
- **Commit 5** — la CIA y la CIV con el mismo molde compacto. La bicúspide, que comparte el molde,
  **no se movió**: medido.

**Lo que dejó declarado:** `T4-a` a `T4-h` en `docs/PENDIENTES.md`, incluida la decisión del
médico sobre los símbolos de las válvulas del posoperatorio, que se quedan como están.

---

## PANT-2 (2026-11-02) — el color del esquema en el PDF, el ⓘ del panel, las dos columnas y las frases de la TGA

**Seis commits de los trece que la orden pide.** Base: `d3f42b0` (cierre de TGA-4), sello
`v20261102-1645`, md5 `c96543c6`. **El push lo corre el médico: esta tanda tenía orden expresa de
NO pushear.**

| commit | qué |
|---|---|
| `b335dbf` | **corrección A** — el esquema de circulación del PDF sale con sus colores y la línea dice el escenario una sola vez |
| `b87a299` | **corrección B** — el ⓘ de una pregunta se cierra al tocar fuera, con Escape y al abrir otro |
| `26999d4` | **corrección C** — las Evidencias de más de 6 preguntas, en dos columnas y con filas compactas |
| `cba0a47` | **corrección D** — el informe de la transposición se adapta a lo cargado y escribe menos |
| `b511f1c` | **commit 1** — inventario de las congénitas, auditoría de sincronías y las dos copias de la guía (SOLO LECTURA) |
| (este) | **commit 9** — cobertura, documentación y la línea base al cierre |

**Lo que NO se hizo:** los commits **2 a 8** (MCH, el botón «3D» del corazón maestro, MCA, Fallot,
las dos estenosis aórticas, la arritmia ventricular y los rótulos de las presiones pulmonares).
**Ninguno se empezó** y ninguna línea de la aplicación se tocó por ellos; la orden prohíbe dejar
una pantalla a medias. Ver `docs/PENDIENTES.md` → **P2-a** y `docs/CONTINUACION_PANT2.md`.

### Lo que cerró, en una línea cada uno

- **A** — el esquema del PDF tenía las seis cajas con una fracción de casi negros de **1,000** y
  moda RGB(4,4,4): el marcado se rasteriza fuera del documento, donde `var(--bg)` no resuelve y
  `fill` cae en negro. Peor distancia moda-vs-pantalla **419,7 → 6,6**; contraste del texto
  **1,02 → 14,5-17,3 : 1**. El censo destapó que el esquema del **posoperatorio** también salía
  mal (113 `var()`), y el mismo arreglo lo cubre.
- **B** — la nota de una pregunta no se cerraba hasta tocar el mismo ⓘ otra vez y se podían abrir
  varias a la vez. Hoy se cierra al tocar fuera, con Escape —dejando el panel abierto— y al abrir
  otra, con `aria-expanded` siguiendo al estado.
- **C** — el panel ponía los datos del estudio a la izquierda y las preguntas a la derecha, o sea
  las preguntas en media pantalla. Hoy los datos van arriba y las preguntas debajo, en dos
  columnas: el alto baja un **32 a 36 %** maximizado y un 7 % a 390 px.
- **D** — el informe decía «Función del ventrículo derecho sistémico con disfunción moderada» y el
  EN SUMA «función del VD sistémico no consignada» con el dato vacío. Hoy nombra el hallazgo
  directo y no menciona lo que no está cargado.
- **1** — 19 secciones, 272 campos, 35 espejos, 53 frases; cinco casos de tipo 2 reportados sin
  unir; y las dos copias de la ACC/AHA 2025 **son la misma versión publicada**.

### Cobertura

**TC-619 a TC-622**, que caen contra HEAD por **29 condiciones y ninguna por excepción**.
**19/19 mutaciones dirigidas muertas**, en worktree y con md5 del árbol vivo idéntico.
**Cuatro casos adaptados**: TC-293, TC-451, TC-615 y TC-616.
