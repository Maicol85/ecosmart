# Mapa — la FIBRILACIÓN AURICULAR de la función diastólica

> **Archivo nuevo por PARTICIÓN (2026-10-17, tanda Q).** Este bloque vivía en
> `docs/mapa/diastolica.md`, que estaba en **35,2 KB** —ya cruzado el techo de 35 KB desde el
> 2026-10-12— y que esta tanda tenía que tocar para dejarle el puntero de su tarjeta ⓘ. Se sacó
> la sección entera, **sin reescribir una línea**: el corte es por ZONA (el ritmo), que es la
> única forma de partir sin reescribir — y una partición que reescribe deja de ser una partición.
> El mapa de origen volvió a **≈30 KB**.

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

- ⚠️ **EL S/D VENOSO PULMONAR CAMBIA DE CORTE SEGÚN EL RITMO, Y VOTA EN LOS DOS.** En sinusal el
  corte es ≤0,67 y en FA **< 1**: es el mismo campo con dos cortes, leídos por `venpSdEstado` con
  `'le067'` y con `'lt1'`. Hasta el 2026-10-12 el de sinusal estaba declarado **no evaluable**,
  porque el `<select>` sólo ofrecía «<1 / >1»; desde que tiene las tres opciones, el tramo del
  medio es lo que separa un corte del otro.
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
