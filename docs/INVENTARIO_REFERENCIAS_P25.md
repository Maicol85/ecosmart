# Inventario — la pestaña REFERENCIAS antes de la tanda PANT-25 (2026-11-08)

**SOLO LECTURA.** Este commit no cambia un byte de `index.html`: su md5 es el mismo antes y
despues (`b8481a9b`), 168.950 lineas, sello `v20261107-2204`.

Lo que sigue se midio sobre el arbol de `bc62db2` —`origin/main` = `HEAD`, el cierre de PANT-24,
ya publicado— con el pendrive `DISK_IMG` montado.

---

## 0 · ⚠️ LA PREMISA CENTRAL DE LA ORDEN NO SE REPRODUJO

El CONTEXTO de la orden afirma, textualmente, que «**las masas cardiacas y las fuentes
embolicas no tienen entrada en Referencias**». **Las dos tienen entrada**, y desde hace cuatro
dias:

| ficha | id | titulo de hoy | la creo | linea |
|---|---|---|---|---|
| masas | `tumores` | 🧠 Tumores cardiacos — benignos, malignos y secundarios | **PANT-11, commit 10** (2026-11-04) | 23487 |
| embolias | `embolig` | 🩸 Fuentes embolicas — que evaluar y en que orden | **PANT-11, commit 11** (2026-11-04) | 23527 |

Y la **decision (4) de la orden ya esta cumplida hoy**: las dos viven DENTRO de «Otros
hallazgos» y son **adyacentes** en el reparto —`… 'pop', 'tumores', 'embolig', 'cardiotox' …`—,
o sea «dos pestanas del mismo sector, juntas». Lo fija **TC-679 (D1)(D2)**.

**Consecuencia para los commits 4 y 5:** no hay ninguna pestana que crear. Lo que esos dos
commits pueden hacer es **completar** las dos fichas con los bloques que les faltan, leyendo las
fuentes en imagen. El detalle de que falta esta en el § 5.

---

## 1 · (a) LA ESTRUCTURA

### 1.1 · El dueno unico del reparto

`REF_SUBTAB` (linea **80316**) es el dueno unico: el marcado NO lleva el reparto escrito.
`refSubInit()` (linea **80377**) reubica cada tarjeta al arrancar leyendo esa tabla, una sola
vez (`bar.dataset.refSubInit`). **El censo de entradas ES la tabla.**

`REF_SUB_ORDEN` (linea **80355**) fija el orden de la barra y la navegacion por teclado.
`REF_SUB_BLOQUES` (linea **80362**) pone un rotulo antes de una entrada.

### 1.2 · Las SEIS pestanas principales, en su orden de hoy

| # | pestana | id del boton | id del panel | entradas (en orden) |
|---|---|---|---|---|
| 1 | 🧮 Calculadoras | `ref-subtab-calc` | `ref-sub-calc` | *(lista vacia a proposito: su contenido son las tarjetas de `#tab-calculadoras`, que se mudan enteras)* |
| 2 | 📏 Dimensiones | `ref-subtab-dim` | `ref-sub-dim` | `ai`, `vi2`, `vi`, `vd2`, `ad` |
| 3 | 📈 Funcion | `ref-subtab-fun` | `ref-sub-fun` | `htp`, `tep`, `hfapeff`, `strain` |
| 4 | 🫀 Valvulas | `ref-subtab-valv` | `ref-sub-valv` | `nativas` (im, em, ia, eao, it) · `protesicas` (pao, pm, trombo, viv, endo, ppulm, ptric) |
| 5 | 🩸 Aorta | `ref-subtab-ao` | `ref-sub-ao` | `ao2`, `ao`, `aocx` |
| 6 | 🔎 Otros hallazgos | `ref-subtab-otros` | `ref-sub-otros` | `oai`, `burbujas`, `fop`, `coronarias`, `pericardio`, `constriccion`, `pulmon`, `pop`, `tumores`, `embolig`, `cardiotox`, `miocard`, `congenitas`, `formulas` |

**Censo medido: 40 entradas** —28 de primer nivel + 12 hijas de los dos agrupadores (5 nativas +
7 proteticas)—. **38 indexadas** por el buscador: las 40 menos los dos agrupadores, que se
excluyen por una compuerta ESTRUCTURAL («un agrupador es el que contiene otra entrada»).
El marcado de la barra esta en **22144-22164**.

### 1.3 · Donde vive hoy cada contenido que la orden mueve

| contenido | id | linea de la ficha | vive hoy en |
|---|---|---|---|
| Cardiopatias Congenitas del Adulto (ESC 2020) | `congenitas` | 23680 | Otros hallazgos |
| Anomalias coronarias congenitas — trayecto | `coronarias` | 23710 | Otros hallazgos |
| Cardiotoxicidad — CTRCD (ESC Cardio-Oncologia 2022) | `cardiotox` | 23574 | Otros hallazgos |
| Posoperatorio de cirugia cardiaca | `pop` | 23446 | Otros hallazgos |
| Constriccion vs restriccion (ESC 2025) | `constriccion` | 23320 | Otros hallazgos |
| Derrame Pericardico y **Taponamiento** (ESC 2025) | `pericardio` | 23272 | Otros hallazgos |
| Calculadoras | *(sin `ref-<id>`)* | 80417 | pestana propia, la PRIMERA de la barra |
| «Ver referencia» | `VINFO_REF` | 80827 | 40 claves de tarjeta ⓘ |

⚠️ **EL TAPONAMIENTO NO TIENE FICHA PROPIA**: vive dentro de `pericardio`, cuyo titulo dice
«Derrame Pericardico y **Taponamiento**». Es el unico candidato que existe para el tercer
contenido que la decision (1) le pide a Hemodinamica, y moverlo mueve tambien el derrame.
Queda declarado.

⚠️ **NO EXISTE NINGUNA FICHA de VExUS, Forrester, resistencia vascular sistemica ni indice
cardiaco** en Referencias, aunque los cuatro existen en la pestana Hemodinamica de la app. O
sea que la pestana Hemodinamica de Referencias nace con **tres** entradas y no con mas.

### 1.4 · El orden de la columna izquierda de la app (medido en 5492-5550)

**Rail izquierdo**, en orden: `datos` (👤 Paciente) · `ai-vi` (❤️ AI / VI) · `vd` (▶️ VD / AD) ·
`doppler` (〰️ Doppler) · `valvulas` (🔲 Valvulas) · `contractilidad` (🎯 Contractilidad) ·
`sgl` (📐 SGL) · `pericardio` (⚪ Pericardio y pulmon) · `otros` (🗂️ Otros) ·
`imagenes` (🖼️ Imagenes) · *separador* · `config` (⚙️ Config). **Once botones.**

**Fila de arriba (solo Modo Avanzado)**, en orden: `hemodinamica` (🫀 Hemodinamica) ·
`ete` (🔬 ETE) · `cardioOnco` (❤️ Cardio-Oncologia) · `amiloidosis` (🧬 Amiloidosis) ·
`congenitas` (🧬 C. Congenitas).
**Fila de abajo (siempre):** `refs` (📚 Referencias).

### 1.5 · ⚠️ LA TABLA DE CORRESPONDENCIA — y las CINCO que NO son univocas

| pestana de Referencias | pestana(s) de la app | univoca |
|---|---|---|
| 🧮 Calculadoras | *ninguna* (es una herramienta de Referencias) | **NO** |
| 📏 Dimensiones | `ai-vi` **y** `vd` — dos pestanas | **NO** |
| 📈 Funcion | `doppler`, `contractilidad`, `sgl`, `hemodinamica` — ninguna sola | **NO** |
| 🫀 Valvulas | `valvulas` | **si** |
| 🩸 Aorta | *ninguna* (la aorta se carga en `otros` y en `vd`) | **NO** |
| 🔎 Otros hallazgos | `otros` | **si** |
| *(nueva)* Cardiopatia congenita | `congenitas` | **si** |
| *(nueva)* Cardiotoxicidad | `cardioOnco` | **si** |
| *(nueva)* Hemodinamica | `hemodinamica` | **si** |

**CINCO de las seis que ya existen no tienen correspondencia univoca.** La orden manda parar esa
parte y anotarla (P25-a) — y **no bloquea nada**, porque la propia decision (2) prohibe
reorganizar lo existente: las cinco se quedan donde estan. Lo unico que se decide con esta tabla
es **donde entran las tres nuevas**, y las tres SI son univocas.

⚠️ **DOS PARTES DE LA ORDEN DAN ORDENES DISTINTAS PARA LAS TRES NUEVAS.** El titulo de la tanda
las enumera «Cardiopatia congenita …, Cardiotoxicidad y Hemodinamica, **todas antes de Otros
hallazgos**», y la decision (1) pone a Cardiopatia congenita «junto a Valvulas y Aorta y ANTES de
Otros hallazgos». La fila de arriba de la app, en cambio, las tiene al reves: Hemodinamica,
Cardio-Oncologia, C. Congenitas. **Se aplica el orden EXPLICITO del titulo**, que es una
instruccion directa, y no el derivado de «copia el de la columna izquierda».

**Orden nuevo:** `calc, dim, fun, valv, ao, congenitas, cardiotox, hemo, otros` — **nueve**.

---

## 2 · (b) LOS ENLACES — como resuelve cada uno

| enlace | dueno | linea | resuelve por | ¿depende del orden o de la posicion? |
|---|---|---|---|---|
| boton de la barra | marcado + `refSubTab(sub, el)` | 22151-22156 / 80561 | **id** `ref-sub-<sub>` | no |
| navegacion por flechas / Home / End | `REF_SUB_ORDEN` | 80426-80434 | **posicion en el arreglo** | **SI** (es su proposito) |
| «Ver referencia» de una tarjeta ⓘ | `VINFO_REF` → `refIr(id)` | 80827 / 80695 | **id** `ref-<id>`, y la subpestana se **deriva del DOM** (`closest('.ref-subpanel')`) | **no** |
| coincidencia del buscador | `refIr(id)` | 80807 | idem | **no** |
| indice del buscador | `_refIndiceArmar` | 80634 | recorre `REF_SUB_ORDEN` y lee el panel; el id sale del `onclick` por `indexOf` | **no** para el id; **SI** para el ROTULO (ver abajo) |
| «← Volver» | `_refVuelta` | 22141 | pestana + `scrollY` guardados | no |
| assert de arranque | `_vinfoRefAssert` | 80874 | exige que toda clave exista y que su destino exista | no |
| apertura de un agrupador antes que su hija | `refIr`, bucle de padres | 80703-80712 | sube por el DOM hasta `.ref-subpanel` | **no** |

### ⚠️ EL UNICO ENLACE QUE SE ROMPE SOLO: `SUBTIT`

`_refIndiceArmar` (linea **80648**) lleva un **objeto literal de SEIS claves**:

```
const SUBTIT = { calc: 'Calculadoras', dim: 'Dimensiones', fun: 'Funcion', valv: 'Valvulas',
                 ao: 'Aorta', otros: 'Otros hallazgos' };
```

Una pestana nueva en `REF_SUB_ORDEN` **sin** su clave en `SUBTIT` hace que el buscador muestre la
**clave cruda** en vez del nombre de la seccion (`subTit: SUBTIT[sub] || sub`). El propio
comentario de `calc` ya avisa de esto. **Las tres claves nuevas van a `SUBTIT` en el mismo commit
que la pestana.**

### ⚠️ EL ROTULO DE BLOQUE QUE EL MOVIMIENTO DEJA MINTIENDO

`REF_SUB_BLOQUES.otros` tiene hoy tres rotulos: `antes:'oai'` → «**Orejuela, shunts y
coronarias**», `antes:'pericardio'` → «Otras entidades», `antes:'formulas'` → «Formulas».

El movimiento los golpea de dos formas:
1. **`coronarias` sale de ese bloque**, asi que el rotulo nombraria un tema que ya no esta ahi.
2. **`pericardio` sale del reparto de `otros`**, asi que el rotulo «Otras entidades» **pierde su
   ancla** y `refSubInit` no lo emite nunca: el bloque desaparece sin aviso.

Las dos son consecuencias forzadas del movimiento, no decisiones nuevas, y las dos se declaran.

---

## 3 · (c) EL FORMATO de una tabla de Referencias

Las tablas de las fichas se arman **con estilos en linea**, no con una clase propia. El molde
medido en `ref-tumores` y `ref-embolig`:

```
<table style="width:100%;border-collapse:collapse;font-size:12px;">
  <tr style="background:var(--section-head);">
    <th style="padding:6px 8px;text-align:left;color:var(--accent2);">…</th>
  <tr style="border-bottom:1px solid var(--border);background:var(--bg3)">   <- filas impares
  <tr style="border-bottom:1px solid var(--border)">                          <- filas pares
    <td style="padding:5px 8px;">…</td>
```

- **Rotulo de bloque dentro de una ficha:**
  `<div style="font-size:11.5px;font-weight:700;color:var(--accent2);margin:2px 0 6px;">`
  (y `margin:14px 0 6px` del segundo en adelante).
- **Pie de fuente y regla de folio:**
  `<div style="font-size:11px;color:var(--text2);margin-top:8px;line-height:1.5;">`
- **Forma de la cita:** el documento con su ano, la **hoja** del PDF y el **folio impreso** en
  negrita — «JACC CardioOncology 2024 · hoja 2, folio **848**» —, y la **regla de folio** con
  las hojas donde se comprobo, en el pie de la ficha.
- **Clase y nivel** solo donde la fuente los imprime, en la forma `Clase 2a · Nivel B-R`
  (medido en `ref-embolig`, bloque 2).

### El mecanismo de pantalla angosta que esta casa YA usa

**No es un `font-size` mas chico ni un reflow**: es **scroll propio del contenedor**, nunca de la
pagina. Medido en 25818-25824:

```
.masa-ref-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
.masa-ref-tabla{border-collapse:collapse;width:100%;min-width:900px;font-size:11px;line-height:1.45;}
.masa-ref-tabla th,.masa-ref-tabla td{border:1px solid var(--border);padding:6px 8px;vertical-align:top;text-align:left;}
.masa-ref-tabla thead th{background:var(--section-head);color:var(--accent2);font-size:10.5px;font-weight:700;position:sticky;top:0;}
.masa-ref-tabla tbody td:first-child{white-space:nowrap;}
```

Las tablas **de tres columnas** de las fichas de Referencias no lo necesitan y no lo llevan.
Una tabla nueva **ancha** (mas de tres columnas) usa este mecanismo.

### Como se indexa para el buscador

El indice **no es una lista de palabras clave**: `_refIndiceArmar` toma el `textContent` del
`.card` entero mas el titulo del `h2.card-head`, y lo normaliza con `_refNorm` (minusculas, sin
diacriticos por NFD, y **coma decimal a punto**). Una tabla nueva **se indexa sola** por estar
dentro de la tarjeta. **Condicion:** la tarjeta tiene que tener un `h2.card-head` con
`onclick="toggleRef('<id>')"` y un hermano `id="ref-<id>"`.

---

## 4 · (d) LO QUE YA EXISTE de variantes, Lambl, trombos, vegetaciones y masas

**No se repite nada de esto.**

### 4.1 · En la pestana OTROS (no en Referencias)

| que | donde | linea |
|---|---|---|
| Nueve campos `masa_*` del estudio | seccion de masas de `#tab-otros` | ~11475 |
| **Tabla de diferenciales** `masa-ref-tabla`, **siete filas** y **siete columnas** | `#tab-otros`, acordeon «Como distinguirlas (referencia)», **cerrada por defecto** | 11519-11600 |
| Seis casillas de variantes anatomicas (`otr_var_eustaquio`, `otr_var_chiari`, `otr_var_lambl`…) | `#tab-otros` | 11347-11375 / 74888 |
| Globo `masa-ref` — «Que estudio complementario conviene cuando hay dudas» | registro de globos | 50518 |
| Globo `masa-ref-ei` — «Endocarditis: germenes, cirugia y **riesgo embolico**» | registro de globos | 50475 |

**Las siete columnas de la tabla de Otros:** Entidad · Localizacion tipica · Aspecto · Movilidad ·
Relacion con la valvula o la pared · Hallazgos que acompanan · Fuente.
**Las siete filas:** Vegetacion · Fibroelastoma papilar · Mixoma · Trombo del ventriculo
izquierdo · Excrecencias de Lambl y filamentos · Trombo y pannus sobre una protesis · Variantes
normales.

⚠️ **ESA TABLA ES, EN SUSTANCIA, LA TABLA DE ENTIDADES CONTRA RASGOS QUE PIDE LA DECISION
(5)(iii)** —localizacion, forma, movilidad y relaciones, una fila por entidad—, y ya existe,
con su fuente por fila. Lo que no trae de esa decision es **ecogenicidad y comportamiento con
contraste** como columna propia (esta repartido dentro de «Aspecto» y «Hallazgos que acompanan»)
y **tamano** como columna propia (esta dentro de «Aspecto»).

⚠️ **LOS PREDICTORES DE EMBOLIA EN LA ENDOCARDITIS, que pide la decision (6), YA EXISTEN** en el
globo `masa-ref-ei`: tamano y movilidad de la vegetacion, con el corte de tamano guia por guia
(10 mm o mas en la ESC 2023; mas de 10 mm en la ACC/AHA 2020, Clase 2b · Nivel B-NR; mas de 10 a
15 mm en la ASE 2016), y la declaracion de que la biblioteca no tiene ningun score validado.
**En la pestana Otros, no en Referencias.**

### 4.2 · En REFERENCIAS

| ficha | que trae hoy |
|---|---|
| `tumores` | **Trece filas** de datos (Dato · Que dice la fuente · Fuente): proporcion de benignos, reparto de malignos, secundarios, siete aspectos de entidad (mixoma, fibroelastoma, lipoma, quiste, angiosarcoma, linfoma, metastasis), las **seis senales de alarma** de malignidad, que metodo conviene, y la clasificacion de la OMS |
| `embolig` | **Bloque 1:** siete filas de estructuras por potencial embolico, con la columna «Que metodo rinde mas» (ETT contra ETE). **Bloque 2:** los **nueve pasos** del estudio del ictus de la AHA/ASA 2021, con clase y nivel |
| `trombo` | ⚠️ Trombosis vs Pannus (subpestana Valvulas, protesicas) |
| `endo` | 🦠 Endocarditis Protesica (ESC 2023) |
| `oai` | 👂 Orejuela Izquierda y Cierre Percutaneo |

### 4.3 · ⚠️ DOS FILAS DE `ref-tumores` CHOCAN CON LA REGLA DEL 08/11 QUE LA ORDEN FIJA

La regla dice que **ningun texto visible expone lo que esta pendiente o sin resolver**, y que lo
que no tiene fuente leida **no se muestra**. Las dos filas:

1. «**Seis senales de alarma** …» cierra con «*los cortes de esos puntajes no se citan aca porque
   no se leyeron con certeza*».
2. «**Clasificacion de la OMS** — *No esta en la biblioteca.* La fuente la cita como su
   referencia 1 …», con la celda de Fuente en «—».

La verificacion que la orden le pide al commit 4 —«no aparece … las palabras pendiente, sin
fuente, proximamente o no se encontro»— **obliga a resolverlas**: o se leen los puntajes con
certeza y se publican, o la fila y la clausula **no se muestran**.

---

## 5 · QUE FALTA DE VERDAD en los dos temas, medido contra las decisiones (5) y (6)

| decision | que pide | estado medido |
|---|---|---|
| (5)(i) | clasificacion y frecuencia, cada cifra con su fuente | **EXISTE** en `ref-tumores`, cinco filas |
| (5)(ii) | clinica | **FALTA como bloque**. Hay retazos dentro de la tabla de Otros (mixoma: disnea y embolia; fibroelastoma: ictus, AIT y un tercio asintomaticos) |
| (5)(iii) | tabla entidades × rasgos | **EXISTE** en la pestana Otros, siete filas × siete columnas |
| (5)(iii) | banderas de malignidad | **EXISTEN** en `ref-tumores`, las seis |
| (5)(iii) | los puntajes de las fuentes que los traigan | **NO PUBLICADO**, y declarado como no leido con certeza |
| (5)(iv) | contraste, ETE, resonancia, tomografia y PET | **PARCIAL**: contraste y ETE en el globo `masa-ref` y en una fila de `ref-tumores`; tomografia solo para trombo contra pannus. **Faltan resonancia y PET** |
| (5)(v) | conducta, tal como la fuente la dice | **FALTA por completo** |
| (6) | algoritmo de alto y bajo potencial | **EXISTE**, siete filas |
| (6) | cuadro ETT contra ETE | **EXISTE**, como columna del mismo cuadro |
| (6) | las sensibilidades que la fuente de | **FALTAN** |
| (6) | predictores de embolia en la endocarditis | **EXISTEN**, en el globo `masa-ref-ei` de la pestana Otros |

**Trabajo real de los commits 4 y 5:** los puntajes (si se leen con certeza), la clinica, la
resonancia, la tomografia y el PET, la conducta, las sensibilidades, y resolver las dos filas
del § 4.3.

---

## 6 · (e) LOS CASOS que afirman la ubicacion o el orden

Buscados **por los literales exactos** de los ids y titulos que se mueven —`REF_SUBTAB`,
`REF_SUB_ORDEN`, `ref-subtab-`, `ref-sub-`, `refSubTab`, `refIr(`, `VINFO_REF`, `'coronarias'`,
`'cardiotox'`, `'congenitas'`, `'tumores'`, `'embolig'`, `'pericardio'`, `'constriccion'`,
`'pop'`, `Otros hallazgos`, `ref-busca`, `_refIndice`, `ref-tumores`, `ref-embolig`, `masa-ref`,
`SUBTIT`— y no por palabras sueltas, que es la leccion (j).

**El archivo de casos tiene 775 casos distintos**, contados nombre por nombre.

### 6.1 · Los que SE ROMPEN, con su condicion exacta

| caso | condicion | texto exacto | por que cae |
|---|---|---|---|
| **TC-502** | (A1) | «hay SEIS subpestanas, en orden, con Calculadoras PRIMERA» | pasan a **nueve** |
| **TC-502** | (A4) | «el reparto es 5 Dimensiones + 4 Funcion + 14 Valvulas + 3 Aorta + 14 Otros» | «Otros» pierde seis entradas y nacen tres paneles |
| **TC-502** | (A2b) | «y la que entro es la de constriccion, en la subpestana Otros hallazgos» | `constriccion` pasa a Hemodinamica |
| **TC-509** | (F3) | «son SEIS subpestanas de Referencias y el censo de entradas NO se movio» | pasan a **nueve** |
| **TC-679** | (D3) | «la ficha de tumores tiene sus CATORCE filas y cada una su folio» | cae si se le agrega o se le quita una fila |
| **TC-679** | (D4) | «la ficha de fuentes embolicas tiene sus DIECIOCHO filas» | idem |

**Los tres son adaptables con el motivo escrito**, porque afirman justo lo que la orden cambia:
la ubicacion y el conteo de las pestanas.

### 6.2 · Los que NO se rompen, y por que (hay que comprobarlo, no suponerlo)

| caso | condicion | por que aguanta |
|---|---|---|
| TC-502 | (A2) «el censo encuentra las 40 entradas» | ninguna entrada se crea ni se borra |
| TC-502 | (A3) «NINGUNA entrada quedo fuera de una subpestana» | las seis que se mueven van a un panel nuevo |
| TC-502 | (B1) «su indice tiene las 38 entradas» | el indice recorre paneles, no una lista |
| TC-502 | (C1)(C2) «50 claves … el assert no encuentra ningun destino inexistente» | `VINFO_REF` apunta a `ref-<id>`, que no cambia |
| TC-502 | (A5)(A6)(A7) | se derivan de `REF_SUB_ORDEN`, que se actualiza |
| TC-679 | (D1) «las dos viven DENTRO de «Otros hallazgos»» | las dos se quedan ahi |
| TC-679 | (D2) «estan en el reparto de subpestanas, no sueltas» | idem |
| TC-679 | (D6) «el buscador de Referencias INDEXA las dos» | idem |
| TC-679 | (B0)-(B4) la tabla de Otros | esta tanda no la toca |
| TC-679 | (C0)-(C5) los dos globos | esta tanda no los toca |
| TC-509 | (A1)(A2) el rail y la fila de arriba de la **app** | esta tanda no mueve una pestana de la app |
| TC-513 | «Otros hallazgos», `REF_SUBTAB` | mide el FOP, no el reparto |
| TC-531 | `ref-subtab-` ×8, `ref-busca` ×5 | maqueta y buscador, derivados de la barra |
| TC-519 | `refBuscar` ×7 | el buscador, por su mecanismo |
| TC-533 / TC-534 / TC-547 | conteos de `REF_SUBTAB` | **a comprobar en la corrida**: si cuentan paneles, caen |
| TC-510 / TC-546 / TC-517 / TC-495 / TC-530 / TC-144 / TC-520 / TC-548 / TC-652 | varios | no afirman el orden de la barra |

**La base de los casos de esta lista se guarda ANTES de tocar nada**, corrida sobre
`bc62db2`.

---

## 7 · LO QUE NO CAMBIA, y como se comprueba

| que | valor de hoy | como se mide |
|---|---|---|
| campos guardados | censo inicial, con `camposEstudio` y no con `camposGuardados` | la sonda del A/B |
| columnas de Excel | **457** | el A/B, clave por clave |
| ids existentes | ninguno cambia (los `ref-<id>` se conservan aunque cambien de panel) | el censo de `REF_SUBTAB` |
| el papel | identico a HEAD en todo | A/B con PDF y PPT generados de verdad |
| Semgrep | 124 WARNING / 0 ERROR | al cierre |
| celular | 59 hallazgos a 360 px y 67 a 390, 18 ALTA en cada ancho | `check_mobile.js` |
| suite | 769/775, rojos TC-223, TC-376, TC-390, TC-406, TC-182 y TC-706 | una sola pasada al final |
