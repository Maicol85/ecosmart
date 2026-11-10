# Mapa — el cajón de Documentos en Configuración (tanda PANT-32, 2026-11-10)

Armado sobre el cierre de la tanda. **No guarda números de línea a propósito**: la línea cambia
en cada edición, el nombre de la función no. Todo vive en `index.html`, en el bloque del módulo
de documentos, justo después de `window.DOC_DEFS = DOC_DEFS;`.

Lo anterior: la hoja y los cuatro documentos, en `docs/mapa/pant30-documentos-protesis.md` y
`docs/mapa/pant31-hoja-ppt.md`. El manual del médico, en `docs/DOCUMENTOS_P32.md`.

---

## 1 · La regla de oro, y por qué se cumple por construcción

**Un documento incluido SIN EDITAR no pasa por el armador de modelos.** `docmodDef(clave)`
devuelve `DOC_DEFS[clave]` **tal cual** — el mismo objeto, no una copia—, así que su PDF y su
imagen son los de PANT-31 por **identidad** y no por cuidado.

Medido al cierre, y es la tabla contra la que se mide cualquier cambio futuro:

| documento | hojas | operaciones de papel |
|---|---|---|
| `constancia` | 1 | 13 |
| `cve` | 3 | 150 |
| `ete` | 3 | 198 |
| `burb` | 3 | 152 |

⚠️ **«SIN EDITAR» SE DECIDE COMPARANDO CONTRA EL ORIGINAL, NO CON UNA BANDERA**, y la
comparación vive en **`docmodModelo`** (el lector) y no sólo en el botón «Guardar». Lo destapó
**TC-801 (C6)**: `ed` puede llegar de un archivo **importado** o de un estado escrito a mano, y un
documento cuyo texto es el original exacto tiene que imprimir por su definición. Con la
comparación sólo en el botón, la regla dependía del camino por el que el estado había llegado.
Los dos cuerpos se comparan **normalizados** por `docmodCuerpo`: con `JSON.stringify` sobre el
objeto crudo, el mismo contenido con las claves en otro orden da dos cadenas distintas.

## 2 · El almacén

| pieza | qué hace |
|---|---|
| `DOCMOD_KEY` | `'ecosmart_doc_modelos'` en `localStorage`, con el patrón de `ecosmart_frases` |
| `docmodVacio()` | los cuatro incluidos visibles, sin nombre propio y sin `ed`, y cero propios |
| `docmodLeer()` | lee, **valida** y ante cualquier problema devuelve el estado vacío. Nunca tira |
| `docmodEscribir(st)` | devuelve `false` con la cuota llena y **no finge éxito**: el llamador avisa |
| `docmodValidar(raw, pedirMarca)` | **el único** validador, para el almacén y para el archivo importado. Devuelve `{ok, st, motivo}`; el motivo es `'ajeno'` o `'propios'` |
| `DOCMOD_LIM` | los topes de largo: nombre 60, título 120, título de pregunta 160, texto de pregunta 6.000, texto libre 3.000, 30 preguntas, 60.000 caracteres en total |
| `DOCMOD_BTN_KEY` | `'ecosmart_doc_boton'`, **clave propia**: el interruptor es una preferencia de esta computadora y no un texto del modelo, así que no viaja en el archivo y su validador lo rechazaría |

**La forma guardada:**

```
{ v: 1,
  incl: { constancia|cve|ete|burb: { vis: bool, nom: string, ed: <cuerpo>|null } },
  prop: [ { clave, tipo: 'constancia'|'consent', vis, nom, <cuerpo> } ] }
```

y el **cuerpo** editable es `{ tit, decl, firmas, comunes }` más `{ frase, txt }` en una constancia
o `{ pregs: [{t, x}] }` en un consentimiento.

⚠️ **EL VALIDADOR RECHAZA POR CLAVE DESCONOCIDA**, en la raíz, en cada incluido, en cada propio y
en cada cuerpo. Una clave que no se reconoce es un archivo de otra versión o de otra cosa, y
cargarla a medias es peor que no cargar nada.

## 3 · El modelo original de un incluido: se DERIVA

`docmodOrig(clave)` arma el modelo de texto **de la propia definición**, por rebanado:

- la **constancia**: el bloque `tit`, la frase con los datos como **pieza** (el primer `p`, que es
  `DOCMOD_FRASE`) y el texto libre, que es todo lo que va entre esa frase y el bloque `firma`;
- un **consentimiento**: el bloque `sub` como título, y las preguntas que `docmodCuerpoAPregs`
  separa por los bloques `sec` entre `pacid` y el primer bloque con `grupo: 'firmas'`.

⚠️ **NO SE RETIPEA UNA PALABRA**, y la orden es terminante al respecto. Medido palabra por
palabra, el texto derivado no pierde ninguna del cuerpo de los cuatro: **13**, **318**, **459** y
**342** palabras.

## 4 · Texto ↔ bloques: las cinco convenciones

`docmodTextoABloques(txt)` y su inversa `docmodBloquesATexto(bs)`.

| en el texto | bloque | notas |
|---|---|---|
| línea que empieza con `• ` | `ul` | varias seguidas son **un** `ul`; un `**prefijo**` al principio pasa a `fuerte` |
| línea que empieza con `☐` y trae **uno** solo (o el prefijo `☐ Sí ☐ No `) | `chk1` o `chk2` | **una** sola da `chk1`; **dos o más** seguidas dan `chk2`, que el papel saca **en dos columnas** |
| línea con `☐` **en el medio** | `pchk` | los cuadrados se **dibujan** donde están |
| línea de sólo guiones bajos (3 o más) | `raya` | toma como rótulo el **párrafo que la precede** |
| `**...**` dentro de un párrafo | `pr` | negrita **palabra por palabra** |
| línea en blanco | — | separa párrafos; dos líneas seguidas sin blanco son **un** párrafo |
| `esp` y `salto` | — | **no tienen forma en texto**: el aire lo pone el maquetador y el texto corre de una hoja a la siguiente sin salto forzado (D4) |

⚠️ **LA DISTINCIÓN ENTRE CASILLA Y `pchk` ES NECESARIA, NO UN LUJO**: `docSan` convierte el U+2610
en un **espacio**, así que un cuadrado que no se dibuja sale como un **hueco** que el paciente no
puede marcar. Es lo que PANT-31 pagó con la línea de «capacitado para recibir la información».

## 5 · La negrita palabra por palabra

**Vive aparte de `parrafo` a propósito.** El bloque `pr` lo emite **sólo** el armador de modelos, y
sólo cuando el texto del médico trae dobles asteriscos; lo dibuja **`parrafoRico`**, una función
nueva dentro de `docMaquetar`. Así los cuatro documentos sin editar no pasan por una sola línea
nueva.

- `parrafoRico` **mide cada palabra con SU tipografía**: el ancho de «Frecuentes:» en negrita no es
  el de la redonda, así que delegar el reparto a `splitTextToSize` —que mide con una fuente—
  dejaría la línea corta o desbordada. La última línea nunca se justifica, igual que en `parrafo`.
- el **peso por palabra** es un campo **opcional** (`w.b`) de la operación `tw`. Los dos emisores
  —`docOpsAPdf` y `docOpsASvg`— lo leen sólo si está; sin él, la línea se dibuja con el peso de la
  **línea**, que es lo que hacen las 21, 27 y 23 líneas justificadas de los tres consentimientos.
- `docBloquesNuevos` **copia `runs`**, por el mismo motivo que copia `aire`: el maquetador y
  `docRender` trabajan sobre esa copia. Sin eso, la negrita se perdía al abrir la hoja.
- en la hoja, una corrección a mano de un `pr` se vuelve a leer del DOM con **`docRicoDelDom`**,
  que pregunta por el peso **calculado** y no por el nombre de la etiqueta: el navegador deja
  `<b>`, `<strong>` o un `span` con `font-weight` según cómo se haya editado.

## 6 · El armador

`docmodArmar(m)` → la lista de bloques que el maquetador ya sabe dibujar.

- **constancia**: `enc` · `ciudadfecha` · `tit` (el del modelo) · la frase si la pieza está
  tildada · el texto libre convertido · `firma`.
- **consentimiento**: `docEncConsent(m.tit)` —que trae `enc`, `hr`, el `tit` fijo
  «CONSENTIMIENTO INFORMADO», el `sub` del modelo y la **línea del paciente**— · una `sec` más su
  cuerpo por cada pregunta **con texto** · las tres piezas.

`docmodPiezas(m)` saca las piezas **de la propia definición** cuando el documento es incluido
—por eso su declaración sigue nombrando su procedimiento— y de `docDeclaracion` +
`docHojasComunes` cuando es propio.

⚠️ **UNA PREGUNTA CON EL TEXTO VACÍO NO SE IMPRIME, NI SU TÍTULO**: un título de sección sin
cuerpo numera una sección que no dice nada. El editor lo avisa.

⚠️ **SIN TABLA DE FIRMAS QUEDA IGUAL LA FIRMA DEL MÉDICO** (C2), y lleva el **mismo `grupo`** que
la declaración para que las dos sigan viajando juntas de hoja.

## 7 · A5 · la declaración de un documento propio

`docDeclaracion(procSin, internacion, procAcuerdo)` gana un **tercer parámetro opcional** que los
tres incluidos **no pasan**, así que su texto no cambia una letra. Un propio recibe
`DOCMOD_PROC` = `'el procedimiento'` y `DOCMOD_PROC_AC` =
`'el procedimiento descrito en este documento'`: son **dos redacciones distintas** de la misma
idea, y por eso hacen falta dos parámetros y no uno.

Medido con su control negativo: el propio dice «en qué consiste el procedimiento» y no nombra
ningún estudio; el ETE incluido sigue diciendo «en qué consiste un ecocardiograma transesofágico
con sedación» y **no** dice «descrito en este documento».

## 8 · La pantalla

| pieza | dónde |
|---|---|
| la sección | `<section class="cfg-card" id="cfg-card-docs">`, **entre** «Imágenes del estudio» y «Modo de visualización» |
| el interruptor | `#cfg-docs-on` → `cfgDocsToggleBoton` → `docmodBotonSync` |
| el cupo | `#cfg-docs-cupo`, pintado por `cfgDocsRender` |
| la lista | `#cfg-docs-lista`, con un oyente **delegado** registrado una sola vez y los índices por `data-cd-vis` / `data-cd-ed` / `data-cd-del` |
| los botones | `#cfg-docs-botones`: agregar, exportar, importar y la pregunta de tipo |
| el editor | `#cfg-docs-ed` |
| la línea fija | `#cfg-docs-pie` |

⚠️ **TODOS LOS IDS NUEVOS LLEVAN PREFIJO `cfg-`**, medido en la TAREA 0: con ese prefijo quedan
fuera del censo del estudio, fuera del Excel y fuera de `editarInforme` **por las dos listas a la
vez** —`_CAMPOS_FUERA_DEL_ESTUDIO` y `_noEsDelEstudio`— sin tocar ninguna. Y **ninguno termina en
`-aviso`** ni en `-badge`, que son los dos barridos por sufijo de «Nuevo estudio»: es lo que
PANT-30 pagó con `doc-aviso`, que se llevaba el botón del aviso puesto.

⚠️ **EL BOTÓN SE OCULTA CON UNA CLASE Y NO CON `hidden`**, y el control está en **TC-803 (B8)**:
con el atributo puesto y la clase sacada, el envoltorio computa `display:flex` y el botón sigue
midiendo 132 px de ancho, porque `.btn` declara `display:inline-flex` y le gana al `[hidden]` del
navegador. Se oculta el **envoltorio** (`.doc-menu-wrap`), así el menú se va con el botón.

## 9 · El menú del Informe

**Se pinta y ya no está escrito a mano.** `docmodMenuRender()` lo arma del almacén: los incluidos
en su orden y después los propios, sólo los visibles, y con el mensaje «No hay documentos
visibles.» cuando no queda ninguno. La clave va por **`data-doc-k`** y el oyente es **delegado**:
en un manejador inline `escHtml` no protege, porque el parser decodifica la entidad **antes** de
compilar el handler. `cfgDocsRender` lo vuelve a llamar, así que ocultar, mostrar, agregar o
borrar se ven **al instante**, sin recargar.

## 10 · El editor

`cfgDocsEditar(clave)` y `cfgDocsEditarNuevo(tipo)` arman `_cdEd = {clave, m, nuevo, nom, firma}`
y `cfgDocsEdRender()` pinta. **Vive en la misma pantalla** que la lista, que queda escondida con
la clase.

- **dos columnas desde 900 px** (`.cdd-cols`), con la vista previa a la derecha; una sola columna
  por debajo, con la vista previa **debajo**. El corte va sobre la **ventana** y no sobre el
  contenedor, que es la regla de la casa.
- **la vista previa usa la hoja del Informe**: `docRender` salió partido y su armado de marcado
  pasó a **`docHojaHTML(bloques, D, editable)`**. Con dos armados, el día que un bloque cambie de
  aspecto el editor mostraría una cosa y el papel otra.
- el paciente de la vista previa es **ficticio** (`docmodEjemplo()`), y la institución y el médico
  también: este es un repositorio público y el modelo es de la institución, no de un paciente.
- los campos son **`textarea`** y el texto se trata **siempre como texto**. Cero
  `contenteditable` en la columna del editor.
- `cfgDocsEdLeer()` es el **único** lugar que lee los campos al modelo, y corre en cada tecla: así
  el modelo en memoria y la vista previa no pueden estar en dos estados distintos.

⚠️ **LOS TRES OYENTES DEL EDITOR SE REGISTRAN UNA SOLA VEZ** (`ed._cdDeleg`), y lo destapó una
sonda: `cfgDocsEdRender` reemplaza el `innerHTML` pero **no** el contenedor, así que sin la guarda
cada repintado colgaba un juego nuevo y el click se atendía tantas veces como veces se hubiera
repintado. Se vio en que «Volver al texto original» preguntaba **dos** veces — y «Guardar» habría
guardado dos y «Agregar pregunta» habría agregado dos. **TC-804 (D1) y (D2)** lo miden **después**
de cuatro repintados, que es la única condición en que el defecto aparece.

⚠️ **«VOLVER AL TEXTO ORIGINAL» CARGA Y NO GUARDA**: recién «Guardar» lo deja, dejándolo en
`ed: null`. Así el médico puede mirarlo y arrepentirse con «Cancelar».

## 11 · Los documentos propios

- **dos como máximo** (`DOCMOD_PROPIOS_MAX`), y el total nunca pasa de seis. Con dos, el botón
  queda **desactivado** y el cupo dice «Para agregar otro, borrá uno propio.». Editar un incluido
  **no** cuenta.
- la pregunta «¿Qué querés agregar?» va **en la pantalla**, con dos botones con nombre: con un
  `prompt`, el médico tendría que traducir su respuesta a un número. El **nombre** sí va por
  `prompt`, que es una pregunta de texto y es lo que la app ya hace en diez lugares.
- la clave (`p1`, `p2`) **no se deriva del nombre**: dos documentos pueden llamarse igual, y un
  nombre con acentos o espacios no es una clave.
- el papel, medido: cuerpo **10,2 / 13,4 pt** en un consentimiento y **10,5 / 16** en una
  constancia; el texto corre **sin salto forzado** (el único `salto` que queda es el de las hojas
  comunes); la **declaración y la tabla de firmas** pasan de hoja **enteras** por el grupo
  `firmas`, que el maquetador ya medía con `altoGrupo`; las hojas comunes **a continuación,
  aparte**; la constancia propia en **una** hoja con **38,3 mm** entre el último renglón y la raya
  de la firma.

## 12 · Exportar e importar

| pieza | qué hace |
|---|---|
| `cfgDocsExportar()` | baja `ecosmart_modelos_documentos_AAAA-MM-DD.json` con el mecanismo de `_bkExportar` |
| el archivo | `{_ecosmart_modelos: true, v, fecha, incl, prop}` y nada más |
| `cfgDocsImportar(file)` | tope de bytes, `JSON.parse` en `try/catch`, `docmodValidar(crudo, true)`, confirmación, reemplazo |
| `DOCMOD_AJENO` / `DOCMOD_3PROP` | los dos mensajes que la orden fija |

⚠️ **EL ARCHIVO LLEVA SOLO TEXTOS Y OPCIONES**, y está medido por el complementario: buscados en
el archivo exportado, **cero** apariciones del nombre del paciente, de su documento, de la
institución, del médico, de su matrícula y de un `data:image`. El interruptor del botón tampoco
viaja.

⚠️ **SE VALIDA ANTES DE CARGAR NADA Y EL ARCHIVO SE RECHAZA ENTERO.** Un archivo cargado a medias
deja al médico con la mitad de los modelos de otra institución y sin forma de saber cuál mitad. Es
el mismo criterio que `importarInformesJSON` ya aplica.

⚠️ **LAS HOJAS EN MEMORIA SE DESCARTAN AL IMPORTAR** (`_docEst = Object.create(null)`): si
quedaran, el médico imprimiría el documento anterior creyendo que importó el nuevo.

---

## Lo que esta tanda NO tocó

El papel del informe, el Excel (**457** columnas), el PPT de un estudio, el 3D, la brújula, la
captura, el defecto preexistente del cambio de pestaña (**P30-d**) y los pendientes **P31-a** a
**P31-g**. **Cero campos guardados nuevos del estudio** y **ningún id existente cambiado**.
