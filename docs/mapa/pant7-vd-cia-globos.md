# PANT-7 — el dibujo del VD, los bordes de la CIA en el PDF, los globos y las cuatro pantallas

Mapa de la tanda **PANT-7** (2026-11-03 y 04). Diez commits de código sobre `437834d`
(sello `v20261103-2018`, md5 `bb6adf41`) y el de cobertura y documentación. Por nombre de
función y de constante, **nunca por número de línea**.

Lo que esta tanda **no** hizo, declarado en `docs/PENDIENTES.md`: el punto **10a** (las
referencias del tronco de la arteria pulmonar, sus ramas y el tracto de salida del VD) y el
commit **11** (el molde de Evidencia de la válvula pulmonar y de la prótesis mitral), por la
regla de prioridad de la propia orden. Ninguna línea de la app se tocó por ellos.

---

## 1 · El dibujo de sobrecarga del VD, al tamaño del esquema valvular 2D (commit 1)

**Quién manda el tamaño:** la regla de CSS de `#vdsc-svg`, que ahora declara
`width:220px; height:300px; max-width:100%` y, dentro de `@media (max-width:768px)`,
`width:100%; height:240px` — los **mismos** valores que `#v2d-svg`. No hay ningún cálculo en JS.

**Quién manda la letra:** `#vdsc-svg .vdsc-lbl` pasó de `4.2px` a **`5.2px`**, que es lo que
llevan `.v2d-lbl` y `.v2d-cn`. `.vdsc-cn` ya estaba en 5.2px y **no se tocó**.

| ancho | dibujo antes | después | esquema valvular | letra en pantalla |
|---|---|---|---|---|
| 1440 | 520 × 683,9 | **220 × 300** | 220 × 300 | 6,42 contra 7,06 |
| 1000 | 343,8 × 452,2 | **220 × 300** | 220 × 300 | 6,42 contra 7,06 |
| 768 | 520 × 683,9 | 706 × 240 | 714 × 240 | 5,33 contra 5,65 |
| 390 | 328 × 431,4 | 328 × 240 | 336 × 240 | 5,33 contra 5,65 |

⚠️ **La diferencia del 9 % en la letra en pantalla se DECLARA y no es la tipografía:**
`fitView()` reserva 16 unidades más de `viewBox` a la izquierda para la barra del TAPSE, así que
con la misma caja el dibujo se encuadra un 10 % más chico. Eso es geometría del dibujo y la
orden prohíbe tocarla.

⚠️ **Y el piso de 12 px de letra de esta casa se supera a propósito, por decisión del médico:**
el pedido es que el dibujo sea del tamaño del esquema valvular, y a 220 px la tipografía del SVG
no puede llegar a 12. **P6-b queda cerrado por esa decisión**, no por un arreglo.

**Los rótulos son UNO solo y cortos:** `var ROT = {mc:['Sg McConnell'], sp:['SIV desplazado']}`,
un `tspan` cada uno. ⚠️ **`vdscRotulos()` NUNCA EXISTIÓ** —es **P6-d**—, así que el par
`ROT_LARGO` / `ROT_CORTO` era código muerto y el comentario que decía que elegía «medido con
getBBox a los cuatro anchos» era falso. Hoy el tamaño lo fija la hoja de estilos y nada elige.

**La disposición:** `#vdsc-fila` pasa de `minmax(0,1fr) 45%` a **`minmax(0,1fr) 240px`**, así que
todo el ancho que sobra va a los campos (de 649 a 940 px a 1440). El hueco vertical entre los
campos y la lista de criterios —el espacio vacío que el médico veía— pasa de **104 px a 10**, que
es el `row-gap` de la grilla, o sea el mínimo. El alto de la sección baja de 875,9 a **688 px** a
1440, de 719 a 706 a 1000, de 1526,9 a **1083** a 768 y de 1359,4 a **1168** a 390.

**Lo que NO cambió, verificado:** geometría contra la demo aprobada **10 de 10 escenarios
idénticos** (1.058 a 1.131 caracteres de trazado de cada lado como denominador); de **solo
lectura** (1.095 campos fotografiados, seis pasadas de fase y de sincronización, cero movidos);
**mudo** sin datos; **un solo color**; **quieto** con `prefers-reduced-motion`; el esquema
valvular 2D con sus 220 × 300, sus 101 nodos y la **misma firma** (4.043 caracteres, hash
idéntico); y el papel sin una palabra del dibujo, censado.

⚠️ **Una medición falsa y plausible, pagada:** la sonda calculaba la escala del SVG como
`ancho / viewBox`, y con `preserveAspectRatio` en `xMidYMid meet` —el valor por omisión— la
escala es el **menor** de los dos cocientes. Daba 6,42 px donde el dibujo se ve en 9,37.

---

## 2 · Los bordes de la CIA DENTRO de su sector, en la hoja avanzada del PDF (commit 2)

**El dueño del ancho disponible es `_ciaSegAnchoDisp(seg, yy)`**, nuevo. Barre x desde el centro
de la etiqueta hacia los dos lados preguntando si el punto sigue dentro del anillo **y** del arco
de **su** sector, y devuelve el doble del lado más corto. Las constantes del anillo son `R0` 46,
`R1` 115, 72° por sector, `MARG` 3,5 y `MARGANG` 0,07.

**Quién dibuja:** `ciaDonutDataURL(info)`, en una **segunda pasada** sobre los cinco sectores:
la sigla con `FSIG = '500 9px …'` en `DYSIG = -5` y el valor con `FVAL = '600 9.5px …'` en
`DYVAL = 5.5`. Compara `measureText` contra `_ciaSegAnchoDisp` y, lo que no entra, lo empuja a
`info.fuera` — la **lista lateral, una por línea**.

**Medido por píxeles, no por estimación:** contando los píxeles del color de texto de cada sector
dentro de su región del PNG, los cinco pasan de **28/15/16/19/38 a 74/58/76/77/84**. La escena
con tres bordes **sin medir** es el control: esos tres se quedan en 13/16/17 —la sigla sola, sin
número— mientras los dos medidos van a 74 y 84.

⚠️ **La lista lateral no se dispara con datos plausibles, y está medido:** con cuatro caracteres
en los cinco bordes («17.5 mm», el caso más ancho) el sector más apretado —el aórtico y el
posterior, donde la tangente es casi vertical— deja **22 unidades de holgura sobre 60**. Es un
camino real, con su mutación propia, y se declara que con datos reales los cinco entran.

**La línea de corrido se retira y queda UN solo dato.** ⚠️ **Parte de la premisa de la orden es
falsa:** afirma que el borde mínimo, la dirección del shunt y la velocidad del jet «ya están en
los textos de arriba de la hoja». Con la CIA **integrada** al informe es cierto; con el diagrama
incluido y la sección **sin integrar** es **falso** —«borde mínimo» ×0, «jet» ×0 y «Qp/Qs» ×0 en
los 3.108 caracteres de esa hoja—. De los tres, la dirección y el Qp/Qs siguen en el **centro**
del diagrama y el borde mínimo es derivado de los cinco valores; el único **número medido** que
podía desaparecer del papel es la **velocidad del jet**. Así que entra únicamente cuando el
párrafo de la CIA **no** se va a emitir, decidido con el **mismo** predicado que usa ese párrafo
—`eteShuntLesionOn('cia')`—, no con una segunda regla. El recolector publica
`_dg.cia = { partes:[{data, leyenda?}], linea:_ciaLinea }`.

| escena | antes | después | figuras |
|---|---|---|---|
| sección **integrada** | 4.610 caracteres | **4.396** | 108 → 108 |
| sección **sin integrar** | 3.326 | **3.141**, con «Velocidad pico del jet 1.2 m/s» | 106 → 106 |
| `p6ccCia`, `p6ccDos`, `p5ccCia`, `p4vacio`, `p4ajeno` | — | **idénticas carácter por carácter** | — |

⚠️ **Y la premisa de la miniatura era falsa.** La orden da por hecho que el bloque «En el PDF»
con la miniatura del diagrama ya aparece entre los botones del informe. Medido con la CIA
cargada, su dibujo generado (66.818 bytes de dataURL) y la casilla marcada: la fila salía en
`display:none`, el contador decía «En el PDF: 0» y había **cero** tarjetas, porque
**`INF_MIN_DIAG` tenía SEIS entradas** —`contr`, `sgl`, `vab`, `eteqx`, `tavi`, `lv3d`— y ninguna
era la CIA. Lo que el médico vio fue la fila de otro diagrama. Se agregó **sin un campo guardado
nuevo**: la puerta es `ete_shunt_incluir_chk`, que ya existe y ya se guarda, y el dibujo lo da
`ciaDonutDataURL`. Su guarda es la **misma** que la del PDF —la casilla **y** que haya algún
borde medido— y va a **`esqs`** y no a `imgSlots`, porque la CIA ya tiene su sección en la hoja y
entre los slots se imprimiría dos veces.

⚠️ **El paso de guardar y reabrir NO se pudo medir, y se declara en vez de afirmarlo:**
`editarInforme(id)` no repuso nada en el arnés, y el **denominador** lo dice —el nombre del
paciente también volvió vacío—, así que lo que falló es el montaje de la sonda y no la app. Queda
en el paso de la guía de prueba manual. Dos trampas del arnés, pagadas: los ids son `nombre` y
`ci`, no `pac_nombre`/`pac_ci`; y **`valvSevConfirmada` es una variable de MÓDULO y no está en
`window`**, así que ponerla desde afuera no hace nada y la tarjeta de severidades queda esperando
un clic.

---

## 3 · Los globos: el ancla, los dos nuevos, el resalte y la barra (commit 3)

### 3.1 · Por qué dos ⓘ no abrían

**En una línea: `_vInfoBtnDe` devolvía SIEMPRE el primer botón del documento**, y
`_vInfoColocar` se ancla a ese y sale por `return null` si su caja mide 0 × 0. Las dos claves
tienen **dos** botones —`vd-triv` lo llevan la fila de referencia del VD y la del Doppler
tricuspídeo; `pul-balik`, la pestaña de pericardio y el posoperatorio—, así que estando en una
pestaña el globo de **esa** pestaña no abría porque el gemelo de la otra estaba escondido.

Hoy manda el botón que se **clickeó**, que es el que `vInfoClic` ya tenía en la mano, y el
fallback —para las aperturas por código— prefiere uno con caja. Las piezas: `_vInfoBtnDe(clave,
btn)`, `_vInfoBtnsDe(clave)` (nueva), `_vInfoAbrir(clave, desde)` y `_vInfoColocar(clave,
desde)`. **Para una clave con un solo botón el resultado es idéntico**, así que las ciento veinte
tarjetas anteriores no se mueven un píxel. El `aria-expanded` se apaga ahora en **todos** los
botones de la clave.

⚠️ **La medición del cierre corrigió una frase del mensaje del commit 3.** Ese mensaje afirma
que en HEAD «el de `tab-vd` abría —380x430 con 2.486 caracteres—». Medido al cerrar la tanda con
la sonda dedicada (`_probe_pant7c3.mjs`) y con la de dos motores, sobre el **mismo** HEAD y sobre
el árbol nuevo: **el PRIMER botón de `vd-triv` y de `pul-balik` mide 0 × 0 en los DOS árboles**, y
con caja cero `_vInfoColocar` sale por su guarda, así que ese «no abre» es un **denominador
vacío** y no un hallazgo — lo que ninguna de las dos sondas logra es abrir su contenedor. **Lo que
la tanda arregla, y lo que sí se ve en los dieciséis cruces, es el SEGUNDO botón de cada clave:
pasa de `NO ABRE` a abrir, con 2.486 y 750 caracteres.** → **P7-k**.

⚠️ **Mi primera sonda fabricó el defecto que venía a medir.** `#vinfo-card` es un elemento
**estático** del marcado, no se crea al abrir, y la sonda lo **borraba** antes de cada clic:
`_vInfoColocar` sale por su primera guarda (`if (!c) return null`) y entonces **ningún** globo
abre. Los cuatro daban `abrio=false`, que es exactamente el síntoma buscado. Hoy cierra con
`vInfoCerrar`, que es lo que hace el médico. Y antes de eso midió sobre un denominador vacío:
sin abrir la pestaña de cada botón, los cuatro daban 0 × 0.

### 3.2 · Los dos globos nuevos

`VINFO['vd-tei']` (ancho 420) y `VINFO['tep-6060']` (ancho 400), con su entrada en `VINFO_REF`
—`'vd-tei': 'vd2'` y `'tep-6060': 'vd2'`—, que es lo que les da el botón «Ver referencia».
El registro pasa de **120 a 122** claves.

**El del índice de Tei** dice la fórmula con el significado de cada intervalo, cómo se mide por
Doppler pulsado y por tisular, los cortes **por método con sus cuatro grados** y las
limitaciones. ⚠️ **Las dos guías difieren y la diferencia se muestra, con la más nueva primero**;
**el corte que la app usa no se movió**. ⚠️ **Y la propia fuente se contradice en la unidad**, así
que el globo lo dice: el cuerpo declara el índice adimensional y el recuadro escribe «<0.40 ms».
⚠️ **Sin valor normal del Tei del ventrículo IZQUIERDO:** ninguna fuente de la biblioteca lo trae.

**El del signo 60/60** dice las **dos** condiciones, el ~12 % de los TEP no seleccionados —contra
el 20 % del McConnell— y la diferencia entre el texto y la figura, que se muestra y no se
resuelve: la figura agrega la muesca mesosistólica y describe el gradiente como «ligeramente
elevado». **Sin conducta y sin la palabra «positivo».** Censado: ni la AHA/ACC 2026 de TEP ni la
ASE 2025 lo nombran.

### 3.3 · El resalte del 60/60 — decisión expresa del médico

`TEP_6060_TAP_MAX = 60` y **`tep6060Resalte()`**, que pinta **dos** rótulos y nada más:
`tep-6060-lbl` (el del campo) y `tep-6060-fila-lbl` (el de su fila en la lista de criterios).
Colgado de **cuatro** puertas: `calcTEP`, **`calcVD`** —el tiempo de aceleración vive en VD/AD y
su `oninput` va a `calcVD`, no a `calcTEP`—, `RECALC_MODULOS` y el final de `limpiarCampos`; sin
la última, el rótulo se queda pintado sobre un formulario recién limpiado.

| tiempo de aceleración | color | peso | contraste |
|---|---|---|---|
| 59 ms | rgb(245,158,66) | 700 | 7,98 y 7,33 |
| **60 ms exactos** y vacío | rgb(154,163,188) | 500 | — (control negativo) |

En los tres casos el selector sigue en «ne», el span sigue diciendo «No evaluado» y el score
sigue en «—»: **no** agrega texto, **no** escribe el campo, **no** cuenta en el score, no se
llama positivo y **no llega al papel**. El color es `--orange` y **no `--amber`**, que no resuelve
fuera de `.amilo-root`.

### 3.4 · La barra del tiempo de aceleración, de dos tramos a CUATRO

Entra la fila **`ASE25_T1.vd_tap`** —normal `op:'>'` 105, leve `op:'>='` 80, moderada `op:'>='`
60, severa— y un **`vdTapGrado(x)`** nuevo al lado de `vdTapCat`, que **no se tocó**: son dos
preguntas sobre el mismo número, y `UMBRAL_TAP_HTP` sigue valiendo **105**. La barra pasa de 3
rectángulos con un corte a **5 con tres** —«60 ms · 80 ms · 105 ms»—, y la del Tei queda
**idéntica**, que es el control.

⚠️ **El corte de arriba se nombra «105» y no «106», y hubo que decirlo corte por corte:** con
`corteEn:'desde'` sale por el **piso** de la banda normal, que con `op:'>'` y cero decimales es
106 —medido—. La guía escribe «>105», así que ese se nombra por el **techo** de la banda leve:
`corteEn: ['desde','desde','hasta']`.

Debajo, una nota de dos renglones con clase **`ev-nota` propia** —para no tocar `.ev-cat` ni
`.ev-fte`, que las comparte todo el panel— que dice que el corte de 60 ms es el mismo que una de
las dos condiciones del signo 60/60 y remite a Referencias. **Sin ninguna fórmula de estimación
de presión**, que es decisión del médico.

### 3.5 · Referencias

`FUN-VD-006` gana los cuatro grados y la nota de que es menos confiable con frecuencia cardíaca
por debajo de 60 o por encima de 100 latidos por minuto. Y entran **dos fichas nuevas, una guía
por ficha**, que es la convención del registro: **`FUN-VD-009`** (signo 60/60) y
**`FUN-VD-010`** (muesca mesosistólica). Constantes nuevas: `EV_GUIA_ESC2019TEP_EN`,
`EV_DOI_ESC2019TEP_EN`, `EV_GUIA_ESCERS2022HP` y `EV_DOI_ESCERS2022HP`.

---

## 4 · Los cuatro arreglos del commit 4

### 4a · La profundidad de coaptación se PARA

La condición de la orden es verificar «leyendo FUENTES.md y el código, que las dos son de verdad
la misma medición (misma vista y mismo sitio de medida)». **No se puede verificar**, por dos
motivos medidos: **ninguna** de las dos entradas de `docs/fuentes/FUENTES.md` registra la vista
ni el sitio de medida, y **Tamburino 2010 NO está en la biblioteca** —el propio FUENTES.md lo
declara censado—.

**Lo que la sincronía cambiaría, medido:** con `ete_prof_coapt` en 12 y `teer_prof_flail` vacío
—lo de hoy— el veredicto dice «Faltan 8 criterio(s) por ingresar»; con el mismo 12 copiado dice
«**1 criterio(s) no cumplido(s)**, Faltan 7». Un criterio que hoy está **sin dato** pasaría a
estar **no cumplido**, y es un criterio de **exclusión** que decide APTO / NO APTO. Es lo que
**P5-f** y **P6-f** ya declararon y lo que **TC-648 (D5)** fija como control negativo.

### 4b · La franja rosada del TEER — DOS causas independientes

⚠️ **P6-c la midió en el tema equivocado.** El texto existe —«Definir tipo de IM para ver
criterios específicos.», 50 caracteres, 11 px— y se muestra solo sin tipo de IM elegido, que es
lo que P6-c encontró. Lo que esa medición no miró es el **tema**:

| tema | texto sobre fondo efectivo | contraste |
|---|---|---|
| oscuro | rgb(252,165,165) sobre rgb(46,32,42) | **8,16** |
| claro | rgb(252,165,165) sobre rgb(253,236,236) | **1,66** |
| claro, **después** | — | **5,66** (el oscuro intacto en 8,16) |

`.mAviso` lleva `color:#FCA5A5`, un salmón para fondo oscuro, y **no** tiene variante de tema.
Arreglado con `html.light-mode #teer-tipo-aviso { color:#B91C1C; }`. ⚠️ **Va por id y no sobre
`.mAviso`**, que la comparten 56 elementos: tocar la clase movería pantallas que la orden no
nombra. El mismo defecto los alcanza a todos en el tema claro y queda declarado.

⚠️ **Y la SEGUNDA causa la destapó el caso de prueba al llamar a `limpiarCampos` antes de medir:**
el id `teer-tipo-aviso` **termina en «-aviso»**, y `limpiarCampos` barre `[id$="-aviso"]` con
`textContent = ''`. `_mostrar` solo cambia el `display`, así que después de «Nuevo estudio» —que
es como el médico empieza un paciente— la franja queda **genuinamente vacía**, con su borde
izquierdo de 3 px y nada adentro. **Por eso PANT-6 midió 50 caracteres y concluyó que no se
reproducía: esa medición fue sobre una página recién cargada.** El arreglo (commit 4b) es que
`calcTEER` escriba el texto al mostrarla, desde la constante **`TEER_TIPO_AVISO_TXT`**, palabra
por palabra la del marcado. **El id no se cambia** —la orden lo prohíbe— y la lógica de cuándo
aparece tampoco.

### 4c · «No determinable» fuera del papel

En `amiloTextoHemo`: `if (f) L.push(…)` y `if (pf) L.push(…)`. Sin datos, el bloque pasa de
**307 a 251 caracteres** y «no determinable» en la hoja del PDF de **6 a 0** —una por plantilla—.
Con datos: **750 → 750, idéntico**, que es el control. **No se cambia una frase por otra: se
retira el renglón.**

**Lo que NO se tocó**, con su ubicación, porque la orden acota el cambio a esas dos frases: la
**tercera** línea del mismo bloque («HTP pre / pos / mixta…»), «Interpretación: no determinable»
del score de TEP (`amiloTextoTEP`) y «Clasificación de toxicidad: no determinable» de
cardio-oncología (`_coFila`).

⚠️ **Un hallazgo que la medición destapó:** el perfil hemodinámico y la clasificación HTP siguen
escribiendo al papel **su propia** frase de dato faltante, que no es «no determinable» sino
«Requiere IC + RVS (VFD/VFS, FC, PAM, PVC, ASC)» y «Requiere PAPm (PSAP) + PCP (E/e')». Es el
análogo de **P5-b** para otros dos spans.

### 4d · «PAPs» pasa a «PSAP» en el papel

El rótulo lo escribían **cuatro** emisores de papel —la CIA, las dos ramas de la CIV y el ductus—
y el A/B da **23 diferencias de superficie firmada, y las 23 son exactamente «PAPs» → «PSAP»**.
**Ningún valor, ningún id y ningún encabezado del Excel se movieron.**

**Lo que NO se cambió:** «PAPm» y «PAPd» viven **solo en pantalla** y no las escribe ningún
emisor de papel, censado; y el «PAPs» del texto de las recomendaciones de la Evidencia es parte
de la frase de la guía que se cita, no un rótulo de esta aplicación.

---

## 5 · Las cuatro pantallas (commits 5 a 8)

El patrón es el mismo en las cuatro y es la regla fija de la casa: **campos a la izquierda,
conclusión o diagrama a la derecha desde 900 px**, con el corte sobre la **ventana** y media
queries **explícitas**, no `auto-fit`.

### 5.1 · Wilkins (commit 5)

**`#wilk-fila`** es una grilla de dos columnas desde 900 px; **`#wilk-campos.grid-1`** pone los
cuatro campos en **una** columna; **`#wilk-concl`** es la conclusión al lado.

| ancho | campos | conclusión | alto de la sección |
|---|---|---|---|
| 1440 | [2,2] → [1,1,1,1] | 1194 → **590 px al lado** | 281 → 329 |
| 1000 | [2,2] → [1,1,1,1] | 778 → **382 px al lado** | 271 → 313 |
| 768 / 390 | igual | apilada | 385 → 379 |

⚠️ **La sección queda más alta a 1440 y a 1000, y es aritmética, no un defecto:** cuatro campos
en una columna ocupan cuatro filas, contra dos filas de dos más la conclusión debajo.

**Y un dato con dos puertas (5a):** la preocupación de octubre se reprodujo. Con el juego del ETE
en 1/1/1/1 y el de cirugía en 4/4/4/4, el primero publicaba «sin puntuar» y el segundo «16/16» —
dos juegos independientes, el mismo paciente, dos scores.

Las piezas: **`WILK_VACIO = Object.freeze({ ete:'0', cx:'' })`** y **`wilkSincronizar(src)`**, que
copia los cuatro valores al otro lado y llama a los dos recalculadores **directamente**, sin
despachar eventos. La puerta es **`wilkMarcarGesto`**, que ya existía y ya exigía
`ev.isTrusted === true`: un gesto real de una persona. Eso cierra el bucle **por construcción**
—un evento sintético no es de confianza— y es lo que hace que **ningún estudio guardado se migre**.

⚠️ **La sincronía es inequívoca, y por eso se pudo hacer:** los dos juegos son los **mismos**
cuatro criterios con la **misma** escala de 1 a 4. Lo único que cambia es la redacción de cada
opción y el centinela de vacío, así que la traducción es una tabla de dos entradas y no una
interpretación.
⚠️ **La marca de «puntuado a propósito» viaja con el valor**, y hace falta: sin ella, un 1/1/1/1
tecleado a propósito en un lado llegaba al otro como «reingresá los cuatro criterios».
⚠️ **El gesto de confianza no se puede producir desde Playwright:** `selectOption` deja la marca
vacía, así que la sincronía se prueba llamando al sincronizador y la puerta por su control
negativo.
⚠️ **Y el centinela se traduce en los DOS sentidos, con una asimetría medida:** del ETE a cirugía
el `'0'` tiene que llegar **vacío**, y el valor del campo **no** lo distingue —`cx_wilk_*` no
tiene opción `value="0"`, así que asignarle el centinela crudo lo deja igual en cadena vacía: lo
protege el DOM, no la línea—. Lo observable es la **idempotencia**: sin traducirlo, el destino
nunca coincide con el origen y el sincronizador informa los cuatro campos movidos en **cada**
pasada, para siempre (medido 4/4/4 contra 4/0/0). Lo fija **TC-654 (B4c)**.

### 5.2 · La orejuela (commit 6)

**`#oai-fila`** pasa de `flex` a **grilla**, con `#oai-esq-caja` en `grid-column:2; grid-row:1 /
span 2` y la `.calc-box` en `grid-column:1; grid-row:2`. Es el **mismo patrón de `#vdsc-fila`**,
así que una sola estructura sirve a las dos maquetas: por debajo de 900 px el orden del DOM
—campos, dibujo, conclusión— es justo el apilado que corresponde.

| ancho | alto de la sección | hueco campos ↔ conclusión | ancho de la conclusión |
|---|---|---|---|
| 1440 | **851 → 660** | **255 → 35 px** | 1194 → 820 |
| 1000 | **862 → 740** | **228 → 20 px** | 778 → 404 |
| 768 / 390 | sin cambio | sin cambio (apilado) | sin cambio |

Medido con la orejuela **cargada**, que es la única escena donde el defecto existe: sin datos el
dibujo está oculto, la columna derecha queda vacía y el hueco no se puede medir.

### 5.3 · La aorta del ETE (commit 7)

**`#eteao-fila`** grilla de dos columnas desde 900 px, **`#eteao-campos.grid-2`** y
**`#eteao-concl`**. La sección queda **más baja** a los dos anchos donde la maqueta cambia
—361 → 336 a 1440 y 351 → 323 a 1000— y por debajo de 900 px no se mueve un píxel. El censo de
ids es el mismo: **siete** antes y siete después.

### 5.4 · La VAB (commit 8)

**`#vab-fila`** con **cuatro `.vab-col`** —(tipo de fusión, rafe, simetría), (EA, IAo),
(raíz, ascendente, fenotipo) y el contexto quirúrgico—, más `#vab-dibujo-host` y la `.calc-box`
del resumen **dentro de la fila**. Media queries en **700, 1200 y 1360 px**.

| ancho | columnas de campos | dibujo | alto de la sección |
|---|---|---|---|
| 1440 | 4 de **224,5 px** | al lado | **662,5 → 597,5** |
| 1360 | 4 de **210,5 px** | al lado | 597,5 |
| 1200 | 4 de **234 px** | **debajo** | 799,5 |
| 1000 | 2 de 255 px | al lado | 661 → 654,5 |
| 768 | 2 de 219 px | al lado | **753 → 654,5** |
| 390 | 1 de 328 px | debajo | **1277 → 1219** |

⚠️ **Entre 1200 y 1359 el dibujo baja a su propia fila**, y es la única forma de cumplir las dos
condiciones de la orden a la vez —cuatro columnas desde 1200 px y ninguna por debajo de 200—.
Desde 1360 vuelve al costado (`grid-column:5`).
⚠️ **Y de 700 a 1199 el dibujo se queda al lado**, como estaba: bajándolo la sección crecía a
930,5 px a 1000 y a 768, o sea peor que antes.

**El resumen entra en la fila** porque dejarlo abajo abría **286 px de espacio vacío a 1440**;
dentro, el hueco baja a **89,5 a 1440 y 52 a 1000 y 768**, y lo que queda es la diferencia de
alto entre columnas, inherente a la disposición pedida.

### 5.5 · Los dos cuadros de notas se PARAN, y Marfan no se tocó

⚠️ **No es interpretación: lo que hay en la pantalla no es lo que la orden describe.** Los puntos
6b y 7b mandan repartir el contenido de un recuadro de **texto explicativo** —lo de una guía al
ⓘ, la historia a FUENTES.md, los avisos que evitan un error se reportan y se dejan—. Lo que hay
es **«Notas OAI»** y **«Notas aorta ETE»**: dos `<textarea>` donde **el médico escribe**
(`oai_notas` y `ao_ete_notas`), con su marcador de ayuda. No contienen explicación de guía ni
historia de la app, así que las tres reglas de reparto no tienen nada sobre lo que aplicarse.
**Y sacarlos sería peor:** son **campos guardados** —el censo pasaría de 1004 a 1002, que la
orden prohíbe— y su contenido **llega al informe** por `_amV(...)`. Retirarlos borraría texto
clínico que el médico escribió.

**El commit 9 (Marfan) no tocó una línea:** la pantalla ya está como la orden la describe.

⚠️ **Un `</div>` de más costó una medición TRES veces en esta tanda** —Wilkins, la orejuela y la
VAB—, y es la misma trampa que PANT-6 pagó con la mitral del ETE. El síntoma de la VAB fue
inequívoco: las cuatro columnas en **0 px**, los ids de 13 a **12** y los globos de 6 a **5**. Se
cierra extrayendo cada bloque por **balance de `<div>` sobre el texto sin comentarios**,
verificando que cada pieza da 0 **antes** de escribir.

---

## 6 · La letra única de los carteles ⓘ (commit 10b)

**El médico tenía razón y está medido.** Barridas las **122** claves del registro, abriendo cada
cartel y contando los caracteres por tamaño de letra computado:

| tamaño | caracteres | papel |
|---|---|---|
| 11 px | 74.734 | **el cuerpo** |
| 12 px | 3.461 | el título `<h4>`, igual en todos |
| 9 px | 2.279 | los rótulos de bloque, iguales en todos |
| 10,5 px | 1.630 | la fórmula y el aviso, iguales en todos |

O sea que la letra ya era uniforme **por papel** en 121 de los 122. El que se salía es el de la
**orejuela**, y hubo que medirlo aparte porque el barrido no lo abre —su contenido es dinámico—:
con su ficha pintada traía **2.537 de sus 3.110 caracteres a 12 px** y 116 más en negrita también
a 12. Un punto más grande que todos los demás, que es exactamente lo que el médico describió.

⚠️ **La medición de cierre da 2.653, que es la SUMA de esos dos**, y no es una contradicción: la
sonda de dos motores cuenta por tamaño computado sin separar la negrita, así que publica
**12px : 2.653** en HEAD y **11px : 2.653** en el árbol nuevo (§ 8.2).

**La causa, en una línea: `_oaiRefGlobo` hacía `cont.style.cssText =
'font-size:12px;line-height:1.55;'`.** Era el **único** cartel de la aplicación que se declaraba
su propio tamaño de cuerpo. Se retira el `font-size` y se conserva el `line-height`, que no es
tipografía del cartel sino el aire de esa lista. Después: el cuerpo en **11 px**, con sus 10 px
de pie y sus 9 del chip intactos; **3.110 caracteres antes y 3.110 después**.

⚠️ **El barrido de las 122 claves sale idéntico antes y después, y ESO es el control, no la
prueba:** dice que los otros 121 carteles no se movieron un punto.
⚠️ **Y un cambio mío que se revirtió por no estar medido:** la primera hipótesis fue
`_otrRefClon`, y medido **no** era la causa; no pude medir su efecto sobre los dos carteles que sí
usan esa función, así que se revirtió.

**Regla nueva en `CLAUDE.md`, con su medición: «Todo cartel ⓘ usa la MISMA letra».**

---

## 7 · Cobertura

Seis casos nuevos, **TC-650 a TC-655**, con sus denominadores y sus controles negativos. Los seis
caen contra HEAD por **69 condiciones y ninguna por excepción**. Las fichas están en
`docs/mapa/tests-fichas-650.md`.

**35/35 mutaciones dirigidas muertas** (`scripts/_mut_pant7.py`), en worktree y nunca sobre el
vivo, con el md5 idéntico antes y después. **Siete sobrevivieron al primer barrido y me dijeron
tres cosas distintas:**

- **Cuatro eran condiciones que no podían fallar:** `indexOf('grid')` lo cumple
  `grid-template-columns` con `display:block`; `indexOf('1fr')` lo cumple `1fr 1fr`;
  `selectorText.indexOf('teer-tipo-aviso')` lo cumple `#teer-tipo-aviso-X`; y el control de que
  el resalte no escribe el campo **leía el campo después** de haber corrido el resalte. Nacieron
  **(A2)** endurecida, **(A2b)**, **(A3)** endurecida, **(A2)/(A2b)** de TC-653, **(D0b)** y
  **(D1b)**.
- **Una era un hueco real:** nada afirmaba que la regla que **ubica** la conclusión de la orejuela
  exista —estar dentro de la fila en el DOM no dice en qué celda cae—. Nació **(C1b)**.
- **Una mutación estaba mal escrita:** mutaba el atributo `opacity` del marcado de
  `#vdsc-names`, que **`vdscSync` reescribe en cada pasada**, así que no inyectaba ningún
  defecto. Se reescribió al punto que sí lo inyecta.
- **Y una era equivalente, protegida por el DOM:** la del centinela de Wilkins (§ 5.1).

**Sondas de la tanda**, todas con nombre propio verificado con `ls` contra HEAD:
`_probe_pant7vd.mjs`, `_probe_pant7vd1e.mjs`, `_probe_pant7cia.mjs`, `_probe_pant7c3.mjs`,
`_probe_pant7pant.mjs`, `_probe_pant7info.mjs`, `_probe_pant7ab.mjs` (copia del de PANT-6, 64
escenas) y el guardián `chk_pant7_backticks.py`, que cuenta los acentos graves de cada sonda
contra un número exacto.

---

## 8 · La medición de cierre → `docs/mapa/pant7-medicion-cierre.md`

El A/B final de las 66 escenas con el PDF y el PPT generados de verdad —**31 diferencias de
superficie firmada en siete escenas, las 31 autorizadas, y cero en las otras 59**— y los
**dieciséis cruces** de Chrome y WebKit con su control contra HEAD —**cuatro** diferencias entre
motores, las cuatro de 4 px de alto a 390 px— viven en archivo propio: esta sección pasaba el
techo de 35 KB y se partió **antes** de cruzarlo.
