# Mapa — PANT-34: las nueve vistas con su rótulo, el selector de arteria y el esquema de anomalías coronarias

Armado sobre el cierre de la tanda **PANT-34** (2026-11-11). **Sin números de línea a propósito**:
la línea cambia en cada edición, el nombre de la función no.

Qué contesta este mapa:

- dónde se agrega o se cambia una **vista de angiografía**, y por qué el título del botón no cambia;
- dónde se dibuja el **rótulo de la vista** dentro del cuadro del 3D y por qué no mueve el dibujo;
- cómo funciona el **selector de arteria**, cuál es su criterio de «dueño» y por qué se filtra la
  definición y no el dibujo;
- cómo está armado el **esquema de anomalías coronarias** de Referencias: su marcado, sus casillas,
  su motor de dibujo y su paleta.

---

## 1 · Las nueve vistas de angiografía

**El dueño único del nombre y del giro es `LV3D_CORO_VISTAS`**, un `Object.freeze` de nueve
entradas `{ n, a, b }`. De esa tabla salen **las dos cosas** que el médico ve: el texto de los nueve
botones de la lista, que escribe `lv3dCoroUI`, y el rótulo dentro del cuadro, que escribe
`lv3dPintar`. Con el nombre copiado en el marcado, el día que uno cambie la lista y el cuadro
dirían cosas distintas de la misma vista.

**La convención, medida en la TAREA 0 y verificada contra la demo:**

| campo | qué es | signo |
|---|---|---|
| `a` | la oblicua | **negativa = OAD**, positiva = OAI |
| `b` | la angulación | **positiva = craneal**, negativa = caudal |

`lv3dCoroMatriz(vista)` arma el vector de cámara `d = [sin(a)·cos(b), sin(b), cos(a)·cos(b)]` y
devuelve `lv3dMul([xc, yc, d], Rp)`, con `Rp` la postura anatómica de base. Así «de frente» es
`a:0`, «lateral izquierda de 90°» es `a:90` y «sin angulación» es `b:0`. Lo que degeneraría es
`b:±90`, que ninguna vista pide.

**Las nueve, en su orden:**

| # | nombre | `a` | `b` | de dónde viene |
|---|---|---|---|---|
| 0 | OAD caudal | −30 | **−30** | la demo decía −25 · **cambió en PANT-34** |
| 1 | OAI caudal | **50** | −30 | la demo decía 40 · **cambió** |
| 2 | OAD craneal | −30 | **30** | la demo decía 20 · **cambió** |
| 3 | OAI craneal | 40 | 30 | igual que la demo |
| 4 | PA craneal | 0 | **40** | la demo decía 30 · **cambió** |
| 5 | OAI (CD) | **40** | 0 | la demo decía 35 · **cambió** |
| 6 | **AP caudal** | 0 | −30 | **nueva** |
| 7 | **Lateral** | 90 | 0 | **nueva** |
| 8 | **OAD recta** | −30 | 0 | **nueva** |

**Para agregar una vista** se agrega una entrada a la tabla y un botón `.lv3d-coro-v` con su
`data-v` consecutivo. El texto del botón es de respaldo: `lv3dCoroUI` lo sobreescribe con el de la
tabla, y **TC-813 (A4)** compara los nueve rótulos contra ella para que no puedan divergir.

⚠️ **Los ángulos no se escriben en NINGUNA pantalla** y quedan declarados en `P29-b`, pendientes de
una fuente. El giro es interno; lo que se publica es el nombre.

---

## 2 · El título del botón no cambia, y la tilde marca la activa

Hasta PANT-33 el botón pasaba a decir «Vista: OAD caudal». **Hoy dice siempre «Vista de
angiografía»** (`lv3dCoroUI`), y lo que dice cuál está puesta son dos cosas:

- la **tilde** (`✓`) delante del nombre de la opción activa, en la lista;
- el **rótulo** dentro del cuadro del 3D.

El botón sigue cambiando de **aspecto** —`btn-primary` con una vista elegida— porque eso es estado
y no título. Volver a «ninguna» funciona como siempre: `lv3dCoroSoltarVista`, que corre al girar
con el dedo y al elegir una orientación de punta.

---

## 3 · El rótulo dentro del cuadro

Lo dibuja **`lv3dPintar`**, al final, **después del bucle de polígonos y después de la brújula**:

- **dónde**: rincón **derecho** de abajo, `x = W − 14` con `textAlign: 'right'` y
  `y = oy + 4`, o sea **a la misma altura que la brújula** (`oy = H − 48`) y del lado opuesto —la
  brújula vive en x 26 a 90—. Ese rincón medía **cero** píxeles de tinta antes de esta tanda.
- **qué dice**: `LV3D_CORO_VISTAS[_lv3d.coroVista].n`, sin un solo grado.
- **cuándo**: sólo con `_lv3d.coro` verdadero **y** una vista elegida.
- **cómo se lee en los dos temas y en modo angiografía**: lleva **halo**, igual que las letras de
  las arterias — `strokeText` con el fondo que corresponde (`LV3D_CORO_FONDO` en angiografía,
  `pal.fondo` si no) y relleno `'#f0f0f0'` o `pal.texto`.
- **por qué no mueve el dibujo**: no entra en `polis`, no se ordena por profundidad, no se puede
  tocar y no escribe en `_lv3d.R`.
- **`save`/`restore`**: restituyen `font`, `textAlign`, `lineWidth` y `lineJoin`. Es la lección del
  `lineJoin` de TC-783: el contexto del canvas es el **mismo** entre cuadros, así que un estilo que
  queda puesto cambia los cuadros siguientes **para siempre**. La mutación 14 del barrido quita el
  `restore` justamente para probar que hay cobertura.

**Sale también en la captura y en el PDF**, porque `lv3dCapturar` llama al mismo pintor. Medido en
el PNG: 641 píxeles de tinta con una vista y cero sin ella. Ver `P34-d`.

---

## 4 · El selector de arteria

| pieza | qué es |
|---|---|
| `_lv3d.coroArt` | `'todas'`, `'izq'` o `'der'`. Estado del momento: **no se guarda** |
| `_lv3d.coroListaArt` | si su lista está desplegada |
| `LV3D_CORO_LADOS` | el dueño único del nombre de las tres opciones |
| `lv3dCoroLado(g)` | **el criterio**: `'der'` si el grupo es `CD`, `'izq'` en cualquier otro caso |
| `lv3dCoroFiltrar(d)` | filtra la lista de definiciones; con `'todas'` la devuelve tal cual |
| `.lv3d-coro-art-btn` | el botón, con título **fijo** «Arteria» |
| `.lv3d-coro-a` | las tres opciones, con `data-a` |
| `#lv3d-coro-lista-art` | su lista flotante, 150 px |

**El criterio es el campo `g` que `lv3dCoroDefs` YA resuelve después de aplicar la dominancia**
—`oPDA = (dom===2) ? 'Cx' : 'CD'` y `oPL = (dom===0) ? 'CD' : 'Cx'`—, así que la coronaria derecha
es `g === 'CD'` y la izquierda es todo lo demás: el tronco (`LM`), la descendente anterior con sus
diagonales y septales (`DA`), la circunfleja con sus marginales (`Cx`) y las ramas posteriores que
la dominancia le haya dado. **Con una segunda lista de reparto**, el día que la dominancia mueva una
rama el selector y el dibujo dirían cosas distintas.

**Se filtra la DEFINICIÓN y no el dibujo**, y eso es lo que hace que lo que no se dibuja desaparezca
completo: el trazo, su **letra** —que sale del campo `n` de la propia definición—, su **tramo gris**
—que `lv3dCoroSegmentos` calcula por grupo sobre estas definiciones— y su lugar en el orden por
profundidad. Con un filtro en el pintor quedaría la letra, y la mutación 19 del barrido lo prueba.

**Lo medido, en las tres dominancias:**

| dominancia | todas | izquierda | derecha |
|---|---|---|---|
| **derecha** | 20 arterias · 7 letras | **12** · Cx, D, DA, MO | **8** · CD, DP, PL |
| **codominante** | 19 · 7 letras | **13** · + PL | **6** · CD, DP |
| **izquierda** | 19 · 7 letras | **17** · + DP y PL | **2** · CD |

Segmentos dibujados con dominancia derecha: **1.298 / 748 / 550**.

**Lo que el selector NO toca** (TC-816): el estado de contractilidad, el texto de hallazgos del
informe, la leyenda del territorio, el bloque «Arterias posiblemente involucradas» y el modo de
color del 3D. Y **tocar un territorio no lo mueve**. Mantiene lo elegido al cambiar de vista y de
dominancia —que puede mover ramas de lado, y el dibujo se actualiza al instante— y **apagar
«Coronarias» lo devuelve a «Todas»** (`lv3dCoroApagar`), que es lo único que esa función ganó en
esta tanda: la **dominancia sigue sin reiniciarse**.

**El tronco de aorta** (`lv3dCoroRaiz`) se dibuja con cualquier lado: no sale de `lv3dCoroDefs` y
no es una arteria de ningún lado — es la raíz donde nacen las dos. Declarado en `P34-b`.

### La fila de los dos desplegables

`#lv3d-coro-caja` pasó de ser la caja relativa de un desplegable a ser **la fila**, y cada
desplegable lleva su propia caja relativa `.lv3d-coro-dd`, que es la que ancla su lista absoluta.
**El panel sigue teniendo TRES hijos**, que es lo que TC-783 (B5) mide.

⚠️ **`flex: 1 1 0` con `min-width: 0`, y NO una base en píxeles**: la columna mide **150 px** a
1440 y a 1000, así que con una base de 96 px los dos botones se irían a líneas distintas justo en el
ancho de escritorio, que es donde la orden los quiere en la misma fila. Encogiendo desde cero
comparten la fila en los cinco anchos medidos (1440, 1280, 1000, 768 y 390) a **73, 73, 73, 336 y
147 px**, los dos de 44 px de alto, **cero texto recortado** y **cero desplazamiento horizontal**.

⚠️ **Son botones y no un `<select>`**, y el motivo ya estaba escrito en este archivo:
`limpiarCampos` barre `querySelectorAll('select')` **completo**, sin filtrar por `id`, así que un
`<select>` volvería solo a su primera opción en cada «Nuevo estudio» sin avisarle a `_lv3d`.

---

## 5 · El esquema de anomalías coronarias, en Referencias

**Dónde vive.** Pestaña **Referencias** → subpestaña **Cardiopatías congénitas**
(`REF_SUBTAB.congenitas`), ficha **`ref-coronarias`**, encabezado «🫀 Anomalías coronarias
congénitas — trayecto».

**La ficha tiene CUATRO hijos y eso no cambió:**

| hijo | `data-ref-solo` | qué es |
|---|---|---|
| 1 | — | el texto corto de siempre: los tres trayectos y el riesgo del interarterial |
| 2 | — | su línea de fuente, con el folio 266 |
| **3** | `1` | **`#rac-root`: el esquema de PANT-34** (antes, las cuatro viñetas de PANT-29) |
| 4 | `1` | la línea de fuentes de PANT-29, intacta |

⚠️ **Los hijos 1 y 2 son los que el globo ⓘ `otr-rac` clona** —`_otrRefClon` sin modo saltea los
marcados—, así que **no se tocan**: el clon sigue dando **478** caracteres idénticos. Ver `P34-a`.

### El marcado

```
#rac-root
  .rac-ap[data-rac-ap="aaorca" | "aaolca" | "alcapa" | "arcapa" | "fistula"]
    h4.rac-tit     -> label.rac-chk (input[data-rac="head"] + span.rac-chk-t) + span.rac-sigla
    .rac-cuerpo    -> .rac-txt (los parrafos, con las casillas DENTRO de las frases)
                      .rac-esq[data-rac-esq] -> .rac-svg · .rac-ley · .rac-nota · .rac-pie
```

**Las casillas son DIECIOCHO**: cinco de título y trece dentro de las frases (4 + 4 + 0 + 0 + 5).

⚠️ **VAN SIN `id`**, y es por construcción y no por una lista: `limpiarCampos` recorre
`input[id], select[id], textarea[id]` y les escribe el `checked` de la clave guardada, así que una
casilla **con** `id` se destildaría sola en «Nuevo estudio» **dejando el dibujo puesto sin su
casilla**. Sin `id` quedan fuera de los tres mecanismos del censo —`guardarInforme`,
`_formTieneDatos` y `limpiarCampos`—. La **etiqueta envuelve** la casilla: asociación implícita,
accesible y operable con teclado sin necesitar `for`/`id`.

**El cuadro se oculta con la clase `.rac-oculto` y NO con `hidden`**, que es la lección de PANT-30.

### El motor

| función | qué hace |
|---|---|
| `racDibujar(ap)` | el único punto de armado: lee las casillas, muestra u oculta el cuadro y dibuja |
| `_racTildadas(ap)` | qué casillas están tildadas en ese apartado |
| `_racSpline(p)` | Catmull-Rom convertido a curvas de Bézier: la curva **pasa** por los puntos |
| `_racPared(angs)` | los puntos de la pared de la aorta, por ángulos **horarios desde las 12** |
| `_racOndular(p, amp)` | la onda de la fístula: cada tramo en cuatro, los intermedios de lado a lado |
| `_racBase(svg)` | las cuatro cavidades y los tres senos, siempre que el cuadro se vea |
| `_racNormales(svg, salvo)` | las coronarias normales, en gris |
| `_racLeyenda(host, filas)` | la leyenda con su muestra de color |
| `racCablear()` | **un** oyente delegado de `change` en `#rac-root`, puesto **una** vez |
| `window.racDiag(ap)` | la sonda de solo lectura del arnés |

⚠️ **Se arma con `createElementNS` y NO con `innerHTML`**: así no entra un `innerHTML` nuevo al
archivo —Semgrep se queda en su línea base— y no hay forma de que una cadena termine interpretada
como marcado. Igual no habría dato del usuario: cada número y cada rótulo es una constante.

⚠️ **Los oyentes no se acumulan**: el repintado reemplaza el contenido del `.rac-svg` y de la
`.rac-ley`, pero las casillas y los contenedores son **marcado estático**, y el oyente está en la
raíz con una guarda de una sola vez.

### Las constantes de geometría

| constante | qué tiene |
|---|---|
| `RAC_VB` | el lienzo: **400 × 360** |
| `RAC_BASE` | aurícula derecha, aurícula izquierda, arteria pulmonar, aorta y los tres senos |
| `RAC_NORM` | las cuatro coronarias normales: `cd`, `lm`, `da`, `cx` |
| `RAC_AORT` | los dos orígenes anómalos desde la aorta, con `pre`, `retro`, `inter` y los ángulos de `intra` |
| `RAC_PULM` | las colaterales, el tronco naciendo de la pulmonar, la flecha y la derecha de la ARCAPA |
| `RAC_FIST` | los dos orígenes, los seis recorridos y los tres rótulos de desembocadura |
| `RAC_LEY` | los textos de la leyenda |
| `RAC_NOTA_CAM` / `RAC_NOTA_FIS` | las dos notas del pie |

**El rótulo de la aorta va abajo dentro del círculo** (`cy + 48`) y no en el centro: ahí se
encimaría con los tres senos, que son los que ocupan el medio. Medido: cero rótulos encimados.

### El color

⚠️ **Va por una REGLA de CSS sobre las clases del SVG, y NO como `var()` dentro de un atributo de
presentación.** Un `stroke="var(--x)"` es inválido en tiempo de cómputo y cae en el **negro**
heredado de la raíz: es la trampa que POP-B pagó con `--amber` y PANT-13 con `--card`. Por una regla
sí resuelve, **y además sigue al tema solo**, sin redibujar.

| clase | variable | para qué |
|---|---|---|
| `.rac-c-gris` | `--rac-gris` | coronaria normal |
| `.rac-c-pre` | `--rac-pre` | por delante de la pulmonar (azul) |
| `.rac-c-retro` | `--rac-retro` | por detrás de la aorta (verde azulado) |
| `.rac-c-inter` | `--rac-inter` | interarterial (rojo) |
| `.rac-c-intra` | `--rac-intra` | tramo intramural (rosa) |
| `.rac-c-ambar` | `--rac-ambar` | origen en la arteria pulmonar |
| `.rac-c-fist` | `--rac-fist` | la fístula |

Las nueve variables existen en los **dos** temas: las saturadas en `html.light-mode` y las más
claras en `:root`. Medido: **cero** trazos y **cero** rellenos en negro en los cinco esquemas y en
los dos temas, con **dos paletas distintas**.

### La disposición

`.rac-cuerpo` es flex: el texto a la izquierda (`flex:1 1 0`) y el cuadro al costado
(`flex:0 0 230px`). **Por debajo de 700 px de VENTANA** el cuerpo se apila y el cuadro pasa
**debajo** del texto, centrado y hasta 300 px. **El cuadro no queda fijo mientras se lee**, y no es
un olvido: la `.card` que envuelve la ficha es `overflow:hidden` en los dos ejes, así que un
`position:sticky` adentro no se activa nunca (`P34-b`).

**La zona táctil** de cada casilla con su texto mide **24 px o más** —el relleno vertical del
`.rac-chk-t` es lo que la da, porque un elemento `inline` no toma la altura de línea—, y la
etiqueta va `display:inline` a propósito: con `inline-block` una etiqueta larga no podría partirse
entre dos líneas y a 390 px desbordaría.

---

## 6 · Qué prueba cada caso

| caso | qué fija |
|---|---|
| **TC-813** | las nueve vistas con sus nombres y su orden, los nueve giros, el título fijo, la tilde, las nueve orientaciones distintas y cero grados en pantalla |
| **TC-814** | el rótulo en el rincón derecho, su tinta por vista, que desaparece al soltar la vista y al apagar, y el reinicio del selector |
| **TC-815** | el botón «Arteria» en la misma fila, sus tres opciones, y las nueve combinaciones de dominancia por lado con sus letras y su tramo gris |
| **TC-816** | la independencia del territorio y de la contractilidad, y la persistencia al cambiar vista y dominancia |
| **TC-817** | los cinco apartados, las dieciocho casillas sin `id`, el cuadro oculto por clase, el pie, el globo en 478 y los 40 encabezados |
| **TC-818** | las dieciocho casillas una por una, la superposición de caminos, el intramural y las combinaciones de la fístula con sus dos notas |
| **TC-819** | la geometría —lienzo, rótulos dentro, sin encimarse— y el color por regla en los dos temas |
| **TC-820** | la captura con el rótulo, respetando el selector y sin tocar la banda del pie |
| **TC-779** | *(adaptado)* los hijos 1 y 2 intactos, el globo idéntico, y el cuerpo propio ahora es el esquema |
| **TC-783** | *(adaptado)* las NUEVE vistas en la lista y los OCHO botones de 44 px |
| **TC-784** | *(adaptado, (B2) INVERTIDA)* las nueve dan nueve dibujos y el título **no** cambia |
