# Mapa — PROMPT 7: la burbuja del cartel terminado, el silencio, los botones y «Sin estudio»

Armado sobre el sello **`v20261121-0308`** (md5 `cf41995d`). **Sin números de línea a propósito:**
la línea cambia en cada edición, el nombre de la función no.

Este mapa cubre las **nueve tareas** del prompt 7 (A a I) sobre el módulo de CeiboLink y la bandeja.
Lo del prompt 6 —la tanda, la burbuja original, los formatos del buzón y los datos del ecógrafo—
está en `docs/mapa/p6-tanda-burbuja-formatos.md`; el aviso y la bandeja en
`docs/mapa/ec2-aviso-bandeja.md`; el destino único en `docs/mapa/ec3-destino-unico.md`; el veredicto
por archivo en `docs/mapa/ec4-confirmar-pesados.md`; la vista previa y la galería en
`docs/mapa/ec5-previa-galeria.md`; el panel en `docs/mapa/ceibolink-panel.md`.

---

## 1 · La burbuja tras cerrar un cartel **terminado** (tarea A)

| Qué | Quién |
|---|---|
| el cierre, con el gesto del médico distinguido | **`clnkAvisoCerrar(porMedico)`** |
| los tres caminos que pasan `true` | la ✕ (`clnkav-x`), el clic en el fondo de `clnkav-ov`, Escape |
| «hay una pregunta anidada esperando» | **`_clnkPregAbierta`** — la pone y la suelta `clnkAvisoPreguntar` |
| decidir suelta el envío | **`_decidio()`** dentro de **`dstPreguntar`**, en los CUATRO destinos |
| la burbuja en su forma final | **`clnkBurbuja(n, true)`** |

### Por qué no salía

`clnkTandaCerrar` pone **`_clnkTanda = null`**, así que la rama que levantaba la burbuja —la que
mira `_clnkTanda`— no entraba con la tanda ya cerrada: el cartel desaparecía entero.

### Las DOS guardas contra los «dos carteles contradictorios», las dos medidas

1. **Sólo el gesto del médico la levanta.** `dstResumen` cierra con «Entendido» **después** de
   adjuntar y `_clnkAvisoGrupo` seguía puesto ahí —se pone en `clnkRevisarImagenes` y nadie lo
   soltaba—, así que una burbuja levantada en cualquier cierre diría «Llegaron N archivos — tocá
   para elegir» sobre archivos que el médico acaba de adjuntar.
2. **Decidir suelta el grupo.** Los cuatro destinos SON la decisión. «Vista previa» **no** lo
   suelta: mirar no es decidir, y «Volver a la pregunta» tiene que encontrar el mismo envío. De
   paso cierra una puerta que ya estaba abierta: con el grupo puesto y el modal de progreso en
   pantalla, `clnkRevisarImagenes` entraba por su rama de ACTUALIZAR y le reescribía el título al
   progreso.
3. **`_clnkPregAbierta`** la apaga mientras hay una pregunta anidada: ahí `_clnkAvisoReponer` vuelve
   a abrir el modal dos líneas después y quedarían la burbuja **y** el cartel.

⚠️ **El número sale de los `ids` del grupo y no de `tanda_imagenes`:** el conteo del estado incluye
la cuarentena, y lo que la burbuja promete al tocarla es lo que el cartel va a ofrecer. Es el mismo
criterio que el bloque B del prompt 6 ya aplica.

⚠️ **La bandera se suelta ANTES de reponer, no después:** `_clnkAvisoReponer` puede dejar el modal
cerrado —cuando no estaba abierto al preguntar— y una bandera que sobreviviera dejaría a la burbuja
apagada para todo el resto de la sesión.

---

## 2 · El sondeo ocioso (tarea B)

| Qué | Quién |
|---|---|
| la cadencia ociosa | **`CLNK_SONDEO_MS`** = **4000** (era 15000) |
| la cadencia con la tanda abierta | **`CLNK_SONDEO_TANDA_MS`** = 4000, **sin tocar** |
| el dueño único del período | **`clnkSondeoMs()`** |
| las tres condiciones | **`clnkSondeoDebe()`** — activo, vinculado, pestaña a la vista |

**Los dos valores ahora coinciden y la función se queda igual.** Lo que vale de ella no es que los
números sean distintos sino que haya **un solo lugar** donde se decide el período: el de la tanda
está fijado entre 3 y 5 s por el prompt 6 y el ocioso por la tarea B, y el día que uno se mueva el
temporizador y el oyente no pueden discrepar. `_clnkSondeoMsPuesto` sigue haciendo falta por lo
mismo: `setInterval` no publica su período.

### El costo, medido

`GET /v1/estado` no lleva token, su cuerpo pesa **64 bytes** contra el conector falso (~150 en el
contrato) y un turno contra loopback tarda **1,5 ms**.

| cadencia | pedidos/min | KB/min | MB en 8 h | % de un hilo |
|---|---|---|---|---|
| cada 15 s | 4,0 | 0,25 | 0,12 | 0,010 |
| cada 4 s | 15,0 | 0,94 | 0,46 | 0,037 |

⚠️ **El chequeo de `document.hidden` de P6-j sigue en el rebote de `clnkRefrescar`**, y con la
cadencia cuatro veces más rápida importa más que antes. `clnkPanelALaVista` sigue **sin** mirarla
—mide la caja del nodo, y la leen seis sumideros donde la pestaña está a la vista por definición—.

---

## 3 · La ventana de silencio de la app (tarea C)

| Qué | Quién |
|---|---|
| la ventana propia, en una constante | **`CLNK_SILENCIO_MS`** = 20000 |
| cuánto hace que no llega nada | **`clnkSilencioMs(iso)`** → ms o `NaN` |
| el dueño único de la regla | **`clnkSilencioCumplido(iso)`** |
| el pestillo | **`_clnkSilencioLatch`** |
| el veredicto de la app | **`clnkTandaAbierta(t)`** — lo consume `_clnkSondear` en vez de `T.abierta` |
| el otro camino, el del aviso de siempre | **`clnkGrupoListo(g)`**, que lee la misma constante |

### La regla real, y por qué duraba tres minutos

**La decide el puente y son DOS MINUTOS de silencio desde la última llegada**: `tanda_cierra` ya
viene calculado y `tanda_abierta` sale de compararlo con el reloj del puente (§P8; `derivarLotes`
del conector falso lo reproduce con `VENTANA_LOTE_MS`). Los tres minutos que el médico midió son
esos dos **más** el turno de sondeo que tardaba en enterarse —hasta 15 s hasta la tarea B—, sobre un
envío cuya **última** imagen llegó más tarde de lo que parecía.

⚠️ **Ni el sondeo ni la reapertura de la burbuja la reinician, y se midió:** ninguno de los dos toca
`tanda_ultima`, que es de lo único de lo que cuelga el plazo. El sondeo sólo **lee** `/v1/estado` y
la burbuja sólo mueve estado de pantalla.

### Lo que se agrega, y lo que revierte

Esta app **no puede** tocar el plazo del puente, así que lo que se agrega es una regla **propia y
más corta**. **Revierte, por orden expresa del médico, la regla del prompt 6** que decía «el plazo
lo da el puente y no se duplica». **Lo que no cambia:** el puente sigue guardando los archivos su
plazo entero, y `CLNK_VENTANA_MS` sigue siendo el camino viejo del bloque J. Lo único que se
adelanta es **cuándo el médico puede decidir**. Declarado en `docs/PENDIENTES.md` → **P7-a**.

### Un dueño, dos lectores — y por qué hacen falta los dos

Sin la línea en `clnkGrupoListo`, las dos mitades discrepan y se nota: la app declara cerrada la
tanda a los veinte segundos y arma su cartel por `clnkRevisarImagenes(true)`, pero el turno
siguiente —y cualquier archivo que entre después— cae en el camino **no forzado**, donde ese filtro
seguiría esperando los dos minutos del puente.

### El pestillo

Una vez que la app declaró cerrada una tanda **no la vuelve a abrir**: eso impide el ida y vuelta
entre «Están llegando» y «Llegaron» sobre el mismo envío. Lo que entra después **engorda** el cartel
que ya está en pantalla —la rama de ACTUALIZAR de `clnkRevisarImagenes`, que retitula «Llegaron más
imágenes del ecógrafo»—, así que no se pierde nada. **Se suelta cuando el puente dice que la tanda
cerró**, que es su propia noción de «este envío terminó».

⚠️ **Falla hacia «no cerrar»:** sin `tanda_ultima`, con una fecha que no se entiende o con la tanda
vacía devuelve `false` y manda el puente, que es la conducta de antes de esta tarea.

⚠️ **`clnkTandaAbierta` se llama UNA vez por turno** porque mueve el pestillo: dos llamadas no dan
dos respuestas distintas, pero leerlo dos veces escondería el momento en que cambia.

---

## 4 · Los botones del cartel (tarea D)

| Qué | Quién |
|---|---|
| el aspecto apagado | la clase **`clnk-av-off`** · regla `#clnkav-botones .clnk-av-off` |
| apagar, con su alcance | **`_clnkAvisoApagarBotones(apagar, soloAdjuntar)`** |
| limpiar el estado apagado | **`clnkAvisoAbrir`**, en el bucle de los cinco botones |
| los cinco del cartel abierto | **`CLNK_TANDA_BOTONES`** — ahora `{txt, fn}` y no cadenas |
| el grupo, pedido al tocar | **`_clnkTandaGrupo()`** |
| los dos vivos | **`clnkTandaVistaPrevia()`** · **`clnkTandaDescartar()`** |
| «lo que hay en pantalla es el cartel de la tanda» | **`_clnkTandaEnPantalla`** |

### El defecto, y por qué una clase y no un estilo en línea

El estilo en línea que `_clnkAvisoApagarBotones` ponía **no lo borraba `clnkAvisoAbrir`**, que es la
única puerta por la que el modal cambia de contenido. El cartel siguiente nacía con
`disabled = false` y la opacidad `.55` todavía puesta: **habilitado y pálido**. Los dos caminos que
lo producen, los dos **sin** pasar por `_clnkAvisoApagarBotones(false)`:

- **`clnkBurbujaAbrir`** → `clnkRevisarImagenes(true)` → `dstPreguntar` → `clnkAvisoAbrir`. Es el
  camino que el médico usó.
- la **rama de ACTUALIZAR** de `clnkRevisarImagenes` → `_clnkAvisoArmarAcciones` → `clnkAvisoAbrir`.

Con una clase, la apertura la saca de los cinco en un solo lugar y el estado no puede sobrevivir a
la pregunta siguiente **por ningún camino**.

### El alcance, y los dos que quedan vivos

Mientras el envío no terminó, **adjuntar** adjuntaría menos de lo que va a llegar —ése es el motivo
del apagado— pero **mirar** y **descartar** no tienen ese problema. Hasta la tarea D se apagaban los
cinco, así que el cartel abierto no ofrecía **nada** que hacer durante todo el envío.

⚠️ **Se apaga con `disabled` de verdad MÁS la clase**: un botón `disabled` no emite click, que es lo
que impide el estado al revés que el médico encontró. El `aria-disabled` lo dice el lector de
pantalla.

### La lista se pide al TOCAR

Los dos vivos necesitan `GET /v1/imagenes`, que lleva token y recorre el almacén del conector:
bajarla en cada turno de cuatro segundos sería pedir el inventario **quince veces por minuto**, que
es justo lo que el bloque A del prompt 6 evitó. La ruta cara se paga **una** vez.

### `_clnkTandaEnPantalla` — por qué hace falta

La vista previa **reemplaza el cuerpo del modal**, y `clnkTandaCuerpo` —que no encuentra ahí su
contador— lo **vacía** y repinta el dibujo encima, borrándole al médico la tira que está mirando. La
bandera la pone `clnkTandaCartel` al dibujar y la saca `clnkAvisoAbrir`; **viaja con el estado del
aviso** (`_clnkAvisoGuardar` / `_clnkAvisoReponer`), así que «Volver a la pregunta» devuelve también
la capacidad de seguir actualizando el contador.

⚠️ **`clnkTandaCerrar` con la vista previa encima no toca nada Y NO PIERDE LA TANDA.** Rearmar el
cartel ahí llamaría a `clnkAvisoAbrir`, que pone el modal en `flex` y lo dibujaría **por encima** del
visor abierto. Se deja `_clnkTanda` puesto a propósito: el turno siguiente vuelve a intentar. Con
`_clnkTanda` en `null` ese cartel se quedaba diciendo «Están llegando» para siempre.

---

## 5 · Los nombres del dato en el ecógrafo (tarea E)

| Qué | Quién |
|---|---|
| la línea chica | el **sexto** argumento de **`_clnkDato(cont, rotulo, valor, nota, apagada, alias)`** |
| su marca en el DOM | `data-clnk-alias` |
| la frase del SCP | un `<p>` al principio de **`clnkLeerConexion`**, una sola vez |

- Puerto DICOM → **Puerto SCP · Puerto · Port**
- Nombre (AET) → **SCP AET · AE Title · AET**
- Dirección → **Dirección SCP · IP del servidor · Server IP**

⚠️ **`alias` va aparte de `nota`** porque la dirección usa las dos a la vez: la nota habla de ESTA
computadora —el rótulo, la conexión, el enlace— y el alias de cómo lo llama el equipo.

⚠️ **Sólo el VINNO está confirmado**, así que el panel **no dice de qué marca** es cada nombre: dice
«puede llamarse» y lista las formas. **TC-975** lo mide buscando once nombres de marca y exigiendo
cero.

El panel sigue **sin un solo campo para escribir** —medido— con sus botones Copiar intactos.

---

## 6 · «Imágenes sin estudio» y el borrado de a una (tarea F)

| Qué | Quién |
|---|---|
| la sección de la pestaña Imágenes | **`clnkbRender()`** · `clnkb-sec` / `clnkb-lista` |
| el bloque de Guardados | **`igBandejaRender()`** · `ig-bandeja` |
| el pintor de miniaturas, **compartido** | **`_igBandMiniaturas(x)`** · **`_igBandMini(...)`** |
| borrar una | **`clnkbBorrarUna(id, clase, k)`** |
| repintar las dos pantallas | **`clnkbRepintarTodo()`** |
| el lightbox de una fija | **`_clnkbVerFija(idEnvio, dataURL, k, total, equipo)`** |

**Por qué estaba atrasada:** ECO-CONECTOR-3 agregó «Asignar» y ECO-CONECTOR-4 las miniaturas
**sólo** al bloque de Guardados. El comentario de `clnkbRender` todavía decía «NO se muestran las
imágenes… una miniatura invita a un gesto que todavía no existe», con las dos mitades de ese
argumento ya caducadas.

**El borrado de a una:** opera sobre el **arreglo del registro** y no sobre una copia
—`Array.isArray(reg.imgs)` de un registro sin el campo devuelve `false` y se sale, en vez de recortar
un arreglo vacío y escribir el registro igual— y **si no queda nada borra el registro**, porque un
envío vacío es una fila que dice «sin archivos» y ofrece asignarla a un estudio.

⚠️ **No toca ningún estudio y no confirma nada a CeiboLink, por construcción**: esta base no tiene
una sola ruta hacia `imgSlots` —decisión 6 de ECO-CONECTOR-2— y los ids del envío ya se confirmaron
al entrar a la bandeja.

⚠️ **El botón vive sólo en el lightbox de una FIJA.** Un cineloop abre `_cineAbrir`, el visor maduro
del estudio, y meterle un modo ahí es el cambio que ECO-CONECTOR-3 decidió no hacer con
`igItemHTML`. La función **sí** sabe borrar un cineloop —`clase: 'loop'`— y TC-976 lo mide.
Declarado en **P7-l**.

---

## 7 · El mensaje de medir (tarea G)

| Qué | Quién |
|---|---|
| el texto, en una constante | **`CLNKB_MEDIR_MSG`** = «Para medir, asignala a un estudio» |
| el renglón a la vista | `data-clnkb-medir-nota`, dentro de `_clnkbVerFija` |
| el botón | `data-clnkb-medir`, **sin `disabled`** |

**«No pasa nada al intentar medir» era literal:** ese lightbox no tenía un botón de medir, así que
no había nada que tocar ni nada que dijera por qué. El cineloop sí se mide porque va a
`_cineAbrir`, que es el visor con el medidor adentro.

⚠️ **El botón va SIN `disabled`**, y es una regla medida de esta casa: uno deshabilitado **no emite
click**, así que el médico tocaría el único control que tiene que **explicarle** por qué está
bloqueado y no pasaría nada — o sea el mismo defecto con otra cara.

**La regla no se toca:** las mediciones viven **dentro** del estudio, y los cines siguen midiéndose
como hasta hoy.

---

## 8 · El arnés (tarea H) y las escenas nuevas

**`test_clinico.mjs` espera a jsPDF, Chart y XLSX ANTES del primer caso**, con tope de doce
segundos, y **publica cuánto tardaron** en el encabezado de la corrida. No se tocó una línea de
`index.html` ni una condición de un caso. Si alguna no llegó, lo **dice** y los casos salen rojos
con su motivo.

**Escenas nuevas del conector falso**, cada una con ids propios —el aviso no vuelve por las mismas
imágenes en la misma sesión y la batería corre en UNA página—:

| escena | para qué |
|---|---|
| `tandaFin` · `tandaFin2` | tarea A — un envío **ya cerrado** y su control de la decisión |
| `silencio` | tarea C — la **única** escena donde el puente dice abierta y la app dice cerrada |
| `silencioMas` | tarea C — un archivo más con el puente todavía abierto |
| `tandaViva` | tarea D — una tanda abierta de verdad, última llegada hace 2 s |

**El insertador de casos:** `scripts/_insertar_p7.py`, que **aborta** si encuentra un acento grave o
una barra invertida en el cuerpo. El cuerpo de cada caso se escribe en **su propio archivo**.

**El corredor de lotes:** `scripts/_lotes_p7.sh`, heredado de `_lotes_p6.sh` sin tocar una guarda.

---

## 9 · Las pruebas

| Caso | Tarea |
|---|---|
| **TC-971** | A — la burbuja del cartel terminado, con sus cuatro controles negativos |
| **TC-972** | B — la cadencia, el dueño único y las tres condiciones del sondeo |
| **TC-973** | C — la ventana de silencio, el pestillo y los dos lectores |
| **TC-974** | D — los cinco botones, el aspecto que no sobrevive y la vista previa |
| **TC-975** | E — los tres alias, la frase del SCP y las once marcas que no aparecen |
| **TC-976** | F — las miniaturas, el borrado de a una y el censo de controles |
| **TC-977** | G — el mensaje, el botón sin `disabled` y el cineloop que sí se mide |

**Adaptados:** TC-961 (cinco condiciones, **dos invertidas**), TC-970 y TC-845 (la cadencia), y
**tres más que destapó la pasada completa**: **TC-850 (G) INVERTIDO** —afirmaba que «Sin estudio»
no tiene miniaturas—, **TC-873 (F)** y **TC-847 (F)**, los dos porque miden llamadas **explícitas**
y el sondeo de cuatro segundos se les metía en la ventana de medición.

⚠️ **Y TC-840 NO ERA UN CASO A ADAPTAR: ERA UNA REGRESIÓN DEL PRODUCTO.** `clnkLeerAjustes` borraba
el mensaje de `cfg-clnk-amsg` y a esa función la llama el rebote del sondeo, así que con la cadencia
de cuatro segundos el mensaje del reinicio del receptor se borraba en cuatro. Arreglado en el
producto: la limpieza vive hoy en los **gestos** del médico —guardar y abrir el panel— y no en la
lectura de fondo. Declarado en `docs/PENDIENTES.md` → **P7-0**.

⚠️ **DOS LECCIONES DE TC-847, LAS DOS CARAS.** (1) **Parar el temporizador no alcanza** para
neutralizar el sondeo en una prueba: un turno ya en vuelo sigue su curso, porque `_clnkSondear` es
`async`. Lo que lo cierra es dejar la escena en `vacio` — sin imágenes esperando no hay nada que
pueda abrir el aviso. (2) **`clnkAvisoCerrar` esconde el modal pero NO vacía el título ni el
párrafo**, así que un caso que lee ese texto después de cerrar informa el del aviso **anterior**: el
diagnóstico señalaba un cartel encima que no estaba, y lo que fallaba era que
`clnkAvisarEquipoNuevo` no vuelve por el mismo equipo en la misma sesión.
