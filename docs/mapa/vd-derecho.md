<!-- mapa armado sobre 8cbb03a, 2026-10-12; los números de línea NO se guardan a propósito -->

# Mapa del VENTRÍCULO DERECHO — la pestaña VD/AD, su cuadro de referencias y sus dos superficies

Se busca por **nombre de función y de constante**, no por línea: la línea cambia en cada edición y
el nombre no. `grep -n 'nombre' index.html`.

Este mapa cubre la **estructura y la función SISTÓLICA** del VD. La función **diastólica** del VD
—`dtDiastEstado`, `dtDiastClausula`, la ventana 🧭 y el Doppler tricuspídeo— vive en
`docs/mapa/diastolica.md`.

---

## Los campos del bloque «Ventrículo derecho» (pestaña `vd`, acordeón `sacc-vd`)

| Campo | id | Quién lo consume |
|---|---|---|
| TAP (ms) | `tvia` | `calcVD` (fila `tap-interp`), `dtTapSync` (espejo del Doppler tricuspídeo), `papmEstSync` |
| TAPSE (mm) | `tapse` | `calcVD`, `generarInforme` (bloque 5), cápsula de TEP, PDF, Laboratorio (`_labTapse`) |
| S′ tricuspídeo (cm/s) | `s_prime` | `calcVD`, `generarInforme` |
| VD basal / medio / longitudinal (mm) | `vd_bas` · `vd_mid` · `vd_long` | `vdDiamsMedidos` → `calcVD` y `generarInforme` |
| VTI TSVD (cm) | `vti_tsvd` | `etTsvdSync`, `calcHemo`, Qp/Qs, `calcET` |
| Diám. TSVD (mm) | `tsvd_diametro` | `etTsvdSync`, Qp/Qs, `calcET` |
| FEVD (%) | `fevd` | **sólo** el PDF y el Excel: no llega al narrativo |
| VD/VI ratio | `vd_vi` | cápsula de TEP (`calcTEP`), PDF, PPT |
| **Pared del VD (mm)** | **`vd_pared`** | `vdHvdEstado` → fila `vd-pared-interp`, cláusula del informe, EN SUMA |
| **Índice de Tei (DTI)** | **`vd_tei`** | `vdTeiEstado` → fila `vd-tei-interp`, `vdDisf` del informe, cartel ámbar |
| Área VD telediastólica / telesistólica (cm²) | `vd_area_d` · `vd_area_s` | `calcVD` → escribe `vd_fac` |
| FAC VD (%) | `vd_fac` | **READONLY**, lo calcula `calcVD`; lo leen el informe, el PDF y el Excel |

**Maqueta:** los campos van en `grid-3`. El tercer `grid-3` tiene **CINCO** hijos desde el
2026-10-12 —`vti_tsvd`, `tsvd_diametro`, `fevd` en la fila 1 y `vd_vi`, `vd_pared`, `vd_tei` en la
fila 2—, o sea seis lugares y seis campos: la fila 2 ya no tiene huecos. Medido a 1200 / 390 /
360 px en los dos temas: los seis miden lo mismo (318 / 328 / 298 px), ninguno desborda su grilla
y no hay scroll horizontal.

⚠️ **Los dos campos nuevos NO tienen columna de Excel y es deliberado** (orden de Maicol): el Excel
sigue en **435 columnas**. Se guardan con el estudio por el barrido genérico de `guardarInforme`
(`input[id], select[id], textarea[id]` menos la lista de exclusión) y se restauran igual.

---

## El cuadro de referencias — SIETE filas, y el conteo importa

Es el `.calc-box` que cuelga de `vd-tam`. Lo pinta **`calcVD`** entero, y el orden es semántico:
estructura primero, función sistólica después, aceleración pulmonar al final.

| # | Rótulo | id del valor | Qué dice |
|---|---|---|---|
| 1 | VD basal — tamaño | `vd-tam` | los TRES diámetros vía `vdDiamsMedidos`; `yellow` para «Verificar la medición» y para la banda leve del basal |
| 2 | **Pared del VD — hipertrofia** | **`vd-pared-interp`** | `≥ 5 mm` → rojo «hipertrofia del VD»; si no, verde «normal» |
| 3 | FAC — función sistólica VD | `fac-interp` | `≥ 35` verde · `< 25` rojo severa · entre medio naranja |
| 4 | TAPSE — función sistólica VD | `tapse-interp` | `≥ 17` verde · si no rojo |
| 5 | S′ — función sistólica VD | `sprime-interp` | `≥ 9,5` verde · si no rojo |
| 6 | **Índice de Tei (DTI) — función VD** | **`vd-tei-interp`** | `≥ 0,55` → rojo «alterado (≥0.55 por DTI)»; si no, verde |
| — | (no es `.calc-row`) | `vd-tei-aviso` | cartel ámbar de las advertencias del Tei |
| 7 | TAP — aceleración pulmonar | `tap-interp` | `< 105 ms` rojo «elemento indirecto de HTP» |

⚠️ **TAPSE Y S′ NO VUELVEN A «—» AL BORRAR EL DATO.** Su `if (tapse)` / `if (sp)` sólo pinta, así
que la fila del paciente anterior se queda hasta que `limpiarCampos` la barra. Las otras cinco —
`vd-tam`, `vd-pared-interp`, `fac-interp`, `vd-tei-interp`, `tap-interp` — sí resetean. **Las dos
filas nuevas siguen a las que resetean.** Arreglar TAPSE y S′ es otro cambio: está en
`docs/PENDIENTES.md` → V1.

⚠️ **El conteo de filas es lo único que caza una fila duplicada o perdida**, y TC-457 lo fija en 7.
El `div` del cartel ámbar **no** es un `.calc-row`, así que no entra en ese conteo.

---

## Los cortes de esta zona y de dónde salen

| Constante | Valor | Borde | Fuente |
|---|---|---|---|
| `VD_BAS_NORMAL_MAX` | 41 mm | `>` | ASE 2015 — límite superior de lo normal |
| `VD_BAS_LEVE_MAX` | 45 mm | `>` | criterio de la app: 42-45 dilatación leve |
| `UMBRAL_TAPSE_NORMAL` | 17 mm | `>=` normal | ASE 2015 |
| S′ | 9,5 cm/s | `>=` normal | **literal dentro de `calcVD` y de `generarInforme`**, no una constante |
| `UMBRAL_FAC_VD_NORMAL` | 35 % | `>=` normal | ASE 2015 |
| `UMBRAL_FAC_VD_SEVERA` | 25 % | `<` severa | criterio de la app |
| **`VD_PARED_HVD_MIN`** | **5 mm** | **`>=` hipertrofia** | **ASE 2025, Tabla 1 folio 145 y Key Point folio 144** |
| **`VD_TEI_DTI_ALT_MIN`** | **0,55** | **`>=` alterado** | **ASE 2025, Tabla 1 folio 145 y texto folio 158** |
| **`VD_TEI_PW_ALT_MIN`** | **0,40** | — | **el corte del Doppler PULSADO. DECLARADO Y NO APLICADO: el campo de la app es DTI** |
| `VD_NUEVOS_BANDA` | `vd_pared [1,30]` · `vd_tei [0,3]` | — | bandas de plausibilidad, dueño único |

⚠️ **LOS DOS CORTES NUEVOS SON `>=`, O SEA QUE EL VALOR DEL CORTE CAE DEL LADO ANORMAL.** La guía da
el NORMAL (`< 5 mm`, `< 0,55`), así que 5,0 mm ya es hipertrofia y 0,55 ya está alterado. El
recuerdo corriente de «> 5 mm» los deja del lado normal, y los dos son valores que se tipean
enteros. TC-457 lo fija con el valor exacto por sus dos lados.

⚠️ **`VD_TEI_PW_ALT_MIN` EXISTE PARA QUE NADIE LO APLIQUE.** La ASE 2025 declara que los dos
métodos tienen correlación sólo moderada (folio 158): usar el 0,40 sobre un valor medido por DTI
mueve el corte un 27 %. El rótulo del campo dice «(DTI)» y el informe imprime «Tei 0.62 (DTI)»
justamente por eso.

---

## Los dueños del estado — una comparación por constante

- **`vdHvdEstado()`** → `{ val, hvd }`. Lo consultan la fila 2 del cuadro, `vdHvdClausula` y el
  EN SUMA. Devuelve el valor además del veredicto porque los tres lo imprimen al lado.
- **`vdTeiEstado()`** → `{ val, alt }`. Lo consultan la fila 6 y `generarInforme`.
- **`vdTeiAdvertencias()`** → lista de motivos (`insuficiencia tricuspídea severa`,
  `ritmo irregular`). Vacía sin Tei cargado.
- **`vdHvdClausula(hayPrevia)`** → la cláusula del informe, con el mecanismo de
  `dtDiastClausula`.
- **`vdMarcaSync()`** → la marca «(revisar)» de los dos campos. En `RECALC_MODULOS` **y** al final
  de `limpiarCampos`.
- **`vdTeiAvisoSync()`** → el cartel ámbar. Las TRES columnas: lo llama `calcVD`, está en
  `RECALC_MODULOS` y se repite al final de `limpiarCampos`.

⚠️ **POR QUÉ `vdMarcaSync` Y `vdTeiAvisoSync` NECESITAN LA LÍNEA EN `limpiarCampos`.** Los dos `div`
de marca no son `.calc-box .calc-row span[id]` ni terminan en `-aviso`: **no los alcanza ningún
barrido genérico**, así que la marca del paciente anterior sobrevivía a «Nuevo estudio». El cartel
ámbar sí termina en `-aviso` y el barrido le vacía el TEXTO, pero le deja el `display:block`
puesto: un renglón ámbar vacío sobre un formulario recién limpiado.

⚠️ **EL CARTEL TIENE UN OYENTE DE DOCUMENTO sobre `it_grado` y `diast_ritmo`.** Los dos insumos
viven en OTRAS pestañas y ninguno llama a `calcVD`: `it_grado` es el `<select>` del grado de la IT
(Válvulas) y su `onchange` va a `valvSev.aplicar`; `diast_ritmo` vive en el cuadro de la diastólica
del VI y llama a `calcDiastol`. Sin el oyente el cartel se quedaba con el estado del gesto
anterior. Es un oyente de documento y no dos llamadas en los `onchange` ajenos, para no tocar la
cadena de `valvSev` ni `calcDiastol`.

---

## La disfunción sistólica del VD — **es un OR, no «N parámetros»**

Se calcula dentro de **`generarInforme`, bloque 5**, y no en una función propia:

```
tapseBajo = tapse < 17          (sólo si tapse !== null)
spBajo    = s_prime < 9.5       (sólo si sp !== null)
facBajo   = vd_fac < 35         (sólo si facVD !== null)
teiAlt    = vd_tei >= 0.55      (sólo si teiVD !== null)
vdDisf    = tapseBajo || spBajo || facBajo || teiAlt
```

**Uno alcanza.** Cada parámetro cuenta sólo si está medido, así que un paciente sin Tei cargado da
exactamente lo mismo que antes del 2026-10-12.

La compuerta de la mitad de función es
`hayFunc = tapse !== null || sp !== null || facVD !== null || teiVD !== null`.
⚠️ **`hayFunc` ES ADEMÁS UNA DE LAS CINCO CONDICIONES DEL `if` QUE ENVUELVE EL BLOQUE ENTERO.** Con
el Tei afuera, un estudio cuyo único dato del VD fuera el índice de Tei perdía la oración completa.
Es el mismo agujero que el comentario de `tapse || sp` documenta y el que la diastólica
tricuspídea reintrodujo por la puerta de al lado.

La quinta condición del `if` es **`_hvdInf.hvd`**, por la Recomendación 3 del folio 144 («RVWT
should be reported if abnormal»). ⚠️ **Entra la hipertrofia y NO la pared normal**: la app no dice
«sin hipertrofia» en ninguna parte, así que una pared normal sola dejaría la oración en
«Ventrículo derecho.» pelado — el mismo trato que ya reciben `fevd` y `vd_vi`.

---

## Las dos superficies del VD, una por una

### 1 · Informe narrativo (`generarInforme`, bloque 5)

Una sola oración combinada, en los tres estilos vía `estiloPick`:

```
`${vdC}${datosVDp}${_hvdCl}${_ddCl}.${_vdFueraTxt}${_ddItTxt}${_teiAvTxt}`
```

- `vdC` / `vdE` / `vdN` — tamaño + función, con `nexo` `, ` cuando todo es normal y ` con ` cuando
  hay un hallazgo.
- `datosVDp` — el paréntesis de medidas (`medVD`): diámetros DILATADOS uno por uno, TAPSE, S′, FAC
  y **`Tei X (DTI)`**.
- **`_hvdCl`** — `vdHvdClausula`. **DOS formas:** con cláusula previa `, con hipertrofia del
  ventrículo derecho (pared de 7 mm)`; sin cláusula previa ` con hipertrofia (pared de 7 mm)`,
  porque ahí el sujeto ES la oración entera y el texto largo diría dos veces «ventrículo derecho»
  en cinco palabras.
- `_ddCl` — la diastólica. **Recibe `hayPrevia` contando la hipertrofia**: sin eso, un VD sin
  tamaño ni función con hipertrofia y patrón restrictivo salía con dos puntos después de una
  cláusula que ya existía.
- **`_teiAvTxt`** — la salvedad del Tei, con la compuerta `medVD.length`: «El índice de Tei puede no
  ser válido con … (ASE).»

### 2 · EN SUMA — la cadena de la hipertrofia y la de HEAD

**La cadena de HEAD queda INTACTA en el `else`.** Un estudio sin hipertrofia escribe exactamente lo
que escribía, letra por letra (medido en 12 escenas).

Con hipertrofia: base `HVD` o `VD <tamTxt> e hipertrófico` según la dilatación, separador ` ` o
`, ` con ella, y una cola:

| Combinación | Frase |
|---|---|
| sólo hipertrofia | `HVD.` |
| dilatado + hipertrofia | `VD dilatado e hipertrófico.` |
| hipertrofia + sistólica | `HVD con disfunción sistólica.` |
| hipertrofia + diastólica | `HVD con disfunción diastólica <grado>.` |
| hipertrofia + sistólica y diastólica | `HVD con disfunción sistólica y diastólica <grado>.` |
| dilatado + hipertrofia + sistólica | `VD dilatado e hipertrófico, con disfunción sistólica.` |
| dilatado + hipertrofia + sistólica y diastólica | `VD dilatado e hipertrófico, con disfunción sistólica y diastólica <grado>.` |
| dilatado + hipertrofia + diastólica | `VD dilatado e hipertrófico, con disfunción diastólica <grado>.` |
| dilatado + hipertrofia + función conservada | `VD dilatado e hipertrófico, con función sistólica conservada.` |

⚠️ **TRES DESVÍOS DE LA LETRA DE LA ORDEN, los tres para no perder información:** el grado de la
diastólica se conserva; con la clasificación diastólica incompleta se usa «patrón sugestivo de
disfunción diastólica» y no «disfunción diastólica»; y «con función sistólica conservada» sobrevive
cuando hay dilatación, que es la regla que la cadena de HEAD ya tiene.
⚠️ **UNA PÉRDIDA declarada:** con el VD **no** dilatado se pierde «de dimensiones normales» —el
texto pedido es `HVD con disfunción sistólica.`—. En `docs/PENDIENTES.md` → V3.

La línea de **FAC severa** (`Disfunción sistólica severa del VD (FAC 24%).`) es independiente y
sigue saliendo aparte.

### Las otras superficies, y por qué no cambian

- **PDF.** Su tabla del VD (`TAPSE`, `S'`, `FAC`, `FEVD`, `VD/VI`) **no ganó filas**: la pared y el
  Tei no están ahí. Lo que sí cambia es el texto del informe, porque el PDF imprime
  `informe_texto`.
- **PPT.** `_pptSpan('vd-tam')` y `_pptNum('vd_vi')`: ninguno de los dos lee los campos nuevos.
- **Excel.** 435 columnas, mismo juego de claves con los dos campos cargados (TC-457).
- **Laboratorio.** NO se tocó. Ver abajo.

---

## El Laboratorio sobre las frases nuevas — medido, no estimado

`_LAB_HALLAZGOS` clasifica el texto libre de `en_suma + informe_texto` con `_labMenciona`:

| Frase nueva | HVI | Disfunción sistólica VI | Disfunción diastólica | `_labGeomCat` |
|---|---|---|---|---|
| `HVD.` | **no** | no | no | `null` |
| `VD dilatado e hipertrófico.` | **no** | no | no | `null` |
| `HVD con disfunción sistólica.` | **no** | **sí** | no | `null` |
| `HVD con disfunción diastólica severa.` | **no** | no | **sí** | `null` |
| `… con hipertrofia del ventrículo derecho (pared de 7 mm)` (informe) | **no** | — | — | `null` |

⚠️ **«HVD» NO MATCHEA `/hipertrofia\s+ventricular\s+izq|HVI/i`**, y «hipertrofia del ventrículo
derecho» tampoco. `_labGeomCat` y el filtro de cohorte `filtroGeom` buscan
`concéntrica` / `excéntrica` / `remodelado` / `sin hipertrofia`: ninguno aparece en los textos
nuevos.

⚠️ **«Disfunción sistólica VI» y «Disfunción diastólica» ya contaban las frases del VD antes de
esta tanda** —`/disfunci[oó]n\s+sist[oó]lica/i` no distingue el ventrículo—, así que el recuento no
se mueve por este trabajo. Es una imprecisión PREEXISTENTE del Laboratorio y está declarada en
`docs/PENDIENTES.md` → V4.

⚠️ La salvedad del Tei nombra «insuficiencia tricuspídea severa», que el filtro de cohorte `it`
busca. **Queda NEGADA** por `_labMenciona` —la ventana de 40 caracteres hacia atrás trae el «no» de
«puede no ser válido»— y además la frase sólo sale con `it_grado === '4'`, que ese filtro ya cuenta
por campo. No hay cambio posible.

---

## Trampas de esta zona

- **Al medir con una sonda, abrir la pestaña `vd` y el acordeón `sacc-vd` ANTES de medir.** Lo que
  está en `display:none` no tiene geometría: sin eso se tipea en la nada y todas las escenas salen
  «sin cambios», que es indistinguible de «el cableado no funciona». El nombre de la pestaña es
  **`vd`** y no `vd-ad` — `showTab('vd-ad')` tira una excepción y el denominador queda en falso.
- **Si un campo no existe, abortar el tecleo.** Contra el árbol de HEAD estos dos campos no están;
  sin la guarda el foco queda en el campo anterior y los caracteres se le concatenan. Es lo que la
  tanda del strain midió fabricando un E/e′ de 1848,5.
- **El `md5` antes y después de cada corrida**, y leer `index.html` nunca mientras hay otra cosa
  escribiéndolo.
- **El hash de «campos guardados» tiene que excluir `informe_texto`, `en_suma` y los dos ids
  nuevos.** Los dos primeros cambian en toda escena cuya frase cambia; los dos últimos no existen
  en HEAD, así que sin excluirlos el A/B dice «distinto» en todas las escenas por el solo hecho de
  que los campos existen.

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

# La tanda «G3» (2026-10-15) — PARTIDA A ARCHIVO PROPIO

⚠️ **El bloque de la G3 —la casilla de la FAC que vuelve a estar visible, la mudanza del
diámetro de la arteria pulmonar y el selector de la relación VD/VI, con sus trampas— vive en
`docs/mapa/vd-g3-campos.md`.** Se sacó el 2026-10-16, en la tanda M: este mapa estaba en
**34,4 KB**, a 600 bytes del techo, y `CLAUDE.md` pide partirlo antes de escribirle encima.

---

# Las tarjetas ⓘ del VD — tanda «M» (2026-10-16)

⚠️ **El ventrículo derecho tiene DOS globos ⓘ desde la tanda M** —`vd-tam-card` (diámetro basal,
medio, longitudinal y pared) y `vd-fun-card` (TAPSE, onda S′, FAC, FEVD, índice de Tei y tiempo
de aceleración pulmonar)— **y una entrada propia en Referencias, `ref-vd2`.** Son dos y no uno
porque con las diez barras juntas la tarjeta mide 985 px y a 1200 × 700 el hueco es de 440.

⚠️ **Y CON ELLOS ENTRARON SIETE DUEÑOS PUROS que extraen comparaciones que vivían DENTRO de
`calcVD`, `vdHvdEstado`, `vdTeiEstado` y `vdDiamsMedidos`**, sin tocarles un número ni un
operador: `vdMidCat`, `vdLongCat`, `vdParedCat`, `vdTapseCat`, `vdSprimeCat`, `vdFacCat`,
`vdFevdCat`, `vdTapCat` y `vdTeiCat`. Y dos constantes donde había literales:
`UMBRAL_SPRIME_NORMAL` (9,5 cm/s) y `UMBRAL_TAP_HTP` (105 ms).

**Todo eso está en `docs/mapa/evidencia-derecho-aorta.md`.** Lo que la app NO clasifica —la
relación VD/VI como tamaño, el diámetro de la arteria pulmonar, el TSVD y el Qp— no lleva barra y
está declarado en `docs/PENDIENTES.md`.

---

# La tanda «VS» (2026-10-17) — EL CORAZÓN DERECHO A LA TABLA 1 DE LA ASE 2025

⚠️ **El VD, la AD, la VCI y la raíz aórtica se alinearon a la Tabla 1 de la ASE 2025 de corazón
derecho, y todo eso vive en `docs/mapa/corazon-derecho-ase2025.md`.** Ahí están el dueño único
(`ASE25_T1` + `ase25Grado` + `ase25Rango` + `ase25Corte`), las doce filas con su antes y su
ahora, las tres cosas que la tabla NO dice como uno espera —no distingue sexo, el solape
tipográfico del TAPSE y de la onda S′, y el hueco del volumen de la AD—, las superficies una por
una, el 21 mm exacto de la vena cava, el «40 mm o más» del seno de Valsalva, las cuatro tarjetas
con sus cuatro zonas y las ocho trampas.

**Lo que hay que saber antes de tocar esta zona:** los cortes y los operadores ya NO viven acá.
Mover uno es editar `ASE25_T1`, y el assert de arranque exige que las cuatro bandas sigan en
orden y sin hueco.


---

## ⚠️ El TAPSE, la onda S′ y el área de la AD vuelven a la raya al borrar el dato (ARR, 18/10/2026)

Era el defecto **V1** de `PENDIENTES.md`, declarado en el propio comentario de `calcVD` desde el
VS2: su `if` **sólo pintaba**. Y `calcAD` salía por `if (!ad) return;`, que además se llevaba la
llamada a `calcHTP2022` —la fila «Categoría C — VCI / AD» seguía diciendo «signo presente» sobre
un área que ya no existe—. El `else` vive ahora UNA vez, en `refSync`. **Ningún corte se movió.**
→ `docs/mapa/borrado-referencias.md`

---

## → La tanda «P» (2026-10-18): Referencias con subpestañas, buscador y «Ver referencia»

La pestaña **Referencias** pasó a **cinco subpestañas** (Dimensiones · Función · Válvulas · Aorta ·
Otros hallazgos) con un **buscador** y, en las tarjetas ⓘ que tienen entrada, un botón **«Ver
referencia»** con su «Volver». La subpestaña **Aorta** sumó la **tabla de umbrales de cirugía**
verificada contra la ESC 2024, y la entrada **vieja del VD** (`ref-vd`, ASE 2015, con la onda S′
tipeada en «≥ 10») **se retiró**: la que corresponde es `ref-vd2`, derivada del dueño.

**No cambió ningún cálculo, corte, operador ni texto del informe**, y el Excel quedó en 440
columnas idéntico.

**Está todo en `docs/mapa/referencias-subpestanas.md`**: el reparto (`REF_SUBTAB`), el índice del
buscador y su normalización, el mapeo `VINFO_REF` con las cinco tarjetas que no llevan botón, la
tabla `AO_CX_T` con su folio por fila y su sondeo del dueño, y nueve trampas medidas.

## La tanda «R» (2026-10-20) — el informe dice la SEVERIDAD de la disfunción sistólica

`vdDisfGrado(tapse, sprime)` sondea `ASE25_T1` y devuelve un grado, **un rango con guión**
cuando los dos parámetros caen en bandas distintas, o `null` si alguno está normal — con un
TAPSE conservado no se puede afirmar un grado global. ⚠️ **Dos filas de la Tabla 1 ganaron
`solapa: true`** y es de la fuente: el TAPSE escribe «≤1.7 to ≥1.3» y «≤1.3 to >1.0», así que
**1,3 cm está en las dos bandas** (y 7,2 cm/s igual). El texto tiene un dueño, `_vdDisfTxt`, y
lo consumen `funcTxt` del informe y las ocho ramas del EN SUMA.

→ `docs/mapa/tanda-r-referencias.md` § 3.
