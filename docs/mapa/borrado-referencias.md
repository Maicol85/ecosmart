# Un campo VACÍO es SIN DATO — el dueño común de las referencias

> Tanda **ARR** (2026-10-18). Lo que esta página contesta: **por qué una referencia conservaba el
> resultado del valor anterior al borrar el dato**, dónde vive hoy el `else` que la devuelve a la
> raya, y qué campos estaban afectados.
>
> Lo demás de la tanda está en `docs/mapa/fop-burbuja-unificado.md` (el FOP, el test de burbuja y
> el aneurisma del septum). El Ar−A está en `docs/mapa/diastolica.md` y el DVI tricuspídeo
> automático en `docs/mapa/protesis-tri-pulm.md`.

---

## La regla, en una línea

**Un campo vacío o no numérico es SIN DATO.** Toda referencia, pastilla, cápsula, tarjeta ⓘ,
informe, EN SUMA, PDF, PPT y fila del Laboratorio que dependa de él vuelve a «—» (o a su texto de
«sin datos»), y **nunca** trata el vacío como cero ni conserva el resultado del valor anterior.
Una referencia con rango —«valor fuera de rango (10-90 mm)»— sólo se evalúa cuando HAY un número.

## El dueño común: `refSync` y `refTxt`

Viven juntas, al lado de `badge()`.

| función | escribe | la usan |
|---|---|---|
| `refSync(id, html)` | `innerHTML` con contenido, **`textContent` con la raya** | los llamadores que pasan un badge ya armado por `badge()` |
| `refTxt(id, txt)`   | `textContent` siempre | las tres celdas del cuadro del Doppler |
| `REF_SIN_DATO`      | `'—'` (em dash) | las dos |

**Son dos funciones hermanas y no una con un flag.** `badge()` escapa su texto; un solo nombre con
un flag hace que el día que alguien se equivoque de flag un texto sin escapar entre como HTML, y
el escape de esta app es manual: **no hay CSP de respaldo**.
⚠️ **La raya va SIEMPRE por `textContent`, también dentro de `refSync`:** es el único camino que
no pasa por `innerHTML`, así que el estado «sin dato» no puede introducir marcado por un descuido.

---

## Las DOS causas, y la segunda no estaba reportada

### (A) el `if (dato)` que SÓLO PINTA

| sitio | qué pasaba |
|---|---|
| `calcAorta` | recorría `aoSegsMedidos()`, que **filtra** los segmentos sin dato (`if (!x) return null` + `.filter(Boolean)`), así que el `forEach` nunca llegaba a los vacíos. Hoy recorre `AO_SEGS` completo. **`aoSegsMedidos` no se toca:** lo consumen el narrativo, el PDF y la tarjeta ⓘ, y ahí filtrar está bien. |
| `calcVD` | `if (tapse)` y `if (sp)` sin `else`. Era el defecto **V1** de `PENDIENTES.md`, declarado en su propio comentario desde el VS2. |
| `calcAD` | `if (!ad) return;` se llevaba **dos** cosas: la cápsula del área **y** la llamada a `calcHTP2022`. |
| `diastCeldasBasicas` y `calcDiastolBSE2024` | las tres celdas (`ea-val`, `eprom-val`, `ee-val`), con DOS condiciones distintas que **se conservan byte por byte**: el primero exige los dos anillos, el segundo acepta uno. |
| `calcIT_ESC` | `if (densidad)` protegía el **voto** pero no repintaba la fila. |

### (B) el DISPARADOR que falta — la función tiene su `else` y nadie se la llama

| sitio | qué pasaba |
|---|---|
| `calcPSAP` | su rama de `return` temprano llamaba a `vdTapsePsapSync`, `calcTEP` y `calcIP` —las tres agregadas antes por este mismo motivo— y **no** a `calcHTP2022`. Era el **cuarto** caso del mismo patrón. |
| `calcBSA` | su rama sin peso ni talla llama a nueve funciones y **no** a `calcAI` ni `calcVI`. |

---

## Los once campos que fallaban

| campo | span que conservaba | zona | desde |
|---|---|---|---|
| `ao_sin` | `ao-interp` | aorta | `95659c6`, 14/09/2026 |
| `ao_st` | `ao-st-interp` | aorta | ídem |
| `ao_tub` | `ao-tub-interp` | aorta | ídem |
| `diam_cayado` | `ao-cay-interp` | aorta | ídem |
| `diam_ao_toracica` | `ao-desc-interp` | aorta | ídem |
| `tapse` | `tapse-interp` | VD | `c94d48d`, 13/07/2026 |
| `s_prime` | `sprime-interp` | VD | ídem |
| `ad_area` | `ad-interp` **y** `htp2022-catC` | AD | ídem |
| `e_sep` / `e_lat` | `eprom-val` | Doppler | ídem |
| `it_densidad` | `it-densidad-interp` | válvulas (también protésica) | ídem |
| el **peso** | `ai-idx` y `ai-interp` | AI | `calcBSA`, preexistente |
| `vmax_it` | `htp2022-prob` y `htp2022-vrt-interp` | HTP | `calcPSAP`, preexistente |

⚠️ **NINGUNA la trajo LS, VS, VAL, PRO, PRO-B, PRO-C, CORTOS ni Q**, y por eso **no «volvió» nada**:
lo que se arregló en su momento —el THP de la estenosis mitral en el W2-A, y la IM, la IAo, la EAo
y la IT en la tanda del borrado en Válvulas— fue **otro** conjunto de campos con el mismo patrón.
La falla más nueva es del **14/09/2026**. Lo que esas tandas sí hicieron fue **crecer la zona**: el
VS2 reescribió el `if` del TAPSE y dejó el defecto declarado en su propio comentario.

## El síntoma tiene DOS caras y es el mismo defecto

- **Backspace dígito por dígito** → queda el **último valor intermedio**: el «4» de «46», que cae
  por debajo del mínimo de la banda y hace que la fila diga «Valor fuera de rango (10-90 mm)» con
  el campo vacío. De ahí la lectura de «el vacío se lee como cero».
- **Seleccionar todo y Delete** → queda el grado del **valor original**: «Dilat. moderada», «14 mm
  — disfunción sistólica leve», «22 cm² — dilatación leve».

## Lo que NO arrastraba

Medido base → cargar → borrar → medir, en los dos árboles: el **informe** en los tres estilos, el
**EN SUMA**, el **Excel** (440 columnas, clave por clave), el **PDF** en sus **seis** plantillas
generadas de verdad, el **PDF de auditoría** (104 textos), el **Laboratorio** por sus ocho
funciones dueñas y la **vista 2D**. **El defecto era sólo de pantalla.**

Lo que **sí** arrastraba, además de las cápsulas, eran **cuatro tarjetas ⓘ**, y se curaron por
construcción porque leen el `textContent` de la cápsula: `tarj-insuf-tricuspide` («Densidad jet CW
Severa — jet denso/triangular»), `ad-card` («2 cm² — normal (<19 cm²)»), `vd-fun-card` («1 mm —
disfunción sistólica severa») y `ao-card` («Valor fuera de rango (10-90 mm)»).

---

## Cómo se mide — `scripts/_probe_arr.mjs`

| grupo | qué hace |
|---|---|
| `censo` | por campo: limpiar → **calentar** → snapshot de TODAS las referencias → tipear → borrar → snapshot. **Es un censo y no una lista**: no hay que saber qué span depende de qué campo, se descubre midiendo. |
| `censo2` | las otras dos formas de borrar (seleccionar todo + Delete, y cambiar el valor por otro). |
| `pares` | las referencias que necesitan DOS o más campos: se carga la base y se borra UNO. |
| `escenas` | válvulas y prótesis, cuya referencia sólo se pinta con compañeros cargados. |
| `salida` / `sal2` / `qtar` | las seis superficies de salida y las once tarjetas ⓘ. |
| `ab` | el A/B de control en tres escenas. |

## ⚠️ Cinco trampas del medidor, y cuatro daban falsos plausibles

1. **EL DENOMINADOR NO ES EL FORMULARIO RECIÉN CARGADO** sino «el formulario vacío con los cálculos
   YA CORRIDOS». Sin `calentar()`, la base tiene los span en la raya porque nadie los pintó nunca y
   tras tipear y borrar quedan con su propio texto de «sin datos» —«Requiere IC + PCP estimada»,
   «No evaluado», «Incompleto — ASE 2025»—, que **no es el defecto**. La primera corrida informó
   **39 de 41 campos fallando** por esto solo.
2. **EN EL GRUPO `pares` EL DENOMINADOR TAMPOCO ES EL VACÍO** sino «la misma base MENOS el campo
   sacado, cargada desde limpio». Comparar contra el vacío informa como defecto todo span que
   refleje un campo que **sigue cargado** —el peso, la talla, la VCI, el e′—: dio 9 de 18
   «fallando» y siete eran eso.
3. **EL SPAN VACÍO DICE UN EM DASH (U+2014) Y NO UN GUIÓN.** Comparar contra `'-'` dejaba los tres
   controles negativos en rojo sobre un árbol perfecto.
4. **TRES ESCENAS CON `pinto = 0`**, o sea un denominador vacío con pinta de medición buena: la
   fila del espesor parietal relativo no se pinta sin la masa, que pide también el SIV; la onda E
   tricuspídea sólo existe con morfología protésica y su veredicto pide DOS criterios; y la fuga
   paravalvular tiene dos compuertas y necesita el origen consignado.
5. **LOS GLOBOS ⓘ VIVEN EN CINCO PESTAÑAS** y las cuatro secciones de válvula nacen cerradas con
   sus ocho cajones «Datos»: sin abrir la puerta del PROPIO botón los once miden 0 × 0 y la lectura
   informa «SIN GEOMETRIA» sobre globos que el médico ve. Va con los toggles REALES
   (`showTab`, `toggleEteSeccion`, `valvDatosTog`, `toggleCard`, `secToggle`) y **no** con un
   `display` vacío a mano, que la regla del celular le gana con `!important`.
   ⚠️ **`tapse-psap` queda sin medir y es correcto:** su fila nace en `display:none` y sólo se
   dibuja con cociente.

## Lo que queda declarado

- **`vd-tam-card`** no se movió con la carga del censo de tarjetas, así que su «volvió» no tiene
  denominador propio. No arrastraba en ninguno de los dos árboles.
- **El PPT informa 21 → 0 en los DOS árboles**, así que es del medidor y no del árbol: es el
  denominador flojo que `CLAUDE.md` ya tiene escrito para `_labPPTGenerar` sobre población vacía.
- **`vab-fr`, `ete-shunt-ddvii` y `pop-eco-src`** aparecen en el grupo `pares` en la dirección
  CONTRARIA —el camino de borrado deja **más** limpio que la recarga— y son **idénticos en los dos
  árboles**: es que la recarga tipea en otro orden y esos módulos ajenos se quedan atrás.
