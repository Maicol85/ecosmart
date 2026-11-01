# Mapa — lo que se desmarca, la pantalla y el 3D de la TGA, los dibujos TEER y el papel de la MCH

**Tanda CONG-2A (2026-10-31 y 2026-11-01).** Por nombre de función y de constante, no por línea.

---

## 1 · El dueño de «hay válvula bicúspide» y los cinco orígenes de la sección

| Pregunta | Dueño |
|---|---|
| ¿La válvula es bicúspide? | `_indVABEsBicuspide()` — `!!vab_tipo || va_morf === 'Bicúspide'` |
| ¿Qué publica la sección? | `vabConclusion()` → el panel; `vabSumaFrase()` → el EN SUMA |
| ¿Quién repinta la sección? | `vabSync()` — el aviso, el dibujo, el botón del PDF, los cinco readonly, el oculto `vab_funcion` y `vabResumenPintar()` |
| ¿Quién la despierta cuando el dato vive en otra pestaña? | `_VAB_ORIGENES` + `_vabOrigenCambio`, oyente de documento sobre `input` y `change` |
| ¿Quién pone la morfología en «Bicúspide»? | `vabMorfSeguir()`, y **sólo** desde `vabTipoCambio()` |

**`_VAB_ORIGENES` tiene CINCO entradas desde esta tanda:** `ao_sin`, `ao_tub`, `ea_grado`,
`ia_grado` y **`va_morf`**. Antes tenía cuatro, y el comentario afirmaba que `va_morf` ya estaba
cubierto: lo que esa zona tenía era un oyente propio que llamaba **sólo** a `vabMorfAviso()`. Ese
oyente **se retiró** en el mismo commit, porque `vabSync` lo llama en su primera línea.

**Sin bucle, censado:** el único escritor de `va_morf` en todo el archivo es `vabMorfSeguir`.

### Lo que NO se tocó, y por qué
La morfología que `vabMorfSeguir` escribió **sobrevive** al desmarcado del tipo. Es la decisión
del Y3d7 y no se revirtió: el control negativo —la morfología puesta **a mano**, con el tipo nunca
tocado— publica **exactamente lo mismo** en el informe y en el EN SUMA, así que el estado
posterior al desmarcado es indistinguible de una afirmación del médico. Ver `C2A-a`.

### La matriz de «desmarcar»
`scripts/_probe_cong2a_matriz.mjs` (formulario vacío) y `scripts/_probe_cong2a_matriz2.mjs` (cada
sección **sembrada**, que es el denominador correcto). Barren los **105** selectores con opción
vacía de las diecinueve secciones `#sacc-cc-*`. Con la sección despierta: **45 mueven** alguna
superficie, **44 quedan limpios** y **uno** sobrevive, `vab_tipo`.
La causa del caso del médico se aísla con `scripts/_probe_cong2a_vab.mjs`, con gestos reales.

---

## 2 · La pantalla de la TGA

| Pieza | Quién |
|---|---|
| La maqueta lado a lado | `#tga-fila` + `#tga-campos`, en la hoja de estilos junto al bloque de `#oai-fila` |
| El corte | `@media (min-width: 900px)` sobre la **ventana**, no sobre el contenedor |
| El reparto | campos `flex: 0 0 46%`, tarjeta del dibujo `flex: 1 1 auto` |
| La grilla de campos | `#tga-campos { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)) }` |
| El ancho completo de «Síntomas» | la clase `tga-sint-ancho`, que pone y quita **`tgaSync`** |
| Mostrar y esconder la cirugía | `tgaSync`, por el id `tga-cirugia-row`, que **conservó su nombre** |
| El párrafo largo | el bloque `lee` del globo `VINFO['tga-3d']`, textual |

**Es UNA sola grilla y no seis filas sueltas**, y es lo que hace que los campos **corran** cuando
la cirugía se esconde: con una fila por tema, esconder ese grupo deja su celda vacía.

**El ancho completo de «Síntomas» es CONDICIONAL por una cuenta:** con la cirugía visible hay diez
campos antes, o sea cinco filas llenas, y el ancho cierra la sexta sin hueco; sin ella hay nueve,
y forzarlo empujaría «Síntomas» a una fila propia y **crearía** el hueco.

**El orden del marcado ES el orden visual**, así que la tabulación lo sigue sin un solo
`tabindex`: `tga_tipo`, `tga_cirugia`, `tga_func_vd`, `tga_dilatacion_ro`, `tga_it_ro`, `tga_bav`,
`tga_obstr_subaortica`, `tga_grad_subaortico`, `tga_civ_residual`, `tga_civ_grad`, `tga_sintomas`.

---

## 3 · El 3D de la TGA: tres estados y un dueño de «es un dato»

| Estado | `_tga3d.ref` | tipo cargado | comunicaciones | «Incluir en el PDF» |
|---|---|---|---|---|
| Vista de referencia (el botón) | sí | — | **no** | **no** |
| Corazón normal por omisión | no | no | **sí** | **no** |
| El dibujo del paciente | no | sí | sí | **sí** |

- `_sinTipo` es local a `tga3dSync` y decide el segundo estado.
- **`_tga3dEsDato()` es el dueño único** de «lo que se ve es un dato de este paciente», y lo
  consultan **los DOS** gates del PDF —el `disabled` del botón y el cuerpo de `tga3dIncluirPDF`—,
  porque romper uno solo lo tapa el otro.
- La línea de estado lo dice y **nombra el campo que lo cambia**.

### El recuadro
El defecto del médico **no es «con el tipo vacío»: es «al vaciar el tipo»**. Con el tipo vacío de
entrada no hay dibujo. Cargando un tipo y volviéndolo a «—», el canvas de 420 px se quedaba
mientras `tga3dSync` le ponía al lienzo `height:0px` —y el `min-height:40px` en línea **gana**—,
así que sin `overflow` el canvas quedaba **suelto**: desbordaba su tarjeta por **363 px** y pisaba
la fila «Conclusión» por **340**, en los cuatro anchos.

Hoy hay **dos capas**: el lienzo se **esconde** mientras no hay dibujo (`display:none` en vez de
alto 0) y lleva `overflow:hidden`. ⚠️ **El commit 3c tapa al 3b**: con la librería cargada esa
rama no se ejecuta nunca, así que el blindaje es la segunda red, para el caso en que la librería
no cargue. Ver `C2A-b`.

### Las comunicaciones
`tga3dComs()` es el dueño único y **ya leía las otras pestañas** desde la TGA-1: la CIA de
`ete_cia_*`, el foramen de `fop_*`, la CIV de `ete_civ_*` **o** de `tga_civ_residual === 'si'`, y
el ductus de `dap_*`. Lo que esta tanda movió es **dónde se dibujan**: salieron de la rama
`a === 'dtga' && o === 'none'` a un bloque común, con la **misma geometría** —el anillo, su radio,
su centro y los dos chorros, número por número—.

| | CIA, anillo en `[-0.45,0.95,-0.3]` | CIV, anillo en `[-0.05,-0.9,0.2]` | ductus |
|---|---|---|---|
| corazón normal | sí | sí | no |
| d-TGA sin cirugía | sí | sí | **sí** |
| switch auricular | **no** (`C2A-f`) | sí | no |
| Jatene | sí | sí | no |
| Rastelli | sí | **no** (`C2A-f`) | no |
| L-TGA | sí | sí | no |

**El ductus está en el mismo bloque con su condición de siempre**, y es lo que deja los tres
elementos en el orden `asd`, `vsd`, `pda` —el de la demo— para que la d-TGA sin cirugía salga
idéntica elemento por elemento.

---

## 4 · Los cuatro dibujos de los criterios TEER

**Las clases estaban en el marcado desde que la sección existe y NO tenían una sola regla.** Eso
era todo el defecto: `.teer-figrow`, `.teer-figcol` y `.teer-fig` eran bloques normales y el SVG
se dibujaba a ancho completo debajo del campo.

| | antes | después |
|---|---|---|
| cada dibujo a 1440 px | 290×226 | **150×117** |
| cada dibujo a 768 px | **706×552** | 220×172 |
| alto de los catorce campos a 1440 px | **937 px** | **619 px** |
| alto a 768 px | 3.204 px | 1.706 px |
| caja del número | 79×29 px | 41×15 px |

**Los 150 px son una medición**: el valor va dentro del SVG con `font-size="26"` sobre un
`viewBox` de 320, así que se ve a 26 × ancho / 320. A 110 px quedaría en 8,9 px.
**Y el apilado lleva tope de 220 px**: sin él, a 768 px el SVG se estira otra vez a 706.

Los cuatro pares campo↔dibujo: `teer_flail_gap`/`teer-fig-gap`,
`teer_ancho_flail`/`teer-fig-anch`, `teer_prof_flail`/`teer-fig-prof` y `teer_gap`/`teer-fig-len`.
⚠️ **El cuarto es `teer-fig-len` y su campo es `teer_gap`**, que es «Longitud coaptación».

**Las tres etiquetas del médico no se tocaron** y **sí llegan a la hoja del PDF**: ver `C2A-c`.

---

## 5 · El papel de la miocardiopatía hipertrófica

Las cuatro salidas de `mchConclusion()`:

| salida | quién la lee | qué dice |
|---|---|---|
| `txt` | el cuerpo del informe, en los tres estilos | la descripción completa, **sin guía ni conducta** |
| `resumen` | la **hoja del PDF** (`ccHoja('mch', …)`) | el resumen, **sin conducta** desde esta tanda |
| `papel` | la **diapositiva del PPT** (`CC_PPT` con `papel:true`) | lo mismo, desde AJUSTES-3 |
| `clave` | el estado de la sección | `alto` · `intermedio` · `bajo` · `incompleto` · `no_aplicable` · `no_interpretable` |

Y el **EN SUMA** lo arma `ccSumaLinea('mch')`, que devuelve un ARRAY de hasta cuatro líneas.

**El mecanismo es separar DESCRIPCIÓN de CONDUCTA y armar las salidas con las mismas piezas**:
`_escDesc` / `_escCond` para el score y `_ahaCuenta` / `_ahaCond` / `_ahaPend` para el recuento.
⚠️ **`_escCond` y `_ahaCond` quedan ARMADOS a propósito**: son el texto que la Evidencia publica
con su clase y su folio, y documentan qué se retiró del papel. La mutación 15 los vuelve a pegar.

**El modelo se nombra por lo que es**: «riesgo de muerte súbita a 5 años N %», no «HCM Risk-SCD
(ESC)». Y el recuento, «Factores mayores de riesgo de muerte súbita: N de 5».

**Ningún número desaparece.** El único que sale es «2020», el año de la guía.

---

## 6 · Las sondas de la tanda

| Para | Sonda |
|---|---|
| La matriz de desmarcar, con y sin la sección sembrada | `_probe_cong2a_matriz.mjs` · `_probe_cong2a_matriz2.mjs` |
| La causa del caso de la VAB, con gestos reales | `_probe_cong2a_vab.mjs` |
| La pantalla de la TGA en cuatro anchos y dos temas | `_probe_cong2a_pant.mjs` |
| El recuadro, el corazón normal y las comunicaciones | `_probe_cong2a_3d.mjs` |
| Los dibujos de los criterios TEER | `_probe_cong2a_teer.mjs` |
| El papel de la miocardiopatía, con su censo y su Evidencia | `_probe_cong2a_mch.mjs` |
| La comparación con la demo, **con `--file`** | `_probe_cong2a_demo.mjs` |
| El A/B general, 163 escenas | `_probe_cong2aab.mjs` |
| Las dieciocho mutaciones dirigidas | `_mut_cong2a.py` |

⚠️ **`_probe_t2a_demo.mjs` y `_probe_tga2demo.mjs` NO aceptan `--file`** y cargan siempre el
`index.html` vivo: correrlos «contra HEAD» mide el árbol de trabajo las dos veces y devuelve el
mismo número, que se lee como «el commit no cambió nada».
