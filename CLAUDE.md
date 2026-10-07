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
| **Tocar el panel de Evidencia: agregar una cita o una sección** | `docs/mapa/panel-evidencia.md` |
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

Los mapas y el registro de fuentes **no se cargan solos** — se abren a demanda, uno a la vez. Cada
uno pesa menos de 20 KB (≈ 5k tokens). Están armados sobre un commit y **no guardan números de
línea** a propósito: la línea cambia en cada edición, el nombre de la función no.

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

- Al **empezar** la tanda 3D E2 (2026-10-04), `main` local y `origin/main` estaban los dos en
  **`27b5d0f`**, sin nada sin pushear. El commit de esta tanda queda local; el push lo corre
  Maicol.
  ⚠️ **Este renglón se escribió mal una vez**: decía «doce commits sin pushear, `origin/main` en
  `2e017a1`», copiado del estado anterior sin mirar. `origin/main` había avanzado. Antes de
  escribirlo, `git rev-parse --short origin/main` y `git log --oneline origin/main..HEAD`.
- **Línea base al 2026-10-06 (tanda de la ET binaria): suite 436/440, Semgrep 127 / 0 ERROR, Excel
  434 columnas.** Los cuatro rojos son los de entrada y NO son regresiones: **TC-223** (el
  documentado, falla por la fecha), **TC-376**, **TC-390** y **TC-406**. ⚠️ **El denominador subió a
  440**: la tanda de la ET binaria agregó **TC-416** (la de la Vmax IT había agregado TC-415). Los
  renglones viejos de este archivo —421/422, 425/429, 426/430— quedaron atrás, así que volver a
  medir antes de leer una tanda de mutaciones sigue siendo obligatorio.
  ⚠️ **Y medirla DE VERDAD, no leer este renglón:** esta tanda abrió con 409/430 y 17 rojos, de los
  que 7 tenían una causa ÚNICA y compartida (el guardián del importador) y ninguno era de la mitral
  aunque sus títulos lo dijeran. Correr los sospechosos con `--solo` **sobre HEAD** fue lo que
  separó «lo rompí yo» de «ya estaba roto»: dieron 17/17 ✓.

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
| Panel de Evidencia · bibliografía por sección | `### Bibliografía POR SECCIÓN — DECISIÓN DE MAICOL, 2026-09-29 (revierte las reglas 1 y 2)` |
| «Verificada» = texto completo | `### Bibliografía de IM primaria y EM nativa — lo verificado y lo que NO (2026-09-30)` |
| Reportar y no corregir contenido clínico | `### ⚠️ TRES COSAS QUE LA FUENTE PRIMARIA DESMIENTE — REPORTADAS, NO CORREGIDAS` |
| `ecosmart` no es bibliografía; banda sin cita | `## Etapa A (tanda 3) — el panel de EM aplica` … `para el AVm por continuidad (2026-10-01)` |
| El informe firmado no lleva citas | `### Sobre agregar una línea al informe: la recomendación es NO` |
| Scripts, suite, umbral por los dos lados, mutación | `## Antes de cada push — dos scripts` · `#### Un suite que no sabe fallar no sirve` |
| Qué no tiene cobertura automática | `#### Qué queda sin cobertura` |
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
