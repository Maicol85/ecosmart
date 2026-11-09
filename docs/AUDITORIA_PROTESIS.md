# Auditoría de solo lectura de la lógica de las prótesis valvulares — tanda AUD-PROT (2026-11-09)

> **Esta tanda NO cambia la aplicación.** `index.html` queda idéntico byte por byte: md5
> **`f2587ad83be4d12f8a59fa9a0bb27a23`** al abrir y al cerrar cada commit, sobre el árbol sellado
> **`v20261108-0123`** que dejó PANT-25 (`116ac5e`). Lo único que se escribe son documentos y
> sondas nuevas.
>
> **Las afirmaciones de la orden que la abrió se tratan como hipótesis**, no como premisas: cada
> una se mide o se declara no reproducible. Lo que la medición desmintió está al final de cada
> sección y en `docs/PENDIENTES.md` → **PRO-a**.

**Las sondas de esta tanda:** `scripts/_probe_audprot_inv.mjs` (el inventario del commit 1) y
`scripts/_probe_audprot_escenas.mjs` (la batería del commit 2). Las dos son de solo lectura:
abren `file://index.html` en Chrome por Playwright, miden y no escriben nada en el proyecto.

---

# 1 · La lógica por válvula, y el catálogo de modelos

## 1.0 · Qué cuenta como prótesis, y en qué válvulas

| | |
|---|---|
| dueño único de «¿este token es una prótesis?» | `valvEsProtesis(val)` sobre **`VALV_PROT_OPCIONES`** |
| la lista, literal | `['Prótesis biológica', 'Prótesis mecánica', 'TAVI']` |
| dueño de «¿esta prótesis se abstiene de graduar?» | `protNoGradua(morfId)` sobre `PROT_SIN_GRADO_VALVS` = `['vm_morf','vt_morf','vp_morf']` |

**Opciones reales de cada selector de morfología, leídas del DOM:**

| selector | opciones que activan la lógica protésica | opciones totales |
|---|---|---|
| `va_morf` | **tres**: `Prótesis biológica`, `Prótesis mecánica`, **`TAVI`** | 9 |
| `vm_morf` | **dos**: `Prótesis biológica`, `Prótesis mecánica` | 11 |
| `vt_morf` | **dos**: `Prótesis biológica`, `Prótesis mecánica` | 10 |
| `vp_morf` | **dos**: `Prótesis biológica`, `Prótesis mecánica` | 7 |
| `vp_tipo_prot` | `''` · `bio` · `homo` · **`perc`** | 4 |

⚠️ **NO EXISTE NINGUNA OTRA POSICIÓN PROTÉSICA.** Censadas las cuatro válvulas: ninguna ofrece
implante transcatéter fuera de la aórtica. `Plastia mitral`, `TEER mitral`, `Plastia tricuspídea`
y `TEER tricuspídeo (T-TEER)` **no** están en `VALV_PROT_OPCIONES`, así que no entran por ningún
camino protésico. El `perc` de la pulmonar **no es una morfología**: es el tipo dentro de una
morfología protésica, y es uno de los tres estados que **no gradúan**.

⚠️ **(A) Y (A2) DE LA ORDEN SON LA MISMA COSA EN ESTA APLICACIÓN, Y ESTÁ MEDIDO.** La lógica de
estenosis de la prótesis aórtica **no distingue biológica de mecánica**: `eaProtVeredicto` sólo
pregunta `esTavi = (morf === 'TAVI')`, y `EA_PROT_CRIT` tiene un bloque general y un bloque
`savr_*`, sin ramas por tejido. Lo mismo del lado **mitral**: `VM_PROT_T11` no abre ramas por
tipo —el comentario del código lo declara leyendo la Sección III.B—. Las que **sí** abren ramas
por tipo son la **tricúspide** (`bio` / `mec`) y la **pulmonar** (`bio` / `homo`).

---

## 1.1 · (A) y (A2) PRÓTESIS AÓRTICA QUIRÚRGICA — biológica y mecánica

### Dónde vive

| pieza | quién |
|---|---|
| el veredicto | **`eaProtVeredicto()`** (línea 74161) → objeto de datos, nunca HTML |
| un parámetro, tres niveles | `_eaProtNivel(val, normalMax, signifMin, mayorEsPeor, signifEstricto)` (74090) |
| el área efectiva frente al modelo | `eaProtEOAz()` (74142) |
| el PPM | `_eaPpmAoClasificar(avai, imc)` (74028) · frases en `ppmFrases` (72758) |
| el narrativo del papel | `eaProtNarrativa(P)` (74403) |
| la tarjeta de pantalla | `_eaProtPintar(P)` (74565) · `_eaProtPorque(P)` (74515) · `_eaProtAvisos(P)` (74538) |
| la fila del AT y del AT/ET | `eaAtPintar` · `eaAtEtPintar` · `_eaAtEtVal()` |
| el botón «Severidad» | `valvSev.refrescar`, rama protésica, **sin escribir `ea_grado`** |
| ids del cuadro | `ea-det-gmedio` · `ea-det-dvi` · `ea-det-atet` · `ea-det-at-nota` · `bloque-prot-va` |

### Los parámetros, y de qué lado los pone la app

| parámetro | campo | la app lo trata como | ¿vota? |
|---|---|---|---|
| velocidad pico | `vmax_ao` | **dependiente del flujo** (`dep`) | **sí** |
| gradiente medio | `gmedio_ao` | **dependiente del flujo** (`dep`) | **sí** |
| DVI | `dvi-val`, con respaldo `ea_dvi_display` | **independiente del flujo** (`indep`) | **sí** |
| área efectiva frente a la del modelo | `ava_cont` contra el catálogo | **independiente del flujo** (`indep`) | **sí, sólo si hay modelo** |
| tiempo de aceleración (AT) | `va_at` | **ninguna de las dos** | **no** |
| AT / tiempo de eyección | `va_at` / `tango_te`, por `_eaAtEtVal()` | **ninguna de las dos** | **no** |
| volumen sistólico | `vs_calc` | ninguna: sólo una salvedad de rango | **no** |
| AEO indexada (PPM) | `ava-idx` | **otra pregunta**, no la estenosis | **no** |

### Los cortes literales, como están en el código

```
EA_PROT_CRIT = {
  vmax_normal_max: 3,        vmax_signif_min: 4,       // m/s   · normal < 3 · posible 3 a < 4 · significativa >= 4
  atet_normal_max: 0.32,     atet_signif_min: 0.37,    // --    · normal < 0,32 · posible · significativa > 0,37  (ESTRICTO)
  savr_gmed_normal_max: 20,  savr_gmed_signif_min: 35, // mmHg  · normal < 20 · posible 20 a < 35 · significativa >= 35
  savr_dvi_normal_min: 0.35, savr_dvi_signif_max: 0.25 // --    · normal > 0,35 · posible · significativa < 0,25
}
AT_PROT_NORMAL_MAX = 80 · AT_PROT_POSIBLE_MAX = 100     // ms   · normal < 80 · posible 80 a 100 · significativa > 100 (ESTRICTO)
EA_PROT_EOA_Z = { normalMin: -1, signifMax: -2 }         // DE   · significativa z <= -2 · posible z < -1 · normal el resto
EA_PROT_PPM_CORTES = { imcBajo: {normalMin: 0.85, severoMax: 0.65},
                       imcAlto: {normalMin: 0.70, severoMax: 0.55} }   // cm2/m2; normalMin EXCLUSIVO, severoMax INCLUSIVO
EA_PROT_VS_MIN = 50 · EA_PROT_VS_MAX = 90                // mL, sólo salvedad
```

### La regla de combinación, literal

```js
const dep   = [nv.vmax, nv.gmed].filter(Boolean);
const indep = [nv.dvi,  nv.eoa ].filter(Boolean);
const pDep = peor(dep), pIndep = peor(indep);          // peor() = signif > posible > normal
if (!dep.length)   falta.push('un parámetro dependiente del flujo (velocidad pico o gradiente medio)');
if (!indep.length) falta.push(<el DVI, o el DVI o el área efectiva si hay modelo>);
if (falta.length)                                   nivel = 'faltan';
else if (pDep === 'signif' && pIndep === 'signif')  nivel = 'signif';
else if (pDep === 'normal' && pIndep === 'normal')  nivel = 'normal';
else                                                nivel = 'posible';
```

O sea: **uno dependiente Y uno independiente**, y **falla cerrado** — sin la mitad independiente
no se concluye, por alto que esté el gradiente.

### Qué estado produce con cada combinación

| dependiente medido | independiente medido | `nivel` | texto del papel |
|---|---|---|---|
| ninguno | ninguno | `faltan` | «sin datos suficientes para graduar la estenosis protésica» + paréntesis de medidas |
| alguno | **ninguno** | `faltan` | **la misma frase**, con los dos valores entre paréntesis — **es el caso que el médico reportó** |
| ninguno | alguno | `faltan` | la misma frase |
| los dos normales | normal | `normal` | «sin criterios de estenosis protésica» |
| los dos en significativa | significativa | `signif` | «con criterios que sugieren estenosis protésica significativa» |
| cualquier otra mezcla | — | `posible` | «con posible estenosis protésica» |

### Con qué palabras lo escribe cada superficie

| superficie | texto |
|---|---|
| **pantalla**, veredicto | `EA_PROT_TXT`: `normal` «Sin criterios de estenosis protésica» · `posible` «Posible estenosis protésica» · `signif` «Sugiere estenosis protésica significativa» · `faltan` **«Falta un dato para aplicar la tabla»** |
| **pantalla**, el porqué | `_eaProtPorque`: con `faltan`, «Falta » + lo que falta + «.» |
| **pantalla**, «Ver detalle» | las `salvedades` de `eaProtNarrativa`: `EA_PROT_SALV.eoa`, `.tavi`, `.signif`, `.posible`, la del área frente al modelo, la del volumen sistólico y las dos de `_eaProtSalvTiempos` |
| **informe**, tres estilos | conciso `VAo <morf>, <frase>.` · estándar `Válvula aórtica <morf>, <frase>.` · narrativo `La válvula aórtica <presenta…>, <frase>.` |
| **EN SUMA** | `Prótesis aórtica: <resumen>.` — y con `faltan` **`resumen` es `null`: el EN SUMA no dice nada** |
| **PDF** | la misma `inf` del informe; en la tabla de mediciones, `_protPdf('va_morf','va_at',' ms',0)` |
| **PPT** | lo que el informe emite |
| **Guardados** | el informe guardado; ningún texto propio |
| **Laboratorio / Excel** | **cuatro** columnas de modelo (`va_prot_modelo`, `va_prot_tam`, `va_prot_gmref`, `va_prot_eoaref`) y **una** de veredicto: «Desajuste prótesis-paciente aórtico (AEO indexada; ASE 2024, Tabla 7)». **Ninguna columna publica el veredicto de estenosis protésica.** |
| **Evidencia** | sección «Prótesis aórtica», 12 preguntas, con su bloque de causas del gradiente alto (hiperflujo y desajuste se marcan solos) |

### Desajuste, regurgitación y modelo

- **Desajuste (PPM):** se calcula siempre que `ava-idx` traiga un número sin la marca `(revisar)`.
  La frase del papel sale de `ppmFrases('aortica', …)`: cuerpo «Desajuste protésico-paciente
  aórtico <grado> (AEO indexada <x> cm²/m²).», EN SUMA «PPM aórtico <grado>.». **Sale sólo con
  `moderado` o `severo`, y NO sale cuando el veredicto es `signif`** (PANT-18, Figura 13).
  **No toca el veredicto de estenosis**: es otra pregunta y otra línea.
- **Regurgitación:** la mitad de insuficiencia sale de la **cascada nativa**, a propósito (ASE
  2024, folio 20). No modifica el veredicto de estenosis. Tiene **tres** fuentes: `ia_grado`, el
  escalón sin grado, y `eteTaviRPV()` del módulo TAVI.
- **Modelo cargado:** habilita `eaProtEOAz()`, que suma el área efectiva como **segundo** eje
  independiente, **junto** al DVI y no en su lugar. Cuatro condiciones: prótesis **quirúrgica**,
  modelo **y** tamaño del catálogo, desvío del área **mayor que cero**, y `ava_cont` sin la marca
  `(revisar)`.

---

## 1.2 · (B) PRÓTESIS AÓRTICA TRANSCATÉTER — TAVI

**Comparte el motor entero con la quirúrgica.** `eaProtVeredicto` ya no sale temprano (PANT-18):
`via` dice `'TAVI'`, pero la cascada, los cortes y la regla de combinación son **los mismos**.

Las **cuatro** diferencias medidas, y nada más:

1. **`EA_PROT_SALV.tavi` se agrega** a las salvedades de pantalla: dice que para TAVI la Tabla 5
   expresa gradiente medio, DVI y área efectiva como cambio respecto de un basal, y que sin ese
   estudio se aplican los cortes absolutos de la quirúrgica.
2. **`eaProtEOAz()` devuelve `null`**: su primera condición exige `Prótesis mecánica` o
   `Prótesis biológica`. O sea que **con TAVI el área efectiva nunca es un eje independiente**,
   aunque haya modelo del catálogo cargado y `PROT_CAT_TAVI` traiga el desvío.
3. **La rama «normofuncionante»** (`EA_PROT_NORMO`), que sólo existe para TAVI.
4. **El bloque de «normofuncionante» del final del EN SUMA la excluye** con una guarda
   `P.via === 'TAVI'` (declarada en **P18-d**).

### La rama «normofuncionante», medida

```js
// en eaProtNarrativa:
_normoTavi = P.via === 'TAVI' && P.nivel === 'faltan' &&
             Object.keys(P.niveles).every(k => P.niveles[k] == null || P.niveles[k] === 'normal');
// en el bloque del informe:
_normoRpvOk = !(eteTaviRPV() && !eteTaviRPV().nula);
_normoT     = _eaProtN.normoTavi && !insE && _normoRpvOk;
```

- cuerpo: `La válvula aórtica presenta una prótesis transcatéter tipo TAVI normofuncionante.`
  (con el paréntesis de medidas pegado cuando hay algún número).
- EN SUMA: **`TAVI normofuncionante.`** (`EA_PROT_NORMO.suma`).

⚠️ **`P.niveles` NO CONTIENE EL PPM.** Las claves son `vmax`, `atet`, `at`, `gmed`, `dvi`, `eoa`.
El desajuste viaja en `P.ppm`, fuera del objeto que la guarda recorre. **Las consecuencias de eso
están en el commit 3, apartado (iii).**

---

## 1.3 · (C) PRÓTESIS MITRAL — biológica y mecánica

| pieza | quién |
|---|---|
| el veredicto | **`vmProtEOA(src)`** (72405), fuente **inyectable** para el Excel |
| un parámetro, tres niveles | `_vmProtNivelT11(x, normalMax, signifMin, normalIncl, signifIncl)` (72382) |
| los criterios positivos nombrados | `vmProtObstrCrit(R)` (72366) |
| el PPM | `_vmPpmClasificar(eoai, imc)` (72709) |
| la pintura | `vmProtEOAPintar()` (72769) · ids `vm-prot-vmax` · `-gmed` · `-thp` · `-eoa` · `-dvi` · `-obstr` |
| contenedores | `bloque-prot-vm` (el DVI) y `bloque-prot-vm-res` (las filas de la Tabla 11) |

### Parámetros y cortes literales

| parámetro | campo | lado | vota | normal | posible | significativa |
|---|---|---|---|---|---|---|
| velocidad pico de E | `em_vmax` | — (la app no lo clasifica por flujo) | **NO** | `< 1,9` m/s | 1,9 a < 2,5 | `>= 2,5` |
| gradiente medio | `em_gmedio` | — | **sí** | `<= 5` mmHg | > 5 a 10 | `> 10` |
| THP | `thp` | — | **sí** | `< 130` ms | 130 a 200 | `> 200` |
| AEO por continuidad | derivada | — | **sí** | `>= 2,0` cm² | 1 a < 2 | `< 1,0` |
| DVI | `vm_dvi` o calculado | — | **sí** | `< 2,2` | 2,2 a 2,5 | `> 2,5` |

```
VM_PROT_T11 = { vmaxNormalMax: 1.9, vmaxSignifMin: 2.5,   // velocidad: normal con <, significativa con >=
                gmedNormalMax: 5,   gmedSignifMin: 10,    // gradiente: normal con <=, significativa con >
                thpNormalMax: 130,  thpSignifMin: 200 }   // THP:      normal con <, significativa con >
VM_PROT_EOA_NORMAL_MIN = 2.0 · VM_PROT_EOA_OBSTR_MAX = 1.0        // cm2
VM_PROT_DVI_NORMAL_MAX = 2.2 · VM_PROT_DVI_SIGNIF_MIN = 2.5
VM_PROT_PPM_CORTES = { imcBajo: {normalMin: 1.2, severoMax: 0.90},
                       imcAlto: {normalMin: 1.0, severoMax: 0.75} }  // VM_PROT_IMC_OBESIDAD = 30
VM_PROT_OBSTR_MIN = 2  ·  VM_PROT_OBSTR_VOTAN = [eoa, dvi, gmed, thp]
```

⚠️ **LA APP NO USA LA DISTINCIÓN DEPENDIENTE / INDEPENDIENTE DEL FLUJO EN LA MITRAL.** Censado
`vmProtEOA` entero: no existen las listas `dep` ni `indep`, ni ninguna marca equivalente. La regla
es **de conteo**: `VM_PROT_OBSTR_MIN = 2` positivos entre los **cuatro** que votan, y el código lo
declara **criterio EcoSmart**, no de la guía.

### Estados y texto

| situación | `R.obstr` | pantalla (`vm-prot-obstr`) | papel |
|---|---|---|---|
| dos o más positivos | `'significativa'` | «sugiere obstrucción significativa» | `Prótesis mitral con hallazgos sugestivos de obstrucción (<criterios>).` — cuerpo **y** EN SUMA |
| uno positivo, o ninguno con criterios medidos | `'posible'` / `'normal'` | «posible obstrucción» / «sin criterios de obstrucción» | **NADA** |
| ningún criterio medido | `null` | la fila publica `—  (sin medir — se carga en …)` | **NADA** |

⚠️ **LA MITRAL NO ESCRIBE NUNCA «SIN DATOS SUFICIENTES» EN EL PAPEL.** Con la obstrucción no
concluida el informe **omite la oración entera**: el bloque es
`if (_pe.obstr === 'significativa') { … }` y no tiene rama `else`. El comentario del código lo
declara: «lo que se firma es el hallazgo, no su ausencia».

- **PPM mitral:** `ppmFrases('mitral', …)` → cuerpo «Desajuste protésico-paciente mitral <grado>
  (AEO indexada <x> cm²/m²).», EN SUMA «PPM mitral <grado>.». Sólo `moderado` o `severo`, **sin**
  la condición de veredicto que tiene la aórtica.
- **Regurgitación:** con regurgitación significativa (`EM_CONT_REGURG_MIN = 2`) **se retira el
  AEO** y el **DVI se muestra y no concluye** (`emContMotivoNoVota`); el gradiente medio también
  se retira con sus dos motivos (`VM_PROT_GMED_RETIRO_TXT`, `VM_PROT_GMED_THP_TXT`). El área del
  jet conmuta de régimen: `IM_CORTES.jet_prot`.
- **Modelo cargado:** la mitral tiene el botón «Modelo y tamaño» desde PANT-20 y publica la
  comparación con el modelo **en el componente**, pero **no hay ningún `vmProtEOAz`**: el área
  efectiva mitral **no se compara contra la del modelo dentro del veredicto**.

---

## 1.4 · (D) PRÓTESIS TRICÚSPIDE

| pieza | quién |
|---|---|
| el tipo | `vtProtTipo()` (57792) → `'bio'` · `'mec'` · `null` |
| el veredicto | **`vtProtObstr()`** (57872) |
| los criterios positivos | `vtProtObstrCrit(R)` (57934) |
| la pintura | `vtProtObstrPintar()` (57963) · ids `vt-prot-evmax` · `-gmed` · `-thp` · `-aeo` · `-dvi` · `-obstr` |
| el DVI automático | `vtDviAuto(forzar)` |

### Los cinco criterios, con su umbral ÚNICO por tipo

| criterio | campo | operador | bioprotésica | mecánica |
|---|---|---|---|---|
| velocidad pico de E | `et_e_vmax` | `>=` | **210** cm/s | **190** cm/s |
| gradiente medio | `et_gmedio` | `>=` | **9** mmHg | **6** mmHg |
| THP | `et_thp` | `>=` | **200** ms | **130** ms |
| AEO | de `etEstado().avt` | **`<`** | **1,5** cm² | **2,0** cm² |
| DVI | `vt_dvi` | `>=` | **3,3** | **2,1** |

`VT_PROT_BANDA = { et_e_vmax: [20, 400], vt_dvi: [0.2, 20] }`.
**No hay categoría intermedia**: cada criterio es positivo o no.

### La regla de combinación y los CUATRO estados

```js
R.obstr = (R.pos.length >= VT_PROT_OBSTR_MIN) ? 'estenosis'   // VT_PROT_OBSTR_MIN = 2
        : (R.pos.length === 1)                ? 'aislado'
        : (R.med.length ? 'sin' : null);
```

| estado | pantalla | papel |
|---|---|---|
| `'estenosis'` | «hallazgos sugestivos de estenosis (<criterios> · N de M criterios)» | `Prótesis tricúspide con hallazgos sugestivos de estenosis (<criterios>).` |
| `'aislado'` | «hallazgo aislado, sin veredicto (<criterio> · 1 de M criterios)» | **NADA** |
| `'sin'` | «sin criterios de estenosis (M criterios medidos)» | **NADA** |
| `null` | «—  (sin criterios medidos[, … fuera de rango])» | **NADA** |

**El umbral de dos es criterio EcoSmart**, igual que el mitral, y el código lo declara: la Tabla 19
no publica regla de integración.

- **Regurgitación:** retira **sólo el DVI**, por la nota `*` de la Tabla 19, leyendo
  `EM_CONT_REGURG_MIN`; mira `it_grado` **y** `ia_grado`. La fila publica el valor y el motivo.
- **Modelo cargado:** la tricúspide tiene el componente y compara **seis** medidos, pero **no
  participa de la gradación**: `VMOD_POS.vt` va con `ppm: null` y `cortes: null`, así que el
  componente publica sólo el número de desviaciones, sin veredicto.
- **Desajuste:** la tricúspide **no publica PPM**: `PPM_VALV` sólo tiene `mitral` y `aortica`.

---

## 1.5 · (E) PRÓTESIS PULMONAR

| pieza | quién |
|---|---|
| el tipo | `vpProtTipo()` (55487) → `'bio'` · `'homo'` · `null` + motivo |
| el veredicto | **`vpProtObstr()`** (55505) |
| los criterios positivos | `vpProtObstrCrit(R)` (55537) |
| la pintura | `vpProtObstrPintar()` (55548) · ids `vp-prot-vmax` · `-gmed` · `-obstr` |

### Los DOS criterios

| criterio | campo | operador | bioprótesis | homoinjerto |
|---|---|---|---|---|
| velocidad pico | `vp_vmax` | `>=` | **3,2** m/s | **2,5** m/s |
| gradiente medio | `ep_gmedio` | `>=` | **20** mmHg | **15** mmHg |

`VP_PROT_BANDA = { vp_vmax: [0.2, 8], ep_gmedio: [0, 100] }`.

### La regla, y los TRES estados que no gradúan

```js
R.obstr = R.pos.length ? 'posible' : (R.med.length ? 'sin' : null);
```

**`'posible'` es el único veredicto positivo que esta válvula puede devolver**: la Tabla 15 tiene
dos columnas, «Normal» y «Possible obstruction», y no hay un segundo nivel al que escalar.
**Alcanza UN criterio positivo** — no hay umbral de conteo.

`VP_PROT_SIN_COL`, los tres estados que no gradúan, literal:

- `mec`: «No graduada: la guía no publica cortes para una prótesis pulmonar mecánica»
- `perc`: «No graduada: la guía no publica cortes para una prótesis pulmonar percutánea»
- `faltaTipo`: «No graduada: falta el tipo de prótesis pulmonar»

| estado | pantalla | papel |
|---|---|---|
| `'posible'` | «posible obstrucción (<criterios> · N de M criterios)» | `Prótesis pulmonar con posible obstrucción (<criterios>).` |
| `'sin'` | «sin criterios de obstrucción (M criterios medidos)» | **NADA** |
| `null` | «—  (sin criterios medidos)» | **NADA** |
| los tres de `VP_PROT_SIN_COL` | el motivo, literal | **NADA** |

- **Modelo cargado:** compara **tres** medidos (gradiente pico, gradiente medio, velocidad pico);
  `ppm: null` y `cortes: null`, así que **no participa de la gradación**.
- **Desajuste:** **no publica PPM**.
- **Regurgitación:** no retira ningún criterio de obstrucción.

---

## 1.6 · El bloque de «no se gradúa con cortes nativos», que es otra frase

`PROT_SIN_GRADO_TXT` = **«No graduada: los cortes de válvula nativa no aplican a prótesis»**.
Lo pinta `protNoGraduaPintar` en el rótulo de «Severidad sugerida» de la **mitral, la tricúspide
y la pulmonar** —la aórtica **no está** en la lista—. Y el bloque de «normofuncionante» del final
del EN SUMA, cuando esas tres no tienen línea de cuerpo que reusar, publica
`<válvula>: no se gradúa la estenosis con cortes de válvula nativa.`

---

## 1.7 · EL CATÁLOGO DE MODELOS — medido modelo por modelo

Seis constantes. **Cinco son arreglos de modelos; la sexta no.**

| constante | posición | modelos | filas de tamaño | celdas con dato | celdas vacías | columnas |
|---|---|---|---|---|---|---|
| `PROT_CAT_A4` | aórtica quirúrgica | **49** | 211 | 523 | 110 | `pico, medio, eoa` |
| `PROT_CAT_TAVI` | aórtica transcatéter | **9** | 29 | 78 | 38 | `pico, medio, eoa, dvi` |
| `PROT_CAT_A5` | mitral | **30** | 122 | 391 | 219 | `pico, medio, vpico, thp, eoa` |
| `PROT_CAT_A9` | tricúspide | **8** | 28 | 190 | 6 | `thp, medio, evel, vti, dvi, eoa, ieoa` |
| `PROT_CAT_A7` | pulmonar | **12** | 26 | 82 | 48 | `pico, medio, vpico, at, eoa` |
| `PROT_CAT_A8` | tricúspide ViV/ViR | **no es un arreglo de modelos** | — | — | — | claves `ref, refNum, f, n, viv, vir, edad, pvl, medio, eoa, vpico, porTam` |

`VMOD_TABLA = { va:'PROT_CAT_A4', vm:'PROT_CAT_A5', vt:'PROT_CAT_A9', vp:'PROT_CAT_A7' }`.
**`PROT_CAT_TAVI` no está en ese mapeo**: lo elige `vModCatalogo(pos)` por la morfología.
**`PROT_CAT_A8` no tiene consumidor** (declarado en P20-b).

### Qué guarda cada celda

`{ n:nombre, d:descriptor, t:tipo, f:folio, s:[[tamaño, …valores]] }`, con cada valor
`[media, desvío]`, `[media, desvío, 'texto impreso']` o `null`.

- **`null`** = celda vacía impresa.
- **desvío `null`** = valor impreso **sin** desvío.
- **tercer elemento** = el texto impreso tal cual, cuando no es «valor» ni «valor ± desvío»
  (mediana con rango intercuartílico, límite superior). **Sólo la A7 lo usa: 56 de sus 82 celdas.**

### ⚠️ CUÁNTOS MODELOS TIENEN DESVÍO ESTÁNDAR — LA HIPÓTESIS DEL MÉDICO NO SE REPRODUCE

La hipótesis (b) de la orden dice «todos los modelos del catálogo tienen desvío estándar». **No.**
Medido sobre la columna de **área efectiva**, que es la que la comparación en desviaciones
estándar necesita:

| catálogo | modelos | **sirven** para comparar el área en DE | **NO sirven** |
|---|---|---|---|
| `PROT_CAT_A4` (aórtica quirúrgica) | 49 | **46** | **3** |
| `PROT_CAT_TAVI` | 9 | **9** | 0 |
| `PROT_CAT_A5` (mitral) | 30 | **15** | **15** |
| `PROT_CAT_A9` (tricúspide) | 8 | **8** | 0 |
| `PROT_CAT_A7` (pulmonar) | 12 | **2** | **10** |
| **total** | **108** | **80** | **28** |

**Y las dos razones por las que un modelo no sirve son distintas**, lo que importa porque sólo una
es «falta el desvío»:

1. **La tabla no imprime área para ese modelo** (cero celdas de área). Son **26** de los 28:
   3 de la A4, 15 de la A5 y 8 de la A7.
2. **La tabla imprime el área y ninguna de sus filas trae desvío.** Son **2**, los dos
   pulmonares mecánicos: `Carbomedics [Mechanical valves]` f.62 (4 tamaños, 4 celdas de área,
   **0** con desvío) y `On-X [Mechanical valve]` f.62 (4 y 4, **0** con desvío).

**Los 28 modelos que NO sirven, por catálogo:**

**`PROT_CAT_A4`, 3 (los tres sin celda de área impresa):**
Edwards Duromedics [Bileaflet] f.54 · Hancock [Stented porcine] f.55 ·
Monostrut Bjork-Shiley [Single tilting disk] f.57.

**`PROT_CAT_A5`, 15 (los quince sin celda de área impresa):**
Biocor [Stentless bioprosthesis] f.58 · Bjork-Shiley monostrut [Tilting disk] f.58 ·
Carpentier-Edwards [Stented bioprosthesis] f.59 ·
Carpentier-Edwards pericardial [Stented Bioprosthesis] f.59 · Duromedics [Bileaflet] f.59 ·
Hancock pericardial [Stented bioprosthesis] f.59 · Ionescu-Shiley [Stented bioprosthesis] f.59 ·
Ionescu-Shiley low profile [Stented bioprosthesis] f.60 · Lillehei-Kaster [Tilting disk] f.60 ·
Medtronic-Hall [Tilting disk] f.60 · Medtronic Intact Porcine [Stented bioprosthesis] f.60 ·
Mitroflow [Stented bioprosthesis] f.60 · Omnicarbon [Tilting disk] f.60 ·
Sorin Bicarbon [Bileaflet] f.61 · Wessex [Stented bioprosthesis] f.61.

**`PROT_CAT_A7`, 10:**
sin celda de área (8): Homograft f.62 · Contegra [Valved conduits] f.62 ·
Shelhigh [Valved conduits] f.62 · Medtronic [Valved conduits] f.62 ·
Bioprosthetic valves f.62 · Melody [Percutaneous pulmonary valves] f.62 ·
Alterra Stent with SAPIEN f.62 · Harmony f.62.
**con área impresa y sin desvío (2): Carbomedics [Mechanical valves] f.62 y On-X [Mechanical
valve] f.62.**

**Celdas de área con valor y sin desvío, por catálogo** (el caso que la decisión (b) tendría que
resolver dentro de un modelo que por lo demás sirve): A4 **1** sobre 190 (Edwards Mira 25, que el
propio código declara) · A5 **6** sobre 63 · A9 **3** sobre 28 · A7 **15** sobre 17 · TAVI **0**.

### Cómo se carga el modelo

Botón **«Modelo y tamaño»** en la fila del selector de morfología de la aórtica, la tricúspide y
la pulmonar, y en una **fila propia** debajo en la mitral. Un solo componente parametrizado por
`VMOD_POS`, con cuatro campos guardados por posición (`<pos>_prot_modelo`, `_tam`, `_gmref`,
`_eoaref`) y **doce columnas de Excel** más las cuatro de la aórtica (457 en total). Hay además un
**modo manual**, cuyos valores se construyen con desvío `null`.

### ⚠️ Cómo compara HOY el área efectiva contra la del modelo

**Hay dos comparaciones distintas, y sólo una entra en la gradación.**

**(1) El componente «Modelo y tamaño», en las cuatro posiciones — sólo muestra.**
`vModSync(pos)` publica, por cada medido de `VMOD_POS[pos].medidos`, el valor esperado del modelo
y la diferencia de lo medido **en desviaciones estándar**, con `fac` para convertir la unidad de
la tabla a la del campo. Medidos por posición: **aórtica 2** (gradiente medio y AVA por
continuidad), **mitral 4**, **tricúspide 6**, **pulmonar 3**. Publica además la **EOA indexada
predicha** (`vModIndexada`), y su **categoría de PPM sólo donde hay cortes**: `VMOD_POS.va.ppm` y
`.vm.ppm` existen; **`.vt` y `.vp` van con `ppm: null` y `cortes: null`**, así que ahí se publica
el número sin veredicto. **Nada de esto vota.**

**(2) `eaProtEOAz()`, sólo en la aórtica QUIRÚRGICA — sí entra en la gradación.**

```js
z = (ava_cont - ref) / sd;
nivel = (z <= -2) ? 'signif' : ((z < -1) ? 'posible' : 'normal');
```

Entra como `nv.eoa` en `indep = [nv.dvi, nv.eoa]`. **Es el único lugar de la aplicación donde la
comparación contra el modelo participa de un veredicto.** Texto que escribe, en la salvedad de
pantalla:

> «El área efectiva medida es de `<ava>` cm² y la del modelo `<modelo> <tam>` es de `<ref>` ±
> `<sd>` cm²: `+/−<z>` DE, o sea `<dentro de ± 1 DE de la del modelo | 1 DE por debajo de la del
> modelo | 2 DE por debajo de la del modelo>`. Es el eje independiente del flujo que la Tabla 5
> expresa así.»

Y cuando **no** hay modelo, en su lugar va `EA_PROT_SALV.eoa`:

> «El área efectiva no se evalúa: la Tabla 5 la expresa en desviaciones estándar respecto del
> valor de referencia del MODELO implantado, y en este estudio no hay un modelo del catálogo
> cargado —se carga con el botón «Modelo y tamaño»—. El DVI queda como único eje independiente del
> flujo.»

⚠️ **NINGUNA DE LAS OTRAS TRES VÁLVULAS COMPARA EL ÁREA CONTRA EL MODELO DENTRO DE SU VEREDICTO.**
Censados `vmProtEOA`, `vtProtObstr` y `vpProtObstr`: ninguno llama a `vModEsperados` ni a nada que
lea el catálogo. En las tres, el área se compara contra un **corte absoluto** de su propia tabla.

---

## 1.8 · Lo que la medición del commit 1 desmintió de la orden

| hipótesis de la orden | medición |
|---|---|
| «todas las prótesis se manejan igual que la TAVI» (escriben «sin datos suficientes») | **FALSO.** Sólo la **aórtica** escribe esa frase. La mitral, la tricúspide y la pulmonar **no escriben nada en el papel** cuando no concluyen: sus bloques son `if (veredicto positivo) {…}` sin `else`. |
| «todos los modelos del catálogo tienen desvío estándar» | **FALSO.** De **108** modelos, **28** no sirven para comparar el área en desviaciones estándar: **26** porque la tabla no imprime área para ellos y **2** porque la imprime sin un solo desvío. |
| «(A) aórtica biológica y (A2) mecánica» son dos lógicas | **FALSO.** El motor aórtico no distingue tejido: sólo `TAVI` contra el resto. |
| la comparación con el modelo ya existe en todas las posiciones | **PARCIAL.** El **componente** compara en las cuatro; la **gradación** sólo en la aórtica quirúrgica, por `eaProtEOAz`. |
| la TAVI podría usar el área frente al modelo con el catálogo cargado | **FALSO hoy.** `eaProtEOAz` exige morfología quirúrgica, aunque `PROT_CAT_TAVI` traiga el desvío en sus 26 celdas de área. |
