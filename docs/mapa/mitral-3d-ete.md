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

## 10 · Lo que NO entró, y dónde está

- **No hay captura al PDF ni al PPT.** «Incluir en PDF» sigue incluyendo **sólo** la vista
  quirúrgica, como hasta hoy. `docs/PENDIENTES.md` → **Y3-1**.
- **No hay 3D del Wilkins**, y las dos calculadoras **no se unificaron**: es la PARADA Y3-6, con su
  tabla de diferencias. `docs/PENDIENTES.md` → **Y3-7**.
- **El archivo de la demo queda sin versionar**, como estaba.
