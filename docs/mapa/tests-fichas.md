# Fichas de casos por tanda

Sale de `docs/mapa/tests.md`, que cruzó el techo de 35 KB el 2026-10-16 al agregarle TC-485.
**Lo que está acá es la ficha de cada tanda**: qué cubre su caso, cuántas condiciones tiene y
cuántas quedan en rojo contra HEAD. **Lo que está allá es el mecanismo**: cómo se agrega un caso,
cómo se corre la suite, los dos juegos de helpers, los arneses y las trampas.

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
