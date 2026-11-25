# Guía de prueba a mano — tanda PR12 (2026-11-25)

Sello **`v20261125-0132`**, md5 **`b556f081`**. Catorce pasos. Los pasos **1 a 4** son los que
**sólo Maicol puede verificar**: ningún arnés abre Pages ni Word.

---

## Lo del pegado en Pages y en Word (TAREA 1) — esto es lo que la máquina no pudo probar

**1 · El texto de los datos numéricos, en Pages.**
Pestaña **Informe** → botón **«Cuadros»** → en el pie de la tarjeta, el botón de **copiar los datos**
(el primero de los dos de la derecha). Abrí Pages, documento nuevo, y pegá con **⌘V**.
→ El cuerpo tiene que salir en **11**. Mirá el tamaño en la barra de formato de Pages con el cursor
   dentro de un renglón de datos, dentro de un **título de sección** (en negrita) y dentro de la
   línea de **DOPPLER** (negrita y subrayada): **los tres en 11**.
→ La **tipografía** es la que Pages usa por omisión; ya no se le impone Calibri.

**2 · El informe con su EN SUMA, en Pages.**
El **segundo** botón de copiar de ese mismo pie. Pegá con ⌘V.
→ «INFORME» y «EN SUMA:» en **negrita y subrayados**, los ítems del EN SUMA con **viñeta**, y todo
   el cuerpo en **11**, los dos rótulos incluidos.

**3 · Los dos, en Word.**
Lo mismo en Word. → El cuerpo en **11** y el formato conservado.

**4 · El texto sin formato no cambió.**
En Pages, pegá con **⌘⇧⌥V** («Pegar y conservar el estilo del destino»), o pegá en la app Notas, o
en TextEdit en modo texto llano.
→ Tiene que salir **exactamente** lo de antes de esta tanda: los títulos con **dos puntos**
   («Aorta:»), los ítems del EN SUMA **sin viñeta** y sin ninguna marca de formato.

> Si algo sale en otro tamaño, lo que hace falta anotar es **qué** bloque (un renglón de datos, un
> título, un ítem del EN SUMA) y en **qué** programa.

---

## El corte de espesor parietal relativo (TAREA 2) — no cambió nada, se verifica que siga así

**5 · El 0,42 exacto es «aumentado».**
Pestaña **AI / VI**: cargá **sexo masculino**, peso 80, talla 175, y **DDVI 50 · SIV 10,5 · PP 10,5**
→ el RWT calculado sale **0,42**.
→ Con la masa indexada **normal**, «Geometría VI» tiene que decir **«Remodelado concéntrico»** (no
  «Normal»).
→ Subí el SIV y la PP hasta que la masa quede aumentada: tiene que decir **«Hipertrofia
  concéntrica»**.
→ Bajá el DDVI o los espesores hasta un RWT de **0,41**: «Normal» con masa normal, **«Hipertrofia
  excéntrica»** con masa aumentada.

**6 · El cuadro de Referencias.**
**Referencias** → **VI — Geometría y Disfunción Diastólica** → la tabla tiene que escribir
**`≥0.42`** en «Remodelado concéntrico» y en «HVI concéntrica», y **`<0.42`** en las otras dos.

**7 · El criterio de HFA-PEFF no se tocó.**
**Referencias** → la ficha del **HFA-PEFF** → las **dos** filas que nombran el espesor relativo
siguen escribiendo **`> 0,42`** y siguen citando **Pieske 2019, Figura 3, folio 3305**. Eso es a
propósito: es lo que esa figura imprime.

---

## El rango de NT-proBNP (TAREA 3)

**8 · La ayuda de la casilla.**
Pestaña **Cardio-Onco** → sub-pestaña **HFA-ICOS** → columna **«Humoral»**.
→ Debajo de **«BNP / NT-proBNP basal elevado»** tiene que verse, en letra chica, el chip
  **`CRITERIO DE ECOSMART`** y **«NT-proBNP 375–600 pg/mL»**.
→ El rótulo de la casilla **no cambió**.
→ **No aparece ningún cartel al pasar el mouse por encima** (no hay `title`).
→ **No hay ningún campo nuevo** para escribir un número.

**9 · El puntaje no se movió.**
Tildá y destildá la casilla: el puntaje del HFA-ICOS tiene que subir y volver **exactamente** a lo
que estaba.

**10 · Y no llega al papel.**
Generá el informe y el PDF: el **375** no aparece en ninguno.

---

## La paleta del mapa de SGL del visor (TAREA 5)

**11 · Los colores del mapa son los del bull's eye de la pestaña SGL.**
Abrí un estudio con cineloops apicales → pestaña **Imágenes** → abrí un cineloop → **Medir** →
herramienta **Deformación** → elegí el cineloop y la ventana **A4C**, trazá el borde en diástole,
confirmá, trazá en sístole, confirmá.
→ El mapa de la derecha tiene que pintar los segmentos con los **violetas/azules** de la pestaña
  SGL —ya **no** con el verde azulado— y los que no tienen dato con el **mismo gris claro** que la
  pestaña usa para «Sin dato».
→ Ponele al lado la pestaña **SGL** y comparalo: un territorio de **−18 %** tiene que verse del
  **mismo color** que un segmento al que le escribas **−18** en el bull's eye de la pestaña.

**12 · La leyenda.**
Debajo del mapa, la leyenda tiene que mostrar los **ocho tramos** con sus marcas
**−20 −15 −10 −5 0 +5 +10 +15** y el cuadrado de **«sin datos»**, igual que la de la pestaña SGL.
→ Y la línea de abajo tiene que decir que **no gradúa severidad**.

**13 · El ápex sigue gris y el número sigue una vez por territorio.**
Trazá las **tres** ventanas (A4C, A2C y A3C).
→ Se pintan **16** segmentos; el **17**, el círculo del centro, queda **gris**.
→ Cada pared muestra su número **una sola vez**, en su segmento del medio.

**14 · La captura al PDF.**
Botón **«PDF»** del panel del strain → el PNG que entra al informe tiene que llevar la **misma**
leyenda de ocho tramos y, debajo, las **dos** líneas del descargo («Calculado por método de dos
contornos manuales…» y «Orientativo, requiere correlación clínica…»). Si alguna de esas dos líneas
falta, el canvas se está recortando: avisá.

> **La paleta de la motilidad NO cambió.** El bull's eye de **Contractilidad** sigue con sus
> colores de siempre, y eso es a propósito: mide otra cosa y los dos pueden terminar en el mismo
> PDF.
