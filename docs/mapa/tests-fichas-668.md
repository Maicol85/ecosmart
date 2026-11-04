# Fichas de los casos TC-668 a TC-673 — tanda PANT-10 (2026-11-04)

Archivo propio porque `tests-fichas.md` está en 34,2 KB, a menos de 1 KB del techo.

Los seis caen contra HEAD por **111 condiciones y NINGUNA por excepción**, verificado alternando
sólo `index.html` con el mismo archivo de casos. Y **36 de 36 mutaciones dirigidas mueren**, cada
una matando a su caso.

---

## TC-668 — los diecisiete textos de congénitas contra las hojas

**Qué fija.** Que los diecisiete globos `cc9-*` publican el texto corregido, con su guía, su hoja
y su folio; que lo que ninguna fuente respalda **ya no está**; y que la franja de
contraindicaciones de Eisenmenger **no se tocó**.

**Denominadores.** (A0) los diecisiete devuelven tarjeta; (A1) ninguno cae al texto de legado;
(A2) el texto de los diecisiete junto pasa de 9.000 caracteres; (D0) la franja existe.

⚠️ **El texto se le pregunta al RENDERIZADOR, no al DOM.** Un globo cerrado no tiene caja, y
anclarse a un botón sin geometría es la trampa que PANT-7 pagó con dos claves que informaban
0 × 0. Se llama a `_vInfoHTML(clave, null)` y se mide lo que produce.

**Las doce de (B)** son lo retirado: el κ, «sobreestima la severidad», «Mortalidad materna
>50 %», la conducta de la ventana, «Menos del 1 %», «Sólo en el tipo completo», la forma parcial
de la CVPA, «El eco subestima el shunt», «Marcador de mal pronostico», «episodio masivo y fatal»,
«marcador de disfuncion del ventriculo sistemico» y «>93-95».

**Las catorce de (C)** son lo que entró, con su folio: e209, 1042, e174, 611, 595, e157, 575,
e158, e241, 586, los cuatro cortes del índice, los 50 neonatos con el índice calculado en 28,
1 cada 1000 nacidos vivos, 0,8 cm/m², y el «más del 75 %» **sin** restringirlo al adulto.

⚠️ **(D1) NO DISCRIMINABA Y LO ENCONTRÓ LA MUTACIÓN 14.** Pedía «mortalidad materna» y «50», y
cambiar «>50 %» por «30 a 50 %» —que es justo la mutación— cumple las dos. Hoy compara el
**texto exacto** de la franja, que es lo único que prueba que no se tocó.

---

## TC-669 a TC-673 — las cinco Evidencias, con un molde común

Un caso por sección, todos con la misma forma. **La sección se corre por su entrada de
`IND_SECS`**, que es la única lista que el panel recorre: con una tabla escrita aparte, una
sección nueva quedaría sin probar y nada lo diría.

| Caso | Sección | Preguntas |
|---|---|---:|
| **TC-669** | Defecto del septo auriculoventricular | 13 |
| **TC-670** | Anomalía de Ebstein | 12 |
| **TC-671** | Circulación de Fontan | 14 |
| **TC-672** | Conexión venosa pulmonar anómala parcial | 9 |
| **TC-673** | Síndrome de Eisenmenger | 14 |

**Los bloques, iguales en los cinco:**

- **(A) denominador** — la sección está registrada, abre con su escenario y publica su franja de
  datos. Sin esto, todo lo que sigue se cumpliría sobre una sección que no existe.
- **(B) las preguntas** — su número, la fila «Respuestas» encabezando, la frase de que «sin dato»
  no cuenta como «no», el reparto en dos columnas y el molde compacto.
- **(C) las citas** — que toda pregunta trae clase, hoja y folio; que la sección publica sus
  folios; y **(C3b)/(C3c)**, que cada línea de Fuente nombra su hoja y su folio.
- **(D) las diferencias** — medidas **sobre su bloque**, no sobre el objeto entero.
- **(E) el papel** — que el informe se emitió y no lleva la Evidencia.
- **(F) y (G) los controles negativos** — con el formulario **vacío** la sección NO abre, y con un
  estudio **ajeno** tampoco.
- **(H)** — que la compuerta la decide el evaluador de la pantalla.

⚠️ **NUEVE MUTACIONES SOBREVIVIERON AL PRIMER BARRIDO Y LAS NUEVE ERAN EL MISMO HUECO:** las
condiciones de folio y de diferencia miraban el objeto **entero**, donde la palabra aparece
también en la nota de una pregunta, así que quitarla del bloque pasaba en verde. Hoy los folios
se exigen en la **línea de Fuente** y las diferencias **en su bloque**.

⚠️ **Y AUN SOBRE EL BLOQUE, UNA CADENA CORTA NO ALCANZA.** «al menos moderada» aparece en dos
líneas del bloque de diferencias de Ebstein, así que reescribir la primera seguía pasando en
verde: lo encontró la **mutación 23**. Hoy cada diferencia pide su **frase entera**.

⚠️ **Y EL CORTE DE TAPSE DE 16 mm DE EISENMENGER VIVE EN EL BLOQUE DE RECOMENDACIONES**, no en el
de diferencias, y «16 mm» aparece además en la fila de datos del TAPSE: tiene condición propia,
**(D1b)**, con la frase completa de la nota al pie. Lo encontró la **mutación 35**.

**Dos errores propios que las primeras corridas cazaron:** el caso del DSAV decía **12** preguntas
y son **13** —se corrigió el caso, no la aplicación, porque el número real es el que la sección
publica—; y el marcador de la CVPA buscaba «no publica una tabla» cuando el texto escribe «**NO**
publica una tabla».
