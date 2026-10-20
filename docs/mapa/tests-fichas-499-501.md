# Fichas de casos por tanda — TC-499 a TC-501

Partido de `docs/mapa/tests-fichas.md` el **2026-10-20 (tanda Y3e)**, que estaba en **28,9 KB**
y con la ficha de TC-505 cruzaba el techo de 35 KB. **Medido con `wc -c` ANTES de escribir**, que
es lo que `CLAUDE.md` pide y lo que `PENDIENTES.md` → **Y3d-7** dejaba anotado.

Las de **TC-481 a TC-490** están en `docs/mapa/tests-fichas-481-490.md`, las de **TC-491 a
TC-495** en `docs/mapa/tests-fichas-491-495.md`, las de **TC-496 a TC-498** en
`docs/mapa/tests-fichas-496-498.md` y las de **TC-502 en adelante** en `tests-fichas.md`.


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
