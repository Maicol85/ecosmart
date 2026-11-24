# Fichas de los casos TC-1051 a TC-1057 — tanda PR8 (2026-11-24)

Siete casos, uno por grupo de la verificación. Los siete caen **0/7 contra `d6f8326`** —el cierre
de PR7— con el **mismo archivo de casos** y sólo el `index.html` distinto, por **64 condiciones** y
**ninguno por excepción**: todo acceso va por un ayudante con guarda que devuelve una forma vacía.

El barrido de mutaciones que los respalda es `scripts/_mut_pr8.py` (**46** mutaciones dirigidas,
al menos dos por grupo). La sonda de medición es `scripts/_probe_pr8.mjs` con su cuerpo aparte, y
el A/B del papel `scripts/_probe_pr8ab.mjs`.

---

## TC-1051 — el resumen de válvulas, botón de icono, y «Restablecer»

**Qué fija.** Que el interruptor es un `<button>` y no una casilla; que no lleva texto más allá de
su icono; que **no tiene `id`** —para no entrar al censo del estudio ni a las 457 columnas—; que
dice su función con palabras en el `title` y en el `aria-label`; que mide 44×44; que al tocarlo los
cuadros de válvulas aparecen **en el momento** en la vista previa, debajo de su propio título a
todo el ancho; que **no entran al orden de los doce** ni al arrastre ni a los quitados —no llevan
`data-cuad-id` ni cruz—; y que «Restablecer» lo apaga y se lleva esas cajas.

**Denominadores.** Que arranca apagado y sin cajas de válvula, y que los doce están en el orden de
fábrica.

⚠️ **La siembra necesita `e_sep` y `e_lat`**: sin ellos el cuadro `dti` no tiene datos y la tarjeta
pinta **once** cuadros, no doce. Lo pagó la primera corrida de este caso.

## TC-1052 — el arrastre

**Qué fija.** Que el gesto agarra el **cuerpo** del cuadro y no el asa; que el movimiento prende el
arrastre y marca **un** cuadro de destino; que al soltar los dos se **intercambian**; que el que se
movió **no queda gris** ni con el marcador puesto y **se puede volver a mover** —el intercambio
inverso devuelve el orden de fábrica—; que un clic sin movimiento **no** reordena; que la cruz
**no** arrastra; y que al intercambiar dos cuadros los **anchos se quedan en su posición**.

**Denominadores.** Que la tarjeta tiene los doce en el orden de fábrica; que el punto donde arranca
el gesto está en el cuerpo y no en el asa; que el arrastre se mueve en los **dos** ejes; y que
había un cuadro debajo del puntero al soltar.

⚠️ **Tres trampas medidas.** (1) La ventana del arnés mide **756×469** y a ese ancho va **un cuadro
por fila**, así que el quinto cae debajo del pliegue y `elementFromPoint` devuelve `null`: se
arrastra al **siguiente**, que es la receta de TC-939. (2) El denominador del puntero se mide
**antes** de soltar: después, el cuadro que está en ese lugar ya es el intercambiado. (3) A 756 px
la media query de celular le pone `span 6` a todos, así que lo que distingue el ancho es el
**atributo** `data-cuad-span` y no el ancho en píxeles.

## TC-1053 — el copiado con formato

**Qué fija.** Que los títulos de sección van en negrita y que el **subrayado es sólo el de
DOPPLER**; que hay una línea en blanco entre secciones; que el informe lleva «INFORME» y «EN SUMA:»
en negrita y subrayados y cada ítem con su viñeta; que **los dos formatos viajan en el mismo
copiado** —`text/html` y `text/plain` en un solo `ClipboardItem`, con **una** sola escritura al
portapapeles—; y que sin formato disponible copia el texto plano **sin romper nada**.

⚠️ **El caso apaga también la vía del nodo editable** (`document.execCommand`), que es la que
conserva el formato sin `ClipboardItem`: así mide la **última** red, la del texto plano.

## TC-1054 — el texto de los datos numéricos

**Qué fija.** La mayúscula inicial de **cada** renglón; que ningún renglón es un mensaje, con el
**control** de que un valor no lo es; que una pieza que es un mensaje se omite sola; que la PAP
media lleva su unidad **con el campo en un número pelado**; que la línea mitral es
`THP - TDE - TRIV - área` y no pasa del largo que decide el corte; que el THP se publica **una**
vez —el área dice que sale de él y no hay un segundo renglón—; que el ventrículo izquierdo va en
**tres** grupos con sus seis renglones en orden; que no hay dos líneas en blanco pegadas; y que el
pericardio no entra.

## TC-1055 — el PDF «Tipo Word»

**Qué fija.** Que el PDF se genera y estampa texto; que la ficha del paciente sale arriba; que **no
hay un solo recuadro** —los rectángulos que quedan son subrayados finos— y que tiene muchos menos
que el estilo de cuadros; que sin logo cargado **no agrega ninguna imagen**; que los datos
numéricos salen **idénticos al texto copiado, renglón por renglón**; que el narrativo va todo junto
con INFORME y EN SUMA y cada ítem con su **viñeta dibujada**; que el clásico **conserva** sus
recuadros; y que ni el clásico ni el moderno ganan viñetas.

**Denominador.** Que el texto copiado tiene secciones que comparar.

## TC-1056 — la entrada de datos del SGL

**Qué fija.** Que los diecisiete arrancan **todos** en el violeta del tramo 1 y **sin** números ni
guion; que eso **no** cuenta como segmento evaluado —el papel sigue sin bull's eye—; que el tramo
por omisión es el 1; el ciclo `2,3,4,5,6,7,8,0,1,2`; que el guion **no** sale con el botón apagado
y **sí** con el encendido en el segmento sin número; que un `+8` se conserva positivo y se muestra
con su signo; que sin signo se toma negativo; que borrar el número devuelve el segmento al violeta;
que la casilla abre con el valor actual y **esconde la etiqueta vieja**; que con el botón apagado un
segmento **con** número no cambia de color y hay un aviso que dice qué activar; que uno **sin**
número sí cicla; y que la migración manda el 0 viejo al tramo 1.

## TC-1057 — la tabla «Cálculos de strain»

**Qué fija.** Que la tabla existe **entre** la tarjeta del bull's eye y los patrones; sus cuatro
columnas en orden y sus tres filas de cuatro celdas; que **no lleva una sola casilla** de
inclusión; que sin números sus botones están apagados con el motivo **en el botón y en la celda**;
que sus botones se tocan en 44 px; los cinco promedios, el reparto por territorio —que es el de
Contractilidad— y las dos fórmulas; que los botones se prenden sin ninguna falta; que los promedios
salen con **un** decimal y coma y las razones con **dos**; que al cambiar un número que una celda
usó **su** resultado se borra y los otros no; que «Usar como SGL global» **pregunta** antes de
reemplazar un valor cargado, con un rótulo que lo dice, y que el campo **no cambia** mientras
espera; y el **control negativo**: con el campo vacío no pregunta y escribe en el acto.

⚠️ **El cartel se ESPÍA en vez de buscarlo en el DOM.** Devuelve una promesa que sólo un clic
resuelve: un caso que lo deja abierto tapa la página entera para los que siguen en su lote —es lo
que la tanda EQ pagó con TC-990— y buscarlo por su marca depende de que nadie más lo haya cerrado
en el medio. Lo que la orden pide se mide en **dos mitades**: que la pregunta se haga, y que el
campo no cambie mientras se espera la respuesta.

⚠️ **Deja la pizarra limpia** en su `finally`: los diecisiete números y el campo de SGL atraviesan
los casos —la batería corre los mil en **una** página— y con strain cargado el bull's eye entra al
PDF de cualquier caso que lo genere después.
