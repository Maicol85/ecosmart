# Fichas de los casos TC-601 a TC-604 — tanda TGA-3 (2026-11-01)

Archivo propio porque `docs/mapa/tests-fichas.md` está en 34,2 KB, a un pelo del techo de 35 KB.

Los cuatro **caen contra HEAD (`96b7ff0`) por 50 condiciones y NINGUNA por excepción**, verificado
en un worktree con los mismos scripts.

⚠️ **LA SUITE CORRE CHROME SIN `--window-size`, O SEA A ~756 px**, por debajo del corte de la
maqueta. Así que la disposición se mide por la **regla de la hoja de estilos** y por la
**estructura del árbol**, no por geometría: la geometría la miden `_probe_tga3concl.mjs` y
`_probe_tga3wk.mjs` en los cuatro anchos y los dos motores. Un caso que midiera cajas acá estaría
midiendo el ancho del arnés.

---

## TC-601 · la conclusión en la columna izquierda

**Denominador** (3): la fila y la grilla existen, y la conclusión tiene más de 40 caracteres —sin
eso se mediría una caja vacía.

| bloque | qué fija |
|---|---|
| (B1)-(B3) | la caja tiene su `id` propio, es **hija directa de `#tga-campos`** y contiene el nodo |
| (B4) | es el **último** hijo: el orden del marcado es el orden visual y el de tabulación |
| (B5)-(B6) | `#tga-fila` sigue con **dos** hijos, y son la grilla y el recuadro del 3D |
| (B7) | la **regla** de `grid-column` existe en la hoja de estilos |
| (B8) | la pantalla publica el `txt` del dueño, entero |
| (C1)-(C2) | **control negativo**: un solo nodo y una sola caja — si alguien repone la de abajo, la conclusión sale dos veces |
| (C3) | **control negativo**: «Integrar al informe» **no** se mudó |

La que cae contra HEAD es (B2): ahí la caja es hermana de `#tga-fila`, no hija de la grilla.

## TC-602 · la conducta fuera del papel

**Denominador** (4): el bloque está integrado, el informe nombra la transposición y trae el
diámetro cargado, y la cascada cayó en la rama `seguimiento`. **Sin el gesto de integrar, un cero
de conducta no se distingue de «el bloque no se integró».**

| bloque | qué fija |
|---|---|
| (E1)-(E6) | el informe no dice «seguimiento anual», «a considerar», «ESC 20», «completar la evaluación» ni «resincronización»; el EN SUMA tampoco |
| (E7)-(E9) | el dueño devuelve `papel`, sin conducta y **con el diámetro medido** |
| (E10) | el informe contiene esa salida **textual**: publica la del dueño, no una redacción propia |
| (E11)-(E12) | el texto del bloque integrado —lo que la hoja del PDF publica— tampoco, y **sí** trae la descripción |
| (F1)-(F3) | **control positivo**: la pantalla **sí** la dice, publica el `txt` entero, y el `txt` es más largo que el `papel` |
| (G1)-(G2) | **control negativo**: con Jatene la clave sigue `descriptivo` y `txt === papel` |
| (G3)-(G4) | **control negativo**: **sin integrar**, el papel no trae ni el párrafo ni la conducta |

⚠️ **(E13) SE RETIRÓ Y SE DECLARA.** La diapositiva del PPT no tiene condición acá: el registro que
la gobierna es un `const` **dentro** del emisor —no es alcanzable— y extraer el texto del mazo
generado de verdad costaba más de lo que esta tanda podía pagar (el denominador no llegaba a
nombrar la transposición). Lo que **sí** está medido es el PPT **real**, en el A/B, donde las
apariciones de conducta en la diapositiva pasan de 21 por escena a 0. El precio: una mutación que
le devuelva el `resumen` a la diapositiva **sobrevive a la suite**. → `T3-d`.

## TC-603 · el esquema, sus seis escenarios y sus exclusiones

**Denominador** (3): el contenedor existe, sin tipo ya dibuja algo y dibuja sus **seis** flechas.

| bloque | qué fija |
|---|---|
| (I1)-(I12) | los **seis** escenarios, por los rótulos de las cavidades y las letras de las válvulas leídas **del dibujo**; `mustard` da el mismo que `dtga`+`auricular`; la ccTGA **cruza las dos válvulas** y ya no dice «pendiente» |
| (J1)-(J2) | la alternativa accesible trae el recorrido de **la app** para el Rastelli y para el switch, y cambia con el campo |
| (K0)-(K6) | las tres comunicaciones se dibujan; **no la CIA con `mus`**, **no la CIV con `ras`**, y el texto lo dice |
| (K7)-(K8) | **control negativo**: el ductus vaciado deja de dibujarse y el texto deja de nombrarlo |
| (L0)-(L2) | 6 puntas sin dirección, 7 con la de la CIA, 8 con la del ductus |
| (L3) | **control negativo**: la CIV **no tiene** campo de dirección en la app |
| (M0)-(M1) | recorrer los siete escenarios no mueve ningún campo ajeno |
| (M1b)-(M1d) | **nacieron de la mutación M14**: vaciado el tipo, sigue vacío; y el denominador de que repintó |
| (M2) | ninguna clave del esquema es campo del estudio |
| (N1)-(N2) | no llega al papel: ni la leyenda ni la línea de la circulación |

⚠️ **(M1b) ES LA CONDICIÓN QUE CERRÓ UN HUECO REAL.** (M1) excluye del censo los dos campos que el
caso mueve a propósito, así que una escritura automática **sobre ellos** pasaba en verde: el
esquema podía rellenar el tipo por su cuenta y nadie lo veía. (M1b) le pregunta al campo
**directo**, que es el único camino sin esa exclusión.

## TC-604 · la leyenda, el globo y lo que el esquema NO es

**Denominador** (2): el botón existe y la leyenda «Esquema ilustrativo» está en la caja.

| bloque | qué fija |
|---|---|
| (P2)-(P4) | el glifo es **U+24D8** (9432) y lleva `vinfo-btn` y `vinfo-btn-44` |
| (P5)-(Q1) | el registro dice que es ilustrativo, que no es una imagen del estudio, que no está a escala, que los recorridos esperan la revisión de un cardiólogo de congénitas, y que no entra al informe ni al PDF |
| (Q2)-(Q5) | **sin una sola cita**: ni sociedad, ni clase, ni folio, ni tabla |
| (R1)-(R3) | **control negativo**: el ⓘ del 3D sigue aparte, con otro texto, y la sección tiene ahora **dos** |

⚠️ **`VINFO` NO ESTÁ EN `window`** —lo dice el mapa de la TGA—, así que se lee por el **nombre
pelado**, igual que los casos de la casa. La primera versión preguntaba por `window.VINFO` y las
ocho condiciones del contenido fallaban sobre un registro que sí existe.

---

## Las diecisiete mutaciones

**17/17 muertas**, en un worktree y nunca sobre el árbol vivo, con guarda de md5 antes y después
(idéntico). Cada una declara **su** caso, y el reparto es limpio.

**Seis de las diecisiete no revierten nada: aplican el defecto de más** —M09, M10, M11, M14 y
M15—, porque las condiciones que las matan son **controles negativos**, y un control negativo que
ninguna mutación puede romper no prueba nada.

⚠️ **Y UNA ADAPTACIÓN MÍA QUEDÓ A MEDIAS, Y LA DESTAPÓ LA CORRIDA COMPLETA.** De las tres
condiciones de TC-535 que cuentan los globos de 44×44, adapté **(K0)** y **(K1)** a diecinueve y
**(K2) se quedó en dieciocho**. Los datos estaban bien —diecinueve globos, todos con 5/5 puntos
propios—; lo que fallaba era el conteo. Por eso la primera corrida completa **no es la línea
base**: daba un rojo más, y era mío.

⚠️ **TRES SOBREVIVIERON AL PRIMER BARRIDO, Y ME DIJERON TRES COSAS DISTINTAS:**
- **M01** y **M17** estaban **mal escritas**: la primera sólo agregaba un atributo y no movía nada;
  la segunda cambiaba «no mide nada» por «no mide», que **no** es la frase que el caso mide.
- **M14** era un **hueco real**, y de ahí nacieron (M1b), (M1c) y (M1d).
