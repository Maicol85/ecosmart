# Mapa — PROMPT 6: la tanda, la burbuja, los formatos del buzón y los datos del ecógrafo

Armado sobre el sello **`v20261120-0019`** (md5 `0a1b2c03`). **Sin números de línea a propósito:**
la línea cambia en cada edición, el nombre de la función no.

Lo que esta tanda tocó son **nueve bloques** (A a K, con el J repartido) sobre el módulo de
CeiboLink, que vive entero en un solo bloque de JS de `index.html`. El panel y la capa de
comunicación están en `docs/mapa/ceibolink-panel.md`; el aviso y la bandeja en
`docs/mapa/ec2-aviso-bandeja.md`; el destino único en `docs/mapa/ec3-destino-unico.md`; el
veredicto por archivo en `docs/mapa/ec4-confirmar-pesados.md`; la vista previa y la galería en
`docs/mapa/ec5-previa-galeria.md`.

---

## 1 · El cartel que sale con la primera imagen (bloque A)

| Qué | Quién |
|---|---|
| los cuatro campos de la tanda, leídos | **`clnkTandaDe(d)`** — devuelve `null` si el puente no los manda |
| el dibujo de las imágenes viajando | **`clnkTandaDibujo(id, ancho)`** — SVG por `createElementNS` |
| el cuerpo del cartel: dibujo, contador y estado | **`clnkTandaCuerpo(cu, n, cerrada)`** |
| abrir o actualizar el cartel | **`clnkTandaCartel(t)`** |
| la forma final, al cerrar la tanda | **`clnkTandaCerrar()`** |
| apagar y prender los destinos | **`_clnkAvisoApagarBotones(apagar)`** |
| los rótulos de los destinos, sin ids todavía | **`CLNK_TANDA_BOTONES`** |
| cada cuánto se sondea con una tanda abierta | **`CLNK_SONDEO_TANDA_MS`** = 4000 |
| el período vigente, en un solo lugar | **`clnkSondeoMs()`** |
| la tanda que el cartel muestra | **`_clnkTanda`** |
| «lo cerré con la ✕» | **`_clnkTandaCerradaPorMedico`** |

**Donde se decide todo:** el bloque de la tanda dentro de **`_clnkSondear`**, antes de
`clnkRevisarImagenes`.

### Las tres decisiones, con su motivo

1. **Durante la tanda abierta sólo se usa `GET /v1/estado`**, que no lleva token y pesa ~150
   bytes. Por eso el cartel abierto dice **cuántos** y no **de quién**: esa ruta a propósito no
   dice el equipo (§3.1). Con un sondeo cada cuatro segundos pidiendo la lista con token, el panel
   bajaría el inventario del conector quince veces por minuto.
2. **Dice «archivos» y no «imágenes»**, apartándose de la frase de ejemplo del contrato.
   `tanda_imagenes` cuenta TODO lo que entró, y por el buzón entran informes: «están llegando 4
   imágenes» sobre un PDF y un TXT es el defecto que el médico reportó. Al cerrar, el bloque C
   cuenta por tipo.
3. **El plazo lo da el puente.** §P8 lo prohíbe duplicar y `tanda_cierra` ya viene calculado.
   `CLNK_VENTANA_MS` se conserva **sólo** como camino viejo (bloque J).

### Dos trampas que esta tanda pagó

- **`clnkSondeoSync` tenía que seguir siendo idempotente** con cinco enganches. El cambio de
  cadencia es lo ÚNICO que tira un temporizador vivo, y para eso hace falta `_clnkSondeoMsPuesto`:
  `setInterval` no publica su período.
- **La quietud del dibujo se declara en `data-clnk-quieto`** y no se infiere del estilo: leer
  `style.animation` no la distingue, porque la forma corta borra el `animation-delay` que el
  dibujo puso.

---

## 2 · La burbuja (bloque B)

| Qué | Quién |
|---|---|
| el nodo, creado una vez | **`clnkBurbujaNodo()`** · id `clnk-burbuja` |
| mostrar o actualizar | **`clnkBurbuja(n, cerrada)`** |
| esconder y devolver el alto | **`clnkBurbujaOcultar()`** |
| el clic: abre el cartel grande | **`clnkBurbujaAbrir()`** |
| reservar su alto en el cuerpo | **`_clnkBurReservar(b)`** · `_clnkBurPadPrev` |
| lo que la burbuja muestra | **`_clnkBur`** |
| el latido | CSS `@keyframes clnk-late` · clase `.clnk-late` |

**El rincón de abajo a la derecha está medido:** a 1280×900 no hay un solo elemento fijo ni
pegajoso ahí —el encabezado es pegajoso arriba, la barra lateral a la izquierda y el **toast abajo
al centro en la capa 999**— y cero botones visibles tienen su centro en el rincón de 170×170.

### Por qué reserva su alto, y no es prolijidad

A 1000 px la burbuja **tapaba tres botones** del selector de estilo del informe, medido con
`elementFromPoint` sobre el centro de cada botón visible. Un elemento fijo encima del contenido
tapa lo que le toque: lo que lo cierra no es moverla, es que el documento pueda desplazarse lo
suficiente para que nada quede debajo. El alto se **mide** y no se escribe: la burbuja crece con el
texto y con el tamaño de letra del sistema.

### La capa es 690 y no se le mueve la capa a nadie

Por debajo de los modales (**700**), así que una pregunta abierta la cubre; y por debajo del toast
(**999**), así que la burbuja no puede tapar un aviso.

### El defecto que la sonda destapó y la lectura no

**El cartel volvía solo** en el turno siguiente al cierre de la tanda: el turno caía en
`clnkRevisarImagenes`, que no sabe nada de la burbuja. «No se reabre sola» duraba UN turno. Lo
cierra la guarda `if (_clnkBur) return;` antes del aviso de siempre, y se mide con **tres** turnos
más de sondeo, no uno.

---

## 3 · El texto del cartel (bloque C)

| Qué | Quién |
|---|---|
| la clase de una imagen, dueño único | **`_clnkClase(i)`** — `informe` · `noVer` · `loop` · `fija` |
| las cuatro cuentas de un grupo | **`_clnkTipos(g)`** → `nFijas`, `nLoops`, `nInformes`, `nNoVer` |
| la frase de la cuenta | **`dstCuenta(n, nFijas, nLoops, nInformes, nNoVer)`** |
| el texto del aviso | **`_clnkAvisoTexto(g, nom, cuando)`** |
| cómo se nombra un equipo | **`clnkNombreEqDe(e)`** |
| el caché de nombres | **`_clnkNombreEq`** · **`_clnkCargarNombresEq()`** |

### El orden de las cuatro clases no es arbitrario

1. `tipo === 'informe'` manda sobre todo: un PDF tampoco se ve, pero «1 informe» dice MÁS.
2. `se_puede_ver === false` manda sobre el tipo: un TIF llega con `tipo: 'imagen'` y ningún
   navegador de los que el médico usa lo dibuja. Contarlo como imagen le promete que lo va a poder
   mirar.
3. `tipo === 'video'` es un cineloop.
4. Lo que queda es una imagen.

⚠️ **Se compara contra `false` y no con un `!`:** contra un puente 1.1 el campo no viene y
`!undefined` es verdadero — todas las imágenes de un DICOM se contarían como «no se pueden ver».

### La cuarentena se cuenta sobre TODAS las tandas

Y eso salió de medir el contrato: la cuarentena es **por equipo** y un lote es por equipo, así que
`en_cuarentena` de la tanda de un grupo **visible** es siempre cero. Contándolo por lote, la frase
de §P8 quedaba **inalcanzable**. Lo que §P8 describe son las tandas de **otro** equipo, el que
espera decisión, y por eso `imagenes` no las trae.

### Se agrupa por el `lote` del puente

**`clnkAgrupar(lista, tandas)`** agrupa por `lote` cuando todas las imágenes lo traen, y se cae a
la ventana propia (`CLNK_VENTANA_MS`) cuando no — que es el bloque J. §P8 lo prohíbe duplicar con
todas las letras.

---

## 4 · Las imágenes repetidas (bloque D)

| Qué | Quién |
|---|---|
| los ids ya avisados | **`_clnkAvisadas`** |
| los ids que el médico descartó | **`_clnkDescartadas`** |
| cuántas del grupo son repetidas | **`_clnkRepetidas(g)`** → `g.nRepetidas` |
| el olvido, al descartar | dentro de **`clnkDescartar`**, en la rama del borrado exitoso |
| la tarjeta al día | **`clnkRefrescar()`** llamado desde **`_clnkSondear`** |

### La causa son DOS cosas independientes

1. **`_clnkAvisadas` no se vaciaba al descartar.** El puente deriva el `id` del **contenido** del
   archivo, así que el mismo archivo re-enviado vuelve con el mismo id, y para
   `clnkRevisarImagenes` eso es indistinguible de «ya se avisó».
2. **El sondeo nunca refrescaba la tarjeta.** Con el panel a la vista y la lista vacía decía «sin
   imágenes esperando»; entraban OCHO y se sondeaba, y seguía diciendo lo mismo.

⚠️ **No alcanza con vaciar la lista entera**, y por eso hay **dos** listas: sin `_clnkAvisadas`, un
aviso que el médico cerró con la ✕ vuelve cada quince segundos. Se olvidan **sólo** los ids que se
destruyeron, y **sólo** si el puente los borró de verdad — un 503 deja la imagen allá.

### ⚠️ ABIERTO · el `clnkRefrescar()` del sondeo manda cuatro pedidos con la pestaña oculta

**TC-845 (D) está rojo por esto y NO se arregló**: la ficha entera, con la causa medida y el
arreglo de una línea, está en `docs/PENDIENTES.md` → **P6-j**. En corto: ese `clnkRefrescar()` arma
un rebote de **400 ms** en **cada** turno del sondeo, y cuando dispara su guarda
`clnkPanelALaVista()` sigue diciendo que sí —mide la **caja del nodo**, y esconder la pestaña del
navegador no le quita la caja—, así que la cadena de `clnkLeerEstado` sale igual. La compuerta del
sondeo **funciona** y el temporizador queda apagado: es **una** ronda de cuatro pedidos a loopback,
una sola vez. **Antes de tocarlo, leer P6-j**: `clnkPanelALaVista` la leen seis sumideros y no se
toca, y `clnkSondeoDebe()` no sirve de reemplazo porque pide además el token.

---

## 5 · Los formatos del buzón (bloques E y F)

| Qué | Quién |
|---|---|
| la tabla de los doce formatos | **`CLNK_FMT`** |
| la ficha de una fila | **`clnkFmtDe(i)`** → `{sigla, icono, ver, mime, ext}` |
| la lista de los aceptados, derivada | **`clnkFmtAceptados()`** |
| la miniatura, ruteada | **`_clnkPrevMini(buf, nombre, fmt)`** |
| el visor, ruteado | **`clnkPrevAbrir(id, nombre, fila)`** |
| el reproductor, reusable | **`videoVerBlob(blob, conCaptura)`** |
| el archivo que baja, con su nombre y su MIME | **`_clnkArchivo(buf, nombre, mime)`** · **`clnkItems(ids, filas)`** |
| la tarjeta de los que no se ven | **`clnkNoVerTarjeta(cu, filas, todos)`** |
| sólo Descartar | dentro de **`dstPreguntar`**, con `_soloNoVer` |
| agregar un video a un estudio guardado | **`CeiboVideo.agregar(uuid, vids)`** |

### Las cuatro salidas de `ver`

`dicom` → el visor de siempre · `imagen` → el lightbox · `video` → `videoVerBlob` sin captura ·
`no` → **no se baja y no se abre**.

⚠️ **`se_puede_ver` del puente manda sobre la tabla:** la tabla da la sigla, el icono y la
extensión; el campo decide la interfaz (§P2). ⚠️ **Sin campo `formato` es un DICOM** — bloque J.
⚠️ **Un cineloop DICOM conserva su 🎬**: dentro del DICOM lo que distingue una fija de un cineloop
es `tipo`; para el buzón manda el formato, que es más preciso.

### `conCaptura` no es prolijidad

«Capturar frame» **reserva un slot** y escribe una imagen en el estudio abierto. Desde la vista
previa eso rompería la invariante que ECO-CONECTOR-5 fijó: **mirar no es decidir**.

### Lo que `dstLeer` ya hacía

Clasifica por los **bytes** con `_firmaArchivo`, así que un JPG ya entraba como imagen y un MP4
como video. **Lo roto era mirar, no adjuntar.**

### `CeiboVideo` sólo tenía `guardar`

Y `guardar` **reemplaza** todos los videos del estudio: adjuntar un MP4 a un estudio **guardado**
con esa función le borraría los suyos, porque ese estudio no está en pantalla y `imgSlots` no los
tiene. `agregar` vive **adentro** de la tienda, por el mismo motivo que `CeiboImg.agregar`.

⚠️ **`videoDur` no se pasa**, y es medido: ese campo no está en la allowlist de `agregar` ni de
`guardar`, así que es de sesión y se cae al persistir **también** por el camino del estudio
abierto.

---

## 6 · Los datos del ecógrafo (bloque G)

| Qué | Quién |
|---|---|
| el rótulo de una dirección | **`clnkDirRotulo(x)`** — `cable` · `Wi-Fi` · **nada** |
| el orden | **`clnkDirsOrden(dirs)`** — partición **estable**, las 169.254 al final |
| el estado apagado de un dato | **`_clnkDato(cont, rotulo, valor, nota, apagada)`** |
| el panel de la carpeta compartida | **`clnkCarpetaPanel(cont, cp)`** |

⚠️ **«desconocido» NUNCA se escribe:** es un valor que el puente usa para decir «no lo sé», no una
etiqueta para el médico.

⚠️ **`enlace` tiene TRES estados y sólo uno apaga.** `false` apaga; `null` —«no se pudo
averiguar»— se muestra **normal**, porque un dato que falta no es un «no». Apagada pero legible y
**copiable**: una dirección sin enlace puede ser la buena con el cable todavía sin enchufar.

⚠️ **El rótulo NO elige.** §P7: «saber que una interfaz es cable no dice que ESE cable vaya al
ecógrafo». `probable` sigue siendo del puente.

⚠️ **La contraseña es una frase y no un campo**, y no se agrega uno «por comodidad»: medido, CERO
`input`, `select` y `textarea` en el panel. Y con `carpeta_compartida` en `null` el panel **entero**
no se dibuja: «no hay carpeta» y «hay una y está vacía» son dos cosas distintas.

---

## 7 · El espacio (bloque H) y los nombres (bloque I)

| Qué | Quién |
|---|---|
| el aviso de espacio | **`clnkEspacio(usados, tope, aviso)`** |
| de dónde vino un equipo | **`clnkEqProcedencia(eq)`** — `copiado a mano` · `por red` · nada |
| la fila del equipo | **`_clnkFilaEquipo(cont, eq)`** |
| el cartel de equipo nuevo | **`clnkAvisarEquipoNuevo()`** |

`bytes_tope` **dejó de ser 2147483648** en la 1.4.0: se deriva del disco. El umbral del ámbar es
`bytes_aviso`, con **dos guardas** —tiene que ser un número y estar **adentro** del tope: uno mayor
no avisaría nunca, uno en cero avisaría siempre con el conector vacío—. El 85 % propio queda como
**respaldo** y el rojo no se movió.

⚠️ **La procedencia se lee del prefijo del `aet` y no de `nombre_para_mostrar`:** el AET es la
**identidad** y viaja igual en las dos versiones del contrato. Y esa diferencia no se puede omitir
(§P5): en el buzón escribe la cuenta del médico y nadie más; en la carpeta de entrada escribe
**cualquiera que tenga las credenciales del recurso compartido, desde cualquier máquina de la red**.

---

## 8 · La compatibilidad (bloque J)

| Qué | Quién | Sin el campo |
|---|---|---|
| la tanda | `clnkTandaDe` | `null` → no hay cartel inmediato ni burbuja |
| el agrupado | `clnkAgrupar` | la ventana propia `CLNK_VENTANA_MS` |
| cuándo avisar | **`clnkGrupoListo(g)`** | sin `lote_cierra`, **listo**: la regla de antes de la 1.3 |
| la clase | `_clnkClase` | un DICOM es `fija` o `loop` |
| el nombre | `clnkNombreEqDe` | el prefijo del AET, traducido acá |
| el formato | `clnkFmtDe` | `dicom` |
| el rótulo | `clnkDirRotulo` | cadena vacía |
| el espacio | `clnkEspacio` | el 85 % propio |
| la procedencia | `clnkEqProcedencia` | el prefijo del AET (viaja siempre) |

**`clnkGrupoListo` toma el `lote_cierra` MÁS NUEVO del grupo**, porque el cierre **se corre**
cuando entra otra imagen al mismo lote: tomar el primero avisaría mientras el lote todavía crece.

⚠️ **Contra un puente 1.4 el filtro no cambia nada**, y es medible: a ese punto se llega con la
tanda ya cerrada —el bloque A devuelve antes mientras está abierta— así que `lote_cierra` ya pasó.
Y el camino forzado —«Ver lo que espera» y el cierre de la tanda— lo saltea.

---

## 9 · El conector falso, llevado a 1.4

`scripts/_conector_falso.mjs`, con una **compuerta por versión**: cada campo detrás de la versión
que lo trajo, así que **una sola sonda mide también el bloque J**.

| Qué | Dónde |
|---|---|
| la compuerta | **`menor(S)`**, **`es14(S)`**, **`es13(S)`** |
| el lote y la tanda, derivados | **`derivarLotes(S)`** · **`VENTANA_LOTE_MS`** |
| `nombre_para_mostrar` | **`nombreParaMostrar(aet)`** |
| los bytes de cada formato del buzón | **`BUZON_BYTES`** · **`BUZON_TIPO`** · **`BUZON_VE`** · **`buz(...)`** |
| un MP4 **real** de 1.491 bytes | **`MP4_MINI_B64`** |
| el `Content-Type` por formato | **`TIPO_MIME`** |
| los equipos de carpeta | `equiposDe(4)` y `equiposDe(5)` |

**Escenas nuevas:** `buzonMixto`, `buzonVisibles`, `buzonNoVisibles`, `buzonUnaFoto`,
`buzonUnVideo`, `buzonUnTif`, `porRed`, `tandaUna`, `tandaDos`, `tandaTres`, `tandaCerrada`,
`tandaCuarentena`, `tandaBuzon`, `unaSuelta3`, `recienLlegada`, `loteCerrado`.

⚠️ **Su `t0` pasó de tres a cinco minutos.** Desde que el falso publica la tanda, `abierta` se
deriva de la última llegada más dos minutos: con t0 a tres minutos, las escenas cuyo último
desplazamiento llega a 100 s quedaban con la tanda **abierta**, y una tanda abierta deja los
botones del cartel apagados — o sea que las escenas de antes del prompt 6 cambiaban de
comportamiento.

⚠️ **Una cabecera `ftyp` de 32 bytes no es un video.** `_firmaArchivo` la reconocía —lo único que
mide son cuatro bytes— así que la clasificación, el ruteo y la tira pasaban; pero `_videoPoster` no
saca un cuadro de algo sin un solo fotograma. El MP4 de verdad es un color plano de 32×32 por dos
décimas, H.264, generado **una vez** con ffmpeg y embutido como texto, igual que `JPEG_1x1`. **Sin
un dato de nadie: es un color.**

⚠️ **`sincronizar` corrige además un escenario que el puente de verdad no produce:** contaba como
pendiente una imagen de un equipo **pendiente**, que no sale en la lista — el estado decía «hay 2»
y `/v1/imagenes` devolvía cero.

---

## 10 · Las pruebas

| Caso | Bloque |
|---|---|
| **TC-961** | A — el cartel con la primera imagen, el contador, los botones apagados, la cadencia |
| **TC-962** | B — la burbuja, el latido, que no se reabre sola, que no tapa un botón |
| **TC-963** | C — las cuatro clases, el nombre en criollo, la cuarentena, `textContent` |
| **TC-964** | D — las repetidas, el borrado que falla, la tarjeta al día |
| **TC-965** | E — el ruteo por formato, el espía de `_dcmImgLeer`, los tres destinos |
| **TC-966** | F — la tarjeta y sólo Descartar, con sus dos controles negativos |
| **TC-967** | G — las direcciones, el rótulo, el enlace, el orden, la carpeta y la frase |
| **TC-968** | H — `bytes_aviso`, las dos guardas, el respaldo del 85 % |
| **TC-969** | I — los nombres y la procedencia, en la fila y en el cartel |
| **TC-970** | J — la regla vieja del lote y el censo de las nueve piezas |

**Sondas:** `_probe_p6base.mjs` (la línea base del bloque 0), `_probe_p6a.mjs`, `_probe_p6b0.mjs`
(el rincón de la pantalla), `_probe_p6b.mjs` y **`_probe_p6dos.mjs`** (los 32 cruces de dos
motores, dos temas, cuatro anchos y movimiento reducido). Cada una con su cuerpo en un archivo
aparte, que es la lección de MEDIR-4b.

**El corredor de lotes:** `scripts/_lotes_p6.sh`. **La guía manual:**
`docs/GUIA_PRUEBA_P6.md`, catorce pasos.

**El insertador de casos:** el cuerpo de cada caso se escribió en su propio archivo y se insertó
con un script que **le quita los acentos graves una vez, con su guardia**. Es la lección de
MEDIR-4b aplicada a los casos: un acento grave en un comentario mío cierra el template del runner,
y esta casa lo pagó treinta y una tandas seguidas — en ésta, veintidós veces.
