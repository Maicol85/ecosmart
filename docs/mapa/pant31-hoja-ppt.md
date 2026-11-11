# La hoja de los documentos y la casilla de PPT de las prótesis — mapa de PANT-31

Tanda **PANT-31** (2026-11-10). Lo que esta tanda movió, por nombre de función y de constante, no
por número de línea. El módulo entero sigue mapeado en `docs/mapa/pant30-documentos-protesis.md`;
acá está **sólo lo que cambió** y por qué.

---

## 1 · El botón «Documentos», en el rincón derecho (R1)

- **Dueño:** la regla `.doc-menu-wrap`, que gana `margin-left:auto`. Nada de JS.
- Es el **mismo recurso** que usa el `span` que contiene a «📋 Evidencia» en la fila de estilo.
- ⚠️ **Los dos botones NO comparten fila**, y está medido: 575 px de `y` los separan — «Documentos»
  vive en la fila de acciones (`Regenerar Informe · Exportar PDF · Guardar Informe · Modo
  comparativo`) y «Evidencia» en la de estilo. R1 pedía además que quedara «a la altura» del otro,
  y eso **no es posible sin sacarlo de su fila**, que R1 prohíbe. Se alineó el **borde derecho**,
  que es la alternativa que R1 ofrece: las dos filas son hijas de la misma tarjeta, así que
  comparten ese borde (1405 / 1249 / 969 / 737 / 359 px a los cinco anchos, idénticos en los dos
  botones).
- La fila es `flex-wrap:wrap`: en angosto el envoltorio **baja de renglón** y el `auto` lo pega a
  la derecha de **su** renglón. Medido: la fila pasa de 44 a 96 y a 148 px de alto, con **cero**
  hermanos solapados y el centro del botón devolviendo el botón.
- Lo fija **TC-795**.

## 2 · La hoja completa en pantalla (R2)

**El defecto era una línea de CSS, y no un recorte.** `.doc-hoja-wrap` es `display:flex` y su
`align-items` computaba `normal`, o sea **stretch**: `.doc-hoja` recibía un alto **definido** igual
al alto de la caja del envoltorio (783 px medidos) en vez de crecer con su contenido, y lo que
sobraba desbordaba con `overflow:visible`. Medido en la hoja del ETE: **2.285 px de tinta contra
783 px de papel blanco**, o sea **1.502 px de texto dibujados sobre el fondo oscuro del overlay**
(2.677 px a 390 px de ventana). No había desborde horizontal ni texto recortado en ninguno de los
cinco anchos: el problema era entero vertical.

Lo que cambió:

| pieza | antes | hoy | por qué |
|---|---|---|---|
| `.doc-hoja-wrap` | `display:flex; justify-content:center` | `+ align-items:flex-start` | la hoja crece con su contenido |
| `.doc-hoja` | `width:min(820px,100%)`, `padding:26px 30px 34px`, `font-size:12.5px`, `line-height:1.5` | `flex:0 0 auto; width:210mm; min-height:297mm; padding:12mm 14mm 13mm` | es una A4 con los márgenes de `DOC_GEO` |
| el cuerpo | 12,5 px fijos para los cuatro documentos | `docRender` lo escribe en **puntos**, de `def.sz` y `def.lh` | el papel usa 10,5 / 10,2 / 8,8 pt: con un cuerpo fijo la pantalla no podía corresponder |
| los seis derivados | píxeles fijos (16, 15, 13,2, 11,5, 10,5) | `calc(var(--doc-sz) + n pt)` | el papel los calcula como «cuerpo + n pt», y en `em` no se puede: `em` es un cociente y cambia con cada documento |
| el ancho | — | **`docZoomAjustar()`** escribe `zoom` | es lo único que hace entrar la A4 en la ventana |
| la media query de 700 px | apretaba padding y cuerpo, y pasaba las casillas a UNA columna | sólo gobierna `#doc-menu` | las dos reglas rompían la correspondencia que R2 pide; el papel imprime las casillas en DOS columnas siempre |

- **`flex:0 0 auto` no es decorativo**: un item flex encoge por omisión, así que una hoja de 794 px
  dentro de un envoltorio de 366 se apretaba a 366 y **el zoom calculado salía 1** (medido).
- **`zoom` y no `transform:scale`**: `transform` no participa del flujo, así que la hoja seguiría
  reservando su alto sin escalar y dejaría cientos de píxeles de fondo oscuro debajo; habría que
  calcularle el alto a la caja y mantenerlo en cada repintado y en cada corrección a mano. `zoom`
  escala el **layout**. Y lo que importaba de verdad: **con `zoom` el clic real cae donde se ve**,
  verificado con teclado real a 390 px con la hoja a 0,461.
- **`Math.floor` y no `Math.round`**: redondear hacia arriba deja la hoja un pelo más ancha que el
  envoltorio y aparece la barra horizontal que R2 prohíbe.
- **El precio está declarado (`P31-c`)**: a 390 px el cociente da 0,46, así que un cuerpo de
  10,2 pt se ve a 6,3 px. Es geometría: una línea de A4 son unos 95 caracteres y en 366 px no hay
  forma de que sean legibles **y** completos a la vez.
- Medido en los veinte cruces (cuatro documentos × cinco anchos): **toda la tinta dentro del papel**
  (de −26 a −715 px de margen), **cero** desborde horizontal y **cero** texto recortado.
- Lo fija **TC-795**; las mediciones por ancho, `scripts/_probe_pant31hoja.mjs`.

## 3 · El pegado como texto llano (R3)

- **La hipótesis de la orden era FALSA**: la hoja **ya se editaba**. Medido con clic real y teclado
  real por CDP, el párrafo, la viñeta y la casilla de dos columnas se editan en los cinco anchos.
  La primera medición dijo lo contrario porque caía sobre `#login-overlay`
  (`z-index:2147483000`), que tapa la pantalla entera: ver `docs/INVENTARIO_P31.md`.
- **Lo que faltaba es el pegado.** Censado: la app no tenía **un solo** oyente de `paste`, así que
  un pegado real entraba con el marcado del origen (negritas, colores, fuentes, listas). Al papel
  no llegaba —`docEditado` guarda `innerText`— pero la pantalla quedaba con marcado ajeno y dejaba
  de parecerse a lo que se iba a imprimir.
- **Dueño:** un oyente **delegado en el documento**, al lado de los de Escape y del clic afuera.
  Delegado porque `docRender` reescribe el `innerHTML` de la hoja en cada repintado.
  Cancela el evento, toma `text/plain`, lo pasa por **`docSan`** —lo mismo que el papel— y lo
  inserta con `execCommand('insertText')`, con un respaldo por rango que avisa a mano (una
  inserción por rango **no** dispara `input`, y sin eso la corrección no quedaría guardada).
- **La guarda del contenedor no es defensiva**: sin `h.contains(t)` el oyente alcanzaría a toda la
  app. Lo fija el control negativo de **TC-796**.

## 4 · El cierre que pregunta (R4)

- **Dos premisas de R4 eran parcialmente falsas, medidas**: **Escape ya cerraba** la hoja (hay un
  oyente delegado propio del módulo, más el genérico del bloque de accesibilidad), y el **visor de
  la miniatura ya cierra** con Escape y con un clic afuera (`igImgVisorCablear`). Lo único que
  faltaba era el clic afuera **en la hoja** y la confirmación.
- `#doc-ov` gana `onclick="if(event.target===this)docCerrarPreguntando();"`. La guarda tiene **dos**
  motivos: sin ella un clic en la hoja burbujea y cierra con el médico escribiendo; y
  `enhanceClickables` **saltea** justamente los `[onclick]` que contienen `event.target===this`
  («overlay: clic-afuera-para-cerrar, no es botón»), así que escrito de otra forma este div se
  volvería un `role="button"` con `tabindex=0` encima de un diálogo.
- **Las funciones nuevas:** `docSinEntregar()` (hay corrección a mano y no se guardó ni se
  imprimió), `docCerrarPreguntando()` (el único que pregunta: la ✕ y Escape cierran directo, que
  es lo que la orden pide), `docConfCerrar()` (= seguir editando) y `docConfAceptar()`.
- **«Guardado o impreso» es un estado propio, `st.entregado`**, y no se deduce de `editado`: el
  médico puede corregir, guardar en «Imágenes» y seguir mirando la hoja, y ahí no hay nada que
  perder. Lo prenden `docImprimir` y `docGuardarImagen` **cuando la entrega salió bien**, y lo
  apaga la corrección siguiente, en `docEditado`.
- El diálogo `#doc-conf` vive **fuera** de `#doc-ov`, con `z-index:301`. Lleva `aria-modal` y
  **Escape lo atiende el oyente del módulo con `stopImmediatePropagation`**: el oyente genérico de
  accesibilidad busca el `[role="dialog"][aria-modal="true"]` visible más alto y le clickea el
  primer botón que empareje `/cerrar|✕|close/` — o sea **«Cerrar»**, la respuesta destructiva. Es
  el mismo recurso, y por el mismo motivo medido, que la tarjeta de un término del panel de
  Evidencia.
- El foco arranca en **«Seguir editando»**, la respuesta que no pierde nada.
- Lo fija **TC-797**.

## 5 · La constancia en tres oraciones (R5)

`DOC_DEFS.constancia.bloques()` pasa de `enc · ciudadfecha · tit · p · firma` a
`enc · ciudadfecha · tit · p · p · esp(2 mm) · p · firma`. **El texto no cambia una palabra**: lo
que cambia es dónde arranca cada oración. Medido antes de partirlo, las dos últimas frases caían a
mitad de renglón («… un ecocardiograma transtorácico. Se extiende la» cerraba la segunda línea);
hoy arrancan en 59,42 y 67,97 mm, con 8,55 mm entre las dos, y la hoja sigue siendo **una**.
Las dos frases cortas salen **sin justificar** sin necesidad de decirlo: `parrafo` nunca justifica
la última línea, y una oración de un renglón es su última línea. **La firma no se tocó** (sus 90 pt
de aire siguen). Lo fija **TC-798**.

## 6 · El logo a la izquierda y el nombre centrado (R6 y R7)

⚠️ **LA PREMISA DE R6 ERA FALSA: el círculo con las iniciales NO estaba en el rincón izquierdo.**
Medido en la línea base, salía a la **derecha** — x 189 mm de una hoja de 210 en el papel, x 1054
en pantalla con el nombre en 340. R6 pide el logo «en el lugar donde hoy sale el círculo» **y**
aclara «(rincón izquierdo)», y las dos cosas no pueden ser la misma. Se tomó el paréntesis, que es
lo que hace coherente a R7: un nombre centrado necesita el logo a un costado.

- **Dueño en el papel:** `encabezado()`, dentro de `docMaquetar`, con las constantes locales
  `LOGO_W = 18` y `LOGO_H = 14` (mm). El logo va a `x = G.ML`; sin logo, el círculo a
  `x = G.ML + 7` con `r = 7`.
- **El nombre va con `k:'c'`**, que centra en `G.W/2`: el ancho de la **hoja** y no el de la
  columna de texto. Eso es lo que hace que el PDF y la imagen salgan igual **sin una línea de
  código más**: los dos emisores dibujan de la misma lista de operaciones.
- **El ancho de envoltura descuenta el logo de los DOS lados** (`cw - 2 * (LOGO_W + 3)`): con el
  descuento asimétrico el centro del texto no sería el centro de la hoja, y un nombre largo se
  montaría sobre el logo. Verticalmente el bloque de líneas se centra en la banda del logo.
- **Dueño en pantalla:** el bloque `enc` de `docRender` y la regla `.doc-enc`, que pasa a
  `display:grid; grid-template-columns:18mm 1fr 18mm`. La **tercera columna** (`.doc-enc-hueco`)
  está vacía a propósito: sin ella el centro del nombre sería el de lo que queda **después** del
  logo. El logo es el **primer** hijo.
- **No se deforma, y las tres superficies lo logran por la misma caja**: `object-fit:contain` con
  `max-height:14mm` y `max-width:18mm` en pantalla, la caja de la operación en jsPDF, y
  `preserveAspectRatio="xMidYMid meet"` en el SVG. Probado con un logo **ancho** (300 × 50 → 68 × 11)
  y uno **cuadrado** (120 × 120 → 53 × 53): la proporción original en los dos casos.
- Medido: **0,0 px de desvío** horizontal y vertical en pantalla, y x 396,85 px en el SVG contra un
  centro de hoja de 396,85. Lo fija **TC-798**.

## 7 · Los tres consentimientos (R8)

| | antes | hoy |
|---|---|---|
| cardioversión | 8,8 / 11 pt · 1 hoja + común | **10,2 / 13,4 pt · 2 + común** |
| ETE | 10,2 / 13,4 pt · 2 + común | igual |
| test de burbujas | 8,8 / 11 pt · 1 + común | **10,2 / 13,4 pt · 2 + común** |

- **El salto va donde la orden lo pide:** antes de «Antes del estudio» en el ETE y en burbujas, y
  antes de «¿Hay otras alternativas?» en la cardioversión, **que no tiene «Antes del estudio»**.
- **Medido sobre el PDF generado de verdad** (`getNumberOfPages`), no sobre el maquetador solo: los
  dos coinciden en los cuatro documentos. Constancia 1; los tres consentimientos **3** cada uno,
  con lo informativo en la hoja 1 y la declaración en la 2.
- **La declaración y la tabla de firmas caen en la MISMA hoja** en los tres (h2 y h2). La regla no
  se tocó: la aplica el recorrido de `docMaquetar` con `altoGrupo`, que mide la **tinta**.
- **El aire de la declaración** es `aire: 5` en **su** `ul` —no en la regla general: las viñetas de
  riesgos no se tocan— y da 6,49 mm de paso entre viñetas de una línea, que es exactamente
  `LH + 5 pt`. En pantalla lo pone la clase `.doc-ul-aire` (5 pt de `margin-bottom`).
- **Los 8 pt** de las dos líneas de «☐ Sí ☐ No» son dos bloques `{t:'esp', mm:2.82}`: uno arriba de
  la línea de investigación y otro arriba de la de «capacitado». Medido: 8,30 mm desde la línea
  anterior (LH 4,73 + 3,57 de blanco).
- ⚠️ **Y LA SEGUNDA DE ESAS LÍNEAS NO TENÍA CASILLAS EN EL PAPEL.** Era un `{t:'p'}` con los U+2610
  **dentro** del texto, y `docSan` los convierte en un espacio —es la misma razón por la que
  `casilla()` las dibuja—, así que se imprimía «el paciente   sí   no se encuentra capacitado»: dos
  huecos en vez de dos casillas, en una línea que el paciente tiene que marcar. El `cajas: 1` que
  llevaba era una **bandera muerta**: nadie la leía y `docBloquesNuevos` ni la copiaba, igual que
  `neg`. Hoy es un bloque **`pchk`** y **`parrafoCasillas`** la maqueta **pieza por pieza**
  dibujando un cuadrado donde está cada U+2610. No se justifica: una línea con una casilla
  justificada separa la casilla de su «sí». En pantalla `pchk` se ve igual que un `p`, porque ahí
  el U+2610 **sí** se dibuja y `docMarcar` no sanea.
- **`aire` viaja con el bloque** (`docBloquesNuevos`): sin eso la declaración pierde sus 5 pt en
  cuanto el médico corrige una palabra, porque `docRender` y el maquetador trabajan sobre **esa**
  copia y no sobre la definición. Es lo que les pasó a `cajas` y `neg`.
- Lo fijan **TC-799** y **TC-789** (adaptado).

## 8 · Las hojas comunes sin título (R9)

Sale el bloque `{t:'tit', x:'HOJAS COMUNES A LOS CONSENTIMIENTOS'}` de `docHojasComunes()`.
**Censado: no había ninguna línea explicativa debajo** — el bloque siguiente siempre fue el primer
subtítulo. Los dos subtítulos quedan y la hoja común sigue siendo **una** (h3 de 3 en los tres).
Lo fijan **TC-799** y **TC-789**.

## 9 · La tabla de firmas (R10)

- `{t:'esp', mm:6}` antes de `{t:'tfirmas'}`: medido, **6,76 mm** entre «Se firma el presente en…» y
  el borde de arriba de la tabla. El `esp` entra en el medidor de grupo, así que la paginación lo
  sabe.
- La fila «Firma» de `tablaFirmas` pasa de **14 a 16 mm**. La pantalla ya llevaba 17
  (`.doc-tf-alta`), así que lo que estaba corto era el papel.

## 10 · La casilla de PPT de «Prótesis valvulares» (R11)

Tres cambios y nada más:

1. La tarjeta cambia `data-ppt-no="…"` por **`data-ppt="protesis"`**. La casilla la inyecta
   `_labPptChkInyectar` sola, porque recorre `.lab-card[data-ppt]`.
2. `LAB_PPT_GRUPOS` gana **`{ k:'prot', lbl:'Prótesis valvulares', cards:['protesis'] }`**, justo
   después de `valv`, como en la pantalla. **Un grupo propio y no dentro de `valv`**: la sección es
   de prótesis —su denominador son los estudios con prótesis, no las válvulas nativas— y metida en
   `valv`, tildar «Valvulopatías» traería la hoja de prótesis sin pedirla y al revés. Con una sola
   tarjeta el grupo es el patrón normal del registro (`contr`, `amil`, `onco` y `tend` también
   tienen una).
3. El generador gana su hoja, `if (G('prot'))`, después de la de Valvulopatías.

- **Ningún número se calcula en el generador**: todo sale de **`_labProtStats`**, el mismo seam que
  alimentan la pantalla del Laboratorio y la sección 10 del PDF de auditoría.
- ⚠️ **EL GRÁFICO APILADO DE DOS PILAS DE LA PANTALLA NO TIENE EQUIVALENTE NATIVO EN ESTE MAZO**, y
  se midió: `_pptAddChart` se usa con **una sola serie** en las catorce hojas y en el archivo no hay
  un solo `barGrouping`. Antes que inventar un mecanismo —que la orden pide no hacer— las barras van
  con **`gBarras`**, el ayudante que ya existe, con las categorías **posición · tipo** combinadas y
  el color de cada tipo; las dos reparaciones van rotuladas **«(rep.)»**. Lo que se pierde frente a
  la pantalla es ver la pila; **ningún número se pierde**. → `P31-b`.
- **El denominador de los trastornos son los estudios CON PRÓTESIS** (`conProtParaTrast`) y no los
  que tienen prótesis o reparación, y el pie lo dice con la misma frase que la pantalla. Los dos
  trastornos que van **aparte** llevan su rótulo; los modelos con menos de 10 estudios van en gris
  con su asterisco, igual que en la pantalla.
- **Sin tildar, el mazo es IDÉNTICO**: medido generándolo de verdad, 3 diapositivas, 0 gráficos y 0
  tablas; con la casilla tildada, 4 con la hoja nueva en segundo lugar; destildada, vuelve a 3 / 0 / 0.
- Lo fijan **TC-800** y **TC-793** (con sus tres condiciones invertidas).

---

## Las sondas de esta tanda

| sonda | qué mide |
|---|---|
| `scripts/_p31cdp.mjs` | el arnés: CDP contra el Chrome del sistema, **con mouse y teclado reales** (`clic`, `escribir`, `tecla`) y `entrar()` para pasar el login |
| `scripts/_probe_pant31inv.mjs` | la TAREA 0 entera, en cinco anchos |
| `scripts/_probe_pant31hoja.mjs` | R1 a R4, con clic y teclado reales |
| `scripts/_probe_pant31enc.mjs` | R5 a R7, con logo ancho, cuadrado y sin logo |
| `scripts/_probe_pant31papel.mjs` | R8 a R10, sobre el PDF generado de verdad |
| `scripts/_probe_pant31ppt.mjs` | R11, con el mazo generado de verdad |
| `scripts/_probe_pant31ab.mjs` + `_ab_pant31diff.mjs` | el A/B de superficies (su cero de pantalla es un control negativo declarado) |
| `scripts/_mut_pant31.py` | el barrido de 44 mutaciones dirigidas |

## Tres trampas de instrumentación que esta tanda pagó

1. **`#login-overlay` tapa la pantalla entera** (`z-index:2147483000`), así que **ningún clic real
   llega a la app** y `elementFromPoint` devuelve el overlay. La primera corrida «confirmó» el
   defecto de la orden —«no se puede editar»— midiendo sobre la pantalla de login. El arnés lo
   resuelve con `entrar()`, que pone la misma marca de sesión que deja `doLogin` y cierra el aviso
   legal; **no se tipea la contraseña**.
2. **`keyDown` con texto MÁS un `char` escribe cada letra dos veces**: «XKZ» entraba como «XXKKZZ».
   Los dos tipos insertan por su cuenta en Chrome.
3. **El `s` de una operación `box` es el LADO, un número**, no un texto: leerlo como texto reventaba
   la sonda del papel en la primera casilla dibujada. Y **el aire de las dos líneas de casillas no
   se puede medir buscando su texto**: la línea de «capacitado» sale palabra por palabra y en el ETE
   hay ocho líneas de `chk2` que también empiezan con «Sí». Se mide por los **grupos** de casillas.

---

## La tanda PANT-32 (2026-11-10) movió la hoja a dos dueños

`docRender` salió **partido**: su armado de marcado pasó a **`docHojaHTML(bloques, D, editable)`**,
que el Informe llama con `editable` en verdadero y la **vista previa del editor de modelos** en
falso. Con dos armados, el día que un bloque cambie de aspecto el editor mostraría una cosa y el
papel otra. Y la hoja ya no sale sólo de `DOC_DEFS`: la `def` la decide **`docmodDef(clave)`**, que
para un incluido **sin editar** devuelve el objeto de `DOC_DEFS` **tal cual**. Todo eso, en
`docs/mapa/pant32-modelos-documentos.md`.

---

## ⚠️ PANT-33 (2026-11-10) — dos cosas de aca se movieron

1. **EL LOGO VUELVE A LA DERECHA.** Esta tanda lo habia pasado a la **izquierda** leyendo «rincon
   izquierdo» de su propia orden, y el medico lo quiere donde estaba la inicial. Medido antes de
   moverlo: el circulo caia en **x 21 mm** de una hoja de 210. Hoy el circulo cae en **189** y el
   logo en **178**, y en pantalla lo que lo mueve es el **orden del DOM** sobre la misma grilla
   `18mm 1fr 18mm`. El nombre sigue centrado en el ancho de la hoja.
2. **LA HOJA TIENE DOS MODOS.** El mismo `#doc-ov`, la misma A4 en milimetros, el mismo cuerpo en
   puntos y el mismo `docZoomAjustar` sirven ahora al Informe **y** al editor de modelos de
   Configuracion (`_docModo`). Todo lo que este mapa dice de la hoja sigue valiendo; lo que
   cambia es que `docRender` reparte por modo y que la barra tiene **dos** juegos de acciones,
   ocultados con la **clase** y no con `hidden`.

El detalle esta en **`docs/mapa/pant33-editor-hoja-blancos.md`**.
