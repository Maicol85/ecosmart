# Mapa · PANT-11 — el papel de Ebstein y Eisenmenger, la VCI no visualizada, el eco pulmonar por lado y las masas en Otros

**Tanda PANT-11, 2026-11-04.** Doce commits de código (1 a 11 más el 8b correctivo) y el 12 de
cobertura y documentación. Línea base al abrir: `cf04f84`, el cierre de PANT-10, md5 `c91b1462`,
sello `v20261104-1123`.

Este mapa va **por nombre de función y de constante**, no por línea: la línea cambia en cada
edición y el nombre no.

---

## 1 · El papel de la anomalía de Ebstein y del síndrome de Eisenmenger (commit 1)

Cierra **P10-a**, que PANT-10 dejó declarado con la medición hecha y sin tocar.

### 1a · Ebstein — `ebsConclusion`

El patrón es el de `coaPapel`, `mchConclusion().papel` y `tgaConclusion`: **no se reescribe
ningún texto**, se separan descripción y conducta y las dos salidas se arman de las **mismas
piezas**.

| pieza | qué es |
|---|---|
| `partes` | la lista que la PANTALLA publica, sin tocar |
| `celPapel` | la línea del índice **descriptiva**: «Relación de áreas en cuatro cámaras N — grado G» |
| `celPos` | en qué posición de `partes` quedó la línea del índice |
| `efPos` | en qué posición quedó la línea de la evaluación electrofisiológica |
| `partesPapel` | `partes` con la línea del índice **cambiada** por `celPapel` y la de electrofisiología **filtrada** |
| `papel:` | la salida nueva de los DOS `return` de la función |

`CC_PPT` gana `papel:true` en la entrada `ebs`, igual que la coartación y la miocardiopatía
hipertrófica. **`resumen` y `txt` no se tocan.**

**Lo que sale del papel y dónde sigue estando:** el nombre propio del índice, el apellido
Celermajer, el κ de 0,39, la resonancia, la serie neonatal, el «SOBREESTIMAR» y el nombre de la
guía viven en el globo `cc9-ebs-cel`; la conducta con su clase, su nivel, su hoja y su folio vive
en la sección de Evidencia `_indEBS`. **Se verificó ANTES de retirarlo**, que es lo que la regla
fija manda.

⚠️ **El κ de 0,39 NO está en el globo, y es correcto:** PANT-10 lo retiró porque, censadas las
248 fuentes de la biblioteca, ninguna lo publica. Lo que el globo conserva es el **origen** del
índice: la serie de 50 neonatos de un solo centro con el grado calculado en 28.

⚠️ **Ningún número medido desaparece.** La relación de áreas y su grado se siguen publicando, con
dos decimales y con el MISMO valor que la pantalla. Lo fija **TC-674 (B3)** y **(B4)**.

### 1b · Eisenmenger — `eisenEstado`

Dos cosas y nada más:
1. La cifra de mortalidad materna pasa de **«>50 %»** a **«30 a 50 %»** —ACC/AHA de cardiopatías
   congénitas del adulto, hoja 95, folio e209 comprobado en el pie impreso— y el **«(ESC 2020)»**
   sale. **La tarjeta de criterios de esta misma aplicación ya escribía «30-50 %»**: la pantalla se
   contradecía consigo misma.
2. Las alertas de **síncope** y de **hemoptisis** se retiran enteras. «Marcador de mal pronóstico»
   y «riesgo de episodio masivo y fatal» no las respalda ninguna de las dos guías en sus capítulos
   de Eisenmenger —censado en PANT-10—, y el texto literal de las dos quedó en
   `docs/PENDIENTES.md` → **P11-a**.

**Lo que se queda**: la alerta de la saturación crítica y la del derrame pericárdico moderado o
severo, las dos preexistentes. En la PANTALLA el síncope y la hemoptisis siguen con sus globos ya
corregidos: lo que desaparece es la afirmación pronóstica sin fuente.

---

## 2 · El TDE y el TRIV, intercambiados (commit 2)

La columna 2 de la grilla del Doppler mitral pasa de **THP, TDE, TRIV, Onda L** a **THP, TRIV,
TDE, Onda L**. Las otras tres columnas no se mueven.

**Se intercambian las clases `dm-rN` Y el orden del MARCADO, juntos**, porque no hay un solo
`tabindex` en la grilla: el Tab va por orden del documento, así que mover sólo las clases deja la
pantalla mostrando el TRIV arriba y el Tab saltando al TDE. Lo fija **TC-675 (C1)** a **(C3)**.

⚠️ **El papel no se puede mover por este commit, y está medido:** el informe NO nombra ninguna de
las dos siglas y **ninguno de los dos tiene columna de Excel** —censado `LAB_XLS_MAP`: cero
entradas—. Los dos entran al papel sólo a través de la evaluación de la función diastólica, que
los lee por `id`. La primera versión de TC-675 buscaba las dos siglas en el informe y medía sobre
un denominador vacío.

---

## 3 · La casilla «(no se visualiza VCI)» (commit 3)

Pedido del médico: «un circulito chiquito como el que está al lado de documento, que diga entre
paréntesis no se visualiza VCI».

| pieza | qué hace |
|---|---|
| `#vci-no-vis-mk` | el botón. Reusa `.pac-id-mk` ENTERA —el glifo, los dos colores, el `aria-pressed` que el CSS deriva— y sólo estira su `::after` con `.vci-nv-mk` |
| `#vci_no_vis` | el valor persistido: un `input` **hidden** con guion BAJO, que es lo que hace que `guardarInforme` lo guarde y la reimpresión lo reponga |
| `vciNoVisOn(src)` | el dueño **único** del estado. Con `src` lee un estudio guardado |
| `vciNoVisSync()` | aplica el estado: vacía los dos campos de la cava guardando su valor en `dataset.vciprev`, los deshabilita, y recalcula la PmAD **sólo cuando la casilla está marcada** |
| `vciNoVisGesto()` | el gesto del médico: escribe el campo persistido, aplica el estado y vuelve a correr los ocho recalculadores que leen la VCI |

**La decisión de diseño: vaciar y guardar, en vez de parchear a los veinticinco consumidores.**
`vci_diam` y `vci_col` vacíos hacen que los ~25 lectores de la VCI —la PmAD estimada, VExUS, la
probabilidad de HTP, el derrame y el taponamiento, la diastólica— degraden a «sin dato» **por
construcción**, cada uno con la guarda que ya tenía. El precio —qué queda guardado y qué no— está
declarado en **P11-b**.

⚠️ **El área táctil la da un `::after` absoluto y `getBoundingClientRect` NO la ve:** el glifo mide
7 × 11 px y el área real 44 × 44. Se mide con `elementFromPoint` en los cinco puntos, igual que
TC-535.

⚠️ **`#sacc-ad` nace plegado con una transición de 0,3 s**, así que su propio encabezado informa
una caja superpuesta con el cuerpo y los cinco puntos devuelven `sacc-hdr` o `app-content` en vez
del botón. Hay que abrir el acordeón y apagarle la animación antes de medir: es la trampa que AJ9
y la TANDA NOCTURNA ya documentan.

⚠️ **Las DOS listas de «Nuevo estudio».** `data-vciprev` entra en el **selector** y en el **cuerpo**
de `limpiarCampos`, que son dos listas: agregarla a una sola la hace sobrevivir a «Nuevo estudio»
—la lección que TC-514 cobró en rojo—. Y `vci_no_vis` es **hidden**, así que el barrido de arriba
—que toma `text` y `number`— no lo alcanza y tiene su línea propia, exactamente igual que
`pac_id_print`.

**No agrega columna de Excel**: el Excel exporta por `LAB_XLS_MAP` y por bloques declarados, no
por el DOM.

---

## 4 · La profundidad de coaptación, un dato con dos puertas (commit 4)

| pieza | qué hace |
|---|---|
| `_ETEM_VELOS` | el registro de pares. Gana `['ete_prof_coapt','teer_prof_flail']` |
| `etemVeloGesto(id)` | el gesto: lo tecleado en un lado viaja al otro, el **borrado incluido** |
| `profCoaptReconciliar()` | el otro camino: un estudio guardado antes de que el espejo existiera. Cuelga de `RECALC_MODULOS`, es IDEMPOTENTE y **sólo completa lo vacío** |

⚠️ **Con los dos cargados y DISTINTOS no toca nada.** Elegir uno sería decidir cuál de las dos
mediciones del médico vale. Es la misma regla que `aoRaizReconciliar` (PANT-5) y
`taviAoReconciliar` (PANT-8).

⚠️ **NO es el flail gap.** `teer_flail_gap` y `teer_ancho_flail` son otras dos medidas y no entran
en el registro. Lo fija **TC-677 (E1)** y **(E2)**.

**Los dos rótulos siguen distintos** —«reparación» y «TEER», que los separó PANT-6—: son dos
cortes distintos, 10 mm como factor desfavorable de la reparación y 11 mm como criterio de
exclusión del TEER. Lo que se unifica es el **valor**, no el significado.

---

## 5 · El derrame pleural del eco pulmonar por lado (commit 5)

Tres campos nuevos: `pua_derrame_der`, `pua_derrame_izq` —con los MISMOS valores que
`pop_pleura_der` / `pop_pleura_izq`— y `pua_consol_lado` —con los tres de `pop_pulmon_consol`
menos `ausente`, porque acá la presencia la decide la compuerta `pua_consol`—.

Los dos campos legados, `pua_derrame_lado` y `pul_derrame_tam`, pasan a **`disabled` y
derivados**: ya no se editan a mano.

| pieza | qué hace |
|---|---|
| `PUA_SEV_ORD` | el orden de severidad, para saber cuál es el mayor |
| `PUA_SEV_A_LEGADO` / `PUA_LEGADO_A_SEV` | la traducción «leve» ↔ «mínimo», en UN solo lugar y en los dos sentidos |
| `puaDerrameDerivar()` | escribe los dos legados desde los dos campos por lado. El tamaño es el **MAYOR** de las pleuras afectadas |
| `puaDerrameReconciliar()` | el camino inverso, para un estudio guardado antes. Idempotente, cuelga de `RECALC_MODULOS` |
| `puaDerrameGesto(id)` | lo que corre cuando el médico toca uno de los dos selectores |

⚠️ **`puaDerrameDerivar` NO TOCA NADA con los dos campos por lado vacíos, y esa guarda no es
decorativa:** sin ella, abrir un estudio viejo cuyo lado quedó «sin consignar» le BORRARÍA el
tamaño que sí tenía. Lo fija **TC-678 (B5)**.

⚠️ **El papel sale IDÉNTICO para todo estado que la pantalla anterior podía expresar**, porque el
emisor sigue leyendo los dos legados. Los campos por lado sólo aportan el estado **nuevo**: las
dos pleuras con severidad distinta.

⚠️ **NINGUNO de estos campos tiene columna de Excel**, y la premisa de la orden que decía que la
derivación preserva «sus dos columnas» es **falsa**: censado, `pua_*` y `pul_derrame_tam` tienen
**cero** entradas en `LAB_XLS_MAP`. Está declarado en **P11-c**.

---

## 6 · La sincronía con el posoperatorio (commit 6)

Un dato, dos puertas, gana la última edición, en los dos sentidos.

| pieza | qué hace |
|---|---|
| `PUA_POP_ESPEJADOS` | los CINCO campos del posoperatorio que este espejo escribe |
| `popModuloEnUso()` | ¿el posoperatorio está en uso? Barre `pop_*` **excluyendo** los cinco de arriba |
| `PUA_TIPO_A_POP` / `POP_TIPO_A_PUA` | el tipo del derrame en los dos sentidos, en UN solo lugar |
| `puaPopEspejoGesto(id)` | básico → posoperatorio, **con guarda** |
| `popPuaEspejoGesto()` | posoperatorio → básico, **sin guarda**: el posoperatorio escribe siempre |
| `puaPopReconciliar()` | al restaurar un estudio. Idempotente y sólo completa lo vacío |

⚠️ **LA GUARDA, y es la misma forma que `_labUsaTavi` de PANT-8 y PANT-9.** «En uso» EXCLUYE los
cinco campos que el espejo escribe: sin esa exclusión **el espejo se autoriza a sí mismo**. Hace
falta porque está medido que con sólo los dos campos de pleura cargados `popPatron().suficiente`
pasa a `true`, su botón «Integrar al informe» se habilita y su hoja del PDF pasa a tener 413
caracteres: un estudio que no es un posoperatorio quedaría ofreciendo una hoja de posoperatorio.

**Lo que NO se sincroniza, y por qué:** el `hemotorax` no tiene equivalente —no se escribe ni se
borra—; las líneas B sincronizan **sólo** «ausentes», porque «focales» y «difusas» del
posoperatorio son una escala de DISTRIBUCIÓN y «focal», «múltiples» y «coalescentes» del básico
una de CANTIDAD; y el neumotórax, el deslizamiento, las líneas A y las zonas no existen del otro
lado.

⚠️ **`pua_derrame` —la compuerta sí/no del básico— NO SE ESCRIBE, y es una medición la que lo
decide.** La orden lista los pares uno por uno y esa compuerta no está entre ellos; y escribirla
hace que un estudio cuyo derrame hoy sólo aparece en la hoja PostCEC del PDF gane además un
párrafo en el CUERPO del informe. Un hallazgo se escribe una sola vez. `pua_consol` SÍ se escribe,
porque la orden la nombra expresamente en su par.

---

## 7 · El dibujo del pulmón (commit 7)

Portado de `docs/3d/demo_pulmon_interactivo_v2_aprobado.html`, aprobada por el médico el
2026-11-04: de ahí salen el contorno del pulmón, la escala de la cavidad, el árbol bronquial, el
generador de la mancha irregular y las alturas del nivel de líquido. **Ni una curva se inventó
acá.**

| pieza | qué es |
|---|---|
| `PUL_D_LUNG` | el contorno del pulmón derecho; el izquierdo es su espejo |
| `PUL_D_HX` / `PUL_D_HY` / `PUL_D_CAVS` | el centro y la escala de la cavidad torácica |
| `PUL_D_FLUID` | la altura del techo del líquido por severidad |
| `PUL_D_PNX` | la fracción de colapso del neumotórax |
| `PUL_D_SECT` | las alturas de los sectores anterior y lateral |
| `_pulDEl` | el creador de nodos. **Todo con `createElementNS`: ni un nodo sale de `innerHTML`** |
| `pulDibEstado()` | el estado del dibujo, leído de los campos |
| `pulDibDescripcion(st)` | la alternativa accesible, que además **dice lo que NO se dibuja** |
| `pulDibSync()` | el pintor. Cuelga de `RECALC_MODULOS` |

**SOLO LECTURA**: no escribe ningún campo, y seis repintados no mueven uno —lo fija
**TC-678 (F4)**—. **Y NO llega al papel.**

Lo que el dibujo **no** dibuja, y lo DICE: las líneas B presentes sin zona marcada, la
consolidación sin lado consignado y el punto pulmón sin lado único. Un dibujo que calla un
hallazgo cargado se lee como que la app lo perdió.

**Los colores son variables de la app declaradas en los DOS temas** —`--pul-dib-*` en `:root` y en
`html.light-mode`—, que es la lección de `--amber`, declarada sólo dentro de `.amilo-root` y que
dejó cinco avisos en gris.

La disposición: `#pul-fila` con `#pul-izq` y `#pul-dib-caja` de 220 px desde 900 px, y el corte de
cuatro columnas de `.pul-cols` movido de 1100 a **1399 px**, porque con el dibujo al lado la
columna más angosta caía por debajo del piso.

---

## 8 · Las masas en la pestaña Otros (commits 8 y 8b)

Decisión del médico, sobre el inventario de `docs/INVENTARIO_MASAS.md` (PANT-8, commit 7b).

Los **nueve** campos `masa_*` se mudan enteros desde «Pericardio y masas» a una tercera sección de
`#tab-otros`, debajo de «Variantes anatómicas», con la misma forma de acordeón que las otras dos.
**Ningún id, ninguna opción, ningún rótulo y ningún comportamiento cambian**, y el emisor del papel
y el Excel no se tocan: los campos se guardan y se emiten por `id`, no por pestaña.

El título de la sección vieja pasa de «Pericardio y masas» a **«Pericardio»**. El `id`
(`ete-seccion-pericardio-masas`) **no cambia**, a propósito: lo nombran `showTab`, el drawer, los
mapas y los casos de la suite.

⚠️ **`data-autoopen` con `masa_presente` que nace con valor:** ese selector NO tiene opción vacía
—su primer valor es «No se detectan masas»—, así que un formulario en blanco **afirma** que no hay
masas. `cardAutoOpen` cuenta un `<select>` sólo con `selectedIndex > 0`, así que el valor de
fábrica NO abre la sección.

### 8b · El `</div>` de menos, y por qué no se veía

El commit 8 insertó la sección **después** del contenido de «Variantes anatómicas» pero **antes**
de su cierre, así que `#otr-sub-masas` quedaba DENTRO de `#otr-sub-variantes`. El DOM quedaba
**balanceado** —el cierre que faltaba arriba sobraba abajo— y las tres secciones se dibujan igual,
porque los tres paneles `.otr-sub` están visibles a la vez desde el trabajo B.

**El único síntoma medible era que el panel de variantes informaba DOS `h2.card-head`**, que es
justo lo que TC-509 (C1) cuenta — y es quien lo encontró, en el censo de casos viejos.

Medido por balance de etiquetas: antes, variantes 10765 → 11084 y masas 10921 → 11082; ahora,
burbuja 10625 → 10763, variantes 10765 → 10906, masas 10922 → 11083 y `tab-otros` 10598 → 11087,
con la pestaña Hemodinámica como hermana siguiente.

**Es el modo de falla que esta casa ya pagó cuatro veces.** La extracción de un bloque se hace por
**balance de etiquetas** sobre el texto sin comentarios, y lo que lo caza es medir la **cadena de
padres**, no contar `<div>`.

---

## 9 · La tabla de diferenciales y el globo de endocarditis (commits 9a y 9b)

`.masa-ref-tabla`, debajo de los nueve campos: **siete filas** —vegetación, trombo, mixoma,
fibroelastoma papilar, lipoma, metástasis y artefacto— por **siete columnas** —entidad,
localización típica, aspecto, movilidad, relación con la válvula o la pared, hallazgos que
acompañan y fuente—. **Todo parafraseado: ni una frase copiada**, y cada fila con su guía, su
edición, su hoja y su folio, los dos comprobados en el pie impreso.

**Con scroll horizontal PROPIO en `.masa-ref-wrap`, no en la página.**

Dos globos nuevos, los dos con la clase `vinfo-btn-44`: `masa-ref` —qué estudio complementario
conviene cuando hay dudas— y `masa-ref-ei` —gérmenes según el contexto, indicaciones quirúrgicas
y riesgo embólico de la endocarditis, en la fila de la **vegetación**—. El registro `VINFO` pasa de
**140 a 142** entradas.

⚠️ **La tabla NO sugiere un diagnóstico y no toca `masa_dx`**: es una referencia. Que la aplicación
oriente el diagnóstico es contenido clínico nuevo, y lo decide el médico.

⚠️ **Ninguno de los dos globos tiene ficha en Referencias**, y el motivo NO es el de las anteriores:
Referencias SÍ ganó dos fichas en esta misma tanda, pero ninguna publica el mismo contenido que
estos dos globos. Está declarado en **P11-g**.

---

## 10 · Las dos fichas de Referencias (commits 10 y 11)

Las dos en la sub-pestaña **«Otros hallazgos»**, las dos **solo texto**: ni un campo nuevo, ni un
cambio en ninguna pantalla, ninguna conducta propia, y **nada llega al papel**.

| ficha | qué publica |
|---|---|
| `ref-tumores` | **catorce** filas: la proporción de primarios benignos, el reparto de los malignos, los secundarios, el aspecto por tipo, las seis señales de alarma y qué método conviene |
| `ref-embolig` | **dieciocho** filas en DOS bloques separados: **qué evaluar** —siete estructuras con su potencial embolígeno y qué método rinde más— y **la estructura en pasos** del estudio del ictus isquémico, nueve pasos con su clase y su nivel |

El total de fichas de Referencias pasa de **36 a 38**, y la sub-pestaña «Otros hallazgos» de **12 a
14**.

⚠️ **`tumores` y `embolig` entran en `REF_SUBTAB` EN EL MISMO COMMIT QUE SU FICHA**, por la lección
que `constriccion` dejó en la tanda J: una ficha fuera de las seis sub-pestañas existe, se abre
desde su encabezado y el buscador la indexa, **pero el médico que navegue por las solapas no la
encuentra nunca**.

**Lo que las dos fichas dicen de sí mismas y no se omite:**
- las cifras de los malignos primarios **no suman 100 %** y la fuente no las presenta como
  excluyentes: se publican como están y la propia fila lo dice;
- los cortes del puntaje ecocardiográfico y del de resonancia **no se citan**, porque no se
  leyeron con certeza;
- la clasificación de la OMS **no está en la biblioteca** y la ficha lo dice con esas palabras;
- la guía de la ASE **no trae un algoritmo ecocardiográfico paso a paso propio**: trae criterios de
  uso apropiado y estas tablas.

---

## 11 · Dónde está lo demás

| qué | dónde |
|---|---|
| las fuentes leídas, sus folios comprobados y los censos | `docs/fuentes/FUENTES.md` → «La tanda PANT-11» |
| lo parado y lo declarado | `docs/PENDIENTES.md` → **P11-a** a **P11-g** |
| los seis casos nuevos, uno por uno | `docs/mapa/tests-fichas-674.md` |
| el bloque de la tanda | `docs/REGISTRO_TANDAS.md` |
| la guía de prueba a mano | `docs/GUIA_PRUEBA_PANT11.md` |
| el inventario que sostiene la mudanza de las masas | `docs/INVENTARIO_MASAS.md` (PANT-8, solo lectura) |
| los criterios TEER y el espejo de la FEVI, partidos de su mapa | `docs/mapa/mitral-teer-criterios.md` |

---

## 12 · Lo que la tanda cierra, y lo que revierte

| pendiente | qué pasó |
|---|---|
| **P10-a** | cerrado: el κ, el apellido, la resonancia, la serie neonatal, el nombre de la guía y la conducta salen del papel de Ebstein, y las dos alertas sin fuente salen de Eisenmenger |
| **P6-f** y **P5-f** | **cerrados por orden expresa del médico, que REVIERTE su parada**: los dos campos de la profundidad de coaptación pasan a ser un dato con dos puertas, con los dos rótulos y los dos cortes intactos |
| **P6-h** | cerrado: `mitral-dibujo-estatico.md` cruzó el techo al recibir el puntero de esta tanda y se partió, con cero líneas perdidas |

⚠️ **Y lo que la tanda declara y NO hizo** está en `docs/PENDIENTES.md` → **P11-a** a **P11-i**:
los textos retirados palabra por palabra, lo que cuesta la casilla de la VCI, la columna de Excel
que la premisa daba por existente y no existe, los pares del pulmón que no se sincronizan, lo que
el dibujo no muestra, la opción «pannus», el botón «Ver referencia» de los dos globos nuevos, el
resumen de lo parado, y el hallazgo ALTA que el barrido de celular suma y es un falso positivo.

---

## Lo que la tanda PANT-13 cambió de Masas y del pulmón (2026-11-04 y 05)

Detalle en `docs/mapa/pant13-explorar-tga-masas.md` § 5 y § 6:

- **La tabla «Cómo distinguirlas (referencia)» nace CERRADA**, con el mecanismo de «Patrones de
  Strain» del SGL: `igToggleAcc`, `#masa-ref-tog` con `aria-expanded`, su flecha `.igacc-chev` y
  `#masa-ref-cuerpo` con `display:none`. El estado abierto **no se guarda** y el globo queda
  **fuera** del botón.
- **Tres textos de la tabla y dos globos quedaron neutros** por la regla nueva de `CLAUDE.md`
  —«Ningún texto habla mal de las guías»—, **sin tocar un dato**: las diez hojas, los diez folios
  y las cinco tablas salen idénticas.
- **El broncograma aéreo del diagrama del pulmón se dibuja en PUNTOS y no en líneas**, con el
  radio decreciendo por orden de bronquio (2.1 y 1.5) y **recortados por el blob** de la
  consolidación.
- **El diagrama del pulmón tiene su «Incluir el diagrama en el PDF»** (`#pul-dib-pdf-toggle`, con
  el campo `pul_dib_pdf`), que es el **único campo guardado nuevo** de la tanda.
