# PR7 — La paleta propia del strain, el ingreso de datos numéricos y el PDF de los dos bull's eye

Tanda **PR7**, 23 y 24/11/2026. Mapa de lo que esta tanda movió en la pestaña **SGL**, en los
**patrones de ejemplo** y en la hoja **«Contractilidad y strain longitudinal (SGL)»** del PDF.

Lo que **no** toca, y es parte del mapa: la paleta de la **motilidad** (`CONTR_MOTILIDAD`), el
**mapa de SGL calculado por territorios** del visor (`_strTono`), los cortes del SGL global
(`SGL_NORMAL_MAX` / `SGL_ANORMAL_MIN`), el campo **SGL global** y los **cuadros del PDF**.

---

## 1 · La paleta: ocho tramos entre −20 y +20, más SIN DATO

**Decisión de Maicol del 23/11/2026.** Paleta **propia** de la aplicación, de violeta a azul.
Nunca se dice ni se insinúa que sea igual a la de otra marca.

El dueño único es **`STRAIN_PAL`**, y vive en el **bloque de constantes de SGL** (al lado de
`sglNeg` y `SGL_CATS`), **no** en el bloque del bull's eye.

> ⚠️ **POR QUÉ ESTÁ AHÍ Y NO JUNTO AL DIBUJO.** Los **patrones de ejemplo** (`const C`, el objeto
> de ocho claves) consumen los colores **en su propia definición**, en un bloque de `<script>`
> **anterior** al del bull's eye. Un `const` de nivel de script vive en el entorno léxico global,
> pero **no está disponible desde un bloque anterior**: cae en la zona muerta, y `typeof` sobre la
> zona muerta **también lanza**, así que una guarda con `typeof` no protege. Con la paleta abajo,
> el bloque de los patrones abortaba entero.

| índice | color | rango | color del número |
|---|---|---|---|
| 0 | `#D4D4D0` | **Sin dato** | `#2B2B2B` |
| 1 | `#6A1B9A` | −20 a −15 | `#FFFFFF` |
| 2 | `#9B59C4` | −15 a −10 | `#FFFFFF` |
| 3 | `#C9A3E0` | −10 a −5 | `#2B2B2B` |
| 4 | `#E6D5F0` | −5 a 0 | `#2B2B2B` |
| 5 | `#D3E3FA` | 0 a +5 | `#2B2B2B` |
| 6 | `#9DBFF2` | +5 a +10 | `#2B2B2B` |
| 7 | `#5C8CE0` | +10 a +15 | `#FFFFFF` |
| 8 | `#2450C0` | +15 a +20 | `#FFFFFF` |

**El índice 0 NO es un tramo: es SIN DATO.** De eso depende la migración (§4).

### El dueño único del tramo de un número

`strainTramoDe(n)` = `clamp(floor((n − (−20)) / 5) + 1, 1, 8)`.

- **Un valor en un borde cae en el tramo de su DERECHA**, y lo hace el **piso**, no un `if` por
  caso: −15 → 2, −10 → 3, −5 → 4, 0 → 5, +5 → 6, +10 → 7, +15 → 8.
- **Los extremos los pone el acote y no un rechazo**: −30 → 1 y +25 → 8. **No se bloquea el
  ingreso**; el número se publica tal cual.
- `−20 → 1` y `+20 → 8`.

Medido en TC-1042: los ocho bordes caen cada uno en su tramo, 1 a 8.

### Quién lee la paleta

Un solo dueño del color, leído por **cinco** superficies: el bull's eye de la pantalla
(`sglDibujarBullseye` → `strainColor` / `strainColorTxt`), el del **papel** y el del **PPT**
(`bullseyeDataURL`), los **patrones de ejemplo** (`const C` por `_CT(i)`) y las **dos leyendas**
(`strainLeyendaHTML`, más la barra del PDF y la del PPT, que leen `STRAIN_PAL` y `STRAIN_MARCAS`).

---

## 2 · El modelo de estado y la única escritura

- **`strainEstado[id]`** → 0 a 8. El 0 es sin dato.
- **`strainNum[id]`** → el número, **sólo** donde el médico escribió uno.

**`strainSet(id, idx, num)` es la ÚNICA escritura**, y es lo que impide que el color y el número
se contradigan: el tramo se **deriva** del número cuando hay número, y el número se **borra**
cuando el tramo lo elige un toque.

- `strainEscribir(id, txt)` → parsea, y con texto vacío manda a **sin dato**.
- `strainCiclar(id)` → `(idx + 1) % 9`, **nueve** estados, y borra el número.
- `sglReset()` → vacía los **dos** almacenes, cierra la casilla y repinta.
- `strainHayDatos()` → algún estado **mayor que cero**. Es la **misma pregunta** que el PDF y el
  PPT ya hacían, así que sus dos compuertas no cambiaron una línea.

**Lectores para medir, no el objeto**: `strainEstadoDe`, `strainNumDe`, `strainNumCuantos` y
`strainSnapshot`. `strainEstado` y `strainNum` se quedan como `const` de nivel de script: colgarlos
de `window` los dejaría escribibles desde cualquier parte, que es el riesgo que el comentario de
`contrEstado` señala.

---

## 3 · El signo, y en qué se aparta del campo SGL global

`strainParseNum(txt)`:

- normaliza el **menos tipográfico** (U+2212), el **en dash** (U+2013) y el **em dash** (U+2014);
- acepta **coma o punto** decimal y redondea a **un decimal**;
- **sin signo → NEGATIVO**, igual que el campo SGL global;
- **con `+` explícito → POSITIVO**;
- `0` es `0`; lo vacío y lo que no es número devuelven `null`.

> ⚠️ **NO SE PUDO REUSAR `sglNeg`, Y ESA ES LA DIFERENCIA.** `sglNeg` hace **−|x| siempre**, así
> que un `+18` se vuelve −18: por ese camino **no habría forma de cargar un valor positivo**, que
> es justo lo que un segmento discinético necesita. Lo que se replica es la mitad que sí aplica
> —sin signo, negativo—; el `+` explícito es la salida que el campo global no tiene.

---

## 4 · El guardado, y cómo abre un estudio con los cinco estados viejos

**Tres claves de `campos`**, que es donde ya vivía el estado del strain:

| clave | qué guarda |
|---|---|
| `strain_sgl` | los índices de tramo, 0 a 8 |
| `strain_sgl_num` | los números, sólo los que hay |
| `strain_sgl_ver` | `'2'`, la **marca de versión del modelo** |

**Ninguna es un control con `id`**, así que no agregan un campo al censo del estudio ni una columna
al Excel, que exporta por `LAB_XLS_MAP`. Medido en los dos árboles con la misma sonda: **812
`input[id]` / 297 `select[id]` / 29 `textarea[id]`** y **381** claves de `LAB_XLS_MAP`, los cuatro
idénticos, con el detector de que son dos árboles diciendo NO en el base y SÍ en el vivo.

### La migración

Lo que decide si hay que migrar es **`strain_sgl_ver`**, y **no** la presencia de los números: un
estudio **nuevo** en el que nadie escribió ninguno guarda igual su marca, así que mirar los números
confundiría ese caso con un estudio viejo y lo migraría dos veces.

`STRAIN_MIGRA = [0, 2, 3, 5, 7]`:

| estado viejo | significado | tramo nuevo |
|---|---|---|
| 0 | Normal | **0 — SIN DATO** |
| 1 | Hipoquinesia leve | 2 (−15 a −10) |
| 2 | Hipoquinesia | 3 (−10 a −5) |
| 3 | Acinesia | 5 (0 a +5) |
| 4 | Discinesia / aneurisma | 7 (+10 a +15) |

> ⚠️ **EL 0 VIEJO VA A SIN DATO, Y ES LA DECISIÓN DE FONDO.** En el modelo viejo el 0 era a la vez
> «Normal» en rojo, el valor **por omisión** del segmento que nadie tocó y el que dejaba
> «Limpiar»: **indistinguible**. Mandarlo a sin dato es el único lado que no afirma una evaluación
> que nadie hizo. **A ninguno de esos segmentos se le escribe un número**: lo que el modelo viejo
> guardaba era un color, no una medición.

**El número se repone sólo donde el tramo guardado coincide con el que ese número deriva.** Un par
que no cierra deja el **color** —que es lo que el médico vio— y descarta el número: un color
diciendo una cosa y un número otra, en el papel firmado, es exactamente lo que `strainSet` existe
para impedir.

**El respaldo de la reimpresión** (`strainBackup`) lleva las **tres** claves. Con sólo los índices,
una reimpresión devolvía el color y perdía los números.

---

## 5 · El interruptor «Ingresar datos numéricos» y la casilla

- **`strainNumModo`**, un booleano **en memoria**. No va a `localStorage` ni al guardado del
  estudio: no es un dato del paciente, es un **modo de trabajo**, igual que el interruptor del
  resumen de válvulas de PR6. «Nuevo estudio» no lo apaga.
- Botón `#sgl-num-toggle`, **44 px** de alto, con `aria-pressed` y su globo **`sgl-num`**
  (descriptivo: no nombra ninguna guía, ningún folio y ninguna marca).
- `strainTocar(id, el)` es **la única puerta del gesto**: con el modo apagado cicla, con el modo
  encendido abre la casilla.

### La casilla

`strainCajaAbrir` crea un `<input type="text">` **sin un solo `id`** —se alcanza por
`data-strain-caja`—, de **72 × 44 px**, posicionado sobre el **centro de la cuña** con los
atributos `data-strain-cx` / `data-strain-cy` que el dibujo emite, y **se destruye al cerrar**.

- **Enter** o **salir del campo** confirman; **Escape** cancela.
- El `keydown` de Escape va con **`stopPropagation`**: el oyente genérico de accesibilidad busca el
  diálogo visible y le aprieta su botón de cerrar, así que sin cortarlo cancelar la casilla
  cerraría otra cosa.
- `strainCajaCerrar` **suelta la referencia ANTES de quitar el nodo**: quitar un elemento enfocado
  dispara `blur`, y con la referencia puesta esa segunda vuelta volvería a confirmar.
- Apagar el interruptor **cierra** la casilla que estuviera abierta.

---

## 6 · El dibujo: los números dentro de los segmentos

**Dos dibujantes, la misma geometría y el mismo orden de pintado:**

- **SVG** (`sglDibujarBullseye`): los 17 `path`/`circle` con `data-strainid`, y **después** los 17
  `<text>` con el mismo `data-strainid`, `pointer-events:none` y `dominant-baseline:central`.
- **Canvas** (`bullseyeDataURL(getColor, getTexto, getTxtColor)`): los dos argumentos de texto son
  **opcionales**, así que la motilidad lo llama con uno solo y sale **exactamente igual que antes**.

> ⚠️ **LOS NÚMEROS SE ESTAMPAN DESPUÉS DE LAS 17 CUÑAS, en los dos.** Dibujados en el mismo paso,
> el relleno del segmento siguiente tapa el número del anterior en el borde común.

El centro de una cuña se calcula con la **misma convención angular** que `contrDescribirCuna`
(0 arriba, sentido horario): `rm = (rInt + rExt) / 2`, `am = ((a0 + a1) / 2 − 90)·π/180`.

`strainAplicar(id)` reparte por `tagName`: a un `text` le escribe el **texto** y el color del
número; a lo demás, el **relleno**. `strainAplicarTodos` deduplica por id (hay dos nodos por
segmento).

---

## 7 · Las leyendas

**`strainLeyendaHTML()` es el dueño único** de la barra de pantalla, y la pintan los nodos marcados
`data-strain-leyenda`: hay **dos**, la del paciente (`"sgl"`) y la de los **patrones de ejemplo**
(`"patrones"`). Con dos armadores la pantalla y el papel podrían rotular los mismos colores con
rangos distintos.

Forma: **ocho cuadritos pegados** con sus ocho marcas debajo (−20, −15, −10, −5, 0, +5, +10, +15) y
un **cuadrito gris «Sin dato»**. **Sin nombres de categoría.** Título: **«Referencia de colores»**.

En el **PDF**, la misma barra la dibuja `_pdfTile` cuando la parte trae `barra: true`; en el
**PPT**, `_barra(...)`.

> ⚠️ **EN EL PPT ES UNA BARRA Y NO NUEVE FILAS, y no es estética**: con nueve filas de 0,17″ la
> leyenda medía **1,53″** y le comía al dibujo y al texto más de media pulgada de las dos y media
> que la diapositiva tiene entre el título y el filete del pie. La barra mide **0,42″** y rotula
> los mismos ocho rangos.

---

## 8 · Los patrones de ejemplo

`const C` pasa a leer `STRAIN_PAL` por `_CT(i)`. **La forma, los nombres y la cantidad (quince) no
se tocan**, y no se agrega ninguna afirmación clínica. La correspondencia, por el significado que
cada clave ya tenía:

| clave | significado | tramo |
|---|---|---|
| `N` | normal | 1 (−20 a −15) |
| `H1` | hipoquinesia leve | 2 (−15 a −10) |
| `H2` | hipoquinesia | 3 (−10 a −5) |
| `H3` | hipoquinesia marcada | **4** (−5 a 0) |
| `AC` | acinesia | 5 (0 a +5) |
| `D1` | discinesia | 6 (+5 a +10) |
| `D2` | discinesia / aneurisma | 7 (+10 a +15) |
| `GR` | sin dato | **0** (gris) |

`H3` recupera un tramo propio: la unificación anterior lo había **colapsado** con `H2`. El **tramo
8 no lo usa ningún patrón**, y es correcto: es el extremo de la rampa.

> ⚠️ **`C.N1` NO EXISTE en ese objeto**, y era el respaldo de color de los dos rellenos
> (`colors[segIdx] || C.N1`): con un patrón corto el relleno salía `undefined`. Hoy el respaldo es
> **`C.GR`**, el gris de sin dato, que es lo que un segmento sin color es. Defecto **preexistente**
> que no se disparaba porque los quince patrones declaran sus 17 colores.

---

## 9 · El PDF: la tabla arriba a la derecha y el texto debajo de ella

**Decisiones de Maicol del 23/11.** Lo que cambia está en **dos** lugares: lo que cada diagrama
**aporta** (el bloque que arma `_dg.contr`) y **`_pdfTile`**, que lo dibuja.

### Lo que aporta cada parte

Antes los dos textos se unían con un punto medio y se estampaban juntos **al pie** del tile:
con las dos dianas en la misma franja, un hallazgo de motilidad y una nota de strain quedaban en el
mismo renglón y nada decía cuál era cuál. Hoy cada parte viaja con **`lineas: []`**, su propia
lista de renglones:

- **Motilidad**: las oraciones de **`contrGetLineasInforme()`** —la misma función de la que sale el
  texto del informe— **una por renglón**, sin separador.
  **«Arterias posiblemente involucradas» no llega al papel**, y no hace falta filtrarlo: ese bloque
  lo arma otra función, sólo para la pantalla, y **no está** en esa lista.
- **Strain (SGL)**: el **SGL global en su propio renglón** (`SGL global: −18 %`, por `sglNegTxt`) y
  **debajo** las notas del médico, **una por cada línea que escribió, tal cual**.

`_dgL` —el camino de la línea al pie— se conserva **vacío** para este diagrama: lo siguen usando
los demás.

### Cómo lo dibuja `_pdfTile`

Cada parte tiene una **columna derecha**: la **tabla de colores arriba** («Ref.:» más la lista o la
barra) y **el bloque de texto debajo**, con su **título** (`Motilidad` / `Strain (SGL)`).

> ⚠️ **UN SOLO LUGAR PARA EL TEXTO, SOLO O ACOMPAÑADO**, y es el invariante que la propia orden
> pide. La orden describe **dos** disposiciones —el texto en el hueco entre el dibujo y la tabla
> cuando el bull's eye va solo, y debajo de la tabla cuando van los dos— y a la vez exige que
> «ocupe el mismo lugar cuando va solo y cuando va acompañado». **Las dos cosas no pueden ser
> ciertas a la vez**, así que se cumple el invariante: la columna derecha lleva la tabla arriba y
> el texto abajo en los **dos** casos. Lo que sí cambia es el **ancho** de esa columna: con una sola
> parte la franja entera es suya y la columna sale más holgada (hasta 62 mm contra 40). Declarado
> en **PR7-b**.

- **El ancho de la columna es el mismo para todas las partes del tile**, con texto o sin él, así
  que **los dibujos no se mueven** cuando uno de los dos no tiene nada que decir.
- Sin texto, el rótulo del dibujo (`sub`) se queda **debajo del dibujo**, que es donde estaba.
- **Es texto real**: `doc.text` sobre lo que devuelve `splitTextToSize`, cortado por palabra al
  ancho de la columna. Si el texto pasa el alto del dibujo **sigue bajando sin pisar nada**, porque
  la columna derecha no comparte el espacio con ningún otro dibujo.

### Lo medido, con el PDF generado de verdad e interceptando `doc.text` y `doc.addImage`

| | dibujo(s) | tabla(s) «Ref.:» | título del texto |
|---|---|---|---|
| sólo motilidad | `37,24` de 72,1 × 72,1 | `139,28` | `Motilidad` en `139 , 55.6` |
| sólo strain | `37,24` de 72,1 × 72,1 | `139,28` | `Strain (SGL)` en `139 , 44.4` |
| los dos | `9,34` y `107,34`, **los dos de 52 × 52** | `63,28` y `161,28` | `63 , 55.6` y `161 , 44.4` |

Con los dos juntos: las dos oraciones de motilidad en `y` 59/62 y 66, el SGL global en `161 , 48` y
las dos notas debajo. **«Arterias posiblemente involucradas»: cero en las tres formas.**

---

## 10 · Lo que NO se tocó, y por qué está acá

- **`CONTR_MOTILIDAD`** (verde, amarillo, naranja, rojo, violeta). Es **otro** bull's eye y los dos
  pueden terminar en el **mismo PDF**: repintarlos con la misma rampa los vuelve ambiguos. TC-1042
  (E1) y TC-1049 (C1)(C2) lo fijan como control negativo.
- **El mapa de SGL calculado por territorios del visor** (`_strTono`, `_STR_GRIS`): rampa de
  intensidad **verde azulada** de 0 a −30 %, desde casi `rgb(83,250,247)` hasta `rgb(13,90,87)`, con
  `#9E9E9E` para sin dato. Su propio comentario explica por qué **no** se parece al del informe.
  Queda **PENDIENTE** y declarado en **PR7-a**.
- **El campo SGL global** (`#sgl_gls` / `#sgl`) y sus cortes. No se calcula con los segmentos y no
  se enlaza con ellos.
- **Las citas de «General Electric»** de amiloidosis (Phelan 2012 y Boldrini, donde el equipo es
  parte del método publicado) y el **nombre del pendrive** del ecógrafo. Son **otro contexto** y no
  hablan de esta paleta. El globo de los patrones **conserva** la salvedad de Phelan; TC-1047 (B3)
  lo fija como control positivo.

---

## 11 · Cobertura y trampas pagadas

**TC-1042 a TC-1050**, nueve casos, los nueve cayendo **0/9** contra `f6d51f8` **por sus
condiciones y ninguno por excepción**. Las fichas, en `docs/mapa/tests-fichas-1042.md`.

**Trampas que esta tanda pagó:**

1. **La zona muerta de `const`**: ver §1.
2. **`sglSyncGLS` se perdió en el reemplazo del bloque** y `sglOnShow` la llama: la pestaña tiraba
   «sglSyncGLS is not defined» y el bull's eye **no se dibujaba**. Lo cazó la sonda, no la lectura.
3. **`CONTR_MOTILIDAD` no está en `window`** (es un `const` de nivel de script): una condición que
   lo leía por `window` medía sobre una lista **vacía**, que se lee igual que «no hay nada que
   comparar».
4. **El navegador normaliza el color del estilo a `rgb()`**: comparar la leyenda contra el
   hexadecimal daba falso sobre una leyenda correcta.
5. **La tarjeta de un patrón es `.patron-acc`** y no `.patron-card`: con el selector equivocado el
   conteo daba cero sobre una grilla de quince.
6. **Las secuencias `\uXXXX` quedaron convertidas al carácter real** en el archivo, así que tres
   anclas del barrido daban `x0` —que se lee igual que «no hay nada que mutar»—. Es la misma trampa
   que PR5 pagó al revés.
7. **La forma vacía tiene que traer TODAS las claves**: con un objeto de una sola clave, las
   condiciones de abajo leían `D.dib.length` sobre `undefined` y el `TypeError` se llevaba el caso
   entero.

---

## → PR12 (25/11/2026): el MAPA DE SGL DEL VISOR pasa a usar esta misma paleta

Esta tanda dejó escrito que la paleta **no** alcanzaba al mapa de territorios del visor, «que usa
una rampa de intensidad verde azulada por la razón que su propio comentario explica». **PR12
revierte eso, por decisión de Maicol del 25/11/2026**: ese mapa lee hoy estos mismos ocho tramos,
este mismo gris y `strainTramoDe`, con `_strPalColor` / `_strGris` / `_strColorPct`. Los dos
diagramas miden la misma magnitud, así que compartir la escala es lo que los hace comparables en el
mismo PDF; **la paleta de la MOTILIDAD sigue separada** y ésa no se tocó.

Con eso, **TC-201 cambió de lado**: su condición exigía que las dos paletas **no** compartieran
ningún color y hoy exige que el visor **saque** el suyo de ésta.

→ **`docs/mapa/pr12-copiado-rwt-paleta.md` § 5.**
