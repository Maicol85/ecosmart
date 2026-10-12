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
