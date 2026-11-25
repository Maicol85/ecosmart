# Mapa — el mapa de strain por territorios del VISOR (tanda PR13, 2026-11-25)

Esta tanda toca **una sola superficie**: el diagrama «Strain por territorios (método manual)» que
el visor de cineloop dibuja debajo de la medición de deformación, con su leyenda de colores. No
toca la pestaña SGL, ni la paleta, ni nada de **P10** —la escala de velocidad— ni de **P11** —los
dos tamaños del visor, el teclado y las medidas por cuadro—.

Está armado sobre el cierre de PR13 —sello `v20261125-0728`— y **no guarda números de línea**: se
busca por nombre de función y de constante.

---

## 1. Quién dibuja qué, y de dónde salen los seis valores

| pieza | dueño | qué hace |
|---|---|---|
| los seis valores y el SGL | `_strResultadoVivo()` | ya existía; devuelve `{terr, sgl, nVistas}` |
| el reparto angular | `_STR_SECTORES` | **seis** entradas, una por pared, con su tramo de ángulos |
| el radio del disco central | `_STR_R_DISCO` | `0.24` del radio del diagrama |
| el diagrama entero | `_strBullsDibujar(cx2, S, R, conTitulo)` | el **único** dibujante |
| el canvas de la pantalla | `_strBullsRepintar()` | lo llama con `conTitulo` en falso |
| el canvas de la captura y del PDF | `_strBullsCanvas()` | lo llama con `conTitulo` en **verdadero** |

**Los valores NO se recalculan acá.** `_strBullsDibujar` recibe el resultado y lo indexa por
pared (`porPared[t.pared]`); el SGL del pie es el `R.sgl` que `_strResultadoVivo` ya publica —el
promedio de las paredes con dato— y esta tanda **no tocó ese cálculo**.

⚠️ **UN SOLO DIBUJANTE PARA LAS TRES SUPERFICIES.** La pantalla, la captura que va a «Imágenes» y
la hoja del PDF salen de la **misma** función: con dos dibujantes, el día que un sector cambie de
color la pantalla mostraría una cosa y el papel otra. Lo único que cambia entre las tres es
`conTitulo`, y de él cuelgan el título de arriba y el aire de las dos líneas del descargo que
`_strBullsCanvas` dibuja debajo.

---

## 2. Los seis sectores — qué reemplazaron y por qué

Hasta PR12 el diagrama tenía **tres anillos por pared** —diecisiete entradas en `_STR_ANILLOS`—
pintados con el **mismo** color y con el número **sólo en el anillo del medio. Se leía como
dieciséis mediciones cuando el método manual da SEIS**: una por pared, de la base al ápex. Las
líneas de los anillos además **cortaban los nombres**.

Hoy cada pared es **un** sector que va del borde externo al disco central, sin división en
anillos:

| orden | pared | ángulos |
|---|---|---|
| 1 | Anterior | 330° a 390° (arriba) |
| 2 | Anterolateral | 30° a 90° |
| 3 | Inferolateral | 90° a 150° |
| 4 | Inferior | 150° a 210° |
| 5 | Inferoseptal | 210° a 270° |
| 6 | Anteroseptal | 270° a 330° |

**Las posiciones angulares no se movieron**: la Anterior sigue arriba y cada sector sigue midiendo
60°. Lo que desapareció son las dos circunferencias intermedias.

⚠️ **`_STR_ANILLOS`, `_STR_SEG_FUENTE` y `_STR_SEG_ROTULO` SE RETIRARON CON SU LÁPIDA, y el censo
dice por qué se podía**: sus únicos consumidores eran este dibujante y **TC-201**. Ninguna otra
superficie de la aplicación dependía de los anillos —ni el PDF, ni el informe, ni el EN SUMA, ni
la copia—, así que no hubo nada más que adaptar. El censo está en el comentario de la lápida.

### El nombre AFUERA y el número ADENTRO, los dos sobre la bisectriz

Los dos textos van **sobre la bisectriz del sector**, cada uno a su propio radio, con
`textBaseline` en `middle`:

- `rhoNom = rIn + rango * 0.72` — el **nombre**, en la parte **ancha** del sector, porque es la
  cadena más larga («Anterolateral», «Inferolateral»);
- `rhoNum = rIn + rango * 0.36` — el **número**, más adentro.

⚠️ **EL PRIMER DISEÑO LOS CORRÍA EN LA `y` DE PANTALLA Y NO ENTRABAN EN LOS CUATRO SECTORES
DIAGONALES.** Desplazar un texto en vertical desde el punto de la bisectriz lo saca del eje del
sector, y en un sector de 60° inclinado eso lo manda contra un borde. Colocados **radialmente** y
centrados en su propia caja, entran los seis.

### La letra se achica hasta que la caja entra en el polígono

`_strFontEnSector(cx2, txt, px, py, cxx, cyy, a0, a1, rIn, rOut, nom, min, negrita)` prueba
tamaños de letra de mayor a menor y se queda con el primero cuyas **CUATRO esquinas** del
rectángulo del texto caen dentro del sector, según `_strEnSector`, que compara radio y ángulo con
el envoltorio de +360°.

⚠️ **ES CONTENCIÓN EXACTA DEL POLÍGONO Y NO UNA HEURÍSTICA DE CUERDA.** La primera versión medía
la cuerda del sector a la altura del texto y la comparaba con el ancho: eso aprueba cajas que
sobresalen por el borde **radial**, que es justo por donde se salían. Con las cuatro esquinas, un
texto que no entra no se dibuja grande: se achica.

### El color del texto

`_strTxtSobre(i)` devuelve el color con que se escribe sobre el tramo `i`:

1. toma el color que la **paleta ya declara** para ese tramo (`STRAIN_PAL[i].txt`);
2. si ese color llega a **4,5:1** de contraste contra el relleno, lo usa **tal cual**;
3. si no llega, elige blanco o casi negro, el que más contraste dé.

⚠️ **ES LA REGLA DE LA PESTAÑA, ENDURECIDA SÓLO DONDE NO ALCANZA, Y NO UNA REGLA PROPIA.** La
pestaña SGL ya declara un color de texto por tramo y esta tanda **no lo tocó**: ocho de los nueve
tramos salen con el color que la paleta dice. El único que se endurece es el que no llegaba al
4,5:1 —texto oscuro sobre violeta intenso, que es lo que el médico no podía leer—. **Ni
`STRAIN_PAL` ni la pestaña se modificaron.**

### El disco central y la pared sin dato

El disco central va **siempre gris**, con el **«17»** adentro y `textBaseline` en `middle`, igual
que antes. Una pared **sin dato** sale con el **gris de SIN DATO** de la paleta y la palabra
**«Sin dato»** en su sector.

### El pie

Dos renglones debajo del diagrama:

- `SGL <valor>` —el `R.sgl` que ya existía, formateado por `_strFmt`—;
- el subtítulo: `<n> vistas · <m> paredes · el ápex (17) no lo mide este método`, con el singular
  y el plural resueltos.

`_strFmt(pct)` delega en **`_scN`**, que es el redondeo de la pestaña SGL, así que la **coma
decimal** es la misma y no hay un segundo formateador. Si `_scN` no estuviera, cae a un redondeo
propio de un decimal con coma.

⚠️ **Y ASÍ HEREDA EL REDONDEO SIMÉTRICO QUE PR9 ARREGLÓ.** `_scN` pasa por **`_scRed`**, que
redondea el valor **absoluto** y repone el signo: con un `Math.round` pelado el medio se va hacia
**+∞** y no alejándose del cero, así que con el strain —casi siempre negativo— redondearía
**siempre hacia cero**. El mapa lo hereda por usar el dueño en vez de un `toFixed().replace()`
escrito ahí.

---

## 3. La leyenda — los nueve rótulos y el texto que se cortaba

La leyenda son los **ocho** colores de `STRAIN_PAL` en una barra, más el cuadrado **gris** de SIN
DATO en su **propia fila**, más el texto explicativo.

### Los rótulos van en las LÍNEAS DE UNIÓN, no en el centro de cada cuadro

`_strBordes()` devuelve los **nueve** bordes de los ocho tramos —−20, −15, −10, −5, 0, +5, +10,
+15, +20— y cada uno se dibuja **centrado sobre la línea** que separa dos colores, en
`lx + bw * i`, con `textAlign` en `center`.

Los dos extremos salen como **`≤ −20`** y **`≥ +20`**, y eso se escribió **después de medirlo**:
`strainTramoDe` **acota** a [1, 8], así que todo valor por debajo de −20 cae en el **primer**
color y todo valor por encima de +20 en el **último**. Las etiquetas dicen lo que es; no se
cambió la paleta ni su función de tramo.

⚠️ **CON NUEVE RÓTULOS QUE NO ENTRAN SE DIBUJAN CINCO, Y LA DECISIÓN SE TOMA MIDIENDO.** Si los
nueve se pisarían, se dibujan **−20, −10, 0, +10, +20** (los de índice par). La condición sale de
**medir el ancho de cada rótulo con `measureText`** y compararlo con el ancho de un cuadro, **no**
del ancho de la ventana: el canvas siempre dibuja en sus propias unidades y el ancho de la ventana
no le llega.

### El texto explicativo

`_strEnvolver(cx2, txt, maxW, maxL)` lo parte en hasta **DOS** renglones dentro del ancho del
canvas menos 16 unidades, centrados, con puntos suspensivos en el último si no entrara. El texto
es el que ya estaba: «la misma referencia de colores que el bull's eye de la pestaña SGL; no
gradúa severidad».

⚠️ **HASTA PR13 SE DIBUJABA EN UNA SOLA LÍNEA Y SE SALÍA POR LOS DOS LADOS.** Medido: a 300 px de
canvas el texto medía **347,5 px**, o sea **23,8 px cortados a CADA lado**. El canvas **recorta en
silencio**, así que no había ninguna señal de que faltara texto.

⚠️ **Y EL CORTE NO ERA UN PROBLEMA DE ANCHO DE PANTALLA.** El canvas se dibuja siempre en
unidades de `S` —300 en la pantalla, 640 en la captura— y el CSS lo escala con `max-width:100%`,
así que **los tres anchos medidos dan el mismo resultado**: el corte era intrínseco al dibujo.

---

## 4. El radio se DERIVA del alto de la leyenda

El radio del diagrama no es una constante: sale de lo que queda después de reservar lo de arriba y
lo de abajo.

```
uDebajo = 34 + 46 + 11 * (líneas de texto − 1) + 7 + (conTitulo ? 34 : 0)
uArriba = conTitulo ? 30 : 7
r       = max(u(40), (S − u(uArriba) − u(uDebajo)) / 2)
```

Los sumandos de `uDebajo` están **sumados del código que dibuja** y no estimados: el tope de la
leyenda cae a +34 del borde del diagrama —ahí entran el SGL, a +15, y el subtítulo, a +26—; la
primera línea de texto explicativo tiene su base a +46 —barra de 9, rótulos a +19, fila del gris a
+26 con 9 de alto y su rótulo a +33—; cada renglón de más suma 11; y después van 7 de aire, que
cubren el descendente de la última línea. Los 34 de `conTitulo` son las **dos líneas del
descargo** que `_strBullsCanvas` dibuja debajo de la base devuelta.

⚠️ **UN CANVAS QUE SE PASA RECORTA EN SILENCIO, así que el alto se DERIVA y no se ajusta a mano.**
Antes de PR13 el último renglón de la leyenda tenía su base a **298,1** de un canvas de **300**:
su descendente quedaba fuera. Hoy sobra aire medible en la pantalla y en la captura.

### El dibujante publica DÓNDE dibujó

`_strBullsDibujar` devuelve `{ly, esc, cx, cy, r, rIn}`. `ly` y `esc` ya los necesitaba
`_strBullsCanvas` para las dos líneas del descargo; **`cx`, `cy`, `r` y `rIn` son nuevos y los usa
la prueba**: así **TC-201** mide donde el dibujante dibujó en vez de copiarse sus constantes, que
es cómo una prueba deja de ver que la geometría se movió.

---

## 5. Qué NO se tocó, y es medible

- **`STRAIN_PAL`, `STRAIN_MARCAS`, `STRAIN_MIN`, `STRAIN_PASO` y `strainTramoDe`**: la paleta y su
  función de tramo quedan idénticas.
- **La pestaña SGL**: su bull's eye, su leyenda, su entrada de números y su tabla de cálculos.
- **El cálculo del SGL del pie** y la fórmula de cada pared.
- **`_strPalColor`, `_strGris` y `_strColorPct`**, los tres de PR12, que siguen leyendo la paleta
  **en tiempo de llamada y con guarda**.
- **PR10** (la pantalla completa del visor) y **PR11** (las calculadoras y las flechas).
- **Cero campos guardados nuevos y las 457 columnas quietas**, por construcción: lo que entra son
  constantes y funciones, sin un solo `input`, `select` o `textarea`.

---

## 6. Lo que quedó diferido

**El valor por segmento (los 16)**. El método manual da **una** medición por pared: partir la
marca en tercios devuelve **el mismo valor en los tres**, con dispersión exactamente cero —lo que
el propio código ya tenía medido desde el informe de PR12—. Queda diferido hasta que exista
**seguimiento automático de puntos**. Decisión de Maicol del **25/11/2026**, declarada en
`docs/PENDIENTES.md` → **PR13-a**.
