<!-- mapa armado sobre la tanda del 2026-10-12; los números de línea NO se guardan a propósito -->
# Mapa — función diastólica del VI (Doppler mitral)

Se abre a demanda. **No guarda números de línea**: la línea cambia en cada edición, el nombre de la
función no. Todo lo de acá vive en el bloque grande de `<script>` de `index.html`.

Fuentes verificadas de la ASE 2025, con folio y corte: `docs/fuentes/FUENTES.md` →
`### aseDiast2025`. **Antes de abrir el PDF de la guía, mirá ahí.**

---

## Las dos superficies de pantalla, y quién manda

| Superficie | Nodo | Quién la escribe |
|---|---|---|
| **El cuadro gris** — fila «Función diastólica» del `.calc-box` del Doppler mitral | `#dd-interp` | `calcDiastolASE2025`, `calcDiastolASE2016`, la rama de FA de `calcDiastol` y `calcDiastolBSE2024` |
| **La ventana** — overlay del botón «🧭 Algoritmo» | `#diast-algo-overlay` / `#diast-algo-cuerpo` | `diastAlgoRender`, que abre `diastAlgoAbrir` y cierra `diastAlgoCerrar` |

**Para la ASE 2025 en ritmo sinusal las dos leen `diastASE2025Evaluar()`, que es el dueño único del
veredicto.** Esa función **lee el DOM y no escribe nada**; devuelve el veredicto (`clave`, `cls`,
`badgeTxt`, `texto`, `textoSuma`), el conteo (`pos`/`total`), la rama que decidió (`via`) y las
**filas** que dibuja la ventana. Un criterio nuevo entra en un solo lugar y aparece en los dos.

⚠️ **Las otras dos ramas de la ventana —BSE 2024 y ASE/EACVI 2016— SIGUEN calculando por su cuenta**
con `_daCriteriosLAP` y `_daContar`, y difieren de sus cuadros. Está censado en
`docs/PENDIENTES.md`; es otro trabajo.

---

## Selectores y despachador

- `#diast_algoritmo` — `ase2025` (recomendado) · `bse2024` · `ase2016`. Su `onchange` es
  `diastAlgoCambio`, que recuerda el protocolo en `sessionStorage` (`diastAlgoSesGuardar`), repinta
  el aviso ámbar (`diastAlgoAvisoSync`) y recalcula. `DIAST_ALGO_RECOMENDADO` = `'ase2025'`.
- `#diast_ritmo` — `sinusal` · `fa`.
- `window.calcDiastol` es el despachador y tiene **cuatro salidas**: ASE 2025, ASE 2016, la rama de
  FA (sólo alcanzable con la BSE elegida) y `calcDiastolBSE2024`. Está **envuelto** para que
  `calcVenaPulm` corra siempre después, que es donde se pinta el rojo del E/e'.
- ⚠️ **Con «ASE 2025» + FA se gradúa con la vía de RITMO SINUSAL de la BSE.** `calcDiastol` sale por
  el `return` de `ase2025` antes del bloque de FA, y `calcDiastolASE2025` deriva a
  `calcDiastolBSE2024`, que no sabe nada de FA. El algoritmo de FA de la ASE 2025 (Figura 8, folio
  563) **no está implementado**. Censado en `docs/PENDIENTES.md`; es otro trabajo.

---

## `diastASE2025Evaluar` — la Figura 3 (folio 554), paso por paso

### Entradas
`e_sep`, `e_lat`, `onda_e`, `onda_a`, `ai_vol` (÷ `getBSA()`), `vmax_it`, `psap_calc`, `lars`,
`triv`. Constantes: `UMBRAL_LAVI_DILATADO` (34), `UMBRAL_PSAP_ELEVADA` (35).

⚠️ **`prom` y `ee` son dos cosas.** `prom` es el promedio **de verdad** y vale `null` con un solo
anillo; `ee` es el e' que se muestra en la celda. Confundirlos hacía que el corte del promedio
(≤6,5) se aplicara a un anillo solo.

⚠️ **La truthiness se conserva como en HEAD**: `(ep && el)` y no `!== null`, así que un e' de **0**
se lee como «no medido». Es lo conservador — con `!== null` un 0 tipeado por error daría un E/e'
infinito y un criterio positivo sobre un dato que no existe. Declarado.

### Paso 1 — relajación
e' septal **≤6** · lateral **≤7** · promedio **≤6,5** (sólo con los dos anillos), en **OR**.

⚠️ **El promedio ≤6,5 nunca decide solo con los dos anillos, y es álgebra**: con ep > 6 y el > 7 el
promedio es ≥ 6,51. La fila igual se dibuja y cruza su corte; lo que no puede es decidir sola.

### Paso 2 — las tres variables principales
1. e' reducida (el Paso 1).
2. **E/e' aumentado**, con los tres cortes de la figura **como alternativas**: septal **≥15** o
   lateral **≥13** o promedio **≥14**. Cada una se evalúa sólo si su propio e' está medido. Ocupa
   **una** posición en el conteo y **tres filas** en la ventana.
   ⚠️ **El promedio ≥14 tampoco decide solo con los dos anillos**: 1/7 < 1/15 + 1/13, por 1/1365.
3. **IT ≥2,8 m/s** o **PSAP ≥35 mmHg**. La PSAP es la **alternativa** de la IT, no un criterio
   aparte: se lee `psap_calc`, el valor **redondeado** que muestra el cuadro y que imprime el PDF.

`R.pos`/`R.total` cuentan **estas tres** y son los números del «(N/M parámetros positivos)» de
todas las frases.

### Segundo paso — sólo si las principales no deciden
**Vol AI >34 ml/m²** · **LARS ≤18 %** · **S/D venoso pulmonar ≤0,67 → NO EVALUABLE** · y como
**alternativa** (sólo si no hay ninguno de los de arriba) **TRIV ≤70 ms**.

⚠️ **El S/D está declarado no evaluable a propósito.** `venp_sd` es un `<select>` de «<1 / >1» y el
corte de la guía es ≤0,67: un S/D de 0,9 es «<1» y **no** cumple. Tomar «<1» por «≤0,67» inventaría
un positivo. Se dibuja en **gris**, con el motivo en su propio rótulo, para que su ausencia no se lea
como un negativo.

### Paso 3 — las compuertas, en su orden
| Condición | Veredicto | `clave` |
|---|---|---|
| sin ningún e' | «Completar e' septal y/o lateral para clasificar.» | `incompleto` |
| **sólo** el e' medido (ni E, ni IT/PSAP, ni Vol AI, ni LARS, ni TRIV) | frase de datos insuficientes de HEAD | `insuf` |
| las tres principales **evaluadas y negativas** | **Función diastólica normal** | `normal` |
| las tres **positivas** | PAI elevada → se gradúa por E/A | — |
| **e' reducida sola** (E/e' e IT no abnormales) **y E/A ≤0,80** | **DD Grado I** | `g1` |
| resto → **segundo paso** sin ningún parámetro | **estado (b)**, «no estimable» | `noEstimable` |
| resto → segundo paso con **≥1 positivo** | PAI elevada → se gradúa por E/A | — |
| resto → segundo paso **todo negativo** | **estado (a)**, presión normal sin grado | `normalSinGrado` |

**Graduación con PAI elevada** (`graduarElevada`): sin E/A → `altaSinEa`; **E/A ≥2 con e' reducida**
→ `g3`; **E/A <2** → `g2` (**sin piso**: la figura no lo tiene); **E/A ≥2 con e' conservada** →
`indetComb`, que no afirma grado.

⚠️ **«Todas normales» exige las tres EVALUADAS** —es la única rama que afirma normalidad— pero
**«e' reducida sola» admite que el E/e' o la IT no estén medidos**: esa rama no afirma normalidad,
afirma relajación alterada con presión normal, y es la que deja que un paciente **sin chorro de IT**
—entre el 40 y el 60 % según la BSE— siga saliendo grado 1.

⚠️ **El grado III sigue exigiendo e' reducida.** Decisión de Maicol (2026-10-12), más estricta que
la guía: un E/A ≥2 con e' conservada es el patrón del corazón joven y sano.

### Estados que se fueron
`unico` (la guarda propia de «≥2 de 4 evaluados»), `indetBajoUmbral` (el umbral 1/2) y `indetG1`
(reemplazado por el estado (a)). No eran de la guía.

---

## Por dónde sale cada dato

| Superficie | Cómo llega |
|---|---|
| **Informe narrativo** | `generarInforme` llama a `calcDiastol()` y lee `window._diastResult.texto`. **No pasa por `estiloPick`: la frase es la misma en los tres estilos.** |
| **EN SUMA** | el mismo bloque, `suma.push(_diastResult.textoSuma)`. Un `textoSuma` vacío **no manda nada** |
| **PDF** | el narrativo y el EN SUMA, por el mismo texto |
| **PPT** | la franja de hallazgos lee `_pptSpan('dd-interp')`, o sea el **badge** del cuadro |
| **Excel** | ⚠️ **cinco columnas salen del TEXTO del resumen, no del cálculo**: «Grado disfunción diastólica», `DD_I`, `DD_II`, `DD_III` y `DD_Sin`, todas vía `_labDiastGrado`. Las columnas de datos crudos (onda E, onda A, e' septal, e' lateral, E/A, e' promedio, E/e') son del bloque «7 · DOPPLER Y DIASTÓLICA». El total es **434** |
| **Laboratorio** | `_labDiastGrado` otra vez: la distribución del panel, el PPT estadístico y los filtros de cohorte. **Cambiar una palabra del EN SUMA mueve esas cinco columnas y los gráficos** |
| **Panel de Evidencia** | **no lee nada de la diastólica**: `IND_SECS` no toca `_diastResult` |

`_labDiastGrado` clasifica con cuatro expresiones sobre `en_suma` + `informe_texto`:
`grado III|restrictivo` → III · `grado II|pseudonormal` → II ·
`grado I|relajación alterada|prolongada` → I · `diastólica normal|llenado (del VI) normal` → `sin`.

---

## Trampas de esta zona

- ⚠️ **`calcDiastol` NO está cableado a todos los campos que lee.** Sus `oninput` están sólo en los
  cuatro del Doppler mitral, el LARS y los dos selectores. **El Vol AI, la velocidad de la IT, el
  TRIV y los campos de VCI no lo llaman**, así que cargar uno de esos deja **el cuadro gris con el
  veredicto del paciente anterior**. La ventana **no** se atrasa: `diastAlgoRender` cuelga de un
  oyente de `input`/`change` a nivel documento. `generarInforme` llama a `calcDiastol`, así que el
  **informe firmado nunca se atrasa**. Es pre-existente y está en `docs/PENDIENTES.md`.
  **Al medir: tipear primero lo no cableado y los campos mitrales al final**, o llamar
  `calcDiastol()` a mano. Sin eso, una sonda informa el veredicto del paciente anterior.
- ⚠️ **Las tres celdas compartidas (`ea-val`, `eprom-val`, `ee-val`) se escriben ANTES del `return`
  de FA**, en `calcDiastolASE2025` y no en el dueño. `calcDiastolBSE2024` escribe `eprom-val` sólo
  con los dos anillos, así que mover esa escritura detrás del `return` dejaría en blanco el e'
  promedio de un estudio en FA con un solo anillo.
- ⚠️ **`eprom-val` dice «e' promedio» y muestra el valor del único anillo** cuando hay uno solo, y
  `ee-val` dice «E/e' promedio» con el cociente de ese único sitio. Pre-existente, sólo de pantalla,
  declarado en `docs/PENDIENTES.md`.
- ⚠️ **El rojo del E/e' se pinta en `calcVenaPulm`**, no acá, y su corte es `UMBRAL_EE_ELEVADA`
  (14) con `>`. `eeCorteEs14()` lo apaga en la rama de BSE + FA. **No sigue a los tres cortes por
  sitio de la ASE 2025**: declarado en `docs/PENDIENTES.md`.
- ⚠️ **El aviso ámbar de exclusiones (`diast-excl-aviso`)** no cambia ningún veredicto: sólo avisa.
  Su único dueño es `diastExclSync`, que está en `RECALC_MODULOS` y se llama al final de
  `limpiarCampos`.

---

## Cómo medir esta zona

```bash
node scripts/_probe_diast2025.mjs --solo cuadro,ventana,bordes,superficies,fa,otros
node scripts/_probe_diast2025.mjs --file /tmp/index.HEAD.html   # el otro lado del A/B
node scripts/test_clinico.mjs --solo TC-27,TC-28,TC-29,TC-453
```

La sonda es **A/B de solo lectura** y carga cada escena con **teclas reales**. Grupos: `cuadro`,
`ventana`, `desfase`, `bordes`, `superficies`, `fa` (control negativo), `otros` (control negativo de
BSE y 2016). **Informa el denominador de cada escena** —qué quedó en cada campo y cuántas filas vio
la ventana—, porque un conteo sobre una ventana que no abrió da cero y parece acuerdo perfecto.

**TC-453** es la cobertura: los bordes de cada corte por sus dos lados, la escena 3.1, los dos
estados nuevos con su literal exacto y cuatro controles negativos.
