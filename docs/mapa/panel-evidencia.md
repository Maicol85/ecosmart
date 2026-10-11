<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->

# Mapa de funciones — Panel de Evidencia

Panel «Evidencia según guías» (`#indic-overlay`).

Se llama **Evidencia** en pantalla pero los identificadores siguen siendo `indic-*` / `_ind*` /
`IND_*`, deliberado según su cabecera. **No renombrar por substring:** `campos['indicaciones']`,
`lab-acc-indicaciones` y `data-ppt="indicaciones"` son otras tres cosas. Y el panel **no sale del
informe**: ni el narrativo, ni el PDF, ni el PPT, ni el Excel lo leen.

---

## Entradas y ciclo de vida

- **`indicAbrir`** — única puerta por la que el panel se ve: `_indClinLimpiar()`, `indicRender()`,
  `_indClinCablear()`, y recién ahí `display:'block'` en `#indic-overlay`.
- **`indicCerrar`** — `_indClinLimpiar()` + oculta el overlay. Lo llama el `keydown` global de Escape.
- **`indicRender`** — recorre `IND_SECS`, llama a `s.fn()` en un `try` por sección, pinta con
  `_indSecHTML(s.tit, r)`, antepone `_indLeyendaHTML()` y `_indMecanismoHTML()`, y asigna
  `#indic-cuerpo.innerHTML`. Una sección que lanza se cuenta en `fallos`, grita por `console.error`
  con su título y se declara al pie; no se lleva el panel. Sin ninguna, pinta «Sin criterios de
  intervención detectados…». **No recolecta claves de cita**: sería un segundo dueño de la numeración.
- **`indicHayCriterios` / `indicSyncBoton` / `_indSyncDebounced`** — visibilidad de `#indic-btn`.
  Corren las **mismas** `IND_SECS` y fallan hacia visible. Debounce de 400 ms sobre
  `input`/`change` en captura.
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
la sección) · `data-ind-biblio` · `data-ind-bloque` · `data-ind-info`. Todas por **atributo** y
ninguna por rótulo: el rótulo es prosa —o un glifo— y renombrarlo apagaría la distinción en
silencio. TC-293 cuenta «un control de detalle por sección» sobre `details details` y excluye las
otras tres; sin la de los ⓘ daba **37 donde hay 8**, y dos rótulos donde va uno.

---

## Registro de referencias — `IND_REFS`

`const IND_REFS = Object.freeze([ … ])`. Cada entrada tiene **exactamente dos campos**:

```js
{ k:'esc2025vc',
  full:'ESC/EACTS 2025 — … Eur Heart J 2025;46(44):4635-4736. doi:… Páginas de revista: …' }
```

- `k` — clave corta y única. Es por lo que citan las secciones.
- `full` — el texto completo tal como se publica en la bibliografía: autores, título, revista, año,
  volumen, páginas, DOI, y la **tabla y página** cuando la hay.

No hay más campos. **La clase y el nivel NO viven acá**: son propiedad de la recomendación, no del
documento (seis secciones citan la ESC/EACTS 2025 con clases distintas).

Claves registradas hoy: `esc2025vc`, `esc2020guch`, `escGuchCiv`, `esc2023mioc`, `esc2024ao`,
`fop2019`, `aseProtAo`, `ecosmart`, `aseVr2017`, `ahaVc2020`, `eaeAseEst2009`, `wilkins1988`,
`aseProtM2024`, `ahaProtM2020`, `asePandian2023`.

Reglas declaradas en su propia cabecera: **las entradas nuevas van al final** (el orden de la lista
es el orden histórico de los números); la bibliografía lista **solo lo que se citó en ese pintado**
—una entrada numerada sin corchete que la invoque se lee como «hay una cita que no encontrás», caso
real `aseProtAo`—; y en `full` va lo que la app **ya puede sostener**: donde falta autor o páginas es
porque no se verificaron, y no se completan de memoria.

### El marcador `ecosmart`

Es una entrada de `IND_REFS` como las otras (`k:'ecosmart'`) y su `full` es «Criterio EcoSmart:
decisión clínica de la aplicación cuando la evidencia no ofrece un único corte aplicable.».
**No cuenta como bibliografía de guía**: marca una decisión propia de la app. Hoy no lo usa ningún
`guia:` —las secciones afirman recomendaciones de documentos— y se cita solo desde `refs:` de notas.
**Quiénes lo citan hoy (censado por `grep` el 2026-10-11): `_indIM` e `_indIA`**, dos notas en cada
una. ⚠️ **La estenosis mitral DEJÓ de citarlo** en esa fecha: su único uso era la nota que declaraba
el «2 o más» de `EM_CRIT_2025.clin_desfav_min`, y esa constante se eliminó con el veredicto único —
el panel ya no decide cuántas características desfavorables son «varias». La entrada **no quedó
huérfana** en el registro, y eso se verificó antes de sacarla: una entrada numerada que nadie
invoca se lee como «hay una cita que no encontrás», que es el caso real de `aseProtAo`.

### `IND_REF_IDX` — allowlist, no numeración

`const IND_REF_IDX = (función inmediata que recorre IND_REFS y guarda m[r.k] = i + 1)`.

**Ya no da el número de la cita.** Confirmado: sus dos únicos consumidores son
- `_indRefValida(k)` → `hasOwnProperty.call(IND_REF_IDX, k)`, o sea «¿la clave está registrada?»; y
- `_indRefDoc(k)` → usa el `i + 1` solo para indexar `IND_REFS[i - 1]` y devolver el objeto de la
  referencia (evita un segundo mapa clave→objeto en paralelo).

El número publicado lo asigna `_indRefNum`. Una `k` duplicada es la única discrepancia que la
construcción no impide: el `forEach` se queda con la **última** y grita por `console.error` al
arrancar; `_indBiblioHTML` repone la señal visible con «[clave repetida en el registro…]».

---

## Numeración por sección

Decisión de Maicol del 2026-09-29: **cada sección lleva su numeración, arranca en `[1]`, y su propia
bibliografía al pie**, por orden de primera aparición dentro de esa sección. Lo que se pierde, y
está declarado: el número ya no identifica al documento entre secciones — dos secciones que citen la
ESC/EACTS 2025 muestran las dos un `[1]`, y son entradas distintas.

Un solo dueño del acumulador: **`_indRefCtx`**.

| Identificador | Rol |
|---|---|
| `var _indRefCtx` | El acumulador de la sección que se pinta, o `null` fuera de un pintado. |
| `_indRefCtxNuevo()` | `{ orden:[], num:Object.create(null) }` — orden de primera aparición y número de cada clave. |
| `_indSecHTML(tit, r)` | **Abre** el contexto (guardando el anterior en `prev`) y lo repone en un `finally`, delegando el cuerpo a `_indSecHTMLCuerpo`. Única puerta: sin pasar por acá los corchetes salen «[cita fuera de sección]». |
| `_indRefNum(k)` | **Lo único que ASIGNA.** Clave válida y contexto abierto → la empuja a `ctx.orden` y le da `ctx.orden.length`. |
| `_indRefValida(k)` | Allowlist contra `IND_REF_IDX`. Partición obligatoria: `_indRefAbrir` valida desde un clic, fuera de todo pintado, donde `_indRefNum` daría `null`. |
| `_indRefDoc(k)` | El objeto de `IND_REFS` para esa clave. |
| `_indRefMarca(k)` | Pinta el corchete, un `[data-ind-ref]` con `role="button"` (declarado: no llega a los 44 px táctiles). Dos errores separados: «[referencia no registrada]» (clave mal escrita) y «[cita fuera de sección]» (cableado: se llamó a `_indGuiaHTML`/`_indRecomHTML` sin pasar por `_indSecHTML`). |
| `_indBiblioHTML(ctx)` | **Solo LEE.** Recorre `ctx.orden` —ya ascendente por construcción— y publica `<b>[n]</b> ` + el `full`, en un `<details data-ind-biblio>` que **nace colapsado**. Nunca llama a `_indRefNum`. |
| `_indRefAbrir(c, k, desde)` | Abre la bibliografía y marca su entrada (`[data-ind-refitem]`). La clave se valida **antes** del `querySelector`: saneo en el borde. |

En `_indSecHTMLCuerpo` el `_indBiblioHTML(_indRefCtx)` va **última** (el acumulador se puebla al
pintar) y **dentro** del `<div>` del cuerpo, o sea como hija del `<details>` de la sección — eso le
da clave única en `_indRepintarConservando`.

Dentro de una sección el número **puede moverse con el paciente**. El ejemplo que este mapa daba
—`wilkins1988` como `[2]` con score desfavorable y `[5]` si no— **ya no vale**: desde el 2026-10-11
la fila del score **no cita a Wilkins** (la guía remite a su Table S3 suplementaria, que no está en
la biblioteca, así que el corte va «según la guía» y sin atribución), y la clave aparece sólo en la
nota de guías previas, que es siempre la penúltima. El mecanismo sigue siendo el mismo —primera
aparición dentro de la sección— y lo que se mueve con el paciente hoy es la **presencia** de
`asePandian2023`, que se cita **sólo con etiología reumática**. Lo fijan TC-322, TC-327 y TC-328.

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
