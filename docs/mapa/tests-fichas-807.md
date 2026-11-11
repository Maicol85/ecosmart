# Fichas de los casos TC-807 a TC-812 (tanda PANT-33, 2026-11-10)

Archivo propio desde el principio: `tests-fichas-801.md` cierra la camada de PANT-32 y
`tests-punteros-tandas.md` ya paso por el techo una vez.

Los seis casos **caen contra `6cccf59`** — la linea base de la tanda —, verificado en un arbol
con el `index.html` de ese commit y el **mismo** archivo de casos.

---

## TC-807 — el encabezado (PARTE D)

**Que afirma.** La institucion del documento sale del **centro de trabajo** del medico
(`ett_centro_principal`, por `hdrCentroNombre()`), en los tres estados del modo institucional;
sin ningun centro cargado queda **vacia** y no «CeiboMed»; el logo y el circulo de iniciales caen
en el **rincon derecho** del papel (x 178 y 189 de 210 mm) y el nombre va centrado en el ancho de
la hoja; sin institucion **no se dibuja** el nombre ni el circulo ni ninguna raya — dos
operaciones menos —; en pantalla el orden del DOM es hueco, nombre y logo; sin dato va una
**linea gris** con «Nombre de la institución» por `::before` sobre el elemento vacio, editable en
la hoja del Informe y **no** en la de Configuracion; los **seis** documentos arrancan con el
mismo bloque de encabezado; y los cuatro incluidos sin editar siguen dando el papel de PANT-31.

**Denominadores.** El modulo y su lector de datos; el papel armado; y el centro sembrado.

**Como cae contra la linea base.** Por **catorce** condiciones y **sin una excepcion**: (A0) a
(A4) por «CeiboMed», (B1) y (B4) por el logo en x 21 y 14, (C1) a (C4) por el circulo vacio y el
nombre que se dibuja igual, (D1) por el orden del DOM, (D3) a (D6) por la raya.

**Trampa que paga.** Mide el papel **con** la institucion sembrada y **sin** ella por separado:
sin sembrarla, el encabezado no dibuja nada y las cifras de PANT-31 no se pueden medir.

---

## TC-808 — el almacen de PANT-32 (A5)

**Que afirma.** Un almacen **sin** la raiz `blanco` — el que PANT-32 dejo en el navegador del
medico — se acepta **entero**; `DOCMOD_VER` sigue en **1**, porque subirla haria lo mismo por el
otro camino; lo editado de los incluidos llega con su nombre y su «oculto»; los documentos
**propios** llegan intactos, **no se listan** y sobreviven a **dos escrituras** del almacen; la
raiz de los blancos se **completa** con su valor de fabrica; y el validador sigue rechazando una
raiz desconocida, una clave de blanco que no existe y un numero donde va un texto.

**Denominadores.** El almacen, su validador y su lista.

**Como cae contra la linea base.** Por cuatro condiciones: (A6), (B1), (C4) y (C5).

**Por que importa.** Es el riesgo de A5 escrito como caso: si el validador exigiera la raiz
nueva, el medico perderia **lo que ya edito** de los cuatro incluidos.

---

## TC-809 — el editor sobre la hoja, de punta a punta (PARTE B)

**Que afirma.** «Guardar como modelo» arranca **apagado**, se prende con el primer cambio, al
guardar dice «Modelo guardado.», la hoja **queda abierta** y el boton se vuelve a apagar; el
modelo queda en el almacen **como texto**; el Informe abre el documento con el cambio puesto y
**sin una sola marca a la vista**; lo que se corrige en la hoja del Informe **no toca el
modelo**, y el nombre de la institucion corregido ahi llega al **PAPEL** por `docDatosHoja`;
«Volver al texto original» pregunta con su texto exacto, carga el original **sin guardar**, y
recien al guardar `ed` vuelve a `null` y **`docmodDef` vuelve a ser el objeto de `DOC_DEFS`** —
la regla de oro se recupera sola —; el clic en el fondo **no cierra** y no abre ninguna pregunta;
la ✕ con cambios sin guardar **si** pregunta, con el foco en «Seguir editando»; y «Salir sin
guardar» cierra sin guardar nada y devuelve el modo a `informe`.

**Denominadores.** El editor, la hoja abierta, el parrafo editable del Informe y el nombre
editable de la institucion.

**Como cae contra la linea base.** Por su denominador: ahi `docmodEdGuardar`, `docmodEdCerrar` y
`doc-acc-modelo` no existen.

**Hueco que cerro el barrido.** Las condiciones (C3) a (C7) nacieron de la mutacion 10: ninguna
ataba el nombre corregido **al papel**.

---

## TC-810 — la ida y vuelta de los cuatro incluidos (B4)

**Que afirma.** Para los cuatro incluidos: el texto que el editor muestra tiene contenido y trae
0 / 5 / 6 / 6 titulos de seccion marcados con `## `; texto → modelo → texto da el **mismo**
texto y las **mismas** palabras; los bloques que el maquetador recibe salen **iguales, bloque por
bloque**; el **cuerpo reconvertido es IGUAL al original** y con la misma cantidad de preguntas; y
el papel del texto reconvertido es el de su definicion — 1/13, 3/150, 3/198 y 3/152 —. Con un
control negativo: con otro texto, el papel es otro.

**Denominadores.** Los dos conversores, el original derivado y el armador; y jsPDF, esperado en
un bucle.

**Como cae contra la linea base.** Por su denominador: ahi `docmodModeloATexto` no existe.

**Hueco que cerro el barrido.** (A5b) y (A5c) nacieron de la mutacion 22, que dejaba el texto y
el papel **identicos** y solo cambiaba la FORMA del modelo — y de esa forma depende la regla de
oro, porque `docmodIgualAlOriginal` compara los cuerpos.

---

## TC-811 — los dos documentos en blanco (PARTE C)

**Que afirma.** Las dos claves son fijas y `docmodEsBlanco` las distingue; vienen con su nombre
de fabrica, vacias, con la firma tildada y visibles; su etiqueta es «En blanco»; **no** traen
ninguna de las tres piezas de un consentimiento; vacio y con firma son **tres** bloques y con
texto **cuatro**, sin titulo, sin linea del paciente, sin tabla de firmas y sin salto de hoja; se
imprimen con 10,2 / 13,4 pt; estan en la lista y en el menu, **al final**; ocultar uno lo saca
del menu **al instante** y la fila lo dice; el editor abre con el campo del nombre, «Vaciar» y la
casilla de la firma del modelo, y **sin** «Volver al texto original» ni la casilla de la frase;
el nombre guardado viaja a la **lista**, al **menu** y a `def.tit` — que nombra la miniatura y el
pie del PDF —; con el nombre vacio **avisa** y no guarda; «Vaciar» pregunta y deja el documento
como al inicio; y la casilla de la firma del **Informe** saca la firma de la pantalla y del papel
**sin tocar el modelo**, y no se ve con un incluido abierto.

**Denominadores.** Las dos claves; el editor abierto con sus tres controles.

**Como cae contra la linea base.** Por su denominador: ahi `DOCMOD_BLANCOS` no existe.

**Trampa que paga.** (D7) y (D7b) son **dos** condiciones y no una: unidas por un «y» dentro de
una funcion anonima, la mutacion que saca el control del nombre vacio **sobrevivia**.

---

## TC-812 — el papel de un documento en blanco (C5/C6)

**Que afirma.** Vacio y sin firma: **una** hoja de **cinco** operaciones y sin firma; vacio y con
firma: una hoja con la firma en ella; un renglon corto: una hoja con texto arriba de la firma; un
texto de 26 parrafos: **dos** hojas, con la firma en la segunda y **texto arriba de ella** — o sea
**la firma no queda sola** —; y en **trece** largos distintos, de 10 a 22 parrafos, la firma no
queda sola en ninguno. En el Informe: la hoja trae **una** zona editable aunque el texto este
vacio, con su texto gris; pegar un texto de varias lineas **conserva sus saltos** y entra como
TEXTO; y el papel lo recibe con el titulo como seccion numerada y sin las marcas. Y la clave del
esquema es `doc-b1`, que no choca con ningun diagrama.

**Denominadores.** El armador, el maquetador, `docBloquesHoja`, el papel armado, el centro
sembrado y la zona editable.

**Como cae contra la linea base.** Por su denominador: ahi `docBloquesHoja` no existe.

**Dos defectos propios que destapo.** El pegado colapsaba los saltos de linea — `docSan` manda a
un espacio el U+000A — y su primera version medía el papel sin sembrar el centro de trabajo, o
sea dos operaciones menos.
