# Mapa — la vista previa, los diálogos propios y el modo elegir de la galería (ECO-CONECTOR-5)

Tanda **ECO-CONECTOR-5**, 2026-11-13. Lo que esta tanda cerró son los seis huecos de uso que el
médico encontró probando ECO-CONECTOR-4 con CeiboLink real.

Por nombre de función y de constante, **nunca por número de línea**: la línea cambia en cada
edición y el nombre no.

---

## 1 · «Ver lo que espera» (decisión 1)

| qué | dónde |
|---|---|
| el botón | `#cfg-clnk-acciones` en el marcado, dentro de `cfg-clnk-cuerpo` |
| quién lo muestra y lo esconde | `clnkRender`, por la misma condición `vin` que los tres plegables |
| la función | `clnkVerLoQueEspera` |
| el modo forzado | `clnkRevisarImagenes(forzar)` |

**Hasta esta tanda la única forma de volver a ver un aviso cerrado con la ✕ era RECARGAR la
página**, o sea perder el estudio en pantalla: el médico tenía que elegir entre sus imágenes y su
trabajo. `_clnkAvisadas` vive en memoria y el sondeo no vuelve a ofrecer lo ya avisado.

`forzar` cambia **dos cosas y nada más**: se ignora `_clnkAvisadas`, y no se entra por la rama de
ACTUALIZAR el cartel abierto. **Lo que NO cambia**: la guarda de no superponerse a otra pregunta
—`clnkAvisoHayOtraPregunta`— sigue valiendo, y la cuarentena sigue afuera porque la lista del
contrato §3.8 no la expone.

⚠️ **SI NO HAY NADA, LO DICE, Y DISTINGUE TRES MOTIVOS**: el conector no responde, hay otra
pregunta en pantalla, y no hay nada esperando. Con un solo mensaje, un aviso postergado por otra
pregunta abierta se lee como que las imágenes se perdieron. Y con un **equipo por decidir** manda a
decidir: sus imágenes existen pero EcoSmart no las puede ni listar hasta que el médico lo permita.

Lo fija **TC-872**.

---

## 2 · El panel se actualiza solo (decisión 2)

| qué | dónde |
|---|---|
| el predicado de «está a la vista» | `clnkPanelALaVista` |
| el repintado agrupado | `clnkRefrescar` · `CLNK_REF_MS` (400 ms) |
| los seis enganches | `dstAlActual`, `dstAGuardado`, `dstABandeja`, `clnkConfirmarPersistidas`, `clnkDescartar`, `clnkbAsignar` |

⚠️ **`clnkAccionEquipo` YA llamaba a `clnkLeerEstado()`**, medido: permitir, bloquear y olvidar un
equipo ya se actualizaban antes de esta tanda. Los enganches nuevos son **seis**, no nueve.

⚠️ **SE AGRUPA CON 400 ms**: una tanda de tres imágenes confirma de a una, así que sin agrupar
serían tres lecturas de estado por el mismo gesto. El temporizador se reinicia y el último gana.

⚠️ **NO PIDE NADA SI LA TARJETA NO ESTÁ A LA VISTA**, y se mide por la **caja** del nodo
(`getBoundingClientRect`) y no por un `style.display`: la tarjeta se puede esconder por su pestaña,
por el Modo Básico o por el interruptor, y mirar un solo estilo deja los otros dos afuera.

⚠️ **LA RESPUESTA VIEJA SE DESCARTA SOLA**: todo pasa por `clnkLeerEstado`, que pregunta por
`r.vigente` —el token de generación de `clnkPedir`—.

Lo fija **TC-873** (D), (E) y (F).

---

## 3 · La fecha del aviso (decisión 3)

| qué | dónde |
|---|---|
| la frase entera | `_clnkCuando` |
| sólo la hora, como siempre | `_clnkHora` (se conserva) |
| quién la usa | `_clnkAvisoTexto`, desde `_clnkAvisoArmarAcciones` |

Devuelve la frase **con su preposición** —«a las 23:43», «ayer a las 23:43», «el 07/11 a las
09:12»— y no sólo la hora: con «ayer, 23:43» el texto del aviso diría «a las ayer».

⚠️ **LA COMPARACIÓN ES POR DÍA DE CALENDARIO LOCAL Y NO RESTANDO 24 HORAS.** Un día después de un
cambio de hora, restar 86.400.000 ms cae en el mismo día o en el anteayer, así que «ayer» se diría
mal dos veces por año — y una prueba que reste lo mismo que el código no lo ve nunca.

Lo fija **TC-873** (A), (B) y (C).

---

## 4 · El modal gana cuerpo, quinto botón y pregunta con promesa (decisión 4)

| qué | dónde |
|---|---|
| el contenedor de contenido rico | `#clnkav-cuerpo` · `clnkAvisoCuerpo()` |
| el quinto botón | `#clnkav-b5` · la lista `CLNK_AV_BOTONES` |
| guardar y reponer el modal | `_clnkAvisoGuardar` / `_clnkAvisoReponer` |
| preguntar y esperar | `clnkAvisoPreguntar(titulo, texto, opciones, pintarCuerpo)` |

⚠️ **ECO-CONECTOR-4 DEJÓ ESCRITO POR QUÉ LA PREGUNTA ERA UN `confirm` NATIVO, Y ESA RAZÓN SE
RESOLVIÓ EN VEZ DE IGNORARSE.** Decía: «cuando esto corre, el modal de CeiboLink YA ESTÁ ABIERTO
mostrando el progreso, así que abrir el mismo modal encima lo pisaría y al volver no habría a qué
estado regresar». Ahora sí hay a qué volver: se guardan el título, el texto, el **cuerpo como un
fragmento de DOM** —así vuelve con sus oyentes— y los cinco botones con sus manejadores.

⚠️ **SI EL MODAL NO ESTABA ABIERTO, SE CIERRA AL CONTESTAR**: las dos puertas que convierten
píxeles crudos se alcanzan también desde el pendrive, donde no hay modal de progreso.

⚠️ **CERRAR CON LA ✕ O CON ESCAPE RESUELVE CON LA CADENA VACÍA**, y quien llama toma el lado
seguro. Un vigía de 120 ms mira el `display`, porque los dos caminos de cierre pasan por
`clnkAvisoCerrar`.

⚠️ **EL CUERPO SE VACÍA EN CADA APERTURA Y EN CADA CIERRE**: el modal se reusa para seis preguntas
distintas, y un cuerpo que sobreviviera mostraría la lista de archivos pesados dentro del aviso de
un equipo nuevo.

⚠️ **EL QUINTO BOTÓN SE INTERCALA EN EL ARREGLO Y NO SE PASA UN BOTÓN VACÍO EN SU LUGAR**, y eso lo
destapó un caso: `clnkAvisoAbrir` reparte por POSICIÓN, así que con un cuarto vacío el «Cancelar»
del pendrive caía en el quinto. Lo hace `dstPreguntar` con un `splice(3, 0, …)` condicionado a
`ctx.prev`.

---

## 5 · Los dos pesos y el umbral adaptativo (decisiones 4 y 5)

| qué | dónde |
|---|---|
| los dos pesos en una frase | `_dcmDosPesos` · `_dcmGuardadoEstimado` · `DCM_GUARDADO_DIV` |
| la memoria informada | `_dcmMemGiB` · gancho `window.__dcmMemTest` |
| el techo del montón | `_dcmHeapMB` · `DCM_HEAP_POR_GIB` |
| el presupuesto | `_dcmPresupuestoBytes` · `DCM_FRAC_HEAP`, `DCM_FRAC_RAM` |
| los dos topes | `_dcmTopeDuroCrudo` / `_dcmTopeBlandoCrudo` → `_dcmCrudoTopeDuro` / `_dcmCrudoTope` |
| la pregunta | `_dcmCrudoPreguntar` (async) · `_dcmCrudoNuevoLote` · `_dcmCrudoModoLote` |

**EL FACTOR DE LO GUARDADO ES 4 Y SALE DE DOS MEDICIONES, no de una**: el multicuadro sintético de
512×512 por 60 cuadros monocromo da 15,0 MB → 3,66 MB (÷4,1), y el del médico —1016×708 en color
por 171 cuadros— dio 351,9 → 54,3 MB (÷6,5, medido en ECO-CONECTOR-4). Se toma el divisor **más
chico**, que da la estimación más **grande**: pasarse por exceso hace que el médico espere más de lo
que ocupa; por defecto le promete un espacio que no alcanza. El texto dice «estimado».

**LO QUE SE MIDIÓ Y CORRIGE LA PROPUESTA DE LA ORDEN:**

- `navigator.deviceMemory` **existe** en el Chrome de la batería y devuelve **32** (GiB). Puede no
  existir en otros navegadores.
- **PERO EL TECHO QUE DECIDE SI LA PESTAÑA SE CAE NO ES ÉSE**: es el del **montón de JavaScript**,
  **4192 MB** en esta máquina de 32 GB (`performance.memory.jsHeapSizeLimit`). Una pestaña no se
  muere cuando se acaba la RAM: se muere cuando el montón pasa su techo, y ese techo lo fija Chrome
  por su cuenta. Reservar «una fracción de la RAM» sin mirar el montón daría 8 GB de presupuesto
  sobre un techo de 4.
- `performance.memory` es **sólo de Chrome**, así que hay respaldo: 256 MB de montón por GiB.
- **EL PICO ES 1,8 VECES LOS PÍXELES CRUDOS**: 622,5 MB de pico para 351,9 MB, medido por el médico.

La cuenta, en un solo lugar:

```
presupuesto = min( techo del montón × 0,5 , memoria del equipo × 0,25 )
tope duro   = presupuesto ÷ 1,8
pregunta    = tope duro ÷ 4
```

con piso en los dos: sin piso, un equipo de 1 GiB preguntaría por cualquier cineloop normal y el
cuadro de diálogo se volvería el que se aprende a cerrar sin leer.

**LA TABLA, MEDIDA llamando a estas funciones en el navegador:**

| equipo | techo del montón | pregunta | tope duro |
|---|---|---|---|
| 32 GiB (real) | 4192 MB publicado | 291 MB | 1164 MB |
| 32 GiB (sustituida) | 8192 MB estimado | 569 MB | 2276 MB |
| 8 GiB | 2048 MB estimado | 142 MB | 569 MB |
| 4 GiB (defecto) | 1024 MB estimado | 71 MB | 284 MB |
| 2 GiB | 512 MB estimado | 36 MB | 142 MB |
| 1 GiB | 256 MB estimado | 24 MB | 71 MB |
| sin dato | igual que 4 GiB | 71 MB | 284 MB |

Los dos valores de ECO-CONECTOR-4 —192 y 768 MB— **caen dentro del rango**: esto no es un salto, es
la misma política con el número sacado del equipo.

⚠️ **LAS CUATRO FUNCIONES DE TOPE NO SE LLAMAN EN CÍRCULO**: las dos «…Crudo» calculan su número sin
mirar al otro tope, y las dos públicas son las que los ordenan. Con `_dcmCrudoTope` llamando a
`_dcmCrudoTopeDuro` y éste a aquél —que es la forma natural de escribirlo— la pila se va al infinito
y el bloque de JS entero deja de servir.

⚠️ **CON LA MEMORIA SUSTITUIDA SE USA EL RESPALDO A PROPÓSITO**: lo que la batería prueba es la
política, y leer el techo REAL de la máquina donde corre haría que los cuatro escenarios dieran casi
lo mismo — el `min` lo decidiría siempre el montón.

**LA ELECCIÓN «PARA TODOS» VIVE POR TANDA Y NO POR SESIÓN**: una tanda es un gesto del médico, y
recordar su respuesta media hora después sería decidir por él. `_dcmCrudoNuevoLote` la borra y la
llaman las cuatro puertas que abren una tanda (vía `_dstJuntarAbrir`). Falla **cerrado**.

⚠️ **POR QUÉ NO SE PUEDE LISTAR DE ANTEMANO CUÁLES VAN A SER PESADOS**: el peso en píxeles vive en la
cabecera del DICOM y se conoce recién al bajarlo. Lo que sí se puede es que la PRIMERA pregunta
ofrezca decidir por todos, y con eso el médico contesta UNA vez aunque haya seis pesados.

Lo fijan **TC-874**, **TC-875** y **TC-876**.

---

## 6 · Un solo mensaje al final (decisión 4)

| qué | dónde |
|---|---|
| el juntador | `_dstJuntarAbrir` / `_dstJuntarCerrar` / `_dstAviso` |
| el resumen | `dstResumen({titulo, total, ok, esperando, origen, lineas})` |

Eran **dos** cuadros nativos y medido sobre el archivo podían ser **tres**: el `confirm` por archivo
pesado, el `alert` de rechazos de `mediosImportar`, el resumen de `dcmImgImportar` y el del propio
sumidero.

⚠️ **NO SE TOCA UN SOLO `alert` DE LA APP FUERA DE UNA TANDA.** `_dstAviso` llama al `alert` de
siempre si no hay tanda abierta, así que importar desde la pestaña Imágenes no cambia. Lo único que
cambia es que DENTRO de una tanda los textos se acumulan y los emite el sumidero una sola vez.

⚠️ **ARRIBA DEL TOPE DURO EL AVISO VA AL RESUMEN Y NO A UN CARTEL PROPIO**: no hay ninguna decisión
que tomar, así que interrumpir sería pedirle al médico que apriete «Entendido» para enterarse de algo
que el resumen le va a decir igual.

⚠️ **SI NO HAY NADA QUE CONTAR NO ABRE NADA**: un diálogo que diga «entraron las tres» es un clic que
no agrega información.

---

## 7 · La vista previa (decisión 6)

| qué | dónde |
|---|---|
| el botón del panel | `#cfg-clnk-acciones` → `clnkVistaPrevia()` |
| el botón del aviso | el quinto de `dstPreguntar`, con `ctx.prev` |
| la tira | `_clnkPrevPintar` · `CLNK_PREV_VISTA` (6) · `_clnkPrevGen` |
| una miniatura | `_clnkPrevMini` · `_dcmCrudoUnCuadro` |
| bajar sin confirmar | `_clnkPrevBajar` |
| abrir en grande | `clnkPrevAbrir` → `_cineAbrir` o `_clnkbVerFija('', …)` |
| el tope del archivo | `_clnkPrevTopeArchivo` · gancho `window.__clnkPrevTopeTest` |

⚠️ **MIRAR NO ES DECIDIR, Y ES LA INVARIANTE QUE TODO EL BLOQUE RESPETA**: no persiste nada, no
confirma nada en CeiboLink, no borra nada en CeiboLink y no agrega nada al estudio abierto. **No hay
una sola llamada** a `confirmar`, a `CeiboImg`, a `CeiboCine`, a `clnkbGuardar` ni a `imgSlots` en
ese bloque. Medido de **seis formas** en TC-878, con control **positivo**.

⚠️ **SE ABRE SÓLO CON UN BOTÓN QUE APRIETA EL MÉDICO.** Nada de esto corre en el sondeo: bajar
archivos es trabajo que nadie pidió, y una app clínica que se pone a bajar decenas de MB porque llegó
algo es la que el médico apaga.

⚠️ **DE A UNA Y EN SERIE**, con el mismo razonamiento que los tres sumideros. Entre una y la
siguiente se suelta todo menos la miniatura, que mide ~1 KB — **medido: seis miniaturas son 6.210
bytes y treinta son 31.050, con el montón moviéndose 0,03 y 0,07 MB sobre la base.**

⚠️ **HAY DOS PUERTAS Y LAS DOS SE DECLARAN.** La lista del contrato trae `bytes`, que es el tamaño
del **archivo** tal como viaja, y `tipo`: con eso se dibuja la marca, el peso y la hora **sin bajar
un byte**. Lo que la lista **NO** dice son los píxeles sin comprimir, que es con lo que la decisión 5
mide si un archivo es pesado — ese número vive en la cabecera. Por eso:

1. **antes de bajar**, por el tamaño del archivo (`_clnkPrevTopeArchivo`);
2. **después de leer la cabecera**, por los píxeles (`_dcmCrudoTope`).

Las dos terminan en lo mismo: la marca, el peso y un botón «Mirar igual».

⚠️ **UN SOLO CUADRO PARA LA MINIATURA.** `_dcmCrudoUnCuadro` hace una copia superficial del
descriptor que declara UN cuadro y apunta a los píxeles del primero —`subarray` no copia bytes— y le
pasa eso al **mismo** convertidor. No hay un segundo decodificador: lo que cambia es cuánto se le da
de comer. Y **no puede disparar la pregunta del archivo pesado**: quien llama ya comparó los píxeles
TOTALES contra el umbral.

⚠️ **NO HAY VISTA PREVIA PARA UN EQUIPO EN CUARENTENA**, y no por un filtro de esta función: la lista
del contrato §3.8 **no expone** esas imágenes. Seguridad por construcción.

⚠️ **EL VISOR DE UNA FIJA ES EL MISMO LIGHTBOX DE LA BANDEJA, CON SUS DOS ACCIONES APAGADAS**: con
`idEnvio` vacío, `_clnkbVerFija` no dibuja «Asignar este envío» ni «Borrar el envío» —una imagen de
la vista previa no está en la bandeja— y el pie dice que sigue esperando en CeiboLink.

Lo fijan **TC-877** y **TC-878**.

---

## 8 · El modo elegir de la galería (decisiones 7a, 7b, 7c y 10)

| qué | dónde |
|---|---|
| quitar slots sueltos | `CeiboImg.quitar(uuid, idxs)` |
| el modo | `_igElegir` · `igElegirModo(on)` |
| la selección | `_igSel` · `_igSelPos` · `igSelToggle` · `_igSelLista()` |
| la cuenta y los orígenes | `igSelCuenta(lista)` · `igSelOrigenes(lista)` |
| la columna | `igSelSidePintar` · `_igSelBtn` · `#ig-sel-res` · `_igSelHint` |
| eliminar | `igSelEliminar(lista)` |
| adjuntar | `igSelAlAbierto(lista)` · `igSelAGuardado(lista)` · `_igSelJuntar(lista)` |
| desde el visor | `igVisorAdjuntar` · `#ig-imgv-adj` |

⚠️ **`CeiboImg.quitar` NO EXISTÍA.** Medido en la Tarea 0: los **catorce** métodos de ese almacén y
ninguno quita un slot — `guardar` reemplaza el juego completo con lo que haya en `imgSlots` (o sea
que sólo sirve desde el formulario del estudio abierto), `borrar` se lleva el estudio entero y
`marcar` sólo parchea las marcas.

⚠️ **LOS ÍNDICES SON LOS DE `indice()`**: primero los slots y después los esquemas. Es el mismo
acuerdo que `marcar()` respeta, y es el único lugar donde podría romperse: con el orden invertido,
el médico elige la imagen 7 y se borra otra — y las dos son imágenes válidas del mismo estudio, así
que nada lo delataría.

⚠️ **LAS MARCAS NO SE CORREN DE LUGAR**: la estrella y la nota viven DENTRO del slot, así que viajan
con él. Lo que sí cambia es el **número** de cada slot, y por eso quien llama invalida el índice y
limpia `_igImgTapas`, que está indexada por posición.

⚠️ **SE BORRA EL REGISTRO SI NO QUEDA NADA**, igual que `guardar`. **EL ESTUDIO NO SE TOCA**: su
informe, sus campos, su paciente y su fecha siguen donde estaban, y la app lo **dice** —sin esa
frase, el médico que borra la última imagen y ve el estudio desaparecer de esta pantalla concluye que
borró el estudio—.

⚠️ **NO TOCA LAS COPIAS EN OTROS ESTUDIOS**: cada estudio tiene su propio registro y su propia copia
del `dataURL`. Es cierto **por construcción**, no por cuidado.

⚠️ **SI EL ESTUDIO ESTÁ ABIERTO, LA IMAGEN TAMBIÉN SALE DEL FORMULARIO, Y SIN ESTO VOLVÍA.**
`CeiboImg.guardar` reemplaza el juego con lo que haya en `imgSlots`, así que borrar del disco y
guardar después el estudio la reescribía: **el borrado se deshacía solo y en silencio**. Y se saca
**por su CONTENIDO y no por su índice**: `imgSlots` puede tener huecos y no lleva los esquemas, así
que su posición N no es la posición N del disco.

⚠️ **EL MARCADO SE REUSA Y NO SE DUPLICA**, que es lo que la Tarea 0 fue a medir: la galería **ya**
tenía un modo elegir —el del PPT— con su clase `.ig-img-th.sel`, su globo `.ig-img-ord` y su
enrutado del toque en `igImgThClic`. Esta tanda agrega una **segunda** selección que usa las mismas
tres cosas.

⚠️ **LOS DOS MODOS SON EXCLUYENTES**: el toque sobre una miniatura tiene UN solo significado.
Prender uno apaga el otro y **suelta** su selección, por lo mismo que apagar «Armar PPT» ya la
soltaba.

⚠️ **ACÁ SÍ ENTRAN LOS CINELOOPS**, al contrario que en el modo PPT: eliminar, copiar y exportar un
cineloop es lo que el médico pidió. Por eso la entrada de la selección tiene `cineId` además de
`idx` — un cineloop no tiene posición en la grilla de slots, vive en otra base.

⚠️ **ADJUNTAR COPIA Y NO MUEVE**, siempre: el original se queda. Es la decisión del médico —«si
quiere sacarlo del original, lo elimina después»— y es lo que hace que un error acá no cueste nada.
Las fijas entran por la **puerta única** `mediosImportar` (el `dataURL` envuelto en un File); los
cineloops por la **cola**, con `_cinePuedeGuardar`, que es el MISMO predicado del importador de
DICOM. Lo que cuesta, declarado: la imagen se vuelve a comprimir, así que la copia pesa un poco
menos.

⚠️ **LOS ESQUEMAS NO SE COPIAN Y SE CUENTAN PARA PODER DECIRLO**: un esquema lo dibuja la app con
los datos de SU estudio, así que copiado a otro sería un dibujo de los datos de otra persona con la
etiqueta de ésta.

⚠️ **LAS TRES FUNCIONES RECIBEN LA LISTA POR PARÁMETRO** y no leen `_igSel`: es lo que permite que
«Adjuntar a…» del visor las reuse con una lista de UNA sola entrada. Con un camino propio ahí habría
dos formas de copiar una imagen a un estudio.

⚠️ **EL AVISO DE LA COLUMNA SE GUARDA ADEMÁS DE ESCRIBIRSE** (`_igSelHint`): `#ig-sel-res` lo
reconstruye la columna en cada pintado, y el pintado de esta pantalla es **asíncrono** —`igImgPintar`
sale temprano y se vuelve a llamar cuando el índice está leído—, así que un aviso escrito justo antes
de un repintado desaparecía. Lo destapó un caso.

Lo fijan **TC-879** y **TC-880**.

---

## 9 · Exportar, importar y «Desde imágenes guardadas» (decisiones 7d, 8 y 9)

| qué | dónde |
|---|---|
| exportar la selección | `igSelExportar(lista)` · `_igSelPesoEstimado` |
| el tope | `BK_TOPE_BYTES` (**460 MB**, no 512) · `BK_FORMATO` |
| importar en la galería | el botón de `igSelSidePintar` → `mediosPick(true)` |
| desde el estudio | `#img-desde-guardadas` → `imgDesdeGuardadas()` |

**SE REUSA EL SOBRE DEL BACKUP QUE YA EXISTE**: el mismo `_ecosmart_backup`, el mismo `nivel` y el
mismo mapa `medios` por uuid, así que el archivo se puede volver a **importar** con el importador que
la app ya tiene, sin escribir un segundo formato y sin tocar el importador.

⚠️ **EL TOPE SON 460 MB Y NO 512, Y ESO CORRIGE LA ORDEN**: `BK_TOPE_BYTES` vale 482.344.960 bytes,
medido. No se cambió.

⚠️ **EL NIVEL SE ELIGE SOLO**: con cineloops entre lo elegido es «completo», porque es el único nivel
cuyo sobre los lleva. Con un nivel fijo, exportar un cineloop daría un archivo que se importa sin él
y en silencio.

⚠️ **VA LA FICHA COMPLETA DEL ESTUDIO DE ORIGEN, QUE ES MÁS DE LO QUE EL MÉDICO ELIGIÓ.** El mapa
`medios` está indexado por uuid de estudio y el importador adjunta cada bloque al estudio que está
importando: sin la ficha, el archivo trae imágenes que no pertenecen a nada y no se importan. Es
estructural del formato, **el aviso lo dice con todas las letras** y queda declarado en
`docs/PENDIENTES.md` → **EC5-f**.

⚠️ **NO SE PARTE EN VARIOS ARCHIVOS, Y SE DICE POR QUÉ**: partir obligaría a que el importador sepa
juntar las partes, y ese importador es el mismo que restaura los backups del médico. Se rechaza con
el número y se dice cómo seguir.

⚠️ **«Importar» NO ESCRIBE UNA TERCERA COPIA DE LA PREGUNTA DE DESTINO**: llama a `mediosPick(true)`,
exactamente lo mismo que la opción del menú de Guardados, así que la pregunta —al estudio actual, a
uno guardado, a «Sin estudio», Cancelar— es LA MISMA función y no puede divergir. **Cero código
nuevo.**

⚠️ **VAN EN LA COLUMNA DE LA GALERÍA Y NO EN LA FILA DEL CONTADOR**, donde están los de Informes
guardados: esa fila —`#ig-io-acciones`— **se esconde** al entrar a esta vista, medido en `igImgSync`,
y es por eso que la galería no los tenía.

⚠️ **«Desde imágenes guardadas» NO PISA NI UN DATO DEL PACIENTE**: lo único que toca es `imgSlots`,
por la puerta única. Es cierto por construcción — en todo ese camino no hay una sola escritura a un
campo del formulario.

Lo fija **TC-881**.

---

## 10 · El conector falso de esta tanda

`scripts/_conector_falso.mjs` gana **nueve escenas** y un flag:

| escena | para qué |
|---|---|
| `deAyer` / `deHoy` | la fecha de la decisión 3, construida sobre la **fecha local** |
| `previa` | tres fijas, dos videos y UNA pesada |
| `previaOcho` | ocho del mismo envío: con seis no se distingue «entran todas» de «desborda» |
| `previaConFallo` | tres, con la del medio en `bajarFalla` |
| `soloCuarentena` | la lista del contrato §3.8 sale VACÍA |
| `paraGaleria` 1/2/3 | los tres estudios de las decisiones 7a y 7c |

`bajarFalla` es una **lista de ids** y no un booleano: con un booleano global fallan las tres
descargas y no se puede distinguir «siguió con las otras» de «se cayó todo». El archivo da 503 y la
imagen **sigue** en la lista.

⚠️ **TODAS LLEVAN IDS PROPIOS**, por quinta vez: el aviso no vuelve por las MISMAS imágenes en la
misma sesión y la batería corre los 889 casos en UNA página.
