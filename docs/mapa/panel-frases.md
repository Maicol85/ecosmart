# Mapa — el PANEL DE FRASES como columna alta (tanda «J», commit 4, 2026-10-16)

> **Mapa NUEVO.** No había ninguno de esta zona. Medido con `wc -c` ANTES de escribir.
> Sin números de línea a propósito.

---

## 1 · Lo que se arregló, y lo que NO se tocó

**Lo único que cambia es la DISPOSICIÓN.** Con el panel abierto, el informe y el EN SUMA se
angostan y quedan apilados en la columna izquierda, y las frases ocupan **una columna alta** a la
derecha, con la altura de los dos cuadros juntos. Con el panel cerrado, todo como antes.

**NO se tocó**: cómo se inserta una frase (en el cursor del textarea que tenía el foco),
agregar, editar y borrar frases, las categorías, el guardado en `localStorage`, el contenido del
panel, el **cajón desde abajo de 768 px o menos**, los tres estilos del informe ni la generación.

---

## 2 · Antes y después, estructuralmente

```
ANTES                                   DESPUÉS
.card (informe)                          .inf-cols                 ← NUEVO, flex
  .inf-wrap  [flex]                        .inf-cols-izq           ← NUEVO
    textarea#informe_texto                   .card (informe)
    .frases-slot  [la columna]                 .inf-wrap  [flex, un solo hijo]
      aside#frases-panel                         textarea#informe_texto
.card (EN SUMA)  ← a todo el ancho          .card (EN SUMA)
                                           .frases-slot            ← mudado acá
                                             aside#frases-panel
```

El panel **salió** de `.inf-wrap`, donde sólo podía tomar la altura del textarea del informe, y
es hermano del bloque izquierdo.

⚠️ **LOS DOS TEXTAREA SIGUEN SIENDO ALCANZABLES POR ID y eso es lo único que importaba.** El
recolector de `guardarInforme`, `limpiarCampos`, las rutas de restauración y la ventana de
reimpresión barren `input[id], select[id], textarea[id]` de **TODO el documento**, así que no les
importa de qué div cuelgan. `FRASES_TAS` también busca por id. Verificado.

---

## 3 · La altura la decide el bloque izquierdo, NUNCA el contenido

Es el mecanismo que `.frases-slot` ya usaba: **el SLOT ocupa la columna** y el panel va
`position:absolute; inset:0` adentro, así que hereda la altura de la fila y su contenido se
desplaza por dentro (`overflow-y:auto`).

| Regla | Valor | Por qué |
|---|---|---|
| `.inf-cols` | `display:flex; gap:10px; align-items:stretch; margin-bottom:12px` | el `stretch` es lo que le da al slot la altura de la columna izquierda |
| `.inf-cols-izq` | `flex:1 1 auto; min-width:0` | sin `min-width:0` las dos tarjetas no se achican |
| `.frases-slot` | `flex:0 0 280px; position:relative` | la orden pide entre 260 y 320 px; eran 250 cuando compartía fila con el textarea y nada más |
| `.inf-cols-izq > .card:last-child` | `margin-bottom:0` | `.card` trae 12 px y sin esto la columna llegaba 12 px más abajo que el borde del EN SUMA |

⚠️ **NI UN PORCENTAJE NI UN `vh` EN LA CADENA.** Es la lección de WebKit del Y1c: un
`flex-basis:0%` contra un contenedor de altura indefinida se resuelve a cero en algún motor y la
tarjeta colapsa. Acá todo es `auto`, `px` o `stretch`.

⚠️ **EL MARGEN SE LE DEVUELVE A `.inf-cols`**, así que con el panel cerrado el espacio hasta la
tarjeta de ETT Avanzado es exactamente el de antes.

---

## 4 · El cajón de 768 px o menos no cambia

La media query que ya existía agrega dos reglas:

```css
.inf-cols { display: block; margin-bottom: 0; }
.inf-cols-izq > .card:last-child { margin-bottom: 12px; }
```

Las dos tarjetas vuelven a ocupar el ancho entero y el panel vuelve a ser el cajón desde abajo,
que es `position:fixed` y **no depende del padre**. El slot queda en el flujo sin alto —su único
hijo es fijo—, que es lo que ya pasaba cuando vivía dentro de `.inf-wrap`.

⚠️ **NINGUNO DE LOS CONTENEDORES NUEVOS LLEVA `transform`**, y eso no es casual: un ancestro con
`transform` es bloque contenedor de cualquier `position:fixed` de adentro, y el cajón dejaría de
pegarse al borde de la ventana. Es la trampa que la tarjeta del globo ℹ ya pagó colgando del
`body`.

---

## 5 · Lo que la orden congela, y cómo se verifica

| Qué | Cómo se mide |
|---|---|
| el cursor y el texto escrito no se pierden al insertar | se escribe en el textarea, se pone el cursor en una posición y se clickea una frase: el texto previo sigue y la frase entra donde estaba el cursor |
| el foco no se mueve al abrir ni al cerrar | `frasesToggle` no toca el foco; el destino lo recuerda `_fraseTaId` por elemento |
| 20 aperturas no acumulan oyentes | nodos del DOM antes y después, y el panel cerrado al final |
| el botón ya tenía `aria-expanded` y `aria-controls` | se conservan; el panel es un `<aside>` con `aria-label` —región con nombre accesible— |

⚠️ **EL BOTÓN Y EL PANEL NO NECESITARON ACCESIBILIDAD NUEVA**, y se verificó antes de agregarla:
`#frases-btn` ya traía `aria-expanded="false"` y `aria-controls="frases-panel"`, y el panel ya era
un `<aside aria-label="Mis frases">`. Agregar un `role` encima habría sido un atributo más que
mantener sincronizado.

---

## 6 · Cómo medir esta zona

```bash
node scripts/_probe_j.mjs --solo frases     # seis anchos x dos temas, pocas y muchas frases
node scripts/test_clinico.mjs --solo TC-489
```

⚠️ **EL CUERPO DE UN CASO NO PUEDE CAMBIAR EL ANCHO DE LA VENTANA y la suite corre a 756 px**:
a ese ancho manda la media query de 768 y el panel **es** el cajón desde abajo, así que las dos
columnas no son medibles desde un caso. TC-489 fija **la regla** que las produce y **la
estructura** del DOM, y mide el cajón angosto —que es lo que la orden congela—; la maqueta
renderizada la mide la sonda, que sí tiene el canal para emular el viewport. Es el reparto de
TC-460 y TC-485.
