# Fichas de casos — TC-511 en adelante

⚠️ **Archivo NUEVO por el techo de 35 KB.** `docs/mapa/tests-fichas.md` quedó en **33,3 KB** tras
el trabajo B y el C no le escribió; la ficha de TC-511 lo cruzaba, así que sale acá. Las fichas
anteriores están en `tests-fichas.md` (TC-499 en adelante), `tests-fichas-496-498.md`,
`tests-fichas-491-495.md` y `tests-fichas-481-490.md`.

---

## TC-511 — el trabajo «B2» (2026-10-22)

**Qué cubre:** las cuatro correcciones de la reorganización de pestañas, y los controles de todo
lo que no se tenía que mover.

**31 condiciones**, con cinco denominadores y nueve controles negativos.

⚠️ **Y este renglón decía «24» antes de contarlas.** Se contaron sobre el propio caso
(`grep -c "ex.push" ` entre su apertura y su cierre): **contar y después escribir**, igual que
medir y después escribir.

| bloque | condiciones | qué afirma |
|---|---|---|
| **A** · la columna y las barras | A1 a A6 | once botones en orden con «Pericardio y pulmón»; **ninguno** con `data-mod` y `pulmonar` fuera de `EE_MODULES`; dos barras apiladas; su color RESUELTO contra la de Hemodinámica en seis propiedades; nacen cerradas y se abren con un toque; el drawer con once, el módulo una sola vez e **igual en los dos modos** |
| **B** · pericardio intacto | B1, B2 | los doce campos en esa pantalla; el desplegable del derrame con sus cinco opciones |
| **C** · el pulmonar unificado | C1 a C8 | los seis campos del básico no existen y `pulBasicoTexto`/`pulAvanzadoCubreBasico` tampoco; los dos que sobreviven con su id; cero «avanzado» y **un** «Integrar al informe»; **un párrafo** con los tres temas y el patrón global; el tamaño y la nota adentro; **una línea** en el EN SUMA |
| **D** · los estudios guardados | D1 a D4 | la migración campo por campo; el «no» de fábrica **no** se traduce; con el avanzado cargado manda el avanzado; los tres dependientes con «sin consignar» y la oración sin inventar el hallazgo |
| **E** · Otros | E1 a E4 | sin sub-pestañas, dos paneles visibles con **una** barra cada uno; su color; el ASIA y el test de burbuja con un dueño **en los dos sentidos** |
| **F** · C. Congénitas | F1 a F3 | los cuatro botones con `tab-special`; su color resuelto contra uno de la fila de arriba; el activo en `cc-on` sobreviviendo al cambio de pestaña |
| **G** · los controles | G1 a G4 | los cortes y los grados; **440 columnas**; ninguna columna del pulmón; el Laboratorio clasificando |

### Los controles negativos, uno por uno

- **C7** · sin «Integrar al informe» el pulmón **no publica una sola oración**.
- **C8** · el globo ⓘ del Balik se conserva (lo destapó TC-502 al perderse).
- **D2** · el `'no'` de fábrica **no** se traduce: sin esto, todo informe anterior pasaría a
  publicar tres negaciones que nadie evaluó.
- **D3** · con el avanzado ya cargado **no se pisa** un valor.
- **D4** · la oración no dice «de aspecto libre» ni «bilateral» ni «con broncograma aéreo» por el
  valor de fábrica.
- **E3** y **E4** · los espejos con el FOP en los **dos** sentidos.
- **F3** · el estado activo sobrevive al cambio de pestaña (`showTab` barre `.active`).
- **G3** · ninguna columna del Excel nombra el pulmón.

### Verificado que sabe fallar

Contra **HEAD** (`82a6ead`, el cierre del trabajo C) en un worktree aparte: **18 de las 31
condiciones en rojo, y NINGUNA por excepción** —el caso corrió entero y listó las dieciocho—.
Las **trece** que pasan son exactamente lo que esta tanda no mueve: los doce campos de
pericardio y las cinco opciones del derrame (B1, B2), el control negativo de integrar (C7), el
EN SUMA de una línea —que en HEAD también era una sola porque el básico callaba— (C6), el
avanzado que manda sobre el básico (D3), el ASIA y la burbuja (E2, E3, E4), el color y el
estado activo de CC (F2, F3) y los cuatro controles del bloque G.

### Trampas del propio caso

1. **`fop_contraste` es un `<select>` si/no y no un checkbox**: la primera versión de E4
   preguntaba por `.checked` y salía roja sobre un espejo perfecto.
2. **El color de un `.tab-btn` no se lee en el turno del clic** —`transition: all .15s`— y el
   clic deja `:hover`. Este caso mide el color de las **barras**, que no tienen transición, y el
   de los botones **sin tocarlos**; el ciclo con clics y los dos motores van en
   `scripts/_probe_b2.mjs`, que puede esperar y alejar el mouse.
3. **El acento grave, tres veces**, en comentarios del cuerpo. `check_backticks.py` los dio.
4. **«Nacen cerradas» no se puede medir en el estado VIVO** (A5): otro caso de la suite puede
   haberlas abierto antes, y entonces la condición sale roja sobre una app perfecta. **Medido:
   corrido solo pasaba y en una lista de siete caía.** Lo que hace que nazcan cerradas es el
   `style="display:none"` de sus dos contenedores, que es sincrónico y no depende del orden; el
   **toggle** se mide aparte, fijando primero el estado de partida. Así la condición es más
   fuerte: caza el marcado **y** las dos direcciones del toque.
