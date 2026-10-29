<!-- mapa armado sobre cfc39ce, 2026-10-12; los números de línea no se guardan a propósito -->

# Mapa de funciones — Glosario del panel de Evidencia (`IND_TERMINOS`)

Archivo **aparte** de `docs/mapa/panel-evidencia.md` y no una sección más: ese mapa estaba en
**33 KB** al abrir esta tanda y `ecosmart/CLAUDE.md` manda partir antes de los ~35 KB en vez de
seguir estirando. Para el marco del panel, las preguntas, las citas y las secciones, ese archivo
sigue siendo el que hay que abrir.

Lo que vive acá: el **ⓘ de un TÉRMINO** y su tarjeta. Es el tercer mecanismo de ⓘ del panel y el
único que abre algo fuera de `#indic-cuerpo`.

---

## Los TRES ⓘ del panel, y por qué no son el mismo

| Mecanismo | Nodo | Marca | Qué muestra | Dónde |
|---|---|---|---|---|
| Nota de una pregunta | `<details>` | `data-ind-info` | la explicación de esa fila | en línea, celda de la marca |
| «Ver detalle» de la sección | `<details>` | `data-ind-detalle` | las notas largas de la sección | en línea, al pie de la sección |
| **Definición de un término** | **`<button>`** | **`data-ind-term`** | **qué ES el término, con fuente y referencia** | **tarjeta flotante, fuera del cuerpo** |

Los tres pintan **el mismo glifo** (`&#9432;`), así que cualquier cosa que los indexe por lo que se
ve los confunde — es el defecto que `_indClaveSummary` existe para cerrar.

⚠️ **EL ATRIBUTO ES PROPIO Y NO SE REUSÓ `data-ind-info`, Y EL MOTIVO ESTÁ MEDIDO.** **TC-293**
cuenta los `details[data-ind-info]` (exige ≥ 10, ninguno abierto al nacer y `aria-label` **únicos
por sección**) y **TC-328 / TC-329** llaman «hoja» a cualquier `<div>` sin divs adentro. Un ⓘ nuevo
metido en esos conjuntos les mueve el denominador sin que nada lo delate. Con atributo propio y
`<button>` en vez de `<details>`, los tres casos quedan intactos: medido, `info` sigue en 11 y 33 y
`detalle` en 1 y 9.

⚠️ **Y ES UN `<button>` DE VERDAD, NO UN `role="button"`.** Es lo contrario de lo que se hizo con el
corchete de una cita, y a propósito: a aquél hubo que agregarle una rama de `keydown` a mano porque
un `role="button"` **no dispara `click` con Enter ni con Espacio**. Acá el `<button>` sale gratis
porque el ⓘ vive en la celda del **rótulo** y no dentro de la oración de un criterio, así que el
piso táctil global de 44 px no rompe ningún renglón — le da al dedo su área, que es lo que se pide.

**El piso táctil** entra en la **misma** regla que la botonera y no en una propia:
`@media (pointer:fine){ #indic-cuerpo [data-ind-clin], #indic-cuerpo [data-ind-term]{ min-height:0;min-width:0 } }`.
Mismo número, mismo corte, mismo dueño. Medido: **18 × 12 px con puntero fino, 44 × 44 con grueso**.

---

## El registro — `IND_TERMINOS`

`Object.freeze` de entradas por `id`. Hoy **dos**: `cormier` y `score_eco`.

| Campo | Qué es |
|---|---|
| `rotulo` | el título que se pinta arriba de la tarjeta (`#indic-term-tit`) |
| `tipo` | `clasificacion` · `sigla` · `formula` · `corte` — hoy no gobierna nada visual; está para poder agrupar sin volver a tocar el componente |
| `tam` | `'chica'` (280 px) o `'ancha'` (hasta 560 px y nunca más del 92 % de la ventana) |
| `etiqueta` | el `aria-label` del botón. **Propio y distinto por término**: es lo que hace que abrir uno no abra otro |
| `que` | el «Qué es», una frase |
| `items` | lista `{t, d}` — los tres grupos de Cormier |
| `tabla` | `{titulo, componentes[], grados[], celdas[][]}` — una fila por grado, en el orden de `componentes` |
| `total` | la frase del total |
| `guia` | el «Qué dice la guía» |
| `fuente` | documento, tabla y **página**. Obligatoria |
| `referencia` | la cita completa como figura en la lista de referencias del documento. Obligatoria |

Los dos anchos y el margen viven en **`IND_TERM_TAM`** y **`IND_TERM_MARGEN`**, en el JS y no en el
CSS: los lee `_indTermColocar` para calcular la posición, así que ponerlos en la hoja los partiría
en dos dueños.

### Cómo agregar un término nuevo

1. Una entrada más en `IND_TERMINOS`, con **`fuente`, `pagina` y `referencia`**. Un término sin
   documento verificado en texto completo **no entra** — es la misma regla que el registro de citas.
2. Elegir el **tamaño**: `'chica'` para una definición de pocas líneas (los 280 px entran en
   cualquier pantalla de esta app); `'ancha'` sólo si trae tabla.
3. En la fila que lo nombra, `Object.assign(_indFila…(…), { term: '<id>' })`.
4. Nada más: ni HTML, ni CSS, ni un oyente. Un `term:` mal tipeado **no se pinta en silencio** —
   `_indTermBtnHTML` grita por `console.error` y la fila sale como siempre.
5. Si el término aparece en **más de un rótulo**, el ⓘ va en el primero y **no se duplica**. Las
   apariciones dentro de una *nota* no son rótulos y no llevan ⓘ.
6. Sumar su ancla literal a **TC-451**, que es lo que impide que el texto cambie sin volver a
   verificarlo contra la fuente.

---

## El componente

- **`_indTermBtnHTML(id)`** — el ⓘ. Se concatena **después** del rótulo ya escapado en
  `_indFilaHTML`, nunca dentro: la misma extensión aditiva que `refs` en la celda de la nota, y por
  el mismo motivo (un marcado embebido en el string saldría literal por el escape, y la única
  alternativa sería no escapar).
- **`_indTermCardHTML(id, ancho)`** — el contenido. `ancho` llega **calculado**, no medido después.
- **`_indTermTablaHTML(tb, ancho)`** — las dos formas de la tabla.
- **`_indTermColocar(id)`** — **único dueño de la geometría**. Devuelve `{w,h,left,top,caja,apilada}`
  o `null`.
- **`_indTermAbrir(id)` / `indicTermCerrar(sinFoco)` / `_indTermAbierto()`** — el estado es
  `_indTermId` y lo escriben sólo esas dos, igual que `indicMaxPoner` con `data-ind-max`.
- **`_indTermBtnDe(id)`** — busca el botón por atributo dentro de `#indic-cuerpo`.

### Dónde vive la tarjeta, y por qué ahí

`#indic-term` está en el **marcado estático**, como **hermana de `#indic-card`** dentro de
`#indic-overlay`. Tres razones, ninguna de estilo:

1. **`#indic-cuerpo` tiene `overflow:auto`**: una tarjeta de adentro se recorta al scrollear.
2. ⚠️ **`#indic-card` lleva `transform:translate(-50%,-50%)` en tamaño normal**, y un `transform`
   convierte al nodo en **bloque contenedor** de cualquier descendiente con `position:fixed`. Desde
   adentro habría que restarle el rect del padre, o sea **dos caminos de cálculo** —normal y
   maximizado, donde el CSS pone `transform:none`—. Colgada del overlay, que no lleva transform, el
   `position:fixed` vuelve a ser del viewport y el rect del botón se usa tal cual: **un** camino.
3. **Va en el marcado y no se crea al vuelo**: el `MutationObserver` del bloque de accesibilidad
   trata como modal a cualquier `<div>` **agregado** con `position:fixed` y `top:0` o `inset:0`
   (`isDynamicModal`). Una tarjeta creada por código que cayera en `top:0` entraría por ahí.

⚠️ **`role="dialog"` SIN `aria-modal`, y la ausencia es lo importante.** El oyente genérico de Escape
y la trampa de Tab buscan `[role="dialog"][aria-modal="true"]`: sin `aria-modal` la tarjeta no entra
en ninguno de los dos y el panel sigue siendo el único modal. Y no lo es: es un globo anclado a un
botón.

**Sin transición**, igual que el maximizado: no hay movimiento que animar —aparece ya colocada—, así
que `prefers-reduced-motion` queda satisfecho **por construcción**. Una media query que apagara algo
que no existe sería una promesa decorativa.

### La posición

La **caja permitida** es la intersección del viewport (menos `IND_TERM_MARGEN`) y el rect de
`#indic-card` (menos 4 px). Las dos mitades hacen falta: sólo el viewport dejaría la tarjeta
saliéndose del panel en tamaño normal (820 px centrados); sólo el panel la dejaría saliéndose de la
pantalla si el panel fuera más grande. Maximizado el panel es casi el viewport, así que la
intersección es la misma caja y **no hay un segundo camino**.

Ancho → `maxHeight` = alto de la caja → se pinta → se mide el alto → **debajo** del botón si entra,
**arriba** si no, y si no entra de ningún lado pegada al borde de arriba con el `overflow:auto`
haciendo el resto.

⚠️ **EL ACOTE FINAL `top = max(T, min(top, B − h))` NO ES REDUNDANTE, Y LO ENCONTRÓ TC-451.**
`#indic-cuerpo` **scrollea**, así que un botón que el médico dejó fuera del área visible del panel
sigue teniendo rect: el de su posición geométrica, que puede estar cientos de px por debajo del
viewport. Con ese `r0`, la rama de «arriba» daba `arriba >= T` por ser un número grande y
**positivo**, y la tarjeta se colocaba **fuera de la pantalla**: medido, `top` 132 con la caja
terminando en 455 y los cinco puntos de control devolviendo `null`.
⚠️ **POR QUÉ LA SONDA NO LO VIO:** su `clicSel` llama a `scrollIntoView` y **se niega** a clickear un
nodo fuera del viewport —la protección que este repo agregó tras una corrida colgada—, así que todas
sus escenas tenían el botón a la vista. El caso de la suite usa un `.click()` sintético, que no
scrollea nada. **El ayudante de clic de la sonda tapaba el defecto.**

**Lo que queda declarado y no se corrigió:** cuando la tarjeta no entra ni abajo ni arriba del botón
(a 1200 × 900 la del score mide 611 y la caja 844, con el botón al medio), **se superpone a su propia
fila**. Queda entera, dentro del panel y sin un pixel tapado; lo que se pierde es ver la fila
mientras se lee la tarjeta. La alternativa era recortarla y hacerla scrollear siempre.

### Las dos formas de la tabla

Corte en **`IND_TERM_TABLA_MIN = 520`**, y es el **ancho de la TARJETA**, no el del viewport.

El número está elegido contra el tope de la tarjeta ancha (560) y no al azar: por encima de 520 está
en su ancho **pleno** y la tabla de 4 componentes × 4 grados entra; por debajo es que **tuvo que
encogerse** y la misma tabla daría columnas de 80 px con prosa adentro.
⚠️ **El pedido decía «menos de unos 600 px»: con el tope en 560 esa lectura deja la forma en tabla
INALCANZABLE.** Reportado y decidido por Maicol el 2026-10-12: queda en 520.

Medido: **1200 px → tabla** (tarjeta de 560, `table-layout:fixed`, 4 filas × 5 celdas = el grado más
los cuatro componentes) · **390 px → apilada** (358) · **360 px → apilada** (328). `table-layout:fixed`
+ `width:100%` es lo que impide el scroll horizontal: sin eso una celda con una frase larga estira la
tabla por encima del ancho de la tarjeta.

### Cerrar — tres formas, y el orden del Escape

El **mismo botón**, **Escape**, y **tocar afuera** (oyente único sobre el documento, en burbuja).
Un clic **dentro** de la tarjeta no cierra: seleccionar texto de la tabla es un gesto normal.

⚠️ **ESCAPE: la tarjeta se lleva el PRIMERO, con `stopImmediatePropagation`, y la rama va ANTES de la
del maximizado.** La secuencia es: cierra la tarjeta → restaura si estaba maximizado → cierra el
panel. Con la rama después, un Escape sobre una tarjeta en un panel maximizado habría hecho las dos
cosas en el mismo golpe; y sin parar la propagación, el oyente genérico le clickea además la «✕» a
`#indic-card` y se va el panel entero.
**Precio declarado**, el mismo que el maximizado: ese Escape no llega a los oyentes posteriores del
documento (ventanas de imágenes, encabezado, ayuda). Se cierran con el Escape siguiente.

⚠️ **TAB DENTRO DE LA TARJETA LA CIERRA Y DEVUELVE EL FOCO AL BOTÓN.** La tarjeta no es modal y su
contenido es texto: no hay nada enfocable adentro, así que sin esto el Tab se iría al siguiente
enfocable del documento, que está **detrás** del overlay — el defecto que `indicAbrir` cerró para el
panel. Atrapar el Tab sin salida la volvería una trampa de teclado. **Precio: el Tab se gasta en
cerrar**, así que para seguir tabulando hace falta uno más.

### Repintado — las DOS rutas, medidas por separado

- **Por CLIC en un control clínico: la tarjeta se CIERRA.** Dispara dos oyentes —el delegado de
  `#indic-cuerpo`, que repinta y re-ancla, y el del documento, que ve un clic **fuera** de la
  tarjeta—; el del documento corre después. Es lo que el pedido llama «tocando afuera», y un control
  clínico está afuera.
- **Un repintado que NO viene de un clic RE-ANCLA.** `_indRepintarConservando` captura el `id` del
  término abierto antes de `indicRender` y lo vuelve a colocar después del scroll. La clave es el
  **`id`**, no el nodo: el nodo no sobrevive al repintado y el id sí. Si el término ya no se pinta,
  la tarjeta se va. `_indTermColocar` **no toca el foco**, que es lo que permite llamarlo ahí.
- Sin esta segunda mitad, «el re-anclaje no sirve» y «el re-anclaje está tapado por el cierre» se
  ven **exactamente igual**.

---

## Trampas de medición de esta tanda

- ⚠️ **`\s` dentro de un TEMPLATE LITERAL se cocina a la letra `s`.** El regex de la sonda quedaba
  en `/s+/g` y borraba **todas las eses** del texto, e igual informaba una diferencia de 2
  caracteres —que eran el blanco real al lado del glifo—. Se vio al **imprimir** el texto, que decía
  «caracteritica» y «defavorable». `ⓘ` sobrevivió de pura suerte, por ser un escape válido. En
  el cuerpo de una sonda va **`\\s`**.
- ⚠️ **El aviso legal VUELVE a mitad de corrida.** `#modalAvisoEco` tapa con `z-index:9999` y
  `#login-overlay` con `2147483000`: con cualquiera de los dos puesto, `elementFromPoint` devuelve
  **ese** nodo en los cinco puntos y la escena informa «tapada» sobre una tarjeta perfecta. Pasó
  **dos veces** —en TC-451 y en la sonda, en las seis escenas de 390 y 360 px, porque las de 1200
  corren antes de que reaparezca—. Es la trampa que **TC-395** ya documenta. Los dos se despejan
  **dentro del medidor**, no una vez al arranque, y su estado va al lado del veredicto.
- ⚠️ **Comparar dos mediciones de días distintos da una diferencia que no existe.** El A/B de las
  seis superficies dio 6 diferencias en el hash de los campos guardados; la medición de HEAD era del
  **11** y la nueva del **12** de octubre. Remedido HEAD el mismo día: **0 diferencias**. Misma clase
  de falso que el pendrive `DISK_IMG`.
- **`elementFromPoint` en las cuatro esquinas y el centro es lo único que distingue «no recortada» de
  «no medí el recorte»:** un rect dentro del viewport sigue siendo el mismo si el `overflow` del
  panel la recortara.

---

## Arnés

**`scripts/_probe_evidterm.mjs`** — A/B de solo lectura con `--file`. Grupos:
`texto` (hash por sección con los glifos ⓘ **y todo el blanco** descontados, que es el que responde
«idéntico a HEAD») · `tarjetas` (16 escenas: 1200 normal y maximizado, 390, 360, claro y oscuro, las
dos tarjetas) · `teclado` · `aislamiento` (con las dos rutas de repintado) · `convive`.

**Cobertura: TC-451**, nueve condiciones, tres denominadores y dos controles negativos.


---

## Puntero — la tanda «TEP» (2026-10-29)

Dos entradas nuevas del registro `VINFO`, que pasa de 60 a **62**:

- **`'tep-mcconnell'`** — el rendimiento del signo: 77 % / 94 %, VPP 71 %, VPN 96 %, que no es
  patognomónico y que el infarto del VD puede parecerse. ⚠️ Las cifras se citan **por quien las
  reproduce** (Hotelling 2024), porque el trabajo original de McConnell no está en la biblioteca.
- **`'tep-eco-dx'`** — la clase 3 «sin beneficio», nivel B-NR, y la especificidad del 64 %.
  ⚠️ Ese 64 % es la especificidad **global**, no la del paciente inestable.

Los dos botones van con `vinfo-btn-44` y miden 44×44. Ver **`docs/mapa/tep-aha2026.md`** §5 y §6.
