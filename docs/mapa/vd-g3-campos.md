# Mapa — la tanda «G3» del VENTRÍCULO DERECHO (2026-10-15)

> **Mapa NUEVO por PARTICIÓN (2026-10-16).** `vd-derecho.md` estaba en **34,4 KB**, a 600 bytes
> del techo de 35 KB, y `CLAUDE.md` ya decía que la próxima tanda que lo tocara tenía que
> partirlo. La tanda M lo tocaba, así que el bloque de la G3 —la casilla de la FAC, la mudanza
> del diámetro de la arteria pulmonar y el selector de VD/VI, con sus trampas— salió acá y
> allá quedó un puntero. Medido con `wc -c` **ANTES** de escribir.
> El mapa vivo del ventrículo derecho sigue en `docs/mapa/vd-derecho.md`.

---

# La tanda «G3» (2026-10-15) — la FAC visible, el diámetro de la arteria pulmonar mudado y el selector de VD/VI

## Los DIECISÉIS campos: la columna 3 pasa a SEIS

| | columna 1 | columna 2 | columna 3 |
|---|---|---|---|
| fila 1 | TAP `tvia` (1) | VD basal `vd_bas` (6) | Diám. TSVD `tsvd_diametro` (11) |
| fila 2 | TAPSE `tapse` (2) | VD medio `vd_mid` (7) | VTI TSVD `vti_tsvd` (12) |
| fila 3 | S′ tricuspídeo `s_prime` (3) | VD longitudinal `vd_long` (8) | **Diámetro de la arteria pulmonar `ip_ap_diam` (13)** |
| fila 4 | Índice de Tei `vd_tei` (4) | VD/VI `vd_vi` (9) + **su selector `vd_vi_sel`** | Área VD telediastólica `vd_area_d` (14) |
| fila 5 | FEVD `fevd` (5) | Pared del VD `vd_pared` (10) | Área VD telesistólica `vd_area_s` (15) |
| **fila 6** | — | — | **FAC VD `vd_fac` (16)** |

El número entre paréntesis es el orden del Tab, que sigue siendo el del MARCADO y sin un solo
`tabindex`. El selector de VD/VI se recorre entre `vd_vi` y `vd_pared`.

⚠️ **LA NOVENA REGLA (`vd-r6`) LA USA UNA SOLA COLUMNA.** Debajo de la FEVD y de la pared queda
un hueco, y es lo correcto. **Es lo que hace imprescindible la posición explícita hoy**: en el
G1 el motivo era que la casilla de la FAC se escondía, y desde el G3 esa casilla está siempre
visible — lo que sostiene la regla ahora es el desbalance de columnas, que con
`grid-auto-flow` mandaría el sexto campo de la columna 3 a la fila 1 de la columna 1.

**Medido** (`scripts/_probe_g3.mjs --solo campos`), a 1200 / 390 / 360 px en los **dos temas**:
3 columnas a 1200 px y 1 por debajo de 768, **los dieciséis a 318 / 328 / 298 px —los MISMOS
anchos que en HEAD—, cero solapamientos, cero desbordes y sin scroll horizontal.**
El Tab con teclas reales recorre los dieciséis en orden de columnas, y **hoy el recorrido es el
MISMO con y sin las áreas cargadas**: en HEAD, sin ellas, saltaba la casilla de la FAC.

---

## La casilla de la FAC vuelve a estar VISIBLE — `vdFacReqSync`

Decisión de Maicol: como **antes del G1**, que la escondía hasta que hubiera dato. Lo que cambia
respecto de aquel estado es que, sin las dos áreas, el campo **dice qué le falta** en vez de
quedar en un «—» mudo. Mecanismo de los dos campos `vauto-` del VI (`viVolAutoSync` + `_req`):
el valor en `.value` y el motivo en el `placeholder`.

| Estado | Placeholder |
|---|---|
| sin ninguna área | `— requiere área telediastólica y área telesistólica` |
| con una sola | `— requiere área telesistólica` (nombra **sólo** la que falta) |
| las dos, par no utilizable | `— requiere un área telesistólica mayor que cero y menor que la telediastólica` |
| hay FAC | vacío |

⚠️ **EL PREDICADO DE «PAR UTILIZABLE» NO SE REESCRIBE: SE LO PASA `calcVD`**, que es su dueño.
Una segunda copia allá se separaría el día que se le agregue una guarda.

⚠️ **LA FILA DEL CUADRO (`row-fac-interp`) SIGUE ESCONDIÉNDOSE SIN DATO.** Son dos cosas
distintas y el médico pidió mover sólo la casilla: una casilla vacía invita a cargar, una fila
de interpretación vacía afirma que no hay nada que interpretar. `vdRefVisSync` perdió su
`_ver('fg-vd-fac', …)` y conserva los otros tres.

⚠️ **`vdFacReqSync` SE REPITE AL FINAL DE `limpiarCampos`**: el barrido genérico vacía el
`.value` y **no toca el `placeholder`**, y esa función no pasa por `RECALC_MODULOS`.

**Cómo se guardaba la FAC antes del G1:** igual que hoy. El campo nunca dejó de existir en el
DOM con su id —el G1 sólo movía el `display` de su `.fg`—, así que `guardarInforme`, el PDF y el
Excel lo leyeron siempre. **La columna «FAC VD (%)» del Excel queda idéntica**: la calcula el
exportador desde las dos áreas y no lee el campo.

---

## El diámetro de la arteria pulmonar se MUDÓ, no se duplicó

Nació en el G1 dentro de la insuficiencia de la válvula pulmonar, debajo del «Ancho del jet», y
pasa al **tercer lugar de la columna 3**, debajo del VTI TSVD.

Conserva **todo**: el id `ip_ap_diam`, el dueño único `ipApDiamVal`, la banda `IP_AP_BANDA`
(`[5, 80]` mm, de plausibilidad y no de severidad), su marca «(revisar)», su columna de Excel
del G2 («Diámetro arteria pulmonar (mm)», bloque 8) y su `oninput`, que llama **sólo** a
`ipApDiamSync` — ni `calcIP`, que es el dueño del grado, ni `calcVD`, que no lo lee. **Por eso
sigue sin votar**, y está medido: con los cuatro signos de la IP cargados, grado, referencia e
informe salen idénticos con y sin él.

⚠️ **CON ÉL SE RETIRÓ LA REGLA `.ip-ap-col2`**, que lo mandaba a la columna del jet. Ese
`.grid-2` vuelve a tener **DOS hijos** —el THP y el ancho— en una sola fila y **sin el hueco**
que quedaba debajo del THP. Medido. TC-478 exige que la DECLARACIÓN ya no exista: si volviera,
el campo estaría en los dos lados.

**No tiene fila en el cuadro de referencias** y no se sincroniza con ningún otro campo.

---

## El selector de la relación VD/VI

Salió a **`docs/mapa/vd-vi-selector.md`** (8,7 KB): el campo con sus dos controles, las cuatro
reglas de `vdViSelSync`, la función dueña `vdViEstado(src)` con su rama para estudios
archivados, los **cuatro** consumidores, las dos formas del rótulo y lo medido.
Lo que hay que saber desde acá: **el número manda siempre que exista**, el borde 1,00 exacto es
«≤ 1» en los dos controles, y con el número cargado los cuatro lectores salen idénticos a HEAD.


---

## Trampas de la tanda G3

- ⚠️ **UN BARRIDO GENÉRICO NO TOCA UN `placeholder`.** `limpiarCampos` vacía el `.value` de la
  casilla de la FAC y deja el mensaje «requiere …» como estaba; y no pasa por
  `RECALC_MODULOS`, donde vive `calcVD`. Es la MISMA trampa que `vdMarcaSync` y
  `vdTeiAvisoSync` ya documentan, por tercera vez en esta pestaña.
- ⚠️ **Y LA MISMA, POR CUARTA VEZ, CON EL `disabled` DEL SELECTOR DE VD/VI.** Cargar una
  relación y apretar «Nuevo estudio» dejaba el desplegable BLOQUEADO para siempre sobre un
  formulario vacío. **Lo encontró la sonda, no la lectura**, y sólo porque su ayudante de clic
  ABORTA cuando el control no acepta el gesto: sin ese aborto las tres escenas informaban
  «sin dato» y eso se lee como «el selector no hace nada».
- ⚠️ **NO HAY UN `recolectarCampos` GLOBAL.** La primera versión de TC-478 lo llamaba y dos
  condiciones salieron rojas con «EXC» y «SIN FILA» sobre un árbol perfecto. El patrón de la
  casa es el barrido de `input[id], select[id], textarea[id]`, que es lo que usa TC-316.
- ⚠️ **UNA REGLA DE CSS RETIRADA SIGUE EN EL FUENTE SI LA NOMBRA UN COMENTARIO.** La primera
  condición de TC-476 buscaba `.ip-ap-col2` y salía roja porque el comentario que explica el
  retiro la nombra. Lo que hay que buscar es la **declaración** (`.ip-ap-col2 { grid-column:
  2; }`), no el nombre: mencionar lo retirado es útil y no puede poner un caso en rojo.
