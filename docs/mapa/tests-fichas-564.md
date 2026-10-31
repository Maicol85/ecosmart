# Fichas de TC-564 a TC-567 — tanda TGA-2 (2026-10-31)

Archivo propio porque `docs/mapa/tests-fichas.md` está en **34.237 B**, a 700 bytes del techo.

El mapa de la tanda es `docs/mapa/t2-evidencia-congenitas.md`.

---

## TC-564 · Jatene y Rastelli: el papel describe y no interpreta

**Qué fija.** Que con `tga_cirugia` en `jatene` o en `rastelli` el informe, el EN SUMA, la hoja del
PDF y el PPT digan **sólo** el tipo, la cirugía y los hallazgos neutros cargados; que el dibujo los
pinte como la demo; que el título del acordeón sea neutro; y que la fila de función del VD sistémico
se esconda **sin borrar** su valor.

**Denominadores.**
- **(A0)** `tgaCirFrase` existe.
- **(A1)** los **tres campos parados** están cargados de verdad —`tga_func_vd` en moderada,
  `vd_bas` en 45 e `it_grado` en 4—. Sin esto, «el informe no los dice» pasa sobre campos vacíos y
  no prueba nada. Es la trampa que este repositorio documenta como «escena que no llega a la
  compuerta».
- **(D0)** el encabezado del acordeón existe en el documento.

**Controles negativos.**
- **(B1)** a **(B5)**: con Post-Mustard, Post-Senning, ccTGA, d-TGA + «sin cirugía» y d-TGA sin dato
  el informe **sigue** abriendo con «el ventrículo derecho es el ventrículo sistémico». Es lo que
  prueba que el cambio no se derramó, y lo que mata la mutación **03**.
- **(C4)** y **(C6)**: el dibujo de la d-TGA sin cirugía y el del switch auricular **no** tienen
  ningún elemento naranja.

**Bloques.** (A) el papel con Jatene y con Rastelli, incluidos los hallazgos neutros y el bloqueo AV
sin su cláusula de la ccTGA · (B) los cinco controles negativos · (C) el dibujo, comparado por
puntos y colores contra los de la demo · (D) el título, el párrafo y la fila que se esconde · (E) el
Excel y el vocabulario del importador.

⚠️ **(C3) compara el COLOR con su número.** `C.red` es `0xd8433b` = **14173499** y `C.blue` es
`0x2f6fd0` = **3108816**. Con Rastelli la aorta sale **roja** del tronco anterior y sin operar sale
**azul** del mismo tronco: es la única diferencia entre las dos ramas que comparten trazado, y
escribirla por su número es lo que la hace medible.

---

## TC-565 · El panel de Evidencia de la transposición

**Qué fija.** Que la sección aparezca registrada, que publique **una tabla distinta por cirugía**,
que pregunte sólo lo que las recomendaciones nombran, con tres estados, que lea de otros módulos lo
que ya tiene, que diga qué falta cuando ninguna condición está en «sí», y que **ninguna** de sus
frases llegue al papel.

**Denominadores.**
- **(A0)** la sección está en `IND_SECS`.
- **(E0)** el informe se emite y tiene más de 300 caracteres de cuerpo. Sin esto, «el papel no dice
  la recomendación» pasa sobre una cadena vacía.
- **(E5) CONTROL POSITIVO**: las **cuatro** frases censadas —«stent cubierto», «túnel auricular»,
  «folio 619» y «centro especializado»— **sí** están en el panel. Es lo que hace creíble el cero del
  papel.

**Controles negativos.** **(G1)** sin tipo cargado la sección no aplica; **(G2)** en un estudio
ajeno tampoco; **(C2)** una respuesta en «no» no desaparece del balance ni cuenta como presente.

**Los conteos, uno por uno contra la hoja**: switch auricular I×6, IIa×3, IIb, III con 7 preguntas;
switch arterial I, IIa×2 con 4; Rastelli I×2, IIa con 6; ccTGA I, IIa×2, IIb con 3 y un bloque de
seguimiento propio.

⚠️ **(F1) mide que «Nuevo estudio» vacíe `_indClin`**, y lo hace comprobando primero que **había**
algo que vaciar. Un `Object.keys(...).length === 0` sobre un objeto que nunca se llenó pasa en
verde sin probar nada.

---

## TC-566 · Los paneles de la CIA y de la CIV

**Qué fija.** Las dos tablas de la guía con su clase y su nivel, agrupadas por situación; que las
filas de solo lectura que esas secciones tenían pasaron a ser **preguntas**; que el tipo y el tamaño
se **leen**; y que el papel no lleva ninguna de sus frases.

**Denominadores.** **(A0)** las dos secciones están registradas · **(A1)** y **(B1)** la escena
**despierta** cada sección —sin eso, contar recomendaciones da cero y se lee como que el bloque no
existe— · **(E0)** el informe se emitió con cuerpo.

**Controles negativos.** **(G1)** y **(G2)**: sin defecto cargado ninguna de las dos aplica ·
**(C3)**: la contestada «no» sigue fuera de las presentes y no vacía la lista de lo que falta ·
**(E5) CONTROL POSITIVO**: «folio 592», «cierre FENESTRADO» y «por debajo del 90 %» **sí** están en
el panel.

⚠️ **(A6) mide que la escalera de resistencias ya NO esté en prosa dentro de `notas`**, y **(A7)**
que sus tramos **sí** estén en el bloque visible. Las dos juntas son lo que distingue «se movió» de
«se perdió».

⚠️ **(B6) exige que la `guia` de la CIV siga citando `escGuchCiv`.** Esa entrada es la que lleva la
advertencia de que el criterio de la app diverge de la tabla; cambiarla a `esc2020guch` la borraría.

---

## TC-567 · La muerte súbita de la MCH, y la poda que sigue parada

**Qué fija.** Que la Tabla 23 de la ESC 2023 entre como sección propia del panel con sus nueve
filas, su clase y su nivel y tres preguntas; que lea el score y los dos hallazgos de la banda baja
de sus dueños **sin recalcular nada**; y que la poda del PPT siga **parada**, con la razón escrita.

**Denominadores.** **(A1)** la escena despierta la sección · **(C0)** la conclusión de la MCH se
emite de verdad, porque «el PPT sigue diciendo la recomendación» sobre un texto vacío no prueba
nada.

**Controles negativos.**
- **(A8)** con el gradiente del tracto de salida **por debajo de 30 mmHg**, la sección de reducción
  septal **no** aplica y ésta **sí**. Es lo que prueba que son dos preguntas distintas y lo que mata
  la mutación **14**.
- **(B3)** la contestada «no» no entra en las presentes.
- **(D4)** la sección de reducción septal **sigue sin** nombrar el desfibrilador, que es lo que
  TC-563 (C2) mide: las dos condiciones siguen midiendo cosas distintas y ninguna tapa a la otra.

⚠️ **(C1) y (C2) son la PARADA, escrita como condición.** Afirman que el papel **sigue** diciendo la
recomendación y **sigue** citando la AHA/ACC 2020. Pasan en verde a propósito: el día que esa guía
entre en la biblioteca y la recomendación se transcriba, se ponen rojas y recién entonces se puede
podar. Es el mismo mecanismo con que TC-563 (C) dejó registrada la parada anterior.
