<!-- ficha armada sobre 9751f05, 2026-10-29 -->
# TC-550 — la pantalla «Imágenes guardadas», la estrella de imagen, el PPT y el esquema

Archivo propio porque `docs/mapa/tests.md` está en 26,9 KB y esta ficha pesa sola lo que una
sección entera. El mapa del código es `docs/mapa/img-guardadas.md`.

**Qué fija, por grupo.** Las letras son las de las condiciones del caso.

| Grupo | Qué afirma |
|---|---|
| **Z1–Z6** | Lo que tiene que EXISTIR: los dos botones, la página con su columna, el visor y el aviso del PPT, la caja del esquema con su medidor de longitud de arco, las cuatro operaciones nuevas de `CeiboImg` y las diez funciones del módulo. Van primero y como condiciones, no como una guarda que devuelve: contra HEAD el caso cae por **siete** condiciones y **ninguna por excepción**. |
| **A0–A2** | Los dos botones, con la barra de memoria en su misma fila; «Informes guardados» **activo por omisión**; y que al elegir imágenes se esconden la lista, «Eliminar todos», «Exportar» e «Importar». |
| **B0–B4** | Los meses **nacen plegados** con `aria-expanded` en false y **cero** miniaturas construidas; al abrir uno por su botón aparecen numeradas; cada miniatura **nombra su estudio** en el `title` y en el rótulo accesible —que es el enlace de dónde viene—; y el visor abre en grande con el paciente a la vista. |
| **C0–C4** | Los filtros se aplican por el **estudio** de cada imagen: el buscador y —el que importa— el **numérico**, que entra por la cadena larga de `aplicarFiltros`. Y limpiar devuelve el total. |
| **D0–D6** | La estrella de **imagen** marca, se anuncia, queda en el **slot** y su color es distinto del amarillo de «Casos de interés»; la nota se escribe en el visor, con `maxlength` 300, y la miniatura la anuncia con su texto en el `title`; el filtro «de interés» usa **esta** estrella; y desmarcar **borra** la nota. |
| **E0–E4** | El tope de **24** y los repartos **1, 2 y 4**, los dos de la demo aprobada; el orden del mazo es el de **elección** y no el de la grilla; las elegidas llevan su número de orden; exportar abre **primero** el aviso, que nombra las dos cosas; y «Volver y tapar» no arma nada. |
| **F0–F6** | Con los cuatro campos vacíos el esquema no se dibuja; con datos dibuja las dos medidas y **no juzga**; se guarda solo, marcado, con **una sola copia**; los **slots no se tocan**; al cambiar un dato la imagen guardada **se actualiza**; el barrido de recálculo **repinta pero no escribe**; y el esquema **sobrevive** a guardar el estudio. |
| **G1** | Borrar un estudio se lleva sus imágenes, y sin tocar las del otro. |
| **H1–H3** | El Excel sigue en **440** columnas con la orejuela y su esquema cargados; ni el informe ni el EN SUMA nombran el esquema; y la nota y la casilla del PPT **no son campos del estudio**. |

---

## Los cuatro defectos que el propio caso tuvo, y que son trampas de método

**1. Un uuid de SIETE caracteres no se guarda, y el síntoma es «la pantalla no pinta».**
`_uuidValido` exige largo ≥ 8. Con `'tc550-a'`, `CeiboImg.guardar` devolvía `false` sin escribir
nada y la página salía con **0 grupos** — que se lee como que el pintado está roto, no como que la
siembra falló. Costó una corrida entera.

**2. La grilla ordena por fecha DESCENDENTE, así que la primera miniatura no es la del primer
estudio sembrado.** El caso marcaba la estrella en la miniatura 0 —que es la del estudio más
nuevo— y después la buscaba en el otro uuid: la pantalla decía que estaba marcada y el disco decía
que no, **con las dos cosas ciertas**. Hoy el uuid y el índice salen del `dataset` de la miniatura.

**3. Cada clic repinta la grilla entera, así que una lista de nodos capturada al principio queda
desprendida.** Elegir cinco imágenes en orden inverso elegía **una** y el caso reportaba «elegidas
4» como si fuera el orden. Hoy la miniatura se vuelve a buscar por `data-ig-n` antes de cada clic.

**4. `S()` despacha `input`, y el `oninput` del campo es justo el camino que GUARDA.** El control
(F3) —«el barrido repinta pero no escribe»— medía con `S()` y por lo tanto medía el **gesto del
médico**: daba «escribió», que es lo contrario de lo que viene a probar. Hoy pone el valor
directo, sin evento, que es lo que hace la restauración de un estudio guardado.

Y la de siempre: **el cuerpo es un template literal.** Un acento grave —aunque esté dentro de un
comentario— cierra la cadena y el archivo deja de parsear con un `SyntaxError` que apunta decenas
de líneas antes del culpable. Pasó **dos veces** en esta tanda. `node --check` sobre el archivo es
lo único que lo caza; `check_backticks.py` no distingue el comentario del cuerpo.

---

## Aislamiento

El suite corre los 565 casos en UNA página y comparte su IndexedDB. El caso guarda la lista de
estudios y el estado del toggle, siembra **dos** estudios con dos imágenes cada uno, mide, y en un
`finally` borra sus registros (`CeiboImg.borrar`), repone la lista, repone el toggle, invalida el
índice y vuelve a la vista de informes. Sin eso los estudios sembrados quedan vivos para los
casos siguientes —que es cómo TC-131 dejaba un modal abierto y TC-252 medía debajo de él—.

---

## Las dieciocho mutaciones

`scripts/_mut_img.py`, en un worktree y nunca sobre el árbol vivo, con guarda de md5.
**Tres no revierten nada: la aplican de más** —la 15 hace que el esquema JUZGUE, la 16 que el
barrido de recálculo escriba la imagen, y la 18 que el esquema entre entre los slots del estudio,
que es por donde llegaría al PDF firmado—. Existen porque las condiciones que las matan son
**controles negativos**, y un control negativo que ninguna mutación puede romper no está probando
nada.

**La 03 rompe las dos mitades a la vez**: lo que la vista de imágenes esconde son tres controles y
(A2) los mira juntos, así que rompe el helper del `display` y no uno de los tres.

**Son dieciocho y no de diez a catorce como pide la regla T4**, y se declara: cada una mata una
condición distinta, y bajar a catorce dejaba cuatro sin cubrir. El tope de la regla es de tiempo
—25 minutos— y el barrido entra con margen.
