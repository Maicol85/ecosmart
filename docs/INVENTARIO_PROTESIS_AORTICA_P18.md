# Inventario de la PRÓTESIS AÓRTICA — tanda PANT-18, commit 1 (2026-11-06)

> **Documento de SOLO LECTURA.** El commit 1 no cambia una línea de la aplicación:
> `index.html` tiene el mismo md5 **`37c39207`** antes y después.
> Todo lo que está acá se midió en Chrome con el **gesto real** o se leyó **en imagen** del PDF.
> La sonda es `scripts/_probe_pant18inv.mjs`.

---

## 1a · LA PANTALLA

### Los campos del cuadro «Estenosis Aórtica — Datos del Doppler» (pestaña Válvulas)

| id | rótulo | unidad | de dónde sale | notas |
|---|---|---|---|---|
| `vmax_ao` | Vmax | m/s | tipeado en Válvulas, con respaldo del Doppler aórtico | vota el eje dependiente del flujo |
| `gmedio_ao` | G. medio | mmHg | tipeado | vota el eje dependiente del flujo |
| `ea_dtsvi` | Ø TSVI | mm | tipeado | insumo de la continuidad |
| `ea_vtitsvi` | VTI TSVI | cm | tipeado | insumo de la continuidad y del DVI |
| `ea_vtiao` | VTI Ao | cm | tipeado | insumo de la continuidad y del DVI |
| `ava_plan` | AVA por planimetría | cm² | **espejo** de `ava_plan_dop` del Doppler aórtico | el espejo va primero y `avaPlanPintar` después |
| `va_at` | **AT (ms)** — tiempo de aceleración, sólo prótesis | ms | tipeado | `oninput="eaAtPintar()"`; banda de plausibilidad `va_at:[10,300]` |

**El campo AT, en detalle.** Vive en `tab-valvulas`, dentro del bloque `#bloque-prot-va`, que
`valvProtSync()` muestra y esconde según la morfología. Se guarda como cualquier campo del
estudio —`va_at` lleva guión BAJO y `_noEsDelEstudio` no lo excluye—, **tiene columna de Excel**
(«AT aórtico (ms)»), lo borra «Nuevo estudio» y entra al informe a través de `eaProtNarrativa`,
que lo publica como `AT 101 ms` dentro del paréntesis de medidas.

### ⚠️ SÍ EXISTE UN CAMPO DE TIEMPO DE EYECCIÓN REUTILIZABLE, y está en el Doppler

| | |
|---|---|
| **id** | `tango_te` |
| **rótulo** | «T. eyectivo (ms)» |
| **pestaña** | **`tab-doppler`** (Doppler aórtico, columna «tiempos y el índice sin TSVI») |
| **tipo** | `input type="number"`, `oninput="calcTango()"` |
| **¿campo guardado?** | **SÍ** — medido: aparece en el censo con su valor |
| **¿columna de Excel?** | **NO** — medido sobre las 441 columnas de `_labExcelRow` |
| **banda de plausibilidad** | `tango_te: [80, 600]` ms |
| **«Nuevo estudio» lo borra** | **SÍ** — medido: pasa de `300` a cadena vacía |

**Y la aplicación YA LO USA para el AT/ET.** `eaProtVeredicto` hace, textual:

```
const at = n('va_at'),  et = n('tango_te');
const atet = (at != null && et != null && et > 0) ? (at / et) : null;
```

El cociente ya se categoriza en tres niveles con `EA_PROT_CRIT.atet_normal_max` (0,32) y
`EA_PROT_CRIT.atet_signif_min` (0,37), ya entra al paréntesis de medidas del informe como
`AT/TE 0.32`, y ya tiene su salvedad en la tarjeta. **Lo único que falta es su fila en el
cuadro de resultados.**

Hay otros dos campos de tiempo de eyección en la aplicación y **ninguno de los dos sirve acá**:

- `cx_tei_vi_te` («TE VI — tiempo eyección (ms)»), en **`tab-calculadoras`**, dentro del índice
  de Tei. Es campo guardado y no tiene columna de Excel, pero no está «en Doppler o en
  Válvulas», que es donde la orden acota la búsqueda, y su único lector es `cxTei()`.
- `cx_tei_vd_te`, el mismo caso del ventrículo derecho.

### El cuadro de resultados

Las filas son `div.calc-row` con `span.calc-val` por id y, donde hay grado, un `span.calc-grado`
**hermano y sin id** —la convención de la casa desde la tanda F—.

| fila | id del valor | quién la calcula |
|---|---|---|
| Vmax | `ea-det-vmax` | `calcEADetalle` |
| G. máximo (4×Vmax²) | `ea-det-gmax` | `calcEADetalle` |
| G. medio | `ea-det-gmedio` | `calcEADetalle` |
| AVA continuidad | `ea-det-ava` | `calcEADetalle` |
| AVA indexada | `ea-det-avai` | `calcEADetalle` |
| AVA por planimetría | `ea-det-plan` | `calcEADetalle` |
| DVI | `ea-det-dvi` | `calcEADetalle` |
| **AT — tiempo de aceleración** | `ea-det-at` (fila `ea-det-at-row`, nota `ea-det-at-nota`) | **`eaAtPintar()`** |
| **AT/ET** | **NO EXISTE** | — |
| PPM — AEO indexada | `ea-prot-ppm` (fila `ea-prot-ppm-row`) | `eaProtPpmSync` |
| Severidad | `ea-det-sev` (rótulo `ea-det-sev-lbl`, nota `ea-det-sev-nota`) | `_eaProtPintar` |

**La línea del AT y su rótulo.** `eaAtPintar()` esconde la fila con válvula nativa, y con
prótesis publica una pastilla de color. **Ya tiene los TRES tramos**, medidos con el gesto real:

| AT tipeado | lo que publica hoy |
|---|---|
| 60 | `60 ms — normal (< 80 ms)` · verde |
| 80 | `80 ms — posible estenosis (80–100 ms)` · amarillo |
| 90 | `90 ms — posible estenosis (80–100 ms)` · amarillo |
| 100 | `100 ms — posible estenosis (80–100 ms)` · amarillo |
| 101 | `101 ms — sugiere estenosis significativa (> 100 ms)` · rojo |
| 130 | `130 ms — sugiere estenosis significativa (> 100 ms)` · rojo |

Los operadores son estrictos en los dos bordes: el 80 y el 100 caen los dos en «posible», que
es como la Tabla 5 imprime `<80 / 80-100 / >100`.

### La tarjeta de severidad protésica

- **Quién decide:** `eaProtVeredicto()` → `{ via, nivel, niveles, falta, … }`.
  - `via` es `'TAVI'` o `'SAVR'`.
  - En SAVR, `nivel` sale de la regla de integración de la nota general de la Tabla 5: el peor
    nivel de los ejes **dependientes del flujo** (`vmax`, `gmed`) y el peor de los
    **independientes** (`dvi`; la EOA no es evaluable). `signif` sólo con los dos en `signif`;
    `normal` sólo con los dos en `normal`; si falta un eje entero, `faltan`.
  - **El AT y el AT/ET NO votan**, y es deliberado: sus filas no llevan las marcas `†` ni `§`.
- **Qué emite a la pantalla:** `_eaProtPintar` escribe el veredicto en `ea-det-sev` con su color
  (`normal` `#3ecf8e`, `posible` `#f59e0b`, `signif` `var(--red)`, `faltan` `var(--text2)`,
  TAVI `#f59e0b`), fija el rótulo `⚖️ Severidad EA protésica (ASE 2024)` y vuelca las
  **salvedades** en `ea-det-sev-nota`, unidas por `<br>`.
- **Qué emite al papel:** `eaProtNarrativa(P)` devuelve `{frase, resumen, salvedades, guia}`.
  El informe usa `frase`, el EN SUMA usa `resumen`, la cápsula usa `salvedades`. El campo
  `guia` **no lo lee nadie** (código muerto declarado).

**Los resultados posibles de la tarjeta** (`EA_PROT_TXT`), y lo que cada uno pone en el papel:

| resultado | texto de la tarjeta | `frase` del informe | `resumen` del EN SUMA |
|---|---|---|---|
| `normal` | Sin criterios de estenosis protésica | sin criterios de estenosis protésica | sin criterios de estenosis protésica |
| `posible` | Posible estenosis protésica | con posible estenosis protésica | posible estenosis protésica |
| `signif` | Sugiere estenosis protésica significativa | con criterios que sugieren estenosis protésica significativa | criterios que sugieren estenosis protésica significativa |
| `faltan` | Falta un dato para aplicar la tabla | sin datos suficientes para graduar la estenosis protésica | **`null`** |
| TAVI | **TAVI — sin graduar** | sin graduación de estenosis protésica | **`null`** |

### El botón «Severidad» de la estenosis aórtica

- **id:** `sevbtn-esten-aortica`; lo pinta el módulo `valvSev` (IIFE), que deriva el id desde
  `sevbtn-<tipo>-<valv>`.
- **De qué depende hoy:** del **valor guardado `ea_grado`**, el `<select>` oculto de grados
  (`sin` / `esclerosis` / `leve` / `moderada` / `severa`).
- **Por qué quedó amarillo con una prótesis, medido:** con morfología protésica
  `clasificarEA_Vmax` y `sugerirSeveridadEA` **se abstienen a propósito** —es el arreglo de la
  Fase 2, para que el informe no describa una prótesis con cortes nativos—, así que `ea_grado`
  se queda en **`sin`**. El botón pinta el estado neutro de «sin grado», que es el amarillo
  `🟡 Severidad ▼`.

### Cómo se trata hoy TAVI

`eaProtVeredicto` devuelve temprano `{ via:'TAVI', sinGraduar:true, … }` **sin** calcular
`nivel`: publica los ejes del bloque absoluto y el PPM, y no emite veredicto de estenosis.
La decisión está fechada (2026-09-27) y su motivo escrito: el criterio específico de TAVI de la
Tabla 5 es un cambio respecto de un basal y la aplicación no elige ese basal.

---

## 1b · CENSO DE TEXTOS sobre el AT, el AT/ET, la «Figura 13», los «100 ms»

Cadenas **visibles** (lo que el médico lee). Las demás apariciones del archivo son comentarios
de código, que en esta casa van sin tilde y sin pulir a propósito.

| # | ubicación | texto exacto |
|---|---|---|
| 1 | `index.html` · rótulo del campo, Válvulas | `AT (ms) — tiempo de aceleración, sólo prótesis` |
| 2 | `index.html` · rótulo de la fila del cuadro | `AT — tiempo de aceleración` |
| 3 | `eaAtPintar` · pastilla verde | `N ms — normal (< 80 ms)` |
| 4 | `eaAtPintar` · pastilla amarilla | `N ms — posible estenosis (80–100 ms)` |
| 5 | `eaAtPintar` · pastilla roja | `N ms — sugiere estenosis significativa (> 100 ms)` |
| 6 | `eaAtPintar` · pastilla gris | `N ms — fuera de rango medible, no se clasifica` |
| 7 | **`eaAtPintar` · la nota `ea-det-at-nota`** | **«El AT solo NO establece estenosis protésica: la guía exige además un parámetro dependiente del flujo (velocidad o gradiente medio) y uno independiente (AEO o DVI). Se afecta por la función ventricular izquierda y por la frecuencia cardíaca. Corte de la Tabla 5 — el algoritmo de la Figura 13 de la misma guía usa 100 ms como único punto de corte, así que la banda 80–100 ms no es sospechosa por ese camino.»** |
| 8 | `_eaProtSalvTiempos` · salvedad del AT | «El tiempo de aceleración es de N ms, fuera del rango normal de la Tabla 5 (< 80 ms), y por sí solo NO establece estenosis: su fila no lleva ninguna de las dos marcas que la nota general exige. Puede además estar afectado por la función del VI y la frecuencia cardíaca.» |
| 9 | `_eaProtSalvTiempos` · salvedad del AT/ET | «El cociente AT/tiempo eyectivo es de N, fuera del rango normal (< 0,32), y tampoco vota por sí solo.» |
| 10 | `eaProtNarrativa` · paréntesis de medidas | `AT N ms` y `AT/TE N` |
| 11 | módulo TAVI del ETE (otra sección) | `AT (ms) — tiempo de aceleración` (`ete_tavi_at`) |

**La frase «único punto de corte» aparece UNA sola vez en todo el archivo**, en la entrada 7.
**«Figura 13» aparece una sola vez en texto visible**, también en la entrada 7: las otras
apariciones son de las Figuras 13 de **otras guías** (ASE/EACVI 2015 y el consenso de válvula
aórtica bicúspide) y **no se tocan**.

---

## 1c · LA GUÍA, LEÍDA EN IMAGEN

**ASE 2024 — Zoghbi W y col., *J Am Soc Echocardiogr* 2024;37:2-63.**
Archivo `Zoghbi_2024_Protesis.pdf`, 62 hojas. **Regla de folio = hoja + 1, comprobada en el pie
impreso:** la hoja 18 remata «Zoghbi et al **19**» y la hoja 19 «**20** Zoghbi et al».
Renderizado a 300 ppp.

### Tabla 5 — hoja 18, folio 19

«Doppler parameters of prosthetic valves in the aortic valve position»

**Bloque «Appropriate for all prosthetic aortic valves»**

| parámetro | Normal | Possible stenosis | Suggests significant stenosis |
|---|---|---|---|
| Jet velocity contour\* | Triangular, early peaking | Triangular to intermediate | Rounded, symmetric |
| Acceleration time, msec\* | `<80` | `80-100` | `>100` |
| Acceleration time/LV ejection time ratio | `<0.32` | `0.32-0.37` | `>0.37` |
| Peak velocity, m/sec `†‡` | `<3` | `3-4` | `≥4` |

**Bloque «Specific AVR considerations» → SAVR**

| parámetro | Normal | Possible stenosis | Suggests significant stenosis |
|---|---|---|---|
| Mean gradient, mm Hg `†` | `<20` | `20-34` | `≥35` |
| DVI `§¶` | `>0.35` | `0.25-0.35` | `<0.25` |
| EOA `§` | Reference EOA ± 1 SD | 1 SD smaller than reference EOA | 2 SDs smaller than reference EOA |

**Bloque «TAVI (change from baseline)»**

| parámetro | Normal | Possible stenosis | Suggests significant stenosis |
|---|---|---|---|
| Mean gradient `†` | Change `<10` mm Hg from baseline | Increase of `10-19` mm Hg from baseline | Increase `≥20` mm Hg from baseline |
| DVI `§¶` | Change `<0.1` or 20% from baseline | Decrease `0.1-0.19` or 20%-39% from baseline | Decrease `≥0.2` or `≥40%` from baseline |
| EOA `§` | Change `<0.3` cm² or 25% from baseline | Decrease of `0.3-0.59` cm² or 25%-49% from baseline | Decrease `≥0.6` cm² or `≥50%` from baseline |

**Notas al pie, textuales**

- «Significant stenosis should meet at least one flow-dependent (i.e., velocity and mean
  gradient) and one flow-independent (i.e., EOA or DVI) parameter.»
- `*` «This can be affected by LV function and heart rate.»
- `†` «Flow dependent.»
- `‡` «Valid with normal stroke volume (50-90 mL) and flow rates (200-300 mL).»
- `§` «Flow independent.»
- `¶` «DVI calculated using VTI as in Table 4.»
- `‖` «Baseline defined as TTE performed under stable hemodynamic conditions.»

**⚠️ EL ASTERISCO NO ALCANZA A LA FILA DEL AT/ET.** Verificado en la imagen y en la capa de
texto: el `*` está sobre «Jet velocity contour» y sobre «Acceleration time, msec», y la fila
«Acceleration time/LV ejection time ratio» **no lo lleva**. Ver **P18-a**.

**⚠️ LA TABLA NO DA NINGÚN CORTE ABSOLUTO PROPIO DE TAVI.** Sus tres filas de TAVI son las tres
de cambio respecto del basal, y el contorno del chorro, el AT, el AT/ET y la velocidad pico
figuran bajo «apropiado para todas las prótesis aórticas». No hay en la tabla una frase que diga
si los cortes absolutos del reemplazo quirúrgico valen o no para TAVI.

### Figura 13 — hoja 18, folio 19

Pie: «Algorithm for initial evaluation of elevated peak prosthetic aortic jet velocity
incorporating DVI, jet contour, and measures of acceleration time (AT) and the ratio of AT to
ejection time (ET). Improper PW Doppler sample volume influences both DVI and EOA calculations:
too close to the valve will increase DVI and EOA, while too far (apical) will decrease them.»

- Entrada: **«Prosthetic Aortic Jet Velocity > 3 m/s»**
- **Jet Contour** → **Early Peak**: `AT < 100 ms`, `AT/ET < 0.37` · **Late Peak**: `AT > 100 ms`,
  `AT/ET > 0.37`
- **DVI** → `≥ 0.30` · `0.29 - 0.25` · `< 0.25`
- Desenlaces: **Normal AVR** `§` · **Possible Stenosis** `*§` · **Stenosis** `*§`
- Caja de **Normal AVR**: «Indexed EOA (cm²/m²): `>0.85`: High flow state; `<0.85`:
  **Patient-prosthesis mismatch**»
- `*` «Valve stenosis is further substantiated by EOA compared to respective reference values of
  similar valve type and size.»

**O sea que la Figura 13 usa el AT y el AT/ET juntos, y los usa para describir el CONTORNO del
chorro** — no como un corte binario que reemplace a la Tabla 5. Y **ubica el desajuste
protésico-paciente en la rama de DVI normal**, es decir en una prótesis que no obstruye.

### Tabla 7 — hoja 19, folio 20

Ya implementada y verificada por la tanda Z; esta tanda **no la toca**. Fila «Aortic EOA»:
IMC `<30` → normal `>0.85` · moderado `0.85-0.66` · severo `≤0.65` cm²/m²; IMC `≥30` → normal
`>0.70` · moderado `0.70-0.56` · severo `≤0.55` cm²/m².

---

## 1d · LAS PREMISAS DEL MÉDICO, reproducidas con el gesto real

Escena: Morfología VA = prótesis mecánica · Vmax 5 · Ø TSVI 21 · VTI TSVI 10 · VTI Ao 45 ·
AT 101 · peso 70 · talla 170 · la pastilla de estenosis aórtica **abierta**.

| # | premisa | ¿se reproduce? | lo medido |
|---|---|---|---|
| 1 | falta el tiempo de eyección y el AT/ET | **SÍ, a medias** | el **campo** existe (`tango_te`, en Doppler) y el **cálculo** existe; lo que falta es **la fila `AT/ET` en el cuadro**: `NO EXISTE LA FILA` |
| 2 | la nota del AT afirma lo de la Figura 13 | **SÍ** | texto exacto en la entrada 7 del censo |
| 3 | el texto de la tarjeta es demasiado largo | **SÍ** | **772 caracteres en 4 párrafos** con prótesis mecánica; **841 en 3** con TAVI |
| 4 | con TAVI dice «TAVI — sin graduar» | **SÍ** | `ea-det-sev` = `TAVI — sin graduar` |
| 5 | el botón «Severidad» quedó amarillo | **SÍ** | `🟡 Severidad ▼`, fondo `rgb(254, 243, 199)`, clases `valv-sev-btn` (sin `nivel3`), `ea_grado = sin`, con la tarjeta diciendo «Sugiere estenosis protésica significativa» |
| 6 | el informe escribe además «desajuste» | **SÍ** | en los **tres** estilos |
| — | **control negativo: válvula nativa** | — | `Severa — por velocidad`, botón `Severa ▼` con fondo `rgb(254, 226, 226)` y clase `nivel3`, `ea_grado = severa`, **cero** «desajuste» y **cero** «PPM» |

**El texto del papel, hoy, en la escena del médico** (largos: estándar 625, narrativo 728,
conciso 508 caracteres):

- informe, estándar → «Válvula aórtica con prótesis mecánica, con criterios que sugieren
  estenosis protésica significativa (Vmax 5 m/s, DVI 0.22, AT 101 ms)» **y**
  «Desajuste protésico-paciente aórtico severo (AEO indexada 0.42 cm²/m²)»
- EN SUMA → «PPM aórtico severo.»
- con **TAVI**, los mismos datos → «sin graduación de estenosis protésica (…)» **y** la misma
  línea del desajuste, y el EN SUMA sólo «PPM aórtico severo.»

**⚠️ Y UNA PREMISA DE LA ORDEN QUE NO SE REPRODUCE: el AT ya tiene sus tres tramos.** La orden
dice «hoy solo existe el rojo»; medido con el gesto real sobre los seis valores de la tabla de
1a, los tres tramos están desde la Fase 2, con sus tres colores. El commit 3a no tiene nada que
cambiar.

**⚠️ Trampa de medición pagada en esta tanda, para que no se repita.** `informe_texto` y
`en_suma` son **`<textarea>`**: leerlos con `textContent` devuelve **cadena vacía**, y entonces
«el informe no escribe el desajuste» se lee igual que «el informe está vacío». La primera
corrida de la sonda informó `0` en las tres superficies con el informe de 0 caracteres. El
lector correcto es `e.value || e.textContent`. Y la **pastilla de la lesión tiene que estar
abierta** (`esqPills.setLevel('aortica','esten',4)`) o el informe no describe la aórtica.
