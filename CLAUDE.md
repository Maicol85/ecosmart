# EcoSmart — trampas de este archivo

Leer esto antes de tocar `index.html`. Son cosas que ya costaron una sesión cada una;
ninguna es evidente leyendo el código alrededor.

## Arquitectura

- **Un solo archivo**, **1,75 MB / 31.233 líneas** (medido 2026-09-08). HTML + CSS + JS
  inline, sin build, sin dependencias externas más allá de jsPDF, XLSX y PptxGenJS por CDN.
  No confundir con los **1,24 MB / ~21.000 líneas del JS extraído**, que es lo que escanea
  Semgrep: `scan.py` saca el JS de los `<script>` antes de analizar, así que sus números de
  línea NO son los del archivo. Para ubicar un hallazgo hay que buscar el fragmento con
  `grep`, no sumarle un offset.
- **`CeiboStore` es el borde de confianza para los id de informe.** El saneo va ahí, no en
  las plantillas: cinco funciones leen `CeiboStore.getLocal()` directo sin pasar por
  `getInformes()`, así que arreglar `getInformes` deja esas cinco afuera, y una plantilla
  nueva reabre el agujero.
- **`amiloSanPDFml` es la función correcta para texto multilínea en el PDF.** `amiloSanPDF`
  es la de una sola línea.
- **El extractor de JS falla siempre en los bloques 0 y 1.** Cualquier chequeo de sintaxis
  que los recorra va a reportarlos como rotos y no lo están: es el extractor, que corta mal
  por un `</script>` dentro de una cadena. Comparar SIEMPRE contra HEAD antes de creerle a
  un resultado. `CeiboStore` vive en el **bloque 8**, que sí se valida.

## Trampas

### `amiloSanPDF` borra los `\n`
Su catch-all es `[^\x20-\xFF]`, o sea que se lleva puesto el salto de línea, y además
termina en `.trim()`. Aplicada de una pasada a `informeTxt` o `sumaTxt` —que son
`inf.join('\n')`— pega todos los párrafos en un bloque corrido. Usar **`amiloSanPDFml`**,
que sanea línea por línea y conserva la sangría.

### `render()` sale temprano
Tiene un `if(!tablExpanded) return;` antes de poblar `tbody`. Un test que mida `#tbody` con
la tabla colapsada da **cero handlers y cero scripts sobre un contenedor vacío**: falso
negativo perfecto. Poner `tablExpanded = true` y mostrar `#tbl-wrap` antes de medir, y
contar las filas para confirmar que hay denominador.

### `renderSeguimientoLista` lee por clave de paciente
No hay ninguna global `coSeguimiento` que sirva para el test: la función arma la clave con
`_coPacienteKey()` a partir del nombre/documento cargado y busca `co_seguimiento[clave]`.
Setear una variable global no ejerce el sink; hay que setear `#nombre`, pedir la clave y
escribir el store indexado por ella.

### `typeof` sobre un `const` en zona muerta **lanza**
No devuelve `'undefined'`. Si una sentencia de nivel superior hace `typeof X` y `X` es un
`const` declarado más abajo, tira `ReferenceError` — y al ser nivel superior se lleva puesto
todo el resto del bloque `<script>`. Como las funciones se hoistean, la app arranca con la
interfaz completa y sin estado, sin más rastro que una traza. Ya pasó con `DCM_RANGO`.
Solución: función perezosa que resuelva en la primera llamada, o mover la declaración.

### Los reemplazos por rango de líneas son peligrosos
Usar **siempre anclas de texto único** y `assert` de que la ancla aparece exactamente una
vez. Un reemplazo por índice borró 106 líneas —`_lsLocal`, `_lsChunks`, `_lsGuardar`,
`_idbGuardar`, `_idbLeer`, `_abrir`: la capa de persistencia entera— y **`node --check` lo
dio por bueno**, porque sólo valida sintaxis y el archivo seguía siendo JS válido. Se
detectó recién en el navegador, con `CeiboStore` dando `undefined`. Después de un cambio
grande, mirar `git diff` y contar las líneas eliminadas.

### `getLocal()` devuelve una copia **superficial** (desde 2026-09-08)
Antes devolvía el array vivo y un `push()` directo esquivaba el saneo de id. Ahora
`getLocal()`/`getChunk()` hacen `.slice()`, así que **mutar el array devuelto no hace nada**.

Lo superficial es deliberado: **los objetos se siguen compartiendo**. Un `.find()` devuelve
el informe real, se puede mutar y se persiste con `setLocal`, que vuelve a pasar por
`_sanearIds`. Una copia profunda rompería eso y además clonaría las imágenes en base64 de
cada estudio en cada llamada.

Lo que se cerró es la mutación del **array** (push/splice/length). Si necesitás cambiar la
lista, andá por `setLocal`/`setChunk`.

### Eco Estrés: `ee*` NO identifica el módulo, y el IIFE no es viable
Se quitó el export explícito de `window.eeIncluirPDF` el 2026-09-08. Eso **no** volvió
inalcanzable la función: una declaración de función en nivel superior de un `<script>`
clásico ya crea la propiedad en `window`, así que `typeof window.eeIncluirPDF` sigue dando
`'function'`. El export era redundante.

**Envolver "el bloque" en un IIFE no se puede** (analizado 2026-09-08). No hay un bloque:
son **73 declaraciones `ee*` en cinco clusters entre las líneas 7437 y 30207**, con **599
funciones ajenas intercaladas**. Y peor, el prefijo miente: en este archivo `ee` es tanto
*Eco Estrés* como *EcoSmart ETT*. `eeGetMode`, `eeGetModules` y `eeModOn` (cluster
30162-30207) son la **configuración de modo básico/avanzado de la app**, van de la mano de
`cfgSetMode` y alimentan el selector «Sección avanzada»; encerrarlas apagaría esa función.
Un wrap mecánico por prefijo rompe la app.

Lo que **sí** se hizo, y cierra el riesgo real: el gate del PDF exige ahora que el toggle
`ee-incluir-pdf` **exista en el DOM**, además de la bandera. Como la interfaz se retiró, la
condición no puede dar verdadero, y vuelve sola el día que se restaure la UI —sin dejar un
booleano que alguien tenga que acordarse de invertir—. Verificado forzando
`ecoestres_incluir_pdf='1'` y generando el PDF: la sección no sale.

El riesgo que esto cerraba era concreto: llamar `eeIncluirPDF()` a mano ponía la bandera, la
limpieza sólo corre al arrancar, y el PDF podía estampar una sección «ECO ESTRÉS» con los 17
segmentos en NORMAL sobre un estudio donde no se hizo ninguno. **No re-agregar el export.**

### `badge(cls, txt)` — verificar la allowlist contra el CSS
La lista de clases permitidas tiene que salir de `grep` de las clases `.badge-*` que
realmente existen, no de suponerlas. Una primera versión omitió `orange` y `yellow` —57
llamadas— y las habría pintado de gris: un badge de alerta degradado a uno neutro es una
regresión de señal clínica, no un detalle visual.

### `disabled` no sobrevive a la reimpresión — no lo uses como compuerta de contenido
`.checked` se persiste (`<id>__chk`) y las tres rutas de restauración lo reponen. **`disabled`
no**: no está en el HTML, `guardarInforme` no lo guarda y nadie lo repone. Y lo que lo baja es
un recálculo (`calcEM`) que **no corre en la reimpresión** —ahí los campos se llenan asignando
`.value`, y eso no dispara `oninput`; `calcEM` tampoco está en la lista de recálculos de
`_pdfDeInformeGuardadoArmar`—.

Resultado medido: un `c.checked && !c.disabled` hacía que, después de un «Nuevo estudio»
—que deja `disabled=true`—, reimprimir un informe guardado con la continuidad marcada saliera
**sin** continuidad. Distinto del que se firmó, sin ningún aviso. Gatear por el **dato** (¿hay
valor?), nunca por el estado visual del control. Hay regla Semgrep:
`ceibo-checked-gateado-por-disabled`.

### `__chk` presente ≠ «el médico decidió»
`guardarInforme` barre **todos** los `input[type=checkbox][id]` y escribe la clave siempre, con
`'0'` incluso para un control que nunca se mostró. Inferir una decisión de que la clave exista
hace que, desde el primer guardado, todo estudio la traiga y el comportamiento «auto» muera al
reabrir. Si hace falta distinguir «no» de «no decidió», va **bandera propia** (acá:
`<id>__tocado`), persistida y restaurada aparte.

### Una bandera booleana no puede representar dos decisiones opuestas
`dataset.tocado` empezó significando «el médico decidió» y gobernaba el auto-marcado del
selector de AVm. Como la rama «sin valor» de `_emPdfChk` desmarcaba incondicionalmente, y el
`oninput` de un campo pasa **siempre** por `''` al corregir una medida con backspace, la
bandera protegía el «no» del médico y **destruía su «sí»**: al volver el valor ya no re-marcaba,
y «Sobreescribir» persistía la pérdida como un «no» que nadie había dado. Hoy la rama sin valor
respeta la bandera en los dos sentidos, y el gate real es el número en `emAvmPdfVal`.

Y se separó en **dos** banderas: `tocado` («el médico decidió», es lo único que se persiste) y
`desdeEstudio` («esta carga ya trae respuesta», muere con la sesión). Con una sola, reabrir un
estudio y volver a guardarlo promovía `__tocado` a `'1'` sin intervención de nadie, y la clave
dejaba de significar lo que dice su nombre.

### `('0','0')` es ambiguo: distinguir «dijo que no» de «no había valor»
`guardarInforme` barre **todos** los checkbox y escribe la clave siempre, así que un `__chk='0'`
puede venir de un control que nunca se mostró. Para decidir si respetar ese `'0'` se mira si el
**estudio trae el número** (`avm_cont`, `avm_plan`/`avm_ete`) — dato que ya está persistido, sin
clave nueva. Con valor el `'0'` es una respuesta real; sin valor sólo dice «no había nada que
incluir» y el auto-marcado sigue vivo.

Usar `> 0` y no `!isNaN`: un `"0"` parsea a 0 y daría «hay valor», pero `calcEM` y `emAvmPdfVal`
lo tratan como ausencia por truthiness. Criterios distintos sobre el mismo dato = casilla
congelada sobre un estudio que sí tenía medición.

### Reimprimir y editar+regenerar tienen que dar el mismo PDF
No divergen al cargar —**ninguno de los dos caminos llama `calcEM`**—, sino después: en la
sesión de edición el médico **tiene** que abrir la píldora de estenosis mitral (`limpiarCampos`
oculta los bloques y borra `valv-pill-*`), y ese clic dispara `calcEM`, que es lo único capaz de
mover un `.checked` sin que nadie lo toque. Cualquier estado que gobierne contenido impreso y se
recalcule ahí tiene que estar congelado antes.

Queda **una divergencia intencional**: un estudio anterior al selector (o importado) no trae las
claves, así que al reimprimirlo sale sólo THP y al editarlo corre el auto-marcado. Es correcto
—nunca hubo un PDF firmado con este selector— pero es una decisión, no un descuido.

### Un comentario mío rompió el bloque `<script>` entero
Al insertar texto de comentario justo después de un `*/` quedó fuera del comentario y el bloque 8
—donde vive `CeiboStore`— dejó de parsear: **DOM completo, todo el JS `undefined`**, y la consola
del preview no mostró nada. Es el mismo síntoma que describe la sección del TDZ.
Chequeo que lo detecta, y que hay que correr **comparando contra HEAD** porque los bloques 0 y 1
fallan siempre por el extractor:
```bash
node -e "const s=require('fs').readFileSync('index.html','utf8');
const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0;
while((m=re.exec(s))){try{new Function(m[1]);}catch(e){console.log(i+': '+e.message);}i++;}"
```
Sólo 0 y 1 deben aparecer. Cualquier otro bloque en la lista es código muerto.

### Nunca borrar localStorage sin fusionar
`_lsBorrar()` sólo puede correr **después** de escribir en IndexedDB y **verificar** la copia.
El caso que costó el arreglo:

> Sesión N: migración hecha, IndexedDB con todo, localStorage vacío.
> Sesión N+1: `_abrir()` tarda más de 3 s —disco frío, otra pestaña, perfil privado— y el
> timeout degrada la sesión a localStorage de forma **irreversible**: el guard `listo` descarta
> el `onsuccess` posterior, así que una apertura simplemente lenta arruina la sesión entera. La
> lista de Guardados aparece **vacía**, indistinguible de «no hay estudios». El médico trabaja
> igual y lo que guarda va a localStorage.
> Sesión N+2: IndexedDB abre bien, `enIDB` trae los viejos, y el `if (restos) _lsBorrar()`
> —cuyo comentario decía «sobras de una migración cortada»— **borraba el estudio nuevo**. Sin
> fusionar y sin ningún aviso.

`restos > 0` no distingue una sobra de una escritura nueva y única. Hoy lo resuelve
`_fusionarDesdeLS()`: unión por id, desempate por **`fecha_guardado` más nueva** (empate y
fecha ilegible los gana IndexedDB), y el disco se libera sólo con la copia confirmada. Si la
verificación falla, `fusionPendiente:true` y localStorage queda intacto para el próximo arranque.

**No usar «localStorage siempre gana».** Fue la primera versión de este arreglo y estaba mal por
una premisa falsa: que si hay IndexedDB migrado, lo que esté en localStorage se escribió después.
`_persistir` la desmiente — cuando IndexedDB **rechaza** una escritura cae a
`_lsGuardar(local, chunk)` con `_db` **no nulo**, o sea en sesión normal, y no vuelca el estudio
nuevo sino **la caché entera**. localStorage queda con una foto completa de la base, y nada la
limpia hasta el arranque siguiente. Con esa regla, un fallo transitorio de IndexedDB a las 10:00
hacía que al otro día la fusión pisara los 60 estudios con la versión de las 10:00 — las
ediciones de toda la jornada revertidas, y en silencio, porque el aviso colgaba de `agregados` y
ahí `agregados` vale 0. **Un rollback de la base entera es peor que el bug original.**

Contrapartida asumida: la unión no tiene tombstones, así que un estudio borrado durante una
sesión con respaldo **vuelve a aparecer**. Se eligió ese lado a propósito —resucitar se deshace
borrando otra vez; perder no se deshace— y el aviso lo dice en vez de anunciar sólo «sincronizado».

### `uuid` es la clave estable; `id` es sólo el índice numérico interno
**Todo recurso externo —imágenes, adjuntos futuros— se cuelga del `uuid`, nunca del `id`.**
`id` lo reescribe `_sanearIds` en cada lectura/escritura si es inválido o duplicado, y los
importadores lo reasignan ante colisión: lo indexado por `id` se orfanaría solo, sin que nadie
borre nada. `estudioId` es más estable pero viene `undefined` en los importados de Excel/DICOM
y en los backups viejos.

El `uuid` se genera una vez y **no se modifica nunca**. Las reglas que lo sostienen:

- **`_sanearIds` sólo lo asigna si falta**, jamás lo pisa. Es el borde por el que pasan las
  cinco vías de entrada (JSON, Excel, DICOM, escritura directa, lectura cruda de
  localStorage/IndexedDB); `validarInformeImportado` cubre **una** sola.
- **La migración perezosa hay que PERSISTIRLA.** `_sanearIds` asigna en memoria; si el arranque
  no escribe, el uuid muere con la pestaña y la sesión siguiente genera otro para el mismo
  estudio. En una sesión de sólo consulta —abrir, mirar, colgar imágenes— eso deja los recursos
  huérfanos sin que nadie edite ni borre. Por eso el arranque fuerza una escritura cuando
  `_uuidAsignados > 0`.
- **«Sobreescribir» conserva el uuid del registro existente**, tanto en `guardarInforme` como en
  el import modo «sobre». Es la misma ficha con datos corregidos; tomar el uuid entrante
  desconectaría sus imágenes por la vía más frecuente de todas.
- **El alta por import deduplica el uuid** contra la base y regenera ante colisión. Reimportar
  el mismo backup en modo «todos» dejaría dos fichas con el mismo uuid, que rompe la clave igual
  que si cambiara.
- **`uuid` tiene que estar en `_INF_CAMPOS_PERMITIDOS`.** La validación rechaza el informe
  **entero** ante un campo desconocido, así que sin esa entrada cualquier backup exportado desde
  esta versión sería irrecuperable: el archivo se ve bien y el import dice «formato inválido».

**No es único a nivel global, y no puede serlo:** `_local` y `_chunk` contienen legítimamente la
misma ficha, así que dos registros con el mismo uuid son **una** ficha con dos representaciones.
Cualquier recolector de imágenes huérfanas tiene que deduplicar por uuid antes de decidir, o va
a creer que un recurso quedó sin dueño porque borró una de las dos copias.

`crypto.randomUUID()` exige **contexto seguro**: no existe en `http://192.168.x.x` (la LAN del
sanatorio, que es un modo de uso real), ni en Safari/iOS anterior a 15.4. El fallback baja a
`getRandomValues` —que no está gateada y el archivo ya usa en `_dcmUID`— y sólo como último
escalón a `Math.random`. Los uuid del fallback llevan prefijo `x` para distinguirlos al depurar.

### Las imágenes viven en `CeiboImg`, una base de IndexedDB APARTE
Base `ceibomed_img`, store `imagenes`, clave = `uuid` del estudio. **No** es un object store más
dentro de `ceibomed`, y eso es deliberado: agregar un store ahí exige subir `DB_VER`, y `_abrir()`
resuelve `null` ante `onblocked` — o sea que con **dos pestañas abiertas**, que es lo habitual, el
upgrade se bloquea y la tienda de **estudios** cae a modo respaldo. Una base nueva no versiona la
vieja, y el barrido por clave de `_idbGuardar` no puede alcanzarla ni por error.

Falla cerrado: sin IndexedDB no hay imágenes persistidas y la app funciona como antes. **No hay
respaldo a localStorage** a propósito — cada imagen son decenas de KB en base64 y reventaría la
cuota, con el agravante de que `_lsGuardar` borra los chunks antes de saber si puede escribirlos.

**`imgRestaurar` es AUTORITATIVA: el estudio abierto manda sobre lo que haya en pantalla.**
Antes salía sin tocar nada cuando el estudio no tenía imágenes guardadas, «respetando lo que el
médico tenga en pantalla». Esa premisa valía cuando `imgSlots` sólo podía contener lo que él
hubiera cargado a mano; desde que las imágenes se restauran solas dejó de valer, y quedaba una
fuga entre pacientes **reproducible en dos clics**: abrir el estudio A (con imágenes), abrir el B
(sin ellas), y el formulario de B se quedaba con las ecografías de A — que iban al PDF firmado de
B y, al guardar, quedaban persistidas bajo el uuid de B para siempre. Medido y reproducido.

La única excepción es que la **lectura falle**: por eso `CeiboImg.leer` devuelve `null` cuando no
se pudo leer y `[]` cuando el estudio genuinamente no tiene. Con un solo valor para las dos
cosas, un error transitorio se traducía en «no tiene imágenes» y aguas abajo en un borrado.

**Toda lectura lleva token de generación** (`_imgGen`). La primera del arranque paga la apertura
de la base —hasta 3 s— y ni `editarInforme` ni `cargarEstudioPorId` la esperan: sin el token, una
restauración en vuelo aterrizaba sobre el paciente siguiente o sobre un «Nuevo estudio».

**`imgPersistir` no borra por omisión.** `imgSlots` vacío al guardar sólo borra si el médico
tocó las imágenes (`_imgEditado`). Sin esa bandera, dos situaciones que no son una decisión suya
destruían lo guardado: la ventana de reimpresión —que vacía `imgSlots` ~600 ms y `guardarInforme`
no tiene guard de reentrada— y una lectura fallida. Además se aborta si `_pdfGuardadoEnCurso`.

**Apagar el toggle NO borra.** Sería destruir dato clínico por cambiar una preferencia, sin
confirmación. El toggle es prospectivo y el borrado es un botón explícito en Config que dice
cuántos estudios afecta y que no hay backup posible. El commit anterior afirmaba lo contrario y
el código no lo hacía: el interruptor mentía sobre el disco.

**El borrado es por recolector, no por camino.** `imgRecolectarHuerfanas()` compara contra el
conjunto vivo de uuid en vez de engancharse a cada una de las diez vías de borrado: la que se
olvide deja huérfanos, y mañana hay una más.

La guarda va sobre el **estado del store**, no sobre el largo de la lista: exige
`CeiboStore.lista()`, `modo() === 'indexedDB'` y que **ningún estudio vivo carezca de uuid**. La
primera versión sólo cubría el caso «lista vacía» y encima era casi tautológica —`getInformes()`
es la unión de los dos baldes—. Lo peligroso no es la lista vacía sino la **parcial**: un arranque
degradado deja la caché con 2 estudios mientras IndexedDB tiene 60, y borrar uno de esos dos
recolectaba las imágenes de los otros 58 — que no están en ningún backup.

Las vías que sólo reescriben el `id` (`_sanearIds`, `_nuevoIdUnico`) **ya no orfanan nada**,
porque la clave es el uuid. Ése era todo el punto de agregarlo.

### Los caminos que borran o reasignan un estudio
Cualquier cosa que se cuelgue del `id` de un estudio —imágenes, adjuntos, notas externas— tiene
que considerar estos diez. **No indexar por `informe.id`**: lo reescribe `_sanearIds` y lo
reasigna el importador.

| # | Camino | Qué hace |
|---|---|---|
| 1 | `eliminarInforme` (21084) | filtra y `setLocal`/`setChunk` |
| 2 | `eliminarInformeYVolver` (23236) | **copia literal del anterior**; enganchar uno solo deja huérfanos por el otro |
| 3 | `limpiarTodosInformes` (21097) | `setLocal([])` + chunk vacío — borra todo |
| 4 | `importEjecutar` modo «sobre» (21259) | conserva el id y **reemplaza el contenido**: lo colgado queda atado a un estudio que ya es otro |
| 5 | `importEjecutar` + `_nuevoIdUnico` (21258) | ante colisión el estudio entra con **id nuevo** |
| 6 | `guardarInforme` «Sobreescribir» (20129) | reemplaza conservando `id` y `estudioId` |
| 7 | `guardarInforme` «Guardar como nuevo» | `id` y `estudioId` **nuevos** |
| 8 | `_sanearIds` | **cambia el `id`** en cada lectura/escritura si es inválido o duplicado — orfaniza sin que nadie borre |
| 9 | `_idbGuardar` (19910) | barre por clave todo lo que tenga `app:'eco'` y no esté en el lote |
| 10 | `_lsBorrar` (19837) | hoy sólo tras `_fusionarDesdeLS` con copia confirmada |

`estudioId` es más estable que `id` —se preserva al sobreescribir y es lo que usa el QR— pero
viene `undefined` en los importados de Excel/DICOM y en los backups viejos.

### `toast()` clasificaba emoji como error
La heurística usaba la clase `[⚠️❌🚫]`, que descompone los emoji en unidades UTF-16: la clase
terminaba conteniendo el surrogate alto `U+D83D` (de `🚫`) y marcaba como error **cualquier**
emoji de ese rango — `💾`, `🔄`, `📝`. Los avisos informativos salían con `role="alert"` y
`aria-live="assertive"`, interrumpiendo al lector de pantalla. Va con **alternancia**
(`/⚠️|❌|🚫|…/`), no con clase de caracteres. Vale para cualquier regex de emoji en este archivo.

### La base de procedencia del informe es lo GENERADO, no lo que quedó en pantalla
`_infBase` contesta «¿qué escribió la app?». Devolverle la salida **fusionada** —que es lo
natural, porque es lo que tiene el textarea— mete las líneas del médico dentro de la base, y en
el refresco siguiente `actual === base` dispara el atajo de «sin ediciones» y las borra todas.
La protección dura entonces **un solo refresco**, que es peor que no tenerla porque parece
funcionar. Pasó dos veces en la misma sesión, por dos caminos distintos:

- promoviendo la salida cuando **no había base** (el médico tipea antes de generar), y
- promoviendo la salida fusionada en el **flujo normal** (generar → editar → dos cambios de dato).

Al probar un merge, **encadenar al menos dos regeneraciones seguidas**. Con una sola pasada los
dos defectos daban verde.

### Las imágenes se vacían en «Nuevo estudio», NO en `limpiarCampos`
`limpiarCampos` también lo llama `editarInforme`, y las imágenes **no se persisten con el
estudio**: borrarlas al reabrir un informe para corregirlo destruye dato que no se puede
recuperar de ningún lado. El vaciado (`imgVaciar()`) va en `neGuardarYContinuar` y
`neContinuarSinGuardar`, que son los dos caminos de «Nuevo estudio».

Se muta el array **en sitio** (`length=0; push(null,null)`): el backup de la reimpresión es un
`slice()` y repone mutando en sitio también, así que los dos tenedores tienen que hablar de la
misma identidad de array.

### Un `onclick` inline infla el elemento a 44×44
La hoja de estilos trae una regla de área táctil:
`button, [role="button"], .btn, .tab-btn, .nav-tab, .chip, .cal-cell, .seg-cell, [onclick] { min-height:44px; min-width:44px }`.
Matchea por el **atributo**, no por el tipo de elemento: poner `onclick=` en un checkbox lo
agranda a 44×44 —tres veces los de al lado— y rompe la fila. Si sólo hace falta reaccionar al
cambio, usar `onchange`.

### Una regla Semgrep nueva se verifica contra el código que la originó
La primera versión de `ceibo-checked-gateado-por-disabled` daba 0 hallazgos y parecía calibrada.
No matcheaba el caso real: `!!(c && c.checked && !c.disabled)` asocia a la izquierda, así que el
operando izquierdo del `&&` externo es `(c && c.checked)` y el patrón `$C.checked && !$C.disabled`
no aplica. Antes de dar por buena una regla, correrla sobre un archivo con el defecto **y** con
la versión corregida, y confirmar que distingue. Cero hallazgos suele ser un patrón mal escrito,
no un código limpio — mismo error de denominador que el resto de esta lista.

### Un contador `{}` con clave del estudio pierde el caso `__proto__` en silencio
Los gráficos del Laboratorio cuentan con `obj[k] = (obj[k]||0)+1` donde `k` sale de un campo del
estudio. Sobre un objeto literal eso **no crea la propiedad** si `k` es `__proto__`: el setter de
`__proto__` descarta los valores que no son objetos, y lo hace sin error. `Object.entries` nunca
ve la entrada, así que ese estudio desaparece de la distribución y el gráfico queda **coherente
con un caso de menos** — peor que romperse, porque no hay nada que mirar. Medido en el navegador:
`const o={}; o['__proto__']=(o['__proto__']||0)+1; Object.keys(o).length` → `0`; con
`Object.create(null)` → `1`. Los contadores cuya clave venga de datos van con prototipo nulo.
Lo cubre la regla `ceibo-contador-objeto-literal-con-clave-de-dato`.

### `MAPA[k] || 'Otro'` no cae al fallback con `k='constructor'`
La traducción por allowlist protege de mostrar el valor crudo del estudio, pero **sólo para las
claves propias**. Con `k='constructor'` devuelve la función `Object`, que es truthy, y el rótulo
pasa a ser `"function Object() { [native code] }"`; con `toString` o `valueOf`, ídem. Medido, no
supuesto. No es XSS —`String(Object)` no trae `<`— pero rompe justo la garantía por la que existe
la allowlist: que lo mostrado sea siempre un literal del archivo. Usar el helper `_lblDe(mapa, k)`,
que hace `Object.prototype.hasOwnProperty.call` (`.call` y no `mapa.hasOwnProperty`, porque el
mapa puede ser de prototipo nulo).
**No hay regla Semgrep para esto y no es un olvido**: `$MAPA[$K] || "..."` da 43 hits con ~12
reales, y acotarla a mapas literales inline la deja en 0 —ni siquiera matchea el código que la
originó, donde el mapa tiene nombre—. Quedan sin cubrir, y hay que mirarlos a mano si se tocan:
`ETE_INCL_LBL[id] || 'La sección'`, `INSUF_TXT[n] || 'Severa'`, `farmMap[f]`, y el bloque de
exportación a Excel (`{balon:…,auto:…}[c.ete_tavi_pro_tipo] || ''`).

### Semgrep: 118 warnings, 106 son ruido
El triage completo del 2026-09-08 dio **106 falsos positivos / 12 reales**. Los falsos
vienen del patrón `innerHTML +=` con resultados numéricos (`.toFixed()`, `Math.round`,
`.length`) y con constantes de las tablas de referencia del propio archivo. Los 12 reales
compartían una sola causa —el id sin sanear— y están **cerrados por construcción en
CeiboStore**; siguen apareciendo en el conteo porque las reglas son sintácticas y no ven el
saneo del borde. **No "arreglar" los 106 restantes sin triagearlos de nuevo**: la mayoría
son correctos como están.

### `ci: ci || '—'` — el placeholder que se hace pasar por documento
`guardarInforme` guarda `nombre || '—'` y `ci || '—'` con raya U+2014. Cualquier código que
pregunte «¿esta ficha tiene documento?» mirando si `ci` está vacío responde **sí** para todo
estudio cargado sin cédula, que es el caso más común del Laboratorio. Y las normalizaciones
del tipo `.replace(/[.\-\s]/g,'')` sacan el guion ASCII pero **no** la raya, así que sobrevive
y llega a las claves.

Costó dos rondas de revisión encontrarlo, porque leída sola cada mitad es correcta: el
placeholder existe para que la lista no muestre un hueco, y la normalización saca los
separadores que la gente tipea. El defecto es de la interacción. `_dupSinDato()` es la
respuesta: **presencia de una letra o un dígito**, no `!== ''`. Si escribís otra cosa que
decida sobre identidad de paciente, usala; `\p{L}\p{N}` y no `[a-z0-9]`, o un nombre en
alfabeto no latino queda sin identidad y se reinserta en cada importación.

### Dedup de importación: una sola identidad, y con un Set de consumidos
Las cuatro vías (JSON, Excel, DICOM y los dos previews) comparten `_dupKeys` →
`_dupIndice` / `_dupBuscarClave` / `_dupBuscar` / `_dupRegistrar`. Hubo una `_dupKey`
paralela cuyo comentario **juraba** que las dos vías compartían criterio; hacía años que no
era cierto y ese comentario es lo que hizo que nadie mirara. Si agregás una vía de
importación, no escribas la búsqueda de nuevo.

Tres invariantes que no son obvias y que se rompieron una por una:
- **La clave de nombre no une dos fichas que las dos tienen documento.** Son homónimos. Sin
  esa regla, «sobreescribir» pisa el estudio de un paciente con el de otro conservando id,
  uuid y estudioId del equivocado: el QR del PDF firmado de Ana abre el informe de Juan.
- **Un estudio guardado no puede ser destino de dos registros del mismo archivo.** De ahí el
  `Set` de índices consumidos que reciben los tres ejecutores. Sin él, dos filas fusionan
  sobre la misma ficha y el toast dice «2 actualizados» sobre un solo registro con las
  mediciones de dos pacientes mezcladas.
- **Después de sobreescribir o fusionar hay que re-registrar.** La ficha cambió de
  nombre/CI/fecha; sus claves viejas ya no la describen.

El índice guarda una **lista** de candidatos por clave, no uno: la app deja tener «Ana, CI
12345» y «Ana, sin CI» del mismo día con «Guardar como nuevo», y quedarse con el primero
resolvía al paciente equivocado.

### `_IG_SECTIONS`: los ids son del DOM, y un id inventado no falla, calla
El renderer descarta el campo vacío, así que un id equivocado no rompe nada visible: la fila
no aparece nunca. Había seis escritos «como suenan» (`vci_colapso` por `vci_col`, `dtd_e` por
`tde`, `gmax_ao` por `gmax_calc`, `gmed_ao` por `gmedio_ao`, más `ad_vol` y `vp_e` que no
existen). El detalle callaba el colapso de VCI, el TDE y los dos gradientes aórticos — lo que
define la severidad de una estenosis. Al agregar un campo, verificá que exista
`id="<ese id>"`. Excepción: `indicaciones` y `antecedentes_sel` son claves array de
`guardarInforme`, no ids.

**Ojo con los calculados.** `gmax_calc` es `readonly` y está en `LAB_XLS_SOLO_EXPORT`, así
que el import de Excel no lo escribe y nada lo recalcula al abrir: importar una `vmax_ao`
corregida deja el gradiente viejo, y ahora el detalle los muestra **juntos**. Es
«bloquear no es recalcular» otra vez. Sin resolver.

## Tests de regresión

`tests/regresion.json` tiene dos pacientes. **Correr los dos en el navegador antes de cada
commit** que toque renderizado, escapes, el store o el PDF.

- **Paciente 1 — envenenado.** Cuatro campos malformados, uno por contexto de inyección.
  Se espera: cero ejecuciones, cero atributos de evento, cero elementos inyectados, los
  campos visibles como texto literal, y el id reparado a un `number` en la banda ≥ 9e14.
  No hay que assertar el número exacto: es determinista para un contenido dado, pero el
  contrato es «number y en la banda».
  No entra por el import JSON —`validarInformeImportado` lo rechaza— así que hay que
  escribirlo con `CeiboStore.setLocal([...])`. Eso es correcto: la escritura directa es
  justamente el vector que queda abierto.

- **Paciente 2 — legítimo con extremos.** Sirve para detectar la defensa que se pasa. Se
  espera: el nombre `O'Brien & Cía <Cardiólogo>` visible **tal cual** (si se ven entidades
  hay doble escape), y **FEVI 0 y edad 0 visibles como `0`, no como celda vacía** — ese es
  el caso que protege el cambio de `escHtml` a `String(s ?? '')`.

El JSON lista además los cinco sinks a verificar y cómo montar cada vista sin caer en el
falso negativo del contenedor vacío. **Antes de contar cualquier resultado, confirmar que la
vista renderizó**: contar filas, ítems o bytes. Un cero sobre cero elementos no prueba nada.

## Rangos de importación

`DCM_RANGO` y `LAB_XLS_RANGO` **asumen paciente adulto**. Un seno aórtico neonatal (~6-9 mm)
cae bajo el piso de 10 mm y la fila se rechaza entera. Está documentado en el propio código,
arriba de `DCM_RANGO`, con la lista de campos afectados. No bajar los pisos: son los que
atrapan un `1,2` escrito por `12`. Si hace falta pediatría, rango por franja etaria usando
el campo `edad` que ya está en el mapa de Excel.

### CIA/CIV y tractos de salida: sin red
`ete_cia_tam_max`, `ete_cia_tam_min`, `ete_civ_tam`, `tsvd_diametro`, `vti_tsvd`,
`diam_tsvi`, `itv_tsvi` **no figuran en ninguna de las dos tablas de rango**. Entran por
Excel sin ventana de plausibilidad: un TSVI de 210 mm escrito por 21,0 se importa sin
chistar, y de ahí sale el **Qp/Qs** del shunt.

No se les inventó rango a propósito: son campos de cardiopatía congénita, o sea población
pediátrica por definición, y una ventana adulta rechazaría los casos legítimos — el mismo
problema que ya tiene `DCM_RANGO`. La salida correcta es rango por franja etaria usando el
campo `edad`, que ya está en el mapa de Excel. Hasta entonces, **saber que no hay red**.

Contexto: esta sección se movió a la tab Hemodinámica el 2026-09-08 y quedó más a mano, así
que es donde más probablemente entre un dato fuera de escala.

## Hallazgos de auditoría verificados como FALSOS (2026-09-09)

Seis de una tanda de siete no existían. Se documentan con la evidencia para que no vuelvan a
entrar en una lista de correcciones: cada uno cuesta media sesión de verificación.

- **«`eeHasData()` puede activarse con datos del ETE».** Invierte la relación: `eeHasData`
  (~8012) es de Eco Estrés y sólo lee `ee-*`, `eeBull`, `eeImg`, `eeEcg`. No hay ninguna ruta
  del ETE. Y el gate está cerrado por partida doble: la UI se retiró —cero ocurrencias de
  `id="ee-incluir-pdf"`, `ee-res-global`, `ee-b-mets`— y su único consumidor (~18654) exige
  `document.getElementById('ee-incluir-pdf')`, que no puede existir. El defecto real de esta
  función (`.length` por `.some(Boolean)`) se cerró el 2026-09-08.
- **«El bull's eye no se limpia al cargar otro paciente».** `limpiarCampos` **sí** lo limpia,
  en las líneas 16344-16345, vía `contrReset()` y `sglReset()`. Grepear `strainEstado` dentro
  de la función da cero y parece confirmar el bug — el reseteo va por esas dos funciones. Es
  el caso típico donde el grep miente: medir en el navegador. Verificado pintando segmentos y
  llamando `limpiarCampos()`: estado a 0 y el SVG repinta al color de índice 0.
- **«El bull's eye no se captura si el canvas está fuera del viewport».** No hay canvas en
  pantalla: el de la UI es un `<svg>` (`sgl-svg-bullseye`, 3585) y `bullseyeDataURL` (~27436)
  crea un canvas **desprendido** con `document.createElement`. La posición del scroll es
  irrelevante. El arreglo pedido —scrollear o «renderizar offscreen»— habría creado la segunda
  ruta de dibujo contra la que advierte el comentario de ~26058.
- **«FEVI Simpson calcula con un solo plano».** No existe cálculo de Simpson por planos.
  `fevi` es un `<input type="number">` (1759) que el médico tipea, y `fevi_met` es una
  etiqueta. Nada escribe `fevi` por código; no hay `id="fevi_simpson"`.
- **«THP se calcula con AVm planimetría vacío».** `calcTHP` (~13340) lee sólo `thp`, tiene
  guarda `if (!thp) { setv('avm_thp',''); return; }` y nunca mira `avm_plan`. AVm por THP es
  220/THP (Hatle): la planimetría es una medición independiente, no una entrada.
- **«Frases rápidas fallan con textarea >10.000 caracteres».** No hay ningún límite:
  `frasesInsertar` (~15005) no chequea longitud y `#informe_texto` (9459) no tiene
  `maxlength`. El único `maxlength` del archivo es 400, en la nota de caso de interés.

**Lo que sí era real de esa tanda:** el aviso médico-legal sólo salía desde `doLogin()`.

### El algoritmo de amiloidosis: estado de módulo que no era del formulario
`gradoGamma` y `protMonoc` (~23557) son dos `var` de nivel superior con dato clínico del
paciente, y el panel de conclusión son tres `div` sueltos (`#algo-title`, `#algo-body`,
`#algo-accion`) que **no alcanza ningún barrido** de `limpiarCampos` —ni el de
`.calc-box .calc-row span[id]` ni el de `[id$="-badge"]`—.

Lo peligroso no era que no se limpiara: era que se limpiaba **a medias**. El bucle de inputs
sí vaciaba `alg-motivo` y `alg-ett-score`, así que el paciente nuevo veía «Motivo de
sospecha: no especificado» arriba y «ATTR confirmado — Grado 3 (VPP 100%)» abajo. Se lee
como una evaluación fresca. Un clic en «Integrar al informe» metía el centellograma del
paciente anterior en el informe del actual. Reproducido en el navegador.

Y `resetAlgoritmo` tampoco alcanzaba solo: nuleaba las variables pero **no repintaba**,
porque no llamaba a `actualizarAlgoritmo()`. El cartel sobrevivía también al botón «🔄 Nueva
evaluación». Hoy `resetAlgoritmo` termina llamando a `actualizarAlgoritmo()`, y la rama
temprana de ésa —la de estado en null— es la única que decide cómo se ve el panel vacío.

**La lección general:** al agregar un módulo con estado propio, las tres columnas son
`limpiarCampos` / `editarInforme`+`cargarEstudioPorId` / `guardarInforme`. Si falta la
primera, el dato del paciente anterior viaja. Y un reseteo que no repinta no es un reseteo.

### El aviso médico-legal falla CERRADO
`_avisoLegalForzar()` (~1113) toca el DOM directamente en vez de llamar a `mostrarAvisoEco`,
que vive ~33.000 líneas más abajo en otro bloque `<script>`: si ese bloque deja de parsear
—ya pasó dos veces— la función desaparece y el aviso deja de salir.

Antes había dos caminos y los dos fallaban abiertos, de forma distinta: con `typeof` era un
no-op mudo, y la llamada pelada de `doLogin` tiraba `ReferenceError` **después** de marcar
la sesión y ocultar el overlay, o sea que el login quedaba hecho y el disclaimer no aparecía
nunca. Ahora, si `#modalAvisoEco` no está, se revierte al login. **No cambiar esto por un
`try/catch` mudo:** el requisito que custodia `clinical-disclaimer-guard` no puede fallar de
un modo que se vea igual que un arranque sano.

### El z-index del login no es negociable
`#login-overlay` está en `2147483000`. Estaba en 9999 mientras ocho overlays escritos a mano
viven entre 99998 y 100000, así que «Cerrar sesión» levantaba la pantalla **por debajo** de
ellos — y el modal de `editarInforme` lleva el nombre del paciente en el cuerpo. Si agregás
un overlay, no le pongas más que eso.

### Clasificar por texto libre: sin guarda de negación el sesgo es sistemático
Varias estadísticas del Laboratorio salen de buscar palabras en el informe narrativo
—hallazgos frecuentes, geometría del VI, grado diastólico, contractilidad difusa, casos de
docencia—. Todas usaban `regex.test(texto)`, así que «se descarta HTP» contaba como un caso
DE HTP. El sesgo **no es aleatorio**: un laboratorio que informa bien nombra lo que descartó,
así que infla justo lo que más se menciona para negarlo, y esas cifras van a un PDF de
auditoría. Medido sobre una cohorte de 8: HTP contaba 4, son 2.

Ahora todo pasa por **`_labMenciona(txt, re)`**. Mira hacia atrás desde cada ocurrencia,
dentro de la misma oración (`.`/`;`/salto cortan la ventana), y una mención afirmativa
alcanza. Deliberadamente no mira hacia adelante: «HTP no severa» menciona HTP y lo negado es
el calificativo. Si agregás una clasificación por texto, usala — no escribas otro `.test()`.

Y `_labGeomCat` es la **única** implementación de geometría del VI: había dos copias
idénticas, dashboard y PDF. La rama `normal` ya no usa `\bnormal\b` suelto, que matcheaba
«función diastólica normal» y clasificaba la geometría de ese estudio como normal, inflando
numerador y denominador a la vez.

### El denominador se declara una vez, o el PDF publica dos
La sección de Valvulopatías tenía la gráfica dividiendo por `infs.length` y las seis tablas
por la base de cada válvula, **en la misma página**, bajo un subtítulo que decía las dos
cosas: «Solo pacientes con valvulopatía documentada — % sobre total (n=…)». Y como la gráfica
imprime el `n` crudo dentro de cada barra, el mismo número aparecía dos veces con dos
porcentajes: la barra decía «n=2 · 1%» y la tabla «2 (25%)».

La base correcta es **por válvula**: un estudio sin `im_grado` no dice nada sobre la mitral,
así que meterlo en su denominador no mide prevalencia, mide cuánto se completó el formulario.
`_labValvCounts` devuelve `bases[]` y el `n` va en el título de cada tabla, porque es distinto
en cada una.

**`pctOf(n, 0)` devolvía `0`, que es el valor que más se parece a un resultado.** La estenosis
tricuspídea no existe en el modelo de datos (su accesor es `() => null`), así que el PDF
imprimía cuatro filas confiadas en «0 (0%)» y un auditor leía «este laboratorio no tiene
estenosis tricuspídea». Con base 0 la celda ahora dice «—» y el título «(sin datos)».

### Frases direccionales: el texto no puede afirmar lo que el semáforo niega
`interpTxt` elegía la lectura clínica por el SIGNO del coeficiente y nada más, así que una
correlación de rho=0,05 con p=0,8 publicaba «A mayor FEVI, mayor presión pulmonar» en la
tabla, el Excel y el PDF. No podía consultar el p ajustado: `runOne` corre antes de que
exista `pAdj`, que necesita las 29 asociaciones juntas. La decisión se movió a `_bh`, después
del ajuste. Umbral: el **p ajustado**, el mismo del semáforo. Si el semáforo no está verde,
el texto dice «Sin asociación significativa.».

### Estenosis mitral: una sola escuela, y el THP no vota aparte
El archivo tenía dos convenciones conviviendo, y no eran dos opiniones sino dos épocas: la
tabla de referencia y el score decían «AVm ≤1,5 severa» (ESC) y en la misma tabla «THP ≥220
severa»; la calculadora `cxAVT` decía «severa <1,0» (AHA/ACC clásico).

**El THP y el AVm no son dos mediciones.** El AVm por THP ES 220/THP (Hatle), así que THP
≥220 equivale a AVm ≤1,0. Entre 147 y 219 ms el mismo número daba «severa» por el área y
«moderada» por el THP, y **las dos votaban en el mismo score**: una medición contada dos veces
y en contra de sí misma. Se eliminó el voto del THP; sigue entrando como `AVm(THP)`.

Verificado contra las guías (2026-09): ESC/EACTS 2021 y 2025 → severa AVm ≤1,5 cm², sin
cambios entre ediciones. ASE 2023 → AVm ≤1,5, THP ≥150 ms, gradiente medio ≥10 mmHg.

**Cambio clínico declarado:** el gradiente medio pasó de `>10` a `≥10` para severa. Un
gradiente de 10 exacto ahora es severa. Casi entra disfrazado de refactor bajo un comentario
mío que afirmaba «ya coincidía y no se tocó» — lo cazó `/differential-review`. **Un cambio de
umbral no puede viajar dentro de una extracción de constantes.**

**No hay `THP_SEVERO_MIN`.** Se creó y se borró en la misma sesión: no gobernaba nada —el
motor clasifica el área, no el THP— y encima desfasaba, porque el corte efectivo es 220/1,5 =
146,7 (≥147 ms) y no ≥150. La tabla de referencia publica ≥147 y explica por qué difiere del
≥150 que publica ASE. Una constante que no gobierna nada es peor que el literal.

### Extraer un umbral es leer por función, no grepear el literal
En la extracción de LAVI/masa/PSAP/FEVI se pasaron por alto ~20 sitios, y **tres estaban en la
línea contigua a uno que sí se cambió** (`(aiVol/bsa) > 34`, `FEVICAT f>=50`, el rótulo
`PSAP > 35`). El patrón delata el método: una pasada por el literal exacto en vez de leer la
función. Dos de los omitidos eran clasificatorios y uno escribía el **informe narrativo
firmado** («AI de dimensiones normales»).

Y no todo número igual es el mismo umbral. Quedan literales A PROPÓSITO:
- `fevi >= 20 && fevi <= 50` — rango de elegibilidad COAPT del TEER, no normalidad.
- la escala 50/54 de cardio-oncología — ESC 2022, otra guía.
- `uLaviMay = fa ? 40 : ...` — el ajuste por FA del HFA-PEFF.
- la tabla de **prótesis** mitral (`AVm <1.0`, `THP >200`) — obstrucción protésica, otra
  entidad. Se ve como la escala vieja y NO lo es. No la "arregles".
- `hviSeveridad` arranca sus bandas en 96 y 116, o sea `UMBRAL_MASA_HVI_* + 1`: acopladas sin
  nombrarlas. Hay un comentario cruzado; si movés el umbral, movelas.

### El bloque de Eco Estrés ya está inerte — no le pongas una bandera falsa
Sus dos listeners sobre `document` (click en `#ee-eye-pop`, paste en `#tab-ee`) preguntan por
su propio DOM adentro y salen temprano. Medido: ninguno llega a `preventDefault()`. Y
«desactivar los exports» no hace nada: son declaraciones de función de nivel superior, así que
`window.eeX` existe aunque se borre la línea de export.

Una condición «que nunca sea true» sería un retroceso: hay que acordarse de invertirla el día
que vuelva la UI, mientras que la guarda por DOM revive sola. Es el criterio con el que ya se
cerró el gate del PDF. **Lo único real** es el orden: el paste de Eco Estrés se registra ANTES
que `imgPasteHandler`, así que al restaurar la UI hay que decidir el orden, no descubrirlo.

## Deuda conocida sin resolver

- **Contraseña en el código.** `doLogin()` compara contra un literal. Choca con el checklist
  («sin contraseñas hardcodeadas visibles»), pero es la única compuerta que tiene la app y
  sacarla sin backend la deja abierta. Se resuelve con la migración a Supabase, no parcheando
  del lado del cliente. Mientras tanto: **es una barrera de cortesía, no un control de
  acceso** — cualquiera que abra el archivo la lee.
- **`gmax_calc` puede quedar rancio.** Ver la sección de `_IG_SECTIONS`.
- **`cerrarSesion()` no es un borde de sesión.** No recarga ni llama a `limpiarCampos` /
  `imgVaciar`: detrás del overlay quedan intactos el formulario, las imágenes y todo el
  estado de módulo. Y los listeners de autosave siguen enganchados, así que un input con la
  sesión «cerrada» sigue escribiendo el formulario del paciente anterior en `localStorage`.
  El arreglo obvio —terminar en `location.reload()`— **no alcanza solo**: `_autosaveRestore`
  corre en `DOMContentLoaded` sin mirar `ett_auth`, así que repondría ese formulario detrás
  del login. Cerrarlo de verdad exige decidir qué pasa con el borrador: limpiarlo pierde
  trabajo en curso, conservarlo mantiene la fuga. Es una decisión de producto, no técnica.
- **Si vuelve la UI de Eco Estrés, `eeResetAll` necesita vaciar `eeImg` y `eeEcg`.** Hoy sólo
  barre `#tab-ee input/select/textarea` y `eeBull`. No fuga porque no hay UI que las pueble y
  el PDF está gateado por `#ee-incluir-pdf`; las dos ausencias se tapan mutuamente y
  restaurar la interfaz destapa las dos. Necesitan el tratamiento de `imgVaciar` —mutación en
  sitio, `_imgGen++`— ANTES de que vuelva el toggle.
- **`labGenerarPDF` no termina en el preview headless.** Medido: se lanza, no tira error y
  nunca llega a `doc.save()`, ni con los cambios de esta sesión ni **en HEAD** — o sea que es
  preexistente y no una regresión. Los dos rasterizadores que sospeché (`_labHeartPng`,
  `_labValvChartPng`) responden bien por separado (8 ms y 800 ms). Queda sin diagnosticar si
  falla también en un navegador real o sólo en headless. **Mientras tanto, los cambios de esa
  función se verifican por unidad**, no de punta a punta.
