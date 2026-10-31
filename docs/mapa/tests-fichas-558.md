# Fichas de casos — TC-558, TC-559 y TC-560 (tanda IMÁGENES-3)

Archivo propio porque `docs/mapa/tests-fichas.md` está en 34,2 KB, a 800 bytes del techo.

---

## TC-558 · el visor de «Imágenes guardadas» y el PPT con video (Parte A)

**Denominadores**: (A0) las diez piezas del visor existen en el documento; (B0) el predicado del
mazo de imágenes existe. Sin ellos las condiciones de abajo dan cero y se leen como «todo bien».

**Controles negativos**: (A6) sobre una IMAGEN el reproductor sigue oculto y «Medir» VISIBLE;
(B2) el filtro del PPT del ESTUDIO sigue rechazando el póster de un video —sin eso el póster
entraría dos veces en ese mazo—; (C4) 10 MB no disparan el aviso de 100 MB y 150 sí.

**Qué fija**: `loop`, `muted` y la ausencia de `autoplay` —que es lo que satisface
`prefers-reduced-motion` por construcción—; el paso de cuadro en 1/30 s; el botón de agrandar
con su rótulo y su vuelta; «Medir» oculto sobre un video; el primer cuadro de un video en el
mazo de imágenes; los dos umbrales de tamaño; y el aviso de privacidad nombrando el video.

**Cae contra HEAD por 14 condiciones y ninguna por excepción.**

---

## TC-559 · el motor de tercios de las hojas de diagramas (Parte B)

⚠️ **MIDE EL EMPAQUETADOR, QUE ES PURO.** No necesita jsPDF ni generar un PDF, así que el caso
no depende de que la librería cargue del CDN — que es el rojo intermitente que este repositorio
ya documenta con TC-358. La comparación contra la demo aprobada la hace
`scripts/_probe_img3demo.mjs`, que corre las dos lógicas lado a lado: **12 casos, 12 iguales**.

**Denominador** (E0): el registro y el empaquetador existen y el registro tiene sus siete filas.

**Controles negativos**: (E4b) una pareja NO excluida sí va junta; (E8) sin nada que acomodar no
hay ninguna hoja; (E11) sin datos la mitral no lleva línea.

**Qué fija**: R-1 (tres franjas por hoja), R-2 (Contractilidad y SGL primero y a todo el ancho),
R-3 (de a dos en el orden del registro), la pareja excluida por los dos lados con su nota, R-5
(las capturas después y continuando en la hoja), R-6, la ampliada a franja entera, y la línea de
la mitral con sus segmentos agrupados por lesión.

**Cae contra HEAD por su DENOMINADOR**: sin el registro ni el empaquetador el caso sale
temprano, que es lo correcto. Lo que ejercita las otras once condiciones son las mutaciones.

---

## TC-560 · el papel y la pantalla sin guías (Parte C)

**Denominadores**: (G0) las tres funciones de la parte existen; (H0) la sección de la coartación
clasifica de verdad en la escena montada — sin eso, «la cápsula no nombra la guía» pasa sobre
una cápsula vacía.

**Controles negativos**: (G3) el clasificador y su `txt` NO se mueven, que es lo que deja la
guía en la Evidencia; (I2b) un rótulo sin guía no se toca; (J3) un texto descriptivo no se poda;
(J4) la poda que perdería un NÚMERO medido no se aplica; (J5) el año de la guía no cuenta como
número medido —si contara, nada se podría podar—.

**Qué fija**: la cápsula de la coartación describiendo y no recomendando, en la rama del gradiente
y en la de indicación; el ⓘ con la Figura 44 y los DOS folios; la salvedad del VExUS intacta con
su cita fuera del papel y entera en `IND_REFS.vexus2020`; el rótulo de la diastólica sin la guía
en el PPT, en sus nueve formas; y el podador del PPT de congénitas con sus tres guardas.

**Cae contra HEAD por 15 condiciones y ninguna por excepción.**

---

## Las veinte mutaciones

`scripts/_mut_img3.py`. **20/20 muertas en el primer barrido**, en 1 min 41 s, en un worktree y
nunca sobre el árbol vivo, con guarda de md5 antes y después.

**El reparto es limpio**: las ocho de la Parte A matan SOLO a TC-558, las seis de la Parte B SOLO
a TC-559 y las seis de la Parte C SOLO a TC-560. Cada caso discrimina su área.

**Cuatro no revierten nada: la aplican de más** —el `autoplay` que `prefers-reduced-motion`
prohíbe, «Medir» escondido también sobre una imagen, el PPT del estudio aceptando el póster (que
lo metería DOS veces en ese mazo) y el grado crudo de la mitral—, porque las condiciones que las
matan son controles negativos.
