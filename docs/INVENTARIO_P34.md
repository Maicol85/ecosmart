# INVENTARIO — PANT-34 (TAREA 0, solo lectura)

Medido el 2026-11-10 sobre la línea base de PANT-33: `HEAD` = `origin/main` = **`31399ad`**,
`index.html` con **173.959** líneas, **12.629.165** bytes, md5 **`b3259e74`**, sello
**`v20261110-2022`**, pendrive `DISK_IMG` montado. Verificado con `wc -l`, `wc -c`, `md5` y
`git rev-parse`: **el renglón de tamaño de `CLAUDE.md` estaba BIEN en las tres cifras**, por
trigésima primera vez seguida.

Nada de este commit toca `index.html`. La sonda es `scripts/_probe_p34inv.mjs` (solo lectura, en
Chrome real por CDP, con la sesión abierta y el DDVI/VDFVI cargados para que la compuerta de
tamaño del 3D no corte el dibujo).

---

## (a) El panel de Coronarias de PANT-29 — CONFIRMADO

Vive en `#lv3d-coro-panel`, dentro de `#lv3d-col-der`, y nace con `display:none`; lo prende
`lv3dCoroUI` cuando `_lv3d.coro` es verdadero. Tiene **TRES filas** (hijos de
`#lv3d-coro-panel`), las tres visibles con el botón prendido:

| fila | id / clase | contenido |
|---|---|---|
| 1 | `#lv3d-coro-caja` (`position:relative`) | el botón `.lv3d-coro-vista-btn` **«Vista de angiografía»** y, absoluta debajo, la lista `#lv3d-coro-lista` con **SEIS** `.lv3d-coro-v` y el botón `.lv3d-coro-angio` «Modo angiografía (fondo oscuro)» |
| 2 | `.lv3d-coro-fila` | **Dominancia**: `.lv3d-coro-dom` `data-d` 0/1/2 → «Der.», «Co», «Izq.» |
| 3 | `.lv3d-coro-fila` | `.lv3d-coro-transp` «Transparente» y `.lv3d-coro-letras` «Letras» |

El pie es `#lv3d-coro-pie` (también `display:none` sin el botón prendido) y trae dos cosas: la
línea `.lv3d-coro-vista-txt` **«Vista simulada, aproximada.»** —que sólo se ve con una vista
elegida— y la leyenda de las siete letras con el gris.

El botón **«Coronarias»** es `.lv3d-coro-btn`, fuera del panel, y lo cablea `lv3dCablear` una
sola vez (`_lv3d.cableado`): **los oyentes no se acumulan**, porque el cableado no se repite y el
repintado (`lv3dCoroUI`) sólo cambia clases y `display`.

**Cómo se reinicia al apagar** (`lv3dCoroApagar`, que corre al apagar el botón, en
«Nuevo estudio» y al cerrar el 3D): pone `coro=false`, `coroVista=null`, `coroTransp=false`,
`coroLetras=true`, `coroAngio=false`, `coroLista=false`. **La dominancia NO se reinicia**, y es
el pedido textual de PANT-29.

**Ancho de los botones, medido en cuatro anchos de ventana** (`#lv3d-col-der` y el alto de los
siete botones visibles):

| ventana | `#lv3d-col-der` | «Vista de angiografía» | Der./Co/Izq. | Transp./Letras | bajo 44 px | desplazamiento |
|---|---|---|---|---|---|---|
| 1440 px | 150 px | 150 × 44 | 46/48/48 × 44 | 74/72 × 44 | 0 | 0 |
| 1000 px | 150 px | 150 × 44 | 46/48/48 × 44 | 74/72 × 44 | 0 | 0 |
| 768 px | 676 px | 676 × 44 | 221/223/223 × 44 | 337/335 × 44 | 0 | 0 |
| 390 px | 298 px | 298 × 44 | 95/97/97 × 44 | 148/146 × 44 | 0 | 0 |

A 1440 y 1000 px la columna mide **150 px**: ése es el ancho real en el que tienen que convivir
«Vista de angiografía» y el botón «Arteria» nuevo de la parte C. Los `.btn` del panel llevan
`white-space:normal`, `min-height:44px` y `font-size:11px`, así que un botón angosto parte el
texto en dos líneas en vez de desbordar.

---

## (b) Cómo se convierte una vista en una orientación — CONFIRMADO

- **La tabla** es `LV3D_CORO_VISTAS`, un `Object.freeze` de seis entradas `{ n, a, b }`.
- **La convención**, leída del código y verificada contra los valores: `a` es la **oblicua** y
  `b` la **angulación craneal positiva**. El vector de cámara es
  `d = [sin(a)·cos(b), sin(b), cos(a)·cos(b)]`, y la matriz final es
  `lv3dMul([xc, yc, d], Rp)` con `Rp` la postura anatómica de base.
  - **`a` negativa = OAD**, **`a` positiva = OAI** (hoy: OAD caudal `a:-30`, OAI caudal `a:40`).
  - **`b` positiva = craneal**, **`b` negativa = caudal** (OAD caudal `b:-25`, OAD craneal `b:20`).
- **Coincide con la demo, valor por valor.** `docs/3d/ecosmart_demo_arterias_coronarias_3d.html`
  publica `{a:-30,b:-25}`, `{a:40,b:-30}`, `{a:-30,b:20}`, `{a:40,b:30}`, `{a:0,b:30}` y
  `{a:35,b:0}`, los seis idénticos a los de la app.
- **Las tres formas que la parte A pide SÍ se pueden expresar, y no hace falta adaptar nada:**
  - **de frente (AP)** → `a:0` (ya se usa en «PA craneal»);
  - **lateral izquierda de 90°** → `a:90`, que da `d=[1,0,0]`, `xc=[0,0,-1]` y `yc=[0,1,0]`: una
    base válida, sin degenerar. (Lo que degeneraría es `b:±90`, que ninguna vista pide.)
  - **rotación sin angulación** → `b:0` (ya se usa en «OAI (CD)»).

---

## (c) Las arterias, su dueño y la dominancia — CONFIRMADO

Las define `lv3dCoroDefs()`, que devuelve una lista de objetos `{ g, n, f, w, p }`: `g` es el
**grupo dueño** —`LM`, `DA`, `Cx` o `CD`—, `n` la letra (sólo siete la llevan), `f` dónde se
ancla la letra, `w` el ancho del trazo y `p` los puntos sobre la superficie. El **tramo gris** lo
calcula `lv3dCoroSegmentos` por grupo, desde `contrArteriasDatos()`: para cada `g` de `DA`, `Cx` y
`CD` toma el corte `eff[g]` y pinta de gris todo lo que esté por encima de esa altura.

Medido con `lv3dCoroSonda(0)` en las tres dominancias:

| dominancia | segmentos | dueño de cada letra | reparto por grupo |
|---|---|---|---|
| **0 derecha** | 20 | `DA=DA D=DA Cx=Cx MO=Cx CD=CD DP=CD PL=CD` | LM 1 · DA 8 · Cx 3 · CD 8 |
| **1 codominante** | 19 | `DA=DA D=DA Cx=Cx MO=Cx CD=CD DP=CD PL=Cx` | LM 1 · DA 8 · Cx 4 · CD 6 |
| **2 izquierda** | 19 | `DA=DA D=DA Cx=Cx MO=Cx CD=CD DP=Cx PL=Cx` | LM 1 · DA 8 · Cx 8 · CD 2 |

Las siete letras —DA, D, Cx, MO, CD, DP, PL— están en las tres.

**El dueño ya está resuelto en `g` DESPUÉS de aplicar la dominancia**, y eso es lo que hace
barato el selector de la parte C: `oPDA = (dom===2) ? 'Cx' : 'CD'` y `oPL = (dom===0) ? 'CD' :
'Cx'`. O sea que **«izquierda» es `g !== 'CD'` y «derecha» es `g === 'CD'`**, sin una segunda
lista de reparto que pueda quedar vieja. El tronco izquierdo (`LM`) es de la izquierda.

El **tronco de aorta** no sale de `lv3dCoroDefs`: lo dibuja `lv3dCoroRaiz` aparte, y no es una
arteria de ningún lado —es la raíz donde nacen las dos—, así que no entra en el selector.

---

## (d) El cuadro del 3D y su rincón libre — CONFIRMADO, y el rincón derecho está VACÍO

- El lienzo lógico es **680 × 380** (`LV3D_W`, `LV3D_H`); en pantalla a 1440 px mide 596 × 333.
- **La brújula** se dibuja al final de `lv3dPintar`, en píxeles lógicos, con origen
  `ox = 58`, `oy = H - 48 = 332` y radio 32, cinco ejes (`Lat`, `Sep`, `Ant`, `Inf`, `Punta`),
  `font '12px sans-serif'` y `lineWidth 2`, en `pal.texto` / `pal.texto2`.
- **Qué hay hoy en los dos rincones de abajo**, contado por píxeles con alfa > 8:
  - rincón izquierdo (x 10–110, y 290–375): **904 píxeles con tinta** → es la brújula;
  - rincón **derecho** (x 570–670, y 290–375): **0 píxeles** → **está vacío**.
- Un rótulo nuevo ahí **no afecta el movimiento**: va después del bucle de polígonos, no entra en
  `polis`, no se ordena por profundidad y no toca `_lv3d.R`. Se dibuja entre `ctx.save()` y
  `ctx.restore()`, que es lo que exige la lección (6) —el contexto se comparte entre cuadros—.

---

## (e) La captura, y qué pasaría con un rótulo nuevo — CONFIRMADO

`lv3dCapturar()` arma un canvas propio de `LV3D_W × (LV3D_H + pie + leyenda + 10)`, pinta un
fondo **opaco** y llama a **`lv3dPintar(ctx, W, LV3D_H, pal, false)`** con la paleta fija
`LV3D_CAP_PAL`. O sea que la captura **recorre exactamente el mismo pintor**:

- todo lo que `lv3dPintar` dibuje en el rincón derecho de abajo **sale también en el PNG**, en la
  misma posición lógica, dentro de la banda del modelo (el pie arranca en `LV3D_H + 6 = 386`);
- **el selector de arteria se respeta por construcción**, porque los segmentos los calcula
  `lv3dCoroSegmentos` dentro de `lv3dPintar`;
- `LV3D_CAP_ALTO_PIE` = **76**.

La medición en el PNG real queda para la parte D (commit 5).

---

## (f) Los ids del panel y el censo de campos — CONFIRMADO

Los ids del panel son `lv3d-coro-panel`, `lv3d-coro-caja`, `lv3d-coro-lista` y `lv3d-coro-pie`, y
los controles son **`<button>`**, no `input`: **ningún recolector los ve**, porque los tres
recorren `input[id]`, `select[id]` y `textarea[id]`.

Los tres mecanismos, medidos:

1. **`guardarInforme`** excluye por prefijo con `_noEsDelEstudio(id)`, cuya expresión incluye
   **`ref-`** (guión MEDIO) desde 2026-10-18 — está ahí por el buscador de Referencias.
2. **`_CAMPOS_FUERA_DEL_ESTUDIO`** —el que decide si «el formulario tiene datos»— **NO incluye
   `ref-`**, pero `_formTieneDatos` sólo recorre `input[type=text]`, `input[type=number]` y
   `textarea`: **una casilla de verificación no entra**.
3. **`limpiarCampos`** («Nuevo estudio») recorre `input[id], select[id], textarea[id]`: una
   casilla **sin `id`** queda intacta.

⚠️ **Consecuencia para la parte B: las casillas del esquema van SIN `id`**, con la etiqueta
envolviendo la casilla (asociación implícita, accesible y operable con teclado) y la clave en un
`data-`. Así quedan fuera de los tres mecanismos **por construcción** y no por una lista que
mañana se olvide. Si llevaran `id` con prefijo `ref-`, el punto 3 las **destildaría** en
«Nuevo estudio» dejando el dibujo puesto sin su casilla.

Los ids nuevos de contenedor no pueden caer en ningún barrido por sufijo o prefijo. Censados en el
archivo: **12 por sufijo** (`-arrow`, `-aviso`, `-badge`, `-ref-fuente`, `cine-ayuda`,
`cine-guardar`, `cine-med-barra`, `cine-med-borrar`, `cine-med-cap`, `cine-med-recal`,
`cine-panel`, `cine-side`) y **9 por prefijo** (`bloque-esten-`, `bloque-insuf-`, `em-clase-`,
`em-pdf-`, `ete_tavi_`, `gf-insuf-`, `im-pdf-`, `m3d-a-`, `pop_`).

---

## (g) REFERENCIAS: «Anomalías coronarias» — CONFIRMADO, con DOS hallazgos que cambian el diseño

**Dónde vive.** Pestaña **Referencias** → subpestaña **Cardiopatías congénitas**
(`#ref-sub-congenitas`). El reparto lo fija `REF_SUBTAB.congenitas`, que es
`['congenitas', 'coronarias']`: o sea que la ficha tiene **UNA sola hermana**. El encabezado dice
«🫀 Anomalías coronarias congénitas — trayecto» y abre `#ref-coronarias`.

**Su contenido hoy: CUATRO hijos, 1.634 caracteres**, medidos en Chrome:

| hijo | `data-ref-solo` | caracteres | empieza |
|---|---|---|---|
| 1 | — | 286 | «Origen anómalo desde el seno contralateral — tres trayectos …» |
| 2 | — | 158 | «ASE 2020 — Frommelt et al, Recommendations for Multimodality …» |
| 3 | `1` | 839 | «• Tipos: el origen desde el seno contrario, coronaria desde …» |
| 4 | `1` | 348 | «ASE 2020 — Frommelt et al, J Am Soc Echocardiogr 2020;33(3):…» |

**⚠️ HALLAZGO 1 — el globo ⓘ `otr-rac` CLONA LOS DOS PRIMEROS HIJOS DE ESTA FICHA.**
`VINFO['otr-rac'].dyn` es `_otrRefClon('ref-coronarias')` **sin modo**, o sea `r.children`
entero, y la compuerta de esa función saltea los hijos marcados `data-ref-solo`. Medido: el clon
da **478 caracteres** y es exactamente los hijos 1 y 2 más la línea «Ficha de la pestaña
Referencias.» que agrega la propia función.

Esto choca de frente con dos órdenes que la tanda tiene a la vez: «el contenido actual de esa
ficha se REEMPLAZA» y «el globo ⓘ `otr-rac` queda IDÉNTICO carácter por carácter». Si los hijos 1
y 2 se reemplazan, el globo cambia. **La salida, declarada:** los hijos **1 y 2 no se tocan** —son
el globo— y lo que se reemplaza es el **cuerpo propio de la ficha**, o sea los hijos 3 y 4, que
son la ampliación de PANT-29 y viven **sólo** en Referencias. El esquema nuevo entra marcado
`data-ref-solo`, así que el globo queda intacto **por el mismo mecanismo** que PANT-29 usó, no por
cuidado. Queda en `docs/PENDIENTES.md` → **P34-b**.

**⚠️ HALLAZGO 2 — `position:sticky` NO puede funcionar acá.** La cadena de contenedores, medida:

| elemento | `overflow-y` | `overflow-x` | `position` | alto |
|---|---|---|---|---|
| `#ref-coronarias` | visible | visible | static | 334 px |
| `.card` | **hidden** | **hidden** | static | 380 px |
| `#ref-sub-congenitas` | visible | visible | static | 438 px |
| `#tab-refs` | visible | visible | static | 546 px |

La tarjeta que envuelve la ficha es **`overflow:hidden` en los dos ejes**, así que se vuelve el
antecesor de desplazamiento más cercano y **no desplaza**: un `position:sticky` adentro nunca se
activa. O sea que el «fijo mientras se lee el apartado» del punto B2 **no se puede** con el
contenedor que hay, y su propia cláusula —«si el contenedor lo permite»— lo contempla. El cuadro
del esquema va **estático al costado**, alineado arriba. Declarado en **P34-b**.

**El ancho disponible** de la ficha a 1440 px es **1.230 px**: alcanza de sobra para texto más un
cuadro de 230 px al costado.

**El techo de caracteres.** La ficha declara en su propio comentario 839 caracteres y 4 viñetas,
«por debajo del techo de 850 y 7 que fija el resumen más largo de `ref-miocard`». El techo lo
**fija una prueba**, no una constante: **TC-779 (B3)** exige `dosPuntos(nuevo) === 4` y
`H[2].chars <= 850`. La orden releva a esta sección de ese techo, así que **TC-779 se adapta**.

**Qué pruebas fijan el texto de esta ficha**, censadas en `scripts/test_clinico.mjs`:

- **TC-779** — el caso dueño: (A0) cuatro hijos; (A1) los tres trayectos palabra por palabra;
  (A2) la línea de fuente con el folio 266; (A3) los dos primeros hijos sin la marca; (B1) los dos
  nuevos con la marca; (B2) los cuatro temas «Tipos/Frecuencia/Riesgo/Cirugía»; (B3) cuatro
  viñetas y ≤ 850 caracteres; (B4) las cuatro guías con sus folios; (B5) ninguna palabra
  prohibida; (C1) el clon en **478** caracteres; (C2) lo que clona es la ficha vieja; (C3) el
  globo abre en pantalla.
- **TC-502** y **TC-509** — los conteos de inventario de Referencias (fichas y reparto).
- **TC-783 (B6)** — la lista de vistas trae las **SEIS**; **(B5)** el panel tiene **TRES** filas;
  **(B7)** los **SIETE** botones miden 44 px.
- **TC-784 (B1)(B2)** — las **SEIS** vistas dan seis dibujos distintos y el botón pasa a decir
  **«Vista: …»** con el nombre de cada una.

**Cómo se arma el índice del buscador.** Recorre los encabezados `h2.card-head` con `toggleRef`
de cada panel y el `#ref-<id>` hermano; medidos **40** encabezados con `toggleRef`. **No hace
falta tocarlo**: la ficha y su encabezado no se mueven ni cambian de id.

**Casillas que ya existen en Referencias: CERO.** Medido, `#tab-refs` no tiene un solo
`input[type=checkbox]`, así que no hay patrón previo que copiar dentro de esta pestaña; se usa el
patrón general de la app (etiqueta + casilla), sin `id`, por el punto (f).

---

## Hipótesis de la orden — confirmadas y falsas

| # | hipótesis | veredicto | medición |
|---|---|---|---|
| 1 | El panel tiene tres filas con esos controles | **confirmada** | tres hijos de `#lv3d-coro-panel`, los tres visibles |
| 2 | La lista tiene hoy **seis** vistas | **confirmada** | 6 `.lv3d-coro-v` |
| 3 | El título del botón **cambia** al elegir una vista (A2 lo quiere fijo) | **confirmada: hoy cambia** | sin vista «Vista de angiografía»; con la vista 0 **«Vista: OAD caudal»** |
| 4 | Apagar «Coronarias» reinicia vista, transparencia, letras y modo angiografía, y no la dominancia | **confirmada** | `lv3dCoroApagar` |
| 5 | La tabla de ángulos coincide con la demo | **confirmada** | los seis pares `a/b` idénticos |
| 6 | La convención puede expresar AP, lateral de 90° y rotación sin angulación | **confirmada** | `a:0`, `a:90`, `b:0`; ninguna degenera |
| 7 | El dueño de DP y PL cambia con la dominancia | **confirmada** | tabla de (c) |
| 8 | El rincón derecho de abajo del cuadro está libre | **confirmada** | **0** píxeles con tinta |
| 9 | La captura usa el mismo pintor, así que un rótulo nuevo saldría en el PNG | **confirmada en el código** | `lv3dCapturar` → `lv3dPintar` |
| 10 | Los ids del panel quedan fuera del censo | **confirmada** | son `button`; los recolectores piden `input[id]` |
| 11 | «Anomalías coronarias» vive en Cardiopatías congénitas | **confirmada** | `REF_SUBTAB.congenitas` |
| 12 | El techo de ~850 caracteres aplica a los resúmenes | **confirmada, y lo fija una PRUEBA** | TC-779 (B3) |
| 13 | El globo `otr-rac` clona el texto de la ficha | **confirmada, y es más fuerte de lo que la orden supone**: clona los hijos **sin** `data-ref-solo`, así que reemplazar el cuerpo viejo **sí** lo cambiaría | clon = 478 caracteres |
| 14 | El contenedor «permite» un elemento fijo | **FALSA** | `.card` es `overflow:hidden` en los dos ejes: un `sticky` adentro no se activa nunca |
| 15 | En Referencias hay patrones de casilla para copiar | **FALSA** | **cero** casillas en toda la pestaña |

---

## De dónde salen las cifras de los textos de la parte B

Los textos de B4 son del médico y se copian **exactos**. Lo que se midió es si sus cifras ya
estaban **leídas y verificadas** en esta casa, para no afirmar nada nuevo sin fuente. Censado
contra `docs/CONTROL_CORONARIAS_P28.md`, que trae la regla de folio comprobada hoja por hoja:

| cifra del texto nuevo | fila del control | hoja / folio |
|---|---|---|
| 0,7 % de las anomalías de origen aórtico | C2 | 3 / 261 |
| «seis veces más» la derecha que la izquierda | C3 | 8 / 266 |
| tramo intramural, interarterial, los tres caminos | C4, C5 | 8 / 266 |
| segunda causa de muerte súbita en atletas jóvenes | C8 | 8 / 266 |
| menores de 40 años, durante o después del esfuerzo | C9 | 8 / 266 |
| mayor riesgo del interarterial e intramural | C10 | 8 / 266 |
| origen estrecho, ángulo agudo, compresión del tramo | C11 | 8 / 266 |
| muerte súbita también con el intramural de la derecha | C10, C12 | 8 / 266 |
| ALCAPA 1 de cada 300.000 niños | C43 | 11 / 269 |
| ALCAPA: cerca del 90 % sin cirugía en el primer año | C46 | 11 / 269 |
| ALCAPA: reimplantación y técnica de Takeuchi | C57 | 12 / 270 |
| ARCAPA 0,12 % de las cardiopatías congénitas; ventana aortopulmonar y Fallot | C44 | 11 / 269 |
| fístula 0,002 % y 0,1 a 0,2 % en coronariografía | G5 | ACC/AHA 2025, 100 / e214 |

**Lo que NO está en el control** y entra sólo como texto aprobado por el médico: los repartos de
la fístula por origen (29–55 %, 39–63 %, 7–19 %) y por desembocadura (49/26/13 y 41/26/16 %), y
el tramo intramural de 2 a 3 mm del AAORCA. **Ninguno de los cinco apartados escribe el nombre de
una guía, un folio, una clase ni un grado**, así que el texto no atribuye nada a ninguna fuente:
la línea de fuentes de la ficha es la que ya estaba y no se toca.

---

## Dónde empieza la cobertura

`scripts/test_clinico.mjs` tiene **825** casos y el último es **TC-812** (PANT-33). El primer
número libre es **TC-813**.

---

## PARTE D — la captura del 3D, medida sobre el PNG de verdad (commit 5)

**Solo medición y declaración: el comportamiento de la captura NO se cambió.** La sonda es
`scripts/_probe_p34d.mjs`, que llama a `lv3dCapturar()`, carga el PNG que deja en `_lv3d.cap.url`
y le cuenta los píxeles que no son blancos —el fondo del PNG es blanco opaco, `LV3D_CAP_PAL`— en
tres zonas: el rincón del rótulo, el de la brújula y la banda del pie.

| escena | tamaño | hash del PNG | tinta en el rincón del rótulo | brújula | banda del pie |
|---|---|---|---|---|---|
| «Coronarias» apagado | 1360 × 932 | `785bd95e` | **0** | 2.483 | 3.930 |
| prendido, sin vista | 1360 × 932 | `85313630` | **0** | 2.483 | 3.930 |
| con la vista «Lateral» | 1360 × 932 | `2d251060` | **641** | 2.850 | 3.930 |
| «Lateral» + arteria **Derecha** | 1360 × 932 | `d3e6c40` | 641 | 2.850 | 3.930 |
| «Lateral» + arteria **Izquierda** | 1360 × 932 | `96557441` | 641 | 2.850 | 3.930 |
| de vuelta a **Todas** | 1360 × 932 | **`2d251060`** | 641 | 2.850 | 3.930 |

**Las dos respuestas de D1:**

1. **Sí, el rótulo de la vista SALE en la captura, y por lo tanto en la imagen que va al PDF.**
   Es consecuencia directa de que `lv3dCapturar` llame al **mismo** pintor,
   `lv3dPintar(ctx, W, LV3D_H, pal, false)`: 641 píxeles de tinta en el rincón con una vista
   puesta y **cero** sin ella.
2. **Sí, la captura respeta el selector de arteria.** Los tres PNG son distintos
   (`2d251060`, `d3e6c40`, `96557441`) y volver a «Todas» devuelve **el mismo hash** que la
   primera captura, o sea que el PNG es idempotente.

**No es un defecto, y por eso no se abre un pendiente de defecto:**

- **no tapa nada**: el rincón medía **cero** píxeles de tinta sin el rótulo —medido también en la
  línea base—, y la banda del pie da **3.930** idénticos en las seis escenas, así que el rótulo no
  se le encima ni al pie ni a la brújula (que cambia de 2.483 a 2.850 porque **gira con la vista**,
  no por el rótulo);
- **es legible**: en la captura la paleta es la fija `LV3D_CAP_PAL`, o sea texto oscuro sobre fondo
  blanco, y el PNG sale a escala 2, así que el cuerpo de 12 px del rótulo se rasteriza a 24 px;
- **y es deseable**: una imagen pegada en un informe que no dice desde qué vista se mira es una
  imagen sin su dato. Queda declarado en `docs/PENDIENTES.md` → **P34-d**.

⚠️ **UNA TRAMPA DE MEDICIÓN, PAGADA ACÁ: la animación hay que pausarla antes de cada captura.**
La primera corrida dio **seis hashes distintos** y parecía que volver a «Todas» no devolvía el
dibujo. Lo que se movía era el corazón: leer el PNG es asíncrono, así que entre dos capturas corren
cuadros de `requestAnimationFrame` y cada PNG sale con otra fase del latido. Con
`_lv3d.corriendo = false` y la fase en 0 antes de cada captura, el ida y vuelta da el hash exacto.
