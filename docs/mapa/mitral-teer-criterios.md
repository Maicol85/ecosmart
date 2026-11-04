# Los CRITERIOS TEER de la mitral y el espejo de la FEVI — partido de `mitral-dibujo-estatico.md`

> **Partido en la tanda PANT-11 (2026-11-04)** porque el mapa de origen cruzó el techo de ~35 KB
> al recibir el puntero de esta tanda: estaba medido en **34.594 B** y el puntero lo llevó a
> **35.618**. Es el pendiente **P6-h**, que esperaba desde PANT-6. **Cero líneas perdidas**: lo
> que salió son los cuatro dibujos de medidas TEER, sus criterios, el espejo de la FEVI y el
> DSFVI, y los punteros de las tandas R, CONG-2A, PANT-6 y PANT-11. Lo que queda en el mapa de
> origen son los festones, la geometría, las tres vistas, el PDF y la transgástrica.

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

---

## La FEVI y el DSFVI son UN SOLO VALOR, con espejo en los DOS SENTIDOS — «Y3f1» (2026-10-20)

El Y3e1 dejó el espejo colgando del **dueño** (`calcVI` y `RECALC_MODULOS`), así que AI/VI → TEER
funcionaba por los diez caminos. Lo que faltaba es la **vuelta**: el médico que cargaba el DSFVI
estando en la pestaña del TEER dejaba `dsfvi` vacío, y con él el cuadro de AI/VI, la referencia y
todo lo que lee ese ventrículo.

**MEDIDO contra HEAD antes de tocar nada: la vuelta fallaba en 0 de 5 caminos** —no es que fallara
a veces, es que no existía—.

### Las piezas

```js
const _TEER_ESP_INV = Object.freeze({ teer_fevi: 'fevi', teer_dtsvi: 'dsfvi' });
let _teerEspSinc = false;
function teerEspejoEditado(origenId) { … }
```

Los dos `oninput` del TEER llaman a `teerEspejoEditado`, que copia al dueño, **registra la marca de
espejo sobre el campo del TEER** (`dataset.espejoDe` + `espejoVivo`) y corre la cadena del dueño:
`calcVI`, y con la FEVI además `aoRefPintar` y `calcDiastol`.

Y en `imEspejosRestaurar` entra una **PASADA INVERSA** antes de `_syncDerivado`, para el estudio
que trae el valor en el campo del TEER y el dueño vacío.

⚠️ **LA GUARDA DE RE-ENTRADA NO ES POR EL `oninput`, Y CONVIENE SABER POR QUÉ.** Asignar `.value`
por código **no** dispara `oninput`, así que el bucle directo no existe; `_teerEspSinc` está para
el día en que alguien despache un `input` a mano —los arneses lo hacen— y, sobre todo, para que la
pasada inversa de `imEspejosRestaurar` y `_syncDerivado` no se pisen entre sí.

⚠️ **EL ORDEN DENTRO DE `imEspejosRestaurar` IMPORTA: la pasada inversa va ANTES de
`_syncDerivado`**, y se salta el par cuyo destino ya está marcado como nuestro espejo vivo —ése lo
resuelve `_syncDerivado`, que es su dueño—. Al revés, un destino vacío se llenaría desde el dueño
vacío y la vuelta no tendría de dónde salir.

⚠️ **LOS CORTES COAPT NO SE MOVIERON** (FEVI 20-50 %, DSFVI ≤70 mm), medidos por sus **cuatro**
bordes, y el rótulo de los dos campos pasa a declarar el espejo: «FEVI (%) ↔ AI/VI» y
«DSFVI (mm) ↔ AI/VI», que es el mismo formato con que el LARS y el strain de contracción de la AI
anuncian el suyo.

⚠️ **`teer_pasp` SIGUE SIENDO DE UNA SOLA DIRECCIÓN, Y ES LO CORRECTO**: su origen `psap_calc` es
`readonly` y lo calcula la app, así que no hay nada que escribir hacia arriba. Esa asimetría es lo
que hizo falta para adaptar **TC-301**: las cinco condiciones que medían «un valor tipeado a mano
no se pisa» y «el fallback no inventa una marca» se mudaron a ese par, porque sobre la FEVI y el
DSFVI **ya no son alcanzables por construcción** —tipear ahí es editar el dato—.

## La tanda «R» (2026-10-20) — los criterios TEER y su pie de fuentes

La **profundidad de coaptación** pasa de `<10 mm` a **`<11 mm`** (Tamburino 2010, Tabla 1,
folio 1386, que excluye `≥11`), y cambia en **los dos** lugares que la leen: `c4` de `calcTEER`
y `_LAB_TEER_CRIT`, que es lo que la hoja del PDF consume — con uno solo, la pantalla y el papel
firmado graduarían distinto el mismo número. La PSAP pasa a **`≤70 mmHg`** y el DSFVI a
**`≤70 mm` telesistólico** (ESC/EACTS 2025, Tabla 7, folio 4678). Debajo de la caja entra un pie
ESTÁTICO con las tres fuentes y el chip «CRITERIO DE ECOSMART» para el 20-50 % de FEVI, que sale
de COAPT.

→ `docs/mapa/tanda-r-referencias.md` § 2.

---

## Puntero — la tanda CONG-2A (2026-10-31 y 2026-11-01)

Lo que esa tanda movió de esta zona está en **`docs/mapa/cong2a-desmarcar-tga-teer.md`**:

- Los **cuatro dibujos de los criterios TEER** pasaron a la derecha de su campo: `.teer-figrow`,
  `.teer-figcol` y `.teer-fig` estaban en el marcado desde que la sección existe y **no tenían una
  sola regla** en la hoja de estilos. Cada dibujo pasa de 290×226 a **150×117** a 1440 px y el alto
  de los catorce campos de 937 a **619 px**; a 768 px, de 706×552 y 3.204 px a 220×172 y 1.706.
- **Ni una etiqueta, ni un corte, ni un veredicto se movió**: es CSS, tres reglas y una consulta de
  medios. Las tres etiquetas que el médico conserva —«NO apto», «Heart Team», «anatomía
  compleja»— llegan a la hoja del PDF, medido con denominador: `C2A-c`.

---

## Lo que la tanda PANT-6 movió de los criterios TEER (2026-11-03)

- **La IM primaria y la IM secundaria se ven las DOS, siempre**, con todos sus campos habilitados,
  en los tres valores del selector de tipo. Lo que se retiró son **dos líneas**, comentadas y no
  borradas: `_mostrar('teer-bloque-primaria', !r.esSec)` y su par de la secundaria.
- **La maqueta son tres filas**: `#teer-arriba` (franja común), `#teer-medio` (los dos cuadros) y
  `#teer-abajo` (criterios comunes + conclusión), las dos últimas en dos columnas desde 900 px.
- **El veredicto no cambió**, y es por construcción: los criterios siguen declarando su `tipo`
  (`prim` / `sec`) y el evaluador aplica sólo los que corresponden.
- **El rótulo de `teer_prof_flail` pasa a «Profundidad coaptación — TEER (mm)»** y el de
  `ete_prof_coapt` a «— reparación». **Ningún id cambió** y los rótulos del Excel y del papel
  tampoco. **Siguen sin sincronizarse a propósito**: son dos cortes distintos, 11 y 10 mm.

**Ver `docs/mapa/pant6-pantallas-molde.md` § 5 y § 6.**

---

## Puntero · PANT-11 (2026-11-04) — la profundidad de coaptación, un dato con dos puertas

`ete_prof_coapt` (ETE, morfología mitral) y `teer_prof_flail` (criterios TEER) pasan a ser **un
solo valor con dos puertas**: el par entra en `_ETEM_VELOS` —el dueño único del gesto, el borrado
incluido— y `profCoaptReconciliar` cubre el otro camino, un estudio guardado antes de que el
espejo existiera. Es idempotente, cuelga de `RECALC_MODULOS` y **sólo completa lo vacío**: con los
dos cargados y DISTINTOS no toca nada.

⚠️ **Los dos ROTULOS siguen distintos** —«reparación» y «TEER», que los separó PANT-6—: son dos
cortes distintos, 10 mm como factor desfavorable de la reparación y 11 mm como criterio de
exclusión del TEER. **Lo que se unifica es el valor, no el significado.**

⚠️ **ESTO REVIERTE LA PARADA DE `P6-f` Y DE `P5-f`, Y ES UNA ORDEN EXPRESA DEL MÉDICO** del
2026-11-04. Esas dos entradas decían que los dos campos **no** debían sincronizarse —«son dos
datos distintos y unirlos cambiaría el criterio c4 del TEER»— y **TC-648 (D5)** era el control
negativo que lo fijaba. Hoy esa condición está **invertida**: exige que el valor viaje, y nace
**(D5b)** para exigir que los dos cortes sigan separados, así que el grupo puede volver a fallar
por los dos lados. **Antes de volver a separarlos, leer esto: está decidido.**

⚠️ **NO es el flail gap:** `teer_flail_gap` y `teer_ancho_flail` son otras dos medidas y no entran
en el registro.

Ver `docs/mapa/pant11-vci-pulmon-masas.md` § 4 y **TC-677**.
