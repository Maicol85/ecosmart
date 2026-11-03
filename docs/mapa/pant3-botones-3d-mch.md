# PANT-3 — los botones CIA y CIV, el esquema de la TGA, el corazón maestro y la pantalla de MCH

Mapa de la tanda **PANT-3** (2026-11-02 y 03). Por nombre de función y de constante, no por
número de línea. Los cinco commits de código son `5504f6d`, `bc363f6`, `eeb3ccf`, `75b555f` y
`15098a5`.

---

## 1 · Los botones CIA y CIV de «CIA / CIV» (commit 1)

**Qué eran y qué son.** Eran **solapas**: `eteShuntTab` mostraba un panel y escondía el otro, y
marcaba el botón con `.active`. Hoy son **toggles de presencia de la lesión**: un toque marca o
desmarca la lesión **y** trae su formulario a la vista.

### Los dos estados, y su dueño

| estado | dueño | clase | se persiste |
|---|---|---|---|
| **la lesión entra al informe** | `ete_cia_activa` / `ete_civ_activa` (checkbox oculto) | `cc-les-on` (relleno) | **sí**, como `<id>__chk` |
| **este formulario está a la vista** | `_eteShuntPane` (variable de módulo) | `cc-pane-on` (borde) | no — es navegación |

⚠️ **Ninguno de los dos usa `.active`, y es obligatorio.** `showTab` barre `.active` de **todo**
`.tab-btn` del documento: es exactamente por lo que el botón se desmarcaba al cambiar de
pantalla. Mismo motivo por el que la barra de sub-pestañas de congénitas usa `cc-on`.

### Las funciones

- `eteShuntLesionOn(cual)` — **dueño único** de «¿está marcada esta lesión?». Lo consultan el
  emisor del informe, el EN SUMA, la compuerta del PPT, la pastilla del encabezado y el pintor.
- `eteShuntLesionSync()` — pinta los dos botones desde el estado. **Un solo enganche**, dentro de
  `eteShuntSync`, que está en `RECALC_MODULOS`: así las cinco rutas de restauración repintan sin
  un enganche propio.
- `eteShuntTab(cual)` — navegación sola. La usa `eteShuntTaviReset` y las sondas de otras tandas.
- `eteShuntLesionTog(cual)` — el gesto del médico. **Desmarcar no esconde el panel**: un campo
  oculto se sigue guardando, así que esconder el formulario de una lesión con datos dejaría los
  datos fuera de la vista y dentro del estudio.

### Las compuertas, por superficie

| | botón de la lesión | casilla «Integrar al informe» |
|---|---|---|
| informe (tres estilos), EN SUMA, PDF principal, PPT de `informe_texto` | **sí** | no |
| hoja aparte de congénitas del PDF (`ccHoja`) | sí | **sí**, las dos |
| diapositiva propia del PPT (`CC_PPT`, clave `les`) | sí | **sí**, las dos |

⚠️ **Con el botón apagado la lesión NO se emite aunque tenga datos cargados, y no hay aviso en el
papel.** Los campos se siguen guardando; lo que no se emite es el párrafo.
⚠️ **El caso «casilla de abajo tildada y ninguna lesión marcada» NO está decidido por la orden**:
manda la regla de arriba y no se emite nada. Declarado en `docs/PENDIENTES.md` → **P3-a**.

### La pastilla «en el informe»

Es la **única** de las catorce secciones cuya pastilla **no** sale de su casilla: la enciende
`eteShuntLesionOn('cia') || eteShuntLesionOn('civ')`, dentro de `eteInclSync`. Colgada de la
casilla decía «no está en el informe» sobre una sección que sí se imprime.

### La barra, en el celular

La barra lleva la clase **`cc-lesbar`**, que la saca de
`.subtabs-wrap:not(.cc-subbar):not(.cc-lesbar) .tabs-row{display:none}`. Sin eso, por debajo de
768 px los dos botones median **0 × 0** con `offsetParent` nulo y la lesión no se podía marcar en
un teléfono. Mismo mecanismo que `.cc-subbar`.

---

## 2 · Los rótulos del esquema de circulación de la TGA (commit 2)

`tgaEsqSVG(k, sh)` es el generador. Tres cambios, y ninguno toca el esquema ni su lógica:

1. **Los tres rótulos de comunicación** (`CIA`, `CIV`, `DAP`) se emitían **dentro** de su bloque,
   antes de las cavidades y de las flechas: en SVG manda el orden de pintado, así que una flecha
   se dibujaba **encima** de la palabra. Hoy se juntan en `rotCom` y se emiten **últimos**.
2. **Halo** en los cinco rótulos libres: `paint-order="stroke"` con `stroke="var(--bg3)"` y
   `stroke-width="3.5"`. Es la versión de texto del círculo opaco que ya tienen las dos válvulas.
3. **Tres se reubicaron.** Posiciones viejas → nuevas:
   `venas pulm.` 222,60 → **150,60** · `AP` 258|90, 102|62 → **262|90, 84|50** ·
   `Ao` 22|226, 182|242 → **20|226, 208|242** · `DAP` del punto medio de su línea → **junto a la
   boca de la pulmonar** (`D.ap[0]-46, D.ap[1]-20` a la derecha; `116, 53` a la izquierda).

⚠️ **«venas pulm.» no puede ir entre las dos verticales**: mide 65 px y el hueco entre x=220 y
x=282 son 62. Correrla a x=206 llevó los cruces de **0 a 30**.
⚠️ **El rótulo del ductus no va en el punto medio ni apartado perpendicular**: en el medio cae en
el centro del dibujo, donde viven «CIA», «CIV» y las cavidades, y la perpendicular de 26 px lo
empujaba contra «CIV». Las dos alternativas se midieron.

### Cómo se mide

`scripts/_probe_pant3esq.mjs`. La caja de cada `<text>` contra una **muestra de puntos** de cada
trazado (`getPointAtLength`), **no** contra su caja: la caja de una diagonal contiene casi todo el
dibujo. Y cada cruce se clasifica en **desnudo** (sin halo y sin respaldo opaco dibujado después
de la línea) o **tapado**. Lo que hay que llevar a cero son los **desnudos**.

| | cruces | de ellos **desnudos** | rótulos que se pisan |
|---|---:|---:|---:|
| antes | 131 | **61** | 14 |
| después | 82 | **0** | **0** |

⚠️ **El criterio de «tapado» se corrigió DOS veces y el número bajó de 63 a 61**, que es el que
la sonda y el caso de prueba comparten. Las dos versiones descartadas miraban el **orden de
dibujo** y las dos fallaban en el mismo sitio: el rótulo «VD» del Rastelli vive dentro de su
recuadro de cavidad, pero una flecha del recorrido roza el borde de ese recuadro a la altura de
su línea de base, y las flechas se dibujan **después** de las cavidades. Ese cruce es de una
fracción de píxel, por debajo de las letras, y cambia con la métrica de la fuente: la sonda lo
medía en cero y el caso en dos **sobre el mismo árbol**. Lo que separa los dos casos no es quién
se dibujó primero, sino **dónde vive** el rótulo.

---

## 3 · El bloque «A tener en cuenta» del ⓘ del esquema (commit 2b)

Se retiró **entero** el `ojo` de la entrada `'tga-esq'` de `VINFO`. Sus tres párrafos, con su
motivo: la frase de que los recorridos están **pendientes de revisión** por un cardiólogo (regla
nueva); la de que el esquema «no entra al informe ni al PDF» (**dejó de ser cierta** desde
TGA-4); y el aviso de esquema ilustrativo (**no se pierde**: la tarjeta lo muestra en su etiqueta
y el epígrafe del PDF lo dice textual).

Medido: la tarjeta pasa de **1907 a 1228** caracteres y de los bloques `lee,ojo` a `lee`.

---

## 4 · El botón «3D» del corazón maestro (commit 4)

**Lo que la tanda agrega es la puerta, no el dibujo.** El recuadro de la transposición ya dibuja
el corazón normal con las comunicaciones cargadas cuando no hay tipo, y el escenario de la
transposición cuando lo hay.

- `#cc3d-wrap` vive **fuera** de `#tab-congenitas` y de `#tab-congenitas2`, como hermano de las
  dos: es la única forma de que haya **una sola instancia** visible en las dos. Lo muestra y lo
  esconde `cc3dPieSync`, colgado de `showTab`.
- `cc3dAbrir` **presta** `#tga-3d-box` al panel y recuerda el padre y el hermano siguiente;
  `cc3dCerrar` lo devuelve al mismo lugar. `showTab` y `limpiarCampos` cierran el panel.
- `cc3dNoDibujadas()` lee **`_CC_SECS`**, el registro del Laboratorio, que es el dueño único de
  «esta lesión está cargada». `CC3D_DIBUJA` son las cinco claves que el diagrama sí dibuja:
  `cia`, `civ`, `dap`, `fop` y `tga`. Las otras catorce se **declaran**.
- El ⓘ es `'cc-3d'`.

---

## 5 · La pantalla de MCH (commit 5)

### La maqueta

`#mch-cols` (tres `.mch-col`) y `#mch-cajas` (dos `.mch-caja`), las dos en una sola columna por
debajo de **900 px**. Dentro de cada columna los campos usan
`repeat(auto-fit, minmax(175px, 1fr))`.

⚠️ **Dos cosas salieron de medir.** (1) Con **un** campo por fila dentro de la columna el alto a
1440 px **no bajaba nada** (1241 → 1242): la columna de factores de riesgo tiene diez campos. Con
el piso de 175 px entran dos y la pantalla baja a **939**. (2) `auto-fit` en `#mch-cols` daba
**barra horizontal a 900 px**; se volvió a `repeat(3, ...)`.
⚠️ **La barra horizontal a 900 px existe en los dos árboles**: es preexistente.

| ancho | antes | después |
|---:|---:|---:|
| 1440 | 1287 | **939** |
| 1200 | 1309 | 1129 |
| 1000 | 1335 | 1290 |
| 900 | 1347 | 1305 |
| 768 | 2321 | **1253** |
| 390 | 2543 | 2239 |

El **cuadro de resultado va debajo** de los campos: a 900 px el ancho útil son ~780 px y con el
cuadro a la derecha quedan ~155 px por columna, por debajo del mínimo de 200 que la orden pone
como condición.

### Los seis globos y su fuente

`mch-sec` · `mch-hvi` · `mch-msub` · `mch-ex` · `mch-adic` · `mch-score`.

| fuente | regla de folio, comprobada en el pie impreso | hojas leídas |
|---|---|---|
| AHA/ACC 2024 (Ommen, *Circulation* 2024;149:e1239-e1311) | folio = hoja + 1238 | 9 → e1247 · 29 → e1267 |
| ESC 2022 (Zeppenfeld, *Eur Heart J* 2022;43:3997-4126) | folio = hoja + 3996 | 66 → 4062 · 67 → 4063 |

⚠️ **La etiqueta «ESC 2022» de la pantalla es correcta.** La continuación de PANT-2 la daba por
dudosa porque buscó en la carpeta de miocardiopatías. Buscada **por contenido** en los 246 PDF de
la biblioteca, la ESC 2022 de arritmias ventriculares está en `24_Arritmias_y_sincope` y es la
que publica las bandas y sus clases.

### El rótulo del conteo

La tabla «Dónde no coinciden» de `critMCH` pasa a **«AHA/ACC 2024»**: sus siete filas se cotejaron
contra la hoja 29. **La columna de los diagramas conserva su rótulo 2020**, porque `_critSvgAHA()`
sigue dibujando esa edición.

---

## Lo que se paró y se reporta

Está en `docs/PENDIENTES.md` → **P3-a** a **P3-h**.


---

## La segunda mitad de la tanda

Los commits **6 a 10** —MCA, Fallot, las dos estenosis aórticas, el módulo de arritmia ventricular
y los rótulos PSAP / PmAP / PDAP— viven en **`docs/mapa/pant3-pantallas-arritmia.md`**. Salió a
archivo propio y no a una sección de éste, que es la regla de la casa: un mapa que crece con cada
tanda termina siendo imposible de presupuestar.
