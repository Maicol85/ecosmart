# El 3D de la válvula mitral dentro de ETE — tanda «Y3» (2026-10-16)

Mapa de la zona. **Por nombre de función y de id, no por número de línea**: la línea cambia en
cada edición, el nombre no.

> Lo que gradúa sigue siendo la pestaña Válvulas. Este panel **no calcula nada**: lee.

---

## 1 · Dónde vive y quién lo ve

Dentro de la pestaña **ETE**, en la sección `ete-seccion-mitral`, al lado de la **Vista Quirúrgica**
(`#ete-svg-qx`). El botón `#m3d-btn` va a la derecha de «Incluir en PDF» (`#ete-qx-pdf`).

⚠️ **NO HAY NINGÚN CONTROL DE PLAN NUEVO.** El panel vive dentro de la pestaña ETE, así que lo ve
exactamente quien ya ve ETE: el plan lo sigue aplicando `applyViewMode()` escondiendo el botón del
rail, como hasta hoy. `showTab` no chequea el plan —eso es H8 y sigue abierto—, pero eso no cambia
con este panel.

⚠️ **SÓLO VÁLVULA MITRAL NATIVA.** `m3dEsProtesis()` pregunta por `valvEsProtesis(vm_morf.value)`,
el **mismo dueño del predicado** que usa `protNoGradua`, y no por una segunda lista de opciones.
`m3dBotonSync()` esconde el botón con prótesis y cierra el panel si estaba abierto.

---

## 2 · Las piezas, por nombre

| Pieza | Qué hace |
|---|---|
| `m3dAbrir` / `m3dCerrar` / `m3dTog` | abren y cierran. `m3dVisible()` decide por `hidden` |
| `m3dBotonSync` | el botón existe o no, según la morfología. Entra en `RECALC_MODULOS` |
| `m3dEstado` | **el lector único**: llama a `v2dEstado()` y le agrega lo de ETE |
| `m3dSync` | vuelve a leer y repinta todo: dibujo, tarjetas, tabla y descripción |
| `m3dPintar` | el cuadro. Lee las variables de color de la app en CADA cuadro |
| `m3dCtx` | dimensiona el lienzo y fija el encuadre. Acota la densidad a 2 |
| `m3dArrancar` / `m3dParar` / `m3dCorriendo` | el bucle. Sólo existe con el panel abierto |
| `m3dVista` / `m3dAngulo` / `m3dCamaraAplicar` | las tres vistas y los cinco ángulos |
| `m3dTarjetas` | la columna de grados, del objeto que `v2dEstado` ya arma |
| `m3dTabla` | la tabla de datos medidos |
| `m3dDescribir` | la descripción corta y el `aria-label` del lienzo |
| `m3dRotulosExtra` | las siglas de los senos aórticos y las comisuras |
| `_m3dAortica` / `_m3dOrejuela` | las valvas aórticas y el humo del trombo |

---

## 3 · El lector: de dónde sale cada cosa

| Dato del dibujo | De dónde sale | Dueño |
|---|---|---|
| grado de la IM y de la EM | `v2dEstado()` → `E.im`, `E.em` | la pastilla de severidad |
| tarjetas de grado | `v2dEstado()` → `E.insuf`, `E.esten`, filtradas a Mitral | el mismo |
| tamaño de la aurícula | `v2dEstado()` → `E.dai` (categoría de `ai-interp`) | el cuadro de la AI |
| estado de los seis festones | los espejos `ete_seg_A1`…`ete_seg_P3` | la vista quirúrgica |
| vena contracta | el campo `im_vc` | el médico |
| área valvular | la **peor** de `emCategoria().fuentes` | `emCategoria` |
| diámetro anular | el campo `ete_diam_anular` | el médico |
| trombo de orejuela | `oai_trombo` en `si` o `sospecha` | el médico |

⚠️ **EL TAMAÑO DEL CHORRO SALE DEL GRADO PUBLICADO**, no de la EROA medida: es lo que la orden
pide. Se escribe en `_m3dSt.eroa`, que es la misma variable con la que la demo manejaba su
deslizador, así que **toda su geometría queda sin tocar**. Sin grado no hay chorro.

⚠️ **EL CUELLO SALE DE LA VENA CONTRACTA MEDIDA cuando la hay**, y si no de una proporcional al
grado. **La descripción de texto dice cuál de las dos se usó**, para que nadie lea el dibujo como
una medición.

⚠️ **LA AURÍCULA SE AGRANDA CON LA CATEGORÍA QUE LA APP YA PUBLICA**, y no con el grado del
chorro, que es como lo hacía la demo (`aiAuto()`). Usar el grado ahí dibujaría una aurícula que
contradice la fila que el médico tiene delante.

---

## 4 · Las vistas y los ángulos CONVIVEN SIENDO EXCLUYENTES

Es como lo resuelve la demo: su botón de vista llama a `clearTee()` y su botón de ángulo deja la
vista sin marcar. Son **dos formas de poner la misma cámara**, no dos ejes que se compongan.
Componerlos obligaría a inventar qué significa «vista del cirujano a 60 grados», que la demo no
define: ante el conflicto, lo conservador es reproducir lo que la demo ya hace.

Los **ocho** llevan `aria-pressed` y son `<button type="button">` de verdad, así que el teclado
funciona sin un oyente propio.

**Qué se rotula en cada corte** (tabla de la demo, `M3D_VIS` y `m3dRotulosExtra`):

| Corte | Festones visibles | Siglas |
|---|---|---|
| vista libre (las tres) | los seis | VCD · VCI · VNC · AL · PM |
| 0° | A2 A3 P1 P2 | ninguna |
| 45° y 60° | P3 A2 P1 | AL · PM |
| 90° | P3 A1 A2 A3 | ninguna |
| 120° | A2 P2 | VCD · VNC (la VCI queda detrás del plano) |

Rotular una comisura en un corte que no la atraviesa es afirmar que se la vio.

---

## 5 · Las comisuras: estaban INVERTIDAS (Y3-1)

En la vista del cirujano —desde la aurícula izquierda, con la aorta arriba— la **orejuela queda
del lado de la comisura ANTEROLATERAL**. En el dibujo 2D la orejuela está en `x=68` y A1/P1 en
`x≈130`, los dos a la izquierda, y el rótulo de ese lado decía **PM**.

**Fuente verificada:** ASE/SCA/STS 2020, Nicoara et al, JASE 33(6), **folio 695** — orienta la
válvula con la aórtica a las 12 vista desde la aurícula izquierda y declara que el tabique
interauricular queda junto a la comisura **medial** y la orejuela junto a la **lateral**.

⚠️ **LA REGLA DE FOLIO DE ESE DOCUMENTO NO ES «página + 1»: es página del PDF + 691**, comprobado
en el pie impreso de tres páginas (PDF 1 → 692, PDF 4 → 695, PDF 5 → 696).

**Son DOS copias y hay que corregir las dos:** el SVG `#ete-svg-qx` y `eteQxDataURL()`, la copia en
canvas que viaja al PDF por «Incluir en PDF». Arreglar una sola publicaría una nomenclatura en
pantalla y la contraria en el papel firmado.

**No se movió un píxel del dibujo:** los seis `ete-qx-*` conservan su `d` y la orejuela sigue en
`68,156`. Es una corrección de nomenclatura.

**Lo que NO se tocó, declarado:** la proyección **transgástrica** de `ETE_PROYECCIONES` tiene AL a
la izquierda junto a A1/P1 y PM a la derecha junto a A3/P3 — su par es internamente **coherente**,
así que no hay nada que invertir. Si esa vista entera debería ir espejada por ser desde el
ventrículo es otra pregunta, sobre el dibujo y no sobre los rótulos.

---

## 6 · La maqueta, y por qué no usa porcentajes

⚠️ **NI UNA ALTURA EN PORCENTAJE, Y EL LIENZO CON ALTO FIJO EN PX.** Las dos reglas salen de dos
defectos MEDIDOS en la vista 2D del Y1b, que esta tanda **no toca** pero no repite:

- en **Safari** esa tarjeta se ve colapsada a unos 60 px — alturas en porcentaje dentro de
  contenedores de alto automático, que WebKit resuelve a casi cero;
- en **Chrome** sus carteles laterales e inferiores **se mueven con el latido**, porque la caja del
  dibujo cambia de tamaño en cada cuadro y arrastra el layout de al lado.

Con el lienzo en `324×228` fijos, lo que el dibujo haga adentro **no puede mover nada de afuera**.

⚠️ **Y LA TRANSICIÓN VA SOBRE EL ANCHO DEL PANEL, no sobre columnas de grid:**
`grid-template-columns` se anima recién en Safari 16+ y el médico usa Safari. El ancho se anima en
todos, y el desplazamiento de la vista quirúrgica es la **consecuencia** de ese ancho creciendo.

**Medido** a 1200×700, 1440×800, 768×1024, 390×844 y 360×740 en los **dos temas**: cero
solapamientos y cero scroll horizontal en las diez celdas; dos columnas arriba de 768 px y **una**
abajo, en el orden del marcado.

⚠️ **A 1200 px LA VISTA QUIRÚRGICA QUEDA EN 466 px Y EL PANEL EN 500.** El contenedor de esa
tarjeta mide 978 px, así que `500+12+500` no entra. Nada se pisa y no hay scroll. A 1440 las dos
miden 500.

---

## 7 · El rendimiento

| Estado | Cuadros en 900 ms |
|---|---|
| panel cerrado | **0** |
| panel abierto | 54 |
| panel abierto, en **pausa** | **0** |
| tras cerrar | **0** |

Se mide **espiando `requestAnimationFrame`**, no leyendo una bandera que el propio código escribe.
El bucle se desarma al cerrar, al cambiar de pestaña, en «Nuevo estudio», al pasar a prótesis y
con la pestaña del navegador oculta. Con `prefers-reduced-motion` no hay bucle: un cuadro fijo.

**20 aperturas y cierres:** 11725 nodos → 11725, el panel termina **cerrado** y sin bucle.

**Densidad de píxeles acotada a 2** (`M3D_DPR_MAX`).

---

## 8 · La tabla de datos

Título «Datos usados en el dibujo (Mediciones ETE · válvula mitral)». Cuatro grupos, **una fila por
grupo**: Válvula, Severidad, Plástica mitral y TEER.

⚠️ **SOLO VALORES, NINGUNA CONCLUSIÓN.** Ni una recomendación, ni un veredicto, ni un «apto» o «no
apto». Lo que interpreta esos números ya está en la pantalla de Factibilidad plástica y en la de
TEER.

⚠️ **EL NOMBRE DE CADA DATO SE LEE DE SU PROPIA ETIQUETA** (`_m3dRotuloCampo`), no se escribe en la
tabla. De la etiqueta sale también la unidad, que es lo que va entre paréntesis. Un segundo juego
de nombres se separa del primero el día que uno se renombre.

- **Un grupo sin ningún dato no aparece.**
- **Sin ningún dato no hay tabla.**
- ⚠️ **«Nativa» NO ES UN DATO y no sostiene sola al grupo.** Medido antes de arreglarlo: con el
  formulario vacío la tabla aparecía igual, con una fila que decía «Válvula | Nativa», afirmando
  que algo se midió sobre una válvula que nadie tocó.
- **Diferencia menor declarada:** la EROA, la vena contracta, el volumen regurgitante y la fracción
  regurgitante viven en **Válvulas** y no en Mediciones ETE, así que se leen donde están. La orden
  los pide por nombre en el grupo de Severidad; leerlos de otro lado habría sido inventar un campo.

---

## 9 · Trampas medidas en esta tanda

1. ⚠️ **EL `[hidden]` NO ESCONDE NADA SI UNA REGLA DE AUTOR LE GANA.** `[hidden]{display:none}` vive
   en la hoja del **navegador**: `.btn{display:inline-flex}` dejaba el botón «3D» midiendo **64×44
   y visible** con `hidden` puesto —o sea la compuerta de la prótesis no servía de nada— y el
   `display:flex` del cartel de plan B publicaba «3D no disponible» **encima de un dibujo que se
   dibujaba bien**. Lo vio la GEOMETRÍA y el PNG; preguntar por la propiedad `hidden` las habría
   dado por buenas, que es como **TC-274 pasó en verde** sobre este mismo defecto. Hacen falta
   `#m3d-btn[hidden]`, `#m3d-nodisp[hidden]` y `#m3d-panel[hidden]` explícitas.
2. ⚠️ **LA SECCIÓN DE LA MITRAL DE ETE NACE PLEGADA** (`ete-seccion-mitral`, `display:none`). Sin
   abrirla, el botón, el panel y la vista quirúrgica **existen y miden 0×0**: una sonda informa «no
   abre» sobre un mecanismo perfecto.
3. ⚠️ **`m3dVisible()` NO PUEDE DEPENDER DE LA CLASE DE LA ANIMACIÓN.** `m3d-on` se agrega en el
   cuadro **siguiente** para que la transición tenga estado de partida: entre el clic y ese cuadro
   el panel estaba abierto y la función decía que no. **Veinte pares de clics terminaban con el
   panel abierto.** Y el callback de ese `requestAnimationFrame` necesita su propia guarda, o le
   agrega la clase a un panel ya cerrado.
4. ⚠️ **EN PAUSA EL BUCLE SEGUÍA GIRANDO EN VACÍO** — 54 cuadros repintando un dibujo que no cambia.
5. ⚠️ **`\s` DENTRO DEL TEMPLATE DE UNA SONDA SE COCINA A LA LETRA `s`**, otra vez: informó
   «IM severa» como «IM  evera». Y un **salto de línea escapado** dentro de un literal de cadena
   del cuerpo de un caso deja la cadena sin cerrar («Invalid or unexpected token»).
6. ⚠️ **UN REGEX LITERAL CON UN SALTO DE LÍNEA REAL ADENTRO ES ILEGAL** y tira «Invalid regular
   expression: missing /». Se arma desde una cadena con `String.fromCharCode(92)`.
7. ⚠️ **EL CUERPO DE UN CASO NO PUEDE CAMBIAR EL ANCHO DE LA VENTANA.** TC-485 mide la conducta
   **que corresponde al ancho** en el que la suite corre y declara cuál midió; la del otro ancho la
   mide la sonda, que sí tiene el canal para emular el viewport. Es el reparto de TC-460.
8. ⚠️ **EL RECORTE DE UNA CAPTURA VA EN COORDENADAS DE PÁGINA** y `getBoundingClientRect` las da del
   **viewport**: con la página desplazada el PNG sale en negro.

---

## 11 · El GIRO MANUAL — tanda «Y3b-1» (2026-10-16)

Hasta el Y3 la cámara se movía **sólo** con los tres botones de vista y los cinco de ángulo. Hoy el
dibujo se arrastra con el mouse y con el dedo, y se gira con las flechas del teclado.

**La fórmula no se eligió: es la que ya existe dos veces en el repo**, medida en el fuente de las dos:

```
R = Mry(dx · 0,01) · Mrx(dy · 0,01) · R
```

| Pieza | Demo (`2b_demo_mitral_vistas_ete.html`, líneas 261-263) | 3D de contractilidad (`lv3dCablear`) | Mitral 3D (hoy) |
|---|---|---|---|
| sensibilidad | `0.01` rad/px | `0.01` rad/px | `M3D_GIRO_K = 0.01` |
| composición | premultiplicación (marco de la PANTALLA) | la misma | la misma |
| límite de inclinación | **ninguno** | **ninguno** | **ninguno** |
| zoom por rueda o pellizco | **no** | **no** | **no** |
| umbral de «toque» | `m < 5` → `pick()` | `m < 10 && dt < 400` → cicla la motilidad | **no hay**: el lienzo no tiene nada que clickear |
| teclado | **no** | **no** | **sí** (`M3D_GIRO_TECLA`, 9 px equivalentes ≈ 5°) |

⚠️ **LAS DOS PIEZAS NO DIFIEREN EN NADA QUE IMPORTE**, así que no hubo que aplicar la regla de «la
demo manda». Lo único que difiere es el umbral de toque, y acá no existe porque el 3D de la mitral
no cicla nada al tocar: un arrastre de un píxel es un arrastre.

⚠️ **EL ZOOM QUEDA EN EL VALOR QUE LA CÁMARA TENÍA.** `pointermove` escribe **sólo** `_m3dR`, igual
que la demo. Los cinco ángulos dejan `_m3dZM` en 0,78, así que girar a mano desde un ángulo conserva
ese encuadre; al cerrar se repone en 1.

### Las piezas

| Pieza | Qué hace |
|---|---|
| `m3dGirar(dx, dy)` | el giro, y la DESMARCA de los ocho botones la primera vez del gesto |
| `m3dCablearGiro` / `m3dDescablearGiro` | ponen y quitan los oyentes; los llaman `m3dAbrir` y `m3dCerrar` |
| `m3dGiroCableado()` | si hay oyentes puestos. Lo leen la sonda y TC-488 |
| `_m3dDrag` | el estado del arrastre. `_m3dDragFin` lo cierra y saca el cursor |

⚠️ **LOS OYENTES SE PONEN AL ABRIR Y SE QUITAN AL CERRAR, y no una sola vez con una guarda de «ya
cableado» como hace `lv3dCablear`.** Las dos formas evitan la acumulación; ésta además deja el panel
cerrado **sin un solo oyente de arrastre**, que es lo que la orden pide y lo único que se puede
**medir** espiando `addEventListener` y `removeEventListener`. Medido: veinte aperturas y cierres dan
**100 contra 100** y terminan sin cablear.

⚠️ **`touch-action:none` VA SOLO SOBRE EL LIENZO.** Sin él el navegador se queda el gesto del dedo y
el arrastre no llega nunca; puesto en el panel, la **página** dejaría de desplazarse con el dedo
dentro del panel. Medido en los dos motores: `#m3d-cv` → `none`, `#m3d-panel` → `auto`.

⚠️ **LAS FLECHAS LLEVAN `preventDefault`**: sin él la página se desplaza al mismo tiempo que el
modelo gira. Medido con el lienzo centrado y `scrollY` en 628: igual antes y después.

⚠️ **AL CERRAR SE LIMPIA EL GIRO** —vista del cirujano, ángulo nulo, matriz identidad y zoom 1—
porque si no el panel reabriría con la cámara que el médico dejó en OTRO paciente y con los ocho
botones sin marcar, o sea sin ninguna pista de hacia dónde está mirando.

### Lo medido, en los dos motores

| Qué | Chrome 155 | WebKit 27.2 |
|---|---|---|
| arrastre con MOUSE cambia el dibujo | sí | sí |
| arrastre con DEDO cambia el dibujo | sí (CDP) | **no se pudo mandar** |
| el dedo NO desplaza la página | sí (`scrollY` 628 → 628) | — |
| las flechas giran y no desplazan | sí | sí |
| la rueda deja el lienzo IDÉNTICO byte por byte | sí | sí |
| cuadros con el panel cerrado / abierto / tras cerrar | 0 / 55 / 0 | 0 / 54 / 0 |
| 20 ciclos: nodos y oyentes | 11924 → 11924, add 100 = rem 100 | 11976 → 11976, 100 = 100 |

⚠️ **EL ARRASTRE CON EL DEDO EN WEBKIT NO SE PUDO MANDAR, y se declara.** La API de táctil de
Playwright sólo expone `tap`; el arrastre se manda por **CDP** (`Input.dispatchTouchEvent`), que es de
Chromium. En WebKit lo que queda medido es el `touch-action` resuelto y el arrastre con mouse.
**WebKit de Playwright no es Safari**: es el motor, con otra capa de integración.

---

## 12 · El CUADRO y la TABLA — tanda «Y3b-2» (2026-10-16)

### El cuadro: 324×228 → 340×300

El alto sube **31,6 %** y el ancho **4,9 %**. La ventana de encuadre crece en la **misma proporción**
(`M3D_VW`/`M3D_VH`: 440×310 → 462×408), así que **el modelo conserva su escala**: el factor de volcado
pasa de **0,7355** a **0,7353**, un 0,03 % más chico. Lo que crece es el marco.

`M3D_AIRE = 55` es el aire de arriba **en unidades del dibujo**: desplaza el modelo hacia abajo dentro
del marco.

⚠️ **EL 55 SALE DE MEDIR LA CAJA DE PÍXELES PINTADOS, no de mirar.** Se miden 24 celdas —tres grados
de IM × (tres vistas + cinco ángulos)— leyendo el `alpha` del lienzo: `m3dPintar` arranca con
`clearRect`, así que todo píxel con alpha es dibujo y el fondo gris lo pone el `div` de atrás.

| Vista | margen ARRIBA en HEAD | margen ARRIBA hoy |
|---|---|---|
| vista del cirujano, IM severa | **0** | **70** |
| desde el ventrículo, IM severa | 9 | **86** |
| las otras 22 celdas | **0 en 20 de ellas** | **nunca menos de 9** |

⚠️ **EL CORTE LATERAL Y LOS CINCO ÁNGULOS SIGUEN TOCANDO EL BORDE DE ABAJO, y ya lo tocaban en
HEAD.** Medido: su contenido se sale del **propio espacio de dibujo de la demo** (680×380) —con la
ventana puesta en 680×380, o sea el modelo a la mitad de escala, siguen con el margen de arriba en
cero—, así que no es algo que un marco pueda arreglar a esta escala. `docs/PENDIENTES.md` → Y3b-1.

⚠️ **LO QUE TOCA LOS BORDES SON LOS RÓTULOS**, no las valvas: los seis festones, `Ao`, `LAA` y las
siglas de `m3dRotulosExtra` se colocan con `_m3dScr` y después se separan entre sí con el barrido
`spread()`, que los empuja fuera del modelo. Es por eso que el margen de arriba tiene un piso
constante en casi todas las celdas.

### La maqueta: dos columnas

```
#m3d-cuerpo  (598 px)
  #m3d-izq  (340)         #m3d-der  (250)
    #m3d-lienzo 340x300     #m3d-grados   (la tarjeta de grado)
    #m3d-ciclo              #m3d-tabla    (los datos medidos)
#m3d-desc  (598, a todo el ancho)
```

El panel pasó de 500 a **610 px** y sus hijos de 488 a **598**. La columna derecha mide
`598 − 340 − 8 = 250 px`, dentro de los 250 a 280 que pidió la orden, y **crece con su contenido**: no
lleva alto ni desplazamiento interno.

| Ancho | panel | vista quirúrgica | lienzo | columna derecha | scroll horizontal |
|---|---|---|---|---|---|
| 1440 | 610 | 500 | 340×300 | 250 | no |
| 1200 | 610 | **356** | 340×300 | 250 | no |
| 768 | 706 | 500 | 704×300 | 706 (una columna) | no |
| 390 | 328 | 328 | 326×300 | 328 (una columna) | no |
| 360 | 298 | 298 | 296×300 | 298 (una columna) | no |

⚠️ **A 1200 px LA VISTA QUIRÚRGICA BAJA DE 466 A 356 px**, porque el contenedor de esa tarjeta mide
978 y `978 − 12 − 610 = 356`. Nada se pisa y no hay scroll. A 1440 vuelve a sus 500.

⚠️ **EL BLOQUE ANGOSTO NECESITA `align-items:stretch`.** En columna el eje transversal es el
HORIZONTAL, así que con el `flex-start` de escritorio cada columna quedaba del ancho de su contenido:
medido a 768 px, el dibujo salía en **537 px** al lado de una tabla de **281**.

### La tabla, una línea por dato

Era **una fila por grupo** con todos sus datos pegados por un punto medio, que en una columna de
250 px queda en un párrafo. Hoy cada grupo lleva su **encabezado** (`th.m3d-g`, a dos columnas) y cada
dato su propia línea con el rótulo a la izquierda y el valor a la derecha.

**El contenido no cambia**: los mismos datos, en el mismo orden, leídos de los mismos campos, sin una
sola conclusión.

⚠️ **LA UNIDAD VA PEGADA CUANDO EL SÍMBOLO LO PIDE** (`M3D_UNI_PEGADA`): el grado sexagesimal y el
porcentaje salen sin espacio (`45°`) y las unidades alfabéticas con él (`12 mm`, `1.4 cm²`), que es
como las escribe el resto de la app —`_amFila` incluido—. Antes la unidad salía **siempre** con
espacio y la pantalla publicaba «Ángulo velo posterior 45 °».

### Las dos cosas vistas en la pantalla

- **«Profundidad coaptación» aparece DOS veces y son DOS CAMPOS DISTINTOS**, censado:
  `ete_prof_coapt` (Mediciones ETE, ayuda «Normal ≤10mm») y `teer_prof_flail` (TEER, IM secundaria,
  ayuda «Excl: >10mm»). **La pestaña les pone la MISMA etiqueta a los dos**, así que no hay «nombres
  que ya usa la pestaña» con los que distinguirlos: lo que los distingue es el **encabezado de grupo**
  que la tabla ahora lleva. Inventarles un nombre sería publicar un rótulo que la pantalla no usa.
- **«Área planimetría» SE MUDÓ a «Severidad»**, y la condición de la orden se verificó antes de
  moverla: `ete_area_mitral` es el **área valvular por planimetría**, o sea un parámetro de la
  estenosis, y así lo consume la app —en el narrativo es uno de los cuatro datos que abren la oración
  de morfología, junto al score de Wilkins, que es la escala de la estenosis mitral reumática—. Queda
  al lado de `avm_plan`, que es el **mismo parámetro medido en la pestaña Válvulas**: son dos campos
  distintos y la tabla publica lo medido, no una sola lectura.

---

## 10 · Lo que NO entró, y dónde está

- **No hay captura al PDF ni al PPT.** «Incluir en PDF» sigue incluyendo **sólo** la vista
  quirúrgica, como hasta hoy. `docs/PENDIENTES.md` → **Y3-1**.
- **No hay 3D del Wilkins**, y las dos calculadoras **no se unificaron**: es la PARADA Y3-6, con su
  tabla de diferencias. `docs/PENDIENTES.md` → **Y3-7**.
- **El archivo de la demo queda sin versionar**, como estaba.
