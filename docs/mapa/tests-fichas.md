# Fichas de casos por tanda

Sale de `docs/mapa/tests.md`, que cruzó el techo de 35 KB el 2026-10-16 al agregarle TC-485.
**Lo que está acá es la ficha de cada tanda**: qué cubre su caso, cuántas condiciones tiene y
cuántas quedan en rojo contra HEAD. **Lo que está allá es el mecanismo**: cómo se agrega un caso,
cómo se corre la suite, los dos juegos de helpers, los arneses y las trampas.

> ⚠️ **ARCHIVO PARTIDO el 2026-10-17 (tanda VS):** las fichas de **TC-481 a TC-490** salieron a
> `docs/mapa/tests-fichas-481-490.md`. Estaba en 33,4 KB y la ficha de TC-494 lo cruzaba; se midio
> con `wc -c` ANTES de escribir, que es lo que `CLAUDE.md` pide y lo que las tres particiones
> anteriores tuvieron que hacer DESPUES de cruzar.

> ⚠️ **ARCHIVO PARTIDO OTRA VEZ el 2026-10-17 (tanda CORTOS):** las fichas de **TC-491 a TC-495**
> salieron a `docs/mapa/tests-fichas-491-495.md`. Estaba en **34,1 KB** —a 855 bytes del techo— y
> la ficha de TC-499 lo cruzaba; se midió con `wc -c` ANTES de escribir.

## → Fichas anteriores de este archivo

Las de **TC-496 (PRO), TC-497 (PRO-B) y TC-498 (PRO-C)** salieron a
**`docs/mapa/tests-fichas-496-498.md`** el 2026-10-18, porque este archivo estaba en 29,5 KB y la
ficha de TC-502 lo cruzaba. No se reescribió una línea.

## TC-499 — la tanda «CORTOS» (2026-10-17)

**35 condiciones**, con **dos denominadores** y **cuatro controles**. **Verificado que sabe fallar
contra HEAD (`68d64f5`) en un worktree aparte: 29 de las 35 en rojo, y NINGUNA por excepción.**
Las seis que pasan son lo que esta tanda no mueve: la regla y los cortes de la prótesis mitral, los
umbrales nativos, el Wilkins, el PPM y la pulmonar.

### Qué afirma, por bloque

- **(DENOM1-2)** las piezas existen: `VT_PROT_OBSTR_MIN === 2`, `VT_PROT_AISLADO_TXT`, las ocho
  entradas de `OTR_HALL`, los cuatro dueños nuevos, y los 18 controles nuevos con **guión BAJO**
  —que es lo que los hace viajar con el estudio—.
- **(b1-b3)** la POSICIÓN de lo que se mudó, medida por **contención** y por **orden en el
  documento** y no por geometría: con la pestaña cerrada los nodos miden 0×0. El selector mitral no
  está dentro del cuadro y la fila de resultado lo precede; los dos campos tricuspídeos están dentro
  de `#campos-esten-tricuspide` en una `grid-3`; las cinco filas están dentro del `.calc-box` de la
  estenosis, debajo de `#et-sev`, y **sin** la clase `calc-box`.
- **(a1-a8)** la regla de DOS O MÁS: cero → `sin`, uno → `aislado`, dos → `estenosis`, con el mismo
  umbral que la mitral; con un solo positivo la frase **no sube al papel en ninguno de los tres
  estilos** y con dos sube al cuerpo y al EN SUMA; la cápsula nombra el hallazgo aislado con su
  valor; la onda E vota en **cm/s** por su borde exacto en las dos columnas (209/210 y 189/190) y el
  corte se publica **sólo** en cm/s; el dedazo de «2,1» cae fuera de banda y no vota; el espejo con
  el Doppler copia en los dos sentidos y el borrado borra en los dos; el DVI se sigue retirando con
  IT moderada o mayor; y **la pulmonar no cambia**.
- **(c1-c2)** el Ar−A por su borde (`29 no · 30 no · 31 sí`) y que la amplitud de la Ar **ya no es
  una condición**, con los dos cortes leídos del **rótulo** de la fila.
- **(d1-d3)** las cuatro clases de FEVI del dueño en el orden de lectura, las cuatro opciones del
  filtro de cohorte con sus rótulos derivados de `FEVI_CATS`, y que **40 exactos son
  «moderadamente reducida»**.
- **(e1-e2)** los dos toggles de PDF como campos del estudio —nacen apagados, el gesto los prende,
  «Nuevo estudio» los apaga y **la clave vieja de `localStorage` no los enciende**— y que el PDF de
  amiloidosis pregunta al dueño de la identificación impresa, con el censo de que ya no queda
  ninguna copia de la expresión que lo armaba a mano.
- **(f1-f9)** los seis hallazgos de Otros con su **frase exacta** en el informe y en el EN SUMA: ASIA
  sola y con nota, **la nota con la casilla apagada que no entra por ningún camino**, las seis
  variantes que van al cuerpo y **ninguna** al EN SUMA, la RAC con su nombre completo abajo y su
  sigla arriba, las tres frases del test de burbuja, que ese informe **no interpreta**, el derrame
  pericárdico con el token del selector **intacto**, la separación de las líneas B con y sin
  consignar, y los cuatro globos nuevos con NODOS de su ficha.
- **(g1-g6)** los controles: el Excel en **440** columnas con los campos nuevos viajando, **cero**
  claves en el navegador, la prótesis mitral sin moverse, los umbrales nativos y el Wilkins, los dos
  rótulos de la IP, y la maqueta al ancho de la corrida sin desborde ni superposición.

### Lo que este caso NO puede medir y mide la sonda

El **ancho de la ventana** —el cuerpo de un caso corre dentro de la página y no puede emular un
viewport, que es el reparto de TC-460—, los **dos motores** y el **ciclo de 20 aperturas** de la
vista 2D con su conteo de nodos. Las condiciones de maqueta de acá **declaran el ancho** en el que
corrieron. Todo eso lo mide `scripts/_probe_cortos.mjs`.

### Trampas que pagó al escribirlo

1. **UN `const` DE NIVEL SUPERIOR NO ES UNA PROPIEDAD DE `window`** —la trampa de `ECO_AYUDA`— y
   **cazó SEIS condiciones**: `G()` usa `in window` y devuelve «NO EXISTE» sobre `VINFO`,
   `_COH_LBL`, `VM_PROT_OBSTR_MIN`, `VM_PVL_ORIGEN_PVL`, `EM_CONT_REGURG_MIN` e `IP_PHT_SEVERA`, que
   **sí existen**. El cuerpo de un caso se evalúa en el scope global de la página: se los nombra
   **pelados**, con su guarda de `typeof`, que es lo que TC-471 ya hacía.
2. **NI UN REGEX CON BARRA DENTRO DEL CUERPO:** `/210 cm\/s/` llegó al motor como `/210 cm/s/` y el
   runner informó **excepción del caso**, no una condición en rojo. Va por `indexOf`.
3. **«cm/s)» CONTIENE «m/s)»:** la condición que exigía que la fila no dijera m/s salía roja sobre
   una fila perfecta.
4. **EL AEO DE LA ESCENA BASE ES UN TERCER CRITERIO MEDIDO:** el denominador del veredicto es 3 y no
   2, y con un valor fuera de banda queda en `sin` y no en `null`. **El denominador lo pone la
   escena, no la regla.**
5. **Me comí el acento grave DOS veces** dentro de los comentarios de este caso, con el archivo que
   documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea exacta las dos.

### Casos adaptados por esta tanda: DOS

- **TC-498**, en **quince** lugares: los valores de la onda E pasan a cm/s, las nueve escenas de UN
  solo criterio positivo pasan de `estenosis` a `aislado`, dos escenas pasan a **dos** positivos
  —(d4) y (e5), que exigen que el veredicto suba al papel y a la vista 2D—, y su (h6) deja de
  exigirle la clase `calc-box` a la cápsula tricuspídea y le exige que su **ancestro** lo sea.
  Ninguna de las quince estaba mal escrita: las quince describían la app de ayer.
- **TC-471**, una línea: el registro `VINFO` pasa de **30 a 34** entradas. Las cuatro nuevas no
  están en la pestaña Válvulas, así que lo que ese caso afirma del marcado de Válvulas no cambia.

---

## TC-500 — la tanda «Q»: las tarjetas ⓘ de las válvulas (2026-10-17)

**51 condiciones**, contadas sobre el propio caso (los `ex.push` de su cuerpo; ninguno vive dentro
de un bucle). **Verificado que sabe fallar contra el inicio de la tanda en un worktree aparte: 37
de las 51 en rojo, y NINGUNA por excepción** —las 14 que pasan son el mecanismo de los globos, que
viene de L y de M, y los controles, que es lo que esta tanda no mueve—.

### Qué afirma, por bloque

| Bloque | Qué fija |
|---|---|
| **A** (5) | el mecanismo y las 44 entradas del registro; los ocho botones de lesión son `<button>` sin `title` y con `aria-expanded`; los dos de fuera de la lista; ninguno de los 44 lleva al manual ni queda sin entrada; y los ocho quedan **ARRIBA** de su pastilla selectora, medido con la geometría |
| **B** (3) | las ocho abren con su propio botón y el segundo toque cierra; NUNCA hay dos abiertas; el cierre deja la tarjeta vacía y sin clave viva |
| **C** (8+1) | el GRADO es el de la pastilla en las ocho, con su clase de nivel; cada fila publica el MISMO nombre, valor y grado que el dueño; la línea «Decide» es la que la pantalla publica; las barras traen sus CORTES y el PUNTO con su unidad; la FUENTE al pie con folio; ningún rótulo de corte lleva palabra de gravedad; el signo de APOYO va en su grupo |
| **D** (6+1) | con morfología protésica la tarjeta lee `prot:tricuspide`; bio muestra SOLO 210 cm/s, 9 mmHg y 200 ms y mecánica SOLO 190, 6 y 130; ningún corte en dos unidades; la regla por sus TRES estados; la frase de integración con las palabras de su constante; el DVI pierde su barra al retirarse con IT moderada |
| **E** (5+1) | la PULMONAR con sus tres entradas; bio 3,2/20 y homoinjerto 2,5/15 sin mostrar los del otro; **NUNCA «severa»** en los cinco estados; «No graduada» con su motivo y sin barra en los tres sin columna; la estenosis nativa convirtiendo sus cortes al m/s de la fila |
| **F** (5+1) | la diastólica con las tres guías: la categoría es la de `dd-interp`, la guía elegida se nombra con su ritmo, cada guía trae SUS filas, el suplementario Ar−A sale solo con la ASE 2025 con su operador y su folio, y la fuente sale de su constante |
| **G** (2+1) | las dos frases fijas de la fuga aórtica ya no están en el texto visible de la pestaña, y el globo dice lo mismo en menos palabras con su folio |
| **H** (2+1) | el grado fijado a mano: la tarjeta lo publica, con su aviso y SIN criterios, y el **control negativo** con el automático |
| **I** (2) | 20 aperturas y cierres dejan el MISMO número de nodos y la tarjeta cerrada; las diez se cierran con el clic de afuera, o sea el oyente es uno solo |
| **J** (2) | abrir y cerrar las nueve no deja una clave en el navegador ni agrega un campo del estudio |
| **K** (3) | los CONTROLES: Excel en 440 columnas, el informe y el EN SUMA en los tres estilos sin una mención de la tarjeta, y la frase de integración que NO entra en ninguna superficie firmada |
| **L** (2) | la regla de CSS de la columna y el piso táctil acotado a `pointer: coarse`; la tarjeta siempre dentro de la pantalla |

### Lo que este caso NO puede medir y mide la sonda

El cuerpo de un caso corre DENTRO de la página: no puede cambiar el ancho de la ventana ni el
motor. Los cuatro anchos, los dos temas con su color REAL resuelto, Chrome y WebKit y las capturas
los mide `scripts/_probe_qtarj.mjs`. Lo que el caso fija es la REGLA de CSS que lo produce, que es
el reparto de TC-460 y de TC-485.

### Cinco cosas que pusieron el caso en rojo sobre un árbol perfecto

1. **`CDAT` DEVOLVIA UN OBJETO INCOMPLETO cuando la tarjeta no abría**, y una condición que leía
   `.texto.length` mató la corrida entera con un `TypeError` — que prueba que el árbol es distinto
   y no que el caso sabe medir. Hoy la forma del objeto es la misma siempre.
2. **`VINFO`, `QV_INTEGRA_TXT` y `DIAST_ALGO_FUENTE` SON `const` DE MODULO:** el ayudante `G()`
   —que usa `in window`— devolvió «NO EXISTE» sobre constantes que sí existen. Cuatro condiciones
   en rojo. Es la trampa de `ECO_AYUDA`.
3. **BARRER «sever» EN EL TEXTO COMPLETO DE LA TARJETA PULMONAR DA UN FALSO:** su línea de fuente
   dice «esa tabla no publica una columna de severa». Se barren los nodos que publican veredicto.
4. **EL VEREDICTO DE LA PROTESIS TRICUSPIDE NO ESTA EN EL PARENTESIS DEL «Decide»:** su entrada
   declara `decideModo: 'parentesis'`, así que la línea integrada publica los criterios con su
   conteo y la PALABRA la dice la fila `vt-prot-obstr`. Hay que leer las dos.
5. **EL `\s` SE COCINA:** una condición con un regex sobre el CSS quedó en rojo sobre dos reglas
   perfectas. Va por `indexOf`.

Y dos del ARNES del propio caso: **abrir Válvulas a ciegas navega fuera de la pestaña del globo de
la diastólica**, y **si el botón sigue midiendo 0×0 hay que abrir su cajón** —`valvDatosTog`
toggea, así que preguntarle al `caja-*` por su `display` no sirve—.

### Casos adaptados por esta tanda: CUATRO

- **TC-471**, dos números: el registro `VINFO` pasa de **34 a 44** y los globos de la pestaña
  Válvulas de **22 a 31**. Lo que ese caso vigila —que toda clave del marcado tenga entrada y que
  no quede ninguna de legado— no cambia.
- **TC-472** y **TC-474**, un número cada uno: los mismos 22 → **31** globos.
- **TC-484**, el denominador de `V2D_PORQUE` de **9 a 12** y, sobre todo, **su afirmación sobre la
  pulmonar cambia de nodo y no de sentido**: decía «`prot:pulmonar` NO existe» como PROXY de «la
  pulmonar no está en la vista 2D», y ese proxy dejó de servir. El invariante de verdad es
  `V2D_VALVS` —los dos lugares que buscan una entrada la buscan por una clave que sale de esa
  tabla—, así que hoy se exige que tenga TRES válvulas y que ninguna sea la pulmonar, que es más
  fuerte que lo anterior.

---

## TC-501 — tanda ARR: un campo VACÍO es SIN DATO (2026-10-18)

**50 condiciones**, ocho denominadores y nueve controles negativos.
**Sabe fallar contra el inicio de la tanda** (worktree en `7bd5a9f`, `md5 1eda9949…`):
**31 de las 50 en rojo, y NINGUNA por excepción.**

| bloque | qué afirma |
|---|---|
| **(A)** | las **cinco** filas de la aorta torácica vuelven a la raya al borrar, y el valor intermedio de un dígito —que es lo que produce el «Valor fuera de rango (10-90 mm)»— también |
| **(B)** | el **TAPSE** y la **onda S′**, por los dos gestos (borrar, y cambiar el valor por otro y borrar) |
| **(C)** | el **área de la AD** y, con ella, la **categoría C** de la probabilidad de HTP |
| **(D)** | el **promedio de las dos e′** al borrar cualquiera de los dos anillos |
| **(E)** | la **densidad del jet tricuspídeo** al volver el selector a vacío, con su denominador |
| **(F)** | **CONTROL NEGATIVO:** `ai_diam`, `ai_vol` y `fevi`, que ya volvían, siguen volviendo |
| **(G)** | **CONTROL MAYOR:** el informe en los tres estilos, el EN SUMA y las 440 columnas del Excel no se mueven |
| **(H)** | las **cuatro tarjetas ⓘ** que arrastraban vuelven a su texto de base, con su denominador |
| **(I)** | las **seis plantillas** del PDF salen idénticas |
| **(J)** | el **Ar−A**: 29 / **30,0 exacto** / 31, los dos lados en acuerdo, una sola constante, y el control de la velocidad de la Ar |
| **(K)** | el **DVI tricuspídeo automático**: los dos bordes por tipo de prótesis, el solo-lectura, el «requiere …» y el borrado |
| **(L)** | las **líneas B** sin separación, y el control del pericardio y de Balik |
| **(M)** | el **FOP unificado**: la frase exacta, el EN SUMA, el aviso de la edad omitido, una sola oración, una sola escala, el espejo en los dos sentidos y el control del legado |

### ⚠️ Trampas que este caso pagó

- **El span vacío dice un EM DASH (U+2014) y no un guión.** Comparar contra `'-'` dejaba los tres
  controles negativos en rojo sobre un árbol perfecto. Va por `String.fromCharCode(8212)`.
- **El denominador es «el formulario vacío con los cálculos YA CORRIDOS»**, no «el recién
  cargado»: de ahí el ayudante `CALENTAR()`, que corre todos los `calc*` y `_recalcModulos`.
- **jsPDF llega por CDN y a veces no**: las dos condiciones del bloque (I) se empujan **sólo**
  cuando la librería está. Una condición que pasa sin medir es lo que este archivo persigue, y un
  rojo de ENTORNO permanente es peor (TC-131, TC-135, TC-148). El PDF se mide **además** de verdad
  en `scripts/_probe_arr.mjs`, grupo `sal2`.
- **Los globos ⓘ viven en cinco pestañas** y las secciones de válvula nacen cerradas: el ayudante
  `PUERTA()` abre la del **propio** botón con los toggles reales.
- **El cuerpo de un caso carga con `__t.set`, no con teclas de CDP**: corre dentro de la página y
  no tiene el canal del protocolo. Las mismas escenas van con **teclas reales** en la sonda
  `scripts/_probe_arr.mjs`, que es la que midió los síntomas contra HEAD. Mismo reparto que
  TC-460, TC-463 y TC-469.
- **Me comí el acento grave en el cuerpo del caso cuatro veces**, y la peor fue al limpiarlos de
  un RANGO: me llevé el que **cierra** el cuerpo, y `check_backticks.py` señaló una línea del
  **runner** 150 líneas después, que es código normal.

---

## TC-502 — la tanda «P»: Referencias con subpestañas, buscador y la tabla de cirugía (2026-10-18)

**Cubre:** las cinco subpestañas con su censo, el buscador con la coma y el punto equivalentes, el
botón «Ver referencia» de las tarjetas ⓘ con su «Volver», la subpestaña Aorta con sus tres
nomogramas y la tabla de cirugía verificada contra la ESC 2024 **y contra el dueño de la pestaña
VAB**, la entrada vieja del VD retirada, y los controles.

**52 condiciones**, contadas **instrumentando el propio caso** —poniendo su (I0) en rojo una vez— y
no a ojo sobre los `ex.push`, porque cuatro salen de un `forEach`. Ocho denominadores y seis
controles negativos.

| bloque | qué fija |
|---|---|
| **(A) subpestañas** | las cinco en orden · el censo da **30** entradas · ninguna quedó fuera de un panel · el reparto 5+2+12+3+8 · cada botón activa SOLO su panel con `aria-selected` y un único tab stop · la barra es un `tablist` con `nowrap` + `overflow-x` · **control negativo:** una subpestaña desconocida no activa ningún panel |
| **(B) buscador** | **denominador:** el índice tiene 28 (30 menos los dos agrupadores) · «RWT» trae la geometría del VI y dice su subpestaña · **«0,42» y «0.42» dan EXACTAMENTE lo mismo** · no distingue mayúsculas · sin resultados con mensaje claro · tocar una coincidencia abre y resalta · «Limpiar» vacía y esconde |
| **(C) «Ver referencia»** | **denominador:** 39 de las 44 claves tienen entrada · el assert no encuentra ninguna rota · **límite declarado:** las cinco sin botón, nombradas · las CUATRO tarjetas (aorta, AI/VI, válvula y CORTOS) abren su entrada en la subpestaña correcta, la resaltan, y «Volver» regresa |
| **(D) aorta** | los tres bloques rotulados en orden · las TRES gráficas con su ecuación · **39 mm no es dilatado y 40 exactos sí**, medido en la cápsula, y Referencias lo publica con el símbolo derivado · el ateroma con sus cinco grados · el renglón tipeado ya no está · **denominador:** la tabla con sus DOCE filas · las SEIS columnas · **cada fila con su tabla, folio y hoja** · cada fila con clase y nivel · **los cinco umbrales de la bicúspide separan en el dueño** · **control negativo:** el sondeo sabe decir que NO · las cuatro marcas en pantalla · el pie declara la guía, la traducción y la regla de folio · ningún texto lleva una nota interna |
| **(E) VD** | la entrada vieja ya no existe ni en el marcado ni en la tabla · **denominador:** las cuatro bandas de la onda S′ · **sale del dueño (9,5) y no del corte viejo (10)** · ninguna celda publica ya «S′ (cm/s)» · el área de la AD también sale del dueño (19 y no 18) |
| **(F) integración** | el texto del VAL al final de Válvulas, visible, en letra chica y con las mismas palabras |
| **(G) ciclo** | 20 vueltas por las cinco subpestañas y 20 aperturas de una entrada **no acumulan un solo nodo** —con su vuelta de calentamiento— y la entrada queda cerrada |
| **(H) nada se guarda** | ninguna clave del navegador la nombra · ningún control viaja con el estudio · **denominador:** el campo EXISTE y es el recolector el que lo excluye |
| **(I) controles** | informe y EN SUMA idénticos en los tres estilos tras navegar y buscar · Excel en **440** · el Laboratorio y la diastólica sin moverse · **denominador:** el caso declara al menos 50 condiciones |

**Sabe fallar: 35 de las 52 en rojo contra el inicio de la tanda** (worktree en `ea7f2c0`), y
**ninguna por excepción** — el caso corre entero y publica sus 35 fallos. Las 17 que pasan son lo
que esta tanda no mueve: el censo de 30 (que es el mismo en los dos árboles, y ése es el punto), el
criterio de los 40 mm del seno, el ateroma, la onda S′ del dueño y los nueve controles.

⚠️ **Cuatro condiciones salieron rojas en su primera corrida sobre un árbol perfecto**, y las
cuatro por el medidor: el índice esperaba 29 donde son 28; el selector del test de burbuja se
construía con la concatenación **dentro** de las comillas; `AO_SEGS` es un `const` de módulo y daba
`null`; y el pie dice «Folio» con mayúscula.

---

## TC-503 — tanda «Y3c» (2026-10-18)

**El dibujo estático de la mitral con giro, tres vistas y plano de corte; la tabla única de
festones; y los cuatro dibujos de medidas TEER.**

**67 condiciones**, contadas instrumentando el propio caso para que publicara su `ex.length` —no a
ojo sobre los `ex.push`, porque veinticinco salen de bucles—. **Cuatro denominadores** y **cinco
controles negativos**.

**Verificado que sabe fallar contra HEAD** (`d007921`, md5 `52cc2f1c…`) en un worktree aparte:
**55 de las 67 en rojo, y NINGUNA por excepción** —toda lectura del árbol nuevo va por un ayudante
con centinela—. Las doce que pasan son los controles del 3D, del Excel, del informe y de la
diastólica, más los denominadores que ya existían.

| bloque | qué fija |
|---|---|
| **(A)** | la tabla dueña con sus cinco filas, los extremos contra el epígrafe, el reparto esquema → fila, y los cuatro esquemas leídos **del marcado** contra su fila; el esquema de 60–90° con P2 y sin A3 |
| **(B)** | el lienzo cuadrado, el anillo de dos semiejes verticales distintos, la **sonrisa** de coaptación por su flecha, las cuatro marcas, AL del lado de la orejuela, `pointer-events` y que nada cae fuera del lienzo |
| **(C)** | el ciclo de lesiones sincronizado entre dibujo, esquemas, espejo y resumen; «Limpiar»; y que los festones **no** llevan `onclick` |
| **(D)** | la línea del plano en los cinco ángulos desde los botones del 3D, con los festones en negrita, subrayados y **sin color**; el toggle al repetir; el cierre del panel; y el control negativo del color |
| **(E)** | cero botones de girar, las flechas de 15°, las tres vistas con su marca, y el desmarcado al girar a mano |
| **(F)** | el papel con el dibujo, que **no depende de la pantalla**, que **sí** lee las lesiones, y que se dibuja en el lienzo cuadrado (leído de la cabecera IHDR del PNG) |
| **(G)** | los cuatro dibujos TEER con su valor, el borrado de un campo con su **control negativo**, el color fijo del marcador y la ausencia de colores de lesión ajenos |
| **(H)** | nada se guarda ni en el estudio ni en el navegador; y los **controles** de que el 3D no cambió (`M3D_VIS`, `M3D_ANGS` y los ocho botones con sus nombres) |
| **(I)** | los controles del Excel en 440, del informe y del EN SUMA, y de la diastólica |

⚠️ **TRES COSAS QUE EL PROPIO CASO DESTAPÓ, y que una lectura no habría dado:**
1. **un `.click()` sintético ya no cicla la lesión**, porque desde el commit del giro los polígonos
   no tienen `onclick`: hay que despachar `pointerdown` + `pointerup`. La primera versión informó
   «el ciclo no funciona» sobre un ciclo perfecto **y además dejó en falso al control del PDF**,
   que compara el papel con y sin lesión;
2. **el botón del 3D nace `hidden`** y hay que llamar a `m3dBotonSync()` antes de medirlo;
3. **el botón de la vista se desmarcaba recién AL CONVERGER** —durante todo el giro quedaba
   marcada una orientación que ya no era la del destino—. **Eso se corrigió en `index.html`**, en
   el mismo commit.

⚠️ **UNA CONDICIÓN SE REESCRIBIÓ PARA MEDIR COMPORTAMIENTO Y NO EXPRESIÓN:** la que comprobaba que
el canvas ya no usa los paths cableados miraba el **fuente** de la función. Hoy lee los cuatro
bytes de ancho y los cuatro de alto de la **cabecera IHDR del PNG** y exige 840 × 840 —el lienzo
cuadrado con supermuestreo 2×—, que es el único lugar donde eso se comprueba sin mirar el código.

---

## TC-504 — tanda «Y3d» (2026-10-19)

**Los rótulos de festón visibles siempre; los cuatro defectos de los criterios TEER; la FEVI y el
DSFVI completándose solos; y la sección VAB entera —disposición, casillas, dibujo, morfología,
informe, PDF y el recordatorio de la coartación—.**

**63 condiciones**, contadas **instrumentando el propio caso** para que publicara su `ex.length`
—no a ojo sobre los `ex.push`, porque ocho salen de bucles—. **Cuatro denominadores** y **cinco
controles negativos**.

**Verificado que sabe fallar contra el inicio de la tanda** (`a40ccc2`, md5 `9281f677…`) en un
worktree aparte: **51 de las 63 en rojo, y NINGUNA por excepción**. Las doce que pasan son lo que
esta tanda **no mueve**: los dos denominadores, la línea del plano (A4), los tres controles
negativos (B8, G3, H9), el fenotipo aortopático que ya existía (H7), el aviso que no llega al
informe porque allá no existe (G4), las 440 columnas (K2) y —esto importa— **C1 y C3**: la
**copia** de la FEVI y el DSFVI ya funcionaba llamándola a mano, lo que faltaba era el
**disparador**, que es C2 y sí está en rojo.

| bloque | qué fija |
|---|---|
| **(A)** | los seis rótulos de festón en las **tres vistas** y en los **ocho ángulos** de giro; que `ETE_QX_VISTAS` ya no declara ninguna bandera de letras; y que tocar **dos veces** el mismo ángulo sigue apagando la línea del plano |
| **(B)** | el **flail gap** con su fila y votando (9,9 / **10** / 10,1), el **ancho** del flail (14,9 / **15** / 15,1), la **longitud de coaptación** con su propio corte (1,9 / **2** / 2,1), que sin dato nunca dice «APTO» y sí «Datos incompletos — falta: …», y el **control** de que los otros criterios no se movieron |
| **(C)** | la FEVI y el DSFVI copiados desde AI/VI, el **disparador en el origen**, que al borrar vuelven a vacío, y el rótulo unificado a **DSFVI** en el campo **y** en el criterio |
| **(D)** | las seis tarjetas ⓘ registradas, los seis como `<button>` **sin `title`** y sin llevar al manual, abrir y cerrar con dos toques, el campo de morfología oculto y el dibujo con su host |
| **(E)** | las seis **casillas**, su dato en los mismos campos ocultos, el conteo 0 → 1 → 2 → 1, los valores que escribe, la fila que dice «marcados», la **migración** de los cuatro valores guardados, «Nuevo estudio» destildando, y que la conclusión nunca afirma «sin factores de riesgo» |
| **(F)** | el dibujo sin afirmar nada sin tipo, con cierre y letras con tipo, el rafe calcificado en el verde de la paleta, la **orientación verificada** (R arriba, L abajo-derecha, N abajo-izquierda), los tres puntos sensibles con 44 px de lado, el toque eligiendo el tipo, los **tres tipos que no se dibujan inventados** y el botón de PDF |
| **(G)** | la morfología pasando a «Bicúspide», el caso **inverso** conservando el tipo con su aviso, el **control** de que una morfología elegida a mano no se pisa, y que el aviso **no** llega al informe |
| **(H)** | **una sola** descripción con el fenotipo, el rafe y los senos en plural; todo en español; la **raíz una sola vez**; sin «resolver la discrepancia» y sin el recordatorio; el EN SUMA corto; los **tres estilos**; el fenotipo aortopático en la frase de la aorta; y el **control** con «Trivalva normal» |
| **(I)** | la tabla del PDF con las **mismas palabras** del informe, el dibujo rasterizado desde la **misma** geometría, y el **control**: con la sección vacía no hay tabla ni dibujo |
| **(J)** | el recordatorio de la coartación en pantalla, **sin porcentaje**, con un id que no termina en `-aviso` y que «Nuevo estudio» no lo vacía |
| **(K)** | las seis casillas **no** son campos del estudio, y el Excel sigue en **440** columnas sin ellas ni el botón de PDF |
| **(L0)** | el **denominador del propio caso**: al menos 63 condiciones, para que borrar medio cuerpo no quede en verde |

### Dos trampas que este caso pagó

1. **`VINFO`, `_noEsDelEstudio`, `_labExcelRow` y `toggleEteSeccion` son `const`/función de
   MÓDULO**: `window[n]` da `undefined` y el identificador **pelado** sí se ve. Puso cuatro
   condiciones en rojo sobre un árbol perfecto. Es la trampa de `ECO_AYUDA`, pagada otra vez.
2. **LA CÁMARA DEL DIBUJO SE ANIMA**, y las letras colgaban de la cámara **en pantalla**: contar
   justo después del clic las encuentra todavía en la vista del cirujano, así que la condición
   **pasaba también contra el árbol viejo** —un falso plausible que cazó correr el caso contra el
   inicio de la tanda, no la lectura—. Se lleva la cámara al **destino** y se repinta antes de
   contar, y la misma corrección entró en **TC-503**, cuyo (E4b) tenía el mismo agujero.
3. **Los seis rótulos los CREA `eteQxConstruir`** la primera vez que alguien dibuja: sin una
   llamada explícita a `eteQxDibujar()` no existen todavía y la lectura informa «no hay rótulos»
   sobre un dibujo perfecto. Pasó una vez, en una corrida que la anterior había dado en verde.
