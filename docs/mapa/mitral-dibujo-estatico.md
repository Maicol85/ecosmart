# El DIBUJO ESTÁTICO de la válvula mitral — tanda «Y3c» (2026-10-18)

> El 3D de la mitral, los cuatro esquemas de proyección y la columna izquierda viven en
> `docs/mapa/mitral-3d-ete.md`. Acá está **el dibujo estático** —la «vista quirúrgica»— con su
> tabla de cortes, su línea de plano, su giro, sus tres vistas y los **cuatro dibujos de medidas
> TEER**. Lo que entra al PDF está también en `docs/mapa/informe-pdf-excel.md`.

---

## 1 · La tabla dueña de los cortes (`ETE_CORTES`)

**UNA tabla, y de ella leen los cuatro esquemas de proyección, el dibujo estático y la línea del
plano.** Antes de esta tanda cada superficie traía su propia lista escrita a mano, y por eso
divergían: el esquema de «60–90° — 2 Cámaras» rotulaba **A3** donde la fila de 90° pone **P2**.

| ángulo | festones, de LATERAL a MEDIAL | lo usa |
|---|---|---|
| 0°   | P1 · P2 · A2 · A3        | esquema `4ch` + línea del plano |
| 45°  | P1 · P2 · A2 · A3 · P3   | **sólo** la línea del plano |
| 60°  | P1 · A2 · P3             | esquema `bc` + línea |
| 90°  | A1 · A2 · P2 · P3        | esquema `2ch` + línea |
| 120° | P2 · A2                  | esquema `3ch` + línea |

`ETE_ESQ_ANG` es el reparto esquema → fila (`4ch`:0, `bc`:60, `2ch`:90, `3ch`:120), **decisión de
Maicol del 18/10/2026**, y los **títulos de los cuatro esquemas no cambian**.

**`ETE_GID_MAP` se DERIVA de las dos**, no es una lista aparte: el día que una fila cambie, el mapa
se mueve con ella. Para poder derivarlo hubo que **normalizar cuatro ids** (`valve-A3` →
`valve-A3-4ch`, `valve-P1` → `valve-P1-4ch`, `valve-A1` → `valve-A1-2ch`) y **mover**
`valve-A3-2ch` → `valve-P2-2ch` con su rótulo.

**DOS asserts de arranque, y ninguno es decorativo:**
1. los **extremos** de cada fila contra `ETE_EPIGRAFE` —el par que la figura nombra—, que es lo
   único que impide que una edición futura se separe de la fuente en silencio;
2. cada id que el mapa deriva **existe en el marcado**. Sin esto, un festón movido de fila deja un
   `valve-X-suf` que no está en ningún SVG, el pintor sale por su `if (!el)` y el esquema **no
   pinta la lesión, sin un error en consola**.

⚠️ **ESTA TABLA NO ES LA DEL 3D.** `M3D_VIS` sigue siendo la suya y esta tanda **no la toca** —la
orden lo prohíbe—, así que las dos **divergen en las filas de 45° y de 90°**. Declarado en
`docs/PENDIENTES.md` → **Y3c-1**.

---

## 2 · La geometría del dibujo

Es la de la demo aprobada (`docs/3d/demo2_mitral_integrada_en_ETE.html`, 18/10/2026), **sin
reescalar ni un número**: viewBox `0 0 420 420`, centro `(210, 215)`, `RX = 120`, `E = 116`, y
`QXG = { RYT: 64, RYB: 100, SAG: 46, dx: 38, dy: 10, T: 22 }` —los valores que Maicol aprobó el
17/10/2026—.

| función | qué es |
|---|---|
| `qxTopY(x)`  | la mitad **anterior** del anillo (semieje `RYT`) |
| `qxBotY(x)`  | la mitad **posterior** (semieje `RYB`) |
| `qxCoapY(x)` | la **sonrisa** de coaptación: parábola de flecha `SAG` |
| `qxAnnPt(φ)` | el contorno del anillo, 90 vértices |
| `qxBandAnt` / `qxBandPost` | las bandas de cada festón |
| `qxT(p,c,s)` | espejo (`_qxFlip`), rotación (`_qxRot`) y traslado al centro |

**La escala al «tamaño real» la hace el CSS** (`width:100%` con `max-width:420px`), no una
multiplicación: así las proporciones se conservan por construcción y la letra de 13 px se ve a
13 px. **El precio, declarado:** el bloque pasa de 500 × 279 px a 420 × 420.

**Medido sobre los puntos renderizados:** anillo de 90 vértices con semieje horizontal **120** y
verticales **64 arriba / 100 abajo**; coaptación de 30 vértices con **flecha 46,2** sobre un ancho
de 232 —con una recta la flecha sería cero, que es lo que el dibujo viejo dibujaba—.

---

## 3 · Los festones y el ciclo de lesiones

Los seis polígonos **conservan sus ids** (`ete-qx-A1` … `ete-qx-P3`) y su **convención de color**:
el relleno y el trazo de base van en **ATRIBUTOS** y la lesión en el `style`. Eso es lo que hace
que `eteClick`, `eteLimpiarSegmentos` y `eteQxDataURL` sigan funcionando **sin que se les toque una
línea**: el pintor escribe `style.fill` y en «Normal» hace `removeProperty`, que descubre el
atributo de abajo.

⚠️ **SI ALGUNA VEZ EL RELLENO BASE SE MUEVE AL `style`**, el primer regreso a «Normal» deja el
festón en `fill:none` y **desaparece del dibujo para siempre**, sin error y sin consola.

⚠️ **TODO LO QUE NO ES FESTÓN NI RÓTULO LLEVA `pointer-events:none`.** Sin eso el anillo —un
polígono de 90 vértices sobre la boca entera— se come todos los toques y ningún festón cicla.

⚠️ **EL TOQUE NO ES UN `onclick`**, desde el commit del giro: lo decide el **recorrido** del
puntero contra el umbral de **6 px** de la demo, medido sobre el recorrido **acumulado**
(`|dx| + |dy|` máximo) y no sobre la distancia final —un arrastre que vuelve al punto de partida
tiene distancia final cero y **sí** es un arrastre—. Con `onclick`, el médico que gira el dibujo
empezando sobre una valva le cambiaba el diagnóstico al soltar.

---

## 4 · La línea del plano de corte

El ángulo vive en los **cinco botones del 3D** que ya existen (`m3d-a-0` … `m3d-a-120`); el dibujo
**sólo los escucha** y no se le agrega ni un botón de ángulo.

- Línea **neutra** punteada (`var(--text)`, `7 5`), por los extremos que `ETE_CORTES` publica.
- Los festones que corta: `font-weight: 800` **y subrayados**. ⚠️ **EL `fill` NO SE TOCA**: los
  seis colores de lesión están **reservados**, y marcar un festón cortado con uno de ellos diría
  que tiene un trastorno donde sólo hay un corte.
- Rótulo chico «ETE 60°». Sin ángulo no hay línea, ni rótulo, **ni punto del centro**.

⚠️ **EL TOGGLE VIVE EN EL DIBUJO Y NO EN `m3dAngulo`, Y ES LO QUE PERMITE NO TOCAR EL 3D.**
`m3dAngulo` **no** togglea —hace `_m3dAng = a` siempre—, así que «volver a tocar el mismo ángulo»
no se deduce del ESTADO: hay que ver el **CLIC**. De ahí el oyente de documento en fase de
**CAPTURA**, que corre ANTES del `onclick` del botón; en burbuja, el primer clic ya vería el ángulo
puesto y lo apagaría.

⚠️ **`eteQxPlanoSync` SÓLO APAGA, nunca prende**: es la puerta por la que el cierre del panel y el
cambio a una **vista** del 3D —los dos dejan `_m3dAng` en nulo— se llevan la línea. Es **la única
línea** que esta tanda le agrega a `m3dBotonesSync`.

⚠️ **CONSECUENCIA DECLARADA:** tocar dos veces el mismo ángulo deja el **botón del 3D marcado** y
el dibujo **sin línea**. `PENDIENTES.md` → **Y3c-2**.

---

## 5 · El giro

El gesto es el de la demo, línea por línea: el ángulo del puntero respecto del centro, la
diferencia normalizada a ±180, la inercia como media móvil de esa diferencia y el roce de **0,94**
por cuadro. Puntero y táctil por los mismos oyentes, con captura y `touch-action:none`. Las flechas
izquierda y derecha del teclado, **15° por pulsación**. **Sin zoom y sin botones de girar.**

⚠️ **EL BUCLE NO ES PERPETUO.** Un `requestAnimationFrame` colgado para siempre repinta sesenta
veces por segundo con la pestaña ETE abierta y sin que nada se mueva — es por lo que el panel 3D
apaga el suyo al cerrarse. Se **enciende** con un gesto y se **apaga** al converger. Medido
espiando `requestAnimationFrame`: **cero cuadros en 700 ms con el dibujo quieto**, antes y después
de girar.

⚠️ **SE CABLEA UNA SOLA VEZ**: la guarda de `eteQxConstruir` más la de `_qxCableado`. Medido:
**veinte reconstrucciones agregan cero oyentes nuevos**. Sin ellas cada reconstrucción apilaría un
juego y el dibujo giraría el doble por gesto.

---

## 6 · Las tres vistas

| botón | cámara | letras de festón |
|---|---|---|
| Vista del cirujano | `rot 0`, sin espejo | **sí** |
| Vista ETT | **espejo** (`flip −1`), `rot 0` | **sí** (desde el Y3d) |
| Vista transgástrica | `rot 180`, sin espejo | **sí** (desde el Y3d) |

### ⚠️ Y3d1 (2026-10-19) — LAS LETRAS SE VEN SIEMPRE, Y LA CAUSA TENÍA NOMBRE

Lo reportó Maicol probando: los rótulos **desaparecían al girar** y las vistas ETT y transgástrica
salían **sin una sola letra**. **La causa era UNA línea de `eteQxVistasSync`**:

```js
var conLetras = (cAhora === 'cir');
N.lbl.forEach(function(l){ l.e.setAttribute('display', conLetras ? 'inline' : 'none'); });
```

o sea las letras colgaban de que la cámara **en pantalla** fuera exactamente la del cirujano —con
la tolerancia de 8° de `qxClase`—. Por eso también se iban **girando a mano**: en «libre» la clase
no es `cir`. Hoy esas dos líneas no están y `ETE_QX_VISTAS` **perdió su campo `letras`**: no hay
una segunda copia de la decisión, porque no hay decisión.

**MEDIDO: los SEIS rótulos se ven en las TRES vistas y en los OCHO ángulos de giro** (0, 45, 90,
135, 180, 225, 270 y 315°), y también durante el arrastre. Es la demo aprobada, que los muestra
siempre.

⚠️ **LA ORIENTACIÓN TRANSGÁSTRICA SE VERIFICÓ Y NO COINCIDE CON LA DEMO — REPORTADO, SIN TOCAR EL
DIBUJO.** **Censadas las OCHO guías de ETE de la biblioteca**, la única que describe la orientación
de esa vista es la **ASE/SCA 2013** (Hahn, JASE 2013;26(9):921-964), **folio 939, hoja 19** —regla
de folio = hoja + 920, comprobada en el pie impreso de las hojas 11 y 21 **y en esa misma hoja**—,
que dice textual:

> «This view demonstrates the typical SAX view or "fish mouth" appearance of the MV in the TG
> imaging plane with the **anterior leaflet on the left of the display and the posterior leaflet on
> the right**. The **medial commissure is in the near field, with the lateral commissure in the far
> field**.»

O sea: valva **anterior a la izquierda**, **posterior a la derecha**, comisura **medial arriba** y
**lateral abajo** — que es un giro de unos **90°**, no de 180°. La demo rotada 180° deja la
anterior **abajo**, la posterior **arriba**, AL a la derecha y PM a la izquierda. **No coincide.**
La demo es la que Maicol aprobó, así que **el dibujo no se cambió**: queda declarado en
`FUENTES.md` como **orientación: criterio de Maicol**. Las letras se muestran igual —lo que esta
tanda corrige es que el médico vea la nomenclatura; la orientación es una decisión suya—.

⚠️ **LA CÁMARA SE ANIMA, Y ESO DA UN FALSO AL MEDIR.** Como la decisión colgaba de la cámara **en
pantalla**, una condición que cuenta letras **justo después del clic** encuentra la cámara todavía
en la del cirujano y **pasa también contra el árbol viejo**. Lo cazó correr TC-504 contra el inicio
de la tanda, no la lectura: dos condiciones salían verdes sobre un árbol que **sí** las escondía.
El caso lleva la cámara al **destino** de la vista (`window._qxRot`, `window._qxFlip` —son `var`
de nivel superior, o sea propiedades de `window`—) y repinta antes de contar.

⚠️ **EL BOTÓN SE DESMARCA AL GIRAR A MANO, Y LO DECIDE `qxClase` CLASIFICANDO LA CÁMARA**, no una
bandera: con una bandera, girar un grado dejaría el botón marcado sobre una orientación que ya no
es la suya. La tolerancia de 8° es la de la demo, y `qxCerca` lleva el destino al múltiplo de 360
más cercano para que el giro vaya por el camino corto.

⚠️ **EL AVISO VA AL EMPEZAR Y NO SÓLO AL CONVERGER, y lo destapó TC-503**: el botón se desmarcaba
recién cuando el dibujo terminaba de moverse, o sea quedaba marcada una orientación que ya no era
la del destino durante todo el giro.

⚠️ **CON PRÓTESIS MITRAL LOS TRES BOTONES NO APARECEN**, por el MISMO predicado que el botón del
3D (`m3dEsProtesis` → `valvEsProtesis`). Va con `hidden` **y** con `display`, porque
`[hidden]{display:none}` vive en la hoja del **navegador** y cualquier regla de autor le gana.

---

## 7 · El PDF

`eteQxDataURL` dibuja el canvas **de la misma geometría que la pantalla**: antes tenía los seis
paths del dibujo viejo escritos a mano, o sea **dos dibujos del mismo órgano** que se separaron en
cuanto la pantalla cambió.

⚠️ **EL PAPEL VA SIEMPRE EN LA VISTA DEL CIRUJANO, SIN ROTAR Y SIN ESPEJO**: es la única
orientación verificada y un informe firmado no puede depender de cómo el médico dejó girada la
pantalla. Medido por el hash del data URL: con un ángulo elegido, girado 90° y en ETT el papel sale
**idéntico**. Y el **control**: con las lesiones borradas sale con otro hash, así que esa
comparación prueba algo.

**Sin la línea del plano ni los festones en negrita.** La caja pasa de 120 × 66,9 mm a
**100 × 100 mm** y `checkPage` de 92 a **125**. **Lo incluyen las SEIS plantillas** (el bloque vive
en `generarPDFReal`, gateado por `ete_qx_pdf`).

⚠️ **EL DIBUJO IMPRESO SE ACHICA** de unos 76 a unos 57 mm de ancho, porque el lienzo nuevo tiene
el aire que el dibujo necesita para girar. `PENDIENTES.md` → **Y3c-3**.

---

## 8 · Los cuatro dibujos de medidas TEER

| dibujo | campo | bloque | plano |
|---|---|---|---|
| Profundidad de coaptación | `teer_prof_flail` | IM secundaria | 4 cámaras |
| Longitud de coaptación    | `teer_gap`        | IM secundaria | 4 cámaras |
| Flail gap                 | `teer_flail_gap`  | IM primaria   | 4 cámaras / TSVI |
| Flail width               | `teer_ancho_flail`| IM primaria   | eje corto |

Son **marcado estático** —ni un dato concatenado en `innerHTML`— y lo único que `teerFigSync`
escribe es el `textContent` del `<text>` del valor. **Lo que se mide va en celeste `#1BA3B8`**, que
no es color de ninguna lesión, y el segmento flail en el **rojo de Flail** (`#ef4444`).

⚠️ **UN CAMPO VACÍO ES SIN DATO**, la regla que el ARR dejó escrita: `v()` devuelve `null` y el
dibujo se queda **sin número**, en vez de conservar el anterior o publicar «0 mm».

⚠️ **LAS PUNTAS DE FLECHA LLEVAN COLOR FIJO EN EL MARCADOR**, no heredado: Safari no soporta el
color heredado en marcadores.

⚠️ **LAS LÍNEAS NO SE SUPERPONEN**: el plano del anillo se dibuja **primero**, o sea **detrás** de
las paredes del VI, y las figuras con relleno van sin trazo de cierre.

**La maqueta, medida a 1200, 768 y 390 px en los dos temas:** a 1200 px la imagen va **al lado**
(92 px) y el `<input>` conserva **138 px**; a 768 y 390 px pasa **debajo** (120 px) y el input
recupera su ancho entero (706 y 328 px). Cero scroll horizontal y cero solapamientos. **La bajada a
768 px es la alternativa mínima** que la orden pide: con la imagen al lado el input queda por
debajo de lo usable en el celular, y ni se achica el dibujo ni se esconde.

### ⚠️ Y3d2 (2026-10-19) — LOS CRITERIOS TEER: cuatro defectos, medidos antes de tocar nada

Los cuatro los reportó Maicol y los cuatro **se reprodujeron** contra una copia del árbol de
entrada:

| qué pasaba | medido en el árbol viejo | hoy |
|---|---|---|
| el **flail gap** tenía campo y rótulo «Excl: ≥10mm» y **ninguna fila**, y nadie lo leía | 12 mm → «**APTO**» | fila «Flail gap <10 mm», y 12 mm deja de ser apto |
| «Gap coaptación ≤10mm» se aplicaba al campo de la **LONGITUD** de coaptación | una longitud de 2 mm «cumplía» un corte que no es el suyo | «Longitud de coaptación ≥2 mm», y el rótulo del campo dice «Req: ≥2mm» |
| la fila del **ancho del flail** contradecía su propio rótulo | el rótulo decía `<15` y la fila votaba otro borde | «Ancho del flail <15 mm» — **el único borde que se mueve** |
| un criterio **sin dato** no frenaba el «APTO» | faltando el gap, el veredicto decía apto | «⚠️ Datos incompletos — falta: …», **nombrando cada criterio** |

**MEDIDO por sus tres valores cada uno:** flail gap 9,9 cumple / **10 exacto NO** / 10,1 no; ancho
14,9 cumple / **15 exacto NO** / 15,1 no; longitud 1,9 no / **2 exacto SÍ** / 2,1 sí.

⚠️ **LA GUARDA `> 0` DEL VIEJO CRITERIO TUVO QUE IRSE, y no es un descuido.** El corte nuevo es un
**PISO** (`≥2`), así que con `v > 0 && v >= 2` un valor de 0 —que es un dato, no un hueco— quedaba
**sin evaluar** en vez de **no cumplir**. Un piso falla cerrado por sí solo.

⚠️ **`_NO_APLICA` TIENE DOS COPIAS Y LAS DOS NECESITAN LA FILA NUEVA**: la del pintado de
`calcTEER` y la de la hoja del PDF (`amiloTextoTEER`). Con una sola, el papel firmado publicaba la
fila sin su marca de «no aplica» en la IM secundaria.

⚠️ **LAS FUENTES QUE LA ORDEN SUPONÍA NO ESTÁN EN LA BIBLIOTECA, Y SE DECLARA.** Censada entera:
**no hay** EVEREST II (Eur Heart J 2010;31(11):1382-1389) ni el protocolo EXPAND (NCT03502811). Los
tres cortes son los que la app ya aplicaba —el valor no se movió, lo que cambió es **a qué campo**
y **con qué operador** se aplican—, así que las filas **no llevan línea de fuente**.

**Cómo se tratan los criterios COAPT (FEVI y DSFVI) sin dato — reportado y NO cambiado:** caen en
la misma rama de «no evaluado» y desde esta tanda **también** frenan el «APTO» y se nombran en
«falta: …». Antes no frenaban nada.

### ⚠️ Y3d3 (2026-10-19) — LA FEVI Y EL DSFVI DEL TEER SE COMPLETAN SOLOS

**La copia funcionaba; lo que faltaba era el DISPARADOR.** `sincronizarTEERDesdeGlobal` existía y
copiaba bien llamándola a mano, pero **ningún campo de origen la llamaba**: `fevi` y `dsfvi` de
AI/VI tenían su `oninput` sin esa línea, así que el TEER se quedaba con el valor del paciente
anterior —o vacío—. Hoy los dos la llaman, y **al borrar el origen los dos campos del TEER vuelven
a vacío**, que es la regla del ARR.

**El rótulo se unificó a «DSFVI»** en el campo y en el criterio —que es lo que lee la hoja del
PDF—. **Los dos cortes COAPT no se movieron**: FEVI 20-50 % y DSFVI ≤70 mm.

---

## 9 · Trampas medidas en esta tanda

1. **EL `\s` DE UN REGEX SE COCINA DENTRO DEL TEMPLATE DE UNA SONDA**, otra vez: `split(/\s+/)`
   llegó al motor como `/s+/` y el parseo de los `points` devolvió **un solo vértice**, con el
   anillo informando radio 0 y la flecha de la coaptación en 0 — o sea «el dibujo es una recta»
   sobre una sonrisa perfecta. Va con **doble barra en el ARCHIVO**.
2. **EL DIBUJO VIVE DENTRO DE `#ete-seccion-mitral`, QUE NACE PLEGADA.** Sin abrirla el SVG existe
   y mide 0 × 0, y la lectura informa «el dibujo no se dibuja».
3. **EL `clip` DE `Page.captureScreenshot` VA EN COORDENADAS DE PÁGINA** y
   `getBoundingClientRect` da las del **viewport**: sin sumar el desplazamiento, el PNG sale de
   otra parte de la página — y se ve perfectamente bien. La primera tanda de capturas salió del
   encabezado de la tarjeta.
4. **EL TEMA HAY QUE EXIGIRLO, NO PEDIRLO.** Las ocho primeras capturas dieron **4 md5 distintos de
   8**: claro y oscuro habían salido idénticos. La sonda **aborta** si la clase `light-mode` no
   quedó puesta.
5. **EL BOTÓN DEL 3D NACE `hidden`** y lo enciende `m3dBotonSync`, que corre desde
   `RECALC_MODULOS`: en un árbol recién cargado hay que llamarlo, o el caso informa «no hay botón
   del 3D» sobre un botón que el médico ve.
6. **UN `.click()` SINTÉTICO NO CICLA LA LESIÓN** desde el commit del giro, porque los polígonos ya
   no tienen `onclick`: hay que despachar `pointerdown` + `pointerup`. La primera versión de TC-503
   informó «el ciclo no funciona» sobre un ciclo perfecto, **y además dejó en falso al control del
   PDF**, que compara el papel con y sin lesión.
7. **EL ACENTO GRAVE, TRECE VECES**, todas en comentarios míos: dos dentro del template de un
   `evCrudo()` suelto de la sonda —que `scripts/check_backticks.py` **no alcanza**, porque su
   cobertura es el cuerpo de un `caso(...)` y el de la sonda inyectada; ésos los dio
   `node --check`— y once dentro del cuerpo de TC-503, que el script sí dio con su línea exacta.

---

## 10 · Cómo medirlo

```bash
node scripts/_probe_y3c.mjs --solo tabla        # la tabla y los cuatro esquemas
node scripts/_probe_y3c.mjs --solo dibujo       # geometria, marcas, toque
node scripts/_probe_y3c.mjs --solo plano        # los cinco angulos desde el 3D
node scripts/_probe_y3c.mjs --solo giro         # arrastre REAL por CDP, flechas, rAF
node scripts/_probe_y3c.mjs --solo vistas       # las tres vistas y la protesis
node scripts/_probe_y3c.mjs --solo teer         # los cuatro dibujos y su valor
node scripts/_probe_y3c.mjs --solo ciclo,maqueta
node scripts/_probe_y3c.mjs --solo captura,capteer,png --dest /tmp/y3c
node scripts/_probe_y3c.mjs --solo ctrl         # los controles
node scripts/_probe_y3cwk.mjs --dest /tmp/y3c   # los DOS motores
node scripts/test_clinico.mjs --solo TC-503
```

Para el A/B, la misma sonda con `--file /ruta/index.HEAD.html`.

---

## 11 · Lo medido en los DOS motores

**Chrome por el canal del sistema y WebKit de Playwright, 12 celdas cada uno** —seis viewports
(1200×700, 1440×800, 1920×1080, 768×1024, 390×844, 360×740) × dos temas, con el tema
COMPROBADO—:

- **CERO abortos y CERO scroll horizontal de la página en las 24 celdas.**
- El dibujo mide **420 × 420** a 1200, 1440, 1920 y 768 px; **328 × 328** a 390; **298 × 298** a 360.
- Los seis festones, el anillo y las cuatro marcas (`Ao|orejuela|AL|PM`) en las 24.
- La **tabla** y el **censo de los cuatro esquemas** salen **idénticos** en los dos motores y en
  las doce celdas de cada uno.
- Los colores resuelven **reales y distintos** en los dos temas —`rgb(232,236,244)` de noche y
  `rgb(26,34,51)` de día para el anillo y los rótulos— e **IDÉNTICOS entre motores**.
- La lesión de P2 se pinta `rgba(239,68,68,0.333)` en los dos.
- **20 aperturas y cierres del panel 3D: 11.980 nodos → 11.980, delta CERO**, con el panel cerrado
  y la línea del plano apagada al final, **en los dos motores** y con una vuelta de calentamiento
  antes de contar.
- **80 capturas PNG con los 80 `md5` DISTINTOS**, y dos **MIRADAS**: el dibujo en WebKit a 390 px
  con los acentos completos («orejuela») y el dibujo del flail gap en tema claro.

⚠️ **WebKit de Playwright NO es Safari, y se declara.**

⚠️ **LA MIRADA CAZÓ UN DEFECTO QUE NINGUNA MEDICIÓN NUMÉRICA DA:** en el dibujo del flail gap el
«7 mm» quedaba **pegado a la flecha** y, al correrlo, **encima de la valva anterior**. Terminó
arriba de todo (`x=190, y=56`), donde no cruza ninguna línea. Es para lo que están las capturas.

---

## La vista TRANSGÁSTRICA sigue a la guía — «Y3e2» (2026-10-20)

**Decisión de Maicol.** Cierra `PENDIENTES.md` → **Y3d-1** por su salida (b).

`ETE_QX_VISTAS.tg` pasa de **`rot: 180`** a **`rot: 270`**, o sea el dibujo de la vista del
cirujano girado **90° ANTIHORARIO y sin espejo**. `qxClase` reconoce 270 en vez de 180, con la
misma tolerancia de 8° que las otras dos. **Son dos valores; ninguna otra pieza se toca.**

### La fuente, verificada en el original

**ASE/SCA 2013** (Hahn y col., *JASE* 2013;26(9):921-964), **hoja 19, folio 939** — regla
folio = hoja + 920, comprobada en el pie impreso «*Journal of the American Society of
Echocardiography Volume 26 Number 9 Hahn et al 939*» —, vista *TG Basal SAX*:

> «This view demonstrates the typical SAX view or "fish mouth" appearance of the MV in the TG
> imaging plane with the **anterior leaflet on the left** of the display and the **posterior
> leaflet on the right**. The **medial commissure is in the near field**, with the **lateral
> commissure in the far field**.»

### Lo que dice la guía → lo que muestra el dibujo

Medido sobre el lienzo **renderizado** (centro en 210, 219), marca por marca y letra por letra:

| la guía | el dibujo | ✓ |
|---|---|---|
| valva **anterior** a la IZQUIERDA | marca `Ao` en (110, 219); A1/A2/A3 con x ≈ 190 | sí |
| valva **posterior** a la DERECHA | P1/P2/P3 con x entre 237 y 275 | sí |
| comisura **medial** en el campo cercano | `PM` en (210, 61), **arriba** | sí |
| comisura **lateral** en el campo lejano | `AL` en (210, 377), **abajo**, con la orejuela al lado | sí |

**Cero diferencias con la guía.** Las **seis letras** de festón siguen visibles (6/6) y las cuatro
marcas giran con el dibujo por construcción: son puntos del mismo espacio local.

### Tres cosas que conviene saber antes de tocar esto

- ⚠️ **EL GIRO ANTIHORARIO ES `rot` NEGATIVO**, y no es una convención arbitraria: `qxT` aplica
  `x·cos − y·sin` / `x·sin + y·cos` sobre un eje `y` que **crece hacia abajo**, así que un ángulo
  **positivo** gira **horario** en pantalla. Se escribe **270** porque es el valor normalizado que
  `qxClase` compara; `qxCerca` lo lleva a **−90**, que es el camino corto, y eso es lo que el
  estado publica.
- ⚠️ **LA VISTA ETT NO CAMBIA Y SIGUE SIENDO CRITERIO DE MAICOL.** Censada la biblioteca entera,
  ninguna fuente publica de qué lado quedan las comisuras en el eje corto paraesternal mitral.
  Declarado en `FUENTES.md`.
- ⚠️ **EL PDF SIGUE EN LA VISTA DEL CIRUJANO**, y está medido: el hash del data URL es
  **1168035940** en las **tres** vistas y es el mismo de antes de la tanda. Un informe firmado no
  puede depender de cómo el médico dejó girada la pantalla.
- ⚠️ **NO SE TOCÓ `docs/3d/`**: la demo conserva su giro de 180°, que es el que Maicol aprobó ahí.

### Cómo medir esta zona

`node scripts/_probe_y3e.mjs --solo tg` da la tabla de las tres vistas con sus cuatro marcas, sus
seis letras, los tres botones y el hash del data URL del PDF.
⚠️ **AL MEDIR DESDE UN CASO, PLANTAR LA CÁMARA EN EL DESTINO**: se anima con
`requestAnimationFrame` y el cuerpo de un caso corre sincrónico, así que leer justo después del
clic la encuentra donde estaba. `qxGirarA` sola **no alcanza**: fija el ángulo y no el flip.

---

## El espejo de la FEVI y el DSFVI del TEER cuelga del DUEÑO — «Y3e1» (2026-10-20)

El **Y3d3** había puesto el disparador en el `oninput` de `fevi` y de `dsfvi`. Eso cubre **un**
camino: el de tipear. Lo demás no pasa por ahí.

### La tabla de caminos, medida con teclas y clics reales contra el inicio de la tanda

| camino | antes | hoy | por qué fallaba |
|---|---|---|---|
| tipear en el origen, sección abierta | 45 / 58 | 45 / 58 | — |
| tipear con la sección **cerrada**, y después abrirla | 45 / 58 | 45 / 58 | — |
| **valor escrito por PROGRAMA + `calcVI`** | **vacío** | 45 / 58 | asignar `.value` **no dispara `oninput`** |
| **cambiar «FEVI método»** | **vacío** | 45 / 58 | su `onchange` llama a `calcVI`, no al espejo |
| estudio guardado reabierto (`editarInforme`) | 45 / 58 | 45 / 58 | corría de rebote, por `calcPSAP` |
| **`RECALC_MODULOS`** (autosave, QR del PDF) | **vacío** | 45 / 58 | ahí `calcPSAP` no corre |
| abrir / tipear / cerrar / reabrir | 45 / 58 | 45 / 58 | — |
| **borrar el origen** con teclas | vacíos | vacíos | correcto en los dos (regla del ARR) |
| cambiar el «Tipo de IM» | 45 / 58 | 45 / 58 | — |
| **control**: valor tipeado a mano en el TEER | 33 / 44 | 33 / 44 | el espejo lo respeta |

Con los dos campos vacíos la lista publicaba **«No ingresado»** y los criterios **c7** y **c8**
del COAPT —que deciden **APTO / NO APTO**— se evaluaban sobre un dato que el médico ya tenía
cargado.

### El arreglo: dos puntos, no nueve

1. **La cola de `calcVI`.** Es el dueño de lo que AI/VI muestra de ese ventrículo y **no tiene un
   solo `return` temprano** —censado—, así que colgarse de ahí cubre de una vez a todos sus
   llamadores: los dos `oninput`, el `onchange` del método, `calcBSA`, `editarInforme` y las dos
   fases de la ventana de reimpresión. Es el mismo argumento que el comentario del VI 3D que vive
   dos líneas más arriba.
2. **El final de `RECALC_MODULOS`**, para las **dos** rutas que no pasan por `calcVI` ni por
   `calcPSAP`: el `autosave` —el borrador que vuelve tras un F5— y `cargarEstudioPorId` —el QR del
   PDF firmado—.

**Las dos llamadas de los `oninput` se retiran** en el mismo movimiento: con el dueño puesto son
una segunda copia de la misma decisión, y la copia que se olvida es la que miente.

- ⚠️ **LA POSICIÓN EN `RECALC_MODULOS` IMPORTA**: va al **final**, después de
  `imEspejosRestaurar`, que es la que repone `dataset.espejoDe` sobre los nueve destinos. Antes de
  ella no hay marca y el espejo trata como **manual** a todo destino poblado.
- ⚠️ **NO PUEDE BORRAR UN VALOR GUARDADO**, y la guarda que lo impide **ya existía**:
  `_syncDerivado` vacía el destino sólo si la marca es de **esta sesión** (`espejoVivo`), e
  `imEspejosRestaurar` repone `espejoDe` y **no** `espejoVivo`. Así que un estudio donde
  `psap_calc` vuelve en blanco —un importado sin colapso de la VCI— conserva su `teer_pasp`.
- ⚠️ **SIN RECURSIÓN, y está censado**: `sincronizarTEERDesdeGlobal` termina en `calcTEER`, cuya
  única mención de una función de cálculo es la suya propia.
- ⚠️ **NO SELLA NADA**: la sincronía del TEER no llama a `_imEspejosGuardar` —su comentario lo
  declara—, así que el registro de espejos no se toca desde acá.

**Los cortes COAPT no se movieron** (FEVI 20-50 %, DSFVI ≤ 70 mm), medidos por sus cuatro bordes:
19/20 y 50/51 % · 69/70 y 70/71 mm. El espejo **sigue al origen** mientras el destino sea su
espejo y **respeta lo tipeado a mano**, que es lo que `_syncDerivado` ya hacía.

**Cómo medir:** `node scripts/_probe_y3e.mjs --solo teercam` corre los diez caminos con teclas y
clics reales y devuelve la tabla completa.
