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

## Los dos juegos de helpers de válvulas, y por qué son dos

Desde el 2026-10-03 hay **dos** preámbulos para los casos de válvulas, y elegir mal el juego hace
que el caso mida otra cosa:

| Juego | Cómo fija la pastilla | Para qué sirve |
|---|---|---|
| `SINGRADO_HELPERS` (`_P`, `_G`, `_M`, `_escena`) | escribe la **clase** del botón y el `display` a mano; el grado por `.value` **sin** disparar `change` | «dado este ESTADO, qué dice el informe». Aísla el emisor de la UI |
| `APAGA_HELPERS` (`aOn`, `aVis`, `aAlto`, `aDen`, `aReset`, `aFoto`) | llama a `toggleValvPill`, a `valvSev.aplicar` y al `set` del desplegable | «quién MUEVE el botón». Es el único que puede medir una regla de gesto |

`SINGRADO_HELPERS` **no puede** medir la tanda de «Sin apaga el botón»: al escribir la clase
directamente se saltea la regla que se quiere probar. Al revés, `APAGA_HELPERS` no sirve para
pinear una frase sobre un estado imposible de alcanzar por la UI.

**`aDen()` es obligatorio en todo caso que mida geometría o visibilidad.** La pestaña Válvulas
arranca oculta y cada válvula vive en un acordeón propio `#ete-seccion-valv-<valv>` que gobierna
**`toggleEteSeccion`** (recibe el token sin el prefijo `ete-seccion-`) y **no** `secToggle`, que
construye `'sacc-' + id` y no resuelve. Y `limpiarCampos` saca la pestaña, así que el denominador
**se repone después de cada reset**, no una vez al principio. Armarlo mal cuesta corridas enteras:
la sonda de esta tanda midió «el bloque no se ve» en las 26 escenas tres veces seguidas, sobre la
app cerrada.

---

## Arneses de A/B y de mutación, y sus trampas → **archivo propio desde la tanda C2**

**`docs/mapa/arneses-ab-mutacion.md`** (2026-10-28).

Ahí viven: los arneses de A/B (`_probe_*ab.mjs`, `_ab_*diff.mjs`) y de mutación (`_mut_*.py`), cómo
se corren, el guard de md5 sobre el árbol vivo, y **las trampas de instrumentación** —el scorer que
contaba «sin ✗» como «sobrevivió», el pendrive `DISK_IMG` fantasma, los procesos `cdp.mjs` que no
salen, leer `index.html` con una mutación aplicada, el espía del PPT que sólo miraba `addText`, y
las demás—.

⚠️ **Se partió porque este mapa quedó a 246 bytes del techo de 35 KB**, no porque los arneses sean
otra cosa: son la verificación de esta misma suite, y un caso nuevo se escribe leyendo los dos.

## Fichas de cada tanda

⚠️ **ESTE ARCHIVO CRUZÓ LOS 35 KB EL 2026-10-16** al agregarle la ficha de TC-485, así que se
partió por zona: **las fichas por tanda viven en `docs/mapa/tests-fichas.md`** y acá queda el
mecanismo. Medido con `wc -c` DESPUÉS de escribir, que es lo que la regla pide hacer ANTES —es la
tercera vez que este repo lo paga—.

Están ahí: **TC-481**, **TC-482** (las dos tandas del 2026-10-15 por la tarde) y **TC-485** (la
tanda «Y3» del 2026-10-16, con sus ocho bloques, sus 42 condiciones en rojo contra HEAD y el
porqué de cada centinela).

---

## ⚠️ El caso de la tanda J (2026-10-24)

**TC-532** cubre el pericardio y el taponamiento, la constricción y VEXUS de esa tanda. Su ficha
—qué afirma cada bloque, los cuatro denominadores, los cuatro controles negativos y las tres
trampas que el caso ya pagó— está en **`docs/mapa/tests-fichas-532.md`**, en archivo propio
porque `tests-fichas.md` está a 800 bytes del techo de 35 KB.
Las mutaciones dirigidas que lo hacen fallar viven en **`scripts/_mut_j.py`**.

---

## TC-533 — la tanda «J2» (2026-10-24)

**63 condiciones.** Cubre los siete commits: los tres globos ⓘ de hemodinámica y los bordes del
índice cardíaco; la RVS como número pelado; las dos ramas de RVS baja; las tres Evidencias nuevas;
cardio-oncología sin los plazos sin fuente y con el seguimiento tras radioterapia alineado; el
score de amiloidosis de 0 a 10; el cuestionario de los cuatro escenarios; la ficha de eco pulmonar;
los bloques integrados; guardar y «Nuevo estudio»; y los controles.

**Sabe fallar por los dos caminos:**
- contra el HEAD de la tanda (`74665ca`, worktree aparte): **43 condiciones en rojo**, **ninguna
  por excepción**;
- por mutación dirigida: `scripts/_mut_j2.py`, **17 mutaciones**, una por cada cosa que la tanda
  cambió.

El arnés **exige la línea `RESULTADO`**: sin ella el veredicto es `NO CORRIÓ`, no «sobrevivió».
Nunca muta el archivo vivo y verifica el `md5` al restaurar.

⚠️ **LO QUE TC-533 NO MIDE, Y ESTÁ DECLARADO EN UNA CONDICIÓN PROPIA**: la geometría de las media
queries. Su ventana abre por debajo de 1100 px y el arnés corre por encima. Lo cubren
`scripts/check_mobile.js` y las capturas de `scripts/_probe_hcae.mjs`. Ver PENDIENTES → **J2-e**.

El relato completo vive en **`docs/mapa/j2-hemo-onco-amiloide-pulmon.md`**.

---

## ➜ TC-534 — la tanda «G» (posoperatorio, 2026-10-24)

63 condiciones en doce grupos. **Sabe fallar por los dos caminos**: contra el HEAD de la tanda,
**63 en rojo y ninguna por excepción**; por mutación dirigida, **25/25 muertas**
(`scripts/_mut_g.py`). Siete casos adaptados: TC-168, TC-169, TC-253, TC-322, TC-502, TC-507,
TC-509 y TC-533. La ficha del caso y sus ocho trampas de instrumentación:
**`docs/mapa/g-posoperatorio.md`** §7 y §8.

---

## ⚠️ TC-535 — la tanda AJ7 (24/10/2026)

Su ficha está en **`docs/mapa/tests-fichas-535.md`**, en archivo propio porque `tests-fichas.md`
estaba en 34,2 KB. El arnés de mutaciones es `scripts/_mut_aj7.py` y la sonda A/B de solo
lectura, `scripts/_probe_aj7.mjs`.

⚠️ **Y ESTA TANDA DESTAPÓ QUE EL DENOMINADOR DE LA SUITE NO ERA 534.** Son **549**: `TC-1` a
`TC-534` —sin huecos ni duplicados— **más quince `TC-GR-01` a `TC-GR-15`**. Los lotes de la
tanda G enumeraron sólo los numerados, así que **quince casos no se ejecutaron** y el total se
leyó como completo. Antes de armar lotes, contar:

```bash
grep -oE "^caso\('[^']+'" scripts/test_clinico.mjs | sort -u | wc -l
```

→ `PENDIENTES.md` **AJ7-f**.

---

## ⚠️ La tanda A movió textos de esta zona (2026-10-27)

No cambió ningún dato clínico. Movió notas de trabajo al globo ⓘ y a `docs/fuentes/FUENTES.md`,
dejó una sola cita al final de cada bloque, sacó las mayúsculas de en medio y dejó cada contenido
una sola vez por sección. **Lo que esta tanda hizo está en `docs/mapa/a-evidencia-textos.md`**, y
el caso que lo fija es **TC-537** (ficha en `docs/mapa/tests-fichas-537.md`).

## ⚠️ TC-538, de la tanda B (2026-10-27)

Los veintiséis espejos que siguen a su fuente sin tocar otro campo, S1 y S2, las siete
combinaciones de la PAM y cuatro controles negativos. **Ficha propia en
`docs/mapa/tests-fichas-538.md`** —`tests-fichas.md` ya estaba en 34,2 KB, medido antes—, con
las tres trampas que costó escribirlo y la tabla de las dieciséis mutaciones
(`scripts/_mut_b.py`).

⚠️ **Y LA TANDA B ENCONTRÓ UN DEFECTO EN EL ARNÉS DE A/B QUE VIENE DESDE `_probe_r2ab.mjs`.**
El montaje de escenas hacía `RECALC_MODULOS.forEach(...)`, y `RECALC_MODULOS` es una **función**:
tiraba `TypeError`, el `catch` lo tragaba y **el embudo de restauración nunca corría**. O sea que
varias tandas midieron su A/B sin pasar por el camino que reponen `editarInforme`, el QR, el
autoguardado y las dos reimpresiones. Corregido en `scripts/_probe_bab.mjs` a
`_recalcModulos('ab')`; **`_probe_aab.mjs` y `_probe_r2ab.mjs` siguen con el defecto**, y la
próxima tanda que los use conviene que lo arregle ahí también.

---

## TC-539 — la tanda E (27/10/2026)

Ficha completa en **`docs/mapa/tests-fichas-539.md`** (archivo propio: `tests-fichas.md` ya estaba
en 34,2 KB). Cuatro bloques —Carpentier, tricúspide, strain del VD y orejuela— con 8 denominadores
declarados. **13/13 mutaciones dirigidas muertas** (`scripts/_mut_e.py`), y cae contra HEAD en
**19** condiciones. Dos de sus condiciones (A11 y A12) **nacieron de mutaciones que
sobrevivieron**. Lo que el caso NO mide y se declara: la geometría de dos avisos, que vive en
`scripts/_probe_te.mjs` → `docs/PENDIENTES.md` **E-b**.

---

## ⚠️ TC-540 — la tanda D (2026-10-27)

Ficha en **`docs/mapa/tests-fichas-540.md`** (archivo propio: `tests-fichas.md` ya estaba en
34,2 KB). 31 condiciones, tres denominadores declarados y cinco controles negativos; cae en las
31 contra HEAD. Sus cinco trampas de arnés —los acentos graves del cuerpo, `VINFO` fuera de
`window`, el botón del globo midiendo 0 × 0, el disparador fabricado que tapaba el defecto de
limpieza, y la marca `hfaicos_manual` que sobrevive a `limpiar()`— están en esa ficha.

## ⚠️ TC-545 — la tanda C2 (2026-10-28)

Ficha en **`docs/mapa/tests-fichas-545.md`** (archivo propio: `tests-fichas.md` está en 34,2 KB).

Cinco bloques con su denominador cada uno, y **dos decisiones de método** que conviene leer antes
de escribir un caso que cense texto de pantalla: `document.body.textContent` **trae el código
fuente de los diecisiete `<script>` inline**, y un chequeo sobre un `toast` que el caso no dispara
no puede fallar nunca. Dieciséis mutaciones dirigidas, 16/16 muertas; **M12 sobrevivió al primer
barrido** y era un hueco real.


---

## Puntero — la tanda «TEP» (2026-10-29)

**TC-546** — 30 condiciones, seis denominadores y ocho controles negativos. Cae contra el árbol
anterior por **20 condiciones y ninguna por excepción**. Ficha y detalle en
**`docs/mapa/tep-aha2026.md`** §9.

**Arneses nuevos:** `scripts/_mut_tep.py` (14 mutaciones dirigidas, worktree, guarda de md5,
14/14 muertas en el primer barrido) y `scripts/_probe_tepg.mjs` (A/B de bordes, sólo lectura).

**Casos adaptados, con el motivo escrito en cada uno (DIEZ):** TC-168, TC-471, TC-500, TC-502,
TC-507, TC-510, TC-534, TC-535, TC-537 y TC-544. **Siete los destapó la corrida completa y no el
censo**, porque son conteos de inventario que no nombran nada de lo que la tanda tocó. Tabla en
`docs/mapa/tep-aha2026.md` §9.

⚠️ **TRES TRAMPAS NUEVAS**, en `docs/mapa/tep-aha2026.md` §8: `generarInforme()` cambia de pestaña
y deja los globos en 0×0; el filtro del informe de TEP tiene **dos ramas** y medir sólo la de
«criterios incompletos» da un denominador de cero; y el badge de la categoría A de HTP **agrega
varios signos**, así que un control que le pregunte a él pasa en verde sobre cualquier corte.

---

## El caso de la tanda AJ9 (2026-10-29) — puntero

**TC-547**, treinta y seis condiciones con cinco denominadores. Su ficha vive en archivo propio:
**`docs/mapa/tests-fichas-547.md`**.

Adaptados en la misma tanda, cada uno con su motivo escrito en el código: **TC-471** y
**TC-500** (el registro de globos, 62 → 65), **TC-502** (el censo de Referencias 35 → 36, el
reparto de Función 3 → 4, el índice del buscador 33 → 34 y el mapeo de tarjetas 41 → 44),
**TC-509** (el mismo censo) y **TC-535** (los globos de 44×44, ocho → once, **y su método**).

⚠️ **EL MÉTODO DE TC-535 CAMBIÓ, NO SÓLO EL NÚMERO.** `.sacc-body` abre con `max-height` y una
transición de 0,3 s: medir en el acto lee la caja de mitad de la animación y los hijos informan
un rect que se superpone con el encabezado de su propia sección. Hoy el arnés abre la sección
**y le saca la animación** antes de medir.
