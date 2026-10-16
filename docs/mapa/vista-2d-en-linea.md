# Mapa — LA VISTA 2D **EN LÍNEA** y los dos defectos del médico, tanda «Y1c» (2026-10-16)

Partición de `docs/mapa/vista-2d-valvulas.md`, que con esta sección adentro quedaba en **44,3 KB**
—muy por encima del techo de 35—. Ahí quedan el lector, las tarjetas, la tabla, el dibujo, el
«por qué» y el 3D de ETE; acá, **todo lo que la tanda Y1c cambió**: la ventana flotante que pasa a
panel en línea, el botón que prende y apaga, y los dos defectos que Maicol reportó.

⚠️ **ES LA QUINTA VEZ QUE ESTA REGLA SE APLICA DESPUÉS DE CRUZAR EL TECHO Y NO ANTES.** Medir con
`wc -c` **antes** de escribir, no después.

Está armado sobre un commit y **no guarda números de línea** a propósito: se busca por nombre.



El Y1 dejó una ventana flotante, el Y1b la achicó y el Y2 le puso el «por qué». El médico la usó en
**Safari** y reportó dos cosas: el panel **colapsado a unos 60 px** y, en **Chrome**, los carteles
de los costados y la tabla de abajo **moviéndose con el latido**. El Y1c convierte la ventana en un
**panel en línea** y corrige las dos — la segunda con su causa medida, la primera por construcción.

### 1 · Lo que se fue, por ser de ventana flotante

| Pieza | Estaba | Hoy |
|---|---|---|
| El envoltorio | `#v2d-ov{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.6)}` | `#v2d-ov{display:block;margin:10px 0 2px}` dentro de `#tab-valvulas` |
| Apagado | `display:none` en línea, puesto por JS | atributo **`hidden`** + `#v2d-ov[hidden]{display:none!important}` |
| La tarjeta | `position:absolute;inset:0;margin:auto;width:min(900px,94vw);height:max-content;max-height:85vh` + `display:flex;flex-direction:column` | `width:min(900px,100%);margin:0 auto` |
| El cuerpo | `overflow:auto;flex:1` | `padding:10px 12px` y nada más |
| Semántica | `role="dialog" aria-modal="true" tabindex="-1"` | `role="region" aria-labelledby="v2d-tit"` |
| Cerrar | botón `#v2d-cerrar` («× Cerrar»), clic en el overlay, Escape por el oyente genérico | **el mismo botón del pie** |
| El foco | entraba a la tarjeta y volvía al botón | **no se mueve**: se queda donde el gesto lo dejó |
| El botón | `v2dAbrir()`, `aria-haspopup="dialog"` | `v2dTog()`, `aria-pressed`, `aria-controls` |

El marcado **se mudó**: vivía al lado de los otros modales, al final del `<body>`, y hoy es el
hermano siguiente de `.v2d-pie` dentro de `#tab-valvulas`. **Nada se corre de lugar al prenderlo:**
`.v2d-pie` era el último hijo de esa pestaña, así que no hay nada debajo que empujar — medido.

⚠️ **AL SALIR `aria-modal` SALEN TAMBIÉN DOS PIEZAS DEL BLOQUE DE ACCESIBILIDAD**, y eso es lo que
hace que Escape ya no lo cierre: el oyente genérico busca el `[role="dialog"][aria-modal="true"]`
visible más alto y le clickea el primer botón cuyo `onclick` matchee `/cerrar/`; la trampa de Tab
pide lo mismo. Sin `aria-modal` y sin ese botón, este panel no entra en ninguna de las dos.

### 2 · El botón: uno solo, dos colores, el mismo texto

`#v2d-abrir` → `v2dTog()`. **No declara ni un color propio**: `btn-ghost` apagado es el reposo de
una pestaña de válvula y `btn-primary` prendido es su estado **activo**. Medido en los dos motores
y los dos temas, idéntico carácter por carácter a `#pill-insuf-mitral`:

| | apagado = pestaña en reposo | prendido = pestaña activa |
|---|---|---|
| fondo (noche / día) | `rgb(30,35,51)` / `rgb(238,241,246)` | `rgb(79,142,247)` / `rgb(47,111,224)` |
| texto | `rgb(232,236,244)` / `rgb(26,34,51)` | `rgb(255,255,255)` |
| borde | `rgb(42,48,80)` / `rgb(214,220,230)` | `rgb(255,255,255)` |

El texto es **«🫀 Ver en 2D» siempre**. Clic, Enter y Espacio lo activan, el foco se queda en él y
**no hay `:hover` declarado** en ninguna de las tres zonas (`#v2d-abrir`, `#v2d-ov`, `#v2d-card`).

### 3 · DEFECTO 2 (Chrome): la causa NO era el `viewBox`

**Reproducido y medido en los DOS motores**, recorriendo 120 fases con `v2dFase(p)`. La tabla es
la escena con las cuatro cámaras cargadas y la mitral severa:

| Elemento | Δ ancho | Δ alto | Δ x | Δ y |
|---|---|---|---|---|
| `#v2d-svg` | **0** | **0** | 0 | 0 |
| `#v2d-dibujo` · `#v2d-ciclo` · `#v2d-fase` | **87,42** | 0 | 43,70 | 0 |
| `#v2d-col-insuf` | 0 | 0 | **43,70** | 0 |
| `#v2d-col-esten` | 0 | 0 | **43,72** | 0 |
| `#v2d-cav table` | **87,42** | 0 | **43,70** | 0 |
| `.v2d-nota` · `#v2d-card` · `#v2d-abrir` | 0 | 0 | 0 | 0 |

⚠️ **LA MAGNITUD DEPENDE DE LA ESCENA, Y LAS DOS MEDIDAS SE DAN.** El **techo** de la columna es
siempre 218,25 px —el texto de fase más largo— pero el **piso** lo pone lo más ancho de la columna
en la fase corta, y ahí compite el min-content de la tabla de cavidades, que cruza las tres
columnas. Medido: con la escena de la sonda el piso es **155,25** y el recorrido **63,00 px** (las
tarjetas se mueven 31,5); con una escena de tabla más angosta el piso baja a **130,83** y el
recorrido sube a **87,42** (43,7 de desplazamiento). **Es el mismo defecto con dos números**, y por
eso lo que se arregla es la causa —la columna `auto`— y no un valor.

⚠️ **Y SÓLO PASA EN ESCRITORIO**: a 390 px la grilla es de **una** columna y ese `1fr` no depende
del contenido, así que el recorrido medido en HEAD a ese ancho es **0,00 px** en los dos motores.
Quien mida sólo en angosto concluye que el defecto no existe.

⚠️ **EL `<svg>` NO SE MUEVE NI UN PÍXEL**, así que la hipótesis del `viewBox` que Y3-2 dejaba
abierta queda descartada con medición: `fitView()` se llama **sólo** desde `v2dSync`, no por cuadro.
Lo que se movía era la columna del medio de `#v2d-grid`, que era **`auto`** y por lo tanto se
dimensionaba por el **max-content** de lo que tuviera adentro — y lo más ancho de esa columna **no
es el dibujo sino la línea de fase**, cuyo texto cambia cinco veces por ciclo:

| Fase | Ancho que pide |
|---|---|
| Sístole / eyección | 130,83 px |
| Diástole / llenado ventricular | 180,38 |
| Diástole / contracción auricular | 194,53 |
| Diástole / relajación isovolumétrica | 213,77 |
| **Sístole / contracción isovolumétrica** | **218,25** |

**El arreglo son sus dos mitades**, porque con una sola el defecto se muda:
1. `grid-template-columns:184px **240px** 184px`. Los 240 salen de medir —218,25 del texto más
   largo y 220 del lienzo—, no de un número redondo.
2. `#v2d-fase` pasa a **un solo renglón de alto fijo** (`height:15px;overflow:hidden`) con sus dos
   `<span>` en `white-space:nowrap` y `text-overflow:ellipsis`. Sin eso, un texto más largo que la
   columna envolvería en dos renglones y lo que cambiaría con la fase sería el **alto** de la fila,
   empujando la tabla de abajo. El texto completo viaja en el `title` de `#v2d-fase2`, escrito en
   **el mismo guardado** donde `render` ya decidía si el texto cambió (cinco veces por ciclo, no
   sesenta por segundo). **Medido: hoy ninguno de los cinco se recorta.**

**Después del arreglo: peor delta global 0,00 px**, en Chrome 155 y en WebKit 27.2, a 1200×700 y a
390 px, sobre 120 fases, para las dos columnas de tarjetas, la tabla, la nota, el botón, el panel,
la grilla, la columna central y la línea de fase.

### 4 · DEFECTO 1 (Safari): el mecanismo está identificado y NO reproduce

⚠️ **NO REPRODUCE EN WEBKIT 27.2**, y hay que decirlo: los **ocho** viewports medidos
(1200×700, 1440×800, 1024×768, 768×1024, 390×844, 360×740, 1200×480, 1200×380) dan números
**idénticos** a Chrome 155, con la tarjeta en 900×550,4 y sin colapso.

Lo que **sí** está medido es el mecanismo, y la aritmética cierra con el reporte:
`#v2d-cuerpo` computaba **`flex-basis: 0%`** —porque `flex:1` es `flex-grow:1;flex-shrink:1;
flex-basis:0%`—, o sea **un PORCENTAJE contra un contenedor de altura indefinida**
(`#v2d-card{height:max-content}`). Es literalmente la hipótesis que Y3-2 dejó anotada. Un WebKit
que resuelva ese porcentaje a cero deja la tarjeta en **cabecera de 53 px + dos bordes ≈ 55 px**
—«unos 60 px»— con los rótulos «Insuficiencias» y «Estenosis» asomando por el recorte de
`overflow:auto`, que es exactamente lo que el médico describe.

**El arreglo es de raíz y no depende de reproducirlo:** se fueron `flex:1`, `overflow:auto`,
`height:max-content`, `max-height:85vh` y `position:absolute`, y **no queda una sola altura en
porcentaje ni en `vh`** en toda la cadena del panel. Es la regla con la que el panel 3D de ETE se
midió bien en WebKit en la tanda anterior.

**Lo que queda para probar a mano en el Safari del médico** está en `PENDIENTES.md` → **Y1c-1**.

### 5 · El tamaño: alturas explícitas en píxeles

```
#v2d-svg{display:block;width:220px;height:300px;max-width:100%;margin:0 auto;}
@media (max-width:768px){ #v2d-svg{width:100%;height:240px;} }
```

⚠️ **LA REGLA ANGOSTA VA EN SU PROPIA MEDIA QUERY Y DESPUÉS DE LA DE ESCRITORIO.** Los dos
selectores son `#v2d-svg`, o sea la **misma especificidad**, así que gana el último de la hoja — y
el bloque angosto de `#v2d-card` está **antes**. Puesta allá, la regla no ganaba y el lienzo medía
220×300 también a 390 y a 360 px. **Una regla que no gana se lee igual que un arreglo aplicado.**
En el Y1b no se notaba porque su regla angosta acotaba con `max-height`, que le gana a `height`
por cascada de **propiedad** y no por orden.

⚠️ **EL `viewBox` ES EL MISMO PARA TODO PACIENTE**, medido idéntico con el formulario vacío y con
las cuatro cámaras dilatadas (`25.49 38.52 155.16 237.17`): `fitView` deforma el contorno con
`cv={l:0,r:0,ak:0}` y la dilatación sólo mueve los **rótulos**. Así que en la caja de 220×300 el
dibujo siempre se encuadra en **196×300** con 12 px de aire a cada lado, y el
`preserveAspectRatio` por omisión (`xMidYMid meet`) no puede recortar nada. **No se toca una curva,
un chorro ni un cuadro de la animación: se escala sólo el contenedor.**

### 6 · Lo que lo apaga solo, y lo que lo mantiene al día

**Cuatro puertas**, todas `v2dCerrar()`, que es idempotente:

| Puerta | Por qué |
|---|---|
| `showTab` | el panel vive dentro de `#tab-valvulas`; al salir, su dibujo late sobre una caja sin geometría |
| `limpiarCampos` | si no, publica las tarjetas y la tabla del paciente **anterior** sobre un formulario en blanco |
| `RECALC_MODULOS` | el embudo de las cinco rutas de restauración: abrir un estudio guardado |
| el propio botón | el segundo toque |

⚠️ **LAS DOS DEL MEDIO SON UNA DIFERENCIA CON EL Y1b Y SE DECLARA:** la ventana flotante **no** se
cerraba al limpiar ni al cargar un estudio —nadie llamaba a `v2dCerrar` fuera de sus tres caminos—.
Con el panel en línea dejarlo prendido publicaría el paciente anterior, y **ningún barrido genérico
alcanza** a los `<li>` que `v2dPintarTarjetas` crea ni al `<svg>`. Es la misma decisión que el 3D
de ETE, dos líneas más arriba en el mismo archivo.

⚠️ **`v2dVisible()` MIRA EL `hidden` QUE `v2dAbrir`/`v2dCerrar` SON DUEÑOS, NO EL `display`
COMPUTADO.** Al cambiar de pestaña, `#tab-valvulas` entero pasa a `display:none`: el computado
diría «apagado» con el panel prendido, y el apagado automático y la reanudación del latido se
quedarían sin disparar. Es la lección que `m3dVisible` ya pagó mirando la clase de la animación.

**El latido**: se arma al prender, se desarma al apagar y se frena con la **pestaña del navegador
oculta**, con el mismo oyente que el 3D de ETE. Medido espiando `requestAnimationFrame` en los dos
motores: **0 cuadros apagado, 55 prendido, 0 con la pestaña oculta y 43 al volver.** 20 aperturas y
cierres dejan **11877 nodos → 11877** y el panel apagado.

**El desplazamiento al prender**: `ov.scrollIntoView({behavior:'smooth', block:'nearest'})`, que
desplaza **lo mínimo** —si el panel ya se ve entero no mueve nada, así que abrir dos veces no
salta— e instantáneo con `prefers-reduced-motion`. **No roba el foco.** Medido a 1200×700 con la
página arriba: el botón está en `y=391`, el panel mide 634 de alto, y al prender la página baja
379 px y el panel queda en `top=66 · bottom=700`, entero dentro de la ventana.

### 7 · La sincronía en vivo — la premisa de la orden era FALSA

⚠️ **HASTA EL Y1c NO HABÍA SINCRONÍA EN VIVO, Y ESTÁ MEDIDO:** `v2dSync`, `v2dPintarTarjetas` y
`v2dPintarCav` corrían **sólo** desde `v2dAbrir`. Con la ventana flotante no se notaba porque
tapaba la pantalla entera: no había forma de tocar un campo con la vista abierta. Con el panel en
línea el médico ve el panel y los campos a la vez, así que sin esto el panel publicaría el grado
del gesto **anterior** al lado de una pastilla que ya dice otra cosa.

Lo que entra es `v2dRefrescar()`, colgado de **un oyente de documento** (`input` y `change`, en
burbuja, que es el patrón de `emContFaAvisoSync` y `vdTeiAvisoSync`: el manejador en línea del
campo corre en la fase de destino, así que cuando este llega la cadena de cálculo ya escribió el
DOM que `v2dEstado` lee).

- **Sólo repinta si el estado cambió**, comparado por su JSON (`_v2dFoto`). Tipear en un campo que
  esta vista no mira no cuesta nada — y, sobre todo, el repintado rehace los `<li>` enteros, así
  que una lista «Ver criterios» abierta se cerraría con cada tecla.
- **Las listas abiertas se reponen POR NOMBRE DE VÁLVULA** (`_v2dPqAbiertas` / `_v2dPqReponer`) y
  no por índice: si la lista cambió de largo, el contenido cambió y cerrarla es lo correcto.
- **`v2dAbrir` siembra `_v2dFoto`** con el estado que acaba de pintar, y `v2dCerrar` lo borra.

Medido en los dos motores: la IM pasa de «Severa» a «Leve» **sin reabrir**, la lista abierta sigue
abierta (1 → 1), y tipear en `nombre` no repinta nada.

⚠️ **AL REABRIR EL PANEL LAS LISTAS SIGUEN NACIENDO CERRADAS**, porque `v2dAbrir` no pasa por
`v2dRefrescar`: rehace las tarjetas desde cero. Lo que TC-484 afirma no cambió.

### 8 · Medido, en los DOS motores

| ventana | lienzo | panel | columnas | scroll interno | scroll horizontal |
|---|---|---|---|---|---|
| 1920×1080 | 220×300 | 900×634 | `184px 240px 184px` | **no** | no |
| 1440×800 | 220×300 | 900×634 | 3 | **no** | no |
| 1200×700 | 220×300 | 900×634 | 3 | **no** | no |
| 1024×768 | 220×300 | 832×634 | 3 | **no** | no |
| 768×1024 | 714×240 | 736×927 | 1 | **no** | no |
| 390×844 | 336×240 | 358×1047 | 1 | **no** | no |
| 360×740 | 306×240 | 328×1061 | 1 | **no** | no |

(Chrome 155; WebKit 27.2 da los mismos anchos y difiere entre 3 y 5 px de alto por métricas de
fuente de la nota.) **El panel apagado mide 0×0, con `display:none` y CERO controles tabulables.**

**Tamaño, antes y después a 1200×700** (escena con las cuatro cámaras cargadas):

| | Y1b (ventana) | Y1c (en línea) |
|---|---|---|
| panel | 900×494,9 flotante @150,103 | **900×634,4 en el flujo, debajo del botón** |
| cuerpo | 898×439,9 con `overflow:auto` | 898×585,4, sin desplazamiento |
| dibujo | 130,8×200 | **220×300** |
| tabla de cavidades | 518,8 de ancho | 628 |
| nota | 870×27,3 | 870×27,3 |
| columna central | **130,83 a 218,25 px, según la fase** | **240 px, fija** |

### 9 · Trampas medidas en esta tanda

- ⚠️ **UNA REGLA DE CSS RETIRADA SIGUE EN EL FUENTE SI LA NOMBRA UN COMENTARIO.** La condición de
  TC-486 que buscaba `height:clamp(200px,calc(100vh - 520px),320px)` salía **roja** porque el
  comentario que explica el retiro **nombra ese clamp**. Lo que hay que buscar es la
  **declaración completa** (`#v2d-svg{display:block;width:auto;height:clamp(`). Es la trampa de
  `.ip-ap-col2` que TC-476 ya pagó, y la pagué otra vez al escribir un `assert` del propio script
  de edición: `'aria-modal' not in bloque` falló porque mi comentario nuevo lo nombraba.
- ⚠️ **`generarInforme()` SALTA A LA PESTAÑA INFORME**, y sin volver a Válvulas el botón del pie no
  tiene geometría: la primera corrida de la sonda abortó **28 clics** y las siete escenas
  informaron las dos columnas **vacías**. La sonda abortó y lo dijo, que es lo correcto.
- ⚠️ **EN HEAD EL BOTÓN DEL PIE SÓLO ABRE**, así que un A/B que cierre con él deja el overlay
  puesto, tapando la página: los 29 clics siguientes se quedan sin blanco. La primera corrida del
  A/B informó **30 abortos** contra HEAD y «diferencias» en seis escenas que eran **el lado de HEAD
  vacío**. El cierre va por el control que cada árbol tiene (`apagar()`).
- ⚠️ **`elementFromPoint` TRABAJA EN COORDENADAS DEL VIEWPORT Y DEVUELVE `null` FUERA DE ÉL.**
  Desde que el panel es en línea cae debajo del borde inferior, y la condición del objetivo táctil
  de TC-484 salía roja con «arriba=NADA» sobre un área clicable perfecta. Hay que llevar el nodo al
  viewport antes de medir — el mismo falso que el globo del cociente TAPSE/PSAP pagó en la tanda Z.
- ⚠️ **`newPage({viewportSize})` NO EXISTE EN PLAYWRIGHT: LA CLAVE ES `viewport`.** Con la clave
  equivocada las cuatro corridas midieron **1280×720** y las dos «ventanas» dieron números
  idénticos. El mismo error está en `/tmp/wk_test.mjs`, la medición de WebKit de la tanda Y3.
- ⚠️ **UN CLIC EN UN PUNTO CUALQUIERA NO ES UN «CLIC AFUERA»**: el de (20,400) cayó sobre un botón
  del rail, `showTab` corrió y el panel se apagó — así que la sonda informó «el clic afuera cierra»
  sobre un cambio de pestaña, y encima dejó la página en otra pestaña. El clic va sobre la caja de
  `#v2d-ov`, al costado de la tarjeta, comprobando antes con `elementFromPoint` que el blanco **es**
  el envoltorio.
- ⚠️ **UN GRADO FORZADO CON `valvSev.aplicar` SOBRE UN FORMULARIO VACÍO NO PRODUCE LISTA
  «Ver criterios»**: la lista sólo nace cuando la pantalla publicó filas de criterio. La primera
  medición de la sincronía informó «1 → 1» sobre **cero** listas abiertas. Hay una escena dedicada
  (`criterios`) que gradúa la IM y la EAo con sus propios parámetros.
- ⚠️ **EL CUERPO DE UN CASO NO PUEDE EMULAR UN ANCHO NI ESPERAR AL RELOJ**: TC-486 recorre las
  fases con `v2dFase(p)` —que deja el latido en una fase fija y dibuja ese cuadro— y afirma las
  reglas de escritorio por el fuente. Los dos ciclos completos en los dos motores y los siete
  anchos los mide la sonda. Es el reparto de TC-460 y TC-483.
