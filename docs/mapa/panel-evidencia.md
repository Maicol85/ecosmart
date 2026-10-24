<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->

# Mapa de funciones — Panel de Evidencia

Panel «Evidencia según guías» (`#indic-overlay`).

> **El GLOSARIO está en otro archivo: `docs/mapa/panel-evidencia-terminos.md`.** El ⓘ de un
> TÉRMINO (`<button data-ind-term>`, registro `IND_TERMINOS`, la tarjeta flotante `#indic-term`) es
> un **tercer** mecanismo de ⓘ y vive aparte porque este mapa ya estaba en 33 KB. Lo que sigue acá
> es el marco, las preguntas, las citas y las secciones.

Se llama **Evidencia** en pantalla pero los identificadores siguen siendo `indic-*` / `_ind*` /
`IND_*`, deliberado según su cabecera. **No renombrar por substring:** `campos['indicaciones']`,
`lab-acc-indicaciones` y `data-ppt="indicaciones"` son otras tres cosas. Y el panel **no sale del
informe**: ni el narrativo, ni el PDF, ni el PPT, ni el Excel lo leen.

---

> ⚠️ **UNA SECCIÓN PUEDE PEDIR EL MODO COMPACTO (AJ6-2, 2026-10-24).** Si su `fn` devuelve
> `compacta: true`, `_indSecHTMLCuerpo` emite los `bloques` y el `recom` **antes** de la grilla,
> pinta las filas con `_indFilaHTML(f, true)` —que pliega **todas** las notas en el ⓘ, también las
> de dato y las de marca 🔴/⚠️— y marca la grilla con `data-ind-compacta="1"`, que enciende las dos
> columnas **sin pedir maximizar**. Hoy la pide **una sola**: la tetralogía de Fallot reparada.
> Por qué eso invierte la regla del 2026-10-11 y qué hay que revisar si esa sección publicara
> alguna vez una contraindicación: **`docs/mapa/aj6-fallot-pulmon-refs.md`**.

## Entradas y ciclo de vida

- **`indicAbrir`** — única puerta por la que el panel se ve: `_indClinLimpiar()`, `indicRender()`,
  `_indClinCablear()`, y recién ahí `display:'block'` en `#indic-overlay`.
- **`indicCerrar`** — `_indClinLimpiar()` + oculta el overlay. Lo llama el `keydown` global de Escape.
- **`indicRender`** — recorre `IND_SECS`, llama a `s.fn()` en un `try` por sección, pinta con
  `_indSecHTML(s.tit, r)`, antepone `_indLeyendaHTML()` y `_indMecanismoHTML()`, y asigna
  `#indic-cuerpo.innerHTML`. Una sección que lanza se cuenta en `fallos`, grita por `console.error`
  con su título y se declara al pie; no se lleva el panel. Sin ninguna, pinta «Sin criterios de
  intervención detectados…». **No recolecta claves de cita**: sería un segundo dueño de la numeración.
- **`indicHayCriterios` / `indicSyncBoton` / `_indSyncDebounced`** — **el COLOR** de `#indic-btn`,
  no su visibilidad (cambió el 2026-10-11). El botón está **siempre**: `btn-ghost` (gris) sin
  criterios y `btn-primary` (azul, el mismo par que las ocho pastillas de válvula) con al menos una
  sección. Corren las **mismas** `IND_SECS` y **fallan hacia azul**. Debounce de 400 ms sobre
  `input`/`change` en captura. Las dos etiquetas están en **`IND_BTN_ET`**, y la del azul dice «hay
  guía aplicable para consultar, **no** que haya indicación de tratamiento»: la compuerta enciende
  en cuanto UNA sección devuelve algo, y una sección puede abrir con recomendación `no` o `falta`.
  Enganches: ninguno propio — `indicSyncBoton` ya estaba en `RECALC_MODULOS` (el embudo de las cinco
  rutas de restauración) y se llama a mano al final de `limpiarCampos`.
  ⚠️ **En HEAD el botón NUNCA se escondía a la vista.** Medido con `getComputedStyle`: con
  `hidden === true` tenía `display:flex` y **104 × 44 px reales**, porque la regla de autor
  `.btn, .tab-btn, .nav-tab, .chip { display:inline-flex }` le gana al `[hidden]{display:none}` de
  la hoja del **navegador**. `hidden` sólo lo sacaba del árbol de accesibilidad. Es el mismo defecto
  que `index.html` ya documenta tres veces —`.fg`, `.frases-panel` y el banner de versión, los tres
  con su propio `X[hidden]{display:none}`— y `#indic-btn` nunca recibió esa regla. **TC-274 estaba
  verde encima, por medir la PROPIEDAD y no el estilo computado.** Hoy está cerrado por
  construcción: ya no hay `hidden`.
- **`_indRepintarConservando`** — repinta conservando acordeones, scroll y foco. Indexa cada
  `<details>` por «summary del padre ▸ summary», no por rótulo.
- **`_indClinVaciar`** — envoltorio global de `_indClinLimpiar` con guarda `typeof`, para los dos
  caminos de «Nuevo estudio»; falla hacia no limpiar y avisa.

El panel **no tiene estado persistido** (regla 1 de su cabecera): se re-deriva del formulario en
cada apertura, así que no necesita columna en `limpiarCampos` / `cargarEstudioPorId` /
`guardarInforme`.

---

## El marco — maximizar, dos columnas, el foco (2026-10-11)

`#indic-card` es `role="dialog" aria-modal="true" tabindex="-1"`, 820 px, `max-height:calc(100vh-48px)`,
flex column, con tres hijos: encabezado (`#indic-titulo` · `#indic-max` · «✕»), `#indic-cuerpo` y el
pie del descargo. ⚠️ **El pie es `card.lastElementChild` y TC-272 lo toma así**: un hijo nuevo al
final de la tarjeta rompe ese caso.

| Identificador | Rol |
|---|---|
| `#indic-max` | El botón «⤢ / ⤡». Etiqueta, `aria-pressed` y glifo los mantiene **sólo** `indicMaxPoner`. |
| `data-ind-max="1"` en `#indic-card` | **Único dueño del estado.** La geometría la pone la hoja de estilos, con `!important` porque el tamaño normal está en el `style` en línea. |
| `indicMaxEstado` / `indicMaxPoner` / `indicMaxTog` | Leer · escribir+sincronizar · el `onclick`. |
| `data-ind-grid` / `data-ind-dos` | El envoltorio de columnas y la compuerta «hay filas del eco Y preguntas». |
| `data-ind-col="eco"` / `="clin"` | Las dos mitades. El orden del DOM no cambia, así que lectura y tabulación tampoco: sin `tabindex` ni `order`. |
| `_indClaveSummary(su)` | La clave de un `<summary>`: `aria-label` si lo tiene, si no el texto. |

- **El estado NO se guarda y se apaga en las DOS puertas** (`indicAbrir` e `indicCerrar`), igual que
  `_indClinLimpiar`: con el apagado sólo en el cierre, un camino de cierre nuevo deja el panel
  reabriendo maximizado.
- **Sin transición, a propósito**: `width:820px → auto` no es un par animable, así que una
  transición animaría la posición y haría saltar el ancho. Sin movimiento,
  `prefers-reduced-motion` queda satisfecho por construcción.
- **Dos columnas sólo maximizado y con viewport ≥ 1000 px.** Media query y no `@container`:
  declarar `container-type` cambia la contención de layout del nodo del que cuelga todo el panel.
  Tres secciones no traen `clinica` (estenosis mitral —las tiene en sus `bloques`—, foramen,
  bicúspide) y ocupan todo el ancho por `data-ind-dos`, no por una excepción en el CSS.
- **El botón se oculta por debajo de 560 px** (el corte que la tabla del panel ya usa): medido, a
  390 px el panel ocupa 366 de 390 y maximizar gana 0 px de ancho y 24 de alto.

### ⚠️ Tres cosas que encontró la sonda y no la lectura

1. **Un oyente GENÉRICO de Escape** (bloque de accesibilidad, ≈ L101105) busca el
   `[role="dialog"][aria-modal="true"]` visible más alto y **clickea** su botón de cerrar.
   `#indic-card` es uno, así que en el mismo Escape el panel restauraba y aquél cerraba (traza con
   espía: `poner(false) · cerrar() · poner(false)`); en HEAD era invisible porque `indicCerrar` es
   idempotente. Lo cierra `stopImmediatePropagation()` **sólo** en la rama del maximizado — los dos
   oyentes están sobre `document` y el del panel se registró antes. Precio declarado: ese Escape no
   llega a los posteriores, que se cierran con el siguiente.
2. **El foco no entraba al panel**: medido en HEAD quedaba en `body` y el primer Tab se iba a
   `#hdr-med-btn`, detrás del overlay. `indicAbrir` enfoca la tarjeta, y con eso **la trampa de Tab
   que el bloque de accesibilidad ya tenía escrita empieza a funcionar** (sólo actúa si el foco ya
   está en el primero o el último control del diálogo).
3. **`_indRepintarConservando` volvió a compartir una clave**, ahora con los ⓘ: su `summary` es el
   mismo glifo, así que los seis de una sección compartían «Estenosis aórtica ▸ ⓘ» y abrir uno los
   abría o cerraba todos — el mismo defecto que ya pagó con los trece «Ver detalle». Lo arregla
   `_indClaveSummary`, **usado en las dos puntas**: arreglar una sola deja la mitad.

## Las preguntas — botones discretos y el ⓘ (2026-10-11)

- **La botonera va al borde derecho por `justify-content`, no por `text-align`** (esta misma regla
  de 560 px ya documenta que `text-align` no alinea hijos de un flex). Va en la hoja y no en línea
  porque a ≤ 560 px la celda baja a su renglón y los botones vuelven a la izquierda.
- **El piso táctil de 44 px NO se baja: se acota a `pointer:fine`.** Honra la decisión de Maicol del
  2026-09-25 («se conserva el piso y lo que baja es el peso visual»). Medido: **22 px con puntero
  fino, 44 px con grueso.** Es `pointer` y no `any-pointer`: con `any-pointer`, una tablet con mouse
  perdería el piso para el dedo.
- ⚠️ **El redondeo y el relleno viven en el `style` en línea de `_indCtrlHTML`.** La primera versión
  del CSS traía `padding`, `border-radius` y `line-height` y las tres **perdían** contra el estilo en
  línea: el radio seguía en 7 px. Una regla que no gana se lee como un arreglo aplicado.
- **`_indInfoHTML(lbl, html)`** emite el ⓘ: `<details data-ind-info="1">` en línea en la celda de la
  marca, con `aria-label` = «Ver la explicación de: `<rótulo>`». Ese `aria-label` no es decoración:
  un lector no lee «ⓘ», y es el discriminante de `_indClaveSummary`.

**Qué nota se pliega — la compuerta es la MARCA.** Sólo la nota de una PREGUNTA (fila con `ctrl`).
Decisión de Maicol (2026-10-11) con el censo delante: **34 notas de pregunta, 57 de fila de dato**;
las de dato NO se tocan, porque la nota de una fila medida es la lectura de su valor al lado del
valor y TC-293 la protege nombrándola «la evidencia que sostiene la recomendación».
⚠️ **Las marcas 🔴 y ⚠️ no se pliegan nunca**, aunque la fila sea pregunta: ahí están las
contraindicaciones de la Tabla 8. La compuerta mira la **marca** y no una lista de claves, así que
una fila nueva que devuelva `alarm` queda cubierta sin que nadie se acuerde. Medido en las tres
lecturas: ❓ → plegada · 🔴 → **visible** · — → vuelve a plegarse (la tercera prueba que sigue la
marca y no «ya fue contestada»). El icono de estado queda siempre visible. Y el bloque del mecanismo
de IM **no se pliega**: su pie declara «no se guarda con el estudio», la misma clase de frase que
TC-272 existe para mantener pintada.

**Las CUATRO marcas de `<details>`, y por qué son cuatro:** `data-ind-detalle` (el «Ver detalle» de
la sección) · `data-ind-biblio` · `data-ind-bloque` · `data-ind-info`.
⚠️ **`data-ind-term` NO es una quinta: no es un `<details>`.** Es un `<button>`, justamente para no
entrar en ninguno de estos conteos — ver `docs/mapa/panel-evidencia-terminos.md`. Todas por **atributo** y
ninguna por rótulo: el rótulo es prosa —o un glifo— y renombrarlo apagaría la distinción en
silencio. TC-293 cuenta «un control de detalle por sección» sobre `details details` y excluye las
otras tres; sin la de los ⓘ daba **37 donde hay 8**, y dos rótulos donde va uno.

---

## Registro de referencias, numeración y el marcador `ecosmart` → otro archivo

Todo el mecanismo de citación —`IND_REFS`, el marcador `ecosmart`, el allowlist `IND_REF_IDX` y
la **numeración por sección**— vive en **`docs/mapa/panel-evidencia-citas.md`**. Salió de acá en
la tanda AJ6 (2026-10-24), sin cambiar una palabra, porque este archivo había cruzado el techo de
~35 KB y la regla de oro de `CLAUDE.md` manda partirlo antes de estirarlo.

---

## Qué devuelve una sección

Cada `fn` de `IND_SECS` devuelve `null` (la sección no aplica y no se pinta) o un objeto:

```js
{ filas:   [ … ],        // _indFila / _indFilaCtrl / _indFilaOrigen — obligatorio
  clinica: [ … ],        // opcional: «Requiere datos clínicos — no evaluable por ecocardiograma»
  bloques: [ … ],        // opcional: sub-bloques dentro de la sección (ver _indBloqueHTML)
  recom:   { … },        // opcional: bloque de recomendación (ver _indRecomHTML)
  aviso:   '…',          // opcional: advertencia arriba de la tabla; también abre el acordeón
  guia:    { ref:'esc2025vc', txt:'…', nota:'…' },
  notas:   [ '…', { txt:'…', refs:['esc2025vc','ahaVc2020'] } ] }
```

- `_indFila(lbl, val, marca, nota, refs)` → `{ lbl, val, marca, nota, refs }`. `marca` es clave de
  `IND_MARCA`: `ok` ✅, `alarm` 🔴, `warn` ⚠️, `ask` ❓, `none` —. `refs` es **array** (lo normaliza
  `_indRefsNorm`, que acepta también un string suelto).
- `_indSinUmbral(lbl)` → la forma única de la regla 4 («umbral no disponible»).
- `_indFilaCtrl(lbl, clave, ops, marca, nota, refs)` → fila contestable (`ctrl:{clave, ops}`).
  `_indOrigen` / `_indFilaOrigen` eligen entre leer el dato del estudio y ofrecer el control:
  **si hay valor de origen el control ni se dibuja**.
- `_indFilaHTML(f)` pinta la fila. **Sin `nota` no se pintan los `refs`**: un corchete pelado al
  lado del icono se leería como si citara el valor.
- `notas` admite string u objeto `{txt, refs}`; `_indDetalleHTML` las pone en el «ⓘ Ver detalle»
  colapsado, con los corchetes después del texto y en el orden declarado.

### El criterio visible — `guia` y `_indGuiaHTML`

`guia` es `{ ref, txt, nota }` con **`ref` en singular y string** (en las filas es `refs`, array —
un carácter de diferencia que ya costó una sección entera). `_indGuiaHTML` imprime `<b>txt</b>` +
`_indRefMarca(ref)` + la `nota`. Un `guia` que sea un string suelto sale «[cita sin numerar]»; un
`txt` vacío, «[criterio no cargado]».

**El `txt` es donde va la clase y el nivel**, con el formato único `Clase I · Nivel B`. El nivel es
**opcional** por diseño (el documento del foramen usa GRADE y no tiene clases ESC). El corchete
`[1]`, `[2]`… **no se escribe a mano nunca**: lo emite `_indRefMarca` desde la clave, pegado al final
del `txt` del criterio, del `txt` de la nota o de la línea de clase/fuente de la recomendación.

### El bloque de recomendación — `_indRecomHTML(r)`

`r` es `{ tipo, tit, txt, clase, fuente, ref, faltan, nota, mod }`:

- `tipo` → solo el color, vía `IND_RECOM_COL` (`ind`, `alarma`, `falta`, `no`). `falta` **no** es
  «no hay indicación».
- `txt` es el texto de la recomendación. `clase` lleva `Clase I · Nivel B`; `fuente` es la prosa que
  nombra el documento (p. ej. `EM_FUENTE`); `ref` es la clave (`EM_REF`).
- La línea de clase/fuente se pinta si hay `clase` **o** `fuente`. Con `fuente` y sin `ref` sale en
  rojo «[cita sin numerar]»: es un defecto, no un hueco normal.
- `faltan` lista lo que falta contestar. `nota` **queda visible** (es la condición de la fila que no
  se pudo verificar, no contexto); al detalle colapsado va solo `notas`.
- `mod` es el segundo slot (`{tit, txt, clase, fuente, ref, nota}`, rótulo por defecto «Modalidad»).
  Hereda `ref` del padre **solo si tampoco trae `fuente` propia**.

---

## Las quince secciones — `IND_SECS`

`const IND_SECS = [ { tit:'…', fn:_indXX }, … ]` — dos campos: el título visible (el `summary` del
`<details>`, y la clave de `_indRepintarConservando`) y la función.

En el orden del array, con sus helpers propios:

1. Estenosis aórtica — `_indEA` · `_indEARecom`, `_indEAModalidad`, `EA_REC_2025`, `EA_FUENTE`, `EA_REF`
2. Insuficiencia mitral primaria — `_indIM` · `_indIMRecom`, `IM_REC_2025`, `IM_FUENTE`, `IM_REF`
3. Insuficiencia mitral secundaria — `_indIMS` · `_indIMSRecom`
4. Estenosis mitral — `_indEM` · `_indEMAlarma`, `EM_NOTAS`, `_emRecEstado`, `_emRecFilas`,
   `EM_REC_2025`, `EM_REC_ORDEN`, `EM_EST_TXT`/`EM_EST_MARCA`, `EM_FUENTE`, `EM_REF`,
   `EM_LBL_TROMBO`, `EM_ETIO_CMP`, `EM_ETIO_DEG` — **la única sección con `bloques`** (ver abajo)
5. Prótesis mitral — `_indProtM` · `PROTM_REC_2025`, `PROTM_FUENTE_ESC`/`PROTM_REF_ESC`, `PROTM_FUENTE_AHA`/`PROTM_REF_AHA`
6. Insuficiencia aórtica — `_indIA` · `_indIADatos`, `_indIAModalidad`, `_indIARecom`, `IA_FUENTE`, `IA_REF`
7. Válvula tricúspide — `_indVT` · `_indVTDatos`, `_indVTRecom`, `_indVTModalidad`, `_indVTDils`
8. Estenosis pulmonar — `_indEP` · `_indEPDatos`, `_indEPRecom`
9. Comunicación interauricular — `_indCIA`
10. Comunicación interventricular — `_indCIV` (cita `escGuchCiv`)
11. Ductus arterioso permeable — `_indDAP`
12. Coartación de aorta — `_indCoAo`
13. Foramen oval permeable — `_indFOP`
14. Miocardiopatía hipertrófica obstructiva — `_indMCH`
15. Válvula aórtica bicúspide — aorta ascendente — `_indVAB`

«Prótesis mitral» va con las mitrales y no al final: ocupa el lugar de las otras tres cuando la
válvula es una prótesis, y la partición la garantizan las compuertas (`vmEsProtesis`), no el orden.
Las siete sin bloque de recomendación (CIA, CIV, DAP, CoAo, FOP, MCH, VAB) no devuelven `recom`, así
que el nombre de la guía aparece **solo** en la bibliografía del pie de su sección.

---

### Sub-bloques de una sección — `bloques` y `_indBloqueHTML`

Extensión **aditiva** del 2026-10-11, y la usa **una sola sección**: estenosis mitral. Las otras
catorce no devuelven `bloques`, así que el `if` de `_indSecHTMLCuerpo` es un no-op y su HTML sale
igual que antes — verificado por longitud y hash sobre las cuatro que un paciente sembrado pinta.

Forma de un bloque: `{ tit, plegado, aviso, lineas, grupos, nota }`.

| Campo | Rol |
|---|---|
| `tit` | rótulo del bloque; con `plegado` es el `summary` de su `<details>`. |
| `plegado` | `true` → el bloque nace colapsado. Lo usa la estenosis mitral **sin etiología consignada**, bajo «Si fuera reumática». |
| `aviso` | advertencia del bloque, en ámbar, arriba de su contenido. |
| `lineas` | afirmaciones de **una línea**, string u `{txt, refs}`. **Llevan corchete**; la `nota` del bloque no. |
| `grupos` | `[{ tit, filas }]` — sub-tabla con su encabezado. Las `filas` las pinta **`_indFilaHTML`**, no el bloque. |
| `nota` | cierre en gris itálica, **sin cita**. Lo que necesite corchete va en `lineas`. |

- **El bloque NO arma filas: las delega.** El escape sigue siendo de `_indFilaHTML` y `_critEsc`;
  lo único que `_indBloqueHTML` pinta por su cuenta son el rótulo, el aviso y las `lineas`, y las
  tres pasan por `_critEsc`. Un bloque que emitiera su propio `<td>` sería una segunda copia del
  marcado de fila, o sea el lugar donde el próximo olvido de escape entra sin que nada chille.
- **Orden en `_indSecHTMLCuerpo`:** aviso → `filas` → `clinica` → **`bloques`** → `recom` → criterio
  y detalle → bibliografía. La conclusión va DEBAJO de los datos que la sostienen.
- ⚠️ **`plegado` agrega un `<details>` anidado y eso toca `_indRepintarConservando`**, que indexa
  cada detalle por «summary del padre ▸ summary»: el bloque plegado de la mitral queda en
  «Estenosis mitral ▸ Si fuera reumática» y es único. Si alguna vez un bloque plegado llevara su
  propio «ⓘ Ver detalle» adentro, su padre pasaría a ser el bloque y la clave sería otra.

### La sección de estenosis mitral, por bloques (2026-10-11)

| Morfología (`vm_morf`) | Qué se pinta |
|---|---|
| **Reumática** | bloque 1 + bloque 2 abierto |
| Normal o vacío | bloque 1 + aviso destacado + bloque 2 **PLEGADO** («Si fuera reumática») |
| **Calcificada** | bloque 1 + bloque 3 (degenerativa con calcificación anular) |
| Otra no reumática | bloque 1 + una línea de aviso |
| Prótesis | **la sección no existe** (`vmEsProtesis`); el trombo lo repone `_indProtM` |

- **Bloque 1 «¿Es significativa?»** — etiología, el AVm de cada fuente que tenga valor, el
  gradiente medio y la **categoría**. La categoría sale de **`emCategoria()`**, la misma función que
  firma el informe, y se imprime con **`EM_CAT_TXT`**: dos redacciones del mismo veredicto es cómo
  el panel y el papel empiezan a decir cosas distintas sobre el mismo paciente.
- Las filas del área consultan **tres** compuertas antes de publicar un ✅: `emMetodoIncluido`
  (casilla «Incluir en el informe»), `emThpValido`/`emThpMotivoNoVota` y
  `emContValido`/`emContMotivoNoVota`. Las tres se le preguntan al **dueño** y no se reescribe la
  regla: una segunda lectura es cómo el panel vuelve a afirmar con ✅ lo que el informe retira.
- **Bloque 2** — cinco grupos: desfavorables anatómicas, desfavorables clínicas y síntomas, las
  siete contraindicaciones de la Tabla 8, los disparadores del asintomático, y las **cinco filas**
  de la Recommendation Table 8 **cada una con su estado**.
- **`_emRecEstado(k, S)`** devuelve `'si'` · `'no'` · `'contra'` · `null` (falta contestar), y
  **cada fila se evalúa por su propio texto**, no por una cascada de `else if`. Cortan, en orden:
  una contraindicación **presente** (`contra`), y las dos precondiciones de `S.bloqueantes` —el
  trombo sin contestar y el área sin una medición utilizable—. Las otras cuatro
  contraindicaciones sin contestar **NO** cortan y el aviso del bloque lo declara: la app no las
  mide, así que exigirlas dejaría la sección muda de fábrica.
- **`_emRecFilas(S)`** es el que resuelve «Una»: evalúa la tabla con la clínica tomada como
  favorable **y** como desfavorable, y publica la unión. Una fila que aplica sólo en una de las dos
  lecturas lo dice en su renglón. **La app no elige entre las dos** — la guía no define si una sola
  característica alcanza.
- **`_indEMAlarma(D)`** es lo que quedó de `recom`: **sólo** el umbral que no carga y las dos ramas
  del trombo (confirmado y sospecha). El trombo va ahí y **no** en el bloque 2 porque pide
  anticoagulación por su cuenta, sea la válvula reumática, degenerativa o protésica — colgarlo de
  un bloque que sólo existe con etiología reumática lo perdería.
- **`EM_NOTAS(US, etio, D)`** son las notas del «ⓘ Ver detalle», en su propia función: la guía
  vigente primero y **las tres guías previas en UNA sola nota** al final, con lo que cambia la
  conducta. Dos notas que nombran la ASE 2023 se **gatean por etiología**, porque es un documento
  de cardiopatía reumática; con otra etiología va una nota que declara la discrepancia **sin
  nombrar el documento y sin corchete** (nombrarlo sin bracket rompe la otra regla del registro).

---

## Respuestas clínicas efímeras — `_indClin`

- **`var _indClin = Object.create(null)`** — donde viven las respuestas que el médico contesta en el
  panel (síntomas, riesgo quirúrgico, mecanismo de la IM…). **No es un campo del formulario y no
  puede serlo**: un `<input id>` lo barrería `guardarInforme` y las respuestas viajarían al Excel, al
  backup y al informe firmado.
- **`_indClinGet(k)`** — lectura con `hasOwnProperty`; `null` si no está.
- **`_indClinLimpiar()`** — reemplaza el objeto. Corre **al abrir y al cerrar**, no solo al cerrar.
- **`_indClinVaciar()`** — el envoltorio global para «Nuevo estudio» (ver arriba).
- **`_indClinCablear()` / `_indClinCableado`** — un **único** oyente delegado sobre
  `#indic-cuerpo`, nunca `onclick` inline (en un atributo de evento el escape no protege, y
  `indicRender` reescribe el `innerHTML` entero). Rama de la cita (`[data-ind-ref]`) primero y con
  `return`; después la de respuesta (`[data-ind-clin]` + `data-ind-val`); un segundo toque sobre la
  opción activa la desmarca. Un `keydown` hermano cubre Enter/Espacio sobre el corchete, que siendo
  `role="button"` no dispara `click` solo.

---

## Lectores y guardas

- **`_indFn(nombre)`** — devuelve `window[nombre]` **solo si es función**, si no `null`. Es como el
  panel cruza bloques `<script>`: `vmEsProtesis`, `avaEsSevera`, `getBSA`, `wilkinsScore`,
  `emContValido`, `_labRango`, `emBandaPlaus`… Una llamada pelada a una función de otro bloque
  revienta la sección. Comprueba que **exista**, no que acierte.
- **`_indUmb(nombre)`** — igual para un umbral numérico, **sin literal de respaldo**: si la
  constante no está, la fila dice «umbral no disponible» (regla 4, fallar cerrado).
- **`_ge` `_le` `_gt` `_lt`** — devuelven `false` si falta cualquier operando. Regla 3:
  `null <= 1.0` es `true` en JavaScript y eso encendía estenosis aórtica severa sobre un
  formulario en blanco. **No reemplazar por `a >= b` suelto.**
- **`_indBanda(k)` / `_indLeer(id, k)`** — banda de plausibilidad de un campo y su lectura. Una banda
  es un rango de lo medible, no un criterio: **va sin cita**.
- **`_indMecanismoHTML`** — la pregunta del mecanismo de la IM, arriba de todo y fuera del
  `if/else` de `indicRender`: su respuesta decide qué tarjeta mitral gobierna.
- Menores: `_indLista`/`_indCrit`, `_indN`/`_indS`/`_indChk` (campo del formulario con guarda sobre
  `v`/`sv`), `_indNum`, `_indOrigenAssert`, `_indLeyendaHTML` (las cinco marcas + el reparo de que
  `[n]` numera por sección).

---

## Cómo agregar una cita nueva a una sección

Ejemplo concreto: **agregar una cita a Estenosis mitral**.

1. **¿El documento ya está registrado?** `grep -n "const IND_REFS" index.html` y mirá las claves. Si
   ya existe —`esc2025vc`, `wilkins1988`, `eaeAseEst2009`, `ahaVc2020`…— saltá al paso 3.
2. **Si no está, agregá la entrada a `IND_REFS`, AL FINAL de la lista.** Dos campos y nada más:
   `{ k:'claveNueva', full:'autores. título. revista año;vol(nro):pp. doi:… Tabla N, p. X.' }`. La
   clave tiene que ser única (una repetida grita por consola y publica el último duplicado), y el
   `full` solo lleva lo que se leyó en texto completo — **no se completa de memoria**.
3. **Elegí el punto de cita dentro de la sección.** La función es `_indEM`
   (`grep -n "function _indEM" index.html`). Cuatro lugares posibles:
   - **una fila de la tabla** → último argumento de `_indFila(...)`, el array `refs`:
     `refs:['esc2025vc','wilkins1988']`. **La fila necesita `nota`**, si no el corchete no se pinta.
   - **el criterio visible** → el objeto `guia:{ ref:'esc2025vc', txt:'…', nota:'…' }` del `return`
     de `_indEM`. Acá es **`ref` en singular**, un string.
   - **una nota del detalle** → en el array `notas` del `return`, forma objeto:
     `{ txt:'…', refs:['esc2025vc'] }`.
   - **la recomendación** → en `_indEMRecom`, los campos `fuente` y `ref` del objeto devuelto (hoy
     `fuente:EM_FUENTE, ref:EM_REF`), o los del slot `mod`. `fuente` sin `ref` sale en rojo.
4. **No escribas el corchete.** Nunca `[2]` a mano en un `txt`: lo asigna `_indRefNum` por orden de
   primera aparición, y un literal se desincroniza en la primera rama nueva. Si la sección cita
   varios documentos, que ese orden sea **estable entre ramas** (`_indProtM` es el modelo: la ASE
   solo en las filas, la ESC desde el primer control clínico, la ACC/AHA recién en la recomendación).
5. **La clase y el nivel** van **dentro del `txt`** con el formato `Clase I · Nivel B` (el nivel es
   opcional) o en el campo `clase` de la recomendación — **nunca** en `IND_REFS`.
6. **Verificá.** El re-render es `indicRender()` (o `_indRepintarConservando(null, null)` con el
   panel abierto); cerrar y reabrir con `indicAbrir` alcanza. Mirá que el corchete salga **azul** y
   no rojo, que el «ⓘ Bibliografía de esta sección» de **esa** sección liste la entrada con su
   número, y que el clic la abra y la marque. Ojo con el denominador: una sección que no aplica
   devuelve `null` y no pinta nada — confirmá que está en pantalla antes de decir que falta la cita.
7. Si la fuente **desmiente** lo que la app dice: no se corrige. Se reporta y se espera; el texto
   que la fuente niega queda **sin corchete**.

---

## Cómo agregar una sección nueva

1. **Escribí la función** `_indXX()` con el patrón de las que ya están. Devuelve `null` cuando la
   sección no aplica (ésa es la compuerta: `indicRender` la saltea sin ruido) o el objeto
   `{ filas, clinica?, recom?, aviso?, guia, notas? }` descrito arriba.
2. **Armá las filas con los helpers**: `_indFila`, `_indSinUmbral`, `_indFilaCtrl`,
   `_indFilaOrigen`. Las cinco `marca` posibles son `ok`, `alarm`, `warn`, `ask`, `none`.
3. **No reimplementes ninguna regla clínica** (regla 2): cada umbral con `_indUmb` y cada función
   de severidad con `_indFn`, desde la constante que ya gobierna el informe firmado. Un número a
   mano acá es una segunda copia que se pudre sin que se vea.
4. **Compará contra `null` con `_ge`/`_le`/`_gt`/`_lt`** (regla 3).
5. **Registrá la sección en `IND_SECS`**: `{ tit:'Título visible', fn:_indXX }`. El título tiene
   que ser **único** — es la clave de `_indRepintarConservando`. La posición es el orden en
   pantalla; ponela donde el médico la va a buscar.
6. **No agregues una compuerta aparte para el botón.** `indicHayCriterios` corre las mismas
   `IND_SECS`: devolver `null` ya alcanza.
7. **Citá por clave**, nunca por número, y que todo el pintado pase por `_indSecHTML` — llamar a
   `_indGuiaHTML`/`_indRecomHTML` por fuera da «[cita fuera de sección]».
8. **No agregues estado.** Una respuesta del médico va por `_indFilaCtrl` + `_indClin`, nunca por
   un `<input id>` del formulario.
9. **Verificá las dos ramas**: el escenario donde aplica y uno donde devuelve `null` (control
   negativo), y que el acordeón se abra solo con `ok`, `alarm`, `aviso` o un `recom` `ind`/`alarma`.

---

## No confirmado

- **El HTML final del corchete** — ⚠️ no verificado: se leyó su consumo (`_indClinCablear`,
  `_indRefAbrir`) y su emisión (`_indRefMarca`), pero no el `<span role="button" data-ind-ref=…>`
  ni su `tabindex`.
- **`_indIMS`** no tiene `IMS_FUENTE`/`IMS_REF` propias como sus hermanas — ⚠️ no verificado: por
  qué camino cita sus tres documentos.
- **`_indFilaOrigen`, `_indCtrlHTML`, `_indBanda`, `_indLeer`** — ⚠️ no verificado: descritos por
  su firma y por los comentarios vecinos; sus cuerpos no se leyeron.
- **TC-282, TC-322, TC-327 y TC-328 existen** en `scripts/test_clinico.mjs` (un `caso()` cada uno,
  verificado por grep el 2026-10-01). Lo que NO se verificó es qué cubre cada uno.

---

## ⚠️ La tanda J movió esto (2026-10-24) — el mapa está en otro archivo

El colapso de la aurícula derecha pasó a ser **diastólico** con su duración (`dpt_col_ad_dur`,
corte `DPT_COL_AD_DUR_SIG` = 0,34), la plétora de VCI del pericardio bajó a **>20 mm**
(`DPT_VCI_PLETORA_MM`), la constricción perdió el aviso de confirmación invasiva y ganó el
cociente de la vena suprahepática (`cvr_hep_coc`, `CVR_HEP_COC_MIN` = 0,78), VEXUS pasó a usar los
**dos** operadores del artículo (`VEXUS_VCI_MM`, con `≥` para el grado 1 y `>` para el 2 y el 3) y
perdió sus frases de conducta, y entraron **tres Evidencias nuevas** más la ficha de Referencias
de constricción.

**Todo eso está en `docs/mapa/j-pericardio-constriccion-vexus.md`.** Acá no se repite.
