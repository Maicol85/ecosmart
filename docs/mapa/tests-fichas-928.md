# Fichas de los casos TC-928 a TC-943 — tanda CUADROS (2026-11-18)

Los dieciséis casos de la tanda CUADROS, uno por cada punto de la orden. **Todos caen 0/16 contra
`d3ea944`** con el mismo archivo de casos y sólo el `index.html` distinto, por **92 condiciones**,
y **ninguno por excepción**: todo acceso va por un ayudante con guarda que devuelve una forma
vacía, porque contra ese árbol ninguna de las funciones de la tanda existe y un acceso pelado tira
`ReferenceError` que se lleva el caso entero.

Se **generan** con `scripts/_gen_cuad_casos.py`, que aborta si un cuerpo trae un acento grave, una
interpolación o una barra invertida. No es una comodidad: un acento grave cierra el template
literal del caso y lo peor que puede pasar es que lo que queda **siga siendo JS válido** —ahí
`node --check` pasa y el caso se registra con un cuerpo que no es una cadena, que es lo que
PANT-31 pagó con TC-798—.

| caso | qué fija | cae por |
|---|---|---|
| **TC-928** | los DOCE cuadros, sus títulos, el orden de arranque y el reparto de tres por fila | 6 |
| **TC-929** | la aorta con su asterisco y su pie, y el Ø TSVI en UN solo cuadro —el de continuidad publica el DVI— | 6 |
| **TC-930** | VI-Estructura con el VDFVI indexado; el VD con sus siete filas más la FEVD y la VD/VI | 5 |
| **TC-931** | el cuadro mitral en dos columnas y el AVm por THP diciendo sólo «no corresponde» con IAo severa | 5 |
| **TC-932** | «Tricúspide / Pulmonar» en dos columnas y la pulmonar sin cuadro propio | 4 |
| **TC-933** | el cuadro aórtico en dos columnas y el gasto cardíaco sin el AVA ni el indexado | 6 |
| **TC-934** | «Otros» en UNA línea con « · » y sin la aorta | 4 |
| **TC-935** | la fila de válvulas y los valores de referencia, eliminados en los OCHO estilos, con el PDF generado de verdad | 4 |
| **TC-936** | las líneas de válvula, una por hallazgo, dentro del cuadro de su estructura | 5 |
| **TC-937** | ningún dato en dos cuadros a la vez — censo de rótulos | 4 |
| **TC-938** | el botón de los cuatro cuadraditos y la tarjeta con los mismos cuadros | 10 |
| **TC-939** | quitar, recuperar, arrastrar con el dedo y restablecer | 10 |
| **TC-940** | la tarjeta no escribe nada y cerrarla deja el PDF idéntico | 2 |
| **TC-941** | la configuración sobrevive a «Nuevo estudio» y a abrir otro estudio, y el PDF la refleja en dos estilos | 5 |
| **TC-942** | el punto de aviso, con palabras, al quitar Y al reordenar | 11 |
| **TC-943** | la regla de la grilla con los siete ejemplos, y la fila atómica en el papel | 6 |

## Las cinco trampas que estos casos pagaron

1. **El acento grave dentro de MIS PROPIOS comentarios**, tres veces. El guardián del generador lo
   abortó antes de insertar nada.
2. **Una expresión regular con barra invertida**: no sobrevive al template literal —un patrón de
   espacios llega como la letra «s» y reemplaza las eses del texto por espacios—.
3. **Lo que está en `display:none` no tiene geometría**: el botón medía 0×0 sin abrir la pestaña
   del Informe, que se lee igual que «el botón no está».
4. **El overlay de login tapa la página entera** y `elementFromPoint` devuelve `login-overlay` en
   todos los puntos: el arrastre medía «no hay ningún cuadro debajo del dedo» sobre un arrastre que
   funciona. Por eso el ayudante `_arrastrar` **devuelve qué encontró** debajo del puntero: sin
   eso, «no se movió» y «no había nada debajo» se leen igual.
5. **Un objeto de `cuadDefs` leído ANTES de cambiar el dato**: la función devuelve uno nuevo en
   cada llamada, así que el de arriba daba el estado anterior — un caso verde sobre una medición
   vieja.

Y dos de la propia siembra, medidas: **`vd_fac` es de sólo lectura** —lo escribe `calcVD` desde las
dos áreas, así que sembrarlo no hace nada— y **`ia_grado` es un `input` oculto cuyo `onchange`
lo vuelve a derivar**, así que se escribe **sin disparar eventos** (`_mudo`).

## Los tres casos adaptados

- **TC-260** — dos condiciones **INVERTIDAS**: el título del cuadro mitral deja de ser condicional
  y nombra la vena pulmonar siempre, y los dos cortes de la vena pulmonar **ya no se imprimen**
  porque el papel no publica valores de referencia. Los dos umbrales no se movieron: siguen en las
  alertas de la pantalla.
- **TC-475** — el cuadro dejó de llamarse «AVA / GC / IC»: la condición que contaba elementos del
  PDF se reemplaza por una que mide lo que de verdad importa —que el cuadro del gasto **no
  desaparece** sin FC— más una **invertida**: el AVA ya **no** vive en ese cuadro.
- **TC-614** — cuatro condiciones, tres **INVERTIDAS**: la caja se llama «Tricúspide / Pulmonar»,
  el título nombra la pulmonar **también sin datos**, y la morfología dejó de ser una **fila** para
  ser una **línea de válvula** — el dato no se perdió, se busca donde vive ahora.

Los tres caen **0/3 contra `d3ea944`**.
