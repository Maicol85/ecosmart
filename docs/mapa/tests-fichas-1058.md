# Fichas de los casos TC-1058 a TC-1063 (tanda PR9, 2026-11-25)

Archivo propio porque `docs/mapa/tests-fichas-1051.md` cubre PR8 y
`docs/mapa/tests-punteros-tandas.md` está en 36,4 KB, o sea **por encima** del techo de 35 KB
que esta casa se fija para un mapa. Agregarle un puntero a un archivo que ya lo cruzó es
exactamente lo que esa regla viene a evitar.

Los seis **caen 0/6 contra `1932582`** —el cierre de PR8— con el mismo archivo de casos y sólo el
`index.html` distinto.

---

## TC-1058 — la tabla «Cálculos de strain»

**Qué fija.** Una línea por celda; los nombres cortos sin el rango de segmentos; **cero** lista de
faltantes dentro de la celda y el motivo en el `title` **y** en el `aria-label` del icono apagado,
nombrando los segmentos del bull's eye y resumiendo a partir del cuarto; que ningún icono apagado
lleve el atributo `disabled`; veintidós iconos (diez globos y doce de acción); los de acción en
SVG de un solo color, sin emoji y sin imagen; los globos con el glifo de texto de la casa y
**ninguno** con `title`; el glifo en 14 px o menos y el toque en 44 × 44 por el `::after`; título
+ encabezado + tres filas dentro de **120 px**; la tabla dentro de 520 px; cero desplazamiento del
documento; y la frase de introducción fuera del cuerpo y dentro del globo `sc-caja`.

**Control.** Con los diecisiete cargados los iconos se prenden, sin lista de faltantes, y la caja
no crece. Quedan **tres** apagados a propósito: el Calcular de FEVI/SGL —que esta escena no
carga— y las dos flechas de «Usar como SGL global», que esperan a que su celda esté calculada.

**Por qué cae contra el árbol anterior.** Dieciséis condiciones.

---

## TC-1059 — el PDF «Tipo Word»

**Qué fija.** El ETT normal en **una** hoja A4; un **solo** tamaño de letra en el cuerpo, en
negrita y en normal; los datos numéricos, la narrativa y el EN SUMA al **mismo** tamaño; que ese
tamaño **nunca baje de 9 pt**; que la separación entre líneas de datos sea **siempre la misma**,
sin renglones en blanco sueltos; que el estudio largo entre en dos hojas de cuerpo sin dejar un
título huérfano y con el mismo cuerpo de letra en su primera hoja.

**Control.** El estilo clásico no se movió y sigue con sus propios cuerpos de letra.

**Denominadores.** Que la biblioteca de PDF cargó; que el estudio largo lleva el Wilkins
integrado al informe; que el documento normal trae los tres bloques (datos, INFORME y EN SUMA); y
que hay al menos **cinco** saltos entre líneas de datos consecutivas que medir —tres dentro del
ventrículo izquierdo, y uno de ellos es el par FEVI / Masa idx, que es justo donde el renglón en
blanco abría 8,8 mm—.

⚠️ **Cuenta las hojas POR DOCUMENTO.** `_pdfAjustarA4` genera el PDF varias veces —una por paso
de la escalera que mide, más la final—, así que un contador compartido entre instancias suma las
hojas de todas las pasadas y publica un número que no es el de ningún documento.

---

## TC-1060 — los recuadros de texto variable

**Qué fija.** Que el bloque que sigue a un recuadro **nunca** empiece antes de su borde de abajo,
con texto corto, largo y muy largo y con el ancho recortado a 90 y a 60 mm; y que entre la franja
de título de una tarjeta y su primer subtítulo quede un aire **de verdad** (≥ 2 mm) y **el mismo**
en los cinco escenarios.

**Denominadores.** Que los cinco escenarios dibujaron su recuadro y algo debajo; que el texto se
parte en más renglones cuanto más largo o más angosto; y que lo que sigue al recuadro es el
subtítulo, en los cinco.

⚠️ **Una línea de base EXACTAMENTE en el borde de abajo es el defecto, no «adentro».** La primera
versión de este detector descartaba `t.y <= abajo` y por eso daba «ninguno» sobre la tarjeta que
el médico reportó.

⚠️ **Mide con `amiloDibujarSecciones` y un jsPDF espiado**, no con el PDF de un estudio: así los
cinco escenarios de texto y ancho se montan exactos y el caso no depende de qué módulos haya
integrados.

---

## TC-1061 — el ingreso del SGL

**Qué fija.** Que la regla acepte los siete valores válidos y rechace los ocho imposibles —entre
ellos `1718` y `-1718`—; que la casilla traiga su tope de caracteres y su teclado numérico; que
escribir `-17` y después `18` en la misma celda **no** forme `-1718`; que pegar un número largo
tampoco entre; que escribir un valor imposible no se guarde y avise; que los valores normales
sigan entrando igual; que un valor imposible **ya guardado** quede como «Sin dato» en gris, con
**un solo** aviso por restauración.

**Control.** No se borra nada más: los demás segmentos vuelven como estaban, y el segmento
inválido no contamina los promedios.

**Denominador.** Que la regla de la celda existe y que el bull's eye tiene segmentos. Es por donde
cae contra el árbol anterior, donde `strainTxtValido` no existe.

---

## TC-1062 — el cartel de FEVI/SGL

**Qué fija.** Los cuatro estados del cartel; que ese texto sea el que se ve en el `title` del
icono apagado; que con las dos cargadas calcule; que la FEVI salga del **mismo** valor que usa el
informe; que al cambiar la FEVI en la aplicación el resultado ya calculado **se borre**; y que el
campo de SGL llenado **a mano** cuente igual para la fórmula.

**Control.** Un SGL global en cero no alcanza y lo dice.

⚠️ **Espera 500 ms después de mover la FEVI**: el barrido de espejos corre con un rebote de
220 ms, y sin esperarlo la condición mediría el valor anterior.

---

## TC-1063 — el redondeo

**Qué fija.** Que el medio se redondee **alejándose del cero** con uno y con dos decimales, y que
dé el **mismo** resultado en valor absoluto para los dos signos; que el formato publique con coma
decimal; los **nueve** resultados de la verificación de la orden; que el apical salga −15,8 **en
la pantalla**, que es el que el redondeo corrige; y que «Usar como SGL global» escriba el **mismo**
número que publica la celda.

**Control.** Lo que **no** cae en el medio se redondea como siempre: −15,74 → −15,7 y
−15,76 → −15,8.

**Denominador.** Que el redondeo sale de un dueño único, y que los diecisiete valores quedaron
cargados **con el positivo positivo** —la convención de esta casa es que un valor sin signo se
toma negativo—.
