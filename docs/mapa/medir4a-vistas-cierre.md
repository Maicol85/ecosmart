# MEDIR-4a — las dos vistas alineadas, el cierre por vista, la tabla que sigue a la vista, el selector con imágenes fijas y la casilla de Anahí retirada

Tanda **MEDIR-4a** (2026-11-15). Sello **`v20261115-0250`**, md5 **`359755ea`**, **182.653**
líneas. Línea base: **`e7a1f3e`** (el bloque 0 de MEDIR-4, cuyo `index.html` es idéntico al de
MEDIR-3: sello `v20261114-2057`, md5 `6545b13e`).

Cuatro bloques cerrados —**A**, **B**, **E** y **C**—. El **bloque D** (el flujo de dos pasos del
Simpson biplano) **no se empezó**: ver `docs/PENDIENTES.md` → **M4a-f**.

> ⚠️ **ESTE MAPA NO LLEVA NÚMEROS DE LÍNEA, a propósito**: la línea cambia en cada edición y el
> nombre de la función no. Todo se busca por nombre de función, de constante o de id.

---

## 0 · Las dos premisas del inventario que se dieron vuelta al re-medirlas

La orden mandaba comprobar de nuevo lo que el bloque 0 había medido. Dos cosas no se
reprodujeron, y **la primera cambió el diseño del bloque A**.

### (1) `_dop` y `_d2` NO son estado por vista: son estado de MÓDULO, y es a propósito

El inventario publicaba `tablasSeparadas: true`. Lo que esa sonda medía eran los **arreglos de
medición crudos** de cada vista (`medPuntos`, `medCalibVel`, `simp`), que sí son por vista. El
**cajón** es otra cosa: `let _dop = null` y `let _d2 = null` son de módulo, **uno por overlay**, y
el comentario de `_dopNuevo` dice por qué:

> «el cajón acumula entre imágenes A PROPÓSITO —la ecuación de continuidad lo exige: el VTI del
> TSVI y el de la válvula aórtica se miden en planos distintos— y con DOS vistas abiertas esos dos
> planos pueden ser dos pantallas.»

**Partir la tabla en una por vista dejaría a la AVA sin poder calcularse.** Eso es contenido
clínico y lo decide el médico, así que **no se partió**: lo que se hizo es mudar la tabla única a
la columna de la vista que se está midiendo. Lo que distingue el origen de cada número es la
**marca por fila que ya existía** (`_dopSufOrigen` / `_d2SufOrigen`), que sólo aparece cuando hay
más de un origen — medido: con una vista la fila dice «TAPSE», con dos dice «TAPSE · A» y
«VD basal · B».

### (2) El corte de ancho es 1369 px y no 1368

La cuenta daba 1340 px de modal → ventana de ~1368. **Medido barriendo la ventana de 1500 a
1180**, a 1369 la imagen mide **300 px exactos** y a **1368 mide 299**, uno por debajo del piso
que la orden fija. El corte es **1369**.

---

## 1 · Bloque A — la alineación de las dos vistas

### Una sola plantilla, con los MISMOS siete botones

`_vPanelHTML(p, esB)` ya era la única plantilla; lo que no era igual eran los botones.

| | antes (MEDIR-3) | hoy |
|---|---|---|
| botones de la barra A | **8** | **7** |
| botones de la barra B | **6** | **7** |
| botón en el encabezado A | 0 | **0** |
| botón en el encabezado B | **1** (`✕ Cerrar vista`) | **0** |

- **`cine-cerrar-v` se emite en las DOS**, última posición de la barra, mismo rótulo
  («✕ Cerrar vista») y mismo índice. Va **en la barra y no en el encabezado** porque ahí la regla
  `#cine-ov .cine-barra .btn` le fija los 44 px exactos; en el encabezado su piso táctil hacía el
  encabezado de la B **30 px más alto** y con él la barra y la imagen de la B arrancaban más abajo.
- **`cine-add-b` («➕ Vista») y `cine-cerrar` («Cerrar») se mudaron al encabezado del modal**, al
  lado de ⛶ y ✕. Son controles del **modal** y no de una vista —por eso se emitían sólo en la A, con
  el id pelado—, y en la barra eran dos botones más que en la B: a 1280 y 1180 la A envolvía en
  **tres** líneas contra las **dos** de la B, **38 px** de diferencia.
  ⚠️ **CONSERVAN LA CLASE `cine-grp-vista`**, que no es cosmética: de ella cuelga la regla
  `#cine-ov.cine-min .cine-grp-vista { display:none }` del modo mínimo, y **tres condiciones del
  suite** exigen que en modo mínimo esos dos no se rendericen ni queden enfocables con Tab.
  ⚠️ **SIN `margin-left:auto`**: el hueco se lo lleva el alternador de vista (que nace
  `display:none`) o, en escritorio, el botón de maximizar. Un tercer margen automático repartiría
  el hueco en tres y los dos botones de ventana dejarían de quedar juntos en el borde.

### El cierre por vista — `vistaCerrarUna(V)`

| control | dónde | qué cierra |
|---|---|---|
| `cine-cerrar-v` / `b-cine-cerrar-v` | la barra de **cada** vista | **sólo su vista**; con una sola abierta, el visor |
| `cine-cerrar` | encabezado del modal | todo el visor (`cineCerrar`) |
| `cine-cerrar-todo` (✕) | encabezado del modal | todo el visor (`cineCerrar`) |

`vistaBCerrar` queda como envoltorio, y lo común se fue a `_vCerrarVistaResto()` —el repintado de
los cajones, `_vAccionesSync`, la sincronización y el biplano—.

⚠️ **LA QUE SOBREVIVE PASA A SER `_vistaA` Y CONSERVA SU PREFIJO Y SU `rot`.** Cerrando la A con
la B abierta, lo que queda es el **objeto** de la B: sigue con `pfx:'b-'` y `rot:'B'`, así que su
panel sigue diciendo «Vista B» y `_medEl` lo sigue resolviendo bien.
- No se renombran los ids del panel: sería cirugía sobre una treintena de nodos y sobre los casos
  que los buscan.
- **No se toca `rot`** porque de él sale la marca de origen de cada fila del cajón: reescribirlo a
  `'A'` haría que las mediciones ya tomadas dijeran que salieron de otra imagen.
- Que el rótulo que queda sea «Vista B» es la **decisión provisoria** y queda declarada
  (**M4a-a**).

⚠️ **LA VISTA QUE SOBREVIVE SE ACTIVA *ANTES* DE DESTRUIR EL PANEL.** Desde esta tanda los
cajones viven en la ranura de la vista activa, así que cerrando la A con los cajones adentro,
quitar su panel del documento **se llevaría los dos nodos con sus oyentes delegados** y la tabla
no volvería. `_vSlotSync` los muda primero.

⚠️ **NO VA ENVUELTA EN `_vBind`.** El `on` de `_vCablear` envuelve en `_vBind`, que repone la
vista anterior en su `finally`: cerrando la vista que estaba activa, ese `finally` dejaría `_V`
apuntando a la vista **destruida** y el clic siguiente escribiría en una imagen que ya no está en
el documento. (Hasta MEDIR-3 el de la B andaba por casualidad: `_V` solía ser `_vistaA` al
apretarlo.)

⚠️ **`vistaBAbrir` TOMA EL PREFIJO LIBRE Y NO SIEMPRE `b-`.** Desde que se puede cerrar la A, la
que sobrevive puede ser la del `b-`: montar otra con `b-` dejaría una treintena de ids
**duplicados** y `getElementById` devolvería los del panel viejo, así que el nuevo se dibujaría
sin responder a un solo clic. Hay dos lugares —`''`/A y `b-`/B— y se toma el que la vista que
queda no está ocupando. **Medido: cero ids duplicados** en los cuatro escenarios.

### La tabla sigue a la vista — `_vSlotSync()`

- La ranura `cine-der-slot` se emite **en las dos vistas**, prefijada: `cine-der-slot` y
  `b-cine-der-slot`. Hasta MEDIR-3 se emitía sólo con `esB` en falso.
- `_vSlotSync()` mueve **`cine-dop-slot` y `d2-cajon`** a la ranura de `_V`. Lo llaman
  **`_dopRender` y `_d2Render`** —con guarda `typeof`, porque viven en otro bloque `<script>`—, que
  es el único momento en que se sabe de qué vista es el número que se va a dibujar.
- **No mueve nada si ya está en su ranura**, y no es una optimización: mover un nodo que contiene
  al elemento **enfocado** le quita el foco, y los dos render corren después de apretar un botón de
  adentro del propio cajón.
- Los **nodos siguen siendo únicos**: se mueven, no se reemiten. Reemitirlos los duplicaría.

### El resultado integrado, abajo y centrado

`cine-biplano` y `cine-simp-uni` **se quedan donde nacen** —debajo de `#cine-paneles`— con
`margin: … auto`, `max-width:780px` y `width:100%`. Es una **reversión explícita** de una decisión
de MEDIR-1, por pedido del médico, y **sólo del resultado**: los dos cajones siguen mudándose a la
columna. La lista de `_cineAbrir` pasa de cuatro nodos a dos, y la mudanza inicial la hace
`_vSlotSync`.

### Los anchos y el corte

```css
@media (min-width: 1369px)                              { .cine-2v .cine-col-der { flex: 0 0 340px } }
@media (min-width: 1100px) and (max-width: 1368.98px)   { .cine-2v .cine-fila { flex-wrap: wrap }
                                                          .cine-2v .cine-col-der { flex: 1 1 100% } }
```

El selector `#cine-ov #cine-paneles.cine-2v …` es más específico que el de una vista, así que le
gana sin pelear por `!important`.

| ventana | modal | **una** vista: imagen / columna | **dos** vistas: imagen / columna | cuatro columnas |
|---|---|---|---|---|
| 1500 | 1472 | 1050 / 380 | **365 / 340** | sí |
| 1448 | 1420 | — | **339 / 340** | sí |
| 1440 | 1412 | 990 / 380 | **335 / 340** | sí |
| 1400 | 1372 | — | **315 / 340** | sí |
| 1372 | 1344 | — | **301 / 340** | sí |
| **1369** | 1341 | — | **300 / 340** | sí (el corte) |
| 1368 | 1340 | — | 647 / 647 | **no, apiladas** |
| 1280 | 1252 | 830 / 380 | **603 / 603** | no, apiladas |
| 1180 | 1152 | 730 / 380 | **553 / 553** | no, apiladas |

⚠️ **Por debajo del corte, en modo de dos vistas, el modal se desplaza**: 342 px a 1280 y 303 a
1180. Es inherente a apilar imagen y medidas en cada mitad y queda declarado (**M4a-b**). Con
**una** vista el modal no se desplaza en ninguno de los cuatro anchos.

⚠️ **NO SE RECORTÓ NI SE AMPLIÓ LA IMAGEN.** El canvas sigue midiendo `cols × filas` en píxeles y
`_medPintar` sigue calzando el overlay contra `cine-recorte`, así que `_medPunto` devuelve las
mismas coordenadas de imagen y la calibración no se entera.

---

## 2 · Bloque B — una sola vista

**No necesitó código propio**, y es medible: la disposición «imagen a la izquierda, panel a la
derecha, resultado en una franja debajo de las dos» sale de la **misma plantilla única** y del
**mismo traslado del resultado** que el bloque A. Medido en los dieciséis cruces: la columna
arranca a la derecha del lienzo, los dos paneles de resultado están **fuera** de `.cine-col-der` y
**después** de `#cine-paneles`, el desbalance contra el modal es **0**, y mostrando el resultado
**el panel no se mueve un píxel** (380 → 380 y 1050 → 1050). Declarado en el commit del bloque A.

---

## 3 · Bloque E — sale la casilla de Anahí de cada fila

`_medTablaHTML` vuelve a **tres** columnas: `Medida | Valor | Acciones`, con el `colgroup` en
**42 / 26 / 32 %** y el `colspan` del separador de «Mediciones sin asignar» en **3**.

- El 10 % que deja la casilla **se reparte entre las tres** y no se le da todo a una: con la
  columna en 340 px con dos vistas, el nombre es el que envuelve primero.
- `anahiCeldaHTML` y la clase `anahi-cel` se retiran **con su lápida**, y el oyente delegado deja
  de mirar `.anahi-cel`: le queda **`.anahi-btn`**, que es la de los dos botones.
- **Lo que NO se tocó**: el botón «Para Anahí» de Imágenes guardadas, el del menú de Exportar de
  Estudios guardados, el cartel propio con su aviso corto, el bloque de Configuración, el estado
  único `ANAHI_ON` y el nombre único `ANAHI_NOMBRE`.
- **Nada se envía y nada se guarda**, que es lo que ya pasaba: la casilla nacía deshabilitada, con
  candado y con `pointer-events:none`, y su único efecto era abrir el cartel.

⚠️ **EL FILTRO DE FILAS DE SEIS CASOS PEDÍA CUATRO CELDAS**, y con la cuarta retirada su lista
salía **vacía**: el denominador daba cero sobre una tabla que **sí** estaba pintada. Los destapó
correr los casos que miran la tabla, no el censo. Ver § 6.

---

## 4 · Bloque C — «+ Vista» con cineloops y con imágenes fijas

### El filtro

```js
// antes:  r.tipo !== 'fija' && r.tipo !== 'doc'
// hoy:    r.tipo !== 'doc'
```

El motivo escrito del filtro viejo —«ofrecer una tabla de resultados como si fuera un cineloop es
un elemento que al elegirlo no reproduce nada»— **vale para `'doc'` y no vale para una fija**: una
imagen fija del estudio es una imagen del paciente, se dibuja en el lienzo y se le puede medir
distancia, área y Doppler según su región.

### El predicado único

`_vEsFija(r)` → `tipo === 'fija'` **o** `cuadros <= 1`. Lo leen la **marca de la miniatura**, el
**texto del pie** y la **marca que se le pone a la vista**. Mira las dos cosas y no sólo `tipo`
porque esa base guarda los cineloops y el **original de cada fija DICOM**, y su propio comentario
declara que «un cineloop es `cuadros > 1`».

### Los rótulos que no se repiten sin distinguirse

El criterio es el que el bloque 0 dejó escrito:

| situación | qué se hace |
|---|---|
| misma terna `nombre` + `cuadros` + `bytes` | es **el mismo archivo** listado dos veces → se muestra **UNA** vez |
| mismo `nombre`, distinto peso o distintos cuadros | son **dos archivos** → se distinguen con su **ordinal** «(1 de 2)» y con su **peso** |

El `id` del registro **no sirve** para distinguirlos a la vista: es la clave del almacén y no le
dice nada al médico.

⚠️ **EL PICKER PUBLICA LA LISTA QUE DE VERDAD DIBUJÓ (`_vPickLista`).** El índice que resuelve es
de **su** lista, así que con un duplicado descartado quien llama abriría el registro de al lado —
un dato del paciente equivocado, en silencio.

### La marca de la miniatura

Un chip `.vpick-chip` con el texto **«imagen fija»**, puesto como **nodo** y por `textContent`,
nunca interpolado en HTML. La tarjeta lleva además `data-vpick-fija="1"`. El `alt` de la miniatura
y el pie también cambian.

El **subtítulo** del selector nombra las dos cosas **y avisa del Simpson ANTES de elegir**, no
después: el mensaje de una línea que aparece al elegir la herramienta es la red, no el aviso.

### El Simpson, bloqueado en una vista de imagen fija

**Cuarta capa de `medHerramienta`**, la misma cadena que ya existe para las herramientas de
Deformación con el módulo apagado y para Velocidad sobre un modo M:

```js
if (h === 'simpson' && _medSimpsonBloqueadoFija()) { h = 'dist'; toast('Simpson necesita …'); }
```

- El predicado es **`_medSimpsonBloqueadoFija()`** y lo leen **el botón y `medHerramienta`**, para
  que no puedan discrepar: el botón se vería disponible y la herramienta caería al defecto, o al
  revés.
- El botón sale **apagado y a la vista**, no retirado, con el motivo en su `title`. Distancia,
  Área y las de Doppler **siguen disponibles**.
- El mensaje sale por **`toast` y no por `alert`**: cuando esto corre el médico está eligiendo una
  herramienta, no decidiendo nada.

⚠️ **EL PREDICADO ES UNA MARCA DE LA VISTA (`V.esFija`) Y NO UN CONTEO DE CUADROS, y la diferencia
está medida**: **siete** casos del suite —TC-196, TC-227, TC-228, TC-237, TC-239, TC-241 y
TC-245— trazan Simpson sobre fixtures de **un** cuadro, porque el visor siempre lo permitió sobre
una imagen suelta del pendrive. Un predicado por `frags.length` los habría puesto rojos a los
siete y habría **sacado una función que el pedido no manda sacar**. Lo que el pedido acota es la
vista que se abre **eligiendo** una fija guardada, que es un camino **nuevo** de esta tanda.

⚠️ **LA MARCA SE SUELTA EN `_cineAbrir`.** El objeto de la vista A sobrevive a cerrar y reabrir el
visor, así que una marca pegada dejaría el Simpson bloqueado sobre el cineloop **siguiente**, por
una razón que no está en la pantalla. Es la misma trampa que `_clnkPorConfirmar` y `data-pop-mano`
ya pagaron.

### El biplano de dos cineloops no se rompe

Medido: cerrando la vista fija y abriendo un cineloop, la marca se suelta, el Simpson vuelve a
entrar sin mensaje, **las dos sesiones quedan vivas** y `_vBiplanoDatos` sigue existiendo.

---

## 5 · Lo medido, en los dos motores

`scripts/_probe_medir4a.mjs` — **Chrome y WebKit × 1500, 1440, 1280 y 1180 × los dos temas
reales** (puestos por `ett_theme` + `loadTheme()`, y la sonda **devuelve** cuál quedó) = **16
cruces**, con **una sola firma de valores** y **cero errores de consola y de página**.

`scripts/_probe_medir4cierre.mjs` — los cuatro escenarios de cierre con el **gesto real**, en los
dos motores. Lo único sustituido es `_vElegirLoop`, porque `vistaBAbrir` es el único camino que
escribe `_vistaB` —un `let` de nivel de script— y depende de `_imgUuidActual` y de `CeiboCine`.

`scripts/_probe_medir4c.mjs` — el bloque C de punta a punta, en los dos motores. Lo único
sustituido es el **almacén**.

⚠️ **WebKit de Playwright no es Safari, y se declara** — y el médico usa Safari. Chrome va por el
del sistema (`channel:'chrome'`).

---

## 6 · Cobertura

**Cuatro casos nuevos**, los cuatro cayendo contra `e7a1f3e` con el mismo archivo de casos y sólo
el `index.html` distinto, **por condiciones y NINGUNO por excepción**:

| caso | qué fija | condiciones rojas contra la base |
|---|---|---|
| **TC-892** | la plantilla única: misma cuenta y mismo orden de botones, encabezados sin botones, «Cerrar vista» en las dos, «➕ Vista» y «Cerrar» fuera de toda barra, modo mínimo intacto, cero ids duplicados | **9** |
| **TC-893** | el cierre por vista con el gesto real, la promoción de la que sobrevive, el prefijo libre, y la tabla que sigue a la vista conservando las dos medidas con su marca | **10** |
| **TC-894** | el resultado abajo, fuera de la columna, centrado y sin empujar el panel; los cajones en la ranura de la vista activa; y las reglas del corte leídas de `document.styleSheets` | **9** |
| **TC-895** | el selector con fijas, la marca, la deduplicación, los homónimos distinguidos, el Simpson bloqueado con su mensaje y su control negativo, y el biplano intacto | **16** |

**Nueve casos adaptados**, ninguno borrado y ninguno aflojado:

| caso | qué cambió |
|---|---|
| **TC-882** | **(A), (D) y (E) INVERTIDAS**: hoy exige TRES columnas, tres celdas por fila, ninguna casilla en los dos cajones, ningún candado, y que la celda vieja no quede en ninguna parte del documento. Cae por **8** condiciones. |
| **TC-886** | **(a) INVERTIDO** y el **disparador del cartel pasa de la celda al BOTÓN**. Las otras cinco partes se siguen midiendo igual. Cae por **3**. |
| **TC-249** | el `colspan` del separador, 4 → 3. Cae por **1**. |
| **TC-262, TC-883, TC-885, TC-887, TC-889, TC-891** | sólo el **filtro** de filas de su lector, que pedía cuatro celdas y pide tres. Es un **denominador**, no una afirmación, y vale igual a los dos lados: **pasan en los dos árboles** y se declaran. |

⚠️ **TRES COSAS QUE MI CENSO NO VIO Y LA CORRIDA SÍ.** El filtro `children.length >= 4` vivía en
**seis** lectores distintos con seis nombres de variable distintos, así que buscar «la tabla» no
los encontró; los destapó correr los casos que la miran. Y **TC-895 costó una corrida** por un
orden mío: `imgVaciar` pone `_imgUuidActual` en `null`, así que llamarlo **después** de sembrar el
uuid lo borraba y `_vElegirLoop` salía por su primera guarda — el síntoma no se parecía a la
causa, porque el caso informaba el uuid bien puesto (lo leía antes) y después «el selector no
abrió».

### Tres mutaciones dirigidas, las tres muertas

En un worktree y **nunca** sobre el vivo, con el md5 del vivo **idéntico** antes y después
(`359755ea`) y las tres anclas verificadas **antes** de correr:

| # | mutación | mata | por |
|---|---|---|---|
| 01 | el «Cerrar vista» de la A cierra todo el visor (el estado de MEDIR-3) | **TC-893** | 7 condiciones |
| 02 | la barra de la A vuelve a tener un botón más que la de la B | **TC-892** | 3 condiciones |
| 03 | la tabla se queda siempre en la columna de la A aunque se mida la B | **TC-893** | 3 condiciones |

---

## 7 · Las trampas de esta tanda

1. **El acento grave dentro de mis propios comentarios, por vigesimoctava tanda seguida** — en
   dos sondas y en cinco bloques de casos. Lo que lo caza es `node --check` **y**
   `scripts/check_backticks.py`: una vez lo que quedó fue JS **válido** (dos acentos graves
   alrededor de `.click()` se cancelan), así que `node --check` **pasó** y lo encontró el otro.
2. **La clave de las condiciones es `extra`, no `ex`** — con `ex` el runner dice «el caso no
   declara NINGUNA condición» y lo reporta rojo sin medir nada.
3. **`d2Modo` y `dopModo` ALTERNAN** — llamarlos dos veces con el mismo grupo lo **apagan** y la
   tabla sale vacía, que se lee igual que «la tabla se perdió». Los dos ayudantes **aseguran** el
   modo en vez de alternarlo.
4. **La ventana del arnés mide 756 px**, así que la media query de 1100 no aplica y el visor
   muestra **una** vista a la vez (`#cine-paneles > div { display:none }` con su
   `:first-child { display:flex }`): el panel escondido **no tiene geometría** y sus botones
   informan **cero**, que no es un botón chico sino uno que no se está dibujando. Los 44 px de las
   dos barras a la vez los mide la sonda de dos motores.
5. **`cineCerrar` NO destruye la vista B, a propósito** —es la otra mitad de «lo medido se
   conserva»—, así que una sonda que reutiliza la página deja el panel montado y el escenario
   siguiente mide sobre tres paneles. Cada escenario va en **su propia página**.

---

## 8 · Lo que esta tanda NO hizo

- **El bloque D** (el flujo de dos pasos del Simpson biplano, su resultado integrado y los textos
  al ⓘ): **no se empezó**. Ver **M4a-f**.
- **No se escribe ningún campo del informe.** No se tocaron `_simpEscribirFEVI`, `medVtiDiametro`
  ni `medVtiCargar`, y el botón «¿Integrás la FEVI biplano al informe?» quedó como estaba — eso es
  de la tanda siguiente.
- **No se unificaron nombres** entre el visor y la app, y **no cambió qué se guarda**.
- El **«Guardar en biblioteca»** del panel del Simpson no se tocó.
