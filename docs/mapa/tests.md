<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->
# Mapa — suite de tests y arneses de verificación

Todo lo versionado vive en cuatro archivos: `scripts/test_clinico.mjs` (la suite clínica),
`scripts/check_mobile.js`, `scripts/detectar_huerfanos.py` y `scripts/sellar_version.py`.
No hay nada más en `scripts/` al 2026-10-01 (`git ls-files` lo confirma). Los fixtures de datos
están en `tests/` (JSON de casos ficticios y `tests/regresion.json`, el procedimiento manual).

---

## `scripts/test_clinico.mjs`

### Cómo está organizado

Un solo módulo ESM, sin dependencias. Tres partes en este orden:

1. **Infraestructura** — servidor estático, arranque de Chrome, cliente CDP y el `PRELUDIO`
   (el objeto `window.__t` que se inyecta en la página).
2. **Los casos** — llamadas sucesivas a `caso(...)` agrupadas por tema con cabeceras
   `// ═══ GRUPO n — … ═══`, intercaladas con constantes de fixture y comentarios largos que
   explican por qué cada caso mide lo que mide.
3. **`evaluar(r)` y el main** — la evaluación del objeto que devuelve un caso, y el bucle que
   recorre `CASOS`.

Un caso se registra con tres argumentos:

```js
const CASOS = [];
const caso = (id, nombre, fn) => CASOS.push({ id, nombre, fn });
```

- **`id`** — `'TC-NNN'` (`TC-01` … `TC-3NN`), string.
- **`nombre`** — la frase que se imprime en el reporte; en los casos nuevos es larga y describe
  cada invariante que el caso defiende.
- **`fn`** — **un string**, escrito como template literal, con el cuerpo JavaScript que se
  evalúa **dentro de la página**. No es una función de Node: el runner lo manda por CDP.

Existe además `casoAbierto(id, nombre, motivo, fn)` para defectos abiertos (xfail): fallan a
propósito, se listan con `⊘` y **no** tiñen el resultado; si alguna vez pasan, se listan con `▲`
y el runner sale con 1 para obligar a promoverlos a `caso()`. Al 5137c30 **no hay ningún caso
registrado con `casoAbierto`** — la única mención en el archivo es su definición y el texto del
reporte.

### Cómo se conecta al Chrome del sistema (CDP)

No usa Playwright ni Puppeteer: habla CDP a mano contra el Chrome que ya está instalado.

- **`servir()`** levanta un `node:http` en `127.0.0.1` con puerto `0` (el SO elige) y sirve la
  raíz del repo con un mapa MIME mínimo, rechazando rutas fuera de la raíz. `file://` no sirve:
  con origen opaco la app no tiene `localStorage` ni IndexedDB.
- **`abrirChrome(url)`** busca el binario en una lista fija (Google Chrome, Chromium y Edge en
  `/Applications`, y `google-chrome`/`chromium`/`chromium-browser` en `/usr/bin`), lo lanza con
  `--remote-debugging-port=0`, un `--user-data-dir` temporal recién creado, `--no-first-run`,
  `--no-default-browser-check` y `--disable-extensions`. Agrega `--headless=new` **salvo** que se
  haya pasado `--ver`. El puerto real sale por **stderr**, en la línea «DevTools listening on
  ws://…», y de ahí se lee con un regex y un timeout de 20 s.
- **`conectar(wsUrl)`** usa el `WebSocket` **nativo** de Node (de ahí el «cero dependencias») y
  devuelve un `send(method, params, sessionId)` que resuelve por id de mensaje.
- El main hace `Target.getTargets` → `Target.attachToTarget` con `flatten: true` →
  `Runtime.enable` y `Page.enable`. El helper `ev(expr)` envuelve la expresión en una IIFE y
  llama `Runtime.evaluate` con `returnByValue: true` y `awaitPromise: true`, así que **un cuerpo
  de caso puede devolver una promesa** (el patrón `return (async () => { … })();` es el habitual).
- **Arranque de la app**: la pantalla de login se saltea poniendo `sessionStorage.ett_auth='1'` y
  recargando; después espera hasta 60 intentos de 250 ms a que exista `generarInforme` y
  `#informe_texto`. Recién entonces inyecta el `PRELUDIO` y cierra el aviso médico-legal con
  `cerrarAvisoEco()`, que si no tapa la pantalla y se come los `click()`.
- **Los 300+ casos corren en UNA sola página.** Por eso el runner llama `__t.resetVisor()`
  **antes de cada caso** — el aislamiento vive en el harness, no en cada caso.
- Al final cierra el WebSocket, cierra el servidor, mata el Chrome y borra el perfil temporal.
  `process.exitCode` es 0 si todo pasa, 1 si hay rojos o xfail arreglados, y 2 si el harness
  mismo falló.

### Qué tiene que devolver un caso (contrato de `evaluar`)

El cuerpo devuelve **un objeto**. `evaluar(r)` lo lee así:

| clave | qué hace |
|---|---|
| `inf` / `suma` | el texto del informe narrativo y del EN SUMA, sobre los que se aplican las cuatro claves de abajo |
| `debe` / `noDebe` | arrays de substrings que el **informe** debe / no debe contener |
| `debeSuma` / `noSuma` | lo mismo sobre el **EN SUMA** |
| `valor` + `esperado` / `noEsperado` | comparación de un valor suelto; **numérica** si los dos lados parsean como número (así «36» y «36.0» no dan rojo por formato) |
| `extra` | array de `[descripción, booleano, diagnóstico]`. El tercer elemento se imprime cuando la condición falla |

**Un caso que no declara ninguna condición falla.** `evaluar` lo verifica explícitamente: si no
hay `debe`/`noDebe`/`debeSuma`/`noSuma`/`extra` con elementos ni `esperado`/`noEsperado`
definidos, agrega el fallo «el caso no declara NINGUNA condicion». Está ahí porque hubo un caso
que escribió las condiciones como **cuarto** argumento de `caso()` —que solo toma tres— y pasó
en verde incluso sobre un mutante.

### Helpers disponibles dentro de un caso (`window.__t`)

Se inyectan con el `PRELUDIO`. Los que devuelven algo devuelven **`1` si salió bien** o un string
con el motivo (`'NO EXISTE <id>'`), que se usa como diagnóstico en una condición `extra`.

| helper | firma real | qué hace |
|---|---|---|
| `set` | `set(id, val)` | asigna `.value` y **despacha `input` y `change`** con `bubbles: true`. Asignar `.value` no dispara ningún evento: es la trampa número uno de esta app. Devuelve `1` o `'NO EXISTE '+id` |
| `chk` | `chk(id, on)` | checkbox: `.checked = on !== false` y los mismos dos eventos. Los «Integrar al informe» del ETE y de congénitas son compuertas: sin tildar, el párrafo no sale |
| `limpiar` | `limpiar()` | `limpiarCampos(true)` y borra `co_seguimiento` de `localStorage`. Sin valor de retorno |
| `nuevoEstudio` | `nuevoEstudio()` | lo mismo que `limpiar()`: llama `limpiarCampos(true)` directo, sin pasar por el modal de confirmación |
| `informe` | `informe()` | corre `generarInforme()` y devuelve `{ inf, suma }` leyendo `#informe_texto` y `#en_suma` |
| `val` | `val(id)` | `.value` del elemento, o `null` si no existe |
| `txt` | `txt(id)` | `.textContent` del elemento (o `''`), o `null` si no existe |
| `guardar` | `guardar()` → `Promise<{ok, estudioId}>` | guarda por la función **real** `guardarInforme`. Pone `window._ettEditandoId = null` (si no sale el modal «sobreescribir / guardar como nuevo»), fotografía los `estudioId` previos, y **clickea `#rev-confirm`** para confirmar la card de severidades valvulares, que es donde ocurre el guardado real. Devuelve `{ok:false, error}` si tira. Es asíncrono porque abajo hay IndexedDB con respaldo en `localStorage`. ⚠️ `guardarInforme` **exige nombre o documento**: sin eso hace toast y devuelve false, y el caso falla por un motivo que no es el que prueba |
| `reabrir` | `reabrir(estudioId)` | `cargarEstudioPorId(estudioId)` — el viaje completo, no el store |
| `borrar` | `borrar(estudioId)` → `Promise` | reescribe la lista sin ese estudio vía `CeiboStore.setLocal`. **Cada caso borra lo que guardó**: un estudio que sobrevive cambia el denominador de los casos posteriores |
| `herr` | `herr(id, pfx)` | abre el grupo colapsable del visor que corresponde (`2d`, `dop` o `def`) y después clickea el botón. Sin esto, los botones de Doppler y Deformación **no están en el DOM** y el caso revienta con «null.click» |
| `strVista` | `strVista(k)` | marca el loop como elegido y llama `medStrainElegirVista(k \|\| 'a4c')` |
| `anchoDesktop` | `anchoDesktop()` | fuerza `#cine-paneles` a `flex-direction: row` con `setProperty(..., 'important')` en línea — el harness corre en ~756 px, donde el visor muestra una sola vista |
| `resetVisor` | `resetVisor()` | **lo llama el runner entre casos, no los casos.** Cierra vista B, cineloop, el modal de import de Excel y el aviso legal; limpia las sesiones de medición de todas las vistas; apaga las mediciones; y deja `ett_deformacion='1'` para que los botones de deformación existan |
| `pptSel` / `pptTodo` | `pptSel(claves)` / `pptTodo()` | escriben las casillas «☐ PPT» del Laboratorio en `localStorage` (`ecosmart_lab_ppt_chk`); `pptTodo()` marca las catorce |

### Los `EVID_*` — fixtures del panel de Evidencia

No son funciones: son **constantes de módulo que contienen código fuente** y se interpolan con
`${}` dentro del cuerpo de un caso. Las consumen `TC-273` y `TC-274`.

- **`EVID_DATOS`** — objeto literal con las **trece** secciones del panel (`EA`, `IM`, `EM`, `IA`,
  `VT`, `EP`, `CIA`, `CIV`, `DAP`, `CoAo`, `FOP`, `MCH`, `VAB`), cada una con el mapa
  `{ idDelCampo: valor }` **más chico que cruza su compuerta**. No es un paciente plausible a
  propósito.
- **`EVID_FNS`** — mapa sección → nombre de la función del panel (`EA:'_indEA'`, `IM:'_indIM'`, …);
  se resuelve como `window[nombre]`.
- **`EVID_LIMPIAR`** — array **explícito** de ids a vaciar. Es explícito y no un
  `querySelectorAll` de inputs porque el panel lee campos de seis pestañas distintas y barrer el
  formulario entero rompería el aislamiento de los otros casos.

Dos cautelas que los propios casos documentan: un `<select>` **rechaza en silencio** un valor que
no sea una de sus opciones y deja el `value` vacío (pasó con `va_morf` sin tilde), así que hay que
comparar lo que quedó contra lo que se pidió; y la limpieza **declara los ids que no encontró**,
porque una guarda muda deja de limpiar un campo renombrado sin poner nada en rojo.

### Fixtures que leen del disco

Seis constantes de módulo se resuelven con `await` **antes** de que arranque el navegador y se
inyectan en los casos como JSON ya serializado: `CHM_REAL`, `DCM_REALES`, `PENDRIVE`, `DOPPLER`,
`FIJA_ESC` y `DOP_VEL`. Las cuatro últimas leen de `/Volumes/DISK_IMG` (override `ECO_PENDRIVE`);
`DCM_REALES` busca la base de Horos en `~/Documents` (`ECO_DCM_DIR`) y `CHM_REAL` un `.chm` del
Escritorio (`ECO_CHM`). Si la fuente no está, el fixture queda vacío y los casos que dependen de él
**lo dicen** en vez de pasar.

---

## Cómo agregar un caso

1. **Declararlo en `scripts/test_clinico.mjs`**, con una llamada `caso('TC-NNN', 'nombre', \`…\`)`
   al nivel superior del módulo (los casos están agrupados por tema; lo nuevo va junto a lo que
   mide algo parecido, no necesariamente al final).
2. **El id es `TC-` + número**, el siguiente libre. No se reutiliza un id retirado: los informes
   y el historial citan casos por id.
3. **El cuerpo es un template literal** que corre en la página. Dentro se usa `__t.*`, y se puede
   devolver una promesa con `return (async () => { … })();`.
4. **Tiene que devolver un objeto con al menos una condición** — `debe`/`noDebe`/`debeSuma`/
   `noSuma`, `valor` + `esperado`/`noEsperado`, o `extra: [[desc, ok, diag]]`. Si no declara
   ninguna, el runner lo marca en rojo (no en verde).
5. **Pasa cuando `evaluar` no junta ningún fallo**: todos los substrings de `debe`/`debeSuma`
   presentes, los de `noDebe`/`noSuma` ausentes, el valor igual al esperado y todos los booleanos
   de `extra` en `true`.
6. **Poner el diagnóstico en el tercer elemento de cada `extra`.** Sin eso, cada rojo obliga a
   montar una sonda aparte para ver el valor que el caso ya tenía en la mano.
7. **Incluir una condición de denominador** y, cuando aplique, un control negativo: una condición
   que pruebe que la sonda sabe decir «no» (ver Trampas).
8. **Dejar el estado como lo encontró**: lo que el caso guarda, lo borra con `__t.borrar`.
9. **Confirmar que el caso sabe fallar**: mutar en una **copia** el código que defiende y ver el
   caso en rojo.

---

## Cómo correr

Los flags están verificados contra el parseo de `process.argv` / `sys.argv` de cada script.

```bash
node scripts/test_clinico.mjs                 # suite completa
node scripts/test_clinico.mjs --solo TC-04    # un caso
node scripts/test_clinico.mjs --ver           # con el navegador a la vista (sin --headless)
node scripts/check_mobile.js                  # usabilidad midiendo la página en 360 y 390 px
python3 scripts/detectar_huerfanos.py         # campos que nadie nombra en el JS
python3 scripts/sellar_version.py             # ANTES de cada git add
```

- **`test_clinico.mjs`** — la suite clínica: corre los casos contra el Chrome del sistema por CDP
  y verifica informe narrativo, EN SUMA, cálculos, PDF, Excel, PPT, visor y DICOM.
  `--solo` **acepta una lista separada por comas** (`--solo TC-322,TC-324`), no solo un id.
  Sale 0 si pasan todos, 1 si hay rojos, 2 si el harness falló.
- **`check_mobile.js`** — mide la página renderizada en 360 y 390 px y reporta desbordes, targets
  táctiles <44×44, tablas anchas sin scroll, badges cortados, inputs bajos, lo que se sale del
  viewport y hermanos superpuestos, con el **selector CSS** de cada hallazgo. Es solo lectura.
  Flags reales: `--ancho N` (otro ancho), `--todo` (incluye severidad BAJA) y `--ver`.
  Sale 1 si hay hallazgos de severidad ALTA.
  ⚠️ **Abre todas las pestañas y secciones antes de medir**: lo que está en `display:none` no
  tiene geometría, así que un barrido sobre la app cerrada da cero y parece impecable.
- **`detectar_huerfanos.py`** — busca controles cuyo id no aparece nunca en el JS: el dato se
  carga, se guarda y no sale en ningún destino. Acepta una ruta posicional (`otra/app.html`, por
  defecto `index.html` del repo) y `--todos` para incluir los excluidos. Sale 1 si aparece un
  huérfano fuera de la lista conocida. Contesta «nadie lo nombra», no «no tiene destino»: la
  decisión final es humana.
- **`sellar_version.py`** — escribe `ECO_BUILD` y `ECO_BUILD_MS` en `index.html` y `version.json`
  desde el **mismo instante**, para que el pie no mienta sobre qué versión se está mirando.
  `--check` no escribe y sale 1 si el sello está desfasado respecto de la fecha de modificación
  de `index.html`.

---

## Arneses de A/B y de mutación

**No hay arnés de mutación versionado en `scripts/` al 2026-10-01; el procedimiento es manual
(copia del archivo, mutar la copia, md5 antes y después).** Lo mismo para el A/B contra HEAD: no
hay script versionado. `git ls-files` lista exactamente cuatro archivos bajo `scripts/`, y ninguno
muta ni compara.

Lo que sí existe son los **artefactos de corridas pasadas en `/tmp`** (`mut*.py`, `mut*.sh`,
`mut*.mjs`, `ab_*.json`, `ab_*.txt`, `/tmp/index.orig.html`). Son de un solo uso, no están
versionados y **desaparecen al reiniciar**: no son infraestructura, son el rastro de la sesión que
los escribió. Si hace falta un barrido nuevo, se vuelve a armar.

El procedimiento, tal como quedó escrito después del barrido del 2026-10-01 (31 corridas, 29 en
rojo, 2 declaradas rama inalcanzable):

1. **Correr la línea base primero.** Con casos ya rojos de entrada, todas las mutaciones salen
   «en rojo» sin que eso pruebe nada.
2. **Mutar en una copia**, nunca sobre `index.html` vivo, y comparar el md5 del snapshot contra el
   archivo vivo antes de aplicar; si no coinciden, **abortar** (un arnés que restaura desde un
   snapshot viejo es una máquina de deshacer ediciones en silencio).
3. **md5 antes, después y tras revertir**, en cada mutación.
4. **Puntuar solo si la salida trae `RESULTADO`** (ver Trampas).
5. Una mutación por cambio, y cada una tiene que caer en **la condición que le corresponde**, no
   en cualquiera.

---

## Trampas

Estas son las que cuestan sesiones enteras.

- **Acentos graves (backticks) en el cuerpo de un caso.** El cuerpo es un template literal: un
  backtick —**incluso dentro de un comentario**— cierra la cadena en la mitad y el archivo entero
  deja de parsear, con un `SyntaxError` que apunta a la línea del `caso(`, **decenas de líneas
  ANTES** del culpable. Para citar un identificador en un comentario del cuerpo, escribirlo
  pelado: `amiloTextoTEER`, no entre acentos graves. *Confirmado en el código: el comentario de
  `caso()` lo advierte en mayúsculas y dice que ya se pagó cuatro veces; el historial registra 169
  backticks acumulados removidos de cuerpos de caso.*
- **El scorer de mutaciones contaba «sin ✗» como "sobrevivió".** Si la suite no arranca, stdout
  queda vacío, no hay ningún `✗` y **todas** las mutaciones salen «sobrevivió» — indistinguible de
  «no hay cobertura». Reportó 7 falsos de una vez. **Exigir `RESULTADO` en la salida antes de
  puntuar; si no está, el veredicto es `NO CORRIÓ`.** *Confirmado a medias: `test_clinico.mjs`
  imprime la línea `RESULTADO: n/m` en los dos caminos (con y sin fallas), así que el chequeo es
  posible. El chequeo en sí vivía en el scorer, que no está versionado — ⚠️ no verificado: no hay
  código vigente donde confirmarlo.*
- **Procesos `cdp.mjs` que no salen.** `cdp.close()` + `proc.kill()` **no alcanzan**: el servidor
  HTTP sigue escuchando y el event loop vivo. Hay que cerrar el servidor y `process.exit(0)`. Se
  juntan zombies reteniendo su Chrome y un A/B encadenado nunca llega al segundo lado: parece
  lentitud, es un cuelgue. **Revisar `ps` antes de culpar al A/B** — y cuidado con el `pkill`, que
  se lleva la corrida en curso. *Regla del proyecto, no re-verificada en este pase: aplica a las
  sondas ad-hoc; `test_clinico.mjs` sí cierra el servidor y mata Chrome en su `finally`.*
- **El pendrive `DISK_IMG` fantasma.** Si se desmonta a mitad de corrida, `readdir` **sigue
  contestando de caché** y `readFile` revienta. Mientras el pendrive esté afuera, los casos que
  dependen de él **no prueban nada y no son cobertura**: hay que decirlo al reportar el total.
  *Confirmado en el código: cuatro fixtures leen `/Volumes/DISK_IMG` (override `ECO_PENDRIVE`) y
  el fixture `PENDRIVE` se interpola en 14 casos, más tres usos de `DOPPLER`, `FIJA_ESC` y
  `DOP_VEL`. La cifra de 17 casos que usa el proyecto es compatible con eso — ⚠️ no verificado: no
  conté caso por caso cuántos quedan realmente sin medir con el volumen desmontado.*
- **No medir en Chrome mientras corre un barrido de mutaciones.** Da una medición falsa y
  plausible: la sonda lee un árbol que otro proceso está reescribiendo. Antes de medir,
  `diff index.html /tmp/index.orig.html`.
- **Denominador.** Una sonda sobre una tabla colapsada, una lista sin paciente seleccionado o un
  `render()` que salió temprano devuelve cero y **parece seguro**. Confirmar que había algo que
  contar. *Confirmado en el código: varios casos traen condiciones rotuladas `DENOMINADOR:` y hay
  comentarios de casos que fijan su propio denominador por esta razón.*
- **Aislamiento: «pasa con `--solo` y falla en el suite».** Síntoma recurrente —los casos corren en
  una sola página— documentado más de media docena de veces en los comentarios del archivo. Si un
  caso verde aislado se cae en la suite, el sospechoso es el estado que dejó otro caso, no la app.
- **TC-223 es el único rojo documentado** de la suite: falla por la fecha. **Cualquier otro rojo es
  una regresión**, no «la línea base». Línea base del proyecto: **351/352** y Semgrep 125 / 0 ERROR.
  *Confirmado: `TC-223` existe y es el caso de importación de un estudio desde Orthanc. El total no
  lo re-verifiqué — `grep` cuenta 356 registros `caso('TC-…')` en el archivo a 5137c30 — ⚠️ no
  verificado: no corrí la suite en este pase, así que no sé si la diferencia con el 352 son casos
  agregados después de esa medición.*
