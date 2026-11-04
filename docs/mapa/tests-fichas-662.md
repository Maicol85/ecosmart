# Fichas de los casos TC-662 a TC-667 — tanda PANT-9 (2026-11-04)

Archivo propio porque `docs/mapa/tests-fichas.md` está en **34.237 B**, al techo. Los seis casos
cubren el rediseño de las siete pantallas de congénitas y la opción de valve-in-valve de TAVI.

**Los seis caen contra HEAD por 185 condiciones y NINGUNA por excepción**, verificado en un
worktree sobre `244530d` con el mismo archivo de casos, alternando sólo `index.html`.
**41 de 41 mutaciones dirigidas muertas** (`scripts/_mut_pant9.py`), en worktree y nunca sobre el
árbol vivo, con el md5 idéntico antes y después.

---

## Cómo miden la maqueta, y por qué no por geometría

El arnés arranca Chrome **sin `--window-size`**, o sea a unos **756 px**, por **debajo** del corte
de 900: ahí las tres columnas están apiladas a propósito. Así que estos casos miden la **REGLA** de
la hoja de estilos y la **ESTRUCTURA** del marcado; la geometría a los cuatro anchos la miden
`scripts/_probe_pant9pant.mjs` y `scripts/_probe_pant9wk.mjs`, que tienen el canal del navegador.

⚠️ **Y LA REGLA SE LEE DEL TEXTO DE LOS `<style>`**, no de `document.styleSheets[i].cssRules`, que
en este arnés devuelve **vacío** (lección de PANT-7). Delimitar el bloque de una media query por
**balance de llaves se desalinea** en cuanto un comentario de la hoja menciona «900 px», y esta
hoja tiene varios: lo que se hace es buscar el **selector** y preguntar si la media query más
cercana **hacia atrás** declara ese ancho, **acumulando todas** las coincidencias.

---

## TC-662 · Fontan

**Grupos.** (A) la estructura: cuadro, fila con su id propio, dos hijos en orden —columnas primero,
conclusión después—, tres columnas. (B) el reparto de los campos por columna, **nombrando los ids
uno por uno** y los tres títulos de grupo. (C) el censo: **dieciocho** ids, los mismos que antes.
(D) la conclusión y el botón dentro de la tarjeta de la derecha, con su casilla. (E) las **seis
casillas** de complicaciones con su lógica intacta. (F) los dos globos nuevos y los dos textos
**ausentes** del cuerpo. (G) **control positivo**: los rótulos de los dos campos sí siguen. (H)
«Ver criterios» en el encabezado, a la derecha, con su llamada.

**(E) es el grupo que prueba la lógica, y va en tres pasos con su denominador:** marca dos
complicaciones y comprueba que quedan marcadas; marca «Sin complicaciones» y comprueba que apaga
las otras cinco; marca una complicación y comprueba que apaga «Sin complicaciones». La lógica la
sigue decidiendo `fontanToggleComp`, que trabaja por id.

⚠️ **(H5) EXIGE QUE EL BOTÓN NO LLEVE UN `margin` EN LÍNEA**, y nació de un defecto propio: un
`margin:0` en línea **le gana** al `margin-left:auto` de la clase, y el botón quedaba pegado a la
izquierda —medido, x=225 en vez del borde derecho—.

---

## TC-663 · Eisenmenger

**(B) es el grupo de la franja roja**, que es decisión **expresa** del médico: hija **directa** del
cuadro, **fuera** de la fila de columnas, **antes** de la fila, con su texto completo —las tres
contraindicaciones—, y **ninguna entrada del registro de globos la contiene**.

⚠️ **(B5) MIRA EL TEXTO COMPLETO DE LA ENTRADA Y NO SÓLO EL BLOQUE «Qué mide», y nació del barrido
de mutaciones.** La versión anterior miraba sólo `lee`, así que la mutación 20 —que mueve la franja
roja al bloque «A tener en cuenta», que es donde la pondría quien quisiera pasarla al globo—
**sobrevivía**. Hoy mira `tit`, `lee`, `ojo` y `fuente`.

**(D) recorre las cuatro notas en un bucle**, y cada una se comprueba por tres lados: el globo está
en la pantalla, su texto está en el registro, y el texto **ya no está** en el cuerpo. (E) es el
control positivo: los rótulos de los campos siguen.

---

## TC-664 · Ebstein

**(C) es la columna del índice de Celermajer**: las seis entradas en la grilla de dos columnas, la
tira del resultado en esa misma columna y **después** de la grilla —comprobado por el **índice** de
los hijos, no por el texto—, y su rótulo intacto.

**(D) ubica los tres globos por donde viven**: el del título en la barra de encabezado, el del
grupo **dentro** de `.cc9-h`, el de la cianosis **dentro** de un `<label>`. Y **(D2)** exige que el
encabezado lleve **un solo** botón, porque esta sección no tiene «Ver criterios».

**(E) separa los dos bloques del globo del grupo:** la nota de las cinco áreas en «Qué mide» y la
**CAJA ROJA** en «A tener en cuenta», con sus cuatro cortes y su origen. Es el bloque que el formato
estándar tiene para un aviso que evita un error.

**(F) es el control de las citas, y mide el invariante que importa:** los globos de Ebstein citan la
ESC 2020 **dos** veces —que es lo que el cuerpo tenía— y el cuerpo ya no la cita **ninguna**. El
total no cambió; cambió de lugar.

---

## TC-665 · DSAV, CVPA, ductus y ventana aortopulmonar

**Recorre las cuatro secciones en un bucle**, con su tabla de ids, títulos de grupo y conteos. El
último valor de cada fila de la tabla es **cuántos botones lleva su barra de encabezado**: 0 para el
DSAV y el ductus —que no tienen globo de título ni «Ver criterios», así que **no llevan barra**— y 1
para la CVPA y la VAP.

**(K)** comprueba que el ductus conserva **las dos** tiras —Qp/Qs y Conclusión— y que su gradiente
calculado se queda en la columna 3 con su leyenda «4 × Vmax²».

**(L) es el grupo de la línea que SALIÓ de la pantalla y NO fue al globo**: la frase del DSAV ya no
está en el cuerpo, **no pasó a ninguna entrada del registro** —porque cuenta una decisión de
diseño— y en la pantalla queda el rótulo «FEVI y DTSVI — del estudio», que es el control positivo.

**(M) y (N)** recorren los seis textos de campo y los dos párrafos de sección, cada uno por sus tres
lados. **(N3)** es el que importa de la ventana aortopulmonar: su **conducta** sigue en la
aplicación, en su globo, porque la regla de la tanda dice que no se borra nada.

**(O) son los dos controles negativos**: el ductus no tiene **ningún** globo, porque no tenía
textos; y de las siete secciones, sólo el Fontan y Eisenmenger tienen «Ver criterios».

---

## TC-666 · El contrato de la hoja de estilos

**(B) y (C) son los dos cortes**, y cada uno se comprueba por su **valor** y no por su existencia:
la regla de las tres columnas existe **una** vez y está dentro de una media query de **900 px**; la
de la conclusión a la derecha, dentro de una de **1260 px**. **(C3)** exige además que **no exista**
ninguna media query de 1220 px, que es el corte que la cuenta a mano proponía y donde la columna
mide 192.

**(D) es la base**: la fila y las columnas nacen en **una** columna, **fuera** de toda media query.

⚠️ **(D1b) NACIÓ DEL BARRIDO DE MUTACIONES.** (D1) mira el **prefijo** de la regla base, así que
una regla base con los 360 px agregados —o sea la conclusión a la derecha **siempre**, también en el
teléfono— seguía empezando con `minmax(0,1fr)` y la condición seguía diciendo «fuera». Lo que
hacía falta es afirmar que la regla **base** es de una sola columna.

**(E1)** es el piso de las columnas: ninguna regla de `.cc9-col` declara un `min-width` en píxeles
**fuera** de la media query, que es la lección de PANT-8.

**(G) son los controles negativos de alcance**: las siete secciones llevan la fila, **y ninguna otra
parte del documento la lleva** —siete `.cc9-fila` y siete `.cc9-cuadro` en todo el documento—, y la
TGA, que esta tanda **no** toca, sigue con su propia fila y sin ninguna clase de la tanda.

---

## TC-667 · TAVI

**(A) la opción nueva** y el **control** de que el selector de Válvulas no cambió, nombrando sus
nueve valores. **(B) el texto de papel**, que no es opcional: la línea del emisor es
`TAVI_TXT.morf[morf] || morf`, así que una morfología sin texto publica su **token crudo** en el
informe firmado. **(B2)** exige además que ese texto **describa** y no nombre guía ni conducta.

**(C) la tabla de parejas**: dos, y los dos controles de las que **no** están —«Trivalva normal»,
porque afirma que la válvula es **normal**, y «cuadricuspide», que no tiene equivalente—.

**(D) el sentido TAVI → Válvulas**, incondicional, con sus dos controles de valores sin equivalente
y **(D5)**, el borrado: al vaciar TAVI, Válvulas **se queda** con su valor, porque `va_morf` no
tiene opción vacía y poner «Trivalva normal» **afirmaría** que la válvula es normal.

**(E) el sentido Válvulas → TAVI, condicional**: con el formulario limpio el módulo **no** está en
uso y no escribe; con un campo propio de TAVI cargado **sí**; y tres controles de valores sin
equivalente. **(E8)** es el que prueba que un valor sin equivalente **no borra** el otro lado.

**(F)** es el que impide que el espejo se autorice a sí mismo: con **sólo** la morfología de TAVI
puesta, el módulo **no** cuenta como en uso, porque `ete_tavi_morf` entra en la exclusión de
`_taviModuloEnUso`.

**(G) la siembra MUDA**, como repone un estudio guardado: nada se mueve de ningún lado, en los dos
sentidos.

**(H) el Laboratorio**, que es el motivo de que la sincronía sea condicional: con la morfología de
TAVI cargada el estudio cuenta como «Con TAVI»; con sólo «Bicúspide» en Válvulas, no.
