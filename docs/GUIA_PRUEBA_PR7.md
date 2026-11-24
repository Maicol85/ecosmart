# Guía de prueba manual — tanda PR7 (la paleta del strain, los datos numéricos y el PDF)

**Sello `v20261123-2232`.** Abrir `index.html` en Chrome y entrar a la pestaña **📐 SGL**.
**18 pasos.** Lo que cada uno tiene que mostrar está en *cursiva*.

---

## La pantalla

1. Abrir **📐 SGL** y desplegar «Strain Longitudinal Global (SGL)».
   *Los 17 segmentos del bull's eye arrancan **grises** y con un **guion** adentro.*

2. Mirar la frase de arriba.
   *Dice «Tocá cada segmento del bull's eye para cambiar el color del strain, o activá «Ingresar
   datos numéricos» para escribir el valor de cada segmento. 17 segmentos.» — **sin nombrar
   ninguna marca de ecógrafo**.*

3. Mirar la **«Referencia de colores»** de la izquierda.
   *Una **barra de ocho cuadritos** de violeta a azul con sus marcas debajo —−20, −15, −10, −5, 0,
   +5, +10, +15— y un **cuadrito gris «Sin dato»**. **Sin nombres de categoría** y **sin «(GE)»**
   en el título.*

4. Tocar un segmento **nueve** veces seguidas.
   *Pasa por los ocho colores, de violeta oscuro a azul, y al noveno toque **vuelve a gris**.*

5. Tocar **«🧹 Limpiar»**.
   *Los 17 vuelven a gris con su guion.*

## El botón de datos numéricos

6. Tocar **«✏️ Ingresar datos numéricos»**.
   *El botón queda **marcado** (azul).*

7. Tocar un segmento de la cara anterior y escribir **18**, y apretar **Enter**.
   *Aparece **−18** dentro del segmento, en **blanco**, y el segmento se pinta de **violeta
   oscuro**. Sin signo, el valor se toma negativo.*

8. Tocar otro segmento y escribir **+6**, Enter.
   *Aparece **6** en **gris oscuro** y el segmento se pinta de **azul claro**. Con un `+`
   explícito el valor queda positivo.*

9. Tocar otro y escribir **12,5**, Enter.
   *Aparece **−12.5**: la **coma** vale como punto decimal.*

10. Tocar otro y escribir **−30** (con el menos que se quiera), Enter.
    *Aparece **−30** y el segmento se pinta con el **color del extremo**, el violeta más oscuro.
    **No se bloquea el ingreso.***

11. Tocar un segmento que ya tenga número, cambiar el valor y apretar **Escape**.
    *La casilla se cierra y **ni el número ni el color cambian**.*

12. Tocar el **«ⓘ»** que está al lado del botón.
    *Explica las dos mitades del gesto, el rango de −20 a +20, qué pasa fuera de ese rango y que
    los segmentos sin dato se ven grises con un guion. **Sin nombrar ninguna marca.***

13. **Apagar** el botón y tocar un segmento que tenga número.
    *El segmento cambia de color y **el número desaparece**: el color y el número no pueden
    contradecirse.*

## El guardado

14. Con varios segmentos cargados —algunos con número y alguno sólo con color—, escribir un
    **nombre** y una **fecha**, y guardar el estudio. Después hacer **«Nuevo estudio»** y volver a
    abrir el guardado.
    *Vuelven **los mismos colores y los mismos números**, y el segmento que sólo tenía color vuelve
    **sin número**.*

15. Abrir un estudio **viejo** que tenga el bull's eye de strain pintado (de antes de esta tanda).
    *Abre **sin error**. Los segmentos que estaban pintados salen con un color de la paleta nueva y
    **sin ningún número**; los que estaban en el rojo de «Normal» salen **grises**, porque en el
    modelo viejo ese valor era el mismo que el del segmento que nadie tocó.*

16. Tocar **«🧹 Limpiar»** con el campo **SGL global** y los **comentarios de strain** cargados.
    *Los 17 vuelven a sin dato y **el SGL global y los comentarios quedan como estaban**.*

## El PDF

17. Marcar **«📄 Incluir en PDF»** en SGL **y** el equivalente de **Contractilidad**, cargar el
    SGL global y un par de líneas de comentario, y exportar el PDF.
    *En la hoja «Contractilidad y strain longitudinal (SGL)»: **dos dibujos del mismo tamaño**, la
    **tabla de colores arriba a la derecha de cada uno** —la de strain, la barra de ocho— y, debajo
    de cada tabla, el **texto de ese bull's eye** con su título: **«Motilidad»** con **una oración
    por alteración, una debajo de otra**, y **«Strain (SGL)»** con **«SGL global: −18 %» en su
    propio renglón** y las notas **una por línea**. Los números de los segmentos **salen dibujados
    dentro del bull's eye**. **No aparece «Arterias posiblemente involucradas».***

18. Exportar el PDF con **sólo uno** de los dos marcado, las dos veces.
    *El dibujo sale más grande y el texto queda igual: a la derecha del dibujo, debajo de su tabla,
    con su título.*

---

## Lo que esta tanda NO tocó, y conviene mirar que siga igual

- El bull's eye de **Contractilidad**: su paleta sigue siendo verde, amarillo, naranja, rojo y
  violeta.
- El **mapa de strain por territorios del visor**: sigue con su rampa verde azulada y su número
  impreso. Queda **pendiente** (PR7-a).
- El **campo SGL global** y su rótulo.
- En **Referencias → amiloidosis**, las dos filas que nombran equipos General Electric: **son
  citas bibliográficas** del método publicado y se conservan a propósito.
