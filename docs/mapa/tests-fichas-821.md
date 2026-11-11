# Fichas de los casos TC-821 a TC-824 (tanda PANT-36, 2026-11-11)

Archivo propio: `tests-fichas-813.md` está en 13,3 KB y `tests-punteros-tandas.md` en 19,9 KB,
pero la regla de esta casa es que la ficha de una tanda nueva nace en su archivo y no engorda el
anterior. Medido con `wc -c` **antes** de escribir.

Los **cuatro caen contra `f9b5812`** —el cierre de PANT-34— **por 31 condiciones y NINGUNA por
excepción**, verificado en un worktree con el **mismo** archivo de casos y sólo el `index.html`
distinto.

---

## TC-821 — la entrada «Asociaciones y síndromes» en su lugar

**Qué afirma.** Que la entrada nueva es la **tercera** del panel «Cardiopatía congénita», debajo
de «Anomalías coronarias»; que su encabezado la abre con `toggleRef('asoc')`; que `asoc` está en
`REF_SUBTAB.congenitas` y **última**; que el censo de entradas de Referencias pasa de 40 a **41**
y el índice del buscador de 38 a **39**; que el buscador la encuentra y **sus demás resultados no
se movieron**; y que la entrada no trae un solo control, ningún id terminado en `-aviso` y ningún
pie en cursiva.

**Denominador.** (A0) exige que el panel de congénitas esté **visible y con ancho**: Referencias
muestra **un** panel a la vez, así que con otro delante la entrada no tiene geometría y todo lo
que se mida da cero sobre nada.

**Control negativo.** (B2): «RWT» sigue trayendo `vi` y `formulas`, «Wilkins» `em` y «Rassi»
`miocard`. Sin eso, un índice que devolviera la entrada nueva para **cualquier** búsqueda pasaría
(B1) igual.

**Por qué (C3) importa.** `limpiarCampos` —«Nuevo estudio»— barre `[id$="-aviso"]` y les escribe
`textContent` vacío. Es lo que PANT-30 pagó: con el id `doc-aviso`, ese barrido se llevaba el
botón del aviso puesto.

---

## TC-822 — las dos tablas, celda por celda

**Qué afirma.** Las 5 y 3 columnas, las 9 y 13 filas, los dos rótulos y los ocho encabezados con
su **texto exacto**; la primera columna de las 22 filas **en su orden**; **ocho** condiciones
sobre las celdas que llevan cifra; la negrita de la primera celda y de ninguna otra; y el
envoltorio de desplazamiento con su `min-width`.

**Qué cifras fija.** 60 a 80 % y el 70 % conotruncal de la deleción 22q11.2; 40 a 50 % y «más del
75 % de los canales AV completos» del Down; los siete porcentajes de los demás síndromes
(75, 50, 80, 30, 50 a 80, 70 a 75 y 50 a 95 %); el 4 a 10 %, el 30 a 40 % y el 5 a 10 % de la
bicúspide; los cinco tipos de CIA con sus **dos** «menos de 1 %»; los tres de la CIV con su signo
de aproximación; el patrón coronario de la TGA; y el bloqueo AV del 2 % **por año** de la ccTGA.

⚠️ **LA PRIMERA VERSIÓN CAÍA POR EXCEPCIÓN Y NO POR SUS CONDICIONES.** Contra el árbol anterior la
entrada no existe, así que `filas(0)[0].querySelectorAll('th')` tiraba `TypeError` y el caso
reventaba antes de medir nada: un caso que revienta no prueba que discrimine. Hoy **todo acceso va
por un ayudante con guarda** (`ths`, `col1`), y el caso cae por **12** condiciones.

---

## TC-823 — los quince resúmenes, el molde y el techo

**Qué afirma.** Los **31 hijos** de `ref-congenitas`; que el renglón que la ficha ya tenía sigue
**primero e idéntico carácter por carácter**; los quince títulos exactos y en su orden; el
**molde** (título en 700 y cuerpo no, los dos de 12 px, interlineado 21,6 px); el **techo** de 849
caracteres y 7 viñetas; que los treinta hijos nuevos **se ven**; y que ninguno dice ninguna de
**once** formas prohibidas.

**Denominador.** (A0) exige la ficha **abierta y con ancho**: cerrada, el `textContent` es el
mismo y no prueba que el médico pueda leerla.

**Control.** (D1): `ref-miocard` —el sector del que sale el molde— sigue con sus **14** hijos y su
techo de **849**. Si alguien «arregla» el techo moviéndolo allá, este caso se pone rojo.

---

## TC-824 — nada llega al papel ni al estudio

**Qué afirma.** Cero campos con id dentro de la entrada nueva y de la ficha de congénitas; el
Excel en **457** columnas; **ocho** palabras de las tablas nuevas que no pueden aparecer en el
informe ni en el EN SUMA; y los dos controles de que `ref-coronarias` sigue con sus cuatro hijos y
dos `data-ref-solo`, y de que el clon del globo `otr-rac` sigue dando sus **478** caracteres.

⚠️ **`_otrRefClon` recibe el id COMPLETO del cuerpo**, `ref-coronarias`, y **devuelve** un
contenedor ya armado. Con la clave corta la función no encuentra la ficha y devuelve su texto de
ausencia, que tiene otro largo: el caso leería un cambio del globo donde no lo hay.
