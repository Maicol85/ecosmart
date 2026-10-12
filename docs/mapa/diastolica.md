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
| **El cuadro gris** — fila «Función diastólica» del `.calc-box` del Doppler mitral | `#dd-interp` | en ritmo sinusal `calcDiastolASE2025`, `calcDiastolASE2016` y `calcDiastolBSE2024`; en **FA**, `diastFAPintar` |
| **La ventana** — overlay del botón «🧭 Algoritmo» | `#diast-algo-overlay` / `#diast-algo-cuerpo` | `diastAlgoRender`, que abre `diastAlgoAbrir` y cierra `diastAlgoCerrar` |

**Para la ASE 2025 en ritmo sinusal las dos leen `diastASE2025Evaluar()`, que es el dueño único del
veredicto.** Esa función **lee el DOM y no escribe nada**; devuelve el veredicto (`clave`, `cls`,
`badgeTxt`, `texto`, `textoSuma`), el conteo (`pos`/`total`), la rama que decidió (`via`) y las
**filas** que dibuja la ventana. Un criterio nuevo entra en un solo lugar y aparece en los dos.

✅ **Y desde el 2026-10-12 las TRES guías tienen su dueño único**: la BSE 2024 lee
`diastBSE2024Evaluar` y la ASE/EACVI 2016 lee `diastASE2016Evaluar`. `_daCriteriosLAP` y `_daContar`
quedaron **definidos y sin consumidores**. El renglón que decía que las otras dos ramas calculaban
por su cuenta ya no vale.

📄 **La ASE/EACVI 2016 en ritmo sinusal tiene mapa propio: `docs/mapa/diastolica-ase2016.md`** (los
dos algoritmos de la Figura 8, el corte de FEVI, el S/D, las frases y las trampas). Se sacó a
archivo aparte porque este mapa ya pesaba 32,7 KB y el techo son ~35 KB. La **fibrilación auricular**
de esa misma guía sigue acá, en «La FIBRILACIÓN AURICULAR».

---

## Selectores y despachador

- `#diast_algoritmo` — `ase2025` (recomendado) · `bse2024` · `ase2016`. Su `onchange` es
  `diastAlgoCambio`, que recuerda el protocolo en `sessionStorage` (`diastAlgoSesGuardar`), repinta
  el aviso ámbar (`diastAlgoAvisoSync`) y recalcula. `DIAST_ALGO_RECOMENDADO` = `'ase2025'`.
- `#diast_ritmo` — `sinusal` · `fa`.
- `window.calcDiastol` es el despachador y **decide el RITMO antes que la guía**: con
  `diast_ritmo = fa` llama a `diastFAEvaluar(algo)` y pinta con `diastFAPintar`; en ritmo sinusal
  sigue a `calcDiastolASE2025`, `calcDiastolASE2016` o `calcDiastolBSE2024`. Está **envuelto**
  para que `calcVenaPulm` corra siempre después, que es donde se pinta el rojo del E/e'.
  ⚠️ **Hasta el 2026-10-12 era al revés y se comía la FA**: con «ASE 2025» salía por el
  `return` de `ase2025` y terminaba en `calcDiastolBSE2024` —la vía SINUSAL de la BSE, con el
  badge diciendo «BSE 2024»—, y con «ASE 2016» salía por el suyo y caía siempre en «Datos
  insuficientes», porque esa cascada arranca por el cociente E/A y en FA no hay onda A.

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

## `diastBSE2024Evaluar` — la BSE 2024 en RITMO SINUSAL (2026-10-12)

**Dueño único de la BSE en ritmo sinusal.** Lo leen el cuadro gris (`calcDiastolBSE2024`) y la
ventana 🧭 (rama `bse2024` de `diastAlgoRender`). Es **puro**: no escribe ni una celda. Las tres
celdas compartidas (`ea-val`, `eprom-val`, `ee-val`) las escribe el cuadro, con la condición de
HEAD — el e′ promedio y el E/e′ **sólo con los DOS anillos**, que NO es lo que hace
`diastCeldasBasicas`.

> Antes de esta tanda el cuadro y la ventana contaban **variables distintas** y acordaban en
> **3 de 28** escenas. Hoy acuerdan en 28 de 28.

### Entradas

| Dato | id | Pestaña |
|---|---|---|
| Onda E, onda A | `onda_e`, `onda_a` | Doppler |
| e′ septal, e′ lateral | `e_sep`, `e_lat` | Doppler |
| Vmax IT (m/s) | `vmax_it` (espejado con `it_vmax_cw`) | Doppler / Válvulas |
| Vol AI | `ai_vol` (÷ `getBSA()` → LAVi) | 2D |
| LARS | `lars` (espejado con `lars_dop`) | **AI/VI** / Doppler |
| Strain de **contracción** de la AI (el LAPs de la guía) | `ai_strain_ct` (espejado con `ai_strain_ct_dop`), en **valor absoluto** por `diastStrainAbs` | **AI/VI** / Doppler |
| Onda L | `onda_l` | Doppler |
| Ar−A | `venpArA()`, de `venp_dur_ar` y `venp_dur_a` | Doppler (vena pulmonar) |
| S/D venoso pulmonar | `venp_sd` (`<select>`: `menor1` / `mayor1`) | Doppler |
| TDE | `tde` | Doppler |
| FEVI, GLS | `fevi`, `sgl` | 2D / Strain |
| **Edad, sexo** | `edad`, `sexo` | **Paciente** |

**Sin campo en esta app, declarados no evaluables:** LAPs (strain de bomba de la AI) y onda L.
⚠️ **ESTO DEJÓ DE SER CIERTO EL 2026-10-12.** La tanda del strain de la AI agregó los dos
campos que faltaban —el LAPs es `ai_strain_ct` y la onda L es `onda_l`— y el Excel pasó a
**435 columnas** (una sola nueva: «Strain contracción AI (%)»). Ver «Los campos de strain de la
AI y la onda L» más abajo.

### Las constantes, y por qué no se comparten

| Constante | Valor | Borde | De dónde |
|---|---|---|---|
| `BSE_EE_PROM` | 14 | `>` | pág. 14 y banda de la Figura 17 |
| `BSE_EE_SEPTAL` | 15 | `>` | pág. 14, **sólo con un anillo** |
| `BSE_EE_LATERAL` | 13 | `>` | pág. 14, **sólo con un anillo** |
| `BSE_IT_SIGNIF` | 2,8 | `>` | Figura 17 |
| `UMBRAL_LAVI_DILATADO` | 34 | `>` | compartido con toda la app |
| `BSE_TABLA2` | 7/9 · 8/11 · 5/6 · 4/5 | `<` | Tabla 2, pág. 13 |
| `BSE_LARS_NORMAL` / `BSE_LAPS_NORMAL` | 30 / 14 | `>=` | Figura 17 |
| `BSE_LARS_ELEVADA` | 18 | `<` | Figura 17 |
| `BSE_ARA_SUPL` / `BSE_ONDAL_SUPL` | 30 / 20 | `>` | Figuras 17 y 18 |
| `BSE_FR_LARS_ELEV` / `BSE_FR_LAPS_ELEV` | 18 / 8 | `<` | **Figura 18** |
| `BSE_FR_LARS_NORM` / `BSE_FR_LAPS_NORM` | 24 / 14 | `>=` | **Figura 18** |
| `BSE_FR_TDE_SUPL` | 150 | `<` | **Figura 18** |
| `BSE_GRIS_*` | 50-55 / 16-18 | `[a, b)` | pág. 35 |

⚠️ **NINGUNA se comparte con la FA de esta misma guía** (Figura 19: E/e′ **septal** > 11, TDE
**≤ 160**, LARS < 16). Tres figuras, tres juegos de constantes. Y el `VENP_AR_A_MS` (`>= 30`) de
la ASE/EACVI 2016 que vive al lado **no se tocó**: la BSE usa `> 30` y lleva su propia constante.

### El orden: presión primero, e′ al final

1. **Vía.** `fevi < 50 || |sgl| < 16` → vía B (Figura 18); si no, vía A (Figura 17). El tercer
   motivo de entrada de la Figura 18 —«known myocardial disease»— **la app no lo mide**.
2. **Tres variables principales** (las mismas en las dos vías): E/e′ (promedio, o el corte del
   único anillo medido), Vmax IT, LAVi.
3. **Conteo**: `≥2 positivas` → elevada · `≥2 negativas` → normal · `exactamente 2 evaluadas,
   1 y 1` → rama del strain · **cualquier otra cosa (0 ó 1 evaluada) → datos insuficientes**.
4. **Rama del strain** — su estado por defecto es **indeterminada**, y el strain es lo que lo
   resuelve. Vía A: `LARS ≥30` → normal · `LARS <18` → elevada · en medio, suplementarios
   (Ar−A, onda L). Vía B: `LARS <18` → elevada · `LARS ≥24` → normal · en medio, **cuatro**
   suplementarios (Ar−A, onda L, S/D `<1`, TDE `<150`). Sin ningún suplementario evaluable →
   indeterminada.
5. **Paso del e′ (SÓLO vía A y SÓLO del lado de la presión normal)**: `bseEprimaEstado` resuelve
   la Tabla 2 por edad y sexo. Con presión **elevada** el e′ **no se consulta** — la figura va
   directo a la casilla roja.

### Las categorías y sus frases

| Clave | Badge | Informe | EN SUMA |
|---|---|---|---|
| `normal` | Normal para la edad | «Función diastólica normal para la edad, con presión de llenado del VI normal (…).» | «Función diastólica normal para la edad.» |
| `alterada_normal` / `fr_normal` | Deteriorada, presión normal | «Función diastólica deteriorada con presión de llenado del VI normal (…).» | «Función diastólica deteriorada, presión de llenado normal.» |
| `elevada` / `fr_elevada` | Deteriorada, presión elevada | «Función diastólica deteriorada con presión de llenado del VI elevada (…).» | «Función diastólica deteriorada, presión de llenado elevada.» |
| `indeterminado` | Presión indeterminada | «Presión de llenado del VI indeterminada por discordancia entre los parámetros (…); considerar el strain de la AI u otros parámetros.» | «Presión de llenado del VI indeterminada.» |
| `normal_sin_eprima` | Presión normal, relajación no valorada | «Presión de llenado del VI normal (…). No se valoró la relajación: …» | «Presión de llenado del VI normal.» |
| `presion_insuficiente` | Datos insuficientes — faltan variables de presión | **`texto: null`** (el informe cae en su respaldo) | — |

**Las dos vías comparten las casillas 2 y 3**, así que comparten frase. **Ningún texto escribe un
grado**: la BSE abandonó los I-III (pág. 48). `DETALLES` lo arma `_bseDetalles` **desde el dueño**,
porque es el único que sabe si la rama del strain llegó a correr.

### Los dos avisos ámbar, y sus tres columnas

- `#diast-bse-eprima-aviso` — dueño `diastBseEprimaAvisoSync`. Dos textos: falta edad/sexo, o la
  edad cae fuera del rango de la Tabla 2. **No cambia ningún veredicto.**
- `#diast-bse-gris-aviso` — dueño `diastBseGrisAvisoSync`. Zona gris de FEVI/GLS. **No cambia
  ningún veredicto, y está medido.**

Los dos van en el **oyente de documento**, en **`RECALC_MODULOS`** y en **`limpiarCampos`**, al
lado de `diastExclSync` y `diastFcAvisoSync`.

### Trampas propias de esta zona

- ⚠️ **`edad` y `sexo` viven en otra pestaña y hoy son INSUMOS del veredicto.** Los dos llaman a
  `calcDiastol` desde su `oninput`/`onchange`; sin eso el cuadro gris se queda con el paciente
  anterior. La ventana no se atrasa (tiene su oyente de documento).
- ⚠️ **Los cortes por sitio del E/e′ NO son un OR**, a diferencia de la ASE 2025: reemplazan al
  promedio sólo cuando falta un anillo.
- ⚠️ **El e′ se combina con un OR entre septal y lateral**, y no hay corte de promedio.
- ⚠️ **Con una sola variable principal evaluada no se afirma nada**, ni en la vía A ni en la B.
  HEAD afirmaba en las dos.
- ⚠️ **El badge alimenta la franja del PPT** (`#dd-interp`): renombrarlo cambia el PPT.
- ⚠️ **El EN SUMA alimenta al Laboratorio** por `_labDiastGrado`: cambiar una palabra mueve la
  columna de texto del Excel. Los cuatro tokens sin grado NO activan `DD_*` ni entran en la
  distribución.

## La FIBRILACIÓN AURICULAR — un algoritmo por guía (2026-10-12)

`diast_ritmo = fa` manda **antes** que la guía. El despachador llama a `diastFAEvaluar(algo)`, que
devuelve el dueño de esa guía, y `diastFAPintar` escribe el cuadro y `window._diastResult`. La
ventana 🧭 tiene su **propia rama de FA al principio de `diastAlgoRender`**, que lee el MISMO
dueño: para la FA las dos superficies no pueden separarse, en las tres guías.

Los tres dueños tienen la forma de `diastASE2025Evaluar`: **leen el DOM y no escriben nada**, y
devuelven `cls`, `badgeTxt`, `ventanaTit`, `ventanaDet`, `texto`, `textoSuma` y las `filas`.

| Guía | Función | Fuente |
|---|---|---|
| ASE 2025 | `diastFAEvaluarASE2025` | Figura 8, folio 563 |
| BSE 2024 | `diastFAEvaluarBSE2024` | Figura 19, pág. 39 |
| ASE/EACVI 2016 | `diastFAEvaluarASE2016` | sección E, folio 295 |

### Entradas
`_diastFADatos()` las lee una vez: `onda_e`, `e_sep`, `e_lat`, `vmax_it`, `psap_calc`, `tde`,
`triv`, `lars`, `venp_sd`, `fevi`, `ao_fc` y el **IMC por `getIMC()`** (de `peso` y `talla`).
**Ningún campo nuevo en esa tanda**; desde el 2026-10-12 el Excel está en **435 columnas**.

### Los cortes, por guía

| Parámetro | ASE 2025 (Fig. 8) | BSE 2024 (Fig. 19) | ASE 2016 (folio 295) |
|---|---|---|---|
| Onda E | **≥ 100 cm/s** | **≥ 100 cm/s** | — |
| E/e' | **septal > 11** | **septal > 11** | **≥ 11**, sitio sin especificar |
| IT | **> 2,8 m/s** | **> 2,8 m/s** | **> 2,8 m/s** |
| PSAP | **> 35 mmHg**, alternativa de la IT | **no existe** | — |
| TDE | **≤ 160 ms** | **≤ 160 ms** | **≤ 160 ms**, sólo con FEVI deprimida |
| TRIV | — | — | **≤ 65 ms** |
| LARS (paso 2) | **< 18 %** | **< 16 %** | — |
| S/D venoso (paso 2) | **< 1** | **< 1** | — |
| IMC (paso 2) | **> 30 kg/m²** | **> 30 kg/m²** | — |

### Las reglas, que NO son la misma

- **ASE 2025** — paso 1: ≥3 positivos → elevada · 0 ó 1 → normal · 2 → paso 2. Paso 2: ≥2 de 3 →
  elevada · 0 con los **tres evaluados** → normal · 1 solo, o sin los tres → **indeterminada**.
- **BSE 2024** — paso 1: ≥3 **positivos** → elevada · ≥3 **negativos** → normal · si no → paso 2.
  Paso 2: ≥2 positivos → elevada · ≥2 negativos → normal · si no → **indeterminada**.
- **ASE/EACVI 2016** — **no hay regla**: se muestran los parámetros con su estado y se dice que la
  guía no los combina. **No hay veredicto y no hay frase.**

⚠️ **CON PARÁMETROS SIN MEDIR, LA ASE 2025 SÓLO CONCLUYE LO ROBUSTO.** Su figura cuenta «of
above» sobre los cuatro y no dice qué hacer con los que faltan: a la letra, un formulario vacío
tiene «none of above» y saldría **normal**. Así que la app afirma normalidad sólo si, aun con
todos los faltantes positivos, el conteo siguiera en 0 ó 1; y presión elevada con 3 positivos,
que ningún faltante deshace. Lo demás es `FA — Datos insuficientes`, con el motivo. **La BSE no
necesita esa guarda**: cuenta negativos explícitamente.

### Los cinco desenlaces, y su frase
`_diastFAElevada` · `_diastFANormal` · `_diastFAIndet` · `_diastFANoConcluye` (sólo ASE 2025) ·
`_diastFASinRegla` (sólo ASE 2016). El `badgeTxt` lleva la guía entre paréntesis y el
`ventanaTit` es el mismo texto **sin** ese sufijo: si los dos se escriben distinto, deja de poder
comprobarse que el cuadro y la ventana dicen lo mismo comparando sus textos.

**Sólo `_diastFAElevada` escribe `texto` y `textoSuma`**, y los dos son la misma frase:

> «Disfunción diastólica con presión de llenado elevada (con FA).»

Los otros cuatro los dejan vacíos, y `diastFAPintar` marca `faSinFrase: true` para apagar el
respaldo de `generarInforme` —«Función diastólica no valorada por datos insuficientes.»—, que
también es una frase de función diastólica. **En FA el informe firmado no escribe nada salvo con
presión elevada** (decisión de Maicol, 2026-10-12).

### El aviso de frecuencia cardíaca
`diastFcAvisoSync` es su único dueño, pinta `#diast-fc-aviso` y **sólo con BSE + FA**: la Figura 8
de la ASE no pone ningún límite. Dos tramos, porque la Figura 19 dice dos cosas distintas:
**> 120 lpm** «no se recomienda» (su pie) y **100 a 120** «pide < 100 lpm» (su encabezado).
**No cambia ningún veredicto.** Lleva las **dos columnas**: el oyente de documento que ya repinta
la ventana (con `RECALC_MODULOS`) y `limpiarCampos`.

### Trampas propias de esta zona

- ⚠️ **EL S/D VENOSO PULMONAR CAMBIA DE ESTADO SEGÚN EL RITMO.** En sinusal el corte es ≤0,67 y el
  `<select>` de «<1 / >1» no puede expresarlo: está declarado **no evaluable**. En FA el corte es
  **< 1**, que es exactamente lo que dice la opción, así que **sí vota**. Es el mismo campo con
  dos cortes, y uno cae justo en el borde de la opción.
- ⚠️ **UNA IT DE 2,80 ES POSITIVA EN SINUSAL Y NEGATIVA EN FA.** La Figura 3 la escribe con `≥` y
  las Figuras 8 y 19 con `>`. Las dos cosas son correctas y por eso las ramas **no comparten
  constantes**. Lo mismo con el E/e'.
- ⚠️ **EL IMC DE 30,00 EXACTO DEPENDE DE LA TALLA, POR PUNTO FLOTANTE.** El corte es `> 30` y un
  30 exacto es negativo —verificado con talla 100 y peso 30—, pero `(170/100)**2` vale
  `2.8899999999999997`, así que **86,7 kg con 170 cm da 30.000000000000004 y cruza el corte**. No
  se tocó `getIMC`, que es el dueño único y lo comparten `calcBSA`, el encabezado del PDF y el PPM
  mitral. Al fijar un caso de borde del IMC, usar talla 100 (el peso en kilos **es** el IMC).
- ⚠️ **EL LARS TIENE DOS CORTES Y NO ES UN DESCUIDO**: 18 % en la ASE y 16 % en la BSE, que lo baja
  porque en FA no hay contracción auricular (pág. 40). Un 17 % da indeterminada por una guía y
  normal por la otra sobre el **mismo** paciente.
- ⚠️ **`calcDiastolASE2025` CONSERVA SU GUARDA DE FA** aunque el despachador ya decida el ritmo:
  cubre a quien la llame directamente, y hay casos de la suite que lo hacen.

---

## Por dónde sale cada dato

| Superficie | Cómo llega |
|---|---|
| **Informe narrativo** | `generarInforme` llama a `calcDiastol()` y lee `window._diastResult.texto`. **No pasa por `estiloPick`: la frase es la misma en los tres estilos.** |
| **EN SUMA** | el mismo bloque, `suma.push(_diastResult.textoSuma)`. Un `textoSuma` vacío **no manda nada** |
| **PDF** | el narrativo y el EN SUMA, por el mismo texto |
| **PPT** | la franja de hallazgos lee `_pptSpan('dd-interp')`, o sea el **badge** del cuadro |
| **Excel** | ⚠️ **cinco columnas salen del TEXTO del resumen, no del cálculo**: «Grado disfunción diastólica», `DD_I`, `DD_II`, `DD_III` y `DD_Sin`, todas vía `_labDiastGrado`. Las columnas de datos crudos (onda E, onda A, e' septal, e' lateral, E/A, e' promedio, E/e') son del bloque «7 · DOPPLER Y DIASTÓLICA»; el LARS y el strain de contracción están en el bloque «3 · AURÍCULA IZQUIERDA». El total es **435** |
| **Laboratorio** | `_labDiastGrado` otra vez: la distribución del panel, el PPT estadístico y los filtros de cohorte. **Cambiar una palabra del EN SUMA mueve esas cinco columnas y los gráficos** |
| **Panel de Evidencia** | **no lee nada de la diastólica**: `IND_SECS` no toca `_diastResult` |

`_labDiastGrado` clasifica con cuatro expresiones sobre `en_suma` + `informe_texto`:
`grado III|restrictivo` → III · `grado II|pseudonormal` → II ·
`grado I|relajación alterada|prolongada` → I · `diastólica normal|llenado (del VI) normal` → `sin`.

---

## Trampas de esta zona

- ✅ **EL DESFASE DEL CUADRO ESTÁ CERRADO (2026-10-12).** `calcDiastol` vivía sólo en los `oninput`
  de los cuatro campos mitrales, del LARS y de los dos selectores; el TDE y el TRIV no tenían
  manejador ninguno y el Vol AI, la IT (sus dos campos), el peso, la talla, la FEVI, el S/D y los
  dos de VCI llamaban a lo suyo y no a la diastólica, así que el cuadro se quedaba con el
  veredicto del paciente anterior. Hoy esos **once** campos la llaman. Medido en A/B: en ritmo
  sinusal el **veredicto final es idéntico** —es una función pura de los campos— y lo único que
  cambia es cuándo se repinta.
  **Al medir sigue conviniendo tipear los selectores primero**: `vci_col` entra por `calcPmAD`, y
  el orden de una escena se lee mejor si el último gesto es un campo del propio módulo.
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
node scripts/_probe_diastfa.mjs --solo cuadro,ventana      # la FA: grupos de a uno
node scripts/_probe_diastfa.mjs --solo bordes
node scripts/_probe_diastfa.mjs --file /tmp/index.HEAD.html --solo desfase
node scripts/_probe_diast2025.mjs --solo cuadro,ventana,bordes,superficies,fa,otros
node scripts/_probe_diast2025.mjs --file /tmp/index.HEAD.html   # el otro lado del A/B
node scripts/test_clinico.mjs --solo TC-27,TC-28,TC-29,TC-453
```

La sonda es **A/B de solo lectura** y carga cada escena con **teclas reales**. Grupos: `cuadro`,
`ventana`, `desfase`, `bordes`, `superficies`, `fa` (control negativo), `otros` (control negativo de
BSE y 2016). **Informa el denominador de cada escena** —qué quedó en cada campo y cuántas filas vio
la ventana—, porque un conteo sobre una ventana que no abrió da cero y parece acuerdo perfecto.

**TC-453** es la cobertura del ritmo sinusal: los bordes de cada corte por sus dos lados, la
escena 3.1, los dos estados nuevos con su literal exacto y cuatro controles negativos.

**TC-454 es la de la FA**: 68 condiciones —el conteo del paso 1 de 0 a 4 en las dos guías que lo
tienen, los bordes de cada corte por los dos lados, el segundo paso, los dos cortes del LARS, el
IMC, la PSAP con su control negativo en la BSE, la frase única del informe y seis controles
negativos—. Verificado que sabe fallar **contra HEAD en un worktree aparte: 47 de las 68 en
rojo**; las que pasan son las que esta tanda no mueve.

**`scripts/_probe_diastfa.mjs`** es el arnés de la FA, A/B de solo lectura con `--file`, con siete
grupos: `cuadro`, `ventana`, `bordes`, `superficies`, `sinusal` (control negativo), `desfase` y
`fc`. **Correr los grupos de a uno.**

---

## Los campos de strain de la AI y la onda L (2026-10-12)

**Cuatro campos, y NO son cuatro datos iguales.** El censo, que es lo primero que hay que mirar
antes de tocar esta zona:

| Campo | id | Dónde vive | Qué es | Quién lo usa |
|---|---|---|---|---|
| LARS | `lars` ↔ `lars_dop` | AI/VI y Doppler mitral | strain de **reservorio** | BSE Fig. 17 y 18, ASE 2025 (2.º paso), las tres ramas de FA, la ventana 🧭, el Excel |
| Strain de contracción | `ai_strain_ct` ↔ `ai_strain_ct_dop` | AI/VI y Doppler mitral | el **LAPs** (*pump strain*) de la guía | **sólo** BSE Fig. 17 y 18 |
| Strain de conducto | `ai_strain_cd` | **sólo** AI/VI | *conduit strain* | **NADIE** — es registro |
| Onda L | `onda_l` | **sólo** Doppler mitral | velocidad mesodiastólica del llenado mitral | BSE Fig. 17 y 18 (`> 20`), ASE 2025 suplementarios (`>= 50`) |

**El dueño del valor absoluto es `diastStrainAbs`, y es uno solo.** Los ecógrafos dan el strain de
contracción y el de conducto negativos; las figuras escriben sus cortes sobre la magnitud. El campo
guarda lo que el médico tipea y la cuenta usa `|x|`. **El LARS NO pasa por ahí**: se espera
positivo y un negativo se marca «(revisar)» sin corregirse. Una segunda llamada a `Math.abs`
repartida por el archivo es cómo se llega a que un −12 vote en una figura y no en la otra.

**La sincronía** la hacen `larsSync` y `laContrSync`, con el patrón de los otros cinco grupos
(`tsviDiamSync`, `itvTsviSync`, `aiAreaSync`, `thpSync`, `vtiMitralSync`): guarda de reentrada,
salida temprana por **texto** igual —así el vacío se copia igual que un número y borrar en un lugar
borra en el otro— y copia siempre, con el bloque visible o plegado. Las puertas son `larsEditado`,
`laContrEditado` y `diastStrainEditado`, que además repintan la marca y llaman a `calcDiastol`.

⚠️ **Ninguno de los cuatro es destino registrado en `_ESPEJOS_TODOS`**, así que `_coordMarcarEspejo`
NO se llama: marcarlos metería en `im_espejos` ids que `imEspejosRestaurar` rechaza por su guarda.

⚠️ **Las dos sincronías NO están en `RECALC_MODULOS`**, a diferencia de `dtTapSync` y `etTsvdSync`.
Es una decisión: un estudio anterior al 2026-10-12 trae `lars` y no `lars_dop`, y copiarlo al abrir
sería migrar el registro en silencio. **Medido**: un registro al que se le quitan las cinco claves
nuevas reabre con `lars = 27` y las cinco vacías. Lo que SÍ está en `RECALC_MODULOS` —y además al
final de `limpiarCampos`, que no pasa por ese embudo— es `diastStrainMarcaSync`, que sólo pinta.

### Las bandas y la marca «(revisar)»

| Campo | Banda | Dueño |
|---|---|---|
| `lars` | `[0, 60]` | `LAB_XLS_RANGO_PROPIO.lars` (ya existía, con su motivo escrito) |
| `ai_strain_ct` | `[-60, 60]` | `DIAST_STRAIN_BANDA`, y `LAB_XLS_RANGO_PROPIO` la reusa **por referencia** |
| `ai_strain_cd` | `[-60, 60]` | `DIAST_STRAIN_BANDA` |
| `onda_l` | `[0, 200]` | `DIAST_STRAIN_BANDA` |

Las dos del strain son **simétricas**: es la banda del valor absoluto escrita sobre el valor crudo,
así que un −16 no se marca y un −160 sí. La de la onda L arranca en 0 porque es una velocidad.
La marca la escribe `diastStrainMarcaSync` en los **seis** renglones, **no bloquea ni cambia ninguna
cuenta** (decisión de «MARCAR SIN BORRAR», 2026-09-27) y se apaga sola sin dato.

### Dónde entra cada uno, y por qué no se comparten cortes

- **Figura 17 (FEVI normal).** Primera caja: `LARS ≥ 30` **OR** `contracción ≥ 14` → presión normal.
  Segunda: `LARS < 18` → elevada. Suplementarios: `Ar−A > 30 ms` · `onda L > 20 cm/s`, ≥1 positivo
  → elevada; todos negativos → normal; **ninguno evaluable → indeterminada**.
- **Figura 18 (FEVI reducida).** `LARS < 18` **OR** `contracción < 8` → elevada; `LARS ≥ 24` **OR**
  `contracción ≥ 14` → normal; y **cuatro** suplementarios (Ar−A, onda L, S/D `< 1`, TDE `< 150`).
- **ASE 2025.** No usa ninguno de los dos strain nuevos. Usa la **onda L `≥ 50 cm/s`** y SÓLO en el
  caso que escribe la Figura 3: `If none available or reliable use Supplemental methods` dentro de
  la caja del segundo paso, o sea con el segundo paso **sin ninguno** de sus parámetros
  (`seg2Eval === 0`). La etapa es una **LISTA** (`ASE_SUPLEMENTARIOS`), con la onda L como único
  elemento: los otros cuatro de la nota ‡ se agregan ahí y nada más.
- **ASE/EACVI 2016 y las tres ramas de FA: no cambian.** Barrido del PDF de 2016: cero usos de
  L-wave y de strain de la AI fuera de la bibliografía.

⚠️ **LA ONDA L TIENE DOS CORTES Y EL LARS TAMBIÉN.** `> 20 cm/s` en la BSE y `≥ 50 cm/s` en la ASE;
`≤ 18 %` en la ASE y `< 16 %` en la FA de la BSE. **No se unifican**: cada corte es de su fuente.

⚠️ **CON EL SUPLEMENTARIO DE LA ASE NEGATIVO NO SE AFIRMA PRESIÓN NORMAL.** La flecha «None» de la
figura sale de la caja entera, o sea de haber preguntado sus cinco parámetros; la app puede
preguntar uno. El estado se queda en el «No estimable» de HEAD, cuyo texto sigue siendo cierto, y
lo único que se agrega es que la `via` de la ventana dice que el suplementario se evaluó.

### Excel

**Una sola columna nueva: «Strain contracción AI (%)»**, pegada a «LARS (%)» (índices 20 y 21) en el
bloque «3 · AURÍCULA IZQUIERDA». **El Excel pasa de 434 a 435 columnas.** Lleva el valor **crudo**,
no el absoluto: es lo que el campo guarda y lo que tiene que volver por el importador. El strain de
**conducto** y la **onda L** no llevan columna, por orden expresa.

### Trampas de esta zona

- ⚠️ **Tipear en un campo que no existe no es una medición.** Contra el árbol de HEAD estos campos
  no están; una sonda que igual manda las teclas se las concatena al campo anterior. Medido: tipear
  `15` en `lars_dop` sobre HEAD dejó el E/e′ en **1848,5** en vez de 18,5, y la sonda informó esa
  diferencia como si fuera del commit. `tipear()` de `_probe_strainai.mjs` aborta si el nodo falta.
- ⚠️ **El hash de «campos» tiene que excluir los seis ids nuevos** además de `informe_texto` y
  `en_suma`. Si no, el A/B dice «distinto» en TODAS las escenas por el solo hecho de que los campos
  existen, y deja de distinguir «se agregó un campo» de «cambió otro».
- ⚠️ **El hash del Excel, igual**: hay que comparar la fila **sin** la columna nueva
  (`hashSinNueva`), que es lo único que separa «se agregó una columna» de «cambió el valor de otra».
- ⚠️ **La rama del strain tiene UNA sola puerta**: dos criterios disponibles, uno positivo y uno
  negativo (`evalN === 2 && pos === 1 && neg === 1`). Cualquier escena que no la cumpla mide otra
  cosa, y el badge que no se mueve se lee como un corte que no funciona.

**Cobertura: TC-456**, 46 condiciones con cuatro denominadores y seis controles negativos.
Verificado que sabe fallar contra HEAD en un worktree aparte: **27 de las 46 en rojo**; las 19 que
pasan son los controles negativos y lo que esta tanda no mueve.
**Arnés: `scripts/_probe_strainai.mjs`** (A/B de solo lectura con `--file`), once grupos
(`sinc`, `marca`, `vacio`, `bse17`, `bse18`, `ase`, `bordes`, `signo`, `excel`, `ancho`, `guardado`).
