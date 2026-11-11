# PANT-36 — «Asociaciones y síndromes» y los quince resúmenes de congénitas

Mapa de la tanda **PANT-36** (2026-11-11). Por nombre de función, de constante y de id; **sin
números de línea**, que cambian en cada edición.

---

## 1 · Dónde vive todo

| cosa | dónde |
|---|---|
| la entrada nueva | `index.html` → la `.card` cuyo cuerpo es **`ref-asoc`**, escrita **después** del bloque de `ref-coronarias` |
| su clave en el reparto | **`REF_SUBTAB.congenitas`** = `['congenitas', 'coronarias', 'asoc']` |
| el texto de las dos tablas | **`scripts/_gen_p36tablas.py`** — la especificación del médico, una sola vez |
| el texto de los quince resúmenes | **`scripts/_gen_p36resumenes.py`** — ídem, con su fuente, su hoja y su folio al lado |
| los resúmenes en la app | dentro de **`ref-congenitas`**, después del renglón que esa ficha ya tenía |
| la trazabilidad de cada viñeta | `docs/CONTROL_CONGENITAS_P36.md` (sale del mismo generador) |
| el inventario de la TAREA 0 | `docs/INVENTARIO_P36.md` |
| las sondas | `scripts/_probe_p36inv.mjs`, `scripts/_probe_p36asoc.mjs`, `scripts/_probe_p36res.mjs`, `scripts/_probe_p36dos.mjs` |
| el barrido de mutaciones | `scripts/_mut_p36.py` |
| los casos | **TC-821** a **TC-824**, fichas en `docs/mapa/tests-fichas-821.md` |

---

## 2 · «Pestaña» quiere decir ENTRADA, y está medido

La orden pide una «pestaña nueva … debajo de Anomalías coronarias». **Referencias tiene NUEVE
subpestañas** (`REF_SUB_ORDEN`) y «Cardiopatía congénita» es una de ellas; lo que vive *debajo*
de una entrada es **otra entrada del mismo panel**. Es el vocabulario que PANT-25 fijó cuando
metió `coronarias` dentro de `congenitas`. Así que PANT-36 agrega **la tercera entrada** del
panel, no una décima subpestaña.

**Agregar una entrada son tres pasos, y los tres van en el mismo commit:**

1. el marcado: una `.card` con `h2.card-head` + `onclick="toggleRef('<id>',this)"` y un hermano
   `<div id="ref-<id>" style="display:none;" class="card-body">`;
2. la clave en `REF_SUBTAB.<subpestaña>`, **al final** de la lista — que es el orden en que
   `refSubInit` apila las tarjetas. ⚠️ Una entrada fuera del reparto **existe, se abre desde su
   encabezado y el buscador la indexa, pero el médico que navegue por las solapas no la encuentra
   nunca**: es la lección de `constriccion` en la tanda J, y la cazan **TC-502 (A3)** y
   **TC-509 (F3)**;
3. **el buscador no se toca**: `_refIndiceArmar` recorre los `h2.card-head` de cada panel y arma
   la entrada sola.

**Los números que se mueven al agregar una:** el censo de entradas (**40 → 41**), el índice del
buscador (**38 → 39**) y el reparto de su subpestaña (`congenitas` **2 → 3**). Los fijan
TC-502 (A2), (A4) y (B1), TC-509 (F3) y TC-821 (A4) y (A5).

---

## 3 · Las dos tablas

- **Orden fijo**: «Síndromes con cardiopatía» (5 columnas × 9 filas) y «Asociaciones entre
  cardiopatías, sin síndrome» (3 columnas × 13 filas). Cada una con su rótulo
  (`font-size:11.5px; font-weight:700; color:var(--accent2)`), que es el rótulo de bloque que
  Referencias ya usa.
- **Primera columna en negrita** (`font-weight:700`); las demás, no. Lo fija TC-822 (D1), que
  exige las dos cosas: que la primera lo tenga y que ninguna otra lo tenga.
- **Sin pie, sin fuente y sin nota**, que es lo que A4 pide. TC-821 (C4) lo mide contando
  elementos en cursiva.
- **Sin botones, selectores ni casillas** — y eso es lo que deja la entrada **fuera del censo de
  campos del estudio y del Excel por construcción**: ese censo recorre
  `input[id], select[id], textarea[id]`. Lo fijan TC-821 (C2) y TC-824 (A1).
- ⚠️ **EL CELULAR VA POR EL PATRÓN MEDIDO DE PANT-25 en `ref-tumores`**: un envoltorio
  `<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">` con la tabla en `min-width`
  (900 px la primera, 700 la segunda). Así la tabla **se desplaza dentro de su contenedor** y la
  página no gana desplazamiento horizontal. Medido a 390 px: el envoltorio desplaza **572** y
  **372** px y el documento **0**.

### El texto no se retipea

`scripts/_gen_p36tablas.py` guarda la especificación del médico y **emite el marcado**:
`--html` lo imprime, `--insertar` lo pone en `index.html`, `--json` lo publica para la sonda y
para el caso. `scripts/_probe_p36asoc.mjs` compara **celda por celda, carácter por carácter**, el
DOM contra ese JSON: dos rótulos, ocho encabezados, 22 filas y 101 celdas. Con el texto escrito a
mano dentro del marcado **no hay contra qué comparar**.

---

## 4 · Los quince resúmenes

Viven **dentro de `ref-congenitas`**, debajo del renglón de cuatro líneas que esa ficha ya tenía
—que **no se toca**, igual que los cinco resúmenes que `ref-miocard` ya tenía cuando PANT-29 le
agregó dos—. Son **quince pares** de `<div>`, o sea 30 hijos, más el original: **31 hijos**.

**El molde, medido en la TAREA 0 sobre `ref-miocard`:**

| parte | estilo |
|---|---|
| título | `font-size:12px` · `font-weight:700` · `color:var(--accent2)` · `margin-bottom:6px` |
| cuerpo | `font-size:12px` · `color:var(--text)` · `line-height:1.8` (21,6 px) · `margin-bottom:10px` |
| viñeta | `&bull; <b>Rótulo:</b> texto<br>` |
| fuente | **ninguna**: el sector no lleva línea de fuente (`P29-a · 2`) |

**El techo es 849 caracteres y 7 viñetas**, el del resumen más largo de `ref-miocard` (la
amiloidosis), y lo fijan TC-778 (B2), (C4) y (C5) para aquel sector y **TC-823 (B3)** y **(B4)**
para éste.

**Los quince, con su medida:**

| # | resumen | caracteres | viñetas | fuente |
|---|---|---|---|---|
| 1 | CIA — Comunicación interauricular | 794 | 6 | ACC/AHA 2025 |
| 2 | CIV — Comunicación interventricular | 759 | 7 | ACC/AHA 2025 |
| 3 | DAP — Ductus arterioso persistente | 742 | 6 | ACC/AHA 2025 |
| 4 | VAB — Válvula aórtica bicúspide | 655 | 6 | ACC/AHA 2025 |
| 5 | CoAo — Coartación de aorta | 827 | 6 | ACC/AHA 2025 |
| 6 | TdF — Tetralogía de Fallot reparada | 817 | 6 | ACC/AHA 2025 |
| 7 | Ebstein — Anomalía de Ebstein | 650 | 6 | ACC/AHA 2025 |
| 8 | DSAV — Defecto del septo auriculoventricular | 820 | 7 | ACC/AHA 2025 |
| 9 | Estenosis subaórtica | 737 | 6 | ACC/AHA 2025 |
| 10 | Estenosis aórtica supravalvular | 726 | 6 | ACC/AHA 2025 |
| 11 | TGA — Transposición de grandes arterias | 831 | 6 | ACC/AHA 2025 |
| 12 | CVPA — Conexión venosa pulmonar anómala parcial | 828 | 7 | ACC/AHA 2025 |
| 13 | Fontan — Circulación de Fontan | 716 | 7 | ACC/AHA 2025 |
| 14 | Eisenmenger — Síndrome de Eisenmenger | 811 | 7 | ACC/AHA 2025 |
| 15 | Marfan/EHAT — Aortopatía hereditaria | 848 | 7 | **ESC 2020** |

⚠️ **CUATRO se escribieron pasados del techo y se acortaron SIN perder un solo número medido**:
TGA 955, CoAo 907, CVPA 904 y Eisenmenger 890, más Marfan, que arrancó en 1.124. Lo que salió
fueron palabras; las cifras quedaron todas.

### Qué NO puede decir un resumen

Ninguno nombra una guía, una clase, un folio ni una fuente, ni dice que algo «no figura» o que
dos fuentes difieren. Lo mide **TC-823 (C1)** contra once formas prohibidas, y la sonda
`_probe_p36res.mjs` contra trece. La trazabilidad de cada viñeta —con su hoja, su folio y si se
leyó en imagen— vive en `docs/CONTROL_CONGENITAS_P36.md`, que **sí** puede nombrarlas porque no
es texto de la app.

### Qué secciones quedaron fuera, y por qué

De las **19** de `_CC_SECS`:

- **`mch` y `mca`** ya tienen resumen en `ref-miocard`;
- **`fop`** ya tiene ficha propia (`ref-fop`), en «Otros hallazgos»;
- **`vap`** (ventana aortopulmonar) **no tiene contenido verificable en las dos guías de la
  orden**: la ACC/AHA 2025 la nombra **una sola vez**, de pasada, en una recomendación de
  Eisenmenger (hoja 8, folio e122), y la ESC 2020 inglesa **ninguna**. Queda **omitida**, que es
  lo que B3 manda: lo que no se pudo leer queda afuera. Declarado en **P36-c**.

---

## 5 · Las fuentes y sus dos reglas de folio

| guía | archivo | hojas | folio | comprobada en |
|---|---|---|---|---|
| ACC/AHA 2025 de congénitas del adulto | `08_Cardiopatias_congenitas/gurvitz-et-al-2025-…-congenital-heart-disease-a.pdf` (**sin** el sufijo `-2`) | 137 | **e** + hoja + **114** | hojas 1, 2, 10, 35, 60, 75, 100 y 137 |
| ESC 2020 de congénitas del adulto, **en inglés** | `08_Cardiopatias_congenitas/ESC congenitos en ingles 2020.pdf` | 84 | hoja + **562** | hojas 1, 2, 10, 35 y 60 |

⚠️ **El `Baumgartner_2020_Cardiopatias_Congenitas.pdf` de esa misma carpeta está en español y
tiene 79 hojas**, así que no cumple la regla; la que se usa es la inglesa. Es la premisa que
PANT-21 ya había desmentido.

⚠️ **POR QUÉ LOS NÚMEROS SE LEEN EN IMAGEN, con un caso de esta tanda**: el texto extraído de la
ESC devuelve **«(2030%)»** donde la hoja imprime **«(20–30%)»** — el guion del rango se pierde.
Con el texto extraído, el resumen de Marfan habría publicado «2030 %».

---

## 6 · Lo que esta tanda NO toca, y cómo se verifica

- **El papel**: informe, EN SUMA, PDF, PPT y Excel. Lo mide el A/B de 121 escenas y lo fija
  **TC-824 (B1)** con ocho palabras de las tablas nuevas que no pueden aparecer.
- **`ref-miocard`**: 14 hijos y techo 849 — **TC-823 (D1)**.
- **`ref-coronarias` y el globo `otr-rac`**: cuatro hijos, dos `data-ref-solo` y el clon en
  **478** caracteres — **TC-824 (C1)** y **(C2)**. Lo nuevo vive en una entrada **hermana**, así
  que el clon no lo ve.
- **El buscador**: sus resultados de control —«RWT», «Wilkins», «Rassi»— no se mueven, **TC-821
  (B2)**.
