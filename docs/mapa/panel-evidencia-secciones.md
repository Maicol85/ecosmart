# Mapa — el panel de Evidencia, una sección por dentro

> **Salió de `panel-evidencia.md` el 31/10/2026 (tanda AJUSTES-3, commit 5).** Ese mapa estaba
> en **34,5 KB**, a menos de 500 bytes del techo de ~35 KB que `ecosmart/CLAUDE.md` fija, y
> `TGA2-g` lo dejó declarado. Lo que se movió acá es **todo lo que describe UNA sección**: qué
> devuelve, cómo se dibujan su criterio y sus recomendaciones, el catálogo de `IND_SECS`, sus
> sub-bloques, dónde viven las respuestas clínicas, quién la lee, y los dos procedimientos para
> escribir una cita o una sección nuevas.
>
> **Cero líneas perdidas**: el bloque se movió entero, byte por byte, verificado contra el
> archivo anterior. En `panel-evidencia.md` quedan el mecanismo general —entradas, ciclo de vida,
> el marco, las preguntas— y los punteros de cada tanda.
>
> Para el **registro de citas** (`IND_REFS`, el marcador `ecosmart`, la numeración por sección):
> `docs/mapa/panel-evidencia-citas.md`. Para el **glosario** del ⓘ de un término:
> `docs/mapa/panel-evidencia-terminos.md`.


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
