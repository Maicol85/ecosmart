# Fichas de los casos TC-872 a TC-881 (tanda ECO-CONECTOR-5, 2026-11-13)

Archivo propio, y no una sección de `tests-fichas.md`, por la misma razón que las de las tandas
anteriores: ese archivo está a menos de 1 KB de su techo y un mapa que crece con cada tanda termina
siendo imposible de presupuestar.

**Los diez caen 0/10 contra la línea base (`5a9f0ca`) POR SU DENOMINADOR DECLARADO y NINGUNO por
excepción**, verificado en un worktree con el MISMO archivo de casos y sólo el `index.html`
distinto, leyendo el motivo de cada rojo uno por uno.

---

## El contestador de la pregunta, en el preludio

⚠️ **LOS CINCO AYUDANTES DE ESTOS CASOS VIVEN EN EL PRELUDIO (`window.__t`) Y NO EN UNA FUNCIÓN DE
`test_clinico.mjs`**, y no es una preferencia: el cuerpo de un caso es una **cadena que se evalúa EN
EL NAVEGADOR**, así que una función de nivel de módulo de ese archivo no existe ahí. La primera
versión los declaró arriba y los diez casos habrían caído con «_ec5Modal is not defined», o sea un
rojo que no apunta a su propia causa.

| ayudante | qué hace |
|---|---|
| `__t.ec5Jpeg()` | un JPEG **decodificable**, hecho con un canvas |
| `__t.ec5Esp(ms)` | esperar |
| `__t.ec5Modal()` | lo que el médico LEE: título, párrafo, cuerpo y botones visibles |
| `__t.ec5Apretar(trozo)` | aprieta el botón cuyo texto contiene el trozo |
| `__t.ec5Auto(trozo)` / `__t.ec5Pregs()` | el contestador automático y los textos que contestó |
| `__t.ec5Vincular(F)` | vincula por el flujo REAL, con el código en su campo |

⚠️ **UN CASO QUE DISPARE LA PREGUNTA Y NO LA CONTESTE CUELGA LA BATERÍA ENTERA**: la promesa queda
esperando un clic que nadie da. Lo pagó **TC-862**, que colgó su lote al primer intento. El patrón
es lanzar el sumidero **sin `await`**, esperar a que abra, apretar, y recién entonces esperar la
promesa — o armar `ec5Auto`, que es el médico apretando el botón.

⚠️ **Y `ec5Auto` CUBRE ADEMÁS EL `confirm` NATIVO**, para que un caso adaptado no cuelgue contra la
**línea base**, donde la pregunta todavía es nativa. Eso también lo pagó una corrida.

---

## TC-872 — «Ver lo que espera» reabre lo cerrado con la ✕

**Denominador**: este árbol tiene `clnkVerLoQueEspera` y `clnkRevisarImagenes`.

| bloque | qué fija |
|---|---|
| (A) | el aviso sale por el sondeo y la ✕ lo cierra |
| (B) | el sondeo **NO** lo vuelve a ofrecer solo — es el defecto que el médico reportó |
| (C) | el botón **sí** lo reabre, con el mismo aviso y sus TRES destinos |
| (D) | sin nada esperando abre un cartel que lo DICE |
| (E) | con un equipo por decidir manda a decidir y **NO** dice «no hay nada» |
| (F) | **control negativo**: sin vincular no abre nada y avisa que falta vincular |

(E) existe porque «no hay nada» y «tus imágenes están bloqueadas por un equipo sin autorizar» son
cosas distintas: con un solo mensaje el médico concluye que se perdieron.

---

## TC-873 — la fecha del aviso y el panel que se actualiza solo

**Denominador**: `_clnkCuando` y `clnkRefrescar`.

| bloque | qué fija |
|---|---|
| (A) | «a las HH:MM» de hoy, «ayer a las 23:43», «el DD/MM a las HH:MM», y sin dato nada |
| (B) | el aviso de verdad LLEVA FECHA, sin un solo dato del paciente, y el texto es estable |
| (C) | **control**: de hoy NO dice ayer ni la fecha, pero sí la hora |
| (D) | tras confirmar, el panel releyó el estado **solo** |
| (E) | con la tarjeta **fuera de la vista** NO pide nada, y el refresco lo dice devolviendo false |
| (F) | cinco pedidos seguidos son **UNA** sola lectura |

⚠️ **(A) CONSTRUYE LOS TRES INSTANTES CON `setDate`, NO RESTANDO 86.400.000 ms**: un día después de
un cambio de hora, restar eso cae en el mismo día o en el anteayer, y una prueba que reste lo mismo
que el código no lo ve nunca.

⚠️ **(B) EXIGE QUE EL AVISO LLEVE FECHA Y NO CUÁL DE LAS DOS FORMAS**: la escena `deAyer` tiene DOS
grupos —dos imágenes de ayer y una de hace cinco días— y el aviso abre el PRIMERO que devuelve el
agrupador, que no está especificado. La forma «ayer a las 23:43» la fija (A) sobre el dueño del
texto. La primera versión exigía esa forma y daba rojo sobre una app que se porta bien.

---

## TC-874 — un diálogo propio, los dos pesos y UN resumen

**Denominador**: `clnkAvisoPreguntar`, `dstResumen` y `_dcmDosPesos`.

| bloque | qué fija |
|---|---|
| (A) | la frase dice el peso sin comprimir, lo que ocupará guardado, y «estimado» |
| (B) | la pregunta es el modal de la app, con «Abrir igual» y «Dejarlo esperando», los DOS pesos en su cuerpo y las dimensiones, y **CERO `confirm` nativos** |
| (C) | el resumen final es UN diálogo con UN botón «Entendido», dice que sigue esperando, **CERO `alert` nativos** en todo el camino, y no se confirmó nada |
| (D) | **control negativo**: el mismo aviso FUERA de una tanda **sí** sale como cuadro nativo, y dentro se junta |

(D) existe porque «cero cuadros nativos» se cumpliría también en una app que hubiera dejado de
avisar de nada.

⚠️ **(B) MIRA LO QUE EL MÉDICO VE ANTES DE CONTESTAR**: se lanza el sumidero sin `await`, se espera
a que la pregunta abra —la descarga por loopback no es instantánea—, se lee, y recién entonces se
aprieta.

---

## TC-875 — los dos topes derivados de la memoria

**Denominador**: `_dcmMemGiB` y `_dcmPresupuestoBytes`.

| bloque | qué fija |
|---|---|
| (A) | `navigator.deviceMemory` existe y es un número; la app la usa; y el presupuesto no pasa **ni** un cuarto de la RAM **ni** la mitad del techo del montón |
| (B) | los CUATRO escenarios: más memoria más permisivo, sin dato un equipo **modesto** de 4 GiB y no el mejor, el duro por encima del blando en los cuatro, y los dos pisos mandando en 1 GiB |
| (C) | ni con los dos ganchos al revés se invierte el orden |
| (D) | por encima del duro no se abre, el veredicto dice que sigue esperando, **no se pregunta nada**, y el aviso trae los dos pesos |
| (E) | **control negativo**: por debajo del blando no se pregunta ni se avisa |

(A) es la condición que fija que el presupuesto **no** se calcula sólo con la RAM: con 32 GiB, un
cuarto de la RAM son 8192 MB y el presupuesto tiene que quedar por debajo del techo del montón.

(D) arma el contestador con «Abrir igual» **a propósito**: si ese botón apareciera, lo apretaría y
el archivo se abriría — es la forma de probar que no aparece.

---

## TC-876 — «para todos los pesados de esta tanda»

**Denominador**: `_dcmCrudoNuevoLote` y `_dcmCrudoModo`.

| bloque | qué fija |
|---|---|
| (A) | con UN archivo, sólo DOS botones y ninguno ofrece «para todos» |
| (B) | con varios, CUATRO, el cuerpo dice cuál de cuántos es, y la elección queda anotada |
| (C) | el segundo y el tercero **NO preguntan** y los dos quedan esperando |
| (D) | la tanda nueva arranca **sin** elección y vuelve a preguntar |
| (E) | «Abrir igual todos» abre el primero y el segundo abre **sin preguntar** |
| (F) | el sumidero abre la tanda **solo**, y la pregunta sabe que son tres |

(A) es el control negativo de (B): con un solo archivo los dos botones de «para todos» dirían lo
mismo que los dos de arriba y serían dos botones que no deciden nada.

---

## TC-877 — la tira de la vista previa

**Denominador**: `clnkVistaPreviaDe` y `_dcmCrudoUnCuadro`.

| bloque | qué fija |
|---|---|
| (A) | un turno de sondeo entero abre el AVISO pero **NO** la vista previa |
| (B) | con el botón sí abre, diciendo que no guarda ni borra nada, con una celda por archivo |
| (C) | la marca foto/video, el peso y la hora están puestos **SIN bajar un byte** |
| (D) | la tira se desplaza al costado, con lugar para SEIS, y con OCHO el contenido **desborda** la caja y la app dice «Se ven 6 de 8» |
| (E) | un pesado **NO** se baja solo y ofrece «Mirar igual» |
| (F) | la que falla queda marcada con su motivo y **las otras dos se dibujan igual** |

⚠️ **(C) SE LEE EN EL ACTO, SIN UN SOLO `await`, Y ESO ES LA CONDICIÓN ENTERA**: el pintado es
sincrónico y el llenado asincrónico, así que esperar 200 ms le da tiempo al llenado a reemplazar la
marca por la miniatura. La primera versión leía después de esperar y encontraba las celdas ya
llenas, o sea que medía otra cosa.

⚠️ **(D) USA LA ESCENA DE OCHO**: con seis no se puede distinguir «entran todas» de «desborda».

⚠️ **(E) BAJA EL TOPE DEL ARCHIVO A 300 BYTES** con `window.__clnkPrevTopeTest`, que es la primera
de las dos puertas — la del tamaño del **archivo**, que la lista sí da.

---

## TC-878 — mirar no es decidir

**Denominador**: `clnkVistaPrevia` y `clnkPrevAbrir`.

| bloque | qué fija |
|---|---|
| (A) | el estado de partida: nada confirmado, nada borrado, slots vacíos, bandeja y cineloops contados |
| (B) | **denominador**: se bajaron los seis y se dibujaron las miniaturas |
| (C) | y después de mirar: cero confirmadas, cero borradas, las seis siguen allá, cero slots, cero por confirmar, bandeja igual, base de cineloops igual |
| (D) | abrir una en grande tampoco cambia nada, y el visor **no** ofrece asignar ni borrar un envío |
| (E) | **control positivo**: el camino que sí confirma, confirma |
| (F) | con sólo cuarentena la lista sale VACÍA, no hay tira, y la app lo dice |

(C) mide la invariante de **seis formas**, que son las seis cosas que la decisión 6 prohíbe. (E)
existe porque «no confirmó nada» se cumpliría también en una app que no confirmara nunca.

---

## TC-879 — eliminar sólo lo elegido

**Denominador**: `CeiboImg.quitar`, `igElegirModo` y `igSelEliminar`.

⚠️ **LOS DOS ESTUDIOS TIENEN LOS MISMOS BYTES, y es lo que la orden pide**: con imágenes distintas,
«borró la de A» y «borró la de B» se distinguirían por el contenido y la prueba pasaría igual con un
borrado que mira el uuid equivocado.

| bloque | qué fija |
|---|---|
| (A) | el modo prende, se elige UNA, se borra UNA, y la confirmación **nombra** el estudio, la cuenta, que no se puede deshacer, que no toca el resto ni las copias de otros, y que deja de salir en el PDF |
| (B) | a A le falta UNA sola, **B queda intacto**, el esquema de A sobrevive y el ESTUDIO A sigue guardado |
| (C) | con B **abierto**, la imagen borrada sale también del formulario y del disco |
| (D) | borrada la última, el registro se va pero el ESTUDIO sigue guardado, y la app lo DICE |
| (E) | **control negativo**: sin nada elegido no borra nada y lo dice |
| (F) | **control negativo 2**: un índice que no existe no quita nada, y un estudio sin registro devuelve `null` |

⚠️ **(A) ABRE LA GALERÍA ANTES DE MEDIR**: la casilla, el contador y la barra los **pinta** la
columna derecha de «Imágenes guardadas», así que sin esa vista los nodos no existen y las
condiciones miden un hueco. Lo pagó la primera corrida.

⚠️ **Y UN TURNO DEL BUCLE DE EVENTOS ANTES DE `showTab`**: esa función lee el `window.event`
**global**, y justo después de escribir en IndexedDB ese global es el `success` de la transacción,
cuyo `target` no tiene `classList`. Es el defecto **preexistente** que `PENDIENTES` declara en
**P30-d**.

⚠️ **(C) PONE EL ESTUDIO ABIERTO POR EL CAMINO DE LA APP, `imgRestaurar(uuid)`**: `_imgUuidActual`
es un `let` de nivel de script, así que `window._imgUuidActual` crea una propiedad **nueva** que no
lo tapa — la trampa del ámbito léxico que este repositorio ya documenta para `_imgEditado` y
`_cinePendientes`.

---

## TC-880 — adjuntar copia, y va al elegido

**Denominador**: `igSelAlAbierto`, `igSelAGuardado` y `igVisorAdjuntar`.

⚠️ **TRES ESTUDIOS Y NO DOS**: con dos, «fue al elegido» no se distingue de «fue al que no era el
origen».

| bloque | qué fija |
|---|---|
| (A) | la confirmación nombra ORIGEN, DESTINO y cuenta, dice que copia y que no cambia datos; el origen queda, el destino crece en una, **el tercero no se toca**, y el orden coincide con `indice()` |
| (B) | un esquema elegido se **cuenta** como esquema y **NO** se copia |
| (C) | al estudio abierto entra al formulario, el original queda, y la app lo dice |
| (D) | el visor tiene «Adjuntar a…», su pie ya no es una pared, la pregunta ofrece los TRES destinos y dice que copia |
| (E) | **control negativo**: con «Guardar imágenes» APAGADO no escribe y lo dice |
| (F) | **control negativo 2**: al mismo estudio de origen no copia nada y lo dice |

⚠️ **(A) SUSTITUYE EL SELECTOR DE ESTUDIO** para elegir B sin pasar por la pantalla: lo que se mide
es a DÓNDE escribe, no el selector, que ya tiene su propio caso.

---

## TC-881 — exportar, importar y «Desde imágenes guardadas»

**Denominador**: `igSelExportar` e `imgDesdeGuardadas`.

⚠️ **EL CLIC DE DESCARGA SE INTERCEPTA**: un caso no puede bajar un archivo al disco del médico. Se
envuelve `HTMLAnchorElement.prototype.click` y se guarda el `download` y el `href`, que es lo que
después permite leer el archivo de verdad.

| bloque | qué fija |
|---|---|
| (A) | sin nada elegido no genera archivo e invita a elegir |
| (B) | pregunta **ANTES** de generar, con el tamaño, y todavía sin archivo; el aviso dice que trae imágenes de pacientes, que el nombre puede estar **DIBUJADO SOBRE** la imagen y que lleva el documento del estudio de origen; y recién al aceptar se baja UN archivo JSON |
| (C) | el archivo es el **sobre del backup**, marcado como selección, con UN solo estudio, **SOLO las dos elegidas**, sin la tercera ni el otro estudio, y con la ficha del origen —declarada— |
| (D) | la galería tiene su «Importar», que llama a la puerta de siempre **CON** la pregunta de destino |
| (E) | «Desde imágenes guardadas» lleva a la galería con el modo elegir **prendido** y lo dice |
| (F) | **control negativo**: el botón de siempre sigue ahí y abre el explorador **SIN** preguntar destino |

(C) lee el blob de verdad desde la URL de objeto: es el archivo que se bajó, no una reconstrucción.
