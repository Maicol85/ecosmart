# Mapa de la tanda «G1» del VENTRÍCULO DERECHO (2026-10-15)

Salió de `docs/mapa/vd-derecho.md` el 2026-10-30, en la TANDA CORRECCIONES: ese mapa estaba
en **34,4 KB**, a 626 bytes del techo de 35 KB que `ecosmart/CLAUDE.md` fija, y el COR-3 tenía
que escribirle un puntero. Se partió por donde el archivo ya estaba partido en dos: todo lo
anterior es el mapa de la pestaña, y esto en adelante son las tandas.

⚠️ **ESTE BLOQUE DESCRIBE EL REPARTO DE COLUMNAS DE OCTUBRE, QUE EL COR-3 REEMPLAZÓ.** Las
tres columnas son hoy de SEIS campos cada una, sin huecos. Lo vigente está en
`docs/mapa/cor-correcciones.md` § 3. Lo de acá se conserva porque explica **por qué** la
posición es explícita y no de flujo, que sigue siendo cierto.

---

# La tanda «G1» (2026-10-15) — las tres columnas, el Qp, la relación VD/VI, la pared graduada, el cociente TAPSE/PSAP y el diámetro de la arteria pulmonar

## Los QUINCE campos en TRES columnas

El contenedor es `div.grid-3.vd-grid`, dentro del acordeón `sacc-vd`. Quince `.fg`, cinco por
columna, en el orden que pidió el médico el 15/10/2026:

| | columna 1 | columna 2 | columna 3 |
|---|---|---|---|
| fila 1 | TAP `tvia` (1) | VD basal `vd_bas` (6) | Diám. TSVD `tsvd_diametro` (11) |
| fila 2 | TAPSE `tapse` (2) | VD medio `vd_mid` (7) | VTI TSVD `vti_tsvd` (12) |
| fila 3 | S′ tricuspídeo `s_prime` (3) | VD longitudinal `vd_long` (8) | Área VD telediastólica `vd_area_d` (13) |
| fila 4 | Índice de Tei (DTI) `vd_tei` (4) | VD/VI ratio `vd_vi` (9) | Área VD telesistólica `vd_area_s` (14) |
| fila 5 | FEVD `fevd` (5) | Pared del VD `vd_pared` (10) | FAC VD `vd_fac` (15) |

El número entre paréntesis es el **orden del Tab**, que es el de las columnas.

**Dos mecanismos, y ninguno es un `tabindex`** — los mismos de
`docs/mapa/doppler-mitral-grilla.md`:

1. **El orden del MARCADO es el del Tab.** Los quince `.fg` están en el HTML en ese orden, así
   que el navegador los recorre así sin ninguna ayuda. **No hay ni un `tabindex`** en la grilla,
   y TC-476 lo exige.
2. **La posición es EXPLÍCITA** (`vd-cN` / `vd-rM`, ocho reglas dentro del `min-width: 769px`
   que ya existía para `.dm-grid`).

⚠️ **ACÁ LA POSICIÓN EXPLÍCITA NO ES PRECAUCIÓN SINO NECESIDAD, a diferencia del Doppler
mitral.** En esa grilla ningún campo se oculta todavía y la posición explícita está por si algún
día alguno lo hace; acá **la casilla de la FAC se esconde sin dato desde esta misma tanda**, y
con `grid-auto-flow` eso haría subir a los de abajo — y como la FAC es el ÚLTIMO de su columna,
el que subiría sería un campo de OTRA columna.

**Medido** (`scripts/_probe_g1.mjs --solo campos`), a 1200 / 390 / 360 px en los **dos temas**:

| Ancho | Columnas visuales | Solapamientos | Desborde horizontal | `tabindex` |
|---|---|---|---|---|
| 1200 px | **3** (3×5, los 15 a 318 px) | 0 | no | 0 |
| 390 px | 1 | 0 | no | 0 |
| 360 px | 1 | 0 | no | 0 |

Tab con **teclas reales**: `tvia → tapse → s_prime → vd_tei → fevd → vd_bas → vd_mid → vd_long →
vd_vi → vd_pared → tsvd_diametro → vti_tsvd → vd_area_d → vd_area_s → vd_fac`.
⚠️ **Sin dato en las áreas, el Tab salta la casilla de la FAC y sale de la grilla**, porque está
escondida: se midieron los dos recorridos, con y sin el par de áreas.

**Tres `oninput` nuevos**, y ninguno es decorativo: `fevd` (su fila aparece y desaparece con el
dato), `vd_vi` (su fila y la probabilidad de HTP, que hasta hoy **no se repintaba al cargar ese
campo**) y `tsvd_diametro`/`vti_tsvd` (los dos insumos del Qp).

---

## El cuadro de referencias — DIEZ filas, y TRES sólo se ven con dato

El orden es el de las columnas de campos: primero la columna 1, después la 2 y por último la 3.
Antes era semántico (estructura · función · aceleración pulmonar).

| # | Rótulo | id | Visible |
|---|---|---|---|
| 1 | TAP — aceleración pulmonar | `tap-interp` | siempre |
| 2 | TAPSE — función sistólica VD | `tapse-interp` | siempre |
| 3 | S′ — función sistólica VD | `sprime-interp` | siempre |
| 4 | Índice de Tei (DTI) — función VD | `vd-tei-interp` | siempre |
| — | (no es `.calc-row`) | `vd-tei-aviso` | cartel, con sus advertencias |
| 5 | **FEVD (3D) — función sistólica VD** | **`fevd-interp`** | **sólo con dato** (`row-fevd-interp`) |
| 6 | VD basal — tamaño | `vd-tam` | siempre |
| 7 | **Relación VD/VI — probabilidad de HTP** | **`vd-vi-interp`** | **sólo si está ALTERADA** (`row-vd-vi-interp`) |
| 8 | Pared del VD — hipertrofia | `vd-pared-interp` | siempre |
| 9 | **Volumen sistólico pulmonar (Qp)** | **`vd-qp-interp`** | siempre («—» sin insumos) |
| 10 | FAC — función sistólica VD | `fac-interp` | **sólo con dato** (`row-fac-interp`) |

Y la **casilla** automática de la FAC (`fg-vd-fac`) se esconde con su fila: es la única que se
oculta, porque es la única que la app calcula sola.

⚠️ **SE ESCONDE LA FILA ENTERA Y NO SÓLO EL TEXTO.** El barrido genérico de
`.calc-box .calc-row span[id]` de `limpiarCampos` ya pone el span en «—»; lo que **ningún
barrido toca** es el `display` de su `.calc-row`. De eso se ocupa **`vdRefVisSync`**, con las
**tres columnas**: la llama `calcVD` (que está en `RECALC_MODULOS`) y se repite al final de
`limpiarCampos`, que no pasa por ese embudo. Sin la tercera, «Nuevo estudio» dejaba las filas
del paciente anterior visibles diciendo «FEVD —» sobre un formulario vacío.

⚠️ **LA RELACIÓN VD/VI SE ESCONDE POR SU VEREDICTO Y NO POR FALTA DE DATO.** Con el cociente
normal la fila no se dibuja: existe para NOMBRAR un signo de probabilidad de HTP, no para
certificar su ausencia. Es la decisión del médico («mostrada si está alterada»).

---

## El volumen sistólico pulmonar (Qp) — `vdQpCalc`

`Qp = π × (Ø TSVD / 2)² × VTI TSVD`, con el diámetro en **milímetros** y el VTI en
**centímetros**: `PI * (d/20)^2 * vti` → cm² × cm = **ml**.

⚠️ **NO HAY UNA SEGUNDA COPIA DE LA FÓRMULA.** El álgebra vive en **`_vsTsviCalc`**, su dueño
único desde el 2026-10-14, y es exactamente la misma cuenta del lado izquierdo. `vdQpCalc` sólo
dice **de dónde salen los dos insumos**.

⚠️ **`eteQpQs` NO SERVÍA.** Ese cociente **cancela la constante** —divide un producto por el
otro— y por eso nunca calcula el volumen: no había dónde leerlo.

**NO vota, no lleva corte y no lleva color.** No hay un valor normal de Qp aislado —se interpreta
indexado por superficie corporal y contra el Qs—, así que la fila publica el número y su fórmula.
Medido: Ø 20 mm + VTI 20 cm → **62,8 ml**; sin uno de los dos, «—».

---

## La relación VD/VI — `vdViEstado`, corte `> 1,0`

| Fuente | Dónde | Texto |
|---|---|---|
| ESC/ERS 2022 | **Tabla 10, folio 28**, categoría **A (Ventrículos)** | «Diámetro basal VD/VI / cociente del área **> 1,0**» |
| ASE 2025 | **Tabla 8, folio 173** | «Dilated right heart: **RV/LV >1**» |

⚠️ **EL CAMPO SIGUE SIENDO NUMÉRICO Y NO SE REEMPLAZÓ POR DOS OPCIONES.** La orden ofrecía
«menor de 1» / «mayor de 1» **sólo si el campo no existía ya en esa forma**, y existía: es
`input[type=number]`, y de él leen la categoría A de `_htp2022Core`, el PDF (`vPdf('vd_vi')`) y
el PPT (`_pptNum('vd_vi')`). Un desplegable habría perdido el valor medido y roto esos tres.

⚠️ **EL CORTE NO ES NUEVO.** `_htp2022Core` ya aplicaba `vdvi > 1.0` como literal; lo que entra
es `VD_VI_HTP_MIN`, para que la fila y la probabilidad de HTP no puedan separarse.

⚠️ **CONVIVE CON EL `>= 0,9` DE LA PANTALLA DE TEP Y NO SE UNIFICAN.** Son dos campos y dos
preguntas: `vd_vi` (VD/AD) alimenta la probabilidad de HTP, y `tep_vdvi` (pantalla de TEP)
alimenta el puntaje de sobrecarga **aguda**. La cascada de `calcTEP` prefiere `tep_vdvi`, después
`vd_bas/ddfvi` y sólo al final `vd_vi`. Ninguno se tocó. `docs/PENDIENTES.md` → **G1-5**.

**Medido:** 0,99 no · **1,00 EXACTO no** (el operador es `>`) · 1,01 sí · 1,2 sí.

⚠️ **EN LA APP, EL COCIENTE TAPSE/PSAP ESTÁ EN LA CATEGORÍA C Y LA TABLA LO PONE EN LA A.**
Medido por coordenadas sobre el PDF (ver `FUENTES.md`). **No se corrigió**: mover un signo de
categoría cambia `nCat` y con él la probabilidad publicada. `docs/PENDIENTES.md` → **G1-1**.

---

## La pared del VD, ahora graduada — `vdHvdEstado().grado`

**ASE 2025, Tabla 1, folio 145**, fila `RVWT, cm`:

| Grado | cm (como lo imprime la tabla) | mm (la unidad del campo) | Color de la fila |
|---|---|---|---|
| normal | `< 0,5` | **< 5** | verde |
| leve | `≥ 0,5 a ≤ 0,7` | **≥ 5 a ≤ 7** | naranja |
| moderada | `> 0,7 a ≤ 0,9` | **> 7 a ≤ 9** | rojo |
| severa | `> 0,9` | **> 9** | rojo |

Coincide exactamente con el **5-7-9** que el médico recordaba.
⚠️ **LA ASE 2010 (Rudski) NO ESTÁ EN LA BIBLIOTECA** —censo de los 70 PDF del Escritorio— y la
**ASE/EACVI 2015**, que sí está, **no publica grados de RVWT**. La única fuente es la ASE 2025.

⚠️ **EL CORTE DE HIPERTROFIA NO SE MOVIÓ: sigue siendo `>= 5 mm`.** Lo único que cambia es cómo
se nombra la banda.
⚠️ **Y LA GRADUACIÓN NO SALE DEL CUADRO DE REFERENCIAS.** El informe narrativo sigue diciendo
«hipertrofia del ventrículo derecho (pared de N mm)» y el EN SUMA «HVD», **sin grado**: cambiar
una frase del informe firmado es contenido clínico. `docs/PENDIENTES.md` → **G1-3**.

**Medido, los dos techos incluidos:** 4,9 normal · **5,0 leve** · **7,0 leve** · 7,1 moderada ·
**9,0 moderada** · 9,1 severa · 12 severa.

---

## La FEVD — un corte, sin graduación

**ASE 2025, Tabla 1, folio 145**, fila `3D RVEF, %`: normal **`> 45`**.
⚠️ **EL OPERADOR ES `>` Y NO `>=`**, y el comentario que vivía al lado del campo decía «(≥45 %)».
No gobernaba nada —la FEVD no se evaluaba en ninguna parte— pero con el corte aplicado **45,0
exactos caen del lado anormal**, que es donde la tabla los pone. Medido: 44 y 45 disfunción, 46
normal.
⚠️ **LA APP NO GRADÚA LA FEVD** aunque la Tabla 1 la gradúe: la orden pide que la fila aparezca
con el dato, no una banda. `docs/PENDIENTES.md` → **G1-4**.

---

## El cociente TAPSE/PSAP, el diámetro de la arteria pulmonar y el color del aviso del Tei

Salieron a **`docs/mapa/tapse-psap-ap.md`** (tanda G1), porque las tres piezas **no viven en esta
pestaña**: el cociente está en el Doppler tricuspídeo, el diámetro de la arteria pulmonar en la
insuficiencia pulmonar de Válvulas, y del VD sólo se tocó el COLOR de un cartel
(`#vd-tei-aviso`, que pasó de `--amber` a `--orange` y hasta hoy se veía GRIS: el defecto D2-2).
Ahí están el dueño único del cociente, sus tres tramos, las OTRAS TRES superficies que lo
calculan y cuál de ellas lee al dueño, el globo ⓘ, la banda del diámetro y qué medida de la
aorta usa la guía para la comparación.

---

## Trampas de la tanda G1

- ⚠️ **EL DOPPLER TRICUSPÍDEO NO ES UN `sacc-` NI SE ABRE CON `secToggle`.** Es una `.card` con
  `toggleCard('dop-tricusp')` y su cuerpo nace en `display:none`. Sin abrirlo, la fila del
  cociente y su globo **existen y miden 0×0**: la tarjeta no se ancla y «no abre» se lee como
  «el mecanismo no funciona» — que es exactamente lo que informó la primera corrida del grupo
  `globo`. La sonda ahora **aborta** nombrándolo.
- ⚠️ **`el.type` DEVUELVE «text» SOBRE UN CAMPO QUE EN EL MARCADO DICE `number`.** Esta app
  convierte todos sus `input[type=number]` a `type="text"` con `inputmode="decimal"`, `pattern`
  y la clase **`numdec`**, para que Safari acepte la coma — de ahí también que el `step` no
  restrinja nada, que es lo que el comentario de `vdBasCat` ya documenta. **Dos condiciones de
  TC-476 salieron rojas por esto** sobre campos perfectos. Lo que prueba que un campo sigue
  siendo numérico es que esa maquinaria lo haya tomado: `numdec` + `inputmode`.
- ⚠️ **AL RECORTAR UN RANGO DE LÍNEAS PARA QUITARLE LOS ACENTOS GRAVES, EL ÍNDICE SE PASÓ UNA
  LÍNEA Y SE LLEVÓ EL ACENTO DE APERTURA DEL PROPIO `caso(...)`.** El síntoma fue que
  `check_backticks.py` señalaba una línea del RUNNER, cientos de líneas después, que es código
  normal. **El acento grave que falta se ve igual que uno que sobra.**
- ⚠️ **Me comí el acento grave CUATRO veces**, todas en comentarios míos: dos en el cuerpo del
  template de la sonda y dos en el de TC-476, con el archivo que documenta la trampa abierto
  delante. `scripts/check_backticks.py` dio la línea exacta las cuatro.
