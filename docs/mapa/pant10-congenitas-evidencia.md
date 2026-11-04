# PANT-10 — los textos de congénitas contra las hojas, y la Evidencia de cinco lesiones

Mapa de la tanda **PANT-10** (2026-11-04). Seis commits de código y uno de cobertura y
documentación. No guarda números de línea a propósito: la línea cambia en cada edición, el
nombre de la función no.

---

## 1. El commit 1 — los diecisiete textos corregidos

Los diecisiete textos que PANT-9 movió al globo ⓘ (listados en `P9-a`) se corrigieron contra la
hoja que cada uno invoca. **Mismas claves del registro, mismo estándar, mismo censo de ⓘ:** lo
único que cambia es el texto.

El dueño es **`VINFO`**, el registro que `_vInfoHTML` renderiza. Cada entrada tiene `tit`
(título, 12 px), `lee` («Qué mide»), `fuente` («Fuente») y `ojo` («A tener en cuenta»), y el
cuerpo sale en los **11 px** que la regla fija de esta casa manda.

**Dónde mirar cada uno**, por clave: `cc9-fontan-sat` · `cc9-fontan-iav` · `cc9-eisen-sat` ·
`cc9-eisen-sin` · `cc9-eisen-hem` · `cc9-eisen-per` · `cc9-ebs-sec` · `cc9-ebs-cel` ·
`cc9-ebs-cia` · `cc9-dsav-comp` · `cc9-dsav-down` · `cc9-dsav-rav` · `cc9-dsav-rvp` ·
`cc9-cvpa-sec` · `cc9-cvpa-dren` · `cc9-cvpa-qp` · `cc9-vap-sec`.

**Lo que se retiró, literal, está en `docs/PENDIENTES.md` → P10-a.** No se borró nada.

⚠️ **LA FRANJA ROJA DE CONTRAINDICACIONES DE EISENMENGER NO SE TOCA**, por decisión expresa del
médico. **No tiene id**: es un `<div>` con estilo en línea dentro de `#sacc-cc-eisen`, justo
antes de `#eisen-fila`, y se la localiza por su texto «Contraindicaciones absolutas». La primera
versión de la sonda la buscaba por un id inventado y daba «NO EXISTE» en los **dos** árboles —un
denominador vacío, que se lee igual que «no cambió»—.

⚠️ **Y HAY UNA SEGUNDA COPIA DE LA FRASE DEL ÍNDICE DE CELERMAJER QUE LLEGA AL PAPEL.** La
publica **`ebsConclusion`**, y el informe firmado en los tres estilos, el PDF, el EN SUMA y el
PPT la llevan. Esta tanda **no la tocó**: la orden manda parar y reportar. Está medida superficie
por superficie en `P10-a`.

---

## 2. Los commits 2 a 6 — las cinco secciones de Evidencia

| Lesión | Función | Registro de preguntas | Preguntas | Compuerta |
|---|---|---:|---:|---|
| Defecto del septo auriculoventricular | `_indDSAV` | `DSAV_PREG` | **13** | `dsavEstado().hayDatos` |
| Anomalía de Ebstein | `_indEBS` | `EBS_PREG` | **12** | `ebsConclusion()` no nulo |
| Circulación de Fontan | `_indFON` | `FON_PREG` | **14** | `fontanEstado().hayDatos` |
| Conexión venosa pulmonar anómala parcial | `_indCVPA` | `CVPA_PREG` | **9** | `cvpaEstado().hayDatos` |
| Síndrome de Eisenmenger | `_indEIS` | `EIS_PREG` | **14** | `eisenEstado().hayDatos` |

Las cinco están registradas en **`IND_SECS`**, que pasa de **35 a 40** secciones, pegadas a las
otras de congénitas. **Ningún título es prefijo de otro ni ninguno es prefijo suyo**, que es lo
que `_indRepintarConservando` necesita y lo que **TC-533 (L5)** vigila.

### El molde, que no se reescribió

Es el de **`_indCIA`** y el de `_indTGA`. Cada sección devuelve:

- **`filas`** — la franja de datos del estudio que la sección LEE. **Lo que la pantalla ya tiene
  no se pregunta**: preguntarlo otra vez sería la segunda fuente que `_indOrigen` existe para
  evitar. Por eso Ebstein no pregunta los cinco selectores clínicos que su pantalla ya trae.
- **`clinica`** — las preguntas de tres estados, con `IND_OPS_SD` como centinela, y arriba la
  fila «Respuestas» con el recuento.
- **`bloques`** — las recomendaciones por guía, un bloque por cada una, más el bloque de
  diferencias y la lista «Recomendaciones que aplican con lo contestado».
- **`compacta: true`** y **`preguntas: true`** — el molde compacto y el reparto en dos columnas,
  que la regla fija pide para toda Evidencia de más de 6 preguntas.
- **`guia`** — la que RIGE, declarada.
- **`notas`** — lo que no se puede responder, y la frase de que lo contestado no viaja con el
  estudio.

### La regla «una pregunta, una guía»

Cada entrada de `*_PREG` lleva `clave`, `lbl`, `guia` (`'acc'` o `'esc'`), `rec` —la recomendación
con su clase, su nivel, su hoja y su folio—, y opcionalmente `ref` —la línea de referencia de la
OTRA guía— y `tramo` —cuando los tramos no coinciden—. La nota la arma `_indPregNota` y la
etiqueta, `_indPregBadge`.

### Las diferencias que se muestran y no se resuelven

| Sección | Diferencia |
|---|---|
| DSAV | diámetro telesistólico **40 mm** (ACC/AHA) contra **45 mm** (ESC); fracción de eyección **«<60 %»** contra **«≤60 %»**; grado de regurgitación **severa** contra **moderada a severa**; resistencia por la que se desaconseja, **>10 UW** contra **≥5 UW con desaturación**; y **dentro de la ACC/AHA**, su tabla escribe «40 mm o más» y su texto de apoyo «mayor de 40 mm» |
| Ebstein | grado de insuficiencia tricuspídea **al menos moderada** contra **severa**; qué pide cada una en el asintomático; cianosis **en reposo o con esfuerzo** contra **sólo en reposo**; clase del cierre aislado por embolia, **2b** contra **IIa** |
| Fontan | anticoagulación; vasodilatadores; cierre de la fenestración (sólo la ESC); hígado **anual** contra **regular** |
| CVPA | la ACC/AHA tiene apartado propio con su corte de Qp:Qs y la ESC **no publica tabla propia**; la resonancia es **Clase 1 · B-NR** contra «rara vez se necesita» |
| Eisenmenger | primera línea; terapia combinada; anticoagulación; embarazo |

---

## 3. Lo que esta tanda NO cambió, y hay que saberlo

- **Ningún campo, valor, opción, corte ni cálculo** de las pantallas de congénitas. Censo de
  campos guardados idéntico, Excel en **441** columnas con las mismas claves.
- **El papel.** Las cinco Evidencias **no llegan** al informe, al EN SUMA, al PDF ni al PPT, y sus
  respuestas **no viajan con el estudio**: viven en `_indClin`, la memoria efímera del panel, que
  es el mismo mecanismo de la CIA y de la transposición.
- **Los cortes que la pantalla del DSAV aplica**, que no son los de ninguna de las dos guías. La
  Evidencia lo dice; cambiarlo es decisión del médico (`P10-d`).

---

## 4. Las trampas que esta tanda pagó

1. **El `nohup … &` lanzado desde la herramienta de shell no sobrevive al envoltorio.** El primer
   censo de la biblioteca escribió cero bytes. Es lo que `C2A-h` ya documenta.
2. **La barra simple dentro de un template literal.** El bloque nuevo de la sonda usaba
   `/\s+/g` y, dentro del template de `MEDIR`, el template se come la barra: llegaba `/s+/` y
   borraba todas las eses. Se cerró **no usando ninguna expresión regular**.
3. **Un marcador que no discrimina es un control que no puede fallar.** Nueve mutaciones
   sobrevivieron al primer barrido y las nueve eran el mismo hueco: las condiciones miraban el
   objeto entero, donde la palabra aparece también en la nota de una pregunta. Hoy los folios se
   exigen en la **línea de Fuente** de cada bloque y las diferencias, **en su bloque**, con la
   frase entera.
4. **Y aun sobre el bloque, una cadena corta no alcanza:** «al menos moderada» aparece en dos
   líneas del bloque de diferencias de Ebstein, así que reescribir la primera pasaba en verde.
   La mutación 23 lo encontró.
5. **La franja de Eisenmenger no tiene id**, y un control que pide «mortalidad materna» y «50» lo
   cumple también «30 a 50 %»: la mutación 14 lo encontró. Hoy se compara el texto exacto.
6. **El extractor de texto de Celermajer está roto.** Su OCR devuelve «Aped 1992 :1091-a» por
   «April 1992:1041-6» y «CCLE55IAJER» por «CELERMAJER». **Todo lo de ese artículo se leyó en
   imagen**, que es por lo que esta casa lo manda.

---

## 5. Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Los diecisiete textos nuevos | `VINFO`, claves `cc9-*` |
| Lo que se retiró, literal | `docs/PENDIENTES.md` → **P10-a** |
| Las cinco secciones de Evidencia | `_indDSAV`, `_indEBS`, `_indFON`, `_indCVPA`, `_indEIS` |
| Sus preguntas | `DSAV_PREG`, `EBS_PREG`, `FON_PREG`, `CVPA_PREG`, `EIS_PREG` |
| El registro de secciones | `IND_SECS`, 40 entradas |
| Las hojas leídas, con su folio comprobado | `docs/fuentes/FUENTES.md` → «La tanda PANT-10» |
| Los casos | **TC-668** a **TC-673**; fichas en `docs/mapa/tests-fichas-668.md` |
| El barrido de mutaciones | `scripts/_mut_pant10.py`, 36 dirigidas |
| El A/B | `scripts/_probe_pant10ab.mjs` |
| Lo que quedó fuera | `docs/PENDIENTES.md` → **P10-b** a **P10-e** |

---

## 7. La geometría del panel con las cinco secciones abiertas

Medida en Chrome con las cinco lesiones cargadas y el panel abierto, a los cuatro anchos. El
corte de las dos columnas es `IND_COLS_CORTE` = **900 px** y se mide sobre el **PANEL**, no sobre
la ventana: **sin maximizar el panel mide 820 px tanto a 1440 como a 1000**, que es lo que esta
casa ya documenta desde PANT-2.

| ventana | panel | cuerpo | secciones con molde de dos columnas | scroll horizontal | textos recortados |
|---|---|---|---:|---:|---:|
| 1440 px | 820 × 852 | 818 × 745 | 5 de 5 | 0 | 0 |
| 1000 px | 820 × 852 | 818 × 745 | 5 de 5 | 0 | 0 |
| 768 px | 744 × 852 | 742 × 745 | 5 de 5 | 0 | 0 |
| 390 px | 366 × 852 | 364 × 729 | 5 de 5 | 0 | 0 |

**El alto de cada sección, a 1440 px** (ancho 790 en las cinco):

| sección | alto |
|---|---:|
| Defecto del septo auriculoventricular | 2.585 px |
| Anomalía de Ebstein | 2.648 px |
| Circulación de Fontan | **35 px — plegada** |
| Conexión venosa pulmonar anómala parcial | 2.152 px |
| Síndrome de Eisenmenger | 3.156 px |

⚠️ **LOS 35 px DE FONTAN NO SON UN DEFECTO DE ESTA TANDA, Y ESTÁ MEDIDO.** Una sección del panel
es un `<details>` y `_indSecHTMLCuerpo` le pone `open` cuando tiene un `aviso`, cuando alguna
fila alcanza un criterio (`marca` «ok» o «alarm») o cuando hay una recomendación alcanzada. Esa
regla **no se tocó**: cero líneas en el diff de la tanda. `_indFON` no publica `aviso` y con la
carga de la sonda ninguna de sus filas alcanza su criterio, así que la sección se pinta plegada
**con su cuerpo entero adentro —3.077 px— a un clic**. Las otras cuatro sí alcanzan uno con esa
misma carga.

⚠️ **Y no hay un «antes» que comparar**: contra HEAD el panel abre **0 de 5** de estas secciones
—no existen—, así que una tabla de alto antes y después de las cinco no tiene denominador. Lo que
sí se comparó, y sale idéntico, son el scroll horizontal, los recortes, los 17 globos y la franja
de Eisenmenger en sus 137 caracteres.
