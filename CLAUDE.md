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
| **Tocar un CORTE de la estenosis AÓRTICA**: las seis variables, la regla del peor, el cuadro de referencias o el cableado del AVA por planimetría | `docs/mapa/aortica-cortes.md` |
| **Tocar la función diastólica del VI**: el cuadro, la ventana 🧭 o los tres algoritmos | `docs/mapa/diastolica.md` |
| **Tocar el AVISO DE EXCLUSIONES MITRALES de la diastólica, o la disfunción sistólica del VD en el LABORATORIO**: los disparadores, la referencia por guía, la columna `DisfSist_VD` o el LARS por magnitud | `docs/mapa/exclusiones-laboratorio-vd.md` |
| **Tocar la ASE/EACVI 2016 en ritmo sinusal**: la Figura 8A, la 8B o el corte de FEVI | `docs/mapa/diastolica-ase2016.md` |
| **Tocar el S/D venoso pulmonar, el LARS, los suplementarios de la ASE 2025, el E/e′ por sitio de la ASE 2016, los rótulos del cuadro o el rojo del E/e′** | `docs/mapa/diastolica-complementarios.md` |
| **Tocar un DIAGRAMA DE FLUJO de la ventana 🧭** (BSE 2024, ASE 2025 en ritmo sinusal o en FA, ASE/EACVI 2016 8A y 8B): los planos, el motor del SVG, el umbral de ancho o la tabla compacta | `docs/mapa/diastolica-diagrama.md` |
| **Tocar la GRILLA del Doppler mitral**: el orden de los 16 campos, el Tab por columnas, los puntos de corte o el selector del S/D | `docs/mapa/doppler-mitral-grilla.md` |
| **Tocar el BORRADO de una lesión valvular**: el retiro del grado, quién prendió una pastilla, los dos métodos de la IM, la continuidad de la IT, el grado de cada fila o **la salida temprana de `calcTHP`** | `docs/mapa/valvulas-borrado.md` |
| **Tocar la PANTALLA de las dos lesiones MITRALES**: las tres columnas de la insuficiencia, las casillas automáticas, el cuadro de referencias en tres bloques, la columna 2 de la estenosis, el mecanismo de los globos ⓘ o **el aviso de fibrilación auricular de la continuidad** | `docs/mapa/valvulas-mitral-pantalla.md` |
| **Tocar la PANTALLA de las insuficiencias AÓRTICA o TRICUSPÍDEA**: sus columnas, las cinco casillas automáticas, las once tarjetas ⓘ, el rótulo THP o el color de los avisos | `docs/mapa/valvulas-ia-it-pantalla.md` |
| **Tocar un criterio de PRÓTESIS mitral o aórtica**: la Tabla 11, el AEO en tres tramos, el THP directo, el PPM de la Tabla 7, el badge del AVA aórtico, las tarjetas nativa-prótesis o el rótulo AEO | `docs/mapa/protesis-valvular.md` |
| **Buscar un CORTE o una BANDA de plausibilidad** de cualquier válvula, con su fuente | `docs/mapa/valvulas-constantes.md` |
| **Tocar la MARCA DE MANUAL de una pastilla, el selector binario de la estenosis mitral, el VIOLETA de «Significativa», el VTI de entrada tricuspídeo, la CASILLA DE PISA de «Incluir en el informe» o lo que «Nuevo estudio» deja vivo** | `docs/mapa/valvulas-manual-binario.md` |
| **Tocar el VENTRÍCULO DERECHO**: sus TRES columnas de campos, el orden del cuadro de referencias, la disfunción sistólica, la pared graduada, el Tei, la FEVD, la relación VD/VI o el Qp | `docs/mapa/vd-derecho.md` |
| **Tocar el cociente TAPSE/PSAP o el color del aviso del Tei** (el DIÁMETRO DE LA ARTERIA PULMONAR se mudó al VD en el G3) | `docs/mapa/tapse-psap-ap.md` |
| **Tocar la RELACIÓN VD/VI**: el campo numérico, el selector de tramo, las cuatro reglas que los sincronizan, la función dueña o cualquiera de sus CUATRO lectores | `docs/mapa/vd-vi-selector.md` |
| **Tocar el panel de Evidencia: agregar una cita, una sección o un sub-bloque** | `docs/mapa/panel-evidencia.md` |
| **Agregar un TÉRMINO al glosario del panel (el ⓘ con tarjeta)** | `docs/mapa/panel-evidencia-terminos.md` |
| **Tocar el CARTEL DE PÉPTIDOS del HFA-PEFF, su puntaje o el plan Básico/Avanzado**: el espejo del péptido, el ritmo que se lee, los cortes por tipo o por qué `showTab` no chequea el plan | `docs/mapa/hfapeff-peptidos.md` |
| **Tocar un CRITERIO o un CORTE del puntaje HFA-PEFF**: la tabla contra el original, las tres contradicciones del artículo, la PSAP o el operador del IMVI | `docs/mapa/hfapeff-criterios.md` |
| **Tocar los VOLÚMENES del VI en AI/VI**: el VSFVI automático, el volumen latido automático, quién lee el VSFVI, o el GASTO CARDÍACO del PDF y su frecuencia cardíaca | `docs/mapa/vi-volumenes-automaticos.md` |
| **Ver por dónde sale un dato** (informe narrativo, EN SUMA, PDF, Excel) | `docs/mapa/informe-pdf-excel.md` |
| **Tocar la IMPORTACIÓN del Excel**: el guardián de columnas, las listas de valores, los rangos, el mensaje de las columnas calculadas o la exportación JSON | `docs/mapa/importacion-excel.md` |
| **Tocar CONTRACTILIDAD**: el botón «Incluir bull's eye en PDF» y de qué depende que el bull's eye entre al papel, la fila de tres bloques, la tabla de colores o el interior del 3D del VENTRÍCULO | `docs/mapa/contractilidad-3d-vi.md` |
| **Tocar una TARJETA ⓘ de AI/VI, el REGISTRO DE EVIDENCIA o una entrada de Referencias**: las fichas, los estados, el sondeo del dueño, el gráfico de geometría | `docs/mapa/registro-evidencia.md` |
| **Tocar la AURÍCULA IZQUIERDA**: el dueño de su clasificación por volumen indexado, qué superficie clasifica y cuál sólo publica el valor; o **el COLAPSO de la VCI y el SÍMBOLO DEL SEXO en el PDF** | `docs/mapa/auricula-izquierda-pdf.md` |
| **Tocar una COLUMNA del Excel, el criterio de «derivada», la IDA Y VUELTA de un dato calculado o el mensaje del importador** | `docs/mapa/excel-origen-ida-vuelta.md` |
| **Tocar las ASOCIACIONES del Laboratorio o la TABLA DE LAS OCHO VÁLVULAS**: el cociente TAPSE/PSAP en el bloque A, el aviso de par acoplado, las dos estenosis BINARIAS y sus dos denominadores | `docs/mapa/laboratorio-asociaciones-valvulas.md` |
| **Agregar o correr un caso de prueba; A/B; mutación** | `docs/mapa/tests.md` |
| **Visor de cineloop, medición, calibración, IndexedDB** | `docs/mapa/imagenes-visor.md` |
| **Tocar la ESTENOSIS MITRAL en el LABORATORIO**: las seis categorías, las dos casillas del filtro, el gráfico de distribución, el PDF de auditoría o el PPT | `docs/mapa/laboratorio-estenosis-mitral.md` |
| **Tocar la VISTA 2D de las válvulas**: el lector único del estado, las tarjetas, la tabla de cavidades, el dibujo, los chorros o el «por qué» | `docs/mapa/vista-2d-valvulas.md` |
| **Tocar el PANEL EN LÍNEA de la vista 2D**: el botón que prende y apaga, el apagado automático, la sincronía en vivo, el alto del dibujo o la línea de fase | `docs/mapa/vista-2d-en-linea.md` |
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
⚠️ **Al 2026-10-14 hay DIEZ mapas y `diastolica.md` CRUZÓ el techo.** El de la tanda del aviso de
exclusiones y de la disfunción del VD salió a archivo propio
(`docs/mapa/exclusiones-laboratorio-vd.md`, **16,5 KB**) y lo que le entró a `diastolica.md` fue un
**puntero de siete líneas** — y aun así pasó de 34,6 a **35,2 KB**, o sea que cualquier cosa que se
le agregue ahora lo cruza. **La próxima tanda que lo toque tiene que partirlo**, igual que
`panel-evidencia.md` (35,3 KB) y `valvulas.md` (33,8 KB), que siguen esperando.
⚠️ **Al 2026-10-14, tras la tanda D2, hay DOCE mapas y `valvulas.md` VOLVIÓ a cruzar el techo —con
un PUNTERO de dieciséis líneas, de 34,5 a 35,4 KB—.** Hubo que partirlo otra vez: el bloque
«Constantes de cortes y bandas» salió a `docs/mapa/valvulas-constantes.md` (9,2 KB) y el mapa
volvió a **27,6 KB**. El de la tanda nació chico, `valvulas-ia-it-pantalla.md` (14,6 KB).
**Es la segunda vez que la regla se aplica DESPUÉS de cruzar: medir con `wc -c` ANTES de
escribir, no después.** Siguen esperando `panel-evidencia.md` (35,3 KB) y `diastolica.md` (35,2).
⚠️ **Y al 2026-10-13 hay NUEVE, porque `valvulas.md` CRUZÓ el techo y hubo que partirlo.** La tanda
de los cortes de la aórtica lo llevó a **40,8 KB**; su sección nueva salió a
`docs/mapa/aortica-cortes.md` (9,8 KB) y `valvulas.md` volvió a **32,0 KB** con un puntero de cinco
líneas. Es la primera vez que la regla se aplica **después** de cruzar el techo y no antes: conviene
medir con `wc -c` **antes** de escribir, no después.

⚠️ **Al 2026-10-15, tras el G3, `vd-derecho.md` quedó en 34,4 KB: a 600 bytes del techo.** La
sección del selector de VD/VI ya salió a archivo propio (`docs/mapa/vd-vi-selector.md`, 8,7 KB)
justamente por eso, y aun así el mapa pasó de 27,5 a 34,4. **La próxima tanda que lo toque tiene
que partirlo.** `informe-pdf-excel.md` quedó en 29,7 KB y `laboratorio-asociaciones-valvulas.md`
en 13,6. Siguen esperando `panel-evidencia.md` (35,3 KB) y `diastolica.md` (35,2).

Sin importaciones automáticas (`@archivo`): un `@` acá vuelve a desbordar la ventana.

---

## Qué es EcoSmart y cómo se trabaja

- App clínica de ecocardiografía en **un solo `index.html`**: HTML + CSS + JS inline, sin build,
  sin frameworks. Hoy **7,89 MB / 118.928 líneas**, medido el 2026-10-16 al cierre de la tanda L
  —el renglón anterior decía «7,74 MB / 116.686 líneas» y era del Y1c: **medirlo antes de
  presupuestar contexto**—. Las únicas dependencias son jsPDF, XLSX y
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

### El REGISTRO DE EVIDENCIA y las TRES tarjetas ⓘ de AI/VI — «L» (2026-10-16)

- **Son CINCO commits y la orden pedía SEIS: el L4 se OMITE**, y es la propia orden la que lo
  prevé. `hviSeveridad(idx, sexo)` **ya era** un dueño puro y reutilizable —lo llaman la cápsula
  de `calcVI` y `generarInforme`— así que no había nada que extraer; lo único que hizo falta fue
  **exportarlo**, y eso entró en L1.
  Al **empezar**, `main` y `origin/main` estaban los dos en **`a3e95bc`** (sello
  `v20261016-1605`), **sin nada sin pushear** —confirmado con un `git fetch` de verdad, con el
  `FETCH_HEAD` fechado al momento—, con los siete commits del K ya incluidos **y pusheados**. Los
  **cinco** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 1 ES LA BASE DE TODOS**: crea `EV_REG`, `evFicha`, `evFuenteLinea` y `evCortes`, y
  exporta `hviSeveridad`, `vdfviInterp` y `vsfviInterp`. Revertirlo sin revertir antes los otros
  deja las tres tarjetas llamando a funciones que no existen.
  ⚠️ **EL 3 CUELGA DEL 2** por el motor de dibujo (`_evBarra`, `_evFuentesPie`, `EV_COLOR`) y por
  el soporte de `dyn`/`ancho` en `_vInfoColocar`, que nacen en el 2; **y el 4 cuelga del 3** por
  `_evSexoCargado` y por `_evRefTabla`/`_evRefBiblio`/`_evRefBarras`, que el 3 creó.
  ⚠️ **EL 1 LLEVA LA SONDA** (`scripts/_probe_l.mjs`), con la que se verificaron los cuatro, y el
  **5** la de los dos motores (`scripts/_probe_lwk.mjs`).
  **El 5 es TC-491 más la documentación y el sello**, y afirma el comportamiento de los cuatro.
  ⚠️ **CASOS ADAPTADOS: UNO, TC-471**, dos veces la misma línea: su conteo del registro `VINFO`
  pasó de 23 a 24 (commit 2) y de 24 a **26** (commit 4). Los tres globos nuevos **no están en
  Válvulas**, igual que `tapse-psap` vive en el Doppler tricuspídeo; lo que esa condición sigue
  exigiendo es que toda clave del marcado de Válvulas tenga entrada y que no quede ninguna de
  legado.

- **Línea base al cierre: suite 501/505 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0
  ERROR, Excel en 440 columnas. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los de
  ENTRADA —**TC-223** (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**—.
  **El denominador sube a 505**: esta tanda agregó **TC-491**. El `md5` de `index.html` no se
  movió durante la corrida (`b7e67432…`, el del sello) y el pendrive estaba montado antes y
  después.
  ⚠️ **EL CHEQUEO DE CELULAR SUBE +3 HALLAZGOS Y +3 ALTA POR ANCHO, Y SON LOS TRES GLOBOS
  NUEVOS.** Pasa de **45 / 54 con 3 ALTA** a **383 a 360 px y 392 a 390 px con 6 ALTA cada uno**
  (`--todo`; la línea base del K daba 380 y 389). La causa tiene nombre y es la de siempre:
  `check_mobile.js` mide el rect del NODO **sin emular puntero grueso**, y `.vinfo-btn` mide
  16 × 12 px con el mouse y **44 × 44 con el dedo**, por su `@media (pointer: coarse)`.
  **Medido con emulación táctil: los tres pasan a 44 × 44 exactos.** Es el mismo precedente que
  el botón del «porqué» de la vista 2D y los dos marcadores del J. `PENDIENTES.md` → L-10.
  ⚠️ **Y LA COMPROBACIÓN POR `elementFromPoint` TIENE UN ARTEFACTO PROPIO:** con
  `Emulation.setDeviceMetricsOverride` puesto, el punto y el rect **no coinciden** y los tres
  globos informan «0 de 5 (centro=DIV.card)». **Sin emulación el centro devuelve el propio
  `BUTTON.vinfo-btn`.** La fila «sin emulación» del grupo `tactil` existe para distinguir el
  artefacto del defecto.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **505 ids** sobre los 506 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261016-1605`) y se volvió a sellar:
  **`v20261016-1748`**. Todo lo medido salió **DESPUÉS** de sellar, con el `md5` quieto.
- **`index.html` pasó de 7,82 MB / 117.897 líneas a 7,89 MB / 118.928 líneas.**

- **Dónde está todo:** `docs/mapa/registro-evidencia.md` (**mapa NUEVO**, 14,8 KB: el formato de
  la ficha, los tres estados, las doce fichas con su folio, el mecanismo de las tarjetas, el
  sondeo del dueño, el gráfico de geometría, Referencias y ocho trampas);
  `docs/mapa/auricula-izquierda-pdf.md` → un puntero (**24,2 KB**);
  `docs/mapa/vi-volumenes-automaticos.md` → un puntero (**11,5 KB**);
  `docs/mapa/tests-fichas.md` → la ficha de TC-491 (**25,9 KB**); `docs/fuentes/FUENTES.md` → la
  tabla de los once datos con su tabla, su folio IMPRESO y su hoja del PDF, más lo que quedó «por
  verificar» con el motivo; y `docs/PENDIENTES.md` → **diez** cosas declaradas (L-1 a L-10).
  ⚠️ **NINGÚN MAPA CRUZÓ EL TECHO, medido con `wc -c` ANTES de escribir**: los dos que esta tanda
  toca quedaban a más de 10 KB con un puntero, así que el contenido salió a archivo propio.

- **L1 · EL REGISTRO NO ES EL DUEÑO DE NINGÚN CORTE, Y ESO ES LO QUE EVITA LA SEGUNDA COPIA.**
  `EV_REG` son doce fichas de **datos puros** —pasan por `JSON.stringify` y vuelven iguales— con
  id, zona, dato, valor, **el dueño que lo decide**, guía, tabla o figura, folio impreso, hoja
  del PDF, DOI, tipo, estado, fecha y la línea de fuente. Lo que las tarjetas **dibujan** no sale
  de la ficha: `evCortes(sexo)` **SONDEA** a la función dueña barriendo su dominio, así que la
  barra y el papel firmado no se pueden desincronizar ni en un decimal.
  ⚠️ **EL DOI SE LEYÓ EN EL PIE DE LA HOJA 1 DEL PROPIO PDF** (`10.1016/j.echo.2014.10.003`): no
  hizo falta buscarlo afuera.
  ⚠️ **LA REGLA DE FOLIO NO ES «página + N» NI ES ÚNICA, Y SE COMPROBÓ EN EL PIE IMPRESO:** en el
  **cuerpo** de la ASE/EACVI 2015 el folio **coincide** con la hoja del PDF (la hoja 7 dice «Lang
  et al 7»), y en el **APÉNDICE no** —la hoja 47 lleva el folio **39.e8** y la 53 el **39.e14**—.
  **OCHO fichas quedan «verificado», DOS «parcial» y DOS «por verificar»**, y las tarjetas
  publican la línea de fuente **sólo** de las verificadas: mejor sin línea que con una fuente no
  comprobada.
  ⚠️ **NI UNA NOTA INTERNA DENTRO DE LA FICHA** —el repositorio es público—: TC-491 barre el
  vocabulario de reserva sobre cada una.
  **LO VERIFICADO COINCIDE DÍGITO POR DÍGITO con lo que la app aplica** en el volumen indexado de
  la AI (Tabla 4, folio 10), la masa indexada y su gravedad (Tabla 6 folio 17 y Tabla
  suplementaria 3 folio 39.e8), el espesor parietal relativo, los cuatro cuadrantes y los dos
  volúmenes indexados del VI.

- ⚠️ **CINCO DIFERENCIAS ENTRE LA APP Y LA GUÍA, MEDIDAS Y NO CORREGIDAS** (`PENDIENTES.md` → L-1
  a L-5): el **diámetro AP de la AI** usa 40 mm para los dos sexos donde la Tabla suplementaria 9
  da 4,0 cm en el varón y **3,8 en la mujer**; el **DDVI** usa 58 y 65 mm sin sexo; las
  **categorías de FEVI** (≥50 / 40-49 / 30-39 / <30, iguales en los dos sexos) **no son las de
  esta guía** —que corta por sexo en 52 y 54— y **no se encontró su fuente en la biblioteca**; el
  **área de la AI** (>20 cm²) tampoco está en esta guía, que dice que informar el área es
  innecesario; y en el **valor exacto del umbral de masa** la app publica «hipertrofia» **SIN
  gravedad**, porque `calcGeometriaVI` llama hipertrofia al 115 exacto mientras `hviSeveridad`
  empieza a graduar en 116. **Eso último lo destapó TC-491**, no la lectura.

- **L2 y L3 · LAS TRES TARJETAS REUSAN EL MECANISMO QUE YA EXISTÍA** (`VINFO` + `vInfoClic` +
  `#vinfo-card`, el de los veintitrés globos de Válvulas y del TAPSE/PSAP). Lo único que se
  extiende son **dos campos opcionales**: `dyn`, una función que devuelve **NODOS** —un gráfico
  no se escribe en el campo `lee`, y un SVG por `innerHTML` no hereda su espacio de nombres— y
  `ancho` propio. Las veintitrés anteriores **no se mueven un píxel**.
  **NINGUNA CATEGORÍA SE REESCRIBE:** la del volumen de la AI es el `adj` de `AI_VOL_BANDAS`
  —literalmente lo que imprime el informe—, las del diámetro, el área y la FEVI se **copian** del
  texto que su cápsula publica, y las del DDVI y los volúmenes indexados salen de `viDimCat`,
  `vdfviInterp` y `vsfviInterp`.
  ⚠️ **EL REPINTADO EN VIVO NO PUEDE IR EN `requestAnimationFrame`, Y ESTÁ MEDIDO: en Chrome sin
  ventana visible rAF NO SE DISPARA** —una sonda lo esperó 1,5 s y nunca llegó—, así que la
  tarjeta se quedaba con la categoría del gesto **anterior** mientras el campo ya tenía el valor
  nuevo, y **eso no se ve**. Va con un `setTimeout(…, 0)`, que además es una macrotarea y corre
  después del despacho del evento — que es lo que hace falta, porque el oyente va en captura y
  corre ANTES que el `oninput` del propio campo. **Y la clave viva se marca en el PROPIO NODO**
  (`data-ev-dyn`) en vez de deducirse de la variable de módulo.
  ⚠️ **EL GLOBO VA EN UNA FILA DEL CUERPO DEL ACORDEÓN Y NO DENTRO DE SU ENCABEZADO**: ese
  encabezado **es** un `<button>` con `onclick="secToggle(...)"`, y un botón dentro de otro no es
  marcado válido — el navegador lo saca del padre al parsear. `PENDIENTES.md` → L-8.
  ⚠️ **LA REGLA «SIN SEXO, SIN PUNTO» SE APLICA POR BARRA Y NO POR TARJETA:** existe porque los
  cortes dependen del sexo, así que aplicarla a una barra cuyo corte no depende de él escondería
  una información que no falta. En la **AI ninguno de los tres** depende del sexo —la Tabla 4
  imprime los mismos valores en las dos columnas— y en el **VI** el DDVI y la FEVI conservan su
  punto.
  ⚠️ **DOS DATOS NO TIENEN DUEÑO Y SUS NÚMEROS VIVEN EN UN SOLO LUGAR** (`EV_BANDAS_REF`): el
  **DSVI**, que **ninguna superficie de la app clasifica** —censado—, y la **FEVI**, cuyos cortes
  ya viven en **dos copias** y a las que esta tanda **no agregó una tercera**: dibuja con esas
  bandas, copia la categoría de la cápsula, y TC-491 las ata con teclas reales a lo que la app
  publica en cada borde.

- **L5 · EL GRÁFICO DE GEOMETRÍA VA EN UN GLOBO PROPIO, Y ES UNA MEDICIÓN.** Con sus cinco barras
  la tarjeta del VI mide hasta **488 px** y el gráfico suma **365**: a 1200 × 700 —donde el hueco
  útil arriba o abajo del globo es menor que la ventana— las dos juntas obligaban a scroll
  **interno**. Son dos globos, como la propia orden prevé.
  **SIMÉTRICO: los dos ejes van POR TRAMOS**, de modo que las dos mitades miden lo mismo; la
  consecuencia queda escrita —la distancia en píxeles **no** es proporcional a la diferencia en
  gramos—. La mitad de la hipertrofia se parte en **tres bandas de igual alto** por los cortes de
  gravedad del sexo —sondeados—, **sin rayas entre ellas**: lo único que cambia es el tono. El
  remodelado concéntrico y la geometría normal van de un solo tono, porque la gravedad que la app
  calcula es la de la **hipertrofia**.
  **Las bandas no llevan escrita ninguna palabra de gravedad: sólo color** —y el color nunca es
  lo único que informa: cada corte lleva su número **con su unidad**, la categoría va en palabras
  y el `aria-label` repite valor, categoría y cortes—.

- **REFERENCIAS gana DOS entradas**, `ref-ai` y **`ref-vi2`** —el id es `vi2` porque `ref-vi` ya
  existe y es la tarjeta de la ASE 2016, con otra fuente—. Su cuerpo **no es HTML estático**: lo
  arma `evRefPintar` desde el registro y los mismos dueños, con las dos columnas de sexo
  **siempre**, las mismas gráficas **sin el punto del paciente** y la bibliografía **por sección
  numerada desde [1]**, sólo con fichas «verificado». **Una fila cuya ficha no lo está sale sin
  corchete**, y ése es el control negativo de TC-491.
  ⚠️ **NO HAY BOTÓN «Ver referencia» Y SE DECLARA:** la orden lo pedía sólo si costaba poco, y no
  hay mecanismo para abrir la pestaña en una sección concreta. `PENDIENTES.md` → L-9.

- ⚠️ **J-1, REPRODUCIDO CON TECLAS REALES EN LOS TRES ESTILOS Y NO CORREGIDO.** Con el volumen de
  la AI medido y **sin superficie corporal**: con el volumen **y nada más**, el informe declara
  «Volumen de la aurícula izquierda de 98 ml, sin indexar…» y el **EN SUMA calla**; con un
  diámetro o un área **NORMALES**, el informe afirma **«de dimensiones normales»** y la
  declaración del volumen **desaparece**. **El EN SUMA no contradice al informe en ninguna
  escena**, que es lo que J-1 declaraba; lo que sigue abierto son esas dos cosas, las dos
  preexistentes. La tarjeta ⓘ **sí** lo dice en los dos casos, porque cada barra publica su
  propio estado — pero es pantalla, no papel. `PENDIENTES.md` → L-6.

- **A/B DEDICADO CONTRA EL ÁRBOL DE ENTRADA, con el formulario vacío y con escenario cargado: 0
  DIFERENCIAS** en informe (tres estilos), EN SUMA, los ocho grados, las ocho pastillas, la
  diastólica, el HFA-PEFF, el Laboratorio, el **Excel en 440 columnas CLAVE POR CLAVE** y el
  **PDF generado de verdad en las SEIS plantillas por tres escenas** (18 celdas, `nTextos`,
  `nFigs` y la lista de textos idénticos). **Cero campos nuevos del estudio y cero claves de
  almacenamiento.**

- **Arneses: `scripts/_probe_l.mjs`** (CDP, teclas reales, salida parcial por grupo; nueve
  grupos: `j1`, `registro`, `tarjeta`, `vivo`, `geom`, `refs`, `maqueta`, `tactil`, `captura`,
  `controles`) y **`scripts/_probe_lwk.mjs`** (Playwright, los DOS motores).
  **EN LOS DOS MOTORES, 192 celdas cada uno —seis viewports × dos temas × cinco escenas × tres
  tarjetas—: CERO errores, CERO tarjetas fuera de pantalla y CERO scroll horizontal de la
  página.** Scroll **interno** sólo en celular (390 y 360 px) y, en Chrome, a 1920 × 1080 en una
  escena: ahí lo que manda no es el alto de la tarjeta sino el **hueco** del lado donde se abre.
  **A 1200 × 700 —el viewport que la orden fija— no hay scroll interno en ninguna de las tres, en
  ninguno de los dos motores.**
  **Cobertura: TC-491**, **51 condiciones** con dos denominadores y cuatro controles negativos.
  **Verificado que sabe fallar contra el árbol de entrada en un worktree aparte: 42 de las 51 en
  rojo, y NINGUNA por excepción.**

- ⚠️ **OCHO TRAMPAS, Y SEIS DABAN FALSOS PLAUSIBLES.**
  1. **`requestAnimationFrame` NO CORRE en Chrome sin ventana visible** —1,5 s de espera y nunca
     llegó—, así que el repintado en vivo quedaba sin hacer y la tarjeta se veía perfecta con el
     número del gesto anterior.
  2. **El `clip` de `Page.captureScreenshot` va en coordenadas de PÁGINA** aunque el nodo sea
     `position:fixed`: sin sumarle el desplazamiento, el PNG salió con la botonera de la app y
     **se ve perfectamente bien**.
  3. **Y con `deviceScaleFactor: 2` ese `clip` se interpreta en píxeles de DISPOSITIVO**, así que
     el recorte cae a la mitad de la coordenada pedida. El factor va en 1 y la escala en el clip.
  4. **Los rótulos de los cortes se encimaban y lo vio la CAPTURA, no la medición**: «34 ml/m²41
     ml/m²48 ml/m²». Se escalonan en dos renglones, y la detección de choque compara **la mitad
     de cada uno** —con medio ancho solo decía «no chocan» sobre rótulos pegados—.
  5. **Los valores del selector de sexo son `M` y `F`**, no «Masculino» y «Femenino»: con el
     texto de la opción el `<select>` queda en `selectedIndex -1` y toda la corrida se mide como
     «sin sexo». La captura de la mujer salió con los cortes del varón.
  6. **El conteo de nodos hay que tomarlo justo antes del bucle**: entre medio se cambia el
     volumen de la aurícula, y eso repinta la diastólica y el HFA-PEFF, que **sí** agregan nodos.
     Informó 36 de más sobre una tarjeta que no acumula ninguno.
  7. **Hay que cerrar la tarjeta antes del bucle de veinte**: con la tarjeta abierta, cuarenta
     clics la dejan **abierta**.
  8. **`maxTouchPoints` tiene que estar entre 1 y 16 incluso al DESACTIVAR** la emulación táctil:
     con 0 el protocolo rechaza la llamada y la corrida muere antes de medir nada.
- ⚠️ **Me comí el acento grave CINCO veces**, todas en comentarios míos dentro del cuerpo de un
  caso o del template de una sonda. `scripts/check_backticks.py` dio la línea exacta cuatro, y la
  quinta —dentro del template `MONTAR` de la sonda de los dos motores, que ese script **no
  alcanza**— la dio `node --check`. **Correr los dos.**

### El ARTEFACTO DEL CHORRO, la COLUMNA de ETE, la BRÚJULA, el BOTÓN del bull's eye, la FILA DE TRES y el 3D del VI — «K» (2026-10-16)

- **Son SIETE commits.** Al **empezar**, `main` y `origin/main` estaban los dos en **`3997f57`**
  (sello `v20261016-1419`), **sin nada sin pushear** —confirmado con un `git fetch` de verdad, con
  el `FETCH_HEAD` fechado al momento—, con los cinco commits del J ya incluidos **y pusheados**.
  Los **siete** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 7 → 6 → … → 1.**
  ⚠️ **EL 1, EL 2 Y EL 3 SON DE ETE Y EL 4, EL 5 Y EL 6 DE CONTRACTILIDAD: los dos bloques NO se
  tocan entre sí.** El 1 vive en `m3dPintar`, `M3D_JET_LEN_MAX`, `_m3dJet` y `m3dChorroOrigen`; el
  2 en `#m3d-col-izq`, `m3dFilaSync` y el CSS de la fila; el 3 en `M3D_ORIENT`, `M3D_BRU`,
  `m3dXLat` y `m3dBrujula`; el 4 en `contr_be_pdf`, `contrPdfOn`/`contrPdfSync` y el gate del PDF;
  el 5 en `#lv3d-bloque-botones`, `lv3dMaquetar` y la tabla de colores retirada; el 6 en
  `#lv3d-dibujo`, `#lv3d-notas` y `_lv3dPublicar`.
  ⚠️ **PERO EL 3 CUELGA DEL 1**: `m3dBrujula` usa el `C.d` que `m3dCtx` empezó a devolver en el 1.
  Revertir el 1 primero deja la brújula dibujando con `setTransform(undefined,…)`, o sea el lienzo
  entero en blanco a partir de ese punto del pintado.
  ⚠️ **Y EL 6 CUELGA DEL 5**: su `calc(46% + 118px)` reescribe la línea de `lv3dMaquetar` que el 5
  acababa de crear, y `#lv3d-dibujo` vive dentro del bloque que el 5 ordenó. Revertir el 5 sin
  revertir antes el 6 deja la fila de tres sin su regla de ancho y el cuadro gris achicado.
  ⚠️ **EL 1 LLEVA LA SONDA** (`scripts/_probe_k.mjs`), con la que se verificaron los seis.
  **El 7 es TC-490 más la documentación y el sello**, y afirma el comportamiento de los seis:
  revertir cualquiera sin el 7 lo deja en rojo.
  ⚠️ **CASOS ADAPTADOS: NINGUNO.** `grep lv3d scripts/test_clinico.mjs` daba **cero** antes de
  TC-490 —la zona del 3D del ventrículo no tenía una sola condición en la suite— y ningún caso
  afirmaba el toggle del bull's eye, la tabla de colores ni la posición de la leyenda de ETE.

- **Línea base al cierre: suite 500/504 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0
  ERROR, Excel en 440 columnas. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los de
  ENTRADA —**TC-223** (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**—.
  **El denominador sube a 504**: esta tanda agregó **TC-490**.
  ⚠️ **EL CHEQUEO DE CELULAR DA EXACTAMENTE LO MISMO QUE LA LÍNEA BASE DEL J: 45 a 360 px y 54 a
  390 px, con 3 ALTA cada uno** (`--todo` da 380 y 389, el mismo par). **Cero hallazgos nuevos**, y
  no por suerte: lo que esta tanda agrega a la pantalla son dos bloques de maqueta y un
  `input[type=hidden]`, y lo que SACA —la tabla «Referencia de colores»— no tenía ningún control.
  Los tres ALTA siguen siendo los dos marcadores de identificación del J y el `#caso_interes`.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **504 ids** sobre los 505 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261016-1419`) y se volvió a sellar:
  **`v20261016-1605`**. Todo lo medido salió **DESPUÉS** de sellar, con el `md5` quieto
  (`3a2c377e…`).
- **`index.html` pasó de 7,80 MB / 117.585 líneas a 7,82 MB / 117.897 líneas.**

- **Dónde está todo:** `docs/mapa/mitral-3d-ete.md` → las secciones **13, 14 y 15** (de 21,9 a
  **31,2 KB**); `docs/mapa/contractilidad-3d-vi.md` (**mapa NUEVO**, 10,1 KB: el botón de
  inclusión con su defecto reproducido, la fila de tres bloques, el interior del 3D del VI y cinco
  trampas); `docs/mapa/importacion-excel.md` (**mapa NUEVO por PARTICIÓN**, 7,2 KB);
  `docs/mapa/informe-pdf-excel.md` → dos punteros (**28,7 KB**); `docs/mapa/congenitas-otros.md` →
  un puntero (**22,2 KB**); `docs/mapa/tests-fichas.md` → la ficha de TC-490 (**21,4 KB**);
  `docs/fuentes/FUENTES.md` → por qué esta tanda **no lleva ninguna cita nueva**; y
  `docs/PENDIENTES.md` → **Y3-4 marcado CERRADO** más **seis** cosas declaradas (K-1 a K-6).
  ⚠️ **`informe-pdf-excel.md` SE PARTIÓ ANTES DE ESCRIBIR, NO DESPUÉS.** Estaba en **34,6 KB**, a
  435 bytes del techo, y K1 tenía que nombrar el PDF: su bloque «Importación y reimportación»
  —6,6 KB, el más grande y el más autónomo, porque no comparte una sola función con los emisores—
  salió a archivo propio y el mapa volvió a **28,2 KB**. Es la primera vez en varias tandas que la
  regla se aplica a tiempo.

- **K0a · EL ARTEFACTO TENÍA DOS CAUSAS Y LA PRINCIPAL NO ERA EL CHORRO.** `m3dPintar` limpiaba con
  `clearRect(0, 0, M3D_W, M3D_H)` **con el transform del encuadre puesto**, así que la franja de
  arriba del lienzo —**51 px** en 340×300— no entraba en el borrado y conservaba lo pintado en
  cualquier cuadro anterior **para siempre**. La línea donde empezaba el borrado ES el borde recto
  horizontal que el médico describe, y el hueco es lo que sí se limpiaba.
  ⚠️ **CÓMO SE SUPO QUE ERA UN RESTO: 38 píxeles del chorro en la fila 0 que NO cambiaban ni al
  girar, ni al cambiar de vista, ni al acortar el chorro.** Un valor fijo bajo tres variables
  distintas no puede ser el dibujo de ese cuadro. **El defecto no viene de la demo**, que limpia su
  lienzo entero: nace con la ventana de encuadre de `m3dCtx` y creció con el `M3D_AIRE` del Y3b-2.
  Con eso, **7 de las 8 cámaras** quedan limpias; el **corte lateral** todavía dejaba 36 px sobre
  la fila 0, y entra `M3D_JET_LEN_MAX = 3.6`.
  ⚠️ **EL 3,6 SE ELIGIÓ MIDIENDO, no a ojo: es el valor MÁS GRANDE —el que menos cambia el
  dibujo— con el que el borde superior queda en CERO en las 360 orientaciones del barrido.** Con
  4,2 recortan 102 de 360; con 3,6, ninguna por arriba. Se descartó ampliar el encuadre porque
  achica el modelo entero, que es lo que el Y3b-2 había agrandado midiendo.
  **CRITERIO DE ACEPTACIÓN, declarado y medido:** cero píxeles del chorro en los cuatro bordes en
  las **8 cámaras × 4 escenas = 32 celdas**; cero en el borde **superior** en el barrido de
  **1794 orientaciones** (yaw −180..180, pitch −90..90); el chorro **conectado** a la válvula
  —píxeles a ≤8 px del origen que publica el hook `m3dChorroOrigen`— en las 32; y **control
  negativo**: la escena de estenosis sin IM no dibuja un solo píxel de chorro.
  ⚠️ **LO QUE QUEDA: 479 de 1794 orientaciones recortan el borde de ABAJO, todas con el modelo
  volcado** (pitch ≥ 45 o ≤ −75) — el mismo borde que el modelo ya tocaba en HEAD.
  `PENDIENTES.md` → **K-1**.
  ⚠️ **Y UNA FORMA QUE NO ES UN RECORTE:** en la vista del cirujano se mira a lo largo del eje del
  chorro y sus nueve rayas son **coplanares**, así que se proyectan como un segmento recto
  horizontal que cruza por encima de la válvula. Es la geometría de la demo; el chorro está entero
  y conectado. `PENDIENTES.md` → **K-2**.
  ⚠️ **EL BARRIDO SE MIDE CON `prefers-reduced-motion`**, que hace `m3dCalmo()` verdadero: sin eso
  cada punto exigiría esperar 600 ms de animación y **la matriz leída a medio camino no es la
  pedida**.

- **K0b · LA LEYENDA, EL AVISO Y LOS BOTONES BAJAN CON LA VISTA DEL CIRUJANO.** Eran hermanos de la
  fila y quedaban al fondo de la pantalla; hoy son `#m3d-col-izq`, con `flex:1 1 auto` con el panel
  cerrado y `flex:0 1 500px` —el **mismo** flex que tenía `#m3d-qx`— con el panel abierto, decidido
  por una clase con un solo dueño (`m3dFilaSync`).
  **MEDIDO, seis viewports × dos temas, A/B contra el commit anterior: con el 3D CERRADO todo es
  IDÉNTICO** —vista 500×295, leyenda y aviso en 978/1194/1656/706/328/298 px, misma `y`, mismo alto
  de página—; con el 3D abierto la leyenda y el aviso pasan a 356/500/500 px y **el alto de la
  página BAJA 102 px** a 1200, 1440 y 1920. A 768, 390 y 360 una columna en el orden del marcado,
  así que **el botón «3D» queda a mano ANTES del panel**. Cero scroll horizontal en las doce
  celdas. Medido también en **WebKit 27.2**.
  ⚠️ **LA CLASE VA EN EL MISMO CUADRO QUE EL `hidden`, no en el rAF:** el ancho de la columna es el
  estado de partida contra el que el panel anima el suyo.

- **K0c · LA BRÚJULA, CON UN DUEÑO ÚNICO DE LA ORIENTACIÓN.** `M3D_ORIENT` —`Ant`, `Post`, `Lat`,
  `Med`, `Aur`, los cinco ejes de la demo— es el dueño del **lado en que cae lo lateral**, y de ahí
  lo lee también `m3dRotulosExtra` para colocar AL y PM, que iban con dos literales.
  ⚠️ **SON DOS VOCABULARIOS Y NO SE PUEDEN UNIFICAR:** la brújula rotula **ejes** anatómicos y el
  modelo rotula **comisuras**; compartir el texto obligaría a renombrar un rótulo clínico. Lo que
  se comparte es el **signo**, que es lo único que puede contradecirse. Medido: `m3dXLat()` = −1,
  el lado de la orejuela, que es la corrección del Y3-1.
  **TRES DIFERENCIAS CON LA DEMO, las tres por el encuadre:** se dibuja en píxeles del lienzo con
  el transform neutro —el `(64, H−56)` de la demo cae FUERA de la ventana de 462×408—, radio 26 y
  letra de 10 px en vez de 34 y 12, y el rótulo de la izquierda se corre por su ancho **medido**.
  **Medido:** aparece en las ocho cámaras, un giro le cambia el hash de su esquina, y con el panel
  cerrado no hay pintado. **La del ventrículo no se tocó.**

- **K1 · EL BULL'S EYE AL PDF DEPENDE SOLO DEL BOTÓN, Y EL BOTÓN NACE APAGADO.** Los tres síntomas
  se **reprodujeron con clics reales contra HEAD** antes de tocar nada, y las escenas que cambian
  son estas:

  | escena | HEAD | hoy |
  |---|---|---|
  | botón prendido, SIN trastornos | botón ON, **PDF sin bull's eye** | **PDF con bull's eye** |
  | tras «Nuevo estudio» | botón **ON** | botón OFF |
  | página nueva con la clave vieja en `'1'` | botón **ON** | botón OFF |

  **DOS CAUSAS:** (1) el PDF exigía `localStorage === '1' && contrHayDatos()`, y por eso apagar y
  prender no lo arreglaba —lo que fallaba era el segundo término—; (2) el estado era una preferencia
  **global** que «Nuevo estudio» no borra. Hoy el estado es un campo **del estudio**
  (`contr_be_pdf`, guión BAJO) con un solo dueño, y el gate de datos sobra: existía justamente para
  tapar la fuga de esa preferencia global.
  ⚠️ **NO SE MIGRA NADA:** las rutas de restauración **vacían** un campo cuya clave no está, así que
  un estudio anterior abre y reimprime APAGADO. **Medido por el camino real** (guardar con
  `#rev-confirm`, limpiar y reimprimir): guardado prendido → el reimpreso lleva el bull's eye;
  guardado apagado → no lo lleva; y en los dos casos la pantalla vuelve a su estado.
  ⚠️ **EL PPT NO DEPENDE DE ESTO Y NO SE TOCÓ:** su diapositiva se decide por `contrHayDatos()` y no
  mira ningún toggle, como dice su propio comentario. Los otros dos toggles hermanos siguen en
  `localStorage`: `PENDIENTES.md` → **K-3**.

- **K2 · LA FILA DE TRES BLOQUES, Y LA TABLA DE COLORES SALE.** Hallazgos | botones | panel 3D, con
  `align-items:stretch` —que es lo que los hace de la misma altura— y el tercero en `display:none`
  con el 3D cerrado, así que no ocupa caja.
  ⚠️ **EL UMBRAL DE UNA COLUMNA PASA DE `< 768` A `<= 768`:** con tres bloques, a 768 px exactos la
  grilla quedaba en **123 + 210 + 311 px**.
  ⚠️ **EL OYENTE DE `resize` SALE DE `lv3dCablear`**, que corre sólo al abrir el panel: con la fila
  de tres, la maqueta importa también con el 3D cerrado.
  **ANTES DE SACAR LA TABLA SE VERIFICÓ QUIÉN LA USABA: NADIE.** El PDF arma su leyenda con
  `leyenda: CONTR_MOTILIDAD` y el PPT con `esc:CONTR_MOTILIDAD`. **Era una TERCERA copia con los
  colores escritos a mano y discrepaba del dueño: su «Normal» decía `#2a2f3f` donde
  `CONTR_MOTILIDAD[0]` es `#22C55E`.** El significado sigue en pantalla: `#contr-leyenda` publica
  los cinco nombres derivados del dueño.
  **Medido** a 1200/1440/1920 abierto: los tres bloques con la **misma altura**; con el 3D cerrado
  el panel en 0×0; a 768/390/360 una columna; cero scroll horizontal en las 24 celdas.

- **K3 · EL INTERIOR DEL 3D DEL VENTRÍCULO, REORDENADO.** Botones de punta arriba, el cuadro gris
  con los **cinco cuadros a su derecha**, la pausa con la fase, los colores con las dos casillas al
  lado y la captura. **Ningún control es nuevo.**
  ⚠️ **EL CUADRO GRIS NO SE ACHICA, Y ESO OBLIGÓ A ENSANCHAR EL PANEL.** Con la columna al lado y el
  panel en su 46 %, el canvas pasaba de **531 a 373 px** a 1440 y de **436 a 278** a 1200. El panel
  pasa a `calc(46% + 118px)` —la columna (110) más su hueco (8)— y el lienzo conserva su ancho **al
  píxel**: 531×297, 436×243 y 298×166, idénticos al árbol del inicio, en Chrome **y en WebKit**.
  Lo que se angosta es la columna de hallazgos: 151 px a 1200. `PENDIENTES.md` → **K-4**.
  **LAS NOTAS SALEN A SU PROPIO NODO** y si faltara se crea al vuelo, así que no se pierde ninguna.
  ⚠️ **SEMGREP CAZÓ LA PRIMERA VERSIÓN SOBRE CÓDIGO RECIÉN ESCRITO:** `box.innerHTML = html + n`
  daba **128** donde la línea base es 127.
  **LO QUE LA ORDEN PIDE Y NO EXISTE, declarado y NO creado: la leyenda «modelo esquemático» DE LA
  CAPTURA.** `PENDIENTES.md` → **K-5**.
  **COMPORTAMIENTO, A/B contra el árbol del inicio: IDÉNTICO** —0 cuadros con el panel cerrado, 56
  abierto (HEAD 57), 0 tras cerrar; 20 aperturas dejan 11818 nodos → 11818 y el panel cerrado; la
  sincronía con el bull's eye en los **dos** sentidos; el giro con arrastre real; y **cero** claves
  de almacenamiento y **cero** campos del estudio que nombren el 3D o la captura—.
  ⚠️ **Con la pestaña oculta la sonda cuenta 54 cuadros, y es PREEXISTENTE:** HEAD da el mismo 54.
  `PENDIENTES.md` → **K-6**.

- **A/B DEDICADO CONTRA EL ÁRBOL DEL INICIO, con el formulario vacío y con escenario cargado: 0
  DIFERENCIAS** en informe (tres estilos), EN SUMA, grados, pastillas, el Laboratorio por sus
  funciones dueñas, el **PDF del informe generado de verdad** (32 y 169 textos, idénticos) y el
  **Excel en 440 columnas CLAVE POR CLAVE** (cero faltantes, cero sobrantes, cero valores
  distintos). **El único campo nuevo del estudio es `contr_be_pdf`**, que es el autorizado.

- **Arnés: `scripts/_probe_k.mjs`** (Playwright, los DOS motores, con salida parcial por grupo; diez
  grupos: `repro`, `barrido`, `tope`, `arrastre`, `cap0`, `maqueta`, `brujula`, `be`, `tres`,
  `lv3d`, `lv3dcomp`, `controles`).
  **Cobertura: TC-490**, **51 condiciones** con cinco denominadores y cuatro controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 32 de las 51 en rojo, y NINGUNA
  por excepción.**

- ⚠️ **SEIS TRAMPAS, Y CUATRO DABAN FALSOS PLAUSIBLES.**
  1. **UN RESTO FIJO SE LEE COMO UN DIBUJO.** Los 38 píxeles de la fila 0 parecían el chorro
     recortado; lo que los delató fue que **no cambiaban con la cámara ni con el largo del chorro**.
     La primera medición del tope dio «728 de 728 orientaciones recortan con cualquier longitud»,
     que es imposible y era el resto.
  2. **SIN VOLÚMENES EL 3D DEL VENTRÍCULO NO DIBUJA** —muestra el cartel «no hay datos» y no arranca
     el bucle—, así que una sonda sin DDVI ni VDFVI informa **cero cuadros, cero cambio de hash y
     cero ciclado** al tocar un segmento, sobre un panel que funciona.
  3. **EL DETECTOR DE LA BOTONERA DE ETE BARRÍA DIVS QUE *CONTUVIERAN* EL BOTÓN**, y el primero es
     la fila entera: informaba «los botones no están en la columna» sobre un marcado correcto.
  4. **EL COLOR COMPUTADO SE LEE DEL TEMA ANTERIOR** sin una vuelta de espera tras cambiar
     `light-mode`.
  5. **LA BRÚJULA DEL VENTRÍCULO VIVE EN `lv3dPintar`, NO EN `lv3dDibujar`**, y **el PPT no nombra
     `CONTR_MOTILIDAD` en su llamada**: dos condiciones de TC-490 salían rojas sobre un árbol
     perfecto.
  6. **LAS CONDICIONES DE UN CASO VAN EN `{ extra: ex }`**, no en una cadena devuelta: el runner
     marca «el caso no declara NINGUNA condición» con el texto correcto adentro.
- ⚠️ **Me comí el acento grave TRES veces**, todas en comentarios míos dentro del template de la
  sonda o del cuerpo del caso. `scripts/check_backticks.py` dio la línea exacta las tres — y **una
  se me pasó por mandar su salida a `/dev/null`**, que es exactamente lo que este archivo prohíbe.


### La AI SIN INDEXAR, la AI en el PPT, la IDENTIFICACIÓN del paciente y la COLUMNA de frases — «J» (2026-10-16)

- **Son CINCO commits.** Al **empezar**, `main` y `origin/main` estaban los dos en **`489df34`**
  (sello `v20261016-0714`), **sin nada sin pushear** —confirmado con un `git fetch` de verdad, con
  el `FETCH_HEAD` fechado al momento—, con los seis commits del Y3b ya incluidos **y pusheados**.
  Los **cinco** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 3 Y EL 4 SE REVIERTEN SOLOS Y EN CUALQUIER ORDEN ENTRE SÍ**: el 3 vive en
  `pacIdImpreso` y su familia, el marcado de los dos marcadores, la celda de `pRows` y la portada
  del PPT; el 4 es CSS (`.inf-cols`) más el marcado del informe. Ninguno nombra una pieza del otro
  ni de los dos primeros.
  ⚠️ **PERO EL 2 CUELGA DEL 1**: `aiResumenUno` llama a `aiVolSinIndexar`, que nace en el 1.
  Revertir el 1 primero no aborta el `<script>` —el revert se lleva también su `window.*`— pero
  deja la fila de la AI del PPT tirando `ReferenceError` al generar la presentación.
  ⚠️ **EL 3 LLEVA LA SONDA PRINCIPAL** (`scripts/_probe_j.mjs`), con la que se verificaron también
  el 1 y el 2, **y el 4 lleva la de los dos motores** (`scripts/_probe_jwk.mjs`).
  ⚠️ **Y EL 3 LLEVA ADEMÁS LA CORRECCIÓN DEL TEXTO CONCISO DE J1**, que la sonda destapó después
  de cerrado el commit 1: con «AI: …» la frase quedaba fuera del patrón «AI \<algo\> (\<dato\>).»
  de las otras dos ramas de ese bloque. **Revertir el 3 revierte también esa corrección.**
  **El 5 es TC-489 más la adaptación de TC-487, la documentación y el sello**, y afirma el
  comportamiento de los cuatro: revertir cualquiera sin el 5 lo deja en rojo.
  ⚠️ **CASOS ADAPTADOS: UNO, TC-487.** Su condición **(7b)** era el **límite declarado del H**
  —«con el volumen sin indexar y NADA más, el informe cae en la rama de normalidad», escrita para
  que el día que se decidiera se notara— **y lo notó**: hoy afirma lo CONTRARIO.

- **Línea base al cierre: suite 499/503 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0
  ERROR, Excel en 440 columnas. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los
  de ENTRADA —**TC-223** (el documentado, falla por la fecha), **TC-376**, **TC-390** y
  **TC-406**— y no apareció ninguno fuera de esa lista. **El denominador sube a 503**: esta
  tanda agregó **TC-489**.
  ⚠️ **EL CHEQUEO DE CELULAR SUBE +2 HALLAZGOS Y +2 ALTAS POR ANCHO, Y SON LOS DOS
  MARCADORES.** Pasa de **43 / 52 con 1 ALTA** a **45 a 360 px y 54 a 390 px, con 3 ALTA cada
  uno** (`--todo` da 380 y 389). La causa tiene nombre: `check_mobile.js` mide el rect del
  NODO, y los dos `<button>` miden **7 × 11 px**; su área táctil real la da un `::after`
  absoluto, que el chequeo **no ve** —es el precedente que este archivo ya tiene escrito para
  el botón del «porqué» de la vista 2D—. Y la severidad es ALTA porque la excepción del
  «label envolvente» de ese script sólo alcanza a `checkbox` y `radio`.
  **NO se corrigió agrandándolos, y el motivo está medido**: el `.fg` mide 44-49 px de alto
  entre el rótulo y el campo, así que un botón de 44 × 44 **o desplaza el campo** —lo que la
  orden prohíbe expresamente— **o tapa el input**, que es peor. El área efectiva es
  **35 × 41 px** y está medida con `elementFromPoint`: **18 de 18 toques** llegan al botón a
  1200, 768 y 390 px en los dos temas. `PENDIENTES.md` → **J-8**. El `md5` de `index.html` no se movió durante la corrida
  (`be45e604…`, el del sello) y el pendrive estaba montado antes y después.
  ⚠️ **EL PENDRIVE `DISK_IMG` ESTABA AFUERA AL EMPEZAR y Maicol lo conectó a pedido**, así que la
  línea base de ENTRADA —medida en un worktree aparte sobre HEAD limpio— ya salió con él puesto:
  **498/502**, con los **CUATRO** rojos documentados (**TC-223**, **TC-376**, **TC-390** y
  **TC-406**) y ninguno fuera de esa lista.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **503 ids** sobre los 504 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261016-0714`) y se volvió a sellar:
  **`v20261016-1419`**. Todo lo medido salió **DESPUÉS** de sellar, con el `md5` quieto.
- **`index.html` pasó de 7,78 MB / 117.228 líneas a 7,80 MB / 117.585 líneas.**

- **Dónde está todo:** `docs/mapa/auricula-izquierda-pdf.md` → las secciones **9 y 10** (de 16,0 a
  **23,2 KB**); `docs/mapa/identificacion-paciente.md` (**mapa NUEVO**, 9,7 KB);
  `docs/mapa/panel-frases.md` (**mapa NUEVO**, 5,8 KB); `docs/mapa/informe-pdf-excel.md` → tres
  punteros (**34,6 KB**); `docs/mapa/tests-fichas.md` → la ficha de TC-489 (**18,2 KB**);
  `docs/fuentes/FUENTES.md` → por qué esta tanda **no lleva ninguna cita nueva**; y
  `docs/PENDIENTES.md` → **H-1 marcado CERRADO** más **siete** cosas declaradas (J-1 a J-7).
  ⚠️ **`informe-pdf-excel.md` QUEDÓ EN 34,6 KB, o sea a 435 BYTES DEL TECHO**, y eso es **sólo con
  los tres punteros**: los dos bloques nuevos salieron a archivo propio justamente por eso, medido
  con `wc -c` ANTES de escribir. **La próxima tanda que lo toque tiene que partirlo.**

- **J1 · EL VOLUMEN QUE NO SE PUEDE INDEXAR SE DECLARA, Y YA NO SE NIEGA.** Cierra **H-1** por su
  salida **(a)**. Medido en la tanda H: con `ai_vol = 98`, sin peso ni talla y sin área ni
  diámetro, el informe FIRMADO publicaba «Aurícula izquierda de dimensiones normales.» sobre una
  aurícula cuyo único dato es un volumen que, indexado, sería **severo**.
  **NINGÚN CORTE SE MOVIÓ**: `aiVolClasificar` y `AI_VOL_BANDAS` no se tocaron. Lo que faltaba era
  un dueño del **ESTADO** (`aiVolSinIndexar` + `AI_SIN_IDX_ROT`), que vivía implícito en **tres**
  `if` distintos —la cápsula, el informe y la fila del PDF— y por eso las tres publicaban cosas
  distintas del mismo paciente: raya, normalidad y fila ausente.
  **La rama nueva va DESPUÉS de `aiGeoMedido`, y eso es la mitad del arreglo**: con área o
  diámetro cargados la cascada los usa como hoy.
  **MEDIDO con teclas reales, A/B contra HEAD en 18 escenas: CAMBIAN 4.** La del volumen sin ASC
  (la frase en los tres estilos, la cápsula y el Laboratorio, que deja de leer «normal»), la del
  volumen sin ASC **con DAP dilatado** —donde **sólo cambia la cápsula**, porque el informe sigue
  usando el diámetro—, la del volumen sin ASC y nada más, y la fila `Vol. indexado` del PDF.
  ⚠️ **EL EN SUMA NO LA MENCIONA** (decisión de Maicol) y **no se llama a `ccMarcarParrafo()`**,
  a diferencia de la rama de `aiGeoFuera`: marcar cambiaría el texto GLOBAL del EN SUMA, que esta
  orden no autoriza. `PENDIENTES.md` → **J-1**.
  ⚠️ **EL RÓTULO DE LA CÁPSULA ES ASCII PURO**, porque lo imprime también la tabla del PDF, que
  se dibuja con jsPDF en WinAnsi y **no** pasa por `amiloSanPDF` —la que transliteraría un em
  dash—. Es la lección que el símbolo del sexo del H pagó saliendo como «&B».
  ⚠️ **EL PROMPT LA LLAMÓ «OPCIÓN B» Y DESCRIBIÓ LA (a)** de `PENDIENTES.md`. Manda la
  descripción; la (b) era «pedir el dato».

- **J2 · LA AI EN EL PPT PASA A UNA SOLA LÍNEA, Y LA PREMISA DE LA ORDEN ERA PARCIALMENTE FALSA.**
  El PPT no publicaba «Volumen AI» en ml y nada más: publicaba **DOS** filas —los ml y el
  indexado leído del span `ai-idx`— y **ninguna tenía fallback**: sin volumen, con el área o el
  diámetro cargados, la AI **no salía en la diapositiva por ningún camino**.
  Dueño `aiResumenUno()`. **Medido en las ocho escenas**: indexado `Vol. AI indexado 49.0 ml/m²`,
  área `Área AI 25 cm²`, diámetro `Diám. AP AI 44 mm`, sin indexar `Volumen AI 98 ml (sin
  indexar)`, sin datos `null`, y los **tres controles negativos** (área+diámetro manda el área,
  indexado+área manda el indexado, y un **área fuera de banda cae al diámetro**).
  ⚠️ **EL ÁREA Y EL DIÁMETRO SE LEEN POR SU BANDA y el volumen crudo**: acá la banda no decide
  sólo si se imprime un número, decide **cuál de los tres se publica**.
  ⚠️ **DEVUELVE VALOR Y SUFIJO POR SEPARADO** para que pasen por el `fila(arr,k,val,suf)` del
  propio PPT: el texto de la rama del indexado sale **idéntico** al de HEAD.

- **J3 · AL PAPEL VA UNO SOLO DE LOS DOS IDENTIFICADORES, Y LO ELIGE EL MÉDICO.** Antes el PDF
  imprimía el documento y nada más: la **matrícula del paciente** existía como campo, viajaba con
  el estudio y **no salía en ningún PDF ni PPT por ningún camino** —censado—.
  **TRES ESTADOS QUE NO SE MEZCLAN**: `_pacIdSesion` (memoria de la página; sobrevive a «Nuevo
  estudio» y **no** a recargar), `pac_id_print` (el formulario, que se guarda con el estudio) y lo
  que trae un estudio al abrirlo. **Un estudio viejo sin la clave usa el DOCUMENTO**, y
  `pacIdRestaurar` **escribe siempre**, con el default cuando la clave falta.
  **MEDIDO con CLICS REALES**: el default es el documento; tocar el marcador de la matrícula la
  elige y volver a tocar el del documento lo devuelve; un segundo toque en el elegido **no lo
  apaga**; «Nuevo estudio» conserva la elección; el dato elegido **vacío imprime el otro** por los
  dos lados; los dos vacíos no imprimen nada; el estudio guarda la elección en `campos`; **las dos
  rutas de reapertura usan la del ESTUDIO sin cambiar la de la sesión**; un estudio **viejo** usa
  el documento; y el **PDF reimpreso** de un estudio guardado con matrícula imprime
  «Matrícula: M-777».
  **LAS SEIS PLANTILLAS DEL PDF, con las dos elecciones**: `CI`/`Matrícula` en académico,
  `CI: `/`Matrícula: ` en clásico, moderno y elegante, y `CI N`/`Matrícula N` en la tira corrida
  de compacto y minimalista. **`nTextos` IDÉNTICO entre las dos elecciones en las seis** —o sea
  que ninguna cambió de envoltorio ni de maquetación—. Y **MIRADO** en el PNG del PDF real a
  330 dpi.
  ⚠️ **LOS MARCADORES NO LLEVAN `onclick`**, y es deliberado: la regla táctil global matchea
  **por el atributo** (`[onclick]{min-height:44px}`), así que un `onclick` ahí estira el rótulo a
  44 px y **desplaza el campo**. Es el defecto que `#ig-img-storage` ya documenta. Los cablea un
  **oyente delegado**; `min-height:0` gana **por especificidad**, sin `!important`; el área táctil
  la extiende un `::after` absoluto; y **el glifo sale del CSS**, derivado de `aria-pressed`.
  **Medido: `18 de 18` toques llegan al botón a 1200, 768 y 390 px en los dos temas, y el `.fg`
  del campo mide IGUAL que en HEAD en los seis casos.**
  ⚠️ **NADA EN `localStorage` NI EN IndexedDB**, y el **Excel sigue en 440 columnas**: el oculto
  es `input[type=hidden]` con guión BAJO, así que lo toma el recolector y **el mapa del Excel no
  lo nombra**. La exportación e importación **JSON conservan la elección por construcción**.

- **J4 · EL PANEL DE FRASES ES UNA COLUMNA ALTA, Y LA ALTURA LA DECIDE EL BLOQUE IZQUIERDO.** El
  panel **salió** de `.inf-wrap` —donde sólo podía tomar la altura del textarea del informe— y es
  hermano de `.inf-cols-izq`, que contiene las DOS tarjetas.
  **MEDIDO EN LOS DOS MOTORES** (Chrome 155 por el canal del sistema y **WebKit 27.2** de
  Playwright), seis anchos × dos temas:

  | ancho | informe cerrado → abierto | panel | `dTop`/`dBottom` |
  |---|---|---|---|
  | 1200×700 | 978 → **688** | 280 × 642 | 0 / 0 |
  | 1440×800 | 1194 → **904** | 280 × 662 | 0 / 0 |
  | 1920×1080 | 1656 → **1366** | 280 × 674 | 0 / 0 |
  | 768 / 390 / 360 | **sin cambio** | el cajón, `fixed` | n/a |

  **Con 40 frases el alto del panel NO cambia** (642/662/674 iguales) y su `scrollHeight` sube a
  3074: se desplaza **por dentro**, y **el alto de la página no se mueve**.
  **A/B contra HEAD: CERRADO es idéntico en los seis anchos**, y abierto lo único que cambia es
  que el EN SUMA pasa de todo el ancho a angostarse igual que el informe, con el panel de 250 a
  280 px. **A 768, 390 y 360 px todo idéntico, abierto y cerrado.**
  **Insertar conserva las DOS MITADES del texto** y mete la frase en el cursor; **20 aperturas
  dejan 11660 nodos → 11660** y el panel cerrado, en los dos motores.
  ⚠️ **NI UN PORCENTAJE NI UN `vh` EN LA CADENA** —la lección de WebKit del Y1c— y **WebKit de
  Playwright NO es Safari**, que se declara.

- **A/B DEDICADO CONTRA HEAD, con el formulario vacío y con escenario cargado: 0 DIFERENCIAS** en
  informe (tres estilos), EN SUMA, los ocho grados, las ocho pastillas, la diastólica, el
  HFA-PEFF, el Laboratorio y el **Excel en 440 columnas CLAVE POR CLAVE** (cero faltantes, cero
  sobrantes, cero valores distintos) en las cuatro escenas.

- **Arneses: `scripts/_probe_j.mjs`** (CDP, teclas y clics reales, el PDF generado de verdad;
  ocho grupos: `ai`, `ppt`, `identg`, `identm`, `identu`, `identp`, `identr`, `frases`,
  `controles`) y **`scripts/_probe_jwk.mjs`** (Playwright, los DOS motores, sólo J4).
  **Cobertura: TC-489**, **56 condiciones** con seis denominadores y once controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 35 de las 56 en rojo, y NINGUNA
  por excepción.**

- ⚠️ **NUEVE TRAMPAS, Y SIETE DABAN FALSOS PLAUSIBLES.**
  1. **UN GRUPO DE SONDA SIN SALIDA PARCIAL NO SE PUEDE DIAGNOSTICAR.** El primer `ident` juntó
     dieciocho escenas y doce PDF y pasó de los **65 minutos** sin escribir una línea: no había
     forma de saber si avanzaba o estaba colgada. Se partió en **cinco subgrupos**.
  2. **A 390 px LA TARJETA DEL PACIENTE ES UN ACORDEÓN QUE COLAPSA CON `overflow:hidden`**, así
     que sus hijos **conservan su rect y NO son alcanzables**. La sonda informó **cuatro veces**
     «el área táctil no llega» y un clic real que no cambiaba nada. **La condición decisiva fue
     el INPUT del campo**: con la tarjeta colapsada tampoco era alcanzable, y ese campo existe
     desde antes de esta tanda. Con el acordeón abierto: **18 de 18**.
  3. **`elementFromPoint` HAY QUE DESPEJARLO ANTES DE LEER EL RECT, no después**: al esconder el
     aviso legal la página recupera el scroll y un rect leído antes queda viejo.
  4. **`editarInforme` ABRE UN MODAL DE CONFIRMACIÓN** y no carga nada hasta que se clickea
     `#edit-ok`. Sin eso la sonda informó «al reabrir, la elección no se repone» **con los campos
     del paciente VACÍOS**: lo delató el denominador. Y el overlay quedaba puesto, así que el clic
     siguiente abortaba la escena.
  5. **LA PROMESA DE LA REIMPRESIÓN SE RESUELVE EN `doc.save()`, y la restauración vive en el
     `finally`**: sin una pausa, la sonda informó «quedó la elección del OTRO estudio pegada»
     sobre una restauración que todavía no había corrido.
  6. **EL TEXTO PREVIO QUEDA PARTIDO EN EL CURSOR al insertar una frase**, que es lo que tiene que
     pasar: buscar el previo entero dio «se perdió el texto del médico» sobre una inserción
     perfecta. Se comprueban **las dos mitades**.
  7. **EL CONCISO DE J1 QUEDÓ FUERA DEL FILTRO DE LA SONDA** por abrir con «AI: …» en vez de
     «AI …». El filtro era del lector, **pero la inconsistencia de estilo era real** y se
     corrigió.
  8. **`Page.reload` POR CDP NO DEVUELVE EL CONTEXTO EN 60 s** sobre este archivo de 8 MB. La
     condición «recargar vuelve al documento» se mide con una **página nueva** en la sonda de
     Playwright, que es el mismo hecho por el camino limpio: al arrancar, `ci`, y **cero claves de
     almacenamiento que la nombren**.
  9. **EL CHROMIUM QUE TRAE PLAYWRIGHT NO ARRANCA** —espera `chromium_headless_shell-1248` y en el
     caché está el `-1234`—. Se usa el **canal del sistema** (`channel:'chrome'`), que es además
     el Chrome con el que mide el resto de este repo. **WebKit 27.2 sí arranca.**
- ⚠️ **Me comí el acento grave CINCO veces**, todas en comentarios míos dentro del template de
  una sonda o del cuerpo del caso. `scripts/check_backticks.py` dio la línea exacta las cinco, y
  **una de ellas cortó la cadena `&&` y dejó la corrida sin arrancar**, que es por qué no se le
  manda la salida a `/dev/null`.

### El GIRO MANUAL del 3D de la mitral, el cuadro y la tabla, el WILKINS unificado y la pestaña OTROS — «Y3b + Wilkins + I» (2026-10-16)

- **Son SEIS commits.** Al **empezar**, `main` y `origin/main` estaban los dos en **`c2e14eb`**
  (sello `v20261016-0541`), **sin nada sin pushear** —confirmado con un `git fetch` de verdad, con
  el `FETCH_HEAD` fechado al momento—, con los tres commits del H ya incluidos **y pusheados**. Los
  **seis** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 6 → 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 3, EL 4 Y EL 5 SE REVIERTEN SOLOS Y EN CUALQUIER ORDEN ENTRE SÍ**, que en esta serie es
  raro y conviene decirlo: el 3 vive en `_wilkCalc`, `wilkinsScore`, `cxWilkins`, las dos marcas y
  la columna del Excel; el 4 en el bloque 13 de `generarInforme`, `pericardio_hemo` y
  `pul_consol_nota`; el 5 en `pul_derrame_lado` y la frase del derrame pleural. Ninguno nombra una
  pieza de los otros.
  ⚠️ **PERO EL 2 CUELGA DEL 1, Y POR DOS SITIOS**: su regla de CSS del lienzo **reescribe** la que
  el 1 acababa de crear (`#m3d-cv{…touch-action:none;cursor:grab;}`), y su marcado mueve el
  `<canvas>` que el 1 dejó enfocable **dentro** de `#m3d-izq`. Revertir el 1 primero deja el lienzo
  con el tamaño nuevo y sin `touch-action`, o sea con el panel grande y el arrastre muerto.
  ⚠️ **EL 1 LLEVA LA SONDA** (`scripts/_probe_y3b.mjs`), que los cinco siguientes usan.
  **El 6 es TC-488 más las dos adaptaciones, la documentación y el sello**, y afirma el
  comportamiento de los cinco: revertir cualquiera sin el 6 lo deja en rojo.
  ⚠️ **Y EL 6 ADAPTÓ DOS CASOS: TC-485 y TC-330.** El primero en tres lugares —el literal del
  tamaño del lienzo, el helper de la tabla y, sobre todo, su **límite declarado** del Y3-6, que
  decía «las dos calculadoras publican TEXTOS DISTINTOS para la banda >11» y hoy afirma lo
  CONTRARIO—. El segundo **lo destapó la SUITE COMPLETA**, no la corrida de zona: su condición
  exigía el «desfavorable» viejo de Calculadoras.

- **Línea base al cierre: suite 498/502 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 440 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base—. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los de ENTRADA —**TC-223** (el
  documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**— y no apareció ninguno fuera
  de esa lista. **El denominador sube a 502**: esta tanda agregó **TC-488**. El `md5` de
  `index.html` no se movió durante la corrida (`91684964…`, el del sello) y el pendrive estaba
  montado antes y después.
  ⚠️ **LA SUITE COMPLETA SE CORRIÓ DOS VECES, Y LA PRIMERA NO ES LA LÍNEA BASE.** Dio **497/502**
  con **CINCO** rojos, y el quinto era **TC-330**, que la corrida de zona no podía ver: ese caso no
  está en la zona del Wilkins de ETE sino en la de «Referencias y Calculadoras publican el mismo
  rótulo». Se adaptó y la segunda corrida es la que vale. **Es la séptima tanda en que la suite
  completa destapa algo que la de zona no ve.**
  ⚠️ **`--todo` del chequeo de celular da 378 a 360 px y 387 a 390 px, EL MISMO PAR QUE DEJÓ EL H**:
  los tres controles nuevos de la pestaña Otros no agregan un solo hallazgo, y no por suerte —dos de
  los tres (`pul_derrame_lado` y `pul_consol_nota`) nacen dentro de un envoltorio en `display:none`
  y sólo aparecen con el hallazgo en «Sí», y lo que está en `display:none` no tiene geometría—.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **502 ids** sobre los 503 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261016-0541`) y se volvió a sellar:
  **`v20261016-0714`**. Todo lo medido salió **DESPUÉS** de sellar, con el `md5` quieto; las dos
  adaptaciones de casos son de `scripts/test_clinico.mjs` y no tocan `index.html`.
- **`index.html` pasó de 7,75 MB / 116.843 líneas a 7,78 MB / 117.228 líneas.**

- **Dónde está todo:** `docs/mapa/mitral-3d-ete.md` → las secciones **11 y 12** (el giro con su
  tabla de tres piezas, el cuadro con su tabla de márgenes medidos, la maqueta a cinco anchos y la
  tabla de datos), de 12,6 a **21,9 KB**; `docs/mapa/wilkins-unificado.md` (**mapa NUEVO**, 8,4 KB:
  las dos implementaciones medidas en HEAD, la regla pura y sus dos lectores, los cinco estados de
  la banda, la marca y la tabla de consumidores); `docs/mapa/otros-pericardio-pulmon.md` (**mapa
  NUEVO**, 7,2 KB); `docs/mapa/congenitas-otros.md` → dos punteros (**21,8 KB**);
  `docs/mapa/informe-pdf-excel.md` → un puntero (**33,1 KB**); `docs/mapa/tests-fichas.md` → la
  ficha de TC-488 (**15,3 KB**); `docs/fuentes/FUENTES.md` → la confirmación de los cortes del
  Wilkins y las **dos ausencias** (Balik y el protocolo POCUS); y `docs/PENDIENTES.md` → **Y3-7
  marcado CERRADO** más **siete** cosas declaradas (Y3b-1 a Y3b-7).
  ⚠️ **NINGÚN MAPA CRUZÓ EL TECHO, medido con `wc -c` ANTES de escribir.** Los dos bloques nuevos
  salieron a archivo propio en vez de colgarse de `congenitas-otros.md` (20,8 KB) o de
  `informe-pdf-excel.md`, que está en **33,1 KB** y es el próximo candidato a partirse.

- **Y3b-1 · EL GIRO NO SE INVENTÓ: ES EL QUE YA EXISTE DOS VECES EN EL REPO.** La demo
  (`2b_demo_mitral_vistas_ete.html`, líneas 261-263) y el 3D de contractilidad (`lv3dCablear`) hacen
  **exactamente lo mismo**: `R = Mry(dx·0,01) · Mrx(dy·0,01) · R`, premultiplicación, sin límite de
  inclinación y sin zoom. **No hubo que aplicar la regla de «la demo manda»**: lo único que difiere
  es el umbral de «toque», y acá no existe porque el lienzo no cicla nada al tocar.
  **LO NUEVO ES EL TECLADO**: ni la demo ni el 3D de contractilidad lo tienen.
  ⚠️ **LOS OYENTES SE PONEN AL ABRIR Y SE QUITAN AL CERRAR**, y no una sola vez con una guarda de
  «ya cableado» como `lv3dCablear`. Las dos formas evitan la acumulación; ésta además deja el panel
  cerrado **sin un solo oyente de arrastre**, que es lo único que se puede MEDIR espiando
  `addEventListener`. Medido: 20 ciclos dan **100 contra 100** y terminan sin cablear.
  **MEDIDO con arrastre REAL en Chrome 155 y WebKit 27.2:** el dibujo cambia por mouse en los dos y
  por **DEDO** en Chrome, **sin desplazar la página** (`scrollY` 628 antes y después). Las flechas
  giran y no desplazan. La rueda deja el lienzo **idéntico byte por byte** y no hay un solo oyente
  de `wheel` ni de `gesture`. Panel cerrado **0** cuadros, abierto **55**, tras cerrar **0**.
  ⚠️ **EL ARRASTRE CON EL DEDO EN WEBKIT NO SE PUDO MANDAR, y se declara**: la API táctil de
  Playwright sólo expone `tap`; el arrastre va por **CDP**, que es de Chromium. **WebKit de
  Playwright no es Safari.**

- **Y3b-2 · EL CUADRO PASA DE 324×228 A 340×300, Y EL AIRE SALE DE MEDIR LA CAJA DE PÍXELES.** El
  alto sube **31,6 %** y el ancho **4,9 %**; la ventana de encuadre crece en la MISMA proporción
  (440×310 → 462×408), así que **el modelo conserva su escala**: el factor de volcado pasa de
  **0,7355** a **0,7353**. Medidas las **24 celdas** (tres grados de IM × tres vistas y cinco
  ángulos) leyendo el `alpha` del lienzo: en HEAD el margen de **arriba** era **CERO en 22 de las
  24** y hoy la vista del cirujano llega a **70 px**, desde el ventrículo a **86**, y ninguna baja
  de **9**.
  ⚠️ **EL CORTE LATERAL Y LOS CINCO ÁNGULOS SIGUEN TOCANDO EL BORDE DE ABAJO —y ya lo tocaban en
  HEAD—**, y no es algo que un marco pueda arreglar: medido con la ventana puesta en el espacio de
  dibujo COMPLETO de la demo (680×380, o sea el modelo a la mitad de escala), esas celdas siguen con
  el margen de arriba en cero. `PENDIENTES.md` → **Y3b-1**.
  ⚠️ **LO QUE TOCA LOS BORDES SON LOS RÓTULOOS, no las valvas**: los seis festones, `Ao`, `LAA` y
  las siglas se colocan con `_m3dScr` y después el barrido `spread()` los empuja fuera del modelo.

- **LA TABLA PASA A LA COLUMNA DERECHA, con una línea por dato.** Panel de 500 a **610 px**, hijos
  de 488 a **598**, columna derecha **250 px** y creciendo con su contenido. **El contenido no
  cambia**: los mismos datos, en el mismo orden, de los mismos campos, sin una conclusión.
  ⚠️ **A 1200 px LA VISTA QUIRÚRGICA BAJA DE 466 A 356 px**, porque su contenedor mide 978. Nada se
  pisa y no hay scroll; a 1440 vuelve a sus 500. `PENDIENTES.md` → **Y3b-2**.
  ⚠️ **EL BLOQUE ANGOSTO NECESITA `align-items:stretch`**: en columna el eje transversal es el
  HORIZONTAL, así que con el `flex-start` de escritorio el dibujo salía en **537 px** al lado de una
  tabla de **281** a 768 px.
  **La unidad va PEGADA cuando el símbolo lo pide**: antes la pantalla publicaba «Ángulo velo
  posterior 45 °».
  ⚠️ **«PROFUNDIDAD COAPTACIÓN» SON DOS CAMPOS DISTINTOS CON LA MISMA ETIQUETA** —`ete_prof_coapt`
  y `teer_prof_flail`—, así que **no hay «nombres que ya usa la pestaña» con los que
  distinguirlos**: lo que los distingue es el encabezado de grupo que la tabla ahora lleva.
  ⚠️ **«ÁREA PLANIMETRÍA» SÍ ES UN DATO DE LA ESTENOSIS y se mudó a «Severidad»**: es el área
  valvular por planimetría y así la consume el narrativo, junto al score de Wilkins.

- **WILKINS · UN SOLO CÁLCULO, Y LOS CORTES NO SE MOVIERON.** Había dos implementaciones del mismo
  score. **Medido en HEAD, combinación por combinación**, discrepaban en **tres** cosas: el
  **1/1/1/1** (ETE «4/16 favorable» contra «sin puntuar»), la banda **>11** («No favorable» contra
  «desfavorable») y el **parcial** (dos redacciones). Hoy las ocho combinaciones dan el mismo total
  y la misma interpretación en las dos pantallas, cada una con su formato.
  **La regla salió a `_wilkCalc(crudos, delib)`, PURA, con DOS lectores**: `wilkinsScore(src)` lee la
  pantalla y `wilkinsScoreDeCampos(campos, src)` un estudio archivado —que es lo que usa la columna
  del Excel—. Reimplementarla del lado del Excel es la trampa de la fórmula duplicada.
  ⚠️ **LAS CONSTANTES VIVEN CON `WILK_9_11`, 3.800 LÍNEAS ANTES DE LAS FUNCIONES**: `_autosaveInit`
  llama a `calcWilkins()` durante la carga y un `var` se iza con `undefined`, así que declaradas al
  lado de `wilkinsScore` el badge del arranque habría dicho «undefined».
  ⚠️ **SON DOS MARCAS Y NO UNA, declarado contra la letra de la orden**: con una sola, tocar un
  criterio del Wilkins de **ETE** habría validado el `1/1/1/1` **legado de Calculadoras** del mismo
  estudio, o sea habría fabricado ahí el veredicto que la regla viene a evitar.
  ⚠️ **LA FLECHA NO CAMBIA UN `<select>` CERRADO EN NINGUNO DE LOS DOS MOTORES** —medido: ni un
  `change`—. El gesto real que funciona es la **búsqueda por letra**, que despacha un `change` con
  `isTrusted` en **true**; y `selectOption` de Playwright lo despacha en **false**, que es el
  control negativo de que la guarda distingue el gesto del código.
  **ESCENAS QUE CAMBIAN: UNA SOLA, el 1/1/1/1 SIN marca.** Informe: pierde «Score de Wilkins 4/16».
  PDF de ETE: «4 / 16 — Favorable para valvuloplastia percutánea» pasa a «no calculado — sin
  puntuar». Excel: la columna pasa de **4** a vacío. Las otras cuatro escenas medidas salen
  IDÉNTICAS a HEAD. **No se migra ningún estudio.**
  ⚠️ **EL LABORATORIO SIGUE CONTANDO UN 1/1/1/1 LEGADO COMO UN SCORE COMPLETO DE 4**, y queda
  declarado: el Laboratorio está en los NO TOQUES. `PENDIENTES.md` → **Y3b-3**.

- **I1 · CADA TEMA, SU PROPIA ORACIÓN.** El pericardio y las masas salían en UNA entrada de `inf` y,
  en el estilo **NARRATIVO**, fundidos en **una sola oración**; los tres temas del módulo pulmonar
  básico salían pegados por un `join`. Hoy son entradas separadas en los tres estilos, con el **EN
  SUMA sin moverse**. Entran `pericardio_hemo` —un `<select>` de **TRES estados**, porque «sin
  compromiso hemodinámico» es una AFIRMACIÓN y una casilla desmarcada no distingue «lo busqué y no
  está» de «no lo busqué»— y `pul_consol_nota`, cuyo texto va **en la misma oración**, entre
  paréntesis. **Los dos campos NO existían**, censado.

- **I2 · EL DERRAME PLEURAL CON SU LADO; BALIK Y LAS LÍNEAS B, DECLARADOS.** `pul_derrame_lado`
  (derecho / izquierdo / bilateral, más «sin consignar» de fábrica) y el lado va **antes del
  tamaño**, que es donde lo pone el módulo avanzado. Sin consignar, la oración sale **idéntica** a
  la de hoy.
  ⚠️ **LA FÓRMULA DE BALIK NO ESTÁ EN LA BIBLIOTECA** —censada entera—. Lo que sí hay es el **método
  de Capper** (área de sección × longitud axial, *Current Pulmonology Reports* 2024;13:152-172, folio
  167), que es otro y pide campos que no existen. La fórmula ya estaba implementada (`ml = mm × 20`)
  y se **reusó tal cual**: no se escribió de memoria y **no se agregó entrada a `FUENTES.md`**.
  `PENDIENTES.md` → **Y3b-5**.
  ⚠️ **LAS DOS SEPARACIONES DE LÍNEAS B (≈3 mm y ≈7 mm) QUEDARON SIN HACER, por falta de FUENTE.**
  No hay ningún protocolo POCUS pulmonar en la biblioteca; lo único sobre líneas B dice «tres o más»
  y **no menciona ninguna separación en milímetros**. `PENDIENTES.md` → **Y3b-6**.

- **A/B DEDICADO CONTRA HEAD, con el formulario vacío y con escenario cargado, en los DOS motores:
  0 diferencias** en grados, pastillas, campos del estudio, **Excel en 440 columnas CLAVE POR
  CLAVE**, el **Laboratorio por sus funciones dueñas** (`_labDiastGrado`, `_labGeomCat`,
  `_labValvCounts`, `_labEmLectura`, `_labDisfSistVent`, `_labEstenSev`, `_labWilkinsResumen`) y el
  **PPT estadístico generado de verdad**. En el **PDF del informe generado de verdad** la única
  diferencia es la separación autorizada: `nTextos` sube **+1** y las líneas de abajo bajan 5,5 mm.
  ⚠️ **EL PDF DE AUDITORÍA NO SE GENERÓ, y se declara**: lo que lo alimenta son las funciones dueñas
  del Laboratorio, que salen idénticas. Y el PPT midió **21 textos** con el formulario vacío y **0**
  con el escenario cargado —idéntico en los dos árboles—, así que ese denominador es flojo.

- **Arnés: `scripts/_probe_y3b.mjs`**, A/B de solo lectura con `--file`, `--dest`, `--solo` y
  `--motor`, siete grupos (`giro`, `marco`, `tabla`, `wilk`, `otros`, `controles`, `captura`).
  Usa **Playwright** —por la misma necesidad que la sonda del Y1c: hay que medir en dos motores— y
  lo resuelve **por ruta**, diciéndolo y saliendo con código 2 si no está.
  **Cobertura: TC-488**, **53 condiciones** —contadas sobre el propio caso— con seis denominadores y
  siete controles negativos. **Verificado que sabe fallar contra HEAD en un worktree aparte: 37 de
  las 53 en rojo, y NINGUNA por excepción.**
  ⚠️ **LAS DOS CONDICIONES DE MAQUETA DECLARAN EL ANCHO EN EL QUE CORRIERON** —la suite corre a
  **756 px**, o sea una columna— porque el cuerpo de un caso no puede cambiar el ancho de la
  ventana. Es el reparto de TC-460.

- ⚠️ **SEIS TRAMPAS, Y CUATRO DABAN FALSOS PLAUSIBLES.**
  1. **`mouse.move` NO DESPLAZA EL NODO A LA VISTA**, a diferencia de `locator.click()`. El panel
     vive al fondo de la pestaña ETE, así que el puntero aterrizaba donde el lienzo no está: la
     primera corrida informó **«el arrastre no cambia el dibujo»** en los dos motores sobre un
     mecanismo que funciona.
  2. **`scrollIntoViewIfNeeded` DEJA EL NODO PEGADO AL BORDE DE ABAJO** y su centro cae fuera del
     viewport: el arrastre con el dedo informó «FUERA DEL VIEWPORT». Va con `block:'center'`.
  3. **EL DESPLAZAMIENTO SE LEE DESPUÉS DE CENTRAR EL LIENZO**: leído antes, el propio
     `scrollIntoView` de la sonda contaba como «la página bajó con el dedo» y la sonda informó un
     defecto que no existe.
  4. **EL HASH DEL LIENZO NO SIRVE PARA «VOLVIÓ AL ORIGEN»**, y lo midió la diferencia entre
     motores: el botón no repone la identidad, **interpola hasta ella con cuaterniones**, así que
     `_m3dR` queda reconstruido y no es idéntico bit a bit. En WebKit el hash coincidía y en Chrome
     no, **sobre la misma cámara**. Se compara la CAJA de píxeles con tolerancia de un píxel.
  5. **UNA SONDA QUE FILTRA LAS LÍNEAS DEL INFORME POR «derrame peric» NO VE LA ORACIÓN DEL
     PERICARDIO CON DERRAME**, que dice «Derrame moderado (10-20mm).»: la primera lectura informó
     que esa oración había desaparecido sobre un informe perfecto. El filtro era del lector.
  6. **LA TARJETA DEL WILKINS DE CALCULADORAS NACE PLEGADA Y EN OTRA PESTAÑA**: sin
     `showTab('calculadoras')` **y** `toggleCard('cx-wilkins')` sus cuatro `<select>` miden 0×0 y la
     sonda informó «el gesto no pone la marca» sobre un `<select>` que nunca se enfocó.
  ⚠️ **Y DOS DEL TAMAÑO DEL DERRAME**: `pul_derrame_tam` lleva **tilde** (`mínimo`), así que una
  escena que lo fija como `minimo` no encuentra la opción y mide el valor de fábrica.
- ⚠️ **Me comí el acento grave DOS veces**, las dos en comentarios míos: una dentro del template de
  la sonda —que `scripts/check_backticks.py` **no alcanzó**, porque estaba en el objeto `SONDA`, y
  la dio `node --check`— y otra en el cuerpo de TC-485, que el script sí dio con la línea exacta.
  **Correr los dos.**

### La AURÍCULA IZQUIERDA con un solo dueño, y las dos correcciones del PDF — «H» (2026-10-16)

- **Son TRES commits.** Al **empezar**, `main` y `origin/main` estaban los dos en **`0e75898`**
  (sello `v20261016-0433`), **sin nada sin pushear** —confirmado con un `git fetch` de verdad, con
  el `FETCH_HEAD` fechado al momento—, con los tres commits del Y1c ya incluidos **y pusheados**.
  Los **tres** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 3 → 2 → 1.**
  ⚠️ **EL 1 Y EL 2 NO SE NOMBRAN ENTRE SÍ Y SE REVIERTEN EN CUALQUIER ORDEN**, que en esta serie
  es raro y conviene decirlo: el 1 vive en `AI_VOL_BANDAS`, `aiVolClasificar`, `aiVolRotulo`, la
  cápsula `ai-interp` y el bloque 4 de `generarInforme`; el 2 en `PDF_SEXO_HUECO`, `sexoTxt`,
  `_pdfSexoFig`, `_tSexo`, los tres `splitTextToSize` del bloque del paciente y la fila del
  colapso de la VCI. Ninguno toca una pieza del otro.
  ⚠️ **PERO EL 1 LLEVA LA SONDA** (`scripts/_probe_h.mjs`), que el 2 y el 3 usan.
  **El 3 es TC-487 más la documentación y el sello**, y afirma el comportamiento de los dos:
  revertir cualquiera sin el 3 lo deja en rojo.

- **Línea base al cierre: suite 497/501 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 440 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la
  línea base—. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los de ENTRADA —**TC-223**
  (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**— y no apareció ninguno
  fuera de esa lista. **El denominador sube a 501**: esta tanda agregó **TC-487**. El `md5` de
  `index.html` no se movió durante la corrida (`e530b055…`, el del sello) y el pendrive estaba
  montado antes y después.
  ⚠️ **`--todo` del chequeo de celular da 378 a 360 px y 387 a 390 px, EL MISMO PAR QUE DEJÓ EL
  Y1c**: ni el dueño de la AI ni las dos correcciones del PDF agregan un solo hallazgo, y no por
  suerte — ninguna de las tres cosas es un control de formulario, y el símbolo del sexo **no
  existe en la pantalla**: vive sólo dentro de `generarPDFReal`.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **501 ids** sobre los 502 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261016-0433`) y se volvió a sellar:
  **`v20261016-0541`**. Todo lo medido salió **DESPUÉS** de sellar, con el `md5` quieto.
- **`index.html` pasó de 7,74 MB / 116.686 líneas a 7,75 MB / 116.843 líneas.**

- **Dónde está todo:** `docs/mapa/auricula-izquierda-pdf.md` (**mapa NUEVO por PARTICIÓN**,
  16,0 KB: las tres preguntas de la AI con sus tres dueños, la tabla de qué superficie clasifica
  y cuál sólo publica el valor, las once escenas con su frase, el colapso de la VCI, el símbolo
  dibujado con sus seis plantillas y ocho trampas); `docs/mapa/informe-pdf-excel.md` → el puntero
  (**32,2 KB**); `docs/mapa/tests-fichas.md` → la ficha de TC-487 (**13,2 KB**);
  `docs/fuentes/FUENTES.md` → `### aseCamaras2015` (la Tabla 4, folio 10, leída en texto completo);
  y `docs/PENDIENTES.md` → **ocho** cosas declaradas (H-1 a H-8).
  ⚠️ **EL MAPA SE PARTIÓ ANTES DE CRUZAR EL TECHO Y NO DESPUÉS.** `informe-pdf-excel.md` estaba
  en **30,6 KB** y esta sección lo cruzaba: medido con `wc -c` **ANTES** de escribir.

- **H1 · LA REGLA DE LA AI YA ESTABA IMPLEMENTADA; LO QUE FALTABA ERA EL DUEÑO.** El informe ya
  hacía que el volumen indexado mandara —normal aunque el diámetro AP o el área estén dilatados,
  con el indexado entre paréntesis y la discordancia declarada— desde el 2026-09-27. Lo que vivía
  **DOS veces**, con los mismos cuatro cortes escritos en los dos lados, era la clasificación: la
  cápsula `ai-interp` y la rama `if (ai_vol && bsa)` del informe. Es el defecto que este archivo
  ya pagó con la geometría del VI, y estaba a un descuido de que la pantalla dijera «Dilat. leve»
  mientras el papel firmado decía «moderadamente dilatada» del mismo número.
  **NINGÚN CORTE SE MOVIÓ**, y la fuente quedó verificada en texto completo: **ASE/EACVI 2015
  (Lang), Tabla 4, folio 10** —el pie impreso de esa página dice «10 · Lang et al», así que para
  ESE PDF **folio = página**, no página + 1—, fila «Maximum LA volume/BSA (mL/m2)»: 16-34 normal,
  35-41 leve, 42-48 moderada, >48 severa, y **las columnas de varón y mujer imprimen los MISMOS
  valores**, o sea que esta clasificación **no se separa por sexo**.
  ⚠️ **LOS RÓTULOS DE LA CÁPSULA DEJAN DE ESTAR CABLEADOS** y se derivan de las bandas: el texto
  que sale es **idéntico carácter por carácter**, medido. Y `aiNormal` sale de la **CLAVE** y no
  de comparar contra la frase del papel firmado.
  **MEDIDO con teclas reales, A/B contra HEAD en 22 escenas (16 de la AI más los 6 bordes): CERO
  diferencias** en las tres cápsulas, el indexado y la línea del informe en los tres estilos y el
  EN SUMA. Las 22 «diferencias» que informó la sonda son la clave `banda`, que es ella preguntando
  por una función que en HEAD no existe. Los seis bordes, por sus dos lados, con la BSA fijada en
  **2,00 exacta** (80 kg / 180 cm con Mosteller, que es lo que hace que los cortes se alcancen con
  enteros).

- ⚠️ **UN DEFECTO PREEXISTENTE QUE LA MEDICIÓN DESTAPÓ Y NO SE CORRIGIÓ.** Con el volumen medido,
  **SIN superficie corporal** y sin ninguna otra medición, el informe firmado publica «Aurícula
  izquierda de dimensiones normales.» sobre una aurícula cuyo único dato es un volumen que,
  indexado, sería **severo**. La orden mandaba tratarlo como «sin volumen» —que es lo que la app
  hace— **y reportarlo**, así que queda declarado: `PENDIENTES.md` → **H-1**, con tres salidas.
  TC-487 lo fija como límite declarado.

- **H2 · EL COLAPSO DE LA VCI LLEVA SU UNIDAD, Y EL PDF ERA EL ÚNICO QUE CALLABA.** El `<select>`
  guarda los tokens `>50` y `<50` y el papel los imprimía **pelados**, al lado de un diámetro que
  sí dice «mm». Censado: el informe narrativo ya escribía «colapso mayor al 50%», el PPT ya hacía
  `val + '%'` sobre estos mismos dos tokens y la propia `<option>` se rotula «>50%»; **el EN SUMA
  no nombra la VCI**. Se alinea con el MISMO formato que esas dos, no con uno nuevo, y la guarda
  va **por token**: un valor que no sea uno de los dos sale sin unidad en vez de que se le invente
  una.

- **H2 · EL SÍMBOLO DEL SEXO SE DIBUJA, Y HAY DOS MOTIVOS MEDIDOS PARA NO ESCRIBIRLO.**
  (1) `amiloSanPDF` —por donde pasa todo lo que se dibuja— tiene un `/[^\x20-\xFF]/` que **borra
  en silencio** cualquier carácter fuera de WinAnsi: un ♂ puesto como texto ni se rompe ni se ve.
  (2) Y si se lo saltea, **es peor**: medido generando un PDF con el mismo **jsPDF 2.5.1** que la
  app carga y **rasterizando la página**, el glifo sale como **«&B»** (y ♀ como «&@») y además
  **la línea ENTERA pasa a UTF-16 y se desmaqueta**, con un espacio entre cada letra. El dedazo no
  se limita al símbolo: **rompe la celda del informe firmado**. Censo de fuentes: **85**
  `setFont('helvetica')`, **11** `setFont('times')`, **CERO** `addFont` y **CERO**
  `addFileToVFS` — no hay fuente propia, y embeber una exigiría un CDN.
  Entran `_pdfSexoFig` —círculo y líneas, con el alto sacado del **cuerpo de letra vigente**, sin
  un número cableado por plantilla— y `_tSexo`, el único dibujador de una línea de celda del
  paciente: **sin hueco, o con una alineación que no sea la izquierda, se comporta exactamente
  como `doc.text`**, así que todo lo demás sale byte por byte como en HEAD.
  ⚠️ **EL HUECO ES DE ESPACIOS DUROS Y SU ANCHO SE LE DEVUELVE AL MEDIDOR, y eso NO es
  cosmético.** El texto que se mide y el que se estampa son el MISMO string —el hueco queda en
  blanco y la figura se pinta encima—, pero medido, «60 años · Masculino» **cabía JUSTO** en su
  columna: los tres duros la partían en **dos renglones** y la caja del paciente crecía **3,9 mm**
  en Clásico, Moderno y Elegante, y en **Compacto** corrían el corte de la tira y «ASC 2.00 m2» se
  pasaba al renglón siguiente. **Un símbolo no puede remaquetar el informe firmado**: los **tres**
  `splitTextToSize` de las celdas del paciente reciben el ancho del hueco.
  ⚠️ **SON SEIS PLANTILLAS DE PDF, NO TRES** —clásico, moderno, minimalista, académico, compacto y
  elegante— repartidas en **tres maquetaciones distintas** del bloque del paciente. Medir una sola
  deja cinco sin cubrir.
  **MEDIDO con el PDF generado de verdad, 3 escenas × 6 plantillas: `nTextos` IDÉNTICO a HEAD en
  las 18** —ninguna cambió de envoltorio—, la **única** línea de texto distinta en las doce con
  sexo es `: >50` → `: >50%`, y `nFigs` sube **+4** con el masculino y **+3** con el femenino.
  **CONTROL NEGATIVO: sin sexo cargado, las SEIS plantillas salen con CERO diferencias de texto y
  CERO figuras de más.** Y **MIRADO** en el PNG del PDF real a 400 dpi: «60 años · ♂ Masculino» en
  UNA línea, con el símbolo del alto del texto y separado de la palabra.
  **PDF REIMPRESO de un estudio guardado, por su camino REAL** (guardar → limpiar →
  `pdfDeInformeGuardado`): masculino «>50%» con 54 figuras, femenino «<50%» con 52, y sin sexo 42
  figuras y ninguna celda de VCI.
  ⚠️ **EL INFORME DE UN ESTUDIO GUARDADO NO SE REESCRIBE**: `informe_texto` y `en_suma` son
  `<textarea>` **con id**, viajan con el estudio y el reimpreso los repone tal cual. Lo que **sí**
  cambia en el reimpreso es la **tabla de datos**, que se arma de `campos`. **No se migra nada.**

- ⚠️ **LA CÉDULA DEL MÉDICO NO EXISTE, ASÍ QUE ESA PARTE QUEDÓ SIN HACER — y la orden lo
  preveía.** Censado: el **médico** tiene `med-matricula` / `cfg-medico-matricula` y **ninguna
  cédula**; lo que se parece son dos campos del **PACIENTE** —`ci` + `doc_tipo` (CI/DNI/CPF) y
  `matricula`, cuyo placeholder dice **«Nº mutualista»**—. La regla «si están las dos se imprime
  la cédula, salvo que prefiera la matrícula» **no es aplicable**: no hay dos datos entre los que
  elegir, y agregar una casilla de preferencia habría sido agregar un control que no gobierna
  nada. Además, la identificación que hoy se imprime en la firma va **sin rótulo**. Las tres
  salidas están en `PENDIENTES.md` → **H-2**.

- **EL LABORATORIO Y EL EXCEL CLASIFICAN POR SU CUENTA Y NO SE TOCARON** (la orden lo prohíbe).
  El Laboratorio lee la AI de **DOS** formas independientes del dato: un **regex sobre el TEXTO**
  del informe en la fila «Dilatación AI», y `_labLavi` recalculando el indexado con Mosteller para
  la fila «Vol AI elevado sin función diastólica documentada». El Excel tiene **cuatro** columnas
  de la AI y **ninguna clasifica**: son todos valores. Como esta tanda no cambia ni una letra del
  informe, **ninguno de los dos se mueve** — medido. `PENDIENTES.md` → **H-3** y **H-4**.

- **A/B DEDICADO CONTRA HEAD, con el formulario vacío y con escenario cargado (diastólica grado
  II, IM severa, EAo severa): 0 DIFERENCIAS** en informe, EN SUMA, los ocho grados, las ocho
  pastillas, la diastólica, el HFA-PEFF, el token del Laboratorio y el **Excel en 440 columnas
  CLAVE POR CLAVE**, en las cuatro escenas y en los dos commits.

- **Arnés: `scripts/_probe_h.mjs`**, A/B de solo lectura con `--file` y `--dest`, cinco grupos
  (`ai`, `bordes`, `pdf`, `reimp`, `controles`), con **teclas reales** y el PDF **generado de
  verdad** interceptando el constructor de jsPDF —se registran los `text` con su posición **y
  también** los `circle` y `line`, porque un espía que sólo mire el texto informaría «no hay
  símbolo» sobre una figura perfecta—.
  **Cobertura: TC-487**, **35 condiciones** —contadas instrumentando el propio caso para que
  publicara su `ex.length`— con tres denominadores y cinco controles negativos. **Verificado que
  sabe fallar contra HEAD en un worktree aparte: 11 de las 35 en rojo, y NINGUNA por excepción.**
  ⚠️ **ONCE DE TREINTA Y CINCO ES POCO, Y ESO ES EL PUNTO**: la regla de la AI ya estaba
  implementada, así que las condiciones que afirman la frase, el EN SUMA y la cápsula **pasan
  también en HEAD** — que es justamente lo que había que demostrar.
- ⚠️ **CASOS ADAPTADOS: NINGUNO**, y es consecuencia de que no cambió ni un texto del informe.

- ⚠️ **CINCO TRAMPAS, Y TRES DABAN FALSOS PLAUSIBLES.**
  1. **`indexOf('uricula')` NO MATCHEA «Aurícula»**, porque la í lleva tilde: **once** condiciones
     de TC-487 salieron rojas **por el filtro** y no por el árbol, sobre un informe perfecto.
  2. **No se puede buscar el glifo en el fuente para probar que NO se usa**, porque el comentario
     que explica por qué no se usa lo NOMBRA. Es la trampa de `.ip-ap-col2` que TC-476 ya pagó.
  3. **`showTab('valvulas')` corre `valvCerrarTarjetas` y cierra lo que el clic acaba de abrir**:
     llamarlo con la pestaña ya activa deshace las dos puertas de la mitral y el campo vuelve a
     medir 0×0. Se llama **sólo si la pestaña no está activa**.
  4. **`guardarInforme` devuelve `false` y NO guarda** si las severidades no están confirmadas, y
     `valvSevConfirmada` es un `let` de MÓDULO que no se puede poner a mano. Se confirma
     clickeando `#rev-confirm`, que es el gesto del médico.
  5. **`getInformes()` no devuelve el último guardado al final**: las tres escenas del reimpreso
     devolvieron el **mismo id** y las dos de abajo reimprimieron el estudio de la primera. Se
     busca por documento.
  ⚠️ **Y DOS DEL MEDIDOR:** un **`input[type=date]` no soporta `setSelectionRange`** y tira
  `InvalidStateError`, que mata la escena entera —la fecha se fija por valor **y se declara**, es
  el único campo de estas escenas donde el gesto no es una tecla real—; y **un `await` de nivel
  superior en `Runtime.evaluate`** tira «missing ) after argument list», porque la expresión se
  evalúa en una función que no es `async`.
- ⚠️ **Me comí el acento grave DOS veces**, las dos en comentarios míos dentro del template de la
  sonda. `scripts/check_backticks.py` dio la línea exacta las dos; **la segunda la vi tarde porque
  mandé su salida a `/dev/null`** y me quedé con el «ok» del script de edición. **No silenciar el
  chequeo.**

### La vista 2D de las válvulas pasa a PANEL EN LÍNEA, y los dos defectos del médico — «Y1c» (2026-10-16)

- **Son TRES commits.** Al **empezar**, `main` y `origin/main` estaban los dos en **`bfdaff6`**
  (sello `v20261016-0312`), **sin nada sin pushear** —confirmado con un `git fetch` de verdad, con
  el `FETCH_HEAD` fechado cuatro segundos antes—, con los ocho commits del Y2b y del Y3 ya
  incluidos **y pusheados**. Los **tres** commits de esta tanda quedan locales; el push lo corre
  Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 3 → 2 → 1.**
  ⚠️ **LA CADENA ES ESTRICTA Y NINGUNO SE REVIERTE SOLO.** El 1 mueve el marcado del panel dentro
  de `#tab-valvulas`, reescribe el bloque de CSS entero y cambia `v2dAbrir`/`v2dCerrar`; el 2 edita
  **esas mismas reglas** (`#v2d-grid`, `#v2d-svg`, `#v2d-fase` y la media query angosta que el 1
  acababa de reescribir), así que revertir el 1 primero deja al 2 sin el bloque que modifica. El 3
  **adaptó TC-482, TC-483 y TC-484**: revertir el 1 o el 2 sin el 3 los deja midiendo lo contrario
  de lo que afirman, y deja **TC-486** en rojo.
  ⚠️ **EL 1 LLEVA LA SONDA** (`scripts/_probe_y1c.mjs`), que el 2 y el 3 usan.

- **Línea base al cierre: suite 496/500 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 440 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la
  línea base—. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los de ENTRADA —**TC-223**
  (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**— y no apareció ninguno
  fuera de esa lista. **El denominador sube a 500**: esta tanda agregó **TC-486**. El `md5` de
  `index.html` no se movió durante la corrida (`88a39de9…`, el del sello) y el pendrive estaba
  montado antes y después.
  ⚠️ **`--todo` del chequeo de celular da 378 a 360 px y 387 a 390 px, EL MISMO PAR QUE DEJÓ EL
  Y3**: el panel en línea no agrega un solo hallazgo, y no por suerte: nace con `hidden`, y lo que
  está en `display:none` no tiene geometría — `check_mobile.js` abre pestañas y secciones, no
  paneles.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **500 ids** sobre los 501 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261016-0312`) y se volvió a sellar:
  **`v20261016-0433`**. Todo lo medido salió **DESPUÉS** de sellar, con el `md5` quieto.
- **`index.html` pasó de 7,73 MB / 116.508 líneas a 7,74 MB / 116.686 líneas.**

- **Dónde está todo:** `docs/mapa/vista-2d-en-linea.md` (**mapa NUEVO por PARTICIÓN**, 17,2 KB: lo
  que se fue por ser ventana, el botón, los dos defectos con su medición, el tamaño, las cuatro
  puertas del apagado, la sincronía en vivo, las tablas por motor y nueve trampas);
  `docs/mapa/vista-2d-valvulas.md` → el puntero, y volvió a **28,8 KB**; `docs/mapa/valvulas.md` →
  el puntero (**30,0 KB**); `docs/mapa/tests-fichas.md` → la ficha de TC-486 (**10,6 KB**);
  `docs/fuentes/FUENTES.md` → por qué esta tanda **no lleva ninguna cita nueva**; y
  `docs/PENDIENTES.md` → **Y3-2 marcado CERRADO** más **ocho** cosas declaradas (Y1c-1 a Y1c-8).
  ⚠️ **`vista-2d-valvulas.md` CRUZÓ EL TECHO Y HUBO QUE PARTIRLO.** Con la sección del Y1c adentro
  quedaba en **44,3 KB**. **Es la quinta vez que la regla se aplica DESPUÉS de cruzar: medir con
  `wc -c` ANTES de escribir, no después.**

- **EL PANEL YA NO ES UNA VENTANA, Y CON ESO SE FUE TODO LO QUE ERA DE VENTANA:** el overlay
  `position:fixed` con fondo tenue, la tarjeta `position:absolute;inset:0;margin:auto` con
  `height:max-content` y `max-height:85vh`, el `overflow:auto` del cuerpo, el botón «× Cerrar», el
  cierre al tocar fuera, el `role="dialog" aria-modal="true"` —y con él las dos piezas del bloque
  de accesibilidad que lo tomaban, la trampa de Tab y el oyente genérico de Escape— y el foco que
  entraba a la tarjeta. Hoy es una **región** con nombre accesible, dentro de `#tab-valvulas`, y
  **un solo botón** la prende y la apaga.
  ⚠️ **NADA SE CORRE DE LUGAR AL PRENDERLO**: `.v2d-pie` era el último hijo de esa pestaña, así
  que no hay nada debajo que empujar — medido.
  ⚠️ **APAGADO NO OCUPA ESPACIO, Y HACEN FALTA LAS DOS COSAS**: el atributo `hidden` y una regla de
  AUTOR con `!important`, porque el `[hidden]{display:none}` vive en la hoja del NAVEGADOR y
  cualquier regla de autor le gana. Medido: **0×0, `display:none` y CERO tabulables adentro**.

- **EL BOTÓN NO DECLARA NI UN COLOR PROPIO.** `btn-ghost` apagado es el reposo de una pestaña de
  válvula y `btn-primary` prendido es su estado **activo**; el texto es **«🫀 Ver en 2D» siempre** y
  lo que cambia es el color y `aria-pressed`. Medido en los **dos motores** y los **dos temas**,
  idéntico carácter por carácter a `#pill-insuf-mitral`: noche `rgb(30,35,51)` → `rgb(79,142,247)`,
  día `rgb(238,241,246)` → `rgb(47,111,224)`. **Control negativo:** apagado y prendido **no** son
  el mismo color. Clic, Enter y Espacio lo activan, el foco se queda en él, sin `:hover`.

- **DEFECTO DE CHROME · REPRODUCIDO, Y LA CAUSA NO ERA EL `viewBox`.** Medido en los dos motores
  sobre 120 fases: el `<svg>` da **dw=0 y dh=0** —`fitView()` se llama sólo desde `v2dSync`, no por
  cuadro—, así que el candidato que Y3-2 dejaba anotado era **correcto a medias**. Lo que se movía
  era la columna del medio de `#v2d-grid`, que era `auto` y la dimensionaba **la línea de fase**,
  cuyo techo es **218,25 px** con «contracción isovolumétrica».
  ⚠️ **LA MAGNITUD DEPENDE DE LA ESCENA Y SE DAN LAS DOS MEDIDAS**: el piso de la columna lo pone
  lo más ancho que haya en la fase corta —ahí compite el min-content de la tabla de cavidades, que
  cruza las tres columnas—, así que el recorrido medido es **63,00 px** en la escena de la sonda
  (piso 155,25; las tarjetas se mueven **31,5 px** cada una) y **87,42** en una de tabla más
  angosta (piso 130,83; **43,7 px**). Es el mismo defecto con dos números, y por eso lo que se
  arregla es la causa y no un valor.
  ⚠️ **Y SÓLO PASA EN ESCRITORIO**: a 390 px la grilla es de UNA columna y su `1fr` no depende del
  contenido — el recorrido en HEAD a ese ancho es **0,00 px** en los dos motores. Quien mida sólo
  en angosto concluye que el defecto no existe.
  **El arreglo son sus dos mitades**, porque con una sola el defecto se muda: la columna pasa a
  **240 px explícitos** —218,25 del texto más largo y 220 del lienzo, medidos— y la línea de fase a
  **un renglón de alto fijo** con `nowrap` y recorte, para que un texto más largo no envuelva y
  cambie el **alto** de la fila. El texto completo va al `title`, escrito en el **mismo guardado**
  donde `render` ya decidía si el texto cambió.
  **MEDIDO DESPUÉS: peor delta global 0,00 px** en Chrome 155 y WebKit 27.2, a 1200×700 y a 390 px,
  sobre 120 fases, para las dos columnas de tarjetas, la tabla, la nota, el botón, el panel, la
  grilla y la columna central.

- ⚠️ **DEFECTO DE SAFARI · NO REPRODUCE, Y HAY QUE DECIRLO.** WebKit **sí** estaba disponible
  (Playwright, build **27.2**) y los **ocho** viewports medidos dan números **idénticos** a Chrome
  155, con la tarjeta del Y1b en 900×550,4 y sin colapso. Lo que **sí** está medido es el
  mecanismo, y la aritmética cierra con el reporte: `#v2d-cuerpo` computaba **`flex-basis:0%`**
  —porque `flex:1` es `flex-basis:0%`—, o sea **un PORCENTAJE contra un contenedor de altura
  indefinida** (`height:max-content`), que es literalmente la hipótesis de Y3-2; un motor que lo
  resuelva a cero deja **cabecera de 53 px + dos bordes ≈ 55 px**, los «unos 60 px», con los
  rótulos asomando por el recorte de `overflow:auto`.
  **El arreglo no depende de haberlo reproducido:** se fueron `flex:1`, `overflow:auto`,
  `height:max-content`, `max-height:85vh` y `position:absolute`, y **no queda una sola altura en
  porcentaje ni en `vh`** en la cadena del panel — la regla con la que el 3D de ETE se midió bien
  en WebKit. Lo que Maicol puede probar a mano está en `PENDIENTES.md` → **Y1c-1**.

- **EL DIBUJO VUELVE A 300 px, CON ANCHO Y ALTO EXPLÍCITOS (220×300)** y 240 px en angosto. El
  `clamp(200px, calc(100vh - 520px), 320px)` del Y1b existía porque el panel tenía techo de alto;
  sin techo —hoy la que se desplaza es la **página**— el alto deja de depender de la ventana.
  ⚠️ **EL `viewBox` ES EL MISMO PARA TODO PACIENTE**, medido idéntico con el formulario vacío y con
  las cuatro cámaras dilatadas: `fitView` deforma el contorno con `cv` en cero y la dilatación sólo
  mueve los **rótulos**. Así que el dibujo se encuadra siempre en **196×300** y el
  `preserveAspectRatio` por omisión no puede recortar nada. **No se toca una curva, un chorro ni un
  cuadro de la animación.**
  ⚠️ **LA REGLA ANGOSTA DEL LIENZO TUVO QUE MUDARSE DE BLOQUE**: los dos selectores son `#v2d-svg`,
  o sea la **misma especificidad**, así que gana el último de la hoja — y el bloque angosto estaba
  ANTES. Puesta allá, la regla no ganaba y el lienzo medía 220×300 también a 390 y a 360 px. **Una
  regla que no gana se lee igual que un arreglo aplicado.** En HEAD no se notaba porque su regla
  angosta acotaba con `max-height`, que gana por cascada de **propiedad** y no por orden.

- **SE APAGA SOLO POR CUATRO PUERTAS:** `showTab` (al salir de Válvulas y al pasar a otra
  pantalla), `limpiarCampos`, `RECALC_MODULOS` —el embudo de las cinco rutas de restauración— y el
  propio botón.
  ⚠️ **LAS DOS DEL MEDIO SON UNA DIFERENCIA CON LA LETRA DE LA ORDEN, Y SE DECLARA.** La orden las
  condicionaba a «si hoy la vista se cerraba en esos casos», y medido: **no se cerraba**. Se
  agregaron igual, porque con el panel EN LÍNEA dejarlo prendido publicaría las tarjetas, la tabla
  y el dibujo del paciente **ANTERIOR** sobre un formulario en blanco, y ningún barrido genérico
  alcanza a los `<li>` que `v2dPintarTarjetas` crea ni al `<svg>`. Es la misma decisión que el
  panel 3D de ETE, dos líneas más arriba en el mismo archivo. `PENDIENTES.md` → **Y1c-8**.
  ⚠️ **`v2dVisible()` MIRA EL `hidden` DEL QUE ES DUEÑO Y NO EL `display` COMPUTADO**: al cambiar
  de pestaña, `#tab-valvulas` entero pasa a `display:none`, así que el computado diría «apagado»
  con el panel prendido y el apagado automático se quedaría sin disparar. Es la lección que
  `m3dVisible` ya pagó mirando la clase de la animación.

- **RENDIMIENTO, espiando `requestAnimationFrame` en los DOS motores: 0 cuadros con el panel
  apagado, 55 prendido, 0 con la pestaña del navegador oculta y 43 al volver.** 20 aperturas y
  cierres dejan **11877 nodos → 11877** y el panel apagado. **Nada se escribe** en el estudio ni en
  el navegador.
  **El desplazamiento al prender** va con `block:'nearest'`, que mueve **lo mínimo** —si ya se ve
  entero no mueve nada— e instantáneo con `prefers-reduced-motion`, y **no roba el foco**. Medido a
  1200×700 con la página arriba: la página baja 379 px y el panel queda en `top=66 · bottom=700`.

- ⚠️ **LA SINCRONÍA EN VIVO NO EXISTÍA, Y LA PREMISA DE LA ORDEN ERA FALSA — MEDIDO.** `v2dSync` y
  los dos pintores corrían **sólo** desde `v2dAbrir`; con la ventana flotante no se notaba porque
  tapaba la pantalla entera y no había forma de tocar un campo con la vista abierta. Con el panel
  en línea el médico ve las dos cosas a la vez, así que entra `v2dRefrescar()` colgado de un
  **oyente de documento** (`input`/`change`, en burbuja, el patrón de `emContFaAvisoSync`), que
  **sólo repinta si el estado cambió** —comparado por su JSON— y **repone las listas «Ver
  criterios» abiertas POR NOMBRE DE VÁLVULA**. Medido en los dos motores: la IM pasa de «Severa» a
  «Leve» sin reabrir, la lista abierta sigue abierta (1 → 1) y tipear en `nombre` no repinta nada.
  **Al reabrir el panel las listas siguen naciendo cerradas**, porque `v2dAbrir` no pasa por ahí.

- **A/B DEDICADO CONTRA HEAD, con el formulario vacío y con tres escenarios cargados: 0
  DIFERENCIAS** en informe (tres estilos), EN SUMA, **PDF del informe generado de verdad**, **PPT
  estadístico generado de verdad**, **PDF de auditoría generado de verdad**, Laboratorio, grados,
  pastillas, cápsulas y el **Excel en 440 columnas clave por clave**. Y un A/B propio del contenido
  del panel en **ocho escenas por dos motores**: **0 diferencias** en las tarjetas, la tabla de
  cavidades, la nota, las listas «Ver criterios», el informe, el EN SUMA, los ocho grados, la
  diastólica y el HFA-PEFF. **Escenas que cambian de veredicto: NINGUNA.**

- **Arnés: `scripts/_probe_y1c.mjs`**, A/B de solo lectura con `--file` y `--dest`, ocho grupos
  (`boton`, `panel`, `estab`, `altura`, `apagado`, `sync`, `tarjetas`, `captura`).
  ⚠️ **ES LA PRIMERA SONDA DE ESTE REPO QUE NO USA LA INFRA DE CDP**, y es por necesidad: hay que
  medir en **dos motores** y `cdp.mjs` sólo habla con Chrome. Usa **Playwright**, que manda entrada
  de confianza igual, y lo resuelve **por ruta** —si no lo encuentra lo DICE y sale con código 2 en
  vez de reventar—. `PENDIENTES.md` → **Y1c-7**.
  **Cobertura: TC-486**, **52 condiciones** con seis denominadores y cuatro controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 32 de las 52 en rojo, y NINGUNA
  por excepción.**
- ⚠️ **CASOS ADAPTADOS: TRES.** **TC-482** (el foco que entraba a la tarjeta, el botón de cerrar,
  el clic afuera y el Escape: las cuatro afirman hoy lo CONTRARIO), **TC-483** (la tarjeta flotante
  de 900 px y 85 vh, el `overflow:auto` del cuerpo, los 8 px de margen en angosto, la columna
  `auto` y el `clamp` del dibujo; más una condición NUEVA sobre la línea de fase) y **TC-484**
  (sólo el ayudante de cierre y el objetivo táctil). **TC-485 no se tocó**: no nombra la vista 2D
  ni una sola vez.

- ⚠️ **SEIS TRAMPAS, Y CUATRO DABAN FALSOS PLAUSIBLES.**
  1. **UNA REGLA RETIRADA SIGUE EN EL FUENTE SI LA NOMBRA UN COMENTARIO**, dos veces en la misma
     tanda: la condición de TC-486 que buscaba el `clamp` salía roja porque el comentario que
     explica el retiro lo nombra, y un `assert` de mi propio script de edición falló porque el
     comentario nuevo nombraba `aria-modal`. Lo que se busca es la **declaración completa**.
  2. **`newPage({viewportSize})` NO EXISTE EN PLAYWRIGHT: LA CLAVE ES `viewport`.** Con la clave
     equivocada las cuatro corridas midieron **1280×720** y las dos «ventanas» dieron idéntico.
     ⚠️ **El mismo error está en `/tmp/wk_test.mjs`, la medición de WebKit de la tanda Y3.**
  3. **EN HEAD EL BOTÓN DEL PIE SÓLO ABRE**, así que un A/B que cierre con él deja el overlay
     puesto tapando la página: la primera corrida informó **30 abortos** y «diferencias» en seis
     escenas que eran **el lado de HEAD VACÍO**. El cierre va por el control que cada árbol tiene.
  4. **`generarInforme()` SALTA A LA PESTAÑA INFORME** y sin volver el botón del pie no tiene
     geometría: **28 clics abortados** y las siete escenas con las dos columnas vacías.
  5. **UN CLIC EN UN PUNTO CUALQUIERA NO ES UN «CLIC AFUERA»**: el de (20,400) cayó sobre un botón
     del rail, `showTab` corrió y el panel se apagó — la sonda informó «el clic afuera cierra»
     sobre un cambio de pestaña. Va sobre la caja de `#v2d-ov`, comprobando con `elementFromPoint`
     que el blanco **es** el envoltorio.
  6. **UN GRADO FORZADO CON `valvSev.aplicar` SOBRE UN FORMULARIO VACÍO NO PRODUCE LISTA «Ver
     criterios»**: la primera medición de la sincronía informó «1 → 1» sobre **cero** listas.
- ⚠️ **Y `elementFromPoint` DEVUELVE `null` FUERA DEL VIEWPORT**: desde que el panel es en línea
  cae debajo del borde, y el objetivo táctil de TC-484 salía rojo con «arriba=NADA» sobre un área
  clicable perfecta. Es el mismo falso que el globo del cociente TAPSE/PSAP pagó en la tanda Z.

### El 3D de la MITRAL en ETE, las comisuras corregidas y la fila de la Vmax — «Y2b + Y3» (2026-10-16)

- **Son DOS bloques en OCHO commits.** Al **empezar**, `main` y `origin/main` estaban los dos en
  **`c2c127a`** (sello `v20261016-0125`), **sin nada sin pushear** —confirmado con un `git fetch` de
  verdad—, con los ocho commits del Y1b y del Y2 ya incluidos **y pusheados**. Los **ocho** commits
  de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 8 → 7 → … → 1.**
  ⚠️ **EL Y2b (1) NO SE TOCA CON EL Y3 (2 a 8)**: el 1 vive en `ea-det-vmax`, `EA_FILA_GRADO` y
  `V2D_PORQUE`; el Y3 en `#ete-svg-qx`, `eteQxDataURL` y el bloque `m3d*`. Ninguno nombra una pieza
  del otro, y **el 1 se revierte solo** —sólo hay que reponer el denominador de TC-479—.
  ⚠️ **EL 2 (las comisuras) TAMBIÉN SE REVIERTE SOLO**: son dos rótulos en dos copias.
  ⚠️ **DENTRO DEL Y3 LA CADENA ES ESTRICTA: 6 → 5 → 4 → 3.** El 3 crea el panel, el botón, el CSS,
  el bucle y los enganches; el 4 reemplaza su pintor provisorio por el motor de la demo y agrega el
  lector y las tarjetas; el 5 la tabla; el 6 los detalles. Revertir el 3 sin revertir antes los
  otros deja `m3dSync` llamando a `m3dTarjetas` y a `m3dTabla` sobre un panel que no existe, y
  `showTab`, `limpiarCampos` y `RECALC_MODULOS` nombrando `m3dCerrar` y `m3dBotonSync` —inocuo, los
  tres van con `typeof`— pero deja el `onchange` de `vm_morf` llamando a `m3dBotonSync()` **sin
  guarda**, y ahí un `ReferenceError` se lleva el cambio de morfología entero.
  ⚠️ **EL 7 ES UNA PARADA Y NO TOCA `index.html`**: agrega el grupo `wilkins` de la sonda, que es
  la medición que sostiene la parada.
  **El 8 es TC-485 más la documentación y el sello**, y afirma el comportamiento de los seis
  anteriores: revertir cualquiera sin el 8 lo deja en rojo.
  ⚠️ **EL 1 LLEVA LA SONDA** (`scripts/_probe_y3.mjs`), que los siete siguientes usan.

- **Línea base al cierre: suite 495/499 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 440 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDENTICO a la
  línea base—. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los
  de ENTRADA —**TC-223** (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**—
  y no apareció ninguno fuera de esa lista. **El denominador sube a 499**: esta tanda agregó
  **TC-485**. El `md5` de `index.html` no se movió durante la corrida (`34379177…`, el del sello) y
  el pendrive estaba montado antes y después.
  ⚠️ **`--todo` del chequeo de celular da 378 a 360 px y 387 a 390 px, EL MISMO PAR QUE DEJÓ
  EL Y2**: ni el botón «3D», ni los ocho controles de cámara, ni la fila nueva de la Vmax agregan
  un solo hallazgo. Los controles del panel no son controles de formulario, y el panel nace
  cerrado: lo que está en `display:none` no tiene geometría.
  ⚠️ **TC-484 SE SUMA A LOS INESTABLES POR ORDEN DE CORRIDA**, al lado de TC-137, TC-246, TC-249,
  TC-252, TC-260, TC-395 y TC-GR-06. Su condición del objetivo táctil usa `elementFromPoint`, que
  devuelve el **overlay del aviso legal** cuando éste reaparece a mitad de corrida: el síntoma es
  `arriba=DIV`. Medido: rojo una vez en una lista de 15 casos, **verde dos veces seguidas** con la
  misma lista y el mismo árbol, y **15/15 contra HEAD** con esa misma lista. **Repetir antes de
  sospechar.**
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **499 ids** sobre los 500 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261016-0125`) y se volvió a sellar:
  **`v20261016-0312`**. Todo lo medido salió **DESPUÉS** de sellar, con el `md5` quieto.
- **`index.html` pasó de 7,66 MB / 115.387 líneas a 7,73 MB / 116.508 líneas.**

- **Dónde está todo:** `docs/mapa/mitral-3d-ete.md` (**mapa NUEVO**, 12,6 KB: las piezas por
  nombre, la tabla de de dónde sale cada dato, las vistas y los ángulos, las comisuras con su
  folio, la maqueta, el rendimiento, la tabla y ocho trampas); `docs/mapa/aortica-cortes.md` → la
  fila de la Vmax (**27,4 KB**); `docs/mapa/vista-2d-valvulas.md` → el puntero (**27,6 KB**);
  `docs/fuentes/FUENTES.md` → `### eteQuirurgica2020`; y `docs/PENDIENTES.md` → **siete** cosas
  declaradas (Y3-1 a Y3-7).
  ⚠️ **`docs/mapa/tests.md` CRUZÓ EL TECHO Y HUBO QUE PARTIRLO.** Con la ficha de TC-485 quedó en
  **35,2 KB**: las fichas POR TANDA salieron a `docs/mapa/tests-fichas.md` (7,0 KB) y el mecanismo
  se quedó en `tests.md`, que volvió a **29,2 KB**. **Es la cuarta vez que la regla se aplica
  DESPUÉS de cruzar: medir con `wc -c` ANTES de escribir, no después.**

- **Y2b · LA VELOCIDAD PICO ERA EL ÚLTIMO CRITERIO QUE GRADUABA SIN TENER FILA**, o sea el criterio
  que DECIDÍA era el único invisible: el renglón podía decir «Severa — por velocidad» y la lista no
  tener esa fila. Es la mitad de **F8** que el AVA por planimetría dejó abierta en el Z.
  **NINGÚN CORTE NUEVO:** el valor es el mismo `vmax` que `_eaDetCuentaPura` ya elegía y el grado es
  `gVel`, que `_eaBadgeAuto` ya publicaba con estas mismas palabras. `EA_FILA_GRADO` pasa de cinco
  entradas a seis. **Medido por los OCHO bordes de la banda**; con 2,49 / 2,50 / 2,51 la fila queda
  **sin grado** —es `'sin'`, y «sin estenosis» no se imprime como grado de una fila—.
  **CONTROL NEGATIVO:** con la Vmax moderada y el gradiente severo la fila dice «moderada» y el
  renglón sigue diciendo «por gradiente».

- **Y3-1 · LAS COMISURAS ESTABAN INVERTIDAS, Y LA FUENTE LO DICE CON TODAS LAS LETRAS.** ASE/SCA/STS
  2020, Nicoara et al, JASE 33(6), **folio 695**: el tabique interauricular queda junto a la
  comisura MEDIAL y la orejuela junto a la LATERAL. En ese dibujo la orejuela está en `x=68` y A1/P1
  en `x≈130`, los dos a la izquierda, y el rótulo de ese lado decía **PM**.
  ⚠️ **LA REGLA DE FOLIO DE ESE DOCUMENTO NO ES «página + 1»: es página del PDF + 691**, comprobado
  en el pie impreso de tres páginas. Con el «+1» la cita habría apuntado a otro artículo.
  ⚠️ **Y EL TEXTO NO SALE CON `pdftotext`** —devuelve 0 bytes en los cuatro PDF de `14- ETE`—: se
  leyó con `pymupdf`.
  **SON DOS COPIAS:** el SVG de pantalla y `eteQxDataURL`, la que viaja al PDF. Arreglar una sola
  publicaría una nomenclatura en pantalla y la contraria en el papel firmado.
  **Medido: los rótulos por COORDENADA pasan de «PM@20 | AL@510» a «AL@20 | PM@510», los SEIS
  festones salen con su `d` IDÉNTICO y la orejuela sigue en `68,156`.** Y **mirado** en el PNG real
  del canvas, recortado a los dos lados.
  ⚠️ **LA PROYECCIÓN TRANSGÁSTRICA NO SE TOCÓ**: su par ya era coherente (AL junto a A1/P1). Si esa
  vista entera debería ir espejada es otra pregunta, sobre el dibujo y no sobre los rótulos.

- **Y3 · EL 3D NO CALCULA NADA: `m3dEstado()` LLAMA A `v2dEstado()`.** Le agrega lo que vive en ETE
  —los seis festones, la vena contracta, el área y el diámetro anular y el trombo— y nada más. Por
  eso **el grado del 3D ES el de la vista 2D, que a su vez ES el del informe**. Medido en seis
  escenas: el texto de la tarjeta coincide carácter por carácter con la de la vista 2D.
  ⚠️ **EL CHIP REUSA LA CLASE `v2d-chip`**, no copia sus cuatro colores: medido antes de arreglarlo,
  con una clase propia el chip salía **transparente**. Hoy los cuatro colores son idénticos.
  ⚠️ **EL ÁREA SE LE PIDE A `emCategoria()`**: la PEOR de las fuentes que esa función dejó votar. No
  se eligen fuentes acá ni se aplica ningún corte.
  ⚠️ **EL TAMAÑO DEL CHORRO SALE DEL GRADO PUBLICADO** y el CUELLO de la vena contracta MEDIDA
  cuando la hay; la descripción de texto **dice cuál de las dos se usó**. Sin grado no hay chorro.
  ⚠️ **LA AURÍCULA SE AGRANDA CON LA CATEGORÍA QUE LA APP YA PUBLICA**, y no con el grado, que es
  como lo hacía la demo: usar el grado dibujaría una aurícula que contradice la fila de al lado.

- **LA DEMO NO TRAÍA NINGUNA DEPENDENCIA NI ALMACENAMIENTO, así que no hubo PARADA.**
  `2b_demo_mitral_vistas_ete.html` (26 KB, 267 líneas, 2026-10-05; el único con «mitral_vistas_ete»
  en el nombre) es **canvas 2D** con un proyector propio: **sin WebGL**, sin CDN, sin fuentes
  externas, sin `localStorage` ni IndexedDB. Se conservó su geometría sin tocarle un número y se
  sacaron sus ocho controles propios. **El archivo queda sin versionar**, como estaba.
  ⚠️ **LAS VISTAS Y LOS ÁNGULOS CONVIVEN SIENDO EXCLUYENTES**, que es como lo resuelve la demo: su
  botón de vista llama a `clearTee()` y el de ángulo deja la vista sin marcar. Componerlos obligaría
  a inventar qué significa «vista del cirujano a 60 grados», que la demo no define.

- ⚠️ **ALTURAS EXPLÍCITAS EN PX Y NI UN PORCENTAJE, por dos defectos MEDIDOS en la vista 2D del Y1b
  que esta tanda NO toca pero no repite**: en **Safari** esa tarjeta se ve colapsada a unos 60 px, y
  en **Chrome** sus carteles laterales e inferiores **se mueven con el latido**. Con el lienzo en
  `324×228` fijos, lo que el dibujo haga adentro no puede mover nada de afuera. Los dos quedan en
  `PENDIENTES.md` → **Y3-2**, con el candidato a mirar primero.
  ⚠️ **Y LA TRANSICIÓN VA SOBRE EL ANCHO DEL PANEL, no sobre columnas de grid**:
  `grid-template-columns` se anima recién en Safari 16+ y el médico usa Safari.

- **VERIFICADO EN WEBKIT, el motor de Safari** (Playwright instalado para esto): a 1200×700 la vista
  quirúrgica pasa de `x=470` a `x=214`, el panel mide 500×375 a `x=749` —sin pisarse—, **el lienzo
  mide 324×228 exactos, o sea no colapsa**, el dibujo pinta **14.272 píxeles** y no hay scroll
  horizontal.
  ⚠️ **Y ESA MEDICIÓN DESTAPÓ UN DEFECTO QUE CHROME NO MOSTRABA: el botón «3D» no aparecía en una
  CARGA LIMPIA.** Nace con `hidden` y lo enciende `m3dBotonSync`, que corre desde `RECALC_MODULOS` y
  desde `limpiarCampos` — **ninguna de las dos ocurre al abrir la app**, que es como el médico la usa
  cada mañana. En Chrome no se veía porque la sonda llama a `limpiarCampos` en cada escena. Se cerró
  con una llamada al arranque; hoy mide **67×44** en WebKit sin tocar «Nuevo estudio».

- **RENDIMIENTO, espiando `requestAnimationFrame`: 0 cuadros con el panel cerrado, 54 en 900 ms
  abierto, 0 en PAUSA y 0 tras cerrar.** 20 aperturas y cierres dejan **11725 nodos → 11725** y el
  panel CERRADO. Densidad de píxeles acotada a 2.

- ⚠️ **CUATRO DEFECTOS QUE ENCONTRÓ LA MEDICIÓN Y NO LA LECTURA:**
  1. **EL `[hidden]` NO ESCONDÍA NI EL BOTÓN NI EL CARTEL DE PLAN B.** `[hidden]{display:none}` vive
     en la hoja del NAVEGADOR y cualquier regla de AUTOR le gana: `.btn{display:inline-flex}` dejaba
     el botón midiendo **64×44 y VISIBLE** con `hidden` puesto —o sea la compuerta de la prótesis no
     servía de nada— y el `display:flex` del cartel publicaba «3D no disponible» **encima de un
     dibujo que se dibujaba bien**. Lo vio la GEOMETRÍA y el PNG; preguntar por la propiedad `hidden`
     las habría dado por buenas, que es como **TC-274 pasó en verde** sobre este mismo defecto.
  2. **`m3dVisible()` MIRABA LA CLASE DE LA ANIMACIÓN**, que se agrega en el cuadro siguiente: veinte
     pares de clics terminaban con el panel ABIERTO. Y el callback de ese `requestAnimationFrame`
     necesitaba su propia guarda, o le agregaba la clase a un panel ya cerrado.
  3. **EN PAUSA EL BUCLE SEGUÍA GIRANDO EN VACÍO** — 54 cuadros repintando un dibujo que no cambia.
  4. **CON EL FORMULARIO VACÍO LA TABLA APARECÍA IGUAL**, con una fila que decía «Válvula | Nativa»:
     afirmando que algo se midió sobre una válvula que nadie tocó. «Nativa» no es un dato.

- ⚠️ **PARADA Y3-6: LAS DOS CALCULADORAS DEL WILKINS NO SE UNIFICARON.** Los cortes son idénticos
  (≤8 / 9-11 / >11) y `calcWilkins` ya consume `wilkinsScore()`; lo que NO coincide es lo que cada
  pantalla publica. **Discrepan en DOS textos** —«No favorable» contra «desfavorable» para la banda
  >11, y el texto del parcial— **y en el DOMINIO del centinela**: con los cuatro criterios en «1»,
  ETE publica «4/16, favorable para valvuloplastia percutánea» y Calculadoras «sin puntuar». Esa
  regla extra existe porque todo estudio guardado antes de un cambio viejo lleva 1/1/1/1.
  **No hay opción neutra**, así que no se eligió. La tabla completa y las tres decisiones que la
  cierran están en `PENDIENTES.md` → **Y3-7**.

- **A/B DEDICADO CONTRA HEAD, con el formulario vacío y con cuatro escenarios cargados: 22
  diferencias, y las 22 son la fila nueva de la Vmax** —el cuadro aórtico pasa de 9 a 10 filas y las
  dos tarjetas aórticas ganan su renglón—. **CERO diferencias** en informe (tres estilos), EN SUMA,
  **PDF del informe generado de verdad**, **PPT estadístico generado de verdad**, **PDF de auditoría
  generado de verdad**, Laboratorio, grados, pastillas, cápsulas y el **Excel en 440 columnas**.
  **Escenas que cambian de veredicto: NINGUNA.**

- **Arnés: `scripts/_probe_y3.mjs`** (A/B de solo lectura con `--file`, `--dest` para las capturas),
  ocho grupos (`vmax`, `comisuras`, `panel`, `dibujo`, `tabla`, `detalles`, `wilkins`, `cap3d`), más
  los heredados del Y1b. **Cobertura: TC-485**, **59 condiciones** —**42 en rojo** contra HEAD y
  **NINGUNA por excepción**—.
  ⚠️ **MURIÓ POR EXCEPCIÓN DOS VECES** contra HEAD antes de blindarlo: `.click()` sobre null y
  `T.tit.indexOf` sobre un objeto de respaldo al que le faltaba esa clave, las dos con **cero**
  condiciones en rojo.
  ⚠️ **EL CUERPO DE UN CASO NO PUEDE CAMBIAR EL ANCHO DE LA VENTANA**, así que TC-485 mide la
  maqueta **que corresponde al ancho** de la corrida y lo DECLARA en su denominador; la del otro
  ancho la mide la sonda. Es el reparto de TC-460.
- ⚠️ **`\s` DENTRO DEL TEMPLATE DE LA SONDA SE COCINA A LA LETRA `s`**, otra vez: informó «IM severa»
  como «IM  evera». Y un **salto de línea escapado** dentro de un literal de cadena del cuerpo de un
  caso deja la cadena sin cerrar («Invalid or unexpected token»); un **regex literal con un salto
  real adentro** tira «Invalid regular expression: missing /» y hay que armarlo desde una cadena.
- ⚠️ **Me comí el acento grave TRES veces**, las tres en comentarios míos dentro del template de la
  sonda o del cuerpo de un caso. `scripts/check_backticks.py` dio la línea exacta las tres.
- ⚠️ **CASOS ADAPTADOS: UNO.** TC-479, cuyo denominador exigía cinco entradas en `EA_FILA_GRADO`.

### La vista 2D CHICA y el «POR QUÉ» de cada tarjeta — «Y1b + Y2» (2026-10-16)

- **Son DOS bloques en OCHO commits.** Al **empezar**, `main` y `origin/main` estaban los dos en
  **`65b4531`** (sello `v20261015-2055`), **sin nada sin pushear** —confirmado con un `git fetch` de
  verdad—, con los nueve commits del Z6 y del Y1 ya incluidos **y pusheados**. Los **ocho** commits
  de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 8 → 7 → … → 1.**
  ⚠️ **EL Y1b (1 a 3) Y EL Y2 (4 a 8) NO SE TOCAN ENTRE SÍ**: el Y1b es CSS y el marcado de un
  botón, el Y2 es JS nuevo (`V2D_PORQUE`, `_v2dPorQue`, `_v2dPqPintar`, `v2dPorQueTog`) más su CSS.
  Ninguno nombra una pieza del otro.
  ⚠️ **DENTRO DEL Y1b: el 2 cuelga del 1 por el breakpoint.** El 1 mueve la media query de 900 a
  768 px y el 2 le agrega adentro la regla del dibujo en angosto: revertir el 1 sin revertir antes
  el 2 deja esa regla en una media query que ya no existe. **Orden: 2 antes que 1.**
  ⚠️ **EL 1 LLEVA LA SONDA** (`scripts/_probe_y1b.mjs`), que los siete commits siguientes usan.
  ⚠️ **DENTRO DEL Y2 LA CADENA ES ESTRICTA: 7 → 6 → 5 → 4.** El 4 crea la tabla, el lector y el
  pintor; el 5, el 6 y el 7 agregan **entradas** a esa tabla y, el 6 y el 7, dos ramas del pintor.
  Revertir el 4 sin revertir antes los otros tres deja `v2dEstado` llamando a `_v2dPorQue`, que no
  existiría, y un `ReferenceError` ahí se lleva la vista entera.
  **El 8 es TC-484 más la documentación y el sello**, y afirma el comportamiento de los cuatro:
  revertir cualquiera sin el 8 lo deja en rojo. **El 3 es TC-483** y hace lo mismo con el Y1b.
  ⚠️ **CASOS ADAPTADOS: NINGUNO.** TC-482 quedó verde sin tocarle una línea —su condición del piso
  de 44 px sigue siendo cierta porque el piso NO se bajó, y los cuatro literales de la grilla no
  cambiaron—.

- **Línea base al cierre: suite 494/498 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 440 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base—. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los de ENTRADA —**TC-223** (el
  documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**— y no apareció ninguno fuera
  de esa lista. **El denominador sube a 498**: esta tanda agregó **TC-483** y **TC-484**. El `md5`
  de `index.html` no se movió durante la corrida (`6b4783e0…`, el del sello) y el pendrive estaba
  montado antes y después.
  ⚠️ **`--todo` del chequeo de celular da 378 a 360 px y 387 a 390 px, EL MISMO PAR QUE DEJÓ EL Y1**:
  ni el botón más chico, ni el panel flotante, ni el desplegable del «porqué» agregan un solo
  hallazgo. El botón del «porqué» no entra en el conteo de objetivos táctiles chicos porque su área
  clicable llega a 40 px por un `::after` y `check_mobile.js` mide el rect del nodo, no el del
  pseudo-elemento — declarado, y medido aparte con `elementFromPoint`.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **498 ids** sobre los 499 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261015-2055`) y se volvió a sellar:
  **`v20261016-0125`**. Todo lo medido salió **DESPUÉS** de sellar, con el `md5` quieto.
- **`index.html` pasó de 7,63 MB / 114.869 líneas a 7,66 MB / 115.387 líneas.**

- **Dónde está todo:** `docs/mapa/vista-2d-valvulas.md` → las secciones **9, 10 y 11** (la maqueta
  chica con su tabla de antes y después, el «porqué» con su tabla de fuentes por lesión, y once
  trampas), de 11,7 a **26,4 KB**; `docs/mapa/tests.md` → los dos casos nuevos (**31,9 KB**);
  `docs/fuentes/FUENTES.md` → por qué estas dos tandas **no llevan ninguna cita nueva** y la
  re-verificación del DVI protésico aórtico en la Tabla 5, folio 19; y `docs/PENDIENTES.md` →
  **Y1-1 marcado CERRADO** más **nueve** cosas declaradas (Y1b-1, Y1b-2 e Y2-1 a Y2-7).
  **NINGÚN mapa cruzó el techo**, medido con `wc -c` ANTES de escribir.

- **Y1b · EL PROBLEMA ERA REAL Y ESTÁ MEDIDO EN HEAD.** A 1200×700 el panel del Y1 medía
  **1180×680** en `@10,10` —la ventana entera—, el dibujo **481×490**, y **la nota y la tabla de
  cavidades quedaban FUERA de la caja visible**, con scroll interno en los seis anchos. Hoy el panel
  es una **tarjeta flotante centrada de 900 px y 85 vh**: a 1200×700 mide **900×587** y **todo entra
  sin desplazamiento** —con la tabla de **ONCE** filas, que es la más alta que la app puede producir—.
  ⚠️ **SE CENTRA CON `inset:0` + `margin:auto` Y NO CON `transform`**: un ancestro con `transform` es
  bloque contenedor de cualquier `position:fixed` de adentro, que es por lo que la tarjeta del globo
  ⓘ ya cuelga del `body`.
- **EL BOTÓN DEL PIE TIENE EL COLOR REAL DE UNA PESTAÑA DE VÁLVULA EN REPOSO, EN LOS DOS TEMAS.**
  `btn btn-ghost` —la clase exacta de las ocho pestañas apagadas— **sin declarar un solo color
  propio**, con la tipografía y el relleno de `.tab-btn` (11 px, 600, 5/12). Pasó de 109×44 a
  **93×44** y del azul `rgb(79,142,247)` al `rgb(30,35,51)` de noche y `rgb(238,241,246)` de día,
  **idénticos** a `#pill-insuf-mitral`. Control negativo: una pestaña **prendida** no se ve así.
  ⚠️ **EL PISO DE 44 px NO SE BAJÓ, Y ES DELIBERADO**: la regla global de la app no está acotada a
  `pointer`, así que una pestaña en reposo **también** mide 44 px en escritorio. Bajarlo habría
  hecho que el botón dejara de tener el tamaño de una pestaña y habría revertido la decisión de
  Maicol del 2026-09-25. `PENDIENTES.md` → **Y1b-2**.
- ⚠️ **EL DIBUJO QUEDÓ EN 200 px A 1200×700 Y NO EN LOS 300 DEL PUNTO DE PARTIDA, Y EL NÚMERO SALE
  DE MEDIR.** Con 300 la tabla completa no entra en el 85 % de una ventana de 700 px y vuelve el
  desplazamiento, que es lo que esta tanda cierra. El `clamp(200px, calc(100vh - 520px), 320px)` da
  **200** a 700 px de ventana, **280** a 800 y **320** desde 840. `PENDIENTES.md` → **Y1b-1**.

- **Y2 · NADA SE RECALCULA, Y POR ESO LA TARJETA Y LA PANTALLA NO PUEDEN DIFERIR.** Cada valor, su
  unidad, su redondeo, su marca «(revisar)» y su grado se LEEN del mismo nodo que el médico tiene
  delante. **El nombre del criterio sale de los NODOS DE TEXTO de su `.calc-lbl`** —sin los cortes
  ni el globo— así que tampoco es una copia: el rótulo completo trae los tres cortes pegados, que en
  184 px no entran. TC-484 compara cada fila contra la **fila completa** de la pantalla.
- **EL GRADO DE UNA FILA SE PUBLICA DE TRES FORMAS DISTINTAS SEGÚN LA LESIÓN, y las tres se
  declaran por criterio:** el span hermano `data-grado-de` (IM, IAo, EAo), un id propio (las cuatro
  `.em-clase-*` de la EM) o **dentro del valor** (la IT, la ET y las cápsulas protésicas). Ninguna
  se adivina. `PENDIENTES.md` → **Y2-4**.
- ⚠️ **CUATRO LESIONES QUEDAN SIN LÍNEA «DECIDE», Y NO SE INVENTA.** La IM, la IAo, la IT y la ET
  publican en su renglón **el grado** y **no nombran el criterio**: su regla es un conteo, y
  atribuírselo a una fila sería una segunda lectura de esa regla escrita en la vista. Llevan la
  lista y no llevan la línea. Las que sí la llevan: la **EAo nativa** —su renglón dice «Severa — por
  velocidad» desde la tanda F, publicado TAL CUAL— y la **prótesis mitral**, con el paréntesis que
  su veredicto ya escribe («DVI 2.60, gradiente medio 12.0 mmHg, THP 250 ms · 3 de 4 criterios»).
  La **EM** no lleva línea pero **sí la marca «decide» en la fila**, leída de la palabra «peor» que
  la pantalla ya pega a esa clase. `PENDIENTES.md` → **Y2-1**.
- **LAS PRÓTESIS: la velocidad pico se marca «no vota» y no se saca, el PPM no entra, y los
  RETIRADOS van en gris con el motivo que la cápsula ya escribe.** Las tres marcas de retiro —«no
  concluye», «no válida», «no aplica»— se leen; un «sin criterios de obstrucción» **no** es retiro,
  es un criterio medido que dio negativo. Medido en las cuatro escenas del Z6, **con su control
  negativo**: en una BIOLÓGICA con el mismo THP normal el gradiente **no** se retira.
- **EL GRADO FIJADO A MANO MANDA Y NO LLEVA CRITERIOS.** Con `sevDiscrepa` —el mismo dueño del aviso
  rojo y del cajón, y no `esqSevManual` pelado— la tarjeta publica ese grado, el **aviso de ajuste
  manual que la pantalla ya escribe** (que además nombra el calculado) y, si está escrito, el
  **fundamento** del cajón. Sin lista y sin botón. **Control negativo:** fijar a mano el MISMO grado
  que el cálculo no es discrepancia y la lista sigue estando.
- **EL DESPLEGABLE:** `<button>` real con `aria-expanded`, **objetivo táctil de 40 px** por un
  `::after` que extiende el área clicable sin agrandar lo que se ve —medido con `elementFromPoint` a
  19 px arriba y abajo—, **sin hover**, cerrado por defecto y **cerrado de nuevo al reabrir la
  vista** sin guardar ni limpiar un estado.

- **A/B DEDICADO CONTRA HEAD, con el formulario vacío y con tres escenarios cargados: 0
  DIFERENCIAS** en informe (tres estilos), EN SUMA, **PDF del informe generado de verdad**, **PPT
  estadístico generado de verdad**, **PDF de auditoría generado de verdad**, **Laboratorio por sus
  funciones dueñas** (`_labDiastGrado`, `_labGeomCat`, `_labDisfSistVent`, `_labValvCounts`,
  `_labEstenSev`, `_labEmLectura`), grados y pastillas de las ocho lesiones, diastólica, HFA-PEFF y
  el **Excel en 440 columnas comparado CLAVE POR CLAVE**. **Escenas que cambian de veredicto:
  NINGUNA.** El PDF, el PPT y el Laboratorio tuvieron esta vez **volcado dedicado**, que es la
  salvedad que el Y1 había dejado abierta.

- **Arnés: `scripts/_probe_y1b.mjs`** (A/B de solo lectura con `--file`, `--dest` para las
  capturas), siete grupos (`estilo`, `maqueta`, `censo`, `dvi`, `controles`, `porque`, `captura`).
  **Cobertura: TC-483**, **33 condiciones** —**14 en rojo** contra HEAD— y **TC-484**, **51
  condiciones** —**36 en rojo**—, las dos contadas sobre el propio caso y **ninguna roja por
  excepción**.
- ⚠️ **SEMGREP CAZÓ EL HANDLER COMO CADENA SOBRE CÓDIGO RECIÉN ESCRITO**: `setAttribute('onclick',
  'v2dPorQueTog(this)')` daba **128 / 0 ERROR** donde la línea base es 127. Pasa por propiedad.
- ⚠️ **Y EL SCANNER HAY QUE CORRERLO DESDE `~/Desktop/APLICACIONES`** con la ruta
  `ecosmart/index.html`: desde dentro de `ecosmart` informa **«0 hallazgos en 0 apps»**, que se lee
  idéntico a «limpio».
- ⚠️ **TC-484 MURIÓ POR EXCEPCIÓN CONTRA HEAD EN SU PRIMERA VERSIÓN**, por un
  `JSON.stringify(undefined).slice(…)` en el **tercer** elemento del `push` —el texto de
  «encontrado», que se evalúa siempre—. Misma lección que TC-482 pagó dos veces.
- ⚠️ **LA PRIMERA VERSIÓN DE TC-484 COMPARABA CONTRA EL NODO DEL VALOR Y SALÍA ROJA EN CINCO
  LESIONES A LA VEZ**: el valor y el grado viven en nodos DISTINTOS. Se compara contra la **fila
  completa** (`.calc-row`), que además es una lectura independiente del lector.
- ⚠️ **`\s` DENTRO DEL TEMPLATE DE LA SONDA SE COCINA A LA LETRA `s`**, otra vez: informó «Vmax
  teledia tólica» sobre un rótulo perfecto.
- ⚠️ **DOS DEFECTOS QUE VIO LA CAPTURA Y NO LA MEDICIÓN.** (1) En 184 px la tercera columna mide
  unos 55: una banda protésica entera caía partida en cinco renglones de dos palabras, con el texto
  completo y **ilegible** — un grado de más de 12 caracteres pasa a su propia fila, a lo ancho.
  (2) El separador entre «no vota» y la banda era un **margen de CSS**: el ojo los veía separados y
  el `textContent` los devolvía pegados.
- ⚠️ **EL `viewBox` RENDERIZADO NO ES EL DEL MARCADO** —el motor lo reescribe para encuadrar— y el
  control negativo de TC-483 salió rojo **dos veces** sobre un dibujo perfecto.

### La VISTA 2D de las válvulas y el gradiente medio de la prótesis mitral — «Z6 + Y1» (2026-10-15)

- **Son DOS bloques en NUEVE commits.** Al **empezar**, `main` y `origin/main` estaban los dos en
  **`72bacee`** (sello `v20261015-1850`), **sin nada sin pushear** —confirmado con un `git fetch` de
  verdad—, con los cinco commits del Z5 ya incluidos **y pusheados**. Los **nueve** commits de esta
  tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 9 → 8 → … → 1.**
  ⚠️ **EL Z6 (1 a 4) Y EL Y1 (5 a 9) NO SE TOCAN ENTRE SÍ**: el Z6 vive en `vmProtEOA`,
  `vmProtEOAPintar`, `eaProtVeredicto` y `_eaDviProtNivel`; el Y1 en el bloque `v2d-*`, que no
  nombra ninguna de las cuatro. Los dos bloques se revierten por separado.
  ⚠️ **DENTRO DEL Z6: el 1, el 2 y el 3 se revierten solos y en cualquier orden entre sí.** El 1 es
  el retiro por regurgitación (`R.gmedRetiro`, `VM_PROT_GMED_RETIRO_TXT`, la rama de `_t11Fila`), el
  2 el del THP normal (`R.mecanica`, `VM_PROT_GMED_THP_TXT`) y el 3 son dos cosas independientes
  entre sí —la fila del PPM y el DVI aórtico—. **PERO el 2 cuelga del 1 por la fila**: su motivo
  usa `R.gmedRetiro`, que nace en el 1; revertir el 1 sin revertir antes el 2 deja ese campo sin
  existir y la fila vuelve a imprimir «undefined» al lado del número. **Orden: 2 antes que 1.**
  ⚠️ **Y EL 1 ADAPTÓ TRES CONDICIONES DE TC-480**, una de ellas el **límite declarado** del Z5
  —«el gradiente medio SIGUE contando con regurgitación»—, escrita para que el día que se decidiera
  se notara. Se decidió y lo notó. Revertir el 1 sin reponerlas deja TC-480 midiendo lo contrario.
  **El 4 es TC-481** y afirma el comportamiento de los tres: revertir cualquiera sin el 4 lo deja
  en rojo.
  ⚠️ **DENTRO DEL Y1 LA CADENA ES ESTRICTA: 8 → 7 → 6 → 5.** El 5 crea el panel, el lector y el
  dibujo; el 6 agrega las dos columnas de tarjetas (marcado, CSS de tres columnas, las listas del
  lector y su pintor); el 7 la tabla de cavidades y la regla de UNA columna; el 8 los chorros.
  Cada uno nombra piezas del anterior: revertir el 5 sin revertir antes el 6 y el 7 deja
  `v2dAbrir` llamando a dos pintores que no existen —inocuo, van con `if (E)`— pero deja el panel
  con las tarjetas y la tabla **vacías para siempre**, que es peor que no tenerlas.
  **El 9 es TC-482 más la documentación y el sello.**
  ⚠️ **EL 5 LLEVA LA SONDA** (`scripts/_probe_y1.mjs`), que los commits 6, 7, 8 y 9 usan.

- **Línea base al cierre: suite 492/496 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 440 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base—. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los de ENTRADA —**TC-223** (el
  documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**—, y no apareció ninguno
  fuera de esa lista. **El denominador sube a 496**: esta tanda agregó **TC-481** y **TC-482**. El
  `md5` de `index.html` no se movió durante la corrida (`cf6900ad…`, el del sello) y el pendrive
  estaba montado antes y después.
  ⚠️ **`--todo` del chequeo de celular da 378 a 360 px y 387 a 390 px, EL MISMO PAR QUE DEJÓ EL
  Z5**: la vista 2D no agrega un solo hallazgo, y no por suerte: `check_mobile.js` abre pestañas y
  secciones pero **no modales**, que es lo que el cartel de péptidos ya dejó escrito. Su maqueta se
  mide con la sonda, a cuatro anchos por dos temas.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **496 ids** sobre los 497 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261015-1850`) y se volvió a sellar:
  **`v20261015-2055`**. Todo lo medido salió **DESPUÉS** de sellar, con el `md5` quieto, y
  `index.html` no se tocó durante la corrida.
- **`index.html` pasó de 7,46 MB / 112.433 líneas a 7,63 MB / 114.869 líneas.**

- **Dónde está todo:** `docs/mapa/vista-2d-valvulas.md` (**mapa NUEVO**, 11,7 KB: las piezas por
  nombre, la tabla de qué nodo alimenta cada cosa, las tarjetas, la tabla, el latido, los chorros,
  la maqueta, la accesibilidad y las seis trampas), `docs/mapa/protesis-valvular.md` → «La tanda
  Z6» (**31,7 KB**), `docs/mapa/aortica-cortes.md` → el DVI por un camino (**25,5 KB**),
  `docs/mapa/valvulas.md` → el puntero a la vista (**29,5 KB**), `docs/mapa/tests.md` → los dos
  casos nuevos (**29,5 KB**), `docs/fuentes/FUENTES.md` → «La tanda Z6 — la nota `‡` y la Tabla 12»
  y por qué la vista 2D **no lleva ninguna cita**, y `docs/PENDIENTES.md` → **Z5-1, Z5-3 y Z5-5
  marcados CERRADOS** más **diez** cosas declaradas (Z6-1 a Z6-3 e Y1-1 a Y1-7).
  **NINGÚN mapa cruzó el techo**, medido con `wc -c` ANTES de escribir.

- **Z6-1 · EL GRADIENTE MEDIO SE RETIRA CON REGURGITACIÓN, Y LA DECISIÓN LA TOMÓ LA GUÍA.** La
  nota `‡` de la Tabla 11 (folio 27, renderizada a 400 dpi) marca **tres** parámetros —velocidad
  pico, gradiente medio y DVI— y dice que también son anormales con una regurgitación protésica
  **«significativa»**, sin graduarla. La orden autorizaba el retiro si la guía decía eso y lo
  prohibía si decía **sólo severa**: dice significativa. Se aplica con el **mismo dueño y el mismo
  umbral que el DVI** (`emContMotivoNoVota`, moderada o mayor).
  **DOS escenas cambian:** con IM moderada o severa el veredicto baja de «significativa (2 de 2)» a
  «posible (1 de 1)» y **la línea SALE del informe firmado**. Sin IM y con IM leve, idénticas.
  ⚠️ **LA VELOCIDAD PICO NO SE TOCA** aunque la nota la marque: no vota, así que retirarla no
  cambiaría ningún veredicto (Z5-2, y la orden lo prohíbe).

- **Z6-2 · CON EL THP NORMAL Y PRÓTESIS MECÁNICA, EL GRADIENTE NO VOTA ESTENOSIS.** La afirmación
  de Cowork **está en el original**, pero no en la Tabla 11: en la **Tabla 12, folio 28**, cuyo
  título dice «in mechanical valves with normal PHT» y publica el gradiente medio `≥ 5` mmHg como
  hallazgo sugestivo de **regurgitación** (sens. 90 %, esp. 70 %). El pie de la Figura 20 razona
  igual sobre un caso.
  ⚠️ **DIFERENCIA CON LA LETRA DE LA ORDEN, DECLARADA: la app lo acota a las MECÁNICAS**, porque la
  guía lo acota. Con una biológica el gradiente cuenta como hasta hoy — medido.
  ⚠️ **Y SÓLO SE RETIRA LO QUE ESTÁ POR ENCIMA DE LA BANDA NORMAL.** Con el gradiente en `≤ 5` no
  hay nada que reinterpretar y retirarlo le quitaría al veredicto un criterio NEGATIVO legítimo. El
  5 exacto es el único punto donde las dos tablas se pisan y gana la Tabla 11.
  **Escenas que cambian:** mecánica con THP 100 y con THP 129 —el borde 129/130 separa—. Sin THP,
  con THP 250 y con biológica, idénticas.
  ⚠️ **NO SE AGREGA NINGÚN TEXTO AL INFORME.** La guía además propone decirlo; la orden lo prohíbe.
  `PENDIENTES.md` → **Z6-1**.

- **Z6-3 · LA FILA DEL PPM Y EL DVI AÓRTICO.** (a) Con el AEO retirado la fila ya **no pide** el
  AEO —se eligió no decir nada, que es lo conservador: el motivo ya está dos renglones arriba— y el
  pedido legítimo se conserva. (b) **El DVI protésico aórtico sale por UN camino**, y los dos **SÍ
  discrepaban**: con VTI TSVI 20 y VTI aórtico 56,4 (crudo 0,35461) o 57 (0,35088) la pantalla
  publica «0.35» en los dos, así que la fila decía «(sin criterios)» —el crudo supera el 0,35
  estricto— mientras el veredicto decía «posible». Hoy las dos dicen «posible».
  ⚠️ **EL NIVEL VIAJA APARTE Y NO EN `niveles`**: en la TAVI ese objeto no tiene `dvi`, así que leer
  de ahí habría dejado la fila **muda en toda TAVI**.

- **Y1 · LA VISTA 2D ES SOLO LECTURA, Y ESO ESTÁ MEDIDO.** Abrir y cerrar no escribe **ni un campo**
  del estudio, no deja **nada** en `localStorage` ni en `sessionStorage`, y con la vista abierta el
  informe, el EN SUMA y las **440 columnas** del Excel salen idénticos. A/B contra HEAD con el
  formulario vacío y con un escenario cargado: **0 diferencias**.
- **UN SOLO LECTOR (`v2dEstado`) Y NINGÚN CÁLCULO NUEVO.** Los tramos de las cámaras salen de las
  CATEGORÍAS que los cuadros de referencia ya pintan, leídas por `textContent`; el grado y el COLOR
  de cada tarjeta, de la **pastilla de severidad**, que es el dueño único de los dos desde
  `valvSev.refrescar`. **Por eso la tarjeta no puede discrepar del informe**: los dos leen el mismo
  `*_grado`. Medido en las seis lesiones nativas, con un grado fijado a mano y con una lesión sin
  graduar: la tarjeta dice lo mismo que el EN SUMA en todas.
- **LA DIMENSIÓN DEL VI SALIÓ A SU PROPIO DUEÑO** (`viDimCat`), al lado de `calcGeometriaVI`: el
  dibujo necesita el MISMO tramo que el informe publica. El texto del informe no cambia ni un byte.
- **CON PRÓTESIS, LA COLUMNA DE ESTENOSIS NO SIGUE A LA PASTILLA** sino al veredicto protésico, y
  **sin chip de color**: con una prótesis no hay grado que colorear, y pintar el residuo nativo de
  `ea_grado` sería republicar la escala que el W2-B retiró. La **regurgitación** sí sigue a la
  pastilla, también con prótesis (la ASE 2024 la gradúa con los criterios nativos).
- **EL LATIDO SÓLO CORRE CON LA VISTA ABIERTA, MEDIDO ESPIANDO `requestAnimationFrame`:** 0 cuadros
  pedidos en 900 ms con la vista cerrada, 55 con la vista abierta, 0 otra vez al cerrar.
  `prefers-reduced-motion` ya estaba contemplado en la demo y se conserva: un cuadro fijo, sin bucle.
  ⚠️ **UN CUADRO SINCRÓNICO AL ABRIR, y no es cosmético**: `requestAnimationFrame` pinta en el
  cuadro SIGUIENTE, así que sin él la vista abría con el dibujo del paciente anterior durante un
  cuadro — y la primera corrida de la sonda informó «cero prótesis dibujadas» sobre un árbol que
  las dibuja bien.
- **LOS CHORROS NACEN DONDE SE UNEN LAS VALVAS, y el desplazamiento se CALCULA de la misma data que
  dibuja las valvas** (IT +13,66 · IM +14,31 · IAo −8,55, sólo en y). Es una traslación pura.
  Verificado **mirando el PNG** antes y después, en sístole para la IM y la IT y en **diástole**
  para la IAo —con la fase en sístole ese chorro no se ve, y «no se movió» se leería igual que «no
  hay chorro»—.
- **MAQUETA MEDIDA a 1200, 768, 390 y 360 px en los DOS temas:** tres columnas a 1200 y UNA en los
  otros tres, **cero scroll horizontal** en las ocho celdas y el dibujo siempre dentro de su caja.
  **Las 21 variables de la paleta resuelven en los dos temas**, ninguna queda vacía y **veinte
  cambian**; la única que no es `--v2d-brodhi`, el brillo especular del vástago biológico, que es el
  mismo en los dos modos **en el dibujo aprobado**.
- ⚠️ **EL ARCHIVO DEL DIBUJO QUEDA SIN VERSIONAR**, como pedía la orden: `docs/3d/Esquema valvular_
  prótesis, geometría y función.html` sigue fuera del commit. No trae **ninguna** dependencia
  externa ni almacenamiento del navegador, así que no hubo parada que declarar.

- **Arneses: `scripts/_probe_z6.mjs`** (seis grupos: `gmedRegurg`, `thpNormal`, `aeoPpm`, `dviAo`,
  `tarjeta`, `controles`) y **`scripts/_probe_y1.mjs`** (cinco: `boton`, `estado`, `maqueta`,
  `controles`, `captura`), los dos A/B de solo lectura con `--file`.
  **Cobertura: TC-481**, **28 condiciones** —**13 en rojo** contra HEAD— y **TC-482**, **45
  condiciones** —**36 en rojo**—, las dos contadas instrumentando el propio caso y **ninguna roja
  por excepción**.
- ⚠️ **TC-482 MURIÓ POR EXCEPCIÓN CONTRA HEAD DOS VECES, y la segunda en el TERCER elemento del
  `push`** —el texto de «encontrado»—, que se evalúa **siempre**, pase o falle la condición. Un
  centinela en la condición no alcanza: hay que blindar también lo que se imprime.
- ⚠️ **`\s` DENTRO DE UN TEMPLATE LITERAL SE COCINA A LA LETRA `s`**, y la sonda informó
  «in uficiencia » en vez de «insuficiencias» sobre tarjetas perfectas. Es la trampa que este
  archivo ya tiene escrita, pagada otra vez.
- ⚠️ **UN CHIP VACÍO LO VIO LA CAPTURA Y NO LA LECTURA**: con prótesis —que no lleva grado— la
  primera versión creaba el span igual y publicaba una pastilla en blanco debajo del veredicto.
- ⚠️ **EL ESTILO DEL INFORME ES ESTADO DE SESIÓN**, y el control negativo lo pagó: el bucle de los
  tres estilos deja el NARRATIVO puesto, así que la fila del Excel se llevaba ese texto y la
  comparación informó dos diferencias que eran del estilo y no de la vista.
- ⚠️ **Me comí el acento grave TRES veces**, las tres en comentarios míos dentro del cuerpo de un
  caso, con el archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la
  línea exacta las tres.
- ⚠️ **CASOS ADAPTADOS: UNO. TC-480**, en tres condiciones y con el motivo escrito en cada una.
### El VOTO de la prótesis MITRAL, el DVI AÓRTICO sin diámetro, el PPM de las dos prótesis y la LÍNEA INTEGRADA — «Z5» (2026-10-15)

- **Es la tanda «Z5».** Al **empezar**, `main` y `origin/main` estaban los dos en **`6b7030e`**
  (sello `v20261015-1639`), **sin nada sin pushear** —confirmado con un `git fetch` de verdad—,
  con los cinco commits del Z ya incluidos **y pusheados**. Los **cinco** commits de esta tanda
  quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 1, EL 2 Y EL 4 SE REVIERTEN SOLOS Y EN CUALQUIER ORDEN ENTRE SÍ**: el 1 es el voto de la
  prótesis mitral (`VM_PROT_OBSTR_*`, `vmProtObstrCrit`, la fila `vm-prot-obstr` y su tarjeta), el
  2 el DVI aórtico (`_eaDviProtNivel`, `EA_DVI_PROT_TXT` y el `if` propio del DVI) y el 4 la línea
  integrada (`_avaNoValuable` y la etiqueta por `gradoStr`). Ninguno nombra nada de los otros.
  ⚠️ **PERO EL 3 CUELGA DEL 2 POR UNA LÍNEA**: `eaProtPpmSync` se llama desde la cola de `calcAo`,
  que el 2 no tocó pero sí reordenó alrededor del DVI. Revertir el 2 sin revertir antes el 3 no
  rompe nada —la llamada va en `try`— pero deja Z2-2 reabierto a medias.
  ⚠️ **EL 1 LLEVA LA SONDA** (`scripts/_probe_z5.mjs`), que los commits 2, 3 y 4 usan.
  **El 5 es TC-480 más documentación y el sello**, y afirma el comportamiento de los cuatro:
  revertir cualquiera sin el 5 deja TC-480 en rojo.

- **Línea base al cierre: suite 490/494 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0
  ERROR, Excel en 440 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO
  a la línea base—. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los de ENTRADA
  —**TC-223** (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**—, y no
  apareció ninguno fuera de esa lista. **El denominador sube a 494**: esta tanda agregó
  **TC-480**. El `md5` de `index.html` no se movió durante la corrida (`723f0a6c…`, el del sello)
  y el pendrive estaba montado antes y después. Al terminar no quedó ningún Chrome mío —los que
  siguen vivos son del usuario, arrancados cinco horas antes de esta sesión y sin puerto de
  depuración—.
  ⚠️ **LA SUITE COMPLETA SE CORRIÓ DOS VECES, Y LA PRIMERA NO ES LA LÍNEA BASE.** Dio **488/494**
  con **SEIS** rojos, y los dos de más —**TC-471** y **TC-472**— los destapó la suite completa:
  ninguna corrida de zona podía verlos, porque lo que afirman es el **conteo de globos ⓘ de la
  pestaña Válvulas** (21 → 22) y el del registro `VINFO` (22 → 23). Se adaptaron con el motivo
  escrito y la segunda corrida es la que vale. **Es la sexta tanda seguida en que la suite
  completa destapa algo que la de zona no ve.**
  ⚠️ **`--todo` del chequeo de celular da 378 a 360 px y 387 a 390 px, EL MISMO PAR QUE DEJÓ EL
  Z**: ni la fila del veredicto, ni el DVI que ahora se publica, ni el globo nuevo agregan un
  solo hallazgo, porque ninguno es un control de formulario.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **494 ids** sobre los 495 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261015-1639`) y se volvió a sellar:
  **`v20261015-1850`**. Todo lo medido —la suite completa, Semgrep y el chequeo de celular— salió
  **DESPUÉS** de sellar, con el `md5` quieto, y `index.html` no se tocó ni una vez durante la
  corrida (las dos adaptaciones de casos son de `scripts/test_clinico.mjs`).

- **Dónde está todo:** `docs/mapa/protesis-valvular.md` → la sección Z5 (el voto, el PPM y las seis
  trampas), `docs/mapa/aortica-cortes.md` → el DVI sin diámetro y el renglón integrado,
  `docs/fuentes/FUENTES.md` → «La tanda Z5 — la Tabla 11 completa, criterio por criterio, y qué NO
  dice la guía», y `docs/PENDIENTES.md` → **Z1, Z2-1, Z2-2, Z3-1 y Z3-2 marcados CERRADAS** más
  **seis** cosas declaradas (Z5-1 a Z5-6). **NINGÚN mapa cruzó el techo**, medido con `wc -c`
  ANTES de escribir: `protesis-valvular.md` 20,1 → **27,0 KB** y `aortica-cortes.md` 19,1 → **23,7 KB**.

- **EL VOTO DE LA PRÓTESIS MITRAL: CUATRO CRITERIOS Y UNA REGLA DE CONTEO QUE ES DE MAICOL.** La
  ASE 2024 **no publica regla de integración** —censado en el Z y re-verificado— así que los cuatro
  criterios y sus cortes son de la guía y el umbral es **criterio EcoSmart declarado en la tarjeta**.
  Los cuatro salen de la prosa del **folio 24**: gradiente medio `>10` mmHg, THP `>200` ms,
  DVI `>2,5` y AEO `<1` cm². **NINGÚN CORTE SE MOVIÓ.**
  ⚠️ **LA VELOCIDAD PICO NO VOTA, y la diferencia es de la fuente**: la Tabla 11 la publica y la
  prosa del folio 24 la **omite**. Es la única diferencia entre las dos y es la que decide quién
  vota. Medido por los dos lados: sola no alcanza, y sumada a dos positivos no cambia el conteo.
  ⚠️ **CON CERO POSITIVOS EL VEREDICTO NO SE VACÍA**: lo que la Tabla 11 publica para un parámetro
  en la banda del medio es literalmente «possible stenosis», así que ese estado se conserva. `null`
  queda **sólo** sin ningún criterio medido.

- **LAS CINCO ESCENAS QUE CAMBIAN DE VEREDICTO, una por una, medidas con teclas reales:**
  · **1 solo positivo (DVI)** → de `significativa` a `posible`: **SALE del informe firmado**.
  · **2 positivos (gradiente + THP)** → de `posible` a `significativa`: **ENTRA al informe**.
  · **1 pos. gradiente, resto sin medir** → de `null` a `posible` (no toca el papel).
  · **2 pos. gradiente + THP, resto sin medir** → de `null` a `significativa`: **ENTRA**.
  · **IM moderada o mayor con gradiente y THP positivos** → de `null` a `significativa`: **ENTRA**.
    Es consecuencia directa de la PARADA de abajo.

- ⚠️ **PARADA Z5-1, MEDIDA: EL GRADIENTE MEDIO NO SE RETIRA CON REGURGITACIÓN, Y LA NOTA `‡` LO
  MARCA.** La orden autorizaba retirarlo **sólo si** el umbral con que la app ya retira el DVI
  fuera «severa». Medido: `EM_CONT_REGURG_MIN` vale **2**, o sea **moderada**. No se tocó nada del
  gradiente. **Y tiene consecuencia**: con IM ≥ moderada el AEO y el DVI se retiran, el denominador
  baja a «2 de 2» y el gradiente + el THP publican la línea donde HEAD callaba. El THP **no** está
  marcado con `‡`, así que su voto ahí es legítimo; el que la guía marca es el gradiente. TC-480 lo
  fija como límite declarado y `PENDIENTES.md` → **Z5-1** tiene las tres salidas.

- **EL DVI AÓRTICO SE PUBLICA CON LOS DOS VTI Y SIN EL DIÁMETRO — cierra Z3-2 con la salida (a).**
  ⚠️ **EL SÍNTOMA ERA PEOR QUE UNA FILA VACÍA**: medido en HEAD, sin el diámetro la fila publicaba
  **«— (moderada)»**, o sea un GRADO sin número, porque `_eaCritDvi` ya votaba sin él.
  ⚠️ **ESCENAS QUE CAMBIAN DE VEREDICTO EN LA PRÓTESIS: NINGUNA**, medido en las ocho de la tabla —
  `dvi-val`, que `calcAo` escribe sin diámetro, se lee **primero** y ya estaba poblado.
  **La referencia se adapta a la morfología sin ningún corte nuevo**: nativa 0,25 / 0,50 y prótesis
  los de la Tabla 5 que la app ya aplica. **Medido: el mismo 0,36 es «(moderada)» en nativa y
  «(sin criterios)» en prótesis**, que es el punto. Las palabras son otras a propósito: en nativa
  el DVI gradúa una **severidad** y en prótesis declara un **nivel de sospecha**.

- **LA FILA DEL PPM DICE LO QUE FALTA, Y SÓLO CUANDO FALTA — cierra Z2-2, y la causa NO era el
  texto.** Medido en HEAD con el orden del médico —los VTI primero y el peso después—: la fila
  aórtica decía «requiere el AVA por continuidad y la superficie corporal» con el veredicto
  devolviendo `ppm:'severo'` y `avai:0.55`, o sea pidiendo **dos datos que estaban cargados**.
  `_eaProtPintar` había corrido con `ava-idx` todavía en «—» y después **nadie repintaba la fila**.
  Hoy `eaProtPpmSync` se llama **también desde la cola de `calcAo`**, el dueño de `ava-idx`.
  Y el texto pasa a nombrar lo que de verdad falta, con un dueño para las dos prótesis: la mitral
  publicaba «—» pelado y la aórtica pedía los dos insumos aunque sobrara uno. Con el indexado
  marcado «(revisar)» ya **no pide datos**.

- **LAS DOS FRASES DEL PPM NOMBRAN SU VÁLVULA — cierra Z2-1 con la opción (b).**
  · informe, antes: «Desajuste protésico-paciente severo (AEO indexada 0.54 cm²/m²).»
  · informe, ahora: «Desajuste protésico-paciente **mitral** severo (AEO indexada 0.54 cm²/m²).»
  · EN SUMA, antes: la misma frase larga en las dos válvulas.
  · EN SUMA, ahora: **«PPM mitral severo.»** y **«PPM aórtico severo.»**
  ⚠️ **EL EN SUMA PIERDE EL VALOR DE LA AEO INDEXADA**, que sigue entero en el cuerpo del informe,
  en la fila de pantalla y en la columna del Excel. `PENDIENTES.md` → Z5-4.

- **EL RENGLÓN INTEGRADO NOMBRA EL CRITERIO QUE DE VERDAD DECIDE — cierra Z3-1 con la salida (a).**
  La rama `else if (ava)` armaba la etiqueta con la banda del AVA por **continuidad** y le pegaba el
  sufijo del criterio **global**: con la escena del médico publicaba **«Moderada — por AVA por
  planimetría»** mientras el `<select>`, el informe y la fila de la planimetría decían **severa**.
  **NINGÚN CORTE SE MOVIÓ, la regla del peor no se tocó y EL GRADO PUBLICADO ES EL MISMO** en las
  cinco escenas. Y lo que arregló el Z3 no se rompió: **12 de 12** órdenes y gestos de borrado
  vuelven a «sin dato».
  ⚠️ **QUE DOS FILAS DISCREPEN NO SE TOCÓ**: TC-480 lo fija como control negativo —la fila del AVA
  sigue diciendo «(moderada)»—. El error era una línea que nombra un criterio y le pone el grado de
  **otro**.

- **Arnés: `scripts/_probe_z5.mjs`** (A/B de solo lectura con `--file`), seis grupos
  (`votoMitral`, `tarjeta`, `dviAo`, `ppm`, `integrada`, `controles`), con teclas y clics reales,
  emulación de viewport y de tema, y el informe generado de verdad.
  **Cobertura: TC-480**, **47 condiciones** —contadas instrumentando el propio caso para que
  publicara su `ex.length`— con ocho denominadores y nueve controles negativos. **Verificado que
  sabe fallar contra HEAD en un worktree aparte: 30 de las 47 en rojo, y NINGUNA por excepción.**

- ⚠️ **CASOS ADAPTADOS: CINCO, con el motivo escrito en cada uno.** **TC-474** —su condición (E)
  era el **LÍMITE DECLARADO** del W2-B, «los tres parámetros nuevos NO entran en el veredicto de
  obstrucción», escrita para que el día que entraran se notara, **y lo notó**: hoy afirma lo
  CONTRARIO por el gradiente y el THP y **conserva** la afirmación sobre la velocidad pico, que es
  el límite que sigue vigente—, **TC-315** —con un solo positivo la línea ya no sube al papel—,
  **TC-479** —sus dos condiciones del PPM aórtico exigían la frase larga en las DOS superficies y
  hoy exigen cada una por separado, que es lo que distingue el cambio de un borrado— y **TC-471**
  y **TC-472**, los dos por el conteo de globos.

- ⚠️ **TC-480 MORÍA POR EXCEPCIÓN CONTRA HEAD EN SUS DOS PRIMERAS VERSIONES**, y las dos veces se
  llevaba las otras 46 condiciones: primero `VM_PROT_OBSTR_MIN` nombrada pelada
  (`ReferenceError`), después `r.txt.match` sobre un `undefined` que queda cuando el globo no
  existe (`TypeError`). Toda constante nueva se lee por `window` y toda clave del lector nace con
  centinela. Misma lección que TC-455, TC-462, TC-465, TC-471, TC-473, TC-474 y TC-477.
- ⚠️ **SEMGREP CAZÓ UN ERROR DE SINTAXIS QUE `check_backticks.py` NO PODÍA VER.** Al reemplazar la
  cascada muerta del renglón integrado, el párrafo nuevo quedó **fuera** del comentario que lo
  precede, porque ese comentario ya cerraba con su propio fin de bloque: `PartialParsing — 5 líneas
  sin analizar` donde HEAD daba 127 limpio. **Desde afuera se ve como «SIN GEOMETRIA diam_tsvi»**,
  que es cómo se ve un `<script>` abortado — y no como un error de sintaxis.
- ⚠️ **TRES DENOMINADORES ROTOS, Y LOS TRES DABAN FALSOS PLAUSIBLES.** (1) La opción **nativa** se
  llama «Normal» en `vm_morf` y **«Trivalva normal»** en `va_morf`: con el literal cableado, `sel`
  devolvía «NO HAY OPCION Normal» y el control negativo midió la **prótesis anterior** creyendo que
  medía una nativa — informó una diferencia que era suya. (2) `im_grado` es un **`input
  type=hidden`**, no un `<select>`: el ayudante `sel()` falla y las cuatro escenas de regurgitación
  midieron el **mismo** grado; el gesto real es `valvSev.aplicar`. (3) Un denominador que mira sólo
  el `display` del nodo **no ve a sus ancestros**: la cápsula informaba «visible» con el globo
  midiendo 0×0, dentro de `#ete-seccion-valv-mitral`, que nace oculto.
- ⚠️ **Me comí el acento grave CUATRO veces**, todas en comentarios míos dentro del cuerpo de un
  caso o del template de la sonda, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta las cuatro.

### El PPM AÓRTICO al informe, la columna de la VELOCIDAD DE LA IT con la ida y vuelta del TAPSE/PSAP, el BORRADO de la estenosis aórtica y los DOS ESTADOS del cociente — «Z» (2026-10-15)

- **Es la tanda «Z».** Al **empezar**, `main` y `origin/main` estaban los dos en **`85c2aa6`**
  (sello `v20261015-1459`), **sin nada sin pushear** —confirmado con un `git fetch` de verdad—,
  con los cinco commits del G3 ya incluidos **y pusheados**. Los **cinco** commits de esta tanda
  quedan locales; el push lo corre Maicol.
  ⚠️ **LA ORDEN PEDÍA SIETE COMMITS Y SON CINCO, PORQUE DOS PARTES SON PARADAS**: el voto de los
  tres parámetros de la prótesis mitral (**Z1**) y el corte de la pantalla de TEP (**Z4-TEP**).
  Las dos se midieron y se reportan; ninguna toca una línea de código.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 1, EL 3 Y EL 4 SE REVIERTEN SOLOS Y EN CUALQUIER ORDEN ENTRE SÍ**, que en esta serie es
  raro y conviene decirlo: el 1 es el PPM aórtico (`_eaPpmAoClasificar`, la línea del informe y
  su columna), el 3 la estenosis aórtica (`eaSevVacioSync`, el `else` de `calcEADetalle`,
  `EA_FILA_GRADO` y la fila de planimetría) y el 4 el cociente (los dos estados y la tarjeta).
  Ninguno nombra nada de los otros dos.
  ⚠️ **PERO EL 2 CUELGA DEL 1 POR EL CONTEO DE COLUMNAS**: el 1 lleva el Excel de 438 a **439** y
  el 2 a **440**, y el 2 adaptó **80 renglones** de la suite (101 ocurrencias de «438»).
  Revertir el 1 sin revertir antes el 2 deja la suite entera en rojo por el denominador del
  Excel, no por un defecto. **Orden: 2 antes que 1.**
  ⚠️ **EL MENSAJE DEL COMMIT 2 DICE «73 renglones» Y SON 80**, medido con
  `git show … | grep -c '^-.*438'`. El 73 salió de un diff que compara línea contra línea por
  POSICIÓN, que subcuenta en cuanto el archivo cambia de largo. El mensaje queda como está —no se
  reescribe historia— y el número bueno es éste.
  ⚠️ **Y EL 2 LLEVA LA ADAPTACIÓN DE TC-478 (F)**, cuya condición era el **límite declarado** del
  G3 —«la velocidad de la IT NO tiene columna»— escrito para que el día que entrara se notara.
  Lo notó. Revertir el 2 sin reponer esa afirmación lo deja midiendo lo contrario.
  **El 5 es TC-479 más documentación y el sello**, y afirma el comportamiento de los cuatro:
  revertir cualquiera sin el 5 deja TC-479 en rojo.
  ⚠️ **EL 1 LLEVA LA SONDA** (`scripts/_probe_z.mjs`), que los commits 2, 3 y 4 usan.

- **Línea base al cierre: suite 489/493 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0
  ERROR, Excel en 440 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO
  a la línea base—. CERO REGRESIONES.** Los **CUATRO** rojos son exactamente los de ENTRADA —**TC-223** (el
  documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**—, y no apareció ninguno
  fuera de esa lista. **El denominador sube a 493**: esta tanda agregó **TC-479**. El `md5` de
  `index.html` no se movió durante la corrida (`0929c853…`, el del sello) y el pendrive estaba
  montado antes y después. Al terminar no quedó ningún Chrome mío.
  ⚠️ **LA SUITE COMPLETA SE CORRIÓ DOS VECES, Y LA PRIMERA NO ES LA LÍNEA BASE.** Dio **488/493**
  con **CINCO** rojos, y el quinto —**TC-302**— lo trajo esta tanda: su condición «UNA sola
  oración por válvula» cuenta como «frase de más» la línea nueva del PPM aórtico. **Ninguna
  corrida de zona podía verlo**: ese caso no está en la zona de la prótesis aórtica, sino en la
  de «el informe protésico no lleva justificación metodológica». Es la quinta tanda seguida en
  que la suite completa destapa algo que la de zona no ve.
  ⚠️ **`--todo` del chequeo de celular da 378 a 360 px y 387 a 390 px, EL MISMO PAR QUE DEJÓ EL
  G3**: ni las dos columnas nuevas ni la fila de planimetría agregan un solo hallazgo, porque
  ninguna de las dos cosas es un control de formulario.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **493 ids** sobre los 494 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261015-1459`) y se volvió a sellar:
  **`v20261015-1639`**. Todo lo medido —la suite completa, Semgrep y el chequeo de celular— salió
  **DESPUÉS** de sellar, con el `md5` quieto.
  ⚠️ **SE SELLÓ DOS VECES, Y HAY QUE DECIR POR QUÉ.** El primer sello (`v20261015-1633`) quedó
  invalidado porque **edité tres comentarios de `index.html` con la suite ya corriendo**: el
  `md5` se movió a mitad de la medición, que es exactamente lo que la regla de la casa prohíbe.
  Se cortó la corrida, se volvió a sellar y se volvió a medir sobre un árbol quieto. La primera
  corrida **no se usó para nada**.

- **Dónde está todo:** `docs/mapa/excel-origen-ida-vuelta.md` (**mapa NUEVO por PARTICIÓN**, 7,3 KB:
  los tres criterios de columna, la cadena de la ida y vuelta, el segundo eslabón que faltaba y
  los tres cambios del importador), `docs/mapa/tapse-psap-ap.md` → los dos estados, la tarjeta y
  la parada de TEP (**13,7 KB**), `docs/mapa/aortica-cortes.md` → el borrado y las cinco filas
  (**18,7 KB**), `docs/mapa/protesis-valvular.md` → el PPM aórtico (**19,6 KB**),
  `docs/mapa/informe-pdf-excel.md` → el puntero (**29,9 KB**), `docs/fuentes/FUENTES.md` → «La
  tanda Z — el cociente TAPSE/PSAP, uso por uso», y `docs/PENDIENTES.md` → **Z2, G3-1 y G1-6
  marcados CERRADOS**, **Z1 confirmada como PARADA**, más **siete** cosas declaradas.
  ⚠️ **EL MAPA DEL EXCEL SE PARTIÓ ANTES DE CRUZAR EL TECHO Y NO DESPUÉS.** `informe-pdf-excel.md`
  estaba en **29,7 KB** y esta sección lo cruzaba: medido con `wc -c` **ANTES** de escribir. Es la
  tercera vez que la regla se aplica, y la primera en que el mapa de destino no llega a cruzar.

- ⚠️ **PARADA Z1: LA ASE 2024 NO DA UNA REGLA DE INTEGRACIÓN, Y SE BUSCÓ EN CINCO LUGARES.** La
  **Tabla 11 (folio 27)** da cinco parámetros con tres bandas —leída **renderizando a 400 dpi**,
  porque la fuente codifica `≥` como `$` y `≤` como `#`—; su **nota `*`** dice que «diagnostic
  accuracy is best if **most** of the parameters listed are normal or abnormal», que es una
  afirmación sobre la **confianza** y no un umbral de conteo; el **folio 24** enumera cuatro «main
  criteria» **sin decir cuántos** hacen falta —y **omite la velocidad pico**, que la tabla sí
  incluye—; **no hay figura de algoritmo** para la estenosis protésica mitral (censadas las 27
  figuras: la 13 es la aórtica, la 16 la IAo y la 21 la IM); y los **Key Points del folio 29** no
  agregan ninguna regla. **Sin regla explícita no se inventa una**: `R.obstr` queda como estaba.
  ⚠️ **Y HAY UNA SEGUNDA RAZÓN QUE LA LECTURA DESTAPÓ:** la **nota `‡`** marca la velocidad pico,
  el gradiente medio **y el DVI** como «also abnormal in the presence of significant prosthetic
  MR». La app **ya gatea el DVI** por eso; hacer votar a los otros dos sin decidir si se los gatea
  igual reabriría el defecto que ese gate cerró — y eso tampoco está en la guía.

- **EL PPM AÓRTICO VA AL INFORME Y AL EN SUMA, CON LA FORMA DEL MITRAL.** Dueño único
  `_eaPpmAoClasificar(avai, imc)`, que **no lee nada**: sale a función propia porque
  `eaProtVeredicto` lee el DOM y la columna del Excel trabaja sobre un estudio **ARCHIVADO**.
  **NINGÚN CORTE SE MOVIÓ** —`ppm` idéntico a HEAD en las seis escenas—. Sale sólo con desajuste
  **moderado o severo**; sin desajuste no se escribe nada.
  ⚠️ **CON OBESIDAD LOS DOS CORTES BAJAN, ASÍ QUE EL MISMO INDEXADO ES MENOS GRAVE**: 0,60 es
  **severo con IMC 24** y **moderado con IMC 34**. La primera versión de la condición de TC-479 lo
  tenía al revés y el caso lo cazó.
  ⚠️ **ÚNICA DIFERENCIA CON EL MITRAL, DECLARADA: la frase dice «aórtico».** El mitral no nombra
  su válvula, y con las dos prótesis desajustadas el EN SUMA publicaría **dos oraciones idénticas
  que sólo se distinguen por el número**. `PENDIENTES.md` → Z2-1.
  ⚠️ **CON TAVI TAMBIÉN SALE**, y es correcto: la Tabla 7 no abre ramas por tipo de prótesis. Por
  eso la línea **no** cuelga de `_eaProtN.resumen`, que es `null` en la TAVI.
  **Medido con teclas reales, seis escenas por los dos IMC**, más el **control negativo** con
  válvula NATIVA y el **mismo** AVA indexada de 0,55: fila escondida, celda vacía y el informe sin
  una sola mención.

- **EL EXCEL PASA DE 438 A 440, Y LAS 438 ANTERIORES SALEN CON EL MISMO VALOR** —comparadas
  **clave por clave** en siete escenas: cero faltantes, cero sobrantes, **cero valores distintos**,
  y las dos únicas celdas que cambian son los dos textos, que llevan la línea nueva autorizada—.
  · **`Vmax IT (m/s)`**, campo de **ENTRADA**: en `LAB_XLS_MAP`, bloque 8, **índice 106**, pegada
    a `VC IT (mm)`. Dos decimales, como la Vmax aórtica.
  · **`PPM aórtico`**, **derivada SIN campo** (criterio (b) del G2): fuera del mapa, declarada por
    NOMBRE, bloque 8, **índice 124**, pegada a `AVA (cm²)`.
  **Los tres asserts de arranque del Excel corren limpios.**

- **LA IDA Y VUELTA DEL TAPSE/PSAP SE REPRODUCE — cierra G3-1 con su alternativa (a).** Medido
  exportando la fila COMPLETA y reabriendo el estudio por la ruta real de restauración, con TAPSE
  18 · Vmax IT 2,8 · VCI 18 mm / colapso >50 %: **IDA** PmAD 3 · PSAP 34 · cociente **0,529** →
  **VUELTA** PmAD 3 · PSAP 34 · cociente **0,529**, con la fila del Doppler tricuspídeo **idéntica
  letra por letra**. Un Excel **VIEJO de 438** entra «1 fila válida» y sin un error.
  ⚠️ **Y FALTABA UN SEGUNDO ESLABÓN, QUE LA MEDICIÓN DESTAPÓ Y LA LECTURA NO: `calcPmAD` no corría
  en DOS de las rutas de restauración** —`editarInforme` y `cargarEstudioPorId`— y `calcPSAP` lee
  `v('pmad')` sin derivarla. Para un estudio GUARDADO no se notaba (`pmad` viaja en `campos`); para
  uno IMPORTADO sí, porque está en `LAB_XLS_SOLO_EXPORT`. **Con la columna puesta y sin esa
  llamada, la vuelta seguía dejando la PSAP y el cociente VACÍOS.** Es idempotente —`pmad` es un
  `input readonly` con un solo dueño— y **NO va en `RECALC_MODULOS`**, por el mismo motivo que
  `calcIP`: el embudo corre además en las dos rutas de la REIMPRESIÓN.
  ⚠️ **EL MODAL DEL IMPORTADOR NO ES LA IDA Y VUELTA**: es una previsualización sobre la fila
  cruda, donde la PmAD todavía no existe. Su detalle pasó de «no se pudo recalcular: falta la PSAP
  estimada» a «se recalcula al abrir el estudio», que es lo que de verdad pasa.

- **EL RENGLÓN INTEGRADO DE LA ESTENOSIS AÓRTICA VUELVE A «SIN DATO»: 12 de 12 contra 0 de 12 en
  HEAD.** Las SEIS permutaciones de borrado por los DOS gestos, con teclas reales, sobre la escena
  del médico (Ø TSVI 20 · VTI TSVI 20 · VTI Ao 56).
  ⚠️ **ES PEOR QUE LO REPORTADO:** el borrado dígito a dígito pasa por un AVA de **0,11 cm²** —el
  «2» de «20»— y la línea se congela en **«Severa — por AVA» sobre un formulario VACÍO**.
  ⚠️ **Y NO ES UN DEFECTO DE LA TANDA F**: medido contra el árbol anterior (`0963d53`), las doce
  quedan igual de congeladas. El F sólo agregó el sufijo «— por X», que lo hace más afirmativo.
  **La causa:** `calcEADetalle` no tenía `else`, y corre dentro de la compuerta de `calcAo`, que
  deja de pasar justo cuando se borra el último dato.
  ⚠️ **Y NO SE PUEDE ARREGLAR AGREGANDO `calcEADetalle` A LAS PUERTAS DEL GESTO**: está MEDIDO y
  declarado en el comentario de `tsviDiamEditado` —después de `calcAo` le pisa el badge al retiro,
  antes el retiro no llega a actuar— y **TC-432 verifica esa prohibición sobre el texto de la
  función**. De ahí `eaSevVacioSync`, que corre en la mitad PURA y **toca el renglón y NO el
  badge**, que tiene tres dueños.
  **CONTROL NEGATIVO:** un grado fijado A MANO se respeta —queda «severa», la pastilla prendida—.

- **LAS CINCO FILAS DEL CUADRO PUBLICAN SU GRADO, Y LA PLANIMETRÍA GANA SU FILA — cierra F8.**
  Un mapa (`EA_FILA_GRADO`) y un dueño (`eaGradoCalculado`). **NINGÚN CORTE SE MOVIÓ**, medido por
  sus bordes: gradiente 19 **sin grado** / 20 moderada / 39 moderada / 40 severa; planimetría 0,90
  severa / 1,00 severa / 1,40 moderada / 1,50 **sin grado**.
  ⚠️ **«sin estenosis» NO SE IMPRIME COMO GRADO DE UNA FILA**: un AVA normal no distingue entre no
  tener estenosis y tenerla leve. Vacío es la abstención.
  ⚠️ **UNA CONTRADICCIÓN QUE ESTA TANDA HACE VISIBLE Y NO CREA**: el renglón dice «Moderada — por
  AVA por planimetría» mientras el `<select>` dice severa. **Medido IDÉNTICO en HEAD** — la rama
  `else if (ava)` etiqueta por la banda del AVA por continuidad y le pega el criterio global.
  `PENDIENTES.md` → **Z3-1**.
  ⚠️ **PARADA Z3-2: el DVI no se calcula sin el diámetro y matemáticamente no lo necesita.** El
  **criterio** (`_eaCritDvi`) **ya vota sin él**; lo que exige el diámetro es el bloque que escribe
  las filas y los dos `input readonly`. Y `ea_dvi_display` es la **primera fuente que lee
  `eaProtVeredicto`**: despegarlo cambia cuándo vota el veredicto protésico aórtico.

- **LA FILA DEL COCIENTE PASA A DOS ESTADOS**, con el corte y el operador de la **ESC/ERS 2022,
  Tabla 10** («Cociente TAPSE/PAPs < 0,55 mm/mmHg», columna «A: Ventrículos»). Tres decimales
  intactos. Medido por su borde: 0,529 y 0,544 → signo · **0,550 EXACTO** → sin signo · 0,559 → sin
  signo.
  ⚠️ **SE CITA POR NÚMERO DE TABLA Y NO POR FOLIO**: la biblioteca tiene la traducción de la SEC,
  que **pagina distinto** que el original inglés.
  ⚠️ **EL TRAMO DE 0,36 SE FUE ENTERO, CON SU CONSTANTE Y SU `window.*`.** Su corte nacía de Guazzi
  2013, que **no está en la biblioteca**: **la línea afirmaba en pantalla lo que la tarjeta ya se
  negaba a afirmar**. `PENDIENTES.md` → **G1-6 cerrado POR RETIRO**, no por verificación. Sacar el
  valor y dejar viva la línea `window.X = X` aborta el `<script>` COMPLETO — se cuentan los
  `window.X = X`, no los `grep` de X.

- **LA TARJETA ⓘ PUBLICA LOS CINCO USOS, TODOS VERIFICADOS EN TEXTO COMPLETO**, una línea por uso:
  ESC/ERS 2022 **Tabla 10** (< 0,55) · **Tabla 16** (> 0,32 / 0,19-0,32 / < 0,19, con la mortalidad
  a un año) · **ASE 2025** folios 152 y 173, los dos **comprobados en el pie impreso** (0,5-0,7 y
  0,3-0,4) · **Stassen 2022** ESC Heart Fail (TRC, < 0,45, HR 1,437) · **Wang 2024** Clin Cardiol
  (ICFEp hospitalizada, < 0,45) y **Burgos 2025** Arch Peru Cardiol Cir Cardiovasc (IC aguda con
  FEVI > 40 %, < 0,38, HR 2,21).
  ⚠️ **LA TARJETA NO LLEVA NINGUNA NOTA DE VERIFICACIÓN NI RESERVA**: la del G1 declaraba ahí mismo
  que tres cortes no se pudieron leer en su fuente primaria, y eso es estado interno del proceso.
  ⚠️ **LA SERIE DE EMBOLIA PULMONAR SE OMITE POR DECISIÓN DEL MÉDICO** (Lyhne 2024, registro RIETE,
  4.478 pacientes), **aunque SÍ está en la biblioteca y SÍ se verificó**: queda en `FUENTES.md`
  como fuente **disponible y no usada**.
  **Medido:** abre, cierra por los cuatro caminos, `<button>` sin `title` y sin `abrirAyudaEco`,
  30 acentos, cuatro bloques, y a **1200 / 390 / 360 px en los dos temas** entra entera en el
  viewport con el globo alcanzable (6 de 6). El badge resuelve naranja REAL —`rgb(245,158,66)` de
  noche y `rgb(217,123,31)` de día—, no la variable gris.

- ⚠️ **PARADA Z4-TEP, MEDIDA: EL 0,32 DE ESA PANTALLA PARTICIPA DE UN VEREDICTO.** La orden
  corregida mandaba quitar la etiqueta **sólo si** el corte no participaba del score, de la
  interpretación ni del riesgo. **No suma al score** —su bloque no tiene ni un `score++` ni un
  `criterios.push`— y **no entra en la interpretación** —`interpEl` ramifica sólo sobre `score`—
  **pero SÍ decide el riesgo**: `score >= 2 && desacoplado`. Medido con dos criterios positivos
  fijos y la PSAP en 61 mmHg: cociente **0,320** → «🔴 Disfunción VD significativa» y **0,328** →
  «🟠 Riesgo INTERMEDIO-ALTO». **El rótulo viaja además al PDF de TEP.** No se tocó nada; las
  escenas que cambiarían están una por una en `PENDIENTES.md` → **Z4-TEP**.

- **Arnés: `scripts/_probe_z.mjs`** (A/B de solo lectura con `--file`, `--dest` para capturas),
  diez grupos (`prot`, `ppm`, `excel`, `eaborra`, `eafilas`, `barrido`, `tpsp`, `tarjeta`, `tep`,
  `controles`), con teclas y clics reales, emulación de viewport y de tema, y el **importador y la
  restauración de un estudio ejecutados de verdad**.
  **Cobertura: TC-479**, **56 condiciones** —contadas instrumentando el propio caso para que
  publicara su `ex.length`— con ocho denominadores y seis controles negativos. **Verificado que
  sabe fallar contra HEAD en un worktree aparte: 35 de las 56 en rojo, y NINGUNA por excepción.**

- ⚠️ **DOS TRAMPAS DEL MEDIDOR, NO DEL ÁRBOL, Y LAS DOS DABAN FALSOS PLAUSIBLES.** (1) El globo
  del cociente vive dentro de `row-tapse-psap`, que **nace en `display:none` y sólo se dibuja con
  cociente**: sin cargar TAPSE y PSAP el botón mide 0×0 y «no abre» se lee como «el mecanismo no
  funciona». (2) El cuadro del Doppler tricuspídeo está al fondo de una página larga, así que el
  botón tiene tamaño pero su centro cae **fuera del viewport**: la medición de «el globo sigue
  alcanzable» informó **FUERA** sobre un globo que el médico ve perfectamente. Se lleva al viewport
  antes de clickear.
- ⚠️ **Y UNA TRAMPA DE MI PROPIO CASO:** una condición buscaba el literal «mal pronóstico en IC con
  FEVI» en `documentElement.innerHTML` para probar que el tramo se retiró — y **el comentario que
  explica el retiro NOMBRA esa frase**, así que salía roja sobre un arreglo correcto. Es la trampa
  que TC-476 ya pagó con la regla `.ip-ap-col2`: lo que hay que medir es la **declaración** y el
  texto **renderizado**, no una mención en prosa.
- ⚠️ **Me comí el acento grave TRES veces**, todas en comentarios míos: una en el template de la
  sonda y dos en el cuerpo de un caso, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta las tres; `node --check` apuntaba a la apertura
  del template, cientos de líneas antes.

- ⚠️ **CASOS ADAPTADOS: CINCO, con el motivo escrito en cada uno.** **TC-477 (J)** —su resta de
  columnas pasa de DOS a CUATRO; sin eso salía rojo por el denominador—, **TC-135** —las dos
  nuevas caen como BÁSICAS: 138/438 → **140/440**—, **TC-478 (F)** —era el **límite declarado**
  del G3 («la velocidad de la IT NO tiene columna»), escrito para que el día que entrara se
  notara, **y lo notó**: hoy afirma lo CONTRARIO—, **TC-476** en TRES lugares —el denominador de
  constantes, que ahora afirma que `VD_TPSP_IC_MAX` ya **no** existe; las seis escenas de los
  tramos, de las que las dos del 0,36 pasan a exigir el MISMO texto que las de arriba; y la
  condición de la tarjeta, que pasa a exigir cita por TABLA y la **ausencia** de la nota de
  verificación— y **TC-302**, arriba.
  **Más 80 renglones** de «438» a «440» (101 ocurrencias).
- ⚠️ **TC-302 SE ADAPTÓ SIN PERDER COBERTURA, Y ESO ES LA MITAD DEL ARREGLO.** Su condición de
  «UNA sola oración» es un **proxy**: existe para cazar una frase metodológica que no use
  ninguna de las nueve marcas. Descontar la línea del PPM y no agregar nada habría dejado el
  proxy más flojo, así que entró además una condición que **afirma** lo que se descontó: que la
  línea del PPM esté, que diga «aórtico» y «AEO indexada», y que **no** traiga ninguna de las
  nueve marcas.

### La FAC VISIBLE, el DIÁMETRO DE LA ARTERIA PULMONAR mudado al VD, el SELECTOR de la relación VD/VI, el PPT y el PDF de auditoría alineados y el MENSAJE del importador — «G3» (2026-10-15)

- **Es la tanda «G3».** Al **empezar**, `main` y `origin/main` estaban los dos en **`91c5fe9`**
  (sello `v20261015-1336`), **sin nada sin pushear** —confirmado con un `git fetch` de verdad—,
  con los cuatro commits del G2 y su commit de documentación ya incluidos **y pusheados**. Los
  **cinco** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 1 Y EL 2 TOCAN LA MISMA GRILLA Y EL 2 TIENE QUE REVERTIRSE ANTES.** El 2 mete el
  `<select>` DENTRO del `.fg` de `vd_vi`, que el 1 no creó pero sí renumeró; y sobre todo el 2
  reescribe la línea de `limpiarCampos` que el 1 agregó para `vdFacReqSync` —las dos llamadas
  quedaron contiguas—. Revertir el 1 primero deja la del selector apuntando a un bloque que ya
  no está.
  ⚠️ **EL 3 Y EL 4 SE REVIERTEN SOLOS Y EN CUALQUIER ORDEN ENTRE SÍ**, que en esta serie es
  raro y conviene decirlo: el 3 es el Laboratorio (`_labValvFila`, `LAB_VALV_BIN_NOTA` y sus
  tres consumidores) y el 4 el importador (`LAB_XLS_CALC_ORIGEN`, `_labXlsCalcMsg`, el censo de
  derivadas y el detalle). Ninguno nombra nada del otro ni de los dos primeros.
  ⚠️ **PERO EL 2 LLEVA LA SONDA** (`scripts/_probe_g3.mjs`), que los commits 3, 4 y 5 usan:
  revertirlo los deja sin arnés. Nació en el 2 y no en el 1 porque el 1 se cerró antes de
  escribirla — está dicho para que nadie la busque en el 1.
  **El 5 es TC-478 más documentación y el sello**, y afirma el comportamiento de los cuatro:
  revertir cualquiera sin el 5 deja TC-478 en rojo.
  ⚠️ **Y EL 1, EL 2 Y EL 3 ADAPTARON TC-476 Y TC-477**: el conteo de campos de la grilla (15 →
  16), las reglas de posición (8 → 9), las tres condiciones de la casilla de la FAC, el literal
  de la categoría A de la probabilidad de HTP y el límite declarado (J) del G2. Revertir sin
  reponer esas afirmaciones los deja en rojo o midiendo lo contrario.

- **Línea base al cierre: suite 488/492 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0
  ERROR, Excel en 438 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO
  a la línea base—.** **CERO REGRESIONES**: los cuatro rojos son exactamente los de ENTRADA
  —**TC-223** (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**—, y no
  apareció ninguno fuera de esa lista. La de ENTRADA, medida en un worktree aparte sobre el
  árbol limpio antes de tocar nada, fue **487/491** con esos mismos cuatro. **El denominador
  sube a 492**: esta tanda agregó **TC-478**. El `md5` de `index.html` no se movió durante la
  corrida (`131f8c5e…`, el del sello) y el pendrive estaba montado antes y después —los
  diecisiete de **TC-181…TC-197** salieron verdes, que es la prueba—. Al terminar no quedó
  ningún Chrome mío.
  ⚠️ **`--todo` del chequeo de celular pasa de 375/384 a 378/387: +3 `input-chico` (BAJA)**, y
  los tres tienen nombre. Dos son controles nuevos a la vista —el **selector de VD/VI** y la
  **casilla de la FAC**, que desde el G3 ya no se esconde— y el tercero es el **diámetro de la
  arteria pulmonar**, que no es nuevo: se mudó del cajón «Datos» de la pulmonar, que
  `check_mobile.js` **no abre**, a la pestaña VD, que sí. Es el espejo exacto de lo que el G1
  documentó al bajar la cuenta. **La cuenta VISIBLE, que es la que compara la línea base, no se
  movió**, y se midió HEAD el MISMO día para poder restar (375/384, `input-chico` 332).
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **492 ids** sobre los 493 casos del archivo.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261015-1336`) y se volvió a sellar en el
  commit 5: **`v20261015-1459`**. Todo lo medido —la suite completa, Semgrep y el chequeo de
  celular— salió **DESPUÉS** de sellar, con el `md5` quieto.

- **Dónde está todo:** `docs/mapa/vd-vi-selector.md` (**mapa NUEVO por PARTICIÓN**, 8,7 KB),
  `docs/mapa/vd-derecho.md` → la sección G3 entera (**34,4 KB**),
  `docs/mapa/laboratorio-asociaciones-valvulas.md` → el PPT y el PDF alineados (**13,6 KB**),
  `docs/mapa/informe-pdf-excel.md` → el mensaje del importador y la parada (**29,7 KB**),
  `docs/mapa/tapse-psap-ap.md` → el puntero del campo que se mudó, `docs/fuentes/FUENTES.md` →
  por qué esta tanda **no lleva ninguna cita nueva**, y `docs/PENDIENTES.md` → **G2-2 y G2-3
  marcados CERRADOS** más **seis** cosas declaradas (**G3-1 a G3-6**).
  ⚠️ **`vd-derecho.md` QUEDÓ A 600 BYTES DEL TECHO** (34,4 de 35 KB) y eso es **con** la
  partición ya hecha: la sección del selector salió a archivo propio justamente porque con todo
  junto cruzaba. **La próxima tanda que lo toque tiene que partirlo.** `PENDIENTES.md` → G3-5.

- **LA FAC VUELVE A ESTAR VISIBLE, COMO ANTES DEL G1, Y AHORA DICE QUÉ LE FALTA.** El G1 la
  escondía hasta que hubiera dato; lo que entra con ella es `vdFacReqSync`, que escribe el
  motivo en el **placeholder** —mecanismo de los dos campos `vauto-` del VI— con **tres ramas**:
  las áreas que faltan nombradas **una por una**, el par no utilizable con su propio texto, y
  vacío cuando hay FAC. **El predicado de «par utilizable» no se reescribe: se lo pasa `calcVD`**,
  que es su dueño.
  ⚠️ **LA FILA DEL CUADRO SIGUE ESCONDIÉNDOSE SIN DATO**, y es otra cosa: una casilla vacía
  invita a cargar, una fila de interpretación vacía afirma que no hay nada que interpretar.
  **Cómo se guardaba antes del G1: igual que hoy** —el campo nunca dejó de existir con su id, el
  G1 sólo movía el `display` de su `.fg`— y **la columna «FAC VD (%)» del Excel queda idéntica**,
  porque la calcula el exportador desde las dos áreas y no lee el campo.
  **Medido con teclas reales:** sin áreas nombra las dos · con una nombra **sólo** la que falta ·
  con las dos publica 40 y **vacía** el mensaje · con el par invertido lleva el texto propio ·
  «Nuevo estudio» lo repone. **`vd_fac` es READONLY y la sonda se niega a mandarle una tecla.**

- **EL DIÁMETRO DE LA ARTERIA PULMONAR SE MUEVE, NO SE DUPLICA.** Del `.grid-2` de la
  insuficiencia pulmonar al **tercer lugar de la columna 3** del VD. Conserva el id
  `ip_ap_diam`, el dueño `ipApDiamVal`, la banda `IP_AP_BANDA` `[5,80]`, la marca, la columna de
  Excel del G2 y su `oninput`, que llama **sólo** a `ipApDiamSync` — ni `calcIP` ni `calcVD`.
  **Medido: con los cuatro signos de la IP cargados, grado, referencia e informe IDÉNTICOS con
  y sin él**, con el denominador comprobado (la escena produce «Severa» de verdad).
  ⚠️ **CON ÉL SE RETIRÓ LA REGLA `.ip-ap-col2`**: ese `.grid-2` vuelve a **DOS hijos** en una
  sola fila y **sin el hueco** que quedaba debajo del THP. Medido.

- **LA GRILLA PASA A DIECISÉIS CAMPOS Y GANA LA NOVENA REGLA (`vd-r6`).** La columna 3 tiene
  SEIS y las otras dos CINCO, así que debajo de la FEVD y de la pared queda un hueco.
  ⚠️ **ES LO QUE HACE IMPRESCINDIBLE LA POSICIÓN EXPLÍCITA HOY, Y POR OTRO MOTIVO QUE EN EL G1**:
  allá era que la casilla de la FAC se escondía, y hoy esa casilla está siempre visible — lo que
  la sostiene ahora es el desbalance de columnas.
  **Medido a 1200 / 390 / 360 px en los DOS temas**: 3 columnas arriba de 768 px y 1 abajo, los
  dieciséis a **318 / 328 / 298 px, los MISMOS anchos que HEAD**, cero solapamientos, cero
  desbordes y sin scroll horizontal. Tab con **teclas reales**, y **hoy el recorrido es el MISMO
  con y sin las áreas cargadas**: en HEAD, sin ellas, saltaba la casilla de la FAC.

- **EL SELECTOR DE VD/VI CONVIVE CON EL NÚMERO Y TIENE UN DUEÑO ÚNICO.** Cuatro reglas, todas en
  `vdViSelSync`: con número muestra el derivado y queda `disabled`; sin número el médico elige;
  escribir un número pisa la elección; borrarlo devuelve a «—» **si lo había escrito la app** y
  respeta la del médico si fue suya —lo distingue `dataset.auto`, que no se persiste—.
  `vdViEstado(src)` devuelve «alterada» / «no alterada» / «sin dato» y lo leen los **cuatro**
  consumidores: la categoría A de `_htp2022Core`, la fila del cuadro, el PDF y el PPT.
  ⚠️ **LA RAMA `src` NO ES UN ADORNO**: `_htp2022Core` corre también sobre estudios ARCHIVADOS
  —el panel de cohorte— y ahí no hay formulario que leer. Medido sobre registros: las dos
  fuentes, y **con los dos cargados manda el NÚMERO**.
  **El corte no se movió** (`VD_VI_HTP_MIN`, `>`) y **el borde 1,00 EXACTO es «≤ 1» en los dos
  controles**, que es lo que impide que discrepen. **Con número, los cuatro lectores salen
  IDÉNTICOS a HEAD** en las cinco escenas, con el PDF generado de verdad.
  ⚠️ **DOS FORMAS DEL RÓTULO**, `≤ 1` y `<= 1`: el PDF se dibuja en helvetica y esa tabla ya
  escribe sus referencias en ASCII.
  **SIN columna de Excel** (438 con y sin él); **sí** se guarda con el estudio.
  ⚠️ **UN DEFECTO QUE ENCONTRÓ LA SONDA Y NO LA LECTURA**: `limpiarCampos` dejaba el selector
  `disabled` PARA SIEMPRE tras un «Nuevo estudio», porque borra el número sin pasar por
  `RECALC_MODULOS` ni por `calcVD`. Es la **cuarta** vez que esta pestaña paga la misma trampa.

- **EL PPT ESTADÍSTICO Y LA MINI-TABLA DEL PDF DE AUDITORÍA, ALINEADOS — cierra G2-3.** Medido
  en HEAD con el PPT y el PDF **generados de verdad**: el PPT publicaba `Esten. Mitral …
  Moderada 0 (0 %)` y `Esten. Tricusp. 2 | 1 | 0 | 0`, y el PDF `Esten. Tricusp. (n = 3) 2 | 1 |
  0 | 0` — «1 leve» sobre una válvula que la app no gradúa, con **las dos significativas FUERA
  de la fila**, mientras la pantalla decía `ET | — | — | — | 2` sobre esos MISMOS estudios.
  Hoy las **tres** superficies leen el mismo dueño, **`_labValvFila`**, y la frase que declara
  las binarias es **una** constante, `LAB_VALV_BIN_NOTA`, donde había tres literales.
  ⚠️ **`counts` Y `bases` NO SE TOCAN**, y por eso las **SEIS lesiones ajenas salen IDÉNTICAS a
  HEAD** en el PPT y en el PDF —medido—: sin entrada binaria el dueño devuelve exactamente lo
  que cada consumidor calculaba. El `n` de la tricúspide pasa de **3 a 6** en el PDF, que es el
  conteo correcto.
  ⚠️ **EL n POR FILA NO SE AGREGÓ AL PPT**: su tabla no lo lleva en ninguna de las ocho y
  agregarlo cambiaría las SEIS que la orden congela. `PENDIENTES.md` → G3-3.

- **EL IMPORTADOR DA UN MENSAJE COMÚN PARA LAS 93 COLUMNAS CALCULADAS — cierra G2-2.** Medido en
  HEAD: las **75 derivadas SIN campo** caían en «no corresponde a un campo editable» —que suena
  a «no la reconozco» sobre una columna que la propia app exporta— y las **18 CON campo** en «un
  valor que la app calcula sola». Hoy las dos familias reciben el mismo texto, con los **datos
  de origen** de cada una, y **cero columnas** quedan en «ignoradas».
  ⚠️ **EL CENSO DE LAS 75 SE CALCULA Y NO SE CABLEA**: se pregunta por lo que `_labExcelRow`
  emite y se le resta el mapa. Una lista de 75 nombres se desactualiza con la primera columna
  derivada que entre.
  **Un solo dueño, `_labXlsCalcMsg`**, que publican el modal y el comentario de celda de la
  plantilla, que decían lo mismo con dos redacciones.
  ⚠️ **LO QUE NO ESTÁ EN `LAB_XLS_CALC_ORIGEN` NO SE INVENTA**: cae al texto común sin la lista.
  Inventar un origen manda al médico a corregir el campo equivocado. `PENDIENTES.md` → G3-4.

- ⚠️ **PARADA MEDIDA Y NO ARREGLADA: LA IDA Y VUELTA DEL TAPSE/PSAP NO SE REPRODUCE.** Se
  exportó la fila COMPLETA de **438 columnas** de un estudio y se la reimportó tal cual: el
  cociente **no se puede recalcular**, porque la **velocidad máxima de la insuficiencia
  tricuspídea no tiene columna** —censado: `vmax_it` no está en `LAB_XLS_MAP`, y las dos que la
  contienen, `PSAP (mmHg)` y `Grad VD-AD (mmHg)`, son CALCULADAS y no se importan—. La cadena es
  `TAPSE/PSAP ← TAPSE + PSAP ← VRT + PmAD`; el TAPSE viaja y la PmAD se deriva de la VCI, que
  también viaja. Las dos alternativas —una columna de origen (PARADA de columna, 439) o aceptar
  el valor del archivo marcado como «importado»— van a `PENDIENTES.md` → **G3-1**, para que las
  decida Maicol. **Lo que sí se hizo** es que el modal lo DIGA con todas las letras: «falta la
  velocidad máxima de la insuficiencia tricuspídea, que NO tiene columna en este Excel».

- **CONTROL NEGATIVO MAYOR, con el formulario vacío y con escenario CARGADO: 0 diferencias
  contra HEAD** en informe (tres estilos), EN SUMA, **Excel en 438 columnas con su hash y clave
  por clave**, grados y pastillas de las ocho lesiones, diastólica, HFA-PEFF, PPT y el **PDF del
  informe generado de verdad**. Medido en los commits 2, 3 y 4.

- **Arnés: `scripts/_probe_g3.mjs`** (A/B de solo lectura con `--file`, `--dest` para capturas),
  ocho grupos (`campos`, `fac`, `apd`, `vdvi`, `valv`, `import`, `controles`, `captura`), con
  teclas y clics reales, emulación de viewport y el **PPT estadístico, el PDF de auditoría, el
  PDF del informe y el importador ejecutados de verdad**.
  **Cobertura: TC-478**, **66 condiciones** —contadas instrumentando el propio caso para que
  publicara su `ex.length`— con siete denominadores y seis controles negativos. **Verificado que
  sabe fallar contra HEAD en un worktree aparte: 41 de las 66 en rojo, y NINGUNA por excepción.**
- ⚠️ **CASOS ADAPTADOS: DOS, con el motivo escrito en cada condición.** **TC-476** (las reglas
  de posición 8 → 9, los campos 15 → 16 en tres condiciones, y las **tres** de la casilla de la
  FAC, que pasan a afirmar lo CONTRARIO de lo que afirmaban; más el literal
  `vdvi > VD_VI_HTP_MIN`, que ya no existe) y **TC-477** (su condición **(J)** era un **límite
  declarado** del G2 —«el PPT y la mini-tabla leen counts y no bin»— escrito para que el día que
  se cerrara se notara, **y lo notó**).

- ⚠️ **UNA REGLA DE CSS RETIRADA SIGUE EN EL FUENTE SI LA NOMBRA UN COMENTARIO.** La primera
  condición nueva de TC-476 buscaba `.ip-ap-col2` y salía roja porque el comentario que explica
  el retiro la nombra. Lo que hay que buscar es la **declaración** completa.
- ⚠️ **NO HAY UN `recolectarCampos` GLOBAL.** La primera versión de TC-478 lo llamaba y dos
  condiciones salieron rojas con «EXC» y «SIN FILA» **sobre un árbol perfecto**. El patrón de la
  casa es el barrido de `input[id], select[id], textarea[id]`, que es lo que usa TC-316.
- ⚠️ **`labPPTEstadistico` Y `labAnalisisPDF` NO SE PUEDEN MEDIR DIRECTO**: el primero exige
  tarjetas tildadas con «☐ PPT» y abre un modal, y el segundo lee `labGetInformes` y avisa por
  toast. Los generadores que toman la población directo son **`_labPPTGenerar(infs, opts)`** y
  **`_labAnalisisPDFReal(infs)`**, y `_labPptGruposActivos` se sustituye para que la diapositiva
  de valvulopatías exista. La primera corrida informó **`nTablas: 0`** sobre un PPT que sí sabe
  generarse.
- ⚠️ **EL PPT CLÍNICO SÍ QUEDÓ SIN GENERAR, Y SE DECLARA.** `generarPPT(id)` exige un estudio
  guardado, un informe narrativo ya escrito y DOS modales encadenados. Su fila «VD/VI» se mide
  **por el fuente** —que llame a `vdViTexto`— y el valor por el dueño; la del PDF se genera de
  verdad. `PENDIENTES.md` → G3-6.
- ⚠️ **Me comí el acento grave TRES veces**, todas en comentarios míos dentro del cuerpo de un
  caso o del template de la sonda, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta las tres; `node --check` apuntaba a la
  apertura del template.

### El EXCEL en 438 columnas, el ALIAS «PHT»→«THP», las asociaciones del TAPSE/PSAP y las dos estenosis BINARIAS del Laboratorio — «G2» (2026-10-15)

- **Es la tanda «G2».** Al **empezar**, `main` y `origin/main` estaban los dos en **`1e8125f`**
  (sello `v20261015-0715`), **sin nada sin pushear** —confirmado con un `git fetch` de verdad—,
  con los cinco commits del G1 ya incluidos **y pusheados**. Los **cuatro** commits de esta tanda
  quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 4 → 3 → 2 → 1.**
  ⚠️ **EL 2 Y EL 3 CUELGAN DEL 1, Y POR PIEZAS DISTINTAS.** El 2 usa `vdTapsePsapRed`, que **nace
  en el 1**: revertir el 1 primero deja las cuatro asociaciones llamando a una función que no
  existe, y como `A_TPSP` se evalúa al construir `ASSOC_A`, eso es un **`ReferenceError` de nivel
  superior que aborta el `<script>` COMPLETO** —la app sin pestañas—. El 3 cuelga del 1 sólo por
  la sonda.
  ⚠️ **EL 3 SE REVIERTE SOLO respecto del 2** (uno es el Laboratorio-asociaciones y el otro el
  Laboratorio-válvulas, y no se nombran), **pero el 1 LLEVA LA SONDA** (`scripts/_probe_g2.mjs`),
  que los tres usan.
  **El 4 es TC-477 más documentación y el sello**, y afirma el comportamiento de los tres:
  revertir cualquiera sin el 4 deja TC-477 en rojo.
  ⚠️ **Y EL 1 ADAPTÓ 65 RENGLONES DE «436» MÁS TC-135 Y TC-476**: revertirlo sin reponer esos
  números deja la suite entera en rojo por el denominador del Excel, no por un defecto. **El 3
  adaptó TC-142.**

- **Línea base al cierre: suite 487/491 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0
  ERROR, Excel en 438 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO
  a la línea base—.** **CERO REGRESIONES**: los cuatro rojos son exactamente los de ENTRADA
  —**TC-223** (el documentado, falla por la fecha: su condición informa «2026-10-15»),
  **TC-376**, **TC-390** y **TC-406**—, y **no apareció ninguno fuera de esa lista**, así que no
  hubo nada que repetir solo por CDN ni por orden de corrida. La de ENTRADA, medida sobre el
  árbol limpio antes de tocar nada, fue **486/490** con esos mismos cuatro. **El denominador sube
  a 491**: esta tanda agregó **TC-477**. El `md5` de `index.html` no se movió durante la corrida
  (`4d95fd14…`, idéntico al empezar y al terminar) y el pendrive estaba montado antes y después.
  ⚠️ **`--todo` del chequeo de celular da 375 a 360 px y 384 a 390 px, EL MISMO PAR QUE DEJÓ EL
  G1**: ni las dos columnas del Excel ni la lectura binaria agregan un solo hallazgo, porque
  ninguna de las dos cosas es un control de formulario. **La cuenta VISIBLE tampoco se movió.**
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **491 ids** sobre los 492 casos del archivo, y
  por eso el total es sobre 491 y no sobre 492.
  ⚠️ **ESTA CIFRA SE MIDIÓ EN UNA SEGUNDA SESIÓN, Y HAY QUE DECIR POR QUÉ.** Al cerrar la tanda
  el pendrive **se había desmontado** —estaba MONTADO al abrir, y con él se midió la de entrada—
  así que la corrida se detuvo **antes de empezar**, como manda la regla, y la línea base quedó
  pendiente. Con el pendrive afuera habrían caído además los **diecisiete** de **TC-181…TC-197**,
  que son ENTORNO: restar esas dos cifras daría una «regresión» de 17 casos que no existe, que es
  el falso que este archivo ya documenta dos veces. Se volvió a medir con el pendrive puesto,
  sobre el MISMO árbol (`md5` `4d95fd14…`, sello `v20261015-1336`, los cuatro commits intactos).
  **Lo que ya se había medido al cerrar la tanda**, y que esta corrida confirma: **16/16 en la
  zona**, Semgrep y el chequeo de celular.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261015-0715`) y se volvió a sellar en el
  commit 4: **`v20261015-1336`**. Todo lo medido —los 16 casos de la zona, la suite completa,
  Semgrep y el chequeo de celular— salió **DESPUÉS** de sellar, con el `md5` quieto
  (`4d95fd14…`).

- **Dónde está todo:** `docs/mapa/laboratorio-asociaciones-valvulas.md` (**mapa NUEVO**, 10,9 KB:
  el dueño del cociente, qué hace el módulo con una variable sesgada, las cuatro entradas, la
  población propia, el aviso de par acoplado, el reparto `counts`/`bin`, los dos defectos que
  cierra y las siete trampas), `docs/mapa/informe-pdf-excel.md` → las dos columnas, los **dos
  criterios de derivada** y el alias (**25,6 KB**), `docs/mapa/tapse-psap-ap.md` y
  `docs/mapa/laboratorio-estenosis-mitral.md` → sendos punteros, `docs/fuentes/FUENTES.md` → por
  qué esta tanda **no lleva ninguna cita nueva**, y `docs/PENDIENTES.md` → **D2-3 y G1-10
  marcados CERRADOS** más **siete** cosas declaradas (**G2-1 a G2-7**).

- **EL EXCEL PASA DE 436 A 438, Y LAS 436 ANTERIORES SALEN CON EL MISMO VALOR.** Comparadas
  **CLAVE POR CLAVE** con el renombre mapeado, con escenario cargado y con el formulario vacío:
  cero faltantes, cero sobrantes y **CERO valores distintos**.
  · **`TAPSE/PSAP (mm/mmHg)`**, bloque **5**, índice **51**, tras `DisfSist_VD`.
  · **`Diámetro arteria pulmonar (mm)`**, bloque **8**, índice **100**, tras `IP etiología`.
  **Los tres asserts de arranque del Excel corren limpios.**
  ⚠️ **NINGÚN CONSUMIDOR LEE ESTE EXCEL POR POSICIÓN, Y SE RE-VERIFICÓ:** el export arma un
  objeto y lo ordena `_labOrdenarCols`, el importador lee por **nombre de encabezado**, y
  CeiboAnalytics no lo lee (cero `XLSX.read`). Las cinco apps hermanas que sí leen Excel tienen el
  suyo: `ergosmart` y `ecoestres` por nombre, y `datasmart`, `ecovoz` y `Resistsmart` con
  `header:1` pero sobre **su propio** dataset genérico, nombrando columnas por la fila 1. Por eso
  las dos nuevas pudieron ir **junto al VD y a la pulmonar** y no al final.

- ⚠️ **HAY DOS CRITERIOS DE COLUMNA DERIVADA EN LA CASA Y HABÍA QUE ELEGIR.** (a) con CAMPO
  —`PSAP (mmHg)`, `AVm THP`, `AVA`— están en `LAB_XLS_MAP` y se apartan por
  `LAB_XLS_SOLO_EXPORT`; (b) SIN campo —`FAC VD (%)`, `DisfSist_VD`, `DD_I`— **no** están en el
  mapa y se declaran en `LAB_XLS_BLOQUES`. **El cociente no tiene campo en el DOM, así que sigue
  el (b)**; el diámetro es un campo de ENTRADA y **sí se reimporta**. La diferencia menor queda
  declarada: el mensaje del importador para el cociente es «no corresponde a un campo editable» y
  no el más informativo de la PSAP. `PENDIENTES.md` → **G2-2**.

- **EL DUEÑO DEL COCIENTE GANÓ UNA RAMA `src` Y UN DUEÑO DE PRECISIÓN**, con el patrón de
  `emContFueraBanda(src)`: sin argumento lee el FORMULARIO, con un objeto `campos` lee un estudio
  ARCHIVADO. **El predicado `!t || !p` no cambió en ninguna de las dos ramas**, porque `calcTEP`
  lo lee desde el G1. Y `vdTapsePsapRed` + `VD_TPSP_DEC` son hoy el único dueño del redondeo a
  tres decimales: la fila de la pantalla dejó de repetir su `Math.round(x * 1000)`. **Medido por
  sus bordes**: 18/50 → `0.36`, 18/51 → `0.353`, 22/40 → `0.55`; **vacía —no 0— sin TAPSE o sin
  PSAP**.

- **EL ALIAS «PHT» → «THP» CIERRA D2-3, Y NO CAMBIA EL NÚMERO DE COLUMNAS.** Los dos encabezados
  pasan al nombre nuevo con el viejo en el **cuarto elemento** de `LAB_XLS_MAP`, que es el
  mecanismo que esa entrada proponía. **Medido con el importador de verdad**: un Excel con los dos
  nombres viejos entra con «1 fila válida» y **sin ninguna columna ignorada**; con los nuevos
  también; y un Excel VIEJO de 436 sin las dos columnas entra sin error.
  ⚠️ **EL PREFIJO DEL BLOQUE 8 TUVO QUE SEGUIR EL RENOMBRE** (`'PHT IAo'` → `'THP IAo'`): sin eso
  la columna caía al bloque «18 · OTRAS COLUMNAS». Lo caza `_labXlsAssertBloques`.

- **QUÉ HACE ESTE MÓDULO CON UNA VARIABLE SESGADA — MEDIDO, NO SUPUESTO: NO LA TRANSFORMA NI LA
  CATEGORIZA.** Censo del bloque: **cero `Math.log`, cero prueba de normalidad**, y sus cuatro
  pruebas son no paramétricas (Spearman, Mann-Whitney, Kruskal-Wallis y chi²). Spearman trabaja
  por RANGOS, así que es invariante a cualquier transformación monótona: categorizar el cociente
  en sus tres tramos le quitaría información sin ganar robustez. Entra **crudo**.

- **LAS CUATRO ASOCIACIONES, CON SU n REAL.** FEVI, E/e′ y Vol AI indexado por **Spearman**; el
  **grado de IT** por **Kruskal-Wallis**, porque son cuatro categorías ordinales —y sus grupos
  salen de `_labRegurgSev`, el mismo dueño que cuenta la tabla de válvulas—. **Medido con 14
  estudios CON cociente y 6 SIN: las cuatro publican n = 14 y no 20.**
  ⚠️ **POBLACIÓN PROPIA (`A_POBL.tpsp`) Y NO `todos`, Y ESO ES LO QUE HACE VISIBLE EL SESGO:** con
  `todos`, el `nPob` del detalle habría contado la cohorte entera y el lector no tendría forma de
  saber que la mitad nunca entró. La advertencia es **una sola constante** (`A_NOTA_SESGO`) y no
  cuatro copias.
  **CONTROL NEGATIVO:** con los SEIS que no tienen cociente, las cuatro dan **n = 0** y no
  publican resultado.

- **EL AVISO DE PAR ACOPLADO: EL BLOQUE ARMADO NO OFRECE ESOS PARES Y EL LIBRE SÍ LOS AVISA.**
  Familia nueva `_LIBRE_ACOPLADOS`, **aparte** de `_LIBRE_COMPONENTES`, porque un COCIENTE contra
  uno de sus factores no es un puntaje contra su componente y la frase «es uno de los criterios
  que PUNTÚAN X» sería falsa. Medido: avisa con el cociente contra el TAPSE (ρ 0,72) y contra la
  PSAP (ρ −0,34), y **NO** avisa contra la FEVI ni en el par de control FEVI-PSAP.
  ⚠️ **`_libreCircular` DEVUELVE DOS FORMAS, `corta` y `larga`, Y NO UNA**: los dos sitios que
  publican el aviso usaban textos **distintos**, así que una sola frase le habría cambiado el
  wording a uno de los dos pares que ya existían. **Medido: el texto de `hfpeff – E/e′`, el de
  `amil – TAPSE` y el del par sin datos salen IDÉNTICOS a HEAD.**

- ⚠️ **ESCENA QUE CAMBIA CONTRA HEAD, DECLARADA: el p AJUSTADO de «PSAP – TAPSE» pasa de 0,449 a
  0,829** en la población de la sonda. **No es un defecto**: el ajuste BH corre sobre la familia
  del bloque, que pasó de 9 a 13 entradas — «la multiplicidad la genera el haber mirado, no el
  haber mostrado», dice el propio comentario de `_bh`. **El p CRUDO no se mueve.**
  `PENDIENTES.md` → **G2-5**.

- **LAS DOS ESTENOSIS BINARIAS, Y `counts` NO SE TOCÓ.** La MITRAL publica «Mod» con un **guion**
  y no con un cero, y la TRICÚSPIDE sólo «Sev» = «Significativa». La lectura binaria viaja en una
  estructura **PARALELA** (`bin`, aditiva) que consumen **sólo** la tabla y el apilado: **el PPT
  estadístico y la mini-tabla del PDF de auditoría salen IDÉNTICOS a HEAD por CONSTRUCCIÓN**, no
  por una medición a posteriori. **Medido: `counts` y `bases` byte por byte iguales en las tres
  escenas**, y las SEIS lesiones ajenas con sus cuatro cubetas numéricas intactas.
  ⚠️ **`_labEstenSev` NO SE TOCA**: lo leen además el filtro de cohorte, el buscador y la
  mini-tabla del PDF por lesión.

- ⚠️ **EL CASO DEL MÉDICO REPRODUCE, Y HAY DOS DEFECTOS Y NO UNO.** Medido en HEAD: (1) con un
  `et_grado` **LEGADO** «Leve» la fila decía `ET | 2 | 1 | 0 | 0`, o sea el Laboratorio rotulaba
  «leve» una válvula que la app ya no gradúa — exactamente lo que el médico vio; (2) **peor, y
  nadie lo había visto**: con los tokens **VIGENTES**, `_labEstenSev('Significativa')` devuelve
  **`null`** —«significativa» no contiene la subcadena «sin»— así que **dos estenosis
  tricuspídeas significativas quedaban FUERA de la fila**. No es un rótulo equivocado: es una
  pérdida silenciosa. Hoy la fila dice `ET | — | — | — | 2`.
  ⚠️ **LOS TRES GRADOS LEGADOS NO SE TRADUCEN**: mapear «Severa» a «Significativa» sería inventar
  una equivalencia que la guía no hace, que es el mismo argumento con el que la tanda del
  2026-10-05 decidió **no migrar** esos estudios. Cuentan en la base y no se afirman.

- **LOS DOS DENOMINADORES SE DECLARAN Y NO SE UNIFICAN** (decisión de la orden): la tabla cuenta
  sobre el **total del período** y el gráfico propio de la estenosis mitral deja **fuera** los
  estudios sin dato. Cada uno publica su `n` en su propio pie, y el de la tabla nombra el del
  otro. **CAPTURA PNG en los DOS temas, con `md5` distinto** —o sea que `light-mode` quedó puesta
  de verdad— y mirada: los guiones se ven y los acentos del pie están completos.

- **CONTROL NEGATIVO MAYOR, con escenario CARGADO y con el formulario vacío: informe en los tres
  estilos, EN SUMA, PPT, PDF (865 textos, idénticos) y los ocho grados con sus ocho pastillas
  salen IDÉNTICOS a HEAD** en los tres commits.

- **Arnés: `scripts/_probe_g2.mjs`** (A/B de solo lectura con `--file`, y `--dest` para las
  capturas), nueve grupos (`excel`, `import`, `alias`, `asoc`, `libre`, `valv`, `captura`,
  `teclas`, `controles`), con el importador y el PDF **ejecutados de verdad**.
  **Cobertura: TC-477**, **57 condiciones** —contadas instrumentando el propio caso para que
  publicara su `ex.length`— con seis denominadores y seis controles negativos. **Verificado que
  sabe fallar contra HEAD en un worktree aparte: 40 de las 57 en rojo, y NINGUNA por excepción.**
- ⚠️ **TC-477 MORÍA POR EXCEPCIÓN CONTRA HEAD EN SU PRIMERA VERSIÓN** (`vc.bin[iET]` sobre un
  `bin` que allá no existe), **con la lección escrita en su propia cabecera**. Toda lectura de
  `bin` va por un ayudante con centinela. Misma lección que TC-455, TC-462, TC-465, TC-471,
  TC-473, TC-474 y TC-475.
- ⚠️ **CASOS ADAPTADOS: TRES**, con el motivo escrito en cada uno, más **65 renglones** de «436» a
  «438». **TC-135** (las dos nuevas caen como BÁSICAS: 136/436 → **138/438**, y las dos cuentas
  crecen igual, que es lo que ese caso vigila), **TC-476** (su condición «NINGUNA nombra la
  arteria pulmonar» era el **límite declarado del G1**, escrito para que el día que entrara se
  notara — y lo notó) y **TC-142** (su escena usaba el token legado `'Severa'` de la tricúspide y
  pasa al vigente; su condición «quedan en Sin» pasa a exigir el guion). **TC-472** pasa a afirmar
  lo contrario de lo que afirmaba, **por los dos lados**: los tres encabezados dicen THP **y** el
  importador sigue encontrando los dos nombres viejos por alias.
  ⚠️ **El título de TC-470 conserva su «(436 columnas)»**: es un renglón histórico de esa tanda.

- ⚠️ **TRES TRAMPAS DEL MISMO TIPO, Y LAS TRES DABAN MEDICIONES FALSAS Y PLAUSIBLES: UNA `let` DE
  MÓDULO NO ES UNA PROPIEDAD DE `window`.** (1) `_labImpDatos` — la sonda informó «hay: false» en
  las cuatro escenas del importador sobre un importador que funcionaba; se lee el **modal** que
  `labImpRender` pinta. (2) `valvSevConfirmada` — `generarPDF` abría la tarjeta de severidad y el
  PDF salía con **0 textos**; se entra por `_pdfAjustarA4`, que el comentario de `generarPDF`
  declara como el único camino de todos sus llamadores. (3) Es la misma trampa que `ECO_AYUDA` ya
  tiene escrita.
- ⚠️ **UN `ReferenceError` DE NIVEL SUPERIOR ABORTA EL `<script>` COMPLETO, Y SEMGREP NO LO VE.**
  La primera versión de la nota de sesgo nombraba una constante **sin declarar**: `labAsocARender`
  quedaba `undefined` y la app cargaba sin asociaciones. Semgrep dio **127 / 0 ERROR** igual —no
  es un error de sintaxis—. Lo dieron la **sonda** (con «SIN labAsocARender» en las once escenas,
  en vez de reventar) y la **consola del navegador**, con la línea exacta.
- ⚠️ **LA TARJETA «VALVULOPATÍAS» VIVE EN LA SUBTAB «MEDICIONES», NO EN «GENERAL».** Una captura
  tomada tras `labSubTab('general')` sale de **otra pantalla**, con la tabla pintada en un panel
  con `display:none`. Lo delató la cadena de padres que imprime el aborto. Y **`labSubTab(id, el)`
  exige el botón** —sin `el` revienta— y además corre `labAccCerrarTodos`, así que el acordeón hay
  que abrirlo **después** de entrar. **`labRenderExtras` pinta pero no navega: pintar no es
  mostrar.**
- ⚠️ **LA PSAP NO SALE SÓLO DE LA VMAX**: es `4·VRT² + PmAD`, y sin el diámetro y el colapso de la
  VCI queda VACÍA — la fila del cociente decía «—» y se leía como «el cociente no funciona».
- ⚠️ **EL HASH DE «las 436 anteriores» NO ALCANZA CUANDO HAY UN RENOMBRE**: el de «PHT»→«THP»
  cambia DOS claves, así que el hash difiere de forma legítima y deja de distinguir «se renombró
  algo» de «cambió un valor». Hay que comparar **clave por clave** con el renombre mapeado.
- ⚠️ **UN A/B CON GRUPOS DISTINTOS NO SE COMPARA**: el conteo de campos del grupo `teclas` dio 201
  en una corrida completa y 199 en una de dos grupos, **sobre el mismo árbol**. Es estado de
  sesión, no un cambio del commit. Remedir HEAD **con los mismos grupos** antes de sospechar.
- ⚠️ **Me comí el acento grave DIEZ veces**, todas en comentarios míos dentro del template de la
  sonda o del cuerpo de un caso, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta las diez; `node --check` apuntaba a la apertura
  del template. **Y esta vez SÍ alcanzó a un `ev(\`…\`)` inline de la sonda**, que es lo que la
  tanda del cartel de péptidos declaraba fuera de su cobertura.
- ⚠️ **UN `heredoc` DE PYTHON QUE NO LLEGA A EJECUTARSE DEJA EL ARCHIVO SIN TOCAR Y EL `assert`
  NO AVISA:** una edición de TC-142 «se aplicó» en el reporte y el archivo seguía con el valor
  viejo. **Verificar con `grep` que la edición quedó, no confiar en el `ok` impreso.**

### El VENTRÍCULO DERECHO en tres columnas, el TAPSE/PSAP y el diámetro de la ARTERIA PULMONAR — «G1» (2026-10-15)

- **Es la tanda «G1».** Al **empezar**, `main` estaba en **`39475c6`** (sello `v20261015-0547`) y
  `origin/main` en **`0963d53`**: **los cuatro commits del F estaban SIN PUSHEAR**. La orden
  mandaba PARAR en el punto 0 y se paró; Maicol autorizó seguir igual, así que los cinco commits
  de esta tanda se apilaron encima de esos cuatro.
  ⚠️ **AL CERRAR, `origin/main` YA ESTABA EN `39475c6`: Maicol pusheó los cuatro del F durante la
  tanda.** Comprobado con un `git fetch` de verdad al final, no con el ref en caché — que es
  justamente por qué conviene remedirlo al cerrar y no copiar el renglón del arranque. Así que lo
  que queda local son **los cinco de esta tanda y nada más**. El push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 2 CUELGA DEL 1 Y HAY QUE REVERTIRLO ANTES**: el 2 agrega una fila al cuadro que el 1
  reescribió entero, y su visibilidad la gobierna `vdRefVisSync`, que **nace en el 1**. Revertir
  el 1 primero deja `vdRefVisSync` sin existir y la fila de la relación VD/VI **visible para
  siempre**, porque nadie la esconde. **El 3 cuelga del 1 por la misma línea**: su
  `vdTapsePsapSync` se inserta a continuación de `vdRefVisSync`.
  ⚠️ **EL 4 ES EL ÚNICO QUE SE REVIERTE SOLO**, y tiene DOS mitades independientes entre sí: el
  campo del diámetro de la arteria pulmonar y el color del aviso del Tei. Ninguna nombra nada de
  los otros tres commits.
  ⚠️ **PERO EL 1 LLEVA LA SONDA** (`scripts/_probe_g1.mjs`), que los otros tres usan: revertirlo
  los deja sin arnés.
  **El 5 es TC-476 más documentación y el sello**, y afirma el comportamiento de los cuatro:
  revertir cualquiera sin el 5 deja TC-476 en rojo —56 de sus 77 condiciones—.
  ⚠️ **Y EL 1 Y EL 2 ADAPTARON TC-457, LOS DOS LA MISMA LÍNEA**: su conteo de filas del cuadro
  pasó de 7 a 9 y después a 10. Revertir sin reponer ese número lo deja en rojo por el
  denominador, no por un defecto.

- **Línea base al cierre: suite 486/490 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0
  ERROR, Excel en 436 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO
  a la línea base—.** **CERO REGRESIONES**: los cuatro rojos son exactamente los de ENTRADA
  —**TC-223** (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**—. **El
  denominador subió a 490**: esta tanda agregó **TC-476**. La de ENTRADA, medida sobre el árbol
  limpio antes de tocar nada, fue **485/489** con esos mismos cuatro rojos. El `md5` de
  `index.html` no se movió durante ninguna de las dos corridas (`437ea7c3…`) y el pendrive estaba
  montado antes y después.
  ⚠️ **LA SUITE COMPLETA SE CORRIÓ DOS VECES, Y LA PRIMERA NO ES LA LÍNEA BASE.** Dio **483/490**
  con **siete** rojos, y los **tres** de más los destapó la suite completa, no la corrida de zona:
  **TC-428** (el cuadro del Doppler tricuspídeo pasa de 7 filas a 8), **TC-471** (el registro
  `VINFO` pasa de 21 entradas a 22) y **TC-472**, que es el caso más interesante de los tres: su
  condición decía textualmente «LÍMITE DECLARADO: el aviso del Tei del VD sigue gris, y queda en
  PENDIENTES», escrita el 14/10 **para que el día que se arreglara se notara**. Se arregló y lo
  notó. Los tres se adaptaron y la segunda corrida es la que vale.
  ⚠️ **`--todo` del chequeo de celular BAJA de 376/385 a 375/384, y el signo importa.** No es que
  el campo nuevo no cuente: el de la arteria pulmonar vive dentro del cajón «Datos» de la
  pulmonar, que `check_mobile.js` no abre, y la casilla de la FAC **dejó de contarse porque ahora
  se esconde sin dato**. **La cuenta VISIBLE, que es la que compara la línea base, no se movió.**
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. Por eso el total es sobre 490 y no sobre 491.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261015-0547`) y se volvió a sellar en el
  commit 5: **`v20261015-0715`**. La suite se midió **DESPUÉS** de sellar, con el `md5` quieto.

- **Dónde está todo:** `docs/mapa/vd-derecho.md` → la sección G1 entera (**27,5 KB**),
  `docs/mapa/tapse-psap-ap.md` (**mapa NUEVO por PARTICIÓN**, 7,7 KB),
  `docs/fuentes/FUENTES.md` → `### escErs2022` (**entrada NUEVA**: la Tabla 10 leída POR
  COORDENADAS y la tabla de riesgo del folio 41) y «`aseVd2025` — lo que esta tanda le agregó»,
  y `docs/PENDIENTES.md` → **D2-2 marcado CERRADO** más **doce** cosas declaradas (G1-1 a G1-12).
  ⚠️ **EL MAPA SE PARTIÓ ANTES DE CRUZAR EL TECHO Y NO DESPUÉS.** Con todo junto quedaba en
  **33,5 KB**, a 1,5 KB de los 35 — la misma situación en la que `valvulas.md` cruzó DOS veces.
  Lo que salió a archivo propio es lo que **no vive en la pestaña VD/AD**.

- **LOS QUINCE CAMPOS EN TRES COLUMNAS, Y EL ORDEN DEL MARCADO ES EL DEL TAB.** Columna 1: TAP ·
  TAPSE · S′ · Tei · FEVD; columna 2: VD basal · medio · longitudinal · VD/VI · pared; columna 3:
  Diám. TSVD · VTI TSVD · área telediastólica · área telesistólica · FAC. Mecanismo de la grilla
  del Doppler mitral: **cero `tabindex`** y posición EXPLÍCITA (`vd-cN`/`vd-rM`, ocho reglas
  dentro del `min-width:769px` que ya existía).
  ⚠️ **ACÁ LA POSICIÓN EXPLÍCITA NO ES PRECAUCIÓN SINO NECESIDAD**, a diferencia del Doppler
  mitral: la casilla de la FAC **se esconde sin dato desde esta misma tanda**, y con flujo
  automático eso haría subir un campo de OTRA columna, porque la FAC es el último de la suya.
  **MEDIDO con teclas reales:** grilla **3×5 a 1200 px** con los quince a 318 px, **cero
  solapamientos y cero desborde**, una columna a 390 y 360 px, en los **dos temas**; el Tab
  recorre los quince en orden de columnas.
  ⚠️ **SIN DATO EN LAS ÁREAS EL TAB SALTA LA CASILLA DE LA FAC** —está escondida—, así que se
  midieron los **dos** recorridos.

- **EL CUADRO PASA A DIEZ FILAS Y SE LEE EN EL ORDEN DE LAS COLUMNAS.** Tres sólo se ven con
  dato: la **FEVD**, la **FAC** (y con ella su casilla automática) y la **relación VD/VI**, que
  se esconde **por su VEREDICTO y no por falta de dato**.
  ⚠️ **SE ESCONDE LA FILA ENTERA Y NO SÓLO EL TEXTO**: el barrido genérico de
  `.calc-box .calc-row span[id]` ya pone el span en «—», y lo que **ningún barrido toca** es el
  `display` de su `.calc-row`. `vdRefVisSync` lleva las TRES columnas.
  **Tres `oninput` nuevos y ninguno decorativo**: `fevd`, `vd_vi` —que hasta hoy **no repintaba
  la probabilidad de HTP** al cargarse— y los dos insumos del Qp.

- **EL VOLUMEN SISTÓLICO PULMONAR (Qp) NO ABRE UNA SEGUNDA COPIA DE LA FÓRMULA.** El álgebra
  vive en **`_vsTsviCalc`**, su dueño único desde el 14/10, y `vdQpCalc` sólo dice de dónde salen
  los insumos. ⚠️ **`eteQpQs` NO SERVÍA: ese cociente CANCELA la constante** y por eso nunca
  calcula el volumen. **NO vota, no lleva corte y no lleva color.** Medido: Ø 20 mm + VTI 20 cm
  → **62,8 ml**.

- **LA RELACIÓN VD/VI SIGUE SIENDO UN CAMPO NUMÉRICO, Y LAS DOS OPCIONES DE LA ORDEN NO ENTRAN.**
  La propia orden lo condiciona a que el campo no existiera ya en esa forma, y existía: de él
  leen la categoría A de `_htp2022Core`, el PDF y el PPT. Lo que entra es la FILA, con el
  **`> 1,0`** de la ESC/ERS 2022 (Tabla 10, folio 28, categoría A) y de la ASE 2025 (Tabla 8,
  folio 173). **El corte no se movió**: es el mismo literal que ya se aplicaba, y ahora los dos
  leen `VD_VI_HTP_MIN`. Medido: 0,99 no · **1,00 EXACTO no** · 1,01 sí.
  ⚠️ **EL `>= 0,9` DE TEP NO SE TOCÓ**: es otro campo (`tep_vdvi`) y otra pregunta.
  `PENDIENTES.md` → **G1-5**.

- **LA PARED SE GRADÚA CON LA TABLA 1 DE LA ASE 2025 (folio 145), Y COINCIDE CON EL «5-7-9» DEL
  MÉDICO**: normal `<5` · leve `≥5 a ≤7` · moderada `>7 a ≤9` · severa `>9` mm.
  ⚠️ **LA ASE 2010 (RUDSKI) NO ESTÁ EN LA BIBLIOTECA** —censo de los 70 PDF— y la ASE/EACVI 2015,
  que sí está, **no publica grados de RVWT**: la única fuente es la ASE 2025.
  **El corte de hipertrofia no se movió** (`>= 5 mm`) y **la graduación NO sale del cuadro**: el
  informe sigue diciendo «hipertrofia del ventrículo derecho (pared de N mm)» y el EN SUMA
  «HVD», sin grado. Medido con los dos techos incluidos: 5,0 y 7,0 leve, 9,0 moderada.
  `PENDIENTES.md` → **G1-3**.

- **EL COCIENTE TAPSE/PSAP TIENE UN DUEÑO ÚNICO Y NO RECALCULA LA PSAP: LA LEE.** Fila nueva en
  el Doppler tricuspídeo, debajo de la PSAP estimada. Tres tramos (decisión de Maicol):
  `< 0,36` «mal pronóstico en IC con FEVI reducida y preservada» · `0,36 a < 0,55` «elemento de
  probabilidad para HTP» · `>= 0,55` «acoplamiento VD-AP normal». **Sin TAPSE o sin PSAP la fila
  NO se dibuja, y sin mensaje de error.**
  ⚠️ **TRES DECIMALES Y NO DOS, Y NO ES COSMÉTICO.** Con dos, un 0,359 se imprime «0,36» y,
  clasificado sobre lo impreso, **deja de ser «mal pronóstico»**: el corte se convertiría de
  hecho en 0,355. Con tres el borde es el de la fuente **y** es la misma precisión con la que la
  pantalla de TEP publica este mismo cociente.
  **Medido:** 0,359 · **0,360 exacto** · 0,410 · 0,546 · **0,550 exacto** · 0,564.
  ⚠️ **HAY CUATRO SUPERFICIES QUE LO CALCULAN, NO DOS.** `calcTEP` (`>0,32`) pasa a **leer al
  dueño** con su predicado y su valor crudo idénticos —su texto, sus tres decimales y su corte no
  se tocaron—; `_htp2022Core` (`<0,55`) **no puede**, porque corre también sobre un estudio
  GUARDADO y no sobre el DOM; y **`cxTP` tampoco** —el índice del módulo de
  constricción/restricción, con cortes 0,36 y 0,19 y con **campos de sobreescritura propios**—.
  Las dos quedan declaradas. `PENDIENTES.md` → **G1-8** y **G1-9**.

- ⚠️ **EL COCIENTE ESTÁ EN LA CATEGORÍA C DE LA APP Y LA TABLA LO PONE EN LA A, Y SE MIDIÓ POR
  COORDENADAS.** En la Tabla 10 de la ESC/ERS 2022 (folio 28) el renglón «Cociente TAPSE/PAPs
  < 0,55» arranca en **x0 = 316**, la columna de «A: Ventrículos»; los dos del diámetro de la AP
  en **x0 = 389**, la de «B: Arteria pulmonar». Leído por el orden en que el extractor devuelve
  el texto, las tres columnas se mezclan. **NO se corrigió**: mover un signo de categoría cambia
  `nCat` y con él la probabilidad publicada. `PENDIENTES.md` → **G1-1**.

- ⚠️ **PARADA DECLARADA: EL 0,32 DE LA PANTALLA DE TEP TIENE FUENTE PERO NO ES UN CRITERIO DE
  TEP.** ESC/ERS 2022, **folio 41**: es el umbral de **BAJO RIESGO en hipertensión arterial
  pulmonar**. Por eso **no se agregó** la frase «mal pronóstico en IC y probabilidad de TEP» que
  la orden ofrecía. `PENDIENTES.md` → **G1-2**.
- ⚠️ **Y EL 0,36 EN INSUFICIENCIA CARDÍACA NO ESTÁ VERIFICADO AL ESTÁNDAR DE LA CASA.** Nace de
  **Guazzi, Am J Physiol Heart Circ Physiol 2013;305:H1373-H1381**, que **no está en la
  biblioteca**: se leyó a través del metaanálisis de Heart Fail Rev 2024, en línea. Por eso la
  tarjeta ⓘ **no lo cita** y su bloque «a tener en cuenta» lo dice en voz alta. El número está
  publicado y la ASE 2025 lo nombra en su folio 180, pero con OTRO significado.
  `PENDIENTES.md` → **G1-6** y **G1-7**.

- **EL GLOBO ⓘ NO NECESITÓ EXTENDER NINGÚN MECANISMO**: `#vinfo-card` vive FUERA de toda pestaña,
  así que el de Válvulas del D1 ya funcionaba en el Doppler. Clave `tapse-psap`, cuatro bloques,
  **22 acentos**, 1147 caracteres. Medido: abre, cierra por los cuatro caminos, es un `<button>`
  **sin `title` y sin `abrirAyudaEco`**, y entra entero en el viewport a **1200, 390 y 360 px en
  los dos temas** con el globo alcanzable. Captura PNG en los dos temas, con `md5` distinto.

- **EL DIÁMETRO DE LA ARTERIA PULMONAR NO VOTA, Y LO GARANTIZA SU `oninput`:** llama **sólo** a
  `ipApDiamSync` y **no** a `calcIP`, que es el dueño del grado. **Medido**: con los cuatro signos
  de la IP cargados, grado, pastilla, cuadro, informe y EN SUMA salen **idénticos** con y sin él.
  Banda **`[5, 80]` mm**, de plausibilidad y NO de severidad: 2,5 y 120 quedan marcados
  «(revisar)» y el valor **no se corrige**; 5 y 80 exactos no se marcan.
  **SIN columna de Excel** —va en el G2—: 436 columnas en las nueve escenas y **cero encabezados
  que nombren la arteria pulmonar**. **Y SÍ viaja con el estudio**, porque su id va con guión
  BAJO y `_noEsDelEstudio` no lo excluye.
  ⚠️ **LA COMPARACIÓN QUE LA GUÍA PIDE ES CONTRA LA RAÍZ AÓRTICA** —«RA: raíz aórtica» en el pie
  de la Tabla 10, folio 28—, que en esta app es **`ao_sin`**. **No se conectó**: el censo de las
  nueve medidas de aorta está en `PENDIENTES.md` → **G1-11**.

- **EL AVISO DEL TEI SE VEÍA GRIS Y AHORA ES NARANJA (el defecto D2-2, cerrado).** Medido en
  HEAD: `rgb(232,236,244)` de noche y `rgb(26,34,51)` de día, con
  `getPropertyValue('--amber')` devolviendo **cadena vacía**. Hoy `rgb(245,158,66)` y
  `rgb(217,123,31)`, **idénticos al control `#diast-excl-aviso`**. Texto y lógica sin tocar.

- **CONTROL NEGATIVO MAYOR, con escenario CARGADO y con el formulario vacío: las ÚNICAS
  diferencias contra HEAD están DENTRO del cuadro de referencias del VD** —que es lo que esta
  tanda reordena— **más la clave del campo nuevo en el juego de campos guardados**. Informe en
  los tres estilos, EN SUMA, **Excel en 436 columnas con el mismo hash**, hash de campos, PPT,
  Laboratorio, los ocho grados y las ocho pastillas, la función diastólica y el HFA-PEFF salen
  IDÉNTICOS.

- **Arnés: `scripts/_probe_g1.mjs`** (A/B de solo lectura con `--file`, y `--dest` para las
  capturas), ocho grupos (`campos`, `refs`, `vdvi`, `tpsp`, `globo`, `pulmo`, `color`,
  `controles`), con teclas y clics reales y emulación de viewport.
  **Cobertura: TC-476**, **77 condiciones** —contadas instrumentando el propio caso para que
  publicara su `ex.length`— con nueve denominadores y nueve controles negativos. **Verificado que
  sabe fallar contra HEAD en un worktree aparte: 56 de las 77 en rojo, y NINGUNA por excepción.**
- ⚠️ **CASOS ADAPTADOS: UNO, TC-457**, y **dos veces la misma línea**: su conteo de filas del
  cuadro del VD pasó de 7 a 9 (commit 1) y de 9 a 10 (commit 2).

- ⚠️ **EL DOPPLER TRICUSPÍDEO NO ES UN `sacc-` Y NO SE ABRE CON `secToggle`.** Es una `.card` con
  `toggleCard('dop-tricusp')` y su cuerpo nace en `display:none`: sin abrirlo, la fila del
  cociente y su globo **existen y miden 0×0**, la tarjeta no se ancla y «no abre» se lee como «el
  mecanismo no funciona» — que es lo que informó la primera corrida del grupo `globo`.
- ⚠️ **`el.type` DEVUELVE «text» SOBRE UN CAMPO QUE EN EL MARCADO DICE `number`**, y el ATRIBUTO
  también. Esta app convierte todos sus `input[type=number]` a `type="text"` con
  `inputmode="decimal"` y la clase **`numdec`** para que Safari acepte la coma —de ahí también que
  el `step` no restrinja nada, que es lo que el comentario de `vdBasCat` ya documenta—. **Dos
  condiciones de TC-476 salieron rojas por esto sobre campos perfectos.** Lo que prueba que un
  campo sigue siendo numérico es que esa maquinaria lo haya tomado.
- ⚠️ **AL QUITARLE LOS ACENTOS GRAVES A UN RANGO DE LÍNEAS, EL ÍNDICE SE PASÓ UNA LÍNEA Y SE
  LLEVÓ EL ACENTO DE APERTURA DEL PROPIO `caso(...)`.** El síntoma fue que
  `scripts/check_backticks.py` señalaba una línea del RUNNER, cientos de líneas después, que es
  código normal. **El acento grave que FALTA se ve igual que uno que SOBRA.**
- ⚠️ **Me comí el acento grave CUATRO veces**, todas en comentarios míos: dos en el template de
  la sonda y dos en el cuerpo de TC-476, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta las cuatro; `node --check` apuntaba a la
  apertura del template.

### El VSFVI y el VOLUMEN LATIDO automáticos, el GC del PDF y el grado del AVA indexada — «F» (2026-10-15)

- **Es la tanda «F» y tiene DOS BLOQUES INDEPENDIENTES.** **F1** (pestaña AI/VI y PDF): los dos
  campos automáticos del VI y el gasto cardíaco del PDF sólo con frecuencia cardíaca. **F2**
  (pestaña Válvulas): la fila «AVA indexada» publica su grado y el renglón integrado dice cuál
  criterio decide. **NO cambia ninguna cuenta clínica, ningún corte, ninguna regla de integración
  ni ningún texto del informe firmado**, y el **Excel queda en 436 columnas con el MISMO hash**
  (medido con el escenario cargado y con el formulario vacío). Al **empezar**, `main` y
  `origin/main` estaban los dos en **`0963d53`**, sin nada sin pushear —confirmado con un
  `git fetch` de verdad—, con los siete commits del W2-B ya incluidos **y pusheados**. Los
  **cuatro** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 4 → 3 → 2 → 1.**
  ⚠️ **EL 1, EL 2 Y EL 3 NO SE LLAMAN ENTRE SÍ Y SE REVIERTEN EN CUALQUIER ORDEN**, que en esta
  serie es raro y conviene decirlo: el 1 crea `viVolAutoSync` y los dos campos `vauto-`, el 2 son
  **cuatro líneas** de `generarPDFReal` (el `_fcUso`, el `coV`, el `_fcRef` y el `ref` de la fila)
  y el 3 crea `eaAvaiGradoPintar`, `_eaPorCriterio` y `_eaEsProtesisAo`. Ninguno nombra nada de
  los otros dos.
  ⚠️ **PERO EL 1 LLEVA LA SONDA** (`scripts/_probe_f.mjs`), que los otros dos también usan:
  revertirlo deja al 2 y al 3 sin arnés.
  ⚠️ **Y EL 3 EXTRAJO `_eaEsProtesisAo` DE `_eaPintarRecuadroDoppler`**, que pasó a llamarla:
  revertirlo deja esa función nombrando algo que ya no existe, y un `ReferenceError` ahí se lleva
  el recuadro del Doppler. **Es la única dependencia de la serie, y va en el sentido contrario al
  habitual: lo que hay que revertir ENTERO es el 3, no «el 3 después del 1».**
  **El 4 es TC-475 más documentación y el sello**, y afirma el comportamiento de los tres:
  revertir cualquiera sin el 4 deja TC-475 en rojo —25 de sus 37 condiciones—.

- **Línea base al cierre: suite 485/489 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 436 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la
  línea base—.** **CERO REGRESIONES**: los cuatro rojos son exactamente los de ENTRADA —**TC-223**
  (el documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**—. **El denominador
  subió a 489**: esta tanda agregó **TC-475**. El `md5` de `index.html` no se movió durante la
  corrida (`f3769b1a…`) y el pendrive estaba montado antes y después.
  ⚠️ **LA CORRIDA COMPLETA DIO 483/489 CON SEIS ROJOS, Y DOS NO SON REGRESIONES: SON LOS
  INESTABLES POR ORDEN DE CORRIDA.** **TC-246** y **TC-252** salieron **VERDES corridos solos**
  sobre el mismo árbol, que es exactamente lo que este archivo ya documenta para ellos dos.
  **Repetir antes de sospechar.**
  ⚠️ **`--todo` del chequeo de celular pasa de 374/383 a 376/385: +2 `input-chico` (BAJA)**, que
  son los dos campos nuevos contados igual que los otros ~330 `input` de la app. Es el mismo
  precedente que la tanda del VD. **La cuenta VISIBLE, que es la que compara la línea base, no se
  movió.**
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. Por eso el total es sobre 489 y no sobre 490.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261015-0432`) y se volvió a sellar en el
  commit 4. La suite se midió **DESPUÉS** de sellar, con el `md5` quieto.

- **Dónde está todo:** `docs/mapa/vi-volumenes-automaticos.md` (**mapa NUEVO**, 10,5 KB: los dos
  campos con sus guardas una por una, las tres columnas del cableado, por qué NO hay circularidad,
  el censo de quién lee el VSFVI y el volumen latido, el gasto cardíaco del PDF con su medición en
  HEAD y las cinco trampas); `docs/mapa/aortica-cortes.md` → la sección de F2 (**13,3 KB**, bajo el
  techo); `docs/mapa/informe-pdf-excel.md` → un puntero (**23,1 KB**); `docs/fuentes/FUENTES.md` →
  por qué los dos automáticos **no llevan cita** y la re-verificación de los cortes del AVA
  indexada; `docs/PENDIENTES.md` → **once** cosas declaradas (**F1 a F11**), con la auditoría de
  las filas sin grado.

- **F1 · LOS DOS CAMPOS AUTOMÁTICOS NO VOTAN, NO ESCRIBEN NINGÚN GRADO Y NO VIAJAN.** Prefijo
  `vauto-` con guión MEDIO, que `_noEsDelEstudio` ya excluía. **Medido: 1022 campos con el MISMO
  hash y CERO claves `vauto-`**, Excel en 436 con el mismo hash.
  **Dueño único `viVolAutoSync`, con las TRES columnas**: `calcVI`, `RECALC_MODULOS` y el final de
  `limpiarCampos` —el barrido genérico borra el `value` de un `input[type=text]` pero **no** el
  placeholder, y el renglón de origen es un `<div>` que ningún barrido alcanza—.
  ⚠️ **NO HAY CIRCULARIDAD, Y ESTÁ MEDIDO: `fevi` es un campo TIPEADO.** Censo del archivo: nadie
  le escribe `.value` ni pasa por un `setv('fevi', …)`, y `fevi_met` sólo DECLARA el método. El
  panel del VI 3D sí deriva una FEVI de los dos volúmenes cuando falta, pero **no escribe el
  campo**.
  ⚠️ **LA FÓRMULA NO ES NUEVA**: el VI 3D ya hace `VDF × (1 − FEVI/100)` y `VDF − VSF` con las
  mismas dos guardas. Ningún corte, ninguna banda y ninguna constante nueva, y **por eso no lleva
  cita**: es álgebra de la definición de fracción de eyección.
  ⚠️ **EL AUTOMÁTICO SE VE TAMBIÉN CON EL VSFVI MANUAL CARGADO**, a propósito, y la casilla de
  abajo DICE cuál de los dos usó la resta. Lo que nunca pasa es que el automático le gane al
  manual.
  **MEDIDO con teclas reales, 12 escenas:** VDFVI 140 + FEVI 60 → **56 ml** y **84 ml** «con el
  VSFVI automático»; con el manual en 60 → **80 ml** «con el VSFVI manual»; una FEVI de 95 y un
  VSFVI de 0,06 —fuera de sus bandas `[5,90]` y `[3,500]`— se tratan como **ausentes**; un VSFVI
  mayor que el VDFVI **no publica** la resta y dice por qué; y borrando cada insumo con Backspace
  reales los dos se vacían. **Los dos son readonly y la sonda se NIEGA a mandarles Backspace.**
  ⚠️ **«QS» NO APARECE EN NINGÚN ROTULO VISIBLE DE LA APP**, medido sobre el árbol vivo: cero
  `<label>` con esa sigla, así que **no hubo nada que sacar**. Las únicas apariciones en el archivo
  son `CIV_QPQS_CIERRE` y los textos de **Qp/Qs** de Congénitas —otra magnitud, otro módulo— y no
  se tocaron. TC-475 lo fija.

- **F1 (PDF) · EL GASTO CARDÍACO SÓLO CON FRECUENCIA CARDÍACA, Y EL ROTULO DICE CUÁL.** Medido en
  HEAD con Ø TSVI 20 mm y VTI TSVI 20 cm: **sin FC el papel imprimía «GC: 4.4 L/min*» y «IC: 2.20
  L/min/m2»**, dos números sostenidos por una frecuencia de 70 que nadie midió, en un informe
  FIRMADO — y **el `*` no tiene pie de página en ningún lado del documento**, censado.
  ⚠️ **NO ES LA PARADA QUE LA ORDEN PREVÉ, Y SE MIDIÓ ANTES DE SEGUIR.** La condición de parada es
  «el GC del PDF usa una FC distinta de la cargada», y **no se cumple**: con FC cargada el papel
  usa EXACTAMENTE esa FC —72 lpm da 4,5 L/min y 110 da 6,9, idénticos a HEAD—. La única rama con
  una FC por defecto es la que NO tiene FC cargada, que es precisamente la que la orden manda
  retirar.
  ⚠️ **EL ÍNDICE CARDÍACO SE VA CON ÉL**, y es consecuencia y no una decisión aparte: `icV` es
  `coV / ASC`, con la MISMA FC inventada. `PENDIENTES.md` → **F5**.
  ⚠️ **SIN AVA Y SIN FC DESAPARECE LA SECCIÓN «AVA / GC / IC» ENTERA**, header incluido, porque
  esas dos son sus únicas filas y `drawTablaCompacta` descarta las secciones vacías. Es el filtro
  que esa función **ya** tenía: **medido con el AVA cargado, la sección se queda** y sólo faltan
  las dos filas del gasto. Sin esa escena, eso se lee como una pérdida de la tanda.
  **LA PANTALLA NO CAMBIA**: `calcHemo` ya dejaba el GC, el IC, la RVS y los dos perfiles en `null`
  con la FC vacía o fuera de banda, con el MISMO predicado.

- **F2 · LA FILA DEL AVA INDEXADA PUBLICA SU GRADO, Y EL RENGLÓN INTEGRADO DICE CUÁL CRITERIO
  DECIDE.** Medido en HEAD: con AVA por continuidad 1,10 cm² (moderada) y AVA indexada 0,55 cm²/m²
  (severa) la fila decía «0.55 cm²/m²» a secas y el renglón «Severa» sin decir por qué, mientras el
  AVA indexada es la que vota desde el 13/10.
  **NO SE MOVIÓ NINGÚN CORTE NI EL GRADO QUE SE PUBLICA**: A/B en las seis escenas, `ea_grado`,
  `ava_cont`, las filas del AVA y del DVI, el cartel y el cuadro del Doppler **idénticos**.
  ⚠️ **EL GRADO VA EN UN `<span>` HERMANO SIN `id`**, el patrón de las nueve filas de la IM, y acá
  con dos razones propias: **TC-436 compara el textContent de `ea-det-avai` por igualdad EXACTA**
  —medido, sigue siendo «0.60 cm²/m²», así que **no hubo que adaptar ningún caso**— y sin `id` el
  barrido de `limpiarCampos` le escribiría «—» donde la regla pide blanco.
  ⚠️ **CON PRÓTESIS NO PUBLICA NINGÚN GRADO**: es el defecto **W1-4** que W2-B cerró en el recuadro
  de al lado. El predicado pasó a tener un dueño único, **`_eaEsProtesisAo`**.
  **MEDIDO con aritmética cerrada** (Ø TSVI 20 mm, BSA **2,00 exacta**, AVA por continuidad siempre
  en rango MODERADO): 0,55 → (severa) · **0,60 exacto** → (severa) · 0,61 → (moderada) · 0,93 →
  **sin grado** · prótesis → sin grado · sin AVA → «—». Renglón: «Severa — por AVA indexada» /
  «Moderada — por velocidad».
  **COLOR**: el grado usa `--text2`, que **existe** en esa zona en los dos temas —`rgb(154,163,188)`
  de noche y `rgb(91,100,120)` de día—, así que no repite el defecto del ámbar que no era ámbar.
  **Captura PNG de los dos temas**, con los `md5` distintos y los acentos completos.
  ⚠️ **EL CARTEL `ea-ava-badge` NO SE ACORTÓ, y se reporta.** Sólo se superpone su primera
  cláusula; la enumeración criterio por criterio no está en ninguna otra superficie, y ese mismo
  nodo lo comparten los estados de prótesis, fuera de banda y bajo gradiente. `PENDIENTES.md` →
  **F10**.

- **AUDITORÍA DE SOLO LECTURA (F2), medida sobre el árbol vivo con las ocho lesiones cargadas y
  NADA corregido:** tres filas publican un criterio que VOTA sin su grado —`ea-det-gmedio` (30
  mmHg), `ea-det-ava` (1,20 cm²) y `ea-det-dvi` (0,38)— y **dos criterios votan sin tener fila** en
  ese cuadro: el AVA por **planimetría** y la **Vmax**. `PENDIENTES.md` → **F8**.
  ⚠️ **TRES COSAS QUE PARECÍAN HALLAZGOS Y NO LO SON, Y HUBO QUE MEDIRLAS PARA SABERLO.** Las
  cuatro filas de la **estenosis mitral** publican su clase en una **columna aparte** (`.em-clase`)
  que el primer barrido de la sonda no veía —las informó como «sin grado» sobre filas que sí lo
  publican—; el **G. máximo** aórtico no es criterio y no vota; y **`ep-ref-gmax` sin grado es una
  decisión documentada de Maicol del 2026-10-07** (punto 5d).

- **CONTROL NEGATIVO MAYOR, con escenario CARGADO: las ÚNICAS 14 diferencias contra HEAD son los
  dos campos nuevos existiendo.** Informe en los tres estilos, EN SUMA, **Excel en 436 columnas con
  el mismo hash**, los **1022 campos** con su hash, los ocho grados y las ocho pastillas, el
  Laboratorio, la franja del PPT, la función diastólica y el HFA-PEFF salen IDÉNTICOS, con el
  escenario cargado y con el formulario vacío.

- **Arnés: `scripts/_probe_f.mjs`** (A/B de solo lectura con `--file`, y `--dest` para las dos
  capturas), cinco grupos (`vol`, `gc`, `avai`, `auditoria`, `controles`), con teclas y clics
  reales y el **PDF generado de verdad** interceptando jsPDF. **Cobertura: TC-475**, **37
  condiciones** —contadas instrumentando el propio caso para que publicara su `ex.length`— con
  cinco denominadores y siete controles negativos. **Verificado que sabe fallar contra HEAD en un
  worktree aparte: 25 de las 37 en rojo, y NINGUNA por excepción.**
- ⚠️ **CASOS ADAPTADOS: NINGUNO**, y eso es consecuencia de dos decisiones de diseño, no suerte: el
  grado de la fila va en un nodo HERMANO —así `ea-det-avai` conserva su textContent exacto, que es
  lo que TC-436 compara— y los dos campos nuevos son `vauto-`, así que no entran en ningún conteo
  de campos del estudio ni de columnas del Excel.
- ⚠️ **`J()` DE UNA SONDA STRINGIFICA ANTES DE AWAITEAR**, así que sobre una **promesa** devuelve
  `{}` — y eso se lee igual que «el PDF salió vacío». La primera corrida del grupo `gc` informó las
  cuatro escenas con el objeto vacío sobre un jsPDF que **sí** había cargado. Para una promesa hay
  que resolverla DENTRO de la página (`JP()`).
- ⚠️ **EL ROTULO Y EL VALOR DE UNA FILA DEL PDF SON DOS `doc.text` DISTINTOS**, así que un espía
  que registre sólo el texto deja la fila del GC como «GC» pelado: la primera corrida informó eso
  en las cuatro escenas. Hay que registrar también las coordenadas y recomponer la fila por su `y`.
- ⚠️ **LA TARJETA DEL VI ES UN ACORDEÓN QUE NACE CERRADO** (`#sacc-vi`): sin `secToggle('vi')` los
  tres campos no tienen caja, `focus()` falla en silencio y la escena mide un tecleo que nunca
  ocurrió. El denominador de arranque de la sonda aborta nombrándolo.
- ⚠️ **UN PARÉNTESIS ESCAPADO DENTRO DEL TEMPLATE DE LA SONDA SE COCINA Y DEJA EL GRUPO SIN
  CERRAR**: `\(` en el archivo llega al regex como `(` y la corrida murió con «Invalid regular
  expression: Unterminated group». Se reemplazó por `indexOf`, que es lo que este repo ya hace para
  los saltos de línea.
- ⚠️ **Me comí el acento grave CUATRO veces**, todas en comentarios míos dentro del cuerpo de la
  sonda, con el archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio
  la línea exacta; `node --check` apuntaba a `_noEsDelEstudio`, dentro del template. **Correr los
  dos.**

### Los CRITERIOS PROPIOS de la PRÓTESIS mitral y aórtica — «W2-B» (2026-10-15)

- **Es la tanda «W2-B»** y cierra el censo W1 (`docs/censo/protesis_valvular.md`): **W1-3, W1-4,
  W1-5, W1-6, W1-8, W1-9, W1-10 y W1-13**, más la **decisión** de W1-11 y el renombre **EOA → AEO**.
  **NO toca la válvula NATIVA** —ningún corte, ninguna regla de integración— y el **Excel queda en
  436 columnas con el MISMO hash** (`971489995`, medido con el escenario cargado y con el
  formulario vacío). Al **empezar**, `main` y `origin/main` estaban los dos en **`9242483`**, sin
  nada sin pushear —confirmado con un `git fetch` de verdad—, con los cuatro commits del W2-A ya
  incluidos **y pusheados**. Los **siete** commits de esta tanda quedan locales; el push lo corre
  Maicol. **El orden de revertido seguro es el inverso del de aplicación: 7 → 6 → 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 2 TIENE QUE REVERTIRSE ANTES QUE EL 1**, aunque el 1 sea sólo el renombre: las
  adaptaciones de **TC-315** y **TC-331** que el renombre provocó viajan en el commit 2.
  ⚠️ **EL 5 CUELGA DEL 2 Y DEL 4 POR EL MARCADO**: los tres globos ⓘ de la cápsula mitral viven en
  las filas que nacen en el 2, y el de la severidad aórtica en el rótulo que el 4 anida. Revertir
  el 2 o el 4 sin revertir antes el 5 deja un `data-vinfo` sin su fila —inocuo— y, peor, deja
  entradas del registro sin globo.
  ⚠️ **EL 3 Y EL 4 SE REVIERTEN EN CUALQUIER ORDEN ENTRE SÍ**: el 3 es el rótulo del jet/AI y el 4
  la aórtica, y ninguno nombra nada del otro. **El 6 es TC-474 más el grupo `controles` de la
  sonda**, y **el 7 es documentación más el sello**: revertir cualquiera sin el 6 deja TC-474 en
  rojo —27 de sus 46 condiciones—.

- **Línea base al cierre: suite 484/488 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 436 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base, y `--todo` da 374 y 383, el mismo par—.** **CERO REGRESIONES**: los cuatro rojos son
  exactamente los de ENTRADA —**TC-223** (el documentado, falla por la fecha), **TC-376**,
  **TC-390** y **TC-406**—. **El denominador subió a 488**: esta tanda agregó **TC-474**. La de
  ENTRADA, medida en HEAD limpio en un worktree aparte, fue **483/487** con los mismos cuatro
  rojos. El `md5` de `index.html` no se movió durante la corrida (`c966d315…`), el pendrive estaba
  montado antes y después, y al terminar no quedó ningún Chrome.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. Por eso el total es sobre 488 y no sobre 489.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261015-0234`) y se volvió a sellar en el
  commit 7: **`v20261015-0432`**. La suite se midió **DESPUÉS** de sellar, con el `md5` quieto.

- **Dónde está todo:** `docs/mapa/protesis-valvular.md` (**mapa NUEVO**, 15,0 KB: qué activa la
  lógica protésica por válvula, el TAVI, la nomenclatura AEO, las cinco tablas con sus cortes, el
  cuadro que ya no gradúa, el PPM aórtico, las tarjetas y las siete trampas medidas);
  `docs/mapa/valvulas.md` → un puntero (**28,6 KB**, bajo el techo) y `docs/mapa/aortica-cortes.md`
  → otro (**10,3 KB**); `docs/fuentes/FUENTES.md` → «PRÓTESIS valvular — los criterios de la ASE
  2024, criterio por criterio», con las cinco tablas transcritas y la regla de folio comprobada;
  `docs/censo/protesis_valvular.md` → la sección 7 con qué fila pasó a «coincide»;
  `docs/PENDIENTES.md` → **ocho propuestas CERRADAS**, la W1-11 **decidida** y **ocho** cosas
  nuevas declaradas (**Z1 a Z8**).

- **EL RENOMBRE «EOA» → «AEO» (decisión de Maicol).** Censo de las **122** apariciones: **23 se
  leen y cambian** (la cápsula protésica mitral con sus dos `aria-label`, los cuatro párrafos de
  «Referencia clínica», tres tarjetas ⓘ, las **dos** líneas del informe firmado y del EN SUMA, la
  salvedad de la cápsula aórtica, la entrada bibliográfica del panel y siete filas y notas del
  panel de Evidencia); las **99** restantes son identificadores y comentarios de código, que
  quedan como están con el mismo criterio del renombre PHT → THP (**Z3**).
  ⚠️ **LAS DOS CITAS LITERALES EN INGLÉS NO SE TOCAN**: alterar una cita la falsifica.
  ⚠️ **EL EXCEL Y EL IMPORTADOR NO NECESITARON TABLA DE ALIAS**: censados, **ningún encabezado dice
  «EOA»** —los de la zona son `DVI mitral` y `DVI mitral (fuente)`—, así que la lectura por nombre
  de encabezado no se mueve.
  ⚠️ **APARICIONES DE «EOA» QUE HABLARAN DE REGURGITACIÓN: CERO.** Las siete que nombran
  regurgitación en su línea se refieren al orificio PROTÉSICO. **No hubo nada que corregir a
  «EROA».** Lo que sí apareció es que el panel usa **«AEOR»** en cuatro citas suyas: tercera
  nomenclatura, declarada en **Z4**.

- **LA ESTENOSIS DE LA PRÓTESIS MITRAL: LA TABLA 11 COMPLETA.** ASE 2024, folio 27, leída
  **RENDERIZANDO** a 400 dpi porque la fuente codifica `≥` como `$` y `≤` como `#`.
  ⚠️ **LOS TRES OPERADORES NUEVOS SON DISTINTOS ENTRE SÍ Y ES DE LA TABLA**: la velocidad pico
  incluye su corte alto (`≥2,5`) y los otros dos no; el gradiente incluye su corte bajo (`≤5`) y
  los otros dos no. Medido con teclas reales por sus **SEIS** bordes: 1,8 / 1,9 / 2,4 / 2,5 / 3,0
  m/s · 4 / 5 / 6 / 10 / 11 mmHg · 120 / 129 / 130 / 200 / 201 ms.
  ⚠️ **LA BANDA DEL MEDIO DEL GRADIENTE TIENE UN HUECO IMPRESO** (`≤5` y después `6-10`): un 5,5 no
  cae en ninguna columna del original. Se resuelve por **complemento**.
  ⚠️ **LOS TRES NO ENTRAN EN EL VEREDICTO `R.obstr`, Y ESO ES UNA PARADA DECLARADA (Z1).** Sumarlos
  cambiaría qué escenas publican «hallazgos sugestivos de obstrucción» en el **informe FIRMADO**, y
  qué parámetros votan es **contenido clínico**. TC-474 lo fija: los tres pueden estar en
  «significativa» a la vez y el veredicto sigue en nulo.
  **El AEO gana su banda del medio** (`≥2,0` normal · `1-2` posible · `<1` significativa): medido,
  1,57 pasa de «sin criterios» a «posible» y los **dos bordes exactos** caen del lado que la tabla
  imprime. ⚠️ **Los bordes se miden con el DVI deliberadamente NORMAL**, porque `AEO = área / DVI`:
  sin eso lo que se mide es el peor de los dos votantes.

- **EL CUADRO DE REFERENCIAS YA NO GRADÚA UNA PRÓTESIS (W1-3 y W1-8).** Las cuatro filas rotulaban
  con el corte NATIVO a dos centímetros de la cápsula que dice «No graduada» y de la que lee **la
  misma continuidad** con la Tabla 11. Hoy **declaran** que no aplica, la del THP con su propio
  texto y el folio 10 —el área por el tiempo de hemipresión **sobreestima** en una prótesis—, y los
  **cuatro VALORES no se tocan**: marcar sin borrar.
  ⚠️ **SE ELIGIÓ DECLARAR Y NO TRADUCIR**: publicar ahí los cortes de la Tabla 11 dejaría el
  gradiente y el área por continuidad leídos **dos veces** en la misma pestaña, que es el defecto
  que esto cierra, no uno que mover.

- **LA AÓRTICA: EL BADGE DEL AVA Y EL PPM.** Con las **tres** prótesis el recuadro Doppler deja de
  publicar «Severa (≤1.0cm²)» —la Tabla 5 no usa ningún corte absoluto de AVA en prótesis— y con
  «Trivalva normal» sale **idéntico a HEAD**. Y el **PPM aórtico** se calcula con la **Tabla 7,
  folio 20**, con su rama de IMC: medido por sus tres tramos y sus **dos bordes** (0,65 severo y
  0,85 moderado), y con la **rama de IMC discriminando sobre el MISMO AVA** —0,65 con IMC 24,7 da
  severo y el mismo AVA con IMC 34,6 da moderado—. Se **LEE** `ava-idx` y no se recalcula; con el
  AVA marcada «(revisar)» **no clasifica**.
  ⚠️ **EL PPM AÓRTICO NO ENTRA EN EL INFORME FIRMADO Y EL MITRAL SÍ: es Z2, la opción
  conservadora.** Y **no se agregó ninguna columna de Excel**.
  **El TAVI no cambia su graduación** —sigue sin veredicto de estenosis, por el basal— pero **sí
  publica el PPM**: la Tabla 7 no abre ramas por tipo de prótesis.
  **W1-13 cerrado de paso**: `valvProtSync` recalcula el cuadro aórtico, porque la fila del PPM
  aparece y desaparece con la morfología.

- **EL JET/AI NO CAMBIA DE CORTE (W1-11, decisión de Maicol), Y SE VERIFICÓ QUE FUNCIONA.** Con
  prótesis, **51 % y 60 % dan `im_grado = 4`** y EN SUMA «IM severa.»; el **50 % exacto no vota**
  («Variable»); en nativa el 45 % sigue siendo severa. **A/B: las 14 escenas idénticas a HEAD.**
  Lo que se corrigió es el **RÓTULO**: la ASE 2017 publica severa **>50 %** y **no publica ni el 20
  ni el 40**, así que las dos superficies que se lo atribuían lo declaran.

- **ONCE TARJETAS ⓘ TOCADAS, CINCO NUEVAS Y SEIS REESCRITAS.** El registro pasa de 16 a **21** y la
  pestaña de 16 a **21 globos**, los 21 `<button>`, **cero `title`** y **cero `abrirAyudaEco`**:
  cero legado. Las cuatro de diferencia publican los **dos regímenes**. **Medido**: las cinco
  abren, cierran por los **cuatro** caminos y entran enteras en el viewport a **1200, 390 y 360 px
  en los DOS temas** (30 celdas), con el globo **alcanzable** después de abrirlas y los acentos
  contados. **Captura PNG de las cinco a 1200 y 360 px en los dos temas: 20 archivos, los 20 `md5`
  distintos entre temas**, y dos miradas al PNG ampliado.

- **CONTROL NEGATIVO MAYOR, con escenario CARGADO en las dos válvulas, la IM, la diastólica y el
  HFA-PEFF: 0 diferencias contra HEAD** en el Excel (**436 columnas, hash idéntico**), los **1022
  campos** con su hash, los grados y pastillas de las ocho lesiones, la franja del PPT, el token
  del Laboratorio, las filas de corte de la IM y el informe y el EN SUMA en los **tres** estilos.
  Y el formulario vacío, también idéntico. **La ÚNICA diferencia en una superficie firmada es el
  renombre autorizado**: «EOA indexada 0.79» → «AEO indexada 0.79».

- **Arnés: `scripts/_probe_w2b.mjs`** (A/B de solo lectura con `--file`, y `--dest` para las 20
  capturas), cinco grupos (`mitral`, `jet`, `aorta`, `tarjetas`, `controles`), con teclas y clics
  reales. **Cobertura: TC-474**, **46 condiciones** —contadas instrumentando el propio caso para
  que publicara su `ex.length`— con nueve denominadores y nueve controles negativos. **Verificado
  que sabe fallar contra HEAD en un worktree aparte: 27 de las 46 en rojo, y NINGUNA por
  excepción.**
- ⚠️ **TC-474 MORÍA POR EXCEPCIÓN CONTRA HEAD EN SU PRIMERA VERSIÓN** (`REG[k].fuente` sobre una
  clave que allá no existe), que prueba que el árbol es distinto y no que el caso sabe medir. Toda
  lectura del registro va por un ayudante con centinela. Misma lección que TC-455, TC-462, TC-465,
  TC-471 y TC-473.
- ⚠️ **CASOS ADAPTADOS: CUATRO.** **TC-315** (el rótulo AEO en el papel, y la condición «AEO 1.57
  NO avisa», que afirmaba el defecto de W1-6), **TC-331** (su buscador de filas del panel va por
  ROTULO y el renombre lo dejaba leyendo indefinido: **tres condiciones pasaban por «no cumple»
  sin medir nada**), y **TC-471** y **TC-472**, los dos **dos veces**, por el denominador de globos
  (16 → 17 en el commit 4, 17 → 21 en el 5).
- ⚠️ **`diam_tsvi` E `itv_tsvi` NO SON CAMPOS TIPEABLES** —viven en un `.fg` con `display:none`
  desde que la medición se mudó a AI/VI— y la sonda **abortó nombrándolos**, que estuvo bien. Las
  puertas visibles son **`em_dtsvi`** y **`em_vtitsvi`**, que son además las que `calcEM` y
  `vmProtEOA` prefieren.
- ⚠️ **`valvDatosTog` RECIBE EL ID DEL CONTENEDOR** (`caja-esten-aortica`), no el nombre de la
  válvula: con el nombre devuelve `null` y no abre nada. En escritorio no se nota por un respaldo
  que escribe `display:block` en línea; **a 390 y 360 px ese respaldo no gana** —el CSS del celular
  usa la clase con `!important`— y los **dos globos aórticos salieron «sin geometría» en las seis
  combinaciones de ancho × tema**.
- ⚠️ **TRES DENOMINADORES ROTOS MÁS, LOS TRES CON PINTA DE MEDICIÓN BUENA.** (1) El área de la AI en
  **100 cm²** cae fuera de la banda `[3,60]`: el cociente sale «(revisar)», el jet no vota y las
  **catorce** escenas informaron grado 0 con el EN SUMA vacío. (2) Medir la visibilidad **desde la
  pestaña equivocada**: `itv_ao`, `vmax_ao` y `gmedio_ao` viven en Doppler, así que `vis()` informó
  «oculto por `tab-valvulas`» sobre una fila perfecta, en las cuatro morfologías. (3) Una condición
  que buscaba **«no grad»** en un texto que dice **«no SE gradúa»** salía roja sobre un badge
  perfecto; lo delató instrumentar la propia condición para que publicara sus `indexOf`.
- ⚠️ **UNA INSERCIÓN ATERRIZÓ EN OTRO OBJETO.** Hay **dos** mapas con la clave `ett-sparkling` y el
  reemplazo tomó el primero: la entrada `ea-prot-ppm` quedó fuera de `VINFO`. Se verificó por
  número de línea que estuviera dentro. **Un `replace` sobre una clave que se repite no es único.**
- ⚠️ **ME COMÍ EL ACENTO GRAVE SIETE VECES**, todas en comentarios míos dentro del cuerpo de un caso
  o del template de la sonda, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta las siete; `node --check` apuntaba a la apertura
  del template. **Correr los dos.**


### Las TRES correcciones de la MITRAL NATIVA del censo W1 — «W2-A» (2026-10-15)

- **Es la tanda «W2-A»** y sale del censo W1 (`docs/censo/protesis_valvular.md`): cierra **W1-1**,
  **W1-7** y **W1-2**. **NO toca prótesis ni sus criterios** —eso es el «W2-B», posterior—, no
  cambia ningún corte, ninguna regla de integración ni ningún texto del informe firmado fuera de lo
  autorizado, y el **Excel queda en 436 columnas, idéntico**.
  Al **empezar**, `main` local y `origin/main` estaban los dos en **`0e3b51d`**, sin nada sin
  pushear —confirmado con un `git fetch` de verdad—, con el commit del censo W1 ya incluido **y
  pusheado**. Los **cuatro** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 4 → 3 → 2 → 1.**
  ⚠️ **EL 1, EL 2 Y EL 3 NO SE LLAMAN ENTRE SÍ Y SE REVIERTEN EN CUALQUIER ORDEN**, que en esta
  serie es raro y conviene decirlo: el 1 es **una línea** de `calcTHP` (más la sonda), el 2 crea
  `EM_CONT_FA_TXT`, `emContRitmoFA`, `emContAvisoFA`, `emContFaAvisoSync`, el span nuevo, el oyente
  de documento y la entrada en `RECALC_MODULOS`, y el 3 es **una línea** de `_labEmLectura` (más la
  adaptación de TC-469 y el comentario que decía «las dos bandas»). Ninguno nombra nada de los
  otros dos.
  ⚠️ **PERO EL 1 LLEVA LA SONDA** (`scripts/_probe_w2a.mjs`), que los otros dos también usan:
  revertirlo deja al 2 y al 3 sin arnés. ⚠️ **Y EL 3 LLEVA LA ADAPTACIÓN DE TC-469**: revertirlo
  sin reponer esa condición la deja midiendo lo contrario, no en rojo.
  **El 4 es TC-473 más documentación y el sello**, y afirma el comportamiento de los tres: revertir
  cualquiera sin el 4 deja TC-473 en rojo —21 de sus 51 condiciones—.

- **Línea base al cierre: suite 483/487 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 436 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base, y `--todo` da 374 y 383, el mismo par—.** **CERO REGRESIONES**: los cuatro rojos son
  exactamente los de ENTRADA —**TC-223** (el documentado, falla por la fecha), **TC-376**,
  **TC-390** y **TC-406**—. **El denominador subió a 487**: esta tanda agregó **TC-473**. La de
  ENTRADA, medida en HEAD limpio en un worktree aparte, fue **482/486** con los mismos cuatro
  rojos. El `md5` de `index.html` no se movió durante ninguna de las corridas.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. Por eso el total es sobre 487 y no sobre 488.
  ⚠️ **LA SUITE COMPLETA SE CORRIÓ DOS VECES, Y LA PRIMERA NO ES LA LÍNEA BASE.** Dio **482/487**
  con **cinco** rojos, y el quinto era **TC-473**, el caso nuevo: pasaba corrido solo y caía en la
  suite completa porque el **estilo del informe es estado de sesión** y lo heredaba del caso
  anterior. Es la cuarta tanda seguida en que la suite completa destapa algo que la zona no ve.
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261015-0019`) y se volvió a sellar en el
  commit 4: **`v20261015-0234`**. La suite se midió **DESPUÉS** de sellar, con el `md5` quieto.

- **Dónde está todo:** **NO se creó ningún mapa nuevo** —los tres que tocaba esta tanda tenían
  margen, medido con `wc -c` ANTES de escribir—: `docs/mapa/valvulas-borrado.md` → sección **6b**
  (de 15,8 a **19,5 KB**), `docs/mapa/valvulas-mitral-pantalla.md` → sección **5b** (de 15,9 a
  **21,2 KB**) y `docs/mapa/laboratorio-estenosis-mitral.md` → el bloque **⚠️ W1-2** (de 10,2 a
  **13,2 KB**). `docs/fuentes/FUENTES.md` → «Continuidad mitral» reescrita con el folio y el censo
  de la ESC/EACTS 2025. `docs/PENDIENTES.md` → **W1-1, W1-2 y W1-7 marcados CERRADOS** (W1-7 en lo
  que la orden autorizaba), **D1-4 actualizado** y **cuatro** cosas nuevas declaradas (Y1 a Y4).

- **W1-1 · EL BORRADO DEL THP DEJABA CINCO NODOS RANCIOS Y UN INFORME QUE AFIRMA SIN NÚMERO.**
  `calcTHP()` salía temprano con el campo vacío **antes** del `calcEM()` que tiene al final, y
  `calcEM` es el dueño único de todo lo que la estenosis mitral publica. Medido con teclas reales
  por las **dos** puertas del dato: `avm_idx` (que **viaja al Excel**), `#em-clase-thp`,
  `#em-sev-integrada`, `#em-thp-badge` y **`em_grado` en «severa»**, con la pastilla prendida, el
  informe diciendo «con estenosis **significativa**» **sin el paréntesis del área** y el EN SUMA
  «EM significativa.» sobre un formulario sin un solo dato de la válvula. **El arreglo es llamar al
  dueño**: una línea. **NO HAY RECURSIÓN** —`calcEM` no llama a `calcTHP`—.
  ⚠️ **LOS DOS GESTOS DE BORRADO DAN RESULTADOS DISTINTOS, Y HAY QUE MEDIR LOS DOS.** Dígito por
  dígito, el paso intermedio («1» de «160») recalcula con un THP **fuera de banda** y lo que queda
  rancio es `avm_idx` con **`121.00 cm²/m² (revisar)`** —un área mitral imposible que va al Excel—;
  seleccionando todo y borrando de una, queda rancio **todo**, el grado incluido. Ésa es la escena
  del censo, y el arnés tiene las dos (`borrar` y `borrarSeleccion`, que manda el `selectAll` como
  **comando de edición** del propio evento de tecla).
  **EL GRADO FIJADO A MANO SE RESPETA**, medido: queda «severa», la pastilla prendida y el badge
  diciendo «Grado fijado a mano — el autocálculo no lo pisa.».
  ⚠️ **ES EL ÚNICO CAMPO CON ESE PATRÓN, RE-VERIFICADO**: los otros **once** campos derivados de
  los bloques mitral y aórtico dejan **cero** nodos rancios, y borrar el **peso** sigue limpiando
  **sólo** `avm_idx` —la conducta deliberada de `_emAvmiSinBSA`—. **A/B contra HEAD: 0 diferencias**
  en los once, en el control del peso y en el borrado de continuidad y planimetría.

- **W1-7 · EL AVISO DE FIBRILACIÓN AURICULAR EN LA CONTINUIDAD, Y NADA MÁS.** EAE/ASE 2009,
  **folio 14, §B.1.4** —comprobado en el pie impreso—: *«The continuity equation cannot be used in
  cases of atrial fibrillation…»*. La app retiraba el voto por las dos regurgitaciones y **no
  miraba el ritmo**. Decisión de Maicol: entra **sólo el cartel**.
  ⚠️ **EL TEXTO NO VA DENTRO DE `emContMotivoNoVota`, Y ÉSA ES LA DECISIÓN DE FONDO**: esa función
  es la dueña de `emContValido`, o sea de **quién vota**, y sumarle una condición habría cambiado
  el grado y el papel firmado. **Medido: voto, grado, categoría, pastilla, líneas de la mitral del
  informe, su EN SUMA y el Excel en 436 columnas con el MISMO hash salen idénticos en los dos
  ritmos.** Tabla: con FA **y** área por continuidad calculada **sale**; en sinusal nunca; en FA sin
  continuidad tampoco. **Se suma al motivo de IM/IAo sin pisarlo**, con su separador.
  ⚠️ **EL SPAN ES HERMANO Y NO HIJO DE `#em-cont-aviso`**: el barrido genérico de `[id$="-aviso"]`
  de `limpiarCampos` hace `textContent=''`, así que un hijo se **destruiría** en el primer «Nuevo
  estudio» y no volvería nunca.
  ⚠️ **EL COLOR ES `--orange` Y NO `--amber`**: medido, `getPropertyValue('--amber')` devuelve
  **cadena vacía** en ese nodo, así que con `--amber` se habría visto gris. Hoy computa
  `rgb(245,158,66)` de noche y `rgb(217,123,31)` de día, idénticos al control `#diast-excl-aviso`.
  **Y CON CAPTURA PNG en los dos temas**, con el `md5` distinto —o sea que la clase `light-mode`
  quedó puesta de verdad— porque `getComputedStyle` lee el estilo y no el píxel: es como la tanda
  del violeta descubrió que el aviso legal le oscurecía la imagen entera. Los dos PNG muestran el
  ámbar y **los acentos completos** («fibrilación auricular», «ecuación», «área», «médico»), que es
  lo que la tanda D1 cazó mirando un PNG y no leyendo el texto.
  ⚠️ **EL RITMO ENTRA POR `src`**, repitiendo la cascada de `hfRitmoEfectivo()`, para que el día
  que el Laboratorio o el Excel lo consuman no divergan de la pantalla; hoy ningún consumidor lo
  pasa y queda declarado. Y el insumo vive en otra pestaña: **tres columnas** (`calcEM`, un oyente
  de documento sobre `diast_ritmo` y `hf_ritmo`, y `RECALC_MODULOS`).
  ⚠️ **LA ESC/EACTS 2025 NO CONTRADICE NADA**, censado el PDF completo: sus tres menciones de la
  ecuación de continuidad hablan de **flujo transmitral aumentado por IM** (Tabla 9, pág. 55) y de
  flujos desiguales en valvulopatía múltiple; **ninguna nombra la fibrilación auricular** para el
  área mitral.
  ⚠️ **LO QUE SIGUE ABIERTO ES EL VOTO, que es D1-4 y es contenido clínico.** `PENDIENTES.md` → Y1.

- **W1-2 · EL LABORATORIO CONTABA «SIN ESTENOSIS» LO QUE EL INFORME LLAMA «GRADIENTE ELEVADO».**
  `gmElev` estaba gateado por `gradCuenta`, así que la categoría `grad_elev` **existía y no se
  alcanzaba** con IM significativa. **El arreglo es una línea**, y lo que **sigue** gateado es
  `porGrad`, la banda que **afirma** estenosis (`≥ 10`) — el mismo reparto de `emCategoria`, que
  con gradiente elevado e IM significativa devuelve `gradiente_im`, cuyo texto no lleva la palabra
  estenosis. **Cambian exactamente cuatro estudios** de `sin` a `grad_elev`; **ninguna otra
  categoría se mueve**, siguen siendo **seis** y excluyentes —su suma da el total de estudios con
  dato, 11 de 11 antes y después—, las **dos casillas quedan iguales** (área 2, gradiente 1, los
  dos 0, base 11) porque son `porArea` y `porGrad`, y `_labValvCounts` y `_labEstenSev` salen
  idénticas. **SIN COLUMNA NUEVA Y SIN CATEGORÍA NUEVA.**
  **Y SE COMPARÓ CONTRA EL INFORME GENERADO DE VERDAD sobre el MISMO estudio**, que es lo que el
  defecto rompía: el papel dice «con gradiente transmitral elevado» y el Laboratorio ahora dice «No
  significativa con gradiente elevado».
  ⚠️ **LA SÉPTIMA CATEGORÍA SE DESCARTÓ A PROPÓSITO**: sumaría una barra al gráfico, una fila al
  PDF de auditoría y una entrada al PPT, obligaría a adaptar TC-469 —que cuenta seis— y tocaría
  `_labHallazgosCuenta`, que corta en OCHO (X5). Las tres alternativas están en `PENDIENTES.md`.

- **Arnés: `scripts/_probe_w2a.mjs`** (A/B de solo lectura con `--file`, y `--dest` para las dos
  capturas), siete grupos (`thp`,
  `fuentes`, `otros`, `fa`, `color`, `lab`, `controles`), con teclas y clics reales y **dos**
  helpers de borrado. **Cobertura: TC-473**, **51 condiciones** —contadas instrumentando el propio
  caso para que publicara su `ex.length`, no a ojo— con seis denominadores y once controles
  negativos. **Verificado que sabe fallar contra HEAD en un worktree aparte: 21 de las 51 en rojo,
  y NINGUNA por excepción.**
- ⚠️ **TC-473 MORÍA POR EXCEPCIÓN CONTRA HEAD EN SU PRIMERA VERSIÓN** (`getComputedStyle` sobre un
  nodo que allá no existe), que prueba que el árbol es distinto y no que el caso sabe medir. Toda
  lectura de un nodo o de una función nueva va por un ayudante con centinela. Es la misma lección
  que TC-455, TC-462, TC-465 y TC-471 ya tienen escrita.
- ⚠️ **CASOS ADAPTADOS: UNO. TC-469**, condición (11): exigía `'sin'` en las dos bandas con IM
  significativa, que **era el defecto**; hoy exige `porGrad` en false y la categoría `grad_elev`, y
  se le agregó el control negativo de los **4,9 mmHg**. Y el comentario de cabecera de
  `_labEmLectura` que decía «las dos bandas» se corrigió: dejar el archivo contradiciéndose consigo
  mismo es cómo un arreglo se deshace sin que nadie se entere.
- ⚠️ **EL ESTILO DEL INFORME ES ESTADO DE SESIÓN, Y ASÍ LA SUITE COMPLETA PUSO TC-473 EN ROJO.**
  Corrido solo pasaba; en la suite completa llegaba en «narrativo», donde la frase de normalidad
  dice «sin estenosis ni insuficiencia **significativas**», así que la condición que exigía que la
  palabra «significativa» desapareciera salía roja sobre un informe perfecto. Se fija
  `setEstiloInforme('estandar')` en la escena **y** se pregunta por «estenosis significativa», no
  por la palabra sola. Es la trampa que TC-470 ya documenta.
- ⚠️ **AL MEDIR EL AVISO DE FA, NO COMPARAR EL INFORME ENTERO ENTRE LOS DOS RITMOS**: cambiar el
  ritmo mueve la **función diastólica**, que esta tanda no toca y que **debe** cambiar con el
  ritmo. Se comparan las líneas de la mitral y la parte mitral del EN SUMA.
- ⚠️ **Me comí el acento grave UNA vez**, en comentarios míos dentro del cuerpo de TC-469, con el
  archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea exacta;
  `node --check` apuntaba a la apertura del template, cientos de líneas antes. **Correr los dos.**

### La AÓRTICA y la TRICÚSPIDE en pantalla, las once tarjetas ⓘ, el rótulo THP y el color de los avisos (2026-10-14)

- **Es la SEGUNDA MITAD («D2») del rediseño de Válvulas** y cierra la serie que abrió D1. Al
  **empezar**, `main` local y `origin/main` estaban los dos en **`8bcd2f9`**, sin nada sin pushear
  —confirmado con un `git fetch` de verdad—, con los **cinco** commits del D1 ya incluidos **y
  pusheados**. Los **seis** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 6 → 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 1 ES LA BASE DEL 2**: crea `_iaAutosSync` y, sobre todo, **le agrega a `_imAutoDeFila` su
  CUARTO argumento**, el separador, que es lo único que el 2 necesita de él. Revertir el 1 sin
  revertir antes el 2 deja `_itAutosSync` pasando un `sep` que el copiador ignora: **no rompe nada
  y no se nota** —las dos casillas de la IT publicarían su grado al lado del número, que es
  exactamente lo que el separador existe para evitar—. Es el peor modo de falla de la serie:
  silencioso y plausible. **Orden: 2 antes que 1.**
  ⚠️ **EL 3 CUELGA DEL 1 Y DEL 2 POR EL MARCADO**: los dos botones ⓘ nuevos de las insuficiencias
  viven en los rótulos de `vauto-ia-eroa` y `vauto-it-eroa`, que nacen ahí. Revertir el 1 o el 2
  sin revertir antes el 3 deja el botón sin su rótulo —o sea sin existir—, lo cual es inocuo, pero
  deja además **dos entradas del registro sin globo**, que es lo contrario del defecto que se
  cerró. **El 4 y el 5 se revierten solos y en cualquier orden**: el 4 es sólo el rótulo y el 5
  sólo el color, y ninguno nombra nada de los otros.
  ⚠️ **PERO EL 3 RETIRÓ LOS SIETE `title` LARGOS, y eso NO se repone solo.** Un globo sin entrada
  en `VINFO` cae al camino de legado, que lee el `title` de su fila: revertir el 3 sin reponer los
  `title` deja **siete tarjetas VACÍAS**, que abren y no dicen nada. TC-472 lo fija.
  **El 6 es TC-472 más documentación y el sello**, y afirma el comportamiento de los cinco:
  revertir cualquiera sin el 6 deja TC-472 en rojo —22 de sus 39 condiciones—.

- **Línea base al cierre: suite 482/486 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 436 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base, y `--todo` da 374 y 383, el mismo par—.** **CERO REGRESIONES**: los cuatro rojos son
  exactamente los de ENTRADA —**TC-223** (el documentado, falla por la fecha), **TC-376**,
  **TC-390** y **TC-406**—. **El denominador subió a 486**: esta tanda agregó **TC-472**. La de
  ENTRADA, medida en HEAD limpio en un worktree aparte, fue **481/485** con los mismos cuatro
  rojos. El `md5` de `index.html` no se movió durante ninguna de las corridas.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. Por eso el total es sobre 486 y no sobre 487.
  ⚠️ **LA SUITE COMPLETA SE CORRIÓ DOS VECES, Y LA PRIMERA NO ES LA LÍNEA BASE.** Dio **477/486**
  con **nueve** rojos: los cuatro de entrada más **cinco que la propia suite completa destapó** y
  que ninguna corrida de zona podía ver —TC-250, TC-262, TC-333, TC-429 y TC-440—. Los cinco
  afirmaban el rótulo viejo o el `title` retirado; se adaptaron y la segunda corrida es la que
  vale. **Es la tercera tanda seguida en que la suite completa destapa casos que la zona no toca.**
- **EL SELLO DE VERSIÓN** estaba al día al empezar (`v20261014-2125`) y se volvió a sellar en el
  commit 6: **`v20261015-0019`**. La suite se midió **DESPUÉS** de sellar, con el `md5` quieto.

- **Dónde está todo:** `docs/mapa/valvulas-ia-it-pantalla.md` (**mapa NUEVO**, 14,6 KB: las dos
  tablas de columnas, las cinco casillas y sus dos dueños, las once tarjetas con su fuente, el
  censo del rótulo con lo que NO se cambió, la tabla de colores medidos y las cinco trampas),
  `docs/mapa/valvulas-constantes.md` (**mapa NUEVO por PARTICIÓN**, 9,2 KB),
  `docs/mapa/valvulas.md` → dos punteros, `docs/fuentes/FUENTES.md` → «Las ONCE TARJETAS de los
  globos ⓘ de la tanda D2», y `docs/PENDIENTES.md` → **D1-1, D1-2 y D1-3 marcados CERRADOS** más
  **cinco** cosas declaradas y no tocadas (D2-1 a D2-5).
  ⚠️ **`valvulas.md` CRUZÓ EL TECHO CON UN PUNTERO DE DIECISÉIS LÍNEAS** —pasó de 34,5 a 35,4 KB—
  y hubo que partirlo: el bloque «Constantes de cortes y bandas» salió a archivo propio y el mapa
  volvió a **27,6 KB**. Es la segunda vez que la regla se aplica **después** de cruzar: **medir con
  `wc -c` ANTES de escribir, no después.**

- **NO CAMBIA NINGUNA CUENTA, NINGÚN CORTE, NINGÚN GRADO NI NINGUNA REGLA DE INTEGRACIÓN, Y ESTÁ
  MEDIDO.** A/B contra HEAD en los cinco commits: **0 diferencias** en informe (tres estilos), EN
  SUMA, Excel en **436** columnas con el mismo hash, Laboratorio, grados de las ocho lesiones,
  pastillas y las filas de los cuatro cuadros de referencia. **Escenas que cambian de veredicto:
  NINGUNA.** Las ÚNICAS dos diferencias contra HEAD son textos «THP»: la fila de discordancia de la
  IAo en pantalla y el informe firmado del TAVI.

- **LAS CINCO CASILLAS AUTOMÁTICAS NO CALCULAN NADA: COPIAN SU FILA**, igual que las del D1. Tres
  en la IAo (EROA, Vol-R y FR por PISA) y dos en la IT (EROA y Vol-R). Dueños `_iaAutosSync` y
  `_itAutosSync`, los dos sobre `_imAutoDeFila`. **Medido con teclas reales: 45 de 45 lecturas
  coinciden con su fila** (cargado, sin cada insumo, vacío y tras borrar con Backspace reales).
  ⚠️ **EL COPIADOR GANÓ UN CUARTO ARGUMENTO, Y NO ES COSMÉTICO.** Las filas de la IT traen la
  leyenda de grado pegada con ` · ` («18.1 mm² · Leve (<20 mm²)»); sin ese corte la casilla
  publicaría la GRADUACIÓN, y el reparto que el D1 fijó es que la casilla publica la MEDICIÓN.
- ⚠️ **LA FR DE LA TRICÚSPIDE NO EXISTE, Y ES UNA PARADA.** La orden pedía tres casillas en esa
  columna y entraron dos: **ninguna función de la app calcula la FR de la IT** —`calcIT_ESC`
  produce `eroa` y `volR` y nada más— y la **Tabla 14 de la ASE 2017, folio 350, tampoco publica
  una banda de FR para esa válvula**. Faltan las dos mitades, la cuenta y el corte.
  `PENDIENTES.md` → **D2-1**.
- ⚠️ **EL VOL-R DE LA IAo DEPENDE DE LOS DOS DEL TSVI AUNQUE SU FÓRMULA NO LOS USE**, porque sus
  dos filas viven en el **mismo** `if` de `calcIA_ESC`. Lo destapó la sonda: la primera versión del
  aviso no los nombraba y la casilla salía vacía **con el placeholder vacío al lado** —un campo
  mudo que no dice qué le falta—. `PENDIENTES.md` → **D2-4**.
- ⚠️ **NINGUNA VIAJA CON EL ESTUDIO:** prefijo `vauto-`, que `_noEsDelEstudio` ya excluía.
  **Medido: 893 campos, mismo hash, cero claves `vauto-`.**

- **ONCE TARJETAS ⓘ: CUATRO NUEVAS, SIETE REESCRITAS, Y CERO GLOBOS DE LEGADO.** El registro
  `VINFO` pasa de 5 a **16** entradas. **Ninguna fórmula difiere de su guía.** La ecuación de
  continuidad aórtica se verificó **RENDERIZANDO** el PDF —`AVA × VTI_AV = CSA_LVOT × VTI_LVOT`,
  folio 6, y `CSA_LVOT = π(D/2)²`, folio 7, con el folio comprobado en el pie impreso— y coincide
  con `_avaContinuidad`. **Ningún corte se movió**: los once números de los siete textos viejos se
  verificaron contra la constante que la app aplica, no contra el recuerdo.
- ⚠️ **LOS SIETE `title` LARGOS SE RETIRARON, Y ESO ES LO QUE HACE QUE «CERO LEGADO» SEA UNA
  AFIRMACIÓN.** Un globo sin entrada cae al camino que lee el `title` de su fila: con los `title`
  afuera, una clave sin entrada abriría una tarjeta **vacía** y nadie lo notaría.
  **Lo que la tarjeta no repite NO se perdió:** bajó a «Referencia clínica», en dos bloques nuevos
  —«Salvedades de los parámetros de apoyo» y «Prótesis mitral — ASE 2024»—. El detalle del EOA, el
  DVI y el PPM mitrales **no estaba en ninguna otra superficie de la app**.
- **MECANISMO MEDIDO con clics y teclas reales:** toque abre, segundo toque cierra, Escape cierra y
  el clic afuera cierra, en las **once**; los 16 globos son `<button>`, **cero `title`** y **cero
  `abrirAyudaEco`**. A **1200, 390 y 360 px en los DOS temas** la tarjeta entra entera en el
  viewport y **el globo sigue siendo alcanzable después de abrirla** (30 de 30 lecturas), que es el
  defecto que el D1 encontró con su tarjeta más alta. **Captura PNG de seis tarjetas en los dos
  temas**, que es como el D1 cazó los acentos faltantes.
- ⚠️ **LOS TRES GLOBOS DE LA PRÓTESIS MIDEN 0×0 SIN MORFOLOGÍA PROTÉSICA**, así que se miden en una
  **escena protésica aparte**: sin ella, «no abre» se lee como «el mecanismo no funciona».

- **EL RÓTULO «PHT» → «THP»: 24 lugares en 25 líneas, en siete superficies.** El texto **visible**
  de Válvulas pasa de 5 PHT / 6 THP a **0 / 11** y el del ETE de 1 / 0 a **0 / 1**.
  ⚠️ **EL EXCEL CONSERVA DOS ENCABEZADOS QUE DICEN PHT, Y ES DELIBERADO.** `PHT IAo (ms)` y
  `TAVI RPV PHT (ms)` —y el prefijo de ordenamiento `PHT IAo`— no se tocan porque **el importador
  lee por NOMBRE DE ENCABEZADO**: renombrarlos descarta esas columnas en todo backup ya exportado.
  `ET THP (ms)` **ya decía THP**, así que el libro queda con dos nomenclaturas. La salida limpia es
  una tabla de **alias de ENTRADA**, el patrón que `LAB_XLS_LISTAS_LEGADO` ya usa para los valores.
  `PENDIENTES.md` → **D2-3**.
  ⚠️ **TAMPOCO SE TOCARON** la clave `AR PHT` del vocabulario del ecógrafo —es de ellos; su
  `etiq` visible sí cambió—, las **cinco citas literales en inglés** de las guías —alterar una cita
  la falsifica— ni los **44 comentarios de código** (`PENDIENTES.md` → **D2-5**).
- **EL INFORME FIRMADO DEL TAVI CAMBIA, Y ESTÁ MEDIDO**, en los tres estilos y sólo en el rótulo:
  «Prótesis TAVI de 26 mm. Insuficiencia paravalvular severa. **THP** 180 ms.». El EN SUMA no se
  mueve. Esa escena vive detrás de **CUATRO** puertas y la sonda informó «no cambia» dos veces
  sobre gestos que no ocurrieron — ver las trampas.

- **EL COLOR: CINCO AVISOS QUE SE VEÍAN GRISES.** `--amber` se define **sólo** dentro de
  `.amilo-root` y de `#sp-root`, así que fuera de ahí `color:var(--amber)` es inválido en tiempo de
  valor computado y cae al heredado. **Medido en HEAD:** `#im-pdf-metodo-aviso` y los **CUATRO** de
  la diastólica computaban `rgb(232,236,244)` de noche y `rgb(26,34,51)` de día, y
  `getPropertyValue('--amber')` devuelve **cadena vacía** en los siete nodos. Hoy los cinco dan
  `rgb(245,158,66)` y `rgb(217,123,31)`. **Control negativo:** `#diast-excl-aviso`, que ya estaba
  en `--orange`, no se movió.
  ⚠️ **SON CUATRO Y NO TRES en la diastólica** —la orden decía tres y el censo da cuatro— y
  **queda un QUINTO sin tocar**: `#vd-tei-aviso`, con el mismo defecto y la misma medición, fuera
  del alcance de la orden. Es **una línea**. `PENDIENTES.md` → **D2-2**, y TC-472 lo fija como
  límite declarado para que el día que se arregle el caso lo note.

- **Arnés: `scripts/_probe_iaitcols.mjs`** (A/B de solo lectura con `--file`, y `--captura --dest`),
  diez grupos (`campos`, `autos`, `globos`, `thp`, `tavi`, `color`, `superficies`, `controles`,
  `ancho`, `captura`). **Cobertura: TC-472**, **39 condiciones** —contadas instrumentando el propio
  caso para que publicara su `ex.length`, no a ojo— con cinco denominadores y cuatro controles
  negativos. **Verificado que sabe fallar contra HEAD en un worktree aparte: 22 de las 39 en rojo,
  y NINGUNA por excepción.**
- ⚠️ **CASOS ADAPTADOS: OCHO**, con el motivo escrito en cada uno. **TC-423** (dos veces: el
  reparto de columnas de la IAo, y después el globo nuevo que entra en el Tab), **TC-471** (de 12 a
  16 globos, y la condición se REFUERZA: ya no hay legado), **TC-298** y **TC-333** (la salvedad y
  la atribución, que pasan del `title` a la tarjeta y al manual), **TC-354** (el rótulo en su tabla
  de bandas), **TC-250** y **TC-262** (los rótulos del panel del Doppler importado), **TC-429** (el
  globo nuevo del área tricuspídea en el Tab) y **TC-440** (el nombre del voto en la discordancia
  de la IP). **CINCO de los ocho los destapó la SUITE COMPLETA**, no la corrida de zona.
- ⚠️ **ENTER NO ACTIVA UN CHECKBOX, Y EL CHECKBOX DEL TAVI NO ES EL CONTROL.** La escena del
  informe del TAVI informó «el informe no cambia» **dos veces** sobre gestos que no ocurrieron:
  primero porque el respaldo por tecla de `clicEn` manda Enter y la tecla de un checkbox es
  Espacio, y después porque `ete_tavi_incluir_chk` está en `display:none` con `tabindex="-1"` y el
  control real es el **botón** «Integrar al informe» (`[data-ete-chk="…"]`).
- ⚠️ **UN REGEX CON `\n` DENTRO DE UN TEMPLATE LITERAL NO PARSEA, Y LAS DOS FORMAS FALLAN DISTINTO.**
  La barra-ene se **cocina** a un salto real: `/\n/g` da «Invalid regular expression: missing /» y
  `'\n'` deja la cadena sin cerrar, «Invalid or unexpected token». Las dos aparecieron seguidas al
  escribir TC-472. Se nombra el salto por su código: `String.fromCharCode(10)`.
- ⚠️ **LA ESCENA BASE DABA UNA FR IMPOSIBLE Y LA CASILLA SALÍA VACÍA — Y COINCIDÍA IGUAL.** Con
  Ø TSVI 20 mm y VTI 20 cm el volumen eyectado es 62,8 ml contra un Vol-R de 71,4: la FR daba 114 %
  y la fila publicaba su explicación en vez de un número. **Una escena que no produce el valor que
  se quiere medir pasa la comparación sin medir nada.**
- ⚠️ **Me comí el acento grave TRES veces**, las tres en comentarios míos dentro del cuerpo de un
  caso, con el archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la
  línea exacta las tres; `node --check` apuntaba a la apertura del template. **Correr los dos.**

### La MITRAL EN PANTALLA: tres columnas de seis, el cuadro en tres bloques y los globos ⓘ (2026-10-14)

- **Es la PRIMERA MITAD («D1») del rediseño de Válvulas.** La segunda («D2»: insuficiencia aórtica y
  tricuspídea, estenosis aórtica y tricuspídea, el rótulo «PHT» → «THP» y los textos de los demás
  ⓘ) va en otro prompt y **depende de ésta**.
- Al **empezar**, `main` local y `origin/main` estaban los dos en **`0584e29`**, sin nada sin pushear
  —confirmado con un `git fetch` de verdad—, con los **cuatro** commits de la tanda del aviso de
  exclusiones ya incluidos **y pusheados por Maicol**. Los **cinco** commits de esta tanda quedan
  locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 1 ES LA BASE DE TODOS**: crea las cuatro casillas `vauto-` de la IM, `_imAutoDeFila`,
  `_imAutosSync` y el prefijo `vauto-` de `_noEsDelEstudio`. El **2** reescribe el cuadro y **le
  agrega** `IM_FILA_GRADO_CONT` y el tercer argumento de `sevFilaGradoPintar`; el **3** cuelga de
  `_imAutosSync` sólo por vecindad —su JS es independiente— pero **el 4 SÍ cuelga del 3**: la
  casilla del volumen eyectado nace con su globo `data-vinfo="vsv-tsvi"`, y sin el mecanismo del 3
  ese `onclick` llama a una función que no existe.
  ⚠️ **Y REVERTIR EL 2 SIN EL 1 ROMPE EL CUADRO, NO LA APP**: el bloque 2 nombra `im-eroa-cont-ref`,
  que nace en el 2, así que revertir sólo el 1 deja `_imAutosSync` sin existir y la llamada va con
  `typeof`… pero la llamada a `_celda` vive DENTRO de `_imAutosSync`, así que se va con ella: las
  tres celdas de continuidad quedarían mudas. Orden: **2 antes que 1**.
  **El 5 es TC-471 más documentación y el sello** y afirma el comportamiento de los cuatro:
  revertir cualquiera sin el 5 deja TC-471 en rojo —32 de sus 45 condiciones—.

- **Línea base al cierre: suite 481/485 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 436 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base, y `--todo` da 374 y 383, el mismo par—.** **CERO REGRESIONES**: los cuatro rojos son
  exactamente los de ENTRADA —**TC-223** (el documentado, falla por la fecha), **TC-376**,
  **TC-390** y **TC-406**—. **El denominador subió a 485**: esta tanda agregó **TC-471**. La de
  ENTRADA, medida en HEAD limpio en un worktree aparte, fue **480/484** con los mismos cuatro rojos.
  El `md5` de `index.html` no se movió durante ninguna de las dos corridas.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**.
- **EL SELLO DE VERSIÓN ESTABA AL DÍA AL EMPEZAR** (`v20261014-1743`, o sea que **L7 quedó cerrado**
  por la tanda anterior) y se volvió a sellar en el commit 5: **`v20261014-2125`**. La suite se midió
  **DESPUÉS** de sellar, con el `md5` quieto.

- **Dónde está todo:** `docs/mapa/valvulas-mitral-pantalla.md` (**mapa NUEVO**, 15,9 KB: la tabla de
  los 18 campos, las cinco casillas automáticas, los tres bloques, la columna 2 de la estenosis, el
  mecanismo de los globos y las seis trampas medidas), `docs/mapa/valvulas.md` → un **puntero**
  —⚠️ **se partió por eso**: estaba en 33,8 KB y hoy queda en **34,5**, todavía bajo el techo—,
  `docs/fuentes/FUENTES.md` → «Las CINCO TARJETAS de los globos ⓘ de la mitral», y
  `docs/PENDIENTES.md` → **siete** cosas declaradas y no tocadas (D1-1 a D1-7).

- **NO CAMBIA NINGUNA CUENTA, NINGÚN CORTE, NINGÚN GRADO, NINGUNA REGLA DE INTEGRACIÓN NI NINGÚN
  TEXTO DEL INFORME, Y ESTÁ MEDIDO.** A/B contra HEAD en los cuatro commits: **0 diferencias** en
  informe (tres estilos), EN SUMA, grados de las ocho lesiones, pastillas, token del Laboratorio,
  Excel en **436** columnas y los **893 campos del estudio** con el mismo hash y el mismo juego de
  claves. **Escenas que cambian de veredicto: NINGUNA.**

- **LAS CASILLAS AUTOMÁTICAS NO CALCULAN NADA: COPIAN SU FILA.** Las cinco nuevas —EROA, Vol-R y FR
  por PISA, la relación jet/AI y el volumen eyectado del TSVI— leen el texto que su fila del cuadro
  acaba de publicar, marca «(revisar)» incluida. Dueño único `_imAutosSync` + `_imAutoDeFila`.
  **Medido con teclas reales: 6 escenas × 4 casillas = 24 de 24 coinciden**, y la quinta coincide en
  las dos escenas de la estenosis.
  ⚠️ **LA LEYENDA DEL RÉGIMEN PROTÉSICO DEL JET SE RECORTA, por DOS espacios**, que es como esa fila
  la separa; `MARCA_REVISAR` lleva **uno solo**, así que sobrevive al recorte — que es lo que tiene
  que pasar, porque advierte sobre el número y no sobre su banda.
- ⚠️ **NINGUNA VIAJA CON EL ESTUDIO**: el prefijo `vauto-` entra en `_noEsDelEstudio` por el mismo
  argumento que `hfpep-`. **Medido: 893 campos, mismo hash, cero claves `vauto-`.** Y **no** hacía
  falta una columna de Excel, que era una de las paradas posibles de la orden.

- **EL CUADRO EN TRES BLOQUES, marcados por ATRIBUTO (`data-im-bloque`) y no por el texto de un
  rótulo** —la lección que el panel de Evidencia pagó con sus `<details>`—. El bloque 2 es una tabla
  de DOS columnas, PISA y continuidad, con el valor **y el grado** de cada celda.
  ⚠️ **LAS FILAS LLEVAN LAS DOS CLASES, `calc-row im-m2`**: el barrido de `limpiarCampos` es
  `.calc-box .calc-row span[id]`, así que sin `calc-row` los seis números dejarían de volver a «—».
  ⚠️ **LOS `id` DE LOS SPAN DE PISA NO SE TOCAN**: `eroa-val`, `volr-val` y `freg-val` son
  literalmente lo que el PDF publica y lo que `_imPisaSellar` congela.
  **La línea de fórmulas SALE** (pasa a las tarjetas) y **la cápsula «Severidad (continuidad)» SE
  CONSERVA**, subida al bloque 3: no es redundante —ahí va el grado de cada parámetro y acá la
  lectura volumétrica combinada más sus dos avisos, que no tienen otra superficie—.

- **LOS GLOBOS ⓘ: DOCE EN LA PESTAÑA, CINCO CON TARJETA NUEVA Y SIETE DE LEGADO.** Toque abre, toque
  cierra, afuera cierra, Escape cierra; son `<button>`, cero `title` y cero `abrirAyudaEco`.
  Los siete de legado muestran el `title` que su fila ya tenía, **leído del DOM**: ni una palabra
  duplicada, y sus textos se reescriben en D2.
  **El `title` de 748 caracteres de la EROA por continuidad se fue y NO se perdió**: vive —y ya
  vivía— en «Referencia clínica», fila «IM — EROA por continuidad y Vol-R».
- ⚠️ **LA TARJETA MÁS LARGA TAPABA SU PROPIO GLOBO, Y LO ENCONTRÓ LA SONDA.** Con el tope de altura
  en la caja entera, una tarjeta más alta que la pantalla se colocaba arriba de todo y cubría su
  ancla: el **segundo toque** no llegaba al botón —Escape y el clic afuera sí cerraban, así que no
  dejaba a nadie encerrado, pero una de las tres puertas no funcionaba—. La altura se acota al hueco
  del lado donde se abre.
- ⚠️ **EL GLOBO VIEJO MEDÍA 12×15 px Y NO 44×44, Y HUBO QUE MEDIR LOS DOS ÁRBOLES PARA SABERLO.** La
  regla global de 44 px lo matcheaba por su `onclick` **y no lo agrandaba**: era un `<span>`, o sea
  **inline**, y a ésos `min-height` no se les aplica. Un `<button>` es `inline-block`, así que la
  misma regla lo saltaba a 44 en ocho filas. El piso se acota a `pointer: coarse` —el precedente del
  glosario del panel—: escritorio **16×12** y el dedo gana los 44 px que el `<span>` **nunca tuvo**.

- **LA ESTENOSIS MITRAL: columna 2 en CUATRO campos** —Diám. TSVI · VTI TSVI · **Vol eyectado TSVI
  (nuevo)** · THP—. **El VTI Ao no estaba y sigue sin estar**, censado.
  **`_vsTsviCalc` es el dueño único** de `π·(d/20)²·vti`, que vivía duplicado en `calcIM_ESC` y en
  `calcContIM`, con una tercera copia dentro de `calcEM`. **El orden de operaciones se conserva letra
  por letra**, así que ningún número se mueve ni un bit — medido.
  ⚠️ **VERIFICADO CONTRA EL ORIGINAL, que era la parada de esa parte:** EAE/ASE 2009, folio 13,
  §B.1.4, **leída RENDERIZANDO a 700 dpi** porque el texto extraído devuelve los glifos partidos
  (`'MVA \x02 \x05\x01' / 'D2' / '4\x02\x01'`). Dice **`MVA = π (D²/4) (VTI_Aortic/VTI_mitral)`,
  con D en cm**: la app usa `π(d/20)²` con el Ø en mm, que es exactamente `(π/4)(d/10)²`. **COINCIDE.**
- **LAS NUEVE FÓRMULAS DE LAS CINCO TARJETAS SE VERIFICARON EN EL PDF ORIGINAL y ninguna difiere.**
  ASE 2017 folio 312 (`EROA = (6.28 × r² × Va)/PeakV_RegJet` y `RVol = EROA × VTI_RegJet`), folio 311
  (`RF = RVol/SV_RegValv` — y en la IM el SV de la válvula regurgitante **es** `Vol-R + SV del TSVI`,
  así que el denominador de la app ES el de la guía), y EAE/ASE 2009 folios 12 y 13.
- ⚠️ **UNA DIFERENCIA ENTRE LA APP Y LA GUÍA, REPORTADA Y NO CORREGIDA:** la EAE/ASE 2009 (p. 14)
  excluye la continuidad mitral **con fibrilación auricular** además de con IM o IAo significativa, y
  `emContMotivoNoVota` **no mira el ritmo**. Cambiar cuándo vota un método es contenido clínico y
  esta orden lo prohíbe. `PENDIENTES.md` → **D1-4**. La **tarjeta** sí publica la salvedad de la guía.

- **MAQUETA MEDIDA a 1200, 390 y 360 px en los DOS temas** (con la clase `light-mode` comprobada, que
  es el falso que la tanda del cartel de péptidos pagó): **18 campos en la IM y 12 en la EM, tres
  columnas visuales a 1200 px y una a 390 y 360, cero solapamientos, cero desbordes y sin barra
  horizontal**; la tarjeta entra entera en el viewport en las seis combinaciones.
- ⚠️ **EL COLOR SE MIDIÓ COMPUTADO Y APARECIÓ UN DEFECTO AJENO.** Lo nuevo usa `--orange`, `--text2`
  y `--accent2`, los tres globales: la línea «a tener en cuenta» da `rgb(245,158,66)` en oscuro y
  `rgb(217,123,31)` en claro. Pero **`#im-pdf-metodo-aviso` dice `var(--amber)` y se ve GRIS**
  —`rgb(232,236,244)` y `rgb(26,34,51)`—, que es el MISMO defecto que `X1` ya declara para los cuatro
  avisos de la diastólica. **No se tocó**: `PENDIENTES.md` → **D1-1**.

- **Arnés: `scripts/_probe_imcols.mjs`** (A/B de solo lectura con `--file`), ocho grupos (`campos`,
  `autos`, `refs`, `globos`, `em`, `superficies`, `controles`, `ancho`).
  **Cobertura: TC-471**, **45 condiciones** con seis denominadores y cuatro controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 32 de las 45 en rojo, y NINGUNA
  por excepción**; las trece que pasan son lo que esta tanda no mueve.
- ⚠️ **TC-471 MORÍA POR EXCEPCIÓN EN SU PRIMERA VERSIÓN** (`.placeholder` sobre `null`), que prueba
  que el árbol es distinto y no que el caso sabe medir. Toda lectura de un nodo nuevo va por un
  ayudante con centinela. Es la misma lección que TC-455 y TC-462 ya tienen escrita.
- ⚠️ **CASOS ADAPTADOS: CUATRO**, con el motivo escrito en cada uno. **TC-335** (dos veces: el rótulo
  pasó a «EROA POR continuidad» y después su `title` largo desapareció), **TC-297** (exigía la línea
  de fórmulas, que esta tanda saca), **TC-298** (exigía que el ⓘ fuera un `<span onclick>` que
  llevara al manual) y **TC-448** (fijaba el reparto viejo de 5+5+4 campos).
  ⚠️ **TC-448 LO DESTAPÓ LA SUITE COMPLETA**, no la corrida de zona: ninguna de mis listas de zona lo
  incluía.
- ⚠️ **UN GLOBO SIN GEOMETRÍA NO ANCLA NADA, y eso es lo correcto.** Los tres de la prótesis miden
  **0×0** mientras la morfología no sea protésica. Se mide con una **escena protésica aparte**; sin
  ella, «no abre» se lee como «el mecanismo no funciona».
- ⚠️ **EL HASH DE LOS CAMPOS HAY QUE ORDENARLO ANTES DE HASHEAR.** El objeto se arma en orden del
  DOM, así que **mover un campo de columna** cambia el string de JSON sin cambiar un solo valor: la
  primera corrida informó «893 campos iguales, hash distinto» y el hash era el único que hablaba.
- ⚠️ **LAS CINCO TARJETAS SALIERON SIN ACENTOS Y LO VIO LA CAPTURA, NO LA LECTURA.** Escribí sus
  textos con el reflejo de los cuerpos de sonda —donde un acento grave rompe el template— y se me
  fueron también los acentos NORMALES: «velocidad maxima», «por el en un latido», «la sistole»,
  «Area mitral por ecuacion de continuidad». Es **texto clínico de cara al médico**, no un
  comentario. Lo delató **mirar el PNG** de una tarjeta, que es para lo que están las capturas.
  Corregidos los trece textos, re-sellado (`v20261014-2125`) y la suite re-medida después.
- ⚠️ **Me comí el acento grave CINCO veces**, todas en comentarios míos dentro del cuerpo de un caso
  o del template de la sonda, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta las cinco; `node --check` apuntaba a la apertura
  del template, decenas de líneas antes. **Correr los dos, siempre.**


### El AVISO DE EXCLUSIONES MITRALES en las TRES guías, y la disfunción sistólica del VD en el LABORATORIO (2026-10-14)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`b2bec97`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **cuatro**
  commits de la tanda del Laboratorio de la estenosis mitral ya incluidos **y pusheados**. Los
  **cuatro** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 4 → 3 → 2 → 1.**
  ⚠️ **EL 1, EL 2 Y EL 3 NO SE LLAMAN ENTRE SÍ Y SE REVIERTEN EN CUALQUIER ORDEN**, que es raro en
  esta serie y conviene decirlo: el 1 toca el aviso de la diastólica (`DIAST_EXCL_REF`,
  `diastExclTexto`, `diastExclSync` y la inicialización de `h` en `diastAlgoRender`), el 2 el
  Laboratorio (`_labDisfSistVent`, las dos filas de `_LAB_HALLAZGOS` y la columna del Excel) y el 3
  el importador (`_labRangoValor`). Ninguno nombra nada de los otros dos.
  ⚠️ **PERO EL 2 ADAPTÓ 26 CASOS por el salto de 435 a 436 columnas**, así que revertirlo sin
  reponer esas afirmaciones deja la suite entera en rojo por el denominador del Excel, no por un
  defecto. **El 4 es TC-470 más documentación** y afirma el comportamiento de los tres: revertir
  cualquiera sin el 4 deja TC-470 en rojo —42 de sus 91 condiciones, verificado en un worktree
  aparte—.

- **Línea base al cierre: suite 480/484 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel en 436 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea
  base, y `--todo` da 374 y 383, el mismo par—.** **CERO REGRESIONES**: los **cuatro** rojos son
  exactamente los de ENTRADA documentados —**TC-223** (el documentado, falla por la fecha),
  **TC-376**, **TC-390** y **TC-406**—. **El denominador subió a 484**: esta tanda agregó **TC-470**.
  El `md5` de `index.html` no se movió durante la corrida (`d7583ebd…`).
  ⚠️ **LA DE ENTRADA, medida en HEAD limpio en un worktree aparte, fue 472/483 con el pendrive
  MONTADO, y sus ONCE rojos NO se restan contra los cuatro del cierre.** Siete eran de **ENTORNO** y
  lo dicen en su propia condición: **TC-131** y **TC-135** («la librería XLSX está disponible, llega
  por CDN»), **TC-148**, **TC-150**, **TC-151** y **TC-152** («PptxGenJS cargó por CDN») y —esto es
  nuevo— **TC-147**, que muere con `ReferenceError: Chart is not defined`, o sea **Chart.js por
  CDN**: es el mismo racimo de siempre con un tercer miembro. En la corrida de cierre los siete
  salieron **VERDES**, con el mismo árbol, que es la prueba de que eran entorno. **La comparación
  válida es que el conjunto de rojos NO-entorno es el MISMO en las dos puntas, y son esos cuatro.**
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista de ids con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. Por eso el total es sobre 484 y no sobre 485.

- **Dónde está todo:** `docs/mapa/exclusiones-laboratorio-vd.md` (**mapa NUEVO**, 16,5 KB: los dos
  bloques, la tabla de las nueve opciones de morfología, la referencia por guía y por ritmo, el
  censo de frases antes y después, la columna nueva y las seis trampas medidas),
  `docs/mapa/diastolica.md` → un **puntero de siete líneas**, `docs/mapa/informe-pdf-excel.md` → el
  conteo de columnas **436**, `docs/fuentes/FUENTES.md` → «Las EXCLUSIONES de los algoritmos de
  función diastólica — LAS TRES GUÍAS», y `docs/PENDIENTES.md` → **C1 marcado CERRADO** más **cinco**
  cosas declaradas y no tocadas (X1 a X5).

- **BLOQUE S · EL AVISO VALE PARA LAS TRES GUÍAS Y LOS DOS RITMOS, Y NO MUEVE NADA.** Hasta hoy
  hablaba **sólo con la ASE 2025 en ritmo sinusal**: un paciente con prótesis mitral evaluado por la
  BSE o por la ASE/EACVI 2016 corría el algoritmo sin que nada lo dijera. Decisión de Maicol: la
  función diastólica se **calcula igual que hoy en todos los casos** y lo único que entra es el
  cartel. **Dueño ÚNICO del texto: `diastExclTexto`**, al que llaman las DOS superficies —el cuadro
  gris y la ventana 🧭—, así que no se pueden desincronizar.
  ⚠️ **EN LA VENTANA VA EN LA INICIALIZACIÓN DE `h`, Y NO EN CADA SALIDA.** `diastAlgoRender` tiene
  **DOS** `host.innerHTML = h`: el de la rama de FA y el del final. Agregarlo en cada uno son dos
  puertas que se separan el día que alguien toque una.
- **LAS TRES GUÍAS ESCRIBEN LA MISMA LISTA, y lo único que cambia es la REFERENCIA.** ASE 2025 pie
  de la Figura 3 folio 554 (+ su nota ¶ sobre plastia, reemplazo y TEER) · BSE 2024 pie de la Figura
  17 pág. 36 en sinusal y pie de la Figura 19 pág. 39 en FA · ASE/EACVI 2016 folio 286, en prosa.
  ⚠️ **LA BSE ES LA ÚNICA CON UNA REFERENCIA POR RITMO**, porque es la única que escribe la lista dos
  veces. **La Figura 8 de la ASE 2025 —la de FA, folio 563— NO la repite**, censado el PDF completo,
  así que ahí se cita igual la Figura 3.
  ⚠️ **Y LA FIGURA 18 DE LA BSE NO LISTA LAS EXCLUSIONES MITRALES**: su pie (pág. 38) nombra bloqueo
  de rama, marcapaso apical del VD, resincronización y asistencia ventricular. El aviso sale igual
  con la BSE en sinusal **por las dos vías**, que es el lado conservador para un cartel que no
  cambia nada: avisa de más en esa vía y nunca de menos.
- **MEDIDO con teclas y clics reales:** las **NUEVE** opciones EXACTAS de «Morfología VM» una por
  una (12/12 coinciden, contando las tres escenas del selector de estenosis), los cuatro
  disparadores por las **tres guías y los dos ritmos** (**30/30**), y el grado final de la IM por la
  **vena contracta** (**24/24**) con el grado LEÍDO —0 / 1 / 2 / 4— y sólo el 4 disparando.
  ⚠️ **NO HAY OPCIÓN DE PLASTIA NI DE ANULOPLASTIA MITRAL EN LA MORFOLOGÍA**, y las tres guías las
  excluyen; tampoco hay campo para un TEER ya hecho. El aviso **nombra de menos**, que es el lado
  correcto. `PENDIENTES.md` → X2.
- ⚠️ **EL COLOR ÁMBAR NO ERA ÁMBAR, Y ESTÁ MEDIDO EN HEAD.** `--amber` se define **sólo dentro de
  `.amilo-root`**, así que fuera de ahí `color: var(--amber)` es **inválido en tiempo de valor
  computado** y cae al heredado: los **cuatro** avisos de la diastólica computaban
  `rgb(232, 236, 244)`, el gris del texto normal, con el comentario diciendo «ámbar» al lado. El de
  exclusiones pasó a `var(--orange)` —global y theme-aware— y hoy computa `rgb(245, 158, 66)`.
  **Los otros tres no se tocaron**: son del protocolo y de la BSE y no son de esta tanda.
  `PENDIENTES.md` → X1.
- **CONTROL NEGATIVO MAYOR: 12 escenas con el aviso prendido y apagado por las tres guías, 0
  diferencias contra HEAD** en informe (3 estilos), EN SUMA (3), **Excel con sus 435 columnas y su
  hash**, franja del PPT, grado del Laboratorio y hash de los campos guardados. Y **captura en los
  dos temas**, cuadro y ventana, con los cuatro PNG de `md5` distinto —o sea que la clase
  `light-mode` quedó puesta de verdad—.

- **BLOQUE R1 · EL LABORATORIO CONTABA LA DISFUNCIÓN SISTÓLICA DEL VD COMO DEL VI.** Lo reportó
  Maicol. La categoría clasificaba con `/disfunci[oó]n\s+sist[oó]lica|FEVI\s+[<>]?\s*[0-4]\d/i`,
  que **no distingue el ventrículo**, así que todo estudio con el VD alterado inflaba la estadística
  del izquierdo. **`_labDisfSistVent` es el dueño único** y clasifica **FRASE POR FRASE**: parte por
  `.`, `;` y salto de línea —los mismos tres cortes que `_labMenciona` ya usa para su ventana de
  negación— y manda la frase al VD cuando ELLA MISMA nombra el ventrículo derecho (`VD`, `HVD` o
  «ventrículo derecho»). Dentro de una frase, la detección de negaciones es **exactamente la de
  HEAD**.
- ⚠️ **LA VÍA DE LA FEVI NO SE PARTE, Y ES DELIBERADO.** `FEVI 45` es del VI por construcción, así
  que suma al VI aunque la frase nombre también el VD: partirla sólo podría **perder** cuentas que
  HEAD tenía, y lo único que se le quita al VI son las frases de disfunción que hablan del derecho.
- **EL CENSO, MEDIDO CON EL INFORME GENERADO: 12 escenas × 3 estilos = 36 celdas, CAMBIAN 21.** Las
  seis familias de frase del VD —`VD dilatado…`, `VD de dimensiones normales…`, `VD con…`, `HVD
  con…`, `VD dilatado e hipertrófico…` y `Disfunción sistólica severa del VD (FAC N%)`— en los tres
  estilos, más la escena con los dos ventrículos. Las tres del VI y los dos controles negativos no
  se mueven. **Ninguna frase es ambigua**: todas las del VD lo nombran en su propia oración y
  ninguna del VI lo nombra. **El EN SUMA y el informe salen IDÉNTICOS a HEAD en las 12 escenas.**
- ⚠️ **CON EL ESTILO CONCISO LA DISFUNCIÓN DEL VI NO ENTRA EN LA CATEGORÍA, Y ES PREEXISTENTE.** Su
  frase es «FEVI levemente reducida (45 %)», sin la palabra y sin el número pegado a la sigla; en el
  estándar entra por «FEVI 45» y en el narrativo por «compatible con disfunción sistólica leve». O
  sea que la misma cohorte da una prevalencia distinta según el estilo con que se firmaron los
  informes. **No se tocó** —cambia qué estudios entran en la categoría—: `PENDIENTES.md` → X3.
- **LA CATEGORÍA NUEVA APARECE EN LOS TRES CONSUMIDORES POR CONSTRUCCIÓN**, porque `_LAB_HALLAZGOS`
  es **una** lista cerrada que leen el dashboard, el PDF de auditoría y el PPT.
  ⚠️ **EL FILTRO DE COHORTE NO TIENE NINGUNA CATEGORÍA DE DISFUNCIÓN SISTÓLICA, Y ESTÁ MEDIDO:** sus
  cinco selectores son `filtro-fevi` (numérica), `filtro-geom`, `filtro-diast`, `filtro-valv` y
  `filtro-interes`. No hubo nada que agregarle, y TC-470 lo afirma para que el día que se agregue uno
  se note.
  ⚠️ **Y `_labHallazgosCuenta` CORTA EN OCHO** (`.slice(0, 8)`): con una novena categoría, una
  cohorte donde la del VD sea frecuente puede desplazar a otra del top 8. `PENDIENTES.md` → X5.
- **EL EXCEL PASA DE 435 A 436 COLUMNAS, UNA SOLA Y AUTORIZADA.** `DisfSist_VD`, declarada en el
  bloque **«5 · VENTRÍCULO DERECHO»** —y eso es lo que decide su posición, porque `_labOrdenarCols`
  manda al final lo que el mapa no conoce y después reagrupa por bloque—. Medido: **índice 50, entre
  `FAC VD (%)` y `Área AD (cm²)`**; **ninguna columna existente cambió de valor**, comparadas clave
  por clave contra HEAD en 12 escenas; ninguna desaparece. Es **derivada**: no entra en
  `LAB_XLS_MAP`, no se reimporta, y tiene su fila en la hoja Leyenda.
  **Reverificado** que los consumidores leen por NOMBRE: el export arma un objeto, el importador lee
  por encabezado, y **CeiboAnalytics no lee este Excel** (cero `XLSX.read`, cero `sheet_to_json`).
  ⚠️ **No hay columna gemela para el VI**, que es la decisión de la orden. `PENDIENTES.md` → X4.
- **LOS ESTUDIOS GUARDADOS NO SE MIGRAN:** el Laboratorio los lee del texto guardado, así que se
  reclasifican solos al calcular. No se reescribió un solo registro.

- **BLOQUE R2 · EL IMPORTADOR COMPARA EL LARS POR MAGNITUD, y cierra C1.** La pantalla lo lee en
  valor absoluto desde el 2026-10-12 —un −32 vota como 32 y **no** se marca— pero el importador
  comparaba el **crudo** contra `lars:[0,60]`, la única banda **asimétrica** de la tabla: una
  planilla con un LARS negativo perdía la **fila entera**. **`_labRangoValor(dest, v)`** es el dueño
  y **no tiene lista propia**: le pregunta a `_DIAST_STRAIN_ABS_MARCA`, que es el dueño que la
  pantalla ya usa. Lo consultan la **guarda** del importador y la **ayuda** de la plantilla, que es
  la otra superficie del mismo rango.
  **Medido, nueve valores por los dos signos: CAMBIAN EXACTAMENTE DOS** —el **−32** y el **−60**,
  que HEAD rechazaba y hoy acepta—; ±61 y ±80 se rechazaban y se siguen rechazando. Y **las dos
  puertas concuerdan**: con teclas reales ±32 no lleva marca y ±80 lleva «(revisar)».
  ⚠️ **`ai_strain_ct` NO SUFRE LO MISMO Y ESTÁ MEDIDO:** su banda ya es simétrica (`[-60,60]`), así
  que comparar el crudo contra ella es exactamente comparar la magnitud contra su mitad positiva.
  **El valor guardado no cambia** y el Excel no gana ninguna columna por este bloque.

- **Arneses: `scripts/_probe_exclusiones.mjs`** (siete grupos: `morf`, `guias`, `im`, `ventana`,
  `superficies`, `controles`, `captura`) y **`scripts/_probe_labdisf.mjs`** (cuatro: `censo`,
  `excel`, `lars`, `controles`), los dos A/B de solo lectura con `--file`.
  **Cobertura: TC-470**, **91 condiciones** —contadas instrumentando el propio caso para que
  publicara su `ex.length`, no a ojo— con **ocho** denominadores y **doce** controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 42 de las 91 en rojo, y NINGUNA
  por excepción**; las 49 que pasan son lo que esta tanda no mueve.
- ⚠️ **`showTab('valvulas')` CIERRA LO QUE EL CLIC ACABA DE ABRIR**, porque corre
  `valvCerrarTarjetas`. La sonda clickeó **cuatro veces** la sección de la mitral, el clic llegó al
  blanco las cuatro —`esElBlanco: true`, medido— y la sección salía cerrada igual. Se llama **sólo
  si la pestaña no está activa**.
- ⚠️ **`im_vc` VIVE DETRÁS DE DOS PUERTAS Y LOS DOS NOMBRES NO COINCIDEN:** el contenedor oculto es
  `#bloque-insuf-mitral` y el `onclick` dice `valvDatosTog('caja-insuf-mitral')`, así que el
  buscador genérico de `revelar()` no da con él; y arriba hay otra, `#ete-seccion-valv-mitral`, que
  abre `toggleEteSeccion('valv-mitral', this)` —con la coma y el `this`, así que buscar el literal
  con paréntesis cerrado tampoco matchea—.
- ⚠️ **UN TECLEO QUE NO QUEDA NO ES UNA MEDICIÓN:** `tipear()` ahora **aborta** si el valor no quedó.
  Sin eso, la sonda informó «no avisa» en 24 escenas sobre un campo que nunca se cargó.
- ⚠️ **EL ESTILO DEL INFORME CAMBIA EL DENOMINADOR DEL CENSO:** midiendo en el estilo por omisión,
  «diez de las doce escenas emiten una frase» daba **7**, porque en el conciso la del VI no existe.
  TC-470 fija `setEstiloInforme('narrativo')`.
- ⚠️ **Me comí el acento grave CUATRO veces**, todas en comentarios míos dentro del template de una
  sonda. `node --check` dio la línea exacta las cuatro, porque el culpable estaba en el mismo
  template; `scripts/check_backticks.py` **no las alcanza**, porque su cobertura es el cuerpo de un
  `caso(...)` y el de la sonda inyectada, y las mías estaban en el objeto `SONDA`. **Correr los dos,
  y barrer el cuerpo del template después de CADA edición, no sólo antes del commit.**

### La ESTENOSIS MITRAL NATIVA en el LABORATORIO: seis categorías desde los DATOS y dos casillas superponibles (2026-10-14)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`38ad16e`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **cinco**
  commits de la tanda de las cuatro partes chicas de Válvulas ya incluidos **y pusheados**. Los
  **cuatro** commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 4 → 3 → 2 → 1.**
  El **1** crea el dueño único (`_labEmLectura`), las cuatro constantes y `_labEmSevVis`, y **el 2 y
  el 3 cuelgan de él**. ⚠️ **PERO REVERTIR EL 1 SOLO NO ROMPE LA CARGA, Y SÍ ROMPE EL PDF.** Los dos
  consumidores de pantalla —`_labEmBarras` y `_labEmCasillas`— lo llaman con `typeof` y salen por su
  guarda, y las cuatro líneas de `window.*` que quedarían vivas nombran sólo funciones del 2 y del 3;
  pero la rama `modo === 'em'` del **PDF de auditoría** nombra `LAB_EM_CAT_ORDEN` y `_labEmLectura`
  **SIN guarda**, así que ahí un `ReferenceError` se lleva la exportación entera. No la carga, porque
  está dentro de un cuerpo de función: la diferencia entre las dos cosas es lo que hay que saber
  antes de revertir.
  ⚠️ **Y EL 3 TIENE QUE REVERTIRSE ANTES QUE EL 2.** La línea de exportación que el 3 **reescribe**
  —`window._labEmBarras = _labEmBarras; window._labEmCasillas = _labEmCasillas;`— nombra
  `_labEmBarras`, que **nace en el 2**, y está en **columna 0, fuera de todo `try`** (el `try` de esa
  zona es de `_labEmConteoPintar` y cierra antes). Revertir el 2 primero deja una referencia de
  **NIVEL SUPERIOR** a una función que no existe, y un `ReferenceError` en la evaluación de un
  `<script>` **aborta el bloque COMPLETO** — o sea la app con cero pestañas con geometría.
  **El 4 es TC-469 más documentación** y afirma el comportamiento de los tres: revertir cualquiera
  sin el 4 deja TC-469 en rojo —51 de sus 55 condiciones, verificado en un worktree aparte—.

- **Línea base al cierre: suite 466/483 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 435 columnas con el hash IDÉNTICO a HEAD, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada
  uno —IDÉNTICO a la línea base, y `--todo` da 374 y 383, el mismo par—.** **CERO REGRESIONES**, y
  los 17 rojos se reparten en tres grupos que **no se restan**:
  · **ONCE son de ENTORNO y lo dicen en su propia condición-denominador**: TC-131, TC-135, TC-148,
    TC-150, TC-151, TC-152, TC-155, TC-156, TC-157, TC-162 y TC-165, todos de **Excel y PPT**,
    fallan en «la librería XLSX está disponible (llega por CDN)» y «PptxGenJS cargó por CDN».
    ⚠️ **MEDIDO: no es que el CDN esté caído, es que TARDA MÁS QUE EL PRESUPUESTO.** `cdnjs` contesta
    **200 en 8,0 s** y la red está arriba (google 200), pero esos casos esperan **6 s** y se rinden.
    Es el defecto de entorno que TC-148 ya documenta, con el racimo entero en vez de uno solo.
  · **DOS son los inestables por orden de corrida conocidos**: **TC-246** y **TC-252**, los dos
    **VERDES corridos solos** sobre el mismo árbol. **Repetir antes de sospechar.**
  · **CUATRO son los de ENTRADA y NO son regresiones**: **TC-223** (el documentado, falla por la
    fecha), **TC-376**, **TC-390** y **TC-406**.
  O sea que **el conjunto de rojos que no son entorno ni orden es exactamente esos cuatro**, que es
  la comparación válida. **El denominador subió a 484**: esta tanda agregó **TC-469**.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista de ids con
  `grep -o "^caso('[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. Por eso el total es sobre 483 y no sobre 484.
  El `md5` de `index.html` no se movió durante la corrida (`a1b06352…`).

- **Dónde está todo:** `docs/mapa/laboratorio-estenosis-mitral.md` (**mapa NUEVO**, 10,2 KB: el
  problema, los dueños por nombre, las seis categorías, las dos casillas, lo que NO se reimplementa,
  las siete decisiones, las superficies una por una y las siete trampas medidas),
  `docs/mapa/congenitas-otros.md` y `docs/mapa/valvulas.md` → sendos punteros —el de válvulas avisa
  que **mover un corte de `emCategoria` mueve las seis categorías del Laboratorio**, porque
  `_labEmLectura` consume sus mismas constantes—, `docs/fuentes/FUENTES.md` → «Los NOMBRES de los
  rangos de área de la estenosis mitral, guía por guía» (las cuatro guías con su folio comprobado en
  el pie impreso), y `docs/PENDIENTES.md` → **siete** cosas declaradas y no tocadas (L1 a L7).
  ⚠️ `valvulas.md` quedó en **33,8 KB**, o sea a 1,2 KB del techo de 35: **la próxima tanda que lo
  toque conviene que lo parta.**

- ⚠️ **EL SELLO DE VERSIÓN QUEDÓ VIEJO EN EL TERCER COMMIT Y NO SE CORRIGIÓ ACÁ.** Medido:
  `sellar_version.py --check` dice que `index.html` se modificó **68 min después** de sellarlo
  —`ECO_BUILD` en `20261014-0633` contra un commit de las `07:46`—, así que el pie de la app miente
  sobre qué versión se mira, que es justo lo que ese sello evita. **No se re-selló en el commit de
  documentación a propósito:** escribir en `index.html` después de medir la línea base sobre él
  publicaría una línea base de un `md5` que no es el del árbol. Va **con el próximo commit que toque
  `index.html`**, que es cuando la regla lo pide. `PENDIENTES.md` → L7.

- **EL PROBLEMA ERA QUE EL LABORATORIO LEÍA LA MITRAL COMO A LAS OTRAS SIETE, Y YA NO ALCANZA.**
  Leía `_labEstenSev(inf,'em_grado')`, una **regex sobre el token guardado**. Desde que el selector
  es binario (2026-10-13) la cubeta **«Moderada» quedó vacía por construcción**, la palabra que el
  Laboratorio imprimía —«Severa»— **no es la que el informe firmado publica desde el 2026-10-11**, y
  el token **no dice POR QUÉ**: una estenosis afirmada por un AVm de 0,8 cm², otra por 1,4 y otra
  sólo por un gradiente de 12 mmHg salían las tres como «Severa».

- **LAS SEIS CATEGORÍAS SON MUTUAMENTE EXCLUYENTES Y SE CALCULAN DESDE LOS DATOS**, con el área
  primero en la cascada: `sig_area_1` (≤1,0) · `sig_area_15` (>1,0 a ≤1,5) · `sig_grad`
  (significativa sólo por gradiente) · `grad_elev` (no significativa con gradiente elevado) · `sin` ·
  `sig_sin_num`. **Las dos casillas (B) se SUPERPONEN** —por área y por gradiente— y por eso se puede
  contar la intersección; marcadas las dos, el filtro exige las dos.
  ⚠️ **EL SUB-RANGO DE 1,0 cm² ES LA FRONTERA DE UN RÓTULO Y NO UN CORTE CLÍNICO.** La app sigue
  graduando con un solo corte de área y **no se movió ningún corte ni ningún operador**.
- ⚠️ **EL RÓTULO LLEVA EL RANGO Y NO UN NOMBRE DE GUÍA, PORQUE LOS NOMBRES CHOCAN.** El mismo
  **1,2 cm²** es **«moderada»** para la EAE/ASE 2009 y **«severa»** para la ASE 2023, la ACC/AHA 2020
  y la ESC/EACTS 2025; y el 1,6–2,5 que la ASE 2023 llama «Progressive (Moderate)» es «Mild» para la
  EAE/ASE 2009. Cualquier nombre habría que atribuirlo a una guía que otra desmiente.
  ⚠️ **Y DOS DE LAS TRES PREMISAS CON QUE SE PIDIÓ EL TRABAJO SON FALSAS, CENSADAS EN LOS PDF
  COMPLETOS:** la ESC escribe **«clinically severe MS»** y no «clínicamente significativa»
  —*«clinically significant»* aparece 12 veces y **ninguna** sobre la mitral—, y la categoría **«muy
  severa» NO EXISTE** para la EM en la ACC/AHA —*«very severe»* 11 veces y ninguna sobre la mitral—.
  La tercera, que la EAE/ASE 2009 llama «moderada» a 1,0–1,5 y «severa» a <1,0, **es cierta**,
  verificada **renderizando** la Tabla 9: sus valores son una imagen.

- **NO SE REIMPLEMENTA LA REGLA: SE LE PREGUNTA A SUS DUEÑOS.** `_labEmLectura` consume
  `emThpValido`, `emContValido` y `emImSignificativa` —las tres aceptan `src` justamente para esto—
  más `AVM_SEVERA_MAX`, `EM_GMEDIO_ELEVADO_MIN` y `EM_GMEDIO_SIGNIF_MIN`.
  ⚠️ **`emCategoria()` NO SE PUEDE LLAMAR, Y ESTÁ MEDIDO:** no toma argumentos y lee el DOM por
  `v(id)` y `protNoGradua('vm_morf')`, y el Laboratorio trabaja sobre un **registro archivado**.
- **CON IM SIGNIFICATIVA EL GRADIENTE NO VOTA, LAS DOS BANDAS**, igual que `emCategoria` —la decisión
  de Maicol del 2026-10-11—, y **el área sigue votando**. Si el Laboratorio lo contara igual diría
  «significativa sólo por gradiente» sobre un estudio cuyo informe firmado dice «Gradiente
  transmitral elevado» **sin** la palabra estenosis: dos lecturas del mismo dato en la misma app.
- **UN MÉTODO QUE EL MÉDICO SACÓ DE «INCLUIR EN EL INFORME» NO VOTA, Y CON LA CLAVE AUSENTE SÍ.** Es
  el espejo exacto de `emMetodoIncluido`: un estudio anterior al selector (2026-10-11) no trae
  `em_pdf_plan__chk`, y leerlo como desmarcado le borraría al Laboratorio **la estenosis que su
  propio PDF firmado afirma**. **No se migra nada.**
- **SIN NINGÚN DATO DE ESTA VÁLVULA EL ESTUDIO QUEDA FUERA DE TODAS LAS CATEGORÍAS**, ni siquiera en
  «Sin estenosis»: afirmar ausencia sobre una mitral que nadie midió no es medir prevalencia. La
  diferencia se declara al pie del gráfico. **Medido con teclas reales de punta a punta**: cargar
  AVm 1,2 y gradiente 12 da `sig_area_15`, y **borrar los dos deja la lectura en `null`**.
- **EL CERO NO ES UNA MEDICIÓN Y UN VALOR FUERA DE BANDA NO VOTA**, las dos guardas de `emCategoria`.
  ⚠️ **La banda del gradiente es `[1,60]` y sale de `DCM_RANGO`, que `_labRango` fusiona — NO de
  `LAB_XLS_RANGO_PROPIO`, donde `em_gmedio` no tiene entrada propia (medido).** Sin banda, un 600
  cruzaría el `≥10` y publicaría «significativa sólo por gradiente».
- **SOBRE PRÓTESIS MITRAL NO SE CLASIFICA**: la regla es de válvula nativa.

- **EL ROTULO «Significativa» SE TRADUCE SÓLO EN LA MITRAL, Y EL VALOR GUARDADO NO CAMBIA.**
  `em_grado` sigue siendo `severa`/`leve` —es lo que leen el Excel, el importador y `VALVSIG`— y
  `_labEmSevVis` cambia cómo se **escribe**. Medido en los dos árboles: `Severa`→«Significativa»,
  `Leve`/`Moderada`→«No significativa», `Sin`→«Sin estenosis», y un token ajeno pasa **sin tocarse**.
- ⚠️ **LA TABLA DE OCHO FILAS Y EL GRÁFICO APILADO SIGUEN CONTANDO POR EL TOKEN, A PROPÓSITO.** Sus
  cuatro columnas las comparten las OCHO lesiones, así que cambiarle el conteo a la mitral se lo
  cambia a las otras siete. Lo que entró es una **nota al pie** que declara cómo se leen. Por eso la
  fila de la EM **puede diferir de las barras de la misma tarjeta**: un estudio con AVm 2,0 cm² y el
  botón en «Significativa» cuenta «Sev» ahí y «Sin estenosis» abajo. `PENDIENTES.md` → L1.
- ⚠️ **EL EXCEL NO EXPORTA EL GRADIENTE MEDIO MITRAL, ASÍ QUE LAS CATEGORÍAS NO SE PUEDEN RECALCULAR
  DESDE EL LIBRO.** `em_gmedio` tiene **cero** apariciones en el exportador. **No se agregó ninguna
  columna** —la orden lo prohíbe—: las tres alternativas, con la conservadora marcada, están en
  `PENDIENTES.md` → L3.

- **CONTROL NEGATIVO MAYOR, A/B contra HEAD con un escenario CARGADO en las ocho lesiones:
  0 diferencias** en el **Excel con sus 435 columnas y el hash IDÉNTICO** (`945166006` en los dos
  árboles), en el Excel del formulario vacío, en `_labValvCounts` (las ocho columnas del apilado) y
  en la lectura de severidad de las otras lesiones —incluido `_labEstenSev(em_grado)`, que **sigue
  devolviendo «Severa» sin tocarse**—.

- **Arnés: `scripts/_probe_labem.mjs`** (A/B de solo lectura con `--file`, y `--pdfdump`), **nueve**
  grupos (`lectura`, `excluy`, `sindato`, `legado`, `barras`, `filtro`, `pdf`, `teclas`,
  `controles`), con el PDF y el PPT **generados de verdad** interceptando jsPDF.
  **Cobertura: TC-469**, **55 condiciones** —contadas, no estimadas— con **cuatro** denominadores y
  **nueve** controles negativos. **Verificado que sabe fallar contra HEAD en un worktree aparte: 51
  de las 55 en rojo, y NINGUNA por excepción**; las cuatro que pasan son **exactamente** el grupo de
  controles negativos, o sea lo que esta tanda no mueve.
- ⚠️ **EL LABORATORIO LEE REGISTROS Y NO EL FORMULARIO**, así que las escenas de TC-469 son objetos
  de estudio archivado y no tecleos; las mismas escenas con **teclas y clics reales** las corre la
  sonda, que es la que midió los síntomas contra HEAD. Mismo reparto que TC-460 y TC-463.
- ⚠️ **ESCRIBÍ «56 condiciones» ANTES DE CONTARLAS Y SON 55.** Lo cazó instrumentar el propio caso
  para que publicara su `ex.length`, no contar los `ex.push` a ojo —varios están dentro de un
  `forEach`—. Es la tercera vez que este archivo lo anota: **contar y después escribir.**
- ⚠️ **UN CRITERIO DE COHORTE INCOMPLETO RECHAZA TODO.** `_labCohorteOk` evalúa todos los criterios y
  una clave ausente deja comparaciones contra `undefined`: la primera corrida del grupo `filtro` dio
  **cero en las cuatro cuentas** con pinta de medición buena. La base se le pide al dueño
  (`_labCohorteLeer`) y **no se escribe a mano** — una lista cableada se desactualiza el día que el
  panel gane un filtro.
- ⚠️ **UN BOOLEANO EN `false` DEJABA LA COHORTE ACTIVA PARA SIEMPRE.** `_labCohorteLeer` decide si hay
  filtros con «distinto de vacío, `null` y `undefined`», y una casilla sin tildar pasa los tres. Y el
  reset escribe `e.value = ''`, que en un checkbox cambia el *value* y **deja el tilde puesto**.
- ⚠️ **`_pc` ES LOCAL DEL PDF DE AUDITORÍA**: nombrarla desde el PPT —otra función, otro scope— es un
  `ReferenceError` que se lleva la exportación entera.
- ⚠️ **EL PIE DE «VÁLVULA MÁS FRECUENTE» HABRÍA DICHO «Estenosis mitral (EM) moderada».** Su ternario
  compara `b.Severa > b.Moderada`, y con las cubetas de la EM en cero cae en la rama del empate.
- ⚠️ **`scripts/check_backticks.py` NO ALCANZÓ A LOS ACENTOS GRAVES DE LOS COMENTARIOS DENTRO DEL
  TEMPLATE DE LA SONDA**, tres veces en esta tanda. Los cazó `node --check`. **Correr los dos.**

### Las CUATRO PARTES CHICAS de Válvulas: el VTI de la ET, la casilla de PISA, «Nuevo estudio» y la ayuda de la EM (2026-10-14)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`2d98133`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **tres**
  commits de la tanda de los criterios del HFA-PEFF ya incluidos **y pusheados**. Los **cinco**
  commits de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 1, EL 2, EL 3 Y EL 4 NO SE LLAMAN ENTRE SÍ Y SE REVIERTEN EN CUALQUIER ORDEN**, que es
  raro en esta serie y conviene decirlo: el 1 toca `ET_CRIT` y `etEstado`, el 2 el panel de métodos
  de la IM, el 3 dos líneas de `limpiarCampos` y el 4 sólo texto de ayuda.
  ⚠️ **PERO EL 1 LLEVA LA SONDA** (`scripts/_probe_valvcuatro.mjs`), que los otros tres también
  usan, y la adaptación de **cinco** casos; revertirlo deja a los demás sin arnés. **El 5 es TC-468
  más documentación** y afirma el comportamiento de los cuatro: revertir cualquiera sin el 5 deja
  TC-468 en rojo —21 de sus 35 condiciones, verificado en un worktree aparte—. Y **el 4 adaptó
  TC-307**, cuya condición exigía lo contrario de lo que la regla vigente publica: revertir el 4 sin
  reponer esa afirmación lo deja midiendo de menos, no en rojo.

- **Línea base al cierre: suite 478/482 con el pendrive `DISK_IMG` MONTADO, Semgrep 127 / 0 ERROR,
  Excel 435 columnas con el hash IDÉNTICO a HEAD, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada
  uno —IDÉNTICO a la línea base, y `--todo` da 374 y 383, el mismo par—.** Los cuatro rojos son los
  de ENTRADA y NO son regresiones: **TC-223** (el documentado, falla por la fecha), **TC-376**,
  **TC-390** y **TC-406**. **El denominador subió a 482**: esta tanda agregó **TC-468**.
  ⚠️ **EL PENDRIVE ESTABA AFUERA AL ABRIR Y MONTADO AL CERRAR, ASÍ QUE LAS DOS CIFRAS NO SE RESTAN.**
  La de ENTRADA, medida en HEAD limpio el 2026-10-14 con el pendrive **AFUERA**, fue **460/481** con
  **21** rojos: los **cuatro** de arriba más los **diecisiete** de **TC-181…TC-197**, que son los del
  pendrive y son ENTORNO. En la corrida de cierre esos diecisiete salieron **VERDES**, que es la
  prueba de que lo eran. **La comparación válida es que el conjunto de rojos NO-pendrive es el MISMO
  en las dos puntas, y son esos cuatro.** `ls /Volumes/DISK_IMG` ANTES de comparar dos cifras.
  El `md5` de `index.html` no se movió durante ninguna de las dos corridas.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista de ids con
  `grep -o "^caso('[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. Por eso los totales son sobre 481 y 482 y no sobre 482 y 483.
  ⚠️ **Y LA PRIMERA CORRIDA DE LA LÍNEA BASE SE COLGÓ 43 MINUTOS EN TC-228**, con node al 0 % de CPU
  y el log sin escribir, sobre HEAD limpio. Corrido **solo** pasó en segundos. Es la trampa de
  `cdp.mjs` que este archivo ya documenta, no un caso que necesite el pendrive: **repetir antes de
  sospechar**, y mirar el `mtime` del log antes de creer que una corrida avanza.

- **Dónde está todo:** `docs/mapa/valvulas-manual-binario.md` → **tres secciones nuevas** (6 la
  casilla de PISA, 7 lo que «Nuevo estudio» dejaba vivo, 8 las tres afirmaciones de la ayuda) más el
  operador nuevo en la 4; el mapa pasó de 16,2 a **29,2 KB**, medido, así que **no hizo falta
  partirlo** —pero la próxima tanda que lo toque conviene que mida antes de escribir—.
  `docs/fuentes/FUENTES.md` → el operador del VTI con su folio y la trampa de codificación, la
  entrada nueva de la ESC/EACTS 2025 folio 4680, y `### asePandian2023` con el puntero.
  `docs/PENDIENTES.md` → **M2, M5, M7 y B-9 marcados CERRADOS** más **ocho** cosas nuevas declaradas
  y no tocadas (Q1 a Q8).

- **EL VTI DE ENTRADA TRICUSPÍDEO PASA A `>= 60 cm`, Y GANA LA GUÍA MÁS NUEVA.** Decisión de Maicol.
  La **ASE 2023** (Pandian, JASE enero 2023), **folio 16** —verificado en el encabezado impreso—
  escribe *«inflow VTI ≥60 cm»*, leído **renderizando a 600 dpi**; la EAE/ASE 2009 escribe `>60` y
  sigue siendo la fuente de los otros tres cortes. **Ninguna guía más nueva lo contradice**: ni la
  ESC/EACTS 2025 ni el Praz 2025 lo nombran, censados los dos PDF completos.
  ⚠️ **EL TEXTO EXTRAÍDO DE ESE PDF NO SIRVE PARA LEER EL OPERADOR, Y NO ES PORQUE SEA UNA IMAGEN:**
  la fuente codifica `≥` como **`$`** y `≤` como **`#`**, así que `pdftotext` devuelve «the mean
  gradient is $5 mmHg, inflow VTI $60 cm». Hay que renderizar.
  **MEDIDO con teclas reales, seis valores por el campo SOLO: la ÚNICA escena que cambia es el 60,0
  exacto** —grado `sin` → `Significativa`, pastilla apagada → prendida, EN SUMA «ET significativa.»—.
  59,9 y 60,1 dan lo mismo en los dos árboles, igual que 99 y 101. **EL ÁREA POR CONTINUIDAD NO SE
  MUEVE**, y este campo es su denominador: 0,98 / 0,98 / 5,89 / 1,15 cm² idénticas a HEAD.
  ⚠️ **EL SÍMBOLO Y LA COMPARACIÓN SON DOS LÍNEAS DISTINTAS** —el rótulo sale del `op` de `ET_CRIT`,
  el voto del `>=` de `etEstado`— y lo único que impide que se desincronicen es TC-468, que compara
  el símbolo IMPRESO contra el lado del borde que vota. `PENDIENTES.md` → Q6.

- **LA CASILLA DE PISA SE DESTILDA, Y LA ÚLTIMA TILDADA NO.** Hasta hoy llevaba
  `onchange="this.checked=true"`: era informativa, y con datos en los dos métodos el médico no podía
  mandar **sólo la continuidad** al informe. Un dueño único, `imPdfMetodoClic`, que gobierna las dos
  casillas, pone `tocado` **sólo cuando el clic prospera** y corre `calcIM_ESC` al final.
  **Medido con clics reales, con PISA calibrada a severa y la continuidad a un grado menor:** las dos
  tildadas 4, sólo PISA 4 —las dos **idénticas a HEAD**— y **sólo continuidad 4 → 2**, con el badge
  pasando a «Moderada — evaluar integrado», el PDF de `PISA: 50.3 mm² · Cont: 39.3 mm²` a
  `Cont: 39.3 mm²` en las **tres** filas, y el EN SUMA de «IM severa.» a «IM moderada.». La regla de
  la última casilla, **por los dos lados**, con su aviso.
  ⚠️ **LO QUE HACE SEGURO CONSULTAR LA CASILLA NO ES LA CASILLA: ES `imPdfPisaRestaurar`.** El
  comentario que vivía en el marcado advertía que el día que alguien agregara `if (pisaCb.checked)`
  **todo informe anterior se reimprimiría sin EROA ni Vol-R** —la ventana de reimpresión escribe
  `.checked` desde `campos` sobre TODOS los checkbox y un estudio anterior al selector no trae
  `im_pdf_pisa__chk`—. Por eso ese `if` entró **junto** con la función que repone **TILDADA** con la
  clave ausente, llamada desde las **dos** rutas. No se migra nada: se repone el **default**.

- **«NUEVO ESTUDIO» DEJABA VIVAS TRES PIEZAS, Y NINGÚN BARRIDO LAS ALCANZABA.** `_imGradoCalc` y
  `_itGradoCalc` no son DOM —eran M2— y `im-cont-severidad` es un `<div>` dentro de un `calc-row`
  —era B-9—. **REPRODUCIDO ANTES DE TOCAR NADA, con clics reales en los DOS botones del gesto**: los
  dos grados calculados seguían valiendo `'4'` después del gesto y el renglón seguía diciendo
  «Severidad (continuidad): Severa…» sobre un formulario en blanco; `sevCalcPublicable('im')` y
  `('it')` publicaban `'4'` sobre un formulario vacío, que es lo que lee el aviso rojo.
  **CONTROL NEGATIVO:** la IAo, que ya se limpiaba, va a `null` en los dos árboles.
  ⚠️ **EL `dataset.gradoVolum` DE ESE RENGLÓN SÍ SE BORRABA Y EL TEXTO NO**: se limpiaba lo que
  decide y quedaba vivo lo que se ve. ⚠️ **Y QUE `calcIT_ESC` SE PONGA EN `null` AL ENTRAR NO
  ALCANZA**: `limpiarCampos` no llama a ninguno de los dos calculadores.

- **LAS TRES AFIRMACIONES DE LA AYUDA DE LA EM VIVEN EN `ref-em`, NO EN EL MANUAL**, y las tres
  describían la app anterior a la regla binaria del 2026-10-11. **No se movió ningún corte ni
  ninguna cuenta.** La atribución de la tercera pasó de «la propia ESC 2021» —que **no tiene ninguna
  entrada** en `FUENTES.md`— a la **ESC/EACTS 2025, folio 4680**, verificada renderizando:
  *«low-gradient severe MS (MVA <1.5 cm², mean gradient <10 mmHg)»*. ⚠️ Esa guía escribe `<1.5`
  estricto donde la app aplica `≤1,5`: `PENDIENTES.md` → Q7. **Una CUARTA, decidida sobre la marcha:**
  el cartel del manual repetía el mismo «> 4 mmHg» con otras palabras, y dejar una de las dos ayudas
  diciéndolo era conservar el defecto que la otra acababa de cerrar.

- **CONTROL NEGATIVO MAYOR, con escenario CARGADO para que tenga denominador: 0 diferencias contra
  HEAD** en las **14** superficies ajenas (función diastólica «DD Grado II — ASE 2025», HFA-PEFF
  4/6, EAo severa, IAo, IT, EM, EP, IP y los dos tokens del Laboratorio), el **Excel en 435 columnas
  con el hash IDÉNTICO**, los **1096 campos** con su hash idéntico, y el informe y el EN SUMA en los
  **tres** estilos.

- **Arnés: `scripts/_probe_valvcuatro.mjs`** (A/B de solo lectura con `--file`), seis grupos (`vti`,
  `area`, `pisa`, `nuevo`, `ayuda`, `controles`), con «Nuevo estudio» por los **dos botones** del
  gesto en vez de llamar a `limpiarCampos`. **Cobertura: TC-468**, **35 condiciones** con siete
  denominadores y tres controles negativos. **Verificado que sabe fallar contra HEAD en un worktree
  aparte: 21 de las 35 en rojo**, y **ninguna por excepción**; las 14 que pasan son lo que esta tanda
  no mueve.
- ⚠️ **CASOS ADAPTADOS: SIETE**, con el motivo escrito en cada uno. **TC-466** (el denominador del
  operador y el símbolo de la fila), **TC-141**, **TC-416**, **TC-417** y **TC-429** —los cuatro
  usaban el **60,0 exacto como relleno «que no vota»**, que es lo que la tanda del 2026-10-13 había
  elegido JUSTAMENTE por el operador estricto; pasan a 59,9, y en dos de ellos el área se mueve de
  0,88 a 0,89 cm² porque ese campo es su denominador—; **TC-299** («la casilla de PISA no se puede
  desmarcar»); y **TC-430**, cuya condición (5) afirmaba el defecto de M2 **con la causa escrita en
  su propio comentario**.
- ⚠️ **TRES DENOMINADORES ROTOS SEGUIDOS EN LA SONDA DE LA AYUDA, LOS TRES CON PINTA DE MEDICIÓN
  BUENA.** (1) `document.body.textContent` incluye el texto de los `<script>`, o sea los 6 MB de JS
  con sus comentarios: informó que una frase borrada **seguía en pantalla**. (2) El modal de ayuda
  nace con **251 caracteres** y se pinta de a una sección, así que leerlo sin recorrerlas da todas
  las preguntas en `false`, que **se lee igual que «la frase ya no está»**. (3) Y las tres
  afirmaciones **no viven en ese modal sino en `ref-em`**: sin ese nodo, dos de las tres salían
  `false` **en HEAD**.
- ⚠️ **`ECO_AYUDA` ES UN `const` DE MÓDULO Y NO UNA PROPIEDAD DE `window`**, así que
  `window.ECO_AYUDA` da `undefined` y el bucle no corre.
- ⚠️ **PARA PROBAR «LA ÚLTIMA NO SE DESTILDA» HAY QUE CUIDAR EL ORDEN DE LOS CLICS.** Destildar PISA
  y después la continuidad deja las dos apagadas, así que **la regla revierte la continuidad** y PISA
  queda libre de bajar: la primera versión de la adaptación de TC-299 medía lo contrario de lo que
  decía medir.
- ⚠️ **Me comí el acento grave DIEZ veces** —cinco en comentarios dentro del cuerpo de un caso y
  cinco dentro del template de la sonda—, con el archivo que documenta la trampa abierto delante.
  ⚠️ **Y `scripts/check_backticks.py` NO ALCANZÓ A LOS DEL OBJETO `SONDA`:** su cobertura es el
  cuerpo de un `caso(...)` y el de la sonda inyectada, y los míos estaban en los comentarios del
  objeto. Ésos los cazó `node --check`. **Correr los dos, siempre.**
- ⚠️ **TC-395 ES UN SÉPTIMO INESTABLE POR ORDEN DE CORRIDA**, al lado de TC-137, TC-246, TC-249,
  TC-252, TC-260 y TC-GR-06: rojo en un `--solo` de 20 casos de la zona y **verde corrido solo**.

### Los CRITERIOS del HFA-PEFF contra el ORIGINAL de Pieske 2019 (2026-10-14)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`970dea7`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **cinco**
  commits de la tanda del modo manual y la estenosis mitral ya incluidos **y pusheados**. Los
  **tres** commits de esta tanda quedan locales; el push lo corre Maicol.
  **LA TAREA PEDÍA CUATRO COMMITS Y SON TRES: el de las REGLAS DEL TEXTO se omitió**, porque las
  dos que esa etapa pedía —el LAVI según ritmo y el e′ para ≥75 años— **ya estaban implementadas y
  correctas**, verificadas contra el original por sus bordes. Es la propia orden la que lo prevé, y
  es el mismo caso que el commit de la estenosis tricuspídea de la tanda de la aórtica.
  **El orden de revertido seguro es el inverso del de aplicación: 3 → 2 → 1.**
  El **1** (los dos cortes) y el **2** (la PSAP) **tocan la misma función pero en partes distintas
  y se revierten en cualquier orden**: el 1 cambia `hfUmbrales` y el operador del IMVI, el 2 agrega
  `d.psap` y reescribe el criterio de la IT. ⚠️ **PERO EL 1 LLEVA LA SONDA**
  (`scripts/_probe_hfcrit.mjs`), que el 2 también usa, y la adaptación de **dos** casos;
  revertirlo deja al 2 sin arnés. **El 3 es TC-467 más documentación** y afirma el comportamiento
  de los dos: revertir cualquiera sin el 3 deja TC-467 en rojo —9 de sus 36 condiciones,
  verificado en un worktree aparte—.

- **Línea base al cierre: suite 460/481 con el pendrive `DISK_IMG` AFUERA, Semgrep 127 / 0 ERROR,
  Excel 435 columnas con el hash IDÉNTICO a HEAD, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada
  uno —IDÉNTICO a la línea base, y `--todo` da 374 y 383, el mismo par—.**
  ⚠️ **EL PENDRIVE ESTUVO AFUERA EN LAS DOS PUNTAS, Y POR ESO LAS CIFRAS SE PUEDEN COMPARAR.** De
  los 21 rojos, **diecisiete** son **TC-181…TC-197**, los del pendrive: son ENTORNO y no prueban
  nada. Los **cuatro** restantes son los de ENTRADA y NO son regresiones: **TC-223** (el
  documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**. La comparación válida es
  que **el conjunto de rojos NO-pendrive es el MISMO en las dos puntas, y son esos cuatro**.
  **El denominador subió a 481**: esta tanda agregó **TC-467**. La de ENTRADA, medida en HEAD
  limpio el 2026-10-14 con el pendrive AFUERA, fue **459/480**, y el `md5` de `index.html` no se
  movió durante ninguna de las dos corridas.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista de ids con
  `grep -o "^caso('[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`. ⚠️ **EL `--solo` QUIERE COMAS, NO ESPACIOS.** La primera corrida de la línea base pasó
  la lista separada por espacios, el runner leyó **un solo id** y publicó **«1/1 ✓ — sin
  regresiones»**: un denominador de uno con pinta de corrida limpia. **Mirar el denominador antes
  de creerle al veredicto.**

- **Dónde está todo:** `docs/mapa/hfapeff-criterios.md` (**mapa NUEVO**, 14,1 KB: la tabla completa
  criterio por criterio con su folio, las tres contradicciones del artículo y la regla «gana la
  figura», por qué la PSAP es un derivado, el puntaje que se recalcula y las seis trampas medidas),
  `docs/mapa/hfapeff-peptidos.md` → un puntero, `docs/fuentes/FUENTES.md` → `### hfaPeff2019`
  **reescrita de arriba abajo** (ya no dice que el original falta), y `docs/PENDIENTES.md` → **H1,
  H2 y H3 marcados CERRADOS** más **seis** cosas nuevas declaradas y no tocadas (P1 a P6).

- ⚠️ **EL ORIGINAL YA ESTÁ EN LA BIBLIOTECA, Y EL CENSO QUE LO DABA POR AUSENTE NO ESTABA MAL.**
  `02_Diastolica/HFA PEFF Pieske ESC 2019.pdf` entró al disco el **13/10 a las 18:55**, después de
  ese censo. **Folio = página del PDF + 3296**, comprobado en el pie impreso de cuatro páginas.
  ⚠️ **Y LA FIGURA 3 ES UN BITMAP:** el texto extraído de esa página trae el cuerpo del artículo y
  **ninguno** de los cortes de la tabla. Se leyó renderizando a **600 dpi** con un `clip` por celda.
  Quien la busque con `pdftotext` concluye que la figura no dice nada.

- ⚠️ **EL ARTÍCULO SE CONTRADICE CONSIGO MISMO EN TRES LUGARES Y LOS SEIS TEXTOS ESTÁN IMPRESOS.**
  Regla de Maicol del 13/10: **gana la Figura 3**. NT-proBNP menor en FA: texto 375-660 (f. 3304),
  figura **365-660** (f. 3305) → **365**. IMVI menor: texto `≥115/≥95`, figura **`> 115/95`** →
  `>`, que es lo que la app ya tenía. Y el LAVI por ritmo y el e′ por edad sólo están en el texto.
  ⚠️ **EL IMVI *MAYOR* NO ERA UNA CONTRADICCIÓN:** texto y figura dicen los dos **`≥`**, y la app
  usaba `>` — estaba mal, sin nada que dirimir.
- ⚠️ **EL COMENTARIO QUE ESTABA EN `hfUmbrales` AFIRMABA QUE EL 365 NO EXISTE, Y ERA FALSO.** Decía
  que era «una errata muy repetida en la literatura secundaria» y que quedaba **«CERRADO, no volver
  a darlo vuelta»**. Se escribió sobre un original que nadie podía abrir, razonando por el patrón 3×
  de los otros tres cortes (35→105, 80→240, 220→660) — que **el propio artículo rompe sólo acá**.
  Por eso este corte se dio vuelta dos veces antes: no era un descuido, era una fuente ausente.
  **Y el archivo ya se contradecía solo:** el comentario de `amiloTextoHFAPEFF` decía «desde 365»
  al lado de una constante que valía 375.

- **EL PISO DE 365 MUEVE INFORMES, Y ESTÁ MEDIDO.** A/B con teclas reales, seis valores por ritmo:
  en FA el **365, el 370 y el 374** pasan de 0 a 1 punto y el **total de 4 a 5**, o sea de
  «probabilidad intermedia» a **«HFpEF confirmado»**. Es exactamente la ventana de 10 pg/ml que el
  comentario viejo advertía. **CONTROL NEGATIVO:** en ritmo sinusal los seis valores dan idéntico
  en los dos árboles.
- ⚠️ **EL OPERADOR DEL IMVI NO SE PUEDE PROBAR TIPEANDO VALORES NORMALES, Y SIN ESO EL COMMIT NO
  ESTABA VERIFICADO.** El IMVI **no es un campo**: es masa de Devereux sobre BSA de Mosteller, un
  derivado float de **cinco** campos, y con valores clínicos nunca cae exactamente en `149.000…`,
  así que `>` y `>=` dan lo mismo en toda escena alcanzable —un A/B daría **0 diferencias** y se
  leería como «el cambio no hizo nada»—. Los dos valores salen de una **bisección sobre doubles**:
  `ppvi = 13.624098525525902` da IMVI **149 exacto** (hombre, 70 kg/170 cm, DDVI 50, SIV 13) y
  `11.427598347830793` da **122 exacto** (mujer, 60/160, DDVI 48, SIV 11). A/B: los dos pasan de 1
  a 2 puntos y los de arriba y abajo no se mueven.

- **LA PSAP ENTRA COMO SEGUNDA VÍA DEL MISMO CRITERIO Y CUENTA UNA SOLA VEZ.** La Figura 3 las
  imprime en el **mismo renglón** —«TR velocity > 2.8 m/s (PASP > 35 mmHg)»— y el folio 3303 lo
  explica. Dos entradas separadas no cambiarían el puntaje —`_hfDom` da 2 con cualquier mayor— pero
  la pantalla diría **dos** criterios cumplidos sobre un único hallazgo.
  ⚠️ **LA PSAP DE ESTA APP NO ES UNA MEDICIÓN INDEPENDIENTE, Y ESO ACOTA QUÉ ESCENAS EXISTEN.**
  `psap_calc` es `readonly` y vale `(4·VRT² + PmAD).toFixed(0)`: deriva de la misma velocidad de IT,
  **se vacía sin ella** —así que **«la PSAP sola» no es un estado alcanzable**— y se **redondea a
  entero**, así que una PSAP real de 35,6 se lee 36 y cruza. Lo que separa las dos vías es la
  **PmAD**. Medido en siete escenas: VRT 2,65 con PmAD 8 da PSAP 36 y **vota sólo por la PSAP**,
  donde HEAD no votaba. `PENDIENTES.md` → P1 y P2.

- **LAS DOS REGLAS DEL TEXTO YA ESTABAN, Y SE MIDIERON ANTES DE DARLAS POR BUENAS.** LAVI: ocho
  bordes, sinusal `>34` / `29-34` y FA `>40` / `34-40`, y **con el dato cargado** un LAVI de 38 pasa
  de MAYOR en sinusal a MENOR en FA. e′: con el **mismo** par de anillos (septal 6 / lateral 8), a
  los **74** cumple los dos criterios y a los **75 y 76** ninguno — el borde es `>= 75` y es un
  **REEMPLAZO**, no una suma. Un par que cayera del mismo lado de los dos juegos no probaría nada.
- **LOS DEMÁS CRITERIOS COINCIDEN, MEDIDOS POR SUS DOS LADOS:** E/e′ 8/9/14/15, GLS 15,9/16,0/16,1,
  RWT 0,416/0,420/0,424 y pared 11,9/12,0/12,1. Los cuatro operadores son los de la figura.

- **EL CARTEL DE PÉPTIDOS PUBLICA EL CORTE NUEVO SIN QUE SE LE TOCARA UNA LÍNEA**, que es el punto
  (7) de la orden: lee `hfUmbrales(fa)`. Medido: con 370 en FA dice «Corte aplicado: NT-proBNP
  365-660 pg/ml — criterio MENOR, 1 punto… Puntaje HFA-PEFF: 5/6», y **las dos superficies
  coinciden** (el renglón de referencias y Avanzado dan 5/6).
- ⚠️ **EL PUNTAJE SE RECALCULA AL REABRIR, NO SE GUARDA.** No hay ningún campo que almacene el
  total: viajan los insumos. Un estudio en FA con NT-proBNP entre 365 y 374 guardado con 4/6
  **reabre con 5/6**. **No se migra nada** y el `informe_texto` ya firmado no cambia.
  `PENDIENTES.md` → P3.
- **CONTROL NEGATIVO MAYOR, con escenario CARGADO para que tenga denominador: 0 diferencias contra
  HEAD** en la función diastólica (que publica «DD — Presión elevada (ASE 2025)»), las ocho
  válvulas, el **Excel en 435 columnas con 0 celdas distintas**, los **1096** campos guardados y el
  informe y el EN SUMA en los **tres** estilos.

- **Arnés: `scripts/_probe_hfcrit.mjs`** (A/B de solo lectura con `--file`), ocho grupos (`I`, `B`,
  `T`, `L`, `E`, `O`, `C`, `N`). **Cobertura: TC-467**, **36 condiciones** con cinco denominadores
  y seis controles. **Verificado que sabe fallar contra HEAD en un worktree aparte: 9 de las 36 en
  rojo**, y **ninguna por excepción**; las 27 que pasan son lo que esta tanda no mueve.
  ⚠️ **ESCRIBÍ «28 condiciones» ANTES DE CONTARLAS Y SON 36.** Lo cazó contar los `ex.push` del
  propio caso. **Contar y después escribir.**
- ⚠️ **CASOS ADAPTADOS: DOS**, con el motivo escrito en cada uno. **TC-57**, que afirmaba «el piso
  es 375, NO 365» con el 370 como valor separador —hoy separa en la dirección contraria—, y
  **TC-465**, que tenía el 375 cableado en su tabla de bordes y en el rótulo que el cartel declara.
  Los dos estaban VERDES y **describían la app de ayer**, no estaban mal escritos.
- ⚠️ **LOS INSUMOS DEL SCORE VIVEN EN CUATRO PESTAÑAS, Y MI SONDA ABORTÓ EN SEIS ESCENAS POR ESO.**
  `ppvi`, `siv`, `ddfvi` y `edad` están en **Datos**, no en Doppler: la primera corrida del grupo
  `I` abortó con **`SIN GEOMETRIA ppvi`** en las seis, que es lo correcto — y si el lector no mira
  el aborto, la tabla sale con `imvi: null` en todas y dice «ningún corte funciona» sobre cortes que
  funcionan. Se cerró con un **abridor genérico** que sube por el DOM hasta la `.tab-section` del
  campo, en vez de una lista de pestañas cableada que se desactualiza.
- ⚠️ **EL TOKEN DEL COLAPSO DE LA VCI ES `>50` / `<50`, NO `si` / `no`, Y ESO ME COSTÓ UNA CORRIDA
  ENTERA DEL GRUPO DE LA PSAP.** Con el token inventado, `calcPmAD` salió por su guarda, la PmAD
  quedó vacía y `psap_calc` también: las **seis** escenas informaron la PSAP sin valor y el A/B dijo
  «0 diferencias» **sobre el commit que la agrega**. Un denominador vacío con pinta de medición
  buena.
- ⚠️ **UN DOMINIO QUE YA VALE 2 HACE QUE TODOS SUS CORTES PAREZCAN NO FUNCIONAR.** Las escenas de
  los criterios que no cambian usan anillos que **cumplen** el criterio del e′, así que el dominio
  funcional ya está en 2 y los puntos no se mueven al cruzar el corte del E/e′: lo que se mide es la
  **FILA** de cada criterio (`SI` / `no` / `na`), no los puntos del dominio.

### El MODO MANUAL de las pastillas, el selector binario de la EM, el violeta y el VTI de la ET (2026-10-13)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`0cd0bf5`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **tres**
  commits de la tanda del cartel de péptidos ya incluidos **y pusheados**. Los **cinco** commits de
  esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.**
  El **1** (`sevReiniciarManual`) **se revierte solo**: nadie más lo llama y `sevSincronizar` lo
  invoca con `typeof`. El **4** (el VTI de la ET) **también**: no toca nada de los otros tres.
  ⚠️ **EL 3 CUELGA DEL 2 PARA LA MITRAL, Y NO AL REVÉS.** El violeta se prende cuando el TEXTO del
  sub-botón es «Significativa», y en la mitral ese texto lo produce `VIS_BTN`, que nace en el 2.
  Revertir el 2 sin revertir antes el 3 deja la pastilla mitral diciendo «Severa ▼» y **sin**
  violeta —inocuo, la regla simplemente no matchea— pero la tricúspide lo conserva, así que queda
  la mitad del cambio. Orden: **3 antes que 2**.
  ⚠️ **Y EL 5 LLEVA ADAPTACIONES DE CASOS QUE AFIRMAN LO DEL 2 Y LO DEL 4.** Revertir el 4 sin el 5
  deja **TC-417** y **TC-429** midiendo escenas con el VTI en 60 que allá no existe como criterio
  —no se ponen rojos: miden de menos—, y revertir el 2 sin el 5 deja en rojo los nueve de la
  nomenclatura. Revertir cualquiera sin el 5 deja **TC-466** en rojo, que es lo que afirma los
  cuatro.

- **Línea base al cierre: suite 459/480 con el pendrive `DISK_IMG` AFUERA, Semgrep 127 / 0 ERROR,
  Excel 435 columnas con el hash IDÉNTICO a HEAD, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada
  uno —IDÉNTICO a la línea base, y `--todo` da 374 y 383, el mismo par—.**
  ⚠️ **EL PENDRIVE SE DESMONTÓ A MITAD DE ESA CORRIDA, Y HAY QUE DECIRLO EN VEZ DE RESTAR.** De los
  21 rojos, **diecisiete** son **TC-181…TC-197**, los del pendrive: son ENTORNO y no prueban nada.
  Los **cuatro** restantes son los de ENTRADA y NO son regresiones: **TC-223** (el documentado,
  falla por la fecha), **TC-376**, **TC-390** y **TC-406**. La comparación válida no es 459 contra
  475: es que **el conjunto de rojos NO-pendrive es el MISMO en las dos puntas, y son esos cuatro**.
  La prueba de que es entorno está en la corrida anterior del mismo árbol, con el pendrive puesto:
  ahí los diecisiete salieron **verdes**. Mirar `ls /Volumes/DISK_IMG` ANTES de comparar dos cifras.
  **El denominador subió a 480**: esta tanda agregó **TC-466**. La de ENTRADA, medida en HEAD limpio
  el 2026-10-13 con el pendrive MONTADO, fue **475/479** con esos mismos cuatro rojos, y el `md5` de
  `index.html` no se movió durante ninguna de las tres corridas completas.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista de ids con
  `grep -o "^caso('[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`. El runner no tiene un flag de exclusión. El motivo es el de siempre: ese caso llama a
  `pdfDeInformeGuardado`, que necesita jsPDF por CDN, y sin la librería la promesa no resuelve nunca
  y cuelga la corrida entera. Por eso los totales son sobre **480** y no sobre 481.
  ⚠️ **TC-137 ES UN SEXTO INESTABLE POR ORDEN DE CORRIDA**, al lado de TC-246, TC-249, TC-252,
  TC-260 y TC-GR-06: salió rojo en un `--solo` de 15 casos de la zona y **verde corrido solo**, con
  el mismo árbol. **Repetir antes de sospechar.**

- **Dónde está todo:** `docs/mapa/valvulas-manual-binario.md` (**mapa NUEVO**, 16,2 KB: las cuatro
  guardas del reinicio, el selector binario con el censo de quién lee el valor, el violeta y el
  cuarto criterio de la ET, más las seis trampas medidas), `docs/mapa/valvulas.md` y
  `docs/mapa/valvulas-borrado.md` → sendos punteros, `docs/fuentes/FUENTES.md` → la Tabla 10 con sus
  cuatro cortes impresos y los dos operadores en conflicto, y `docs/PENDIENTES.md` → **ocho** cosas
  declaradas y no tocadas (M1 a M8), con **A-5 marcado CERRADO**.

- ⚠️ **EL DEFECTO DEL MODO MANUAL REPRODUCE EN LAS OCHO LESIONES CON PASTILLA, Y ES PEOR QUE UN
  AVISO DE MÁS.** Medido con teclas y clics reales contra HEAD: cargar un dato, **apagar** la
  pastilla y **borrar** el dato dejaba la marca viva en **8 de 8**, y con el dato siguiente el grado
  **no se escribía en 6 de 8** (ia, it, ip, em, ea, et) — cinco de ellas con el aviso rojo «(ajuste
  manual) · cálculo automático: Severa» acusando un ajuste que nadie hizo, y **la ET ni eso**,
  porque su `comparables` excluye el centinela y el grado desaparecía en silencio. Hoy las ocho
  vuelven al estado inicial y el dato nuevo gradúa.
- **LA CAUSA, CON NOMBRE:** `toggleValvPill` → `valvApagarGrado` → `valvSev.aplicar(…, centinela)`
  marca y toma la foto del calculado, y **nadie la deshace**: `sevRetirarSugerido` sale por su
  guarda de manual y los **seis** apagados automáticos salen por su PRIMERA guarda, «la pastilla ya
  está apagada».
- **UN SOLO DUEÑO, `sevReiniciarManual`, llamado desde `sevSincronizar`**, que es el punto por el
  que pasan las ocho claves registradas. ⚠️ **SU PRIMERA GUARDA ES LA QUE EVITA MIGRAR UN ESTUDIO
  GUARDADO:** exige que la marca venga de un GESTO de esta sesión, y eso lo dice la FOTO
  (`_sevCalcAlFijar`, que no se persiste). Una planilla que trae «IM ausente» —que
  `_sevManualDesdeCampos` marca a propósito— llega **sin** foto y no se toca.
- **LA REGLA (b) QUEDA INTACTA POR CONSTRUCCIÓN Y ESTÁ MEDIDA:** con el dato cargado, apagar la
  pastilla da **0 diferencias contra HEAD** en las ocho lesiones (marca, grado, pastilla, cajón y
  aviso letra por letra). Y **B-3 tampoco se movió**: reabrir la pastilla a mano con el dato cargado
  sigue sin recuperar el grado, idéntico a HEAD en 8 de 8.
- ⚠️ **LA PASTILLA NO SE VUELVE A PRENDER SOLA, Y ES DELIBERADO.** El apagado del médico deja la
  clave de `localStorage` en `'0'` y los auto-prendidos la respetan. Lo que sí cambia es que **el
  grado se escribe**, que es lo que el informe lee desde la etapa 4b. `PENDIENTES.md` → M1.

- **EL SELECTOR DE LA ESTENOSIS MITRAL ES BINARIO Y NINGÚN TOKEN CAMBIA.** El menú ▼ pasó de tres
  items a **dos** —«No significativa» / «Significativa»—, medido con un clic real; los cuatro
  `value` siguen intactos y `moderada` quedó como `<option hidden>` para que un legado reabra en su
  índice y no en `-1`. **Excel en 435 columnas con el MISMO valor en los cuatro tokens y el
  Laboratorio clasificando igual.**
- ⚠️ **EL SUB-BOTÓN DECÍA «Severa» Y ESO ERA PREEXISTENTE.** `corto()` lee el VALOR, así que con
  `em_grado='severa'` la pastilla y el «grado final al informe» decían «Severa» mientras la
  `<option>`, el PDF y la etiqueta decían «Significativa» desde el 2026-10-11. Se cerró con un dueño
  **por par** (`VIS_BTN`) y **sin tocar `corto()`**, que gobierna las ocho pastillas.
- **INFORME Y EN SUMA, la tabla antes → después:** `leve` y `moderada` pasan de «con estenosis
  leve/moderada» y «EM leve./EM moderada.» a **«con estenosis no significativa»** y **«EM no
  significativa.»**; `severa` pasa de «con estenosis severa» y «EM severa.» a **«significativa»**.
  ⚠️ **LAS CUATRO FRASES NUEVAS YA LAS EMITÍA LA APP** por el camino de la CATEGORÍA, así que no se
  inventó ninguna redacción en un informe firmado. La de `severa` era PREEXISTENTE.
- ⚠️ **TRES TEXTOS DE AYUDA, NO DOS.** El tercero —la caja del manual, cerca del final del
  archivo— **lo encontró la sonda y no la lectura**. Y en la tabla «Referencia clínica» quedaron
  **tres afirmaciones viejas que NO son de esta tanda** y que no se tocaron por ser contenido
  clínico: `PENDIENTES.md` → M5.

- **EL VIOLETA VA EN LAS DOS VÁLVULAS BINARIAS Y EN LOS DOS TEMAS**, con la compuerta en el TEXTO y
  no en el token, así que el color y la palabra no se pueden desincronizar. Medido con
  `getComputedStyle` y con captura real: `rgb(237,233,254)` en los cuatro casos, «No significativa»
  nunca, y **control negativo** con IM, IT, EAo y EP en su grado más grave idénticas a HEAD.
  Contraste **9,23:1** el texto y 4,8:1 el borde; contra el rojo de `nivel3` la luminancia es la
  misma (1,03:1) y se distingue por TONO, que es lo que ya pasaba entre los tres pastel anteriores.
  ⚠️ **ESCRIBÍ «11,9:1» EN EL COMENTARIO ANTES DE MEDIRLO Y ERA 9,23.** Lo corregí al medir, pero el
  número estuvo escrito sin medición. **Medir y después escribir.**

- **EL VTI DE ENTRADA TRICUSPÍDEO >60 cm VOTA, y el operador es `>` ESTRICTO.** Leído de la IMAGEN
  de la Tabla 10 —es un bitmap y el texto extraído se come los glifos— con el folio comprobado en el
  pie impreso. Medido por sus dos lados con el VTI como único dato: **59,9 no · 60,0 NO · 60,1 sí**,
  con pastilla y EN SUMA «ET significativa.». La banda **no hubo que ampliarla**: su techo es 100 cm
  desde el 2026-10-07 y el comentario de entonces explica por qué. **El área por continuidad no se
  mueve** —este campo es su DENOMINADOR— y está medido: 0,98 cm² en los dos árboles.
  ⚠️ **LA ASE 2023 ESCRIBE `≥60` PARA EL MISMO CRITERIO Y ES MÁS NUEVA**: se conservó el `>` del
  original, que es la fuente de los otros tres cortes y el lado conservador. La **ESC/EACTS 2025 no
  lo nombra** —publica un solo número para la ET entera— así que no lo contradice.
  ⚠️ **EL SÍMBOLO DEL OPERADOR SALÍA DE UN TERNARIO** `('>=' ? '≥' : '≤')`: con el cuarto criterio,
  el único estricto, habría impreso **«≤60 cm»** —el signo CONTRARIO— en el renglón que explica el
  veredicto. Hoy es un mapa.

- **CONTROL NEGATIVO MAYOR, con un escenario CARGADO que tiene veredicto en las nueve superficies:**
  función diastólica («DD Grado II — ASE 2025»), HFA-PEFF, las tres insuficiencias, la estenosis
  aórtica, el badge de la EM, el de la pulmonar y la fila del PHT de la IP, **todos idénticos a
  HEAD**, con el **Excel en 435 columnas y el mismo hash** y el informe y el EN SUMA en los **tres**
  estilos con **0 de 6** superficies distintas.

- **Arnés: `scripts/_probe_valvmanual.mjs`** (A/B de solo lectura con `--file`, y `--captura
  --dest`), seis grupos (`repro`, `respeta`, `emsel`, `color`, `vti`, `controles`).
  **Cobertura: TC-466**, **37 condiciones** con cinco denominadores y cinco controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 19 de las 37 en rojo**, y sin
  morir por excepción; las 18 que pasan son lo que esta tanda no mueve.
- ⚠️ **CASOS ADAPTADOS: VEINTE**, con el motivo escrito en cada uno. **Quince** por la
  nomenclatura de la EM, el rótulo del sub-botón o el conteo del menú ▼ (**TC-304**, **TC-306**,
  **TC-307**, **TC-308**, **TC-384**, **TC-387**, **TC-388**, **TC-389**, **TC-391**, **TC-395**,
  **TC-399**, **TC-400**, **TC-402**, **TC-405**, **TC-422**), **tres** por el VTI que ahora vota
  (**TC-416**, **TC-417**, **TC-429**) y **dos** por la regla del manual (**TC-375**, **TC-430**).
  ⚠️ **ESCRIBÍ «DIECISÉIS» ANTES DE CONTARLOS Y SON VEINTE.** Lo cazó contar las marcas
  «ADAPTADO el 2026-10-13» del archivo, que es lo que había que hacer primero. **Contar y después
  escribir**, igual que medir y después escribir.
  ⚠️ **NUEVE DE ESOS DIECISÉIS LOS DESTAPÓ LA SUITE COMPLETA**, no la corrida de zona: TC-307,
  TC-375, TC-387, TC-389, TC-395, TC-399, TC-417, TC-422 y TC-429.
  ⚠️ **TRES DE ELLOS NO FALLABAN POR UNA PALABRA SINO PORQUE SU ESCENA DEJÓ DE AISLAR SU CRITERIO.**
  TC-416, TC-417 y TC-429 cargaban el VTI de entrada en 64, 90 y 90 cm «como relleno», y desde que
  ese número vota, sus **controles negativos del área** publicaban «Significativa» por el VTI. Los
  tres bajan a **60,0 exactos** —que no cumple, por el operador estricto— y de paso fijan el borde
  por el lado que no afirma. **Lo delataron sus propios denominadores**, que es para lo que están.
- ⚠️ **Me comí el acento grave SEIS veces**, todas en comentarios míos dentro del cuerpo de un caso,
  con el archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea
  exacta las seis; `node --check` apuntaba a la apertura del template, cientos de líneas antes.
- ⚠️ **Y DOS TRAMPAS DE CAPTURA QUE COSTARON DOS CORRIDAS:** el aviso legal vuelve a mitad de
  corrida y **oscurece el PNG entero** —el violeta salía gris con `getComputedStyle` diciendo
  `rgb(237,233,254)` al lado, porque lee el estilo y no el píxel—, y el `clip` de
  `Page.captureScreenshot` va en coordenadas de **PÁGINA** mientras `getBoundingClientRect` da las
  del **viewport**: con la página scrolleada, el PNG de la tricúspide salió **en negro**.


### El cartel de PÉPTIDOS del HFA-PEFF y el plan del usuario (2026-10-13)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`ec7ac3d`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **tres**
  commits de la tanda de los cortes de la aórtica ya incluidos **y pusheados**. Los **tres** commits
  de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 3 → 2 → 1.**
  El **1** crea el cartel entero —el marcado, `HFPEP_CAMPO`, `hfPepSync`, `hfPepPintar`,
  `hfPepAbrir/Cerrar/Confirmar`, el prefijo `hfpep-` de `_noEsDelEstudio` y las dos entradas de
  `RECALC_MODULOS`— y **el 2 cuelga entero de él**: reescribe `hfPepPintar` y agrega una llamada a
  esa misma función en el oyente de documento. Revertir el 1 sin revertir antes el 2 deja el oyente
  llamando a una función que no existe —inocuo, va con `typeof` y además en `try`— pero deja
  `hfapeffLineaEco` publicando el score completo con un cartel que ya no se puede abrir, o sea el
  botón volviendo a `showTab('hemodinamica')` y el defecto del plan **reabierto**.
  **El 3 es TC-465 más documentación** y afirma el comportamiento de los dos: revertir cualquiera
  sin el 3 deja TC-465 en rojo.
  ⚠️ **Y EL 2 NO ES SÓLO «EL CÁLCULO»:** lleva el `id` del rótulo del renglón
  (`hfapeff-eco-lbl`), sin el cual `hfapeffLineaEco` del commit 2 escribe sobre un nodo que no
  existe —inocuo, va con `if (lbl)`— pero el rótulo se queda en «HFA-PEFF (eco)» con el péptido
  cargado, que es justo la frase que deja de ser cierta.

- **Línea base al cierre: suite 475/479 en la corrida completa con el pendrive `DISK_IMG`
  MONTADO, Semgrep 127 / 0 ERROR, Excel 435 columnas con el HASH IDÉNTICO a HEAD, celular 43 a
  360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea base, y `--todo` da 374 y 383—.**
  Los cuatro rojos son los de ENTRADA y NO son regresiones: **TC-223** (el documentado, falla por
  la fecha), **TC-376**, **TC-390** y **TC-406**. **El denominador subió a 479**: esta tanda agregó
  **TC-465**. El `md5` de `index.html` no se movió durante la corrida (`59017ce6…`).
  ⚠️ **ESE 479 NO ES EL TOTAL DE CASOS, QUE SON 480: TC-318 ESTÁ EXCLUIDO PORQUE **SE CUELGA EN
  HEAD LIMPIO**.** Medido: el suite entero se detuvo ahí dos veces, con node al 0 % de CPU y el
  log sin escribir durante ocho minutos, y corrido **solo** con `--solo TC-318` se colgó igual,
  sobre el árbol de HEAD con su `md5` sin tocar. La causa es de ENTORNO y es la misma de TC-148
  (abajo): ese caso llama a `pdfDeInformeGuardado`, que necesita **jsPDF por CDN**; sin la
  librería, la promesa del caso no resuelve nunca y `Runtime.evaluate` con `awaitPromise` espera
  para siempre. **El suite no tiene manejador de diálogos ni timeout por caso**, así que un caso
  que no resuelve cuelga la corrida entera. La línea base de ENTRADA, medida en HEAD limpio el
  2026-10-13 con la misma exclusión, fue **473/478**.
  ⚠️ **TC-148 ES UN ROJO DE ENTORNO, NO UNA REGRESIÓN, Y SE LEE EN SU PROPIA CONDICIÓN:**
  «PptxGenJS cargó por CDN (sin esto el caso no prueba nada)». Salió rojo en la corrida de entrada
  y **verde en la de cierre**, con el mismo árbol. Los hashes SRI de los tres CDN se verificaron
  contra el archivo real descargado y **coinciden**, así que no es el defecto del `integrity`
  viejo que este archivo documenta: es la librería que unas veces llega y otras no.
  ⚠️ **TC-GR-06 ES UN SEXTO CASO INESTABLE POR ORDEN DE CORRIDA**, al lado de TC-246, TC-249,
  TC-252 y TC-260. Salió rojo en un `--solo` de 15 casos de la zona y **verde dos veces corrido
  solo**, con el mismo árbol. **Me costó una conclusión falsa**: bisequé contra él, «confirmé» que
  una línea nueva tiraba una excepción, y era mentira — la sonda lo desmintió midiendo el error
  tragado (`null` en todas sus escenas). **Repetir antes de sospechar.**

- **Dónde está todo:** `docs/mapa/hfapeff-peptidos.md` (**mapa NUEVO**, 14,2 KB: el defecto del
  plan y por qué el plan no lo frenaba, las piezas nuevas, el espejo, el ritmo que se lee, el
  puntaje, la accesibilidad y las seis trampas medidas), `docs/fuentes/FUENTES.md` →
  `### hfaPeff2019` (⚠️ **el original NO está en la biblioteca**, el censo de los 89 archivos, la
  fuente secundaria y la comparación criterio por criterio), `docs/PENDIENTES.md` → **ocho** cosas
  declaradas y no tocadas (H1 a H8), y la fila nueva de la tabla de arriba.

- ⚠️ **EL DEFECTO REPRODUCE, Y EL PLAN SÍ ESTABA APLICADO.** Medido contra HEAD con teclas y clics
  reales, en los dos planes: con **plan BÁSICO** el botón del rail de Hemodinámica queda en
  `display:none` y la fila `.tabs-special` entera también —o sea `applyViewMode()` hizo su
  trabajo—, y un clic de mouse sobre «confirmar con péptidos →» mueve la pestaña activa de
  `tab-doppler` a **`tab-hemodinamica`**, con la sección HFA-PEFF visible. Hoy, con los dos planes,
  la pestaña activa sigue en `tab-doppler` y lo que se abre es el cartel.
- ⚠️ **LA CAUSA NO ES ESE BOTÓN: ES QUE `showTab` NO CHEQUEA NADA.** Medido sobre su propia fuente:
  no nombra `eeGetMode`, `eeModOn`, `applyViewMode` ni `ett_view_mode`. El plan se aplica
  **escondiendo botones, no paneles** —`#tab-hemodinamica` sigue en el árbol con plan Básico—, así
  que cualquier código que active uno entra sin pasar por ninguna compuerta. `PENDIENTES.md` → H8.
- **CENSO DE LOS OTROS BOTONES (punto 6 de la orden, sólo reportado): NO HAY NINGUNO.** `hfapeffIr`
  era el único control de toda la app que llamaba a `showTab` con una pestaña gateada desde fuera
  del rail. Verificado por grep sobre los diez destinos con `data-mod` y por el grupo `X` de la
  sonda, que censa los `[onclick]` del árbol vivo. Lo que queda abierto es que **nada lo impide
  estructuralmente**.

- **UN SOLO DATO Y DOS CONTROLES.** El dueño sigue siendo `hf_ntprobnp` / `hf_bnp`, que ya viajaban
  con el estudio y **ya tenían columna de Excel**: no se agregó ni un campo ni una columna. El
  espejo usa el mecanismo de `aoFcSync` y `avaPlanSync`, con la diferencia de que **el par no es
  fijo** —lo elige el desplegable de tipo—. Medido con teclas reales en los dos tipos: escribir en
  el cartel escribe el dueño, borrar borra, el valor que ya estaba en Avanzado se MUESTRA al abrir,
  borrar en Avanzado lo borra del cartel, y con el cartel abierto y la pestaña de Avanzado debajo
  el espejo va EN VIVO. **Control negativo: el OTRO péptido queda intacto en los cuatro gestos.**
- ⚠️ **EL CARTEL NO ES DEL ESTUDIO, Y ES DELIBERADO.** Sus dos ids van con guión MEDIO y el prefijo
  `hfpep-` los saca de `_noEsDelEstudio`: persistir el espejo dejaría una SEGUNDA copia del péptido
  que al reabrir puede contradecir al dueño. **Medido**: el recolector guarda `hf_ntprobnp` y deja
  los dos del cartel afuera; «Nuevo estudio» vacía dueño, espejo y los dos renglones de texto; y
  reabrir el estudio repone el dueño y el cartel vuelve a mostrarlo.
- **EL RITMO SE LEE Y NO SE PREGUNTA.** `hfRitmoEfectivo()` ya era el dueño único. Medido: el mismo
  NT-proBNP de 450 es criterio **MAYOR** en ritmo sinusal (> 220) y **MENOR** en fibrilación
  (375-660), así que el score pasa de 6/6 a 5/6 y vuelve al cambiar el selector del Doppler. Con un
  valor que cayera del mismo lado en los dos ritmos, el paso no probaría nada.
  ⚠️ **Y CON EL CARTEL ABIERTO SE QUEDABA DECLARANDO EL CORTE DEL RITMO ANTERIOR** —lo encontró la
  sonda—: el cartel es un overlay y el médico puede mover el selector detrás. `hfPepPintar` entró
  al oyente de documento, **en `try`**, porque ese oyente no envuelve sus llamadas.

- **LOS CORTES NO SE TOCARON, Y CADA UNO SEPARA POR SUS DOS LADOS.** Tabla de **24 filas** con
  teclas reales —tres valores por corte, por los cuatro cortes de cada ritmo—: el valor del corte
  cae del lado **MENOR** y el entero siguiente ya es mayor, en NT-proBNP y en BNP, en los dos
  ritmos. Los cortes de FA son el triple, que es lo que la fuente escribe.
  ⚠️ **LA PRIMERA CORRIDA DE ESA TABLA NO MEDÍA NADA:** las 24 filas salieron con `humPts: 0` y el
  renglón idéntico en los dos árboles — una tabla que decía «ningún corte funciona» sobre cortes
  que funcionan. El tecleo había ABORTADO con «SIN GEOMETRIA hf_ntprobnp» en las 24, que es lo
  correcto, y el lector no lo miraba: **los dos campos dueños viven en la pestaña Hemodinámica
  DENTRO de una tarjeta plegada**. Pasó **tres veces** en esta tanda (grupos `B`, `R` y `N`).
- ⚠️ **EL ORIGINAL DEL HFA-PEFF NO ESTÁ EN LA BIBLIOTECA.** Censados los **89 archivos**: tres
  nombran el HFA-PEFF y **ninguno trae los cortes** —Nagueh 2025 lo describe en prosa, la ESC/ERS
  2022 lo nombra, los dos lo citan bibliográficamente—. Por la regla de la casa, los ocho cortes
  **no están verificados al estándar del repo**. La fuente SECUNDARIA que la orden admite —el Word
  de Cowork, §13.3— los transcribe y **coincide exactamente con los que la app ya usaba**, así que
  no hubo que mover ninguno y la tanda no se detuvo. `PENDIENTES.md` → H1.
- ⚠️ **TRES DIFERENCIAS CONTRA LA FUENTE SECUNDARIA, EN LOS OTROS DOS DOMINIOS, REPORTADAS Y NO
  TOCADAS** (son criterios ecocardiográficos y esta orden lo prohíbe): la **PSAP > 35 mmHg** es
  criterio MAYOR del dominio funcional y la app **no la vota** —alcanza al paciente sin chorro de
  IT medible, que es entre el 40 y el 60 %—, y los dos operadores del IMVI son `>` donde la fuente
  escribe `≥`. `PENDIENTES.md` → H2 y H3.

- **EL PUNTAJE SALE DE UNA SOLA FUNCIÓN, Y AHORA LAS DOS SUPERFICIES COINCIDEN.**
  `hfapeffLineaEco` llamaba siempre a `hfapeffScore(true)` —techo 4—, así que con un péptido
  cargado el cuadro del Doppler decía «4/4 en eco» mientras Avanzado decía 6/6 **sobre el mismo
  paciente**. Hoy la rama se elige por `hum.hayDatos`, que lo dice el propio dueño. **Sin péptido
  la rama de HEAD se conserva entera**, así que el punto (7) de la orden queda garantizado por
  construcción: A/B con **0 diferencias** en 4 escenas.
- **CONTROL NEGATIVO MAYOR, con el péptido CARGADO:** función diastólica, las **ocho** válvulas, el
  **Excel en 435 columnas con el hash idéntico**, los **1082** campos guardados con su hash
  idéntico, y el informe y el EN SUMA en los **tres** estilos, todos IDÉNTICOS a HEAD. El informe
  no se mueve porque la hoja del HFA-PEFF es opt-in («Integrar al informe»).

- ⚠️ **LA COMPUERTA DE FEVI Y EL RITMO AJENO SE MIDIERON Y NO SE TOCARON** (punto 8 de la orden).
  FEVI **50 aplica y 49 no** —el corte es `>= 50`—, y del lado que no aplica el renglón se esconde
  y la conclusión dice «score no aplicable» **sin nombrar el puntaje**. Y un ritmo que no es
  ninguno de los dos **no es alcanzable con un gesto**: `diast_ritmo` ofrece exactamente dos
  opciones; con un token ajeno el `<select>` queda en `selectedIndex -1` y `hfRitmoEfectivo()`
  devuelve `'rs'`, o sea **los cortes de sinusal**, que es el lado que SOBRE-afirma porque los de
  FA son el triple. `PENDIENTES.md` → H5.

- **ACCESIBILIDAD, MEDIDA:** foco al campo del valor al abrir, Escape cierra —por el oyente
  genérico, que clickea el botón que dice «Cerrar», así que no hay un segundo camino que se
  desincronice—, clic en el fondo cierra, y **Tab CICLA dentro del cartel** sin escaparse a la
  página de atrás.
  ⚠️ **EL FOCO VUELVE POR POSICIÓN Y NO POR REFERENCIA, y lo encontró la sonda:**
  `hfapeffLineaEco` reescribe el `innerHTML` del renglón, así que el `<button>` que abrió el cartel
  queda DESCONECTADO y `document.contains` da false — el foco se caía al `<body>`.
- **MAQUETA: 1200, 390 y 360 px en los DOS temas**, con captura real. No desborda, no hay scroll
  horizontal, el texto va a 12 px y el campo del valor mide **27 px, exactamente lo que mide un
  campo de formulario cualquiera de la app** al mismo ancho (`onda_e`) — que es el patrón contra el
  que hay que medirlo, porque `check_mobile.js` abre pestañas y secciones pero **no modales**.
  ⚠️ **Y EL BARRIDO DE DOS TEMAS MEDÍA UNO SOLO:** la sonda escribía `data-theme`, y el tema de
  esta app es la clase **`light-mode`** sobre `documentElement`. Las capturas de claro y oscuro
  salieron IDÉNTICAS byte por byte a 390 y 360 px, que es la firma de que el cambio nunca ocurrió.
  Hoy la sonda **aborta** si la clase no quedó puesta.

- **Arnés: `scripts/_probe_hfpep.mjs`** (A/B de solo lectura con `--file`, y `--captura`), once
  grupos (`P`, `A`, `S`, `B`, `R`, `V`, `G`, `W`, `N`, `Q`, `X`).
  **Cobertura: TC-465**, **39 condiciones** con tres denominadores y seis controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 21 de las 39 en rojo**; las 18
  que pasan son lo que esta tanda no mueve —los ocho cortes de `hfUmbrales`, el ritmo que el score
  ya leía, la compuerta de FEVI, las dos opciones del selector, los controles de diastólica,
  válvulas y Excel, y el renglón «4/4 en eco» sin péptido—.
  ⚠️ **TC-465 MORÍA POR EXCEPCIÓN CONTRA HEAD EN SU PRIMERA VERSIÓN**, por llamar a
  `hfPepRitmoTxt` directo: un `ReferenceError` mata la corrida entera y entonces el caso prueba que
  el árbol es distinto, no que sabe medir. Es la misma lección que TC-455 y TC-462 ya tienen
  escrita.
- ⚠️ **Me comí el acento grave TRES veces**, las tres en comentarios míos: dos dentro de un
  template inline de la sonda y una en el cuerpo de TC-465.
  ⚠️ **Y `scripts/check_backticks.py` NO ALCANZA A LOS TEMPLATES INLINE DE UNA SONDA:** cubre el
  cuerpo de un `caso(...)` y el de la sonda inyectada, pero no un `` J(`…`) `` suelto. Las dos de
  ese tipo pasaron su chequeo y las cazó `node --check`; la del caso la dio él con la línea exacta.
  **Correr los dos, siempre.**

### Cortes de la estenosis AÓRTICA y revisión de la estenosis tricuspídea (2026-10-13)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`16e20e6`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **siete**
  commits de la tanda del borrado en Válvulas ya incluidos **y pusheados**. Los **tres** commits de
  esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 3 → 2 → 1.**
  El **1** (el gradiente medio y la Vmax) y el **2** (el DVI, la planimetría y el AVA indexada)
  tocan la MISMA función —`eaGradoCalculado`— pero en partes distintas y **se revierten en
  cualquier orden**: el 1 cambia la cascada del gradiente y una entrada de `EA_BANDAS`, el 2 agrega
  tres funciones nuevas y un bloque al final. ⚠️ **PERO EL 2 NOMBRA `EA_BANDAS.gmedModMin`, QUE NACE
  EN EL 1**, en dos lugares: el texto del badge y la fila del cuadro de referencias. Revertir el 1
  sin revertir antes el 2 deja esos dos imprimiendo `undefined` —no rompe la app, porque es una
  interpolación de texto— pero publica «no gradúa por debajo de undefined» en pantalla.
  **El 3 es TC-464 más documentación** y afirma el comportamiento de los dos: revertir cualquiera
  sin el 3 deja TC-464 en rojo. ⚠️ **Y EL 1 ADAPTÓ TC-463 EN TRES LUGARES**: usaba Vmax 2 como valor
  «leve», y con el corte nuevo eso es el centinela.
- **LA TAREA PEDÍA CUATRO COMMITS Y SON TRES: el de la ESTENOSIS TRICUSPÍDEA SE OMITIÓ**, porque la
  fórmula, las unidades y el corte son correctos (ver abajo). Es la propia orden la que lo prevé.

- **Línea base al cierre: suite 475/479 en la corrida completa con el pendrive `DISK_IMG`
  MONTADO, Semgrep 127 / 0 ERROR, Excel 435 columnas con el HASH IDÉNTICO a HEAD, celular 43 a
  360 px y 52 a 390 px con 1 ALTA cada uno —IDÉNTICO a la línea base, y `--todo` da 374 y 383: las
  tres filas nuevas del cuadro de referencias no agregan un solo hallazgo—.** Los cuatro rojos son
  los de ENTRADA y NO son regresiones: **TC-223** (el documentado, falla por la fecha), **TC-376**,
  **TC-390** y **TC-406**. **El denominador subió a 479**: esta tanda agregó **TC-464**. La de
  ENTRADA, medida en HEAD limpio el 2026-10-13, fue **474/478** con el pendrive montado y los
  mismos cuatro rojos, con el `md5` de `index.html` sin moverse durante la corrida (`da36f208…`).

- **LOS TRES SÍNTOMAS DEL REPORTE REPRODUCEN, Y UN CUARTO DETALLE NO.** Medido con teclas reales
  contra una copia de HEAD, en las **73 escenas** de `scripts/_probe_eacortes.mjs`:
  (a) el gradiente medio de 15 y de 30 mmHg daba `sin` y el EN SUMA callaba; (b) el DVI 0,48 con
  AVA 1,50 daba `sin`, con el badge diciendo «Sin estenosis / leve (≥1.5cm²)»; (c) la planimetría
  0,9 daba `sin` y el cuadro de referencias en «—». (d) el AVA por continuidad 1,20 daba moderada,
  o sea el médico tiene razón en que esa parte funciona.
  ⚠️ **LO QUE NO REPRODUCE ES EL OPERADOR: el reporte dice «con >40» y la app usa `>=40`**, y
  siempre lo usó. Medido por sus dos lados: el 40 exacto da severa y el 39, moderada. **No se movió
  ningún operador del gradiente.**

- **LA REGLA DE INTEGRACIÓN NO SE TOCÓ: sigue siendo el PEOR de los criterios cargados.** Lo que
  cambió es cuántos criterios hay. Y lo nuevo se aplica **después** del peor de los tres viejos, así
  que **por construcción** —no por una medición a posteriori— en toda escena donde el DVI, la
  planimetría y el AVA indexada se abstengan, `grado`, `criterio`, `gVel`, `gGrad`, `gAva`,
  `gVelGrad` y `criterioVelGrad` valen byte por byte lo de HEAD.

- ⚠️ **SÓLO LA Vmax VOTA «LEVE», Y LAS OTRAS CINCO SE ABSTIENEN EN ESA BANDA. ES UNA DECISIÓN MÍA,
  DECLARADA, Y DEJA UNA PARTE DE LA ORDEN SIN HACER.** La Tabla 3 de la EAE/ASE 2009 (p. 10) publica
  una columna «Mild» para las seis variables, pero esa banda **no tiene cota que la separe de lo
  NORMAL**: un gradiente medio de 3 mmHg, un DVI de 0,9, un área de 3,5 cm² y un AVA indexada de 1,8
  son los de un corazón sano y caen todos ahí — la misma página escribe *«A normal AVA in adults is
  ∼3.0–4.0 cm²»*. Votar 'leve' pondría «EAo leve.» en el informe FIRMADO de todo paciente al que se
  le mida el área, que es un resultado que **contradice la guía**, y por eso entra en el punto (4) de
  la orden. **La Vmax es la única con techo de normalidad publicado** (la columna «Aortic
  sclerosis», `≤2,5`). Las dos alternativas están en `docs/PENDIENTES.md` → A-1.

- **LA ESTENOSIS TRICUSPÍDEA NO TIENE ERROR, Y EL COMMIT 3 SE OMITIÓ.** La fórmula es
  `π·(Ø_TSVD/20)²·VTI_TSVD / VTI_entrada` —diámetro en **mm**, el `/20` pasa a cm y saca el radio en
  un paso; los dos VTI en **cm**— y es **exactamente** la de la nota `ᵃ` de la **Tabla 10, p. 19** de
  la EAE/ASE 2009 (*«Stroke volume derived from left or right ventricular outflow»*) y la del texto
  de esa página (*«SV divided by the tricuspid inflow VTI as recorded with CWD»*). Corte `≤1 cm²`,
  de la misma tabla. **Recalculada a mano en tres casos, coincide dígito por dígito con la app:**
  Ø 25 mm (área TSVD `π·1,25² = 4,9087 cm²`) con VTI TSVD 18 y entrada 15 → **5,89**; con 14 y 70 →
  **0,98**; con 3 y 15 → **0,98**.
  ⚠️ **EL «VTI TSVD DE ~3» DEL REPORTE ES ARITMÉTICA CORRECTA, NO UN DEFECTO.** Con el VTI de
  entrada **normal** (15 cm), `4,9087·x/15 ≤ 1` pide `x ≤ 3,06` — pero un VTI de entrada normal **es
  el de una válvula sin estenosis**: la señal de estenosis vive en el **DENOMINADOR**, y la propia
  Tabla 10 marca **>60 cm** para la ET significativa. Con un VTI de entrada de 70 cm basta un VTI
  TSVD de **14,26 cm**, que es un valor bajo-normal plausible.
  ⚠️ **Y ESA MISMA TABLA TIENE UN CUARTO CRITERIO QUE LA APP NO VOTA**: *«Inflow time-velocity
  integral >60 cm»*. El campo existe (`et_vti_diast`) y se usa sólo como denominador del área. Es el
  que más directamente diría en voz alta lo del párrafo anterior. `PENDIENTES.md` → A-5.

- ⚠️ **TRES PIEZAS DE CABLEADO QUE NO ERAN OBVIAS, Y SIN ELLAS EL ARREGLO NO LLEGABA.**
  (1) `avaPlanEditado` es el **dueño único del gesto** de editar el AVA por planimetría: sus dos
  puertas llevaban `avaPlanSync(...);avaPlanPintar()`, que espeja y dice si el valor es plausible y
  **nada más** — ninguna corría la cadena que escribe el grado, o sea el síntoma (c) por el otro
  lado. (2) `ava_plan` entra en `EA_GRADO_INSUMOS`: desde que vota, un valor fuera de banda tiene que
  **retirar** el grado sugerido. (3) **`calcBSA` recalcula la aórtica también en su rama SIN peso ni
  talla**; su comentario declaraba lo contrario y era cierto hasta hoy — desde que el AVA indexada
  vota, borrar el peso dejaba en el informe firmado una severidad sostenida por un peso que ya no
  existe. Sólo puede **bajar** el grado, nunca subirlo.

- ⚠️ **LA FRASE «el grado consignado no coincide con las mediciones» ALCANZA A MÁS ESCENAS, Y ES
  PREEXISTENTE — ESTÁ MEDIDO.** Sale de `eaEscenario().esperado`, que es una **segunda lectura** del
  veredicto (mira el AVA y la pareja Vmax/gradiente y nada más), así que puede diferir del grado que
  el dueño único escribe. La escena de control «Vmax 3,5 + AVA por continuidad 1,60» la produce **sin
  ninguna variable de esta tanda**, idéntica en HEAD y hoy. Cambiarla es cambiar un texto del informe
  firmado y esta orden no lo autoriza. `PENDIENTES.md` → A-3.

- **CONTROL NEGATIVO MAYOR, con escenario CARGADO para que tenga denominador:** Excel en **435
  columnas con el hash IDÉNTICO**, **1094 campos**, las insuficiencias, la estenosis mitral, la
  pulmonar y la tricuspídea, y el veredicto de la función diastólica (`dd-interp`), **todos idénticos
  a HEAD**. ⚠️ **La primera versión de ese control leía `diast-badge`, que NO EXISTE**, así que
  informaba «idéntico» comparando `'NO EXISTE'` contra `'NO EXISTE'` — un denominador vacío que pasa
  por una medición buena. El id real es `dd-interp`.
  **Las cuatro superficies, una por una:** informe narrativo y EN SUMA medidos en tres estilos en
  todos los grupos; **Excel** con sus 435 columnas y el hash; **PDF** — no gana ni un campo:
  `ava_plan` tiene **cero** apariciones en el bloque del PDF, que sigue imprimiendo `ea_grado`, el
  mismo valor ya verificado en las otras tres.

- **Arnés: `scripts/_probe_eacortes.mjs`** (A/B de solo lectura con `--file`), diez grupos (`V`, `G`,
  `D`, `P`, `X`, `C`, `M`, `B`, `T`, `N`), **73 escenas** con teclas y clics reales.
  **Cobertura: TC-464**, **24 condiciones** con cuatro denominadores y cinco controles negativos.
  **Verificado que sabe fallar contra HEAD en un worktree aparte: 19 de las 24 en rojo**; las cinco
  que pasan son el AVA por continuidad —que esta tanda no mueve—, el control negativo del grado
  fijado a mano, los controles de las otras lesiones y del Excel, y los dos de la tricúspide.
- ⚠️ **MI PROPIA SONDA ABORTÓ EN DOS ESCENAS Y ESO ESTUVO BIEN.** `diam_tsvi` vive en un `.fg` con
  `display:none` desde que el campo se mudó a AI/VI: **no tiene geometría, así que no es un campo que
  se pueda tipear**. La sonda abortó nombrándolo en vez de informar «sin cambios» sobre un AVA que
  nunca se calculó. La puerta visible es `diam_tsvi_ao`. Es la lección que este archivo ya tiene
  escrita para `im_dtsvi` y `im_itv_tsvi`.
- ⚠️ **CASOS ADAPTADOS: SIETE**, con el motivo escrito en cada uno, y **seis los destapó la SUITE
  COMPLETA**, no la corrida de zona. **TC-463** (usaba Vmax 2 como valor «leve», que con el corte
  nuevo es el centinela, en tres lugares); **TC-367** (el gradiente que «no vota» pasa de 20 a 19, y
  el VTI TSVI de la escena del AVA normal de 20 a 22 para que el DVI no se meta); **TC-369**, que
  afirmaba en tres condiciones que `ava_plan` **NO vota** —era la decisión del 2026-10-06, que esta
  orden revierte—; **TC-374**, **TC-377** y **TC-401**, los tres del fundamento; y **TC-423**, cuyo
  control negativo usaba `ava_plan = 1,2` como «dato cargado que no gradúa», y hoy gradúa.
- ⚠️ **TRES DE ESOS SEIS NO FALLABAN POR EL VALOR SINO POR EL ORDEN DEL GESTO, Y ESO COSTÓ DOS
  VUELTAS.** TC-374 y TC-377 cargaban la planimetría **después** de consignar el grado a mano. Desde
  que `ava_plan` vota, eso dispara la regla **R6** —«suelta el grado manual cuando el GRADO CALCULADO
  cambia»—: la foto que R6 guarda al fijar «severa» era el calculado **sin** la planimetría, así que
  al cargarla el calculado se mueve, R6 suelta el manual y el autocálculo pisa el grado. Cargando
  primero, la foto ya la incluye — y es además el orden real del médico: primero mide, después
  consigna. **Y el VALOR también había que moverlo**: con un área severa la planimetría **iguala** el
  calculado al manual, desaparece la DISCREPANCIA, y `sevFundamento` **vacía el cajón a propósito**,
  así que las frases del fundamento no llegan al informe. Las dos mitades hacían falta.
- ⚠️ **Me comí el acento grave SEIS veces**, todas en comentarios míos dentro del cuerpo de un caso,
  con el archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea
  exacta las seis veces, en dos tandas de tres; `node --check` apuntaba a la apertura del template,
  decenas de líneas antes. **Correrlo ANTES de `node --check`, no después.**

- **Dónde está todo:** `docs/mapa/aortica-cortes.md` (**mapa NUEVO**: el dueño único, los seis
  criterios con su corte, las tres piezas de cableado y el cuadro de once filas),
  `docs/mapa/valvulas.md` → el puntero al mapa nuevo y las constantes, `docs/fuentes/FUENTES.md` →
  «Estenosis AÓRTICA — los cortes por variable y por grado» (las dos guías leídas, con el folio
  verificado en el pie impreso y las tablas leídas de la IMAGEN), `docs/PENDIENTES.md` → **ocho**
  cosas declaradas y no tocadas (A-1 a A-8).

### El BORRADO en Válvulas — IM, IAo, EAo e IT, y las seis reglas del 13/10/2026 (2026-10-13)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`a3ccf99`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **seis**
  commits de la tanda de los diagramas de la ASE ya incluidos **y pusheados**. Los **siete** commits
  de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 7 → 6 → 5 → 4 → 3 → 2 → 1.**
  El **1** crea `sevRetirarSugerido`, que es el dueño único del retiro, y **del 2 al 6 cuelgan todos
  de él**. Revertirlo solo **no rompe la app** —las llamadas van con `typeof` y fallan silenciosas—
  pero deja a las cuatro lesiones sin retirar el grado, o sea con el defecto entero reabierto.
  **El 2, el 3 y el 4 se revierten entre sí en cualquier orden**: el 2 es la IAo, el 3 la EAo y el 4
  la IT, y ninguno llama a otro.
  ⚠️ **EL 5 DEPENDE DEL 4 EN LA FORMA, NO EN EL NOMBRE:** el 4 cambió `calcIT_ESC` para DERIVAR
  `scores` de `params`, y el 5 hace lo mismo en `calcIM_ESC` — son dos funciones distintas, así que
  se revierten solos; lo que comparten es el patrón.
  ⚠️ **Y EL 6 LLEVA DOS COSAS QUE EL 5 NECESITA PARA NO PUBLICAR DE MENOS:** el `<span>` hermano del
  grado de la fila y el vaciado en `limpiarCampos`. Revertir el 6 sin el 5 deja
  `imGradoFilasPintar` llamándose sobre nueve nodos que no existen —inocuo, el pintor se protege
  con `if (!el)`— pero deja la regla 5 sin superficie.
  ⚠️ **EL 7 NO ES SÓLO DOCUMENTACIÓN, y conviene saberlo antes de revertir:** además de TC-463 y
  los cuatro archivos de documentación lleva **tres líneas de `index.html`** que ese caso destapó
  —los tres calculadores llamados también en el CIERRE de la ventana de reimpresión—. Revertirlo
  reabre ese defecto, y además deja TC-463 en rojo, porque el caso afirma el comportamiento de los
  seis anteriores. ⚠️ **Y EL 6 ADAPTÓ CUATRO CASOS** (TC-416, TC-442, TC-403 y TC-296): revertirlo
  sin reponer esas afirmaciones los deja midiendo lo contrario, no en rojo.

- **Línea base al cierre: suite 474/478 en la corrida completa con el pendrive `DISK_IMG` MONTADO,
  Semgrep 127 / 0 ERROR, Excel 435 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno
  —IDÉNTICO a la línea base, y `--todo` da 374 y 383: los nueve span nuevos y la clase `.calc-grado`
  no agregan un solo hallazgo—.** Los cuatro rojos son los de ENTRADA y NO
  son regresiones: **TC-223** (el documentado, falla por la fecha), **TC-376**, **TC-390** y
  **TC-406**. **El denominador subió a 478**: esta tanda agregó
  **TC-463**. La de ENTRADA, medida en HEAD limpio el 2026-10-13, fue **473/477** con el pendrive
  montado y los cuatro rojos de siempre, con el `md5` de `index.html` sin moverse durante la corrida
  (`d0bd8055…`).
  ⚠️ **TC-249 ES UN CUARTO INESTABLE POR ORDEN DE CORRIDA**, al lado de TC-246, TC-252 y TC-260:
  sale rojo en un `--solo` de 72 casos de la zona aórtica y **verde corrido solo**. **Repetir antes
  de sospechar.**
- **Dónde está todo:** `docs/mapa/valvulas-borrado.md` (**mapa NUEVO**: el retiro del grado, la
  propiedad de las pastillas, los dos métodos de la IM, la continuidad de la IT, el grado de cada
  fila, la fila de FR del papel y las seis trampas medidas), `docs/mapa/valvulas.md` → el puntero al
  mapa nuevo en las convenciones transversales, `docs/fuentes/FUENTES.md` → «Tabla 8 — IM, folio
  332 — RE-LEÍDA el 2026-10-13», `docs/PENDIENTES.md` → **nueve** cosas declaradas y no tocadas
  (B-1 a B-9).

- **NO CAMBIA NINGÚN BADGE, NINGÚN GRADO, NINGUNA FILA NI NINGUNA FRASE CON EL DATO CARGADO, Y ESTÁ
  MEDIDO.** A/B contra HEAD en las **56 escenas**: las únicas diferencias con el dato cargado son
  las **PASTILLAS** de IM, IAo e IT —que es exactamente la regla 2— y la marca de dueño, que es un
  `dataset` y no viaja con el estudio. Ni un badge, ni un grado, ni una fila de referencia, ni una
  frase del informe narrativo, ni el EN SUMA se mueven.
- **LA CAUSA ERA UNA Y LAS CUATRO ESCRITORAS LA COMPARTÍAN.** Escriben el grado **sólo cuando hay
  dato** y, sin dato, se van por un `return` —o por un `if (R.grado)` sin `else`— sin retirar lo que
  ya estaba. Medido con teclas reales en las **56 escenas** de `scripts/_probe_valvborra.mjs`, A/B
  contra una copia de HEAD: **HEAD 14/56 vuelven al estado inicial · hoy 56/56.** O sea **42 escenas
  no volvían**, repartidas en las cuatro lesiones (IM 8/21 · IAo 3/19 · EAo 0/4 · IT 3/12).
  ⚠️ **ESE 14/56 ES EL NÚMERO BUENO Y NO EL PRIMERO QUE ESCRIBÍ.** La primera corrida informó
  **10/56** y era INVÁLIDA —el borrado no había ocurrido en la mayoría de las escenas, ver abajo— y
  la segunda, con la sonda ya arreglada pero con el denominador del estado inicial sin afinar,
  volvió a dar 10/56. Con las dos correcciones del denominador puestas, HEAD da 14. **Medir y
  después escribir**, que es lo que este archivo ya documenta como error propio dos tandas atrás.
  **El control negativo del mismo barrido es la mitad que lo prueba:** la estenosis mitral, la
  tricuspídea y la pulmonar **SÍ** devolvían su grado al centinela, así que no era una limitación
  del diseño. Cargar las **nueve** lesiones y borrarlo todo dejaba el EN SUMA diciendo **«IM severa.
  EAo severa. IAo severa. IT severa.»** sobre un formulario vacío; hoy dice **«Estudio sin
  alteraciones estructurales ni funcionales significativas.»**
- ⚠️ **LA HIPÓTESIS DEL «CAMPO VACÍO SE LEE COMO 0» ES FALSA, Y SE MIDIÓ.** `v()` devuelve `null` y
  las cascadas no entran: ningún campo vacío vota «leve». La verdadera es la otra que el prompt
  ofrecía: «la cuenta sólo pinta cuando hay dato y no limpia cuando no lo hay».
- ⚠️ **TRES DE LOS SÍNTOMAS REPORTADOS NO REPRODUCEN, Y HAY QUE DECIRLO.** (a) El área del jet no
  «queda leve sea cual sea el valor»: queda el grado que dio el valor. (b) El Ø del jet en el TSVI
  con severa **no vuelve a leve**: queda severa. (c) El THP con 550 ms **no queda severa**: 550 es
  *leve* por el corte `>500 ms` de la propia app, y queda leve. (d) En la IAo el informe **SÍ** dice
  «con insuficiencia leve» y el EN SUMA «IAo leve.»: referencias e informe **coinciden**, los dos
  rancios. **La contradicción entre referencias e informe estaba en la EAo**, y ahí sí: el recuadro
  vuelve a «— sin Vmax ni gradiente medio cargados» y el grado seguía en leve/moderada/severa.
  (e) Y en la IT la densidad severa contra una continuidad leve daba **severa en las dos**: lo que
  la regla 4 pide no era un desacuerdo, era un cambio de criterio.
- **LA MAQUINARIA DEL DUEÑO YA EXISTÍA Y ESTABA A MEDIAS.** `dataset.sugerido` estaba en **IAo y
  EAo** (medido: `sug=1/2/4` y `sug=leve/…`) y **faltaba en IM y en IT** (`sug=null` en las 33
  escenas de esas dos). Es lo que hace que **un estudio guardado abra como se guardó**: la marca no
  se persiste y `limpiarCampos` la borra, así que un estudio archivado jamás coincide.
- ⚠️ **DOS COSAS SE CERRARON DE REBOTE Y NINGUNA HUBO QUE ESCRIBIRLA.** `_eaApagarAuto()` existía
  desde el 2026-10-11 y estaba **INERTE**: su segunda guarda pide que el grado haya quedado en el
  centinela, y sin la rama negativa de `clasificarEA_Vmax` el grado nunca volvía ahí al **borrar**
  —sólo al **corregir** la Vmax de 4,5 a 1,4—. Y la deuda que `PENDIENTES` declaraba para esa
  función («Sin en el desplegable aórtico no es durable… pide una señal nueva que sobreviva al
  recálculo sin ser `esqSevManual`») se cierra con la señal que ya existía: `dataset.sugerido`.

- ⚠️ **CUATRO PUERTAS PRENDÍAN UNA PASTILLA SIN DEJAR DUEÑO, Y LA PEOR ERA LA REGLA J.**
  `valvAutoAbrirCajones` corre en **cada** `showTab('valvulas')` y prende la pastilla cuando el
  grado es graduable: basta entrar a Válvulas con un grado escrito, o sea el camino más frecuente de
  todos. Era exactamente lo que `PENDIENTES` declaró para la aórtica en la tanda 6c —«el código que
  la prende no registra dueño»—. Las otras tres: las tres insuficiencias, que **no se prendían desde
  el cálculo por ningún camino**, y el bloque inline de `calcPSAP` por la velocidad del chorro de IT.
  Las cuatro registran ahora, **después** del toggle y no antes, porque la cola de `toggleValvPill`
  borra la entrada.
- **MEDIDO EN LAS CUATRO LESIONES CON LOS DOS DUEÑOS:** prendida por la **APP** → con dato
  `pill=true auto=true clave='1'`, y al borrar `pill=FALSE`, `auto=false`, `clave=null` y el grado en
  el centinela; marcada a **MANO** → `auto=false` y al borrar `pill=TRUE`. **La EAo en sus TRES
  grados** (Vmax 2, 3 y 4 m/s): se apaga en los tres, no sólo en severa.
- ⚠️ **EL GATE `valvula === 'pulmonar'` DE LA COLA DE `toggleValvPill` SE FUE, y no es cosmético.**
  Era correcto mientras `VALV_INSUF_AUTO` lo leyera sólo `_ipApagarAuto`; con cuatro rutas
  leyéndolo, dejarlo habría hecho que un clic del médico en esos tres botones NO le quitara a la app
  la propiedad, y el auto-apagado se llevaría puesta una afirmación suya.
- ⚠️ **CONSECUENCIA DECLARADA: cerrar a mano una pastilla auto-prendida retira el grado, y reabrirla
  no lo recupera.** Es la cadena de siempre —`toggleValvPill` → `valvApagarGrado` →
  `valvSev.aplicar(…, centinela)`, que pone `esqSevManual` y por eso es durable— y es lo que este
  archivo ya declara para la estenosis tricuspídea. Lo que cambió es que **alcanza a tres lesiones
  más**, porque antes esas pastillas no se prendían. TC-463 lo fija como límite; `PENDIENTES` → B-3.

- **LA IM INTEGRA LOS DOS MÉTODOS Y AL INFORME VA EL PEOR DE LOS MARCADOS.** Hasta hoy la casilla
  «Incluir en el informe» **no movía ni un grado** —medido: «ambos marcados» y «ambos sin marcar»
  daban los dos 4— y la continuidad **no votaba**: con sólo continuidad cargada (Vol-R 15,7 ml,
  FR 19 %) el grado era **0** y el informe firmado decía «sin estenosis ni insuficiencia» sobre una
  válvula cuantificada por el método volumétrico. Hoy ese paciente sale **«IM leve.»**
  La regla de integración **no cambió una condición**: es `_imIntegrar`, la cascada de siempre
  extraída a su propia función para poder correrla dos veces.
- ⚠️ **«GANA EL PEOR» SE PRUEBA POR LOS DOS LADOS, Y CON UNA SOLA PAREJA NO SE PUEDE.** A/B contra
  HEAD en las **siete** escenas del grupo `metodo`: solo-PISA 4→4 · solo-CONT **0→1** ·
  ambos-marcados 4→4 · ambos-sin-marcar 4→4 · ninguno 1→1 (= HEAD) · **cont-PEOR-marcada 1→4** ·
  cont-PEOR-sin-marcar 1→1 (control negativo). Un veredicto que se quedara **siempre** con PISA
  pasa las cinco primeras.
- ⚠️ **DOS DISPARADORES FALTABAN**, y sin ellos el grado se quedaba atrás: `diam_mit` tenía
  `oninput="calcContIM()"` pelado —la única de las cinco puertas de la continuidad que no llamaba a
  las dos funciones seguidas— y `im_pdf_cont` tenía `onchange="this.dataset.tocado='1'"` y ahora
  decide si el método entra al **grado**, no sólo a la fila del PDF.
- **LA FR LLEGA AL PAPEL, Y NO LLEGABA.** La tabla compacta tenía fila de EROA y de Vol-R y **no
  tenía fila de FR**; `imFrPdfVal` **no existía**. Medido con el PDF **generado de verdad**
  (interceptando el constructor de jsPDF): con los dos métodos el papel publica
  `EROA «PISA: 50.3 mm² · Cont: 27.5 mm²»`, `Vol.R «PISA: 40.2 ml · Cont: 22.0 ml»` y
  `FR «PISA: 39% · Cont: 26%»`. `freg-val` entró además al sellado (`_IM_PISA_SPANS`) y al respaldo
  de la ventana de reimpresión. ⚠️ **El formato del sellado NO cambia de versión**:
  `_imPisaPersistido` busca **por clave**, así que un informe anterior reimprime exactamente lo que
  imprimía, sin la fila de FR. **No se deduce y no se migra.**
- ⚠️ **LA FUENTE RESPALDA LA MITAD, Y LA OTRA MITAD ES CRITERIO ECOSMART.** ASE 2017 (Zoghbi,
  **Tabla 8, folio 332**, leída en texto completo): las filas **«RVol (mL)»** y **«RF (%)»** NO
  están calificadas por método, así que sus cortes valen para los dos. **La de la EROA SÍ: dice
  literalmente «EROA, 2D PISA (cm²)».** El **folio 312** define `EROA = RVol/VTI_RegJet` como
  fórmula general —la que usa la continuidad de la app— pero la guía **no publica una banda propia**
  para esa EROA. Aplicarle la de PISA es criterio de la app, no se mueve ningún número, y queda
  declarado en `PENDIENTES` → B-1.

- **EN LA IT GANA LA CONTINUIDAD (regla 4).** Medido: densidad «denso» (severa) con EROA 18,1 mm²
  (leve) daba grado **4** en pantalla, informe y EN SUMA; hoy da **1**, uno solo y el mismo en los
  tres, y al borrar la continuidad vuelve al grado de la densidad. ⚠️ **LO QUE SE RETIRA DEL
  VEREDICTO ES LA DENSIDAD DEL CHORRO Y NADA MÁS, Y ES MI LECTURA.** «Gana la continuidad» al pie de
  la letra descartaría una **vena contracta severa** —el parámetro con más peso de la Tabla 14 de la
  ASE 2017—, así que la VC sigue votando y el único que deja de decidir es el votante CUALITATIVO.
  `PENDIENTES` → B-2, con la línea exacta que habría que cambiar para la versión literal.
- ⚠️ **LA COMPUERTA ES QUE LA CADENA HAYA PRODUCIDO UN NÚMERO, no que los campos estén escritos.**
  Sin uno de los tres insumos la continuidad no tiene nada que decir y la densidad vuelve a decidir.
- **UNA FRASE NUEVA, DE PANTALLA Y NADA MÁS:** la fila `it-discordancia` agrega «Con datos de
  continuidad cargados el grado final sale de la continuidad: la densidad del chorro se muestra y no
  decide». `it-discordancia` **no tiene un solo lector** fuera de `calcIT_ESC` —verificado por grep:
  ni informe, ni EN SUMA, ni PDF, ni PPT, ni Excel— y la cláusula **no aparece** en ninguna de las 56
  escenas donde la continuidad no retira nada (0 diferencias en esa fila contra HEAD con dato).

- **NUEVE FILAS GANAN SU GRADO ENTRE PARÉNTESIS (regla 5):** cinco de la IM y cuatro de la IAo.
  ⚠️ **ES UN `<span>` HERMANO Y NO TEXTO DENTRO DEL `.calc-val`**, y eso NO es cosmético: el texto de
  `eroa-val`, `volr-val` y `freg-val` **ES** lo que el PDF publica —`_imPdfPisaTxt` lo lee literal— y
  lo que `_imPisaSellar` congela en el estudio. Un «(severa)» adentro habría entrado al papel
  firmado. ⚠️ **Y SIN `id`**, para que el barrido de `limpiarCampos` no les escriba «—» donde la
  regla pide blanco; se vacían con una llamada explícita, igual que las marcas «(revisar)» del VD.
  **No se tocan las filas que ya publican su grado** —el THP, la Vmax telediastólica, el VTI de la
  aorta descendente y las tres de la tricúspide—: la diferencia de formato queda en `PENDIENTES` →
  B-5.

- **CONTROL NEGATIVO MAYOR, medido en tres fases:** formulario vacío · las nueve lesiones cargadas ·
  todo borrado. En las dos primeras, **Excel en 435 columnas con el hash IDÉNTICO a HEAD** y las
  cinco lesiones ajenas (EM, ET, EP, IP y la función diastólica) **sin una sola diferencia**, con el
  EN SUMA letra por letra. En la tercera, las tres estenosis ajenas y la IP vuelven a su centinela
  igual que en HEAD. ⚠️ **El renglón de la diastólica queda en «Incompleto — ASE 2025» después de
  que se le cargan y se le borran SUS campos, y eso es PREEXISTENTE** —medido igual en HEAD, en la
  misma fase—: el control de la diastólica va con su propio gesto, cargando y borrando sólo los
  campos de las cuatro lesiones.
- **Arnés: `scripts/_probe_valvborra.mjs`** (A/B de solo lectura con `--file`), ocho grupos
  (`repro`, `borrado`, `dos`, `metodo`, `tric`, `pastillas`, `controles`, `pdf`), **56 escenas** con
  teclas y clics reales y el PDF generado de verdad.
  **Cobertura: TC-463**, **33 condiciones** con **8 denominadores** y **11 controles**. **Verificado
  que sabe fallar contra HEAD en un worktree aparte: 18 de las 33 en rojo**; las 15 que pasan son los
  grados CON dato —que son idénticos a HEAD, y eso es el punto—, el recálculo con dos datos y uno
  borrado, los controles de las lesiones ajenas, el Excel, la diastólica y los dos controles
  negativos (la onda S sola y el grado fijado a mano).
  ⚠️ **TC-463 CARGA CON `__t.set` Y NO CON TECLAS DE CDP**, y hay que decirlo: el cuerpo de un caso
  corre DENTRO de la página, no tiene acceso al protocolo del navegador y un `KeyboardEvent`
  construido a mano no es de confianza. Las mismas escenas van con **teclas y clics reales** en la
  sonda, que es la que midió los síntomas contra HEAD. Mismo reparto que TC-460.
  ⚠️ **Y UNA CONDICIÓN DE TC-463 NO MEDÍA NADA POR UN ID EQUIVOCADO:** `pdfDeInformeGuardado` busca
  por `i.id` y no por `estudioId`, así que la primera versión informaba «el callback no volvió»
  sobre un guardado perfecto. Un id que el consumidor no reconoce no es una medición.
- ⚠️ **CASOS ADAPTADOS: SIETE**, con el motivo escrito en cada uno. **TC-316** y **TC-348** fijaban
  el límite viejo con esas palabras —«LIMITE DECLARADO: en NATIVA el grado rancio se conserva» y «al
  bajar 25 → 15 sin limpiar, el grado severo SOBREVIVE»— y estaban escritos justamente para que no
  cambiara en silencio; **TC-435** afirmaba la regla 12 («el GRADO no cambia al borrar la Vmax»);
  **TC-335** fijaba «la EROA por continuidad se publica pero NO vota» en el rótulo y en la ayuda;
  **TC-416** decía «NO SE EXIGE QUE LAS PASTILLAS SE PRENDAN… está MEDIDO»; **TC-442** fijaba «la
  TRICÚSPIDE no tiene auto-apagado»; y **TC-403** y **TC-296** usaban `toggleValvPill` como gesto que
  ahora tiene consecuencia. **Seis de los siete afirmaban un hecho que estaba MEDIDO y que estas
  reglas dieron vuelta** — no estaban mal escritos, estaban describiendo la app de ayer.
- ⚠️ **EL TEXTO QUE AFIRMABA QUE LA CONTINUIDAD NO VOTA SE CORRIGIÓ EN LOS TRES LUGARES Y SÓLO EN
  ESA FRASE:** el `title` del rótulo «EROA continuidad», la fila «IM — EROA por continuidad y Vol-R»
  de la ayuda «Referencia clínica» y el comentario de `calcContIM`. **El reparo aritmético de los
  150 cm se conserva palabra por palabra** —es aritmética de la fórmula y no depende de quién vote—
  y la cápsula «Severidad (continuidad)» **no cambia**: sigue graduando por dos parámetros.

- ⚠️ **EL AUTO-PRENDIDO ABRIÓ UN DEFECTO EN LA VENTANA DE REIMPRESIÓN, Y HUBO QUE CERRARLO EN EL
  MISMO COMMIT.** La fase de **carga** de esa ventana corre `calcIM_ESC`, `calcIA_ESC` y
  `calcIT_ESC` con los datos del estudio **reimpreso**, y el **cierre** no los volvía a correr.
  Medido en un worktree del commit 6: la ventana dejaba las **tres** pastillas del paciente en
  pantalla **prendidas** (`false → true`) sobre un formulario vacío, con el escalón listo para
  publicar «con insuficiencia» y «IM presente.» en el informe firmado. Es **el mismo defecto y la
  misma solución** que la decisión de Maicol del 2026-10-08 para la IP: los tres se llaman también
  en el **cierre**, y ahí se auto-curan en las dos direcciones —la pastilla ajena se apaga y la
  propia vuelve—. ⚠️ **Y el párrafo de esa zona que dice «la reimpresión no toca las pastillas
  —medido»** era cierto cuando se escribió y dejó de serlo cuando `calcAo` ganó
  `valvAutoPrenderEsten` (2026-10-03) y `_eaApagarAuto` (2026-10-11). Lo fija TC-463, y está
  verificado que **sabe fallar** contra el árbol del commit 6.
- ⚠️ **MI PROPIA SONDA MIDIÓ UN BORRADO QUE NO OCURRIÓ, EN LA MAYORÍA DE LAS 56 ESCENAS.**
  `generarInforme()` **pelado salta a la pestaña Informe**, y al volver `showTab('valvulas')` corre
  `valvCerrarTarjetas`: los campos quedan sin geometría, `focus()` sobre un nodo oculto falla **en
  silencio** y los doce Backspace se los come el documento. El campo seguía con su valor y la sonda
  informaba «el grado no vuelve» sobre un gesto que nunca pasó. Va con `{silencioso:true}`, y hoy
  **aborta** si el tecleo o el borrado no quedan, o si el foco no llega al campo.
- ⚠️ **Y TRES DENOMINADORES MÁS QUE DABAN FALSOS.** (a) `im_dtsvi`, `im_itv_tsvi` y `diam_tsvi` están
  en `display:none` y **no son campos**: las puertas visibles del Ø y del VTI del TSVI son
  `ea_dtsvi` e `itv_tsvi`. (b) Un **clic** sobre un nodo sin geometría tampoco es un gesto: la sonda
  informó «ambos métodos marcados» con `im_pdf_cont.checked === false`. (c) El **estado inicial** se
  mide con los cuatro calculadores ya corridos sobre el formulario vacío y volviendo a entrar a la
  pestaña, para que `ea-sev` no se compare SIN PINTAR contra el mismo nodo pintado y para que la
  **regla J** haya tenido las mismas oportunidades de prender la pastilla; sin esas dos, ocho escenas
  salían «no volvió» con el grado, la pastilla y el informe perfectos.
- ⚠️ **Me comí el acento grave DOCE veces**, todas en comentarios míos dentro del cuerpo de un caso
  o del template de la sonda, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta las doce veces; `node --check` apuntaba a la
  apertura del template, cientos de líneas antes. Es el récord de esta serie — y el patrón es
  siempre el mismo: nombrar una función o un atributo entre acentos graves, que es cómo se escribe
  en prosa en todo el resto del archivo.

### Diagramas de flujo de la ASE en la ventana 🧭 — Figura 3, Figura 8, 8A y 8B (2026-10-13)

- Al **empezar** esta tanda, `main` local y `origin/main` estaban los dos en **`5752677`**, sin nada
  sin pushear —confirmado con un `git fetch` de verdad, no con el ref en caché—, con los **tres**
  commits de la tanda del Doppler mitral ya incluidos **y pusheados**. Los **seis** commits de esta
  tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 6 → 5 → 4 → 3 → 2 → 1.**
  El **1** crea `R.camino`, `R.nodoFinal`, el `nodo` de cada fila y los cuatro mapas de nodo final;
  **del 2 al 5 cuelgan todos de él**, pero revertirlo solo **no rompe la app**: `_bseDiagPlano` sale
  por su guarda de `!R.camino` y deja de dibujar, con la ventana en lo de HEAD.
  **El 2, el 3 y el 4 se revierten entre sí en cualquier orden**: el 2 es la Figura 3, el 3 la
  Figura 8 y el 4 las 8A/8B, y ninguno llama a otro. ⚠️ **PERO EL 2 LLEVA DOS COSAS QUE EL 3 Y EL 4
  USAN:** `plano.gap` en el motor —sin él los tres planos nuevos vuelven a los 34 px de la BSE y sus
  rótulos quedan tapados— y la rejilla `A25_C`/`_a25()`, que los cuatro planos nombran; revertir el
  2 sin revertir antes el 3 y el 4 deja `A25FA_PLANO_F8` y los dos de la 2016 llamando a una
  función que no existe, y un `ReferenceError` en la evaluación de un `<script>` **aborta el bloque
  COMPLETO** — o sea la app con cero pestañas con geometría.
  ⚠️ **Y EL 4 LLEVA UN CAMBIO DEL CAMINO QUE EL 1 CREÓ:** la rama de un solo criterio de la 8B pasa
  a empujar `a16b.unoyuno` en vez de `a16b.unosolo`, porque el dibujo funde las dos entradas a
  «Cannot determine» en una sola casilla.
  **El 5 (la tabla compacta) se revierte solo.** **El 6 es TC-462 más documentación** y afirma el
  comportamiento de los cinco: revertir cualquiera sin el 6 deja TC-462 en rojo. ⚠️ **Y EL 2
  ADAPTÓ TC-460**, cuyo control negativo afirmaba que la ASE no dibuja diagrama: revertir del 2 al
  5 sin reponer esas tres afirmaciones deja TC-460 midiendo de menos, no en rojo.

- **Línea base al cierre: suite 473/477 en la corrida completa con el pendrive `DISK_IMG` MONTADO,
  Semgrep 127 / 0 ERROR, Excel 435 columnas, celular 43 a 360 px y 52 a 390 px con 1 ALTA cada uno
  —IDÉNTICO a la línea base: los diagramas no agregaron un solo hallazgo, porque en celular no se
  dibujan—.** Los cuatro rojos son los de ENTRADA y NO son regresiones: **TC-223** (el documentado,
  falla por la fecha), **TC-376**, **TC-390** y **TC-406**. **El denominador subió a 477**: esta
  tanda agregó **TC-462**. La de ENTRADA, medida en HEAD limpio el 2026-10-13, fue **472/476** con
  el pendrive montado y los mismos cuatro rojos, con el `md5` de `index.html` sin moverse durante la
  corrida de entrada (`8320f467…`) ni durante la de cierre (`d0bd8055…`). `--todo` da **374 a 360 px
  y 383 a 390 px**, el mismo par que la tanda anterior midió.
- **Dónde está todo:** `docs/mapa/diastolica-diagrama.md` → la segunda mitad, «Los diagramas de la
  ASE» (las cuatro vías, los cuatro mapas, la rejilla de cinco columnas, el `gap` por plano y las
  trampas nuevas); `docs/fuentes/FUENTES.md` → «Derechos de autor de la ASE 2025 y de la ASE/EACVI
  2016» y «Las cuatro figuras de la ASE, caja por caja y flecha por flecha»; `docs/PENDIENTES.md` →
  **ocho** cosas declaradas y no tocadas (E1 a E8).

- ⚠️ **NINGUNA DE LAS DOS GUÍAS DE LA ASE ES DE ACCESO ABIERTO, A DIFERENCIA DE LA BSE 2024.**
  Verificado en el pie de la **página 1** de cada PDF, literal: «Copyright 2025 Published by
  Elsevier Inc. on behalf of the American Society of Echocardiography.» y «Copyright 2016 by the
  American Society of Echocardiography.» Barrido del PDF completo buscando `Creative Commons`,
  `CC BY`, `open access` y `under the terms of`: **cero coincidencias en los dos**. **No hubo que
  parar ninguna guía**: lo que esos avisos reservan es la OBRA —la disposición gráfica y el texto
  literal de las cajas— y el dibujo de la app no es esa obra: disposición propia (cinco columnas
  verticales contra el reparto horizontal del original), palabras propias en todas las cajas, sólo
  la lógica de decisión que la app ya implementa, y los valores del paciente adentro. El pie de los
  cuatro **NO atribuye una licencia Creative Commons**, que es lo que corresponde a la BSE y lo que
  NO corresponde a estas dos; TC-462 lo fija por los dos lados.
- **LAS DOS REGLAS DE FOLIO QUEDARON COMPROBADAS EN EL PIE IMPRESO, no por aritmética:** la ASE 2025
  página 1 → folio **537** (folio = página + 536) y la ASE/EACVI 2016 página 1 → folio **277**
  (folio = página + 276).

- **NO CAMBIA NINGUNA CUENTA, NINGÚN CORTE, NINGÚN VEREDICTO NI NINGUNA SUPERFICIE FIRMADA, Y ESTÁ
  MEDIDO.** A/B contra HEAD en las **69 escenas** de las tres vías —las de los trabajos anteriores,
  reusadas a propósito—: **0 diferencias** en informe (3 estilos), EN SUMA (3), Excel con sus **435**
  columnas, franja del PPT, grado del Laboratorio, hash de los campos guardados y el cuadro gris
  entero; y la fila del Excel **clave por clave** en 5 escenas, también 0.
- **EL NODO FINAL NO SE EMPUJA EN NINGUNA RAMA: SE DERIVA DE `R.clave`**, igual que en la BSE.
  **Medido: el último nodo del camino es el nodo final en 69 de 69 escenas**, y el badge del cuadro
  gris concuerda con ese nodo en las 28 ramas que recorre TC-462.
- ⚠️ **CUATRO MAPAS DE NODO FINAL Y NO UNO, PORQUE LAS CLAVES SE REPITEN.** `insuf`, `indet`,
  `normal` y `g3` existen en la **8A y en la 8B** y nombran casillas distintas; `normal` se repite
  además entre el ritmo sinusal y la FA de la ASE 2025. Un solo mapa habría pintado el camino rojo
  terminando en la casilla de otro algoritmo.
- ⚠️ **DOS PARES DE CLAVES COMPARTEN CASILLA, Y ES A PROPÓSITO:** `incompleto`+`insuf` →
  `a25.fin-sindatos` y `g1prol`+`g1alt` → `a16b.fin-g1`. Son categorías con frases distintas en el
  informe pero **una sola casilla** de la figura; el motivo exacto lo dice el renglón de resultado
  de la ventana. `PENDIENTES.md` → E2 y E3.
- **LA FIBRILACIÓN AURICULAR DE LA ASE/EACVI 2016 NO LLEVA DIAGRAMA, y no es una vía pendiente:**
  esa guía enumera parámetros en el folio 295 y **no los combina en ninguna regla de conteo**, así
  que la app no publica veredicto y no hay camino que dibujar. Su ventana queda IDÉNTICA a HEAD, y
  TC-462 lo fija como control negativo.

- **EL UMBRAL DE ANCHO ES UNO SOLO PARA LAS CINCO GUÍAS-VÍA, Y ESTÁ COMPROBADO.** Sigue siendo la
  única media query `@media (min-width:780px)`, y **TC-462 cuenta cuántas media queries tocan la
  caja del diagrama y exige que sea UNA**: con dos, bajarlo para el iPad vertical obligaría a
  cambiar dos números y el que se olvida deja media app con dibujo y media sin. **Medido en las 48
  celdas** (4 escenas × 2 temas × 6 anchos): a **1200, 900 y 790 px** diagrama con el texto a
  **11,5 px exactos**, tabla compacta y lista escondida; a **770, 390 y 360 px** sin diagrama y con
  la lista larga entera. ⚠️ **Un iPad en vertical son 768 px y queda 12 px por debajo**:
  `PENDIENTES.md` → E1.
- **A 360 px LA VENTANA ES LA DE HEAD, LETRA POR LETRA:** A/B en las **69 escenas** con **0
  diferencias** en el texto VISIBLE del cuerpo, en su hash, en el número de filas y en el de filas
  con geometría, y **cero diagramas visibles** a ese ancho.
- **CONTROL NEGATIVO MAYOR: la BSE 2024 en ritmo sinusal y en FA, y la ASE/EACVI 2016 en FA, 9
  escenas con 0 diferencias contra HEAD** en el cuadro, la ventana, el dibujo, la tabla, la lista
  larga, el ensanche de la tarjeta y los avisos ámbar. La BSE sigue dibujando sus f17 y f19.

- ⚠️ **EL HUECO ENTRE FILAS PASÓ A SER POR PLANO (`plano.gap`), Y NO ES COSMÉTICO.** Lo fija el
  rótulo de la arista más baja, no el aire que se ve bien: de `a25.elevada` salen **cuatro** aristas
  con rótulo y, con los 34 px de la BSE, la cuarta calle cae DENTRO de la fila de abajo — el rótulo
  no desaparece de forma que se note, lo tapa la caja —que se dibuja después— y el dibujo parece
  tener flechas sin nombre. La BSE **no cambia**: `plano.gap || BSE_DG.GAP`.
- ⚠️ **CADA COLUMNA ES UNA CADENA COMPLETA, y tampoco es decoración.** Una vertical larga necesita
  su columna libre en **todas** las filas que cruza: en la Figura 8 la cadena del «ninguno o uno
  positivo» baja por la columna 0 y la de «tres o más» por la 4, y las cajas del paso 2 viven en
  las del medio. Con las cadenas mezcladas, una de esas líneas cruzaría una caja por la que el
  paciente **no pasó**, y el dibujo diría lo contrario de lo que el camino dice.
- ⚠️ **LA SUPERPOSICIÓN DE RÓTULOS SE MIDE, NO SE MIRA EN EL PNG.** El grupo `geo` de la sonda
  compara la caja de texto de cada rótulo contra la de cada caja y contra la de los otros rótulos:
  **cero choques y cero rótulos tapados en las 69 escenas**. **Destapó tres defectos reales** que la
  captura había dejado pasar, y uno de ellos es estructural: **`calleAntes` choca SIEMPRE con el
  rótulo «Resultado de este paciente» si la arista termina en un nodo FINAL** —pone su rótulo 3 px
  encima de la caja destino, que es justo donde el motor lo imprime—.
- ⚠️ **EL PREFIJO `bse-` ES HISTÓRICO Y NO DE ALCANCE.** Las clases, los atributos y las funciones
  nacieron con la BSE y hoy los comparten las cinco guías-vía. Renombrarlos obligaría a adaptar
  TC-460 y `scripts/_probe_bsediag.mjs` enteros sin cambiar una línea de comportamiento, así que se
  reusaron tal cual. `PENDIENTES.md` → E8.

- **Arnés: `scripts/_probe_asediag.mjs`** (A/B de solo lectura con `--file`), nueve grupos
  (`camino`, `diagrama`, `geo`, `ancho`, `angosto`, `tabla`, `superficies`, `excelab`, `otras`) más
  `captura`. **69 escenas** cargadas con teclas reales: las 24 de la ASE 2025 sinusal, las 16 de su
  FA y las 29 de la ASE/EACVI 2016, reusadas de `_probe_diast2025.mjs`, `_probe_diastfa.mjs` y
  `_probe_ase2016.mjs`.
  **Cobertura: TC-462**, **42 condiciones** con cuatro denominadores y nueve controles negativos,
  que recorre las **28 ramas** de las cuatro vías. **Verificado que sabe fallar contra HEAD en un
  worktree aparte: 26 de las 42 en rojo**; las 16 que pasan son los denominadores de las funciones
  dueñas, el badge del cuadro —que esta tanda no mueve—, las tres reglas de CSS que ya existían para
  la BSE y los controles negativos de la BSE 2024 y de la FA de la ASE/EACVI 2016.
- ⚠️ **CASOS ADAPTADOS: UNO, TC-460**, con el motivo escrito en el caso. Su control negativo
  afirmaba que la ASE 2025 y la ASE/EACVI 2016 no dibujan diagrama «ni en sinusal ni en FA», y esta
  tanda se lo da a tres vías más. Queda el único que sigue siendo cierto —la FA de la ASE/EACVI
  2016— y el resto lo fija TC-462.
- ⚠️ **UN TECLEO QUE NO OCURRIÓ NO ES UNA MEDICIÓN, Y MI PROPIA SONDA LO HIZO EN TRES ESCENAS.** El
  aviso legal **vuelve a mitad de corrida**: con `#modalAvisoEco` puesto, `clicEn` cae a su respaldo
  por tecla, un `input` numérico no recibe nada y la escena informa el veredicto de **otro
  paciente** — la primera corrida del grupo `diagrama` dijo «S03 termina en presión normal sin
  grado» sobre un paciente cuyas tres variables son negativas. Hoy la sonda despeja antes de cada
  escena y **aborta** nombrando el campo si un tecleo no quedó.
- ⚠️ **TC-462 MORÍA POR EXCEPCIÓN CONTRA HEAD Y NO POR SUS CONDICIONES.** `dia.enCam` no existe en
  un árbol sin estos diagramas y un `.slice()` mata la corrida entera con un `TypeError`: prueba que
  el árbol es distinto, no que el caso sabe medir. Todas las lecturas del dibujo van con su
  respaldo `|| []`. Es la misma lección que TC-455 ya tiene escrita.
- ⚠️ **Me comí el acento grave UNA vez**, en un comentario mío dentro del template de la sonda, con
  el archivo que documenta la trampa abierto delante. Esta vez lo cazó `node --check` con la línea
  exacta; `scripts/check_backticks.py` corrió limpio antes de cada commit.
- ⚠️ **ESCRIBÍ «23 ramas» EN EL TÍTULO DE TC-462 ANTES DE CONTARLAS, Y SON 28.** Lo cazó el propio
  denominador del caso en su primera corrida, que es para lo que está. **Contar y después escribir**,
  igual que medir y después escribir.

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
