# La pestaña OTROS en el informe — pericardio, masas y pulmón (tanda «I», 2026-10-16)

Mapa de la zona. **Por nombre de función y de id, no por número de línea.**

---

## 1 · Dónde vive

Pestaña **`tab-otros`**, con dos secciones plegables:

- **`ete-seccion-pericardio-masas`** — `pericardio`, el nuevo `pericardio_hemo`, `otras_notas`,
  `masa_presente` y los siete campos de `bloque-masa`.
- **`ete-seccion-pulmonar`** — el módulo **BÁSICO** de ecografía pulmonar: `pul_derrame`,
  `pul_derrame_tam`, `pul_balik`, el nuevo `pul_derrame_lado`, `pul_lineasb`, `pul_lineasb_pat`,
  `pul_consolidacion` y el nuevo `pul_consol_nota`.

El módulo **AVANZADO** vive aparte, en `tab-pulmonar` (`pua_*`), y se excluye mutuamente con el
básico: ver `pulAvanzadoCubreBasico` y `PUL_PARES`.

---

## 2 · Qué cambió: cada tema, su propia oración

El bloque 13 de `generarInforme` armaba **una sola entrada** de `inf` con el pericardio y las masas,
y en el estilo **NARRATIVO** además fundidos en **una sola oración**. Y el módulo pulmonar básico
pegaba sus tres temas con un `join(' ')`.

| Escena | HEAD (narrativo) | Hoy (narrativo) |
|---|---|---|
| sin hallazgos | «No se observa derrame pericárdico ni masas intracardíacas.» | «No se observa derrame pericárdico.» + «No se observan masas intracardíacas.» |
| derrame, sin masa | «Se observa derrame moderado (10-20mm), sin evidencia de masas intracardíacas; hallazgo que requiere correlación clínica y control evolutivo.» | «Se observa derrame moderado (10-20mm); hallazgo que requiere correlación clínica y control evolutivo.» + «No se observan masas intracardíacas.» |
| pulmón con los tres temas | un solo párrafo con las tres frases | **tres entradas**, una por tema |

Las variables son **`sPeri`** y **`sMasa`**, y cada una se empuja a `inf` por separado.
`_pb.frases.forEach(x => inf.push(x))` reemplazó al `join`.

⚠️ **EL EN SUMA NO SE MOVIÓ**: sus `suma.push` son los de siempre, uno por tema.

---

## 3 · El compromiso hemodinámico

**`pericardio_hemo`**, un `<select>` de **TRES estados** (`''`, `si`, `no`), sin elegir por defecto.

- `si` → `, con compromiso hemodinámico`
- `no` → `, sin compromiso hemodinámico`
- sin consignar → **la oración no dice nada del compromiso**

⚠️ **TRES ESTADOS Y NO UN CHECKBOX.** «Sin compromiso hemodinámico» es una **afirmación**, y una
casilla desmarcada no distingue «lo busqué y no está» de «no lo busqué». Es la regla de
`coa_diast_anterogrado` y la que el **módulo de derrame/taponamiento ya aplica a sus tres colapsos**.

⚠️ **NO LO LEE EL MÓDULO DE TAPONAMIENTO.** Ese tiene su propia valoración hemodinámica, vive en
Hemodinámica y entra por «Integrar al informe». Este campo es la lectura del médico para la oración
histórica del pericardio, y **sólo sale cuando esa oración sale** —o sea con derrame y cuando el
módulo no es el que lo describe (`_dptDescribe`)—.

⚠️ **EL CAMPO NO EXISTÍA.** Censado antes de agregarlo: `dpt_hemo` es un checkbox de
**hemopericardio** (no de compromiso), y los tres colapsos del módulo son su propia pregunta.

---

## 4 · El derrame pleural: su lado

**`pul_derrame_lado`**, cuatro opciones: `''` (— sin consignar —), `derecho`, `izquierdo`,
`bilateral`. Se muestra con `pulBasicoUI` junto al tamaño y al Balik.

La frase: `'Derrame pleural ' + (lado ? lado + ' ' : '') + tam + det + '.'`

- con lado → «Derrame pleural **bilateral** moderado (Balik 25 mm, aproximadamente 500 ml).»
- sin lado → «Derrame pleural moderado (Balik 25 mm, aproximadamente 500 ml).» = **idéntica a HEAD**

⚠️ **EL LADO VA ANTES DEL TAMAÑO**, que es donde lo pone el módulo avanzado («Derrame pleural
bilateral, de aspecto libre…»). No se inventó un orden nuevo.

⚠️ **EL CAMPO NO EXISTÍA EN EL BÁSICO y sí en el avanzado** (`pua_derrame_lado`), así que un derrame
cargado ahí llegaba al informe firmado sin decir de qué hemitórax es.

⚠️ **LOS TRES VALORES SON LOS DE LA ORDEN** —derecho, izquierdo, bilateral—. El avanzado escribe
«unilateral derecho», que es **su** redacción y no se tocó.

---

## 5 · La nota de la consolidación

**`pul_consol_nota`**, un campo de texto que aparece con `pul_consolidacion` en «Sí». Su texto va **en
la misma oración**, entre paréntesis: «Consolidación pulmonar (base derecha).»

- Se le saca el punto o el punto y coma final si el médico lo escribió, para no dejar dos.
- **Al EN SUMA no va**: ahí la línea es la conclusión, no el detalle.

⚠️ **EL CAMPO TAMPOCO EXISTÍA.** El «Notas adicionales» (`otras_notas`) es del bloque de pericardio y
masas y se imprime como **párrafo propio** (`if (sv('otras_notas')) inf.push(...)`), así que no sirve
para esto.

---

## 6 · Lo que quedó SIN HACER, por falta de fuente

- ⚠️ **LA FÓRMULA DE BALIK NO ESTÁ EN LA BIBLIOTECA.** Censada entera: no hay un solo documento que la
  contenga. Lo que sí hay es el **método de Capper** —área de sección máxima × longitud axial, en la
  revisión de ETE en cuidados críticos, *Current Pulmonology Reports* 2024;13:152-172, folio 167—, que
  es **otro método** y necesitaría campos que no existen. La fórmula ya estaba implementada
  (`_balikVol`, `ml = mm × 20`) y ya se publicaba: **se reusa tal cual, no se escribió de memoria y
  no se agregó ninguna entrada a `FUENTES.md`.** `docs/PENDIENTES.md` → Y3b-5.
- ⚠️ **LAS DOS SEPARACIONES DE LÍNEAS B (≈3 mm y ≈7 mm) TAMPOCO ESTÁN.** No hay ningún protocolo POCUS
  pulmonar en la biblioteca; lo único sobre líneas B es esa misma revisión, que dice que **tres o más**
  indican edema o enfermedad intersticial (folio 167) y **no menciona ninguna separación en
  milímetros**. El selector sigue ofreciendo focal y difuso, como hasta hoy, y la oración no cambia.
  `docs/PENDIENTES.md` → Y3b-6.

---

## 7 · El Excel

**Ninguno de los tres campos nuevos agrega una columna**: el Excel es una **lista declarada**
(`LAB_XLS_BLOQUES` + el objeto de `_labExcelRow`) y no un barrido. Medido: **440 columnas** antes y
después, con el mismo valor en todas salvo `Informe (texto completo)`, que lleva el texto nuevo.

Consecuencia declarada: los tres **no se reimportan** (no están en `LAB_XLS_MAP`), así que un backup
a Excel y su reimportación los pierde. `docs/PENDIENTES.md` → Y3b-7.

---

## 8 · Trampas

1. ⚠️ **LAS DOS SECCIONES NACEN PLEGADAS** (`display:none`): sin `toggleEteSeccion` los campos existen
   y miden 0×0.
2. ⚠️ **`estiloPick(c, e, n)` ES (CONCISO, ESTÁNDAR, NARRATIVO)**, en ese orden. Leerlo al revés hace
   que el estándar reciba el texto del conciso.
3. ⚠️ **UNA SONDA QUE FILTRA LAS LÍNEAS DEL INFORME POR «derrame peric» NO VE LA ORACIÓN DEL
   PERICARDIO CON DERRAME**, que dice «Derrame moderado (10-20mm).» y nada más: la primera lectura de
   la medición informó que esa oración había desaparecido sobre un informe perfecto. El filtro es del
   lector, no del árbol.
4. ⚠️ **EL TAMAÑO DEL DERRAME PLEURAL LLEVA TILDE** (`mínimo`): una escena que lo fija como `minimo`
   no encuentra la opción y la sonda mide el valor de fábrica.

## La tanda «R» (2026-10-20) — el derrame en TRES grados y el taponamiento que no concluye

**R5 · el derrame.** `DPT_TAM` congelado con los tres grados de la ESC 2025 (severo >20 mm,
moderado 10-20, leve <10); se va el grado **«mínimo»**, que ninguna guía publica. ⚠️ **Las dos
opciones viejas quedan como `<option hidden>`** —el patrón de `et_grado`—, porque el `value` de
este selector ES su texto y es lo que viaja en `campos`. **No se migra nada.** ⚠️ **Y la opción
nueva tuvo que entrar en `LAB_XLS_LISTAS.pericardio`**: lo cazó el assert de arranque del Excel
dos commits después, y sin ella reimportar un backup con derrame leve descartaba la FILA ENTERA.

**R6 · el taponamiento LISTA los signos y no concluye** (decisión de Maicol; ESC 2025 de
miocarditis y pericarditis, Tabla 17, que lo define como clínico). `dptEstado().clave` pasa de
cuatro conclusiones a **`con_derrame` / `sin_derrame`**, `dptBadge(st)` reemplaza a `DPT_BADGE`,
y los cuatro consumidores —el POP, el POCUS, el filtro de cohorte y la hoja del PDF— quedan
alineados por construcción. ⚠️ **El compromiso hemodinámico no se deduce: se consigna**, en el
campo de tres estados `pericardio_hemo` de la pestaña Otros.

→ `docs/mapa/tanda-r-referencias.md` §§ 5 y 6.
