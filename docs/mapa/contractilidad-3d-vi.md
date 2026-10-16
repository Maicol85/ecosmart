# Mapa — CONTRACTILIDAD: el bull's eye al PDF, la fila de tres bloques y el 3D del ventrículo

Tanda **«K»** (2026-10-16). Por nombre de función y de id, **no por número de línea**.

> Hasta esta tanda la zona de Contractilidad **no tenía mapa**: lo único escrito vivía en los
> comentarios del propio `index.html` y en las sondas. Y **sigue sin tener un solo caso de la
> suite que mida el panel 3D**: `grep lv3d scripts/test_clinico.mjs` daba **cero** antes de
> TC-490, que es el primero.

---

## 1 · El botón «Incluir bull's eye en PDF» — K1

### El defecto, reproducido antes de tocar nada

Tres síntomas, los tres medidos con clics reales contra el árbol del inicio de la tanda:

| escena | HEAD | hoy |
|---|---|---|
| botón prendido, SIN trastornos sectoriales | botón ON, **PDF sin bull's eye** | PDF **con** bull's eye |
| botón prendido, con un trastorno | PDF con bull's eye | igual |
| tras «Nuevo estudio» | botón **ON** | botón OFF |
| página nueva con la clave de `localStorage` en `'1'` | botón **ON** | botón OFF |
| apagar y volver a prender | sigue al botón | igual |

### Las dos causas

1. **El PDF exigía datos además del botón.** `_incContr` era
   `localStorage.getItem('contractilidad_incluir_pdf') === '1' && contrHayDatos()`. Por eso con el
   botón prendido y sin ningún trastorno el bull's eye no salía, y **apagar y prender no lo
   arreglaba**: lo que fallaba era el segundo término. Hoy es `contrPdfOn()` y nada más.
2. **El estado era una preferencia GLOBAL.** Vivía en `localStorage`, que «Nuevo estudio» no borra
   —a propósito, según el comentario de `limpiarCampos`—, así que el botón aparecía prendido solo
   al abrir la app y al encadenar estudios.

⚠️ **EL GATE DE DATOS EXISTÍA PARA TAPAR LA FUGA DE LA PREFERENCIA GLOBAL** —el toggle del paciente
anterior metía un bull's eye entero normal en el informe del siguiente—. Con el estado en el
ESTUDIO esa fuga no existe por construcción, así que el gate sobra. Las dos cosas van juntas: con
una sola, o el bull's eye sigue sin salir, o vuelve la fuga.

### Las piezas

| Pieza | Qué hace |
|---|---|
| `contr_be_pdf` | el **campo del estudio**, `input[type=hidden]` con guión **BAJO**. `''` = apagado, `'1'` = prendido |
| `contrPdfOn()` | el único lector del estado |
| `contrPdfSync()` | repinta el botón desde el estado. Entra en `RECALC_MODULOS` |
| `toggleContrPDF()` | el gesto: da vuelta el campo y repinta |

⚠️ **GUIÓN BAJO Y NO MEDIO, y no es cosmético:** así lo toma el recolector de `guardarInforme`
—que barre `input[id], select[id], textarea[id]`— y `_noEsDelEstudio` no lo excluye. Viaja con el
estudio, la reimpresión lo repone, y **las rutas de restauración lo VACÍAN cuando la clave no
está** (`el.value = c[el.id] !== undefined ? c[el.id] : ''`): un estudio anterior a esta tanda
abre y reimprime APAGADO **sin migrar nada**.

⚠️ **NO AGREGA NINGUNA COLUMNA AL EXCEL**, que exporta por `LAB_XLS_MAP` y por los bloques
declarados, no por el DOM. Medido: **440 columnas, clave por clave, cero valores distintos**.

⚠️ **EL BARRIDO DE `limpiarCampos` TOMA `text` Y `number`, así que no alcanza a un `hidden`:** el
campo se vacía a mano al final de esa función y el botón se repinta ahí mismo.

### El PPT no depende de esto, y se verificó

Su diapositiva de contractilidad se decide por `contrHayDatos()` y **no mira ningún toggle** —lo
dice su propio comentario—. No se tocó.

⚠️ **LOS OTROS DOS TOGGLES HERMANOS SIGUEN EN `localStorage`**: `sgl_incluir_pdf` y
`mitral_qx_incluir_pdf`. Quedan fuera de esta orden. `docs/PENDIENTES.md` → **K-3**.

---

## 2 · La fila de TRES BLOQUES — K2

Bajo el bull's eye: **hallazgos de motilidad | los dos botones | el panel 3D**.

```
#lv3d-fila                       (grid, align-items:stretch)
  #lv3d-bloque-hallazgos   1fr
  #lv3d-bloque-botones     210px   (Limpiar + Incluir bull's eye en PDF + el campo oculto)
  #lv3d-panel              calc(46% + 118px)   — sólo con el 3D abierto
```

- **El dueño de la maqueta es `lv3dMaquetar`**, y con el panel cerrado la grilla declara **DOS**
  columnas: el tercer bloque está en `display:none`, así que no ocupa caja ni deja hueco.
- `align-items` pasó de `start` a **`stretch`**: es lo que hace que los tres midan lo mismo de
  alto. Con `start`, el bloque de botones quedaba como una franja fina al lado de un panel de
  700 px.
- La columna de botones va en **píxeles** y no en una fracción: su contenido tiene ancho conocido.

⚠️ **EL UMBRAL DE UNA COLUMNA ES `<= 768` Y NO `< 768`**, y el motivo está medido: con tres
bloques, a 768 px exactos la grilla quedaba en **123 + 210 + 311 px**. Es además el mismo borde de
la media query `max-width:768px` del panel 3D de la mitral, que sí incluye el 768.

⚠️ **EL OYENTE DE `resize` NO PUEDE VIVIR EN `lv3dCablear`**, que corre **sólo al abrir el panel**:
desde que la fila tiene tres bloques su maqueta importa también con el 3D cerrado. Hay un único
oyente al final del módulo, más una primera llamada que convierte el `display:block` del marcado
en la grilla.

### La tabla «Referencia de colores», retirada

Antes de sacarla se verificó quién la usaba: **nadie**. El PDF arma su leyenda con
`leyenda: CONTR_MOTILIDAD` y el PPT con `esc:CONTR_MOTILIDAD`, los dos desde el dueño.

⚠️ **ERA UNA TERCERA COPIA CON LOS COLORES ESCRITOS A MANO, Y DISCREPABA DEL DUEÑO:** su «Normal»
decía `#2a2f3f` donde `CONTR_MOTILIDAD[0].color` es `#22C55E`.

**El significado de los colores sigue viéndose en pantalla:** `#contr-leyenda`, a la izquierda del
bull's eye, publica los cinco nombres con su cuadradito **derivados de `CONTR_MOTILIDAD`**.

---

## 3 · El interior del 3D del ventrículo — K3

De arriba abajo:

| Orden | Bloque | Qué contiene |
|---|---|---|
| 1 | botones de **PUNTA** | `.lv3d-vista` × 3 |
| 2 | `#lv3d-dibujo` | `#lv3d-lienzo` (el canvas) + `#lv3d-datos` (los **cinco cuadros**) |
| 3 | `#lv3d-leido` y la **pausa con la fase** | `#lv3d-play`, `.lv3d-fase` |
| 4 | `#lv3d-colores` | los dos `.lv3d-color`, la leyenda de territorio y las **dos casillas** |
| 5 | `#lv3d-cap` | capturar, «Quitar», la miniatura y «Incluir diagrama 3D en el PDF» |
| 6 | `#lv3d-notas` | las notas del panel, a todo el ancho |

**NINGÚN CONTROL ES NUEVO:** son los mismos, cambiados de lugar.

### El cuadro gris no se achica, y eso obligó a ensanchar el panel

Con la columna de datos al lado y el panel en su `46%` de siempre, el canvas pasaba de **531 a
373 px** a 1440 y de **436 a 278** a 1200 — medido. El panel pasa a **`calc(46% + 118px)`**: le
suma exactamente la columna (110 px) y su hueco (8).

| Ancho | canvas antes de la tanda | canvas hoy |
|---|---|---|
| 1440 | 531 × 297 | **531 × 297** |
| 1200 | 436 × 243 | **436 × 243** |
| 390 | 298 × 166 | **298 × 166** |

Medido igual en **Chrome 155 y en WebKit 27.2**.

⚠️ **LO QUE SE ANGOSTA ES LA COLUMNA DE HALLAZGOS**, que es texto: a 1200 px baja a unos **151 px**
y a 1440 a **264**. `docs/PENDIENTES.md` → **K-4**.

### Las notas salen a su propio nodo

`_lv3dPublicar(box, html, notas)` es el único emisor: los cinco cuadros van a `#lv3d-datos` y las
notas a `#lv3d-notas`, a todo el ancho y debajo. En una columna de 110 px un párrafo de 10 px
queda en una tira de dos palabras por renglón. **Si el nodo de las notas faltara se crea al
vuelo**, así que no se pierde ninguna.

⚠️ **SEMGREP CAZÓ LA PRIMERA VERSIÓN SOBRE CÓDIGO RECIÉN ESCRITO:** su rama de respaldo escribía
`box.innerHTML = html + n` y eso daba **128** donde la línea base es 127. Se reescribió sin
concatenar.

### Lo que la orden pide y NO existe hoy

- **La leyenda «modelo esquemático» DE LA CAPTURA.** La única con ese texto está debajo del botón
  «Ver en 3D», en la columna del bull's eye, y ese botón **no se movió**. El bloque de captura
  tiene su propio rótulo («Sin captura.»), que sí se conserva. **No se creó nada.**

### El comportamiento no cambia — medido A/B contra el árbol del inicio

| Qué | HEAD | hoy |
|---|---|---|
| cuadros con el panel **cerrado** | 0 | **0** |
| cuadros con el panel **abierto** | 57 | **56** |
| cuadros **tras cerrar** | 0 | **0** |
| 20 aperturas y cierres | 11825 → 11825 | **11818 → 11818**, cerrado |
| bull's eye → 3D (un clic en un segmento) | cambia el dibujo | **igual** |
| 3D → bull's eye (un clic real en el canvas) | cambia el estado | **igual** |
| giro con arrastre real | cambia el dibujo | **igual** |
| claves en `localStorage` / `sessionStorage` | ninguna | **ninguna** |
| campos del estudio del 3D o de la captura | ninguno | **ninguno** |

⚠️ **Con la pestaña del navegador oculta la sonda cuenta 54 cuadros, y es PREEXISTENTE**: HEAD da
el mismo 54 con la misma emulación. No es una regresión de esta tanda.

---

## 4 · Trampas medidas en esta tanda

1. ⚠️ **SIN VOLÚMENES EL 3D NO DIBUJA.** Sin DDVI ni VDFVI el panel muestra el cartel «no hay
   datos» y **no arranca el bucle**: una sonda sin volúmenes informa **cero cuadros, cero cambio
   de hash y cero ciclado** al tocar un segmento, sobre un panel que funciona. Pasó en la primera
   corrida del grupo de comportamiento.
2. ⚠️ **EL DETECTOR DE LA BOTONERA NO PUEDE BARRER DIVS QUE *CONTENGAN* EL BOTÓN:** el primero que
   lo contiene es la fila entera, que pasaba el filtro de «pocos hijos». Informaba «los botones no
   están en la columna» sobre un marcado correcto. Se ubica por el **padre** del botón.
3. ⚠️ **LA BRÚJULA DEL VENTRÍCULO VIVE EN `lv3dPintar`, NO EN `lv3dDibujar`**, que es la que
   prepara el contexto. Una condición de TC-490 salía roja mirando la función equivocada.
4. ⚠️ **EL PPT NO NOMBRA `CONTR_MOTILIDAD` EN SU LLAMADA:** se la pasa a su columna como `esc` y
   su ayudante la recibe por argumento. Buscar el nombre en la llamada da rojo sobre un PPT que sí
   la usa.
5. ⚠️ **EL COLOR COMPUTADO SE LEE DEL TEMA ANTERIOR SIN UNA VUELTA DE ESPERA** tras cambiar la
   clase `light-mode`.
