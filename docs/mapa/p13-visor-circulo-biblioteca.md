# Mapa — tanda P13 y P13-B (2026-11-22)

Sello **`v20261122-2142`**, md5 **`67fa26f6`**, **193.541** líneas. Línea base **`c047112`**.
Armado sobre ese commit: **no guarda números de línea** a propósito. Se busca por nombre de
función o de constante.

---

## 1 · El orden y la estructura del visor (tarea 1)

| Qué | Quién |
|---|---|
| «➕ Vista» y «Cerrar» siempre arriba | la clase `cine-grp-vista` **salió** de la lista del modo mínimo (hoja de estilos, bloque «MODO MÍNIMO DEL VISOR») |
| Con UNA vista no hay «Cerrar vista» | `#cine-ov:not(.cine-con-b) [id$="cine-cerrar-v"]` · la clase la pone `_vToggleSync` |
| «✕ Cerrar vista», uno por vista y en su encabezado | `_vPanelHTML` → el `span` con `margin-left:auto` del `cine-encab` |
| La letra de cada vista sale de su POSICIÓN | **`_vRotularPorPosicion`**, llamada desde `_vAccionesSync` |
| …y las procedencias ya anotadas se remapean | **`_vRemapOrigenes`** (una pasada, sobre una foto de los valores viejos) |
| El botón de tamaño, uno por vista | `_vPanelHTML` → `cine-imgtr`; el estado lo escribe `cineMaxSync` sobre **todos** |
| En pantalla completa, la elegida grande y la otra al costado | clases `cine-v-grande` / `cine-v-chica`, puestas por `_vMaxSync` |
| La tabla no salta de columna | la guarda **pegajosa** de `mudar`, dentro de `_vSlotSync` |

### La pegajosidad vale sólo cuando el empate es real

`mudar(id, V, ranura, pred)` recibe desde P13 un cuarto argumento: el **predicado de dueño**. La
guarda se queda donde está **únicamente** si la vista que hoy aloja el cajón **también** cumple ese
predicado, o sea si también tiene esa herramienta abierta.

- **Las dos vistas midiendo lo mismo** → las dos son dueñas posibles → el cajón **no se mueve**.
  Es el salto que el médico reportó en el punto 1g: con el TAPSE medido en la izquierda, bastaba
  que la derecha eligiera Distancia para que la tabla se mudara a su columna.
- **Una sola candidata** → la anfitriona de ahora no cumple el predicado → el cajón **viaja** a la
  columna de la vista que sí lo tiene abierto. Es **MEDIR-5 (A1)**, y sin esta condición volvía su
  defecto: la vista A con DOS tablas y la B con ninguna.
- **Sin predicado** —el bloque de calculados cuando nadie mide en Doppler— la guarda es la de
  antes, que es lo que necesita para quedarse debajo de cualquier imagen.

⚠️ Lo destapó **TC-899** en la pasada completa, no la lectura: pasa contra `c047112` y salía rojo
acá con `panelD2` en 'A' y las tablas en 2/0. **Antes de tocar esta guarda, correr TC-899 y
TC-1023 juntos**: uno fija que el cajón viaja y el otro que no salta.
| …y con valores no se esconde | `_d2Visible` y `_dopVisible` |
| El interruptor de la columna, mientras esté escondida | `#cine-ov:not(.cine-max):not(.cine-sinpanel) .cine-pan-btn` |
| Salir de pantalla completa devuelve la columna | `cineMaxToggle` |
| El botón de guardar el cineloop | **retirado**, con su lápida en `_vPanelHTML`. `cineGuardarActual` sigue expuesta |
| Un video nuevo arranca limpio | **`_cineSoltarAlAbrir(loops, puerta)`** y `_cineClaveAbierta` |
| La traba con dos cineloops | la guarda del temporizador en el observador de `#cine-num` (`_medObservar`) y la cuenta pendiente en `_cineDetener` |
| Mantener apretada la flecha de cuadro | **`_vRepetirCuadro`**, cableada en `_vCablear` |
| Los contornos confirmados del Simpson | `_medPintar`, bloque `_medHerr === 'simpson'` → `_trPend` / `_trConf` |

### El 1j, y sus tres acotaciones

El vaciado **no** es incondicional, y cada acotación salió de una medición:

1. **Las cuatro sesiones de medición NO se sueltan.** El Simpson biplano, el SGL por territorios,
   el LARS y el strain del VD cruzan DOS cineloops por método. Soltarlas puso en rojo a TC-192,
   TC-200, TC-201, TC-204 y TC-205, tres con un `TypeError` sobre la sesión recién borrada. Lo que
   el médico nombró es la TABLA.
2. **Se vacía sólo en las tres puertas que la orden nombra** —Vista previa, biblioteca e imágenes
   guardadas—, que son las ocho llamadas donde el médico elige UN archivo a mano. La importación
   del pendrive no está en su lista y ahí la acumulación es la conducta declarada: de dos imágenes
   del mismo lote sale la AVA por continuidad. La decide el segundo argumento de `_cineAbrir`.
3. **No se vacía al reabrir el MISMO video.** La ✕ declara que «lo medido se conserva». La
   identidad la da `_cineClave` y se compara contra `_cineClaveAbierta` —y no contra
   `_vistaA.datos`, que `cineCerrar` suelta—.

---

## 2 · La biblioteca (tarea 2)

- El reparto en dos grupos vive al final de **`cineStripRender`**, en la función anónima que arma
  `cont.innerHTML`. El criterio es la **clase** de cada ficha: `cine` y `cinepend` son cineloops,
  todo lo demás es una fija. Cada grupo se dibuja sólo si tiene algo.
- Una captura entra por `_capturaALaBiblioteca` → `_bibGuardarJpeg`, o sea **al disco y sin
  casilla**, y por eso caía en la tira. No se tocó ni la captura ni el guardado.
- La miniatura chica: el `grid-template-columns` de `#img-grid` en el marcado, y el `min-height`
  de la celda y el `max-height` de la imagen en **`imgRender`**.

---

## 3 · La calibración de velocidad (tarea 3)

| Qué | Quién |
|---|---|
| La clave de la escala guardada | **`_medCalVelClaveDe`** → `_medCalVelHash(uuid + '|' + _cineClave)` |
| El almacén | `localStorage` bajo **`ett_med_calvel`**, tope de 300, corta por lo más viejo |
| Guardar | **`_medCalVelPersistir`**, llamada en el único punto que escribe una escala válida |
| Reponer | **`_medCalVelRestaurar`**, en diferido al final de `_cineCargarLoop` |
| ¿Falta la escala? | **`_medEscalaVelFalta`** — falla CERRADO |
| Entrar solo a calibrar | la línea de `medHerramienta` que mira `vel` **y** `vti` |

⚠️ **La clave va hasheada**, y es un defecto que la sonda encontró: `_cineClave` empieza por el
NOMBRE del archivo, y el de uno importado a mano puede llevar el del paciente.

---

## 4 · El círculo rojo/verde (tarea 4)

| Qué | Quién |
|---|---|
| El par visor ↔ app | **`_medAppCampo`**, derivado de `_D2_BANDA_DE` y `_DOP_BANDA_DE` |
| Leer y escribir el campo | `_medAppNum`, `_medAppEscribir`, `_medAppBorrar` |
| El estado, derivado | **`_medCircEstado`** (compara con UN decimal) |
| El botón y su nota | `_medCircHTML` y `_medCircNota`, consumidos por `_medTablaHTML` |
| La acción | **`medCircTocar`** (pregunta con `preguntaProp`) |
| El oyente | `_medCircObservar`, uno delegado en el documento |
| La fila nace con lo de la app | **`_medCebarDesdeApp`**, al final de `_cineAbrir` |

⚠️ **El par sale de las dos tablas de BANDAS que ya existían**, cuya regla es «prestar sólo donde
la pregunta es la MISMA». Eso trae la unidad verificada de arriba. Las filas sin banda prestada
**no llevan círculo** a propósito.

⚠️ **El círculo va al principio de la celda del NOMBRE** y no en la de acciones: ahí no entra un
tercer botón de 44 px y la fila pasaría de 45 a 89 px de alto.

---

## 5 · El 13-B

| Qué | Quién |
|---|---|
| Qué ids tenía el puente en el sondeo anterior | **`_clnkEnPuente`** (en memoria) |
| Cuántas llegaron AHORA, y de qué tipo | **`_clnkLlegaronAhora`** |
| Que el cartel salga con solo repetidas | la segunda condición del filtro de `clnkRevisarImagenes` |
| El texto «Llegaron N: 0 nuevas … Hay M esperando» | la rama `nYaEstaban > 0` de `_clnkAvisoTexto` |
| «Descartar» con cero nuevas no borra nada | el tercer botón de `_clnkPreguntarQue` |
| La reserva de alto en pantalla completa | `--cine-imgh`: **145 px** con una vista, **185** con dos |
| El pie de «Sincronizar» | `#cine-pie`, escondido por `#cine-ov.cine-max:not(.cine-con-b)` — **fuera** de la media query |
| La barra de desplazamiento de la página | `_cineBodyOv` y las dos ramas de `cineMaxToggle` |

### La causa de la traba, cuantificada

|  | base `c047112` | hoy |
|---|---|---|
| un cineloop · mutaciones del DOM en 2 s | **407** | **1** |
| un cineloop · mudanzas de columna | **3** | **0** |
| dos cineloops · mutaciones en 2 s | **1396** | **2** |
| dos cineloops · mudanzas de columna | **297** | **0** |

Con un cineloop había churn de texto dentro de nodos **quietos**; con dos, **297 re-parentings en
dos segundos**. Cada uno saca el nodo del documento y lo vuelve a insertar en la otra columna, así
que reflowa todo lo que está debajo de los videos y hace imposible desplazar.

---

## Las sondas

| Archivo | Qué mide |
|---|---|
| `scripts/_probe_p13_0.mjs` | el bloque 0: la estructura del visor, el Simpson, el 4g |
| `scripts/_probe_p13_t2.mjs` | la biblioteca y las tres puertas del 1j |
| `scripts/_probe_p13_t3.mjs` | el VTI a seis decimales y la calibración manual |
| `scripts/_probe_p13_t4.mjs` | el círculo, punto por punto |
| `scripts/_probe_p13b.mjs` | la traba con dos cineloops y el alto a 1920 |
| `scripts/_probe_p13dos.mjs` | los dos motores |
| `scripts/_insertar_p13.py` | el insertador de casos, con su guardián de acentos graves |
