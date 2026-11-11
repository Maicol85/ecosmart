# INVENTARIO P36 — Referencias → Cardiopatías congénitas (TAREA 0, PANT-36, 2026-11-11)

**Solo lectura.** Este commit no toca `index.html`: md5 `2ed17cab`, 174.644 líneas, antes y
después. Línea base verificada: `HEAD` = `origin/main` = **`f9b5812`**, sello **`v20261111-0030`**,
md5 **`2ed17cab`** — los tres idénticos a lo que `CLAUDE.md` publica tras PANT-34.

Medido en Chrome real con `scripts/_probe_p36inv.mjs` (sonda nueva, solo lectura) y con `grep`
y `sed` sobre el archivo. **El tema se pone con la clase `light-mode` por `loadTheme()`**, no con
`prefers-color-scheme`: es el hallazgo de método de PANT-34, y la sonda **devuelve qué tema quedó
puesto** (`dark` y `light`, los dos distintos) para no medir dos veces el mismo.

---

## a) Cómo está armada hoy Referencias → Cardiopatías congénitas

⚠️ **LA HIPÓTESIS DE VOCABULARIO DE LA ORDEN ES FALSA EN SU LETRA Y CIERTA EN SU INTENCIÓN.** La
orden pide una «pestaña nueva … debajo de Anomalías coronarias». Medido: **Referencias tiene NUEVE
subpestañas** (`REF_SUB_ORDEN`), y «Cardiopatía congénita» **es una de esas nueve**; lo que vive
*debajo* de «Anomalías coronarias» no es una décima subpestaña sino una **tercera ENTRADA** dentro
de ese panel. Es el mismo vocabulario que el comentario de PANT-25 ya fija: «en el vocabulario de
esta pestaña eso es una entrada DENTRO de su panel». Así que **lo que PANT-36 agrega es una
entrada** (`.card` con su `h2.card-head` plegable y su cuerpo `ref-<id>`), tercera del panel.

- `REF_SUB_ORDEN` = `calc, dim, fun, valv, ao, congenitas, cardiotox, hemo, otros` (**9**, y
  `congenitas` es la **6.ª**).
- `REF_SUBTAB.congenitas` = `['congenitas', 'coronarias']` — **dos** entradas, en ese orden.
  `REF_SUBTAB` es el **dueño único del reparto**: `refSubInit` recorre `REF_SUB_ORDEN` y, por cada
  clave, mueve la **tarjeta** (`cuerpo.closest('.card')`) al panel `#ref-sub-<sub>`.
- Las dos entradas del panel, medidas con la pestaña abierta:

| id | título en pantalla | caracteres | hijos |
|---|---|---|---|
| `ref-congenitas` | 🧬 Cardiopatías Congénitas del Adulto (ESC 2020) | **287** | 1 |
| `ref-coronarias` | 🫀 Anomalías coronarias congénitas — trayecto | **6.804** | 4 |

- **Dónde queda «Anomalías coronarias»**: es la **segunda y última** entrada del panel
  `#ref-sub-congenitas`. Su marcado vive en `index.html` después de `ref-congenitas`; sus hijos 1 y
  2 son los de CORTOS12 (los tres trayectos y su línea de fuente) y los hijos **3 y 4** son los de
  PANT-29 y PANT-34, marcados **`data-ref-solo`** para que el globo ⓘ `otr-rac` no los clone.
- **Cómo se agrega una entrada nueva debajo de ella** — tres pasos, y los tres en el mismo commit:
  1. el marcado: una `.card` con `h2.card-head` + `onclick="toggleRef('<id>',this)"` y un hermano
     `<div id="ref-<id>" style="display:none;" class="card-body">`, escrito **después** del bloque
     de `ref-coronarias` en el archivo;
  2. la clave en `REF_SUBTAB.congenitas`, **al final** de la lista (es el orden en que
     `refSubInit` las apila). ⚠️ **Una ficha fuera de este reparto existe, se abre desde su
     encabezado y el buscador la indexa, pero el médico que navegue por las solapas no la
     encuentra nunca**: es la lección que `constriccion` dejó en la tanda J, y la cazan TC-502 (A3)
     y TC-509 (F3);
  3. **el buscador no necesita ningún cambio**: `_refIndiceArmar` recorre los `h2.card-head` de
     cada panel y arma la entrada sola, siempre que tenga su `toggleRef('…')` y su `ref-<id>`
     hermano, y que su cuerpo **no contenga otro** `h2.card-head` (ésa es la compuerta estructural
     que excluye a los dos agrupadores de válvulas).

## c) El reparto y el índice del buscador que la cuentan

Medido en Chrome, con la definición de «entrada» que usan TC-502 y TC-509 (`h2.card-head` con un
`onclick` de `toggleRef(` dentro de `#tab-refs`):

| magnitud | hoy | con la entrada nueva |
|---|---|---|
| entradas censadas en `#tab-refs` | **40** | 41 |
| índice del buscador (`_refIndiceArmar(true).length`) | **38** (40 menos los dos agrupadores) | 39 |
| claves en `REF_SUBTAB` | **28** | 29 |
| subpestañas (`REF_SUB_ORDEN`) | **9** | 9 (no se mueve) |

## b) El molde de los resúmenes de `ref-miocard` — ESA es la disposición a copiar

Medido con la ficha **abierta** (cerrada, el `textContent` es igual y no prueba que el médico la
pueda leer). `ref-miocard` tiene **14 hijos**: **siete pares** de `<div>`, título y cuerpo.

| # | resumen | caracteres (título + cuerpo) | viñetas |
|---|---|---|---|
| 1 | MCH — Miocardiopatía Hipertrófica | 392 | 5 |
| 2 | MCDI — Miocardiopatía Dilatada | 275 | 3 |
| 3 | MCA — Miocardiopatía arritmogénica | 641 | 5 |
| 4 | MNC — Miocardio No Compactado | 536 | 6 |
| 5 | ⭐ Amiloidosis Cardíaca — TTR y AL | **849** | **7** |
| 6 | Corazón de atleta — frente a la miocardiopatía dilatada | 845 | 6 |
| 7 | Miocardiopatía chagásica | 846 | 5 |

**El techo es el del resumen más largo, la amiloidosis: 849 caracteres y 7 viñetas**, y es el que
TC-778 (B2), (C4) y (C5) ya fijan. Los dos resúmenes que PANT-29 agregó quedaron en 845 y 846
caracteres y 6 y 5 viñetas, o sea **por debajo** de los dos.

**El estilo, valor por valor** (idéntico en los siete pares):

- **título**: `<div>` · `font-size:12px` · `font-weight:700` · `color:var(--accent2)` ·
  `margin-bottom:6px`.
- **cuerpo**: `<div>` · `font-size:12px` · `font-weight:500` (la de la página; el molde **no**
  declara peso) · `color:var(--text)` · `line-height:1.8` (21,6 px computados) ·
  `margin-bottom:10px`, salvo el **último** del bloque, que va en **0**.
- **viñetas**: una línea por viñeta, con el formato `• <b>Rótulo:</b> texto<br>`; la negrita marca
  el rótulo y los números que importan. La amiloidosis además usa un `<b style="color:var(--accent2)">`
  como rótulo de sub-bloque dentro del cuerpo.
- ⚠️ **NINGUNO lleva línea de fuente**, y está medido: no hay un `<div>` de 10 px con documento,
  año y folio como el que sí tiene `ref-coronarias`. Es lo que `P29-a · 2` declara, y por eso la
  trazabilidad de cada frase vive en el documento de control y no en pantalla.
- Los catorce hijos **se ven**: ninguno en `display:none`.

## c-bis) Las secciones de congénitas de la app — `_CC_SECS`

⚠️ **HIPÓTESIS CONFIRMADA: son DIECINUEVE**, contadas una por una sobre el registro
(`index.html:161203`), que es el dueño único de «esta lesión está cargada en el estudio»:

| # | clave | rótulo | ¿tiene ya resumen o ficha en Referencias? |
|---|---|---|---|
| 1 | `cia` | CIA | NO — sólo un renglón de cuatro en `ref-congenitas` |
| 2 | `civ` | CIV | NO — ídem |
| 3 | `dap` | DAP | NO — ídem (el renglón dice «PCA») |
| 4 | `vap` | VAP (ventana aortopulmonar) | NO |
| 5 | `coa` | CoAo | NO |
| 6 | `fop` | FOP | **SÍ** — `ref-fop`, ficha propia en «Otros hallazgos» |
| 7 | `vab` | VAB | NO |
| 8 | `ebs` | Ebstein | NO |
| 9 | `mch` | MCH | **SÍ** — resumen 1 de `ref-miocard` |
| 10 | `mca` | MCA | **SÍ** — resumen 3 de `ref-miocard` |
| 11 | `tdf` | TdF | NO |
| 12 | `tga` | TGA | NO |
| 13 | `marfan` | Marfan/EHAT | NO (su contenido vive en la Evidencia de aorta, no en un resumen) |
| 14 | `eisen` | Eisenmenger | NO — sólo la contraindicación, en el cuarto renglón de `ref-congenitas` |
| 15 | `fontan` | Fontan | NO |
| 16 | `esub` | Est. subaórtica | NO |
| 17 | `easv` | Est. supravalvular | NO |
| 18 | `dsav` | DSAV (canal AV) | NO |
| 19 | `cvpa` | CVPA parcial | NO |

Las **anomalías coronarias no están en `_CC_SECS`**: su contenido ya vive en `ref-coronarias` y la
orden las excluye expresamente.

⚠️ **UNA PREMISA DE LA ORDEN NO SE REPRODUCE**: B5 nombra «estenosis pulmonar» entre las más
frecuentes, y **no hay una clave de estenosis pulmonar en `_CC_SECS`**. La app tiene pantalla y
Evidencia de estenosis pulmonar, pero el registro que la orden manda medir (TAREA 0c) no la lista,
así que no entra en la lista de resúmenes por ese camino.

**Candidatas a resumen, por la regla de B1** (las 19 menos las que ya tienen resumen o ficha):
`cia, civ, dap, vap, coa, vab, ebs, tdf, tga, marfan, eisen, fontan, esub, easv, dsav, cvpa` —
**dieciséis**.

## d) Las tablas que Referencias ya tiene — el estilo a reutilizar

Medido en los **dos temas reales** sobre `ref-ao` (la tabla de ateroma y umbrales quirúrgicos de
aorta) y sobre el envoltorio de `ref-tumores`:

- **tabla**: `width:100%` · `border-collapse:collapse` · `font-size:12px`.
- **fila de encabezado**: `background:var(--section-head)` — `rgb(35,40,64)` en oscuro y
  `rgb(228,233,242)` en claro—; `<th>` con `padding:6px 8px` y `color:var(--accent2)`
  —`rgb(126,200,227)` en oscuro, `rgb(31,95,184)` en claro—.
- **celdas**: `padding:5px 8px`, color `var(--text)` —`rgb(232,236,244)` / `rgb(26,34,51)`—.
- **celular**: el patrón medido es el de PANT-25 en `ref-tumores`: un envoltorio
  `<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">` con la tabla en
  `min-width:560px` adentro. Con eso la tabla se desplaza **dentro de su contenedor** y la página
  no gana desplazamiento horizontal: medido a 390 px, `scrollWidth - clientWidth` del documento =
  **0**.
  ⚠️ **SALVEDAD DE DENOMINADOR**: la medición del desplazamiento *del envoltorio* dio 0 porque
  `ref-tumores` vive en el panel «Otros hallazgos» y Referencias muestra **un** panel a la vez, así
  que con la pestaña de congénitas activa ese nodo no tiene geometría. Lo que queda medido es el
  patrón del marcado y el cero de la página; el desplazamiento dentro del envoltorio se mide en la
  pestaña nueva, con su panel activo.

## e) Qué pruebas fijan el texto, el largo o la cantidad de fichas de Referencias

| caso | qué fija | qué hay que adaptar en PANT-36 |
|---|---|---|
| **TC-502** (A2) | el censo encuentra **40** entradas | 40 → 41 |
| **TC-502** (A3) | ninguna entrada queda fuera de una subpestaña | nada: la nueva entra al reparto |
| **TC-502** (B1) | el índice del buscador tiene **38** entradas | 38 → 39 |
| **TC-509** (F3) | **NUEVE** subpestañas, el censo en **40** y una lista de ids exigidos | 40 → 41 y la nueva en la lista |
| **TC-778** | los 14 hijos de `ref-miocard`, su molde, el techo de **849** y las **7** viñetas | nada: PANT-36 no toca `ref-miocard` |
| **TC-779** | `ref-coronarias` conserva su contenido y el globo `otr-rac` sigue idéntico | nada: no se toca |
| **TC-780** | cada cifra de los tres resúmenes contra su control; ninguno nombra una fuente | nada |
| **TC-679** (D6) | el buscador indexa `tumores` y `embolig` | nada |

**Último caso usado: TC-820** (PANT-34). **El primer TC libre es TC-821.**

## f) `docs/PENDIENTES.md` → P29-a · 1 — lo que dejó anotado, y comprobado hoy

Lo que ese pendiente declara, verificado de nuevo en esta tanda:

| guía | archivo | hojas | regla de folio | comprobada en |
|---|---|---|---|---|
| ACC/AHA 2025 de congénitas del adulto | `08_Cardiopatias_congenitas/gurvitz-et-al-2025-…-congenital-heart-disease-a.pdf` (**sin** el sufijo `-2`) | **137** | folio = **e** + hoja + **114** | hojas 1, 2, 10, 35, 60, 75, 100 y 137 → e115, e116, e124, e149, e174, e189, e214 y e251 |
| ESC 2020 de congénitas del adulto, **en inglés** | `08_Cardiopatias_congenitas/ESC congenitos en ingles 2020.pdf` | **84** | folio = hoja + **562** | hojas 1, 2, 10, 35 y 60 → 563, 564, 572, 597 y 622 |

⚠️ **La premisa de archivo de PANT-21 vale igual acá, y se volvió a verificar**: el
`Baumgartner_2020_Cardiopatias_Congenitas.pdf` de la misma carpeta está **en español** y tiene
**79** hojas, así que no cumple `folio = hoja + 562`. La que se usa es la inglesa.
⚠️ **La hoja 84 de la inglesa no imprime folio**: el rango del artículo es 563-645 (83 folios), así
que la regla vale para las hojas 1 a 83 y la 84 es el cierre sin numerar.

`ref-congenitas` sigue en los **287 caracteres** y el hijo único que P29-a · 1 midió: cuatro
renglones —CIA, CIV, PCA y la contraindicación de Eisenmenger— y **ninguno** con el formato de
título + viñetas de `ref-miocard`. **Nada de lo que el commit 7 de PANT-29 dejó afuera se hizo
desde entonces.**

---

## Lo que esta tanda NO puede hacer, medido antes de empezar

- **Cero campos guardados y cero columnas de Excel, por construcción**: lo que entra son `div`,
  `table`, `tr`, `td` y `th`. **Ningún `<input>`, `<select>` ni `<textarea>`**, así que no hay nada
  que el censo de campos del estudio ni el exportador de Excel puedan tomar. El censo recorre
  `input[id], select[id], textarea[id]`.
- **Ningún id nuevo puede terminar en `-aviso`**: `limpiarCampos` barre `[id$="-aviso"]` y les
  escribe `textContent` vacío — es lo que PANT-30 pagó con el botón del aviso. Los ids de esta
  tanda no terminan así y no caen en ninguno de los **21** barridos por sufijo o prefijo del
  archivo.
- **Nada se oculta con `hidden`**: en esta app `.btn` declara `display:inline-flex` y le gana al
  `[hidden]` del navegador (lección de PANT-30). Esta tanda no oculta nada de todos modos: la
  entrada nueva se pliega con el mismo `toggleRef` que las otras cuarenta.
