# Fichas de los casos TC-795 a TC-800 — tanda PANT-31

Archivo propio y no una sección de `docs/mapa/tests-fichas.md`, por la misma razón de siempre:
ese archivo está a menos de 1 KB de su techo y un mapa que crece con cada tanda termina siendo
imposible de presupuestar. Los seis casos viven en `scripts/test_clinico.mjs`, después de TC-794.

**Los seis caen contra la línea base `e531b73` por condiciones y ninguno por excepción**, medido en
un worktree alternando **sólo** `index.html` con el mismo archivo de casos. **44/44 mutaciones
dirigidas muertas** (`scripts/_mut_pant31.py`).

---

## TC-795 — el botón en el rincón derecho, y la hoja COMPLETA

**Qué fija (R1 y R2).** Que los bordes derechos de «📄 Documentos ▾» y «📋 Evidencia» coincidan al
píxel; que los dos botones **NO** estén en la misma fila (que es el denominador de la decisión de
alinear por la derecha); que el botón quede pegado al borde derecho de **su** fila; que la fila
conserve sus cuatro botones y **ninguno** se superponga con el nuevo; que `.doc-hoja-wrap` lleve
`align-items:flex-start` y la hoja `flex-shrink:0`; que la hoja mida una **A4** de ancho y de alto
mínimo; que **toda la tinta quede dentro del papel blanco** por abajo y por la derecha; que no haya
desplazamiento horizontal; que el cuerpo y el interlineado de pantalla sean **los puntos de la
`def`**; que `--doc-sz` esté puesta y el título se derive de ella; que las casillas vayan en **dos**
columnas como en el papel; y que el **zoom** haga entrar la hoja en un envoltorio de 400 px y se
quede en **1** en uno de 2.000.

**La condición que fija el defecto que el médico reportó** es «toda la tinta queda DENTRO del papel
blanco, por abajo»: contra la línea base daba **+1.502 px**.

**Tres cosas de método que este caso pagó.**
- **El control del zoom era «vuelve a 1» y estaba mal**: el suite corre en una ventana de unos
  818 px, donde el cociente de reposo ya es **0,922**, así que la condición fallaba sobre una app
  sana. Hoy compara contra el valor de reposo que midió antes.
- **El tope de 1 no se probaba**: en esa misma ventana `Math.min(1, …)` no hace nada, así que la
  mutación que lo saca **sobrevivió** al primer barrido. Se cierra forzando un envoltorio de
  2.000 px, donde el cociente daría 2,48.
- **La llamada a `docZoomAjustar` iba pelada** y contra la línea base tiraba `ReferenceError`: el
  caso caía por **excepción** y no por condición, o sea sin decir qué falta. Hoy la ausencia de la
  función es una condición.

## TC-796 — la hoja se edita y lo pegado entra como texto llano

**Qué fija (R3).** Que el párrafo sea `isContentEditable`; que una corrección quede registrada
(`docSinEntregar()`); que un `paste` **se cancele** —lo maneja la app y no el navegador—; que el
texto entre; que **no** entre marcado del origen, **ni como elementos ni como texto literal**; que
la raya larga quede convertida y el glifo de casilla fuera —lo mismo que `docSan` hace con el
papel—; que los espacios de más se colapsen; y que el visor de «Imágenes guardadas» sea un `<img>`
y no un editable.

**El control negativo** es un `paste` sobre el textarea del informe: **no se cancela**. Sin él, un
oyente puesto en el documento sin la guarda del contenedor pasaría igual — y es la mutación 16.

⚠️ **El teclado real no se mide acá.** Un `KeyboardEvent` despachado desde la página **no escribe**
en un `contenteditable`: no tiene acción por omisión. Lo que este caso mide es el camino que el
oyente de `input` registra. **El teclado de verdad lo mide `scripts/_probe_pant31hoja.mjs`**, que
habla CDP con `Input.dispatchKeyEvent`, en los cinco anchos.

⚠️ **Y la condición «entró sin marcado» contando elementos no alcanzaba**: pegando el `text/html`,
`execCommand('insertText')` lo mete como **texto**, así que no aparece ni un `<b>` y la condición
pasaba igual — la mutación 13 sobrevivió al primer barrido. Hoy exige además que no haya ningún
signo de marcado en el texto.

## TC-797 — el cierre que pregunta

**Qué fija (R4).** Que `#doc-ov` declare su cierre con la guarda `event.target===this`; que **sin**
correcciones el clic en el fondo cierre directo y **no** pregunte; que un clic **dentro** no cierre;
que **con** correcciones pregunte con el texto exacto y sus dos respuestas; que el foco arranque en
«Seguir editando»; que «Seguir editando» deje la hoja abierta y «Cerrar» la cierre; que **Escape
sobre la pregunta** signifique seguir editando; que la **cruz** y **Escape sobre la hoja** cierren
directo aunque haya correcciones; y que **imprimir** apague la pregunta.

**El denominador se limpia primero, con `docActualizarDatos()`**: `_docEst` vive en memoria **por
clave** y la prueba de pegado de TC-796 deja la constancia **editada**. Sin eso, el primer clic en
el fondo preguntaba —correctamente— y la condición lo leía como «el fondo no cierra».

⚠️ **El corte del Escape se mide con un CENTINELA y no por el estado final.** El oyente genérico del
bloque de accesibilidad elige el `[role="dialog"][aria-modal="true"]` visible **más alto** del
documento, y en este árbol ése no siempre es la hoja, así que sacar el `stopImmediatePropagation`
**no se veía** en el estado final: la mutación 20 sobrevivió al primer barrido. Hoy el caso registra
un oyente propio **después** del del módulo —que es la posición del genérico— y exige que el evento
**no** le llegue, con el control negativo de que sin la pregunta abierta **sí** le llega.

## TC-798 — la constancia en tres oraciones, el logo y el nombre

**Qué fija (R5, R6 y R7).** Que la constancia sean los ocho bloques
`enc,ciudadfecha,tit,p,p,esp,p,firma` con **tres** párrafos, que las dos frases ya no vayan pegadas,
que en el papel **cada una arranque su renglón** con más de un renglón de separación, y que la hoja
siga siendo una. Y, en **tres escenas** —sin logo, logo ancho de 300 × 50 y logo cuadrado de
120 × 120—: que el papel dibuje el logo en `x = ML` con la caja de 18 × 14 mm, o el círculo en
`ML + 7` con sus dos iniciales; que el nombre vaya **centrado**; que la **imagen guardada** centre el
nombre en el mismo punto y ponga el logo a la izquierda con `preserveAspectRatio`; que la
**pantalla** reparta el encabezado en **tres** columnas con el logo como primer hijo y el nombre
centrado en la hoja; y que el logo **no se deforme**, comparando la proporción dibujada contra
`naturalWidth/naturalHeight`.

**Los dos logos se generan con un canvas en la propia página**, así que son `data:image/png`
válidos y **no entra un solo archivo de la institución al repositorio**. El caso **restaura** el
logo que hubiera antes.

⚠️ **Dos cosas de método.** El `<img>` se mide **después de `decode()`**: un `data:` URL también
carga en otro cuadro, y medido antes informaba `0x0` con `naturalWidth` 0, o sea «el logo no está»
sobre un logo que sí estaba. Y los índices de los párrafos se leen con un respaldo: contra un árbol
de **un** párrafo, `ps[1]` es `undefined` y `.indexOf` tiraba `TypeError` — el caso caía por
excepción.

## TC-799 — los tres consentimientos, las hojas comunes y la tabla de firmas

**Qué fija (R8, R9 y R10).** Para cada uno de los tres: cuerpo **10,2 pt**, interlineado **13,4**,
`def.hojas` **2**; el **PDF generado de verdad** con **tres** hojas y el maquetador diciendo lo
mismo; el **salto** dejando su sección arrancando la hoja 2 —«¿Hay otras alternativas?» en la
cardioversión, «Antes del estudio» en los otros dos—; la declaración y la tabla de firmas en la
**misma** hoja; las hojas comunes como **última** y **una**, con la revocación en la misma, y **sin**
el título de archivo; **al menos 6 mm** entre «Se firma el presente» y la tabla; la fila «Firma» de
**al menos 16 mm**; las **dos** casillas **dibujadas** de la línea de «capacitado» y las dos de la
de investigación; los **8 pt** de aire arriba de cada una; que la declaración declare `aire: 5`; y
que en el papel haya al menos un paso de **exactamente** un renglón más 5 pt. Más, una vez,
que `docHojasComunes()` no traiga ningún bloque `tit` y conserve sus **dos** `sec`.

⚠️ **Las casillas y su aire se miden por GRUPOS de casillas y no buscando su texto.**
`parrafoCasillas` emite una operación **por palabra**, así que la primera dice «El» y no la oración
entera; y en el ETE hay **ocho** líneas de `chk2` que también empiezan con «Sí», 25 líneas antes.
Buscando el texto, la medición daba `null` o medía otra línea.

## TC-800 — la casilla de PPT y la diapositiva

**Qué fija (R11).** Que la tarjeta declare `data-ppt="protesis"` y **ya no** `data-ppt-no`; que
tenga la casilla «PPT» con el mismo `title` y la clave del input; que **mida lo mismo** que la de
«Valvulopatías» con área táctil de 44 px y anclada al borde derecho de su cabecera; que **sin
preferencia guardada no esté marcada**; que los **dos asserts** de arranque sigan limpios en sus
cinco direcciones; que «protesis» pertenezca a **exactamente un** grupo, que ese grupo sea **propio**
y de una sola tarjeta, y que vaya **justo después** del de Valvulopatías. Y el **mazo generado de
verdad**, espiando el constructor de PptxGenJS: **sin** tildar no trae la hoja ni ningún gráfico ni
tabla; **con** tildar aparece la hoja, el mazo tiene **una diapositiva más**, publica los estudios
con prótesis y el «con alguna alteración» sobre los estudios **con prótesis**, trae **dos** gráficos,
las categorías combinan **posición y tipo**, las reparaciones van rotuladas **«(rep.)»**, está la
tabla de modelos, y el pie declara que las reparaciones no son prótesis y que los trastornos salen
del texto del informe.

**El control** es destildar: el mazo vuelve **exacto** al de antes —mismas diapositivas, cero
gráficos, cero tablas— y la hoja no deja residuo.

⚠️ **Hay que abrir la pestaña Y la sub-pestaña «Mediciones»**, y es un 0×0 en dos escalones: con el
Laboratorio en otra pestaña, o abierto en «General», el panel de Mediciones es `display:none` y
**toda** su geometría da 0×0 — la casilla de «Valvulopatías» incluida. Lo delata que la casilla de
comparación mida 0×0 también.

⚠️ **La preferencia se limpia antes de medir el estado por omisión** y se restaura al final: vive en
`localStorage` y sobrevive a todo, así que sin eso el caso mide lo que dejó otra corrida.
