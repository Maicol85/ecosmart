# PANT-2 — el color del esquema en el PDF, el ⓘ que se cierra, las dos columnas y las frases de la TGA

Mapa de la tanda **PANT-2** (2026-11-02), correcciones **A**, **B**, **C** y **D** más el
inventario del commit 1. Por nombre de función y de constante, **sin números de línea**: la línea
cambia en cada edición, el nombre no.

---

## 1 · El color del esquema en el PDF (corrección A)

**Dueño único: `esqSvgParaRaster(svgTxt)`**, aplicado dentro de `esqRasterizar` antes de
serializar. Tres piezas:

| pieza | qué hace |
|---|---|
| `_esqVarsResueltas(txt)` | lee del tema VIVO **sólo las variables que el marcado nombra** |
| `_esqSustVars(txt)` | sustituye `var(--x)` y `var(--x, respaldo)`, hasta tres pasadas |
| `_esqFontFamily()` | la tipografía del documento, para que el texto no caiga en serif |

**La causa, medida y no supuesta.** `esqRasterizar` serializa el SVG a un `data:` URL y lo
decodifica en un `<img>`: ahí el dibujo vive **fuera del documento**, donde no existen ni las
variables de `:root` ni la hoja de estilos. Un `fill="var(--bg)"` que no resuelve cae en el valor
**inicial** de `fill`, que es **negro**.

⚠️ **NO HAY LISTA DE VARIABLES.** La primera versión llevaba el juego escrito a mano y el censo de
A3 destapó que el esquema del **posoperatorio** nombra `--accent2`, que no estaba. Se leen las que
el marcado nombra, así que no se queda vieja.

### A3 — el censo: sólo TRES pasan por el rasterizador

| esquema | `var()` al rasterizar, antes | después | font-family | negros en claro |
|---|---|---|---|---|
| circulación de la TGA | **39** | **0** | NO → SI | 0,293 → **0,009** |
| **posoperatorio** | **113** | **0** | NO → SI | 0,314 → **0,003** |
| orejuela (**control de idempotencia**) | 0 | 0 | SI → SI | 0,003 → **0,003** |

Los otros siete diagramas de `PDF_DIAG_REG` traen su propio `dataURL` de un canvas y **no pasan
por `esqRasterizar`**: censados sus llamadores, son dos desde el PDF (`popEsqPdfRaster` y
`tgaEsqPdfRaster`) más `esqGuardarComoImagen` para la orejuela.

### A4 — la línea del recuadro, con un dueño único

`tgaEsqPdfData()` devuelve **sólo `{data}`**: el esquema ya no lleva línea propia. La línea del
recuadro la arma **`tga3dLineaPDF`**, que ya decía el escenario y las comunicaciones, más la frase
ilustrativa fija del recolector. Así el escenario **no puede** decirse dos veces.

El escenario no se puede perder: `tga3dLineaPDF` devuelve vacío sólo sin anatomía cargada, y sin
anatomía `_tga3dEsDato` es falso, la compuerta está cerrada y no hay esquema que rotular.

---

## 2 · El ⓘ de una pregunta que se cierra (corrección B)

| pieza | qué hace |
|---|---|
| `_indInfoTodas()` | los `details[data-ind-info]` del panel |
| `_indInfoSync()` | `aria-expanded` del `<summary>` sigue al `open` de su `<details>` |
| `_indInfoCerrar(excepto)` | cierra todas menos una; con `null`, todas |
| `_indInfoCablear()` | el cableado, **una sola vez**, como `_indClinCablear` |

**Las cuatro puertas de cierre:** tocar fuera, Escape, abrir otra, y repintar o cerrar el panel.

⚠️ **VA EN EL DOCUMENTO Y EN FASE DE CAPTURA**, y las dos cosas son necesarias. En el documento
porque «fuera» incluye el resto de la página. En **captura** porque el toggle nativo del
`<details>` es la **acción por omisión** del clic, o sea que ocurre DESPUÉS de las dos fases:
cerrando «las demás» ahí, el nativo abre la que se tocó y queda exactamente una. El
`aria-expanded` se sincroniza en un `setTimeout` de cero por el mismo motivo.

⚠️ **Escape detiene la propagación SÓLO si había una nota abierta**, así que cierra la nota y deja
el panel; con todas cerradas sigue cerrando el panel como siempre.

---

## 3 · Las Evidencias de más de 6 preguntas (corrección C)

**REGLA DEL MÉDICO (2026-11-02):** toda Evidencia con **más de 6 preguntas** ordena las preguntas
en **dos columnas**, y en **una** en anchos menores, y tiene que **funcionar igual**.

| pieza | qué hace |
|---|---|
| `_indReparto(filas, n)` | parte la lista en n, **por mitades en orden** y no alternado |
| `_indColsHTML(filas, cols, compacta)` | emite un `<div data-ind-sub>` por columna |
| `data-ind-pregcols="1"` | el contenedor de las preguntas repartidas |
| `data-ind-infofilas="1"` | las filas **informativas** de `clinica`, a todo el ancho |
| `.ind-ctrl-fila` / `.ind-ctrl-btn` | los marcadores de la botonera |

**La disposición:** los **datos arriba** a todo el ancho en dos columnas, las **preguntas debajo**
en dos columnas. Hasta esta tanda la grilla ponía los datos a la izquierda y las preguntas a la
derecha, o sea las preguntas en media pantalla.

⚠️ **DOS TABLAS Y NO `column-count`**: las filas viven en un `<table>`, las columnas de CSS las
parten por la mitad y `break-inside:avoid` sobre un `<tr>` no se respeta. En **una** columna las
dos tablas quedan una debajo de otra, que es el orden de lectura pedido. El DOM conserva ese
orden, así que el de **tabulación** tampoco cambia.

⚠️ **UN RÓTULO DE GRUPO NO QUEDA HUÉRFANO**: si el corte cae en uno, pasa a la columna siguiente.

⚠️ **LAS FILAS INFORMATIVAS NO SE REPARTEN**, y se separan por **no tener `ctrl`** y no por su
posición: el contador —«Falta contestar: …»— metido en una columna quedaría a media pantalla
anunciando lo que falta de las dos.

### Las alturas, antes y después

| ancho / estado | CIA | CIV | TGA | fila más alta |
|---|---|---|---|---|
| 1440 sin maximizar | 1054 → **973** | 1065 → **984** | 1409 → **1308** | 55 → **45** |
| 1440 **maximizado** | 840 → **573** | 840 → **565** | 1156 → **738** | 55 → **45** |
| 1000 maximizado | 851 → **610** | 864 → **607** | 1178 → **784** | 66 → 66 |
| 768 | 1054 → **973** | 1065 → **984** | 1409 → **1308** | 55 → **45** |
| 390 | 1906 → **1766** | 1951 → **1811** | 2509 → **2329** | 125 → **115** |

A 390 px **mejora** un 7 %, lo que cierra en parte **T4-h**.

### Tres trampas que esta corrección pagó

1. **La regla de 1000 px del panel maximizado es MÁS ESPECÍFICA** —tres atributos contra dos— y
   seguía poniendo datos a la izquierda: las sub-tablas quedaban en **328 px** y la fila más alta
   **saltaba de 55 a 157**. Le faltaba el `:not([data-ind-preg="1"])` que la regla de 1200 px de
   las ocho compactas ya tenía.
2. **El área de 44 px se solapaba con el botón de la fila de abajo**: el hueco era de **once**
   píxeles y cada área se extiende 6 arriba y 6 abajo. Un margen de 1 px lo lleva a **13**.
3. **Las secciones de seis o menos preguntas se movían.** `_indCtrlHTML` es el molde de **todas**
   las botoneras del panel: con el estilo en línea, su fila más alta pasaba de 55 a 45 y de 104 a
   82. La clase quedó como **marcador** y la regla se acotó a `[data-ind-preg="1"]`.

### El inventario (commit 1a)

**Sólo TRES secciones usan el molde** (`preguntas: true`): `_indCIA` (14 preguntas), `_indCIV`
(14) y `_indTGA` (18). **Once** son compactas. El panel del **posoperatorio** no usa el molde y
tiene cuatro filas con botonera, en `filas` y no en `clinica`: queda fuera de la regla.

⚠️ **El chequeo de documentación del código dice OCHO compactas y son ONCE**: nació vencido otra
vez, porque TGA-2 y TGA-4 sumaron tres sin tocarlo.

---

## 4 · Las frases de la transposición (corrección D)

**Dueño: `tgaConclusion`** (el cuerpo y el papel) y **`ccSumaLinea('tga')`** (el EN SUMA).

| campo | antes | ahora |
|---|---|---|
| `tga_func_vd` = normal | Función del ventrículo derecho sistémico normal | **idéntica** |
| `tga_func_vd` = leve | Función … **con disfunción leve** | **Disfunción del ventrículo derecho sistémico leve** |
| = moderada | … con disfunción moderada | … **moderada** |
| = severa | … con disfunción severa | … **severa** |
| vacío, en el EN SUMA | — función del VD sistémico **no consignada** | **(no se dice nada)** |

Las palabras son las de las **opciones de la app**. El respaldo publica el valor tal cual: un
estudio guardado con un vocabulario viejo sigue diciendo lo que tiene cargado.

⚠️ **QUEDA UNA FRASE DE DATO FALTANTE Y NO LLEGA AL PAPEL**, verificado: el `resumen` de
`tgaConclusion` dice «No consta la situación clínica…», pero `CC_PPT` registra la sección con
`papel:true` y la hoja del PDF usa `c.papel || c.resumen`. Ver `docs/PENDIENTES.md` → **P2-b**.

⚠️ **LA MISMA CONSTRUCCIÓN EN EBSTEIN NO SE TOCÓ**, que es lo que la orden pide: `ebsConclusion`
tiene el mismo mapa y publica «Ventrículo derecho funcional con disfunción moderada».

---

## 5 · Las sondas y el barrido

| sonda | qué mide |
|---|---|
| `scripts/_probe_pant2a.mjs` | el **color** del esquema en el PDF generado de verdad, por píxel |
| `scripts/_probe_pant2a3.mjs` | el censo A3 de los tres esquemas que pasan por el rasterizador |
| `scripts/_probe_pant2bc.mjs` | el ⓘ con clics reales y el inventario de los paneles |
| `scripts/_probe_pant2c.mjs` | las alturas, el reparto, el área táctil y los tres estados |
| `scripts/_probe_pant2d.mjs` | las frases, opción por opción, en las siete superficies de texto |
| `scripts/_probe_pant2inv.mjs` | el inventario de las 19 secciones de congénitas, en el DOM |
| `scripts/_mut_pant2.py` | las 19 mutaciones dirigidas, en worktree |

⚠️ **Trampas que estas sondas pagaron**, para no volver a pagarlas:
- **El tema de la app es la clase `light-mode` en `<html>`**: el `colorScheme` de Playwright **no
  lo mueve**, así que la primera medición comparaba el mismo tema dos veces.
- **El clic de Playwright por coordenadas falla** sobre un `<summary>` de 11 × 13 px dentro de un
  contenedor con `overflow:auto`. Se usa `summary.click()` del DOM, que dispara el toggle nativo.
- **Un `details[data-ind-info]` puede vivir dentro de un bloque de notas COLAPSADO**: ahí no se
  renderiza pero `getBoundingClientRect` devuelve su posición teórica. Se mide sobre los
  **visibles** — 12 de 59.
- **Cada sub-pestaña se mide con la suya activa**: con la otra delante, el `scrollHeight` de sus
  nueve secciones da **cero**.
- **Un censo estático no acota las secciones**: el último acordeón se lleva todo lo que sigue
  —la de Fontan daba 526 KB y 213 campos contra 18 en el DOM—.
- **`elementFromPoint` fuera del viewport** devuelve null: la suite corre a ~756 px, así que el
  área táctil se mide por el **alto del `::after`**, que es el contrato.
- **Un `<details>` CERRADO conserva su caja teórica**: su `<div>` informa `scrollWidth` 83 sobre
  `clientWidth` 11 y entra en cualquier filtro de «texto recortado» aunque **nadie lo vea**. Lo
  destapó TC-569: hasta esta tanda daba cero por casualidad, porque contestar una pregunta
  **conservaba** el ⓘ abierto. Medido con las notas **abiertas**: **cero recortados en los dos
  árboles**, así que no hay recorte real.
