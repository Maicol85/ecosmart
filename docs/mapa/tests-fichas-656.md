# Fichas de los casos TC-656 a TC-661 — tanda PANT-8 (2026-11-04)

Archivo propio porque `tests-fichas.md` está en **34,2 KB**, a menos de 1 KB del techo de 35 KB.

Los seis **caen contra HEAD por 71 condiciones y NINGUNA por excepción**, verificado en un
worktree sobre `afed3e8` con el mismo archivo de casos, alternando sólo `index.html`.

| caso | condiciones en rojo contra HEAD |
|---|---|
| TC-656 | 12 |
| TC-657 | 12 |
| TC-658 | 11 |
| TC-659 | 14 |
| TC-660 | 14 |
| TC-661 | 8 |

---

## TC-656 · los dos botones de TAVI

**Qué fija.** Que cada botón vive en su **propia** barra, con `cc-lesbar` —sin ella la media query
de 768 px los esconde—, una a `flex-start` y la otra a `flex-end`, las dos dentro de
`.ete-tavi-btnfila`; que el estado es `cc-pane-on` y **no** `.active`, que es la clase que
`showTab` barre de todo el documento; que el botón trae su panel y esconde el otro; que la marca
**sobrevive al cambio de pantalla**; que CIA / CIV no se movieron; y que el pintor **no escribe un
solo campo del estudio**.

⚠️ **(E3) y (E4) NACIERON DE UNA MUTACIÓN QUE SOBREVIVIÓ.** (E1) no puede fallar si el pintor deja
de correr: `cc-pane-on` es una clase **propia** y `showTab` no la barre, así que el estado
sobrevive solo. Lo que compra el llamado desde `eteTaviSync` —que está en `RECALC_MODULOS`— es
reponer el pintado después de una ruta de **restauración**, que puebla sin disparar eventos. Se
simula corrompiendo el DOM a mano y corriendo el embudo.

⚠️ **(G) FIJA LOS CAMPOS ANTES DE LA FOTO, Y LO DESTAPÓ OTRA MUTACIÓN.** El pintor corre al cargar
la página, así que una escritura suya ya dejó el campo escrito antes de que el caso fotografíe y
las dos fotos salen iguales. Es el **freno que tapa al que se muta**.

## TC-657 · el panel Post-TAVI en tres columnas

**Qué fija.** Que el contenedor tiene **tres** hijos; que cada campo está en la columna de su
grupo, **por id**; que la extensión circunferencial, la nota del médico y el lienzo del jet **no**
entran en ninguna columna y que lo que sigue a las columnas es el título del jet; y que el corte
va en una **media query explícita de 900 px**, igual que el piso de 170 px de los campos.

⚠️ **LAS REGLAS SE LEEN DEL TEXTO DE LOS `<style>`** y no de `document.styleSheets[i].cssRules`,
que en este arnés devuelve vacío. Y la media query **no** se delimita por balance de llaves: un
comentario de la hoja que mencione «900 px» desalinea el conteo. Lo que se hace es buscar el
**selector** y preguntar si la media query más cercana hacia atrás declara ese ancho,
**acumulando todas** las coincidencias —un mismo selector tiene la regla de fuera y la de la media
query—.

⚠️ **EL CASO NO MIDE GEOMETRÍA:** la suite corre Chrome sin `--window-size`, o sea por debajo del
corte. La geometría la miden las sondas a los cuatro anchos.

## TC-658 · la sincronía de TAVI con Aorta / AI

**Qué fija.** Las tres parejas en el sentido TAVI → estudio, **incondicional**; el control
negativo del sentido inverso **sin** el módulo en uso, con `_labUsaTavi` en false; el mismo
sentido **con** el módulo en uso; que borrar borra en los dos sentidos; que lo que está a medio
escribir **no** se propaga; el reconciliador con los dos cargados y distintos, con uno vacío y en
**tres pasadas** —idempotencia—; que el anillo y la Vmax **no** escriben su falso par; y que la
morfología **no cruza** en ninguno de los cuatro casos.

⚠️ **LA SIEMBRA DEL RECONCILIADOR VA MUDA** —asignando `.value` sin despachar eventos—, que es
como pueblan las rutas de restauración. Con el gesto real el espejo ya corre y los dos lados
quedan iguales: la primera versión midió sobre un denominador envenenado.

⚠️ **`limpiar()` REPONE TAMBIÉN `va_morf`, Y LO DESTAPÓ EL PROPIO CASO:** (H2) leía «Bicúspide» y
acusaba a la sincronía cuando lo que pasaba es que (H1) lo había dejado puesto. `va_morf` **no
tiene opción vacía**: reponerlo es ponerle «Trivalva normal».

⚠️ **(E1) LLAMA AL DUEÑO DIRECTO Y NO MIDE TRAS LA CADENA DE EVENTOS.** Con el gesto completo el
valor a medio escribir no llega al otro campo **ni con la guarda rota**, así que la condición
pasaba en verde sobre la mutación. Medido en el navegador con la guarda rota: `ao_sin` recibe «-»
y recibe «abc» — los dos campos son de **texto** (`numdec` los convierte), así que nada los sanea
solos.

⚠️ **(F5) NACIÓ DE UNA MUTACIÓN QUE SOBREVIVIÓ:** (F3) mide el sentido incondicional y ninguna
condición miraba la guarda del sentido inverso **dentro** del reconciliador.

⚠️ **(C2) ES TOLERANTE AL ÁRBOL VIEJO:** contra HEAD `_taviModuloEnUso` no existe y llamarla a
pelo mata el caso con un `ReferenceError`. Es la lección de TC-546.

## TC-659 · el globo de la calcificación

**Qué fija.** Que la clave está en el registro con cuerpo; que el botón lleva `vinfo-btn-44`, el
glifo **U+24D8** y su etiqueta, y vive en el mismo campo que la calcificación; que el texto dice
que **ninguna fuente publica una clasificación con grados** y que la graduación queda a criterio
de quien informa; que trae los dos cortes, la frase «no grados de calcificación», la discrepancia
del 1300 y los cuatro folios; que tiene **cero** clases, **cero** verbos de conducta y **cero**
frases de revisión pendiente; y que el campo conserva sus cuatro opciones.

⚠️ **(C4) MIRA LA FRASE Y NO EL CARTEL ENTERO, Y LO DESTAPÓ UNA MUTACIÓN QUE SOBREVIVIÓ:** «1200»
aparece **dos** veces —en el corte y en el párrafo de la discrepancia—, así que sacarlo de uno
dejaba el otro.

## TC-660 · las referencias del VD y de la arteria pulmonar

**Qué fija.** El **denominador**: que la tabla se pintó con más de 40 filas —sin él, un cero de
contenido no se distingue de una tabla que no se pintó—. Después: el tronco con sus grados, el
corte de 25 mm y el cociente; las ramas con «sin valor normal publicado»; los tres diámetros del
tracto de salida con sus cuatro grados; los rangos de la guía de 2015; **cero** conducta y **cero**
revisión pendiente; y los dos **controles negativos** de que los cortes de pantalla no se movieron.

## TC-661 · el molde en la estenosis pulmonar

**Qué fija.** El **denominador**: que con el formulario vacío la sección **no** se abre y que con
el gradiente severo **sí**. Después: que publica `molde` con su categoría y **sin** fila de
estadio; las nueve filas de datos; **una** columna de preguntas con sus dos grupos y cinco
preguntas; el globo `epsintomas`; los **controles negativos** de que la lista clínica conserva sus
siete filas con las dos de solo lectura; y que la **prótesis mitral abre y NO tiene molde**.

---

## Los tres casos viejos que destapó la corrida completa

**TC-451**, **TC-492** y **TC-494** no los encontró el censo: grepeé por el nombre de lo que toqué
y los tres lo afirman con otras palabras. Es el modo de falla que `CLAUDE.md` ya documenta una
docena de veces.

| caso | qué afirmaba | qué afirma ahora | por qué |
|---|---|---|---|
| **TC-451** | el registro de globos de síntomas tiene **ocho** entradas | **nueve** | entra `epsintomas`, el de la estenosis pulmonar. **Conserva la exigencia de que cada etiqueta sea propia y distinta**, que es el invariante que este caso cazó cuando dos globos compartieron clave |
| **TC-492** | la bibliografía de `ref-vd2` tiene **cuatro** entradas | **ocho** | entran `DIM-VD-007` a `DIM-VD-010`. Nacen **verificadas**, así que el control de que la bibliografía sale sólo de fichas verificadas sigue en pie, y la condición conserva los dos documentos nombrados para que no alcance con el total |
| **TC-494** | ídem, más las **doce barras** | ídem | **las doce barras no se mueven**, y eso es lo que esta condición sigue vigilando: las veintidós filas nuevas son de **tabla** y ninguna dibuja barra |

**Su lote entero vuelve a dar 56/56** corrido de nuevo, así que no había dependencia de orden.
