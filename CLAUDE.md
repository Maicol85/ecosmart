# EcoSmart — reglas de trabajo

## Regla de oro: no leas los archivos largos enteros

**NUNCA leas `docs/historial/` ni `CEIBO_SESSION.md` completos.** El historial son 1,76 MB /
25.113 líneas: solo ese archivo es ~440k tokens, más del doble de la ventana. Se busca con
`grep -n` por título de encabezado y se leen 20-80 líneas con `sed -n 'a,bp'`.
Para orientarte, generá primero un índice de encabezados a `/tmp` y leé el índice:

```bash
grep -nE '^#{1,4} ' docs/historial/CLAUDE_historial_2026-10-01.md > /tmp/idx.txt
```

### Según la tarea, leé este archivo

**Dos reglas que ahorran la mayor parte del contexto:**
- **Antes de leer `index.html` para ubicar una función, abrí el mapa del área.** Está por nombre de
  función y constante, no por línea; grepear a ciegas un archivo de 90.000 líneas cuesta turnos.
- **Antes de leer un PDF de una guía, mirá `docs/fuentes/FUENTES.md`. Si el dato ya está verificado,
  no lo releas.**

| Si la tarea es… | Leé |
|---|---|
| Qué falta hacer / próximo paso | `docs/PENDIENTES.md` |
| **Ubicar un cálculo de severidad, un corte o una banda** | `docs/mapa/valvulas.md` |
| **Tocar la función diastólica del VI**: el cuadro, la ventana 🧭 o los tres algoritmos | `docs/mapa/diastolica.md` |
| **Tocar la ASE/EACVI 2016 en ritmo sinusal**: la Figura 8A, la 8B o el corte de FEVI | `docs/mapa/diastolica-ase2016.md` |
| **Tocar el S/D venoso pulmonar, el LARS, los suplementarios de la ASE 2025, el E/e′ por sitio de la ASE 2016, los rótulos del cuadro o el rojo del E/e′** | `docs/mapa/diastolica-complementarios.md` |
| **Tocar el DIAGRAMA DE FLUJO de la ventana 🧭 de la BSE 2024**: los planos, el motor del SVG, el umbral de ancho o la tabla compacta | `docs/mapa/diastolica-diagrama.md` |
| **Tocar la GRILLA del Doppler mitral**: el orden de los 16 campos, el Tab por columnas, los puntos de corte o el selector del S/D | `docs/mapa/doppler-mitral-grilla.md` |
| **Tocar el VENTRÍCULO DERECHO**: sus campos, el cuadro de referencias, la disfunción sistólica, la pared o el Tei | `docs/mapa/vd-derecho.md` |
| **Tocar el panel de Evidencia: agregar una cita, una sección o un sub-bloque** | `docs/mapa/panel-evidencia.md` |
| **Agregar un TÉRMINO al glosario del panel (el ⓘ con tarjeta)** | `docs/mapa/panel-evidencia-terminos.md` |
| **Ver por dónde sale un dato** (informe narrativo, EN SUMA, PDF, Excel) | `docs/mapa/informe-pdf-excel.md` |
| **Agregar o correr un caso de prueba; A/B; mutación** | `docs/mapa/tests.md` |
| **Visor de cineloop, medición, calibración, IndexedDB** | `docs/mapa/imagenes-visor.md` |
| **Orientarse en otro módulo** (Congénitas, Laboratorio, PPT, Cardio-Onco, Pericardio) | `docs/mapa/congenitas-otros.md` |
| **Citar un dato de una guía** (documento, folio, frase verificada) | `docs/fuentes/FUENTES.md` |
| **Citar un dato de PRÓTESIS valvular** | `docs/fuentes/FUENTES-protesis.md` |
| **Empezar una válvula nueva**: qué fuentes faltan y cómo se agrega una | `docs/fuentes/PENDIENTES_FUENTES.md` |
| Por qué algo está así, historia de una decisión | `grep` en `docs/historial/CLAUDE_historial_2026-10-01.md` |
| Estado de la última sesión (todas las apps) | `grep` en `~/Desktop/APLICACIONES/CEIBO_SESSION.md` |
| Seguridad de la suite (XSS, Semgrep, claves) | `~/Desktop/APLICACIONES/CLAUDE.md` |
| Reglas de trabajo de EcoSmart | este archivo |

Los mapas y el registro de fuentes **no se cargan solos** — se abren a demanda, uno a la vez. Están
armados sobre un commit y **no guardan números de línea** a propósito: la línea cambia en cada
edición, el nombre de la función no.

⚠️ **Este renglón decía «cada uno pesa menos de 20 KB (≈ 5k tokens)» y ERA FALSO para dos de ellos,
medido el 2026-10-11:** `panel-evidencia.md` 33 KB y `valvulas.md` 33 KB; los otros cuatro van de 18
a 25 KB. Los mapas crecen con cada tanda. **Medí el que vas a abrir antes de presupuestar contexto**
(`wc -c docs/mapa/*.md`), y si uno pasa de ~35 KB conviene partirlo en vez de seguir estirándolo.
⚠️ **Al 2026-10-12 hay SIETE mapas y el nuevo nació chico:** `vd-derecho.md` pesa 15,4 KB. Se
sacó a archivo propio en vez de colgarlo de `congenitas-otros.md` por la misma razón que el
glosario del panel: un mapa que crece con cada tanda termina siendo imposible de presupuestar.
⚠️ **Y al 2026-10-12 `panel-evidencia.md` está en 35,3 KB, o sea YA pasó ese techo.** La tanda del
glosario respetó la regla sacando su mapa a un archivo propio
(`panel-evidencia-terminos.md`, 15 KB) en vez de agregarle una sección; lo que le entró fueron tres
punteros. **La próxima tanda que lo toque conviene que lo parta.**
⚠️ **Al 2026-10-13 hay OCHO mapas y el nuevo también nació chico:** `doppler-mitral-grilla.md` pesa 8,9 KB. Se sacó a archivo propio en vez de agregarle una sección a `diastolica.md`, que está en 34,6 KB y a 400 bytes del techo.

Sin importaciones automáticas (`@archivo`): un `@` acá vuelve a desbordar la ventana.

---

## Qué es EcoSmart y cómo se trabaja

- App clínica de ecocardiografía en **un solo `index.html`**: HTML + CSS + JS inline, sin build,
  sin frameworks. Hoy **6,13 MB / 90.494 líneas**. Las únicas dependencias son jsPDF, XLSX y
  PptxGenJS por CDN. Se abre como archivo local y corre en Chrome.
- Lo que produce es un **informe firmado**: narrativo, EN SUMA, PDF, PPT y Excel del Laboratorio.
  Un dato que se carga y no sale en ninguno de esos destinos desapareció sin aviso.
- **Una tarea acotada por prompt.** Si el pedido trae varias cosas, se hacen por etapas con un
  commit cada una, no todo junto.
- **Medir antes de tocar.** Las premisas de un pedido se verifican en el código y en Chrome; en
  este repo varias resultaron falsas y rehacer lo que ya estaba hecho costó turnos enteros.
- **No inventar citas.** Ver «Panel de Evidencia» abajo.
- Los reportes se escriben siempre en el formato
  **qué se encontró → qué puede causar → cómo se corrige**, con la medición al lado. Lo que se
  declara y no se arregla se dice explícitamente, con el motivo.
- El tamaño del archivo importa: `grep` y `sed` por rango, nunca abrir `index.html` entero.
  Los números de línea de Semgrep son los del **JS extraído**, no los de `index.html`: para
  ubicar un hallazgo hay que buscar el fragmento, no sumarle un offset.

---

## Panel de Evidencia — reglas de citación

- **Citas numeradas entre corchetes**, `[1]`, `[2]`… en el texto de cada fila y nota.
- **Bibliografía por sección**, debajo de cada válvula, **con numeración propia que arranca en
  `[1]`** y por orden de primera aparición dentro de esa sección. Decisión de Maicol del
  2026-09-29; el precio conocido es que el número ya no identifica un documento entre secciones.
  `IND_REF_IDX` sigue existiendo pero **ya no da el número**: solo dice si una clave está
  registrada. Antes de «arreglar» esto, leer la sección del historial: está decidido.
- Cada bibliografía lista **solo lo que esa sección cita**. Una entrada numerada sin corchete que
  la invoque se lee como «hay una cita más que no encontrás».
- **«Verificada» = texto completo leído, con documento, año, tabla y página.** Título o resumen no
  cuentan. **Lo que no se pudo abrir NO se cita**, aunque el dato sea de conocimiento corriente.
- **La clase y el nivel no viven en el registro**, son propiedad de la recomendación: van en el
  `txt`, con el formato `Clase I · Nivel B`. El nivel es opcional (hay documentos que usan GRADE).
- **Discrepancia entre la fuente y la app: no se corrige — se reporta y se espera.** Cambiar un
  umbral, un rótulo o una frase clínica es decisión de Maicol. Lo que la fuente desmiente queda
  **sin corchete**, porque citarlo con una fuente verificada respaldaría lo que esa fuente niega.
- Para una decisión propia de la app, el marcador es **`ecosmart`**, cuyo texto es:
  > «Criterio EcoSmart: decisión clínica de la aplicación cuando la evidencia no ofrece un único
  > corte aplicable.»
  **No cuenta como bibliografía** y no se usa para otra cosa: una banda de plausibilidad es un
  rango de lo medible, no un criterio, y va **sin cita**. Un corchete sobre «no pude verificar» se
  lee como si hubiera un criterio detrás.
- **El informe y el PDF firmados no llevan citas ni notas metodológicas.** El panel explica; el
  papel afirma. Si alguna vez la app cambiara de cortes, ahí sí el informe diría con cuáles graduó
  — pero eso es cambiar cortes, no avisar.

---

## Protocolo de verificación

- **Medir en Chrome real antes de tocar**, no de memoria ni de un resumen. El texto literal que
  fija un caso de prueba sale de la salida real de la app, nunca de una redacción reconstruida.
- **A/B contra HEAD**, con las dos piezas obligatorias:
  - **control negativo** — un escenario donde el cambio NO debe actuar, para probar que la sonda
    distingue escenarios y no está diciendo que sí a todo;
  - **denominador** — confirmar que había algo que contar. Una sonda sobre una tabla colapsada,
    una lista sin paciente seleccionado o un `render()` que salió temprano devuelve cero y parece
    seguro. Mirar el tamaño de los dos archivos antes de creerle a un `diff` vacío.
- **Las cuatro superficies se enumeran UNA POR UNA**: informe narrativo, EN SUMA, PDF y Excel.
  Nunca «el informe y el Excel» en bloque — cada una tiene su propio emisor y se rompen por
  separado. El PPT entra cuando el cambio lo toca.
- **Una mutación en rojo por cada cambio.** Se mueve el umbral o se revierte el cableado en una
  **copia**, nunca sobre el archivo real, y se confirma que el caso que le corresponde se pone
  rojo. Un caso que no se puede hacer fallar no está probando nada. **md5 antes y después**, y el
  arnés aborta si el archivo vivo no coincide con su snapshot.
- **Correr la línea base antes de leer una tanda de mutación.** Con casos ya rojos de entrada,
  todas las mutaciones salen «en rojo» sin que eso pruebe nada.
- **No medir en Chrome mientras corre un barrido de mutaciones.** Da una medición falsa y
  plausible: la sonda lee un árbol que otro proceso está reescribiendo. Antes de medir,
  `diff index.html /tmp/index.orig.html`.
- **Semgrep y `/sharp-edges` sobre el propio diff**, no solo sobre el código ajeno. Casi todos los
  defectos caros de este repo los encontró uno de esos dos sobre código recién escrito.
- **Verificación por niveles.** En un cambio chico, los casos de la zona tocada; la suite completa
  **una vez al cierre**, antes del push. Lo que toca informe narrativo, EN SUMA o una fórmula de
  cálculo corre la suite sí o sí.

```bash
python3 scripts/detectar_huerfanos.py        # campos que nadie nombra en el JS
node scripts/test_clinico.mjs                # suite clínica por CDP contra el Chrome del sistema
node scripts/test_clinico.mjs --solo TC-04   # un caso
node scripts/test_clinico.mjs --ver          # con el navegador a la vista
node scripts/check_mobile.js                 # usabilidad midiendo la página en 360 y 390 px
python3 scripts/sellar_version.py            # ANTES de cada git add
```

`check_mobile.js` **abre todas las pestañas y secciones antes de medir**: lo que está en
`display:none` no tiene geometría, así que un barrido sobre la app cerrada da cero y parece
impecable.

---

## Trampas conocidas

- **Acentos graves en el cuerpo de un caso de test.** El cuerpo es un template literal: un
  backtick —aunque esté dentro de un comentario— cierra la cadena y el archivo deja de parsear
  con un `SyntaxError` que apunta decenas de líneas ANTES del culpable.
- **El scorer de mutaciones contaba «sin ✗» como "sobrevivió".** Si el suite no arranca, stdout
  queda vacío, no hay ningún `✗` y **todas** las mutaciones salen «sobrevivió» — indistinguible de
  «no hay cobertura». Reportó 7 falsos de una vez. **Exigir `RESULTADO` en la salida** antes de
  puntuar; si no está, el veredicto es `NO CORRIÓ`.
- **El pendrive `DISK_IMG` fantasma.** Si se desmonta a mitad de una corrida, `readdir` sigue
  contestando de caché y `readFile` revienta. Mientras el pendrive esté afuera, los 17 casos que
  dependen de él **no prueban nada** y no son cobertura: hay que decirlo al reportar el total.
- **Procesos `cdp.mjs` que no salen.** `cdp.close()` + `proc.kill()` no alcanzan: el servidor HTTP
  sigue escuchando y el event loop vivo. Se juntan zombies reteniendo su Chrome y un A/B encadenado
  nunca llega al segundo lado — parece lentitud, es un cuelgue. Cerrar el servidor y
  `process.exit(0)`. Revisar `ps` antes de culpar al A/B; ojo con el `pkill`, que se lleva la
  corrida en curso.
- **Leer `index.html` mientras hay una mutación aplicada** da el valor del árbol mutado y se
  reporta como una conclusión sobre la app. Un arnés que restaura desde un snapshot viejo es,
  además, una máquina de deshacer ediciones en silencio.
- **Offsets de folio** (para citar por página de revista, no de PDF):
  - **ASE 2023 Pandian** — folio = página del PDF **+ 2**.
  - **ESC/EACTS 2025 (`ehaf194.pdf`)** — folio = página 1-based **+ 4634** (PDF 41 → 4675).
  - **ACC/AHA 2020 (Otto)** — folio = índice **0-based** del PDF **+ 72** (idx 55 → e127).
- **TC-223 es el único rojo documentado** de la suite: falla por la fecha. Cualquier otro rojo es
  una regresión, no «la línea base».
- **La ESC/EACTS 2025 en español omite palabras.** La traducción de la SEC se comió «appendage» en
  la nota ^b de la Tabla 8 y eso dio vuelta un hallazgo entero: el reporte era falso y el panel
  tenía razón. **Citar siempre de la inglesa (`ehaf194.pdf`).** Una traducción no cierra un
  hallazgo de wording.
- **Buscar literal en un PDF da falsos negativos por el guión de fin de línea** («contrain-
  dication»): des-hifenar antes de comparar. Y las tablas de Baumgartner 2009 y Wilkins 1988 son
  **imágenes** dentro del PDF — hay que renderizar la página, el texto extraído no trae los valores.

---

## Flujo de trabajo

- **Un commit por etapa**, con el mensaje describiendo qué cambió y qué se verificó.
- Si se agota el contexto: commit en una rama **`wip/`** y el estado en
  `~/Desktop/APLICACIONES/CEIBO_SESSION.md`. No dejar trabajo sin commitear.
- **`git push`:** si el clasificador de permisos del entorno lo bloquea —pasa seguido, y no es un
  problema de git ni del remoto—, **avisar y que lo corra Maicol**. El commit queda en `main`
  local y basta pushear después: **no** hay que rehacer nada ni reescribir historia.
  En esta red **el puerto 22 de GitHub está bloqueado**; HTTPS y `ssh.github.com:443` sí responden.

---

## SEGURIDAD

- **No force push.** Nunca reescribir historia publicada.
- **No inventar citas.** Lo que no se leyó en texto completo no se cita.
- **No tocar contenido clínico sin reportar**: umbrales, cortes, rótulos de grado y frases del
  informe son decisión de Maicol. Se reporta y se espera.
- **No migrar estudios guardados.** Un cambio de rótulo o de criterio no sale a reescribir lo que
  ya está en disco; se documenta qué muestra cada camino con lo viejo.
- **Excel y reimportación solo con orden expresa.** Tocar el exportador o el importador rompe el
  round-trip y la ruptura no se ve hasta que alguien reimporta.
- Lo demás (XSS, Semgrep, claves) está en `~/Desktop/APLICACIONES/CLAUDE.md`.

---

## Estado vigente

### Doppler mitral: el S/D sin legado y los 16 campos en cuatro columnas (2026-10-13)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`bc17525`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **seis**
  commits de la tanda del diagrama de la BSE ya incluidos **y pusheados**. Los **tres** commits de
  esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 3 → 2 → 1.**
  El **1** (el S/D) y el **2** (la grilla) **no se llaman entre sí y se revierten en cualquier
  orden**: el primero toca `venp_sd`, `VENP_SD_TXT`, `VENP_SD_LECTURA` y `venpSdCritSuf`, y el
  segundo sólo mueve marcado y agrega ocho reglas de CSS. ⚠️ **PERO EL 1 LLEVA LA SONDA**
  (`scripts/_probe_dopmitral.mjs`), que el 2 también usa, y la adaptación de **siete** casos de la
  suite; revertirlo deja al 2 sin arnés. **El 3 es TC-461 más documentación** y afirma el
  comportamiento de los dos: revertir cualquiera sin el 3 deja TC-461 en rojo —11 de sus 28
  condiciones, verificado en un worktree aparte—.

- **Línea base al cierre: suite 472/476 en la corrida completa con el pendrive `DISK_IMG` MONTADO,
  Semgrep 127 / 0 ERROR, Excel 435 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno
  —IDÉNTICO a la línea base: ni un hallazgo nuevo—.** Los cuatro rojos son los de ENTRADA y NO son
  regresiones: **TC-223** (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**.
  **El denominador subió a 476**: esta tanda agregó **TC-461**. La de ENTRADA, medida en HEAD limpio
  el 2026-10-13, fue **471/475** con el pendrive montado y los mismos cuatro rojos, con el `md5` de
  `index.html` sin moverse durante la corrida de cierre (`9bb03dea…`) ni durante la de entrada
  (`da74ada5…`). `--todo` da **374 a 360 px y 383 a 390 px**, el mismo par que la tanda del
  2026-10-12 midió: los dieciséis campos no son nuevos, sólo cambiaron de lugar.
  ⚠️ **ESTA CIFRA LA ESCRIBI ANTES DE MEDIRLA Y DESPUES LA CONFIRME.** Coincidió, pero el renglón
  estuvo escrito sin medición durante media tanda, que es exactamente lo que este archivo ya
  documenta como error propio dos secciones más abajo. **Medir y después escribir.**
- **Dónde está todo:** `docs/mapa/doppler-mitral-grilla.md` (**mapa NUEVO**: las cuatro columnas, el
  Tab, las ocho reglas, los puntos de corte, lo medido y las trampas),
  `docs/mapa/diastolica-complementarios.md` → «El S/D venoso pulmonar» (la tabla de cuatro opciones
  y el porqué del tercer estado), `docs/fuentes/FUENTES.md` → «El S/D venoso pulmonar — CINCO
  lecturas y DOS cortes», `docs/PENDIENTES.md` → **cinco** cosas declaradas y no tocadas (G1 a G5).

- **NO CAMBIA NINGUNA CUENTA, NINGUN CORTE, NINGUN VEREDICTO NI NINGUNA SUPERFICIE FIRMADA, Y ESTA
  MEDIDO.** A/B contra HEAD: **16 escenas de veredicto** (las cuatro lecturas del S/D × los cuatro
  valores del selector) con 0 diferencias en badge, texto del informe, texto del EN SUMA, resultado
  de la ventana, número de filas y estado de la fila del S/D; y **8 escenas de superficies** con 0
  diferencias en informe (3 estilos), EN SUMA (3), Excel con sus **435** columnas, franja del PPT,
  grado del Laboratorio y hash de los campos guardados.
- ⚠️ **LAS DOS OPCIONES DE LEGADO DEL S/D SE ESCONDIAN CON `hidden`, Y ESO ES UN `display:none`.**
  Medido con `getComputedStyle` sobre cada `<option>` en HEAD: las dos tenían `display: none` en
  Chrome. Un desplegable **NATIVO** no está obligado a respetar el layout de sus propias opciones, y
  por eso **en Safari aparecían** las dos «(estudio anterior)» con el campo vacío. **El chequeo de
  acá es ESTRUCTURAL** —Safari no se puede probar desde este entorno—: lo que se afirma es que las
  dos no existen y que ninguna de las cuatro que quedan está oculta ni deshabilitada. Que en Safari
  ya no salgan lo mira Maicol.
- **DECISION DEL MEDICO (13/10): no hay ningún estudio guardado con el S/D cargado**, así que no hay
  compatibilidad que sostener. Con las dos opciones se fueron sus entradas de `VENP_SD_TXT`, sus
  cinco entradas de `VENP_SD_LECTURA` y **`venpSdCritSuf` con sus cinco sitios de llamada**: esa
  función quedó devolviendo cadena vacía SIEMPRE, así que los cinco rótulos imprimen el mismo texto
  que antes. **Los cinco cortes y sus operadores no se tocaron.**
- ⚠️ **EL TERCER ESTADO DE `venpSdEstado` NO SE FUE, Y NO HAY QUE «LIMPIARLO».** Sigue devolviendo
  `null` cuando no se puede decidir —hoy con un solo origen, el campo SIN CARGAR—, porque `_daFila`
  deriva de ese `null` la fila GRIS y un `false` pondría el ✓ de NEGATIVO sobre un criterio que
  nadie midió. Un token que el selector ya no ofrece entra por ese mismo camino: `selectedIndex -1`,
  `value` vacío, `null` en los dos cortes y etiqueta `null`. **Medido en HEAD con un token inventado
  ANTES de tocar nada: ese camino ya existía.**

- **LOS 16 CAMPOS EN CUATRO COLUMNAS, Y EL ORDEN DEL MARCADO ES EL DEL TAB.** Sin un solo
  `tabindex`: el navegador recorre el orden del documento, y el marcado está por columnas. **Medido
  con teclas Tab REALES y foco real campo por campo: los dieciséis en orden de columnas, IDENTICO en
  las seis combinaciones** de algoritmo (ASE 2025 / BSE 2024 / ASE/EACVI 2016) × ritmo (sinusal /
  fibrilación auricular), con 0 campos sin geometría. **Ninguno de los dieciséis se oculta hoy por
  algoritmo ni por ritmo**, y está medido en las seis.
- ⚠️ **LA POSICION ES EXPLICITA Y NO DE FLUJO, Y ESO ES LO QUE DEJA EL HUECO.** Un
  `grid-auto-flow: column` daría el mismo dibujo con cero reglas, pero el flujo REACOMODA. **Medido
  en HEAD: esconder el S/D movía CUATRO campos; ahora no se mueve ninguno de los otros quince**
  (denominador: 16 medidos) y al restaurarlo el mapa vuelve idéntico. Son **ocho** reglas y no
  dieciséis: cada `.fg` lleva su columna y su fila como dos clases (`dm-cN` / `dm-rM`).
- **EL CORTE NO ES NUEVO Y NO HAY ETAPA DE DOS COLUMNAS.** Las reglas viven en
  `@media (min-width: 769px)`, el complemento exacto del `max-width: 768px` que ya colapsaba
  `.grid-4` a una columna: no se agregó un breakpoint ni un segundo número que mantener sincronizado
  con `check_mobile.js`. **Medido a 1200, 900, 390 y 360 px en los DOS temas: 4×4 arriba de 768 px y
  16×1 abajo, cero superposiciones, cero desbordes, rótulo renderizado a 11 px, y el orden VISUAL
  igual al del Tab en las ocho combinaciones.** A 900 px siguen siendo cuatro columnas, que es lo
  conservador; `PENDIENTES.md` → G2.
- **LAS SIETE SINCRONIAS, con teclas reales y BORRANDO en los dos sentidos** (LARS, strain de
  contracción, VTI mitral y THP, más el AVm derivado): **0 diferencias**. El AVm por THP es de SOLO
  LECTURA y la sonda se niega a mandarle una tecla.
- ⚠️ **EL BLOQUE QUEDO 32 px MAS ALTO (286 contra 254 a 1200 px), Y HAY QUE DECIRLO.** Las cuatro
  celdas que llevan un div de marca «(revisar)» reservan 17 px aunque esté vacío, y antes caían en
  DOS filas mientras ahora caen en las CUATRO. Las dieciséis casillas están ocupadas y las filas son
  contiguas: no hay celda vacía. **No se tocó la marca** porque la orden la congela;
  `PENDIENTES.md` → G1.
- **Arnés: `scripts/_probe_dopmitral.mjs`** (A/B de solo lectura con `--file`), siete grupos
  (`opciones`, `veredictos`, `tab`, `pos`, `hueco`, `sinc`, `superficies`).
  **Cobertura: TC-461**, **28 condiciones** con tres denominadores y cuatro controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 11 de las 28 en rojo**; las 17 que
  pasan son el foco real de los campos (que ya eran enfocables), las dos reglas de CSS que ya
  existían, las lecturas de los tres tokens vivos y los cuatro controles negativos — o sea lo que
  esta tanda no mueve.
- ⚠️ **CASOS ADAPTADOS, con el motivo escrito en cada uno: SIETE.** TC-453 (su control negativo 4
  medía el legado; hoy el gris de la fila sale del campo SIN CARGAR), TC-454, TC-455, TC-458,
  TC-460 y TC-260 (los tokens viejos por sus VIVOS equivalentes: `mid` cumple el corte `< 1` igual
  que «<1», `ge1` es negativo igual que «>1») y TC-459, cuyo bloque B afirmaba que las dos opciones
  SEGUIAN en el marcado y ahora afirma lo contrario. **Ningún caso afirmaba el orden ni la posición
  de los campos**, así que la Parte 2 no obligó a adaptar ninguno.
- ⚠️ **DOS ESCENAS DE MI PROPIA SONDA NO LLEGABAN A LA COMPUERTA DEL S/D, Y PARECIAN MEDICIONES
  BUENAS.** Les faltaban `peso` y `talla`: el Vol AI vota INDEXADO, así que sin ASC ese criterio
  queda sin evaluar y la escena no llega al paso donde el S/D decide. La de la BSE publicaba «Datos
  insuficientes» y la de la ASE 2016 «0 de 1 criterios», o sea dos tablas diciendo «el corte no
  funciona» sobre cortes que funcionan. Es la misma lección que este archivo ya tiene escrita tres
  veces: **cada escena tiene que dejar un criterio ya positivo y llegar a la compuerta**.
- ⚠️ **Y UNA ESCENA DE LA SONDA MEDIA CON LOS DOS LADOS VACIOS.** El campo espejo del VTI mitral
  (`vtim`) vive en Válvulas detrás de **DOS** puertas —la sección plegable de la mitral y el cajón
  «Datos»—: `clicEn` informaba «NO SE PUDO», el A/B decía «idéntico» y el tecleo nunca había
  ocurrido. Se abre con `toggleEteSeccion('valv-mitral')` **más** `valvDatosTog`, y la sonda informa
  el estado del cajón al lado del resultado.
- ⚠️ **Y UNA CONDICION DE TC-461 SALIA ROJA CONTRA HEAD POR UN ARTEFACTO DE FORMATO**, no por el
  defecto que busca: «antes» y «después» del campo oculto se calculaban con dos formateadores
  distintos, así que diferían por el texto. Un solo lector (`par(id)`) para los dos. **Una condición
  que sabe fallar por la razón equivocada no está probando nada.**
- ⚠️ **Me comí el acento grave UNA vez**, en un comentario mío dentro del cuerpo de la sonda, con el
  archivo que documenta la trampa abierto delante. Esta vez lo cazó `node --check` primero, con la
  línea exacta; verificado por mutación que `scripts/check_backticks.py` también la da (471). El
  orden del protocolo sigue siendo correrlo ANTES.


### Diagrama de flujo de la BSE 2024 en la ventana 🧭 — las Figuras 17, 18 y 19 (2026-10-13)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`f371c08`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **siete**
  commits de la tanda de los parámetros complementarios ya incluidos **y pusheados**. Los **seis**
  commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 6 → 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL COMMIT 6 NO ES SÓLO DOCUMENTACIÓN, y conviene saberlo antes de revertir:** además de
  TC-460 y los cuatro archivos de documentación lleva **dos correcciones de `index.html`** que
  destapó ese caso —el estado del plegable, que con `ontoggle` se perdía, y el decimal del corte de
  la Tabla 2 en el dibujo—. Revertirlo deja las dos como estaban en el commit 5.
  El 1 crea `R.camino`, `R.nodoFinal`, el `nodo` de cada fila y los dos mapas de nodo final; **del
  2 al 5 cuelgan todos de él**, pero revertirlo solo **no rompe la app**: `_bseDiagPlano` sale por
  su guarda de `!R.camino` y deja de dibujar, con las cajas sin valores. **Revertir el 2 sin
  revertir antes el 3, el 4 y el 5 SÍ la rompe**: el 2 crea `_bdFeviGls`, `_bdEnvolver`,
  `_bseDiagSVG` y `_bseDiagCaja`, que los planos de la Figura 18 y de la 19 nombran, y un
  `ReferenceError` en la evaluación de un `<script>` **aborta el bloque COMPLETO** — o sea la app
  con cero pestañas con geometría.
  **El 3 y el 4 se revierten entre sí en cualquier orden**: el 3 es la Figura 18 y el 4 la 19, y
  ninguno llama al otro. El 4 agrega al motor `px`/`pw` y `calleAntes`, que **sólo** usa la 19.
  **El 5 (la tabla y el envoltorio de la lista) se revierte solo.**

- **Línea base al cierre: suite 469/475 en la corrida completa con el pendrive `DISK_IMG` MONTADO,
  Semgrep 127 / 0 ERROR, Excel 435 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno
  —IDÉNTICO a la línea base: el diagrama no agregó un solo hallazgo, porque en celular no se
  dibuja—.** ⚠️ **DE LOS SEIS ROJOS, DOS SON LOS INESTABLES CONOCIDOS**: **TC-246** y **TC-252**
  salen VERDES corridos solos, así que la cifra real es **471/475** y los rojos de verdad son los
  **cuatro** de entrada, que NO son regresiones: **TC-223** (el documentado, falla por la fecha),
  **TC-376**, **TC-390** y **TC-406**. **Repetir antes de sospechar.** **El denominador subió a 475**: esta tanda agregó
  **TC-460**. La de ENTRADA, medida en HEAD limpio el 2026-10-12, fue **470/474** con el pendrive
  montado y los mismos cuatro rojos, con el `md5` de `index.html` sin moverse durante la corrida
  (`ea3ece73…`).
- **Dónde está todo:** `docs/mapa/diastolica-diagrama.md` (**mapa NUEVO**: el camino, los tres
  planos, el motor del SVG, el umbral de ancho, la tabla compacta, las trampas y cómo medir),
  `docs/fuentes/FUENTES.md` → «Licencia de acceso abierto» y «Las tres figuras, caja por caja y
  flecha por flecha», `docs/PENDIENTES.md` → **siete** cosas declaradas y no tocadas (D1 a D7).

- **NO CAMBIA NINGUNA CUENTA NI NINGUNA SUPERFICIE FIRMADA, Y ESTÁ MEDIDO.** Informe en tres
  estilos, EN SUMA en tres, Excel con sus **435** columnas, texto del PPT, grado del Laboratorio y
  hash de los campos guardados: **0 diferencias contra HEAD en las 30 escenas** de ritmo sinusal, y
  la fila del Excel clave por clave en 5 escenas. Lo único que esta tanda agrega es una forma nueva
  de MOSTRAR lo que las funciones dueñas ya calculaban.
- ⚠️ **EL NODO FINAL NO SE EMPUJA EN NINGUNA RAMA: SE DERIVA DE `R.clave`**, que es la categoría que
  firman el cuadro gris, el informe y el EN SUMA. Empujarlo a mano en cada salida sería una segunda
  copia del veredicto, y la copia que se olvida es la que pinta el camino rojo terminando en una
  casilla que el badge no dice. **Medido: el último nodo del camino coincide con el veredicto del
  cuadro en 46 de 46 escenas** (30 de ritmo sinusal y 16 de fibrilación auricular).
- **LAS ARISTAS EN ROJO SON LOS PARES CONSECUTIVOS DEL CAMINO**, y eso también se comprueba: con
  mirar sólo el último nodo, un dibujo que pintara TODAS las cajas de rojo pasaría igual. TC-460 lo
  exige en las 24 ramas.

- **LA LICENCIA DE LA BSE 2024 ES CC BY 4.0 Y SÍ EXIGE ATRIBUCIÓN**, verificado en el pie de la
  página 1 del PDF: crédito al autor y a la fuente, enlace a la licencia e indicar si hubo cambios.
  Las imágenes del artículo **están incluidas** en esa licencia. ⚠️ **O SEA QUE REPRODUCIR LA FIGURA
  SERÍA LEGÍTIMO, Y AUN ASÍ EL DIBUJO ES PROPIO**: otra disposición, otras palabras —no copia el
  literal de ninguna caja— y los valores del paciente adentro, que el original no tiene. El pie de
  cada diagrama nombra la figura, la página, la licencia y declara que es un redibujo.
- **SIN COLORES Y SIN DEPENDER DEL COLOR.** Todo el dibujo va en los grises del tema y lo único en
  rojo es el camino, con línea gruesa. El nodo final lleva el rótulo de texto «Resultado de este
  paciente» —uno solo, y TC-460 lo cuenta— y debajo va el camino **en palabras**. Las tres cajas que
  **no están en la figura** —la indeterminada, que sale de la prosa, y los dos estados propios de la
  app— van con el borde punteado y el pie lo declara.

- **EL UMBRAL DE ANCHO ES 780 px Y SALE DE UNA MEDICIÓN, no de un número redondo.** El SVG se dibuja
  sobre un viewBox de 700 px con texto de 11,5 px y lleva `max-width:700px`, así que por encima del
  umbral **no se escala**: medido en los dos temas, a **1200 y 900 px** el diagrama aparece y su
  texto renderiza a **11,5 px exactos**; a **600, 560, 390 y 360 px** la caja queda en
  `display:none` y la ventana es la de HEAD. Por debajo de **721 px** de viewport el ancho útil
  (`min(760, vw−24) − 28`) cae de 669 px y el texto bajaría de los 11 px que esta tanda se fijó como
  piso: el umbral deja 59 px de margen y es donde la tarjeta ya alcanza sus 760.
  ⚠️ **Un iPad en vertical son 768 px y queda 12 px por debajo**: `PENDIENTES.md` → D3.
- ⚠️ **EL `!important` DE LA MEDIA QUERY NO ES DECORATIVO.** `#diast-algo-card` lleva `width:560px`
  en un `style` **en línea**, que le gana a cualquier selector de hoja por mucha especificidad que
  tenga. Sin él la tarjeta se quedaba en 560, el SVG se escalaba a 530 y su texto caía a **8,7 px**
  — una regla que no gana se lee como un arreglo aplicado, y es la cuarta vez que este archivo lo
  paga. **Y la tarjeta se ensancha SÓLO para la BSE**, por la clase `bse-ancho`: sin ese alcance
  cambiaría también el ancho de la ventana de las otras dos guías.

- ⚠️ **EL TEXTO DE UN SVG NO SE ENVUELVE SOLO.** Un `<text>` más ancho que su caja se dibuja igual y
  pisa la de al lado; no hay `overflow` que lo recorte. Se envuelve por palabras contra un
  presupuesto sacado del ancho, y **la altura se calcula DESPUÉS de envolver** — con la altura
  sacada del número de valores, un renglón partido en dos se salía de su caja.
- ⚠️ **LAS CAJAS SE DIBUJAN DESPUÉS DE LAS LÍNEAS**, así que un rótulo de arista que caiga sobre una
  caja queda **TAPADO**: no desaparece de una forma que se note, simplemente no se lee y el dibujo
  parece tener flechas sin nombre. El rótulo va **debajo** de su calle y el hueco entre filas subió
  a 34 px.
- ⚠️ **LA FIGURA 19 NO ENTRA EN LA REJILLA DE CUATRO COLUMNAS Y LLEVA GEOMETRÍA PROPIA.** Sus dos
  flechas largas —la de «≥3 negativos» y la de «≥3 positivos»— bajan **por fuera** de la banda del
  paso 2, que en el original es más angosta que la del paso 1 justamente para dejarles el carril.
  Con la rejilla fija, esas dos líneas cruzaban por encima de la banda y el diagrama decía que el
  paciente pasó por ahí.

- **LA TABLA COMPACTA REEMPLAZA A LA LISTA LARGA, Y LO HACE EL CSS.** La lista se arma siempre y se
  esconde con una clase, así un cambio de ancho no necesita repintar nada. El envoltorio
  `.bse-lista` **sólo existe cuando hay diagrama**, de modo que la lista de la ASE 2025 y la de la
  ASE/EACVI 2016 se ve a cualquier ancho.
- ⚠️ **UNA COLUMNA DE PASO QUE EL PACIENTE NO RECORRIÓ NO SE DIBUJA**, y no es cosmético: la columna
  del strain con sus criterios en gris se lee como «se evaluaron y dieron negativo», cuando lo que
  pasó es que el algoritmo nunca llegó a preguntarlos. La compuerta es el **camino**. Medido: 3
  columnas con el paso del e′, 3 con el strain y 2 cuando el paso 1 decide solo.
- ⚠️ **`ontoggle` NO SIRVE PARA CONSERVAR EL ESTADO DEL PLEGABLE, Y LO CAZÓ TC-460.** El evento
  `toggle` de un `<details>` se despacha de forma **asíncrona**: cuando el repintado corre en la
  misma vuelta que el clic, el estado guardado sigue siendo el anterior y la tabla se cierra sola
  —medido: abrir y repintar la dejaba cerrada—. Se lee del árbol vivo justo antes de reemplazarlo.
- **No lleva un `aria-expanded` propio a propósito**: habría que sincronizarlo a mano y un atributo
  que se desincroniza miente con más convicción que no tenerlo. El `<summary>` nativo ya anuncia el
  estado y se abre con Enter, medido con teclas reales de CDP en cuatro escenas.

- ⚠️ **EL CORTE DE LA TABLA 2 SE IMPRIMÍA SIN DECIMAL EN EL DIBUJO.** `String(7.0)` da «7» en
  JavaScript, así que el renglón decía «e′ septal <7» al lado de un valor medido que sí lleva
  decimal («6,5»): dos notaciones para dos números que se comparan entre sí. Se corrigió **sólo en
  el dibujo** —la lista larga, el informe y el EN SUMA no se tocaron— y **el valor del corte no
  cambia**.
- **CONTROL NEGATIVO MAYOR: la ASE 2025 y la ASE/EACVI 2016, en ritmo sinusal y en FA, 30 entradas
  con 0 diferencias** en el cuadro y en la ventana, sin diagrama, sin tabla, sin envoltorio de lista
  y sin el ensanche de la tarjeta. Y a **360 px, 46 escenas con 0 diferencias contra HEAD** en el
  texto VISIBLE de la ventana, en el número de filas con geometría y en la lectura completa.
- **Arneses: `scripts/_probe_bsediag.mjs`** (A/B de solo lectura con `--file`), ocho grupos
  (`camino`, `ventana`, `angosto`, `diagrama`, `ancho`, `tabla`, `superficies`, `excelab`, `otras`)
  más `captura`, que saca PNG del dibujo y de la tabla en los dos temas. **46 escenas** —las 30 de
  ritmo sinusal de la tanda de la BSE y las 16 de FA de la tanda de la fibrilación—, cargadas con
  **teclas reales**.
  **Cobertura: TC-460**, **40 condiciones** con tres denominadores y cinco controles negativos, que
  recorre las **24 ramas** de las tres figuras. **Verificado que sabe fallar contra HEAD en un
  worktree aparte: 35 de las 40 en rojo**; las cinco que pasan son los cuatro controles de las otras
  dos guías y el que comprueba que el cuadro gris sigue publicando el mismo veredicto, que es
  justamente lo que esta tanda no mueve.
- ⚠️ **EL CUERPO DE UN CASO NO PUEDE CAMBIAR EL ANCHO DE LA VENTANA**: corre dentro de la página y
  un media query no se puede fingir. TC-460 fija la **regla** que produce el comportamiento —la caja
  nace en `display:none` y sólo una media query de `min-width: 780px` la enciende, y es la misma que
  esconde la lista—; el comportamiento **renderizado** a 360 px lo mide la sonda, que sí tiene el
  canal para emular el viewport.
- ⚠️ **Y UN CASO CARGA CON `__t.set`, NO CON TECLAS DE CDP.** El cuerpo corre dentro de la página:
  no tiene acceso al protocolo del navegador, y un `KeyboardEvent` construido a mano no es de
  confianza, así que no activa un `<summary>` ni dispara la escritura nativa de un `<input>`. Las
  mismas 46 escenas sí se cargan con teclas reales en la sonda.
- ⚠️ **UN RECORTE DE CAPTURA MÁS ALTO QUE LA VENTANA SALE EN NEGRO.** La tarjeta scrollea y
  `Page.captureScreenshot` con un `clip` que se va por debajo del viewport no dibuja lo que no está
  renderizado: la primera captura de la tabla salió con la mitad inferior negra y parecía que la
  tabla no se dibujaba.
- ⚠️ **El desborde horizontal de la página a 900 px (930 contra 900) es PREEXISTENTE**, medido en
  HEAD el mismo día en las 48 celdas de la tabla de anchos. No lo trae esta tanda.
- ⚠️ **Me comí el acento grave DOS veces**, las dos en comentarios míos dentro del cuerpo de la
  sonda, con el archivo que documenta la trampa abierto delante. `node --check` dio la línea exacta
  las dos veces porque el culpable estaba dentro del mismo template.

### Parámetros complementarios de la función diastólica — S/D, LARS, suplementarios, E/e′ por sitio (2026-10-12)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`1576306`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **seis**
  commits de la tanda de la ASE/EACVI 2016 ya incluidos **y pusheados**. Los **siete** commits de
  esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 7 → 6 → 5 → 4 → 3 → 2 → 1.**
  El 1 crea `venpSdEstado`, `VENP_SD_LECTURA`, `venpSdFilaVal` y `venpSdCritSuf`, y **las cinco
  lecturas del S/D cuelgan de él**: revertir el 1 sin revertir antes el resto deja cinco funciones
  llamando a una que no existe, y un `ReferenceError` en la evaluación de un `<script>` **aborta el
  bloque COMPLETO** — o sea la app con cero pestañas con geometría.
  **El 2, el 3 y el 4 se revierten entre sí en cualquier orden**: el 2 toca el LARS, el 3 la lista
  de suplementarios y el 4 el E/e′ de la ASE 2016, y ninguno llama a otro. **El 5 depende del 1**
  —`diastEeElevadaVigente` se inserta a continuación de `venpSdFilaVal`— y además **el 5 tiene que
  revertirse ANTES que el 3**, porque el rojo consulta las filas que la lista de suplementarios
  agrega. **El 6 (el Laboratorio) se revierte solo**: toca `_labDiastGrado` y el mapa de rótulos del
  Excel, y nada de la diastólica lo llama. **El 7 es documentación más TC-459**, que afirma el
  comportamiento de los seis: revertir cualquiera sin el 7 deja TC-459 en rojo.
  ⚠️ **Y REVERTIR EL 5 SIN EL 7 DEJA TAMBIÉN TC-260 EN ROJO**, que se adaptó en el 5 en cuatro
  bloques: ese caso escribía `#ee-val` a mano y hoy el color le pregunta al evaluador.

- **Línea base al cierre: suite 453/474 con el pendrive `DISK_IMG` AFUERA, Semgrep 127 / 0 ERROR,
  Excel 435 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base; los cambios de esta tanda no agregaron un solo hallazgo—.** Los 21 rojos son
  los de entrada y NO son regresiones: **TC-223** (el documentado, falla por la fecha), **TC-376**,
  **TC-390**, **TC-406** y los **diecisiete** de **TC-181…TC-197**, que son los del pendrive y son
  ENTORNO: con el pendrive afuera no prueban nada. **El denominador subió a 474**: esta tanda
  agregó **TC-459**. La de ENTRADA, medida en HEAD limpio el 2026-10-12, fue **452/473** con el
  pendrive AFUERA y los mismos 21 rojos, con el `md5` de `index.html` sin moverse durante las dos
  corridas (`f3f922f7…` a la entrada, `ea3ece73…` al cierre).
- **Dónde está todo:** `docs/mapa/diastolica-complementarios.md` (**mapa NUEVO**: el S/D y su tabla
  de lectura, el LARS, la lista de suplementarios, el E/e′ por sitio, los rótulos, el rojo, el IMC,
  el Laboratorio, las trampas y cómo medir), `docs/fuentes/FUENTES.md` → «Parámetros
  complementarios de la función diastólica» (las cinco lecturas del S/D con su frase verificada, los
  cinco suplementarios de la nota ‡, el E/e′ por sitio del folio 281 y las dos salvedades que las
  guías escriben), `docs/PENDIENTES.md` → **diez** cosas declaradas y no tocadas (C1 a C10), con
  **A1, A4 y A5 marcados CERRADOS**.

- **EL S/D ES UN CAMPO CON DOS CORTES, Y CON DOS OPCIONES EL MÁS ESTRICTO ERA INEXPRESABLE.** El
  selector pasó a TRES opciones («≤0,67» / «>0,67 y <1» / «≥1») porque la ASE 2025 en ritmo sinusal
  corta en **≤ 0,67** (folio 554) y las otras cuatro lecturas en **< 1** (folio 563, págs. 37 y 40,
  folios 286-290). Los cinco cortes y sus cinco operadores están verificados en el original y
  **ninguno contradice lo que pedía la orden** — incluido el de la FA de la ASE 2025, que la orden
  nombraba como dudoso y escribe `<1`. El tramo del medio es exactamente lo que separa los dos
  cortes: medido, un S/D en «>0,67 y <1» da presión NORMAL en ritmo sinusal y POSITIVO en las otras
  cuatro.
- ⚠️ **UN SOLO DUEÑO Y TRES ESTADOS, NO DOS.** `venpSdEstado(corte)` devuelve `null` cuando el campo
  no permite decidir, que es lo que impide que «no se puede saber» se cuente como «no cumple». Pasa
  en UN caso: un estudio GUARDADO trae «<1» y eso no distingue un 0,6 de un 0,9, así que para el
  ≤ 0,67 queda SIN EVALUAR. Los estudios viejos **no se migran**: las dos `<option>` siguen en el
  marcado con `hidden`, porque el recolector restaura por `el.value` y sin su option el `<select>`
  queda en `selectedIndex -1` — el defecto que `et_grado` ya pagó.
- ⚠️ **LA FILA DE UN CRITERIO SIN EVALUAR NO PUEDE LLEVAR SU VALOR CON EL MOTIVO PEGADO.** `_daFila`
  deriva el estado del valor: con dato y negativo pinta ✓. La primera versión devolvía «<1 — no
  distingue este corte» y la fila salía con el ✓ de NEGATIVO sobre un criterio que no se evaluó. El
  valor va en `null` —la fila en gris— y el motivo en el rótulo, que es el patrón que HEAD ya usaba.
- **SIN COLUMNAS NUEVAS Y SIN TOCAR EL IMPORTADOR:** los cuatro campos `venp_` no están en
  `LAB_XLS_MAP`, así que el importador nunca les pregunta al rango. Excel en **435** columnas en las
  12 escenas.
- ⚠️ **EL INFORME FIRMADO IMPRIMÍA LA ETIQUETA DEL S/D CON UN TERNARIO.** `_bseDetalles` hacía
  `st.sd === 'menor1' ? '<1' : '>1'`, que era correcto con dos tokens; con tres, un «≤0,67» elegido
  por el médico salía **«>1»** en un informe firmado, o sea la etiqueta contraria. La traducción pasa
  a tener un solo dueño, `VENP_SD_TXT`.

- ⚠️ **EL LARS ENTRABA CRUDO A LAS CINCO CUENTAS Y UN NEGATIVO DABA VUELTA EL VEREDICTO EN
  SILENCIO.** Un −32 cumple `< 18` y publicaba «presión de llenado elevada» sobre una aurícula cuyo
  strain de reservorio es 32 %, o sea NORMAL. No era una regresión: era el comportamiento de HEAD, y
  lo único que lo señalaba era la marca «(revisar)» por caer bajo el piso 0 de su banda. Hoy pasa
  por `diastStrainAbs`, que ya era la única puerta de los otros dos strain.
  **Medido: 20 pares (5 escenas × 4 magnitudes × 2 signos) dan badge, informe, EN SUMA y ventana
  IDÉNTICOS con los dos signos, y el campo conserva el signo. En HEAD eran 9 de 20.** A/B contra
  HEAD: **15 de 40 escenas cambian, las 15 con signo NEGATIVO y CERO con positivo**, que es la
  comprobación de que el |x| de un positivo es el mismo número.
- **LA MARCA DEL LARS PASÓ A SER POR MAGNITUD**, y es consecuencia directa: desde que un −32 vota
  como 32, marcarlo diría que hay algo que revisar en una medición que la app ya interpreta bien. Un
  −80 y un +80 se marcan los dos. Los otros tres campos no cambian —sus bandas ya son simétricas— y
  la del LARS es **la única asimétrica**, por eso necesita su propia entrada (`_DIAST_STRAIN_ABS_MARCA`).
  ⚠️ **EL IMPORTADOR NO SE TOCÓ** y sigue rechazando por rango un LARS negativo que la pantalla ya
  no marca: `PENDIENTES.md` → C1.

- **LOS SUPLEMENTARIOS DE LA ASE 2025 PASARON DE UNO A CUATRO, SIN UN SOLO CAMPO NUEVO.** Entraron
  los tres que la app puede medir: IP telediastólica **≥ 2 m/s**, PAP diastólica **≥ 16 mmHg**
  (folio 555a, las dos con un «or» entre ellas) y **Ar−A > 30 ms CON amplitud de la Ar > 35 cm/s**
  (folio 555d). El que falta es la **caída de la E/A con Valsalva**, que no tiene campo.
- ⚠️ **LA NOTA ‡ DE LA FIGURA 3 Y EL INCISO (d) NO DICEN LO MISMO, Y LOS DOS ESTÁN IMPRESOS.** La
  nota nombra sólo «Ar-A duration > 30 ms»; el folio 555d escribe «a high amplitude (>35 cm/s) **and**
  long duration … **along with** an Ar-A duration >30 ms». Se exige el **AND** —una sola entrada de
  la lista, no dos—, que es la prosa y es el lado conservador: con dos entradas, un Ar−A de 31 ms con
  una Ar de 20 cm/s afirmaría presión elevada con la mitad de la condición. Medido con control:
  amplitud 34 neg · 35 NEG · 36 POS, con el Ar−A en 40 ms fijo.
- ⚠️ **Y EL INCISO (d) DESCRIBE UN ESTADIO CON LA PAI MEDIA NORMAL** («LVEDP is elevated but mean LAP
  is normal»), o sea que como marcador es de LVEDP y no de lo que la Figura 3 estima. Se implementa
  porque la nota ‡ lo lista como suplementario de ESE algoritmo y porque el §12 del folio 555 manda
  informar el aumento aislado de la LVEDP. `PENDIENTES.md` → C3.
- **LA PAP DIASTÓLICA NO SE RECALCULA: SE LEE DEL CAMPO QUE PUBLICA `calcIP`.** Con la PmAD sin
  cargar ese campo escribe «N mmHg (sin PmAD)», que es una PAPd a la que le FALTA el sumando de la
  aurícula derecha, y en ese estado **no vota** — medido en los tres valores de un triplete donde el
  campo muestra 9, 14 y 15 mmHg. ⚠️ **Y EL BORDE ES EL DEL CAMPO REDONDEADO**: el campo imprime con
  `toFixed(0)`, así que un 15,64 real se lee 16 y cruza. Es la consecuencia de leer el número que el
  médico tiene delante, y la alternativa era una segunda copia de la fórmula. `PENDIENTES.md` → C7.
- **CUATRO CAMPOS PASARON A LLAMAR A `calcDiastol`** (`ip_vtd`, `venp_dur_ar`, `venp_dur_a`,
  `venp_vel_ar`): desde hoy son insumos del veredicto y viven en OTRAS pestañas, así que sin eso el
  cuadro gris se quedaba con el del paciente anterior — el mismo desfase que `edad` y `sexo`
  cerraron cuando la BSE los hizo insumo. La ventana no se atrasa: tiene su oyente de documento.
- **SE CONSULTAN EN UN SOLO LUGAR Y SÓLO DEL LADO POSITIVO.** Con el Vol AI o el TRIV cargados el
  suplementario queda POSITIVO en su fila y **no se consulta**; con los cuatro negativos el estado se
  queda en el «no estimable» de HEAD, porque la flecha «None» de la figura sale de haber preguntado
  sus CINCO y la app pregunta cuatro.

- ⚠️ **EL E/e′ DE LA ASE 2016 CON UN ANILLO SOLO SE COMPARABA CONTRA EL CORTE DEL PROMEDIO, Y ESO
  MOVÍA INFORMES EN LAS DOS DIRECCIONES.** Medido: con el septal solo en 7,0, una onda E de 104 daba
  E/e′ 14,86 y publicaba **«Grado II»** cuando su corte es 15; con el lateral solo en 8,0, una E de
  105 daba 13,13 y publicaba **«Grado I»** cuando su corte es 13. Hoy el corte se elige por el sitio
  MEDIDO: 14 el promedio, 15 el septal, 13 el lateral, **los tres con `>` estricto**.
- ⚠️ **ES UN REEMPLAZO Y NO UN «OR», Y ESA PARTE DE LA ORDEN QUEDÓ SIN HACER.** La orden pedía
  aplicarlos «como alternativas, igual que se hizo con la ASE 2025», y el original dice lo contrario
  en la misma oración: «at times **only** the lateral e′ or septal e′ velocity is available … **The
  latter sentence applies to laboratories that acquire only septal or lateral velocities**». Con los
  dos anillos manda el promedio y nada más. Control negativo medido: con los dos anillos, un
  promedio de 14,00 (negativo) y un septal de 18,7 que SÍ cruza su 15 sale **NEGATIVO**.
  La **ASE 2025 sí** los usa como alternativas y eso está impreso en su Figura 3: son dos guías y
  dos lecturas del mismo trío de números. **Y los operadores tampoco son los mismos** —la 2016 con
  `>` y la 2025 con `≥`—, así que un E/e′ de 14,00 exacto es negativo en una y positivo en la otra.

- **EL ROJO DE LA CELDA DEL E/e′ YA NO SALE DE UN 14 FIJO: LE PREGUNTA AL DUEÑO DE LA GUÍA EN
  VIGOR.** Lo hace `diastEeElevadaVigente`, que lee el estado de las filas de E/e′ del evaluador. El
  14 fijo no podía representar nada de lo que hay: la ASE 2025 corta el promedio en `≥ 14` y la 2016
  en `> 14`, con un anillo solo los cortes son 15 y 13, y las tres ramas de FA cortan el septal en
  11. ⚠️ **ESTO CIERRA LA DEUDA QUE EL COMENTARIO DE HEAD DECLARABA**: `eeCorteEs14()` excluía la FA
  de la BSE por completo, así que un E/e′ septal de 18,3 que SÍ es criterio positivo de la Figura 19
  quedaba en negro. Medido: el color se pinta en **9 de 18 escenas donde antes no** —las tres ramas
  de FA incluidas— y en NINGUNA deja de pintarse. Con el criterio sin evaluar **no se pinta**: el
  gris es «no se midió» y el rojo sería afirmar.
- ⚠️ **VERIFICADO QUE LA CADENA DEL COLOR ES PURA ANTES DE LLAMARLA DESDE EL PINTADO:** los cuatro
  evaluadores y las siete funciones que consumen dan **cero** escrituras de DOM. Un evaluador que
  pintara, llamado desde el pintado, es un bucle.
- **LOS DOS RÓTULOS DEL CUADRO DECÍAN «promedio» CON UN SOLO ANILLO MEDIDO**, o sea el cuadro
  afirmando un promedio de dos valores sobre un dato que tenía uno. Los escribe
  `diastRotulosSitioSync`, que **sólo cambia el TEXTO**: no lee ni escribe un valor. Medido en 12
  escenas: cambian las 6 con un anillo solo y las 6 con los dos o con ninguno siguen en «promedio».
  ⚠️ **Con la BSE y un anillo solo el renglón queda en «—» mientras el rótulo ya nombra el sitio.**
  Es PREEXISTENTE —antes decía «promedio» sobre el mismo «—»— y lo que esta tanda hace es que se
  vea. `PENDIENTES.md` → C9.
- **EL IMC DE 86,7 kg CON 170 cm CRUZABA EL `> 30` POR PUNTO FLOTANTE.** `(170/100)**2` vale
  `2.8899999999999997`, así que el IMC daba `30.000000000000004` y el criterio salía POSITIVO por un
  error de representación de 4e-15, con la fila mostrando «30.0» al lado de un ✗. Se redondea a un
  decimal en `_diastFADatos`, el dueño de los insumos, y **no** en cada comparación. `getIMC`,
  `calcBSA` y el PDF **no se tocaron**. ⚠️ **El redondeo también deja negativo un IMC real de 30,03**,
  que en HEAD era positivo: es el precio del decimal y es el lado conservador. `PENDIENTES.md` → C8.
- **EL PDF DECÍA «TDA» Y EL CAMPO ES EL «TDE».** Un rótulo, no un valor: «TDA» se lee como la onda A,
  que es la otra medición. Verificado en el armador: el único `lbl` de esa fila cambió.

- **EL LABORATORIO GANA UN QUINTO TOKEN SIN GRADO, `ase2016_sin_grado`**, con el mecanismo de los
  cuatro de la BSE: rótulo en la columna de TEXTO («Disfunción, sin grado (ASE 2016)»), ningún
  `DD_*` y ninguna entrada en la distribución del panel. ⚠️ **EL MOTIVO DE FONDO ES `DD_Sin`**, que
  vale `(gd === 'sin' || (gd === null && eeDoc)) ? 1 : 0`: con `null` y el E/e′ documentado, un
  estudio que AFIRMA disfunción **sumaba en «Sin disfunción»**. Medido con un paciente real de la 8A:
  **DD_Sin pasa de 1 a 0**, el informe y el EN SUMA salen **idénticos letra por letra** y el Excel
  sigue en 435. Tabla de las 12 frases de las tres guías, antes y después: **cambia UNA**.
  ⚠️ **El regex exige el punto o la cita de la guía, y está anclado a principio de oración**:
  «Disfunción diastólica» es el arranque de DIEZ frases de esta app, censadas una por una, y las
  otras nueve ya tienen su token. La «indeterminada» **sigue en `null`** a propósito: no afirma
  disfunción. `PENDIENTES.md` → C10.

- **CONTROL NEGATIVO MAYOR: con el S/D sin elegir, el LARS positivo y los suplementarios nuevos
  vacíos, las SEIS superficies de 12 escenas —las tres guías en ritmo sinusal y en FA— dan 0
  diferencias contra HEAD en los commits 1 a 5, y 1 en el 6** (la escena de la 8A, que es la que el
  Laboratorio tenía que empezar a clasificar). Las seis, enumeradas una por una: informe en tres
  estilos, EN SUMA en tres, Excel con sus 435 columnas, franja del PPT, grado del Laboratorio y el
  hash de los campos guardados **descontando los dos `<textarea>`**.
- **Arnés: `scripts/_probe_diastcompl.mjs`** (A/B de solo lectura con `--file`), once grupos (`sd`,
  `sdlegado`, `lars`, `supl`, `ee2016`, `rotulos`, `imc`, `lab`, `vacio`, `superficies`, `otras`),
  **36 escenas de S/D con acuerdo cuadro↔ventana 36 de 36**, 18 de legado, 20 pares de LARS, 7
  tripletes de suplementarios (21 de 21 en acuerdo), 4 de E/e′ por sitio (12 de 12) y 10 de IMC.
  **Cobertura: TC-459**, **60 condiciones** con tres denominadores y nueve controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 39 de las 60 en rojo**; las 21 que
  pasan son los controles negativos y lo que esta tanda no mueve.
- ⚠️ **CUATRO ESCENAS DE MI PROPIA SONDA NO MEDÍAN SU CORTE, Y PARECÍAN MEDICIONES BUENAS.** El S/D
  vota en el segundo paso de la ASE 2025 sólo si el paciente llegó ahí, y en la Figura 18 de la BSE
  sólo si el LARS cayó en la zona intermedia: con el paso 1 en tres positivos la figura cierra sin
  consultarlo, y con los dos criterios negativos los dos lados dan grado I. Las tablas decían «el
  corte no funciona» sobre cortes que funcionan. Es la misma lección que los tripletes de borde de
  la tanda anterior: **cada escena tiene que dejar un criterio ya positivo**, y hay que **informar
  el estado de la FILA al lado del veredicto**.
- ⚠️ **Y UN A/B QUE USA UNA OPCIÓN QUE HEAD NO TIENE COMPARA DOS ESCENAS DISTINTAS.** Dos escenas del
  grupo del LARS fijaban el S/D en «≤0,67», que nace en el commit 1: el A/B informó cuatro
  diferencias **con el LARS POSITIVO**, donde el valor absoluto no puede cambiar nada. Para aislar un
  commit hay que usar valores que existan en los DOS árboles.
- ⚠️ **EL CUERPO DE UN CASO SE EVALÚA EN UNA FUNCIÓN QUE NO ES `async`.** Un `await` en su nivel
  superior tira «SyntaxError: missing ) after argument list» y el caso **muere por excepción**, sin
  decir qué condición fallaba. Los casos que usan `fetch` lo envuelven en un
  `(async function(){…})()` propio; para leer el fuente alcanza `document.documentElement.innerHTML`,
  que es sincrónico.
- ⚠️ **SEMGREP CAZÓ UN ERROR DE SINTAXIS QUE `check_backticks.py` NO PODÍA VER.** Al recortar un
  bloque para reemplazarlo me llevé la apertura `/*` del comentario de la función siguiente:
  `PartialParsing — 2 líneas sin analizar`, donde HEAD daba 127 limpio. Es por qué el protocolo pide
  **Semgrep sobre el propio diff** y no sólo sobre código ajeno.
- ⚠️ **Me comí el acento grave CINCO veces**, todas en comentarios míos dentro del cuerpo de un caso
  o del template de la sonda, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta las cinco veces mientras `node --check` apuntaba a
  la apertura del template, decenas de líneas antes.
- ⚠️ **Y UN FALSO DE MI PROPIA ADAPTACIÓN DE TC-260:** el `limpiar()` de ese caso vacía sólo los
  cuatro campos de vena pulmonar, así que la escena «sin ningún dato» heredaba el E/e′ de la escena
  anterior y medía SU color. Es la trampa del denominador aplicada al estado de PARTIDA.

### Función diastólica ASE/EACVI 2016 en ritmo sinusal — los DOS algoritmos de la Figura 8 (2026-10-12)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`9998223`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **seis**
  commits de la tanda de la pared del VD y el Tei ya incluidos **y pusheados**. Los **seis** commits
  de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 6 → 5 → 4 → 3 → 2 → 1.**
  El 1 crea `diastASE2016Evaluar`, que es el dueño único; **del 2 al 4 cuelgan todos de él** —cada
  uno reescribe una parte de esa función—, así que revertir el 1 sin revertir antes los otros tres
  deja el cuadro y la ventana llamando a una función que no existe, y un `ReferenceError` en la
  evaluación de un `<script>` **aborta el bloque COMPLETO**: la app con cero pestañas con geometría.
  **El 4 depende del 3**, porque el `sufFevi` y la rama de FEVI deprimida que reescribe nacen ahí.
  **El 5 (TC-458) y el 6 (documentación) se revierten solos**, y revertir cualquiera de los cuatro
  primeros sin el 5 deja TC-458 en rojo.
  ⚠️ **SON SEIS COMMITS Y LA TAREA PEDÍA SEIS, PERO NO SON LOS SEIS DE LA TAREA.** El commit 4 de la
  orden —TDE y TRIV— **no existe**: la guía no los asigna a ningún paso de sus algoritmos de ritmo
  sinusal (ver abajo), así que se omitió. El cuarto commit real es la corrección de la frase
  «(1/3 criterios positivos)», que **la destapó TC-458** y no estaba en la orden.

- **Línea base al cierre: suite 469/473 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 435 columnas.** Los cuatro rojos son los de entrada y NO son regresiones: **TC-223** (el
  documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**. **El denominador subió a
  473**: esta tanda agregó **TC-458**. La de ENTRADA, medida en HEAD limpio el 2026-10-12, fue
  **468/472** con el pendrive montado y los mismos cuatro rojos, con el `md5` de `index.html` sin
  moverse durante las dos corridas.
  ⚠️ **TC-260 ES UN TERCER INESTABLE POR ORDEN DE CORRIDA, junto a TC-246 y TC-252.** Sale rojo en
  un `--solo` de nueve casos y verde solo, y **falla IGUAL en un worktree de HEAD con el mismo
  `--solo`**: es inestabilidad del conjunto, no una regresión. En la suite completa está verde.
- **Dónde está todo:** `docs/mapa/diastolica-ase2016.md` (**mapa NUEVO**: el dueño, los dos
  algoritmos, el corte de FEVI, el S/D, las frases, el Laboratorio y las trampas),
  `docs/fuentes/FUENTES.md` → `### aseDiast2016 — ASE/EACVI 2016, RITMO SINUSAL` (los folios, las
  dos figuras leídas a 230 dpi, las cuatro salidas de la caja y lo que la guía NO dice),
  `docs/PENDIENTES.md` → **ocho** cosas declaradas y no tocadas (A1 a A8).

- ⚠️ **EL CUADRO Y LA VENTANA CORRÍAN DOS ALGORITMOS DISTINTOS DE LA MISMA GUÍA, Y ACORDABAN EN 9 DE
  31 ESCENAS.** El cuadro gris votaba los TRES criterios de presión de llenado —la **Figura 8B**— y
  la ventana del 🧭 votaba CUATRO variables con la regla de la mitad —la **Figura 8A**—, a un clic de
  distancia sobre el mismo paciente. Hoy las dos leen `diastASE2016Evaluar` y acuerdan en **32 de 32**; en HEAD, 9 de 32. Es el tercer caso idéntico de este archivo, después de la ASE 2025 y la BSE 2024.
- ⚠️ **CON TRES CRITERIOS DISPONIBLES Y UNO POSITIVO LA APP DECÍA «INDETERMINADA» Y LA GUÍA DICE LAP
  NORMAL, GRADO I.** No sale de leer la figura: el folio 286 lo escribe en prosa —«If all three
  parameters are available for interpretation and only one of three meets the cutoff value, then LAP
  is normal and there is grade I diastolic dysfunction»— y el Key Point 5 del folio 287 lo repite.
  Un positivo sobre tres es la rama «2 de 3 negativos» mirada del otro lado.
- ⚠️ **EL MISMO NUMERADOR CON OTRO DENOMINADOR CAMBIA DE CASILLA.** 1 y 1 sobre DOS disponibles es la
  sub-caja «When only 2 criteria are available», que va a «Cannot determine»; 1 sobre TRES es grado I.
- ⚠️ **EL `e' PROMEDIO < 8` NO EXISTE EN ESTA GUÍA Y LA APP LO USABA.** El folio 281 da septal < 7 y
  lateral < 10, y ningún corte de promedio. Y el e′ **no vota en la 8B** por ninguna puerta: la app
  lo usaba de desempate con 0 criterios positivos. **El `eprom < 8` sólo podía disparar SOLO con un
  anillo septal entre 7 y 8 y sin lateral** —con los dos anillos es imposible, septal ≥ 7 y lateral
  ≥ 10 dan promedio ≥ 8,5—, así que cualquier otra escena lo confunde con el corte del lateral. El
  mensaje del commit 2 atribuyó mal una escena por esto; la medición (7 escenas movidas) está bien.
- **LA FEVI ELIGE EL ALGORITMO Y EL NÚMERO ES DE LA GUÍA: folio 285, «normal LVEF (≥50%)».** Se
  reusa `UMBRAL_FEVI_NORMAL`, que ya valía 50: declarar una constante nueva con el mismo número es el
  defecto que este archivo ya pagó tres veces. Medido con el borde 49/50/51: el **50 exacto es FEVI
  normal**, o sea 8A.
- ⚠️ **SIN FEVI CARGADA LA APP NO INVENTA.** Corre la 8B —lo que ya hacía— y lo dice en la ventana, y
  **no** la trata como deprimida: ni el S/D ni la rama de «0 positivos → grado I» entran ahí.
- ⚠️ **LA 8A NO TIENE ATAJOS DE FLUJO MITRAL, Y ESO MUEVE INFORMES.** Medido: con FEVI 60 y E/A 2,33
  el paciente pasa de «Grado III» a «Disfunción diastólica» sin grado, porque el grado III es una
  casilla de la **8B**. La E/A y la onda E se dibujan en la ventana bajo «No son insumos de la 8A»,
  para que su ausencia no se lea como un dato sin cargar.
- **UNA SOLA FRASE NUEVA, y existe porque la guía no manda graduar al que la 8A diagnosticó:** no hay
  flecha entre la casilla «Diastolic Dysfunction» y la 8B, y la condición de entrada a la 8B es la
  enfermedad miocárdica. Informe: «Disfunción diastólica (N de M criterios positivos, ASE/EACVI
  2016); el algoritmo para FEVI normal no gradúa.» EN SUMA: «Disfunción diastólica.»
- ⚠️ **Y UNA FRASE QUE DEJÓ DE EMITIRSE, QUE LA DESTAPÓ TC-458 Y NO LA LECTURA.** «Función diastólica
  indeterminada (1/3 criterios de presión de llenado positivos).» era cierta mientras un positivo
  sobre TRES salía indeterminado; desde que esa combinación es grado I, sólo podía aparecer con DOS o
  UN criterio disponible, o sea afirmando un denominador que el estudio no tiene **en un informe
  firmado**. Se publica la corta, que es la otra frase que la app ya tenía para el mismo estado.
- ⚠️ **CON UNA SOLA VARIABLE LA 8A NO AFIRMA, Y ES UNA DECISIÓN MÍA DECLARADA.** La regla de la mitad
  sobre un denominador de 1 convierte un único parámetro en «hay disfunción» o en «es normal», y la
  guía no tiene rama para eso —su ejemplo del folio 281 usa tres—. `PENDIENTES.md` → A3.
- **EL S/D VENOSO PULMONAR TIENE TRES COMPUERTAS, NO UNA:** FEVI deprimida (pie de la Figura 8 y Key
  Point 6 del folio 287), **falta uno** de los tres principales (folio 286) y valor «< 1». Y **sólo
  suma del lado positivo**: la guía no dice nada del ≥ 1. Los tres controles negativos están medidos.
- **EL TDE Y EL TRIV NO ENTRAN EN NINGUNO DE LOS DOS ALGORITMOS, y por eso el commit 4 no existe.**
  Censo: en la página de la Figura 8 (folio 290) **no aparece ni una vez** `DT`, `IVRT` ni
  `deceleration`; todas las menciones de IVRT del documento caen en poblaciones especiales y en la
  Tabla 6 del folio 296. Del TDE el folio 286 dice lo contrario de usarlo como paso: con E/A ≥ 2 y
  DT > 160 ms, «the writing group recommends using **only the E/A ratio** in the classification
  scheme». Medido además con control negativo: cargar TDE 140 y TRIV 60 no mueve nada.
- **EXCEL: 435 COLUMNAS, SIN UNA SOLA NUEVA**, con el mismo juego de claves y **cero campos del
  estudio distintos** en las cinco escenas del grupo `excelab`. Lo único que se mueve son las celdas
  que derivan del TEXTO: `Grado disfunción diastólica` y los cuatro `DD_*`.
- ⚠️ **EL LABORATORIO CUENTA LA FRASE NUEVA COMO «SIN DISFUNCIÓN», Y ES PREEXISTENTE.**
  `_labDiastGrado` devuelve `null` para «Disfunción diastólica.», y `DD_Sin` vale
  `(gd === 'sin' || (gd === null && eeDoc)) ? 1 : 0`: con el E/e′ documentado, ese estudio **suma en
  la columna de «Sin disfunción»** aunque su propio texto afirme lo contrario. Le pasaba igual a la
  «indeterminada» que la app ya publicaba. **No se tocó el Laboratorio** (orden expresa);
  `PENDIENTES.md` → A4 y A5.
- **NO SE APLICÓ LA REGLA DE SALIDA:** separar por FEVI no necesitó campos nuevos, no movió las 435
  columnas y no tocó código compartido con otras guías ni con la fibrilación auricular.
- **CONTROL NEGATIVO MAYOR: la ASE 2025 y la BSE 2024 en sinusal y las TRES guías en fibrilación
  auricular, 30 escenas, 0 diferencias contra HEAD** en badge, frase del informe, frase del EN SUMA,
  las tres celdas compartidas y el resultado de la ventana.
- **Las seis superficies, enumeradas una por una** (informe en tres estilos, EN SUMA en tres, Excel
  con sus 435 columnas, franja del PPT, Laboratorio y el hash de los campos guardados) sobre 32
  escenas: **15 salen idénticas a HEAD** y las **17** que cambian son todas de la ASE 2016 en
  sinusal. La medición de las seis superficies se corrió en el commit 3 y dio 15 escenas movidas;
  el commit de la frase «(1/3 criterios positivos)» movió **dos** más —las dos de «cannot
  determine»— y el A/B final del cuadro las cuenta: 17. **Dos mediciones de dos commits distintos no
  se restan**, que es la misma clase de falso que este archivo ya documenta para el pendrive y para
  las fechas.
- **Arnés: `scripts/_probe_ase2016.mjs`** (A/B de solo lectura con `--file`), ocho grupos (`cuadro`,
  `ventana`, `conteo`, `fevi`, `bordes`, `superficies`, `excelab`, `lab`, `otras`), 32 escenas y
  **9 tripletes de borde que separan los dos lados, 9 de 9**, cargados con teclas reales.
  **Cobertura: TC-458**, 52 condiciones con cinco denominadores y nueve controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 28 de las 52 en rojo**; las 24 que
  pasan son los controles negativos y lo que esta tanda no mueve.
- ⚠️ **LA PRIMERA TABLA DE BORDES DE MI PROPIA SONDA NO SEPARABA NADA, Y PARECÍA UNA MEDICIÓN BUENA.**
  Con FEVI deprimida, 0 y 1 criterios positivos dan los DOS grado I, así que los tripletes de E/e′,
  IT y Vol AI salían idénticos en los tres valores y la tabla decía «ningún corte funciona» sobre
  cortes que funcionan. Cada triplete tiene que dejar **un criterio ya positivo** para que cruzar el
  corte mueva grado I → grado II. Y **los dos atajos se miden por el TEXTO, no por el badge**:
  «relajación prolongada» y «relajación alterada» publican el mismo «Grado I». TC-458 ya lo hacía
  bien; la sonda no.
- ⚠️ **TC-27, TC-28 Y TC-29 NO SON CASOS DE LA ASE 2016, aunque la orden los daba por tales.** No
  fijan `diast_algoritmo`, así que corren el protocolo por defecto, que es la **ASE 2025**; sus
  frases son las de esa guía. Antes de esta tanda la zona **no tenía NINGUNA cobertura automática
  del veredicto**: TC-454 y TC-456 la usan sólo como control negativo y TC-421 mide el desplegable.
- ⚠️ **Me comí el acento grave DOS veces**, las dos en comentarios míos dentro del cuerpo de TC-458,
  con el archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea
  exacta las dos veces (2112 y 2270) mientras `node --check` apuntaba a la 2009, que es la apertura
  del template. **Y una tercera trampa, nueva:** un regex `/1\/3/` dentro de un template literal se
  cocina a `/1/3/` —la barra escapada deja de estarlo— y revienta con «Invalid regular expression
  flags» en tiempo de EJECUCIÓN, no de parseo, así que `node --check` pasa limpio. Va por `indexOf`.

### Pared del VD e índice de Tei (DTI) — dos campos, dos cortes de la ASE 2025 y la sigla HVD (2026-10-12)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`257f1ee`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **seis**
  commits de la tanda del strain de la AI y la onda L ya incluidos **y pusheados**. Los **seis**
  commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 6 → 5 → 4 → 3 → 2 → 1.**
  El 1 crea los dos campos, los tres cortes, `VD_NUEVOS_BANDA` y `vdMarcaSync`; **del 2 al 4
  cuelgan todos de él**, así que revertir el 1 sin revertir antes los otros tres deja `calcVD` y
  `generarInforme` nombrando constantes que ya no existen, y un `ReferenceError` en la evaluación
  de un `<script>` **aborta el bloque COMPLETO** — o sea la app con cero pestañas con geometría.
  **El 4 depende del 3**, y no al revés: el `_hvdInf` que la cadena del EN SUMA consulta nace en el
  3. **Y el 2 tiene que revertirse DESPUÉS del 3**, porque el 3 reescribe las mismas líneas del
  cuadro que el 2 creó. **El 5 (TC-457) y el 6 (documentación) se revierten solos**, y revertir
  cualquiera de los cuatro primeros sin el 5 deja TC-457 en rojo.

- **Línea base al cierre: suite 468/472 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 435 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base—.** Los cuatro rojos son los de entrada y NO son regresiones: **TC-223** (el documentado,
  falla por la fecha), **TC-376**, **TC-390** y **TC-406**. **El denominador subió a 472**: esta
  tanda agregó **TC-457**. La de ENTRADA, medida en HEAD limpio el 2026-10-12, fue **467/471** con
  el pendrive montado y los mismos cuatro rojos, con el `md5` de `index.html` sin moverse durante
  la corrida.
  ⚠️ **TC-246 Y TC-252 SALIERON ROJOS EN LA CORRIDA DE ENTRADA Y VERDES CORRIDOS SOLOS**, que es lo
  que la orden avisaba. Son inestables conocidos: la cifra de entrada es 467/471 y no 465/471.
  **Repetir antes de sospechar.**
- ⚠️ **EL CHEQUEO DE CELULAR SUBIÓ +2 EN LA CUENTA COMPLETA, Y HAY QUE MEDIR HEAD EL MISMO DÍA PARA
  SABERLO.** `--todo` da **374 a 360 px y 383 a 390 px** contra **372 y 381 en HEAD medido hoy**;
  los dos hallazgos nuevos son `input-chico` (BAJA), los dos campos nuevos contados igual que los
  otros 329 `input` de la app. El renglón viejo de este archivo decía 367/376 y es de **otro día**:
  restarle da «+7», que es la clase de falso que este archivo ya documenta para el pendrive.
  La cuenta VISIBLE —la que compara la línea base— no se movió: 43 y 52, con la misma única ALTA
  (`#caso_interes`, preexistente y ajena).
- **Dónde está todo:** `docs/mapa/vd-derecho.md` (**mapa NUEVO**: los campos, las siete filas del
  cuadro, los dueños del estado, el OR de la disfunción sistólica, las dos superficies y las
  trampas), `docs/fuentes/FUENTES.md` → `### aseVd2025` (los folios, los dos cortes del Tei, cómo
  se mide la pared y las advertencias), `docs/PENDIENTES.md` → **diez** cosas declaradas y no
  tocadas (V1 a V10).

- **LOS DOS CORTES SALEN DE LA ASE 2025 DE CAVIDADES DERECHAS, Y EL FOLIO ES LA PÁGINA DEL PDF + 140**
  (comprobado en el pie impreso de tres páginas, no por aritmética). Pared del VD: normal
  **< 5 mm**, o sea hipertrofia con borde **`>=`** (Key Point folio 144 + Tabla 1 folio 145 + Tabla 6
  folio 169, las tres coinciden). Tei por **DTI**: normal **< 0,55**, alterado con borde **`>=`**
  (Tabla 1 folio 145 + texto folio 158).
- ⚠️ **LOS DOS OPERADORES SON `>=`, ASÍ QUE EL VALOR DEL CORTE CAE DEL LADO ANORMAL.** El recuerdo de
  «> 5 mm» deja los 5,0 mm exactos del lado NORMAL, y 5 es un número que se tipea entero. Lo mismo
  con el 0,55. TC-457 lo fija con el valor exacto por sus dos lados.
- ⚠️ **EL TEI TIENE DOS CORTES Y SON DE DOS MÉTODOS: 0,55 por DTI y 0,40 por Doppler PULSADO.** La
  guía declara que la correlación entre métodos es sólo **moderada** (folio 158), así que no se
  unifican. `VD_TEI_PW_ALT_MIN` existe **declarado y sin aplicar**, para que un borde se entienda al
  lado del que no se eligió: aplicar el del pulsado a un valor de DTI mueve el corte un **27 %**.
  El rótulo del campo dice «(DTI)» y el informe imprime «Tei 0.62 (DTI)» por lo mismo.
- ⚠️ **LA GUÍA NO DICE QUE EL TEI SE SEUDONORMALICE CON LA PRESIÓN DE LA AD ELEVADA, Y LA ORDEN LO
  PROPONÍA COMO HIPÓTESIS.** Barrido del PDF completo (`Tei`, `MPI`, `myocardial performance`,
  `wall thickness`, `RVWT`, `RVH`, `hypertroph`): para la congestión derecha describe lo
  **CONTRARIO** —alarga IVCT e IVRT y **SUBE** el índice «regardless of RV systolic function»—. Lo
  que sí dice, en el folio 159, es que la **IT severa acorta el IVRT** sin tocar el IVCT y que los
  **R-R variables, como en la FA**, dan ET y TCO variables. El cartel ámbar nombra sólo esas dos,
  que además son las que la app puede detectar. Las otras tres advertencias están en
  `docs/PENDIENTES.md` → V8, con el motivo de por qué no se detectan.
- ⚠️ **EL CARTEL SALE TAMBIÉN CON UN TEI NORMAL, Y ES CORRECTO.** Lo que se advierte es la validez de
  la medición, no la dirección del veredicto: la IT severa acorta el IVRT, o sea empuja el índice
  hacia el lado **tranquilizador**. Medido: Tei 0,45 con IT severa publica el cartel y el veredicto
  sigue siendo «función sistólica conservada».
- ⚠️ **EL MOTIVO DE LA IT ES «SEVERA» Y NO «SIGNIFICATIVA».** `DT_IT_SIGNIF` vale **2** (moderada) y
  es el corte de la salvedad DIASTÓLICA, que sale de la ASE 2010 sobre otros parámetros. Acá la guía
  escribe «Severe TR», o sea `it_grado === '4'`: reusar el 2 habría ampliado el alcance de una
  advertencia a pacientes que su fuente no nombra. Control negativo medido: con IT moderada el
  cartel NO sale.
- **LA DISFUNCIÓN SISTÓLICA DEL VD NO ES «N PARÁMETROS ALTERADOS»: ES UN OR, Y UNO ALCANZA.** La
  regla de HEAD es `tapseBajo || spBajo || facBajo`, cada uno contando sólo si está medido. El Tei
  entra como **cuarto término del mismo OR** y nada más. Medido en 21 escenas: **las 7 combinaciones
  SIN Tei dan 0 diferencias contra HEAD**, un Tei normal nunca mueve el veredicto y sólo se nombra,
  y un Tei alterado da vuelta la única combinación que podía darlo vuelta («ninguno alterado»).
- ⚠️ **EL TEI Y LA HIPERTROFIA TUVIERON QUE ENTRAR EN LA COMPUERTA DEL BLOQUE, Y SIN ESO DESAPARECÍAN
  EN SILENCIO.** El `if` que envuelve el bloque 5 de `generarInforme` tenía cuatro condiciones y
  ahora tiene seis: `teiVD !== null` entra por `hayFunc` y la hipertrofia es una condición propia.
  Sin eso, un estudio cuyo ÚNICO dato del VD fuera el Tei —o la pared— perdía la oración completa:
  el médico lo tipeó y no aparecía en ningún lado. Es el mismo agujero que el comentario de
  `tapse || sp` documenta y el que la diastólica tricuspídea reintrodujo por la puerta de al lado.
  **La pared NORMAL no entra**: la app no dice «sin hipertrofia» en ninguna parte, así que dejaría
  la oración en «Ventrículo derecho.» pelado. Está en `PENDIENTES.md` → V2.
- **EL TEI SE NOMBRA EN EL PARÉNTESIS CUANDO ESTÁ MEDIDO.** Sin eso, un paciente con TAPSE, S′ y FAC
  NORMALES y el Tei alterado publicaba «con disfunción sistólica (TAPSE 22 mm, S′ 12 cm/s, FAC 40%)»:
  la afirmación al lado de tres números que la niegan y sin el que la sostiene.
- **LA CLÁUSULA DE HIPERTROFIA TIENE DOS FORMAS, Y NO ES CAPRICHO.** Con cláusula previa el sujeto ya
  quedó dicho y nombra el órgano —«, con hipertrofia del ventrículo derecho (pared de 7 mm)», el
  texto aprobado—; sin cláusula previa el sujeto ES la oración entera y ese mismo texto diría dos
  veces «ventrículo derecho» en cinco palabras, así que queda «Ventrículo derecho con hipertrofia
  (pared de 7 mm).». Las dos ramas están medidas y las fija TC-457.
- **EL EN SUMA: la cadena de la hipertrofia es NUEVA y la de HEAD queda INTACTA en el `else`.**
  Medido en la tabla completa de 24 escenas: **las 12 sin hipertrofia escriben lo de HEAD letra por
  letra**. Las ocho frases que pidió Maicol salen con su forma exacta.
  ⚠️ **TRES DESVÍOS DE LA LETRA DE LA ORDEN, los tres para no PERDER información:** el **grado** de
  la diastólica se conserva («y diastólica severa» en vez de «y diastólica»), porque borrarlo sacaría
  del resumen firmado un dato que hoy sale; con la clasificación diastólica **incompleta** se usa
  «patrón sugestivo de disfunción diastólica» y no «disfunción diastólica», porque afirmarla sería
  afirmar lo que la app no estableció; y «con función sistólica conservada» sobrevive **cuando hay
  dilatación**, que es la regla que la cadena de HEAD ya tiene.
  ⚠️ **Y UNA PÉRDIDA, que es la decisión de la orden:** con el VD **no** dilatado se pierde «de
  dimensiones normales» —el texto pedido es «HVD con disfunción sistólica.»—. `PENDIENTES.md` → V3.
- **EL LABORATORIO NO SE TOCÓ, Y ESTÁ MEDIDO CON SUS PROPIAS FUNCIONES.** «HVD» **no matchea**
  `/hipertrofia\s+ventricular\s+izq|HVI/i` y «hipertrofia del ventrículo derecho» tampoco;
  `_labGeomCat` devuelve `null` en las cinco familias de frase nueva, y el filtro de cohorte
  `filtroGeom` busca `concéntrica`/`excéntrica`/`remodelado`/`sin hipertrofia`, ninguno presente.
  ⚠️ **«Disfunción sistólica VI» y «Disfunción diastólica» YA contaban las frases del VD antes de
  esta tanda** —su regex no distingue el ventrículo—, así que el recuento no se mueve por este
  trabajo. Es una imprecisión PREEXISTENTE y queda en `PENDIENTES.md` → V4.
- **EXCEL: 435 COLUMNAS, SIN UNA SOLA NUEVA** (decisión de la orden), con el **mismo juego de claves
  con los dos campos cargados**. Los dos campos viajan con el estudio y se restauran, pero **no
  viajan al Excel**: un backup a Excel + reimportación los pierde. `PENDIENTES.md` → V6.
- **GUARDADO Y BORRADO, MEDIDO EN EL REGISTRO EN DISCO:** los dos campos viajan, vuelven al
  reabrirlo, «Nuevo estudio» los vacía **y apaga las dos marcas**, y un registro al que se le quitan
  las dos claves —o sea un estudio anterior a esta tanda— reabre con los dos campos **VACÍOS**: no se
  migra nada.
- **LAS DOS BANDAS DE PLAUSIBILIDAD, con un dueño único (`VD_NUEVOS_BANDA`) y amplias a propósito:**
  `vd_pared [1,30]` mm —el piso caza la pared tipeada en **CENTÍMETROS**, que es como la escribe la
  guía (`0,5 cm`)— y `vd_tei [0,3]` —el techo caza el **55 tipeado por 0,55**, que es el dedazo que
  esta zona tiene que cazar—. Medido: los dos quedan marcados «(revisar)», **el valor no se corrige**
  y **la cuenta no cambia** (el 55 sigue votando como alterado). Ninguno tiene columna de Excel, así
  que `LAB_XLS_RANGO_PROPIO` no los consume y no hay un segundo número que se desincronice.
- ⚠️ **LAS FILAS DE TAPSE Y S′ DEL CUADRO NO VUELVEN A «—» AL BORRAR EL DATO, Y ESTÁ MEDIDO.** Su
  `if` dentro de `calcVD` sólo PINTA: borrando TAPSE 14 y S′ 9 con teclas reales las dos filas
  siguen diciendo «Disfunción» sobre campos vacíos, mientras las cinco que resetean —las dos nuevas
  incluidas— ya están en «—». **No se tocaron**: son dos filas que esta orden no nombra.
  `PENDIENTES.md` → V1.
- **EL CUADRO PASÓ DE CINCO FILAS A SIETE, y el conteo es lo único que caza una fila duplicada o
  perdida** (TC-457 lo fija en 7). La pared va pegada al tamaño —las dos son estructura— y el Tei
  **después** de los tres parámetros sistólicos, que es el grupo al que se suma. El `div` del cartel
  ámbar **no** es un `.calc-row`, así que no entra en ese conteo.
- **`vdMarcaSync` Y `vdTeiAvisoSync` LLEVAN LAS DOS/TRES COLUMNAS.** Los dos `div` de marca no son
  `.calc-box .calc-row span[id]` ni terminan en `-aviso`: **no los alcanza ningún barrido genérico**,
  así que la marca del paciente anterior sobrevivía a «Nuevo estudio». El cartel sí termina en
  `-aviso` y el barrido le vacía el TEXTO **pero le deja el `display:block` puesto**: un renglón
  ámbar vacío sobre un formulario recién limpiado. Los dos están en `RECALC_MODULOS` y al final de
  `limpiarCampos`; el cartel además lo llama `calcVD`.
- ⚠️ **EL CARTEL NECESITÓ UN OYENTE DE DOCUMENTO, porque sus dos insumos viven en otras pestañas.**
  `it_grado` es el `<select>` del grado de la IT (Válvulas) y su `onchange` va a `valvSev.aplicar`;
  `diast_ritmo` vive en el cuadro de la diastólica del VI y llama a `calcDiastol`. **Ninguno de los
  dos pasa por `calcVD`**, así que sin el oyente el cartel se quedaba con el estado del gesto
  ANTERIOR. Es un oyente de documento y no dos llamadas sueltas en los `onchange` ajenos, para no
  tocar la cadena de `valvSev` ni `calcDiastol`.
- **MAQUETA:** el tercer `grid-3` del bloque pasó de **cuatro hijos a seis**, o sea que la segunda
  fila ya no tiene huecos. A **1200, 390 y 360 px** y en los **dos temas** los seis campos miden lo
  mismo (318 / 328 / 298 px), ninguno desborda su grilla y no hay scroll horizontal.
- **Arnés: `scripts/_probe_vdhvd.mjs`** (A/B de solo lectura con `--file`), nueve grupos (`vacio`,
  `marca`, `refs`, `bordes`, `conteo`, `suma`, `aviso`, `ancho`, `guardado`). **CONTROL NEGATIVO
  MAYOR: 11 escenas del VD con los campos nuevos VACÍOS → 0 diferencias** en informe (3 estilos),
  EN SUMA (3), Excel 435, franja del PPT, token del Laboratorio y los **1090 campos preexistentes**.
  **Cobertura: TC-457**, 58 condiciones con cuatro denominadores y nueve controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 39 de las 58 en rojo**; las 19 que
  pasan son los controles negativos y lo que esta tanda no mueve.
- ⚠️ **Me comí el acento grave TRES veces**, una en el cuerpo de la sonda y dos en comentarios míos
  dentro de TC-457, con el aviso escrito tres líneas más arriba del propio caso.
  `scripts/check_backticks.py` dio la línea exacta las tres veces (383 en la sonda; 1765 y 1769 en el
  caso) mientras `node --check` apuntaba a la 1746, que es la apertura del template.

### Strain de la AI y onda L — los campos, su sincronía y lo que las guías hacen con ellos (2026-10-12)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`14e3c0c`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad—, con los **ocho** commits de la BSE 2024 en
  ritmo sinusal ya incluidos y pusheados. Los **seis** commits de esta tanda quedan locales; el push
  lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 6 → 5 → 4 → 3 → 2 → 1.** El 1 crea
  los campos, las dos sincronías, `DIAST_STRAIN_BANDA`, `diastStrainAbs` y `diastStrainMarcaSync`;
  **del 2 al 5 cuelgan todos de él**, así que revertir el 1 sin revertir antes los otros cuatro deja
  el archivo sin las funciones que el Excel, las dos figuras de la BSE y la etapa suplementaria de
  la ASE consumen —o sea la app sin pestañas—. **El 3, el 4 y el 5 se revierten entre sí en
  cualquier orden**: el 3 toca la Figura 17, el 4 la Figura 18 y el 5 la ASE 2025, y ninguno llama a
  otro. El 2 (Excel y guardado) **también se revierte solo**, con la salvedad de que deja TC-135 y
  los otros doce casos del Excel en rojo hasta revertir su adaptación. El 6 es documentación más
  **TC-456**, que afirma el comportamiento de los cinco: revertir cualquiera sin el 6 deja TC-456 en
  rojo.

- **Línea base al cierre: suite 467/471 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 435 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base documentada: los seis campos nuevos no agregaron un solo hallazgo—.** Los cuatro rojos son
  los de entrada y NO son regresiones: **TC-223** (el
  documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**. **El denominador subió a
  471**: esta tanda agregó **TC-456**. La de ENTRADA, medida en HEAD limpio el 2026-10-12, fue
  **466/470** con el pendrive montado y los mismos cuatro rojos, con el `md5` de `index.html` sin
  moverse durante las dos corridas.
- ⚠️ **EL EXCEL PASÓ DE 434 A 435 COLUMNAS, Y ES EL PRIMER CAMBIO DE ESE NÚMERO EN MUCHAS TANDAS.**
  Una sola columna nueva —«Strain contracción AI (%)»— porque **el LARS ya tenía la suya**. Va
  PEGADA a «LARS (%)» (índices 20 y 21) en el bloque «3 · AURÍCULA IZQUIERDA», y se puede poner ahí
  porque **ningún consumidor lee por posición**: el export arma la fila como objeto y
  `_labOrdenarCols` la ordena por `LAB_XLS_MAP`, el importador lee por nombre de encabezado, y
  **CeiboAnalytics no lee este Excel** —no tiene un solo `XLSX.read` ni `sheet_to_json` ni la palabra
  «LARS»—. Trece casos de la suite adaptados con el motivo escrito, más los mapas, `PENDIENTES.md` y
  las sondas archivadas. **Lo que NO se reescribió** son las siete frases de `index.html` que
  registran una MEDICIÓN pasada («verificado en el A/B de 434»): cambiarlas diría que aquellas
  corridas compararon 435 columnas, y no fue así. Está en `docs/PENDIENTES.md` → S6.
- **Dónde está todo:** `docs/mapa/diastolica.md` → «Los campos de strain de la AI y la onda L» (el
  censo de los cuatro campos, el dueño del valor absoluto, las bandas, dónde entra cada uno y las
  trampas), `docs/fuentes/FUENTES.md` → «Strain de la AI y onda L — RE-VERIFICADO» y «Strain de
  CONDUCTO — NO ENTRA EN NINGÚN ALGORITMO», `docs/PENDIENTES.md` → **B1 CERRADO** y seis cosas
  nuevas declaradas y no tocadas (S1 a S6).

- **CUATRO CAMPOS, Y NO SON CUATRO DATOS IGUALES.** `lars` ↔ `lars_dop` (reservorio) y
  `ai_strain_ct` ↔ `ai_strain_ct_dop` (contracción, el **LAPs** de la guía) son **un solo valor cada
  uno**, editable y sincronizado en los dos sentidos con el patrón de los otros cinco grupos;
  `ai_strain_cd` (conducto) vive sólo en AI/VI y `onda_l` sólo en el Doppler mitral.
- ⚠️ **EL STRAIN DE CONDUCTO NO ENTRA EN NINGÚN ALGORITMO DE NINGUNA DE LAS TRES GUÍAS, Y ESTÁ
  CENSADO EN LOS DOS PDF COMPLETOS.** La BSE 2024 sólo habla del **volumen** de conducto, en la
  fisiología de la pág. 7; la ASE 2025 lo nombra en el protocolo de adquisición y en la tabla de
  abreviaturas del folio 546, y en ningún algoritmo. El campo es de registro: se guarda, no vota y
  no tiene columna de Excel.
- **EL VALOR ABSOLUTO TIENE UN SOLO DUEÑO, `diastStrainAbs`.** Los ecógrafos dan el strain de
  contracción y el de conducto negativos y las figuras escriben sus cortes sobre la magnitud: el
  campo guarda lo que el médico tipea y la cuenta usa `|x|`. **El LARS NO pasa por ahí**: se espera
  positivo y un negativo se MARCA «(revisar)» sin corregirse. Medido en tres pares: **+16/−16,
  +6/−6 y +12/−12 dan badge, frase del informe, frase del EN SUMA y resultado de la ventana
  IDÉNTICOS**, con el campo conservando el signo tipeado.
- **LAS FIGURAS 17 Y 18 SE RE-LEYERON DE LA IMAGEN, a 200 dpi, antes de cablear nada**, y **no se
  movió ni un corte ni un operador**: las cajas dicen exactamente lo que la tanda anterior
  registró. Lo que cambió es que los cuatro pasos que estaban en gris —«sin campo en la app»— ahora
  votan. Eso **cierra el punto B1 de `docs/PENDIENTES.md`**.
- ⚠️ **LA PRIMERA CAJA DE LA FIGURA 17 ES UN «OR» Y AHORA SE PUEDE COMPROBAR.** `pump strain ≥14%
  OR reservoir strain ≥30%`: medido, un LARS de 25 (que no cumple) con contracción 16 publica
  presión normal, y con contracción 10 no. En la Figura 18 el OR va en los DOS sentidos
  (`LARs <18 OR LAPs <8` y `LARs ≥24 OR LAPs ≥14`), y su ventana pasó de tres filas de strain a
  cuatro.
- ⚠️ **EL 14 DE LA FIGURA 18 COINCIDE CON EL DE LA 17 POR CASUALIDAD**, igual que el 18 del lado
  elevado: el 8 y el 24 no existen en la Figura 17. **Y LA ONDA L TIENE DOS CORTES**: `> 20 cm/s` en
  las dos figuras de la BSE y **`≥ 50 cm/s`** en la ASE 2025 (folio 555, verificado en el inciso b
  del texto **y** en la nota ‡ de la Figura 3, los dos con `≥`). No se unifican, igual que el LARS.
- **LA ASE 2025 USA LA ONDA L EN UN SOLO CASO, Y ES EL QUE ESCRIBE LA FIGURA.** La caja del segundo
  paso dice `If none available or reliable use Supplemental methods‡`, y la prosa del folio 554 lo
  repite: «these can be relied on in the absence of the three parameters in the section above». O
  sea `seg2Eval === 0`. Medido: con el segundo paso vacío, una onda L de 55 pasa de «No estimable» a
  «DD Grado III»; con Vol AI o con LARS cargados, el suplementario **no se consulta**.
- ⚠️ **CON EL SUPLEMENTARIO NEGATIVO NO SE AFIRMA PRESIÓN NORMAL, Y ES UNA DECISIÓN.** La flecha
  «None» de la figura sale de la caja entera, o sea de haber preguntado sus **cinco** parámetros; la
  app puede preguntar uno. Con la onda L negativa el estado se queda en el «No estimable» de HEAD,
  cuyo texto sigue siendo cierto palabra por palabra — **no cambia ni una letra del informe
  firmado** — y lo único que se agrega es que la `via` de la ventana dice que el suplementario se
  evaluó. La etapa quedó armada como **LISTA** (`ASE_SUPLEMENTARIOS`) para que el trabajo que agregue
  los otros cuatro sume una entrada y nada más.
- **EL INFORME FIRMADO NOMBRA LOS DOS PARÁMETROS NUEVOS CUANDO VOTARON**, por `_bseDetalles`, que es
  para lo que esa función existe. El strain de contracción se imprime con su **valor absoluto**, que
  es el que votó; el campo y el Excel conservan el signo. Está declarado en `PENDIENTES.md` → S5.
- **GUARDADO Y BORRADO, MEDIDO EN EL REGISTRO EN DISCO:** los seis campos viajan con el estudio,
  vuelven al reabrirlo, y «Nuevo estudio» vacía los seis **y apaga las seis marcas**.
  ⚠️ **LAS DOS SINCRONÍAS NO ENTRAN EN `RECALC_MODULOS`**, a diferencia de `dtTapSync` y
  `etTsvdSync`, y es una decisión: un estudio anterior a esta tanda trae `lars` y no `lars_dop`, y
  copiarlo al abrir sería migrar el registro en silencio. Medido: un registro al que se le quitan
  las cinco claves nuevas reabre con `lars = 27` y **las cinco vacías**. Lo que sí entra —y además al
  final de `limpiarCampos`, que no pasa por ese embudo— es `diastStrainMarcaSync`, que sólo pinta.
- **LA MARCA «(revisar)» NO MUEVE NINGÚN VEREDICTO** y sale al lado de **CADA** campo, en los seis
  renglones. Bandas: `[0,60]` para el LARS —la que **ya tenía dueño** en `LAB_XLS_RANGO_PROPIO`, con
  su motivo escrito—, `[-60,60]` para los dos strain —**simétricas**: es la banda del valor absoluto
  escrita sobre el valor crudo, así que un −16 no se marca y un −160 sí— y `[0,200]` para la onda L,
  que arranca en 0 porque es una velocidad. La del strain de contracción la reusa el importador
  **por referencia**, no por un literal repetido.
- ⚠️ **UN LARS NEGATIVO YA DABA VUELTA EL VEREDICTO EN HEAD, Y NADIE LO DECÍA.** `lars` entra crudo
  a las dos figuras, así que un −32 cumple `< 18` y publica «presión elevada». No es una regresión
  —es el comportamiento de HEAD— y lo que esta tanda agrega es que ahora se ve: el campo sale
  marcado «(revisar)» en los dos lugares.
- ⚠️ **TIPEAR EN UN CAMPO QUE NO EXISTE NO ES UNA MEDICIÓN, Y LA SONDA LO HIZO UNA VEZ.** Contra el
  árbol de HEAD estos campos no están; `clicEn` devolvía «NO SE PUDO», el foco quedaba en el campo
  anterior y los caracteres se le concatenaban. **Medido: tipear «15» en `lars_dop` sobre HEAD dejó
  el E/e′ en 1848,5 en vez de 18,5**, y la sonda informó ese paciente inventado como una diferencia
  del commit. Hoy `tipear()` aborta si el nodo falta.
- ⚠️ **Y LOS DOS HASHES DEL A/B HAY QUE DESCONTARLOS.** El de «campos» tiene que excluir los seis ids
  nuevos además de `informe_texto` y `en_suma`, y el del Excel tiene que compararse **sin la columna
  nueva** (`hashSinNueva`). Sin eso el A/B dice «distinto» en TODAS las escenas por el solo hecho de
  que los campos y la columna existen, y deja de distinguir «se agregó algo» de «cambió otra cosa».
- **CONTROL NEGATIVO MAYOR, 13 de 15 escenas con 0 diferencias:** con los campos nuevos VACÍOS, las
  tres guías en ritmo sinusal y en FA dan cuadro, informe en tres estilos, EN SUMA, grado del
  Laboratorio, franja del PPT, **las 434 columnas preexistentes del Excel** y los **1084 campos
  preexistentes** idénticos a HEAD. Las dos restantes cargan el LARS desde `lars_dop`, que HEAD no
  tiene — y en el árbol nuevo dan el **mismo** veredicto de FA que cargándolo desde AI/VI.
- **La ASE/EACVI 2016 no se tocó, y está verificado en el original**: barrido del PDF entero
  buscando `L-wave`, `reservoir/pump/conduit strain`, `LARs` y `LAPs` → 13 coincidencias y **todas**
  son referencias bibliográficas o el «optimal waveform» de la tabla de adquisición.
- **MAQUETA:** los tres campos de cada fila miden lo mismo y ninguno desborda su grilla, a **1200,
  390 y 360 px** y en los **dos temas**, sin scroll horizontal. En AI/VI los tres strain quedan en
  la misma fila; en el Doppler la onda L, el LARS y el strain de contracción ocupan los tres lugares
  libres de la fila del VTI mitral de entrada.
- **Arnés: `scripts/_probe_strainai.mjs`** (A/B de solo lectura con `--file`), once grupos
  (`sinc`, `marca`, `vacio`, `bse17`, `bse18`, `ase`, `bordes`, `signo`, `excel`, `ancho`,
  `guardado`), **10 tripletes de borde** cargados con teclas reales y los seis campos leídos con su
  marca al lado. **Cobertura: TC-456**, 46 condiciones con cuatro denominadores y seis controles
  negativos. **Verificado que sabe fallar contra HEAD en un worktree aparte: 27 de las 46 en rojo**;
  las 19 que pasan son los controles negativos y lo que esta tanda no mueve.
- ⚠️ **Me comí el acento grave UNA vez**, en un comentario mío dentro del cuerpo de TC-456, con el
  archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea exacta
  (1546) mientras `node --check` apuntaba a la 1466, que es la apertura del template.


- Al **empezar** la tanda de la FUNCIÓN DIASTÓLICA ASE 2025 (2026-10-12), `main` local y
  `origin/main` estaban los dos en **`916764d`**, sin nada sin pushear. Los **cinco** commits de
  esa tanda (`fcc8725`, `7629b03`, `51b0316`, `33f9ddb` y este) quedan locales; el push
  lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.** No se
  revierten solos y en cualquier orden, y conviene saber por qué: los commits 2 y 3 editan la
  MISMA función (`diastASE2025Evaluar`, que nace en el 1), así que revertir el 1 sin revertir
  antes el 2 y el 3 deja el archivo sin la función que los dos consumidores llaman — o sea la app
  sin pestañas. El 4 (el aviso ámbar) **sí** se revierte solo: no toca el veredicto. El 5 es
  documentación más **TC-453**, que afirma el comportamiento del 3: revertir el 3 sin el 5 deja
  TC-453 en rojo.

### BSE 2024 en ritmo sinusal — la Tabla 2 por edad y sexo y las Figuras 17 y 18 (2026-10-12)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`7bb613e`**, sin
  nada sin pushear —confirmado con un `git fetch` de verdad—, con los **siete** commits de la
  fibrilación auricular ya incluidos. Los **ocho** commits quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1.**
  El 1 crea `diastBSE2024Evaluar`, que es el dueño único; del 2 al 6 **cuelgan de él** —cada uno
  reescribe una parte de esa función o de las dos fábricas de texto que llama—, así que revertir
  el 1 sin revertir antes los otros cinco deja el archivo sin la función que el cuadro y la
  ventana consumen, o sea la app sin pestañas. **El 7 (el Laboratorio) se revierte solo**: toca
  `_labDiastGrado` y el mapa de rótulos del Excel, y nada de la diastólica lo llama. El 8 es
  documentación más **TC-455**, que afirma el comportamiento de los siete: revertir cualquiera sin
  el 8 deja TC-455 en rojo.

- **Línea base al cierre: suite 466/470 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 434 columnas.** Los cuatro rojos son los de entrada y NO son regresiones: **TC-223** (el
  documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**. **El denominador subió a
  470**: esta tanda agregó **TC-455**. La de ENTRADA, medida en HEAD limpio el 2026-10-12, fue
  **465/469** con el pendrive montado y los mismos cuatro rojos.
- **Dónde está todo:** `docs/mapa/diastolica.md` → «`diastBSE2024Evaluar`» (el dueño, las
  entradas, la tabla de constantes, el orden de los pasos, las categorías y las trampas),
  `docs/fuentes/FUENTES.md` → `### bseDiast2024 — RITMO SINUSAL` (la Tabla 2, el E/e′ de la
  pág. 14, las Figuras 17 y 18 leídas de la imagen, la zona gris y las exclusiones),
  `docs/PENDIENTES.md` → «Función diastólica BSE 2024 en ritmo sinusal», con **nueve** cosas
  declaradas y no tocadas.

- ⚠️ **EL CUADRO GRIS Y LA VENTANA 🧭 CONTABAN VARIABLES DISTINTAS, Y ACORDABAN EN 3 DE 28
  ESCENAS.** El cuadro votaba E/e′ promedio, **E/A** y LAVi con umbral 1 ó 2 según el e′; la
  ventana votaba E/e′ promedio, LAVi y **velocidad de la IT** —la que el cuadro no miraba— y
  pedía **3 de 3** para decir «LAP elevada». Hoy las dos leen `diastBSE2024Evaluar` y acuerdan en
  **28 de 28**.
- ⚠️ **LA APP VOTABA LA E/A, QUE NO ESTÁ EN NINGÚN ALGORITMO DE RITMO SINUSAL DE ESTA GUÍA.** La
  banda de la Figura 17 dice, literal, `Avg E/e' >14 — LA volume >34 mL/m² — TR velocity >2.8 m/s`.
  Medido: un paciente con las tres principales negativas y E/A 0,70 publicaba «Indeterminado», y
  uno con e′ bajo y E/A 0,50 publicaba «Presión de llenado elevada». La E/A **se sigue mostrando**
  en su celda; lo que se fue es su voto.
- ⚠️ **CON UNA SOLA VARIABLE EVALUADA LA APP AFIRMABA, EN LAS DOS VÍAS.** En la normal, con
  relajación alterada bastaba **un** marcador positivo: un paciente con sólo el Vol AI cargado
  salía «Presión de llenado elevada» en un informe firmado. En la reducida la regla era una
  mayoría (`marcadores > totalEvaluables / 2`), así que 1 sobre 1 daba elevada y 0 sobre 1 daba
  normal. Ninguna de las dos figuras tiene rama para una variable sola.
- ⚠️ **Y CON CERO VARIABLES EVALUADAS DECÍA «FUNCIÓN DIASTÓLICA NORMAL».** Con el e′ como único
  dato cargado, `!alterada && marcadores === 0` daba la categoría `normal`.
- ⚠️ **LOS CORTES DEL e′ ERAN LOS DE LA ASE 2025 Y ESTA GUÍA LOS DA POR EDAD Y SEXO.** La app
  usaba promedio ≤6,5 · septal ≤6 · lateral ≤7, que son de la Figura 3 del folio 554 de la ASE; la
  **Tabla 2 (pág. 13)** de la BSE corta en 40 y 65 años y en 18-40 separa por sexo (M: septal <7,0
  / lateral <9,0 · F: <8,0 / <11,0; 41-65: <5,0 / <6,0; >65: <4,0 / <5,0). Medido con el **mismo**
  e′ (septal 6,5 / lateral 8,5): ALTERADO a los 30 años y NORMAL a los 50. El operador es `<` en
  los ocho valores y la combinación es un **OR** entre los dos anillos; **no hay corte de
  promedio**, y el «5,0» que coincide con la ASE es casualidad.
- ⚠️ **LA PRESIÓN VA PRIMERO Y EL e′ AL FINAL** (folio 35: «must start with the assessment of
  LVFP»). La app arrancaba por la relajación y sin e′ devolvía «Datos insuficientes» aunque la IT
  y el Vol AI alcanzaran para decidir la presión.
- ⚠️ **CON PRESIÓN ELEVADA LA FIGURA 17 NO CONSULTA EL e′, Y ESO CONTESTA LA PREGUNTA DE LA ORDEN
  sobre «presión elevada con e′ normal para la edad»:** la guía no tiene esa combinación. Sus dos
  ramas rojas van directo a la casilla roja sin pasar por «Assess relaxation by age-specific e′», y
  la prosa de la pág. 13 lo respalda: «a value greater than the age-specific cut-off does not
  confirm normal LV relaxation».
- ⚠️ **EL E/e′ POR SITIO NO ES UN OR, A DIFERENCIA DE LA ASE 2025.** El folio 14 usa los cortes
  por sitio (lateral >13 · septal >15) **sólo cuando falta un anillo**; con los dos manda el
  promedio (>14) y nada más. En HEAD, con un anillo solo el E/e′ **no se calculaba** y el criterio
  quedaba sin evaluar: un E/e′ septal de 15,0 no contaba.
- ⚠️ **LA FIGURA Y LA PROSA SE CONTRADICEN EN EL STRAIN, Y LOS DOS TEXTOS ESTÁN IMPRESOS.** La
  caja dice `pump strain ≥14% OR reservoir strain ≥30%` y la prosa de la pág. 35 dice «LARs
  (> 30%) **and** LAPs (> 14%)». **Gana la figura**, que es el algoritmo que la app ejecuta, y el
  signo descartado queda escrito al lado de cada constante. Y la banda gris de la prosa
  («19–29%») deja sin rama el tramo 18,0-19,0, que la figura cierra preguntando `LARs <18%`.
- **LAS TRES FIGURAS DE ESTA GUÍA NO COMPARTEN CONSTANTES, Y ES A PROPÓSITO.** Figura 17: LARS
  ≥30 normal · <18 elevada. Figura 18: LARS <18 elevada · **≥24** normal, LAPs <8 / ≥14, y
  **cuatro** suplementarios (Ar−A, onda L, **S/D <1** y **TDE <150**). Figura 19 (FA): E/e′
  **septal** >11, TDE **≤160**, LARS **<16**. El 18 coincide por casualidad.
- **EL S/D VENOSO PULMONAR VOTA EN LA FIGURA 18 Y NO EN EL RITMO SINUSAL DE LA ASE 2025**, por el
  mismo motivo que ya está escrito para la FA: el corte de la Figura 18 es **< 1**, que es
  exactamente lo que dice la opción del `<select>`; el ≤0,67 de la ASE no se puede expresar ahí.
- **EL LAPs Y LA ONDA L NO TIENEN CAMPO**: declarados no evaluables, no cuentan, y **no se agregó
  ninguno** — el Excel sigue en **434 columnas**, con el mismo juego de claves y **1085 campos del
  estudio sin un solo valor distinto** respecto de HEAD. El Ar−A sí existe (`venpArA()`), y lleva
  **su propia constante**: la BSE usa `> 30` y el `VENP_AR_A_MS` de la ASE/EACVI 2016 que vive al
  lado usa `>= 30`. No se tocó.
- **`edad` y `sexo` PASAN A LLAMAR A `calcDiastol`.** Desde hoy son insumos del veredicto y viven
  en **otra pestaña**; sin eso el cuadro gris se quedaba con el del paciente anterior. La ventana
  no se atrasa: tiene su oyente de documento.
- **DOS AVISOS ÁMBAR NUEVOS, Y NINGUNO MUEVE UN VEREDICTO** (medido): `#diast-bse-eprima-aviso`
  —con **dos textos**, porque con la edad por debajo de 18 «completar edad y sexo» sería falso— y
  `#diast-bse-gris-aviso` para la zona gris de FEVI/GLS, que la guía deja a juicio clínico y la
  app **conserva** corriendo la vía normal. Los dos llevan las **tres columnas**: oyente de
  documento, `RECALC_MODULOS` y `limpiarCampos`.
- **LAS FRASES SON LAS CUATRO CATEGORÍAS DE LA GUÍA Y NINGUNA ESCRIBE UN GRADO** (la BSE abandonó
  los I-III, pág. 48). **Las dos vías comparten las casillas 2 y 3**, así que comparten frase; lo
  que se perdió es la coletilla «en contexto de función sistólica deprimida/cardiopatía conocida»,
  que repetía la FEVI. **El nombre de la categoría 1 es el de Maicol** («Función diastólica normal
  para la edad») y no el literal de la figura («Normal diastolic function») — reportado en
  `docs/PENDIENTES.md` → B9.
- ⚠️ **EL LABORATORIO CONTABA DOS FAMILIAS DE INFORMES COMO «SIN DISFUNCIÓN» Y UNA TERCERA NO LA
  CONTABA.** «deteriorada con presión de llenado del VI normal» caía en la regla de «llenado
  normal»; «Presión de llenado del VI normal.» (el estado sin grado de la ASE 2025) también; y las
  dos frases de presión ELEVADA sin grado —la de la BSE y la de la FA— quedaban en `null`. Cuatro
  tokens nuevos, con rótulo en la **columna de texto** del Excel y **sin ningún `DD_*`** ni entrada
  en la distribución. **El anclaje a principio de oración no es cosmético**: sin él, el
  «Disfunción diastólica con presión de llenado del VI normal, en contexto de…» que viaja en los
  estudios ya guardados cambiaría de clasificación.
- **CONTROL NEGATIVO, 0 DIFERENCIAS EN 30 ESCENAS:** ASE 2025 y ASE/EACVI 2016 en ritmo sinusal, y
  **las tres guías en fibrilación auricular**, idénticas a HEAD en badge, frase del informe, frase
  del EN SUMA, las tres celdas compartidas, la PSAP y el resultado y el número de filas de la
  ventana.
- **Las seis superficies, enumeradas una por una** (informe en tres estilos, EN SUMA en tres,
  Excel con sus 434 columnas, franja del PPT, Laboratorio y los campos guardados) sobre 30 escenas
  de BSE sinusal: cambian las que tenían que cambiar, y la comparación **columna por columna** da
  **4 columnas distintas de 434** —los dos textos, «Grado disfunción diastólica» y `DD_Sin`— con
  **cero** columnas agregadas o quitadas.
- **Arnés: `scripts/_probe_bse2024.mjs`** (A/B de solo lectura con `--file`), siete grupos
  (`cuadro`, `ventana`, `bordes`, `edad`, `lab`, `excelab`, `superficies`, `otras`), 30 escenas,
  14 escenas de franja de edad y 14 tripletes de borde cargados con **teclas reales**.
  **Cobertura: TC-455**, 81 condiciones con cinco denominadores y nueve controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 65 de las 81 en rojo.**
- ⚠️ **LAS DIEZ PRIMERAS ESCENAS DE FRANJA DE EDAD NO SEPARABAN NI EL SEXO NI EL BORDE 65/66**, y
  parecían una medición buena: con septal 6,5 / lateral 8,5 los dos sexos de 18-40 dan ALTERADA y
  las dos franjas de arriba dan NORMAL. Sirven de control negativo, no de prueba. Las cuatro que
  **sí** separan usan valores que caen ENTRE los dos cortes de cada par (septal 7,5 para el sexo,
  septal 4,5 para el 65/66). **Un borde se prueba con el valor que cae entre los dos lados, no con
  uno que está fuera de los dos.**
- ⚠️ **EL HASH DE «campos guardados» DE LA SONDA INCLUYE `informe_texto` Y `en_suma`**, que son
  `<textarea>` con id: cambia en toda escena cuya frase cambia y **no dice nada** sobre los campos
  del estudio. Las 29 de 30 «diferencias» que informó eran eso. Lo que hay que mirar es la fila del
  Excel clave por clave y los campos **sin** los dos textos — el grupo `excelab` existe por esto.
- ⚠️ **LA PRIMERA VERSIÓN DEL COMMIT 1 TENÍA UN MAPA PARALELO DE RÓTULOS** (`BSE_VENT_TIT`, una
  entrada por categoría) y la sonda lo delató: la clave `normal` se llama «Normal» en la vía A y
  «Presión de llenado normal» en la vía B, así que la ventana contradecía al cuadro en 2 de 28.
  El rótulo se **deriva** del mismo `badgeTxt`. Es la tercera vez que este archivo paga escribir
  la misma palabra en dos lugares.
- ⚠️ **TC-455 FALLABA CONTRA HEAD POR EXCEPCIÓN Y NO POR SUS CONDICIONES.** `getComputedStyle`
  sobre un nodo que en HEAD no existe mata la corrida entera y no se ve qué condición caza qué
  defecto. La lectura va por un ayudante que devuelve `'NO EXISTE'`. **Un caso que muere por
  excepción prueba que el árbol es distinto, no que el caso sabe medir.**
- ⚠️ **LA SONDA SE COLGÓ UNA VEZ 20 MINUTOS** con Chrome vivo y node esperando un despacho que no
  volvía — la trampa de `cdp.mjs` que este archivo ya documenta. No era un defecto del commit: la
  página cargaba entera (verificado con un grupo vacío, que igual hace el arranque y devuelve el
  denominador). Se cerró **por PID propio**, nunca por nombre. **Y nunca mandar el stderr de una
  sonda a `/dev/null`:** una corrida fallida deja un JSON de 0 bytes y el lector revienta donde no
  es.

### Fibrilación auricular — un algoritmo por guía, sin mezclar (2026-10-12)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`55422ae`**, sin
  nada sin pushear —confirmado con un `git fetch` de verdad—. Los **siete** commits quedan
  locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 7 → 6 → 5 → 4 → 3 → 2 → 1.**
  El 1 crea el despacho por ritmo y las piezas compartidas (`_diastFADatos`, los desenlaces,
  `diastFAPintar`, `diastCeldasBasicas`); el 2 y el 3 **cuelgan de él** —agregan su guía a
  `diastFAEvaluar` y usan sus desenlaces—, así que revertir el 1 sin revertir antes el 2 y el 3
  deja el archivo sin las funciones que esos dos consumen, o sea la app sin pestañas. El 4 toca
  `generarInforme` y depende del `faSinFrase` que pone el 1. **El 5 (el cableado del cuadro) y el
  6 (el aviso de FC) se revierten solos**: ninguno toca un veredicto. El 7 es documentación más
  **TC-454**, que afirma el comportamiento de los seis: revertir cualquiera sin el 7 deja TC-454
  en rojo.

- **Línea base al cierre: suite 465/469 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 434 columnas.** Los cuatro rojos son los de entrada y NO son regresiones: **TC-223**
  (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**. **El denominador subió
  a 469**: esta tanda agregó **TC-454**. La de ENTRADA, medida en HEAD limpio el 2026-10-12, fue
  **464/468** con el pendrive montado y los mismos cuatro rojos.
- **Dónde está todo:** `docs/mapa/diastolica.md` → «La FIBRILACIÓN AURICULAR» (los tres dueños, los
  cortes lado a lado, las tres reglas y las trampas), `docs/fuentes/FUENTES.md` → la Figura 8 de
  `aseDiast2025` y las dos entradas nuevas `bseDiast2024` y `aseDiast2016`,
  `docs/PENDIENTES.md` → los puntos 1 y 7, los dos **cerrados**, con seis cosas declaradas y no
  tocadas.

- ⚠️ **CON «ASE 2025» Y FA, LA APP GRADUABA CON LA VÍA DE RITMO SINUSAL DE LA BSE, Y EL BADGE LO
  DECÍA.** `calcDiastol` salía por el `return` de `ase2025` ANTES de mirar la FA y
  `calcDiastolASE2025` derivaba a `calcDiastolBSE2024`. Medido en HEAD con un paciente de cuatro
  criterios positivos: el cuadro decía **«Normal — BSE 2024»**. Hoy dice «FA — Presión de llenado
  elevada (ASE 2025)» y corre la **Figura 8 del folio 563**. Hoy el **ritmo se decide antes que la
  guía**.
- ⚠️ **Y CON «ASE 2016» Y FA EL RESULTADO ERA SIEMPRE «DATOS INSUFICIENTES», CON EL FORMULARIO
  LLENO.** `calcDiastolASE2016` arranca por el cociente E/A y en FA **no hay onda A**: `ea === null`
  y la primera guarda se llevaba a todos los pacientes. Esa guía **no tiene algoritmo de FA** —su
  sección E del folio 295 enumera parámetros y no los combina—, así que hoy la app los muestra con
  su estado, **dice que la guía no da una regla de conteo y no publica veredicto ni frase**.
- ⚠️ **LA RAMA DE FA DE LA BSE NO ERA EL ALGORITMO DE LA BSE.** Votaba «E/e' **promedio** >11, IT
  >2,8, **Vol AI >40** y TDE **<**160» con un umbral propio de «≥2 positivos» y frases **sin
  tildes**. Ni el Vol AI ni el 40 están en la Figura 19; el cociente que esa figura pide es el
  **SEPTAL** —la pág. 37 lo justifica: en FA la variabilidad R-R mueve mucho más el e' lateral—; el
  TDE va con `≤`; y la regla es **«≥3 de 4»**, no «≥2 de los disponibles», que afirma presión
  elevada con dos parámetros sobre dos.
- ⚠️ **LOS OPERADORES DE LA FA NO SON LOS DEL RITMO SINUSAL, Y LAS DOS COSAS SON CORRECTAS.** La
  Figura 3 escribe la IT y el E/e' con **≥**; las Figuras 8 y 19 los escriben con **>**. Una IT de
  **2,80 es POSITIVA en sinusal y NEGATIVA en FA**. Por eso las ramas **no comparten constantes**.
  Y el E/e' de la FA es **uno solo y septal**, no los tres cortes por sitio de la Figura 3.
- ⚠️ **EL LARS TIENE DOS CORTES Y ES DE LA FUENTE: 18 % en la ASE y 16 % en la BSE** (pág. 40: sin
  contracción auricular el strain de reservorio es sistemáticamente menor). Medido: un LARS de
  **17 %** sobre el mismo paciente da **indeterminada por la ASE y normal por la BSE**. No se
  unifican. Lo mismo con la **PSAP**: la Figura 8 la admite como alternativa de la IT y la Figura 19
  **no la nombra** — con PSAP 36 e IT 2,65 la ASE dice elevada y la BSE indeterminada.
- **EL S/D VENOSO PULMONAR CAMBIA DE ESTADO SEGÚN EL RITMO, y es el mismo campo.** En sinusal el
  corte es ≤0,67 y el `<select>` de «<1 / >1» no puede expresarlo —está declarado **no
  evaluable**—; en FA el corte es **< 1**, que es exactamente lo que dice la opción, así que **sí
  vota**. Un corte cae justo en el borde de la opción y el otro no.
- **EL TERCER PARÁMETRO DEL SEGUNDO PASO ES EL IMC, y el reporte anterior tenía razón**: la
  Figura 8 escribe `BMI > 30 kg/m2`, verificado en el original. Sale de **`getIMC()`**, que ya
  existía. **No se agregó ningún campo: el Excel sigue en 434 columnas en las 27 escenas medidas.**
  ⚠️ **Y EL 30,00 EXACTO DEPENDE DE LA TALLA, POR PUNTO FLOTANTE**: `(170/100)**2` vale
  `2.8899999999999997`, así que **86,7 kg con 170 cm da 30.000000000000004 y cruza un corte que es
  `> 30`**. Con talla 100 el IMC es exacto y el 30 es negativo, que es lo que fija TC-454. No se
  tocó `getIMC`: es el dueño único y lo comparten `calcBSA`, el PDF y el PPM mitral.
- **EL INFORME FIRMADO LLEVA UNA SOLA FRASE Y SÓLO CON PRESIÓN ELEVADA** (decisión de Maicol):
  «Disfunción diastólica con presión de llenado elevada (con FA).», idéntica en el informe y en el
  EN SUMA y en los tres estilos. Con presión normal, indeterminada o sin regla de conteo **no
  escribe nada** — y eso obligó a apagar el RESPALDO de `generarInforme` («Función diastólica no
  valorada por datos insuficientes.»), que también es una frase de función diastólica y la
  publicaba todo paciente en FA con la FEVI cargada.
  **Laboratorio, REPORTADO Y NO TOCADO:** esa frase no coincide con ninguna de las cuatro
  expresiones de `_labDiastGrado`, así que esos estudios clasifican como **`null`** y quedan fuera
  de la distribución diastólica y de las cinco columnas `DD_*`. Verificado en las 27 escenas.
- ✅ **EL DESFASE DEL CUADRO GRIS, CERRADO**: once campos cableados a `calcDiastol` —`peso`,
  `talla`, `fevi`, `ai_vol`, `vmax_it`, `it_vmax_cw`, `tde`, `triv`, `venp_sd`, `vci_diam` y
  `vci_col`—. El TDE y el TRIV no tenían manejador **ninguno**. En A/B contra HEAD el **veredicto
  final del ritmo sinusal es idéntico** —es una función pura de los campos— y lo único que cambia
  es cuándo se repinta: HEAD se ponía al día recién en el LARS, que es el último campo.
- **EL AVISO DE FC ES DE LA BSE Y TIENE DOS TRAMOS**, porque la Figura 19 dice dos cosas: su
  encabezado pide **< 100 lpm** y su pie excluye el algoritmo con **> 120 lpm** en reposo. No cambia
  ningún veredicto (medido con el mismo paciente y FC sin cargar, 99, 100, 120 y 121: el badge es el
  mismo en los cinco) y lleva las **dos columnas** —el oyente de documento con `RECALC_MODULOS` y
  `limpiarCampos`—, así que «Nuevo estudio» lo apaga. La Figura 8 de la ASE **no pone ningún
  límite**, así que ahí no sale.
- **El ritmo sinusal de las tres guías es IDÉNTICO a HEAD**, con las escenas del trabajo anterior:
  `scripts/_probe_diast2025.mjs` en sus grupos `cuadro,ventana`, `superficies` y `otros`, A/B contra
  una copia de HEAD, **0 diferencias en los tres** (20 escenas con sus seis superficies y los 12
  casos de BSE y 2016 en sinusal).
- **Arnés: `scripts/_probe_diastfa.mjs`** (A/B de solo lectura con `--file`), siete grupos
  (`cuadro`, `ventana`, `bordes`, `superficies`, `sinusal`, `desfase`, `fc`), 16 escenas por las
  tres guías y 9 tripletes de borde cargados con **teclas reales**. **Cobertura: TC-454**, 68
  condiciones con cuatro denominadores y seis controles negativos. **Verificado que sabe fallar
  contra HEAD en un worktree aparte: 47 de las 68 en rojo.**
- ⚠️ **ME COMÍ EL ACENTO GRAVE UNA VEZ**, en un comentario mío dentro del cuerpo de la sonda
  —`\`display\`` dentro de un template literal—, con el archivo que documenta la trampa abierto
  delante. `node --check` dio la línea exacta esta vez; `scripts/check_backticks.py` corrió limpio
  antes de cada commit.

### Función diastólica del VI — la Figura 3 de la ASE 2025 en ritmo sinusal (2026-10-12)

- **Línea base al cierre: suite 464/468 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 434 columnas.** Los cuatro rojos son los de entrada y NO son regresiones: **TC-223** (el
  documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**. **El denominador subió a
  468**: esta tanda agregó **TC-453**. La de ENTRADA, medida en HEAD limpio el 2026-10-12, fue
  **463/467** con el pendrive montado y los mismos cuatro rojos.
- **Dónde está todo:** `docs/mapa/diastolica.md` (la zona entera: las dos superficies, el dueño
  único, los tres pasos y las trampas), `docs/fuentes/FUENTES.md` → `### aseDiast2025` (los folios
  537-569, la regla de folio **+536**, las cuatro contradicciones internas de la guía y los cortes
  de las Figuras 2, 3, 4, 5, 6 y 8 y de las Tablas 6 y 7), `docs/PENDIENTES.md` (ocho cosas
  declaradas y no tocadas).
- **LA VENTANA DEL 🧭 Y EL CUADRO GRIS CALCULABAN POR SEPARADO, Y EN HEAD ACORDABAN EN 2 DE 20
  ESCENAS.** La ventana tenía su propio Paso 1 —`e' septal < 7`, y `< 5` con edad ≥ 75—, no miraba
  el lateral ni el promedio, dibujaba el LARS sin contarlo, se conformaba con UN parámetro
  evaluado, separaba el grado 3 por el TDE y daba el grado 1 sin mirar la E/A. **Ninguno de esos
  números existe en la ASE 2025**: la Tabla 6 del folio 553 corta en 40 y 65 años y para > 65 el
  septal es < 6, y el 5,0 es el septal de 41-65 de la **BSE** (Tabla 2, pág. 13). Hoy las dos leen
  `diastASE2025Evaluar()`, que es el dueño único, y acuerdan en **19 de 20** —la que queda es el
  formulario vacío, donde el cuadro nunca se pintó (`—`, igual que en HEAD)—.
- ⚠️ **EL DEFECTO DE FONDO ERA MEZCLAR DOS FIGURAS.** La app tenía la FORMA de la **Figura 2**
  (folio 553: cuatro marcadores de igual peso con umbral 1 ó 2 según el e', que contesta «¿hay
  disfunción diastólica?») y publicaba el PRODUCTO de la **Figura 3** (folio 554: presión de
  llenado y grado). Y encima cambiaba un marcador por otro: la Figura 2 vota «E/A ≤0,8 o ≥2» y
  **no** vota la IT; la app votaba la IT y no la E/A. Hoy corre la Figura 3: **tres variables
  principales** con compuertas asimétricas —e' reducida · E/e' aumentado · IT ≥2,8 **o PSAP
  ≥35**— y un **segundo paso** (Vol AI >34 · LARS ≤18 % · S/D ≤0,67 · y como ALTERNATIVA
  TRIV ≤70 ms), que es donde la guía puso el Vol AI y el LARS.
- ⚠️ **LA ASE 2025 SE CONTRADICE CONSIGO MISMA EN CUATRO CORTES, Y LOS DOS SIGNOS ESTÁN IMPRESOS.**
  Las Figuras 2 y 3 escriben `≤6 / ≤7 / ≤6,5` para el e' y `≤18 %` para el LARS; el Key Point 2 y
  la Tabla 6 del folio 553 escriben esos cuatro con `<`. Y la Figura 3 escribe `E/e' ≥14` y
  `TR ≥2,8` donde la Figura 2, la prosa del 553 y la Tabla 7 del 557 escriben `>14` y `>2,8`.
  **Gana la figura del algoritmo que la app ejecuta, que es la Figura 3**, y el signo descartado
  queda escrito en el comentario de cada constante: un borde no se entiende sin el que no se
  eligió. No es teórico: un E/e' de 14,00 se alcanza con enteros (E 98, e' 7,0) y una IT de 2,80
  es el valor que más se tipea.
- ⚠️ **DOS CRITERIOS DE LA GUÍA NO PUEDEN DECIDIR SOLOS, Y ES ÁLGEBRA, NO UNA OBSERVACIÓN.**
  (1) El **e' promedio ≤6,5** con los dos anillos: para cruzarlo con el septal > 6 y el lateral > 7
  haría falta una suma ≥ 13,02, o sea un promedio ≥ 6,51. (2) El **E/e' promedio ≥14** usando los
  tres cortes como alternativas: haría falta `ep+el = E/7` siendo `ep+el > E/15 + E/13 = 28E/195`,
  y 1/7 = 195/1365 < 196/1365. **Imposible por 1/1365.** Las dos filas igual se dibujan y cruzan
  su corte; lo que no pueden es decidir. Está medido y declarado en el código.
- ⚠️ **EL CORTE DEL PROMEDIO SE ESTABA APLICANDO A UN ANILLO SOLO, Y ESO CAMBIABA EL INFORME
  FIRMADO.** `ee` (el e' que se muestra) y `prom` (el promedio de verdad, `null` con un anillo)
  eran la misma variable. Medido: un e' septal de **6,3** sin lateral salía «relajación reducida»
  —6,3 ≤ 6,5— cuando su corte es ≤6; eso bajaba el umbral de marcadores de 2 a 1 y el estudio
  terminaba publicando **«DD Grado II»**. Hoy ese paciente sale **«Función diastólica normal»**.
- ⚠️ **EL E/e' TENÍA UN SOLO CORTE Y LA FIGURA 3 TIENE TRES, COMO ALTERNATIVAS.** Septal **≥15** ·
  lateral **≥13** · promedio **≥14**, cada una evaluada sólo si su propio e' está medido, en OR y
  contando **una** vez. Con un anillo solo la app comparaba un cociente SEPTAL contra el corte del
  PROMEDIO: un 14,29 septal salía positivo cuando su corte es 15 — ese paciente pasó de
  «DD Grado II» a **normal**. **Consecuencia declarada:** con los dos anillos valen las tres, así
  que un cociente septal de 15 con un promedio de 13 ahora es positivo y antes no. Es lo que dice
  la figura, y la orden pedía usarlos como alternativas si así las presenta.
- **«Todas normales» exige las tres EVALUADAS; «e' reducida sola» admite que falten.** La primera
  es la única rama que **afirma normalidad** y afirmarla sobre dos variables sin medir es lo que la
  guarda vieja de «≥2 de 4 evaluados» existía para evitar; la segunda afirma relajación alterada
  con presión normal —el lado conservador— y es la que deja que un paciente **sin chorro de IT**,
  que es entre el 40 y el 60 % según la BSE, siga saliendo grado 1.
- **DOS ESTADOS NUEVOS, con el texto que aprobó Maicol y nada más.** (a) segundo paso negativo →
  «Presión de llenado del VI normal (N/M parámetros positivos). No se puede graduar la disfunción
  diastólica con los datos disponibles.» / EN SUMA «Presión de llenado del VI normal.»; (b) segundo
  paso sin ningún parámetro → «No se puede estimar la presión de llenado del VI con los datos
  disponibles; completar los parámetros del segundo paso (Vol AI, LARS, S/D o TRIV).» / EN SUMA
  «Presión de llenado del VI no estimable con los datos disponibles.» El respaldo es el **folio
  555, §12**: si el que informa no puede determinar el grado, igual tiene que decir si la PAI es
  normal o elevada. **Se fueron tres estados** —la guarda de «≥2 de 4», el umbral 1/2 y el
  «indeterminado» del grado 1— porque no eran de la guía; el de **datos insuficientes** se
  conserva **textual** para el paciente que sólo tiene el e' cargado.
- **El grado 3 SIGUE exigiendo e' reducida** (P8 no se hizo, decisión de Maicol): un E/A ≥2 con e'
  conservada es el patrón del corazón joven y sano. Y **el grado 2 perdió su piso de E/A**: la
  figura dice «E/A < 2 → grado 2», sin cota inferior, y un paciente con presión elevada y E/A 0,75
  caía en el cajón de «Indeterminado».
- ⚠️ **EL CUADRO GRIS SE ATRASA Y NO SE TOCÓ: `calcDiastol` NO ESTÁ CABLEADO A TODO LO QUE LEE.**
  Sus `oninput` están sólo en los cuatro campos del Doppler mitral, el LARS y los dos selectores;
  el **Vol AI**, la **velocidad de la IT**, el **TRIV** y los **campos de VCI** no lo llaman.
  Medido igual en HEAD y en el árbol nuevo: tipeando el paciente de TC-29 en el orden natural el
  cuadro queda en «Indeterminado» y el informe, un segundo después, dice «DD Grado II». La
  **ventana no se atrasa** (oyente de documento) y el **informe firmado tampoco**
  (`generarInforme` llama a `calcDiastol`). **Al medir esta zona: tipear primero lo NO cableado y
  los campos mitrales al final**, o llamar `calcDiastol()` a mano — sin eso una sonda informa el
  veredicto del paciente ANTERIOR, y así se perdieron las dos primeras corridas de esta tanda.
- ⚠️ **Y LA SONDA SE COMIÓ ESE MISMO DESFASE UNA SEGUNDA VEZ, POR LOS `<select>`.** `vci_col`
  dispara `calcPmAD` → `calcPSAP`, que escribe `psap_calc` y **no** llama a `calcDiastol`:
  poniéndolo después del tecleo, la sonda informó «Presión de llenado normal» en el cuadro con la
  ventana diciendo «DD Grado II · 3 de 3» sobre el MISMO paciente. Los selects van **primero**.
- ⚠️ **DOS FIXTURES DE BORDE DE MI PROPIA SONDA MEDÍAN OTRA COSA, Y PARECÍAN MEDICIONES BUENAS.**
  La del grado 1 tenía el E/e' septal en 16 —positivo— así que separaba grado 2 de indeterminado en
  vez de medir el corte de la E/A; y la del promedio no podía aislar su alternativa, que es
  justamente la subsunción de arriba. **Informar qué criterio cruzó al lado del veredicto**: sin el
  estado de la FILA, un badge que no cambia se lee como un corte que no funciona.
- **El S/D venoso pulmonar quedó declarado NO EVALUABLE.** Su corte es ≤0,67 y el campo `venp_sd`
  es un `<select>` de «<1 / >1»: un S/D de 0,9 es «<1» y no cumple. Se dibuja en **gris** con el
  motivo en su propio rótulo —para que su ausencia no se lea como un negativo— y no se agregó
  ningún campo: el Excel sigue en **434 columnas**.
- **El aviso ámbar de exclusiones no cambia ni un veredicto.** El pie de la Figura 3 (folio 554)
  excluye estenosis mitral de cualquier grado, IM primaria grave, CAM moderada o grave, prótesis,
  plástica y TEER mitral, y la app lo venía corriendo igual **sin decir nada**. Texto:
  «ASE 2025: algoritmo no aplicable con {motivos} (Figura 3, folio 554).» Detecta cuatro motivos
  con campos que ya existen; **lo que no puede detectar está en `docs/PENDIENTES.md`**, y la CAM
  del anillo es uno de ellos —`vm_morf = 'Calcificada'` describe la valva, no el anillo—. Lleva
  **las tres columnas**: el oyente de documento, `RECALC_MODULOS` y `limpiarCampos`.
- **Las SEIS superficies, enumeradas una por una** (informe en tres estilos, EN SUMA en tres,
  Excel con sus 434 columnas, franja del PPT, el grado que deriva el Laboratorio del TEXTO y el
  hash de los campos guardados) sobre las 20 escenas, más los dos controles negativos: **FA con
  los tres protocolos, 6 casos, 0 diferencias**, y **BSE 2024 y ASE/EACVI 2016 en ritmo sinusal,
  12 casos, 0 diferencias**.
- ⚠️ **CINCO COLUMNAS DEL EXCEL Y TODO EL LABORATORIO SALEN DEL TEXTO DEL RESUMEN**, vía
  `_labDiastGrado`: «Grado disfunción diastólica», `DD_I`, `DD_II`, `DD_III` y `DD_Sin`, más la
  distribución del panel, el PPT estadístico y los filtros de cohorte. **Cambiar una palabra del
  EN SUMA mueve eso.** El estado (a) entra como «Sin disfunción» porque su EN SUMA dice «llenado
  del VI normal» — y **pasaba igual en HEAD**, porque la frase que reemplaza también lo decía.
- **Arnés: `scripts/_probe_diast2025.mjs`** (A/B de solo lectura con `--file`), siete grupos
  (`cuadro`, `ventana`, `desfase`, `bordes`, `superficies`, `fa`, `otros`), 20 escenas y 13
  tripletes de borde cargados con **teclas reales**. **Cobertura: TC-453**, 44 condiciones con tres
  denominadores y cuatro controles negativos. **Verificado que sabe fallar contra HEAD en un
  worktree aparte: 34 de las 44 en rojo**, y las diez que pasan son las que esta tanda no mueve
  (los denominadores, el lado del cuadro de la escena 3.1, el corte del grado 3 por E/A y el
  control negativo del grado III).
- ⚠️ **Me comí el acento grave UNA vez**, en un comentario mío dentro del cuerpo de TC-453, con el
  archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea exacta
  (737) mientras `node --check` apuntaba a la 716, que es la apertura del template.

- **Línea base al cierre de la tanda de la AÓRTICA (2026-10-11): suite 463/467 con el pendrive
  `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR, Excel 434 columnas, celular 43 a 360 px y 52 a
  390 px con 1 ALTA cada uno.** Los cuatro rojos son los de entrada y NO son regresiones:
  **TC-223**, **TC-376**, **TC-390** y **TC-406**. El denominador subió a 467: esta tanda agregó
  **TC-452** y adaptó **TC-418**. Los **dos** commits (`6fd4f09` y `e053b0a`) quedan locales; el
  push lo corre Maicol.

- Al **empezar** la tanda del BOTÓN y el GLOSARIO del panel de Evidencia (2026-10-12), `main` local
  y `origin/main` estaban los dos en **`43d52f9`**, sin nada sin pushear —confirmado con un
  `git fetch` de verdad—. Los **tres** commits de esa tanda (`469c157`, `cfc39ce` y este) quedan
  locales; el push lo corre Maicol.
  **Los tres se revierten solos y en cualquier orden.** A toca `#indic-btn` y `indicSyncBoton`;
  B agrega `IND_TERMINOS`, el componente y los dos `term:` de la mitral; C es sólo documentación.
  La única dependencia es de TESTS y es blanda: **TC-274** se adaptó en A y **TC-451** entró en B.
  Revertir sólo A deja TC-274 en rojo (mide el color, que ya no existiría); revertir sólo B deja
  TC-451 en rojo por su propia guarda («falta `_indTermAbrir`»), que es la rama prevista.

### Panel de Evidencia · el botón que se prende y el glosario de términos (2026-10-12)

- **Línea base al cierre: suite 462/466 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 434 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno.** Los cuatro rojos son
  los de entrada y NO son regresiones: **TC-223** (el documentado, falla por la fecha), **TC-376**,
  **TC-390** y **TC-406**. **El denominador subió a 466**: esta tanda agregó **TC-451** (el
  glosario) y adaptó **TC-274** (el botón).
  La línea base de ENTRADA, medida en HEAD limpio el 2026-10-11, fue **461/465** con el pendrive
  montado y los mismos cuatro rojos.
- **Dónde está todo:** `docs/mapa/panel-evidencia-terminos.md` (el glosario entero: los tres ⓘ, el
  registro, la posición y las dos formas de la tabla), `docs/mapa/panel-evidencia.md` (el botón, en
  «Entradas y ciclo de vida»), `docs/fuentes/FUENTES.md` (la entrada nueva del material
  suplementario: Tabla S3 p. 5, las citas 4, 5 y 6, y los dos literales de las notas ^c),
  `docs/PENDIENTES.md` (las tres cosas declaradas y no tocadas).
- **A · El botón «Evidencia» ya no se esconde: está SIEMPRE y lo que sigue a los datos es su
  COLOR** — `btn-ghost` gris sin criterios, `btn-primary` azul con al menos una sección, el mismo
  par que las ocho pastillas de válvula, así que los dos temas salen gratis (`--accent` vale
  `#4f8ef7` de noche y `#2f6fe0` de día). Lo decide `indicSyncBoton()` con `indicHayCriterios()`,
  que es la **misma** función que corre el panel: no se duplicó ninguna compuerta. Sin numerito.
  El estado va también en PALABRAS (`IND_BTN_ET`, en `aria-label` y `title`), y la del azul declara
  que significa «hay guía aplicable para consultar», **no** indicación de tratamiento.
  **Enganches: NINGUNO nuevo.** `indicSyncBoton` ya estaba en `RECALC_MODULOS` (índice 41, el
  embudo de las cinco rutas de restauración) y se llama a mano al final de `limpiarCampos`.
  **Los quince constructores de `IND_SECS` son PUROS**: barrido de sus 4.729 líneas por escrituras
  de DOM y de estado → un solo hit, y es una lectura.
- ⚠️ **EN HEAD EL BOTÓN NUNCA SE ESCONDÍA A LA VISTA, Y ES LA CUARTA VEZ QUE ESTE ARCHIVO PAGA LO
  MISMO.** Medido con `getComputedStyle`: con `hidden === true` tenía `display:flex` y **104 × 44 px
  reales**, porque la regla de autor `.btn, .tab-btn, .nav-tab, .chip { display:inline-flex }` le
  gana al `[hidden]{display:none}` de la hoja del **NAVEGADOR** (autor > UA, sin importar la
  especificidad). `hidden` sólo lo sacaba del árbol de accesibilidad. `index.html` ya lo documenta
  para `.fg`, `.frases-panel` y el banner de versión, los tres arreglados con su propio
  `X[hidden]{display:none}`; `#indic-btn` nunca recibió esa regla. **TC-274 estaba VERDE encima, por
  medir la PROPIEDAD `hidden` y no el estilo computado** — que es textualmente la lección escrita al
  lado de `.fg[hidden]`. Hoy está cerrado por construcción: ya no hay `hidden`, y las condiciones
  nuevas miran la clase **y** el fondo computado.
- **B · El ⓘ de un TÉRMINO es un TERCER componente y no reemplaza a ninguno.** `_indInfoHTML`
  (`<details data-ind-info>`, la nota de una pregunta), `_indDetalleHTML`
  (`<details data-ind-detalle>`, el «Ver detalle») y ahora `<button data-ind-term>`, que abre una
  tarjeta FUERA del cuerpo. **Atributo propio y `<button>` en vez de `<details>` por un motivo
  medido:** TC-293 cuenta los `details[data-ind-info]` y exige `aria-label` únicos por sección, y
  TC-328/TC-329 llaman «hoja» a cualquier `<div>` sin divs adentro — un ⓘ nuevo en esos conjuntos
  les mueve el denominador sin que nada lo delate. Verificado: `info` sigue en 11 y 33, `detalle` en
  1 y 9, los tres casos verdes.
- ⚠️ **LA TARJETA CUELGA DEL OVERLAY Y NO DE `#indic-card`, Y ESO EVITA DOS CAMINOS DE CÁLCULO.**
  `#indic-cuerpo` tiene `overflow:auto` (recortaría una tarjeta de adentro) y **`#indic-card` lleva
  `transform:translate(-50%,-50%)` en tamaño normal**, o sea que es **bloque contenedor** de
  cualquier descendiente con `position:fixed`: desde adentro habría que restarle el rect del padre
  en normal y no en maximizado, donde el CSS pone `transform:none`. Colgada del overlay —que no
  lleva transform— el `position:fixed` vuelve a ser del viewport y el rect del botón se usa tal
  cual. Y va en el **marcado estático**, porque el `MutationObserver` del bloque de accesibilidad
  trata como modal a cualquier `<div>` **agregado** con `position:fixed` y `top:0`.
  **`role="dialog"` SIN `aria-modal`**, a propósito: así no entra en el oyente genérico de Escape ni
  en la trampa de Tab, y el panel sigue siendo el único modal.
- ⚠️ **EL ACOTE VERTICAL FINAL LO ENCONTRÓ TC-451, NO LA SONDA, Y EL AYUDANTE DE CLIC DE LA SONDA
  ERA LO QUE LO TAPABA.** `#indic-cuerpo` scrollea, así que un botón fuera del área visible del
  panel sigue teniendo rect: el de su posición geométrica, cientos de px por debajo del viewport.
  Con ese `r0`, la rama de «arriba» daba `arriba >= T` por ser un número grande y **positivo** y la
  tarjeta se colocaba fuera de la pantalla (medido: `top` 132 con la caja terminando en 455 y los
  cinco puntos devolviendo `null`). El `clicSel` de la sonda llama a `scrollIntoView` y **se niega**
  a clickear un nodo fuera del viewport —la protección que este repo agregó tras una corrida
  colgada—, así que todas sus escenas tenían el botón a la vista; el caso usa un `.click()`
  sintético. **Una protección de la sonda puede esconder el defecto que la sonda busca.**
- ⚠️ **`\s` DENTRO DE UN TEMPLATE LITERAL SE COCINA A LA LETRA `s`.** El regex de la sonda quedaba
  en `/s+/g` y borraba **todas las eses** del texto, e igual informaba una diferencia de 2
  caracteres —que eran el blanco real al lado del glifo—, o sea un falso con pinta de medición
  buena. Se vio al **IMPRIMIR** el texto, que decía «caracteritica» y «defavorable». `\u24d8`
  sobrevivió de pura suerte: es un escape válido y se cocina al carácter correcto. En el cuerpo de
  una sonda va **`\\s`**, como ya lo escriben las otras.
- ⚠️ **EL AVISO LEGAL VUELVE A MITAD DE CORRIDA Y SE COME TODAS LAS MEDICIONES DE OCLUSIÓN.**
  `#modalAvisoEco` tapa con `z-index:9999` y `#login-overlay` con `2147483000`: con cualquiera de los
  dos puesto, `elementFromPoint` devuelve **ese** nodo en los cinco puntos y la escena informa
  «tapada» sobre una tarjeta perfecta. Pasó **dos veces** —en TC-451 y en la sonda, en las seis
  escenas de 390 y 360 px, porque las de 1200 corren antes de que reaparezca—. Es la trampa que
  TC-395 ya documenta. **Se despejan DENTRO del medidor, no una vez al arranque**, y su estado va al
  lado del veredicto.
- ⚠️ **COMPARAR DOS MEDICIONES DE DÍAS DISTINTOS DA UNA DIFERENCIA QUE NO EXISTE.** El A/B de las
  seis superficies dio 6 diferencias en el hash de los campos guardados; la medición de HEAD era del
  **11** y la nueva del **12** de octubre. Remedido HEAD el mismo día: **0 diferencias**. Es la misma
  clase de falso que el pendrive `DISK_IMG`, con otra variable: **mirar la fecha antes de restar.**
- **TEXTOS de las tarjetas: palabras propias, aprobadas por Maicol con cuatro ajustes suyos**
  («valvas» en vez de «velos», «brillo ecográfico aumentado», la redacción del grupo 3, y la
  salvedad de «UNA de varias características desfavorables, y la guía no dice cuántas bastan»). El
  «varias» se atribuye **sólo** a la nota ^c de la Recommendation Table 8: la de la Figura 14 dice
  «absence of unfavourable characteristics», o sea ninguna. **La tarjeta NO afirma que el «> 8» sea
  de Wilkins.** El título de la tabla es «Score de Wilkins (Tabla S3)» y **no traduce** el encabezado
  original, que dice «MVA» —la sigla del ÁREA en ese mismo documento—: probable error de la guía,
  anotado en `docs/PENDIENTES.md`.
- **Las SEIS superficies, enumeradas una por una** (informe en tres estilos, EN SUMA en tres, Excel
  con sus 434 columnas, franja del PPT, Laboratorio y los 1087 campos guardados): **0 diferencias**
  contra HEAD en los dos commits, en tres morfologías, con el panel cerrado y con el panel abierto y
  doce preguntas contestadas con clics reales.
- **El texto de CADA sección es idéntico a HEAD letra por letra** (hash con los glifos ⓘ y todo el
  blanco descontados): **9/9** secciones, con un Δ de exactamente **+2 glifos**, los dos en la
  estenosis mitral.
- **Arneses: `scripts/_probe_evidbtn.mjs`** (el botón: estados, temas, maqueta, rutas de
  restauración con su control negativo, y el clic en gris) y **`scripts/_probe_evidterm.mjs`** (el
  glosario: texto, 16 escenas de tarjeta, teclado, aislamiento y convivencia). Los dos A/B de solo
  lectura con `--file`.
- **Cobertura: TC-451** (nueve condiciones, tres denominadores, dos controles negativos) y **TC-274
  adaptado** con el motivo escrito en el caso.
- ⚠️ **Me comí el acento grave DOS veces**, las dos en comentarios míos dentro del cuerpo de la
  sonda, con el archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la
  línea exacta las dos veces; en una, `node --check` apuntaba 15 líneas antes.


- Al **empezar** la tanda del MARCO del panel de Evidencia (2026-10-11), `main` local y `origin/main`
  estaban los dos en **`84d9f1e`**, sin nada sin pushear. Los **tres** commits de esa tanda
  (`89812d0`, `fc84a3a` y este) quedan locales; el push lo corre Maicol.
  **Los tres se revierten solos y en cualquier orden**: A toca el marco (modal, CSS, `indicAbrir`,
  el Escape), B toca la fila y la botonera, C es sólo documentación. La única dependencia es de
  TESTS y es blanda: `hojas()` de TC-329/TC-328 excluye `data-ind-col` (entró en A) y el filtro de
  TC-293 excluye `data-ind-info` (entró en B); revertir sólo A deja un filtro de más, que es inerte.

### Panel de Evidencia · el marco: maximizar, dos columnas y texto plegado (2026-10-11)

- **Línea base al cierre: suite 461/465 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 434 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno.** Los cuatro rojos son
  los de entrada y NO son regresiones: **TC-223** (el documentado, falla por la fecha), **TC-376**,
  **TC-390** y **TC-406**. **El denominador sigue siendo 465**: esta tanda no agregó ningún `caso()`
  —adaptó tres (TC-293, TC-328, TC-329) y le sumó cinco condiciones a TC-293—. Medido con el
  pendrive montado al abrir Y al cerrar: este archivo ya documenta una «regresión» de 17 casos que
  no existía, producto de restar una cifra con el pendrive puesto contra otra sin él.
  ⚠️ **Y escribí «465/469» en este mismo renglón antes de medirlo**, por asumir que las condiciones
  nuevas de TC-293 subían el denominador. No lo suben: el denominador cuenta CASOS, no condiciones.
- **Dónde está todo:** `docs/mapa/panel-evidencia.md` (el marco, las preguntas y las cuatro marcas
  de `<details>`), `docs/PENDIENTES.md` (las 22 frases largas que quedan visibles, sin tocar).
- **Qué cambió, en una línea:** `#indic-max` maximiza el panel a `inset:10px`; con el viewport
  ≥ 1000 px y maximizado, cada sección que tiene filas del eco **y** preguntas se parte en dos
  columnas; y la nota de cada pregunta se **movió** detrás de un ⓘ. **El texto completo de las 15
  secciones es idéntico a HEAD**, descontando el glifo ⓘ: 27 de 27 comparaciones.
- ⚠️ **HAY UN OYENTE GENÉRICO DE ESCAPE QUE CIERRA CUALQUIER `[role=dialog][aria-modal]` CLICKEÁNDOLE
  EL BOTÓN DE CERRAR** (bloque de accesibilidad, ≈ L101105). Con él, la rama «maximizado → Escape
  restaura» no puede funcionar: en el mismo Escape el panel restauraba y aquél cerraba. En HEAD era
  invisible porque `indicCerrar` es idempotente. **Lo cazó un espía sobre las dos funciones**, no la
  lectura: la traza fue `poner(false) · cerrar() · poner(false)`. Se cierra con
  `stopImmediatePropagation()` sólo en esa rama. **Cualquier diálogo nuevo de esta app hereda ese
  oyente**, así que un botón con «cerrar» en su `onclick` se va a disparar con Escape quiera o no.
- ⚠️ **EL FOCO NO ENTRABA AL PANEL, Y LA TRAMPA DE TAB ESTABA ESCRITA Y NO SERVÍA.** Medido en HEAD:
  al abrir el foco quedaba en `body` y el primer Tab se iba a `#hdr-med-btn`, un botón de la página
  **detrás** del overlay, con el panel anunciándose `aria-modal="true"`. La trampa de Tab del bloque
  de accesibilidad sólo actúa cuando el foco ya está en el primero o el último control del diálogo,
  así que con el foco en `body` no matcheaba ninguno. Lo que faltaba era UNA línea en `indicAbrir`.
- ⚠️ **`_indRepintarConservando` VOLVIÓ A COMPARTIR UNA CLAVE, Y ES LA TERCERA VEZ.** El `summary` de
  todos los ⓘ es el mismo glifo, así que los seis de una sección compartían «Estenosis aórtica ▸ ⓘ»
  y abrir uno los abría o cerraba todos — idéntico al defecto de los trece «Ver detalle». Lo arregla
  `_indClaveSummary` (prefiere el `aria-label`) **en las dos puntas**. **Lo destapó TC-293**, no la
  lectura. Si algún día un `<summary>` nuevo repite texto, ahí está el patrón.
- ⚠️ **EL PISO TÁCTIL DE 44 px NO SE BAJÓ: SE ACOTÓ A `pointer:fine`.** Honra la decisión de Maicol
  del 2026-09-25 («se conserva el piso y lo que baja es el peso visual»). Medido con la emulación
  correcta: **22 px con puntero fino y 44 px con grueso**. Y es `pointer` y no `any-pointer`: con
  `any-pointer`, una tablet con un mouse conectado perdería el piso para el dedo.
- **Qué nota se pliega: SÓLO la de una pregunta, y la compuerta es la MARCA.** Decisión de Maicol con
  el censo medido delante (34 notas de pregunta, 57 de fila de dato). Las 🔴 y ⚠️ **no se pliegan
  nunca** —ahí están las contraindicaciones de la Tabla 8— y el icono de estado queda siempre
  visible. El bloque del mecanismo de IM no se pliega: su pie declara «no se guarda con el estudio».
- **Cobertura:** TC-293 gana **cinco condiciones** del ⓘ con sus dos denominadores y el control
  negativo de la marca 🔴. Verificado que sabe fallar **contra HEAD en un worktree aparte**: cuatro
  en rojo. **Casos nuevos: ninguno**, así que el denominador de la suite no se mueve.
- **Adaptados, con el motivo escrito en cada caso:** **TC-329** y **TC-328** (su helper `hojas()`
  llama «hoja» a cualquier `<div>` sin divs adentro, así que el envoltorio de columna pasaba a
  contar como nota: daba n=2 donde hay una. Se arreglaron **los dos** aunque TC-328 estuviera verde,
  porque ahí pasaba porque sus fragmentos no colisionan, o sea por suerte) y **TC-293** (se excluye
  `data-ind-info` del conteo de controles de detalle —daba 37 donde hay 8— y sus dos selectores de
  conservación pasan a nombrar `data-ind-detalle` para que sigan midiendo lo que dicen).
- ⚠️ **TRES FALSOS DE LA SONDA, Y LOS TRES PARECÍAN MEDICIONES BUENAS.** (1) `centroSel` medía la
  geometría DESPUÉS de `scrollIntoView`, y Chrome devuelve una **posición plausible** para un nodo
  dentro de un `<details>` cerrado —top 0 antes, 2235 después, con el contenedor sin scrollear—: la
  sonda clicaba fuera del viewport, el respaldo por tecla mandaba Enter al documento y la corrida se
  **colgaba 75 s**. El denominador roto no daba cero, daba un número creíble. (2) **Ni `mobile:true`
  ni `Emulation.setEmulatedMedia` cambian el media feature `pointer`** —esa lista sólo soporta los
  `prefers-*`, `color-gamut` y `forced-colors`—: el lever es `Emulation.setTouchEmulationEnabled`
  con `maxTouchPoints`. Con los dos primeros la escena del dedo medía 26 px e informaba
  `punteroGrueso:false` al lado, o sea un «cumple en táctil» sobre una escena de mouse.
  (3) **`Input.dispatchMouseEvent` NO RESUELVE con la emulación táctil puesta**: lo nombró el reloj
  que ahora llevan los despachos; sin él el fallo aparece en el `ev()` siguiente, en la línea
  equivocada. En esas escenas se activa por tecla, exigiendo que el foco haya llegado al blanco.
- ⚠️ **`rawKeyDown` SIN `text` NO ACTIVA UN `<button>`.** Blink activa el botón desde el KEYPRESS, y
  un `rawKeyDown` pelado no lo genera: la sonda informó «no maximiza» sobre un Enter que nunca
  ocurrió. Enter y Espacio van con `type:'keyDown'` + `text`; las teclas de EDICIÓN (Backspace, Tab,
  Escape) al revés, por keycode y con `rawKeyDown`. **Las dos cosas son ciertas a la vez.**
- ⚠️ **TRES DECLARACIONES DEL CSS NUEVO PERDÍAN CONTRA EL `style` EN LÍNEA** (`padding`,
  `border-radius`, `line-height` del botón): el radio seguía en 7 px. Una regla que no gana se lee
  como un arreglo aplicado. El redondeo y el relleno viven en `_indCtrlHTML`, que es su único dueño.
- ⚠️ **ME COMÍ EL ACENTO GRAVE CUATRO VECES**, todas en comentarios míos dentro del cuerpo de la
  sonda o de un caso. `scripts/check_backticks.py` dio la línea exacta las cuatro veces.
- ⚠️ **UNA ESCENA MÍA MEDÍA LO CONTRARIO DE LO QUE DECÍA MEDIR, POR NO EXIGIR EL ESTADO DE PARTIDA.**
  El bloque nuevo de TC-293 clicaba «Presente» sobre una pregunta que el bucle de más arriba del
  propio caso ya había contestado, y un segundo toque sobre la opción activa la **desmarca**. Lo
  arregla `ponerEn(k, v)`, que deja la pregunta en el estado pedido y **devuelve el que quedó**. Es
  la misma lección que este archivo ya tiene escrita para el checkbox y el Espacio.
- **Arnés: `scripts/_probe_evidmarco.mjs`** (A/B de solo lectura con `--file`), con seis grupos
  (`--solo texto|clics|botones|teclado|maqueta|superficies|frases|notas`). El grupo `superficies`
  enumera las seis **una por una** —informe en tres estilos, EN SUMA, Excel con su cuenta de
  columnas, franja del PPT, Laboratorio y los 1087 campos guardados— y da **0 diferencias** contra
  HEAD, con el panel cerrado y con el panel abierto y doce preguntas contestadas con clics reales.
- **Al medir: ABRIR las secciones colapsadas con un clic real en el rótulo ANTES de medir.** Una
  sección nace colapsada cuando ninguna fila trae `ok` ni `alarm` y su recomendación no es `ind` ni
  `alarma`; sus botones existen en el DOM y no tienen geometría. La sonda informa cuántas quedaron
  cerradas, y el censo de frases largas sin eso sale sin una sola frase de esa sección.

- Al **empezar** la tanda del panel de Evidencia de la estenosis mitral (2026-10-11), `main` local y
  `origin/main` estaban los dos en **`1e1e569`**, sin nada sin pushear —confirmado con un
  `git fetch` de verdad—. Los **tres** commits de esa tanda (`af0eb13`, `90a7630` y este) quedan
  locales; el push lo corre Maicol.
  ⚠️ **El commit C de esa tanda NO es sólo documentación**, y conviene saberlo antes de revertir:
  lleva además dos atributos en `index.html` (`data-ind-bloque` y `data-ind-detalle`) y la
  adaptación de **TC-293**, que la SUITE COMPLETA destapó al cierre y la corrida de zona no podía
  ver. **Revertir C solo deja TC-293 en rojo**, porque el atributo que ese caso necesita entró con
  su adaptación mientras el bloque plegado que lo rompe entró en A. El orden de revertido seguro es
  C → B → A.

### Panel de Evidencia · estenosis mitral por etiología (2026-10-11)

- **Línea base al cierre: suite 461/465 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 434 columnas.** Los cuatro rojos son los de entrada y NO son regresiones: **TC-223**
  (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**. El denominador sigue
  siendo **465**: esta tanda no agregó casos, adaptó cuatro (TC-282, TC-293, TC-323, TC-327,
  TC-328 — cinco).
- **El panel usaba su propia graduación y contradecía al informe.** Graduaba por ÁREA SOLA con un
  `_le(avm, US)` propio, no leía `em_gmedio` y tenía una nota que afirmaba que «el gradiente medio
  NO es criterio de severidad»: desde la regla binaria eso era lo contrario de lo que la app hace.
  Hoy la categoría sale de **`emCategoria()`**, la misma función que firma el informe, y se imprime
  con **`EM_CAT_TXT`**. La compuerta de apertura tuvo que sumar la categoría: un gradiente de 12 con
  área normal publicaba «Estenosis mitral significativa» en el papel y **no pintaba tarjeta**.
- ⚠️ **TRES COMPUERTAS DE VOTO, Y DOS FALTABAN.** Un método **destildado** en «Incluir en el
  informe» publicaba «✅ ≤ 1,5 — estenosis clínicamente significativa» tres renglones arriba de una
  categoría que decía «Sin categoría»; y el **THP con IAo severa** publicaba ✅ sobre una fuente
  cuyo voto la app retira —y el THP se acorta con IAo, así que el área por Hatle sale FALSAMENTE
  BAJA: el ✅ estaba del lado que inventa la estenosis—. Se le pregunta al dueño
  (`emMetodoIncluido`, `emThpValido`/`emThpMotivoNoVota`, `emContValido`/`emContMotivoNoVota`) y no
  se reescribe la regla. **Lo encontró la SONDA, no la lectura.**
- ⚠️ **PASAR DE «UNA FILA ELEGIDA» A «CADA FILA CON SU ESTADO» REABRE LA CASCADA FAIL-OPEN, Y EN
  TRES LUGARES.** La cascada vieja hacía `return` sobre las contraindicaciones; el evaluador por
  fila no las miraba, así que una IM moderada publicaba «Clase I · Nivel B · Aplica» al lado de
  «Insuficiencia mitral asociada: contraindicación». Lo mismo con el **trombo sin contestar** —que
  es el estado HABITUAL, porque `oai_trombo` vive en la pestaña ETE y en Modo Básico no existe— y
  con el **área sin medición**. Y la contraindicación por área se calculaba **DESPUÉS** del conteo
  que corta, así que la primera de la Tabla 8 quedaba fuera. **Al cambiar la forma de una cascada,
  censar qué cortaba antes.**
- **El «2 o más» de la app se eliminó con su constante y su centinela.** `clin_desfav_min` era el
  único número de la sección que no salía de ninguna guía. El control pasó a «Ninguna / Una /
  Varias» y con «Una» se publican LAS DOS lecturas. Su fila de `_emAssertUmbrales` salió en el mismo
  movimiento: dejarla habría dejado un centinela comparando 2 contra 2 para siempre y afirmando —por
  su propio mensaje de error— que hay textos que dicen «dos o más».
- ⚠️ **DOS REGLAS DE LA CASA CHOCARON, Y LA SALIDA FUE NO NOMBRAR.** La ASE 2023 es un documento de
  cardiopatía REUMÁTICA y no se cita con otra etiología (TC-327); pero un documento NOMBRADO en
  prosa sin su corchete se lee como «hay una cita que no encontrás». Con etiología no reumática la
  nota dice «un documento de cardiopatía REUMÁTICA» **sin nombre y sin bracket**, y declara que la
  app aplica esos cortes igual. Se pierde saber cuál es; no se pierde que el corte está fuera del
  alcance de su fuente.
- **El «> 8» del score NO se atribuye a Wilkins, y atribuírselo era falso.** La guía escribe
  «echocardiographic score >8» y remite a su **Supplementary Table S3, que no está en la
  biblioteca**: la fila dice «según la guía» y cita sólo a la ESC. Lo verificado del artículo de
  Wilkins —0 a 4 por ítem, 0 a 16 el total, y **ningún 8**— vive en la nota de guías previas.
- **La ESC/EACTS 2025 se contradice consigo misma DOS veces, y las dos quedan declaradas:** el
  operador del área (`≤` en el folio 4680 y en la Figura 14; `<` en el §10.2.3 del mismo folio) y
  «varias» (nota ^c de la Recommendation Table 8, folio 4682: «several of the following»; nota ^c de
  la Figura 14, folio 4681: «Favourable = absence of unfavourable characteristics», o sea cero).
- **`r.bloques` es ADITIVO** y lo usa una sola sección: las otras catorce no lo devuelven. Verificado
  por longitud y hash sobre las **cuatro** que un paciente sembrado pinta — ⚠️ la primera versión de
  ese control negativo corría sobre **UNA** sección ajena y decía «idénticas» sobre un conjunto de
  uno. **Informar el denominador al lado del veredicto.**
- ⚠️ **LA SUITE COMPLETA DESTAPÓ TC-293 Y LA ZONA NO PODÍA.** El bloque plegado se contaba como un
  control de detalle (nueve donde hay ocho, dos rótulos donde va uno) y metía 26 controles clínicos
  detrás de un `<details>`. Se marcaron los nodos por ATRIBUTO (`data-ind-bloque`,
  `data-ind-detalle`) y no por rótulo, y el caso pasó a preguntar DOS cosas con su control negativo:
  ninguno detrás del «Ver detalle», y los de un bloque son sólo los de la mitral sin etiología.
- ⚠️ **DOS FALSOS DE LA SONDA NUEVA, Y EL SEGUNDO ESTABA EN MI LECTOR.** (1) `abrirTodo` solo no
  alcanza después de `limpiarCampos`, que cierra el cajón de la estenosis mitral: hay que abrir con
  `valvDatosTog` y verificar la geometría JUSTO ANTES de medir —la trampa que este archivo ya
  documenta para la pasada de celular—. (2) Tres corridas informaron «SECCIÓN AUSENTE» en las cinco
  morfologías con la sección perfecta: mi script de lectura preguntaba `sec.get('seccion') is None`,
  y en Python eso da `None` **también cuando la clave no existe**, que es el caso de éxito. **El
  denominador roto puede estar en el lector, no en la app ni en la sonda.**
- ⚠️ **ME COMÍ EL ACENTO GRAVE SEIS VECES**, todas en comentarios míos dentro del cuerpo de un caso
  o de la sonda, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta las seis veces. **Correrlo antes de cada commit.**
- **Arnés: `scripts/_probe_emevid.mjs`** (A/B de solo lectura con `--file`). Mide el OBJETO y el
  HTML pintado: sólo el objeto deja pasar un bloque que la sección arma y el renderizador no pinta;
  sólo el HTML no distingue «no aplica» de «no se evaluó».
- **Dónde está todo:** `docs/mapa/panel-evidencia.md` (los bloques y la sección por etiología),
  `docs/fuentes/FUENTES.md` (los folios 4680-4682, la tabla de clases y niveles, y las rutas reales
  en disco), `docs/PENDIENTES.md` (lo declarado y no corregido).


### Tanda anterior — estenosis mitral binaria (2026-10-11)

- Al **empezar** la tanda de la estenosis mitral binaria (2026-10-11), `main` local y `origin/main`
  estaban los dos en **`8a1d411`**, sin nada sin pushear —confirmado con un `git fetch` de verdad y
  no con el ref en caché—. Los **cuatro** commits de esa tanda (`dae0064`, `128dc4f`, `0142b24` y
  este) quedan locales; el push lo corre Maicol.
  ⚠️ **Esa tanda arrancó PARANDO en el punto 0**, porque había un commit de documentación sin
  pushear (`8a1d411`, la línea base remedida). Era sólo `CLAUDE.md`, pero la orden decía parar y
  avisar: mezclarlo con la tanda rompe «revertir cada commit solo».
  ⚠️ **Este renglón se escribió mal una vez**: decía «doce commits sin pushear, `origin/main` en
  `2e017a1`», copiado del estado anterior sin mirar. `origin/main` había avanzado. Antes de
  escribirlo, `git rev-parse --short origin/main` y `git log --oneline origin/main..HEAD`.
- **Línea base al 2026-10-11 al cierre de la tanda de la estenosis mitral binaria: suite 461/465
  con el pendrive MONTADO, Semgrep 127 / 0 ERROR, Excel 434 columnas.** Los cuatro rojos son los de
  entrada y NO son regresiones: **TC-223** (el documentado, falla por la fecha), **TC-376**,
  **TC-390** y **TC-406**. Con el pendrive AFUERA no se midió en esta tanda; ahí caen además los
  diecisiete de **TC-181…TC-197**, los del pendrive `DISK_IMG`, que son ENTORNO y no prueban nada.
  Chequeo de celular, idéntico a antes de la tanda:
  `node scripts/check_mobile.js` → **43 hallazgos a 360 px y 52 a 390 px, 1 ALTA cada uno**;
  con `--todo` → **367 a 360 px y 376 a 390 px, 1 ALTA cada uno**. La única ALTA es el
  `#caso_interes` preexistente y ajeno.
  ⚠️ **El denominador es 465 y no 464**: esta tanda sumó **TC-450**, la cobertura de la regla nueva
  (32 condiciones). Los renglones viejos de este archivo —421/422, 425/429, 426/430, 436/440,
  445/449, 439/460, 440/461, 460/464— quedaron atrás, así que volver a medir antes de leer una
  tanda de mutaciones sigue siendo obligatorio.
  ⚠️ **El «2 hallazgo/s de severidad ALTA» del resumen de `check_mobile.js` ES EL TOTAL DE LOS DOS
  ANCHOS**, no una regresión: 1 a 360 px + 1 a 390 px, el mismo `#caso_interes` las dos veces. Leí
  ese renglón como «subió de 1 a 2» y fui a buscar un defecto que no existía. Mirar los `▸ NNN px`
  de arriba, que son los que la línea base compara.
  ⚠️ **Y EL PENDRIVE SE DESMONTÓ A MITAD DE ESTA TANDA**: abrió montado (452/456, 4 rojos) y cerró
  afuera (439/460, 21 rojos). Las dos describen el mismo árbol; restarlas da una «regresión» de 17
  casos que no existe. Mirar `ls /Volumes/DISK_IMG` ANTES de comparar dos cifras, incluso dentro de
  la misma sesión.
  ⚠️ **Y mirar si el pendrive está montado ANTES de comparar dos cifras.** Esta tanda abrió con el
  pendrive afuera (428/449, 17 rojos de entorno) y lo tenía puesto al cerrar (445/449): las dos
  describen el mismo árbol y restarlas da una «regresión» de 17 casos que no existe.
  ⚠️ **Y medirla DE VERDAD, no leer este renglón:** esta tanda abrió con 409/430 y 17 rojos, de los
  que 7 tenían una causa ÚNICA y compartida (el guardián del importador) y ninguno era de la mitral
  aunque sus títulos lo dijeran. Correr los sospechosos con `--solo` **sobre HEAD** fue lo que
  separó «lo rompí yo» de «ya estaba roto»: dieron 17/17 ✓.

### Estenosis mitral — la regla es BINARIA: significativa / no significativa (2026-10-11)

- **Dos cortes de gradiente donde había uno.** `EM_GMEDIO_SIGNIF = 4` (borde `>`) se reemplazó por
  **`EM_GMEDIO_ELEVADO_MIN = 5`** y **`EM_GMEDIO_SIGNIF_MIN = 10`**, los dos con borde **`>=`**, de
  la **ASE 2023, Tabla 1, folio 8** (`< 5` / `5-9` / `>= 10`, a FC de 60-80 lpm). `AVM_SEVERA_MAX`
  (1,5, borde `<=`) **no se tocó**. Significativa = peor AVm `<= 1,5` **O** gradiente `>= 10`.
- ⚠️ **SACAR UNA CONSTANTE Y DEJAR VIVO SU `window.*` MATA LA APP ENTERA.** La línea
  `window.EM_GMEDIO_SIGNIF = EM_GMEDIO_SIGNIF` sobrevivió al borrado de la constante: un
  `ReferenceError` en la evaluación de un `<script>` **aborta el bloque COMPLETO**, así que no se
  definían `showTab` ni `calcEM` y la página cargaba «entera» con cero pestañas con geometría. Lo
  cazó la SONDA, no la lectura: `grep` de la constante mostraba tres apariciones y dos eran
  comentarios, así que la única ejecutable se perdía en el ruido. **Contar los `window.X = X`, no
  los `grep` de X.**
- ⚠️ **GATEAR EL VOTO POR LA CASILLA LE CAMBIA LA CATEGORÍA A TODA LA BASE ARCHIVADA, Y HAY UNA
  SOLA FORMA DE EVITARLO.** De las tres fuentes de área votan sólo las marcadas en «Incluir en el
  informe», pero la compuerta se aplica **sólo si la casilla está RESUELTA** (`dataset.tocado` o
  `dataset.desdeEstudio`); sin resolver vota por su valor. Con un `.checked` pelado, los estudios
  anteriores al selector —que no traen `em_pdf_plan__chk`— reimprimían sin la estenosis que su PDF
  firmado afirma: `_restaurarChkInclusion` hace `cb.checked = false` cuando la clave falta, la
  ventana de reimpresión hace `el.checked = (c[id+'__chk'] === '1')`, y **`calcEM` —la única que
  vuelve a subir el tilde— NO corre en esa ventana**. `emAvmPdfVal` ya documentaba esta trampa
  para la fila «AVm» del papel; ahora está medida también para el veredicto.
- **Con IM significativa el criterio del gradiente se retira COMPLETO**, las dos bandas (5 a <10 y
  también `>= 10`): la categoría es `gradiente_im` y su texto no lleva la palabra «estenosis». El
  **área sigue votando**, y por eso su escalón va PRIMERO en la cascada.
- **`probable` se eliminó.** La discrepancia de áreas la decide el peor. El aviso
  `em-discordancia` tuvo que pasar a colgar del HECHO (`sev` y `noSev` las dos con contenido): con
  `cat.clave === 'probable'` quedaba **mudo para siempre** sobre una discrepancia que sigue
  existiendo.
- **La palabra visible y el valor guardado son dos cosas.** `em_grado='severa'` **no cambia** —lo
  leen el Excel, `_labEstenSev` y Evidencia— y se muestra «Significativa». Un solo dueño,
  `EM_GRADO_VIS`/`emGradoVis`, donde había **cuatro** mapas de la misma palabra.
  ⚠️ **Y DE LA `<option>` CUELGA EL PPT:** `_pptSel` devuelve el TEXTO de la opción cuando el nodo
  es un `<select>`, así que la franja de hallazgos pasó de «EM: severa» a «EM: significativa». Es
  el «empate frágil» que el comentario del PPT declaraba, roto a propósito y medido.
- ⚠️ **TRES FRASES DEL PAPEL SALIERON MAL DE LA PRIMERA PLANTILLA, Y LAS ENCONTRÓ LA TABLA DE
  FRASES —no la lectura—.** (1) paréntesis anidados terminando en «))», el mismo defecto que la
  rama de prótesis ya documenta; (2) con el criterio sólo del gradiente, el área iba primero y la
  frase arrancaba con «AVm 4.00 cm²» dentro de una oración que afirma estenosis significativa
  —el dato que la niega—; (3) «(por gradiente: gradiente medio 10 mmHg)», que se repite a sí
  misma. **Medir la tabla completa de combinación × estilo antes de commitear el papel.**
- **Con el ÚNICO método destildado la estenosis se CALLA** —ni afirmación ni número, como la rama
  de prótesis—. Antes publicaba «sin estenosis ni insuficiencia» sobre una válvula con AVm 1,2
  medido; y la rama de «valores sin veredicto» publicaba «morfología normal ().» con la lista
  vacía, el mismo paréntesis vacío del «estenosis severa ()» de al lado.
- **El cuadro de Válvulas cita SOLO ASE 2023**, y no es cosmético: decía «ESC/EACTS 2021 · ASE
  2023» y **`FUENTES.md` no tiene NINGUNA entrada de ESC/EACTS 2021** —cero—. La ESC/EACTS 2025
  está registrada pero **sin página verificada de severidad de EM**. El censo de lo que sigue
  citándola en otros módulos está en `FUENTES.md` y en `docs/PENDIENTES.md`.
- **El cuadro necesitó LAS DOS COLUMNAS**, como `itIncongruenciaSync` y `eteVmAvisoSync`:
  `emCuadroRefRepintar` en `RECALC_MODULOS` —`calcEM` no está en esa lista— y `limpiarCampos`
  reponiendo la **clase** (el texto lo pone en «—» el barrido genérico de
  `.calc-box .calc-row span[id]`, que es además el estado pedido).
- ⚠️ **LA PRIMERA PASADA DE CELULAR DEL CUADRO FUE UN FALSO, Y POR UNA CAUSA NUEVA:** la sonda
  tipeaba `thp`, que vive en la pestaña **Doppler**, y `showTab` se llevaba el cajón de la
  estenosis. A 360 px `bloque-em-detalle` quedaba en `display:none` **computado** pese al
  `display:block` en línea —el CSS del celular usa `.valv-datos-abierto > #bloque-em-detalle` con
  `!important`—, el gradiente nunca reciía el tecleo y las cuatro filas medían `w=0`: «ninguna fila
  desborda» sobre un cuadro que no estaba dibujado. **Abrir con `valvDatosTog` —el gesto del
  médico— y verificar el ancho JUSTO ANTES de medir, no al abrir.**
- ⚠️ **ENTER NO ACTIVA UN CHECKBOX; LA TECLA ES ESPACIO.** El respaldo por tecla de `clicEn` manda
  Enter, que en un `<button>` es una activación nativa y en un `<input type=checkbox>` **no hace
  nada**: la sonda informaba «clic: tecla Enter» y medía «sigue votando» sobre un gesto que nunca
  ocurrió. Y **exigir el estado de partida**: si la casilla ya estaba destildada, el clic la TILDA
  y la escena mide lo contrario de lo que dice medir.
- **Cobertura: TC-450**, 32 condiciones —los dos cortes por sus dos lados y sin solape, los dos
  controles negativos de la IM, el destildado, el estudio anterior al selector por los DOS caminos
  con su control negativo, las tres reglas de redacción y el cuadro entero—. Verificado que sabe
  fallar corriendo el caso **contra HEAD en un worktree aparte**: 8 condiciones en rojo.
  Arnés: `scripts/_probe_emsignif.mjs` (A/B de solo lectura con `--file`).
- **Adaptados con el motivo escrito en cada caso:** TC-42, TC-43, TC-261, TC-289, TC-304, TC-306,
  TC-308, TC-384, TC-388 y TC-402.
  ⚠️ **TC-308 y TC-393 no estaban en mi lista de zona y los destapó la SUITE COMPLETA.** Y en
  TC-393 cambié a «Significativa» un aviso que es de la **IM**: busqué el literal con `grep` y lo
  asumí de la estenosis. La nomenclatura nueva es **sólo** de la EM.
- ⚠️ **Me comí el acento grave CINCO veces en esta tanda** —una en el cuerpo de la SONDA y cuatro
  en comentarios dentro de un caso— con el archivo que documenta la trampa abierto delante. En una,
  `node --check` apuntó la línea 37385 y el culpable estaba en la **37549**: 164 líneas después.
  `scripts/check_backticks.py` dio la línea exacta las cinco veces. **Correrlo antes de cada
  commit, no después del suite.**

### ⏸️ PENDIENTE DE MAICOL — la banda de plausibilidad del gradiente VD-AD (2026-10-05)

> «el narrativo no hereda la banda de plausibilidad del gradiente VD-AD; el PDF sí
> (MARCA_REVISAR); medido en HEAD: 300 en el Doppler imprime 360000 mmHg sin marca»

Lo decide Maicol en otro trabajo. **No se toca**: corregirlo es cambiar una frase del informe.
Dónde está: el PDF arma el gradiente con `vPlaus('vmax_it')` y le pega `MARCA_REVISAR` cuando el
valor cae fuera de `[0.5, 8]`; el narrativo lo arma con `v('vmax_it')` crudo, en el bloque 9 de
`generarInforme`. La medición se hizo contra HEAD con la copia en `/tmp`, no sobre el árbol vivo:
`vPlaus` devuelve `{crudo:300, fuera:true, b:[0.5,8]}` —o sea la banda SÍ lo detecta— y el
narrativo igual publica «Gradiente VD-AD de 360000 mmHg» sin una sola marca. Desde que la Vmax IT
es un dato con dos campos, ese agujero se alcanza también escribiendo en el campo de Válvulas.

### Tricúspide — la Vmax IT es UN dato con DOS campos (2026-10-05)

- **`vmax_it` (Doppler) e `it_vmax_cw` (Válvulas) son el MISMO dato y están los dos en m/s.** Eran
  campos separados, en unidades distintas, para la misma medición: el médico la cargaba dos veces,
  y si la cargaba una sola, la mitad de la app no se enteraba. `itVmaxSync` los espeja en los dos
  sentidos, borrado incluido. **El `it_pisa_val` de al lado se queda en cm/s: es Doppler COLOR.**
- **No hay bucle, y NO es por la guarda:** asignar `.value` por código no dispara `oninput`. La
  guarda `_itVmaxSinc` está para el día en que alguien despache un `input` a mano (los arneses lo
  hacen). La salida temprana por valor igual es lo que evita que salte el caret al tipear.
- **La conversión de unidad va DENTRO de `calcIT_ESC`** (`vmaxCW * 100`), nunca en el campo: el
  campo guarda lo que el médico ve. Verificado contra HEAD con tres casos (3,0 / 2,5 / 2,0 m/s
  contra 300 / 250 / 200 cm/s): EROA 67,9 / 22,0 / 8,5 mm², volR, severidad, grado, PSAP y
  gradiente VD-AD **idénticos**.
- ⚠️ **EL NORMALIZADOR DE LEGADO CUBRE LAS TRES RUTAS, Y TIENE QUE CUBRIRLAS.** La orden decía
  «sólo al editar», pero se midió que la REIMPRESIÓN (`_pdfDeInformeGuardadoArmar`) llama a
  `calcIT_ESC()`: normalizar sólo en `editarInforme` habría dejado la reimpresión de un estudio
  viejo divergiendo de HEAD, que es lo que la orden prohibía. Va en `_migrarCamposLegacy`, que es
  **en memoria y no reescribe el disco** (mismo precedente que `ip_grado` y el `vp_morf` partido).
  Corte: `> 8` es cm/s y se divide por 100; `8` o menos se deja. **Las dos bandas no se solapan**
  —0,5 a 8 m/s = 50 a 800 cm/s—, así que no hay zona gris.
- **El informe cambia en UNA escena, a propósito y autorizado:** cargar la Vmax SÓLO desde Válvulas
  ahora publica «Gradiente VD-AD de 36 mmHg» donde antes decía «Sin registro de velocidad de
  regurgitación que permita estimar PSAP» **con el dato cargado en la otra pestaña** — una frase
  falsa en un informe firmado. El Excel gana el número en «Grad VD-AD (mmHg)». **No se cambió ni
  una letra de ninguna frase**: cambió que el dato llegue. Las otras dos formas de cargarlo —sólo
  por Doppler, o los dos campos— dan informe **idéntico** a HEAD. El EN SUMA no cambia en ninguna.
- **El aviso de incongruencia (`it-incongruencia`) necesita las DOS columnas** —`limpiarCampos` y
  `RECALC_MODULOS`—, al lado de `eteVmAvisoSync` y por la misma razón. Lo cazó el **control
  negativo** de la sonda, no una lectura: el aviso rojo del paciente anterior sobrevivía a «Nuevo
  estudio» sobre un formulario vacío. `calcIT_ESC` lo repinta pero `limpiarCampos` no lo llama, y
  `toggleValvPill` sólo si la pastilla CAMBIA —y tras limpiar ya estaba apagada—: las dos puertas
  cerradas a la vez. El estado que denuncia es estrecho porque `calcPSAP` prende la pastilla al
  cargar la Vmax: sólo se alcanza si el médico la apagó a mano.
- **Los otros tres parámetros de IT NO prenden el botón** (medido): `it_vc`, `it_pisa_r` e `it_vti`
  dejan la pastilla apagada. El aviso NO se extendió a ellos.
- **El panel de Evidencia estaba mal en tres cosas a la vez** y se corrigió (autorizado): imprimía
  `300,00 m/s` sobre un valor en cm/s, decía «da la PSAP estimada» (la PSAP sale de `vmax_it`) y
  decía «no gradúa la insuficiencia» justo sobre el divisor de la ecuación de PISA. **El panel es
  sólo de pantalla** —`@media print` lo apaga y ningún generador de PDF/PPT ni el narrativo leen
  `IND_SECS`; lo fija TC-272—, así que la corrección no toca ninguna superficie firmada.
- **Cobertura: TC-415**, 23 condiciones, con los dos controles negativos del aviso y el denominador
  del EN SUMA. Antes esto no tenía ninguna cobertura automática. Arnés: `scripts/_probe_itvmax.mjs`
  (A/B con `--file`, solo lectura) y `scripts/_probe_tricusp.mjs` ahora **consciente de la unidad**
  (`cwIT()` lee el placeholder del campo, así que una escena describe un paciente y no un tecleo).
- 🔧 **`scripts/check_backticks.py`** — localiza el acento grave dentro del cuerpo de un caso o de
  una sonda. `node --check` detecta el error pero apunta a la primera interpolación, decenas de
  líneas antes del culpable; este script da la línea exacta. Verificado por mutación: con un acento
  grave inyectado señala la 49425 mientras `node --check` dice 49342. **Me comí ese acento grave
  cinco veces en dos tandas**, con el archivo que documenta la trampa abierto delante.

### Tricúspide — la ESTENOSIS es binaria: Significativa / No significativa (2026-10-05)

- **`et_grado` tiene TRES opciones y sus `value` cambiaron los tres.** El centinela pasó de
  `"Sin estenosis"` a **`"sin"`**, y las dos reales son `"Significativa"` y `"No significativa"`.
  Desaparecen Leve, Moderada y Severa **de esta válvula**: la EAE/ASE 2009 y la ESC/EACTS 2021 no
  graduan la ET. Los cortes NO se tocaron (`ET_GMEDIO_SIGNIF 5`, `ET_THP_SIGNIF 190`,
  `ET_AVT_SIGNIF 1`). **No hay opción visible «Sin estenosis»: botón apagado = sin estenosis.**
- ⚠️ **EL CENTINELA TUVO QUE SER `'sin'` Y NO ES COSMÉTICO.** `SEV_TOKEN_SIN.esten` vale `'sin'` y lo
  comparten las cuatro estenosis. Con `'Sin estenosis'`, `valvGradoVisSync` calcula
  `hayGrado = !sevEsSin('esten','Sin estenosis')` → siempre `true`, y el bloque de la ET quedaba
  **visible para siempre con el botón apagado**. La alternativa era tocar `SEV_TOKEN_SIN`, que
  gobierna las otras cinco válvulas. De paso cierra la falla R7 de
  `docs/decisiones/valvulas-botones.md` §5.4 («EL SELECT RECHAZO sin»).
- **`et` ENTRÓ A `SEV_SINC`** (séptima clave), y con eso aparecieron `et-manual-aviso` y el cajón
  `et-fund` / `et_fund_nota`. **Cero líneas de `sevSincronizar`, `sevDiscrepa`, `sevComparable`,
  `sevFundamento`, `sevFundLimpiar`, `sevFundRestaurar` y `valvSev`**: los siete se derivan del
  registro, que es lo que sus comentarios anticipaban. El proveedor es **PURO** (`etGradoCalculado`
  lee los campos), así que la entrada **no declara `recalcular`** — a diferencia de `im`/`ia`/`it`,
  que leen una foto de proceso.
- ⚠️ **`calculables`/`comparables` VAN CON LITERALES Y NO CON `ET_SIGNIF_TXT`.** Esas constantes se
  declaran ~3.000 líneas más abajo y las listas se evalúan al CREAR el registro: nombrarlas revienta
  en la zona muerta de `const` y se lleva el `<script>` entero, o sea la app **sin aviso ni cajón en
  ninguna válvula**.
- **El centinela NO está en `comparables`**, y es lo que hace que «cálculo No significativa + grado
  en — grado —» **no** discrepe (decisión de Maicol, textual). Son dos puertas: eso y que la marca
  manual no se enciende sola en ese estado.
- **El sistema escribe «Significativa» y NUNCA «No significativa».** El cálculo produce los dos
  —los necesita el aviso en los dos sentidos— pero esa afirmación la firma el médico.
  ⚠️ **Y POR ESO `_etAutoGrado` CORRE DESPUÉS DE `sevSincronizar`, NO ANTES.** R6 escribe el
  calculado con `sel.value = calc`, así que «el médico fijó Significativa · después corrige el
  gradiente a 3» dejaba **«No significativa» escrito por el sistema**. Corriendo después, el retiro
  lo encuentra marcado como sugerido, lo devuelve al centinela y apaga el botón (reglas 7 y 8). Lo
  fija TC-416 (e).
- ⚠️ **`_etApagarAuto` NO ES `valvAutoApagarEsten`, y las dos diferencias las encontró la sonda, no
  la lectura.** (1) Borra la clave de `localStorage` en vez de dejarla en `'0'`: si no, el
  auto-prendido **se gasta en un solo uso** —8 prende, 3 apaga, 8 ya no vuelve a prender—.
  (2) Borra `esqSevManual.et` y su foto: la cadena `toggleValvPill` → `valvApagarGrado` →
  `valvSev.aplicar(…, centinela)` pone la marca manual, y desde que la ET está registrada eso corre
  **también cuando el que apaga es la app** — con la marca puesta, `_etAutoGrado` salía por su
  guarda y el auto-prendido quedaba muerto para el resto del estudio. **El apagado del MÉDICO no
  pasa por acá** (su clic entra directo a `toggleValvPill`), así que sigue siendo durable: con el
  gradiente corregido a 9 el botón no se reprende. El mismo agujero de la clave en la **PULMONAR**
  queda **REPORTADO y no corregido** — es su informe firmado y es otra tanda.
- **El área por continuidad no podía prender nada hasta hoy**: `tsvd_diametro` y `vti_tsvd` (pestaña
  VD) no llamaban a `calcET`, así que el tercer criterio nunca votaba desde su origen. Se agregó
  `calcET()` a esos dos `oninput`.
- **`SEV_SIN_APAGA_VALVS` NO incluye la tricúspide y se dejó así**: agregarla habría cambiado también
  la **insuficiencia** tricuspídea, que esta tanda no toca. Consecuencia declarada: elegir el
  centinela a mano **no** apaga el botón de la ET (lo fija TC-405).
- **Informe y EN SUMA: se BORRÓ el sufijo `, significativa` cuando el grado ya lo dice** (decisión de
  Maicol; es un borrado, no una frase nueva). Sin eso salía «ET significativa, significativa.» y, en
  la discrepancia, «no significativa, significativa» — una contradicción en la misma oración. Las
  frases de Leve/Moderada/Severa **no** se tocaron, así que un legado con «Leve» imprime igual que en
  HEAD. El grado consignado manda, que es la regla 10.
- **Migración de legado: SÓLO `'Sin estenosis'` → `'sin'`**, en memoria (`_migrarCamposLegacy`), y no
  es por los estudios con estenosis sino **por los que no la tienen**: era el valor de FÁBRICA, lo
  traen todos. Sin eso el `<select>` queda en `selectedIndex -1`. **Los tres grados viejos NO se
  traducen**: mapear «Severa» a «Significativa» es inventar una equivalencia que la guía no hace.
- **Importador: `LAB_XLS_LISTAS_LEGADO`**, tabla nueva de valores **sólo-de-entrada**. Los cuatro
  valores viejos de `et_grado` tienen que seguir aceptándose porque para una columna `opcion` un
  valor desconocido descarta la **FILA ENTERA** — y `'Sin estenosis'` lo trae cada fila de cada
  backup anterior. `_labXlsAssertListas` saltea esa tabla **sólo en la segunda dirección**; la
  primera (una `<option>` que falte en la lista) sigue vigilada para las seis válvulas. Sin esto el
  chequeo de arranque gritaba cuatro divergencias esperadas en cada carga y **enterraba la próxima
  divergencia real** — eran los 7 rojos de mitral/prótesis de esta tanda, con causa única.
- **PENDIENTE DEL LABORATORIO (decisión de Maicol, 2026-10-05):** la estenosis tricuspídea ahora es
  binaria (Significativa / No significativa / botón apagado = sin estenosis). El Laboratorio todavía
  no la cuenta: `_labEstenSev` devuelve `null` para los dos grados nuevos y esos estudios quedan
  fuera de la fila. Cuando se ajuste el Laboratorio hay que contar tres categorías distintas, sin
  equiparar Significativa con Severa ni No significativa con Sin.
  Medido: con base 0 la fila sale «Esten. Tricusp. (sin datos)» con rayas en las cuatro columnas —
  sin NaN y sin división por cero, en el gráfico y en el PDF de auditoría— y las otras siete filas
  son **idénticas a HEAD**.
- **Lo que NO se contó y queda declarado:** `VALVSIG` (CeiboAnalytics) no reconoce «Significativa»
  —su regex es `/severa|moderada/`— así que una ET significativa no cuenta como valvulopatía
  significativa ahí. Y la fila «ET grado» de «Ver detalle» lleva `grades:true`, que hace `parseInt`
  sobre un texto: **ya no se imprimía en HEAD** con ningún valor, así que no es una regresión.
- **Excel: 434 columnas, mismo juego de claves.** La única celda que cambia es «ET grado», que pasa de
  `Sin estenosis` a `sin` en un formulario vacío — el mismo token crudo que `ep_grado` ya publica.
- **El panel de Evidencia no cambia en nada**: `IND_SECS` **no lee `et_grado`**. Medido en los cuatro
  estados: 1 sección / 6 filas con el gradiente cargado y 0/0 sin él, **idéntico a HEAD en los
  cuatro**. No pierde ni inventa una fila.
- **Cobertura: TC-416**, 20 condiciones, con los tres criterios por separado, las dos discrepancias,
  **dos controles negativos** (datos sin criterio, y el centinela sobre un cálculo negativo), el
  vaivén del auto-prendido, el apagado manual durable y «Nuevo estudio». Arnés:
  `scripts/_probe_etbin.mjs` (A/B de solo lectura con `--file`).
- **Casos adaptados** (los nueve estaban VERDES en HEAD): **TC-137** (el reposo es `'sin'`; y
  **cambió una afirmación a propósito**: a 5,0 mmHg `calcET` ahora SÍ escribe el grado),
  **TC-391** (seis claves → siete), **TC-395** (26 opciones → 25), **TC-400** (la ET entra con
  «Significativa», no con «leve»), **TC-405** (la tricúspide YA está registrada), **TC-411** (las
  seis combinaciones usan el grado binario) y los cuatro que caían por el guardián del importador.
  ⚠️ **El control negativo de TC-400 estaba roto en mi primera versión**: preguntaba por
  `/significativa/i` sobre un EN SUMA cuya frase de normalidad dice «ni funcionales
  **significativas**», así que no podía pasar nunca. Ahora pregunta por la sigla «ET ».
- **Línea base al cierre: suite 428/449, Semgrep 127 / 0 ERROR, Excel 434 columnas, móvil idéntico a
  HEAD.** El chequeo de celular se mide de DOS formas y las dos dan lo mismo que en HEAD:
  `node scripts/check_mobile.js` → **43 hallazgos a 360 px y 52 a 390 px, 1 ALTA cada uno**
  (oculta la severidad BAJA); `node scripts/check_mobile.js --todo` → **367 a 360 px y 376 a
  390 px, 1 ALTA cada uno**. La única ALTA es el `#caso_interes` preexistente y ajeno.
  De los 21 rojos, **cuatro** son los de entrada —**TC-223**, **TC-376**, **TC-390**,
  **TC-406**— y los **diecisiete** restantes son **TC-181…TC-197**, los del pendrive
  `DISK_IMG`, que estaba AFUERA al medir: son entorno y no prueban nada (ver «Trampas
  conocidas»). Con el pendrive puesto la cifra es **445/449**.
  ⚠️ **El denominador subió a 449**: esta tanda agregó **TC-432**, **TC-433** y **TC-434**.
- ⚠️ **Me volví a comer el acento grave DOS veces**, las dos en comentarios míos dentro del cuerpo de
  un caso. `node --check` apuntó 87 y 88 líneas antes del culpable; `scripts/check_backticks.py` dio
  la línea exacta las dos veces. **Correrlo antes del suite, no después.**

### Tricúspide — `it_grado` es un `<select>` y el grado 3 quedó inalcanzable (2026-10-05)

- **`it_grado` dejó de ser `<input type="hidden">`**: es el `<select>` VISIBLE del grado final de la
  IT, con cuatro opciones (`0 — grado —`, `1 Leve`, `2 Moderada`, `4 Severa`). Mismo `id` y mismos
  `value`, así que es **un dato con dos controles** —el desplegable y la pastilla «Severidad ▼»—, no
  dos fuentes. No tiene espejo `it_sev_final`: a diferencia de la IM y la IAo, desplegable y campo
  son el MISMO nodo, así que el defecto `*_grado` vs `*_sev_final` no existe acá por construcción.
- **Su `onchange` llama a `valvSev.aplicar` y eso obligó a una guarda de re-entrada.** `aplicar`
  despacha `change` sobre el campo; con el campo hecho `<select>` eso vuelve a entrar a `aplicar`.
  La guarda (`_aplicando`) descarta la llamada anidada. `valvSev.limpiar` despacha su `change`
  **con la guarda puesta**, porque si no se deshacía a sí misma (ponía marca y foto nuevas que las
  líneas siguientes borraban: el estado final coincidía sólo por el ORDEN de dos líneas).
- ✅ **RESUELTO 2026-10-05: la salvedad diastólica aparece con IT moderada o severa
  (`DT_IT_SIGNIF = 2`).** La frase es «La insuficiencia tricuspídea significativa puede invalidar
  estos parámetros de llenado (ASE).», no se tocó una letra, y sigue saliendo **sólo con patrón
  diastólico anormal** (relajación, pseudonormal o restrictivo).
  Historia, porque el número no se entiende solo: quitar «Moderada-severa» (código 3) de la IT dejó
  el 3 INALCANZABLE —las opciones son 0/1/2/4—, así que `itG >= 3` había quedado equivaliendo a
  `itG === 4` y **la salvedad se había estrechado a IT SEVERA sin que nadie tocara una constante**.
  Con el corte en 2 el alcance vuelve a ser el intencional y además deja de depender de una opción
  que no existe.
  **Medido, 3 de 20 celdas de la matriz patrón × grado:** aparece en relajación, pseudonormal y
  restrictivo **con grado 2**; los patrones **normal e indeterminado siguen callados a cualquier
  grado**, y los grados 0 y 1 también. Lo fija **TC-136**, que ahora prueba el corte por los dos
  lados (1 no, 2 sí) sobre el MISMO patrón restrictivo.
  **Consecuencia declarada en el Laboratorio:** la estadística «Con IT significativa (salvedad)»
  usa el mismo predicado `itSignif`, así que su recuento sube. No se tocó código del Laboratorio —
  es el mismo hecho clínico leído por dos lugares, y duplicar el corte sería el defecto.
- **El 3 sigue vivo en el resto de la app y no se tocó**: la mitral y la aórtica lo ofrecen en su
  `<option value="3">`, la estenosis pulmonar tiene su «Moderada-severa», y la etiqueta y su mapeo
  existen en `INSUF_TXT`, `imTxt`, `GTX`, `GT`, `_ESC04`, las seis tablas `ITT` de los módulos
  congénitos y el vocabulario 0-4 del Excel. **Se sacan de a una, por orden expresa.**
- **Dos casos se adaptaron** (los dos estaban VERDES en HEAD y se pusieron rojos por el cambio):
  **TC-136** repuntado de `it_grado='3'` a `'4'` —el caso ahora prueba MENOS: la banda 2 quedó sin
  cobertura de esa salvedad, y está dicho en el caso—; **TC-285** perdió sólo las aserciones del
  grado 3 y conserva las del 2, la clase/nivel de la fila y la nota.
- ⚠️ **`comparables` de `it` ya excluía el '3'** (`['0','1','2','4']`), así que un 3 fijado a mano
  nunca levantaba el aviso de discrepancia. No es nuevo de esta tanda.
- ⚠️ **El PPT coincide con HEAD por un empate frágil, no por diseño.** `_pptSel` devuelve el TEXTO
  de la opción cuando el nodo es un `<select>`, así que la IT ya no entra por el `/^\d+$/`; lo que
  iguala la salida es el `.toLowerCase()` de dos líneas más abajo, porque los textos de las tres
  opciones son exactamente `_ESC04[1,2,4]` capitalizados. **Renombrar una de esas opciones cambia
  la franja del PPT sin que nada más se mueva.** Verificado valor por valor (0, 1, 2 y 4).
- **Un estudio guardado con `it_grado='3'`** reabre con el `<select>` en `selectedIndex -1` y el
  informe degrada a «insuficiencia.» / `IT presente.` (no a «ausente»). Maicol declaró que no hay
  estudios así, así que **no se migró nada ni se agregó aviso**.
- Arnés de esta tanda: `scripts/_probe_tricusp.mjs`, A/B de solo lectura con `--file` para correr
  contra una copia de HEAD. **0 diferencias** en informe (3 estilos), EN SUMA (3 estilos), Excel 434
  y campos guardados, en 5 escenas más un control negativo de las otras tres válvulas.
- **Las sondas del VI 3D son la ÚNICA cobertura del panel**: `grep lv3d scripts/test_clinico.mjs`
  da **cero**. Ver `docs/PENDIENTES.md` → «3D E2 — declarado y NO arreglado».
- ⚠️ **`firmaCanvas` de `scripts/_probe_vi3d.mjs` (tanda E1) está rota y da falsos de los dos
  signos.** Hashea 1 de cada 997 bytes —~1.037 muestras de 1.033.600, y 997 no es múltiplo de 4,
  así que va rotando de canal—. Medido: cinco lecturas seguidas sin tocar nada dieron dos valores
  distintos, y después de un clic real en el bull's eye que **sí** cambió el dibujo la firma rala
  no se movió. La aserción «bull's eye → 3D cambió el canvas» de esa tanda pasaba por suerte.
  `_probe_vi3dcolor.mjs` hashea todos los bytes; si se reusa la vieja, arreglarla primero.
- ⚠️ **El canvas del 3D tarda ~100 ms en asentarse al abrir el panel**: un repintado que mueve
  12.213 de los ~17.100 píxeles pintados, y después queda estable para siempre. Medido **igual en
  HEAD** —mismo número, mismo cuadro—, así que es el rasterizador y no una regresión. Pero ocurre
  por TIEMPO y no por cuadros: esperar «N cuadros» lo cruza unas veces sí y otras no. Esperar
  hasta que **dos firmas densas consecutivas coincidan** (`__p.asentar()` de la sonda nueva).
- Línea base medida el **2026-10-03 al cierre de la tanda «Sin apaga el botón»**: suite
  **421/422** (único rojo **TC-223**, el documentado, que falla por la fecha), **sin ningún defecto
  abierto** —TC-397 se promovió— y Semgrep **127 / 0 ERROR**. Los casos **TC-402 … TC-407** son de
  esta tanda. Los números viejos de este archivo —351/352, 408/409, 414/415— quedaron atrás: la
  suite crece en cada tanda, así que **antes de leer una tanda de mutaciones hay que volver a medir
  la línea base**, no creerle a este renglón.
- **Mitral: cerrada.** Etapas 3 y 4 (`5602597`, `57970a1`) más los cuatro estados de «valvulopatía
  consignada sin grado» (`c808e69`). Las ocho valvulopatías leves figuran en el EN SUMA y el
  fundamento de la aórtica manda sus frases cortas al resumen.
- **✅ LA AÓRTICA ENTRÓ (`23eb4e2`, `e8b03c5`).** La decisión de Maicol no fue ninguna de las dos
  salidas que `docs/PENDIENTES.md` ofrecía: el invariante es **«botón prendido = hay
  valvulopatía»**, y elegir «Sin» **apaga el botón** por los dos gestos —el menú ▼ y el desplegable
  de grado final—. Con eso el estado 3 llega al emisor con la pastilla cerrada,
  `EA_ESCALON_SIN_GRADO` pasó a `true` **sin tocar la regla de la marca** y «Aórtica 3b» quedó
  intacta. `valvGradoVisSync` es el dueño único de la visibilidad del bloque de grado
  (`abierta || discrepa || hayGrado`).
- **El escalón aórtico tiene CINCO compuertas, no tres.** Las dos últimas las encontró
  `/sharp-edges` sobre el propio diff, y las dos estaban produciendo un informe FIRMADO equivocado:
  con un **insumo fuera de banda** publicaba «EAo.» mientras el badge decía «no gradúa», y con
  **prótesis** metía un sustantivo colgado en la frase protésica. El censo está en
  `docs/mapa/valvulas.md`.
- **3D E2 — color por territorio y captura (2026-10-04).** El modo territorio lee
  `CONTR_TERRITORIO`, que **se subió a nivel de módulo** al lado de `CONTR_MOTILIDAD` porque ahora
  lo leen dos (era local de `contrDibujarBullseye`). Los cinco tonos salen de `LV3D_TONO`, medido
  por ΔE2000 y no elegido a ojo: peor vecino **8,9**, peor tono contra un fondo **12,1**. El
  borde de segmento usa **dos** grises elegidos por píxel según la luma del color ya sombreado
  (un gris único cae a 6,4 ΔE2000 de algún tono). La captura vive **sólo en memoria**, se descarta
  en `limpiarCampos` y en `cerrarSesionReal`, y **no está conectada al PDF, al PPT ni al Excel**:
  lo único que la expone es `window.lv3dCaptura()`.
  Arneses: `scripts/_probe_vi3dcolor.mjs` (**101/101**) y `scripts/_mut_vi3dcolor.py`
  (**41/45 muertas**, 4 declaradas redundantes con el motivo medido, cero sin explicar; acepta
  `--solo M27 M27b` para volver sobre una sin pagar las 45).
- Arneses temporales versionados: `scripts/_probe_sinapaga.mjs` (35 escenas por el **gesto**, más
  la pasada de maquetación a 1200/756/300 px), `scripts/_mut_sinapaga.py` (**12/12 mutaciones
  muertas**, con el aborto por md5 y la exigencia de `RESULTADO` implementados y no comentados), y
  los dos de la tanda anterior, `scripts/_probe_singrado.mjs` y `scripts/_mut_singrado.py`.
- **Dos huecos declarados de la aórtica**, medidos y NO corregidos porque son decisión de Maicol:
  «Sin» en el desplegable **no es durable** —reabrir el botón corre `calcAo` y regrada a «severa»—
  y con **prótesis** el escalón de insuficiencia calla. Están en `docs/PENDIENTES.md`.
- **Qué sigue: `docs/PENDIENTES.md`.**

## Procedencia — dónde está el origen de cada regla

Cada bloque de arriba sale de una sección del historial. Títulos exactos para `grep`:

| Bloque de este archivo | Encabezado en `docs/historial/CLAUDE_historial_2026-10-01.md` |
|---|---|
| Arquitectura, tamaño, Semgrep y sus tres formas de leer de menos | `## Arquitectura` |
| Panel de Evidencia · numeración y clase/nivel | `### Tres reglas del mecanismo` |
| Panel de Evidencia · sub-bloques de una sección | `docs/mapa/panel-evidencia.md` → `### Sub-bloques de una sección` |
| Panel de Evidencia · bibliografía por sección | `### Bibliografía POR SECCIÓN — DECISIÓN DE MAICOL, 2026-09-29 (revierte las reglas 1 y 2)` |
| «Verificada» = texto completo | `### Bibliografía de IM primaria y EM nativa — lo verificado y lo que NO (2026-09-30)` |
| Reportar y no corregir contenido clínico | `### ⚠️ TRES COSAS QUE LA FUENTE PRIMARIA DESMIENTE — REPORTADAS, NO CORREGIDAS` |
| `ecosmart` no es bibliografía; banda sin cita | `## Etapa A (tanda 3) — el panel de EM aplica` … `para el AVm por continuidad (2026-10-01)` |
| El informe firmado no lleva citas | `### Sobre agregar una línea al informe: la recomendación es NO` |
| Scripts, suite, umbral por los dos lados, mutación | `## Antes de cada push — dos scripts` · `#### Un suite que no sabe fallar no sirve` |
| Qué no tiene cobertura automática | `#### Qué queda sin cobertura` |
| Función diastólica: las dos superficies, la Figura 3 y el desfase del cuadro | `docs/mapa/diastolica.md` |
| Backticks en el cuerpo de un caso | `### ⚠️ Y EL ACENTO GRAVE ME LO COMÍ DOS VECES EN LA MISMA SESIÓN` |
| Scorer de mutaciones y el `RESULTADO` | `### ⚠️ MI PROPIO ARNÉS DE MUTACIONES TENÍA EL DENOMINADOR MAL, Y REPORTÓ 7 FALSOS «SOBREVIVIÓ»` |
| Pendrive `DISK_IMG` | `### [CERRADO 2026-09-30] Cobertura: las catorce mutaciones mueren` (salvedad del denominador) |
| `cdp.mjs` que no sale; el 200 antes del `readFile` | `## Mitral: bandas de plausibilidad en los votantes de IM (2026-09-29)` (dos trampas de instrumentación) |
| Medir con una mutación aplicada | `### ⚠️ MEDIR EN PARALELO CON UNA TANDA DE MUTACIÓN DA UNA MEDICIÓN FALSA Y PLAUSIBLE` |
| Snapshot que deshace ediciones | `### ⚠️ EL ORIGINAL INGLÉS DIO VUELTA UN HALLAZGO, Y UN REPORTE MÍO FUE FALSO (2026-09-30)` |
| Offsets de folio y la traducción española | la misma, más `### Las tres fuentes, leídas en texto completo y contra el pie impreso` y `### Páginas de la edición inglesa, que reemplazan a las de la traducción` |
| Guión de fin de línea; tablas que son imágenes | `### Dos trampas de método de esta ronda` |
| Línea base, TC-223, push bloqueado, puerto 22 | `## ⏸️ ESTADO: cierre de la mitral — tanda 3 en curso (2026-10-01)` y `CEIBO_SESSION.md` histórico |
| Estudios guardados: no se migran | `### Estudios ya guardados: NO se migró, y esto es lo que hace cada camino (medido)` |
| Round-trip de Excel | `### El round-trip de Excel está verificado — y por qué NO es tautológico` |

**Reglas que NO entraron acá y viven solo en el historial** (buscar por su título):
`## Trampas` — las ~150 trampas de API y de código de la app, una por encabezado `###`;
`## Tests de regresión`; `## Rangos de importación`; `## Deuda conocida sin resolver`;
`## LECCIONES APRENDIDAS — 14/09/2026`; `## Hallazgos de auditoría verificados como FALSOS
(2026-09-09)`. Antes de reabrir un hallazgo viejo por número de línea, mirar qué hay HOY en esa
línea: el archivo creció y un informe de auditoría viejo apunta a otro archivo
(`### Un hallazgo de auditoría por NÚMERO DE LÍNEA apunta a otro archivo`).
