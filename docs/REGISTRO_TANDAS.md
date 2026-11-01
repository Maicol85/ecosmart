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

**Qué cambió.** La matriz de «desmarcar» barrió los 105 selectores con opción vacía de las
diecinueve secciones de congénitas y encontró uno solo que sobrevive, en la válvula bicúspide, con
su causa en la morfología aórtica de Válvulas. La pantalla de la TGA quedó con los campos a la
izquierda y el dibujo a la derecha, el 3D dentro de su recuadro y con el corazón normal por
omisión, y los cuatro dibujos de los criterios TEER pasaron a la derecha de su campo. Y el papel
de la miocardiopatía hipertrófica dejó de nombrar guías, clases y la recomendación del
desfibrilador.

**Pendiente.** Ver el bloque de esta tanda en `docs/PENDIENTES.md`.
