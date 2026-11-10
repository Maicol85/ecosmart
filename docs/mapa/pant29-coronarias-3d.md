# PANT-29 — Referencias más breve y las arterias coronarias en el 3D de Contractilidad

Mapa de la tanda del **2026-11-10**. Sello **`v20261109-2338`**. Por nombre de función y de
constante, no por línea.

---

## 1 · Referencias: los dos resúmenes y la ficha ampliada

### Lo que se quitó

Las **tres fichas grandes** de PANT-28 —`ref-atleta`, `ref-chagas` y `ref-racong`— salieron con
su reparto. Sumaban **83.067** caracteres de `textContent` (20.416 + 25.976 + 36.675) contra los
**2.702** de `ref-miocard` entera: eso es lo que el médico quiso decir con «excede ampliamente».
Donde vivían quedó un comentario que dice qué las reemplaza y dónde sigue verificado su
contenido.

**El buscador no necesitó un solo cambio.** Su índice se arma en `_refIndiceArmar` recorriendo
los `h2.card-head` con `toggleRef(` de cada panel, así que las tres dejan de indexarse solas y
los resúmenes nuevos se indexan solos con la ficha que los contiene.

| conteo | antes | después |
|---|---|---|
| encabezados con `toggleRef` en los nueve paneles | 43 | **40** |
| claves de `REF_SUBTAB` | 31 | **28** |
| entradas del índice del buscador | 41 | **38** |
| claves del mapa de «Ver referencia» | 50 | **50** (ninguna apuntaba a las tres) |

### El molde del sector, medido

`ref-miocard` tiene pares de `<div>`: **título** (`font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:6px;`)
y **cuerpo** (`font-size:12px;color:var(--text);line-height:1.8;margin-bottom:10px;`), con
viñetas `• <b>Rótulo:</b> texto<br>`. De **10** hijos pasa a **14**.

⚠️ **NINGUNO de los cinco resúmenes que ya estaban lleva línea de fuente**, medido hijo por
hijo. Los dos nuevos van igual, y la trazabilidad vive en `docs/RESUMENES_P29.md`. Declarado en
`docs/PENDIENTES.md` → **P29-a · 2**.

⚠️ **EL TECHO DE EXTENSIÓN ES EL RESUMEN MÁS LARGO QUE YA EXISTÍA**: la amiloidosis, **849**
caracteres de `textContent` y **7** viñetas, medido con el normalizador del arnés. Atleta mide
**845** y 6; Chagas **846** y 5.

⚠️ **EL PRIMER TÍTULO NUEVO LLEVA `margin-top:10px`**, y no es estética: el cuerpo de la
amiloidosis es el último del molde y **no tiene** `margin-bottom`, así que sin eso el título
nuevo quedaba pegado a su última viñeta. Los cinco anteriores quedan idénticos en texto, estilo
y etiqueta, hijo por hijo.

### La ficha de coronarias y la compuerta del globo

`ref-coronarias` pasa de **2 a 4** hijos y de **445 a 1.643** caracteres. Los dos primeros son
los de siempre —los tres trayectos y su línea de fuente con el folio 266— y pasan **intactos**;
los dos nuevos llevan **`data-ref-solo="1"`**.

⚠️ **EL MECANISMO QUE DEJA EL GLOBO IGUAL ES UNA LÍNEA EN `_otrRefClon`.** `VINFO['otr-rac'].dyn`
llama a esa función **sin modo**, y sin modo clona `r.children` ENTERO: todo lo nuevo habría
entrado también a una tarjeta de 360 px anclada a una casilla de Otros. La compuerta es un
`filter` que saltea los hijos con la marca:

```js
nodos = nodos.filter(function (n) { return !(n.getAttribute && n.getAttribute('data-ref-solo')) });
```

No se toca `VINFO`, ni el botón, ni el modo `'tablas'` —que elige por `<table>` y no por esta
marca, así que `otr-burbujas` no se mueve—, ni ninguna otra ficha.

| medición del globo | antes | después |
|---|---|---|
| `_otrRefClon('ref-coronarias')` | 478 | **478** |
| `#vinfo-card` abierto con su botón real | 494 | **494** |

⚠️ **PARA MEDIRLO EN PANTALLA HAY QUE ABRIR EL ACORDEÓN «variantes» DE Otros PRIMERO.** Con el
acordeón cerrado el botón mide **0×0**, `_vInfoColocar` devuelve `null`, la tarjeta no abre y la
cuenta da **cero caracteres sobre un globo que sí existe**. Y el acordeón es un **toggle**: si
otro caso lo dejó abierto, un toque lo cierra, así que se toca hasta que el botón tenga caja, con
tope.

---

## 2 · Contractilidad: las dos tarjetas grises

| pieza | dónde | qué cambió |
|---|---|---|
| relleno de las dos tarjetas | CSS `#lv3d-bloque-hallazgos,#lv3d-bloque-botones` | `10px 12px` → **`7px 9px`** |
| reparto con el 3D abierto | `lv3dMaquetar` | `1fr \| 210px \| calc(46% + 118px)` → **`220px \| 150px \| 1fr`** |
| reparto con el 3D cerrado | `lv3dMaquetar` | **no se toca** |
| en 768 px o menos | `lv3dMaquetar` | sigue siendo **una** columna |

⚠️ **LA COLUMNA FLEXIBLE CAMBIA DE LADO, Y ES LO QUE EL MÉDICO PIDIÓ.** Antes la única flexible
era la de hallazgos: a 1440 px medía 264 px, pero **a 1000 px caía a 44 px** y el texto salía a
un carácter por renglón —el propio comentario del código lo declaraba para 1200 px—. Hoy el 3D es
el flexible.

| ancho | hallazgos | botones | panel del 3D | textos recortados |
|---|---|---|---|---|
| 1440, antes | 264 | 210 | 650 | 0 |
| 1440, después | **220** | **150** | **754** | 0 |
| 1000, antes | **44** | 210 | 462 | **2** |
| 1000, después | **220** | **150** | 346 | **0** |

Medido en los dos temas, con **cero** desplazamiento horizontal en los ocho cruces.

---

## 3 · «Arterias posiblemente involucradas»

Vive **dentro** de `#lv3d-bloque-hallazgos`, **debajo** de `#contr-texto-informe`, en
`#contr-arterias` / `#contr-arterias-li`. Visible **siempre**: no tiene `display` propio.

| pieza | qué es |
|---|---|
| `CONTR_ART_NIVEL` | los cuatro tramos, cada uno con su `max` (segmento), su `c` (corte de altura para el gris del 3D) y su `txt` |
| `CONTR_ART_ROTULO` | sólo traduce `CX` → `Cx`: la **pertenencia** sale de `CONTR_TERRITORIO` |
| `CONTR_ART_NADA` / `_MULTI` / `_PIE` | las tres frases fijas |
| `contrArteriasDatos()` | el **dueño único**: qué segmentos están alterados, cuál es el más alto y qué tramo le toca. Lo leen la línea de pantalla **y** el 3D |
| `contrArterias()` | arma las líneas de texto |
| `contrArteriasRender()` | pinta por **nodos** y con `textContent` |

**El enganche**: la última línea de `contrRenderInforme`, que es el **único** lugar que escribe el
texto de hallazgos. Con la llamada ahí los dos no pueden contarse historias distintas; repetirla
en los siete llamadores es como uno se queda sin ella. **El texto de hallazgos no cambia.**

⚠️ **EL NIVEL SE DECIDE POR EL MÍNIMO NÚMERO AHA ALTERADO**, que es la regla del pedido leída al
revés y cubre los cuatro casos con una sola comparación: si hay algún basal el mínimo es ≤ 6; si
no hay basales pero sí medios, cae en 7–12; si sólo hay apicales, en 13–16; y si sólo está el 17,
es 17.

⚠️ **«Alterado» es cualquier índice > 0**, no una lista de grados: el día que se agregue un grado
entra solo.

**Las cinco formas, medidas con el gesto real:**

| escena | líneas |
|---|---|
| 1, 7, 13 | `DA: toda la arteria` |
| 5, 6 | `Cx: toda la arteria` |
| 9, 10 | `CD: desde el tercio medio` |
| 13, 16 | `DA: tramo distal` · `Cx: tramo distal` · `Compromete más de un territorio coronario.` |
| 17 | `DA: tramo distal (ápex)` |
| ninguno | `Ninguna.` |

y en todas, al final, `Orientativo. Solo en pantalla: no va al informe.` **El pie va siempre**,
también con «Ninguna.»: es una salvedad del bloque y no de un hallazgo.

**No llega al papel y no hay forma de que vaya**: son dos `<div>` sin ningún `input`, `select` ni
`textarea`, que son los tres que los barridos del estudio y del Excel recorren, y tampoco cuenta
para «la sección tiene datos», que mira `value` y `checked`.

---

## 4 · Las arterias coronarias en el 3D

### Lo que se portó, y lo que no

**La demo es three.js y este 3D no.** `docs/3d/ecosmart_demo_arterias_coronarias_3d.html` (367
líneas) construye la malla como `BufferGeometry` y las arterias como `TubeGeometry` sobre
`CatmullRomCurve3`, con quaterniones y `<div>` absolutos para las letras. El 3D de la app es un
**pintor 2D propio** sobre un canvas de 680×380, con matriz de 3×3 (`_lv3d.R`), `lv3dProy`,
`lv3dPant` y orden por profundidad. **Lo que se porta es la definición de cada arteria** —puntos
sobre la superficie, por altura y ángulo— y las reglas.

### La conversión de coordenadas, medida

| magnitud | demo | app | conversión |
|---|---|---|---|
| altura | `t` de 0 (base) a 1 (ápex) | `t = k/LV3D_N` | **la misma `t`** |
| ángulo | `ph`, con `x=-sin(ph)`, `y=cos(ph)` | `d` grados, con `x=cos(d)`, `y=sin(d)` | **`d = ph + 90`** |
| radio | `rr = R·√(1−t²)`, escalado por `k` | `lv3dRing(k,v,G)[j]`, escalado por `k` | el mismo factor |

Verificado en los dos extremos: `ph=0` cae en el segmento **1** en las dos y `ph=60` en el **2**.
Los tres orígenes se convirtieron de los vectores de la demo: **OL** (−0,055 | 102,5 | 0,462),
**OR** (−0,055 | 141,5 | 0,627) y el tronco de aorta (−0,21 a 0,02 | 140,0 | 0,352).

### Las funciones

| función | qué hace |
|---|---|
| `lv3dArtPunto(t, gr, k, v, G, L, cache)` | el punto sobre la superficie. Mismo mecanismo que `lv3dAparato`: anillo redondeado y columna por el ángulo. `t` puede ser **negativa** —el tronco nace por encima del plano del anillo— y entonces el anillo se acota a 0 |
| `lv3dCoroDefs()` | las definiciones con la dominancia: `g` el grupo que decide el gris, `n` la letra, `f` su anclaje, `w` el ancho |
| `_lv3dCR(p, i, u)` | Catmull-Rom **en el espacio de parámetros**, no en el de los puntos 3D |
| `lv3dCoroSegmentos(v, G, L)` | los trazos con su profundidad media y su color, más los anclajes de las letras |
| `lv3dCoroRaiz(v, G, L, cache)` | el tronco de aorta corto: un trazo grueso con extremos redondeados, que es la silueta de un cilindro |
| `lv3dCoroMatriz(vista)` | la matriz de la vista: `Rv · Rp`, el mismo producto que la demo hace con quaterniones |
| `lv3dCoroUI()` | pinta el estado de los botones y la visibilidad del panel y del pie |
| `lv3dCoroApagar()` / `lv3dCoroToggle()` | el encendido y el apagado |
| `window.lv3dCoroDiag()` / `window.lv3dCoroSonda(v)` | solo lectura, para el arnés |

### Por qué las arterias acompañan al corazón

⚠️ **SE CALCULAN POR CUADRO CON `lv3dRing(k, v, G)`, O SEA CON LA MISMA FUNCIÓN QUE DIBUJA LA
PARED.** No es que se muevan parecido: leen el **mismo** radio. Y la interpolación es Catmull-Rom
**en el espacio de parámetros** `(t, ángulo, factor)` y no en el de los puntos 3D, así que la
curva interpolada sigue estando **sobre** la superficie en vez de atravesarla.

Medido con `lv3dCoroSonda` en **cuatro** fases, 340 muestras: el cociente entre el radio del
punto y el de la **pared en el mismo sitio** se desvía **4,8 × 10⁻⁵** del `k` de la definición en
las cuatro, mientras el radio absoluto va de 0,95–4,50 en fin de diástole a 0,62–3,39 en fin de
sístole.

**La demo no se anima**, así que esto no sale de ella.

### Por qué entran en la misma lista ordenada

Los trazos se concatenan a `polis` **antes** del `sort` por profundidad, así que un tramo que
pasa por detrás del ventrículo queda **tapado** por la pared. Con una pasada posterior todas las
arterias quedarían por delante de todo.

⚠️ **CON «Coronarias» APAGADO EL BLOQUE NO CORRE**, y `polis` es exactamente la de HEAD: ni un
polígono más, ni un orden distinto. Medido por **píxeles**: pausando la animación y fijando la
fase, el `dataURL` del canvas da el mismo hash y los mismos 52.322 bytes en los dos árboles.

⚠️ **LAS ENTRADAS DE ARTERIA NO TIENEN `.s`**, así que `lv3dTocar` las saltea por su propia
guarda y tocar una arteria no cambia ningún segmento.

⚠️ **EL `lineJoin` SE RESTITUYE, Y LO DESTAPÓ TC-783.** El contexto del canvas es el **mismo**
entre cuadros: dejarlo en `round` cambiaba el repaso de contorno de los 1.440 cuadros de la malla
**para siempre**, y el defecto sobrevivía a apagar el botón. Una comparación de estructura no lo
habría visto, porque no mueve un solo polígono.

### El tramo gris

`eff[g] = min(nivel.c, max(0, tMax[g] − 0,1))`, con `nivel.c` saliendo de **`CONTR_ART_NIVEL`**,
la misma tabla que la línea de pantalla. Un trazo es gris si su `t` media es ≥ `eff`.

| escena | `eff` |
|---|---|
| basal de la DA | 0 |
| medios de la CD | 0,34 |
| sólo el 17 | 0,87 (el mínimo entre 0,88 y 0,97 − 0,1) |
| nada | `null` |

### La dominancia

`oPDA = (dom === 2) ? 'Cx' : 'CD'` y `oPL = (dom === 0) ? 'CD' : 'Cx'`. Medido:

| dominancia | DP | PL | arterias |
|---|---|---|---|
| derecha | CD | CD | 20 |
| codominante | CD | Cx | 19 |
| izquierda | Cx | Cx | 19 |

La derecha agrega una rama distal de la CD; la izquierda le quita su tramo distal.

### El panel

Va en `#lv3d-coro-panel`, dentro de **`#lv3d-col-der`**, que es nuevo y envuelve a
`#lv3d-datos`. ⚠️ **El ancho pasó del hijo al contenedor**: en una columna flex, `flex-basis`
sobre el hijo se aplicaría a su **alto**. Con «Coronarias» prendido la columna pasa de **110 a
150 px** —`#lv3d-dibujo.lv3d-coro-on`—, porque tres botones en 110 px quedan en 33 px de ancho y
el piso táctil de la casa son 44. El recuadro no se agranda: el panel usa alto que la columna ya
tenía, y lo que se angosta 40 px es el lienzo (636 → 596).

Tres filas: la vista desplegable con sus seis opciones y el modo angiografía; la dominancia con
`Der. · Co · Izq.`; y `Transparente · Letras`.

⚠️ **NO ES UN `<select>`, Y NO ES ESTÉTICA**: `limpiarCampos` barre
`document.querySelectorAll('select')` COMPLETO y lo devolvería a su primera opción en cada «Nuevo
estudio» sin avisarle al módulo. Es el mismo motivo por el que los colores son dos botones.

⚠️ **EL BOTÓN «Coronarias» NO LLEVA LA CLASE `.lv3d-vista`**, aunque va en la misma fila: esa
clase es el selector de los tres botones de punta y de su oyente, y TC-490 (F5) cuenta que sean
tres.

### Las letras

Sólo siete: **DA, D, Cx, MO, CD, DP, PL**. Las septales y la marginal aguda no llevan, y eso está
en la definición de cada arteria (`n` ausente) y no en una lista aparte. Se dibujan al final, por
encima de todo, con un halo del color del fondo del recuadro —`pal.fondo`, que PANT-29 agrega a
`lv3dPaleta` leyendo `--bg3`—. La que mira hacia atrás se atenúa, salvo con la pared transparente
o en modo angiografía.

### Las vistas

`LV3D_CORO_VISTAS`, seis entradas con su `a` (oblicua) y su `b` (craneal positivo). Los ángulos
son los de la demo, **aproximados**, y **no se escriben en ninguna pantalla**: la única línea es
«Vista simulada, aproximada.». Están en `docs/PENDIENTES.md` → **P29-b · 1**, pendientes de
verificar con una fuente.

`lv3dCoroMatriz` construye `Rv · Rp`: `Rv` lleva **por filas** la base de la cámara —derecha,
arriba, hacia el observador—, que es la forma que `lv3dProy` espera, y `Rp` es la postura
anatómica de base de la demo, con sus columnas. Con la identidad, `lv3dProy` da x = Lat, y = Ant
y profundidad = Punta, que es «Punta hacia mí».

**La vista se suelta** al girar con el dedo y al elegir una orientación de punta: las dos dicen de
dónde se mira y no pueden estar las dos puestas.

### Qué se reinicia

| puerta | qué reinicia |
|---|---|
| apagar «Coronarias» | la vista, la transparencia, las letras y el modo angiografía. **La dominancia queda** |
| cerrar el 3D (`lv3dCerrar`) | lo mismo, más el botón a apagado |
| «Nuevo estudio» (`lv3dNuevoPaciente`) | todo eso **y la dominancia** |

⚠️ **Apagar no devuelve la ORIENTACIÓN del modelo**: reinicia la *selección* de vista, igual que
pasa con los tres botones de punta. Declarado en **P29-a · 6**.

**Nada de esto se guarda**: ni un campo, ni una columna de Excel (**457**), ni una clave de
`localStorage`, y no toca el informe, el EN SUMA, el PDF, el PPT ni Guardados.

---

## 5 · Cobertura

| caso | qué fija |
|---|---|
| **TC-778** | los dos resúmenes, el molde, el techo, la visibilidad y las dos fichas grandes ausentes |
| **TC-779** | la ficha ampliada, lo que conserva, y el globo `otr-rac` idéntico por el clon y en pantalla |
| **TC-780** | las 24 cifras contra sus filas de control, con control negativo |
| **TC-781** | el relleno, la regla de 220/150/1fr y los tres bloques en orden |
| **TC-782** | las cinco formas del bloque, el texto de hallazgos intacto y que no llega al papel |
| **TC-783** | el botón, el panel, las siete letras, los 44 px y el reinicio |
| **TC-784** | la dominancia, las seis vistas y los dos gestos que sueltan la vista |
| **TC-785** | las arterias pegadas en cuatro fases, el tramo gris y los puntos en su territorio |
| **TC-786** | nada se guarda y el papel es idéntico con «Coronarias» prendido |

**Adaptados**: TC-502, TC-509, TC-761, TC-763, TC-563 y TC-490, los seis con el motivo escrito.
TC-563 (C5b), TC-763 (C3) y TC-490 (F8) quedaron **invertidos**, y en los tres es el día que su
propia excepción anunciaba.

**Sondas**: `scripts/_probe_pant29inv.mjs` (inventario), `_probe_pant29ref.mjs` (Referencias),
`_probe_pant29contr.mjs` (las tarjetas y el bloque), `_probe_pant29coro.mjs` (el botón y el
panel), `_probe_pant29ab.mjs` + `_ab_pant29diff.mjs` (el A/B del papel) y
`_mut_pant29.py` (las mutaciones).
