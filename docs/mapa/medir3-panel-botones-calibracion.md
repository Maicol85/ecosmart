# MEDIR-3 — el panel del visor, los botones, la calibración de velocidad y el FAC del VD

Mapa de la tanda **MEDIR-3** (2026-11-14), que continúa MEDIR-2 con lo que el médico pidió
después de probarla en Safari. Por **nombre de función y de constante**, no por número de línea.

Lo de MEDIR-1 y MEDIR-2 —la ventana, la barra única, el selector progresivo, la tabla, el Área por
estructura, Simpson indexado y la comunidad bloqueada— está en `docs/mapa/medir2-tabla-anahi.md` y
en el «Estado vigente» de `CLAUDE.md`; acá sólo lo que esta tanda movió.

**Lo que esta tanda NO incluye, por orden expresa**: las dos vistas (columnas, «Cerrar vista»,
«Más vista»), la casilla «A la app» y escribir en cualquier campo del informe. Eso va en el prompt
siguiente.

---

## 1 · El espacio: el negro que sobraba y el modal de 1180 px (A1)

**Medido en los ocho cruces del árbol anterior**: `#cine-lienzo` medía **828 px** y el canvas
**600**, o sea **228 px de negro pintados a los costados de la imagen**, mientras la columna de
medición no entraba y desbordaba 179 px. Tres cambios:

| pieza | antes | hoy | dónde |
|---|---|---|---|
| tope del modal | `max-width:1180px` | **`max-width:1500px`** | el marcado de `#cine-modal` en `_cineAbrir` |
| el negro | en `#cine-lienzo` | en **`#cine-recorte`** | `_vPanelHTML` |
| alto del lienzo | `56vh` / `calc(--cine-h − 230px)` | **`66vh`** / **`calc(--cine-h − 190px)`** | `_vPanelHTML` y la `@media (min-width:1100px)` |
| columna de medición | `flex:0 0 310px` | **`flex:0 0 380px`** | la misma media query |

⚠️ **EL NEGRO SE MUEVE DE ENVOLTORIO, NO SE ENCOGE EL LIENZO.** El lienzo es el que ocupa la
columna; el negro existe para **enmarcar la imagen**, no para rellenar la columna. Poniéndoselo al
envoltorio que tiene el tamaño de la imagen —`cine-recorte`— el sobrante deja de pintarse, sin un
solo cálculo de ancho. Medido: **228 → 0 px** en los ocho cruces, con el lienzo transparente y el
recorte en negro.

⚠️ **NO SE TOCA LA GEOMETRÍA DEL CANVAS, y eso es la invariante del punto A1.** El canvas sigue
midiendo `cols × filas` **en píxeles**, `_medPintar` sigue posicionando el overlay contra
`base.parentElement` —que sigue siendo `cine-recorte`— y `_medPunto` divide por `cv.width/r.width`,
así que las coordenadas de imagen y la calibración **no se enteran**. Lo fija TC-887 midiendo que
el canvas sigue en `600x500`.

⚠️ **UN ARCHIVO MÁS CHICO QUE LA CAJA NO SE AMPLÍA, y es una decisión declarada.** La imagen usa
más ancho y más alto **cuando el archivo los tiene** —un cineloop de 1016×708 pasa de 828 a 990 px
de ancho disponible—, pero un archivo de 600 px de ancho se sigue dibujando en 600: ampliarlo es
interpolar píxeles que el ecógrafo no midió, y eso **es** hacerle zoom, que la orden prohíbe. Ver
`docs/PENDIENTES.md` → **M3-c**.

---

## 2 · El selector fijo y el scroller de la tabla (A2)

Hasta MEDIR-3 el desplazamiento era de **la columna entera** (`.cine-col-der { overflow:auto }`),
así que el selector —y con él el botón «2D / Doppler / M»— se iba con el *scroll*.

- **`.cine-der-scroll`** — envoltorio **nuevo**, hijo de `.cine-col-der`, que contiene
  `cine-med-barra` y `cine-der-slot`. Lleva `flex:1 1 auto`, `min-height:0` y `overflow-y:auto`.
- **`#cine-side` es su HERMANO**, no su hijo, y lleva `flex:0 0 auto`.
- `.cine-col-der` pasa a `overflow:hidden`.

⚠️ **`flex:0 0 auto` EN EL SELECTOR NO ES DECORATIVO**: el valor inicial de un hijo flex es
`flex-shrink:1`, así que con la tabla larga el navegador le robaba alto al selector antes de
desplazar nada. Y `min-height:0` en el scroller es el otro eslabón: sin él su base `auto` significa
«no me encojas por debajo de mi contenido» y el desplazamiento vuelve a la columna. Es la misma
cadena que MEDIR-1 documenta para el modal.

**Los dos ids se conservan** —de ellos cuelgan la regla del modo mínimo, `_medEl('cine-side')` y
los casos—; lo que cambia es que hay un envoltorio en medio.

---

## 3 · Una medida por fila: la tabla en cuatro columnas (A3 y A4)

**Armador único: `_medTablaHTML(filas, pfx, destino, sueltas)`** — el cuarto parámetro es nuevo.

Las columnas pasan de cinco a **cuatro**: **Medida | Valor | Acciones | \<comunidad\>**, con la
**unidad DENTRO de la celda del valor**, el valor en **17 px / peso 700** y la unidad en **9,5 px**.

⚠️ **CON CINCO COLUMNAS NO ENTRABA, Y ESTÁ MEDIDO**: el cajón 2D desbordaba **32 px (Chrome) / 34
(WebKit)** con UNA tabla, y el Doppler **179 / 181** con dos. Hoy los dos dan **cero** en los ocho
cruces.

**Se retira `tablaCols`** —la lápida está en `_dopRender`—, que repartía las filas por `f[6]` en
**dos tablas lado a lado**: eso es lo que hacía que los títulos y las filas se pisaran, y es el
defecto de la captura del médico (**H1**). El `f[6]` de cada fila **no se retira de `_dopFilas`**:
sigue siendo un dato de la fila y lo usa el **canvas** de la tabla guardada, que no cambió.

**El nombre y la botonera ENVUELVEN** (`white-space:normal` y `flex-wrap`), que es el «si no entra,
la fila se parte en dos renglones» del pedido: una fila de `<table>` no se puede partir, pero sus
celdas sí, y lo que se parte es lo que sobra mientras el valor se queda entero en su línea.

**Las mediciones sin asignar entran en la MISMA tabla**, detrás de una fila separadora a todo el
ancho rotulada «Mediciones sin asignar a un campo» (punto A7: «nada queda apilado abajo»). **No se
retiran**: `_dopCapturar` cae en ellas cuando nadie armó un destino, y sin dibujarlas el médico
mide y el número desaparece.

### Las zonas táctiles de la fila

`.med-fbot` y `.med-info` se ven de **22 px** y **18 px** y se tocan en **44**, con el `::after`
absoluto de esta casa (PANT-2). ⚠️ **Y EL RELLENO VERTICAL DE LA CELDA ES 11 px Y NO 5, Y SALE DE
UNA MEDICIÓN**: con 5 px la fila medía 32 px, así que dos botones de filas **consecutivas** quedaban
a 32 px y sus áreas de 44 se **solapaban** — la sonda contó **cuatro** pares encimados sobre 13
botones. 22 + 11 + 11 = **44 exactos**. Es la misma cuenta que MEDIR-2 hizo para el selector
(28 + 16) y la misma trampa, pagada en el otro eje.

### `f[7]` — la etiqueta de la celda de acciones

Octavo elemento **opcional** de una fila. Sin él la celda de una fila calculada dice «calculada»,
que es lo que decía siempre. Hace falta porque la tabla del FAC del VD trae dos filas que **no
tienen campo** —se miden con el gesto de Área— pero **tampoco son calculadas**: decirles
«calculada» afirmaría que la aplicación las deriva de otra cosa.

---

## 4 · El globo ⓘ del panel de medición (A4)

| pieza | qué es |
|---|---|
| **`_MED_INFO`** | el registro, por clave |
| **`_medInfoBoton(clave, tit, txts)`** | registra los textos y devuelve el botón; filtra los nulos y los vacíos |
| **`_medInfoAbrir(clave)`** | el diálogo propio: `role="dialog"`, `aria-modal`, foco en «Entendido», Escape, y **se destruye al cerrar** |
| **`_medPanelInfo(clave)`** | lo registrado, **sin abrir el globo** — lo usan la sonda y los casos |
| **`_dopInfoTxts(faltaTxt, hayFilas)`** | el dueño único de los cinco grupos de texto del cajón Doppler |

**Nueve textos movidos y ninguno perdido**: **cinco** en el cajón Doppler (qué le falta al Vol
Eyectivo VD, qué incluye «Guardar tabla», la nota del ✏️, los descargos de `_dopDisc()` y la
leyenda de origen) y **cuatro** en el panel de velocidad. El cajón 2D publica los suyos con la
clave `d2`.

⚠️ **EL TEXTO NO PASA POR EL MARCADO**: el botón lleva una **clave** en `data-med-info` y el texto
vive en `_MED_INFO`. Con el texto en un `title` o en un `onclick` habría que escaparlo, y en un
manejador en línea el escape **no protege** —el parser decodifica la entidad ANTES de compilar el
handler—.

⚠️ **EL `z-index` ES 460, MAYOR QUE EL DEL VISOR (400)**: sin eso el globo se abre **debajo** del
overlay y el médico aprieta ⓘ y no pasa nada visible.

⚠️ **ESCAPE LLEVA `stopImmediatePropagation`**: el oyente genérico de accesibilidad de este archivo
elige el diálogo visible más alto y le aprieta «Cerrar», así que sin cortarlo Escape cerraría **el
visor** y no el globo. Es la misma guarda que la hoja de los documentos de PANT-31.

⚠️ **EL BOTÓN SE EMITE DE LA MISMA LLAMADA QUE REGISTRA LOS TEXTOS.** La primera versión llamaba a
`_medInfoBoton` **dos** veces —una para registrar y otra para pintar— y la segunda, con una lista de
relleno, **sobrescribía** los cinco textos reales: el globo abría con una sola palabra.

---

## 5 · El orden del VI y el Diam TSVI (A5)

**`_D2_FILAS_DE`** es el **dueño único** de qué fila va en qué tabla:

```
vi:  SIVd · DDVI · PPd · SIVs · DSVI · PPs        (diástole completa, después sístole)
vd:  basal · medio · longitudinal · TAPSE · Diam TSVD
ao:  senos · unión sinotubular · tubular · cayado · descendente · abdominal · **Diam TSVI**
ai:  DAP
vci: VCI
```

**La clave del Diam TSVI sigue siendo `vi.tsvi`**, o sea el alias de `ao.diam` (`_D2_ALIAS`), así
que el valor compartido con la AVA por continuidad y la ruta `diam_tsvi` al informe **quedan
intactas**: lo único que se mueve es en qué tabla se **dibuja** la fila. No se renombra a `ao.tsvi`
a propósito: de ese nombre cuelgan `_D2_ROT`, `_D2_BANDA_DE`, los dos «Limpiar» y **cinco** usos del
suite.

⚠️ **Y HUBO QUE ARREGLAR `_d2GrupoConDatos`, QUE DERIVABA EL GRUPO DEL NOMBRE DEL CAMPO**
(`c.indexOf(m + '.') === 0`). Con la fila en Aorta y la clave en `vi.`, el punto de «esta estructura
ya tiene mediciones» habría salido en **VI** —donde ya no hay ninguna fila que lo muestre— y no en
Aorta; y de ese predicado cuelgan además el aviso de «Limpiar» y la compuerta de guardado. Hoy lee
`_D2_FILAS_DE` y, por `_d2Valor`, cubre los campos propios y los alias con **una sola regla**.

⚠️ **Y DEJAR VIVA LA CADENA `else if` DE `_d2Filas` FUE UN DEFECTO MÍO QUE LA SONDA ENCONTRÓ**: esas
ramas **reasignaban** `F` con las listas viejas, así que el dueño único valía sólo para el VI y el
Diam TSVI **no se dibujaba** en Aorta —`tsviEnAo` falso en los ocho cruces mientras
`_d2GrupoConDatos('ao')` daba verdadero—. Es literalmente el patrón de «dos dueños del mismo valor»
que esto venía a cerrar, introducido al cerrarlo.

---

## 6 · «Volumen» sale (A6)

El botón de AI biplano que MEDIR-1 dejó visible y apagado con su leyenda «próximamente».
**No había nada más que sacar**: nunca llevó id de herramienta, nunca entró en `_MED_HERRS`, no
tiene `_medHerr`, ni oyente, ni gesto, ni fila de tabla. Por eso retirarlo **no toca ningún
cálculo**. La condición (E) de TC-885 quedó **invertida**.

---

## 7 · Los botones de la barra (B)

**`#cine-ov .cine-barra .btn`** fija `height`, `min-height` y `max-height` en **44 px** y
`flex:0 0 118px`. Antes `align-items:flex-start` dejaba a cada botón con su alto natural y los dos
de la clase `cine-b-alto` medían **56** contra los 44 de los otros seis.

⚠️ **EL ALTO VA CON `height` Y NO SÓLO CON `min-height`**: con el mínimo, un rótulo de dos líneas
—«Capturar + medición» a 118 px— crece por encima del resto y «todos del mismo tamaño» deja de ser
cierto en cuanto cambie un texto.

**`.cine-b-alto` queda con lápida**: la clase se sigue emitiendo —la leen tres casos del suite— pero
**no pinta nada**; lo que la neutraliza es la regla de arriba más una que le devuelve el aspecto de
un botón normal. «Guardar» y «Capturar + medición» son **acciones puntuales**, y el azul es **sólo**
del que representa un modo o una herramienta prendida: con una acción pintada igual que un modo, el
color deja de decir «esto está activo» y pasa a decir «esto es importante».

**El único azul es `cine-medir`**, el interruptor del modo, que lo pinta `_vModoSync` con
`btn-primary`. Medido: un azul prendido y **cero** apagado, en los ocho cruces.

⚠️ **Y EL CONTRASTE DEL AZUL NO LLEGABA A 4,5:1.** Blanco sobre el azul de **noche** da **3,21:1**
—medido en los cuatro cruces de tema oscuro— y 4,70 en los de tema claro; los otros siete botones dan
de 13,2 a 15,9. Hoy el rótulo lo deriva **`_medTextoSobre('--accent')`**, el mismo derivador con que
MEDIR-2 resolvió el relleno de los botones del selector: elige entre el casi negro y el blanco por
el cociente de WCAG y sobre este azul elige el oscuro — **5,96 de noche y 4,70 de día**.
**No se toca `.btn-primary` ni `--accent`**: los dos viven en la hoja global y los usa la aplicación
entera. Lo que se escribe es el color de **ese** botón, y se **borra** al apagarse.

---

## 8 · La calibración de velocidad con dos puntos y dos valores (C)

**`_medCalVelDos(yA, v0, yB, v1)`** — función **pura y expuesta**, en cm/s. Devuelve
`{ y0, cmsPorPx }` o `null`.

La cuenta sale de la **única** fórmula que lee la velocidad —`_medVelCalEn`, que es
`v(y) = (y0 − y) · k`—, para que no haya dos modelos del mismo eje:

```
v0 = (y0 − yA)·k   y   v1 = (y0 − yB)·k
restando:  k = (v0 − v1) / (yB − yA)
y de la primera:  y0 = yA + v0/k
```

**Medido con el ejemplo literal del pedido**: marcas en **0,5 y 1,0 m/s** a 400 y 300 px dan
**k = 0,5 cm/s por píxel** y el **cero en y = 500** —o sea **fuera** del tramo marcado—, y la
lectura en cada altura devuelve 50 y 100 cm/s. **El orden de las marcas no cambia nada.**

**Rechaza** el mismo valor dos veces y las marcas a menos de **5 px**, cada uno con un mensaje de
una línea.

### El gesto

**`_medVelClic`**, rama `_medCalibrandoVel`. El valor se pregunta **justo después de cada clic** y
no los dos al final: preguntados juntos hay que decirle al médico cuál prompt es cuál y eso obliga a
numerar los puntos en el dibujo. **Se pregunta en m/s** —la unidad del pedido y la del eje del
equipo— y la conversión a cm/s vive **en el borde**, una sola vez. Si el segundo punto no sirve, el
primero **se conserva** y su valor no se vuelve a pedir.

⚠️ **`medCalVelP0` ES ESTADO POR VISTA**, declarado en `_vNueva` y en el `MAPA` de accesores, no una
variable de módulo: con las dos vistas abiertas, calibrar en la A y empezar a calibrar en la B
compartirían el punto a medio marcar y el segundo clic de la B se combinaría con el valor que el
médico tipeó en la A. **Se suelta en las cinco puertas**: `medCalibrarVelocidad`,
`medCambioDeImagen`, las dos de reinicio y `medHerramienta` cuando la herramienta deja de ser `vel`.

### La línea del cero

Se dibuja en `_medPintar`, **antes** del bucle de velocidades, a todo el ancho del canvas, punteada,
en el celeste de las velocidades y con el rótulo **«0»** pegado al borde izquierdo. **Se dibuja
aunque no haya ninguna velocidad medida**, y eso es el punto: el cero ya no se marca con el mouse
sino que **sale** de los dos valores, así que puede caer donde el médico no lo espera. Medido por
píxeles: **742** de tinta en su banda y **cero** a 120 px, con su control negativo.

### El modo M apaga la herramienta

**`_medVelBloqueadaM()`** — verdadero cuando **todas** las regiones con eje declarado tienen el eje
Y en cm **y el X no en cm**, y ninguna declara velocidad. Una calibración manual puesta **manda**
sobre esto, y **sin regiones declaradas devuelve falso** —ahí es justamente donde la app ofrece
calibrar a mano—.

**Tres capas**: el botón sale apagado desde `_medSideRender` con su motivo en el `title`;
`medHerramienta` manda `vel` a `dist` con el **mismo** predicado; y el globo ⓘ lo explica.

⚠️ **LA CONDICIÓN ES `uy === CM` **Y** `ux !== CM`, Y LA PRIMERA VERSIÓN MIRABA SÓLO EL EJE Y.** Con
eso bloqueaba Velocidad sobre **cualquier imagen 2D** —donde los dos ejes están en cm— y con eso el
cajón Doppler dejaba de dibujarse, porque su visibilidad cuelga de que alguna vista tenga una
herramienta Doppler activa. Lo destapó la sonda: `dopTablas` pasó de 2 a **cero** en los ocho cruces.

**«Recalibrar vel.» se conserva**, y **con la escala del archivo no se pide calibrar**: eso ya era
así, acotado por `!_medRegs().length` en `medHerramienta`.

---

## 9 · El FAC del VD (D)

- **`_MED_EST_AREA`** pasa de dos entradas a **cuatro**: `ai`, `ad`, **`vdd`** («VD diást.»,
  «Área VD telediastólica») y **`vds`** («VD sist.», «Área VD telesistólica»).
- **`_MED_EST_VD_D`** y **`_MED_EST_VD_S`** — las dos fases, en un solo lugar.
- **`_medFacVD(areaD, areaS)`** — función **pura y expuesta**. Devuelve
  `{ fac, invertido }` o `null`.

⚠️ **EL VD APARECE EN DOS FASES Y NO EN UNA SOLA ENTRADA, y es lo que el FAC exige**: sale de
**dos** contornos del mismo ventrículo en dos momentos del ciclo, así que la aplicación tiene que
saber de cuál es cada uno. Con una sola entrada «VD», el segundo trazo no tendría forma de decir en
qué fase se tomó y el médico no podría corregir la sístole sin borrar la diástole.

**Los nombres largos son los de la app, palabra por palabra**: son los rótulos impresos de
`vd_area_d` y `vd_area_s`. El rótulo corto del botón es el único texto propio, porque el largo no
entra en un botón de 28 px.

**La tabla** va en el panel guía, por `_medTablaHTML` con el prefijo `vdfac`: tres filas, las dos
áreas con `f[7] = 'medida'` y el FAC con `f[7] = 'calculada'`, sin botones y en cursiva.
**La fila del FAC no se dibuja hasta tener las dos áreas.** Con la sistólica mayor que la
diastólica, un aviso de una línea.

⚠️ **`null`, `undefined` Y LA CADENA VACÍA SE RECHAZAN ANTES DE `Number`, y la primera versión no lo
hacía**: `Number(null)` es **0** y `isFinite(0)` es true, así que con la sistólica sin medir el FAC
salía **(20 − 0) / 20 = 100 %** — un número perfectamente plausible sobre un dato que no existe. Lo
encontró la sonda.

**NO ESCRIBE NINGÚN CAMPO**, y se mide: el censo de **todos** los `input`, `select` y `textarea` con
id del documento fuera del visor es **idéntico** antes y después de poner las dos áreas, y `vd_fac`
del formulario queda vacío. **Y no publica ningún corte clínico**: la app ya publica el suyo en la
pestaña VD, con su banda y su cita.

⚠️ **LA ORDEN ESCRIBE «FAC del VD (%)» Y LA APP DICE «FAC VD (%)».** Se usa el de la app, por la
regla de un solo nombre por magnitud. Declarado en `docs/PENDIENTES.md` → **M3-a**.

---

## 10 · La banda de «Vmax pulmonar» (E)

**`_DOP_BANDA_DE['pul.vmaxEp'] = 'vp_vmax'`** → **[0,2 – 8] m/s**. Es la primera de las dos
preguntas que MEDIR-2 dejó abiertas en `M2-c`, y el médico la contestó. Cumple la regla de la casa
—prestar sólo donde la pregunta es la **misma**—: `pul.vmaxEp` es la velocidad pico anterógrada de
la válvula pulmonar en m/s y `vp_vmax` es el **dueño** de esa misma magnitud en el formulario.

**Es un filtro contra errores de tipeo y no un corte diagnóstico**: el 8 no dice «por encima de esto
hay estenosis», dice «por encima de esto no es una velocidad que un Doppler pueda medir». La
conducta fuera de banda es la **misma** que la de las otras once, por `_dopNormalizar`: no se guarda
y se dice por qué, con el rango. **No se agrega ninguna rama.**

**Las dos velocidades de la IP quedan sin banda** a propósito: `ip_vmax` e `ip_vtd` no tienen rango
en `DCM_RANGO` ni en `CHM_RANGO`. Declarado en **M3-b**.

---

## 11 · Los casos

| caso | qué fija |
|---|---|
| **TC-887** | A1 y A2 y A7: el negro en cero con su denominador, el tope del modal, la columna de 380, el canvas en píxeles de imagen, el selector fuera del scroller, y la tabla que se restaura al volver a su estructura y al volver de Doppler |
| **TC-888** | B: los ocho botones del mismo tamaño fijo, el azul sólo del modo con su control negativo, el contraste de los ocho y el del prendido |
| **TC-889** | A4: los nueve textos movidos y ninguno a la vista, el globo con su diálogo, su foco, su Escape que no cierra el visor y sin dejar nodo |
| **TC-890** | C: la cuenta de los dos valores con el ejemplo del pedido, el gesto de dos prompts, la línea del cero por píxeles, y el modo M por sus tres capas con su control de imagen 2D |
| **TC-891** | D: la cuenta del FAC con sus cuatro bordes, las dos fases en el selector, la tabla con los rótulos de la app, el censo intacto y los cortes ausentes |

**Adaptados**: **TC-882** y **TC-883** (el corrimiento de celdas; TC-882 con su condición de celdas
**invertida** y TC-883 con la de la banda pulmonar **invertida**), **TC-885** (el «Volumen»
**invertido**), **TC-257** (seis campos en el VI y el gesto por Aorta), **TC-262** (el reparto en dos
tablas **invertido** y el aviso leído del globo), **TC-197** (la calibración de dos valores) y
**TC-249** (las sueltas en la misma tabla). **Los siete siguen cayendo contra `3e64801`.**

⚠️ **TC-890 CAÍA POR EXCEPCIÓN Y HUBO QUE CERRARLO**: `_medCalVelP0` no existe en la línea base y un
acceso pelado tira `ReferenceError` que se lleva el caso entero —la condición «sin excepciones» sale
roja y las veinticuatro de abajo no llegan a evaluarse—. Se lee por `window.`, que devuelve
`undefined` sin lanzar. Es lo que TC-827 tuvo que deshacer en PANT-37.

## 12 · La sonda de dos motores

`scripts/_probe_medir3.mjs` mide, en **Chrome y WebKit × 1440×900 y 1280×800 × los dos temas
reales** (puestos por `ett_theme` + `loadTheme()`, y la sonda **devuelve** cuál quedó): la geometría
del panel, el negro por el envoltorio que lo lleva, el scroller, los ocho botones con su contraste,
la tabla de cuatro columnas con sus pares lado a lado y su desborde, el tamaño del valor y de la
unidad, las áreas táctiles de la fila con sus solapes, el globo, el orden del VI, el Diam TSVI en
Aorta, A7 en sus dos formas, la calibración de dos valores, el FAC y la banda pulmonar. Lleva su
**detector de que son dos árboles** (`tieneLoNuevo`).

⚠️ **EL FIXTURE TRAE LAS DOS REGIONES, 2D Y DOPPLER**, como un DICOM de verdad. Con una sola región
2D la herramienta Velocidad queda fuera de juego y el cajón Doppler no se dibuja: la primera corrida
de esta sonda midió **cero** tablas sobre un cajón que funciona.

---

## ⚠️ MEDIR-4a (2026-11-15) — LO QUE DE ESTA SECCIÓN SE MOVIÓ

Tres cosas de este mapa cambiaron en la tanda siguiente, y van acá para que no se lean viejas:

1. **La barra tiene SIETE botones y no ocho.** «➕ Vista» y «Cerrar» se mudaron al encabezado del
   modal —son controles del modal y en la barra de la vista A eran dos más que en la de la B— y
   entró «✕ Cerrar vista», que ahora se emite en las **dos** vistas. Lo fija TC-888, adaptado.
2. **La columna de medición mide 340 px con dos vistas** (los 380 se conservan con una sola), con
   su propio corte en **1369 px**; por debajo, las medidas bajan debajo de su imagen.
3. **La tabla de una medida por fila tiene TRES columnas**: la cuarta, la casilla de Anahí, se
   retiró por orden del médico.

Y los dos cajones **ya no viven siempre en la columna de la vista A**: se mudan a la ranura de la
vista que se está midiendo (`_vSlotSync`). El mapa de esa tanda es
`docs/mapa/medir4a-vistas-cierre.md`.
