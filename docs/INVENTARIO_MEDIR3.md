# INVENTARIO MEDIR-3 — lo medido ANTES de tocar una línea

Bloque 0 de la tanda **MEDIR-3** (2026-11-14). **Solo lectura**: este commit no toca `index.html`.

Línea base: **`3e64801`** (cierre de MEDIR-2), sello **`v20261114-0031`**, md5 **`3b0e2373`**,
**181.737** líneas, **13.123.356** bytes — los tres verificados con `wc -l`, `wc -c` y `md5`
contra lo que `CLAUDE.md` publica: **coinciden**, y el sello del pie coincide con el publicado.
Es la **cuadragésima vez seguida** que el renglón de tamaño está bien.

**Pendrive `/Volumes/DISK_IMG`: MONTADO**, verificado antes de medir (punto 0f).

La sonda es **`scripts/_probe_medir3.mjs`**, que mide **en el navegador** en **Chrome y WebKit ×
1440×900 y 1280×800 × los dos temas reales** (puestos por `ett_theme` + `loadTheme()`, con el tema
**devuelto** por la sonda) — **ocho cruces**. Lleva su **detector de que son dos árboles**
(`tieneLoNuevo`), que en esta pasada da **`false`** en los ocho, o sea que midió el árbol base.
Salida cruda en `/tmp/m3base.json`.

⚠️ **Y LA PRIMERA CORRIDA DE ESA SONDA NO ARRANCÓ POR UN ACENTO GRAVE EN MI PROPIO COMENTARIO**,
por **vigesimocuarta** tanda seguida: el cuerpo que se evalúa en el navegador es un *template
literal*, así que un acento grave alrededor de un nombre de función lo cierra antes de tiempo.
Lo cazó `node --check`, que es lo único que lo caza.

---

## H1 a H5 — las cinco hipótesis de la orden

| # | hipótesis | veredicto | lo medido |
|---|---|---|---|
| **H1** | los títulos y las filas del Doppler se pisan porque las medidas están una al lado de la otra | **CONFIRMADA**, y cuantificada | `tablaCols` reparte las filas por `f[6]` en **DOS tablas lado a lado**, cada una `flex:1` dentro de una columna de **310 px**. El cajón **desborda horizontalmente 179 px en Chrome y 181 en WebKit** con la aórtica poblada, y **132 px** con la mitral. ⚠️ **Y NO ES SÓLO EL REPARTO**: el cajón 2D, con **UNA** sola tabla de cinco columnas, desborda **32 px (Chrome) / 34 (WebKit)**. O sea que las cinco columnas no entran ni solas. |
| **H2** | el Diam TSVI comparte valor con el cajón Doppler (AVA por continuidad) y con la ruta `diam_tsvi` | **CONFIRMADA** | `_D2_ALIAS` declara `'vi.tsvi' → 'ao.diam'`: `vi.tsvi` **no existe** en el estado del cajón 2D, lee y escribe `_dop.ao.diam`. Su banda se presta de `diam_tsvi` (`_D2_BANDA_DE`). Mover la fila de tabla **no toca el alias**. |
| **H3** | hoy la calibración de velocidad toma como cero el punto donde se hace clic | **CONFIRMADA CON MATIZ** | `_medVelClic`, rama `_medCalibrandoVel`: el **primer** clic se guarda como `y0` y **se asume cero sin preguntar su valor**; el **segundo** es la marca conocida y de él se pide **un solo** valor por `prompt`. `_medCalibVel = { y0: a0.y, cmsPorPx: val / dy }`. O sea: el cero **sí** es un punto de clic, pero no «el» punto del clic de medición — es el primero de los dos de calibración. Lo que falta es poder **escribir el valor de los dos**. |
| **H4** | la app ya calcula el FAC del VD a partir de «Área VD telediastólica» y «Área VD telesistólica» | **CONFIRMADA** | `vd_area_d`, `vd_area_s` y `vd_fac` (readonly, «auto ← áreas»), calculados por `calcVD`, con sus bandas en `ASE25_T1` y los cortes `UMBRAL_FAC_VD_NORMAL` / `UMBRAL_FAC_VD_SEVERA`. |
| **H5** | la banda de `vp_vmax` (`[0,2 – 8]` m/s) es la que corresponde a «Vmax pulmonar» del visor | **CONFIRMADA** | «Vmax pulmonar» del visor es `pul.vmaxEp`, y su homólogo del formulario es `vp_vmax` («Vmax pulmonar (m/s) — Estenosis»), el **dueño** de la magnitud; su espejo es `ep_vmax`. Es la misma magnitud física: velocidad pico anterógrada de la válvula pulmonar, en m/s. Era la primera pregunta abierta de **M2-c**. |

---

## 0a · Cómo está armado hoy el panel

Medido en los ocho cruces, **idéntico en los dos motores y en los dos anchos**:

| pieza | 1440×900 | 1280×800 |
|---|---|---|
| `#cine-modal` | **1180 × 762** | **1180 × 752** |
| `.cine-col-der` | **310 × 582** | **310 × 572** |
| `#cine-lienzo` | **828 × 500** | **828 × 490** |
| `#cine-cv` (canvas) | **600 × 500** | **600 × 500** |
| **negro a los costados** | **228 px** | **228 px** |

El armado, por nombre de función:

- **`_vPanelHTML(p, esB)`** emite el panel entero de una vista: encabezado → `.cine-barra`
  (la barra única de MEDIR-1) → `.cine-fila`, que es un *flex* de dos hijos:
  - izquierda `flex:1 1 420px` — `#cine-lienzo` (fondo negro, *flex* centrado) con
    `#cine-recorte` adentro y los dos canvas; debajo el reproductor y `#cine-ayuda`;
  - derecha **`.cine-col-der`**, con `#cine-side` (el selector progresivo),
    `#cine-med-barra` (el panel guía) y `#cine-der-slot`, la ranura a la que `_cineAbrir`
    **muda** los cajones `d2-cajon` y `dop-cajon` y la tabla de Simpson.
- El corte va **sobre la ventana**: `@media (min-width:1100px)` pone
  `.cine-col-der { flex:0 0 310px; max-width:310px; overflow:auto }`. Por debajo se apila.
- **El desplazamiento de hoy es de la COLUMNA ENTERA** (`.cine-col-der { overflow:auto }`), no de
  la tabla: el selector se va con el *scroll*. Medido: `colDerScrollY` **0** y `modalScrollY`
  **0** en los ocho —la columna entra—, pero el **horizontal** sí muerde (ver H1).

**Por qué se pisan las filas del Doppler** — la cadena completa, medida:
`_dopRender` → `tablaCols(F)` reparte por `f[6]` → dos `<div flex:1>` con una tabla de **cinco**
columnas cada uno → ~150 px por tabla → el contenido mínimo de cinco columnas no entra y el
navegador desborda la caja. Con `overflow:auto` en la columna eso es *scroll* horizontal; dentro
de un ancho fijo, celdas encimadas. **Y el canvas deja 228 px de negro al costado** mientras la
columna que no entra mide 310: ahí está el espacio que el punto A1 viene a mover.

**Lo que NO desborda hoy** (y es el control negativo): `docScrollX` **0**, textos recortados
**0** y **cero errores de consola y de página** en los ocho cruces.

---

## 0b · Cómo se detecta si un eje es de velocidad o de profundidad

No hay heurística: **lo declara el archivo**, región por región.

- **`_dcmImgRegionVelocidad(r)`** — dice si la región tiene el eje vertical en velocidad.
- **`r.uy === DCMIMG_UNI_CM`** — el eje vertical en **centímetros**, o sea **modo M**
  (distancia contra tiempo). Es la rama que hoy ya produce el mensaje «Una velocidad medida acá
  sería en realidad una distancia».
- **`_dcmImgRegionMedible(r)`** — los dos ejes en distancia, o sea **2D**.
- **`_dcmImgVelocidadEn(r, y)`** convierte píxel → cm/s con la escala de la región.
- **`_medVelCalEn(cal, y)`** hace lo mismo con la calibración manual, y **manda cuando existe**
  (`_medVelEn`: `return _medCalibVel ? _medVelCalEn(...) : _dcmImgVelocidadEn(...)`).
- El modo M **se rechaza siempre** para VTI, también con calibración manual puesta.

O sea que para el punto C ya existe la pregunta «¿este eje es de profundidad?» y tiene un dueño.

---

## 0c · Cómo se guardan las mediciones mientras el visor está abierto

Tres almacenes distintos, y **ninguno es del paciente guardado**:

| almacén | qué guarda | al cambiar de estructura | al cambiar de modo | al cerrar el visor |
|---|---|---|---|---|
| **`_d2`** (`_d2Estado()`) | las distancias 2D, por grupo (`vi`, `vd`, `ao`, `ai`, `vci`) | **conserva**: `d2Modo` sólo cambia `E.modo` y limpia `E.destino` | **conserva** | **conserva** (vive en memoria del módulo) |
| **`_dop`** (`_dopEstado()`) | las del Doppler, por válvula | **conserva**, ídem | **conserva** | **conserva** |
| **`_medAreas` / `_medVels` / …** | los trazos del visor | el contorno guarda su `est` (MEDIR-2) | — | **`cineCerrar` CONSERVA** lo medido a propósito; **`medApagar`** es la puerta que borra |

**Medido en el navegador**, no leído: sembrando `vi.ddvi = 52`, pasando a VCI y volviendo,
`a7Restaura` da **true** en los ocho cruces; y pasando a Doppler y volviendo,
`a7D2OcultoEnDop` **true** y `a7D2VuelveConValor` **true** en los ocho.

⚠️ **ASÍ QUE LA PREMISA DEL PUNTO A7 YA ES CIERTA PARA EL CAJÓN 2D, Y HAY QUE DECIRLO.**
`_d2Filas()` devuelve `[]` sin grupo elegido y las filas de **un solo** grupo cuando hay uno, así
que hoy **se muestra sólo la tabla de la estructura elegida** (`d2Tablas` = **1**), la anterior
**desaparece** (`a7NoApila` = true), al volver **reaparece con su valor** y al pasar a Doppler el
cajón 2D se **oculta** y vuelve con el valor puesto. Lo que **sí** queda apilado es otra cosa: la
tabla **«Mediciones sin asignar a un campo»** de `_dopFilasSueltas`, que se dibuja **debajo** de
la de la válvula, y las **dos** tablas del reparto de `tablaCols`. Eso es lo que A7 tiene que
cerrar, no el cambio de estructura.

---

## 0d · Los botones de la barra superior y del selector

**Barra superior** (`#cine-grp-med`, clase `.cine-barra`) — **8 botones**, medidos:
ancho **118 px los ocho** (`barraMismoAncho` = true), **misma fila** (`barraMismaFila` = true),
y **alto DISTINTO**: **44 px** seis de ellos y **56 px** dos (`cine-b-alto`).

| id | rótulo | **clase** | hoy |
|---|---|---|---|
| `cine-medir` | 📏 Medir / ✕ Salir de medición | **MODO** (interruptor del visor; lo escribe `_vModoSync` con `aria-pressed`) | **azul** ✔ correcto |
| `cine-med-recal` | Recalibrar / Calibrar vel. | **ACCIÓN** (abre un gesto de calibración puntual) | gris ✔ |
| `cine-med-borrar` | Borrar | **ACCIÓN** | gris ✔ |
| `cine-guardar` | 💾 Guardar | **ACCIÓN** | **azul + 56 px** ✘ |
| `cine-cap` | 📸 Capturar | **ACCIÓN** | gris ✔ |
| `cine-med-cap` | 📸 Capturar + medición | **ACCIÓN** | **azul + 56 px** ✘ |
| `cine-add-b` | ➕ Vista | **ACCIÓN** | gris ✔ |
| `cine-cerrar` | Cerrar | **ACCIÓN** | gris ✔ |

Medido: `barraAzules` = **`['cine-medir', 'cine-guardar', 'cine-med-cap']`** en los ocho cruces.
O sea **dos acciones pintadas de azul** y **dos con otro alto**, que es lo que el bloque B
corrige. ⚠️ **«Salir de medición» es el MISMO botón `cine-medir`**, así que por el criterio «azul
= está prendido» queda **azul**: cuando dice «Salir» es porque el modo está encendido.

**Selector** (`#cine-side`, `.cine-selbtn`) — **MODO/HERRAMIENTA los tres niveles**:
nivel 1 los tres grupos de `_MED_GRUPOS` (2D · Doppler/M · Deformación), nivel 2 las herramientas
de `_MED_HERRS` (hoy **10**) más **«Volumen»**, que va **visible y apagado** (`disabled`), y
nivel 3 las estructuras. Se ven de **28 px** y se tocan en **44** por el `::after` de MEDIR-2.
Medido con la herramienta Área: `areaEstRot` =
`2D | Doppler / M | Distancia | Área | Simpson | Volumen | AI | AD` — o sea **«Volumen» está**
(sale en A6) y **«VD» no está** (entra en D).

---

## 0e · Los rótulos exactos de la app para el área y el FAC del VD

Leídos del formulario, palabra por palabra:

| campo | rótulo impreso en la app |
|---|---|
| `vd_area_d` | **«Área VD telediastólica (cm²)»** |
| `vd_area_s` | **«Área VD telesistólica (cm²)»** |
| `vd_fac` | **«FAC VD (%)»** — readonly, con la leyenda «auto ← áreas» |

El método de **FEVI** del visor es **Simpson** (método de discos, `_MED_HERRS` → `simpson`), con
su tabla en `_simpTablaHTML` y la superficie de `getBSA()`.

⚠️ **LA ORDEN ESCRIBE «FAC del VD (%)» Y LA APP DICE «FAC VD (%)».** Es una diferencia de una
palabra sobre la misma magnitud, y esta casa tiene una regla para eso —un solo nombre por
magnitud, que es de lo que se trató el bloque C de MEDIR-2—. Queda **declarado** y la decisión va
en `docs/PENDIENTES.md` → **M3-a**.

---

## Lo que esta medición cambia del plan

1. **A7 es más chico de lo que la orden supone** y **A3 es más grande**: el cambio de estructura
   ya funciona; lo que desborda son las cinco columnas y el reparto en dos.
2. **A1 tiene un número**: hay **228 px de negro** al costado del canvas y un modal clavado en
   **1180 px** con la ventana en 1440.
3. **B tiene dos culpables con nombre**: `cine-guardar` y `cine-med-cap`, por la clase
   `cine-b-alto`.
4. **C no empieza de cero**: la detección de eje ya tiene dueño (0b) y la calibración manual ya
   manda sobre la del archivo.
