# Fichas de los casos TC-742 a TC-747 — tanda PANT-21 (2026-11-07)

> **Archivo propio**: `docs/mapa/tests-fichas.md` está en **34,2 KB**, a menos de 1 KB del techo.
>
> Los seis llevan **accesores con guarda** (`_g` para los registros, `_gx` para las funciones) a
> propósito: contra el árbol anterior **tres de las cuatro funciones de sección no existen**, y un
> caso que cae con un `ReferenceError` no dice **qué** invariante se rompió — es la lección de
> TC-546. Los seis **caen contra `e716871` por 35 condiciones y NINGUNA por excepción**, verificado
> alternando sólo `index.html` con el mismo archivo de casos.

---

## TC-742 · la sección de la prótesis AÓRTICA: aparece sólo con su válvula, el orden, y la recomendación con su clase, su nivel y su folio

**Qué fija.** `PROTA_PREG` trae sus **doce** preguntas; con una prótesis aórtica la sección de
prótesis existe **y la nativa devuelve `null`**; las tres morfologías protésicas la abren y una
nativa no; el orden es preguntas → «Con lo contestado» → causas → bibliografía al final; la sección
declara `ordenProt`; contestar **Sí** publica la recomendación con su clase, su nivel y su folio; y
con **«?»** esa recomendación ya no se publica.

**La pre-respuesta, con su matiz.** `(A9)`: con `ea_pvl_origen` en **«central»** el control de la
fuga **ni se dibuja** —el dato lo pone el estudio, que es el contrato de `_indFilaOrigen`— y con
«paravalvular» se dibuja contestado. Es la **única** pregunta que se pre-responde desde un campo, y
sólo porque ese valor significa **exactamente** lo mismo.

**Controles negativos.** `(A1)` con la válvula aórtica **nativa** la sección de prótesis NO existe.
`(A10)` la sección no trae ninguna de las siete formas que la regla fija del 04/11 prohíbe.

**Denominadores.** `(A0)` la función y el registro existen. `(A2)` con la nativa severa la sección
de **estenosis aórtica** SÍ publica — sin eso, el `null` de `(A3)` no distinguiría «la compuerta
funciona» de «esa sección nunca abre».

⚠️ **`(A11)` NACIÓ DEL BARRIDO.** Ninguna condición miraba que la sección estuviera **registrada en
`IND_SECS`**: las demás la llaman por su nombre, así que sacarla del registro la dejaba **fuera del
panel** —invisible para el médico— con todo en verde.

---

## TC-743 · el bloque de CAUSAS de la aórtica: aparece y desaparece con el veredicto, y su marca cambia con el DVI y la EOA indexada

**Qué fija.** El bloque aparece con **«posible»** y NO con «normal», «signif» ni «faltan». Con el
cociente de VTI en 0,30 o más y el área indexada **por encima** de 0,85 se marca el **hiperflujo**;
con el **mismo** cociente y el área **por debajo**, el **desajuste**, y el hiperflujo pasa a la raya.
Las otras tres quedan como texto en las tres escenas: la Figura 13 no las decide con datos que la
app tenga.

**Control negativo.** `(B4)` con el cociente **por debajo** de 0,30 ninguna de las cinco se marca
sola — es la escena que separa «la figura decide» de «la app adivina».

⚠️ **LAS TRES ESCENAS DE BORDE NACIERON DEL BARRIDO, y son el corazón del caso.** Las cinco de
arriba **no cruzaban ninguno de los dos cortes**, así que mover el del cociente de 0,30 a 0,25, el
del área de 0,85 a 0,75 y **dejar de mirar el área** pasaban los tres en verde. Cada una cae **justo
entre los dos valores candidatos**: `(B7)` con el cociente en 0,27 la figura NO decide —el corte que
aplica es 0,30—; `(B8)` con el área en 0,8 se marca el desajuste —el corte es 0,85—; `(B9)` **sin**
área indexada ninguna de las dos se marca, porque la figura las separa **con ese número**.

⚠️ **Y `(B6)` SE REESCRIBIÓ POR EL BARRIDO: la cita se exige CAUSA POR CAUSA y no sobre el JOIN.**
Con el texto de las cinco pegado, quitarle la hoja y el folio a **una** seguía encontrándolos en las
otras.

---

## TC-744 · la prótesis MITRAL: las doce filas de la Tabla 17 siguen ahí, el orden nuevo, y su bloque con «posible»

**Qué fija.** `(C0)` es el **guardián de la parada del 4a**: las **doce** filas de la Tabla 17 que
alcanzan a la posición mitral están en `PROTM_REC_2025` con su clase y su nivel. Se pone rojo tanto
si una desaparece **como si alguien agrega una decimotercera creyendo que falta**. Más: la sección
declara `ordenProt`; **no** declara `cuenta`, porque dos de sus preguntas no se contestan con Sí o
No; las preguntas del estado inicial son las cuatro de siempre con sus mismas claves; y sus cuatro
causas citan la **hoja 24, folio 25**.

**El orden de la mitral es el OTRO de los dos.** `(C7)`: sin «Con lo contestado» —la mitral concluye
con `recom` y no con `adapt`—, las causas van **después de la conclusión** y antes del «Ver detalle».

**Controles negativos.** `(C5)` **ninguna** de las cuatro causas mitrales se marca sola: la guía da
una **lista** y no un algoritmo. `(C8)` cargar el modelo y el tamaño del catálogo de PANT-19/20 **no
cambia una coma** de esta Evidencia.

**Denominador y condición.** `(C4)` los tres veredictos caen donde el caso supone **y** el bloque
aparece sólo con «posible».

---

## TC-745 · la prótesis TRICÚSPIDE, con el valve-in-valve TRANSVENOSO y sin bloque de causas

**Qué fija.** `PROTT_PREG` trae sus **doce** preguntas; la sección abre con las dos prótesis y **no**
con una plastia ni con la válvula normal; el orden es preguntas → «Con lo contestado» →
bibliografía, con el **folio 4700** presente.

**El matiz de la Tabla 17, que es el que importa.** `(D2)`: el valve-in-valve de esta sección es el
**TRANSVENOSO** —la fila 7, «mitral o tricuspídea»—; el **transfemoral** es el de la posición
aórtica (fila 6). Son dos filas distintas de la misma tabla.

**Lo que la sección DICE en vez de callarse.** `(D4)`: declara que la **Tabla 19 publica cortes y no
causas**, que es por lo que esta sección **no lleva bloque de causas**.

**Denominador y condición.** `(D3)` los tres veredictos de la Tabla 19 caen donde el caso supone.

⚠️ **`(D6)` NACIÓ DEL BARRIDO**, por el mismo motivo que `(A11)` de la aórtica.

---

## TC-746 · la prótesis PULMONAR: rige la ACC/AHA 2025 de congénitas, la ESC 2020 va como referencia, y la ESC/EACTS 2025 NO se usa

**Qué fija.** `PROTP_PREG` trae sus **once** preguntas; con la válvula pulmonar nativa la sección no
existe y con una prótesis sí; las once se reparten entre la **ACC/AHA 2025** y la **ESC 2020** y
**ninguna combina las dos**, que es la regla «una pregunta, una guía»; citan el **folio e189** y el
**folio 622**; y la guía americana de congénitas se nombra **«ACC/AHA 2025»** y no 2026.

**Lo que la sección DICE.** `(E5)`: declara que la **ESC/EACTS 2025 no publica ninguna fila de
prótesis pulmonar** —verificado fila por fila sobre las trece de la Tabla 17—, que es por lo que esta
sección se arma con las guías de congénitas.

**Control negativo.** `(E3)` **ninguna** pregunta de la pulmonar cita la ESC/EACTS 2025 ni su folio
4700.

⚠️ **`(E4b)` NACIÓ DEL BARRIDO**: la cita se exige **pregunta por pregunta** y no sobre el JOIN de
las once, y además cada **línea de referencia** tiene que traer su folio.

---

## TC-747 · el emisor compartido: el orden de prótesis no toca a ninguna otra sección, un control de detalle por sección, y la Evidencia no llega al papel

**Qué fija.** Con las cuatro prótesis cargadas, **sólo** las cuatro secciones de prótesis declaran
`ordenProt`; la aórtica emite **un** solo control de detalle y a lo sumo **un** plegable de bloque;
contestar **todas** las preguntas de las cuatro secciones **no mueve el informe, ni el EN SUMA, ni el
Excel**; y **ninguna** clave de respuesta del panel es un campo del estudio.

**Denominador.** `(F4)` las respuestas **se registraron de verdad** — sin eso, el cero de `(F3)` no
distingue «no llega al papel» de «no se contestó nada».

**Control negativo.** `(F1)` en una sección **sin** `ordenProt`, «Con lo contestado» sigue **arriba**
de la grilla.

⚠️ **TRES CONDICIONES NACIERON DEL BARRIDO, Y DOS SON LA MISMA LECCIÓN.** `(F2b)` y `(F2c)` miden el
**HTML que el emisor arma** y no el **objeto** que la sección devuelve: romper lo que `ordenProt`
*hace* —que implique el molde de preguntas, y que «Con lo contestado» baje— pasaba en verde porque el
objeto seguía igual. Y `(F1b)` existe porque **el control negativo BUSCA** la primera sección sin
`ordenProt`: si una se lo gana, la búsqueda elige otra y `(F1)` deja de distinguir nada — hoy esa
sección se siembra y se exige **por nombre**.
