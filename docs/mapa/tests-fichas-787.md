# Fichas de casos — TC-787 a TC-794 (tanda PANT-30, 2026-11-10)

Archivo propio, como manda la regla de los mapas: `tests-fichas.md` está cerca de su techo y
`tests-punteros-tandas.md` en 33,3 KB.

⚠️ **Los ocho caen contra `41d9c1d`** —el cierre de PANT-29— **por condiciones y NINGUNO por
excepción**, verificado en un worktree alternando solo `index.html` con el mismo archivo de
casos: **0/8**.

⚠️ **Ni un acento grave ni una expresión regular con barra invertida** en estos cuerpos: son
template literales, así que un backtick cierra la cadena y `/\s+/` llega como `/s+/` y reemplaza
las eses. Las dos trampas están en `CLAUDE.md` y las dos se pagaron ya.

---

## TC-787 — el botón «Documentos» y su menú

Que el botón **existe y es visible** (ése es el denominador de todo lo demás), con **44 px** de
alto táctil; que la fila de acciones **conserva sus cuatro botones** y que «Regenerar Informe»
sigue ahí **con la I mayúscula**; que el menú nace cerrado, abre, lo dice en `aria-expanded`, trae
**cuatro** opciones y **ninguna** inactiva; que **Escape** lo cierra **y devuelve el foco al
botón**; y que un clic afuera también lo cierra.

**Y una ausencia que se fija:** que **ninguna** opción mencione el transtorácico ni el eco de
estrés. No es un detalle de redacción: la app no tiene catálogo de tipos de estudio.

⚠️ **Los hermanos se cuentan en la FILA, no en su padre.** `closest('div')` sube por el `<span>`
del envoltorio hasta la fila; pedirle los hijos a su `parentElement` da los del cuerpo de la
tarjeta, que no tiene ningún botón directo —**cero hermanos**, que se lee igual que «la fila se
rompió»—.

---

## TC-788 — la constancia

Cero marcadores sin sustituir; el nombre, el documento con su etiqueta y la ciudad puestos; el
**artículo del sexo en sus TRES estados** —«la paciente», «el paciente» y, **sin sexo cargado**,
«el/la paciente»—; el **nombre del estudio** saliendo de la casilla `ete-es-ete` y cambiando con
ella en los dos sentidos; el **azul solo en pantalla**, con la condición de que ninguna operación
de papel lleve esa clase; **UNA** hoja en el maquetador **y** en el PDF de verdad; nada fuera del
margen izquierdo; el pie en su hoja; y la línea de firma a **90 pt o más** del final del texto.

⚠️ **El pie se busca CON SU TILDE.** `docSan` conserva los acentos —WinAnsi llega a U+00FF— así
que dice «Página». Buscando «Pagina» la condición daba **0 de 1** sobre un pie que sí estaba.

---

## TC-789 — los tres consentimientos

Para cada uno de los cuatro documentos: las **hojas que la orden fija**, medidas en el maquetador
**y** en `doc.getNumberOfPages()` del PDF de verdad —constancia 1, cardioversión 2, ETE **3**,
burbujas 2—; el **pie en TODAS** las hojas; **cero glifos U+2610** en el papel, porque la casilla
se dibuja; cero marcadores sueltos; la **declaración y la tabla de firmas en la MISMA hoja**; las
secciones **numeradas desde 1 y sin saltos**; y las hojas comunes en **su propia hoja, la última**.

Del ETE además: **«Antes del estudio» arranca la hoja 2** y dibuja **18** casillas (ocho
preguntas × 2 + las dos de la declaración). Y la **viñeta de la internación** solo en la
cardioversión, con su control negativo en los otros dos.

En pantalla: las casillas del ETE en una grilla de **dos** columnas, más de 20 controles
editables y la tabla de firmas con sus **tres** columnas.

---

## TC-790 — la hoja editada nunca se pisa

Al abrir sin tocar nada **no hay aviso**; una corrección a mano **sobrevive** a cerrar y reabrir
y **sigue sin aviso** porque el dato no cambió; con la hoja editada **y** un dato cambiado
**avisa**, y **no pisa** —la corrección sigue y el nombre viejo también, y el nuevo **todavía no
está**—; y **recién** al apretar «Actualizar con los datos» entra el dato nuevo, la hoja vuelve al
texto de fábrica y el aviso se apaga.

---

## TC-791 — «Guardar en Imágenes»

La clave lleva prefijo `doc-` y **ninguna clave de `INF_MIN_DIAG` empieza así** —si una lo
hiciera, `diagGuardarIncluidos` se llevaría la hoja puesta—. Sin estudio guardado **no guarda y
dice el motivo**. Con el estudio guardado: guarda, queda **UN** esquema con una imagen de verdad
adentro, **no entra a los slots** que el PDF del informe imprime, aparece «Quitar de Imágenes»,
volver a guardarlo **REEMPLAZA y no agrega**, «Quitar» lo saca y el botón se esconde, y **quitar
de nuevo NO dice que quitó algo** —control negativo—.

⚠️ **Para que haya uuid hay que interceptar `mostrarCardSeveridadValvular`**, que sí es
`window.*`: `valvSevConfirmada` es un `let` de nivel superior y asignarla en `window` no hace
nada; `guardarInforme` devuelve `false` **sin un solo toast**. La trampa está en TC-535.

---

## TC-792 — la cuenta de prótesis

Sobre diez estudios sintéticos: que **`valvEsProtesis` y el mapa de tipos no se contradigan** —la
condición que se pone roja el día que uno de los dos cambie—; que TAVI cuente como prótesis y la
plastia y el TEER **no**; el denominador de 10; 8 con prótesis o reparación, 6 con prótesis, 2 con
reparación; que **las reparaciones vayan en tramos distintos** de los de prótesis en cada
posición; que **ATS** sume sus 3 estudios con sus 3 alteraciones; que **Hancock II mitral NO
herede** la estenosis de la aórtica del mismo estudio; que los trastornos se cuenten con el
denominador de estudios **con prótesis**; y —la condición central— que **«Con alguna alteración»
sean 3 y no 5**, porque «sin datos suficientes» y «hallazgo aislado» van **aparte**, con la
condición hermana de que el registro los declare con `alt` nulo.

**Control negativo del texto:** una **estenosis aórtica NATIVA** no se cuenta como trastorno
protésico por ninguna puerta, y ese estudio tampoco entra en la población con prótesis.

---

## TC-793 — la sección en pantalla

Que **no** declare `data-ppt` y **sí** `data-ppt-no` con un motivo legible, y que por eso **no
tenga la casilla del PPT**; que esté **debajo de Valvulopatías** y **antes de Doppler
tricuspídeo**, con las tres tarjetas presentes como denominador; que declare el denominador y el
mecanismo del trastorno; el resumen con sus tres tarjetas y su «de 16»; el gráfico **de barras
horizontales, apilado, con DOS pilas** y las series de reparación rotuladas; la tabla con sus
tres filas, **ATS sin la marca de pocos casos** (12 estudios) y **Biocor con ella** (1), con su
nota al pie; los **dos filtros** recortando y limpiándose; una barra por cada conclusión del
registro y las dos de aparte rotuladas; y —**sin prótesis**— el mensaje, el cuerpo oculto y el
gráfico **DESTRUIDO**, no vacío.

⚠️ **Primero la subpestaña «Mediciones», después el acordeón.** `#lab-sub-mediciones` nace oculto
y un acordeón dentro de un panel oculto no tiene geometría.

---

## TC-794 — la sección en el PDF de auditoría

Genera el **PDF de verdad** sobre 30 estudios con 19 modelos distintos, interceptando
`jsPDF.API.save`, y lee su **texto** de los operadores `Tj` del flujo —recorrido a mano, porque
una expresión regular con barra invertida no sobrevive al template literal de un caso—.

Comprueba que la sección esté **después de Valvulopatías** y **antes de «Funcion VD (TAPSE)»**,
con las tres presentes como denominador; la nota del denominador; el resumen; la frase de que las
reparaciones no son prótesis; la tabla de trastornos con sus **dos** filas «(aparte)»; la línea
«Con alguna alteracion:»; la tabla de modelos y su **«y 4 modelos mas.»** —19 menos el tope de
15—; la nota de pocos casos; y **UNA** gráfica de **150 mm**, que es un ancho que ningún otro
gráfico del documento usa.

**Control negativo:** sin una sola prótesis la sección sigue existiendo y dice su frase, y
faltan **las cinco** cosas —resumen, trastornos, modelos, nota y la gráfica de 150 mm—.

⚠️ **Hay que ceder el turno después de escribir en IndexedDB** antes de llamar `showTab`: ver
`P30-d`.
