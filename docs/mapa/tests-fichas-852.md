# Fichas de los casos TC-852 a TC-861 — tanda ECO-CONECTOR-3 (2026-11-12)

Archivo propio porque `tests-fichas-842.md` ya pasa de los 13 KB y la regla de esta casa es medir
con `wc -c` **antes** de escribir, no después.

**Los diez caen contra la línea base `bff56dc` por su DENOMINADOR DECLARADO y ninguno por una
excepción.** Es la lección de PANT-37 y de ECO-CONECTOR-1: un acceso pelado a algo que el árbol
anterior no tiene lanza un `TypeError`, el caso declara **cero** condiciones, y el conteo de «cae
0 de 10» deja de probar nada.

| caso | denominador que lo hace caer contra `bff56dc` |
|---|---|
| TC-852 | `dstPreguntar` / `dstCuenta` no existen |
| TC-853 | `dstPreguntar` / `clnkAvisoHayOtraPregunta` con la lista de seis |
| TC-854 | `mediosArchivosElegidos` / `dstDesdePendrive` no existen |
| TC-855 | `CeiboImg.agregar` / `dstAGuardado` no existen |
| TC-856 | `dstAGuardado` no existe |
| TC-857 | `_cineSacarPendiente` / `_cineHayPendientes` / `dstMB` no existen |
| TC-858 | `_cineFallos` no existe: el hueco del return temprano está abierto |
| TC-859 | `clnkbLeer` / `igBandejaRender` / `dstABandeja` no existen |
| TC-860 | `clnkbAsignar` no existe |
| TC-861 | `_dcmCrudoAFrags` / `_dcmClasificar` no existen |

---

## TC-852 · La pregunta de destino

**Qué fija.** Que el modal tiene un **cuarto** botón y que un aviso de tres salidas lo sigue
escondiendo —lo que hace que el mismo marcado sirva para las dos preguntas—; que desde CeiboLink se
ven los cuatro con sus cuatro textos y el cuarto dice **Descartar**; que desde el pendrive dice
**Cancelar** y el texto avisa que no se borra nada; que el título del pendrive cuenta **archivos** y
el texto de CeiboLink cuenta **por tipo**; que `dstCuenta` da las cuatro formas exactas; que **ni
una** de las ocho palabras de identificación del paciente aparece en el aviso; y que el **nombre de
un estudio guardado** entra como texto, no inyecta un solo elemento, no ejecuta nada y va en un
`bdi`.

**La trampa que cubre.** El bloque (F) sustituye `getInformes` por una lista con un nombre hostil
—un `img onerror` y un *bidi override* sin cerrar— porque **ésa es la fila donde el médico decide a
qué paciente le adjunta una imagen**. `textContent` impide que se ejecute; `bdi` impide que se lea
al revés, que es cómo la fila del paciente A se puede leer con el nombre del B.

---

## TC-853 · El aviso no se superpone y se actualiza

**Qué fija.** Que `CLNK_AV_BLOQUEANTES` incluye el **visor de cineloop** y el **selector de
estudio**; que con cada uno abierto el aviso se posterga y al cerrarlo deja de postergarse; que el
sondeo **no abre nada** con el selector abierto; que un envío **mixto** sale en **un** aviso con su
cuenta por tipo; que más imágenes del mismo envío dentro de la ventana **actualizan el mismo
cartel** —con los números nuevos y el título diciendo «llegaron más»— y sigue habiendo **uno**; que
sin nada nuevo **no se repinta**; y que al cerrar se **olvida el grupo**, así que vuelve a avisar.

**La trampa que cubre.** (G) es el control negativo que distingue «se actualizó» de «se repinta en
cada sondeo»; y (H) es el que caza la línea que olvida el grupo: sin ella, el médico no vería un
aviso nuevo **nunca más** en esa sesión.

---

## TC-854 · Quién pregunta y quién no

**Qué fija.** Que el menú de Guardados llama con la marca (`mediosPick(true)`) y la pestaña Imágenes
sin ella; que es **un solo** input para las dos; que sin marca se importa derecho y **no** se abre
ninguna pregunta; que con marca se pregunta y **no se importa nada**; que la marca se **consume** al
leerla; y que `mediosPick()` la saca, así que **no se hereda** entre dos gestos.

**La trampa que cubre.** El selector de archivos es asíncrono. Con una variable de módulo en vez de
un atributo, el segundo gesto heredaría la marca del primero: los archivos del estudio abierto
caerían en la pregunta, o —peor— al revés.

---

## TC-855 · Agregar a un estudio guardado

**Qué fija.** Que `CeiboImg.agregar` devuelve cuántas entraron, que quedan **tres** imágenes y que
el **esquema sobrevive**; que el otro estudio sigue vacío; que `indice()` ve cuatro entradas con el
esquema **al final**; que la **allowlist** no deja pasar `_orig` y conserva la calidad; que un uuid
inválido no escribe nada; y que una imagen ilegible tampoco.

**La trampa que cubre.** El `get` antes del `put`. Sin él, un `put` pelado se lleva los esquemas
puestos — y el médico ve desaparecer un dibujo que la app hizo, sin un solo error.

---

## TC-856 · Las dos puertas cerradas, y su control positivo

**Qué fija.** Que sin uuid no se escribe, se **dice** nombrando el identificador, se avisa que la
imagen sigue esperando y **no se anota nada para confirmar**; lo mismo con el ajuste de guardar
apagado, nombrando el ajuste y avisando que no se borró nada; y el **control positivo**: con todo en
orden **sí** escribe y recién ahí anota el id.

**La trampa que cubre.** Sin el control positivo, las dos primeras pasarían igual sobre una función
que no escribe nunca.

---

## TC-857 · El cineloop automático y la tira

**Qué fija.** Que la cola acepta y es **idempotente**; que la tira lo marca «sin guardar», dice sus
cuadros, su nombre y su **peso** —comparado contra lo que `dstMB` produce para esos bytes, no contra
un número escrito a mano—; que se **reabre** desde la tira y que es **el mismo** objeto de memoria;
que el botón «💾 Guardar» del visor **existe**, que el visor abre en **modo mínimo** y que eso lo
deja **escondido**; y que el ✕ de un pendiente lo saca de la cola.

**El hallazgo que documenta.** (D) es la prueba del defecto que abrió esta tanda: el botón estaba
ahí y nadie lo veía.

---

## TC-858 · La confirmación, el hueco y «Nuevo estudio»

**Qué fija.** Con un estudio **sin ninguna casilla llena** —el denominador, y la única escena en la
que el return temprano actuaba—: que el cineloop queda **escrito** y que **se confirma**; que
`imgPersistir` sigue devolviendo falso, porque no hay imágenes; que con la escritura fallida se
cuenta el fallo y **no se confirma nada**; el control de que sin nada pendiente no se confirma; que
«Nuevo estudio» avisa con un cineloop en la cola y con un id pendiente, con sus dos controles
negativos.

**La trampa que cubre.** Sustituir el escritor del almacén de cineloops es la única forma de llegar
a la rama del fallo sin llenar el disco del médico.

---

## TC-859 · La bandeja con el cineloop entero

**Qué fija.** Que el envío entra como **un cineloop** y no como una imagen, con sus **cinco**
cuadros y no el primero, con su peso y su miniatura, y que **se confirma** el borrado porque ya
quedó guardado; que se ve en Guardados diciendo que es un cineloop, con su peso y su botón de
asignar; que **sin espacio** no se guarda nada, se dice nombrando el espacio, se avisa que sigue
esperando y **no se confirma**; y que nada de la bandeja cambia el estudio abierto, el mapa del
Excel ni el censo de campos, que su id lleva el prefijo `clnkb_` y que **no aparece** en la base de
imágenes.

**La trampa que cubre.** La escena es un multicuadro **sin comprimir**, así que este caso cruza las
dos mitades de la tanda: si el lector crudo se rompe, el envío ni llega.

---

## TC-860 · Asignar desde la bandeja

**Qué fija.** Con **dos** estudios guardados y una imagen cada uno: que el envío entero se asigna,
que la imagen y el cineloop van al **elegido** y que el **otro no se toca**, con los tres cuadros
del cineloop; que el envío **sale** de la bandeja; que si algo falla el envío **se queda** y se le
dice al médico; que con el ajuste apagado no se escribe nada y el envío se queda; que sin uuid
tampoco; y que un envío inexistente no revienta ni cambia nada.

**La trampa que cubre.** «Fue al elegido» no prueba nada sin «y no al otro». El denominador son los
dos estudios con **una** imagen cada uno al empezar.

---

## TC-861 · El DICOM sin comprimir

**Qué fija.** Por el camino **completo** —el mismo lector, el mismo conversor y el mismo
clasificador que usa el importador— que entran: la fija **explícita**, la **implícita** con sus
32×32 bien leídos, la de **color** con sus tres muestras, la de **16 bits** y el **multicuadro**,
que sale clasificado como cineloop de cinco cuadros, todos JPEG de verdad; que los píxeles crudos se
**sueltan**; que un formato ajeno se rechaza **por su nombre**; que el **tope** rechaza lo imposible
diciendo el tamaño, con su control de que un multicuadro razonable **no** se rechaza; y que el color
en planos separados, los 12 bits y el color que no es RGB se dicen cada uno por su nombre.

**La trampa que cubre.** `esJpeg` mira los dos primeros bytes de cada cuadro producido. Sin eso,
«produjo cinco fragmentos» pasaría igual con cinco cadenas vacías.

---

## Los casos viejos que esta tanda ADAPTÓ

| caso | qué se adaptó y por qué |
|---|---|
| **TC-179** | **(INVERTIDA)** afirmaba «sin comprimir se rechaza por nombre». Hoy las dos nativas se **leen**, así que la condición exige que ya **no** se rechace por la sintaxis, y una condición **nueva** exige que ese archivo —que declara una sintaxis nativa con el pixel data **encapsulado**— se rechace diciendo «encapsulado». Es el día que esa condición anunciaba. |
| **TC-184** | **(ADAPTADO Y MÁS FUERTE)** su paso 2 esperaba que el aviso «se guarda al guardar el estudio» saliera de apretar el **💾** del visor. Hoy sale del **importador**: el destino es la decisión de guardar y ese botón dejó de ser el único camino —y de hecho está escondido en el modo mínimo—. Los toasts se capturan alrededor de la **importación**, y el caso gana tres condiciones: que con el toggle **apagado** se encole igual (sin escribir), que importar lo encole **solo**, y que apretar el botón después **no lo duplique**. Cae contra la línea base por las dos primeras. |
| **TC-847** | tres cosas. `bots()` mira **cuatro** botones; `(A) tres botones` pasa a **CUATRO** y exige las cuatro salidas por su texto, así que queda **más fuerte**; `(A) dice CUÁNTAS son` pasa de exigir el total «3» a exigir la cuenta **por tipo** («2 imágenes y 1 cineloop»), que es más informativa y más difícil de satisfacer por accidente. `(F)` —el aviso de equipo nuevo— sigue pidiendo **tres**, y eso ahora prueba algo más: que el cuarto botón se esconde solo. |

**Ninguno se borró.** **TC-161** pasa sin adaptar: los cuatro ids nuevos de esta tanda no están en
su lista y ninguno de los diecinueve de ECO-CONECTOR-1 se movió. **TC-850** pasa sin adaptar: su
censo de la sección de la bandeja mira la pestaña Imágenes, que no cambió, y su `g_diceCantidad`
busca un dígito que la cuenta por tipo sigue trayendo.
