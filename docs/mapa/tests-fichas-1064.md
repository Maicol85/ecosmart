# Fichas de los casos TC-1064 a TC-1067 (tanda PR12, 2026-11-25)

Archivo propio porque `docs/mapa/tests-punteros-tandas.md` está en **36,4 KB**, o sea **por encima
del techo** de ~35 KB que `CLAUDE.md` fija: agregarle un puntero es exactamente lo que esa regla
viene a evitar. Se midió con `wc -c` **antes** de escribir.

Los cuatro corren con el Chrome del sistema por CDP. **Ninguno depende del pendrive.**

---

## TC-1064 — el tamaño del texto copiado con formato

**Qué fija.** Que el HTML que los dos botones de copiar ponen en el portapapeles lleve **11 pt en
línea en cada bloque**, que no haya **otro** tamaño, que **no** fije tipografía, que el **texto
llano** no cambie, que la negrita, el subrayado y las viñetas sigan donde estaban, y que los dos
botones copien **exactamente** lo que arman sus funciones.

**Cómo mide.** Siembra un estudio con datos de varias secciones, genera el informe y, si el EN SUMA
quedó vacío, le pone dos renglones. Después:

- **(A)** recorre **todas** las etiquetas de apertura de `cuadTextoHTML()` y de `cuadInformeHTML()`
  y exige que **cada una** declare `font-size:11pt`. Contra `2830208` encuentra **45 bloques sin
  tamaño**.
- **(B)** junta todos los `font-size:` de los dos HTML y exige que **ninguno** sea distinto de
  11 pt.
- **(C)** exige **cero** `font-family`.
- **(D)** el texto llano sigue siendo llano —sin `font-size`, sin `style=` y sin `<p`— y **cada
  renglón** no vacío que publica está en el texto visible del HTML.
- **(E)** los títulos, por el fragmento **exacto** que arma `_cwB`: DOPPLER con `<u>` y otro título
  sin él. Y el EN SUMA con su `<ul>` y sus `<li>`.
- **(F)** envuelve `_cuadCopiar` —la única puerta de los dos botones— y exige que lo capturado sea
  **idéntico** a lo que devuelven `cuadTextoHTML()`/`cuadTexto()` y
  `cuadInformeHTML()`/`cuadInformeTexto()`.

⚠️ **TRES COSAS QUE ESTE CASO ENSEÑÓ.**
1. **El título de sección se escribe distinto en las dos representaciones, y es de antes de esta
   tanda**: el texto llano lo marca con **dos puntos** —«Aorta:»— y el HTML con **negrita**. La
   condición (D) acepta el renglón con o sin sus dos puntos finales; lo que no se afloja es que las
   palabras estén.
2. **La mayúscula inicial la pone `_cwCap`**, el dueño que PR8 agregó, así que la comparación pasa
   por **esa** función y no por una capitalización escrita en el caso.
3. **Los títulos se miden por el fragmento exacto y no por una ventana de caracteres alrededor**:
   con una ventana de 120 caracteres, el `<u>` de la sección **anterior** entraba en la cuenta y la
   condición del título sin subrayado salía roja sobre un HTML correcto.

**Cae contra `2830208`** por las condiciones (A), (C) y las dos de títulos.

---

## TC-1065 — el corte de espesor parietal relativo

**Qué fija.** Que el **0,42 exacto** cuente como aumentado / concéntrico en los **cuatro
cuadrantes**, que el cuadro de Referencias y las **dos** fichas lo escriban con el operador
inclusivo, que el cuadro por sexo publique el mismo corte, y —control negativo— que el criterio de
**HFA-PEFF** conserve su operador **estricto** y su atribución a Pieske 2019.

**Cómo mide.** Llama a `calcGeometriaVI(masa, rwt, 'M')` con masa 100 (normal) y 140 (aumentada) y
RWT 0,41 / 0,42 / 0,43; lee el **nodo** `ref-vi` y las entradas `GEO-VI-001` y `GEO-VI-002` de
`EV_REG`; y lee las **dos filas** de la tabla de HFA-PEFF una por una.

⚠️ **ESTE CASO PASA TAMBIÉN CONTRA EL ÁRBOL ANTERIOR, A PROPÓSITO.** La TAREA 2 encontró midiendo
que el corte **ya estaba** en 0,42 incluido en las cinco superficies, así que no hubo nada que
cambiar: es una **guarda de regresión** y no lo que discrimina. Lo que lo pone rojo son las
mutaciones 06 a 10. Declarado en `docs/PENDIENTES.md` → **PR12-b**.

⚠️ **EL CONTROL NEGATIVO VA EN 0,414 Y NO EN 0,419, Y NO ES UN AJUSTE PARA QUE PASE.**
`calcGeometriaVI` normaliza el RWT a los **dos decimales que se imprimen** en el informe, así que
0,419 redondea a 0,42 y cae —con razón— del lado aumentado. La condición **lo afirma
explícitamente**, así que quedó más fuerte que el control original.

⚠️ **Y EL CONTROL DEL HFA-PEFF SE MIDE DENTRO DE CADA FILA Y NO SOBRE EL PANEL.** La **mutación 10**
sobrevivió a la primera versión, que buscaba «> 0,42» en el texto de `ref-hfapeff` entero: esa tabla
tiene **DOS** filas con ese corte —el espesor relativo solo, y el índice de masa **con** el espesor
relativo—, así que cambiarle el operador a **una** seguía encontrándolo en la otra. Es el mismo
agujero que PANT-22 y PR6 pagaron midiendo sobre el join de varias notas. Hoy se exige que **las
dos** filas conserven el operador estricto **y** su fuente.

---

## TC-1066 — el rango de NT-proBNP

**Qué fija.** Que la casilla **`hfaicos_bnp`** —«BNP / NT-proBNP basal elevado», la única de
NT-proBNP **sin número**— publique **375 a 600 pg/mL** como ayuda, rotulado **criterio de la
aplicación**, **sin** citar ninguna guía ni el otro tope, **sin `title`** en ningún nodo de la
etiqueta, con **un solo control** adentro —la casilla— y con el nodo de la ayuda **sin `id`**; que
el **rótulo** de la casilla no haya cambiado; que el **puntaje** siga moviéndose al tildar y
volviendo al destildar; y que el rango **no llegue** al informe ni al EN SUMA.

**Cómo mide.** Lee el `<label>` que contiene la casilla y su `textContent`; recorre sus nodos
buscando `title` e `id`; cuenta sus controles; y compara `JSON.stringify(hfaicosEstado())` antes de
tildar, después de tildar y después de destildar.

**Cae contra `2830208`** por las condiciones del rango y del rótulo de criterio.

---

## TC-1067 — la paleta del mapa de SGL del visor

**Qué fija.** Que el color de un territorio del mapa del visor sea **idéntico** al que la pestaña
SGL pinta para el mismo número, en **doce valores representativos**; que el **gris de sin dato**
sea el de la paleta; que **no sea una copia**; que la **leyenda** muestre los ocho tramos y el
cuadrado de sin dato; que el dibujante siga devolviendo dónde termina la leyenda; y —control
negativo— que la paleta de la **motilidad** siga siendo otra.

**Cómo mide.**
- **(A)** los doce valores —−22, −20, −17,5, −12,5, −7,5, −2,5, 0, +2,5, +7,5, +12,5, +17,5, +22—
  contra `STRAIN_PAL[strainTramoDe(v)]` **y** contra lo que la pestaña pinta por su camino real:
  se escribe el valor en un segmento con `strainEscribir` y se lee `strainColor`. Los tramos que
  tocan son `1 1 1 2 3 4 5 5 6 7 8 8`, y una condición exige que **no caigan todos en el mismo**:
  sin eso, una función que devolviera siempre el mismo color pasaría.
- **(B)** `_strGris()` contra `STRAIN_PAL[0].color`.
- **(C)** la **estructura**: las tres funciones nombran `STRAIN_PAL` y no traen ningún color
  escrito salvo el respaldo.
- **(D)** la **leyenda por PÍXELES**: dibuja la diana en un canvas propio con `R` en `null` —sin
  ningún trazado, que es como la leyenda se pinta igual— y recorre los 320 × 320 píxeles
  comprobando que los **ocho** colores de la paleta y el gris estén.
- **(E)** `CONTR_MOTILIDAD` no comparte ningún color con `STRAIN_PAL`.

⚠️ **NO SE PUEDE PROBAR «LEE Y NO COPIA» SUSTITUYENDO LA PALETA, y es una trampa documentada de
esta casa.** `STRAIN_PAL` es un `const` de nivel de script: `window.STRAIN_PAL = otra` crea una
propiedad **nueva** que no lo tapa —lo mismo que `_imgEditado` y `_cinePendientes`— y además está
`Object.freeze`d. La primera versión de la condición lo intentaba así y daba «NO lee» sobre un
visor que lee bien. Lo que sí se puede afirmar es la **estructura**, y la **mutación 16** —que copia
los ocho colores a mano— la mata, mientras la condición (A) sola la dejaría pasar.

⚠️ **LA LEYENDA SE MIDE CON `R` EN `null`**, y eso es lo que permite probarla **sin trazar un solo
contorno**: ese bloque del dibujante se pinta igual sin resultado, y con los 17 segmentos en gris
los únicos colores de paleta en la imagen son los de la leyenda.

**Cae contra `2830208`** por su denominador declarado: `_strColorPct` y `_strGris` no existen allá.
