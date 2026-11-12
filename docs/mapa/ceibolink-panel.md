# Mapa — el panel de CeiboLink en Configuración (tanda ECO-CONECTOR-1)

Armado sobre el cierre de la tanda. **Por nombre de función y de constante, no por línea**: la
línea cambia en cada edición, el nombre no.

---

## 0 · Qué es esto, en una línea

CeiboLink es un programa aparte que el médico instala en **su** computadora: el ecógrafo le manda
las imágenes por DICOM y él las entrega a EcoSmart por un canal local. Este panel es lo único que
EcoSmart le muestra al médico: activarlo, ver si está, vincular el navegador una vez, darle al
técnico los datos del ecógrafo, decidir qué equipos entran y ajustar dos cosas.

**Reemplaza al panel de Orthanc, que se retiró entero.** Orthanc sigue existiendo pero vive
**adentro** de CeiboLink: el médico no lo ve, no lo administra y no hay ninguna ruta del canal que
lo exponga. Ver § 7 para el inventario de lo que salió.

**Lo que este paso NO hace, y es a propósito** (es ECO-CONECTOR-2): el aviso de imágenes con sus
tres botones, el sondeo en segundo plano, adjuntar desde Guardados y la regla de estudio sin
paciente. La carga manual de DICOM desde pendrive **no se tocó** y sigue siendo la vía que anda.

---

## 1 · La dirección: una constante, y ningún campo

| pieza | quién es | qué hace |
|---|---|---|
| `CLNK_BASE` | la constante | `127.0.0.1` y el puerto del canal. **Único lugar del archivo donde está escrita.** |
| `clnkBase()` | el único lector | la devuelve, salvo que haya una variable de pruebas válida |
| `window.__clnkBaseTest` | el gancho de las pruebas | **no la escribe ningún control de la app**, no se persiste, y sólo se honra si lo que trae es **loopback con puerto** |

**El médico no edita la dirección**, y eso es la diferencia de fondo con el panel viejo, que tenía
un campo de texto: el médico no tiene por qué saber qué poner, y un campo editable es además una
forma de mandar el token a cualquier parte.

⚠️ **La variable de pruebas no es una puerta trasera, y está medido por qué**: el patrón que la
valida sólo acepta `127.0.0.1`, `localhost` o `[::1]` con puerto, así que **el tráfico de este
módulo no puede salir de la máquina ni con la variable puesta**. Esa es la propiedad que importa
— no «el médico no va a tocarla».

La batería levanta el conector falso en un puerto al azar, el arnés lo publica en
`window.__CLNK_FAKE` y cada caso lo aplica. **Por ahí no viaja el token**: se publican la
dirección, el puerto cerrado a propósito y el código de vinculación, y nada más.

---

## 2 · La capa de comunicación — `clnkPedir`

**Una sola función para todas las llamadas.** Con una por ruta, el día que cambie el nombre de la
cabecera o el tiempo de espera habría que acordarse de los nueve lugares; y lo que es peor, el
token se leería en nueve lugares en vez de uno.

Devuelve siempre un objeto y **nunca lanza**:

| campo | qué es |
|---|---|
| `ok` | el conector contestó 2xx |
| `estado` | el código HTTP, o **0** si no hubo respuesta |
| `datos` | el JSON, o `null` (un 204 no trae cuerpo, y un `json()` sobre eso lanza) |
| `red` | el pedido no llegó a destino |
| `vigente` | **false** si el estado cambió mientras el pedido estaba en vuelo |
| `msg` | el mensaje ya traducido para mostrarle al médico |

- **`Authorization` sólo cuando quien llama lo pide.** Así una ruta nueva no hereda el token por
  descuido. Las dos únicas rutas sin token son el estado y la vinculación.
- **`Content-Type` sólo si hay cuerpo.** Mandarlo en un GET agrega el pedido previo de CORS sin
  ninguna necesidad.
- **`_clnkGen`, el token de generación.** Es el mismo recurso que tenía el panel retirado: cuando
  el médico apaga el módulo, pasa a Modo Básico o desvincula, el número sube y toda respuesta que
  venga en vuelo de **antes** deja de aterrizar. Sin esto, una lectura lenta repinta el panel con
  datos de un estado que ya no existe. Lo fija **TC-841**.

### Los errores, y el porqué de cada uno

| estado | qué hace | por qué |
|---|---|---|
| **401** | **borra el token** y pide vincular de nuevo | la credencial ya no sirve; guardarla deja al panel reintentando para siempre sin decirle al médico qué hacer |
| **404** | devuelve cadena vacía → quien llama **esconde** | lo que manda el contrato contra un conector viejo: esconder, no mostrar un error |
| **409** | dice que el equipo espera la decisión | |
| **410** | el código venció | |
| **429** | muchos intentos, con los segundos que el conector informa | |
| **503** | CeiboLink está iniciando, reintentar | |
| **400** | el mensaje **del conector**, filtrado | está escrito para mostrárselo al médico; el filtro (`_clnkSinRutas`) lo cambia por uno genérico si trae una ruta de archivo o una dirección |
| **500** | mensaje genérico | es de la máquina del médico y no del pedido: no se reintenta en bucle ni se le dice que escribió algo mal |

⚠️ **El 400 se filtra aunque el contrato prometa que no trae detalles internos.** La promesa es
sobre el 500; de cada 400 **futuro** no promete lo mismo, y lo que el médico necesita es saber que
el pedido estaba mal, no la ruta del archivo de estado de un programa que no administra.

### El fallo de red, y por qué el mensaje nombra dos causas

`CLNK_MSG_RED`. ⚠️ **El navegador da el MISMO `TypeError` si el conector está apagado y si algo lo
bloquea**, y no hay forma de distinguirlos desde la página — es a propósito del navegador, para no
filtrar qué hay escuchando en la máquina. Con «CeiboLink no responde» a secas, el médico que acaba
de negarle a Chrome el permiso de red local se pone a reinstalar un programa que está
perfectamente encendido. Por eso el mensaje dice las dos.

Lo mide **TC-834**, y lo mide **contra un puerto cerrado de verdad**: el conector falso escucha un
puerto y lo cierra enseguida, así que el fallo es el real del navegador y no uno simulado.

---

## 3 · El token

| pieza | quién es |
|---|---|
| `CLNK_TOKEN` | la clave de `localStorage` |
| `clnkToken()` | el único lector |
| `clnkVinculado()` | «¿hay token?», sin mirar su valor |
| `_clnkBorrarToken()` | el único que lo saca |

**Vive en `localStorage` por decisión del médico**: vincula una sola vez por navegador y no cada
mañana. No caduca por tiempo —el contrato devuelve un vencimiento nulo— y se corta con
«Desvincular EcoSmart».

**Nunca sale de ahí.** No va a un toast, ni a un registro, ni a un mensaje de error, ni a un
atributo del DOM, ni a la URL, ni al hash. Se lee en **tres** lugares y se escribe en **uno**.

⚠️ **Y no lo exporta nada, medido sobre el archivo**: NINGUNA función recorre `localStorage` —cero
`localStorage.key(`, cero `localStorage.length`, cero `Object.keys(localStorage)`—, y el
exportador de respaldo saca los estudios y los medios de IndexedDB sin tocarlo. **Si alguna vez se
agrega un exportador que sí lo recorra, estas dos claves tienen que quedar excluidas.**

Lo fija **TC-835**, que lo busca en el texto de la página, en el HTML entero, en **cada atributo de
cada nodo**, en los avisos del panel, en los toasts y en la URL — **con su control positivo**,
porque buscar una cadena vacía encuentra siempre y el caso pasaría con el token en pantalla.

---

## 4 · Las nueve partes de la tarjeta

Todas con ids de prefijo `cfg-`. La tarjeta es `cfg-card-clnk`.

| parte | dueño | notas |
|---|---|---|
| (a) interruptor | `clnkToggle` | clave `ett_ceibolink_on`. Va con `onchange` y **nunca** con `onclick`: la regla táctil global matchea por el atributo e inflaría la casilla a tres veces el alto de su fila |
| (b) estado con su luz | `clnkLeerEstado` | al abrir el panel y con «Actualizar». **Sin sondeo periódico**: es del paso siguiente. El color **no es la única señal**: cada estado se dice con palabras |
| (c) vinculación | `clnkCodigoInput`, `clnkVincular` | seis dígitos, validados **en pantalla** antes de mandar |
| (d) desvincular | `clnkDesvincular` | pregunta, y aclara que **el ecógrafo no se desconecta** |
| (e) datos del ecógrafo | `clnkLeerConexion` | puerto, nombre y **todas** las direcciones, con «Copiar» por fila |
| (f) equipos | `clnkLeerEquipos`, `_clnkFilaEquipo`, `clnkAccionEquipo` | apodo editable, estado, imágenes, último envío, y Permitir / Bloquear / Olvidar |
| (g) ajustes | `clnkLeerAjustes`, `clnkGuardarAjustes` | horas de 1 a 72 y nombre, validados **en pantalla** |
| (h) ayuda plegable | `clnkAyudaToggle` | las tres vías, **provisorias** |
| (i) descargar | — | deshabilitado, y **dice por qué**: un botón apagado sin motivo se lee como una falla de la app |

### El repintado

`clnkRender` es el embudo, y `clnkOnMostrar` lo que se llama al abrir Config. **Dos enganches**:
`cfgSetMode` (para que apretar «Modo Básico» con Config abierto esconda la tarjeta en el acto) y
`cfgOnShow`.

⚠️ **El tercer enganche del panel viejo no tiene reemplazo, y no es un olvido**: era el repintado
en el cambio de pestaña, para el botón «Buscar en Orthanc». **CeiboLink no pone ningún control
fuera de su tarjeta de Config**, así que no hay una segunda superficie que pueda quedar
desincronizada. Queda su lápida en el lugar. Si alguna vez gana un botón ahí, el repintado vuelve
a ese lugar.

### Las dos compuertas, que son distintas

- **El MODO gobierna la TARJETA**: en Modo Básico no queda ni el título. La decide
  `_clnkModoAvanzado`, **no una regla CSS**, porque el modo vive en `localStorage` y no en una
  clase del documento.
- **La CASILLA gobierna el CUERPO**.

Confundirlas borra la forma de apagar el módulo. Lo fija **TC-833**.

**Falla hacia visible**, igual que el panel viejo, y por el mismo argumento: **el lado seguro lo
fija el marcado**, que nace sin `display:none`. Si se toca el marcado de la tarjeta, es en
`_clnkModoAvanzado` donde hay que mirar — no al revés.

### Esconder limpia, pero no borra el marcado

⚠️ **AQUÍ ESTÁ EL DEFECTO QUE LA SUITE DESTAPÓ Y LA LECTURA NO.** `_clnkEsconderDependientes`
esconde los tres bloques que dependen del conector, pero **vacía sólo dos**:

- «Datos para configurar el ecógrafo» y «Equipos» los **pinta el JS entero**, así que vaciarlos es
  tirar lo que uno mismo dibujó;
- **«Ajustes» NO**: su marcado es **estático** —los dos campos, su rótulo, el botón «Guardar» y el
  renglón de avisos viven en el HTML—, así que un `textContent = ''` ahí **borra los campos del
  documento para siempre**, con la tarjeta visible y sin ellos. Y **no vuelven**: el repintado los
  busca por id, no los crea.

**Se vio en el LOTE y no aislado**: TC-833 los perdía del censo y TC-840 reventaba con «Cannot set
properties of null», porque el que los borraba era el caso **anterior**. Es el mismo modo de falla
que PANT-30 pagó con el barrido de `-aviso` y el botón del aviso.

Y el camino de fallo de los ajustes se esconde **sin vaciar**, por lo mismo.

---

## 5 · Lo que viene del conector se dibuja como TEXTO

**Todo** entra con `textContent` y **nunca** con `innerHTML`. Cero `innerHTML` nuevos en la tanda
—la única aparición en el diff es el comentario que lo declara—.

⚠️ **El apodo y el AET van además dentro de un `bdi`, y eso NO es lo mismo que escapar.**
`textContent` impide que se **ejecute**; `bdi` impide que se **lea al revés**, que es un problema
distinto y no lo arregla escapar. Con un carácter que da vuelta la lectura —el *bidi override* y
sus parientes— **la fila del equipo A se puede leer con el nombre y la dirección del equipo B**, y
ésa es justo la fila donde el médico decide permitir o bloquear.

El contrato dice que el conector rechaza esos caracteres, **pero validar no es escapar** y una
versión futura puede dejar de rechazarlos: **el aislamiento va de este lado**.

Lo fija **TC-837**, con un apodo que trae una etiqueta `img` con `onerror` y un bidi override: cero
ejecuciones, cero `img`, cero atributos de evento, el payload visible como texto literal y dentro
de un `bdi`, **con el denominador de que la lista pintó sus dos equipos** — sin filas, contar
inyecciones da cero y parece seguro.

### Dos cosas más del mismo tema

- **«Copiar» lleva el valor en un atributo (`data-clnk-copiar`) y el manejador por delegación**,
  nunca interpolado dentro de un `onclick`: ahí el escape **no** protege, porque el parser
  decodifica la entidad **antes** de compilar el manejador. Y estos valores vienen de la red, no
  son literales del archivo.
- **El id del equipo se busca recorriendo y no con un selector armado por concatenación.** Lo da el
  conector, así que metido dentro de un selector de atributo puede romperlo o emparejar otro nodo.

---

## 6 · Los colores

Se usan las variables que **existen** en esta app: `--green`, `--red`, `--amber`, `--text2`,
`--bg2`, `--bg3`, cada una con su respaldo explícito.

⚠️ **`--ok`, `--bad` y `--bg1` NO EXISTEN.** Escribirlas da el mismo defecto que POP-B pagó con
`--amber` y PANT-13 con `--card`. Acá no son atributos de presentación de un dibujo —son
propiedades CSS de elementos reales, donde `var()` sí resuelve— pero igual van con respaldo.

---

## 7 · Lo que salió, y dónde está su lápida

| qué | dónde estaba |
|---|---|
| la tarjeta «Conexión por red (DICOM)» con su campo de dirección, «Verificar conexión», el instructivo de arranque y los datos del ecógrafo | Configuración |
| el botón «Buscar en Orthanc» | pestaña Imágenes |
| el overlay con la lista de estudios y sus filtros por nombre y fecha | pestaña Imágenes |
| el bloque JS del módulo | el `<script>` grande |
| las cuatro claves de `localStorage` | — |

**Medido sobre el archivo**: cero apariciones del puerto de la API de Orthanc, de cada id del
panel, de cada clave y de cada función del módulo. Las menciones que quedan son **lápidas en
comentarios**, que dicen que se fue y por qué. Lo fija **TC-832**, que lo cuenta sobre el **archivo
servido** con su control positivo, más el DOM y los globales, **más el control negativo de que la
carga manual del pendrive sigue entera**.

⚠️ **Y un comentario con el literal arruina esa búsqueda.** Dos lápidas mías traían el puerto y el
nombre de un ayudante viejo, y TC-832 las encontró. Se reescribieron: **una búsqueda sobre el
archivo no distingue un comentario de una lectura**.

### Los seis ayudantes que se conservaron

Con el prefijo cambiado a `_clnk` y **el cuerpo idéntico**: `_clnkSexo`, `_clnkEdad`,
`_clnkPonerSiVacio`, `_clnkArchivo`, `_clnkEsSR` y `_clnkGetJSON`. **No son de Orthanc**: son de
«meter un DICOM que llegó por la red en el estudio que está abierto», y los usa el paso siguiente.

⚠️ **Hoy no los llama nadie, y es a propósito.** `detectar_huerfanos.py` **no los ve** —sólo mira
campos de entrada, no funciones— así que **ninguna herramienta va a avisar de esto**. Si el paso
siguiente no se hace, se borran.

⚠️ **`_clnkGetJSON` se solapa con `clnkPedir`.** Se conservó porque la orden lo pide explícitamente,
pero el paso siguiente debería pedir por `clnkPedir` —que lleva el token, el tiempo de espera y la
traducción de errores— y no por ahí. Queda como decisión del médico.

Y se conservó **la advertencia de que el `PatientID` del DICOM NO es la cédula**: en un ecógrafo de
hospital es el número de historia clínica, y cargarlo como documento puede mezclar un estudio con
el de otro paciente. **Hoy no hay código que lo escriba**, así que lo único que lo impide es esa
advertencia — y por eso **TC-223** fija que siga en el archivo.

---

## 8 · El conector falso de las pruebas

`scripts/_conector_falso.mjs`. Un servidor HTTP en loopback con las rutas del contrato que usa el
panel, las cabeceras CORS que ese contrato pide y el puerto configurable por variable de entorno.
Se **importa**, no se lanza como proceso aparte, así que muere con el arnés y no deja un puerto
escuchando.

⚠️ **POR QUÉ UN SERVIDOR DE VERDAD Y NO UN `fetch` SUSTITUIDO**, que es lo que hacían los casos de
Orthanc que esta tanda retira: un `fetch` sustituido **no puede probar CORS**, ni el
`Authorization` que viaja de verdad, ni que el navegador trate un 404 distinto de un 503. Lo único
que prueba es que la app llama a la función que le pusimos. Con un servidor real el pedido sale por
loopback y **el motor aplica sus propias reglas**, que es justo la mitad del contrato que más fácil
se rompe.

- **Nada se escribe en disco** y nada sobrevive al proceso.
- **El código de vinculación y el token se generan al azar en cada arranque**, así que en el
  repositorio no queda escrito ninguno.
- Acepta el origen de producción **más cualquier loopback**, porque la batería sirve la app desde
  un puerto al azar; **nunca responde `*`**. Que el de verdad sea estricto es una propiedad **suya**,
  no de EcoSmart.
- Publica además un **puerto cerrado a propósito**, para el caso del conector apagado.
- `/_control` es una ruta **fuera del contrato**, sólo de pruebas, para mover el escenario.
  ⚠️ Aplica el reinicio del escenario **primero** y después las demás claves, y no en una rama
  alternativa: un pedido con las dos cosas juntas ignoraba la segunda en silencio, y el caso medía
  un escenario que creía haber armado.

---

## 9 · Los diez casos

| caso | qué fija |
|---|---|
| **TC-832** | el panel viejo no existe, sobre el archivo con conteo y control positivo, más el DOM, los globales y el control negativo del pendrive |
| **TC-833** | la tarjeta: Modo Avanzado, las dos compuertas, esconder no es borrar, **una sola superficie**, fuera del censo y del Excel, Descargar apagado, la ayuda con sus tres vías, el texto provisorio |
| **TC-834** | conector apagado: las dos causas, las partes dependientes escondidas, y **nada más de Config se rompe** |
| **TC-835** | vincular bien y mal, vencido, demasiados intentos, y **el token en ningún texto** |
| **TC-836** | desvincular borra el token; el 401 también; **un 503 y un 409 NO** |
| **TC-837** | el apodo malicioso como texto, en `bdi`, cero ejecuciones |
| **TC-838** | los tres datos, todas las direcciones, la probable, el aviso, la 169.254 con su control negativo, Copiar por atributo |
| **TC-839** | contra un conector viejo las dos rutas nuevas **se esconden**, con el control positivo contra el nuevo |
| **TC-840** | los ajustes se validan **en pantalla**: se **cuentan los PUT** que salen |
| **TC-841** | sucesor de TC-231: el modo en el predicado, el vuelo que no aterriza, esconder limpia |

⚠️ **Los nueve que tocan el módulo declaran como denominador que el árbol lo tenga.** Dejar que el
primer acceso lance **tapa a la siguiente excepción** y deja las condiciones de abajo en falso sin
haber medido nada — que es exactamente lo que PANT-37 tuvo que deshacer en TC-827. Contra el árbol
anterior caen por **esa** condición, declarada.

⚠️ **TC-840 cuenta los PUT y no mira sólo el mensaje.** Con un valor fuera de rango no tiene que
salir **ninguno**: si saliera, la validación la estaría haciendo el conector y el aviso llegaría
igual, o sea que mirar el mensaje **no distingue quién validó**.

### Los casos que se fueron, con su sucesor

| caso | qué probaba | sucesor |
|---|---|---|
| TC-220 | el puerto y el AE Title leídos de la API de Orthanc, y el CORS que no se confunde con ausencia | **TC-838** (y el CORS cambió de forma: hoy el fallo de red se mide contra un puerto cerrado de verdad, en TC-834) |
| TC-221 | el instructivo de arranque de Orthanc | **TC-833** (las tres vías) |
| TC-222 | el panel de estudios | **ninguno**: CeiboLink no lista estudios, y elegir qué adjuntar es el paso siguiente |
| TC-223 | importar un estudio | **reescrito conservando su número**: los seis ayudantes y la advertencia del `PatientID` |
| TC-230 | las dos superficies sólo en Modo Avanzado | **TC-833** |
| TC-231 | el modo en el predicado, el vuelo, esconder limpia | **TC-841** |

**Ninguno se borró en silencio**: cada retiro deja su motivo y su sucesor escritos en el lugar
donde vivía el caso, para que quien lo busque por su número encuentre la explicación y no un hueco.

---

## 10 · Lo que está PROVISORIO y lleva marca

| qué | dónde | marcador |
|---|---|---|
| dónde ve el médico el código de vinculación | `CLNK_TXT_DONDE_CODIGO` | `data-clnk-provisorio="codigo"` |
| las tres vías de conexión del ecógrafo | la ayuda plegable | `data-clnk-provisorio="ayuda"` |

Las tres vías están escritas **contra el contrato y no contra un ecógrafo real**, y lo dicen: «A
confirmar con el ecógrafo real». Cuando se pruebe con el equipo del consultorio se corrigen con lo
que pase de verdad.
