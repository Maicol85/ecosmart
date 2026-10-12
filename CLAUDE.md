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
⚠️ **Y al 2026-10-12 `panel-evidencia.md` está en 35,3 KB, o sea YA pasó ese techo.** La tanda del
glosario respetó la regla sacando su mapa a un archivo propio
(`panel-evidencia-terminos.md`, 15 KB) en vez de agregarle una sección; lo que le entró fueron tres
punteros. **La próxima tanda que lo toque conviene que lo parta.**

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
