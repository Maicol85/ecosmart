# Mapa — PANT-14b: el estado del corazón maestro, «un dato una sola puerta», el PDF, el retiro de la transposición y el túnel violeta

Mapa de la tanda **PANT-14b** (2026-11-05). Por nombre de función y de constante, **sin números de
línea**: la línea cambia en cada edición, el nombre no.

---

## 1 · El estado del módulo se DERIVA, y no se conserva

**El defecto que el médico reportó, medido:** el corazón maestro arrancaba con el estudio viejo.
Cargar un Ebstein, «Nuevo estudio», cargar una CIA y reabrir dejaba `base = ebs` con su dibujo de
dos objetos y la CIA sin dibujar; y en dos escenarios la línea decía **«Sin lesiones cargadas que
dibujar»** al lado de un dibujo de cuatro y de siete objetos del paciente anterior.

**La causa, en dos líneas.** `cm3dEstudioSync` salía temprano con `if (!_cm3dVisible()) return`, y
`cm3dSync` —que es lo que `cc3dAbrir` llama— **repinta `_cm3d.S` sin derivarlo**. Con el panel
cerrado —como queda al salir de congénitas y tras «Nuevo estudio»— nada recalculaba.

**El dueño único es `cm3dDerivar`.** Lee las pestañas y publica de una sola pasada todo lo que
describe el estado: el dibujo, el esquema, la línea de estado y el botón del PDF con su aviso.

| quién | qué hace |
|---|---|
| `cm3dDerivar()` | el dueño único. **La derivación NO depende de que el módulo se vea**: lo que necesita la librería es el repintado, no la lectura. En «Explorar» no deriva nada. |
| `cm3dEstudioSync()` | delega. Lo nombran `ESPEJOS_VIVOS` (el gesto) y `RECALC_MODULOS` (la restauración). |
| `cm3dReset()` | cierra el panel, repone el modo a «Según el estudio» y deriva. Lo llama el final de `limpiarCampos`, que es el embudo de las dos salidas de «Nuevo estudio» y **no pasa por `RECALC_MODULOS`**. |
| `cc3dAbrir()` | deriva **antes** de pintar, y vuelve a «Según el estudio»: lo elegido en «Explorar» se descarta al abrir. |
| `irATabPaciente()` | llama a `cc3dPieSync()`. Existe justamente para **no** pasar por `showTab`, que es quien lo llamaba, así que el botón quedaba visible en la pantalla Paciente tras «Nuevo estudio». |

**El invariante de la línea.** «Sin lesiones cargadas que dibujar» se dice **sólo si el estado
derivado no dibuja nada**. Antes `cc3dNoDibujadas` preguntaba a `_CC_SECS`, y la **estenosis
pulmonar no tiene entrada ahí**, así que el dibujo mostraba su cono mientras la línea negaba.

**La estenosis pulmonar sin nivel tiene su propia frase** y nombra su sección: «Estenosis pulmonar:
falta consignar el nivel en la sección de estenosis pulmonar.» El nivel **no se asume** — ver
`docs/PENDIENTES.md` → **P14b-b**.

## 2 · El acceso a las congénitas

`cc3dAcceso()` es el dueño único, y **la regla no se inventa**: es `eeGetMode()` y
`eeModOn('congenitas')`, la misma que gobierna el botón «🧬 C. Congénitas» por su `data-mod`.
**Falla ABIERTO** a propósito: lo que decide es una pantalla, no un dato. `applyViewMode` llama a
`cc3dPieSync`, porque cambiar el modo en Config no pasa por `showTab`.

Medido: en Modo Básico y con el módulo apagado en Config, el botón da 0×0, el panel `display:none`,
**cero** scripts de three.js en el documento y `window.THREE` sin cargar.

---

## 3 · Un dato, una sola puerta

**Decisión del médico (05/11/2026).** Un dato que identifica la lesión dice que la lesión está
presente: el interruptor de presencia se enciende solo, se dibuja y entra al informe.

| quién | qué hace |
|---|---|
| `CC_PUERTA_SW` | el interruptor de cada sección. La CIA y la CIV tienen el suyo (`ete_cia_activa`, `ete_civ_activa`); el ductus es `ductus_incluir_chk` y la coartación `coart_incluir_chk`; las demás siguen `<k>_incluir_chk`. |
| `_ccPuertaIds()` | los campos que IDENTIFICAN cada sección. **Se leen del código de su propio `pred`**, que es el dueño de esa lista. |
| `_ccPuertaFirma(k)` | la firma de esos campos, con la que se detecta el apagado a mano. |
| `ccPuertaSync()` | el dueño único. Va **PRIMERO** de los dos embudos: los pintores de cada sección LEEN el interruptor. |

**El apagado a mano se detecta sin tocar los diecinueve botones**: un interruptor que pasa de
marcado a desmarcado **sin que la firma cambie** lo apagó una persona, y queda apagado hasta que
la firma cambie o lo vuelvan a encender. Las tres marcas —`data-ccpuerta-off`, `-vi` y `-on`— son
de runtime y entran en **las DOS listas** de «Nuevo estudio».

⚠️ **Es la única entrada de `ESPEJOS_VIVOS` que escribe un campo del estudio**, y está declarado:
escribe UN solo campo, el de su propia sección, y respeta el apagado a mano.

**Los estudios viejos no se migran.** Al reabrir uno con el dato cargado y el interruptor apagado,
la firma pasa de vacía a su valor, la marca se limpia y el interruptor se ve encendido — pero el
registro en disco no se toca hasta que el médico vuelva a guardar.

El inventario está en `docs/INVENTARIO_UN_DATO_UNA_PUERTA_P14B.md`: **19 secciones, las 19 con
interruptor**, y los 19 selects identificatorios con su opción cero vacía.

---

## 4 · El PDF: un solo bloque, y el esquema según el botón

**La causa del dibujo doble, en una línea.** El bucle que recoge las capturas excluye los diagramas
que ya se estamparon debajo de su texto con la lista `i === _oaiSlotUsado || i === _oaiEsqIdx ||
i === _tga3dEsqIdx`, y **`_cm3dEsqIdx` no estaba ahí**. PANT-13 agregó la entrada `cm3d` al
registro y su recolector y no la agregó a esa lista. Medido: tres imágenes y el mismo dataURL dos
veces.

⚠️ **Esa lista es CERRADA**: todo diagrama de familia `cc` que viaje por `imgSlots` tiene que estar
ahí, o se imprime dos veces.

**`cmEsqPdfOn()`** pregunta además por `_cm3d.sch`, el dueño único del estado abierto del esquema.
Hasta esta tanda el esquema entraba **siempre**, con su botón cerrado.

Medido con el PDF generado de verdad: con el esquema cerrado **una** imagen de 71×71 mm; con él
abierto **dos**, de 45×45 y 45×43; con la casilla apagada **cero** y 44 textos, idéntico a HEAD.
Cero duplicadas y cero muestras negras.

El estado del esquema abierto **no se guarda** con el estudio → **P14b-d**.

---

## 5 · El esquema de la transposición, y el retiro del recuadro viejo

**Decisión del médico**: para la transposición queda el esquema que la app ya tenía en la pestaña.
**No se replica su salida**: el cuerpo de ese esquema salió a `tgaEsqCuerpo` y el módulo **la
llama** con las mismas entradas. `tgaEsqSVG` quedó como su envoltorio.

| quién | qué hace |
|---|---|
| `tgaEsqCuerpo(k, sh)` | el dueño único del marcado del esquema, **sin** el envoltorio `<svg>`. |
| `tgaEsqSVG(k, sh)` | el envoltorio, para el contenedor de la pestaña. |
| `tgaEsqResolver(txt)` | **resuelve los colores al dibujar**, en una sola pasada al final. |
| `cmSchRender` | para la base `tga` delega en `tgaEsqCuerpo`, con la clave de `CM_TGA_VAR` + `_tga3dClave` y las tres comunicaciones armadas como `_cmEscenaTGA` las arma para el 3D. |

**La equivalencia: 50 de 50 escenas iguales, cero distintas** —las cinco variantes × cinco juegos
de comunicaciones × la obstrucción sí y no—, comparando cada nodo con su posición, su texto, su
tamaño de letra y sus colores resueltos. La obstrucción subaórtica es la única diferencia esperada
y se lista aparte.

**El retiro.** `#tga-3d-box` queda en el DOM con `display:none` —**no se borra**: sus ids los leen
el recolector del PDF, cinco funciones de la pestaña y varios casos— y en su lugar está el botón
`#tga-ver3d`, que llama a `tgaVer3D()`, que **delega** en `cc3dAbrir`.

| ancho | la sección antes | ahora |
|---|---|---|
| 1440 | 1230×833 | **1230×434** |
| 1000 | 806×1356 | **806×432** |
| 768 | 734×1556 | **734×475** |
| 390 | 356×1769 | **356×526** |

Con `display:none` el lienzo no tiene `offsetParent`, así que `_tga3dVisible()` da falso y **la
librería 3D ya no se carga desde ahí**: los scripts de three en el documento pasan de 1 a **0**.

⚠️ **LA GUARDA DE LA TRANSPOSICIÓN DEL BOTÓN DEL PDF ESTABA EN DOS LUGARES** —`cmPdfSync` y
`cmIncluirPDF`— y sacarla de uno solo no alcanzó: medido, el botón quedaba **activo** y el clic no
incluía nada, con el aviso de la transposición al lado. `CM_PDF_AVISO.tga` queda sin uso y no se
borra → **P13-c**.

---

## 6 · Los colores se resuelven al dibujar

⚠️ **ES UNA REGLA FIJA DEL PROYECTO**, y **la hizo valer un caso de prueba y no la lectura**:
TC-693 se puso rojo al delegar el esquema, con «6 cajas con relleno negro» y «queda un `var()` en
el marcado». Ese esquema pintaba sus cuatro cavidades y sus dos válvulas con `fill="var(--bg)"`, o
sea **el fondo de la página** —rgb(15,17,23) en el tema oscuro—, así que las cajas sólo se
distinguían por su borde.

`tgaEsqResolver` usa la paleta del módulo (`cmSchPal`), que ya trae sus respaldos por tema y
**valida** el valor antes de que entre al marcado. `TGA_ESQ_RESP` tiene el respaldo de los tres
colores de la circulación.

---

## 7 · El túnel del switch auricular, en violeta

**Pedido del médico**: «se forma un túnel que no entiendo bien de dónde a dónde va»; que las
estructuras complejas lleven otro color, por ejemplo violeta.

| quién | qué |
|---|---|
| `TGA3D_C.violet` | **el color, en UNA sola constante** (`0x8b5cf6`). El médico va a revisar después el Rastelli y el Fontan: cambiarlo es esta línea → **P14b-g**. |
| `TGA_ESQ_VIOLETA` | el mismo color para el esquema plano, **derivado del mismo número**. |
| `cmHayTunel()` | el dueño único de «hay un túnel dibujado». |
| `cmTunelLeySync()` | prende y apaga la entrada del túnel en **las dos** leyendas. |
| `TGA_ESQ_DEF.mus.tun` | los dos tramos de `fl` que pasan por dentro del túnel, **como dato**. |

**Las paredes van en violeta y las partículas conservan sus colores**: el flujo sale
`0x2f6fd0 0xd8433b 0xd8433b` en las cinco variantes, idéntico antes y después. Los rótulos pasan de
6 a 8, con «Túnel cavas» y «Túnel venas pulm.», de las palabras de `TGA3D_CIRC.mus`.

**El esquema plano**: el borde de la caja pasa de naranja a violeta —el naranja ahí significa
«comunicación o parche»— y los dos tramos llevan un trazo violeta ancho y semitransparente **por
debajo** de la flecha: en este esquema las flechas punteadas SON la sangre, así que pintarlas de
violeta perdería el dato de qué sangre corre por ahí.

**El contraste, medido y declarado como es**: la luminancia da 1,15 contra el azul y 1,04 contra el
rojo —bajo, porque los tres son colores de relleno de tono medio—. Lo que los distingue es el
**tono**: 42° del azul y 105° del rojo, con distancia euclídea en RGB de 101 y 204. **42° del azul
puede ser poco para una deuteranopia** → **P14b-h**.

**Las otras cuatro variantes no se movieron**: cero tubos violetas, el mismo esquema nodo por nodo,
la leyenda apagada. Y 50 escenas de las otras cinco bases, cero distintas.

---

## 8 · El anillo de la obstrucción subaórtica

⚠️ **LA PREMISA DE LA ORDEN ERA FALSA**: el médico **no** veía ese anillo. Estaba en la escena
—`enEscena` 1 con la casilla en «Sí» y 0 con «No»— y aportaba al lienzo **0 a 4 píxeles** del gris
de obstrucción sobre ~45.000 opacos, en las cinco variantes y en los dos estados de «Por dentro».

**La posición no se invent**: sale del **origen de la aorta de la propia escena** —la arteria roja
que `tga3dEscena` acaba de armar, cuyo primer punto es su raíz—, 0,30 por debajo. Sin `rx` ni `ry`
queda en el plano que la cámara mira de frente. Y lleva `pri:true`, la **prioridad de render** que
el renderizador del módulo aplica con `depthTest:false` y `renderOrder:10` **sólo a quien la pide**.

| variante | «Por dentro» apagado | «Por dentro» encendido |
|---|---|---|
| d-TGA | **+97 px** | +0 estricto, +1 laxo |
| Jatene | **+90 px** | +0 estricto, +27 laxo |
| Mustard | **+92 px** | +14 estricto, +161 laxo |
| Rastelli | **+92 px** | +14 estricto, +198 laxo |
| ccTGA | **+82 px** | +47 estricto, +263 laxo |

**Lo que no cerró**: «Por dentro» viene encendido por omisión, y ahí la d-TGA y el Jatene siguen
aportando menos de 30 px → **P14b-i**.

**Nada más se movió**: 75 escenas del 3D comparadas firma por firma, cero distintas.

---

## 9 · Las sondas de la tanda

| sonda | qué mide |
|---|---|
| `_probe_p14b_estado.mjs` | el recorrido (A) a (I) con el gesto real, **sin** llamar a `cmDesdeEstudio` a mano. |
| `_probe_p14b_acceso.mjs` | la regla de acceso en tres escenarios, y que la librería no se baje. |
| `_probe_p14b_inv.mjs` | el inventario de las 19 secciones y sus interruptores. |
| `_probe_p14b_puerta.mjs` | las cuatro combinaciones por sección, con el informe emitido. |
| `_probe_p14b_pdf.mjs` | el PDF generado de verdad, con las imágenes **duplicadas** y sus píxeles. |
| `_probe_p14b_esq.mjs` | la equivalencia del esquema, 50 escenas. |
| `_probe_p14b_retiro.mjs` | el retiro, a los cuatro anchos. |
| `_probe_p14b_tunel.mjs` | el violeta, la leyenda y el contraste. |
| `_probe_p14b_anillo.mjs` | los píxeles del anillo por variante. |
| `_probe_p14b_ab.mjs` | el A/B de superficies, 64 escenas. |
| `_probe_p14b_wk.mjs` | Chrome y WebKit, cuatro anchos, dos temas. |

⚠️ **Cuatro trampas de instrumentación que esta tanda pagó:**
1. **El anillo no se puede medir con el bucle PAUSADO**: el lienzo conserva el cuadro anterior, así
   que la cuenta sale la de la escena de antes y el control no se distingue del caso. Se quieta con
   la **frecuencia en cero**, que deja el bucle renderizando.
2. **`esqRasterizar` toma el TEXTO del svg y devuelve una PROMESA**, no un elemento y un callback:
   la primera versión de esa sonda quedó colgada a 0 % de CPU veinte minutos.
3. **La sub-pestaña y el acordeón**: sin abrir los dos, toda la geometría de la sección da 0×0.
4. **Un valor que un `<select>` no tiene deja el campo en cadena vacía**, y eso se lee igual que
   «la regla no funciona»: tres secciones del inventario se midieron primero con un valor
   inexistente.

---

## 10 · El barrido de mutaciones, y la redundancia que destapó

**37 de 37 muertas**, en un worktree y nunca sobre el árbol vivo, con el md5 idéntico antes y
después, en 4 min 37 s. Cada mutación declara **su** caso, y el reparto es limpio: nueve matan a
TC-699, seis a TC-700, tres a TC-701, cinco a TC-702, seis a TC-703, cuatro a TC-704, y una cada
uno a TC-535, TC-623, TC-676 y TC-693. El arnés es `scripts/_mut_p14b.py`.

⚠️ **La primera pasada dio 21 de 38, y los diecisiete sobrevivientes se repartieron en tres
clases.** Ésa es la parte que vale, porque cada clase dice algo distinto.

### Once eran huecos reales, y nacieron once condiciones

| Mutación que sobrevivía | Por qué | Condición nueva |
|---|---|---|
| «Nuevo estudio» no repone el MODO | el caso **cerraba el panel a mano** y dejaba el modo en «Según el estudio» antes de limpiar: (B4) y (B5) no podían fallar | **TC-699 (B0 DENOM)** — deja el panel ABIERTO y el modo en «Explorar» |
| el panel no se cierra | **`#cc3d-panel` es hijo de `#cc3d-wrap`**, que se esconde al salir de congénitas, así que el `display` **computado** da «none» pase lo que pase | **TC-699 (B4)** reescrita: mide el `display` **en línea**, la clase y la bandera del módulo |
| `irATabPaciente` no repinta el pie | (H1) a (H3) navegan con `showTab`, que ya repintaba; el camino de «Nuevo estudio» es `irATabPaciente` | **TC-699 (H4)** |
| la puerta del acceso abierta por las dos mitades | (I1) a (I3) miden que la regla **exista** y dé verdadero; nada medía que se **cierre** | **TC-699 (I4)** |
| el esquema no se repinta al derivar | ninguna condición lo miraba | **TC-699 (K1)** |
| el interruptor se enciende con el predicado en falso | `limpiarCampos` **no pasa por `RECALC_MODULOS`**, así que (C1) medía un interruptor que nadie había vuelto a evaluar | **TC-700 (C1b)** — corre el dueño de verdad |
| el apagado a mano deja de respetarse · no se registra | poner `.checked` a mano **no dispara ningún evento**, así que `ccPuertaSync` no volvía a correr y el apagado no podía pisarse | **TC-700 (D1b)** |
| una firma nueva ya no borra el apagado | la comparación es **por firma**, así que una marca vieja deja de coincidir sola: el borrado es la segunda red | **TC-700 (D1d)** — la marca queda limpia, no vieja |
| los botones de estado no se repintan | (B1b) lee la clase 700 ms después, y el embudo de los espejos ya corrió su propio pintor | **TC-700 (B1c)** — se lee SIN esperar, en la pasada sola del dueño |
| `cmSchRender` deja de delegar | (A2) busca el nombre del dueño **dentro** de la función, y `if (false &&` lo deja escrito ahí | **TC-702 (A2b)** — compara el marcado **emitido**, nodo por nodo, y exige cero `var()` |
| la barra de la obstrucción · «Ver en 3D» no delega | nada medía la barra, y (B3) buscaba `cc3dAbrir` dentro de la función: un `return` antes lo deja escrito | **TC-702 (D3)** y **(B3b)** — el botón se **toca** |
| la leyenda del túnel no se pone al día | (D1) y (D2) llaman a `cmTunelLeySync()` **ellas mismas** | **TC-703 (D1b)** — sube por las puertas reales |

### Una redundancia retirada

⚠️ **`cm3dReset` cerraba el panel, y no tenía que hacerlo.** Su **único** llamador es
`limpiarCampos`, que ya lo cerraba **433 líneas antes** —el `cc3dCerrar()` que una tanda anterior
puso junto al de `v2dCerrar`—, así que era la **tercera** copia de la misma acción, con la del
pintor del pie. Lo destapó la mutación que rompía **las dos** mitades y seguía sobreviviendo. Dos
mecanismos para el mismo trabajo son como se llega a que arreglar uno deje el otro roto sin que
nada avise, que es la lección que el D-10 pagó cinco veces. **Lo que sí es propio de `cm3dReset`
—reponer el MODO y apagar el esquema, que ningún otro camino hacía— se queda, y la mutación 05 lo
mata.**

### Tres estaban mal dirigidas o eran equivalentes, y se declaran

- **La 09** mutaba el `return true` final de `cc3dAcceso`, que es **inalcanzable** porque `eeModOn`
  existe. Hoy muta la rama real y la matan seis condiciones.
- **La 21** declaraba TC-701, que carga una CIA; la condición que la mata es **(C2) de TC-702**,
  que carga una transposición.
- **La 24 se retiró**, y es una equivalencia medida: el **respaldo** del resolvedor de colores es
  inalcanzable con el marcado que la app emite —las **seis** variables que usa las cubre `MAPA`—,
  así que ninguna mutación lo puede hacer observable. Lo que sostiene al resolvedor es la **23**,
  que sí muere.

### Lo que la casa ya sabía y esta tanda volvió a usar

**Cinco de las treinta y siete no revierten nada: la aplican de más** —el acceso fallando cerrado,
el interruptor con el predicado en falso, el esquema entrando al PDF sin su botón, `cmHayTunel`
dando verdadero siempre, la prioridad de render en TODOS los objetos y el anillo sin obstrucción—,
porque las condiciones que las matan son **controles negativos**. Y **dos rompen las dos mitades a
la vez**, que es la lección del D-11: la puerta del acceso vive en `cc3dPieSync` y en `cc3dAbrir`,
y las tres marcas de «un dato, una sola puerta» viven en el **selector** y en el **cuerpo** del
barrido de «Nuevo estudio».
