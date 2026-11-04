# Mapa · PANT-8 — la pantalla de TAVI, las referencias del VD y el molde de la pulmonar

Tanda **PANT-8** (2026-11-04). Siete commits de código y documentación sobre `afed3e8`.
Este mapa va por **nombre de función y de constante**, no por número de línea.

---

## 1 · Los dos botones de TAVI (commit 1)

| pieza | dónde |
|---|---|
| la sección | `#ete-seccion-tavi`, en la pestaña **ETE**; abre con `toggleEteSeccion('tavi')` |
| la fila de las dos esquinas | `.ete-tavi-btnfila` — un `flex` con las dos barras a `flex:1 1 0` |
| cada barra | `.subtabs-wrap.cc-lesbar.ete-tavi-btnbar`, una con `flex-start` y otra con `flex-end` |
| los botones | `#ete-tavi-tab-pre` y `#ete-tavi-tab-post` |
| el estado | `_eteTaviPane`, variable de **módulo** — no es campo del estudio |
| el pintor | `eteTaviPaneSync()`, dueño único del pintado **y** del `display` de los dos paneles |
| el gesto | `eteTaviTab(cual)` |
| quién lo mantiene al día | `eteTaviSync()`, que está en `RECALC_MODULOS` |

**Por qué se quedaba oscuro el botón, en una línea:** los dos usaban `.active`, y `showTab` hace
`querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))` sobre **todo** el
documento. Es el mismo defecto que PANT-3 cerró para CIA / CIV y la misma salida: una clase
**propia** que ese barrido no toca.

⚠️ **SE REUSA `cc-pane-on` Y NO SE DECLARA UNA CLASE NUEVA.** Esa clase ya significa «este
formulario está a la vista», que es exactamente lo que el botón de TAVI dice. `cc-les-on` —el
relleno verde— significa «esta lesión entra al informe», y en TAVI no hay lesión por panel: la
inclusión es **una** casilla para toda la sección (`ete_tavi_incluir_chk`). Pintar de verde el
panel a la vista diría algo falso.

⚠️ **EL RELLENO VA ACOTADO A `.ete-tavi-btnbar`**, y es lo que hace que CIA / CIV no se muevan
**por construcción**: la regla general sigue dando a `cc-pane-on` el borde teal en toda otra
`.subtabs-wrap`.

⚠️ **`cc-lesbar` EN LAS DOS BARRAS NO ES COSMÉTICA.** Sin esa clase, la regla
`.subtabs-wrap:not(.cc-subbar):not(.cc-lesbar) .tabs-row{display:none !important}` de la media
query de 768 px esconde su `.tabs-row`: medido en HEAD, los dos botones median **0 × 0** a 768 y a
390 px, así que **el panel Post-TAVI no se podía alcanzar desde un teléfono ni desde una tablet**.

**El estado NO se guarda con el estudio** — ver `P8-a`.

## 2 · Las tres columnas del panel Post-TAVI (commit 2)

| pieza | dónde |
|---|---|
| el contenedor | `#ete-tavi-post-cols` |
| cada columna | `.ete-tavi-pcol` |
| el corte | `@media (min-width: 900px)`, con `repeat(3, minmax(0,1fr))` |
| el piso de los campos | `repeat(auto-fit, minmax(170px, 1fr))`, **dentro** de esa media query |

Las tres columnas son los **tres grupos que ya existían**, con sus títulos y sus campos sin mover
de grupo: **4 + 6 + 5** campos. Ningún id y ningún rótulo cambian.

**El cuarto grupo —«Localización del jet — EPC»— se queda DEBAJO, a todo el ancho**, que es lo que
el médico pidió con «el resto lo dejaría igual»: es el lienzo de 340 px con su extensión
circunferencial, la cápsula de severidad VARC-3, la vista previa del informe y la nota del médico.

⚠️ **EL CORTE ES 900 px Y NO 700, Y LO DECIDIÓ LA MEDICIÓN.** El criterio de la orden es que una
columna no baje de 200 px, y el ancho del panel **no es monótono** en el corte de 768 px: por
debajo de 768 el riel desaparece y el panel gana ~160 px, así que a 768 px una columna mediría
228 px pero a 800 px —ya con riel— mediría **186**. Desde 900 px el ancho sí es monótono y la
columna más angosta mide **218 px**.

⚠️ **EL PISO DE 170 px VA DENTRO DE LA MEDIA QUERY.** Declarado afuera regía también por debajo
del corte y dejaba **tres** campos por fila donde `grid-4` deja cuatro: a 899 px el panel pasaba de
953,3 a **1.105,3** px de alto.

## 3 · La sincronía de TAVI con Aorta / AI (commit 3)

| pieza | dónde |
|---|---|
| la tabla de parejas | `TAVI_AO_PARES` — tres entradas |
| el predicado del módulo | `_taviModuloEnUso()` |
| el dueño del gesto | `taviAoSync(origen, id)` |
| el reconciliador | `taviAoReconciliar()`, en `RECALC_MODULOS` |

| TAVI | Aorta / AI | segmento |
|---|---|---|
| `ete_tavi_valsalva` | `ao_sin` | seno de Valsalva |
| `ete_tavi_ust` | `ao_st` | unión sinotubular |
| `ete_tavi_ao_asc` | `ao_tub` | aorta ascendente proximal |

**La regla, que es la del D-9 y la de `aoRaizSync`:** el campo del **estudio** es el dueño. Lo que
se teclea en TAVI va **siempre** al estudio; el sentido inverso sólo corre **con el módulo de TAVI
ya en uso**.

⚠️ **EL SENTIDO CONDICIONAL ES UNA CONSECUENCIA MEDIDA.** `_labUsaTavi` nombra
`ete_tavi_valsalva` y `ete_tavi_ao_asc`, así que con el espejo simétrico **todo estudio con la
raíz o la ascendente medidas pasaría a contar como «Con TAVI»** en el filtro de cohorte del
Laboratorio. Medido: con `ao_sin` 40, `ao_st` 33 y `ao_tub` 37 y ningún campo de TAVI,
`_labUsaTavi` da **false** hoy y pasaría a **true**.

⚠️ **LOS TRES ESPEJOS QUEDAN FUERA DE `_taviModuloEnUso`** a propósito: si contaran, el primer
valor copiado haría que el módulo pareciera en uso y el espejo se autorizaría a sí mismo.

**Las que NO se unen, cada una con su motivo:** el **anillo** (`ete_tavi_anillo_diam`) contra el
**tracto de salida** (`diam_tsvi_ao`) —dos sitios de medida, y TAVI declara su vista—; la **Vmax**
y el **gradiente medio** post-TAVI contra los de la nativa —el propio módulo declara que duplican
a propósito—; y el **AT** contra `va_at`, que es la duda de la Fase 2 que el módulo ya declara.

**La morfología quedó PARADA** — ver `P8-d`.

**LA ÚNICA DIFERENCIA DE PAPEL DE LA TANDA:** con el sizing cargado sólo en TAVI y la aorta vacía,
el informe gana «Aorta torácica: Raíz aórtica 38 mm. Unión sinotubular 32 mm, Aorta ascendente
36 mm de calibre normal.» en los tres estilos, y el PDF pasa de 82 textos y 68 figuras a **106 y
88** en sus seis plantillas — el bloque de aorta entero, sin que nada desaparezca. **El EN SUMA no
cambia y el PPT tampoco.** Excel en 441 columnas, con tres que pasan a traer valor.

## 4 · El globo de la calcificación (commit 4)

`VINFO['tavi-calc']`, con su botón al lado del rótulo de `ete_tavi_calc`. Registro **122 → 123**.

`ete_tavi_calc` tiene **tres** lectores, censados: su propio select, el párrafo del informe de TAVI
y `_labUsaTavi`. **Ni un cálculo, ni un corte y ni una regla dependen de él.**

El contenido y sus folios están en `docs/fuentes/FUENTES.md` → «La tanda PANT-8».

⚠️ **LA LIGADURA «fi» ES UNA TRAMPA DE MÉTODO**: el PDF de la ASE escribe «calciﬁcation» con
U+FB01, así que buscar `calcifi` devuelve **cero** sobre un documento que la dice.

## 5 · Las referencias del VD y de la arteria pulmonar (commit 5)

Cuatro fichas nuevas en el registro, y **veintidós filas** en el cuadro de `evRefPintar('vd2')`,
que pasa de **48 a 70**:

| ficha | qué publica |
|---|---|
| `DIM-VD-007` | el tronco: cuatro grados, sitio de medida, el corte de 25 mm y el cociente con la aorta |
| `DIM-VD-008` | las ramas: el sitio **sí**, el valor normal **no** |
| `DIM-VD-009` | los tres diámetros del tracto de salida, cuatro grados cada uno, y el aviso del 40 % |
| `DIM-VD-010` | los tres de la guía de 2015, para comparar, con su rango normal |

⚠️ **LAS FILAS SE ESCRIBEN A MANO Y NO CON `_evRefFilasT1`**, y es a propósito: ese ayudante lee
`ASE25_T1`, que es el **dueño de las bandas que la pantalla del VD aplica**, y ninguno de estos
cinco parámetros se gradúa en pantalla. Agregarle claves a ese registro metería cinco entradas que
nadie evalúa en el dueño de los cortes de pantalla.

**Ningún corte de pantalla se movió:** `ip_ap_diam` conserva su banda `IP_AP_BANDA` de [5, 80] y
el corte de 25 mm que ya aplicaba en los signos de HTP; `tsvd_diametro` sigue siendo insumo del Qp.
La contradicción de que la guía publica **tres** diámetros y la app tiene **uno** queda en `P8-f`.

## 6 · El molde de Evidencia en la estenosis pulmonar (commit 6)

`_indEP()` publica `molde`, con `est: null`.

| pieza | qué lleva |
|---|---|
| `cat` | el grado: «Estenosis pulmonar severa» o «moderada» |
| `est` | **`null`** — la guía no publica estadios para esta lesión |
| `datos` | las **nueve** filas: las seis de medición, el renglón que explica que no hay estadio, la función del VD y la PSVD |
| `cols` | **una** columna con dos grupos: «Indicación» (2) y «Criterios del asintomático» (3) |
| `pie` | `null` — esta válvula tiene la tarjeta de `recom` |

⚠️ **PANT-6 Y PANT-7 LA FRENARON PORQUE «NO TIENE FILA DE ESTADIO», Y MEDIDO ESO NO ES UN
IMPEDIMENTO:** el molde admite `est` nulo desde el día uno —la estenosis aórtica lo escribe
`_estEA ? {...} : null`— y la fila que **dice** que no hay estadio ya existía desde PANT-5.

⚠️ **SON CINCO PREGUNTAS, NO CUATRO**, medidas en el panel: `ep.sintomas`, `ep.sustituto`,
`ep.ejercicio`, `ep.deterioro` y `ep.shunt`.

⚠️ **LOS GRUPOS SE ARMAN POR CLAVE Y NO POR ÍNDICE**, con `_indPorClave`: la lista clínica termina
en **dos filas de solo lectura** —la función del VD y la PSVD— que van a los **datos**.

**El globo de síntomas** es `epsintomas`, leído de la ESC 2020, folio 608, y enumera los síntomas
**por nivel de obstrucción**.

**La prótesis mitral sigue parada** — ver `P8-e`, con sus dos motivos medidos y la propuesta.

## 7 · Los tres inventarios de solo lectura (commit 7)

`docs/INVENTARIO_PLEURA_Y_PULMON.md`, `docs/INVENTARIO_MASAS.md` y
`docs/INVENTARIO_PULMON_INTERACTIVO.md`. **Ese commit no tocó `index.html`**, verificado con su
md5 idéntico antes y después.

## 8 · Las sondas de esta tanda

| sonda | qué mide |
|---|---|
| `scripts/_probe_pant8tavi.mjs` | el inventario de TAVI, los botones, la persistencia y las tres columnas, a seis anchos |
| `scripts/_probe_pant8sinc.mjs` | la sincronía: 23 pruebas con gestos reales y siembra **muda** |
| `scripts/_probe_pant8info.mjs` | el globo: las tres vías de cierre, la letra única, las citas |
| `scripts/_probe_pant8ref.mjs` | el cuadro de Referencias del VD |
| `scripts/_probe_pant8ab.mjs` | el A/B de superficies, 15 escenas con PDF y PPT de verdad |
| `scripts/_mut_pant8.py` | las 33 mutaciones dirigidas |

⚠️ **LA SIEMBRA MUDA DE `_probe_pant8sinc.mjs` NO ES UN DETALLE:** con la siembra por **gesto** el
espejo ya corre y los dos lados quedan iguales, así que la foto de «antes» decía 44 y 44 sobre una
escena montada con 38 y 44. Es como pueblan las rutas de restauración, y por eso `aoRaizSync`
necesita su reconciliador.
