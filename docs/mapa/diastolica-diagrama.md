<!-- mapa armado sobre la tanda del 2026-10-13; los números de línea NO se guardan a propósito -->
# Mapa — el DIAGRAMA DE FLUJO de la BSE 2024 en la ventana 🧭

Se abre a demanda. **No guarda números de línea**: la línea cambia en cada edición, el nombre de
la función no. Todo lo de acá vive en el bloque grande de `<script>` de `index.html`, salvo el CSS,
que está en el `<style>` de la cabecera.

Nació aparte por la regla de la casa: `diastolica.md` pesaba 33,7 KB y el techo son ~35 KB.

**Es SOLO PANTALLA.** No calcula nada, no escribe ningún campo y no toca el informe narrativo, el
EN SUMA, el PDF, el PPT, el Excel (435 columnas) ni el Laboratorio. Lo único que hace es MOSTRAR
lo que las funciones dueñas de la BSE ya calculan.

**La ASE 2025 y la ASE/EACVI 2016 no tienen diagrama** (tendrán el suyo en otra tanda): su ventana
es la de HEAD, sin una línea nueva.

---

## Las piezas, y quién manda

| Pieza | Qué hace |
|---|---|
| `R.camino` / `R.nodoFinal` | la lista de nodos que recorrió ESTE paciente. La devuelven `diastBSE2024Evaluar` (Figuras 17 y 18) y `diastFAEvaluarBSE2024` (Figura 19) |
| `f.nodo` en cada fila de `R.filas` | el id del nodo que muestra esa fila. Lo consumen el dibujo y la tabla compacta |
| `BSE_NODO_FIN` / `BSE_NODO_FIN19` | mapa **clave de categoría → nodo final** |
| `BSE_PLANO_F17` · `BSE_PLANO_F18` · `BSE_PLANO_F19` | los tres planos: nodos, aristas y columnas de la tabla |
| `_bseDiagSVG(plano, R)` | el motor: calcula alturas, acomoda filas, rutea aristas y emite el SVG |
| `_bseDiagAlt(plano, R)` | el camino **en palabras** |
| `_bseTablaHTML(plano, R)` | la tabla compacta plegada |
| `_bseDiagCaja(plano, R)` | arma el bloque entero: SVG + descripción accesible + tabla + pie |
| `_bseDiagPlano(algo, ritmo, R)` | qué plano le toca a este paciente, o `null` |
| `_bseDiagAncho(hay)` | pone y saca la clase `bse-ancho` del overlay |
| `_bseTablaLeerEstado()` | guarda si el plegable estaba abierto, **antes** de reemplazar el `innerHTML` |

**El nodo final NO se empuja en ninguna rama: se DERIVA de `R.clave`**, que es la categoría que
firman el cuadro gris, el informe y el EN SUMA. Empujarlo a mano en cada salida sería una segunda
copia del veredicto, y la copia que se olvida es la que pinta el camino rojo terminando en una
casilla que el badge no dice.

**Las aristas pintadas son los pares CONSECUTIVOS del camino.** El camino es un recorrido por el
grafo, así que «de A a B» está en rojo si y sólo si B viene inmediatamente después de A.

---

## El plano de una figura

```
{ fig, aria, pie,
  nodos:   [{ id, col|px, span|pw, fila, tit:[líneas], vals(R), corto, app }],
  aristas: [{ de, a, et, dx1, dx2, calleRel, calleAntes }],
  tabla:   [{ paso, tit, nodos:[], puerta, res }] }
```

- `col` y `span` usan la rejilla de cuatro columnas (`BSE_DG.C`, ancho 164); `px`/`pw` la saltean
  —los usa **sólo la Figura 19**, que necesita carriles por fuera de la banda del paso 2—.
- `vals(R)` devuelve los renglones de valores. Por defecto salen de las filas con ese `nodo`;
  `_bdTabla2` y `_bdFeviGls` y `_bdFc` son los tres que se arman aparte.
- `app: true` marca una caja que **no está en la figura** (borde punteado): la indeterminada —que
  sale de la prosa— y los dos estados propios de la app.
- `calleRel` corre la horizontal de una arista unos píxeles bajo su origen; `calleAntes` la pone
  12 px por encima de la caja que se nombra, que es lo que necesita una flecha que salta filas.

---

## El umbral de ancho: 780 px, y sale de una medición

- El SVG se dibuja sobre un **viewBox de 700 px** con texto de **11,5 px** y lleva
  `max-width:700px`, así que **por encima del umbral no se escala**: el texto renderiza a 11,5 px
  exactos. Medido en los dos temas a 1200 y a 900 px.
- La tarjeta pasa a **760 px** y el cuerpo a **732**, que es > 700.
- Por debajo de **721 px de viewport** el ancho útil (`min(760, vw−24) − 28`) cae de 669 px y el
  texto bajaría de los 11 px que esta tanda se fijó como piso. El umbral queda en 780 px: 59 px de
  margen, y es donde la tarjeta ya alcanza sus 760.
- Por debajo del umbral **no se dibuja nada**: `.bse-diag-caja` nace en `display:none` y la lista
  larga se ve, o sea la ventana de HEAD.

⚠️ **EL `!important` DE LA MEDIA QUERY NO ES DECORATIVO.** `#diast-algo-card` lleva `width:560px`
en un `style` **en línea**, que le gana a cualquier selector de hoja por mucha especificidad que
tenga. Sin él la tarjeta se quedaba en 560, el SVG se escalaba a 530 y su texto caía a 8,7 px.

⚠️ **LA TARJETA SE ENSANCHA SÓLO PARA LA BSE**, por la clase `bse-ancho`. Sin ese alcance cambiaría
también el ancho de la ventana de las otras dos guías, que esta tanda deja idénticas a HEAD.

---

## La tabla compacta

- `<details>` cerrado por defecto, **una columna por paso**, y por encima del umbral **reemplaza**
  a la lista larga: el CSS esconde `.bse-lista` y muestra la caja del diagrama. El reemplazo lo
  hace el CSS y no el JS, así un cambio de ancho no necesita repintar.
- El envoltorio `.bse-lista` **sólo existe cuando hay diagrama**: la lista de la ASE 2025 y la de
  la ASE/EACVI 2016 se ve a cualquier ancho.
- ⚠️ **UNA COLUMNA DE PASO QUE EL PACIENTE NO RECORRIÓ NO SE DIBUJA.** La columna del strain con
  sus criterios en gris se lee como «se evaluaron y dieron negativo», cuando lo que pasó es que el
  algoritmo nunca llegó a preguntarlos. La compuerta es el **camino**.
- Teclado y lector de pantalla salen de serie por ser `<details>`/`<summary>` nativos. **No lleva
  un `aria-expanded` propio a propósito**: habría que sincronizarlo a mano y un atributo que se
  desincroniza miente con más convicción que no tenerlo.

---

## Trampas de esta zona

- ⚠️ **`ontoggle` NO SIRVE PARA CONSERVAR EL ESTADO DEL PLEGABLE.** El evento `toggle` de un
  `<details>` se despacha de forma **asíncrona**: cuando el repintado corre en la misma vuelta que
  el clic, el estado guardado sigue siendo el anterior y la tabla se cierra sola. Lo cazó TC-460,
  no la lectura. Se lee del árbol vivo con `_bseTablaLeerEstado()`, que es sincrónico.
- ⚠️ **EL TEXTO DE UN SVG NO SE ENVUELVE SOLO.** Un `<text>` más ancho que su caja se dibuja igual
  y pisa la de al lado; no hay `overflow` que lo recorte. Lo envuelve `_bdEnvolver` contra un
  presupuesto de caracteres sacado del ancho, y **la altura se calcula DESPUÉS de envolver**: con
  la altura sacada del número de valores, un renglón partido en dos se salía de su caja.
- ⚠️ **LAS CAJAS SE DIBUJAN DESPUÉS DE LAS LÍNEAS**, así que un rótulo de arista que caiga sobre
  una caja queda **tapado**: no desaparece de una forma que se note, simplemente no se lee y el
  dibujo parece tener flechas sin nombre. Por eso el rótulo va **debajo** de su calle y el hueco
  entre filas es de 34 px.
- ⚠️ **EL TAMAÑO RENDERIZADO DEL TEXTO NO ES EL `fontSize` COMPUTADO.** Dentro de un SVG con
  viewBox, el navegador informa los 11,5 px declarados aunque el dibujo esté escalado a la mitad:
  el computado no conoce la escala. El número que importa es `11,5 × (ancho dibujado / ancho del
  viewBox)`.
- ⚠️ **UN RECORTE DE CAPTURA MÁS ALTO QUE LA VENTANA SALE EN NEGRO.** La tarjeta scrollea y
  `Page.captureScreenshot` con un `clip` que se va por debajo del viewport no dibuja lo que no está
  renderizado: la primera captura de la tabla salió con la mitad inferior negra y parecía que la
  tabla no se dibujaba. Hay que llevar el blanco a la vista con un scroll real y volver a medir.
- ⚠️ **LEER EL DIAGRAMA DESPUÉS DE CERRAR LA VENTANA DA UN DENOMINADOR ROTO.** `getClientRects()`
  devuelve cero sobre un árbol en `display:none`, así que el conteo de filas visibles da 0 y se lee
  como «no hay diagrama» sobre un dibujo perfecto.
- ⚠️ **EL CUERPO DE UN CASO NO PUEDE CAMBIAR EL ANCHO DE LA VENTANA.** Corre dentro de la página y
  un media query no se puede fingir. TC-460 fija la **regla** que produce el comportamiento; el
  comportamiento renderizado a 360 px lo mide `scripts/_probe_bsediag.mjs`, que sí tiene el canal.

---

## Cómo medir esta zona

```bash
node scripts/_probe_bsediag.mjs --solo camino        # el camino del dueño, 46 escenas
node scripts/_probe_bsediag.mjs --solo diagrama      # el SVG: nodos, camino y rótulo final
node scripts/_probe_bsediag.mjs --solo angosto       # A/B a 360 px contra HEAD
node scripts/_probe_bsediag.mjs --solo ancho         # 1200/900/600/560/390/360 en los dos temas
node scripts/_probe_bsediag.mjs --solo tabla         # el plegable con teclas reales
node scripts/_probe_bsediag.mjs --solo superficies   # informe, EN SUMA, Excel, PPT, Laboratorio
node scripts/_probe_bsediag.mjs --solo otras         # control negativo: ASE 2025 y ASE 2016
node scripts/_probe_bsediag.mjs --solo captura --out /tmp --abrir-tabla --zona tabla
node scripts/test_clinico.mjs --solo TC-460
```

**Los grupos se corren de a uno.** Varios en una sola sesión de página se cuelgan.

Cobertura: **TC-460**, 40 condiciones con tres denominadores y cinco controles negativos.
Verificado que sabe fallar contra HEAD en un worktree aparte: **35 de las 40 en rojo**; las cinco
que pasan son los cuatro controles de las otras dos guías y el que comprueba que el **cuadro gris
sigue publicando el mismo veredicto**, que es justamente lo que esta tanda no mueve.

---
---

# Los diagramas de la ASE — Figura 3, Figura 8, 8A y 8B (tanda del 2026-10-13)

Lo de arriba describe la BSE 2024 y **sigue vigente sin un cambio**. Esta mitad agrega las
**cuatro vías de la ASE**, que reusan el MISMO motor, el MISMO CSS, la MISMA tabla compacta y el
MISMO umbral de ancho.

**Cinco guías-vía con diagrama:** BSE 2024 sinusal (F17/F18), BSE 2024 en FA (F19), ASE 2025
sinusal (Figura 3), ASE 2025 en FA (Figura 8) y ASE/EACVI 2016 sinusal (8A u 8B según la FEVI).
**La sexta no lo tiene y no lo va a tener:** la **ASE/EACVI 2016 en fibrilación auricular** no
tiene algoritmo en la app —la guía enumera parámetros en el folio 295 y no los combina en
ninguna regla de conteo—, así que no hay veredicto que dibujar.

---

## ⚠️ EL PREFIJO `bse-` ES HISTÓRICO, NO DE ALCANCE

Las clases (`bse-diag`, `bse-diag-caja`, `bse-lista`, `bse-ancho`, `bse-tabla`…), los atributos
(`data-bse-diag`, `data-bse-tabla`…) y las funciones (`_bseDiagSVG`, `_bseDiagCaja`,
`_bseDiagPlano`, `_bseTablaHTML`…) nacieron con la BSE y hoy las comparten **las cinco
guías-vía**. Renombrarlas obligaría a adaptar TC-460 y `scripts/_probe_bsediag.mjs` enteros sin
cambiar una sola línea de comportamiento, así que se reusan tal cual.

---

## Las piezas nuevas

| Pieza | Qué hace |
|---|---|
| `ASE25_NODO_FIN` · `ASE25FA_NODO_FIN` · `ASE16A_NODO_FIN` · `ASE16B_NODO_FIN` | **cuatro** mapas clave de categoría → nodo final |
| `A25_PLANO_F3` | Figura 3 (ritmo sinusal), 19 nodos, prefijo `a25.` |
| `A25FA_PLANO_F8` | Figura 8 (fibrilación auricular), 13 nodos, prefijo `a25fa.` |
| `A16A_PLANO` · `A16B_PLANO` | Figuras 8A y 8B, 10 y 14 nodos, prefijos `a16a.` / `a16b.` |
| `A25_C` · `_a25(c, n)` | la rejilla de **cinco** columnas de 132 px que usan los cuatro planos |
| `_a16Flujo(R)` | los valores de la caja del flujo mitral de la 8B |
| `plano.gap` | el hueco entre filas, **por plano** (50 px en la Figura 3, 40 en las otras tres) |

**El nodo final se DERIVA de `R.clave`**, igual que en la BSE. Ninguna rama lo empuja.

⚠️ **CUATRO MAPAS Y NO UNO, PORQUE LAS CLAVES SE REPITEN.** `insuf`, `indet`, `normal` y `g3`
existen en la 8A **y** en la 8B y nombran casillas distintas; `normal` se repite además entre el
ritmo sinusal y la FA de la ASE 2025. Por eso cada vía tiene su mapa y sus ids llevan prefijo.

⚠️ **DOS PARES DE CLAVES COMPARTEN CASILLA, Y ES A PROPÓSITO.** `incompleto` e `insuf` van las dos
a `a25.fin-sindatos`, y `g1prol` y `g1alt` las dos a `a16b.fin-g1`: son categorías con frases
distintas en el informe pero **una sola casilla** de la figura. El motivo exacto lo dice el
renglón de resultado de la ventana, que es donde se explica.

---

## El hueco entre filas pasó a ser por plano

`plano.gap || BSE_DG.GAP`. **Lo fija el rótulo de la arista más baja, no el aire que se ve bien.**
De `a25.elevada` salen **cuatro** aristas con rótulo y, con los 34 px de la BSE, la cuarta calle
cae DENTRO de la fila de abajo: el rótulo no desaparece de una forma que se note, lo tapa la caja
—que se dibuja después— y el dibujo parece tener flechas sin nombre. La BSE **no cambia**.

---

## ⚠️ CADA COLUMNA ES UNA CADENA COMPLETA, y no es decoración

Una **vertical larga necesita su columna libre en TODAS las filas que cruza**. En la Figura 8 la
cadena del «ninguno o uno positivo» baja por la columna 0 hasta la presión normal y la de «tres o
más» por la 4 hasta la elevada, así que las cajas del paso 2 viven en las del medio. Con las
cadenas mezcladas, una de esas dos líneas cruzaría una caja por la que el paciente **no pasó** —y
el dibujo diría lo contrario de lo que el camino dice. Lo mismo gobierna los dos atajos del flujo
mitral de la 8B, que bajan por las columnas 0 y 4.

---

## Las columnas de la tabla compacta

| Vía | Columnas |
|---|---|
| ASE 2025 sinusal | paso 1 · segundo paso · suplementarios · resultado |
| ASE 2025 en FA | paso 1 · paso 2 · resultado |
| ASE 2016 · 8A | las cuatro variables · resultado |
| ASE 2016 · 8B | flujo mitral · tres criterios · resultado |

**La compuerta es el CAMINO**, igual que en la BSE: una columna de paso que el paciente no
recorrió no se dibuja. Las filas **sin `nodo`** —las dos de «no son insumos de la 8A» y la del e′
en la 8B— no entran en ninguna columna, que es lo correcto: no pertenecen a esos algoritmos.

---

## Trampas nuevas de esta zona

- ⚠️ **LA SUPERPOSICIÓN DE RÓTULOS SE MIDE, NO SE MIRA EN EL PNG.** Dos rótulos a la misma altura
  con sus cajas de texto solapadas se imprimen uno encima del otro, y un rótulo que cae dentro de
  una caja queda **tapado**; ninguna de las dos cosas desaparece de forma que se note. El grupo
  `geo` de `scripts/_probe_asediag.mjs` compara la posición de cada rótulo contra la de cada caja
  y contra la de los otros rótulos. **Destapó tres defectos reales** que el ojo había dejado pasar.
- ⚠️ **`calleAntes` CHOCA SIEMPRE CON EL RÓTULO DE RESULTADO si la arista termina en un nodo
  FINAL.** Pone la horizontal 12 px encima de la caja destino y su rótulo 9 px debajo de la calle,
  o sea 3 px por encima de esa caja — que es exactamente donde el motor imprime «Resultado de este
  paciente». En esas aristas va `calleRel`, relativa al origen.
- ⚠️ **UN TECLEO QUE NO OCURRIÓ NO ES UNA MEDICIÓN.** El aviso legal (`#modalAvisoEco`,
  z-index 9999) **vuelve a mitad de corrida**: con él puesto, `clicEn` cae a su respaldo por tecla,
  un `input` numérico no recibe nada y la escena informa el veredicto de **otro paciente**. La
  sonda despeja antes de cada escena (`__P.despejar()`, con su denominador) y **aborta**
  (`exigirCarga`) nombrando el campo si un tecleo no quedó.
- ⚠️ **UN CASO QUE MUERE POR EXCEPCIÓN NO PRUEBA NADA.** Contra un árbol sin estos diagramas,
  `dia.enCam` no existe y un `.slice()` mata la corrida entera con un `TypeError`: se ve que el
  árbol es distinto, no qué condición caza qué defecto. Todas las lecturas del dibujo en TC-462
  van con su respaldo `|| []`.
- ⚠️ **LAS TRES FILAS DEL FLUJO MITRAL NO SERVÍAN COMO VALORES DE LA CAJA.** Las dos de los atajos
  llevan el MISMO `val` —la relación E/A—, así que la caja imprimía dos renglones idénticos, y la
  tercera no tiene operador en su rótulo, así que `_bdFilaTxt` la devolvía **sin número**. Lo arma
  `_a16Flujo`.
- ⚠️ **`scrollIntoView` DEJA LA PRIMERA CAJA DEBAJO DEL ENCABEZADO FIJO** de la tarjeta y el
  recorte sale sin ella: parece que el diagrama empieza en el paso 1. Se lleva el **cuerpo** a su
  tope (`#diast-algo-cuerpo.scrollTop = 0`).

---

## Cómo medir esta zona

```bash
node scripts/_probe_asediag.mjs --solo camino        # el camino del dueño, 69 escenas
node scripts/_probe_asediag.mjs --solo diagrama      # el SVG: nodos, camino y rótulo final
node scripts/_probe_asediag.mjs --solo geo           # choques y rótulos tapados, medidos
node scripts/_probe_asediag.mjs --solo angosto       # A/B a 360 px contra HEAD
node scripts/_probe_asediag.mjs --solo ancho         # 1200/900/790/770/390/360 en los dos temas
node scripts/_probe_asediag.mjs --solo tabla         # el plegable con teclas reales
node scripts/_probe_asediag.mjs --solo superficies   # informe, EN SUMA, Excel, PPT, Laboratorio
node scripts/_probe_asediag.mjs --solo excelab       # la fila del Excel clave por clave
node scripts/_probe_asediag.mjs --solo otras         # control negativo: BSE 2024 y FA de la 2016
node scripts/_probe_asediag.mjs --solo captura --escenas S04-g2 --out /tmp
node scripts/test_clinico.mjs --solo TC-462
```

**Los grupos se corren de a uno.** Varios en una sola sesión de página se cuelgan.

Cobertura: **TC-462**, 42 condiciones con cuatro denominadores y nueve controles negativos, que
recorre las **28 ramas** de las cuatro vías. Verificado que sabe fallar contra HEAD en un worktree
aparte: **26 de las 42 en rojo**; las 16 que pasan son los denominadores de las funciones dueñas,
el badge del cuadro —que esta tanda no mueve—, las tres reglas de CSS que ya existían para la BSE
y los controles negativos de la BSE 2024 y de la FA de la ASE/EACVI 2016.
