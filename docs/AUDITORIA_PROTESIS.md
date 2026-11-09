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
| dos o más positivos | `'significativa'` | «sugiere obstrucción significativa  (<criterios> · N de M criterios)» | `Prótesis mitral con hallazgos sugestivos de obstrucción (<criterios>).` — cuerpo **y** EN SUMA |
| **UN** positivo | `'posible'` | **«hallazgo aislado — posible obstrucción  (<criterio> · 1 de M criterios)»** (medido en la escena 13) | **NADA** |
| criterios medidos y ninguno positivo | `'normal'` | «sin criterios de obstrucción  (M criterios medidos)» | **NADA** |
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

---

# 2 · La batería de escenas, medida

Sonda: **`scripts/_probe_audprot_escenas.mjs`**. Un solo Chrome, `file://index.html`, transiciones
apagadas. Cada escena entra por el **gesto real**: el `<select>` de morfología y los campos
tipeados con sus eventos `input` y `change`, el botón de la pestaña **Válvulas**, las cuatro
secciones abiertas por su propio acordeón, el botón de estilo del informe, y —donde hay modelo— la
tarjeta «Modelo y tamaño» abierta por su botón, el nombre escrito en el buscador, la sugerencia
clickeada, el tamaño elegido en su `<select>` y el botón «Elegir». **`index.html` no se toca:**
md5 `f2587ad83be4d12f8a59fa9a0bb27a23` antes y después.

**Cómo se eligieron los valores.** Ninguno por criterio clínico: todos caen **claramente por
encima o por debajo de los cortes que la propia app imprime en su pantalla**. La velocidad 4,5 m/s
y el gradiente medio 45 mmHg son los del caso que el médico reportó. El DVI se construye con los
dos VTI (`itv_tsvi / itv_ao`), así que 50/100 da 0,50 —normal, el corte es `> 0,35`— y 20/100 da
0,20 —significativa, el corte es `< 0,25`—. El área efectiva sale del Ø del TSVI: con 21 mm y
`itv_tsvi` 52 el AVA es 1,80 cm², y con 16 mm y 40 es 0,80 cm². **El modelo del catálogo no se
eligió de memoria: la sonda recorre el catálogo real buscando un modelo y tamaño cuya referencia
deje el área medida en el tramo pedido** —es el patrón de «buscar la escena en vez de adivinarla»—,
y publica cuál encontró.

⚠️ **TRES DENOMINADORES VACÍOS QUE LA SONDA CAZÓ ANTES DE QUE YO LE CREYERA.**

1. **Las cuatro secciones de Válvulas nacen cerradas y el componente no abre sin ellas.**
   `vModAbrir` llama a `_vModColocar(btn)`, que se rinde cuando el botón no tiene caja, y entonces
   la tarjeta se cierra sola: la primera corrida midió `cardAbierta: false` y `sugerencias: 0` en
   las cuatro escenas de modelo. Es la lección que PANT-20 dejó escrita.
2. **`toggleEteSeccion` prefija `ete-seccion-` al id que recibe**, así que hay que pasarle la clave
   corta `valv-aortica`. Con el id completo busca `ete-seccion-ete-seccion-valv-aortica` y se va
   sin abrir nada: las secciones seguían informando `CERRADA` con la llamada puesta.
3. **Con TAVI el catálogo es OTRO.** `vModCatalogo` elige `PROT_CAT_TAVI` por la morfología, así
   que un modelo de la A4 no aparece en el buscador: las dos escenas de TAVI con modelo volvieron a
   dar `sugerencias: 0` hasta que la búsqueda se hizo sobre el catálogo de transcatéter.

**Resumen de las 25 escenas.** La frase «sin datos suficientes para graduar la estenosis
protésica» aparece en **cinco**: las escenas **2**, **8**, **9** y **10** —y la reapertura de un
estudio guardado de la escena 2—. Las cuatro son **aórticas**. **En ninguna escena mitral,
tricuspídea o pulmonar el papel escribe esa frase ni ninguna equivalente.**

### Escena 1 TAVI sin ningun dato

**Sembrado (gesto real):** `va_morf`=TAVI · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `TAVI`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `faltan` · pDep `null` · pIndep `null` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Falta un dato para aplicar la tabla |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | Falta un parámetro dependiente del flujo (velocidad pico o gradiente medio); el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado.⚠️ Para TAVI la tabla expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica.ⓘ Ver detallePara hablar de estenosis protésica significativa la Tabla 5 exige al menos un parámetro dependiente del flujo Y uno independiente. Falta: un parámetro dependiente del flujo (velocidad pico o gradiente medio);  … |
| pantalla · `gmedio` | — |
| pantalla · `dvi` | — |
| pantalla · `atet` | — |
| pantalla · `ppm` | —  (falta el AVA por continuidad) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaIdx` | — |
| pantalla · `dviVal` | — |
| informe · conciso | VAo con prótesis transcatéter tipo TAVI normofuncionante. |
| informe · estandar | Válvula aórtica con prótesis transcatéter tipo TAVI normofuncionante. |
| informe · narrativo | La válvula aórtica presenta una prótesis transcatéter tipo TAVI normofuncionante. |
| EN SUMA | TAVI normofuncionante. |
| Evidencia · su sección | {"filas":[{"lbl":"Válvula aórtica","val":"TAVI","marca":"none","nota":"las filas de estenosis aórtica de válvula nativa no aplican y no se muestran; las recomendaciones de esta sección son las de disfunción protésica","refs":["esc2025vc"]},{"lbl":"Severidad protésica por la Tabla 5","val":"Falta un dato para aplicar la tabla","marca":"ask","nota":"falta un parámetro dependiente del flujo (velocidad pico o gradiente medio), el DVI, que es el único eje independiente del flujo que esta aplicación p … |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 2 TAVI vmax 4,5 + gmedio 45 (CASO DEL MEDICO)

**Sembrado (gesto real):** `va_morf`=TAVI · `vmax_ao`=4.5 · `gmedio_ao`=45 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `TAVI`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `faltan` · pDep `signif` · pIndep `null` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Falta un dato para aplicar la tabla |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | Falta el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado.⚠️ Para TAVI la tabla expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica.ⓘ Ver detallePara hablar de estenosis protésica significativa la Tabla 5 exige al menos un parámetro dependiente del flujo Y uno independiente. Falta: el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado.Para TAVI la Tabla 5 expresa el gr … |
| pantalla · `gmedio` | 45 mmHg |
| pantalla · `dvi` | — |
| pantalla · `atet` | — |
| pantalla · `ppm` | —  (falta el AVA por continuidad) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaIdx` | — |
| pantalla · `dviVal` | — |
| informe · conciso | VAo con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| informe · estandar | Válvula aórtica con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| informe · narrativo | La válvula aórtica presenta una prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| EN SUMA | Válvula aórtica con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: SE REPRODUCE.**

### Escena 3 TAVI vmax 4,5 + gmedio 45 + DVI normal 0,50

**Sembrado (gesto real):** `va_morf`=TAVI · `vmax_ao`=4.5 · `gmedio_ao`=45 · `diam_tsvi`=21 · `itv_tsvi`=50 · `itv_ao`=100 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `TAVI`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `posible` · pDep `signif` · pIndep `normal` · PPM `no` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Posible estenosis protésica |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | No se cumplen las dos mitades que la tabla exige para «significativa» (depende del flujo: velocidad pico 4.5 m/s y gradiente medio 45 mmHg · no depende del flujo: DVI 0.50).⚠️ Para TAVI la tabla expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica.⚠️ Volumen sistólico calculado 173 mL, fuera de los 50-90 mL que pide la nota al pie de la tabla.ⓘ Ver detalleNo se cumplen las DOS mitades que la tabla exige para «significativa» —un eje dependiente del flujo y uno independiente—, as … |
| pantalla · `gmedio` | 45 mmHg |
| pantalla · `dvi` | 0.50 |
| pantalla · `atet` | — |
| pantalla · `ppm` | 0.95 cm²/m²  (sin desajuste) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaCont` | 1.73 |
| pantalla · `avaIdx` | 0.95 cm²/m² |
| pantalla · `dviVal` | 0.50 |
| informe · conciso | VAo con prótesis transcatéter tipo TAVI, con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.50). |
| informe · estandar | Válvula aórtica con prótesis transcatéter tipo TAVI, con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.50). |
| informe · narrativo | La válvula aórtica presenta una prótesis transcatéter tipo TAVI, con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.50). |
| EN SUMA | Prótesis aórtica: posible estenosis protésica. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 4 TAVI vmax 4,5 + gmedio 45 + DVI bajo 0,20

**Sembrado (gesto real):** `va_morf`=TAVI · `vmax_ao`=4.5 · `gmedio_ao`=45 · `diam_tsvi`=21 · `itv_tsvi`=20 · `itv_ao`=100 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `TAVI`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `signif` · pDep `signif` · pIndep `signif` · PPM `severo` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Sugiere estenosis protésica significativa |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | Un parámetro que depende del flujo y uno que no, los dos en rango de estenosis significativa (depende del flujo: velocidad pico 4.5 m/s y gradiente medio 45 mmHg · no depende del flujo: DVI 0.20).⚠️ Para TAVI la tabla expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica.ⓘ Ver detalleSe cumplen las dos mitades que la tabla exige: un eje dependiente del flujo y uno independiente del flujo en rango de estenosis significativa.Para TAVI la Tabla 5 expresa el gradiente medio, el DVI  … |
| pantalla · `gmedio` | 45 mmHg |
| pantalla · `dvi` | 0.20 |
| pantalla · `atet` | — |
| pantalla · `ppm` | 0.38 cm²/m²  (severo) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaCont` | 0.69 |
| pantalla · `avaIdx` | 0.38 cm²/m² |
| pantalla · `dviVal` | 0.20 |
| informe · conciso | VAo con prótesis transcatéter tipo TAVI, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.20). |
| informe · estandar | Válvula aórtica con prótesis transcatéter tipo TAVI, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.20). |
| informe · narrativo | La válvula aórtica presenta una prótesis transcatéter tipo TAVI, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.20). |
| EN SUMA | Prótesis aórtica: criterios que sugieren estenosis protésica significativa. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 5 TAVI con modelo cargado y area efectiva NORMAL

**Sembrado (gesto real):** `va_morf`=TAVI · `vmax_ao`=4.5 · `gmedio_ao`=45 · `diam_tsvi`=21 · `itv_tsvi`=52 · `itv_ao`=100 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `TAVI`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas. Modelo pedido `SAPIEN / 23`, sugerencias ofrecidas 5, quedó cargado **sí** — referencia del modelo {"pico":null,"medio":[9.92,4.27],"eoa":[1.56,0.43],"dvi":[0.53,0.13]}, folio 51.

**Evaluador:** `posible` · pDep `signif` · pIndep `normal` · PPM `no` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Posible estenosis protésica |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | No se cumplen las dos mitades que la tabla exige para «significativa» (depende del flujo: velocidad pico 4.5 m/s y gradiente medio 45 mmHg · no depende del flujo: DVI 0.52).⚠️ Para TAVI la tabla expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica.⚠️ Volumen sistólico calculado 180 mL, fuera de los 50-90 mL que pide la nota al pie de la tabla.ⓘ Ver detalleNo se cumplen las DOS mitades que la tabla exige para «significativa» —un eje dependiente del flujo y uno independiente—, as … |
| pantalla · `gmedio` | 45 mmHg |
| pantalla · `dvi` | 0.52 |
| pantalla · `atet` | — |
| pantalla · `ppm` | 0.99 cm²/m²  (sin desajuste) |
| pantalla · `botonModelo` | SAPIEN · 23 mm ▾ |
| pantalla · `medidoModelo` | Medido en este estudioGradiente medio medido45 mmHg · +8.2 DE respecto del esperadoAVA por continuidad medido1.8 cm² · +0.6 DE respecto del esperado |
| pantalla · `avaCont` | 1.80 |
| pantalla · `avaIdx` | 0.99 cm²/m² |
| pantalla · `dviVal` | 0.52 |
| informe · conciso | VAo con prótesis transcatéter tipo TAVI, con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.52). |
| informe · estandar | Válvula aórtica con prótesis transcatéter tipo TAVI, con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.52). |
| informe · narrativo | La válvula aórtica presenta una prótesis transcatéter tipo TAVI, con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.52). |
| EN SUMA | Prótesis aórtica: posible estenosis protésica. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 6 TAVI con modelo cargado y area efectiva MUY POR DEBAJO

**Sembrado (gesto real):** `va_morf`=TAVI · `vmax_ao`=4.5 · `gmedio_ao`=45 · `diam_tsvi`=16 · `itv_tsvi`=40 · `itv_ao`=100 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `TAVI`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas. Modelo pedido `SAPIEN / 26`, sugerencias ofrecidas 5, quedó cargado **sí** — referencia del modelo {"pico":null,"medio":[8.76,3.89],"eoa":[1.84,0.52],"dvi":[0.53,0.13]}, folio 51.

**Evaluador:** `posible` · pDep `signif` · pIndep `normal` · PPM `severo` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Posible estenosis protésica |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | No se cumplen las dos mitades que la tabla exige para «significativa» (depende del flujo: velocidad pico 4.5 m/s y gradiente medio 45 mmHg · no depende del flujo: DVI 0.40).⚠️ Para TAVI la tabla expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica.ⓘ Ver detalleNo se cumplen las DOS mitades que la tabla exige para «significativa» —un eje dependiente del flujo y uno independiente—, así que queda en posible.Para TAVI la Tabla 5 expresa el gradiente medio, el DVI y el área efectiva … |
| pantalla · `gmedio` | 45 mmHg |
| pantalla · `dvi` | 0.40 |
| pantalla · `atet` | — |
| pantalla · `ppm` | 0.44 cm²/m²  (severo) |
| pantalla · `botonModelo` | SAPIEN · 26 mm ▾ |
| pantalla · `medidoModelo` | Medido en este estudioGradiente medio medido45 mmHg · +9.3 DE respecto del esperadoAVA por continuidad medido0.8 cm² · −2.0 DE respecto del esperado |
| pantalla · `avaCont` | 0.80 |
| pantalla · `avaIdx` | 0.44 cm²/m² |
| pantalla · `dviVal` | 0.40 |
| informe · conciso | VAo con prótesis transcatéter tipo TAVI, con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.40). <br> Desajuste protésico-paciente aórtico severo (AEO indexada 0.44 cm²/m²). |
| informe · estandar | Válvula aórtica con prótesis transcatéter tipo TAVI, con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.40). <br> Desajuste protésico-paciente aórtico severo (AEO indexada 0.44 cm²/m²). |
| informe · narrativo | La válvula aórtica presenta una prótesis transcatéter tipo TAVI, con posible estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.40). <br> Desajuste protésico-paciente aórtico severo (AEO indexada 0.44 cm²/m²). |
| EN SUMA | Prótesis aórtica: posible estenosis protésica. <br> PPM aórtico severo. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 7 TAVI con desajuste paciente-protesis (AEO indexada baja)

**Sembrado (gesto real):** `va_morf`=TAVI · `vmax_ao`=2.0 · `gmedio_ao`=12 · `diam_tsvi`=16 · `itv_tsvi`=40 · `itv_ao`=100 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `TAVI`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `normal` · pDep `normal` · pIndep `normal` · PPM `severo` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Sin criterios de estenosis protésica |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | Depende del flujo: velocidad pico 2 m/s y gradiente medio 12 mmHg · no depende del flujo: DVI 0.40.⚠️ Para TAVI la tabla expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica.ⓘ Ver detallePara TAVI la Tabla 5 expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo, con el basal definido como un estudio en condiciones hemodinámicas estables; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica (ASE 2024, hoja 18, folio  … |
| pantalla · `gmedio` | 12 mmHg |
| pantalla · `dvi` | 0.40 |
| pantalla · `atet` | — |
| pantalla · `ppm` | 0.44 cm²/m²  (severo) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaCont` | 0.80 |
| pantalla · `avaIdx` | 0.44 cm²/m² |
| pantalla · `dviVal` | 0.40 |
| informe · conciso | VAo con prótesis transcatéter tipo TAVI, sin criterios de estenosis protésica (Vmax 2 m/s, G. medio 12 mmHg, DVI 0.40). <br> Desajuste protésico-paciente aórtico severo (AEO indexada 0.44 cm²/m²). |
| informe · estandar | Válvula aórtica con prótesis transcatéter tipo TAVI, sin criterios de estenosis protésica (Vmax 2 m/s, G. medio 12 mmHg, DVI 0.40). <br> Desajuste protésico-paciente aórtico severo (AEO indexada 0.44 cm²/m²). |
| informe · narrativo | La válvula aórtica presenta una prótesis transcatéter tipo TAVI, sin criterios de estenosis protésica (Vmax 2 m/s, G. medio 12 mmHg, DVI 0.40). <br> Desajuste protésico-paciente aórtico severo (AEO indexada 0.44 cm²/m²). |
| EN SUMA | Prótesis aórtica: sin criterios de estenosis protésica. <br> PPM aórtico severo. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 8 TAVI con regurgitacion paravalvular (modulo TAVI)

**Sembrado (gesto real):** `va_morf`=TAVI · `ete_tavi_ext_circ`=20 · `ete_tavi_vc_ancho`=4 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `TAVI`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `faltan` · pDep `null` · pIndep `null` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Falta un dato para aplicar la tabla |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | Falta un parámetro dependiente del flujo (velocidad pico o gradiente medio); el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado.⚠️ Para TAVI la tabla expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica.ⓘ Ver detallePara hablar de estenosis protésica significativa la Tabla 5 exige al menos un parámetro dependiente del flujo Y uno independiente. Falta: un parámetro dependiente del flujo (velocidad pico o gradiente medio);  … |
| pantalla · `gmedio` | — |
| pantalla · `dvi` | — |
| pantalla · `atet` | — |
| pantalla · `ppm` | —  (falta el AVA por continuidad) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaIdx` | — |
| pantalla · `dviVal` | — |
| informe · conciso | VAo con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica. |
| informe · estandar | Válvula aórtica con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica. |
| informe · narrativo | La válvula aórtica presenta una prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica. |
| EN SUMA | **(nada de esta válvula)** |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: SE REPRODUCE.**

### Escena 9 aortica quirurgica BIOLOGICA solo vmax 4,5 + gmedio 45

**Sembrado (gesto real):** `va_morf`=Prótesis biológica · `vmax_ao`=4.5 · `gmedio_ao`=45 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `faltan` · pDep `signif` · pIndep `null` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Falta un dato para aplicar la tabla |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | Falta el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado.ⓘ Ver detallePara hablar de estenosis protésica significativa la Tabla 5 exige al menos un parámetro dependiente del flujo Y uno independiente. Falta: el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado.El área efectiva no se evalúa: la Tabla 5 la expresa en desviaciones estándar respecto del valor de referencia del MODELO implantado, y en este estudio no hay un modelo del catálogo cargado —se carga con el botón «Modelo y tama … |
| pantalla · `gmedio` | 45 mmHg |
| pantalla · `dvi` | — |
| pantalla · `atet` | — |
| pantalla · `ppm` | —  (falta el AVA por continuidad) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaIdx` | — |
| pantalla · `dviVal` | — |
| informe · conciso | VAo con prótesis biológica, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| informe · estandar | Válvula aórtica con prótesis biológica, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| informe · narrativo | La válvula aórtica presenta una prótesis biológica, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| EN SUMA | Válvula aórtica con prótesis biológica, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| Evidencia · su sección | {"filas":[{"lbl":"Válvula aórtica","val":"Prótesis biológica","marca":"none","nota":"las filas de estenosis aórtica de válvula nativa no aplican y no se muestran; las recomendaciones de esta sección son las de disfunción protésica","refs":["esc2025vc"]},{"lbl":"Severidad protésica por la Tabla 5","val":"Falta un dato para aplicar la tabla","marca":"ask","nota":"falta el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado","refs":["aseProtM2024 … |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: SE REPRODUCE.**

### Escena 10 aortica quirurgica MECANICA solo vmax 4,5 + gmedio 45

**Sembrado (gesto real):** `va_morf`=Prótesis mecánica · `vmax_ao`=4.5 · `gmedio_ao`=45 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis mecánica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `faltan` · pDep `signif` · pIndep `null` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Falta un dato para aplicar la tabla |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | Falta el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado.ⓘ Ver detallePara hablar de estenosis protésica significativa la Tabla 5 exige al menos un parámetro dependiente del flujo Y uno independiente. Falta: el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado.El área efectiva no se evalúa: la Tabla 5 la expresa en desviaciones estándar respecto del valor de referencia del MODELO implantado, y en este estudio no hay un modelo del catálogo cargado —se carga con el botón «Modelo y tama … |
| pantalla · `gmedio` | 45 mmHg |
| pantalla · `dvi` | — |
| pantalla · `atet` | — |
| pantalla · `ppm` | —  (falta el AVA por continuidad) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaIdx` | — |
| pantalla · `dviVal` | — |
| informe · conciso | VAo con prótesis mecánica, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| informe · estandar | Válvula aórtica con prótesis mecánica, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| informe · narrativo | La válvula aórtica presenta una prótesis mecánica, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| EN SUMA | Válvula aórtica con prótesis mecánica, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg). |
| Evidencia · su sección | {"filas":[{"lbl":"Válvula aórtica","val":"Prótesis mecánica","marca":"none","nota":"las filas de estenosis aórtica de válvula nativa no aplican y no se muestran; las recomendaciones de esta sección son las de disfunción protésica","refs":["esc2025vc"]},{"lbl":"Severidad protésica por la Tabla 5","val":"Falta un dato para aplicar la tabla","marca":"ask","nota":"falta el DVI, que es el único eje independiente del flujo que esta aplicación puede evaluar sin un modelo cargado","refs":["aseProtM2024" … |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: SE REPRODUCE.**

### Escena 11 aortica quirurgica BIOLOGICA con vmax, gmedio y DVI 0,20

**Sembrado (gesto real):** `va_morf`=Prótesis biológica · `vmax_ao`=4.5 · `gmedio_ao`=45 · `diam_tsvi`=21 · `itv_tsvi`=20 · `itv_ao`=100 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `signif` · pDep `signif` · pIndep `signif` · PPM `severo` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Sugiere estenosis protésica significativa |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | Un parámetro que depende del flujo y uno que no, los dos en rango de estenosis significativa (depende del flujo: velocidad pico 4.5 m/s y gradiente medio 45 mmHg · no depende del flujo: DVI 0.20).ⓘ Ver detalleSe cumplen las dos mitades que la tabla exige: un eje dependiente del flujo y uno independiente del flujo en rango de estenosis significativa.El área efectiva no se evalúa: la Tabla 5 la expresa en desviaciones estándar respecto del valor de referencia del MODELO implantado, y en este estudio no hay un modelo del catálogo cargado —se carga con el botón «Modelo y tamaño»—. El DVI queda com … |
| pantalla · `gmedio` | 45 mmHg |
| pantalla · `dvi` | 0.20 |
| pantalla · `atet` | — |
| pantalla · `ppm` | 0.38 cm²/m²  (severo) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaCont` | 0.69 |
| pantalla · `avaIdx` | 0.38 cm²/m² |
| pantalla · `dviVal` | 0.20 |
| informe · conciso | VAo con prótesis biológica, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.20). |
| informe · estandar | Válvula aórtica con prótesis biológica, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.20). |
| informe · narrativo | La válvula aórtica presenta una prótesis biológica, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.20). |
| EN SUMA | Prótesis aórtica: criterios que sugieren estenosis protésica significativa. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 12 aortica quirurgica con MODELO y area efectiva 2 DE por debajo

**Sembrado (gesto real):** `va_morf`=Prótesis mecánica · `vmax_ao`=4.5 · `gmedio_ao`=45 · `diam_tsvi`=16 · `itv_tsvi`=40 · `itv_ao`=100 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis mecánica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas. Modelo pedido `Abbott Epic / 27`, sugerencias ofrecidas 1, quedó cargado **sí** — referencia del modelo {"pico":null,"medio":[11.4,4.1],"eoa":[1.6,0.4]}, folio 53.

**Evaluador:** `signif` · pDep `signif` · pIndep `signif` · PPM `severo` · área frente al modelo evaluable `true`, z = -2

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Posible estenosis protésica |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | No se cumplen las dos mitades que la tabla exige para «significativa» (depende del flujo: velocidad pico 4.5 m/s y gradiente medio 45 mmHg · no depende del flujo: DVI 0.40).ⓘ Ver detalleNo se cumplen las DOS mitades que la tabla exige para «significativa» —un eje dependiente del flujo y uno independiente—, así que queda en posible.El área efectiva no se evalúa: la Tabla 5 la expresa en desviaciones estándar respecto del valor de referencia del MODELO implantado, y en este estudio no hay un modelo del catálogo cargado —se carga con el botón «Modelo y tamaño»—. El DVI queda como único eje indepe … |
| pantalla · `gmedio` | 45 mmHg |
| pantalla · `dvi` | 0.40 |
| pantalla · `atet` | — |
| pantalla · `ppm` | 0.44 cm²/m²  (severo) |
| pantalla · `botonModelo` | Abbott Epic · 27 mm ▾ |
| pantalla · `medidoModelo` | Medido en este estudioGradiente medio medido45 mmHg · +8.2 DE respecto del esperadoAVA por continuidad medido0.8 cm² · −2.0 DE respecto del esperado |
| pantalla · `avaCont` | 0.80 |
| pantalla · `avaIdx` | 0.44 cm²/m² |
| pantalla · `dviVal` | 0.40 |
| informe · conciso | VAo con prótesis mecánica, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.40). |
| informe · estandar | Válvula aórtica con prótesis mecánica, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.40). |
| informe · narrativo | La válvula aórtica presenta una prótesis mecánica, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s, G. medio 45 mmHg, DVI 0.40). |
| EN SUMA | Prótesis aórtica: criterios que sugieren estenosis protésica significativa. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 13 mitral BIOLOGICA solo velocidad pico de E y gradiente medio

**Sembrado (gesto real):** `vm_morf`=Prótesis biológica · `em_vmax`=2.6 · `em_gmedio`=14 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `posible` · positivos `["gmed"]`

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | hallazgo aislado — posible obstrucción  (gradiente medio 14.0 mmHg · 1 de 1 criterio) |
| pantalla · `vmax` | 2.60 m/s  (sugiere obstrucción significativa · <1.9 normal · ≥2.5 significativa) |
| pantalla · `gmed` | 14.0 mmHg  (sugiere obstrucción significativa · ≤5 normal · >10 significativa) |
| pantalla · `thp` | —  (sin medir — se carga en Doppler Mitral) |
| pantalla · `eoa` | —  (falta Ø TSVI, VTI TSVI, VTI mitral CW) |
| pantalla · `dvi` | — |
| pantalla · `ppm` | —  (falta el AEO por continuidad) |
| pantalla · `sev` | No graduada: los cortes de válvula nativa no aplican a prótesis |
| informe · conciso | VM con prótesis biológica (gradiente medio 14 mmHg, Vmax 2.6 m/s). |
| informe · estandar | Válvula mitral con prótesis biológica (gradiente medio 14 mmHg, Vmax 2.6 m/s). |
| informe · narrativo | La válvula mitral presenta una prótesis biológica (gradiente medio 14 mmHg, Vmax 2.6 m/s). |
| EN SUMA | Válvula mitral con prótesis biológica (gradiente medio 14 mmHg, Vmax 2.6 m/s). |
| Evidencia · su sección | {"filas":[{"lbl":"Válvula mitral","val":"Prótesis biológica","marca":"none","nota":"las secciones mitrales de válvula nativa no aplican y no se muestran; los cortes de esta sección son los de prótesis","refs":null},{"lbl":"Velocidad pico transprotésica","val":"2,6 m/s","marca":"ok","nota":"alcanza 2.5 m/s — sugiere estenosis protésica significativa","refs":["aseProtM2024"]},{"lbl":"Gradiente medio transprotésico","val":"14,0 mmHg","marca":"ok","nota":"mayor que 10 mmHg — sugiere estenosis protés … |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 14 mitral BIOLOGICA con velocidad, gradiente y THP

**Sembrado (gesto real):** `vm_morf`=Prótesis biológica · `em_vmax`=2.6 · `em_gmedio`=14 · `thp`=240 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `significativa` · positivos `["gmed","thp"]`

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | sugiere obstrucción significativa  (gradiente medio 14.0 mmHg, THP 240 ms · 2 de 2 criterios) |
| pantalla · `vmax` | 2.60 m/s  (sugiere obstrucción significativa · <1.9 normal · ≥2.5 significativa) |
| pantalla · `gmed` | 14.0 mmHg  (sugiere obstrucción significativa · ≤5 normal · >10 significativa) |
| pantalla · `thp` | 240 ms  (sugiere obstrucción significativa · <130 normal · >200 significativa) |
| pantalla · `eoa` | —  (falta Ø TSVI, VTI TSVI, VTI mitral CW) |
| pantalla · `dvi` | — |
| pantalla · `ppm` | —  (falta el AEO por continuidad) |
| pantalla · `sev` | No graduada: los cortes de válvula nativa no aplican a prótesis |
| informe · conciso | VM con prótesis biológica (AVm 0.92 cm² por THP, gradiente medio 14 mmHg, Vmax 2.6 m/s). <br> Prótesis mitral con hallazgos sugestivos de obstrucción (gradiente medio 14.0 mmHg, THP 240 ms). |
| informe · estandar | Válvula mitral con prótesis biológica (AVm 0.92 cm² por THP, gradiente medio 14 mmHg, Vmax 2.6 m/s). <br> Prótesis mitral con hallazgos sugestivos de obstrucción (gradiente medio 14.0 mmHg, THP 240 ms). |
| informe · narrativo | La válvula mitral presenta una prótesis biológica (AVm 0.92 cm² por THP, gradiente medio 14 mmHg, Vmax 2.6 m/s). <br> Prótesis mitral con hallazgos sugestivos de obstrucción (gradiente medio 14.0 mmHg, THP 240 ms). |
| EN SUMA | Prótesis mitral con hallazgos sugestivos de obstrucción (gradiente medio 14.0 mmHg, THP 240 ms). |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 15 mitral BIOLOGICA con MODELO cargado

**Sembrado (gesto real):** `vm_morf`=Prótesis biológica · `em_vmax`=2.6 · `em_gmedio`=14 · `thp`=240 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas. Modelo pedido `Medtronic Mosaic / 27`, sugerencias ofrecidas 1, quedó cargado **sí** — referencia del modelo {"pico":null,"medio":[6.1,1.33],"vpico":[2,0.28],"thp":[81,18.9],"eoa":[1.62,0.47]}, folio 60.

**Evaluador:** `significativa` · positivos `["gmed","thp"]`

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | sugiere obstrucción significativa  (gradiente medio 14.0 mmHg, THP 240 ms · 2 de 2 criterios) |
| pantalla · `vmax` | 2.60 m/s  (sugiere obstrucción significativa · <1.9 normal · ≥2.5 significativa) |
| pantalla · `gmed` | 14.0 mmHg  (sugiere obstrucción significativa · ≤5 normal · >10 significativa) |
| pantalla · `thp` | 240 ms  (sugiere obstrucción significativa · <130 normal · >200 significativa) |
| pantalla · `eoa` | —  (falta Ø TSVI, VTI TSVI, VTI mitral CW) |
| pantalla · `dvi` | — |
| pantalla · `ppm` | —  (falta el AEO por continuidad) |
| pantalla · `sev` | No graduada: los cortes de válvula nativa no aplican a prótesis |
| informe · conciso | VM con prótesis biológica (AVm 0.92 cm² por THP, gradiente medio 14 mmHg, Vmax 2.6 m/s). <br> Prótesis mitral con hallazgos sugestivos de obstrucción (gradiente medio 14.0 mmHg, THP 240 ms). |
| informe · estandar | Válvula mitral con prótesis biológica (AVm 0.92 cm² por THP, gradiente medio 14 mmHg, Vmax 2.6 m/s). <br> Prótesis mitral con hallazgos sugestivos de obstrucción (gradiente medio 14.0 mmHg, THP 240 ms). |
| informe · narrativo | La válvula mitral presenta una prótesis biológica (AVm 0.92 cm² por THP, gradiente medio 14 mmHg, Vmax 2.6 m/s). <br> Prótesis mitral con hallazgos sugestivos de obstrucción (gradiente medio 14.0 mmHg, THP 240 ms). |
| EN SUMA | Prótesis mitral con hallazgos sugestivos de obstrucción (gradiente medio 14.0 mmHg, THP 240 ms). |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 16 tricuspide BIOLOGICA solo gradiente medio 12

**Sembrado (gesto real):** `vt_morf`=Prótesis biológica · `et_gmedio`=12 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `aislado` · positivos `["gmed"]` de medidos `["gmed"]` · tipo `bio`

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | hallazgo aislado, sin veredicto  (gradiente medio 12.0 mmHg · 1 de 1 criterio) |
| pantalla · `evmax` | — |
| pantalla · `gmed` | 12.0 mmHg  (sugiere estenosis · >= 9 mmHg) |
| pantalla · `thp` | — |
| pantalla · `aeo` | — |
| pantalla · `dvi` | — |
| informe · conciso | Válvula tricúspide con prótesis biológica (gradiente medio 12 mmHg). No es posible estimar PSAP. |
| informe · estandar | Válvula tricúspide con prótesis biológica (gradiente medio 12 mmHg). No es posible estimar PSAP. |
| informe · narrativo | Válvula tricúspide con prótesis biológica (gradiente medio 12 mmHg). No es posible estimar PSAP. |
| EN SUMA | VT protésica biológica. |
| Evidencia · su sección | {"filas":[{"lbl":"Válvula tricúspide","val":"Prótesis biológica","marca":"none","nota":"las filas de válvula tricúspide nativa no aplican a una prótesis; las recomendaciones de esta sección son las de disfunción protésica","refs":["esc2025vc"]},{"lbl":"Obstrucción protésica por la Tabla 19","val":"Un solo criterio alcanzado","marca":"warn","nota":"con un solo criterio positivo la aplicación no afirma estenosis: pide dos o más","refs":["aseProtM2024"]},{"lbl":"Criterios de la Tabla 19 alcanzados" … |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 17 tricuspide BIOLOGICA con gradiente y THP 240

**Sembrado (gesto real):** `vt_morf`=Prótesis biológica · `et_gmedio`=12 · `et_thp`=240 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `estenosis` · positivos `["gmed","thp"]` de medidos `["gmed","thp"]` · tipo `bio`

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | hallazgos sugestivos de estenosis  (gradiente medio 12.0 mmHg, THP 240 ms · 2 de 2 criterios) |
| pantalla · `evmax` | — |
| pantalla · `gmed` | 12.0 mmHg  (sugiere estenosis · >= 9 mmHg) |
| pantalla · `thp` | 240 ms  (sugiere estenosis · >= 200 ms) |
| pantalla · `aeo` | — |
| pantalla · `dvi` | — |
| informe · conciso | Válvula tricúspide con prótesis biológica (gradiente medio 12 mmHg, THP 240 ms). No es posible estimar PSAP. <br> Prótesis tricúspide con hallazgos sugestivos de estenosis (gradiente medio 12.0 mmHg, THP 240 ms). |
| informe · estandar | Válvula tricúspide con prótesis biológica (gradiente medio 12 mmHg, THP 240 ms). No es posible estimar PSAP. <br> Prótesis tricúspide con hallazgos sugestivos de estenosis (gradiente medio 12.0 mmHg, THP 240 ms). |
| informe · narrativo | Válvula tricúspide con prótesis biológica (gradiente medio 12 mmHg, THP 240 ms). No es posible estimar PSAP. <br> Prótesis tricúspide con hallazgos sugestivos de estenosis (gradiente medio 12.0 mmHg, THP 240 ms). |
| EN SUMA | VT protésica biológica. <br> Prótesis tricúspide con hallazgos sugestivos de estenosis (gradiente medio 12.0 mmHg, THP 240 ms). |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 18 pulmonar BIOPROTESIS con velocidad 3,5 y gradiente medio 25

**Sembrado (gesto real):** `vp_morf`=Prótesis biológica · `vp_tipo_prot`=bio · `vp_vmax`=3.5 · `ep_gmedio`=25 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `posible` · positivos `["vmax","gmed"]` de medidos `["vmax","gmed"]` · tipo `bio`

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | posible obstrucción  (velocidad pico 3.5 m/s, gradiente medio 25.0 mmHg · 2 de 2 criterios) |
| pantalla · `vmax` | 3.5 m/s  (posible obstrucción · >= 3.2 m/s) |
| pantalla · `gmed` | 25.0 mmHg  (posible obstrucción · >= 20 mmHg) |
| informe · conciso | VP con prótesis biológica (Vmax 3.5 m/s, Gmax 49 mmHg). <br> Prótesis pulmonar con posible obstrucción (velocidad pico 3.5 m/s, gradiente medio 25.0 mmHg). |
| informe · estandar | Válvula pulmonar con prótesis biológica (Vmax 3.5 m/s, Gmax 49 mmHg). <br> Prótesis pulmonar con posible obstrucción (velocidad pico 3.5 m/s, gradiente medio 25.0 mmHg). |
| informe · narrativo | La válvula pulmonar se encuentra con prótesis biológica (Vmax 3.5 m/s, Gmax 49 mmHg). <br> Prótesis pulmonar con posible obstrucción (velocidad pico 3.5 m/s, gradiente medio 25.0 mmHg). |
| EN SUMA | VP protésica biológica. <br> Prótesis pulmonar con posible obstrucción (velocidad pico 3.5 m/s, gradiente medio 25.0 mmHg). |
| Evidencia · su sección | {"filas":[{"lbl":"Válvula pulmonar","val":"Prótesis biológica","marca":"none","nota":"las filas de estenosis pulmonar de válvula nativa no aplican a una prótesis; las recomendaciones de esta sección son las de disfunción de un conducto o de una prótesis pulmonar","refs":["acc2025achd"]},{"lbl":"Obstrucción protésica por la Tabla 15","val":"Posible obstrucción","marca":"warn","nota":"lo decide el cuadro de obstrucción protésica del formulario, que es su dueño: esta sección lo lee y no lo recalcul … |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 19 aortica TAVI con TODOS los datos normales

**Sembrado (gesto real):** `va_morf`=TAVI · `vmax_ao`=2.0 · `gmedio_ao`=12 · `diam_tsvi`=21 · `itv_tsvi`=50 · `itv_ao`=100 · `va_at`=60 · `tango_te`=300 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `TAVI`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `normal` · pDep `normal` · pIndep `normal` · PPM `no` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Sin criterios de estenosis protésica |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | Depende del flujo: velocidad pico 2 m/s y gradiente medio 12 mmHg · no depende del flujo: DVI 0.50.⚠️ Para TAVI la tabla expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo; sin ese estudio se aplican los cortes absolutos de la prótesis quirúrgica.⚠️ Volumen sistólico calculado 173 mL, fuera de los 50-90 mL que pide la nota al pie de la tabla.ⓘ Ver detallePara TAVI la Tabla 5 expresa el gradiente medio, el DVI y el área efectiva como cambio respecto de un estudio previo, con el basal definido como un estudio en condiciones hemodinámicas estables; sin … |
| pantalla · `gmedio` | 12 mmHg |
| pantalla · `dvi` | 0.50 |
| pantalla · `atet` | 0,20 — normal (< 0,32) |
| pantalla · `ppm` | 0.95 cm²/m²  (sin desajuste) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaCont` | 1.73 |
| pantalla · `avaIdx` | 0.95 cm²/m² |
| pantalla · `dviVal` | 0.50 |
| informe · conciso | VAo con prótesis transcatéter tipo TAVI, sin criterios de estenosis protésica (Vmax 2 m/s, G. medio 12 mmHg, DVI 0.50, AT 60 ms, AT/TE 0.20). |
| informe · estandar | Válvula aórtica con prótesis transcatéter tipo TAVI, sin criterios de estenosis protésica (Vmax 2 m/s, G. medio 12 mmHg, DVI 0.50, AT 60 ms, AT/TE 0.20). |
| informe · narrativo | La válvula aórtica presenta una prótesis transcatéter tipo TAVI, sin criterios de estenosis protésica (Vmax 2 m/s, G. medio 12 mmHg, DVI 0.50, AT 60 ms, AT/TE 0.20). |
| EN SUMA | Prótesis aórtica: sin criterios de estenosis protésica. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 19b aortica quirurgica BIOLOGICA con TODOS los datos normales

**Sembrado (gesto real):** `va_morf`=Prótesis biológica · `vmax_ao`=2.0 · `gmedio_ao`=12 · `diam_tsvi`=21 · `itv_tsvi`=50 · `itv_ao`=100 · `va_at`=60 · `tango_te`=300 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `normal` · pDep `normal` · pIndep `normal` · PPM `no` · área frente al modelo evaluable `false`

| superficie | texto exacto |
|---|---|
| pantalla · `veredicto` | Sin criterios de estenosis protésica |
| pantalla · `rotulo` | ⚖️ Severidad EA protésica (ASE 2024) |
| pantalla · `nota` | Depende del flujo: velocidad pico 2 m/s y gradiente medio 12 mmHg · no depende del flujo: DVI 0.50.⚠️ Volumen sistólico calculado 173 mL, fuera de los 50-90 mL que pide la nota al pie de la tabla.ⓘ Ver detalleEl área efectiva no se evalúa: la Tabla 5 la expresa en desviaciones estándar respecto del valor de referencia del MODELO implantado, y en este estudio no hay un modelo del catálogo cargado —se carga con el botón «Modelo y tamaño»—. El DVI queda como único eje independiente del flujo.La nota al pie de la tabla exige un volumen sistólico de 50-90 mL para que la velocidad pico valga, y el c … |
| pantalla · `gmedio` | 12 mmHg |
| pantalla · `dvi` | 0.50 |
| pantalla · `atet` | 0,20 — normal (< 0,32) |
| pantalla · `ppm` | 0.95 cm²/m²  (sin desajuste) |
| pantalla · `botonModelo` | Modelo y tamaño |
| pantalla · `avaCont` | 1.73 |
| pantalla · `avaIdx` | 0.95 cm²/m² |
| pantalla · `dviVal` | 0.50 |
| informe · conciso | VAo con prótesis biológica, sin criterios de estenosis protésica (Vmax 2 m/s, G. medio 12 mmHg, DVI 0.50, AT 60 ms, AT/TE 0.20). |
| informe · estandar | Válvula aórtica con prótesis biológica, sin criterios de estenosis protésica (Vmax 2 m/s, G. medio 12 mmHg, DVI 0.50, AT 60 ms, AT/TE 0.20). |
| informe · narrativo | La válvula aórtica presenta una prótesis biológica, sin criterios de estenosis protésica (Vmax 2 m/s, G. medio 12 mmHg, DVI 0.50, AT 60 ms, AT/TE 0.20). |
| EN SUMA | Prótesis aórtica: sin criterios de estenosis protésica. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 20 mitral BIOLOGICA con TODOS los datos normales

**Sembrado (gesto real):** `vm_morf`=Prótesis biológica · `em_vmax`=1.5 · `em_gmedio`=3 · `thp`=100 · `em_dtsvi`=21 · `em_vtitsvi`=50 · `em_vtimit`=55 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `normal` · positivos `[]` · PPM `no`

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | sin criterios de obstrucción  (4 criterios medidos) |
| pantalla · `vmax` | 1.50 m/s  (sin criterios de obstrucción · <1.9 normal · ≥2.5 significativa) |
| pantalla · `gmed` | 3.0 mmHg  (sin criterios de obstrucción · ≤5 normal · >10 significativa) |
| pantalla · `thp` | 100 ms  (sin criterios de obstrucción · <130 normal · >200 significativa) |
| pantalla · `eoa` | 3.15 cm²  (sin criterios de obstrucción) |
| pantalla · `dvi` | 1.10  (sin criterios de obstrucción) |
| pantalla · `ppm` | 1.73 cm²/m²  (sin desajuste) |
| pantalla · `sev` | No graduada: los cortes de válvula nativa no aplican a prótesis |
| informe · conciso | VM con prótesis biológica (AVm 3.15 cm² por continuidad, AVm 2.2 cm² por THP, gradiente medio 3 mmHg, Vmax 1.5 m/s). |
| informe · estandar | Válvula mitral con prótesis biológica (AVm 3.15 cm² por continuidad, AVm 2.2 cm² por THP, gradiente medio 3 mmHg, Vmax 1.5 m/s). |
| informe · narrativo | La válvula mitral presenta una prótesis biológica (AVm 3.15 cm² por continuidad, AVm 2.2 cm² por THP, gradiente medio 3 mmHg, Vmax 1.5 m/s). |
| EN SUMA | Válvula mitral con prótesis biológica (AVm 3.15 cm² por continuidad, AVm 2.2 cm² por THP, gradiente medio 3 mmHg, Vmax 1.5 m/s). |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 21 tricuspide BIOLOGICA con TODOS los datos normales

**Sembrado (gesto real):** `vt_morf`=Prótesis biológica · `et_gmedio`=3 · `et_thp`=120 · `et_e_vmax`=90 · `et_vti_diast`=30 · `itv_tsvi`=50 · `tsvd_diametro`=25 · `vti_tsvd`=18 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `sin` · positivos `[]` de medidos `["evmax","gmed","thp","aeo","dvi"]` · tipo `bio`

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | sin criterios de estenosis  (5 criterios medidos) |
| pantalla · `evmax` | 90 cm/s  (no alcanza el criterio · >= 210 cm/s) |
| pantalla · `gmed` | 3.0 mmHg  (no alcanza el criterio · >= 9 mmHg) |
| pantalla · `thp` | 120 ms  (no alcanza el criterio · >= 200 ms) |
| pantalla · `aeo` | 2.95 cm²  (no alcanza el criterio · < 1.5 cm²) |
| pantalla · `dvi` | 0.60  (no alcanza el criterio · >= 3.3) |
| pantalla · `dviCampo` | 0.60 |
| informe · conciso | Válvula tricúspide con prótesis biológica (gradiente medio 3 mmHg, THP 120 ms, área valvular 2.95 cm²). No es posible estimar PSAP. |
| informe · estandar | Válvula tricúspide con prótesis biológica (gradiente medio 3 mmHg, THP 120 ms, área valvular 2.95 cm²). No es posible estimar PSAP. |
| informe · narrativo | Válvula tricúspide con prótesis biológica (gradiente medio 3 mmHg, THP 120 ms, área valvular 2.95 cm²). No es posible estimar PSAP. |
| EN SUMA | VT protésica biológica. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 22 pulmonar BIOPROTESIS con TODOS los datos normales

**Sembrado (gesto real):** `vp_morf`=Prótesis biológica · `vp_tipo_prot`=bio · `vp_vmax`=2.0 · `ep_gmedio`=8 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `sin` · positivos `[]` de medidos `["vmax","gmed"]` · tipo `bio`

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | sin criterios de obstrucción  (2 criterios medidos) |
| pantalla · `vmax` | 2.0 m/s  (no alcanza el criterio · >= 3.2 m/s) |
| pantalla · `gmed` | 8.0 mmHg  (no alcanza el criterio · >= 20 mmHg) |
| informe · conciso | VP con prótesis biológica (Vmax 2 m/s, Gmax 16 mmHg). |
| informe · estandar | Válvula pulmonar con prótesis biológica (Vmax 2 m/s, Gmax 16 mmHg). |
| informe · narrativo | La válvula pulmonar se encuentra con prótesis biológica (Vmax 2 m/s, Gmax 16 mmHg). |
| EN SUMA | VP protésica biológica. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 23a pulmonar MECANICA (no gradua)

**Sembrado (gesto real):** `vp_morf`=Prótesis mecánica · `vp_vmax`=3.5 · `ep_gmedio`=25 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis mecánica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `null` · positivos `[]` de medidos `[]` · tipo `null` · motivo «No graduada: la guía no publica cortes para una prótesis pulmonar mecánica»

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | No graduada: la guía no publica cortes para una prótesis pulmonar mecánica |
| pantalla · `vmax` | — |
| pantalla · `gmed` | — |
| informe · conciso | VP con prótesis mecánica (Vmax 3.5 m/s, Gmax 49 mmHg). |
| informe · estandar | Válvula pulmonar con prótesis mecánica (Vmax 3.5 m/s, Gmax 49 mmHg). |
| informe · narrativo | La válvula pulmonar se encuentra con prótesis mecánica (Vmax 3.5 m/s, Gmax 49 mmHg). |
| EN SUMA | VP protésica mecánica. |
| Evidencia · su sección | {"filas":[{"lbl":"Válvula pulmonar","val":"Prótesis mecánica","marca":"none","nota":"las filas de estenosis pulmonar de válvula nativa no aplican a una prótesis; las recomendaciones de esta sección son las de disfunción de un conducto o de una prótesis pulmonar","refs":["acc2025achd"]},{"lbl":"Obstrucción protésica por la Tabla 15","val":"—","marca":"ask","nota":"se calcula en el cuadro de obstrucción protésica del formulario","refs":["aseProtM2024"]},{"lbl":"Insuficiencia pulmonar","val":"—","m … |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 23b pulmonar PERCUTANEA (no gradua)

**Sembrado (gesto real):** `vp_morf`=Prótesis biológica · `vp_tipo_prot`=perc · `vp_vmax`=3.5 · `ep_gmedio`=25 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `null` · positivos `[]` de medidos `[]` · tipo `null` · motivo «No graduada: la guía no publica cortes para una prótesis pulmonar percutánea»

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | No graduada: la guía no publica cortes para una prótesis pulmonar percutánea |
| pantalla · `vmax` | — |
| pantalla · `gmed` | — |
| informe · conciso | VP con prótesis biológica (Vmax 3.5 m/s, Gmax 49 mmHg). |
| informe · estandar | Válvula pulmonar con prótesis biológica (Vmax 3.5 m/s, Gmax 49 mmHg). |
| informe · narrativo | La válvula pulmonar se encuentra con prótesis biológica (Vmax 3.5 m/s, Gmax 49 mmHg). |
| EN SUMA | VP protésica biológica. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

### Escena 23c pulmonar SIN TIPO elegido (no gradua)

**Sembrado (gesto real):** `vp_morf`=Prótesis biológica · `vp_vmax`=3.5 · `ep_gmedio`=25 · peso 70 kg, talla 170 cm.

**Denominador:** morfología quedó en `Prótesis biológica`; el evaluador respondió sí; las cuatro secciones de Válvulas quedaron abiertas.

**Evaluador:** `null` · positivos `[]` de medidos `[]` · tipo `null` · motivo «No graduada: falta el tipo de prótesis pulmonar»

| superficie | texto exacto |
|---|---|
| pantalla · `obstr` | No graduada: falta el tipo de prótesis pulmonar |
| pantalla · `vmax` | — |
| pantalla · `gmed` | — |
| informe · conciso | VP con prótesis biológica (Vmax 3.5 m/s, Gmax 49 mmHg). |
| informe · estandar | Válvula pulmonar con prótesis biológica (Vmax 3.5 m/s, Gmax 49 mmHg). |
| informe · narrativo | La válvula pulmonar se encuentra con prótesis biológica (Vmax 3.5 m/s, Gmax 49 mmHg). |
| EN SUMA | VP protésica biológica. |
| Evidencia · su sección | igual que la escena anterior de esta válvula |

**Hipótesis del médico —que el papel diga «sin datos suficientes»—: NO se reproduce.**

---

## 2.X · Las cuatro mediciones aparte

### X1 · UNA TAVI CON DESAJUSTE SEVERO SALE «NORMOFUNCIONANTE» EN EL PAPEL

Escena: `va_morf` = `TAVI`, `diam_tsvi` = 16, `itv_tsvi` = 40, `itv_ao` = 100, peso 70, talla 170.
**Sin velocidad pico y sin gradiente medio** —el DVI queda en 0,40, normal, y el área indexada en
0,44 cm²/m², desajuste severo—.

Medido: `nivel` = `faltan`, `niveles` = `{vmax:null, atet:null, at:null, gmed:null, dvi:'normal',
eoa:null}`, `ppm` = `'severo'`, `avai` = 0,44, **`normoTavi` = `true`**,
`normoFrase` = `'normofuncionante (DVI 0.40)'`.

El informe firmado, narrativo, dos renglones seguidos, textual:

> La válvula aórtica presenta una prótesis transcatéter tipo TAVI normofuncionante (DVI 0.40).
> Desajuste protésico-paciente aórtico severo (AEO indexada 0.44 cm²/m²).

Y el EN SUMA, textual:

> TAVI normofuncionante.
> PPM aórtico severo.

**Por qué pasa, medido:** la guarda de `normoTavi` recorre `P.niveles`, y **el PPM no es una clave
de `P.niveles`** —viaja en `P.ppm`—; y la oración del desajuste sale de un `if` cuya única
condición sobre el veredicto es `nivel !== 'signif'`, que con `faltan` se cumple. Las dos frases
son correctas por separado y se contradicen juntas.

### X2 · CONTROL NEGATIVO — la válvula aórtica NATIVA con los mismos números

Escena: `va_morf` = `Trivalva normal`, `vmax_ao` = 4.5, `gmedio_ao` = 45.
`eaProtVeredicto()` devuelve **`null`** y la cascada nativa grada normalmente:

> Válvula aórtica trivalva normal, con estenosis severa, sin insuficiencia (Vmax 4.5 m/s, Gmedio 45 mmHg).

O sea que la sonda **distingue escenarios** y no está diciendo que sí a todo: ninguna de las frases
protésicas aparece en una válvula nativa.

### X3 · GUARDADOS — el viaje completo de la escena del médico

Guardado por `guardarInforme` con la tarjeta de severidades confirmada (`#rev-confirm`), reabierto
por `cargarEstudioPorId`, y el estudio borrado al terminar. Resultado: `ok: true`, la morfología
vuelve en `TAVI`, los dos valores vuelven en 4.5 y 45, `nivel` vuelve en `faltan`, y el informe
reabierto publica **el mismo texto, palabra por palabra**:

> Válvula aórtica con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica (Vmax 4.5 m/s, G. medio 45 mmHg).

Y el EN SUMA reabierto, idéntico: es la línea del cuerpo reusada, porque con `faltan` el `resumen`
es `null`.

### X4 · LA CÁPSULA DE PANTALLA NO SE REPINTA AL ELEGIR EL MODELO

Lo destapó la escena 12 y se midió aparte, con su control. Escena: prótesis mecánica, velocidad
4,5, gradiente medio 45, Ø TSVI 16 mm, VTI 40/100 —DVI 0,40, normal— y después se carga
`Abbott Epic 27` (referencia 1,6 ± 0,4 cm², folio 53), que deja el área medida de 0,80 cm² a
**−2,0 DE**.

| momento | `eaProtVeredicto().nivel` | la cápsula `#ea-det-sev` dice |
|---|---|---|
| antes de cargar el modelo | `posible` | «Posible estenosis protésica» |
| **después de elegir el modelo** | **`signif`** | **«Posible estenosis protésica»** |
| después de volver a tipear la velocidad | `signif` | **«Posible estenosis protésica»** |
| llamando `calcEADetalle()` a mano | `signif` | «Sugiere estenosis protésica significativa» |

Y mientras la cápsula dice «Posible», **el informe firmado ya dice «con criterios que sugieren
estenosis protésica significativa»** y el plegable «Ver detalle» sigue publicando «El área efectiva
no se evalúa: … en este estudio no hay un modelo del catálogo cargado». El recuadro
`caja-esten-aortica` estaba **visible** en los cuatro momentos, así que no es una medición sobre un
contenedor cerrado.

**La causa, medida y no deducida:** `vModElegir` termina con
`if (typeof vModTrasElegir === 'function') vModTrasElegir(pos)`, y **`vModTrasElegir` no existe en
el archivo** —censado: dos llamadas guardadas, cero definiciones—, así que nada llama a
`calcEADetalle`, que es quien llama a `_eaProtPintar`. Llamarla a mano pone la cápsula de acuerdo,
que es lo que separa «falta un repintado» de «hay dos criterios distintos».

**Esto no se corrige en esta tanda** (es de solo lectura). Queda en `docs/PENDIENTES.md` →
**PRO-c**.

---

## 2.9 · Lo que la batería corrige de la sección 1

Dos cosas que la lectura del código dejó incompletas y la medición precisó:

1. **La prótesis MITRAL con UN solo criterio positivo publica `'posible'`, no `'normal'`**, y su
   cápsula escribe **«hallazgo aislado — posible obstrucción  (gradiente medio 14.0 mmHg · 1 de 1
   criterio)»**. La tabla de la sección 1.3 decía «uno positivo, o ninguno → `posible` / `normal`»
   sin separar los dos textos.
2. **La fila de la velocidad pico mitral publica un veredicto que NO vota.** Con la velocidad en
   2,60 m/s la fila dice «sugiere obstrucción significativa», y el renglón de abajo dice «hallazgo
   aislado — posible obstrucción  (… 1 de 1 criterio)»: la fila grada con la Tabla 11 y el conteo
   la excluye a propósito, que es lo que el comentario del código declara. El médico ve un «sugiere
   significativa» que no está en el denominador del veredicto.

Ninguna de las dos se cambia acá.
