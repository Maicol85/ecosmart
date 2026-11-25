# Informe — el mapa de strain por territorios del visor (tanda PR13, 2026-11-25)

Sello **`v20261125-0728`**, md5 **`a1b7f9a3`**, **196.460** líneas. Línea base **`e4ee124`**, el
cierre de PR12 y a la vez `origin/main`. **Sin push.**

Esta tanda toca **una sola superficie**: el diagrama «Strain por territorios (método manual)» del
visor de cineloop y su leyenda. No toca la pestaña SGL, ni la paleta, ni nada de **P10** —la
escala de velocidad de un Doppler espectral— ni de **P11** —los dos tamaños del visor, el teclado y
las medidas por cuadro—, ni ningún otro texto de la aplicación.

---

⚠️ **QUE TOCA UNA SOLA SUPERFICIE NO ES UNA PROMESA: ES EL REPARTO DEL DIFF.** De los **21**
hunks, **19 caen entre las líneas 153.345 y 153.587** —el bloque del mapa de strain del visor— y
los **2** restantes son **el sello**: las dos constantes de la compilación y el `<span>` del pie.
**CERO hunks en cualquier otra parte del archivo**, contado y no afirmado.

## 0 · Lo que se midió ANTES de tocar una línea (TAREA 0)

**El árbol estaba limpio de lo ajeno.** `git status` sólo mostraba el `index.html`, el
`test_clinico.mjs`, el `version.json` y los scripts de esta tanda. **PR10 y PR11 están en HEAD**,
verificado por nombre y no supuesto: `e4ee124` incluye sus commits.

**De dónde salen los seis valores.** De `_strResultadoVivo()`, que ya existía y devuelve
`{terr, sgl, nVistas}` — una entrada por pared medida. **El dibujante no recalcula nada**: indexa
ese resultado por pared.

**El SGL del pie es el promedio de las paredes con dato**, y sale del mismo `_strResultadoVivo`.
**Esta tanda no tocó ese cálculo.**

**Cómo pintaba hasta PR12.** `_STR_ANILLOS` tenía **diecisiete** entradas —tres anillos por pared
más el casquete— y los tres anillos de una pared se pintaban del **mismo** color, con el número
**sólo en el del medio**. Las dos circunferencias intermedias **cortaban los nombres**.

**Si algún otro uso dependía de los anillos.** Censado: los únicos consumidores de
`_STR_ANILLOS`, `_STR_SEG_FUENTE` y `_STR_SEG_ROTULO` eran **el dibujante y TC-201**. La captura
que va a «Imágenes» y la hoja del PDF salen del **mismo** dibujante (`_strBullsCanvas` lo llama con
`conTitulo` en verdadero), así que **no hubo un segundo camino que adaptar** y no se cambió nada
fuera del mapa.

**Por qué se cortaba el texto de la leyenda.** No era el ancho de la pantalla. El canvas dibuja
siempre en unidades de `S` —**300** en la pantalla y **640** en la captura— y el CSS lo escala con
`max-width:100%`. El renglón explicativo se dibujaba **en una sola línea**: a 300 px de canvas
medía **347,5 px**, o sea **23,8 px cortados a CADA lado**. Un canvas **recorta en silencio**, así
que no había ninguna señal.

**Los límites reales de los ocho tramos.** `strainTramoDe(n)` es
`clamp(floor((n − (−20)) / 5) + 1, 1, 8)`, o sea que **acota**. Medido:

| valor | tramo | |
|---|---|---|
| −20,01 · −25 · −30,1 | **1** | todos en el primer color |
| −20 · −16 | 1 | |
| +20 · +20,01 · +30,1 | **8** | todos en el último color |

Y **−30,1 comparte `#6A1B9A` con −16**: eso es lo que el médico vio, y es lo que justifica que la
leyenda diga **`≤ −20`** y **`≥ +20`**. **La paleta no se tocó**: las etiquetas se escribieron
según lo que la función hace, no al revés.

**El color de texto de la pestaña SGL existe**: `STRAIN_PAL[i].txt`, uno por tramo. Se leyó **sólo
para igualarlo**.

---

## 1 · La leyenda (TAREA 1)

Los **ocho** colores en una barra, con los **nueve** bordes rotulados **sobre la línea de unión**
entre cuadritos —no en el centro—: `≤ −20`, −15, −10, −5, 0, +5, +10, +15, `≥ +20`. Salen de
`_strBordes()`, derivados de `STRAIN_MARCAS`, **no escritos a mano**.

El cuadrado **gris** de SIN DATO queda, en su **propia fila** debajo de la barra.

El texto explicativo —el que ya estaba, palabra por palabra— se parte en hasta **DOS** renglones
dentro del ancho del canvas menos 16 unidades, **centrado**, con `_strEnvolver`.

⚠️ **Si los nueve rótulos se pisarían, se dibujan CINCO** —−20, −10, 0, +10, +20—, y la decisión se
toma **midiendo el ancho de cada rótulo con `measureText`**, no leyendo el ancho de la ventana: al
canvas no le llega. **Declarado en PR13-b**: los tres anchos que la orden pide medir dan, por
construcción, el mismo dibujo.

---

## 2 · Los seis sectores (TAREA 2)

`_STR_SECTORES` son **seis** entradas, una por pared, cada una del **borde externo al disco
central** y **sin división en anillos**. Las posiciones angulares **no se movieron**: Anterior
arriba, 60° por sector.

| orden | pared | ángulos |
|---|---|---|
| 1 | Anterior | 330°–390° |
| 2 | Anterolateral | 30°–90° |
| 3 | Inferolateral | 90°–150° |
| 4 | Inferior | 150°–210° |
| 5 | Inferoseptal | 210°–270° |
| 6 | Anteroseptal | 270°–330° |

El **nombre** y el **número** van **sobre la bisectriz**, cada uno a su propio radio —el nombre
afuera, en la parte ancha; el número adentro— con `textBaseline` en `middle`, y la letra se achica
hasta que **las cuatro esquinas** de su rectángulo caen dentro del polígono (`_strFontEnSector`).

⚠️ **EL PRIMER DISEÑO LOS CORRÍA EN LA `y` DE PANTALLA Y NO ENTRABAN EN LOS CUATRO SECTORES
DIAGONALES.** Y la primera versión de la contención medía la **cuerda** del sector: eso aprueba
cajas que sobresalen por el borde **radial**, que es justo por donde se salían.

Una pared **sin dato** sale con el gris de SIN DATO y la palabra **«Sin dato»**. El disco central
sigue **gris con el «17»**. El pie dice **`SGL <valor>`** y
**`N vistas · M paredes · el ápex (17) no lo mide este método`**.

El número lleva **coma**, y por el dueño de la pestaña: `_strFmt` delega en **`_scN`**.
⚠️ **Hasta PR12 el número salía con PUNTO** —`t.pct.toFixed(1)`—, así que el mapa y la pestaña
escribían el mismo valor de dos formas.

### El color del texto, medido tramo por tramo

`_strTxtSobre(i)` usa el color que **la pestaña declara** donde llega a 4,5:1 y lo endurece sólo
donde no llega:

| tramo | relleno | pestaña | contraste | queda | contraste |
|---|---|---|---|---|---|
| 0 Sin dato | `#D4D4D0` | `#2B2B2B` | 9,53 | igual | 9,53 |
| 1 −20 a −15 | `#6A1B9A` | `#FFFFFF` | 9,39 | igual | 9,39 |
| 2 −15 a −10 | `#9B59C4` | `#FFFFFF` | **4,55** | igual | 4,55 |
| 3 −10 a −5 | `#C9A3E0` | `#2B2B2B` | 6,61 | igual | 6,61 |
| 4 −5 a 0 | `#E6D5F0` | `#2B2B2B` | 10,21 | igual | 10,21 |
| 5 0 a +5 | `#D3E3FA` | `#2B2B2B` | 10,88 | igual | 10,88 |
| 6 +5 a +10 | `#9DBFF2` | `#2B2B2B` | 7,53 | igual | 7,53 |
| 7 +10 a +15 | `#5C8CE0` | `#FFFFFF` | **3,34** | `#0b0f1a` | **5,72** |
| 8 +15 a +20 | `#2450C0` | `#FFFFFF` | 7,04 | igual | 7,04 |

**Ocho de los nueve son exactamente el de la pestaña.** El peor pasa de **3,34** a **4,55**.
**`STRAIN_PAL` y la pestaña quedan idénticas** — lo mide TC-1070 como control.

⚠️ **Y ASÍ SE VEÍA ANTES: el dibujo escribía con `#111827` FIJO en los nueve tramos**, o sea
**tres** por debajo de 4,5:1 — **1,89** sobre el violeta intenso (`#6A1B9A`), 3,90 en el tramo 2 y
2,52 en el `#2450C0`. Ese 1,89 es lo que el médico no podía leer.

---

## 3 · El radio se deriva, y el canvas ya no recorta

```
uDebajo = 34 + 46 + 11 * (líneas − 1) + 7 + (conTitulo ? 34 : 0)
uArriba = conTitulo ? 30 : 7
r       = max(u(40), (S − u(uArriba) − u(uDebajo)) / 2)
```

Los sumandos están **sumados del código que dibuja** y no estimados. Los 34 de `conTitulo` son las
**dos líneas del descargo** que `_strBullsCanvas` pone debajo de la base devuelta.

⚠️ **Antes de PR13 el último renglón de la leyenda tenía su base a 298,1 de un canvas de 300**: su
descendente quedaba afuera. Hoy sobra aire medible en la pantalla y en la captura, y **TC-1068** lo
fija en los dos tamaños.

**El dibujante publica dónde dibujó**: devuelve `{ly, esc, cx, cy, r, rIn}`. `cx`, `cy`, `r` y
`rIn` son nuevos y los usa la prueba, así que **mide donde el dibujante dibujó** en vez de copiarse
sus constantes.

---

## 4 · La fórmula (TAREA 3) — verificada, NO cambiada

Medido **por el camino real del código**, sin reimplementar la cuenta en la prueba:

| escena | resultado |
|---|---|
| largo 100 → 80 | **−20,0 %** |
| largo 100 → 120 | **+20,0 %** |
| largo 100 → 100 | **0** |

**Es un cociente**: escalar **los dos** largos por el mismo factor **no cambia** el porcentaje, o
sea que **no depende de la calibración en mm por píxel**. Con una diferencia en vez de un cociente,
ese escalado lo movería — es la condición que lo prueba.

Y con los seis valores que la orden da —**−16,3 · −30,1 · −10,1 · −11,4 · −27,3 · −23,1**— la suma
es **−118,3** y el SGL publicado es **−19,7**, con coma.

**La fórmula coincide con `(Ls − Ld) / Ld` y no se tocó una línea.**

---

## 5 · Lo diferido

**El valor por segmento (los 16)**: diferido hasta que haya **seguimiento automático de puntos**.
Partir la marca en tercios **de su propia longitud** devuelve el **mismo** valor en los tres, con
dispersión exactamente cero. Decisión de Maicol del **25/11/2026**, en `docs/PENDIENTES.md` →
**PR13-a**.

---

## 6 · La verificación

**La suite completa NO se corrió, por orden expresa.** Se corrió la **banda del visor y del SGL**:
los **285** casos cuyo cuerpo toca el visor, su medición, el SGL, su diana por territorios, los
Cuadros, el copiado, el PDF, el informe, el guardado o Configuración, seleccionados por el **patrón
de su propio cuerpo** (`scripts/_lotes_pr13.sh`). Los demás **no se ejecutaron**.

**280/285 en siete lotes**, con los 285 ejecutados, ningún lote cortado por tiempo y el md5 de
`index.html` **idéntico** al abrir y al cerrar (`a1b7f9a3`). **Los seis casos de la zona en
verde.**

Los **cinco** rojos son los que la orden declara —TC-182, TC-857, TC-899, TC-900 y TC-1044—:
**cuatro pasan corridos aislados** y **TC-900 falla también aislado y falla igual contra
`e4ee124`**, o sea **preexistente**. **Ninguno es de esta tanda.** Detalle en
`docs/PENDIENTES.md` → **PR13-h**.

**21/21 mutaciones dirigidas muertas**, en un worktree y nunca sobre el vivo, con el md5 del vivo
idéntico antes y después y las 21 anclas verificadas antes de correr. Las dos que sobrevivieron al
primer barrido estaban **mal escritas** —una equivalente, otra sobre una rama inalcanzable— y
mueren reapuntadas.

**Semgrep 126 WARNING / 0 ERROR** · **sin huérfanos nuevos** · **17 de 17** bloques de JS inline
parsean · **celular 38 ALTA**, medido con la máquina sola. Las cuatro, la línea base exacta.

**El `alarma.sh` existe** y se corrió al cerrar.
