# Fichas de casos por tanda — de TC-481 a TC-490 (2026-10-15 y 2026-10-16)

> **Archivo PARTIDO el 2026-10-17 (tanda VS).** `docs/mapa/tests-fichas.md` estaba en **33,4 KB**
> y la ficha de TC-494 lo cruzaba: se midio con `wc -c` **ANTES** de escribir, no despues. Lo que
> salio es la mitad mas VIEJA —las fichas de TC-481 a TC-490— y en el archivo original quedaron
> TC-491 en adelante, con un puntero a este.
> El formato no cambia: una ficha por caso, con que afirma, sus denominadores, sus controles
> negativos y las trampas que pago al escribirse.

## TC-481 y TC-482 — las dos tandas del 2026-10-15 por la tarde

| Caso | Qué fija | Condiciones | Rojas contra HEAD | Sonda |
|---|---|---|---|---|
| **TC-481** | Z6: el gradiente medio de la prótesis mitral se retira con regurgitación (nota `‡`) y con THP normal en la mecánica (Tabla 12); la fila del PPM; el DVI aórtico por un camino | **28** | **13**, ninguna por excepción | `scripts/_probe_z6.mjs` |
| **TC-482** | Y1: la vista 2D entera — botón, panel, lector único, tarjetas, tabla, formulario vacío, dos temas y nada escrito | **45** | **36**, ninguna por excepción | `scripts/_probe_y1.mjs` |

⚠️ **TC-482 MURIÓ POR EXCEPCIÓN CONTRA HEAD EN SUS DOS PRIMERAS VERSIONES**, y la segunda vez en el
**tercer elemento** del `push` —el texto de «encontrado»—, que se evalúa **siempre**, pase o falle la
condición. Un centinela en la condición no alcanza: hay que blindar también lo que se imprime.


### TC-483 y TC-484 — la vista 2D chica y el «porqué» de cada tarjeta (2026-10-16)

- **TC-483** (33 condiciones) fija el **Y1b**: el botón del pie con el color REAL de una pestaña de
  válvula en reposo en los dos temas y con tamaño de pestaña —con su denominador (la pestaña está
  en reposo) y su control negativo (una pestaña PRENDIDA no se ve así)—; la REGLA de la tarjeta
  flotante centrada de 900 px y 85 vh y que el `inset:10px` del Y1 ya no está; las tres zonas
  agrupadas en columnas de 184 px; el `clamp` del dibujo entre 200 y 320 px; UNA sola media query
  con corte en 768 px; las tarjetas siempre visibles y sin `<details>`; y los controles.
  **Sabe fallar contra el árbol del Y1: 14 de 33 en rojo, ninguna por excepción.**
- **TC-484** (51 condiciones) fija el **Y2**: que cada fila de cada tarjeta diga lo MISMO que la
  **fila completa** de la pantalla —en IM, IAo, IT, EAo, EM, ET y las dos prótesis—, que «Decide»
  publique el mismo texto que el renglón integrado, el botón con `aria-expanded`, su objetivo
  táctil de 40 px medido con `elementFromPoint`, sin hover, cerrado por defecto y cerrado de nuevo
  al reabrir la vista; la prótesis mitral con 0 a 4 positivos, la velocidad pico «no vota» y los
  dos retiros del Z6 **con sus dos controles negativos**; el grado fijado a mano sin lista y con su
  fundamento, con el control negativo del mismo grado; la lesión sin graduar; que no haya ninguna
  fila vacía; y los controles.
  **Sabe fallar contra el árbol del Y1: 36 de 51 en rojo, ninguna por excepción.**

⚠️ **LA COMPARACIÓN DE TC-484 ES CONTRA LA FILA COMPLETA DE LA PANTALLA (`.calc-row`), y es así por
dos razones.** La primera: el valor y el grado viven en **nodos distintos** —el span hermano, un id
propio o el propio valor, según la lesión— así que buscar los dos en el nodo del valor da rojo
sobre tarjetas perfectas; le pasó a la primera versión del caso **en cinco lesiones a la vez**. La
segunda: leer la fila entera es una lectura **independiente** — comparar contra los mismos nodos
que el lector usa, uno por uno, sería compararlo consigo mismo.

⚠️ **TC-484 MURIÓ POR EXCEPCIÓN CONTRA HEAD EN SU PRIMERA VERSIÓN**, por un
`JSON.stringify(undefined).slice(...)` en el **tercer** elemento del `push` —el texto de
«encontrado», que se evalúa siempre—. Misma lección que TC-482 pagó dos veces.


---

## TC-485 — la tanda «Y3» (2026-10-16)

**59 condiciones**, con ocho denominadores y siete controles negativos. **Sabe fallar contra HEAD
en un worktree aparte: 42 en rojo, y NINGUNA por excepción.**

Cubre, por bloques:

| Bloque | Qué afirma |
|---|---|
| **A · Y2b** | la fila de la Vmax con su valor y su grado idénticos a la pantalla; `EA_FILA_GRADO` en seis entradas; el resto de la lista sin moverse. **Control negativo:** con la Vmax moderada y el gradiente severo, la fila dice «moderada» y el renglón sigue diciendo «por gradiente» |
| **B · Y3-1** | AL a la izquierda (x=20) y PM a la derecha (x=510), en el SVG **y** en la copia en canvas del PDF; los seis festones con su `d` intacto y la orejuela en `68,156`. **Control negativo:** la proyección transgástrica no se tocó |
| **C · Y3-2** | el botón al lado de «Incluir en PDF»; el panel que corre la vista quirúrgica; las tres vistas y los cinco ángulos excluyentes con `aria-pressed`; la pausa que desarma el bucle; 20 aperturas sin acumular nodos; las tres reglas `[hidden]` explícitas; el alto fijo del lienzo |
| **D** | la compuerta de la prótesis **por geometría y no por la propiedad `hidden`**; el cierre al cambiar de pestaña y en «Nuevo estudio» |
| **E · Y3-3** | el lector; la tarjeta con la misma frase y el mismo chip que la vista 2D; la sincronía en vivo; «Limpiar». **Controles negativos:** sin lesiones no hay tarjeta, y fijar a mano el MISMO grado no es discrepancia |
| **F · Y3-4** | la tabla con y sin datos; cada valor idéntico a su campo; **ninguna recomendación ni veredicto** |
| **G** | informe, EN SUMA y las 440 columnas del Excel sin moverse con el panel abierto; ningún campo `m3d` en el estudio; ninguna clave en `localStorage` |
| **H** | **límite declarado:** los dos Wilkins dan el mismo puntaje y **textos distintos**. Es la PARADA Y3-6, escrita para que el día que se unifiquen el caso lo note |

⚠️ **EL CUERPO DE UN CASO NO PUEDE CAMBIAR EL ANCHO DE LA VENTANA**, así que el bloque C mide la
maqueta **que corresponde al ancho** en el que la suite corre y lo DECLARA en su denominador; la
del otro ancho la mide `scripts/_probe_y3.mjs`. Es el reparto de TC-460.

⚠️ **TODA LECTURA DE UNA PIEZA NUEVA VA POR UN AYUDANTE CON CENTINELA** (`CLIC`, `ATR`, `GEO`,
`TXT`, `TABLA3D`). La primera versión murió **dos veces** por excepción contra HEAD —`.click()`
sobre null y `T.tit.indexOf` sobre un objeto de respaldo al que le faltaba esa clave—, las dos con
**cero** condiciones en rojo: eso prueba que el árbol es distinto, no que el caso sabe medir.

**Caso adaptado por esta tanda: UNO.** TC-479, cuyo denominador exigía cinco entradas en
`EA_FILA_GRADO` y hoy exige seis, con el motivo escrito en el caso.

⚠️ **TC-484 SE SUMA A LOS INESTABLES POR ORDEN DE CORRIDA**, al lado de TC-137, TC-246, TC-249,
TC-252, TC-260, TC-395 y TC-GR-06. Su condición del objetivo táctil usa `elementFromPoint`, que
devuelve el **overlay del aviso legal** cuando éste reaparece a mitad de corrida: el síntoma es
`arriba=DIV`. Medido: rojo una vez en una lista de 15 casos y **verde dos veces seguidas** con la
misma lista y el mismo árbol, y 15/15 contra HEAD con esa lista. **Repetir antes de sospechar.**

---

## TC-486 — la vista 2D EN LÍNEA (tanda «Y1c», 2026-10-16)

**52 condiciones**, con **seis denominadores** y **cuatro controles negativos**. Verificado que
sabe fallar contra HEAD en un worktree aparte: **32 en rojo y NINGUNA por excepción**.

Seis bloques:

| | Qué afirma |
|---|---|
| **A** | El botón: `aria-pressed`/`aria-controls` y sin `aria-haspopup`; el **mismo texto** prendido y apagado; el color **real resuelto** igual al de una pestaña de válvula en **reposo** y **activa**, en los dos temas; y que no declara `:hover` |
| **B** | El panel: apagado **0×0**, `display:none` por regla de AUTOR con `!important` y **cero** tabulables; prendido **debajo** del botón y dentro de `#tab-valvulas`, en el flujo, sin fondo tenue, sin botón de cerrar, con `role="region"`, sin Escape ni clic afuera, **sin desplazamiento interno**, ≤900 px y centrado en su envoltorio |
| **C** | El tamaño: ancho y alto del lienzo **explícitos en px**, sin `clamp(100vh)`, sin `max-content`, sin `flex:1`, columna central **explícita**; la línea de fase en un renglón de alto fijo con su `title`; y **ningún** elemento se mueve más de 0,5 px a lo largo del ciclo |
| **D** | Se apaga solo al salir de Válvulas, al limpiar y por `RECALC_MODULOS` —afirmando además que `v2dCerrar` **está** en ese embudo—; 20 aperturas sin acumular nodos; y que no escribe nada en el estudio ni en el navegador |
| **E** | La **sincronía en vivo**, con su control negativo (tipear en un campo que la vista no mira no repinta) |
| **F** | Los controles: informe y EN SUMA en los **tres** estilos, grados, pastillas, diastólica, HFA-PEFF y el **Excel en 440 columnas** con el mismo valor, con el panel apagado y prendido |

### Reparto con la sonda, y por qué

El cuerpo de un caso **no puede emular un ancho** ni **esperar al reloj**, así que:
- las **reglas** de escritorio y de angosto se afirman por el fuente y lo **renderizado** se mide
  al ancho de la suite (756 px, o sea modo celular), con el denominador que lo dice;
- la estabilidad se mide recorriendo **40 fases** con `v2dFase(p)` —que deja el latido en una fase
  fija y dibuja ese cuadro—, no esperando dos ciclos de reloj;
- los **dos ciclos completos en los dos motores**, los **siete anchos** y los **dos temas** los
  mide `scripts/_probe_y1c.mjs`, que sí tiene el canal para emular el viewport.

Es el mismo reparto que TC-460 y TC-483 ya dejaron escrito.

### Casos adaptados por esta tanda: TRES

| Caso | Qué afirmaba | Qué afirma hoy |
|---|---|---|
| **TC-482** | el foco entraba a la tarjeta; el botón «× Cerrar» lo cerraba y devolvía el foco; tocar fuera cerraba; Escape cerraba por el oyente genérico | el foco **no** se mueve; el **mismo** botón apaga; tocar fuera **no** apaga; el panel **no entra** en el oyente genérico (es región, sin `aria-modal` y sin botón de cerrar) |
| **TC-483** | tarjeta flotante de 900 px y 85 vh con `overflow:auto` en el cuerpo; 8 px de margen en angosto; columna central `auto`; dibujo por `clamp(100vh)` | panel en línea con techo de 900 px y **sin** desplazamiento interno; 100 % del ancho en angosto; columna central **240 px**; dibujo **220×300** explícitos; más una condición **nueva** sobre la línea de fase |
| **TC-484** | — | sólo el ayudante de cierre y el objetivo táctil, que ahora **lleva el botón al viewport** antes de medir: `elementFromPoint` devuelve `null` fuera de él y el panel en línea cae debajo del borde |

**TC-485 no se tocó**: no nombra la vista 2D ni una sola vez.

---

## TC-487 — la tanda «H» (2026-10-16)

**35 condiciones**, contadas **instrumentando el propio caso** para que publicara su `ex.length`,
no a ojo. **Tres denominadores** explícitos y **cinco controles negativos**.

**Verificado que sabe fallar contra HEAD en un worktree aparte: 11 de las 35 en rojo, y NINGUNA
por excepción.**

⚠️ **ONCE DE TREINTA Y CINCO ES POCO, Y ESO ES EL PUNTO.** La regla de la aurícula izquierda —el
volumen indexado manda, con su grado y con el indexado entre paréntesis— **ya estaba
implementada** en `generarInforme`: lo que esta tanda hizo fue darle un dueño único. Así que las
veinte y pico de condiciones que afirman la frase, el EN SUMA y la cápsula **pasan también en
HEAD**, y eso es exactamente lo que había que demostrar. Las **once** que caen son las del dueño
(3), el rótulo derivado de las bandas (1), la cascada cableada retirada (1) y las **seis** del
PDF (la unidad de la VCI, las dos piezas del símbolo, el hueco duro, el ancho devuelto al
medidor y el control negativo sin sexo).

### Qué cubre

* las **seis escenas** de la AI que la orden enumera, con la frase EXACTA en los tres estilos del
  informe, el EN SUMA y la cápsula de la pantalla diciendo lo mismo;
* los **seis bordes** del volumen indexado, por sus dos lados, con la BSA en 2,00 exacta;
* el **rótulo derivado** de las bandas, carácter por carácter;
* el **colapso de la VCI con su «%»**, por TOKEN y no con un `+ '%'` pelado;
* el **símbolo del sexo dibujado** y no escrito, el hueco de espacios duros, el ancho devuelto al
  medidor en los tres sitios y el control negativo sin sexo;
* el **límite declarado** de la matrícula: la app no tiene cédula del médico;
* los controles: informe, EN SUMA, los ocho grados, la diastólica, el HFA-PEFF y el Excel en 440.

### Las dos trampas que este caso pagó

1. **`indexOf('uricula')` NO matchea «Aurícula»**, porque la í lleva tilde: **once** condiciones
   salieron rojas **por el filtro** y no por el árbol, sobre un informe perfecto. El filtro busca
   `'cula izquierda'`.
2. **No se puede buscar el glifo ♂/♀ en el fuente para probar que NO se usa**, porque el
   comentario que explica por qué no se usa lo NOMBRA. Es la trampa de `.ip-ap-col2` que TC-476
   ya pagó. Lo que se mide es que el texto del sexo se ARME con la constante del hueco.

### Lo que este caso NO puede medir, y lo mide la sonda

El cuerpo de un caso **no puede generar el PDF y mirarlo**: interceptar jsPDF, generar el
documento en las **seis** plantillas y rasterizar la página es trabajo de
`scripts/_probe_h.mjs`. Es el mismo reparto que TC-460 y TC-485 ya usan.

---

### TC-488 — el giro manual del 3D, el cuadro y la tabla, el Wilkins unificado y la pestaña Otros (2026-10-16)

| Caso | Qué fija | Condiciones | Rojas contra HEAD | Sonda |
|---|---|---|---|---|
| **TC-488** | Y3b + Wilkins + I: el giro a mano con los ocho botones desmarcándose y volviendo, el lienzo enfocable, sin zoom y sin oyentes con el panel cerrado; el cuadro más alto con aire arriba y la tabla en su columna; el Wilkins con un solo cálculo, sus dos centinelas y la marca de gesto; y los temas de Otros cada uno en su oración | **53** | **37**, ninguna por excepción | `scripts/_probe_y3b.mjs` |

**Las 16 que pasan contra HEAD son lo que esta tanda NO mueve:** que el botón del 3D exista con
válvula nativa, que el panel abra, que al abrir el único marcado sea la vista del cirujano, que tocar
un botón la marque, que la tabla no publique veredictos, las cinco combinaciones completas del
Wilkins —cuyas bandas ya coincidían— y los controles del informe, los grados y las 440 columnas.

⚠️ **EL CUERPO DE UN CASO NO PUEDE CAMBIAR EL ANCHO DE LA VENTANA**, así que las dos condiciones de
maqueta **declaran el ancho en el que corrieron** —la suite corre a **756 px**, o sea una columna— y
afirman la conducta que corresponde a ese ancho; la del ancho ancho la mide la sonda, que sí tiene el
canal para emular el viewport. Es el reparto de TC-460 y el que TC-485 ya usa para este mismo panel.

⚠️ **EL ARRASTRE REAL NO ES COSA DEL CASO.** Lo que el caso mide es lo que el arrastre HACE —llamar a
`m3dGirar`, que desmarca los ocho botones y mueve la cámara—; el arrastre con mouse y con dedo, en
los dos motores, lo manda la sonda por el protocolo.

⚠️ **LA MARCA DEL WILKINS, IGUAL.** El caso mide el **control negativo** —un `change` despachado por
código NO la pone— y la regla del guarda por el fuente; el gesto real (tipear el primer carácter de
una opción) lo manda la sonda, y ahí se midió además que `selectOption` de Playwright llega con
`isTrusted` en `false`.

---

## TC-489 — tanda «J» (2026-10-16)

**56 condiciones**, contadas sobre el propio caso (`grep -c 'ex.push(\['` en su rango), con
**seis denominadores** y **once controles negativos**.
**Verificado que sabe fallar contra HEAD en un worktree aparte: 35 de las 56 en rojo, y NINGUNA
por excepción.** Las 21 que pasan son lo que esta tanda no mueve: las escenas de la AI con área,
con diámetro y con volumen indexable, la frase de normalidad sin datos, el gesto de guardar, el
almacenamiento, las cuatro condiciones del panel que ya existían y los cinco controles.

| Bloque | Qué fija |
|---|---|
| **A** (10) | la AI con volumen sin ASC: la frase en los tres estilos, el EN SUMA mudo, la cápsula, el rótulo ASCII, el predicado por sus cuatro estados y **cuatro controles negativos** (área, diámetro, volumen indexable y sin datos) |
| **B** (8) | la UNA línea del PPT: sus cuatro ramas, el caso sin datos y **tres controles** (área+diámetro, indexado+área, área fuera de banda), más que la diapositiva ya no arma dos filas |
| **C** (20) | la identificación: el default, los dos gestos, el segundo toque, la memoria de sesión, el dato vacío por los dos lados, los dos vacíos, el guardado, las dos reaperturas, el estudio viejo, el almacenamiento, el oculto y las dos superficies por el fuente |
| **D** (13) | el panel de frases: las cuatro reglas de CSS, la estructura del DOM, los ids alcanzables, la accesibilidad, el cajón a 756 px, el cursor en los dos textarea y 20 ciclos |
| **E** (5) | los controles: el denominador del escenario, la AI indexable, **el Excel en 440 clave por clave**, la diastólica con las ocho severidades y el dueño del Wilkins |

⚠️ **EL CUERPO DE UN CASO NO PUEDE MANDAR UN CLIC DE CONFIANZA NI CAMBIAR EL ANCHO DE LA
VENTANA.** Los marcadores se tocan con un `.click()` sintético —que sí dispara el oyente
delegado— y la maqueta de dos columnas **no es medible** a los 756 px de la suite: el caso fija
**la regla** que la produce y **la estructura**, y mide el cajón angosto, que es lo que la orden
congela. La maqueta renderizada a 1200, 1440 y 1920 px y el clic real los mide
`scripts/_probe_j.mjs` y `scripts/_probe_jwk.mjs`. Es el reparto de TC-460, TC-463 y TC-485.

⚠️ **MURIÓ POR EXCEPCIÓN CONTRA HEAD EN SU PRIMERA VERSIÓN**, con CERO condiciones en rojo y un
stack en vez de una medición: `EL('pac-id-mk-ci').getAttribute('onclick')` sobre un nodo que allá
no existe. Toda lectura de los marcadores va por un ayudante con centinela (`MKAT`, `MKCS`,
`MKTAG`). Es la lección que TC-455, TC-473, TC-477, TC-480 y TC-487 ya tenían escrita.

⚠️ **Y UNA CONDICIÓN SALIÓ ROJA POR UN REDONDEO**: `height` y `maxHeight` del cajón salen del
MISMO `65vh` y el motor las devuelve como `304.844px` y `304.85px`, así que la igualdad de
cadena daba rojo sobre un cajón perfecto. Se comparan con tolerancia, y además contra el 65 % del
viewport.

---

## TC-490 — tanda «K» (2026-10-16)

**51 condiciones**, siete bloques. **Sabe fallar contra HEAD en un worktree aparte: 32 de las 51
en rojo, y NINGUNA por excepción.** Las 19 que pasan son los controles y lo que esta tanda no
mueve.

| Bloque | Qué fija |
|---|---|
| **(A)** K0a | el tope del chorro vale 3,6; el lienzo se limpia **entero**; cero píxeles del chorro en los cuatro bordes en las ocho cámaras; el chorro **conectado** a la válvula; control negativo sin IM |
| **(B)** K0b | la leyenda, el aviso y la botonera **dentro** de la columna izquierda; la clase de la fila al abrir y al cerrar; el panel **después** de la columna en el marcado |
| **(C)** K0c | `m3dBrujula`; los cinco ejes de `M3D_ORIENT`; `m3dXLat()` = −1; los rótulos de comisura leen el dueño; la brújula **gira**; la del ventrículo intacta; 20 ciclos sin acumular |
| **(D)** K1 | el campo nace vacío; el toque lo prende; **el PDF lleva el bull's eye SIN trastornos**; con trastornos también; apagado no va; «Nuevo estudio» lo apaga; la clave vieja de `localStorage` no prende nada; un estudio sin la clave abre apagado |
| **(E)** K2 | los tres bloques en orden; los botones en el del medio; «Ver en 3D» **no** se movió; la tabla de colores **no** está; la leyenda del dueño sí; el PDF y el PPT siguen leyendo `CONTR_MOTILIDAD`; el panel cerrado mide 0×0 |
| **(F)** K3 | el orden del interior; los cinco cuadros **a la derecha** con sus valores; las notas en su nodo; los mismos controles y ninguno nuevo; las casillas al lado de los colores; la regla que conserva el cuadro gris; nada guardado |
| **(G)** controles | el informe y el EN SUMA salen y no nombran los 3D; **Excel en 440**; el campo nuevo no está en el mapa del Excel |

### Los DENOMINADORES, uno por uno

- **(A0)** la sección de la mitral de ETE abre y el panel queda visible — sin eso el botón y el
  panel miden 0×0 y una sonda informa «no abre» sobre un mecanismo perfecto.
- **(A2)** con el chorro **alargado a propósito** el corte lateral SÍ ensucia la fila 0. Sin
  ensuciarla, «la fila 0 está limpia» no prueba nada: podría estarlo porque nunca se pintó ahí.
- **(A4)** con IM severa hay chorro dibujado en las ocho cámaras.
- **(D3)** la escena no tiene ningún trastorno sectorial y el PDF se genera sin error.
- **(F7)** el dibujo, el lienzo y la columna de datos tienen geometría.

### Las trampas que este caso pagó

1. ⚠️ **LA BRÚJULA DEL VENTRÍCULO VIVE EN `lv3dPintar`, NO EN `lv3dDibujar`.** La primera versión
   miraba la función equivocada y salía roja sobre una brújula intacta.
2. ⚠️ **EL PPT NO NOMBRA `CONTR_MOTILIDAD` EN SU LLAMADA:** se la pasa a su columna como `esc`.
   Buscar el nombre en la llamada da rojo sobre un PPT que sí la usa.
3. ⚠️ **EL CUERPO DE UN CASO NO PUEDE CAMBIAR EL ANCHO DE LA VENTANA** (el reparto de TC-460): la
   condición del cuadro gris afirma la **regla** que lo garantiza —`calc(46% + 118px)` con la
   columna en 110 px— y los píxeles a seis anchos los mide la sonda.
4. ⚠️ **LAS CONDICIONES VAN EN `{ extra: ex }`**, no en una cadena devuelta: el runner marca
   «el caso no declara NINGUNA condición» y la corrida sale roja con el texto correcto adentro.

---
