# El score de WILKINS, con un solo cálculo — tanda «Wilkins» (2026-10-16)

Mapa de la zona. **Por nombre de función y de id, no por número de línea.**

> Los cortes no se tocaron. Lo que se unificó es **quién calcula** y **qué publica cada pantalla**.

---

## 1 · El problema: dos implementaciones del mismo score

| | tarjeta de **ETE** | pestaña **Calculadoras** |
|---|---|---|
| sección | `ete-seccion-wilkins` | tarjeta `cx-wilkins`, en `tab-calculadoras` |
| campos | `wilkins_movilidad` · `_engrosamiento` · `_calcificacion` · `_subvalvular` | `cx_wilk_mov` · `_eng` · `_cal` · `_sub` |
| centinela | el **`0`** de fábrica de sus cuatro `<option>` | la **cadena vacía** |
| pintor | `calcWilkins` | `cxWilkins` |
| formato | `9 / 16` y el badge en su propia fila | `9/16` con el badge al lado |

**Medido en HEAD, combinación por combinación** (las ocho de la sonda):

| entradas | ETE | Calculadoras |
|---|---|---|
| `0/0/0/0` y `—/—/—/—` | «—» | «—» |
| **`1/1/1/1`** | **4/16 favorable** | **sin puntuar — reingresá los cuatro criterios** |
| `2/2/2/2` | 8/16 Favorable para valvuloplastia percutánea | idem |
| `3/2/2/2` y `3/3/3/2` | El score no predice el resultado | idem |
| **`3/3/3/3` y `4/4/4/4`** | **No favorable para valvuloplastia** | **desfavorable para valvuloplastia** |
| **parcial de tres** | **«Score incompleto — 3 de 4 criterios puntuados. No se interpreta: faltan criterios y el total quedaría sesgado a favorable.»** | **«parcial — 3 de 4 criterios; sin interpretación»** |

O sea: **tres divergencias** —el dominio del centinela y dos textos— sobre cortes que ya coincidían.

---

## 2 · Las piezas, por nombre

| Pieza | Qué hace |
|---|---|
| `_wilkCalc(crudos, delib)` | **la regla, PURA**: cuatro valores crudos y la marca → total, puntuados, banda |
| `wilkinsScore(src)` | el lector de la **pantalla**. `src` es `'ete'` (por omisión) o `'cx'` |
| `wilkinsScoreDeCampos(campos, src)` | el lector de un estudio **archivado**. Lo usa la columna del Excel |
| `wilkDeliberado(src)` / `wilkMarcarGesto(ev, src)` / `wilkLimpiarMarca()` | la marca |
| `calcWilkins` / `cxWilkins` | **sólo pintan**, cada una con su formato |
| `WILK_CAMPOS` · `WILK_MARCA` · `WILK_TXT_*` · `WILK_9_11` · `wilkTxtParcial` | los ids y los textos |

⚠️ **LA REGLA SALE A FUNCIÓN PROPIA PORQUE TIENE DOS LECTORES CON DOS FUENTES DISTINTAS**: la
pantalla y un estudio archivado. Reimplementarla del lado del Excel es la trampa de la fórmula
duplicada que este repo ya pagó con el bloque diastólico. Mismo patrón que `emContFueraBanda(src)`.

⚠️ **LAS CONSTANTES VIVEN CON `WILK_9_11`, ~3.800 LÍNEAS ANTES DE LAS FUNCIONES, y no al lado de
ellas.** `_autosaveInit` llama a `calcWilkins()` durante la carga; un `var` se iza con valor
`undefined`, así que declaradas junto a `wilkinsScore` el badge del arranque habría dicho
«undefined» sobre un estudio restaurado. Es exactamente la razón que el comentario de `WILK_9_11` ya
documentaba. Las funciones son declaraciones de función y se izan enteras.

---

## 3 · Los cinco estados de la banda

| Estado | `banda` | Cuándo | Qué publica |
|---|---|---|---|
| sin puntuar | `''` | ningún criterio con valor | «—» |
| **1/1/1/1 sin marca** | `''` + `reingresar` | los cuatro en `1` y sin gesto | «sin puntuar — reingresá los cuatro criterios» |
| parcial | `'incompleto'` | uno, dos o tres puntuados | el total y el texto que explica el sesgo |
| favorable / subóptimo / no favorable | las tres | los cuatro puntuados | el total y su badge |

`interpretable` es `true` sólo en las tres últimas. **Es lo que miran los consumidores que antes
preguntaban por `puntuados === 4`**, que con un 1/1/1/1 de fábrica daba cuatro y un veredicto.

**Los cortes NO se movieron:** `≤8` favorable · `9-11` «El score no predice el resultado» · `>11` «No
favorable para valvuloplastia». Verificados en `docs/fuentes/FUENTES.md` → `wilkins1988` (las dos
bandas extremas y el 9-11, artículo original, p. 307) y el `>8` de la ESC/EACTS 2025, que **no se
atribuye a Wilkins**.

---

## 4 · La marca de «puntuado a propósito» (opción C)

Dos campos ocultos: **`wilkins_delib`** y **`cx_wilk_delib`**.

- La escribe **`wilkMarcarGesto`** y sólo con `ev.isTrusted === true`.
- **Asignar `.value` no dispara ningún evento**, así que restaurar un estudio no la pone; y un
  `change` despachado por código llega con `isTrusted` en `false`.
- **Viaja con el estudio**: es un `input` con id y el barrido de `guardarInforme` lo toma.
- **NO agrega ninguna columna al Excel**, que es una **lista declarada** y no un barrido.
- `limpiarCampos` la borra **explícitamente**: es `type="hidden"` y el barrido de esa función sólo
  alcanza a `input[type=text]` y `input[type=number]`.

⚠️ **SON DOS MARCAS Y NO UNA, y es una diferencia declarada con la letra de la orden.** Con una sola,
tocar un criterio del Wilkins de **ETE** habría validado el `1/1/1/1` **legado de Calculadoras** del
mismo estudio, o sea habría fabricado ahí el veredicto que esta regla viene a evitar.

⚠️ **LA FLECHA NO CAMBIA UN `<select>` CERRADO EN NINGUNO DE LOS DOS MOTORES** —medido: el valor no se
mueve y no hay ni un `change`—. El gesto real que sí funciona es la **búsqueda por letra**: tipear el
primer carácter de una opción la elige y despacha un `change` con `isTrusted` en `true`. Y
`selectOption` de Playwright lo despacha con `isTrusted` en **false**, que es el control negativo de
que la guarda distingue el gesto del código.

---

## 5 · Dónde se consume el Wilkins, y qué cambia

| Consumidor | Qué lee | Cambió |
|---|---|---|
| **informe narrativo** (bloque de morfología mitral) | el `textContent` de `#wilkins-total`, con `parseInt` | **sí**, sólo en 1/1/1/1 sin marca |
| **PDF de ETE** (`amiloTextoWilkins`) | `#wilkins-total`, `#wilkins-interp` y su `dataset.banda` | **sí**, lo mismo |
| **PDF de Calculadoras** (`cxWilkinsPDF`) | reconstruía su propia compuerta; hoy pregunta `interpretable` | sí, por coherencia |
| **Excel**, columna `Score Wilkins total` | contaba por su cuenta; hoy `wilkinsScoreDeCampos` | **sí**, lo mismo |
| **panel de Evidencia**, fila «Score ecocardiográfico» | `wilkinsScore()`; su gate pasó a `interpretable` | sí (sólo pantalla) |
| **Laboratorio**, `_labWilkinsResumen` | `_labNum(i, k) > 0` sobre registros archivados | **NO** |
| **EN SUMA** | nada: no nombra el Wilkins | no |

**LA ÚNICA ESCENA QUE CAMBIA ES EL `1/1/1/1` SIN MARCA**, medida en las tres superficies:

| | HEAD | hoy |
|---|---|---|
| informe | «Score de Wilkins 4/16» | **sin línea** (y sin la oración de morfología, si era su único dato) |
| PDF de ETE | «4 / 16» + «Favorable para valvuloplastia percutánea» + la salvedad | «no calculado» + «sin puntuar — reingresá los cuatro criterios» |
| Excel | `4` | `''` |

Las otras cuatro escenas medidas —1/1/1/1 **con** marca, 3/2/2/2, 3/3/3/3 y sin puntuar— salen
**idénticas a HEAD** en las tres. **No se migra ningún estudio guardado**: lo que cambia es cómo se
LEE un 1/1/1/1 de fábrica.

⚠️ **EL LABORATORIO SIGUE CONTANDO UN 1/1/1/1 LEGADO COMO UN SCORE COMPLETO DE 4**, y queda
declarado: el Laboratorio está en los NO TOQUES de la orden. `docs/PENDIENTES.md` → Y3b-3.

⚠️ **EL DESGLOSE DEL PDF DE ETE SIGUE LISTANDO LOS CUATRO «1 / 4»** cuando el total dice «no
calculado». Es factual —son los valores que el estudio trae— pero convive con un total que no se
interpreta. `docs/PENDIENTES.md` → Y3b-4.

---

## 6 · Trampas

1. ⚠️ **UNA `var` DECLARADA DESPUÉS DE SU PRIMER LLAMADOR SE IZA CON `undefined`.** Ver la sección 2.
2. ⚠️ **LA TARJETA DE CALCULADORAS NACE PLEGADA Y DENTRO DE OTRA PESTAÑA.** Sin `showTab('calculadoras')`
   **y** `toggleCard('cx-wilkins')` sus cuatro `<select>` miden 0×0 y un gesto real no tiene dónde
   aterrizar: la primera corrida de la sonda informó «el gesto no pone la marca» sobre un `<select>`
   que nunca se enfocó.
3. ⚠️ **`limpiarCampos` NO BORRA UN `input[type=hidden]`.** Su barrido es `input[type=text]` e
   `input[type=number]`. La marca se borra con una llamada explícita.
4. ⚠️ **EL PINTOR Y LA REGLA SON DOS COSAS.** `calcWilkins` y `cxWilkins` no deciden nada: si alguna
   vuelve a decidir, las dos pantallas se separan otra vez.
