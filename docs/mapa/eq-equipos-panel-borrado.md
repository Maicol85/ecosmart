# Mapa — tanda EQ: los equipos de CeiboLink, el panel que no se redibuja y el borrado de a varios

> Tanda **EQ** (2026-11-21), sobre el cierre de la **PARTE 1 de P8** (`77196c5`, sello
> `v20261121-1256`, md5 `8aaa289b`). Armado por nombre de función y de constante, **sin números
> de línea**: la línea cambia en cada edición, el nombre no.
>
> Lo que esta tanda **NO** toca: el puente (`ecosmart-conector`), la cadencia del sondeo,
> `eliminarInforme`, `limpiarTodosInformes`, `igSelEliminar`, `clnkbBorrarUna`, `clnkbBorrar` y
> `CeiboImg.quitar`. Cero cortes clínicos, cero fórmulas, cero umbrales, cero campos guardados
> nuevos y las **457** columnas de Excel quietas.

---

## 1 · Por qué el VINNO aparecía dos veces, y por qué el puente no se toca

El contrato del conector lo dice con todas las letras (§3.4): **«la identidad de un equipo es
AET + IP»** y **«si el mismo AET aparece desde otra IP, es un equipo distinto y vuelve a pedir
decisión»**. O sea que el puente manda **dos** equipos —uno por dirección, cada uno con su `ip`,
su `estado` y su `apodo`— y hace bien: no puede saber si son la misma máquina.

Lo que faltaba es del lado de EcoSmart: **juntarlos en un renglón y preguntarle al médico**. Con
eso, esta tanda **no necesita ninguna ruta nueva, ningún campo nuevo y ninguna ruta de unión** del
lado del puente. Todo lo que hace falta ya viaja: `aet` e `ip` de cada equipo, y las direcciones de
esta computadora con su `tipo` por `GET /v1/conexion` (§P7).

---

## 2 · El grupo: quién decide qué direcciones son el mismo equipo

| pieza | qué hace |
|---|---|
| `CLNK_EQG` | la clave de `localStorage` (`ett_clnk_eqgrupos`). Lo **único** que esta tanda persiste |
| `clnkEqGrupos()` | lee y **valida** el mapa `id → grupo` (un arreglo o un nulo se descartan) |
| `clnkEqGrupoFijar(id, grupo)` | escribe una decisión del médico |
| `clnkEqGrupoDe(eq)` | **el dueño único**: lo que el médico decidió, y si no decidió nada, `'aet:' + aet` |
| `clnkEqAgrupar(lista)` | los equipos del puente agrupados, **en el orden en que llegaron** |
| `clnkEqNombreGrupo(g)` | el nombre del grupo, prefiriendo el miembro **que tiene apodo** |
| `clnkEqMiembrosDe(id)` | los ids de las direcciones del mismo equipo. Lee `_clnkEqLista` |
| `_clnkEqLista` | la lista cruda del último `GET /v1/equipos`. La escribe `clnkLeerEquipos` |

**El grupo por omisión es el `aet` y no el nombre que se dibuja.** El apodo lo pone y lo saca el
médico, y el contrato admite que «dos equipos podrían tener el mismo apodo»: agrupar por lo que se
ve haría que **poner un apodo juntara dos equipos distintos**. El `aet` es la mitad de la identidad
que no cambia cuando el mismo ecógrafo llega por otra dirección.

**Las dos formas llevan prefijo** —`aet:` o `id:`— para que no puedan chocar: sin él, un equipo
cuyo AET fuera el id de otro caería en su grupo.

**Separar** escribe `'id:' + id`; **unir** copia la clave del grupo elegido. Las dos escriben el
**mismo** campo, así que no pueden discrepar.

---

## 3 · El rótulo de cada dirección: qué se afirma y qué se calla

`clnkEqConexion(ip)`, con `_clnkConexDirs` —las direcciones de esta computadora, que cachea
`clnkLeerConexion`—. Cuatro reglas, en este orden:

| caso | rótulo | por qué es seguro |
|---|---|---|
| `127.*` o `::1` | **«esta computadora»** | no es un ecógrafo: es el buzón o la carpeta compartida, y de eso ya habla `clnkEqProcedencia` |
| `169.254.*` | **«cable directo»** | es la dirección que se asigna sola una máquina que **no recibió ninguna**: del otro lado no hay router. Es el único rango que esta app juzga por su cuenta, igual que en el panel de direcciones |
| cae en la red /24 de **una** dirección Wi-Fi de esta computadora | **«red del router»** | un Wi-Fi necesita un punto de acceso, así que hay router |
| cae en la red /24 de **una** dirección de cable | **«por el cable»** | entró por esa interfaz. **NO dice «directo»** |
| no empareja, o emparejan dos de tipos distintos | **nada**, sólo la dirección | no se puede saber |

⚠️ **NO se dice «cable directo» por una interfaz de cable**, y es la diferencia entre informar y
afirmar: un cable puede ir al ecógrafo o a un switch, y el contrato §3.13 ya declara que «el
programa no puede distinguir el cable del Wi-Fi sin adivinar». Con un router en el medio, «cable
directo» sería **falso** justo en la fila donde el médico decide.

⚠️ **La máscara no viene en el contrato**: el /24 es un supuesto, y por eso la regla informa la
interfaz y no la topología.

---

## 4 · El renglón (`_clnkFilaGrupo`)

Se llamaba `_clnkFilaEquipo` y dibujaba **un equipo del puente**; ahora dibuja un **grupo**.

- **Con UNA dirección sale exactamente igual que antes**: misma línea, mismo chip de estado y
  «Permitir / Bloquear» a la vista. Lo fija TC-985 (E) y TC-843 sigue en verde.
- **Con varias**: el chip del renglón dice **«N direcciones»** y crece **una línea por dirección**
  con su dirección en `bdi`, su rótulo de conexión, su chip de estado y sus botones —Permitir,
  Bloquear y **Separar**—.
- ⚠️ **Las direcciones de esta computadora no se dibujan.** El buzón y la carpeta llegan con
  `127.0.0.1`, que no es la dirección de ningún ecógrafo: de dónde vinieron ya lo dice el chip de
  procedencia. Con eso, las filas de esos equipos quedan **idénticas** a antes de la tanda.
- ⚠️ **Con una sola dirección los dos botones urgentes se quedan en la línea de arriba**, y no es
  nostalgia: un equipo de carpeta **no tiene** línea de dirección, y los botones que deciden su
  cuarentena tienen que seguir visibles.
- **UN solo campo de apodo por grupo**, con el id del **primer** miembro en `data-clnk-apodo`.
  `clnkAccionEquipo(id, 'apodo')` lo escribe en **todos** los miembros, de a uno y en serie: el
  apodo es lo que `clnkNombreEqDe` publica y lo que el cartel usa, así que puesto en una sola
  dirección el mismo ecógrafo se llamaría de dos formas según por dónde llegó el envío.

---

## 5 · La pregunta del «mismo equipo con otra dirección» (A2)

Vive en `clnkAvisarEquipoNuevo`, **antes** del aviso de equipo nuevo: si el grupo de este equipo
ya tiene una dirección **autorizada**, la pregunta es otra.

- **«Sí, es el mismo»** → `clnkAccionEquipo(id, 'permitir')`: la **misma ruta del puente** que el
  botón del panel. **Ningún equipo se autoriza por su nombre**; la respuesta la da el médico.
- **«No, es otro equipo»** → lo **separa** y lo deja **en cuarentena**. El contrato admite dos
  ecógrafos con el mismo AET, y ése es justamente el caso que el «No» declara.
- **«Más tarde»** → cierra, y el próximo sondeo vuelve a preguntar.
- ⚠️ **Se usan callbacks y no `clnkAvisoPreguntar`**: esta función la **espera el sondeo**, y una
  promesa que se resuelve cuando el médico hace clic dejaría el sondeo parado mientras piensa.

`clnkEqUnirPreguntar(id)` es el otro camino de A3 —el mismo ecógrafo al que además le cambiaron el
AET—. La lista va en un **desplegable** y no en los botones del cartel, y es una medición: el
cartel tiene **cinco** ranuras (`CLNK_AV_BOTONES`), así que con cinco equipos no habría dónde poner
«Cancelar». El `select` va **sin `id`** y se lee **antes** de resolver la promesa, porque
`clnkAvisoPreguntar` repone el cuerpo del modal al terminar.

---

## 6 · El cartel que no salía (A4)

**La hipótesis del médico quedó desmentida.** No es que el cartel «sólo se dispare cuando el número
de imágenes aumenta mientras EcoSmart mira». La causa, medida en `scripts/_probe_eq0.mjs`:

```
if ((Number(d.equipos_esperando) || 0) > 0) { clnkAvisarEquipoNuevo(); return; }
```

Ese `return` era **incondicional**, y `clnkAvisarEquipoNuevo` **no vuelve por el mismo equipo en la
misma sesión**. Con eso, **un solo equipo pendiente ya avisado** —el segundo «Vinno» del duplicado,
o uno que el médico dejó en «Más tarde»— dejaba al sondeo sin llegar **nunca** a
`clnkRevisarImagenes`. El único camino que seguía funcionando era «Ver lo que espera», que llama
**forzado**: es exactamente lo que el médico vio.

Hoy se espera el resultado y **sólo se vuelve si de verdad abrió la pregunta**. «Equipo nuevo
primero» sigue valiendo. ⚠️ **Sin el `await`, la promesa devuelve un objeto —que es verdadero— y
el `return` seguiría pasando siempre.**

---

## 7 · El segundo cartel cuenta las nuevas (A5)

`_clnkNuevas(g)` pone `g.nNuevas` y `g.tiposNuevas`, y se llama **antes de marcar** en los **dos**
caminos de `clnkRevisarImagenes` —`_clnkAvisadas` se llena justo después, así que contar después
daría cero siempre—. `_clnkAvisoTexto` usa las nuevas **sólo** cuando hay alguna y no son todas:
con el camino forzado se ignora lo avisado a propósito y ahí el número que corresponde es el del
envío entero.

⚠️ **El cartel sigue ofreciendo el grupo entero**, a propósito: una imagen que el médico dejó en
«Más tarde» no se puede perder porque después llegó otra. Lo que evita que algo entre dos veces es
la **deduplicación por archivo** de la PARTE 1 —nombre + hash del contenido, persistido en
`_srcKey`—, no recortar lo que se ofrece.

---

## 8 · El panel que no se redibuja (B1)

**Medido antes de tocar nada**: un turno de sondeo producía **40 mutaciones del DOM** de la tarjeta
**con el mismo contenido**; el campo del apodo se destruía y volvía a nacer (`mismoNodo:false`), lo
tecleado se perdía, el foco se perdía, los plegables se cerraban, y los campos de Ajustes se
sobreescribían con el valor del puente —tecleando `MI_NOMBRE` quedaba `PUENTE`—. **La «pestañada»
y «no se puede escribir el apodo» son el mismo defecto.**

**La cadencia NO se tocó**, por orden expresa. Tres reglas, en este orden:

| regla | pieza | qué hace |
|---|---|---|
| 1 | `_clnkEscribiendo()` · `_clnkFocoEn(cont)` | con el foco adentro, el repintado se **posterga** |
| 2 | `_clnkEqFirma` · `_clnkConexFirma` · `_clnkEstFirma` · `_clnkLuzFirma` | con la misma respuesta, **no se escribe un solo nodo** |
| 3 | `_clnkEstadoPanel` · `_clnkReponerPanel` · `_clnkApodoBorr` | si cambió de verdad, se repinta **conservando** lo abierto, el borrador y el foco con su cursor |

- La firma de equipos incluye **las direcciones de esta computadora**: de ellas sale el rótulo de
  cada línea, y sin ellas el primer pintado de la sesión —que llega antes que `/v1/conexion`— se
  quedaría sin rótulos para siempre.
- **La regla 2 sola no alcanza**: al guardar un apodo la firma **cambia**, y es justo ahí donde el
  plegable se cerraba en la cara del médico.
- Los plegables se guardan por **`data-clnk-det`** y no por posición: la lista se reordena cuando
  el puente agrega un equipo, y un plegable repuesto por índice se abriría en el equipo de al lado.
- `_clnkDisp(el, v)` y `_clnkTxt(el, v)` comparan antes de escribir: **escribir un estilo que ya
  dice lo mismo también es una mutación**, y eso era lo que quedaba después de guardar las tres
  secciones por firma (40 → 2 → **0**).
- `clnkLeerAjustes` usa `_clnkAjPoner`, que no escribe un campo **enfocado** ni uno que el médico
  **cambió y no guardó**; con el campo intacto **sí** lo pone al día, y **abrir el panel** vuelve a
  lo guardado (`_clnkAjUlt` se vacía en `clnkOnMostrar`).
- `clnkLeerEstado(porMedico)`: el flash de «Preguntando…» queda para los **seis** gestos del
  médico —el interruptor, vincular, desvincular, abrir el panel, «Actualizar» y decidir sobre un
  equipo— y no para la lectura de fondo.

⚠️ **La trampa que pagó esta medición**: con la sección «Equipos» cerrada, el campo está dentro de
un `<details>` cerrado y **`focus()` no hace nada** —`activeElement` se queda en `BODY`—, así que la
primera corrida midió «el foco se pierde» sobre un campo que nadie había enfocado.

---

## 9 · El borrado de a varios (C1, C2 y C3)

| pieza | qué hace |
|---|---|
| `borrConfirmar(titulo, parrafos, rotuloSi)` | **el cartel propio**, que se crea y se destruye. Devuelve una promesa |
| `clnkbBorrarVarias(id, items, esperados)` | borra varias de un envío **en UNA transacción** |
| `_clnkbElegir` · `_clnkbSel` · `_clnkbClave` | el modo elegir de la bandeja, **uno para las dos pantallas** |
| `clnkbElegirModo` · `clnkbSelTodas` · `clnkbSelCuenta` · `clnkbBorrarElegidas` | el gesto completo |
| `_clnkbBarra(lis)` | la barra del modo, la **misma** en las dos pantallas |
| `igBorrarVariosAbrir` · `igBorrarVariosConfirmar` · `igBorrarVariosEjecutar` | los estudios |

**`clnkbBorrarVarias` borra de mayor a menor índice**, dentro de cada campo: así ningún `splice`
mueve a los que todavía no se borraron. Llamar N veces a `clnkbBorrarUna` **no sirve** para borrar
N: cada llamada abre su propia transacción y cada `splice` corre los índices, así que la segunda
borra **otro** archivo — es el mismo defecto que la PARTE 1 cerró en `CeiboImg.quitar`.
**Y exige los largos esperados**: si el envío cambió desde que se pintó, **no borra nada y lo
dice**.

**El cartel es propio y no un `confirm`**, y es la regla que P8-b3 dejó escrita: ningún camino que
un caso recorra abre un diálogo nativo. El oyente de Escape se retira **siempre**, en los dos
caminos de cierre —la otra mitad de esa misma lección—.

### Los cinco riesgos de borrar varios estudios, y cómo se tratan

1. **Un estudio vive en cuatro almacenes** —`CeiboStore` (lista local y chunks), `CeiboImg`,
   `CeiboCine` y `CeiboVideo`— y los tres últimos **no se borran por estudio**: los barre
   `imgRecolectarHuerfanas` comparando contra los **vivos**. Por eso los estudios salen **todos**
   de la lista primero y el recolector corre **una** vez al final.
2. **El recolector se abstiene** si el almacén no es IndexedDB o si algún estudio vivo no tiene
   uuid válido: ahí las imágenes de lo borrado quedan huérfanas ocupando lugar. Es la conducta que
   ya existía y que `limpiarTodosInformes` comparte. **Se declara, no se tapa.**
3. **«Todos» es ambiguo** en una pantalla con filtros. Se resuelve **diciéndolo**: la lista que se
   ofrece es `igListaEnPantalla()` —el mismo dueño que usa el exportador— y el modal lo escribe.
4. **El estudio abierto** puede estar entre los elegidos. La confirmación lo dice **con su
   nombre**; no se bloquea, porque borrar el estudio que uno tiene abierto es un gesto legítimo.
5. **No se puede deshacer**, y las imágenes sólo están en un respaldo si se exportó con el nivel
   que las incluye. La confirmación lo repite.

**Las casillas van sin `id`** —en la bandeja y en el modal de estudios—: el censo del estudio, el
Excel y los barridos de «Nuevo estudio» recorren los controles **con** `id`, así que una casilla con
id entraría a las 457 columnas **por existir**. Se alcanzan por `data-clnkb-elegir` y
`data-ig-borr`, y las dos etiquetas llevan **44 px** de alto, que es el piso táctil de esta casa.

---

## 10 · Cobertura

| caso | qué fija |
|---|---|
| **TC-985** | A1: un renglón por equipo, los siete rótulos de conexión, el contador por equipos, que agrupar no autoriza nada, separar y unir, y el control negativo de una sola dirección |
| **TC-986** | A2: la pregunta, sus tres respuestas, el «No» que separa dejándolo en cuarentena, el «Sí» que autoriza por la ruta del puente, y que el apodo no agrupa |
| **TC-987** | A4: con un pendiente ya avisado y dos imágenes esperando, el cartel **sí** sale; y cuando la pregunta se abre, el turno termina ahí |
| **TC-988** | A5: «1 imagen más» con el total aparte, los tipos de las nuevas, y el forzado que dice el total |
| **TC-989** | B1: cero mutaciones por turno, el apodo que sobrevive a cuatro turnos con el foco, el repintado que conserva el borrador, y los campos de Ajustes |
| **TC-990** | C1: el modo elegir, los índices que no se corren (queda **MARCA1**), una confirmación propia y cero diálogos nativos |
| **TC-991** | C2: la lista del filtro dicha, los pacientes contados, sólo lo elegido borrado, cancelar que no borra, y el censo idéntico |
| **TC-850 (D)** | **adaptado**: su sección no tiene un campo **con id**, y su único control es la casilla del modo elegir |

Los siete caen **0/7** contra `77196c5` con el mismo archivo de casos: seis por su denominador
declarado y **TC-987 por sus condiciones reales** (`abierto=false`, `grupo=false`, `avisadas=0` con
dos imágenes esperando), que es el defecto del médico reproducido.
