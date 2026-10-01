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
`guia:` —las secciones afirman recomendaciones de documentos— y se cita solo desde `refs:` de notas
(lo usan estenosis mitral e insuficiencia mitral secundaria).

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

Dentro de una sección el número **puede moverse con el paciente**: en estenosis mitral
`wilkins1988` es `[2]` con score desfavorable y `[5]` si no. Declarado; lo fijan TC-327 y TC-328.

---

## Qué devuelve una sección

Cada `fn` de `IND_SECS` devuelve `null` (la sección no aplica y no se pinta) o un objeto:

```js
{ filas:   [ … ],        // _indFila / _indFilaCtrl / _indFilaOrigen — obligatorio
  clinica: [ … ],        // opcional: «Requiere datos clínicos — no evaluable por ecocardiograma»
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
4. Estenosis mitral — `_indEM` · `_indEMRecom`, `EM_REC_2025`, `EM_FUENTE`, `EM_REF`, `EM_LBL_TROMBO`
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
