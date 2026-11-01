# POP-B — el dibujo del posoperatorio, las válvulas operadas y el botón que dice por qué

Mapa de la tanda **POP-B** (2026-11-01), sobre el cierre de POP-A (`f8ea371`). Siete commits de
código. Por nombre de función y de constante, **sin números de línea**: la línea cambia en cada
edición, el nombre no.

Lo de POP-A vive en `pa-pantalla-posoperatorio.md`; lo de POP-V2 en `pop-v2-posoperatorio.md`; el
módulo original, en `g-posoperatorio.md`.

---

## 1 · «Integrar al informe» del posoperatorio: la compuerta y el botón mudo

**La compuerta no es nueva y no la puso POP-A.** El botón `#pop_integrar` nace con el atributo
`disabled` en el marcado y lo suelta `popConclSync` **sólo** si `popPatron().suficiente`, que es
`!!icB || tapo`: sin índice cardíaco calculable y sin taponamiento no hay patrón que integrar.
Además, el registro de `amiloSecs` le cuelga a la clave `pop` un `hayDatos` que pregunta lo mismo,
así que el camino por `amiloIntegrar` también lo frena.

**Tres de las cuatro fuentes de índice dividen por `getBSA()`** —el GC del Swan, el GC del PiCCO y
el GC por ecocardiografía—, así que **sin peso y talla no hay índice**. La única que no la necesita
es el índice directo del PiCCO (`pop_picco_ic`).

| medido en los OCHO árboles (47ff639 y los siete de POP-A) | con peso y talla | sin peso ni talla |
|---|---|---|
| `popPatron().suficiente` | `true` | `false` |
| `#pop_integrar` | habilitado | deshabilitado |
| click real de Playwright | integra | no integra |

O sea: **no hay ninguna regresión de POP-A**, y el bisect está en el mensaje de `POP-B-1`.
Lo que sí era un defecto —y es lo que ese commit arregla— es que **el botón quedaba mudo**:
`popConclSync` le escribe un `title` con el motivo y `_amiloAvisoPintar(k, false)` hacía
`removeAttribute('title')` **a secas** 220 ms después, en el barrido de bloques integrados. Hoy
sólo borra el title que él mismo escribió, comparándolo contra `_AM_AVISO_TXT`.

⚠️ **Antes de volver a tocar esa línea:** el botón del posoperatorio es el **único** de los
diecinueve `.btn-integrar[data-am-k]` con dueño propio del `title`. Para los otros dieciocho la
comparación no cambia nada.

**Lo que queda abierto:** levantar la compuerta de la superficie corporal es contenido clínico y
está en `docs/PENDIENTES.md` → **POPB-a**.

---

## 2 · El tipo de una válvula operada: sólo las prótesis

Tres piezas y un dueño único:

| pieza | qué hace |
|---|---|
| `_popVEsProt(o)` | le pregunta a un `<option>` del dueño si su valor empieza con «Prótesis» |
| `popVEstado(id)` | el dueño único del estado: `{prot, val, nativa}` |
| `popCxVOpciones` | clona del dueño **sólo** las opciones que pasan el predicado |
| `popCxVSync` | espeja sólo prótesis; con una nativa deja «— elegir tipo —» y escribe el aviso |
| `popCxValvTxt` | el papel: dice el tipo **sólo** si es una prótesis |

**Las opciones que cada dueño tiene hoy** (medidas, no transcritas de memoria):

| dueño | prótesis que ofrece | lo que el filtro deja afuera |
|---|---|---|
| `va_morf` | Prótesis biológica (SAVR), Prótesis mecánica (SAVR) | Trivalva normal, Bicúspide, Calcificada, Reumática, **TAVI**, Endocarditis, Carcinoide |
| `vm_morf` | Prótesis biológica, Prótesis mecánica | Normal, Mixomatosa / Barlow, Calcificada, Reumática, Prolapso / EVMS, Endocarditis, Isquémica |
| `vt_morf` | Prótesis biológica, Prótesis mecánica | Normal, Mixomatosa, Reumática, Carcinoide, Endocarditis, Funcional / dilatación VD |
| `vp_morf` | Prótesis biológica, Prótesis mecánica | Normal, Displásica (congénita), Reumática, Carcinoide, No especificada |

⚠️ **TAVI queda afuera por orden expresa, no por el predicado:** su `<option>` no lleva `value`,
así que su valor es «TAVI» y no empieza con «Prótesis». Plastia y TEER **no existen** en ningún
dueño. Las tres son otra tanda → **POPB-c**.

⚠️ **El filtro no es una lista transcripta**, y eso es deliberado: el día que Válvulas agregue otra
prótesis aparece sola. Si alguna vez se agrega una prótesis cuyo rótulo **no** empiece con esa
palabra, el predicado la deja afuera sin avisar — es el precio de no mantener dos listas.

---

## 3 · El conteo de fármacos

`popSync` escribe `#pop_farmacos_cnt` contando
`#pop_farm_rows .pop-droga.pop-droga-on`, o sea **las filas visibles**. No es una segunda regla:
`.pop-droga-on` la pone el bucle de drogas de esa misma pasada y es la clase con la que el CSS
muestra la fila.

**Antes contaba las once casillas MÁS la asistencia circulatoria**, y con la asistencia en su
propia tarjeta desde POP-A-1 eso dejó de coincidir con nada que se vea: con noradrenalina,
dopamina y balón 1:2 decía «3 marcados» con dos filas. **Era preexistente de POP-V2-1**, medido
igual en `47ff639`.

---

## 4 · La disposición: qué tarjeta está en qué columna

```
.pop-cols  (tres columnas independientes desde 900 px, cada una un .pop-col flex)
   col 1   pop-ctx   «Contexto quirúrgico»      +  pop-mon   «Monitoreo»
   col 2   pop-farm  «Fármacos vasoactivos»     +  pop-hemo  «Datos hemodinámicos»
   col 3   pop-asist «Asistencia circulatoria»  +  pop-pocus «Eco y POCUS»
.pop-card-wide        pop-pleupul «Pleura y pulmón»   (ancho completo, DOS columnas desde 900 px)
.pop-abajo            pop-esq «Esquema»  +  [pop-carac «Características» + pop-concl «Conclusión»]
```

Dentro de `pop-pocus`, `.pop-eco-par` pone la **ecocardiografía** y el **ventrículo derecho** uno
al lado del otro desde 900 px, y el **pericardio** queda debajo a ancho de tarjeta.

**El alto de cada columna, antes y después** (px, medido con `_probe_popb_c4.mjs`):

| caso | antes 1440 | después 1440 | antes 1000 | después 1000 |
|---|---|---|---|---|
| sin monitoreo | 356 / 499 / **1228** | 356 / 499 / **647** | 431 / 564 / **1300** | 431 / 564 / **799** |
| con Swan | 688 / 440 / 1228 | 688 / 440 / 647 | 881 / 508 / 1300 | 881 / 508 / 799 |
| con PiCCO | 570 / 499 / 1228 | 570 / 499 / 647 | 650 / 564 / 1300 | 650 / 564 / 799 |
| 0 fármacos | 688 / 440 / 1228 | 688 / 440 / 647 | 881 / 508 / 1300 | 881 / 508 / 799 |
| 2 fármacos | 688 / 702 / 1228 | 688 / 702 / 647 | 881 / 820 / 1300 | 881 / 820 / 799 |
| 5 fármacos | 688 / 1107 / 1228 | 688 / 1107 / 647 | 881 / 1300 / 1300 | 881 / 1300 / 799 |

`pop-pocus` pasa de **1115 a 534 px**. ⚠️ **Quedan huecos de más de 120 px en algunos casos y NO
se inventó otra disposición**, que es lo que la orden manda: lo que desequilibra es el alto
variable del panel de fármacos, cuyas filas crecen una por droga → **POPB-b**.

---

## 5 · El dibujo: qué hay y quién lo pinta

| función | qué hace |
|---|---|
| `popEsquema()` | el **seam**: devuelve datos, nunca nodos |
| `popEsqMontar()` | monta el SVG **una vez** (`_popEsq.montado`) |
| `_popEsqGeo(d)` | la geometría ilustrativa derivada de los datos |
| `_popEsqEstatico(d, g)` | lo que **no** se mueve con el latido |
| `popEsqFrame(ahora)` | el bucle: cavidades, aorta, curva, balón, hélice y **las válvulas** |
| `popEsqTexto(d)` | el equivalente en TEXTO, en `#pop-esq-txt`, y el `aria-label` del SVG |

**El lienzo es `viewBox="0 0 600 496"` y no se movió.**

### 5a · Los textos

Medido en el árbol de POP-A con `getBBox` cruzando todos los pares, en la escena completa a
1440 px — **tres superposiciones**:

| uno | otro | solape |
|---|---|---|
| «derrame pleural D moderado · I severo» | «AP 100/50» | 61 × 12 px |
| «Presión arterial» | «aumento diastólico (timing verificado)» | 35 × 17 px |
| «aumento diastólico (timing verificado)» | «PAM 78 mmHg · medida (Swan-Ganz)» | 25 × 17 px |

Lo que se hizo: **el rótulo del derrame pleural salió del dibujo** (su grado se lee en la fila
«Pulmones y pleura» de las características y ahora lo dice la ALTURA del líquido); la fila de la
curva pasó a **12 px** con el timing corrido al centro del recuadro (x 300) y la PAM publicando
**sólo su valor**; y los rótulos del esquema bajaron a un tamaño chico y legible —las cavidades de
17 a 14, los de 16 a 14 y los de 15, 14 y 13 a 12—.

⚠️ **Y un desborde que nadie había visto:** la franja de vasoactivos está centrada en x 330 y con
los diez fármacos del patrón pasaba de 900 unidades en un dibujo de 600. Por encima de **92
caracteres** publica el conteo y el detalle se lee en «Soporte y vasoactivos».

**Después: cero superposiciones y cero textos fuera del lienzo en las 30 escenas del arnés.**

### 5b · El derrame pleural

Era una elipse de 44 × 22 px, **la misma** para leve, moderado y severo. Hoy es un **nivel de
líquido** recortado con la MISMA ruta que dibuja el pulmón —`POP_ESQ_LUNG_D` / `POP_ESQ_LUNG_I`
dentro de un `clipPath`—, con `--accent2`, el color de líquido que este dibujo ya usa, y **sin
texto encima**.

| grado | alto (`POP_ESQ_PLEURA_H`) | borde superior |
|---|---|---|
| leve | 22 | y 246 |
| moderado | 44 | y 224 |
| severo | 72 | y 196 |
| ausente / sin cargar | — | no se dibuja |

La base es `POP_ESQ_PLEURA_BASE = 268` y no se mueve: es un nivel, no una burbuja.
⚠️ **Los dos nodos conservan su marca `pleuraD` / `pleuraI`**: dos condiciones de la suite
preguntan por su `display`, y la pregunta sigue siendo la misma aunque la forma cambie.

⚠️ **EL ANILLO DEL DERRAME PERICÁRDICO NO SIGUE AL TAMAÑO, y la premisa del pedido decía que sí.**
Medido: `o.eff` vale **8** con derrame leve, moderado **y** severo, y **14** sólo con compromiso
hemodinámico. Lo que distingue es el COMPROMISO. No se tocó —la orden dice «conserva su anillo
actual»— → **POPB-d**.

### 5c · Las tres capas de cirugía y drenajes (commit 6)

| capa | dato que la enciende | geometría |
|---|---|---|
| `puente` | `popCxEstado().tokens` incluye `cabg` | `M490 238 C470 300 410 300 375 221`, `var(--accent)` |
| `malla` | …incluye `aorta` | el tramo ascendente y el arco, con `stroke: url(#pop-esq-malla)` |
| `drenD` / `drenI` / `drenM` | `pop_dren_pd` / `_pi` / `_med` | tubos finos `var(--text2)` |

⚠️ **Las dos cirugías se leen de `popCxEstado()`, no de la casilla**, porque ése es el dueño único
que también publica el papel. **Eso incluye al estudio viejo**: con `pop_cx_tipo` en `cabg` y
ninguna casilla marcada el puente se dibuja, con la misma firma que con la casilla. Con
`combinada` no se dibuja ninguna de las dos: ese valor no dice cuáles fueron.

⚠️ `patternUnits="userSpaceOnUse"` en la malla: con el valor por omisión la celda se escala con la
caja del trazo y la malla queda más densa en el arco que en el tramo recto.

⚠️ **Ninguna de las tres lleva rótulo en el dibujo**, a propósito. Las tres se nombran en la fila
«Cirugía y drenajes» de «Características del esquema».

### 5d · Las cuatro válvulas operadas (commit 7)

`POP_ESQ_VALV` declara dónde va cada una y cómo está orientada:

| clave | x | y | rot | dónde |
|---|---|---|---|---|
| `ao` | 470 | 257 | 90 | sobre el tubo aórtico, a la salida del VI |
| `pu` | 268 | 257 | 90 | sobre la arteria pulmonar, a la salida del VD |
| `mi` | 408 | 217 | 0 | plano auriculoventricular, entre VI y AI |
| `tr` | 335 | 217 | 0 | plano auriculoventricular, entre VD y AD |

⚠️ **El x de la aórtica y de la pulmonar se eligió midiendo:** el borde derecho del recuadro del VI
llega como máximo a x 460 y su rótulo «VI» vive en su centro, así que un símbolo en el origen del
tubo (x 410) se montaba encima del rótulo. Lo mismo con «AP 100/50», que termina en x 252.

**Tres aspectos, y el tipo sale del dato:**

| tipo | anillo | velos | soportes |
|---|---|---|---|
| prótesis mecánica | `--text` al 38 %, sin puntear | dos, gruesos (2,6) | no |
| prótesis biológica | `--bg3`, sin puntear | dos, finos (1,8) | tres |
| **sin tipo elegido** | `none` con `stroke-dasharray:'3 3'` | **ninguno** | no |

Una morfología **nativa** en Válvulas cuenta como «sin tipo»: da la misma firma.

**El latido** va con la frecuencia **cargada** —`pop_sw_fc` con Swan, si no `hemo_fc`—, un ciclo
por `60000 / fc` ms, con la banda de lo medible `POP_ESQ_FC_MIN`..`POP_ESQ_FC_MAX` (20 a 240). La
aórtica y la pulmonar abren en **sístole** y la mitral y la tricúspide en **diástole**, con el
mismo corte de 0,35 del resto del dibujo. Lo que se mueve es el **hueco** entre los dos velos: 0
cerrada, 9 del todo abierta. **Sin frecuencia, cerradas y quietas.**

⚠️ **ESO LAS DESACOMPASA DE LAS CAVIDADES, y está declarado:** las cuatro cajas respiran con
`POP_ESQ_PER_MS`, que es la velocidad a la que el esquema se ve bien y que su propio comentario
dice que NO es la frecuencia del paciente → **POPB-f**.

---

## 6 · Lo que el dibujo NO hace todavía

**No entra al PDF.** `PDF_DIAG_REG` tiene siete entradas y ninguna es `pop`. Está en la lista de
POP-C, junto con los catéteres entrecortados, el tamaño de las cavidades por su clasificación, la
contracción por TAPSE y FEVI, el septum en D, los chorros de insuficiencia y los trazados finos.

---

## 7 · Trampas de instrumentación que esta tanda pagó

- **`getBBox()` sobre un `<g>` devuelve coordenadas LOCALES**, o sea antes de su `transform`: las
  cuatro válvulas daban la MISMA caja `[-11,-5,22,10]` y el cruce entre ellas reportaba seis
  superposiciones que no existen. La caja que sirve es `getBoundingClientRect()`.
- **El bucle se apaga cuando el dibujo no se ve** —lo apaga su `IntersectionObserver`— y en una
  ventana de 1000 px de alto el esquema cae en y 2000. Sin `scrollIntoView` el hueco de los velos
  se lee **siempre en 0**, que es el cuadro único de la fase 0 y se parece a «no late».
- **Un click programático no hace hit-testing**: para saber si el botón responde de verdad hay que
  usar el click real de Playwright, o `elementFromPoint` sobre sus cinco puntos.
- **`editarInforme(id)` no carga nada hasta que se clickea `#edit-ok`**, y `guardarInforme` no
  llama a su callback si `valvSevConfirmada` es falso: el round-trip de un estudio se mide con las
  dos cosas puestas, y sin ellas parece que no se restaura.
- **Un acento grave dentro de un comentario de una sonda** cierra el template literal. Lo caza
  `node --check`, no `check_backticks.py`.

---

## 8 · Sondas y arneses de esta tanda

| archivo | para qué |
|---|---|
| `scripts/_probe_popb_inv.mjs`, `_inv2.mjs`, `_var.mjs`, `_clic.mjs`, `_round.mjs`, `_bisect.mjs` | el inventario 1a: el fallo de integración, las diez variantes, el click real, el round-trip y el bisect de los siete commits de POP-A |
| `scripts/_probe_popb_c2.mjs` | el tipo de las válvulas operadas |
| `scripts/_probe_popb_c3.mjs` | el conteo de fármacos contra las filas, en nueve escenas |
| `scripts/_probe_popb_c4.mjs` | el alto de cada columna en los seis casos |
| `scripts/_probe_popb_esq.mjs` | el dibujo: censo, superposiciones, firma, capas, válvulas y latido |
| `scripts/_probe_popbab.mjs` + `scripts/_ab_popbdiff.mjs` | el A/B de superficies, con las escenas nuevas de POP-B |
| `scripts/_mut_popb.py` | el barrido de mutaciones dirigidas |

---

## La tanda POP-C (2026-11-02) — lo que agregó al dibujo

Cinco capas nuevas y dos cosas que esta tanda había dejado declaradas. El mapa entero está en
**`docs/mapa/popc-posoperatorio-marfan.md` § 5**:

- **los símbolos de válvula se reemplazaron** por los de la demo v9: círculo r=10, velos que
  **rotan** sobre su bisagra con la excursión de 72 grados, y la biológica con sus dos curvas y
  sus dos pivotes. Los tres soportes rectos de POP-B-7a se retiraron: la demo no los tiene;
- **los chorros de insuficiencia**, con `plume` de la demo, sincronizados con la fase **contraria**
  a la apertura de su propia válvula;
- **los catéteres del Swan y del PiCCO**, con el globo que se infla;
- **las cavidades siguen al dato medido** cuando lo hay —la clasificación de las aurículas, la
  FEVI, el TAPSE y el tabique en D— y quedan como estaban cuando no;
- **los trazados de TAPSE y de E/A** dentro de sus cavidades.

**Cierra POPB-d:** el anillo del derrame ahora **sí** sigue al tamaño (6, 11 y 17 px), con la
marca del compromiso sumando por encima.
**Cierra POPB-e:** el esquema entra al PDF, con su casilla y su epígrafe fijo.
**POPB-f sigue abierto:** las válvulas laten con la frecuencia cargada y las cavidades con su
período propio, que es lo que esta orden vuelve a pedir expresamente.
