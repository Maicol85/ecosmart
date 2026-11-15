# INVENTARIO MEDIR-4 — el bloque 0, medido antes de tocar nada

Tanda **MEDIR-4**, bloque 0. **Solo lectura**: este documento y `docs/MAPA_CAMPOS_VISOR.md` son
lo único que el commit del bloque 0 cambia; `index.html` queda idéntico (md5 `6545b13e`).

**Línea base:** `a3a75a7`, sello `v20261114-2057`, md5 `6545b13e`, **182.292** líneas,
**13.163.769** bytes — los tres verificados con `wc -l`, `wc -c` y `md5` y los tres idénticos a
lo que `CLAUDE.md` publica. **Por cuadragésima primera vez seguida el renglón de tamaño que se
encontró estaba bien.**

**Pendrive:** `/Volumes/DISK_IMG` **montado**, verificado al abrir el bloque.

**Cómo se midió la pantalla:** `scripts/_probe_medir4.mjs`, en **Chrome y WebKit × 1440×900,
1280×800 y 1180×800 × los dos temas reales** —puestos por `ett_theme` + `loadTheme()`, y la sonda
**devuelve** cuál quedó—, o sea **doce cruces**, con la vista B montada como la monta TC-199
(`_vNueva` + `_vMontarPanel` + `_vCablear`, porque `vistaBAbrir` exige un estudio guardado y
`CeiboCine.listar`). **Cero errores de consola y de página en los doce**, dos paneles montados y
la clase `cine-2v` puesta en los doce. **Chrome y WebKit coinciden en TODO lo que sigue.**

⚠️ **Y LA SONDA LLEVA SU DETECTOR DE QUE SON DOS ÁRBOLES** (`tieneLoNuevo`), que en esta corrida
da **false** en los doce — como corresponde, porque esto es la línea base.

⚠️ **EL ACENTO GRAVE DENTRO DE UN COMENTARIO DEL TEMPLATE DE LA SONDA, POR VIGESIMOSÉPTIMA TANDA
SEGUIDA.** Dos, en el comentario que explica por qué la vista B se monta a mano. Cierran el
template literal antes de tiempo y `node --check` lo cazó con «missing ) after argument list».

---

## 1 · La tabla de hipótesis

| # | lo que la orden afirma | veredicto | con qué se mide |
|---|---|---|---|
| **H1** | el «Cerrar» de la vista izquierda cierra todo el visor y el «Cerrar vista» de la derecha cierra sólo esa vista | **CONFIRMADA** | § 2 |
| **H2** | las barras de las dos vistas difieren en orden, altura y posición del Cerrar, y las dos imágenes no quedan a la misma altura | **CONFIRMADA en sus cuatro mitades** | § 3 |
| **H3** | «+ Vista» ofrece sólo cineloops, nunca imágenes estáticas | **CONFIRMADA** | § 4 |
| **H4** | el selector puede listar dos veces el mismo cineloop | **CONFIRMADA la mitad visible**; cuál de las dos cosas era, **no lo pude confirmar** | § 4 |
| **H5** | el Simpson biplano conserva los trazados de A4C y A2C entre las dos vistas, y es el único dato que se comparte | **FALSA en su letra, cierta en su efecto** | § 5 |
| **H6** | un solo juego de campos para FEVI, VDFVI y VSFVI, y un selector de método con biplano, Teichholz y Visual; sin campos separados para A4C y A2C | **CONFIRMADA** (la opción se escribe «Teicholz») | § 6 |
| **H7** | la app calcula sola el FAC del VD desde las dos áreas, y calcula sola los indexados | **CONFIRMADA** | § 6 |
| **H8** | al escribir un campo desde el visor se disparan los mismos recálculos que al tipear, si se usa la misma puerta | **CONFIRMADA, con una precisión que importa** | § 7 |

---

## 2 · (a) Qué hace cada «Cerrar» — H1

Leído del manejador **cableado** y no apretándolo: apretarlo cierra el visor y se lleva puesta la
medición de todo lo que sigue. El nombre de la función es lo que dice qué hace.

| control | dónde vive | rótulo | cableado a | qué hace |
|---|---|---|---|---|
| `#cine-cerrar` | **barra de la vista A** | «Cerrar» | **`cineCerrar`** | cierra **todo el visor** |
| `#cine-cerrar-todo` | encabezado del modal | ✕ | **`cineCerrar`** | cierra todo el visor |
| `#b-cine-cerrar-v` | **encabezado de la vista B** | «✕ Cerrar vista» | `vistaBCerrar` envuelta en `_vBind` *(anónima)* | destruye **sólo** la vista B |
| «Cerrar vista» en la vista A | — | — | — | **NO EXISTE** (`cerrarVistaEnA` = false en los doce cruces) |

**H1 confirmada, y con el agravante que la orden no nombra:** los dos controles no son simétricos
ni de nombre ni de lugar. El de la A dice «Cerrar» y está **en la barra**; el de la B dice «✕
Cerrar vista» y está **en el encabezado**. Y la A **no tiene** forma de cerrarse sola: con las dos
vistas abiertas, el médico que quiere quedarse sólo con la B no tiene ningún control que lo haga.

`vistaBCerrar` sí hace lo correcto para la B: `_cineDetener` + `medApagar`, saca el panel del DOM,
repinta los dos cajones, suelta la sincronización, devuelve `_V` a la A y repinta el biplano.
**«Sincronizar» existe** (`#cine-sync`) y hay que conservarlo.

---

## 3 · (a) y (b) Cómo está armado hoy el modo de dos vistas — H2

### La disposición ya es de cuatro columnas

⚠️ **UNA PREMISA DEL BLOQUE A NO SE REPRODUCE: la disposición «imagen A | medidas A | imagen B |
medidas B» YA EXISTE.** Cada panel es una `.cine-fila` con el lienzo a la izquierda y la
`.cine-col-der` de 380 px a la derecha, y los dos paneles van lado a lado dentro de
`#cine-paneles`. Medido a 1440: `panelA` en x=31 y `panelB` en x=726, los dos de 683 px, y dentro
de cada uno el lienzo de 295 y la columna de 380. O sea que lo que el bloque A tiene que arreglar
**no es la disposición** sino la alineación, el cierre y dónde va el resultado.

### Los anchos, medidos

| ventana | modal | una vista: lienzo / canvas | dos vistas: panel | lienzo | **canvas** | col. der. |
|---|---|---|---|---|---|---|
| 1440×900 | 1438 | 990 / **600** | 683 | 295 | **295** | 380 |
| 1280×800 | 1252 | 830 / **600** | 603 | 215 | **215** | 380 |
| 1180×800 | 1152 | 730 / **600** | 553 | 165 | **165** | 380 |

⚠️ **CON DOS VISTAS LA IMAGEN YA ESTÁ POR DEBAJO DE LOS 300 px EN LOS TRES ANCHOS, Y ESO DECIDE EL
PUNTO 5 DEL BLOQUE A.** No es una consecuencia de un cambio futuro: es el estado de hoy. A 1440 la
imagen mide **295 px** —cinco por debajo del piso que la orden fija—, a 1280 **215** y a 1180
**165**. La columna de medición son 380 px **fijos** por la media query, así que el reparto es
`imagen = (modal − 32 de relleno − 12 de hueco − 16 de huecos internos − 760 de las dos columnas) / 2`.
Para que la imagen llegue a 300 px hace falta un modal de **1420** px, o sea una **ventana de
~1448 px** —y el modal topa en 1500—. **El ancho de corte de las cuatro columnas es ≈1448 px**, y
queda como la pregunta del reporte.

### Las dos barras

| | barra A | barra B |
|---|---|---|
| botones | **8** | **6** |
| ids, en orden | `cine-medir`, `cine-med-recal`, `cine-med-borrar`, `cine-guardar`, `cine-cap`, `cine-med-cap`, **`cine-add-b`**, **`cine-cerrar`** | `cine-medir`, `cine-med-recal`, `cine-med-borrar`, `cine-guardar`, `cine-cap`, `cine-med-cap` |
| alto de cada botón | **44 px exactos** | **44 px exactos** |
| alto de la barra (1440) | 92 | 92 |
| alto de la barra (1280 y 1180) | **130** | **92** |
| borde de arriba | y=238 / 183 / 175 | y=268 / 213 / 205 |

- **Mismo orden: NO** (`barrasMismoOrden` = false en los doce cruces). Los dos que la B no tiene
  son `cine-add-b` y `cine-cerrar`, que son controles **del modal** y se emiten sólo en la A a
  propósito, para no duplicar ids. El «✕ Cerrar vista» de la B, en cambio, vive en el
  **encabezado** y no en la barra.
- **Misma altura en la pantalla: NO.** Las dos barras están a **30 px** de diferencia en los seis
  cruces de los tres anchos. La causa está medida: el encabezado de la B lleva el botón «✕ Cerrar
  vista» de 44 px y el de la A no, así que el encabezado de la B es 30 px más alto.
- **Mismo alto de barra: NO a 1280 y 1180**, donde difieren **38 px**: la A envuelve en **tres**
  líneas (sus ocho botones de 118 px no entran en 603) y la B en **dos**. A 1440 las dos miden 92.
- **Los botones individuales SÍ miden 44 px exactos** en los doce cruces, mínimo y máximo: eso lo
  fijó MEDIR-3 y no hay que tocarlo. Lo que difiere es **cuántas líneas** ocupa cada barra y
  **dónde empieza**.

### Las dos imágenes y los controles de reproducción

| ventana | Δ del borde de arriba de la imagen | Δ del alto | Δ del slider |
|---|---|---|---|
| 1440×900 | **30 px** | 0 | **30 px** |
| 1280×800 | **8 px** | 0 | **8 px** |
| 1180×800 | **8 px** | 0 | **8 px** |

**H2 confirmada en sus cuatro mitades.** El alto de la imagen sí coincide (Δ 0 en los doce); lo
que no coincide es **a qué altura empieza**, y con ella el slider. Los 30 px de 1440 son el
encabezado; los 8 de 1280 y 1180 son otra cosa —ahí la barra de la A ocupa una línea más, así que
la A empuja su imagen **más abajo**, y el signo se da vuelta: a 1440 la B está más abajo, a 1280 y
1180 la A—. Las dos causas hay que cerrar.

**Y nada de esto desborda:** `modalScrollY` y `docScrollX` dan **0** en los doce cruces, con una y
con dos vistas; **cero textos recortados** y **cero botones por debajo de 44 px** de área táctil
(41 botones visibles contados).

---

## 4 · (c) Cómo arma «+ Vista» su lista — H3 y H4

`vistaBAbrir` → `_vElegirLoop(V)` → `_vPickerLoop(V, lista)`.

**H3 CONFIRMADA, y el motivo está escrito en el código:**

```js
lista = (lista || []).filter(r => r && r.tipo !== 'fija' && r.tipo !== 'doc');
```

con su comentario: «Se excluyen las fijas Y los documentos: la segunda vista abre un CINELOOP, y
ofrecer una tabla de resultados como si lo fuera es un elemento que al elegirlo no reproduce
nada». La sonda lo confirma leyendo la fuente de la función (`pickerSoloLoops` = true en los doce).
Y si no queda ninguno, `_vElegirLoop` avisa «Este estudio no tiene cineloops guardados para abrir
en la segunda vista».

**El pie de cada miniatura es, literalmente:**

```js
pie.textContent = (r.cuadros || '?') + ' cuadros · ' + (r.nombre || 'Cineloop');
```

**H4 — confirmada la mitad que se puede confirmar.** `CeiboCine.listar(uuid)` devuelve los
registros del índice `uuid` **tal cual**, cada uno con su `id` propio (la clave del almacén), así
que **dos miniaturas son siempre dos registros distintos**. Lo que el selector muestra de cada uno
son **sólo `cuadros` y `nombre`**, y el `nombre` es el del archivo del ecógrafo —«un UID, casi
siempre», dice su propio comentario—. Así que **dos registros con el mismo nombre y la misma
cantidad de cuadros se dibujan indistinguibles**, y el médico no tiene con qué elegir. Eso es un
defecto real del selector y es lo que la captura muestra.

**Lo que NO pude confirmar** es cuál de las dos cosas eran los dos `Q9JG9U02` del médico: el mismo
cineloop guardado dos veces, o dos distintos con igual código. Hace falta su almacén. **El
criterio que lo decidiría sí se puede nombrar**: dos registros del mismo archivo tienen el mismo
`nombre`, el mismo `cuadros` **y el mismo tamaño en bytes** de `datos`; dos archivos distintos con
igual código difieren en al menos uno de los dos últimos. El Bloque C lo necesita.

---

## 5 · (d) El estado por vista y qué se comparte — H5

**Cada vista tiene su estado de medición COMPLETO.** `_vNueva` declara 25 campos por vista y los
nombres viejos (`_medPuntos`, `_simp`, `_medCalibVel`…) son **propiedades de acceso** que resuelven
contra la vista activa `_V`. Medido en la sonda, con las dos vistas montadas: `tablasSeparadas`,
`calibSeparada` y `simpSeparado` dan **true** en los doce cruces.

⚠️ **LA TRAMPA QUE EL ARCHIVO YA DOCUMENTA Y QUE HAY QUE RESPETAR: `_V` es AMBIENTE.** Toda función
que espere algo captura `const V = _V` **antes** del `await`. Y la calibración y las tablas son
**por vista**: `medCalVelP0` es estado de vista desde MEDIR-3 justamente por esto.

**H5 es FALSA en su letra.** Nada se *conserva entre* las dos vistas: cada una guarda su propia
sesión `V.simp` con su propia `pares[]`. Lo que hace el biplano es **cruzarlas al vuelo**:
`_vBiplanoDatos()` lee `_vistaA.simp.pares[0]` como 4C y `_vistaB.simp.pares[0]` como 2C,
multiplica los diámetros y toma el eje largo más largo de los dos. **El resultado no se guarda en
ninguna parte**: se recalcula en cada repintado.

**Pero es cierta en su efecto**, que es lo que la orden quiere decir: el biplano es lo único que
combina datos de las dos vistas. Y hay dos guardas que hay que no romper:

- **`_vEpocaVigente` en las DOS vistas** antes de cruzar. Es el único sitio del archivo que
  multiplica mediciones de dos vistas, así que es el único donde una vista recién medida puede
  combinarse con otra que quedó de un paciente anterior. Su comentario lo dice: «UNA FEVI biplano
  calculada con la 4C de un paciente y la 2C de otro, y esa FEVI la ofrece `_simpEscribirFEVI`
  para integrarla al informe firmado. Un número perfectamente presentable y de nadie».
- **Cada trazado lleva la escala de SU imagen** (`cmPorPx` por par), que es lo que permite cruzar
  dos cineloops con profundidades distintas —en el pendrive la escala 2D va de 0,046 a 0,926
  mm/píxel—.

Y una vista **sola** también puede completar un biplano: `_simp.pares` tiene **dos** ranuras y
`_simp.nombres` guarda la ventana de cada una, así que trazar la 4C, cambiar de cineloop y trazar
la 2C en la misma vista da el biplano sin abrir la B. Eso funciona desde el 2026-09-20.

---

## 6 · (e) y (f) Qué escribe hoy el botón del biplano, y la biblioteca — H6 y H7

### El botón «¿Integrás la FEVI biplano al informe?»

`#cine-biplano-integ`, emitido por `_vBiplanoPintar` y sólo cuando el cruce A × B existe. Al
apretarlo: `_vBiplanoDatos()` otra vez —no reusa el valor pintado— y `_simpEscribirFEVI(D.fevi)`.

**Escribe exactamente dos cosas, y nada más:**

| campo | valor | cómo |
|---|---|---|
| `fevi` | `fevi.toFixed(0)` — **entero** | `el.value`, y después `input` **y** `change` |
| `fevi_met` | la cadena **«Simpson biplano»** | `met.value`, y después `change` |

Con un valor previo distinto **pregunta** por `confirm`: «El campo FEVI ya tiene X %. ¿Reemplazarlo
por Y % (Simpson biplano)?». Con el mismo valor **no pregunta** (compara `previo !== nuevo`). Y
**no escribe `vdfvi` ni `vsfvi`**: los dos volúmenes del biplano se calculan, se publican en el
panel y **no llegan a ningún campo**. Eso es lo que el Bloque F punto 3 agrega.

`medSimpsonIntegrar()` es la otra vía —la sesión de **una** vista con su `res.bi`— y llama a la
**misma** `_simpEscribirFEVI`, que es por lo que hay una sola implementación: «con dos copias, una
podría pisar un valor cargado sin preguntar y la otra no, sobre el mismo campo del informe
firmado».

### H6 y H7, verificadas en el marcado

- **Un solo juego de campos:** `fevi` (FEVI (Simpson, %)), `vdfvi` (VDFVI (ml)), `vsfvi` (VSFVI
  (ml)). **No hay campos separados para A4C y A2C** — ningún id de ventana en el formulario.
- **`fevi_met`** es un `select` con **exactamente tres** `option`: «Simpson biplano», «Teicholz»,
  «Visual». ⚠️ **La orden la escribe «Teichholz» con dos haches y la app escribe «Teicholz»**; se
  usa la de la app, que es la que el `select` compara.
- **`vd_fac`** es `readonly`, con el rótulo «FAC VD (%) **auto ← áreas**», y lo escribe `calcVD()`
  —que es el `oninput` de `vd_area_d` y de `vd_area_s`—. **H7 confirmada en su primera mitad.**
- **Los indexados no son campos:** «VDFVI indexado (ml/m²)» y «VSFVI indexado (ml/m²)» son dos
  `span` (`vdfvi-idx-interp`, `vsfvi-idx-interp`) dentro del `calc-box`. **H7 confirmada en su
  segunda mitad.**

### (f) «Guardar en biblioteca» del panel del Simpson — solo informar

**Existe**: `#cine-simp-bib-u`, rótulo «💾 Guardar en biblioteca», título «Guarda la tabla como
archivo del estudio. NO sale en el PDF». Llama a `medSimpsonTablaBiblioteca()`, que rasteriza la
**tabla** a un canvas y la manda a `_docGuardarEnBiblioteca(canvas, …)`, o sea a los archivos del
estudio. Una vez guardada aparecen «🗑️ Eliminar» y «📄 Incluir en PDF».

⚠️ **LO QUE GUARDA ES LA TABLA, NO LOS CONTORNOS**, y el propio panel lo dice: «Los contornos no se
guardan, así que no se puede seguir midiendo sobre ella: para eso hay que volver a trazar». **No se
toca en esta tanda.**

⚠️ **LA SONDA LO MIDE EN `false` EN LOS DOCE CRUCES, y eso NO lo contradice**: ese botón sólo se
emite con una sesión de Simpson con resultado, y el fixture de la sonda no traza ningún contorno.
Es un denominador vacío declarado, no una ausencia.

---

## 7 · (e) H8 — los recálculos al escribir desde el visor

**CONFIRMADA**, y con la precisión que decide cómo se escribe la puerta del Bloque F.

Los campos del formulario llevan sus recálculos **en atributos en línea** (`oninput=` y
`onchange=`), y un atributo en línea **sí corre** con un evento despachado por JS. O sea que
`el.value = v` + `dispatchEvent(new Event('input', {bubbles:true}))` dispara exactamente lo mismo
que una tecla.

**Censo de los recálculos de los campos del mapa** —leídos del marcado, uno por uno—:

| campo | `oninput` | `onchange` |
|---|---|---|
| `vd_area_d`, `vd_area_s`, `tapse`, `vd_bas`, `vd_mid`, `vd_long` | `calcVD()` | — |
| `siv`, `ppvi`, `ddfvi`, `dsfvi`, `vdfvi`, `vsfvi` | `calcVI()` | — |
| `fevi` | `calcVI(); aoRefPintar(); calcDiastol()` | — |
| `diam_tsvi` | `tsviDiamEditado('diam_tsvi')` | — |
| `itv_tsvi` | `eaParEditado('itv_tsvi'); vtDviAuto(true); vtProtObstrPintar()` | — |
| `vti_tsvd` | `etTsvdSync(…); calcHemo(); eteShuntSyncSiExiste(); calcET(); calcVD()` | — |
| `tsvd_diametro` | `etTsvdSync(…); eteShuntSyncSiExiste(); calcET(); calcVD()` | — |
| `ao_sin` | `aoRaizSync('aivi'); taviAoSync(…); calcAorta()` | — |
| `ao_st`, `ao_tub` | `taviAoSync(…); calcAorta()` | — |
| `ai_diam` | `calcAI()` | — |
| `vmax_ao` | `aoTangoApagarPorVmax(); eaParEditado('vmax_ao')` | — |
| `gmedio_ao` | `eaParEditado('gmedio_ao')` | — |
| `vmax_it` | `itVmaxSync(…); calcPSAP(); calcIT_ESC(); calcDiastol()` | — |
| `vp_vmax` | `vpVmaxSync(…); calcVP()` | — |
| `ia_pht` | `calcIA_ESC()` | — |
| `onda_a` | `calcDiastol()` | — |
| **`onda_e`** | `calcDiastol(); cvrSync();` | **`cvrCambio()`** |
| **`e_sep`, `e_lat`** | `calcDiastol(); cvrSync();` | **`cvrCambio()`** |
| **`vci_diam`** | `calcPmAD(); dptSync(); cvrSync(); calcDiastol()` | **`dptSync(); cvrSync(); vexusRefrescarInforme()`** |

⚠️ **CUATRO CAMPOS TIENEN `onchange` ADEMÁS DE `oninput`, Y LAS DOS PUERTAS VIEJAS EMITEN SÓLO
`input`.** `medVtiDiametro` y `medVtiCargar` despachan únicamente `input`; `_simpEscribirFEVI`
despacha **las dos**. Hoy eso no muerde, porque los cuatro campos que esas dos puertas escriben no
tienen `onchange` — pero la puerta del Bloque F alcanza a `onda_e`, `e_sep`, `e_lat` y `vci_diam`,
y emitiendo sólo `input` dejaría sin correr `cvrCambio()` y `vexusRefrescarInforme()`. **La puerta
del Bloque F tiene que emitir `input` y `change`**, que es lo que hace el único de los tres
escritores que ya alcanza un campo con las dos.

**Las tres rutas de MEDIR-3 que no se pueden romper:** `diam_tsvi` por `medVtiDiametro`,
`itv_tsvi` y `vti_tsvd` por `medVtiCargar`, y `fevi` por `_simpEscribirFEVI`.

---

## 8 · Lo que el bloque 0 deja anotado para los bloques siguientes

1. **La disposición de cuatro columnas ya existe** (§ 3). El Bloque A no la construye: arregla la
   alineación, el cierre por vista y dónde va el resultado integrado.
2. **El ancho de corte es ≈1448 px** para que la imagen llegue a 300 px con las cuatro columnas
   (§ 3). Por debajo hay que apilar, y hay que declararlo.
3. **La vista A no tiene «Cerrar vista»** y su «Cerrar» cierra todo (§ 2). El Bloque A punto 4
   cambia las dos cosas.
4. **Los 30 px y los 8 px tienen causas distintas** (§ 3): el encabezado de la B, y la barra de la
   A envolviendo una línea más. Hay que cerrar las dos.
5. **El resultado integrado hoy vive en la columna derecha de la vista A**, adonde lo mudó MEDIR-1
   con un motivo escrito. El Bloque A punto 1 lo devuelve abajo y centrado: es una **reversión
   explícita** de esa decisión, por pedido del médico, y sólo del resultado —`cine-biplano` y
   `cine-simp-uni`—, no de los dos cajones de medidas.
6. **Los cajones `dop-cajon` y `d2-cajon` son ÚNICOS del overlay**, no hay uno por vista, y viven
   en la ranura `cine-der-slot` de la vista A. «Medidas A» y «medidas B» no son simétricas hoy:
   la columna de la B tiene su selector y su panel guía, y no la tabla.
7. **El selector de «+ Vista» no puede distinguir dos registros con igual nombre y cuadros**
   (§ 4). El Bloque C necesita el tamaño en bytes.
8. **La puerta del Bloque F emite `input` y `change`** (§ 7).
9. **El comentario de los dos automáticos del VI declara un censo que ya es falso** —dice que
   nadie le escribe `.value` a `fevi` y `_simpEscribirFEVI` lo hace—, sin que eso rompa su
   conclusión. Declarado, no corregido.
