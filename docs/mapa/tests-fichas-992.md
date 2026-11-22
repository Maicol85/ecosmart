# Fichas de los casos nuevos — tanda P9 (TC-992 a TC-1003)

Doce casos. **Once caen contra `bada886`** con el mismo archivo de casos y sólo el `index.html`
distinto; **TC-1001 pasa en los dos árboles a propósito** y eso es su hallazgo.

---

## TC-992 · P9 1.1 a 1.3 — las dos secciones
Mide que las dos grillas existan y que **la del PDF vaya arriba** (por `compareDocumentPosition`);
que la de arriba nazca **vacía** y lo diga con palabras; que lo que llega del ecógrafo esté en la
biblioteca y **no** en el PDF; que la grilla de arriba sea **la misma lista** que
`infMinCapturas()`; y que la **✕ de arriba** sólo saque del PDF —la imagen sigue en la biblioteca—
**sin abrir ningún cartel** (control negativo) y diciéndolo en su `title`.

## TC-993 · P9 1.4 y 1.5 — con qué marca nace cada imagen, y la cuenta
Lo que llega del ecógrafo nace **fuera** del PDF; lo que entra por `'mano'` entra **también** al
PDF; **control negativo**: la captura del visor, por la MISMA puerta, no. Un **video** no sale en
el PDF ni se dibuja arriba, con su denominador declarado (la casilla se **agrega**, no se busca una
vacía). Y el renglón dice **fijas y cines por separado**, con el video contando como cine.

## TC-994 · P9 1.6 a 1.8 — un solo elemento, el gesto y los textos
Guardar una medición deja **UNA** tarjeta y ninguna casilla; mandarla al PDF con el **📄** no la
duplica —una casilla y **cero** tarjetas repetidas—, de verdad la manda al papel (en P8 nacía
fuera y el botón mentía) y **sella `_docId`**. El doble clic marca «ampliada» y **la palabra se ve
en las dos grillas**. Un clic abre el visor **desde las dos**. Y los dos títulos nuevos están, con
el párrafo largo de P8 ya retirado.

## TC-995 · P9 2.1 a 2.3 — el PDF de un estudio guardado (**el defecto grave**)
Cuatro imágenes, dos marcadas. Mide el disco (cuatro, con dos marcas), el reabrir (cuatro y dos,
también en la grilla de arriba) y **el PDF de verdad**: envuelve `addImage` y cuenta **sólo los
dataURL del caso**, porque el PDF dibuja además el logo y los diagramas. **Contra `bada886` da
4 de 4; hoy da 2.** Después de exportar el formulario queda como estaba, y volver a guardar
conserva la marca **y `_srcKey`**.
⚠️ Su denominador pide **sólo `CeiboImg`**, a propósito: con la grilla nueva en el denominador
caería por «no existe» y no probaría el defecto.
⚠️ No usa `__t.guardar()` dos veces: ese helper pone `_ettEditandoId` en null y el segundo guardado
crea un estudio **nuevo** con otro uuid.

## TC-996 · P9 2.5 — los cineloops sobreviven a guardar y reabrir
El cineloop queda bajo el uuid del estudio, el **uuid no cambia** al guardarlo otra vez, y al
cerrar y reabrir la tira lo vuelve a dibujar **sola** (se mide **antes** de pedir el repintado a
mano, para no tapar el defecto). Contra `bada886` cae **sólo** por el renglón nuevo: **2.5 no
reproduce.**

## TC-997 · P9 3.1 — un cineloop no entra dos veces
Dos objetos distintos con el mismo contenido dan la **misma clave**; el segundo **no entra a la
cola**; **control negativo**: otro contenido sí. Al guardar quedan **dos y no tres**. Y el reenvío
después de guardar entra a la cola —no hay con qué compararlo— pero **no se vuelve a escribir**, y
se **dice**.

## TC-998 · P9 3.2 a 3.4 — el registro y las tres opciones
El registro dice en qué destino quedó cada id y **sobrevive a recargar** (se olvida la caché en
memoria y se vuelve a leer del disco). El cartel dice **cuántas son nuevas y dónde están las
otras**, y ofrece las **tres** opciones con «solo las nuevas» primera. Elegirla lleva a la pregunta
de destino **con una sola imagen**. Con **todas** repetidas lo dice y el primer botón queda
**apagado diciendo por qué**.

## TC-999 · P9 3.5 — el texto corto
La oración principal dice **lo que llegó y lo que espera, y nada más** —sin el equipo, sin la hora
y sin la aclaración— y esas tres cosas están en la **línea de abajo**. **Control negativo**: sin
repetidas ni envío parcial, el texto de siempre. Contra `bada886` muestra el texto viejo entero.

## TC-1000 · P9 4.1 — la galería
Denominador: tres fijas y un cineloop a la vista (hay que **abrir el mes**, que nace plegado, y el
registro necesita `tipo:'loop'` o `CeiboCine.indice()` no lo devuelve). «Todas» marca las cuatro y
repinta **UNA** vez; **control negativo**: un toque suelto sí repinta. La celda del cineloop queda
marcada, **con su tilde** y con su tipo en el dataset. La cuenta nombra fijas y cines por separado,
y su miniatura se pinta.

## TC-1001 · P9 4.4 — la burbuja del cartel que termina en pantalla
Recorre el camino exacto del reporte: tanda **abierta** con su cartel («Están llegando»), la tanda
**termina sola** y el cartel pasa a su forma final, y la **✕** lo achica a la burbuja **la primera
vez**. **Pasa también contra `bada886`**, o sea que el comportamiento ya era correcto: queda como
guarda de regresión del camino que TC-971 no cubría.

## TC-1002 · P9 4.2 — el panel se pone al día tras un gesto
Con el foco **dentro** del campo del apodo y algo cambiado de verdad (se separa una dirección, que
entra en la firma), la lectura de **fondo** no repinta y el **gesto** sí. Y cuenta los
`clnkLeerEquipos(true)` de `clnkAccionEquipo`.
⚠️ Hay que **abrir todos los `<details>`**: con la sección plegada el campo no tiene caja y
`focus()` no hace nada. Y la marca va en un **hijo**: el repintado hace `textContent = ''`, que se
lleva los hijos y **deja** los atributos del contenedor.

## TC-1003 · P9 4.3 — el rótulo de la dirección
Función pura con `_clnkConexDirs` sembrado: cable → «cable directo», Wi-Fi → «red del router»,
`169.254` → «cable directo», sin emparejar → **«tipo no determinado»**. **Controles negativos**:
una dirección de esta computadora no cambia, y con dos interfaces de tipos distintos en la misma
red tampoco se afirma.
