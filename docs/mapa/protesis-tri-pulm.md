# Mapa — la OBSTRUCCIÓN de las prótesis TRICÚSPIDE y PULMONAR (tanda «PRO-C», 2026-10-17)

Lo que esta tanda agregó: un veredicto protésico propio para las dos válvulas que hasta hoy
publicaban `PROT_SIN_GRADO_TXT` y nada más. **No toca la regurgitación de ninguna de las dos**
(ver «La regurgitación no se movió» abajo), ni la prótesis mitral, ni la aórtica, ni la TAVI, ni
las válvulas nativas, ni el Excel, que sigue en **440 columnas**.

Para la tanda PRO (cociente VTI mitral, jet/TSVI y FR aórticos protésicos, reverso de la TAVI) →
`docs/mapa/protesis-pro.md`. Para la fuga paravalvular → `docs/mapa/protesis-fuga-pvl.md`. Para
las Tablas 7, 11 y 12 y el PPM → `docs/mapa/protesis-valvular.md`.

---

## 1 · El reparto: `calcET` y `calcVP` NO cambiaron

Es el mismo que la prótesis **mitral** ya usaba y el que hace que esta tanda sea de bajo riesgo:

| superficie | qué dice con prótesis |
|---|---|
| `et-sev` / `ep-sev` / `vp-sev-badge` | `PROT_SIN_GRADO_TXT`, **sin cambios** |
| `#bloque-prot-vt-res` / `#bloque-prot-vp-res` | el veredicto protésico, **nuevo** |

`PROT_SIN_GRADO_TXT` («No graduada: los cortes de válvula nativa no aplican a prótesis») **sigue
siendo literalmente cierto**: la escala leve/moderada/severa de la válvula nativa no aplica, la
**Tabla 19 no gradúa** y la **Tabla 15 no tiene columna de severa**. Por eso las dos ramas de
`protNoGraduaPintar` quedaron intactas y ninguna de las dos funciones de cálculo cambió una línea.

---

## 2 · Los tres campos del PRO-C1, por nombre

| id | dónde | por qué es indispensable |
|---|---|---|
| `et_e_vmax` | `#bloque-prot-vt`, al lado del DVI | la Tabla 19 pide la **velocidad pico de E de la entrada** tricuspídea; `it_vmax_cw` es la Vmax de la **regurgitación**, otra medición |
| `vp_tipo_prot` | `#bloque-prot-vp` | elige la **columna** de la Tabla 15 (bioprótesis / homoinjerto), que `vp_morf` no distingue |
| `ep_gmedio` | `#bloque-prot-vp` | la Tabla 15 gradúa por el gradiente **MEDIO**; `ep_gmax` es el MÁXIMO, derivado de 4·V² por `calcVP`, y el medio no se deriva de él |

**Los tres se ven SOLO con morfología protésica** —los gobierna `valvProtSync` con `ver()`— y
**ninguno tiene columna de Excel**: sus id llevan guión BAJO, así que viajan con el estudio y
`_noEsDelEstudio` no los excluye. Medido: 440 columnas y ninguna los nombra.

⚠️ **LOS DOS BLOQUES VIVEN DENTRO DE OTRA PUERTA**, y es la trampa que costó una corrida:
`#ete-seccion-valv-tricuspide` y `#ete-seccion-valv-pulmonar` nacen en `display:none`. Sin
abrirlas con `toggleEteSeccion`, `valvProtSync` muestra el bloque y un ancestro lo esconde igual.

⚠️ **`#bloque-prot-vt` PASÓ DE `.fg` A `.grid-2` Y `#bloque-prot-vp` A `.grid-3`**, los dos con su
`display:none` en línea: `ver()` escribe `''`, que cae al display de la clase. Es el patrón de
`#bloque-prot-va`, que ya era un `grid-4` gobernado por esa función.

---

## 3 · La prótesis TRICÚSPIDE — Tabla 19 (folio 36, hoja 35)

Dueños: `VT_PROT_T19` (la tabla) · `vtProtTipo()` · `vtProtObstr()` (datos) ·
`vtProtObstrCrit(R)` (los positivos nombrados) · `vtProtObstrPintar()` (sólo pinta) ·
`VT_PROT_OBSTR_TXT` (la palabra del veredicto) · `VT_PROT_BANDA` (las dos bandas nuevas).

| parámetro | bioprotésica | mecánica | operador | campo |
|---|---|---|---|---|
| velocidad pico de E | 2,1 m/s | 1,9 m/s | `>=` | `et_e_vmax` |
| gradiente medio | 9 mmHg | 6 mmHg | `>=` | `et_gmedio` |
| THP | 200 ms | 130 ms | `>=` | `et_thp` |
| AEO | 1,5 cm² | 2,0 cm² | **`<`** | derivado (`etEstado().avt`) |
| DVI | 3,3 | 2,1 | `>=` | `vt_dvi` |

⚠️ **EL AEO ES EL ÚNICO CON `<`**, y el operador sale de la tabla: un juego único habría puesto
su valor exacto del lado equivocado en las dos columnas. Medido: 1,50 cm² exactos **no** votan en
biológica y 1,49 sí; 2,00 exactos no votan en mecánica y 1,99 sí.

⚠️ **LA MECÁNICA ES MÁS EXIGENTE EN TRES FILAS Y MENOS EN DOS**, así que no hay un «tipo más
estricto» del que sacar un default: el MISMO gradiente de 7 mmHg vota sólo en mecánica y el MISMO
AEO de 1,96 cm² también, pero al revés de lo que el gradiente haría pensar.

⚠️ **EL AEO SE LE PIDE A `etEstado()` Y NO SE RECALCULA.** Esa función es el dueño único del área
tricuspídea por continuidad, con sus tres insumos, sus tres bandas y su denominador > 0.
`etEstado` es PURO —lee el DOM y no escribe— así que llamarla desde el motor no pinta ni recursa.

⚠️ **EL DVI SE RETIRA CON REGURGITACIÓN, Y ES DE LA FUENTE.** La nota * de la Tabla 19:
«Assessed in the absence of AR or TR». El umbral se **LEE de `EM_CONT_REGURG_MIN`** —moderada o
mayor, el mismo con que esta app retira el AEO mitral— en vez de retipear un 2. La fila publica
su valor con el motivo y no vota.

**Regla de integración: un OR, basta UNO.** La Tabla 19 no publica regla de integración —su
título dice «parameters suggestive of»—, igual que la Tabla 11 de la mitral (`Z1`). El OR es el
que esta app ya aplica a todos sus umbrales únicos: la estenosis tricuspídea **nativa** es un
`some` de sus tres criterios desde que es binaria. El veredicto NOMBRA los positivos con su
valor, así que el médico ve cuántos lo sostienen.

**Bandas**: `et_e_vmax` 0,2-4 m/s —el techo caza el 210 tipeado por 2,1, que cruzaría el corte de
las dos columnas con tres cifras de más— y `vt_dvi` 0,2-20, generosa a propósito. Las de
`et_gmedio` y `et_thp` **no se copian**: viven en `ET_CRIT` y tienen un solo dueño.

**Frase del informe y del EN SUMA** (la misma a los dos, en los tres estilos):
«Prótesis tricúspide con hallazgos sugestivos de estenosis (gradiente medio 12.0 mmHg, THP 250
ms).» «Sin criterios de estenosis» **no sube al papel**, igual que en la mitral.

---

## 4 · La prótesis PULMONAR — Tabla 15 (folio 33, hoja 32)

Dueños: `VP_PROT_T15` · `vpProtTipo()` · `vpProtObstr()` · `vpProtObstrCrit(R)` ·
`vpProtObstrPintar()` · `VP_PROT_OBSTR_TXT` · `VP_PROT_SIN_COL` · `VP_PROT_BANDA`.

| parámetro | bioprótesis | homoinjerto | operador | campo |
|---|---|---|---|---|
| velocidad pico | 3,2 m/s | 2,5 m/s | `>=` | `vp_vmax` (dueño; `ep_vmax` es su espejo) |
| gradiente medio | 20 mmHg | 15 mmHg | `>=` | `ep_gmedio` |

⚠️ **ESA TABLA NO TIENE COLUMNA DE «SEVERA»**: sus dos columnas son «Normal» y «Possible
obstruction». El único veredicto positivo que el motor puede devolver es **`'posible'`** —no hay
un segundo nivel al que escalar— así que la app **no puede afirmar «severa» por este camino**.
La palabra sale de `VP_PROT_OBSTR_TXT` y es la que `OBSTR_TXT.posible` ya usa en la mitral.

**Los TRES estados que no gradúan**, cada uno con su motivo en `VP_PROT_SIN_COL`:

| estado | motivo publicado |
|---|---|
| `vp_morf` = Prótesis mecánica | «No graduada: la guía no publica cortes para una prótesis pulmonar mecánica» |
| `vp_tipo_prot` = `perc` | «… para una prótesis pulmonar percutánea» |
| `vp_tipo_prot` sin elegir | «No graduada: falta el tipo de prótesis pulmonar» |

Los tres **no escriben nada en el papel**: su motivo se ve en la cápsula, que es donde el médico
decide, y un informe firmado no lleva una nota sobre lo que la app no pudo hacer.

⚠️ **«PERCUTÁNEA» ESTÁ EN LA LISTA A PROPÓSITO.** La Tabla 15 no publica columna para una válvula
percutánea, y la **Tabla 22** del mismo documento las enumera como una familia aparte (Melody,
SAPIEN, Harmony). Ofrecerla deja al médico **declararla** y a la app abstenerse nombrando el
motivo, en vez de aplicarle la columna de otra prótesis.

⚠️ **LA VELOCIDAD SE LEE DE `vp_vmax`, QUE ES EL DUEÑO**, y no de `ep_vmax`, que es su espejo: es
el mismo criterio con el que `calcVP` la lee.

**Frase**: «Prótesis pulmonar con posible obstrucción (velocidad pico 3.3 m/s, gradiente medio
24.0 mmHg).»

---

## 5 · La REGURGITACIÓN de las dos NO se movió, y está medido

La ASE 2024 remite la regurgitación protésica a los criterios de la válvula **nativa**, y sus dos
tablas coinciden con lo que la app ya aplica:

- **Tabla 21 — «Echocardiographic grading of TR after TVR or TV repair», folio 39, hoja 38.**
  Sus cuatro cuantitativos coinciden **DÍGITO POR DÍGITO** con `IT_CRIT` (ASE 2017, Tabla 14,
  folio 350): VC `<0,3 / 0,3-0,69 / ≥0,7` cm · EROA `<0,20 / 0,20-0,39 / ≥0,40` cm² · RVol
  `<30 / 30-44 / ≥45` mL, y la onda de CW mapea a las tres opciones de `it_densidad`.
  **Medido: `it_grado` idéntico con morfología nativa y con las dos prótesis sobre los mismos
  datos, y el borde de la vena contracta separa igual en el régimen protésico (6,9 → 2, 7,0 → 4).**
  Lo que esa tabla publica y la app no tiene: el **radio de PISA** como criterio propio (existe
  `it_pisa_r`, que vota por la EROA), el **flujo de vena hepática** —orden expresa de no
  agregarlo—, el área del jet en color, la zona de convergencia y el llenado tricuspídeo.
- **Tabla 16 — «prosthetic pulmonary valve regurgitation», folio 34, hoja 33**, más la **prosa
  del folio 35 (hoja 34)**. Lo que publica con cortes la app ya lo aplica: el ancho del jet
  (`≤25 / 26-50 / >50 %` del anillo) lo produce `ip_ancho` con sus tres opciones, la densidad y
  la tasa de desaceleración las combina `ip_senal` en sus tres, el reverso en la AP distal es
  `ip_reversion` y el THP severo `<100 ms` es `IP_PHT_SEVERA`. La **fracción regurgitante**
  (`<30 %` leve y `>50 %` severa, folio 35) **no tiene campo**.
  **Medido: `ipGradoCalculado()` idéntico en las tres morfologías, y el borde del THP separa en
  99 / 100 / 101.**

---

## 6 · Las superficies, una por una

| superficie | qué publica |
|---|---|
| cuadro de Válvulas | `#bloque-prot-vt-res` y `#bloque-prot-vp-res`, con su fuente al pie |
| informe (3 estilos) | una oración por válvula, igual en los tres |
| EN SUMA | la MISMA oración (molde de la obstrucción mitral) |
| PDF del informe | la hereda del texto; medido en las SEIS plantillas |
| vista 2D | la tricúspide, por `prot:tricuspide`. **La pulmonar no está en la vista 2D** |
| pastillas | **no cambian**: la obstrucción protésica no toca la pastilla, igual que en la mitral y la aórtica |
| Excel / PPT / PDF de auditoría / Laboratorio | **sin cambios**, medido clave por clave |

⚠️ **LAS DOS CÁPSULAS NO LLEVAN GLOBOS ⓘ, a propósito**: el registro `VINFO` y el conteo de
globos de la pestaña Válvulas son el denominador de **TC-471** y **TC-472**, y cada `.vinfo-btn`
suma además un hallazgo en `check_mobile.js`. La fuente va UNA vez al pie, como en el cuadro de
la IT.

⚠️ **CÁPSULAS DE SÓLO LECTURA**: ni un `id` de control adentro. `guardarInforme` barre
`input[id]`/`select[id]` de TODO el documento.

---

## 7 · Las cuatro columnas de cada pintor

| columna | tricúspide | pulmonar |
|---|---|---|
| `oninput` de sus campos propios | `et_e_vmax`, `vt_dvi` | `ep_gmedio`, y el `onchange` del tipo |
| el calculador de la válvula | `calcET`, **antes** de su salida temprana | `calcVP`, **antes** de las dos |
| la morfología | `valvProtSync` | `valvProtSync` |
| las rutas de restauración | `RECALC_MODULOS` + `limpiarCampos`, los dos vía `valvProtSync` | idem |

⚠️ **Y LA TRICÚSPIDE NECESITÓ UNA QUINTA, QUE LA DESTAPÓ LA MEDICIÓN**: el grado de la IT y de la
IAo se escribe por **CÁLCULO**, y el oyente de documento sobre el `<select>` sólo ve el gesto
MANUAL del médico. Medido: con el DVI cargado, tipear la vena contracta dejaba la fila diciendo
«sugiere estenosis» mientras el motor ya lo había retirado. Se cierra al final de `calcIT_ESC` y
de `calcIA_ESC`. Es «un consumidor nuevo sin su disparador», el patrón que `CLAUDE.md` documenta
cuatro veces.

---

## 8 · Siete trampas

1. **LOS DOS BLOQUES ESTÁN DETRÁS DE DOS PUERTAS.** `#ete-seccion-valv-tricuspide` y
   `#ete-seccion-valv-pulmonar` nacen en `display:none` y el prefijo `ete-seccion-` es histórico
   —son de la pestaña Válvulas—. Sin abrirlas, la sonda informó «el bloque no aparece con
   prótesis» con el cableado perfecto.
2. **A 768 px Y POR DEBAJO EL CAJÓN DE LA LESIÓN SE CIERRA** y el respaldo en línea no gana (el
   CSS del celular usa la clase con `!important`): los campos miden 0×0 y `tipear` aborta. La
   maqueta se carga UNA vez a 1200 px y después sólo se cambia el viewport.
3. **BARRER «sever» EN EL `textContent` DE LA CÁPSULA DA UN FALSO**: su línea de fuente dice «no
   gradúa la **SEVER**idad». Se barren los nodos que PUBLICAN un veredicto y la palabra se busca
   completa (`\bsever[ao]s?\b`).
4. **EL CICLO DE LA VISTA 2D NECESITA UNA VUELTA DE CALENTAMIENTO**: el primer pintado CREA los
   nodos de su contenido y después los reusa. Medido: sin ella, +17 nodos sobre un panel que no
   acumula ninguno. Con ella, **11903 → 11903, delta CERO**. Es la lección del L y del PRO-B.
5. **`_v2dPorQue` DEVUELVE `filas`, NO `crit`.** `crit` es el nombre del campo de la **tabla**
   `V2D_PORQUE`; el objeto que la función devuelve usa otro. Leer `crit` daba 0 criterios en las
   DOS prótesis, que se lee igual que «la tarjeta no tiene criterios».
6. **TRES CONSTANTES DE MÓDULO NO ESTÁN EN `window`** y pusieron tres condiciones de TC-498 en
   rojo sobre un árbol perfecto: `EM_CONT_REGURG_MIN`, `IP_PHT_SEVERA` e `IA_VMAX_TD_SEVERA`. Se
   miden por su **COMPORTAMIENTO**, por los dos lados del borde. Es la trampa de `ECO_AYUDA`.
7. **UNA ESCENA QUE SE PISA A SÍ MISMA.** `escVP` llama a `__t.limpiar()`, así que leer el
   veredicto tricuspídeo DESPUÉS de montar la escena pulmonar informa `null` sobre una escena que
   sí produjo «sin». El veredicto se captura **en el momento** de cada escena.

⚠️ **Y EL ACENTO GRAVE, DOS VECES**, las dos en comentarios míos dentro del cuerpo de TC-498.
La segunda fue peor: al limpiar los acentos de un **rango de líneas** me llevé el que **CIERRA**
el cuerpo del caso, y el síntoma fue que `check_backticks.py` señaló una línea del **runner**,
400 líneas después, que es código normal. **El acento grave que FALTA se ve igual que uno que
SOBRA**, y este archivo ya lo tenía escrito.

---

## 9 · Cómo medir esta zona

```bash
node scripts/_probe_proc.mjs --solo campos      # los tres campos y su visibilidad
node scripts/_probe_proc.mjs --solo tri,tribordes      # la Tabla 19 y sus diez bordes
node scripts/_probe_proc.mjs --solo pulm,pulmbordes    # la Tabla 15 y sus cuatro bordes
node scripts/_probe_proc.mjs --solo regurg      # que la regurgitacion no se movio
node scripts/_probe_proc.mjs --solo v2d,maqueta # la vista 2D y las doce celdas
node scripts/_probe_proc.mjs --solo controles,ab       # el A/B dedicado
node scripts/test_clinico.mjs --solo TC-498
```

La sonda es A/B de **solo lectura** y acepta `--file` para correr contra una copia del árbol de
HEAD. **El grupo `campos` usa un helper tolerante** (`tipearSiHay`) porque contra HEAD los tres
campos no existen: sin eso el lado de HEAD queda vacío y la comparación deja de distinguir «se
agregó» de «se rompió». Ningún grupo que mida un veredicto lo usa.
